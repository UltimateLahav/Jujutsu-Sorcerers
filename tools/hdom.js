// ---------------------------------------------------------------- v1.50 YUJI'S HOMETOWN DOMAIN (this file is spliced into template.html by build_html.py, in place of the marker line before drawScene)
// Skill y_hometown ($5000, it needs EVERY other skill of Yuji). In INHERITENCE the DOMAIN button casts it: 67% of the energy, the shared 30 s wait, and the INHERITENCE clock stands still for as long as it lasts.
// 1. pose (0.9 s, in the world): Yuji makes the DOMAIN EXPANSION hand sign (strip 32 of tools/yuji_art.py: two fingers up, a white wrapped forearm across his chest) and the world darkens.
// 2. face (3.2 s): a full-screen cut-in: your GIF (art/hometown_reference.gif, made into 32 pictures of 160 x 80 and 16 colours by tools/hometown_art.py) is scaled to cover the whole screen BEHIND him while he does the sign big in front of it.
// 3. burst (1.9 s): a white burst, and his HOMETOWN grows out of him in a circle: a statue, a park, a department store and a farm, with crayfish, horses and geese.
// 4. town (10 s, as long as the Infinite Void): the enemy is frozen, everything you hit does twice the damage, and white scissor marks slice the enemy all by themselves (a sure hit, no contact): 16 slices and then a huge X, about 70% of his health in all.
// 5. collapse (1.3 s): the town folds away; the button waits 30 s.
const HOME_IMG = '__HOMEIMG__', HF_N = 32, HF_W = 160, HF_H = 80, HF_FPS = 10;
const homeImg = new Image(); homeImg.src = HOME_IMG;
const HD = { pose: 900, face: HF_N * 1000 / HF_FPS, burst: 1900, town: 10000, collapse: 1300, total: 0.7, small: 16, first: 500, gap: 540, finale: 9300 }, HD_ORDER = ['pose', 'face', 'burst', 'town', 'collapse'];      // (the phases and their lengths in ms; total = the share of an enemy's health the slices take, small = the number of small slices, then the big X at `finale`)
const HD_W = HD.small + 8, HD_COL = { ink: '#12030a', white: '#ffffff', glow: '#ffe9c8' };      // (the slices' weights: every small one counts 1, the two halves of the X count 4 each)
const homeOn = () => !!dom && dom.kind === 'home';
function hdTry(now, t, hf) {      // the DOMAIN button as Yuji in INHERITENCE (the caller checked the skill): he stands still in the open and there is an enemy to slice
  if (dom || yu || ult || !vs || vs.me !== 'yuji' || vs.net || vs.ph !== 'fight' || now < domReadyAt || !(freeNow() && stance === 'stand' && t >= 1 && hf < 0 && hurtAt < 0 && now >= pStun && blkAt < 0)) return;
  const d = dummy; if (!d || d.ko >= 0) return; if (d.cap) { say('CANT', wx, '#ff8a7a', 8, now); return; }      // (Yuji only fights one enemy at a time: challenges and RUSH are Gojo's)
  if (d.vform && d.vform !== 'verity') { say('IMMUNE', d.x, '#ffe9a0', 8, now); return; }      // (Verity as the smiley ball cannot be hurt, so the slices must not reach him)
  if (ceSpend(CE_COST.yHome, now)) hdStart(now);
}
function hdNoInput() { keyL = keyR = padL = padR = jumpReq = atkReq = crReq = lpReq = dashReq = ceReq = domReq = blockHeld = false; stickDown = false; }      // (no control while he casts)
function hdStart(now) {
  dom = { kind: 'home', ph: 'pose', p0: now, zoomed: false, burst: false, town: false, si: 0, cum: 0, fin2: false, marks: [], ping: now + 1500 + HD.pose + HD.face + HD.burst };
  atkK = 32; atkAt = now; atkQ = false; combo = cpIdx = wcIdx = rdIdx = 0; comboUntil = 0; divP = null; evA = -1; wxv = 0; domHold = false; inhPrev = now; hdNoInput();      // (a chain he was in the middle of starts again from its first blow after the cast; a button pressed in the same frame as the DOMAIN is thrown away, or a later handler of this frame would start its own move over the hand sign)
  snd('domainstart'); say('DOMAIN EXPANSION', wx, '#ff3a4a', 12, now);
  domFreeze(now, HD.pose + HD.face + HD.burst + HD.town + 400);      // (the enemy is frozen, a swing in progress is cancelled)
}
function hdTo(ph, now) {
  dom.ph = ph; dom.p0 = now;
  if (ph === 'face') snd('domainface');
  else if (ph === 'town') {      // (the hands come down: pictures 11-14 of the hand sign play, 0.27 s, then he can fight; the title HOMETOWN is written by hdOverlay)
    if (!dom.town) { dom.town = true; snd('homeon'); }      // (the pad starts with the town, even if a slow frame jumped over its moment in the burst)
    if (atkK === 32 && atkAt >= 0) { atkAt = now - 11000 / YU_ATK.fps[32]; atkQ = false; evA = -1; }
  }
  else if (ph === 'collapse') { snd('homeoff'); snd('domainend'); }
}
function hdEnd(now) {
  if (atkK === 32) { atkAt = -1; atkQ = false; } dom = null; domReadyAt = now + DOM_CD; setDomUI(now); snd('homeoff'); domWake(now);
}
function hdCut(now, w, big, n) {      // a slice lands on the enemy: w x (70% / 24) of his health (counted from the running total, so the sum is exactly 70%), white marks on him, a flinch, a number
  const d = dummy; if (!d || d.ko >= 0) return; const mx = d.max || DUMMY_HP, cum = dom.cum + w, dm = Math.max(1, Math.round(mx * HD.total * cum / HD_W) - Math.round(mx * HD.total * dom.cum / HD_W)); dom.cum = cum; d.hp = Math.max(0, d.hp - dm); d.hitAt = now; d.rx = (Math.random() * 10) | 0; d.rxAt = now;
  say('' + dm, d.x, '#ffffff', big ? 12 : 8, now + 40);
  const sg = n % 2 ? -1 : 1, ang = big ? sg * 0.78 : sg * (0.5 + Math.random() * 0.75), ox = big ? 0 : (Math.random() - 0.5) * 10, oy = big ? 0 : (Math.random() - 0.5) * 22, len = big ? 54 : 24 + Math.random() * 10;
  dom.marks.push({ born: now, f: d, ang, len, big, ox, oy });
  if (!big && n % 4 === 3) dom.marks.push({ born: now, f: d, ang: ang + (sg > 0 ? -1.2 : 1.2), len: len * 0.9, big: false, ox, oy });      // (every fourth slice is a pair, the scissors: two blades crossing)
  const sy = gy - 30 - (d.airH || 0) + oy; spark(d.x, sy, big ? 34 : 12, ['#ffffff', '#fff2c8', '#ffd0a0'], true, 1); spark(d.x, sy, big ? 22 : 8, ['#ffffff', '#fff2c8'], true, -1);
  snd('hdslice', big ? 1 : 0); shakeUntil = Math.max(shakeUntil, now + (big ? 320 : 90)); shakeAmp = Math.max(shakeAmp, big ? 4 : 1); buzz(big ? 120 : 30);
  if (big) hitStop(110);
  if (d.hp <= 0) koDummy(now);
}
function hdTick(now) {      // every frame while the Hometown lasts (called by domTick)
  setDomUI(now);
  if (domLock()) hdNoInput();
  const a = now - dom.p0;
  if (dom.ph !== 'collapse' && (!vs || vs.ph !== 'fight' || state !== 'play' || !dummy || dummy.ko >= 0)) { if (dom.ph === 'town') hdTo('collapse', now); else hdEnd(now); return; }      // (the round is over or every enemy is down: the town goes away)
  if (dom.ph === 'town') {      // (before the phase check below: a slow frame that jumps over the end of the town still lands every slice that is due)
    const due = i => i < HD.small ? HD.first + i * HD.gap : HD.finale;
    while (dom.si <= HD.small && a >= due(dom.si)) { const big = dom.si === HD.small; hdCut(now, big ? 4 : 1, big, dom.si); dom.si++; }
    if (dom.si > HD.small && !dom.fin2 && a >= HD.finale + 170) { dom.fin2 = true; hdCut(now, 4, true, HD.small + 1); }
    if (now >= dom.ping) { dom.ping = now + 800 + Math.random() * 1500; dom.sn = !dom.sn; snd(dom.sn ? 'hdgoose' : 'hdhorse'); }      // (the farm's voices take turns)
  }
  if (a >= HD[dom.ph]) { const i = HD_ORDER.indexOf(dom.ph) + 1; if (i >= HD_ORDER.length) hdEnd(now); else hdTo(HD_ORDER[i], now); return; }
  if (dom.ph === 'face' && !dom.zoomed && a >= 1500) { dom.zoomed = true; snd('domainzoom'); }
  if (dom.ph === 'burst') {
    if (!dom.burst && a >= 500) { dom.burst = true; snd('domainburst'); shakeUntil = now + 500; shakeAmp = 2; }
    if (!dom.town && a >= 1100) { dom.town = true; snd('homeon'); }
  }
}
// ---------------------------------------------------------------- the town: one picture of the whole place (made once for the screen's size), the clouds, the horses, the geese and the crayfish move over it
const HD_FONT = { S: '111100111001111', T: '111010010010010', O: '111101101101111', R: '110101110101101', E: '111100110100111', D: '110101101101110', P: '110101110100100' };      // (a 3 x 5 pixel font, just the letters of the shop's sign)
let hdBgC = null, hdBgKey = '';
function hdBg(W, H) {
  const key = W + 'x' + H + '/' + gy; if (hdBgC && hdBgKey === key) return hdBgC; hdBgKey = key;
  const c = hdBgC = document.createElement('canvas'); c.width = W; c.height = H; const g = c.getContext('2d'), hz = gy - 6, base = gy - 3;
  const R = (x, y, w, h, col) => { g.fillStyle = col; g.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h)); }, disc = (cx, cy, r, col) => { g.fillStyle = col; for (let yy = -r; yy <= r; yy++) { const w = Math.floor(Math.sqrt(r * r - yy * yy)); g.fillRect(cx - w, cy + yy, 2 * w + 1, 1); } };
  const text = (s, x, y, col) => { for (let i = 0; i < s.length; i++) { const gl = HD_FONT[s[i]]; for (let k = 0; k < 15; k++) if (gl[k] === '1') R(x + i * 4 + (k % 3), y + ((k / 3) | 0), 1, 1, col); } };
  const sk = ['#4f9bdc', '#62a9e3', '#78b7ea', '#95c6ee', '#b4d4ee', '#d9dcea', '#f6dcc4', '#ffd3a6', '#ffe0b8'];      // the sky: nine bands from deep blue to a late-afternoon glow, a checker row between two bands (the dither)
  for (let i = 0; i < sk.length; i++) { const y0 = Math.round(hz * i / sk.length), y1 = Math.round(hz * (i + 1) / sk.length); R(0, y0, W, y1 - y0, sk[i]); if (i < sk.length - 1) for (let x = i % 2; x < W; x += 2) R(x, y1 - 1, 1, 1, sk[i + 1]); }
  const sx = Math.round(W * 0.8), sy = Math.round(hz * 0.62); g.globalAlpha = 0.2; disc(sx, sy, 15, '#fff0be'); g.globalAlpha = 0.4; disc(sx, sy, 11, '#fff0be'); g.globalAlpha = 1; disc(sx, sy, 8, '#fff4c0');      // the sun
  for (let x = 0; x < W; x++) {      // far mountains and green hills
    const m = Math.round(15 + 8 * Math.sin(x * 0.03 + 1) + 5 * Math.sin(x * 0.085)), h = Math.round(8 + 4 * Math.sin(x * 0.05 + 2) + 2 * Math.sin(x * 0.13));
    R(x, hz - m - 6, 1, m + 6, '#9ab4d2'); R(x, hz - m - 6, 1, 1, '#b9cfe6'); R(x, hz - h, 1, h + 1, '#7db070'); if ((x + h) % 5 === 0) R(x, hz - h, 1, 1, '#92c482');
  }
  R(0, hz, W, gy - hz + 1, '#6fb455'); for (let x = 0; x < W; x += 3) R(x, hz + ((x / 3) & 1), 2, 1, '#5aa045');      // a band of grass
  R(0, gy, W, H - gy, '#c9a878'); R(0, gy, W, 1, '#a47f56'); R(0, gy + 1, W, 1, '#d8bc8e');      // the road he stands on: paving stones with joints and pebbles
  for (let y = gy + 4, r = 0; y < H; y += 8, r++) { R(0, y, W, 1, '#b89466'); for (let x = (r % 2) * 9; x < W; x += 18) R(x, y + 1, 1, 7, '#b89466'); }
  for (let i = 0; i < W * (H - gy) / 55; i++) { const x = (i * 97 + 13) % W, y = gy + 2 + (i * 53 + 7) % Math.max(1, H - gy - 2); R(x, y, 1, 1, i % 2 ? '#d8bc8e' : '#a47f56'); }
  const tree = (tx, th, r, c1, c2, c3) => {      // a tree: trunk, round canopy lit from the top left (a checker where two greens meet)
    R(tx - 2, base - th, 4, th, '#6b4a2e'); R(tx + 1, base - th, 1, th, '#4f3620'); const cy = base - th - r + 4;
    for (let yy = -r; yy <= r; yy++) { const w = Math.floor(Math.sqrt(r * r - yy * yy)); for (let xx = -w; xx <= w; xx++) { const s = xx + yy, ck = (xx + yy) & 1; R(tx + xx, cy + yy, 1, 1, s < -r * 0.5 ? (ck ? c2 : c1) : s > r * 0.6 ? (ck ? c3 : c1) : c1); } }
  };
  { const x0 = Math.round(W * 0.37) - 26, y0 = base - 46;      // the DEPARTMENT STORE: three floors of windows, a striped awning over the doors, a red sign on the roof
    R(x0, y0, 52, 46, '#e9d7b8'); R(x0 + 49, y0, 3, 46, '#d3bd98'); R(x0 - 1, y0 - 2, 54, 3, '#b04a3c'); R(x0 - 1, y0 - 2, 54, 1, '#d4634f');
    R(x0 + 13, y0 - 15, 26, 13, '#c8382e'); R(x0 + 13, y0 - 15, 26, 1, '#e8604e'); R(x0 + 13, y0 - 3, 26, 1, '#8a2a22'); text('DEPT', x0 + 19, y0 - 13, '#ffffff'); text('STORE', x0 + 16, y0 - 7, '#ffe28a'); R(x0 + 17, y0 - 20, 1, 5, '#3a3a46'); R(x0 + 35, y0 - 20, 1, 5, '#3a3a46');
    for (let j = 0; j < 3; j++) for (let i = 0; i < 4; i++) { const wx = x0 + 4 + i * 12, wy = y0 + 4 + j * 10, lit = (i + j) % 3 === 1; R(wx - 1, wy - 1, 9, 8, '#ffffff'); R(wx, wy, 7, 6, lit ? '#ffe28a' : '#7fc8ef'); R(wx, wy, 2, 1, lit ? '#fff6c8' : '#e6f6ff'); R(wx - 1, wy + 6, 9, 1, '#c9b48e'); }
    for (let i = 0; i < 2; i++) { const dx = i ? x0 + 35 : x0 + 3; R(dx - 1, y0 + 32, 16, 13, '#ffffff'); R(dx, y0 + 33, 14, 11, '#bfe4f4'); R(dx + 4, y0 + 35, 2, 9, '#8a8a9a'); R(dx + 9, y0 + 36, 2, 8, '#d8a0b0'); R(dx + 4, y0 + 34, 2, 2, '#eec7b4'); R(dx + 9, y0 + 35, 2, 2, '#eec7b4'); }
    R(x0 + 19, y0 + 31, 14, 15, '#ffffff'); R(x0 + 20, y0 + 32, 12, 14, '#5aa6cc'); R(x0 + 25, y0 + 32, 2, 14, '#ffffff'); R(x0 + 20, y0 + 32, 12, 1, '#9bd3ee');
    for (let i = 0; i < 6; i++) R(x0 + 17 + i * 3, y0 + 27, 3, 4, i % 2 ? '#ffffff' : '#c8382e'); R(x0 + 17, y0 + 31, 18, 1, '#8a2a22');
  }
  { const x = Math.round(W * 0.53);      // the PARK: a big tree, a cherry tree in bloom, a bench, a lamp, a slide, flowers
    tree(x - 24, 15, 12, '#3f9b4a', '#6cc66c', '#2d7a3a'); tree(x + 25, 14, 11, '#f5a9c6', '#ffd1e0', '#d97fa5'); for (let i = 0; i < 14; i++) R(x + 14 + (i * 7) % 24, base - 18 + (i * 5) % 18, 1, 1, '#ffffff');
    const bx = x - 2; R(bx - 9, base - 6, 18, 2, '#a2693f'); R(bx - 9, base - 10, 18, 2, '#a2693f'); R(bx - 9, base - 10, 18, 1, '#c98a5a'); R(bx - 9, base - 4, 2, 4, '#6b4a2e'); R(bx + 7, base - 4, 2, 4, '#6b4a2e'); R(bx - 8, base - 9, 1, 3, '#6b4a2e'); R(bx + 7, base - 9, 1, 3, '#6b4a2e');
    const lx = x - 12; R(lx, base - 26, 1, 26, '#3a3a46'); R(lx - 2, base - 30, 5, 4, '#ffe28a'); R(lx - 3, base - 31, 7, 1, '#3a3a46');
    const sx2 = x + 8; R(sx2, base - 15, 1, 15, '#b0b0b8'); R(sx2 + 5, base - 15, 1, 15, '#b0b0b8'); R(sx2 - 1, base - 16, 8, 2, '#e8c24a'); for (let i = 0; i < 9; i++) R(sx2 + 6 + i, base - 15 + Math.round(i * 1.45), 2, 2, i % 2 ? '#d94040' : '#e86a5a'); R(sx2 + 1, base - 12, 4, 1, '#b0b0b8'); R(sx2 + 1, base - 8, 4, 1, '#b0b0b8');
    for (let i = 0; i < 9; i++) R(x - 34 + i * 3, base - 1 - (i % 2), 1, 1, ['#f2c14e', '#e86a8a', '#ffffff', '#b58cf0'][i % 4]);
  }
  { const cx = Math.round(W * 0.69);      // the FARM: a red barn with a white X on its door, a silo, a wooden fence, a hay bale and rows of crops
    for (let x = cx - 40; x <= cx + 32; x += 3) { R(x, hz + 1, 2, 3, '#4f9a3c'); R(x + 1, hz + 3, 1, 1, '#3f8240'); }
    const x0 = cx - 18, b = base - 1; R(x0, b - 24, 34, 24, '#b8382e'); for (let i = 0; i < 34; i += 3) R(x0 + i, b - 24, 1, 24, '#a02a24'); R(x0 + 31, b - 24, 3, 24, '#8a221e');
    for (let i = 0; i < 12; i++) R(x0 - 2 + i * 1.8, b - 24 - 11 + i, 38 - i * 3.6, 1, i < 2 ? '#8a5a52' : '#5f2a26'); R(x0 + 12, b - 31, 10, 3, '#5f2a26'); R(x0 + 14, b - 29, 6, 4, '#f0d9a0'); R(x0 + 14, b - 29, 6, 1, '#fff6d0');
    R(x0 + 10, b - 13, 14, 13, '#f0e6d0'); R(x0 + 11, b - 12, 12, 11, '#b8382e'); for (let i = 0; i < 11; i++) { R(x0 + 11 + i, b - 12 + i, 1, 1, '#f0e6d0'); R(x0 + 21 - i, b - 12 + i, 1, 1, '#f0e6d0'); } R(x0 + 10, b - 13, 14, 1, '#ffffff');
    const sx3 = cx + 18; R(sx3, b - 34, 11, 34, '#b9c4cf'); R(sx3 + 8, b - 34, 3, 34, '#9aa6b3'); for (let i = 0; i < 8; i++) R(sx3, b - 32 + i * 4, 11, 1, '#9aa6b3'); for (let i = 0; i < 5; i++) R(sx3 + i, b - 38 + i, 11 - 2 * i, 1, i ? '#8d98a6' : '#a9b4c0'); R(sx3 + 5, b - 40, 1, 2, '#3a3a46');
    for (let x = cx - 38; x <= cx + 30; x += 6) R(x, base - 7, 1, 8, '#8a6a44'); R(cx - 38, base - 6, 69, 1, '#a68258'); R(cx - 38, base - 3, 69, 1, '#a68258');
    const hb = cx - 30; disc(hb, base - 5, 5, '#d9b45a'); disc(hb, base - 5, 3, '#e8c870'); R(hb - 5, base - 5, 11, 1, '#b8923a'); R(hb, base - 10, 1, 11, '#b8923a');
  }
  { const x = Math.max(66, Math.round(W * 0.215));      // the STATUE: a boy of bronze reading a book with a bundle of firewood on his back, on a stone plinth
    R(x - 8, base - 3, 17, 3, '#8d897e'); R(x - 8, base - 3, 17, 1, '#c9c5b8'); R(x - 6, base - 8, 13, 5, '#a29e92'); R(x - 6, base - 8, 13, 1, '#d4d0c4'); R(x - 6, base - 4, 13, 1, '#6d6a62'); R(x - 3, base - 7, 7, 3, '#8d897e'); R(x - 2, base - 6, 5, 1, '#d4d0c4');
    const b = base - 8, br = '#5f8a78', lt = '#82b59d', dk = '#3b5c4e';
    R(x - 2, b - 7, 2, 7, dk); R(x + 1, b - 7, 2, 7, br); R(x - 3, b - 15, 7, 8, br); R(x - 3, b - 15, 2, 8, lt); R(x + 3, b - 15, 1, 8, dk); R(x - 1, b - 20, 5, 5, lt); R(x - 1, b - 21, 5, 2, dk); R(x + 3, b - 18, 1, 1, dk);
    R(x - 7, b - 17, 4, 9, '#7a5a34'); R(x - 7, b - 17, 1, 9, '#a67c46'); for (let i = 0; i < 4; i++) R(x - 7 + i, b - 16 + i * 2, 1, 1, '#a67c46'); R(x + 2, b - 13, 4, 3, br); R(x + 4, b - 14, 4, 4, '#e8e0c8'); R(x + 4, b - 14, 1, 4, '#6a5a3a');
    for (let i = 0; i < 4; i++) R(x - 6 + i * 4, base - 1, 1, 1, ['#f2c14e', '#e86a8a', '#ffffff', '#f2c14e'][i]);      // flowers at his feet
  }
  return c;
}
function hdHorse(g, x, y, ph, s, col) {      // a horse seen from the side (about 22 x 18 px): body, a stepped neck with a mane, a head, a tail, four legs that bend as it trots; s = 1 faces right, -1 left
  const P = (dx, dy, w, h, c) => { g.fillStyle = c; g.fillRect(Math.round(x + (s > 0 ? dx : -dx - w + 1)), Math.round(y - dy - h + 1), w, h); }, [b, l, d] = col;
  const leg = (dx, k) => { const sw = Math.sin(ph + k * Math.PI), o = Math.round(sw * 2.2), up = Math.max(0, Math.round(Math.cos(ph + k * Math.PI) * 1.8)); P(dx, 3, 2, 3, k ? d : b); P(dx + o, up, 2, 3, k ? d : b); P(dx + o, up, 2, 1, '#2a2018'); };
  leg(-7, 1); leg(5, 1); P(-8, 6, 16, 6, b); P(-7, 11, 14, 1, l); P(-7, 6, 14, 1, d); leg(-5, 0); leg(3, 0);
  const bob = Math.round(Math.sin(ph * 2) * 0.8); P(5, 10 + bob, 4, 3, b); P(6, 13 + bob, 4, 3, b); P(9, 15 + bob, 5, 3, b); P(12, 15 + bob, 2, 2, d); P(10, 17 + bob, 1, 1, '#111'); P(9, 18 + bob, 1, 2, b);
  P(4, 11 + bob, 1, 3, d); P(5, 14 + bob, 1, 3, d); P(6, 17 + bob, 1, 1, d); const sw = Math.round(Math.sin(ph) * 1.4); P(-10, 7, 2, 5, d); P(-11 - sw, 4, 2, 3, d);
}
function hdGoose(g, x, y, ph, s) {      // a white goose on the ground (about 11 x 12 px): body, a neck that bobs, an orange beak, orange legs that walk
  const P = (dx, dy, w, h, c) => { g.fillStyle = c; g.fillRect(Math.round(x + (s > 0 ? dx : -dx - w + 1)), Math.round(y - dy - h + 1), w, h); }, o = Math.round(Math.sin(ph) * 1.5), bob = Math.round(Math.sin(ph * 2));
  P(-1 + o, 0, 1, 4, '#ff9a2a'); P(2 - o, 0, 1, 4, '#ff9a2a'); P(-4, 4, 9, 4, '#ffffff'); P(-4, 4, 9, 1, '#d8dde8'); P(-6, 6, 2, 2, '#ffffff'); P(4, 7, 2, 4 + bob, '#ffffff'); P(4, 10 + bob, 4, 2, '#ffffff'); P(8, 10 + bob, 2, 1, '#ff9a2a'); P(6, 11 + bob, 1, 1, '#111');
}
function hdFlyGoose(g, x, y, ph, s) {      // a goose in flight (about 12 x 8 px): wings up, wings down
  const P = (dx, dy, w, h, c) => { g.fillStyle = c; g.fillRect(Math.round(x + (s > 0 ? dx : -dx - w + 1)), Math.round(y - dy - h + 1), w, h); }, up = Math.floor(ph) % 2;
  P(-3, 0, 6, 2, '#ffffff'); P(3, 1, 3, 1, '#ffffff'); P(6, 1, 2, 2, '#ffffff'); P(8, 1, 1, 1, '#ff9a2a'); P(-5, 1, 2, 1, '#e8eef6');
  if (up) { P(-2, 2, 2, 4, '#e8eef6'); P(0, 2, 2, 3, '#ffffff'); P(-3, 5, 2, 2, '#8a92a4'); } else { P(-3, -1, 8, 1, '#e8eef6'); P(-5, -1, 3, 1, '#8a92a4'); }
}
function hdCrayfish(g, x, y, ph, s, wave) {      // a red crayfish (about 14 x 9 px): a segmented body, a tail fan, two big claws (they wave), eyes on stalks, legs that scuttle
  const P = (dx, dy, w, h, c) => { g.fillStyle = c; g.fillRect(Math.round(x + (s > 0 ? dx : -dx - w + 1)), Math.round(y - dy - h + 1), w, h); }, st = Math.floor(ph) % 2;
  for (let i = 0; i < 4; i++) P(-3 + i * 2 + (i % 2 === st ? 1 : 0), 0, 1, 2, '#a82a1c');
  P(-5, 1, 9, 4, '#d8402a'); P(-5, 4, 9, 1, '#ff7a58'); for (let i = 0; i < 3; i++) P(-4 + i * 3, 1, 1, 4, '#a82a1c'); P(4, 1, 3, 4, '#d8402a'); P(-9, 1, 4, 3, '#a82a1c'); P(-10, 1, 1, 3, '#d8402a'); P(6, 5, 1, 2, '#12030a'); P(4, 5, 1, 2, '#12030a');
  const up = wave ? 1 : 0; P(6, 3 + up, 3, 1, '#d8402a'); P(9, 3 + up, 3, 3, '#d8402a'); P(9, 6 + up, 3, 1, '#ff7a58'); P(11, 4 + up, 1, 1, '#12030a'); P(7, 6, 5, 1, '#a82a1c');
}
function hdTownDraw(g, now, W, H) {      // the whole town and the animals that move in it (drawn into the scratch picture, then shown inside the growing circle)
  g.imageSmoothingEnabled = false; g.drawImage(hdBg(W, H), 0, 0); const t = now / 1000, hz = gy - 6, base = gy - 3;
  for (const [fx, fy, sp, sc] of [[0.15, 0.2, 3, 1], [0.55, 0.1, 2, 0.8], [0.85, 0.3, 4, 1.2]]) {      // clouds drift left
    const x = Math.round(((fx * W - t * sp) % (W + 60) + W + 60) % (W + 60)) - 30, y = Math.round(hz * fy), w = Math.round(26 * sc);
    g.fillStyle = '#ffffff'; g.fillRect(x, y, w, 4); g.fillRect(x + 4, y - 3, w - 10, 4); g.fillRect(x + 9, y - 5, w - 20, 3); g.fillStyle = '#f3d9d0'; g.fillRect(x, y + 3, w, 1);
  }
  for (let k = 0; k < 5; k++) hdFlyGoose(g, Math.round(W + 40 - ((t * 15) % (W + 120)) + k * 8), Math.round(hz * 0.3 + k * 4), t * 6 + k * 0.7, -1);      // a V of geese flying left
  for (const [i, lo, hi, v, ph0] of [[0, 0.47, 0.76, 16, 0], [1, 0.5, 0.74, 11, 40]]) {      // two horses trot to and fro in the field of the farm
    const span = Math.round(W * (hi - lo)), p = (t * v + ph0) % (2 * span), fwd = p < span, x = Math.round(W * lo + (fwd ? p : 2 * span - p));
    hdHorse(g, x, gy - 2, t * 11 + i * 2, fwd ? 1 : -1, i ? ['#6b4a2e', '#8a6a44', '#3a2818'] : ['#8a5a36', '#b07a4a', '#5a3a22']);
  }
  for (let i = 0; i < 3; i++) { const x = Math.round(W * (0.3 + i * 0.05) + Math.sin(t * 0.4 + i * 2) * 10); hdGoose(g, x, gy - 1, t * 5 + i * 1.7, Math.sin(t * 0.4 + i * 2 + 1.57) >= 0 ? 1 : -1); }      // three geese walk about by the park
  for (let i = 0; i < 3; i++) { const span = Math.round(W * 0.28), p = (t * (7 + i * 2) + i * 60) % (2 * span), fwd = p < span, x = Math.round(W * (0.2 + i * 0.22) + (fwd ? p : 2 * span - p) - span / 2), y = gy + Math.round((H - gy) * (0.5 + i * 0.12)); hdCrayfish(g, x, y, t * 12 + i, fwd ? 1 : -1, Math.floor(t * 3 + i) % 2); }      // three crayfish scuttle along the road
}
// ---------------------------------------------------------------- what is drawn over the fight: the dark, the cut-in, the burst, the title and the slices
let hdVig = null, hdVigKey = '';
function hdMarks(now) {      // the white scissor marks: a blade sweeps along the line (80 ms, 130 for the X), flashes thick, thins to a scar and fades; a dark rim keeps it readable on the bright town
  const cx = Math.round(VW / 2); dom.marks = dom.marks.filter(m => now - m.born < (m.big ? 1100 : 650)); ctx.save(); ctx.imageSmoothingEnabled = false;
  for (const m of dom.marks) {
    const a = now - m.born, k = Math.min(1, a / (m.big ? 130 : 80)), fade = Math.max(0, 1 - Math.max(0, a - (m.big ? 420 : 220)) / (m.big ? 680 : 430)), thick = Math.max(m.big ? 2 : 1, Math.round((m.big ? 6 : 3) * (1 - Math.min(1, a / (m.big ? 480 : 200))))), ex = Math.round(cx + m.f.x - wx + m.ox), ey = Math.round(gy - 30 - (m.f.airH || 0) + m.oy), c = Math.cos(m.ang), s = Math.sin(m.ang), n = Math.round(m.len * 2);
    ctx.globalAlpha = fade;
    for (let i = 0; i <= n; i++) {
      const u = i / n * 2 - 1; if ((u + 1) / 2 > k) break; const x = Math.round(ex + c * u * m.len), y = Math.round(ey + s * u * m.len), w = Math.max(1, Math.round(thick * (1 - u * u * 0.7)));
      ctx.fillStyle = HD_COL.ink; ctx.fillRect(x - (w >> 1) - 1, y - (w >> 1) - 1, w + 2, w + 2);
    }
    for (let i = 0; i <= n; i++) {
      const u = i / n * 2 - 1; if ((u + 1) / 2 > k) break; const x = Math.round(ex + c * u * m.len), y = Math.round(ey + s * u * m.len), w = Math.max(1, Math.round(thick * (1 - u * u * 0.7)));
      ctx.fillStyle = a < 90 && (u + 1) / 2 > k - 0.18 ? HD_COL.glow : HD_COL.white; ctx.fillRect(x - (w >> 1), y - (w >> 1), w, w);
    }
    if (a < 160) { ctx.globalAlpha = fade * (1 - a / 160); ctx.fillStyle = HD_COL.white; for (let q = 0; q < 6; q++) { const u = (q / 5) * 2 - 1, x = Math.round(ex + c * u * m.len - s * (4 + a * 0.12) * (q % 2 ? 1 : -1)), y = Math.round(ey + s * u * m.len + c * (4 + a * 0.12) * (q % 2 ? 1 : -1)); ctx.fillRect(x, y, 1, 1); } }      // (shards fly off the blade)
  }
  ctx.restore();
}
function hdCutIn(now, a, pic, info, fi) {      // the cut-in: your GIF covers the screen behind him (a slow push-in), a dark vignette, red embers, and Yuji himself does the sign big in front of it
  ctx.fillStyle = '#000'; ctx.fillRect(-8, -8, VW + 16, VH + 16); ctx.imageSmoothingEnabled = false;
  if (homeImg.complete && homeImg.naturalWidth) { const i = Math.floor(a * HF_FPS / 1000) % HF_N, Z = Math.max(VW / HF_W, VH / HF_H) * (1 + 0.07 * Math.min(1, a / HD.face)), dw = Math.ceil(HF_W * Z), dh = Math.ceil(HF_H * Z); ctx.drawImage(homeImg, 0, i * HF_H, HF_W, HF_H, Math.round((VW - dw) / 2), Math.round((VH - dh) / 2), dw, dh); }
  const key = VW + 'x' + VH; if (!hdVig || hdVigKey !== key) { hdVigKey = key; const g = ctx.createRadialGradient(VW * 0.55, VH * 0.5, VH * 0.25, VW * 0.55, VH * 0.5, Math.hypot(VW, VH) * 0.6); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(0,0,0,0.6)'); hdVig = g; }
  ctx.fillStyle = hdVig; ctx.fillRect(-8, -8, VW + 16, VH + 16);
  if (pic && info && info.hn && info.hn[fi]) { const Z = Math.max(2, Math.floor(VH * 0.54 / 32)), h = info.hn[fi]; ctx.drawImage(pic, Math.round(VW * 0.55 - h[0] * Z), Math.round(VH * 0.66 - h[1] * Z), pic.width * Z, pic.height * Z); }
  for (let q = 0; q < 26; q++) { const sp = 18 + (q % 5) * 9, x = Math.round((q * 53 + a * 0.012 * sp) % VW), y = Math.round(VH - ((a * 0.001 * sp + q * 37) % VH)); ctx.fillStyle = q % 3 === 0 ? '#ffffff' : q % 2 ? '#ff2a3a' : '#ff7a5a'; ctx.fillRect(x, y, q % 4 === 0 ? 2 : 1, q % 4 === 0 ? 2 : 1); }
  if (a < 160) { ctx.fillStyle = 'rgba(255,255,255,' + (0.8 * (1 - a / 160)).toFixed(2) + ')'; ctx.fillRect(-8, -8, VW + 16, VH + 16); }
  const sub = Math.min(1, Math.max(0, (a - 300) / 300)); if (sub > 0) { ctx.globalAlpha = sub; pxt('DOMAIN EXPANSION.', VW / 2, VH - 10, '#ffffff', 8, 'center'); ctx.globalAlpha = 1; }
}
function hdOverlay(now, pic, info, fi) {      // darkness, the cut-in, the white burst, the title, the slices and the cinema bars (called by domOverlay)
  const a = now - dom.p0, cx = Math.round(VW / 2), cy = gy - 38, full = al => { ctx.fillStyle = al; ctx.fillRect(-8, -8, VW + 16, VH + 16); }, bh = Math.round(VH * 0.11); let bk = 0;
  if (dom.ph === 'pose') { full('rgba(20,0,6,' + (0.5 * Math.min(1, a / HD.pose)).toFixed(2) + ')'); bk = Math.min(1, a / 400); }
  else if (dom.ph === 'face') hdCutIn(now, a, pic, info, fi);
  else if (dom.ph === 'burst') {
    bk = 1; if (a < 350) full('rgba(14,0,6,' + (0.5 + 0.38 * a / 350).toFixed(2) + ')');
    else { ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = 'rgba(255,130,90,0.07)'; for (let k = 1; k <= 5; k++) { const r = k * 22 * Math.min(1, (a - 350) / 600); for (let yy = -r; yy <= r; yy++) { const w = Math.floor(Math.sqrt(Math.max(0, r * r - yy * yy))); ctx.fillRect(cx - w, cy + yy, 2 * w + 1, 1); } } ctx.globalCompositeOperation = 'source-over'; }
    if (a >= 600) {
      const k = Math.min(1, (a - 600) / 700); ctx.fillStyle = '#ffffff';
      for (let i = 0; i < 16; i++) { const th = i / 16 * 6.2832 + a / 900, len = (i % 2 ? 60 : 120) * k; for (let s = 0; s < len; s += 2) { const sz = Math.max(1, Math.round(4 * (1 - s / len))); ctx.fillRect(Math.round(cx + Math.cos(th) * s) - 1, Math.round(cy + Math.sin(th) * s * 0.9) - 1, sz, sz); } }
      const r = 6 + 34 * k; for (let yy = -r; yy <= r; yy++) { const w = Math.floor(Math.sqrt(r * r - yy * yy)); ctx.fillRect(cx - w, cy + yy, 2 * w + 1, 1); }
      for (let j = 0; j < 2; j++) { const rr = Math.max(0, (a - 700 - j * 220) / 900) * domR(); if (rr > 0) { ctx.fillStyle = j ? '#ff9a7a' : '#ffe9c8'; for (let i = 0; i < 90; i++) { const th = i / 90 * 6.2832; ctx.fillRect(Math.round(cx + Math.cos(th) * rr), Math.round(cy + Math.sin(th) * rr * 0.9), 3, 3); } } }
    }
    const fl = a < 900 ? 0 : a < 1250 ? (a - 900) / 350 : Math.max(0, 1 - (a - 1250) / 650); if (fl > 0) full('rgba(255,255,255,' + Math.min(1, fl).toFixed(2) + ')');
  }
  else if (dom.ph === 'town') {
    bk = Math.max(0, 1 - a / 300); hdMarks(now);
    for (const t0 of [HD.finale, HD.finale + 170]) { const e = a - t0; if (e >= 0 && e < 300) full('rgba(255,255,255,' + (0.85 * (1 - e / 300) * (t0 > HD.finale ? 0.7 : 1)).toFixed(2) + ')'); }      // (the X: two white flashes)
  }
  if (bk > 0) { const h = Math.round(bh * bk); ctx.fillStyle = '#000'; ctx.fillRect(-8, -8, VW + 16, h + 8); ctx.fillRect(-8, VH - h, VW + 16, h + 8); }
  const title = dom.ph === 'burst' && a >= 700 ? ['DOMAIN EXPANSION', Math.min(1, (a - 700) / 300) * Math.min(1, (HD.burst - a) / 300), '#ffffff'] : dom.ph === 'town' && a < 2600 ? ['HOMETOWN', Math.min(1, a / 400) * Math.min(1, (2600 - a) / 500), '#ffe6c8'] : null;
  if (title && title[1] > 0) { ctx.globalAlpha = title[1]; pxt(title[0], VW / 2, bh + 18, title[2], 16, 'center'); ctx.globalAlpha = 1; }
}
