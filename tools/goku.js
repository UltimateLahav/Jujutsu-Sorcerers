// ================================================================ v1.217 GOKU (this file is spliced into template.html by build_html.py, after westcity.js)
// The user (with a pixel-art picture of Goku): "make goku then teleport using instant transmission by putting both fingers on his forehead and goku will aim his hand at yuji asking who are you AND then yuji will punch goku but it does absolutely nothing as goku punches yuji into a building, make this moment very high quality".
// Answers: he is first seen on a grassy hill (he senses Yuji, two fingers on his forehead, he is gone), Yuji's punch is a normal punch, the scene ends with the TO BE CONTINUED card, Goku's line is in the dialogue box only.
// HIS FIGURE (like Iron Man and Ranos, drawn at run time with the shaded capsules of c15MegKit, pose by pose, cached by the numbers of the pose, canvases of 120 x 100 with the soles on row 94 and the middle of him on column 56): c4xGoku(pose) = the side view, facing right (the city draws it mirrored); c4xGokuF(pose) = from the front with the head turned to the right as in the picture (on the hill). The orange gi with the blue undershirt (the V at the chest and the short sleeves), the blue sash and wristbands, the baggy orange trousers, the blue boots with a yellow stripe and a red toe, and his hair: black, a great crown of spikes and a fringe over the forehead, drawn as tapered capsules with a few dull shining blocks.
// A POSE of the side view: the numbers of the poses of Iron Man (see chap4e.js: x, y = the hip, lean, hdx, hdy, hdt = the head, arms [{ al, el }] (the first is the far arm), legs [{ ax, ay, a }]); a POSE from the front: x, y, lean, hdx, hdy, arms [{ a1, a2 }, { a1, a2 }] (the screen-left arm first: the angles of the upper arm and the forearm from straight down, clockwise on the screen: 90 = to the right, 180 = up), legs [{ ax, ay }]; in both: ex = the face ('calm' - open eyes, a small mouth; 'serious' - the brow down; 'closed' - eyes shut; 'talk' - the mouth open; 'shock'), hair = 0 - 1: how much the hair is lifted; side view: palm = 1: the near hand open; front: fing = the angle of the two fingers of the right hand (instant transmission).
const C4G = { W: 120, H: 100, GY: 94, cx: 56, L1: 11.4, L2: 11.4, LT: 15.5, UA: 9, FA: 8.6, AH: 3 };
const GKC = { gi: '#ec7a22', blue: '#2c24c4', navy: '#202c9e', skin: '#eba070', hair: '#14141a', yellow: '#f2c230', red: '#cc3030', iris: '#17151c', white: '#f6f6ff', mouth: '#8e4a38' };
const GKM = (() => { const m = {}; for (const [k, far] of [['', 0], ['F', 0.1]]) { m['gi' + k] = c4M(GKC.gi, far); m['bl' + k] = c4M(GKC.blue, far); m['nv' + k] = c4M(GKC.navy, far); m['sk' + k] = c4M(GKC.skin, far); m['ye' + k] = c4M(GKC.yellow, far); m['rd' + k] = c4M(GKC.red, far); } m.hair = c4M(GKC.hair); return m; })();
function gkHead(p, hx, hy, o) {      // the head, facing right (the same in the side view and in the front view): the hair behind, the face, the fringe, the eye, the brow and the mouth
  const K = c4K, M = GKM, hl = K('#4a4a62'), up = o.hair || 0, rise = up * 1.6;
  // the hair at the back and on top: a mass and spikes (tapered capsules), the biggest ones on the left (the back) and on top
  const SP = [[0.5, -6.2, -0.4, -13.6 - rise, 2.7], [6.6, -6.4, 13.6, -13.0 - rise, 3.7], [11.2, -7.6, 16.8, -10.6 - rise, 1.9], [9.4, -4.8, 15.2, -4.4 - rise * 0.5, 2.3], [10.4, -2.9, 17.6, -2.4, 2.1], [-4.4, -5.6, -13.6, -7.6 + rise * 0.3, 2.4], [-5.0, -2.4, -17.2, -3.0, 2.7], [-4.6, 0.6, -13.6, 1.8, 2.5], [-3.8, 3.4, -9.0, 6.2, 2.1]];
  const parts = [c4ell(hx + 2.0, hy - 4.2, 9.0, 8.6), c4ell(hx - 2.5, hy + 0.2, 4.5, 5.4)]; for (const [bx, by, tx, ty, r] of SP) parts.push(c4cap(hx + bx, hy + by, hx + tx, hy + ty, r, 0.35));
  p.put(c4uni(...parts), M.hair, 2);
  // the face: the skin, the nose, the ear
  p.put(c4uni(c4ell(hx + 0.8, hy + 3.4, 6.3, 6.8), c4cap(hx + 5.2, hy + 4.2, hx + 6.9, hy + 5.4, 1.0, 0.7)), M.sk);
  p.put(c4ell(hx - 4.8, hy + 3.2, 1.6, 2.4), M.sk, 1); p.px(hx - 5.2, hy + 3.0, M.sk[0]);
  // the fringe over the forehead: three locks and the one at the temple
  const FR = [[-4.6, -2.8, -4.4, 5.0, 1.8], [-1.8, -4.6, -1.0, 0.8, 1.9], [2.0, -4.8, 3.2, 0.2, 1.8], [5.2, -4.0, 7.6, 1.6, 1.3]];
  p.put(c4uni(...FR.map(([bx, by, tx, ty, r]) => c4cap(hx + bx, hy + by, hx + tx, hy + ty, r, 0.4))), M.hair, 2);
  const h2 = K('#27272f'); for (const [dx, dy, w, h] of [[-1.5, -11.5, 2, 4], [4, -11, 3, 2], [8, -9, 3, 2], [-9, -4.4, 4, 1], [-13, -2.2, 3, 1], [-11, 1, 3, 1], [2, -6, 4, 2], [9.5, -4.2, 3, 1]]) p.rect(Math.round(hx + dx), Math.round(hy + dy - (dy < -9 ? rise : 0)), w, h, h2);      // (the dull shine in the black: a few blocks, as in the picture)
  for (const [dx, dy] of [[-1, -12.2], [5, -11.4], [10, -12], [-12, -7], [-15, -3], [13.4, -3.4], [14.6, -9.6]]) p.px(hx + dx, hy + dy - (dy < -9 ? rise : 0), hl);      // (and the bright points on the tips)
  // the eye, the brow and the mouth
  const ex = o.ex || 'calm', Wt = K(GKC.white), Ir = K(GKC.iris), X = Math.round(hx + 1.2), Y = Math.round(hy + 2.4), mx = Math.round(hx + 3.8), my = Math.round(hy + 7.2);
  if (ex === 'closed') { p.rect(X, Y + 1, 5, 1, Ir); p.rect(X - 1, Y - 1, 3, 1, Ir); }
  else if (ex === 'shock') { p.rect(X, Y - 1, 3, 4, Wt); p.rect(X + 3, Y, 2, 3, Wt); p.px(X + 3, Y + 1, Ir); p.px(X + 4, Y + 1, Ir); p.rect(X - 1, Y - 3, 6, 1, Ir); }
  else { p.rect(X, Y, 2, 2, Wt); p.rect(X + 2, Y, 2, 2, Ir); p.px(X + 3, Y, Wt); if (ex === 'serious') { p.rect(X - 1, Y - 2, 2, 1, Ir); p.rect(X + 1, Y - 2, 3, 2, Ir); p.px(X + 4, Y - 1, Ir); } else { p.rect(X - 1, Y - 2, 6, 1, Ir); p.rect(X + 1, Y - 1, 3, 1, Ir); } }
  if (ex === 'talk') { p.rect(mx - 1, my - 1, 3, 3, K('#5a1f20')); p.rect(mx - 1, my - 1, 3, 1, Wt); } else if (ex === 'shock') { p.rect(mx - 1, my - 1, 2, 3, K('#5a1f20')); } else { p.rect(mx - 1, my, 3, 1, K(GKC.mouth)); }
}
function c4xDrawGoku(o) {
  const R = C4G, p = new C4Pix(R.W, R.H), J = c4xRig(R, o), { P, at, Nk, Sh, hd, arms, legs } = J, K = c4K, M = GKM;
  const drawArm = k => {      // the blue short sleeve over the top of the upper arm, the bare forearm, the blue wristband, the fist (or the open hand, or the two fingers)
    const a = arms[k], s = k ? '' : 'F', mid = (u) => [a.E[0] + (a.W[0] - a.E[0]) * u, a.E[1] + (a.W[1] - a.E[1]) * u], sl = [Sh[0] + (a.E[0] - Sh[0]) * 0.42, Sh[1] + (a.E[1] - Sh[1]) * 0.36];
    p.put(c4uni(c4ell(Sh[0], Sh[1], 4.4, 4.4), c4cap(Sh[0], Sh[1], a.E[0], a.E[1], 3.7, 3.2)), M['sk' + s]);      // (the shoulder and the upper arm: bare)
    p.put(c4uni(c4ell(Sh[0], Sh[1], 3.9, 3.9), c4cap(Sh[0], Sh[1], sl[0], sl[1], 3.5, 3.2)), M['bl' + s], 1);      // (the sleeve of the undershirt)
    p.put(c4cap(a.E[0], a.E[1], a.W[0], a.W[1], 3.2, 2.7), M['sk' + s]);      // (the forearm)
    const w0 = mid(0.7); p.put(c4cap(w0[0], w0[1], a.W[0] + (a.h[0] - a.W[0]) * 0.3, a.W[1] + (a.h[1] - a.W[1]) * 0.3, 3.2, 3.0), M['bl' + s], 1);      // (the wristband)
    const ux = Math.sin(a.a2), uy = Math.cos(a.a2), nx = uy, ny = -ux;
    if (k && o.palm) {      // (the open hand held out: the palm towards the one he speaks to, four fingers up with a dark line between them, the thumb)
      const hx0 = a.h[0] + ux * 1.5, hy0 = a.h[1] + uy * 1.5 + 0.6, ol = M.sk.o; p.put(c4ell(hx0, hy0, 2.7, 2.9), M.sk);
      for (const [dx, h] of [[-1.5, 2], [-0.5, 3], [0.5, 3], [1.5, 2]]) { p.rect(Math.round(hx0 + dx), Math.round(hy0 - 2.6 - h), 1, h + 1, M.sk[2]); p.px(hx0 + dx + 1, hy0 - 3.4, ol); }      // (four fingers, a dark line between them)
      p.rect(Math.round(hx0 + 2), Math.round(hy0 - 1), 1, 3, M.sk[1]); p.px(hx0 - 1, hy0 + 0.6, M.sk[3]);
    } else { p.put(c4ell(a.h[0], a.h[1], 3.0, 3.2), M['sk' + s]); const f = [a.h[0] + ux * 1.6 + nx * 0.4, a.h[1] + uy * 1.6 + ny * 0.4]; p.px(f[0] - nx * 1.2, f[1] - ny * 1.2, M['sk' + s][1]); p.px(f[0] + nx * 0.6, f[1] + ny * 0.6, M['sk' + s][1]); }
  };
  const drawLeg = k => {      // the baggy trousers (they gather and puff out over the boot), the boot with its yellow stripe, the red toe
    const l = legs[k], s = k ? '' : 'F', Hp = [P[0] + 0.3, P[1]], tk = [l.K[0] + (l.ax - l.K[0]) * 0.72, l.K[1] + (l.ay - 5 - l.K[1]) * 0.72];
    p.put(c4uni(c4cap(Hp[0], Hp[1], l.K[0], l.K[1], 5.0, 4.4), c4cap(l.K[0], l.K[1], tk[0], tk[1], 4.4, 4.0), c4ell(tk[0], tk[1] + 0.8, 4.6, 3.2)), M['gi' + s]);
    const b0 = [l.ax + (l.K[0] - l.ax) * 0.14, l.ay - 5.2 + (l.K[1] - l.ay) * 0.14]; p.put(c4cap(b0[0], b0[1], l.ax, l.ay, 3.3, 2.9), M['nv' + s], 1);
    p.line([b0[0] - 3, b0[1] + 1], [b0[0] + 3, b0[1] + 1], M['ye' + s][2]); p.line([b0[0] - 3, b0[1] + 2], [b0[0] + 3, b0[1] + 2], M['ye' + s][1]);      // (the stripe at the top of the boot)
    c4xFoot(p, l, M['nv' + s], K('#0a0a22')); const a = -(l.a || 0) * C4RAD, cs = Math.cos(a), sn = Math.sin(a), Rt = (x, y) => [l.ax + x * cs - y * sn, l.ay + x * sn + y * cs], tt = Rt(5.4, 2.2); p.px(tt[0], tt[1], M['rd' + s][2]); p.px(tt[0] - 1, tt[1], M['rd' + s][2]); p.px(tt[0], tt[1] + 1, M['rd' + s][1]);
  };
  drawArm(0); drawLeg(0);
  const w1 = at(0.3, 0), w2 = at(0.72, 0);
  p.put(c4uni(c4cap(P[0], P[1], w1[0], w1[1], 5.2, 5.8), c4cap(w1[0], w1[1], w2[0], w2[1], 5.8, 7.9), c4cap(w2[0], w2[1], Nk[0], Nk[1], 7.9, 4.8)), M.gi);      // (the gi)
  const v0 = at(0.56, 3.0), v1 = at(0.88, 2.0); p.put(c4cap(v0[0], v0[1], v1[0], v1[1], 2.4, 1.5), M.bl, 1);      // (the blue undershirt in the V of the gi)
  const sk0 = at(0.97, 1.4); p.put(c4ell(sk0[0], sk0[1], 2.4, 2.6), M.sk, 1);      // (the bare chest at the top of the V)
  p.put(c4cap(hd[0] - 0.6, hd[1] + 5.4, Nk[0] + 0.3, Nk[1] - 0.2, 2.4, 3.0), M.sk);      // (the neck)
  gkHead(p, hd[0], hd[1], o);
  drawLeg(1); const sk = at(0.03, 0); p.put(c4cap(sk[0] - 0.2, sk[1] - 0.6, sk[0] + 0.3, sk[1] + 2.4, 5.0, 5.3), M.gi, 1);
  const sa = at(0.17, -3.8), sb = at(0.17, 3.8); p.put(c4cap(sa[0], sa[1], sb[0], sb[1], 2.2, 2.2), M.bl); const kn = at(0.1, -4.4); p.put(c4cap(kn[0], kn[1], kn[0] - 2.6, kn[1] + 4.4, 1.2, 0.8), M.bl, 1);      // (the sash and its loose end, hanging at the back)
  drawArm(1); return p;
}
const gkTri = (A, B, C) => ({ b: [Math.min(A[0], B[0], C[0]), Math.min(A[1], B[1], C[1]), Math.max(A[0], B[0], C[0]), Math.max(A[1], B[1], C[1])], f(x, y) { const d = (B[1] - C[1]) * (A[0] - C[0]) + (C[0] - B[0]) * (A[1] - C[1]), l1 = ((B[1] - C[1]) * (x - C[0]) + (C[0] - B[0]) * (y - C[1])) / d, l2 = ((C[1] - A[1]) * (x - C[0]) + (A[0] - C[0]) * (y - C[1])) / d; return l1 >= 0 && l2 >= 0 && l1 + l2 <= 1 ? [0, 0, 1] : null; } });      // (a flat triangle for the V of the gi)
function c4xDrawGokuF(o) {      // HIS FIGURE FROM THE FRONT, his head turned to the right as in the picture (the instant transmission and the first sight of him): o.x, o.y = the hip, lean (degrees), hdx, hdy, hdt, ex, legs [{ ax, ay }] (the ankles), arms [{ a1, a2 }, { a1, a2 }] (the screen-left arm first: the angle of the upper arm and of the forearm from straight down, clockwise on the screen: 90 = to the right, 180 = up), and for the arm on the right fing = the angle of the two fingers
  const R = C4G, p = new C4Pix(R.W, R.H), M = GKM, ln = (o.lean || 0) * C4RAD, upx = Math.sin(ln), upy = -Math.cos(ln), rx = Math.cos(ln), ry = Math.sin(ln), cx = o.x === undefined ? R.cx : o.x, P = [cx, o.y === undefined ? R.GY - R.AH - (R.L1 + R.L2) * 0.97 : o.y], GA = R.GY - R.AH;
  const at = (t, d) => [P[0] + upx * R.LT * t + rx * d, P[1] + upy * R.LT * t + ry * d], Nk = at(1, 0), hd = [Nk[0] + (o.hdx === undefined ? 0.6 : o.hdx), Nk[1] + (o.hdy === undefined ? -5 : o.hdy) - R.LT * 0.3];
  const arms = (o.arms || [{ a1: -9, a2: -13 }, { a1: 9, a2: 13 }]).map((a, k) => { const S = at(0.86, k ? 7.5 : -7.5), t1 = a.a1 * C4RAD, t2 = a.a2 * C4RAD, E = [S[0] + Math.sin(t1) * R.UA, S[1] + Math.cos(t1) * R.UA], W = [E[0] + Math.sin(t2) * R.FA, E[1] + Math.cos(t2) * R.FA]; return { S, E, W, h: [W[0] + Math.sin(t2) * 2.6, W[1] + Math.cos(t2) * 2.6] }; });
  const drawArm = k => {      // the blue short sleeve, the bare forearm, the wristband, the fist (or the two fingers)
    const a = arms[k], mid = u => [a.E[0] + (a.W[0] - a.E[0]) * u, a.E[1] + (a.W[1] - a.E[1]) * u], sl = [a.S[0] + (a.E[0] - a.S[0]) * 0.34, a.S[1] + (a.E[1] - a.S[1]) * 0.34];
    p.put(c4uni(c4ell(a.S[0], a.S[1], 3.5, 3.5), c4cap(a.S[0], a.S[1], a.E[0], a.E[1], 3.3, 3.0)), M.sk);
    p.put(c4uni(c4ell(a.S[0], a.S[1], 3.4, 3.4), c4cap(a.S[0], a.S[1], sl[0], sl[1], 3.2, 3.0)), M.bl, 1);
    p.put(c4cap(a.E[0], a.E[1], a.W[0], a.W[1], 3.2, 2.7), M.sk); const w0 = mid(0.7); p.put(c4cap(w0[0], w0[1], a.W[0] + (a.h[0] - a.W[0]) * 0.3, a.W[1] + (a.h[1] - a.W[1]) * 0.3, 3.2, 3.0), M.bl, 1);
    p.put(c4ell(a.h[0], a.h[1], 3.0, 3.2), M.sk);
    if (k && o.fing !== undefined) {      // (the two fingers: one outlined bar with a dark line down the middle)
      const th = o.fing * C4RAD, dx = Math.sin(th), dy = Math.cos(th); p.put(c4cap(a.h[0], a.h[1], a.h[0] + dx * 5.6, a.h[1] + dy * 5.6, 1.7, 1.4), M.sk);
      for (let q = 0.5; q < 5.2; q += 0.7) p.px(a.h[0] + dx * (q + 1.2), a.h[1] + dy * (q + 1.2), M.sk[0]);
    }
  };
  // the legs: straight baggy trousers puffed over the boots, the boots from the front (a yellow stripe, a red toe)
  (o.legs || [{ ax: cx - 6.4, ay: GA }, { ax: cx + 6.4, ay: GA }]).forEach((l, k) => {
    const Hp = at(0, k ? 3.2 : -3.2); p.put(c4uni(c4cap(Hp[0], Hp[1], l.ax, l.ay - 5.2, 5.0, 4.3), c4ell(l.ax, l.ay - 5.2, 4.7, 3.4)), M.gi);
    p.put(c4uni(c4cap(l.ax, l.ay - 5, l.ax, l.ay - 0.4, 3.4, 3.3), c4ell(l.ax + (k ? 0.8 : -0.8), l.ay - 0.2, 4.1, 3.0)), M.nv); p.line([l.ax - 3, l.ay - 4], [l.ax + 3, l.ay - 4], M.ye[2]); p.line([l.ax - 3, l.ay - 3], [l.ax + 3, l.ay - 3], M.ye[1]); p.px(l.ax + (k ? 2 : -2), l.ay + 1.6, M.rd[2]); p.px(l.ax + (k ? 3 : -3), l.ay + 1.6, M.rd[1]);
  });
  const w1 = at(0.3, 0), w2 = at(0.72, 0); p.put(c4uni(c4cap(P[0], P[1], w1[0], w1[1], 5.6, 6.8), c4cap(w1[0], w1[1], w2[0], w2[1], 6.8, 8.8), c4cap(w2[0], w2[1], Nk[0], Nk[1], 8.8, 5.4)), M.gi);
  p.put(gkTri(at(0.99, -5.6), at(0.99, 5.6), at(0.34, 0.3)), M.bl, 1); p.put(gkTri(at(1.0, -3.8), at(1.0, 3.8), at(0.72, 0.2)), M.sk, 1);      // (the blue undershirt in the V of the gi, the bare chest above it)
  const sa = at(0.17, -6.2), sb = at(0.17, 6.2); p.put(c4cap(sa[0], sa[1], sb[0], sb[1], 2.3, 2.3), M.bl); const kn = at(0.12, 4.8); p.put(c4cap(kn[0], kn[1], kn[0] + 1.2, kn[1] + 4.6, 1.2, 0.8), M.bl, 1);      // (the sash and its two loose ends)
  p.put(c4cap(hd[0] - 0.6, hd[1] + 5.4, Nk[0] + 0.2, Nk[1] - 0.2, 2.6, 3.2), M.sk);
  drawArm(0); gkHead(p, hd[0], hd[1], o); drawArm(1); return p;
}
const c4xGokuF = o => c4xCv('gf', o, c4xDrawGokuF);
const c4xGoku = o => c4xCv('g', o, c4xDrawGoku);
const C4GG = C4G.GY - C4G.AH, C4GHY = C4GG - (C4G.L1 + C4G.L2) * 0.97;      // (the height of an ankle on the floor; the hip's height when he stands)
const c4xGokuPose = {
  stand(t) { const b = Math.sin(t * 2) * 0.3; return { x: 56, y: C4GHY + b * 0.4, lean: 2, hdx: 0.4, hdy: -5, hdt: 0, ex: 'calm', arms: [{ al: 8, el: 12 }, { al: -48, el: 116 - b * 2 }], legs: [{ ax: 49, ay: C4GG, a: 0 }, { ax: 64, ay: C4GG, a: 0 }] }; },      // (the picture's stance: the near fist on the hip)
  aim(t) { const b = Math.sin(t * 2) * 0.25; return { x: 55, y: C4GHY + 0.3 + b * 0.3, lean: -2, hdx: 0.6, hdy: -5.2, hdt: 0, ex: 'calm', palm: 1, arms: [{ al: 10, el: 14 }, { al: 54, el: 74 + b }], legs: [{ ax: 48, ay: C4GG, a: 0 }, { ax: 65, ay: C4GG, a: 0 }] }; },      // (the open hand held out to Yuji)
  windup() { return { x: 54, y: C4GHY + 2, lean: -9, hdx: 0.2, hdy: -5, hdt: -2, ex: 'serious', arms: [{ al: 50, el: 40 }, { al: -80, el: 120 }], legs: [{ ax: 46, ay: C4GG, a: 0 }, { ax: 68, ay: C4GG, a: 0 }] }; },      // (the fist drawn back to the ribs, the elbow behind him)
  punch() { return { x: 60, y: C4GHY + 5, lean: 22, hdx: 1.4, hdy: -4.8, hdt: 7, ex: 'serious', arms: [{ al: 10, el: 60 }, { al: 82, el: 8 }], legs: [{ ax: 42, ay: C4GG, a: 0 }, { ax: 72, ay: C4GG, a: 0 }] }; },      // (the blow: the arm straight out, the body behind it, the back leg stretched)
  idleF(t) { const b = Math.sin(t * 2) * 0.25; return { F: 1, x: 56, y: C4GHY + b * 0.3, lean: 0, hdx: 0.6, hdy: -5, ex: 'calm', arms: [{ a1: -32, a2: 22 }, { a1: 8, a2: 12 }] }; },      // (from the front: the left fist on the hip, the other arm loose)
  fingF(t) { const b = Math.sin(t * 2) * 0.25; return { F: 1, x: 56, y: C4GHY + b * 0.3, lean: 0, hdx: 0.6, hdy: -5, ex: 'closed', arms: [{ a1: -32, a2: 22 }, { a1: 128, a2: 208 }], fing: 250 }; },      // (instant transmission: two fingers on the forehead)
};
