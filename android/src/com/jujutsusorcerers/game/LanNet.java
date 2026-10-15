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
import java.nio.charset.Charset;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentLinkedQueue;

/**
 * Rooms between phones on the SAME Wi-Fi, with no server and no internet.
 *
 * A room is announced once a second with a UDP broadcast ("JJS1|room name|tcp port|device") to the broadcast address of every
 * network interface that has one (the Wi-Fi, or a phone's own hotspot). A broadcast never leaves the local network, so only phones
 * on that Wi-Fi can see the room, and the mobile data connection has no broadcast address, so it is never used.
 * Whoever browses listens on the discovery port and keeps the rooms heard in the last 4.5 seconds. Joining opens a TCP link to the
 * room's port: "HELLO|name" is answered with "WELCOME|room|host" (or "FULL": a room has two players), then both sides send
 * "MSG|text" lines. Everything the app has to know comes back as JSON events that the game polls (events()).
 */
public class LanNet {
    public static final int PORT = 47821;                                   // the UDP discovery port
    private static final String MAGIC = "JJS1";
    private static final Charset U8 = Charset.forName("UTF-8");
    private static final long ROOM_TTL_MS = 4500;
    private static final int BEAT_MS = 1000, DEAD_MS = 6000;               // each side sends a PING every second; 6 s with nothing heard from the other phone ends the link

    private static final class Room { String name, ip, host; int port; long seen; }

    private final String device;
    private final int discoPort;
    private final List<InetAddress> fixedTargets;                            // null = the broadcast addresses of this phone (tests aim at loopback)
    private final ConcurrentLinkedQueue<String> events = new ConcurrentLinkedQueue<String>();
    private final Map<String, Room> rooms = new ConcurrentHashMap<String, Room>();
    private final Object lock = new Object();

    private volatile boolean hosting, browsing;
    private volatile long gen = 0;                                          // every stop() starts a new generation: the threads of an old one end (changed only inside lock)
    private volatile ServerSocket server;
    private volatile DatagramSocket annSock, browseSock;
    private Socket sock;                                                    // the link to the other phone (null = nobody); sock and out are only touched inside lock
    private PrintWriter out;
    private volatile long pingMs = -1;                                      // the last measured round trip in milliseconds (-1 = none yet)

    public LanNet(String device, int discoPort, List<InetAddress> targets) {
        this.device = clean(device, 18, "PHONE");
        this.discoPort = discoPort;
        this.fixedTargets = targets;
    }

    public LanNet(String device) { this(device, PORT, null); }

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
            boolean full;
            synchronized (lock) { full = sock != null; }
            if (!full) {
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
            try {
                c.setSoTimeout(4000); c.setTcpNoDelay(true);                  // (no waiting to batch small messages: the fight sends 25 a second)
                BufferedReader in = new BufferedReader(new InputStreamReader(c.getInputStream(), U8));
                PrintWriter w = new PrintWriter(new OutputStreamWriter(c.getOutputStream(), U8), true);
                String hello = in.readLine();
                if (hello == null || !hello.startsWith("HELLO|")) { close(c); continue; }
                boolean stale, taken;
                synchronized (lock) {
                    stale = gen != g;                                       // (stop() came while this phone was saying hello)
                    taken = sock != null;
                    if (!stale && !taken) { sock = c; out = w; }
                }
                if (stale) { close(c); return; }
                if (taken) { w.println("FULL"); close(c); continue; }
                w.println("WELCOME|" + room + "|" + device);
                c.setSoTimeout(DEAD_MS);
                push("joined", "name", clean(hello.substring(6), 18, "PLAYER"));
                startReader(c, in, g);
            } catch (IOException e) {
                close(c);
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
                try {
                    c.connect(new InetSocketAddress(ip, port), 4000);
                    c.setSoTimeout(4000); c.setTcpNoDelay(true);
                    BufferedReader in = new BufferedReader(new InputStreamReader(c.getInputStream(), U8));
                    PrintWriter w = new PrintWriter(new OutputStreamWriter(c.getOutputStream(), U8), true);
                    w.println("HELLO|" + device);
                    String r = in.readLine();
                    boolean stale = false, ok = r != null && r.startsWith("WELCOME|");
                    synchronized (lock) {
                        stale = gen != g;
                        if (ok && !stale) { sock = c; out = w; }
                    }
                    if (stale) { close(c); return; }
                    if (ok) {
                        String[] f = r.split("\\|", 3);
                        c.setSoTimeout(DEAD_MS);
                        push("connected", "room", f.length > 1 ? clean(f[1], 18, "ROOM") : "ROOM", "host", f.length > 2 ? clean(f[2], 18, "PHONE") : "PHONE");
                        startReader(c, in, g);
                    } else {
                        close(c);
                        push("error", "msg", "FULL".equals(r) ? "THAT ROOM IS FULL" : "COULD NOT JOIN THAT ROOM");
                    }
                } catch (IOException | RuntimeException e) {                // (RuntimeException: a bad address or port)
                    close(c);
                    if (gen == g) push("error", "msg", "COULD NOT REACH THAT ROOM (IS IT STILL OPEN?)");
                }
            }
        }, "jjs-join");
        t.setDaemon(true); t.start();
    }

    private void startReader(final Socket c, final BufferedReader in, final long g) {
        pingMs = -1;
        Thread t = new Thread(new Runnable() {
            public void run() {
                String why = "closed";
                try {
                    String line;
                    while ((line = in.readLine()) != null) {
                        if (line.startsWith("MSG|")) push("msg", "d", line.substring(4));
                        else if (line.startsWith("PING|")) rawSend("PONG|" + line.substring(5));          // answered right here, so the ping is the network's own time and never waits for the game's screen
                        else if (line.startsWith("PONG|")) {
                            try { pingMs = Math.max(0, (System.nanoTime() - Long.parseLong(line.substring(5).trim())) / 1000000); } catch (NumberFormatException ignored) { }
                        }
                    }
                } catch (SocketTimeoutException e) { why = "timeout"; } catch (IOException ignored) { }
                boolean mine;
                synchronized (lock) {
                    mine = sock == c;
                    if (mine) { sock = null; out = null; }
                }
                close(c);
                if (mine && gen == g) { pingMs = -1; push("left", "why", why); }
            }
        }, "jjs-read");
        Thread p = new Thread(new Runnable() {
            public void run() {
                while (gen == g) {
                    synchronized (lock) { if (sock != c) return; }
                    rawSend("PING|" + System.nanoTime());
                    try { Thread.sleep(BEAT_MS); } catch (InterruptedException e) { return; }
                }
            }
        }, "jjs-ping");
        t.setDaemon(true); p.setDaemon(true); t.start(); p.start();
    }

    private boolean rawSend(String line) {
        synchronized (lock) {
            if (out == null) return false;
            out.println(line);
            return !out.checkError();
        }
    }

    /** Sends one line of text to the other phone. */
    public boolean send(String text) { return rawSend("MSG|" + text.replace('\n', ' ').replace('\r', ' ')); }

    /** The round trip to the other phone in milliseconds (a message there and back), or -1 before the first answer. */
    public int ping() { return (int) pingMs; }

    /** What happened since the last call, as a JSON array of {"t":"joined|connected|left|error|msg", ...}. */
    public String events() {
        StringBuilder b = new StringBuilder("[");
        String e;
        while ((e = events.poll()) != null) { if (b.length() > 1) b.append(','); b.append(e); }
        return b.append(']').toString();
    }

    /** Closes the room, the search and the link. */
    public void stop() {
        Socket s;
        synchronized (lock) { gen++; s = sock; sock = null; out = null; }
        hosting = false; browsing = false;
        close(server); close(annSock); close(browseSock);
        server = null; annSock = null; browseSock = null;
        close(s);
        rooms.clear(); events.clear();
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
