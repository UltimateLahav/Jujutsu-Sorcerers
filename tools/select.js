// ---------------------------------------------------------------- v1.180 THE SELECT REMASTER (user: "remaster the entire choosing a character screen ... Training, Battle, Wifi ... a row with 3 characters then 4 ... the characters you choose on the side in their idle animation ... the map as 2 big buttons"). BATTLES opens three cards (TRAINING, BATTLE, WIFI). TRAINING and BATTLE share ONE fighter screen (3 faces on top, 4 below, a big idle fighter on each side: you left, the enemy right), then the MAP screen (two big pictures), then the fight (BATTLE shows a VS splash first). The Wi-Fi room's own fighter screen (state 'lansel') is built from the same pieces. All of it is plain DOM plus a few small canvases that tick() draws (bsDraw, fsDraw, mpDraw, vsxDraw, lanSelDraw).
// Spliced late (build_html.py, the select placeholder of the template), so every fighter, the saves, the grades and the map choice (twPick) exist.
const SEL = {      // the seven fighters: short name, panel name, a tag, three signature moves, a colour, and the top left corner of his 28 x 28 face in his idle picture
  gojo: { nm: 'GOJO', full: 'GOJO', tag: 'THE STRONGEST', mv: ['LAPSE BLUE', 'REVERSAL RED', 'HOLLOW PURPLE'], col: [59, 107, 255], face: [3, 0] },
  yuji: { nm: 'YUJI', full: 'YUJI', tag: 'THE VESSEL', mv: ['DIVERGENT FIST', 'BLACK FLASH', 'THE ZONE'], col: [255, 111, 165], face: [7, 1] },
  cu4: { nm: 'RYU', full: 'RYU', tag: 'THE BRAWLER', mv: ['5-HIT COMBO', 'GRANITE BLAST', 'JUST THIS ONCE'], col: [23, 227, 255], face: [22, 3] },
  verity: { nm: 'VERITY', full: 'VERITY', tag: 'CURSED SPIRIT', mv: ['BITE', 'SMOKE BALL', 'JUMPSCARE'], col: [232, 201, 74], face: [18, 0] },
  cat: { nm: 'CAT', full: 'CARTOON<br>CAT', tag: 'CURSED SPIRIT', mv: ['CARTOON ATTACK', 'GIANT KICK', 'ARM HANG'], col: [200, 204, 216], face: [19, 0] },
  freddy: { nm: 'FREDDY', full: 'FREDDY<br>KRUEGER', tag: 'CURSED SPIRIT', mv: ['PIERCE', 'BOILING WATER', 'DREAM'], col: [70, 196, 106], face: [21, 1] },
  cu3: { nm: 'SUKUNA', full: 'SUKUNA', tag: 'KING OF CURSES', mv: ['DISMANTLE', 'CLEAVE MODE', 'MALEVOLENT SHRINE'], col: [255, 58, 74], face: [21, 1] } };
const SEL_ROWS = [['gojo', 'yuji', 'cu4'], ['verity', 'cat', 'freddy', 'cu3']], FS_ORDER = [].concat(...SEL_ROWS), FACE = 28;      // 3 on top, 4 below (the humans first)
const selRgb = (c, a) => 'rgba(' + c[0] + ',' + c[1] + ',' + c[2] + ',' + a + ')';
const fsPic = (who, now, inv) => {      // the idle picture of any of the seven (a canvas), or null while a fighter's pictures are not cut yet
  if (who.slice(0, 2) === 'cu') return cuIdleCv(who, now) || null;
  const f = lanIdlePic(who, now, inv); return f && f.width ? f : null;
};
const fsHot = who => who === 'gojo' ? D.idle.cx - D.idle.x0 : who === 'yuji' ? YU.idle.cx - YU.idle.x0 : 32, fsTop = who => who === 'gojo' ? D.idle.top || 0 : who === 'yuji' ? YU.idle.top || 0 : 0;      // (where his middle is in his picture, and how many rows of head room it has: the same numbers the fight uses)
// ---- who may be picked where. mode: 'train' | 'battle' | 'wifi'; side 0 = you, 1 = the enemy. '' = free, else the reason the face is greyed
function fsWhy(mode, side, who) {
  const cu = who === 'cu3' || who === 'cu4';
  if (mode === 'wifi') return LAN_FIGHTERS.includes(who) ? '' : 'NOT ONLINE';
  if (mode === 'train') return side === 0 ? (who === 'cu3' && !suHas() ? 'LOCKED' : '') : TRF.includes(who) ? '' : 'NOT AS ENEMY';      // (Sukuna is bought for $3000; the training enemy is Gojo, Yuji, Verity or the Cat, see TRF)
  if (cu) return who === 'cu3' && !suHas() ? 'LOCKED' : '';      // (v1.189 Sukuna and Ryu fight in Battle too, on both sides; Sukuna is still bought for $3000)
  return who !== 'gojo' && !owns(who) ? 'LOCKED' : '';      // (bought on the SKILLS page, like before)
}
const FS_BADGE = { 'LOCKED': 'LOCKED', 'TRAINING ONLY': 'TRAIN<br>ONLY', 'NOT AS ENEMY': 'NOT AS<br>ENEMY', 'NOT ONLINE': 'NOT<br>ONLINE' };
const fsHintText = (who, why) => why === 'LOCKED' ? (who === 'cu3' ? 'SUKUNA IS LOCKED: BUY HIM FOR $3000 IN SKILLS > CHARACTERS' : SEL[who].nm + ' IS LOCKED: BUY HIM IN SKILLS > CHARACTERS') : why === 'TRAINING ONLY' ? SEL[who].nm + ' CAN ONLY FIGHT IN TRAINING FOR NOW' : why === 'NOT AS ENEMY' ? SEL[who].nm + ' CANNOT BE THE ENEMY YET' : SEL[who].nm + ' IS NOT IN WI-FI FIGHTS YET';
let fsMsgAt = 0;
function fsSay(el, text) { el.textContent = text; fsMsgAt = performance.now() + 2800; el.dataset.on = '1'; }      // a short line under the faces (why a face is greyed), gone after a moment
function fsSayTick(el) { if (el.dataset.on && performance.now() > fsMsgAt) { el.dataset.on = ''; if (el.dataset.def) el.textContent = el.dataset.def; else el.innerHTML = '&nbsp;'; } }      // (back to its own line: the Wi-Fi screen keeps "more online moves come ..." there)
// ---- the faces (the 3 + 4 tiles) and the two big fighters
function fsTiles(box, onTap) {      // builds the two rows of faces in box; returns { who: { el, cv, em, key } }
  box.textContent = ''; const out = {};
  for (const row of SEL_ROWS) {
    const r = document.createElement('div'); r.className = 'fsr';
    for (const who of row) {
      const b = document.createElement('button'); b.className = 'fst'; b.dataset.who = who; b.dataset.mark = ''; b.innerHTML = '<canvas width="' + FACE + '" height="' + FACE + '"></canvas><em></em><b>' + SEL[who].nm + '</b>';
      b.addEventListener('click', () => onTap(who)); r.appendChild(b); out[who] = { el: b, cv: b.firstChild, em: b.children[1], key: '' };
    }
    box.appendChild(r);
  }
  return out;
}
function fsTileSet(t, why, hot, mark, side2, who) {      // a face's look: greyed (and why), the cursor, a P1 / P2 mark
  t.el.classList.toggle('no', !!why); t.el.classList.toggle('lk', why === 'LOCKED'); t.el.classList.toggle('hot', !!hot); t.el.classList.toggle('s2', !!side2); t.el.dataset.mark = mark || '';
  const b = why ? FS_BADGE[why] : ''; if (t.em.innerHTML !== b) t.em.innerHTML = b;
  t.el.setAttribute('aria-label', SEL[who].nm + (why ? ': ' + why : ''));
}
function fsFaceDraw(t, who, now, real) {      // the face: his idle picture cropped to the head on a patch of his colour; only the face under the cursor moves (the others are looked at again twice a second)
  const f = SEL[who], key = now ? 'a' + Math.floor(now / (1000 / IDLE_FPS)) : 's' + Math.floor(real / 500); if (t.key === key) return; t.key = key;
  const g = t.cv.getContext('2d'), pic = fsPic(who, now, false); g.clearRect(0, 0, FACE, FACE); g.fillStyle = selRgb(f.col, 0.34); g.fillRect(0, 0, FACE, FACE);
  g.fillStyle = selRgb(f.col, 0.5); g.fillRect(0, FACE - 4, FACE, 4);      // (a strip of floor colour under the chin)
  if (pic) g.drawImage(pic, f.face[0], f.face[1], FACE, FACE, 0, 0, FACE, FACE);
}
function fsTilesDraw(tiles, hot, now) { for (const who of FS_ORDER) fsFaceDraw(tiles[who], who, who === hot ? now : 0, now); }
function fsPanelMake(el, side) {      // a big fighter on a coloured stage: side 0 = you (left, red), 1 = the enemy (right, blue, he faces left)
  el.className = 'fsp ' + (side ? 'r p2' : 'p1') + ' empty'; el.innerHTML = '<div class="fsbg"></div><span class="fssd">' + (side ? 'ENEMY' : 'YOU') + '</span><span class="fsrd">READY</span><span class="fsq">?</span><canvas class="fsbig" width="64" height="64"></canvas><b class="fsnm">?</b><i class="fstg"></i><ul class="fsmv"></ul>';
  return { el, cv: el.querySelector('canvas'), nm: el.querySelector('.fsnm'), tg: el.querySelector('.fstg'), mv: el.querySelector('.fsmv'), who: '', key: '' };
}
function fsPanelSet(p, who, o) {      // o: { tag (instead of his own), moves (instead of his own), inv ("(INV.)"), act (it is this side's turn), ready }
  const s = who ? SEL[who] : null; p.who = who || ''; const c = s ? s.col : [109, 106, 122], st = p.el.style;
  st.setProperty('--fc', 'rgb(' + c + ')'); st.setProperty('--ft', 'rgb(' + c.map(v => Math.round(v + (255 - v) * 0.5)) + ')'); st.setProperty('--fg', selRgb(c, 0.45)); st.setProperty('--fl', selRgb(c, 0.17));
  const nm = s ? s.full + (o.inv ? '<br><span class="fsiv">(INV.)</span>' : '') : '?', tg = o.tag !== undefined ? o.tag : s ? s.tag : '', mv = (o.moves || (s ? s.mv : [])).map(m => '<li>' + m + '</li>').join('');
  if (p.nm.innerHTML !== nm) p.nm.innerHTML = nm; if (p.tg.textContent !== tg) p.tg.textContent = tg; if (p.mv.innerHTML !== mv) p.mv.innerHTML = mv;
  p.el.classList.toggle('empty', !s); p.el.classList.toggle('act', !!o.act); p.el.classList.toggle('ready', !!o.ready);
}
function fsPanelDraw(p, now, inv) {      // his idle animation, as big as the panel allows (the picture is as wide as the fighter's own pictures)
  const pic = p.who ? fsPic(p.who, now, !!inv) : null, w = pic ? pic.width : 64, g = p.cv.getContext('2d');
  if (p.cv.width !== w) p.cv.width = w;
  g.clearRect(0, 0, p.cv.width, 64); if (pic) g.drawImage(pic, 0, 0);
}
// ---- the picks that are remembered (js_fsv), and the state of the TRAINING / BATTLE fighter screen
const FSV = { train: { me: 'gojo', foe: 'gojo' }, battle: { me: 'gojo', foe: 'gojo' } };
try { const o = JSON.parse(localStorage.getItem('js_fsv') || '{}'); for (const m of ['train', 'battle']) if (o[m] && SEL[o[m].me] && SEL[o[m].foe]) FSV[m] = { me: o[m].me, foe: o[m].foe }; } catch { /* the picks just are not kept */ }
const fsSave = () => { try { localStorage.setItem('js_fsv', JSON.stringify(FSV)); } catch { /* the picks just are not kept */ } };
const fs = { mode: 'train', step: 1, me: '', foe: '', cur: 'gojo', tapped: '', rnd: null };      // step 1: you choose, step 2: the enemy; cur = the face under the cursor; tapped = the face you tapped last (a second tap on it chooses it)
const fsL = fsPanelMake($('fsL'), 0), fsR = fsPanelMake($('fsR'), 1), fsT = fsTiles($('fsGrid'), who => fsTap(who));
const fsFirst = (mode, side) => FS_ORDER.find(w => !fsWhy(mode, side, w)) || 'gojo', fsOk = (mode, side, who) => !!who && !fsWhy(mode, side, who);
function fsOpen(mode) {      // TRAINING or BATTLE: the fighter screen from the start (your fighter first)
  audio(); cuSelRefresh(); show('fsel'); const v = FSV[mode];      // (show first: leaving a match calls this while the state is still 'play', where every move and fighter counts as owned)
  Object.assign(fs, { mode, step: 1, me: '', foe: '', cur: fsOk(mode, 0, v.me) ? v.me : fsFirst(mode, 0), tapped: '', rnd: null });
  if (mode === 'battle') buildGrades();
  fsRefresh();
}
function fsReturn() {      // BACK from the map screen: the same screen, your fighter chosen, the enemy under the cursor
  audio(); cuSelRefresh(); show('fsel'); fs.step = 2; fs.tapped = ''; fs.rnd = null; fs.cur = fsOk(fs.mode, 1, fs.foe) ? fs.foe : fsOk(fs.mode, 1, FSV[fs.mode].foe) ? FSV[fs.mode].foe : fsFirst(fs.mode, 1);
  if (fs.mode === 'battle') buildGrades();
  fsRefresh();
}
function fsRefresh() {      // everything the fighter screen shows, from fs
  const m = fs.mode, st = fs.step, side = st - 1, me = st === 1 ? fs.cur : fs.me, foe = st === 2 ? fs.cur : '', inv = !!foe && foe === me;
  $('fsTitle').textContent = st === 1 ? 'CHOOSE YOUR FIGHTER' : 'CHOOSE THE ENEMY';
  fsPanelSet(fsL, me, { act: st === 1, ready: st === 2 }); fsPanelSet(fsR, foe, { act: st === 2, inv, tag: foe ? undefined : st === 1 ? 'AFTER YOU' : '' });
  for (const who of FS_ORDER) fsTileSet(fsT[who], fsWhy(m, side, who), who === fs.cur, st === 2 && who === fs.me ? 'P1' : '', st === 2, who);
  $('fsOk').disabled = !fsOk(m, side, fs.cur) || !!fs.rnd; $('fsRand').disabled = !!fs.rnd;
  $('fsCity').style.display = m === 'train' && st === 2 && fs.me === 'gojo' ? '' : 'none';      // (the old free play as Gojo: the street with the bystanders, no enemy)
  $('fsGrades').style.display = m === 'battle' ? '' : 'none'; $('fsNote').textContent = m === 'battle' ? 'DIFFICULTY: BEAT A GRADE TO UNLOCK THE NEXT' : 'TRAINING: EVERY MOVE IS FREE, NO ENERGY LIMIT, YOU CANNOT LOSE. SETTINGS > TRAIN CHANGES THE ENEMY';
  fsMsgAt = 0; fsSayTick($('fsMsg'));
}
function fsTap(who) {      // a face: the first tap puts the cursor on it, a second tap chooses it
  if (fs.rnd) return; const why = fsWhy(fs.mode, fs.step - 1, who);
  if (why) { snd('fsno'); fsSay($('fsMsg'), fsHintText(who, why)); return; }
  if (fs.tapped === who) { fsConfirm(); return; }
  fs.cur = who; fs.tapped = who; snd('fsmove'); fsRefresh();
}
function fsConfirm() {      // SELECT: step 1 -> the enemy, step 2 -> the map
  if (fs.rnd) return; const side = fs.step - 1, who = fs.cur; if (!fsOk(fs.mode, side, who)) { snd('fsno'); return; }
  snd('fsok'); fs.tapped = '';
  if (fs.step === 1) { fs.me = who; fs.step = 2; const v = FSV[fs.mode].foe; fs.cur = fsOk(fs.mode, 1, v) ? v : fsFirst(fs.mode, 1); fsRefresh(); return; }
  fs.foe = who; FSV[fs.mode] = { me: fs.me, foe: fs.foe }; fsSave(); mpOpen();
}
function fsBack() {      // BACK: the enemy step goes back to yours, yours goes back to the three cards
  if (fs.rnd) fs.rnd = null;
  if (fs.step === 2) { fs.step = 1; fs.cur = fs.me; fs.me = ''; fs.tapped = ''; fsRefresh(); return; }
  show('bsel');
}
function fsRandom() {      // RANDOM: the cursor runs over the faces you may pick and lands on one (SELECT then chooses it)
  if (fs.rnd) return; const side = fs.step - 1, ok = FS_ORDER.filter(w => fsOk(fs.mode, side, w)); if (!ok.length) return;
  const pool = ok.length > 1 ? ok.filter(w => w !== fs.cur) : ok, fin = pool[Math.floor(Math.random() * pool.length)], seq = []; let i = Math.floor(Math.random() * ok.length);
  for (let k = 0; k < 8; k++) seq.push(ok[(i + k) % ok.length]); seq.push(fin);
  fs.rnd = { t0: performance.now(), seq, k: -1, fin }; fs.tapped = ''; fsRefresh();
}
function fsRndTick() {      // the shuffle: a new face every 70 ms, the last one stays
  const r = fs.rnd; if (!r) return; const k = Math.min(r.seq.length - 1, Math.floor((performance.now() - r.t0) / 70));
  if (k !== r.k) { r.k = k; fs.cur = r.seq[k]; snd(k === r.seq.length - 1 ? 'fsok' : 'fsmove'); fsPanelSet(fs.step === 1 ? fsL : fsR, fs.cur, fs.step === 1 ? { act: true } : { act: true, inv: fs.cur === fs.me }); for (const who of FS_ORDER) fsTileSet(fsT[who], fsWhy(fs.mode, fs.step - 1, who), who === fs.cur, fs.step === 2 && who === fs.me ? 'P1' : '', fs.step === 2, who); }
  if (k === r.seq.length - 1 && performance.now() - r.t0 > r.seq.length * 70 + 150) { fs.rnd = null; fsRefresh(); }
}
function fsDraw(now) {      // every frame of the fighter screen
  fsRndTick(); const st = fs.step, me = st === 1 ? fs.cur : fs.me, foe = st === 2 ? fs.cur : '', inv = !!foe && foe === me;
  fsPanelDraw(fsL, now, false); fsPanelDraw(fsR, now, inv); fsTilesDraw(fsT, fs.cur, now); fsSayTick($('fsMsg'));
}
$('fsOk').addEventListener('click', fsConfirm); $('fsBack').addEventListener('click', fsBack); $('fsRand').addEventListener('click', fsRandom);
$('fsCity').addEventListener('click', () => { audio(); FSV.train = { me: 'gojo', foe: FSV.train.foe }; fsSave(); show('play'); skillUI(); });      // (free play as Gojo, as it was: the street with the bystanders, no enemy, all his moves free)
// ---- the three cards of BATTLES: TRAINING, BATTLE, WIFI (a small picture on each, drawn with pixels)
const BS_CV = [$('bsTrain').firstChild, $('bsBattle').firstChild, $('bsWifi').firstChild], BS_ARCS = [];
for (const r of [10, 18, 26]) { const pts = []; for (let y = 0; y < 64; y++) for (let x = 0; x < 64; x++) { const dx = x - 32 + 0.5, dy = y - 52 + 0.5, d = Math.hypot(dx, dy), a = Math.atan2(dy, dx); if (d >= r - 1.5 && d <= r + 1.5 && a < -0.62 && a > -2.52) pts.push([x, y]); } BS_ARCS.push(pts); }      // (the three arcs of the Wi-Fi sign: pixels at 10, 18 and 26 px from its dot, in the upper cone)
for (const c of BS_CV) { c.width = c.height = 64; }
function bsDraw(now) {
  { const g = BS_CV[0].getContext('2d'); g.clearRect(0, 0, 64, 64); const sw = Math.sin(now / 520) * 3.2, R = (y, w, col, dx) => { g.fillStyle = col; g.fillRect(Math.round(32 - w / 2 + sw * (y / 64) + (dx || 0)), y, w, 1); };      // a punching bag swinging on its chain (every row is shifted a little more than the one above it)
    for (let y = 0; y < 9; y++) R(y, 2, y % 2 ? '#8a8aa0' : '#c4c4d4'); R(9, 6, '#6a6a80');
    for (let y = 10; y < 52; y++) { const w = y < 13 ? 16 + (y - 10) * 2 : y > 47 ? Math.round(22 - (y - 47) * 2.5) : 22, belt = y === 17 || y === 18 || y === 41 || y === 42; R(y, w, belt ? '#2a0508' : '#b3121f'); R(y, 3, belt ? '#2a0508' : '#e0495a', -w / 2 + 2.5); R(y, 4, belt ? '#1a0306' : '#6e0c14', w / 2 - 2); }
    R(52, 8, '#4a0810'); g.fillStyle = 'rgba(0,0,0,.35)'; g.fillRect(20, 60, 24, 1); g.fillRect(16, 61, 32, 1); g.fillRect(20, 62, 24, 1); }
  { const g = BS_CV[1].getContext('2d'); g.clearRect(0, 0, 64, 64); const spark = Math.floor(now / 170) % 3, put = (who, x, flip) => { const pic = fsPic(who, now, false); if (!pic) return; g.save(); g.translate(x, 0); if (flip) g.scale(-1, 1); g.drawImage(pic, -fsHot(who), 0); g.restore(); };      // Gojo and Yuji face to face with a spark between them
    put('gojo', 17, false); put('yuji', 47, true); g.fillStyle = spark === 0 ? '#ffd34d' : spark === 1 ? '#ffffff' : '#e0242f'; const cx = 32, cy = 28; g.fillRect(cx - 1, cy - 5, 2, 10); g.fillRect(cx - 5, cy - 1, 10, 2); g.fillRect(cx - 3, cy - 3, 6, 6); }
  { const g = BS_CV[2].getContext('2d'); g.clearRect(0, 0, 64, 64); const lit = Math.floor(now / 380) % 5; BS_ARCS.forEach((pts, i) => { g.fillStyle = i < lit ? '#39a2ff' : '#243a55'; for (const [x, y] of pts) g.fillRect(x, y, 1, 1); if (i < lit) { g.fillStyle = '#bfe3ff'; for (let k = 0; k < pts.length; k += 7) g.fillRect(pts[k][0], pts[k][1], 1, 1); } }); g.fillStyle = '#39a2ff'; g.fillRect(29, 49, 6, 6); g.fillStyle = '#bfe3ff'; g.fillRect(30, 50, 2, 2); }      // (the dot and the arcs of the Wi-Fi sign light up one after the other)
}
$('bsTrain').addEventListener('click', () => fsOpen('train'));
$('bsBattle').addEventListener('click', () => fsOpen('battle'));
$('bsWifi').addEventListener('click', () => { audio(); show('lan'); lanStop(); $('lanCreate').disabled = $('lanBrowse').disabled = !LAN; });      // (the Wi-Fi rooms, exactly as the old WI-FI ROOMS card opened them)
$('bsBack').addEventListener('click', () => show('modes'));
$('battles').addEventListener('click', () => { audio(); show('bsel'); });
// ---- the MAP screen: two big pictures (the street and the skyscraper, taken from the game's own art), your two fighters standing in them; a tap picks a map (twPick, kept in js_map), START begins
const MP_IMG = ['__MAPSTREET__', '__MAPTOWER__'].map(src => { const im = new Image(); im.src = src; return im; }), MP_CV = [$('mpStreet').firstChild, $('mpTower').firstChild];
function mpOpen() { audio(); show('msel'); mpRefresh(); }
function mpRefresh() { $('mpStreet').classList.toggle('sel', !twPick); $('mpTower').classList.toggle('sel', !!twPick); }
function mpPick(i) { twPick = i; try { localStorage.setItem('js_map', String(twPick)); } catch { /* the choice just is not kept */ } snd('fsmove'); mpRefresh(); }
function mpDraw(now) {      // both pictures with the two fighters in them (idle, facing each other on the floor line)
  const me = fs.me, foe = fs.foe, inv = !!foe && foe === me;
  MP_CV.forEach((c, i) => {
    const g = c.getContext('2d'), im = MP_IMG[i]; if (c.width !== 288) { c.width = 288; c.height = 128; }
    if (im.complete && im.naturalWidth) g.drawImage(im, 0, 0); else { g.fillStyle = '#0d0a17'; g.fillRect(0, 0, 288, 128); }
    const at = (who, x, flip, iv) => { const pic = fsPic(who, now, iv); if (!pic) return; g.fillStyle = 'rgba(0,0,0,.4)'; g.fillRect(x - 10, 100, 20, 2); g.save(); g.translate(x, 99 - 60 - fsTop(who)); if (flip) g.scale(-1, 1); g.drawImage(pic, -fsHot(who), 0); g.restore(); };
    if (me) at(me, 112, false, false); if (foe) at(foe, 176, true, inv);
  });
}
function mpBack() { fsReturn(); }
$('mpStreet').addEventListener('click', () => mpPick(0)); $('mpTower').addEventListener('click', () => mpPick(1)); $('mpBack').addEventListener('click', mpBack);
$('mpGo').addEventListener('click', () => {
  audio(); snd('fsok');
  if (fs.mode === 'train') { TR.foe = Math.max(0, TRF.indexOf(fs.foe)); trainUI(); startPractice(fs.me, fs.foe); return; }      // (the room starts at once; SETTINGS > TRAIN > ENEMY IS follows your choice)
  vsPick.me = fs.me; vsPick.foe = fs.foe; vsxStart();
});
// ---- the VS splash before a BATTLE: both names slide in, a tap (or 1.5 s) starts the fight
const VSX = { t0: 0, ms: 1500 }, vsxPL = fsPanelMake($('vsxL'), 0), vsxPR = fsPanelMake($('vsxR'), 1);
function vsxStart() {
  const me = vsPick.me, foe = vsPick.foe, inv = me === foe;
  fsPanelSet(vsxPL, me, { moves: [], tag: SEL[me].tag }); fsPanelSet(vsxPR, foe, { moves: [], tag: SEL[foe].tag, inv });
  $('vsplash').classList.remove('go'); void $('vsplash').offsetWidth; $('vsplash').classList.add('go');      // (restarts the slide-in)
  VSX.t0 = performance.now(); show('vsplash'); snd('fsvs');
}
function vsxGo() { VSX.t0 = 0; twFightStart(); startMatch(vsSel); }
function vsxDraw(now) { fsPanelDraw(vsxPL, now, false); fsPanelDraw(vsxPR, now, vsPick.me === vsPick.foe); if (VSX.t0 && performance.now() - VSX.t0 >= VSX.ms) vsxGo(); }
addEventListener('pointerdown', () => { if (state === 'vsplash' && VSX.t0 && performance.now() - VSX.t0 > 450) vsxGo(); });
// ---- the Wi-Fi room's fighter screen (state 'lansel'): the same faces and panels; the network code (lanChoose, lanMsg, the dice) is the old one
const lsT = fsTiles($('lsPick'), who => lsTap(who)), lsPL = fsPanelMake($('lsMe'), 0), lsPR = fsPanelMake($('lsFoe'), 1);
function lsTap(who) {      // a face: choosing him is the old tap (he is chosen at once; the chosen one again takes the choice back)
  const why = fsWhy('wifi', 0, who); if (why) { snd('fsno'); fsSay($('lsMsg'), fsHintText(who, why)); return; }
  if (lanRole === 'in' && lanPhase === 'pick' && !lanVerBad) snd('fsmove'); lanChoose(who);
}
$('lsRand').addEventListener('click', () => { const ok = LAN_FIGHTERS.filter(w => w !== lanMe); lanChoose(ok[Math.floor(Math.random() * ok.length)]); });
const lsMoveNames = who => LAN_MOVES[who].map(r => r[0]).slice(0, 5);
function lsRender() {      // the texts of the Wi-Fi fighter screen
  const pick = lanPhase === 'pick', roll = lanPhase === 'roll', done = lanPhase === 'done', same = !!lanMe && lanMe === lanFoe, show2 = !pick;      // (the opponent's fighter is shown once both have chosen)
  for (const who of FS_ORDER) { const t = lsT[who]; fsTileSet(t, fsWhy('wifi', 0, who), who === lanMe, show2 && lanFoe && who === lanFoe && who !== lanMe ? 'P2' : '', false, who); t.el.disabled = !pick || lanVerBad; }
  const tagMe = pick ? (lanMe ? 'READY' : 'TAP A FIGHTER') : done ? (same ? (lanMeInv ? 'INVERTED' : 'NORMAL') : 'READY') : '...', tagFoe = pick ? (lanFoe ? 'READY' : 'CHOOSING') : done ? (same ? (lanMeInv ? 'NORMAL' : 'INVERTED') : 'READY') : '...';
  fsPanelSet(lsPL, lanMe, { tag: tagMe, moves: lanMe ? lsMoveNames(lanMe) : [], inv: done && lanMeInv, act: pick && !lanMe, ready: !!lanMe && !pick });
  fsPanelSet(lsPR, show2 ? lanFoe : '', { tag: tagFoe, moves: show2 && lanFoe ? lsMoveNames(lanFoe) : [], inv: done && same && !lanMeInv, act: false, ready: !!lanFoe && !show2 });
  const road = lanPing < 0 ? 'PING ...' : 'PING ' + lanPing + ' MS' + (lanLane === 'udp' ? '' : ' (SLOW ROAD)') + (lanLoss >= 3 ? '  LOST ' + lanLoss + '%' : '');
  $('lsInfo').textContent = (lanVerBad ? 'THE OTHER PHONE HAS ANOTHER VERSION OF THE GAME\nUPDATE THE APP ON BOTH PHONES' : pick ? (lanMe ? 'WAITING FOR THE OTHER PLAYER...' : 'TAP A FIGHTER TO CHOOSE HIM') : roll ? 'BOTH CHOSE ' + NAMES[lanMe] + '\nWHO GETS THE INVERTED ONE?' : (same ? (lanMeInv ? 'YOU GOT THE INVERTED ' : 'THE OTHER PLAYER GOT THE INVERTED ') + NAMES[lanMe] : NAMES[lanMe] + ' AGAINST ' + NAMES[lanFoe]) + '\n' + (lanFightMe ? 'WAITING FOR THE OTHER PLAYER...' : lanFightFoe ? 'THE OTHER PLAYER IS READY: TAP FIGHT' : 'TAP FIGHT WHEN YOU ARE READY')) + '\n' + road;
  $('lsAgain').style.display = $('lsFight').style.display = done ? '' : 'none'; $('lsFight').textContent = lanFightMe ? 'READY...' : 'FIGHT'; $('lsRand').style.display = pick ? '' : 'none'; $('lsRand').disabled = lanVerBad;
}
function lanSelDraw(now) {      // the two big fighters (the opponent faces you) and the faces; while the dice roll they flip between normal and inverted, slower and slower
  const a = performance.now() - lanRollAt;
  if (lanPhase === 'roll' && a >= LAN_ROLL_MS) { lanPhase = 'done'; lsRender(); snd('ceon'); }
  const meInv = lanPhase === 'roll' ? Math.floor(Math.pow(a / LAN_ROLL_MS, 0.6) * 11) % 2 === 0 : lanPhase === 'done' && lanMeInv, flip = lanMe !== '' && lanMe === lanFoe && lanPhase !== 'pick';
  fsPanelDraw(lsPL, now, flip && meInv); fsPanelDraw(lsPR, now, flip && !meInv); fsTilesDraw(lsT, lanMe, now); fsSayTick($('lsMsg'));
}
lsRender();
$('lsFight').addEventListener('click', lanFight);
$('lsAgain').addEventListener('click', () => lanAgain(true));
$('lsBack').addEventListener('click', lanLeave);
