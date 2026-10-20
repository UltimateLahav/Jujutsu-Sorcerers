package com.jujutsusorcerers.game;

import android.app.Activity;
import android.content.ClipData;
import android.content.ClipboardManager;
import android.content.Context;
import android.os.Build;
import android.os.PowerManager;
import android.os.VibrationEffect;
import android.os.Vibrator;
import android.webkit.JavascriptInterface;

import java.util.concurrent.Callable;
import java.util.concurrent.FutureTask;
import java.util.concurrent.TimeUnit;

/** What the page cannot do alone (window.AndroidApp): vibrate, use the clipboard for save codes, ask for the phone's battery saver. */
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
}
