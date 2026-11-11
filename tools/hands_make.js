'use strict';
// ================================================================ hands_make.js: makes the pictures of the hands of chapter 4 (tools/hands.json) with hand3d.js / hand_model.js.   node hands_make.js [grip|rip|finger|palm|all] [preview-folder]
// Each picture is 360 x 250 bytes: 0 - 3 = a shadow on what is behind (the face), 8 + = (material << 3) | tone (0 - 4, 5 = the dark line); faces.js turns them into colours (so the blood, the red of the cursed finger and the dark of the scene are chosen there).
const fs = require('fs'), H = require('./hand3d.js'), { buildHand } = require('./hand_model.js'), { add, sub, mul, norm, cross, cone, ell, ball, MAT } = H;
const W = 360, HT = 250, SC = 0.9, CAM = { w: W, h: HT, s: SC, ox: 180, oy: 125 }, scr = (p, cam) => { cam = cam || CAM; return [Math.round(cam.ox + p[0] * cam.s), Math.round(cam.oy - p[1] * cam.s)]; };
const BAY = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];
function pack(r) {      // the render -> bytes
  const out = new Uint8Array(r.w * r.h);
  for (let y = 0; y < r.h; y++) for (let x = 0; x < r.w; x++) { const i = y * r.w + x; if (r.hit[i]) out[i] = (r.mat[i] << 3) | r.lvl[i]; else { const v = r.shd[i] * 3, lo = Math.floor(v), f = v - lo; out[i] = Math.min(3, lo + (f > (BAY[(y & 3) * 4 + (x & 3)] + 0.5) / 16 ? 1 : 0)); } }
  return out;
}
function rle(b) { const o = []; let i = 0; while (i < b.length) { let j = i; while (j < b.length && b[j] === b[i] && j - i < 255) j++; o.push(b[i], j - i); i = j; } return Buffer.from(o).toString('base64'); }
// ---------------------------------------------------------------- the grip: his left hand holds Megumi's cheek (the little finger sticks out), the other hand pinches the little finger. pull 0 - 1: how far it is pulled out. torn q 0 - 1: it is off and the other hand lifts it away.
function chainShapes(pts, radii, nailN, mat) {      // a finger made of points (for the parts of a hand that are out of the picture)
  const sh = [], md = mat || MAT.skin;
  for (let i = 0; i + 1 < pts.length; i++) sh.push(cone(pts[i], pts[i + 1], radii[i], radii[i + 1], md, i ? 4 : 6));
  for (let i = 1; i + 1 < pts.length; i++) sh.push(ball(add(pts[i], mul(nailN || [0, 0, 1], 0.5)), radii[i] + 0.2, md, 4));
  return sh;
}
function raw(P, c, dir, r) {      // the raw end of a torn finger: red flesh, a ragged rim, the knob of the bone
  const sh = [ball(add(c, mul(dir, -1.2)), r * 0.92, MAT.flesh, 2), cone(add(c, mul(dir, -0.5)), add(c, mul(dir, 4.5)), r * 0.34, r * 0.4, MAT.bone, 0)], u = norm(cross(dir, [0, 0, 1])), v = norm(cross(dir, u));
  for (let k = 0; k < 7; k++) { const a = k / 7 * Math.PI * 2 + 0.4, off = add(mul(u, Math.cos(a) * r * 0.98), mul(v, Math.sin(a) * r * 0.98)); sh.push(ball(add(add(c, off), mul(dir, -1.6 + (k % 2) * 1.2)), 2.3 + (k % 3) * 0.5, MAT.pale, 1.5)); }
  return sh;
}
function grip(pull, q) {
  const torn = q !== undefined, R = H.mm(H.Ry(-0.3), H.Rz(Math.PI / 2)), pu = torn ? 1 : pull, dd = 44 * pu, ab = 0.2 + 0.1 * pu, dirv = [Math.sin(0.3) * dd, Math.cos(0.3) * dd, 0];
  const lo = { side: -1, R, roll: 0.7, T: [100, 22, 8], noThumb: true, f: { index: [0.25, 0.5, 0.35], middle: [0.28, 0.52, 0.35], ring: [0.25, 0.5, 0.35], pinky: [0.0, 0.08, 0.05] }, ab: { pinky: ab }, off: { pinky: dirv } };
  const left = buildHand(Object.assign({}, lo, torn ? { skip: ['pinky'], off: {} } : {})), pj = (buildHand(lo)).joints.pinky, sh = left.shapes.slice(), pp = add(pj[1], mul(sub(pj[2], pj[1]), 0.55));
  const mv0 = torn ? [-64 * q, -46 * q, 8 * q] : [0, 0, 0], Rr = H.mm(H.Ry(-0.15), H.Rz(0.8)), rp = { side: 1, R: Rr, roll: 0.2, f: { index: [0.3, 0.65, 0.4], middle: [1.2, 1.4, 0.8], ring: [1.2, 1.4, 0.8], pinky: [1.2, 1.4, 0.8] }, noThumb: true };
  const T0 = sub(add(pp, [0, 0, 9]), buildHand(Object.assign({}, rp, { T: [0, 0, 0] })).tips.index), right = buildHand(Object.assign({}, rp, { T: add(T0, mv0) }));
  sh.push(...right.shapes);
  let stump = null, fb = null;
  if (torn) {      // the finger in the pinch (its raw end and the raw hole in his hand are drawn by faces.js: it needs to know where they are)
    const pf = buildHand(Object.assign({}, lo, { T: add(lo.T, mv0), only: 'pinky' })); sh.push(...pf.shapes);
    const m0 = left.P(M_MCP), b0 = pf.joints.pinky[0], d1 = sub(pf.joints.pinky[1], b0), dn = norm(d1); stump = scr(add(m0, mul(dn, 7))).concat([Math.round(dn[0] * 100) / 100, Math.round(-dn[1] * 100) / 100]);
  }
  const tips = {}; for (const k of ['index', 'middle', 'ring']) tips[k] = scr(left.tips[k]);
  return { sh, meta: { tips, stump, fb, pp: scr(add(pp, mv0)) } };
}
const M_MCP = [25, 78, 4];
// ---------------------------------------------------------------- the ripped finger between the thumb and the first finger of the other hand (seen large), a black claw of length nl (0 - 1) growing out of its nail
const MCAM = { w: W, h: HT, s: 2.4, ox: 180, oy: 125 };
function macro(nl) {
  const R = H.mm(H.Ry(0.55), H.Rz(-Math.PI / 2)), o0 = { side: 1, R, only: 'pinky', f: { pinky: [0.05, 0.12, 0.1] }, ab: { pinky: -0.12 } }, probe = buildHand(Object.assign({ T: [0, 0, 0] }, o0));
  const T = sub([-46, 3, 8], probe.joints.pinky[0]), fin = buildHand(Object.assign({ T }, o0)), pj = fin.joints.pinky, b0 = pj[0], dir0 = norm(sub(pj[1], b0)), nOut = mul(dir0, -1), sh = [];
  const cut = [nOut[0], nOut[1], nOut[2], H.dot(nOut, b0)]; for (const x of fin.shapes) { if (x.mat !== MAT.nail) { x.clip = cut; x.mat = MAT.curse; } sh.push(x); }
  const u = norm(cross(nOut, [0, 0, 1])), v = norm(cross(nOut, u)), r0 = 8;
  sh.push(ell(add(b0, mul(nOut, 0.4)), [1.5, r0 * 0.98, r0 * 0.94], [nOut[0], u[0], v[0], nOut[1], u[1], v[1], nOut[2], u[2], v[2]], MAT.flesh, 0), cone(add(b0, mul(nOut, 0.5)), add(b0, mul(nOut, 4.2)), 2.4, 2.9, MAT.bone, 0));
  const rnd = i => { const x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
  for (let k = 0; k < 11; k++) { if (rnd(k + 3) < 0.22) continue; const a = k / 11 * Math.PI * 2 + rnd(k) * 0.5, rr = r0 * (0.8 + 0.22 * rnd(k + 20)), off = add(mul(u, Math.cos(a) * rr), mul(v, Math.sin(a) * rr * 0.96)); sh.push(ball(add(add(b0, off), mul(nOut, 0.1 + rnd(k + 40) * 1.2)), 1.4 + rnd(k + 60) * 1.8, MAT.pale, 1.4)); }
  if (nl > 0.05) { const d3 = fin.frames.pinky.d, n3 = fin.frames.pinky.n, rm = 6.2, a = add(add(pj[2], mul(sub(pj[3], pj[2]), 0.4)), mul(n3, rm - 0.6)), b = add(add(pj[3], mul(d3, nl * 62)), mul(n3, 0.2 - nl * 2.2)); sh.push(cone(a, b, 5.3, 0.45, MAT.claw, 0)); }
  const ix = [[22, -64, 8], [6, -40, 9], [-10, -18, 7], [-23, -9.5, 4.5]], th = [[30, 68, 6], [12, 46, 7], [-6, 24, 5.5], [-21, 10.5, 4]];
  sh.push(...chainShapes(ix, [9.8, 8.8, 7.6, 6.6], [0, 0, 1]), ...chainShapes(th, [12.8, 11, 9.2, 7.8], [0.3, 0.2, 0.9]));
  const nn = [0.3, 0.2, 0.93], d = norm(sub(th[3], th[2])), nrm = norm(sub(nn, mul(d, H.dot(nn, d)))), a3 = norm(cross(nrm, d)), mid = add(th[2], mul(sub(th[3], th[2]), 0.5));
  sh.push(ell(add(mid, mul(nrm, 8.1)), [10, 7.4, 1.7], [d[0], a3[0], nrm[0], d[1], a3[1], nrm[1], d[2], a3[2], nrm[2]], MAT.nail, 0));
  return { sh, meta: { base: scr(b0, MCAM) } };
}
function render(name, sc, opt, cam) {
  const t0 = Date.now(), r = H.render(sc.sh, cam || CAM, Object.assign({ shadowFace: true, face: -34 }, opt || {}));
  console.log(name, Date.now() - t0, 'ms'); return { r, bytes: pack(r), meta: sc.meta };
}
const PCAM = { w: W, h: HT, s: 1.0, ox: 180, oy: 125 };
function palm() {
  const R = H.mm(H.Rz(0.06), H.Ry(Math.PI)), hand = buildHand({ side: 1, R, T: [2, -118, 0], skip: ['pinky'], sleeve: false, forearm: true, f: { index: [0.12, 0.22, 0.16], middle: [0.14, 0.24, 0.16], ring: [0.14, 0.24, 0.16] }, ab: { index: -0.05, middle: 0.0, ring: 0.07 } });
  return { sh: hand.shapes, hand, meta: { stump: scr(hand.P([25, 78, -2]), PCAM) } };
}
function palmLines(r, hand, cam) {      // the lines of the palm and the creases of the fingers: a darker tone along them
  const put = (pts, drop) => { const q = pts.map(p => scr(hand.P(p), cam)); for (let i = 0; i + 1 < q.length; i++) { const [x0, y0] = q[i], [x1, y1] = q[i + 1], n = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0), 1); for (let k = 0; k <= n; k++) { const x = Math.round(x0 + (x1 - x0) * k / n), y = Math.round(y0 + (y1 - y0) * k / n), j = y * r.w + x; if (x < 0 || y < 0 || x >= r.w || y >= r.h || !r.hit[j] || r.mat[j] !== 1 || r.lvl[j] > 4) continue; r.lvl[j] = Math.max(0, r.lvl[j] - drop); } } };
  for (const l of [[[36, 54], [22, 60], [4, 64], [-14, 68], [-28, 74]], [[-30, 52], [-14, 48], [6, 44], [26, 40]], [[-12, 64], [-21, 52], [-26, 38], [-24, 24], [-17, 12]]]) put(l.map(q => [q[0], q[1], -14]), 2);
  for (const nm of ['index', 'middle', 'ring']) { const J = hand.joints[nm]; for (const k of [1, 2]) { const a = J[k], d = H.norm(H.sub(J[k + 1], J[k - 1])), side = H.norm(H.cross(d, [0, 0, 1])); put([H.add(a, H.mul(side, -6)), H.add(a, H.mul(side, 6))], 2); } }
}
module.exports = { grip, macro, palm, render, pack, rle, scr, CAM, MCAM };
if (require.main === module) {
  const which = process.argv[2] || 'all', prev = process.argv[3], frames = {}, put = (k, o) => { frames[k] = { d: rle(o.bytes), m: o.meta }; if (prev) { const rgba = H.toRGBA(o.r, '#000000'); for (let i = 0; i < W * HT; i++) rgba[i * 4 + 3] = o.r.hit[i] ? 255 : Math.round(o.r.shd[i] * 140); fs.writeFileSync(prev + '/' + k + '.png', H.png(W, HT, rgba, 1)); } };
  if (which === 'all' || which === 'grip') for (let i = 0; i <= 8; i++) put('g' + i, render('g' + i, grip(i / 8)));
  if (which === 'all' || which === 'rip') for (let i = 0; i <= 6; i++) put('t' + i, render('t' + i, grip(1, i / 6)));
  if (which === 'all' || which === 'palm') { const sc = palm(), r = H.render(sc.sh, PCAM, { shadowFace: false, smooth: 2 }); palmLines(r, sc.hand, PCAM); put('y0', { r, bytes: pack(r), meta: sc.meta }); }
  if (which === 'all' || which === 'finger') for (let i = 0; i <= 8; i++) put('f' + i, render('f' + i, macro(i / 8), { face: -60, shadowFace: false }, MCAM));
  const old = fs.existsSync('hands.json') ? JSON.parse(fs.readFileSync('hands.json', 'utf8')) : { w: W, h: HT, f: {} }; Object.assign(old.f, frames); fs.writeFileSync('hands.json', JSON.stringify(old)); console.log('wrote hands.json', JSON.stringify(old).length, 'bytes');
}
