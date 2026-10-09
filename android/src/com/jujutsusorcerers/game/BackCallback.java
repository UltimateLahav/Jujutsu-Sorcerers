package com.jujutsusorcerers.game;

import android.app.Activity;
import android.webkit.ValueCallback;

/** Result of the game's back handler: if the game did not consume the press, close the app. */
final class BackCallback implements ValueCallback<String> {
    private final Activity activity;

    BackCallback(Activity activity) { this.activity = activity; }

    @Override
    public void onReceiveValue(String handled) {
        if (!"true".equals(handled)) activity.finish();
    }
}
