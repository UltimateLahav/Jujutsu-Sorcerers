package com.jujutsusorcerers.game;

import android.app.Activity;
import android.content.ClipData;
import android.content.ClipboardManager;
import android.content.Context;
import android.os.Build;
import android.os.PowerManager;
import android.os.VibrationEffect;
import android.os.Vibrator;
import android.view.Display;
import android.view.Window;
import android.view.WindowManager;
import android.webkit.JavascriptInterface;

import java.util.concurrent.Callable;
import java.util.concurrent.FutureTask;
import java.util.concurrent.TimeUnit;

/** What the page cannot do alone (window.AndroidApp): vibrate, use the clipboard for save codes, ask for the phone's battery saver, ask for a fast (high refresh rate) screen mode. */
public class AppBridge {
    private final Activity act;

    public AppBridge(Activity a) { act = a; }

    @JavascriptInterface
    public void vibrate(int ms) {
        try {
            Vibrator v = (Vibrator) act.getSystemService(Context.VIBRATOR_SERVICE);
            if (v == null || !v.hasVibrator()) return;
            ms = Math.max(1, Math.min(300, ms));
            if (Build.VERSION.SDK_INT >= 26) v.vibrate(VibrationEffect.createOneShot(ms, VibrationEffect.DEFAULT_AMPLITUDE));
            else v.vibrate(ms);
        } catch (Exception e) { /* a missing motor must never stop the game */ }
    }

    @JavascriptInterface
    public void copy(final String text) {
        act.runOnUiThread(new Runnable() {
            @Override public void run() {
                try {
                    ClipboardManager cm = (ClipboardManager) act.getSystemService(Context.CLIPBOARD_SERVICE);
                    if (cm != null) cm.setPrimaryClip(ClipData.newPlainText("Jujutsu Sorcerers save code", text));
                } catch (Exception e) { /* the page says it could not copy only when this throws */ }
            }
        });
    }

    @JavascriptInterface
    public String paste() {
        FutureTask<String> job = new FutureTask<String>(new Callable<String>() {
            @Override public String call() {
                ClipboardManager cm = (ClipboardManager) act.getSystemService(Context.CLIPBOARD_SERVICE);
                if (cm == null) return "";
                ClipData d = cm.getPrimaryClip();
                if (d == null || d.getItemCount() == 0) return "";
                CharSequence t = d.getItemAt(0).coerceToText(act);
                return t == null ? "" : t.toString();
            }
        });
        act.runOnUiThread(job);
        try { return job.get(1500, TimeUnit.MILLISECONDS); } catch (Exception e) { return ""; }
    }

    @JavascriptInterface
    public boolean powerSave() {
        PowerManager pm = (PowerManager) act.getSystemService(Context.POWER_SERVICE);
        return pm != null && pm.isPowerSaveMode();
    }

    /** The fastest refresh rate (Hz = pictures per second) the screen offers at its present size; 0 when unknown. */
    @JavascriptInterface
    public int maxRefresh() {
        try {
            Display d = act.getWindowManager().getDefaultDisplay();
            float best = d.getRefreshRate();
            if (Build.VERSION.SDK_INT >= 23) {
                Display.Mode cur = d.getMode();
                for (Display.Mode m : d.getSupportedModes())
                    if (m.getPhysicalWidth() == cur.getPhysicalWidth() && m.getPhysicalHeight() == cur.getPhysicalHeight() && m.getRefreshRate() > best) best = m.getRefreshRate();
            }
            return Math.round(best);
        } catch (Exception e) { return 0; }
    }

    /** Ask Android for a screen mode that shows at least hz pictures a second: the slowest mode that is fast enough, or the fastest one (hz 1000 = always the fastest). 0 = let the system choose. */
    @JavascriptInterface
    public void setRefresh(final int hz) {
        act.runOnUiThread(new Runnable() {
            @Override public void run() {
                try {
                    Window w = act.getWindow();
                    WindowManager.LayoutParams p = w.getAttributes();
                    if (Build.VERSION.SDK_INT >= 23) {
                        int id = 0;
                        float rate = 0;
                        if (hz > 0) {
                            Display d = act.getWindowManager().getDefaultDisplay();
                            Display.Mode cur = d.getMode(), pick = null;
                            for (Display.Mode m : d.getSupportedModes()) {
                                if (m.getPhysicalWidth() != cur.getPhysicalWidth() || m.getPhysicalHeight() != cur.getPhysicalHeight()) continue;
                                if (pick == null) pick = m;
                                else if (pick.getRefreshRate() < hz || hz >= 1000) { if (m.getRefreshRate() > pick.getRefreshRate()) pick = m; }      // (not fast enough yet: go up)
                                else if (m.getRefreshRate() >= hz && m.getRefreshRate() < pick.getRefreshRate()) pick = m;      // (fast enough: the slowest such mode saves the most battery)
                            }
                            if (pick != null) { id = pick.getModeId(); rate = pick.getRefreshRate(); }
                        }
                        p.preferredDisplayModeId = id;
                        p.preferredRefreshRate = rate;
                    } else p.preferredRefreshRate = hz > 0 ? Math.min(hz, 240) : 0;
                    w.setAttributes(p);
                } catch (Exception e) { /* an old phone or a fixed screen: nothing to ask for */ }
            }
        });
    }
}
