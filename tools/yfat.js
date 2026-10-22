// ---------------------------------------------------------------- v1.49 YUJI'S FATALITY (the FATAL button as Yuji; the skill y_fatal, 1000 coins, needs BLACK FLASH; the same rules as Gojo's, Verity's and the Cat's: a Versus fight, the enemy at 20% health or less and close, 50% of the cursed energy). A cutscene of 30 seconds with its own clock, camera and effects: EIGHT BLACK FLASHES, one after the other, each of them throwing the enemy somewhere else so that Yuji has to get into position again (a dash, a leap, a blink), and the eighth is the ELITE FINISHER, with the most effects of the whole game. Every enemy has his own script (YFS): other blows in another order, other places, another camera, his own colours and set pieces.
// How it works: a script lists the eight blows (when, which move, how Yuji gets there, where the enemy flies). yfBuild turns it into TRACKS (where the enemy and Yuji are at every moment, as pieces of curves); yfFrame reads the tracks at the clock of the cutscene and draws one frame. The clock stops for a moment on every blow (hit-stop) and runs slowly in the slow-motion windows of the script, and the script's end is worked out so that the whole thing lasts 30 real seconds.
let yf = null;      // the running cutscene (null when there is none)
const YF_LEN = 30;      // how long it lasts, in real seconds
const yfEase = { lin: u => u, out: u => 1 - (1 - u) * (1 - u), in: u => u * u, io: u => u * u * (3 - 2 * u), out3: u => 1 - Math.pow(1 - u, 3), in3: u => u * u * u };
const YF_RED = '#ff2a3a', YF_DK = '#12030a', YF_PK = '#ffb0a0';
let yfDepth = 0;      // (how many saves of the canvas are open: a frame that fails in the middle gives them all back, or a clip or a transform of that frame would stay for the rest of the game)
const yfSave = () => { ctx.save(); yfDepth++; }, yfRestore = () => { ctx.restore(); yfDepth--; };
const yfSfx = name => { try { if (sfx) sfx[name](); } catch (e) { /* no sound is no reason to stop */ } };      // (a cue that puts the sound back right, straight to the sound: snd() drops every cue while the audio is suspended, e.g. after a pause, and the score or the muffled mix would stay)
const yfEco = () => SET.lite || !!(yf && yf.eco);      // (the lighter drawing: the LITE setting, or the game itself when the frames of the cutscene take too long to make)
// Yuji's blows: k = the strip (index into YU.atk), imp = the picture on which it lands, fps = its speed (the cutscene runs at the normal speed, not at the fast pace of the fight), gap = how far the enemy's middle is from his (px), lunge = how far he steps in during the blow, on = what lands (fist or foot, where the Black Flash is drawn)
const YFM = {
  hook: { k: 0, imp: 7, fps: 30, gap: 23, lunge: 6, sw: 5 }, hook2: { k: 1, imp: 7, fps: 30, gap: 23, lunge: 6, sw: 5 }, knee: { k: 2, imp: 7, fps: 30, gap: 20, lunge: 6, sw: 4 },
  rkick: { k: 5, imp: 7, fps: 30, gap: 28, lunge: 5, sw: 5 }, elbow: { k: 6, imp: 7, fps: 30, gap: 20, lunge: 6, sw: 5 }, slam: { k: 7, imp: 7, fps: 30, gap: 21, lunge: 4, sw: 5 },
  push: { k: 8, imp: 7, fps: 30, gap: 27, lunge: 5, sw: 5 }, conc: { k: 9, imp: 7, fps: 24, gap: 26, lunge: 6, sw: 6 }, sweep: { k: 10, imp: 6, fps: 30, gap: 27, lunge: 4, sw: 3 },
  upper: { k: 13, imp: 6, fps: 30, gap: 21, lunge: 4, sw: 4 }, face: { k: 14, imp: 7, fps: 30, gap: 27, lunge: 4, sw: 4 }, spin: { k: 15, imp: 11, fps: 30, gap: 24, lunge: 4, sw: 3 },
  dive: { fx: 'fx_dive', k: 3, hk: 3, imp: 7, fps: 30, gap: 30, lunge: 22, ex: 'io', sw: 4 }, bfp: { k: 20, imp: 7, fps: 26, gap: 24, lunge: 6, sw: 6 }, bfk: { k: 21, imp: 7, fps: 30, gap: 28, lunge: 4, sw: 5 }, bfg: { k: 22, imp: 7, fps: 28, gap: 24, lunge: 6, sw: 6 }, cbf: { k: 23, imp: 9, fps: 20, gap: 30, lunge: 8, sw: 7, cut: 12 } };
const YFS = {};      // the scripts, one for each enemy (below)
// ---- the enemy's pictures: the same ones the Versus fight shows (Gojo's real ones unless you are Gojo too, Verity's, the Cat's, Yuji's inverted ones), as a kit: vF idle, vRx[k] the ten reactions, vRxW / vW white copies for the flash of a blow, vB blue copy (stunned), vi(k) = the picture info of reaction k (-1: of the idle)
let YFK = null;
function yfKit(foe) {
  if (foe === 'verity') return veVictim();
  if (foe === 'cat') return catVictim();
  if (foe === 'yuji') return YFK || (YFK = victimKit(YUF.inv.idle, YUF.inv.rx, k => k < 0 ? YU.idle : YU.rx[k]));
  const inv = !!(vs && vs.inv);
  return { vF: inv ? dumF : idleF, vRx: inv ? rxI : rxN, vRxW: rxW, vW: dumW, vB: dumB, vi: k => k < 0 ? D.idle : D['rx' + k], fs: 1 };
}
// ---- tracks. A segment is a piece of curve: from (x0, l0, r0) to (x1, l1, r1) between t0 and t1 (x = along the floor, l = height above it, r = turn in radians), each with its own easing, plus an arc of height h in the middle; pose(u) says which picture he shows
const yfSegAt = (arr, t) => { let s = arr[0]; for (let i = 0; i < arr.length; i++) { if (arr[i].t0 <= t) s = arr[i]; else break; } return s; };
function yfEvalSeg(s, t) {
  const u = s.t1 > s.t0 ? Math.max(0, Math.min(1, (t - s.t0) / (s.t1 - s.t0))) : 1, E = yfEase;
  return { u, x: s.x0 + (s.x1 - s.x0) * E[s.ex || 'lin'](u), l: s.l0 + (s.l1 - s.l0) * E[s.el || 'lin'](u) + (s.h ? s.h * 4 * u * (1 - u) : 0) + (s.bob ? s.bob * Math.sin((t - s.t0) * 5) : 0), r: s.r0 + (s.r1 - s.r0) * E[s.er || 'io'](u) };
}
function yfEvalV(V, t) {      // the enemy at time t: where he is, how he is turned, which picture, how he is squashed
  const s = yfSegAt(V, t), e = yfEvalSeg(s, t), p = s.pose ? s.pose(e.u, t - s.t0) : ['blue'], q = s.sq ? s.sq(e.u, t - s.t0) : [1, 1];
  return { x: e.x, l: Math.max(0, e.l), r: e.r, f: s.f || 1, pose: p, sx: q[0], sy: q[1], tag: s.tag || '', gone: !!s.gone, lying: yfLying(p), tilt: Math.abs(Math.sin(e.r)) };
}
function yfEvalY(Y, t) {      // Yuji at time t
  const s = yfSegAt(Y, t);
  if (s.k === 'idle') return { x: s.x0, l: s.l0, f: s.f, pic: s.pose === 'charge' ? ['fxs', 'fx_charge', (t - s.t0) * 12] : s.pose === 'pose' ? ['fxs', 'fx_pose', Math.min(14, (t - s.t0) * 7)] : ['idle'], vis: 1, ghost: 0 };
  const e = yfEvalSeg(s, t), u = e.u;
  if (s.k === 'strike') { const M = YFM[s.mv], I = M.fx ? YU.fx[M.fx] : YU.atk[M.k], fr = (t - s.t0) * M.fps; return { x: e.x, l: e.l + (I.lift ? I.lift[Math.max(0, Math.min(14, Math.floor(fr)))] || 0 : 0), f: s.f, pic: ['mv', s.mv, fr], vis: 1, ghost: 0 }; }
  if (s.k === 'dash') return { x: e.x, l: e.l, f: s.f1, pic: ['dash', u], vis: 1, ghost: 1 };
  if (s.k === 'leap') return { x: e.x, l: e.l, f: s.f1, pic: ['jump', 3 + u * 8], vis: 1, ghost: 1 };
  if (s.k === 'fall') return { x: e.x, l: e.l, f: s.f1, pic: ['jump', 9 + u * 5], vis: 1, ghost: 0 };
  if (s.k === 'run') return { x: e.x, l: e.l, f: s.f1, pic: ['run', (t - s.t0) * 22], vis: 1, ghost: u < 0.55 ? 1 : 0 };
  if (s.k === 'walk') return { x: e.x, l: e.l, f: s.f1, pic: ['fwd', (t - s.t0) * 14], vis: 1, ghost: 0 };
  if (s.k === 'blink') return { x: u < 0.5 ? s.x0 : s.x1, l: u < 0.5 ? s.l0 : s.l1, f: u < 0.5 ? s.f0 : s.f1, pic: ['idle'], vis: u < 0.12 ? 1 - u / 0.12 : u > 0.88 ? (u - 0.88) / 0.12 : 0, ghost: 0, blink: u, bx0: s.x0, bx1: s.x1, bl0: s.l0, bl1: s.l1 };
  return { x: s.x0, l: s.l0, f: s.f1 || s.f || 1, pic: ['idle'], vis: 1, ghost: 0 };
}
// ---- the enemy's flight after a blow. o = { k: slide | fly | slam | launch, T seconds, dx px (the way the blow went), h arc height, turns full turns while he flies, l1 height at the end (fly: none = he lands, launch: where he hangs), land: lie | stand, rx reaction picture, rest: dazed | lie | air | kneel }
const YF_TAU = 6.2832;      // (the enemy's own pictures show him falling and lying flat, so a body on the floor is at height 0 and not turned)
const yfLying = p => p[0] === 'rx' && p[1] === 4 && p[2] > 0.18 && p[2] < 0.62;
const yfRestPose = k => k === 'lie' ? () => ['rx', 4, 0.42] : k === 'air' ? () => ['rx', 7, 0.45] : k === 'kneel' ? () => ['rx', 9, 0.4] : () => ['blue'];
function yfOut(o, t, s, f) {
  const T = o.T || 0.8, rx = o.rx == null ? 3 : o.rx, out = [], x1 = s.x + f * (o.dx || 0), rd = k => RX_DUR[k] / 1000, seg = a => Object.assign({ f: -f }, a);
  let rest = o.rest || 'dazed';
  if (o.k === 'slide') out.push(seg({ t0: t, t1: t + T, x0: s.x, x1, l0: s.l, l1: 0, r0: s.r, r1: 0, ex: 'out', el: 'out', pose: u => ['rx', rx, Math.min(1, u * T / rd(rx))], tag: 'slide' }));
  else if (o.k === 'fly') {
    const air = o.l1 != null && o.l1 > 0, lie = !air && o.land !== 'stand', l1 = air ? o.l1 : 0, r1 = f * YF_TAU * (o.turns || 0) + (air ? f * (o.rot || 0.5) : 0);
    const p = o.pose || (u => u < 0.14 ? ['rx', 7, 0.1 + u * 2] : lie && u > 0.86 ? ['rx', 4, 0.05 + (u - 0.86) * 3] : ['rx', 7, 0.42]);
    out.push(seg({ t0: t, t1: t + T, x0: s.x, x1, l0: s.l, l1, r0: s.r, r1, ex: o.ex || 'out', el: 'lin', h: o.h || 0, er: 'io', pose: p, tag: 'fly' }));
    if (lie) { out.push(seg({ t0: t + T, t1: t + T + 0.36, x0: x1, x1: x1 + f * (o.bx || 12), l0: 0, l1: 0, r0: 0, r1: 0, ex: 'out', h: o.bh == null ? 10 : o.bh, pose: yfRestPose('lie'), tag: 'bounce' })); rest = o.rest || 'lie'; } else rest = o.rest || (air ? 'air' : 'dazed');
  } else if (o.k === 'slam') {
    out.push(seg({ t0: t, t1: t + T, x0: s.x, x1, l0: s.l, l1: 0, r0: s.r, r1: 0, ex: 'out', el: 'in', er: 'out', pose: u => ['rx', 4, 0.05 + u * 0.2], tag: 'slam' }));
    out.push(seg({ t0: t + T, t1: t + T + 0.4, x0: x1, x1: x1 + f * (o.bx || 10), l0: 0, l1: 0, r0: 0, r1: 0, ex: 'out', h: o.bh == null ? 14 : o.bh, pose: yfRestPose('lie'), tag: 'bounce' })); rest = o.rest || 'lie';
  } else if (o.k === 'launch') { out.push(seg({ t0: t, t1: t + T, x0: s.x, x1, l0: s.l, l1: o.l1 || 80, r0: s.r, r1: f * (o.rot == null ? 0.4 : o.rot), ex: 'out', el: 'out', er: 'out', pose: u => ['rx', 7, 0.1 + u * 0.35], tag: 'launch' })); rest = o.rest || 'air'; }
  if (o.flat) for (const g of out) g.sq = () => [1.5, 0.38];      // (a cartoon enemy that has been flattened)
  const last = out[out.length - 1];
  out.push(seg({ t0: last.t1, t1: 1e9, x0: last.x1, x1: last.x1, l0: last.l1, l1: last.l1, r0: last.r1, r1: last.r1, bob: rest === 'air' ? 2 : 0, gone: !!o.gone, sq: o.flat ? () => [1.5, 0.38] : null, pose: yfRestPose(rest), tag: 'rest' }));
  return out;
}
function yfBuild(S, g0) {      // the script becomes tracks, and the length of the cutscene is worked out
  const V = [{ t0: -9, t1: 0.7, x0: g0, x1: 40, l0: 0, l1: 0, r0: 0, r1: 0, ex: 'io', f: -1, pose: () => ['blue'], tag: 'rest' }, { t0: 0.7, t1: 1e9, x0: 40, x1: 40, l0: 0, l1: 0, r0: 0, r1: 0, f: -1, pose: () => ['blue'], tag: 'rest' }], Y = [{ t0: -9, t1: 1e9, k: 'idle', x0: 0, l0: 0, f: 1 }], beats = [];
  let fz = 0;
  for (let i = 0; i < S.beats.length; i++) {
    const b = Object.assign({}, S.beats[i]), M = YFM[b.mv], f = b.f || 1, Ts = b.at - M.imp / M.fps, dur = (M.cut || 15) / M.fps, vs0 = yfEvalV(V, b.at), ap = b.ap || 'dash', apT = ap === 'none' ? 0 : (b.apT || 0.5), T0 = Ts - apT;
    const I = M.fx ? YU.fx[M.fx] : YU.atk[M.k], ll = I.lift ? I.lift[M.imp] || 0 : 0, yx = vs0.x - f * ((b.gap == null ? M.gap : b.gap) + M.lunge * yfEase[M.ex || 'out'](M.imp / (M.cut || 15))), yl = Math.max(0, (b.yl === 'match' ? Math.max(0, vs0.l - 8) : (b.yl || 0)) - ll), Tb = b.pre ? T0 - b.pre.t : T0;      // (a strip that jumps by itself, like a kick, is lifted less by the track)
    while (Y.length > 1 && Y[Y.length - 1].t0 >= Tb) Y.pop();      // (the tracks stay in time order: what the next blow starts before is dropped)
    if (b.pre) { const q = yfEvalY(Y, Tb); Y.push({ t0: Tb, t1: Tb + 0.28, k: 'blink', x0: q.x, x1: vs0.x - f * b.pre.d, l0: q.l, l1: 0, f0: q.f, f1: f }, { t0: Tb + 0.28, t1: 1e9, k: 'idle', pose: 'charge', x0: vs0.x - f * b.pre.d, l0: 0, f }); }
    const prev = yfEvalY(Y, T0);
    while (V.length > 2 && V[V.length - 1].t0 >= b.at) V.pop();
    if (ap !== 'none') Y.push({ t0: T0, t1: Ts, k: ap, x0: prev.x, x1: yx, l0: prev.l, l1: yl, f0: prev.f, f1: f, ex: ap === 'dash' ? 'out3' : ap === 'run' ? 'out' : 'io', el: 'lin', h: b.aph == null ? (ap === 'leap' ? 18 : 0) : b.aph });
    Y.push({ t0: Ts, t1: Ts + dur, k: 'strike', mv: b.mv, x0: yx, x1: yx + f * M.lunge, l0: yl, l1: yl, f, ex: M.ex || 'out', el: 'lin' });
    const xe = yx + f * M.lunge;
    if (yl > 0) Y.push({ t0: Ts + dur, t1: Ts + dur + 0.4, k: 'fall', x0: xe, x1: xe, l0: yl, l1: 0, f0: f, f1: f, ex: 'lin', el: 'in' });
    Y.push({ t0: Ts + dur + (yl > 0 ? 0.4 : 0), t1: 1e9, k: 'idle', pose: i === S.beats.length - 1 ? 'pose' : '', x0: xe, l0: 0, f });
    b.Ts = Ts; b.yx = yx; b.yl = yl; b.vx = vs0.x; b.vl = vs0.l; b.vLying = vs0.lying; b.f = f; b.M = M; b.fz = b.fz == null ? (i < 7 ? 0.07 + 0.012 * i : 0.52) : b.fz; fz += b.fz;
    V.push.apply(V, yfOut(b.out, b.at, vs0, f));
    beats.push(b);
  }
  const slow = S.slow || []; let extra = fz; for (const w of slow) extra += (w[1] - w[0]) * (1 / w[2] - 1);
  const lb = beats[beats.length - 1];
  return { V, Y, beats, slow, end: YF_LEN - extra, extra, linger: lb.at + (lb.out.T || 1) + 1.5 };
}
// ---- drawing. Everything of the world is drawn inside the camera (zoom, shake); x is "along the floor" from where Yuji stood, l = px above the floor
function yfSpr(src, info, x, l, f, o) {      // a picture standing on the floor at the screen place x (f = 1 faces right, -1 left), l px up, turned by o.r about the point o.pv px above the feet, squashed by o.sx / o.sy, o.a = opacity
  o = o || {}; const hx = info.cx - info.x0, pv = o.pv || 0;
  yfSave(); ctx.translate(Math.round(x), gy + 2 - Math.round(l) - pv); if (o.r) ctx.rotate(o.r); if (o.sx || o.sy) ctx.scale(o.sx || 1, o.sy || 1); if (f < 0) ctx.scale(-1, 1);
  if (o.a != null) ctx.globalAlpha = o.a; ctx.drawImage(src, -hx, -62 - (info.top || 0) + pv); yfRestore();
}
let YFSP = null;
function yfSets() {      // Yuji's pictures for the cutscene: the normal ones, or in INHERITENCE the ones with the spiky hair (every strip the cutscene can show, built the first time: about a tenth of a second)
  if (!(vs && vs.me === 'yuji' && cm === 3)) return { N: YUF.norm, I: YU };
  if (YFSP) return YFSP; const sp = spikyY(), pal = YU.pal, atk = YU.atk.map((st, k) => sp.I.atk[k] === st ? spikify(st) : sp.I.atk[k]), fx = {}, fxi = {};
  for (const n in YU.fx) { fxi[n] = spikify(YU.fx[n]); fx[n] = mk(fxi[n], pal); }
  return YFSP = { N: { ...sp.N, atk: atk.map((st, k) => sp.I.atk[k] === st ? sp.N.atk[k] : mk(st, pal)), fx }, I: { ...sp.I, atk, fx: fxi } };
}
function yfYPic(pic, now) {      // Yuji's picture for a pose of the track: { src, info }
  const Q = yfSets(), N = Q.N, I = Q.I;
  if (pic[0] === 'idle') return { src: N.idle[Math.floor(now / (1000 / IDLE_FPS)) % 15], info: I.idle };
  if (pic[0] === 'dash') return { src: N.dash[0][Math.max(0, Math.min(14, Math.floor(pic[1] * 15)))], info: I.dash[0] };
  if (pic[0] === 'jump') return { src: N.jump[Math.max(0, Math.min(14, Math.floor(pic[1])))], info: I.jump };
  if (pic[0] === 'fwd') return { src: N.fwd[Math.floor(pic[1]) % 15], info: I.fwd };
  if (pic[0] === 'run') return { src: N.run[Math.floor(pic[1]) % 15], info: I.run };
  if (pic[0] === 'fxs') { const fi = Math.max(0, Math.min(14, Math.floor(pic[2]))); return { src: N.fx[pic[1]][fi], info: I.fx[pic[1]], fi }; }
  const M = YFM[pic[1]], fi = Math.max(0, Math.min(14, Math.floor(pic[2])));
  return { src: (M.fx ? N.fx[M.fx] : N.atk[M.k])[fi], info: M.fx ? I.fx[M.fx] : I.atk[M.k], fi };
}
function yfVPic(K, p, now, white) {      // the enemy's picture for a pose: { src, info }
  if (p[0] === 'rx') { const set = (white ? K.vRxW : K.vRx)[p[1]], fi = Math.max(0, Math.min(set.length - 1, Math.round(p[2] * (set.length - 1)))); return { src: set[fi], info: K.vi(p[1]) }; }
  const i = Math.floor(now / (1000 / IDLE_FPS)) % K.vF.length;
  return { src: white ? K.vW[i] : p[0] === 'blue' && ((now / 70) | 0) % 2 === 0 ? K.vB[i] : K.vF[i], info: K.vi(-1) };
}
function yfRing(X, Y, R, col, w, ry, gaps) {      // a ring of dots (only the dots that can be seen are drawn: a ring that grows past the screen would cost thousands of rectangles for nothing)
  ctx.fillStyle = col; const eco = yfEco(), n = Math.max(24, Math.round(R * (eco ? 2.4 : 4))), v = yf && yf.vis, sz = (w || 1) + (eco && R > 60 ? 1 : 0);
  for (let q = 0; q < n; q++) { if (gaps && q % gaps === gaps - 1) continue; const th = q / n * 6.2832, px = Math.round(X + Math.cos(th) * R), py = Math.round(Y + Math.sin(th) * R * (ry || 0.9)); if (v && (px < v[0] || px > v[1] || py < v[2] || py > v[3])) continue; ctx.fillRect(px, py, sz, sz); }
}
function yfBolt(x, y, ang, len) {      // a long lightning bolt for the big effects: the same zigzag as the Black Flash's own (bfBolt), drawn as two lines (a red glow, a black core) instead of three rectangles for every pixel of it, which is twelve times faster
  let px = x, py = y, k = 0, n = 0; ctx.beginPath(); ctx.moveTo(x + 0.5, y + 0.5);
  while (n < len) { const a = ang + (k & 1 ? 1 : -1) * (0.45 + Math.random() * 0.5), l = Math.random() < 0.5 ? 2 : 3; px += Math.cos(a) * l; py += Math.sin(a) * l; ctx.lineTo(Math.round(px) + 0.5, Math.round(py) + 0.5); n += l; k++; }
  ctx.lineWidth = 3; ctx.strokeStyle = YF_RED; ctx.stroke(); ctx.lineWidth = 1; ctx.strokeStyle = YF_DK; ctx.stroke();
}

function yfDisc(X, Y, R, col) { ctx.fillStyle = col; for (let yy = -Math.floor(R); yy <= Math.floor(R); yy++) { const w = Math.floor(Math.sqrt(R * R - yy * yy)); ctx.fillRect(Math.round(X) - w, Math.round(Y) + yy, 2 * w + 1, 1); } }
function yfBFDraw(e, s, now, mx, cx) {      // one BLACK FLASH (n = 1 to 8): the world goes dark for a moment, black-and-red lightning, rings, a white cross; the later ones are bigger
  const a = Math.max(0, s.t - e.t0), ra = (now - e.born) / 1000, n = e.n, X = Math.round(mx + e.x - cx), Y = Math.round(e.y), life = 0.5 + 0.04 * n, k = Math.min(1, a / life);
  if (ra > life + 0.25 && a > life) return false;
  if (ra < 0.2) { ctx.globalAlpha = (0.42 + 0.03 * n) * (1 - ra / 0.2); ctx.fillStyle = YF_DK; ctx.fillRect(X - 500, -300, 1000, 800); }
  ctx.globalAlpha = Math.min(1, 1.7 * (1 - k)); const nb = (yfEco() ? 5 : 7) + Math.round(1.1 * n), len = Math.round((9 + 14 * Math.min(1, a / 0.14)) * (1 + 0.11 * n));
  for (let i = 0; i < nb; i++) bfBolt(X, Y, i / nb * 6.2832 + Math.random() * 0.5, len);
  for (let q = 0; q < (n >= 4 ? 3 : 2); q++) { const aq = a - q * 0.06; if (aq < 0 || aq >= life * 0.98) continue; const R = 4 + aq * (110 + 16 * n); ctx.globalAlpha = Math.max(0, 1 - aq / life); yfRing(X, Y, R, YF_DK, 2, 0.85, 7); yfRing(X, Y, R + 2, YF_RED, 1, 0.85, 7); }
  if (ra < 0.14) { ctx.globalAlpha = 1; const r = Math.round(5 + n * 0.7 - ra * 20); ctx.fillStyle = '#ffffff'; ctx.fillRect(X - r, Y - 1, 2 * r + 1, 3); ctx.fillRect(X - 1, Y - r, 3, 2 * r + 1); ctx.fillStyle = YF_PK; ctx.fillRect(X - 2, Y - 2, 5, 5); }
  ctx.globalAlpha = 1; return true;
}
function yfSay(txt, col, now, big) { for (const o of yf.lines) if (!o.cut) o.cut = now; yf.lines.push({ txt, col, born: now, big: !!big }); }      // (a new line takes the place of the old one, which is gone at once: two texts one over the other cannot be read)
// ---- the camera: key = [time, zoom, weight towards the enemy (0 = Yuji, 1 = the enemy), shift up]; between two keys it eases; the focus looks a little ahead of the action and behind it (so it never lags)
function yfCamAt(K, t) { let i = 0; while (i < K.length - 1 && K[i + 1][0] <= t) i++; const a = K[i], b = K[Math.min(K.length - 1, i + 1)], u = b[0] > a[0] ? Math.max(0, Math.min(1, (t - a[0]) / (b[0] - a[0]))) : 1, e = u * u * (3 - 2 * u); return { z: a[1] + (b[1] - a[1]) * e, w: a[2] + (b[2] - a[2]) * e, dy: (a[3] || 0) + ((b[3] || 0) - (a[3] || 0)) * e, nf: (a[4] || 0) + ((b[4] || 0) - (a[4] || 0)) * e }; }
function yfFocus(P, t, w) { const V = yfEvalV(P.V, t), Y = yfEvalY(P.Y, t); const gone = V.gone && t > P.linger; return { x: gone ? Y.x : Y.x + (V.x - Y.x) * w, h: gone ? Y.l : Y.l + (V.l - Y.l) * w, top: Math.max(Y.l + 64, gone ? 0 : V.l + (V.lying ? 26 : V.tilt > 0.7 ? 40 : 64)) }; }
let YFV = null;
function yfVignette() { if (!YFV || YFV.width !== VW || YFV.height !== VH) { const c = document.createElement('canvas'); c.width = VW; c.height = VH; const g = c.getContext('2d'), gr = g.createRadialGradient(VW / 2, VH / 2, VH * 0.28, VW / 2, VH / 2, VW * 0.6); gr.addColorStop(0, 'rgba(0,0,0,0)'); gr.addColorStop(1, 'rgba(0,0,0,0.9)'); g.fillStyle = gr; g.fillRect(0, 0, VW, VH); YFV = c; } return YFV; }
function yfCamKeys(P, S) {      // the camera of the whole cutscene: wide at first, a push in for every blow and out again, and the script's own shots (the finale)
  const zb = S.zb || 1.55, K = [[0, 1, 0.3, 0], [1.6, 1.2, 0.4, 0], [P.beats[0].Ts - 0.5, zb, 0.5, 0]];
  for (const b of P.beats) { if (b.nocam) continue; const zh = b.z || 2, w = b.w == null ? 0.55 : b.w; K.push([b.at - 0.8, zb, w, 0], [b.at - 0.1, zh, w, 0], [b.at + 0.3, zh, w, 0], [b.at + 1.2, zb, w, 0]); }
  for (const k of (S.cam || [])) K.push(k);
  return K.sort((a, b) => a[0] - b[0] || 0);
}
function yfStart(now) {
  yfDepth = 0; const d = dummy, foe = vs.foe, S = YFS[foe] || YFS.gojo; cineClear(); closeSettings(); stickDown = false; d.ai = 'rest'; d.pull = null; d.vx = 0; d.vact = null; d.cact = null; d.cheld = null; d.held = null; vs.catHold = 0; slowMs = 0; $('pad').classList.add('cine'); $('hud').classList.add('cine');
  const g0 = Math.max(20, Math.min(FAT_RANGE, Math.abs(d.x - wx))), P = yfBuild(S, g0);
  yf = { S, P, words: [], roll: 0, dust: 0, finX: P.beats[P.beats.length - 1].vx, end: P.end, T8: P.beats.length === 8 ? P.beats[7].at : null, title: S.title == null ? P.end - 2.6 : S.title, flash: 0, deb: Array.from({ length: 30 }, (_, i) => ({ x: -60 + i * 9 + (i * 37) % 11, d: (i * 0.13) % 1.1, v: 22 + (i * 29) % 30, s: 1 + (i % 3 === 0 ? 1 : 0), c: ['#8c8898', '#c8c4d0', '#5e5a6c', '#ff2a3a'][i % 4] })), K: yfKit(foe), t: 0, real: 0, rate: 1, slow: false, freeze: 0, ev: {}, fx: [], parts: [], lines: [], cracks: [], cam: yfCamKeys(P, S), wx0: wx, n: 0, nAt: -9, shake: 0, zk: 0, white: 0, imp: null, skip: false, born: now, tapAt: -9 };
  { const lb = P.beats[P.beats.length - 1]; snd('yfscore', Math.max(4, yfReal(P, lb.at) - lb.fz - 0.5)); }
}
function yfReset() { if (yf && yf.slow) yfSfx('slowout'); yf = null; $('pad').classList.remove('cine'); $('hud').classList.remove('cine'); yfSfx('yfstop'); }
function yfEnd(now) {      // the enemy is gone and Yuji wins the round (like the other FATALITIES)
  const s = yf; wx = s.wx0; yfReset(); blackUntil = now + 500; if (!vs || vs.ph !== 'fight') return;
  dummy.air = null; dummy.airH = 0; dummy.rag = null; dummy.hp = 0; dummy.shown = 0; dummy.ko = now - 3000; dummy.koAt = dummy.ko; kos++; endRound('player', 'fatal', now);
}
function yfTap(now) {      // a tap on the screen: the first one says how to skip, a second one within a second and a half skips (it is 30 seconds long; a stray tap must not end it)
  if (!yf || yf.skip || yf.t < 1) return; if (now - yf.tapAt < 1500) yfSkip(now); else yf.tapAt = now;
}
function yfSkip(now) { if (!yf || yf.skip || yf.t > yf.end - 0.5) return; yf.skip = true; yfSfx('yfstop'); yf.t = Math.max(yf.t, yf.end - 0.5); yf.n = yf.P.beats.length; yf.nAt = now - 1000; yf.imp = null; yf.freeze = 0; }      // (the rest of it is skipped: the counter shows all eight, no impact frame or freeze is left over)
function yfHit(i, now) {      // blow i + 1 lands: the freeze, the white flash of the enemy, the BLACK FLASH, sparks, dust, the shake and the zoom
  const s = yf, S0 = s.S, b = s.P.beats[i], n = i + 1, f = b.f, X = s.wx0 + b.vx - f * 5, lying = b.vLying, y = lying ? gy - 9 : gy - 36 - Math.max(0, b.vl), W = x => s.wx0 + x;
  s.roll = (i % 2 ? 1 : -1) * (n === 8 ? 0.09 : 0.012 + 0.006 * n);
  s.n = n; s.nAt = now; s.freeze = now + b.fz * 1000; if (n >= 2) s.blur = { x: b.vx - f * 5, y, until: now + (n === 8 ? 420 : 150) }; s.white = now + 90 + (n === 8 ? 260 : 0); s.shake = Math.max(s.shake, 2.5 + 0.6 * n); s.zk = 0.1 + 0.02 * n;
  s.fx.push({ k: n === 8 ? 'big' : 'bf', x: b.vx - f * 5, y, n, born: now, t0: s.t }); if (n >= 4) s.imp = { at: now, n, snap: null, x: b.vx - f * 5, y };
  if (n >= 3) s.cracks.push({ x: b.vx - f * 5, t0: s.t, len: n === 8 ? 230 : 30 + 8 * n, spd: n === 8 ? 260 : 120 });
  if (n === 8) { s.flash = now + 700; s.shake = 10; s.zk = 0.5; for (let i = 0; i < 70; i++) { const an = Math.random() * 6.2832, v = 60 + Math.random() * 200; yfPart(s, b.vx, y, Math.cos(an) * v, Math.sin(an) * v - 80, 380, 1.2 + Math.random() * 1.2, i % 3 === 0 ? '#383444' : i % 3 === 1 ? YF_RED : '#8c8898', 1 + (i % 4 === 0 ? 1 : 0)); } }
  if (n === 8) snd('yfbig'); else snd('yfbf', n); snd('hit', b.M.hk != null ? b.M.hk : b.M.k); snd('smack', 3); buzz(50 + 20 * n);
  spark(X, y, 14 + 3 * n, [YF_RED, YF_DK, '#ffffff', '#ff7a5a'], true, f); spark(X, y, 8 + n, [YF_RED, YF_DK], true, -f);
  if (b.vl < 12) { puff(W(b.vx), 3 + n); gritAt(W(b.vx), 4 + n, 70 + 10 * n, f); }
  if (S0.spk) spark(X, y, 8 + n, S0.spk, false, -f);
  if (b.word) yfWord(s, now, b.word, b.vx - f * 5, y - 14, b.wcol);
  if (b.line) yfSay(b.line, b.lcol || '#ffffff', now, false);
  if (b.fx) b.fx(s, now, b, n);
  if (S0.glass) { s.cr = s.cr || []; s.cr.push({ x: b.vx - f * 5, y, born: now, n: 5 + (n >> 1), len: 22 + 6 * n, a: Math.random() * 6.2832 }); }
}
function yfEvents(now, t) {
  const s = yf, P = s.P, S = s.S, at = (k, T, fn) => { if (!s.ev[k] && t >= T) { s.ev[k] = 1; if (!s.skip) fn(); } };
  at('go', 0, () => { snd('fatalstart'); s.shake = 2; });
  P.beats.forEach((b, i) => {
    at('ap' + i, b.Ts - (b.ap === 'none' ? 0 : (b.apT || 0.5)), () => { if (b.ap === 'blink') snd('vanish'); else if (b.ap === 'leap') snd('jump'); else if (b.ap !== 'none' && b.ap !== 'run') snd('dash', 0); });
    at('sw' + i, b.Ts + b.M.sw / b.M.fps, () => snd('swing', i % 4));
    at('hit' + i, b.at, () => yfHit(i, now));
  });
  if (s.T8 != null) { at('zone', s.T8 - 3.6, () => { yfSay('THE ZONE', YF_RED, now, true); s.cracks.push({ x: s.finX - 96, t0: s.t, len: 70, spd: 60 }); }); at('rise', s.T8 - 3.2, () => snd('yfrise', 2.7)); at('line8', s.T8 + 0.15, () => yfSay('ELITE FINISHER', '#ffffff', now, true)); }
  if (s.T8 != null) at('vanish', s.T8 + P.beats[P.beats.length - 1].out.T, () => { const [x, y] = yfGone(s); if (S.vanish) S.vanish(s, now, x, y); else yfVanish(s, now, x, y, S.vcols || ['#ffffff', '#ff7a5a', '#ffb0a0']); });
  at('title', s.title, () => snd('fataltitle'));
  for (const e of (S.ev || [])) at(e[0], e[1], () => e[2](s, now, t));
  if (!s.ev.end && t >= s.end && (s.skip || s.real >= YF_LEN - 0.005)) { s.ev.end = 1; yfEnd(now); }
}
function yfFrame(now, dt) {
  try { yfFrame0(now, dt); } catch (e) { console.error('yf', e); while (yfDepth > 0) yfRestore(); yfDepth = 0; ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over'; ctx.filter = 'none'; if (yf) yfEnd(now); }      // (whatever goes wrong, the fight goes on: the enemy is gone and the round is won)
}
function yfTitle(k, a, yc) {      // the word FATALITY like the other cutscenes' (it slams in huge, drops to its size in three steps, shakes a little), a little above the middle so that Yuji stays in view
  const base = Math.max(8, Math.min(32, Math.floor((VW - 12) / 64) * 8)), sz = k < 0.06 ? base * 2 : k < 0.12 ? base * 1.5 : base, j = k < 0.9 ? Math.round((Math.random() - 0.5) * 2) : 0, x = Math.round(VW / 2) + j, y = yc + Math.round(sz / 2) + j;
  ctx.globalAlpha = a; ctx.textAlign = 'center'; ctx.font = sz + 'px "Press Start 2P"'; ctx.fillStyle = '#2a0408'; for (const [dx, dy] of [[-2, 0], [2, 0], [0, -2], [0, 2], [3, 3]]) ctx.fillText('FATALITY', x + dx, y + dy);
  ctx.fillStyle = '#d8101c'; ctx.fillText('FATALITY', x, y); ctx.globalAlpha = 1;
}
function yfToon(P, t) {      // CARTOON PHYSICS: the enemy is squashed flat by every blow and springs back stretched, then wobbles (a damped swing, 0.5 s)
  let sx = 1, sy = 1; for (const b of P.beats) { const u = t - b.at; if (u < 0 || u > 0.6) continue; const e = Math.exp(-u * 7), w = Math.cos(u * 26); sy *= 1 - 0.5 * e * w; sx *= 1 + 0.4 * e * w; }
  return [Math.max(0.3, sx), Math.max(0.3, sy)];
}
function yfWord(s, now, txt, x, y, col) { s.words.push({ txt, x, y, col: col || '#ffe34d', born: now, a: (Math.random() - 0.5) * 0.5 }); }
function yfWordsDraw(s, now, mx, cx) {      // comic words that pop up at the place of a blow, turned a little, big first and then their size, for 0.8 s
  s.words = s.words.filter(w => now - w.born < 800);
  for (const w of s.words) { const a = (now - w.born) / 1000, k = a < 0.1 ? 2 - a * 10 : 1, X = Math.round(mx + w.x - cx), Y = Math.round(Math.max(w.y - 12 * Math.min(1, a * 3), (s.vtop || -999) + 16 * k + 10)); yfSave(); ctx.translate(X, Y); ctx.rotate(w.a); ctx.globalAlpha = Math.min(1, (0.8 - a) * 4); ctx.scale(k, k); pxt(w.txt, 0, 0, w.col, 16, 'center'); yfRestore(); }
  ctx.globalAlpha = 1;
}
function yfIris(Ys, t, end, mx, cx, zy, z, my) {      // the old cartoon ending: a black circle closes on Yuji (the last 1.3 seconds)
  const k = Math.max(0, Math.min(1, (t - (end - 1.3)) / 1.15)); if (k <= 0) return; const R = Math.hypot(VW, VH) * (1 - k * k), X = Math.round(mx + (Ys.x - cx) * z), Y = Math.round(my + (gy - 34 - Ys.l - zy) * z);
  yfSave(); ctx.beginPath(); ctx.rect(0, 0, VW, VH); ctx.arc(X, Y, Math.max(0.1, R), 0, 6.2832, true); ctx.clip('evenodd'); ctx.fillStyle = '#000'; ctx.fillRect(0, 0, VW, VH); yfRestore();
}
function yfReal(P, t) { let r = t; for (const w of P.slow) if (t > w[0]) r += (Math.min(t, w[1]) - w[0]) * (1 / w[2] - 1); for (const b of P.beats) if (t >= b.at) r += b.fz; return r; }      // the real second at which the clock of the cutscene shows t
function yfPart(s, x, y, vx, vy, g, life, col, sz) { if (s.parts.length < (yfEco() ? 200 : 400)) s.parts.push({ x, y, vx, vy, g, life, age: 0, col, sz: sz || 1 }); }
function yfCracks(s, mx, cx) {      // the floor splits at the heavy blows: red-and-black cracks run out to both sides and stay for a while
  s.cracks = s.cracks.filter(c => s.t - c.t0 < 2.6);
  for (const c of s.cracks) { const age = s.t - c.t0, L = Math.min(c.len, age * c.spd), X = Math.round(mx + c.x - cx); ctx.globalAlpha = Math.max(0, Math.min(1, (2.6 - age) * 1.5));
    for (const dr of [-1, 1]) { let py = gy + 1; for (let sg = 0; sg < L; sg++) { if (sg * 7 % 5 === 0) py += (sg % 3) - 1; py = Math.max(gy - 1, Math.min(gy + 4, py)); ctx.fillStyle = YF_RED; ctx.fillRect(X + dr * sg, py - 1, 1, 1); ctx.fillStyle = YF_DK; ctx.fillRect(X + dr * sg, py, 1, 2); } } }
  ctx.globalAlpha = 1;
}
function yfPartsDraw(s, sdt, mx, cx) { s.parts = s.parts.filter(p => (p.age += sdt) < p.life); for (const p of s.parts) { p.x += p.vx * sdt; p.y += p.vy * sdt; p.vy += p.g * sdt; if (p.y > gy + 3) { p.y = gy + 3; p.vy *= -0.35; p.vx *= 0.7; } ctx.globalAlpha = Math.min(1, (p.life - p.age) * 3); ctx.fillStyle = p.col; ctx.fillRect(Math.round(mx + p.x - cx), Math.round(p.y), p.sz, p.sz); } ctx.globalAlpha = 1; }
function yfGone(s) { const b = s.P.beats[s.P.beats.length - 1], o = b.out; return [b.vx + b.f * (o.dx || 0), gy - 34 - (o.l1 || 0)]; }      // (where the enemy is when he is gone: the end of his last flight)
function yfVanish(s, now, x, y, cols) {      // the enemy is gone: a flash, a ring and a burst of pieces in his colours
  s.fx.push({ k: 'van', x, y, born: now, t0: s.t, cols }); for (let i = 0; i < 64; i++) { const an = Math.random() * 6.2832, v = 30 + Math.random() * 150; yfPart(s, x, y, Math.cos(an) * v, Math.sin(an) * v - 30, 60, 0.9 + Math.random() * 1.1, cols[i % cols.length], 1 + (i % 5 === 0 ? 1 : 0)); } snd('purpleboom');
}
function yfVanDraw(e, s, now, mx, cx) {
  const a = Math.max(0, s.t - e.t0), ra = (now - e.born) / 1000, X = Math.round(mx + e.x - cx), Y = Math.round(e.y); if (a > 1.4 && ra > 1.5) return false;
  if (ra < 0.16) { ctx.globalAlpha = 1 - ra / 0.16; yfDisc(X, Y, 8 + ra * 220, e.cols[0]); } ctx.globalAlpha = Math.max(0, 1 - a / 1.3); yfRing(X, Y, 4 + a * 90, e.cols[0], 2, 0.9, 0); yfRing(X, Y, 4 + a * 90 + 3, e.cols[1] || e.cols[0], 1, 0.9, 0); ctx.globalAlpha = 1; return true;
}
function yfBigDraw(e, s, now, mx, cx) {      // the ELITE FINISHER's blow (3.2 seconds): a white flash, a black disc that swells with a red rim, rings in the air and on the floor, thirty bolts and long ones across the screen, a column of light through the hit
  const a = Math.max(0, s.t - e.t0), ra = (now - e.born) / 1000, X = Math.round(mx + e.x - cx), Y = Math.round(e.y), lite = yfEco();
  if (a > 3.2 && ra > 3.3) return false;
  ctx.globalAlpha = Math.max(0, 0.62 * (1 - a / 1.3)); ctx.fillStyle = YF_DK; ctx.fillRect(X - 700, -500, 1400, 1000);
  const R = Math.min(140, 6 + a * 300), fade = a < 0.6 ? 1 : Math.max(0, 1 - (a - 0.6) / 0.9);
  if (fade > 0) { ctx.globalAlpha = 0.92 * fade; yfDisc(X, Y, R, YF_DK); ctx.globalAlpha = fade; yfRing(X, Y, R, YF_RED, 3, 1, 9); yfRing(X, Y, R + 3, YF_PK, 1, 1, 7); yfRing(X, Y, R * 0.55, YF_RED, 1, 1, 5); }
  if (ra < 0.14) { ctx.globalAlpha = 1 - ra / 0.14; yfDisc(X, Y, 70 * (1 - ra * 4), '#ffffff'); }
  for (let q = 0; q < 5; q++) { const aq = a - q * 0.11; if (aq < 0 || aq >= 1.65) continue; const RR = aq * (150 + 38 * q); ctx.globalAlpha = Math.max(0, 1 - aq / 1.7); yfRing(X, gy + 3, RR, q % 2 ? YF_DK : YF_RED, 2, 0.17, 0); if (q < 3) { yfRing(X, Y, RR * 0.8, YF_DK, 2, 0.9, 6); yfRing(X, Y, RR * 0.8 + 2, YF_RED, 1, 0.9, 6); } }
  if (a < 0.42) { ctx.globalAlpha = 1 - a / 0.42; const nb = lite ? 14 : 30; for (let i = 0; i < nb; i++) yfBolt(X, Y, i / nb * 6.2832 + Math.random() * 0.3, Math.round(16 + 84 * Math.min(1, a / 0.2))); for (let i = 0; i < (lite ? 4 : 8); i++) yfBolt(X + ((Math.random() * 40) | 0) - 20, Y + ((Math.random() * 30) | 0) - 15, (i % 2 ? 0 : Math.PI) + (Math.random() - 0.5) * 0.5, 90 + ((Math.random() * 50) | 0)); }
  if (a < 0.9) { const w = Math.max(0, 10 * (1 - a / 0.9)), c = ra < 0.5 ? 1 : 0.7; ctx.globalAlpha = c; for (const [col, ww] of [[YF_DK, w + 4], [YF_RED, w + 2], [YF_PK, w * 0.6 + 1], ['#ffffff', w * 0.25]]) { ctx.fillStyle = col; ctx.fillRect(Math.round(X - ww / 2), -500, Math.max(1, Math.round(ww)), 1000); } }
  ctx.globalAlpha = 1; return true;
}
function yfFinWorld(s, now, t, mx, cx, Vs, Ys, sdt) {      // the build-up of the ELITE FINISHER under the fighters: the sky darkens, red rays turn behind the enemy, loose rock rises from the floor
  const T8 = s.T8, k = Math.max(0, Math.min(1, (t - (T8 - 3.8)) / 3.4)), post = t > T8 ? Math.max(0, 1 - (t - T8) / 0.9) : 1; if (k <= 0 || post <= 0) return;
  const a = (0.5 * k) * post; ctx.fillStyle = 'rgba(8,0,6,' + a.toFixed(3) + ')'; ctx.fillRect(-VW * 2, -VH * 3, VW * 5, VH * 6);
  const ox = mx + Vs.x - cx, oy = gy - 44 - Math.max(0, Vs.l), nr = yfEco() ? 14 : 30, ph = t * 0.35, v = s.vis;
  ctx.globalAlpha = 0.34 * k * post; for (let i = 0; i < nr; i++) { const an = i / nr * 6.2832 + ph, w = i % 2; ctx.fillStyle = w ? '#a8132b' : '#3a0610'; for (let r = 18; r < 300; r += 3) { const px = Math.round(ox + Math.cos(an) * r), py = Math.round(oy + Math.sin(an) * r * 0.8); if (v && (px < v[0] || px > v[1] || py < v[2] || py > v[3])) continue; ctx.fillRect(px, py, 2 + w, 1); } }
  ctx.globalAlpha = 1;
  for (let i = 0; i < s.deb.length; i++) { const d = s.deb[i], u = (t - (T8 - 3.6) - d.d) * d.v; if (u < 0) continue; const yy = gy + 2 - u - 4 * Math.sin(u * 0.05 + i), xx = mx + s.finX - 120 + d.x * 1.15 - cx + Math.sin(t * 1.3 + i) * 6; if (yy < -200) continue; ctx.globalAlpha = Math.min(1, u / 12) * post * 0.95; ctx.fillStyle = d.c; ctx.fillRect(Math.round(xx), Math.round(yy), d.s + 1, d.s + 1); } ctx.globalAlpha = 1;
}
function yfFinFront(s, now, t, mx, cx, Ys, sdt) {      // the charge: a black ball with a red rim grows at his fist while sparks are drawn into it, red embers climb off him
  const T8 = s.T8, u = (t - (T8 - 3.0)) / 2.45; if (u < 0 || t > T8 - 0.45) return;
  let X = Math.round(mx + Ys.x - cx + 15), Y = Math.round(gy - 31 - Ys.l); if (Ys.pic[0] === 'fxs') { const q = yfYPic(Ys.pic, now), h = q.info.hn[q.fi]; if (h) { X = Math.round(mx + Ys.x - cx - (q.info.cx - q.info.x0) + h[0]); Y = Math.round(gy - 60 - (q.info.top || 0) - Ys.l + h[1]); } }
  const r = 2 + 10 * Math.min(1, u) * Math.min(1, u * 1.6), n = yfEco() ? 8 : 16;
  yfDisc(X, Y, r + 1, YF_RED); yfDisc(X, Y, r, YF_DK);
  for (let i = 0; i < n; i++) { const ph = ((now / 700 + i / n) % 1), an = i * 2.399 + now / 300, d = (1 - ph) * (r + 26); ctx.globalAlpha = Math.min(1, ph * 2); ctx.fillStyle = i % 3 ? YF_RED : '#ffffff'; ctx.fillRect(Math.round(X + Math.cos(an) * d), Math.round(Y + Math.sin(an) * d * 0.8), 1 + (i % 4 === 0 ? 1 : 0), 1); } ctx.globalAlpha = 1;
  for (let i = 0; i < 3 + Math.round(5 * u); i++) bfBolt(X, Y, Math.random() * 6.2832, 3 + ((Math.random() * (4 + 8 * u)) | 0));
  for (let i = 0; i < 12; i++) { const ph = (now / 800 + i / 12) % 1, an = i / 12 * 6.2832 + t * 0.4, d = 78 * (1 - ph) + r; ctx.globalAlpha = 0.65 * Math.min(1, u * 2) * Math.sin(ph * 3.14); ctx.fillStyle = i % 2 ? YF_RED : '#ffd0c8'; for (let q = 0; q < 8; q++) ctx.fillRect(Math.round(X + Math.cos(an) * (d + q)), Math.round(Y + Math.sin(an) * (d + q) * 0.8), 1, 1); } ctx.globalAlpha = 1;
  if (Math.random() < 0.5 + 0.5 * u) spark(s.wx0 + Ys.x + (Math.random() * 16 - 8), gy - 6 - Math.random() * 46, 1, ['#ff2a3a', '#1a0508', '#ff7a5a'], false, Math.random() < 0.5 ? 1 : -1);
}
function yfFrame0(now, dt) {
  const s = yf, P = s.P, S = s.S, mx = Math.round(VW / 2), my = Math.round(VH / 2), w0 = performance.now();
  keyL = keyR = padL = padR = jumpReq = atkReq = crReq = lpReq = dashReq = ceReq = domReq = blockHeld = false; fatReq = 0; slowMs = 0;
  if (s.tapAt > now) s.tapAt = -9;      // (a tap made while the game was paused: the clock has gone back since)
  s.real += dt; const live = now >= s.freeze; if (live) s.t = Math.min(s.end, s.t + dt * s.rate);      // (the clock stops at the end and waits there until the thirtieth second is full)
  let tr = 1; for (const w of P.slow) if (s.t >= w[0] && s.t < w[1]) tr = w[2];
  s.rate += (tr - s.rate) * Math.min(1, dt * 16);
  if (tr < 1 && !s.slow) { s.slow = true; if (!s.skip) snd('slowin'); } else if (tr === 1 && s.slow) { s.slow = false; snd('slowout'); }
  const t = s.t, sdt = live ? dt * s.rate : 0;
  yfEvents(now, t); if (!yf) return;
  const Vs = yfEvalV(P.V, t), Ys = yfEvalY(P.Y, t);
  // ---- the camera
  const ck = yfCamAt(s.cam, t), f0 = yfFocus(P, t - 0.14, ck.w), f1 = yfFocus(P, t, ck.w), f2 = yfFocus(P, t + 0.14, ck.w), cx = 0.25 * f0.x + 0.5 * f1.x + 0.25 * f2.x, hh = 0.25 * f0.h + 0.5 * f1.h + 0.25 * f2.h;
  s.zk *= Math.exp(-dt * 7); s.shake *= Math.exp(-dt * 9); s.roll *= Math.exp(-dt * (s.T8 != null && t > s.T8 ? 2.2 : 5));
  const bh = Math.round(VH * (0.11 + 0.05 * (s.T8 != null ? Math.max(0, Math.min(1, (t - (s.T8 - 3.8)) / 1.2)) : 0)) * yfEase.io(Math.min(1, t / 0.45))), topS = 0.25 * f0.top + 0.5 * f1.top + 0.25 * f2.top;
  // (the shot fits both of them between the cinema bars; a shot with nf = 1, a close-up, only follows the action)
  const zKey = ck.z + s.zk, zfk = Math.max(0, Math.min(1, (zKey - 1) * 1.25)), zyClose = my + ((gy - 40 - Math.min(Math.max(0, hh) * 0.5, 80)) - my) * zfk - ck.dy, zFit = Math.max(1, Math.min(zKey, (VH - 2 * bh - 4) / (topS + 14))), zyFit = gy - (topS - 10) / 2 - ck.dy;
  const z = zFit + (zKey - zFit) * ck.nf, zy = Math.round(zyFit + (zyClose - zyFit) * ck.nf);
  wx = s.wx0 + cx; s.vis = [mx - mx / z - 30, mx + (VW - mx) / z + 30, zy - my / z - 30, zy + (VH - my) / z + 30]; s.vtop = zy - my / z + bh / z;      // (the part of the world that is on the screen, with a margin for the shake and the roll)
  // ---- the world
  ctx.fillStyle = '#000'; ctx.fillRect(0, 0, VW, VH);
  yfSave(); ctx.imageSmoothingEnabled = false;
  if (s.shake > 0.25 && !SET.lite) ctx.translate(Math.round((Math.random() * 2 - 1) * s.shake), Math.round((Math.random() * 2 - 1) * s.shake));
  ctx.translate(mx, my); if (Math.abs(s.roll) > 0.002 && !SET.lite) ctx.rotate(s.roll); if (z !== 1) ctx.scale(z, z); ctx.translate(-mx, -zy);
  ctx.fillStyle = '#070b1e'; ctx.fillRect(-VW * 2, -VH * 3, VW * 5, VH * 3 + gy);
  drawBackdrop(now);
  const post8 = s.T8 != null && t > s.T8 ? Math.max(0, Math.min(1, (t - s.T8) / 0.9)) : 0, dark = Math.min(0.62, 0.16 + 0.045 * s.n + (S.dark || 0)) * (1 - 0.7 * post8); ctx.fillStyle = 'rgba(14,2,10,' + dark.toFixed(3) + ')'; ctx.fillRect(-VW * 2, -VH * 3, VW * 5, VH * 6);
  if (s.T8 != null) yfFinWorld(s, now, t, mx, cx, Vs, Ys, sdt);
  yfCracks(s, mx, cx); drawSmoke(now, sdt); if (S.back) S.back(s, now, t, mx, cx, Vs, Ys, sdt);
  // the enemy (his trail of black copies while he is blasted away)
  const K = s.K, vx = mx + Vs.x - cx;
  if (!Vs.gone) {
    if (s.T8 != null && t > s.T8 && t < s.T8 + 2.2) for (let j = 4; j >= 1; j--) { const g = yfEvalV(P.V, t - 0.05 * j); if (g.gone) continue; const gp = yfVPic(K, g.pose, now, false); yfSpr(tintOf(gp.src, YF_DK), gp.info, mx + g.x - cx, g.l, g.f, { r: g.r, pv: 30, a: 0.5 - 0.1 * j }); yfSpr(tintOf(gp.src, YF_RED), gp.info, mx + g.x - cx + 1, g.l, g.f, { r: g.r, pv: 30, a: 0.25 - 0.05 * j }); }
    if (Vs.tag === 'fly' || Vs.tag === 'slide') { const g1 = yfEvalV(P.V, t - 0.05); if (Math.abs(g1.x - Vs.x) > 3.5) for (let j = 1; j <= 2; j++) { const g = yfEvalV(P.V, t - 0.05 * j), gp = yfVPic(K, g.pose, now, false); yfSpr(tintOf(gp.src, '#2a0a14'), gp.info, mx + g.x - cx, g.l, g.f, { r: g.r, pv: 30, a: 0.34 - 0.1 * j }); } }
    const vp = yfVPic(K, Vs.pose, now, now < s.white); fatShadow(vx, Vs.l, Vs.lying || Vs.tilt > 0.7);
    const rc = tintOf(vp.src, S.rim || '#9fb8ff'); for (const [dx, dy] of Z1) yfSpr(rc, vp.info, vx + dx, Vs.l - dy, Vs.f, { r: Vs.r, pv: 30, sx: Vs.sx, sy: Vs.sy, a: 0.5 });      // (a thin rim of light in his own colour, so a dark enemy does not vanish into the dark picture)
    const tq = S.toon ? yfToon(P, t) : [1, 1]; if (!(S.vdraw && S.vdraw(s, now, t, vp, Vs, vx))) yfSpr(vp.src, vp.info, vx, Vs.l, Vs.f, { r: Vs.r, pv: 30, sx: Vs.sx * tq[0], sy: Vs.sy * tq[1] });
  }
  // Yuji: his shadow, his afterimages while he dashes, the red-and-black aura that grows with every blow, himself
  if (Ys.vis > 0.02) {
    const yp = yfYPic(Ys.pic, now), yx = mx + Ys.x - cx, lift = Ys.l;
    fatShadow(yx, Math.max(0, lift), false);
    if (Ys.pic[0] === 'run' && now - s.dust > 80 && live) { s.dust = now; puff(s.wx0 + Ys.x - 8 * Ys.f, 1); }
    if (post8 > 0 && t < s.T8 + 3.2) { const g = Math.min(1, (3.2 - (t - s.T8)) / 1.2) * 0.07; for (let r = 46; r > 8; r -= 7) { ctx.globalAlpha = g; yfDisc(yx, gy - 30 - lift, r, '#ff2a3a'); } ctx.globalAlpha = 1; }
    if (Ys.ghost) for (let j = 1; j <= 3; j++) { const g = yfEvalY(P.Y, t - 0.04 * j), gp = yfYPic(g.pic, now); yfSpr(tintOf(gp.src, YF_RED), gp.info, mx + g.x - cx, g.l, g.f, { a: 0.36 - 0.09 * j }); }
    const fin = s.T8 != null ? Math.max(0, Math.min(1, (t - (s.T8 - 3.8)) / 3.0)) : 0, ak = Math.min(1, 0.2 + 0.1 * s.n + 0.3 * fin + (S.aura ? S.aura(t) : 0));
    if (ak > 0.05) { const j = Math.floor(now / 70) % 3; for (const [dx, dy] of (s.n >= 6 ? ZN3 : ZN)) yfSpr(tintOf(yp.src, '#e8182c'), yp.info, yx + dx + j - 1, lift - dy, Ys.f, { a: 0.5 * ak * Ys.vis }); for (const [dx, dy] of Z1) yfSpr(tintOf(yp.src, '#1a0508'), yp.info, yx + dx, lift - dy, Ys.f, { a: 0.85 * Math.min(1, ak * 1.3) * Ys.vis }); }      // (they fade with him when he blinks, or a dark silhouette stays behind)
    yfSpr(yp.src, yp.info, yx, lift, Ys.f, { a: Ys.vis });
  }
  if (Ys.blink != null) { const a = Math.abs(Ys.blink - 0.5) * 2; ctx.globalAlpha = 1 - a; for (let i = 0; i < 24; i++) { const u = i / 23, X = Math.round(mx + Ys.bx0 + (Ys.bx1 - Ys.bx0) * u - cx), Y = gy - 30 - Math.round(Ys.bl0 + (Ys.bl1 - Ys.bl0) * u) + ((i * 7) % 5) - 2; ctx.fillStyle = i % 3 ? YF_RED : YF_DK; ctx.fillRect(X, Y, 3, 1); } ctx.globalAlpha = 1; }
  if (s.T8 != null) yfFinFront(s, now, t, mx, cx, Ys, sdt);
  if (S.front) S.front(s, now, t, mx, cx, Vs, Ys, sdt);
  yfWordsDraw(s, now, mx, cx);
  // the effects of the blows, the sparks, the dust
  yfPartsDraw(s, sdt, mx, cx);
  s.fx = s.fx.filter(e => e.k === 'big' ? yfBigDraw(e, s, now, mx, cx) : e.k === 'van' ? yfVanDraw(e, s, now, mx, cx) : yfBFDraw(e, s, now, mx, cx));
  drawSparks(now, sdt);
  yfRestore();
  // ---- on the screen itself: the dark edges, the counter, the lines, the cinema bars, the flashes, the title, the fade
  const beat = s.T8 != null && t > s.T8 - 3.8 && t < s.T8 ? 0.1 * Math.max(0, Math.sin(now / 150)) : 0, vg = Math.min(0.92, 0.25 + 0.08 * s.n + beat) * (1 - 0.55 * post8); ctx.globalAlpha = vg; ctx.drawImage(yfVignette(), 0, 0); ctx.globalAlpha = 1;
  ctx.fillStyle = '#000'; ctx.fillRect(0, 0, VW, bh); ctx.fillRect(0, VH - bh, VW, bh);
  const cA = s.T8 != null && t > s.T8 + 0.9 ? Math.max(0, 1 - (t - s.T8 - 0.9) / 0.3) : 1;      // (the counter fades out as the enemy is blasted away, so it does not sit on his vanishing)
  if (s.n > 0 && cA > 0.02 && !(s.title != null && t >= s.title)) { const a = (now - s.nAt) / 1000, sz = a < 0.12 ? 24 : 16; ctx.globalAlpha = cA; pxt('BLACK FLASH', VW - 8 - safeC, bh + 12, YF_RED, 8, 'right'); pxt('x' + s.n, VW - 8 - safeC, bh + 12 + sz + 4, a < 0.12 ? '#ffffff' : '#ffd0c8', sz, 'right'); ctx.globalAlpha = 1; }
  s.lines = s.lines.filter(l => now - l.born < 2400 && !(l.cut && now >= l.cut)); for (const l of s.lines) { const a = (now - l.born) / 1000, left = Math.min(2.4 - a, l.cut ? (l.cut - now) / 1000 : 9); ctx.globalAlpha = Math.max(0, Math.min(1, a * 6, left * 3)); const fitN = Math.floor((VW - 8) / 8), by = VH - bh - 8; if (!l.big && l.txt.length > fitN) { let k = l.txt.indexOf(' ', l.txt.length >> 1); if (k < 0) k = l.txt.lastIndexOf(' '); if (k > 0) { pxt(l.txt.slice(0, k), mx, by - 10, l.col, 8, 'center'); pxt(l.txt.slice(k + 1), mx, by, l.col, 8, 'center'); continue; } } pxt(l.txt, mx, by, l.col, l.big ? 16 : 8, 'center'); } ctx.globalAlpha = 1;
  if (s.T8 != null && t > s.T8 - 0.5 && t < s.T8) actionLines(mx, my + 8, now, 36);
  if (s.blur && now < s.blur.until) { const k = (s.blur.until - now) / 150, X = Math.round(mx + (s.blur.x - cx) * z), Y = Math.round(my + (s.blur.y - zy) * z); yfSave(); ctx.imageSmoothingEnabled = false; for (const sc of [1.04, 1.09]) { ctx.globalAlpha = 0.3 * k * (sc < 1.06 ? 1 : 0.7); ctx.drawImage(cv, Math.round(X * (1 - sc)), Math.round(Y * (1 - sc)), Math.round(VW * sc), Math.round(VH * sc)); } yfRestore(); }
  yfImpFrames(s, now, mx, my, z, zy, cx);
  if (S.screen) S.screen(s, now, t, mx, my, z, zy, cx, Vs, Ys);
  if (!s.skip && t > 1 && (now - s.tapAt < 1500 || t < 4.5)) { ctx.globalAlpha = now - s.tapAt < 1500 ? 1 : Math.min(0.55, (4.5 - t) * 0.5, (t - 1) * 2); pxt(now - s.tapAt < 1500 ? 'TAP AGAIN TO SKIP' : 'DOUBLE TAP TO SKIP', mx, VH - 4, '#ffffff', 8, 'center'); ctx.globalAlpha = 1; }
  if (s.flash > now && !s.imp) { ctx.globalAlpha = Math.min(1, (s.flash - now) / 180); ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, VW, VH); ctx.globalAlpha = 1; }
  if (s.title != null && t >= s.title) { const k = t - s.title; ctx.fillStyle = 'rgba(0,0,0,' + (0.3 * Math.min(1, k / 0.3)).toFixed(2) + ')'; ctx.fillRect(0, 0, VW, VH); yfTitle(k, 1, Math.round(VH * 0.3)); }
  const fade = Math.max(0, Math.min(1, (t - (s.end - 0.55)) / 0.5)); if (S.iris) yfIris(Ys, t, s.end, mx, cx, zy, z, my); else if (fade > 0) { ctx.fillStyle = 'rgba(0,0,0,' + fade.toFixed(3) + ')'; ctx.fillRect(0, 0, VW, VH); }
  const w = performance.now() - w0; s.work = s.work == null ? w : s.work * 0.9 + w * 0.1; s.dtAvg = s.dtAvg == null ? dt : s.dtAvg * 0.9 + dt * 0.1;
  if (!s.eco && s.t > 1.5 && (s.work > 11 || (!fpsCap() && s.dtAvg > 0.034))) s.eco = true;      // (frames that take too long to make, or come too slowly: from now on the effects are drawn lighter, for the rest of the cutscene)
}
function yfImpFrames(s, now, mx, my, z, zy, cx) {      // the impact frames of the heavy blows, painted over the frozen picture: a hard black-and-white copy with black rays, then the same in negative with red rays
  const im = s.imp; if (!im) return; const a = now - im.at, per = im.n === 8 ? 130 : 55, N = im.n === 8 ? 4 : 2; if (a >= per * N) { if (im.n === 8 && im.snap) { s.snap8 = im.snap; s.snap8At = now; s.cr = []; } s.imp = null; return; }
  if (!im.snap) { const c = document.createElement('canvas'); c.width = cv.width; c.height = cv.height; c.getContext('2d').drawImage(cv, 0, 0); im.snap = c; }
  const k = Math.floor(a / per), X = Math.round(mx + (mx + im.x - cx - mx) * z), Y = Math.round(my + (im.y - zy) * z);
  const rays = (n, r0, r1, col, seed) => { ctx.fillStyle = col; for (let i = 0; i < n; i++) { const an = i / n * 6.2832 + Math.sin(i * 12.9 + seed) * 0.07, ra = r0 + (i * 37 + seed * 11) % 14, rb = r1 + (i * 53 + seed * 7) % 90; for (let r = ra; r < rb; r += 1) ctx.fillRect(Math.round(X + Math.cos(an) * r), Math.round(Y + Math.sin(an) * r * 0.85), 1, 1); } };
  yfSave(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.imageSmoothingEnabled = false; ctx.globalAlpha = 1;
  if (k === 0) { ctx.filter = 'grayscale(1) brightness(3) contrast(6)'; ctx.drawImage(im.snap, 0, 0); ctx.filter = 'none'; rays(30, 10, 60, '#000000', 1); }
  else if (k === 1) { ctx.filter = 'invert(1) brightness(1.4) contrast(2)'; ctx.drawImage(im.snap, 0, 0); ctx.filter = 'none'; rays(30, 8, 50, '#ff1a2e', 2); rays(12, 12, 40, '#000000', 3); }
  else if (k === 2) { ctx.fillStyle = '#0a0204'; ctx.fillRect(0, 0, VW, VH); rays(44, 20, 150, '#ffffff', 4); rays(22, 12, 90, YF_RED, 5); ctx.fillStyle = '#ffffff'; for (let r = -12; r <= 12; r++) { ctx.fillRect(X + r, Y - 1, 1, 3); ctx.fillRect(X - 1, Y + r, 3, 1); } }
  else { ctx.fillStyle = YF_RED; ctx.fillRect(0, 0, VW, VH); ctx.fillStyle = '#ffffff'; ctx.fillRect(0, Y - 4, VW, 9); ctx.fillStyle = YF_DK; for (let i = 0; i < 26; i++) ctx.fillRect(((i * 97 + 13) % VW), Y + ((i % 2 ? 1 : -1) * (8 + (i * 31) % (VH >> 1))), 20 + (i * 17) % 60, 1); }
  yfRestore();
}
// ---------------------------------------------------------------- the scripts. beats: at = when the blow lands (seconds of the cutscene's own clock), mv = Yuji's move (YFM), ap = how he gets there (dash | run | leap | blink | walk | none) taking apT seconds, aph = the height of the leap, yl = how high he is ('match' = as high as the enemy), pre = { t, d }: t seconds before the approach he blinks to d px from the enemy, out = what happens to the enemy (yfOut), z = the camera's zoom at the blow, fz = the freeze, word / line = a comic word or a line of text at the blow; slow = the slow-motion windows [from, to, speed]; cam = more camera keys [time, zoom, weight towards the enemy, shift up, 1 = a close-up that does not fit both in]
// The rules of the enemy's state: after a slide he stands (dazed), after a launch or a fly that ends in the air he hangs, after a fly that lands he lies flat; so a blow on a lying enemy is a low one (slam, sweep, spin), on a hanging one an air blow (yl: 'match'), on a standing one anything.
function yfHex(x, y, r) { for (let i = 0; i < 6; i++) { const a0 = i / 6 * 6.2832 + 0.5236, a1 = (i + 1) / 6 * 6.2832 + 0.5236, x0 = x + Math.cos(a0) * r, y0 = y + Math.sin(a0) * r, x1 = x + Math.cos(a1) * r, y1 = y + Math.sin(a1) * r, n = Math.max(2, Math.round(Math.hypot(x1 - x0, y1 - y0))); for (let q = 0; q <= n; q++) ctx.fillRect(Math.round(x0 + (x1 - x0) * q / n), Math.round(y0 + (y1 - y0) * q / n), 1, 1); } }
function yfBarrier(s, now, t, mx, cx, Vs) {      // GOJO'S INFINITY: a thin shell of hexagons in front of him; it flickers, brightens as Yuji's fist comes close and is broken by the first BLACK FLASH
  const b1 = s.P.beats[0]; if (t > b1.at + 0.02 || Vs.gone) return;
  const near = Math.max(0, Math.min(1, 1 - (b1.at - t) / 0.8)), X = Math.round(mx + Vs.x - cx + 7), Y = Math.round(gy - 34 - Vs.l);
  ctx.globalAlpha = 0.22 + 0.55 * near + 0.1 * Math.sin(now / 90);
  for (const [R, col] of [[27, near > 0.7 ? '#ffffff' : '#9fd8ff'], [21, '#4aa8ff']]) { ctx.fillStyle = col; for (let k = 0; k < 9; k++) { const th = Math.PI + (k - 4) * 0.27 + (R < 25 ? 0.13 : 0); yfHex(X + Math.cos(th) * R, Y + Math.sin(th) * R * 1.3, 3.6); } }
  if (near > 0.2) { ctx.globalAlpha = near; yfRing(X, Y, 28 + 6 * (1 - near), '#9fd8ff', 1, 1.3, 4); }
  ctx.globalAlpha = 1;
}
function yfShatter(s, now, x, y, cols) { for (let i = 0; i < 44; i++) { const an = Math.PI + (Math.random() - 0.5) * 2.4, v = 40 + Math.random() * 170; yfPart(s, x, y, Math.cos(an) * v, Math.sin(an) * v - 30, 200, 0.7 + Math.random() * 0.9, cols[i % cols.length], 1 + (i % 4 === 0 ? 1 : 0)); } snd('arrive'); }
function yfStars(s, now, vx, l, n) { ctx.fillStyle = '#ffe34d'; for (let i = 0; i < n; i++) { const a = now / 260 + i * 6.2832 / n, X = Math.round(vx + Math.cos(a) * 12), Y = Math.round(gy - 66 - l + Math.sin(a) * 3.5); ctx.fillRect(X - 2, Y, 5, 1); ctx.fillRect(X, Y - 2, 1, 5); ctx.fillRect(X - 1, Y - 1, 3, 3); } }
function yfGlitch(s, now, t, vp, Vs, vx, amt, keep) {      // VERITY'S way of being hit: her picture slides apart in strips of four rows, with a magenta and a cyan copy beside it; keep < 1 = strips that are gone for good (she is being deleted)
  const I = vp.info, hx = I.cx - I.x0, seed = (now / 55) | 0, rows = 64;
  yfSave(); ctx.translate(Math.round(vx), gy + 2 - Math.round(Vs.l) - 30); if (Vs.r) ctx.rotate(Vs.r); if (Vs.f < 0) ctx.scale(-1, 1);
  for (const [col, dx0, al] of [['#ff3ad8', -3, 0.4], ['#3ad8ff', 3, 0.4], [null, 0, 1]]) if (amt > 0.05 || !col) { const img = col ? tintOf(vp.src, col) : vp.src; for (let r = 0; r < rows; r += 4) { const h = Math.imul(r * 7919 + seed * 104729 + (col ? col.length : 0), 2246822519) >>> 0; if ((h % 100) / 100 > keep) continue; const dx = Math.round(((h >> 8) % 9 - 4) * amt * 1.4) + dx0 * amt; ctx.globalAlpha = al; ctx.drawImage(img, 0, r, img.width, 4, -hx + dx, -62 - (I.top || 0) + 30 + r, img.width, 4); } }
  yfRestore(); ctx.globalAlpha = 1;
}
function yfGlass(s, now, mx, cx, z, zy, my) {      // the MIRROR: every blow leaves a crack in the glass of the screen (they grow out of the place of the blow and stay); the last one shatters it
  s.cr = s.cr || []; for (const c of s.cr) { const X = Math.round(mx + (c.x - cx) * z), Y = Math.round(my + (c.y - zy) * z), g = Math.min(1, (now - c.born) / 160); ctx.fillStyle = 'rgba(220,250,255,0.75)'; for (let r = 0; r < c.n; r++) { let px = X, py = Y, an = c.a + r * 6.2832 / c.n; const L = c.len * g; for (let q = 0; q < L; q++) { if (q % 7 === 0) an += (((r * 31 + q * 17) % 5) - 2) * 0.22; px += Math.cos(an); py += Math.sin(an); ctx.fillRect(Math.round(px), Math.round(py), 1, 1); } } ctx.fillStyle = 'rgba(20,60,80,0.35)'; for (let r = 0; r < c.n; r += 2) { let px = X + 1, py = Y + 1, an = c.a + r * 6.2832 / c.n; for (let q = 0; q < c.len * g * 0.6; q++) { if (q % 7 === 0) an += (((r * 31 + q * 17) % 5) - 2) * 0.22; px += Math.cos(an); py += Math.sin(an); ctx.fillRect(Math.round(px), Math.round(py), 1, 1); } } }
}
function yfShards(s, now) {      // the glass falls out of the picture: the frame of the last blow in 80 triangles that tilt and drop away, one after the other
  if (!s.snap8) return; const a = (now - s.snap8At) / 1000; if (a > 1.8) return; const cols = 8, rows = 5, cw = VW / cols, ch = VH / rows;
  for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) for (let h = 0; h < 2; h++) {
    const id = (j * cols + i) * 2 + h, d = ((id * 37) % 11) / 11 * 0.25, u = Math.max(0, a - d - 0.12); if (u * 700 > VH * 1.5) continue;
    const x0 = i * cw, y0 = j * ch, tri = h ? [[x0 + cw, y0], [x0 + cw, y0 + ch], [x0, y0 + ch]] : [[x0, y0], [x0 + cw, y0], [x0, y0 + ch]], gx = x0 + cw * (h ? 0.66 : 0.33), gyy = y0 + ch * (h ? 0.66 : 0.33), rot = u * (((id * 13) % 7) - 3) * 0.5, dy = u * u * 520, dx = u * (((id * 29) % 9) - 4) * 14;
    yfSave(); ctx.translate(gx + dx, gyy + dy); ctx.rotate(rot); ctx.translate(-gx, -gyy); ctx.beginPath(); ctx.moveTo(tri[0][0], tri[0][1]); ctx.lineTo(tri[1][0], tri[1][1]); ctx.lineTo(tri[2][0], tri[2][1]); ctx.closePath(); ctx.clip(); ctx.globalAlpha = Math.max(0, 1 - u * 0.9); ctx.drawImage(s.snap8, 0, 0); yfRestore();
    ctx.strokeStyle = 'rgba(230,255,255,0.8)'; ctx.lineWidth = 1; yfSave(); ctx.translate(gx + dx, gyy + dy); ctx.rotate(rot); ctx.translate(-gx, -gyy); ctx.beginPath(); ctx.moveTo(tri[0][0], tri[0][1]); ctx.lineTo(tri[1][0], tri[1][1]); ctx.lineTo(tri[2][0], tri[2][1]); ctx.closePath(); ctx.stroke(); yfRestore();
  }
  ctx.globalAlpha = 1;
}
YFS.gojo = {
  zb: 1.55, rim: '#9fd8ff', spk: ['#9fd8ff', '#ffffff'], vcols: ['#9fd8ff', '#ffffff', '#4aa8ff'],
  beats: [
    { at: 2.6, mv: 'hook', ap: 'dash', apT: 0.5, out: { k: 'slide', dx: 75, T: 0.9, rx: 3 }, z: 2.1, line: 'THE INFINITY BREAKS', lcol: '#ffffff', fx: (s, now, b) => yfShatter(s, now, b.vx - 12, gy - 34, ['#9fd8ff', '#ffffff', '#4aa8ff']) },
    { at: 4.6, mv: 'upper', ap: 'run', apT: 1.3, out: { k: 'launch', T: 0.55, dx: 14, l1: 78 }, z: 1.7 },
    { at: 6.6, mv: 'knee', ap: 'leap', apT: 1.3, aph: 26, yl: 'match', out: { k: 'fly', T: 0.95, dx: 70, h: 24 }, z: 1.8, line: 'SIX EYES CANNOT FOLLOW', lcol: '#9fd8ff' },
    { at: 8.9, mv: 'slam', ap: 'run', apT: 1.15, out: { k: 'fly', T: 0.5, dx: 20, h: 26 }, z: 2.2 },
    { at: 10.8, mv: 'sweep', ap: 'run', apT: 1.2, out: { k: 'fly', T: 0.95, dx: 130, h: 8, turns: 1 }, z: 1.6 },
    { at: 12.9, mv: 'spin', ap: 'run', apT: 1.3, out: { k: 'fly', T: 0.9, dx: 20, h: 8, l1: 95, rot: 0.6 }, z: 1.8, line: 'THE STRONGEST FALLS', lcol: '#ffffff' },
    { at: 14.7, mv: 'dive', ap: 'leap', apT: 1.2, aph: 28, yl: 'match', out: { k: 'fly', T: 0.9, dx: 34, h: 24, land: 'stand', rest: 'kneel' }, z: 1.8 },
    { at: 19.4, mv: 'cbf', ap: 'dash', apT: 0.5, pre: { t: 3.0, d: 96 }, out: { k: 'fly', T: 1.3, dx: 190, h: 30, l1: 84, rot: 2.8, gone: true }, nocam: true, fz: 0.52 }],
  slow: [[17.4, 19.3, 0.45], [19.42, 20.62, 0.3]],
  cam: [[16.6, 1.4, 0.5, 0, 0], [17.6, 1.7, 0.3, 0, 0], [18.7, 2.0, 0.1, 0, 1], [19.15, 3.0, 0.1, 4, 1], [19.5, 2.4, 0.1, 0, 1], [19.95, 1.9, 0.1, -6, 1], [20.3, 1.6, 0.5, 0, 0], [21.2, 1.3, 0.55, 0, 0], [21.65, 1.9, 0.0, 0, 1], [23.5, 2.0, 0.0, 0, 1]], title: 21.45,
  back: (s, now, t, mx, cx, Vs) => yfBarrier(s, now, t, mx, cx, Vs),
  ev: [['l0', 0.9, (s, now) => yfSay('THE INFINITY: UNTOUCHABLE', '#9fd8ff', now)]] };

YFS.verity = {
  zb: 1.55, rim: '#ffe060', spk: ['#ffe060', '#ffffff'], vcols: ['#ffe060', '#ffffff', '#c8a028'],
  beats: [
    { at: 2.8, mv: 'elbow', ap: 'dash', apT: 0.5, out: { k: 'slide', dx: 60, T: 0.8, rx: 0 }, z: 2.2 },
    { at: 4.7, mv: 'push', ap: 'run', apT: 1.2, out: { k: 'fly', T: 1.0, dx: 140, h: 6 }, z: 1.7, line: 'STOP SMILING', lcol: '#ffe060' },
    { at: 6.75, mv: 'slam', ap: 'run', apT: 1.3, out: { k: 'fly', T: 0.55, dx: 14, h: 38 }, z: 2.2 },
    { at: 8.6, mv: 'sweep', ap: 'run', apT: 1.1, out: { k: 'fly', T: 1.0, dx: 100, h: 40, l1: 85, rot: 1.2 }, z: 1.6 },
    { at: 10.65, mv: 'dive', ap: 'leap', apT: 1.3, aph: 26, yl: 'match', out: { k: 'fly', T: 0.9, dx: 80, h: 18 }, z: 1.8 },
    { at: 13.15, mv: 'spin', ap: 'run', apT: 1.3, out: { k: 'fly', T: 0.9, dx: 40, h: 6, l1: 90, rot: 0.8 }, z: 1.8, line: 'DELETE', lcol: '#ff3ad8' },
    { at: 14.9, mv: 'face', ap: 'leap', apT: 1.2, aph: 28, yl: 'match', out: { k: 'fly', T: 0.9, dx: 40, h: 20, land: 'stand', rest: 'kneel' }, z: 1.8 },
    { at: 19.4, mv: 'bfk', ap: 'dash', apT: 0.5, pre: { t: 3.0, d: 96 }, out: { k: 'fly', T: 1.4, dx: 230, h: 0, l1: 38, rot: 0.9, gone: true }, nocam: true, fz: 0.52 }],
  slow: [[17.4, 19.3, 0.45], [19.42, 20.62, 0.3]],
  cam: [[16.6, 1.4, 0.5, 0, 0], [17.6, 1.7, 0.3, 0, 0], [18.7, 2.0, 0.1, 0, 1], [19.15, 3.0, 0.1, 4, 1], [19.5, 2.4, 0.1, 0, 1], [19.95, 1.8, 0.2, -4, 1], [20.4, 1.3, 0.5, 0, 0], [21.3, 1.2, 0.5, 0, 0], [21.7, 1.9, 0.0, 0, 1], [23.5, 2.0, 0.0, 0, 1]], title: 21.45,
  vdraw: (s, now, t, vp, Vs, vx) => { const P = s.P; let g = 0; for (const b of P.beats) { const u = t - b.at; if (u >= 0 && u < 0.4) g = Math.max(g, 1 - u / 0.4); } const T8 = s.T8, o = P.beats[7].out; let keep = 1; if (T8 != null && t > T8 - 0.5) { g = Math.max(g, 0.7); if (t > T8 + 0.2) keep = Math.max(0, 1 - (t - T8 - 0.2) / (o.T - 0.2)); } if (g < 0.05 && keep >= 1) return false; yfGlitch(s, now, t, vp, Vs, vx, g, keep); return true; },
  screen: (s, now, t) => { const T8 = s.T8; if (T8 == null || t < T8 || t > T8 + 2.0) return; const k = 1 - (t - T8) / 2.0; for (let i = 0; i < 9; i++) { const h = Math.imul(i * 7919 + ((now / 70) | 0) * 104729, 2246822519) >>> 0; ctx.globalAlpha = 0.35 * k; ctx.fillStyle = i % 3 ? '#ffe060' : '#ffffff'; ctx.fillRect(h % VW, (h >> 9) % VH, 20 + (h >> 4) % 120, 1 + (h >> 13) % 2); } ctx.globalAlpha = 1; },
  ev: [['l0', 0.9, (s, now) => yfSay("HEY... IT'S ME... IT'S VERITY", '#ffe060', now)]] };
YFS.cat = {
  zb: 1.55, rim: '#ffffff', spk: ['#ffe34d', '#ffffff'], vcols: ['#ffe34d', '#ffffff', '#ff7a5a'], toon: true, iris: true,
  beats: [
    { at: 2.6, mv: 'conc', ap: 'dash', apT: 0.5, out: { k: 'fly', T: 1.0, dx: 130, h: 22, bh: 24 }, z: 2.0, word: 'POW!' },
    { at: 4.7, mv: 'slam', ap: 'run', apT: 1.3, out: { k: 'fly', T: 0.6, dx: 30, h: 44, bh: 20, flat: true }, z: 2.2, word: 'BAM!' },
    { at: 6.6, mv: 'sweep', ap: 'run', apT: 1.2, out: { k: 'fly', T: 1.1, dx: 150, h: 8, turns: 2 }, z: 1.6, word: 'WHAP!' },
    { at: 8.8, mv: 'spin', ap: 'run', apT: 1.3, out: { k: 'fly', T: 0.9, dx: 20, h: 6, l1: 100, rot: 0.7 }, z: 1.8, word: 'ZONK!' },
    { at: 10.7, mv: 'knee', ap: 'leap', apT: 1.3, aph: 28, yl: 'match', out: { k: 'fly', T: 0.9, dx: 60, h: 30, land: 'stand', rest: 'dazed' }, z: 1.8, word: 'BOING!' },
    { at: 13.1, mv: 'elbow', ap: 'run', apT: 1.3, out: { k: 'slide', dx: 70, T: 0.8, rx: 2 }, z: 2.0, word: 'KRAK!' },
    { at: 15.1, mv: 'dive', ap: 'run', apT: 1.3, out: { k: 'fly', T: 0.9, dx: 40, h: 24, land: 'stand', rest: 'kneel' }, z: 1.8, word: 'WHAM!' },
    { at: 19.4, mv: 'cbf', ap: 'dash', apT: 0.5, pre: { t: 3.0, d: 96 }, out: { k: 'fly', T: 1.3, dx: 170, h: 30, l1: 84, rot: 3.2, gone: true }, nocam: true, fz: 0.52, word: 'BLACK FLASH!!', wcol: '#ffffff' }],
  slow: [[17.4, 19.3, 0.45], [19.42, 20.62, 0.3]],
  cam: [[16.6, 1.4, 0.5, 0, 0], [17.6, 1.7, 0.3, 0, 0], [18.7, 2.0, 0.1, 0, 1], [19.15, 3.0, 0.1, 4, 1], [19.5, 2.4, 0.1, 0, 1], [19.95, 1.9, 0.1, -6, 1], [20.3, 1.6, 0.5, 0, 0], [21.2, 1.3, 0.55, 0, 0], [21.65, 1.9, 0.0, 0, 1], [23.0, 2.0, 0.0, 0, 1]], title: 21.2,
  back: (s, now, t, mx, cx) => { const h = s.hole; if (!h) return; const a = (now - h.born) / 1000, q = yfVPic(s.K, ['rx', 7, 0.4], now, false), X = Math.round(mx + h.x - cx), Y = Math.round(h.y); yfSave(); ctx.globalAlpha = Math.min(1, a * 5) * Math.max(0.25, 1 - a * 0.25); ctx.translate(X, Y + 30); ctx.scale(-1.7, 1.7); const hx = q.info.cx - q.info.x0; ctx.drawImage(tintOf(q.src, '#ffffff'), -hx + 1, -62 - (q.info.top || 0)); ctx.drawImage(tintOf(q.src, '#ffffff'), -hx - 1, -62 - (q.info.top || 0)); ctx.drawImage(tintOf(q.src, '#000000'), -hx, -62 - (q.info.top || 0)); yfRestore(); },
  front: (s, now, t, mx, cx, Vs) => { if (!Vs.gone && Vs.pose[0] === 'blue') yfStars(s, now, mx + Vs.x - cx, Vs.l, 3); if (s.hole) { const a = (now - s.hole.born) / 1000; if (a < 2.2) yfStars(s, now, mx + s.hole.x - cx, 150 - (gy - s.hole.y) + 4, 4); } },
  vanish: (s, now, x, y) => { s.hole = { x, y, born: now }; yfVanish(s, now, x, y, ['#ffe34d', '#ffffff', '#ff7a5a']); },
  ev: [['l0', 0.9, (s, now) => yfSay('A CARTOON CANNOT GET HURT... RIGHT?', '#ffe34d', now)]] };
YFS.yuji = {
  zb: 1.55, rim: '#7df4ff', spk: ['#7df4ff', '#ffffff'], vcols: ['#ffffff', '#7df4ff', '#2fc3e6'], glass: true,
  beats: [
    { at: 2.5, mv: 'rkick', ap: 'dash', apT: 0.5, out: { k: 'slide', dx: 70, T: 0.9, rx: 3 }, z: 2.1, line: 'YOUR OWN REFLECTION', lcol: '#7df4ff' },
    { at: 4.4, mv: 'upper', ap: 'run', apT: 1.2, out: { k: 'launch', T: 0.55, dx: 14, l1: 80 }, z: 1.7 },
    { at: 6.45, mv: 'face', ap: 'leap', apT: 1.3, aph: 28, yl: 'match', out: { k: 'fly', T: 1.0, dx: 80, h: 20 }, z: 1.8 },
    { at: 8.8, mv: 'slam', ap: 'run', apT: 1.2, out: { k: 'fly', T: 0.5, dx: 15, h: 28 }, z: 2.2, line: 'ONLY ONE OF YOU', lcol: '#ffffff' },
    { at: 10.7, mv: 'sweep', ap: 'run', apT: 1.2, out: { k: 'fly', T: 1.0, dx: 120, h: 8, turns: 1 }, z: 1.6 },
    { at: 12.9, mv: 'spin', ap: 'run', apT: 1.3, out: { k: 'fly', T: 0.9, dx: 30, h: 8, l1: 90, rot: 0.6 }, z: 1.8 },
    { at: 14.7, mv: 'dive', ap: 'leap', apT: 1.2, aph: 28, yl: 'match', out: { k: 'fly', T: 0.9, dx: 34, h: 24, land: 'stand', rest: 'kneel' }, z: 1.8, line: 'BREAK THE MIRROR', lcol: '#7df4ff' },
    { at: 19.4, mv: 'cbf', ap: 'dash', apT: 0.5, pre: { t: 3.0, d: 96 }, out: { k: 'fly', T: 1.1, dx: 120, h: 20, l1: 44, rot: 1.4, gone: true }, nocam: true, fz: 0.52 }],
  slow: [[17.4, 19.3, 0.45], [19.42, 20.62, 0.3]],
  cam: [[16.6, 1.4, 0.5, 0, 0], [17.6, 1.7, 0.3, 0, 0], [18.7, 2.0, 0.1, 0, 1], [19.15, 3.0, 0.1, 4, 1], [19.5, 2.4, 0.1, 0, 1], [19.95, 1.9, 0.1, -6, 1], [20.3, 1.6, 0.5, 0, 0], [21.2, 1.3, 0.55, 0, 0], [21.65, 1.9, 0.0, 0, 1], [23.5, 2.0, 0.0, 0, 1]], title: 21.45,
  screen: (s, now, t, mx, my, z, zy, cx) => { yfGlass(s, now, mx, cx, z, zy, my); yfShards(s, now); },
  fx: null,
  ev: [] };
