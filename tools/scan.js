// ================================================================ v1.169 THE SCAN (SETTINGS > ERRORS > SCAN THE GAME)
// The game plays itself for about a minute, with the sound off, on a clock of its own (every frame is 50 ms on that clock, so it runs much faster than real life), and looks for: errors thrown by the code, numbers that are not
// numbers, effect lists that only grow, cutscenes that do not start or never end, screens whose text does not fit, and mistakes in the game's own tables (skills, settings, update log, element ids, sound names).
// DATA = the tables, MENUS = every screen, FIGHTERS = all 7 played at random (free play and versus), MOVES = every button x direction of every fighter, CUTSCENES = every FATALITY and DOMAIN, STORY = every chapter shot by shot (the SKIP button).
// Your saves are copied first (storage key jsscanbak) and put back when it is over, whatever happens (the top of the page also does it, if the scan was cut short); the page reloads at the end. The result is kept in jsscanres.
// How it takes the game over: tick() (tools/template.html) ignores the real animation frames while SCAN_ON is set, the scan calls tick() itself with its own time, performance.now() is its clock, and requestAnimationFrame does nothing.
const SC = { peak: {}, budget: 62000, cancel: false, t: 0, frames: 0, res: [], seen: new Map(), ok: 0, sec: '', say: '', cap: 0, hard: 0, part: false, yAt: 0, t0: 0, secT0: 0, done: 0, plan: 1, got: {}, of: {} };
const scReal = performance.now.bind(performance), SC_STEP = 50, SC_MINUTE = 62000;      // (SC_MINUTE: how long a scan takes, the last part of it fills what is left)
const scYield = () => new Promise(r => setTimeout(r, 0));
const SC_WHO = ['gojo', 'yuji', 'verity', 'cat', 'freddy', 'cu3', 'cu4'], SC_NAME = { gojo: 'GOJO', yuji: 'YUJI', verity: 'VERITY', cat: 'CAT', freddy: 'FREDDY', cu3: 'SUKUNA', cu4: 'RYU' };

// ---------------------------------------------------------------- the findings
function scNote(st, name, detail) {      // st = 'fail' (an error) or 'warn' (a note); the same finding again is counted, not listed
  const key = SC.sec + '|' + name + '|' + String(detail || '').slice(0, 80), o = SC.seen.get(key); if (o) { o.c++; return; }
  const r = { st, sec: SC.sec, n: String(name).slice(0, 120), d: String(detail || '').slice(0, 240), c: 1 }; SC.seen.set(key, r); if (SC.res.length < 80) SC.res.push(r);
}
const scPass = (n = 1) => { SC.ok += n; };
const scCov = (k, got, of) => { SC.got[k] = (SC.got[k] || 0) + got; SC.of[k] = (SC.of[k] || 0) + of; };      // what was covered: k = got of of
const scT = (cond, name, detail) => { if (cond) scPass(); else scNote('fail', name, detail); };
function scErr(e, what) {      // an exception: what it said and where the page threw it (line:column)
  const st = String(e && e.stack || ''), m = /\.html:(\d+):(\d+)/.exec(st);
  scNote('fail', (what ? what + ': ' : '') + String(e && e.message || e).slice(0, 100), m ? 'LINE ' + m[1] + ':' + m[2] : '');
}

// ---------------------------------------------------------------- the clock, the frames, the keys
function scTick(ms) {
  SC.t += ms || SC_STEP; if (paused) setPause(false);
  SCAN_STEP = true; try { tick(SC.t); } catch (e) { scErr(e, 'FRAME'); } SCAN_STEP = false; SC.frames++;
}
async function scFrames(n, per, ms) {      // n frames of the game; per(i) runs before each frame; false = the scan must stop (cancelled, or the time of this part is up)
  for (let i = 0; i < n; i++) {
    const now = scReal(); if (SC.cancel || now > SC.hard) return false; if (now > SC.cap) { SC.part = true; return false; }
    if (per) { try { per(i); } catch (e) { scErr(e, SC.say); } }
    scTick(ms); SC.done++;
    if (now - SC.yAt > 30) { SC.yAt = now; scUI(); await scYield(); }
  }
  return true;
}
async function scUntil(cond, max, ms) { for (let i = 0; i < max; i++) { if (cond()) return true; if (!(await scFrames(1, null, ms))) return false; } return cond(); }
const scIntro = () => scUntil(() => !vs || vs.ph !== 'intro', 40, 250);      // (the countdown before a fight: frames of 250 ms, nothing to find in it)
const scKey = (c, down) => window.dispatchEvent(new KeyboardEvent(down ? 'keydown' : 'keyup', { code: c, key: c === 'Space' ? ' ' : c.slice(0, 3) === 'Key' ? c.slice(3).toLowerCase() : c, bubbles: true }));
function scPlayer(seed) {      // a hand that plays at random: walks, jumps, crouches and presses every button
  let s = seed * 7919 + 13; const rnd = () => (s = (s * 1664525 + 1013904223) >>> 0) / 4294967296, up = [], KEYS = ['KeyJ', 'KeyJ', 'KeyJ', 'KeyJ', 'Space', 'KeyS', 'KeyK', 'KeyL', 'KeyL', 'KeyE', 'KeyV', 'KeyQ', 'KeyH', 'KeyC'], HOLDS = ['KeyD', 'KeyA', 'KeyB', 'KeyD']; let held = '', f = 0;
  return {
    step() {
      f++; for (let i = up.length - 1; i >= 0; i--) if (up[i][0] <= f) { scKey(up[i][1], false); up.splice(i, 1); }
      if (rnd() < 0.07) { if (held) scKey(held, false); held = rnd() < 0.2 ? '' : HOLDS[(rnd() * HOLDS.length) | 0]; if (held) scKey(held, true); }
      if (rnd() < 0.3) { const k = KEYS[(rnd() * KEYS.length) | 0]; scKey(k, true); up.push([f + 1 + ((rnd() * 4) | 0), k]); }
    },
    end() { if (held) scKey(held, false); held = ''; for (const u of up) scKey(u[1], false); up.length = 0; }
  };
}
const SC_LISTS = { sparks: () => sparks.length, smoke: () => smoke.length, popups: () => popups.length, deb: () => deb.length, lit: () => lit.length, cuVfx: () => cuVfx.length, cuShots: () => cuShots.length, tqFx: () => tqFx.length, gibs: () => gibs.length };      // (the effect lists of a fight; in 120000 frames the biggest was the sparks with 140, so 800 / 400 is far above anything normal, even with MANY particles)
function scCheck() {      // numbers that are not numbers, effect lists that only grow
  try {
    const bad = []; if (!Number.isFinite(wx)) bad.push('wx'); if (!Number.isFinite(wvx)) bad.push('wvx'); if (!Number.isFinite(ce)) bad.push('energy');
    if (vs && !Number.isFinite(vs.hp)) bad.push('his health'); if (dummy && !(Number.isFinite(dummy.x) && Number.isFinite(dummy.hp))) bad.push('the enemy');
    if (bad.length) scNote('fail', 'NOT A NUMBER: ' + bad.join(', '), SC.say); else scPass();
    for (const k in SC_LISTS) { let n = 0; try { n = SC_LISTS[k](); } catch { continue; } if (n > (SC.peak[k] || 0)) SC.peak[k] = n; if (n > (k === 'sparks' ? 800 : 400)) scNote('warn', 'THE LIST ' + k + ' HAS ' + n + ' ENTRIES', SC.say); }
  } catch (e) { scErr(e, 'CHECK'); }
}
const scBusy = () => !!(fat || yf || vf || cf || ke || dom || ult || js || yu || fd || (typeof suFatOn === 'function' && suFatOn()) || (typeof suDom !== 'undefined' && !!suDom) || (typeof ryUl !== 'undefined' && !!ryUl) || (typeof CU_GAME !== 'undefined' && !!((CU_GAME[3] && CU_GAME[3].cs) || (CU_GAME[4] && CU_GAME[4].cs))));      // a cutscene of a fight is running

// ---------------------------------------------------------------- DATA: the game's own tables
function scData() {
  SC.say = 'THE SKILL TREES'; const ids = new Set();
  for (const [t, bt, rows] of SK_TABS) {
    const lay = SK_LAY[t]; scT(!!lay && Array.isArray(lay._root), 'SKILL TREE ' + t + ': NO LAYOUT TABLE', 'SK_LAY'); scT(!!$(bt), 'SKILL TAB BUTTON ' + bt, 'NOT IN THE PAGE'); if (!lay) continue;
    const cell = id => lay[id] || null, cells = [];
    for (const r of rows) {
      const [id, nm, ds, pr, need] = r;
      scT(typeof id === 'string' && !ids.has(id), 'SKILL ID USED TWICE: ' + id, ''); ids.add(id);
      scT(typeof nm === 'string' && nm.length > 0 && typeof ds === 'string' && ds.length > 10, 'SKILL TEXT: ' + id, 'NAME OR TEXT MISSING');
      scT(Number.isFinite(pr) && pr >= 0, 'SKILL PRICE: ' + id, String(pr)); scT(Array.isArray(need) && need.every(x => SKI[x]), 'SKILL NEEDS A SKILL THAT DOES NOT EXIST: ' + id, String(need));
      const c = cell(id); scT(Array.isArray(c) && Number.isFinite(c[0]) && Number.isFinite(c[1]), 'SKILL HAS NO PLACE IN THE TREE (the page would crash): ' + id, 'ADD IT TO SK_LAY');
      if (c) cells.push({ id, c: c[0], r: c[1], need });
    }
    const at = Object.fromEntries(cells.map(x => [x.id, x]));      // a line runs from the right edge of what a node needs to its left edge: it must go right, and the cells between must be empty
    for (const a of cells) {
      for (const b of cells) if (a !== b && a.c === b.c && Math.abs(a.r - b.r) * 11 < 9.8) scNote('fail', 'TWO SKILLS ON THE SAME CELL: ' + a.id + ' / ' + b.id, 'TREE ' + t);
      for (const p of a.need.length ? a.need : []) {
        const pc = at[p]; if (!pc) continue; if (!(pc.c < a.c)) scNote('fail', 'A LINE GOES BACKWARDS: ' + p + ' > ' + a.id, 'TREE ' + t);
      }
    }
  }
  for (const tbl of [typeof GATE !== 'undefined' ? GATE : null, typeof SUK_GATE !== 'undefined' ? SUK_GATE : null]) if (tbl) for (const k in tbl) scT(!!SKI[tbl[k]] || typeof tbl[k] !== 'string', 'A BUTTON NEEDS A SKILL THAT DOES NOT EXIST: ' + k, String(tbl[k]));
  SC.say = 'THE SETTINGS TABLES';
  for (const p of MSP) for (const r of p.rows) if (r.k) { scT(r.k in MSD, 'SETTING WITHOUT A DEFAULT: ' + r.k, p.id); if (r.t === 't') scT(Array.isArray(r.a) && r.a.length > 1, 'SETTING WITHOUT CHOICES: ' + r.k, p.id); if (r.t === 'r') scT(r.a < r.b && r.c > 0, 'SETTING WITH A BAD RANGE: ' + r.k, p.id); }
  for (const [n, , o] of MS_PRE) for (const k in o) scT(k in MSD, 'PRESET ' + n + ' HAS AN UNKNOWN SETTING: ' + k, '');
  SC.say = 'THE UPDATE LOG'; scT(Array.isArray(LOG) && LOG.length > 0, 'UPDATE LOG', 'EMPTY');
  if (Array.isArray(LOG) && LOG.length) {
    scT('V' + LOG[0].v === (($('ver') || {}).textContent || ''), 'THE NEWEST UPDATE LOG ENTRY IS NOT THE VERSION ON THE TITLE SCREEN', 'LOG ' + LOG[0].v + ' / ' + (($('ver') || {}).textContent || ''));
    for (const e of LOG) { if (e && typeof e.h === 'string' && !e.v) continue; scT(!!e && typeof e.v === 'string' && typeof e.t === 'string' && Array.isArray(e.n) && e.n.every(x => typeof x === 'string'), 'UPDATE LOG ENTRY IS BROKEN: ' + (e && (e.v || e.h)), ''); }
    const cmp = (a, b) => { const x = a.split('.').map(Number), y = b.split('.').map(Number); for (let i = 0; i < Math.max(x.length, y.length); i++) { const d = (x[i] || 0) - (y[i] || 0); if (d) return d; } return 0; };
    const era = LOG.filter(e => e && /^1\.\d+$/.test(e.v || '')); for (let i = 1; i < era.length; i++) scT(cmp(era[i - 1].v, era[i].v) > 0, 'UPDATE LOG ORDER: ' + era[i].v + ' AFTER ' + era[i - 1].v, '');
  }
  SC.say = 'THE SAVES';
  try { const c = bkMake(); scT(!!bkRead(c), 'THE SAVE CODE DOES NOT READ BACK', ''); } catch (e) { scErr(e, 'SAVE CODE'); }
  const sv = loadSaves(); scT(Array.isArray(sv) && sv.length === 3, 'SAVE SLOTS', ''); scT(Number.isFinite(PROG.m) && PROG.m >= 0, 'MONEY IS NOT A NUMBER', String(PROG.m));
  for (const w of SC_WHO) scT(!!document.querySelector('#select .pp[data-who="' + w + '"]') || (w === 'gojo' && !!$('gojo')), 'NO FIGHTER CARD FOR ' + w, '');
  SC.say = 'THE CODE AGAINST THE PAGE';      // the page's own text: every call that names a page element by its id is for a thing that is in the page, every call that plays a sound names one that exists
  try {
    const src = [...document.scripts].reduce((a, b) => b.textContent.length > a.textContent.length ? b : a).textContent, miss = new Set(), re = /\$\('([A-Za-z][\w-]*)'\)/g; let m, n = 0;
    while ((m = re.exec(src))) { n++; if (!document.getElementById(m[1])) miss.add(m[1]); }
    scT(miss.size === 0, 'THE CODE ASKS FOR A PAGE ELEMENT THAT IS NOT THERE: ' + [...miss].slice(0, 6).join(', '), n + ' CALLS CHECKED'); if (!miss.size) scPass(n);
    if (sfx) { const bad = new Set(), r2 = /\bsnd\('([A-Za-z0-9:_]+)'/g; while ((m = r2.exec(src))) if (typeof sfx[m[1].split(':').pop()] !== 'function') bad.add(m[1]); scT(bad.size === 0, 'THE CODE PLAYS A SOUND THAT DOES NOT EXIST: ' + [...bad].slice(0, 6).join(', '), ''); }
  } catch (e) { scErr(e, 'PAGE TEXT'); }
  scCov('TABLES', 1, 1);
}

// ---------------------------------------------------------------- MENUS: every screen opens and its text fits (the same check as the screen tests)
function scAudit(root) {
  const out = [], vw = innerWidth, vh = innerHeight;
  const vis = e => { const cs = getComputedStyle(e); if (cs.display === 'none' || cs.visibility === 'hidden' || +cs.opacity === 0) return false; const r = e.getBoundingClientRect(); return r.width > 1 && r.height > 1; };
  const shown = e => { for (let n = e; n && n !== document.body; n = n.parentElement) if (!vis(n)) return false; return true; };
  const scrolls = e => { for (let n = e.parentElement; n; n = n.parentElement) { const o = getComputedStyle(n); if (/(auto|scroll)/.test(o.overflowX + o.overflowY)) return true; } return false; };
  const nm = e => (e.id ? '#' + e.id : e.tagName.toLowerCase() + (typeof e.className === 'string' && e.className ? '.' + e.className.trim().split(/\s+/)[0] : '')) + ':' + (e.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 18);
  const els = [...root.querySelectorAll('*')].filter(e => !e.closest('#scan, canvas') && shown(e)), rc = e => e.getBoundingClientRect();
  for (const e of els) {
    const r = rc(e), cs = getComputedStyle(e), txt = (e.textContent || '').trim();
    if (!scrolls(e) && (r.right > vw + 2 || r.bottom > vh + 2 || r.left < -2 || r.top < -2) && /^(BUTTON|LABEL|INPUT|SPAN|B|I|P|H1|H2|DIV)$/.test(e.tagName) && e.children.length < 6 && txt) out.push('OUTSIDE THE WINDOW ' + nm(e));
    if (txt && e.clientWidth > 0 && ((e.scrollWidth > e.clientWidth + 2 && /(hidden|clip)/.test(cs.overflowX)) || (e.scrollHeight > e.clientHeight + 2 && e.clientHeight > 0 && /(hidden|clip)/.test(cs.overflowY)))) out.push('TEXT CUT OFF ' + nm(e));
    if (e.children.length === 0 && txt) {
      const rg = document.createRange(); rg.selectNodeContents(e); const t = rg.getBoundingClientRect(), p = e.closest('button, .card, .nd, label'), q = p ? rc(p) : null;
      if (q && (t.right > q.right + 2 || t.left < q.left - 2 || t.bottom > q.bottom + 2 || t.top < q.top - 2)) out.push('TEXT OUT OF ITS BUTTON ' + nm(e));
    }
  }
  const bs = els.filter(e => (e.tagName === 'BUTTON' && !scrolls(e)) || e.matches('.card'));
  for (let i = 0; i < bs.length; i++) for (let j = i + 1; j < bs.length; j++) { const a = bs[i], b = bs[j]; if (a.contains(b) || b.contains(a)) continue; const x = rc(a), y = rc(b); if (Math.min(x.right, y.right) - Math.max(x.left, y.left) > 3 && Math.min(x.bottom, y.bottom) - Math.max(x.top, y.top) > 3) out.push('BUTTONS ON TOP OF EACH OTHER ' + nm(a) + ' / ' + nm(b)); }
  return out;
}
async function scMenus() {
  const click = (root, text) => { const b = [...document.querySelectorAll(root + ' button')].find(x => x.textContent.trim().toUpperCase().startsWith(text)); if (!b) throw new Error('NO BUTTON ' + text + ' IN ' + root); b.click(); };
  const look = async (name, root, open) => {
    SC.say = name; scCov('SCREENS', 0, 1); try { open(); } catch (e) { scErr(e, name); return; }
    await scFrames(4); const el = document.querySelector(root); if (!el || !vis0(el)) { scNote('fail', 'THE SCREEN DID NOT OPEN: ' + name, root); return; }
    const o = scAudit(el); for (const s of o.slice(0, 4)) scNote('warn', name + ': ' + s, innerWidth + 'X' + innerHeight); scPass(); scCov('SCREENS', 1, 0);
  };
  const vis0 = e => { const r = e.getBoundingClientRect(); return r.width > 1 && r.height > 1 && getComputedStyle(e).display !== 'none'; };
  SC.plan = 120; SC.done = 0; SC.sec = 'MENUS';
  await look('TITLE', '#title', () => show('title'));
  await look('MODES', '#modes', () => { show('title'); click('#title', 'TAP TO START'); });
  await look('STORY SAVES', '#saves', () => { show('modes'); $('story').click(); });
  await look('FIGHTER SELECT', '#select', () => { show('modes'); $('battles').click(); });
  await look('VERSUS SETUP', '#versus', () => click('#select', 'VERSUS'));
  await look('CHALLENGES', '#chal', () => { show('modes'); $('chalMode').click(); });
  await look('SKILLS', '#skills', () => { show('modes'); $('skillsMode').click(); });
  for (const [t, bt] of SK_TABS) await look('SKILLS ' + t.toUpperCase(), '#skills', () => $(bt).click());
  await look('WI-FI SETUP', '#lan', () => show('lan')); await look('WI-FI FIGHTER', '#lanSel', () => show('lansel'));
  await look('UPDATE LOG', '#ulog', () => { show('title'); $('logBtn').click(); }); await look('CODES', '#codes', () => { show('title'); $('codeBtn').click(); });
  await look('SETTINGS', '#mset', () => { show('title'); $('msBtn').click(); });
  for (let i = 0; i < MSP.length; i++) await look('SETTINGS PAGE ' + MSP[i].n, '#mset', () => { msPage = i; msBuild(); });
  for (let i = 0; i < 5; i++) await look('PAUSE SETTINGS TAB ' + (i + 1), '#settings', () => { show('modes'); $('settings').classList.add('on'); setTab(i); });
  $('settings').classList.remove('on'); show('title');
  await look('RESULT SCREEN', '#vsres', () => { show('modes'); $('vsres').classList.add('on'); }); $('vsres').classList.remove('on');
  await look('PAUSE SCREEN', '#pause', () => { show('modes'); $('pause').classList.add('on'); }); $('pause').classList.remove('on');
  show('title');
}

// ---------------------------------------------------------------- FIGHTERS: all 7, free play and versus, played at random
async function scSeg(label, start, frames, seed, hud) {      // one fight: start it, play it at random, check it, leave it; false = the scan must stop
  SC.say = label; const go = () => { try { start(); } catch (e) { scErr(e, label + ' START'); } }; go();
  if (state !== 'play') { scNote('fail', 'THE FIGHT DID NOT START: ' + label, 'STATE ' + state); return true; }
  if (!(await scIntro())) { show('title'); return false; }
  const p = scPlayer(seed); let over = 0, shot = false;
  const ok = await scFrames(frames, i => {
    p.step(); if (i % 6 === 0) scCheck();
    if (hud && !shot && i === 40) { shot = true; for (const s of scAudit(document.body).slice(0, 4)) scNote('warn', label + ': ' + s, innerWidth + 'X' + innerHeight); }
    if (state !== 'play') { scNote('warn', 'THE FIGHT LEFT THE FIGHT SCREEN BY ITSELF: ' + label, 'STATE ' + state); go(); }
    else if (vs && vs.ph === 'over' && ++over > 50) { over = 0; go(); }
  });
  p.end(); scCheck(); show('title'); return ok;
}
async function scRound(r) {      // one round of random fights: every fighter in free play and in a versus match; round 0 is the pass every scan makes, the later rounds use the time that is left (other enemies, behaviours, GRAPHIC DAMAGE settings, grades)
  const FOE = ['yuji', 'verity', 'cat', 'freddy', 'gojo'];
  for (let i = 0; i < SC_WHO.length; i++) {
    const w = SC_WHO[i], f1 = w === 'yuji' && !r ? 'cat' : FOE[(i + r) % 5], f2 = FOE[(i + 2 * r + 1) % 5], n = (i + r) % 3;
    if (!(await scSeg(SC_NAME[w] + ' IN FREE PLAY' + (r ? ' (ROUND ' + (r + 1) + ')' : ''), () => { SET.gore = n; Object.assign(TR, { beh: [1, 2, 4, 5, 3][(i + r) % 5], ehp: n, php: 0, pce: 0 }); startPractice(w, f1); }, r ? 220 : 100, i + 1 + r * 17, !r))) return false;
    if (!(await scSeg(SC_NAME[w] + ' AGAINST ' + (SC_NAME[f2] || f2.toUpperCase()) + (r ? ' (ROUND ' + (r + 1) + ')' : ''), () => { SET.gore = (n + 1) % 3; vsPick.me = w; vsPick.foe = f2; startMatch(r ? (i + r) % 4 : 2); }, r ? 300 : 160, i + 31 + r * 17))) return false;
    if (!r) scCov('FIGHTERS', 1, 0);
  }
  return true;
}
async function scFighters() { SC.sec = 'FIGHTERS'; scCov('FIGHTERS', 0, SC_WHO.length); SC.plan = SC_WHO.length * 280; SC.done = 0; await scRound(0); }
async function scMore() {      // the time that is left of the minute: more random fights
  SC.sec = 'MORE FIGHTS'; SC.plan = 1e9; let r = 1; while (await scRound(r)) { r++; scCov('ROUNDS', 1, 0); }
}

// ---------------------------------------------------------------- MOVES: every button in every direction, one at a time, against an enemy who stands still
async function scMoves() {
  SC.sec = 'MOVES'; const DIRS = [['', 'STANDING'], ['KeyD', 'FORWARD'], ['KeyA', 'BACK'], ['KeyS', 'CROUCHING'], ['Space', 'JUMPING']], BTN = [['KeyJ', 'ATTACK'], ['KeyL', 'BLUE'], ['KeyK', 'DASH']];
  const V = []; for (const [d, dn] of DIRS) for (const [k, kn] of BTN) V.push([d, k, 0, dn + ' ' + kn]); V.push(['', 'KeyJ', 1, 'HOLD ATTACK'], ['KeyD', 'KeyJ', 1, 'FORWARD HOLD ATTACK'], ['', 'KeyE', 0, 'CURSED ENERGY'], ['', 'KeyQ', 0, 'SENSE'], ['', 'KeyB', 1, 'BLOCK']);
  scCov('MOVES', 0, SC_WHO.length * V.length + V.length - 1); SC.plan = SC_WHO.length * (V.length * 20 + 30); SC.done = 0;
  for (let i = 0; i < SC_WHO.length; i++) {
    const w = SC_WHO[i]; SC.say = SC_NAME[w] + ' START'; SET.gore = 0;
    try { Object.assign(TR, { beh: 0, ehp: 1, php: 0, pce: 0, put: 2 }); startPractice(w, 'gojo'); } catch (e) { scErr(e, SC_NAME[w] + ' START'); continue; }
    if (!(await scUntil(() => !!vs && vs.ph === 'fight', 40, 250))) { if (SC.cancel || scReal() > SC.cap) return; scNote('fail', 'THE FIGHT NEVER BEGAN: ' + SC_NAME[w], 'FREE PLAY'); continue; }
    await scFrames(2, null, 600);
    for (const gbm of (w === 'cu4' ? [false, true] : [false])) {      // (Ryu twice: the second time with his GRANITE BLAST mode on, v1.170)
      if (gbm) { scKey('KeyE', true); await scFrames(2); scKey('KeyE', false); await scFrames(4); }
      for (const [d, k, hold, nm] of (gbm ? V.filter(v => v[1] !== 'KeyE') : V)) {
        SC.say = SC_NAME[w] + (gbm ? ' (GRANITE MODE)' : '') + ': ' + nm;
        try { trainReset(); TR.put = 2; trainPut(); if (d) scKey(d, true); } catch (e) { scErr(e, SC.say); }
        if (d === 'Space') { await scFrames(5); scKey(d, false); await scFrames(2); }
        scKey(k, true); const a = await scFrames(hold ? 18 : 2); scKey(k, false); const b = a && await scFrames(hold ? 6 : 10);
        if (d && d !== 'Space') scKey(d, false); const c = b && await scFrames(3); scCheck();
        if (!c) { for (const x of ['KeyD', 'KeyA', 'KeyS', 'Space', 'KeyJ', 'KeyL', 'KeyK', 'KeyE', 'KeyQ', 'KeyB']) scKey(x, false); show('title'); return; }
        scCov('MOVES', 1, 0);
      }

    }
    show('title');
  }
}

// ---------------------------------------------------------------- CUTSCENES: the FATALITY and the DOMAIN of every fighter, played to the end
async function scCuts() {
  SC.sec = 'CUTSCENES'; const FATAL = { gojo: 1, yuji: 1, verity: 1, cat: 1, freddy: 0, cu3: 1, cu4: 0 };
  scCov('CUTSCENES', 0, SC_WHO.length * 2); SC.plan = SC_WHO.length * 2 * 220; SC.done = 0;
  for (let i = 0; i < SC_WHO.length; i++) {
    const w = SC_WHO[i];
    for (const [key, nm, low, max] of [['KeyH', 'FATALITY', 2, 700], ['KeyV', 'DOMAIN', 1, 520]]) {
      const label = SC_NAME[w] + ' ' + nm; SC.say = label; SET.gore = i % 3;
      try { Object.assign(TR, { beh: 2, ehp: low, php: 0, pce: 0, put: 2 }); startPractice(w, w === 'gojo' ? 'yuji' : 'gojo'); } catch (e) { scErr(e, label); continue; }
      if (!(await scUntil(() => !!vs && vs.ph === 'fight', 40, 250))) { if (SC.cancel || scReal() > SC.cap) return; continue; }
      await scFrames(2, null, 600); try { trainPut(); } catch (e) { scErr(e, label); }
      scKey(key, true); await scFrames(2); scKey(key, false);
      let started = false, calm = 0, ended = false, n = 0;
      while (n < max) {
        if (!(await scFrames(1))) { show('title'); return; } n++;
        if (n % 8 === 0) scCheck();
        if (scBusy()) { started = true; calm = 0; } else if (started && ++calm > 20) { ended = true; break; }
        if (!started && n > 90) break;
      }
      scCov('CUTSCENES', 1, 0); if (started) scPass(); else if ((key === 'KeyH' ? FATAL[w] : 1)) scNote('warn', label + ' DID NOT START', 'THE ENEMY WAS AT ' + (dummy ? Math.round(dummy.hp / (dummy.max || 1) * 100) : '?') + '% HEALTH, ' + (dummy ? Math.round(Math.abs(dummy.x - wx)) : '?') + ' PX AWAY');
      if (started && !ended) scNote('warn', label + ' DID NOT END IN ' + Math.round(max * SC_STEP / 1000) + ' SECONDS', '');
      show('title');
    }
  }
}

// ---------------------------------------------------------------- STORY: every scene shot by shot, with the SKIP button
function scSkipTap() {      // a tap on the SKIP button in the top right corner
  const r = cv.getBoundingClientRect(), o = { clientX: r.left + r.width * (VW - 21) / VW, clientY: r.top + r.height * 8 / VH, pointerId: 1, bubbles: true };
  window.dispatchEvent(new PointerEvent('pointerdown', o)); window.dispatchEvent(new PointerEvent('pointerup', o));
}
async function scStory() {
  SC.sec = 'STORY'; const SCENES = [['CH 1 THE ALLEY', () => startStory(0, 1)], ['CH 1 PART 2 THE HALL', () => startChapter2(0)], ['THE TRAINING', () => startTraining(0)], ['THE MASTER', () => { startStory(0, 1); startMaster(pnow()); }], ['THE REPORT', () => { startStory(0, 1); startOutro(pnow()); }], ['CH 2 THE PORTAL', () => startStory(0, 2)], ['CH 3 THE GENERAL', () => startStory(0, 3)], ['CH 4 THE VESSEL', () => startStory(0, 4)]];
  scCov('SCENES', 0, SCENES.length); SC.plan = SCENES.length * 200; SC.done = 0; const T = () => (typeof c4x !== 'undefined' && c4x ? c4x.T : story ? story.T : -1), inScene = () => state === 'story' || (typeof c4x !== 'undefined' && !!c4x);
  for (const [name, start] of SCENES) {
    if (SC_ONLY.scenes && !SC_ONLY.scenes.some(x => name.includes(x))) continue;
    SC.say = name; show('title'); try { SET.gore = 0; start(); } catch (e) { scErr(e, name + ' START'); continue; }
    if (!(await scFrames(16))) { show('title'); return; }
    let stuck = 0, p = null, pre = 4;      // (pre: frames of a shot before its SKIP; a run of short shots gets fewer)
    for (let k = 0; k < 150 && inScene(); k++) {
      const C = typeof c4x !== 'undefined' ? c4x : null;
      if (C && C.F && C.F.ph === 'go') {      // chapter 4's fight: played for a moment, then won (there is no SKIP in it)
        if (!p) p = scPlayer(77); const a = await scFrames(90, () => p.step()); p.end(); if (!a) { show('title'); return; } try { c4xWin(pnow()); } catch (e) { scErr(e, name + ' THE FIGHT'); } await scFrames(10); continue;
      }
      if (!(await scFrames(pre))) { show('title'); return; }
      if (C && !['cut', 'ranos', 'ny'].includes(C.ph)) continue;      // (a part with no SKIP: it goes on by itself)
      if (story && state === 'story' && !storySkipOn()) { scSkipTap(); if (!(await scFrames(40))) { show('title'); return; } continue; }      // (a card that uses the taps itself, e.g. the how-to-play card of chapter 3: a tap after its first 1.8 s closes it)
      const t0 = T(), s0 = C ? C.ph : ''; scSkipTap(); if (!(await scFrames(2))) { show('title'); return; }
      const C2 = typeof c4x !== 'undefined' ? c4x : null; pre = T() - t0 < 1.2 ? 2 : 4;
      if (inScene() && (C2 ? C2.ph : '') === s0 && !(T() > t0 + 0.25)) { if (++stuck === 2 && !(await scFrames(60))) { show('title'); return; } if (stuck >= 4) { scNote('warn', name + ': THE SKIP BUTTON DOES NOTHING', 'AT ' + T().toFixed(1) + ' S'); break; } } else stuck = 0;      // (the last shot has nothing to skip to: it ends by itself, so two taps in a row that did nothing are followed by a wait)
      if (k % 6 === 5) scCheck();
    }
    if (state === 'play' && story && story.battle) { const q = scPlayer(5), ok = await scFrames(100, () => q.step()); q.end(); scCheck(); if (!ok) { show('title'); return; } }
    scCov('SCENES', 1, 0); scPass();
  }
  show('title');
}

// ---------------------------------------------------------------- the run
let SC_ONLY = {};      // (for the tests: { sec: ['STORY'], scenes: ['CH 4'] })
// ---------------------------------------------------------------- SKYSCRAPER (v1.173): three fighters fight in the 50-floor building and the scan makes its things happen: a slam through the floors, a fall, a blast, a ceiling broken, glass broken and a fall to the street
async function scTower() {
  SC.sec = 'SKYSCRAPER'; scCov('TOWER', 0, 3); SC.plan = 3 * 440; SC.done = 0; const keep = twPick; twPick = 1;
  try {
    for (const [w, seed] of [['cu4', 11], ['gojo', 12], ['yuji', 13]]) {
      const label = SC_NAME[w] + ' IN THE SKYSCRAPER'; SC.say = label;
      try { Object.assign(TR, { beh: 1, ehp: 0, php: 0, pce: 0 }); startPractice(w, 'cat'); } catch (e) { scErr(e, label + ' START'); continue; }
      if (state !== 'play' || !twOn()) { scNote('fail', 'THE SKYSCRAPER DID NOT START: ' + label, 'STATE ' + state); show('title'); continue; }
      if (!(await scIntro())) { show('title'); return; }
      const p = scPlayer(seed), ev = [[30, () => twSlam('foe', 2, pnow(), dummy.x)], [90, () => { if (twOn() && dummy) twFoeHere(pnow()); }], [110, () => twMeFall(1, pnow(), wx)], [150, () => { const F = twFloorData(vs.tw.fMe); const o = { k: 'gas', x: Math.round(wx + 40), hp: 18, mx: 18, wob: 0, hitAt: -9999 }; F.objs.push(o); twDamageObj(F, o, 99, pnow()); }], [190, () => twCeiling('foe', 1, pnow(), dummy.x)], [235, () => { if (twOn() && dummy) twFoeHere(pnow()); }], [250, () => twFallOut('foe', pnow(), 1)],
        [60, () => { const F = twFloorData(vs.tw.fMe), d = F.doors.find(q => q.k === 'elev'); if (d) twDoorHit(F, d, 45, pnow()); }],      // (v1.175 the elevator: a hard hit jams a door (OUT OF ORDER) ...)
        [270, () => { const T = vs.tw; if (T.cab) return; const F = twFloorData(T.fMe), d = F.doors.find(q => q.k === 'elev'); if (!d) return; d.st = 0; d.hp = 70; wx = d.x; T.px = wx; twCabEnter(F, d, pnow()); }],      // (... you step into one: the cab, the panel, a ride, an emergency stop, another ride)
        [300, () => { const T = vs.tw; if (T.cab) twCabPick(T.fMe > 20 ? T.fMe - 9 : T.fMe + 11, pnow()); }],
        [335, () => { const T = vs.tw; if (T.cab && T.cab.ph === 'ride') twCabStop(pnow()); }],
        [350, () => { const T = vs.tw; if (T.cab) twCabPick(T.fMe > 30 ? T.fMe - 4 : T.fMe + 6, pnow()); }],
        [420, () => { const T = vs.tw; if (T.cab) { if (T.cab.ph === 'in') twCabLeave(pnow()); } else { const F = twFloorData(T.fMe), d = F.doors.find(q => q.k === 'elev'); if (d) twDoorHit(F, d, 200, pnow()); } }]];      // (and a blast tears a door out: the shaft is open)
      const ok = await scFrames(440, i => {
        p.step(); if (i % 6 === 0) scCheck();
        for (const [at, fn] of ev) if (i === at) { try { if (twOn() && vs.ph === 'fight') fn(); } catch (e) { scErr(e, label + ' EVENT ' + at); } }
        if (state !== 'play') { scNote('warn', 'THE FIGHT LEFT THE FIGHT SCREEN BY ITSELF: ' + label, 'STATE ' + state); }
      });
      p.end(); scCheck(); scCov('TOWER', 1, 0); show('title'); if (!ok) return;
    }
  } finally { twPick = keep; }
}

const SC_SEC = [['DATA', 3, async () => { SC.sec = 'DATA'; scData(); await scFrames(1); }], ['MENUS', 15, scMenus], ['FIGHTERS', 30, scFighters], ['MOVES', 40, scMoves], ['CUTSCENES', 40, scCuts], ['STORY', 45, scStory], ['SKYSCRAPER', 14, scTower], ['MORE FIGHTS', 0, scMore]];      // [name, seconds it may take at most (the last one takes what is left of the minute)]
const scEl = document.createElement('section'); scEl.id = 'scan'; scEl.className = 'screen';
scEl.innerHTML = '<h2>SCANNING THE GAME</h2><div id="scBar"><i id="scFill"></i></div><small id="scTxt"></small><small id="scLive"></small><small>YOUR SAVES ARE SAFE: THEY WERE COPIED FIRST AND ARE PUT BACK WHEN THE SCAN IS OVER.</small><button id="scCancel">CANCEL</button>';
document.body.appendChild(scEl);
const scCss = document.createElement('style');
scCss.textContent = '#scan.screen{z-index:40;background:#0d0a17;gap:2.2vh}#scBar{width:min(80vw,140vh);height:3.4vh;border:3px solid var(--line);background:#120d22;padding:2px}#scFill{display:block;height:100%;width:0;background:var(--acc)}#scTxt{font-size:clamp(8px,2.3vh,13px);color:var(--ink)}#scLive{font-size:clamp(6px,1.8vh,10px);color:var(--dim);line-height:1.7;white-space:pre-line}#scan small{max-width:90vw}';
document.head.appendChild(scCss);
$('scCancel').addEventListener('click', () => { SC.cancel = true; $('scCancel').textContent = 'STOPPING...'; });
function scUI() {
  const n = k => SC.res.filter(r => r.st === k).length;
  $('scFill').style.width = Math.min(99, (scReal() - SC.t0) / SC.budget * 100).toFixed(1) + '%';      // (the bar is the minute: the parts that take longer than planned just make it wait at the end) $('scTxt').textContent = SC.sec + ': ' + SC.say;
  $('scLive').textContent = 'TIME ' + Math.round((scReal() - SC.t0) / 1000) + ' S   FRAMES ' + SC.frames + '\nERRORS ' + n('fail') + '   NOTES ' + n('warn');
}
async function scRun(opts) {      // opts.noReload = for the tests: no reload at the end, the result is returned
  if (SCAN_ON) return null; opts = opts || {}; SC_ONLY = opts.only || {}; SC.budget = opts.budget || SC_MINUTE;
  try { const o = {}; for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); if (k !== 'jsscanbak' && k !== 'jsscanres') o[k] = localStorage.getItem(k); } localStorage.setItem('jsscanbak', JSON.stringify(o)); } catch { return { fail: 1, msg: 'COULD NOT COPY YOUR SAVES: THE SCAN WAS NOT STARTED' }; }
  Object.assign(SC, { cancel: false, frames: 0, res: [], seen: new Map(), ok: 0, got: {}, of: {}, t0: scReal(), t: scReal(), part: false, yAt: 0 }); SC.hard = SC.t0 + SC.budget * 2.1;
  const raf = window.requestAnimationFrame, play = window.HTMLMediaElement.prototype.play, vib = navigator.vibrate, snd0 = soundOn, ap = SET.ap, hap = SET.hap, partial = [], times = [];
  SCAN_ON = true; SCAN_HOOK = (m, w) => scNote('fail', 'ERROR: ' + m, w); window.requestAnimationFrame = () => 0; window.HTMLMediaElement.prototype.play = () => Promise.resolve(); try { navigator.vibrate = () => false; } catch { /* cannot be replaced */ }
  let clock = true; try { performance.now = () => SC.t; } catch { clock = false; }
  try { window.__suAll = true; for (const k of Object.keys(SKN)) PROG.own[k] = true; for (const k in SKI) PROG.own[k] = true; } catch (e) { scErr(e, 'SKILLS'); }
  soundOn = false; if (sfx) sfx.setOn(false); SET.ap = 0; SET.hap = 0; releaseAll(); $('scan').classList.add('on'); $('scCancel').textContent = 'CANCEL'; $('scCancel').style.display = '';
  try {
    if (!clock) throw new Error('THIS BROWSER WILL NOT LET THE SCAN SET ITS OWN CLOCK');
    for (const [name, secs, fn] of SC_SEC) {
      if (SC_ONLY.sec && !SC_ONLY.sec.includes(name)) continue;
      if (SC.cancel || scReal() > SC.hard) { partial.push(name + ' (NOT RUN)'); continue; }
      if (name === 'MORE FIGHTS' && scReal() > SC.t0 + SC.budget - 3000) continue;
      Object.assign(SC, { sec: name, say: '', secT0: scReal(), cap: secs ? scReal() + secs * 1000 : SC.t0 + SC.budget, part: false, done: 0, plan: 1 }); scUI();
      const f0 = SC.frames; try { await fn(); } catch (e) { scErr(e, name); }
      times.push(name + ' ' + Math.round((scReal() - SC.secT0) / 100) / 10 + 'S/' + (SC.frames - f0) + 'F');
      if (SC.part && secs) partial.push(name);
    }
  } catch (e) { scErr(e, 'SCAN'); }
  finally {
    try { show('title'); } catch (e) { scErr(e, 'END'); }
    SCAN_ON = false; SCAN_HOOK = null; SCAN_STEP = false; window.requestAnimationFrame = raf; window.HTMLMediaElement.prototype.play = play; try { navigator.vibrate = vib; } catch { /* not replaced */ } try { delete performance.now; } catch { /* kept */ }
    soundOn = snd0; SET.ap = ap; SET.hap = hap; $('scan').classList.remove('on');
  }
  const rep = { at: new Date().toISOString().slice(0, 16).replace('T', ' '), v: ($('ver') || {}).textContent || '', s: Math.round((scReal() - SC.t0) / 1000), frames: SC.frames, ok: SC.ok, fail: SC.res.filter(r => r.st === 'fail').length, warn: SC.res.filter(r => r.st === 'warn').length, cancelled: SC.cancel, partial, times, peak: SC.peak, cov: scCovText(), win: innerWidth + 'X' + innerHeight, res: SC.res, fresh: true };
  scRestoreSaves(); try { localStorage.setItem('jsscanres', JSON.stringify(rep)); } catch { /* storage blocked */ }
  if (opts.noReload) { requestAnimationFrame(tick); return rep; }
  location.reload(); return rep;
}
window.__scanRun = scRun;

// ---------------------------------------------------------------- what the ERRORS page shows
const SC_COVN = { TABLES: 'THE TABLES', SCREENS: 'SCREENS', FIGHTERS: 'FIGHTERS', MOVES: 'MOVES', CUTSCENES: 'FATALITIES AND DOMAINS', TOWER: 'SKYSCRAPER FIGHTS', SCENES: 'STORY SCENES', ROUNDS: 'EXTRA ROUNDS OF 14 FIGHTS' };
const scCovText = () => Object.keys(SC.got).concat(Object.keys(SC.of)).filter((k, i, a) => a.indexOf(k) === i).map(k => k === 'ROUNDS' ? 'EXTRA ROUNDS OF 14 FIGHTS ' + SC.got[k] : (SC_COVN[k] || k) + ' ' + (SC.got[k] || 0) + '/' + SC.of[k]);      // (what was covered, of what there is)
const scLast = () => { try { const r = JSON.parse(localStorage.getItem('jsscanres') || 'null'); return r && Array.isArray(r.res) ? r : null; } catch { return null; } };
function scReport(r) {      // the text of COPY SCAN REPORT
  const L = ['JUJUTSU SORCERERS SCAN REPORT', r.v + '  ' + r.at + ' UTC  WINDOW ' + r.win, 'TOOK ' + r.s + ' S, ' + r.frames + ' FRAMES, ' + r.ok + ' CHECKS PASSED, ' + r.fail + ' ERRORS, ' + r.warn + ' NOTES' + (r.cancelled ? ', CANCELLED' : '')];
  if (r.partial.length) L.push('NOT FINISHED (TIME): ' + r.partial.join(', ')); L.push('COVERED: ' + r.cov.join('; '));
  for (const f of r.res) L.push((f.st === 'fail' ? 'ERROR ' : 'NOTE ') + '[' + f.sec + '] ' + f.n + (f.d ? ' (' + f.d + ')' : '') + (f.c > 1 ? ' X' + f.c : '')); return L.join('\n');
}
function scPage(box) {      // the top of the ERRORS page
  box.appendChild(msEl('div', 'mhd', 'SCAN THE GAME'));
  box.appendChild(msEl('small', 'mh', 'THE GAME PLAYS ITSELF FOR ABOUT A MINUTE, WITH THE SOUND OFF, AND LOOKS FOR ERRORS: EVERY SCREEN, ALL 7 FIGHTERS, EVERY BUTTON, EVERY FATALITY AND DOMAIN, EVERY STORY SCENE, AND THE GAME\'S OWN TABLES. YOUR SAVES ARE COPIED FIRST AND PUT BACK. IT CAN FIND ERRORS AND BROKEN NUMBERS, IT CANNOT SEE IF SOMETHING JUST LOOKS WRONG, AND IT CANNOT PROVE THAT THERE IS NO BUG.'));
  const row = msEl('div', 'mrow'), go = msEl('button', '', 'START THE SCAN'), say = msEl('small', 'mh', ''); go.addEventListener('click', () => { if (!SC_OK) { say.textContent = 'THE SCAN CANNOT RUN IN THIS BROWSER.'; return; } scRun().then(r => { if (r && r.msg) say.textContent = r.msg; }); }); row.appendChild(go);
  const r = scLast(); if (r) { const cp = msEl('button', '', 'COPY SCAN REPORT'); cp.addEventListener('click', () => { say.textContent = msCopyText(scReport(r)) ? 'COPIED' : 'COULD NOT COPY: THE LIST IS BELOW'; }); row.appendChild(cp); }
  box.appendChild(row); box.appendChild(say);
  if (!r) return;
  const st = msEl('div', 'mst'); [['LAST SCAN', r.at + ' UTC'], ['VERSION', r.v], ['TOOK', r.s + ' SECONDS'], ['CHECKS PASSED', r.ok], ['ERRORS FOUND', r.fail], ['NOTES', r.warn]].forEach(([a, b]) => { const e = msEl('div', 'ms'); e.appendChild(msEl('span', '', a)); const v = msEl('b', '', String(b)); if (a === 'ERRORS FOUND') v.style.color = b ? '#ff6a7a' : '#8dff9a'; e.appendChild(v); st.appendChild(e); }); box.appendChild(st);
  box.appendChild(msEl('small', 'mh', (r.cancelled ? 'THE SCAN WAS CANCELLED. ' : '') + (r.partial.length ? 'NOT FINISHED, THE TIME OF THESE PARTS RAN OUT: ' + r.partial.join(', ') + '. ' : '') + 'COVERED: ' + r.cov.join(', ') + '.'));
  if (!r.res.length && !r.cancelled) box.appendChild(msEl('small', 'mh', 'NO ERRORS AND NO NOTES. EVERYTHING THE SCAN PLAYED WORKED.'));
  for (const f of r.res) { const e = msEl('div', 'mr'); e.appendChild(msEl('span', 'mn', (f.st === 'fail' ? 'ERROR: ' : 'NOTE: ') + f.n.toUpperCase())); e.appendChild(msEl('small', 'mh', f.sec + (f.d ? '  ' + f.d.toUpperCase() : '') + (f.c > 1 ? '  X' + f.c : ''))); if (f.st === 'fail') e.style.borderLeftColor = '#ff3347'; box.appendChild(e); }
}
const SC_OK = (() => { try { const d = Object.getOwnPropertyDescriptor(window.Performance.prototype, 'now'); return !!d && (d.writable || d.configurable); } catch { return false; } })();
// after the reload that ends a scan: the result is shown (once)
{ const r = scLast(); if (r && r.fresh) { r.fresh = false; try { localStorage.setItem('jsscanres', JSON.stringify(r)); } catch { /* storage blocked */ } setTimeout(() => { msPage = MSP.findIndex(p => p.id === 'err'); msFrom = 'title'; msQ = ''; msBuild(); show('mset'); }, 500); } }
