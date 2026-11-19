// ================================================================ v1.213 IRON MAN'S FATALITY (this file is spliced into template.html by build_html.py, right after ryufat.js)
// The user: "add to iron man a fatality here is how it's gonna go: iron man charges forward and smashes the enemy into multiple buildings as he throws the enemy up, we see a slow motion of the enemy with the background as the moon sky but then iron man blasts the enemy in the back as the enemy screams
// iron man pulls his blade out and moves at 100 pixels per 0.01 seconds so he is shown as 1 frames before we see him stab the enemy as the enemy falls down iron man fires a unibeam at his body killing him instantly". Asked: who = "you and the enemy Iron Man", the kill = "skeleton flash, then ash",
// words = "no words" (so the scene has no text at all, only the title and the sounds), and "also add iron man to normal battle" (tools/select.js).
// THE SCENE (about 14 s with its own clock, the attacker on the left; when the enemy Iron Man does it to you the whole picture is turned round like Ryu's): 1 In a night street Iron Man crouches, then flies at the enemy with his fist in his stomach and carries him through FOUR buildings (each one: the wall bursts,
// a tunnel is torn through it, the far wall bursts out). 2 He brakes and throws him up: the camera follows him up, the street drops away and the MOON SKY comes in, in slow motion. 3 Iron Man rises under him and blasts him in the back with the repulsor: the enemy arches, screams and spins.
// 4 The blade comes out of the forearm; at the right moment Iron Man crosses 100 px in 0.01 s (10 000 px a second): he is on the screen in exactly ONE frame (a streak), the next frame the blade is through the enemy. 5 He is thrown off the blade and falls; Iron Man charges the reactor and fires the UNIBEAM at his body: a white-out, then ONE frame
// of his skeleton, then he is ash that the beam blows away. The title, the black. SETTINGS > GAME > GRAPHIC DAMAGE: FULL = blood at the stab; CLEAN = no red; OFF = from the dash to the end of the ash the screen is black (only the sounds play).
const IRF_V = 520, IRF_A = 0.22, IRF_C = 0.09, IRF_BK = 0.3, IRF_HW = 12, IRF_TA = 1.25, IRF_CAMH = 420, IRF_D = 100, IRF_DT = 0.01, IRF_ANG = 1.75;      // (the charge: speed px/s, seconds to reach it, seconds Iron Man needs to reach the enemy, the braking, half of the enemy's width; the ascent in seconds; how far the camera goes up in px; THE DASH: 100 px in 0.01 s; how far he is turned on his side in the flight)
const IRF_BS = [[120, 100], [330, 112], [540, 100], [750, 120]];      // (the four buildings: where the left wall is (px right of the enemy's place), how wide it is)
const irfRaw = u => u <= 0 ? 0 : u < IRF_A ? IRF_V * u * u / (2 * IRF_A) : IRF_V * (IRF_A / 2 + u - IRF_A);      // (how far the pair has gone u seconds after he made contact)
const irfInv = x => x <= 0 ? 0 : x < IRF_V * IRF_A / 2 ? Math.sqrt(2 * IRF_A * x / IRF_V) : IRF_A + (x - IRF_V * IRF_A / 2) / IRF_V;
const IRFT = (() => {      // the timeline, in seconds of cutscene time
  const go = 0.6, c0 = go + IRF_C, hit = IRF_BS.map(b => c0 + irfInv(b[0] - IRF_HW)), out = IRF_BS.map(b => c0 + irfInv(b[0] + b[1] - IRF_HW)), brk = out[3] + 0.16, thr = brk + IRF_BK + 0.02, blast = thr + IRF_TA, pull = blast + 0.55, dash = blast + 1.05, stab = dash + IRF_DT, yank = stab + 0.5, fire = stab + 0.9, zap = fire + 0.03, rel = fire + 0.95, title = zap + 2.0;
  return { wind: 0.25, go, c0, hit, out, brk, thr, blast, pull, dash, stab, yank, fire, zap, rel, ash: zap + 1.8, title, end: title + 2.0 };      // wind-up | launch | contact | the walls (hit, burst out) | brakes | the throw | the blast | the blade comes out | THE DASH | the stab | he is thrown off it | the beam | it hits him | it dies away | the title | over
})();
const irfX = t => {      // how far (px) the pair has flown since the launch: it speeds up, goes on and brakes after the last building
  const T = IRFT; if (t <= T.c0) return 0; if (t <= T.brk) return irfRaw(t - T.c0);
  const k = Math.min(IRF_BK, t - T.brk); return irfRaw(T.brk - T.c0) + IRF_V * (k - k * k / (2 * IRF_BK));
};
const irfRate = t => {      // the speed of the scene's clock: slow motion from just after the throw to just before the blast
  const T = IRFT, a = T.thr + 0.06, b = a + 0.16, c = T.blast - 0.3;
  return t < a ? 1 : t < b ? lerp(1, 0.3, ease3((t - a) / 0.16)) : t < c ? 0.3 : t < T.blast ? lerp(0.3, 1, ease3((t - c) / 0.3)) : 1;
};
// (the FATAL button while you play Iron Man: fatState asks ryfState, tools/ryufat.js: the same rules as Ryu's, the enemy at 20% health or less and close, half of the energy)
function irfStart(now, rev) {      // rev = the enemy Iron Man does it to you
  const d = dummy, g = CU_GAME[5]; if (!g || typeof c4xIron !== 'function') return false;
  cineClear(); closeSettings(); stickDown = false; d.ai = 'rest'; d.pull = null; d.vx = 0; d.vact = null; d.cact = null; d.cheld = null; d.held = null; d.fa = null; vs.catHold = 0;
  slowAt = -1e9; slowFin = false; stopMs = 0; cuAtkAt = cuJumpAt = -1; cuDash = null; cuShots = []; cuAtkQ = cuLpQ = 0; g.bh = null;      // (a slow motion or a hit-stop of the blow before it is over: the scene runs on real time)
  blkAt = blkEnd = -1; stance = 'stand'; $('pad').classList.add('cine'); $('hud').classList.add('cine'); snd('fatalstart');
  irf = { rev: !!rev, t: 0, ev: {}, parts: [], ash: null, freeze: 0, shake: 0, flash: 0, wx0: wx, vk: rev ? vs.me : vs.foe, gm: gdSet(), vinv: !rev && !!vs.inv, ainv: !!rev && !!vs.inv, V: null, L: null, B: null, K: '', ic: new Map(), dashSeen: false, dashDone: false, zf: -1, lines: 0, lx: 0, ly: 0, said: [] };
  return true;
}
function irfReset() { irf = null; $('pad').classList.remove('cine'); $('hud').classList.remove('cine'); }
function irfEnd(now) {      // he is ash and Iron Man wins the round (the head does not come off: there is nothing left of it)
  const s = irf, rev = s.rev; wx = s.wx0; if (vs) vs.noHead = true; irfReset(); blackUntil = now + 500; if (!vs || vs.ph !== 'fight') return;
  if (rev) { vs.hp = 0; vs.sh = 0; vs.hitAt = now; endRound('enemy', 'fatal', now); return; }
  dummy.hp = 0; dummy.shown = 0; dummy.ko = now - 3000; dummy.koAt = dummy.ko; kos++; endRound('player', 'fatal', now);
}

// ---- the poses of Iron Man (the poses of chapter 5, K5P, and the ones of his moves, made the first time they are needed)
let IRFP = null;
function irfTip(p) { const a = c4xRig(C4I, p).arms[1], L = p.bl + 4; return [a.h[0] + Math.sin(a.a2) * L, a.h[1] + Math.cos(a.a2) * L]; }      // (where the point of the blade is on the 128 x 100 picture of a pose)
function irfPoses() {
  if (IRFP) return IRFP;
  const hv = [{ ax: 40, ay: C4IG - 4, a: -8 }, { ax: 56, ay: C4IG - 6, a: -10 }], P = { fl: 0.55, vis: 1 }, brc = o => irG({ x: 47, y: 66.5, lean: -9, hdx: 0.9, hdy: 1.4, hdt: -9, arms: [{ al: -12, el: 62 }, { al: -8, el: 66 }], legs: [{ ax: 33, ay: C4IG, a: 0 }, { ax: 61, ay: C4IG, a: 0 }], ...o });
  IRFP = {
    wind: { ...K5P.wu, fl: 0.7 }, fly: { ...K5P.sm, fl: 0.95 }, land: { ...K5P.land, fl: 0.45 },
    thr: k5IP({ x: 47, y: 62, lean: -8, hdx: 1, hdt: -12, fl: 0.9, vis: 1, arms: [{ al: 152, el: 8 }, { al: 168, el: 4 }], legs: [{ ax: 42, ay: C4IG - 4, a: -8 }, { ax: 52, ay: C4IG - 5, a: -10 }] }),      // (the throw: both arms swung up over his head)
    aim: k5IP({ x: 47, y: 60, lean: 2, hdx: 1.4, hdt: 2, fl: 0.6, vis: 1, rep: 1, arms: [{ al: 122, el: 2 }, { al: 12, el: 44 }], legs: hv }),      // (the palm held out, up at the enemy)
    rec: k5IP({ x: 45, y: 60, lean: -4, hdx: 1.2, hdt: -3, fl: 0.7, vis: 1, rep: 1, arms: [{ al: 126, el: 2 }, { al: 10, el: 40 }], legs: hv }),      // (the recoil of the shot)
    hov: k5IP({ x: 48, y: 60, lean: 4, hdx: 1.3, hdt: 3, fl: 0.55, vis: 1, arms: [{ al: 20, el: 40 }, { al: 24, el: 50 }], legs: hv }),
    bld: n => ({ ...K5P.blade, ...P, bl: n, legs: hv }),      // (the blade comes out of his forearm, n px long)
    cock: { ...K5P.cock, ...P, legs: hv }, lunge: { ...K5P.lunge, ...P, fl: 0.6, legs: hv }, yank: { ...K5P.s2w, ...P, legs: hv },      // (the blade drawn back | the thrust | the blade raised high)
    brace: brc({ fl: 0.5 }), fire: brc({ y: 66, lean: -10.5, hdt: -10.5, fl: 0.5 }), off: k5IP({ x: 48, y: 60, lean: 3, hdx: 1.2, hdt: 2, fl: 0.2, vis: 1, arms: [{ al: 12, el: 28 }, { al: 8, el: 24 }], legs: hv })
  };
  const l = IRFP.lunge, tp = irfTip(l); IRFP.L = { px: l.x, py: l.y, lx: tp[0], ly: tp[1] };      // (where the blade's point is from his hips in the thrust: it decides where the two of them stand)
  return IRFP;
}
const irfMix = (a, b, k) => c4xMixPose(a, b, Math.round(clamp01(k) * 8) / 8);      // (poses mixed in eighths: every one of them is a picture that is kept)

// ---- the pictures: the victim, the moon and the skylines, the four buildings (made once when the scene starts)
function irfMoon(R) {      // the moon in pixel art: a pale disc with dark seas and craters, shaded towards its rim
  const D = 2 * R + 2, c = document.createElement('canvas'); c.width = c.height = D; const g = c.getContext('2d'), id = g.createImageData(D, D), px = id.data;
  const sea = [[-0.35, -0.2, 0.34], [0.2, 0.28, 0.3], [0.4, -0.32, 0.2], [-0.12, 0.5, 0.2]], cr = [[-0.52, 0.3, 0.12], [0.46, 0.04, 0.1], [-0.16, -0.58, 0.09], [0.1, 0.64, 0.07], [0.62, -0.46, 0.07], [-0.64, -0.16, 0.06], [0.0, 0.0, 0.05]];
  for (let y = 0; y < D; y++) for (let x = 0; x < D; x++) {
    const dx = (x - R) / R, dy = (y - R) / R, r2 = dx * dx + dy * dy; if (r2 > 1) continue;
    let tn = 0.93 - 0.22 * r2; for (const m of sea) if (Math.hypot(dx - m[0], dy - m[1]) < m[2] * (1 + (rfH(x >> 1, y >> 1, 3) - 0.5) * 0.6)) { tn -= 0.17; break; }
    for (const q of cr) { const d = Math.hypot(dx - q[0], dy - q[1]); if (d < q[2]) tn -= 0.09; else if (d < q[2] + 0.035) tn += dy > q[1] ? 0.09 : -0.05; }
    tn = Math.round((tn + (rfH(x, y, 4) - 0.5) * 0.05) * 7) / 7; const i = (y * D + x) * 4; px[i] = Math.min(255, 255 * tn); px[i + 1] = Math.min(255, 250 * tn); px[i + 2] = Math.min(255, 218 * tn); px[i + 3] = 255;
  }
  g.putImageData(id, 0, 0); return c;
}
function irfSkyline(w, h, col, win, seed, beacon) {      // a strip of towers (it tiles sideways), their windows lit here and there
  const c = document.createElement('canvas'); c.width = w; c.height = h; const g = c.getContext('2d'); let x = 0, i = 0;
  while (x < w) { const bw = Math.min(w - x, 14 + Math.floor(rfH(i, seed, 1) * 22)), bh = Math.round(h * (0.3 + rfH(i, seed, 2) * 0.7)); g.fillStyle = col; g.fillRect(x, h - bh, bw, bh);
    for (let y = h - bh + 4; y < h - 3; y += 5) for (let q = x + 2; q < x + bw - 2; q += 4) if (rfH(q, y, seed) < 0.22) { g.fillStyle = win; g.fillRect(q, y, 2, 2); }
    if (beacon && rfH(i, seed, 3) < 0.25) { g.fillStyle = '#ff3a3a'; g.fillRect(x + (bw >> 1), h - bh - 3, 1, 1); g.fillStyle = col; g.fillRect(x + (bw >> 1), h - bh - 2, 1, 2); } x += bw + (rfH(i, seed, 4) < 0.3 ? 2 : 0); i++; }
  return c;
}
const IRF_PAL = [      // the four buildings: the wall colours, whether it is brick or glass, the lit and the dark windows, the frames
  { wall: ['#3a2a3c', '#43303f', '#2f2234'], brick: 1, win: ['#ffd98a', '#ffc46a'], dim: '#171a2a', trim: '#5a4458', deb: ['#6a3a3a', '#8a4a42', '#4a2c34', '#a05a4a'] },
  { wall: ['#1b2a44', '#223350', '#16223a'], glass: 1, win: ['#9fe3ff', '#d8f6ff'], dim: '#0f1b30', trim: '#2f4a72', deb: ['#2f4a72', '#3a5a8a', '#1b2a44', '#9fd8ff'] },
  { wall: ['#3a3f4c', '#444a58', '#2f3441'], win: ['#ffe9a8', '#fff3c8'], dim: '#171b26', trim: '#5a6172', deb: ['#5a6172', '#767d8e', '#3a3f4c', '#8e95a6'] },
  { wall: ['#4a3a30', '#54433a', '#3d2f27'], brick: 1, win: ['#ffcf7a', '#ffb85a'], dim: '#1a1816', trim: '#6a5444', deb: ['#7a5a44', '#9a6a4a', '#4a3a30', '#b8825a'] }];
function irfBuilding(k, w, h) {      // one building (w x h): its front, with windows, a shop front at the bottom, and the dark inside that shows through the tunnel
  const P = IRF_PAL[k % 4], c = document.createElement('canvas'), bk = document.createElement('canvas'); c.width = bk.width = w; c.height = bk.height = h; const g = c.getContext('2d'), b = bk.getContext('2d'), R = (x, y, ww, hh, col) => { g.fillStyle = col; g.fillRect(x, y, ww, hh); };
  R(0, 0, w, h, P.wall[0]);
  if (P.brick) for (let y = 0; y < h; y += 4) { R(0, y, w, 1, P.wall[2]); for (let x = ((y >> 2) & 1) * 5; x < w; x += 10) R(x, y, 1, 4, P.wall[2]); } else if (P.glass) for (let x = 0; x < w; x += 12) R(x, 0, 1, h, P.trim); else for (let y = 0; y < h; y += 22) R(0, y, w, 1, P.wall[2]);
  for (let y = 0; y < h; y += 2) R(0, y, w, 2, 'rgba(0,0,0,' + (0.38 * (1 - y / h)).toFixed(2) + ')');      // (darker towards the roof)
  const fl = 22, cw = 14, ox = 3 + ((w - 6) % cw >> 1);
  for (let fy = h - fl * 2 - 6; fy > 8; fy -= fl) for (let x = ox; x + 9 <= w - 3; x += cw) { const lit = rfH(x, fy, k + 7) < 0.42; R(x - 1, fy - 1, 10, 14, P.trim); R(x, fy, 8, 12, lit ? P.win[rfH(x, fy, k + 9) < 0.5 ? 0 : 1] : P.dim); R(x, fy, 8, lit ? 2 : 1, lit ? 'rgba(255,255,255,0.25)' : 'rgba(120,150,200,0.18)'); }
  R(0, 0, w, 4, P.trim); R(0, 4, w, 1, 'rgba(0,0,0,0.5)'); R(0, h - 30, w, 30, '#10131c'); R(0, h - 33, w, 3, ['#a02a2a', '#2a6aa0', '#2aa07a', '#a0702a'][k % 4]);      // (the cornice, the dark ground floor and its awning)
  for (let x = 4; x + 22 <= w - 3; x += 28) { R(x, h - 25, 22, 18, '#05070c'); R(x + 1, h - 24, 20, 16, rfH(x, k, 12) < 0.7 ? '#ffcf70' : '#6a5a3a'); R(x + 1, h - 24, 20, 2, 'rgba(255,255,255,0.3)'); R(x + 10, h - 24, 1, 16, '#05070c'); }
  R(0, 0, 2, h, 'rgba(255,255,255,0.08)'); R(w - 3, 0, 3, h, 'rgba(0,0,0,0.35)'); R(0, h - 40, w, 40, 'rgba(255,190,110,0.06)');
  b.fillStyle = '#090c16'; b.fillRect(0, 0, w, h); for (let y = h - 2; y > 0; y -= 22) { b.fillStyle = '#121a30'; b.fillRect(0, y, w, 2); b.fillStyle = '#2a3556'; for (let x = 6 + (y % 7); x < w; x += 18) b.fillRect(x, y - 21, 3, 1); }
  b.fillStyle = 'rgba(255,170,90,0.07)'; b.fillRect(0, h - 70, w, 70);
  return { c, bk, w, h, cut: 0, k };
}
function irfCut(b, x0, x1) {      // the tunnel: the columns x0 .. x1 of the building are cleared from a ragged top edge down to the ground; the rim is scorched with a few embers
  const g = b.c.getContext('2d'); for (let x = Math.max(0, Math.floor(x0)); x < Math.min(b.w, Math.ceil(x1)); x++) {
    const top = Math.round(b.h - 76 - rfH(x >> 1, b.k, 5) * 10 - rfH(x >> 4, b.k, 6) * 7); g.clearRect(x, top, 1, b.h - top); g.fillStyle = '#04060b'; g.fillRect(x, top - 2, 1, 2);
    if (rfH(x, b.k, 7) < 0.14) { g.fillStyle = '#ff9a3a'; g.fillRect(x, top - 1, 1, 1); } if (rfH(x, b.k, 8) < 0.05) { g.fillStyle = '#ffe9a0'; g.fillRect(x, top - 3, 1, 1); } if (rfH(x, b.k, 9) < 0.03) { g.fillStyle = '#04060b'; g.fillRect(x, top - 8, 1, 8); }      // (a crack runs up from the rim now and then)
  }
  b.cut = Math.max(b.cut, x1);
}
function irfPrep(s) {      // the victim and everything that is drawn many times
  const V = cfVictim({ vk: s.vk, inv: s.vinv }, 0); let img = V.img; if (s.vinv && /^cu/.test(s.vk)) img = invOf(img);
  const bb = rfBox(img), cy = (bb.y0 + bb.y1) / 2; s.V = { img, bb, H: bb.y1 - bb.y0 + 1, hx: V.hx, cy, hh: bb.y1 + 1 - cy, back: Math.max(4, V.hx - bb.x0), front: Math.max(4, bb.x1 - V.hx) };
  s.L = irfPoses().L;
  const R = Math.max(36, Math.min(72, Math.round(VH * 0.34)));
  s.moon = irfMoon(R); s.mR = R; s.sk1 = irfSkyline(640, 120, '#0a1022', 'rgba(190,200,255,0.45)', 11, true); s.sk2 = irfSkyline(640, 84, '#101830', 'rgba(255,214,140,0.7)', 23, false);
  s.B = IRF_BS.map((b, k) => irfBuilding(k, b[1], 260));
  s.stars = Array.from({ length: 90 }, (_, i) => ({ x: rfH(i, 1, 90) * VW, y: -150 + rfH(i, 2, 90) * (VH + 150), r: rfH(i, 3, 90), tw: rfH(i, 4, 90) * 6.28 }));
  s.K = VW + ',' + VH + ',' + gy;
}
const irfIn = (s, c) => { if (!s.ainv) return c; let r = s.ic.get(c); if (!r) { r = invOf(c); s.ic.set(c, r); } return r; };      // (Iron Man's picture, in the colours of the inverted fighter when that is who he is)

// ---- where everything is at the time t (scene places: Iron Man on the left, the enemy on the right)
function irfPose(s, t, now) {
  const T = IRFT, V = s.V, L = s.L, Z = irfPoses(), mx = Math.round(VW / 2), Y0 = gy + 2, S3 = ease3, ph = (a, b) => clamp01((t - a) / (b - a));
  const EX0 = mx + 6, AX0 = mx - 40, IX0 = mx - 62, IXS = IX0 + IRF_D, ysA = 0.36 * VH, yS = 0.5 * VH, iyB = 0.62 * VH, xA = mx + 26, xS = IXS + (L.lx - L.px) - V.back - 9, hipS = yS - 0.08 * V.H - (L.ly - L.py), D4 = T.dash - T.blast;
  const camX = irfX(t), u = clamp01((t - T.thr) / IRF_TA), ys0 = Y0 - V.hh - 14, HU = IRF_CAMH + ys0 - ysA, camY = t < T.thr ? 0 : HU * (1 - (1 - u) * (1 - u)) + (ysA - ys0) * S3(u);
  const Q = { camX, camY, mx, Y0, EX0, IX0, IXS, xS, yS, hipS, u, ysA };
  // ---- the enemy: his middle (x, y), his turn th (clockwise, radians) and the arch of his back
  const te = Math.min(t, T.zap), P = { x: EX0, y: Y0 - V.hh, th: 0, pv: V.cy, hx: V.hx, flip: true }; let bend = 0;
  if (te < T.go) { const f = te > 0.2 ? fearOff(now) : [0, 0]; P.x += f[0]; P.y += f[1]; }
  else if (te < T.thr) { const k = S3((te - T.c0) / 0.12); P.y = Y0 - V.hh - 14 * k; P.th = -0.1 * k + 0.05 * Math.sin(te * 31) * k; const f = fearOff(now); P.x += f[0] * k; P.y += f[1] * k; }
  else if (te < T.blast) { const e = S3(u); P.x = lerp(EX0, xA, e); P.y = lerp(ys0, ysA, e); P.th = lerp(-0.25, 1.6, u); }
  else if (te < T.dash) { const tt = te - T.blast, vy0 = -0.25 * VH, g = 2 * (yS - ysA - vy0 * D4) / (D4 * D4); P.x = xA + (xS - xA) * tt / D4; P.y = ysA + vy0 * tt + 0.5 * g * tt * tt; P.th = 1.6 + (6.283 - 0.1 - 1.6) * tt / D4; bend = 0.9 * Math.exp(-tt / 0.28); const f = fearOff(now); P.x += f[0] * 1.5; P.y += f[1] * 1.5; }
  else if (te < T.yank) { const k = S3((te - T.stab) / 0.1); P.x = xS + 6 * k; P.y = yS; P.th = 6.283 - 0.1 + 0.05 * Math.sin(te * 9); bend = -0.3 * k; }
  else { const tt = te - T.yank; P.x = xS + 6 + 6 * tt; P.y = yS - 60 * tt + 280 * tt * tt; P.th = 6.283 - 0.1 + 3.5 * tt; bend = -0.2 * Math.max(0, 1 - tt / 0.3); }
  Q.en = P; Q.bend = bend; Q.back = rfMap(P, V.hx - V.back * 0.7, V.cy); Q.chest = rfMap(P, V.hx + V.front * 0.2, V.cy - V.H * 0.1);
  // ---- Iron Man: the picture (pose), where his hips are (hx, hy) and how far he is turned
  let pose, hx = AX0, hy = 0, rot = 0; const gr = p => Y0 - 92 + p.y;      // (gr: the hips of a pose that stands on the floor: the soles are on row 92 of its picture)
  if (t < T.wind) { pose = ironIdle(Math.floor(now / 90) % 12, 12); hy = gr(pose); }
  else if (t < T.go) { pose = irfMix(ironIdle(0, 12), Z.wind, ph(T.wind, T.go - 0.05)); hy = gr(pose); }
  else if (t < T.c0) { const k = ph(T.go, T.c0); pose = irfMix(Z.wind, Z.fly, k * 1.6); rot = IRF_ANG * S3(k * 1.3); hx = lerp(AX0, EX0 - 36, k * k); hy = lerp(gr(Z.wind), Y0 - 36, S3(k)); }
  else if (t < T.brk) { pose = Z.fly; rot = IRF_ANG; hx = EX0 - 36; hy = Y0 - 36; }
  else if (t < T.thr) { const k = ph(T.brk, T.thr), a = ph(T.brk, T.brk + IRF_BK); pose = k < 0.7 ? irfMix(Z.fly, Z.land, a) : irfMix(Z.land, Z.thr, (k - 0.7) / 0.3); rot = IRF_ANG * (1 - S3(a)); hx = EX0 - 36 - 6 * S3(a); hy = lerp(Y0 - 36, gr(Z.land), S3(a)); if (k >= 0.7) hy = lerp(gr(Z.land), gr(Z.thr), (k - 0.7) / 0.3); }
  else if (t < T.blast) {      // (he stands where he threw until the camera has gone up, then he comes up after it and arrives under the enemy)
    const k = S3(clamp01((u - 0.25) / 0.75)), hm = gr(Z.thr) + IRF_CAMH - iyB;
    pose = u < 0.12 ? Z.thr : irfMix(Z.thr, Z.hov, (u - 0.12) / 0.2); hx = lerp(EX0 - 42, IX0, k); hy = gr(Z.thr) + camY - hm * k;
  }
  else if (t < T.pull) { const k = ph(T.blast, T.blast + 0.12), m = ph(T.blast + 0.12, T.pull); pose = irfMix(irfMix(Z.aim, Z.rec, k), Z.hov, m); hx = IX0; hy = lerp(iyB, hipS, S3(ph(T.blast, T.pull))) + Math.sin(now / 140) * 1.2; }
  else if (t < T.dash) { const k = ph(T.pull, T.pull + 0.15), m = ph(T.pull + 0.3, T.dash); pose = irfMix(Z.bld(Math.round(26 * k)), Z.cock, S3(m)); hx = IX0 - 3 * S3(m); hy = hipS + Math.sin(now / 140) * 1.2 * (1 - m); }
  else if (t < T.stab) { pose = Z.lunge; hx = IX0 + IRF_D * (t - T.dash) / IRF_DT; hy = hipS; Q.streak = true; }      // (THE DASH: the one frame, 100 px in 0.01 s)
  else if (t < T.yank) { pose = Z.lunge; hx = IXS - 2 * S3(ph(T.stab, T.stab + 0.35)); hy = hipS; }
  else if (t < T.fire) { pose = t < T.yank + 0.18 ? irfMix(Z.lunge, Z.yank, ph(T.yank, T.yank + 0.18)) : irfMix(Z.yank, Z.brace, S3(ph(T.yank + 0.18, T.fire - 0.08))); hx = IXS - 2 - 8 * S3(ph(T.yank, T.fire)); hy = hipS - 3 * S3(ph(T.yank, T.fire)); }
  else if (t < T.rel) { pose = irfMix(Z.brace, Z.fire, Math.floor(now / 45) % 2); hx = IXS - 10; hy = hipS - 3; }
  else { pose = irfMix(Z.fire, Z.off, ph(T.rel, T.rel + 0.5)); hx = IXS - 10; hy = hipS - 3 + 2 * S3(ph(T.rel, T.rel + 0.8)); }
  Q.im = { pose, hx, hy, rot };
  if (t >= T.yank) { const co = c4xRig(C4I, pose).at(0.62, 5.6); Q.core = [Math.round(hx - pose.x + co[0] + 2), Math.round(hy - pose.y + co[1] + 1)]; }      // (where the arc reactor is on the screen: the beam leaves it)
  return Q;
}

// ---- the little things that fly (w = 1: they are in the street's own places and scroll with it; w = 0: they are in the picture)
function irfSp(s, o) { if (s.parts.length < 900) s.parts.push({ x: 0, y: 0, vx: 0, vy: 0, g: 0, life: 1, age: 0, col: '#ffffff', z: 1, w: 0, k: 'px', ...o }); }
function irfDebris(s, x, y, n, dir, sp, cols) { for (let i = 0; i < n; i++) irfSp(s, { x: x + (Math.random() - 0.5) * 6, y: y - Math.random() * 60, vx: dir * (30 + Math.random() * sp) + (Math.random() - 0.5) * 60, vy: -20 - Math.random() * 190, g: 430, life: 0.9 + Math.random() * 0.8, col: cols[i % cols.length], z: 1 + (i % 4 === 0 ? 2 : i % 3 === 0 ? 1 : 0), w: 1 }); }
function irfGlass(s, x, y, n, dir) { for (let i = 0; i < n; i++) irfSp(s, { x: x + (Math.random() - 0.5) * 6, y: y - Math.random() * 60, vx: dir * (40 + Math.random() * 220) + (Math.random() - 0.5) * 60, vy: -30 - Math.random() * 150, g: 380, life: 0.8 + Math.random() * 0.8, col: ['#ffffff', '#cfeeff', '#9fd8ff'][i % 3], z: 1, w: 1, k: 'glass' }); }
function irfDust(s, x, y, n, sp, w) { for (let i = 0; i < n; i++) irfSp(s, { x: x + (Math.random() - 0.5) * 20, y: y - Math.random() * 40, vx: (Math.random() - 0.5) * sp, vy: -Math.random() * sp * 0.35, g: -6, life: 0.8 + Math.random() * 0.9, k: 'dust', z: 3 + ((Math.random() * 3) | 0), col: '#9a9cb0', w }); }
function irfFire(s, x, y, n, sp, w) { for (let i = 0; i < n; i++) { const a = Math.random() * 6.2832, v = 30 + Math.random() * sp; irfSp(s, { x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 20, g: 200, life: 0.25 + Math.random() * 0.35, col: ['#ffffff', '#ffe9a0', '#ff9a3a', '#ff6a1a'][i % 4], z: i % 4 ? 1 : 2, w }); } }
function irfBlood(s, x, y, n, dir) { for (let i = 0; i < n; i++) irfSp(s, { x, y, vx: dir * (20 + Math.random() * 90) + (Math.random() - 0.5) * 50, vy: -Math.random() * 110, g: 420, life: 0.9, col: BLD[i % 4], z: 1 + (i % 4 === 0 ? 1 : 0) }); }
function irfSmash(s, k, kind, now, Q) {      // a wall bursts: kind 0 = the enemy's back goes into the left wall of building k, kind 1 = it comes out of the right wall (the pair is in the middle of the picture, the wall is in the street's own places)
  const y = gy + 2, cols = IRF_PAL[k % 4].deb, wx0 = Q.EX0 + Q.camX + 10;
  if (!kind) { irfDebris(s, wx0, y, 24, 1, 230, cols); irfDebris(s, wx0 - 6, y, 8, -1, 120, cols); irfGlass(s, wx0, y, 16, 1); irfDust(s, wx0, y, 12, 160, 1); irfFire(s, wx0, y - 30, 14, 170, 1); snd('twbreak', 3); snd(k % 2 ? 'concboom' : 'quake'); if (k === 3) snd('c4crunch'); }
  else { irfDebris(s, wx0 + 4, y, 26, 1, 420, cols); irfGlass(s, wx0 + 4, y, 18, 1); irfDust(s, wx0 + 4, y, 16, 220, 1); irfFire(s, wx0 + 4, y - 30, 10, 190, 1); snd('twbreak', 1); snd('twbreak', 3); }
  s.freeze = now + (kind ? 40 : 70); s.efl = now + 120; s.shake = now + (kind ? 200 : 260); s.shAmp = kind ? 2.5 : 4.5; s.flash = kind ? s.flash : now + 50; s.lines = kind ? 0 : now + 150; s.lx = Q.EX0 + 14; s.ly = y - 34;
}
// ---- the sky, the street and the buildings
function irfSky(s, now, cy) {      // the night sky: a gradient, the glow of the city at the horizon (it sinks with the street), stars, the moon (it comes up as the camera does) and a few streaks of cloud
  const gr = ctx.createLinearGradient(0, 0, 0, VH); gr.addColorStop(0, '#03051a'); gr.addColorStop(0.55, '#080e2c'); gr.addColorStop(1, '#101a3e'); ctx.fillStyle = gr; ctx.fillRect(0, 0, VW, VH);
  const hy = gy + cy * 0.9, y0 = Math.max(0, hy - 70), y1 = Math.min(VH, hy); if (y1 > y0) { const g2 = ctx.createLinearGradient(0, hy - 70, 0, hy); g2.addColorStop(0, 'rgba(120,70,110,0)'); g2.addColorStop(1, 'rgba(150,84,96,0.5)'); ctx.fillStyle = g2; ctx.fillRect(0, y0, VW, y1 - y0); }
  for (const q of s.stars) { const y = Math.round(q.y + cy * 0.35); if (y < 0 || y >= VH) continue; ctx.globalAlpha = 0.5 + 0.5 * Math.sin(now / 420 + q.tw); ctx.fillStyle = q.r < 0.12 ? '#ffe9c0' : q.r < 0.2 ? '#cfe0ff' : '#ffffff'; ctx.fillRect(Math.round(q.x), y, q.r < 0.12 ? 2 : 1, 1); } ctx.globalAlpha = 1;
  const R = s.mR, my = Math.round(0.4 * VH - 0.55 * IRF_CAMH + 0.55 * cy), mxx = Math.round(VW / 2) + 30;
  if (my + R * 2.6 > 0 && my - R * 2.6 < VH) { const g3 = ctx.createRadialGradient(mxx, my, R * 0.9, mxx, my, R * 2.6); g3.addColorStop(0, 'rgba(210,220,255,0.3)'); g3.addColorStop(1, 'rgba(210,220,255,0)'); ctx.fillStyle = g3; ctx.fillRect(0, 0, VW, VH); ctx.drawImage(s.moon, mxx - R - 1, my - R - 1); }
  for (let i = 0; i < 6; i++) { const w = Math.round(70 + rfH(i, 1, 33) * 90), x = Math.round(((rfH(i, 2, 33) * (VW + 200) + now * (0.02 + i * 0.006)) % (VW + 200)) - 100), y = Math.round(-260 + rfH(i, 3, 33) * 300 + cy * 0.7); if (y < -4 || y >= VH) continue; for (let r = 0; r < 4; r++) { const ww = Math.round(w * (1 - Math.abs(r - 1.5) * 0.28)); ctx.fillStyle = r === 3 ? 'rgba(150,160,200,0.14)' : 'rgba(18,24,58,0.5)'; ctx.fillRect(x + ((w - ww) >> 1), y + r, ww, 1); } }      // (a cloud: a flat lens of four rows, the lowest one lit by the moon)
}
function irfStreet(s, t, now, Q) {      // the far towers, the road, the lamps and the four buildings (each with the tunnel that the pair has torn through it so far)
  const T = IRFT, cx = Q.camX, cy = Q.camY, EX0 = Q.EX0; if (cy > VH + 130) return;
  const strip = (c, par, y) => { const o = -(((cx * par) % c.width) + c.width) % c.width; for (let x = o; x < VW; x += c.width) ctx.drawImage(c, Math.round(x), y); };
  ctx.save(); ctx.translate(0, Math.round(cy * 0.9)); strip(s.sk1, 0.12, gy + 3 - s.sk1.height); strip(s.sk2, 0.3, gy + 3 - s.sk2.height); ctx.restore();
  ctx.save(); ctx.translate(0, Math.round(cy));
  ctx.fillStyle = '#0f1119'; ctx.fillRect(-8, gy + 1, VW + 16, VH - gy + 10); ctx.fillStyle = '#1c2130'; ctx.fillRect(-8, gy + 1, VW + 16, 6); ctx.fillStyle = '#394258'; ctx.fillRect(-8, gy + 1, VW + 16, 1); ctx.fillStyle = '#05070c'; ctx.fillRect(-8, gy + 7, VW + 16, 1);
  ctx.fillStyle = '#4a5068'; const o = -((cx % 44) + 44) % 44; for (let x = o - 44; x < VW + 44; x += 44) ctx.fillRect(Math.round(x), gy + Math.round((VH - gy) * 0.62), 22, 1);
  for (const r of [40, 275, 490, 695, 910]) { const x = Math.round(EX0 + r - cx); if (x < -30 || x > VW + 30) continue; ctx.fillStyle = 'rgba(255,214,140,0.1)'; ctx.fillRect(x - 6, gy - 46, 26, 46); ctx.fillStyle = '#0b0d14'; ctx.fillRect(x, gy - 48, 2, 50); ctx.fillRect(x, gy - 48, 9, 2); ctx.fillStyle = '#ffe3a0'; ctx.fillRect(x + 6, gy - 46, 5, 2); }      // (the lamps)
  s.B.forEach((b, k) => {
    const x = Math.round(EX0 + IRF_BS[k][0] - cx); if (t >= T.hit[k] && b.cut < b.w) { const to = Math.min(b.w, cx + IRF_HW - IRF_BS[k][0] + 6); if (to > b.cut) irfCut(b, b.cut, to); } if (x > VW + 4 || x + b.w < -4) return;
    const y = gy + 3 - b.h; ctx.drawImage(b.bk, x, y); ctx.drawImage(b.c, x, y);
  });
  ctx.restore();
}
// ---- the figures
function irfDrawV(img, P, bend, fa, bb, dk, dka) {      // the enemy: his picture turned and bent (the upper half is turned about his waist), mirrored so that he looks at Iron Man; fa = how white he is; dk = a darker copy of the picture drawn over it at the strength dka (the night)
  ctx.save(); ctx.translate(Math.round(P.x), Math.round(P.y)); if (P.th) ctx.rotate(P.th); if (P.flip) ctx.scale(-1, 1);
  const yw = Math.round(bb.y0 + (bb.y1 - bb.y0) * 0.5), W = img.width, H = img.height;
  const put = im => { if (bend) { ctx.drawImage(im, 0, yw - 1, W, H - yw + 1, -P.hx, yw - 1 - P.pv, W, H - yw + 1); ctx.save(); ctx.translate(0, yw - P.pv); ctx.rotate(P.flip ? -bend : bend); ctx.drawImage(im, 0, 0, W, yw, -P.hx, -yw, W, yw); ctx.restore(); } else ctx.drawImage(im, -P.hx, -P.pv); };
  put(img); if (dk && dka > 0.02) { ctx.globalAlpha = Math.min(1, dka); put(dk); ctx.globalAlpha = 1; } if (fa > 0.02) { ctx.globalAlpha = Math.min(1, fa); put(whiteOf(img)); ctx.globalAlpha = 1; }
  ctx.restore();
}
function irfIM(s, pose, hx, hy, rot, a) {      // Iron Man: his hips are at (hx, hy); he is turned about them
  const cv = irfIn(s, c4xIron(pose)); ctx.save(); ctx.translate(Math.round(hx), Math.round(hy)); if (rot) ctx.rotate(rot); if (a !== undefined) ctx.globalAlpha = a; ctx.drawImage(cv, Math.round(-pose.x), Math.round(-pose.y)); ctx.restore();
}
function irfDark(s) { const V = s.V; if (V.dk) return V.dk; const c = document.createElement('canvas'); c.width = V.img.width; c.height = V.img.height; const g = c.getContext('2d'); g.drawImage(V.img, 0, 0); g.globalCompositeOperation = 'source-atop'; g.fillStyle = 'rgba(8,12,44,0.5)'; g.fillRect(0, 0, c.width, c.height); return (V.dk = c); }
function irfAim(s, Q, now) {      // where the beam goes: from his reactor to where the enemy will be when it lands
  const E = irfPose(s, IRFT.zap, now).en; s.phi = Math.atan2(E.y - Q.core[1], E.x - Q.core[0]);
}
function irfBeams(s, t, now, Q) {      // the repulsor shot into the back (0.18 s), then the glow of the reactor: a spark that swells into a sun while he charges, a flare while the beam is on
  const T = IRFT, im = Q.im;
  if (t >= T.blast && t < T.blast + 0.18) {
    const k = 1 - (t - T.blast) / 0.18, h = c4xRig(C4I, im.pose).arms[0].h, px = im.hx - im.pose.x + h[0] + 2, py = im.hy - im.pose.y + h[1], B = Q.back;
    for (const [w, c] of [[7, 'rgba(120,220,255,' + (0.5 * k).toFixed(2) + ')'], [4, 'rgba(200,248,255,' + (0.9 * k).toFixed(2) + ')'], [2, '#ffffff']]) bline(px - w / 2, py - w / 2, B[0] - w / 2, B[1] - w / 2, c, w);
    c4xGlow(Math.round(px), Math.round(py), 3 + Math.round(4 * k), ['rgba(120,220,255,0.35)', 'rgba(200,248,255,0.7)', 'rgba(255,255,255,0.95)']); c4xGlow(Math.round(B[0]), Math.round(B[1]), 4 + Math.round(9 * k), ['rgba(120,220,255,0.3)', 'rgba(200,248,255,0.7)', 'rgba(255,255,255,0.95)']);
  }
  if (t >= T.yank + 0.1 && t < T.rel + 0.5) {
    const [cx0, cy0] = Q.core, kk = clamp01((t - T.yank - 0.1) / (T.fire - T.yank - 0.1)), R = t < T.fire ? Math.round(2 + 8 * kk * kk + Math.abs(Math.sin(now * 0.03)) * (0.5 + 1.5 * kk)) : t < T.rel ? 10 + (Math.floor(now / 45) % 3) : Math.max(1, Math.round(10 * (1 - (t - T.rel) / 0.5)));
    irbDisc(cx0, cy0, R + 6, '#ff5a14', 0.18 + 0.12 * kk); irbDisc(cx0, cy0, R + 3, '#ff8a1e', 0.4); irbDisc(cx0, cy0, R, '#ffc21f', 0.92); irbDisc(cx0, cy0, Math.max(2, Math.round(R * 0.66)), '#fff59a', 1); irbDisc(cx0, cy0, Math.max(1, Math.round(R * 0.36)), '#ffffff', 1);
  }
}
function irfUni(s, t, Q) { const T = IRFT; if (s.phi === undefined || t < T.fire) return; ctx.save(); ctx.translate(Q.core[0], Q.core[1]); ctx.rotate(s.phi); iruBeamPaint((t - T.fire) * 1000, (t - T.rel) * 1000, 0, 0, 1, VW + VH, 1); ctx.restore(); }      // (the beam of chapter 5's ULTIMATE, turned to where he will be)
// ---- the kill: one frame of bones, then ash
const IRF_BONES = [[0, 0.15, 0, 0.5], [-0.1, 0.17, 0.1, 0.17], [-0.1, 0.18, -0.15, 0.34], [-0.15, 0.34, -0.13, 0.47], [0.1, 0.18, 0.15, 0.34], [0.15, 0.34, 0.13, 0.47], [-0.07, 0.5, 0.07, 0.5], [-0.05, 0.5, -0.065, 0.74], [-0.065, 0.74, -0.06, 0.96], [0.05, 0.5, 0.065, 0.74], [0.065, 0.74, 0.06, 0.96], [-0.06, 0.97, -0.11, 0.97], [0.06, 0.97, 0.11, 0.97]];      // (the bones of the skeleton as lines: u across, v down, in body heights from the top of his head)
function irfSkel(s, soft) {      // the X-ray: the beam as a pale band, his shape faint and every bone white (soft = no black screen: SETTINGS > FLASHES); s.skf counts the pictures it was drawn in (the tests)
  s.skf = (s.skf | 0) + 1; const P = s.zapP, V = s.V, H = V.H, y0 = V.bb.y0, m = (u, v) => rfMap(P, V.hx + u * H, y0 + v * H), th = Math.max(1, Math.round(H / 38));
  if (!soft) { ctx.fillStyle = '#050a1c'; ctx.fillRect(0, 0, VW, VH); }
  ctx.save(); ctx.translate(s.cx0, s.cy0); ctx.rotate(s.phi); ctx.fillStyle = 'rgba(150,190,255,' + (soft ? 0.1 : 0.2) + ')'; ctx.fillRect(0, -IRU.th, VW + VH, 2 * IRU.th); ctx.fillStyle = 'rgba(210,230,255,0.22)'; ctx.fillRect(0, -IRU.th / 2, VW + VH, IRU.th); ctx.restore();
  ctx.globalAlpha = soft ? 0.3 : 0.32; irfDrawV(whiteOf(V.img), P, 0, 0, V.bb); ctx.globalAlpha = soft ? 0.75 : 1;
  const line = (a, b, c, d, w, col) => { const p = m(a, b), q = m(c, d); bline(p[0] - w / 2, p[1] - w / 2, q[0] - w / 2, q[1] - w / 2, col, w); };
  for (const [w, col] of [[th + 2, 'rgba(120,200,255,0.55)'], [th, '#ffffff']]) {
    for (const b of IRF_BONES) line(b[0], b[1], b[2], b[3], w, col);
    for (let i = 0; i < 5; i++) { const v = 0.2 + 0.035 * i, hw = 0.105 - 0.008 * i; line(-hw, v + 0.025, 0, v, w, col); line(hw, v + 0.025, 0, v, w, col); }      // (the ribs)
    for (let i = 0; i < 6; i++) { const q = m(0, 0.17 + 0.06 * i); ctx.fillStyle = col; ctx.fillRect(Math.round(q[0] - w), Math.round(q[1] - w / 2), 2 * w, w); }      // (the bones of the spine)
  }
  const sk = m(0, 0.065), R = Math.max(3, Math.round(H * 0.075)); ctx.fillStyle = '#ffffff'; for (let yy = -R; yy <= R; yy++) { const w = Math.floor(Math.sqrt(R * R - yy * yy)); ctx.fillRect(Math.round(sk[0] - w), Math.round(sk[1] + yy), 2 * w + 1, 1); }
  ctx.fillStyle = '#050a1c'; for (const e of [m(-0.032, 0.062), m(0.032, 0.062)]) ctx.fillRect(Math.round(e[0]) - 1, Math.round(e[1]) - 1, 2, 2); const jw = m(0, 0.125); ctx.fillStyle = '#ffffff'; ctx.fillRect(Math.round(jw[0]) - 2, Math.round(jw[1]), 4, 2); ctx.globalAlpha = 1;
}
function irfAshMake(s) {      // his pixels, each with the moment it lets go and where it flies: the ones nearest the reactor first, all of them blown along the beam
  const P = s.zapP, img = s.V.img, W = img.width, d = img.getContext('2d').getImageData(0, 0, W, img.height).data, list = [];
  for (let y = 0; y < img.height; y++) for (let x = 0; x < W; x++) { const i = (y * W + x) * 4; if (d[i + 3] > 40) list.push([x, y, d[i], d[i + 1], d[i + 2]]); }
  const step = Math.max(1, Math.ceil(list.length / 1500)), ca = Math.cos(s.phi), sa = Math.sin(s.phi), out = []; let lo = 1e9, hi = -1e9;
  for (let i = 0; i < list.length; i += step) { const p = list[i], m = rfMap(P, p[0], p[1]), pr = (m[0] - s.cx0) * ca + (m[1] - s.cy0) * sa; lo = Math.min(lo, pr); hi = Math.max(hi, pr); out.push({ x: m[0], y: m[1], c: 'rgb(' + p[2] + ',' + p[3] + ',' + p[4] + ')', pr, d: 0, vx: 0, vy: 0, z: i % 5 === 0 ? 2 : 1 }); }
  for (const q of out) { const sp = 40 + Math.random() * 110; q.d = (q.pr - lo) / Math.max(1, hi - lo) * 0.5 + Math.random() * 0.2; q.vx = ca * sp + (Math.random() - 0.5) * 30; q.vy = sa * sp - 15 - Math.random() * 40; }
  s.ash = out;
}
function irfAshDraw(s, t) {      // every pixel stays as it was until its moment, glows white-hot for a breath, goes grey and dark and is blown away
  const a0 = t - IRFT.zap; for (const q of s.ash) { const age = a0 - q.d; let x = q.x, y = q.y, col = q.c, al = 1; if (age > 0) { x += q.vx * age; y += q.vy * age + 18 * age * age; col = age < 0.1 ? '#fff4d0' : age < 0.18 ? '#ffb347' : age < 0.5 ? '#8a8a94' : '#3a3a44'; al = 1 - clamp01((age - 0.6) / 1.3); } if (al <= 0.02) continue; ctx.globalAlpha = al; ctx.fillStyle = col; ctx.fillRect(Math.round(x), Math.round(y), q.z, q.z); } ctx.globalAlpha = 1;
}
function irfParts(s, Q) {
  for (const q of s.parts) {
    const a = q.age / q.life, x = Math.round(q.w ? q.x - Q.camX : q.x), y = Math.round(q.w ? q.y + Q.camY : q.y); if (x < -8 || x > VW + 8 || y < -8 || y > VH + 8) continue;
    if (q.k === 'dust') { ctx.globalAlpha = 0.34 * (1 - a); ctx.fillStyle = q.col; const z = Math.round(q.z + q.age * 5); ctx.fillRect(x - (z >> 1), y - z, z, z); }
    else if (q.k === 'glass') { ctx.globalAlpha = (1 - a * 0.5) * (0.6 + 0.4 * Math.sin(q.age * 40)); ctx.fillStyle = q.col; ctx.fillRect(x, y, 1, 2); }
    else { ctx.globalAlpha = 1 - a * 0.4; ctx.fillStyle = q.col; ctx.fillRect(x, y, q.z, q.z); }
  }
  ctx.globalAlpha = 1;
}
function irfWorld(s, t, now, Q) {      // one picture of the scene (not the flash, the bars and the title)
  const T = IRFT, V = s.V, Z = irfPoses(), im = Q.im, cy = Q.camY;
  irfSky(s, now, cy); irfStreet(s, t, now, Q);
  if (t > T.c0 + 0.1 && t < T.brk + 0.25) { ctx.fillStyle = 'rgba(230,236,255,0.28)'; for (let i = 0; i < 12; i++) { const y = Math.round(rfH(i, 1, 77) * (gy - 6)), l = 24 + Math.round(rfH(i, 2, 77) * 40), x = Math.round((((rfH(i, 3, 77) * (VW + 120) - Q.camX * 1.4) % (VW + 120)) + VW + 120) % (VW + 120)) - 60; ctx.fillRect(x, y, l, 1); } }      // (the air streaming past)
  irfUni(s, t, Q);      // (the beam is behind both of them: his arms and his body stay in front of it)
  if (Q.streak) {      // THE DASH: the one frame he is seen: a smear of him from where he started to where he is going, and a white line through the air along the blade
    const L = s.L, ty = im.hy - L.py + L.ly, x0 = Q.IX0 - L.px + L.lx, x1 = Q.IXS - L.px + L.lx;
    for (let i = 0; i < 9; i++) irfIM(s, Z.lunge, Q.IX0 + IRF_D * i / 9, im.hy, 0, 0.1 + 0.06 * i);
    bline(x0, ty - 2, x1 + 10, ty - 2, 'rgba(255,58,74,0.55)', 1); bline(x0, ty + 2, x1 + 10, ty + 2, 'rgba(255,58,74,0.55)', 1); bline(x0, ty, x1 + 14, ty, '#ffffff', 2);
  }
  irfIM(s, im.pose, im.hx, im.hy, im.rot);
  if (!s.ash) irfDrawV(V.img, Q.en, Q.bend, now < s.efl ? 0.8 * (s.efl - now) / 120 : 0, V.bb, irfDark(s), clamp01(cy / 200));
  irfBeams(s, t, now, Q);
  if (s.ash) irfAshDraw(s, t);
  irfParts(s, Q);
  if (now < s.lines) actionLines(s.lx, s.ly, now, 18);
}
function irfEvents(s, t, now, Q, at, full) {
  const T = IRFT, E = Q.en, ex = Q.EX0 + Q.camX + 10, Y = gy + 2;
  at('wind', T.wind, () => { snd('thrust', 0.7); irfDust(s, Q.mx - 40, Y, 6, 80, 1); });
  at('go', T.go, () => { snd('dash', 0); snd('thrust', 1.3); irfDust(s, Q.mx - 44, Y, 10, 140, 1); s.shake = now + 150; s.shAmp = 2; });
  at('contact', T.c0, () => { s.freeze = now + 60; s.efl = now + 140; s.shake = now + 200; s.shAmp = 3; snd('hit', 3); snd('smack', 3); irfFire(s, Q.EX0 + 8, Y - 34, 12, 150, 1); });
  IRF_BS.forEach((b, k) => { at('h' + k, T.hit[k], () => irfSmash(s, k, 0, now, Q)); at('o' + k, T.out[k], () => irfSmash(s, k, 1, now, Q)); });
  at('brk', T.brk, () => { snd('land', 1.9); snd('thrust', 0.5); irfDust(s, ex - 30, Y, 14, 200, 1); s.shake = now + 200; s.shAmp = 3; });
  at('thr', T.thr, () => { s.freeze = now + 70; s.efl = now + 130; s.shake = now + 260; s.shAmp = 4; snd('swing', 3); snd('smack', 3); snd('thrust', 1.5); irfDust(s, ex - 30, Y, 10, 180, 1); irfFire(s, ex, Y - 40, 12, 150, 1); });
  at('hum', T.thr + 0.2, () => snd('t6hum')); at('boost', T.thr + 0.4, () => snd('thrust', 1.4));
  if (t >= T.thr && t < T.blast && Math.random() < 0.3) irfSp(s, { x: E.x + (Math.random() - 0.5) * 20, y: E.y + 6, vx: (Math.random() - 0.5) * 12, vy: 35 + Math.random() * 50, life: 1.2, col: IRF_PAL[(Math.random() * 4) | 0].deb[(Math.random() * 4) | 0], z: 1 + ((Math.random() * 2) | 0) });      // (bits of the buildings fall away below him)
  if (t >= T.thr + 0.5 && t < T.blast + 0.4 && Math.random() < 0.7) { const im = Q.im; irfSp(s, { x: im.hx + (Math.random() - 0.5) * 8, y: im.hy + 26, vx: (Math.random() - 0.5) * 14, vy: 45 + Math.random() * 40, life: 0.45, col: ['#ffb02e', '#ff7a1a', '#fff3b0'][(Math.random() * 3) | 0], z: 1 }); }      // (the flames of his boots as he comes up)
  at('blast', T.blast, () => { s.freeze = now + 100; s.flash = now + 90; s.shake = now + 320; s.shAmp = 3; s.efl = now + 160; snd('redfire'); snd('thrust', 1.5); snd('hit', 3); snd('concboom'); ffVic(s.vk, 0); irfFire(s, Q.back[0], Q.back[1], 16, 170, 0); });
  at('pull', T.pull, () => snd('shing'));
  at('dash', T.dash, () => { snd('sukimp'); snd('c7whoosh'); });
  at('stab', T.stab, () => { s.freeze = now + 150; s.flash = now + 60; s.shake = now + 380; s.shAmp = 4; s.efl = now + 220; snd('c4stab'); snd('c4crunch'); ffVic(s.vk, 2); s.lx = Q.chest[0]; s.ly = Q.chest[1]; s.lines = now + 170; irfFire(s, Q.chest[0], Q.chest[1], 18, 170, 0); if (full) { irfBlood(s, Q.back[0], Q.back[1], 20, 1); irfBlood(s, Q.chest[0], Q.chest[1], 8, -1); } });
  at('yank', T.yank, () => { s.shake = now + 150; s.shAmp = 2; s.efl = now + 80; snd(full ? 'c4pull' : 'shing'); if (full) irfBlood(s, E.x + 4, E.y, 12, 1); });
  at('chg', T.yank + 0.1, () => snd('irult', 0));
  at('fire', T.fire, () => { snd('irult', 2); s.shake = now + 700; s.shAmp = 4; s.flash = now + 90; });
  at('zap', T.zap, () => { s.freeze = now + 50; s.shake = now + 500; s.shAmp = 5; snd('irult', 3); snd('concboom'); snd('shatter'); });
  at('rel', T.rel, () => snd('irult', 4)); at('title', T.title, () => snd('finisher'));
  if (t >= T.stab + 0.1 && t < T.yank && full && Math.random() < 0.4) irfBlood(s, E.x + 6, E.y + 4, 1, 1);      // (it drips from him)
  if (t >= T.zap && t < T.ash && s.ash && Math.random() < 0.6) irfSp(s, { x: E.x + (Math.random() - 0.5) * 24, y: E.y + (Math.random() - 0.5) * 30, vx: Math.cos(s.phi) * 60, vy: Math.sin(s.phi) * 60 - 20, life: 0.6, col: '#ffcf70', z: 1 });
  for (let k = 0; k < IRF_BS.length; k++) if (t >= T.hit[k] && t < T.out[k] + 0.15) {      // (while they are inside a building: dust and sparks all the time)
    if (Math.random() < 0.8) irfDust(s, ex, Y, 1, 120, 1); if (Math.random() < 0.6) irfFire(s, ex + 4, Y - 34 - Math.random() * 20, 1, 90, 1); if (Math.random() < 0.5) irfDebris(s, ex, Y, 1, -1, 60, IRF_PAL[k % 4].deb);
  }
}
function irfFrame(now, dt) {
  const s = irf, T = IRFT; keyL = keyR = padL = padR = jumpReq = atkReq = crReq = lpReq = dashReq = ceReq = domReq = blockHeld = false; fatReq = 0; cuAtkQ = cuLpQ = 0;
  if (!s.V || s.K !== VW + ',' + VH + ',' + gy) irfPrep(s);
  const live = now >= s.freeze, off = s.gm === 2, full = s.gm === 0;
  if (live) { const st = dt * irfRate(s.t); if (!s.dashSeen && s.t + st >= T.dash) { s.dashSeen = true; s.t = T.dash + IRF_DT / 2; } else if (s.dashSeen && !s.dashDone) { s.dashDone = true; s.t = Math.max(T.stab, s.t + st); } else s.t += st; }      // (THE DASH takes 0.01 s, less than a frame: the frame that would have gone past it is shown at the middle of it, the next one is after it, so he is seen in one frame whatever the speed of the screen)
  const t = s.t, sdt = live ? dt * irfRate(t) : 0, at = (k, tt, f) => { if (!s.ev[k] && t >= tt) { s.ev[k] = 1; f(); } };
  const Q = irfPose(s, t, now); if (t >= T.zap) { s.zf = s.zf < 0 ? 0 : s.zf + 1; if (!s.zapP) s.zapP = { ...Q.en }; }
  if (Q.core) { s.cx0 = Q.core[0]; s.cy0 = Q.core[1]; if (t >= T.fire && s.phi === undefined) irfAim(s, Q, now); }
  irfEvents(s, t, now, Q, at, full); if (t >= T.zap && !s.ash && s.phi !== undefined) irfAshMake(s);
  for (const q of s.parts) { q.age += sdt; q.x += q.vx * sdt; q.y += q.vy * sdt; q.vy += q.g * sdt; } s.parts = s.parts.filter(q => q.age < q.life);
  ctx.save(); ctx.imageSmoothingEnabled = false; ctx.fillStyle = '#000'; ctx.fillRect(0, 0, VW, VH);
  const dark = off && t >= T.dash - 0.05 && t < T.ash + 0.3, soft = SET.nf, skel = s.zapP && s.ash && !off && (soft ? s.zf >= 1 && s.zf < 12 : s.zf === 1);
  if (!dark) {
    ctx.save(); if (s.rev) { ctx.translate(VW, 0); ctx.scale(-1, 1); } const amp = (s.shAmp || 3) * SET.shk / 100; if (now < s.shake) ctx.translate(Math.round((Math.random() * 2 - 1) * amp), Math.round((Math.random() * 2 - 1) * amp)); wx = s.wx0;
    if (skel && !soft) irfSkel(s, false); else { irfWorld(s, t, now, Q); if (skel) irfSkel(s, true); }
    ctx.restore();
  }
  if (now < s.flash && now >= s.freeze - 1 && !dark) { const a = rfFl(0.85); if (a > 0.004) { ctx.globalCompositeOperation = 'difference'; ctx.fillStyle = 'rgba(255,255,255,' + a.toFixed(3) + ')'; ctx.fillRect(0, 0, VW, VH); ctx.globalCompositeOperation = 'source-over'; } }
  if (s.zf === 0 && !off && !soft) { const a = rfFl(0.95); if (a > 0.004) { ctx.fillStyle = 'rgba(255,246,222,' + a.toFixed(3) + ')'; ctx.fillRect(0, 0, VW, VH); } }      // (the white-out as the beam lands)
  if (t >= T.title) { ctx.fillStyle = 'rgba(0,0,0,' + (0.55 * clamp01((t - T.title) / 0.3)).toFixed(2) + ')'; ctx.fillRect(0, 0, VW, VH); fatTitle(t - T.title, 1); }
  const bh = Math.round(VH * 0.11), b = bh * ease3(clamp01(t / 0.3)) * (1 - ease3((t - (T.end - 0.5)) / 0.4)); ctx.fillStyle = '#000'; ctx.fillRect(0, 0, VW, Math.round(b)); ctx.fillRect(0, VH - Math.round(b), VW, Math.round(b));
  const fa = clamp01((t - (T.end - 0.5)) / 0.5); if (fa > 0) { ctx.fillStyle = 'rgba(0,0,0,' + fa.toFixed(3) + ')'; ctx.fillRect(0, 0, VW, VH); }
  ctx.restore();
  if (t >= T.end) irfEnd(now);
}
