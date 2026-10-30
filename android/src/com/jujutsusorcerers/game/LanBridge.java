package com.jujutsusorcerers.game;

import android.content.Context;
import android.net.wifi.WifiManager;
import android.os.Build;
import android.webkit.JavascriptInterface;

/** The game's window onto LanNet: window.AndroidLan in the page (rooms on the same Wi-Fi, see LanNet). */
public class LanBridge {
    private final LanNet net;
    private final WifiManager wifi;
    private WifiManager.MulticastLock lock;
    private WifiManager.WifiLock fast;

    public LanBridge(Context c) {
        net = new LanNet(Build.MODEL == null ? "PHONE" : Build.MODEL);
        wifi = (WifiManager) c.getApplicationContext().getSystemService(Context.WIFI_SERVICE);
    }

    private synchronized void grab() {
        try {                                   // some phones drop broadcast packets unless an app holds this lock
            if (wifi != null && lock == null) { lock = wifi.createMulticastLock("jjs-lan"); lock.setReferenceCounted(false); }
            if (lock != null && !lock.isHeld()) lock.acquire();
        } catch (RuntimeException ignored) { }
        try {                                   // v1.115: and the radio must not doze between the small packets of a fight (the "power save" of the Wi-Fi chip adds 100 to 300 ms to every answer)
            if (wifi != null && fast == null) {
                fast = wifi.createWifiLock(Build.VERSION.SDK_INT >= 29 ? 4 : WifiManager.WIFI_MODE_FULL_HIGH_PERF, "jjs-fast");      // 4 = WIFI_MODE_FULL_LOW_LATENCY (Android 10 and up)
                fast.setReferenceCounted(false);
            }
            if (fast != null && !fast.isHeld()) fast.acquire();
        } catch (RuntimeException ignored) { }
    }

    private synchronized void drop() {
        try { if (lock != null && lock.isHeld()) lock.release(); } catch (RuntimeException ignored) { }
        try { if (fast != null && fast.isHeld()) fast.release(); } catch (RuntimeException ignored) { }
    }

    @JavascriptInterface public String host(String name) { grab(); return net.host(name); }
    @JavascriptInterface public String browse() { grab(); return net.browse(); }
    @JavascriptInterface public String rooms() { return net.rooms(); }
    @JavascriptInterface public void join(String ip, int port) { grab(); net.join(ip, port); }
    @JavascriptInterface public boolean send(String text) { return net.send(text); }
    @JavascriptInterface public boolean sendFast(String text) { return net.sendFast(text); }
    @JavascriptInterface public String events() { return net.events(); }
    @JavascriptInterface public int ping() { return net.ping(); }
    @JavascriptInterface public int loss() { return net.loss(); }
    @JavascriptInterface public String lane() { return net.lane(); }
    @JavascriptInterface public void stop() { net.stop(); drop(); }
}
