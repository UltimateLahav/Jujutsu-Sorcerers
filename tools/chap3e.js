// ================================================================ v1.137 CHAPTER 3, PART 5: THE SNOWMAN (the end of the domain, to the second song)
// After the blood (v1.136's last shot) the camera looks down, in the silence, and finds Mahoraga on one knee in the pool; the second song (c12Music in tools/chap3b.js: 'Snowman', 105 bpm, from 1:20.7 of it) hits as he is found.
// He stands up in the rain of slashes of Sukuna's domain and is cut to ribbons; the wheel turns (adapts, the wounds close) but it is too much; he walks forward through the rain until the hit at 2:03 of the song, lifts his hands to
// shield himself, and his body evaporates and grows back, again and again, with every heavy hit of the song; then the song thins, Sukuna lights the fire in his hands (FUGA, the flames and the arrow of tools/sukuna.js), Mahoraga crouches and
// leaps to punch, and the arrow hits him in the face: the head is gone, the body falls and burns away, the wheel breaks, the domain fades, and the song ends.
// Like the other parts everything here is a function of the scene time: n = seconds since the second song began (T - c12Start()); the song has a heavy hit every 1.714 s (c12P(k) in tools/chap3.js), all the big moments are on them.
// World = the screen of the first shot of the domain (x to the right, y down); Sukuna stands at x = 0 on the floor, Mahoraga kneels 400 px to his right and walks left.

const C12 = {
  sc: 0.8, X0: 400, SX: 0, X1: 112, hit: 0.25,      // his size (the same as in the blood shot), where he kneels, where Sukuna stands, where he stands when he lifts his hands, the big hit of the song that finds him
  walk0: c12P(11), walk1: c12P(24), lull: c12P(34), look: c12P(35), crouch: c12P(36), leap: c12P(37), draw: c12P(38), hold: c12P(39), fire: c12P(40), arrow: 0.14, land: c12P(41), brk: c12P(42), last: c12P(43), chord: 75.7, burnEnd: 76.4, black: 78.6
};
C12.hit2 = C12.fire + C12.arrow;      // the arrow reaches his face
const C12N = [c12P(3), c12P(6), c12P(8), c12P(10), c12P(34)];      // the wheel turns a notch here (it adapts)
C8N.push(...C12N.map(t => C12K.t0 + t));
const c12Fl = () => gy + 2;      // the floor line
const c12Lp = (nm, n, fps, len) => c10mf(nm, ((Math.floor(n * fps) % len) + len) % len);      // a picture of a looping clip

// ---- where he is: the distance walked (a slow start, steady, a slow stop), his x, his height over the floor
function c12D(n) {
  const T = C12.walk1 - C12.walk0, t = Math.max(0, Math.min(T, n - C12.walk0)), V = (C12.X0 - C12.X1) / (T - 1.25), up = 1.5, dn = 1.0;
  if (t < up) return V * t * t / (2 * up); if (t < T - dn) return V * (up / 2 + (t - up));
  const u = t - (T - dn); return V * (up / 2 + (T - dn - up) + u - u * u / (2 * dn));
}
function c12X(n) {
  const K = C12; if (n < K.walk0) return K.X0; if (n < K.walk1) return K.X0 - c12D(n);
  let x = K.X1 - 0.35 * (Math.min(n, K.lull) - K.walk1);      // (he inches forward behind his guard)
  for (let k = 24; k <= 33; k++) { const a = n - c12P(k); if (a >= 0) x += 3 * Math.exp(-a / 0.4); }      // (every heavy hit shoves him back a little)
  if (n >= K.leap) x -= 58 * (1 - Math.pow(1 - clamp01((n - K.leap) / (K.hit2 - K.leap)), 2));
  return x;
}
const c12H = n => n < C12.leap ? 0 : 74 * (1 - Math.pow(1 - clamp01((n - C12.leap) / (C12.hit2 - C12.leap)), 2.4));      // the leap: fast off the floor and slower and slower as the arrow is drawn

// ---- Mahoraga at the clip time n: { i: picture, x, y: his pelvis, rot, back: { i, a } }
function c12M(n) {
  const K = C12, sc = K.sc, FL = c12Fl(), pel = i => M7.frames[i].pelvis[1], on = (i, h) => FL - (136 - pel(i)) * sc - (h || 0), o = { x: c12X(n), rot: 0, back: null }, P0 = c12P(0), P2 = c12P(2);
  const flinch = (k0, k1) => { let f = 0; for (let k = k0; k <= k1; k++) { const a = n - c12P(k); if (a >= 0) f += Math.exp(-a / 0.16); } return f; };
  let i, h = 0;
  if (n < P0) i = c12Lp('kneel', n, 5, 12);
  else if (n < P2) { const u = clamp01((n - P0) / (P2 - P0)); i = c10mf('rise', Math.min(9, Math.floor(ease3(u) * 10))); }
  else if (n < K.walk0) { i = c12Lp('sway', n, 7, 12); o.x += 3.5 * flinch(2, 11); o.rot = 0.05 * flinch(2, 11); }
  else if (n < K.walk1) i = c10mf('trudge', ((Math.floor(32 * c12D(n) / (51.72 * sc)) % 32) + 32) % 32);
  else if (n < K.walk1 + 0.5) { const u = (n - K.walk1) / 0.5; i = c10mf('gup', Math.min(5, Math.floor(u * 6))); o.back = { i: c10mf('trudge', ((Math.floor(32 * c12D(K.walk1) / (51.72 * sc)) % 32) + 32) % 32), a: 1 - clamp01((n - K.walk1) / 0.18) }; }
  else if (n < K.lull) i = c12Lp('guard', n, 8, 12);
  else if (n < K.lull + 0.5) i = c10mf('gup', 5 - Math.min(5, Math.floor((n - K.lull) / 0.5 * 6)));
  else if (n < K.look) i = c12Lp('sway', n, 6, 12);
  else if (n < K.crouch) i = c10mf('crouch', n > K.look + 0.4 ? 1 : 0);
  else if (n < K.leap) i = c10mf('crouch', 1 + Math.floor(clamp01((n - K.crouch) / (K.leap - K.crouch)) * 6.99));
  else if (n < K.leap + 0.4) { i = c10mf('leap', Math.min(7, Math.floor((n - K.leap) * 20))); h = c12H(n) + 4; }
  else if (n < K.hit2) { i = c10mf('apunch', Math.min(5, Math.floor(clamp01((n - K.leap - 0.4) / 1.8) * 5.99))); h = c12H(n) + 4; }
  else {      // the arrow has hit his face: he hangs for a moment, then falls backward and lies there (he burns, c12Fx)
    i = c10mf('hurt', 1); const t = n - K.hit2, f = clamp01((t - 0.35) / (K.land - K.hit2 - 0.35)), x0 = c12X(K.hit2), y0 = on(i, 78);
    o.x = x0 + 10 * (1 - Math.exp(-t * 1.6)) + 18 * f * f; o.y = y0 + (FL - 7 - y0) * f * f; o.rot = 1.45 * ease3(f); o.i = i; return o;
  }
  o.i = i; o.y = on(i, h); return o;
}
const c12Wq = M => ({ i: M.i, x: M.x, y: M.y, rot: M.rot, sx: C12.sc, sy: C12.sc });      // (the shape c10An wants)

// ---- Sukuna: he stands, breathing; the FUGA cast (the flames light, the clap, the bow pose, the full draw, the release, back to his guard) runs on its own time (c12CastT: the pictures of the cast of tools/sukuna.js stretched over the lull and the leap)
const C12F = [[C12.lull, 0], [C12.look, 560], [C12.crouch, 820], [C12.leap, 1180], [C12.draw, 1900], [C12.hold, 2050], [C12.fire, 2650], [C12.fire + 0.36, 2800], [C12.fire + 1.2, 3049]];
function c12CastT(n) { if (n < C12F[0][0]) return -1; for (let j = 1; j < C12F.length; j++) if (n < C12F[j][0]) { const a = C12F[j - 1], b = C12F[j]; return a[1] + (b[1] - a[1]) * (n - a[0]) / (b[0] - a[0]); } return -1; }
function c12S(n) {
  const D = CU_GAME[3], t = c12CastT(n), lean = n < C12.fire ? 0.45 * ease3(clamp01((n - C12.crouch) / (C12.draw - C12.crouch))) : 0.45 * (1 - ease3(clamp01((n - C12.fire) / 1.2)));      // (he leans back to shoot up at him)
  if (t >= 0) { const cast = { t, pic: suPicAt(SU_FL.T, t), fuga: true }; return { pic: D.atk[22][cast.pic], cast, x: C12.SX, y: c12Fl(), rot: lean }; }
  return { pic: D.frames[Math.floor(n * 6 + 100) % D.frames.length], cast: null, x: C12.SX, y: c12Fl(), rot: 0 };
}
function c12Hand(S, h) { const a = -S.rot, c = Math.cos(a), s = Math.sin(a), x = h[0] - 32, y = h[1] - 61; return [S.x + x * c - y * s, S.y + x * s + y * c]; }      // (a point of his picture, in the world, when he leans)

// ---- the wounds: every heavy hit of the song is a volley of cuts (C12E: when, where on him, which slash); the scars are fixed to his body (to an anchor of the picture), fade when the wheel turns (the wounds close) and bleed
const C12A = ['chest', 'shoulder', 'head', 'pelvis', 'elbow', 'fist', 'chest', 'shoulder', 'footN', 'wrist', 'chest', 'elbow'];
function c12E() {
  if (C12.ev) return C12.ev; const E = [], add = (t, big) => { const sd = E.length * 7 + 3; E.push({ t, a: C12A[Math.floor(c4R(sd, 1) * C12A.length)], dx: (c4R(sd, 2) - 0.5) * 14, dy: (c4R(sd, 3) - 0.5) * 16, ai: Math.floor(c4R(sd, 4) * 6), fx: c4R(sd, 5) < 0.5, fy: c4R(sd, 6) < 0.5, big, idx: E.length }); };
  for (let j = 0; j < 6; j++) add(C12.hit + 0.04 * j, true);
  for (let k = 0; k <= 33; k++) { const t = c12P(k), m = k >= 24 ? 5 : 3; for (let j = 0; j < m; j++) add(t + (k >= 24 ? 0.05 : 0.06) * j, j === 0); add(t + 0.5714, false); add(t + 1.1429, false); }
  E.sort((a, b) => a.t - b.t); E.forEach((e, q) => { e.idx = q; }); return C12.ev = E;
}
function c12Heal(e, n) { let a = 1; for (const t of C12N) if (t > e.t && n >= t) a *= 1 - 0.75 * ease3((n - t) / 1.2); return a; }      // (the wounds from before a turn of the wheel close: they fade to a quarter)
const C12SC = { c1: null, c2: null, th: null, out: null };
function c12Sc() {      // the scratch canvases (one picture each) and the fixed erosion map: how soon each pixel of a picture goes (a hash and a slow blob pattern)
  if (C12SC.c1) return C12SC; const mk = () => { const c = document.createElement('canvas'); c.width = 168; c.height = 140; return c; };
  C12SC.c1 = mk(); C12SC.c2 = mk(); C12SC.g1 = C12SC.c1.getContext('2d', { willReadFrequently: true }); C12SC.g2 = C12SC.c2.getContext('2d'); C12SC.th = new Float32Array(168 * 140); C12SC.hb = new Float32Array(168 * 140);
  for (let y = 0; y < 140; y++) for (let x = 0; x < 168; x++) { const r = c4R(y * 168 + x, 17), bl = 0.5 + 0.5 * Math.sin(x * 0.19 + 1.3 * Math.sin(y * 0.11)) * Math.cos(y * 0.16 - x * 0.07); C12SC.th[y * 168 + x] = 0.18 + 0.82 * (0.55 * r + 0.45 * bl); C12SC.hb[y * 168 + x] = clamp01((y - 20) / 116) * 0.72 + 0.28 * c4R(y * 168 + x, 19); }
  C12SC.out = C12SC.g2.createImageData(168, 140); return C12SC;
}
function c12Vap(n) {      // how much of his body is steam at the clip time n (0 - 0.85): the volleys of the guard blow him apart, he grows back before the next
  let v = 0; if (n < C12.walk1 || n > C12.lull + 0.2) return 0;
  for (let k = 24; k <= 33; k++) { const a = n - c12P(k) - 0.05; if (a >= 0) v = Math.max(v, 0.82 * Math.exp(-a / 0.62)); const b = n - c12P(k) - 0.62, c = n - c12P(k) - 1.19; if (b >= 0) v = Math.max(v, 0.4 * Math.exp(-b / 0.35)); if (c >= 0) v = Math.max(v, 0.4 * Math.exp(-c / 0.35)); }
  return v;
}
const c12Burn = n => n < C12.hit2 ? 0 : Math.min(1.6, (n - C12.hit2 - 0.15) / (C12.burnEnd - C12.hit2) * 1.6);
function c12Body(M, n, lit) {      // his picture with the scars on it, eroded to steam (the guard) or burnt (the end): a canvas of one picture
  const base = m7Lit(M.i, lit); if (!base) return null; const P = M7.frames[M.i], E = c12E(), S = c12Sc(), v = c12Vap(n), b = c12Burn(n), g = S.g1, scars = n >= C12.hit;
  if (!scars && v < 0.01 && b <= 0) return base;
  g.globalCompositeOperation = 'source-over'; g.clearRect(0, 0, 168, 140); g.drawImage(base, 0, 0);
  if (scars) {
    g.globalCompositeOperation = 'source-atop'; let lo = 0, hi = E.length; while (lo < hi) { const mid = (lo + hi) >> 1; if (E[mid].t <= n) lo = mid + 1; else hi = mid; } const first = Math.max(0, lo - 60);
    for (let q = first; q < lo; q++) {
      const e = E[q], age = n - e.t, al = c12Heal(e, n), an = P[e.a]; if (!an || al < 0.05) continue; const ang = SU_SL_ANG[e.ai] * Math.PI / 180, ca = Math.cos(ang) * (e.fx ? -1 : 1), sa = Math.sin(ang) * (e.fy ? -1 : 1), x0 = an[0] + e.dx, y0 = an[1] + e.dy, len = e.big ? 14 : 8;
      g.globalAlpha = al; for (let t = -len / 2; t <= len / 2; t++) { const px = Math.round(x0 + ca * t), py = Math.round(y0 + sa * t); g.fillStyle = '#3a0710'; g.fillRect(px, py + 1, 1, 1); g.fillStyle = age < 0.12 ? '#ffffff' : age < 0.7 ? '#ff4a5a' : '#b3121f'; g.fillRect(px, py, 1, 1); }
      if (age > 0.3) { const dl = Math.min(22, (age - 0.3) * 5); g.fillStyle = '#7a0c18'; g.fillRect(Math.round(x0), Math.round(y0) + 1, 1, Math.round(dl)); }      // (the blood runs down)
    }
    g.globalAlpha = 1; g.globalCompositeOperation = 'source-over';
  }
  if (v < 0.01 && b <= 0) return S.c1;
  const d = g.getImageData(0, 0, 168, 140).data, O = S.out.data, up = c12Vap(n - 0.04) > v; O.fill(0); const th = S.th, hb = S.hb, hd = n >= C12.hit2 ? P.head : null;
  for (let y = 0; y < 140; y++) for (let x = 0; x < 168; x++) {
    const ix = y * 168 + x, a = ix * 4; if (d[a + 3] < 128) continue; let R = d[a], G = d[a + 1], B = d[a + 2];
    if (hd) { const dx = x - hd[0], dy = y - hd[1]; if (dx * dx + dy * dy < 16 * 16 * (1 + 0.4 * c4R(ix, 3))) continue; }      // (the head is gone)
    if (v > 0) {
      const dd = v - th[ix];
      if (dd > 0) { const q = Math.min(1, dd / 0.45), ny = y - Math.round(q * 16), nx = x + Math.round(Math.sin(y * 0.3 + x * 0.17) * q * 5); if (ny >= 0 && nx >= 0 && nx < 168 && q < 0.95 && ((x + y) & 1) === 0) { const k = (ny * 168 + nx) * 4; if (O[k + 3] === 0) { O[k] = 225; O[k + 1] = 238; O[k + 2] = 255; O[k + 3] = Math.round(200 * (1 - q)); } } continue; }
      if (dd > -0.07) { R = up ? 255 : 230; G = up ? 226 : 244; B = up ? 140 : 255; }
    }
    if (b > 0) {
      const dd = b - hb[ix];
      if (dd >= 0) {
        if (dd < 0.1) { R = 255; G = 232; B = 140; } else if (dd < 0.22) { R = 255; G = 130; B = 30; } else if (dd < 0.4) { R = 38; G = 12; B = 14; } else if (dd < 0.62 && c4R(ix, 5) < 0.3) { R = 255; G = 110; B = 24; } else continue;
      }
    }
    O[a] = R; O[a + 1] = G; O[a + 2] = B; O[a + 3] = 255;
  }
  S.g2.putImageData(S.out, 0, 0); return S.c2;
}
function c12Lit(n, s) { const k = c8NotchK(s); for (let q = 24; q <= 33; q++) { const a = n - c12P(q); if (a >= 0 && a < 0.05) return 'white'; if (a >= 0.12 && a < 0.9) return 'gold'; } if (n >= C12.hit && n < C12.hit + 0.05) return 'white'; if (k > 0.35) return 'gold'; return 'cold'; }
function c12DrawM(M, n, s) {      // the wheel behind his head, his picture (wounds, steam, fire), his eyes
  if (!M) return; const P = M7.frames[M.i], sc = C12.sc, Q = c12Wq(M), wc = c10An(Q, [P.head[0] + 4, P.head[1] - 6]), k = c8NotchK(s), dead = n >= C12.hit2, alive = n < C12.brk;
  if (alive && n >= C12.hit - 0.5) { const wa = clamp01((n - C12.hit + 0.5) / 0.5); c6Glow(wc[0], wc[1], 78 * sc, '255,200,100', (0.4 + 0.3 * k) * (dead ? 0.6 : 1) * wa); m7Wheel(wc[0], wc[1], 27 * sc, c8Ang(s), (dead ? 0.55 + 0.25 * Math.sin(n * 40) : 1) * wa); }
  const one = (i, a) => { const cv2 = c12Body({ ...M, i }, n, c12Lit(n, s)); if (!cv2) return; const Z = M7.frames[i]; ctx.save(); if (a < 1) ctx.globalAlpha *= a; ctx.translate(M.x, M.y); if (M.rot) ctx.rotate(M.rot); ctx.scale(sc, sc); ctx.translate(-Z.pelvis[0], -Z.pelvis[1]); ctx.drawImage(cv2, 0, 0); ctx.restore(); };
  if (M.back && M.back.a > 0.02) one(M.back.i, M.back.a); one(M.i, 1);
  if (!dead && n >= C12.hit - 0.1) for (const key of ['eye1', 'eye2']) { const e = c10An(Q, key), ea = 0.5 * (1 - c12Vap(n)); c6Glow(e[0] - 1, e[1], 7 * sc + 6 * k, '255,190,70', ea * (1 + k)); ctx.fillStyle = '#ffd36a'; ctx.globalAlpha = ea; ctx.fillRect(Math.round(e[0] - 2), Math.round(e[1]), 3, 1); ctx.globalAlpha = 1; }
}
function c12Wheel(n, M, s) {      // the wheel breaks: cracks run through it, then it bursts into gold shards that fly out and fade
  const r = n - C12.brk; if (r < 0 || r > 1.4) return; const P = M7.frames[M.i], wc = c10An(c12Wq(M), [P.head[0] + 4, P.head[1] - 6]), sc = C12.sc;
  if (r < 0.22) { ctx.save(); ctx.globalAlpha = 1 - r / 0.22; for (let q = 0; q < 6; q++) { const an = q * 1.047 + 0.3; c6Line(Math.round(wc[0] + Math.cos(an) * 6), Math.round(wc[1] + Math.sin(an) * 6), Math.round(wc[0] + Math.cos(an) * 30 * sc), Math.round(wc[1] + Math.sin(an) * 30 * sc), '#ffffff'); } ctx.restore(); }
  ctx.save(); ctx.globalCompositeOperation = 'lighter'; for (let q = 0; q < 16; q++) { const an = q / 16 * 6.2832 + c4R(q, 31), sp = 40 + 60 * c4R(q, 32), a = Math.max(0, r - 0.1), x = wc[0] + Math.cos(an) * sp * a * (1 - 0.3 * a), y = wc[1] + Math.sin(an) * sp * a + 90 * a * a * 0.4; ctx.globalAlpha = Math.min(1, 2 * (1 - r / 1.4)); ctx.fillStyle = q & 1 ? '#ffd86a' : '#fff4c0'; ctx.fillRect(Math.round(x), Math.round(y), 2 + (q & 1), 1 + (q % 3 === 0 ? 1 : 0)); }
  ctx.restore(); c6Glow(wc[0], wc[1], 40 * sc, '255,200,100', 0.5 * Math.max(0, 1 - r / 0.5));
}

// ---- the domain around them: the sky (the domain's own picture), the floor that scrolls past, the shrine far behind Sukuna, blood on the ground
function c12Deco() {
  const key = VW + 'x' + VH + 'x' + gy; if (C12.deco && C12.deco.key === key) return C12.deco;
  const skull = (s, horn) => { const c = document.createElement('canvas'), B = ['.#####.', '#######', '##.#.##', '#######', '.#.#.#.', '..###..']; c.width = 11 * s; c.height = 6 * s; const g = c.getContext('2d'); for (let r = 0; r < 6; r++) for (let q = 0; q < 7; q++) if (B[r][q] !== '.') { g.fillStyle = (r === 2 && (q === 2 || q === 4)) ? '#1a0a0a' : r >= 4 ? '#b4a482' : (q + r) % 3 === 0 ? '#c9bb9a' : '#e6dac0'; g.fillRect((q + 2) * s, r * s, s, s); } if (horn) { g.fillStyle = '#8a6a3a'; for (const [qx, qy] of [[1, 1], [0, 0], [9, 1], [10, 0]]) g.fillRect(qx * s, qy * s, s, s); } return c; };
  const sp = [1, 2, 3].map(s => [skull(s, false), skull(s, true)]), items = [];
  for (let i = 0; i < 170; i++) items.push({ x: -700 + 1900 * c4R(i, 41), t: 0.05 + 1.1 * Math.pow(c4R(i, 42), 1.3), k: c4R(i, 43) < 0.7 ? 0 : 1, h: c4R(i, 44) < 0.35 ? 1 : 0, f: c4R(i, 45) });
  items.sort((a, b) => a.t - b.t); return C12.deco = { key, sp, items };
}
function c12Backdrop(n, cam) {
  const bg = c11DomBg(), FL = c12Fl(), z = cam.z, tx = VW / 2, ty = VH / 2, Y = y => ty + (y - cam.fy) * z, hz = gy - 12, hyS = Y(hz), yFL = Y(FL), Fh = (yFL - hyS) / 0.269, D = c12Deco();
  ctx.fillStyle = '#05010a'; ctx.fillRect(0, 0, VW, VH); ctx.imageSmoothingEnabled = false;
  ctx.drawImage(bg, Math.round(tx - (cam.fx - VW / 2) * 0.04 * z - (VW / 2 + 8) * z), Math.round(hyS - (hz + 8) * z), Math.round(bg.width * z), Math.round(bg.height * z));      // (the sky and the horizon: the sky hardly moves)
  if (hyS < VH) {
    const top = Math.max(0, Math.round(hyS)), hh = Math.max(1, Math.round(z)); ctx.fillStyle = '#c8262c'; ctx.fillRect(0, top, VW, hh); const cols = ['#2a0610', '#220510', '#1c040e', '#16030c', '#10020a', '#0b0207'];
    for (let b = 0; b < 6; b++) { const y0 = Math.round(hyS + hh + Fh * 0.95 * b / 6), y1 = b === 5 ? VH : Math.round(hyS + hh + Fh * 0.95 * (b + 1) / 6); if (y1 > 0 && y0 < VH) { ctx.fillStyle = cols[b]; ctx.fillRect(0, Math.max(0, y0), VW, y1 - Math.max(0, y0) + 1); } }
    ctx.fillStyle = 'rgba(58,11,26,0.9)'; for (let q = -8; q <= 14; q++) { const xw = q * 70; for (let y = Math.max(0, Math.floor(hyS) + 3); y < VH; y += 2) { const t = Math.pow((y - hyS) / Fh, 0.625), sx = Math.round(tx + (xw - cam.fx) * z * t / 0.44); if (sx >= 0 && sx < VW && ((y >> 1) + q & 1) === 0) ctx.fillRect(sx, y, 1, 1); } }      // (lines that run away to the horizon: near ones move faster)
    ctx.fillStyle = 'rgba(70,12,28,0.55)'; for (let k = 1; k < 8; k++) { const y = Math.round(hyS + Fh * Math.pow(k / 7, 1.6)); if (y >= 0 && y < VH) ctx.fillRect(0, y, VW, 1); }
    for (const it of D.items) {
      const y = hyS + Fh * Math.pow(it.t, 1.6), sx = tx + (it.x - cam.fx) * z * it.t / 0.44, cl = it.t < 0.4 ? 0 : it.t < 0.8 ? 1 : 2, im = D.sp[cl][it.h];
      if (it.k === 0) { const w = Math.round(im.width * z), h = Math.round(im.height * z); if (sx > -w && sx < VW + w && y > -h && y < VH + h) ctx.drawImage(im, Math.round(sx - w / 2), Math.round(y - h), w, h); }
      else { const l = Math.round((3 + 4 * it.f) * (cl + 1) * z), x0 = Math.round(sx); if (x0 > -l && x0 < VW + l && y > 0 && y < VH) { ctx.fillStyle = '#e6dac0'; ctx.fillRect(x0, Math.round(y), l, Math.max(1, Math.round(z))); ctx.fillStyle = '#bfae8c'; ctx.fillRect(x0 + 1, Math.round(y) + Math.max(1, Math.round(z)), l - 1, Math.max(1, Math.round(z))); } }      // (a bone)
    }
  }
}
function c12Shrine(cam, n) {      // the shrine, far behind Sukuna: it slides in from the left as Mahoraga walks (half as fast as the floor), and sinks at the end
  if (!suShrSheet) return; const FL = c12Fl(), xs = VW / 2 + (-70 - cam.fx) * 0.5 * cam.z, ys = VH / 2 + (FL + 23 - cam.fy) * cam.z, sink = ease3(clamp01((n - C12.chord) / 2.4)), r = sink > 0 ? 1.7 * (1 - sink) : 10;
  if (xs < -140 * cam.z || xs > VW + 140 * cam.z || r < 0.02) return; ctx.save(); ctx.translate(Math.round(xs), Math.round(ys)); ctx.scale(cam.z, cam.z); ctx.translate(-VW / 2, -(VH - SU_DOM.foot)); c11Shrine(r); ctx.restore();
}
function c12Pools(n, M) {      // blood on the floor: the pool he knelt in, and a pool every 36 px of the way he walked
  const k = clamp01((n + 2) / 3) * 1.25; c4Pool(Math.round(C12.X0 + 4), k);
  for (let j = 1; j < 12; j++) { const xp = C12.X0 - 36 * j; if (xp > M.x + 10 && n > C12.walk0) c4Pool(Math.round(xp), 0.3 + 0.12 * (j % 3)); }
  if (n > C12.hit2) c4Pool(Math.round(M.x), clamp01((n - C12.land) / 4) * 1.1);
}

// ---- the rain of slashes: slashes in the air all over the screen (screen space), the heavier the later; the cuts that land on him (world space, c12Cuts)
function c12Dens(n) {
  if (n < C12.hit || n > C12.fire + 0.2) return 0; let d;
  if (n < c12P(0)) d = 3; else if (n < C12.walk0) d = 6 + 16 * clamp01((n - c12P(0)) / (C12.walk0 - c12P(0))); else if (n < C12.walk1) d = 22 + 12 * clamp01((n - C12.walk0) / (C12.walk1 - C12.walk0));
  else if (n < C12.lull) d = 38 + 10 * clamp01((n - C12.walk1) / (C12.lull - C12.walk1)); else d = 48 + (2 - 48) * ease3((n - C12.lull) / 1.2);
  d += 110 * Math.exp(-Math.pow((n - C12.hit - 0.05) / 0.08, 2)); for (let k = 0; k <= 33; k++) d += 60 * Math.exp(-Math.pow((n - c12P(k) - 0.06) / 0.07, 2));
  return d * 0.75;
}
function c12Sl(sp, x, y, fx, fy, age) {      // one slash (the pictures of Sukuna's domain, suSlBuild): sweeps in (55 ms), white and red until 110 ms, a thin scratch that fades by 1 s
  const w = sp.w, h = sp.h; ctx.save(); ctx.translate(Math.round(x - w / 2) + (fx ? w : 0), Math.round(y - h / 2) + (fy ? h : 0)); ctx.scale(fx ? -1 : 1, fy ? -1 : 1);
  if (age < 230) { const sw = age < 55 ? Math.max(1, Math.ceil(w * age / 55)) : w; ctx.globalAlpha = age < 110 ? 1 : 1 - (age - 110) / 120; ctx.drawImage(sp.hot, 0, 0, sw, h, 0, 0, sw, h); }
  if (age >= 60) { ctx.globalAlpha = 0.95 * Math.min(1, (age - 60) / 80) * (1 - Math.max(0, age - 230) / 770); ctx.drawImage(sp.cool, 0, 0); }
  ctx.restore();
}
function c12Rain(n) {
  if (n < C12.hit || n > C12.fire + 1.5) return; if (!suSlSpr) suSlBuild(); const dt = 1 / 30, k1 = Math.floor(n / dt), W = [3, 3, 2, 1, 0.35], tw = W.reduce((a, b) => a + b, 0);
  for (let k = k1 - 31; k <= k1; k++) {
    const tk = k * dt, c = Math.floor(c12Dens(tk) * dt + c4R(k, 91)), age = (n - tk) * 1000; if (age > 1000 || age < 0) continue;
    for (let q = 0; q < c; q++) { const sd = k * 16 + q; let r = c4R(sd, 1) * tw, li = 0; while (li < 4 && r >= W[li]) { r -= W[li]; li++; } const sp = suSlSpr[li][Math.floor(c4R(sd, 2) * 6)]; c12Sl(sp, c4R(sd, 3) * (VW + 40) - 20, 6 + c4R(sd, 4) * (VH - 12), c4R(sd, 5) < 0.5, c4R(sd, 6) < 0.5, age); }
  }
  ctx.globalAlpha = 1;
}
function c12Cuts(n, M, s) {      // the cuts that land on him: a long slash through the spot, sparks (white and gold when he guards, blood when he does not)
  if (!suSlSpr) suSlBuild(); const E = c12E(), P = M7.frames[M.i], Q = c12Wq(M), guard = n >= C12.walk1 + 0.3;
  let lo = 0, hi = E.length; while (lo < hi) { const mid = (lo + hi) >> 1; if (E[mid].t <= n - 0.7) lo = mid + 1; else hi = mid; }
  for (let q = lo; q < E.length && E[q].t <= n; q++) {
    const e = E[q], age = n - e.t, an = P[e.a]; if (!an) continue; const p = c10An(Q, [an[0] + e.dx, an[1] + e.dy]), sp = suSlSpr[e.big ? 2 : 1][e.ai];
    if (age < 0.25) c12Sl(sp, p[0], p[1], e.fx, e.fy, age * 1000);
    if (guard) c4Spray(n, e.t, p[0], p[1], 5, { v: 80, up: 1, dir: 0, life: 0.5, cols: ['#ffffff', '#ffe08a', '#ffb0b0'], sz: 1, seed: e.idx, g: 120, gnd: c12Fl() + 4 }); else c4Spray(n, e.t, p[0], p[1], e.big ? 7 : 3, { v: 85, up: 1, dir: 0, life: 0.7, cols: C4_BLOOD, sz: 1, seed: e.idx, g: 190, gnd: c12Fl() + 4 });
  }
}

// ---- Sukuna draws the arrow and lets it go: the flames of the cast (suFlCast), the arrow flying at his face, the fireball
function c12DrawS(n, S) {
  if (S.cast && !suFlSpr) suFlBuild(); ctx.save(); ctx.translate(S.x, S.y); if (S.rot) ctx.rotate(-S.rot); ctx.translate(-32, -61); ctx.imageSmoothingEnabled = false; ctx.drawImage(S.pic, 0, 0); if (S.cast) suFlCast(n * 1000, S.cast, 0, 0); ctx.restore();
  if (n >= C12.lull && n < C12.fire + 1.5) { const k = clamp01((n - C12.lull) / (C12.fire - C12.lull)) * (n < C12.fire ? 1 : Math.max(0, 1 - (n - C12.fire) / 1.5)); ctx.save(); ctx.globalCompositeOperation = 'lighter'; suFlGlow(S.x + 12, S.y - 34, 30 + 46 * k, 0.16 + 0.22 * k); ctx.restore(); }
}
const c12HitPt = () => { const M = c12M(C12.hit2 - 0.001), P = M7.frames[M.i]; return c10An(c12Wq(M), [P.head[0], P.head[1]]); };      // (where his face is when the arrow arrives)
function c12Arrow(n, M) {
  const K = C12, a = n - K.fire; if (a < 0 || a > K.arrow + 0.02) return; const h = c12Hand({ x: C12.SX, y: c12Fl(), rot: 0.45 }, SU_FL_HANDS[12].slice(2)), tg = c12HitPt();
  const th0 = Math.atan2(tg[1] - h[1], tg[0] - h[0]), st = [h[0] + Math.cos(th0) * 60, h[1] + Math.sin(th0) * 60], ap = clamp01(a / K.arrow), th = Math.atan2(tg[1] - st[1], tg[0] - st[0]), s = 0.8 + 0.7 * ap, hx = st[0] + (tg[0] - st[0]) * Math.pow(ap, 2.2), hy = st[1] + (tg[1] - st[1]) * Math.pow(ap, 2.2);
  if (!suFlSpr) suFlBuild(); const ar = suFlSpr.arrow[Math.floor(n * 20) % 10]; ctx.save(); ctx.translate(hx, hy); ctx.rotate(th); ctx.globalCompositeOperation = 'lighter'; suFlGlow(0, 0, 36 * s, 0.4); ctx.globalCompositeOperation = 'source-over'; ctx.drawImage(ar, Math.round(-90 * s), Math.round(-19 * s), Math.round(96 * s), Math.round(38 * s)); ctx.restore();
}
function c12Blast(n, M) {      // the arrow hits his face: a fireball where his head was, embers
  const r = n - C12.hit2; if (r < 0 || r > 3.2) return; const hp = c12HitPt(), M0 = c12M(C12.hit2 - 0.001), x = hp[0] + (M.x - M0.x), y = hp[1] + (M.y - M0.y);
  ctx.save(); const k = Math.min(1, r / 1.2); ctx.globalAlpha = 1 - clamp01((r - 1.6) / 1.6); suFgBlast(x, y, 46 + 30 * Math.min(1, r * 2), r, n * 1000); ctx.restore();
  ctx.save(); ctx.globalCompositeOperation = 'lighter'; for (let q = 0; q < 40; q++) { const an = c4R(q, 51) * 6.2832, sp = 30 + 110 * c4R(q, 52), a = r; ctx.globalAlpha = Math.max(0, 1 - a / (0.8 + c4R(q, 53))); ctx.fillStyle = q % 3 ? '#ffb84a' : '#fff0c0'; ctx.fillRect(Math.round(x + Math.cos(an) * sp * a), Math.round(y + Math.sin(an) * sp * a * 0.8 - 20 * a + 60 * a * a * 0.5), 1 + (q & 1), 1 + (q & 1)); } ctx.restore(); c6Glow(x, y, 60 * k + 20, '255,150,40', 0.5 * (1 - r / 3.2));
}

// ---- the cameras: per shot the zoom at its start and its end, what it looks at (Mh / Mc / Mf / Mw: his head, chest, feet, wheel; Sh / Sc / Sf: Sukuna's head, chest, hands; X: the middle of the two; A>B: a slow pan from one to the other) and where that is put on the screen (px from the middle)
const C12C = {
  e02: [2.0, 2.3, 'Mh', 22, -6], e03: [1.8, 1.3, 'Mc', 25, 5], e04: [1.0, 1.1, 'Mc', 34, 6], e05: [2.6, 2.9, 'Mw', 20, -4], e06: [1.0, 1.0, 'Sc>Mc', 0, 0], e07: [2.2, 2.0, 'Mw', 18, 8], e08: [1.5, 1.5, 'Mc', 28, 10],
  e09: [2.8, 3.0, 'Mw', 15, 0], e10: [2.2, 1.7, 'Mh', 22, 0], e11: [1.15, 1.15, 'Mc', 38, 0], e12: [2.4, 2.4, 'Mf', 30, 16], e13: [1.1, 1.1, 'Mc', [70, -50], 0], e14: [2.4, 2.0, 'Mh', 25, -2], e15: [1.0, 1.0, 'Mc', 40, 0],
  e16: [1.4, 1.6, 'Mc', 30, 8], e17: [1.2, 1.8, 'Mc', 24, 0], e18: [2.2, 1.5, 'Mc', 28, 0], e19: [1.2, 1.2, 'X', 0, 0], e20: [1.8, 1.7, 'Mc', 30, -6], e21: [1.3, 1.2, 'Mc', 36, 6], e22: [2.3, 2.3, 'Sh', -20, 0],
  e23: [1.3, 1.3, 'X', 10, 0], e24: [2.3, 2.5, 'Sf', -25, 0], e25: [2.4, 2.7, 'Mh', 30, -2], e26: [1.25, 1.25, 'X', 0, 6], e27: [1.3, 1.1, 'Mc', 20, 0], e28: [2.3, 2.7, 'Sf', -20, 4], e29: [2.0, 2.8, 'Mh', 30, 0],
  e30: [2.7, 2.9, 'Sf', -30, 0], e31: [3.0, 3.6, 'Mh', 18, 0], e32: [1.4, 1.0, 'Mc', 10, 0], e33: [1.0, 1.0, 'Mf', 30, 22], e34: [2.4, 2.8, 'Mw', 15, 0], e35: [1.7, 1.5, 'Sc', -18, 0], e36: [1.02, 1.0, 'X', 0, 0]
};
function c12Tg(n, sp) {      // a point of the world: Mahoraga's anchors, Sukuna's points, smoothed over the last 0.3 s (the pictures bob)
  const FL = c12Fl(); let sx = 0, sy = 0, c = 0;
  for (let j = 0; j < 4; j++) {
    const q = n - 0.1 * j, M = c12M(q), P = M7.frames[M.i], Q = c12Wq(M); let p;
    if (sp === 'Mh') p = c10An(Q, 'head'); else if (sp === 'Mc') p = c10An(Q, 'chest'); else if (sp === 'Mf') p = [M.x, FL]; else if (sp === 'Mw') p = c10An(Q, [P.head[0] + 4, P.head[1] - 6]);
    else if (sp === 'Sh') p = [C12.SX + 4, FL - 52]; else if (sp === 'Sc') p = [C12.SX, FL - 32]; else if (sp === 'Sf') p = [C12.SX + 20, FL - 40]; else { const m = c10An(Q, 'chest'); p = [(m[0] + C12.SX) / 2, (m[1] + FL - 32) / 2]; }
    sx += p[0]; sy += p[1]; c++;
  }
  return [sx / c, sy / c];
}
function c12Cam(n, k) {
  const cx = VW / 2, cy = VH / 2, Z = (a, u) => lerp(a[0], a[1], ease3(u));
  if (k === 'e01') {      // the silent look down: from the sky and the moon, down over the horizon and the floor to him kneeling
    const u = clamp01((n + C12K.look) / C12K.look), tg = c12Tg(0, 'Mh'), zB = 2.0, z = lerp(1.0, zB, ease3(u)), fyB = tg[1] + 6 / zB, fy = lerp(10, fyB, ease3(u)), fxB = tg[0] - 22 / zB;
    return { z, fx: fxB, fy, tx: cx, ty: cy, rot: 0 };
  }
  const i = C12S.findIndex(a => a[0] === k), t0 = i >= 0 ? C12S[i][1] - C12K.t0 : n, t1 = i >= 0 && i + 1 < C12S.length ? C12S[i + 1][1] - C12K.t0 : t0 + 4, u = clamp01((n - t0) / (t1 - t0)), c = C12C[k] || [1.2, 1.2, 'X', 0, 0];
  let pt; if (c[2].indexOf('>') > 0) { const [a, b] = c[2].split('>'), p = c12Tg(n, a), q = c12Tg(n, b), e = ease3(u); pt = [lerp(p[0], q[0], e), lerp(p[1], q[1], e)]; } else pt = c12Tg(n, c[2]);
  let zp = 1; for (let q = 0; q <= 33; q++) { const a = n - c12P(q); if (a >= 0 && a < 1) zp += 0.05 * Math.exp(-a * 8); } const a2 = n - C12.hit2; if (a2 >= 0 && a2 < 1) zp += 0.18 * Math.exp(-a2 * 7);
  const z = Z(c, u) * zp, ox = Array.isArray(c[3]) ? lerp(c[3][0], c[3][1], ease3(u)) : c[3], oy = c[4];
  return { z, fx: pt[0] - ox / z, fy: pt[1] - oy / z, tx: cx, ty: cy, rot: 0 };
}
function c12Shake(n) {
  const K = C12; let a = 0; if (n < K.hit) return 0;
  for (const [t, v, q] of [[K.hit, 5, 6], [K.walk1, 3, 6], [K.leap, 3, 5], [K.fire, 3, 8], [K.hit2, 9, 5], [K.land, 6, 5], [K.brk, 3.5, 6], ...C12N.map(t => [t, 2.2, 6])]) if (n >= t) a += v * Math.exp(-(n - t) * q);
  for (let k = 0; k <= 33; k++) { const t = c12P(k); if (n >= t) a += (k >= 24 ? 1.8 : 0.9) * Math.exp(-(n - t) * 7); }
  return a + (n > K.hit && n < K.lull ? 0.3 : 0);
}

// ---- the shot
function c12Shot(now, dt, T, st) {
  const s = T - c8R(), n = s - C12K.t0, K = C12, cam = c12Cam(n, st.k), sh = c12Shake(n), j = q => sh < 0.3 ? 0 : (c6H(Math.floor(T * 36), q) - 0.5) * 2 * sh; c10Warm(n);
  if (!suSlSpr) suSlBuild(); if (!suFlSpr) suFlBuild();      // (the slash and flame pictures are made in the dark of the look down, not at the first hit)
  ctx.save(); ctx.translate(Math.round(j(11)), Math.round(j(12)));
  c12Backdrop(n, cam); c12Shrine(cam, n);
  const M = c12M(n), S = c12S(n); c4CamOn(cam.z, cam.fx, cam.fy, cam.tx, cam.ty);
  c12Pools(n, M); c12DrawS(n, S); c12DrawM(M, n, s); c12Wheel(n, M, s); if (n >= K.hit && n < K.hit2 + 0.1) c12Cuts(n, M, s); c12Arrow(n, M); c12Blast(n, M);
  c4Cam0(); ctx.restore();
  c12Rain(n);
  { const hp = c12HitPt(); c10Impact(n, K.hit2, cam, hp[0], hp[1], 0.45); }
  c12Over(n, s, cam, M);
  msFinish(1); c6Black((s - (C8T.end - 0.9)) / 0.9);
}
function c12Over(n, s, cam, M) {      // light over the picture: the flash of the song's hit, of every heavy hit of the guard, the fire, the dark red of the domain, the fade at the end
  const K = C12; ctx.fillStyle = 'rgba(40,0,10,0.12)'; ctx.fillRect(0, 0, VW, VH);
  { const a = n - K.hit; if (a >= 0 && a < 0.5) c6White(0.55 * Math.exp(-a * 9)); }
  for (let k = 24; k <= 33; k++) { const a = n - c12P(k); if (a >= 0 && a < 0.2) c6White(0.16 * Math.exp(-a * 14)); }
  { const k = c8NotchK(s); if (k > 0.02) c6White(0.26 * k * k); }
  { const a = n - K.fire; if (a >= 0 && a < 0.3) { ctx.fillStyle = 'rgba(255,120,20,' + (0.3 * (1 - a / 0.3)).toFixed(3) + ')'; ctx.fillRect(0, 0, VW, VH); } }
  { const a = n - K.hit2; if (a >= 0 && a < 0.35) c6White(0.95 * Math.exp(-a * 7)); }
  { const a = n - K.land; if (a >= 0 && a < 0.4) c6White(0.12 * Math.exp(-a * 9)); }
  { const k = ease3(clamp01((n - K.chord) / 3.0)); if (k > 0.001) c6Black(k * 0.85); }
  { const k = ease3(clamp01((n - K.black) / 3.4)); if (k > 0.001) c6Black(k); }
  { const k = clamp01(1 - (n + 1.5) / 1.4); if (k > 0.001) c6Black(k); }      // (the fade in from the black of v1.136's end)
}

// ---- the sounds (each fires once)
function c12Steps() {      // the time of every step of the walk: two to a cycle of the walk's 32 pictures (the distance 51.72 * 0.8 px)
  if (C12.steps) return C12.steps; const out = [], half = 51.72 * C12.sc / 2; let j = 1; for (let n = C12.walk0; n < C12.walk1; n += 0.02) while (c12D(n) >= j * half) { out.push(n); j++; }
  return C12.steps = out;
}
function c12Events(T, ev) {
  const K = C12, R = c12Start(), at = (k, t, f, win) => ev(k, R + t, f, win || 0.5);
  at('c12h0', -1.3, () => snd('c7beat', 0), 0.6); at('c12h1', -0.7, () => snd('c7beat', 1), 0.6); at('c12h2', -0.25, () => snd('c7beat', 1), 0.4);
  at('c12hit', K.hit - 0.02, () => { snd('c7smash'); snd('c7thud', 0); snd('c6scrape'); }, 0.6);
  for (let k = 0; k <= 33; k++) at('c12p' + k, c12P(k), () => { snd(k & 1 ? 'c7tear' : 'c6scrape'); if (k >= 24 || k % 3 === 2) snd('smack', 1); }, 0.5);
  for (let k = 25; k <= 33; k++) at('c12r' + k, c12P(k) + 0.5, () => snd('rct', 0), 0.6);
  C12N.forEach((t, i) => at('c12n' + i, t, () => { snd('c7wheel', 1); snd('rct', 0); }, 0.8));
  c12Steps().forEach((t, i) => at('c12s' + i, t, () => snd('c7step', i & 1), 0.3));
  at('c12gup', K.walk1 - 0.02, () => { snd('c7smash'); snd('c7cloth', 1); }, 0.6);
  at('c12fl', K.lull, () => snd('sukfire', 0), 1.0); at('c12fg0', K.fire - 7.0, () => snd('sukfuga', 0), 1.0); at('c12clap', K.crouch, () => snd('sukfire', 1), 0.8); at('c12bow', K.draw, () => snd('sukfire', 2), 0.8);
  at('c12cr', K.crouch + 0.2, () => snd('c7cloth', 1), 0.6); at('c12leap', K.leap - 0.02, () => { snd('c7smash'); snd('c7whoosh'); snd('c7rise'); }, 0.8);
  at('c12rel', K.fire, () => snd('sukfuga', 1), 0.8); at('c12boom', K.hit2 - 0.02, () => { snd('sukfuga', 2); snd('c7smash'); }, 1.0); at('c12fall', K.hit2 + 0.4, () => snd('c7whoosh'), 0.6);
  at('c12land', K.land, () => { snd('c7thud', 0); snd('c4guts'); }, 0.6); at('c12brk', K.brk, () => { snd('c7shatter'); snd('c8crack'); }, 0.8);
}
for (const a of C12S) c7Shots[a[0]] = c12Shot;
