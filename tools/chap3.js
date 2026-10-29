// ================================================================ v1.106 CHAPTER 3: THE DIVINE GENERAL
// The cold hall of the summoning once more. Verity lies on the floor; Mahoraga walks up to him, the STOP is stopped by the wheel turning one notch (it adapts), and one punch breaks Verity in half.
// Mahoraga is a sheet of 92 pictures (tools/maho_rig.py + tools/maho_anim.py: 168 x 140 each, 8 to a row, facing LEFT, lit from the upper right): idle 12, walk 32, windup 12, punch 8, recover 12, start 8, halt 8.
// The whole scene is ONE stage: where everybody is, which picture each shows and what the blood does are functions of the scene time T alone (so a tap that skips a cut, or a test that jumps to a time, draws the same picture); the shots only choose the camera and what is laid over it.
// Stage coordinates: x to the right, the floor at the screen line m7Fy() (zoom 1); Verity's waist is the point x = 0 (the fist lands there), Mahoraga comes from the right.
const M7_IMG = (() => { const i = new Image(); i.src = 'data:image/png;base64,__M7PNG__'; return i; })();
const M7 = __M7JSON__;      // { w, h, cols, clips: { name: [first picture, how many] }, frames: [{ head, eye1, eye2, fist, wrist, elbow, shoulder, pelvis, footN, footF, toeN, toeF, chest }, ...] } (the places in the picture's own pixels)
const M7C = new Map();
function m7Fr(i) {      // picture i of the sheet as a canvas of its own (null while the sheet is still loading)
  let c = M7C.get(i); if (c) return c; if (!M7_IMG.complete || !M7_IMG.naturalWidth) return null;
  c = document.createElement('canvas'); c.width = M7.w; c.height = M7.h; c.getContext('2d').drawImage(M7_IMG, (i % M7.cols) * M7.w, Math.floor(i / M7.cols) * M7.h, M7.w, M7.h, 0, 0, M7.w, M7.h); M7C.set(i, c); return c;
}
const M7L = {      // the lights Mahoraga is seen in (d6Lit: the first is the key light; a pixel that faces a light with nothing in front of it takes its colour)
  cold: [[1, 0, '175,205,255'], [0, -1, '255,214,140']],      // the door of the hall on the right, the wheel above
  gold: [[0, -1, '255,214,140'], [1, 0, '255,236,190']],      // the wheel is bright
  violet: [[1, 0, '190,120,255'], [0, -1, '150,90,235']],      // held by the STOP
  white: [[1, 0, '255,255,255'], [0, -1, '255,255,255']],      // the flash of the blow
};
const M7LC = new Map();      // his lit pictures, kept here (the lit copies of d6Lit are only 80 and are all thrown away when it is full: that would happen in the middle of the blow)
function m7Lit(i, set) { const key = i + set; let c = M7LC.get(key); if (c) return c; const f = m7Fr(i); if (!f) return null; c = d6Lit(M7L[set], 0.7, f, 0.78); if (c) M7LC.set(key, c); return c; }

// ---- the timeline: the world's times first (seconds of the scene), then the shots that show them
const M7R = { idle: 8, start: 16, walk: 20, halt: 16, windup: 18, recover: 15 };      // pictures a second of each clip
const M7W = { fps: M7R.walk, cyc: M7.clips.walk[1], go: 5.6, hold: 1.6, loops: 3 };      // the walk: 20 pictures a second, 32 to a stride, 3 strides; the STOP holds him 1.6 s
M7W.step = 58.6206 / M7W.cyc; M7W.n = M7W.cyc * M7W.loops; M7W.fk = 2 * M7W.cyc + Math.round(M7W.cyc * 5 / 16);      // the foot on the floor moves 34 px back during 0.58 of a stride, so he moves 58.62 px a stride (planted feet need exactly that); the STOP takes him at the picture where the far foot is highest (5/16 of the third stride)
M7W.x0f = -M7.frames[M7.clips.punch[0] + 5].fist[0]; M7W.x0s = M7W.x0f + M7W.step * M7W.n;      // where his picture's left edge is when the fist of the blow lands on x = 0, and where it was when he set off
M7W.loop0 = M7W.go + M7.clips.start[1] / M7R.start; M7W.fz = M7W.loop0 + M7W.fk / M7W.fps; M7W.fe = M7W.fz + M7W.hold; M7W.hs = M7W.fe + (M7W.n - M7W.fk) / M7W.fps; M7W.hd = M7W.hs + M7.clips.halt[1] / M7R.halt; M7W.wu = M7W.hd + 0.17; M7W.pn = M7W.wu + M7.clips.windup[1] / M7R.windup + 0.73;
M7W.hit = M7W.pn + 0.28; M7W.rc = M7W.pn + 0.86; M7W.eyes = 4.5; M7W.tr = M7W.go + 1.85; M7W.c1 = M7W.wu + M7.clips.windup[1] / M7R.windup; M7W.c2 = M7W.c1 + 0.4;      // (the blow starts at pn, lands at hit; the recovery starts at rc; the eyes light at eyes; the shots: track at tr (Verity lies still for 0.4 s of it, then tries to get up); while the arm rises (wu to c1) the camera is close on him, then Verity's face again (c1 to c2), then the fist (c2 to pn))
const C7_SEQ = [['title', 0], ['wide', 3.2], ['face', M7W.go + 0.35], ['track', M7W.tr], ['stop', M7W.fz - 0.2], ['wind', M7W.hs - 0.03], ['punch', M7W.pn], ['break', M7W.hit + 0.45], ['after', M7W.hit + 0.45 + 3.7]].map(a => ({ k: a[0], t0: a[1] }));
C7_SEQ.forEach((s, i) => { s.d = i < C7_SEQ.length - 1 ? C7_SEQ[i + 1].t0 - s.t0 : 5.6; });
const C7 = { card: C7_SEQ[C7_SEQ.length - 1].t0 + C7_SEQ[C7_SEQ.length - 1].d };
const c7T = k => C7_SEQ.find(s => s.k === k).t0;
const C7_CUTS = C7_SEQ.slice(1).map(s => s.t0).concat([C7.card]);      // a tap jumps to the next of these

// ---- where Mahoraga is and which picture he shows at the scene time T: { i: the picture, x: its left edge, held: frozen by the STOP }
function m7Mah(T) {
  const W = M7W, K = M7.clips, at = (name, f) => K[name][0] + Math.max(0, Math.min(K[name][1] - 1, f));
  if (T < W.go) return { i: at('idle', Math.floor(T * M7R.idle) % 12), x: W.x0s, mode: 'idle' };
  if (T < W.loop0) return { i: at('start', Math.floor((T - W.go) * M7R.start)), x: W.x0s, mode: 'start' };
  if (T < W.hs) {      // the walk: the picture k of the walk, the feet planted (his place moves in steps with the pictures, so that a foot on the floor stays where it is)
    const lt = T < W.fz ? T - W.loop0 : T < W.fe ? W.fz - W.loop0 : W.fz - W.loop0 + (T - W.fe), k = Math.floor(lt * W.fps + 1e-6);
    return { i: K.walk[0] + k % W.cyc, x: W.x0s - W.step * k, mode: 'walk', held: T >= W.fz && T < W.fe, k };
  }
  const x = W.x0f;
  if (T < W.hd) return { i: at('halt', Math.floor((T - W.hs) * M7R.halt)), x, mode: 'halt' };
  if (T < W.wu) return { i: K.idle[0], x, mode: 'idle' };
  if (T < W.pn) return { i: at('windup', Math.floor((T - W.wu) * M7R.windup)), x, mode: 'windup' };
  const a = T - W.pn;
  if (a < W.rc - W.pn) return { i: K.punch[0] + (a < 0.10 ? 0 : a < 0.16 ? 1 : a < 0.20 ? 2 : a < 0.24 ? 3 : a < 0.28 ? 4 : a < 0.52 ? 5 : a < 0.66 ? 6 : 7), x, mode: 'punch' };
  const r = T - W.rc; if (r < K.recover[1] / M7R.recover) return { i: at('recover', Math.floor(r * M7R.recover)), x, mode: 'recover' };
  return { i: at('idle', Math.floor((T - W.rc - K.recover[1] / M7R.recover) * M7R.idle) % 12), x, mode: 'idle' };
}

// ---- Verity: lying on the floor (his hit reaction 4, the knock-down: pictures 3 - 8 lie flat, head to the left, 9 - 12 rise); cut in two at the waist at the blow
const V7 = { cut: new Map(), sim: null, X: 37, w: 96, h: 64, hw: 16.5, hh: 10.5, pu: [20.5, 53.5], pl: [53.5, 53.5], hit: [-125, 150, 8], lo: [-70, 205, -7], fold: 0.108, g: 520 };      // X: the waist's column in his picture (the picture's left edge is at stage x = -37); hw, hh: half the length and the thickness of a half; pu, pl: the middle of each half in the picture; hit / lo: the speed (px/s, up, spin) the upper and the lower half leave with
function v7Look(T) {      // which of his pictures is shown before the blow: { fi, shake }
  const s = M7W, t = T - s.tr - 0.4;
  if (t < 0) return { fi: [6, 7, 8, 7][Math.floor(T * 2.5) % 4] };
  if (t < 0.95) { const p = [[0, 7], [0.1, 9], [0.2, 10], [0.35, 11], [0.65, 11], [0.75, 10], [0.82, 9], [0.9, 8]]; let f = 7; for (const q of p) if (t >= q[0]) f = q[1]; return { fi: f, shake: f === 11 ? 1 : 0 }; }      // (he tries to get up on his elbows and falls back)
  if (T < s.fe + 0.2) return { fi: 3, arm: true, shake: T > s.fz ? 1 : 0 };      // the hand up: the STOP
  return { fi: [6, 7, 8, 7][Math.floor(T * 2.5) % 4], shake: T < s.pn ? 0.7 : 0 };      // (flat again, trembling)
}
function v7Halves(fi, lights) {      // his lying picture lit for the hall and cut into two pictures of the same size along a ragged line through the waist; the torn ends are red flesh with a pale bone in the middle
  const key = fi + JSON.stringify(lights), hit = V7.cut.get(key); if (hit) return hit;
  const src = d6Lit(lights, 0.7, vrx(4, fi), 0.62); if (!src) return null; const w = V7.w, h = V7.h, sd = src.getContext('2d').getImageData(0, 0, w, h).data, mk = () => { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; }, U = mk(), L = mk(), ug = U.getContext('2d'), lg = L.getContext('2d'), ui = ug.createImageData(w, h), li = lg.createImageData(w, h), u = ui.data, l = li.data;
  const cuts = []; for (let y = 0; y < h; y++) cuts.push(V7.X + Math.round(2.2 * Math.sin(y * 1.7 + 0.6) + 2 * (c4R(y, 41) - 0.5)));
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { const i = (y * w + x) * 4; if (!sd[i + 3]) continue; const to = x < cuts[y] ? u : l; to[i] = sd[i]; to[i + 1] = sd[i + 1]; to[i + 2] = sd[i + 2]; to[i + 3] = 255; }
  const hex = c => [parseInt(c.slice(1, 3), 16), parseInt(c.slice(3, 5), 16), parseInt(c.slice(5, 7), 16)], put = (a, x, y, c) => { const i = (y * w + x) * 4; if (!a[i + 3]) return; const q = hex(c); a[i] = q[0]; a[i + 1] = q[1]; a[i + 2] = q[2]; };
  const rows = []; for (let y = 0; y < h; y++) if (sd[(y * w + cuts[y] - 1) * 4 + 3] || sd[(y * w + cuts[y]) * 4 + 3]) rows.push(y); const mid = rows.length ? rows[rows.length >> 1] : 53;
  for (const y of rows) for (let d = 0; d < 4; d++) {      // the torn ends: 1 px dark rim, then flesh in three reds, a pale bone on the middle rows, a few specks of blood further in
    const q = c4R(y * 7 + d, 43), c = d === 0 ? '#4a0a1c' : Math.abs(y - mid) <= 1 && d >= 1 && d <= 2 ? '#d8ccb8' : d === 3 ? (q < 0.4 ? '#8e0c18' : null) : q < 0.3 ? '#e0192b' : q < 0.7 ? '#b3121f' : '#8e0c18';
    if (c) { put(u, cuts[y] - 1 - d, y, c); put(l, cuts[y] + d, y, c); }
  }
  ug.putImageData(ui, 0, 0); lg.putImageData(li, 0, 0); const r = { U, L }; if (V7.cut.size > 8) V7.cut.clear(); V7.cut.set(key, r); return r;
}
function m7Warp(r) {      // the blow's own time: slow (0.45) while the picture holds on the impact, then it speeds up to full speed over 0.66 s (r: real seconds after the blow; returns the seconds the blood and the halves have lived)
  if (r <= 0) return r; if (r < 0.24) return 0.45 * r;
  if (r < 0.9) { const u = (r - 0.24) / 0.66; return 0.108 + 0.45 * (r - 0.24) + 0.363 * (u * u * u - u * u * u * u / 2); }
  return 0.5865 + (r - 0.9);
}
function v7Sim() {      // both halves, step by step from the end of the fold (a function of nothing but the numbers above: made once): a table of [x, h, angle] per piece every 1/120 s; h = the height of the half's middle over the floor
  if (V7.sim) return V7.sim; const dt = 1 / 240, n = 1200, F = V7.fold, ph = 0.55, hs = [V7.hw, V7.hh], out = { U: [], L: [], slide: { U: [], L: [] } };
  const st = {
    U: { x: -V7.hw * Math.cos(ph), h: V7.hh + V7.hw * Math.sin(ph), a: ph, vx: V7.hit[0], vh: V7.hit[1], w: V7.hit[2] },
    L: { x: V7.hw * Math.cos(ph), h: V7.hh + V7.hw * Math.sin(ph), a: -ph, vx: V7.lo[0], vh: V7.lo[1], w: V7.lo[2] },
  };
  for (let s = 0; s < n; s++) for (const k of ['U', 'L']) {
    const p = st[k]; p.vh -= V7.g * dt; p.x += p.vx * dt; p.h += p.vh * dt; p.a += p.w * dt; const ext = hs[0] * Math.abs(Math.sin(p.a)) + hs[1] * Math.abs(Math.cos(p.a)); let on = false;
    if (p.h <= ext) { p.h = ext; on = true; if (p.vh < 0) { if (p.vh < -45) { p.vh = -p.vh * 0.2; p.vx *= 0.6; p.w *= -0.42; } else { p.vh = 0; } } }
    if (on && p.vh === 0) { p.vx *= Math.exp(-4 * dt); const t = Math.round(p.a / Math.PI) * Math.PI; p.w = 0; p.a += (t - p.a) * (1 - Math.exp(-9 * dt)); }
    if (s % 2 === 1) { out[k].push([p.x, p.h, p.a]); out.slide[k].push(on && p.vh === 0 ? 1 : 0); }
  }
  out.dt = 2 * dt; out.F = F; return V7.sim = out;
}
function v7At(k, a) {      // half k ('U' / 'L') a seconds after the blow: { x, h, a: angle } (the fold first, then the table)
  const F = V7.fold, ph = 0.55;
  if (a < F) { const p = ph * ease3(a / F), q = k === 'U' ? -1 : 1; return { x: q * V7.hw * Math.cos(p), h: V7.hh + V7.hw * Math.sin(p), a: -q * p, f: 1 }; }      // (the fold: both halves turn about the waist, the ends up)
  const S = v7Sim(), t = (a - F) / S.dt, i = Math.min(S[k].length - 2, Math.max(0, Math.floor(t))), q = Math.min(1, t - i), A = S[k][i], B = S[k][i + 1];
  return { x: lerp(A[0], B[0], q), h: lerp(A[1], B[1], q), a: lerp(A[2], B[2], q), on: S.slide[k][i] };
}

// ---- the stage: the hall, Mahoraga (the wheel behind him, his picture, his shadow, his eyes), Verity's halves, the blood and the dust
const m7Fy = () => Math.min(VH - 12, Math.max(VH - 20, Math.round(0.08 * VH + 106)));      // the floor line on the screen at zoom 1 (the soles of everybody): 20 px over the bottom edge, so that a strip of floor (8 px) shows between the soles and the cinema bar (0.8 of its usual height here) for the shadows, the pools and the blood
const m7Sy = (cam, y) => cam.sy + cam.z * (y - cam.y), m7Sx = (cam, x) => VW / 2 + cam.z * (x - cam.x);      // stage point -> screen
const m7CamOn = c => c4CamOn(c.z, Math.round(c.x), Math.round(c.y), VW / 2, c.sy);
const M7S = new Map(), M7SO = 130;
function m7Sil(i) {      // his shadow on the floor as a picture of its own (M7SO px to the left of his picture, 8 px high): the rows of the picture, thrown to the left by the light of the door (0.9 px for every px of height) and squeezed onto the 8 rows of floor; made pixel by pixel, so that it is a clean shape and not a row of dashes
  let c = M7S.get(i); if (c) return c; const f = m7Fr(i); if (!f) return null; const w = M7.w, h = M7.h, d = f.getContext('2d').getImageData(0, 0, w, h).data; c = document.createElement('canvas'); c.width = w + M7SO; c.height = 8;
  const g = c.getContext('2d'), im = g.createImageData(c.width, 8), o = im.data;
  for (let v = 0; v < h; v++) { const r = Math.max(0, Math.min(7, Math.round(6.8 - 0.05 * v))), sh = Math.round(0.9 * (136 - v)); for (let u = 0; u < w; u++) if (d[(v * w + u) * 4 + 3] > 0) { const x = u - sh + M7SO; if (x >= 0 && x < c.width) { const k = (r * c.width + x) * 4; o[k] = 0; o[k + 1] = 0; o[k + 2] = 8; o[k + 3] = 255; } } }
  g.putImageData(im, 0, 0); M7S.set(i, c); return c;
}
function m7Hall(T, cam, o) {      // the hall: the cold room of the summoning with the light of the door far on the right; two layers of pillars that move slower than the camera, and a floor with a few lines in it
  const Fy = m7Fy(), z = cam.z, fl = Fy - 10, sy = y => m7Sy(cam, y);
  v6Room(T, { sx: Math.max(-VW, Math.min(2 * VW, m7Sx(cam, 430))), glow: o.glow == null ? 0.55 : o.glow, shaft: o.shaft == null ? 0.7 : o.shaft, fy: Math.max(0.2, Math.min(1.4, sy(fl) / VH)) });
  for (const [p, sp, w, col, edge] of [[0.3, 118, 16, '#070d22', '#142250'], [0.62, 176, 24, '#04081a', '#16265a']]) {
    const c = cam.x * p, lo = Math.floor((c - VW / 2 / z - w) / sp), hi = Math.ceil((c + VW / 2 / z + w) / sp), bot = Math.round(sy(fl - (1 - p) * 3)), W = Math.max(2, Math.round(w * z));
    for (let i = lo; i <= hi; i++) { const x = Math.round(VW / 2 + z * (i * sp + sp / 2 - c) - W / 2); ctx.fillStyle = col; ctx.fillRect(x, 0, W, bot); ctx.fillStyle = edge; ctx.fillRect(x + W - Math.max(1, Math.round(W * 0.22)), 0, Math.max(1, Math.round(W * 0.22)), bot); ctx.fillStyle = 'rgba(0,0,0,0.5)'; ctx.fillRect(x - 1, bot - 3 * z, W + 2, 3 * z); }
  }
  const top = Math.round(sy(fl)); ctx.fillStyle = 'rgba(120,150,230,0.07)';
  for (let wx = Math.floor((cam.x - VW / 2 / z) / 44) * 44; wx < cam.x + VW / 2 / z + 44; wx += 44) { const xt = m7Sx(cam, wx), xb = xt + (xt - VW / 2) * 0.9; ctx.beginPath(); ctx.moveTo(Math.round(xt) + 0.5, top); ctx.lineTo(Math.round(xb) + 0.5, VH); ctx.lineTo(Math.round(xb) + 1.5, VH); ctx.lineTo(Math.round(xt) + 1.5, top); ctx.fill(); }
  for (const d of [5, 12, 22]) ctx.fillRect(0, top + Math.round(d * z * 0.8), VW, 1);
}
function m7Wheel(cx, cy, r, ang, a) {      // the wheel of the Divine General: a ring with eight spokes that end in handles, at the angle ang, in blocks of 2 px (d6Wheel's, but it turns where it is told to)
  if (a <= 0.01) return; ctx.save(); ctx.globalAlpha = Math.min(1, a); const P = 2, dot = (x, y, c) => { ctx.fillStyle = c; ctx.fillRect(Math.round(x / P) * P, Math.round(y / P) * P, P, P); }, n = Math.ceil(6.2832 * r / P);
  for (let i = 0; i < n; i++) { const t = i / n * 6.2832, c = Math.cos(t), s = Math.sin(t); dot(cx + c * (r + P), cy + s * (r + P), '#b8862a'); dot(cx + c * r, cy + s * r, '#ffd86a'); dot(cx + c * (r - P), cy + s * (r - P), '#fff4c0'); }
  for (let s = 0; s < 8; s++) { const t = ang + s * 0.7854, c = Math.cos(t), si = Math.sin(t); for (let d = P * 2; d < r * 1.3; d += P) dot(cx + c * d, cy + si * d, d > r ? '#ffd86a' : '#fff4c0'); const hx = cx + c * r * 1.3, hy = cy + si * r * 1.3; for (let u = -1; u <= 1; u++) for (let v = -1; v <= 1; v++) dot(hx + u * P, hy + v * P, '#ffd86a'); }
  ctx.restore();
}
const M7N = [M7W.fz + 0.9, c7T('after') + 1.5];      // the times the wheel turns one notch: when it adapts to the STOP, and once more over the dead
function m7Ang(T) { let a = 0.2 * T; for (const t of M7N) { const u = Math.max(0, Math.min(1, (T - t) / 0.3)); if (T >= t) a += 0.7854 * (1 + 2.7 * Math.pow(u - 1, 3) + 1.7 * Math.pow(u - 1, 2)); } return a; }
const m7NotchK = T => { let k = 0; for (const t of M7N) if (T >= t) k = Math.max(k, Math.exp(-(T - t) * 3.2)); return k; };      // 1 at a notch, fading: the flash of the wheel
const M7P = (() => { const o = [], K = M7.clips.walk[0], h = M7W.cyc / 2; for (let k = 0; k <= M7W.n; k += h) { const t = k < M7W.fk ? M7W.loop0 + k / M7W.fps : M7W.fe + (k - M7W.fk) / M7W.fps, f = M7.frames[K + k % M7W.cyc], near = k % M7W.cyc === 0, x = (k === M7W.n ? M7W.x0f : M7W.x0s - M7W.step * k) + (near ? f.footN[0] : f.footF[0]); o.push({ t, x, k }); } return o; })();      // the plants of his feet: when, where (a step of the walk that sets a foot down)
function m7Shake(T) {      // how hard the picture shakes at T: every footfall, the STOP, the blow
  let a = 0; for (const p of M7P) if (T >= p.t) a += 1.7 * Math.exp(-(T - p.t) * 9); const r = T - M7W.hit; if (r >= 0) a += 11 * Math.exp(-r * 6.5); a += 1.2 * m7NotchK(T) * (T < M7N[1] ? 1 : 0.5);
  if (T > M7W.fz && T < M7W.fe) a += 0.9; if (T > M7W.wu + 0.2 && T < M7W.pn) a += 0.8 * (T - M7W.wu - 0.2) / (M7W.pn - M7W.wu - 0.2); return a;
}
function m7Dust(T, t0, x, n, o) {      // a cloud of dust that rolls along the floor out of x and thins (o: w the width it reaches, h how high it rises, life, col 'r,g,b', big the size of the puffs): the same as the alley's, on this floor
  const a = T - t0, life = o.life || 1; if (a < 0 || a > life) return; const k = a / life, Fy = m7Fy();
  for (let i = 0; i < n; i++) { const r1 = c4R(i + (o.seed || 0) * 29, 5), r2 = c4R(i + (o.seed || 0) * 29, 6), s = Math.round(2 + k * (o.big || 6) * (0.4 + 0.6 * r2)), px = Math.round(x + (r1 - 0.5) * 2 * (o.w || 30) * (0.25 + 0.75 * Math.sqrt(k))), py = Math.round(Fy + 1 - k * (o.h || 14) * (0.3 + 0.7 * r2) - r2 * 3);
    ctx.fillStyle = 'rgba(' + (o.col || '120,140,190') + ',' + (0.42 * (1 - k) * (1 - k)).toFixed(3) + ')'; ctx.fillRect(px - (s >> 1), py - 1, s, Math.max(1, s - 2)); ctx.fillRect(px - (s >> 1) + 1, py - 2, Math.max(1, s - 2), s); }
}
function m7Pool(x, k, rx0) {      // blood on the floor: a flat dark red pool that spreads (k 0 - 1, rx0 = how wide it gets), a darker rim, a ragged edge and a wet shine
  if (k <= 0.02) return; const Fy = m7Fy(), rx = Math.round(3 + rx0 * k), ry = Math.max(1, Math.round(1 + 3 * k)), y = Fy + 4;
  for (let yy = -ry; yy <= ry; yy++) { const e = Math.sqrt(Math.max(0, 1 - (yy / ry) * (yy / ry))), w = Math.round(rx * e) + (((yy * 7 + x) & 3) - 1), w2 = Math.round(rx * e * 0.78); ctx.fillStyle = C4_RED[3]; ctx.fillRect(x - w, y + yy, w * 2, 1); ctx.fillStyle = yy < 0 ? C4_RED[2] : '#7a0c18'; ctx.fillRect(x - w2, y + yy, w2 * 2, 1); }
  ctx.fillStyle = C4_RED[1]; ctx.fillRect(x - Math.round(rx * 0.5), y - Math.round(ry * 0.4), Math.round(rx), 1); ctx.fillStyle = '#c4303f'; for (let i = 0; i < 3; i++) ctx.fillRect(x - Math.round(rx * 0.5) + i * Math.round(rx * 0.35), y - Math.round(ry * 0.4), 2, 1);
}
function m7Cracks(x, k) {      // the floor cracks where the fist landed: thin dark lines run out along it (k 0 - 1 how far)
  if (k <= 0.02) return; const Fy = m7Fy(); for (let i = 0; i < 9; i++) { const dir = i % 2 ? 1 : -1, len = (10 + 30 * c4R(i, 51)) * Math.min(1, k * 1.6), y0 = Fy + 1 + (i % 3);
    let px = x + dir * (2 + 3 * c4R(i, 52)), py = y0; for (let j = 0; j < len; j++) { px += dir; if (j % 4 === 3) py += (c4R(i * 31 + j, 53) < 0.5 ? -1 : 1) * (py > Fy - 1 && py < Fy + 4 ? 1 : 0); ctx.fillStyle = '#02030a'; ctx.fillRect(Math.round(px), Math.round(py), 1, 1); if (j % 3 === 0) { ctx.fillStyle = 'rgba(160,180,255,0.25)'; ctx.fillRect(Math.round(px), Math.round(py) - 1, 1, 1); } } }
}
const M7_GRAY = ['#8a86a0', '#6a6683', '#b4b0c8', '#4a4660'];

// ---- Verity's halves and the blood (a = the blow's own time, m7Warp of the seconds since it)
const m7End = (k, a) => { const p = v7At(k, a), o = k === 'U' ? V7.hw : -V7.hw; return [p.x + o * Math.cos(p.a), m7Fy() - p.h + o * Math.sin(p.a)]; };      // where the torn end of half k is on the stage
function m7Smear(a) {      // the streaks the halves leave on the floor while they slide, and the pools under them where they lie
  const S = v7Sim(), Fy = m7Fy(), F = V7.fold; ctx.fillStyle = C4_RED[2];
  for (const k of ['U', 'L']) { const n = Math.min(S[k].length - 1, Math.floor((a - F) / S.dt)); let first = -1;
    for (let i = 0; i <= n; i += 4) if (S.slide[k][i]) { if (first < 0) first = i; const p = S[k][i]; ctx.fillStyle = i % 8 < 4 ? C4_RED[3] : C4_RED[2]; ctx.fillRect(Math.round(p[0]) - 4, Fy + 1, 8, 4); }
    if (first >= 0) { const e = S[k][Math.min(n, S[k].length - 1)], tl = F + first * S.dt; m7Pool(Math.round(e[0]), Math.pow(Math.max(0, Math.min(1, (a - tl) / 2.6)), 0.7), k === 'U' ? 30 : 24); } }
}
function m7Gore(T, a) {      // the spray from the two torn ends, the pale bone, the organs, the strands that stretch between the halves and snap, the dust and the stones of the floor
  if (a < 0) return; const Fy = m7Fy(), F = V7.fold; m7Cracks(0, Math.min(1, a / 0.35));
  if (a < 1.3) { const k = a / 1.3; ctx.save(); ctx.strokeStyle = 'rgba(190,210,255,' + (0.7 * (1 - k)).toFixed(3) + ')'; ctx.lineWidth = 1; ctx.beginPath(); ctx.ellipse(0, Fy + 1, 4 + 170 * Math.pow(k, 0.6), 1 + 14 * Math.pow(k, 0.6), 0, 0, 6.2832); ctx.stroke(); ctx.restore(); }
  m7Dust(a, 0, 0, 16, { w: 64, h: 22, life: 1.2, col: '130,150,200', big: 9, seed: 1 }); m7Dust(a, 0.05, -24, 9, { w: 40, h: 16, life: 1.0, col: '110,130,180', big: 7, seed: 2 }); m7Dust(a, 0.05, 24, 9, { w: 40, h: 16, life: 1.0, col: '110,130,180', big: 7, seed: 3 });
  c4Spray(a, 0, 0, Fy - 5, 16, { v: 150, up: 1.4, dir: 0, life: 0.9, cols: M7_GRAY, sz: 1, seed: 90, gnd: Fy + 3, g: 420 });
  for (let i = 0; i < 38; i++) { const t0 = 0.03 + i * 0.032; if (a < t0 || a > t0 + 1.6) continue; const k = 1 - i / 38, u = m7End('U', t0), l = m7End('L', t0);
    c4Spray(a, t0, u[0], u[1], 7, { v: 150 * k + 30, up: 1, dir: -1, life: 0.9, cols: [C4_RED[0], C4_RED[1], C4_RED[1], C4_RED[2], C4_RED[2], C4_RED[3]], sz: 1, seed: i, gnd: Fy + 3, stain: 9, g: 340 });
    c4Spray(a, t0, l[0], l[1], 6, { v: 120 * k + 25, up: 1.2, dir: 0, life: 0.8, cols: [C4_RED[0], C4_RED[1], C4_RED[1], C4_RED[2], C4_RED[2], C4_RED[3]], sz: 1, seed: i + 50, gnd: Fy + 3, stain: 9, g: 340 }); }
  const u0 = m7End('U', F), l0 = m7End('L', F);
  c4Spray(a, F, u0[0], u0[1], 7, { v: 170, up: 1.1, dir: -1, life: 1.0, cols: ['#d8ccb8', '#fff2dc'], sz: 2, seed: 77, gnd: Fy + 3, stain: 9, g: 360 });
  c4Organs(a, F, u0[0], u0[1], 8, { v: 100, up: 70, dir: -1, gnd: Fy + 4, seed: 3 }); c4Organs(a, F, l0[0], l0[1], 3, { v: 50, up: 90, dir: 1, gnd: Fy + 4, seed: 4 });
  for (const t of [0.16, 0.3, 0.46]) { const e = m7End('U', t); c4Organs(a, t, e[0], e[1], 2, { v: 45, up: 30, dir: -1, gnd: Fy + 4, seed: 10 + Math.round(t * 100) }); }
  if (a > F && a < F + 0.5) { const uu = m7End('U', a), ll = m7End('L', a), dd = Math.hypot(uu[0] - ll[0], uu[1] - ll[1]); if (dd < 70) for (let s = 0; s < 4; s++) { const n = Math.max(6, Math.round(dd / 2)), sag = (4 + 3 * s) * (1 - dd / 70); ctx.fillStyle = s % 2 ? C4_RED[2] : C4_RED[0]; for (let i = 0; i <= n; i++) { const t = i / n; ctx.fillRect(Math.round(lerp(uu[0], ll[0], t)), Math.round(lerp(uu[1], ll[1], t) + sag * Math.sin(Math.PI * t) + (s - 1.5) * 1.5), 2, 2); } } }
}
function m7Verity(T, lights) {      // Verity: lying on the floor, or (from the blow) the two halves
  const Fy = m7Fy(), r = T - M7W.hit;
  if (r < 0) {
    const L = v7Look(T), img = d6Lit(lights, 0.7, vrx(4, L.fi), 0.62); if (!img) return; const sk = L.shake ? Math.round((c6H(Math.floor(T * 40), 5) - 0.5) * 2.2 * L.shake) : 0;
    ctx.fillStyle = 'rgba(0,0,10,0.5)'; ctx.fillRect(-V7.X + 5, Fy + 1, 62, 2); ctx.drawImage(img, -V7.X + sk, Fy - 63); return;
  }
  const a = m7Warp(r), hv = v7Halves(v7Look(M7W.hit).fi, lights); if (!hv) return; m7Smear(a);
  for (const k of ['L', 'U']) { const p = v7At(k, a), pv = k === 'U' ? V7.pu : V7.pl; ctx.fillStyle = 'rgba(0,0,10,' + (0.45 * Math.max(0, 1 - p.h / 50)).toFixed(3) + ')'; ctx.fillRect(Math.round(p.x) - 14, Fy + 1, 28, 2);
    ctx.save(); ctx.translate(Math.round(p.x), Math.round(Fy - p.h)); ctx.rotate(p.a); ctx.drawImage(hv[k], -pv[0], -pv[1]); ctx.restore(); }
  m7Gore(T, a);
}

// ---- Mahoraga: the wheel behind his head, his picture (lit by the light of the moment), his eyes, his shadow
function m7Set(T) {      // the light he is in
  if (T >= M7W.fz - 0.25 && T < M7W.fe) return 'violet'; if (T >= M7W.hit && T < M7W.hit + 0.07) return 'white'; if (T >= M7W.wu + 0.3 && T < M7W.hit + 0.5) return 'gold'; return 'cold';
}
function m7Shadow(M) {      // his shadow along the floor, thrown to the left by the light of the door
  const sil = m7Sil(M.i); if (!sil) return; ctx.globalAlpha = 0.5; ctx.drawImage(sil, Math.round(M.x) - M7SO, m7Fy() + 1); ctx.globalAlpha = 1;
}
function m7Eyes(T, M, x, y, a) {      // the two eye slits light up gold (not while his arm covers his face in the blow)
  if (a <= 0.01 || M.mode === 'punch') return; const P = M7.frames[M.i];
  for (const [e, w] of [[P.eye1, 4], [P.eye2, 3]]) { const ex = x + Math.round(e[0]) - 1, ey = y + Math.round(e[1]); ctx.save(); ctx.globalAlpha = a * (0.9 + 0.1 * Math.sin(T * 9)); ctx.fillStyle = '#ffd36a'; ctx.fillRect(ex, ey, w, 2); ctx.fillStyle = '#fff4c8'; ctx.fillRect(ex + 1, ey, Math.max(1, w - 2), 1); ctx.restore(); const f = m7NotchK(T); c6Glow(ex + w / 2, ey + 1, 9 + 8 * f, '255,190,70', 0.5 * a * (1 + f)); }
}
function m7Body(T, o) {      // Mahoraga at T (o.wheel: how much of the wheel shows, o.eyes: how bright the eyes are)
  const M = m7Mah(T), Fy = m7Fy(), P = M7.frames[M.i], sk = M.held ? Math.round((c6H(Math.floor(T * 34), 7) - 0.5) * 3) : 0, x = Math.round(M.x) + sk, y = Fy - 136, k = m7NotchK(T);
  m7Shadow(M);
  const wa = o.wheel == null ? 1 : o.wheel, wx = x + Math.round(P.head[0]) + 4, wy = y + Math.round(P.head[1]) - 6, boost = (T > M7W.wu ? Math.min(1, (T - M7W.wu) / 0.7) * (T < M7W.hit ? 1 : Math.exp(-(T - M7W.hit) * 2.5)) : 0);
  c6Glow(wx, wy, 78, '255,200,100', wa * (0.3 + 0.35 * k + 0.4 * boost)); m7Wheel(wx, wy, 27, m7Ang(T), wa);
  const img = m7Lit(M.i, m7Set(T));
  if (img) { ctx.save(); ctx.beginPath(); ctx.rect(x - 20, Fy + 1, M7.w + 40, 9); ctx.clip(); ctx.globalAlpha = 0.17; ctx.translate(0, 2 * Fy + 2); ctx.scale(1, -1); ctx.drawImage(img, x, y); ctx.restore(); ctx.drawImage(img, x, y); }      // (a faint reflection in the polished floor, 9 px deep)
  m7Eyes(T, M, x, y, o.eyes == null ? 0 : o.eyes);
  return { x, y, P, M };
}

// ---- the STOP and the other lights of the scene
function m7StopFx(T) {      // the STOP: a violet bolt from Verity's raised hand, a ring that closes on the floor round Mahoraga's feet, three bands that run up his body; the ring breaks into shards when the wheel has turned
  const W = M7W, t0 = W.fz - 0.25; if (T < t0 || T > W.fe + 0.9) return; const M = m7Mah(T), P = M7.frames[M.i], Fy = m7Fy(), fx = Math.round(M.x + (P.footN[0] + P.footF[0]) / 2), fy = Fy + 3;
  if (T < W.fe) {
    const a = ease3(clamp01((T - t0) / 0.3)), pl = 0.75 + 0.25 * Math.sin(T * 30), rx = 12 + 36 * a, ry = rx * 0.13;
    c6Bolt(-3, Fy - 44, Math.round(M.x + P.chest[0]) - 6, Fy - 136 + Math.round(P.chest[1]), 3, T, 'rgba(210,160,255,' + (0.9 * a).toFixed(2) + ')'); c6Glow(-3, Fy - 44, 16, '190,120,255', 0.7 * a * pl);
    ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.lineWidth = 2; ctx.strokeStyle = 'rgba(200,150,255,' + (0.85 * pl).toFixed(2) + ')'; ctx.beginPath(); ctx.ellipse(fx, fy, rx, ry, 0, 0, 6.2832); ctx.stroke(); ctx.lineWidth = 1; ctx.strokeStyle = 'rgba(255,255,255,0.5)'; ctx.beginPath(); ctx.ellipse(fx, fy, rx - 2, Math.max(0.5, ry - 0.5), 0, 0, 6.2832); ctx.stroke();
    for (let i = 0; i < 3; i++) { const u = (T - t0) * 1.6 - i * 0.28; if (u < 0 || u > 1) continue; ctx.strokeStyle = 'rgba(190,130,255,' + (0.6 * (1 - u)).toFixed(2) + ')'; ctx.beginPath(); ctx.ellipse(fx, fy - u * 112, 26 * (1 - 0.3 * u), 3, 0, 0, 6.2832); ctx.stroke(); } ctx.restore();
  } else {
    const a = T - W.fe; ctx.save(); ctx.globalCompositeOperation = 'lighter'; for (let i = 0; i < 18; i++) { const an = i / 18 * 6.2832 + c4R(i, 71) * 0.3, r = c4R(i, 72), x = fx + Math.cos(an) * 48 + Math.cos(an) * (30 + 50 * r) * a, y = fy + Math.sin(an) * 6 - (20 + 60 * r) * a + 160 * a * a; ctx.globalAlpha = Math.max(0, 1 - a / 0.85); ctx.fillStyle = i % 3 ? '#c896ff' : '#ffffff'; ctx.fillRect(Math.round(x), Math.round(y), 2 + (i & 1), 1 + (i % 3 === 0 ? 1 : 0)); } ctx.restore();
  }
}
function m7NotchFx(T) {      // the wheel turns a notch: a ring of gold runs out of it
  for (const t of M7N) { const a = T - t; if (a < 0 || a > 0.5) continue; const w = m7WheelPos(T); v6Ring(w[0], w[1], 27 + a * 150, 1 - a / 0.5, '255,214,140'); }
}
function m7FistFx(T, b) {      // the fist: a hot light round it while the arm is up and in the blow, white lines out of the point of contact for a moment
  const P = b.P, W = M7W; if (T >= W.wu + 0.3 && T < W.hit + 0.3) { const k = Math.min(1, (T - W.wu - 0.3) / 0.7) * (T < W.hit ? 1 : Math.max(0, 1 - (T - W.hit) / 0.3)); c6Glow(b.x + P.fist[0], b.y + P.fist[1], 26, '255,210,120', 0.5 * k * (0.8 + 0.2 * Math.sin(T * 25))); }
  const r = T - W.hit; if (r >= 0 && r < 0.3) { const k = r / 0.3, Fy = m7Fy(); ctx.save(); ctx.globalCompositeOperation = 'lighter'; for (let i = 0; i < 16; i++) { const an = i / 16 * 6.2832 + c4R(i, 81) * 0.3, r0 = 8 + 6 * c4R(i, 82), r1 = r0 + (14 + 40 * c4R(i, 83)) * Math.sqrt(k); ctx.globalAlpha = 1 - k; c6Line(Math.round(Math.cos(an) * r0), Math.round(Fy - 10 + Math.sin(an) * r0 * 0.7), Math.round(Math.cos(an) * r1), Math.round(Fy - 10 + Math.sin(an) * r1 * 0.7), '#fff0c8'); } ctx.restore(); }
}

// ---- the stage as a whole, at the scene time T, seen by the camera cam = { z, x, y, sy } (the stage point (x, y) is put on the screen's middle column at height sy, z times as big); o: { glow, shaft, wheel, eyes }
function m7Stage(T, cam, o) {
  o = o || {}; const sh = m7Shake(T), jx = sh < 0.3 ? 0 : Math.round((c6H(Math.floor(T * 36), 11) - 0.5) * 2 * sh), jy = sh < 0.3 ? 0 : Math.round((c6H(Math.floor(T * 36), 12) - 0.5) * 2 * sh);
  ctx.save(); ctx.translate(jx, jy); m7Hall(T, cam, o); m7CamOn(cam);
  for (const p of M7P) { m7Dust(T, p.t, p.x, 12, { w: 26, h: 10, life: 0.9, big: 7, col: '150,170,220', seed: p.k }); c4Spray(T, p.t, p.x, m7Fy() - 1, 5, { v: 40, up: 1.3, dir: 0, life: 0.45, cols: M7_GRAY, sz: 1, seed: p.k, gnd: m7Fy() + 2, g: 300 }); }
  m7Verity(T, M7L.cold); const b = m7Body(T, o); m7StopFx(T); m7NotchFx(T); m7FistFx(T, b); c4Cam0(); ctx.restore();
}

// ---- the shots: the camera and what is laid over the stage
const C7_TALK = [{ t: M7W.go + 0.7, d: 1.9, w: 'VERITY', a: '...WHAT ARE YOU?', b: '' }, { t: M7W.tr + 1.45, d: 1.2, w: 'VERITY', a: 'STOP.', b: '' }, { t: M7W.fe + 0.15, d: 1.3, w: 'VERITY', a: 'IT... ADAPTED.', b: '' }, { t: M7W.c1 + 0.05, d: 0.9, w: 'VERITY', a: 'NO...', b: '' }];
const c7Shot = T => { let st = C7_SEQ[C7_SEQ.length - 1]; for (const s of C7_SEQ) if (T >= s.t0 && T < s.t0 + s.d) st = s; return st; };
const m7WheelPos = T => { const M = m7Mah(T), P = M7.frames[M.i]; return [Math.round(M.x) + Math.round(P.head[0]) + 4, m7Fy() - 136 + Math.round(P.head[1]) - 6]; };
function m7Cam(T) {      // where the camera is at T
  const Fy = m7Fy(), st = c7Shot(T), t1 = T - st.t0, at = (z, x, h, sy) => ({ z, x, y: Fy - h, sy }), flat = x => ({ z: 1, x, y: VH / 2, sy: VH / 2 });
  switch (st.k) {
    case 'wide': return flat(214 - 5 * t1 / st.d);
    case 'face': return at(4, -26, 11, VH * 0.58);
    case 'track': return flat(96);
    case 'stop': { if (T >= M7W.fz + 0.8 && T < M7W.fz + 1.35) { const w = m7WheelPos(T); return { z: 3, x: w[0], y: w[1], sy: VH * 0.5 }; } return flat(70); }
    case 'wind': return T < M7W.wu ? flat(60) : T < M7W.c1 ? at(2, 85, 95, VH * 0.5) : T < M7W.c2 ? at(4, -26, 11, VH * 0.58) : at(2, 100, 106, VH * 0.45);
    case 'punch': return at(2, 6, 30, 66);
    case 'break': return flat(-10 - 25 * ease3(t1 / 2.4));
    default: return t1 < 3.6 ? flat(-28) : at(3, Math.round(M7W.x0f + M7.frames[M7.clips.idle[0]].head[0] - 6), 88, VH * 0.5);      // (the last cut: his head and the wheel, 3 times as big)
  }
}
function c7Fade(T, st, t1, fin, fout) { c6Black(fin ? 1 - t1 / fin : 0); c6Black(fout ? (t1 - (st.d - fout)) / fout : 0); }
function c7SHall(now, dt, T, st, t1) {      // every shot that is the stage seen by the camera
  const cam = m7Cam(T), o = { wheel: ease3(clamp01((T - 3.2) / 1.2)), eyes: ease3(clamp01((T - M7W.eyes) / 0.5)), glow: 0.55 + 0.25 * Math.min(1, Math.max(0, (T - M7W.wu) / 1.5)), shaft: 0.7 };
  if (cam.z === 4) { o.glow = 0.3; o.shaft = 0.5; }
  m7Stage(T, cam, o);
  { const k = m7NotchK(T); if (k > 0.02) c6White(0.28 * k * k); }      // (the flash of the wheel)
  const r = T - M7W.hit; if (r >= 0 && r < 0.05) { ctx.save(); ctx.globalCompositeOperation = 'difference'; ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, VW, VH); ctx.restore(); } else if (r >= 0) c6White(0.9 * Math.exp(-r * 16));      // (the flash of the blow: the picture is inverted for 3 frames, then white fades)
  if (T >= M7W.fz - 0.25 && T < M7W.fe + 0.2) { const k = ease3(clamp01((T - M7W.fz + 0.25) / 0.3)) * (1 - ease3(clamp01((T - M7W.fe) / 0.2))); ctx.fillStyle = 'rgba(120,60,220,' + (0.16 * k).toFixed(3) + ')'; ctx.fillRect(0, 0, VW, VH); }      // (the violet of the STOP over everything)
  msFinish(0.8); if (st.k === 'wide') c7Fade(T, st, t1, 0.8, 0);
  if (st.k === 'after') c7Fade(T, st, t1, 0, 0.9);
}
function m7Warm(T) {      // while the title shows, the pictures the scene will need are made a few at a time (his lit pictures, Verity cut in two, the table of the halves' flight)
  const n = M7.frames.length, i = Math.floor(T * 40); if (i < n) { m7Lit(i, 'cold'); m7Sil(i); } else if (i < n + 20) m7Lit(M7.clips.windup[0] + i - n, 'gold'); else if (i === n + 21) m7Lit(M7.clips.punch[0] + 5, 'white'); else if (i === n + 26) { v7Sim(); v7Halves(v7Look(M7W.hit).fi, M7L.cold); } else if (i === n + 27) m7Lit(M7.clips.walk[0] + M7W.fk % M7W.cyc, 'violet');
}
function c7STitle(now, dt, T, st, t1) {
  m7Warm(T);
  ctx.fillStyle = '#030308'; ctx.fillRect(0, 0, VW, VH); const a = ease3(clamp01(t1 / 0.9)) * (1 - ease3(clamp01((t1 - (st.d - 0.6)) / 0.6))), cy = Math.round(VH * 0.46);
  c6Glow(VW / 2, cy, VW * 0.5, '255,196,90', 0.32 * a); m7Wheel(VW / 2, cy, Math.round(VH * 0.3), 0.25 + 0.3 * t1 + 0.7854 * ease3(clamp01((t1 - 1.5) / 0.4)), a * 0.85);
  d6Title('CHAPTER 3', VW / 2, cy - 2, 16, ease3(clamp01((t1 - 0.8) / 0.7)) * (1 - ease3(clamp01((t1 - (st.d - 0.6)) / 0.6))), '255,200,100'); d6Title('THE DIVINE GENERAL', VW / 2, cy + 16, 8, ease3(clamp01((t1 - 1.5) / 0.7)) * (1 - ease3(clamp01((t1 - (st.d - 0.6)) / 0.6))), '255,200,100');
  msFinish(1);
}
const c7Shots = { title: c7STitle, wide: c7SHall, face: c7SHall, track: c7SHall, stop: c7SHall, wind: c7SHall, punch: c7SHall, break: c7SHall, after: c7SHall };

// ---- the sounds and the speech of the scene (each fires once: the window keeps a skipped step from firing late)
function c7Dlg(name, a, n) {      // the speech box, in the upper left corner (only Verity speaks, and Mahoraga with his wheel is on the right): as wide as the whole line, whatever has been typed so far
  const x = 6, y = 14, h = 20, w = Math.max(name.length * 8 + 10, a.length * 8 + 18); ctx.fillStyle = 'rgba(8,6,22,0.88)'; ctx.fillRect(x, y, w, h); ctx.fillStyle = '#9d8cff'; ctx.fillRect(x, y, w, 2); ctx.fillRect(x, y + h - 2, w, 2); ctx.fillRect(x, y, 2, h); ctx.fillRect(x + w - 2, y, 2, h);
  ctx.fillStyle = '#2a2060'; ctx.fillRect(x, y - 10, name.length * 8 + 10, 10); ctx.fillStyle = '#9d8cff'; ctx.fillRect(x, y - 10, name.length * 8 + 10, 2); pxt(name, x + 5, y - 2, '#ffd34d', 8); pxt(a.slice(0, Math.max(0, n)), x + 8, y + 13, '#ffffff', 8);
}
function c7Talk(T) {      // the speech box of the line that is on now (the letters come out as in every scene, with the blips of the speaker's voice)
  const L = C7_TALK, i = L.findIndex(s => T >= s.t && T < s.t + s.d); if (i < 0) return; const s = L[i], n = Math.floor((T - s.t) * TN_RATE), c = story.c7;
  if (c.vi !== i) { c.vi = i; c.vc = 0; } while (c.vc < Math.min(n, s.a.length)) { c.vc++; if (s.a[c.vc - 1] !== ' ') snd('tvoice', 0); } c7Dlg(s.w, s.a, n);
}
function v7Times() {      // when (in the scene) the halves first lie on the floor and are torn apart: found once from the table of the flight
  if (V7.t) return V7.t; const S = v7Sim(), F = V7.fold, first = k => { const i = S.slide[k].indexOf(1); return i < 0 ? 1.2 : F + i * S.dt; };
  return V7.t = { U: M7W.hit + m7Unwarp(first('U')), L: M7W.hit + m7Unwarp(first('L')), tear: M7W.hit + m7Unwarp(F) };
}
const m7Unwarp = a => { let lo = 0, hi = 6; for (let i = 0; i < 30; i++) { const m = (lo + hi) / 2; if (m7Warp(m) < a) lo = m; else hi = m; } return (lo + hi) / 2; };      // the real seconds after the blow at which the blow's own time is a
function c7Events(T, ev) {
  const W = M7W;
  ev('drone', 0.15, () => snd('c7drone'), 1.0); ev('tclick', 1.7, () => snd('c7wheel', 0), 0.6); ev('eyes', W.eyes, () => snd('c7eyes'), 1.0);
  ev('go', W.go + 0.03, () => snd('c7cloth', 0), 0.6);
  for (const p of M7P) ev('step' + p.k, p.t, () => snd('c7step', p.k % M7W.cyc === 0 ? 1 : 0), 0.4);
  ev('stop', W.fz - 0.25, () => snd('c7stop'), 0.8); ev('notch', M7N[0], () => snd('c7wheel', 1), 0.8); ev('shatter', W.fe, () => snd('c7shatter'), 0.8);
  ev('rise', W.wu, () => snd('c7rise'), 1.2); ev('swing', W.pn + 0.07, () => snd('c7whoosh'), 0.3);
  const V = v7Times(); ev('smash', W.hit, () => { snd('c7smash'); snd('c4crater'); }, 0.6); ev('tear', V.tear, () => snd('c7tear'), 0.6);
  ev('landL', V.L, () => { snd('c4guts'); snd('c7thud', 0); }, 1.2); ev('landU', V.U, () => { snd('c4guts'); snd('c7thud', 1); snd('c7slide'); }, 1.2);
  ev('rc', W.rc, () => snd('c7cloth', 1), 0.6); ev('notch2', M7N[1], () => snd('c7wheel', 1), 0.8);
}
function c7Card(now, T) {      // CHAPTER 3: THE DIVINE GENERAL, TO BE CONTINUED
  const t = T - C7.card; ctx.save(); ctx.imageSmoothingEnabled = false; ctx.fillStyle = '#000'; ctx.fillRect(0, 0, VW, VH); once2('card', () => { snd('msting'); storyDone6(); }); ctx.globalAlpha = clamp01((t + 0.1) / 1.0);
  pxt('CHAPTER 3', VW / 2, Math.round(VH / 2) - 10, '#ffffff', 16, 'center'); pxt('THE DIVINE GENERAL', VW / 2, Math.round(VH / 2) + 8, '#ffd86a', 8, 'center'); pxt('TO BE CONTINUED', VW / 2, Math.round(VH / 2) + 26, '#ffd34d', 8, 'center'); if (t > 2.2 && Math.floor(now / 600) % 2 === 0) pxt('TAP TO CONTINUE', VW / 2, VH - 8, '#9d8cff', 8, 'center'); ctx.globalAlpha = 1; ctx.restore();
}

// ---- the chapter: start, one frame, taps, the card
function startC7(slot) { audio(); show('story'); story = { slot, t0: pnow(), battle: false, T: 0, ev: {}, shk: null, c7: { vi: -1, vc: 0 } }; alley = true; court = false; track = false; wx = 0; }
function c7Frame(now, dt) {
  const T = story.T = Math.max(0, now - story.t0) / 1000, ev = (k, t, f, win) => { if (T >= t && T < t + (win || 0.5)) once2(k, f); };
  if (T >= C7.card) { c7Card(now, T); return; }
  wx = 0; ctx.save(); ctx.imageSmoothingEnabled = false; ctx.fillStyle = '#000'; ctx.fillRect(0, 0, VW, VH);
  const st = c7Shot(T); c7Shots[st.k](now, dt, T, st, T - st.t0); c7Events(T, ev); c7Talk(T); ctx.restore();
}
function c7Skip() {      // a tap: on to the next cut; on the card (after its first 1.2 s) back to the saves
  const T = story.T; if (T >= C7.card + 1.2) { show('saves'); renderSaves(); return; } const n = C7_CUTS.find(x => x > T + 0.05); if (n !== undefined) story.t0 = pnow() - n * 1000;
}
function storyDone6() { if (!story) return; const a = loadSaves(); if (a[story.slot]) a[story.slot].c7 = true; storeSaves(a); }      // (chapter 3's scene is over: its card has been reached)
window.__c7At = t => { if (!story) return; if (!story.c7) startC7(story.slot); story.t0 = pnow() - (t || 0) * 1000; story.ev = {}; };      // test hook: start the chapter (or jump in it) at scene time t
window.__c7T = () => story ? story.T : -1;
