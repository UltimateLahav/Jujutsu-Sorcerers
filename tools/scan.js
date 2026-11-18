// ================================================================ v1.169 THE SCAN (SETTINGS > ERRORS > SCAN THE GAME)
// The game plays itself for about a minute, with the sound off, on a clock of its own (every frame is 50 ms on that clock, so it runs much faster than real life), and looks for: errors thrown by the code, numbers that are not
// numbers, effect lists that only grow, cutscenes that do not start or never end, screens whose text does not fit, and mistakes in the game's own tables (skills, settings, update log, element ids, sound names).
// DATA = the tables, MENUS = every screen, FIGHTERS = all 7 played at random (free play and versus), MOVES = every button x direction of every fighter, CUTSCENES = every FATALITY and DOMAIN, STORY = every chapter shot by shot (the SKIP button).
// Your saves are copied first (storage key jsscanbak) and put back when it is over, whatever happens (the top of the page also does it, if the scan was cut short); the page reloads at the end. The result is kept in jsscanres.
// How it takes the game over: tick() (tools/template.html) ignores the real animation frames while SCAN_ON is set, the scan calls tick() itself with its own time, performance.now() is its clock, and requestAnimationFrame does nothing.
const SC = { expect: null, peak: {}, budget: 62000, cancel: false, t: 0, frames: 0, res: [], seen: new Map(), ok: 0, sec: '', say: '', cap: 0, hard: 0, part: false, yAt: 0, t0: 0, secT0: 0, done: 0, plan: 1, got: {}, of: {} };
const scReal = performance.now.bind(performance), SC_STEP = 50, SC_MINUTE = 62000;      // (SC_MINUTE: how long a scan takes, the last part of it fills what is left)
const scYield = () => new Promise(r => setTimeout(r, 0));
const SC_WHO = ['gojo', 'yuji', 'verity', 'cat', 'freddy', 'cu3', 'cu4'], SC_NAME = { gojo: 'GOJO', yuji: 'YUJI', verity: 'VERITY', cat: 'CAT', freddy: 'FREDDY', cu3: 'SUKUNA', cu4: 'RYU', cu5: 'IRON MAN' };

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
  SCAN_STEP = true; try { tick(SC.t); } catch (e) { if (SC.expect === null) scErr(e, 'FRAME'); else SC.expect++; } SCAN_STEP = false; SC.frames++;      // (SC.expect: a number while a check makes frames throw on purpose, they are counted and not listed)
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
    if (vs && vs.tw) { if (vs.tw.fl && vs.tw.fl[0]) scNote('fail', 'THE STREET WAS MADE INTO A FLOOR OF THE BUILDING (FLOOR 0)', SC.say); if (vs.tw.on && (vs.map === 'tower') === !!vs.tw.out) scNote('fail', 'THE BUILDING AND THE MAP DISAGREE ABOUT WHERE HE IS', SC.say + ': MAP ' + vs.map + ', OUT ' + vs.tw.out); }      // (v1.198 the city: the street is never a floor, and the map says tower exactly when he is not out)
    for (const k in SC_LISTS) { let n = 0; try { n = SC_LISTS[k](); } catch { continue; } if (n > (SC.peak[k] || 0)) SC.peak[k] = n; if (n > (k === 'sparks' ? 800 : 400)) scNote('warn', 'THE LIST ' + k + ' HAS ' + n + ' ENTRIES', SC.say); }
  } catch (e) { scErr(e, 'CHECK'); }
}
const scBusy = () => !!(fat || yf || vf || cf || ff || ryf || ke || dom || ult || js || yu || fd || (typeof suFatOn === 'function' && suFatOn()) || (typeof suDom !== 'undefined' && !!suDom) || (typeof ryUl !== 'undefined' && !!ryUl) || (typeof CU_GAME !== 'undefined' && !!((CU_GAME[3] && CU_GAME[3].cs) || (CU_GAME[4] && CU_GAME[4].cs))));      // a cutscene of a fight is running

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
  for (const w of SC_WHO.concat('cu5')) scT(!!document.querySelector('#fsGrid .fst[data-who="' + w + '"]'), 'NO FIGHTER FACE FOR ' + w, '');      // (v1.180 the faces of the fighter screen)
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
  const look = async (name, root, open, wait) => {
    SC.say = name; scCov('SCREENS', 0, 1); try { open(); } catch (e) { scErr(e, name); return; }
    await scFrames(4); if (wait) await new Promise(r => setTimeout(r, wait));      // (wait: a screen with a slide-in is looked at once it has come to rest)
    const el = document.querySelector(root); if (!el || !vis0(el)) { scNote('fail', 'THE SCREEN DID NOT OPEN: ' + name, root); return; }
    const o = scAudit(el); for (const s of o.slice(0, 4)) scNote('warn', name + ': ' + s, innerWidth + 'X' + innerHeight); scPass(); scCov('SCREENS', 1, 0);
  };
  const vis0 = e => { const r = e.getBoundingClientRect(); return r.width > 1 && r.height > 1 && getComputedStyle(e).display !== 'none'; };
  SC.plan = 120; SC.done = 0; SC.sec = 'MENUS';
  await look('TITLE', '#title', () => show('title'));
  await look('MODES', '#modes', () => { show('title'); click('#title', 'TAP TO START'); });
  await look('STORY SAVES', '#saves', () => { show('modes'); $('story').click(); });
  await look('BATTLES', '#bsel', () => { show('modes'); $('battles').click(); });
  await look('TRAINING FIGHTERS', '#fsel', () => $('bsTrain').click());
  await look('TRAINING ENEMY', '#fsel', () => $('fsOk').click());
  await look('TRAINING MAP', '#msel', () => $('fsOk').click());
  await look('BATTLE FIGHTERS', '#fsel', () => { show('bsel'); $('bsBattle').click(); });
  await look('BATTLE ENEMY', '#fsel', () => $('fsOk').click());
  await look('BATTLE MAP', '#msel', () => $('fsOk').click());
  await look('VS SPLASH', '#vsplash', () => $('mpGo').click(), 800);
  await look('CHALLENGES', '#chal', () => { show('modes'); $('chalMode').click(); });
  await look('SKILLS', '#skills', () => { show('modes'); $('skillsMode').click(); });
  for (const [t, bt] of SK_TABS) await look('SKILLS ' + t.toUpperCase(), '#skills', () => $(bt).click());
  { const a0 = PROG.ach; PROG.ach = {}; await look('ACHIEVEMENTS', '#ach', () => { show('modes'); $('achMode').click(); }); PROG.ach = { jto: 1, cool: 1, jarvis: 1 }; await look('ACHIEVEMENTS, ALL EARNED', '#ach', () => { show('modes'); $('achMode').click(); }); PROG.ach = a0; }      // (v1.210)
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
  const FOE = ['yuji', 'verity', 'cat', 'freddy', 'gojo', 'cu3', 'cu4', 'cu5'];      // (v1.189 Sukuna and Ryu fight on both sides; v1.208 Iron Man is an enemy too)
  for (let i = 0; i < SC_WHO.length; i++) {
    const w = SC_WHO[i], f1 = w === 'yuji' && !r ? 'cat' : FOE[(i + r) % FOE.length], f2 = FOE[(i + 2 * r + 1) % FOE.length], n = (i + r) % 3;
    if (!(await scSeg(SC_NAME[w] + ' IN FREE PLAY' + (r ? ' (ROUND ' + (r + 1) + ')' : ''), () => { SET.gore = n; Object.assign(TR, { beh: [1, 2, 4, 5, 3][(i + r) % 5], ehp: n, php: 0, pce: 0 }); startPractice(w, f1); }, r ? 220 : 100, i + 1 + r * 17, !r))) return false;
    if (!(await scSeg(SC_NAME[w] + ' AGAINST ' + (SC_NAME[f2] || f2.toUpperCase()) + (r ? ' (ROUND ' + (r + 1) + ')' : ''), () => { SET.gore = (n + 1) % 3; vsPick.me = w; vsPick.foe = f2; startMatch(r ? (i + r) % 4 : 2); }, r ? 300 : 160, i + 31 + r * 17))) return false;
    if (!r) scCov('FIGHTERS', 1, 0);
  }
  return true;
}
async function scFighters() {
  SC.sec = 'FIGHTERS'; scCov('FIGHTERS', 0, SC_WHO.length + 3); SC.plan = (SC_WHO.length + 3) * 280; SC.done = 0; if (!(await scRound(0))) return;
  if (!(await scSeg('IRON MAN IN FREE PLAY', () => { SET.gore = 0; Object.assign(TR, { beh: 1, ehp: 0, php: 1, pce: 0 }); startPractice('cu5', 'gojo'); }, 100, 77))) return;      // (v1.190 Iron Man: walks and jumps in Training, nothing else; the enemy fights back and his health is normal, so he is hit and knocked out too)
  scCov('FIGHTERS', 1, 0);
  if (!(await scSeg('IRON MAN AS THE ENEMY IN FREE PLAY', () => { SET.gore = 1; Object.assign(TR, { beh: 1, ehp: 0, php: 0, pce: 0 }); startPractice('gojo', 'cu5'); }, 100, 78))) return;      // (v1.208 the enemy Iron Man fights back: his chain, his bolts, his uppercut, his UNIBEAM)
  scCov('FIGHTERS', 1, 0);
  if (!(await scSeg('RYU AGAINST IRON MAN', () => { SET.gore = 2; vsPick.me = 'cu4'; vsPick.foe = 'cu5'; startMatch(2); }, 160, 79))) return;
  scCov('FIGHTERS', 1, 0);
}
async function scMore() {      // the time that is left of the minute: more random fights
  SC.sec = 'MORE FIGHTS'; SC.plan = 1e9; let r = 1; while (await scRound(r)) { r++; scCov('ROUNDS', 1, 0); }
}

// ---------------------------------------------------------------- MOVES: every button in every direction, one at a time, against an enemy who stands still
async function scMoves() {
  SC.sec = 'MOVES'; const DIRS = [['', 'STANDING'], ['KeyD', 'FORWARD'], ['KeyA', 'BACK'], ['KeyS', 'CROUCHING'], ['Space', 'JUMPING']], BTN = [['KeyJ', 'ATTACK'], ['KeyL', 'BLUE'], ['KeyK', 'DASH']];
  const V = []; for (const [d, dn] of DIRS) for (const [k, kn] of BTN) V.push([d, k, 0, dn + ' ' + kn]); V.push(['', 'KeyJ', 1, 'HOLD ATTACK'], ['KeyD', 'KeyJ', 1, 'FORWARD HOLD ATTACK'], ['', 'KeyE', 0, 'CURSED ENERGY'], ['', 'KeyQ', 0, 'SENSE'], ['', 'KeyB', 1, 'BLOCK']);
  scCov('MOVES', 0, SC_WHO.length * V.length + V.length - 1 + SC_IR_N + SC_RY_N); SC.plan = SC_WHO.length * (V.length * 20 + 30) + (SC_IR_N + SC_RY_N) * 40; SC.done = 0;
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
  await scIronMoves(); await scRyuTurned();
}
// v1.205 RYU IS DRAWN TURNED OVER (tools/ryu_parts.py: the whole figure, not a flipped picture): he looks as in the updated image, face, chest and long front leg towards the enemy on his right, his guard on his back side, and every blow swings at the enemy; the numbers of his body and of his blows are measured on these pictures. Nine checks: every row of his sheet is complete (15 pictures, each with a figure in it); his guard is on his back side at the height of his chest; the tip of every punch is the rows of the arm (his long front foot is no part of a punch: with it in the tip the foot touched the enemy first and the fist stopped 10 - 25 px short, a punch at the air); every blow still reaches an enemy 60 px away with its step in; a blow of his hits an enemy 50 px in front of him; the beam of every blast of the hair cannon starts in front of him; the hair cannon of JUST THIS ONCE is in front of him; the pictures of JUST THIS ONCE keep his body where the stance has it (no jump sideways when it starts); and a live blast leaves the hair on his right.
const SC_RY_N = 9;
async function scRyuTurned() {
  const ok = (c, what, d) => { scT(c, 'RYU: ' + what, d || ''); scCov('MOVES', 1, 0); };
  const set = (me, foe) => { try { Object.assign(TR, { beh: 0, ehp: 1, php: 0, pce: 0, put: 2 }); startPractice(me, foe); return true; } catch (e) { scErr(e, 'RYU TURNED START'); return false; } };
  const alpha = c => { const d = c.getContext('2d').getImageData(0, 0, 64, 64).data, cols = [], mid = []; let n = 0; for (let y = 0; y < 64; y++) for (let x = 0; x < 64; x++) if (d[(y * 64 + x) * 4 + 3] > 127) { n++; cols.push(x); if (y >= 24 && y < 44) mid.push(x); } const s = mid.length >= 40 ? mid : cols; return { n, torso: s.length ? s.sort((p, q) => p - q)[s.length >> 1] : -1 }; };      // (how many pixels a picture has, and the middle column of his torso: the middle of what is there in rows 24 - 43, or of the whole picture when little is there)
  if (!set('cu4', 'gojo') || !(await scUntil(() => !!vs && vs.ph === 'fight', 40, 250))) return; await scFrames(2, null, 600);
  SC.say = 'RYU: TURNED OVER'; const g = CU_GAME[4], rows = [];
  for (const k of ['frames', 'walk', 'wbk', 'jump', 'hu', 'ko', 'bl', 'df', 'db', 'cr', 'ci', 'cwk']) if ((g[k] || []).length) rows.push([k, g[k]]);
  Object.keys(g.hus || {}).forEach(k => g.hus[k] && g.hus[k].f && rows.push(['hus.' + k, g.hus[k].f])); g.atk.forEach((a, k) => rows.push(['atk' + k, a])); Object.keys(g.ulr).forEach(k => rows.push(['ulr.' + k, g.ulr[k]]));
  const bad = []; let pics = 0; for (const [k, a] of rows) { if (a.length < 15) bad.push(k + ' HAS ' + a.length); for (const c of a) { pics++; if (c.width !== 64 || c.height !== 64 || alpha(c).n < 150) { bad.push(k + ' EMPTY OR NOT 64 x 64'); break; } } }
  ok(RYU_ROWS.length === 40 && rows.length >= 40 && pics >= 600 && !bad.length, 'A ROW OF HIS SHEET IS NOT COMPLETE: ' + rows.length + ' ROWS, ' + pics + ' PICTURES', bad.slice(0, 4).join(', '));
  { const b = [20, 24, 28].map(k => g.body[k]).filter(Boolean); ok(b.length === 3 && b.every(q => -q[0] >= q[1] + 8), 'HIS GUARD IS NOT ON HIS BACK SIDE AT THE HEIGHT OF HIS CHEST (BODY ROWS 20 / 24 / 28: ' + JSON.stringify(b) + ')'); }      // (turned over, his arms in front of his face are on the side he has his back to: his body reaches 8 px or more further to his back than to his front there)
  { const w = [], P = new Set([0, 1, 3, 6, 8]); g.ev.forEach((l, k) => { let n = 0; l.forEach(e => { if (e.k !== 'i' || !e.tip) return; const punch = k === 10 ? n !== 3 : P.has(k); n++; const low = Math.max(...Object.keys(e.tip).map(Number)); if (punch && low > 46) w.push(RY_MV[k].n + (k === 10 ? ' ' + n : '') + ' reaches row ' + low); }); }); ok(w.length === 0, 'A PUNCH OF HIS COUNTS HIS PLANTED FOOT AS PART OF THE BLOW, SO THE MAGNET STOPS WHEN THE FOOT TOUCHES THE ENEMY AND THE FIST STAYS SHORT OF HIM: ' + w.join(', ')); }      // (the tip of a punch is the rows of the arm: above row 47; his long front foot is not a weapon)
  { const w = [], B = hbBody('gojo'); g.ev.forEach((l, k) => { if (g.set[k].nm) return; let n = 0; l.forEach(e => { if (e.k !== 'i' || !e.tip) return; n++; const r = hbGap(e.tip, B, 0) + (e.cl || RY_CLOSE); if (!(r >= 60)) w.push(RY_MV[k].n + (k === 10 ? ' ' + n : '') + ' ' + r); }); }); ok(w.length === 0, 'A BLOW OF HIS REACHES AN ENEMY LESS THAN 60 PX AWAY EVEN WITH ITS STEP IN (HIPS APART, PX): ' + w.join(', ')); }      // (where the limb touches Gojo, hbGap, plus how far he steps in for it: every blow reached 62 - 69 px before v1.205, and still does)
  trainReset(); TR.put = 2; trainPut(); await scFrames(10); dummy.x = wx + 50; hits.n = 0; hits.dmg = 0; hits.seq = 0; hits.until = 0; scKey('KeyJ', true); await scFrames(2); scKey('KeyJ', false); await scFrames(16);
  ok(hits.n > 0, 'HIS BLOW DID NOT HIT THE ENEMY STANDING 50 PX IN FRONT OF HIM: HITS ' + hits.n + ', DAMAGE ' + hits.dmg);
  { const w = []; for (const k of Object.keys(RY_GBS)) { const r = RY_MV[k].r; RY_GBS[k].forEach(sp => { if (sp.aim && sp.aim[1] < 0) return; const T = RY_GB[r] && RY_GB[r][sp.f - 1]; if (!T || !(T[0] - 32 >= 8)) w.push(r + '/' + sp.f + ': ' + (T ? T[0] - 32 : '-')); }); } ok(w.length === 0, 'THE BEAM OF A BLAST STARTS BEHIND OR AT HIS BODY, NOT IN FRONT OF HIM (HAIR TIP MINUS HIS MIDDLE, PX): ' + w.join(', ')); }      // (the third beam of the TRIPLE BLAST goes up from his head, tipped back: it is left out)
  { const w = []; for (const r of ['u2', 'u3']) (RY_GB[r] || []).forEach((T, i) => { const x = T[0] - 32 - ((RY_JU[r] || [])[i] || 0); if (!(x >= 12)) w.push(r + '/' + (i + 1) + ': ' + x); }); ok(w.length === 0 && (RY_GB.u2 || []).length === 15, 'THE HAIR CANNON OF JUST THIS ONCE IS NOT IN FRONT OF HIM (HAIR TIP MINUS HIS MIDDLE, PX): ' + w.join(', ')); }
  { const idle = g.frames.map(c => alpha(c).torso).sort((p, q) => p - q)[7], w = []; for (const r of Object.keys(g.ulr)) g.ulr[r].forEach((c, i) => { const d = alpha(c).torso - ((RY_JU[r] || [])[i] || 0) - idle; if (Math.abs(d) > 5) w.push(r + '/' + (i + 1) + ': ' + d); }); ok(w.length === 0, 'A PICTURE OF JUST THIS ONCE PUTS HIS TORSO MORE THAN 5 PX FROM WHERE THE STANCE HAS IT (PX): ' + w.join(', ')); }
  trainReset(); TR.put = 2; trainPut(); await scFrames(10); dummy.x = wx + 50; if (!ryGb) ryToggle(pnow()); window.__ryLog = []; scKey('KeyJ', true); await scFrames(2); scKey('KeyJ', false);
  let ox = null, hx = null; for (let i = 0; i < 60 && (ox === null || hx === null); i++) { await scFrames(1); const b = window.__ryGb().beams[0]; if (b && ox === null) ox = b.ox; if (window.__ryLog.length && hx === null) hx = window.__ryLog[0].ox; }
  delete window.__ryLog; ok(ox !== null && hx !== null && ox >= 8 && hx >= 8, 'A LIVE BLAST DID NOT LEAVE THE HAIR ON HIS RIGHT (BEAM ORIGIN MINUS HIS MIDDLE, PX): DRAWN ' + ox + ', WHERE IT HITS ' + hx); ryReset(); await scFrames(30);      // (the beam is drawn from the hair as it moves, and hits from where it started: both are on his right)
  show('title');
}
// ---------------------------------------------------------------- ADMIN: the box of the training (v1.206, tools/admin.js)
// The ADMIN button of the top bar opens a small box with the moves of the enemy who is there. Checks: the button shows and the box opens; each of the 8 enemies has the list he should have (AD_EXP); a click on a move that is no cutscene starts it, it ends by itself, and nothing else starts after it while FREEZE is on (the first version let the Cat go on from SMASH into his whole chain: the frame in which the clicked move ends was open to his own brain); the big ones (FINISHER, ULTIMATE, JUMPSCARE, NIGHTMARE, SHRINE, JUST THIS ONCE, UNIBEAM) start, end, and the training goes on with the box open; FREEZE holds his own brain still and lets it go; the TOOLS (HEAL, INF HP, CLOSE / MID / FAR, ENEMY) do what they say; the X closes the box; and a Battle has neither the button nor the box. The enemy is a Special Grade one, so that a stray move after the clicked one is as likely as it gets.
const AD_EXP = {
  gojo: 'R.HOOK,L.HOOK,ELBOW,KICK,BLOCK,DODGE,FINISHER',
  yuji: 'R.HOOK,L.HOOK,KNEE,3 KICKS,DIVERGENT,R.KICK,ELBOW,DOWNSLAM,PUSH KICK,CONC.FIST,SWEEP,RUSH FIST,UPPERCUT,FACE KICK,SPIN ELBOW,POWER UP,POWER OFF,BLOCK,DODGE',
  verity: 'R.HOOK,L.HOOK,ELBOW,KICK,BITE,LOW CLAW,JUMPSCARE,BLOCK,DODGE,FINISHER',
  cat: 'GRAB,PUNCH,GRAB 2,KICK,SMASH,PUSH DASH,CARTOON,ULTIMATE,BLOCK,DODGE,FINISHER',
  freddy: 'R.SLASH,L.SLASH,FAR L.PUNCH,FAR R.PUNCH,BOILING WATER,PIERCE,GROUND SLAM,NIGHTMARE,BLOCK,DODGE,FINISHER',
  cu3: 'R.JAB,L.JAB,FACE KICK,COUNTER,R.JAB 2,L.UPPR,R.SLASH,L.SLASH,X SLASH,R.HOOK,L.HOOK,ELBOW,AIR CUT,FIRE ARROW,SHRINE,BLOCK,DODGE',
  cu4: 'L.HOOK,R.HOOK,KICK UP,JUMP PUNCH,LEG KICK,DOWNSLAM,HARD PUNCH,FRONT KICK,POWER PUNCH,DIVE PUNCH,5-HIT COMBO,DASH KICK,KI BLAST,JUST ONCE,FINISHER,BLOCK,DODGE',
  cu5: 'R.HOOK,L.HOOK,R.KICK,PUNCH,UPPERCUT,DOWNSLAM,LOW JABS,BACKFLIP,R.BLAST,L.BLAST,CHARGE,BLAST,LASER,SPIN BLAST,GROUND PUNCH,BEAR HUG,UNIBEAM,BLOCK,DODGE'
};
const AD_BIG = ['FINISHER', 'ULTIMATE', 'JUMPSCARE', 'NIGHTMARE', 'SHRINE', 'JUST ONCE', 'UNIBEAM'], SC_AD_N = 45, AD_WHO = SC_WHO.concat('cu5');      // (1 button + 8 x 3 lists and moves + 11 big moves (v1.212: the enemy Ryu's FINISHER is one) + 2 FREEZE + 4 tools + 1 X + 1 closed box + 1 Battle; v1.208 Iron Man is the eighth enemy)
async function scAdmin() {      // (every enemy decides at once when he can: GRADES.aggr is 1 for the length of the checks, so that a stray move after a clicked one is certain, not a matter of luck)
  const aggr0 = GRADES.map(g => g.aggr), tr0 = {}, gore0 = SET.gore; for (const k of ['beh', 'ehp', 'php', 'pce', 'grade', 'foe', 'arm', 'spd', 'meter', 'info', 'put']) tr0[k] = TR[k]; GRADES.forEach(g => { g.aggr = 1; });
  try { await scAdmin1(); } finally { GRADES.forEach((g, i) => { g.aggr = aggr0[i]; }); Object.assign(TR, tr0); SET.gore = gore0; ADM.open = false; ADM.freeze = true; ADM.ceBack = 0; }      // (everything the checks changed is put back: the Special Grade and the enemy of the TRAIN page, the graphic damage, the aggression of the grades, and the box is closed again: in a game the frames of the menus close it, here the next section starts a room at once, and an open box would hold its enemy still)
}
async function scAdmin1() {
  SC.sec = 'ADMIN'; scCov('ADMIN', 0, SC_AD_N); SC.plan = 2600; SC.done = 0; SET.gore = 2;
  const ok = (c, what, d) => { scT(c, 'ADMIN: ' + what, d || ''); scCov('ADMIN', 1, 0); }, A = () => window.__adm(), busy = () => admBusy(dummy, pnow()) || scBusy(), stop = () => SC.cancel || scReal() > SC.cap;
  const act = () => !!dummy && (['attack', 'walk', 'block', 'dodge', 'power'].includes(dummy.ai) || !!dummy.fa || !!dummy.cact || !!dummy.vact), click = id => { try { $(id).click(); } catch (e) { scErr(e, 'ADMIN ' + id); } };
  const room = async (f, w) => {      // a fresh training room against enemy f, the box open, FREEZE on, his list built
    try { Object.assign(TR, { beh: 0, ehp: 1, php: 0, pce: 0, put: 2, grade: 5, foe: w }); startPractice('gojo', f); } catch (e) { scErr(e, 'ADMIN START ' + f); return false; }
    if (!(await scUntil(() => !!vs && vs.ph === 'fight', 40, 250))) return false; await scFrames(2, null, 600);
    if (!A().open) click('admBtn'); if (!A().freeze) click('admF');
    return scUntil(() => A().key === f && A().moves.length > 0 && A().open && A().freeze, 40, 250);
  };
  for (let w = 0; w < AD_WHO.length; w++) {
    const f = AD_WHO[w], nm = SC_NAME[f]; SC.say = nm + ': THE LIST';
    if (!(await room(f, w))) { if (stop()) return; scNote('fail', 'ADMIN: THE BOX DID NOT OPEN IN THE TRAINING AGAINST ' + nm, 'KEY ' + A().key + ', MOVES ' + A().moves.length + ', ON ' + A().on); continue; }
    if (w === 0) ok($('admBtn').style.display !== 'none' && A().open && getComputedStyle($('adm')).display !== 'none', 'THE ADMIN BUTTON DID NOT SHOW OR THE BOX DID NOT OPEN IN THE TRAINING');
    const L = A().moves, lost = [], stray = []; ok(L.join(',') === AD_EXP[f], nm + ': HIS LIST OF MOVES IS NOT THE ONE IT SHOULD BE', L.join(','));
    for (let i = 0; i < L.length; i++) {
      const n = L[i]; if (AD_BIG.includes(n)) continue; SC.say = nm + ': ' + n;
      try { trainReset(); dummy.x = wx + 20; if (f === 'yuji') { dummy.ceNext = 0; if (n !== 'POWER OFF') dummy.ce = false; } } catch (e) { scErr(e, SC.say); }      // (Yuji's own wish to power up is due: it shows if his brain runs for a frame after the clicked move)
      if (!(await scFrames(1, null, 100))) return;
      try { $('admL').children[i].click(); } catch (e) { scErr(e, SC.say); }
      const res = A().res; if (res !== 'OK' || !(n === 'POWER OFF' ? !dummy.ce : busy())) { lost.push(n + (res !== 'OK' ? ' (' + res + ')' : ' NOT STARTED')); continue; }
      const seen = new Set(), look = () => { const d = dummy; for (const o of [d.fa, d.cact, d.vact]) if (o) seen.add(o); if (['attack', 'power', 'block', 'dodge'].includes(d.ai)) seen.add(d.ai + d.aiAt); }; look();      // (every move he starts leaves its own mark: a swing its start time, a special its own object; a move that is clicked leaves one, and a second one is a move that nobody asked for. His UPPERCUT goes on into the FACE KICK and his SWEEP into the 3 KICKS, as they do in a fight: two)
      let k = 0; while (busy() && k++ < 40) { if (!(await scFrames(1, null, 100))) return; look(); } if (busy()) { lost.push(n + ' NEVER ENDS'); continue; }
      if (!(await scFrames(6, null, 100))) return; look(); if (busy() || seen.size > (n === 'UPPERCUT' || n === 'SWEEP' ? 2 : 1)) stray.push(n + ' x' + seen.size);
    }
    ok(!lost.length, nm + ': A MOVE OF THE BOX DID NOT START OR DID NOT END', lost.join(', ')); ok(!stray.length, nm + ': ANOTHER MOVE STARTED AFTER THE ONE THAT WAS CLICKED (FREEZE IS ON)', stray.join(', ')); scCheck();
    for (const n of L.filter(q => AD_BIG.includes(q))) {
      SC.say = nm + ': ' + n; if (!(await room(f, w))) { if (stop()) return; continue; }
      try { dummy.x = wx + 20; $('admL').children[A().moves.indexOf(n)].click(); } catch (e) { scErr(e, SC.say); }
      const started = A().res === 'OK' && (busy() || await scUntil(busy, 12, 100)), ended = started && await scUntil(() => !busy(), 700, 250);      // (the longest is Gojo's finisher: 15 s, 60 frames of 250 ms)
      if (started && !ended && stop()) return; const goes = ended && await scUntil(() => !!vs && vs.ph === 'fight' && dummy.ko < 0 && state === 'play', 80, 250);
      ok(started && ended && goes && A().open, nm + ' ' + n + ': ' + (!started ? 'THE BIG MOVE DID NOT START (' + A().res + ')' : !ended ? 'IT DID NOT END IN 175 SECONDS' : 'THE TRAINING DID NOT GO ON AFTER IT, OR THE BOX CLOSED'), 'PHASE ' + (vs && vs.ph)); scCheck();
    }
    show('title');
  }
  SC.say = 'FREEZE AND THE TOOLS'; if (await room('yuji', 1)) {      // FIGHTS BACK, so that only FREEZE keeps him still
    TR.beh = 1; trainUI(); dummy.x = wx + 20; let n = 0; for (let i = 0; i < 40; i++) { if (!(await scFrames(1, null, 100))) return; if (act()) n++; }
    ok(n === 0, 'YUJI MOVED OR STRUCK WITH THE BOX OPEN AND FREEZE ON (HIS BEHAVIOUR IS FIGHTS BACK)', n + ' OF 40 FRAMES'); click('admF'); n = 0;
    for (let i = 0; i < 100 && !n; i++) { if (!(await scFrames(1, null, 100))) return; if (act()) n++; } ok(n > 0, 'YUJI DID NOT FIGHT BACK IN 10 SECONDS WITH FREEZE OFF', ''); click('admF'); TR.beh = 0; trainUI();
    click('admT1'); await scFrames(2, null, 100); const gaps = []; for (const id of ['admP2', 'admP0', 'admP1']) { click(id); gaps.push(Math.round(dummy.x - wx)); }      // (read at once: after a frame you may have moved yourself, he may have slid)
    ok(gaps.join() === '130,28,70', 'THE DISTANCE BUTTONS DID NOT PUT HIM 130, 28 AND 70 PX AWAY', gaps.join());
    TR.ehp = 0; trainUI(); dummy.hp = dummy.shown = 40; click('admHeal'); await scFrames(1, null, 100); ok(dummy.hp === (dummy.max || DUMMY_HP), 'HEAL DID NOT GIVE HIM HIS FULL HEALTH', 'HEALTH ' + dummy.hp);
    TR.ehp = 0; trainUI(); dummy.hp = dummy.shown = 40; click('admInf'); const full = dummy.hp === (dummy.max || DUMMY_HP); dummy.hp = dummy.shown = 40; await scFrames(2, null, 100); const inf = full && TR.ehp === 1 && dummy.hp === (dummy.max || DUMMY_HP); click('admInf'); ok(inf && TR.ehp === 0, 'INF HP DID NOT FILL HIM AT ONCE, KEEP HIM AT FULL HEALTH, OR SWITCH OFF AGAIN', 'EHP ' + TR.ehp);      // (turned on he is full at once, and a hit that follows is healed again)
    click('admFoe'); ok(await scUntil(() => A().key === 'verity' && A().moves.length > 0, 60, 250) && $('admTt').textContent === 'ADMIN: VERITY', 'THE ENEMY BUTTON DID NOT SWITCH THE BOX TO VERITY', 'KEY ' + A().key + ', TITLE ' + $('admTt').textContent);
    click('admX'); await scFrames(2, null, 100); ok(!A().open && getComputedStyle($('adm')).display === 'none', 'THE X DID NOT CLOSE THE BOX', '');
    await scUntil(() => !!vs && vs.ph === 'fight', 40, 250); dummy.x = wx + 20; dummy.ai = 'attack'; dummy.k = 0; dummy.aiAt = pnow(); await scFrames(2, null, 100); ok(dummy.ai === 'rest', 'WITH THE BOX CLOSED A DUMMY ENEMY IN THE MIDDLE OF A SWING WAS NOT STOOD STILL (THE BEHAVIOUR OF THE ROOM MUST RULE AS BEFORE THE BOX WAS THERE)', 'STATE ' + dummy.ai);
  } else if (stop()) return;
  show('title'); SC.say = 'A BATTLE';
  try { const sv = { ...vsPick }; vsPick.me = 'gojo'; vsPick.foe = 'yuji'; startMatch(1); Object.assign(vsPick, sv); } catch (e) { scErr(e, 'ADMIN BATTLE'); }
  if (await scUntil(() => !!vs && vs.ph === 'fight', 40, 250)) { await scFrames(2, null, 100); ok(!vs.practice && !A().on && $('admBtn').style.display === 'none' && !$('adm').classList.contains('on'), 'A BATTLE HAS THE ADMIN BUTTON OR THE BOX', 'ON ' + A().on); } else if (stop()) return;
  show('title');
}
// ---------------------------------------------------------------- CANVAS: what a frame that throws leaves behind (v1.207)
// A picture that was missing threw in the middle of the fighter's clipped picture (tools/template.html, paintMe): the clip and the shake offset it had set stayed on the canvas, so the picture froze outside a small rectangle and the camera looked broken for good. Now a missing picture (undefined or null) is skipped and written down (gfxMissing), and a frame that throws anyway puts the canvas back (gfxRecover, called by tick). Checks: gfxRecover puts back the transform, the alpha and every clip; a missing picture does not throw and is written down once; and a frame that really throws in a fight (every frame of his standing animation is a canvas of no size, which the browser refuses) leaves a canvas that can be painted all over again.
const SC_CV_N = 5;
async function scCanvas() {
  SC.sec = 'CANVAS'; scCov('CANVAS', 0, SC_CV_N); SC.plan = 80; SC.done = 0;
  const ok = (c, what, d) => { scT(c, 'CANVAS: ' + what, d || ''); scCov('CANVAS', 1, 0); };
  const probe = () => { ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1; ctx.fillStyle = '#ff00ff'; ctx.fillRect(0, 0, VW, VH); const a = ctx.getImageData(2, 2, 1, 1).data, b = ctx.getImageData(VW - 3, VH - 3, 1, 1).data; ctx.restore(); return a[0] + ',' + a[1] + ',' + a[2] + '|' + b[0] + ',' + b[1] + ',' + b[2]; };      // (paints the whole canvas and reads two corners: a clip that stays would leave them as they were)
  try {
    ctx.save(); ctx.beginPath(); ctx.rect(20, 20, 4, 4); ctx.clip(); ctx.translate(7, 9); ctx.globalAlpha = 0.3; ctx.save(); ctx.scale(2, 2); gfxRecover();      // (a frame that threw in the middle of two pictures)
    const m = ctx.getTransform(); ok(m.a === 1 && m.b === 0 && m.c === 0 && m.d === 1 && m.e === 0 && m.f === 0 && ctx.globalAlpha === 1, 'A FRAME THAT THREW LEFT THE TRANSFORM OR THE ALPHA OF THE CANVAS AS IT WAS', [m.a, m.d, m.e, m.f, ctx.globalAlpha].join());
    const pr = probe(); ok(pr === '255,0,255|255,0,255', 'A FRAME THAT THREW LEFT A CLIP ON THE CANVAS: THE PICTURE WOULD FREEZE OUTSIDE IT', pr);
    const hook = SCAN_HOOK, n = ERRS.length; SCAN_HOOK = null; gMissAt = -1e9; let threw = ''; try { ctx.drawImage(undefined, 0, 0); ctx.drawImage(null, 1, 1, 8, 8); } catch (e) { threw = String(e && e.message || e).slice(0, 80); } SCAN_HOOK = hook;
    ok(!threw, 'A PICTURE THAT IS MISSING MADE THE FRAME THROW INSTEAD OF BEING SKIPPED', threw);
    ok(ERRS.length === n + 1 && /MISSING/.test(ERRS[ERRS.length - 1].m), 'A MISSING PICTURE WAS NOT WRITTEN DOWN ONCE IN THE ERROR LIST', 'LIST ' + n + ' -> ' + ERRS.length); while (ERRS.length > n) ERRS.pop(); gMissAt = -1e9;      // (the note of the test is taken out again)
  } catch (e) { scErr(e, 'CANVAS'); }
  Object.assign(TR, { beh: 0, ehp: 1, php: 0, pce: 0, put: 2 });
  try { startPractice('gojo', 'yuji'); } catch (e) { scErr(e, 'CANVAS START'); return; }
  if (!(await scUntil(() => !!vs && vs.ph === 'fight', 40, 250))) { if (!SC.cancel && scReal() <= SC.cap) scNote('fail', 'CANVAS: THE FIGHT NEVER BEGAN', ''); show('title'); return; } await scFrames(2, null, 600);
  const bad = document.createElement('canvas'); bad.width = 0; bad.height = 0; const keep = idleF.slice(); let thrown = 0; SC.expect = 0;      // (a real exception, in the middle of the clipped picture of the fighter: the browser refuses a canvas of no size, and every frame of his standing animation is one)
  try { idleF.fill(bad); await scFrames(12, null, 100); } finally { keep.forEach((c, i) => { idleF[i] = c; }); thrown = SC.expect; SC.expect = null; }
  await scFrames(2, null, 100); const pr2 = probe(); ok(thrown >= 1 && pr2 === '255,0,255|255,0,255', 'A FRAME THAT THREW IN A FIGHT LEFT THE CANVAS BROKEN (A CLIP OR AN OFFSET STAYED)', 'FRAMES THAT THREW ' + thrown + ', CORNERS ' + pr2);
  show('title');
}
// ---------------------------------------------------------------- CLASH: the beam clash of Iron Man's UNIBEAM and Ryu's JUST THIS ONCE (v1.209, tools/clash.js)
// Checks: only Iron Man against Ryu clashes (not Gojo against Ryu, not Ryu against Ryu); the eight scenes (Iron Man or Ryu yours; who fires first; who wins; a finisher or not) start from the real ultimates, with the right one firing first, end by themselves, take exactly 45% of the loser's whole health, or kill him when that is more than he has (the enemy: K.O. and nothing left of him; you: your health is 0, nothing of you is drawn, the round is over), leave the winner's health alone, put the buttons and the tap area away, and let the fight go on (a finisher ends the round); and the same in the skyscraper. The outcome is forced (bcl.force) so that it does not depend on the taps; the taps themselves are counted from the keyboard.
const SC_BC_N = 30;
async function scClash() {
  SC.sec = 'CLASH'; scCov('CLASH', 0, SC_BC_N); SC.plan = 3600; SC.done = 0;
  const ok = (c, what, d) => { scT(c, 'CLASH: ' + what, d || ''); scCov('CLASH', 1, 0); }, stop = () => SC.cancel || scReal() > SC.cap, tr0 = {}, tw0 = twPick, gore0 = SET.gore; for (const k of ['beh', 'ehp', 'php', 'pce', 'grade', 'foe', 'put']) tr0[k] = TR[k];
  const room = async (me, foe, label) => { try { Object.assign(TR, { beh: 1, ehp: 0, php: 1, pce: 0, put: 2 }); startPractice(me, foe); } catch (e) { scErr(e, label + ' START'); return false; } if (!(await scUntil(() => !!vs && vs.ph === 'fight', 40, 250))) return false; await scFrames(2, null, 600); try { trainPut(); dummy.x = wx + 70; dummy.stunUntil = 0; } catch (e) { scErr(e, label); } return true; };
  const scenes = [['cu5', 'me', 'me', 0], ['cu5', 'foe', 'me', 1], ['cu5', 'me', 'foe', 0], ['cu5', 'foe', 'foe', 1], ['cu4', 'me', 'me', 0], ['cu4', 'foe', 'me', 1], ['cu4', 'me', 'foe', 0], ['cu4', 'foe', 'foe', 1]];
  try {
    SET.gore = 0; twPick = 0;
    if (!(await room('gojo', 'cu4', 'GOJO AGAINST RYU'))) { if (stop()) return; } else { ok(!bclPair(), 'GOJO AGAINST RYU WOULD CLASH: ONLY IRON MAN AGAINST RYU DOES', ''); show('title'); }
    if (!(await room('cu4', 'cu4', 'RYU AGAINST RYU'))) { if (stop()) return; } else { ok(!bclPair(), 'RYU AGAINST RYU WOULD CLASH', ''); show('title'); }
    for (let i = 0; i < scenes.length; i++) {
      const [me, first, win, kill] = scenes[i], foe = me === 'cu5' ? 'cu4' : 'cu5', label = (me === 'cu5' ? 'IRON MAN YOURS' : 'RYU YOURS') + ', ' + (first === 'me' ? 'YOU' : 'THE ENEMY') + ' FIRE FIRST, ' + (win === 'me' ? 'YOU' : 'THE ENEMY') + ' WIN' + (kill ? ', A FINISHER' : '');
      SC.say = label; if (!(await room(me, foe, label))) { if (stop()) return; continue; }
      if (i === 0) ok(bclPair(), 'IRON MAN AGAINST RYU WOULD NOT CLASH', '');
      try { if (kill) { if (win === 'me') dummy.hp = dummy.shown = 40; else vs.hp = vs.sh = 40; } } catch (e) { scErr(e, label); }
      const foeUlt = () => { dummy.chain = 99; if (me === 'cu5') cuenStart(16, pnow(), 'beam'); else cuenStart(0, pnow(), 'uni'); }, meUlt = () => { if (me === 'cu5') irUlTry(pnow()); else ryUlTry(pnow()); };
      try { (first === 'me' ? meUlt : foeUlt)(); } catch (e) { scErr(e, label); } if (!(await scFrames(14, null, 50))) return;
      const before = bcl; try { (first === 'me' ? foeUlt : meUlt)(); } catch (e) { scErr(e, label); }
      const started = !!bcl && !before && bcl.first === first && bcl.ir === (me === 'cu5' ? 'me' : 'foe');
      ok(started, label + ': THE SECOND ULTIMATE DID NOT START THE CLASH, OR THE WRONG ONE FIRED FIRST', bcl ? 'FIRST ' + bcl.first : 'NO CLASH');
      if (!bcl) { show('title'); continue; }
      const hp0 = [vs.hp, dummy.hp], mx = dummy.max || DUMMY_HP, dmgE = Math.round(mx * 0.45 * SET.pdm / 100), dmgP = Math.round(PHP * 0.45 * SET.edm / 100); bcl.force = { win };      // (only the winner is forced: whether it kills the loser is the rule of the game, his health against the 45%)
      let tapped = false, shown = false, hid = false; const ended = await scUntil(() => { if (bcl && bcl.ph === 'mash') { shown = shown || getComputedStyle(bclTapEl).display !== 'none'; if (!tapped) { tapped = true; const t0 = bcl.taps[0]; scKey('KeyJ', true); scKey('KeyJ', false); if (bcl.taps[0] !== t0 + 1) scNote('fail', label + ': A KEY DID NOT COUNT AS A TAP', 'TAPS ' + t0 + ' -> ' + bcl.taps[0]); } } if (bcl && bcl.ph === 'end') hid = hid || getComputedStyle(bclTapEl).display === 'none'; return !bcl; }, 700, 50);
      if (!ended && stop()) return;
      ok(ended && shown && hid && getComputedStyle(bclTapEl).display === 'none' && !$('hud').classList.contains('cine') && !$('pad').classList.contains('cine'), label + ': THE CLASH DID NOT END BY ITSELF, THE TAP AREA WAS NOT THERE DURING THE MASH OR WAS NOT AWAY WHEN IT WAS OVER, OR THE HIDDEN BUTTONS STAYED', 'ENDED ' + ended + ', SHOWN ' + shown + ', AWAY ' + hid);
      const loser = win === 'me' ? 'foe' : 'me', hpNow = [vs.hp, dummy.hp];
      if (!kill) {
        const lost = loser === 'foe' ? hp0[1] - hpNow[1] : hp0[0] - hpNow[0], want = loser === 'foe' ? dmgE : dmgP;
        ok(Math.abs(lost - want) <= 2 && vs.ph === 'fight' && (loser === 'foe' ? hpNow[0] >= hp0[0] - 1 : hpNow[1] >= hp0[1] - 1), label + ': THE LOSER DID NOT LOSE 45% OF HIS WHOLE HEALTH, THE WINNER LOST SOME, OR THE FIGHT DID NOT GO ON', 'LOST ' + lost + ' OF ' + want + ', PHASE ' + (vs && vs.ph));
      } else if (loser === 'foe') ok(dummy.ko >= 0 && !!dummy.del && dummy.hp === 0 && vs.ph !== 'fight' && !bclGone, label + ': THE FINISHER DID NOT KILL THE ENEMY AND LEAVE NOTHING OF HIM, OR THE ROUND DID NOT END', 'KO ' + dummy.ko + ', PHASE ' + (vs && vs.ph));
      else ok(vs.hp === 0 && bclGone && vs.ph !== 'fight', label + ': THE FINISHER DID NOT KILL YOU AND LEAVE NOTHING OF YOU, OR THE ROUND DID NOT END', 'HEALTH ' + Math.round(vs.hp) + ', PHASE ' + (vs && vs.ph));
      scCheck(); show('title'); if (stop()) return;
    }
    twPick = 1; if (await room('cu5', 'cu4', 'IN THE SKYSCRAPER')) {
      try { dummy.chain = 99; irUlTry(pnow()); } catch (e) { scErr(e, 'SKYSCRAPER'); } await scFrames(14, null, 50); try { dummy.chain = 99; cuenStart(16, pnow(), 'beam'); } catch (e) { scErr(e, 'SKYSCRAPER'); }
      ok(!!bcl, 'THE CLASH DID NOT START IN THE SKYSCRAPER', ''); if (bcl) bcl.force = { win: 'foe', kill: false };
      const ended = bcl ? await scUntil(() => !bcl, 700, 50) : false; ok(ended, 'THE CLASH IN THE SKYSCRAPER DID NOT END', ''); ok(state === 'play' && vs.ph === 'fight', 'THE FIGHT DID NOT GO ON AFTER THE CLASH IN THE SKYSCRAPER', 'PHASE ' + (vs && vs.ph)); scCheck(); show('title');
    } else if (stop()) return;
  } finally { Object.assign(TR, tr0); twPick = tw0; SET.gore = gore0; bcl = null; bclGone = false; bclTapOff(); }
}

// ---------------------------------------------------------------- ACHIEVEMENTS (v1.210): the card and the screen, the save, the rectangle that slides in, and the three ways to earn one (tools/ach.js)
const SC_K5_N = 59;
async function scK5() {      // v1.211 the chapter 5 fight: Yuji against Iron Man in the huge room (the picture turned over, Black Flash mode, no ending) and Iron Man's other moves as the enemy
  SC.sec = 'CH 5 FIGHT'; scCov('CH 5 FIGHT', 0, SC_K5_N); SC.plan = 3000; SC.done = 0;
  const ok = (c, what, d) => { scT(c, 'CH 5 FIGHT: ' + what, d || ''); scCov('CH 5 FIGHT', 1, 0); }, stop = () => SC.cancel || scReal() > SC.cap, gore0 = SET.gore, sv0 = localStorage.getItem(SAVE_KEY), GG = GRADES[3], gg0 = { dodge: GG.dodge, blk: GG.blk }, tr0 = {}; for (const k of ['beh', 'ehp', 'php', 'pce', 'grade', 'foe', 'put']) tr0[k] = TR[k];
  const start = async label => { try { show('title'); story = { slot: -1, t0: pnow(), battle: false, T: 0, ev: {}, c16: true }; k5FightGo(); } catch (e) { scErr(e, label + ' START'); return false; } return scUntil(() => !!vs && !!vs.k5 && vs.ph === 'fight', 120, 50); };
  const calm = () => { dummy.ai = 'rest'; dummy.aiAt = pnow(); dummy.restFor = 1e9; dummy.fa = null; dummy.stunUntil = 0; dummy.spNext = pnow() + 1e9; dummy.cs = dummy.cb = dummy.ca = null; vs.fburn = null; };      // (what he threw before is gone too: a bolt in the air would hurt Yuji in the middle of a blow)
  try {
    SET.gore = 0; if (!(await start('THE FIGHT'))) { if (!stop()) scNote('fail', 'CH 5 FIGHT: THE FIGHT DID NOT START', state + ' ' + (vs ? vs.ph : 'NO VS')); return; }
    GG.dodge = 0; GG.blk = 0;      // (the grade of this fight: its dodges and blocks would make a blow miss in the checks that count damage; put back at the end)
    calm(); await scUntil(() => hurtAt < 0 && pnow() - hurtEnd > 300, 80, 50);      // (the enemy may have struck once before the scan got hold of him: Yuji has to be on his feet)
    // the start
    ok(vs.me === 'yuji' && vs.foe === 'cu5' && !!vs.story && vs.k5 && state === 'play' && !vs.tn && !vs.c3 && vs.tl > 1e8, 'THE FIGHT IS NOT YUJI AGAINST IRON MAN WITH NO TIMER', vs.me + ' / ' + vs.foe + ' / ' + vs.tl);
    ok(document.body.classList.contains('c4') && $('atkl').textContent === 'FLASH' && $('hud').classList.contains('vs'), 'THE BUTTONS ARE NOT THE FIGHT\'S (THE BODY CLASS c4 AND ATTACK SAYING FLASH)', document.body.className + ' / ' + $('atkl').textContent);
    ok(owns('y_crouch') && owns('y_dash') && owns('y_block') && !owns('y_ce') && !owns('y_ult') && !owns('y_fatal') && !owns('y_heavy') && !owns('y_div'), 'THE SKILLS OF THE FIGHT ARE NOT CROUCH, DASH AND BLOCK ONLY', ['y_crouch', 'y_dash', 'y_block', 'y_ce', 'y_ult', 'y_fatal', 'y_heavy', 'y_div'].map(k => k + '=' + owns(k)).join(' '));
    ok(dummy.x - wx > 20 && dummy.x - wx < 120 && Math.round(wx) === 0, 'THE TWO OF THEM DO NOT STAND IN THE MIDDLE OF THE HALL', 'GAP ' + Math.round(dummy.x - wx));
    // turned over: left and right swap, for the keys and for the stick
    ok(k5In('L') === 'R' && k5In('R') === 'L' && k5In('A') === 'A' && k5In('U') === 'U', 'LEFT AND RIGHT DO NOT SWAP (OR SOMETHING ELSE DOES)', k5In('L') + k5In('R') + k5In('A'));
    { setStick(-1, 0); const a = padR && !padL; setStick(1, 0); const b = padL && !padR; setStick(0, 0); ok(a && b && !padL && !padR, 'THE STICK DOES NOT SWAP LEFT AND RIGHT', a + ' / ' + b); }
    scKey('ArrowLeft', true); await scFrames(2, null, 50); const kr = keyR && !keyL; scKey('ArrowLeft', false); await scFrames(1, null, 50); scKey('ArrowRight', true); await scFrames(2, null, 50); const kl = keyL && !keyR; scKey('ArrowRight', false); await scFrames(2, null, 50);
    ok(kr && kl && !keyL && !keyR, 'THE LEFT KEY DOES NOT WALK TOWARDS IRON MAN (ON THE LEFT OF THE SCREEN) AND THE RIGHT KEY AWAY FROM HIM', kr + ' / ' + kl);
    { const p0 = popups.length; say('X', dummy.x, '#fff', 8, pnow()); const p = popups[popups.length - 1], cxx = popSx(p); ok(popups.length === p0 + 1 && cxx < Math.round(VW / 2) && cxx > 0, 'A NUMBER OVER IRON MAN IS NOT ON HIS SIDE OF THE PICTURE (THE LEFT)', '' + cxx); }
    { ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.fillStyle = '#ff00ff'; ctx.fillRect(0, 0, 10, cv.height); ctx.fillStyle = '#00ffff'; ctx.fillRect(cv.width - 10, 0, 10, cv.height); k5Flip(); const l = ctx.getImageData(1, 5, 1, 1).data, r = ctx.getImageData(cv.width - 2, 5, 1, 1).data; ctx.restore(); ok(l[0] === 0 && l[1] === 255 && r[0] === 255 && r[1] === 0, 'k5Flip DID NOT TURN THE PICTURE OVER', Array.from(l).join() + ' / ' + Array.from(r).join()); }
    // the one blow: the Black Flash
    ok(atkAt < 0, 'A BLOW IS GOING ON AT THE START', '' + atkAt); { stance = 'crouch'; const a = pickAtk0(); stance = 'stand'; const b = pickAtk0(), c = pickAtk0(); ok(a === 22 && b === 20 && c === 20 && lastM1() === 20, 'ATTACK IS NOT THE BLACK FLASH (20 STANDING, 22 CROUCHED)', a + ' ' + b + ' ' + c + ' ' + lastM1()); }
    calm(); wx = 0; wxv = 0; dummy.x = 38; dummy.vx = 0; await scUntil(() => hurtAt < 0, 40, 50); await scFrames(2, null, 50);
    const bf0 = vs.k5.bf, wk0 = vs.k5.weak, eh0 = dummy.hp; scKey('KeyJ', true); await scFrames(2, null, 50); scKey('KeyJ', false);
    ok(await scUntil(() => !!vs.k5.ring, 30, 50), 'THE BLACK FLASH GOT NO RING', ''); vs.rolled = true;      // (the enemy's brain dodges or blocks a swing it has read now and then: not in this check)
    ok(atkK === 20 && !!vs.k5.ring && vs.k5.ring.k === 20 && Math.abs(vs.k5.ring.x - dummy.x) <= 14, 'THE RING IS NOT ON THE ENEMY', JSON.stringify(vs.k5.ring));
    await scUntil(() => atkAt < 0, 40, 50); await scFrames(2, null, 50); calm();
    ok(vs.k5.bf === bf0 + 1 && vs.k5.weak === wk0 && eh0 - dummy.hp === Math.round(BF_DMG[0] * INH_DMG), 'A BLACK FLASH ON THE RING WAS NOT PERFECT, OR IT DID NOT DO HALF OF 60', (eh0 - dummy.hp) + ' / ' + vs.k5.bf + ' ' + vs.k5.weak);
    ok(dummy.ko < 0 && !vs.k5.ring, 'THE RING STAYED AFTER THE BLOW, OR THE ENEMY FELL', '');
    // a weak one: the enemy is not where the ring was when the fist lands
    await scUntil(() => pnow() - dummy.rxAt > 900 && hurtAt < 0, 60, 50); calm(); wx = 0; wxv = 0; dummy.x = 38; dummy.vx = 0; dummy.airH = 0; dummy.air = null; await scFrames(3, null, 50);
    { const wk1 = vs.k5.weak, bf1 = vs.k5.bf, h1 = dummy.hp; scKey('KeyJ', true); await scFrames(2, null, 50); scKey('KeyJ', false); await scUntil(() => !!vs.k5.ring, 20, 50); vs.rolled = true; vs.k5.ring.x += 30; 
      await scUntil(() => atkAt < 0, 40, 50); await scFrames(2, null, 50);
      ok(vs.k5.weak === wk1 + 1 && vs.k5.bf === bf1 && h1 - dummy.hp === Math.max(1, Math.round(Math.round(BF_DMG[0] * INH_DMG) * 0.25)), 'A BLACK FLASH OFF THE RING WAS NOT WEAK (A QUARTER OF THE DAMAGE)', (h1 - dummy.hp) + ' / ' + vs.k5.weak + ' ' + vs.k5.bf); calm(); }
    // the threat rule
    dummy.hp = dummy.max; vs.k5.dm = []; vs.k5.pf = []; ok(!k5Threat(pnow()), 'HE FEELS THREATENED AT FULL HEALTH', '');
    dummy.hp = Math.round(dummy.max * 0.59); ok(k5Threat(pnow()), 'HE DOES NOT FEEL THREATENED AT 59% HEALTH', '');
    dummy.hp = dummy.max; k5Hurt(Math.round(dummy.max * 0.23), pnow()); ok(k5Threat(pnow()), 'HE DOES NOT FEEL THREATENED AFTER LOSING 23% IN 7 S', ''); vs.k5.dm = []; ok(!k5Threat(pnow()), 'HE STILL FEELS THREATENED AFTER NOTHING WAS LOST', '');
    vs.k5.pf = [pnow() - 3000, pnow() - 500]; ok(k5Threat(pnow()), 'HE DOES NOT FEEL THREATENED AFTER TWO PERFECT BLACK FLASHES IN 10 S', ''); vs.k5.pf = [pnow() - 11000, pnow() - 500]; ok(!k5Threat(pnow()), 'AN OLD PERFECT BLACK FLASH (11 S) STILL COUNTS', ''); vs.k5.pf = [];
    // the UNIBEAM only when he feels threatened
    { const g = CU_GAME[5], G = GRADES[vs.gi], tryN = n => { let u = 0; for (let i = 0; i < n; i++) { dummy.fa = null; dummy.born = pnow() - 20000; dummy.spNext = 0; dummy.sp = {}; if (cuenSpecialTry(pnow(), 100, 100, G, g, 5) && dummy.fa && dummy.fa.type === 'uni') u++; } dummy.fa = null; return u; };
      const u0 = tryN(400); dummy.hp = Math.round(dummy.max * 0.4); const u1 = tryN(400); dummy.hp = dummy.max; ok(u0 === 0 && u1 > 20, 'THE UNIBEAM IS NOT USED ONLY WHEN HE FEELS THREATENED', u0 + ' / ' + u1); }
    // the end: nothing happens
    calm(); { const hp0 = vs.hp; vsHurt(1e6, pnow()); ok(vs.hp === 1 && vs.ph === 'fight' && !$('vsres').classList.contains('on') && state === 'play', 'YUJI CAN LOSE OR THE FIGHT ENDS WHEN HIS HEALTH RUNS OUT', hp0 + ' -> ' + vs.hp + ' ' + vs.ph); }
    dummy.hp = 1; dummy.ko = -1; koDummy(pnow()); ok(dummy.ko < 0 && dummy.hp >= 1 && vs.ph === 'fight', 'THE ENEMY CAN BE KNOCKED OUT (KODUMMY)', dummy.ko + ' ' + dummy.hp);
    { await scUntil(() => pnow() - dummy.rxAt > 900 && hurtAt < 0, 60, 50); calm(); wx = 0; wxv = 0; dummy.x = 38; dummy.hp = 2; dummy.vx = 0; dummy.hitAt = 0; await scFrames(2, null, 50); scKey('KeyJ', true); await scFrames(2, null, 50); scKey('KeyJ', false); await scUntil(() => !!vs.k5.ring, 20, 50); vs.rolled = true; await scUntil(() => atkAt < 0, 40, 50); await scFrames(2, null, 50); ok(dummy.hp === 1 && dummy.ko < 0 && vs.ph === 'fight' && !$('vsres').classList.contains('on'), 'A BLACK FLASH ON AN ENEMY AT 2 HEALTH ENDED THE FIGHT', dummy.hp + ' ' + dummy.ko + ' ' + vs.ph); dummy.hp = dummy.max; }
    // the walls of the hall
    wx = 900; dummy.x = 950; await scFrames(3, null, 50); ok(Math.round(wx) === 300 && dummy.x <= 312, 'THE RIGHT WALL OF THE HALL DID NOT STOP THE TWO OF THEM', Math.round(wx) + ' ' + Math.round(dummy.x));
    wx = -900; dummy.x = -950; await scFrames(3, null, 50); ok(Math.round(wx) === -300 && dummy.x >= -312, 'THE LEFT WALL OF THE HALL DID NOT STOP THE TWO OF THEM', Math.round(wx) + ' ' + Math.round(dummy.x));
    wx = 0; dummy.x = 70; dummy.vx = 0; calm();
    // the picture is drawn without an error and in the hall (a frame of it, the middle column of the floor row is the hall's)
    await scFrames(4, null, 50);      // (a frame that throws is a finding of the scan by itself)
    { calm(); wx = 0; dummy.x = 70; dummy.vx = 0; await scFrames(5, null, 50); const W2 = cv.width, H2 = cv.height, px = ctx.getImageData(0, Math.round(H2 * 0.25), W2, Math.round(H2 * 0.6)).data; let rl = 0, rr = 0; for (let i = 0; i < px.length; i += 4) { if (px[i] > 140 && px[i + 1] < 90 && px[i + 2] < 90) { if (((i / 4) % W2) < W2 / 2) rl++; else rr++; } } ok(rl > rr * 3 + 50, 'IRON MAN (THE RED SUIT) IS NOT ON THE LEFT OF THE PICTURE', 'LEFT ' + rl + ' / RIGHT ' + rr); }
    // Iron Man's other moves, each one started and played to its end
    const moves = ['slam', 'flip', 'icharge', 'iblast', 'ilaser', 'ispin', 'igp', 'ihug'], dmgd = { icharge: 1, iblast: 1, ilaser: 1, igp: 1, ihug: 1 }; let hugLift = 0;
    for (const m of moves) {
      if (stop()) return; calm(); vs.hp = 300; wx = 0; wxv = 0; dummy.x = m === 'slam' ? 34 : m === 'flip' ? 40 : m === 'ihug' ? 60 : m === 'igp' ? 90 : m === 'ispin' ? 110 : 150; dummy.vx = 0; gAir = null; hurtAt = -1; hurtEnd = pnow() - 500; stance = 'stand'; pStun = 0; await scFrames(3, null, 50);
      let started = false; try { started = window.__cuir(m); } catch (e) { scErr(e, 'THE MOVE ' + m); } const t0 = pnow(); let maxLift = 0; const ended = await scUntil(() => { maxLift = Math.max(maxLift, gojoLift || 0); return !dummy.fa; }, 500, 30); if (m === 'ihug') hugLift = maxLift;
      ok(started && ended && pnow() - t0 < 6000 && vs.ph === 'fight' && vs.hp >= 1, 'THE MOVE ' + m.toUpperCase() + ' DID NOT START, OR DID NOT END BY ITSELF', started + ' ' + ended + ' ' + Math.round(pnow() - t0));
      if (dmgd[m]) ok(vs.hp < 300, 'THE MOVE ' + m.toUpperCase() + ' DID NOT HURT YUJI WHO STOOD IN FRONT OF IT', '' + vs.hp);
      await scFrames(4, null, 50); ok(!(gAir && gAir.hover) && (!dummy.fa), 'AFTER THE MOVE ' + m.toUpperCase() + ' YUJI IS STILL HELD, OR HE IS STILL AT IT', '');
    }
    ok(hugLift > 30, 'THE BEAR HUG DID NOT CARRY YUJI UP', '' + hugLift);
    // the brain uses every one of them
    { calm(); const g = CU_GAME[5], G = GRADES[vs.gi], seen = {}; for (let i = 0; i < 3000; i++) { dummy.fa = null; dummy.born = pnow() - 20000; dummy.sp = {}; dummy.spNext = 0; dummy.hitAt = pnow() - 300; const ag = 14 + Math.random() * 316; dummy.x = wx + ag; if (cuenSpecialTry(pnow(), ag, ag, G, g, 5)) { const t = dummy.fa.type + (dummy.fa.type === 'cu' ? dummy.fa.k : ''); seen[t] = 1; } } dummy.fa = null;
      ok(['cu5', 'cu8', 'icharge', 'iblast', 'ilaser', 'ispin', 'igp', 'ihug'].every(k => seen[k]), 'THE BRAIN DOES NOT USE EVERY MOVE (DOWNSLAM, BACKFLIP, CHARGE, BLAST, LASER, SPIN BLAST, GROUND PUNCH, BEAR HUG)', Object.keys(seen).join(',')); }
    // the ADMIN box lists them (training): the names
    { const hold = vs; const names = []; try { show('title'); Object.assign(TR, { beh: 0, ehp: 0, php: 0, pce: 0, put: 2 }); startPractice('yuji', 'cu5'); await scUntil(() => !!vs && vs.ph === 'fight', 40, 250); const L = admMoves().map(m => m.n); names.push(...L); } catch (e) { scErr(e, 'ADMIN LIST'); } ok(['DOWNSLAM', 'BACKFLIP', 'CHARGE', 'BLAST', 'LASER', 'SPIN BLAST', 'GROUND PUNCH', 'BEAR HUG', 'UNIBEAM'].every(n => names.includes(n)), 'THE ADMIN BOX DOES NOT LIST THE NEW MOVES OF THE ENEMY IRON MAN', names.join('|') + (hold ? '' : '')); }
    // a normal fight against Iron Man has none of the story fight's rules, and can use his moves too
    ok(!!vs && !vs.k5 && !vs.story && !document.body.classList.contains('c4') && $('atkl').textContent !== 'FLASH' && owns('y_ce') === !!PROG.own.y_ce, 'A TRAINING FIGHT AFTER THE STORY FIGHT STILL HAS ITS RULES (BUTTONS, SKILLS)', document.body.className);
    { calm(); const ok2 = window.__cuir('iblast'); await scFrames(30, null, 50); ok(ok2 && !!dummy.fa && dummy.fa.type === 'iblast', 'IRON MAN DOES NOT USE HIS BLAST IN A TRAINING FIGHT', '' + ok2); dummy.fa = null; }
    // leaving: the pause screen's MENU
    ok(await start('LEAVING'), 'THE FIGHT DID NOT START AGAIN', ''); await scFrames(3, null, 50); leavePlay(); await scFrames(3, null, 50);
    ok(state === 'saves' && !vs && !document.body.classList.contains('c4'), 'MENU DID NOT LEAVE THE FIGHT TO THE CHAPTER LIST WITH THE BUTTONS BACK', state + ' / ' + document.body.className);
    // the story: after the second tap Tony lands, the black, and the fight (the dodge and the punch)
    for (const res2 of ['hit', 'miss']) {
      if (stop()) return; show('title'); try { story = null; startStory(0, 5); await scFrames(20); window.__k5At(80.6, 'hit', undefined, res2); } catch (e) { scErr(e, 'CH 5 HAND-OFF'); }
      const began = await scUntil(() => !!vs && !!vs.k5, 700, 50); ok(began && !c4x && state === 'play' && vs.foe === 'cu5', 'AFTER THE LANDING (' + res2.toUpperCase() + ') THE FIGHT DID NOT BEGIN', 'C4X ' + !!c4x + ' ' + state); await scFrames(4, null, 50);
    }
    show('title');
  } catch (e) { scErr(e, 'CH 5 FIGHT'); }
  finally { SET.gore = gore0; Object.assign(TR, tr0); GG.dodge = gg0.dodge; GG.blk = gg0.blk; if (sv0 !== null) { try { localStorage.setItem(SAVE_KEY, sv0); } catch { /* storage blocked */ } } try { show('title'); } catch { /* nothing to leave */ } }
}
const SC_AC_N = 33;
async function scAch() {
  SC.sec = 'ACHIEVEMENTS'; scCov('ACHIEVEMENTS', 0, SC_AC_N); SC.plan = 3000; SC.done = 0;
  const ok = (c, what, d) => { scT(c, 'ACHIEVEMENTS: ' + what, d || ''); scCov('ACHIEVEMENTS', 1, 0); }, stop = () => SC.cancel || scReal() > SC.cap, tr0 = {}, tw0 = twPick, gore0 = SET.gore, ach0 = PROG.ach, t0 = { ...ACHT }; for (const k of ['beh', 'ehp', 'php', 'pce', 'grade', 'foe', 'put']) tr0[k] = TR[k];
  const wait = ms => new Promise(r => setTimeout(r, ms)), idle = async () => { for (let i = 0; i < 200 && (achBusy || achQ.length); i++) await wait(10); }, fresh = () => { PROG.ach = {}; achQ.length = 0; achSub(); };
  const room = async (me, foe, label, tower, beh) => { try { twPick = tower ? 1 : 0; Object.assign(TR, { beh: beh || 0, ehp: 0, php: beh ? 1 : 0, pce: 0, put: 2 }); startPractice(me, foe); } catch (e) { scErr(e, label + ' START'); return false; } if (!(await scUntil(() => !!vs && vs.ph === 'fight', 40, 250))) return false; await scFrames(2, null, 600); try { trainPut(); dummy.x = wx + 70; dummy.stunUntil = 0; } catch (e) { scErr(e, label); } return true; };
  const clash = async (me, win, label) => {      // one clash (the enemy fires first, you answer), the winner forced: true when it started and ended
    const foeUlt = () => { dummy.chain = 99; if (me === 'cu5') cuenStart(16, pnow(), 'beam'); else cuenStart(0, pnow(), 'uni'); };
    try { domReadyAt = 0; foeUlt(); } catch (e) { scErr(e, label); } if (!(await scFrames(14, null, 50))) return false;
    try { if (me === 'cu5') irUlTry(pnow()); else ryUlTry(pnow()); } catch (e) { scErr(e, label); } if (!bcl) return false; bcl.force = { win };
    const ended = await scUntil(() => !bcl, 700, 50); await scFrames(30, null, 50); return ended;
  };
  try {
    SET.gore = 0; twPick = 0; fresh(); Object.assign(ACHT, { hold: 40, out: 25 });
    // the table and the save
    ok(ACH.length === 3 && ACH_IMG.length === 3 && ACH.every((a, i) => a.id && a.nm && a.tx && /^data:image\/png;base64,/.test(ACH_IMG[i])), 'THE TABLE HAS NOT THREE ACHIEVEMENTS WITH A NAME, A TEXT AND A PICTURE', ACH.length + ' / ' + ACH_IMG.length);
    ok(ACH[0].nm === 'JUST THIS ONCE' && ACH[1].nm === 'WANNA SEE SOMETHING COOL?' && ACH[2].nm === 'CLIP THIS JARVIS' && ACH[0].tx === 'CLASH AGAINST RYU AT LEAST TWICE IN THE SAME GAME' && ACH[1].tx === "FINISH AN ENEMY OFF WITH SUKUNA'S FUGA WHILE HIS DOMAIN IS ACTIVE" && ACH[2].tx === 'ACTIVATE UNIBEAM AND THROW THE ENEMY OFF THE SKYSCRAPER MAP', 'A NAME OR A TEXT IS NOT WHAT WAS ASKED FOR', '');
    ok(achGive('nope') === false && achQ.length === 0 && !achBusy, 'AN UNKNOWN ACHIEVEMENT WAS GIVEN', '');
    ACHT.hold = 900; ACHT.out = 25; const first = achGive('jto'), again = achGive('jto');
    ok(first === true && again === false && PROG.ach.jto === 1 && achQ.length === 0, 'THE FIRST GIVE DID NOT SAY NEW, OR THE SECOND ONE DID', first + ' / ' + again);
    let sv = null; try { sv = JSON.parse(localStorage.getItem('js_prog')).ach; } catch { /* storage blocked */ } ok(!!sv && sv.jto === 1 && !sv.cool, 'THE ACHIEVEMENT WAS NOT SAVED WITH THE REST OF THE PROGRESS', JSON.stringify(sv));
    ok($('achSub').textContent === '1 OF 3', 'THE CARD DOES NOT SAY 1 OF 3', $('achSub').textContent);
    await wait(750); { const t = $('achT'), r = t.getBoundingClientRect();
      ok(t.classList.contains('on') && t.classList.contains('show') && $('achTn').textContent === 'JUST THIS ONCE' && $('achTi').getAttribute('src') === ACH_IMG[0], 'THE RECTANGLE IS NOT ON THE SCREEN WITH THE NAME AND THE PICTURE', t.className + ' / ' + $('achTn').textContent);
      ok(r.top >= -1 && r.top < innerHeight * 0.12 && r.bottom < innerHeight * 0.4 && r.left >= 0 && r.right <= innerWidth + 1 && Math.abs((r.left + r.right) / 2 - innerWidth / 2) < 3, 'THE RECTANGLE IS NOT AT THE TOP OF THE SCREEN, IN THE MIDDLE', Math.round(r.left) + ',' + Math.round(r.top) + ' - ' + Math.round(r.right) + ',' + Math.round(r.bottom) + ' IN ' + innerWidth + 'X' + innerHeight); }
    await idle(); ok(!$('achT').classList.contains('on') && !$('achT').classList.contains('show') && !achBusy, 'THE RECTANGLE DID NOT SLIDE OUT AGAIN', $('achT').className);
    // two at once wait for each other
    Object.assign(ACHT, { hold: 45, out: 25 }); const seen = [], pt = setInterval(() => { if ($('achT').classList.contains('on')) { const n = $('achTn').textContent; if (seen[seen.length - 1] !== n) seen.push(n); } }, 6);
    achGive('cool'); achGive('jarvis'); const waiting = achQ.length; await idle(); clearInterval(pt);
    ok(waiting === 1 && seen.join('|') === 'WANNA SEE SOMETHING COOL?|CLIP THIS JARVIS' && !achBusy && !achQ.length, 'TWO ACHIEVEMENTS AT ONCE DID NOT SLIDE IN ONE AFTER THE OTHER', waiting + ' WAITING, SAW ' + seen.join(' | '));
    // the card, the screen
    PROG.ach = { jto: 1 }; achQ.length = 0; achSub(); show('modes'); const st = $('story').getBoundingClientRect(), am = $('achMode').getBoundingClientRect();
    ok(am.left >= st.right - 1 && Math.abs(am.top - st.top) < 3 && $('achMode').previousElementSibling === $('story'), 'THE ACHIEVEMENTS CARD IS NOT NEXT TO THE STORY CARD', Math.round(st.right) + ' / ' + Math.round(am.left));
    $('achMode').click(); await scFrames(3); const cs = [...document.querySelectorAll('#achList .achC')];
    ok(state === 'ach' && getComputedStyle($('ach')).display !== 'none' && cs.length === 3 && $('achCnt').textContent === '1 OF 3 EARNED', 'THE CARD DID NOT OPEN THE ACHIEVEMENTS SCREEN WITH THREE CARDS', state + ' / ' + cs.length + ' / ' + $('achCnt').textContent);
    ok(cs.every((c, i) => c.dataset.id === ACH[i].id && c.querySelector('b').textContent === ACH[i].nm && c.querySelector('i').textContent === ACH[i].tx && c.querySelector('img').getAttribute('src') === ACH_IMG[i]), 'A CARD HAS NOT ITS NAME, ITS TEXT AND ITS PICTURE', '');
    ok(cs[0].classList.contains('on') && cs[0].querySelector('em').textContent === 'EARNED' && cs[1].classList.contains('off') && cs[1].querySelector('em').textContent === 'LOCKED' && cs[2].classList.contains('off'), 'THE CARDS DO NOT SAY WHICH ONE IS EARNED AND WHICH IS LOCKED', cs.map(c => c.className).join(' | '));
    ok(getComputedStyle(cs[1].querySelector('img')).filter.includes('grayscale') && !getComputedStyle(cs[0].querySelector('img')).filter.includes('grayscale'), 'THE PICTURE OF A LOCKED ONE IS NOT DARK, OR THE EARNED ONE IS', '');
    const bad = scAudit($('ach')); ok(bad.length === 0, 'THE SCREEN HAS A TEXT THAT DOES NOT FIT: ' + bad.slice(0, 2).join(' / '), '');
    achGive('cool'); await scFrames(2); ok(cs.length === 3 && document.querySelectorAll('#achList .achC.on').length === 2 && $('achCnt').textContent === '2 OF 3 EARNED', 'EARNING ONE ON THE SCREEN DID NOT UPDATE ITS CARDS', $('achCnt').textContent); await idle();
    $('achBack').click(); await scFrames(2); ok(state === 'modes', 'BACK DID NOT GO BACK TO THE MODE SCREEN', state); show('title');
    // JUST THIS ONCE: the second clash against the enemy Ryu in one fight
    fresh(); Object.assign(ACHT, { hold: 40, out: 25 });
    if (await room('cu5', 'cu4', 'JUST THIS ONCE', false, 1)) {
      const e1 = await clash('cu5', 'me', 'JUST THIS ONCE 1'); if (!e1 && stop()) return;
      ok(e1 && vs.jto === 1 && !PROG.ach.jto, 'THE FIRST CLASH AGAINST RYU ALREADY GAVE THE ACHIEVEMENT, OR WAS NOT COUNTED', 'ENDED ' + e1 + ' COUNT ' + (vs && vs.jto));
      const e2 = await clash('cu5', 'foe', 'JUST THIS ONCE 2'); if (!e2 && stop()) return;
      ok(e2 && vs.jto === 2 && PROG.ach.jto === 1, 'THE SECOND CLASH AGAINST RYU DID NOT GIVE THE ACHIEVEMENT (WON OR LOST)', 'ENDED ' + e2 + ' COUNT ' + (vs && vs.jto)); await idle(); show('title');
    } else if (stop()) return;
    fresh(); if (await room('cu5', 'cu4', 'JUST THIS ONCE, A NEW FIGHT', false, 1)) { ok(!(vs.jto > 0), 'A NEW FIGHT STARTED WITH THE CLASHES OF THE LAST ONE', 'COUNT ' + vs.jto); const e1 = await clash('cu5', 'me', 'NEW FIGHT 1'); ok(e1 && vs.jto === 1 && !PROG.ach.jto, 'THE FIRST CLASH OF A NEW FIGHT GAVE THE ACHIEVEMENT', 'COUNT ' + vs.jto); show('title'); } else if (stop()) return;
    fresh(); if (await room('cu4', 'cu5', 'RYU YOURS', false, 1)) { const a = await clash('cu4', 'me', 'RYU YOURS 1'), b = a ? await clash('cu4', 'me', 'RYU YOURS 2') : false; ok(a && b && !(vs.jto > 0) && !PROG.ach.jto, 'CLASHES AS RYU, AGAINST IRON MAN, GAVE THE ACHIEVEMENT: ONLY IRON MAN AGAINST THE ENEMY RYU COUNTS', 'COUNT ' + vs.jto + ' ' + a + ' ' + b); show('title'); } else if (stop()) return;
    // WANNA SEE SOMETHING COOL?: FUGA, the arrow itself takes the last of his health
    window.__suAll = true;
    const fuga = async (hp, label) => {
      if (!(await room('cu3', 'gojo', label))) return null;
      try { scKey('KeyV', true); await scFrames(2); scKey('KeyV', false); } catch (e) { scErr(e, label); } if (!(await scUntil(() => !!(suDom && suDom.sink < 0), 90, 100))) return null;
      for (let i = 0; i < 2; i++) { scKey('KeyE', true); await scFrames(2); scKey('KeyE', false); await scFrames(3); }
      if (!suFl) return null; try { dummy.hp = dummy.shown = hp === 'low' ? 10 : dummy.max; } catch (e) { scErr(e, label); }
      scKey('KeyL', true); await scFrames(2); scKey('KeyL', false); if (!(await scUntil(() => !!suFg, 40, 100))) return null;
      await scUntil(() => !suFg, 400, 100); return { ko: dummy.ko >= 0 };
    };
    fresh(); const f1 = await fuga('low', 'FUGA ON A WEAK ENEMY'); if (f1 === null && stop()) return;
    ok(!!f1 && f1.ko && PROG.ach.cool === 1, 'FUGA THAT KILLED THE ENEMY IN THE DOMAIN DID NOT GIVE THE ACHIEVEMENT', JSON.stringify(f1) + ' ' + JSON.stringify(PROG.ach)); await idle(); show('title');
    fresh(); const f2 = await fuga('full', 'FUGA ON A STRONG ENEMY'); if (f2 === null && stop()) return;
    ok(!!f2 && !f2.ko && !PROG.ach.cool, 'FUGA THAT DID NOT KILL THE ENEMY GAVE THE ACHIEVEMENT', JSON.stringify(f2) + ' ' + JSON.stringify(PROG.ach)); show('title');
    // CLIP THIS JARVIS: the enemy goes out through the glass of the skyscraper within 4 s of a burst of YOUR UNIBEAM
    fresh(); achU = -1e9; if (await room('cu5', 'cu4', 'UNIBEAM BURSTS')) { try { domReadyAt = 0; irUlTry(pnow()); } catch (e) { scErr(e, 'UNIBEAM'); } const got = await scUntil(() => achU > 0, 200, 50); ok(got && Math.abs(achU - pnow()) < 4000, 'A BURST OF THE UNIBEAM ON THE ENEMY DID NOT SET THE TIME THE ACHIEVEMENT LOOKS AT', 'ACHU ' + achU); await scUntil(() => !CU_GAME[5].bh, 200, 50); show('title'); } else if (stop()) return;
    const out = async (me, foe, ago, label, who) => { fresh(); if (!(await room(me, foe, label, true))) return null; try { achU = ago === null ? -1e9 : pnow() - ago; twFallOut(who || 'foe', pnow(), 1); } catch (e) { scErr(e, label); } await scFrames(2); const r = !!PROG.ach.jarvis; show('title'); return r; };
    const j1 = await out('cu5', 'cu4', 500, 'OUT 0.5 S AFTER A BURST'); if (j1 === null && stop()) return; ok(j1 === true, 'THE ENEMY WENT OUT THROUGH THE GLASS 0.5 S AFTER A BURST AND THERE WAS NO ACHIEVEMENT', '' + j1);
    const j2 = await out('cu5', 'cu4', 5000, 'OUT 5 S AFTER A BURST'); if (j2 === null && stop()) return; ok(j2 === false, 'THE ENEMY WENT OUT 5 S AFTER THE LAST BURST AND IT WAS GIVEN', '' + j2);
    const j3 = await out('cu5', 'cu4', null, 'OUT WITH NO BURST'); if (j3 === null && stop()) return; ok(j3 === false, 'THE ENEMY WENT OUT WITHOUT ANY UNIBEAM AND IT WAS GIVEN', '' + j3);
    const beam = async (where, label) => {      // the real thing: the UNIBEAM in the skyscraper with the enemy 6.5 m (near) or in the middle of the floor (far) from the right end
      fresh(); achU = -1e9; if (!(await room('cu5', 'cu4', label, true))) return null; let F = null;
      try { F = twFloorData(vs.tw.fMe); wx = where === 'near' ? F.W - 140 : F.W / 2; dummy.x = wx + 75; dummy.vx = 0; const x0 = wx - 80, x1 = where === 'near' ? F.W + 60 : wx + 420; F.doors = F.doors.filter(d => d.x < x0 || d.x > x1); F.walls = F.walls.filter(w => w.x < x0 || w.x > x1); domReadyAt = 0; irUlTry(pnow()); } catch (e) { scErr(e, label); }      // (no door and no wall where the two of them stand and the beam goes: an elevator shaft that the beam opens in front of him would drop him down the shaft, not out of the window)
      await scFrames(3); await scUntil(() => !CU_GAME[5].bh, 240, 50); const r = { ach: !!PROG.ach.jarvis, glass: !!(F && F.outer[1].broken), lower: vs.tw.fFoe < vs.tw.fMe || !!vs.tw.away, holes: F ? F.holes.length : -1, ko: dummy.ko >= 0, hp: Math.round(dummy.hp), ff: vs.tw.fFoe, fm: vs.tw.fMe }; show('title'); return r;
    };
    const b1 = await beam('near', 'UNIBEAM NEAR THE END'); if (b1 === null && stop()) return; ok(!!b1 && b1.ach && b1.glass && b1.holes === 0, 'THE LAST BURST OF THE UNIBEAM DID NOT THROW AN ENEMY NEAR THE END OF THE FLOOR OUT OF THE WINDOW, OR IT BROKE THE FLOOR UNDER HIM TOO', JSON.stringify(b1));
    const b2 = await beam('far', 'UNIBEAM IN THE MIDDLE'); if (b2 === null && stop()) return; ok(!!b2 && !b2.ach && !b2.glass && b2.lower && b2.holes > 0, 'THE LAST BURST OF THE UNIBEAM IN THE MIDDLE OF THE FLOOR BROKE A WINDOW, GAVE THE ACHIEVEMENT, OR DID NOT BREAK THE FLOOR UNDER HIM AS BEFORE', JSON.stringify(b2));
    const j4 = await out('cu4', 'cu5', 500, 'OUT, RYU YOURS'); if (j4 === null && stop()) return; ok(j4 === false, 'IT WAS GIVEN TO A PLAYER THAT IS NOT IRON MAN', '' + j4);
    const j5 = await out('cu5', 'cu4', 500, 'YOU GO OUT', 'me'); if (j5 === null && stop()) return; ok(j5 === false, 'YOU WENT OUT THROUGH THE GLASS AND THE ACHIEVEMENT WAS GIVEN: ONLY THE ENEMY GOING OUT COUNTS', '' + j5);
  } finally { PROG.ach = ach0; Object.assign(ACHT, t0); achQ.length = 0; achSub(); achU = -1e9; Object.assign(TR, tr0); twPick = tw0; SET.gore = gore0; bcl = null; bclGone = false; bclTapOff(); $('achT').className = ''; achBusy = false; }
}
// v1.191 IRON MAN's moves: the chain (R.HOOK, L.HOOK, R.KICK, PUNCH), the ROCKET UPPERCUT (JUMP and ATTACK together, either one first), the DOWNSLAM (ATTACK 0.2 s after the jump, and an earlier one waits for it), crouch, block and dash; each is a check that the move that should come out did (cuAtkK: 0 - 3 the chain, 4 the uppercut, 5 the downslam), played against a standing enemy in front of him; v1.192 the LOW JABS (6: crouched, ATTACK), the CHARGE (7: ATTACK during a dash or just after it; a late one is a plain hook) and the BACKFLIP (8: DASH BACK twice, never two dashes forward); v1.193 the REPULSOR MODE (the MODE button: ATTACK is R.BLAST (9) and then L.BLAST (10), both hurt the enemy, the other moves stay, off again it is the chain); v1.194 the BEAR HUG (BLUE: he charges, grabs, hugs, flies up with the enemy hanging in his arms, turns over, dives and slams: 4 hits, it ends by itself, and it has a cooldown); in the skyscraper he is also one of the fighters of scTower
const SC_IR_N = 50;
async function scIronMoves() {
  const place = () => { TR.put = 2; trainPut(); };
  try { Object.assign(TR, { beh: 0, ehp: 1, php: 0, pce: 0, put: 2 }); startPractice('cu5', 'gojo'); } catch (e) { scErr(e, 'IRON MAN START'); return; }
  if (!(await scUntil(() => !!vs && vs.ph === 'fight', 40, 250))) return; await scFrames(2, null, 600);
  const press = async (k, hold) => { scKey(k, true); const a = await scFrames(hold || 1); scKey(k, false); return a; }, ok = (c, what) => { scT(c, 'IRON MAN: ' + what, 'BLOW ' + cuAtkK + ' JUMP ' + (cuJumpAt >= 0) + ' STANCE ' + stance); scCov('MOVES', 1, 0); }, reset = async () => { trainReset(); place(); await scFrames(14); };
  SC.say = 'IRON MAN: THE CHAIN'; const seq = [];      // (a frame is 50 ms, a blow takes 6 to 8 of them)
  const tr = []; await reset(); for (let f = 0; f < 50; f++) { if (f % 9 === 0 && f < 28) scKey('KeyJ', true); else scKey('KeyJ', false); await scFrames(1); tr.push(cuAtkAt >= 0 ? cuAtkK : '-'); if (cuAtkAt >= 0 && seq[seq.length - 1] !== cuAtkK) seq.push(cuAtkK); } scKey('KeyJ', false);      // (four presses, 0.45 s apart: each comes within the 0.7 s after the blow before, or while it is going and is kept)
  ok(seq.join() === '0,1,2,3', 'THE CHAIN WAS ' + seq.join() + ' AND NOT R.HOOK, L.HOOK, R.KICK, PUNCH ' + tr.join(''));
  SC.say = 'IRON MAN: UPPERCUT'; await reset(); scKey('Space', true); scKey('KeyJ', true); await scFrames(1); scKey('Space', false); scKey('KeyJ', false); await scFrames(1); ok(cuAtkAt >= 0 && cuAtkK === 4, 'JUMP AND ATTACK TOGETHER DID NOT THROW THE UPPERCUT'); await scFrames(14);
  SC.say = 'IRON MAN: UPPERCUT, ATTACK FIRST'; await reset(); await press('KeyJ'); await press('Space'); await scFrames(1); ok(cuAtkAt >= 0 && cuAtkK === 4, 'ATTACK AND THEN JUMP A FRAME LATER DID NOT THROW THE UPPERCUT'); await scFrames(14);
  SC.say = 'IRON MAN: UPPERCUT, JUMP FIRST'; await reset(); await press('Space'); await press('KeyJ'); await scFrames(1); ok(cuAtkAt >= 0 && cuAtkK === 4, 'JUMP AND THEN ATTACK A FRAME LATER DID NOT THROW THE UPPERCUT'); await scFrames(14);
  SC.say = 'IRON MAN: DOWNSLAM'; await reset(); await press('Space'); await scFrames(6); await press('KeyJ'); await scFrames(1); ok(cuAtkAt >= 0 && cuAtkK === 5, 'ATTACK 0.3 S AFTER THE JUMP DID NOT THROW THE DOWNSLAM'); await scFrames(14);
  SC.say = 'IRON MAN: CROUCH'; await reset(); await press('KeyS'); await scFrames(10); const cr1 = stance; await press('KeyS'); await scFrames(10); ok(cr1 === 'crouch' && stance === 'stand', 'CROUCH DOWN AND UP: ' + cr1 + ' THEN ' + stance);
  SC.say = 'IRON MAN: BLOCK'; await reset(); scKey('KeyB', true); await scFrames(8); const bl = blkAt >= 0; scKey('KeyB', false); await scFrames(4); ok(bl && blkAt < 0, 'BLOCK DID NOT GO UP AND DOWN');
  SC.say = 'IRON MAN: DASH'; await reset(); scKey('KeyD', true); await press('KeyK'); await scFrames(1); const dh = !!cuDash; scKey('KeyD', false); await scFrames(8); ok(dh, 'DASH DID NOT START');
  SC.say = 'IRON MAN: LOW JABS'; await reset(); await press('KeyS'); await scFrames(10); await press('KeyJ'); await scFrames(1); ok(cuAtkAt >= 0 && cuAtkK === 6 && stance === 'crouch', 'CROUCHED, ATTACK DID NOT THROW THE LOW JABS'); await scFrames(16); ok(cuAtkAt < 0 && stance === 'crouch', 'THE LOW JABS DID NOT END, STANCE ' + stance); await press('KeyS'); await scFrames(10);
  SC.say = 'IRON MAN: CHARGE'; await reset(); const hc = dummy.hp, wc = wx; scKey('KeyD', true); await press('KeyK'); await scFrames(2); await press('KeyJ'); await scFrames(1); scKey('KeyD', false); ok(cuAtkAt >= 0 && cuAtkK === 7 && !cuDash, 'ATTACK JUST AFTER A DASH DID NOT THROW THE CHARGE'); await scFrames(20); ok(cuAtkAt < 0 && (dummy.hp < hc || wx - wc > 90), 'THE CHARGE NEITHER HIT NOR FLEW: HP ' + hc + ' TO ' + dummy.hp + ', MOVED ' + Math.round(wx - wc));
  SC.say = 'IRON MAN: A LATE ATTACK IS NO CHARGE'; await reset(); scKey('KeyD', true); await press('KeyK'); scKey('KeyD', false); await scFrames(16); await press('KeyJ'); await scFrames(1); ok(cuAtkAt >= 0 && cuAtkK === 0, 'ATTACK 0.8 S AFTER THE DASH WAS BLOW ' + cuAtkK + ' AND NOT THE R.HOOK'); await scFrames(14);
  SC.say = 'IRON MAN: BACKFLIP'; await reset(); wx = 150; dummy.x = wx + 120; await scFrames(2); const wb = wx; await press('KeyK'); await scFrames(2); await press('KeyK'); await scFrames(1); const bf = cuAtkAt >= 0 && cuAtkK === 8; let top = 0; for (let f = 0; f < 16; f++) { await scFrames(1); top = Math.max(top, gojoLift); } ok(bf && top > 12 && wb - wx > 60, 'DASH BACK TWICE: BLOW ' + (bf ? 8 : 'NONE') + ', HEIGHT ' + Math.round(top) + ', WENT BACK ' + Math.round(wb - wx));
  SC.say = 'IRON MAN: TWO DASHES FORWARD'; await reset(); scKey('KeyD', true); await press('KeyK'); await scFrames(2); await press('KeyK'); await scFrames(1); scKey('KeyD', false); ok(!(cuAtkAt >= 0 && cuAtkK === 8), 'TWO DASHES FORWARD MADE A BACKFLIP'); await scFrames(8);
  SC.say = 'IRON MAN: REPULSOR MODE'; await reset(); CU_GAME[5].rp = false; await press('KeyE'); await scFrames(2); ok(!!CU_GAME[5].rp && $('cel').innerHTML.indexOf('REPULSOR') >= 0, 'THE MODE BUTTON DID NOT SWITCH THE REPULSOR MODE ON: ' + $('cel').innerHTML);
  await press('KeyJ'); await scFrames(1); ok(cuAtkAt >= 0 && cuAtkK === 9, 'IN THE REPULSOR MODE THE FIRST ATTACK WAS BLOW ' + cuAtkK + ' AND NOT THE R.BLAST'); await scFrames(12); await press('KeyJ'); await scFrames(1); ok(cuAtkAt >= 0 && cuAtkK === 10, 'THE SECOND ATTACK WAS BLOW ' + cuAtkK + ' AND NOT THE L.BLAST'); await scFrames(8); ok(hits.n >= 2, 'THE BLASTS HURT NOBODY: THE COMBO COUNTER SAYS ' + hits.n);      // (the enemy's health is not looked at: the Training setting of the scan refills it; the combo counter counts every hit)
  await press('KeyS'); await scFrames(10); await press('KeyJ'); await scFrames(1); ok(cuAtkAt >= 0 && cuAtkK === 6, 'CROUCHED IN THE MODE, ATTACK WAS BLOW ' + cuAtkK + ' AND NOT THE LOW JABS'); await scFrames(16); await press('KeyS'); await scFrames(10);
  await press('KeyE'); await scFrames(2); await press('KeyJ'); await scFrames(1); ok(!CU_GAME[5].rp && cuAtkAt >= 0 && cuAtkK === 0, 'WITH THE MODE OFF AGAIN ATTACK WAS BLOW ' + cuAtkK + ' AND NOT THE R.HOOK'); await scFrames(14); CU_GAME[5].rp = false;
  SC.say = 'IRON MAN: BEAR HUG'; await reset(); CU_GAME[5].bhCd = 0; dummy.x = wx + 70; await press('KeyL'); await scFrames(1); ok(!!CU_GAME[5].bh, 'BLUE DID NOT START THE BEAR HUG');
  let topH = 0, held = false, mh = 0; for (let f = 0; f < 70 && CU_GAME[5].bh; f++) { await scFrames(1); if (CU_GAME[5].bh) { topH = Math.max(topH, gojoLift); mh = Math.max(mh, hits.n); if (CU_GAME[5].bh.ph === 'up' && (dummy.airH || 0) > 10) held = true; } }
  ok(!CU_GAME[5].bh, 'THE BEAR HUG WAS STILL GOING 3.5 S AFTER IT BEGAN: ' + (CU_GAME[5].bh && CU_GAME[5].bh.ph)); ok(held && topH > 20 && mh >= 4, 'THE BEAR HUG DID NOT GRAB, RAISE AND SLAM: HELD ' + held + ', HEIGHT ' + Math.round(topH) + ', HITS ' + mh);
  await press('KeyL'); await scFrames(2); ok(!CU_GAME[5].bh, 'THE BEAR HUG STARTED AGAIN DURING ITS COOLDOWN'); CU_GAME[5].bhCd = 0;
  SC.say = 'IRON MAN: BLAST'; await reset(); CU_GAME[5].rp = true; CU_GAME[5].bmCd = 0; dummy.x = wx + 70; await press('KeyL'); await scFrames(1); ok(!!CU_GAME[5].bh && CU_GAME[5].bh.kind === 'beam', 'BLUE IN THE REPULSOR MODE DID NOT START THE BLAST');
  let fired = false, burn = 0; for (let f = 0; f < 70 && CU_GAME[5].bh; f++) { await scFrames(1); if (CU_GAME[5].bh) { if (CU_GAME[5].bh.ph === 'fire') fired = true; burn = Math.max(burn, hits.dmg); } }
  ok(!CU_GAME[5].bh, 'THE BLAST WAS STILL GOING 3.5 S AFTER IT BEGAN: ' + (CU_GAME[5].bh && CU_GAME[5].bh.ph)); ok(fired && burn >= 30, 'THE BLAST DID NOT BURN THE ENEMY: FIRED ' + fired + ', DAMAGE ' + burn);
  await press('KeyL'); await scFrames(2); ok(!CU_GAME[5].bh, 'THE BLAST STARTED AGAIN DURING ITS COOLDOWN'); CU_GAME[5].bmCd = 0; CU_GAME[5].rp = false;
  SC.say = 'IRON MAN: GROUND PUNCH'; await reset(); CU_GAME[5].rp = false; CU_GAME[5].bhCd = 0; dummy.x = wx + 70; stance = 'crouch'; await press('KeyL'); await scFrames(1); ok(!!CU_GAME[5].bh && CU_GAME[5].bh.kind === 'gp', 'BLUE WHILE CROUCHED DID NOT START THE GROUND PUNCH');
  let gdm = 0; for (let f = 0; f < 70 && CU_GAME[5].bh; f++) { await scFrames(1); gdm = Math.max(gdm, hits.dmg); }
  ok(!CU_GAME[5].bh, 'THE GROUND PUNCH WAS STILL GOING 3.5 S AFTER IT BEGAN: ' + (CU_GAME[5].bh && CU_GAME[5].bh.ph)); ok(gdm >= 8, 'THE SHOCK OF THE GROUND PUNCH DID NOT REACH THE ENEMY: DAMAGE ' + gdm);
  stance = 'crouch'; await press('KeyL'); await scFrames(2); ok(!CU_GAME[5].bh, 'THE GROUND PUNCH STARTED AGAIN DURING ITS COOLDOWN'); CU_GAME[5].bhCd = 0; stance = 'stand';
  SC.say = 'IRON MAN: LASER'; await reset(); CU_GAME[5].rp = true; CU_GAME[5].bmCd = 0; dummy.x = wx + 70; scKey('ArrowLeft', true); await scFrames(2); await press('KeyL'); scKey('ArrowLeft', false); await scFrames(1); ok(!!CU_GAME[5].bh && CU_GAME[5].bh.kind === 'laser', 'BLUE WALKING BACK IN THE REPULSOR MODE DID NOT START THE LASER');
  let prc = 0, bled = false; for (let f = 0; f < 70 && CU_GAME[5].bh; f++) { await scFrames(1); prc = Math.max(prc, hits.dmg); if (dummy.bleed) bled = true; } for (let f = 0; f < 6; f++) { await scFrames(1); if (dummy.bleed) bled = true; }
  ok(!CU_GAME[5].bh, 'THE LASER WAS STILL GOING 3.5 S AFTER IT BEGAN: ' + (CU_GAME[5].bh && CU_GAME[5].bh.ph)); ok(prc >= 20, 'THE LASER DID NOT PIERCE THE ENEMY: DAMAGE ' + prc); ok(bled, 'THE ENEMY DID NOT BLEED AFTER THE LASER');
  await press('KeyL'); await scFrames(2); ok(!CU_GAME[5].bh, 'THE LASER STARTED AGAIN DURING ITS COOLDOWN'); CU_GAME[5].bmCd = 0; CU_GAME[5].rp = false;
  SC.say = 'IRON MAN: SPIN BLAST'; await reset(); hits.n = 0; hits.dmg = 0; hits.seq = 0; hits.until = 0; CU_GAME[5].rp = true; CU_GAME[5].bmCd = 0; dummy.x = wx + 70; await press('Space'); await scFrames(5); await press('KeyL'); await scFrames(1); ok(!!CU_GAME[5].bh && CU_GAME[5].bh.kind === 'spin', 'BLUE IN THE AIR IN THE REPULSOR MODE DID NOT START THE SPIN BLAST');      // (v1.202 jump, then BLUE: he hovers in a T pose, turns and fires a beam from each hand)
  let spun = false, sdm = 0; for (let f = 0; f < 70 && CU_GAME[5].bh; f++) { await scFrames(1); if (CU_GAME[5].bh) { if (CU_GAME[5].bh.ph === 'spin') spun = true; sdm = Math.max(sdm, hits.dmg); } }
  ok(!CU_GAME[5].bh, 'THE SPIN BLAST WAS STILL GOING 3.5 S AFTER IT BEGAN: ' + (CU_GAME[5].bh && CU_GAME[5].bh.ph)); ok(spun && sdm >= 15, 'THE SPIN BLAST DID NOT BURN THE ENEMY ON HIS RIGHT: SPUN ' + spun + ', DAMAGE ' + sdm);
  await reset(); hits.n = 0; hits.dmg = 0; hits.seq = 0; hits.until = 0; CU_GAME[5].rp = true; CU_GAME[5].bmCd = 0; dummy.x = wx - 70; await press('Space'); await scFrames(5); await press('KeyL'); await scFrames(1); let ldm = 0; for (let f = 0; f < 70 && CU_GAME[5].bh; f++) { await scFrames(1); ldm = Math.max(ldm, hits.dmg); }
  ok(ldm >= 15, 'THE SPIN BLAST DID NOT BURN THE ENEMY ON HIS LEFT: DAMAGE ' + ldm);
  await press('Space'); await scFrames(5); await press('KeyL'); await scFrames(2); ok(!CU_GAME[5].bh, 'THE SPIN BLAST STARTED AGAIN DURING ITS COOLDOWN'); CU_GAME[5].bmCd = 0; CU_GAME[5].rp = false; await scFrames(20);
  SC.say = 'IRON MAN: ULTIMATE'; await reset(); hits.n = 0; hits.dmg = 0; hits.seq = 0; hits.until = 0; domReadyAt = 0; dummy.x = wx + 70; await press('KeyV'); await scFrames(1); ok(!!CU_GAME[5].bh && CU_GAME[5].bh.kind === 'uni', 'DOMAIN DID NOT START THE ULTIMATE');      // (v1.203 DOMAIN: he charges from his chest, braces and fires a beam of orange, yellow and white; nothing touches him meanwhile, the 12 bursts take 45% of the enemy's health)
  const ulPh = []; let ulDm = 0, ulTk = 0, ulInv = true; for (let f = 0; f < 140 && CU_GAME[5].bh; f++) { await scFrames(1); const b = CU_GAME[5].bh; if (b) { if (ulPh[ulPh.length - 1] !== b.ph) ulPh.push(b.ph); ulDm = Math.max(ulDm, hits.dmg); ulTk = Math.max(ulTk, b.tk); if (!irUlHit()) ulInv = false; } }
  ok(!CU_GAME[5].bh, 'THE ULTIMATE WAS STILL GOING 7 S AFTER IT BEGAN: ' + (CU_GAME[5].bh && CU_GAME[5].bh.ph)); ok(ulPh.join('>') === 'charge>brace>fire>rel', 'THE ULTIMATE WENT THROUGH ' + ulPh.join('>') + ' AND NOT CHARGE, BRACE, FIRE, RELEASE'); ok(ulTk === 12 && Math.abs(ulDm - Math.round(dummy.max * 0.45)) <= 1, 'THE ULTIMATE DID NOT TAKE 45% OF THE ENEMY HEALTH IN 12 BURSTS: BURSTS ' + ulTk + ', DAMAGE ' + ulDm + ' OF ' + dummy.max); ok(ulInv, 'HE WAS TOUCHABLE DURING THE ULTIMATE');
  await press('KeyV'); await scFrames(2); ok(!CU_GAME[5].bh, 'THE ULTIMATE STARTED AGAIN DURING ITS WAIT'); domReadyAt = 0;
  await reset(); hits.n = 0; hits.dmg = 0; hits.seq = 0; hits.until = 0; dummy.x = wx - 70; await press('KeyV'); await scFrames(1); let ulBd = 0; for (let f = 0; f < 140 && CU_GAME[5].bh; f++) { await scFrames(1); ulBd = Math.max(ulBd, hits.dmg); } ok(ulBd === 0, 'THE ULTIMATE HURT AN ENEMY WHO WAS BEHIND HIM: DAMAGE ' + ulBd); domReadyAt = 0;
  show('title');
}

// ---------------------------------------------------------------- CUTSCENES: the FATALITY and the DOMAIN of every fighter, played to the end
async function scCuts() {
  SC.sec = 'CUTSCENES'; const FATAL = { gojo: 1, yuji: 1, verity: 1, cat: 1, freddy: 1, cu3: 1, cu4: 1 };
  scCov('CUTSCENES', 0, SC_WHO.length * 2 + 3 + 13 + 19 + 5 + 7); SC.plan = (SC_WHO.length * 2 + 3 + 13 + 19 + 5 + 7) * 220; SC.done = 0;      // (v1.208 + 5: two fatalities and three moves of the enemy Iron Man; v1.212 + 7: Ryu's fatality in the three GRAPHIC DAMAGE settings and the enemy Ryu's on four fighters)
  for (let i = 0; i < SC_WHO.length; i++) {
    const w = SC_WHO[i];
    for (const [key, nm, low, max] of [['KeyH', 'FATALITY', 2, 700], ['KeyV', 'DOMAIN', 1, 520]]) {
      const label = SC_NAME[w] + ' ' + nm; SC.say = label; SET.gore = i % 3;
      try { Object.assign(TR, { beh: 2, ehp: low, php: 0, pce: 0, put: 2 }); startPractice(w, w === 'gojo' ? 'yuji' : 'gojo'); } catch (e) { scErr(e, label); continue; }
      if (!(await scUntil(() => !!vs && vs.ph === 'fight', 40, 250))) { if (SC.cancel || scReal() > SC.cap) return; continue; }
      await scFrames(2, null, 600); try { trainPut(); } catch (e) { scErr(e, label); }
      scKey(key, true); await scFrames(2); scKey(key, false);
      let started = false, calm = 0, ended = false, n = 0, uiLeft = 0;
      while (n < max) {
        if (!(await scFrames(1))) { show('title'); return; } n++;
        if (n % 8 === 0) { scCheck(); if (typeof cutsceneOn === 'function' && cutsceneOn() && (getComputedStyle($('pad')).visibility !== 'hidden' || getComputedStyle($('hud')).visibility !== 'hidden')) uiLeft++; }      // (v1.181 the buttons are gone while a cutscene is on)
        if (scBusy()) { started = true; calm = 0; } else if (started && ++calm > 20) { ended = true; break; }
        if (!started && n > 90) break;
      }
      if (uiLeft > 1) scNote('warn', label + ': THE BUTTONS STAYED ON THE SCREEN DURING THE CUTSCENE', uiLeft + ' CHECKS');      // (one check can fall on the very first frame of the cutscene, before the page class is set)
      scCov('CUTSCENES', 1, 0); if (started) scPass(); else if ((key === 'KeyH' ? FATAL[w] : 1)) scNote('warn', label + ' DID NOT START', 'THE ENEMY WAS AT ' + (dummy ? Math.round(dummy.hp / (dummy.max || 1) * 100) : '?') + '% HEALTH, ' + (dummy ? Math.round(Math.abs(dummy.x - wx)) : '?') + ' PX AWAY');
      if (started && !ended) scNote('warn', label + ' DID NOT END IN ' + Math.round(max * SC_STEP / 1000) + ' SECONDS', '');
      show('title');
    }
  }
  for (const gm of [0, 1, 2]) {      // v1.185 Freddy's FATALITY in all three GRAPHIC DAMAGE settings, each on another victim (the main loop above plays it in one of them)
    const vic = ['gojo', 'yuji', 'cat'][gm], label = 'FREDDY FATALITY ON ' + SC_NAME[vic] + ' (GRAPHIC DAMAGE ' + ['FULL', 'CLEAN', 'OFF'][gm] + ')'; SC.say = label; SET.gore = gm;
    try { Object.assign(TR, { beh: 2, ehp: 2, php: 0, pce: 0, put: 2 }); startPractice('freddy', vic); } catch (e) { scErr(e, label); continue; }
    if (!(await scUntil(() => !!vs && vs.ph === 'fight', 40, 250))) { if (SC.cancel || scReal() > SC.cap) return; continue; }
    await scFrames(2, null, 600); try { trainPut(); } catch (e) { scErr(e, label); }
    scKey('KeyH', true); await scFrames(2); scKey('KeyH', false);
    if (await scUntil(() => !!ff, 40, 250)) { if (await scUntil(() => !ff, 700, 250)) { scPass(); scCov('CUTSCENES', 1, 0); } else scNote('warn', label + ' DID NOT END IN 35 SECONDS', ''); } else scNote('fail', label + ' DID NOT START', 'THE ENEMY WAS AT ' + (dummy ? Math.round(dummy.hp / (dummy.max || 1) * 100) : '?') + '% HEALTH');
    show('title');
  }
  for (const gm of [0, 1, 2]) {      // v1.212 Ryu's FATALITY in all three GRAPHIC DAMAGE settings, each on another victim, and the words it puts on the screen (exactly SWEET and the enemy's two lines, the second one cut off after the N and the dash)
    const vic = ['gojo', 'cat', 'cu5'][gm], label = 'RYU FATALITY ON ' + SC_NAME[vic] + ' (GRAPHIC DAMAGE ' + ['FULL', 'CLEAN', 'OFF'][gm] + ')'; SC.say = label; SET.gore = gm;
    try { Object.assign(TR, { beh: 2, ehp: 2, php: 0, pce: 0, put: 2 }); startPractice('cu4', vic); } catch (e) { scErr(e, label); continue; }
    if (!(await scUntil(() => !!vs && vs.ph === 'fight', 40, 250))) { if (SC.cancel || scReal() > SC.cap) return; continue; }
    await scFrames(2, null, 600); try { trainPut(); } catch (e) { scErr(e, label); }
    scKey('KeyH', true); await scFrames(2); scKey('KeyH', false);
    if (await scUntil(() => !!ryf, 40, 250)) {
      let said = []; const ended = await scUntil(() => { if (ryf) said = ryf.said.slice(); return !ryf; }, 700, 250);
      if (!ended) scNote('warn', label + ' DID NOT END IN 35 SECONDS', '');
      else {
        const want = ['SWEET', 'I THOUGHT YOU HAD ABANDONED THAT PRIDE', 'YOU DISGUSTING ASS N-'], bad = said.filter(x => !want.includes(x) && !want[2].startsWith(x));
        if (!(want.every(x => said.includes(x)) && !bad.length)) scNote('fail', label + ': THE WORDS ARE NOT RIGHT', 'SAID: ' + said.join(' | '));
        else if (typeof goreAft !== 'undefined' && goreAft) scNote('fail', label + ': HIS HEAD CAME OFF AFTER IT (HE WAS BURNT ALREADY)', '');
        else { scPass(); scCov('CUTSCENES', 1, 0); }
      }
    } else scNote('fail', label + ' DID NOT START', 'THE ENEMY WAS AT ' + (dummy ? Math.round(dummy.hp / (dummy.max || 1) * 100) : '?') + '% HEALTH');
    show('title');
  }
  // v1.188 FREDDY AS AN ENEMY: the FATALITY of every fighter on him, his nightmare and his fatality on you, and his three specials (in the street)
  for (const w of ['gojo', 'yuji', 'verity', 'cat', 'freddy']) {
    const label = SC_NAME[w] + ' FATALITY ON THE ENEMY FREDDY'; SC.say = label; SET.gore = SC_WHO.indexOf(w) % 3;
    try { Object.assign(TR, { beh: 2, ehp: 2, php: 0, pce: 0, put: 2 }); startPractice(w, 'freddy'); } catch (e) { scErr(e, label); continue; }
    if (!(await scUntil(() => !!vs && vs.ph === 'fight', 40, 250))) { if (SC.cancel || scReal() > SC.cap) return; continue; }
    await scFrames(2, null, 600); try { trainPut(); } catch (e) { scErr(e, label); }
    scKey('KeyH', true); await scFrames(2); scKey('KeyH', false);
    if (await scUntil(() => scBusy(), 40, 250)) { if (await scUntil(() => !scBusy(), 800, 250)) { scPass(); scCov('CUTSCENES', 1, 0); } else scNote('warn', label + ' DID NOT END IN 40 SECONDS', ''); } else scNote('fail', label + ' DID NOT START', 'THE ENEMY WAS AT ' + (dummy ? Math.round(dummy.hp / (dummy.max || 1) * 100) : '?') + '% HEALTH');
    show('title');
  }
  for (const [w, what] of [['gojo', 'NIGHTMARE'], ['verity', 'NIGHTMARE'], ['cat', 'FATALITY'], ['yuji', 'FATALITY'], ['freddy', 'FATALITY']]) {      // (his ULTIMATE and his FATALITY on you, on different fighters and in different GRAPHIC DAMAGE settings)
    const label = 'THE ENEMY FREDDY: HIS ' + what + ' ON ' + SC_NAME[w]; SC.say = label; SET.gore = SC_WHO.indexOf(w) % 3;
    try { Object.assign(TR, { beh: 1, ehp: 0, php: 1, pce: 0, put: 2, grade: 4 }); startPractice(w, 'freddy'); } catch (e) { scErr(e, label); continue; }
    if (!(await scUntil(() => !!vs && vs.ph === 'fight', 40, 250))) { if (SC.cancel || scReal() > SC.cap) return; continue; }
    await scFrames(2, null, 600); try { trainPut(); } catch (e) { scErr(e, label); }
    try { if (what === 'NIGHTMARE') { dummy.x = wx + 90; fdStartRev(pnow()); } else { vs.hp = vs.sh = 40; dummy.x = wx + 30; } } catch (e) { scErr(e, label); }
    const sw = what === 'NIGHTMARE' ? () => !!fd : () => !!ff;
    if (await scUntil(sw, 80, 250)) { if (await scUntil(() => !sw(), 800, 250)) { scPass(); scCov('CUTSCENES', 1, 0); } else scNote('warn', label + ' DID NOT END IN 40 SECONDS', ''); } else scNote('fail', label + ' DID NOT START', 'YOUR HEALTH ' + (vs ? Math.round(vs.hp) : '?') + ', THE ENEMY ' + (dummy ? Math.round(Math.abs(dummy.x - wx)) : '?') + ' PX AWAY');
    show('title');
  }
  for (const sp of ['water', 'pierce', 'slam']) {
    const label = 'THE ENEMY FREDDY: HIS ' + sp.toUpperCase() + ' MOVE'; SC.say = label; SET.gore = 0;
    try { Object.assign(TR, { beh: 1, ehp: 0, php: 1, pce: 0, put: 2, grade: 4 }); startPractice('gojo', 'freddy'); } catch (e) { scErr(e, label); continue; }
    if (!(await scUntil(() => !!vs && vs.ph === 'fight', 40, 250))) { if (SC.cancel || scReal() > SC.cap) return; continue; }
    await scFrames(2, null, 600); try { trainPut(); dummy.x = wx + (sp === 'pierce' ? 40 : 110); freStart(sp, pnow()); } catch (e) { scErr(e, label); }
    if (await scUntil(() => !dummy || !dummy.fa, 100, 250)) { scPass(); scCov('CUTSCENES', 1, 0); } else scNote('warn', label + ' DID NOT END IN 25 SECONDS', '');
    show('title');
  }
  // v1.189 SUKUNA AND RYU AS ENEMIES: the fatality of three fighters on them, the enemy fatalities and nightmare on them as the player, and every special move of theirs (in the street)
  for (const [w, foe] of [['gojo', 'cu3'], ['yuji', 'cu4'], ['cat', 'cu3'], ['gojo', 'cu4'], ['gojo', 'cu5'], ['yuji', 'cu5']]) {
    const label = SC_NAME[w] + ' FATALITY ON THE ENEMY ' + SC_NAME[foe]; SC.say = label; SET.gore = SC_WHO.indexOf(w) % 3; window.__suAll = true;
    try { Object.assign(TR, { beh: 2, ehp: 2, php: 0, pce: 0, put: 2 }); startPractice(w, foe); } catch (e) { scErr(e, label); continue; }
    if (!(await scUntil(() => !!vs && vs.ph === 'fight', 40, 250))) { if (SC.cancel || scReal() > SC.cap) return; continue; }
    await scFrames(2, null, 600); try { trainPut(); } catch (e) { scErr(e, label); }
    scKey('KeyH', true); await scFrames(2); scKey('KeyH', false);
    if (await scUntil(() => scBusy(), 40, 250)) { if (await scUntil(() => !scBusy(), 800, 250)) { scPass(); scCov('CUTSCENES', 1, 0); } else scNote('warn', label + ' DID NOT END IN 40 SECONDS', ''); } else scNote('fail', label + ' DID NOT START', 'THE ENEMY WAS AT ' + (dummy ? Math.round(dummy.hp / (dummy.max || 1) * 100) : '?') + '% HEALTH');
    show('title');
  }
  for (const [w, foe, what] of [['cu3', 'gojo', 'FATALITY'], ['cu4', 'cat', 'FATALITY'], ['cu3', 'freddy', 'NIGHTMARE'], ['cu4', 'freddy', 'NIGHTMARE'], ['cu5', 'gojo', 'FATALITY'], ['cu5', 'cat', 'FATALITY'], ['cu5', 'freddy', 'NIGHTMARE'], ['gojo', 'cu4', 'FATALITY'], ['cat', 'cu4', 'FATALITY'], ['cu3', 'cu4', 'FATALITY'], ['cu5', 'cu4', 'FATALITY']]) {      // (the enemy's own fatality or nightmare on Sukuna, Ryu or Iron Man; v1.212 the enemy Ryu's fatality on four fighters)
    const label = 'THE ENEMY ' + SC_NAME[foe] + ': HIS ' + what + ' ON ' + SC_NAME[w]; SC.say = label; SET.gore = 0; window.__suAll = true;
    try { Object.assign(TR, { beh: 1, ehp: 0, php: 1, pce: 0, put: 2, grade: 4 }); startPractice(w, foe); } catch (e) { scErr(e, label); continue; }
    if (!(await scUntil(() => !!vs && vs.ph === 'fight', 40, 250))) { if (SC.cancel || scReal() > SC.cap) return; continue; }
    await scFrames(2, null, 600); try { trainPut(); } catch (e) { scErr(e, label); }
    try { if (what === 'NIGHTMARE') { dummy.x = wx + 90; fdStartRev(pnow()); } else { dummy.fa = null; dummy.cact = null; dummy.vact = null; dummy.stunUntil = 0; dummy.rxAt = -1e9; dummy.ai = 'rest'; dummy.aiAt = pnow(); dummy.restFor = 1e9; vs.hp = vs.sh = 40; dummy.x = wx + 30; } } catch (e) { scErr(e, label); }      // (v1.212 he stands still while you are at 40: the finisher must not depend on what his brain does in that moment, and the training gives you your health back soon)
    const sw = what === 'NIGHTMARE' ? () => !!fd : () => scBusy();
    if (await scUntil(sw, 80, 250)) { if (await scUntil(() => !sw(), 800, 250)) { scPass(); scCov('CUTSCENES', 1, 0); } else scNote('warn', label + ' DID NOT END IN 40 SECONDS', ''); } else scNote('fail', label + ' DID NOT START', 'YOUR HEALTH ' + (vs ? Math.round(vs.hp) : '?') + ', THE ENEMY ' + (dummy ? Math.round(Math.abs(dummy.x - wx)) : '?') + ' PX AWAY');
    show('title');
  }
  for (const [foe, sp, k] of [['cu3', 'cu', 6], ['cu3', 'aircut', 9], ['cu3', 'arrow', 22], ['cu3', 'dom', 0], ['cu4', 'cu', 10], ['cu4', 'cu', 11], ['cu4', 'blast', 12], ['cu4', 'beam', 16], ['cu5', 'uni', 0], ['cu5', 'cu', 4], ['cu5', 'cu', 9]]) {
    const label = 'THE ENEMY ' + SC_NAME[foe] + ': ' + sp.toUpperCase() + ' ' + k; SC.say = label; SET.gore = 0; window.__suAll = true;
    try { Object.assign(TR, { beh: 1, ehp: 0, php: 1, pce: 0, put: 2, grade: 4 }); startPractice('gojo', foe); } catch (e) { scErr(e, label); continue; }
    if (!(await scUntil(() => !!vs && vs.ph === 'fight', 40, 250))) { if (SC.cancel || scReal() > SC.cap) return; continue; }
    await scFrames(2, null, 600); try { trainPut(); dummy.x = wx + (foe === 'cu4' && k === 10 || foe === 'cu5' && k === 4 ? 30 : 120); cuenStart(k, pnow(), sp); } catch (e) { scErr(e, label); }
    if (await scUntil(() => !dummy || !dummy.fa, 100, 250)) { scPass(); scCov('CUTSCENES', 1, 0); } else scNote('warn', label + ' DID NOT END IN 25 SECONDS', '');
    show('title');
  }
  {      // v1.181 the FATALITY inside a DOMAIN: Gojo opens the void (10 seconds), the enemy is at 10 percent and close, FATAL must start the cutscene
    const label = 'GOJO FATALITY IN HIS DOMAIN'; SC.say = label;
    try { Object.assign(TR, { beh: 2, ehp: 2, php: 0, pce: 0, put: 2 }); startPractice('gojo', 'yuji'); } catch (e) { scErr(e, label); return; }
    if (await scUntil(() => !!vs && vs.ph === 'fight', 40, 250)) {
      await scFrames(2, null, 600); try { trainPut(); } catch (e) { scErr(e, label); }
      scKey('KeyV', true); await scFrames(2); scKey('KeyV', false);
      if (await scUntil(() => !!dom && dom.ph === 'void', 900, 250)) { scKey('KeyH', true); await scFrames(2); scKey('KeyH', false); if (await scUntil(() => !!fat, 40, 250)) scPass(); else scNote('fail', label + ' DID NOT START', 'THE VOID WAS OPEN'); }
      else if (!SC.cancel) scNote('warn', label + ': THE VOID NEVER OPENED', '');
    }
    show('title');
  }
}

// ---------------------------------------------------------------- STORY: every scene shot by shot, with the SKIP button
function scSkipTap() {      // a tap on the SKIP button in the top right corner
  const r = cv.getBoundingClientRect(), o = { clientX: r.left + r.width * (VW - 21) / VW, clientY: r.top + r.height * 8 / VH, pointerId: 1, bubbles: true };
  window.dispatchEvent(new PointerEvent('pointerdown', o)); window.dispatchEvent(new PointerEvent('pointerup', o));
}
async function scStory() {
  SC.sec = 'STORY'; const SCENES = [['CH 1 THE ALLEY', () => startStory(0, 1)], ['CH 1 PART 2 THE HALL', () => startChapter2(0)], ['THE TRAINING', () => startTraining(0)], ['THE MASTER', () => { startStory(0, 1); startMaster(pnow()); }], ['THE REPORT', () => { startStory(0, 1); startOutro(pnow()); }], ['CH 2 THE PORTAL', () => startStory(0, 2)], ['CH 3 THE GENERAL', () => startStory(0, 3)], ['CH 4 THE VESSEL', () => startStory(0, 4)], ['CH 5 THE IRON MAN', () => startStory(0, 5)]];
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
      if (C && !['cut', 'ranos', 'ny', 'k5'].includes(C.ph)) continue;      // (a part with no SKIP: it goes on by itself)
      if (story && state === 'story' && !storySkipOn()) { scSkipTap(); if (!(await scFrames(40))) { show('title'); return; } continue; }      // (a card that uses the taps itself, e.g. the how-to-play card of chapter 3: a tap after its first 1.8 s closes it)
      const t0 = T(), s0 = C ? C.ph : ''; scSkipTap(); if (!(await scFrames(2))) { show('title'); return; }
      const C2 = typeof c4x !== 'undefined' ? c4x : null; pre = T() - t0 < 1.2 ? 2 : 4;
      if (inScene() && (C2 ? C2.ph : '') === s0 && !(T() > t0 + 0.25)) { if (++stuck === 2 && !(await scFrames(60))) { show('title'); return; } if (stuck >= 4) { scNote('warn', name + ': THE SKIP BUTTON DOES NOTHING', 'AT ' + T().toFixed(1) + ' S'); break; } } else stuck = 0;      // (the last shot has nothing to skip to: it ends by itself, so two taps in a row that did nothing are followed by a wait)
      if (k % 6 === 5) scCheck();
    }
    if (state === 'play' && story && story.battle) { const q = scPlayer(5), ok = await scFrames(100, () => q.step()); q.end(); scCheck(); if (!ok) { show('title'); return; } }
    scCov('SCENES', 1, 0); scPass();
  }
  if (!SC_ONLY.scenes || SC_ONLY.scenes.some(x => 'CH 5 THE STAB'.includes(x))) {      // (v1.177 chapter 5's lost tap: the stab, the black, the words YUJI DIED, and the scene starts again by itself)
    SC.say = 'CH 5 THE STAB'; show('title'); try { SET.gore = 0; startStory(0, 5); await scFrames(20); window.__k5At(7.7, 'miss'); let q = null; for (let k = 0; k < 14; k++) { if (!(await scFrames(60))) { show('title'); return; } q = window.__k5(); if (q && q.res === null && q.T < 6) break; } if (!q || q.res !== null || q.T > 6) scNote('fail', 'CHAPTER 5 DID NOT START AGAIN AFTER THE STAB', q ? 'T ' + q.T : 'NO SCENE'); scCheck(); } catch (e) { scErr(e, 'CH 5 THE STAB'); }
  }
  if (!SC_ONLY.scenes || SC_ONLY.scenes.some(x => 'CH 5 THE WALL'.includes(x))) {      // (v1.178 chapter 5, part 2: a lost second tap: the punch, the flight into the wall, the black, the cards and the end)
    SC.say = 'CH 5 THE WALL'; show('title'); try { SET.gore = 0; startStory(0, 5); await scFrames(20); window.__k5At(80.6, 'hit', undefined, 'miss'); let q = null; for (let k = 0; k < 24; k++) { if (!(await scFrames(60))) { show('title'); return; } q = window.__k5(); if (!q) break; } if (q) scNote('fail', 'CHAPTER 5 DID NOT END AFTER THE WALL', 'T ' + q.T); scCheck(); } catch (e) { scErr(e, 'CH 5 THE WALL'); }
  }
  show('title');
}

// ---------------------------------------------------------------- the run
let SC_ONLY = {};      // (for the tests: { sec: ['STORY'], scenes: ['CH 4'] })
// ---------------------------------------------------------------- SKYSCRAPER (v1.173): three fighters fight in the 50-floor building and the scan makes its things happen: a slam through the floors, a fall, a blast, a ceiling broken, glass broken and a fall to the street
function scSigns() {      // v1.182 the floor signs: a few floors (the lobby, the penthouse, others) have at least 3 each, none hangs on a door or on an inner wall, and none is behind a piece of furniture tall enough to stand in front of it
  const bad = []; for (const f of [1, 2, 9, 17, 30, 44, 50]) { const F = twFloorData(f), s = twLayout(F).sign; if (s.length < 3) bad.push('FLOOR ' + f + ' HAS ONLY ' + s.length + ' SIGNS');
    for (const x of s) { if (F.doors.some(d => x - d.x > -33 && x - d.x < 40) || (F.front && Math.abs(x - F.front.x) < 46)) bad.push('FLOOR ' + f + ': A SIGN HANGS ON A DOOR AT ' + x); if (F.xs.some((q, i) => i > 0 && i < F.nr && Math.abs(q - x) < 36)) bad.push('FLOOR ' + f + ': A SIGN HANGS ON AN INNER WALL AT ' + x); if (F.objs.some(o => { const K = TW_K[o.k]; return Math.abs(o.x - x) < K.w / 2 + 15 && 98 - K.h - (o.on ? TW_K[o.on.k].h : 0) < 68; })) bad.push('FLOOR ' + f + ': A SIGN IS BEHIND TALL FURNITURE AT ' + x); } }
  if (bad.length) scNote('fail', 'FLOOR SIGNS: ' + bad[0], bad.length + ' PROBLEMS');
}
function scPanel() {      // v1.184 the elevator panel in the cab: no text of a button may stick out of its button (the floor numbers were 16 px in circles of 24 - 37 px, cut at the edge; checked here at the real size of the screen)
  if (typeof cutsceneOn === 'function' && cutsceneOn()) return;      // (the panel is hidden on purpose while a cutscene is on, e.g. a nightmare or an ultimate the random player started in the cab: v1.188)
  const p = twpEl, bad = []; if (!p || !p.classList.contains('on')) { scNote('fail', 'THE ELEVATOR PANEL IS NOT ON THE SCREEN IN THE CAB', 'FIGHTER ' + (vs ? vs.me : '?') + ', STATE ' + state + ', CUTSCENE ' + (typeof cutsceneOn === 'function' && cutsceneOn()) + ', PAUSED ' + !!paused + ', CAB ' + !!(vs && vs.tw && vs.tw.cab) + ', CLASS ' + (p ? p.className : 'NONE')); return; }
  const rg = document.createRange(), tr = el => { rg.selectNodeContents(el); return rg.getBoundingClientRect(); }, gr = p.querySelector('#twpg').getBoundingClientRect();
  for (const b of p.querySelectorAll('.twf')) { const r = b.getBoundingClientRect(); if (!r.width || r.bottom < gr.top || r.top > gr.bottom) continue; const cx = r.left + r.width / 2, cy = r.top + r.height / 2, rad = Math.min(r.width, r.height) / 2 - (parseFloat(getComputedStyle(b).borderTopWidth) || 0);
    for (const el of b.querySelectorAll('b,i')) { if (!el.textContent) continue; const t = tr(el); for (const [x, y] of [[t.left, t.top], [t.right, t.top], [t.left, t.bottom], [t.right, t.bottom]]) if (Math.hypot(x - cx, y - cy) - rad > 0.3) { bad.push('FLOOR ' + b.dataset.f + ' (' + el.textContent + ')'); break; } } }
  for (const b of p.querySelectorAll('#twpq button,#twpf button')) { const r = b.getBoundingClientRect(); if (!r.width) continue; for (const el of b.querySelectorAll('span,b')) { const t = tr(el); if (t.left < r.left - 0.3 || t.right > r.right + 0.3) { bad.push((b.dataset.q || b.dataset.a || '?').toUpperCase() + ' BUTTON'); break; } } if (!b.querySelector('span,b')) { const t = tr(b); if (t.left < r.left - 0.3 || t.right > r.right + 0.3) bad.push((b.dataset.a || '?').toUpperCase() + ' BUTTON'); } }
  if (bad.length) scNote('fail', 'ELEVATOR PANEL: THE TEXT OF A BUTTON STICKS OUT OF IT: ' + bad[0], bad.length + ' BUTTONS');
}
function scFredSlam() {      // v1.185 Freddy in the skyscraper: whatever the random player was doing, he crouches and presses BLUE (the ground slam: the floor breaks under both, both fall, he throws what is around him); tried three times
  if (!fredMe() || !dummy || fg || fgCd) return; twFoeHere(pnow()); dummy.x = wx + 70; atkAt = -1; atkQ = false; jumpAt = -1; dgAt = -1; blkAt = blkEnd = -1; blockHeld = false; fredCrQ = fredUpQ = -1; stickCr = false; fwPh = ''; stance = 'crouch'; lpReq = true;
}
function scIronHug() {      // v1.194 Iron Man in the skyscraper: whatever the random player was doing, he presses BLUE with the enemy 60 px in front of him (the bear hug: up through the ceilings, over, down through the floors); scIronHugEnd looks at it 5 s later
  const g = CU_GAME[5]; if (!vs || vs.me !== 'cu5' || !g || !dummy || g.bh || !irhOk(pnow())) return; g.bhCd = 0; twFoeHere(pnow()); dummy.x = twPlace(twFloorData(vs.tw.fMe), wx + 60); cuAtkAt = -1; cuDash = null; blkAt = blkEnd = -1; blockHeld = false; stance = 'stand'; stickCr = false; lpReq = true; SC.ih = { f: vs.tw.fMe, at: pnow() };
}
function scIronBeam() {      // v1.195 Iron Man in the skyscraper: whatever the random player was doing, the move he is in is cut, the repulsor mode goes on and the BLAST begins with the enemy 60 px in front of him (the beam breaks what is in its way); scIronBeamEnd looks at it 6 s later
  const g = CU_GAME[5]; if (!vs || vs.me !== 'cu5' || !g || !dummy || vs.ph !== 'fight') return; const n = pnow(); if (g.bh) irBhEnd(g, n); g.rp = true; g.bmCd = 0; twFoeHere(n); if (!irhOk(n)) return; dummy.x = twPlace(twFloorData(vs.tw.fMe), wx + 60); cuAtkAt = -1; cuJumpAt = -1; cuDash = null; blkAt = blkEnd = -1; blockHeld = false; stance = 'stand'; stickCr = false;
  if (irBhStart(g, n)) SC.ib = { f: vs.tw.fMe, at: n };
}
function scIronForm(kind) {      // v1.196 Iron Man in the skyscraper: whatever the random player was doing, the move he is in is cut and one of the new forms of BLUE begins with the enemy 60 px in front of him: 'punch' (crouched, the repulsor mode off: the floor breaks under both, the face punch) or 'laser' (the mode on, walking back); scIronFormEnd looks at it 4 - 6 s later
  const g = CU_GAME[5]; if (!vs || vs.me !== 'cu5' || !g || !dummy || vs.ph !== 'fight') return; const n = pnow(); if (g.bh) irBhEnd(g, n); twFoeHere(n); if (!irhOk(n)) return; dummy.x = twPlace(twFloorData(vs.tw.fMe), wx + 60); cuAtkAt = -1; cuJumpAt = -1; cuDash = null; blkAt = blkEnd = -1; blockHeld = false; stickCr = false;
  const kl = keyL, kr = keyR; g.rp = kind === 'laser'; g.bhCd = g.bmCd = 0; stance = kind === 'punch' ? 'crouch' : 'stand'; if (kind === 'laser') { keyL = true; keyR = false; } const started = irBhStart(g, n); keyL = kl; keyR = kr; if (started) SC.ix = { kind, f: vs.tw.fMe, at: n };
}
function scIronFormEnd() {
  const g = CU_GAME[5]; if (!SC.ix || !vs || vs.me !== 'cu5') { SC.ix = null; return; } const k = g && g.bh && g.bh.kind; if (k && (SC.ix.kind === 'laser' ? k === 'laser' : k === 'gp' || k === 'gt')) scNote('fail', 'IRON MAN: THE ' + (SC.ix.kind === 'laser' ? 'LASER' : 'GROUND PUNCH') + ' IN THE SKYSCRAPER WAS STILL GOING 4 S AFTER IT BEGAN', 'PHASE ' + g.bh.ph + ', FLOOR ' + vs.tw.fMe + ' FROM ' + SC.ix.f); SC.ix = null;
}
function scIronSpin() {      // v1.202 Iron Man in the skyscraper: whatever the random player was doing, the move he is in is cut, the repulsor mode goes on and the SPIN BLAST begins with the enemy 60 px in front of him (both beams cut what is in their way); scIronSpinEnd looks at it 3 s later
  const g = CU_GAME[5]; if (!vs || vs.me !== 'cu5' || !g || !dummy || vs.ph !== 'fight') return; const n = pnow(); if (g.bh) irBhEnd(g, n); g.rp = true; g.bmCd = 0; twFoeHere(n); dummy.x = twPlace(twFloorData(vs.tw.fMe), wx + 60); cuAtkAt = -1; cuJumpAt = -1; cuDash = null; blkAt = blkEnd = -1; blockHeld = false; stance = 'stand'; stickCr = false;
  if (irsStart(g, n)) SC.is = { f: vs.tw.fMe, at: n };
}
function scIronSpinEnd() {
  const g = CU_GAME[5]; if (!SC.is || !vs || vs.me !== 'cu5') { SC.is = null; return; } if (g && g.bh && g.bh.kind === 'spin') scNote('fail', 'IRON MAN: THE SPIN BLAST IN THE SKYSCRAPER WAS STILL GOING 3 S AFTER IT BEGAN', 'PHASE ' + g.bh.ph + ', FLOOR ' + vs.tw.fMe + ', CAB ' + !!vs.tw.cab); SC.is = null;
}
function scIronUlt() {      // v1.203 Iron Man in the skyscraper: whatever the random player was doing, the move he is in is cut and his ULTIMATE begins with the enemy 60 px in front of him (the beam cuts what is in its way, the last burst breaks 3 floors under the enemy); scIronUltEnd looks at it 6 s later
  const g = CU_GAME[5]; if (!vs || vs.me !== 'cu5' || !g || !dummy || vs.ph !== 'fight') return; const n = pnow(); if (g.bh) irBhEnd(g, n); domReadyAt = 0; twFoeHere(n); dummy.x = twPlace(twFloorData(vs.tw.fMe), wx + 60); cuAtkAt = -1; cuJumpAt = -1; cuDash = null; blkAt = blkEnd = -1; blockHeld = false; stance = 'stand'; stickCr = false;
  if (irhOk(n)) { iruStart(g, n); SC.iu = { f: vs.tw.fMe, at: n }; }      // (iruStart, not the button: the energy and the wait are not what is looked at here)
}
function scIronUltEnd() {
  const g = CU_GAME[5]; if (!SC.iu || !vs || vs.me !== 'cu5') { SC.iu = null; return; } if (g && g.bh && g.bh.kind === 'uni') scNote('fail', 'IRON MAN: THE ULTIMATE IN THE SKYSCRAPER WAS STILL GOING 6 S AFTER IT BEGAN', 'PHASE ' + g.bh.ph + ', FLOOR ' + vs.tw.fMe + ', CAB ' + !!vs.tw.cab); SC.iu = null;
}
function scIronBeamEnd() {
  const g = CU_GAME[5]; if (!SC.ib || !vs || vs.me !== 'cu5') { SC.ib = null; return; } if (g && g.bh && g.bh.kind === 'beam') scNote('fail', 'IRON MAN: THE BLAST IN THE SKYSCRAPER WAS STILL GOING 6 S AFTER IT BEGAN', 'PHASE ' + g.bh.ph + ', FLOOR ' + vs.tw.fMe); SC.ib = null;
}
function scIronHugEnd() {
  const g = CU_GAME[5]; if (!SC.ih || !vs || vs.me !== 'cu5') { SC.ih = null; return; } if (g && g.bh && !g.bh.kind) scNote('fail', 'IRON MAN: THE BEAR HUG IN THE SKYSCRAPER WAS STILL GOING 5 S AFTER IT BEGAN', 'PHASE ' + g.bh.ph + ', FLOOR ' + vs.tw.fMe + ' FROM ' + SC.ih.f); SC.ih = null;
}
async function scTower() {
  SC.sec = 'SKYSCRAPER'; scCov('TOWER', 0, 5); SC.plan = 4 * 470 + 600; SC.done = 0; const keep = twPick; twPick = 1;
  try {
    for (const [w, seed] of [['cu4', 11], ['gojo', 12], ['yuji', 13], ['freddy', 14], ['cu5', 15]]) {
      const label = SC_NAME[w] + ' IN THE SKYSCRAPER'; SC.say = label;
      try { Object.assign(TR, { beh: 1, ehp: 0, php: 0, pce: 0 }); startPractice(w, 'cat'); } catch (e) { scErr(e, label + ' START'); continue; }
      if (state !== 'play' || !twOn()) { scNote('fail', 'THE SKYSCRAPER DID NOT START: ' + label, 'STATE ' + state); show('title'); continue; }
      if (!(await scIntro())) { show('title'); return; }
      const p = scPlayer(seed), ev = [[6, scIronHug], [100, scIronHugEnd], [64, () => scIronForm('punch')], [148, scIronFormEnd], [112, scIronBeam], [166, () => scIronForm('laser')], [232, scIronBeamEnd], [240, scIronFormEnd], [244, scIronSpin], [306, scIronSpinEnd], [8, scFredSlam], [10, scFredSlam], [12, scFredSlam], [16, () => { if (fredMe() && !fg && !fgCd) scNote('warn', 'FREDDY: THE GROUND SLAM DID NOT START IN THE SKYSCRAPER', 'STANCE ' + stance + ', PHASE ' + vs.ph + ', SPAWN ' + Math.round(pnow() - spawnAt) + ' MS, HURT ' + hurtAt + ', STUN ' + Math.round(pStun - pnow()) + ', FLOOR ' + vs.tw.fMe + ', AWAY ' + vs.tw.away + ', CAB ' + !!vs.tw.cab + ', WATER ' + fwPh); }], [20, scSigns], [30, () => twSlam('foe', 2, pnow(), dummy.x)], [90, () => { if (twOn() && dummy) twFoeHere(pnow()); }], [110, () => twMeFall(1, pnow(), wx)], [150, () => { const F = twFloorData(vs.tw.fMe); const o = { k: 'gas', x: Math.round(wx + 40), hp: 18, mx: 18, wob: 0, hitAt: -9999 }; F.objs.push(o); twDamageObj(F, o, 99, pnow()); }], [190, () => twCeiling('foe', 1, pnow(), dummy.x)], [235, () => { if (twOn() && dummy) twFoeHere(pnow()); }], [250, () => twFallOut('foe', pnow(), 1)],
        [60, () => { const F = twFloorData(vs.tw.fMe), d = F.doors.find(q => q.k === 'elev'); if (d) twDoorHit(F, d, 45, pnow()); }],      // (v1.175 the elevator: a hard hit jams a door (OUT OF ORDER) ...)
        [270, () => { const T = vs.tw; if (T.cab) return; const F = twFloorData(T.fMe), d = twElevOf(F), L = T.lift; if (!d) return; d.st = 0; d.hp = 70; L.f = L.curF = L.dest = T.fMe; L.ph = 'park'; L.inFoe = false; L.job = null; L.pend = null; wx = d.x; T.px = wx; twCabEnter(F, d, pnow()); }],      // (v1.176 ... you step into the one cab of the building: the cut inside, the panel, a floor button (0.6 s, then it goes), an emergency stop, another floor,
        [274, () => { if (vs.tw.cab) scPanel(); }],
        [276, () => { const T = vs.tw; if (T.cab) twCabPick(T.fMe > 20 ? T.fMe - 9 : T.fMe + 11, pnow()); }],
        [352, () => { const T = vs.tw; if (T.cab && T.lift.ph === 'ride') twCabStop(pnow()); }],
        [368, () => { const T = vs.tw; if (T.cab) twCabPick(T.fMe > 30 ? T.fMe - 4 : T.fMe + 6, pnow()); }],
        [440, () => { const T = vs.tw; if (T.cab) { if (T.lift.ph === 'park') twCabLeave(pnow()); } }],      // (... you step out (JUMP on the doors), call the cab down from the door, and a blast tears the door out: the shaft is open)
        [448, () => { const T = vs.tw; if (T.cab) return; const F = twFloorData(T.fMe), d = twElevOf(F); if (d) { d.st = 0; d.hp = 70; twLiftUse(F, d, pnow()); } }],
        [462, () => { const T = vs.tw; if (!T.cab) { const F = twFloorData(T.fMe), d = twElevOf(F); if (d) twDoorHit(F, d, 200, pnow()); } }],
        [476, scIronUlt], [590, scIronUltEnd]];      // (v1.203 Iron Man's scene is 130 frames longer than the others': after the cab, his ULTIMATE, and a look at it 6 s later)
      const ok = await scFrames(w === 'cu5' ? 600 : 470, i => {
        p.step(); if (i % 6 === 0) scCheck(); if (i % 40 === 39 && !twOn() && vs && vs.tw && vs.ph === 'fight' && state === 'play') ctGoIn(pnow());      // (v1.198 he walked out of the front door or through the glass: back in, so that the building is fought in)
        for (const [at, fn] of ev) if (i === at) { try { if (twOn() && vs.ph === 'fight') fn(); } catch (e) { scErr(e, label + ' EVENT ' + at); } }
        if (state !== 'play') { scNote('warn', 'THE FIGHT LEFT THE FIGHT SCREEN BY ITSELF: ' + label, 'STATE ' + state); }
      });
      p.end(); scCheck(); scCov('TOWER', 1, 0); show('title'); if (!ok) return;
    }
  } finally { twPick = keep; }
}

// ---------------------------------------------------------------- CITY (v1.198): the street and the skyscraper are one place: you walk into the front door of the building in the street and into the front door of its lobby, the enemy follows a moment later, a fall out of a window ends in the street (him or you), every round begins where the match began
async function scCityDoors(who) {      // a match that begins in the street: in through the front door of the building, the enemy follows, out through the front door of the lobby, the enemy follows; a door is walked into, not away from; a new round is in the street again
  const label = SC_NAME[who] + ' IN THE CITY'; SC.say = label; twPick = 0; Object.assign(TR, { beh: 0, ehp: 0, php: 0, pce: 0 });
  try { startPractice(who, 'cat'); } catch (e) { scErr(e, label + ' START'); return true; }
  if (state !== 'play' || twOn() || vs.tw) { scNote('fail', 'A STREET FIGHT DID NOT BEGIN IN THE STREET WITHOUT A BUILDING: ' + label, 'STATE ' + state + ', MAP ' + (vs && vs.map)); show('title'); return true; }
  if (!(await scIntro())) { show('title'); return false; }
  const walk = async (k, cond, n) => { scKey(k, true); const r = await scUntil(cond, n); scKey(k, false); return r; };
  wx = CITY.door + 90; dummy.x = wx + 90; ctS.px = wx; ctS.arm = true; ctS.lock = 0;
  scT(await walk('ArrowLeft', () => twOn(), 160), label + ': WALKING INTO THE FRONT DOOR OF THE BUILDING DID NOT TAKE HIM IN', 'WX ' + Math.round(wx) + ', DOOR ' + CITY.door);
  if (!twOn()) { show('title'); return true; }
  const T = vs.tw; scT(T.fMe === 1 && !T.out && vs.map === 'tower', label + ': HE IS NOT IN THE LOBBY AFTER THE FRONT DOOR', 'FLOOR ' + T.fMe);
  scT(await scUntil(() => !T.away, 120), label + ': THE ENEMY DID NOT FOLLOW HIM IN THROUGH THE FRONT DOOR', 'AWAY ' + T.away + ', VIA ' + T.via);
  const F = twFloorData(1); wx = twPlace(F, F.front.x + 90); dummy.x = twPlace(F, wx + 90); T.px = wx; T.dx = dummy.x; ctS.px = wx; ctS.arm = true; ctS.lock = 0;
  scT(await walk('ArrowLeft', () => !twOn(), 160), label + ': WALKING INTO THE FRONT DOOR OF THE LOBBY DID NOT TAKE HIM OUT', 'WX ' + Math.round(wx) + ', FRONT ' + F.front.x);
  if (twOn()) { show('title'); return true; }
  scT(vs.map === 'street' && T.out && T.fMe === 0, label + ': HE IS NOT IN THE STREET AFTER THE FRONT DOOR OF THE LOBBY', 'MAP ' + vs.map);
  scT((await scUntil(() => !T.away && dummy.ko < 0, 150)) && Number.isFinite(dummy.x) && Math.abs(dummy.x - wx) < 600, label + ': THE ENEMY DID NOT FOLLOW HIM OUT INTO THE STREET', 'AWAY ' + T.away + ', FOE FLOOR ' + T.fFoe);
  wx = CITY.door + 8; ctS.px = wx; ctS.arm = true; ctS.lock = 0; await scFrames(2);
  scKey('ArrowRight', true); await scFrames(40); scKey('ArrowRight', false); scT(!twOn(), label + ': WALKING AWAY FROM THE FRONT DOOR TOOK HIM IN', 'MAP ' + vs.map);
  beginRound(pnow()); await scFrames(4); scT(!twOn() && vs.map === 'street' && !!vs.tw && vs.tw.out && wx === 0, label + ': A NEW ROUND DID NOT BEGIN IN THE STREET', 'MAP ' + vs.map + ', WX ' + wx);
  scCheck(); show('title'); return true;
}
async function scCityWindow(who, side) {      // a match that begins in the skyscraper: side 'me' = he is thrown out of the glass at the end of the floor, the camera falls and he lands in the street, the enemy comes after him; side 'foe' = the enemy is thrown out and he jumps out after him
  const label = SC_NAME[who] + (side === 'me' ? ' OUT OF A WINDOW' : ' AFTER THE ENEMY OUT OF A WINDOW'); SC.say = label; twPick = 1; Object.assign(TR, { beh: 0, ehp: 0, php: 0, pce: 0 });
  try { startPractice(who, 'cat'); } catch (e) { scErr(e, label + ' START'); return true; }
  if (state !== 'play' || !twOn()) { scNote('fail', 'THE SKYSCRAPER DID NOT START: ' + label, 'STATE ' + state); show('title'); return true; }
  if (!(await scIntro())) { show('title'); return false; }
  const T = vs.tw, F = twFloorData(T.fMe), s = side === 'me' ? 1 : 0; F.outer[s].broken = true;
  if (side === 'me') wx = s ? F.W + 12 : -12; else { dummy.x = s ? F.W + 12 : -12; T.dx = wx; }
  scT(await scUntil(() => !twOn(), 160), label + ': THE FALL DID NOT END IN THE STREET', 'FLOOR ' + T.fMe + ', SLIDE ' + !!T.slide + ', AWAY ' + T.away);
  if (twOn()) { show('title'); return true; }
  scT(vs.map === 'street' && Math.abs(wx - ctLand(s)) < 6, label + ': HE LANDED IN THE WRONG PLACE', 'WX ' + Math.round(wx) + ', WANTED ' + ctLand(s));
  scT((await scUntil(() => !T.away && dummy.ko < 0, 220)) && Number.isFinite(dummy.x) && Math.abs(dummy.x - wx) < 600, label + ': THE ENEMY IS NOT IN THE STREET WITH HIM', 'AWAY ' + T.away + ', VIA ' + T.via + ', FOE FLOOR ' + T.fFoe);
  scCheck(); show('title'); return true;
}
async function scCity() {
  SC.sec = 'CITY'; scCov('CITY', 0, 6); SC.plan = 6 * 220; SC.done = 0; const keep = twPick;
  try {
    for (const who of ['gojo', 'cu5']) {
      if (!(await scCityDoors(who))) return; scCov('CITY', 1, 0);
      if (!(await scCityWindow(who, 'me'))) return; scCov('CITY', 1, 0);
      if (!(await scCityWindow(who, 'foe'))) return; scCov('CITY', 1, 0);
    }
  } finally { twPick = keep; scKey('ArrowLeft', false); scKey('ArrowRight', false); }
}

async function scTicks() {      // v1.201 ONE TICK EFFECT AT A TIME (a bleed, a burn, a scald): while one runs on a fighter every other one that would start is ignored, it deals the same amount at every tick until it is over and when it has faded the next blow starts it again; on the enemy and on you, with Sukuna's slashes (they used to add up), his fire arrow and the bleeding of lost limbs
  SC.sec = 'TICKS'; scCov('TICKS', 0, 2); SC.plan = 2 * 220; SC.done = 0; const keep = twPick; twPick = 0;
  try {
    for (const who of ['cu3', 'gojo']) {
      const label = SC_NAME[who] + ' TICK EFFECTS'; SC.say = label; SET.gore = 0; Object.assign(TR, { beh: 0, ehp: 0, php: 0, pce: 0 });
      try { startPractice(who, 'gojo'); } catch (e) { scErr(e, label + ' START'); continue; }
      if (state !== 'play' || !dummy) { scNote('fail', 'THE FIGHT DID NOT START: ' + label, 'STATE ' + state); show('title'); continue; }
      if (!(await scIntro())) { show('title'); return; }
      const n = pnow(), d = dummy; d.bleed = d.sburn = null; vs.bleed = vs.fburn = vs.fscald = null; d.ko = -1; d.hp = d.max = 1000; d.x = wx + 60;
      const A = { until: n + 4000, next: n + 100 }, a = dotStart('f', 'bleed', A, n), b = dotStart('f', 'bleed', { until: n + 8000, next: n + 100 }, n + 10), c = dotStart('f', 'sburn', { until: n + 8000, next: n + 500 }, n + 20);
      scT(a && !b && !c && d.bleed === A && !d.sburn, label + ': A SECOND BLEED OR A BURN STARTED ON THE ENEMY WHILE A BLEED WAS RUNNING', 'STARTED ' + a + ' ' + b + ' ' + c + ', SAME ' + (d.bleed === A) + ', BURN ' + !!d.sburn);
      const gone = !dotOnF(n + 4001), again = dotStart('f', 'sburn', { until: n + 12000, next: n + 4500 }, n + 4100);
      scT(gone && again && !!d.sburn, label + ': NOTHING STARTED ON THE ENEMY AFTER THE BLEED HAD FADED', 'GONE ' + gone + ', STARTED ' + again); d.bleed = d.sburn = null;
      const f1 = dotStart('p', 'fburn', { until: n + 8000, next: n + 500 }, n), f2 = dotStart('p', 'fburn', { until: n + 8000, next: n + 500 }, n + 5), f3 = dotStart('p', 'bleed', { until: n + 2000, next: n + 100 }, n + 6), f4 = dotStart('p', 'fscald', { until: n + 6000, next: n + 450 }, n + 7), f5 = dotStart('p', 'fscald', { until: n + 14000, next: n + 8500 }, n + 8001);
      scT(f1 && !f2 && !f3 && !f4 && f5, label + ': A SECOND TICK EFFECT STARTED ON HIM WHILE ONE WAS RUNNING, OR NONE AFTER IT HAD FADED', 'STARTED ' + [f1, f2, f3, f4, f5].join(' ')); vs.bleed = vs.fburn = vs.fscald = null;
      if (who === 'cu3') {      // the CUT STORM and what comes after it: one plain bleed, 13.3 of health in all; the later cuts add nothing; a cut after it has faded starts the longer one
        suCast = { hits: 0 }; const hp0 = d.hp; let all = true; for (let i = 0; i < 8; i++) { suCutAt(n + i * 40, i, 8); all = all && !!d.bleed; }
        const b1 = d.bleed, plain = !!b1 && b1.st === undefined && b1.dm === SU_BLEED.dm && b1.gap === SU_BLEED.gap; suBleed(d, n + 500, SU_DIS.bleed); suBleed(d, n + 600, SU_DASH.bleed); const same = d.bleed === b1;
        vpBleed(n + 4500); const lost = hp0 - d.hp, ended = !d.bleed, long = suBleed(d, n + 5000, SU_DIS.bleed); vpBleed(n + 14000);
        scT(all && plain && same, label + ': THE CUT STORM, DISMANTLE AND THE DASH SLASH DID NOT LEAVE ONE PLAIN BLEED', 'ALL ' + all + ', PLAIN ' + plain + ', SAME ' + same);
        scT(Math.abs(lost - SU_BLEED.dm * SU_BLEED.ms / SU_BLEED.gap) < 0.6 && ended, label + ': THE BLEED DID NOT TAKE THE SAME AMOUNT OF HEALTH AS ONE BLEED', 'LOST ' + lost.toFixed(2) + ', ONE BLEED ' + (SU_BLEED.dm * SU_BLEED.ms / SU_BLEED.gap).toFixed(2));
        scT(long && !d.bleed, label + ': A CUT AFTER THE BLEED HAD FADED DID NOT START ANOTHER ONE', 'STARTED ' + long); suCast = null; d.bleed = null;
        d.hp = d.max; dotStart('f', 'bleed', { until: n + 4000, next: n + 30, gap: 30, dm: 0.1, quiet: true }, n); const burned = suFlHit(n + 100, {}) && !!d.sburn; d.bleed = null; suFlHit(n + 200, {}); const s1 = d.sburn; suFlHit(n + 3000, {}); const until = s1 ? s1.until - (n + 200) : 0;
        scT(!burned && !!s1 && d.sburn === s1 && until === SU_FL.burn.ms, label + ': A FIRE ARROW BURNED HIM WHILE HE BLED, OR A SECOND ARROW STARTED THE BURN AGAIN', 'BURNED ' + burned + ', SAME ' + (d.sburn === s1) + ', UNTIL ' + until); d.sburn = null;
        const nog = window.__noGore, B = GB.p; window.__noGore = false; SET.gore = 0;
        if (gdActive('p')) {      // the bleeding of lost limbs: the same amount for one limb and for three, none while a bleed runs on him
          B.st.an = 2; B.st.af = 2; B.st.lf = 2; B.last = vs.hp = PHP; B.bleedAt = n - 1; goreTick(n, 16); const three = PHP - vs.hp;
          B.st.af = 0; B.st.lf = 0; vs.hp = B.last = PHP; B.bleedAt = n + 100; goreTick(n + 101, 16); const one = PHP - vs.hp;
          vs.hp = B.last = PHP; B.bleedAt = n + 700; vs.bleed = { until: n + 5000, next: n + 5000 }; goreTick(n + 701, 16); const during = PHP - vs.hp; vs.bleed = null;
          scT(three > 0 && Math.abs(three - one) < 1e-9 && during === 0, label + ': THE BLEEDING OF LOST LIMBS ADDS UP WITH THE NUMBER OF LIMBS, OR WENT ON WHILE A BLEED RAN', 'THREE ' + three.toFixed(2) + ', ONE ' + one.toFixed(2) + ', DURING ' + during.toFixed(2));
        } else scNote('warn', label + ': THE BLEEDING OF LOST LIMBS WAS NOT TESTED', 'GORE IS NOT ACTIVE FOR HIM');
        Object.assign(GB.p, goreBody()); window.__noGore = nog; vs.hp = PHP;
      }
      scCheck(); show('title'); scCov('TICKS', 1, 0);
    }
  } finally { twPick = keep; }
}

const SC_SEC = [['DATA', 3, async () => { SC.sec = 'DATA'; scData(); await scFrames(1); }], ['MENUS', 15, scMenus], ['FIGHTERS', 30, scFighters], ['MOVES', 40, scMoves], ['ADMIN', 16, scAdmin], ['CANVAS', 6, scCanvas], ['CLASH', 4, scClash], ['ACHIEVEMENTS', 12, scAch], ['CH 5 FIGHT', 14, scK5], ['CUTSCENES', 40, scCuts], ['STORY', 45, scStory], ['SKYSCRAPER', 14, scTower], ['CITY', 10, scCity], ['TICKS', 6, scTicks], ['MORE FIGHTS', 0, scMore]];      // [name, seconds it may take at most (the last one takes what is left of the minute)]
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
const SC_COVN = { TABLES: 'THE TABLES', SCREENS: 'SCREENS', FIGHTERS: 'FIGHTERS', MOVES: 'MOVES', ADMIN: 'ADMIN BOX OF THE TRAINING', CANVAS: 'CANVAS AFTER AN ERROR', CLASH: 'BEAM CLASH', ACHIEVEMENTS: 'ACHIEVEMENTS', 'CH 5 FIGHT': 'CHAPTER 5 FIGHT AND IRON MAN\'S MOVES', CUTSCENES: 'FATALITIES AND DOMAINS', TOWER: 'SKYSCRAPER FIGHTS', CITY: 'CITY DOORS AND FALLS', TICKS: 'TICK EFFECTS, ONE AT A TIME', SCENES: 'STORY SCENES', ROUNDS: 'EXTRA ROUNDS OF 14 FIGHTS' };
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
