// ================================================================ v1.135 CHAPTER 3, PART 3: THE AIR FIGHT, FIRST HALF (Sukuna against Mahoraga, high over the city, to the song)
// Sukuna, thrown up by the uppercut of part 2 (tools/chap3b.js), finds his balance in the air; Mahoraga looks up, crouches and leaps off the street (the groove of the song begins), hovers; the punch in BULLET TIME (the clock slows to a crawl, the camera swings round), the dodge, Sukuna cuts the arm off
// (black-and-white impact frame) and kicks it away; Mahoraga's other hand grabs him and throws him down; Sukuna's slashes catch Mahoraga like a rope (red-and-white cut lines), he spins him while the arm grows back, and throws him up. The song is the first 2:06 of the one the user gave (c9Music in tools/chap3b.js): every blow is on its beat (c9B in tools/chap3.js, the key moments are C10K).
// Like parts 1 and 2 the whole scene is a function of the scene time: m = the song time (T - c9Start()), w = the ACTION time (the bullet-time clock: it runs slow between the dash and the cut and then at full speed again), so a tap that skips a cut, a pause or a test that jumps to a time draws the same picture.
// World = the alley's coordinates (x from the left edge of the street, y from the top, the street at gy); everything of the fight happens at the arena AC (where the uppercut left Sukuna, c8Fly's end), 700 px above the street.

const c10out = k => 1 - Math.pow(1 - clamp01(k), 3), c10bk = k => { k = clamp01(k) - 1; return 1 + 2.70158 * k * k * k + 1.70158 * k * k; };      // (ease out; ease out with an overshoot)
const C10E = [[3.5, -18.5], [3.5, -19.5], [3.5, -18.5], [3.5, -17.5], [2.5, -18.5], [0.5, -17.5], [-1.5, -15.5], [2.5, -18.5], [5.5, -17.5], [-0.5, -16.5], [1.5, -17.5], [1.5, -15.5], [6.5, -19.5], [1.5, -13.5], [3.5, -18.5]];      // where his eye is in each of the air pictures (from the pivot)
const C10H = { 4: [8.5, -9], 7: [-5, -16.5], 8: [15.5, 1.5], 9: [3, 0.5], 10: [14, -5.5], 12: [12, -17] };      // and his near hand (from the pivot) in the pictures where it does something
const C10PV = [32, 36];      // the pivot of his air pictures (the middle of the body: they turn about it)
const C10G = { hx: 118, hy: 10, rec: 78, orb: { rx: 125, ry: 46, tilt: -0.38, w0: 2.2, p: 1.6 }, pull: 150 };      // where Mahoraga hovers (from the arena), how far the blow throws him back (px), the orbit of the spin (the half axes, the tilt, the speed it starts with, how it grows), where he hangs when the rope is pulled
const c10mf = (nm, k) => { const c = M7.clips[nm]; return c[0] + Math.max(0, Math.min(c[1] - 1, Math.floor(k))); };      // picture k of a clip

// ---- the action clock: u(m) is the action time (seconds since the dash began): the same as the song time, except between the dash and the cut, where it runs at a crawl (a slow motion that is made to show exactly aCut seconds of action, however long the song gives it)
const C10W = { d: null };
function c10WarpBuild() {
  const K = C10K, m0 = K.dash, m1 = K.cut, down = 0.5, up = 0.12, step = 1 / 120, A = K.aCut;
  const rate = (m, r) => m < m0 ? 1 : m < m0 + down ? 1 - (1 - r) * ease3((m - m0) / down) : m < m1 - up ? r : m < m1 ? r + (1 - r) * ease3((m - (m1 - up)) / up) : 1;
  const total = r => { let s = 0; for (let m = m0; m < m1; m += step) s += rate(m + step / 2, r) * step; return s; };
  let lo = 0.005, hi = 1; for (let i = 0; i < 32; i++) { const mid = (lo + hi) / 2; if (total(mid) < A) lo = mid; else hi = mid; }
  const r = (lo + hi) / 2, n = Math.ceil((m1 - m0) / step), tab = new Float32Array(n + 1); let s = 0;
  for (let i = 0; i < n; i++) { tab[i] = s; s += rate(m0 + (i + 0.5) * step, r) * step; } tab[n] = s;
  return { r, tab, m0, m1, step, A: s, rate: m => rate(m, r) };
}
function c10U(m) {      // the action time at the song time m (negative before the dash)
  const W = C10W.d || (C10W.d = c10WarpBuild());
  if (m <= W.m0) return m - W.m0; if (m >= W.m1) return W.A + (m - W.m1);
  const x = (m - W.m0) / W.step, i = Math.floor(x); return W.tab[i] + (W.tab[Math.min(i + 1, W.tab.length - 1)] - W.tab[i]) * (x - i);
}
const c10Slow = m => { const W = C10W.d || (C10W.d = c10WarpBuild()); return W.rate(m); };      // how fast the clock runs now (1 = normal)

// ---- the places (all from the arena AC, where the uppercut left Sukuna)
function c10Env() {
  const key = VW + 'x' + gy + 'x' + c8X0(); if (C10W.env && C10W.env.key === key) return C10W.env;
  const f = c8Fly(100), AC = { x: f.x, y: f.y }, X = c8Mah(C8T.hit + 1).mp, O = C10G.orb, th0 = -Math.PI / 2 - 0.3, orb = th => { const vx = O.rx * Math.cos(th), vy = O.ry * Math.sin(th), c = Math.cos(O.tilt), s = Math.sin(O.tilt); return [vx * c - vy * s, vx * s + vy * c]; };
  const CS = { x: AC.x - 20, y: AC.y + 470 }, T = C10K.fling - C10K.spin, p = O.p;
  let best = 0, bs = -9; for (let i = 0; i < 720; i++) { const th = i / 720 * 6.2832, e = 0.002, a = orb(th), b = orb(th + e), tx = (b[0] - a[0]) / e, ty = (b[1] - a[1]) / e, sc = -ty / Math.hypot(tx, ty) - 0.25 * Math.abs(tx) / Math.hypot(tx, ty) + (tx > 0 ? 0.1 : 0); if (sc > bs) { bs = sc; best = th; } }      // (the angle at which the orbit goes straight up: where he lets go)
  let thf = best; while (thf < th0 + 24 * Math.PI) thf += 2 * Math.PI;      // (twelve turns on or more: the speed it must have to end in thf: w0 at first, then growing as t^p)
  const w1 = O.w0 + ((thf - th0) - O.w0 * T) * (p + 1) / T;
  return C10W.env = { key, AC, SF: { x: AC.x + 6, y: AC.y }, CS, ST: { x: AC.x - 50, y: AC.y - 285 }, MT: { x: AC.x + 55, y: AC.y - 312 }, RG: { x: CS.x, y: CS.y - 20 }, X, orb, th0, thf, w1, T };
}
function c10Th(m) { const E = c10Env(), O = C10G.orb, t = Math.max(0, m - C10K.spin), p = O.p; return E.th0 + O.w0 * t + (E.w1 - O.w0) * E.T / (p + 1) * Math.pow(t / E.T, p + 1); }      // the angle of the orbit
const c10Om = m => { const E = c10Env(), O = C10G.orb, t = Math.max(0, m - C10K.spin); return O.w0 + (E.w1 - O.w0) * Math.pow(t / E.T, O.p); };      // and how fast it turns (rad/s)
function c10Gr(i, X) { const P = M7.frames[i], fx = (P.footN[0] + P.footF[0]) / 2; return { x: X + (P.pelvis[0] - fx), y: c8Fy() - 136 + P.pelvis[1] }; }      // his pelvis in the world when picture i stands on the street with the middle of its feet at X
function c10An(M, key) {      // where a point of Mahoraga's picture is in the world (key: one of its anchors or a point [x, y] of the picture), when the picture hangs by its pelvis on (M.x, M.y), turned by M.rot and scaled by M.sx
  const P = M7.frames[M.i], p = typeof key === 'string' ? P[key] : key, q = P.pelvis, sx = M.sx == null ? 1 : M.sx, sy = M.sy == null ? Math.abs(sx) : M.sy, dx = (p[0] - q[0]) * sx, dy = (p[1] - q[1]) * sy, c = Math.cos(M.rot || 0), s = Math.sin(M.rot || 0);
  return [M.x + dx * c - dy * s, M.y + dx * s + dy * c];
}
function c10Hp(S, rel) { const c = Math.cos(S.rot || 0), s = Math.sin(S.rot || 0), sx = S.sx == null ? 1 : S.sx; const dx = rel[0] * sx, dy = rel[1]; return [S.x + dx * c - dy * s, S.y + dx * s + dy * c]; }      // a point of Sukuna's picture (from the pivot) in the world

// ---- Mahoraga at the song time m: { i: his picture, x, y: his pelvis, rot, sx, back: { i, a }, mode } (every picture hangs by its pelvis; on the street by the middle of his feet)
function c10Mah(m) {
  if (m >= C11K.air2) return c11Mah(m);
  const E = c10Env(), K = C10K, AC = E.AC, SF = E.SF, s = m + C9.m0, w = c10U(m), X = E.X, G = C10G, hs = s * 8;
  const idle = () => c10mf('idle', Math.floor(hs) % 12), bob = (t) => ({ x: 1.5 * Math.sin(t * 1.6), y: 2.4 * Math.sin(t * 2.3) });
  if (m < K.look) return { ...c10Gr(c10mf('idle', Math.floor(hs) % 12), X), i: idle(), rot: 0, sx: 1, mode: 'idle' };
  if (m < K.launch) { const f = m < K.crouch ? (m - K.look < 0.3 ? 0 : 1) : Math.min(7, 2 + Math.floor((m - K.crouch) * 6.5)), i = c10mf('crouch', f); return { ...c10Gr(i, X), i, rot: 0, sx: 1, mode: 'crouch' }; }
  const p0 = c10Gr(c10mf('crouch', 7), X), hv = t => { const b = bob(t + C9.m0); return { x: AC.x + G.hx + b.x, y: AC.y + G.hy + b.y }; };
  if (m < K.arrive) {      // the leap: fast off the street, slowing as he rises (the arms trailing up, the legs down), the ready stance as he arrives
    const t = (m - K.launch) / (K.arrive - K.launch), f = 1 - Math.pow(1 - t, 2.2), o = { x: lerp(p0.x, AC.x + G.hx, ease3(t)), y: lerp(p0.y, AC.y + G.hy, f), rot: 0, sx: 1, mode: 'leap', i: c10mf('leap', (m - K.launch) / 0.065) };
    if (t > 0.7) { const q = ease3((t - 0.7) / 0.25); o.i = c10mf('float', Math.floor(hs) % 12); o.back = { i: c10mf('leap', 7), a: 1 - q }; } return o;
  }
  if (m < K.wind) { const guard = m > K.arrive + 1.1, o = { ...hv(m), rot: 0, sx: 1, mode: 'hover', i: c10mf(guard ? 'floatg' : 'float', Math.floor(hs) % 12) }; if (guard && m < K.arrive + 1.4) o.back = { i: c10mf('float', Math.floor(hs) % 12), a: 1 - (m - K.arrive - 1.1) / 0.3 }; return o; }
  const h1 = hv(K.dash), F = M7.frames[c10mf('apunch', 11)], dxF = F.fist[0] - F.pelvis[0];
  if (w < 0) { const k = (m - K.wind) / (K.dash - K.wind); return { x: hv(m).x + 10 * ease3(k), y: hv(m).y, rot: 0, sx: 1, mode: 'wind', i: c10mf('apunch', Math.min(5, 6 * c10out(k))) }; }
  const xs = h1.x + 10, xc = SF.x - 2 - dxF, ys = h1.y;
  if (m < K.cut) {      // the dash: the fist reaches Sukuna's face at w = 0.3, passes it, and goes on over his shoulder
    const x = w < 0.3 ? lerp(xs, xc, c10out(w / 0.3)) : xc - 14 * (1 - Math.exp(-(w - 0.3) / 0.35)), fi = w < 0.3 ? 6 + Math.floor(w / 0.06) : w < 0.55 ? 11 : 14;
    return { x, y: ys, rot: 0, sx: 1, mode: 'dash', i: c10mf('apunch', fi), w };
  }
  const xcut = xc - 14 * (1 - Math.exp(-(K.aCut - 0.3) / 0.35)), t = m - K.cut, bs = bob(s);
  if (m < K.gslot) {      // the arm is gone: thrown back by the cut (the stump drawn in), then hovering with it
    const rx = xcut + G.rec * (1 - Math.exp(-t / 0.28)), ry = ys - 8 * (1 - Math.exp(-t / 0.3));
    return { x: rx + bs.x * clamp01(t / 0.6), y: ry + bs.y * clamp01(t / 0.6), rot: 0, sx: 1, mode: 'stump', i: t < 0.5 ? c10mf('stump', t * 12) : c10mf('floats', Math.floor(hs) % 12) };
  }
  const rest = { x: xcut + G.rec, y: ys - 8 }, Gp = (() => { const Fg = M7.frames[c10mf('grab', 3)]; return { x: SF.x + 5 - (Fg.fistF[0] - Fg.pelvis[0]), y: SF.y + 3 - (Fg.fistF[1] - Fg.pelvis[1]) }; })();
  if (m < K.throwAt - 0.43) {      // the lunge: the open hand reaches over and closes on Sukuna
    const t2 = m - K.gslot, k = c10out(t2 / 0.3), tr = t2 > 0.3 ? 0.9 * Math.sin(m * 90) : 0;
    return { x: lerp(rest.x + bob(s).x, Gp.x, k) + tr * 0.6, y: lerp(rest.y + bob(s).y, Gp.y, k) + tr * 0.5, rot: 0, sx: 1, mode: 'grab', i: c10mf('grab', t2 < 0.3 ? t2 / 0.3 * 4 : 4 + (t2 - 0.3) * 6) };
  }
  if (m < K.throwAt + 0.25) return { x: Gp.x, y: Gp.y, rot: 0, sx: 1, mode: 'throw', i: c10mf('throw', (m - (K.throwAt - 0.43)) * 14) };
  const d0 = K.throwAt + 0.6, dive = m - d0, St = c10Plunge(m);
  if (m < d0) return { x: Gp.x, y: Gp.y, rot: 0, sx: 1, mode: 'throw', i: c10mf('floats', Math.floor(hs) % 12), back: m < K.throwAt + 0.4 ? { i: c10mf('throw', 9), a: 1 - (m - K.throwAt - 0.25) / 0.15 } : null };
  const off = c10Orb(c10Th(K.spin)), u = clamp01((m - d0) / (K.lasso + 0.9 - d0)), ph = Math.pow(u, 1.7);      // (the dive: from where he hung to where the rope pulls him: Sukuna's place + the orbit's first point; faster and faster)
  if (m < K.spin) {
    const tx = St.x + off[0], ty = St.y + off[1], sw = m > K.lasso + 0.9 ? 6 * Math.exp(-(m - K.lasso - 0.9) * 2) * Math.sin((m - K.lasso) * 7) : 0;
    return { x: lerp(Gp.x, tx, ph) + sw, y: lerp(Gp.y, ty, ph), rot: -Math.PI / 2 * ease3(dive / 0.35), sx: 1, mode: 'dive', i: dive < 0.12 ? c10mf('floats', Math.floor(hs) % 12) : c10mf('flys', dive * 14), back: dive < 0.12 ? null : null };
  }
  return c10Spin(m);
}
function c10Orb(th) { return c10Env().orb(th); }
function c10Plunge(m) {      // Sukuna after he is let go: from the hand to the middle of the spin, fast and then slower and slower (like in thick air)
  const E = c10Env(), K = C10K, r = c10HandAt(K.throwAt), t = m - K.throwAt, k = 1 - Math.exp(-t / 0.62);
  return { x: lerp(r[0], E.CS.x, k), y: lerp(r[1], E.CS.y, k), t };
}
function c10HandAt(m) { const a = c10An(c10Mah(Math.min(m, C10K.throwAt + 0.2)), 'fistF'); return [a[0] - 5, a[1] - 3]; }      // where his open hand holds Sukuna (his pivot): the hand of the grab clip, then of the throw clip
function c10Spin(m) {
  const K = C10K, E0 = c10Env();
  if (m >= K.regrow && m < K.whole) return { x: E0.RG.x, y: E0.RG.y, rot: 0.12, sx: 1, sy: 1, i: c10mf('regrow', (m - K.regrow) / (K.whole - K.regrow) * 10), mode: 'regrow', depth: 0, th: 0, regrow: true };      // (the cutaway: while the arm grows back we look at him alone, held still in the middle of the picture with the whirl only in the streaks behind him)
  return c10Orbit(m);
}
function c10Orbit(m) {      // the orbit: Mahoraga whirls round Sukuna on the rope (a tilted ellipse: the far side behind him, the near side in front of him, bigger there), head first along the way he goes; then the throw and the flight up
  const E = c10Env(), K = C10K, th = c10Th(Math.min(m, K.fling)), o = c10Orb(th), a = c10Orb(th + 0.002), vx = (a[0] - o[0]) / 0.002, vy = (a[1] - o[1]) / 0.002, depth = Math.sin(th), whole = m >= K.whole;
  const regrow = m >= K.regrow && m < K.whole, i = regrow ? c10mf('regrow', (m - K.regrow) / (K.whole - K.regrow) * 10) : c10mf(whole ? 'fly' : 'flys', Math.floor((m + C9.m0) * 14) % 6);
  const pre = clamp01((m - K.spin) / 0.5);      // (the first half second: the dive's head-down turns into the orbit's)
  let x = E.CS.x + o[0], y = E.CS.y + o[1], rot, sx = 1, sc = 1 + 0.16 * depth * pre;
  rot = Math.atan2(-vy, -vx); const dr = ((rot + Math.PI / 2 + Math.PI) % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI) - Math.PI; rot = -Math.PI / 2 + dr * pre;      // (head first along the way he goes, the same side to the middle all the time: he turns over with the whirl; from the dive's head-down by the shortest way)
  if (m >= K.fling) {      // let go: up the way the orbit went, fast and then slower and slower, to where he hovers (MT); he turns upright on the way and the flung pictures give way to the hovering ones
    const t = m - K.fling, k = 1 - Math.exp(-t / 0.42), up = ease3(t / 1.3);
    x = lerp(x, E.MT.x, k); y = lerp(y, E.MT.y, k); rot = lerp(rot, 0, up); sx = lerp(sx, 1, up); sc = lerp(sc, 1, up);
    if (t > 0.9) { const q = ease3((t - 0.9) / 0.4); return { x, y: y + 2.4 * Math.sin((m + C9.m0) * 2.3) * q, rot, sx: sx * sc, sy: sc, i: c10mf('floatg', Math.floor((m + C9.m0) * 8) % 12), back: { i, a: 1 - q }, mode: 'top', depth, th: E.thf }; }
  }
  return { x, y, rot, sx: sx * sc, sy: sc, i, mode: m >= K.fling ? 'fling' : 'spin', depth, th, regrow };
}

// ---- Sukuna at the song time m: { pic, pv: the pivot, x, y, rot, sx, a, back: { pic, pv, a }, ei: his eye (C10E) }
function c10Suk(m) { return c13P0(c10Suk0(m), m); }      // (v1.140 the first punch may hit him: c13P0 in tools/chap3f.js)
function c10Suk0(m) {
  if (m >= C11K.air2) return c11Suk(m);      // (v1.136: from the end of v1.135 on the fight is the script of tools/chap3d.js)
  const D = CU_GAME[3]; if (!D || !D.air || !D.air.length || !D.atk || !D.atk[2] || !D.atk[2].length || !D.frames || !D.frames.length) return null;
  const E = c10Env(), K = C10K, SF = E.SF, s = m + C9.m0, w = c10U(m), air = D.air, kick = D.atk[2], f4 = Math.floor(m * 7) & 3, PV = C10PV, fl = c8Fly(s);
  const mk = (pic, x, y, rot, o) => ({ pic, pv: PV, x, y, rot: rot || 0, sx: 1, a: 1, ...o }), fp = t => { const f = c8Fly(t + C9.m0); return { x: f.x + 1.2 * Math.sin(t * 1.9), y: f.y + 2.4 * Math.sin(t * 2.7) }; };
  if (m < K.catch) return { pic: c8SukPic(fl.fi), pv: [33, 34], x: fl.x, y: fl.y, rot: fl.ang, sx: 1, a: 1, mode: 'tumble' };
  if (m < K.catch + 0.36) { const k = (m - K.catch) / 0.36, a0 = c8Fly(K.catch + C9.m0).ang; return { ...mk(air[0], fl.x, fl.y, lerp(a0, -2 * Math.PI, c10bk(k))), a: ease3(k * 1.5), back: { pic: c8SukPic(4), pv: [33, 34], a: 1 - ease3(k * 2.2) }, ei: 0, mode: 'catch' }; }
  if (w < 0) { const beck = m >= K.beckon, q = fp(m); return mk(beck ? air[4] : air[f4], q.x, q.y, 0.04 * Math.sin(m * 1.3), { ei: beck ? 4 : f4, mode: beck ? 'beckon' : 'float' }); }
  const B0 = fp(K.dash);
  if (m < K.cut + 0.12) {      // the dodge (leaning back, the feet kicked forward, a little lower) and the chop (up again, the hand high behind the head, then through)
    const e1 = ease3(clamp01((w - 0.1) / 0.2)), e2 = ease3(clamp01((w - 0.62) / 0.16)), fw = e1 * (1 - e2), k = w < 0.1 ? 0 : w < 0.2 ? 5 : w < 0.62 ? 6 : w < 0.76 ? 7 : 8;
    return mk(k ? air[k] : air[f4], B0.x - 13 * fw + 7 * e2, B0.y + 14 * fw - 4 * e2, -0.58 * fw + 0.2 * e2, { ei: k ? k : f4, mode: 'dodge', k });
  }
  const ks = K.cut + 0.12, ke = K.kick + 0.1;
  if (m < K.kick + 0.5) {      // the spinning kick that sends the arm away
    const k = clamp01((m - ks) / (ke - ks)), pic = m < K.kick - 0.15 ? kick[4] : m < K.kick + 0.2 ? kick[5] : kick[6];
    return mk(pic, SF.x + 1 + 6 * (1 - Math.cos(Math.PI * clamp01(k))) * 0.5, SF.y - 7 * Math.sin(Math.PI * k), -2 * Math.PI * ease3(k), { ei: null, mode: 'kick' });
  }
  if (m < K.gslot + 0.3) { const q = fp(m); return mk(air[f4], SF.x + (q.x - fp(K.dash).x) * 0.3, SF.y + (q.y - B0.y) * 0.5, 0.03 * Math.sin(m * 1.7), { ei: f4, mode: 'float2' }); }
  if (m < K.throwAt) {      // held in the hand: limp, shaken by the squeeze
    const h = c10HandAt(m), sh = Math.sin(m * 70);
    return mk(air[13], h[0] + sh * 0.7, h[1] + Math.cos(m * 61) * 0.6, 0.3 * Math.sin(m * 5.2), { ei: 13, mode: 'held' });
  }
  const P = c10Plunge(m);
  if (m < K.lasso - 0.6) { const q = 1 - Math.exp(-P.t / 0.3); return mk(m < K.throwAt + 0.12 ? air[13] : air[14], P.x, P.y, Math.PI * q + 0.5 * Math.sin(P.t * 6) * Math.exp(-P.t * 1.4), { ei: 14, mode: 'plunge', trail: true }); }
  if (m < K.spin - 0.5) {      // he turns upright while he falls and throws the slashes up at Mahoraga, then pulls
    const r = clamp01((m - (K.lasso - 0.6)) / 0.6), pull = m > K.lasso + 0.6, jerk = Math.exp(-Math.max(0, m - K.lasso - 0.9) * 5) * (m > K.lasso + 0.9 ? 1 : 0);
    return mk(pull ? air[9] : m > K.lasso - 0.3 ? air[12] : air[14], P.x + 2 * jerk * Math.sin(m * 60), P.y + 5 * jerk, Math.PI + Math.PI * ease3(r) - (pull ? 0.28 : 0), { ei: pull ? 9 : m > K.lasso - 0.3 ? 12 : 14, mode: 'rope' });
  }
  if (m < K.fling) {      // the spin: his body turns after Mahoraga (he faces him; side on at the far and near ends of the orbit, so thin there), leaning back against the pull
    const M = c10Spin(m), o = c10Orb(M.th), face = o[0] / C10G.orb.rx, sg = face < 0 ? -1 : 1, sx = sg * Math.max(0.38, Math.abs(face)), lean = -0.3 * sg + 0.08 * Math.sin(M.th * 2), mid = m < K.spin;
    return mk(air[10], E.CS.x, E.CS.y + 3 * Math.sin(m * 2.1), lean * sg, { sx: mid ? lerp(1, sx, ease3((m - (K.spin - 0.5)) / 0.5)) : sx, ei: 10, mode: 'spin' });
  }
  const tf = m - K.fling;      // the throw up: the heave, then he floats and rises after Mahoraga
  if (tf < 0.45) return mk(air[12], E.CS.x + 3 * Math.exp(-tf * 5), E.CS.y + 14 * (1 - Math.exp(-tf * 7)) , 0.2 * Math.exp(-tf * 3), { ei: 12, mode: 'heave' });
  const k = ease3((tf - 0.45) / 3.4), y0 = E.CS.y + 14, fx = lerp(E.CS.x, E.ST.x, k), fy = lerp(y0, E.ST.y, k), bobb = 2.4 * Math.sin(s * 2.7) * k;
  return mk(air[tf < 0.9 ? 3 : f4], fx, fy + bobb, 0.22 * (1 - k) * (1 - Math.exp(-(tf - 0.45) * 4)), { ei: f4, mode: 'rise', ghosts: k < 0.95 });
}
const C10CUT = 0.38;      // the share of the forearm that stays on the arm (maho_anim.py CUT)
function c10Arm(m) {      // the forearm Sukuna cuts off: { i (its picture), x, y (its middle), rot, cp: the place of the cut }; null before the cut
  const K = C10K, t = m - K.cut; if (t < 0) return null;
  const M0 = c10Mah(K.cut - 1e-4), el = c10An(M0, 'elbow'), wr = c10An(M0, 'wrist'), fi = c10An(M0, 'fist'), cp = [el[0] + (wr[0] - el[0]) * C10CUT, el[1] + (wr[1] - el[1]) * C10CUT];
  const c0 = [(cp[0] + fi[0]) / 2, (cp[1] + fi[1]) / 2], r0 = Math.atan2(-(fi[1] - cp[1]), -(fi[0] - cp[0])), tk = K.kick - K.cut, v0 = [-40, -25], g = 150, w0 = -2.5;
  let x, y, rot;
  if (t < tk) { x = c0[0] + v0[0] * t; y = c0[1] + v0[1] * t + 0.5 * g * t * t; rot = r0 + w0 * t; }
  else { const xk = c0[0] + v0[0] * tk, yk = c0[1] + v0[1] * tk + 0.5 * g * tk * tk, u = t - tk; x = xk - 780 * u; y = yk - 300 * u + 250 * u * u; rot = r0 + w0 * tk - 16 * u; }
  return { i: M7.clips.arm[0], x, y, rot, cp, t };
}

// ---- drawing: a picture with its pixel pv on the world point (x, y), turned and scaled about it (not rounded: in the slow motion a pixel at a time would stutter)
function c10Draw(img, pv, x, y, rot, sx, sy, a) {
  if (!img || a <= 0.003) return; ctx.save(); if (a < 1) ctx.globalAlpha *= a; ctx.translate(x, y); if (rot) ctx.rotate(rot); if (sx !== 1 || sy !== 1) ctx.scale(sx, sy); ctx.drawImage(img, -pv[0], -pv[1]); ctx.restore();
}
function c10DrawSuk(S, T) {
  if (!S) return; if (S.back) c10Draw(S.back.pic, S.back.pv, S.x, S.y, S.rot, S.sx, 1, S.back.a * S.a); c10Draw(S.pic, S.pv, S.x, S.y, S.rot, S.sx, 1, S.a);
  const eye = S.eye || (S.ei != null && C10E[S.ei]); if (eye) { const p = c10Hp(S, eye); c8Glint(p[0] - 1, p[1], T); }
}
function c10Lit(m) { if (m >= C11K.air2) return c11Lit(m); const K = C10K; if (Math.abs(m - K.cut) < 0.07 || Math.abs(m - K.fling) < 0.07 || Math.abs(m - K.launch) < 0.05) return 'white'; if (m >= K.regrow && m < K.whole + 0.8) return 'gold'; return 'cold'; }
function c10DrawMah(M, s, m, lit) {      // the wheel behind his head, his picture lit by the light of the moment, his eyes
  if (!M) return; const P = M7.frames[M.i], sx = M.sx == null ? 1 : M.sx, sy = M.sy == null ? Math.abs(sx) : M.sy, sc = Math.abs(sy), wc = c10An(M, [P.head[0] + 4, P.head[1] - 6]), k = c8NotchK(s), ea = ease3(clamp01((m - 3) / 0.8));
  c6Glow(wc[0], wc[1], 78 * sc, '255,200,100', 0.22 + 0.3 * k + 0.2 * ea + (M.mode === 'dash' || M.mode === 'leap' ? 0.2 : 0)); m7Wheel(wc[0], wc[1], 27 * sc, c8Ang(s), 1);
  const one = (i, a) => {
    const img = m7Lit(i, lit); if (!img) return; const Q = M7.frames[i]; ctx.save(); if (a < 1) ctx.globalAlpha *= a; ctx.translate(M.x, M.y); if (M.rot) ctx.rotate(M.rot); ctx.scale(sx, sy); ctx.translate(-Q.pelvis[0], -Q.pelvis[1]); ctx.drawImage(img, 0, 0);
    if (ea > 0.01) for (const [e, w] of [[Q.eye1, 4], [Q.eye2, 3]]) { const ex = Math.round(e[0]) - 1, ey = Math.round(e[1]); ctx.globalAlpha *= ea * (0.9 + 0.1 * Math.sin(s * 9)); ctx.fillStyle = '#ffd36a'; ctx.fillRect(ex, ey, w, 2); ctx.fillStyle = '#fff4c8'; ctx.fillRect(ex + 1, ey, Math.max(1, w - 2), 1); }
    ctx.restore();
  };
  if (M.back) one(M.back.i, M.back.a); one(M.i, 1);
  if (ea > 0.01) for (const key of ['eye1', 'eye2']) { const e = c10An(M, key); c6Glow(e[0] - 1, e[1], 7 * sc + 6 * k, '255,190,70', 0.5 * ea * (1 + k)); }
}
function c10DrawArm(A, lit) { if (!A) return; const img = m7Lit(A.i, lit), P = M7.frames[A.i]; if (img) c10Draw(img, P.pelvis, A.x, A.y, A.rot, 1, 1, 1); }

// ---- effects (all of them functions of the time: nothing is kept between frames)
function c10Scr(cam, x, y) { const c = Math.cos(cam.rot || 0), s = Math.sin(cam.rot || 0), dx = (x - cam.fx) * cam.z, dy = (y - cam.fy) * cam.z; return [cam.tx + dx * c - dy * s, cam.ty + dx * s + dy * c]; }      // a world point on the screen
function c10Blood(m, t0, x, y, n, seed, v, up) { c4Spray(m, t0, x, y, n, { v: v || 150, up: up == null ? 1 : up, dir: 0, life: 1.9, cols: C4_BLOOD, sz: 1, seed, g: 170, gnd: 1e9 }); }
function c10Rope(m, x0, y0, x1, y1, o) {      // the rope of cut lines from Sukuna's hand to Mahoraga: four strands (one white-hot, three red) that wave while it is slack and straighten as it gets taut (o.k 0 - 1); o.g (0 - 1) = how far out the end has flown; o.a = how much of it shows
  const g = o.g == null ? 1 : o.g, k = o.k == null ? 1 : o.k, al = o.a == null ? 1 : o.a, dx = x1 - x0, dy = y1 - y0, L = Math.hypot(dx, dy) || 1, nx = -dy / L, ny = dx / L, N = 20, ex = x0 + dx * g, ey = y0 + dy * g; if (al < 0.02) return;
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  for (let j = 0; j < 4; j++) {
    const amp = (1 - 0.85 * k) * 16 * (0.45 + 0.18 * j) + 1.1, fr = 2 + j * 0.9, spd = 9 + j * 3, ph = j * 1.7, pts = [];
    for (let i = 0; i <= N; i++) { const u = i / N, env = Math.sin(Math.PI * u), wv = amp * env * Math.sin(u * Math.PI * fr + m * spd + ph) + (c4R(i * 7 + j, Math.floor(m * 30)) - 0.5) * 2.4 * env; pts.push([x0 + (ex - x0) * u + nx * wv, y0 + (ey - y0) * u + ny * wv]); }
    for (let i = 0; i < N; i++) { ctx.globalAlpha = al * (j === 0 ? 1 : 0.7); c6Line(Math.round(pts[i][0]), Math.round(pts[i][1]), Math.round(pts[i + 1][0]), Math.round(pts[i + 1][1]), j === 0 ? '#ffffff' : (i + j) % 3 ? '#ff3347' : '#ff9aa6'); }
  }
  ctx.restore(); c6Glow((x0 + ex) / 2, (y0 + ey) / 2, 26 + L * 0.14, '255,70,90', 0.2 * al);
  for (let i = 0; i < 9; i++) { const ph = (m * 2.2 + c4R(i, 71)) % 1, u = c4R(i, 72) * g; ctx.globalAlpha = al * Math.sin(Math.PI * ph); ctx.fillStyle = i & 1 ? '#fff' : '#ff6a7a'; ctx.fillRect(Math.round(x0 + dx * u + nx * (ph - 0.5) * 14), Math.round(y0 + dy * u + ny * (ph - 0.5) * 14), 1, 1); } ctx.globalAlpha = 1;      // (sparks that fly off it)
}
function c10Coil(M, m, al) { if (al < 0.02) return; const c = c10An(M, 'chest'), sc = Math.abs(M.sy || M.sx || 1); ctx.save(); ctx.globalCompositeOperation = 'lighter'; for (let j = 0; j < 3; j++) { ctx.save(); ctx.translate(c[0], c[1] + (j - 1) * 8 * sc); ctx.rotate((M.rot || 0) + 0.3 * (j - 1)); ctx.scale(1, 0.32); ctx.beginPath(); ctx.arc(0, 0, 15 * sc, 0, 6.2832); ctx.lineWidth = 2.4; ctx.strokeStyle = 'rgba(255,50,75,' + (0.8 * al).toFixed(2) + ')'; ctx.stroke(); ctx.lineWidth = 0.9; ctx.strokeStyle = 'rgba(255,255,255,' + al.toFixed(2) + ')'; ctx.stroke(); ctx.restore(); } ctx.restore(); }      // (the rope wound three times round his chest)
function c10Rays(x, y, n, r0, r1, seed, col, a) { ctx.fillStyle = col; ctx.globalAlpha = a; for (let i = 0; i < n; i++) { const an = i / n * 6.2832 + (c4R(i, seed) - 0.5) * 0.25, w = 0.015 + 0.03 * c4R(i, seed + 1), rr = r0 + (r1 - r0) * (0.5 + 0.5 * c4R(i, seed + 2)); ctx.beginPath(); ctx.moveTo(x + Math.cos(an - w) * r0, y + Math.sin(an - w) * r0); ctx.lineTo(x + Math.cos(an) * rr, y + Math.sin(an) * rr); ctx.lineTo(x + Math.cos(an + w) * r0, y + Math.sin(an + w) * r0); ctx.fill(); } ctx.globalAlpha = 1; }
function c10Impact(m, t0, cam, wx, wy, len) {      // the impact frame: the picture goes negative for 3 frames, then hard black and white with rays from the point of impact, then a white flash that fades (screen space: call it after the stage)
  const k = m - t0, L = len || 0.5; if (k < 0 || k > L) return; const p = c10Scr(cam, wx, wy);
  if (k < 0.05) { ctx.save(); ctx.globalCompositeOperation = 'difference'; ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, VW, VH); ctx.restore(); }
  else if (k < 0.2) { const neg = Math.floor(k / 0.04) % 2 === 1; ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.filter = 'grayscale(1) contrast(9) brightness(1.25)' + (neg ? ' invert(1)' : ''); ctx.drawImage(cv, 0, 0); ctx.filter = 'none'; ctx.restore(); c10Rays(p[0], p[1], 30, 14, Math.hypot(VW, VH), 77, neg ? '#000' : '#fff', 0.9); }
  else c6White(0.5 * Math.exp(-(k - 0.2) * 8));
}
function c10Wind(m, dx, dy, a, seed) {      // streaks of wind across the whole picture, running the way (dx, dy) (px / s, on the screen)
  if (a < 0.02) return; const sp = Math.hypot(dx, dy) || 1, vert = Math.abs(dy) > Math.abs(dx), sg = (vert ? dy : dx) > 0 ? 1 : -1; ctx.save(); ctx.globalAlpha = a * 0.55; ctx.fillStyle = 'rgba(215,225,255,0.85)';
  for (let i = 0; i < 22; i++) {
    const r1 = c4R(i, seed), r2 = c4R(i, seed + 1), len = Math.round(12 + 40 * r2 * Math.min(1, sp / 700)), v = sp * (0.55 + 0.9 * r1), ph = (c4R(i, seed + 2) * 1.7 + m * v / 520) % 1.7 - 0.35;
    if (vert) ctx.fillRect(Math.round((r1 * VW * 1.2) % VW), Math.round(sg * ph * VH * 1.2 + (sg > 0 ? 0 : VH)), 1, len); else ctx.fillRect(Math.round(sg * ph * VW * 1.2 + (sg > 0 ? 0 : VW)), Math.round((r2 * VH * 1.2) % VH), len, 1);
  }
  ctx.restore();
}
function c10Clouds(cam, m) {      // thin banks of cloud in the moonlight at the heights over the city (they move 0.62 times as much as the camera: the climb and the fall go through them)
  c8Camp(cam, 0.62); const rr = (Math.hypot(VW, VH) + Math.abs(cam.tx - VW / 2) + Math.abs(cam.ty - VH / 2)) / cam.z + 40, p = 0.62, fx = C8W.ref.x + (cam.fx - C8W.ref.x) * p, fy = C8W.ref.y + (cam.fy - C8W.ref.y) * p, cw = 560, ch = 120;
  for (let gx = Math.floor((fx - rr) / cw); gx <= (fx + rr) / cw; gx++) for (let gy2 = Math.floor((fy - rr) / ch); gy2 <= (fy + rr) / ch; gy2++) {
    const y0 = gy2 * ch; if (y0 > -150 || y0 < -520) continue; const r = c4R(gx * 13 + gy2 * 7, 61); if (r < 0.42) continue; const hw = 90 + 130 * c4R(gx + gy2 * 3, 62), th = 6 + 11 * c4R(gx * 5 + gy2, 63), cx2 = gx * cw + c4R(gx * 3 + gy2, 64) * cw + m * (5 + 9 * c4R(gx + gy2, 65)), cy2 = y0 + c4R(gx + gy2 * 9, 66) * ch;
    for (let yy = -th; yy <= th; yy++) { const e = Math.sqrt(1 - (yy / th) * (yy / th)), w = Math.round(hw * e * (0.75 + 0.25 * Math.sin(yy * 1.3 + gx))); ctx.fillStyle = yy < -th * 0.3 ? 'rgba(190,205,255,0.13)' : 'rgba(120,135,200,0.10)'; ctx.fillRect(Math.round(cx2 - w), Math.round(cy2 + yy), w * 2, 1); }
  }
  c4Cam0();
}
function c10Ghosts(m, dt, n, a0, lit) {      // afterimages: where they were a moment ago, fainter and fainter
  for (let j = n; j >= 1; j--) { const q = m - dt * j, Mg = c10Mah(q), img = m7Lit(Mg.i, lit), Q = M7.frames[Mg.i]; if (img) c10Draw(img, Q.pelvis, Mg.x, Mg.y, Mg.rot, Mg.sx == null ? 1 : Mg.sx, Mg.sy == null ? Math.abs(Mg.sx == null ? 1 : Mg.sx) : Mg.sy, a0 / j); }
}
function c10GhostsS(m, dt, n, a0) { for (let j = n; j >= 1; j--) { const Sg = c10Suk(m - dt * j); if (Sg) c10Draw(Sg.pic, Sg.pv, Sg.x, Sg.y, Sg.rot, Sg.sx, 1, a0 / j); } }
function c10Warm(m) { const W = C10W; if (W.wi == null) W.wi = 122; for (let n = 0; n < 2 && W.wi < Math.min(M7.frames.length, 363); n++) { if (m7Lit(W.wi, 'cold')) W.wi++; } }      // (his new pictures are lit a few at a time while the earlier shots play)
function c10Shake(m) {      // how hard the picture shakes: each blow shakes it and the shake dies away; the spin shakes more and more
  const K = C10K; let a = 0; if (m >= C11K.air2) return c11Shake(m); for (const [t, v, k] of [[K.launch, 3.4, 5], [K.arrive, 1.3, 7], [K.cut, 4.5, 6], [K.kick + 0.1, 2.6, 8], [K.gslot + 0.3, 2.2, 6], [K.throwAt, 4.2, 5], [K.lasso + 0.9, 4.2, 6], [K.fling, 5.2, 5], [K.regrow, 1.2, 4], [K.whole, 2.2, 6]]) if (m >= t) a += v * Math.exp(-(m - t) * k);
  if (m >= K.spin && m < K.fling) a += 0.5 + 1.2 * clamp01(c10Om(m) / 16); if (m >= K.gslot + 0.4 && m < K.throwAt - 0.4) a += 0.6; if (C13Q.res.p0 === 'miss') { const t0 = c13T0(); if (m >= t0) a += 5 * Math.exp(-(m - t0) * 6); } return a;
}
function c10Fx(m, S, M, A, cam) {      // the effects that belong to the world (drawn with the camera on, over the actors)
  const K = C10K, E = c10Env(), AC = E.AC;
  if (m >= K.launch - 0.1 && m < K.launch + 1.6) { const X = E.X, a = m - K.launch; c4Crater(X, clamp01((a + 0.1) / 0.3) * 0.9); c4Dust(m, K.launch, X, 26, { w: 100, h: 34, life: 1.5, big: 11, seed: 3 }); c4Spray(m, K.launch, X, gy + 1, 22, { v: 280, up: 1.5, dir: 0, life: 1.1, cols: C4_STONE, sz: 1, seed: 41, gnd: gy + 3, g: 430 }); if (a >= 0) c3Ring(X, gy - 8, a, true, '255,235,200', 1); }
  if (m >= K.launch && m < K.arrive) c10Ghosts(m, 0.045, 4, 0.34, 'cold');
  if (m >= K.arrive && m < K.arrive + 0.8) { const a = m - K.arrive; v6Ring(M.x, M.y - 10, 18 + 170 * c10out(a / 0.8), 1 - a / 0.8, '200,220,255'); }
  if (M.mode === 'wind') { const k = (m - K.wind) / (K.dash - K.wind); for (let i = 0; i < 7; i++) { const a = 0.35 * ease3(k) * (1 - i / 8); ctx.fillStyle = 'rgba(255,230,170,' + a.toFixed(2) + ')'; ctx.fillRect(Math.round(M.x - 70 - 60 * c4R(i, 5)), Math.round(M.y - 30 + 50 * c4R(i, 6)), 8 + Math.round(18 * c4R(i, 7)), 1); } }
  if (m >= K.dash && m < K.cut) {      // the dash and the bullet time: afterimages of the dash, rings of pressure round the fist, motes hanging in the air
    const w = c10U(m), Fi = c10An(M, 'fist'); c10Ghosts(m, 0.18, 3, 0.3, 'white');
    if (w > 0.12) { for (let j = 0; j < 3; j++) { const q = w - 0.1 - 0.14 * j; if (q > 0) v6Ring(Fi[0] + 6, Fi[1] + 2, 10 + 62 * q, 0.55 * (1 - q / 0.6), '220,235,255'); } }
    ctx.save(); ctx.fillStyle = 'rgba(210,225,255,0.55)'; for (let i = 0; i < 26; i++) { const ph = (w * 0.5 + c4R(i, 81)) % 1; ctx.globalAlpha = Math.sin(Math.PI * ph) * 0.8; ctx.fillRect(Math.round(AC.x - 120 + c4R(i, 82) * 260 - 30 * w), Math.round(AC.y - 90 + c4R(i, 83) * 150 - ph * 18), 1, 1); } ctx.restore();
    if (S && S.mode === 'dodge') c10GhostsS(m, 0.3, 2, 0.28);
  }
  const A0 = c10Arm(K.cut), cp = A0 ? A0.cp : null;
  if (cp && m >= K.cut) {      // the cut: the white-hot slash through the arm, red as it fades; the blood; the drips from the stump; the wheel's light
    const t = m - K.cut;
    if (t < 0.9) { const al = t < 0.12 ? 1 : 0.7 * Math.exp(-(t - 0.12) * 3.4), L = 70 + 90 * c10out(t / 0.12), col = t < 0.12 ? '#ffffff' : '#ff5a6a'; ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = al; for (let o = -1; o <= (t < 0.12 ? 1 : 0); o++) { c6Line(Math.round(cp[0] - L * 0.82), Math.round(cp[1] + L * 0.58) + o, Math.round(cp[0] + L * 0.82), Math.round(cp[1] - L * 0.58) + o, col); c6Line(Math.round(cp[0] - L * 0.5), Math.round(cp[1] + L * 0.2) + o, Math.round(cp[0] + L * 0.5), Math.round(cp[1] - L * 0.34) + o, '#ffb0b8'); } ctx.restore(); c6Glow(cp[0], cp[1], 40, '255,90,110', 0.5 * al); }
    c10Blood(m, K.cut, cp[0], cp[1], 26, 5, 210, 0.8); c10Blood(m, K.cut + 0.02, cp[0], cp[1], 14, 6, 120, 1.2);
    for (let j = 0; j < 9; j++) { const t0 = K.cut + 0.08 + 0.11 * j; if (m < t0) break; const Mq = c10Mah(t0), st = c10An(Mq, 'stump'); c10Blood(m, t0, st[0], st[1], 3, 20 + j, 40, 0.3); }
    if (A && m < K.kick + 0.6) { for (let j = 1; j <= 7; j++) { const Aq = c10Arm(m - 0.045 * j); if (!Aq) break; ctx.fillStyle = j & 1 ? '#b3121f' : '#7a0c18'; ctx.globalAlpha = 0.8 - j * 0.1; ctx.fillRect(Math.round(Aq.x), Math.round(Aq.y), 2, 2); ctx.globalAlpha = 1; } }
    if (m >= K.kick && m < K.kick + 0.6 && A) { const a = m - K.kick; c3Ring(A.x, A.y, a, false, '255,235,220', 1); v6Ring(A.x, A.y, 8 + 90 * a, 0.7 * (1 - a / 0.6), '255,230,210'); }
  }
  if (m >= K.gslot + 0.28 && m < K.throwAt) { const a = m - K.gslot - 0.28; if (a < 0.5) v6Ring(S.x, S.y, 10 + 90 * c10out(a / 0.5), 0.8 * (1 - a / 0.5), '255,225,200'); ctx.save(); ctx.globalCompositeOperation = 'lighter'; for (let i = 0; i < 6; i++) { const ph = (m * 3 + c4R(i, 91)) % 1; if (ph > 0.3) continue; const an = c4R(i, 92) * 6.28, r = 12 + 14 * c4R(i, 93); ctx.globalAlpha = 0.9 * (1 - ph / 0.3); c6Line(Math.round(S.x + Math.cos(an) * r), Math.round(S.y + Math.sin(an) * r), Math.round(S.x + Math.cos(an) * (r + 8)), Math.round(S.y + Math.sin(an) * (r + 8)), '#fff'); } ctx.restore(); }      // (the squeeze: a ring at the grip, white stress lines round his body)
  if (m >= K.throwAt && m < K.throwAt + 0.7) { const a = m - K.throwAt, h = c10HandAt(K.throwAt); v6Ring(h[0], h[1], 14 + 140 * c10out(a / 0.7), 0.9 * (1 - a / 0.7), '255,235,215'); c3Ring(h[0], h[1], a, true, '255,235,200', 1); }
  if (S && (S.mode === 'plunge' || S.trail)) c10GhostsS(m, 0.05, 5, 0.36);
  if (m >= K.regrow && m < K.whole + 1.0 && M.mode !== 'top') {      // the arm grows back: a white-gold light on the stump, motes rising out of it, a flash when it is whole
    const st = c10An(M, 'stump'), k = clamp01((m - K.regrow) / (K.whole - K.regrow)), fade = m < K.whole ? 1 : 1 - clamp01((m - K.whole) / 1.0);
    c6Glow(st[0], st[1], 22 + 26 * k, '255,255,255', 0.5 * fade * (0.5 + 0.5 * k)); ctx.save(); ctx.globalCompositeOperation = 'lighter'; for (let i = 0; i < 16; i++) { const ph = (m * 1.3 + c4R(i, 95)) % 1; ctx.globalAlpha = Math.sin(Math.PI * ph) * 0.9 * fade; ctx.fillStyle = i & 1 ? '#ffffff' : '#ffe08a'; ctx.fillRect(Math.round(st[0] + (c4R(i, 96) - 0.5) * 30), Math.round(st[1] - ph * 40), 1 + (i & 1), 1); } ctx.restore();
    if (m >= K.whole && m < K.whole + 0.6) { const a = m - K.whole; v6Ring(st[0], st[1], 10 + 110 * c10out(a / 0.6), 0.9 * (1 - a / 0.6), '255,240,200'); }
  }
  if (M.mode === 'regrow') { ctx.save(); ctx.globalCompositeOperation = 'lighter'; for (let i = 0; i < 26; i++) { const sp = 380 + 520 * c4R(i, 61), ph = (m * sp / 420 + c4R(i, 62)) % 1, y = M.y - 60 + c4R(i, 63) * 120, x = M.x + 190 - ph * 420; ctx.globalAlpha = 0.5 * Math.sin(Math.PI * ph); c6Line(Math.round(x), Math.round(y), Math.round(x + 14 + 38 * c4R(i, 64)), Math.round(y), i & 1 ? '#c8d8ff' : '#ffffff'); } ctx.restore(); }
  if (m >= K.spin && m < K.fling && M.mode !== 'regrow') { const om = c10Om(m); if (om > 7) c10Ghosts(m, 0.028, 4, 0.34 * clamp01((om - 7) / 6), 'cold'); }      // (the whirl blurs)
  if (m >= K.fling && m < K.fling + 1.0) { const a = m - K.fling, o = c10Orb(E.thf); v6Ring(E.CS.x, E.CS.y, 20 + 200 * c10out(a / 0.8), 0.9 * (1 - a / 1.0), '255,230,220'); c3Ring(E.CS.x + o[0] * 0.7, E.CS.y + o[1] * 0.7, a, true, '255,235,220', 1); for (let i = 0; i < 12; i++) { const an = c4R(i, 51) * 6.28, v = 70 + 150 * c4R(i, 52), ps = c4R(i, 53); ctx.globalAlpha = Math.max(0, 1 - a / 0.9); c6Line(Math.round(E.CS.x + Math.cos(an) * v * a), Math.round(E.CS.y + Math.sin(an) * v * a), Math.round(E.CS.x + Math.cos(an) * (v * a + 10 + 14 * ps)), Math.round(E.CS.y + Math.sin(an) * (v * a + 10 + 14 * ps)), i & 1 ? '#fff' : '#ff6a7a'); } ctx.globalAlpha = 1; }      // (the rope breaks into sparks)
  if (S && S.mode === 'rise' && S.ghosts) c10GhostsS(m, 0.06, 3, 0.25);
}

// ---- the cameras: the keys of each shot are (song time, camera) pairs, the camera glides through them with a spline (no stops at the keys); a key's picture of the world is the one at its own time
function c10Kf(keys, m) {
  const n = keys.length; if (n === 1 || m <= keys[0][0]) return keys[0][1]; if (m >= keys[n - 1][0]) return keys[n - 1][1]; let i = 0; while (i < n - 2 && m > keys[i + 1][0]) i++;
  const t0 = keys[i][0], t1 = keys[i + 1][0], u = (m - t0) / (t1 - t0), o = {};
  for (const c of ['z', 'fx', 'fy', 'tx', 'ty', 'rot']) {
    const v0 = keys[i][1][c] || 0, v1 = keys[i + 1][1][c] || 0, pa = i > 0 ? keys[i - 1] : null, pb = i + 2 < n ? keys[i + 2] : null, m0 = pa ? (v1 - (pa[1][c] || 0)) / (t1 - pa[0]) : (v1 - v0) / (t1 - t0), m1 = pb ? ((pb[1][c] || 0) - v0) / (pb[0] - t0) : (v1 - v0) / (t1 - t0), h = t1 - t0, u2 = u * u, u3 = u2 * u;
    o[c] = (2 * u3 - 3 * u2 + 1) * v0 + (u3 - 2 * u2 + u) * h * m0 + (-2 * u3 + 3 * u2) * v1 + (u3 - u2) * h * m1;
  }
  return o;
}
function c10Cam(m, k) {
  if (/^[bd]\d\d$/.test(k)) return c11Cam(m, k);      // (v1.136: the shots of the second half)
  const E = c10Env(), K = C10K, AC = E.AC, cx = VW / 2, cy = VH * 0.5, C = (z, fx, fy, tx, ty, rot) => ({ z, fx, fy, tx: tx == null ? cx : tx, ty: ty == null ? cy : ty, rot: rot || 0 });
  const Sa = t => c10Suk(t) || { x: AC.x, y: AC.y, rot: 0, sx: 1 }, Ma = t => c10Mah(t), head = t => { const S = Sa(t); return c10Hp(S, C10E[S.ei == null ? 0 : S.ei] || [3.5, -18.5]); }, hd = t => c10An(Ma(t), 'head'), cp = () => { const a = c10Arm(K.cut); return a ? a.cp : [AC.x + 6, AC.y - 22]; };
  const mid = (a, b, f) => [lerp(a[0], b[0], f), lerp(a[1], b[1], f)];
  switch (k) {
    case 'sky': return c10Kf([[-1.3, c8Cam(C8T.hit, 'sky')], [-0.3, c8Cam(C9.m0 - 0.3, 'sky')], [1.2, C(1.55, Sa(1.2).x + 8, Sa(1.2).y + 2)], [c9B(1, 0), C(1.06, AC.x + 12, AC.y + 4)]], m);
    case 'aface': { const a = head(c9B(1, 0)), b = head(c9B(2, 0)); return c10Kf([[c9B(1, 0), C(3.0, a[0] - 4, a[1] + 3, cx + 34, cy, 0.05)], [c9B(2, 0), C(4.5, b[0] - 2, b[1] + 3, cx + 22, cy, -0.02)]], m); }
    case 'alook': { const f = t => hd(t); return c10Kf([[K.look, C(1.45, f(K.look)[0] + 6, f(K.look)[1] + 22, cx, VH * 0.6)], [K.crouch, C(1.75, f(K.crouch)[0] + 4, f(K.crouch)[1] + 18, cx, VH * 0.58)], [K.launch - 0.1, C(2.1, f(K.launch - 0.1)[0] + 2, f(K.launch - 0.1)[1] + 22, cx, VH * 0.56)], [K.launch, C(2.1, f(K.launch)[0] + 2, f(K.launch)[1] + 22, cx, VH * 0.56)]], m); }
    case 'aleap': { const q = t => Ma(t); return c10Kf([[K.launch, C(1.6, q(K.launch).x - 4, q(K.launch).y - 18, cx, VH * 0.62)], [K.launch + 0.3, C(1.15, q(K.launch + 0.3).x, q(K.launch + 0.3).y - 38, cx, VH * 0.56)], [K.launch + 0.8, C(0.95, q(K.launch + 0.8).x, q(K.launch + 0.8).y - 36)], [K.launch + 1.4, C(0.98, q(K.launch + 1.4).x - 10, q(K.launch + 1.4).y - 26)], [K.arrive, C(1.1, AC.x + 66, AC.y - 6)]], m); }
    case 'aduel': return c10Kf([[K.arrive, C(1.1, AC.x + 66, AC.y - 6)], [K.arrive + 1.2, C(1.25, AC.x + 66, AC.y - 12)], [K.wind, C(1.35, AC.x + 64, AC.y - 14, cx, cy, -0.02)], [K.dash, C(1.5, AC.x + 58, AC.y - 14, cx, cy, 0)]], m);
    case 'aslow': {
      const d = K.dash, F = t => c10An(Ma(t), 'fist'), H = head, P = mid(F(d + 0.7), H(d + 0.7), 0.5), P2 = mid(F(d + 1.4), H(d + 1.4), 0.3), c = cp();
      return c10Kf([[d, C(1.5, AC.x + 58, AC.y - 14, cx, cy, 0)], [d + 0.7, C(2.0, P[0], P[1] - 6, cx, cy, 0.04)], [d + 1.4, C(2.5, P2[0], P2[1] - 4, cx + 24, cy, -0.14)], [d + 2.1, C(2.7, H(d + 2.1)[0] + 4, H(d + 2.1)[1] + 2, cx + 36, cy, -0.26)], [d + 2.8, C(2.1, mid(H(d + 2.8), c, 0.55)[0], mid(H(d + 2.8), c, 0.55)[1], cx, cy, -0.08)], [K.cut - 0.04, C(1.85, c[0] - 4, c[1] + 8, cx, cy, 0.04)], [K.cut, C(1.85, c[0] - 4, c[1] + 8, cx, cy, 0.04)]], m);
    }
    case 'acut': { const c = cp(), SF = E.SF; return c10Kf([[K.cut, C(2.3, c[0] - 2, c[1] + 8, cx, cy, -0.04)], [K.cut + 0.5, C(1.9, c[0] - 10, c[1] + 10, cx, cy, 0.02)], [K.kick - 0.05, C(2.1, SF.x + 6, SF.y - 8, cx, cy, 0)], [K.kick + 0.6, C(1.75, SF.x + 14, SF.y - 4, cx, cy, 0)], [K.gslot, C(1.45, SF.x + 62, SF.y - 10)]], m); }
    case 'agrab': { const SF = E.SF, hp = t => c10HandAt(t), h0 = head(K.gslot + 1.3), h1 = head(K.throwAt - 0.5); return c10Kf([[K.gslot, C(1.75, SF.x + 62, SF.y)], [K.gslot + 0.4, C(2.1, SF.x + 44, SF.y - 2)], [K.gslot + 1.3, C(3.3, h0[0] + 2, h0[1] + 6, cx, cy, 0.03)], [K.throwAt - 0.5, C(3.2, h1[0] + 2, h1[1] + 6, cx, cy, -0.03)], [K.throwAt - 0.3, C(1.9, hp(K.throwAt - 0.3)[0] + 18, hp(K.throwAt - 0.3)[1] + 4, cx, cy, 0)], [K.throwAt - 0.05, C(1.7, hp(K.throwAt - 0.05)[0] + 14, hp(K.throwAt - 0.05)[1] + 10, cx, cy, 0.04)], [K.throwAt, C(1.7, hp(K.throwAt)[0] + 14, hp(K.throwAt)[1] + 10, cx, cy, 0.04)]], m); }
    case 'aplunge': { const q = t => Sa(t); return c10Kf([[K.throwAt, C(1.75, E.SF.x + 40, E.SF.y)], [K.throwAt + 0.5, C(1.3, q(K.throwAt + 0.5).x, q(K.throwAt + 0.5).y + 30, cx, cy, 0.06)], [K.lasso - 0.1, C(1.3, q(K.lasso - 0.1).x + 14, q(K.lasso - 0.1).y - 24, cx, cy, -0.03)]], m); }
    case 'arope': { const S = Sa(m), Mh = Ma(m), dx = Math.abs(Mh.x - S.x), dy = Math.abs(Mh.y - S.y), j = m > K.lasso + 0.9 ? Math.exp(-(m - K.lasso - 0.9) * 6) : 0, z = Math.max(0.6, Math.min(1.5, 0.84 * VH / (dy + 130), 0.86 * VW / (dx + 170))) * (1 + 0.14 * j); return C(z, (S.x + Mh.x) / 2, (S.y + Mh.y) / 2 - 6, cx, cy, 0.05 * Math.sin((m - K.lasso) * 2.2)); }
    case 'aspin': { const bt = (b, n) => c9B(b, n), CS = E.CS, hS = head(bt(12, 2)), cam = c10Kf([[K.spin, C(0.86, CS.x, CS.y - 30)], [bt(12, 2), C(0.9, CS.x, CS.y - 34, cx, cy, 0.08)], [bt(12, 3), C(2.7, hS[0] + 4, hS[1] + 4, cx, cy, -0.06)], [bt(13, 1), C(2.9, hS[0] + 4, hS[1] + 4, cx, cy, -0.06)], [bt(13, 2), C(0.88, CS.x, CS.y - 30, cx, cy, 0.18)], [K.regrow, C(0.86, CS.x, CS.y - 28, cx, cy, -0.14)]], m); cam.z *= 1 + 0.05 * Math.exp(-((m - K.spin) % (4 * C9.beat)) * 5); return cam; }
    case 'aregrow': { const g = t => { const Mq = Ma(t), st = c10An(Mq, 'stump'); return [(Mq.x + st[0]) / 2 - 6, (Mq.y + st[1]) / 2]; }, a = g(K.regrow + 0.05), b = g(K.whole - 0.4); return c10Kf([[K.regrow, C(1.65, a[0], a[1], cx + 8, cy, 0)], [K.whole - 0.4, C(2.05, b[0], b[1], cx + 12, cy, 0.03)], [K.whole, C(2.05, b[0], b[1], cx + 12, cy, 0.03)]], m); }
    case 'awhirl': { const bt = (b, n) => c9B(b, n), CS = E.CS, o = c10Orb(E.thf), cam = c10Kf([[K.whole, C(0.95, CS.x, CS.y - 30, cx, cy, 0.12)], [bt(16, 0), C(0.84, CS.x, CS.y - 22, cx, cy, -0.26)], [bt(16, 3), C(0.86, CS.x, CS.y - 25, cx, cy, 0.3)], [K.fling - 0.4, C(1.35, CS.x + o[0] * 0.5, CS.y + o[1] * 0.3 - 20, cx, cy, 0)], [K.fling, C(1.35, CS.x + o[0] * 0.5, CS.y + o[1] * 0.3 - 20, cx, cy, 0)]], m); cam.z *= 1 + 0.05 * Math.exp(-((m - K.spin) % (4 * C9.beat)) * 5); return cam; }
    case 'afling': { const q = t => Ma(t), R0 = q(K.fling), mk = (t, z, dy) => C(z, q(t).x, q(t).y + (dy || 0)); return c10Kf([[K.fling, C(1.4, R0.x, R0.y - 10)], [K.fling + 0.25, mk(K.fling + 0.25, 1.15, -30)], [K.fling + 0.6, mk(K.fling + 0.6, 1.0, -30)], [K.fling + 1.1, mk(K.fling + 1.1, 0.95, 10)], [K.rise, mk(K.rise, 0.95, 10)]], m); }
    default: { const q = t => Sa(t), fin = mid([E.ST.x, E.ST.y], [E.MT.x, E.MT.y], 0.5); return c10Kf([[K.rise, C(1.0, q(K.rise).x, q(K.rise).y - 40)], [K.rise + 1.6, C(1.0, q(K.rise + 1.6).x, q(K.rise + 1.6).y - 40)], [K.rise + 3.2, C(0.95, fin[0], fin[1] - 4, cx, cy, 0.02)], [C11K.air2, C(1.02, fin[0], fin[1] - 4, cx, cy, -0.02)]], m); }
  }
}

// ---- the stage as a whole at the song time m, seen by the camera cam (c8Bg leaves the camera on: the caller turns it off)
function c10Stage(m, cam) {
  const s = m + C9.m0, K = C10K, S = c10Suk(m), M = c10Mah(m), A = c10Arm(m), lit = c10Lit(m); c8Bg(cam, s);
  if (m < K.launch + 2.5) { const L = c4Lay(c4Geo()), cx = Math.round(VW / 2); c4Crater(cx + L.cr, 1.1); c4Pool(cx + L.yL - 30, 1.54); }      // (the crater and the pool at the street, as part 2 left them)
  c4Cam0(); c10Clouds(cam, m); c8On(cam, cam.fx, cam.fy); c14Rear(m, cam);      // (v1.141 the city of the air fight behind the pair; the camera c8Bg left on is turned off for the clouds, which have a camera of their own, and put on again for the actors)
  const behind = M.mode === 'spin' && M.depth < 0, ro = S && (S.mode === 'rope' || S.mode === 'spin');
  const cut = M.mode === 'regrow'; let ropeP = null; if (S && ro) { const hand = cut ? [M.x + 170, M.y - 34] : c10Hp(S, C10H[S.ei] || [14, -5.5]), wst = c10An(M, 'chest'); ropeP = [hand[0], hand[1], wst[0], wst[1]]; }
  const rope = () => { if (!ropeP) return; const tl = m - K.lasso, g = clamp01((tl + 0.1) / 0.4), tk = m < K.lasso + 0.9 ? 0.15 + 0.5 * clamp01((tl - 0.3) / 0.6) : 1, a = m >= K.fling ? 0 : 1; c10Rope(m, ropeP[0], ropeP[1], ropeP[2], ropeP[3], { g, k: Math.min(1, tk), a }); if (g >= 1) c10Coil(M, m, m >= K.fling ? 0 : 1); };
  if (behind) { rope(); c10DrawMah(M, s, m, lit); c10DrawSuk(S, s); } else { if (!cut) c10DrawSuk(S, s); c10DrawMah(M, s, m, lit); rope(); }
  c10DrawArm(A, lit); c10Fx(m, S, M, A, cam); if (m >= C11K.air2) { c11Fx(m); c14Front(m); }
  return { S, M, A };
}
function c10Shot(now, dt, T, st, t1) {
  const s = T - c8R(), m = s - C9.m0, K = C10K, cam = c10Cam(m, st.k), sh = c10Shake(m), j = n => sh < 0.3 ? 0 : (c6H(Math.floor(T * 36), n) - 0.5) * 2 * sh; c10Warm(m);
  if (st.k === 'd03') { c11Gif(m); c6Black((s - (C8T.end - 0.9)) / 0.9); return; }      // (v1.136: the GIF fills the screen)
  if (st.k === 'd05') { c11Blood(m); ctx.fillStyle = 'rgba(40,0,10,0.12)'; ctx.fillRect(0, 0, VW, VH); msFinish(1); c6Black((s - (C12K.s0 - 0.9)) / 0.9); return; }      // (Mahoraga comes apart into blood in the domain; the picture goes black before the look down of v1.137)
  ctx.save(); ctx.translate(Math.round(j(11)), Math.round(j(12))); const R = c10Stage(m, cam); c4Cam0(); ctx.restore();
  if (st.k === 'd04') { c11Domain(m, cam, R.S); ctx.save(); c8On(cam, cam.fx, cam.fy); c10DrawSuk(R.S, s); c4Cam0(); ctx.restore(); }      // (the domain's circle grows out of Sukuna; he is drawn over it)
  const E = c10Env(), sl = clamp01(1 - c10Slow(m)), vel = (t) => { const a = c10Cam(m + 0.06, st.k), b = c10Cam(m - 0.06, st.k); return [(a.fx - b.fx) / 0.12 * cam.z, (a.fy - b.fy) / 0.12 * cam.z]; };
  { const v = vel(), sp = Math.hypot(v[0], v[1]); if (sp > 160) c10Wind(m, -v[0], -v[1], clamp01((sp - 160) / 500), 41); }
  if (sl > 0.02 && m >= K.dash) { ctx.fillStyle = 'rgba(60,90,190,' + (0.13 * sl).toFixed(3) + ')'; ctx.fillRect(0, 0, VW, VH); }
  const cutP = c10Arm(K.cut), cpt = cutP ? cutP.cp : [E.AC.x, E.AC.y];
  c10Impact(m, K.cut, cam, cpt[0], cpt[1], 0.55); c10Impact(m, K.throwAt, cam, R.S ? R.S.x : E.SF.x, R.S ? R.S.y : E.SF.y, 0.4); c10Impact(m, K.fling, cam, E.CS.x, E.CS.y, 0.5);
  { const r = m - K.launch; if (r >= 0 && r < 0.07) c6White(0.8 * (1 - r / 0.07)); }
  if (m >= C11K.air2) c11Impacts(m, cam);
  c13Draw(m, cam, R.S);      // (v1.140 the ring of the quick time event, the counter, the verdict)
  { const k = c8NotchK(s); if (k > 0.02) c6White(0.26 * k * k); }
  ctx.fillStyle = 'rgba(30,10,60,0.12)'; ctx.fillRect(0, 0, VW, VH); msFinish(1);
  c6Black((s - (C8T.end - 0.9)) / 0.9);
  c13Top(m);      // (v1.141 the card, the counter and the verdict are over the cinema bars)
}

// ---- the sounds (each fires once; m = the song time)
function c10Events(T, ev) {
  const K = C10K, R = c9Start(), at = (k, t, f, win) => ev(k, R + t, f, win || 0.5);
  at('c10catch', K.catch, () => { snd('c7cloth', 0); snd('dash', 1); }); at('c10look', K.look, () => snd('c7drone'), 1.0); at('c10eyes', K.look + 0.25, () => snd('c7eyes'), 1.0);
  at('c10dip', K.crouch, () => snd('c7cloth', 1)); at('c10dip2', K.crouch + 0.7, () => snd('c7thud', 0));
  at('c10launch', K.launch - 0.02, () => { snd('c4crater'); snd('c7smash'); }, 0.6); at('c10rise', K.launch + 0.05, () => snd('c7rise'), 1.2); at('c10wh0', K.launch + 0.1, () => snd('c7whoosh'));
  at('c10arrive', K.arrive, () => { snd('c7wheel', 1); snd('c7cloth', 0); }, 0.8); at('c10beck', K.beckon, () => snd('c7cloth', 1)); at('c10wind', K.wind, () => snd('c7cloth', 0));
  at('c10dash', K.dash - 0.02, () => { snd('c7whoosh'); snd('slowin'); snd('dash', 0); C10W.sl = true; }, 0.6);
  for (let i = 0; i < 4; i++) at('c10hb' + i, K.dash + 0.9 + 0.82 * i, () => snd('c7beat', i < 2 ? 0 : 1), 0.4);
  at('c10cut', K.cut - 0.02, () => { snd('slowout'); C10W.sl = false; snd('c6scrape'); snd('smack', 3); snd('c7tear'); }, 0.5); at('c10cut2', K.cut + 0.06, () => { snd('c4guts'); snd('c8crack'); }, 0.6);
  at('c10notch', K.cut + 0.45, () => { snd('c7wheel', 1); snd('rct', 0); }, 0.8);
  at('c10kick', K.kick - 0.03, () => { snd('dash', 0); snd('smack', 1); }, 0.5); at('c10kick2', K.kick + 0.05, () => snd('c7whoosh'), 0.5);
  at('c10grab0', K.gslot - 0.02, () => snd('c7whoosh'), 0.5); at('c10grab', K.gslot + 0.3, () => { snd('c7thud', 1); snd('c8crack'); }, 0.6); at('c10cr1', K.gslot + 1.0, () => snd('c8crack'), 0.5); at('c10cr2', K.gslot + 1.5, () => snd('c8crack'), 0.5);
  at('c10th0', K.throwAt - 0.3, () => snd('c7whoosh'), 0.5); at('c10th', K.throwAt - 0.02, () => { snd('c7smash'); snd('c7thud', 0); }, 0.6); at('c10pl1', K.throwAt + 0.25, () => snd('c7whoosh'), 0.6); at('c10pl2', K.throwAt + 1.0, () => snd('c7rise'), 1.2);
  at('c10l0', K.lasso - 0.1, () => snd('c6scrape'), 0.5); at('c10l1', K.lasso + 0.12, () => snd('c6scrape'), 0.5); at('c10l2', K.lasso + 0.35, () => snd('c6scrape'), 0.5); at('c10l3', K.lasso + 0.5, () => snd('c7wheel', 0), 0.8); at('c10jerk', K.lasso + 0.88, () => { snd('smack', 3); snd('c7smash'); }, 0.6);
  { if (!C10W.orbT) { C10W.orbT = []; for (let t = K.spin, n = 0; t < K.fling; n++) { const th = c10Th(t); let dt = 0.05; while (c10Th(t + dt) - th < Math.PI * (n < 12 ? 1 : 2) && t + dt < K.fling + 1) dt += 0.02; t += dt; if (t >= K.fling) break; C10W.orbT.push(t - 0.02); } } C10W.orbT.forEach((t, n) => at('c10o' + n, t, () => snd('c7whoosh'), 0.3)); }      // (a whoosh each time he passes: every half turn at first, every turn when it is fast)
  at('c10rg0', K.regrow, () => snd('rct', 0), 0.8); at('c10rg1', K.whole, () => snd('rct', 1), 0.8);
  at('c10fl0', K.fling - 0.02, () => { snd('c7smash'); snd('c8crack'); }, 0.6); at('c10fl1', K.fling + 0.1, () => snd('c7rise'), 1.2); at('c10up', K.fling + 0.6, () => snd('c7whoosh'), 0.6); at('c10top', K.fling + 2.4, () => snd('c7wheel', 1), 0.8); at('c10end', K.rise + 3.2, () => snd('c7eyes'), 1.0); c11Events(T, ev); c14Events(T, ev); c12Events(T, ev);
}
const C10_SHOTS = ['sky', 'aface', 'alook', 'aleap', 'aduel', 'aslow', 'acut', 'agrab', 'aplunge', 'arope', 'aspin', 'aregrow', 'awhirl', 'afling', 'arise'];
for (const k of C10_SHOTS) c7Shots[k] = c10Shot;      // (the shots after the uppercut are drawn by this file: 'sky' too, which c8Shot drew until v1.134)
C8N.push(C9.m0 + C10K.cut + 0.45, C9.m0 + C10K.regrow);      // (the wheel turns a notch when the cut has been made, and again as the arm grows back: it learns the cut)
