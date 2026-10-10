// Procedural 64x64 pixel-art people for Jujutsu Sorcerers, in the same 16-bit look as Gojo: dark outlines, four tones per colour, light from the upper right.
// makeHumans(document) -> five people, each { walk[8], run[8], shock, parts{head,torso,arm,leg}, sp, rs, wl, rl }. Every frame is 64x64 with the feet on row 62.
// Each person is a little skeleton (hip, knees, ankles, shoulders, elbows) driven by a walk / run cycle; every body part is a shaded capsule or ellipse.
function makeHumans(doc) {
  const N = 64, LX = 0.5, LY = -0.55, LZ = 0.67, RAD = Math.PI / 180, GY = 63;
  const hex = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16)), pack = c => (255 << 24) | (c[2] << 16) | (c[1] << 8) | c[0], K = h => pack(hex(h));
  const toHsl = ([r, g, b]) => { r /= 255; g /= 255; b /= 255; const mx = Math.max(r, g, b), mn = Math.min(r, g, b), l = (mx + mn) / 2; let h = 0, s = 0; if (mx !== mn) { const d = mx - mn; s = l > 0.5 ? d / (2 - mx - mn) : d / (mx + mn); h = (mx === r ? (g - b) / d + (g < b ? 6 : 0) : mx === g ? (b - r) / d + 2 : (r - g) / d + 4) * 60; } return [h, s, l]; };
  const fromHsl = (h, s, l) => { const f = n => { const k = (n + h / 30) % 12, a = s * Math.min(l, 1 - l); return Math.round(255 * (l - a * Math.max(-1, Math.min(k - 3, 9 - k, 1)))); }; return [f(0), f(8), f(4)]; };
  const MC = {}, cl = (v, a, b) => Math.max(a, Math.min(b, v));
  function M(h, far = 0) {                                    // a material: shadow, shade, mid, light (cooler in the dark, warmer in the light) + a dark outline colour
    const k = h + far; if (MC[k]) return MC[k]; const [hh, s, l0] = toHsl(hex(h)), l = Math.max(0.06, l0 - far), q = hh >= 8 && hh <= 38 && l0 > 0.38 && s > 0.2 ? 0.3 : 1;      // skin tones keep their hue in the shade (a bigger shift looks like blood)
    const t = (dl, dh, ds) => pack(fromHsl((hh + dh * q + 360) % 360, cl(s * (dl < 0 && q < 1 ? 0.6 : 1) + ds, 0, 1), cl(l + dl, 0.04, 0.95)));
    const m = [t(-0.26, -16, 0.05), t(-0.12, -8, 0.02), t(0, 0, 0), t(0.15, 7, -0.03)]; m.o = pack(fromHsl((hh - 14 * q + 360) % 360, s * 0.55, Math.max(0.04, l * 0.2))); return (MC[k] = m);
  }
  const cap = (x0, y0, x1, y1, r0, r1 = r0) => { const m = Math.max(r0, r1), dx = x1 - x0, dy = y1 - y0, l2 = dx * dx + dy * dy || 1; return { b: [Math.min(x0, x1) - m, Math.min(y0, y1) - m, Math.max(x0, x1) + m, Math.max(y0, y1) + m],
    f(x, y) { const t = cl(((x - x0) * dx + (y - y0) * dy) / l2, 0, 1), ox = x - x0 - dx * t, oy = y - y0 - dy * t, r = r0 + (r1 - r0) * t, d2 = ox * ox + oy * oy; return d2 > r * r ? null : [ox / r, oy / r, Math.sqrt(1 - d2 / (r * r))]; } }; };
  const ell = (cx, cy, rx, ry) => ({ b: [cx - rx, cy - ry, cx + rx, cy + ry], f(x, y) { const ox = (x - cx) / rx, oy = (y - cy) / ry, d2 = ox * ox + oy * oy; return d2 > 1 ? null : [ox, oy, Math.sqrt(1 - d2)]; } });
  const uni = (...ss) => ({ b: [Math.min(...ss.map(s => s.b[0])), Math.min(...ss.map(s => s.b[1])), Math.max(...ss.map(s => s.b[2])), Math.max(...ss.map(s => s.b[3]))], f(x, y) { for (const s of ss) { const n = s.f(x, y); if (n) return n; } return null; } });
  const clip = (sh, f) => ({ b: sh.b, f: (x, y) => (f(x, y) ? sh.f(x, y) : null) });
  class Pix {
    constructor(w, h) { this.w = w; this.h = h; this.g = new Uint32Array(w * h); }
    px(x, y, c) { x = Math.round(x); y = Math.round(y); if (x >= 0 && y >= 0 && x < this.w && y < this.h) this.g[y * this.w + x] = c; }
    rect(x, y, w, h, c) { for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) this.px(x + i, y + j, c); }
    line(a, b, c) { const n = Math.ceil(Math.max(Math.abs(b[0] - a[0]), Math.abs(b[1] - a[1]))) || 1; for (let k = 0; k <= n; k++) this.px(a[0] + (b[0] - a[0]) * k / n, a[1] + (b[1] - a[1]) * k / n, c); }
    put(sh, m, o = 0) {                                       // o: 1 = no outline, 2 = flat colour
      const { w, h, g } = this, x0 = Math.max(0, Math.floor(sh.b[0]) - 1), y0 = Math.max(0, Math.floor(sh.b[1]) - 1), x1 = Math.min(w - 1, Math.ceil(sh.b[2]) + 1), y1 = Math.min(h - 1, Math.ceil(sh.b[3]) + 1), bw = x1 - x0 + 1, t = new Int8Array(bw * (y1 - y0 + 1)).fill(-1);
      for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) { const n = sh.f(x + 0.5, y + 0.5); if (n) { const v = (o & 2) ? 0.5 : n[0] * LX + n[1] * LY + n[2] * LZ; t[(y - y0) * bw + x - x0] = v > 0.8 ? 3 : v > 0.36 ? 2 : v > -0.08 ? 1 : 0; } }
      const at = (x, y) => (x < x0 || y < y0 || x > x1 || y > y1) ? -1 : t[(y - y0) * bw + x - x0];
      if (!(o & 1)) for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) if (at(x, y) < 0 && (at(x - 1, y) >= 0 || at(x + 1, y) >= 0 || at(x, y - 1) >= 0 || at(x, y + 1) >= 0)) g[y * w + x] = m.o;
      for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) { const v = at(x, y); if (v >= 0) g[y * w + x] = m[v]; }
    }
    box(x, y, w, h, m) { this.put({ b: [x, y, x + w, y + h], f: (X, Y) => (X >= x && X <= x + w && Y >= y && Y <= y + h ? [0, 0, 1] : null) }, m, 2); this.rect(Math.round(x), Math.round(y), Math.round(w), 1, m[3]); this.rect(Math.round(x), Math.round(y + h) - 1, Math.round(w), 1, m[1]); }
    canvas() { const cv = doc.createElement('canvas'); cv.width = this.w; cv.height = this.h; const x = cv.getContext('2d'), im = x.createImageData(this.w, this.h); new Uint32Array(im.data.buffer).set(this.g); x.putImageData(im, 0, 0); return cv; }
  }
  const stride = (p, A, D, lift) => {                         // one leg's foot at cycle position p (0 = heel strike, foot in front): x forward of the hip, height, toe angle (+ = toe up)
    if (p < D) { const u = p / D; return { x: A - 2 * A * u, y: u > 0.86 ? 2.2 * Math.pow((u - 0.86) / 0.14, 2) : 0, a: u > 0.8 ? -32 * (u - 0.8) / 0.2 : u < 0.12 ? 12 * (1 - u / 0.12) : 0 }; }
    const u = (p - D) / (1 - D), e = 0.5 - 0.5 * Math.cos(Math.PI * u); return { x: -A + 2 * A * e, y: lift * Math.sin(Math.PI * u) + 2.2 * (1 - u), a: -32 + 44 * u };
  };
  const ik = (hx, hy, ax, ay, L1, L2) => { const dx = ax - hx, dy = ay - hy, d = Math.max(0.1, Math.min(Math.hypot(dx, dy), (L1 + L2) * 0.999)), a = Math.acos(cl((L1 * L1 + d * d - L2 * L2) / (2 * L1 * d), -1, 1)), th = Math.atan2(dy, dx) - a; return [hx + L1 * Math.cos(th), hy + L1 * Math.sin(th)]; };

  // ---- the five people. thS = how much of the thigh is the upper material (0.5 = shorts); back / det / hem / hair / hold draw the clothes and things they carry
  const HT = [
    { name: 'businessman', H: 59, lean: 2, fwd: 1.2, skin: '#e0ae88', hc: '#1d1b26', top: '#2b3558', armU: '#2b3558', armL: '#2b3558', thA: '#232a45', thS: 1, shk: '#232a45', shoe: '#17141c', armSw: 20, hold: 'case', walk: { A: 6.6, sp: 24 }, run: { A: 12.5, sp: 64 },
      det(p, J) { const a = J.at; p.put(cap(...a(0.97, 3), ...a(0.4, 4.2), 1.1, 1.3), M('#ecebf2'), 3); p.put(cap(...a(0.9, 3.5), ...a(0.34, 4.4), 0.75, 1.1), M('#b8283a'), 3); p.line(a(0.99, 2.3), a(0.4, 4.7), K('#4a5788')); p.px(...a(0.28, 4.5), K('#0d0b14')); p.px(...a(0.14, 4.7), K('#0d0b14')); },
      hem(p, J) { p.put(cap(J.P[0] - 0.3, J.P[1] - 1.5, J.P[0] + 0.4, J.P[1] + 5 * J.s, 4.7 * J.s, 4.9 * J.s), M('#2b3558')); },
      hair(p, J, [hx, hy], s) { p.put(clip(ell(hx - 0.8 * s, hy - 1.1 * s, 5 * s, 4.9 * s), (x, y) => y < hy - 3.1 * s + Math.max(0, hx - x) * 0.5 || (x < hx - 2.7 * s && y < hy + 1.1 * s)), M('#1d1b26')); p.line([hx - 1.5 * s, hy - 5 * s], [hx + 2.2 * s, hy - 4.7 * s], K('#4a4660')); p.px(hx + 3 * s, hy - 3.9 * s, K('#4a4660')); },
      hold(p, J) { const [x, y] = J.arms[1].h; p.line([x, y + 1], [x, y + 3], K('#2a1a10')); p.box(x - 4.5, y + 3, 9, 7, M('#7a4a2c')); p.px(x, y + 5, K('#d9b050')); } },
    { name: 'office woman', H: 55, lean: 1, fwd: 1.0, skin: '#f0c4a6', hc: '#4a2a1c', top: '#cfd8f0', armU: '#cfd8f0', armL: '#f0c4a6', chest: 4.7, thA: '#e3b295', thS: 1, shk: '#e3b295', shoe: '#201a22', armSw: 17, hold: 'bag', walk: { A: 5.2, sp: 19 }, run: { A: 10.5, sp: 54 }, lip: '#b03a52',
      back(p, J) { const [hx, hy] = J.hd; p.put(uni(cap(hx - 2.2, hy - 1, hx - 3.6, hy + 11, 3.5, 2.6)), M('#4a2a1c')); },
      det(p, J) { const a = J.at; p.put(ell(...a(0.75, 3.5), 2.2, 2.7), M('#cfd8f0'), 1); p.line(a(1, 2.6), a(0.78, 4.4), K('#8aa0d8')); p.line(a(1, 1.6), a(0.84, 3.4), K('#8aa0d8')); },
      hem(p, J) { p.put(cap(J.P[0] - 0.2, J.P[1] - 2, J.P[0] + 0.3, J.P[1] + 10.5 * J.s, 4.8 * J.s, 4.1 * J.s), M('#3b3a4e')); },
      hair(p, J, [hx, hy], s) { p.put(clip(ell(hx - 0.8 * s, hy - 1.1 * s, 5 * s, 5 * s), (x, y) => y < hy - 3.1 * s + Math.max(0, hx - x) * 0.45 || (x < hx - 2.5 * s && y < hy + 1.8 * s)), M('#4a2a1c')); p.px(hx - 1.8 * s, hy + 2.6 * s, K('#e8c860')); p.line([hx - 1.5 * s, hy - 5 * s], [hx + 2.4 * s, hy - 4.6 * s], K('#7a4a34')); },
      hold(p, J) { const a = J.arms[1], [x, y] = [J.P[0] - 3, J.P[1] + 3]; p.line(J.S, [x + 4, y], K('#5a3020')); p.box(x, y, 9, 8, M('#a23a3a')); p.px(x + 4, y + 2, K('#e8c860')); } },
    { name: 'old man', H: 53, lean: 15, fwd: 3.2, skin: '#d9a888', hc: '#c9c6c4', top: '#6a7152', armU: '#6a7152', armL: '#6a7152', thA: '#5a4a3a', thS: 1, shk: '#5a4a3a', shoe: '#2a2018', armSw: 12, hold: 'cane', walk: { A: 3.6, sp: 12 }, run: { A: 6.5, sp: 36 }, brow: '#aaa6a4',
      det(p, J) { const a = J.at; p.put(ell(...a(0.4, 3.2), 2.9, 4), M('#6a7152'), 1); p.line(a(0.98, 2.2), a(0.2, 4.6), K('#4a5038')); [0.62, 0.42, 0.24].forEach(t => p.px(...a(t, 4.4), K('#2a2e1c'))); p.line(a(0.99, 2), a(0.86, 3.3), K('#d9d4c4')); },
      hem(p, J) { p.put(cap(J.P[0], J.P[1] - 2, J.P[0], J.P[1] + 4 * J.s, 4.5 * J.s, 4.6 * J.s), M('#6a7152')); },
      hair(p, J, [hx, hy], s) { p.put(clip(ell(hx - 0.8 * s, hy - 1.1 * s, 4.9 * s, 4.7 * s), (x, y) => (x < hx - 2.6 * s && y > hy - 2.4 * s && y < hy + 1.8 * s) || (y < hy - 3.7 * s && x < hx + 1 * s)), M('#c9c6c4')); p.rect(Math.round(hx + 3 * s), Math.round(hy + 2 * s), 2, 1, K('#aaa6a4')); const X = Math.round(hx + 2.4 * s), Y = Math.round(hy - 0.7 * s), g = K('#8a8a96'); p.rect(X - 1, Y - 1, 3, 1, g); p.rect(X - 1, Y + 1, 3, 1, g); p.px(X - 1, Y, g); p.px(X + 1, Y, g); p.line([X - 1, Y], [hx - 1.6 * s, hy - 0.4 * s], g); },
      hold(p, J) { const [x, y] = J.arms[1].h; p.line([x, y], [x + 3, GY - 1], K('#5a3a22')); p.line([x, y], [x + 1.5, GY - 1], K('#7a5030')); p.px(x - 1, y - 1, K('#5a3a22')); p.px(x, y - 2, K('#5a3a22')); } },
    { name: 'jogger', H: 57, lean: 4, fwd: 1.4, skin: '#b9794f', hc: '#231712', top: '#8d96a0', armU: '#b9794f', armL: '#b9794f', thA: '#27406a', thS: 0.5, thB: '#b9794f', shk: '#b9794f', shoe: '#e8e8f0', sole: '#d9323c', armSw: 28, walk: { A: 8, sp: 34 }, run: { A: 14, sp: 80 },
      det(p, J) { const a = J.at; p.line(a(0.9, 1.2), a(0.12, 4.2), K('#d9323c')); p.line(a(0.99, 3), a(0.8, 4.3), K('#6a727c')); },
      hem(p, J) { p.put(cap(J.P[0], J.P[1] - 1.5, J.P[0], J.P[1] + 2.6 * J.s, 4.4 * J.s, 4.3 * J.s), M('#27406a')); },
      hair(p, J, [hx, hy], s) { p.put(clip(ell(hx - 0.8 * s, hy - 1.0 * s, 4.9 * s, 4.8 * s), (x, y) => y < hy - 3.3 * s + Math.max(0, hx - x) * 0.5 || (x < hx - 2.7 * s && y < hy + 0.8 * s)), M('#231712')); p.put(clip(ell(hx - 0.4 * s, hy - 0.4 * s, 4.8 * s, 4.7 * s), (x, y) => y > hy - 3.1 * s && y < hy - 1.6 * s && x < hx + 3.6 * s), M('#d9323c')); p.line([hx - 1.5 * s, hy - 5 * s], [hx + 1.8 * s, hy - 4.8 * s], K('#4a3a30')); p.line([hx - 4.4 * s, hy - 2.2 * s], [hx - 7 * s, hy - 0.4 * s - Math.sin(J.ph * 12.57) * 1.5], K('#d9323c')); },
      hold(p, J) { const [x, y] = J.arms[1].W; p.rect(Math.round(x - 1.5), Math.round(y - 0.5), 3, 2, K('#d9323c')); } },
    { name: 'tourist', H: 54, lean: 3, fwd: 1.2, skin: '#f2cfb2', hc: '#d6b25e', top: '#5a9a6a', armU: '#5a9a6a', armL: '#f2cfb2', thA: '#b09a6a', thS: 0.55, thB: '#f2cfb2', shk: '#f2cfb2', shoe: '#e8e8e8', sole: '#4a6ea8', armSw: 20, walk: { A: 5.8, sp: 17 }, run: { A: 10, sp: 52 }, lip: '#c0585e',
      back(p, J) { const a = J.at, [hx, hy] = J.hd; p.put(cap(hx - 4.2, hy - 0.8, hx - 6.8 - Math.sin(J.ph * 12.57) * 1.2, hy + 5, 1.6, 1.2), M('#d6b25e')); p.box(a(0.55, -8.4)[0], a(0.55, -8.4)[1] - 6, 6.5, 15, M('#c8742f')); p.line(a(0.9, -1.5), a(0.5, -4), K('#8a4a18')); },
      det(p, J) { const a = J.at; p.box(...a(0.55, 3.6), 5, 4, M('#26262e')); p.px(...a(0.5, 6.7), K('#8aa0b8')); p.line(a(1, 1.4), a(0.6, 3.8), K('#26262e')); },
      hem(p, J) { p.put(cap(J.P[0], J.P[1] - 1.5, J.P[0], J.P[1] + 2.8 * J.s, 4.4 * J.s, 4.5 * J.s), M('#b09a6a')); },
      hair(p, J, [hx, hy], s) { p.put(clip(ell(hx - 0.9 * s, hy - 1.3 * s, 5.2 * s, 4.9 * s), (x, y) => y < hy - 2.5 * s), M('#2f5fa8')); p.put(cap(hx + 2.6 * s, hy - 2.7 * s, hx + 8.3 * s, hy - 1.6 * s, 1.1, 0.7), M('#2f5fa8')); p.px(hx - 1.5 * s, hy + 1.6 * s, K('#d6b25e')); } }];

  function figure(c, kind, i) {
    const p = new Pix(N, N), s = c.H / 58, run = kind === 'run', shock = kind === 'shock', gt = run ? c.run : c.walk, scared = run || shock;
    const ph = i / 8, D = run ? 0.4 : 0.62, A = shock ? 2.8 : gt.A, lift = run ? 10 : 3.4, cx = 32, L1 = 12.9 * s, L2 = 12.4 * s, AH = 3.5 * s, Lm = (L1 + L2) * 0.965;
    const lean = (c.lean + (run ? 10 : 0) - (shock ? 8 : 0)) * RAD, ux = Math.sin(lean), uy = -Math.cos(lean), fx = -uy, fy = ux;
    const legs = [0, 1].map(k => { const f = shock ? { x: k ? 3 : -2.8, y: 0, a: 0 } : stride((ph + 0.5 * k) % 1, A, D, lift); return { ax: cx + f.x * s, ay: GY - AH - f.y * s, a: f.a }; });
    let py = 0; for (const l of legs) py = Math.max(py, l.ay - Math.sqrt(Math.max(0, Lm * Lm - (l.ax - cx) * (l.ax - cx))));
    const P = [cx, py], Lt = 17.6 * s, at = (t, d) => [P[0] + ux * Lt * t + fx * d * s, P[1] + uy * Lt * t + fy * d * s];
    const C = at(0.5, 0), Nk = at(1, 0), S = at(0.84, -0.2), hd = [Nk[0] + (c.fwd + (run ? 1.4 : shock ? -0.8 : 0)) * s, Nk[1] - 6.7 * s];
    const Ua = 10.4 * s, Fa = 9.6 * s, arms = [0, 1].map(k => {
      let al, el; const sw = (c.armSw || 22) * (run ? 1.9 : 1), w = Math.cos(2 * Math.PI * ph) * (k ? 1 : -1);
      if (shock) { al = k ? 38 : 24; el = 108; } else { al = sw * w; el = run ? 88 + 10 * w : 12 + 14 * (w + 1) / 2; }
      if (k && c.hold && !shock && !run) { al = c.hold === 'case' ? 4 : c.hold === 'cane' ? 12 : 8; el = c.hold === 'case' ? 3 : c.hold === 'cane' ? 18 : 12; }
      const a1 = al * RAD, a2 = (al + el) * RAD, E = [S[0] + Math.sin(a1) * Ua, S[1] + Math.cos(a1) * Ua], W = [E[0] + Math.sin(a2) * Fa, E[1] + Math.cos(a2) * Fa];
      return { E, W, h: [W[0] + Math.sin(a2) * 2.3 * s, W[1] + Math.cos(a2) * 2.3 * s] };
    });
    const J = { P, C, N: Nk, S, at, hd, s, kind, ph, arms, legs }, show = !run && !shock;
    const drawArm = k => { const a = arms[k], far = k ? 0 : 0.1; const sh = ell(S[0], S[1], 2.7 * s, 2.7 * s); if (c.armU === c.armL) p.put(uni(sh, cap(S[0], S[1], a.E[0], a.E[1], 2.3 * s, 1.95 * s), cap(a.E[0], a.E[1], a.W[0], a.W[1], 1.95 * s, 1.5 * s)), M(c.armU, far)); else { p.put(uni(sh, cap(S[0], S[1], a.E[0], a.E[1], 2.3 * s, 1.95 * s)), M(c.armU, far)); p.put(cap(a.E[0], a.E[1], a.W[0], a.W[1], 1.95 * s, 1.5 * s), M(c.armL, far)); } p.put(ell(a.h[0], a.h[1], 1.9 * s, 2.3 * s), M(c.skin, far)); };
    const drawLeg = k => {
      const l = legs[k], far = k ? 0 : 0.1, Hp = [P[0] + 0.4, P[1]], Kn = ik(Hp[0], Hp[1], l.ax, l.ay, L1, L2), tm = c.thS, Km = [Hp[0] + (Kn[0] - Hp[0]) * tm, Hp[1] + (Kn[1] - Hp[1]) * tm];
      if (tm >= 1) p.put(uni(cap(Hp[0], Hp[1], Kn[0], Kn[1], 3.4 * s, 2.8 * s), cap(Kn[0], Kn[1], l.ax, l.ay, 2.8 * s, 1.7 * s)), M(c.thA, far));
      else { p.put(cap(Hp[0], Hp[1], Km[0], Km[1], 3.4 * s, 3.2 * s), M(c.thA, far)); p.put(uni(cap(Km[0], Km[1], Kn[0], Kn[1], 3.1 * s, 2.8 * s), cap(Kn[0], Kn[1], l.ax, l.ay, 2.8 * s, 1.7 * s)), M(c.thB, far)); }
      const a = -l.a * RAD, cs = Math.cos(a), sn = Math.sin(a), R = (x, y) => [l.ax + (x * cs - y * sn) * s, l.ay + (x * sn + y * cs) * s], hh = R(-2.2, 1.5), tt = R(4.6, 1.9);
      p.put(cap(hh[0], hh[1], tt[0], tt[1], 1.9 * s, 1.5 * s), M(c.shoe, far)); if (c.sole) p.line(R(-1.6, 2.7), R(4.2, 3), K(c.sole));
    };
    drawArm(0); drawLeg(0); if (c.back) c.back(p, J);
    const W1 = at(0.3, 0), W2 = at(0.68, 0), cr = (c.chest || 5.3) * s; p.put(uni(cap(P[0], P[1], W1[0], W1[1], 4.7 * s, 4.2 * s), cap(W1[0], W1[1], W2[0], W2[1], 4.2 * s, cr), cap(W2[0], W2[1], Nk[0], Nk[1], cr, 3.5 * s)), M(c.top));
    p.put(cap(hd[0] - 1.1 * s, hd[1] + 3.2 * s, Nk[0] + 0.3 * s, Nk[1] - 0.5 * s, 2.1 * s, 2.5 * s), M(c.skin)); if (c.det) c.det(p, J);
    const [hx, hy] = hd; p.put(uni(ell(hx - 0.3 * s, hy - 0.4 * s, 4.4 * s, 4.5 * s), ell(hx + 1.1 * s, hy + 1.3 * s, 3.3 * s, 3.4 * s), cap(hx + 3.3 * s, hy - 0.1 * s, hx + 5.1 * s, hy + 1.3 * s, 0.85 * s, 0.6 * s)), M(c.skin));
    c.hair(p, J, hd, s);
    const X = Math.round(hx + 2.4 * s), Y = Math.round(hy - 0.7 * s), Wt = K('#f4f0ea'), Dk = K('#1a1420'), Br = K(c.brow || c.hc), mx = Math.round(hx + 3.2 * s), my = Math.round(hy + 2.7 * s);
    if (scared) { p.rect(X, Y - 1, 2, 2, Wt); p.px(X + 1, Y, Dk); p.rect(X - 1, Y - 3, 3, 1, Br); p.px(X + 2, Y - 2, Br); p.rect(mx - 1, my - 1, 3, 3, K('#3a0f1c')); p.px(mx, my - 1, Wt); p.px(mx, my + 1, K('#d8607a')); }
    else { p.rect(X, Y, 2, 1, Wt); p.px(X + 1, Y, Dk); p.rect(X - 1, Y - 2, 3, 1, Br); p.rect(mx - 1, my, 3, 1, K(c.lip || '#9a4a4e')); }
    p.rect(Math.round(hx - 2.2 * s), Math.round(hy - 0.2 * s), 2, 3, M(c.skin)[1]);
    drawLeg(1); if (c.hem) c.hem(p, J); drawArm(1); if (c.hold && show) c.hold(p, J);
    return { p, hd };
  }
  function parts(c, fr) {                                     // the pieces the body bursts into, built from the same materials: head (cut from the sprite), torso, arm, leg, each with a torn red end and a bone
    const s = c.H / 58, cut = (p, x, y, w, top) => { for (let i = 0; i < w; i++) { const h = 2 + ((i * 5 + w) % 3 === 0 ? 1 : 0); p.rect(x + i, top ? y : y + 2 - h, 1, h, K(i % 4 === 1 ? '#d4141f' : '#8e0c18')); } p.px(x + (w >> 1), top ? y : y + 1, K('#efe6d8')); p.px(x + 1 + (w >> 2), top ? y + 1 : y, K('#5a0710')); };
    const hp = new Pix(18, 20); const [hx, hy] = fr.hd; for (let y = 0; y < 20; y++) for (let x = 0; x < 18; x++) { const sx = Math.round(hx) - 9 + x, sy = Math.round(hy) - 8 + y; if (y < 16 && sx >= 0 && sy >= 0 && sx < N && sy < N) hp.g[y * 18 + x] = fr.p.g[sy * N + sx]; }
    cut(hp, 6, 15, 7, false);
    const tp = new Pix(14, 22); tp.put(uni(cap(7, 5, 7, 11, 4.6 * s, 4.2 * s), cap(7, 11, 7, 17, 4.2 * s, 5.2 * s)), M(c.top)); tp.rect(5, 9, 4, 3, K('#a3121a')); tp.px(6, 10, K('#efe6d8')); cut(tp, 2, 0, 10, true); cut(tp, 2, 20, 10, false);
    const ap = new Pix(9, 28); if (c.armU === c.armL) ap.put(uni(cap(4.5, 4, 4.5, 14, 2.3 * s, 1.95 * s), cap(4.5, 14, 4.5, 21, 1.95 * s, 1.5 * s)), M(c.armU)); else { ap.put(cap(4.5, 4, 4.5, 14, 2.3 * s, 1.95 * s), M(c.armU)); ap.put(cap(4.5, 14, 4.5, 21, 1.95 * s, 1.5 * s), M(c.armL)); } ap.put(ell(4.5, 23.5, 1.9 * s, 2.3 * s), M(c.skin)); cut(ap, 1, 0, 7, true);
    const lp = new Pix(12, 36), t1 = c.thS; lp.put(cap(5.5, 4, 5.5, 4 + 12 * t1, 3.4 * s, 3.2 * s), M(c.thA)); lp.put(uni(cap(5.5, 4 + 12 * t1, 5.5, 16, 3.1 * s, 2.8 * s), cap(5.5, 16, 5.5, 27, 2.8 * s, 1.7 * s)), M(t1 >= 1 ? c.thA : c.thB)); lp.put(cap(3.5, 30, 9.5, 30.6, 1.9 * s, 1.5 * s), M(c.shoe)); cut(lp, 1, 0, 9, true);
    return { head: hp.canvas(), torso: tp.canvas(), arm: ap.canvas(), leg: lp.canvas() };
  }
  return HT.map(c => { const T = { name: c.name, walk: [], run: [], sp: c.walk.sp, rs: c.run.sp, wl: 4 * c.walk.A, rl: 4 * c.run.A, H: c.H }; c.thB = c.thB || c.thA; for (let i = 0; i < 8; i++) { T.walk.push(figure(c, 'walk', i).p.canvas()); T.run.push(figure(c, 'run', i).p.canvas()); } const sh = figure(c, 'shock', 0); T.shock = sh.p.canvas(); T.parts = parts(c, figure(c, 'walk', 0)); return T; });
}
