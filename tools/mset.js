// ================================================================ v1.152 THE SETTINGS SCREEN OF THE MAIN MENU: every option in pages (graphics, gameplay, story, sound, controls, accessibility, look, data, presets), a search box,
// a DEF button on every option, presets, stats, a save code and a settings code. The numbers live in SET (see the top of tools/template.html); msApply() puts them to work (colours, filters, scanlines, then gfxApply() in tools/gfx.js),
// the rest is read by the game itself (shake, flash, damage, energy, money ...). The old SETTINGS of the pause menu stays and shows the same numbers.
// v1.153 the GRAPHICS page was rebuilt: quality presets, a live preview, less / more / picture / frame rate options and the tools; what they do is in tools/gfx.js.
const MSD = { hap: 1, sz: 100, op: 78, up: 0, lh: 0, fps: 0, lite: 0, ap: 1, assist: 0, pace: 1, hb: 0, gore: 0, shk: 100, fl: 100, dn: 1, hs: 100, br: 100, ct: 100, sat: 100, scan: 0, cb: 0, fpsc: 0, edm: 100, pdm: 100, reg: 0, ien: 0, ihp: 0, ohk: 0, sub: 1, nf: 0, hc: 0, th: 0, pt: 3, bgd: 3, au: 2, ov: 2, glow: 0, trl: 0, shd: 0, zoom: 100, smooth: 0, retro: 0 };
const MS_THEMES = [['RED', '#e0242f'], ['BLUE', '#39a2ff'], ['PURPLE', '#8f7ac4'], ['GREEN', '#3fd17a'], ['GOLD', '#ffd34d'], ['PINK', '#ff6fb1']];
const ONOFF = ['OFF', 'ON'];
const MSP = [      // the pages: a row is { k: the key in SET, n: name, t: 'r' (slider a - b, step c, unit u) or 't' (a button that cycles the names a (the numbers b)), h: the hint }
  { id: 'gfx', n: 'GRAPHICS', rows: [
    { t: 'gq' },
    { n: 'LESS: TURN DOWN WHAT THE PHONE HAS TO DRAW', t: 'h' },
    { k: 'pt', n: 'PARTICLES', t: 't', a: ['NONE', 'FEW', 'SOME', 'NORMAL', 'MANY'], h: 'SPARKS, SMOKE AND FLYING BITS. NORMAL IS HOW THE GAME CAME. MANY MAKES MORE THAN TWICE AS MANY.' },
    { k: 'bgd', n: 'BACKGROUND DETAIL', t: 't', a: ['FLAT', 'LOW', 'MEDIUM', 'FULL'], h: 'FLAT = JUST THE SKY AND THE ROAD. LOW ADDS THE FAR TOWERS, MEDIUM THE SHOPS AND LAMPS, FULL THE WIND STREAKS.' },
    { k: 'au', n: 'AURA AND RINGS', t: 't', a: ['OFF', 'FLAMES ONLY', 'ALL'], h: 'THE CURSED ENERGY FLAMES, THE LIGHTNING AND THE SHOCK RINGS OF BIG HITS. FLAMES ONLY = THE FLAMES AND LIGHTNING BUT NO RINGS. OFF = NONE.' },
    { k: 'ov', n: 'SCREEN OVERLAYS', t: 't', a: ['OFF', 'LIGHT', 'FULL'], h: 'THE SEE-THROUGH TINTS OVER THE WHOLE PICTURE IN A FIGHT (DARKENING, FLICKER, WASHES OF COLOUR). LIGHT = HALF AS STRONG.' },
    { k: 'shk', n: 'SCREEN SHAKE', t: 'r', a: 0, b: 150, c: 10, u: '%', h: 'HOW HARD THE SCREEN SHAKES WHEN YOU HIT OR GET HIT, ALSO IN THE STORY. 0 = NO SHAKE.' },
    { k: 'fl', n: 'FLASH STRENGTH', t: 'r', a: 0, b: 100, c: 10, u: '%', h: 'THE FLASHES OF LIGHT ON BIG HITS AND MOVES. 0 = NO FLASHES.' },
    { k: 'hs', n: 'HIT PAUSE', t: 'r', a: 0, b: 150, c: 10, u: '%', h: 'THE SHORT FREEZE WHEN A BLOW LANDS. 0 = NONE, MORE = HEAVIER HITS.' },
    { k: 'dn', n: 'DAMAGE NUMBERS', t: 't', a: ONOFF, h: 'THE NUMBERS THAT POP UP WHEN YOU HIT SOMEONE.' },
    { n: 'MORE: EXTRA EFFECTS (FOR FAST PHONES)', t: 'h' },
    { k: 'glow', n: 'GLOW', t: 't', a: ['OFF', 'LOW', 'MEDIUM', 'HIGH'], h: 'BRIGHT THINGS GLOW (BLOOM). HEAVY: THE PICTURE IS DRAWN AGAIN, BLURRED, ON TOP OF ITSELF.' },
    { k: 'trl', n: 'MOTION TRAILS', t: 't', a: ['OFF', 'SHORT', 'MEDIUM', 'LONG'], h: 'FAST FIGHTERS LEAVE FADING COPIES OF THEMSELVES BEHIND, IN FIGHTS.' },
    { k: 'shd', n: 'SHADOWS AND LIGHT', t: 't', a: ['OFF', 'SIMPLE', 'SOFT', 'SOFT + LIGHT'], h: 'A SHADOW ON THE FLOOR UNDER EVERY FIGHTER, IN FIGHTS. SOFT = MORE ROWS. LIGHT = ALSO A PALE POOL OF LIGHT ROUND HIM.' },
    { n: 'FOR MORE PARTICLES THAN NORMAL, SET PARTICLES (ABOVE) TO MANY.', t: 'n' },
    { n: 'PICTURE', t: 'h' },
    { k: 'zoom', n: 'CAMERA ZOOM', t: 't', a: ['75%', '90%', '100%', '110%', '125%'], b: [75, 90, 100, 110, 125], h: 'BIGGER PIXELS = A CLOSER CAMERA, SMALLER PIXELS = A WIDER ONE. ONLY IN FIGHTS AND FREE PLAY: THE STORY STAYS NORMAL SIZE. THE PIXELS STAY WHOLE, SO ON A SMALL SCREEN TWO STEPS CAN LOOK ALIKE.' },
    { k: 'retro', n: 'FIXED RETRO SIZE', t: 't', a: ONOFF, h: 'ALWAYS THE SAME 288 X 128 PICTURE, WITH BLACK BARS ROUND IT WHERE THE SCREEN IS A DIFFERENT SHAPE. THE ZOOM IS OFF WHILE THIS IS ON.' },
    { k: 'smooth', n: 'PIXEL SMOOTHING', t: 't', a: ONOFF, h: 'BLURS THE BIG PIXELS A LITTLE INSTEAD OF SHOWING THEM SHARP.' },
    { k: 'br', n: 'BRIGHTNESS', t: 'r', a: 70, b: 130, c: 5, u: '%', h: 'HOW LIGHT THE GAME PICTURE IS.' },
    { k: 'ct', n: 'CONTRAST', t: 'r', a: 80, b: 140, c: 5, u: '%', h: 'THE DIFFERENCE BETWEEN DARK AND LIGHT.' },
    { k: 'sat', n: 'COLOUR', t: 'r', a: 0, b: 150, c: 10, u: '%', h: 'HOW STRONG THE COLOURS ARE. 0 = BLACK AND WHITE.' },
    { k: 'scan', n: 'SCANLINES', t: 't', a: ['OFF', 'LIGHT', 'HEAVY'], h: 'THIN DARK LINES OVER THE SCREEN, LIKE AN OLD TV.' },
    { k: 'hb', n: 'SHOW HITBOXES', t: 't', a: ONOFF, h: 'DRAWS THE BOXES THE GAME TESTS A HIT WITH (FOR TESTING).' },
    { n: 'FRAME RATE', t: 'h' },
    { k: 'fps', n: 'FRAME RATE', t: 't', a: ['AUTO', '30 FPS', '45 FPS', '60 FPS', '72 FPS', '90 FPS', '120 FPS', '144 FPS', 'UNLIMITED'], b: [0, 30, 45, 60, 72, 90, 120, 144, 999], h: 'FPS = HOW MANY PICTURES THE GAME DRAWS EVERY SECOND. AUTO = AS MANY AS THE SCREEN SHOWS. UNLIMITED = NO LIMIT: THE APP ASKS ANDROID FOR THE FASTEST SCREEN MODE.' },
    { k: 'lite', n: 'BATTERY SAVER', t: 't', a: ONOFF, h: '30 FPS, NO SCREEN SHAKE AND FEWER SPARKS.' },
    { n: 'TOOLS', t: 'h' },
    { k: 'fpsc', n: 'STATS OVERLAY', t: 't', a: ['OFF', 'FPS', 'DETAILED'], h: 'NUMBERS AT THE TOP RIGHT: THE FPS, AND WITH DETAILED ALSO HOW LONG A PICTURE TAKES AND THE SCREEN RATE.' },
    { t: 'gtools' }] },
  { id: 'game', n: 'GAMEPLAY', rows: [
    { k: 'assist', n: 'ASSIST', t: 't', a: ['OFF', 'PARRY+', 'EASY', 'AUTO-GUARD'], h: 'NOT IN WI-FI FIGHTS. PARRY+ = WIDER PARRY WINDOW, EASY = ALSO 30% LESS DAMAGE TO YOU, AUTO-GUARD = ALSO BLOCKS FOR YOU WHILE YOU STAND STILL.' },
    { k: 'pace', n: 'GAME PACE', t: 't', a: ['NORMAL', 'FAST', 'TURBO', 'SLOW'], h: 'HOW FAST OFFLINE FIGHTS RUN (NOT WI-FI, NOT THE STORY). THE TIMERS STILL COUNT REAL SECONDS.' },
    { k: 'edm', n: 'ENEMY DAMAGE', t: 'r', a: 25, b: 200, c: 5, u: '%', h: 'HOW HARD THE ENEMY HITS YOU. BELOW 100% COUNTS AS A CHEAT (NO MONEY).' },
    { k: 'pdm', n: 'YOUR DAMAGE', t: 'r', a: 50, b: 300, c: 10, u: '%', h: 'HOW HARD YOU HIT. ABOVE 100% COUNTS AS A CHEAT (NO MONEY).' },
    { k: 'reg', n: 'HEALTH REGEN', t: 'r', a: 0, b: 5, c: 1, u: '%/S', h: 'YOU SLOWLY GET HEALTH BACK DURING A FIGHT (PERCENT OF YOUR HEALTH PER SECOND).' },
    { k: 'ap', n: 'AUTO-PAUSE', t: 't', a: ONOFF, h: 'A CALL OR LEAVING THE APP PAUSES THE FIGHT.' },
    { n: 'CHEATS: NOT IN WI-FI FIGHTS. WHILE ANY CHEAT IS ON YOU EARN NO MONEY AND NO MONEY REWARDS ARE GIVEN.', t: 'n' },
    { k: 'ien', n: 'INFINITE ENERGY', t: 't', a: ONOFF, h: 'MOVES COST NO CURSED ENERGY.' },
    { k: 'ihp', n: 'INFINITE HEALTH', t: 't', a: ONOFF, h: 'YOU CANNOT BE HURT.' },
    { k: 'ohk', n: 'ONE-HIT KILLS', t: 't', a: ONOFF, h: 'EVERY BLOW YOU LAND KNOCKS THE ENEMY OUT.' }] },
  { id: 'story', n: 'STORY', rows: [
    { k: 'sub', n: 'SUBTITLES', t: 't', a: ONOFF, h: 'THE TEXT BOX WITH WHAT THE CHARACTERS SAY IN THE STORY.' },
    { k: 'gore', n: 'GRAPHIC DAMAGE', t: 't', a: ['FULL', 'CLEAN', 'OFF'], h: 'BLOOD AND TORN LIMBS IN FIGHTS AND THE STORY. CLEAN = NO BLOOD, OFF = NONE OF IT.' },
    { n: 'THE STORY ALSO USES SCREEN SHAKE AND FLASH STRENGTH FROM THE GRAPHICS PAGE, AND THE SOUND PAGE. THE GAME PACE DOES NOT CHANGE THE STORY.', t: 'n' },
    { n: 'IN A CUTSCENE, TAP THE SKIP BUTTON AT THE TOP RIGHT TO LEAVE IT.', t: 'n' }] },
  { id: 'snd', n: 'SOUND', rows: [{ t: 'snd' }] },
  { id: 'ctl', n: 'CONTROLS', rows: [
    { k: 'sz', n: 'BUTTON SIZE', t: 'r', a: 70, b: 120, c: 5, u: '%', h: 'HOW BIG THE ON-SCREEN BUTTONS ARE.' },
    { k: 'op', n: 'BUTTON OPACITY', t: 'r', a: 30, b: 100, c: 5, u: '%', h: 'HOW SEE-THROUGH THE BUTTONS ARE.' },
    { k: 'up', n: 'RAISE BUTTONS', t: 'r', a: 0, b: 20, c: 1, u: '', h: 'MOVES THE BUTTONS UP, AWAY FROM THE EDGE OF THE SCREEN.' },
    { k: 'lh', n: 'SIDE', t: 't', a: ['RIGHT-HANDED', 'LEFT-HANDED'], h: 'SWAPS THE MOVE STICK AND THE ATTACK BUTTONS.' },
    { k: 'hap', n: 'VIBRATION', t: 't', a: ['OFF', 'LIGHT', 'STRONG'], h: 'THE PHONE BUZZES WHEN YOU HIT, GET HIT OR PARRY.' }] },
  { id: 'acc', n: 'ACCESS', rows: [
    { k: 'nf', n: 'REDUCE FLASHING', t: 't', a: ONOFF, h: 'KEEPS EVERY FLASH OF LIGHT FAINT (FOR PEOPLE WHO ARE SENSITIVE TO IT).' },
    { k: 'hc', n: 'HIGH CONTRAST', t: 't', a: ONOFF, h: 'STRONGER CONTRAST AND COLOUR, SO THINGS STAND OUT MORE.' },
    { k: 'cb', n: 'COLOUR-BLIND HELP', t: 't', a: ['OFF', 'RED WEAK', 'GREEN WEAK', 'BLUE WEAK'], h: 'SHIFTS THE COLOURS SO THAT THEY ARE EASIER TO TELL APART (AN APPROXIMATION). THE GAME PICTURE ONLY.' },
    { k: 'pace', n: 'SLOW MOTION HELP', t: 't', a: ['NORMAL', 'FAST', 'TURBO', 'SLOW'], h: 'SLOW = OFFLINE FIGHTS RUN AT 0.8 SPEED.' },
    { k: 'assist', n: 'ASSIST', t: 't', a: ['OFF', 'PARRY+', 'EASY', 'AUTO-GUARD'], h: 'A WIDER PARRY, LESS DAMAGE, OR AUTOMATIC BLOCKING.' },
    { k: 'sub', n: 'SUBTITLES', t: 't', a: ONOFF, h: 'THE TEXT OF THE STORY.' },
    { k: 'hap', n: 'VIBRATION', t: 't', a: ['OFF', 'LIGHT', 'STRONG'], h: 'BUZZ WHEN YOU HIT, GET HIT OR PARRY.' },
    { k: 'sz', n: 'BUTTON SIZE', t: 'r', a: 70, b: 120, c: 5, u: '%', h: 'BIGGER BUTTONS ARE EASIER TO HIT.' }] },
  { id: 'look', n: 'LOOK', rows: [
    { k: 'th', n: 'MENU COLOUR', t: 't', a: MS_THEMES.map(c => c[0]), h: 'THE COLOUR OF THE MENUS AND BUTTONS.' },
    { k: 'scan', n: 'SCANLINES', t: 't', a: ['OFF', 'LIGHT', 'HEAVY'], h: 'THIN DARK LINES OVER THE SCREEN.' },
    { k: 'br', n: 'BRIGHTNESS', t: 'r', a: 70, b: 130, c: 5, u: '%', h: 'HOW LIGHT THE GAME PICTURE IS.' },
    { k: 'sat', n: 'COLOUR', t: 'r', a: 0, b: 150, c: 10, u: '%', h: '0 = BLACK AND WHITE.' },
    { k: 'dn', n: 'DAMAGE NUMBERS', t: 't', a: ONOFF, h: 'THE NUMBERS ON HITS.' },
    { k: 'fpsc', n: 'STATS OVERLAY', t: 't', a: ['OFF', 'FPS', 'DETAILED'], h: 'FRAMES PER SECOND AND MORE, TOP RIGHT.' }] },
  { id: 'data', n: 'DATA', rows: [{ t: 'data' }] },
  { id: 'err', n: 'ERRORS', rows: [{ t: 'err' }] },
  { id: 'pre', n: 'PRESETS', rows: [{ t: 'pre' }] },
];
const MSR = {}; MSP.forEach(p => p.rows.forEach(r => { if (r.k && !MSR[r.k]) MSR[r.k] = r; }));
const MS_PRE = [
  ['DEFAULT', 'EVERYTHING BACK TO HOW THE GAME CAME.', MSD],
  ['BATTERY', 'SAVES BATTERY: 30 FPS, LESS SHAKE AND FLASH.', { lite: 1, fps: 30, shk: 50, fl: 40, scan: 0, fpsc: 0 }],
  ['PERFORMANCE', 'SMOOTHEST: 60 FPS, NO SAVER, FPS COUNTER ON.', { lite: 0, fps: 60, shk: 100, fl: 100, scan: 0, fpsc: 1 }],
  ['CINEMATIC', 'HEAVY HITS, SCANLINES, RICH COLOURS, NO NUMBERS.', { shk: 130, fl: 100, hs: 130, scan: 1, ct: 110, sat: 110, dn: 0, pace: 0 }],
  ['CASUAL', 'EASY ASSIST, SLOW HEALTH REGEN, NORMAL PACE.', { assist: 2, reg: 2, ap: 1, pace: 0 }],
  ['HARDCORE', 'NO ASSIST, ENEMIES HIT 50% HARDER, NO REGEN.', { assist: 0, reg: 0, edm: 150, pdm: 100, pace: 1 }],
];
let msPage = 0, msFrom = 'title', msQ = '', msNote = '';
const msSyncs = [];      // (the functions of the GRAPHICS page that refresh its preset bar and its warnings when an option changes)
const msEl = (tag, cls, txt) => { const e = document.createElement(tag); if (cls) e.className = cls; if (txt !== undefined) e.textContent = txt; return e; };
const msSave = () => { saveSet(); msApply(); buildOpts(); };
function msSet(o) { for (const k in o) if (k in MSD) SET[k] = o[k]; msSave(); msBuild(); }
const msClamp = (r, v) => { v = Math.round(+v); if (!isFinite(v)) return null; if (r.t === 'r') return Math.max(r.a, Math.min(r.b, v)); const vals = r.b || r.a.map((_, i) => i); return vals.includes(v) ? v : null; };
function msRow(r) {      // one option: its name, its control, DEF (back to the default) and a line about it
  const row = msEl('div', 'mr'), top = msEl('div', 'mt'), ctl = msEl('div', 'mc'), def = msEl('button', 'mx', 'DEF'); top.appendChild(msEl('span', 'mn', r.n)); top.appendChild(ctl); top.appendChild(def); row.appendChild(top);
  if (r.h) row.appendChild(msEl('small', 'mh', r.h));
  const set = v => { SET[r.k] = v; saveSet(); msApply(); buildOpts(); msSyncs.forEach(f => f()); };
  if (r.t === 'r') {
    const inp = msEl('input'), val = msEl('b', '', ''); inp.type = 'range'; inp.min = r.a; inp.max = r.b; inp.step = r.c; inp.value = SET[r.k]; inp.setAttribute('aria-label', r.n); val.textContent = SET[r.k] + r.u;
    inp.addEventListener('input', () => { SET[r.k] = +inp.value; val.textContent = SET[r.k] + r.u; msApply(); msSyncs.forEach(f => f()); }); inp.addEventListener('change', () => { saveSet(); buildOpts(); });
    def.addEventListener('click', () => { set(MSD[r.k]); inp.value = SET[r.k]; val.textContent = SET[r.k] + r.u; }); ctl.appendChild(inp); ctl.appendChild(val);
  } else {
    const btn = msEl('button', 'mb'), vals = r.b || r.a.map((_, i) => i), at = () => Math.max(0, vals.indexOf(SET[r.k])), label = () => { btn.textContent = r.a[at()]; }; label();
    btn.addEventListener('click', () => { set(vals[(at() + 1) % vals.length]); label(); if (r.k === 'hap') buzz(40); });
    def.addEventListener('click', () => { set(MSD[r.k]); label(); }); ctl.appendChild(btn);
  }
  return row;
}
function msSound(box) {      // the volume of each sound (the same sliders as in the pause settings) and the sound switch
  const sw = msEl('div', 'mr'), top = msEl('div', 'mt'), ctl = msEl('div', 'mc'), b = msEl('button', 'mb'); top.appendChild(msEl('span', 'mn', 'SOUND')); top.appendChild(ctl); sw.appendChild(top); sw.appendChild(msEl('small', 'mh', 'THE SAME SWITCH AS THE SND BUTTON IN A FIGHT.'));
  const lab = () => { b.textContent = soundOn ? 'ON' : 'OFF'; }; lab(); b.addEventListener('click', () => { $('snd').click(); lab(); }); ctl.appendChild(b); box.appendChild(sw);
  VOLS.forEach(([k, name]) => {
    const row = msEl('div', 'mr'), t2 = msEl('div', 'mt'), c2 = msEl('div', 'mc'), d2 = msEl('button', 'mx', 'DEF'), inp = msEl('input'), val = msEl('b', '', vol[k] + '%'); inp.type = 'range'; inp.min = 0; inp.max = 200; inp.step = 5; inp.value = vol[k]; inp.setAttribute('aria-label', name + ' volume');
    const put = v => { vol[k] = v; val.textContent = v + '%'; if (sfx) sfx.setVol(k, v / 100); };
    inp.addEventListener('input', () => put(+inp.value)); inp.addEventListener('change', () => { try { localStorage.setItem('js_vol', JSON.stringify(vol)); } catch { /* storage blocked */ } preview(k); });
    d2.addEventListener('click', () => { put(100); inp.value = 100; try { localStorage.setItem('js_vol', JSON.stringify(vol)); } catch { /* storage blocked */ } });
    t2.appendChild(msEl('span', 'mn', name + ' VOLUME')); c2.appendChild(inp); c2.appendChild(val); t2.appendChild(c2); t2.appendChild(d2); row.appendChild(t2); box.appendChild(row);
  });
}
const msFmtT = s => { const h = Math.floor(s / 3600), m = Math.floor(s % 3600 / 60); return h + 'H ' + String(m).padStart(2, '0') + 'M ' + String(s % 60).padStart(2, '0') + 'S'; };
let msArm = 0, msArm2 = 0;
function msData(box) {      // the numbers, the save code, the settings code, the resets
  const sv = loadSaves(), ch = Math.max(0, ...sv.map(s => s && typeof s.ch === 'number' ? s.ch : 0)), st = msEl('div', 'mst');
  [['PLAY TIME', msFmtT(STAT.t)], ['FIGHTS WON', STAT.w], ['FIGHTS LOST', STAT.l], ['HITS LANDED', STAT.h], ['PARRIES', STAT.p], ['STORY CHAPTER REACHED', ch || '-'], ['MONEY', '$' + PROG.m], ['VERSION', ($('ver') || {}).textContent || '']].forEach(([a, b]) => { const r = msEl('div', 'ms'); r.appendChild(msEl('span', '', a)); r.appendChild(msEl('b', '', String(b))); st.appendChild(r); });
  box.appendChild(st); const say = msEl('small', 'mh', ''), mkBtn = (t, f) => { const b = msEl('button', '', t); b.addEventListener('click', f); return b; };
  const row1 = msEl('div', 'mrow'); row1.appendChild(mkBtn('RESET STATS', () => { STAT.t = STAT.w = STAT.l = STAT.h = STAT.p = 0; statSave(); msBuild(); })); box.appendChild(row1);
  box.appendChild(msEl('small', 'mh', 'THE SAVE CODE HOLDS YOUR MONEY, SKILLS, PROGRESS AND SETTINGS. COPY IT TO ANOTHER DEVICE AND LOAD IT THERE.'));
  const ta = msEl('textarea'); ta.rows = 2; ta.spellcheck = false; ta.setAttribute('aria-label', 'Code'); box.appendChild(ta); const row2 = msEl('div', 'mrow');
  const copy = t => { let ok = false; try { if (window.AndroidApp) { window.AndroidApp.copy(t); ok = true; } else { ta.select(); ok = document.execCommand('copy'); } } catch { ok = false; } say.textContent = ok ? 'COPIED' : 'COULD NOT COPY: SELECT THE CODE AND COPY IT BY HAND'; };
  row2.appendChild(mkBtn('SAVE CODE', () => { ta.value = bkMake(); say.textContent = 'CODE MADE. TAP COPY.'; }));
  row2.appendChild(mkBtn('SETTINGS CODE', () => { const j = JSON.stringify(SET); ta.value = 'JSET1.' + btoa(unescape(encodeURIComponent(j))) + '.' + hash32(j).toString(36); say.textContent = 'ONLY YOUR SETTINGS. TAP COPY.'; }));
  row2.appendChild(mkBtn('COPY', () => { if (!ta.value) ta.value = bkMake(); copy(ta.value); }));
  row2.appendChild(mkBtn('PASTE', () => { let t = ''; try { t = window.AndroidApp ? String(window.AndroidApp.paste() || '') : ''; } catch { t = ''; } const got = x => { ta.value = x; say.textContent = x ? 'PASTED. TAP LOAD.' : 'NOTHING TO PASTE'; }; if (t) got(t); else if (navigator.clipboard && navigator.clipboard.readText) navigator.clipboard.readText().then(got, () => got('')); else got(''); }));
  row2.appendChild(mkBtn('LOAD', () => {
    const code = ta.value.replace(/\s+/g, ''), m = /^JSET1\.([A-Za-z0-9+/=]+)\.([a-z0-9]+)$/.exec(code);
    if (m) { try { const j = decodeURIComponent(escape(atob(m[1]))); if (hash32(j).toString(36) !== m[2]) throw 0; const o = JSON.parse(j), ok = {}; for (const k in o) if (MSR[k]) { const v = msClamp(MSR[k], o[k]); if (v !== null) ok[k] = v; } msSet(ok); say.textContent = 'SETTINGS LOADED'; } catch { say.textContent = 'THAT SETTINGS CODE IS NOT VALID.'; } return; }
    const o = bkRead(code); if (!o) { say.textContent = 'THAT CODE IS NOT VALID. USE THE WHOLE CODE.'; return; }
    const n = performance.now(); if (n > msArm) { msArm = n + 5000; say.textContent = 'THIS REPLACES THE SAVE ON THIS DEVICE. TAP LOAD AGAIN TO GO ON.'; return; }
    try { const del = []; for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); if (bkOwn(k)) del.push(k); } del.forEach(k => localStorage.removeItem(k)); for (const k in o) localStorage.setItem(k, o[k]); location.reload(); } catch { say.textContent = 'COULD NOT SAVE ON THIS DEVICE'; }
  }));
  box.appendChild(row2); box.appendChild(say);
  const row3 = msEl('div', 'mrow'); row3.appendChild(mkBtn('RESET SETTINGS', () => { msSet(MSD); say.textContent = 'ALL SETTINGS ARE BACK TO THE DEFAULT.'; }));
  row3.appendChild(mkBtn('RESET ALL PROGRESS', () => {
    const n = performance.now(); if (n > msArm2) { msArm2 = n + 5000; say.textContent = 'THIS DELETES YOUR MONEY, SKILLS AND STORY SAVES. TAP AGAIN WITHIN 5 SECONDS TO DO IT.'; return; }
    try { const del = []; for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); if (bkOwn(k) && k !== 'js_set' && k !== 'js_vol' && k !== 'js_snd' && k !== 'js_gtest') del.push(k); } del.forEach(k => localStorage.removeItem(k)); location.reload(); } catch { say.textContent = 'COULD NOT DELETE'; }
  })); box.appendChild(row3);
}
function msPresets(box) {
  MS_PRE.forEach(([n, d, o]) => { const row = msEl('div', 'mr'), top = msEl('div', 'mt'), b = msEl('button', 'mb', 'APPLY'); top.appendChild(msEl('span', 'mn', n)); const c = msEl('div', 'mc'); c.appendChild(b); top.appendChild(c); row.appendChild(top); row.appendChild(msEl('small', 'mh', d)); b.addEventListener('click', () => { msSet(o); b.textContent = 'DONE'; setTimeout(() => { b.textContent = 'APPLY'; }, 900); }); box.appendChild(row); });
}
function msGq(box) {      // the quality presets (POTATO to ULTRA, CUSTOM when you changed an option) and the little live picture
  const bar = msEl('div', 'gq'), lab = msEl('small', 'mh', ''), pv = msEl('canvas', 'mpv'), btns = GFX_PRE.map(([n], i) => { const b = msEl('button', '', n); b.addEventListener('click', () => { gfxPreset(i); msBuild(); }); bar.appendChild(b); return b; });
  pv.width = 128; pv.height = 48; box.appendChild(bar); box.appendChild(lab); box.appendChild(pv); box.appendChild(msEl('small', 'mh', 'THE PICTURE SHOWS YOUR OPTIONS LIVE. HIGH IS HOW THE GAME CAME. ULTRA ADDS GLOW, TRAILS, SHADOWS AND MORE PARTICLES.'));
  const sync = () => { const q = gfxQ(); btns.forEach((b, i) => b.classList.toggle('sel', i === q)); lab.textContent = 'QUALITY: ' + (q < 5 ? GFX_PRE[q][0] : 'CUSTOM (YOU CHANGED AN OPTION)'); };
  msSyncs.push(sync); sync(); gfxPreview(pv);
}
function msGtools(box) {      // TEST MY PHONE, what the screen can do, and what the options cost
  const row = msEl('div', 'mrow'), test = msEl('button', '', 'TEST MY PHONE'), say = msEl('small', 'mh', ''), warn = msEl('small', 'mw', ''), note = msNote, info = () => { say.textContent = (note ? note + '\n' : '') + gfxInfo(); };
  test.addEventListener('click', () => gfxBench((id, hz) => { msNote = id < 0 ? 'TEST CANCELLED.' : 'THE TEST SAYS ' + GFX_PRE[id][0] + ' (SCREEN RATE ' + hz + ' HZ). IT IS SET: CHANGE IT ABOVE IF YOU LIKE.'; if (id >= 0) gfxBenchApply(id, false); msBuild(); }));
  row.appendChild(test); box.appendChild(row); box.appendChild(say); box.appendChild(warn); info(); msNote = '';
  const sync = () => { warn.textContent = gfxWarn().join('\n\n'); }; msSyncs.push(sync); sync();
  gfxMeasure(() => { if (say.isConnected) info(); });
}
function msCopyText(t) { try { if (window.AndroidApp) { window.AndroidApp.copy(t); return true; } const ta = document.createElement('textarea'); ta.value = t; ta.style.cssText = 'position:fixed;left:-9999px;top:0'; document.body.appendChild(ta); ta.select(); const ok = document.execCommand('copy'); ta.remove(); return ok; } catch { return false; } }
function errReport() {      // the text of COPY REPORT: what to send when something looked wrong
  const L = ['JUJUTSU SORCERERS ERROR REPORT', 'VERSION: ' + (($('ver') || {}).textContent || ''), 'WINDOW: ' + innerWidth + 'X' + innerHeight + '  SCREEN: ' + state, 'SETTINGS: ' + JSON.stringify(SET), 'ERRORS: ' + ERRS.length];
  ERRS.forEach(e => L.push('[' + e.d + ' UTC] ' + e.m + (e.w ? ' (' + e.w + ')' : '') + (e.n > 1 ? ' X' + e.n : ''))); return L.join('\n');
}
function msErrs(box) {      // v1.168 the errors the game ran into (ERRS in tools/template.html): the newest first, COPY REPORT and CLEAR
  box.appendChild(msEl('small', 'mh', 'THE GAME WRITES DOWN EVERY ERROR IT RUNS INTO AND KEEPS GOING. IF SOMETHING LOOKED WRONG, TAP COPY REPORT AND SEND IT.'));
  const st = msEl('div', 'mst'); [['VERSION', ($('ver') || {}).textContent || ''], ['ERRORS WRITTEN DOWN', ERRS.length]].forEach(([a, b]) => { const r = msEl('div', 'ms'); r.appendChild(msEl('span', '', a)); r.appendChild(msEl('b', '', String(b))); st.appendChild(r); }); box.appendChild(st);
  const say = msEl('small', 'mh', ''), row = msEl('div', 'mrow'), mk = (t, f) => { const b = msEl('button', '', t); b.addEventListener('click', f); return b; };
  row.appendChild(mk('COPY REPORT', () => { say.textContent = msCopyText(errReport()) ? 'COPIED' : 'COULD NOT COPY: THE LIST IS BELOW, COPY IT BY HAND'; }));
  row.appendChild(mk('CLEAR', () => { ERRS.length = 0; errSave(); msBuild(); })); box.appendChild(row); box.appendChild(say);
  if (!ERRS.length) box.appendChild(msEl('small', 'mh', 'NO ERRORS SO FAR.'));
  for (let i = ERRS.length - 1; i >= 0; i--) { const e = ERRS[i], r = msEl('div', 'mr'); r.appendChild(msEl('span', 'mn', e.m.toUpperCase())); r.appendChild(msEl('small', 'mh', e.d + ' UTC' + (e.w ? '  ' + e.w.toUpperCase() : '') + (e.n > 1 ? '  X' + e.n : ''))); box.appendChild(r); }
}
function msBuild() {
  const root = $('mset'), keep = root.querySelector('.mbody'), top = keep ? keep.scrollTop : 0; root.textContent = '';
  root.appendChild(msEl('h2', '', 'SETTINGS'));
  const bar = msEl('div', 'mbar'), q = msEl('input'); q.type = 'text'; q.placeholder = 'SEARCH AN OPTION'; q.value = msQ; q.maxLength = 24; q.setAttribute('aria-label', 'Search'); q.autocomplete = 'off'; q.autocapitalize = 'characters'; q.spellcheck = false;
  q.addEventListener('input', () => { msQ = q.value.toUpperCase(); const body = root.querySelector('.mbody'); msFill(body); }); bar.appendChild(q);
  const rp = msEl('button', '', 'RESET PAGE'); rp.addEventListener('click', () => { const o = {}; MSP[msPage].rows.forEach(r => { if (r.k) o[r.k] = MSD[r.k]; }); msSet(o); }); bar.appendChild(rp); root.appendChild(bar);
  const lay = msEl('div', 'mlay'), nav = msEl('div', 'mnav'), body = msEl('div', 'mbody');
  MSP.forEach((p, i) => { const b = msEl('button', i === msPage && !msQ ? 'sel' : '', p.n + (p.id === 'err' && ERRS.length ? ' ' + ERRS.length : '')); b.addEventListener('click', () => { msPage = i; msQ = ''; msBuild(); }); nav.appendChild(b); });
  lay.appendChild(nav); lay.appendChild(body); root.appendChild(lay);
  const br = msEl('div', 'row'), back = msEl('button', '', 'BACK'); back.addEventListener('click', msBack); br.appendChild(back); root.appendChild(br);
  msFill(body); body.scrollTop = top;
}
function msFill(body) {      // the options of the page, or of every page that has the words of the search
  body.textContent = ''; msSyncs.length = 0;
  if (msQ) {
    let n = 0; const seen = new Set();
    MSP.forEach(p => p.rows.forEach(r => { if (!r.k || seen.has(r.k) || !((r.n + ' ' + (r.h || '')).includes(msQ))) return; seen.add(r.k); body.appendChild(msRow(r)); n++; }));
    if (!n) body.appendChild(msEl('small', 'mh', 'NO OPTION HAS THOSE WORDS.'));
    return;
  }
  const p = MSP[msPage]; p.rows.forEach(r => { if (r.t === 'n') body.appendChild(msEl('small', 'mh', r.n)); else if (r.t === 'h') body.appendChild(msEl('div', 'mhd', r.n)); else if (r.t === 'gq') msGq(body); else if (r.t === 'gtools') msGtools(body); else if (r.t === 'snd') msSound(body); else if (r.t === 'data') msData(body); else if (r.t === 'err') msErrs(body); else if (r.t === 'pre') msPresets(body); else body.appendChild(msRow(r)); });
}
function msOpen(from) { msFrom = from; audio(); msQ = ''; msBuild(); show('mset'); }
function msBack() { show(msFrom); }
// ---------------------------------------------------------------- what the numbers do on the screen
const msCss = document.createElement('style');
msCss.textContent = '#mset.screen{z-index:6;justify-content:flex-start;gap:1vh;padding-top:calc(env(safe-area-inset-top) + 1.2vh);padding-bottom:calc(env(safe-area-inset-bottom) + 1.2vh)}#mset h2{flex:none}'
  + '#mset .mbar{flex:none;display:flex;gap:1.4vh;align-items:center;width:min(96vw,900px)}#mset .mbar input{flex:1;min-width:0;font:inherit;font-size:clamp(7px,1.9vh,11px);color:var(--ink);background:#120d22;border:3px solid var(--line);padding:1vh 1.4vh;outline:none;user-select:text;-webkit-user-select:text}'
  + '#mset .mlay{flex:1;min-height:0;display:flex;gap:1.6vh;width:min(96vw,900px)}#mset .mnav{flex:none;display:flex;flex-direction:column;gap:.8vh;overflow-y:auto;width:19%}#mset .mnav button{width:100%;padding:1vh .6vh;font-size:clamp(6px,1.8vh,10px)}'
  + '#mset .mnav button.sel{border-color:var(--acc);color:var(--acc)}#mset .mbody{flex:1;min-width:0;overflow-y:auto;display:flex;flex-direction:column;gap:1.1vh;text-align:left;padding-right:.8vh;-webkit-overflow-scrolling:touch}'
  + '#mset .mr{display:flex;flex-direction:column;gap:.4vh;padding:.9vh 1.2vh;background:rgba(255,255,255,.04);border-left:3px solid var(--line)}#mset .mt{display:flex;align-items:center;gap:1vh}#mset .mn{flex:1;font-size:clamp(7px,2.1vh,12px)}'
  + '#mset .mc{flex:none;display:flex;align-items:center;gap:1vh;font-size:clamp(7px,2vh,11px);color:var(--acc)}#mset .mc input{width:clamp(70px,26vh,240px);height:3vh;accent-color:var(--acc)}#mset .mc b{font-weight:normal;min-width:6ch;text-align:right}'
  + '#mset .mb{padding:.9vh 1.4vh;font-size:clamp(7px,1.9vh,11px);min-width:11ch}#mset .mx{flex:none;padding:.6vh .9vh;font-size:clamp(5px,1.5vh,9px);opacity:.7}#mset .mh{font-size:clamp(5px,1.6vh,9px);line-height:1.5;color:var(--dim)}'
  + '#mset .mst{display:grid;grid-template-columns:1fr 1fr;gap:.6vh 2vh;font-size:clamp(7px,2vh,11px)}#mset .ms{display:flex;justify-content:space-between;gap:1vh;padding:.5vh 1vh;background:rgba(255,255,255,.04)}#mset .ms b{font-weight:normal;color:var(--acc)}'
  + '#mset .mrow{display:flex;gap:1vh;flex-wrap:wrap}#mset textarea{width:100%;font:inherit;font-size:clamp(6px,1.6vh,9px);color:var(--ink);background:#120d22;border:3px solid var(--line);user-select:text;-webkit-user-select:text}'
  + '#msBtn{position:fixed;right:calc(env(safe-area-inset-right) + 2vh);top:calc(env(safe-area-inset-top) + 1.4vh);padding:1vh 1.6vh;font-size:clamp(7px,2vh,11px)}'
  + '#msScan{position:fixed;inset:0;z-index:3;pointer-events:none;display:none;background:repeating-linear-gradient(0deg,rgba(0,0,0,.5) 0 1px,transparent 1px 3px)}'
  + '#mset .gq{display:flex;gap:.8vh;flex-wrap:wrap}#mset .gq button{flex:1;min-width:8ch;padding:1vh .6vh;font-size:clamp(6px,1.8vh,10px)}#mset .gq button.sel{border-color:var(--acc);color:var(--acc)}'
  + '#mset .mpv{width:100%;max-width:min(320px,70vh);align-self:center;aspect-ratio:128/48;image-rendering:pixelated;border:3px solid var(--line);background:#0d0a17}#mset .mh{white-space:pre-wrap}'
  + '#mset .mhd{margin-top:1vh;padding-bottom:.4vh;border-bottom:2px solid var(--line);font-size:clamp(7px,2vh,11px);color:var(--acc)}#mset .mw{white-space:pre-wrap;font-size:clamp(5px,1.6vh,9px);line-height:1.6;color:#ffd34d}';
document.head.appendChild(msCss);
const msSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg'); msSvg.setAttribute('width', '0'); msSvg.setAttribute('height', '0'); msSvg.style.position = 'absolute'; msSvg.innerHTML = '<filter id="msCB" color-interpolation-filters="sRGB"><feColorMatrix id="msCBm" type="matrix" values="1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 1 0"/></filter>'; document.body.appendChild(msSvg);
const msScan = msEl('div'); msScan.id = 'msScan'; document.body.appendChild(msScan);
function msCbMatrix(mode) {      // colour-blind help: the colours the eye misses are moved into the ones it sees (an approximation of the usual "daltonize" method)
  const sim = [[[0.567, 0.433, 0], [0.558, 0.442, 0], [0, 0.242, 0.758]], [[0.625, 0.375, 0], [0.7, 0.3, 0], [0, 0.3, 0.7]], [[0.95, 0.05, 0], [0, 0.433, 0.567], [0, 0.475, 0.525]]][mode - 1];
  const sh = mode < 3 ? [[0, 0, 0], [0.7, 1, 0], [0.7, 0, 1]] : [[1, 0, 0.7], [0, 1, 0.7], [0, 0, 0]], out = [];
  for (let i = 0; i < 3; i++) { for (let j = 0; j < 3; j++) { let v = i === j ? 1 : 0; for (let k = 0; k < 3; k++) v += sh[i][k] * ((k === j ? 1 : 0) - sim[k][j]); out.push(v.toFixed(3)); } out.push('0 0'); }
  return out.join(' ') + ' 0 0 0 1 0';
}
function msApply() {
  const rs = document.documentElement.style, cv = $('game'), f = [];
  if (SET.th) rs.setProperty('--acc', MS_THEMES[SET.th][1]); else rs.removeProperty('--acc');
  if (SET.cb) { $('msCBm').setAttribute('values', msCbMatrix(SET.cb)); f.push('url(#msCB)'); }
  const hc = SET.hc ? 1 : 0; if (SET.br !== 100) f.push('brightness(' + SET.br / 100 + ')'); if (SET.ct !== 100 || hc) f.push('contrast(' + (SET.ct / 100 * (hc ? 1.2 : 1)).toFixed(2) + ')'); if (SET.sat !== 100 || hc) f.push('saturate(' + (SET.sat / 100 * (hc ? 1.15 : 1)).toFixed(2) + ')');
  cv.style.filter = f.join(' ');
  msScan.style.display = SET.scan ? 'block' : 'none'; msScan.style.opacity = SET.scan === 2 ? 0.55 : 0.25;
  if (window.__gfxReady) gfxApply();      // (the stats overlay, the frame rate request, the zoom, the effects of the GRAPHICS page)
}
$('msBtn').addEventListener('click', () => msOpen('title')); $('msModes').addEventListener('click', () => msOpen('modes'));
setInterval(() => { if (state === 'play' || state === 'story') { STAT.t++; if (STAT.t % 15 === 0) statSave(); } }, 1000);
window.__msReady = 1; msApply();
