# Jujutsu Sorcerers

Landscape pixel-art mobile game prototype.

- **Title screen:** Gojo lifts his blindfold and his one glowing eye blinks (4 closing frames, held shut for 0.5 s, then the same frames in reverse).
- **Character select** (Gojo + locked slots), then he spawns in on a rooftop and idles in the wind (6 frames, 12 FPS).
- **Move:** hold the on-screen `<` BACK / `>` FWD buttons, or use the arrow keys / A and D. Forward and backward each have their own 6-frame walk cycle (he keeps facing right) and the city scrolls with parallax.

| Path | What it is |
|---|---|
| `index.html` | The whole game, one file, works offline in any browser |
| `dist/JujutsuSorcerers.apk` | Android app (Android 5.0+). Debug-signed, for sideloading |
| `android/` | App wrapper: full-screen landscape WebView. `android/build.sh` rebuilds the APK (needs a JDK, Android SDK `platforms;android-34` and `build-tools;34.0.0`) |
| `art/` | Launcher icon + face art |
| `tools/` | Python scripts that generate the sprite frames and icons (`idle.py`, `face.py`, `icons.py`, then `build_html.py`) |

**Install on Android:** copy the APK to the phone, open it, and allow "install unknown apps" if asked.
The APK uses a throwaway debug key (`android/debug.keystore`); publishing to Google Play needs your own release key.
