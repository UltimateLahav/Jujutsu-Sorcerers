# Jujutsu Sorcerers

Landscape pixel-art mobile game prototype.

- **Title screen:** Gojo lifts his blindfold and his one glowing eye blinks (4 closing frames, held shut for 0.5 s, then the same frames in reverse).
- **Character select** (Gojo + locked slots), then he spawns in on a rooftop. Gojo is drawn in side view, facing right, in the same detailed 64x64 16-bit style throughout: a 6-frame wind idle (12 FPS, frames per second) and separate 15-frame walk-forward and walk-backward cycles (15 FPS, so one full cycle takes a second and he takes one step every half second; the walking speed is matched to that stride so his feet do not skate).
- **Wind and movement:** a headwind blows right-to-left. His hair stands upright with only a tiny tip flutter, his blindfold tails sway a little, and his lower clothes stay still; walking changes his stride and arm swing.
- **Jump:** a 15-frame jump at 15 FPS (frames per second, so exactly one second): he crouches ("bucks") to push off, tucks his knees up to his crotch/waist at the top, then reaches down, lands on his toes and absorbs the landing before standing up again.
- **Double jump (teleport):** press JUMP again while he is in the air and he collapses into blue Six Eyes light, flashes into place about 34 art pixels up, then drops and lands hard. 15 more frames at 20 FPS (0.75 s). Only one teleport per jump.
- **While jumping:** you can steer left/right in the air (including through the teleport and the fall), but not while he crouches or lands; presses during those moments, or while he is still spawning in, are ignored. The ground shadow shrinks while he is up.
- **Controls:** `<` BACK and `>` FWD (hold to walk) sit side by side at the bottom-left; the bottom-right corner has `^` JUMP (tap, tap again in the air) with the ATTACK burst button above it. On a keyboard: arrow keys or A / D to walk, Up / W / Space to jump, J / F to attack. The city scrolls with parallax.

- **Attack combo:** the ATTACK button (above JUMP; keyboard J or F) throws a 4-hit combo, one hit per press, 15 frames per hit: **1** right hook, **2** left hook, **3** right elbow (blue glow on the hand) and **4** roundhouse kick (red glow on the hands). The button shows which hit is next. Press again while a swing is still running and the next hit starts the moment it ends; wait longer than about 1.4 s and the combo starts over at the right hook. Hits 1-3 run at 30 FPS (half a second each), the kick at 24 FPS. He stands his ground while attacking, attacks work on the ground only, and each hit has its own whoosh, a deep impact thump and a tiny screen shake.
- **Sound** (all synthesised in code by `tools/sfx.js`, no audio files; the sound starts after the first tap): leather-on-concrete **footsteps** locked to the walk animation (one step every half second, exactly when a foot lands, alternating feet, slightly different every time; a calm, low heel-then-toe thump rather than a sharp click), a very quiet looping **wind** (a little stronger when he walks into it), and deep **jump**, **landing** and **teleport** sounds (charge, vanish, arrive, fall, heavy landing). The jump / landing / teleport sounds keep their deep bass at normal strength while the air and noise parts are softened. A small room reverb gives them space. The **SND ON/OFF** button in the game bar mutes everything (remembered), and the Android app silences the game while it is in the background. Levels live in the `LEVEL` constants at the top of `tools/sfx.js` (rebuild with `tools/build_html.py`).

| Path | What it is |
|---|---|
| `index.html` | The whole game, one file, works offline in any browser |
| `dist/JujutsuSorcerers.apk` | Android app (Android 5.0+). Debug-signed, for sideloading |
| `android/` | App wrapper: full-screen landscape WebView. `android/build.sh` rebuilds the APK (needs a JDK, Android SDK `platforms;android-34` and `build-tools;34.0.0`) |
| `art/` | Launcher icon + face art |
| `tools/` | Python scripts that generate the sprite frames and icons (`side.py` for the in-game sprites incl. the jump and the teleport double jump, `sfx.js` for the sound effects, `face.py` for the title art, `icons.py`, then `build_html.py`) |

**Install on Android:** copy the APK to the phone, open it, and allow "install unknown apps" if asked.
The APK uses a throwaway debug key (`android/debug.keystore`); publishing to Google Play needs your own release key.
