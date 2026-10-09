# Jujutsu Sorcerers

Landscape pixel-art mobile game prototype. Title screen, character select (Gojo + locked slots), then spawn in and
watch Gojo's idle: hands in pockets, 6 frames at 12 FPS, hair and clothes moving in the wind. No movement yet.

| Path | What it is |
|---|---|
| `index.html` | The whole game, one file, works offline in any browser |
| `dist/JujutsuSorcerers.apk` | Android app (Android 5.0+). Debug-signed, for sideloading |
| `android/` | App wrapper: full-screen landscape WebView. `android/build.sh` rebuilds the APK (needs a JDK, Android SDK `platforms;android-34` and `build-tools;34.0.0`) |
| `art/` | Launcher icon + face art |
| `tools/` | Python scripts that generate the sprite frames and icons (`idle.py`, `face.py`, `icons.py`, then `build_html.py`) |

**Install on Android:** copy the APK to the phone, open it, and allow "install unknown apps" if asked.
The APK uses a throwaway debug key (`android/debug.keystore`); publishing to Google Play needs your own release key.
