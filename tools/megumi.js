// ================================================================ v1.145 MEGUMI: a side-view pixel figure (facing right, 64 x 64, the soles on row 62) made of shaded capsules like the people of tools/human.js, drawn pose by pose at run time.
// The look is the one of his sprite of chapter 2 (tools/megumi_64.png): the dark blue school uniform with the high collar and two buttons, spiky black hair, pale skin, brown boots. A POSE says where the hip is, how the body leans, where the head is, how the two arms bend
// and where the two ankles are (the legs are solved from them); c15MegPose(name, t) gives the poses of the actions (stand, kneel, rise, run, in the air, slide, stumble, skid, flee). c15Meg(pose) -> a 64 x 64 canvas (cached by the numbers of the pose).
const c15MegKit = (() => {
  const N = 64, OY = 8, LX = 0.5, LY = -0.55, LZ = 0.67, RAD = Math.PI / 180, GY = 63, cl = (v, a, b) => Math.max(a, Math.min(b, v)), MC = {};
  const hex = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16)), pack = c => (255 << 24) | (c[2] << 16) | (c[1] << 8) | c[0], K = h => pack(hex(h));
  const toHsl = ([r, g, b]) => { r /= 255; g /= 255; b /= 255; const mx = Math.max(r, g, b), mn = Math.min(r, g, b), l = (mx + mn) / 2; let h = 0, s = 0; if (mx !== mn) { const d = mx - mn; s = l > 0.5 ? d / (2 - mx - mn) : d / (mx + mn); h = (mx === r ? (g - b) / d + (g < b ? 6 : 0) : mx === g ? (b - r) / d + 2 : (r - g) / d + 4) * 60; } return [h, s, l]; };
  const fromHsl = (h, s, l) => { const f = n => { const k = (n + h / 30) % 12, a = s * Math.min(l, 1 - l); return Math.round(255 * (l - a * Math.max(-1, Math.min(k - 3, 9 - k, 1)))); }; return [f(0), f(8), f(4)]; };
  function M(h, far = 0) {      // a material: shadow, shade, mid, light + a dark outline colour (cooler in the dark, warmer in the light)
    const k = h + far; if (MC[k]) return MC[k]; const [hh, s, l0] = toHsl(hex(h)), l = Math.max(0.06, l0 - far), q = hh >= 8 && hh <= 38 && l0 > 0.38 && s > 0.2 ? 0.3 : 1;
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
    put(sh, m, o = 0) {      // o: 1 = no outline, 2 = flat colour
      const { w, h, g } = this, x0 = Math.max(0, Math.floor(sh.b[0]) - 1), y0 = Math.max(0, Math.floor(sh.b[1]) - 1), x1 = Math.min(w - 1, Math.ceil(sh.b[2]) + 1), y1 = Math.min(h - 1, Math.ceil(sh.b[3]) + 1), bw = x1 - x0 + 1, t = new Int8Array(bw * (y1 - y0 + 1)).fill(-1);
      for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) { const n = sh.f(x + 0.5, y + 0.5); if (n) { const v = (o & 2) ? 0.5 : n[0] * LX + n[1] * LY + n[2] * LZ; t[(y - y0) * bw + x - x0] = v > 0.8 ? 3 : v > 0.36 ? 2 : v > -0.08 ? 1 : 0; } }
      const at = (x, y) => (x < x0 || y < y0 || x > x1 || y > y1) ? -1 : t[(y - y0) * bw + x - x0];
      if (!(o & 1)) for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) if (at(x, y) < 0 && (at(x - 1, y) >= 0 || at(x + 1, y) >= 0 || at(x, y - 1) >= 0 || at(x, y + 1) >= 0)) g[y * w + x] = m.o;
      for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) { const v = at(x, y); if (v >= 0) g[y * w + x] = m[v]; }
    }
    canvas() { const cv = document.createElement('canvas'); cv.width = this.w; cv.height = this.h; const x = cv.getContext('2d'), im = x.createImageData(this.w, this.h); new Uint32Array(im.data.buffer).set(this.g); x.putImageData(im, 0, 0); return cv; }
  }
  const ik = (hx, hy, ax, ay, L1, L2) => { const dx = ax - hx, dy = ay - hy, d = Math.max(0.1, Math.min(Math.hypot(dx, dy), (L1 + L2) * 0.999)), a = Math.acos(cl((L1 * L1 + d * d - L2 * L2) / (2 * L1 * d), -1, 1)), th = Math.atan2(dy, dx) - a; return [hx + L1 * Math.cos(th), hy + L1 * Math.sin(th)]; };
  const C = { top: '#2e3649', skin: '#fee7c6', hair: '#0e0c1a', pants: '#262b3a', boot: '#785e29', sole: '#312412', collar: '#1b1e2c', button: '#bfa04a', blood: '#b8121c', bloodL: '#e0303c' };
  const S = 1.03, L1 = 12.9 * S, L2 = 12.4 * S, LT = 17.6 * S, AH = 3.5 * S;

  function draw(o) {      // o: the pose (see c15MegPose). Returns the Pix of the picture, facing right.
    const p = new Pix(N, N + OY), lean = (o.lean === undefined ? 3 : o.lean) * RAD, ux = Math.sin(lean), uy = -Math.cos(lean), fx = -uy, fy = ux, P = [o.x === undefined ? 32 : o.x, (o.y === undefined ? 35.2 : o.y) + OY];
    const at = (t, d) => [P[0] + ux * LT * t + fx * d * S, P[1] + uy * LT * t + fy * d * S], Wd = at(0.3, 0), W2 = at(0.68, 0), Nk = at(1, 0), Sh = at(0.84, -0.2);
    const ht = (o.hdt || 0) * RAD, hox = (o.hdx === undefined ? 1.3 : o.hdx) * S, hoy = -6.7 * S + (o.hdy || 0), hd = [Nk[0] + hox * Math.cos(ht) - hoy * Math.sin(ht), Nk[1] + hox * Math.sin(ht) + hoy * Math.cos(ht)];
    const Ua = 10.4 * S, Fa = 9.6 * S, ar = o.arms || [{ al: -8, el: 20 }, { al: 6, el: 24 }];
    const arms = ar.map(a => { const a1 = a.al * RAD, a2 = (a.al + a.el) * RAD, E = [Sh[0] + Math.sin(a1) * Ua, Sh[1] + Math.cos(a1) * Ua], Wr = [E[0] + Math.sin(a2) * Fa, E[1] + Math.cos(a2) * Fa]; return { E, W: Wr, h: [Wr[0] + Math.sin(a2) * 2.3 * S, Wr[1] + Math.cos(a2) * 2.3 * S] }; });
    const lg = (o.legs || [{ ax: 29, ay: GY - AH, a: 0 }, { ax: 35, ay: GY - AH, a: 0 }]).map(l => ({ ax: l.ax, ay: l.ay + OY, a: l.a })), top = M(C.top), skin = M(C.skin);
    const drawArm = k => { const a = arms[k], far = k ? 0 : 0.1; p.put(uni(ell(Sh[0], Sh[1], 2.7 * S, 2.7 * S), cap(Sh[0], Sh[1], a.E[0], a.E[1], 2.3 * S, 1.95 * S), cap(a.E[0], a.E[1], a.W[0], a.W[1], 1.95 * S, 1.5 * S)), M(C.top, far));
      p.put(ell(a.h[0], a.h[1], 1.9 * S, 2.1 * S), M(C.skin, far)); if (o.blood && k) { p.px(a.h[0] + 0.5, a.h[1] + 1, K(C.blood)); p.px(a.h[0] - 0.6, a.h[1], K(C.bloodL)); } };
    const drawLeg = k => { const l = lg[k], far = k ? 0 : 0.1, Hp = [P[0] + 0.4, P[1]], Kn = ik(Hp[0], Hp[1], l.ax, l.ay, L1, L2);
      p.put(uni(cap(Hp[0], Hp[1], Kn[0], Kn[1], 3.4 * S, 2.8 * S), cap(Kn[0], Kn[1], l.ax, l.ay, 2.8 * S, 1.7 * S)), M(C.pants, far));
      const a = -(l.a || 0) * RAD, cs = Math.cos(a), sn = Math.sin(a), R = (x, y) => [l.ax + (x * cs - y * sn) * S, l.ay + (x * sn + y * cs) * S], hh = R(-2.2, 1.5), tt = R(4.6, 1.9);
      p.put(cap(hh[0], hh[1], tt[0], tt[1], 1.9 * S, 1.5 * S), M(C.boot, far)); p.line(R(-1.6, 2.7), R(4.2, 3), K(C.sole)); };
    drawArm(0); drawLeg(0);
    p.put(uni(cap(P[0], P[1], Wd[0], Wd[1], 4.7 * S, 4.2 * S), cap(Wd[0], Wd[1], W2[0], W2[1], 4.2 * S, 5.2 * S), cap(W2[0], W2[1], Nk[0], Nk[1], 5.2 * S, 3.5 * S)), top);      // (the jacket)
    p.put(cap(hd[0] - 1.1 * S, hd[1] + 3.2 * S, Nk[0] + 0.3 * S, Nk[1] - 0.5 * S, 2.1 * S, 2.5 * S), skin);      // (the neck)
    p.put(cap(Nk[0] - 0.3, Nk[1] + 1.8 * S, Nk[0] + 0.3, Nk[1] - 1.7 * S, 2.7 * S, 2.9 * S), M(C.collar), 1);      // (the high collar)
    const b1 = at(0.45, 4.6), b2 = at(0.62, 4.9); p.px(b1[0], b1[1], K(C.button)); p.px(b2[0], b2[1], K(C.button));
    const [hx, hy] = hd; p.put(uni(ell(hx - 0.3 * S, hy - 0.4 * S, 4.4 * S, 4.5 * S), ell(hx + 1.1 * S, hy + 1.3 * S, 3.3 * S, 3.4 * S), cap(hx + 3.3 * S, hy + 0.2 * S, hx + 4.7 * S, hy + 1.3 * S, 0.7 * S, 0.5 * S)), skin);      // (the head, the nose)
    // the hair: a mass over the top and the back of the head, a ring of spikes round it that lean back with the speed (o.wind 0 - 1) and two locks of the fringe over the forehead; flat dark colour with a few lighter points on the upper right
    const hair = M(C.hair), wd = (o.wind || 0), sway = wd * 26 * RAD, hl = K('#454860');
    p.put(uni(ell(hx - 1.2 * S, hy - 2.3 * S, 4.7 * S, 3.7 * S), ell(hx - 3.3 * S, hy + 0.4 * S, 1.8 * S, 2.7 * S)), hair, 2);
    const SP = [[-172, 8.6, 1.9], [-152, 9.8, 2.1], [-132, 10.4, 2.2], [-112, 11.2, 2.2], [-92, 11.6, 2.2], [-72, 10.4, 2.1], [-54, 8.4, 1.8], [-38, 6.2, 1.5]];
    for (const [ang, len, r] of SP) { const a = (ang * RAD) - sway * (ang < -80 ? 0.9 : 0.5) + ht * 0.5, bx = hx - 1.0 * S + Math.cos(a) * 3.5 * S, by = hy - 2.0 * S + Math.sin(a) * 2.9 * S, tx = bx + Math.cos(a) * len * S * 0.6, ty = by + Math.sin(a) * len * S * 0.6; p.put(cap(bx, by, tx, ty, r * 0.55 * S, 0.25), hair, 2); p.px(tx - Math.cos(a) * 1.6 + 0.6, ty - Math.sin(a) * 1.6 - 0.4, hl); }
    p.put(cap(hx + 0.2 * S, hy - 3.7 * S, hx + 2.9 * S, hy - 1.3 * S, 1.0 * S, 0.3), hair, 2); p.put(cap(hx - 1.3 * S, hy - 3.8 * S, hx + 0.9 * S, hy - 1.9 * S, 0.9 * S, 0.3), hair, 2); p.px(hx + 1.1 * S, hy - 3.4 * S, hl);
    // the face
    const X = Math.round(hx + 2.5 * S), Y = Math.round(hy - 0.2 * S), Wt = K('#f4f0ea'), Dk = K('#14101c'), mx = Math.round(hx + 3.1 * S), my = Math.round(hy + 2.9 * S), ex = o.ex || 'calm';
    if (ex === 'scared' || ex === 'shock') { p.rect(X - 1, Y - 1, 3, 3, Wt); p.px(X + 1, Y, Dk); p.rect(X - 1, Y - 3, 3, 1, Dk); p.rect(mx - 1, my - 1, 3, 3, K('#3a0f1c')); p.px(mx, my - 1, Wt); }
    else if (ex === 'pain') { p.rect(X - 1, Y, 3, 1, Dk); p.rect(X - 1, Y - 2, 3, 1, Dk); p.px(X + 2, Y - 3, Dk); p.rect(mx - 1, my, 3, 1, Dk); p.px(mx - 1, my - 1, Dk); }
    else if (ex === 'grit') { p.rect(X, Y, 2, 1, Wt); p.px(X + 1, Y, Dk); p.rect(X - 1, Y - 1, 4, 1, Dk); p.px(X + 3, Y, Dk); p.rect(mx - 1, my, 3, 1, Wt); p.rect(mx - 1, my - 1, 3, 1, Dk); }
    else { p.rect(X, Y, 2, 1, Wt); p.px(X + 1, Y, Dk); p.rect(X - 1, Y - 1, 3, 1, Dk); p.rect(mx - 1, my, 2, 1, K('#8a5a58')); }
    p.rect(Math.round(hx - 2.2 * S), Math.round(hy - 0.2 * S), 2, 3, M(C.skin)[1]);      // (the ear)
    if (o.blood) { for (let k = 0; k < Math.min(6, 2 + o.blood * 4); k++) p.px(X - 1 + (k > 2 ? 1 : 0), Y - 3 + k, K(k % 2 ? C.blood : C.bloodL)); p.px(X + 1, Y + 3, K(C.blood)); }
    drawLeg(1);
    p.put(cap(P[0] - 0.3, P[1] - 1.5, P[0] + 0.4, P[1] + 5 * S, 4.7 * S, 4.9 * S), top);      // (the skirt of the jacket)
    drawArm(1); return p;
  }
  const cache = new Map();
  function canvas(o) { const key = JSON.stringify(o, (k, v) => typeof v === 'number' ? Math.round(v * 2) / 2 : v); let c = cache.get(key); if (!c) { c = draw(o).canvas(); cache.set(key, c); if (cache.size > 900) cache.delete(cache.keys().next().value); } return c; }
  return { canvas, draw, GY, AH, S, L1, L2, LT, ik, OY, W: N, H: N + OY, Pix, cap, ell, uni, clip, M, K, C, cl };
})();
const c15Meg = o => c15MegKit.canvas(o.blood && typeof SET !== 'undefined' && SET.gore !== 0 ? { ...o, blood: 0 } : o);      // (no blood on him unless GRAPHIC DAMAGE is FULL)

// ---- the poses of the actions: each gives the pose for the time (seconds, or 0 - 1 where it says so); 'ph' = how far through a step (0 - 1)
const c15Mix = (a, b, t) => a + (b - a) * t, c15Sm = t => { t = Math.max(0, Math.min(1, t)); return t * t * (3 - 2 * t); };
function c15MegMixPose(a, b, t) {      // two poses mixed number by number (the arms and legs too)
  const o = {}; for (const k of ['x', 'y', 'lean', 'hdx', 'hdy', 'hdt', 'wind']) o[k] = c15Mix(a[k] === undefined ? (k === 'x' ? 32 : k === 'y' ? 35.2 : k === 'lean' ? 3 : k === 'hdx' ? 1.3 : 0) : a[k], b[k] === undefined ? (k === 'x' ? 32 : k === 'y' ? 35.2 : k === 'lean' ? 3 : k === 'hdx' ? 1.3 : 0) : b[k], t);
  o.arms = a.arms.map((u, i) => ({ al: c15Mix(u.al, b.arms[i].al, t), el: c15Mix(u.el, b.arms[i].el, t) })); o.legs = a.legs.map((u, i) => ({ ax: c15Mix(u.ax, b.legs[i].ax, t), ay: c15Mix(u.ay, b.legs[i].ay, t), a: c15Mix(u.a || 0, b.legs[i].a || 0, t) }));
  o.ex = t < 0.5 ? a.ex : b.ex; o.blood = b.blood === undefined ? a.blood : c15Mix(a.blood || 0, b.blood, t); return o;
}
const C15MG = { GROUND: 63 - c15MegKit.AH, BASE: 62 + c15MegKit.OY };      // (GROUND: the height of an ankle when the foot is flat on the floor; BASE: the row of the sole in the picture, which is 72 rows high: 8 rows of head room above the usual 64)      // (the height of an ankle when the foot is flat on the floor)
const c15MegPoses = {
  stand(t) { const b = Math.sin(t * 2.6) * 0.25; return { x: 32, y: 35.4 + b, lean: 4, hdx: 1.0, hdt: 4, arms: [{ al: -6, el: 16 + b }, { al: 8, el: 22 - b }], legs: [{ ax: 28.5, ay: C15MG.GROUND, a: 0 }, { ax: 36, ay: C15MG.GROUND, a: 0 }], ex: 'calm' }; },
  kneel(t) {      // on one knee in the dust, a hand on the front knee, the head down, heaving for breath: the back knee on the floor
    const br = Math.sin(t * 3.2), f = 0.5 + 0.5 * br; return { x: 29.5, y: 46.6 + f * 0.7, lean: 24 + br * 1.5, hdx: 0.6, hdy: 0.8 + f * 0.6, hdt: 22 + br * 2, wind: 0.1, arms: [{ al: 30 + br, el: 54 }, { al: 50, el: 36 - br * 3 }], legs: [{ ax: 17, ay: 58.6, a: 78 }, { ax: 40, ay: C15MG.GROUND, a: 0 }], ex: 'pain', blood: 0.7 }; },
  rise(u) { const k = c15MegPoses.kneel(0), s = c15MegPoses.stand(0), m = c15MegMixPose(k, s, c15Sm(u)); m.legs[0].ay = c15Mix(58.6, C15MG.GROUND, c15Sm(u * 1.2)); m.y -= Math.sin(Math.PI * u) * 1.2; m.ex = u < 0.55 ? 'pain' : 'grit'; return m; },
};

// ---- running (the stride of tools/human.js: the foot at cycle position p = x forward of the hip, height, toe angle) and the poses of the chase
const c15MegStride = (p, A, D, lift) => {
  if (p < D) { const u = p / D; return { x: A - 2 * A * u, y: u > 0.86 ? 2.2 * Math.pow((u - 0.86) / 0.14, 2) : 0, a: u > 0.8 ? -32 * (u - 0.8) / 0.2 : u < 0.12 ? 12 * (1 - u / 0.12) : 0 }; }
  const u = (p - D) / (1 - D), e = 0.5 - 0.5 * Math.cos(Math.PI * u); return { x: -A + 2 * A * e, y: lift * Math.sin(Math.PI * u) + 2.2 * (1 - u), a: -32 + 44 * u };
};
c15MegPoses.run = function (ph, A = 12.5) {      // ph = how far through the cycle (0 - 1); A = how long the stride is
  ph = ((ph % 1) + 1) % 1;      // (a negative phase runs the cycle backwards: backing away)
  const S = c15MegKit.S, Lm = (c15MegKit.L1 + c15MegKit.L2) * 0.965, cx = 32, legs = [0, 1].map(k => { const f = c15MegStride((ph + 0.5 * k) % 1, A, 0.4, 10); return { ax: cx + f.x * S, ay: 63 - c15MegKit.AH - f.y * S, a: f.a }; });
  let py = 0; for (const l of legs) py = Math.max(py, l.ay - Math.sqrt(Math.max(0, Lm * Lm - (l.ax - cx) * (l.ax - cx))));
  const w = Math.cos(2 * Math.PI * ph); return { x: cx, y: py, lean: 15, hdx: 2.5, hdt: 3, wind: 0.6, arms: [{ al: 53 * w, el: 88 + 10 * w }, { al: -53 * w, el: 88 - 10 * w }], legs, ex: 'grit' };
};
c15MegPoses.air = function (vy, hold) {      // in the air: k = -1 rising fast, 0 at the top, +1 falling fast
  const k = Math.max(-1, Math.min(1, vy / 240)), rise = { x: 32, y: 33.5, lean: 18, hdx: 2.5, hdt: 4, wind: 0.5, arms: [{ al: -50, el: 40 }, { al: 135, el: 40 }], legs: [{ ax: 21, ay: 52, a: -34 }, { ax: 37, ay: 47, a: -12 }], ex: 'grit' },
    top = { x: 32, y: 31.6, lean: 10, hdx: 2.2, hdt: 2, wind: 0.2, arms: [{ al: 30, el: 70 }, { al: 62, el: 52 }], legs: [{ ax: 30, ay: 48.5, a: -10 }, { ax: 36, ay: 45.5, a: -22 }], ex: 'grit' },
    fall = { x: 32, y: 32.5, lean: 5, hdx: 1.8, hdt: 0, wind: 0.3, arms: [{ al: 140, el: 30 }, { al: -60, el: 45 }], legs: [{ ax: 28, ay: 58, a: 12 }, { ax: 38, ay: 55, a: 18 }], ex: 'shock' };
  return k < 0 ? c15MegMixPose(top, rise, c15Sm(-k)) : c15MegMixPose(top, fall, c15Sm(k));
};
c15MegPoses.slide = function (u) {      // sliding under a bar: down (0 - 0.2), low (to 0.78), up
  const d = c15Sm(Math.min(u / 0.2, (1 - u) / 0.22)), a = c15MegPoses.run(0.3), b = { x: 31, y: 52.2, lean: -52, hdx: 1.4, hdt: -14, wind: 0.5, arms: [{ al: 62, el: 14 }, { al: -26, el: 30 }], legs: [{ ax: 22, ay: 60, a: 0 }, { ax: 49, ay: 58.5, a: -6 }], ex: 'grit' }; return c15MegMixPose(a, b, d);
};
c15MegPoses.stumble = function (u) {      // a trip: the body falls forward over a foot that is stuck, the arms fly up, then he catches himself and runs on
  const a = c15MegPoses.run(0.12), b = { x: 33, y: 38.5, lean: 46, hdx: 2.6, hdt: 14, wind: 0.7, arms: [{ al: 128, el: 22 }, { al: 98, el: 30 }], legs: [{ ax: 15, ay: 46, a: -52 }, { ax: 41, ay: 60.5, a: 4 }], ex: 'shock' }, c = c15MegPoses.run(0.55);
  return u < 0.38 ? c15MegMixPose(a, b, c15Sm(u / 0.38)) : c15MegMixPose(b, c, c15Sm((u - 0.38) / 0.62));
};
c15MegPoses.skid = function (t) {      // braking hard on the roof: leaning back, the feet wide and dragging, the arms out
  return { x: 31, y: 38, lean: -16, hdx: 1.2, hdt: -8, wind: 0, arms: [{ al: 58, el: 40 }, { al: -52, el: 36 }], legs: [{ ax: 24, ay: 59.5, a: 6 }, { ax: 45, ay: 59.5, a: -14 }], ex: 'shock' };
};
c15MegPoses.shock = function (t) {      // frozen with fright: the hands up in front of him, leaning away
  const b = Math.sin(t * 9) * 0.3; return { x: 31, y: 36.4 + b, lean: -9, hdx: 0.8, hdt: -6, wind: 0, arms: [{ al: 74, el: 80 }, { al: 52, el: 92 }], legs: [{ ax: 26, ay: 59.5, a: 0 }, { ax: 37, ay: 59.5, a: 0 }], ex: 'shock' };
};
c15MegPoses.backstep = function (ph) {      // backing away with small steps, the hands up, leaning away (he faces his enemy)
  const r = c15MegPoses.run(ph, 5.5), s = c15MegPoses.shock(0); r.lean = -7; r.hdx = 0.9; r.hdt = -5; r.wind = 0; r.arms = s.arms; r.ex = 'shock'; r.blood = 0.8; return r;
};

// ================================================================ the close-ups of the catch: bigger pictures made with the same shaded shapes (c15Big.eye = Megumi's eye, c15Big.suk = Sukuna's face from below, grinning)
const c15Big = (() => {
  const { Pix, cap, ell, uni, clip, M, K } = c15MegKit, RAD = Math.PI / 180, P = { rose: ['#f2bcc4', '#dc94a0', '#b4707e', '#7a4258'], skin: '#ecc0a0', red: '#aa3636' }, cache = new Map();
  const memo = (k, f) => { let c = cache.get(k); if (!c) { c = f(); cache.set(k, c); if (cache.size > 160) cache.delete(cache.keys().next().value); } return c; };
  const line = (p, pts, col, w = 1) => { for (let i = 0; i < pts.length - 1; i++) { const a = pts[i], b = pts[i + 1], n = Math.ceil(Math.max(Math.abs(b[0] - a[0]), Math.abs(b[1] - a[1]))) || 1; for (let k = 0; k <= n; k++) for (let j = 0; j < w; j++) p.px(a[0] + (b[0] - a[0]) * k / n, a[1] + (b[1] - a[1]) * k / n + j, col); } };
  const almond = (cx, cy, rx, ry, tilt) => ({ b: [cx - rx, cy - ry - 3, cx + rx, cy + ry + 3], f(x, y) { const u = (x - cx) / rx; if (Math.abs(u) >= 1) return null; const hh = ry * Math.pow(1 - u * u, 0.7), d = y - cy - u * tilt; if (Math.abs(d) >= hh) return null; return [u, d / hh, Math.sqrt(1 - (d / hh) * (d / hh))]; } });
  function eye(o) {      // Megumi's right eye (the nose is on the right), 176 x 96: o.open (how wide, 0.3 - 1.25), o.pup (the pupil, px), o.lx (look), o.brow (how high the brow is), o.sweat
    const W = 176, H = 96, p = new Pix(W, H), cx = 88, cy = 52, op = o.open === undefined ? 1 : o.open, pup = o.pup === undefined ? 6 : o.pup, lx = o.lx || 0, sk = EYS[1], skd = EYS[0], skdd = EYS[2], dk = K('#0c0a14'), wt = K('#f6f2ea'), bl = o.brow || 0;
    p.rect(0, 0, W, H, sk[2]); p.put(ell(cx, cy + 46, 96, 34), skd, 1); p.put(ell(cx - 6, cy - 42, 84, 24 - bl), skdd, 1); p.put(ell(cx, cy - 26, 62, 9), skd, 1);      // (the skin: the cheek under the eye, the shadow of the brow bone, the fold of the lid)
    const sh = almond(cx, cy, 54, 25 * op, 3), pe = (x, y) => sh.f(x, y);
    p.put(clip(ell(cx, cy, 56, 28), (x, y) => !!pe(x, y)), M('#e6e0d6'), 3);
    for (const [vx, vy, ex, ey] of [[cx - 52, cy + 1, cx - 36, cy - 3], [cx - 50, cy + 3, cx - 38, cy + 8], [cx + 52, cy + 4, cx + 38, cy + 1], [cx + 50, cy + 5, cx + 36, cy + 12], [cx + 48, cy, cx + 34, cy - 6]]) line(p, [[vx, vy], [ex, ey]], K('#b8423e'), 1);      // (little red veins)
    const ic = [cx + lx, cy + 1];
    p.put(clip(ell(ic[0], ic[1], 22, 22), (x, y) => !!pe(x, y)), M('#0c1220'), 3); p.put(clip(ell(ic[0], ic[1], 16.5, 16.5), (x, y) => !!pe(x, y)), M('#1c3048'), 3); p.put(clip(ell(ic[0], ic[1] + 3, 11, 9), (x, y) => !!pe(x, y)), M('#2c5068'), 3);
    p.put(clip(ell(ic[0], ic[1], pup, pup), (x, y) => !!pe(x, y)), M('#03040a'), 3);
    p.rect(Math.round(ic[0] - 12), Math.round(ic[1] - 12), 4, 3, wt); p.rect(Math.round(ic[0] + 8), Math.round(ic[1] + 9), 2, 2, wt);
    if (o.refl) { const r = Math.round(ic[1] + 10 * Math.min(op, 1)); line(p, [[ic[0] - 7, r - 1], [ic[0] - 3, r + 2], [ic[0] + 3, r + 2], [ic[0] + 7, r - 1]], wt, 1); p.px(ic[0] - 4, r - 5, K('#ff3a48')); p.px(ic[0] + 4, r - 5, K('#ff3a48')); }      // (in his eye: Sukuna's face, tiny, grinning)
    const top = [], bot = []; for (let u = -1; u <= 1.001; u += 0.05) { const hh = 25 * op * Math.pow(Math.max(0, 1 - u * u), 0.7); top.push([cx + u * 54, cy + u * 3 - hh]); bot.push([cx + u * 54, cy + u * 3 + hh]); }
    line(p, top, dk, 4); line(p, top.map(q => [q[0], q[1] - 6]), K('#c49a78'), 1); line(p, bot, K('#8a5a58'), 1);
    for (const [dx, dy, l] of [[50, -2, 9], [47, -5, 8], [42, -8, 8], [36, -10, 7]]) line(p, [[cx + dx, cy + dy], [cx + dx + l * 0.7, cy + dy - l * 0.7]], dk, 1);      // (lashes at the outer corner)
    const hr = K('#0e0c18'); p.put(cap(cx - 70, cy - 45 - bl, cx + 66, cy - 37 - bl * 0.6, 3.4, 4.6), M('#0e0c18'), 3); for (let k = 0; k < 20; k++) { const x = cx - 66 + k * 6.6, y = cy - 46 - bl + (k * 8 / 20) * 1.0; line(p, [[x, y - 3], [x + 3, y - 8 - (k % 3)]], hr, 1); }
    if (o.sweat) { const sx = cx + 38, sy = cy - 58 + (o.sweat > 1 ? (o.sweat - 1) * 22 : 0); p.put(ell(sx, sy, 3.2, 4.6), M('#cfe6f0'), 1); p.px(sx - 1, sy - 1, K('#ffffff')); }
    return p;
  }
  const mat = (t, o) => { const m = t.map(K); m.o = K(o); return m; };      // (a material from four tones and an outline colour: the shadow, the shade, the mid tone, the light)
  const SKS = mat(['#a46c60', '#d09c80', '#ecc0a0', '#f8d8bc'], '#3a1c24'), SKD = mat(['#6e4048', '#a46c60', '#c48c76', '#e0b090'], '#2a1218');
  const EYS = [mat(['#a88a7c', '#c8a898', '#e4c8b4', '#f6e2cc'], '#3a2430'), mat(['#c8a898', '#e4c8b4', '#f6e2cc', '#fff0dc'], '#3a2430'), mat(['#7a5a58', '#a88a7c', '#c8a898', '#e4c8b4'], '#2a1820')];      // (Megumi's skin in the dark: paler and greyer than the sprite's)
  function suk(o) {      // Sukuna's face seen from below (Megumi's eyes), grinning, 150 x 130: o.sw (how wide the smile is, 0.4 - 1.2), o.e2 (how far the second pair of eyes has opened, 0 - 1), o.lid (how heavy the lids are)
    const W = 150, H = 130, p = new Pix(W, H), cx = 75, sw = o.sw === undefined ? 0.8 : o.sw, e2 = o.e2 === undefined ? 0.6 : o.e2, lid = o.lid === undefined ? 0.5 : o.lid, rose = P.rose.map(h => M(h)), blk = K('#0e0a1a'), wt = K('#f2ece4');
    p.put(uni(ell(cx, 34, 50, 28), cap(34, 46, 24, 88, 8, 1), cap(116, 46, 126, 88, 8, 1)), rose[2], 2);      // (the hair behind: a mass and the locks at the sides)
    for (const [ang, len, r] of [[-170, 40, 8], [-152, 46, 8.5], [-134, 52, 9], [-114, 56, 9], [-94, 58, 9.5], [-74, 56, 9], [-54, 52, 8.5], [-36, 46, 8], [-20, 38, 7]]) { const a = ang * RAD, bx = cx + Math.cos(a) * 34, by = 40 + Math.sin(a) * 22; p.put(cap(bx, by, bx + Math.cos(a) * len, by + Math.sin(a) * len, r, 0.6), rose[ang < -100 ? 1 : 2], 0); }
    p.put(uni(ell(cx, 74, 40, 44), cap(cx - 30, 96, cx, 119, 12, 9), cap(cx + 30, 96, cx, 119, 12, 9)), SKS); p.put(cap(cx, 112, cx, 130, 15, 17), SKD, 1); p.put(cap(cx - 44, 128, cx + 44, 130, 10, 10), M('#aa3636'), 0);      // (the face, the chin, the neck and the red collar)
    for (const [x0, x1, y1, r] of [[-38, -30, 62, 7], [-26, -18, 56, 7.5], [-12, -6, 52, 7.5], [2, 6, 52, 7.5], [14, 20, 55, 7.5], [26, 32, 58, 7.5], [36, 42, 64, 7]]) p.put(cap(cx + x0 * 0.9, 38, cx + x1, y1, r, 0.5), rose[1], 0);      // (the fringe: pointed locks over the forehead)
    p.put(cap(cx - 41, 52, cx - 44, 80, 5, 0.8), rose[1], 0); p.put(cap(cx + 41, 52, cx + 44, 80, 5, 0.8), rose[1], 0);
    for (let k = -1; k <= 1; k += 2) {
      const ex = cx + k * 21, ey = 66, al = almond(ex, ey, 16, 6.2 - lid * 3.2, k * -3);
      p.put(al, mat(['#7a6a62', '#a89a90', '#cdbfb4', '#e4d8cc'], '#1a1018'), 3); p.put(clip(ell(ex, ey + 0.5, 6.4, 7), (x, y) => !!al.f(x, y)), M('#d4283a'), 3); p.put(clip(ell(ex, ey + 0.5, 2, 6), (x, y) => !!al.f(x, y)), M('#0a0408'), 3);
      line(p, Array.from({ length: 11 }, (_, i) => { const u = -1 + i * 0.2; return [ex + u * 16, ey - 6.2 * Math.pow(Math.max(0, 1 - u * u), 0.7) * (1 - lid * 0.5) + u * k * -3]; }), blk, 3);
      p.put(cap(ex - k * 16, 54 + lid * 4, ex + k * 17, 61 + lid * 3, 2.4, 1.6), M('#7a4258'), 3);      // (the brows, slanting down to the middle)
      const a2 = almond(ex + k * 3, 80, 11, 3.6 * e2, k * -2); if (e2 > 0.05) { p.put(a2, mat(['#5a4a48', '#8a7a72', '#b8a8a0', '#d4c8c0'], '#1a1018'), 3); p.put(clip(ell(ex + k * 3, 80, 3.4, 4), (x, y) => !!a2.f(x, y)), M('#d4283a'), 3); p.px(ex + k * 3, 80, K('#0a0408')); }      // (the second pair of eyes)
      line(p, [[ex + k * 10, 92], [ex + k * 13, 100], [ex + k * 15, 106]], blk, 1);      // (a mark on the cheek)
    }
    line(p, [[cx - 38, 74], [cx - 20, 72], [cx + 20, 72], [cx + 38, 74]], blk, 2); line(p, [[cx - 2, 42], [cx - 2, 52]], blk, 2); line(p, [[cx + 2, 42], [cx + 2, 52]], blk, 2);      // (the band across the nose, a mark on the forehead)
    p.px(cx - 4, 90, blk); p.px(cx + 4, 90, blk); line(p, [[cx - 3, 76], [cx - 5, 89]], K('#a46c60'), 1);      // (the nose)
    const my = 99, mw = 26 + 12 * sw, lift = 3 + 6 * sw, ph = u => my + u * u * lift - lift * 0.4;      // the grin: a dark red mouth, a row of teeth, the lips; the corners go up into the cheeks
    const mouth = []; for (let u = -1; u <= 1.001; u += 0.1) mouth.push([cx + u * mw, ph(u)]);
    line(p, mouth, K('#3a0a14'), 7); for (let u = -0.86; u <= 0.87; u += 0.115) { const x = cx + u * mw, y = ph(u); p.rect(Math.round(x) - 2, Math.round(y) - 1, 4, 5, wt); p.px(x - 2, y + 4, K('#c8bcb0')); }
    line(p, mouth.map(q => [q[0], q[1] - 3]), K('#7a2838'), 1); line(p, mouth.map(q => [q[0], q[1] + 7]), K('#7a2838'), 1); line(p, [[cx - mw - 2, ph(-1) - 3], [cx - mw - 6, ph(-1) - 9]], blk, 1); line(p, [[cx + mw + 2, ph(1) - 3], [cx + mw + 6, ph(1) - 9]], blk, 1);
    return p;
  }
  return { eye: o => memo('e' + JSON.stringify(o), () => eye(o).canvas()), suk: o => memo('s' + JSON.stringify(o), () => suk(o).canvas()), line, P, memo, almond };
})();

c15MegPoses.grabbed = function (t) {      // held up by the face: leaning back, the head thrown back, both hands on the wrist that holds him, the legs hanging and kicking weakly
  const k = Math.sin(t * 5.5) * 3, k2 = Math.sin(t * 5.5 + 1.6) * 3;
  return { x: 32, y: 33, lean: -22, hdx: 0.4, hdt: -30, wind: 0, arms: [{ al: 150, el: 22 }, { al: 168, el: 8 }], legs: [{ ax: 25 + k * 0.4, ay: 55 + k, a: 22 }, { ax: 36 - k * 0.3, ay: 57 + k2, a: 34 }], ex: 'shock', blood: 0.85 };
};
c15MegPoses.lookup = function (ph, w) {      // running, the head thrown up to see what flies over him (w = 0 - 1)
  const o = c15MegPoses.run(ph); o.hdt = -30 * w; o.hdy = -1.2 * w; o.hdx = 2.5 - 1.2 * w; o.lean = 15 - 8 * w; o.ex = w > 0.35 ? 'shock' : 'grit'; return o;
};
