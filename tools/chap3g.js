// ================================================================ v1.141 THE CITY OF THE AIR FIGHT: the custom scenes (drawn in the world of the arena, behind and in front of the two fighters)
// Layout (x and y from the arena AC, y down; the street is 705 below it): the pair's path (C11PATH in tools/chap3d.js) goes through three skyscrapers T1, T2, T3 (act CHASE: they smash through the glass of each), then TC, a tower that Sukuna CUTS in half with a slash
// (act CUT: the top half slides along the cut and falls onto the roof of TI, a wide building; they fight beside it), it breaks the roof (act FALL: the front of TI fades away and they fall through its floors, each one breaks under them), out through its right wall;
// Mahoraga throws him back (act THROW: through TI and the stump of TC; the three SWIPES are the walls he goes through), to the roof R of a low building (act ROOF: a water tower, an antenna; the wheel adapts to his slash), then straight up (act MOON: the clouds, a huge moon).
// Everything is a function of the song time m (and of the outcomes of the swipes, C13Q.res.w0 - w2: a clean cut or a ragged smash).

const C14L = {
  T: [{ id: 'T1', x: 380, w: 190, top: -170 }, { id: 'T2', x: 760, w: 210, top: -130 }, { id: 'T3', x: 1080, w: 190, top: -90 }, { id: 'TC', x: 1560, w: 240, top: -150 }, { id: 'TI', x: 1960, w: 320, top: 180 }, { id: 'R', x: 1305, w: 250, top: 600 }],
  bottom: 720, cut: { t: c9B(34, 3), cx: 1560, cy: 40, sl: 0.3 }, breach: c9B(34, 3) + 5.0, moon: [1430, -380, 85], roof: 600
};
const C14H = [      // the holes: [tower, wall x, the moment, direction the glass flies (1 right, -1 left), id of the swipe]
  ['T1', 285, c9B(28, 3), 1], ['T1', 475, c9B(29, 3), 1], ['T2', 655, c9B(30, 2), 1], ['T2', 865, c9B(31, 2), 1], ['T3', 985, c9B(32, 0), 1], ['T3', 1175, c9B(32, 3), 1], ['TI', 2120, c9B(44, 3), 1], ['TI', 2120, c9B(45, 3) + 0.15, -1],
  ['TI', 1800, c9B(46, 3), -1, 'w0'], ['TC', 1680, c9B(47, 1), -1, 'w1'], ['TC', 1440, c9B(47, 3), -1, 'w2']
];
const C14PASS = [['T1', 285, 475, c9B(28, 3), c9B(29, 3), 1], ['T2', 655, 865, c9B(30, 2), c9B(31, 2), 1], ['T3', 985, 1175, c9B(32, 0), c9B(32, 3), 1], ['TC', 1440, 1680, c9B(47, 1), c9B(47, 3), -1]];      // the tunnels they leave: [tower, from wall, to wall, entered, left, direction]
const C14HALF = [[0, 0, 0, 0], [0.6, 8, 2, 0.003], [1.6, 45, 14, 0.02], [2.8, 100, 32, 0.07], [4, 150, 46, 0.17], [5, 190, 64, 0.3], [5.6, 200, 112, 0.36], [6.4, 205, 190, 0.4]];      // the top half of TC: [seconds after the cut, how far it has slid and fallen (x, y), how far it has turned]: it lands on the roof of TI at 5 s
const C14W = { img: {} };
const c14O = () => c10Env().AC, c14T = id => C14L.T.find(t => t.id === id);
const c14P = t => { const O = c14O(); return { x: O.x + c11Spl(C11PATH, t, 1), y: O.y + c11Spl(C11PATH, t, 2) }; };      // the middle of the pair (without its sway)

function c14Img(T) {      // a skyscraper as one picture: the glass body, the floors, the windows (some lit, warm and cool), the edges and the roof line
  const h = C14L.bottom - T.top, key = T.id + T.w + 'x' + h; if (C14W.img[key]) return C14W.img[key];
  const c = document.createElement('canvas'); c.width = T.w; c.height = h; const g = c.getContext('2d'), sd = T.id.split('').reduce((a, ch) => a * 31 + ch.charCodeAt(0), 7), gr = g.createLinearGradient(0, 0, 0, h);
  gr.addColorStop(0, '#0e1740'); gr.addColorStop(1, '#070b22'); g.fillStyle = gr; g.fillRect(0, 0, T.w, h); g.fillStyle = '#1b2862'; g.fillRect(0, 0, 3, h); g.fillRect(T.w - 3, 0, 3, h); g.fillStyle = '#2a3a80'; g.fillRect(0, 0, T.w, 4);
  for (let gy2 = 0; gy2 * 14 < h - 10; gy2++) {
    g.fillStyle = 'rgba(8,12,34,0.55)'; g.fillRect(3, gy2 * 14 + 12, T.w - 6, 2);
    for (let gx = 0; gx * 12 < T.w - 18; gx++) { const r = c4R(sd + gx * 131 + gy2 * 7, 5); g.fillStyle = r < 0.34 ? '#ffd98a' : r < 0.5 ? '#9fc4ff' : '#111c4a'; g.fillRect(9 + gx * 12, 4 + gy2 * 14, 7, 7); }
  }
  g.fillStyle = 'rgba(160,190,255,0.06)'; for (let k = 0; k < 4; k++) g.fillRect(Math.round(T.w * (0.15 + 0.22 * k)), 0, 6, h);      // (the shine of the glass)
  return C14W.img[key] = c;
}
function c14Half(u) { return { dx: c11Spl(C14HALF, u, 1), dy: c11Spl(C14HALF, u, 2), rot: c11Spl(C14HALF, u, 3) }; }
function c14Poly(p) { ctx.beginPath(); ctx.moveTo(p[0][0], p[0][1]); for (let i = 1; i < p.length; i++) ctx.lineTo(p[i][0], p[i][1]); ctx.closePath(); }
function c14Puff(m, t0, x, y, n, w, life, seed) {      // a cloud of dust at a height (c4Dust rolls along the street): n puffs spread over w that rise and thin out
  const a = m - t0; if (a < 0 || a > life) return; const k = a / life;
  for (let i = 0; i < n; i++) { const r1 = c4R(i + seed * 29, 5), r2 = c4R(i + seed * 29, 6), s = Math.round(3 + k * 12 * (0.4 + 0.6 * r2)); ctx.fillStyle = 'rgba(150,140,172,' + (0.36 * (1 - k) * (1 - k)).toFixed(3) + ')'; ctx.fillRect(Math.round(x + (r1 - 0.5) * 2 * w * (0.3 + 0.7 * Math.sqrt(k))), Math.round(y - k * 26 * r2 + (r1 - 0.5) * 10), s, Math.max(2, s - 2)); }
}
function c14Floors() {      // the floors of TI: [{ dy: where it is (from the arena), tp: the moment the pair is down to it, px: where it breaks, broken }], found once from the path
  if (C14W.fl) return C14W.fl; const T = c14T('TI'), a = C14L.breach, b = c9B(45, 0); C14W.fl = [];
  for (let k = 0; k < 7; k++) { const dy = T.top + 60 + 76 * k; let tp = b; for (let t = a; t < b; t += 0.05) if (c11Spl(C11PATH, t, 2) >= dy) { tp = t; break; } C14W.fl.push({ dy, tp, px: c11Spl(C11PATH, tp, 1), broken: tp < b }); }
  return C14W.fl;
}
function c14Rumble(m) {      // the building shakes while it comes down, and the half grinds along the cut (added to the shake of the blows)
  const L = C14L, K = L.cut, b = c9B(45, 0); let a = 0; if (m > L.breach && m < b) a += (1.1 + 0.5 * Math.sin(m * 9)) * Math.min(clamp01((m - L.breach) / 0.5), clamp01((b - m) / 0.6)); if (m > K.t + 0.3 && m < L.breach) a += 0.8 * Math.min(clamp01((m - K.t - 0.3) / 0.5), clamp01((L.breach - m) / 0.4)); return a;
}

// ---- behind the fighters
function c14Rear(m, cam) {
  if (m < C11K.air2 - 3 || m > C11K.kick + 1) return; const O = c14O(), vx0 = cam.fx - VW / (2 * cam.z) - 80, vx1 = cam.fx + VW / (2 * cam.z) + 80, vy0 = cam.fy - VH / (2 * cam.z) - 80, vy1 = cam.fy + VH / (2 * cam.z) + 80, L = C14L, K = L.cut;
  ctx.save(); ctx.imageSmoothingEnabled = false;
  for (let i = -3; i < 16; i++) {      // (a skyline further back: dark slabs with a few lit floors)
    const w = 130 + 50 * c4R(i, 71), x0 = O.x + i * 190 - 200 + 60 * c4R(i, 72), top = O.y + 20 + 330 * c4R(i, 73); if (x0 + w < vx0 || x0 > vx1 || O.y + 720 < vy0 || top > vy1) continue;
    ctx.fillStyle = '#080c26'; ctx.fillRect(x0, top, w, O.y + 720 - top); ctx.fillStyle = '#0d1436'; ctx.fillRect(x0, top, 3, O.y + 720 - top); ctx.fillStyle = 'rgba(255,217,138,0.18)'; for (let k = 0; k < 5; k++) { const fy = top + 20 + 70 * k + 50 * c4R(i * 7 + k, 74); ctx.fillRect(x0 + 10 + 30 * c4R(i * 9 + k, 75), fy, 40 + 40 * c4R(i * 5 + k, 76), 4); }
  }
  if (m >= L.breach + 0.3) c14Interior(m, O, vx0, vx1);
  for (const T of L.T) {
    const x0 = O.x + T.x - T.w / 2, y0 = O.y + T.top, h = L.bottom - T.top; if (x0 + T.w < vx0 || x0 > vx1 || y0 + h < vy0 || y0 > vy1) continue; const img = c14Img(T);
    if (T.id === 'TC' && m >= K.t) {      // (cut in two: the stump stands under the cut; the top half is drawn after the others)
      const u = m - K.t, cx = O.x + K.cx, cy = O.y + K.cy, xl = x0 - 30, xr = x0 + T.w + 30, yl = cy + K.sl * (xl - cx), yr = cy + K.sl * (xr - cx);
      ctx.save(); c14Poly([[xl, yl], [xr, yr], [xr, y0 + h + 10], [xl, y0 + h + 10]]); ctx.clip(); ctx.drawImage(img, x0, y0); ctx.restore();
      if (u < 0.9) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = 1 - u / 0.9; ctx.strokeStyle = u < 0.15 ? '#ffffff' : '#ff6a7a'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(xl, yl); ctx.lineTo(xr, yr); ctx.stroke(); ctx.restore(); }
    } else if (T.id === 'TI' && m >= L.breach + 0.3) { ctx.globalAlpha = Math.max(0.16, 1 - clamp01((m - L.breach - 0.3) / 1.2) * 0.84); ctx.drawImage(img, x0, y0); ctx.globalAlpha = 1; }
    else ctx.drawImage(img, x0, y0);
  }
  c14HalfDraw(m, O, vx0, vx1);
  for (const [id, a, b, t0, t1, dir] of C14PASS) {      // (the tunnels: a dark band cut through the tower, as far as the pair has got)
    if (m < t0) continue; const T = c14T(id), tm = Math.min(m, t1), px = O.x + c11Spl(C11PATH, tm, 1), yy = O.y + c11Spl(C11PATH, (t0 + t1) / 2, 2), xa = O.x + Math.min(a, b), xb = O.x + Math.max(a, b), e = dir > 0 ? Math.min(xb, px) : Math.max(xa, px), q = dir > 0 ? [xa, e] : [e, xb];
    if (q[1] < q[0] || q[1] < vx0 || q[0] > vx1 || !T) continue; ctx.fillStyle = '#03050d'; ctx.fillRect(q[0], yy - 40, q[1] - q[0], 80); ctx.fillStyle = '#2c3d86'; ctx.fillRect(q[0], yy - 41, q[1] - q[0], 2); ctx.fillRect(q[0], yy + 39, q[1] - q[0], 2);
    for (let k = 0; k < 14; k++) { const fx = q[0] + (q[1] - q[0]) * c4R(k + id.length * 9, 77); ctx.fillStyle = k & 1 ? '#7d8ac8' : '#1d2a63'; ctx.fillRect(Math.round(fx), yy - 40 + (k % 3) * 2, 3, 4 + (k % 4)); ctx.fillRect(Math.round(fx + 5), yy + 36 - (k % 3) * 2, 2, 5); }
  }
  for (const [, wx, t, dir, sw] of C14H) {      // (a hole in the glass at each wall: a clean one where he cut his way out, a ragged one where he was smashed through)
    if (m < t) continue; const y = O.y + c11Spl(C11PATH, t, 2), x = O.x + wx, miss = sw && C13Q.res[sw] === 'miss', big = miss ? 56 : 44;
    if (x < vx0 - 60 || x > vx1 + 60) continue; ctx.fillStyle = '#03050d'; ctx.beginPath(); ctx.moveTo(x - 8, y - big / 2); for (let k = 0; k < 7; k++) ctx.lineTo(x + 8 * dir + (miss ? 8 * dir * (c4R(k + wx, 78) - 0.3) : 0), y - big / 2 + k * big / 6 + (miss ? (c4R(k + wx, 79) - 0.5) * 10 : 0)); ctx.lineTo(x - 8, y + big / 2); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = '#9fc4ff'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(x, y - big / 2); ctx.lineTo(x + dir * (miss ? 10 : 14), y + big / 2); ctx.stroke(); if (sw && !miss && m < t + 0.9) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = 1 - (m - t) / 0.9; ctx.strokeStyle = '#ff6a7a'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x - 80 * dir, y - 22); ctx.lineTo(x + 70 * dir, y + 24); ctx.stroke(); ctx.restore(); }
  }
  if (m >= L.breach) { const a = m - L.breach, x = O.x + 1880, y = O.y + 180; ctx.fillStyle = '#03050d'; ctx.beginPath(); ctx.moveTo(x - 60, y - 2); for (let k = 0; k <= 8; k++) ctx.lineTo(x - 60 + k * 15, y + 4 + 26 * c4R(k, 80) * Math.min(1, a / 0.3)); ctx.lineTo(x + 60, y - 2); ctx.closePath(); ctx.fill(); }
  c14Roof(m, O, vx0, vx1); if (m >= c9B(55, 3) - 1) { const mo = L.moon; c8Moon(O.x + mo[0], O.y + mo[1], mo[2]); }
  ctx.restore();
}
function c14HalfDraw(m, O, vx0, vx1) {      // the top half of the tower that was cut: it slides off along the cut, tips and falls on the roof of TI, where it sinks and thins out in the dust
  const L = C14L, K = L.cut, u = m - K.t; if (u < 0 || u > 7) return; const T = c14T('TC'), x0 = O.x + T.x - T.w / 2, y0 = O.y + T.top, cx = O.x + K.cx, cy = O.y + K.cy; if (cx + 500 < vx0 || cx - 300 > vx1) return;
  const xl = x0 - 30, xr = x0 + T.w + 30, yl = cy + K.sl * (xl - cx), yr = cy + K.sl * (xr - cx), q = c14Half(u);
  ctx.save(); if (u > 5.6) ctx.globalAlpha = clamp01(1 - (u - 5.6) / 1.4); ctx.translate(cx + q.dx, cy + q.dy); ctx.rotate(q.rot); ctx.translate(-cx, -cy); c14Poly([[xl, y0 - 10], [xr, y0 - 10], [xr, yr], [xl, yl]]); ctx.clip(); ctx.drawImage(c14Img(T), x0, y0); ctx.restore();
}
function c14Interior(m, O, vx0, vx1) {      // the inside of TI once the half has gone through its roof: pillars, floors with lights under them and desks on them, a floor that breaks where the pair falls through (pieces fall), dust
  const L = C14L, T = c14T('TI'), x0 = O.x + T.x - T.w / 2, y0 = O.y + T.top, y1 = O.y + L.bottom; if (x0 + T.w < vx0 || x0 > vx1) return;
  ctx.save(); ctx.globalAlpha = clamp01((m - L.breach - 0.3) / 0.7); ctx.beginPath(); ctx.rect(x0, y0, T.w, y1 - y0); ctx.clip();
  const gr = ctx.createLinearGradient(0, y0, 0, y1); gr.addColorStop(0, '#0d1436'); gr.addColorStop(1, '#19224f'); ctx.fillStyle = gr; ctx.fillRect(x0, y0, T.w, y1 - y0);
  for (let j = 0; j < 5; j++) { ctx.fillStyle = '#121a44'; ctx.fillRect(x0 + 30 + j * 66, y0, 8, y1 - y0); ctx.fillStyle = '#26347a'; ctx.fillRect(x0 + 30 + j * 66, y0, 1, y1 - y0); }
  c14Floors().forEach((F, k) => {
    const fy = O.y + F.dy, px = O.x + F.px, s = m - F.tp, br = F.broken && s >= 0, ho = br ? 44 : 0;
    for (let i = 0; i < 5; i++) {      // (what stands on the floor: desks with a screen each)
      const dx = x0 + 18 + i * 62 + 14 * c4R(i + k * 5, 82); if (br && Math.abs(dx + 9 - px) < ho + 12) continue; ctx.fillStyle = '#26347a'; ctx.fillRect(dx, fy - 9, 18, 3); ctx.fillStyle = '#16204e'; ctx.fillRect(dx + 1, fy - 6, 2, 6); ctx.fillRect(dx + 15, fy - 6, 2, 6);
      ctx.fillStyle = c4R(i + k * 5, 83) < 0.5 ? '#9fc4ff' : '#ffd98a'; ctx.fillRect(dx + 5, fy - 15, 7, 5); ctx.fillStyle = '#0d1436'; ctx.fillRect(dx + 6, fy - 14, 5, 3);
    }
    ctx.fillStyle = '#3b4f94'; ctx.fillRect(x0, fy, br ? Math.max(0, px - ho - x0) : T.w, 2); ctx.fillRect(px + ho, fy, br ? Math.max(0, x0 + T.w - px - ho) : 0, 2); ctx.fillStyle = '#1e2a66'; ctx.fillRect(x0, fy + 2, br ? Math.max(0, px - ho - x0) : T.w, 7); if (br) ctx.fillRect(px + ho, fy + 2, Math.max(0, x0 + T.w - px - ho), 7);
    for (let i = 0; i < 4; i++) { const lx = x0 + 22 + i * 74 + 18 * c4R(i + k * 4, 84); if (br && Math.abs(lx + 15 - px) < ho + 16) continue; ctx.globalAlpha = 0.55 + 0.45 * Math.sin(m * 13 + i * 3 + k); ctx.fillStyle = '#ffe9a8'; ctx.fillRect(lx, fy + 10, 30, 3); ctx.globalAlpha = 1; }
    if (br && s < 3) for (let i = 0; i < 9; i++) {      // (the pieces of the floor that has broken: they turn and fall)
      const r = c4R(k * 13 + i, 92), vx = (i - 4) * 16 + (c4R(k * 13 + i, 93) - 0.5) * 20, w = 12 + 16 * c4R(k * 13 + i, 94); ctx.save(); ctx.globalAlpha = clamp01(1 - s / 2.6); ctx.translate(px + (i - 4) * 9 + vx * s * 0.5, fy + 4 + 0.5 * 260 * s * s * (0.6 + 0.6 * r)); ctx.rotate((r - 0.5) * 4.4 * s); ctx.fillStyle = i & 1 ? '#2a3a80' : '#1e2a66'; ctx.fillRect(-w / 2, -3, w, 6); ctx.restore();
    }
    if (br) c14Puff(m, F.tp, px, fy, 14, 70, 1.5, k + 3);
  });
  const dg = ctx.createLinearGradient(0, y0, 0, y1); dg.addColorStop(0, 'rgba(140,120,150,0.16)'); dg.addColorStop(1, 'rgba(90,70,110,0.05)'); ctx.fillStyle = dg; ctx.fillRect(x0, y0, T.w, y1 - y0); ctx.restore();
}
function c14Roof(m, O, vx0, vx1) {      // the rooftop of the low building: its edge, a water tower on legs, an antenna with a red light, boxes
  const T = c14T('R'), x0 = O.x + T.x - T.w / 2, y = O.y + C14L.roof; if (x0 + T.w < vx0 || x0 > vx1) return;
  ctx.fillStyle = '#2a3a80'; ctx.fillRect(x0 - 4, y - 2, T.w + 8, 6); ctx.fillStyle = '#16204e'; ctx.fillRect(x0, y + 4, T.w, 10); const cx = O.x + T.x;
  ctx.fillStyle = '#1c2860'; for (const lx of [-34, -22, 22, 34]) ctx.fillRect(cx + lx, y - 34, 3, 32); ctx.fillStyle = '#26347a'; ctx.fillRect(cx - 38, y - 70, 76, 38); ctx.fillStyle = '#34459a'; for (let k = 0; k < 4; k++) ctx.fillRect(cx - 38, y - 68 + k * 10, 76, 2); ctx.fillStyle = '#1c2860'; ctx.fillRect(cx - 40, y - 74, 80, 5); ctx.fillRect(cx - 4, y - 90, 8, 18);
  ctx.fillStyle = '#26347a'; ctx.fillRect(cx - 100, y - 18, 36, 18); ctx.fillRect(cx + 70, y - 24, 30, 24); ctx.fillStyle = '#1c2860'; ctx.fillRect(cx + 108, y - 90, 3, 90); ctx.fillStyle = Math.sin(m * 5) > 0 ? '#ff3347' : '#5a0f1a'; ctx.fillRect(cx + 107, y - 94, 5, 5);
}

// ---- in front of the fighters: the glass that flies, the dust and the pieces of the cut and of the roof, the debris that falls past in the building
function c14Front(m) {
  if (m < C11K.air2 - 1 || m > C11K.kick + 1) return; const O = c14O(), L = C14L, K = L.cut; ctx.save();
  for (const [, wx, t, dir, sw] of C14H) {
    if (m < t || m > t + 1.4) continue; const y = O.y + c11Spl(C11PATH, t, 2), x = O.x + wx, miss = sw && C13Q.res[sw] === 'miss', n = miss ? 36 : 26;
    c4Spray(m, t, x, y, n, { v: 240, up: 1, dir, life: 1.1, cols: ['#cfe8ff', '#9fc4ff', '#ffffff', '#5a78c8'], sz: 1, seed: wx + 3, g: 260, gnd: 1e9 }); c4Spray(m, t, x, y, 12, { v: 150, up: 1, dir, life: 1.2, cols: ['#1c2860', '#26347a', '#0b1233'], sz: 2, seed: wx + 9, g: 300, gnd: 1e9 }); if (miss) c4Spray(m, t, x, y, 10, { v: 120, up: 1, dir: 0, life: 0.9, cols: C4_BLOOD, sz: 1, seed: wx + 5, g: 200, gnd: 1e9 });
    if (m - t < 0.35) { ctx.globalAlpha = 1 - (m - t) / 0.35; ctx.fillStyle = '#ffffff'; ctx.fillRect(x - 3, y - 24, 6, 48); ctx.globalAlpha = 1; }
  }
  const u = m - K.t; if (u >= 0 && u < 2.4) c4Spray(m, K.t, O.x + K.cx, O.y + K.cy, 40, { v: 140, up: 1, dir: 0, life: 2.2, cols: ['#8b93c0', '#5a6296', '#cfd5ee', '#2a3568'], sz: 2, seed: 21, g: 120, gnd: 1e9 });
  for (let i = 0; i < 4; i++) c14Puff(m, K.t + 0.4 + 0.8 * i, O.x + K.cx + 30 + 45 * i, O.y + K.cy + 12 + 14 * i, 10, 40, 1.6, 40 + i);      // (the half grinds along the cut)
  const b = m - L.breach; if (b >= 0 && b < 2.4) c4Spray(m, L.breach, O.x + 1880, O.y + 180, 50, { v: 200, up: 1, dir: 0, life: 2.2, cols: ['#8b93c0', '#5a6296', '#cfd5ee', '#2a3568', '#ffe9a8'], sz: 2, seed: 23, g: 220, gnd: 1e9 }); c14Puff(m, L.breach, O.x + 1880, O.y + 180, 22, 80, 2.2, 60);
  if (m >= L.breach + 0.5 && m < c9B(45, 0)) {      // (debris falls past the pair all the time he is in the building)
    const P = c14P(m), a = clamp01((m - L.breach - 0.5) / 0.6) * clamp01((c9B(45, 0) - m) / 0.6); for (let i = 0; i < 16; i++) { const f = ((c4R(i, 86) * 240 + m * (80 + 70 * c4R(i, 87))) % 240) / 240; ctx.globalAlpha = Math.sin(Math.PI * f) * 0.85 * a; ctx.fillStyle = i % 3 ? '#4a5aa6' : '#8b93c0'; ctx.fillRect(Math.round(P.x + (c4R(i, 88) - 0.5) * 300), Math.round(P.y - 120 + f * 240), 2 + (i & 1), 2 + (i % 3 === 0 ? 2 : 0)); }
  }
  ctx.restore();
}
function c14Events(T, ev) {      // the sounds of the city: glass at every wall, the cut, the roof, each floor that breaks
  const R = c9Start(), L = C14L;
  C14H.forEach(([, , t], i) => ev('c14g' + i, R + t - 0.02, () => snd('c7shatter'), 0.5));
  ev('c14cut', R + L.cut.t + 0.1, () => { snd('c7tear'); snd('c7whoosh'); }, 0.8); ev('c14slide', R + L.cut.t + 1.2, () => snd('c7rise'), 1.0); ev('c14roof', R + L.breach - 0.05, () => { snd('c7smash'); snd('c7shatter'); }, 0.8);
  c14Floors().forEach((F, i) => { if (F.broken) ev('c14f' + i, R + F.tp, () => { snd('c7thud', 0); snd('c7shatter'); }, 0.6); });
}
