// ================================================================ v1.217 THE GOKU SCENE (this file is spliced into template.html by build_html.py, after goku.js)
// After the arrival in West City (tools/westcity.js) the screen goes black and we see Goku on a grassy hill: he feels a strange power, puts two fingers on his forehead and is gone (instant transmission). Cut back to West City: he stands next to Yuji with his hand held out - "WHO ARE YOU?". Yuji punches him: it does nothing. Goku punches Yuji into a building. TO BE CONTINUED.
// It plays inside the live fight like the scene before it (vs.k5.end.gk), with a clock of its own (G.T, seconds) that stops for the hit-stops; gkFrame draws everything (drawScene hands the whole frame over to it).
// ---------------------------------------------------------------- THE HILL (made once for this size of screen: the sky, the mountains, the far city, two hills and the near hill with its flowers and its tree; the grass blades, the clouds and the sun's glow are drawn each frame)
const GKH = { w: 0, h: 0, xg: 0, sky: null, far: null, near: null, cl: null };
const gkHillY = x => gy + Math.round(0.0014 * (x - GKH.xg) * (x - GKH.xg));      // (the top of the near hill: a round dome, his feet are on its top)
function gkHillBuild() {
  if (GKH.w === VW && GKH.h === VH && GKH.near) return; GKH.w = VW; GKH.h = VH; GKH.xg = Math.round(VW * 0.58); const W = VW, H = VH, R = wctR, mk = () => { const c = wctCv(W, H); return [c, c.getContext('2d')]; };
  const hz = (g, a) => { g.save(); g.globalCompositeOperation = 'source-atop'; g.fillStyle = 'rgba(214,236,252,' + a + ')'; g.fillRect(0, 0, W, H); g.restore(); };
  { const [c, g] = mk(); GKH.sky = c; const gr = g.createLinearGradient(0, 0, 0, gy - 14); gr.addColorStop(0, '#2f7fd8'); gr.addColorStop(0.4, '#5aa6ea'); gr.addColorStop(0.8, '#a9dbf7'); gr.addColorStop(1, '#eaf7ff'); g.fillStyle = gr; g.fillRect(0, 0, W, H);
    const sx = Math.round(W * 0.84), sy = Math.round(gy * 0.34), gl = g.createRadialGradient(sx, sy, 2, sx, sy, 70); gl.addColorStop(0, 'rgba(255,250,222,0.95)'); gl.addColorStop(0.4, 'rgba(255,244,210,0.45)'); gl.addColorStop(1, 'rgba(255,244,210,0)'); g.fillStyle = gl; g.fillRect(0, 0, W, H); g.fillStyle = '#fffbe6'; g.beginPath(); g.arc(sx, sy, 6, 0, 7); g.fill(); g.fillStyle = '#ffffff'; g.beginPath(); g.arc(sx, sy, 3.4, 0, 7); g.fill(); }
  GKH.cl = [wctCloud(64, 18, 5), wctCloud(44, 13, 17), wctCloud(78, 20, 29), wctCloud(36, 11, 41)];
  { const [c, g] = mk(); GKH.far = c;      // (the mountains, the city of West City on the horizon (small, hazy), the two far hills)
    for (const [base, amp, seed, col, hi] of [[gy - 22, 26, 2.1, '#93b3da', '#c2d6ef'], [gy - 18, 17, 5.3, '#7b9ccb', '#a9c4e6']]) for (let x = 0; x < W; x++) { const n = 0.55 * (1 - Math.abs(Math.sin(x * 0.021 + seed))) + 0.3 * (1 - Math.abs(Math.sin(x * 0.05 + seed * 1.7))) + 0.15 * Math.sin(x * 0.11 + seed), y = Math.round(base - amp * n); g.fillStyle = col; g.fillRect(x, y, 1, gy - y); g.fillStyle = hi; g.fillRect(x, y, 1, 1); if (n > 0.82) { g.fillStyle = '#f2f7fd'; g.fillRect(x, y, 1, 2); } }
    hz(g, 0.28); const caps = ['#ff78ad', '#ffd13b', '#4d86e8', '#3fc9b7', '#ff9a3d', '#9a6be0'], by = gy - 14;
    for (let x = Math.round(W * 0.04), i = 0; x < W * 0.5; i++) { const w = 3 + Math.round(R(i, 61) * 3), h = 6 + Math.round(R(i, 62) * 9); if (i % 6 === 3) { wctDome(g, x + 6, by, 6, 4, ['#f4f6fa', '#dfe4ee', '#b6bfd0', '#8c96ab', '#3c4f78', '#a6dcff', '#98a2b8'], i); x += 14; } else { wctTower(g, x, by, w, h, caps[i % caps.length], i + 80); x += w + 1 + Math.round(R(i, 63) * 2); } }
    hz(g, 0.5);      // (the city is far away: the haze takes most of its colour)
    for (const [base, amp, ph, col, hi, sc] of [[gy - 13, 6, 1.0, '#74b868', '#a2d68e', 0.017], [gy - 6, 7, 2.6, '#5dab4a', '#8acb62', 0.013]]) for (let x = 0; x < W; x++) { const y = Math.round(base - amp * (0.5 + 0.5 * Math.sin(x * sc + ph)) - 3 * Math.sin(x * 0.05 + ph)); g.fillStyle = col; g.fillRect(x, y, 1, H - y); g.fillStyle = hi; g.fillRect(x, y, 1, 1); } }
  { const [c, g] = mk(); GKH.near = c;      // (the near hill: three greens, a lit rim, little tufts, flowers, a few stones and a round tree on the left)
    for (let x = 0; x < W; x++) { const y = gkHillY(x); for (let yy = y; yy < H; yy++) { const d = yy - y; g.fillStyle = d < 1 ? '#a4de62' : d < 3 ? '#7fc84a' : d < 24 ? '#5fae3c' : d < 44 ? '#4a9a34' : '#3a8430'; g.fillRect(x, yy, 1, 1); } }
    for (let i = 0; i < W * 5; i++) { const x = Math.floor(R(i, 71) * W), y0 = gkHillY(x), y = y0 + 3 + Math.floor(R(i, 72) * (H - y0 - 3)); if (y >= H) continue; const r = R(i, 73); g.fillStyle = r < 0.55 ? '#6cbc44' : r < 0.8 ? '#4d9a36' : '#86cf52'; g.fillRect(x, y, 1 + (r > 0.9 ? 1 : 0), 1); }
    for (let i = 0; i < 70; i++) { const x = Math.floor(R(i, 81) * W), y0 = gkHillY(x), y = y0 + 2 + Math.floor(R(i, 82) * Math.min(26, H - y0 - 3)); const r = R(i, 83); if (y >= H - 1) continue; g.fillStyle = r < 0.4 ? '#ffffff' : r < 0.7 ? '#ffe066' : '#ff9fc4'; g.fillRect(x, y, 1, 1); if (r < 0.4) { g.fillStyle = '#ffe066'; g.fillRect(x, y + 1, 1, 1); } g.fillStyle = '#3d8a30'; g.fillRect(x, y + 1 + (r < 0.4 ? 1 : 0), 1, 1); }
    for (const [fx, w, h] of [[0.9, 7, 4], [0.34, 5, 3], [0.76, 4, 2]]) { const x = Math.round(W * fx), y = gkHillY(x) + 6; g.fillStyle = '#7a8090'; g.fillRect(x - (w >> 1), y - h, w, h); g.fillStyle = '#a3a9b8'; g.fillRect(x - (w >> 1), y - h, w, 1); g.fillStyle = '#585e6c'; g.fillRect(x - (w >> 1), y - 1, w, 1); }
    { const tx = Math.round(W * 0.13), ty = gkHillY(tx) + 4; g.fillStyle = '#5a3a1e'; g.fillRect(tx - 2, ty - 26, 4, 26); g.fillStyle = '#7a5230'; g.fillRect(tx - 2, ty - 26, 1, 26); g.fillStyle = '#3d2814'; g.fillRect(tx + 1, ty - 26, 1, 26); g.fillRect(tx - 3, ty - 1, 6, 1);
      for (const [dx, dy, r, col] of [[-9, -34, 9, '#2f7a30'], [8, -33, 9, '#2f7a30'], [0, -42, 10, '#2f7a30'], [-3, -32, 10, '#3a9238'], [6, -38, 7, '#3a9238'], [-8, -40, 6, '#4aa845']]) { g.fillStyle = col; g.beginPath(); g.arc(tx + dx, ty + dy, r, 0, 7); g.fill(); }
      for (let i = 0; i < 46; i++) { const a = R(i, 91) * 6.28, d = R(i, 92) * 14, x = tx + Math.cos(a) * d, y = ty - 37 + Math.sin(a) * d * 0.8; g.fillStyle = R(i, 93) < 0.5 ? '#6cc254' : '#58b247'; g.fillRect(Math.round(x), Math.round(y), 2, 1); }
      for (let i = 0; i < 6; i++) { g.fillStyle = '#e8584a'; g.fillRect(tx - 12 + Math.round(R(i, 94) * 24), ty - 44 + Math.round(R(i, 95) * 16), 2, 2); } } }
}
function gkHill(now, o) {      // the whole picture of the hill: o.wind = how hard the wind blows over the grass (0 - 3), o.push = the wave that flattens the grass [centre x, radius, strength] or null
  gkHillBuild(); const t = now / 1000, wind = o && o.wind !== undefined ? o.wind : 1; ctx.drawImage(GKH.sky, 0, 0);
  [[0.1, 0.16, 0, 2.4], [0.5, 0.3, 1, 1.6], [0.82, 0.12, 2, 2.0], [0.28, 0.07, 3, 1.2]].forEach(([fx, fy, k, sp]) => { const c = GKH.cl[k], x = Math.round(((fx * (VW + 130) + t * sp) % (VW + 130)) - 65); ctx.drawImage(c, x, Math.round(fy * gy)); });
  ctx.drawImage(GKH.far, 0, 0); ctx.drawImage(GKH.near, 0, 0);
  // the grass blades on the rim of the near hill (they lean with the wind, flatten under the wave) and bigger ones at the bottom of the picture
  const pu = o && o.push; ctx.save();
  for (let x = 0; x < VW; x += 2) { const j = wctR(x, 101), y0 = gkHillY(x), h = 3 + Math.round(j * 3), sw = Math.sin(t * 2.1 + x * 0.09) * 1.1 * wind + Math.sin(t * 3.7 + x * 0.21) * 0.5 * wind; let l = sw; if (pu) { const dd = x - pu[0], k = Math.exp(-dd * dd / (2 * pu[1] * pu[1])); l += (dd < 0 ? -1 : 1) * 2.6 * pu[2] * k - 0.6 * pu[2] * k; }
    const lean = Math.max(-3, Math.min(3, l)); ctx.fillStyle = j < 0.5 ? '#8fd152' : '#a9e070'; ctx.fillRect(x, y0 - 1, 1, 1); ctx.fillRect(x + Math.round(lean * 0.4), y0 - 2, 1, 1); ctx.fillStyle = j < 0.3 ? '#6cb83e' : '#b8ec80'; ctx.fillRect(x + Math.round(lean * 0.8), y0 - 3 - (h > 4 ? 1 : 0), 1, 1); if (h > 5) ctx.fillRect(x + Math.round(lean), y0 - 5, 1, 1); }
  for (let x = 1; x < VW; x += 6) { const j = wctR(x, 111), h = 6 + Math.round(j * 5), sw = Math.sin(t * 1.7 + x * 0.13) * 1.6 * wind, base = VH; ctx.fillStyle = '#2f7a28'; for (let k = 0; k < h; k++) { const u = k / h; ctx.fillRect(x + Math.round(sw * u * u), base - 1 - k, 1, 1); } ctx.fillStyle = '#3f9034'; ctx.fillRect(x + 1 + Math.round(sw * 0.5), base - 1 - (h >> 1), 1, h >> 1); }
  ctx.restore();
  const sx = Math.round(VW * 0.84), sy = Math.round(gy * 0.34), gl = ctx.createRadialGradient(sx, sy, 2, sx, sy, 60); gl.addColorStop(0, 'rgba(255,248,214,0.22)'); gl.addColorStop(1, 'rgba(255,248,214,0)'); ctx.fillStyle = gl; ctx.fillRect(0, 0, VW, gy);      // (the sun's light over everything)
}
// ---------------------------------------------------------------- THE TIMELINE (seconds of the scene's own clock G.T; it stops for the hit-stops)
const GKT = { fade: 0.30, show: 0.80, sense: 1.30, senseEnd: 2.30, raise: 2.40, up: 3.00, vanish: 4.10, city: 5.40, arrive: 6.10, say: 6.50, sayEnd: 8.00, punch: 8.10, calm: 8.80, wind: 9.60, strike: 9.90, hit2: 9.98, wall: 10.44, black: 12.30, card: 12.80, cardEnd: 15.90, end: 16.70 };      // (the hill: black, the hill, he senses, the hand goes up, the flash; the city: Yuji alone, he arrives, "WHO ARE YOU?", Yuji's punch, nothing, the wind-up, the blow, the building; the card)
GKT.hit1 = GKT.punch + 7 / 38;      // (Yuji's fist lands on frame 7 of his punch, which runs at 38 pictures per second)
const GKP = { gx: 40, lunge: 12, flight: -262 };      // (Goku's place (world x of his middle, Yuji's is 0), how far Yuji steps into his punch, where Yuji's body ends up against the building)
const GKW = { x0: -350, x1: -170, ix: -262 };      // (the building: its left and right wall, the middle of the crater)
const GKR = (() => { let s = 7; return () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; }; })();      // (a small random number generator with a fixed start: the same picture each time)
// ---------------------------------------------------------------- THE STATE
function gkNew() { gkHillBuild(); gkBuildingBuild(); return { T: 0, live: false, ev: {}, freeze: 0, cam: 0, shk: [0, 0], fl: [], parts: [], mute: false, wallU: -1, said: 0, left: false }; }      // (T = the scene's time, live = the picture is dark and the scene has the whole frame, ev = the events that have fired, freeze = until when the hit-stop lasts, shk = [until, size], fl = the flashes, wallU = the time of the blow on the wall)
const gkSnd = (G, n, a) => { if (!G.mute) snd(n, a); };
function gkBox(cv) {      // the smallest box round the picture's pixels (cached): [x0, y0, x1, y1]
  let b = gkBox.m.get(cv); if (b) return b; const d = cv.getContext('2d').getImageData(0, 0, cv.width, cv.height).data; let x0 = cv.width, y0 = cv.height, x1 = -1, y1 = -1;
  for (let y = 0; y < cv.height; y++) for (let x = 0; x < cv.width; x++) if (d[(y * cv.width + x) * 4 + 3] > 0) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
  b = x1 < 0 ? [0, 0, cv.width, cv.height] : [x0, y0, x1 + 1, y1 + 1]; gkBox.m.set(cv, b); return b;
}
gkBox.m = new Map();
const gkSX = (G, x) => Math.round(VW / 2 + x - G.cam);      // (a world x on the screen)
// ---------------------------------------------------------------- THE FIGURES ON THE SCREEN
function gkShadow(sx, w, a, y) { ctx.fillStyle = 'rgba(10,30,10,' + a + ')'; const yy = (y === undefined ? gy : y); ctx.fillRect(sx - (w >> 1), yy, w, 1); ctx.fillRect(sx - (w >> 1) + 2, yy + 1, w - 4, 1); ctx.fillRect(sx - (w >> 1) - 1, yy - 1, w + 2, 1); }
function gkDrawGoku(G, x, o) {      // o: pose, front (seen from the front), face (1 right, -1 left), lift, alpha, white (0 - 1), sx, sy (stretch from the feet)
  const cv = o.front ? c4xGokuF(o.pose) : c4xGoku(o.pose), sx = gkSX(G, x), top = gy - C4G.GY - Math.round(o.lift || 0), a = o.alpha === undefined ? 1 : o.alpha; if (a <= 0) return;
  ctx.save(); ctx.translate(sx, gy); if ((o.face || 1) < 0) ctx.scale(-1, 1); ctx.scale(o.sx || 1, o.sy || 1); ctx.translate(0, -gy); ctx.globalAlpha = a; ctx.drawImage(cv, -C4G.cx, top);
  if (o.white > 0) { ctx.globalAlpha = a * Math.min(1, o.white); ctx.drawImage(whiteOf(cv), -C4G.cx, top); } ctx.restore();
}
function gkDrawYuji(G, x, o) {      // o: set, k, fi (his pictures, see c4xYPic), lift, face, alpha, white, jx (shake), box + y + rot (the picture is placed by the middle of its pixels at the screen y: the flight and the fall)
  const P = c4xYPic({ set: o.set, k: o.k, fi: o.fi }); if (!P) return; const sx = gkSX(G, x) + (o.jx || 0), face = o.face || 1;
  ctx.save(); if (o.alpha !== undefined) ctx.globalAlpha = o.alpha;
  if (o.box) { const b = gkBox(P.cv); ctx.translate(sx, Math.round(o.y)); if (o.rot) ctx.rotate(o.rot * face); if (face < 0) ctx.scale(-1, 1); ctx.translate(-Math.round((b[0] + b[2]) / 2), -Math.round((b[1] + b[3]) / 2)); }
  else { const top = gy - 60 - P.info.top - Math.round(o.lift || 0), off = P.info.cx - P.info.x0; ctx.translate(sx, top + 32); if (face < 0) ctx.scale(-1, 1); ctx.translate(-off, -32); }
  ctx.drawImage(P.cv, 0, 0); if (o.white > 0) { ctx.globalAlpha = (o.alpha === undefined ? 1 : o.alpha) * Math.min(1, o.white); ctx.drawImage(whiteOf(P.cv), 0, 0); } ctx.restore();
}
// ---------------------------------------------------------------- GOKU'S POSES (the front ones for the hill, the side ones for the city) and how they change with the scene's time
function gkPoseHill(T, now) {      // the front view on the hill, from T = 0
  const t = now / 1000, I = c4xGokuPose.idleF(t), N = c4xGokuPose.fingF(t), u = ease3((T - GKT.raise) / (GKT.up - GKT.raise));
  let p = u > 0 ? c4xMixPose(I, N, u) : { ...I }; p.F = 1; if (u < 0.75) delete p.fing; if (T >= GKT.up - 0.05) p.ex = 'closed'; else if (T >= GKT.sense) p.ex = 'serious';
  const s = ease3((T - GKT.sense) / 0.25) * (1 - ease3((T - GKT.senseEnd) / 0.5)); p.hair = 0.25 + 0.9 * s + (T >= GKT.up ? 0.4 * clamp01((T - GKT.up) / 1.0) : 0); p.lean = -1.2 * s; return p;
}
function gkPoseCity(T, now) {      // the side view (it faces right: the city draws it mirrored), by the scene's time
  const t = now / 1000, S = c4xGokuPose, mix = (a, b, k) => c4xMixPose(a, b, ease3(k)), st = S.stand(t), aim = S.aim(t);
  if (T < GKT.punch - 0.02) return { ...aim, ex: T >= GKT.say && T < GKT.say + 0.75 && Math.floor((T - GKT.say) * 9) % 2 === 0 ? 'talk' : 'serious' };      // (his mouth moves while the letters come out)
  if (T < GKT.calm) { const k = (T - (GKT.punch - 0.02)) / 0.2, p = mix(aim, st, k); p.ex = 'calm'; p.palm = k < 0.5 ? 1 : 0; return p; }      // (the open hand closes as the arm comes down)
  if (T < GKT.wind) { const p = { ...st, ex: T < GKT.wind - 0.5 ? 'calm' : 'serious' }; p.hdt = 3 * ease3((T - GKT.calm) / 0.4); p.hdy = -5 + 0.4 * ease3((T - GKT.calm) / 0.4); return p; }
  if (T < GKT.strike) { const p = mix(st, S.windup(0), (T - GKT.wind) / (GKT.strike - GKT.wind)); p.ex = 'serious'; p.hair = 0.3; return p; }
  const p = mix(S.windup(0), S.punch(0), (T - GKT.strike) / (GKT.hit2 - GKT.strike)); p.ex = 'serious'; p.hair = 0.4; if (T > GKT.hit2 + 0.1) { const q = mix(S.punch(0), st, (T - GKT.hit2 - 0.1) / 0.8); q.ex = 'calm'; q.hair = 0.1; return q; } return p;
}
// ---------------------------------------------------------------- THE BUILDING (West City, left of the street: cream walls, blue glass, an orange awning; it is drawn once between the middle layer and the ground layer of the picture, so the hedge and the pavement stand in front of it)
const GKBLD = { cv: null, h: 0, wins: [] };
function gkBuildingBuild() {
  if (GKBLD.cv && GKBLD.h === VH) return; GKBLD.h = VH; GKBLD.wins = []; const W = GKW.x1 - GKW.x0, H = gy + 1, c = wctCv(W, H), g = c.getContext('2d'), R = wctR, top = gy - 8 - 24;
  g.fillStyle = '#efece4'; g.fillRect(0, 0, W, H); g.fillStyle = '#e3dfd5'; for (let x = 7; x < W - 6; x += 18) g.fillRect(x, 0, 1, H);      // (the wall and the lines between its panels)
  for (let y = top; y > -20; y -= 19) { g.fillStyle = '#d2cec3'; g.fillRect(0, y, W, 1); g.fillStyle = '#f9f7f1'; g.fillRect(0, y + 1, W, 1); }      // (the floors)
  for (let j = 1; j < 6; j++) { const y = top - 19 * j + 5; for (let i = 0; i < 9; i++) { const x = 12 + 18 * i, lit = R(i * 7 + j, 31) < 0.2, cur = R(i * 5 + j, 32) < 0.25; GKBLD.wins.push([x, y]);
      g.fillStyle = '#8e96a4'; g.fillRect(x - 1, y - 1, 13, 12); const gr = g.createLinearGradient(0, y, 0, y + 10); gr.addColorStop(0, lit ? '#fff3c4' : '#a9d6f6'); gr.addColorStop(1, lit ? '#ffd98a' : '#5f9bd2'); g.fillStyle = gr; g.fillRect(x, y, 11, 10); g.fillStyle = '#8e96a4'; g.fillRect(x, y + 5, 11, 1);
      g.fillStyle = 'rgba(255,255,255,0.5)'; g.fillRect(x + 2, y + 1, 1, 3); g.fillRect(x + 3, y + 2, 1, 2); if (cur) { g.fillStyle = '#f7f1e6'; g.fillRect(x + (R(i, j) < 0.5 ? 0 : 7), y, 4, 10); } } }
  g.fillStyle = '#f4923c'; g.fillRect(0, top - 5, W, 4); g.fillStyle = '#c4702a'; g.fillRect(0, top - 1, W, 1);      // (the orange band over the shops)
  g.fillStyle = '#f4923c'; g.fillRect(0, top, W, 6); g.fillStyle = '#ffb061'; g.fillRect(0, top, W, 1); g.fillStyle = '#c4702a'; for (let x = 0; x < W; x += 9) { g.fillRect(x + 4, top + 6, 1, 1); g.fillRect(x + 5, top + 7, 3, 1); } g.fillStyle = '#e07f2c'; for (let x = 0; x < W; x += 9) g.fillRect(x, top + 6, 9, 1);      // (the awning with its scallops)
  g.fillStyle = '#2f4766'; g.fillRect(0, top + 8, W, 16); for (let x = 6; x < W - 10; x += 22) { g.fillStyle = '#3f5f86'; g.fillRect(x, top + 9, 18, 14); g.fillStyle = 'rgba(255,255,255,0.22)'; g.fillRect(x + 3, top + 9, 2, 14); g.fillRect(x + 7, top + 9, 1, 14); g.fillStyle = '#ffe9a8'; g.fillRect(x + 11, top + 15, 5, 5); }      // (the shop windows)
  { const dx = W - 52; g.fillStyle = '#d9d5ca'; g.fillRect(dx - 2, top + 7, 26, 18); g.fillStyle = '#1f3048'; g.fillRect(dx, top + 9, 22, 16); g.fillStyle = '#6aa0d8'; g.fillRect(dx + 1, top + 10, 9, 15); g.fillRect(dx + 12, top + 10, 9, 15); g.fillStyle = 'rgba(255,255,255,0.4)'; g.fillRect(dx + 3, top + 10, 2, 15); g.fillRect(dx + 14, top + 10, 2, 15); g.fillStyle = '#c8ccd4'; g.fillRect(dx + 10, top + 10, 2, 15); }      // (the glass doors)
  g.fillStyle = '#ffffff'; g.fillRect(0, 0, 1, H); const sh = ['#d8d4c9', '#c6c2b6', '#b3afa3']; for (let k = 0; k < 3; k++) { g.fillStyle = sh[k]; g.fillRect(W - 3 + k, 0, 1, H); }      // (the lit edge on the left, the shade on the right)
  GKBLD.cv = c;
}
function gkBuilding(G, now) {      // the building and, after the blow, its crater, its cracks and its broken windows (G.wallU = the scene's time of the blow, or -1)
  gkBuildingBuild(); const sx0 = gkSX(G, GKW.x0); if (sx0 > VW || sx0 + (GKW.x1 - GKW.x0) < 0) return; ctx.drawImage(GKBLD.cv, sx0, 0);
  if (G.wallU < 0) return; const u = Math.max(0, G.T - G.wallU), sx = gkSX(G, GKW.ix), iy = gy - 36, gr = ease3(u / 0.14), cr = ease3(u / 0.3), R = wctR;
  const wr = 46 * ease3(u / 0.22); for (const [wx, wy] of GKBLD.wins) { const px = sx0 + wx + 5.5, py = wy + 5, d = Math.hypot(px - sx, (py - iy) * 1.3); if (d > wr) continue; if (d < 27) { ctx.fillStyle = '#1b222e'; ctx.fillRect(sx0 + wx, wy, 11, 10); ctx.fillStyle = '#8e96a4'; ctx.fillRect(sx0 + wx + 3, wy, 1, 3); } else { ctx.fillStyle = '#ffffff'; ctx.fillRect(sx0 + wx + 1, wy + 1, 1, 1); ctx.fillRect(sx0 + wx + 2, wy + 2, 1, 1); ctx.fillRect(sx0 + wx + 3, wy + 3, 1, 1); ctx.fillRect(sx0 + wx + 8, wy + 1, 1, 1); ctx.fillRect(sx0 + wx + 7, wy + 2, 1, 1); ctx.fillRect(sx0 + wx + 6, wy + 4, 1, 1); ctx.fillRect(sx0 + wx + 5, wy + 6, 1, 1); } }      // (the glass round the blow: gone near it, cracked further out)
  for (let i = 0; i < 11; i++) {      // the cracks: straight bits that change direction every few pixels, growing for a third of a second; every other one forks
    const a0 = i / 11 * 6.2832 + R(i, 3) * 0.5, L = (12 + 32 * R(i, 5)) * cr, step = 3 + (i % 3); let x = sx + Math.cos(a0) * 15 * gr, y = iy + Math.sin(a0) * 7 * gr, ang = a0;
    const run = (x, y, ang, len, k0) => { for (let k = 0; k < len; k++) { if ((k + k0) % step === 0) ang += (R(k + k0 + i * 17, 9) - 0.5) * 1.3; x += Math.cos(ang); y += Math.sin(ang) * 0.85; ctx.fillStyle = '#4b4e5a'; ctx.fillRect(Math.round(x), Math.round(y), 1, 1); if (k % 2) { ctx.fillStyle = 'rgba(255,255,255,0.8)'; ctx.fillRect(Math.round(x) + 1, Math.round(y), 1, 1); } } return [x, y, ang]; };
    const m = run(x, y, ang, Math.floor(L * 0.55), 0); if (i % 2 === 0 && L > 14) run(m[0], m[1], m[2] + 0.9, Math.floor(L * 0.4), 5); run(m[0], m[1], m[2], Math.ceil(L * 0.45), 11);
  }
  const poly = (k, dx, dy, col) => { ctx.beginPath(); for (let i = 0; i < 24; i++) { const a = i / 24 * 6.2832, c = Math.cos(a), s = Math.sin(a), r = (0.86 + 0.28 * R(i, 7)) * gr * k; const px = sx + dx + Math.sign(c) * Math.pow(Math.abs(c), 0.62) * 21 * r, py = iy + dy + Math.sign(s) * Math.pow(Math.abs(s), 0.62) * 8.5 * r; if (i) ctx.lineTo(px, py); else ctx.moveTo(px, py); } ctx.closePath(); ctx.fillStyle = col; ctx.fill(); };
  poly(1.16, 0, 0, '#f6f3ea'); poly(1.04, -0.5, 0.5, '#9a978d'); poly(0.9, -1, 1, '#2f3240'); poly(0.62, -1.5, 1.5, '#15171f');      // (the hole: a pale rim of crushed wall, a grey edge, a dark inside, a black middle)
  ctx.fillStyle = '#ffffff'; for (let i = 0; i < 9; i++) { const a = -0.2 - i * 0.2, r = 1.14 * gr; ctx.fillRect(Math.round(sx + Math.cos(a) * 21 * r), Math.round(iy + Math.sin(a) * 8.5 * r), 1, 1); }
  ctx.fillStyle = '#6a6d7c'; for (let i = 0; i < 8; i++) { const a = 3.0 + i * 0.22, r = 0.84 * gr; ctx.fillRect(Math.round(sx - 1 + Math.cos(a) * 19 * r), Math.round(iy + 1 + Math.sin(a) * 7.6 * r), 2, 1); }
  ctx.fillStyle = '#b9b5aa'; for (let i = 0; i < 10; i++) { const a = i / 10 * 6.2832 + 0.4, r = (1.2 + 0.2 * R(i, 8)) * gr; ctx.fillRect(Math.round(sx + Math.cos(a) * 21 * r), Math.round(iy + Math.sin(a) * 8.5 * r), 1 + (i % 3 === 0 ? 1 : 0), 1); }      // (crumbs of the wall round it)
}
// ---------------------------------------------------------------- PARTICLES (world x, screen y; they stop with the clock: the hit-stops)
function gkAdd(G, p) { G.parts.push({ age: 0, life: 1, g: 0, vx: 0, vy: 0, ...p }); }
function gkBurstDebris(G, x, y, n, dir) {      // the wall breaks: stones, bits of glass and dust, thrown out of the hole (dir = +1: to the right, away from the wall)
  for (let i = 0; i < n; i++) { const r = GKR(), a = (r * 2 - 1) * 1.5 + (dir > 0 ? 0 : 3.14), sp = 50 + GKR() * 190; gkAdd(G, { k: i % 3 ? 'chunk' : 'glass', x: x + (GKR() - 0.5) * 14, y: y + (GKR() - 0.5) * 8, vx: Math.cos(a) * sp * (dir > 0 ? 0.9 : -0.9), vy: Math.sin(a) * sp - 60, g: 430, life: 1.7 + GKR() * 0.9, w: 1 + (GKR() < 0.18 ? 3 : GKR() < 0.4 ? 2 : GKR() < 0.6 ? 1 : 0), col: i % 3 ? ['#efece4', '#d8d4c9', '#b3afa3', '#8f8c84', '#f4923c'][i % 5] : ['#d9f1ff', '#9fd2f4', '#ffffff', '#5f9bd2'][i % 4], floor: gy - 4 - (GKR() * 5 | 0) }); }
  for (let i = 0; i < 20; i++) gkAdd(G, { k: 'dust', x: x + (GKR() - 0.5) * 34, y: y + (GKR() - 0.5) * 16, vx: 8 + GKR() * 50, vy: -10 - GKR() * 24, r: 3 + GKR() * 4, dr: 9 + GKR() * 10, life: 0.9 + GKR() * 1.1, col: ['#d6d2c6', '#c4c0b4', '#e2ded3'][i % 3], a: 0.5 });
}
function gkStepParts(G, dt) {
  for (const p of G.parts) { p.age += dt; if (p.k === 'dust') { p.r += p.dr * dt; p.dr *= 1 - 0.8 * dt; p.x += p.vx * dt; p.y += p.vy * dt; p.vx *= 1 - 0.9 * dt; p.vy *= 1 - 0.7 * dt; continue; }
    if (p.k === 'ki') { p.x += p.vx * dt; p.y += p.vy * dt; continue; } p.vy += p.g * dt; p.x += p.vx * dt; p.y += p.vy * dt;
    if (p.floor !== undefined && p.y > p.floor) { p.y = p.floor; p.vy *= -0.3; p.vx *= 0.55; if (Math.abs(p.vy) < 14) { p.vy = 0; p.g = 0; p.vx = 0; } } }
  G.parts = G.parts.filter(p => p.age < p.life); if (G.parts.length > 420) G.parts.splice(0, G.parts.length - 420);
}
function gkDisc(x, y, r, col, a) { if (a <= 0.01 || r < 0.5) return; ctx.globalAlpha = a; ctx.fillStyle = col; r = Math.round(r); for (let dy = -r; dy <= r; dy++) { const w = Math.round(Math.sqrt(Math.max(0, r * r + 0.5 - dy * dy))); ctx.fillRect(Math.round(x) - w, Math.round(y) + dy, 2 * w + 1, 1); } ctx.globalAlpha = 1; }
function gkDrawParts(G, now) {
  for (const p of G.parts) { const k = p.age / p.life, sx = gkSX(G, p.x);
    if (p.k === 'dust') { const a = p.a * (1 - k) * (k < 0.1 ? k * 10 : 1); gkDisc(sx, p.y, p.r, p.col, a); gkDisc(sx + p.r * 0.22, p.y - p.r * 0.25, p.r * 0.7, '#f6f3ea', a * 0.7); gkDisc(sx - p.r * 0.3, p.y + p.r * 0.3, p.r * 0.45, '#a8a396', a * 0.45); }      // (a puff of dust: a grey body, lit on the upper right, shaded on the lower left)
    else if (p.k === 'ki') { ctx.globalAlpha = (1 - k) * (0.5 + 0.5 * Math.sin(now / 40 + p.x)); ctx.fillStyle = p.col; ctx.fillRect(Math.round(sx), Math.round(p.y), 1, p.h || 1); ctx.globalAlpha = 1; }
    else { ctx.globalAlpha = k > 0.75 ? (1 - k) * 4 : 1; ctx.fillStyle = p.col; ctx.fillRect(Math.round(sx), Math.round(p.y), p.w, Math.max(1, Math.round(p.w * 0.7))); if (p.k === 'glass' && Math.floor(now / 70 + p.x) % 5 === 0) { ctx.fillStyle = '#ffffff'; ctx.fillRect(Math.round(sx) + 1, Math.round(p.y) - 1, 1, 1); } ctx.globalAlpha = 1; } }
}
// ---------------------------------------------------------------- LIGHT EFFECTS (rings on the ground or in the air, rays, the star of a blow, glows): each one is a function of the time since it began
function gkRing(sx, sy, u, r1, flat, col, w) { if (u <= 0 || u >= 1) return; ctx.save(); ctx.globalAlpha = (1 - u) * 0.9; ctx.strokeStyle = col; ctx.lineWidth = w || 1; const r = r1 * (1 - Math.pow(1 - u, 2.2)); ctx.beginPath(); ctx.ellipse(sx, sy, Math.max(0.5, r), Math.max(0.3, r * flat), 0, 0, 6.2832); ctx.stroke(); ctx.restore(); }
function gkRays(sx, sy, u, n, r0, r1, col, seed) { if (u <= 0 || u >= 1) return; ctx.save(); ctx.globalAlpha = 1 - u; ctx.fillStyle = col; for (let i = 0; i < n; i++) { const a = i / n * 6.2832 + wctR(i, seed) * 0.4, ra = r0 + (r1 - r0) * (0.7 + 0.3 * wctR(i, seed + 1)) * (1 - Math.pow(1 - u, 2)), rb = ra * 0.55 + r0 * 0.45, dx = Math.cos(a), dy = Math.sin(a), len = Math.ceil(ra - rb); for (let k = 0; k <= len; k++) ctx.fillRect(Math.round(sx + dx * (rb + k)), Math.round(sy + dy * (rb + k)), 1, 1); } ctx.restore(); }
function gkGlow(sx, sy, r, a, col) { if (a <= 0.01) return; ctx.save(); ctx.globalCompositeOperation = 'lighter'; const g = ctx.createRadialGradient(sx, sy, 0, sx, sy, r); g.addColorStop(0, 'rgba(' + col + ',' + a.toFixed(3) + ')'); g.addColorStop(1, 'rgba(' + col + ',0)'); ctx.fillStyle = g; ctx.fillRect(sx - r, sy - r, 2 * r, 2 * r); ctx.restore(); }
function gkStar(sx, sy, u, r) {      // the flash at the point of a blow: an eight-pointed star that shrinks while it fades (white in the middle, yellow at the points)
  if (u < 0 || u >= 1) return; const k = 1 - u, n = 8; ctx.save(); for (let pass = 0; pass < 2; pass++) { ctx.fillStyle = pass ? '#ffffff' : '#ffe27a'; ctx.beginPath(); for (let i = 0; i < n * 2; i++) { const a = i / (n * 2) * 6.2832 + 0.2, rr = (i % 2 ? 0.28 : 1) * r * k * (pass ? 0.62 : 1); const x = sx + Math.cos(a) * rr, y = sy + Math.sin(a) * rr; if (i) ctx.lineTo(x, y); else ctx.moveTo(x, y); } ctx.closePath(); ctx.fill(); } ctx.restore();
}
// ---------------------------------------------------------------- YUJI: all of his pictures are his own from the fight; where he is and which one, by the scene's time T
function gkYujiAt(T, now) {
  const idle = Math.floor(now / 85) % 15;
  if (T < GKT.arrive) return { x: 0, set: 'idle', fi: idle };
  if (T < GKT.punch) { const u = T - GKT.arrive; return { x: -2 * ease3(u / 0.15), set: 'blk', fi: Math.min(5, Math.floor(u * 22)) }; }      // (startled: the guard goes up and he gives half a step)
  if (T < GKT.hit2) {      // (his punch: he steps into it, the fist lands on frame 7, then he stays there, pushing against Goku: the arm shakes)
    const u = T - GKT.punch, o = { x: -2 + (GKP.lunge + 2) * ease3(u / (GKT.hit1 - GKT.punch)), set: 'atk', k: 18, fi: Math.min(7, Math.floor(u * 38)) }; if (T >= GKT.hit1 + 0.3) o.jx = Math.floor(now / 33) % 2; return o;
  }
  const u = T - GKT.hit2, F = GKT.wall - GKT.hit2;
  if (u < F) { const k = u / F; return { x: lerp(GKP.lunge, GKP.flight, k), set: 'rx', k: 4, fi: Math.min(7, Math.floor(k * 8)), box: 1, y: gy - 30 - 18 * Math.sin(Math.PI * k * 0.85), white: u < 0.07 ? 1 : 0 }; }      // (thrown to the left, on his back, in an arc)
  const v = u - F, t = Math.max(0, v - 0.3), y = Math.min(gy - 9, gy - 36 + 0.5 * 380 * t * t);      // (he is in the wall for a moment, then slides down it and falls)
  return { x: GKP.flight, set: 'rx', k: 4, fi: y >= gy - 9 ? 9 : 7, box: 1, y, jx: v < 0.18 ? (Math.floor(now / 33) % 2 ? 1 : -1) : 0 };
}
// ---------------------------------------------------------------- THE HILL SHOT (T from 0 to GKT.city)
function gkDrawHill(G, now) {
  gkHillBuild(); const T = G.T, xg = GKH.xg, gx = xg - Math.round(VW / 2), sense = clamp01((T - GKT.sense) / (GKT.senseEnd - GKT.sense)), vu = T - GKT.vanish, hx = xg, hy = gy - 50;
  let push = null; if (T >= GKT.sense && T < GKT.senseEnd + 0.5) push = [lerp(-30, VW + 40, sense), 14, 1]; else if (vu >= 0 && vu < 1.8) push = [xg, 14 + 70 * vu, 1.8 * Math.exp(-vu * 2.2)];
  gkHill(now, { wind: 1 + 1.2 * clamp01((T - GKT.up) / 1.0) * (vu < 0 ? 1 : Math.exp(-vu * 1.5)), push });
  G.shown = vu < 0.22;      // (is he on the hill: the tests ask)
  if (G.shown) {      // (he stands on the top of the hill, seen from the front)
    const k = ease3((vu - 0.07) / 0.15); gkShadow(xg, 22, 0.3 * (1 - (vu > 0 ? k : 0)), gy + 1);
    gkDrawGoku(G, gx, { front: 1, pose: gkPoseHill(T, now), white: vu < 0 ? 0 : 1, sx: vu > 0.07 ? 1 - 0.96 * k : 1, sy: vu > 0.07 ? 1 + 0.12 * k : 1, alpha: vu > 0.07 ? 1 - 0.3 * k : 1 });
  }
  if (T >= GKT.sense && T < GKT.senseEnd + 0.5) {      // (the wave of the strange power: a thin wavy line crosses the hill from the left, two weaker ones behind it)
    const fx = lerp(-30, VW + 40, sense); ctx.save(); for (let j = 0; j < 3; j++) { ctx.globalAlpha = [0.6, 0.3, 0.14][j] * (1 - clamp01((T - GKT.senseEnd) / 0.5)); ctx.fillStyle = '#eef6ff'; for (let y = 0; y < gy + 8; y++) ctx.fillRect(Math.round(fx - j * 7 + 2.6 * Math.sin(y * 0.14 + T * 16)), y, 1, 1); } ctx.restore();
  }
  if (T >= GKT.up - 0.15 && vu < 0.1) {      // (the glow at his forehead and the fingers grows while he gathers himself; rings go out over the grass)
    const k = clamp01((T - (GKT.up - 0.15)) / (GKT.vanish - GKT.up + 0.15)); gkGlow(hx - 1, hy - 3, 8 + 22 * k, 0.14 + 0.5 * k, '170,225,255'); gkGlow(hx - 1, hy - 3, 4 + 6 * k, 0.3 + 0.5 * k, '255,255,255');
    const tw = Math.floor(now / 60) % 3; ctx.fillStyle = '#ffffff'; if (k > 0.3 && tw) { ctx.fillRect(hx - 2, hy - 6, 1, 3); ctx.fillRect(hx - 3, hy - 5, 3, 1); }
    for (const t0 of [GKT.up + 0.3, GKT.up + 0.7]) gkRing(hx, gy, (T - t0) / 0.5, 30, 0.17, '#cfeeff');
  }
  if (vu >= 0 && vu < 0.5) {      // (the blink of instant transmission: a pillar of light where he was, a ring on the ground, rays from his chest)
    const k = vu / 0.5, w = Math.max(0, Math.round(5 * (1 - k * 1.2))); ctx.save(); ctx.globalAlpha = 1 - k * k; ctx.fillStyle = '#ffffff'; ctx.fillRect(hx - (w >> 1), gy - 82, w, 82); ctx.fillStyle = '#bfeaff'; ctx.fillRect(hx - (w >> 1) - 1, gy - 82, 1, 82); ctx.fillRect(hx - (w >> 1) + w, gy - 82, 1, 82); ctx.restore();
    gkRing(hx, gy, vu / 0.55, 52, 0.16, '#ffffff', 2); gkRays(hx, gy - 28, vu / 0.35, 12, 6, 34, '#ffffff', 41);
  }
  if (vu >= 0 && vu < 0.5) gkGlow(hx, gy - 28, 24, 0.6 * (1 - vu / 0.5), '200,235,255');
}
// ---------------------------------------------------------------- THE CITY SHOT (T from GKT.city)
function gkDrawCity(G, now) {
  const T = G.T; wctWorld(now, G.cam, () => gkBuilding(G, now));
  const Y = gkYujiAt(T, now), gx = GKP.gx, au = clamp01((T - GKT.arrive) / 0.16), here = T >= GKT.arrive, yx = gkSX(G, Y.x), gsx = gkSX(G, gx);
  ctx.fillStyle = 'rgba(0,0,0,0.26)'; for (const [sx, w] of [[yx, Y.box ? 0 : 26], [gsx, here ? 26 : 0]]) if (w) { ctx.fillRect(sx - (w >> 1), gy + 1, w, 1); ctx.fillRect(sx - (w >> 1) + 2, gy + 2, w - 4, 1); }
  const goku = () => { if (here) gkDrawGoku(G, gx, { pose: gkPoseCity(T, now), face: -1, alpha: clamp01(au * 3), white: 1 - clamp01(au * 1.3) }); };
  const ghosts = () => { if (T >= GKT.hit2 && T < GKT.wall + 0.02) for (let k = 3; k >= 1; k--) { const q = gkYujiAt(Math.max(GKT.hit2, T - 0.03 * k), now); gkDrawYuji(G, q.x, { ...q, alpha: [0.38, 0.22, 0.11][k - 1], white: 0 }); } };
  if (T < GKT.hit2) { goku(); gkDrawYuji(G, Y.x, Y); } else { ghosts(); gkDrawYuji(G, Y.x, Y); goku(); }
  if (T >= GKT.wind && T < GKT.strike) gkGlow(gsx + 8, gy - 28, 9, 0.18 + 0.4 * (T - GKT.wind) / (GKT.strike - GKT.wind), '255,240,200');      // (the air gathers round his drawn-back fist)
  if (T >= GKT.strike && T < GKT.hit2 + 0.04) { ctx.save(); ctx.fillStyle = '#ffffff'; for (let i = 0; i < 6; i++) { const y = gy - 52 + i * 6 + Math.round(wctR(i, 101) * 3), len = 20 + Math.round(wctR(i, 102) * 26); ctx.globalAlpha = 0.55; ctx.fillRect(gsx + 6, y, len, 1); } ctx.restore(); }      // (and the lines of the strike behind him)
  if (T >= GKT.hit1 + 0.25 && T < GKT.wind + 0.1) { const k = clamp01((T - GKT.hit1 - 0.25) / 0.7), dx = gkSX(G, GKP.lunge) + 7, dy = Math.round(gy - 58 + 12 * k); ctx.fillStyle = '#9fd8ff'; ctx.fillRect(dx, dy, 2, 3); ctx.fillStyle = '#ffffff'; ctx.fillRect(dx, dy, 1, 1); }      // (a drop of sweat runs down Yuji's temple)
  gkDrawParts(G, now);
  const au2 = T - GKT.arrive;      // (instant transmission, arriving: streaks of light run in from the right edge, a pillar of light stands where he lands, a ring spreads on the ground)
  if (au2 > -0.16 && au2 < 0) { ctx.save(); ctx.fillStyle = '#ffffff'; for (let i = 0; i < 5; i++) { const y = gy - 14 - i * 8 + wctR(i, 51) * 4, k = (au2 + 0.16) / 0.16, x1 = lerp(VW + 10, gsx, k), x0 = x1 + 46 * (1 - k * 0.6); ctx.globalAlpha = 0.4 + 0.5 * k; ctx.fillRect(Math.round(Math.min(x0, x1)), Math.round(y), Math.round(Math.abs(x0 - x1)), 1); } ctx.restore(); }
  if (au2 >= 0 && au2 < 0.4) { const k = au2 / 0.4, w = Math.max(0, Math.round(6 * (1 - k * 1.6))); ctx.save(); ctx.globalAlpha = 1 - k; ctx.fillStyle = '#ffffff'; ctx.fillRect(gsx - (w >> 1), gy - 70, w, 70); ctx.restore(); gkRing(gsx, gy, au2 / 0.5, 40, 0.16, '#cfeeff', 2); gkRays(gsx, gy - 30, au2 / 0.3, 10, 8, 30, '#ffffff', 61); gkGlow(gsx, gy - 30, 30, 0.45 * (1 - k), '200,235,255'); }
  const r1 = (now - (G.hit1Now || 0)) / 1000; if (G.hit1Now && r1 < 0.4) { gkRing(gkSX(G, GKP.lunge + 21), gy - 38, r1 / 0.4, 14, 1, '#d6d6d6'); }      // (Yuji's punch: a small grey ring and no star, no flash, nothing)
  const r2 = (now - (G.hit2Now || 0)) / 1000; if (G.hit2Now && r2 < 0.6) { const cx = gkSX(G, GKP.lunge + 4), cy = gy - 28; gkStar(cx, cy, r2 / 0.2, 30); gkRing(cx, cy, r2 / 0.5, 60, 1, '#ffffff', 2); gkRing(cx, cy, r2 / 0.6, 40, 0.7, '#ffe27a', 1); gkRays(cx, cy, r2 / 0.45, 16, 10, 58, '#ffffff', 71); }
  if (T >= GKT.hit2 && T < GKT.wall) { ctx.save(); ctx.fillStyle = '#ffffff'; for (let i = 0; i < 7; i++) { const y = Math.round(Y.y - 12 + i * 4 + wctR(i, 81) * 2), len = 24 + Math.round(wctR(i, 82) * 50); ctx.globalAlpha = 0.5 * (1 - wctR(i, 83) * 0.5); ctx.fillRect(yx + 12, y, len, 1); } ctx.restore(); }      // (speed lines behind him as he flies)
  const r3 = (now - (G.wallNow || 0)) / 1000; if (G.wallNow && r3 < 0.7) { const cx = gkSX(G, GKW.ix), cy = gy - 36; gkStar(cx, cy, r3 / 0.22, 34); gkRing(cx, cy, r3 / 0.5, 70, 1, '#ffffff', 2); gkRing(cx, cy, r3 / 0.7, 46, 0.6, '#ffe27a', 1); gkRays(cx, cy, r3 / 0.5, 18, 10, 64, '#ffffff', 91); }
}
// ---------------------------------------------------------------- THE CLOCK: events, the camera, the particles (one step of the scene; the scene's time stops while a hit-stop lasts)
function gkStep(G, now, dt) {
  const fr = now < G.freeze, st = fr ? 0 : dt; G.T += st; const T = G.T, ev = (n, t, f) => { if (T >= t && !G.ev[n]) { G.ev[n] = 1; f(); } };
  const shake = (a, ms) => { G.shk = [now + ms, a]; }, flash = (a, ms) => G.fl.push([now, ms, a]), freeze = ms => { G.freeze = now + ms; }, gx0 = GKH.xg - Math.round(VW / 2);
  ev('sense', GKT.sense, () => gkSnd(G, 'itsense')); ev('charge', GKT.up - 0.05, () => gkSnd(G, 'itcharge')); ev('vanish', GKT.vanish, () => { gkSnd(G, 'itvanish'); flash(0.55, 170); });
  ev('cut', GKT.city, () => flash(0.6, 150));
  ev('arrive', GKT.arrive, () => { gkSnd(G, 'itarrive'); flash(0.6, 150); shake(2.5, 180); for (let i = 0; i < 10; i++) gkAdd(G, { k: 'dust', x: GKP.gx + (GKR() - 0.5) * 22, y: gy - 2 + GKR() * 3, vx: (GKR() - 0.5) * 70, vy: -4 - GKR() * 10, r: 2 + GKR() * 3, dr: 10 + GKR() * 8, life: 0.7 + GKR() * 0.5, col: '#e8e4da', a: 0.5 }); });
  ev('lunge', GKT.punch + 0.04, () => gkSnd(G, 'land', 0.5));
  ev('hit1', GKT.hit1, () => { gkSnd(G, 'gkdud'); freeze(430); G.hit1Now = now; for (let i = 0; i < 4; i++) gkAdd(G, { k: 'dust', x: GKP.lunge + 24 + GKR() * 4, y: gy - 38 + (GKR() - 0.5) * 6, vx: (GKR() - 0.2) * 30, vy: -6 - GKR() * 8, r: 1.5 + GKR() * 1.5, dr: 6, life: 0.5, col: '#d8d8d8', a: 0.5 }); });
  ev('wind', GKT.wind, () => gkSnd(G, 'gkwind'));
  ev('hit2', GKT.hit2, () => { gkSnd(G, 'gkpunch'); gkSnd(G, 'concboom'); freeze(340); shake(6, 520); flash(0.85, 230); G.hit2Now = now; });
  ev('wall', GKT.wall, () => { gkSnd(G, 'c4crater'); gkSnd(G, 'c7shatter'); gkSnd(G, 'concboom'); freeze(130); shake(6, 650); flash(0.7, 230); G.wallNow = now; G.wallU = GKT.wall; gkBurstDebris(G, GKW.ix + 10, gy - 36, 34, 1); });
  ev('card', GKT.card, () => gkSnd(G, 'msting'));
  if (T >= GKT.up && T < GKT.vanish) { G.ki = (G.ki || 0) + st * 26; while (G.ki >= 1) { G.ki -= 1; gkAdd(G, { k: 'ki', x: gx0 + (GKR() - 0.5) * 20, y: gy - 6 - GKR() * 54, vx: (GKR() - 0.5) * 8, vy: -(14 + GKR() * 22), life: 0.7 + GKR() * 0.6, col: GKR() < 0.5 ? '#ffffff' : '#bfeaff', h: GKR() < 0.3 ? 2 : 1 }); } }      // (sparks of light rise round him while he gathers himself)
  if (T >= GKT.wall + 0.25 && T < GKT.wall + 1.8) { G.tr = (G.tr || 0) + st * 9; while (G.tr >= 1) { G.tr -= 1; gkAdd(G, { k: 'chunk', x: GKW.ix + (GKR() - 0.3) * 34, y: gy - 36 + (GKR() - 0.2) * 12, vx: GKR() * 14, vy: 0, g: 430, life: 1.2, w: 1, col: ['#f4f1ea', '#bfbcb2', '#8f8c84'][(GKR() * 3) | 0], floor: gy - 4 - (GKR() * 4 | 0) }); } }      // (and bits of the wall go on falling out of the hole)
  if (T >= GKT.say && T < GKT.sayEnd) { const line = 'WHO ARE YOU?', n = Math.min(line.length, Math.floor((T - GKT.say) * TN_RATE)); while (G.said < n) { G.said++; if (line[G.said - 1] !== ' ') gkSnd(G, 'tvoice', 1); } }      // (the letters come out with the blips of his voice)
  if (T >= GKT.hit2 + 0.04) { const Y = gkYujiAt(T, now), tx = Math.max(-250, Math.min(0, Y.x + 26)); G.cam += (tx - G.cam) * (1 - Math.exp(-9 * st)); }      // (the camera runs after Yuji as he is thrown)
  gkStepParts(G, st);
}
// ---------------------------------------------------------------- ONE PICTURE OF THE SCENE
function gkRender(G, now) {
  const T = G.T, cx = Math.round(VW / 2); ctx.save(); ctx.imageSmoothingEnabled = false; ctx.fillStyle = '#000'; ctx.fillRect(0, 0, VW, VH);
  const am = G.shk[0] > now ? G.shk[1] * SET.shk / 100 : 0; if (am > 0.3) ctx.translate(Math.round((Math.random() * 2 - 1) * am), Math.round((Math.random() * 2 - 1) * am));
  if (T < GKT.black) { if (T < GKT.city) gkDrawHill(G, now); else gkDrawCity(G, now); }
  ctx.restore(); ctx.save(); ctx.imageSmoothingEnabled = false;
  if (T < GKT.show) { ctx.fillStyle = 'rgba(0,0,0,' + (1 - clamp01((T - GKT.fade) / (GKT.show - GKT.fade))).toFixed(3) + ')'; ctx.fillRect(0, 0, VW, VH); }
  for (const f of G.fl) { const a = rfFl(f[2]) * (1 - (now - f[0]) / f[1]); if (a > 0.004) { ctx.fillStyle = 'rgba(' + (SET.nf ? '0,0,0' : '255,255,255') + ',' + a.toFixed(3) + ')'; ctx.fillRect(0, 0, VW, VH); } } G.fl = G.fl.filter(f => now - f[0] < f[1]);
  if (T >= GKT.say && T < GKT.sayEnd) c7Dlg('GOKU', 'WHO ARE YOU?', Math.floor((T - GKT.say) * TN_RATE));
  if (T >= GKT.black - 0.3) { ctx.fillStyle = 'rgba(0,0,0,' + clamp01((T - (GKT.black - 0.3)) / 0.3).toFixed(3) + ')'; ctx.fillRect(0, 0, VW, VH); }
  if (T >= GKT.card) { const a = clamp01((T - GKT.card) / 0.8) * (1 - clamp01((T - (GKT.cardEnd - 0.1)) / 0.6)); if (a > 0) { ctx.globalAlpha = a; pxt('TO BE CONTINUED', cx, Math.round(VH * 0.5), '#ffffff', 16, 'center'); ctx.globalAlpha = 1; } }
  ctx.restore();
}
function gkFrame(now, dt) {      // drawScene hands the whole frame to this while the Goku scene runs; the controls stay locked and the scene ends in the chapter list
  const G = vs.k5.end.gk; keyL = keyR = padL = padR = jumpReq = atkReq = crReq = lpReq = dashReq = ceReq = domReq = blockHeld = false; stickDown = false; fatReq = 0; atkQ = false;
  gkStep(G, now, Math.min(0.05, Math.max(0, dt || 0))); gkRender(G, now);
  if (G.T >= GKT.end && !G.left) { G.left = true; k5Leave(); }
}
function gkSeek(T) {      // (for the tests) run the scene on to the time T at once, without sounds and without hit-stops; the time stamps of the effects are moved so that they look as old as they should
  const G = vs.k5.end.gk; G.mute = true; const n0 = pnow(); let n = n0; G.freeze = 0; while (G.T < T) { n += 1000 / 60; G.freeze = 0; gkStep(G, n, 1 / 60); } G.mute = false; G.freeze = 0;
  const d = n0 - n; for (const f of G.fl) f[0] += d; for (const k of ['hit1Now', 'hit2Now', 'wallNow']) if (G[k]) G[k] += d; G.shk[0] += d; return G.T;
}
window.__gk = () => { const E = vs && vs.k5 && vs.k5.end, G = E && E.gk; return G ? { T: G.T, live: G.live, cam: G.cam, wallU: G.wallU, parts: G.parts.length, left: G.left, said: G.said, fr: pnow() < G.freeze, shown: G.shown } : null; };      // (test hooks: the scene's state; gkSeek runs it on)
window.__gkSeek = T => gkSeek(T);
