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

c15MegPoses.lookup = function (ph, w) {      // running, the head thrown up to see what flies over him (w = 0 - 1)
  const o = c15MegPoses.run(ph); o.hdt = -30 * w; o.hdy = -1.2 * w; o.hdx = 2.5 - 1.2 * w; o.lean = 15 - 8 * w; o.ex = w > 0.35 ? 'shock' : 'grit'; return o;
};

// ================================================================ SUKUNA in Yuji's body, v1.146: the same kind of shaded-shape figure as Megumi, but bigger and broader (1.1), with the look of the manga: short spiky pink hair, the high red hood round his neck, the dark uniform with its gold buttons,
// a thin mark across the bridge of his nose and under his eye, a second pair of eyes under the first, a narrow red eye. A pose = numbers (see c15SukPoses); c15Suk(pose) -> a 64 x 72 picture facing right (soles on row 70); c15SukPts(pose) = where his head, jaw and hands are (picture coordinates).
const c15SukKit = (() => {
  const { Pix, cap, ell, uni, K, OY } = c15MegKit, RAD = Math.PI / 180, GY = 63, cache = new Map(), cl = (v, a, b) => Math.max(a, Math.min(b, v));
  const mat = (t, o) => { const m = t.map(K); m.o = K(o); return m; };
  const SK = mat(['#a46c60', '#d09c80', '#ecc0a0', '#f8d8bc'], '#3a1c24'), SKF = mat(['#7a4a44', '#a46c60', '#c48c76', '#e0b090'], '#2e1620'), HR = mat(['#7a4258', '#b4707e', '#dc94a0', '#f2bcc4'], '#3a1c2c'),
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
  function draw(o) {
    const p = new Pix(64, 72), g = geom(o), yj = o.yj || 0, HRM = HR, { P, at, Wd, W2, Nk, Sh, hd, ht, arms } = g, lg = (o.legs || [{ ax: 28, ay: GROUND, a: 0 }, { ax: 36, ay: GROUND, a: 0 }]).map(l => ({ ax: l.ax, ay: l.ay + OY, a: l.a }));
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
