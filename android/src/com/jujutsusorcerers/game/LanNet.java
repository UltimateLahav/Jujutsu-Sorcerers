package com.jujutsusorcerers.game;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.OutputStreamWriter;
import java.io.PrintWriter;
import java.net.DatagramPacket;
import java.net.DatagramSocket;
import java.net.InetAddress;
import java.net.InetSocketAddress;
import java.net.InterfaceAddress;
import java.net.NetworkInterface;
import java.net.ServerSocket;
import java.net.Socket;
import java.net.SocketException;
import java.net.SocketTimeoutException;
import java.nio.ByteBuffer;
import java.nio.charset.Charset;
import java.security.SecureRandom;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.TreeMap;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentLinkedQueue;
import java.util.concurrent.LinkedBlockingQueue;
import java.util.concurrent.TimeUnit;

/**
 * Rooms between phones on the SAME Wi-Fi, with no server and no internet.
 *
 * A room is announced once a second with a UDP broadcast ("JJS1|room name|tcp port|device") to the broadcast address of every
 * network interface that has one (the Wi-Fi, or a phone's own hotspot). A broadcast never leaves the local network, so only phones
 * on that Wi-Fi can see the room, and the mobile data connection has no broadcast address, so it is never used.
 * Whoever browses listens on the discovery port and keeps the rooms heard in the last 4.5 seconds. Joining opens a TCP link to the
 * room's port: "HELLO|name|udp port" is answered with "WELCOME|room|host|udp port|session" (or "FULL": a room has two players).
 *
 * Then the two phones talk on TWO ROADS AT ONCE (v1.115). TCP is reliable but when one packet is lost on the Wi-Fi it holds back
 * everything behind it for 0.2 s to 1 s, which is what a fight feels like as "700 ms ping". So every message also goes in UDP
 * packets that repeat it until the other phone confirms it, and the receiver keeps whichever copy arrives first, in order. The
 * fast messages (the picture of the fighter, 25 a second) go in UDP only and only the newest is kept (sendFast). The round trip is
 * measured on the UDP packets themselves, and when UDP cannot get through (a router that blocks it) everything simply stays on TCP.
 * Everything the app has to know comes back as JSON events that the game polls (events()).
 */
public class LanNet {
    public static final int PORT = 47821;                                   // the UDP discovery port
    private static final String MAGIC = "JJS1";
    private static final Charset U8 = Charset.forName("UTF-8");
    private static final long ROOM_TTL_MS = 4500;
    private static final int BEAT_MS = 1000, DEAD_MS = 6000;               // each side sends a PING every second; 6 s with nothing heard from the other phone ends the link
    private static final int MAX_TEXT = 900, MAX_PKT = 1400, WINDOW = 64;  // longest message; biggest UDP packet; most messages waiting for a confirmation
    private static final int RESEND_MS = 40, BEAT_UDP_MS = 100, UP_MS = 1500;      // an unconfirmed message is sent again after 40 ms; a quiet link still sends 10 packets a second; the fast road counts as working for 1.5 s after the last answer
    private static final SecureRandom RND = new SecureRandom();

    private static final class Room { String name, ip, host; int port; long seen; }

    private final String device;
    private final int discoPort;
    private final List<InetAddress> fixedTargets;                            // null = the broadcast addresses of this phone (tests aim at loopback)
    private final ConcurrentLinkedQueue<String> events = new ConcurrentLinkedQueue<String>();
    private final Map<Character, String> fastSlots = new ConcurrentHashMap<Character, String>();      // the newest fast message of each kind (P = a picture): older ones are simply thrown away
    private final Map<String, Room> rooms = new ConcurrentHashMap<String, Room>();
    private final Object lock = new Object();

    private volatile boolean hosting, browsing;
    private volatile long gen = 0;                                          // every stop() starts a new generation: the threads of an old one end (changed only inside lock)
    private volatile ServerSocket server;
    private volatile DatagramSocket annSock, browseSock;
    private volatile Link link;                                             // the link to the other phone (null = nobody); only set and cleared inside lock
    volatile double testUdpLoss;                                            // (tests: the share of UDP packets that are thrown away before they leave)
    volatile int testTcpDelayMs;                                            // (tests: every TCP line waits this long, like a link that is stuck behind a lost packet)

    public LanNet(String device, int discoPort, List<InetAddress> targets) {
        this.device = clean(device, 18, "PHONE");
        this.discoPort = discoPort;
        this.fixedTargets = targets;
    }

    public LanNet(String device) { this(device, PORT, null); }

    private static long nowMs() { return System.nanoTime() / 1000000L; }

    // ------------------------------------------------------------------ hosting

    /** Opens a room and announces it. Returns "" or what went wrong (shown to the player). */
    public String host(String name) {
        stop();
        if (targets().isEmpty()) return "NO WI-FI FOUND";
        final String room = clean(name, 18, "ROOM");
        final ServerSocket srv;
        final DatagramSocket ann;
        try {
            srv = new ServerSocket(0);
            ann = new DatagramSocket();
            ann.setBroadcast(true);
        } catch (IOException e) {
            return "COULD NOT OPEN A ROOM";
        }
        final long g = gen;
        server = srv; annSock = ann; hosting = true;
        final int tcp = srv.getLocalPort();
        Thread accept = new Thread(new Runnable() { public void run() { acceptLoop(srv, room, g); } }, "jjs-accept");
        Thread announce = new Thread(new Runnable() { public void run() { announceLoop(ann, room, tcp, g); } }, "jjs-announce");
        accept.setDaemon(true); announce.setDaemon(true);
        accept.start(); announce.start();
        return "";
    }

    private void announceLoop(DatagramSocket ann, String room, int tcp, long g) {
        byte[] b = (MAGIC + "|" + room + "|" + tcp + "|" + device).getBytes(U8);
        while (gen == g && hosting) {
            if (link == null) {
                for (InetAddress a : targets()) {
                    try { ann.send(new DatagramPacket(b, b.length, a, discoPort)); } catch (IOException ignored) { }
                }
            }
            try { Thread.sleep(1000); } catch (InterruptedException e) { return; }
        }
    }

    private void acceptLoop(ServerSocket srv, String room, long g) {
        while (gen == g && hosting) {
            Socket c;
            try { c = srv.accept(); } catch (IOException e) { return; }
            DatagramSocket u = null;
            try {
                c.setSoTimeout(4000); tune(c);
                BufferedReader in = new BufferedReader(new InputStreamReader(c.getInputStream(), U8));
                PrintWriter w = new PrintWriter(new OutputStreamWriter(c.getOutputStream(), U8), true);
                String hello = in.readLine();
                if (hello == null || !hello.startsWith("HELLO|")) { close(c); continue; }
                String[] hf = hello.split("\\|", 3);
                int gPort = hf.length > 2 ? port(hf[2]) : 0;                  // (a phone with the old app sends no UDP port: it stays on TCP)
                if (gPort > 0) u = openUdp();
                int sid = RND.nextInt();
                Link l = new Link(c, in, w, u, c.getInetAddress(), gPort, sid, g);
                boolean stale, taken;
                synchronized (lock) {
                    stale = gen != g;                                       // (stop() came while this phone was saying hello)
                    taken = link != null;
                    if (!stale && !taken) link = l;
                }
                if (stale) { close(c); close(u); return; }
                if (taken) { w.println("FULL"); close(c); close(u); continue; }
                w.println("WELCOME|" + room + "|" + device + (u != null ? "|" + u.getLocalPort() + "|" + sid : ""));
                c.setSoTimeout(DEAD_MS);
                push("joined", "name", clean(hf.length > 1 ? hf[1] : "", 18, "PLAYER"));
                l.start();
            } catch (IOException e) {
                close(c); close(u);
            }
        }
    }

    // ------------------------------------------------------------------ browsing

    /** Starts listening for rooms. Returns "" or what went wrong. */
    public String browse() {
        if (browsing) return "";
        final DatagramSocket s;
        try {
            s = new DatagramSocket(null);
            s.setReuseAddress(true);
            s.bind(new InetSocketAddress(discoPort));
            s.setSoTimeout(500);
        } catch (IOException e) {
            return "COULD NOT SEARCH THIS WI-FI";
        }
        final long g = gen;
        browseSock = s; browsing = true;
        Thread t = new Thread(new Runnable() { public void run() { browseLoop(s, g); } }, "jjs-browse");
        t.setDaemon(true); t.start();
        return "";
    }

    private void browseLoop(DatagramSocket s, long g) {
        byte[] buf = new byte[512];
        while (gen == g && browsing) {
            DatagramPacket p = new DatagramPacket(buf, buf.length);
            try { s.receive(p); } catch (SocketTimeoutException e) { continue; } catch (IOException e) { return; }
            String[] f = new String(p.getData(), 0, p.getLength(), U8).split("\\|", 4);
            if (f.length < 4 || !MAGIC.equals(f[0])) continue;
            int port;
            try { port = Integer.parseInt(f[2].trim()); } catch (NumberFormatException e) { continue; }
            if (port < 1 || port > 65535) continue;
            ServerSocket own = server;
            if (hosting && own != null && own.getLocalPort() == port) continue;       // (our own room)
            Room r = new Room();
            r.name = clean(f[1], 18, "ROOM"); r.host = clean(f[3], 18, "PHONE"); r.ip = p.getAddress().getHostAddress(); r.port = port; r.seen = System.nanoTime() / 1000000;
            String key = r.ip + ":" + r.port;
            if (rooms.size() >= 30 && !rooms.containsKey(key)) continue;             // (a flood of fake rooms cannot fill the list)
            rooms.put(key, r);
        }
    }

    /** The rooms heard in the last 4.5 seconds as a JSON array: [{"name":..,"ip":..,"port":..,"host":..}]. */
    public String rooms() {
        long now = System.nanoTime() / 1000000;
        StringBuilder b = new StringBuilder("[");
        for (Map.Entry<String, Room> e : rooms.entrySet()) {
            Room r = e.getValue();
            if (now - r.seen > ROOM_TTL_MS) { rooms.remove(e.getKey()); continue; }
            if (b.length() > 1) b.append(',');
            b.append("{\"name\":\"").append(esc(r.name)).append("\",\"ip\":\"").append(esc(r.ip)).append("\",\"port\":").append(r.port).append(",\"host\":\"").append(esc(r.host)).append("\"}");
        }
        return b.append(']').toString();
    }

    // ------------------------------------------------------------------ joining and talking

    /** Joins a room (the answer comes as a "connected" or "error" event). */
    public void join(final String ip, final int port) {
        stop();
        final long g = gen;
        Thread t = new Thread(new Runnable() {
            public void run() {
                Socket c = new Socket();
                DatagramSocket u = null;
                try {
                    c.connect(new InetSocketAddress(ip, port), 4000);
                    c.setSoTimeout(4000); tune(c);
                    u = openUdp();                                          // (opened before saying hello, so nothing the host sends right after the welcome is lost)
                    BufferedReader in = new BufferedReader(new InputStreamReader(c.getInputStream(), U8));
                    PrintWriter w = new PrintWriter(new OutputStreamWriter(c.getOutputStream(), U8), true);
                    w.println("HELLO|" + device + (u != null ? "|" + u.getLocalPort() : ""));
                    String r = in.readLine();
                    boolean ok = r != null && r.startsWith("WELCOME|");
                    String[] f = ok ? r.split("\\|", 5) : null;
                    int hPort = ok && f.length > 4 ? port(f[3]) : 0, sid = 0;
                    if (hPort > 0) { try { sid = Integer.parseInt(f[4].trim()); } catch (NumberFormatException e) { hPort = 0; } }
                    if (hPort <= 0 && u != null) { close(u); u = null; }    // (an old host has no fast road)
                    Link l = ok ? new Link(c, in, w, u, c.getInetAddress(), hPort, sid, g) : null;
                    boolean stale;
                    synchronized (lock) {
                        stale = gen != g;
                        if (ok && !stale) link = l;
                    }
                    if (stale) { close(c); close(u); return; }
                    if (ok) {
                        c.setSoTimeout(DEAD_MS);
                        push("connected", "room", f.length > 1 ? clean(f[1], 18, "ROOM") : "ROOM", "host", f.length > 2 ? clean(f[2], 18, "PHONE") : "PHONE");
                        l.start();
                    } else {
                        close(c); close(u);
                        push("error", "msg", "FULL".equals(r) ? "THAT ROOM IS FULL" : "COULD NOT JOIN THAT ROOM");
                    }
                } catch (IOException | RuntimeException e) {                // (RuntimeException: a bad address or port)
                    close(c); close(u);
                    if (gen == g) push("error", "msg", "COULD NOT REACH THAT ROOM (IS IT STILL OPEN?)");
                }
            }
        }, "jjs-join");
        t.setDaemon(true); t.start();
    }

    /** One connection to the other phone: the TCP road, the UDP road and everything that is waiting on them. */
    private final class Link {
        final Socket tcp; final BufferedReader in; final PrintWriter out; final DatagramSocket udp; final InetAddress peerIp; final int peerPort, sid; final long g;
        final LinkedBlockingQueue<String> tcpOut = new LinkedBlockingQueue<String>();
        volatile String tcpFast;                                           // the newest fast message waiting for the TCP road (an older one is never worth sending)
        volatile boolean alive = true;
        volatile long tcpPing = -1, lastEcho = nowMs() - 100000;           // lastEcho: when the other phone last answered a packet of ours on the UDP road

        // sending (under tx)
        final Object tx = new Object();
        int relSeq = 0, pktSeq = 0, fastSeq = 0;
        String fastText = null;
        long lastTx = 0;
        final ArrayList<Object[]> unacked = new ArrayList<Object[]>();     // { seq, bytes }: sent but not confirmed yet

        // receiving (under rx)
        final Object rx = new Object();
        int expect = 1, lastFast = 0, peerTs = 0, lastPkt = 0, got = 0, want = 0;
        long peerTsAt = 0;
        final TreeMap<Integer, String> hold = new TreeMap<Integer, String>();
        final int[] rttV = new int[24]; final long[] rttT = new long[24]; int rttI = 0;

        Link(Socket tcp, BufferedReader in, PrintWriter out, DatagramSocket udp, InetAddress peerIp, int peerPort, int sid, long g) {
            this.tcp = tcp; this.in = in; this.out = out; this.udp = udp; this.peerIp = peerIp; this.peerPort = peerPort; this.sid = sid; this.g = g;
        }

        boolean live() { return alive && gen == g; }

        void start() {
            spawn("jjs-read", new Runnable() { public void run() { readTcp(); } });
            spawn("jjs-write", new Runnable() { public void run() { writeTcp(); } });
            spawn("jjs-ping", new Runnable() { public void run() { pingTcp(); } });
            if (udp != null) {
                spawn("jjs-udp-rx", new Runnable() { public void run() { readUdp(); } });
                spawn("jjs-udp-tx", new Runnable() { public void run() { beatUdp(); } });
            }
        }

        void spawn(String name, Runnable r) { Thread t = new Thread(r, name); t.setDaemon(true); t.start(); }

        void shut() {
            alive = false;
            close(tcp); close(udp);
            tcpOut.offer("");                                              // (wakes the writer so it can end)
        }

        // ---------------------------------------------------------------- the TCP road
        void readTcp() {
            String why = "closed";
            try {
                String line;
                while ((line = in.readLine()) != null) {
                    if (line.startsWith("M|")) {                           // M|seq|text: a message that must arrive, in order
                        int bar = line.indexOf('|', 2);
                        if (bar > 2) { try { accept(Integer.parseInt(line.substring(2, bar)), line.substring(bar + 1)); } catch (NumberFormatException ignored) { } }
                    } else if (line.startsWith("F|")) fast(line.substring(2));      // F|text: a fast message that had to take the TCP road
                    else if (line.startsWith("MSG|")) push("msg", "d", line.substring(4));       // (the old app's messages)
                    else if (line.startsWith("PING|")) tcpOut.offer("PONG|" + line.substring(5));          // answered right here, so the ping is the network's own time and never waits for the game's screen
                    else if (line.startsWith("PONG|")) {
                        try { tcpPing = Math.max(0, (System.nanoTime() - Long.parseLong(line.substring(5).trim())) / 1000000); } catch (NumberFormatException ignored) { }
                    }
                }
            } catch (SocketTimeoutException e) { why = "timeout"; } catch (IOException ignored) { }
            boolean mine;
            synchronized (lock) {
                mine = link == this;
                if (mine) link = null;
            }
            shut();
            if (mine && gen == g) { push("left", "why", why); }
        }

        void writeTcp() {
            while (live()) {
                String s;
                try { s = tcpOut.poll(500, TimeUnit.MILLISECONDS); } catch (InterruptedException e) { return; }
                String f = tcpFast; tcpFast = null;                        // (the newest fast message goes first; the ones before it were replaced and are gone)
                if (f != null && !write("F|" + f)) return;
                if (s != null && !s.isEmpty() && !write(s)) return;
            }
        }

        boolean write(String line) {
            int d = testTcpDelayMs;
            if (d > 0) { try { Thread.sleep(d); } catch (InterruptedException e) { return false; } }
            out.println(line);
            if (out.checkError()) { shut(); return false; }                // (the reader then ends and tells the game the other phone is gone)
            return true;
        }

        void pingTcp() {
            while (live()) {
                tcpOut.offer("PING|" + System.nanoTime());
                try { Thread.sleep(BEAT_MS); } catch (InterruptedException e) { return; }
            }
        }

        // ---------------------------------------------------------------- the UDP road
        boolean fastUp() { return udp != null && nowMs() - lastEcho < UP_MS; }

        void sendRel(String text) {
            int seq; byte[] b = text.getBytes(U8);
            synchronized (tx) {
                seq = ++relSeq;
                unacked.add(new Object[]{seq, b});
                while (unacked.size() > WINDOW) unacked.remove(0);         // (the TCP copy has them anyway)
            }
            tcpOut.offer("M|" + seq + "|" + text);
            packet();
        }

        void sendFast(String text) {
            if (fastUp()) {
                synchronized (tx) { fastText = text; fastSeq++; }
                packet();
            } else {
                tcpFast = text; tcpOut.offer("");                         // (UDP is not working (yet): the TCP road, but only the newest picture waits for it, never a long line of old ones)
                packet();
            }
        }

        /** Sends one UDP packet with everything that is not confirmed yet and the newest fast message. */
        void packet() {
            if (udp == null || !live()) return;
            long now = nowMs();
            synchronized (tx) {
                ByteBuffer b = ByteBuffer.allocate(MAX_PKT);
                int echo, dwell, ack;
                synchronized (rx) { echo = peerTs; dwell = echo == 0 ? 0 : (int) Math.max(0, Math.min(5000, now - peerTsAt)); ack = expect - 1; }
                b.put((byte) 'J').put((byte) 1).putInt(sid).putInt(++pktSeq).putInt(ts(now)).putInt(echo).putInt(dwell).putInt(ack);
                byte[] ft = fastText == null ? null : fastText.getBytes(U8);
                if (ft != null && ft.length > MAX_PKT - 200) { ft = null; fastText = null; }                  // (too long for a packet: never happens with the game's messages)
                int budget = MAX_PKT - b.position() - 2 - 6 - (ft == null ? 0 : ft.length), n = 0, countAt = b.position();
                b.putShort((short) 0);
                for (Object[] r : unacked) {
                    byte[] t = (byte[]) r[1];
                    if (6 + t.length > budget) break;                      // (a long message only goes on the TCP road)
                    b.putInt((Integer) r[0]).putShort((short) t.length).put(t); budget -= 6 + t.length; n++;
                }
                b.putShort(countAt, (short) n);
                if (ft != null) { b.putInt(fastSeq).putShort((short) ft.length).put(ft); fastText = null; }
                else b.putInt(0).putShort((short) 0);
                lastTx = now;
                if (Math.random() < testUdpLoss) return;
                try { udp.send(new DatagramPacket(b.array(), 0, b.position(), peerIp, peerPort)); } catch (IOException ignored) { }
            }
        }

        void beatUdp() {
            while (live()) {
                try { Thread.sleep(20); } catch (InterruptedException e) { return; }
                long now = nowMs(); boolean need;
                synchronized (tx) { need = now - lastTx >= (unacked.isEmpty() ? BEAT_UDP_MS : fastUp() ? RESEND_MS : 200); }
                if (need) packet();
            }
        }

        void readUdp() {
            byte[] buf = new byte[2048];
            while (live()) {
                DatagramPacket p = new DatagramPacket(buf, buf.length);
                try { udp.receive(p); } catch (IOException e) { return; }
                try { parse(ByteBuffer.wrap(buf, 0, p.getLength())); } catch (RuntimeException ignored) { }       // (a broken packet is just thrown away)
            }
        }

        void parse(ByteBuffer b) {
            if (b.get() != 'J' || b.get() != 1 || b.getInt() != sid) return;
            int pkt = b.getInt(), ts = b.getInt(), echo = b.getInt(), dwell = b.getInt(), ack = b.getInt(), n = b.getShort() & 0xffff;
            long now = nowMs();
            synchronized (tx) {                                            // what the other phone has got no longer needs repeating
                for (Iterator<Object[]> it = unacked.iterator(); it.hasNext(); ) if ((Integer) it.next()[0] <= ack) it.remove();
            }
            synchronized (rx) {
                if (pkt - lastPkt > 0) { want += pkt - lastPkt; got++; lastPkt = pkt; if (want > 400) { want /= 2; got /= 2; } }      // (the packet numbers show how many of them were lost)
                peerTs = ts; peerTsAt = now;
                if (echo != 0) {
                    int rtt = (int) now - echo - dwell;
                    if (rtt >= 0 && rtt < 5000) { rttV[rttI % rttV.length] = rtt; rttT[rttI % rttV.length] = now; rttI++; lastEcho = now; }
                }
            }
            for (int i = 0; i < n; i++) {
                int seq = b.getInt(), len = b.getShort() & 0xffff;
                if (len > MAX_TEXT * 4 || len > b.remaining()) return;
                byte[] t = new byte[len]; b.get(t);
                accept(seq, new String(t, U8));
            }
            int fseq = b.getInt(), flen = b.getShort() & 0xffff;
            if (fseq != 0 && flen > 0 && flen <= b.remaining()) {
                byte[] t = new byte[flen]; b.get(t);
                boolean newer;
                synchronized (rx) { newer = fseq - lastFast > 0; if (newer) lastFast = fseq; }
                if (newer) fast(new String(t, U8));
            }
        }

        /** A message that must arrive arrived (by either road): the first copy is kept and they are handed over in order. */
        void accept(int seq, String text) {
            synchronized (rx) {
                if (seq - expect < 0) return;                              // a copy of something already handed over
                if (seq == expect) { push("msg", "d", text); expect++; }
                else { hold.put(seq, text); if (hold.size() > 512) expect = hold.firstKey(); }      // (out of order: wait for the missing ones; far too many missing: give up on them)
                while (!hold.isEmpty()) {
                    int k = hold.firstKey();
                    if (k - expect < 0) { hold.pollFirstEntry(); continue; }
                    if (k != expect) break;
                    push("msg", "d", hold.pollFirstEntry().getValue()); expect++;
                }
            }
        }

        void fast(String text) { if (!text.isEmpty() && (fastSlots.size() < 32 || fastSlots.containsKey(text.charAt(0)))) fastSlots.put(text.charAt(0), text); }      // (one slot for each kind of fast message; a flood of made-up kinds cannot fill the memory)

        int ping() {
            long now = nowMs();
            if (udp != null && now - lastEcho < UP_MS) {
                int[] v = new int[rttV.length]; int c = 0;
                synchronized (rx) { for (int i = 0; i < rttV.length; i++) if (rttT[i] != 0 && now - rttT[i] < 2000) v[c++] = rttV[i]; }
                if (c > 0) { Arrays.sort(v, 0, c); return v[c / 2]; }
            }
            return (int) tcpPing;
        }

        int loss() { synchronized (rx) { return want < 20 ? 0 : Math.max(0, Math.min(100, (int) Math.round(100.0 * (want - got) / want))); } }
    }

    private static int ts(long now) { int t = (int) now; return t == 0 ? 1 : t; }

    private static int port(String s) { try { int p = Integer.parseInt(s.trim()); return p > 0 && p < 65536 ? p : 0; } catch (NumberFormatException e) { return 0; } }

    private static DatagramSocket openUdp() {
        try {
            DatagramSocket u = new DatagramSocket(0);
            try { u.setTrafficClass(0xB8); } catch (SocketException ignored) { }       // (the "voice" class of the Wi-Fi: a router that understands it sends these small packets first)
            try { u.setReceiveBufferSize(1 << 16); } catch (SocketException ignored) { }
            return u;
        } catch (SocketException e) {
            return null;
        }
    }

    private static void tune(Socket c) {
        try { c.setTcpNoDelay(true); } catch (SocketException ignored) { }          // (no waiting to batch small messages: the fight sends 25 a second)
        try { c.setTrafficClass(0xB8); } catch (SocketException ignored) { }
    }

    /** Sends one line of text to the other phone: it must arrive, and arrives in order (both roads at once). */
    public boolean send(String text) {
        Link l = link;
        if (l == null) return false;
        l.sendRel(oneLine(text));
        return true;
    }

    /** Sends a fast message (the picture of the fighter): only the newest of its kind (its first letter) is kept, and one may be lost on the way. */
    public boolean sendFast(String text) {
        Link l = link;
        if (l == null) return false;
        l.sendFast(oneLine(text));
        return true;
    }

    private static String oneLine(String s) {
        s = s.replace('\n', ' ').replace('\r', ' ');
        return s.length() > MAX_TEXT ? s.substring(0, MAX_TEXT) : s;
    }

    /** The round trip to the other phone in milliseconds (a packet there and back, the middle of the last two seconds), or -1 before the first answer. */
    public int ping() { Link l = link; return l == null ? -1 : l.ping(); }

    /** The share of the other phone's UDP packets that never arrived, in percent. */
    public int loss() { Link l = link; return l == null ? 0 : l.loss(); }

    /** "udp" when the fast road works, otherwise "tcp". */
    public String lane() { Link l = link; return l != null && l.fastUp() ? "udp" : "tcp"; }

    /** What happened since the last call, as a JSON array of {"t":"joined|connected|left|error|msg", ...}. */
    public String events() {
        StringBuilder b = new StringBuilder("[");
        String e;
        while ((e = events.poll()) != null) { if (b.length() > 1) b.append(','); b.append(e); }
        for (Character k : new ArrayList<Character>(fastSlots.keySet())) {
            String s = fastSlots.remove(k);
            if (s != null) { if (b.length() > 1) b.append(','); b.append("{\"t\":\"msg\",\"d\":\"").append(esc(s)).append("\"}"); }
        }
        return b.append(']').toString();
    }

    /** Closes the room, the search and the link. */
    public void stop() {
        Link l;
        synchronized (lock) { gen++; l = link; link = null; }
        hosting = false; browsing = false;
        close(server); close(annSock); close(browseSock);
        server = null; annSock = null; browseSock = null;
        if (l != null) l.shut();
        rooms.clear(); events.clear(); fastSlots.clear();
    }

    // ------------------------------------------------------------------ helpers

    private List<InetAddress> targets() { return fixedTargets != null ? fixedTargets : broadcastAddresses(); }

    /** The broadcast address of every network that has one: the Wi-Fi (or a hotspot), never the mobile data. */
    static List<InetAddress> broadcastAddresses() {
        List<InetAddress> res = new ArrayList<InetAddress>();
        try {
            java.util.Enumeration<NetworkInterface> all = NetworkInterface.getNetworkInterfaces();
            if (all == null) return res;
            for (NetworkInterface ni : Collections.list(all)) {
                if (!ni.isUp() || ni.isLoopback() || ni.isPointToPoint()) continue;      // (mobile data and VPNs are point-to-point links)
                for (InterfaceAddress ia : ni.getInterfaceAddresses()) {
                    InetAddress b = ia.getBroadcast();
                    if (b != null && !res.contains(b)) res.add(b);
                }
            }
        } catch (SocketException ignored) { }
        return res;
    }

    private void push(String type, String... kv) {
        StringBuilder b = new StringBuilder("{\"t\":\"").append(type).append('"');
        for (int i = 0; i + 1 < kv.length; i += 2) b.append(",\"").append(kv[i]).append("\":\"").append(esc(kv[i + 1])).append('"');
        events.add(b.append('}').toString());
    }

    static String clean(String s, int max, String fallback) {
        if (s == null) s = "";
        StringBuilder b = new StringBuilder();
        for (int i = 0; i < s.length() && b.length() < max; i++) {
            char c = s.charAt(i);
            b.append(c < 0x20 || c == '|' ? ' ' : c);
        }
        String r = b.toString().trim();
        return r.isEmpty() ? fallback : r;
    }

    static String esc(String s) {
        StringBuilder b = new StringBuilder();
        for (int i = 0; i < s.length(); i++) {
            char c = s.charAt(i);
            if (c == '"') b.append("\\\""); else if (c == '\\') b.append("\\\\"); else if (c < 0x20) b.append(' '); else b.append(c);
        }
        return b.toString();
    }

    private static void close(Object o) {
        try {
            if (o instanceof Socket) ((Socket) o).close();
            else if (o instanceof ServerSocket) ((ServerSocket) o).close();
            else if (o instanceof DatagramSocket) ((DatagramSocket) o).close();
        } catch (IOException ignored) { }
    }
}
