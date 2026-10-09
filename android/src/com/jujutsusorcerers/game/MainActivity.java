package com.jujutsusorcerers.game;

import android.app.Activity;
import android.graphics.Color;
import android.os.Bundle;
import android.view.View;
import android.view.WindowManager;
import android.webkit.WebChromeClient;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;

/** Hosts the game (assets/index.html) in a full-screen, landscape WebView. No internet needed. */
public class MainActivity extends Activity implements View.OnLongClickListener {
    private WebView web;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        getWindow().addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);

        web = new WebView(this);
        web.setBackgroundColor(Color.parseColor("#0D0A17"));
        web.setOverScrollMode(View.OVER_SCROLL_NEVER);
        web.setVerticalScrollBarEnabled(false);
        web.setHorizontalScrollBarEnabled(false);
        web.setHapticFeedbackEnabled(false);
        web.setOnLongClickListener(this);

        WebSettings s = web.getSettings();
        s.setJavaScriptEnabled(true);
        s.setDomStorageEnabled(true);
        s.setMediaPlaybackRequiresUserGesture(false);
        s.setSupportZoom(false);
        s.setBuiltInZoomControls(false);
        s.setTextZoom(100);
        s.setAllowContentAccess(false);

        web.setWebViewClient(new WebViewClient());   // keep all navigation inside the app
        web.setWebChromeClient(new WebChromeClient());
        setContentView(web);
        web.loadUrl("file:///android_asset/index.html");
    }

    private void hideSystemUi() {
        // immersive sticky | fullscreen | hide navigation | layout flags (literal values keep this API-level neutral)
        getWindow().getDecorView().setSystemUiVisibility(0x1000 | 0x4 | 0x2 | 0x400 | 0x200 | 0x100);
    }

    @Override
    public void onWindowFocusChanged(boolean hasFocus) {
        super.onWindowFocusChanged(hasFocus);
        if (hasFocus) hideSystemUi();
    }

    /** Back button: let the game step back through its menus first; close the app from the title screen. */
    @Override
    public void onBackPressed() {
        web.evaluateJavascript("window.__back ? window.__back() : false", new BackCallback(this));
    }

    @Override public boolean onLongClick(View v) { return true; }   // swallow long-press (no text-selection popups)

    @Override protected void onPause()  { super.onPause();  web.onPause(); }
    @Override protected void onResume() { super.onResume(); web.onResume(); hideSystemUi(); }
    @Override protected void onDestroy() { web.destroy(); super.onDestroy(); }
}
