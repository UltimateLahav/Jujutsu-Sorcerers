package com.jujutsusorcerers.game;

import java.net.InetAddress;
import java.util.Collections;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Plays three "phones" against each other on this computer (the room announcements go to the loopback address instead of the Wi-Fi's).
 * Run:  javac -d /tmp/lt android/src/com/jujutsusorcerers/game/LanNet.java android/test/com/jujutsusorcerers/game/LanNetTest.java && java -cp /tmp/lt com.jujutsusorcerers.game.LanNetTest
 */
public class LanNetTest {
    static int checks = 0;

    static void ok(boolean c, String what) { checks++; if (!c) throw new AssertionError(what); }

    /** Polls until the text returned by f contains want (up to 6 s). */
    static String wait(java.util.concurrent.Callable<String> f, String want, String what) throws Exception {
        String s = "";
        for (int i = 0; i < 60; i++) {
            s = f.call();
            if (s.contains(want)) { checks++; return s; }
            Thread.sleep(100);
        }
        throw new AssertionError(what + " (last answer: " + s + ")");
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

        third.join(ip, port);
        wait(third::events, "THAT ROOM IS FULL", "a second guest is told the room is full");
        ok(host.send("still here"), "the first guest is not kicked out by the full-room answer");
        wait(guest::events, "still here", "...and still gets messages");

        guest.stop();
        wait(host::events, "\"t\":\"left\"", "the host is told the guest left");
        ok(!host.send("anyone?"), "nobody to send to after the guest left");
        ok(third.browse().isEmpty(), "another phone starts searching");
        wait(third::rooms, "DOJO", "the room is announced again once it has space");

        third.join(ip, port);
        wait(host::events, "\"t\":\"joined\",\"name\":\"PHONE-C\"", "a new guest can take the free place");
        host.stop();
        wait(third::events, "\"t\":\"left\"", "the guest is told the room closed");

        guest.join("127.0.0.1", 9);                                            // nobody listens on port 9
        wait(guest::events, "COULD NOT REACH THAT ROOM", "joining a closed room says so");
        guest.join("not an address", 5);
        wait(guest::events, "\"t\":\"error\"", "a nonsense address says so too");

        guest.stop(); third.stop(); host.stop();
        System.out.println("LanNetTest OK (" + checks + " checks)");
        System.exit(0);
    }
}
