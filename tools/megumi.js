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
      const { w, h, g } = this, x0 = Math.max(0, Math.floor(sh.b[0]) - 1), y0 = Math.max(0, Math.floor(sh.b[1]) - 1), x1 = Math.min(w - 1, Math.ceil(sh.b[2]) + 1), y1 = Math.min(h - 1, Math.ceil(sh.b[3]) + 1), bw = x1 - x0 + 1; if (bw <= 0 || y1 < y0) return;      // (a shape that is all outside the picture draws nothing)
      const t = new Int8Array(bw * (y1 - y0 + 1)).fill(-1);
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
    const W = 176, H = 96, p = new Pix(W, H), cx = 88, cy = 52, op = o.open === undefined ? 1 : o.open, pup = o.pup === undefined ? 6 : o.pup, lx = o.lx || 0, Y = o.who === 'yuji', E = Y ? EYY : EYS, sk = E[1], skd = E[0], skdd = E[2], dk = K(Y ? '#2a140c' : '#0c0a14'), wt = K('#f6f2ea'), bl = o.brow || 0;
    p.rect(0, 0, W, H, sk[2]); p.put(ell(cx, cy + 46, 96, 34), skd, 1); p.put(ell(cx - 6, cy - 42, 84, 24 - bl), skdd, 1); p.put(ell(cx, cy - 26, 62, 9), skd, 1);      // (the skin: the cheek under the eye, the shadow of the brow bone, the fold of the lid)
    const sh = almond(cx, cy, 54, 25 * op, 3), pe = (x, y) => sh.f(x, y);
    p.put(clip(ell(cx, cy, 56, 28), (x, y) => !!pe(x, y)), M('#e6e0d6'), 3);
    for (const [vx, vy, ex, ey] of [[cx - 52, cy + 1, cx - 36, cy - 3], [cx - 50, cy + 3, cx - 38, cy + 8], [cx + 52, cy + 4, cx + 38, cy + 1], [cx + 50, cy + 5, cx + 36, cy + 12], [cx + 48, cy, cx + 34, cy - 6]]) line(p, [[vx, vy], [ex, ey]], K('#b8423e'), 1);      // (little red veins)
    const ic = [cx + lx, cy + 1];
    p.put(clip(ell(ic[0], ic[1], 22, 22), (x, y) => !!pe(x, y)), M(Y ? '#2a1608' : '#0c1220'), 3); p.put(clip(ell(ic[0], ic[1], 16.5, 16.5), (x, y) => !!pe(x, y)), M(Y ? '#5a3a1e' : '#1c3048'), 3); p.put(clip(ell(ic[0], ic[1] + 3, 11, 9), (x, y) => !!pe(x, y)), M(Y ? '#8a5a30' : '#2c5068'), 3);
    p.put(clip(ell(ic[0], ic[1], pup, pup), (x, y) => !!pe(x, y)), M('#03040a'), 3);
    p.rect(Math.round(ic[0] - 12), Math.round(ic[1] - 12), 4, 3, wt); p.rect(Math.round(ic[0] + 8), Math.round(ic[1] + 9), 2, 2, wt);
    if (o.refl) { const r = Math.round(ic[1] + 10 * Math.min(op, 1)); line(p, [[ic[0] - 7, r - 1], [ic[0] - 3, r + 2], [ic[0] + 3, r + 2], [ic[0] + 7, r - 1]], wt, 1); p.px(ic[0] - 4, r - 5, K('#ff3a48')); p.px(ic[0] + 4, r - 5, K('#ff3a48')); }      // (in his eye: Sukuna's face, tiny, grinning)
    const top = [], bot = []; for (let u = -1; u <= 1.001; u += 0.05) { const hh = 25 * op * Math.pow(Math.max(0, 1 - u * u), 0.7); top.push([cx + u * 54, cy + u * 3 - hh]); bot.push([cx + u * 54, cy + u * 3 + hh]); }
    line(p, top, dk, 4); line(p, top.map(q => [q[0], q[1] - 6]), K('#c49a78'), 1); line(p, bot, K('#8a5a58'), 1);
    for (const [dx, dy, l] of [[50, -2, 9], [47, -5, 8], [42, -8, 8], [36, -10, 7]]) line(p, [[cx + dx, cy + dy], [cx + dx + l * 0.7, cy + dy - l * 0.7]], dk, 1);      // (lashes at the outer corner)
    const hc = Y ? '#6a3a1e' : '#0e0c18', hr = K(hc); p.put(cap(cx - 70, cy - 45 - bl, cx + 66, cy - 37 - bl * 0.6, 3.4, 4.6), M(hc), 3); for (let k = 0; k < 20; k++) { const x = cx - 66 + k * 6.6, y = cy - 46 - bl + (k * 8 / 20) * 1.0; line(p, [[x, y - 3], [x + 3, y - 8 - (k % 3)]], hr, 1); }
    if (o.sweat) { const sx = cx + 38, sy = cy - 58 + (o.sweat > 1 ? (o.sweat - 1) * 22 : 0); p.put(ell(sx, sy, 3.2, 4.6), M('#cfe6f0'), 1); p.px(sx - 1, sy - 1, K('#ffffff')); }
    if (o.tear) { const tw = o.tear, bx = cx + 6, by = cy + 25 * op * 0.9 + 1, ty = by + 8 + tw * 30; p.put(ell(bx, by, 24, 2.4 + 2 * tw), M('#cfe6f0'), 1); line(p, [[bx + 16, by + 2], [bx + 18, (ty + by) / 2], [bx + 16, ty]], K('#cfe6f0'), 2); if (ty < H - 8) p.put(ell(bx + 16, ty + 2, 2.6, 3.8), M('#e4f4fa'), 1); }      // (a tear: it wells along the lower lid and runs down his cheek)
    return p;
  }
  const mat = (t, o) => { const m = t.map(K); m.o = K(o); return m; };      // (a material from four tones and an outline colour: the shadow, the shade, the mid tone, the light)
  const SKS = mat(['#a46c60', '#d09c80', '#ecc0a0', '#f8d8bc'], '#3a1c24'), SKD = mat(['#6e4048', '#a46c60', '#c48c76', '#e0b090'], '#2a1218');
  const EYS = [mat(['#a88a7c', '#c8a898', '#e4c8b4', '#f6e2cc'], '#3a2430'), mat(['#c8a898', '#e4c8b4', '#f6e2cc', '#fff0dc'], '#3a2430'), mat(['#7a5a58', '#a88a7c', '#c8a898', '#e4c8b4'], '#2a1820')];      // (Megumi's skin in the dark: paler and greyer than the sprite's)
  const EYY = [mat(['#8a5a46', '#b07a5c', '#cc9a78', '#e4b894'], '#3a2018'), mat(['#a46a50', '#c88a68', '#e0a888', '#f4c8a4'], '#3a2018'), mat(['#6a4034', '#8a5a46', '#a87258', '#c08a6a'], '#2a1410')];      // (Yuji's: warmer, tan)
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
      const a2 = almond(ex + k * 3, 80, 13, 3.8 * e2, k * -2); if (e2 > 0.05) { p.put(a2, mat(['#5a4a48', '#8a7a72', '#b8a8a0', '#d4c8c0'], '#1a1018'), 3); p.put(clip(ell(ex + k * 3, 80, 2.4, 3.6), (x, y) => !!a2.f(x, y)), M('#d4283a'), 3); p.px(ex + k * 3, 80, K('#0a0408')); }      // (the second pair of eyes)
      line(p, [[ex + k * 10, 92], [ex + k * 13, 100], [ex + k * 15, 106]], blk, 1);      // (a mark on the cheek)
    }
    line(p, [[cx - 38, 74], [cx - 20, 72], [cx + 20, 72], [cx + 38, 74]], blk, 2); line(p, [[cx - 2, 42], [cx - 2, 52]], blk, 2); line(p, [[cx + 2, 42], [cx + 2, 52]], blk, 2);      // (the band across the nose, a mark on the forehead)
    p.px(cx - 4, 90, blk); p.px(cx + 4, 90, blk); line(p, [[cx - 3, 76], [cx - 5, 89]], K('#a46c60'), 1);      // (the nose)
    if (o.m) {      // a calm smirk: closed lips, one corner up, a dimple at the corner
      const my = 100; line(p, [[cx - 20, my + 1], [cx - 8, my + 2.6], [cx + 8, my + 1.4], [cx + 22, my - 3]], K('#5a2630'), 2); line(p, [[cx - 17, my + 5], [cx, my + 6.6], [cx + 16, my + 3]], K('#c88a78'), 1); line(p, [[cx + 24, my - 4], [cx + 28, my - 10]], blk, 1); line(p, [[cx - 22, my], [cx - 24, my - 3]], blk, 1);
    } else {
      const my = 99, mw = 26 + 12 * sw, lift = 3 + 6 * sw, ph = u => my + u * u * lift - lift * 0.4;      // the grin: a dark red mouth, a row of teeth, the lips; the corners go up into the cheeks
    const mouth = []; for (let u = -1; u <= 1.001; u += 0.1) mouth.push([cx + u * mw, ph(u)]);
    line(p, mouth, K('#3a0a14'), 7); for (let u = -0.86; u <= 0.87; u += 0.115) { const x = cx + u * mw, y = ph(u); p.rect(Math.round(x) - 2, Math.round(y) - 1, 4, 5, wt); p.px(x - 2, y + 4, K('#c8bcb0')); }
    line(p, mouth.map(q => [q[0], q[1] - 3]), K('#7a2838'), 1); line(p, mouth.map(q => [q[0], q[1] + 7]), K('#7a2838'), 1); line(p, [[cx - mw - 2, ph(-1) - 3], [cx - mw - 6, ph(-1) - 9]], blk, 1); line(p, [[cx + mw + 2, ph(1) - 3], [cx + mw + 6, ph(1) - 9]], blk, 1);
    }
    return p;
  }
  const hexMix = (a, b, t) => { const u = [1, 3, 5].map(i => parseInt(a.slice(i, i + 2), 16)), v = [1, 3, 5].map(i => parseInt(b.slice(i, i + 2), 16)); return '#' + u.map((x, i) => Math.round(x + (v[i] - x) * t).toString(16).padStart(2, '0')).join(''); };
  const matMix = (A, B, t, o1, o2) => mat(A.map((h, i) => hexMix(h, B[i], t)), hexMix(o1, o2, t));
  const FP = { rose: ['#7a4258', '#b4707e', '#dc94a0', '#f2bcc4'], orange: ['#8a4a22', '#b86a30', '#d88c44', '#f0b468'], black: ['#08060e', '#120e1c', '#1e1a2e', '#34304a'], skS: ['#a46c60', '#d09c80', '#ecc0a0', '#f8d8bc'], skY: ['#a46a50', '#c88a68', '#e0a888', '#f4c8a4'], skM: ['#a8887c', '#c8a898', '#e4c8b4', '#f6e2cc'] };
  function face(o) {      // a face seen from the front, 150 x 130. o.who: 'suk' | 'yuji' | 'meg'; o.yj: 0 = Sukuna's look .. 1 = Yuji's (hair pink -> orange, the marks and the red eyes fade); o.m: the mouth ('smirk' 'smile' 'closed' 'scream' 'horror'); o.lid (0 - 1 heavy, < 0 wide open), o.e2 (the second pair of eyes), o.marks (0 - 1), o.red (0 - 1: red eyes), o.hair (0 - 1: the hair has fallen over the eyes), o.sweat, o.tear, o.blood
    const W = 150, H = 130, p = new Pix(W, H), cx = 75, who = o.who || 'suk', yj = o.yj === undefined ? (who === 'yuji' ? 1 : 0) : o.yj, lid = o.lid === undefined ? 0.4 : o.lid, e2 = o.e2 || 0, marks = o.marks === undefined ? (who === 'yuji' ? 0 : 1) : o.marks, red = o.red === undefined ? (who === 'suk' ? 1 : who === 'meg' ? 0 : 0) : o.red, m = o.m || 'closed', blk = K('#0e0a1a'), wt = K('#f2ece4'), hair = o.hair || 0;
    const hr = who === 'meg' ? matMix(FP.black, FP.black, 0, '#0a0610', '#0a0610') : matMix(FP.rose, FP.orange, yj, '#3a1c2c', '#3a1c20'), sk = who === 'meg' ? matMix(FP.skM, FP.skM, 0, '#3a2430', '#3a2430') : matMix(FP.skS, FP.skY, yj, '#3a1c24', '#3a2018'), skd = who === 'meg' ? matMix(FP.skM.map(h => hexMix(h, '#000000', 0.25)), FP.skM, 0, '#2a1820', '#2a1820') : matMix(FP.skS.map(h => hexMix(h, '#000000', 0.25)), FP.skY.map(h => hexMix(h, '#000000', 0.25)), yj, '#2a1218', '#2a1810');
    const sp = who === 'meg' ? [[-172, 44, 8], [-154, 52, 8.5], [-136, 56, 9], [-116, 60, 9], [-96, 62, 9.5], [-76, 60, 9], [-56, 54, 8.5], [-38, 48, 8], [-22, 40, 7]] : [[-170, 40, 8], [-152, 46, 8.5], [-134, 52, 9], [-114, 56, 9], [-94, 58, 9.5], [-74, 56, 9], [-54, 52, 8.5], [-36, 46, 8], [-20, 38, 7]];
    p.put(uni(ell(cx, 34, 50, 28), cap(34, 46, 24, 88, 8, 1), cap(116, 46, 126, 88, 8, 1)), hr, 2);
    for (const [ang, len, r] of sp) { const a = ang * RAD, bx = cx + Math.cos(a) * 34, by = 40 + Math.sin(a) * 22; p.put(cap(bx, by, bx + Math.cos(a) * len, by + Math.sin(a) * len, r, 0.6), hr, who === 'meg' ? 2 : 0); }
    const fw = who === 'meg' ? 36 : 40; p.put(uni(ell(cx, 74, fw, 44), cap(cx - fw * 0.75, 96, cx, 119, 12, 9), cap(cx + fw * 0.75, 96, cx, 119, 12, 9)), sk); p.put(cap(cx, 112, cx, 130, 15, 17), skd, 1);
    if (who === 'meg') p.put(uni(cap(cx - 40, 122, cx + 40, 124, 12, 12), cap(cx - 30, 112, cx - 34, 130, 9, 9), cap(cx + 30, 112, cx + 34, 130, 9, 9)), M('#2a3350'), 0); else p.put(cap(cx - 44, 128, cx + 44, 130, 10, 10), M('#aa3636'), 0);      // (the high collar: his uniform, or the red hood)
    const fr = who === 'meg' ? [[-40, -34, 66 + hair * 22, 7.5], [-28, -22, 62 + hair * 24, 8], [-14, -10, 58 + hair * 26, 8], [0, 2, 56 + hair * 28, 8], [12, 16, 60 + hair * 26, 8], [24, 28, 64 + hair * 24, 8], [36, 40, 68 + hair * 22, 7.5]] : [[-38, -30, 62, 7], [-26, -18, 56, 7.5], [-12, -6, 52, 7.5], [2, 6, 52, 7.5], [14, 20, 55, 7.5], [26, 32, 58, 7.5], [36, 42, 64, 7]];
    for (const [x0, x1, y1, r] of fr) p.put(cap(cx + x0 * 0.9, 38, cx + x1, y1, r, 0.5), hr, who === 'meg' ? 2 : 0);      // (the fringe: pointed locks over the forehead)
    p.put(cap(cx - 41, 52, cx - 44, 80, 5, 0.8), hr, who === 'meg' ? 2 : 0); p.put(cap(cx + 41, 52, cx + 44, 80, 5, 0.8), hr, who === 'meg' ? 2 : 0);
    const iris = hexMix(who === 'meg' ? '#1c2a3e' : '#6a4426', '#d4283a', who === 'suk' ? 1 - yj : red), wide = lid < 0, ry = wide ? 8.6 : 6.2 - lid * 3.2, squeeze = m === 'scream';
    for (let k = -1; k <= 1; k += 2) {
      const ex = cx + k * 21, ey = 66;
      if (squeeze) { line(p, [[ex - 16, ey + 1], [ex - 8, ey - 5], [ex + 8, ey - 5], [ex + 16, ey + 1]], blk, 3); line(p, [[ex - 14, ey - 9], [ex + 14, ey - 9]], K('#a06a60'), 1); line(p, [[ex + k * 17, ey + 3], [ex + k * 21, ey + 8]], K('#a06a60'), 1); }
      else {
        const al = almond(ex, ey, 16, ry, k * -3); p.put(al, mat(['#9a8a82', '#c0b2a8', '#e6dcd2', '#f8f2ea'], '#1a1018'), 3); const ir = wide ? 4.4 : 6.4; p.put(clip(ell(ex, ey + 0.5, ir, ir + 0.6), (x, y) => !!al.f(x, y)), mat([hexMix(iris, '#000000', 0.5), hexMix(iris, '#000000', 0.25), iris, hexMix(iris, '#ffffff', 0.25)], '#0a0408'), 3); p.put(clip(ell(ex, ey + 0.5, wide ? 1.4 : 2, wide ? 1.6 : 6), (x, y) => !!al.f(x, y)), M('#0a0408'), 3);
        line(p, Array.from({ length: 11 }, (_, i) => { const u = -1 + i * 0.2; return [ex + u * 16, ey - ry * Math.pow(Math.max(0, 1 - u * u), 0.7) * (wide ? 1 : 1 - lid * 0.5) + u * k * -3]; }), blk, 3);
      }
      const bh = wide ? -7 : 0; p.put(cap(ex - k * 16, 54 + lid * 4 + bh, ex + k * 17, 61 + lid * 3 + (wide ? -11 : 0) + (squeeze ? 4 : 0), 2.6, 1.7), who === 'meg' ? M('#0e0c18') : hexMix('#7a4258', '#6a3a1e', yj) && matMix(['#5a2c3a', '#7a4258', '#8a4e62', '#9a5a70'], ['#4a2a12', '#6a3a1e', '#7a4a26', '#8a5a30'], yj, '#2a1218', '#2a1408'), 3);
      if (e2 > 0.05 && marks > 0.3) { const a2 = almond(ex + k * 3, 80, 13, 3.8 * e2, k * -2); p.put(a2, mat(['#5a4a48', '#8a7a72', '#b8a8a0', '#d4c8c0'], '#1a1018'), 3); p.put(clip(ell(ex + k * 3, 80, 2.4, 3.6), (x, y) => !!a2.f(x, y)), M('#d4283a'), 3); p.px(ex + k * 3, 80, K('#0a0408')); }
      if (marks > 0.15) line(p, [[ex + k * 10, 92], [ex + k * 13, 100], [ex + k * 15, 106]], blk, 1);
    }
    if (marks > 0.5) { line(p, [[cx - 38, 74], [cx - 20, 72], [cx + 20, 72], [cx + 38, 74]], blk, 2); line(p, [[cx - 2, 42], [cx - 2, 52]], blk, 2); line(p, [[cx + 2, 42], [cx + 2, 52]], blk, 2); } else if (marks > 0.15) line(p, [[cx - 20, 72], [cx + 20, 72]], K('#6a4440'), 1);
    p.px(cx - 4, 90, blk); p.px(cx + 4, 90, blk); line(p, [[cx - 3, 76], [cx - 5, 89]], K('#a46c60'), 1);      // (the nose)
    const my = 100;
    if (m === 'smirk') { line(p, [[cx - 20, my + 1], [cx - 8, my + 2.6], [cx + 8, my + 1.4], [cx + 22, my - 3]], K('#5a2630'), 2); line(p, [[cx - 17, my + 5], [cx, my + 6.6], [cx + 16, my + 3]], K('#c88a78'), 1); line(p, [[cx + 24, my - 4], [cx + 28, my - 10]], blk, 1); }
    else if (m === 'smile') { const yy = u => my + 3 - 12 * u * u; line(p, Array.from({ length: 13 }, (_, i) => { const u = -1 + i / 6; return [cx + u * 31, yy(u)]; }), K('#4a1a26'), 3); for (let u = -0.84; u <= 0.85; u += 0.12) p.rect(Math.round(cx + u * 27), Math.round(yy(u) + 1), 3, 3, wt); line(p, [[cx - 20, my + 7], [cx, my + 9.4], [cx + 20, my + 6]], K('#c88a78'), 1); line(p, [[cx - 32, my - 10], [cx - 36, my - 16]], blk, 1); line(p, [[cx + 32, my - 10], [cx + 36, my - 16]], blk, 1); }      // (a wide smile, the corners up in the cheeks)
    else if (m === 'scream') { p.put(ell(cx, my + 2, 16, 15), M('#2a0a12'), 3); for (let i = -3; i <= 3; i++) { p.rect(cx + i * 4 - 2, my - 11 + Math.abs(i) * 0.6, 4, 4, wt); p.rect(cx + i * 4 - 2, my + 9 - Math.abs(i) * 0.6, 4, 4, wt); } p.put(ell(cx, my + 8, 10, 5), M('#a8404c'), 3); line(p, [[cx - 17, my - 4], [cx - 22, my - 11]], blk, 1); line(p, [[cx + 17, my - 4], [cx + 22, my - 11]], blk, 1); }
    else if (m === 'horror') { p.put(ell(cx, my + 1, 12, 10), M('#2a0a12'), 3); for (let i = -2; i <= 2; i++) p.rect(cx + i * 4 - 2, my - 8, 4, 3, wt); p.put(ell(cx, my + 6, 7, 3), M('#a8404c'), 3); }
    else line(p, [[cx - 18, my + 2], [cx, my + 3], [cx + 18, my + 2]], K('#6a3a40'), 2);
    if (o.sweat) for (const [sx, sy] of [[cx - 30, 52], [cx + 34, 60], [cx + 8, 38]]) { p.put(ell(sx, sy + (o.sweat > 1 ? (o.sweat - 1) * 14 : 0), 2.2, 3.4), M('#cfe6f0'), 1); p.px(sx - 1, sy - 1, K('#ffffff')); }
    if (o.tear) for (const sx of [cx - 21, cx + 21]) line(p, [[sx - 2, 74], [sx - 3, 84 + o.tear * 8], [sx - 2, 96 + o.tear * 10]], K('#cfe6f0'), 1);
    if (o.blood) { line(p, [[cx + 14, my + 4], [cx + 15, my + 14], [cx + 14, my + 22]], K('#b8121c'), 2); }
    return p;
  }
  const PINK = mat(['#a06a60', '#c88a78', '#e0a898', '#f0c0b0'], '#3a1c24'), NAIL = mat(['#5a3a46', '#8a6a70', '#b89898', '#e0c8c0'], '#2a1820'), SKH = mat(['#8a5a52', '#b8806a', '#dcaa8e', '#f2cdb0'], '#2e1620'), FLESH = mat(['#4a0a12', '#7a1018', '#a8202a', '#c8404a'], '#1c0408'), CLAW = mat(['#0a0608', '#16101a', '#241a2a', '#3a2c44'], '#050304'), PALE = mat(['#a8887c', '#c8a898', '#e4c8b4', '#f6e2cc'], '#3a2430');
  function hands(o) {      // 176 x 96: Sukuna's right hand holds Megumi's jaw (the edge of it: the palm, the fingers wrapped round the cheek, the little finger out to the right) and his left hand takes that little finger: o.pull (0 - 1: how far it is pulled), o.torn (1: it is off: the stump), o.blood
    const p = new Pix(176, 96), pull = o.pull || 0, tn = o.torn;
    p.rect(0, 0, 176, 96, PALE[1]); p.put(ell(36, 56, 62, 54), PALE, 1); p.put(ell(20, 70, 40, 30), mat(['#98786c', '#b89888', '#d4b8a4', '#e8d0bc'], '#3a2430'), 1);      // (Megumi's cheek and jaw)
    p.put(uni(cap(76, 76, 50, 86, 6.4, 5.2), cap(50, 86, 34, 82, 5.2, 4.4)), SKH);      // (the thumb under his chin)
    for (const [y0, y1, x1, r] of [[36, 28, 26, 5.2], [46, 44, 24, 5.4], [56, 58, 28, 5.2]]) p.put(uni(cap(80, y0, 56, y1 - 2, r, r * 0.95), cap(56, y1 - 2, x1, y1, r * 0.95, r * 0.8)), SKH);      // (three fingers wrapped round his cheek)
    p.put(ell(90, 52, 20, 26), SKH);      // (the palm)
    if (!tn) { const ex = 124 + pull * 22, ey = 66 + pull * 3; p.put(uni(cap(100, 64, 114, 66, 5, 4.6), cap(114, 66, ex, ey, 4.6, 4.0)), SKH); p.put(ell(ex + 1, ey, 3, 2.6), mat(['#5a3a46', '#8a6a70', '#b89898', '#e0c8c0'], '#2a1820'), 3); for (const jx of [112, 122 + pull * 8]) p.px(jx, 62, K('#6a3a30')); }
    else { p.put(ell(103, 65, 5, 6), o.clean ? PINK : FLESH); if (o.blood) { for (const [bx, by] of [[100, 74], [108, 80], [96, 84]]) p.put(ell(bx, by, 1.6, 2.4), FLESH, 3); } }
    const lx = 150 + pull * 24 + (tn ? 24 : 0);      // (his left hand: the forearm, the palm, the thumb above the finger and the first finger below it)
    p.put(uni(cap(190, 40, lx + 10, 52, 12, 10), ell(lx, 56, 14, 13)), SKH); p.put(cap(lx - 4, 49, lx - 26 - (tn ? 0 : 2), 62, 4.4, 4.0), SKH); p.put(cap(lx - 4, 63, lx - 26 - (tn ? 0 : 2), 70, 4.4, 4.0), SKH);
    if (tn) { const ex = lx - 36; p.put(cap(lx - 22, 65, ex, 66, 4.4, 4.0), SKH); p.put(ell(ex - 1, 66, 3, 2.8), NAIL, 3); p.put(ell(lx - 22, 65, 3, 4), o.clean ? PINK : FLESH); }      // (the finger in his pinch: his own skin, the torn end at the back)
    return p;
  }
  function finger(o) {      // 160 x 64: the finger in the pinch of his thumb and first finger, ripped off; o.red (0 - 1: it turns red), o.nl (0 - 1: the black nail grows long), o.blood
    const p = new Pix(160, 64), rd = o.red || 0, nl = o.nl || 0, body = matMix(['#8a5a52', '#b8806a', '#dcaa8e', '#f2cdb0'], ['#3a0810', '#6a0c18', '#a01c28', '#c83a44'], rd, '#2e1620', '#1c0408');
    p.rect(0, 0, 160, 64, K('#10060a'));
    p.put(uni(cap(34, 32, 80, 31, 7.2, 6.4), cap(80, 31, 110, 30, 6.4, 5.4)), body); for (const jx of [58, 86]) { p.rect(jx, 27, 1, 10, body.o); } if (rd > 0.3) for (const [vx, vy] of [[44, 26], [66, 38], [92, 26], [100, 36]]) p.px(vx, vy, K('#e0505a'));
    const L = 14 + nl * 34, th = 5.4 - nl * 1.6; p.put(uni(cap(108, 30, 108 + L * 0.7, 31, th, th * 0.8), cap(108 + L * 0.7, 31, 110 + L, 31 + nl * 6, th * 0.8, 0.5)), nl > 0.2 ? CLAW : mat(['#8a6a70', '#b89898', '#e0c8c0', '#f4e8e0'], '#2a1820'), 0);      // (the nail: a short human one, then a long black claw)
    if (nl > 0.2) p.line([112, 28], [108 + L * 0.8, 29 + nl * 3], K('#5a4a6a'));
    p.put(ell(33, 32, 5, 7), o.clean ? PINK : FLESH); p.px(31, 30, K('#f0e0d0')); if (o.blood) for (const [bx, by] of [[26, 42], [30, 50], [22, 56]]) p.put(ell(bx, by, 1.6, 2.6), FLESH, 3);      // (the torn end)
    p.put(uni(cap(104, 2, 70, 27, 5.2, 4.4), ell(106, 0, 8, 5)), SKH); p.put(uni(cap(104, 62, 72, 37, 5.2, 4.4), ell(106, 64, 8, 5)), SKH);      // (the thumb and the first finger that hold it)
    return p;
  }
  function yhand(o) {      // 176 x 96: Yuji's right hand seen from his own eyes (palm to him, fingers up, the thumb on the right): the little finger is gone; o.blood (FULL): the stump bleeds, else a clean pink stump
    const p = new Pix(176, 96), YS = mat(['#a46a50', '#c88a68', '#e0a888', '#f4c8a4'], '#3a2018'), YD = mat(['#8a5440', '#a87258', '#c48c6c', '#d8a484'], '#2a1410');
    p.rect(0, 0, 176, 96, K('#120608')); p.put(ell(88, 104, 48, 40), YD, 1);
    for (const [x0, y0, x1, y1, r0, r1] of [[70, 76, 68, 22, 7, 5.6], [89, 72, 89, 8, 7.4, 6], [108, 76, 110, 20, 7, 5.6]]) p.put(cap(x0, y0, x1, y1, r0, r1), YS, 1);      // (the ring, middle and first fingers)
    p.put(cap(126, 90, 150, 50, 8, 6), YS, 1); p.put(ell(88, 88, 38, 28), YS, 1);      // (the thumb, the palm)
    p.put(cap(51, 84, 50, 66, 7, 6.6), YS, 1); p.put(ell(50, 66, 6.4, 3.6), o.blood ? FLESH : PINK, 3);      // (the stump where the little finger was)
    for (const x of [68, 89, 110]) for (const y of [38, 54]) p.rect(x - 5, y, 10, 1, K('#8a5440')); p.line([62, 90], [112, 82], K('#8a5440')); p.line([70, 84], [66, 70], K('#8a5440'));      // (the folds of the fingers, the lines of the palm)
    if (o.blood) for (const [bx, by] of [[50, 58], [47, 70], [53, 76]]) p.put(ell(bx, by, 1.8, 3), FLESH, 3);
    return p;
  }
  function mouth(o) {      // 176 x 96: Megumi's lower face from the front: the nose, the mouth forced open by the fingers on his cheeks (o.open 0 - 1), the finger with its black nail coming in from the right (o.fin 0 - 1), tears
    const p = new Pix(176, 96), op = o.open === undefined ? 0.5 : o.open, fin = o.fin || 0;
    p.rect(0, 0, 176, 96, PALE[1]); p.put(ell(88, 120, 100, 60), PALE, 1); p.put(ell(88, 6, 70, 22), mat(['#98786c', '#b89888', '#d4b8a4', '#e8d0bc'], '#3a2430'), 1);
    p.put(uni(ell(88, 14, 11, 8), ell(80, 18, 3.4, 2.4), ell(96, 18, 3.4, 2.4)), PALE); p.px(80, 19, K('#5a3a40')); p.px(96, 19, K('#5a3a40')); p.line([88, 22], [88, 30], K('#c0a090'));      // (the nose, the groove under it)
    const cy = 56, rx = 14 + 28 * op, ry = 3 + 22 * op; p.put(ell(88, cy - 1, rx + 5, ry + 5), mat(['#a8586a', '#c47080', '#e09098', '#f0b0b4'], '#4a1820'), 1);      // (the lips)
    p.put(ell(88, cy, rx, ry), M('#2a0a12'), 3); if (op > 0.15) { for (let i = -5; i <= 5; i++) { p.rect(88 + i * Math.max(3, rx / 6) - 2, cy - ry + 1 + Math.abs(i) * 0.4, 4, 4, K('#f2ece4')); if (op > 0.45) p.rect(88 + i * Math.max(3, rx / 6) - 2, cy + ry - 5 - Math.abs(i) * 0.4, 4, 4, K('#e8e0d6')); } p.put(ell(88, cy + ry * 0.45, rx * 0.6, ry * 0.45), mat(['#7a2a38', '#a04050', '#c8606c', '#e08890'], '#3a0a14'), 3); }
    for (const [y0, x1, y1, r] of [[30, 38, 40, 5.4], [44, 36, 50, 5.6], [58, 40, 62, 5.4], [72, 46, 74, 5]]) p.put(cap(-6, y0, x1, y1, r, r * 0.8), SKH);      // (the fingers on his left cheek: they pull the corner of the mouth out)
    p.put(cap(188, 46, 148, 60, 7, 6.4), SKH);      // (the thumb on his right cheek)
    if (fin > 0) { const tx = 176 - 118 * fin, ty = cy; p.put(cap(210, ty - 2, tx + 30, ty, 9, 6.4), mat(['#4a0a12', '#7a1018', '#a8202a', '#c8404a'], '#1c0408')); p.put(uni(cap(tx + 30, ty, tx + 2, ty + 2, 5.6, 3.2), cap(tx + 2, ty + 2, tx - 18, ty + 7, 3.2, 0.5)), CLAW, 0); }
    if (o.tear) for (const [x0, x1] of [[34, 30], [142, 146]]) p.line([x0, 0], [x1, 14 + o.tear * 14], K('#cfe6f0'));
    return p;
  }
  function neck(o) {      // 176 x 96: Megumi's chin, neck and the high collar from the front; o.g (0 - 1): the lump of the swallow goes down the throat; o.strain
    const p = new Pix(176, 96), g = o.g || 0;
    p.rect(0, 0, 176, 96, K('#140a10')); p.put(cap(88, 20, 88, 96, 31, 40), mat(['#7a5a52', '#a07c70', '#c4a090', '#e2c4b0'], '#3a2430'), 1); p.put(ell(88, -10, 68, 34), PALE, 1);      // (the neck, wider at the bottom, and the underside of his jaw)
    p.put(ell(88, 25, 60, 9), mat(['#4a3038', '#6a4a50', '#8a6a68', '#a88a84'], '#2a1820'), 1);      // (the shadow of the chin on the neck)
    p.put(uni(cap(2, 92, 62, 80, 16, 14), cap(174, 92, 114, 80, 16, 14)), M('#2a3350'), 0);      // (the high collar)
    if (o.strain) for (const x of [64, 112]) p.line([x, 34], [x + (x < 88 ? 5 : -5), 84], K('#8a6a78'));      // (the tendons)
    const gy = 34 + 40 * g; p.put(ell(88, gy + 6, 13, 8), mat(['#5a3a40', '#7a5a58', '#9a7a74', '#b8968c'], '#2a1820'), 1); p.put(ell(88, gy, 10, 12), mat(['#8a6a62', '#b08e84', '#d4b0a4', '#ecd0c4'], '#3a2430'), 0);      // (the lump: a bulge with its shadow under it)
    if (o.blood) p.line([62, 30], [60, 58], K('#b8121c'));
    return p;
  }
  function hairdown(o) {      // 176 x 96: Megumi's head hanging: the black hair falls over his face, the strands hang down to the collar, a drop at the tip of one of them (o.drop 0 - 1: it falls)
    const p = new Pix(176, 96), hr = mat(['#06050a', '#0e0c18', '#1c1a34', '#38345c'], '#030208'); p.rect(0, 0, 176, 96, K('#1c0c14'));
    p.put(uni(cap(8, 94, 70, 96, 18, 16), cap(168, 94, 106, 96, 18, 16)), M('#2a3350'), 0); p.put(cap(88, 70, 88, 96, 16, 18), mat(['#7a5a50', '#98786c', '#b89888', '#d4b8a4'], '#2a1820'), 1);
    p.put(ell(88, 22, 78, 34), hr, 2);
    for (let i = 0; i < 17; i++) { const x = 14 + i * 9.4 + (c4R(i, 91) - 0.5) * 6, y0 = 30 + c4R(i, 92) * 10, len = 40 + c4R(i, 93) * 34 + (Math.abs(i - 8) < 5 ? 12 : 0), sw = (c4R(i, 94) - 0.5) * 12; p.put(cap(x, y0, x + sw, y0 + len, 5.6 + c4R(i, 95) * 2, 0.6), hr, 2); }
    for (let i = 0; i < 7; i++) { const x = 30 + i * 20 + (c4R(i, 96) - 0.5) * 8; p.px(x, 40 + c4R(i, 97) * 20, K('#34304a')); p.px(x + 1, 44 + c4R(i, 97) * 20, K('#34304a')); }
    return p;
  }
  function fingers(o) {      // the fingers of the hand on his jaw, seen from the front (they come in from the lower right and press on his cheek), 64 x 64: o.press (0 - 1: how hard)
    const p = new Pix(64, 64), SKH = mat(['#8a5a52', '#b8806a', '#dcaa8e', '#f2cdb0'], '#2e1620'), pr = o.press || 0, nail = mat(['#3a2430', '#5a3a46', '#8a6a70', '#c0a0a0'], '#1c1018');
    for (let i = 3; i >= 0; i--) { const bx = 46 + i * 5, by = 66, tx = 22 + i * 9 - pr * 2, ty = 12 + i * 6 + pr * 2; p.put(cap(bx, by, tx, ty, 5.6, 4.6), SKH); const a = Math.atan2(ty - by, tx - bx); p.put(ell(tx - Math.cos(a) * 1.5, ty - Math.sin(a) * 1.5, 3.2, 2.6), nail, 0); }
    p.put(cap(64, 60, 56 - pr, 34 + pr * 2, 6.6, 5.2), SKH); return p;
  }
  return { eye: o => memo('e' + JSON.stringify(o), () => eye(o).canvas()), fingers: o => memo('f' + JSON.stringify(o), () => fingers(o).canvas()), suk: o => memo('s' + JSON.stringify(o), () => suk(o).canvas()), face: o => memo('F' + JSON.stringify(o), () => face(o).canvas()), hands: o => memo('H' + JSON.stringify(o), () => hands(o).canvas()), finger: o => memo('G' + JSON.stringify(o), () => finger(o).canvas()), mouth: o => memo('O' + JSON.stringify(o), () => mouth(o).canvas()), yhand: o => memo('Y' + JSON.stringify(o), () => yhand(o).canvas()), neck: o => memo('N' + JSON.stringify(o), () => neck(o).canvas()), hairdown: o => memo('D' + JSON.stringify(o), () => hairdown(o).canvas()), line, P, memo, almond };
})();

c15MegPoses.lookup = function (ph, w) {      // running, the head thrown up to see what flies over him (w = 0 - 1)
  const o = c15MegPoses.run(ph); o.hdt = -30 * w; o.hdy = -1.2 * w; o.hdx = 2.5 - 1.2 * w; o.lean = 15 - 8 * w; o.ex = w > 0.35 ? 'shock' : 'grit'; return o;
};

// ================================================================ SUKUNA in Yuji's body, v1.146: the same kind of shaded-shape figure as Megumi, but bigger and broader (1.1), with the look of the manga: short spiky pink hair, the high red hood round his neck, the dark uniform with its gold buttons,
// a thin mark across the bridge of his nose and under his eye, a second pair of eyes under the first, a narrow red eye. A pose = numbers (see c15SukPoses); c15Suk(pose) -> a 64 x 72 picture facing right (soles on row 70); c15SukPts(pose) = where his head, jaw and hands are (picture coordinates).
const c15SukKit = (() => {
  const { Pix, cap, ell, uni, K, OY } = c15MegKit, RAD = Math.PI / 180, GY = 63, cache = new Map(), cl = (v, a, b) => Math.max(a, Math.min(b, v));
  const mat = (t, o) => { const m = t.map(K); m.o = K(o); return m; };
  const SK = mat(['#a46c60', '#d09c80', '#ecc0a0', '#f8d8bc'], '#3a1c24'), SKF = mat(['#7a4a44', '#a46c60', '#c48c76', '#e0b090'], '#2e1620'), HR = mat(['#7a4258', '#b4707e', '#dc94a0', '#f2bcc4'], '#3a1c2c'), hrMix = {},
    JK = mat(['#161c3a', '#222a52', '#34407a', '#4c5aa0'], '#080a1c'), JKF = mat(['#10142a', '#181e3c', '#242c58', '#343e74'], '#04060e'), HD = mat(['#541424', '#782a30', '#aa3636', '#d85a5a'], '#2a0a14'),
    PN = mat(['#0a0c16', '#10131f', '#181c2c', '#262c42'], '#04050a'), PNF = mat(['#06070e', '#0a0c16', '#10131f', '#181c2c'], '#030408'), BT = mat(['#3a0c18', '#782a30', '#aa3636', '#d85a5a'], '#1a0810'), BTF = mat(['#2a0812', '#541424', '#782a30', '#aa3636'], '#14060c');
  const S = 1.1, L1 = 12.9 * S, L2 = 12.4 * S, LT = 17.6 * S, AH = 3.5 * S, UA = 10.6 * S, FA = 9.8 * S, GROUND = GY - AH;
  function geom(o) {
    const lean = (o.lean === undefined ? 3 : o.lean) * RAD, ux = Math.sin(lean), uy = -Math.cos(lean), fx = -uy, fy = ux, P = [o.x === undefined ? 32 : o.x, (o.y === undefined ? 32.6 : o.y) + OY];
    const at = (t, d) => [P[0] + ux * LT * t + fx * d * S, P[1] + uy * LT * t + fy * d * S], Wd = at(0.3, 0), W2 = at(0.68, 0), Nk = at(1, 0), Sh = at(0.84, -0.2);
    const ht = (o.hdt || 0) * RAD, hox = (o.hdx === undefined ? 1.2 : o.hdx) * S, hoy = -6.9 * S + (o.hdy || 0), hd = [Nk[0] + hox * Math.cos(ht) - hoy * Math.sin(ht), Nk[1] + hox * Math.sin(ht) + hoy * Math.cos(ht)];
    const ar = o.arms || [{ al: -8, el: 20 }, { al: 6, el: 24 }], arms = ar.map(a => { const a1 = a.al * RAD, a2 = (a.al + a.el) * RAD, E = [Sh[0] + Math.sin(a1) * UA, Sh[1] + Math.cos(a1) * UA], W = [E[0] + Math.sin(a2) * FA, E[1] + Math.cos(a2) * FA]; return { E, W, h: [W[0] + Math.sin(a2) * 2.3 * S, W[1] + Math.cos(a2) * 2.3 * S], pk: a.pk }; });
    return { P, at, Wd, W2, Nk, Sh, hd, ht, arms };
  }
  function reach(o, k, tx, ty) {      // sets o.arms[k] so that the hand is at (tx, ty) (picture coordinates): the elbow points down and back, like a real arm
    const Sh = geom(o).Sh, dx = tx - Sh[0], dy = ty - Sh[1], d0 = Math.hypot(dx, dy) || 1, d = Math.min(d0 - 2.3 * S, (UA + FA) * 0.995), ux = dx / d0, uy = dy / d0, wx = Sh[0] + ux * d, wy = Sh[1] + uy * d;
    const a = Math.acos(cl((UA * UA + d * d - FA * FA) / (2 * UA * d), -1, 1)), th = Math.atan2(wy - Sh[1], wx - Sh[0]) + a, E = [Sh[0] + UA * Math.cos(th), Sh[1] + UA * Math.sin(th)];
    const al = Math.atan2(E[0] - Sh[0], E[1] - Sh[1]) / RAD, a2 = Math.atan2(wx - E[0], wy - E[1]) / RAD; o.arms = o.arms.slice(); o.arms[k] = { al, el: a2 - al, pk: 0 }; return o;
  }
  function ik(hx, hy, ax, ay, L1_, L2_) { const dx = ax - hx, dy = ay - hy, d = Math.max(0.1, Math.min(Math.hypot(dx, dy), (L1_ + L2_) * 0.999)), a = Math.acos(cl((L1_ * L1_ + d * d - L2_ * L2_) / (2 * L1_ * d), -1, 1)), th = Math.atan2(dy, dx) - a; return [hx + L1_ * Math.cos(th), hy + L1_ * Math.sin(th)]; }
  const hexMix = (a, b, t) => { const u = [1, 3, 5].map(i => parseInt(a.slice(i, i + 2), 16)), v = [1, 3, 5].map(i => parseInt(b.slice(i, i + 2), 16)); return '#' + u.map((x, i) => Math.round(x + (v[i] - x) * t).toString(16).padStart(2, '0')).join(''); };
  const hairOf = yj => { const k = Math.round(yj * 10); if (k <= 0) return HR; return hrMix[k] || (hrMix[k] = mat(['#7a4258', '#b4707e', '#dc94a0', '#f2bcc4'].map((h, i) => hexMix(h, ['#8a4a22', '#b86a30', '#d88c44', '#f0b468'][i], k / 10)), hexMix('#3a1c2c', '#3a2010', k / 10))); };
  function draw(o) {
    const p = new Pix(64, 72), g = geom(o), yj = o.yj || 0, HRM = hairOf(yj), { P, at, Wd, W2, Nk, Sh, hd, ht, arms } = g, lg = (o.legs || [{ ax: 28, ay: GROUND, a: 0 }, { ax: 36, ay: GROUND, a: 0 }]).map(l => ({ ax: l.ax, ay: l.ay + OY, a: l.a }));
    const drawArm = k => { const a = arms[k], far = k === 0, m = far ? JKF : JK; p.put(uni(ell(Sh[0], Sh[1], 3.1 * S, 3.1 * S), cap(Sh[0], Sh[1], a.E[0], a.E[1], 2.7 * S, 2.3 * S), cap(a.E[0], a.E[1], a.W[0], a.W[1], 2.3 * S, 1.8 * S)), m); if (!a.pk) p.put(ell(a.h[0], a.h[1], 2.1 * S, 2.3 * S), far ? SKF : SK); };
    const drawLeg = k => { const l = lg[k], far = k === 0, Hp = [P[0] + 0.4, P[1]], Kn = ik(Hp[0], Hp[1], l.ax, l.ay, L1, L2); p.put(uni(cap(Hp[0], Hp[1], Kn[0], Kn[1], 3.5 * S, 3.0 * S), cap(Kn[0], Kn[1], l.ax, l.ay, 3.0 * S, 1.9 * S)), far ? PNF : PN);
      const a = -(l.a || 0) * RAD, cs = Math.cos(a), sn = Math.sin(a), R = (x, y) => [l.ax + (x * cs - y * sn) * S, l.ay + (x * sn + y * cs) * S], hh = R(-2.4, 1.6), tt = R(4.8, 2.0); p.put(cap(hh[0], hh[1], tt[0], tt[1], 2.1 * S, 1.7 * S), far ? BTF : BT); p.line(R(-1.8, 2.9), R(4.4, 3.2), K('#1a1018')); };
    if (!o.front) drawArm(0); drawLeg(0);      // (o.front: the far arm is drawn last, in front of the body)
    p.put(uni(cap(P[0], P[1], Wd[0], Wd[1], 5.2 * S, 4.8 * S), cap(Wd[0], Wd[1], W2[0], W2[1], 4.8 * S, 5.8 * S), cap(W2[0], W2[1], Nk[0], Nk[1], 5.8 * S, 4.0 * S)), JK);      // (the jacket: broad shoulders)
    const b1 = at(0.45, 5.0), b2 = at(0.62, 5.3); p.px(b1[0], b1[1], K('#deb040')); p.px(b2[0], b2[1], K('#deb040'));      // (two gold buttons)
    p.put(cap(hd[0] - 1.1 * S, hd[1] + 3.2 * S, Nk[0] + 0.3 * S, Nk[1] - 0.5 * S, 2.3 * S, 2.7 * S), SK);      // (the neck)
    p.put(uni(cap(Nk[0] - 0.4, Nk[1] + 2.4, Nk[0] + 0.4, Nk[1] - 2.6, 3.8 * S, 4.1 * S), ell(Nk[0] - 2.6 * S, Nk[1] + 0.6, 3.2 * S, 3.4 * S)), HD);      // (the high red hood round his neck)
    const [hx, hy] = hd; p.put(uni(ell(hx - 0.3 * S, hy - 0.4 * S, 4.6 * S, 4.7 * S), ell(hx + 1.1 * S, hy + 1.4 * S, 3.6 * S, 3.5 * S), cap(hx + 3.5 * S, hy + 0.3 * S, hx + 4.9 * S, hy + 1.4 * S, 0.75 * S, 0.55 * S)), SK);      // (the head, the nose)
    // the hair: short spikes brushed up and back, the pink of the picture, a lighter point on each
    const wd = o.wind || 0, sway = wd * 24 * RAD, hl = K('#f8d4da'), hs = K('#7a4258');
    p.put(uni(ell(hx - 1.0 * S, hy - 2.1 * S, 4.8 * S, 3.5 * S), ell(hx - 3.4 * S, hy + 0.3 * S, 1.9 * S, 2.8 * S)), HRM, 2);
    for (const [ang, len, r] of [[-178, 6.4, 2.0], [-160, 7.4, 2.2], [-142, 7.8, 2.3], [-124, 7.8, 2.3], [-106, 7.4, 2.3], [-88, 7.2, 2.3], [-70, 6.8, 2.2], [-54, 6.2, 2.0], [-40, 5.2, 1.7]]) {
      const a = ang * RAD - sway * (ang < -80 ? 0.9 : 0.5) + ht * 0.5, bx = hx - 0.8 * S + Math.cos(a) * 3.7 * S, by = hy - 2.2 * S + Math.sin(a) * 3.1 * S, tx = bx + Math.cos(a) * len * S * 0.62, ty = by + Math.sin(a) * len * S * 0.62; p.put(cap(bx, by, tx, ty, r * 0.58 * S, 0.25), HRM, 2); p.px(tx - Math.cos(a) * 1.7 + 0.7, ty - Math.sin(a) * 1.7 - 0.5, hl); p.px(bx - Math.sin(a) * 1.1, by + Math.cos(a) * 1.1, hs);
    }
    p.put(cap(hx + 0.4 * S, hy - 3.8 * S, hx + 3.2 * S, hy - 1.7 * S, 1.1 * S, 0.3), HRM, 2); p.put(cap(hx - 1.2 * S, hy - 3.9 * S, hx + 1.2 * S, hy - 2.2 * S, 1.0 * S, 0.3), HRM, 2);      // (the fringe)
    // the face: a narrow red eye under a heavy lid, the second eye below it, the marks, the mouth (ex: 'smirk', 'grit', 'calm', 'grin')
    const X = Math.round(hx + 2.7 * S), Y = Math.round(hy - 0.3 * S), dk = K('#180c16'), rd = K('#d4283a'), wt = K('#f0e8e0'), br = K('#6a3448'), ex = o.ex || 'smirk', mx = Math.round(hx + 3.1 * S), my = Math.round(hy + 3.1 * S);
    const rd2 = yj > 0.5 ? K('#6a4426') : rd, wide = ex === 'horror';
    if (wide) { p.rect(X - 1, Y - 2, 4, 3, wt); p.px(X + 1, Y - 1, K('#3a2412')); p.rect(X - 1, Y - 3, 4, 1, dk); } else { p.rect(X - 1, Y - 1, 4, 1, dk); p.rect(X, Y, 2, 1, wt); p.px(X + 1, Y, rd2); if (ex === 'grin') p.px(X - 1, Y + 1, dk); }
    if (yj < 0.5 && !wide) { p.rect(X, Y + 2, 2, 1, dk); p.px(X + 1, Y + 2, rd); }      // (the second eye: only while Sukuna is in him)
    p.rect(X - 1, Y - 3, 4, 1, br); p.px(X + 3, Y - 2, br); if (ex === 'grit') p.px(X - 1, Y - 2, br);      // (the brow)
    if (yj < 0.5) { p.rect(Math.round(hx + 3.6 * S), Math.round(hy + 0.5 * S), 2, 1, dk); p.rect(X - 1, Y + 4, 1, 3, dk); }      // (the mark across his nose, the mark under his eye)
    if (ex === 'horror') { p.rect(mx - 1, my - 1, 3, 3, K('#3a0a14')); p.px(mx, my - 1, wt); } else if (ex === 'grin') { p.rect(mx - 1, my, 4, 2, K('#3a0a14')); p.rect(mx - 1, my, 4, 1, wt); p.px(mx + 3, my - 1, dk); } else if (ex === 'grit') { p.rect(mx - 1, my, 3, 1, wt); p.rect(mx - 2, my - 1, 4, 1, dk); } else if (ex === 'calm') p.rect(mx - 1, my, 3, 1, K('#6a3a40')); else { p.rect(mx - 1, my, 3, 1, K('#6a3a40')); p.px(mx + 2, my - 1, K('#6a3a40')); p.px(mx + 3, my - 2, dk); }      // (a smirk: one corner up)
    p.rect(Math.round(hx - 2.4 * S), Math.round(hy - 0.2 * S), 2, 3, SKF[1]);      // (the ear)
    drawLeg(1);
    p.put(cap(P[0] - 0.3, P[1] - 2.2, P[0] + 0.4, P[1] + 2.6 * S, 4.5 * S, 4.6 * S), JK);      // (the hem of the jacket)
    drawArm(1); if (o.front) drawArm(0); return p;
  }
  function canvas(o) { const key = JSON.stringify(o, (k, v) => typeof v === 'number' ? Math.round(v * 2) / 2 : v); let c = cache.get(key); if (!c) { c = draw(o).canvas(); cache.set(key, c); if (cache.size > 700) cache.delete(cache.keys().next().value); } return c; }
  return { canvas, geom, reach, GROUND, S, AH, UA, FA, OY };
})();
const c15Suk = o => c15SukKit.canvas(o);
const C15SG = c15SukKit.GROUND, C15SS = c15SukKit.S;
const c15SukMix = (a, b, t) => { const o = c15MegMixPose(a, b, t); o.arms = o.arms.map((u, i) => ({ ...u, pk: t < 0.5 ? a.arms[i].pk : b.arms[i].pk })); o.ex = t < 0.5 ? a.ex : b.ex; return o; };
const c15SukPoses = {
  stand(t) { const b = Math.sin(t * 1.6) * 0.22; return { x: 32, y: 32.8 + b, lean: 2, hdx: 1.2, hdt: 5, arms: [{ al: -12, el: 52, pk: 1 }, { al: -4, el: 58, pk: 1 }], legs: [{ ax: 27.5, ay: C15SG, a: 0 }, { ax: 36.5, ay: C15SG, a: 0 }], ex: 'smirk' }; },
  run(ph, A = 16) {      // a sprint: long strides, the arms pumping, leaning into it, the hair streaming back
    ph = ((ph % 1) + 1) % 1; const S = C15SS, Lm = (12.9 + 12.4) * S * 0.965, cx = 32, legs = [0, 1].map(k => { const f = c15MegStride((ph + 0.5 * k) % 1, A, 0.4, 12); return { ax: cx + f.x * S, ay: C15SG - f.y * S, a: f.a }; });
    let py = 0; for (const l of legs) py = Math.max(py, l.ay - Math.sqrt(Math.max(0, Lm * Lm - (l.ax - cx) * (l.ax - cx)))); const w = Math.cos(2 * Math.PI * ph); return { x: cx, y: py, lean: 20, hdx: 2.2, hdt: 2, wind: 0.8, arms: [{ al: 56 * w, el: 88 + 10 * w }, { al: -56 * w, el: 88 - 10 * w }], legs, ex: 'smirk' };
  },
  walk(ph) {      // the slow walk of a man who has all the time in the world: hands in his pockets
    ph = ((ph % 1) + 1) % 1; const S = C15SS, Lm = (12.9 + 12.4) * S * 0.965, cx = 32, legs = [0, 1].map(k => { const f = c15MegStride((ph + 0.5 * k) % 1, 9, 0.55, 6); return { ax: cx + f.x * S, ay: C15SG - f.y * S, a: f.a }; });
    let py = 0; for (const l of legs) py = Math.max(py, l.ay - Math.sqrt(Math.max(0, Lm * Lm - (l.ax - cx) * (l.ax - cx)))); const s = c15SukPoses.stand(0); return { x: cx, y: py, lean: 4, hdx: 1.4, hdt: 6, wind: 0.05, arms: s.arms, legs, ex: 'smirk' };
  },
  leap(u) {      // a long jump: the push off, the stretched flight (front knee up, the other leg trailing, an arm forward), the legs coming down to land
    const to = { x: 32, y: 35, lean: 30, hdx: 2.4, hdt: 4, wind: 0.5, arms: [{ al: 118, el: 22 }, { al: -48, el: 30 }], legs: [{ ax: 41, ay: 51, a: -20 }, { ax: 20, ay: C15SG, a: -40 }], ex: 'grit' },
      ar = { x: 32, y: 31, lean: 16, hdx: 2.0, hdt: 0, wind: 0.9, arms: [{ al: 142, el: 8 }, { al: -62, el: 20 }], legs: [{ ax: 47, ay: 49, a: -10 }, { ax: 13, ay: 52, a: -48 }], ex: 'smirk' },
      lp = { x: 32, y: 31.5, lean: 8, hdx: 1.8, hdt: -2, wind: 0.4, arms: [{ al: 72, el: 40 }, { al: 30, el: 50 }], legs: [{ ax: 39, ay: 56, a: 10 }, { ax: 27, ay: 57.5, a: 6 }], ex: 'smirk' };
    return u < 0.14 ? c15SukMix(to, ar, c15Sm(u / 0.14)) : u < 0.8 ? ar : c15SukMix(ar, lp, c15Sm((u - 0.8) / 0.2));
  },
  crouch(u) {      // the landing: deep in his knees, a hand near the roof; then he straightens up (u 0 - 1)
    const d = { x: 30, y: 45, lean: 38, hdx: 2.0, hdt: 12, wind: 0.2, arms: [{ al: 30, el: 24 }, { al: 74, el: 18 }], legs: [{ ax: 40, ay: C15SG, a: 0 }, { ax: 21, ay: C15SG, a: 0 }], ex: 'smirk' }; c15SukKit.reach(d, 1, 47, C15SG + 8 - 0.5);
    return c15SukMix(d, c15SukPoses.stand(0), c15Sm((u - 0.15) / 0.85));
  },
  stop(ph) { const o = c15SukPoses.run(ph, 9); o.lean = 8; o.wind = 0.3; o.arms = c15SukPoses.stand(0).arms; return o; },
};

c15MegPoses.lookback = function (ph, w) {      // running, the head turned back over the shoulder, frightened (w = 0 - 1)
  const o = c15MegPoses.run(ph, 15); o.hdt = 10 * w; o.hdx = 2.5 - 3.4 * w; o.hdy = 0.6 * w; o.lean = 15 - 6 * w; o.ex = w > 0.3 ? 'shock' : 'grit'; return o;
};

const c15MegPts = o => {      // where his neck, head and jaw are in the picture of a pose (the same sums as in c15MegKit.draw)
  const S = c15MegKit.S, OY = c15MegKit.OY, LT = c15MegKit.LT, lean = (o.lean === undefined ? 3 : o.lean) * Math.PI / 180, ux = Math.sin(lean), uy = -Math.cos(lean), P = [o.x === undefined ? 32 : o.x, (o.y === undefined ? 35.2 : o.y) + OY];
  const Nk = [P[0] + ux * LT, P[1] + uy * LT], ht = (o.hdt || 0) * Math.PI / 180, hox = (o.hdx === undefined ? 1.3 : o.hdx) * S, hoy = -6.7 * S + (o.hdy || 0), hd = [Nk[0] + hox * Math.cos(ht) - hoy * Math.sin(ht), Nk[1] + hox * Math.sin(ht) + hoy * Math.cos(ht)];
  const jx = 2.6 * S, jy = 3.0 * S; return { neck: Nk, hd, jaw: [hd[0] + jx * Math.cos(ht) - jy * Math.sin(ht), hd[1] + jx * Math.sin(ht) + jy * Math.cos(ht)] };
};
c15MegPoses.yank = function (u) {      // yanked back by the collar at a run: the body pitches back, the head snaps, the arms fly, the feet come off the roof (u 0 - 1)
  const a = c15MegPoses.run(0.25, 15), b = { x: 31, y: 36, lean: -32, hdx: 0.6, hdt: -26, wind: 0.2, arms: [{ al: 125, el: 30 }, { al: 60, el: 60 }], legs: [{ ax: 44, ay: 50, a: -30 }, { ax: 33, ay: 54, a: 12 }], ex: 'shock' };
  return c15MegMixPose(a, b, c15Sm(u));
};
c15MegPoses.collar = function (t) {      // held up by the collar: on his toes, leaning away, both hands round the wrist that holds him, shaking
  const k = Math.sin(t * 11) * 0.3; return { x: 31 + k, y: 34.5, lean: -16, hdx: 0.8, hdt: -12, wind: 0, arms: [{ al: 140, el: 8 }, { al: 156, el: 4 }], legs: [{ ax: 26, ay: C15MG.GROUND - 1.5, a: -26 }, { ax: 34, ay: C15MG.GROUND - 1, a: -30 }], ex: 'shock', blood: 0.7 };
};
c15MegPoses.grabbed = function (t) {      // held by the jaw at arm's length, his toes just off the roof: the head pulled back, both hands on the wrist, the legs kicking a little
  const k = Math.sin(t * 6) * 1.6, k2 = Math.sin(t * 6 + 1.6) * 1.6;
  return { x: 31, y: 33.6, lean: -13, hdx: 0.5, hdt: -22, wind: 0, arms: [{ al: 150, el: 10 }, { al: 164, el: 4 }], legs: [{ ax: 27 + k * 0.3, ay: C15MG.GROUND - 3 + k, a: -34 }, { ax: 35 - k * 0.2, ay: C15MG.GROUND - 2 + k2, a: -38 }], ex: 'shock', blood: 0.85 };
};

// ---- the poses of part 2 (v1.147)
c15MegPoses.collapse = function (t) {      // on his knees, folded forward, the head hanging, both hands on the roof: breathing
  const b = Math.sin(t * 2.4) * 0.5; return { x: 31, y: 47 + b * 0.5, lean: 52, hdx: 0.2, hdy: 1.6, hdt: 48, wind: 0, arms: [{ al: 48, el: 6 }, { al: 36, el: 10 }], legs: [{ ax: 14, ay: C15MG.GROUND - 1, a: 80 }, { ax: 22, ay: C15MG.GROUND - 1, a: 80 }], ex: 'pain', blood: 0.9 };
};
c15MegPoses.convulse = function (t, a) {      // held by the jaw and shaking all over (a = 0 - 1: how violently)
  const o = c15MegPoses.grabbed(t), s1 = Math.sin(t * 17), s2 = Math.sin(t * 21 + 1); o.lean -= 9 * a * Math.abs(s1); o.hdt -= 8 * a * s2; o.legs = o.legs.map((l, i) => ({ ax: l.ax + 5 * a * (i ? s2 : s1), ay: l.ay - 3 * a * Math.abs(i ? s1 : s2), a: l.a + 20 * a * (i ? s1 : s2) })); o.arms = o.arms.map((u, i) => ({ al: u.al + 16 * a * (i ? s1 : s2), el: u.el })); o.ex = 'pain'; return o;
};
c15MegPoses.lift = function (w) {      // still on his knees, the head slowly coming up (w 0 - 1)
  const a = c15MegPoses.collapse(0), b = Object.assign({}, a, { lean: 40, hdt: 4, hdy: -0.6, hdx: 1.6, ex: 'calm' }); return c15MegMixPose(a, b, c15Sm(w));
};
c15SukPoses.drop = function (t) { const o = c15SukPoses.stand(t); o.arms = [{ al: -6, el: 16 }, { al: 2, el: 20 }]; o.lean = 3; o.hdt = 4; o.ex = 'calm'; return o; };
c15SukPoses.horror = function (t) {      // Yuji, frightened: leaning away, the feet apart, both hands up and open
  const b = Math.sin(t * 9) * 0.4; return { x: 32, y: 32.8, lean: -9, hdx: 0.6, hdt: -6, wind: 0, arms: [{ al: 34 + b, el: 86 }, { al: 22 - b, el: 96 }], legs: [{ ax: 24, ay: C15SG, a: 0 }, { ax: 40, ay: C15SG, a: 0 }], ex: 'horror', yj: 1 };
};
c15SukPoses.backstep = function (ph) { const o = c15SukPoses.run(-ph, 7); o.lean = -6; o.wind = 0; o.arms = c15SukPoses.horror(0).arms; o.ex = 'horror'; o.yj = 1; o.hdt = -6; return o; };
