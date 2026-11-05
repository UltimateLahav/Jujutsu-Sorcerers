// ================================================================ v1.134 CHAPTER 3, PART 2: THE ALLEY FIGHT (Sukuna against Mahoraga)
// After "THIS BRAT IS A PAIN IN THE ASS" (chapter 3's last scene, tools/chap3.js) Sukuna stands up in the alley, looks round, sees Mahoraga, who charges; Sukuna steps aside, Mahoraga punches the air, Sukuna cuts him to pieces with an X slash and walks away; the wheel turns, Mahoraga is whole again, Sukuna looks back and is punched so hard that he flies up over the roofs of the city (V1.135: the fight in the air).
// Like the hall (chap3.js) the whole scene is ONE stage: where everybody is and which picture each shows are functions of the scene time s (seconds since Sukuna began to rise: s = T - c8R()), so a tap that skips a cut or a test that jumps to a time draws the same picture; the shots only choose the camera. World coordinates = the alley's screen coordinates at zoom 1 (x from the left edge, y from the top, the floor at gy), extended: x may be left of 0 / right of VW and y may be over the top (the sky); wx is 0 in the story.
// (The timeline numbers C8 are in tools/chap3.js, with the shot list; this file is loaded after it.)

// ---- Sukuna's pictures for the scene: Yuji's knock-down pictures (c4YRX 0 - 14: 0 - 4 the fall, 5 - 10 lying, 11 - 14 getting up) with SUKUNA's head on them. His head (the 19 x 20 head block of the idle picture CU_GAME[3].frames[0], hair to chin) is turned about his neck by the angle the body leans (c4YAn: u = the way from his head to his feet) and put on the neck instead of Yuji's head, which is cut away (everything within 14 px of the middle of his hair along the body, and 12 px across it)
const C8_SP = new Map();
function c8SukPic(fi) {
  let c = C8_SP.get(fi); if (c) return c; const p = c4YRX(fi), im = p.set[p.fi], A = c4YAn(im), sk = CU_GAME[3] && CU_GAME[3].frames && CU_GAME[3].frames[0];
  if (!sk || sk.complete === false || !(sk.width || sk.naturalWidth)) return im;
  const w = im.width, h = im.height; c = document.createElement('canvas'); c.width = w; c.height = h; const g = c.getContext('2d'); g.imageSmoothingEnabled = false; g.drawImage(im, 0, 0);
  const id = g.getImageData(0, 0, w, h), d = id.data, ux = A.u[0], uy = A.u[1], hx = A.hair[0], hy = A.hair[1];
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { const vx = x + 0.5 - hx, vy = y + 0.5 - hy, al = vx * ux + vy * uy, pe = vx * uy - vy * ux; if (al > -10 && al < 13.6 && Math.abs(pe) < 12) d[(y * w + x) * 4 + 3] = 0; }
  g.putImageData(id, 0, 0); const ph = Math.atan2(-ux, uy), co = Math.cos(ph), si = Math.sin(ph), nx = hx + ux * 13.9, ny = hy + uy * 13.9;      // (ph: the angle the head is turned by; n: the neck)
  g.setTransform(co, si, -si, co, nx, ny); g.drawImage(sk, 25, 4, 19, 20, -9, -20, 19, 20); g.setTransform(1, 0, 0, 1, 0, 0);
  c.__eye = [nx + co * 2.5 + si * 6.5, ny + si * 2.5 - co * 6.5];      // where his eye is in this picture (the idle picture's eye, at 36.5 / 17.5, turned about the neck 34 / 24 the same way)
  C8_SP.set(fi, c); return c;
}

// ---- the world: the alley (the pictures of the alley of chapters 2 and 3, three screens wide) with the night sky over it: stars, a huge moon, the lit towers of the city in three layers that move less than the camera
const C8W = { key: '', near: null, L: [], ref: { x: 150, y: 70 } };
function c8City(o) {      // one layer of towers drawn once: from the roof (o.hMin - o.hMax px over the alley's top) down to the street, lit windows in o.win at density o.dens, an aerial with a red light on some
  const w = 3 * VW + 200, top = -340, h = 20 - top, c = document.createElement('canvas'); c.width = w; c.height = h; const g = c.getContext('2d'); let x = 0, i = 0;
  while (x < w) {
    const bw = Math.round(o.wMin + c4R(i, o.seed) * (o.wMax - o.wMin)), bh = Math.round(o.hMin + c4R(i, o.seed + 1) * (o.hMax - o.hMin)), y0 = -bh - top;
    if (o.skip && x + bw > o.skip[0] + 100 + VW && x < o.skip[1] + 100 + VW) { x += bw + 2; i++; continue; }      // (the moon's place stays free of towers)
    g.fillStyle = o.col; g.fillRect(x, y0, bw, h - y0); g.fillStyle = o.edge; g.fillRect(x, y0, bw, 1); g.fillRect(x, y0, 1, h - y0);
    for (let wy = y0 + 5; wy < h - 8; wy += 6) for (let wx = x + 3; wx < x + bw - 4; wx += 5) if (c4R(i * 977 + wx * 31 + wy * 7, o.seed + 2) < o.dens) { g.fillStyle = c4R(wx * 3 + wy, o.seed + 3) < 0.72 ? o.win[0] : o.win[1]; g.fillRect(wx, wy, 2, 3); }
    if (c4R(i, o.seed + 6) < 0.45) { const ax = x + 3 + Math.round(c4R(i, o.seed + 7) * (bw - 7)); g.fillStyle = o.edge; g.fillRect(ax, y0 - 8, 1, 8); if (c4R(i, o.seed + 8) < 0.6) { g.fillStyle = '#ff4a3a'; g.fillRect(ax, y0 - 9, 1, 1); } }
    x += bw + (c4R(i, o.seed + 4) < o.gap ? o.g0 + Math.round(c4R(i, o.seed + 5) * o.g1) : 2); i++;
  }
  return { c, p: o.p, x0: -VW - 100, y0: top };
}
function c8Build() {
  const key = VW + 'x' + VH + 'x' + gy; if (C8W.key === key && C8W.near) return; C8W.key = key; buildAlley();
  const c = document.createElement('canvas'); c.width = 3 * VW; c.height = VH; const g = c.getContext('2d'); g.imageSmoothingEnabled = false; C8W.near = c;
  for (let k = 0; k < 3; k++) g.drawImage(alleyBg, k * VW, 0);
  for (let x = -STRIP; x < 3 * VW; x += STRIP) g.drawImage(alleyProps, x + VW, 0);
  for (let x = -VW; x < 2 * VW; x += 28) g.drawImage(alleyTile, x + VW, gy - 12);      // (canvas x = world x + VW)
  C8W.ref = { x: Math.round(VW / 2), y: gy - 40 };
  C8W.L = [c8City({ p: 0.25, skip: [C8W.ref.x - 50 - 90, C8W.ref.x - 50 + 90], seed: 11, wMin: 30, wMax: 70, hMin: 40, hMax: 250, col: '#0b1233', edge: '#18245a', win: ['#2c3b78', '#3b4f94'], dens: 0.08, gap: 0.5, g0: 10, g1: 50 }), c8City({ p: 0.5, seed: 31, wMin: 40, wMax: 90, hMin: 30, hMax: 150, col: '#090e2a', edge: '#1a2760', win: ['#ffd98a', '#9fc4ff'], dens: 0.15, gap: 0.55, g0: 15, g1: 65 }), c8City({ p: 0.8, seed: 51, wMin: 50, wMax: 110, hMin: 14, hMax: 70, col: '#070a1d', edge: '#16205a', win: ['#ffd98a', '#ffb86a'], dens: 0.22, gap: 0.5, g0: 10, g1: 50 })];
}
function c8Moon(x, y, R) {      // a huge pixel moon: a pale disc (made once as a picture, so that it is a clean shape at any zoom), a few darker seas and craters, the right limb in shade, a halo
  if (!C8W.moonC || C8W.moonR !== R) {
    const c = document.createElement('canvas'); c.width = c.height = 2 * R + 2; const g = c.getContext('2d'), o = R + 1;
    for (let yy = -R; yy <= R; yy++) { const hw = Math.floor(Math.sqrt(R * R - yy * yy)); g.fillStyle = '#e4e9fa'; g.fillRect(o - hw, o + yy, hw * 2, 1); g.fillStyle = '#c9d0ec'; g.fillRect(o + Math.floor(hw * 0.55), o + yy, hw - Math.floor(hw * 0.55), 1); }
    for (const [dx, dy, r, col] of [[-0.35, -0.2, 0.28, '#c4cbe8'], [0.1, 0.25, 0.22, '#bcc4e4'], [-0.1, -0.55, 0.14, '#cfd5ee'], [0.4, -0.3, 0.12, '#c4cbe8'], [-0.5, 0.35, 0.16, '#cfd5ee'], [0.25, 0.6, 0.1, '#c4cbe8']]) { const rr = Math.round(R * r), cx = o + Math.round(R * dx), cy = o + Math.round(R * dy); for (let yy = -rr; yy <= rr; yy++) { const hw = Math.floor(Math.sqrt(rr * rr - yy * yy)); g.fillStyle = col; g.fillRect(cx - hw, cy + yy, hw * 2, 1); } }
    C8W.moonC = c; C8W.moonR = R;
  }
  const gr = ctx.createRadialGradient(x, y, R * 0.8, x, y, R * 3.2); gr.addColorStop(0, 'rgba(190,205,255,0.30)'); gr.addColorStop(1, 'rgba(190,205,255,0)'); ctx.fillStyle = gr; ctx.fillRect(x - R * 3.2, y - R * 3.2, R * 6.4, R * 6.4); ctx.drawImage(C8W.moonC, x - R - 1, y - R - 1);
}
function c8On(cam, fx, fy) { if (cam.rot) { ctx.save(); ctx.translate(Math.round(cam.tx), Math.round(cam.ty)); ctx.rotate(cam.rot); ctx.scale(cam.z, cam.z); ctx.translate(-fx, -fy); } else c4CamOn(cam.z, fx, fy, cam.tx, cam.ty); }      // (v1.135: the camera may also roll: cam.rot, in radians, about the screen point (tx, ty))
function c8Camp(cam, p) { c8On(cam, C8W.ref.x + (cam.fx - C8W.ref.x) * p, C8W.ref.y + (cam.fy - C8W.ref.y) * p); }      // the camera for a layer that moves p times as much as the near world (0 = never, 1 = the world itself)
function c8Bg(cam, T) {      // everything behind the actors: sky, stars, moon, the three layers of the city, then the alley (cam = { z, fx, fy, tx, ty })
  c8Build(); const fxp = C8W.ref.x + (cam.fx - C8W.ref.x) * 0.15, fyp = C8W.ref.y + (cam.fy - C8W.ref.y) * 0.15, rr = cam.rot ? (Math.hypot(VW, VH) + Math.abs(cam.tx - VW / 2) + Math.abs(cam.ty - VH / 2)) / cam.z : 0, lx0 = rr ? fxp - rr : fxp - cam.tx / cam.z - 4, lx1 = rr ? fxp + rr : fxp + (VW - cam.tx) / cam.z + 4, ly0 = rr ? fyp - rr : fyp - cam.ty / cam.z - 4, ly1 = Math.min(0, rr ? fyp + rr : fyp + (VH - cam.ty) / cam.z + 4);      // (the part of the star layer that is on the screen)
  ctx.fillStyle = '#02030a'; ctx.fillRect(0, 0, VW, VH);
  c8Camp(cam, 0.15); const g = ctx.createLinearGradient(0, -1400, 0, 16); g.addColorStop(0, '#02030a'); g.addColorStop(0.6, '#060a20'); g.addColorStop(1, '#0a1030'); ctx.fillStyle = g; ctx.fillRect(-2 * VW, -1400, 5 * VW, 1416);
  for (let gx = Math.floor(lx0 / 36); gx <= lx1 / 36; gx++) for (let gy2 = Math.floor(ly0 / 36); gy2 * 36 < ly1; gy2++) { const r = c4R(gx * 131 + gy2 * 7, 91); if (r < 0.55) continue; const a = 0.35 + 0.5 * c4R(gx * 17 + gy2, 92) * (0.7 + 0.3 * Math.sin(T * 2 + gx + gy2)); ctx.fillStyle = 'rgba(205,215,255,' + a.toFixed(2) + ')'; ctx.fillRect(gx * 36 + Math.floor(c4R(gx + gy2 * 5, 93) * 34), gy2 * 36 + Math.floor(c4R(gx * 3 + gy2, 94) * 34), 1, 1); }
  c4Cam0(); c8Camp(cam, 0.25); c8Moon(C8W.ref.x - 50, -105, 60); c4Cam0(); c8Camp(cam, 0.5); const hz = ctx.createLinearGradient(0, -110, 0, 20); hz.addColorStop(0, 'rgba(255,150,80,0)'); hz.addColorStop(1, 'rgba(255,150,80,0.13)'); ctx.fillStyle = hz; ctx.fillRect(-2 * VW, -110, 5 * VW, 130); c4Cam0();      // (the glow of the city over the roofs)
  for (const L of C8W.L) { c8Camp(cam, L.p); ctx.drawImage(L.c, L.x0, L.y0); c4Cam0(); }
  c8On(cam, cam.fx, cam.fy); ctx.drawImage(C8W.near, -VW, 0);
}

const C8V = { run: 172, fl: 98 };      // Mahoraga's speed while he runs (px/s: the stride of 92 px of the run clip at 30 pictures a second), and the column of his pelvis in his pictures (flipped: 168 - 70)
function c8X0() { const g = c4Geo(), L = c4Lay(g), p = c4YRX(8); return Math.round(VW / 2) + L.yL - (p.info.cx - p.info.x0) + c4YAn(p.set[p.fi]).feet[0]; }      // where his feet are (the lying picture's, as c7SYuji draws it)
const c8Fy = () => gy + 3;      // the floor line the soles stand on
function c8Pic(pic, x, lift, flip, o) {      // a 64 x 64 picture of his with its feet (c4YAn) on the world x and the soles on the floor, flipped about the feet; o.ang turns it (about the hips) and o.a is its opacity
  o = o || {}; const A = c4YAn(pic), hx = Math.round(A.feet[0]), y = gy - 60 - (lift || 0); ctx.save(); if (o.a != null) ctx.globalAlpha = o.a; ctx.translate(Math.round(x), 0); if (flip) ctx.scale(-1, 1);
  if (o.ang) { const py = y + (o.pv == null ? 36 : o.pv); ctx.translate(0, py); ctx.rotate(o.ang); ctx.translate(0, -py); }
  if (o.neck) { const ny = y + 24; ctx.drawImage(pic, 0, 24, pic.width, pic.height - 24, -hx, ny, pic.width, pic.height - 24); ctx.translate(-hx + 32, ny); ctx.rotate(o.neck * (flip ? -1 : 1)); ctx.drawImage(pic, 0, 0, pic.width, 24, -32, -24, pic.width, 24); }
  else ctx.drawImage(pic, -hx, y); ctx.restore();
}
function c8Glint(x, y, T) { ctx.fillStyle = '#ff2a3a'; ctx.fillRect(Math.round(x), Math.round(y), 2, 1); c6Glow(x + 1, y + 0.5, 6 + Math.sin(T * 7), '255,30,45', 0.5); }      // (a red spark of his eye)

// ---- Sukuna at s: { pic, x (his feet), lift, flip, ang, neck, eye (the picture's eye), ghosts: [[x, a]] } (and, once he is hit, fly: { x, y, ang, fi })
const C8S = { step: 44, cutX: 57, walkV: 42 };      // how far he steps back (px), how far the dash takes him on from there, how fast he walks (px/s)
function c8Suk(s) {
  const D = CU_GAME[3], T = C8T, x0 = c8X0(); if (!D || !D.frames || !D.frames.length) return null;
  const idle = k => D.frames[((Math.floor(k * 8) % D.frames.length) + D.frames.length) % D.frames.length], p8 = c4YRX(8), E = [36.5, 17.5];
  if (s < T.up[0]) return { pic: c7SukLy(p8.set[p8.fi]), x: x0, lift: 0, flip: false, lying: true };
  if (s < T.up[5] + 0.15) { let k = 0; for (let i = 0; i < 6; i++) if (s >= T.up[i]) k = i; const pic = c8SukPic(9 + k); return { pic, x: x0, lift: 0, flip: false, eye: pic.__eye }; }
  const xStep = x0 - C8S.step, xCut = xStep + C8S.cutX, xStop = xCut - C8S.walkV * (T.walk[1] - T.walk[0]);
  let o;
  if (s < T.step) { const k = clamp01((s - T.neck[0]) / (T.neck[1] - T.neck[0])), flip = s >= T.left && s < T.right; o = { pic: idle(s), x: x0, lift: 0, flip, eye: E }; if (s >= T.neck[0] && s < T.neck[1]) o.neck = 0.1 * Math.sin(Math.PI * 2 * k); }
  else if (s < T.step + 0.233) { const k = (s - T.step) / 0.233; o = { pic: D.dg[2 + Math.min(6, Math.floor(k * 7))], x: x0 - C8S.step * ease3(k), lift: 0, flip: false, eye: E }; }
  else if (s < T.dash) o = { pic: idle(s), x: xStep, lift: 0, flip: false, eye: E };
  else if (s < T.turn) {
    const k = (s - T.dash) / 0.12, x = xStep + C8S.cutX * ease3(clamp01(k)); o = { pic: D.atk[8][Math.min(D.atk[8].length - 1, 5 + Math.floor((s - T.dash) * 30))], x, lift: 0, flip: false, eye: E }; if (k > 0 && k < 1.2) { o.ghosts = []; for (let j = 1; j <= 4; j++) o.ghosts.push([xStep + C8S.cutX * ease3(clamp01(k - 0.12 * j)), 0.38 / j]); }
  }
  else if (s < T.walk[0]) o = { pic: idle(s), x: xCut, lift: 0, flip: true, eye: E };
  else if (s < T.walk[1]) o = { pic: D.walk[Math.floor((s - T.walk[0]) * 19) % D.walk.length], x: xCut - C8S.walkV * (s - T.walk[0]), lift: 0, flip: true, eye: E };
  else if (s < T.hit) o = { pic: idle(s), x: xStop, lift: 0, flip: !(s >= T.look), eye: E };
  else o = null;
  return o;
}

// ---- Mahoraga at s: { i: his picture, mp: where his pelvis is, mode } (his pelvis is the point every picture is hung on, so that the poses that lean or step do not slide him)
const C8N = [C8T.wheel];      // the times the wheel turns one notch
function c8Ang(s) { let a = 0.2 * s; for (const t of C8N) if (s >= t) { const u = clamp01((s - t) / 0.3); a += 0.7854 * (1 + 2.7 * Math.pow(u - 1, 3) + 1.7 * Math.pow(u - 1, 2)); } return a; }
const c8NotchK = s => { let k = 0; for (const t of C8N) if (s >= t) k = Math.max(k, Math.exp(-(s - t) * 3.2)); return k; };
function c8Mah(s) {
  const T = C8T, K = M7.clips, x0 = c8X0(), at = (nm, f) => K[nm][0] + Math.max(0, Math.min(K[nm][1] - 1, f)), mp0 = x0 + 300, mpL = mp0 - 12 - C8V.run * (T.lunge - T.run), mpE = mpL - 43;
  if (s < T.start) return { i: at('idle', Math.floor(s * 8) % 12), mp: mp0, mode: 'idle' };
  if (s < T.run) { const k = (s - T.start) / (T.run - T.start); return { i: at('start', Math.floor(k * 8)), mp: mp0 - 12 * ease3(k), mode: 'start' }; }
  if (s < T.lunge) return { i: K.run[0] + Math.floor((s - T.run) * 30) % 16, mp: mp0 - 12 - C8V.run * (s - T.run), mode: 'run' };
  if (s < T.apart) { const a = s - T.lunge, lf = a < 0.07 ? 0 : a < 0.14 ? 1 : a < 0.22 ? 2 : a < 0.3 ? 3 : a < 0.45 ? 4 : 5, u = Math.min(a, 0.5); return { i: K.lunge[0] + lf, mp: mpL - (C8V.run * u - C8V.run * u * u), mode: 'lunge', lf }; }
  if (s < T.whole) return { i: K.lunge[0] + 5, mp: mpE, mode: s < T.wheel ? 'apart' : 'heal' };
  if (s < T.d2) return { i: at('idle', Math.floor(s * 8) % 12), mp: mpE, mode: 'idle' };
  if (s < T.up2) return { i: K.run[0] + Math.floor((s - T.d2) * 30) % 16, mp: mpE - 200 * (s - T.d2), mode: 'run' };
  const a = s - (T.hit - 0.22), mpD = mpE - 200 * (T.up2 - T.d2), uf = a < 0.07 ? 0 : a < 0.14 ? 1 : a < 0.22 ? 2 : a < 0.3 ? 3 : a < 0.36 ? 4 : a < 0.44 ? 5 : a < 0.6 ? 6 : 7;
  return { i: K.uppercut[0] + uf, mp: mpD - 20 * ease3(clamp01(a / 0.22)), mode: 'upper', uf };
}
// ---- Mahoraga cut into pieces by Sukuna's X (two cuts through the chest) and a third at the hips: the lunge's last picture, lit, is split pixel by pixel into the pieces (the torn edges are red flesh), which fly apart, fall (a table of their flight, made once) and lie in their blood; when the wheel turns they fly back together
const C8P = { d: null, sim: null };
function c8Slice() {
  if (C8P.d) return C8P.d; const K = M7.clips, fi = K.lunge[0] + 5, src = m7Lit(fi, 'cold'); if (!src) return null;
  const W = M7.w, H = M7.h, P = M7.frames[fi], id = src.getContext('2d').getImageData(0, 0, W, H), d = id.data, Cx = P.chest[0], Cy = P.chest[1], Hy = P.pelvis[1] + 8;
  const piece = new Int8Array(W * H).fill(-1), cnt = new Array(8).fill(0), sx = new Array(8).fill(0), sy = new Array(8).fill(0);
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) { if (d[(y * W + x) * 4 + 3] < 128) continue; const k = (((x - Cx) - (y - Cy) > 0) ? 1 : 0) | (((x - Cx) + (y - Cy) > 0) ? 2 : 0) | (y > Hy ? 4 : 0); piece[y * W + x] = k; cnt[k]++; sx[k] += x; sy[k] += y; }
  const cen = k => [sx[k] / cnt[k], sy[k] / cnt[k]]; for (let k = 0; k < 8; k++) if (cnt[k] && cnt[k] < 70) { let b = -1, bd = 1e9; for (let j = 0; j < 8; j++) if (j !== k && cnt[j] >= 70) { const c = cen(j), dd = Math.hypot(c[0] - sx[k] / cnt[k], c[1] - sy[k] / cnt[k]); if (dd < bd) { bd = dd; b = j; } } if (b >= 0) { for (let i = 0; i < W * H; i++) if (piece[i] === k) piece[i] = b; cnt[b] += cnt[k]; sx[b] += sx[k]; sy[b] += sy[k]; cnt[k] = 0; } }      // (a sliver is given to its neighbour)
  const dist = (x, y) => Math.min(Math.abs((x - Cx) - (y - Cy)) / 1.4142, Math.abs((x - Cx) + (y - Cy)) / 1.4142, Math.abs(y - Hy)), reds = [[224, 25, 43], [179, 18, 31], [142, 12, 24]], out = [];
  for (let k = 0; k < 8; k++) {
    if (cnt[k] < 70) continue; const cv = document.createElement('canvas'); cv.width = W; cv.height = H; const g = cv.getContext('2d'), im = g.createImageData(W, H), o = im.data; let x0 = W, x1 = 0, y0 = H, y1 = 0, n = 0, mx = 0, my = 0;
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) { if (piece[y * W + x] !== k) continue; const i = (y * W + x) * 4; let r = d[i], gg = d[i + 1], b = d[i + 2]; const dd = dist(x, y); if (dd < 1.6) { const q = reds[Math.floor(c4R(x * 3 + y * 7, 61) * 3)]; r = q[0]; gg = q[1]; b = q[2]; } o[i] = r; o[i + 1] = gg; o[i + 2] = b; o[i + 3] = 255; x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y); n++; mx += x; my += y; }
    g.putImageData(im, 0, 0); out.push({ cv, cx: mx / n, cy: my / n, hw: (x1 - x0 + 1) / 2, hh: (y1 - y0 + 1) / 2, n, k });
  }
  return C8P.d = { pcs: out, Cx, Cy, Hy, fi, P };
}
function c8Sim() {      // the flight of the pieces: a table of [x, y, angle] (in the picture's own pixels, the floor at the soles, row 136) every 1/120 s for 5 s, and when each first lies on the floor
  if (C8P.sim) return C8P.sim; const S = c8Slice(); if (!S) return null; const dt = 1 / 240, FL = 136, G = 620, res = [];
  S.pcs.forEach((p, i) => {
    const r1 = c4R(i, 71), r2 = c4R(i, 72), dir = p.cx < S.Cx ? -1 : 1, st = { x: p.cx, y: p.cy, vx: dir * (50 + 90 * r1) + (p.cx - S.Cx) * 0.8, vy: -(120 + 140 * r2) + (p.cy - S.Cy) * 0.6, a: 0, w: dir * (1.2 + 2.6 * r2) }, tab = []; let lay = -1;
    for (let n = 0; n < 1200; n++) {
      st.vy += G * dt; st.x += st.vx * dt; st.y += st.vy * dt; st.a += st.w * dt; const ext = p.hw * Math.abs(Math.sin(st.a)) + p.hh * Math.abs(Math.cos(st.a)); let g = false;
      if (st.y + ext >= FL) { st.y = FL - ext; g = true; if (st.vy > 0) { if (st.vy > 60) { st.vy = -st.vy * 0.28; st.vx *= 0.7; st.w *= -0.4; } else st.vy = 0; } }
      if (g && st.vy === 0) { st.vx *= Math.exp(-5 * dt); st.w = 0; const t = Math.round(st.a / (Math.PI / 2)) * (Math.PI / 2); st.a += (t - st.a) * (1 - Math.exp(-10 * dt)); if (lay < 0) lay = n * dt; }
      if (n % 2 === 1) tab.push([st.x, st.y, st.a]);
    }
    res.push({ tab, lay: lay < 0 ? 0.6 : lay });
  });
  return C8P.sim = { res, dt: 2 / 240 };
}
function c8PieceAt(i, a) {      // piece i, a seconds after the cuts opened: [x, y, angle] in the picture's pixels
  const S = c8Sim(), tab = S.res[i].tab, t = a / S.dt, k = Math.min(tab.length - 2, Math.max(0, Math.floor(t))), q = clamp01(t - k), A = tab[k], B = tab[k + 1]; return [lerp(A[0], B[0], q), lerp(A[1], B[1], q), lerp(A[2], B[2], q)];
}

// ---- drawing Mahoraga (the wheel behind his head, his picture lit by the light of the moment, his eyes) and the pieces
function c8Lit(s) { const T = C8T; if (Math.abs(s - T.hit) < 0.05) return 'white'; if (s >= T.wheel && s < T.whole + 0.5) return 'gold'; return 'cold'; }
function c8DrawMah(s, M) {
  const T = C8T, P = M7.frames[M.i], top = c8Fy() - 136, left = Math.round(M.mp - P.pelvis[0]), wx = left + Math.round(P.head[0]) + 4, wy = top + Math.round(P.head[1]) - 6, k = c8NotchK(s), run = M.mode === 'run' || M.mode === 'lunge' || M.mode === 'upper', ea = ease3(clamp01((s - T.eyes) / 0.5));
  if (M.mode !== 'apart' && M.mode !== 'heal') shadow(M.mp, 38);
  c6Glow(wx, wy, 78, '255,200,100', 0.22 + 0.3 * k + (run ? 0.25 : 0) + 0.2 * ea); m7Wheel(wx, wy, 27, c8Ang(s), 1);
  if (M.mode !== 'apart' && M.mode !== 'heal') {
    const img = m7Lit(M.i, c8Lit(s)); if (img) ctx.drawImage(img, left, top);
    if (ea > 0.01 && M.mode !== 'upper') for (const [e, w] of [[P.eye1, 4], [P.eye2, 3]]) { const ex = left + Math.round(e[0]) - 1, ey = top + Math.round(e[1]); ctx.save(); ctx.globalAlpha = ea * (0.9 + 0.1 * Math.sin(s * 9)); ctx.fillStyle = '#ffd36a'; ctx.fillRect(ex, ey, w, 2); ctx.fillStyle = '#fff4c8'; ctx.fillRect(ex + 1, ey, Math.max(1, w - 2), 1); ctx.restore(); c6Glow(ex + w / 2, ey + 1, 9 + 8 * k, '255,190,70', 0.5 * ea * (1 + k)); }
  }
  return { left, top, P, wx, wy };
}
function c8PiecePos(i, s) {      // where piece i is at s (in the picture's pixels): flying and lying until the wheel turns, then back to its own place (one after the other, over 0.7 s, with a hop), upright
  const T = C8T, S = c8Slice(), p = S.pcs[i]; if (s < T.wheel) return c8PieceAt(i, s - T.apart);
  const r = c8PieceAt(i, T.wheel - T.apart), e = ease3(clamp01((s - T.wheel - 0.08 * i) / 0.7)), ar = r[2] - 2 * Math.PI * Math.round(r[2] / (2 * Math.PI));
  return [lerp(r[0], p.cx, e), lerp(r[1], p.cy, e) - 16 * Math.sin(Math.PI * e), lerp(ar, 0, e)];
}
function c8DrawPieces(s, M) {
  const S = c8Slice(); if (!S || !c8Sim()) return; const T = C8T, top = c8Fy() - 136, left = Math.round(M.mp - S.P.pelvis[0]), a = s - T.apart, Fy = c8Fy();
  const rest = i => c8PieceAt(i, T.wheel - T.apart);
  S.pcs.forEach((p, i) => { const [x, y, ang] = c8PiecePos(i, s); ctx.save(); ctx.translate(left + x, top + y); ctx.rotate(ang); ctx.drawImage(p.cv, -p.cx, -p.cy); ctx.restore(); });
  const sim = c8Sim();      // (the blood: pools under the pieces that have landed, thinning out as they join, then the spray and the gibs)
  S.pcs.forEach((p, i) => { const lay = sim.res[i].lay, k = Math.pow(clamp01((a - lay) / 2.4), 0.7) * (1 - ease3(clamp01((s - T.wheel - 0.2) / 1.2))), r = rest(i); if (a > lay) m7Pool(Math.round(left + r[0]), k, 14 + Math.min(28, p.n / 120), Fy - 2); });
  if (s < T.wheel + 0.4) {
    const cols = [C4_RED[0], C4_RED[1], C4_RED[1], C4_RED[2], C4_RED[2], C4_RED[3]], bx = S.Cx + left, by = S.Cy + top, o = { v: 170, up: 1.3, dir: 0, life: 0.9, cols, sz: 1, gnd: Fy + 3, stain: 14, g: 420 };
    c4Spray(a, 0, bx, by, 18, { ...o, seed: 5 }); for (const [dx, dy, sd] of [[-34, -34, 6], [34, 34, 7], [-34, 34, 8], [34, -34, 9]]) c4Spray(a, 0.03, bx + dx, by + dy, 8, { ...o, v: 130, seed: sd }); c4Spray(a, 0.05, bx, S.Hy + top, 10, { ...o, v: 110, seed: 10 });
    S.pcs.forEach((p, i) => { for (let j = 0; j < 6; j++) { const t0 = 0.08 + 0.13 * j; if (a < t0 || a > t0 + 1.4) continue; const q = c8PieceAt(i, t0); c4Spray(a, t0, left + q[0], top + q[1], 4, { ...o, v: 50, up: 0.6, seed: 20 + i * 7 + j, life: 0.7 }); } });
    if (s < T.wheel) c4Organs(a, 0, bx, by, 7, { v: 120, up: 90, dir: 0, gnd: Fy + 4, seed: 8 });
  }
}
function c8CutFx(s, M) {      // the three cuts show as bright lines through him: white-hot at the stroke, then red; the same lines in gold as the pieces join
  const S = c8Slice(); if (!S) return; const T = C8T, top = c8Fy() - 136, left = Math.round(M.mp - S.P.pelvis[0]), a = s - T.cut; let al = 0, col;
  if (s >= T.cut && s < T.apart) { al = a < 0.14 ? 1 : 0.55 + 0.25 * Math.sin(s * 14); col = a < 0.14 ? '#ffffff' : '#ff5a5a'; } else if (s >= T.wheel + 0.5 && s < T.whole + 0.6) { al = 1 - clamp01((s - T.whole) / 0.6); col = '#ffe08a'; }
  if (al <= 0.02) return; const Cx = S.Cx + left, Cy = S.Cy + top, L = 64; ctx.save(); ctx.globalAlpha = al; ctx.globalCompositeOperation = 'lighter';
  for (let o = -1; o <= (a < 0.14 || s >= T.wheel ? 1 : 0); o++) { c6Line(Math.round(Cx - L), Math.round(Cy - L) + o, Math.round(Cx + L), Math.round(Cy + L) + o, col); c6Line(Math.round(Cx - L), Math.round(Cy + L) + o, Math.round(Cx + L), Math.round(Cy - L) + o, col); c6Line(Math.round(Cx - 40), Math.round(S.Hy + top) + o, Math.round(Cx + 40), Math.round(S.Hy + top) + o, col); } ctx.restore();
}

// ---- Sukuna thrown up by the uppercut: from his chest up and back along a path that slows like in thick air, tumbling backwards; the pictures 1 - 4 of the fall are his (hit, arched back, falling)
const C8F = { V: 900, tau: 0.75, dx: -95, turns: 2.4 };
function c8Fly(s) {
  const a = s - C8T.hit; if (a < 0) return null; const x0 = c8X0(), xs = x0 - C8S.step + C8S.cutX - C8S.walkV * (C8T.walk[1] - C8T.walk[0]);
  return { x: xs + C8F.dx * (1 - Math.exp(-a / 0.9)), y: gy - 30 - C8F.V * C8F.tau * (1 - Math.exp(-a / C8F.tau)), ang: -C8F.turns * Math.PI * (1 - Math.exp(-a / 0.9)), fi: a < 0.07 ? 1 : a < 0.14 ? 2 : a < 0.21 ? 3 : 4, a };
}
function c8SukWhere(s) { const f = c8Fly(s); if (f) return { x: f.x, y: f.y }; const S = c8Suk(s); return S ? { x: S.x, y: gy - 30 } : { x: c8X0(), y: gy - 30 }; }
function c8DrawSuk(s) {
  const f = c8Fly(s);
  if (f) {
    for (let j = 3; j >= 1; j--) { const q = c8Fly(s - 0.035 * j); if (!q || q.a < 0) continue; const pic = c8SukPic(q.fi); ctx.save(); ctx.globalAlpha = 0.3 / j; ctx.translate(Math.round(q.x), Math.round(q.y)); ctx.rotate(q.ang); ctx.drawImage(pic, -33, -34); ctx.restore(); }
    const pic = c8SukPic(f.fi); ctx.save(); ctx.translate(Math.round(f.x), Math.round(f.y)); ctx.rotate(f.ang); ctx.drawImage(pic, -33, -34); ctx.restore(); return;
  }
  const S = c8Suk(s); if (!S) return; if (!S.lying) shadow(S.x, 12);
  if (S.ghosts) for (const [gx, ga] of S.ghosts) c8Pic(S.pic, gx, 0, S.flip, { a: ga });
  c8Pic(S.pic, S.x, S.lift, S.flip, { neck: S.neck });
  if (S.lying) { const x0 = c8X0(), p8 = c4YRX(8), ox = x0 - c4YAn(p8.set[p8.fi]).feet[0], F0 = c4Face(p8.set[p8.fi], p8.info, Math.round(VW / 2) + c4Lay(c4Geo()).yL, 0), oy = Math.round(F0.y - c4YAn(p8.set[p8.fi]).face[1]); c7Eye(Math.round(ox) + C7E.s[0], oy + C7E.s[1], 1, true, s); return; }
  if (S.eye) { const A = c4YAn(S.pic), ex = S.x + (S.eye[0] - A.feet[0]) * (S.flip ? -1 : 1), ey = gy - 60 - (S.lift || 0) + S.eye[1]; c8Glint(ex - (S.flip ? 1 : 0), ey, s); }
}
function c8Shake(s) {      // how hard the picture shakes: footfalls of the run, the lunge, the cut, the pieces landing, the wheel, the uppercut
  const T = C8T; let a = 0; for (let i = 0; i < 4; i++) { const t = T.run + 0.13 + 0.267 * i; if (s >= t && s < T.lunge) a += 1.1 * Math.exp(-(s - t) * 9); }
  for (const [t, m, k] of [[T.lunge + 0.22, 2.6, 7], [T.cut, 3.2, 8], [T.apart, 2.4, 6], [T.apart + 0.5, 1.6, 7], [T.wheel, 2.2, 5], [T.hit, 11, 5.5], [T.d2, 0.9, 9]]) if (s >= t) a += m * Math.exp(-(s - t) * k);
  if (s >= T.d2 && s < T.up2) a += 0.9; return a;
}
function c8Fx(s) {
  const T = C8T, K = M7.clips, Fy = c8Fy(), x0 = c8X0(), mp0 = x0 + 300, mpL = mp0 - 12 - C8V.run * (T.lunge - T.run), top = Fy - 136;
  if (s >= T.run && s < T.lunge + 0.3) for (let i = 0; i < 5; i++) { const t = T.run + 0.13 + 0.267 * i, xf = mp0 - 12 - C8V.run * (t - T.run) - 8; if (t < T.lunge) c4Dust(s, t, xf, 9, { w: 30, h: 12, life: 0.8, big: 7, col: '150,140,172', seed: i + 1 }); }
  if (s > T.run + 0.2 && s < T.lunge) { const P = c8Mah(s), tail = Math.round(P.mp + 30); ctx.fillStyle = 'rgba(190,200,240,0.28)'; for (let i = 0; i < 6; i++) ctx.fillRect(tail + Math.round(c4R(i, 51) * 60), Fy - 8 - Math.round(c4R(i, 52) * 90), 14 + Math.round(c4R(i, 53) * 22), 1); }      // (speed lines behind him)
  const tw = T.lunge + 0.22, a = s - tw; if (a >= 0 && a < 1.2) {      // the fist goes through the air where Sukuna was: rings and streaks of wind from the fist, dust along the floor
    const u = 0.22, mpw = mpL - (C8V.run * u - C8V.run * u * u), Pm = M7.frames[K.lunge[0] + 3], fx = mpw - Pm.pelvis[0] + Pm.fist[0], fy = top + Pm.fist[1];
    c3Ring(fx, fy, a, false, '225,235,255', 1); ctx.save(); ctx.globalCompositeOperation = 'lighter'; for (let i = 0; i < 9; i++) { const k = clamp01(a / 0.5), y = fy - 18 + i * 4.5, len = (20 + 30 * c4R(i, 55)) * Math.sqrt(k); ctx.globalAlpha = 0.5 * (1 - k); c6Line(Math.round(fx - 6 - len), Math.round(y), Math.round(fx - 6 - len * 0.2), Math.round(y), '#dfe8ff'); } ctx.restore();
    c4Dust(s, tw, fx - 10, 12, { w: 44, h: 14, life: 1.1, big: 8, col: '150,140,172', seed: 9 });
  }
  if (s >= T.cut && s < T.cut + 0.25) { const S = c8Slice(); if (S) { const M = c8Mah(T.cut), cx = M.mp - S.P.pelvis[0] + S.Cx, cy = top + S.Cy, k = (s - T.cut) / 0.25; ctx.save(); ctx.globalCompositeOperation = 'lighter'; for (let i = 0; i < 14; i++) { const an = i / 14 * 6.2832 + c4R(i, 81) * 0.3, r0 = 6 + 6 * c4R(i, 82), r1 = r0 + (16 + 44 * c4R(i, 83)) * Math.sqrt(k); ctx.globalAlpha = 1 - k; c6Line(Math.round(cx + Math.cos(an) * r0), Math.round(cy + Math.sin(an) * r0), Math.round(cx + Math.cos(an) * r1), Math.round(cy + Math.sin(an) * r1), i % 3 ? '#fff0c8' : '#ff8a8a'); } ctx.restore(); } }
  { const a2 = s - T.wheel; if (a2 >= 0 && a2 < 0.5) { const M = c8Mah(T.wheel), P = M7.frames[M.i], wx = M.mp - P.pelvis[0] + P.head[0] + 4, wy = top + P.head[1] - 6; v6Ring(wx, wy, 27 + a2 * 150, 1 - a2 / 0.5, '255,214,140'); } }
  if (s >= T.wheel && s < T.whole + 0.4) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; for (let i = 0; i < 22; i++) { const ph = (s * 0.8 + c4R(i, 91)) % 1, x = mpL - 43 - 70 + c4R(i, 92) * 140, y = Fy - 6 - ph * 70; ctx.globalAlpha = Math.sin(Math.PI * ph) * 0.9; ctx.fillStyle = i % 3 ? '#ffe08a' : '#ffffff'; ctx.fillRect(Math.round(x), Math.round(y), 1 + (i & 1), 1); } ctx.restore(); }
  if (s >= T.hit) { const a3 = s - T.hit, f = c8Fly(T.hit), hx = f.x - 6, hy = gy - 30; c3Ring(hx, hy, a3, true, '255,235,200', 1); c4Dust(s, T.hit, hx + 12, 16, { w: 60, h: 26, life: 1.4, big: 9, seed: 12 }); c4Spray(s, T.hit, hx, gy + 1, 14, { v: 130, up: 1.2, dir: 0, life: 0.9, cols: C4_STONE, sz: 1, seed: 33, gnd: gy + 3, g: 420 }); c4Spray(s, T.hit, hx, hy, 10, { v: 90, up: 1.3, dir: -1, life: 0.7, cols: C4_BLOOD, sz: 1, seed: 34, gnd: gy + 3, g: 380 }); }
}

// ---- the stage as a whole at s, seen by the camera cam = { z, fx, fy, tx, ty } (the world point (fx, fy) is put on the screen point (tx, ty), z times as big); c8Bg leaves the camera on, the caller turns it off
const c8R = () => c7T('yuji') + C7Y.rise;      // the scene time at which Sukuna begins to rise
function c8Stage(s, cam) {
  c8Bg(cam, s); { const L = c4Lay(c4Geo()), cx = Math.round(VW / 2); c4Crater(cx + L.cr, 1.1); c4Pool(cx + L.yL - 30, 1.54); }      // (the crater and the pool he lay in, as chapter 2 left them)
  const M = c8Mah(s), pieces = M.mode === 'apart' || M.mode === 'heal';
  c8DrawMah(s, M); if (pieces) c8DrawPieces(s, M); c8CutFx(s, M); c8DrawSuk(s); c8Fx(s);
}
// ---- the cameras: one for each shot of C8 (a function of s); a close shot looks at a point of the world, a wide shot is made to fit about 'span' pixels of the alley across the screen
function c8Cam(s, k) {
  const T = C8T, x0 = c8X0(), Su = c8SukWhere(s), M = c8Mah(s), fit = span => Math.min(2.6, VW / span), mpE = x0 + 300 - 12 - C8V.run * (T.lunge - T.run) - 43;
  const C = (z, fx, fy, tx, ty) => ({ z, fx, fy, tx: tx == null ? VW / 2 : tx, ty: ty == null ? VH * 0.62 : ty }), mix = (a, b, e) => ({ z: lerp(a.z, b.z, e), fx: lerp(a.fx, b.fx, e), fy: lerp(a.fy, b.fy, e), tx: lerp(a.tx, b.tx, e), ty: lerp(a.ty, b.ty, e) });
  switch (k) {
    case 'rise': return mix(c7YCam(C7Y.rise), C(2.2, x0 - 4, gy - 28), ease3(clamp01((s - 0.2) / 1.5)));
    case 'look': return C(2.2 + 0.15 * clamp01((s - 1.9) / 2.1), x0 - 4, gy - 28);
    case 'see': return mix(C(2.35, x0 - 4, gy - 28), C(fit(400), x0 + 150, gy - 52), ease3(clamp01((s - 4.0) / 1.1)));
    case 'charge': return C(fit(300), M.mp - 60, gy - 46);
    case 'whiff': return C(fit(240), x0 + 10, gy - 42);
    case 'slash': return C(fit(180) + 0.25 * ease3(clamp01((s - 7.95) / 0.9)), x0 + 22, gy - 48);
    case 'fall': return C(fit(330), x0 + 30, gy - 46);
    case 'walk': return C(fit(190), Su.x - 20, gy - 32);
    case 'wheel': return C(fit(210) + 0.25 * ease3(clamp01((s - 11.3) / 1.2)), mpE - 8, gy - 52);
    case 'back': return C(fit(190), (Su.x + mpE) / 2 - 10, gy - 40);
    case 'punch': return C(fit(260), (Su.x + M.mp) / 2, gy - 44);
    default: { const f = c8Fly(s), a = s - T.hit, e = ease3(clamp01(a / 0.12)), y = f ? f.y : gy - 30, x = f ? f.x : x0; return C(lerp(fit(260), fit(200), e), lerp(Su.x - 10, x, e), lerp(gy - 44, y, e), VW / 2, VH * 0.5); }
  }
}
function c8Shot(now, dt, T, st, t1) {
  const s = T - c8R(), cam = c8Cam(s, st.k), sh = c8Shake(s), jx = sh < 0.3 ? 0 : Math.round((c6H(Math.floor(T * 36), 11) - 0.5) * 2 * sh), jy = sh < 0.3 ? 0 : Math.round((c6H(Math.floor(T * 36), 12) - 0.5) * 2 * sh), TT = C8T;
  ctx.save(); ctx.translate(jx, jy); c8Stage(s, cam); c4Cam0(); ctx.restore();
  if (s > TT.hit + 0.15 && s < TT.hit + 2.4) { ctx.fillStyle = 'rgba(210,220,255,0.22)'; const k = clamp01((TT.hit + 2.4 - s) / 1.2); for (let i = 0; i < 16; i++) { const x = Math.round(c4R(i, 41) * VW), len = 10 + Math.round(c4R(i, 42) * 34), y = Math.round(((c4R(i, 43) * VH * 1.4 + (s - TT.hit) * (500 + 300 * c4R(i, 44))) % (VH + 40)) - 20); ctx.globalAlpha = k; ctx.fillRect(x, y, 1, len); } ctx.globalAlpha = 1; }      // (the wind of the climb: thin streaks run down the screen)
  { const r = s - TT.hit; if (r >= 0 && r < 0.05) { ctx.save(); ctx.globalCompositeOperation = 'difference'; ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, VW, VH); ctx.restore(); } else if (r >= 0) c6White(0.55 * Math.exp(-r * 10)); }
  if (s >= TT.cut) c6White(0.8 * Math.exp(-(s - TT.cut) * 14)); { const k = c8NotchK(s); if (k > 0.02) c6White(0.26 * k * k); }
  { const rd = clamp01(1 - s / 1.2); if (rd > 0.01) { c6RedEdge((0.3 + 0.12 * Math.sin((T - c7T('yuji')) * 3)) * rd); ctx.fillStyle = 'rgba(70,0,12,' + (0.16 * rd).toFixed(3) + ')'; ctx.fillRect(0, 0, VW, VH); } }      // (the red of the swap fades out as he gets up)
  ctx.fillStyle = s >= TT.wheel && s < TT.whole + 0.6 ? 'rgba(120,90,20,0.10)' : 'rgba(30,10,60,0.14)'; ctx.fillRect(0, 0, VW, VH); msFinish(1);
  c6Black((s - (TT.end - 0.9)) / 0.9);
}
function c8Events(T, ev) {      // the sounds of the alley fight (each fires once)
  const R = c8R(), t = C8T;
  ev('c8up', R + t.up[0], () => snd('c7cloth', 1), 0.5); ev('c8crack1', R + t.neck[0] + 0.12, () => snd('c8crack'), 0.4); ev('c8crack2', R + t.neck[0] + 0.4, () => snd('c8crack'), 0.4);
  ev('c8eyes', R + t.eyes, () => { snd('c7eyes'); snd('c7drone'); }, 1.0); ev('c8start', R + t.start, () => snd('c7cloth', 0), 0.6);
  for (let i = 0; i < 4; i++) ev('c8step' + i, R + t.run + 0.13 + 0.267 * i, () => snd('c7step', i & 1), 0.4);
  ev('c8dodge', R + t.step, () => snd('dash', 1), 0.4); ev('c8whiff', R + t.lunge + 0.12, () => snd('c7whoosh'), 0.4); ev('c8dash', R + t.dash, () => snd('dash', 0), 0.4);
  ev('c8cut', R + t.cut, () => { snd('c6scrape'); snd('smack', 3); snd('c7tear'); }, 0.5); ev('c8apart', R + t.apart, () => { snd('c7tear'); snd('c4guts'); }, 0.6);
  for (let i = 0; i < 4; i++) ev('c8land' + i, R + t.apart + 0.45 + 0.22 * i, () => snd('c7thud', i & 1), 0.5);
  ev('c8wheel', R + t.wheel, () => { snd('c7wheel', 1); snd('rct', 0); }, 0.8); ev('c8whole', R + t.whole, () => snd('rct', 1), 0.8);
  ev('c8d2', R + t.d2, () => { snd('c7cloth', 0); snd('c7step', 1); }, 0.5); ev('c8d2b', R + t.d2 + 0.2, () => snd('c7step', 0), 0.4); ev('c8up2', R + t.up2, () => snd('c7whoosh'), 0.4);
  ev('c8hit', R + t.hit, () => { snd('c7smash'); snd('c4crater'); }, 0.6); ev('c8launch', R + t.hit + 0.15, () => snd('c7rise'), 1.2);
}


// ---- v1.135 the SONG of the air fight (the first 2:06 of the song the user gave, tools/fight_music.mp3, 117 bpm): an <audio> element kept on the scene time T: m = seconds since the song began (C9 in tools/chap3.js); a tap that skips a cut, a pause or a test jump seeks it
const C9_MUSIC = '__FIGHTMUSIC__';
const c9Start = () => c8R() + C9.m0;      // (the scene time at which the song begins)
let c9A = null;
function c9Audio() {
  if (c9A) return c9A; if (!C9_MUSIC || C9_MUSIC.length < 100) return null;
  try { const bin = atob(C9_MUSIC.slice(C9_MUSIC.indexOf(',') + 1)), u = new Uint8Array(bin.length); for (let i = 0; i < bin.length; i++) u[i] = bin.charCodeAt(i); c9A = new Audio(URL.createObjectURL(new Blob([u], { type: 'audio/mpeg' }))); c9A.preload = 'auto'; } catch (e) { c9A = null; }
  return c9A;
}
function c9Music(T) {
  const m = T - c9Start(), on = m >= 0 && m < C9.D && !document.hidden && !(typeof paused !== 'undefined' && paused) && !C13Q.def;
  if (!on) { if (c9A && !c9A.paused) c9A.pause(); return; }
  const a = c9Audio(); if (!a) return;
  const k = Math.min(1, m / C9.fadeIn), g = C9.vol * k * k * Math.min(1, (C9.D - m) / C9.fadeOut), node = sfx && soundOn && sfx.ac.state === 'running' ? sfx.music(a) : null;
  if (node) node.gain.setTargetAtTime(Math.max(0, g), sfx.ac.currentTime, 0.04); else a.volume = soundOn ? Math.max(0, Math.min(1, g)) : 0;
  if (a.paused) { try { a.currentTime = m; } catch (e) { /* not ready yet */ } const pr = a.play(); if (pr && pr.catch) pr.catch(() => { }); } else if (Math.abs(a.currentTime - m) > 0.3) { try { a.currentTime = m; } catch (e) { /* not ready yet */ } }
}
function c9Stop() { if (c9A) { try { c9A.pause(); c9A.currentTime = 0; } catch (e) { /* nothing to stop */ } } if (c12A) { try { c12A.pause(); c12A.currentTime = 0; } catch (e) { /* nothing to stop */ } } if (typeof C10W !== 'undefined' && C10W.sl) { C10W.sl = false; snd('slowout'); } }      // (the song stops with the story; so does the slow-motion sound if it was on)
// ---- v1.137 the SECOND SONG (the Snowman part: tools/snowman_music.mp3, the user's second song from 1:20.7 to its end, 105 bpm): the same kind of <audio> element, on the scene time too; n = seconds since the clip began (C12K in tools/chap3.js)
const C12_MUSIC = '__SNOWMUSIC__', C12V = { vol: 0.62, len: 85.29, fadeOut: 1.2 };
const c12Start = () => c8R() + C12K.t0;      // (the scene time at which the second song begins)
let c12A = null;
function c12Audio() {
  if (c12A) return c12A; if (!C12_MUSIC || C12_MUSIC.length < 100) return null;
  try { const bin = atob(C12_MUSIC.slice(C12_MUSIC.indexOf(',') + 1)), u = new Uint8Array(bin.length); for (let i = 0; i < bin.length; i++) u[i] = bin.charCodeAt(i); c12A = new Audio(URL.createObjectURL(new Blob([u], { type: 'audio/mpeg' }))); c12A.preload = 'auto'; } catch (e) { c12A = null; }
  return c12A;
}
function c12Music(T) {
  const n = T - c12Start(), on = n >= 0 && n < C12V.len && T < C7.card && !document.hidden && !(typeof paused !== 'undefined' && paused);
  if (n > -8 && n < 0) c12Audio();      // (the song is made and starts to load a few seconds before it plays: its first hit comes 0.25 s after it starts)
  if (!on) { if (c12A && !c12A.paused) c12A.pause(); return; }
  const a = c12Audio(); if (!a) return;
  const g = C12V.vol * Math.min(1, n / 0.04) * Math.min(1, (C12V.len - n) / C12V.fadeOut), node = sfx && soundOn && sfx.ac.state === 'running' ? sfx.music(a) : null;
  if (node) node.gain.setTargetAtTime(Math.max(0, g), sfx.ac.currentTime, 0.04); else a.volume = soundOn ? Math.max(0, Math.min(1, g)) : 0;
  if (a.paused) { try { a.currentTime = n; } catch (e) { /* not ready yet */ } const pr = a.play(); if (pr && pr.catch) pr.catch(() => { }); } else if (Math.abs(a.currentTime - n) > 0.3) { try { a.currentTime = n; } catch (e) { /* not ready yet */ } }
}
window.__c12 = () => c12A ? { t: c12A.currentTime, paused: c12A.paused, vol: c12A.volume, gain: c12A.__g ? c12A.__g.gain.value : null, len: c12A.duration } : null;      // test hook
window.__c9 = () => c9A ? { t: c9A.currentTime, paused: c9A.paused, vol: c9A.volume, gain: c9A.__g ? c9A.__g.gain.value : null, len: c9A.duration } : null;      // test hook
