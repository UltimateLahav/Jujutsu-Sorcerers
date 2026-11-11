// ================================================================ v1.157 CHAPTER 4, PART 4 (tools/chap4e.js): the figures of RANOS (the one at the end of chapter 2: purple skin, dark-blue and gold armour, a gauntlet with a purple stone) and IRON MAN, the cars and the sky of NEW YORK
// They are drawn at run time with the shaded capsules of chapter 4 (c15MegKit: the same look as the people of the street), pose by pose, facing right, and cached by the numbers of the pose: c4xRanos(pose) -> a 112 x 104 canvas (soles on row 100, middle column 56),
// c4xIron(pose) -> a 96 x 100 canvas (soles on row 92, middle column 48). A POSE: x, y = the hip, lean (degrees, forward), hdx, hdy, hdt = the head, arms [{ al: the upper arm's angle from straight down, forward positive, el: the bend of the elbow }, ...] (the first is the far arm),
// legs [{ ax, ay: where the ankle is, a: the foot's angle }, ...], and for Ranos glow (the stone) and for Iron Man fl (the flames under the boots), bl (the blade, 0 - 1), rep (the palm repulsors, 0 - 1), vis (the faceplate is shut and lit).
const { Pix: C4Pix, cap: c4cap, ell: c4ell, uni: c4uni, clip: c4clip, M: c4M, K: c4K, ik: c4ik } = c15MegKit;
const C4R = { W: 112, H: 104, GY: 100, cx: 56, L1: 17, L2: 17, LT: 27, UA: 14, FA: 13, AH: 4 }, C4I = { W: 96, H: 100, GY: 92, cx: 48, L1: 14, L2: 14, LT: 20, UA: 11, FA: 10.5, AH: 3.5 };
const C4RC = { skin: '#8d5db5', armor: '#27357a', trim: '#e2b53c', pants: '#2c2f5c', boot: '#2a2048', eye: '#ffd84a', stone: '#c98bff', stoneL: '#f1dcff' }, C4IC = { red: '#c4202c', gold: '#e4b636', dark: '#34343f', glow: '#aef6ff', white: '#f4fdff', blade: '#e9eff6' };
const C4RAD = Math.PI / 180;
function c4xMixPose(a, b, t) {      // two poses mixed number by number (the arms and legs too)
  const o = {}; for (const k of new Set([...Object.keys(a), ...Object.keys(b)])) { if (k === 'arms' || k === 'legs') continue; const x = a[k], y = b[k]; o[k] = typeof x === 'number' || typeof y === 'number' ? (x === undefined ? y : x) + ((y === undefined ? x : y) - (x === undefined ? y : x)) * t : (t < 0.5 ? x : y); }
  for (const k of ['arms', 'legs']) o[k] = a[k] && b[k] ? a[k].map((u, i) => { const v = b[k][i], r = {}; for (const q in u) r[q] = u[q] + ((v[q] === undefined ? u[q] : v[q]) - u[q]) * t; return r; }) : (a[k] || b[k]); return o;
}
function c4xRig(R, o) {      // the joints of a pose: the hip, the neck, the shoulder, the head, both arms (elbow, wrist, hand) and both legs (knee, ankle), for the figure sizes R
  const lean = (o.lean === undefined ? 4 : o.lean) * C4RAD, ux = Math.sin(lean), uy = -Math.cos(lean), fx = -uy, fy = ux, P = [o.x === undefined ? R.cx : o.x, o.y === undefined ? R.GY - R.AH - (R.L1 + R.L2) * 0.97 : o.y], at = (t, d) => [P[0] + ux * R.LT * t + fx * d, P[1] + uy * R.LT * t + fy * d];
  const Nk = at(1, 0), Sh = at(0.86, -0.4), ht = (o.hdt || 0) * C4RAD, hox = o.hdx === undefined ? 1.2 : o.hdx, hoy = (o.hdy || 0) - R.LT * 0.3, hd = [Nk[0] + hox * Math.cos(ht) - hoy * Math.sin(ht), Nk[1] + hox * Math.sin(ht) + hoy * Math.cos(ht)];
  const arms = (o.arms || [{ al: -6, el: 14 }, { al: 6, el: 18 }]).map(a => { const a1 = a.al * C4RAD, a2 = (a.al + a.el) * C4RAD, E = [Sh[0] + Math.sin(a1) * R.UA, Sh[1] + Math.cos(a1) * R.UA], W = [E[0] + Math.sin(a2) * R.FA, E[1] + Math.cos(a2) * R.FA]; return { E, W, h: [W[0] + Math.sin(a2) * 2.6, W[1] + Math.cos(a2) * 2.6], a2 }; });
  const legs = (o.legs || [{ ax: R.cx - 6, ay: R.GY - R.AH, a: 0 }, { ax: R.cx + 6, ay: R.GY - R.AH, a: 0 }]).map(l => ({ ...l, K: c4ik(P[0], P[1], l.ax, l.ay, R.L1, R.L2) }));
  return { P, at, Nk, Sh, hd, ht, arms, legs, ux, uy, fx, fy };
}
const c4xCache = new Map(), c4xCv = (kind, o, draw) => { const key = kind + JSON.stringify(o, (k, v) => typeof v === 'number' ? Math.round(v * 2) / 2 : v); let c = c4xCache.get(key); if (!c) { c = draw(o).canvas(); c4xCache.set(key, c); if (c4xCache.size > 700) c4xCache.delete(c4xCache.keys().next().value); } return c; };
const c4xFoot = (p, l, m, soleC) => { const a = -(l.a || 0) * C4RAD, cs = Math.cos(a), sn = Math.sin(a), R = (x, y) => [l.ax + x * cs - y * sn, l.ay + x * sn + y * cs], hh = R(-2.6, 1.8), tt = R(5.6, 2.2); p.put(c4cap(hh[0], hh[1], tt[0], tt[1], 2.3, 1.8), m); p.line(R(-2, 3.4), R(5.2, 3.8), soleC); };

// ---------------------------------------------------------------- RANOS
function c4xDrawRanos(o) {
  const R = C4R, p = new C4Pix(R.W, R.H), J = c4xRig(R, o), { P, at, Nk, Sh, hd, arms, legs } = J, C = C4RC, skin = c4M(C.skin), armor = c4M(C.armor), trim = c4M(C.trim);
  const drawArm = k => {
    const a = arms[k], far = k ? 0 : 0.1, gaunt = k === 1, sk = c4M(C.skin, far), tr = c4M(C.trim, far);
    p.put(c4uni(c4ell(Sh[0], Sh[1], 5.2, 5.2), c4cap(Sh[0], Sh[1], a.E[0], a.E[1], 4.8, 4.1)), sk);      // (the shoulder and the upper arm)
    p.put(c4cap(a.E[0], a.E[1], a.W[0], a.W[1], gaunt ? 4.5 : 3.8, gaunt ? 4.3 : 3.2), gaunt ? tr : sk); if (!gaunt) p.put(c4cap(a.E[0] + (a.W[0] - a.E[0]) * 0.45, a.E[1] + (a.W[1] - a.E[1]) * 0.45, a.W[0], a.W[1], 3.9, 3.5), tr);      // (the gold of the bracer; the near arm is the gauntlet)
    p.put(c4ell(a.h[0], a.h[1], gaunt ? 4.6 : 3.7, gaunt ? 4.8 : 3.9), gaunt ? tr : sk);
    if (gaunt) { const g = o.glow || 0, sx = a.h[0] + Math.sin(a.a2) * 1.2, sy = a.h[1] + Math.cos(a.a2) * 1.2; p.px(sx, sy, c4K(g > 0.5 ? C.stoneL : C.stone)); p.px(sx + 1, sy, c4K(C.stone)); p.px(sx, sy + 1, c4K(C.stone)); if (g > 0.3) { p.px(sx - 1, sy, c4K(C.stone)); p.px(sx, sy - 1, c4K(C.stone)); if (g > 0.7) for (const [dx, dy] of [[-2, 0], [2, 0], [0, -2], [0, 2], [-2, -2], [2, 2], [2, -2], [-2, 2]]) p.px(sx + dx, sy + dy, c4K(C.stone)); } }
  };
  const drawLeg = k => { const l = legs[k], far = k ? 0 : 0.1, Hp = [P[0] + 0.4, P[1]];
    p.put(c4uni(c4cap(Hp[0], Hp[1], l.K[0], l.K[1], 6.2, 5.0), c4cap(l.K[0], l.K[1], l.ax, l.ay, 5.0, 3.4)), c4M(C.pants, far)); c4xFoot(p, l, c4M(C.boot, far), c4K('#150f26')); };
  drawArm(0); drawLeg(0);
  p.put(c4uni(c4cap(P[0], P[1], at(0.3, 0)[0], at(0.3, 0)[1], 8.4, 9.2), c4cap(at(0.3, 0)[0], at(0.3, 0)[1], at(0.7, 0)[0], at(0.7, 0)[1], 9.2, 13.4), c4cap(at(0.7, 0)[0], at(0.7, 0)[1], Nk[0], Nk[1], 13.4, 8.4)), armor);      // (the body: the waist, the broad chest, the shoulders)
  const cr = at(0.6, 6.6), bl = at(0.09, 0); p.put(c4ell(cr[0], cr[1], 4.4, 6.6), trim, 1); p.put(c4cap(bl[0] - 7.5, bl[1], bl[0] + 7.5, bl[1], 1.6, 1.6), trim, 1);      // (the gold on the chest, the belt)
  p.put(c4ell(Sh[0] + 0.5, Sh[1] - 0.8, 6.2, 5.2), trim);      // (the shoulder plate)
  p.put(c4cap(hd[0] - 1.2, hd[1] + 4, Nk[0] + 0.4, Nk[1] - 0.6, 3.6, 4.4), skin);      // (the neck)
  const [hx, hy] = hd, K = c4K;
  p.put(c4uni(c4ell(hx - 0.4, hy - 0.4, 7.6, 8.0), c4ell(hx + 2.0, hy + 3.8, 6.0, 5.6)), skin);      // (the head and the great chin)
  p.put(c4uni(c4ell(hx - 2.4, hy - 4.8, 6.8, 3.8), c4ell(hx - 6.2, hy + 0.2, 2.6, 5.2)), trim);      // (the helmet over the top and the back of the head)
  p.put(c4cap(hx - 6, hy - 6.8, hx - 12.5, hy - 4.6, 2.2, 0.5), trim, 1);      // (the crest)
  const X = Math.round(hx + 3.8), Y = Math.round(hy - 0.8), dk = K('#120a1e');
  p.rect(X - 1, Y - 2, 5, 1, dk); p.rect(X, Y - 1, 3, 2, dk); p.px(X + 1, Y - 1, K(C.eye)); p.px(X + 2, Y - 1, K(C.eye));      // (the brow, the eye)
  p.rect(Math.round(hx + 3.4), Math.round(hy + 4.6), 4, 1, dk); p.px(Math.round(hx + 3), Math.round(hy + 2.4), c4M(C.skin)[0]); p.px(Math.round(hx + 6.4), Math.round(hy + 3.8), c4M(C.skin)[0]);      // (the mouth, the lines of the face)
  drawLeg(1); const sk = at(0.02, 0); p.put(c4cap(sk[0] - 0.3, sk[1] - 1.5, sk[0] + 0.4, sk[1] + 6, 8.4, 8.9), c4M(C.pants), 1);
  drawArm(1); return p;
}
const c4xRanos = o => c4xCv('r', o, c4xDrawRanos);
const C4RG = C4R.GY - C4R.AH;      // (the height of an ankle on the floor)
const c4xRanosPose = {
  stand(t) { const b = Math.sin(t * 2) * 0.35; return { x: 56, y: 63.5 + b * 0.4, lean: 2, hdx: 1.4, hdt: 1, glow: 0.35 + 0.15 * Math.sin(t * 3), arms: [{ al: -8, el: 12 + b }, { al: 7, el: 20 - b }], legs: [{ ax: 48, ay: C4RG, a: 0 }, { ax: 63, ay: C4RG, a: 0 }] }; },
  walk(ph) {      // a stride: the foot on the floor goes back, then swings forward through the air
    const leg = k => { const q = (ph + 0.5 * k) % 1; if (q < 0.5) return { ax: 69 - 26 * (q / 0.5), ay: C4RG, a: 0 }; const u = (q - 0.5) / 0.5; return { ax: 43 + 26 * u, ay: C4RG - 6 * Math.sin(Math.PI * u), a: 12 * Math.sin(Math.PI * u) }; }, w = Math.cos(2 * Math.PI * ph);
    return { x: 56, y: 63.5 + 0.6 * Math.abs(Math.sin(2 * Math.PI * ph)), lean: 5, hdx: 1.6, glow: 0.4, arms: [{ al: 16 * w, el: 18 }, { al: -16 * w, el: 24 }], legs: [leg(0), leg(1)] };
  },
  catch(t) { const b = Math.sin(t * 20) * 0.25; return { x: 55, y: 63.5, lean: 9, hdx: 1.8, hdt: 2, glow: 0.8, arms: [{ al: -16, el: 20 }, { al: 98 + b, el: -12 }], legs: [{ ax: 46, ay: C4RG, a: 0 }, { ax: 66, ay: C4RG, a: 0 }] }; },
  throw(u) { return c4xMixPose(c4xRanosPose.catch(0), { x: 54, y: 64, lean: -6, hdx: 1.2, hdt: -3, glow: 1, arms: [{ al: 8, el: 16 }, { al: 168, el: -20 }], legs: [{ ax: 49, ay: C4RG, a: 0 }, { ax: 64, ay: C4RG, a: 0 }] }, c15Sm(u)); },
  windup() { return { x: 54, y: 66, lean: -10, hdx: 1.0, hdt: -3, glow: 1, arms: [{ al: 20, el: 40 }, { al: -56, el: 50 }], legs: [{ ax: 42, ay: C4RG, a: 0 }, { ax: 70, ay: C4RG, a: 0 }] }; },
  punch() { return { x: 60, y: 70, lean: 24, hdx: 2.4, hdt: 8, glow: 1, arms: [{ al: 20, el: 30 }, { al: 38, el: 2 }], legs: [{ ax: 42, ay: C4RG, a: 0 }, { ax: 72, ay: C4RG, a: 0 }] }; },
};
// ---------------------------------------------------------------- IRON MAN
function c4xDrawIron(o) {
  const R = C4I, p = new C4Pix(R.W, R.H), J = c4xRig(R, o), { P, at, Nk, Sh, hd, arms, legs } = J, C = C4IC, K = c4K, red = c4M(C.red), gold = c4M(C.gold);
  const drawArm = k => { const a = arms[k], far = k ? 0 : 0.1, rd = c4M(C.red, far), gd = c4M(C.gold, far), rep = o.rep || 0;
    p.put(c4uni(c4ell(Sh[0], Sh[1], 4.2, 4.2), c4cap(Sh[0], Sh[1], a.E[0], a.E[1], 3.5, 3.0)), rd); p.put(c4cap(a.E[0], a.E[1], a.W[0], a.W[1], 3.1, 2.7), c4M(C.red, far)); p.put(c4cap(a.E[0] + (a.W[0] - a.E[0]) * 0.4, a.E[1] + (a.W[1] - a.E[1]) * 0.4, a.W[0], a.W[1], 3.2, 2.9), gd, 1);
    p.put(c4ell(a.h[0], a.h[1], 3.0, 3.2), rd);
    if (rep > 0 && k === 0) { const gx = a.h[0] + Math.sin(a.a2) * 2.4, gy2 = a.h[1] + Math.cos(a.a2) * 2.4; for (const [dx, dy, c] of [[0, 0, C.white], [1, 0, C.glow], [-1, 0, C.glow], [0, 1, C.glow], [0, -1, C.glow], [2, 0, C.glow], [-2, 0, C.glow], [0, 2, C.glow], [0, -2, C.glow]]) if (rep > 0.5 || (dx === 0 && dy === 0)) p.px(gx + dx, gy2 + dy, K(c)); }
    if (k === 1 && o.bl > 0) { const L = 28 * o.bl, ex = a.h[0] + Math.sin(a.a2) * (L + 1), ey = a.h[1] + Math.cos(a.a2) * (L + 1); p.put(c4cap(a.W[0], a.W[1], a.W[0] + Math.sin(a.a2) * 3, a.W[1] + Math.cos(a.a2) * 3, 3.6, 3.6), gd, 1); p.put(c4cap(a.h[0] + Math.sin(a.a2) * 1, a.h[1] + Math.cos(a.a2) * 1, ex, ey, 1.9, 0.4), c4M(C.blade), 1); p.line([a.h[0] + Math.sin(a.a2) * 3, a.h[1] + Math.cos(a.a2) * 3 - 1], [ex - Math.sin(a.a2) * 2, ey - Math.cos(a.a2) * 2 - 1], K('#ffffff')); }
  };
  const drawLeg = k => { const l = legs[k], far = k ? 0 : 0.1, Hp = [P[0] + 0.3, P[1]]; p.put(c4uni(c4cap(Hp[0], Hp[1], l.K[0], l.K[1], 4.4, 3.5), c4cap(l.K[0], l.K[1], l.ax, l.ay, 3.5, 2.7)), c4M(C.red, far)); p.put(c4cap(l.K[0] + (l.ax - l.K[0]) * 0.35, l.K[1] + (l.ay - l.K[1]) * 0.35, l.ax, l.ay, 3.4, 2.8), c4M(C.gold, far), 1); c4xFoot(p, l, c4M(C.gold, far), K('#3a2a08'));
    if (o.fl > 0) { const fl = o.fl, len = 10 + 14 * fl + 3 * Math.sin(k * 3 + (o.ph || 0) * 9), fx = l.ax + 1, fy = l.ay + 3; p.put(c4cap(fx, fy, fx - 0.5, fy + len, 2.6, 0.3), c4M('#ff8a1e'), 3); p.put(c4cap(fx, fy, fx - 0.3, fy + len * 0.65, 1.7, 0.3), c4M('#ffd24a'), 3); p.put(c4cap(fx, fy, fx, fy + len * 0.35, 0.9, 0.3), c4M('#ffffff'), 3); } };
  drawArm(0); drawLeg(0);
  p.put(c4uni(c4cap(P[0], P[1], at(0.3, 0)[0], at(0.3, 0)[1], 5.6, 6.4), c4cap(at(0.3, 0)[0], at(0.3, 0)[1], at(0.72, 0)[0], at(0.72, 0)[1], 6.4, 8.4), c4cap(at(0.72, 0)[0], at(0.72, 0)[1], Nk[0], Nk[1], 8.4, 5.6)), red);
  const ab = at(0.16, 2.6); p.put(c4cap(ab[0], ab[1], at(0.3, 2.6)[0], at(0.3, 2.6)[1], 3.2, 3.6), gold, 1); const ar = at(0.62, 5.6); for (const [dx, dy, c] of [[0, 0, C.white], [1, 0, C.glow], [-1, 0, C.glow], [0, 1, C.glow], [0, -1, C.glow]]) p.px(ar[0] + dx, ar[1] + dy, K(c));      // (the abdomen in gold; the arc reactor)
  p.put(c4ell(Sh[0] + 0.4, Sh[1] - 0.6, 4.6, 4.0), red); p.put(c4cap(hd[0] - 1, hd[1] + 3, Nk[0] + 0.3, Nk[1] - 0.4, 2.2, 2.6), c4M(C.dark));
  const [hx, hy] = hd; p.put(c4ell(hx - 0.2, hy - 0.2, 5.3, 5.6), red);      // (the helmet)
  p.put(c4clip(c4uni(c4ell(hx + 0.8, hy + 0.9, 4.4, 4.6), c4cap(hx + 1.6, hy + 2.6, hx + 2.4, hy + 4.4, 2.4, 1.8)), (x, y) => x > hx + 0.2), gold);      // (the golden faceplate)
  const X = Math.round(hx + 2.5), Y = Math.round(hy - 0.4); p.rect(X, Y, 3, 1, K(C.white)); if (o.vis) p.px(X - 1, Y, K(C.glow)); p.rect(X + 1, Y + 3, 2, 1, K('#6a4e0c'));      // (the eye slit, the mouth line)
  drawLeg(1); const sk = at(0.03, 0); p.put(c4cap(sk[0] - 0.2, sk[1] - 0.6, sk[0] + 0.3, sk[1] + 2.6, 4.6, 5.0), c4M(C.gold), 1);
  drawArm(1); return p;
}
const c4xIron = o => c4xCv('i', o, c4xDrawIron);
const C4IG = C4I.GY - C4I.AH;
const c4xIronPose = {
  fall(t) { const w = Math.sin(t * 40) * 0.5; return { x: 48, y: 50, lean: 0, hdx: 0.8, hdt: 0, fl: 1, ph: t, rep: 0, arms: [{ al: -22, el: 10 }, { al: -26, el: 12 }], legs: [{ ax: 45, ay: C4IG - 1 + w, a: -42 }, { ax: 51, ay: C4IG + w, a: -46 }] }; },
  land() { return { x: 44, y: 79, lean: 40, hdx: 1.6, hdy: 1.5, hdt: 24, fl: 0, arms: [{ al: -34, el: 36 }, { al: 34, el: 10 }], legs: [{ ax: 25, ay: C4IG + 0.5, a: -52 }, { ax: 55, ay: C4IG, a: 0 }] }; },
  crouch() { return { x: 46, y: 66, lean: 24, hdx: 1.4, hdy: 1.0, hdt: 12, fl: 0, arms: [{ al: -22, el: 30 }, { al: 30, el: 20 }], legs: [{ ax: 33, ay: C4IG + 0.5, a: -30 }, { ax: 58, ay: C4IG, a: 0 }] }; },
  stand(t) { const b = Math.sin(t * 2.2) * 0.3; return { x: 48, y: 59.5 + b * 0.3, lean: 3, hdx: 1.2, hdt: 1, rep: 0.2, vis: 1, arms: [{ al: 30, el: 62 }, { al: 18, el: 26 - b }], legs: [{ ax: 41, ay: C4IG, a: 0 }, { ax: 55, ay: C4IG, a: 0 }] }; },
  blade(u) { const e = c15Sm(u); return { x: 49, y: 60, lean: 9, hdx: 1.4, hdt: 3, rep: 0.9, vis: 1, bl: e, arms: [{ al: 78, el: 4 }, { al: 86, el: 2 + 2 * (1 - e) }], legs: [{ ax: 39, ay: C4IG, a: 0 }, { ax: 59, ay: C4IG, a: 0 }] }; },
};

// ================================================================ NEW YORK: the sky, the skyline (the Empire State and the Chrysler Building), the freeway with a green sign, the cars and the crater of Iron Man
const C4NY = { h: 0, far: null, mid: null, clouds: [] }, c4xR = (i, s) => { const v = Math.sin(i * 12.9898 + s * 78.233) * 43758.5453; return v - Math.floor(v); };
function c4xNyLayers() {      // the two skylines are drawn once as wide strips (the sky itself is drawn every frame)
  if (C4NY.h === VH) return; C4NY.h = VH; const W = 760, base = Math.round(VH * 0.66);
  const mk = (seed, col, side, win, lit, tops, bw, land) => {
    const c = document.createElement('canvas'); c.width = W; c.height = VH; const g = c.getContext('2d'); let x = -8, i = 0;
    while (x < W) { const w = Math.round(bw[0] + c4xR(i, seed) * (bw[1] - bw[0])), top = Math.round(base - (tops[0] + c4xR(i, seed + 1) * (tops[1] - tops[0])) * VH); g.fillStyle = col; g.fillRect(x, top, w, VH - top); g.fillStyle = side; g.fillRect(x, top, 1, VH - top); g.fillRect(x, top, w, 1);
      for (let wy = top + 4; wy < base; wy += 4) for (let wx = x + 3; wx < x + w - 3; wx += 4) { g.fillStyle = c4xR(wx + wy * 7, seed + 5) < lit ? '#f3e4aa' : win; g.fillRect(wx, wy, 2, 2); }
      if (c4xR(i, seed + 3) < 0.25) { g.fillStyle = col; g.fillRect(x + (w >> 1), top - 7, 1, 7); } x += w + Math.round(c4xR(i, seed + 2) * 3); i++; }
    for (const [lx, kind] of land) {      // (the two that everybody knows)
      if (kind === 'esb') { const t = (w, h, y) => { g.fillStyle = col; g.fillRect(lx - (w >> 1), y, w, h); g.fillStyle = side; g.fillRect(lx - (w >> 1), y, 1, h); }; const y0 = base - Math.round(VH * 0.5); t(30, base - y0, y0); t(24, 14, y0 - 14); t(16, 12, y0 - 26); t(10, 10, y0 - 36); t(4, 8, y0 - 44); g.fillStyle = col; g.fillRect(lx, y0 - 62, 1, 18); g.fillStyle = '#e04040'; g.fillRect(lx, y0 - 63, 1, 1); }
      else { const y0 = base - Math.round(VH * 0.42); g.fillStyle = col; g.fillRect(lx - 11, y0, 22, base - y0); g.fillStyle = side; g.fillRect(lx - 11, y0, 1, base - y0); g.fillStyle = '#cfd6e0'; for (let k = 0; k < 5; k++) { const w = 18 - k * 3; g.fillRect(lx - (w >> 1), y0 - 4 - k * 4, w, 3); } g.fillRect(lx, y0 - 30, 1, 10); }
    }
    return c;
  };
  C4NY.far = mk(31, '#a9bfd8', '#cfe0f2', '#92a9c6', 0.03, [0.12, 0.34], [18, 38], [[330, 'esb'], [150, 'chr']]); C4NY.mid = mk(47, '#7089a8', '#93abc8', '#586f90', 0.07, [0.06, 0.22], [24, 52], []);
  C4NY.clouds = Array.from({ length: 6 }, (_, i) => [c4xR(i, 1), 0.08 + 0.3 * c4xR(i, 2), 26 + 40 * c4xR(i, 3)]);
}
const C4CARS = {      // kind: [width, height, the body, its shade, its light, the glass, the wheel base]
  taxi: [52, 24, '#f2c21e', '#c79a0c', '#fbe58a', '#a8d8f0'], sedan: [50, 23, '#2d5db0', '#1e4283', '#5a8ae0', '#a8d8f0'], white: [50, 23, '#e8eaf0', '#b8bcc8', '#ffffff', '#a8d8f0'], dark: [52, 24, '#34343e', '#22222a', '#62626e', '#8fb8d0'],
  van: [56, 29, '#e4e6ec', '#b4b8c4', '#ffffff', '#a8d8f0'], truck: [74, 33, '#b9bdc8', '#8f93a0', '#e4e7ee', '#a8d8f0'], bus: [88, 31, '#e8ecf2', '#b4bac8', '#ffffff', '#a8d8f0'],
};
const c4xCarCache = {};
function c4xCarCv(kind) {      // a car from the side, facing right, 1 pixel = 1 pixel of the game; the wheels' lowest row is the last row
  if (c4xCarCache[kind]) return c4xCarCache[kind]; const [w, h, body, shade, light, glass] = C4CARS[kind], c = document.createElement('canvas'); c.width = w; c.height = h; const g = c.getContext('2d'), R = (x, y, ww, hh, col) => { g.fillStyle = col; g.fillRect(x, y, ww, hh); };
  const big = kind === 'van' || kind === 'truck' || kind === 'bus', wy = h - 4, o = '#14141a';
  if (kind === 'truck') { R(0, 3, 50, h - 11, shade); R(1, 4, 48, h - 13, body); R(1, 4, 48, 2, light); R(1, h - 15, 48, 2, '#c93030'); R(50, 12, 24, h - 20, '#2f5fae'); R(52, 14, 12, 8, glass); R(50, 12, 24, 1, '#5a8ae0'); R(0, h - 8, 74, 4, '#44444e'); }
  else if (kind === 'bus') { R(0, 2, w, h - 8, shade); R(1, 3, w - 2, h - 10, body); R(1, 3, w - 2, 2, light); R(1, 12, w - 2, 3, '#2f5fae'); for (let x = 5; x < w - 8; x += 11) R(x, 6, 8, 6, glass); R(w - 9, 5, 7, 8, glass); R(0, h - 8, w, 4, '#44444e'); }
  else if (big) { R(0, 4, w, h - 10, shade); R(1, 5, w - 2, h - 12, body); R(1, 5, w - 2, 2, light); R(w - 18, 8, 15, 9, glass); R(w - 19, 8, 1, 9, shade); R(1, 16, w - 2, 2, '#c93030'); R(0, h - 8, w, 4, '#44444e'); }
  else { R(0, 11, w, h - 15, shade); R(1, 12, w - 2, h - 17, body); R(1, 12, w - 2, 2, light); R(0, h - 8, w, 4, '#44444e'); R(11, 3, w - 26, 9, shade); R(12, 4, w - 28, 8, body); R(14, 5, w - 32, 6, glass); R(w - 22, 5, 1, 6, shade); R(w - 12, 6, 6, 5, body); R(w - 24, 3, 12, 1, light);
    if (kind === 'taxi') { R(24, 0, 8, 3, '#fff8d8'); R(25, 1, 6, 1, '#40404a'); for (let x = 3; x < w - 3; x += 4) R(x, 16, 2, 1, '#14141a'); } }
  R(w - 3, h - 14, 3, 3, '#fff6c0'); R(0, h - 14, 2, 3, '#d02020');      // (the lights)
  for (const wx of [Math.round(w * 0.2), Math.round(w * 0.76)]) { for (let yy = -4; yy <= 4; yy++) { const ww = Math.floor(Math.sqrt(16 - yy * yy)); R(wx - ww, wy + yy - 1, ww * 2 + 1, 1, o); } R(wx - 1, wy - 2, 3, 3, '#9a9aa6'); }
  void big; return (c4xCarCache[kind] = c);
}
function c4xDrawCar(x, base, kind, dir, brake) {      // a car whose wheels stand on the row `base`, its middle at the world x
  const cv = c4xCarCv(kind); ctx.save(); ctx.translate(c4xSX(x), Math.round(base)); if (dir < 0) ctx.scale(-1, 1); ctx.fillStyle = 'rgba(0,0,0,0.3)'; ctx.fillRect(-(cv.width >> 1), -2, cv.width, 3); ctx.drawImage(cv, -(cv.width >> 1), -cv.height + 1);
  if (brake) { ctx.fillStyle = '#ff3030'; ctx.fillRect(-(cv.width >> 1), -13, 2, 3); ctx.fillStyle = 'rgba(255,60,60,0.35)'; ctx.fillRect(-(cv.width >> 1) - 3, -14, 3, 5); } ctx.restore();
}
function c4xNyWorld(now) {      // the sky, the sun, the clouds, the skylines, the freeway: the camera does not move
  c4xNyLayers(); const t = now / 1000, g = ctx.createLinearGradient(0, 0, 0, VH); g.addColorStop(0, '#4f9fe6'); g.addColorStop(0.45, '#8fc9f2'); g.addColorStop(0.7, '#cfe8f6'); g.addColorStop(1, '#ffe2b4'); ctx.fillStyle = g; ctx.fillRect(0, 0, VW, VH);
  const sx = Math.round(VW * 0.8), sy = Math.round(VH * 0.18), gl = ctx.createRadialGradient(sx, sy, 2, sx, sy, VH * 0.5); gl.addColorStop(0, 'rgba(255,250,220,0.85)'); gl.addColorStop(1, 'rgba(255,250,220,0)'); ctx.fillStyle = gl; ctx.fillRect(0, 0, VW, VH); ctx.fillStyle = '#fffbe8'; ctx.beginPath(); ctx.arc(sx, sy, 6, 0, 7); ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.85)'; for (const [cx, cy, w] of C4NY.clouds) { const x = Math.round(((cx * (VW + 120) + t * 3) % (VW + 120)) - 60), y = Math.round(cy * VH); ctx.fillRect(x, y, w, 4); ctx.fillRect(x + 6, y - 3, w - 14, 3); ctx.fillRect(x + 12, y + 4, w - 22, 2); }
  const base = Math.round(VH * 0.66); for (const [lay, off] of [[C4NY.far, 100], [C4NY.mid, 260]]) { for (let x = -(off % 760); x < VW; x += 760) ctx.drawImage(lay, x, 0); }
  ctx.fillStyle = 'rgba(255,226,180,0.18)'; ctx.fillRect(0, base - 30, VW, 30);      // (the haze at the foot of the towers)
  const ry = gy - 20;      // the far barrier, the far lane, the near lane
  ctx.fillStyle = '#9d9d98'; ctx.fillRect(0, ry, VW, 6); ctx.fillStyle = '#c2c2bc'; ctx.fillRect(0, ry, VW, 1); ctx.fillStyle = '#6e6e6a'; for (let x = 0; x < VW; x += 12) ctx.fillRect(x, ry + 1, 1, 5);
  ctx.fillStyle = '#4a4d59'; ctx.fillRect(0, ry + 6, VW, 14); ctx.fillStyle = '#565965'; ctx.fillRect(0, ry + 20, VW, VH - ry - 20);
  ctx.fillStyle = '#e8e8e0'; for (let x = -((t * 40) % 24 | 0) - 24; x < VW; x += 24) ctx.fillRect(x, ry + 19, 12, 1); ctx.fillStyle = '#f0c818'; ctx.fillRect(0, ry + 7, VW, 1);
  ctx.fillStyle = '#e8e8e0'; ctx.fillRect(0, gy + 24, VW, 1); ctx.fillStyle = 'rgba(0,0,0,0.12)'; for (let x = 3; x < VW; x += 17) ctx.fillRect(x, gy + 8 + ((x * 7) % 11), 3, 1);
}
function c4xNySign(x) {      // the green sign over the road: NEW YORK and an arrow
  const sx = c4xSX(x), top = Math.round(gy - 86); ctx.fillStyle = '#3a3a40'; ctx.fillRect(sx - 42, top + 18, 2, 70); ctx.fillRect(sx + 40, top + 18, 2, 70); ctx.fillStyle = '#1a1a20'; ctx.fillRect(sx - 46, top - 1, 94, 22); ctx.fillStyle = '#1f7c4c'; ctx.fillRect(sx - 45, top, 92, 20); ctx.fillStyle = '#f4f4f0'; ctx.fillRect(sx - 45, top, 92, 1); ctx.fillRect(sx - 45, top + 19, 92, 1); ctx.fillRect(sx - 45, top, 1, 20); ctx.fillRect(sx + 46, top, 1, 20);
  pxt('NEW YORK', sx - 2, top + 14, '#ffffff', 8, 'center'); ctx.fillStyle = '#ffffff'; ctx.fillRect(sx + 28, top + 9, 12, 2); ctx.fillRect(sx + 36, top + 6, 2, 8); ctx.fillRect(sx + 38, top + 7, 2, 6); ctx.fillRect(sx + 40, top + 8, 1, 4);
}
function c4xCrater(x, a) {      // the crater of Iron Man's landing: a dark dent with a bright rim, cracks that run out of it and a few stones
  const sx = c4xSX(x), cy = gy + 3, rx = Math.round(17 * a), ry = Math.max(2, Math.round(4 * a)); if (rx < 2) return;
  for (let dy = -ry; dy <= ry; dy++) { const w = Math.round(rx * Math.sqrt(Math.max(0, 1 - dy * dy / (ry * ry + 0.01)))); ctx.fillStyle = Math.abs(dy) >= ry ? '#7a7d88' : '#22242c'; ctx.fillRect(sx - w, cy + dy, 2 * w, 1); }
  ctx.fillStyle = '#1b1c22'; for (let i = 0; i < 9; i++) { const ang = i * 0.7 + 0.3, len = (10 + 16 * c4xR(i, 9)) * a; let px = sx, py = cy; for (let k = 0; k < len; k++) { px += Math.cos(ang) * 1.2 + (c4xR(k + i, 3) - 0.5) * 0.8; py += Math.sin(ang) * 0.35 + (c4xR(k, i) - 0.5) * 0.3; ctx.fillRect(Math.round(px), Math.round(py), 1, 1); } }
  ctx.fillStyle = '#9a9ca6'; for (let i = 0; i < 7; i++) ctx.fillRect(sx + Math.round((c4xR(i, 4) - 0.5) * 44 * a), cy + Math.round((c4xR(i, 5) - 0.5) * 5), 2, 2);
}
function c4xPortal(x, rx, now, a, deep) {      // a violet circle on the floor (the purple stone's): a bright rim, a dark middle, sparks that turn round it and motes that rise
  const sx = c4xSX(x), cy = gy + 3, ry = Math.max(2, Math.round(rx * 0.26)); if (rx < 1) return; ctx.save(); ctx.globalAlpha = a === undefined ? 1 : a;
  for (let dy = -ry - 1; dy <= ry + 1; dy++) { const w = Math.round((rx + 1) * Math.sqrt(Math.max(0, 1 - dy * dy / ((ry + 1) * (ry + 1) + 0.01)))); ctx.fillStyle = Math.abs(dy) >= ry ? '#d09cff' : Math.abs(dy) >= ry - 1 ? '#8a4de0' : deep ? '#12052c' : '#2a0f58'; ctx.fillRect(sx - w, cy + dy, 2 * w, 1); }
  for (let i = 0; i < 12; i++) { const th = now / 260 + i * 0.5236, px = sx + Math.round(Math.cos(th) * rx * 0.9), py = cy + Math.round(Math.sin(th) * ry * 0.9); ctx.fillStyle = i % 3 ? '#f1dcff' : '#c98bff'; ctx.fillRect(px, py, 1, 1); }
  for (let i = 0; i < 6; i++) { const k = ((now / 700) + i / 6) % 1; ctx.fillStyle = 'rgba(214,170,255,' + (0.8 * (1 - k)).toFixed(2) + ')'; ctx.fillRect(sx + Math.round((c4xR(i, 7) - 0.5) * rx * 1.4), Math.round(cy - 4 - k * 34), 1, 2); } ctx.restore();
}
function c4xBigDraw(cv, R, x, lift, face, sink, alpha) {      // a figure (Ranos, Iron Man) standing on the roof or the road at the world x
  ctx.save(); ctx.translate(c4xSX(x), 0); if (face < 0) ctx.scale(-1, 1); if (sink > 0) { ctx.beginPath(); ctx.rect(-70, 0, 140, gy + 2); ctx.clip(); } if (alpha !== undefined) ctx.globalAlpha = alpha; ctx.drawImage(cv, -R.cx, gy - R.GY - Math.round(lift) + Math.round((sink || 0) * R.H * 0.85)); ctx.restore();
}

// ================================================================ RANOS STEPS IN (c4x.ph 'ranos'): the same scene after a win or a loss
// WIN: the Black Flash has just thrown Meguna back; LOSS: Meguna's last blow has punched Yuji back. LW = 0.7 s of lead-in (the fight's own bodies move on, no control, no brain), then it is one script: Meguna comes back in a dash and starts a slash, a violet circle opens on the roof between them and RANOS
// rises out of it, his gauntlet (the purple stone) catches Meguna's wrist (a freeze, "NOT YET, SUKUNA." - "...YOU?!"), he throws Meguna away, turns to Yuji and punches him in the stomach ("YOU ARE NEEDED ELSEWHERE."); a second circle opens under Yuji and takes him; a violet-white flash and New York.
// All times are seconds after the lead-in: s. u = a place on the roof in pixels from where Yuji stood, positive towards Meguna (d = +-1 is the way to Meguna in the world).
const C4RS = { lw: 0.7, back: 0.4, dash0: 0.15, dash1: 0.45, port0: 0.3, port1: 0.62, rise0: 0.42, rise1: 0.9, grab: 0.66, l1: 1.0, l2: 2.4, throw: 3.7, thrown: 4.2, turn: 4.3, wind: 4.9, punch: 5.12, sink0: 5.24, sink1: 5.9, flash: 6.4, end: 6.8 };
const C4_TALK_R = [{ t: C4RS.lw + C4RS.l1, d: 1.9, w: 'RANOS', vk: 3, a: 'NOT YET, SUKUNA.', b: '' }, { t: C4RS.lw + C4RS.l2, d: 1.2, w: 'SUKUNA', vk: 5, a: '...YOU?!', b: '' }, { t: C4RS.lw + 4.4, d: 2.0, w: 'RANOS', vk: 3, a: 'YOU ARE NEEDED ELSEWHERE.', b: '' }];
const C4_TALK_N = [{ t: 5.7, d: 2.0, w: 'YUJI', vk: 1, a: 'WHERE... AM I?!', b: '' }, { t: 8.2, d: 2.8, w: 'IRON MAN', vk: 0, a: 'BACK DOWN, KID...', b: 'OR YOU GET STABBED.' }];
const C4_VIO = ['#ffffff', '#f1dcff', '#c98bff', '#8a4de0'];
function c4xRanosStart(now, win) {
  const c = c4x, F = c.F; F.ph = 'over'; c.ph = 'ranos'; c.t0 = now; c.ev = {}; c.rs = { win, set: false, d: 1, y0: 0, m0: 0, u0: 0, uT: 46 }; c.fx = []; c.pool = c.pool2 = null; c.black = null; c.glow = null; c.vf = 0; c4xCine(true); c.y.sink = 0; c.y.tint = 0;
}
function c4xRanosStep(c, now, dt, T) {
  const R = C4RS, Y = c.y, M = c.m, S = c.rs, s = T - R.lw, ev = (n, t, f) => c4xEv(c, T, n, t + R.lw, f), idle = now / (1000 / IDLE_FPS), ease = c4xEase, out = c4xOut;
  c.pool = null; c.pool2 = null; c.fx = []; c.glow = null; c.mFront = false;
  if (s < 0) { c4xYStep(c, now, dt); c4xMStep(c, now, dt); c4xYPose(c, now); c4xMPose(c, now); return; }
  if (!S.set) { S.set = true; S.d = Math.sign(M.x - Y.x) || 1; S.y0 = Y.x; S.m0 = M.x; S.u0 = Math.abs(M.x - Y.x); S.uT = Math.max(46, S.u0 - 50); }
  const d = S.d, X = u => S.y0 + d * u, uR = 20;
  // ---- Yuji: backs away, watches, is punched, goes into the circle
  let yu = -8 * ease(s / R.back), yp = { set: 'idle', fi: idle }, ylift = 0; Y.sink = 0; Y.tint = 0;
  if (s < R.back) yp = { set: 'fwd', fi: 14 - ((s * WALK_FPS) % 15) };
  if (s >= R.punch) { const k = s - R.punch; yu = -8 - 7 * out(k / 0.25); yp = { set: 'rx', k: 1, fi: Math.min(9, 3 + k * 22) }; ylift = 5 * Math.sin(Math.PI * Math.min(1, k / 0.5)); if (s >= R.sink0) { Y.sink = ease((s - R.sink0) / (R.sink1 - R.sink0)); Y.tint = 0.7 * Y.sink; ylift = 0; } }
  Y.x = X(yu); Y.face = d; Y.pose = yp; Y.lift = ylift; Y.gone = s >= R.sink1;
  // ---- Meguna: comes back with a dash and a slash, is held, is thrown, lies there
  const u0 = S.u0, uT = S.uT; let mu = u0, mp = { row: 'frames', fi: idle }, ml = 0;
  if (s >= R.dash0 && s < R.dash1) { const k = out((s - R.dash0) / (R.dash1 - R.dash0)); mu = u0 + (uT - u0) * k; mp = { row: uT < u0 ? 'df' : 'dg', fi: Math.min(14, k * 14.9) }; }
  else if (s >= R.dash1 && s < R.throw) { mu = uT; const e = s - R.dash1; mp = { row: 'sx', fi: e < R.grab - R.dash1 ? Math.min(6, e * 30) : 6 }; if (s >= R.grab) mu += 0.7 * Math.sin(now / 30); }
  else if (s >= R.throw && s < R.thrown) { const k = out((s - R.throw) / (R.thrown - R.throw)); mu = uT + 70 * k; ml = 16 * Math.sin(Math.PI * k); mp = { row: 'h9', fi: Math.min(14, (s - R.throw) * 26) }; }
  else if (s >= R.thrown) { mu = uT + 70; mp = s < R.end - 1.0 ? { row: 'h1', fi: 9 } : { row: 'frames', fi: idle }; }
  if (s < R.dash0) mp = { row: 'frames', fi: idle };
  M.x = X(mu); M.face = -d; M.pose = mp; M.lift = ml; M.sink = 0; M.white = 0; M.rot = 0;
  // ---- Ranos: out of the circle, the catch, the throw, the turn, the punch
  const rs = s < R.rise0 ? 1 : s < R.rise1 ? 1 - ease((s - R.rise0) / (R.rise1 - R.rise0)) : 0, rx = X(uR); let rpose = c4xRanosPose.stand(now / 1000), rface = d;
  if (s >= R.grab - 0.12 && s < R.throw) rpose = c4xMixPose(rpose, c4xRanosPose.catch(now / 1000), ease((s - R.grab + 0.12) / 0.12));
  else if (s >= R.throw && s < R.throw + 0.35) rpose = c4xRanosPose.throw((s - R.throw) / 0.35);
  else if (s >= R.throw + 0.35 && s < R.turn) rpose = c4xMixPose(c4xRanosPose.throw(1), c4xRanosPose.stand(now / 1000), ease((s - R.throw - 0.35) / (R.turn - R.throw - 0.35)));
  if (s >= R.turn) { rface = -d; rpose = c4xRanosPose.stand(now / 1000); if (s >= R.wind - 0.15 && s < R.punch) rpose = c4xMixPose(rpose, c4xRanosPose.windup(), ease((s - R.wind + 0.15) / 0.15)); if (s >= R.punch) rpose = c4xMixPose(c4xRanosPose.punch(), rpose, ease((s - R.punch - 0.45) / 0.45)); if (s >= R.punch && s < R.punch + 0.05) rpose = c4xRanosPose.punch(); }
  if (s >= R.punch && s < R.punch + 0.45) rpose = c4xRanosPose.punch(); if (s >= R.wind && s < R.punch) rpose = c4xRanosPose.windup();
  const rcv = c4xRanos(rpose), rglow = rpose.glow || 0;
  c.fx.push(() => { if (rs < 1 || s >= R.rise0) c4xBigDraw(rcv, C4R, rx, 0, rface, rs); });
  // ---- the circles
  const p1 = s < R.port0 ? 0 : s < R.port1 ? ease((s - R.port0) / (R.port1 - R.port0)) : s < R.rise1 ? 1 : Math.max(0, 1 - (s - R.rise1) / 0.3);
  if (p1 > 0) c.pool = [{ x: rx, rx: 20 * p1, a: 1, violet: true }];
  const p2 = s < R.punch + 0.04 ? 0 : s < R.sink0 ? ease((s - R.punch - 0.04) / (R.sink0 - R.punch - 0.04)) : s < R.sink1 ? 1 : Math.max(0, 1 - (s - R.sink1) / 0.35);
  if (p2 > 0) (c.pool = c.pool || []).push({ x: X(yu), rx: 17 * p2, a: 1, violet: true });
  if (Y.sink > 0 && Y.sink < 1) c.fx.push(() => { for (let i = 0; i < 5; i++) { ctx.fillStyle = i % 2 ? '#f1dcff' : '#c98bff'; ctx.fillRect(c4xSX(Y.x) + Math.round((Math.random() - 0.5) * 18), gy - Math.round(Math.random() * 40), 1, 3); } });
  // ---- the stone's light on the near hand
  if (rglow > 0.4 && rs <= 0) { const gx = c4xSX(rx) + rface * (rpose.arms[1].al > 60 ? 33 : 9), gyy = gy - (rpose.arms[1].al > 60 ? 29 : 34); if (s >= R.grab - 0.1) c.fx.push(() => c4xGlow(Math.round(gx), Math.round(gyy), 4 + ((now / 80) & 1), ['rgba(138,77,224,0.35)', 'rgba(201,139,255,0.6)', 'rgba(241,220,255,0.95)'])); }
  // ---- sounds and effects
  ev('fade', 0, () => c4xMus(c, false, now)); ev('port', R.port0, () => { snd('vanish'); snd('rumble', 1.4); }); ev('rise', R.rise0, () => snd('arrive'));
  ev('dash', R.dash0, () => snd('dash', 0)); ev('slash', R.dash1 + 0.1, () => snd('swing', 3));
  ev('grab', R.grab, () => { hitStop(90); snd('block'); snd('stun'); buzz(60); shakeUntil = now + 200; shakeAmp = 3; c.vf = now + 260; c.vfm = 260; c.vfa = 0.5; c.vfc = '190,130,255'; spark(M.x - d * 2, gy - 50, 18, C4_VIO, true, -d); spark(M.x - d * 2, gy - 50, 10, C4_VIO, false, d); });
  ev('throw', R.throw, () => { snd('swing', 3); snd('smack', 2); shakeUntil = now + 120; shakeAmp = 2; }); ev('land', R.thrown - 0.05, () => { snd('land', 1.8); puff(M.x, 8); shakeUntil = now + 160; shakeAmp = 3; });
  ev('wind', R.wind - 0.15, () => snd('charge'));
  ev('punch', R.punch, () => { hitStop(130); snd('hit', 3); snd('smack', 3); snd('concboom'); buzz(120); shakeUntil = now + 380; shakeAmp = 6; c.vf = now + 420; c.vfm = 420; c.vfa = 0.75; c.vfc = '190,130,255'; spark(Y.x + d * 2, gy - 28, 22, C4_VIO, true, -d); c.ring = now; });
  ev('sink', R.sink0, () => { snd('vanish'); snd('portalclose'); });
  ev('flash', R.flash, () => { c.vf = now + 500; c.vfm = 500; c.vfa = 1; c.vfc = '236,222,255'; });
  if (c.ring) { const a = (now - c.ring) / 500; if (a < 1) c.fx.push(() => { ctx.globalAlpha = 1 - a; c4xRing(c4xSX(Y.x + d * 4), gy - 28, Math.round(4 + a * 34), '#d6a8ff'); c4xRing(c4xSX(Y.x + d * 4), gy - 28, Math.round(3 + a * 30), '#ffffff'); ctx.globalAlpha = 1; }); }
  if (s >= R.flash) { const a = ease((s - R.flash) / 0.3); c.black = () => 0; c.whiteA = a; } else c.whiteA = 0;
  if (T >= R.lw + R.end) c4xNyStart(now);
}

// ================================================================ NEW YORK (c4x.ph 'ny', N = seconds): Yuji falls out of the sky onto the freeway, the cars stop and honk, Iron Man comes down and lands in a little crater, Yuji asks where he is, a blade slides out of the armour: "BACK DOWN, KID... OR YOU GET STABBED."; at 11.2 s a hard cut to black, then TO BE CONTINUED and the chapter menu.
const C4NS = { fall: 0.6, lie: 1.3, up: 1.75, look: [2.3, 3.0, 3.7], wh: 3.1, dive: 4.0, land: 4.8, rise: 5.35, rise1: 5.9, adv0: 6.4, adv1: 8.0, blade: 8.0, eye: 9.0, cut: 11.2, card: 12.2, end: 15.8 };
function c4xNyStart(now) {
  const c = c4x, Y = c.y; c.ph = 'ny'; c.t0 = now; c.ev = {}; c.vi = -1; c.vc = 0; c.fx = []; c.pool = c.pool2 = null; c.glow = null; c.black = null; c.whiteA = 0; c.cam = 0; c.camOk = true; wx = 0; c.vf = now + 700; c.vfm = 700; c.vfa = 1; c.vfc = '236,222,255';
  Object.assign(Y, { x: 0, face: 1, lift: 0, rot: 0, white: 0, sink: 0, tint: 0, gone: false, alpha: undefined, pose: null });
  const cars = [['taxi', -76, 1, 0], ['sedan', -136, 1, 2], ['van', -202, 1, 4], ['dark', 104, -1, 1], ['white', 164, -1, 3], ['truck', 246, -1, 5]].map(([k, x, dir, hk]) => ({ k, x, dir, hk, next: 0.7 + Math.random() * 0.8 }));
  const far = [['bus', 40, 66], ['taxi', 190, 84], ['white', 330, 74], ['truck', 450, 62], ['sedan', 580, 96]].map(([k, x, v]) => ({ k, x: x - 150, v: -v, w: 0 }));
  c.ny = { cars, far, hn: [], t: 0 }; popups = []; sparks = []; smoke = []; snd('windOff');
}
function c4xNyStep(c, now, dt, T) {
  const N = C4NS, Y = c.y, ny = c.ny, ev = (n, t, f) => c4xEv(c, T, n, t, f), idle = now / (1000 / IDLE_FPS), ease = c4xEase, out = c4xOut, IMx = 58;
  // ---- the cars: the far lane rolls on (and slows to look); the near ones stand with their brake lights on and honk
  const slow = T < N.land ? 1 : Math.max(0.12, 1 - (T - N.land) * 0.8); for (const f of ny.far) { f.x += f.v * slow * dt; if (f.x < -330) f.x += 900; }
  const env = T < 0.5 ? 0 : T < N.land - 0.2 ? 1 : T < N.land + 0.8 ? 0.1 : T < N.blade - 0.2 ? 0.45 : 0;
  for (const k of ny.cars) if (T >= k.next) { k.next = T + 0.32 + Math.random() * 0.55; if (Math.random() < env) { snd('honk', k.hk + ((Math.random() * 2) | 0)); ny.hn.push({ x: k.x + (k.dir > 0 ? 8 : -8), t0: now, base: k.k }); if (ny.hn.length > 8) ny.hn.shift(); } }
  // ---- Yuji
  Y.rot = 0; Y.lift = 0; Y.white = 0; Y.face = 1; let yp = { set: 'idle', fi: idle };
  if (T < N.fall) { const u = T / N.fall; Y.lift = 112 * (1 - u * u); Y.rot = 0.9 + 3 * u; Y.x = 0; yp = { set: 'rx', k: 1, fi: 8 }; }
  else if (T < N.lie) { Y.x = 0; yp = { set: 'rx', k: 4, fi: 10 + Math.min(1, (T - N.fall) / 0.3) }; }
  else if (T < N.up) { yp = { set: 'rx', k: 4, fi: 12 + 2.99 * (T - N.lie) / (N.up - N.lie) }; }
  else { Y.face = T >= N.look[0] && T < N.look[1] ? -1 : T >= N.look[2] && T < N.look[2] + 0.7 ? -1 : 1; if (T >= N.land) { const k = T - N.land; yp = k < 0.35 ? { set: 'rx', k: 0, fi: Math.min(14, 2 + k * 30) } : { set: 'blk', fi: 9 }; Y.x = -Math.min(10, 6 * out(k / 0.3)); Y.face = 1; if (T >= N.adv0) Y.x -= 6 * ease((T - N.adv0) / (N.adv1 - N.adv0)); if (T >= N.blade) { yp = { set: 'blk', fi: 9 }; Y.x += 0.5 * Math.sin(now / 35); } } }
  Y.pose = yp;
  // ---- Iron Man: a bright point in the sky, a dive, the landing, up, a slow step, the blade
  let ip = null, ix = IMx, il = 0, ia = 0;
  if (T >= N.dive && T < N.land) { const u = (T - N.dive) / (N.land - N.dive); ix = IMx + 64 * (1 - out(u)); il = 150 * (1 - u) * (1 - u); ip = c4xIronPose.fall(T); ia = 1 - u; }
  else if (T >= N.land && T < N.rise) { ip = c4xIronPose.land(); il = 0; }
  else if (T >= N.rise && T < N.rise1) ip = c4xMixPose(c4xIronPose.land(), c4xIronPose.stand(T), ease((T - N.rise) / (N.rise1 - N.rise)));
  else if (T >= N.rise1 && T < N.blade) { ip = c4xIronPose.stand(T); ix = IMx - 12 * ease((T - N.adv0) / (N.adv1 - N.adv0)); }
  else if (T >= N.blade) { ip = c4xIronPose.blade((T - N.blade) / 0.3); ix = IMx - 12; }
  ny.im = ip && { cv: c4xIron(ip), x: ix, lift: il, ia, fall: T >= N.dive && T < N.land };
  // ---- sounds and effects
  ev('land1', N.fall, () => { snd('land', 2); puff(0, 10); shakeUntil = now + 220; shakeAmp = 4; buzz(60); spark(0, gy - 4, 10, ['#d8d8d0', '#9a9ca6'], false, 1); });
  ev('thrust', N.dive - 0.9, () => snd('thrust', 1.6)); ev('land2', N.land, () => { snd('concboom'); snd('land', 2.2); puff(IMx, 14); puff(IMx - 12, 8); puff(IMx + 12, 8); shakeUntil = now + 420; shakeAmp = 6; buzz(120); hitStop(70); spark(IMx, gy, 20, ['#ffd27a', '#ff8a1e', '#ffffff', '#9a9ca6'], true, 1); spark(IMx, gy, 14, ['#ffd27a', '#ff8a1e', '#9a9ca6'], true, -1); });
  ev('blade', N.blade, () => snd('shing')); ev('cut', N.cut, () => { c.black = () => 1; snd('windOff'); }); ev('card', N.card, () => snd('c7drone'));
  if (T >= N.cut) c.black = () => 1;
  if (T >= N.end) { const slot = story ? story.slot : -1; storyDone15(); c4xOff(); svSel = slot; svView = 1; $('vsres').classList.remove('on'); show('saves'); renderSaves(); }
}
function c4xNyDraw(c, now, dt, T) {
  const N = C4NS, ny = c.ny, Y = c.y; if (T >= N.cut) { c4xTbc(T); return; }
  c4xNyWorld(now); c4xNySign(-70);
  for (const f of ny.far) c4xDrawCar(f.x, gy - 5, f.k, f.v < 0 ? -1 : 1, false);
  for (const k of ny.cars) c4xDrawCar(k.x, gy + 5, k.k, k.dir, true);
  if (T >= N.land) c4xCrater(58, Math.min(1, (T - N.land) / 0.2));
  c4xShadow(Y.x, Y.lift, 9); c4xDrawY(Y);
  const im = ny.im; if (im) {
    if (im.fall) { const sx = c4xSX(im.x), top = gy - Math.round(im.lift) - 56, len = Math.round(26 + 70 * im.ia); for (let i = 0; i < len; i += 2) { const k = i / len, w = Math.max(1, Math.round(5 * (1 - k))); ctx.fillStyle = i < len * 0.3 ? '#ffffff' : i < len * 0.6 ? '#ffd24a' : '#ff8a1e'; ctx.globalAlpha = 1 - k * 0.8; ctx.fillRect(sx - (w >> 1) + (((i * 7) % 3) - 1), top + 52 + i, w, 2); } ctx.globalAlpha = 1; c4xGlow(sx, top + 54, 7, ['rgba(255,138,30,0.3)', 'rgba(255,210,74,0.55)', 'rgba(255,255,255,0.9)']); }
    c4xBigDraw(im.cv, C4I, im.x, im.lift, -1, 0);
    if (T >= N.blade && T < N.cut) { const sx = c4xSX(im.x - 40), sy = gy - 46, k = ((now / 90) | 0) % 2; ctx.fillStyle = k ? '#ffffff' : '#aef6ff'; ctx.fillRect(sx - 1, sy - 5, 1, 4); ctx.fillRect(sx - 3, sy - 3, 5, 1); }
    if (T >= N.land && T < N.land + 0.6) { const a = (T - N.land) / 0.6; ctx.globalAlpha = 1 - a; c4xRing(c4xSX(im.x), gy + 2, Math.round(6 + 34 * a), '#ffd27a'); ctx.globalAlpha = 1; }
  }
  for (const h of ny.hn) { const a = (now - h.t0) / 480; if (a < 1) { ctx.globalAlpha = 1 - a; pxt('HONK!', c4xSX(h.x), gy - 36 - Math.round(a * 8), a < 0.3 ? '#fff6a0' : '#ffd34d', 8, 'center'); ctx.globalAlpha = 1; } }
  if ((T >= N.look[0] && T < N.look[0] + 0.7) || (T >= N.look[1] && T < N.look[1] + 0.7) || (T >= N.look[2] && T < N.look[2] + 0.7) || (T >= N.up && T < N.up + 0.5)) pxt('?', c4xSX(Y.x) + 2, gy - 60, '#ffffff', 16, 'center');
  drawSmoke(now, dt); drawSparks(now, dt); drawPopups(now);
  if (T >= N.eye) c4xFear(c, T);
}
function c4xFear(c, T) {      // Yuji's eye, close and full screen (a hard cut to it): wide, a shrunk pupil that shakes, an arched brow, the pink fringe, drops of sweat, and a glint of the blade in the eye
  const u = (T - C4NS.eye), W = VW, H = VH, cx = Math.round(W / 2), cy = Math.round(H * 0.6), rx = Math.round(W * 0.24), ry = Math.round(H * 0.3), q = Math.max(2, Math.round(H / 64)); ctx.save();
  ctx.fillStyle = '#f3c9a0'; ctx.fillRect(0, 0, W, H); ctx.fillStyle = '#e6b088'; ctx.fillRect(0, Math.round(H * 0.82), W, H);
  ctx.fillStyle = '#e8a8b8'; ctx.fillRect(0, 0, W, Math.round(H * 0.16)); ctx.fillStyle = '#c47e92'; for (let x = 0; x < W; x += q * 6) { ctx.fillRect(x, Math.round(H * 0.16), q * 3, q * 3); ctx.fillRect(x + q * 3, Math.round(H * 0.16), q * 2, q * 5); }
  ctx.fillStyle = '#14101c'; ctx.fillRect(cx - rx - q * 2, cy - ry - q * 6, rx * 2 + q * 4, q * 3); ctx.fillRect(cx - rx - q * 5, cy - ry - q * 4, q * 6, q * 3); ctx.fillRect(cx - rx * 0.2, cy - ry - q * 8, rx * 1.2, q * 3);      // (the brow, arched and pulled up)
  for (let yy = -ry - q; yy <= ry + q; yy++) { const ww = Math.round((rx + q) * Math.sqrt(Math.max(0, 1 - yy * yy / ((ry + q) * (ry + q))))); ctx.fillStyle = '#14101c'; ctx.fillRect(cx - ww, cy + yy, ww * 2, 1); }
  for (let yy = -ry; yy <= ry; yy++) { const ww = Math.round(rx * Math.sqrt(Math.max(0, 1 - yy * yy / (ry * ry)))); ctx.fillStyle = '#f6f2ec'; ctx.fillRect(cx - ww, cy + yy, ww * 2, 1); }
  const tr = Math.round(Math.sin(T * 45) * q * 0.5), ir = Math.round(ry * 0.52), disc = (r, col) => { ctx.fillStyle = col; for (let yy = -r; yy <= r; yy++) { const w = Math.floor(Math.sqrt(r * r - yy * yy)); ctx.fillRect(cx - w + tr, cy + yy, w * 2 + 1, 1); } };
  disc(ir, '#7a4a2a'); disc(ir - q, '#3a2214'); disc(Math.max(2, q * 2), '#0c0810'); ctx.fillStyle = '#ffffff'; ctx.fillRect(cx - Math.round(ir * 0.55) + tr, cy - Math.round(ir * 0.55), q * 2, q * 2);
  if (u > 0.5) { const k = Math.min(1, (u - 0.5) / 0.35); ctx.fillStyle = '#ffffff'; for (let i = 0; i < ir * 1.6 * k; i++) ctx.fillRect(cx + q * 2 + i + tr, cy + q * 2 - Math.round(i * 0.6), 2, 1); }      // (the glint of the blade)
  ctx.fillStyle = '#9fd8ff'; const sd = ((u * 10) | 0) % 3; for (const [dx, dy] of [[0.36, 0.2], [0.42, 0.36]]) { ctx.fillRect(Math.round(W * (0.5 + dx)), Math.round(H * dy) + sd * q, q * 2, q * 4); ctx.fillStyle = '#ffffff'; ctx.fillRect(Math.round(W * (0.5 + dx)) + q, Math.round(H * dy) + sd * q + q, 1, q * 2); ctx.fillStyle = '#9fd8ff'; }
  ctx.restore();
}
function c4xTbc(T) {      // black, then the words
  ctx.fillStyle = '#000'; ctx.fillRect(0, 0, VW, VH); const a = c4xEase((T - C4NS.card) / 0.8) * (T > C4NS.end - 0.7 ? Math.max(0, (C4NS.end - T) / 0.7) : 1); if (a <= 0) return; ctx.globalAlpha = a; pxt('TO BE CONTINUED', VW / 2, Math.round(VH * 0.5), '#ffffff', 16, 'center'); ctx.globalAlpha = 1;
}
