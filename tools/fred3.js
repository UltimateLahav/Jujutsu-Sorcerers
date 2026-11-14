// ---------------------------------------------------------------- v1.185 FREDDY'S FATALITY (this file is spliced into template.html by build_html.py, after fred2.js). The user: "add a fatality to freddy kruger where he grabs the enemy by the legs slamming them to the ground as he gets on all 4 and starts eating the enemy's legs as he screams freddy bites his legs ripping them off as he keeps eating the enemy alive the enemy's organs spill out onto freddy as he eats them too while the enemy screams and when freddy is done he wipes his mouth".
// The pictures of Freddy for it are made fresh from his idle picture (the body leans or turns on all fours, the striped sleeves reach out to the glove and the bare hand), see ffPose and ffCrawl.
const ffCv = (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; const g = c.getContext('2d'); g.imageSmoothingEnabled = false; return [c, g]; };
const FF_PX = (g, col, x, y, w, h) => { g.fillStyle = col; g.fillRect(Math.round(x), Math.round(y), w, h); };
function ffSleeve(g, x0, y0, x1, y1, w, off, per) {      // a striped sleeve (as the block's): the dark outline first, then red and green stripes with light on top and shade below
  const n = Math.max(1, Math.round(Math.hypot(x1 - x0, y1 - y0))), o = w >> 1;
  for (let i = 0; i <= n; i++) FF_PX(g, '#14101a', x0 + (x1 - x0) * i / n - o - 1, y0 + (y1 - y0) * i / n - o - 1, w + 2, w + 2);
  for (let i = 0; i <= n; i++) { const px = x0 + (x1 - x0) * i / n, py = y0 + (y1 - y0) * i / n, st = Math.floor((i + off) / per) % 2; FF_PX(g, st ? '#2f7a43' : '#b3303d', px - o, py - o, w, w); FF_PX(g, st ? '#55a868' : '#d6505c', px - o, py - o, w, 1); FF_PX(g, st ? '#1f5430' : '#7a1f2b', px - o, py + o - 1 + (w & 1), w, 1); }
}
function ffArm(g, S, T, o) {      // a whole arm from the shoulder S to the hand T: straight when it is out, bent (the elbow points down) when it is short; the hand: o.claw = the glove with four blades (o.open spreads them, o.dir = the way they point: 1 right, 0 down), else a bare fist
  const dd = Math.hypot(T[0] - S[0], T[1] - S[1]), per = o.per || 3;
  if (dd > 21.5) ffSleeve(g, S[0], S[1], T[0], T[1], 4, 0, per);
  else { const ux = (T[0] - S[0]) / Math.max(1, dd), uy = (T[1] - S[1]) / Math.max(1, dd), a = dd / 2, h = Math.sqrt(Math.max(0, 11 * 11 - a * a)), sg = o.bend || 1, E = [S[0] + ux * a - sg * uy * h, S[1] + uy * a + sg * ux * h]; ffSleeve(g, S[0], S[1], E[0], E[1], 5, 0, per); ffSleeve(g, E[0], E[1], T[0], T[1], 4, 4, per); }
  const hx = Math.round(T[0]), hy = Math.round(T[1]);
  if (!o.claw) { FF_PX(g, '#14101a', hx - 3, hy - 3, 7, 7); FF_PX(g, '#b87c58', hx - 2, hy - 2, 5, 5); FF_PX(g, '#dca878', hx - 2, hy - 2, 5, 1); FF_PX(g, '#dca878', hx - 2, hy - 1, 1, 2); FF_PX(g, '#7a4234', hx - 2, hy + 2, 5, 1); FF_PX(g, '#7a4234', hx, hy - 1, 1, 3); FF_PX(g, '#7a4234', hx + 1, hy - 1, 1, 3); }
  else { FF_PX(g, '#14101a', hx - 3, hy - 3, 7, 7); FF_PX(g, '#7a4e2c', hx - 2, hy - 2, 5, 5); FF_PX(g, '#a8703f', hx - 2, hy - 2, 5, 1); FF_PX(g, '#4a2f1a', hx - 2, hy + 2, 5, 1); FF_PX(g, '#c58a52', hx - 1, hy - 1, 1, 1); FF_PX(g, '#c58a52', hx + 1, hy - 1, 1, 1);
    const sp = o.open ? 4 : 2.5, len = o.open ? 8 : 6, dx = o.dir === 0 ? 0 : 1, dy = o.dir === 0 ? 1 : 0; for (let j = 0; j < 4; j++) { const q = (j - 1.5) * sp / 1.5; for (let i = 3; i < 3 + len; i++) { const f = 1 + (i - 3) * 0.12; FF_PX(g, j === 3 ? '#9aa3b8' : '#e9edf6', hx + dx * i + dy * q * f, hy + dy * i + dx * q * f, 1, 1); } FF_PX(g, '#ffffff', hx + dx * (2 + len) + dy * q * (1 + (len - 1) * 0.12), hy + dy * (2 + len) + dx * q * (1 + (len - 1) * 0.12), 1, 1); } }
}
const FF_POSE = new Map();
function ffPose(o) {      // Freddy standing, leaning (o.lean px at the head), with his near arm (the glove) out to o.na and his far arm (a bare fist) out to o.fa (null = that arm stays as in his idle picture): a 128 x 64 canvas, his hips at column 31 like every picture of his
  const key = JSON.stringify(o); let c = FF_POSE.get(key); if (c) return c; const idle = fredF(0); if (idle === EMPTY) return EMPTY;
  const [cv, g] = ffCv(128, 64); let src = o.na ? fredNoClaw(idle) : idle; if (o.fa) { const [c2, g2] = ffCv(64, 64); g2.drawImage(src, 0, 0); g2.clearRect(10, 17, 17, 21); src = c2; }
  const lean = o.lean || 0; g.drawImage(src, 0, 36, 64, 28, 0, 36, 64, 28);
  if (o.fa) ffArm(g, [25 + Math.round(lean * 0.45), 21 + (o.dy || 0)], o.fa, { claw: false, per: o.per || 3, bend: o.bend || 1 });      // (the far arm is behind the body: drawn first)
  for (let y = 0; y < 36; y++) g.drawImage(src, 0, y, 64, 1, Math.round(lean * (36 - y) / 36), y + (y < 20 ? (o.dy || 0) : 0), 64, 1);
  if (o.na) ffArm(g, [37 + Math.round(lean * 0.45), 21 + (o.dy || 0)], o.na, { claw: true, open: o.open, per: o.per || 3, dir: o.dir === undefined ? 1 : o.dir, bend: o.bend || 1 });
  if (o.blood) { const sh = Math.round(lean * 0.72), y0 = o.dy || 0; FF_PX(g, '#b3121f', 36 + sh, 14 + y0, 6, 1); FF_PX(g, '#7a0c16', 37 + sh, 15 + y0, 4, 1); FF_PX(g, '#b3121f', 39 + sh, 16 + y0, 1, 3); FF_PX(g, '#d4141f', 37 + sh, 13 + y0, 3, 1); }      // (blood on his mouth and chin)
  FF_POSE.set(key, cv); return cv;
}
// ---- on all fours: the upper body turned (the torso 90 degrees, the head a little more), two thighs, two shins on the ground, two arms down to the floor
const FF_CR = new Map();
function ffLeg(g, hip, knee, foot, col, hl) {      // one leg on the ground: the thigh from the hip down to the knee, the shin back along the floor to the foot, a brown shoe
  FF_PX(g, '#120e18', knee[0] - 4, hip[1] - 1, 10, knee[1] - hip[1] + 4); FF_PX(g, col, knee[0] - 3, hip[1], 8, knee[1] - hip[1] + 2); FF_PX(g, hl, knee[0] - 3, hip[1], 1, knee[1] - hip[1] + 2);      // (the thigh)
  FF_PX(g, '#120e18', foot[0] - 1, knee[1] - 3, knee[0] - foot[0] + 6, 7); FF_PX(g, col, foot[0], knee[1] - 2, knee[0] - foot[0] + 4, 5); FF_PX(g, hl, foot[0], knee[1] - 2, knee[0] - foot[0] + 4, 1);      // (the shin on the floor)
  FF_PX(g, '#120e18', foot[0] - 6, knee[1] - 3, 7, 7); FF_PX(g, '#5a3a28', foot[0] - 5, knee[1] - 2, 6, 5); FF_PX(g, '#8a6a3c', foot[0] - 5, knee[1] - 2, 6, 1);      // (the shoe)
}
function ffCrawl(u, bob, jaw, blood) {      // u: 0 = standing (leaning), 1 = on all fours; bob: 0 - 1, the head bobbing; jaw: 0 - 1, how wide the mouth is; blood: the mouth and chin are red; a 128 x 64 canvas, hips at column cv.__hx, the mouth at cv.__mouth, ground at row 62
  u = Math.round(Math.max(0, Math.min(1, u)) * 12) / 12; bob = Math.round(bob * 6) / 6; jaw = Math.round(jaw * 4) / 4; const key = u + ',' + bob + ',' + jaw + ',' + blood; let c = FF_CR.get(key); if (c) return c; const idle = fredF(0); if (idle === EMPTY) return EMPTY;
  const [cv, g] = ffCv(128, 64), [c1, g1] = ffCv(64, 64); g1.drawImage(fredNoClaw(idle), 0, 0); g1.clearRect(10, 17, 17, 21);      // (the body without the glove at the chest and without the arm at his back: both arms are drawn new)
  const D = Math.PI / 180, H0 = [31, 36], N0 = [36, 20], ph = 90 * u * D, ox = 40 - 2 * u, oy = 36 + 4 * u, by = Math.round(2 * Math.sin(bob * Math.PI * 2) * u);
  const R = (p, a, o) => [(p[0] - o[0][0]) * Math.cos(a) - (p[1] - o[0][1]) * Math.sin(a) + o[1][0], (p[0] - o[0][0]) * Math.sin(a) + (p[1] - o[0][1]) * Math.cos(a) + o[1][1]], T = p => R(p, ph, [H0, [ox, oy]]);
  if (u < 0.34) g.drawImage(idle, 0, 36, 64, 28, ox - 31, 36, 64, 28);      // (standing legs, then two legs kneeling on the floor)
  else { ffLeg(g, [ox + 1, oy + 3], [ox + 5, 60], [ox - 14, 60], '#1c1a26', '#34324a'); ffLeg(g, [ox - 2, oy + 3], [ox + 1, 60], [ox - 18, 60], '#2a2634', '#4a4660'); }
  const S2 = T([25, 21]), S1 = T([37, 21]), kn = u > 0.5 ? 1 : 0, T2 = [S2[0] + 1, 61], T1 = [S1[0] + 3 * kn + 2, 61];
  if (u > 0.2) ffArm(g, S2, T2, { claw: false, bend: 1 });      // (the far arm, behind the body)
  g.save(); g.translate(ox, oy); g.rotate(ph); g.drawImage(c1, 0, 20, 64, 17, -H0[0], 20 - H0[1], 64, 17); g.restore();      // (the torso)
  const Nn = T(N0); g.save(); g.translate(Nn[0], Nn[1] + by); g.rotate(ph); g.drawImage(c1, 0, 0, 64, 21, -N0[0], -N0[1], 64, 21); g.restore();      // (the head, turned the same way: his face looks at the floor)
  const mouth = [(40 - N0[0]) * Math.cos(ph) - (13 - N0[1]) * Math.sin(ph) + Nn[0], (40 - N0[0]) * Math.sin(ph) + (13 - N0[1]) * Math.cos(ph) + Nn[1] + by];
  if (u > 0.5) { const m = mouth, w = 2 + Math.round(jaw * 3), h = 1 + Math.round(jaw * 3); if (jaw > 0.2) { FF_PX(g, '#14101a', m[0] - 1, m[1] - 1, w + 2, h + 2); FF_PX(g, blood ? '#8a0e1a' : '#5a1020', m[0], m[1], w, h); for (let i = 0; i < w; i += 2) FF_PX(g, '#f4efe2', m[0] + i, m[1], 1, 1); for (let i = 1; i < w; i += 2) FF_PX(g, '#f4efe2', m[0] + i, m[1] + h - 1, 1, 1); } if (blood) { FF_PX(g, '#b3121f', m[0] - 1, m[1] + 1, w + 2, 1); FF_PX(g, '#7a0c16', m[0] + 1, m[1] + h + 1, 1, 3); FF_PX(g, '#b3121f', m[0] + w - 1, m[1] + h + 1, 1, 2); } }
  if (u > 0.2) ffArm(g, S1, T1, { claw: true, open: false, dir: 1, bend: 1 });      // (the near arm, in front of the body)
  FF_CR.set(key, cv); cv.__mouth = mouth; cv.__hx = ox; return cv;
}
// ---- the scene. The attacker is Freddy on the left, the victim stands on the right, facing him. Times in seconds of the cutscene's own clock.
// 0.5 he runs at the enemy and stoops, 1.1 he GRABS HIS ANKLES (the bones crunch), 1.3 he yanks the legs up (the enemy flips over backwards and hangs upside down from his hands), 2.05 the hang, 2.6 the SLAM: the enemy lands on his back, 3.1 Freddy drops on ALL FOURS at his feet, 3.5 he ROARS, 4.3 he BITES the front leg and shakes it, 5.7 he RIPS IT OFF and eats it (3 chews), 7.4 the second leg, 8.8 off, 10.2 he crawls up the body, 11.0 bites the belly, 11.7 the ORGANS spill out onto him and he eats them (the enemy is still alive and screams), 12.8 the enemy goes quiet, 13.2 Freddy gets up, 13.9 WIPES HIS MOUTH twice with the back of his hand, 15.3 his laugh, 15.8 the title, 17.4 the round ends. The enemy is gone (eaten): the road keeps a pool of blood.
// SETTINGS > GAME > GRAPHIC DAMAGE: FULL = everything; CLEAN = the same without blood and organs (the stumps are pale); OFF = the middle is cut away: from the slam the screen goes dark and only the sounds play (they are played a little closer together), then it fades in on Freddy standing and wiping his mouth.
const FFT = { lunge: 0.5, grab: 1.1, lift: 1.3, top: 2.05, slam: 2.6, down: 3.1, roar: 3.5, bite1: 4.3, rip1: 5.7, eat1: 5.8, bite2: 7.4, rip2: 8.8, eat2: 8.9, crawl: 10.2, belly: 11.0, organs: 11.7, die: 12.8, back: 13.2, wipe: 13.9, laugh: 15.3, title: 15.8, end: 17.4 };
let ff = null;
const FF_VICS = ['gojo', 'yuji', 'verity', 'cat'], FF_BB = new WeakMap();
function ffBox(img) { let b = FF_BB.get(img); if (b) return b; const w = img.width, h = img.height, d = img.getContext('2d').getImageData(0, 0, w, h).data; let x0 = w, x1 = -1, y0 = h, y1 = -1; for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) if (d[(y * w + x) * 4 + 3] > 8) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; } b = { x0, x1, y0, y1 }; FF_BB.set(img, b); return b; }      // (the box the picture really covers)
function ffState(now) {      // Freddy's FATALITY. 0 = ready; 1 = the enemy is above 20% health; 2 = the enemy is too far (or behind him); 3 = not possible right now
  if (!vs || vs.story || vs.cv || vs.net || vs.ph !== 'fight' || js || vf || fat || yf || yu || (dom && domLock()) || ult || cf || ke || fd || fg || fwPh || !dummy || dummy.ko >= 0 || dummy.cap || dummy.mode !== 'fighter' || dummy.curse || !FF_VICS.includes(vs.foe) || (dummy.vform && dummy.vform !== 'verity') || now - spawnAt < 900) return 3;
  if (!(dummy.hp <= dummy.max * FAT_LOW)) return 1;
  if (dummy.x - wx > FAT_RANGE || dummy.x - wx < -4) return 2;
  return hurtAt >= 0 || gojoGone || jumpAt >= 0 || (twOn() && vs.tw.slide) ? 3 : 0;
}
function ffReset() { ff = null; $('pad').classList.remove('cine'); $('hud').classList.remove('cine'); }
function ffStart(now) {
  const d = dummy; d.vact = null; d.cact = null; d.cheld = null; d.held = null; vs.catHold = 0; cineClear(); closeSettings(); stickDown = false; d.ai = 'rest'; d.pull = null; d.vx = 0; fgReset(); fwPh = ''; fwBalls.length = 0; atkAt = -1; atkQ = false; dgAt = -1; blkAt = blkEnd = -1; stance = 'stand'; $('pad').classList.add('cine'); $('hud').classList.add('cine'); snd('fatalstart');
  ff = { t: 0, ev: {}, parts: [], splats: [], freeze: 0, shake: 0, wx0: wx, vx0: d.x, vk: vs.foe, gm: gdSet(), V: null, pc: [null, null], bleed: 0, poolK: 0 };
}
function ffEnd(now) {      // the enemy is gone (eaten) and Freddy wins the round
  const s = ff, d = dummy; wx = s.wx0; const gm = s.gm, vx = s.vx0; ffReset(); blackUntil = now + 500; if (!vs || vs.ph !== 'fight') return;
  d.hp = 0; d.shown = 0; d.ko = now - 3000; d.koAt = d.ko; d.gone = true; kos++;
  if (gm === 0 && !twOn()) { for (let i = 0; i < 4; i++) pools.push({ x: vx + 4 + i * 9, y: 1 + (i & 1), rx: 18 - i * 2, ry: 3 + (i & 1), born: now - 2000, g: 1 }); for (let i = 0; i < 40; i++) addDecal(vx - 8 + ((Math.random() * 70) | 0), 2 + ((Math.random() * 6) | 0), 1 + ((Math.random() * 2) | 0), BLD[(Math.random() * 4) | 0]); }      // (the road keeps its blood)
  endRound('player', 'fatal', now);
}
const ffVic = (vk, k) => { if (vk === 'verity') snd('scream', 2, k === 2 ? 2 : 0); else if (vk === 'cat') snd('scream', 4, k === 2 ? 2 : 0); else snd('c6scream', k); };      // (the victim's voice: 0 = the long scream, 1 = the second, 2 = cut off dead, 3 = the howl)
function ffLegless(img, mask) { if (!mask) return img; const v = goreVar(img, mask, 0); if (v !== img) return v; const [c, g] = ffCv(img.width, img.height); g.drawImage(img, 0, 0); const bb = ffBox(img); g.clearRect(0, bb.y0 + Math.round((bb.y1 - bb.y0) * 0.55), img.width, img.height); return c; }      // (the picture without the legs it has lost; a picture with no patches loses everything below the belly)
function ffFrame(now, dt) {
  const s = ff, T = FFT, off = s.gm === 2, full = s.gm === 0; keyL = keyR = padL = padR = jumpReq = atkReq = crReq = lpReq = dashReq = ceReq = domReq = blockHeld = false; fatReq = 0;
  const live = now >= s.freeze; if (live) s.t += dt * (off && s.t >= T.down && s.t < T.back ? 1.6 : 1); const t = s.t, sdt = live ? dt : 0, at = (k, tt, f) => { if (!s.ev[k] && t >= tt) { s.ev[k] = 1; f(); } };
  const mx = Math.round(VW / 2), FX0 = mx - 40, GX = mx + 24, FX1 = GX - 26, V = s.V || (s.V = cfVictim({ vk: s.vk, inv: false }, 0)), bb = ffBox(V.img), fr = bb.y1 + 1, hx = V.hx, back = hx - bb.x0, vy0 = gy + 2 - 62 - V.top + fr;      // (the victim's feet: where the bottom of his picture is when he stands; back: how far his back reaches behind the middle of the picture)
  const LX = FX1 + 38, LY = gy + 3 - back, D2R = Math.PI / 180;      // (where he lies: his feet, and the height of the middle of his feet so that his back is on the floor)
  const S3 = ease3;
  // ---- the victim's place: the point of his picture that Freddy holds (his feet), and the angle (0 = standing, 90 = lying on his back with his head to the right)
  let vp = [GX, vy0], th = 0, lying = t >= T.slam;
  if (t < T.grab) { const f = fearOff(now); vp = [GX + f[0], vy0 + f[1]]; }
  else if (t < T.lift) { const k = S3((t - T.grab) / (T.lift - T.grab)); vp = [lerp(GX, FX1 + 27, k), vy0 - 8 * k]; th = 20 * k * D2R; }
  else if (t < T.top) { const k = S3((t - T.lift) / (T.top - T.lift)); vp = [lerp(FX1 + 27, FX1 + 32, k), lerp(vy0 - 8, gy - 54, k)]; th = lerp(20, 180, k) * D2R; }
  else if (t < T.slam - 0.15) { vp = [FX1 + 32 + Math.sin(t * 30), gy - 54 + Math.sin(t * 23)]; th = (180 + 4 * Math.sin(t * 17)) * D2R; }
  else if (t < T.slam) { const k = ((t - (T.slam - 0.15)) / 0.15); vp = [lerp(FX1 + 32, LX, k), lerp(gy - 54, LY, k * k)]; th = lerp(180, 90, k * k) * D2R; }
  else { const st = t < T.die ? 1 : 0, j = st * 1.1; vp = [LX + (live ? Math.round(Math.sin(t * 41) * j) : 0), LY + (live ? Math.round(Math.sin(t * 53) * j * 0.6) : 0)]; th = 90 * D2R; }
  const mask = t >= T.rip2 ? 12 : t >= T.rip1 ? 4 : 0, gone = off && t >= T.down;      // (which of his legs are gone)
  // ---- Freddy's mouth on the victim: where the head is while he eats (a screen x), and his place
  const H = bb.y1 - bb.y0, xf = LX + 2, xh = LX + (fr - (bb.y0 + 0.56 * H)), xb = LX + (fr - (bb.y0 + 0.46 * H)), front = bb.x1 - hx;      // (the places on his body: the ankles, the hips, the belly; how far his front reaches above the middle of his picture)
  const mouthX = t < T.bite1 ? xf - 6 : t < T.rip1 ? lerp(xf + 2, xh - 3, S3((t - T.bite1) / (T.rip1 - T.bite1))) : t < T.bite2 - 0.5 ? xh - 3 : t < T.bite2 ? lerp(xh - 3, xf + 2, S3((t - (T.bite2 - 0.5)) / 0.5)) : t < T.rip2 ? lerp(xf + 2, xh - 4, S3((t - T.bite2) / (T.rip2 - T.bite2))) : t < T.crawl ? xh - 4 : t < T.belly ? lerp(xh - 4, xb - 4, S3((t - T.crawl) / (T.belly - T.crawl))) : xb - 3;
  const eating = (t >= T.bite1 && t < T.back), jaw = eating ? Math.abs(Math.sin(t * (t < T.rip1 || (t >= T.bite2 && t < T.rip2) || (t >= T.belly && t < T.organs) ? 7 : 5))) : 0, bob = eating ? (t * 2.2) % 1 : 0;
  // ---- the events: sounds, shakes, blood
  const spray = (x, y, n, pw, dir) => { if (!full) return; for (let i = 0; i < n; i++) { const a = (Math.random() - 0.5) * 2.2, sp = pw * (0.4 + Math.random() * 0.7); s.parts.push({ x: x + (Math.random() - 0.5) * 6, y, vx: Math.sin(a) * sp * 0.8 + dir * pw * 0.3, vy: -Math.cos(a) * sp - 15, c: BLD[(Math.random() * 4) | 0], z: Math.random() < 0.3 ? 2 : 1 }); } };
  const slamX = LX + 10, biteY = gy - 7;
  at('growl', T.lunge, () => snd('ffvoice', 2));
  at('whoosh', T.lunge + 0.05, () => snd('swing', 3));
  at('grab', T.grab, () => { snd('c4crunch'); snd('hit', 3); s.shake = now + 250; ffVic(s.vk, 3); });
  at('lift', T.lift + 0.1, () => snd('swing', 3));
  at('slam', T.slam, () => { snd('land', 1.9); snd('smack', 3); snd('twbreak', 4); s.freeze = now + 130; s.shake = now + 130 + 500; puff(wx + (slamX - mx), 12); gritAt(wx + (slamX - mx), 10, 120, 0); spray(slamX, gy - 4, 10, 90, 1); });
  at('slamyell', T.slam + 0.12, () => ffVic(s.vk, 1));
  at('roar', T.roar, () => snd('ffvoice', 1));
  for (const [k, tt] of [['b1a', T.bite1], ['b1b', T.bite1 + 0.55], ['b1c', T.bite1 + 1.05]]) at(k, tt, () => { snd('c4crunch'); snd('c4stab'); s.shake = now + 160; spray(mouthX + 4, biteY, 8, 80, 1); });
  at('v1', T.bite1 + 0.1, () => ffVic(s.vk, 0));
  at('rip1', T.rip1, () => { snd('rip'); snd('c7tear'); ffVic(s.vk, 3); s.freeze = now + 110; s.shake = now + 110 + 450; spray(mouthX + 2, biteY, 22, 130, 1); s.pc[0] = { at: now }; });
  for (const [k, tt] of [['c1a', T.eat1 + 0.25], ['c1b', T.eat1 + 0.65], ['c1c', T.eat1 + 1.05], ['c1d', T.eat1 + 1.45]]) at(k, tt, () => { snd('ffchew', 0); if (full) snd('c6wet', 1); });
  at('g1', T.eat1 + 1.65, () => snd('ffchew', 1));
  for (const [k, tt] of [['b2a', T.bite2], ['b2b', T.bite2 + 0.55], ['b2c', T.bite2 + 1.05]]) at(k, tt, () => { snd('c4crunch'); snd('c4stab'); s.shake = now + 160; spray(mouthX + 4, biteY, 8, 80, 1); });
  at('v2', T.bite2 + 0.1, () => ffVic(s.vk, 1));
  at('rip2', T.rip2, () => { snd('rip'); snd('c7tear'); ffVic(s.vk, 3); s.freeze = now + 110; s.shake = now + 110 + 450; spray(mouthX + 2, biteY, 22, 130, 1); s.pc[1] = { at: now }; });
  for (const [k, tt] of [['c2a', T.eat2 + 0.25], ['c2b', T.eat2 + 0.65], ['c2c', T.eat2 + 1.05], ['c2d', T.eat2 + 1.45]]) at(k, tt, () => { snd('ffchew', 0); if (full) snd('c6wet', 1); });
  at('g2', T.eat2 + 1.65, () => snd('ffchew', 1));
  at('v3', T.crawl + 0.2, () => snd('scream', s.vk === 'cat' ? 4 : 2, 0));
  at('belly', T.belly, () => { snd('c4stab'); snd('c4crunch'); s.shake = now + 200; spray(mouthX, biteY - 4, 16, 110, 1); });
  at('v4', T.belly + 0.1, () => ffVic(s.vk, 1));
  at('guts', T.organs, () => { if (full) { snd('c4guts'); snd('splat'); } s.shake = now + 260; spray(mouthX + 6, biteY - 6, 14, 90, 1); });
  for (const [k, tt] of [['c3a', T.organs + 0.4], ['c3b', T.organs + 0.85], ['c3c', T.organs + 1.3], ['c3d', T.organs + 1.75]]) at(k, tt, () => { snd('ffchew', 0); if (full) { snd('c6wet', 0); snd('c4guts'); } });
  at('die', T.die, () => { ffVic(s.vk, 2); });
  at('gulp', T.die + 0.4, () => snd('ffchew', 1));
  at('sigh', T.back, () => snd('ffvoice', 0));
  at('swipe1', T.wipe, () => snd('swing', 0)); at('swipe2', T.wipe + 0.6, () => snd('swing', 0));
  at('laugh', T.laugh, () => snd('ffvoice', 3));
  at('title', T.title, () => snd('finisher'));
  for (const q of s.parts) { q.x += q.vx * sdt; q.y += q.vy * sdt; q.vy += 420 * sdt; if (q.y >= gy + 3 && !q.dead) { q.dead = 1; if (s.splats.length < 320) s.splats.push({ x: Math.round(q.x), y: gy + 3 + ((Math.random() * 3) | 0), w: 1 + ((Math.random() * 2) | 0), c: q.c }); } } s.parts = s.parts.filter(q => !q.dead);
  if (full && lying && t < T.back) s.poolK = Math.min(1, s.poolK + sdt * (t >= T.rip1 ? 0.22 : 0.05));
  // ---- draw
  ctx.save(); ctx.imageSmoothingEnabled = false; ctx.fillStyle = '#000'; ctx.fillRect(0, 0, VW, VH);
  const dark = off && t >= T.down && t < T.back - 0.25;      // (OFF: the middle is cut away)
  if (!dark) {
    const jx = () => now < s.shake ? Math.round((Math.random() * 2 - 1) * 2) : 0; ctx.translate(jx(), jx()); wx = s.wx0;
    drawBackdrop(now); ctx.fillStyle = 'rgba(20,0,10,0.28)'; ctx.fillRect(-8, 0, VW + 16, VH); drawSmoke(now, sdt);
    if (full && s.poolK > 0) { const px = LX + 28, rx = 8 + 34 * s.poolK, ry = 2 + 3.2 * s.poolK; for (let yy = -Math.floor(ry); yy <= Math.floor(ry); yy++) { const w = Math.floor(rx * Math.sqrt(Math.max(0, 1 - yy * yy / ((ry + 0.5) * (ry + 0.5))))); ctx.fillStyle = '#4a0810'; ctx.fillRect(Math.round(px - w), gy + 4 + yy, 2 * w + 1, 1); if (Math.abs(yy) < ry - 1) { ctx.fillStyle = '#7a0c16'; ctx.fillRect(Math.round(px - w + 2), gy + 4 + yy, Math.max(0, 2 * w - 3), 1); } } }
    for (const b of s.splats) { ctx.fillStyle = b.c; ctx.fillRect(b.x, b.y, b.w, 1); }
    // the victim
    const vict = () => { if (gone) return; const img = ffLegless(V.img, mask); ctx.save(); ctx.translate(Math.round(vp[0]), Math.round(vp[1])); if (th) ctx.rotate(th); ctx.scale(-1, 1); ctx.drawImage(img, -hx, -fr); ctx.restore(); };
    shadow(lying ? LX + 28 : vp[0], lying ? 30 : 9);
    // the leg that was torn off: it goes into his mouth and is eaten
    const piece = (i, key) => { const p = s.pc[i]; if (!p) return; const eatT = i ? T.eat2 : T.eat1, e = clamp01((t - eatT - 0.2) / 1.5); if (e >= 1) return; if (p.cv === undefined) p.cv = gorePiece(V.img, key, false) || false; if (!p.cv) return;      // (made once; a picture that has no patch for that leg shows no piece)
     const pc = p.cv, k = S3((t - (i ? T.rip2 : T.rip1)) / 0.3), M = [mouthX + 2, biteY - 2], hl = pc.h, c0 = [vp[0] + (pc.cy - fr) * -1, vp[1] + (hx - pc.cx)]; const cX = lerp(c0[0], M[0] + 1 - hl / 2 + hl * (1 - e), k), cY = lerp(c0[1], M[1], k); ctx.save(); ctx.translate(Math.round(cX), Math.round(cY)); ctx.rotate(th); ctx.scale(-1, 1); ctx.drawImage(pc.cv, 0, 0, pc.w, Math.max(1, pc.h * (1 - e)), -pc.w / 2, -pc.h / 2, pc.w, Math.max(1, pc.h * (1 - e))); ctx.restore(); };
    vict();
    if (full && t >= T.organs && !gone) { const wx0 = Math.round(xb), wy0 = Math.round(LY - front + 1); FF_PX(ctx, '#3a0c1c', wx0 - 5, wy0 - 1, 11, 5); FF_PX(ctx, '#8e0c18', wx0 - 4, wy0, 9, 3); FF_PX(ctx, '#d4141f', wx0 - 3, wy0, 5, 1); FF_PX(ctx, '#6e0a12', wx0 - 2, wy0 + 1, 7, 1); }      // (the opened belly)
    // Freddy
    let pic, px, py = gy + 2 - 62;
    if (t < T.lunge) { pic = fredF(now / (1000 / IDLE_FPS)); px = FX0 - 31; }
    else if (t < T.grab) { const k = S3((t - T.lunge) / (T.grab - T.lunge)), fx = lerp(FX0, FX1, k), A = [GX - 1, gy - 2]; px = fx - 31; pic = ffPose({ lean: Math.round(9 * k), dy: Math.round(2 * k), na: [Math.round(lerp(44, A[0] - px, k)), Math.round(lerp(24, A[1] - py, k))], fa: [Math.round(lerp(42, A[0] - px - 3, k)), Math.round(lerp(26, A[1] - py + 1, k))] }); }
    else if (t < T.slam) { px = FX1 - 31; const rx = vp[0] - px, ry = vp[1] - py, lean = t < T.lift ? 9 : t < T.top ? Math.round(lerp(9, -3, S3((t - T.lift) / (T.top - T.lift)))) : t < T.slam - 0.15 ? -3 : Math.round(lerp(-3, 8, (t - (T.slam - 0.15)) / 0.15)); pic = ffPose({ lean, dy: lean > 5 ? 2 : 0, na: [Math.round(rx + 1), Math.round(ry)], fa: [Math.round(rx - 2), Math.round(ry + 1)], open: false }); }
    else if (t < (off ? T.back - 0.3 : T.back)) {
      const u = t < T.down ? lerp(0.25, 1, S3((t - T.slam) / (T.down - T.slam))) : 1, cv = ffCrawl(u, bob, jaw, full && t >= T.rip1 - 0.4), m = cv.__mouth || [62, 50], hip = cv.__hx || 38;
      const hipsX = t < T.down ? lerp(FX1, LX - 5 - (m[0] - hip), S3((t - T.slam) / (T.down - T.slam))) : mouthX - (m[0] - hip);
      pic = cv; px = hipsX - hip; if (u < 1) py = gy + 2 - 62;
    }
    else { const k = S3((t - T.back) / 0.7), w = t < T.wipe ? 0 : Math.floor((t - T.wipe) / 0.3) % 2, fx = lerp(LX + 8, LX + 12, k), wiping = t >= T.wipe && t < T.laugh - 0.3, o = { lean: Math.round(lerp(8, 1, k)), blood: full && t < T.wipe + 1.1 }; px = fx - 31; if (wiping) { o.fa = [w ? 45 : 40, w ? 14 : 12]; o.bend = -1; } pic = ffPose(o); }      // (he stands, and wipes his mouth twice with the back of his bare hand: the blood goes)
    if (pic) ctx.drawImage(pic, Math.round(px), Math.round(py));
    if (!gone && lying) for (const [i, key] of [[0, 'lf'], [1, 'lb']]) piece(i, key);      // (the torn-off leg is drawn over his face: it sticks out of his teeth)
    if (full && t >= T.organs && t < T.back + 0.6) {      // the organs: a rope of intestine from the opened belly to his mouth that he pulls in and eats, and the pieces that spilled onto him and onto the floor
      const W = [xb, LY - front + 2], M = [mouthX + 1, biteY + 2], k = clamp01((t - T.organs) / 0.5) * (1 - clamp01((t - (T.organs + 0.4)) / (T.back - T.organs - 0.4)) * 0.92), n = Math.max(2, Math.round(Math.hypot(M[0] - W[0], M[1] - W[1]) * k / 3));
      for (let pass = 0; pass < 2; pass++) for (let i = 0; i <= n; i++) { const q = i / n * k, x = lerp(W[0], M[0], q), y = lerp(W[1], M[1], q) + Math.sin(q * Math.PI) * 7 + Math.sin(now / 110 + i * 0.9) * 0.9; if (pass === 0) FF_PX(ctx, '#3a0c1c', x - 2, y - 2, 5, 5); else { FF_PX(ctx, i % 2 ? '#c8586e' : '#e0788a', x - 1, y - 1, 3, 3); FF_PX(ctx, '#f0a8b4', x - 1, y - 1, 1, 1); } }
      for (let i = 0; i < 7; i++) { const a = (i * 53) % 37, x = xb - 14 + a, ph = clamp01((t - T.organs - 0.15 * i) / 0.45), y = lerp(LY - front, gy + 2, ph * ph), hold = i < 3 && t > T.organs + 1.5 && t < T.die + 0.6 ? 0 : 1; if (ph <= 0 || !hold) continue; FF_PX(ctx, '#3a0c1c', x - 1, y - 3, 6, 5); FF_PX(ctx, ['#c8586e', '#8a1f33', '#7a3a5e', '#e8c6bb'][i % 4], x, y - 2, 4, 3); FF_PX(ctx, '#f0a8b4', x, y - 2, 1, 1); }
    }
    for (const q of s.parts) { ctx.fillStyle = q.c; ctx.fillRect(Math.round(q.x), Math.round(q.y), q.z, q.z); }
  }
  ctx.restore();
  // ---- on the screen itself: the title, the bars, the fade
  if (t >= T.title) { ctx.fillStyle = 'rgba(0,0,0,' + (0.55 * clamp01((t - T.title) / 0.3)).toFixed(2) + ')'; ctx.fillRect(0, 0, VW, VH); fatTitle(t - T.title, 1); }
  const bh = Math.round(VH * 0.11), bk = clamp01(t / 0.3), b = bh * ease3(bk) * (1 - ease3((t - (T.end - 0.5)) / 0.4)); ctx.fillStyle = '#000'; ctx.fillRect(0, 0, VW, Math.round(b)); ctx.fillRect(0, VH - Math.round(b), VW, Math.round(b));
  const fa = clamp01((t - (T.end - 0.5)) / 0.5); if (fa > 0) { ctx.fillStyle = 'rgba(0,0,0,' + fa.toFixed(3) + ')'; ctx.fillRect(0, 0, VW, VH); }
  if (off && t >= T.back - 0.25 && t < T.back + 0.35) { ctx.fillStyle = 'rgba(0,0,0,' + (1 - clamp01((t - (T.back - 0.25)) / 0.6)).toFixed(3) + ')'; ctx.fillRect(0, 0, VW, VH); }
  if (t >= T.end) ffEnd(now);
}
