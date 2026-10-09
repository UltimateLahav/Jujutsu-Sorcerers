# Jujutsu Sorcerers

Landscape pixel-art mobile game prototype.

- **Title screen:** Gojo lifts his blindfold and his one glowing eye blinks (4 closing frames, held shut for 0.5 s, then the same frames in reverse).
- **Character select** (Gojo + locked slots), then he spawns in on a rooftop. Gojo is drawn in side view, facing right, in the same detailed 64x64 16-bit style throughout: a 6-frame wind idle (12 FPS, frames per second) and separate 6-frame walk-forward and walk-backward cycles.
- **Wind and movement:** a headwind blows right-to-left. His hair stands upright with only a tiny tip flutter, his blindfold tails sway a little, and his lower clothes stay still; walking changes his stride and arm swing.
- **Jump:** a 15-frame jump at 15 FPS (exactly one second): he crouches ("bucks") to push off, tucks his knees up to his crotch/waist at the top, then reaches down, lands on his toes and absorbs the landing before standing up again. You can steer left/right while he is airborne, but not while he crouches or lands; extra presses during a jump are ignored and the ground shadow shrinks while he is up.
- **Controls:** three on-screen buttons sit side by side at the bottom-left: `<` BACK, `>` FWD (hold to walk) and `^` JUMP (tap). On a keyboard: arrow keys or A / D to walk, Up / W / Space to jump. The city scrolls with parallax.

| Path | What it is |
|---|---|
| `index.html` | The whole game, one file, works offline in any browser |
| `dist/JujutsuSorcerers.apk` | Android app (Android 5.0+). Debug-signed, for sideloading |
| `android/` | App wrapper: full-screen landscape WebView. `android/build.sh` rebuilds the APK (needs a JDK, Android SDK `platforms;android-34` and `build-tools;34.0.0`) |
| `art/` | Launcher icon + face art |
| `tools/` | Python scripts that generate the sprite frames and icons (`side.py` for the in-game sprites incl. the jump, `face.py` for the title art, `icons.py`, then `build_html.py`) |

**Install on Android:** copy the APK to the phone, open it, and allow "install unknown apps" if asked.
The APK uses a throwaway debug key (`android/debug.keystore`); publishing to Google Play needs your own release key.
