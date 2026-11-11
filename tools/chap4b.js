// ================================================================ v1.147 CHAPTER 4: THE VESSEL, PART 2 (199.4 - 346.6 s). It goes on from the clamp of part 1 without a break: the left hand leaves his pocket and takes the little finger of the right hand, the RIP (216 s),
// the finger turns red with a long black nail, Megumi's jaw is forced open, the finger goes in (237 - 241 s), the muffled scream (250.8 s), the swallow, Sukuna lets go and Megumi falls to his knees, his head hangs, Sukuna leaves Yuji's body (hair pink -> orange, the marks fade),
// Yuji sees his missing finger, steps back and whispers "Fushiguro...?", a long silence, and then Megumi lifts his head: Sukuna's smile, his marks and his red eyes (the loudest swell, 342.5 s). A hard cut to black on the last swell (346.6 s), then the saves.
// Every shot is a function of the song time T and starts and ends on a swell of the organ (C15B). The art is made in tools/faces.js (c15Faces: face, eye, mouth, neck, hair, hands, finger, yhand).
const C15B = [[199.4, 'hold'], [205.8, 'eyeL'], [210.5, 'grip'], [216.0, 'rip'], [218.5, 'finger'], [224.5, 'sukL'], [229.2, 'mouthOpen'], [232.0, 'approach'], [237.5, 'shove'], [241.2, 'gag'], [245.5, 'spasm'], [250.8, 'scream'], [254.8, 'gulp'], [258.5, 'fall'], [262.8, 'down'], [271.2, 'turn'], [278.2, 'stump'], [281.2, 'yeye'], [284.0, 'step'], [286.0, 'yhorror'], [292.0, 'whisper'], [301.5, 'silence'], [312.0, 'hand'], [320.2, 'yface'], [326.5, 'lift1'], [332.0, 'yeye2'], [337.0, 'reveal'], [342.5, 'smile']];
function c15BShot(T) { let k = 0; while (k + 1 < C15B.length && T >= C15B[k + 1][0]) k++; const a = C15B[k][0], b = k + 1 < C15B.length ? C15B[k + 1][0] : C15.black; return { id: C15B[k][1], t0: a, t1: b, u: c15Cl((T - a) / (b - a), 0, 1) }; }
const c15BGore = () => typeof SET !== 'undefined' && SET.gore === 0;      // (blood only when GRAPHIC DAMAGE is FULL)
const c15BOff = () => typeof SET !== 'undefined' && SET.gore === 2;      // (OFF: the rip is hidden)
let c15BWi = 0;      // (how many of the pictures of the hands are made: they are made one by one in the shot before, so that no frame has to wait for one)
function c15BWarmHands(T) {
  if (T < 206) c15BWi = 0; if (c15BWi >= 21 || c15BWi > (T - 205.8) / 0.2) return; const i = c15BWi++;
  if (i < 13) c15Faces.hands({ pull: i / 12 }); else c15Faces.hands({ torn: 1, pull: (4 + i - 13) / 12, blood: c15BGore() ? 1 : 0 });
}
const c15BQ = (v, n) => Math.round(v * n) / n;      // (a number cut into steps, so that the pictures of the close-ups are made once and kept)
const c15BSlow = (rt, len, k) => rt < len ? rt * k : len * k + (rt - len);      // (slow motion for len seconds at k times the speed, then normal)
const C15BB = (() => { const o = []; let t = 199.6; while (t < 346.4) { o.push(t); t += t < 216 ? 0.62 - 0.12 * c15S(t, 199, 216) : t < 250.8 ? 0.46 : t < 258.5 ? 0.36 : t < 301.5 ? 0.9 : t < 326.5 ? 1.25 : 1.0 - 0.5 * c15S(t, 326.5, 342.5); } return o; })();      // (his heart: faster to the rip and the scream, slow in the silence, then faster and faster to the smile)
const c15BHeart = T => { let b = 0; for (const t of C15BB) { const d = T - t; if (d >= 0 && d < 0.4) b = Math.max(b, 1 - d / 0.4); else if (d < 0) break; } return b; };
function c15BVig(T, a0, red) { const hb = c15BHeart(T), vg = ctx.createRadialGradient(VW / 2, VH / 2, VH * 0.4, VW / 2, VH / 2, VH * 1.0); vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(' + red + ',0,8,' + Math.min(0.95, a0 + 0.2 * hb).toFixed(2) + ')'); ctx.fillStyle = vg; ctx.fillRect(0, 0, VW, VH); }
function c15BLook(T, a0, red, tint, emb) { c15BVig(T, a0, red); if (tint) { ctx.fillStyle = 'rgba(110,10,24,' + tint + ')'; ctx.fillRect(0, 0, VW, VH); } if (emb) c15Embers(T, emb, '255,100,70', 1); }
function c15BBack(col, glow) { ctx.fillStyle = col; ctx.fillRect(0, 0, VW, VH); if (glow) { const g = ctx.createRadialGradient(VW / 2, VH * 0.6, 10, VW / 2, VH * 0.6, 190); g.addColorStop(0, glow); g.addColorStop(1, 'rgba(0,0,0,0)'); ctx.fillStyle = g; ctx.fillRect(0, 0, VW, VH); } }
function c15BPic(im, dx, dy) { ctx.drawImage(im, Math.round(VW / 2 - im.width / 2 + dx), Math.round(VH / 2 - im.height / 2 + dy)); }      // (a close-up picture of tools/faces.js (360 x 250) 1 : 1, in the middle of the screen)
const c15BMouth = (o, dx, dy) => c15BPic(c15Faces.mouth(o), dx, dy);      // (the lower face with the mouth forced open)
function c15BFace(o, dx, dy, fy) { const im = c15Faces.face(o); ctx.drawImage(im, Math.round((VW - im.width) / 2 + dx), Math.round(VH / 2 - (fy === undefined ? c15Faces.FY : fy) + dy)); }      // (a face from tools/faces.js, 1 picture pixel = 1 game pixel, the row fy of it in the middle of the screen)
const c15BTr = (T, a, f) => [Math.round(Math.sin(T * (f || 29)) * a), Math.round(Math.cos(T * (f || 29) * 1.3) * a)];      // (a tremble)
const c15BNarrow = k => Math.round(Math.max(0, 285 - VW) * k);      // (on a narrower screen (16:9) the pictures that are wider than it are pushed over so the hands, the finger and its nail stay in view)
function c15BPos() { const f = c15CFin(story.c15.ct); return { xs: f.xSF, xm: f.xMF + 4 }; }

// ---- the two of them on the roof
const C15BHANG = [{ al: 8, el: 14 }, { al: 16, el: 18 }];
function c15BLimp(o, k, jit, T) { o.arms = o.arms.map((u, i) => ({ al: c15Lerp(u.al, C15BHANG[i].al, k) + jit * Math.sin(T * 17 + i * 2), el: c15Lerp(u.el, C15BHANG[i].el, k) })); return o; }      // (from 229 s his hands let go of the wrist: the arms hang and shake)
function c15BMeg(T) {      // Megumi: { x, lift, pose }: held by the jaw, shaking, then on his knees with his head down; from 326.5 s the head comes up
  const { xm } = c15BPos();
  if (T < 245.5) return { x: xm, lift: 4, pose: c15BLimp(c15MegPoses.grabbed(T), c15E(c15S(T, 229.2, 231)), 0, T) };
  if (T < 258.5) { const a = c15Cl((T - 245.5) / 4, 0, 1); return { x: xm, lift: 4 + 2 * Math.sin(T * 9) * a, pose: c15BLimp(c15MegPoses.convulse(T, 0.3 + 0.7 * a), 1, 12 * a, T) }; }
  if (T < 260.7) { const u = c15E((T - 258.5) / 2.2); return { x: xm - 6 * u, lift: 4 * (1 - u), pose: c15MegMixPose(c15BLimp(c15MegPoses.convulse(258.5, 0.25), 1, 0, 258.5), c15MegPoses.collapse(T), u) }; }
  if (T < 326.5) return { x: xm - 6, lift: 0, pose: c15MegPoses.collapse(T) };
  return { x: xm - 6, lift: 0, pose: c15MegPoses.lift(c15E(c15S(T, 326.5, 337))) };
}
function c15BPts(T) { const M = c15BMeg(T), mp = c15MegPts(M.pose), W = q => [M.x + (q[0] - 32), -M.lift + (q[1] - 70)]; return { M, jw: W(mp.jaw), hd: W(mp.hd) }; }      // (Megumi's jaw and head in the world)
function c15BSukX(T) { const { xs } = c15BPos(); return T < 284 ? xs : T < 286 ? xs + 14 * c15E((T - 284) / 2) : T < 305.8 ? xs + 14 : T < 307.0 ? xs + 14 - 6 * c15E((T - 305.8) / 1.2) : T < 326.5 ? xs + 8 : xs + 8 + 6 * c15E(c15S(T, 326.5, 331)); }
const C15BH = (x, jw) => [[199.4, [x - 4, -25]], [205.8, [x - 6, -35]], [213.0, [jw[0] + 6, jw[1] + 3]], [216.0, [jw[0] + 6.5, jw[1] + 3]], [216.5, [x - 3, -37]], [218.5, [x - 8, -40]], [229.2, [x - 8, -40]], [237.5, [jw[0] + 1, jw[1] - 1]], [241.2, [jw[0] + 3, jw[1] - 1]]];      // (where his far hand is: the pocket, the chest, the little finger of the other hand, snapped back with the finger, held up, Megumi's mouth)
function c15BHand(T, x, jw) {
  const W = C15BH(x, jw); if (T <= W[0][0]) return W[0][1]; for (let i = 1; i < W.length; i++) if (T < W[i][0]) { const a = W[i - 1], b = W[i], k = c15E((T - a[0]) / (b[0] - a[0])); return [c15Lerp(a[1][0], b[1][0], k), c15Lerp(a[1][1], b[1][1], k)]; }
  return W[W.length - 1][1];
}
function c15BSuk(T) {      // Sukuna, and from 271 s Yuji: { x, pose }, always facing left; the far hand goes from the pocket to the little finger of the other hand, away with it, to Megumi's mouth; the near hand is on his jaw until he lets go
  const x = c15BSukX(T), { jw, hd } = c15BPts(T), toPic = (wx, wy) => [32 - (wx - x), 70 + wy], yj = c15E(c15S(T, 271.2, 278.2));
  if (T < 258.5) {
    const o = JSON.parse(JSON.stringify(c15SukPoses.stand(T))); o.lean = 9; o.hdt = 12; o.ex = T < 216 ? 'calm' : 'smirk'; c15SukKit.reach(o, 1, ...toPic(jw[0], jw[1]));
    if (T > 199.7) { const h = c15BHand(T, x, jw); c15SukKit.reach(o, 0, ...toPic(h[0], h[1])); o.front = 1; }
    return { x, pose: o };
  }
  const base = c15SukMix(c15BSuk(258.4).pose, c15SukPoses.drop(T), c15E(c15S(T, 258.5, 259.4)));
  if (T < 278.2) { base.yj = yj; base.ex = yj > 0.5 ? 'calm' : 'smirk'; return { x, pose: base }; }
  if (T < 284) { const o = JSON.parse(JSON.stringify(base)); c15SukKit.reach(o, 1, ...toPic(x - 7, -45)); o.yj = 1; o.ex = T < 281 ? 'calm' : 'horror'; o.hdt = 14; return { x, pose: o }; }
  if (T < 286) return { x, pose: c15SukPoses.backstep(Math.round(c15E((T - 284) / 2) * 12) / 12) };
  const o = c15SukPoses.horror(T);
  if (T >= 298.8 && T < 329) { const k = c15E(c15S(T, 298.8, 301.5)) * (1 - c15E(c15S(T, 326.5, 329))), q = JSON.parse(JSON.stringify(o)), tr = T > 301.5 ? 0.5 : 0; c15SukKit.reach(q, 1, ...toPic(hd[0] + 7 + Math.sin(T * 13) * tr, hd[1] + 6 + Math.cos(T * 11) * tr)); o.arms = [o.arms[0], { al: c15Lerp(o.arms[1].al, q.arms[1].al, k), el: c15Lerp(o.arms[1].el, q.arms[1].el, k) }]; }
  return { x, pose: o };
}
function c15BFinger(T, x, jw) {      // the finger with its black nail in his far hand (in the world), from the rip until it is in Megumi's mouth
  if (T < 216.4 || T >= 241) return; const h = c15BHand(T, x, jw), hx = Math.round(h[0]), hy = Math.round(h[1]);
  ctx.fillStyle = '#a01c28'; ctx.fillRect(hx - 8, hy - 1, 8, 2); ctx.fillStyle = '#e0606a'; ctx.fillRect(hx - 8, hy - 1, 8, 1); ctx.fillStyle = '#0a0610'; ctx.fillRect(hx - 12, hy - 1, 4, 2); ctx.fillStyle = '#4a3a60'; ctx.fillRect(hx - 12, hy - 1, 4, 1);
}
function c15BActors(T, extra) {
  const { M, jw } = c15BPts(T), s = c15BSuk(T); ctx.fillStyle = 'rgba(0,0,0,0.4)'; ctx.fillRect(Math.round(M.x - 9), 0, 18, 2); ctx.fillRect(Math.round(s.x - 10), 0, 20, 2);
  M.pose.blood = c15BGore() ? 0.7 : 0; c15Sprite(c15Meg(M.pose), M.x, -M.lift, false, C15MG.BASE); c15Sprite(c15Suk(s.pose), s.x, 0, true, 70); c15BFinger(T, s.x, jw); if (extra) extra(M, s);
}
function c15BWorld(T, cam, extra) { c15CWorld(T, cam, () => c15BActors(T, extra)); }

// ---- the close-ups
function c15BEye(T, o) {      // an eye, large (Megumi's, or Yuji's with o.who = 'yuji'; tools/faces.js): o.lid, o.pr (the pupil), o.look [x, y], o.red, o.veins, o.refl (1: Sukuna's face in it, 2: Megumi's), o.sweat, o.circles (dark rings under the eye), o.dead (no light in the eye), o.pale (the skin loses its blood), o.br / o.bw / o.bf (the brow), o.fp (the fingers on the cheek), o.tr (how much it shakes), o.row (the screen row of the eye), o.dx, o.dy
  c15BBack('#080408'); const lk = o.look || [0, 0], im = c15Faces.eye({ who: o.who, lid: c15BQ(o.lid || 0, 10), pr: c15BQ(o.pr === undefined ? 3.2 : o.pr, 2), look: [c15BQ(lk[0], 1), c15BQ(lk[1], 1)], red: c15BQ(o.red || 0, 5), veins: c15BQ(o.veins || 0, 4), refl: o.refl || 0, circles: c15BQ(o.circles || 0, 4), dead: o.dead ? 1 : 0, pale: c15BQ(o.pale || 0, 4), sweat: c15BQ(o.sweat || 0, 5), br: c15BQ(o.br || 0, 1), bw: c15BQ(o.bw || 0, 1), bf: c15BQ(o.bf || 0, 1), fp: c15BQ(o.fp || 0, 4) }), [tx, ty] = c15BTr(T, o.tr || 0, 17);
  ctx.drawImage(im, Math.round(VW / 2 - 174 + (o.dx || 0) + tx), Math.round((o.row || 66) - 150 + (o.dy || 0) + ty)); ctx.fillStyle = 'rgba(10,2,14,' + (o.dark === undefined ? 0.12 : o.dark) + ')'; ctx.fillRect(0, 0, VW, VH);
  const g = ctx.createLinearGradient(VW * 0.5, 0, VW, 0); g.addColorStop(0, 'rgba(200,20,40,0)'); g.addColorStop(1, 'rgba(200,20,40,' + (o.who === 'yuji' ? 0.1 : 0.26) + ')'); ctx.fillStyle = g; ctx.fillRect(0, 0, VW, VH);
  c15Embers(T, 16, '255,90,70', 1);
}
function c15BSpray(x, y, te, n, sp, seed) {      // blood in the air (FULL only): droplets thrown up and out of (x, y) that fall back, te seconds after the burst
  if (te <= 0 || te > 2.2 || !c15BGore()) return; ctx.fillStyle = '#b8121c';
  for (let i = 0; i < n; i++) { const a = -Math.PI * (0.05 + 0.9 * c4R(i, seed)), v = sp * (0.4 + 0.9 * c4R(i, seed + 1)); ctx.fillRect(Math.round(x + Math.cos(a) * v * te), Math.round(y + Math.sin(a) * v * te + 150 * te * te), 1 + (i % 3 === 0 ? 1 : 0), 1 + (i % 4 === 0 ? 1 : 0)); }
}
function c15BRings(T, x, y, t0, col) {      // the ripples of a scream, one every half second
  ctx.lineWidth = 1; for (let k = 0; k < 4; k++) { const u = ((T - t0) * 2 + k * 0.5) % 2 / 2, a = (1 - u) * 0.35; ctx.strokeStyle = 'rgba(' + col + ',' + a.toFixed(2) + ')'; ctx.beginPath(); ctx.ellipse(x, y, 10 + u * 120, 6 + u * 80, 0, 0, 7); ctx.stroke(); }
}
const c15BCam = (x, y, z, row) => ({ x: Math.round(x), y: Math.round(y + (95 - row) / z), z });      // (a camera that puts the world point (x, y) on the screen row `row`; the camera's own y is the point on row 95)
function c15BMid() { const { xs, xm } = c15BPos(); return (xs + xm) / 2; }

const C15BD = {
  hold(T, sh) {      // 199.4 - 205.8: the two of them on the roof; his left hand comes out of his pocket
    const e = c15E(sh.u); c15BWorld(T, { x: c15BMid() - 2, y: c15Lerp(-26, -38, e), z: c15Lerp(1.7, 2.3, e) }); c15BLook(T, 0.55, 50, 0.16, 18);
  },
  eyeL(T, sh) {      // 205.8 - 210.5: his eye follows the hand; its shadow comes across his face
    const u = sh.u; c15BWarmHands(T); c15BEye(T, { lid: -0.1 - 0.1 * c15E(u), pr: 3.6 - 1.2 * u, look: [-5.5 * c15E(c15S(T, 206.4, 208.4)), 0.5], veins: 0.4 + 0.4 * u, circles: 0.4 + 0.3 * u, pale: 0.3 + 0.3 * u, sweat: 1 + u * 0.5, bf: 2, tr: 0.7, fp: 1, row: 58, dx: Math.round(-4 * u) });
    const k = c15E(c15S(T, 208.4, 210.3)); if (k > 0) { const g = ctx.createLinearGradient(0, 0, VW * 0.95 * k, 0); g.addColorStop(0, 'rgba(0,0,0,0.92)'); g.addColorStop(1, 'rgba(0,0,0,0)'); ctx.fillStyle = g; ctx.fillRect(0, 0, VW, VH); }
    c15BVig(T, 0.55, 60);
  },
  grip(T, sh) {      // 210.5 - 216.0: his hand on Megumi's jaw, the other hand takes the little finger and pulls
    const u = sh.u, tr = 0.4 + 1.6 * u * u, [tx, ty] = c15BTr(T, tr, 31);
    c15BBack('#0a0508', 'rgba(150,22,34,0.35)'); c15BPic(c15Faces.hands({ pull: c15BQ(c15E(c15S(T, 210.9, 215.9)), 12) }), -6 - c15BNarrow(0.5) + tx, ty); ctx.fillStyle = 'rgba(10,2,14,0.1)'; ctx.fillRect(0, 0, VW, VH); c15BLook(T, 0.55 + 0.15 * u, 60, 0, 14);
  },
  rip(T) {      // 216.0 - 218.5: it comes off (a stop frame, a white flash, blood in slow motion); OFF: a short black cut instead
    const rt = T - 216; if (c15BOff() && rt < 0.55) { ctx.fillStyle = '#000'; ctx.fillRect(0, 0, VW, VH); return; }
    const full = c15BGore(), stop = rt < 0.16, [tx, ty] = c15BTr(T, stop ? 3 : 1.2, 47), pull = stop ? 1 : c15BQ(0.35 + 0.55 * c15E(c15S(T, 216.3, 218.3)), 12);
    c15BBack('#0a0508', 'rgba(170,22,34,0.5)'); c15BPic(c15Faces.hands(stop ? { pull: 1 } : { torn: 1, pull, blood: full ? 1 : 0 }), -6 - c15BNarrow(0.5) + tx, ty);
    if (!stop) c15BSpray(VW / 2 + 14 - c15BNarrow(0.5), VH / 2 - 16, c15BSlow(rt - 0.16, 1.4, 0.3), 26, 90, 5); c15BLook(T, 0.6, 90, full ? 0.1 + 0.2 * Math.max(0, 1 - rt) : 0.05, 16);
  },
  finger(T) {      // 218.5 - 224.5: the finger in his fingers: it turns red and the black nail grows long
    const red = c15BQ(c15E(c15S(T, 219.2, 222.0)), 12), nl = c15BQ(c15E(c15S(T, 221.2, 224.2)), 12), full = c15BGore(), [tx, ty] = c15BTr(T, 0.7, 23);
    c15BBack('#10060a'); c15BPic(c15Faces.finger({ red, nl, blood: full ? 1 : 0 }), tx - c15BNarrow(0.25), ty); ctx.fillStyle = 'rgba(200,20,40,' + (0.1 * red).toFixed(2) + ')'; ctx.fillRect(0, 0, VW, VH);
    if (full) { const ox = Math.round(VW / 2 - 180) + tx - c15BNarrow(0.25); for (const t0 of [219.0, 220.4, 221.9, 223.1]) { const te = T - t0; if (te > 0 && te < 1.4) { ctx.fillStyle = '#b8121c'; ctx.fillRect(ox + 62 + Math.round(c4R(t0 * 10, 3) * 8), Math.round(VH / 2 + 24 + 90 * te * te) + ty, 2, 3); } } }
    c15BLook(T, 0.5, 80, 0, 22);
  },
  sukL(T, sh) {      // 224.5 - 229.2: his face: calm, red eyes, the second pair of eyes; the smile comes slowly
    const u = sh.u, lid = c15BQ(0.6 - 0.25 * c15E(c15S(T, 226.8, 228.2)), 10), [tx, ty] = c15BTr(T, 0.5, 11);
    c15BBack('#0c0306', 'rgba(150,22,34,0.5)'); c15BFace({ who: 'suk', m: T < 227.4 ? 'smirk' : 'smile', lid, e2: 0.9 }, tx, ty + Math.round(8 - 8 * c15E(u))); ctx.fillStyle = 'rgba(8,0,10,0.07)'; ctx.fillRect(0, 0, VW, VH); c15BLook(T, 0.7, 80, 0, 26);
  },
  mouthOpen(T) {      // 229.2 - 232.0: his jaw is forced open
    const [tx, ty] = c15BTr(T, 1.2, 37), op = c15E(c15S(T, 229.4, 231.4)); c15BBack('#140a10'); c15BMouth({ mo: c15BQ(0.15 + 0.85 * op, 20), mw: Math.round(22 + 5 * op), pale: c15BQ(0.6 * c15S(T, 229.4, 232), 4), spit: c15BQ(c15S(T, 230.2, 232), 5) }, tx, ty); ctx.fillStyle = 'rgba(10,2,14,0.08)'; ctx.fillRect(0, 0, VW, VH); c15BLook(T, 0.6, 60, 0, 12);
  },
  approach(T, sh) {      // 232.0 - 237.5: from the side: the finger comes towards his mouth
    const { jw } = c15BPts(T); c15BWorld(T, c15BCam(jw[0] + 3, jw[1], 3, 62)); c15BLook(T, 0.62 + 0.1 * sh.u, 50, 0.12, 14);
  },
  shove(T) {      // 237.5 - 241.2: the finger creeps in (slow motion) until the nail touches his lip, then it is pushed in
    const fin = T < 239.6 ? 0.12 + 0.33 * c15E((T - 237.5) / 2.1) : 0.45 + 0.55 * c15E((T - 239.6) / 0.7), [tx, ty] = c15BTr(T, 0.8 + 1.6 * c15S(T, 238, 240.5), 33);
    c15BBack('#140a10'); c15BMouth({ mo: 1, mw: 28, fin: c15BQ(fin, 25), pale: 0.8, spit: 1 }, tx, ty); ctx.fillStyle = 'rgba(10,2,14,0.08)'; ctx.fillRect(0, 0, VW, VH); c15BLook(T, 0.65, 90, 0.08, 14);
  },
  gag(T, sh) {      // 241.2 - 245.5: his eye: he gags
    const u = sh.u; c15BEye(T, { lid: -0.1 - 0.2 * Math.abs(Math.sin(T * 5.2)), pr: 2.4 - 1.3 * c15S(T, 241.5, 244), look: [0, -1], veins: 0.6 + 0.4 * c15S(T, 241.5, 243), circles: 0.5 + 0.5 * u, pale: 0.5 + 0.4 * u, dead: T > 243.2 ? 1 : 0, sweat: 1.3 + 0.5 * u, bf: 5, tr: 1.4, fp: 1, row: 52 }); c15BVig(T, 0.6, 70);
  },
  spasm(T, sh) {      // 245.5 - 250.8: all of him shakes in his grip
    c15BWorld(T, { x: c15BMid() - 4, y: -30, z: c15Lerp(1.9, 1.7, sh.u) }); c15BLook(T, 0.62, 80, 0.14, 22);
  },
  scream(T) {      // 250.8 - 254.8: the scream under the organ
    const a = Math.min(c15S(T, 250.8, 251.6), c15S(T, 254.8, 254.0)), [tx, ty] = c15BTr(T, 0.6 + 2.2 * a, 43);
    c15BBack('#10060a', 'rgba(170,22,34,0.45)'); c15BRings(T, VW / 2, 84, 250.8, '230,60,70'); c15BFace({ who: 'meg', m: 'scream', mo: c15BQ(0.75 + 0.25 * Math.sin(T * 11), 8), lid: -0.8, pr: 1.5, bw: 5, br: 2, veins: 1, circles: 1, pale: 0.8, dead: 1, sweat: 1 }, tx, ty);
    c15BLook(T, 0.65, 100, 0.12, 20);
  },
  gulp(T) {      // 254.8 - 258.5: he swallows: the lump goes down his throat
    const g = c15BQ(c15E(c15S(T, 255.2, 257.7)), 30), [tx, ty] = c15BTr(T, 0.9, 27); c15BBack('#140a10'); c15BPic(c15Faces.neck({ g, strain: 1, sweat: c15BQ(c15S(T, 254.8, 258), 5), drool: c15BQ(c15S(T, 255, 258), 5) }), tx, ty - Math.round(44 * g)); ctx.fillStyle = 'rgba(10,2,14,0.08)'; ctx.fillRect(0, 0, VW, VH); c15BLook(T, 0.6, 70, 0, 12);
  },
  fall(T, sh) {      // 258.5 - 262.8: he lets go; Megumi falls to his knees
    c15BWorld(T, { x: c15BMid() - 6, y: c15Lerp(-34, -22, c15E(sh.u)), z: 2.2 }); c15BLook(T, 0.6, 60, 0.1, 12);
  },
  down(T, sh) {      // 262.8 - 271.2: his head hangs, the hair over his face, a drop falls
    const [tx, ty] = c15BTr(T, 0.4, 7); c15BBack('#10060a'); c15BPic(c15Faces.hair({ sway: c15BQ(1.6 * Math.sin(T * 0.9), 4) }), tx, Math.round(30 * (1 - c15E(sh.u * 2))) + ty - 30);
    for (const t0 of [264.6, 267.6, 270.0]) { const te = T - t0; if (te > 0 && te < 2.2) { ctx.fillStyle = c15BGore() ? '#b8121c' : '#cfe8f4'; ctx.fillRect(Math.round(VW / 2 + 12 + c4R(t0, 5) * 24), Math.round(VH * 0.5 + 24 + 40 * te * te), 2, 3); } }
    c15BLook(T, 0.65, 40, 0, 10);
  },
  turn(T, sh) {      // 271.2 - 278.2: his face: Sukuna leaves, Yuji is there (the hair stays pink)
    const yj = c15BQ(c15E(c15S(T, 272.0, 277.0)), 20), mk = c15BQ(c15Cl(1 - yj * 1.6, 0, 1), 20), e2 = c15BQ(c15Cl(0.9 - yj * 1.8, 0, 0.9), 20), [tx, ty] = c15BTr(T, 0.5, 9);
    c15BBack('#0c0306', yj < 0.5 ? 'rgba(150,22,34,0.4)' : 'rgba(160,110,50,0.3)'); c15BFace({ who: 'yuji', ey: yj, red: 1 - yj, marks: mk, e2, m: yj < 0.4 ? 'smirk' : 'slack', lid: c15BQ(0.35 - 0.85 * yj, 10), pale: c15BQ(0.8 * yj, 4), circles: c15BQ(0.9 * yj, 4), veins: c15BQ(yj, 4), pr: c15BQ(3 - 1.4 * yj, 4) }, tx, ty); ctx.fillStyle = 'rgba(8,0,10,0.07)'; ctx.fillRect(0, 0, VW, VH); c15BLook(T, 0.6 - 0.2 * sh.u, 70, 0, 18);
  },
  stump(T) {      // 278.2 - 281.2: his hand; the little finger is gone
    const rise = Math.round(46 * (1 - c15E(c15S(T, 278.2, 279.1)))), [tx, ty] = c15BTr(T, 1.1, 21);
    c15BBack('#120608'); c15BPic(c15Faces.yhand({ blood: c15BGore() ? 1 : 0 }), tx, rise + ty); ctx.fillStyle = 'rgba(40,20,10,0.18)'; ctx.fillRect(0, 0, VW, VH); c15BLook(T, 0.55, 60, 0, 10);
  },
  yeye(T, sh) {      // 281.2 - 284.0: Yuji's eye, wide
    const u = sh.u; c15BEye(T, { who: 'yuji', lid: -0.9, pr: 1.1, look: [-3 * (1 - c15E(c15S(T, 281.2, 282.6))), 1], veins: 1, circles: 0.9, pale: 0.7, dead: 1, sweat: 1 + 0.6 * u, br: 6, bw: 5, tr: 1.6, dark: 0.1, row: 84 }); c15BVig(T, 0.55, 60);
  },
  step(T) {      // 284.0 - 286.0: he steps back
    c15BWorld(T, { x: c15BMid() + 8, y: -30, z: 2.1 }); c15BLook(T, 0.55, 40, 0.06, 10);
  },
  yhorror(T, sh) {      // 286.0 - 292.0: Yuji's face, frightened
    const [tx, ty] = c15BTr(T, 1.3, 19); c15BBack('#0e0606', 'rgba(160,110,50,0.25)'); c15BFace({ who: 'yuji', m: 'horror', mo: c15BQ(0.5 + 0.1 * Math.sin(T * 8), 8), lid: -0.9, pr: 1.5, bw: 6, veins: 1, circles: 1, pale: 0.85, dead: 1, sweat: c15BQ(1 + 0.8 * sh.u, 10) }, tx, ty); ctx.fillStyle = 'rgba(8,0,10,0.07)'; ctx.fillRect(0, 0, VW, VH); c15BLook(T, 0.6, 60, 0, 12);
  },
  whisper(T, sh) {      // 292.0 - 301.5: "Fushiguro...?"; his hand reaches out
    c15BWorld(T, { x: c15BMid() + 4, y: -30, z: c15Lerp(1.9, 2.3, c15E(sh.u)) }); c15BLook(T, 0.55, 40, 0.05, 10);
  },
  silence(T, sh) {      // 301.5 - 312.0: nothing: the wind, the ash, the two of them
    c15BWorld(T, { x: c15BMid() + 2, y: -26, z: c15Lerp(1.5, 1.2, c15E(sh.u)) }); c15BLook(T, 0.6, 30, 0, 10);
  },
  hand(T, sh) {      // 312.0 - 320.2: his hand, shaking, a hand's breadth from Megumi's hair
    const { hd } = c15BPts(T); c15BWorld(T, c15BCam(hd[0] + 8, hd[1] + 4, 4, 60)); c15BLook(T, 0.6 + 0.1 * sh.u, 30, 0, 12);
  },
  yface(T, sh) {      // 320.2 - 326.5: Yuji's face: it is quiet, a blank stare
    const [tx, ty] = c15BTr(T, 0.9, 13); c15BBack('#0e0606', 'rgba(160,110,50,0.22)'); c15BFace({ who: 'yuji', m: 'horror', mo: c15BQ(0.22 + 0.04 * Math.sin(T * 5), 20), lid: -0.5, pr: 1.6, bw: 5, veins: 0.7, circles: 1, pale: 1, dead: 1, sweat: c15BQ(1.2 + 0.5 * sh.u, 10) }, tx, ty); ctx.fillStyle = 'rgba(8,0,10,0.07)'; ctx.fillRect(0, 0, VW, VH); c15BLook(T, 0.65, 40, 0, 10);
  },
  lift1(T, sh) {      // 326.5 - 332.0: Megumi's head begins to come up
    const { hd } = c15BPts(T); c15BWorld(T, c15BCam(hd[0] + 8, hd[1], 3, 56)); c15BLook(T, 0.62 + 0.1 * sh.u, 60, 0.08 * sh.u, 14);
  },
  yeye2(T, sh) {      // 332.0 - 337.0: Yuji's eye; in it, Megumi's face with a grin
    const u = sh.u; c15BEye(T, { who: 'yuji', lid: -0.6, pr: 3 - 1.4 * c15E(u), refl: u > 0.3 ? 2 : 0, veins: 1, circles: 1, pale: 0.9, dead: 1, sweat: 1.4, br: 4, bw: 5, tr: 0.8 + 1.2 * u, dark: 0.1, row: 84 }); c15BVig(T, 0.6 + 0.15 * u, 90);
  },
  reveal(T) {      // 337.0 - 342.5: his face rises out of the dark; the hair falls aside, the marks and the red eyes come
    const rise = Math.round(c15Lerp(200, 0, c15E(c15S(T, 337, 340.2)))), hair = c15BQ(1 - c15E(c15S(T, 339.6, 341.2)), 5), a = c15E(c15S(T, 341.0, 342.4)), [tx, ty] = c15BTr(T, 0.4, 7);
    c15BBack('#0c0306', 'rgba(150,22,34,0.4)'); c15BFace({ who: 'meg', hair, marks: c15BQ(a, 10), red: c15BQ(a, 10), e2: c15BQ(0.9 * a, 10), m: 'slack', lid: 0.45 }, tx, ty + rise); ctx.fillStyle = 'rgba(8,0,10,0.07)'; ctx.fillRect(0, 0, VW, VH); c15BLook(T, 0.7, 90, 0.05 + 0.15 * a, 14);
  },
  smile(T, sh) {      // 342.5 - 346.6: Sukuna's smile on Megumi's face, red eyes; no words; cut to black
    const [tx, ty] = c15BTr(T, T < 343.4 ? 1.2 : 0.3, 7);
    c15BBack('#0c0306', 'rgba(170,22,34,0.55)'); c15BFace({ who: 'meg', hair: 0, marks: 1, red: 1, e2: 0.9, m: 'smile', lid: 0.3 }, tx, ty - Math.round(5 * c15E(sh.u))); ctx.fillStyle = 'rgba(8,0,10,0.07)'; ctx.fillRect(0, 0, VW, VH); c15BLook(T, 0.75, 110, 0.06, 22);
  },
};

const C15BW = { hold: 1, approach: 1, spasm: 1, fall: 1, step: 1, whisper: 1, silence: 1, hand: 1, lift1: 1 };      // (the shots that look at the roof)
function c15BEvents(T) {      // the sounds and the things that happen once
  const st = story.c15, ct = st.ct, f = c15BPos(), at = (k, t0, fn) => { if (T >= t0 && T < t0 + 0.6) once2(k, fn); };
  if (ct.bb === undefined) ct.bb = -1; while (ct.bb + 1 < C15BB.length && T >= C15BB[ct.bb + 1]) { ct.bb++; if (T - C15BB[ct.bb] < 0.5) snd('c7beat', T > 301.5 && T < 326 ? 0 : 1); }
  at('p1', 216.0, () => { snd('c4crunch'); snd('c7thud', 1); snd('gasp', 1); st.flash = c15BOff() ? 0 : 1; c15Shake(7, 900); });
  at('p2', 218.5, () => snd('c7mend')); at('p3', 232.0, () => snd('gasp', 0)); at('p4', 239.6, () => { snd('c7slurp'); c15Shake(3, 600); }); at('p5', 241.2, () => { snd('gasp', 2); c15Shake(2.5, 600); });
  at('p6', 250.8, () => { snd('c15scream'); c15Shake(3, 1200); }); at('p7', 254.8, () => snd('c7slurp')); at('p8', 258.5, () => { snd('c7thud', 0); c15Shake(2.5, 500); });
  at('p9', 260.7, () => { snd('c7thud', 1); snd('land', 1); c15Shake(4, 700); c15Spawn('dust', f.xm - 6, -1, 14, { sx: 24, rx: 70, vy: -8, ry: 12, life: 1.6, s: 2 }); });
  at('p10', 342.5, () => { snd('c7thud', 1); snd('c7thud', 0); st.flash = 0.8; c15Shake(5, 900); });
  if (T >= 245.5 && T < 258.5 && T - (ct.dust2 || 0) > 0.35) { ct.dust2 = T; c15Spawn('dust', f.xm + (Math.random() - 0.5) * 12, -2, 2, { sx: 8, vy: -6, ry: 6, life: 1.0, s: 1 }); }
  if (T >= 301.5 && T < 326.5 && Math.random() < 0.3) c15Spawn('ash', f.xs + 90, -6 - Math.random() * 50, 1, { sx: 30, sy: 10, vx: -26, rx: 12, vy: -3, ry: 5, life: 5 });
}
function c15Part2(now, dt, T) {
  const st = story.c15; if (!st.ct) c15CInit(T); const rdt = Math.min(dt, 0.05), sh = c15BShot(T);
  c15Parts(rdt); c15BEvents(T); st.flash = Math.max(0, st.flash - rdt * 2.2);
  ctx.save(); if (!C15BW[sh.id]) { const [shx, shy] = c15ShakeOff(); ctx.translate(Math.round(shx), Math.round(shy)); } C15BD[sh.id](T, sh); ctx.restore(); c15Talk(T);      // (the shots in the world shake by themselves, the close-ups here)
  if (st.flash > 0.01) { ctx.fillStyle = 'rgba(255,255,255,' + Math.min(0.92, st.flash).toFixed(2) + ')'; ctx.fillRect(0, 0, VW, VH); }
}
