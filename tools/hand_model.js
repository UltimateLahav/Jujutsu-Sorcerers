'use strict';
// ================================================================ hand_model.js: a hand made of shapes (see hand3d.js). Units are millimetres. The hand's own axes: +y toward the fingers, +z out of the back of the hand, +x toward the little finger (right hand: the thumb is at -x).
const H = require('./hand3d.js'), { add, sub, mul, norm, cross, mv, Rx, Rz, I3, cone, ell, ball, MAT } = H;
const FING = {
  index: { mcp: [-26, 92, 7], L: [40, 23, 19], r: [9.4, 8.5, 7.5, 6.5], ab: -0.05 },
  middle: { mcp: [-9, 96, 8], L: [44, 27, 20], r: [9.8, 8.9, 7.7, 6.7], ab: -0.01 },
  ring: { mcp: [9, 90, 7], L: [41, 25, 19], r: [9, 8.1, 7.1, 6.1], ab: 0.05 },
  pinky: { mcp: [25, 78, 4], L: [32, 19, 17], r: [8, 7.2, 6.3, 5.4], ab: 0.12 },
};
const ORDER = ['index', 'middle', 'ring', 'pinky'];
// o.side: 1 right hand, -1 left hand; o.R, o.T: the rotation and the place (of the wrist) in the world; o.f[name] = [mcp, pip, dip] bends (radians, + = toward the palm); o.ab[name] = a spread (radians, + = toward the little finger);
// o.off[name] = [dx, dy, dz] a finger pulled out of the hand (along its own way); o.skip = names of fingers that are not there; o.thumb = [dir1, dir2, dir3] (directions of its three bones); o.sleeve (false: none)
function buildHand(o) {
  const S = o.side || 1, R0 = o.R || I3, Rl = H.Ry(-S * (o.roll || 0)), R = H.mm(R0, Rl), T = o.T || [0, 0, 0], P = p => add(mv(R, [S * p[0], p[1], p[2]]), T), D = v => mv(R, [S * v[0], v[1], v[2]]), sh = [], tips = {}, joints = {}, frames = {}, skip = o.skip || [];
  const pk = (name, key) => (o[key] && o[key][name]) || null;
  // the body of the hand and the wrist
  if (!o.only) {
    sh.push(ell(P([0, 16, 0]), [29, 24, 15], R, MAT.skin, 14), ell(P([0, 62, 1]), [39, 38, 14.5], R, MAT.skin, 16), ell(P([0, -4, -1]), [26, 22, 16], R, MAT.skin, 12));
    for (const name of ORDER) { const F = FING[name], m = F.mcp; sh.push(cone(P([m[0] * 0.55, 34, 6]), P([m[0], m[1] - 2, 6.5]), 5.8, 6.4, MAT.skin, 6)); }
    sh.push(ell(P([-24, 40, -10]), [15, 26, 10], R, MAT.skin, 12), ell(P([24, 38, -8]), [11, 28, 9], R, MAT.skin, 12));      // (the muscles under the thumb and the little finger)
  }
  // the fingers
  for (const name of ORDER) {
    if (skip.includes(name) || (o.only && name !== o.only)) continue;
    const F = FING[name], f = pk(name, 'f') || [0, 0, 0], ab = F.ab + (pk(name, 'ab') || 0), off = pk(name, 'off') || [0, 0, 0], pts = [add(F.mcp, off)], dirs = [], norms = []; let th = 0;
    for (let i = 0; i < 3; i++) {
      th += f[i]; const da = [Math.sin(ab), Math.cos(ab), 0], d = [da[0] * Math.cos(th), da[1] * Math.cos(th), -Math.sin(th)], n = [da[0] * Math.sin(th), da[1] * Math.sin(th), Math.cos(th)];
      dirs.push(d); norms.push(n); pts.push(add(pts[i], mul(d, F.L[i])));
    }
    const W = pts.map(P); joints[name] = W; tips[name] = W[3];
    if (!o.only && (off[0] || off[1] || off[2])) { const m0 = F.mcp, m1 = pts[0], mid = [(m0[0] + m1[0]) / 2, (m0[1] + m1[1]) / 2, (m0[2] + m1[2]) / 2 + 0.5]; sh.push(cone(P(m0), P(mid), F.r[0] - 0.6, F.r[0] * 0.62, MAT.pale, 5), cone(P(mid), P(m1), F.r[0] * 0.62, F.r[0] * 0.86, MAT.pale, 5)); }      // (the skin of the hand stretches between the knuckle and the finger that is pulled out)
    sh.push(cone(W[0], W[1], F.r[0], F.r[1], MAT.skin, 7), cone(W[1], W[2], F.r[1], F.r[2], MAT.skin, 5), cone(W[2], W[3], F.r[2], F.r[3], MAT.skin, 4));
    if (!o.only) sh.push(ball(P(add(add(F.mcp, off), [0, -1, 3.2])), F.r[0] + 1.2, MAT.skin, 6));
    sh.push( ball(P(add(pts[1], mul(norms[0], 0.8))), F.r[1] + 0.2, MAT.skin, 4), ball(P(add(pts[2], mul(norms[1], 0.6))), F.r[2] + 0.1, MAT.skin, 4));
    // the nail: a flat ellipsoid on the back of the last bone
    const d3 = norm(D(dirs[2])), n3 = norm(D(norms[2])), a3 = norm(cross(n3, d3)), mid = add(W[2], mul(sub(W[3], W[2]), 0.48)), rm = (F.r[2] + F.r[3]) / 2, c = add(mid, mul(n3, rm - 0.55));
    sh.push(ell(c, [F.L[2] * 0.5, rm * 0.78, 1.5], [d3[0], a3[0], n3[0], d3[1], a3[1], n3[1], d3[2], a3[2], n3[2]], MAT.nail, 0));
    frames[name] = { d: d3, n: n3, a: a3 };
  }
  // the webs between the fingers
  for (let i = 0; i + 1 < ORDER.length && !o.only; i++) { const a = joints[ORDER[i]], b = joints[ORDER[i + 1]]; if (a && b) sh.push(cone(add(a[0], mul(sub(a[1], a[0]), 0.34)), add(b[0], mul(sub(b[1], b[0]), 0.34)), 6.4, 6.4, MAT.skin, 8)); }
  // the thumb
  if (o.noThumb || o.only) { if (o.sleeve !== false && !o.only) sh.push(cone(P([0, -8, 0]), P([0, -150, 0]), 33, 36, MAT.sleeve, 0), cone(P([0, -8, 0]), P([0, -16, 0]), 36.6, 36.6, MAT.sleeve, 0)); return { shapes: sh, tips, joints, frames, P, D }; }
  const tb = o.thumb || [[-0.5, 0.78, -0.2], [-0.3, 0.9, -0.2], [-0.2, 0.9, -0.1]], L2 = [46, 33, 27], r2 = [13, 11.5, 9.6, 8.2];
  let tp = [-18, 20, -3]; const TP = [P(tp)];
  for (let i = 0; i < 3; i++) { const d = norm(tb[i]); tp = add(tp, mul(d, L2[i])); TP.push(P(tp)); }
  sh.push(cone(TP[0], TP[1], r2[0], r2[1], MAT.skin, 12), cone(TP[1], TP[2], r2[1], r2[2], MAT.skin, 5), cone(TP[2], TP[3], r2[2], r2[3], MAT.skin, 4), ball(TP[1], r2[1] + 1, MAT.skin, 4));
  { const d3 = norm(sub(TP[3], TP[2])), up = norm(D([0.45, 0, 1])), n3 = norm(sub(up, mul(d3, H.dot(up, d3)))), a3 = norm(cross(n3, d3)), mid = add(TP[2], mul(sub(TP[3], TP[2]), 0.5));
    sh.push(ell(add(mid, mul(n3, r2[2] + 0.1)), [L2[2] * 0.5, 7.2, 1.6], [d3[0], a3[0], n3[0], d3[1], a3[1], n3[1], d3[2], a3[2], n3[2]], MAT.nail, 0)); tips.thumb = TP[3]; joints.thumb = TP; frames.thumb = { d: d3, n: n3, a: a3 }; }
  if (o.forearm) sh.push(cone(P([0, -6, 0]), P([0, -170, 0]), 25, 33, MAT.skin, 8));
  if (o.sleeve !== false) sh.push(cone(P([0, -8, 0]), P([0, -150, 0]), 33, 36, MAT.sleeve, 0), cone(P([0, -8, 0]), P([0, -16, 0]), 36.6, 36.6, MAT.sleeve, 0));
  return { shapes: sh, tips, joints, frames, P, D };
}
module.exports = { buildHand, FING, ORDER };
