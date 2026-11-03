# Jujutsu Sorcerers - project notes (keep under 60 lines; edit only changed lines)

## Goal
- Landscape pixel-art HTML5 canvas fighting game: one page (tools/template.html + modules -> index.html), packaged as an Android APK (dist/JujutsuSorcerers.apk).
- Dev branch: claude/sharp-darwin-1w5z58. No pull request unless asked.

## Decisions
- Release routine per version: version label `<small id="ver">` in tools/template.html; android/build.sh `--version-code/--version-name`; new top entry in tools/updates.json; README bullet after the previous version's; rebuild (`cd tools && python3 -B build_html.py ../index.html`, then `bash android/build.sh`); verify (no `__SUKUNA__`/`__SUKPNG__` left, APK asset == index.html, version in manifest as UTF-16, no tools/__pycache__); commit with trailers, push; send APK + previews; ask "anything else?".
- Wi-Fi fight: each phone runs its own fighter; the other fighter is drawn from a picture NAME (`c.__nd`; Gojo/Yuji sets via NETSET). A swing is checked on the attacker's screen and decided on the victim's phone (`gojoHit` via `netSwing`). All moves unlocked online except INHERITENCE things (`NET_NO`).
- Link (LanNet.java): TCP + UDP together, first copy wins, in order; pictures UDP-only, newest wins; ping measured on UDP; WifiLock low latency.
- Delivery in steps: V1.115 = faster link + five fighters' basic moves; special moves follow in groups.
- ONLINE PAUSED after V1.115 (resume only when asked). Work goes on in the offline game.

## Progress
- Latest: V1.119 (code 194) Sukuna CLEAVE mode (free play; MODE button / E, silent, `suCl`, off at round start; ATTACK = R.HOOK, L.HOOK, ELBOW, TOUCH CUT = 1% of dummy.max; BLUE = CLEAVE 5% standing, LIFT crouched, DIVE in the air, DASH CLEAVE fwd (all 5%, guard broken, 5/10/10/10 energy); states `g.cs.cl` + constants `SU_CL`/`SU_ELB` in tools/sukuna.js; new art rows el/tc/lift/dive in tools/sukuna_art.py, strip 23 rows). V1.118 = DASH SLASH (8e0055f), V1.117 = LAG COUNTER, V1.116 = RIP AND THROW.
- Tests at V1.119: v119.js 454 checks, fuzz119.js (2 seeds), v118.js, v117.js, old suites exit 0 (v113s / v114s / v116 may flake once, they pass on repeat), lint = 19 messages (6 errors, 13 warnings) = baseline. (V1.115: LanNetTest 61 checks, 25 fighter pairs.)

## Open Tasks
- NOW (offline game): new moves one by one (Verity, Sukuna). Sukuna (free play, `tools/sukuna.js`, BLUE moves 9-13: AIR CUT, CUT STORM (back), LEG CUT (crouch), DISMANTLE (air), DASH SLASH (fwd, enemy within 100 px); CLEAVE mode (MODE button) = moves 14-21); open Sukuna slots: block/dash/hurt pictures, more MODE moves. New Verity moves: Has 15 skills (crouch, block, teleport, bite, smoke ball, fatal, jumpscare, blood drag, heavy, tele cancel, air combo, air bite, sense, rip and throw, lag counter). Missing: ranged move, STOP (story-only), teleport strike, jump+ATTACK move, power-up MODE, more BLUE variants (he has 5, Yuji 7, Cat 4). Suggested: STOP + ARM GRAB (stretchy arm art exists, `ripPic` shows how to draw it) + TELEPORT STRIKE. Open Verity input slots (code: `verityScene`, branches lpReq/dashReq/ceReq/domReq/atkReq): jump+ATTACK, walk+ATTACK, crouch-back/air+dir+BLUE, crouch/air+MODE, crouch/air/far+DOMAIN (far now says TOO FAR), crouch+DASH, DASH+ATTACK, crouch block, block-walk, crouch+JUMP. Other options:  Freddy as an enemy in Versus (not offered yet: `buildFighters`, "he cannot fight yet") / playable chapter 3 fight (only a cutscene so far, v1.106).
- (Paused) Next online (suggested order): BLUE moves of all 5 fighters -> MODE moves -> cutscene moves (FATALITY, DOMAIN, ULTIMATE, JUMPSCARE, DREAM). Sukuna online only if asked.
- Off online now: BLUE (except Gojo's air teleport), MODE, DOMAIN, FATAL, heavy strike (`flowOK`), Cat ARM HANG, Freddy PIERCE (see the net filter in `vsTick`).
- Unverified: real-phone ping and WifiLock effect.

## Key Files
- tools/template.html (main game), tools/custom.js, tools/sukuna.js, tools/updates.json, README.md
- android/src/com/jujutsusorcerers/game/LanNet.java, LanBridge.java; android/test/.../LanNetTest.java
- Wi-Fi code in template.html: search `WI-FI ROOMS`, `netPic`, `netResolve`, `drawRemote`, `gojoHit`, `netSwing`, `vsTick`.

## Notes
- Test harness lives in the session scratchpad (not in the repo): two Playwright pages with a fake `AndroidLan`; a debug copy of the page adds `window.__ev`.
- Known test flakes, also on v1.114: v113s first crouch, v114s first jump ("no air"), v116 "holding forward in reach: BITE" (1 run in 3, old page too).
- Lint: eslint on the extracted page script; messages must equal the baseline.
