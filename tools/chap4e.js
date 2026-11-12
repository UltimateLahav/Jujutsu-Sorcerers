// ================================================================ v1.157 CHAPTER 4, PART 4 (tools/chap4e.js): the figures of RANOS (the one at the end of chapter 2, who blew up the planet; rebuilt in v1.159 with a hand-drawn head and an arm that reaches) and IRON MAN, the cars and the sky of NEW YORK
// Both are drawn at run time with the shaded capsules of chapter 4 (c15MegKit: the same look as the people of the street), pose by pose, facing right, and cached by the numbers of the pose: c4xIron(pose) -> a 128 x 100 canvas (soles on row 92, middle column 48; the room on the right is for the blade); c4xRanos(pose) -> a 112 x 104 canvas (see below).
// A POSE of Iron Man: x, y = the hip, lean (degrees, forward), hdx, hdy, hdt = the head, arms [{ al: the upper arm's angle from straight down, forward positive, el: the bend of the elbow }, ...] (the first is the far arm),
// legs [{ ax, ay: where the ankle is, a: the foot's angle }, ...], fl (the flames under the boots), bl (the length of the blade in pixels, 0 - 26: a whole number, so that every length has its own picture), rep (the palm repulsors, 0 - 1), vis (the faceplate is shut and lit).
const { Pix: C4Pix, cap: c4cap, ell: c4ell, uni: c4uni, clip: c4clip, M: c4M, K: c4K, ik: c4ik } = c15MegKit;
const C4I = { W: 128, H: 100, GY: 92, cx: 48, L1: 14, L2: 14, LT: 20, UA: 11, FA: 10.5, AH: 3.5 };
const C4IC = { red: '#c4202c', gold: '#e4b636', dark: '#34343f', glow: '#aef6ff', white: '#f4fdff', blade: '#ff2a3a' };
const C4RAD = Math.PI / 180;
function c4xMixPose(a, b, t) {      // two poses mixed number by number (the arms and legs too)
  const o = {}; for (const k of new Set([...Object.keys(a), ...Object.keys(b)])) { if (k === 'arms' || k === 'legs') continue; const x = a[k], y = b[k]; o[k] = Array.isArray(x) && Array.isArray(y) ? x.map((v, i) => v + (y[i] - v) * t) : typeof x === 'number' || typeof y === 'number' ? (x === undefined ? y : x) + ((y === undefined ? x : y) - (x === undefined ? y : x)) * t : (t < 0.5 ? x : y); }
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

// ---------------------------------------------------------------- RANOS (v1.158): the one at the end of chapter 2, who blew up the planet: purple skin, a bald head with a great jaw, a dark-blue vest, dark trousers, black boots with golden knee guards and the golden gauntlet with the purple stone (the colours are the ones of his picture there, tools/thanos_64.png)
// He is drawn at run time with the same shaded capsules as the others (c15MegKit), pose by pose, facing right, and cached by the numbers of the pose: c4xRanos(pose) -> a 112 x 104 canvas (soles on row 100, the middle of him on column 56).
// A POSE: x, y = the hip, lean (degrees, forward), hdx, hdy, hdt = the head, arms [the far arm { al: the upper arm's angle from straight down, forward positive, el: the bend of the elbow }, the near arm (the gauntlet) { al, el }], hand [dx, dy] = where the gauntlet's fist is, seen from the shoulder (forward and down positive; it takes the place of the near arm's angles: the arm is bent as far as it needs to reach it),
// legs [{ ax, ay: where the ankle is, a: the foot's angle }, ...] (the first is the far leg), glow (the light of the stone, 0 - 1).
const C4R = { W: 112, H: 104, GY: 100, cx: 56, L1: 16, L2: 16, LT: 26, UA: 13.5, FA: 12.5, AH: 4 };
const C4RM = (() => {      // his materials: the four tones of each colour of the picture (dark to light) and its outline; the far side of him is a little darker
  const mk = (cols, out) => { const m = cols.map(c4K); m.o = c4K(out); return m; }, dk = (cols, f) => cols.map(h => '#' + [1, 3, 5].map(i => Math.round(parseInt(h.slice(i, i + 2), 16) * f).toString(16).padStart(2, '0')).join(''));
  const skin = ['#4d3f78', '#7360a4', '#9a86c6', '#c6b4e8'], vest = ['#0e1030', '#181c50', '#3b449e', '#5560bc'], cloth = ['#1b1a14', '#35332b', '#4f4c41', '#6a6657'], boot = ['#09080d', '#15141b', '#26242d', '#3e3c48'], gold = ['#5e4012', '#a87820', '#dcae44', '#f8e082'], belt = ['#120a04', '#22140a', '#3a2208', '#5c3c10'];
  return { skin: mk(skin, '#0c0916'), skinF: mk(dk(skin, 0.78), '#0c0916'), vest: mk(vest, '#07081a'), vestF: mk(dk(vest, 0.8), '#07081a'), cloth: mk(cloth, '#0a0906'), clothF: mk(dk(cloth, 0.8), '#0a0906'), boot: mk(boot, '#050409'), bootF: mk(dk(boot, 0.8), '#050409'), gold: mk(gold, '#22140a'), goldF: mk(dk(gold, 0.78), '#22140a'), belt: mk(belt, '#050302') };
})();
const C4RH = [[6, '334443'], [4, '2334444443'], [3, '223334444443'], [2, '2223334444443'], [2, '2223334242443'], [2, '2223334444443'], [2, '22233334444443'], [2, '222333334444443'], [2, '2223333eeeeeee2'], [2, '22233332ewwie2'], [2, '222333332233343'], [2, '2223333332333343'], [2, '2223333333332322'], [2, '222333333333322'], [3, '22333333334443'], [3, '22333332eeeee'], [3, '22333333344443'], [3, '22333333344143'], [4, '223333334432'], [5, '122222221']];      // (his head, facing right, drawn by hand: 1 - 4 the four tones of his skin, e the dark of the brow, the eye socket and the mouth, w the white of the eye, i the iris)
const C4RHD = (() => {      // the head as a list of [dx, dy, colour] round the middle of the skull (the outline is added)
  const g = new Map(), col = { 1: C4RM.skin[0], 2: C4RM.skin[1], 3: C4RM.skin[2], 4: C4RM.skin[3], e: c4K('#1d1033'), w: c4K('#f0e6ff'), i: c4K('#7a5cc8') }, ear = { '9,5': '2', '9,6': '4', '10,5': '1', '10,6': '3', '11,5': '1', '11,6': '3', '12,5': '2', '12,6': '2' };
  C4RH.forEach(([l, t], y) => { for (let k = 0; k < t.length; k++) g.set((l + k) + ',' + y, t[k]); }); for (const k in ear) { const [y, x] = k.split(',').map(Number); g.set(x + ',' + y, ear[k]); }
  const out = []; for (const [k, c] of g) { const [x, y] = k.split(',').map(Number); out.push([x - 9, y - 10, col[c]]); }
  for (let y = -1; y <= C4RH.length; y++) for (let x = 0; x <= 19; x++) if (!g.has(x + ',' + y) && [[1, 0], [-1, 0], [0, 1], [0, -1]].some(([dx, dy]) => g.has((x + dx) + ',' + (y + dy)))) out.push([x - 9, y - 10, C4RM.skin.o]);
  return out;
})();
function c4xRIK(o) {      // the near arm's angles from the point its fist must reach: the elbow hangs below (or behind) the line from the shoulder to the fist; the fist sticks out 2.6 pixels beyond the wrist along the forearm, so the arm is solved three times, each time with the direction the forearm had in the last one
  if (!o.hand) return o; const R = C4R, tx = o.hand[0], ty = o.hand[1], mx = (R.UA + R.FA) * 0.995; let ux = tx, uy = ty, a1 = 0, a2 = 0;
  for (let k = 0; k < 3; k++) {
    const dl = Math.hypot(ux, uy) || 1, wx = tx - ux / dl * 2.6, wy = ty - uy / dl * 2.6, d = Math.max(1, Math.min(mx, Math.hypot(wx, wy))), ph = Math.atan2(wx, wy), be = Math.acos(Math.max(-1, Math.min(1, (R.UA * R.UA + d * d - R.FA * R.FA) / (2 * R.UA * d))));
    a1 = ph - be; a2 = Math.atan2(Math.sin(ph) * d - Math.sin(a1) * R.UA, Math.cos(ph) * d - Math.cos(a1) * R.UA); ux = Math.sin(a2); uy = Math.cos(a2);
  }
  return { ...o, arms: [o.arms[0], { al: a1 / C4RAD, el: (a2 - a1) / C4RAD }] };
}
function c4xDrawRanos(o0) {
  const o = c4xRIK(o0), R = C4R, p = new C4Pix(R.W, R.H), J = c4xRig(R, o), { P, at, Nk, Sh, hd, arms, legs } = J, M = C4RM, K = c4K, g = o.glow || 0, [hx, hy] = hd;
  const drawArm = k => {
    const a = arms[k], near = k === 1, sk = near ? M.skin : M.skinF, gd = near ? M.gold : M.goldF;
    p.put(c4uni(c4ell(Sh[0], Sh[1], 4.2, 4.2), c4cap(Sh[0], Sh[1], a.E[0], a.E[1], 3.9, 3.4)), sk);      // (the shoulder and the upper arm: bare, purple)
    if (!near) { p.put(c4cap(a.E[0], a.E[1], a.W[0], a.W[1], 3.4, 2.9), sk); p.put(c4ell(a.h[0], a.h[1], 3.7, 3.9), sk); return; }
    const cu = [a.E[0] + (a.W[0] - a.E[0]) * 0.16, a.E[1] + (a.W[1] - a.E[1]) * 0.16];
    p.put(c4cap(a.E[0], a.E[1], a.W[0], a.W[1], 3.9, 3.3), gd); p.put(c4ell(cu[0], cu[1], 4.6, 4.6), gd);      // (the gauntlet: the bracer and its flared cuff)
    p.put(c4ell(a.h[0], a.h[1], 4.6, 4.8), gd);      // (the fist)
    const ux = Math.sin(a.a2), uy = Math.cos(a.a2), nx = uy, ny = -ux, dg = K('#5e4012');      // (along the arm; and towards the back of the hand)
    for (const t of [-1.6, 0.2, 2.0]) p.px(a.h[0] + ux * 3.1 + nx * t, a.h[1] + uy * 3.1 + ny * t, dg);      // (the gaps between the fingers)
    const sx = a.h[0] + nx * 3.4 - ux * 0.6, sy = a.h[1] + ny * 3.4 - uy * 0.6, st = K(g > 0.6 ? '#f1dcff' : '#c98bff'), sd = K('#6a28d8');      // (the stone on the back of the hand)
    p.px(sx, sy, st); p.px(sx + 1, sy, sd); p.px(sx, sy + 1, sd); p.px(sx - 1, sy, sd); p.px(sx, sy - 1, sd); if (g > 0.3) { p.px(sx + 1, sy - 1, st); p.px(sx - 1, sy + 1, st); }
  };
  const drawLeg = k => { const l = legs[k], far = k === 0, Hp = [P[0] + 0.4, P[1]], bt = far ? M.bootF : M.boot;
    p.put(c4cap(Hp[0], Hp[1], l.K[0], l.K[1], 5.8, 4.7), far ? M.clothF : M.cloth);      // (the thigh: the dark trousers)
    p.put(c4cap(l.K[0], l.K[1], l.ax, l.ay, 4.5, 3.3), bt);      // (the long boot)
    p.put(c4ell(l.K[0] + 0.7, l.K[1], 3.0, 3.5), far ? M.goldF : M.gold);      // (the golden knee guard)
    c4xFoot(p, l, bt, K('#050409')); };
  drawArm(0); drawLeg(0); drawLeg(1);
  const w1 = at(0.3, 0), w2 = at(0.7, 0), bl = at(0.1, 0);
  p.put(c4clip(c4uni(c4cap(P[0], P[1], w1[0], w1[1], 7.2, 8.0), c4cap(w1[0], w1[1], w2[0], w2[1], 8.0, 11.0), c4cap(w2[0], w2[1], Nk[0], Nk[1], 11.0, 7.0)), (x, y) => y < bl[1] + 1.6), M.vest);      // (the vest: the waist, the broad chest, the shoulders; it ends at the belt, over the tops of the legs)
  const op = at(0.8, 5.4); p.put(c4ell(op[0], op[1], 2.5, 5.2), M.skin, 1);      // (the open neck of the vest: his chest)
  p.put(c4cap(bl[0] - 7.4, bl[1], bl[0] + 7.4, bl[1], 1.7, 1.7), M.belt, 1); const bk = at(0.1, 6.6); p.rect(Math.round(bk[0]) - 1, Math.round(bk[1]) - 1, 3, 3, K('#dcae44')); p.px(bk[0], bk[1], K('#5e4012'));      // (the belt and its buckle)
  p.put(c4cap(hd[0] - 1.2, hd[1] + 4, Nk[0] + 0.4, Nk[1] - 0.6, 3.5, 4.3), M.skin);      // (the neck)
  p.put(c4cap(Nk[0] - 0.3, Nk[1] + 1.6, Nk[0] + 0.3, Nk[1] - 1.2, 4.6, 4.8), M.cloth, 1);      // (the dark collar)
  for (const [dx, dy, c] of C4RHD) p.px(hx + dx, hy + dy, c);      // (the head: drawn by hand, see C4RH)
  drawArm(1); return p;
}
const c4xRanos = o => c4xCv('r', o, c4xDrawRanos);
const C4RG = C4R.GY - C4R.AH, C4RHY = C4RG - (C4R.L1 + C4R.L2) * 0.97;      // (the height of an ankle on the floor; the hip's height when he stands)
const C4RL = [{ ax: 48, ay: C4RG, a: 0 }, { ax: 64, ay: C4RG, a: 0 }];      // (his stance: the feet stay where they are in the standing, catching and throwing poses)
function c4xRanosReach(o, fx, fy) {      // the pose o with its fist on the point fx pixels in front of the middle of him and fy pixels above the floor
  const S = c4xRig(C4R, { ...o, arms: [{ al: 0, el: 0 }, { al: 0, el: 0 }] }).Sh; return { ...o, hand: [C4R.cx + fx - S[0], C4R.GY - fy - S[1]] };
}
const c4xRanosPose = {
  stand(t) { const b = Math.sin(t * 2) * 0.45; return { x: 56, y: C4RHY + b * 0.5, lean: 3, hdx: 1.2, hdt: 1, glow: 0.4 + 0.2 * Math.sin(t * 3), arms: [{ al: -9, el: 12 + b }, null], hand: [8.5, 10 - b * 0.6], legs: C4RL }; },
  fall() { return { x: 56, y: C4RHY - 1, lean: 5, hdx: 1.0, hdt: 0, glow: 0.8, arms: [{ al: -36, el: 14 }, null], hand: [8, 27], legs: [{ ax: 50, ay: C4RG - 2, a: 8 }, { ax: 62, ay: C4RG - 1, a: 4 }] }; },      // (feet first, the fist reaching for the roof)
  land() { return c4xRanosReach({ x: 52, y: C4RHY + 17, lean: 30, hdx: 2.0, hdy: 1.5, hdt: 14, glow: 1, arms: [{ al: -42, el: 22 }, null], legs: [{ ax: 43, ay: C4RG, a: 0 }, { ax: 67, ay: C4RG, a: 0 }] }, 21, 6); },
  catch(t) { const w = Math.sin(t * 2.6); return { x: 55, y: C4RHY + 1 + 0.4 * w, lean: 8 + 1.2 * w, hdx: 1.8, hdt: 2, glow: 1, arms: [{ al: -26, el: 36 }, null], hand: [22, 8], legs: C4RL }; },      // (he holds: a slow sway of the strain; the fist stays on Meguna's, the arm follows)
  throw() { return { x: 54, y: C4RHY + 2, lean: -6, hdx: 1.0, hdt: -3, glow: 1, arms: [{ al: 34, el: 30 }, null], hand: [22, -14], legs: C4RL }; },
  walk(ph) {      // a stride: the foot on the floor goes back, then swings forward through the air; the boots are heavy
    const leg = k => { const q = (ph + 0.5 * k) % 1; if (q < 0.5) return { ax: 66 - 22 * (q / 0.5), ay: C4RG, a: 0 }; const u = (q - 0.5) / 0.5; return { ax: 44 + 22 * u, ay: C4RG - 5 * Math.sin(Math.PI * u), a: 10 * Math.sin(Math.PI * u) }; }, w = Math.cos(2 * Math.PI * ph);
    return { x: 56, y: C4RHY + 0.7 * Math.abs(Math.sin(2 * Math.PI * ph)), lean: 5, hdx: 1.5, hdt: 1, glow: 0.5, arms: [{ al: 14 * w, el: 16 }, null], hand: [8 + 3 * w, 11], legs: [leg(0), leg(1)] };
  },
  windup() { return { x: 54, y: C4RHY + 3, lean: -11, hdx: 0.8, hdt: -3, glow: 1, arms: [{ al: 14, el: 62 }, null], hand: [-12, 3], legs: [{ ax: 44, ay: C4RG, a: 0 }, { ax: 68, ay: C4RG, a: 0 }] }; },
  punch() { return { x: 60, y: C4RHY + 7, lean: 26, hdx: 2.4, hdy: 0.6, hdt: 9, glow: 1, arms: [{ al: 16, el: 34 }, null], hand: [16, 18], legs: [{ ax: 42, ay: C4RG, a: 0 }, { ax: 72, ay: C4RG, a: 0 }] }; },
};
// ---------------------------------------------------------------- IRON MAN
function c4xDrawIron(o) {
  const R = C4I, p = new C4Pix(R.W, R.H), J = c4xRig(R, o), { P, at, Nk, Sh, hd, arms, legs } = J, C = C4IC, K = c4K, red = c4M(C.red), gold = c4M(C.gold);
  const drawArm = k => { const a = arms[k], far = k ? 0 : 0.1, rd = c4M(C.red, far), gd = c4M(C.gold, far), rep = o.rep || 0;
    p.put(c4uni(c4ell(Sh[0], Sh[1], 4.2, 4.2), c4cap(Sh[0], Sh[1], a.E[0], a.E[1], 3.5, 3.0)), rd); p.put(c4cap(a.E[0], a.E[1], a.W[0], a.W[1], 3.1, 2.7), c4M(C.red, far)); p.put(c4cap(a.E[0] + (a.W[0] - a.E[0]) * 0.4, a.E[1] + (a.W[1] - a.E[1]) * 0.4, a.W[0], a.W[1], 3.2, 2.9), gd, 1);
    p.put(c4ell(a.h[0], a.h[1], 3.0, 3.2), rd);
    if (rep > 0 && k === 0) { const gx = a.h[0] + Math.sin(a.a2) * 2.4, gy2 = a.h[1] + Math.cos(a.a2) * 2.4; for (const [dx, dy, c] of [[0, 0, C.white], [1, 0, C.glow], [-1, 0, C.glow], [0, 1, C.glow], [0, -1, C.glow], [2, 0, C.glow], [-2, 0, C.glow], [0, 2, C.glow], [0, -2, C.glow]]) if (rep > 0.5 || (dx === 0 && dy === 0)) p.px(gx + dx, gy2 + dy, K(c)); }
    if (k === 1 && o.bl > 0) {      // the blade: red, it comes out of the front of the fist along the forearm (its base is inside the fist), with a golden guard where they meet and a golden housing on the wrist
      const ux = Math.sin(a.a2), uy = Math.cos(a.a2), vx = uy, vy = -ux, L = o.bl, bx = a.h[0] + ux * 0.5, by = a.h[1] + uy * 0.5, tx = a.h[0] + ux * (L + 4), ty = a.h[1] + uy * (L + 4);
      p.put(c4cap(a.W[0], a.W[1], a.W[0] + ux * 3, a.W[1] + uy * 3, 3.6, 3.6), gd, 1);      // (the housing on the wrist)
      p.put(c4cap(bx, by, tx, ty, 2.7, 0.5), c4M(C.blade));      // (the blade: thick at the hand, a point at the end)
      p.line([bx + ux * 2.5 + vx * 0.9, by + uy * 2.5 + vy * 0.9], [tx - ux * 2.5 + vx * 0.4, ty - uy * 2.5 + vy * 0.4], K('#ffc4c8'));      // (the bright edge along it)
      p.put(c4cap(a.h[0] + ux * 3.2 + vx * 3.6, a.h[1] + uy * 3.2 + vy * 3.6, a.h[0] + ux * 3.2 - vx * 3.6, a.h[1] + uy * 3.2 - vy * 3.6, 1.3, 1.3), gd, 1);      // (the guard)
      if (L > 6) p.px(tx - ux, ty - uy, K('#ffffff'));      // (the glint of the point)
    }
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
function c4xIronBlade(o) {      // the blade of a pose: [fist, point], each [forward, up] in game pixels from the middle of his feet; null when it is not out
  if (!(o.bl > 0)) return null; const a = c4xRig(C4I, o).arms[1], ux = Math.sin(a.a2), uy = Math.cos(a.a2), L = o.bl + 4, f = (x, y) => [x - C4I.cx, C4I.GY - y]; return [f(a.h[0], a.h[1]), f(a.h[0] + ux * L, a.h[1] + uy * L)];
}
const C4IG = C4I.GY - C4I.AH;
const c4xIronPose = {
  fall(t) { const w = Math.sin(t * 40) * 0.5; return { x: 48, y: 50, lean: 0, hdx: 0.8, hdt: 0, fl: 1, ph: t, rep: 0, arms: [{ al: -22, el: 10 }, { al: -26, el: 12 }], legs: [{ ax: 45, ay: C4IG - 1 + w, a: -42 }, { ax: 51, ay: C4IG + w, a: -46 }] }; },
  land() { return { x: 44, y: 79, lean: 40, hdx: 1.6, hdy: 1.5, hdt: 24, fl: 0, arms: [{ al: -34, el: 36 }, { al: 34, el: 10 }], legs: [{ ax: 25, ay: C4IG + 0.5, a: -52 }, { ax: 55, ay: C4IG, a: 0 }] }; },
  crouch() { return { x: 46, y: 66, lean: 24, hdx: 1.4, hdy: 1.0, hdt: 12, fl: 0, arms: [{ al: -22, el: 30 }, { al: 30, el: 20 }], legs: [{ ax: 33, ay: C4IG + 0.5, a: -30 }, { ax: 58, ay: C4IG, a: 0 }] }; },
  stand(t) { const b = Math.sin(t * 2.2) * 0.3; return { x: 48, y: 59.5 + b * 0.3, lean: 3, hdx: 1.2, hdt: 1, rep: 0.2, vis: 1, arms: [{ al: 30, el: 62 }, { al: 18, el: 26 - b }], legs: [{ ax: 41, ay: C4IG, a: 0 }, { ax: 55, ay: C4IG, a: 0 }] }; },
  blade(u) { const e = c15Sm(u); return { x: 49, y: 60, lean: 9, hdx: 1.4, hdt: 3, rep: 0.9, vis: 1, bl: Math.round(26 * e), arms: [{ al: 78, el: 4 }, { al: 86, el: 2 + 2 * (1 - e) }], legs: [{ ax: 39, ay: C4IG, a: 0 }, { ax: 59, ay: C4IG, a: 0 }] }; },
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
function c4xBigDraw(cv, R, x, lift, face, sink, alpha, sx) {      // a figure (Ranos, Iron Man) standing on the roof or the road at the world x (sx = a squeeze of its width, for a turn)
  ctx.save(); ctx.translate(c4xSX(x), 0); if (face < 0 || sx !== undefined) ctx.scale((face < 0 ? -1 : 1) * (sx === undefined ? 1 : sx), 1); if (sink > 0) { ctx.beginPath(); ctx.rect(-70, 0, 140, gy + 2); ctx.clip(); } if (alpha !== undefined) ctx.globalAlpha = alpha; ctx.drawImage(cv, -R.cx, gy - R.GY - Math.round(lift) + Math.round((sink || 0) * R.H * 0.85)); ctx.restore();
}

// ================================================================ RANOS STEPS IN (c4x.ph 'ranos'): the same scene after a win or a loss
// WIN: the Black Flash has just thrown Meguna back; LOSS: Meguna's last blow has punched Yuji back. LW = 0.7 s of lead-in (the fight's own bodies move on, no control, no brain), then it is one script: a line of violet light comes down out of the sky over the roof, and RANOS (v1.158: the figure of the end of chapter 2) falls down it and lands in a crouch between Yuji and Meguna (the roof cracks, a ring of dust runs out) while Meguna comes in with a dash and starts a slash,
// he stands up, his gauntlet (the purple stone) catches Meguna's raised fist (a freeze, "NOT YET, SUKUNA." - "...YOU?!"), he throws Meguna away, turns to Yuji, walks up to him and punches him in the stomach ("YOU ARE NEEDED ELSEWHERE."); a violet circle opens under Yuji and takes him; a violet-white flash and New York. The camera does not move in this scene after it has found Ranos: nobody slides about the picture.
// All times are seconds after the lead-in: s. u = a place on the roof in pixels from where Yuji stood, positive towards Meguna (d = +-1 is the way to Meguna in the world).
const C4RS = { lw: 0.7, back: 0.4, fall0: 0.5, land: 0.9, rise: 1.15, dash0: 0.75, dash1: 1.05, grab: 1.35, l1: 1.65, l2: 3.0, throw: 4.3, thrown: 4.8, turn: 5.0, wind: 5.75, punch: 5.87, sink0: 5.99, sink1: 6.65, flash: 7.15, end: 7.55 };
const C4_TALK_R = [{ t: C4RS.lw + C4RS.l1, d: 1.4, w: 'RANOS', vk: 3, a: 'NOT YET, SUKUNA.', b: '' }, { t: C4RS.lw + C4RS.l2, d: 1.2, w: 'SUKUNA', vk: 5, a: '...YOU?!', b: '' }, { t: C4RS.lw + 5.05, d: 2.0, w: 'RANOS', vk: 3, a: 'YOU ARE NEEDED ELSEWHERE.', b: '' }];
const C4_TALK_N = [{ t: 5.7, d: 2.0, w: 'YUJI', vk: 1, a: 'WHERE... AM I?!', b: '' }, { t: 8.2, d: 2.8, w: 'IRON MAN', vk: 0, a: 'BACK DOWN, KID...', b: 'OR YOU GET STABBED.' }];
const C4_VIO = ['#ffffff', '#f1dcff', '#c98bff', '#8a4de0'];
function c4xEllRing(sx, sy, r, col) { ctx.fillStyle = col; const n = Math.max(16, r * 4), ry = r * 0.28; for (let i = 0; i < n; i++) { const th = i / n * 6.2832; ctx.fillRect(Math.round(sx + Math.cos(th) * r), Math.round(sy + Math.sin(th) * ry), 1, 1); } }      // (a ring on the floor: a circle seen from the side)
function c4xBeam(sx, k, now) {      // a column of violet light from the top of the picture to the roof (k = 0 - 1: how bright and how wide)
  if (k <= 0) return; const fl = (now / 45) & 1; ctx.save(); ctx.globalCompositeOperation = 'lighter';
  for (const [w, col, al] of [[11, '120,70,220', 0.28], [6, '190,130,255', 0.5], [2, '255,255,255', 0.95]]) { const ww = Math.max(1, Math.round(w * k) + (w > 2 ? fl : 0)); ctx.fillStyle = 'rgba(' + col + ',' + (al * Math.min(1, k * 1.6)).toFixed(3) + ')'; ctx.fillRect(sx - (ww >> 1), 0, ww, gy + 3); }
  ctx.restore();
}
const C4RIM = new WeakMap();
function c4xRim(cv) {      // his outline in violet light (from the moon): the same picture, one colour; drawn one pixel up and to the right behind him it makes a thin bright edge
  let r = C4RIM.get(cv); if (!r) { r = document.createElement('canvas'); r.width = cv.width; r.height = cv.height; const g = r.getContext('2d'); g.drawImage(cv, 0, 0); g.globalCompositeOperation = 'source-in'; g.fillStyle = '#8a78ff'; g.fillRect(0, 0, r.width, r.height); C4RIM.set(cv, r); } return r;
}
function c4xRStone(o) {      // where the stone is on his fist: [forward, up] in game pixels from the middle of his feet
  const a = c4xRig(C4R, c4xRIK(o)).arms[1], ux = Math.sin(a.a2), uy = Math.cos(a.a2); return [a.h[0] + uy * 3.4 - ux * 0.6 - C4R.cx, C4R.GY - (a.h[1] - ux * 3.4 - uy * 0.6)];
}
function c4xRanosStart(now, win) {
  const c = c4x, F = c.F; F.ph = 'over'; c.ph = 'ranos'; c.t0 = now; c.ev = {}; c.rs = { win, set: false, d: 1, y0: 0, m0: 0, u0: 0, uT: 46, uR: 16 }; c.camTo = undefined; c.stp = 0; c.fx = []; c.pool = c.pool2 = null; c.black = null; c.glow = null; c.vf = 0; c4xCine(true); c.y.sink = 0; c.y.tint = 0;
}
function c4xRanosStep(c, now, dt, T) {
  const R = C4RS, Y = c.y, M = c.m, S = c.rs, s = T - R.lw, ev = (n, t, f) => c4xEv(c, T, n, t + R.lw, f), idle = now / (1000 / IDLE_FPS), ease = c4xEase, out = c4xOut, P = c4xRanosPose, mixp = c4xMixPose;
  c.pool = null; c.pool2 = null; c.fx = []; c.glow = null; c.mFront = false;
  if (s < 0) { c4xYStep(c, now, dt); c4xMStep(c, now, dt); c4xYPose(c, now); c4xMPose(c, now); return; }
  if (!S.set) { S.set = true; S.d = Math.sign(M.x - Y.x) || 1; S.y0 = Y.x; S.m0 = M.x; S.u0 = Math.abs(M.x - Y.x); S.uT = Math.min(110, Math.max(46, S.u0 - 50)); S.uR = Math.max(16, S.uT - 38); c.camTo = Math.round(S.y0 + S.d * S.uR); }
  const d = S.d, X = u => S.y0 + d * u, uR = S.uR, uT = S.uT, uP = 15;
  // ---- Yuji: backs away, watches, is punched, goes into the circle
  let yu = -12 * ease(s / R.back), yp = { set: 'idle', fi: idle }, ylift = 0; Y.sink = 0; Y.tint = 0;
  if (s < R.back) yp = { set: 'fwd', fi: 14 - ((s * WALK_FPS) % 15) };
  if (s >= R.punch) { const k = s - R.punch; yu = -12 - 7 * out(k / 0.25); yp = { set: 'rx', k: 1, fi: Math.min(9, 3 + k * 22) }; ylift = 5 * Math.sin(Math.PI * Math.min(1, k / 0.5)); if (s >= R.sink0) { Y.sink = ease((s - R.sink0) / (R.sink1 - R.sink0)); Y.tint = 0.7 * Y.sink; ylift = 0; } }
  Y.x = X(yu); Y.face = d; Y.pose = yp; Y.lift = ylift; Y.gone = s >= R.sink1;
  // ---- Meguna: comes back with a dash and a slash, is held, is thrown, lies there
  const u0 = S.u0; let mu = u0, mp = { row: 'frames', fi: idle }, ml = 0;
  if (s >= R.dash0 && s < R.dash1) { const k = out((s - R.dash0) / (R.dash1 - R.dash0)); mu = u0 + (uT - u0) * k; mp = { row: uT < u0 ? 'df' : 'dg', fi: Math.min(14, k * 14.9) }; }
  else if (s >= R.dash1 && s < R.throw) { mu = uT; const e = s - R.dash1; mp = { row: 'sx', fi: e < R.grab - R.dash1 ? Math.min(6, e * 30) : 6 }; if (s >= R.grab) mu += 0.7 * Math.sin(now / 30); }
  else if (s >= R.throw && s < R.thrown) { const k = out((s - R.throw) / (R.thrown - R.throw)); mu = uT + 70 * k; ml = 16 * Math.sin(Math.PI * k); mp = { row: 'h9', fi: Math.min(14, (s - R.throw) * 26) }; }
  else if (s >= R.thrown) { mu = uT + 70; mp = s < R.end - 1.0 ? { row: 'h1', fi: 9 } : { row: 'frames', fi: idle }; }
  if (s < R.dash0) mp = { row: 'frames', fi: idle };
  M.x = X(mu); M.face = -d; M.pose = mp; M.lift = ml; M.sink = 0; M.white = 0; M.rot = 0;
  // ---- Ranos: down the column of light, the crouch of the landing, up, the catch, the throw, the turn, the walk, the windup, the punch
  const rx0 = X(uR), cwx = X(uT) - d * 12, cwy = 44, fxc = (cwx - rx0) * d;      // (where he lands; Meguna's raised fist, the point he catches: how far in front of him it is)
  let rface = d, rx = rx0, rl = 0, rsx = 1, rp;
  const catchP = t => c4xRanosReach(P.catch(t), fxc, cwy), throwP = P.throw(), stand = P.stand(now / 1000);
  if (s < R.fall0) rp = null;
  else if (s < R.land) { const u = (s - R.fall0) / (R.land - R.fall0); rl = 170 * (1 - u * u); rp = P.fall(); }
  else if (s < R.rise) rp = mixp(P.fall(), P.land(), out((s - R.land) / 0.05));
  else if (s < R.grab) rp = mixp(P.land(), catchP(now / 1000), ease((s - R.rise) / (R.grab - R.rise)));
  else if (s < R.throw) rp = catchP(now / 1000);
  else if (s < R.throw + 0.25) rp = mixp(catchP(now / 1000), throwP, out((s - R.throw) / 0.25));
  else if (s < R.throw + 0.35) rp = throwP;
  else if (s < R.turn) rp = mixp(throwP, stand, ease((s - R.throw - 0.35) / (R.turn - R.throw - 0.35)));
  else {
    rface = -d; const tt = (s - R.turn) / 0.15, sq = [1, 0.5, 0.25, 0.5, 1][Math.min(4, Math.floor(tt * 5))]; if (tt < 1) { rface = tt < 0.5 ? d : -d; rsx = sq; }      // (the turn: he gets thin and comes out of it the other way round)
    const w0 = R.turn + 0.15, w1 = R.wind - 0.2, wk = ease((s - w0) / (w1 - w0)), ywx = X(-12) + d * 5, dist = Math.abs(uR - uP), walkP = k => dist < 4 ? stand : mixp(stand, P.walk(dist * k / 52 + 0.25), ease(Math.min(1, (s - w0) / 0.12)));
    rx = X(uR + (uP - uR) * wk); rp = s < w0 ? stand : walkP(wk);      // (he walks to Yuji with heavy steps: the stride is the length of what he has walked)
    if (s >= w1 && s < R.wind) rp = mixp(walkP(1), P.windup(), ease((s - w1) / (R.wind - w1)));
    else if (s >= R.wind && s < R.punch) rp = P.windup();
    else if (s >= R.punch) { const kk = s - R.punch, u = out(kk / 0.06); rx = X(uP - 6 * u); const pr = c4xRanosReach(P.punch(), (rx - ywx) * d, 30); rp = kk < 0.06 ? mixp(P.windup(), pr, out(kk / 0.06)) : kk < 0.4 ? pr : mixp(pr, stand, ease((kk - 0.4) / 0.35)); }
  }
  c.rp = rp; const rcv = rp ? c4xRanos(rp) : null;      // (c.rp: the pose of this frame, for the tests)
  if (s >= R.land) c.fx.push(() => c4xCrater(rx0, Math.min(1, (s - R.land) / 0.2)));      // (the roof under him cracks)
  const bk = s < R.fall0 ? 0.12 + 0.5 * (s / R.fall0) : s < R.land ? 1 : Math.max(0, 1 - (s - R.land) / 0.25); c.fx.push(() => c4xBeam(c4xSX(rx0), bk, now));
  if (s >= R.land && s < R.land + 0.6) { const a = (s - R.land) / 0.6; c.fx.push(() => { ctx.globalAlpha = 1 - a; c4xEllRing(c4xSX(rx0), gy + 3, Math.round(6 + 64 * a), '#d6a8ff'); c4xEllRing(c4xSX(rx0), gy + 3, Math.round(3 + 52 * a), '#ffffff'); ctx.globalAlpha = 1; }); }
  if (rcv) {
    c.fx.push(() => c4xShadow(rx, rl, 14)); c.fx.push(() => { c4xBigDraw(c4xRim(rcv), C4R, rx + 1, rl + 1, rface, 0, 0.5, rsx); c4xBigDraw(rcv, C4R, rx, rl, rface, 0, undefined, rsx); });
    if (s >= R.land) { const st = c4xRStone(rp), gx = Math.round(c4xSX(rx) + rface * st[0] * rsx), gyy = Math.round(gy - rl - st[1]), r = (rp.glow > 0.7 ? 6 : 4) + ((now / 80) & 1); c.fx.push(() => c4xGlow(gx, gyy, r, ['rgba(138,77,224,0.35)', 'rgba(201,139,255,0.6)', 'rgba(241,220,255,0.95)'])); }      // (the stone's light)
  }
  // ---- the circle that takes Yuji
  const p2 = s < R.punch + 0.04 ? 0 : s < R.sink0 ? ease((s - R.punch - 0.04) / (R.sink0 - R.punch - 0.04)) : s < R.sink1 ? 1 : Math.max(0, 1 - (s - R.sink1) / 0.35);
  if (p2 > 0) c.pool = [{ x: X(yu), rx: 17 * p2, a: 1, violet: true }];
  if (Y.sink > 0 && Y.sink < 1) c.fx.push(() => { for (let i = 0; i < 5; i++) { ctx.fillStyle = i % 2 ? '#f1dcff' : '#c98bff'; ctx.fillRect(c4xSX(Y.x) + Math.round((Math.random() - 0.5) * 18), gy - Math.round(Math.random() * 40), 1, 3); } });
  // ---- sounds and effects
  ev('sky', 0, () => { snd('charge'); snd('rumble', 1.6); c.vf = now + 260; c.vfm = 260; c.vfa = 0.25; c.vfc = '150,100,255'; }); ev('fall', R.fall0 - 0.05, () => snd('vanish'));
  ev('land', R.land, () => { snd('concboom'); snd('land', 2.4); puff(rx0, 16); puff(rx0 - 16, 8); puff(rx0 + 16, 8); shakeUntil = now + 450; shakeAmp = 6; buzz(120); hitStop(80); c.vf = now + 420; c.vfm = 420; c.vfa = 0.85; c.vfc = '236,222,255'; spark(rx0, gy - 2, 18, C4_VIO, true, 1); spark(rx0, gy - 2, 12, C4_VIO, true, -1); });
  ev('dash', R.dash0, () => snd('dash', 0)); ev('slash', R.dash1 + 0.1, () => snd('swing', 3));
  ev('grab', R.grab, () => { hitStop(90); snd('block'); snd('stun'); buzz(60); shakeUntil = now + 200; shakeAmp = 3; c.vf = now + 260; c.vfm = 260; c.vfa = 0.5; c.vfc = '190,130,255'; spark(cwx, gy - cwy, 18, C4_VIO, true, -d); spark(cwx, gy - cwy, 10, C4_VIO, false, d); });
  ev('throw', R.throw, () => { snd('swing', 3); snd('smack', 2); shakeUntil = now + 120; shakeAmp = 2; spark(cwx, gy - cwy, 12, C4_VIO, true, d); }); ev('land2', R.thrown - 0.05, () => { snd('land', 1.8); puff(M.x, 8); shakeUntil = now + 160; shakeAmp = 3; });
  ev('wind', R.wind - 0.2, () => snd('charge'));
  if (s >= R.turn + 0.15 && s < R.wind - 0.2 && Math.abs(uR - uP) >= 4) { const n = Math.floor((s - R.turn - 0.15) / 0.26); if (n > c.stp) { c.stp = n; snd('land', 1); puff(rx, 3); shakeUntil = now + 90; shakeAmp = 1.5; } }      // (a thud and a little dust at every step)
  ev('punch', R.punch, () => { hitStop(130); snd('hit', 3); snd('smack', 3); snd('concboom'); buzz(120); shakeUntil = now + 380; shakeAmp = 6; c.vf = now + 320; c.vfm = 320; c.vfa = 0.5; c.vfc = '190,130,255'; spark(Y.x + d * 2, gy - 28, 22, C4_VIO, true, -d); c.ring = now; });
  ev('sink', R.sink0, () => { snd('vanish'); snd('portalclose'); });
  ev('flash', R.flash, () => { c.vf = now + 500; c.vfm = 500; c.vfa = 1; c.vfc = '236,222,255'; });
  if (c.ring) { const a = (now - c.ring) / 500; if (a < 1) c.fx.push(() => { ctx.globalAlpha = 1 - a; c4xRing(c4xSX(Y.x + d * 4), gy - 28, Math.round(4 + a * 34), '#d6a8ff'); c4xRing(c4xSX(Y.x + d * 4), gy - 28, Math.round(3 + a * 30), '#ffffff'); ctx.globalAlpha = 1; }); }
  if (s >= R.flash) { const a = ease((s - R.flash) / 0.3); c.black = () => 0; c.whiteA = a; } else c.whiteA = 0;
  if (T >= R.lw + R.end) c4xNyStart(now);
}

// ================================================================ NEW YORK (c4x.ph 'ny', N = seconds): Yuji falls out of the sky onto the freeway, the cars stop and honk, Iron Man comes down and lands in a little crater, Yuji asks where he is, a blade slides out of the armour: "BACK DOWN, KID... OR YOU GET STABBED."; at 11.2 s a hard cut to black, then the card END OF CHAPTER 4 (12.0 - 14.5 s), the card TO BE CONTINUED (14.8 - 17.3 s) and the chapter menu.
const C4NS = { fall: 0.6, lie: 1.3, up: 1.75, look: [2.3, 3.0, 3.7], wh: 3.1, dive: 4.0, land: 4.8, rise: 5.35, rise1: 5.9, adv0: 6.4, adv1: 8.0, blade: 8.0, eye: 9.0, cut: 11.2, card: 12.0, card1: 14.5, card2: 14.8, end: 17.3 };
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
  else if (T >= N.rise1 && T < N.blade) { ip = c4xIronPose.stand(T); ix = IMx - 12 * ease((T - N.adv0) / (N.adv1 - N.adv0)); if (T >= N.blade - 0.2) ip = c4xMixPose(ip, c4xIronPose.blade(0), ease((T - N.blade + 0.2) / 0.2)); }      // (the arm is raised before the blade comes out)
  else if (T >= N.blade) { ip = c4xIronPose.blade((T - N.blade) / 0.3); ix = IMx - 12; }
  ny.im = ip && { cv: c4xIron(ip), pose: ip, x: ix, lift: il, ia, fall: T >= N.dive && T < N.land };
  // ---- sounds and effects
  ev('land1', N.fall, () => { snd('land', 2); puff(0, 10); shakeUntil = now + 220; shakeAmp = 4; buzz(60); spark(0, gy - 4, 10, ['#d8d8d0', '#9a9ca6'], false, 1); });
  ev('thrust', N.dive - 0.9, () => snd('thrust', 1.6)); ev('land2', N.land, () => { snd('concboom'); snd('land', 2.2); puff(IMx, 14); puff(IMx - 12, 8); puff(IMx + 12, 8); shakeUntil = now + 420; shakeAmp = 6; buzz(120); hitStop(70); spark(IMx, gy, 20, ['#ffd27a', '#ff8a1e', '#ffffff', '#9a9ca6'], true, 1); spark(IMx, gy, 14, ['#ffd27a', '#ff8a1e', '#9a9ca6'], true, -1); });
  ev('blade', N.blade, () => snd('shing')); ev('cut', N.cut, () => snd('windOff')); ev('card', N.card, () => snd('c7drone'));
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
    if (T >= N.blade && T < N.cut) {      // the red light of the blade (from the real place of the blade: the fist and the point), and a glint at the point
      const bd = c4xIronBlade(im.pose); if (bd) {
        const bx = c4xSX(im.x), x0 = bx - bd[0][0], y0 = gy - Math.round(im.lift) - bd[0][1], x1 = bx - bd[1][0], y1 = gy - Math.round(im.lift) - bd[1][1], gx = Math.round(x1), gy1 = Math.round(y1), k = ((now / 90) | 0) % 2;
        ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.lineCap = 'round'; for (const [w, al] of [[8, 0.12], [4, 0.22]]) { ctx.strokeStyle = 'rgba(255,40,56,' + al + ')'; ctx.lineWidth = w; ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke(); } ctx.restore();
        if (T < N.blade + 0.2) c4xGlow(Math.round(x0), Math.round(y0), Math.round(7 * (1 - (T - N.blade) / 0.2)) + 1, ['rgba(255,40,56,0.3)', 'rgba(255,150,160,0.6)', 'rgba(255,240,242,0.95)']);      // (a burst at the fist when the blade shoots out)
        c4xGlow(gx, gy1, 3 + (k ? 1 : 0), ['rgba(255,40,56,0.3)', 'rgba(255,110,120,0.55)', 'rgba(255,220,224,0.95)']); ctx.fillStyle = k ? '#ffffff' : '#ffc4c8'; ctx.fillRect(gx - 1, gy1 - 5, 1, 4); ctx.fillRect(gx - 4, gy1 - 3, 7, 1);
      }
    }
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
  if (u > 0.5) { const k = Math.min(1, (u - 0.5) / 0.35); const n = ir * 1.6 * k; ctx.fillStyle = '#ff2a3a'; for (let i = 0; i < n; i++) ctx.fillRect(cx + q * 2 + i + tr, cy + q * 2 - Math.round(i * 0.6) - 1, 2, 3); ctx.fillStyle = '#ffd0d4'; for (let i = 0; i < n; i++) ctx.fillRect(cx + q * 2 + i + tr, cy + q * 2 - Math.round(i * 0.6), 2, 1); }      // (the glint of the blade: red with a pink core)
  ctx.fillStyle = '#9fd8ff'; const sd = ((u * 10) | 0) % 3; for (const [dx, dy] of [[0.36, 0.2], [0.42, 0.36]]) { ctx.fillRect(Math.round(W * (0.5 + dx)), Math.round(H * dy) + sd * q, q * 2, q * 4); ctx.fillStyle = '#ffffff'; ctx.fillRect(Math.round(W * (0.5 + dx)) + q, Math.round(H * dy) + sd * q + q, 1, q * 2); ctx.fillStyle = '#9fd8ff'; }
  ctx.restore();
}
function c4xTbc(T) {      // black, then the words: END OF CHAPTER 4 (with the name of the chapter), then TO BE CONTINUED
  ctx.fillStyle = '#000'; ctx.fillRect(0, 0, VW, VH); const N = C4NS, cx = Math.round(VW / 2), y = Math.round(VH * 0.44), wide = VW >= 272, fade = (t0, t1, t2, t3) => T < t0 ? 0 : T < t1 ? c4xEase((T - t0) / (t1 - t0)) : T < t2 ? 1 : T < t3 ? 1 - c4xEase((T - t2) / (t3 - t2)) : 0, a = fade(N.card, N.card + 0.8, N.card1 - 0.6, N.card1), b = fade(N.card2, N.card2 + 0.8, N.end - 0.7, N.end);
  if (a > 0) { ctx.globalAlpha = a; if (wide) pxt('END OF CHAPTER 4', cx, y, '#ffffff', 16, 'center'); else { pxt('END OF', cx, y - 10, '#ffffff', 16, 'center'); pxt('CHAPTER 4', cx, y + 10, '#ffffff', 16, 'center'); } ctx.fillStyle = '#ff2a3a'; ctx.fillRect(cx - 40, y + (wide ? 8 : 20), 80, 1); pxt('THE VESSEL', cx, y + (wide ? 24 : 36), '#ff5a6a', 8, 'center'); ctx.globalAlpha = 1; }      // (the first card; two lines on a narrow screen, so that the letters keep their size)
  if (b > 0) { ctx.globalAlpha = b; pxt('TO BE CONTINUED', cx, Math.round(VH * 0.5), '#ffffff', 16, 'center'); ctx.globalAlpha = 1; }      // (the second card)
}
