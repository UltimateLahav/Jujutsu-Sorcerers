// ================================================================ v1.178 CHAPTER 5, PART 2: STARK TOWER (tools/chap5b.js, after chap5.js)
// After the last punch of the road (the black at K5T.cut) Yuji wakes up in a glass cell in Stark Tower. Iron Man stands outside and watches ("Where am I?" - "This is Stark Tower."); Yuji punches the glass and nothing happens; TONY STARK walks in without his suit (the Iron Man Yuji has been talking to is only the suit), asks how he came here,
// STEVE ROGERS walks in ("Who is this?" - "Someone from a different universe"), Tony opens the chamber, gets into the suit ("Follow me"), and in a HUGE room asks if Yuji is afraid of large places, and charges. A second tap: a good one = Yuji ducks under the punch (slow motion: Tony's fist, arm and one leg dead straight, the other knee bent, his back straight, looking down at Yuji); a miss = the punch throws Yuji into the wall.
// It runs inside the chapter-5 scene (c4x.ph 'k5', see tools/chap5.js): the picture is still a function of the scene time T; the slow motion is a function too (A = k5Warp(T) is the time of the movement, T the time of the clock). All times are seconds of the scene: a song can be fitted by moving them.

// ---- the two men without armour (the shaded capsules and the rig of Iron Man, c4xRig): TONY STARK (a black T-shirt with the glow of the arc reactor, dark hair, a goatee) and STEVE ROGERS (blond, a brown jacket, jeans), 55 and 59 pixels tall (Yuji is 54, the suit 64)
const K5R = {
  tony: { W: 88, H: 80, GY: 76, cx: 40, L1: 12.0, L2: 12.0, LT: 17.4, UA: 9.4, FA: 9.0, AH: 3.0 },
  steve: { W: 88, H: 80, GY: 76, cx: 40, L1: 13.0, L2: 12.8, LT: 19.0, UA: 10.2, FA: 9.8, AH: 3.2 }
};
const K5LK = {
  tony: { skin: '#e9b78f', hair: '#2b1a12', top: '#23262e', pants: '#343a48', shoe: '#1d181e', sole: '#0c0a0e' },
  steve: { skin: '#f1c9a1', hair: '#d6b05a', hairL: '#f7e3a0', top: '#74503a', under: '#dfe1e6', pants: '#3a4a68', shoe: '#4a3626', sole: '#1c130c' }
};
function k5DrawMan(o) {
  const w = o.who, R = K5R[w], L = K5LK[w], p = new C4Pix(R.W, R.H), J = c4xRig(R, o), { P, at, Nk, Sh, hd, arms, legs } = J, K = c4K, M = c4M, tony = w === 'tony', b = tony ? 1 : 1.12;
  const skin = M(L.skin), drawArm = k => { const a = arms[k], far = k ? 0 : 0.1, sk = M(L.skin, far), tp = M(L.top, far);
    if (tony) { p.put(c4uni(c4cap(Sh[0], Sh[1], a.E[0], a.E[1], 2.7, 2.3), c4cap(a.E[0], a.E[1], a.W[0], a.W[1], 2.3, 1.8)), sk); const s = [Sh[0] + (a.E[0] - Sh[0]) * 0.62, Sh[1] + (a.E[1] - Sh[1]) * 0.62]; p.put(c4uni(c4ell(Sh[0], Sh[1], 3.7, 3.7), c4cap(Sh[0], Sh[1], s[0], s[1], 3.5, 3.1)), tp); }      // (a short sleeve)
    else p.put(c4uni(c4ell(Sh[0], Sh[1], 4.4, 4.4), c4cap(Sh[0], Sh[1], a.E[0], a.E[1], 3.9, 3.3), c4cap(a.E[0], a.E[1], a.W[0], a.W[1], 3.2, 2.7)), tp);      // (the jacket's sleeve to the wrist)
    p.put(c4ell(a.h[0], a.h[1], tony ? 2.0 : 2.3, tony ? 2.2 : 2.5), sk); };
  const drawLeg = k => { const l = legs[k], far = k ? 0 : 0.1, Hp = [P[0] + 0.3, P[1]]; p.put(c4uni(c4cap(Hp[0], Hp[1], l.K[0], l.K[1], 4.2 * b, 3.4 * b), c4cap(l.K[0], l.K[1], l.ax, l.ay, 3.4 * b, 2.6 * b)), M(L.pants, far)); c4xFoot(p, l, M(L.shoe, far), K(L.sole)); };
  drawArm(0); drawLeg(0);
  const w1 = at(0.3, 0), w2 = at(0.72, 0), top = M(L.top);
  p.put(c4uni(c4cap(P[0], P[1], w1[0], w1[1], 4.9 * b, 5.4 * b), c4cap(w1[0], w1[1], w2[0], w2[1], 5.4 * b, 6.6 * b), c4cap(w2[0], w2[1], Nk[0], Nk[1], 6.6 * b, 4.6 * b)), top);      // (the T-shirt / the jacket)
  if (tony) { const ar = at(0.6, 5.9); for (const [dx, dy, c] of [[0, 0, '#ffffff'], [1, 0, '#8ff0ff'], [-1, 0, '#8ff0ff'], [0, 1, '#8ff0ff'], [0, -1, '#8ff0ff']]) p.px(ar[0] + dx, ar[1] + dy, K(c)); p.px(ar[0] + 2, ar[1], K('#3a8aa8')); p.px(ar[0] - 2, ar[1], K('#3a8aa8')); }      // (the arc reactor shining through the shirt)
  else { p.line(at(0.08, 5.6), at(0.78, 6.4), K('#3a281a')); p.put(c4cap(at(0.92, 2.6)[0], at(0.92, 2.6)[1], at(0.78, 4.6)[0], at(0.78, 4.6)[1], 1.6, 1.3), M(L.under), 1); }      // (the zip; the shirt at the collar)
  p.put(c4cap(hd[0] - 1.1, hd[1] + 3.2, Nk[0] + 0.3, Nk[1] - 0.5, 2.1 * b, 2.5 * b), skin);      // (the neck)
  const [hx, hy] = hd; p.put(c4uni(c4ell(hx - 0.3, hy - 0.4, 4.6, 4.8), c4ell(hx + 1.1, hy + 1.3, 3.4, 3.5), c4cap(hx + 3.3, hy + 0.3, hx + 4.6, hy + 1.4, 0.75, 0.55)), skin);      // (the head, the nose)
  if (!tony) p.put(c4ell(hx + 2.2, hy + 3.7, 2.6, 1.8), skin);      // (the square jaw)
  const hr = M(L.hair), hl = K(tony ? '#5a3a2a' : L.hairL);
  p.put(c4uni(c4ell(hx - 1.4, hy - 2.9, 4.8, 3.3), c4ell(hx - 3.3, hy + 0.5, 1.9, 2.9)), hr, 2);      // (the hair: a mass over the top and the back of the head; the forehead and the eyes stay free)
  if (tony) { p.put(c4cap(hx + 0.3, hy - 4.5, hx + 3.3, hy - 3.3, 1.2, 0.3), hr, 2); p.px(hx + 0.8, hy - 4.8, hl); p.px(hx - 1.8, hy - 5.3, hl); } else { p.put(c4cap(hx + 0.5, hy - 4.7, hx + 3.9, hy - 2.9, 1.4, 0.3), hr, 2); p.px(hx + 1.2, hy - 5.0, hl); p.px(hx - 1.2, hy - 5.4, hl); p.px(hx + 2.6, hy - 3.7, hl); p.px(hx - 3.4, hy - 1.0, hl); }
  const X = Math.round(hx + 2.6), Y = Math.round(hy - 0.2), dk = K('#14101c'), mx = Math.round(hx + 3.2), my = Math.round(hy + 2.9);
  p.rect(X, Y, 2, 1, K('#f4f0ea')); p.px(X + 1, Y, dk); p.rect(X - 1, Y - 1, 3, 1, tony ? dk : K('#7a5a3a')); p.rect(mx - 1, my, 2, 1, K('#8a5a58')); p.rect(Math.round(hx - 2.3), Math.round(hy - 0.2), 2, 3, skin[1]);      // (an eye with its brow, the mouth, the ear)
  if (tony) { const g = K(L.hair); p.rect(Math.round(hx + 2.7), Math.round(hy + 3.7), 2, 2, g); p.rect(mx, my - 1, 2, 1, g); p.px(hx + 1.7, hy + 3.7, g); }      // (the goatee and the moustache)
  drawLeg(1); p.put(c4cap(P[0] - 0.3, P[1] - 1.5, P[0] + 0.4, P[1] + 4.6, 4.7 * b, 4.9 * b), top, 1); drawArm(1); return p;
}
const k5Man = o => c4xCv('m' + o.who, o, k5DrawMan);
const k5MP = (who, o) => Object.assign({ who, x: K5R[who].cx, lean: 3, hdx: 1.1, hdy: 0, hdt: 0, arms: [{ al: 6, el: 18 }, { al: 10, el: 22 }] }, o);
function k5Walk(who, ph) {      // a walking pose; ph = how far through the stride (0 - 1): one cycle is two steps (the feet do not skate at about 44 pixels a second and 1.5 cycles a second)
  ph = ((ph % 1) + 1) % 1; const R = K5R[who], G = R.GY - R.AH, Lm = (R.L1 + R.L2) * 0.965, legs = [0, 1].map(k => { const f = c15MegStride((ph + 0.5 * k) % 1, 7.5, 0.55, 5.5); return { ax: R.cx + f.x, ay: G - f.y, a: f.a }; });
  let py = 0; for (const l of legs) py = Math.max(py, l.ay - Math.sqrt(Math.max(0, Lm * Lm - (l.ax - R.cx) * (l.ax - R.cx)))); const w = Math.cos(2 * Math.PI * ph);
  return k5MP(who, { y: py, lean: 4, hdx: 1.3, arms: [{ al: 14 * w, el: 14 }, { al: -14 * w, el: 18 }], legs });
}
const k5IWalk = ph => {      // Iron Man walking (the same stride, the suit's size)
  ph = ((ph % 1) + 1) % 1; const R = C4I, Lm = (R.L1 + R.L2) * 0.965, legs = [0, 1].map(k => { const f = c15MegStride((ph + 0.5 * k) % 1, 8, 0.55, 6); return { ax: R.cx + f.x, ay: C4IG - f.y, a: f.a }; });
  let py = 0; for (const l of legs) py = Math.max(py, l.ay - Math.sqrt(Math.max(0, Lm * Lm - (l.ax - R.cx) * (l.ax - R.cx)))); const w = Math.cos(2 * Math.PI * ph);
  return k5IP({ y: py, lean: 4, hdx: 1.3, arms: [{ al: 14 * w, el: 22 }, { al: -14 * w, el: 24 }], legs });
};
const k5TP = {      // the poses of the two men (t = seconds, for a little life)
  stand: (who, t) => { const b = Math.sin(t * 2.2) * 0.25; return k5MP(who, { y: K5R[who].GY - K5R[who].AH - (K5R[who].L1 + K5R[who].L2) * 0.97 + b * 0.4, arms: [{ al: 4, el: 14 + b }, { al: 8, el: 18 - b }] }); },
  wave: (who, t) => k5MP(who, { hdt: -3, arms: [{ al: 6, el: 16 }, { al: 132, el: -6 + 22 * Math.sin(t * 15) }] }),      // (a hand up: HEY)
  talk: (who, t) => k5MP(who, { hdt: 2, arms: [{ al: 8, el: 18 }, { al: 62, el: 38 + 8 * Math.sin(t * 4) }] }),
  shrug: (who, t) => k5MP(who, { lean: 1, hdt: 7, hdx: 0.9, arms: [{ al: 52, el: 52 + 3 * Math.sin(t * 3) }, { al: 60, el: 48 }] }),
  pad: who => k5MP(who, { lean: 6, hdx: 1.5, arms: [{ al: 8, el: 16 }, { al: 84, el: 4 }] }),      // (an arm out to a panel)
  fold: (who, t) => { const b = Math.sin(t * 2.1) * 0.2; return k5MP(who, { lean: 2, y: K5R[who].GY - K5R[who].AH - (K5R[who].L1 + K5R[who].L2) * 0.97 + b * 0.4, arms: [{ al: 6, el: 84 }, { al: 12, el: 80 }] }); }      // (arms folded: the forearms across the belly)
};
// ---- Iron Man's two more poses: powered down (the eye slit dark, the head lowered), and THE SLOW-MOTION PUNCH. The pose is made standing and then turned on its side round the hip (`rot`, see k5DrawIM): arm 180 (straight), one leg 180 (straight), the other knee bent to 45, the back straight (no lean); turned 100 degrees the head is below the line of the hips: he looks down at Yuji.
K5P.off = k5IP({ x: 48, y: 59.5, lean: 6, hdx: 1.3, hdt: 12, vis: 0, off: 1, arms: [{ al: 6, el: 20 }, { al: 8, el: 22 }] });
const k5KneeAnkle = (hx, hy, L1, L2, deg, dir) => { const d = 2 * ((L1 + L2) / 2) * Math.sin(deg * C4RAD / 2); return [hx + d * Math.cos(dir * C4RAD), hy + d * Math.sin(dir * C4RAD)]; };      // (where the ankle must be so that the knee has the angle `deg`, with the ankle in the direction `dir` from the hip (degrees from forward, down positive))
K5P.sm = (() => { const hx = 48, hy = 44, a = k5KneeAnkle(hx, hy, C4I.L1, C4I.L2, 45, 62); return k5IP({ x: hx, y: hy, lean: 0, hdx: 4.8, hdy: -1.6, hdt: 0, fl: 0.7, vis: 1, arms: [{ al: -24, el: 10 }, { al: 192, el: 0 }], legs: [{ ax: hx, ay: hy + (C4I.L1 + C4I.L2) * 0.999, a: -78 }, { ax: a[0], ay: a[1], a: -56 }] }); })();      // (the far leg straight down, the near one bent: both turn with the body; the flames of the boots trail behind)
K5P.wu = k5IP({ x: 48, y: 64, lean: 20, hdx: 1.6, hdy: 0.6, hdt: 6, rep: 0.8, fl: 0.3, vis: 1, arms: [{ al: 38, el: 40 }, { al: -46, el: 74 }], legs: [{ ax: 34, ay: C4IG, a: 0 }, { ax: 62, ay: C4IG, a: 0 }] });      // (the wind-up of the charge: crouched, the fist drawn back, the boots lit)

// ================================================================ THE TIMES (seconds of the scene; the road ends in the black at K5T.cut = 36.9)
const K5B = {
  eye: [38.4, 39.1, 39.5, 40.8], sit: 41.3, up: 42.9,      // (the eyelids: they begin to open, the widest of the first glimpse, shut again, wide open; Yuji sits up (the picture rx 4, frames 9 - 14), is on his feet)
  look: [43.5, 44.2], punch: 48.3, glass: 48.52,      // (he looks round the cell; the punch starts, his fist meets the glass: 6.6 of the 15 pictures at 30 a second)
  tin: 50.2, tin1: 52.6, off: 52.7, sin: 57.9, sin1: 59.5,      // (Tony walks in and stops; the suit powers down; Steve walks in and stops)
  pad: 64.5, open: 65.0, open1: 65.9, out: 66.4, out1: 67.4,      // (Tony's arm goes out to the panel; the chamber opens; Yuji walks out)
  tgo: 67.0, tsuit: 68.1, suit: 68.3, suit1: 69.3, iwalk: 70.0, ywalk: 70.6,      // (Tony walks to the suit, is in it (the scanner runs up him), the suit walks off, Yuji follows)
  room: 71.8, wk: 2.05, zin: [72.9, 74.5], turn: 73.85,      // (the cut to the huge room: they walk in for 2.05 s, the camera comes in, Tony turns round)
  q2: 81.0,      // (the ring of the second tap closes: Tony's flight begins 0.16 s before, the fist arrives 0.4 s after)
  gap: 0.8, hitEnd: 85.9, missEnd: 84.6      // (after a punch that hits: the fall to the wall takes 0.8 s; the black comes at hitEnd / missEnd, then the cards)
};
const K5W = { a: 0.22, h: 1.9, b: 0.5, r: 0.08 };      // (the slow motion of a dodge: the clock of the movement slows for a, crawls at r for h seconds and speeds up again in b)
K5W.t1 = K5B.q2 + 0.26; K5W.t4 = K5W.t1 + K5W.a + K5W.h + K5W.b;
function k5Bump(T) {      // the integral of the slow motion's weight (0 - 1 smoothed at both ends)
  const W = K5W, u = T - W.t1; if (u <= 0) return 0; if (u < W.a) { const k = u / W.a; return W.a * (k * k * k - k * k * k * k / 2); }
  if (u < W.a + W.h) return W.a / 2 + (u - W.a); const v = Math.min(1, (u - W.a - W.h) / W.b); return W.a / 2 + W.h + W.b * (v - (v * v * v - v * v * v * v / 2));
}
const k5Warp = T => T - (1 - K5W.r) * k5Bump(T);      // (the time of the movement at the time T of the clock)
K5_TALK.push(
  k5L(43.2, 'YUJI', 1, 'WHERE AM I?'), k5L(45.3, 'IRON MAN', 0, 'THIS IS STARK TOWER.'),
  k5L(52.9, 'TONY STARK', 0, 'HEY.'), k5L(54.5, 'TONY STARK', 0, 'SO HOW DID YOU COME HERE?'), k5L(57.2, 'YUJI', 1, 'WELL... I WAS...'),
  k5L(59.7, 'STEVE ROGERS', 4, 'WHO IS THIS?'), k5L(61.7, 'TONY STARK', 0, 'SOMEONE FROM A DIFFERENT', 'UNIVERSE.'),
  k5L(69.8, 'TONY STARK', 0, 'FOLLOW ME.'),
  k5L(74.7, 'TONY STARK', 0, 'DO YOU HAVE A PHOBIA', 'OF LARGE PLACES?'), k5L(78.0, 'YUJI', 1, 'NO.')
);
const k5Cards = c => { const m = c.q2 && c.q2.res === 'miss', b = m ? (k5Gore() === 2 ? K5B.q2 + 0.7 : K5B.missEnd) : K5B.hitEnd; return { black: b, card: b + 0.8, card1: b + 3.3, card2: b + 3.6, end: b + 6.1 }; };      // (when the black comes after the last beat, and the two cards, and the end: they depend on the way the tap went)

// ================================================================ THE SECOND TAP (the dodge in the huge room): the same ring, window and feel as the first one (k5Tap in tools/chap5.js)
function k5Resolve2(c, res, why, T) {
  if (c.q2.res) return; const f = window.__k5Q2; c.q2.res = f === 'hit' || f === 'miss' ? f : res; c.q2.why = why; c.q2.at = T === undefined ? c.T : T;
  if (c.q2.res === 'miss') snd('c7thud', 1); else snd('dash', 1);
}
function k5Tap2(ev) {
  const c = c4x; if (!c || c.ph !== 'k5' || paused || c.q2.res || c13Off()) return false; if (ev && c13InSkip(ev)) return false;
  const T = (pnow() - c.t0) / 1000, u = T - K5B.q2, W = C13.win; if (T < K5B.room) return false;
  if (u >= W[0] && u <= W[1]) { k5Resolve2(c, 'hit', Math.abs(u) <= C13.perfect ? 'PERFECT' : 'GOOD', T); return true; }
  if (u >= -C13.early && u < W[0]) { k5Resolve2(c, 'miss', 'TOO EARLY', T); return true; }
  return false;
}

// ================================================================ THE LAB (T 36.9 - 71.8): Stark Tower, the glass cell on the left (the right pane is its door), Iron Man's suit in front of it, a window on the city, a desk with screens on the right
const K5L = { cl: -140, cr: -32, ch: 78, wl: 4, wr: 112, gx: -34 };
const k5F = (col, x, y, w, h) => { ctx.fillStyle = col; ctx.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h)); };
function k5LabBack(now, T, S) {
  const W = VW, X = c4xSX, t = now / 1000, top = gy - K5L.ch, cl = X(K5L.cl), cr = X(K5L.cr);
  k5F('#202938', 0, 0, W, gy); k5F('#171e2a', 0, 0, W, 11);      // (the wall and the ceiling's band)
  for (let x = (X(0) % 38) - 38; x < W; x += 38) { k5F('#161d29', x, 11, 1, gy - 11); k5F('#2a3547', x + 1, 11, 1, gy - 11); }
  for (let x = ((X(0) + 14) % 76) - 76; x < W; x += 76) { k5F('#eaf3ff', x + 10, 3, 38, 2); k5F('rgba(190,225,255,0.10)', x + 4, 5, 50, 8); k5F('rgba(190,225,255,0.05)', x - 2, 5, 62, 20); }      // (the ceiling lights)
  k5F('#141a25', 0, gy - 7, W, 7); k5F('#3cc6ee', 0, gy - 6, W, 1); k5F('rgba(60,198,238,0.14)', 0, gy - 13, W, 7);      // (the skirting with a cyan strip)
  k5F('#2c3444', 0, gy, W, VH - gy); k5F('#3a4458', 0, gy, W, 1); for (const dy of [8, 19, 33]) k5F('#252c3a', 0, gy + dy, W, 1); for (let x = (X(0) % 34) - 34; x < W; x += 34) k5F('#252c3a', x, gy + 1, 1, VH);      // (the floor: tiles)
  k5F('rgba(120,200,255,0.06)', cl, gy + 1, cr - cl, 5);      // (the cell's light on the floor)
  // the window on the city: the sky, the skylines (the two strips of the freeway scene, seen from high up), haze, a warm light, mullions
  const wx0 = X(K5L.wl), wx1 = X(K5L.wr), wy0 = 24, wy1 = gy - 34, ww = wx1 - wx0, wh = wy1 - wy0; c4xNyLayers(); ctx.save(); ctx.beginPath(); ctx.rect(wx0, wy0, ww, wh); ctx.clip();
  const g = ctx.createLinearGradient(0, wy0, 0, wy1); g.addColorStop(0, '#3b82cc'); g.addColorStop(0.55, '#9fd0f0'); g.addColorStop(1, '#ffd6a0'); ctx.fillStyle = g; ctx.fillRect(wx0, wy0, ww, wh);
  const dy = wy0 + Math.round(wh * 0.3) - Math.round(VH * 0.3); for (const [lay, off] of [[C4NY.far, 150], [C4NY.mid, 380]]) for (let x = -(off % 760); x < VW; x += 760) ctx.drawImage(lay, x, dy);
  k5F('rgba(255,220,170,0.16)', wx0, wy1 - 22, ww, 22); k5F('rgba(255,235,200,0.10)', wx0, wy0, ww, wh); ctx.restore();
  k5F('#0b1017', wx0 - 3, wy0 - 3, ww + 6, 3); k5F('#0b1017', wx0 - 3, wy1, ww + 6, 4); k5F('#0b1017', wx0 - 3, wy0, 3, wh); k5F('#0b1017', wx1, wy0, 3, wh); k5F('#0b1017', wx0 + (ww / 3 | 0), wy0, 2, wh); k5F('#0b1017', wx0 + (ww * 2 / 3 | 0), wy0, 2, wh); k5F('#2a3649', wx0 - 3, wy1 + 4, ww + 6, 1);
  ctx.save(); ctx.beginPath(); ctx.rect(wx0, wy0, ww, wh); ctx.clip(); ctx.fillStyle = 'rgba(255,255,255,0.07)'; for (const o of [0.12, 0.52]) { const x = wx0 + ww * o; ctx.beginPath(); ctx.moveTo(x, wy0); ctx.lineTo(x + 14, wy0); ctx.lineTo(x - 10, wy1); ctx.lineTo(x - 24, wy1); ctx.fill(); } ctx.restore();      // (reflections on the glass)
  // the desk with screens and a hologram
  const dx = X(122); k5F('#1b2230', dx, gy - 20, 110, 20); k5F('#46546c', dx, gy - 21, 110, 1); k5F('#10151e', dx, gy - 4, 110, 4);
  for (let i = 0; i < 2; i++) { const sx = dx + 8 + i * 34; k5F('#0b1017', sx, gy - 41, 26, 18); k5F('#0f2c3c', sx + 2, gy - 39, 22, 14); ctx.fillStyle = i ? '#7cf0b0' : '#7fe0ff'; for (let k = 0; k < 22; k += 2) ctx.fillRect(sx + 2 + k, gy - 30 - Math.round(Math.sin(t * 2 + k * 0.5 + i * 2) * 3 + 2), 2, 1); k5F('#1c3a4a', sx + 11, gy - 23, 4, 2); }
  const hx = dx + 86, hy = gy - 50, rot = t * 1.4; ctx.save(); ctx.strokeStyle = 'rgba(110,230,255,0.75)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.ellipse(hx, hy + 12, 12, 3.5, 0, 0, 6.2832); ctx.stroke(); ctx.beginPath(); for (let k = 0; k < 3; k++) { const a = rot + k * 2.0944, px = hx + Math.cos(a) * 9, py = hy - 4 + Math.sin(a) * 2.6 - Math.abs(Math.sin(a * 0.5)) * 6; if (k) ctx.lineTo(px, py); else ctx.moveTo(px, py); } ctx.closePath(); ctx.stroke(); ctx.fillStyle = 'rgba(110,230,255,0.10)'; ctx.fillRect(hx - 12, hy - 14, 24, 28); ctx.restore();
  // the cell, from behind the glass: a lighter back wall, a vent, a camera with a red light
  k5F('#27323f', cl, top, cr - cl, K5L.ch); k5F('#1d2631', cl, top, cr - cl, 4); for (let i = 0; i < 6; i++) k5F('#1d2631', cl + 8 + i * 4, top + 6, 2, 1); k5F('#0d1219', cl + 3, top + 4, 7, 6); k5F(((t * 1.6) | 0) % 2 ? '#ff3a3a' : '#5a1a1a', cl + 5, top + 6, 2, 2);
  k5F('#1b232d', cl, gy - 3, cr - cl, 3); k5F('#313c4b', cl, gy - 3, cr - cl, 1);
}
function k5LabFront(now, T, S) {      // over Yuji: the glass (a tint, shines), the frame, the door that slides up, the flash where his fist hit
  const X = c4xSX, top = gy - K5L.ch, cl = X(K5L.cl), cr = X(K5L.cr), t = now / 1000;
  k5F('rgba(150,210,255,0.07)', cl, top, cr - cl, K5L.ch); ctx.save(); ctx.beginPath(); ctx.rect(cl, top, cr - cl, K5L.ch); ctx.clip(); ctx.fillStyle = 'rgba(255,255,255,0.075)'; for (const o of [0.18, 0.5, 0.78]) { const x = cl + (cr - cl) * o; ctx.beginPath(); ctx.moveTo(x, top); ctx.lineTo(x + 16, top); ctx.lineTo(x - 10, gy); ctx.lineTo(x - 26, gy); ctx.fill(); } ctx.restore();
  k5F('#0b1017', cl - 3, top - 3, cr - cl + 7, 3); k5F('#0b1017', cl - 3, top, 3, K5L.ch + 3); k5F('#0b1017', cl - 3, gy, cr - cl + 7, 3); k5F('#3cc6ee', cl, top - 1, cr - cl, 1); k5F('#3cc6ee', cl, gy, cr - cl, 1);      // (the frame, a cyan edge)
  const dx = X(K5L.gx - 3), lift = S.door; ctx.save(); ctx.beginPath(); ctx.rect(dx - 2, top - 3, 12, K5L.ch + 6); ctx.clip();
  k5F('rgba(170,225,255,0.20)', dx, top - lift, 7, K5L.ch); k5F('#0b1017', dx - 1, top - lift - 3, 9, 3); k5F('#0b1017', dx - 1, top - lift, 2, K5L.ch + 3); k5F('#0b1017', dx + 6, top - lift, 2, K5L.ch + 3);
  const a = T - K5B.glass; if (a >= 0 && a < 0.5) k5F('rgba(220,244,255,' + (0.55 * (1 - a / 0.5)).toFixed(3) + ')', dx, top - lift, 7, K5L.ch); ctx.restore();
  k5F(S.door > 1 ? '#5cff9a' : ((t * 0.8) | 0) % 2 ? '#ff4a4a' : '#7a2020', dx + 2, top + 8, 2, 2);      // (the lock: red, green once it opens)
  if (a >= 0 && a < 0.4) c3Ring(X(K5L.gx), gy - 36, a, true, '190,235,255', 1);
  if (S.holo) { const hx = X(S.holo[0]), hy = gy - S.holo[1], k = S.holo[2]; ctx.globalAlpha = k; k5F('rgba(110,230,255,0.22)', hx - 12, hy - 8, 24, 16); ctx.fillStyle = '#7ee8ff'; ctx.fillRect(hx - 12, hy - 8, 24, 1); ctx.fillRect(hx - 12, hy + 7, 24, 1); ctx.fillRect(hx - 12, hy - 8, 1, 16); ctx.fillRect(hx + 11, hy - 8, 1, 16); for (let i = 0; i < 3; i++) ctx.fillRect(hx - 8, hy - 4 + i * 4, 6 + ((i * 5 + ((t * 6) | 0)) % 9), 1); if (S.door > 1) { ctx.fillStyle = '#5cff9a'; ctx.fillRect(hx + 6, hy + 2, 2, 2); ctx.fillRect(hx + 8, hy, 2, 2); ctx.fillRect(hx + 10, hy - 2, 1, 2); } ctx.globalAlpha = 1; }
}
const k5Ln = (T, t0, t1, a, b, e) => { const u = Math.max(0, Math.min(1, (T - t0) / (t1 - t0))); return a + (b - a) * (e ? e(u) : u); };      // (a number that goes from a to b between the times t0 and t1)
function k5LabEval(T) {      // everybody in the lab at the time T
  const B = K5B, S = { door: k5Ln(T, B.open, B.open1, 0, 74, c4xEase), holo: null, up: k5Ln(T, B.suit, B.suit1, 0, 1), tony: null, steve: null };
  // ---- Yuji: lies in the cell, sits up, looks round, punches the glass, walks out, follows the suit
  let yx = -62, yf = 1, yp = { set: 'idle', fi: (T * IDLE_FPS) % 15 };
  if (T < B.sit) yp = { set: 'rx', k: 4, fi: 9 }; else if (T < B.up) yp = { set: 'rx', k: 4, fi: 9 + 5 * c4xEase((T - B.sit) / (B.up - B.sit)) };
  if (T >= B.look[0] && T < B.look[1]) yf = -1;
  const pu = T - B.punch; if (pu >= 0 && pu < 0.55) yp = { set: 'atk', k: 12, fi: Math.min(14, pu * 30) };
  if (T >= B.out) { yx = k5Ln(T, B.out, B.out1, -62, -6); if (T < B.out1) yp = { set: 'fwd', fi: ((T - B.out) * WALK_FPS) % 15 }; }
  if (T >= B.ywalk) { yx = k5Ln(T, B.ywalk, B.room, -6, 40); yp = { set: 'fwd', fi: ((T - B.ywalk) * WALK_FPS) % 15 }; }
  S.y = { x: yx, face: yf, lift: 0, rot: 0, pose: yp, white: 0 };
  // ---- the suit: stands and watches, powers down when Tony walks in, is climbed into, turns and walks off (facing right)
  const turn = k5Ln(T, B.iwalk, B.iwalk + 0.25, 0, 1), sw = T >= B.iwalk + 0.25;
  S.suit = { x: sw ? 30 + 40 * (T - B.iwalk - 0.25) : 30, face: sw || turn >= 0.5 ? 1 : -1, sx: turn > 0 && turn < 1 ? Math.max(0.12, Math.abs(Math.cos(Math.PI * turn))) : undefined, pose: sw ? k5IWalk((T - B.iwalk - 0.25) * 1.5) : T < B.off || T >= B.suit1 ? Object.assign({}, K5P.talk, { vis: 1, y: K5P.talk.y + Math.sin(T * 2.2) * 0.3 }) : K5P.off };
  // ---- Tony (without the suit): walks in, waves, talks, shrugs, opens the chamber, walks to the suit and is in it
  if (T >= B.tin && T < B.suit1) { let x = 78, p = k5TP.stand('tony', T);
    if (T < B.tin1) { x = k5Ln(T, B.tin, B.tin1, 190, 78); p = k5Walk('tony', (T - B.tin) * 1.5); } else if (T >= B.tgo) { x = k5Ln(T, B.tgo, B.tsuit, 78, 30); if (T < B.tsuit) p = k5Walk('tony', (T - B.tgo) * 1.5); else x = 30; }
    else if (T >= 52.9 && T < 54.2) p = k5TP.wave('tony', T); else if (T >= 54.5 && T < 57.0) p = k5TP.talk('tony', T); else if (T >= 62.3 && T < 64.4) p = k5TP.shrug('tony', T); else if (T >= B.pad && T < B.open1 + 0.4) p = k5TP.pad('tony');
    S.tony = { x, face: -1, pose: p };
  }
  // ---- Steve (in his jacket): walks in and stands with folded arms
  if (T >= B.sin) { const w = T < B.sin1; S.steve = { x: w ? k5Ln(T, B.sin, B.sin1, 190, 124) : 124, face: -1, pose: w ? k5Walk('steve', (T - B.sin) * 1.5) : k5TP.fold('steve', T) }; }
  if (T >= B.pad - 0.2 && T < B.open1 + 0.7) S.holo = [52, 38, Math.min(1, (T - B.pad + 0.2) / 0.2) * Math.min(1, (B.open1 + 0.7 - T) / 0.4)];
  return S;
}
const k5Fig = (cv, R, x, face, sx, lift) => c4xBigDraw(cv, R, x, lift || 0, face, 0, undefined, sx);
function k5LabDraw(c, now, dt, T) {
  const S = k5LabEval(T), Y = Object.assign(c.y, S.y), su = S.suit, B = K5B; c.cam = 0;
  k5LabBack(now, T, S); c4xShadow(Y.x, 0, 9); c4xDrawY(Y); k5LabFront(now, T, S);
  const fig = (o, cv, R) => k5Fig(cv, R, o.x, o.face, o.sx), up = S.up;
  c4xShadow(su.x, 0, 11); if (up > 0 && up < 1) { const wy = gy - Math.round(up * 72); ctx.save(); ctx.beginPath(); ctx.rect(0, wy, VW, VH); ctx.clip(); fig(su, c4xIron(su.pose), C4I); ctx.restore(); } else if (up <= 0 || up >= 1) fig(su, c4xIron(su.pose), C4I);
  if (S.tony) { const t = S.tony, cv = k5Man(t.pose); if (up > 0 && up < 1) { const wy = gy - Math.round(up * 72); ctx.save(); ctx.beginPath(); ctx.rect(0, 0, VW, wy); ctx.clip(); fig(t, cv, K5R.tony); ctx.restore();
      const sx = c4xSX(30); ctx.save(); ctx.globalCompositeOperation = 'lighter'; k5F('rgba(120,230,255,0.35)', sx - 20, wy - 3, 40, 6); k5F('rgba(190,245,255,0.8)', sx - 20, wy - 1, 40, 2); ctx.restore(); k5F('#ffffff', sx - 18, wy, 36, 1);
      for (let i = 0; i < 6; i++) { const q = (T * 9 + i * 1.7) % 1; k5F('#bff6ff', sx - 16 + ((i * 13 + (T * 40 | 0)) % 32), wy - 4 - q * 10, 1, 1); } } else { c4xShadow(t.x, 0, 9); fig(t, cv, K5R.tony); } }
  if (S.steve) { c4xShadow(S.steve.x, 0, 9); fig(S.steve, k5Man(S.steve.pose), K5R.steve); }
  if (up >= 1 && T < B.suit1 + 0.25) c4xGlow(c4xSX(su.x) - 4, gy - 52, 5, ['rgba(170,240,255,0.3)', 'rgba(220,250,255,0.6)', 'rgba(255,255,255,0.95)']);      // (the suit's eyes light up)
}

// ================================================================ THE HUGE ROOM (T 71.8 on): a wide shot of a hall that makes two men look small, the camera comes in; Tony turns, asks, and charges from the right at Yuji (x = -30; Tony starts at x = 170, 200 px away)
// His flight (the time A of the movement): the boots light at A = q2 - 0.16 (0.12 s of speeding up), 308 pixels a second; his hip is over Yuji's head 0.45 s after the ring closes, his fist (46 pixels ahead of the hip) arrives 0.4 s after it. A HIT: the slow motion (k5Warp) while Tony passes over the ducking Yuji, then he brakes; A MISS: the fist hits (A = q2 + 0.4) and throws Yuji 368 pixels into the wall at x = -432.
const K5H = { yx: -30, tx: 170, v: 308, wall: -432, ang: 1.75, fly: 9 };      // (Yuji's place, Tony's, the speed, the wall, how far Tony is turned on his side in flight (radians), the height of the flight above his standing hip)
const k5Al = () => K5B.q2 - 0.16, k5Ac = () => K5B.q2 + 0.4;
const k5TX = A => { const u = A - k5Al(); return K5H.tx - K5H.v * (u < 0 ? 0 : u < 0.12 ? u * u / 0.24 : u - 0.06); };      // (Tony's hip in flight)
const k5Out = u => 1 - (1 - Math.max(0, Math.min(1, u))) * (1 - Math.max(0, Math.min(1, u)));
function k5HallEval(c, T) {
  const B = K5B, q2 = c.q2, hit = q2.res === 'hit', miss = q2.res === 'miss', A = hit ? k5Warp(T) : T, Al = k5Al(), Ac = k5Ac(), w0 = B.room, w1 = B.room + B.wk, S = { A, hit, miss, mu: -1 };
  const Ab = hit ? k5Warp(K5W.t4) : Ac, tb = hit ? 0.45 : 0.3;      // (when Tony brakes and how long it takes)
  // ---- Tony: walks in ahead of Yuji (facing right), turns, stands, winds up, flies (turned on his side), brakes, lands
  let tx = K5H.tx, tf = -1, tsx, tp, rot = 0, tl = 0; const stand = Object.assign({}, K5P.talk, { vis: 1, y: K5P.talk.y + Math.sin(T * 2.2) * 0.3 });
  if (T < w1) { tx = k5Ln(T, w0, w1, 80, K5H.tx); tf = 1; tp = k5IWalk((T - w0) * 1.5); }
  else { const tu = (T - B.turn) / 0.3; tf = tu < 0.5 ? 1 : -1; tsx = tu > 0 && tu < 1 ? Math.max(0.12, Math.abs(Math.cos(Math.PI * tu))) : undefined; tp = T >= 74.7 && T < 77.7 ? Object.assign({}, K5P.akimbo, { y: K5P.akimbo.y + Math.sin(T * 2.2) * 0.3, vis: 1 }) : stand;
    if (A < Al) { const k = c4xEase((A - (B.q2 - 1.6)) / 1.1); if (k > 0) tp = c4xMixPose(tp, K5P.wu, k); }
    else if (A < Ab || (!hit && !miss)) { const u = A - Al, k = c4xEase(u / 0.16); tp = c4xMixPose(K5P.wu, K5P.sm, k); rot = K5H.ang * k; tl = K5H.fly * k; tx = k5TX(A); }
    else { const u = A - Ab, x0 = k5TX(Ab), k = c4xEase(u / 0.4); tx = u < tb ? x0 - K5H.v * (u - u * u / (2 * tb)) : x0 - K5H.v * tb / 2; tp = c4xMixPose(K5P.sm, K5P.land, k); rot = K5H.ang * (1 - k); tl = K5H.fly * (1 - k);
      if (u > 0.5) tp = c4xMixPose(K5P.land, stand, c4xEase((u - 0.5) / 0.5)); if (hit && u > 0.9) { const v = (u - 0.9) / 0.25; tf = v < 0.5 ? -1 : 1; tsx = v < 1 ? Math.max(0.12, Math.abs(Math.cos(Math.PI * v))) : undefined; } }
  }
  S.tony = { x: tx, face: tf, sx: tsx, pose: tp, rot, lift: tl };
  // ---- Yuji: walks in, stands, takes the guard when Tony winds up; a HIT: ducks (atk 7, frames 5 - 8) until Tony has passed, rises, turns to him; a MISS: the fist throws him against the wall, he slides down and lies there
  let yx = T < w1 ? k5Ln(T, w0, w1, -120, K5H.yx) : K5H.yx, yf = 1, yl = 0, yp = T < w1 ? { set: 'fwd', fi: ((T - w0) * WALK_FPS) % 15 } : T >= B.q2 - 1.5 ? { set: 'blk', fi: 5 + Math.min(4, (T - (B.q2 - 1.5)) * 8) } : { set: 'idle', fi: (T * IDLE_FPS) % 15 };
  if (hit) { const td = q2.at + 0.04; if (T >= td) { yp = { set: 'atk', k: 7, fi: 5 + 3 * Math.min(1, (T - td) / 0.12) }; if (A >= Ab) { const u = (A - Ab) / 0.3; yf = -1; yp = u < 1 ? { set: 'atk', k: 7, fi: 8 - 3 * c4xEase(u) } : { set: 'idle', fi: (T * IDLE_FPS) % 15 }; } } }
  if (miss) { const u = T - Ac, wl = K5H.wall + 34; S.mu = u;
    if (u >= 0 && u < 0.1) yp = { set: 'rx', k: 1, fi: 3 };
    else if (u >= 0.1 && u < B.gap) { const f = (u - 0.1) / (B.gap - 0.1); yp = { set: 'rx', k: 4, fi: Math.min(9, 1 + (u - 0.1) * 26) }; yx = K5H.yx + (wl - K5H.yx) * k5Out(f); yl = 36 * c4xEase((u - 0.1) / 0.25) - 6 * f * f; }
    else if (u >= B.gap) { const g = (u - B.gap) / 0.42; yx = wl; yl = g < 1 ? 30 * (1 - g * g) : 0; yp = { set: 'rx', k: 4, fi: 8 }; } }
  S.y = { x: yx, face: yf, lift: yl, rot: 0, pose: yp, white: 0 }; return S;
}
function k5Cam(c, T) {      // the camera of the huge room: z = how big (0.5: the whole hall), cam = the world x in the middle, sy = the screen row of the floor
  const B = K5B, q2 = c.q2, e = c4xEase((T - B.zin[0]) / (B.zin[1] - B.zin[0])); let z = 0.5 + 0.5 * e, cam = 25 + 45 * e, sy = VH * 0.9 + (gy - VH * 0.9) * e;
  if (q2.res === 'hit') { const W = K5W, zs = Math.max(1.3, Math.min(2, (VH - 7) / 80)), k1 = c4xEase((T - (W.t1 - 0.12)) / 0.45), kz = k1 * (1 - c4xEase((T - (W.t4 - 0.35)) / 0.7)); z += (zs - z) * kz; sy += (VH - 7 - sy) * kz; cam += (-10 - cam) * k1; cam += (-120 - cam) * c4xEase((T - (W.t4 - 0.3)) / 1.0); }
  else if (q2.res === 'miss') { const u = T - k5Ac(), S = k5HallEval(c, Math.max(k5Ac(), T - 0.08)); cam += (Math.max(-300, S.y.x - 30) - cam) * c4xEase(u / 0.25); }
  return { z, cam, sy };
}
function k5HallBack(now, T, S) {      // the hall: a dark wall of huge panels, pillars with light strips, a catwalk, hanging lamps with cones of light, a giant door on the left (the small door in it has just closed), the wall of the left end, a floor of big tiles
  const c = c4x, X = c4xSX, W = VW, lo = c.cam - W * 1.7, hi = c.cam + W * 1.7, x0 = X(lo), ww = hi - lo, CE = gy - 260, t = now / 1000, f = k5F, H4 = 4 * VH;
  f('#090c11', x0, gy - H4, ww, H4 - 260);      // (the ceiling, dark)
  for (let i = 0; i < 8; i++) f(['#141a25', '#161d29', '#182030', '#1b2434', '#1e2839', '#222d40', '#263249', '#2a374e'][i], x0, CE + i * 33, ww, 34);      // (the wall: darker at the top)
  for (let k = Math.floor(lo / 120); k * 120 < hi; k++) { f('#0f141d', X(k * 120), CE, 2, 260); f('#33405a', X(k * 120) + 2, CE, 1, 260); }
  for (const dy of [60, 132, 204]) { f('#0f141d', x0, gy - dy, ww, 1); f('#2d3a52', x0, gy - dy + 1, ww, 1); }
  f('#0a0d13', x0, CE, ww, 4); for (let k = Math.floor(lo / 40); k * 40 < hi; k++) f('#0a0d13', X(k * 40), CE + 4, 2, 10);      // (the girders under the ceiling)
  for (let k = Math.floor((lo - 40) / 300); k * 300 + 40 < hi; k++) { const px = k * 300 + 40, sx = X(px); f('#202938', sx - 20, CE, 40, 260); f('#34425c', sx + 14, CE, 6, 260); f('#141a25', sx - 20, CE, 3, 260); f('rgba(70,200,240,0.85)', sx - 15, CE, 2, 260); f('rgba(70,200,240,0.14)', sx - 19, CE, 8, 260); for (let y = 20; y < 260; y += 70) { f('#141a25', sx - 22, gy - y, 44, 4); f('#3a4a68', sx - 22, gy - y, 44, 1); } f('rgba(70,200,240,0.10)', sx - 15, gy, 2, 40); }      // (the pillars: a cyan strip down each, clamps, its reflection in the floor)
  f('#0d121b', x0, gy - 132, ww, 5); f('#27324a', x0, gy - 142, ww, 1); for (let k = Math.floor(lo / 22); k * 22 < hi; k++) f('#27324a', X(k * 22), gy - 142, 1, 10); for (let k = Math.floor((lo - 190) / 300); k * 300 + 190 < hi; k++) f('#0d121b', X(k * 300 + 190) - 2, CE + 14, 4, 118);      // (the catwalk with its rail and hangers)
  for (let k = Math.floor((lo - 190) / 300); k * 300 + 190 < hi; k++) { const lx = X(k * 300 + 190); f('#0d121b', lx - 1, CE + 4, 2, 38); f('#2a3347', lx - 22, CE + 42, 44, 5); f('#fff6dc', lx - 18, CE + 47, 36, 2); ctx.fillStyle = 'rgba(255,244,214,0.05)'; ctx.beginPath(); ctx.moveTo(lx - 18, CE + 49); ctx.lineTo(lx + 18, CE + 49); ctx.lineTo(lx + 100, gy); ctx.lineTo(lx - 100, gy); ctx.fill(); }      // (the lamps and their light)
  // ---- the giant door on the left, with a small door in it: it has just closed behind them
  const dl = X(-190), cl = Math.max(0, Math.min(1, (T - (K5B.room + 0.4)) / 0.7)); f('#080b10', dl - 72, gy - 150, 144, 150); f('#171f2c', dl - 68, gy - 146, 136, 146); for (let k = -2; k <= 2; k++) f('#0d121b', dl + k * 27 - 1, gy - 146, 2, 146); f('#0d121b', dl - 68, gy - 74, 136, 2);
  for (let i = 0; i < 17; i++) f(i % 2 ? '#e8b82a' : '#14161c', dl - 68 + i * 8, gy - 8, 8, 8);      // (hazard stripes)
  f('#05070b', dl - 21, gy - 64, 42, 64); f('#232d3d', dl - 20, gy - 63 + 0, 40, Math.round(63 * cl)); f('#46c8ee', dl - 20, gy - 63 + Math.round(63 * cl), 40, cl < 1 ? 1 : 0);      // (the small door and its leaf coming down)
  // ---- the left end wall (Yuji's), the right end wall, the floor
  f('#0e131b', X(lo), gy - H4, X(K5H.wall) - X(lo), H4 + VH * 2); f('#46c8ee', X(K5H.wall) - 1, CE, 1, 260); f('rgba(70,200,240,0.16)', X(K5H.wall) - 4, CE, 3, 260); f('#0a0d12', X(520), gy - H4, X(hi) - X(520) + 2, H4 + VH * 2); f('#46c8ee', X(520), CE, 1, 260);
  f('#363e50', x0, gy, ww, 3 * VH); f('#4c586e', x0, gy, ww, 1); for (const dy of [7, 17, 31, 49]) f('#2a3140', x0, gy + dy, ww, 1);
  ctx.strokeStyle = '#2a3140'; ctx.lineWidth = 1; ctx.beginPath(); for (let k = Math.floor(lo / 70); k * 70 < hi; k++) { const sx = X(k * 70); ctx.moveTo(sx, gy + 1); ctx.lineTo(sx + (k * 70 - c.cam) * 0.5, gy + VH); } ctx.stroke();
  for (let i = 0; i < 3; i++) f('rgba(130,160,200,0.07)', x0, gy - 20 - i * 24, ww, 24);      // (the haze at the foot of the walls)
  ctx.fillStyle = 'rgba(255,244,214,0.5)'; for (let i = 0; i < 14; i++) { const px = lo + ((i * 97 + t * 4 * (1 + i % 3 * 0.4)) % (hi - lo)), py = gy - 30 - ((i * 53 + t * 5) % 200); ctx.fillRect(Math.round(X(px)), Math.round(py), 1, 1); }      // (dust in the light)
}
function k5WallCrater(x, y, a, T, T0) {      // where Yuji hit the wall: a dark dent with a bright rim, cracks that run out of it, and stones that fall
  if (a <= 0) return; const sx = c4xSX(x), r = 4 + 9 * a; ctx.save(); for (let dy = -r; dy <= r; dy++) { const w = Math.round(r * 0.8 * Math.sqrt(Math.max(0, 1 - dy * dy / (r * r)))); ctx.fillStyle = Math.abs(dy) >= r - 1 ? '#7c8aa6' : '#04060a'; ctx.fillRect(sx - w, Math.round(y + dy), w + 1, 1); }
  for (let i = 0; i < 14; i++) { const an = i * 0.46 + 0.2, len = (8 + 40 * c4xR(i, 21)) * a; let px = sx, py = y; for (let k = 0; k < len; k++) { px += Math.cos(an) * 0.8 + (c4xR(k + i, 3) - 0.5) * 0.9; py += Math.sin(an) + (c4xR(k, i) - 0.5) * 0.9; if (px > sx + 1) break; ctx.fillStyle = '#02030a'; ctx.fillRect(Math.round(px), Math.round(py) + 1, 1, 1); ctx.fillStyle = 'rgba(150,172,205,0.75)'; ctx.fillRect(Math.round(px), Math.round(py), 1, 1); } }
  const g = T - T0; for (let i = 0; i < 8 && g > 0; i++) { const vx = 12 + 40 * c4xR(i, 5), px = sx + vx * g, py = y - 10 + (c4xR(i, 6) - 0.5) * 30 + 0.5 * 300 * g * g; if (py < gy + 4) { ctx.fillStyle = i % 2 ? '#7c8aa6' : '#46526a'; ctx.fillRect(Math.round(px), Math.round(py), 2, 2); } else { ctx.fillStyle = '#46526a'; ctx.fillRect(Math.round(sx + vx * Math.sqrt(2 * (gy + 4 - y + 10) / 300)), gy + 3, 2, 1); } } ctx.restore();
}
function k5DrawIM2(S) {      // Iron Man (or Tony in the suit) at the world x, facing S.face (-1 left, 1 right; S.sx squeezes him for a turn), turned on his side round the hip by S.rot (radians, forward)
  const R = C4I, cv = c4xIron(S.pose), top = gy - R.GY - Math.round(S.lift || 0), hip = S.pose.y;
  ctx.save(); ctx.translate(c4xSX(S.x), 0); ctx.scale(S.face * (S.sx === undefined ? 1 : S.sx), 1); if (S.rot) { ctx.translate(0, top + hip); ctx.rotate(S.rot); ctx.drawImage(cv, -R.cx, -hip); } else ctx.drawImage(cv, -R.cx, top); ctx.restore();
}
function k5HallDraw(c, now, dt, T) {
  const B = K5B, S = k5HallEval(c, T), Z = k5Cam(c, T), Y = Object.assign(c.y, S.y), im = S.tony, SX = c4xSX, A = S.A, Al = k5Al(), Ac = k5Ac(); c.cam = Z.cam; wx = Math.round(Z.cam);
  ctx.save(); ctx.translate(VW / 2, Z.sy); ctx.scale(Z.z, Z.z); ctx.translate(-VW / 2, -gy);
  k5HallBack(now, T, S);
  if (S.miss && S.mu >= B.gap) k5WallCrater(K5H.wall, gy - 46, Math.min(1, (S.mu - B.gap) / 0.25 + 0.3), S.mu, B.gap);
  c4xShadow(Y.x, Y.lift, 9); c4xShadow(im.x, im.lift > 0 ? im.lift + 48 : 0, 11);
  c4xDrawY(Y); k5DrawIM2(im);
  // ---- the charge: dust where he takes off, streaks behind him, the glow of the boots; a HIT: the dust of the brake; a MISS: the ring and the blood of the blow, the stain at the wall
  c4Dust(A, Al, SX(K5H.tx), 7, { w: 22, h: 8, life: 0.6, col: '210,205,190', big: 5, seed: 7 });
  if (T >= B.room + B.wk) { const e0 = k5HallEval(c, T - 0.04), v = (im.x - e0.tony.x) / 0.04; if (Math.abs(v) > 120 && im.rot > 1) { ctx.save(); ctx.globalAlpha = Math.min(0.75, Math.abs(v) / 420); ctx.fillStyle = '#fff3c8'; const dir = v < 0 ? 1 : -1; for (let i = 0; i < 5; i++) ctx.fillRect(SX(im.x) + dir * (34 + i * 7), gy - 38 - im.lift - i * 5, 18 + (i % 2) * 8, 1); ctx.restore(); } }
  if (S.hit) { const Ab = k5Warp(K5W.t4); c4Dust(A, Ab + 0.12, SX(im.x < -100 ? im.x : -140), 8, { w: 26, h: 8, life: 0.7, col: '210,205,190', big: 5, seed: 8 }); }
  if (S.miss) { const a = T - Ac, gore = k5Gore(); if (a >= 0 && a < 0.5) c3Ring(SX(K5H.yx - 6), gy - 40, a, true, '255,235,200', 1);
    if (gore === 0) { c4Spray(T, Ac, SX(K5H.yx - 8), gy - 40, 12, { v: 90, up: 1, dir: -1, life: 0.9, cols: C4_BLOOD, sz: 1, seed: 21, g: 300, gnd: gy + 4, stain: 2 }); if (S.mu >= B.gap) { c4Spray(T, Ac + B.gap, SX(K5H.wall + 6), gy - 40, 16, { v: 70, up: 1, dir: 1, life: 0.9, cols: C4_BLOOD, sz: 1, seed: 22, g: 300, gnd: gy + 4, stain: 3 }); const g = Math.min(1, (S.mu - B.gap - 0.4) / 1.2); if (g > 0) { ctx.fillStyle = C4_BLOOD[1]; ctx.fillRect(SX(K5H.wall + 14), gy + 2, Math.round(22 * g), 2); ctx.fillStyle = C4_BLOOD[0]; ctx.fillRect(SX(K5H.wall + 18), gy + 4, Math.round(14 * g), 1); } } } }
  drawSmoke(now, dt); drawSparks(now, dt); drawPopups(now);
  ctx.restore();
  // ---- the slow motion: dark corners, a blue light and long thin lines drawn slowly across
  if (S.hit) { const W = K5W, k = c4xEase((T - (W.t1 - 0.05)) / 0.3) * (1 - c4xEase((T - (W.t4 - 0.3)) / 0.6)); if (k > 0.01) { const g = ctx.createRadialGradient(VW / 2, VH * 0.55, VH * 0.25, VW / 2, VH * 0.55, VW * 0.62); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(0,0,0,' + (0.72 * k).toFixed(3) + ')'); ctx.fillStyle = g; ctx.fillRect(0, 0, VW, VH); ctx.fillStyle = 'rgba(110,150,255,' + (0.07 * k).toFixed(3) + ')'; ctx.fillRect(0, 0, VW, VH); ctx.fillStyle = 'rgba(220,235,255,' + (0.22 * k).toFixed(3) + ')'; for (let i = 0; i < 7; i++) { const y = Math.round(VH * (0.12 + 0.76 * c4xR(i, 31))), x = Math.round(((c4xR(i, 32) * VW * 2 - T * 18 * (1 + i % 3)) % (VW * 1.4) + VW * 1.4) % (VW * 1.4) - VW * 0.2); ctx.fillRect(x, y, 30 + (i % 3) * 20, 1); } } }
}
function k5Draw2(c, now, dt, T) {      // after the black of the road: the lab, then the huge room, then the cards
  const cd = k5Cards(c); if (T >= cd.black + 0.7) { k5Tbc(T); return; }
  if (T < K5B.room) { k5LabDraw(c, now, dt, T); drawSmoke(now, dt); drawSparks(now, dt); drawPopups(now); } else k5HallDraw(c, now, dt, T);
}
function k5Black2(c, T) { const cd = k5Cards(c); if (T >= cd.black + 0.7) return 0; if (c.q2.res === 'miss' && k5Gore() === 2) return T >= K5B.q2 + 0.4 ? 1 : 0; return T >= cd.black ? c4xEase((T - cd.black) / 0.7) : 0; }      // (the fall to black before the cards, which draw their own black; with GRAPHIC DAMAGE OFF the blow is cut away: black at the moment of the punch)
const k5Lids = T => { const E = K5B.eye; return T < E[0] ? 0 : T < E[1] ? 0.4 * c4xEase((T - E[0]) / (E[1] - E[0])) : T < E[2] ? 0.4 * (1 - c4xEase((T - E[1]) / (E[2] - E[1]))) : T < E[3] ? c4xEase((T - E[2]) / (E[3] - E[2])) : 1; };      // (how far Yuji's eyes are open: a first glimpse, shut, wide open)
function k5Overlay2(c, now, T) {
  const B = K5B, h = k5Lids(T);
  if (h < 1) {      // the eyelids: black with an opening in the shape of an eye, and the first look dim
    ctx.fillStyle = '#000'; if (h <= 0) ctx.fillRect(0, 0, VW, VH); else { ctx.fillStyle = 'rgba(14,20,40,' + (0.5 * (1 - h)).toFixed(3) + ')'; ctx.fillRect(0, 0, VW, VH); ctx.fillStyle = '#000'; const cy = VH * 0.52, hh = Math.max(0.5, VH * 0.9 * h), hw = VW * 0.85;
      for (let y = 0; y < VH; y++) { const dy = (y + 0.5 - cy) / hh, e = Math.abs(dy) >= 1 ? 0 : hw * Math.sqrt(1 - dy * dy); if (e <= 0) ctx.fillRect(0, y, VW, 1); else { ctx.fillRect(0, y, Math.max(0, VW / 2 - e), 1); ctx.fillRect(VW / 2 + e, y, Math.max(0, VW / 2 - e), 1); } } } }
  const u = T - B.q2, px = c4xSX(c.y.x), py = gy - 34;      // (the ring of the second tap, over Yuji)
  if (T >= B.room && !c.q2.res && u > -C13P.tap.vis && u < C13.win[1] + 0.25 && !c13Off()) { const rad = 11 + 26 * Math.pow(clamp01(-u / C13P.tap.vis), 1.2), gold = Math.abs(u) <= C13.perfect + 0.02; ctx.save(); ctx.imageSmoothingEnabled = false; c13Ring(px, py, rad, '#ffffff', gold, '#c4121c', 'TAP', 'DODGE'); if (u < -0.2) pxt('TAP OR PRESS ANY KEY', Math.round(VW / 2), VH - 6, '#ffffff', 8, 'center'); ctx.restore(); }
  else if (c.q2.res && c.q2.why) { const t = T - c.q2.at; if (t >= 0 && t < 0.8) { ctx.save(); ctx.globalAlpha = 1 - t / 0.8; pxt(c.q2.why, px, py - 22 - t * 12, c.q2.res === 'miss' ? '#ff3347' : c.q2.why === 'PERFECT' ? '#ffe08a' : '#ffffff', 10, 'center'); ctx.restore(); } }
}
function k5Step2(c, now, dt, T) {      // the sounds and shakes of part 2 (each fires once; one that a skip jumped over by more than 0.4 s is not played late), the second tap going unmade, the end
  const B = K5B, E = B.eye, cd = k5Cards(c), q2 = c.q2, hit = q2.res === 'hit', miss = q2.res === 'miss', A = hit ? k5Warp(T) : T, ev = (n, t, f) => c4xEv(c, T, n, t, f), evA = (n, t, f) => c4xEv(c, A, n, t, f), Ac = k5Ac();
  if (T >= B.room && !q2.res && T >= B.q2 + C13.win[1]) k5Resolve2(c, c13Off() ? 'hit' : 'miss', 'MISS', B.q2 + C13.win[1]);
  ev('b1', E[0] - 0.2, () => snd('c5beat')); ev('b2', E[2] - 0.2, () => snd('c5beat'));
  ev('glass', B.glass, () => { snd('tink', 1); flash(now, 90, 0.16); shakeUntil = now + 140; shakeAmp = 1.5; spark(K5L.gx, gy - 36, 10, ['#ffffff', '#bfe8ff', '#8fd0ff'], true, 1); });
  ev('beep', B.pad + 0.1, () => snd('k5beep')); ev('door', B.open, () => snd('k5door')); ev('suit', B.suit, () => snd('k5suit')); ev('room', B.room, () => snd('land', 1.6));
  ev('chg', B.q2 - 1.4, () => snd('redcharge')); evA('launch', k5Al(), () => { snd('thrust', 0.8); snd('swing', 3); puff(K5H.tx, 7); });
  if (hit) {      // the slow motion and the brake
    ev('slowin', K5W.t1, () => { snd('slowin'); c.slow = 1; }); ev('pass', K5W.t1 + K5W.a + K5W.h / 2, () => { snd('swing', 3); snd('thrust', 0.6); }); ev('slowout', K5W.t4 - 0.3, () => { snd('slowout'); c.slow = 0; });
    if (c.slow && T >= K5W.t4 + 0.1) { snd('slowout'); c.slow = 0; }      // (a skip may have jumped over the end of the slow motion: the sound's filter must open again)
    evA('brake', k5Warp(K5W.t4) + 0.1, () => { snd('land', 2); puff(-140, 8); shakeUntil = now + 220; shakeAmp = 3; spark(-140, gy, 10, ['#ffd27a', '#ffffff', '#9a9ca6'], true, 1); });
  }
  if (miss) {      // the fist, the flight, the wall
    ev('mhit', Ac, () => { snd('hit', 3); snd('concboom'); snd('smack', 3); hitStop(110); shakeUntil = now + 380; shakeAmp = 7; flash(now, 140, 0.4); spark(K5H.yx - 6, gy - 40, 16, ['#ffffff', '#ffd27a', '#ff5a6a'], true, -1); puff(K5H.yx, 8); });
    ev('mfly', Ac + 0.05, () => snd('thrust', 0.6));
    ev('wall', Ac + B.gap, () => { snd('concboom'); snd('land', 3); hitStop(130); shakeUntil = now + 520; shakeAmp = 9; flash(now, 160, 0.45); spark(K5H.wall + 4, gy - 46, 22, ['#ffffff', '#aab4cc', '#ffd27a'], true, 1); puff(K5H.wall + 24, 10); });
    ev('slump', Ac + B.gap + 0.42, () => { snd('land', 1.4); puff(K5H.wall + 30, 6); }); ev('groan', Ac + B.gap + 0.8, () => snd('gasp', 1));
  }
  ev('card', cd.card, () => snd('c7drone'));
  if (T >= cd.end) { const slot = story ? story.slot : -1; storyDone16(); c4xOff(); svSel = slot; svView = 1; $('vsres').classList.remove('on'); show('saves'); renderSaves(); }
}
window.__k5Z = t => { const c = c4x; return c && c.ph === 'k5' ? { cam: k5Cam(c, t === undefined ? c.T : t), cards: k5Cards(c), warp: [K5W.t1, K5W.t4, k5Warp(K5W.t1), k5Warp(K5W.t4)] } : null; };      // test hook: the camera of the huge room, the times of the cards, the slow motion
window.__k5B = t => { const c = c4x; if (!c || c.ph !== 'k5') return null; const T = t === undefined ? c.T : t; return T < K5B.room ? k5LabEval(T) : k5HallEval(c, T); };      // test hook: everybody's place and picture in part 2 at the scene time t
