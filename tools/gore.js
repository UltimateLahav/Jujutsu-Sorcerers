// ---------------------------------------------------------------- v1.128 GRAPHIC DAMAGE (tools/gore.js, data: tools/gore_<fighter>.json from tools/gore_export.py)
// Every fighter has hidden damage meters for the arms, legs, shoulders, chest, belly and head. Hits fill them (where the blow lands decides which one); a huge hit can rip a limb off at once.
// A ripped arm / leg is drawn without that limb (the picture of the fighter is patched: GPT holds, for every picture of every strip, the pixels each limb covered and what shows through
// instead), with a red stump, and flies off as a piece (the street's gibs); a dead shoulder leaves the arm hanging limp. Everything is undone at the start of the next round.
// Not in the story, not on the Wi-Fi, not against curses. SETTINGS > GAME > GRAPHIC DAMAGE: FULL / CLEAN (no blood) / OFF.
const GD = __GOREDATA__, GWHITE = new Proxy({}, { get: () => '#ffffff' });      // (GWHITE: the palette of a white flash picture)
const GAB = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_', GAI = {}; for (let i = 0; i < 64; i++) GAI[GAB[i]] = i;
const GPT = new WeakMap(), GVC = new WeakMap();      // a picture set (YU.idle ...) -> its patches; a plain picture -> its variants by mask
const GLIMB = ['an', 'af', 'lf', 'lb'];      // near arm, far arm, front (near) leg, back (far) leg
const GT = { rip: 0.42, sho: 0.3, bod: 0.35, huge: 0.15, hugeP: 0.15, sharp: 2, bleed: 0.003, slow: 0.15, weak: 0.1, vuln: 0.25 };      // tuning: meter that rips a limb / kills a shoulder / hurts the body (fractions of the full health), a huge hit and the chance it rips at once, sharp attacks fill twice as fast, bleeding per 0.5 s per limb
const GSHARP = { freddy: 1, verity: 1, sukuna: 1 };      // whose blows are cuts, claws and bites
const gdSet = () => (typeof SET === 'object' && SET.gore) | 0;      // 0 FULL, 1 CLEAN, 2 OFF
function goreLink(sets, data) { if (data) for (const k in data) if (sets[k]) GPT.set(sets[k], data[k]); }
goreLink(YU, GD.yuji); goreLink(D, GD.gojo);
const GDER = new WeakMap(), GVE = {}, GCA = {}, GFR = {}, GICACHE = new WeakMap();      // the pictures made from others (see invOf); the patches of Verity's, the Cat's and Freddy's strips
function goreSets(store, data, rows) { if (data) for (const k in data) if (k[0] !== '_') { store[k] = {}; GPT.set(store[k], data[k]); } }
goreSets(GVE, GD.verity); goreSets(GCA, GD.cat); goreSets(GFR, GD.freddy);
function gdPalOf(pal, inv) {      // the palette of a strip, or its inverse for the inverted fighter
  if (!inv) return pal; let r = GICACHE.get(pal); if (!r) { r = {}; for (const k in pal) { const h = pal[k]; r[k] = '#' + [1, 3, 5].map(i => (255 - parseInt(h.substr(i, 2), 16)).toString(16).padStart(2, '0')).join(''); } GICACHE.set(pal, r); } return r;
}
function goreReg(c, store, key, i, data, inv) { if (data && store[key]) MKM.set(c, { s: store[key], i, pal: gdPalOf(data._pal, inv) }); }
function goreFredCut(c, sx, sy, w, h, dx, dy, dw, dh) {      // Freddy's picture cut from his sheet: the same as before, and the picture knows its patches (row = sy / 64)
  c.getContext('2d').drawImage(FRED_IMG, sx, sy, w, h, dx, dy, dw, dh); if (GD.freddy && w === 64 && h === 64) goreReg(c, GFR, 'r' + sy / 64, sx / 64, GD.freddy, false);
}
const GSK = {}, GSKC = {};      // Sukuna's rows of pictures (cut from his strip in tools/sukuna.js): the patches of each row; the pictures by row
if (GD.sukuna) for (const k in GD.sukuna) if (k[0] !== '_') { GSK[k] = {}; GPT.set(GSK[k], GD.sukuna[k]); }
const GCOL = { r0: '#b3121f', r1: '#d4141f', r2: '#6e0a12', w0: '#e8ecf4', w1: '#9aa2b4' };      // the stump: blood red (CLEAN: pale grey)
const GSTAT = { builds: 0, fly: 0, hits: 0, rips: 0 };      // (counters for the tests)
const GB = { p: goreBody(), f: goreBody() };
function goreBody() { return { dm: { an: 0, af: 0, lf: 0, lb: 0, sn: 0, sf: 0, ch: 0, bl: 0, hd: 0 }, st: { an: 0, af: 0, lf: 0, lb: 0 }, hurt: { ch: 0, bl: 0, hd: 0 }, last: null, bleedAt: 0, coughAt: 0, pend: [], flash: 0, dripAt: 0, kind: '' }; }
function goreReset() { GB.p = goreBody(); GB.f = goreBody(); }
const gdKind = side => !vs ? null : side === 'p' ? (cuMe() ? (vs.me === 'cu3' ? 'sukuna' : null) : vs.me) : (dummy && dummy.mode === 'fighter' && !dummy.curse && !dummy.net ? vs.foe : null);
function gdActive(side) { return !!vs && !vs.story && !vs.net && !vs.hunt && gdSet() < 2 && !!GD[gdKind(side)]; }
const gdLive = () => !!vs && !vs.story && gdSet() < 2 && (gibs.length > 0 || decals.length > 0 || drops.length > 0);      // (the street's blood and pieces are drawn and moved in a match too)
// ---- the picture without its limbs
function gorePatch(g, ps, W, H, rec, ox, oy, col) {      // lays a patch string over the pixels g (Uint32, W x H); the patch's own origin lies at (ox, oy) of the picture; col(letter) = its colour; rec collects the ids (y * W + x) of the pixels that were drawn and are changed or marked as the limb ('*')
  for (let i = 0; i < ps.length;) {
    const y = GAI[ps[i]] * 64 + GAI[ps[i + 1]] + oy, x0 = GAI[ps[i + 2]] * 64 + GAI[ps[i + 3]] + ox, n = GAI[ps[i + 4]]; i += 5;
    for (let j = 0; j < n; j++) {
      const c = ps[i + j], x = x0 + j; if (c === '=' || y < 0 || y >= H || x < 0 || x >= W) continue; const id = y * W + x, v = c === '*' ? g[id] : c === '.' ? 0 : col(c);
      if (rec && g[id] && g[id] !== v) rec.push(id); if (c !== '*') g[id] = v;
    }
    i += n;
  }
}
function goreEnds(ids, W) {      // the two ends of the biggest piece of a pixel set (the farthest apart, walking along the set): {u, v, du, dv} or null when it is too small to be a limb
  const S = new Set(ids); if (S.size < 10) return null;
  const bfs = s => { const d = new Map([[s, 0]]), q = [s]; for (let h = 0; h < q.length; h++) { const p = q[h], x = p % W, y = (p / W) | 0; for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) { const n = (y + dy) * W + x + dx; if ((dx || dy) && S.has(n) && !d.has(n)) { d.set(n, d.get(p) + 1); q.push(n); } } } return { d, last: q[q.length - 1] }; };
  let best = null, left = new Set(ids); while (left.size) { const a = bfs(left.values().next().value); for (const p of a.d.keys()) left.delete(p); if (!best || a.d.size > best.d.size) best = a; }
  if (best.d.size < 10) return null; const b = bfs(best.last), c = bfs(b.last); return { u: best.last, v: b.last, du: b.d, dv: c.d };
}
function goreBuild(src, mask) {      // src: a picture; mask: the limbs ripped (1 near arm, 2 far arm, 4 front leg, 8 back leg) + the dead arms (16 near, 32 far: they hang limp) + the wounds (64 chest, 128 belly, 256 head) + the crawl (512); returns a canvas or null
  const meta = MKM.get(src), P = meta && GPT.get(meta.s); if (!P) return null;
  GSTAT.builds++; const W = src.width, H = src.height, i = meta.i, ox = meta.ox | 0, oy = meta.oy | 0, clean = gdSet() === 1, base = new Uint32Array(src.getContext('2d').getImageData(0, 0, W, H).data.buffer.slice(0)); let g = Uint32Array.from(base);
  const lc = {}, col = ch => lc[ch] !== undefined ? lc[ch] : (lc[ch] = rgbOf(meta.pal[ch] || '#ff00ff')), rem = {};
  const ap = (k, ps) => { if (ps) { const rec = []; gorePatch(g, ps, W, H, rec, ox, oy, col); rem[k] = rec; } };
  const na = mask & 17, fa = mask & 34, nl = mask & 4, fl = mask & 8;
  const U = P.U || '0000', sN = na && !fa && U[0] === '1' && U[1] === '0' && P.sb, sF = fa && !na && U[1] === '1' && U[0] === '0' && P.sa;      // (one arm is lost and the swing is made with it: the arm that is left does it instead, see SWAP in tools/yuji_art.py)
  if (na) ap('an', sN ? P.sb[i] : P.an[i]); if (fa) ap('af', sF ? P.sa[i] : P.af[i]); if (na && fa && P.aa[i]) gorePatch(g, P.aa[i], W, H, null, ox, oy, col);
  if (nl) ap('lf', P.lf[i]); if (fl) ap('lb', P.lb[i]); if (nl && fl && P.ll[i]) gorePatch(g, P.ll[i], W, H, null, ox, oy, col);
  let cx = 0, cy = 0, n = 0; for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (g[y * W + x]) { cx += x; cy += y; n++; } if (n) { cx /= n; cy /= n; }
  const RC = clean ? [rgbOf(GCOL.w1), rgbOf(GCOL.w0), rgbOf(GCOL.w1)] : [rgbOf(GCOL.r2), rgbOf(GCOL.r0), rgbOf(GCOL.r1)], put = (x, y, c, over) => { if (x >= 0 && y >= 0 && x < W && y < H && (over || g[y * W + x])) g[y * W + x] = c; }, OL = rgbOf('#0e0a1a');
  const lum = v => (v & 255) + ((v >> 8) & 255) + ((v >> 16) & 255);
  const bfs = (S, s) => { const d = new Map([[s, 0]]), q = [s]; for (let h = 0; h < q.length; h++) { const p = q[h], x = p % W, y = (p / W) | 0; for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) { const nn = (y + dy) * W + x + dx; if ((dx || dy) && S.has(nn) && !d.has(nn)) { d.set(nn, d.get(p) + 1); q.push(nn); } } } return d; };
  const limp = (k, rx, ry, dr, ids) => {      // a dead shoulder: the arm hangs straight down from the shoulder (sleeve, then the hand), in the colours of the arm
    const cnt = { a: new Map(), b: new Map() }; for (const id of ids || []) { const c = base[id], d = dr ? dr.get(id) : undefined; if (d === undefined || !c || lum(c) < 120) continue; const m = cnt[d < 7 ? 'a' : 'b']; m.set(c, (m.get(c) | 0) + 1); }
    const top = m => { let b = 0, ch = 0; for (const [c, v] of m) if (v > b) { b = v; ch = c; } return ch; }, sl = top(cnt.a) || rgbOf('#28305c'), sk = top(cnt.b) || sl, far = k === 'af';
    for (let t = 0; t < 12; t++) { const x = rx + (t > 6 ? 1 : 0), y = ry + 1 + t, c = t < 8 ? sl : sk; if (y >= H) break; for (let dx = -1; dx <= 1; dx++) put(x + dx, y, c, !far || !g[y * W + x + dx]); put(x - 2, y, OL, !far || !g[y * W + x - 2]); put(x + 2, y, OL, !far || !g[y * W + x + 2]); }
    for (let dx = -2; dx <= 2; dx++) put(rx + 1 + dx, ry + 13, OL, true);
    if (!clean) { for (let t = 0; t < 3; t++) for (let dx = -1; dx <= 1; dx++) if (((t + dx + 3) & 1) === 0) put(rx + dx, ry + 1 + t, RC[0], true); put(rx + 1, ry + 11, RC[2], true); put(rx + 1, ry + 12, RC[0], true); }
  };
  for (const k of GLIMB) {
    const ids = rem[k] || [], dead = (k === 'an' && (mask & 16) && !(mask & 1)) || (k === 'af' && (mask & 32) && !(mask & 2));
    const J = P.J && P.J[k], jx = J && J[2 * i] >= 0 ? J[2 * i] + ox : -1, jy = J ? J[2 * i + 1] + oy : -1;
    if (!ids.length) { if (dead && jx >= 0) limp(k, Math.round(jx), Math.round(jy), null, null); continue; }
    const S = new Set(ids); let root = -1;
    if (jx >= 0) { let bd = 1e9; for (const id of ids) { if (lum(base[id]) < 120) continue; const d = Math.hypot(id % W - jx, ((id / W) | 0) - jy); if (d < bd) { bd = d; root = id; } } }      // (the root: the sleeve pixel of the limb nearest the joint)
    else { const e = goreEnds(ids, W); if (e) root = Math.hypot(e.u % W - cx, ((e.u / W) | 0) - cy) <= Math.hypot(e.v % W - cx, ((e.v / W) | 0) - cy) ? e.u : e.v; }
    if (root < 0) continue; const dr = bfs(S, root), rx = root % W, ry = (root / W) | 0;
    if (dead) { limp(k, jx >= 0 ? Math.round(jx) : rx, jx >= 0 ? Math.round(jy) : ry, dr, ids); continue; }
    if (dr.size < 14) continue;      // (hardly any of the limb was in sight: nothing to show a stump with)
    if (jx >= 0) { const bx = Math.round(jx), by = Math.round(jy), nb = Math.max(Math.abs(rx - bx), Math.abs(ry - by)); if (nb > 1) {      // the part of the limb that was hidden behind the body is drawn from the joint to the root, so the stump is joined to the body
      const c = base[root], br = []; for (let s = 0; s <= nb; s++) { const x = Math.round(bx + (rx - bx) * s / nb), y = Math.round(by + (ry - by) * s / nb); for (const [dx, dy] of [[0, 0], [0, 1], [1, 0]]) { const X = x + dx, Y = y + dy; if (X >= 0 && Y >= 0 && X < W && Y < H && !g[Y * W + X]) { g[Y * W + X] = c; br.push(Y * W + X); } } }
      for (const id of br) for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const X = id % W + dx, Y = ((id / W) | 0) + dy; if (X >= 0 && Y >= 0 && X < W && Y < H && !g[Y * W + X]) g[Y * W + X] = OL; } } }
    for (const id of ids) { const d = dr.get(id); if (d === undefined || d > 3) continue; g[id] = d <= 1 ? base[id] : d === 2 ? RC[0] : RC[1]; }      // the stump: three pixels of the limb stay, the end is red
    if (!clean) for (let c = 0; c < 2; c++) { const x = rx + c - (k[0] === 'a' ? 0 : 1), len = 3 + ((i * 5 + c * 3 + (k === 'an' || k === 'lf' ? 1 : 2)) % 5); for (let t = 0; t < len; t++) { const y = ry + 3 + t; if (y < H && x >= 0 && x < W && g[y * W + x] && RC.indexOf(g[y * W + x]) < 0) g[y * W + x] = t < 2 ? RC[1] : RC[2]; } }      // blood runs down the body in two lines
  }
  if (!clean && (mask & 448)) { let y0 = H, y1 = 0; for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (g[y * W + x]) { y0 = Math.min(y0, y); y1 = Math.max(y1, y); } const hh = y1 - y0 + 1;      // wounds: a red mark on the chest, the belly and the head
    for (const [bit, f0] of [[64, 0.34], [128, 0.5], [256, 0.1]]) if (mask & bit) { const y = Math.round(y0 + hh * f0), xs = []; for (let x = 0; x < W; x++) if (g[y * W + x]) xs.push(x); if (xs.length) { const x = xs[xs.length >> 1]; for (const [dx, dy, c] of [[0, 0, 1], [1, 0, 0], [-1, 1, 0], [0, 1, 2], [1, 2, 2], [0, 2, 0]]) put(x + dx, y + dy, RC[c], false); } } }
  if ((mask & 512) && n) {      // both legs gone: he lies on the floor (the picture turned a quarter, head forward) and crawls
    let x0 = W, x1 = -1, y0 = H, y1 = -1, by = 0; for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) { if (g[y * W + x]) { x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y); } if (base[y * W + x]) by = Math.max(by, y); }
    const r = new Uint32Array(W * H), xo = Math.round((x0 + x1) / 2 + (y0 + y1) / 2), yo = by - x1;
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) { const c = g[y * W + x]; if (!c) continue; const X = xo - y, Y = x + yo; if (X >= 0 && X < W && Y >= 0 && Y < H) r[Y * W + X] = c; }
    g = r;
  }
  const cv = document.createElement('canvas'); cv.width = W; cv.height = H; const c2 = cv.getContext('2d'), im = c2.createImageData(W, H); new Uint32Array(im.data.buffer).set(g); c2.putImageData(im, 0, 0); return cv;
}
function goreVar(src, mask) {
  const meta = MKM.get(src); if (!meta || !GPT.get(meta.s)) { const d = GDER.get(src); if (!d) return src; const v = goreVar(d.from, mask); return v === d.from ? src : invOf(v); }      // (a picture made from another one by invOf: the inverted variant)
  let m = GVC.get(src); if (!m) GVC.set(src, m = new Map());
  const key = mask | gdSet() << 12; let v = m.get(key); if (v === undefined) m.set(key, v = goreBuild(src, mask) || src); return v;
}
function goreMask(B) { return (B.st.an === 2 ? 1 : 0) | (B.st.af === 2 ? 2 : 0) | (B.st.lf === 2 ? 4 : 0) | (B.st.lb === 2 ? 8 : 0) | (B.st.an === 1 ? 16 : 0) | (B.st.af === 1 ? 32 : 0) | (B.hurt.ch ? 64 : 0) | (B.hurt.bl ? 128 : 0) | (B.hurt.hd ? 256 : 0) | (B.st.lf === 2 && B.st.lb === 2 ? 512 : 0); }
function goreSrc(side, src, geom) {      // the picture a fighter is drawn with: src without the limbs he has lost; geom(px, py) -> {x: world x, y: height from the ground line} places the pieces that fly off
  const B = GB[side]; if (!B || !gdActive(side)) return src; const mask = goreMask(B);
  if (B.pend.length && geom) { const pend = B.pend; B.pend = []; for (const k of pend) goreFly(side, k, src, geom); }      // (a piece that has just been ripped off is cut from the picture that still has the limb)
  const v = mask ? goreVar(src, mask) : src, dx = B.hb ? gdLunge(side, pnow()) : 0;
  return dx ? goreLunge(v, dx) : v;
}
// ---- pieces and blood
function gorePiece(pic, k, flip) {      // the ripped limb as a picture of its own (the pixels it covered, in the colours they had)
  const meta = MKM.get(pic), P = meta && GPT.get(meta.s); if (!P) return null; const W = pic.width, H = pic.height, base = new Uint32Array(pic.getContext('2d').getImageData(0, 0, W, H).data.buffer.slice(0)), g = Uint32Array.from(base), rec = [], lc = {};
  gorePatch(g, P[k][meta.i], W, H, rec, meta.ox | 0, meta.oy | 0, ch => lc[ch] !== undefined ? lc[ch] : (lc[ch] = rgbOf(meta.pal[ch] || '#ff00ff')));
  if (rec.length < 8) return null; let x0 = W, x1 = 0, y0 = H, y1 = 0; for (const id of rec) { const x = id % W, y = (id / W) | 0; x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y); }
  const w = x1 - x0 + 1, hh = y1 - y0 + 1, cv = document.createElement('canvas'); cv.width = w; cv.height = hh; const c2 = cv.getContext('2d'), im = c2.createImageData(w, hh), px = new Uint32Array(im.data.buffer);
  for (const id of rec) { const x = id % W, y = (id / W) | 0; if (base[id]) px[(y - y0) * w + (flip ? w - 1 - (x - x0) : x - x0)] = base[id]; }
  c2.putImageData(im, 0, 0); return { cv, cx: (x0 + x1) / 2, cy: (y0 + y1) / 2, w, h: hh };
}
function goreFly(side, k, pic, geom) {
  const meta = MKM.get(pic); if (!meta) return; const dir = side === 'f' ? (dummy.x >= wx ? 1 : -1) : (wx >= dummy.x ? 1 : -1), clean = gdSet() === 1;
  const pc = gorePiece(pic, k, false); if (!pc) return; const at = geom(pc.cx, pc.cy), fl = 1 + ((Math.random() * 4) | 0), flipped = geom(pc.cx + 1, pc.cy).x < at.x;
  const p2 = flipped ? gorePiece(pic, k, true) : pc;
  GSTAT.fly++; gibs.push({ x: at.x, y: at.y, vx: dir * (60 + Math.random() * 60), vy: -(110 + Math.random() * 60), cv: p2.cv, hw: p2.w / 2, hh: p2.h / 2, fl, rest: false, l: 0, lay: 1, gore: clean ? 2 : 1 });
  if (!clean) for (let n = 0; n < 26; n++) { const th = -Math.PI * (0.1 + Math.random() * 0.8), v = 40 + Math.random() * 120; spawnDrop(at.x + Math.random() * 4 - 2, at.y + Math.random() * 4 - 2, Math.cos(th) * v + dir * 30, Math.sin(th) * v, fl); }
  GB[side].stumpAt = pnow();
}
// ---- the damage
const GAREA = { h: { hd: 22, sn: 20, sf: 10, ch: 30, an: 10, af: 8 }, m: { ch: 25, bl: 15, an: 25, af: 15, sn: 10, sf: 5, lf: 3, lb: 2 }, l: { bl: 20, lf: 40, lb: 30, ch: 5, an: 3, af: 2 } };
function gorePick(h) { const w = GAREA[h] || GAREA.m; let t = 0; for (const k in w) t += w[k]; let r = Math.random() * t; for (const k in w) { r -= w[k]; if (r <= 0) return k; } return 'ch'; }
let goreHint = null;      // {side, h: 'h' high | 'm' middle | 'l' low, sharp, at}: set where a blow lands (hitFoe, gojoHit); the next frame's damage is explained by it
function goreHit(side, d, now) {      // the fighter on `side` has just lost d health
  GSTAT.hits++;
  const B = GB[side], mx = side === 'p' ? PHP : dummy.max || PHP, f = d / mx; if (f <= 0) return;
  const hint = goreHint && goreHint.side === side && now - goreHint.at < 120 ? goreHint : null, h = hint ? hint.h : 'm', att = side === 'p' ? (dummy && dummy.mode === 'fighter' ? vs.foe : null) : (cuMe() ? (vs.me === 'cu3' ? 'sukuna' : null) : vs.me), sharp = (hint && hint.sharp) || (att && GSHARP[att]) ? GT.sharp : 1;
  let part = gorePick(h), n = 0; const ok = k => !((k === 'an' || k === 'af' || k === 'lf' || k === 'lb') && B.st[k] === 2) && !((k === 'sn' && B.st.an) || (k === 'sf' && B.st.af));
  while (!ok(part) && n++ < 8) part = gorePick(h);
  if (!ok(part)) part = 'ch';
  if (part === 'sn' && B.st.an === 2 || part === 'sf' && B.st.af === 2) part = 'ch';
  B.dm[part] += f * sharp;
  const limb = part === 'an' || part === 'af' || part === 'lf' || part === 'lb', huge = f >= GT.huge && Math.random() < GT.hugeP;
  if (limb && (B.dm[part] >= GT.rip || huge)) goreRip(side, part, now);
  else if (part === 'sn' || part === 'sf') { const a = part === 'sn' ? 'an' : 'af'; if (B.st[a] === 0 && (B.dm[part] >= GT.sho || huge)) goreDead(side, a, now); }
  else if (part === 'ch' || part === 'bl' || part === 'hd') { if (!B.hurt[part] && (B.dm[part] >= GT.bod || huge)) { B.hurt[part] = 1; say('BADLY HURT', side === 'f' ? dummy.x : wx, '#ff6a5a', 8, now); } }
}
function goreDead(side, a, now) { const B = GB[side]; B.st[a] = 1; say('ARM USELESS', side === 'f' ? dummy.x : wx, '#ff9a5a', 8, now); snd('hit', 3); }
function goreRip(side, k, now) {
  const B = GB[side]; if (!B || B.st[k] === 2) return; GSTAT.rips++; B.st[k] = 2; B.pend.push(k); B.flash = now; const clean = gdSet() === 1;
  say(clean ? 'LIMB LOST' : 'RIPPED OFF!', side === 'f' ? dummy.x : wx, clean ? '#e8ecf4' : '#ff3a4a', 8, now);
  hitStop(110); stopMs = Math.max(stopMs, 140); shakeUntil = now + 320; shakeAmp = 6; slowMo(800, 0.3); goreRedUntil = now + 220; snd('rip');
  if (B.bleedAt === 0) B.bleedAt = now + 500;
}
let goreRedUntil = 0;
const GHB = 420, GDOM = { gojo: 2, yuji: 2, sukuna: 2, cat: 2, verity: 1, freddy: 0 };      // a headbutt takes 0.42 s; how many hands a hand-sign domain needs
const gdArmsOk = B => B.kind === 'freddy' ? (B.st.an === 0 ? 1 : 0) : (B.st.an === 0 ? 1 : 0) + (B.st.af === 0 ? 1 : 0),      // (Freddy fights with the claw arm alone)
  gdLegsOk = B => (B.st.lf === 0 ? 1 : 0) + (B.st.lb === 0 ? 1 : 0), gdHurtN = B => B.hurt.ch + B.hurt.bl + B.hurt.hd;
function goreSpdF(side) { const B = GB[side]; if (!B || !gdActive(side)) return 1; const l = gdLegsOk(B); return (l === 2 ? 1 : l === 1 ? 0.35 : 0.15) * Math.max(0.4, 1 - GT.slow * gdHurtN(B)); }      // walking speed: one leg 35%, none 15%, and a hurt body is slower
const goreSpd = () => goreSpdF('p');
function goreBob(side, now) {      // a hop on one leg lifts him with every step; a crawler bobs a little
  const B = GB[side]; if (!B || !gdActive(side)) return 0; const l = gdLegsOk(B); if (l === 2) return 0;
  const mv = side === 'p' ? Math.abs(wvx) > 8 : !!dummy && dummy.ai === 'walk'; if (!mv) return 0; return l === 1 ? -Math.round(Math.abs(Math.sin(now / 110)) * 3) : Math.round(Math.sin(now / 150));
}
const GLC = new WeakMap();
function goreLunge(cv, dx) {      // the head and shoulders of the picture pushed dx pixels forward (the headbutt)
  let m = GLC.get(cv); if (!m) GLC.set(cv, m = {}); if (m[dx]) return m[dx];
  const W = cv.width, H = cv.height, a = cv.getContext('2d').getImageData(0, 0, W, H).data, o = document.createElement('canvas'); o.width = W; o.height = H; const g = o.getContext('2d'); let y0 = H, y1 = 0;
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (a[(y * W + x) * 4 + 3]) { y0 = Math.min(y0, y); y1 = Math.max(y1, y); }
  const cut = y0 + Math.round((y1 - y0 + 1) * 0.36); g.drawImage(cv, 0, cut, W, H - cut, 0, cut, W, H - cut); g.drawImage(cv, 0, 0, W, cut, dx, 0, W, cut); return (m[dx] = o);
}
function goreHeadbutt(side, now) { const B = GB[side]; if (B.hb) return; B.hb = { at: now, hit: false }; snd('swing', 3); }
function gdLunge(side, now) { const B = GB[side], t = B.hb ? now - B.hb.at : GHB; if (t >= GHB) return 0; return t < 120 ? -Math.round(t / 60) : t < 200 ? -2 + Math.round((t - 120) / 80 * 9) : t < 260 ? 7 : Math.round(7 * (1 - (t - 260) / 160)); }
function goreOkMove(side, k) {      // may the fighter on `side` make swing k with the limbs he has left?
  if (!gdActive(side)) return true; const kind = gdKind(side), B = GB[side]; if (isKick(kind, k) && gdLegsOk(B) < 2) return false;
  const set = kind === 'yuji' ? YU.atk[k] : kind === 'gojo' ? D['atk' + k] : null, P = set && GPT.get(set), u = P && P.U; if (!u) return true;
  return (u[0] === '1' ? 1 : 0) + (u[1] === '1' ? 1 : 0) <= gdArmsOk(B) && !((u[2] === '1' || u[3] === '1') && gdLegsOk(B) < 2);      // (a swing with one arm can be made with either; a swing with both needs both; a swing with a leg needs both legs)
}
function goreGate(now) {      // the player's controls with the limbs he has lost (the end of vsTick)
  if (!gdActive('p')) return; const B = GB.p, arms = gdArmsOk(B), legs = gdLegsOk(B), kind = gdKind('p');
  if (B.hb && now - B.hb.at < GHB) { keyL = keyR = padL = padR = jumpReq = atkReq = crReq = lpReq = dashReq = ceReq = domReq = false; return; }
  if (legs < 2) jumpReq = dashReq = false; if (legs === 0) { crReq = false; blockHeld = false; }
  if (arms === 0) { lpReq = ceReq = false; blockHeld = false; if (GDOM[kind] !== 0) domReq = false; if (atkReq) { atkReq = false; goreHeadbutt('p', now); } }
  else if (arms === 1 && GDOM[kind] === 2) domReq = false;      // (a hand-sign domain needs both hands)
}
function goreFoe(now) {      // the enemy's decisions with the limbs he has lost: no hands = a headbutt; a swing that needs a lost limb is not made
  const d = dummy, B = GB.f; if (!gdActive('f') || d.mode !== 'fighter' || d.ko >= 0 || vs.ph !== 'fight') return;
  if (d.ai === 'attack' && B.seenAt !== d.aiAt) {
    B.seenAt = d.aiAt;
    if (gdArmsOk(B) === 0) { goreHeadbutt('f', now); d.ai = 'rest'; d.aiAt = now; d.restFor = GHB + 250; d.chain = 0; }
    else if (!goreOkMove('f', d.k)) { d.k = (d.k + 1) % 4; d.ai = 'think'; d.aiAt = now; d.chain = 0; }
  }
}
function goreCough(side, now) {
  say('COUGH', side === 'f' ? dummy.x : wx, '#ff6a5a', 8, now); const x = side === 'f' ? dummy.x : wx; if (gdSet() === 0) for (let n = 0; n < 8; n++) spawnDrop(x + 4 + Math.random() * 4, -(34 + Math.random() * 6), 20 + Math.random() * 40, -20 - Math.random() * 30, 1 + ((Math.random() * 3) | 0));
  if (side === 'p') pStun = Math.max(pStun, now + 500); else { dummy.stunUntil = Math.max(dummy.stunUntil, now + 500); dummy.ai = 'rest'; dummy.aiAt = now; dummy.restFor = 500; }
}
function goreTick(now, dt) {      // every frame of a fight (vsTick): looks for lost health and acts on what the body has lost
  if (!vs || vs.ph !== 'fight') return;
  for (const side of ['p', 'f']) {
    const B = GB[side]; if (!gdActive(side)) { B.last = null; continue; } const kind = gdKind(side), other = side === 'p' ? 'f' : 'p', O = GB[other];
    if (B.kind !== kind) { if (B.kind) Object.assign(B, goreBody()); B.kind = kind; }      // (another fighter steps in: a new body)
    let hp = side === 'p' ? vs.hp : dummy.hp; if (B.last === null) B.last = hp;
    if (hp < B.last - 1e-6) {      // he has lost d: a hurt body takes more, and one that hits with a hurt body hits less
      const d = B.last - hp, d2 = d * (gdHurtN(B) ? 1 + GT.vuln : 1) * (1 - Math.min(0.3, GT.weak * (gdActive(other) ? gdHurtN(O) : 0))), adj = d - d2;
      if (Math.abs(adj) > 1e-6 && hp > 0) { if (side === 'p') hp = vs.hp = Math.min(PHP, Math.max(0, vs.hp + adj)); else hp = dummy.hp = Math.min(dummy.max, Math.max(0, dummy.hp + adj)); if (hp <= 0) { if (side === 'p') endRound('enemy', 'ko', now); else if (dummy.ko < 0) koDummy(now); } }
      goreHit(side, d2, now);
    }
    B.last = hp;
    const lost = (B.st.an === 2) + (B.st.af === 2) + (B.st.lf === 2) + (B.st.lb === 2);
    if (lost && B.bleedAt && now >= B.bleedAt) {      // bleeding: a little health every half second until the round ends
      B.bleedAt = now + 500; const d = Math.max(0.1, (side === 'p' ? PHP : dummy.max) * GT.bleed * Math.min(3, lost));
      if (side === 'p') { vs.hp = Math.max(0, vs.hp - d); vs.hitAt = now; if (vs.hp <= 0) endRound('enemy', 'ko', now); B.last = vs.hp; } else if (dummy.ko < 0) { dummy.hp = Math.max(0, dummy.hp - d); dummy.hitAt = now; if (dummy.hp <= 0) koDummy(now); B.last = dummy.hp; }
    }
    if (lost && gdSet() === 0 && now >= B.dripAt) { B.dripAt = now + 140; const x = side === 'f' ? dummy.x : wx; spawnDrop(x + Math.random() * 6 - 3, -(10 + Math.random() * 20), (Math.random() - 0.5) * 30, -20 - Math.random() * 20, 1 + ((Math.random() * 3) | 0)); }
    if (gdHurtN(B)) { if (!B.coughAt) B.coughAt = now + 3000 + Math.random() * 2000; else if (now >= B.coughAt) { B.coughAt = now + 4000 + Math.random() * 2500; goreCough(side, now); } }      // a hurt body coughs blood and doubles over now and then
    if (side === 'f') { if (B.spd0 === undefined) B.spd0 = dummy.spd || 1; dummy.spd = B.spd0 * goreSpdF('f'); }
    if (B.hb) { if (!B.hb.hit && now - B.hb.at >= 150) { B.hb.hit = true; if (side === 'p') hitFoe(0, now); else if (Math.abs(dummy.x - wx) <= 34) gojoHit(0, now); } if (now - B.hb.at >= GHB) B.hb = null; }
  }
  if (gdSet() === 1) for (let i = gibs.length - 1; i >= 0; i--) { const g = gibs[i]; if (g.gore === 2) { g.born = g.born || now; if (now - g.born > 2500) gibs.splice(i, 1); } }      // (CLEAN: the pieces fade away after a while)
}
const goreOver = now => { if (now < goreRedUntil) { ctx.fillStyle = 'rgba(200,0,24,' + (0.4 * (goreRedUntil - now) / 220) + ')'; ctx.fillRect(-8, 0, VW + 16, VH); } };      // (the red flash of a rip)
