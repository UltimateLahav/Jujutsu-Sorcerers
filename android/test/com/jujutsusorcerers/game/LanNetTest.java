package com.jujutsusorcerers.game;

import java.net.InetAddress;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Plays three "phones" against each other on this computer (the room announcements go to the loopback address instead of the Wi-Fi's).
 * Run:  javac -d /tmp/lt android/src/com/jujutsusorcerers/game/LanNet.java android/test/com/jujutsusorcerers/game/LanNetTest.java && java -cp /tmp/lt com.jujutsusorcerers.game.LanNetTest
 */
public class LanNetTest {
    static int checks = 0;

    static void ok(boolean c, String what) { checks++; if (!c) throw new AssertionError(what); }

    /** Polls until the text returned by f contains want (up to 10 s). */
    static String wait(java.util.concurrent.Callable<String> f, String want, String what) throws Exception {
        String s = "";
        for (int i = 0; i < 100; i++) {
            s = f.call();
            if (s.contains(want)) { checks++; return s; }
            Thread.sleep(100);
        }
        throw new AssertionError(what + " (last answer: " + s + ")");
    }

    static final Pattern MSG = Pattern.compile("\\{\"t\":\"msg\",\"d\":\"([^\"]*)\"\\}");

    /** Every message text found in a batch of events. */
    static List<String> msgs(String events) {
        List<String> r = new ArrayList<String>();
        Matcher m = MSG.matcher(events);
        while (m.find()) r.add(m.group(1));
        return r;
    }

    /** Collects the messages that arrive at a phone for up to maxMs, until `count` of them started with the prefix. */
    static List<String> collect(LanNet n, String prefix, int count, long maxMs, List<Long> when) throws Exception {
        List<String> got = new ArrayList<String>();
        long end = System.currentTimeMillis() + maxMs;
        while (got.size() < count && System.currentTimeMillis() < end) {
            for (String s : msgs(n.events())) if (s.startsWith(prefix)) { got.add(s); if (when != null) when.add(System.currentTimeMillis()); }
            Thread.sleep(2);
        }
        return got;
    }

    public static void main(String[] a) throws Exception {
        final LanNet host = new LanNet("PHONE-A", 47999, Collections.singletonList(InetAddress.getLoopbackAddress()));
        final LanNet guest = new LanNet("PHONE-B", 47999, null);
        final LanNet third = new LanNet("PHONE-C", 47999, null);
        final LanNet nowifi = new LanNet("PHONE-D", 47999, Collections.<InetAddress>emptyList());

        ok(nowifi.host("X").equals("NO WI-FI FOUND"), "a phone with no Wi-Fi cannot open a room");
        ok(LanNet.clean("a|b\nc", 18, "ROOM").equals("a b c"), "the | and line breaks are taken out of names");
        ok(LanNet.clean("   ", 18, "ROOM").equals("ROOM"), "an empty name becomes ROOM");
        ok(LanNet.clean("123456789012345678901234", 18, "R").length() == 18, "names are cut at 18 characters");
        LanNet.broadcastAddresses();                                           // (must not throw on this machine)

        ok(host.host("DOJO \"1\"").isEmpty(), "the room opens");
        ok(guest.browse().isEmpty(), "the search starts");
        String rooms = wait(guest::rooms, "DOJO", "the browsing phone sees the room");
        ok(rooms.contains("\"host\":\"PHONE-A\"") && rooms.contains("DOJO \\\"1\\\""), "the room list names the room and its phone (quotes escaped): " + rooms);
        Matcher m = Pattern.compile("\"ip\":\"([^\"]+)\",\"port\":(\\d+)").matcher(rooms);
        ok(m.find(), "the room has an address and a port");
        String ip = m.group(1); int port = Integer.parseInt(m.group(2));
        ok(host.rooms().equals("[]"), "the host does not browse, so it sees no rooms");

        guest.join(ip, port);
        wait(host::events, "\"t\":\"joined\",\"name\":\"PHONE-B\"", "the host is told who joined");
        wait(guest::events, "\"t\":\"connected\",\"room\":\"DOJO \\\"1\\\"\",\"host\":\"PHONE-A\"", "the guest is told it is in");

        ok(host.send("P|1.5"), "the host sends");
        wait(guest::events, "\"t\":\"msg\",\"d\":\"P|1.5\"", "the guest gets the host's message");
        ok(guest.send("R|1.5"), "the guest sends");
        wait(host::events, "\"t\":\"msg\",\"d\":\"R|1.5\"", "the host gets the guest's message");

        wait(() -> String.valueOf(host.ping() >= 0 && guest.ping() >= 0), "true", "both phones measure the ping themselves, without the game's screen");
        ok(host.ping() < 1000 && !host.events().contains("PING") && !guest.events().contains("PONG"), "the ping is small here and never shows up as a game message");

        // ---- v1.115 the fast road
        wait(() -> host.lane() + guest.lane(), "udpudp", "both phones find the UDP road");
        Thread.sleep(600);
        ok(host.ping() >= 0 && host.ping() < 40 && guest.ping() >= 0 && guest.ping() < 40, "the ping on the fast road is tiny on this computer: " + host.ping() + " / " + guest.ping());
        ok(host.loss() == 0 && guest.loss() <= 2, "no packets are lost here: " + host.loss() + " / " + guest.loss());

        host.events(); guest.events();
        for (int i = 0; i < 300; i++) { host.send("N|" + i); if (i % 7 == 0) guest.send("G|" + i); if (i % 10 == 0) Thread.sleep(1); }
        List<String> ha = collect(guest, "N|", 300, 5000, null), ga = collect(host, "G|", 43, 3000, null);
        boolean inOrder = ha.size() == 300;
        for (int i = 0; inOrder && i < 300; i++) inOrder = ha.get(i).equals("N|" + i);
        ok(inOrder, "300 messages arrive once each and in order (got " + ha.size() + ")");
        ok(ga.size() == 43 && ga.get(42).equals("G|294"), "...and the other way too (got " + ga.size() + ")");
        StringBuilder big = new StringBuilder("B|"); while (big.length() < 880) big.append('x');
        ok(host.send(big.toString()), "a long message goes");
        List<String> bg = collect(guest, "B|", 1, 3000, null);
        ok(bg.size() == 1 && bg.get(0).length() == 880, "...and arrives whole");

        for (int i = 0; i < 100; i++) host.sendFast("P|" + i);
        Thread.sleep(300);
        List<String> ps = msgs(guest.events()), pp = new ArrayList<String>();
        for (String s : ps) if (s.startsWith("P|")) pp.add(s);
        ok(pp.size() >= 1 && pp.size() <= 3 && pp.get(pp.size() - 1).equals("P|99"), "fast messages keep only the newest one: " + pp);
        ok(guest.events().equals("[]"), "...and nothing is left over");

        // ---- latency with a bad Wi-Fi: a third of the UDP packets are lost AND the TCP road is stuck behind a lost packet (0.4 s)
        host.testUdpLoss = guest.testUdpLoss = 0.3; host.testTcpDelayMs = guest.testTcpDelayMs = 400;
        Thread.sleep(500);
        host.events(); guest.events();
        List<Long> sent = new ArrayList<Long>(), got = new ArrayList<Long>();
        List<String> lg = new ArrayList<String>();
        for (int i = 0; i < 120; i++) {      // (the guest reads while the host sends, so every arrival is stamped when it happens)
            sent.add(System.currentTimeMillis()); host.send("L|" + i);
            for (int w = 0; w < 25; w++) { for (String s : msgs(guest.events())) if (s.startsWith("L|")) { lg.add(s); got.add(System.currentTimeMillis()); } Thread.sleep(1); }
        }
        lg.addAll(collect(guest, "L|", 120 - lg.size(), 8000, got));
        boolean ordered = lg.size() == 120;
        for (int i = 0; ordered && i < 120; i++) ordered = lg.get(i).equals("L|" + i);
        ok(ordered, "with 30% of the packets lost and the TCP road stuck, all 120 messages still arrive once and in order (got " + lg.size() + ")");
        List<Long> lat = new ArrayList<Long>();
        for (int i = 0; i < got.size(); i++) lat.add(got.get(i) - sent.get(i));
        Collections.sort(lat);
        long med = lat.get(lat.size() / 2), p90 = lat.get(lat.size() * 9 / 10);
        System.out.println("   latency with loss and a stuck TCP: median " + med + " ms, 90% under " + p90 + " ms");
        ok(med < 150 && p90 < 350, "...and the middle message needs under 150 ms, 9 of 10 under 350 ms (TCP alone would need 400+): " + med + " / " + p90);
        for (int i = 0; i < 60; i++) { host.sendFast("P|" + (1000 + i)); Thread.sleep(20); }
        Thread.sleep(200);
        long lastP = -1; boolean mono = true;
        for (String s : msgs(guest.events())) if (s.startsWith("P|")) { long v = Long.parseLong(s.substring(2)); mono &= v > lastP; lastP = v; }
        ok(mono && lastP >= 1055, "pictures with loss: never an older one after a newer one, and the newest gets through (last " + lastP + ")");
        ok(guest.loss() >= 10 && guest.loss() <= 55, "the loss counter notices the lost packets: " + guest.loss() + "%");
        host.testUdpLoss = guest.testUdpLoss = 0; host.testTcpDelayMs = guest.testTcpDelayMs = 0;

        // ---- a router that blocks UDP: everything stays on TCP and still works
        host.testUdpLoss = guest.testUdpLoss = 1.0;
        wait(() -> host.lane() + guest.lane(), "tcptcp", "without UDP the phones fall back to the TCP road");
        host.events(); guest.events();
        for (int i = 0; i < 50; i++) host.send("T|" + i);
        List<String> tg = collect(guest, "T|", 50, 4000, null);
        ok(tg.size() == 50 && tg.get(49).equals("T|49"), "messages still arrive over TCP alone (got " + tg.size() + ")");
        for (int i = 0; i < 30; i++) { host.sendFast("P|" + (2000 + i)); Thread.sleep(10); }
        Thread.sleep(300);
        String lastTcp = ""; for (String s : msgs(guest.events())) if (s.startsWith("P|")) lastTcp = s;
        ok(lastTcp.equals("P|2029"), "pictures still arrive over TCP alone: " + lastTcp);
        for (int i = 0; i < 100; i++) host.sendFast("P|" + (3000 + i));
        Thread.sleep(600);
        String lastBurst = ""; for (String s : msgs(guest.events())) if (s.startsWith("P|")) lastBurst = s;
        ok(lastBurst.equals("P|3099"), "a burst of 100 pictures over TCP alone: the newest one wins, none older arrives after it: " + lastBurst);
        wait(() -> String.valueOf(host.ping() >= 0 && host.ping() < 1000), "true", "the ping falls back to the TCP measurement");
        host.testUdpLoss = guest.testUdpLoss = 0;
        wait(() -> host.lane() + guest.lane(), "udpudp", "the UDP road comes back by itself when the router lets it through");

        third.join(ip, port);
        wait(third::events, "THAT ROOM IS FULL", "a second guest is told the room is full");
        ok(host.send("still here"), "the first guest is not kicked out by the full-room answer");
        wait(guest::events, "still here", "...and still gets messages");

        guest.stop();
        wait(host::events, "\"t\":\"left\"", "the host is told the guest left");
        ok(!host.send("anyone?") && !host.sendFast("P|1"), "nobody to send to after the guest left");
        ok(host.ping() == -1 && host.lane().equals("tcp"), "no ping and no fast road without a guest");
        ok(third.browse().isEmpty(), "another phone starts searching");
        wait(third::rooms, "DOJO", "the room is announced again once it has space");

        third.join(ip, port);
        wait(host::events, "\"t\":\"joined\",\"name\":\"PHONE-C\"", "a new guest can take the free place");
        wait(() -> host.lane() + third.lane(), "udpudp", "the new guest gets a fast road too");
        host.send("fresh|1");
        ok(collect(third, "fresh", 1, 3000, null).size() == 1, "...and the new guest starts counting messages from 1 again");
        host.stop();
        wait(third::events, "\"t\":\"left\"", "the guest is told the room closed");

        guest.join("127.0.0.1", 9);                                            // nobody listens on port 9
        wait(guest::events, "COULD NOT REACH THAT ROOM", "joining a closed room says so");
        guest.join("not an address", 5);
        wait(guest::events, "\"t\":\"error\"", "a nonsense address says so too");

        // a phone that goes silent (Wi-Fi switched off, app frozen) is dropped after 6 seconds; it also has no UDP road (the old app)
        final LanNet seeker = new LanNet("PHONE-E", 47999, null);
        ok(host.host("SILENT").isEmpty(), "the room opens again");
        ok(seeker.browse().isEmpty(), "a new search starts");
        Matcher m2 = Pattern.compile("\"ip\":\"([^\"]+)\",\"port\":(\\d+)").matcher(wait(seeker::rooms, "SILENT", "the new room is found"));
        ok(m2.find(), "the new room has an address");
        java.net.Socket raw = new java.net.Socket(m2.group(1), Integer.parseInt(m2.group(2)));
        java.io.PrintWriter rw = new java.io.PrintWriter(raw.getOutputStream(), true);
        java.io.BufferedReader rr = new java.io.BufferedReader(new java.io.InputStreamReader(raw.getInputStream()));
        rw.println("HELLO|RAW");
        ok(rr.readLine().equals("WELCOME|SILENT|PHONE-A"), "the silent phone is welcomed without a UDP port, as the old app is");
        wait(host::events, "\"t\":\"joined\",\"name\":\"RAW\"", "the host sees it join");
        ok(host.lane().equals("tcp"), "a phone without UDP stays on the TCP road");
        rw.println("MSG|hello from the old app");
        wait(host::events, "hello from the old app", "the old app's messages are still read");
        long t0 = System.currentTimeMillis();
        wait(host::events, "\"t\":\"left\",\"why\":\"timeout\"", "the host drops a phone that has gone silent");
        long dt = System.currentTimeMillis() - t0;
        ok(dt > 3500 && dt < 9000, "...after about 6 seconds (" + dt + " ms)");
        raw.close(); seeker.stop();

        guest.stop(); third.stop(); host.stop();
        System.out.println("LanNetTest OK (" + checks + " checks)");
        System.exit(0);
    }
}
