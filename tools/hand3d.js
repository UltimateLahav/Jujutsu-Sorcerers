'use strict';
// ================================================================ hand3d.js: the hands of chapter 4 as small 3D models, drawn once (offline) into pixel pictures.
// A hand is made of round cones (a bone with its skin), balls (knuckles) and flat ellipsoids (nails) blended into one shape (signed distance fields). Every pixel is ray marched from the front (no perspective), lit from the
// upper left with soft shadows and occlusion, cut into the tones of the skin with a dither between two tones, and given a dark line at the edges.  hands_make.js uses this to make the pictures the game reads.
const zlib = require('zlib');
// ---------------------------------------------------------------- vectors and matrices (3 x 3 as 9 numbers, row by row)
const add = (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]], sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]], mul = (a, s) => [a[0] * s, a[1] * s, a[2] * s], dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const len = a => Math.hypot(a[0], a[1], a[2]), norm = a => { const l = len(a) || 1; return [a[0] / l, a[1] / l, a[2] / l]; }, cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const mm = (A, B) => { const o = []; for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) o.push(A[i * 3] * B[j] + A[i * 3 + 1] * B[3 + j] + A[i * 3 + 2] * B[6 + j]); return o; }, mv = (A, v) => [A[0] * v[0] + A[1] * v[1] + A[2] * v[2], A[3] * v[0] + A[4] * v[1] + A[5] * v[2], A[6] * v[0] + A[7] * v[1] + A[8] * v[2]], tp = A => [A[0], A[3], A[6], A[1], A[4], A[7], A[2], A[5], A[8]];
const Rx = a => { const c = Math.cos(a), s = Math.sin(a); return [1, 0, 0, 0, c, -s, 0, s, c]; }, Ry = a => { const c = Math.cos(a), s = Math.sin(a); return [c, 0, s, 0, 1, 0, -s, 0, c]; }, Rz = a => { const c = Math.cos(a), s = Math.sin(a); return [c, -s, 0, s, c, 0, 0, 0, 1]; };
const I3 = [1, 0, 0, 0, 1, 0, 0, 0, 1], lerp = (a, b, t) => a + (b - a) * t, clamp = (v, a, b) => Math.max(a, Math.min(b, v));
// ---------------------------------------------------------------- the shapes. Each has a material (1 skin, 2 nail, 3 sleeve, 4 flesh, 5 bone, 6 stretched skin, 7 claw), k = how much it blends into the others, and a box around it
const MAT = { skin: 1, nail: 2, sleeve: 3, flesh: 4, bone: 5, pale: 6, claw: 7, curse: 8 };
function cone(a, b, r1, r2, mat, k) {      // a bone with a skin of radius r1 at a and r2 at b
  const ba = sub(b, a), l2 = dot(ba, ba), rr = r1 - r2, R = Math.max(r1, r2);
  return { t: 0, mat, k: k === undefined ? 5 : k, ax: a[0], ay: a[1], az: a[2], bx: ba[0], by: ba[1], bz: ba[2], r1, r2, l2, rr, a2: l2 - rr * rr, il2: 1 / l2, sr: Math.sign(rr), cx: (a[0] + b[0]) / 2, cy: (a[1] + b[1]) / 2, cz: (a[2] + b[2]) / 2, ex: Math.abs(ba[0]) / 2 + R, ey: Math.abs(ba[1]) / 2 + R, ez: Math.abs(ba[2]) / 2 + R };
}
function ell(c, r, M, mat, k) {      // an ellipsoid with the radii r along the columns of M (M: local -> world)
  const R = Math.max(r[0], r[1], r[2]); return { t: 1, mat, k: k === undefined ? 5 : k, c0: c[0], c1: c[1], c2: c[2], rx: r[0], ry: r[1], rz: r[2], m: tp(M), cx: c[0], cy: c[1], cz: c[2], ex: R, ey: R, ez: R, mn: Math.min(r[0], r[1], r[2]) };
}
const ball = (c, r, mat, k) => ell(c, [r, r, r], I3, mat, k);
function dist(s, x, y, z) {
  const d = dist0(s, x, y, z); return s.clip ? Math.max(d, s.clip[0] * x + s.clip[1] * y + s.clip[2] * z - s.clip[3]) : d;
}
function dist0(s, x, y, z) {
  if (s.t === 0) {
    const pax = x - s.ax, pay = y - s.ay, paz = z - s.az, yy = pax * s.bx + pay * s.by + paz * s.bz, zz = yy - s.l2, qx = pax * s.l2 - s.bx * yy, qy = pay * s.l2 - s.by * yy, qz = paz * s.l2 - s.bz * yy;
    const x2 = qx * qx + qy * qy + qz * qz, y2 = yy * yy * s.l2, z2 = zz * zz * s.l2, kk = s.sr * s.rr * s.rr * x2;
    if (Math.sign(zz) * s.a2 * z2 > kk) return Math.sqrt(x2 + z2) * s.il2 - s.r2;
    if (Math.sign(yy) * s.a2 * y2 < kk) return Math.sqrt(x2 + y2) * s.il2 - s.r1;
    return (Math.sqrt(x2 * s.a2 * s.il2) + yy * s.rr) * s.il2 - s.r1;
  }
  const dx = x - s.c0, dy = y - s.c1, dz = z - s.c2, m = s.m, lx = m[0] * dx + m[1] * dy + m[2] * dz, ly = m[3] * dx + m[4] * dy + m[5] * dz, lz = m[6] * dx + m[7] * dy + m[8] * dz;
  const ax = lx / s.rx, ay = ly / s.ry, az = lz / s.rz, k0 = Math.sqrt(ax * ax + ay * ay + az * az), bx = ax / s.rx, by = ay / s.ry, bz = az / s.rz, k1 = Math.sqrt(bx * bx + by * by + bz * bz);
  return k1 < 1e-9 ? -s.mn : k0 * (k0 - 1) / k1;
}
let GM = 0;      // (the material of the nearest shape: set by map)
function map(S, x, y, z) {      // the distance to the whole scene (a list of shapes blended one after the other)
  const n = S.length; let acc = 1e9, mat = 0, md = 1e9;
  for (let i = 0; i < n; i++) {
    const s = S[i], ddx = Math.abs(x - s.cx) - s.ex, ddy = Math.abs(y - s.cy) - s.ey, ddz = Math.abs(z - s.cz) - s.ez, bx = ddx > 0 ? ddx : 0, by = ddy > 0 ? ddy : 0, bz = ddz > 0 ? ddz : 0;
    if (Math.sqrt(bx * bx + by * by + bz * bz) >= acc + s.k) continue;      // (too far to matter)
    const d = dist(s, x, y, z); if (d < md) { md = d; mat = s.mat; }
    if (s.k > 0) { const h = Math.max(s.k - Math.abs(acc - d), 0) / s.k; acc = Math.min(acc, d) - h * h * s.k * 0.25; } else if (d < acc) acc = d;
  }
  GM = mat; return acc;
}
// ---------------------------------------------------------------- the picture: orthographic, looking along -z; world unit = 1 mm; cam = { w, h, s (pixels per unit), ox, oy (the pixel of the world point (0, 0)) }
const BAY = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];
function bounds(S) { let a = [1e9, 1e9, 1e9], b = [-1e9, -1e9, -1e9]; for (const s of S) { a = [Math.min(a[0], s.cx - s.ex - s.k), Math.min(a[1], s.cy - s.ey - s.k), Math.min(a[2], s.cz - s.ez - s.k)]; b = [Math.max(b[0], s.cx + s.ex + s.k), Math.max(b[1], s.cy + s.ey + s.k), Math.max(b[2], s.cz + s.ez + s.k)]; } return { a, b }; }
function render(S, cam, o) {
  o = o || {}; const { w, h, s: sc, ox, oy } = cam, L = norm(o.light || [-0.62, 0.55, 0.5]), bd = bounds(S), N = w * h, tone = new Float32Array(N), mat = new Uint8Array(N), zc = new Float32Array(N).fill(-1e9), hit = new Uint8Array(N), shd = new Float32Array(N);
  const zTop = bd.b[2] + 4, zBot = bd.a[2] - 4, E = 0.4, face = o.face === undefined ? bd.a[2] - 30 : o.face;
  const nrm = (x, y, z) => { const a = map(S, x + E, y - E, z - E), b = map(S, x - E, y - E, z + E), c = map(S, x - E, y + E, z - E), d = map(S, x + E, y + E, z + E); return norm([a - b - c + d, -a - b + c + d, -a + b - c + d]); };
  const shadow = (x, y, z, kk) => { let res = 1, t = 0.8; for (let i = 0; i < 30 && t < 110; i++) { const d = map(S, x + L[0] * t, y + L[1] * t, z + L[2] * t); if (d < 0.05) return 0; res = Math.min(res, kk * d / t); t += clamp(d, 0.6, 5); } return clamp(res, 0, 1); };
  for (let py = 0; py < h; py++) for (let px = 0; px < w; px++) {
    const X = (px + 0.5 - ox) / sc, Y = -(py + 0.5 - oy) / sc, i = py * w + px;
    if (X < bd.a[0] - 3 || X > bd.b[0] + 3 || Y < bd.a[1] - 3 || Y > bd.b[1] + 3) { if (o.shadowFace) { const sx = X, sy = Y; if (sx > bd.a[0] - 40 && sx < bd.b[0] + 40 && sy > bd.a[1] - 40 && sy < bd.b[1] + 40) shd[i] = 1 - shadow(sx, sy, face, 6); } continue; }
    let z = zTop, hitz = null;
    for (let st = 0; st < 100 && z > zBot; st++) { const d = map(S, X, Y, z); if (d < 0.03) { hitz = z; break; } z -= d * 0.9; }
    if (hitz === null) { if (o.shadowFace) shd[i] = 1 - shadow(X, Y, face, 6); continue; }
    const m = GM, n = nrm(X, Y, hitz); hit[i] = 1; mat[i] = m; zc[i] = hitz;
    let occ = 0, sca = 1; for (let k = 1; k <= 5; k++) { const r = k * 1.7, d = map(S, X + n[0] * r, Y + n[1] * r, hitz + n[2] * r); occ += (r - d) * sca; sca *= 0.82; }
    const ao = clamp(1 - occ * 0.16, 0, 1), sh = shadow(X + n[0] * 0.6, Y + n[1] * 0.6, hitz + n[2] * 0.6, 7), ndl = dot(n, L), wrap = Math.pow(clamp((ndl + 0.08) / 1.08, 0, 1), 0.85);
    const H2 = norm([L[0], L[1], L[2] + 1]), spec = Math.pow(Math.max(0, dot(n, H2)), 40), rim = Math.pow(1 - Math.max(0, n[2]), 3) * Math.max(0, -n[0] * 0.5 + 0.5) * 0.12;
    tone[i] = (m === 3 ? 0.72 : 1) * clamp(0.05 + 0.64 * wrap * (0.25 + 0.75 * sh) * (0.4 + 0.6 * ao) + 0.1 * ao + rim + (m === 2 ? 0.22 * spec + 0.06 : 0.1 * spec), 0, 1);
  }
  for (let pass = 0; pass < (o.smooth === undefined ? 2 : o.smooth); pass++) { const t2 = tone.slice(); for (let py = 0; py < h; py++) for (let px = 0; px < w; px++) { const i = py * w + px; if (!hit[i]) continue; let sum = tone[i] * 2, wt = 2; for (const [dx, dy] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) { const qx = px + dx, qy = py + dy; if (qx < 0 || qy < 0 || qx >= w || qy >= h) continue; const j = qy * w + qx; if (hit[j] && mat[j] === mat[i] && Math.abs(zc[j] - zc[i]) < 3) { sum += tone[j]; wt++; } } t2[i] = sum / wt; } tone.set(t2); }
  // levels: 5 tones with a short dither between two tones; the dark outline where the shape ends or where it hides what is behind it
  const lvl = new Uint8Array(N);
  for (let py = 0; py < h; py++) for (let px = 0; px < w; px++) {
    const i = py * w + px; if (!hit[i]) continue; const v = tone[i] * 4.999, lo = Math.floor(v), f = v - lo, th = (BAY[(py & 3) * 4 + (px & 3)] + 0.5) / 16, ff = clamp((f - 0.38) / 0.24, 0, 1);
    lvl[i] = Math.min(4, lo + (ff > th ? 1 : 0));
  }
  const thr = o.edge === undefined ? 5 : o.edge;
  for (let py = 0; py < h; py++) for (let px = 0; px < w; px++) {
    const i = py * w + px; if (!hit[i]) continue; let edge = false;
    for (const [dx, dy] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) { const qx = px + dx, qy = py + dy; if (qx < 0 || qy < 0 || qx >= w || qy >= h) continue; const j = qy * w + qx; if (!hit[j] || zc[j] > zc[i] + thr) { edge = true; break; } }
    if (edge) lvl[i] = 5;
  }
  return { w, h, hit, mat, lvl, shd, zc };
}
// ---------------------------------------------------------------- pictures for looking at
const hx = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16));
const RAMPS = {
  8: ['#9a5a48', '#d08c6c', '#f2b894', '#fdd4b0', '#ffe9d0', '#5a2820'],
  1: ['#9a5a48', '#d08c6c', '#f2b894', '#fdd4b0', '#ffe9d0', '#5a2820'], 2: ['#b8706a', '#e8a8a0', '#f4c8bc', '#fce4dc', '#fff6f0', '#7a3a36'], 3: ['#0c1428', '#1c2a52', '#2e3f74', '#44589a', '#6678b8', '#060a18'],
  4: ['#3c0810', '#6e0e1a', '#a81c28', '#d4404c', '#f07078', '#240408'], 5: ['#a89c8c', '#cfc4b2', '#f0e6d6', '#fff8ec', '#ffffff', '#6a5e50'], 6: ['#b87a6a', '#e0a898', '#f4c8b4', '#fadcc8', '#fff0e4', '#6a3a30'], 7: ['#0a0608', '#16101a', '#2c2238', '#4a3c5c', '#6a5a88', '#000000'],
};
function toRGBA(r, bg) {
  const out = Buffer.alloc(r.w * r.h * 4), B = bg ? hx(bg) : [20, 10, 16];
  for (let i = 0; i < r.w * r.h; i++) { let c; if (r.hit[i]) c = hx(RAMPS[r.mat[i]][r.lvl[i]]); else { const s = r.shd[i]; c = [Math.round(B[0] * (1 - 0.5 * s)), Math.round(B[1] * (1 - 0.5 * s)), Math.round(B[2] * (1 - 0.5 * s))]; } out[i * 4] = c[0]; out[i * 4 + 1] = c[1]; out[i * 4 + 2] = c[2]; out[i * 4 + 3] = 255; }
  return out;
}
const CRC = (() => { const t = new Uint32Array(256); for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; t[n] = c >>> 0; } return t; })();
const crc32 = buf => { let c = 0xffffffff; for (let i = 0; i < buf.length; i++) c = CRC[(c ^ buf[i]) & 255] ^ (c >>> 8); return (c ^ 0xffffffff) >>> 0; };
function png(w, h, rgba, k) {      // an RGBA picture as a PNG file (k: how many times to enlarge it, no smoothing)
  k = k || 1; const W = w * k, H = h * k, raw = Buffer.alloc((W * 4 + 1) * H);
  for (let y = 0; y < H; y++) { raw[y * (W * 4 + 1)] = 0; for (let x = 0; x < W; x++) { const s = ((Math.floor(y / k)) * w + Math.floor(x / k)) * 4, d = y * (W * 4 + 1) + 1 + x * 4; raw[d] = rgba[s]; raw[d + 1] = rgba[s + 1]; raw[d + 2] = rgba[s + 2]; raw[d + 3] = rgba[s + 3]; } }
  const chunk = (t, d) => { const b = Buffer.alloc(12 + d.length); b.writeUInt32BE(d.length, 0); b.write(t, 4, 'latin1'); d.copy(b, 8); b.writeUInt32BE(crc32(b.subarray(4, 8 + d.length)), 8 + d.length); return b; };
  const ih = Buffer.alloc(13); ih.writeUInt32BE(W, 0); ih.writeUInt32BE(H, 4); ih[8] = 8; ih[9] = 6;
  return Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk('IHDR', ih), chunk('IDAT', zlib.deflateSync(raw)), chunk('IEND', Buffer.alloc(0))]);
}
module.exports = { add, sub, mul, dot, len, norm, cross, mm, mv, tp, Rx, Ry, Rz, I3, lerp, clamp, MAT, cone, ell, ball, dist, map, render, RAMPS, toRGBA, png, hx };
