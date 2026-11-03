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
- Latest: V1.117 (code 192) Verity LAG COUNTER (walk BACK + BLUE, 15%, $400 needs BITE: 1.5 s frozen stuttering walk-back; a fighter's blow does nothing, top body flung back then bite 12 + bleed, punch 35 + knock-away; offline only). V1.116 = RIP AND THROW (fwd + BLUE, pushed bc92915).
- Tests at V1.117: v117.js 225 checks, fuzz117.js, v116.js, old suites all exit 0, lint = 19 messages (6 errors, 13 warnings) = baseline. (V1.115: LanNetTest 61 checks, 25 fighter pairs.)

## Open Tasks
- NOW (offline game): new Verity moves. Has 15 skills (crouch, block, teleport, bite, smoke ball, fatal, jumpscare, blood drag, heavy, tele cancel, air combo, air bite, sense, rip and throw, lag counter). Missing: ranged move, STOP (story-only), teleport strike, jump+ATTACK move, power-up MODE, more BLUE variants (he has 5, Yuji 7, Cat 4). Suggested: STOP + ARM GRAB (stretchy arm art exists, `ripPic` shows how to draw it) + TELEPORT STRIKE. Open Verity input slots (code: `verityScene`, branches lpReq/dashReq/ceReq/domReq/atkReq): jump+ATTACK, walk+ATTACK, crouch-back/air+dir+BLUE, crouch/air+MODE, crouch/air/far+DOMAIN (far now says TOO FAR), crouch+DASH, DASH+ATTACK, crouch block, block-walk, crouch+JUMP. Other options:  Freddy as an enemy in Versus (not offered yet: `buildFighters`, "he cannot fight yet") / playable chapter 3 fight (only a cutscene so far, v1.106).
- (Paused) Next online (suggested order): BLUE moves of all 5 fighters -> MODE moves -> cutscene moves (FATALITY, DOMAIN, ULTIMATE, JUMPSCARE, DREAM). Sukuna online only if asked.
- Off online now: BLUE (except Gojo's air teleport), MODE, DOMAIN, FATAL, heavy strike (`flowOK`), Cat ARM HANG, Freddy PIERCE (see the net filter in `vsTick`).
- Unverified: real-phone ping and WifiLock effect.

## Key Files
- tools/template.html (main game), tools/custom.js, tools/sukuna.js, tools/updates.json, README.md
- android/src/com/jujutsusorcerers/game/LanNet.java, LanBridge.java; android/test/.../LanNetTest.java
- Wi-Fi code in template.html: search `WI-FI ROOMS`, `netPic`, `netResolve`, `drawRemote`, `gojoHit`, `netSwing`, `vsTick`.

## Notes
- Test harness lives in the session scratchpad (not in the repo): two Playwright pages with a fake `AndroidLan`; a debug copy of the page adds `window.__ev`.
- Known test flakes, also on v1.114: v113s first crouch, v114s first jump ("no air").
- Lint: eslint on the extracted page script; messages must equal the baseline.
