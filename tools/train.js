// ---------------------------------------------------------------- v1.55 PART 2: THE TRAINING (this file is spliced into template.html by build_html.py, in place of the marker line before drawScene)
// A happy morning on the track field: Yuji comes to train with Gojo and tries to land a punch, but every blow stops in front of Gojo (INFINITY). Yuji backs away, Gojo switches Infinity off and a real fight begins: you are Yuji (his normal form only: no cursed-energy mode, no ULTIMATE, no FATALITY), Gojo has only his M1, his guard and his dash. When Yuji wins: a happy ending and a card.
const TN_KIT = new Set(['y_crouch', 'y_dash', 'y_block', 'y_cpunch', 'y_sweep', 'y_div', 'y_rush', 'y_heavy', 'y_cancel']);      // the skills Yuji has in the training fight, bought or not (owns() answers from this list while vs.tn)
const TN_TRY = [{ k: 0, d: 1.9 }, { k: 1, d: 1.9 }, { k: 12, d: 2.5 }];      // his three tries: R.HOOK, L.HOOK and RUSH FIST (his own numbers in YU_ATK); d = seconds the step lasts
const TN_UA = 0.45, TN_HOLD = 0.13, TN_RATE = 20;      // a try: 0.45 s to step into range, then the swing; the picture stops for 0.13 s whenever the blow reaches the barrier
const TN_SEQ = [
  { k: 'sun', d: 3.6 }, { k: 'in', d: 3.2 },
  { k: 'say', w: 'GOJO', a: 'GOOD MORNING, YUJI!', b: 'PERFECT DAY FOR TRAINING.' },
  { k: 'say', w: 'YUJI', a: 'MORNING, SENSEI!', b: 'I WILL LAND A PUNCH TODAY!' },
  { k: 'say', w: 'GOJO', a: 'OH? THEN COME AND TRY IT.', b: '' },
  { k: 'try', n: 0 }, { k: 'say', w: 'GOJO', a: 'TOO SLOW, YUJI!', b: '' }, { k: 'try', n: 1 }, { k: 'try', n: 2 }, { k: 'tired', d: 1.8 },
  { k: 'say', w: 'YUJI', a: 'WHY CAN I NOT HIT YOU?!', b: '' },
  { k: 'say', w: 'GOJO', a: 'THAT IS INFINITY, YUJI.', b: 'YOU CANNOT TOUCH ME. HAHA!' },
  { k: 'back', d: 2.0 },
  { k: 'say', w: 'YUJI', a: 'THEN FIGHT ME WITHOUT IT!', b: '' },
  { k: 'say', w: 'GOJO', a: 'FAIR ENOUGH! NO INFINITY.', b: 'ONLY PUNCHES, GUARD, DASH.', off: true },
  { k: 'say', w: 'YUJI', a: 'DEAL! HERE I COME!', b: '' }];
const TNE_SEQ = [
  { k: 'flash', d: 1.4 },
  { k: 'say', w: 'GOJO', a: 'HA HA HA! NICE ONE, YUJI!', b: '' },
  { k: 'say', w: 'YUJI', a: 'I DID IT! I HIT YOU!', b: '' },
  { k: 'say', w: 'GOJO', a: 'YOU SURE DID. YOU ARE', b: 'GETTING STRONGER EACH DAY.' },
  { k: 'say', w: 'GOJO', a: 'NOW LET US GO EAT!', b: '' },
  { k: 'say', w: 'YUJI', a: 'YES! I AM STARVING!', b: '' },
  { k: 'fade', d: 1.8 }];
for (const S of [TN_SEQ, TNE_SEQ]) { let t = 0; for (const s of S) { s.t0 = t; if (s.k === 'try') s.d = TN_TRY[s.n].d; if (!s.d) s.d = Math.max(1.9, ((s.a || '').length + (s.b || '').length) / TN_RATE + 0.9); t += s.d; } S.end = t; }
const TN_CUTS = TN_SEQ.slice(1).map(s => s.t0), TNE_CUTS = TNE_SEQ.slice(1).map(s => s.t0), TN_CARD = TNE_SEQ.end;      // taps jump to the next step; the ending's card comes right after its last step
const TN_COL = { GOJO: '#7fd4ff', YUJI: '#ff9a5a', MASTER: '#b58cff' };
let tnSunK = 1, tnBirdsOn = true;      // how high the sun is (0 = behind the wall, 1 = up), and whether birds cross the sky

// ---- the map: the training field (a red running track, a grass field, a stone wall, pine trees, a morning sky)
function buildTrack() {
  const mk = (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return [c, c.getContext('2d')]; };
  let hs = 41; const rn = () => { hs = (hs * 1103515245 + 12345) & 0x7fffffff; return hs / 0x7fffffff; };
  const wallB = gy - 31, wallT = wallB - 15, fieldB = gy - 12;      // the wall's base and top, and where the track starts
  let g; [alleyBg, g] = mk(VW, VH);
  const sky = ['#6fc1f0', '#86cdf3', '#9fd8f5', '#b9e2f4', '#d3ecee', '#ecf1dc', '#fbf0cc'];
  sky.forEach((c, i) => { g.fillStyle = c; g.fillRect(0, Math.round(i * wallB / sky.length), VW, Math.ceil(wallB / sky.length) + 1); });
  for (const [col, amp, ph, up] of [['#a9d6b0', 7, 0, 22], ['#8fc89b', 5, 2, 13]]) { g.fillStyle = col; g.beginPath(); g.moveTo(0, wallB); for (let x = 0; x <= VW; x += 5) g.lineTo(x, wallB - up - amp * Math.sin(x * 0.021 + ph) - 3 * Math.sin(x * 0.07 + ph)); g.lineTo(VW, wallB); g.closePath(); g.fill(); }      // far hills
  for (let x = Math.round(VW * 0.05), i = 0; x < VW - 24; x += 52 + ((rn() * 30) | 0), i++) {      // far buildings: beige walls, brown roofs, dark arched windows
    const w = 26 + ((rn() * 14) | 0), h = 16 + ((rn() * 12) | 0), y = wallB - 12 - h; g.fillStyle = i % 2 ? '#e5c795' : '#dcb585'; g.fillRect(x, y, w, h + 2); g.fillStyle = '#b8603c'; g.fillRect(x - 2, y - 4, w + 4, 5); g.fillStyle = '#9a4a2c'; g.fillRect(x - 2, y, w + 4, 1);
    g.fillStyle = '#4a3630'; for (let wx2 = x + 4; wx2 < x + w - 4; wx2 += 8) { g.fillRect(wx2, y + 6, 4, 6); g.fillRect(wx2 + 1, y + 5, 2, 1); }
  }
  [alleyProps, g] = mk(STRIP, VH);
  const pine = (x, base, h) => {      // a low-poly pine: three stacked cones, the left face lit, the right face in shade
    g.fillStyle = '#5a3d26'; g.fillRect(x - 1, base - 6, 3, 6);
    for (let i = 0; i < 3; i++) { const w = 15 - i * 3.5, y1 = base - 4 - i * h * 0.27, y0 = y1 - h * 0.42; g.fillStyle = '#4cae55'; g.beginPath(); g.moveTo(x, y0); g.lineTo(x - w, y1); g.lineTo(x, y1); g.closePath(); g.fill(); g.fillStyle = '#2b8043'; g.beginPath(); g.moveTo(x, y0); g.lineTo(x + w, y1); g.lineTo(x, y1); g.closePath(); g.fill(); }
  };
  const round = (x, base, h) => {      // a round tree: a trunk and a flat faceted crown
    g.fillStyle = '#6a4a2c'; g.fillRect(x - 2, base - h * 0.5, 4, h * 0.5); const w = 17, y = base - h * 0.5;
    g.fillStyle = '#58b85a'; g.beginPath(); g.moveTo(x - w, y); g.lineTo(x - w * 0.6, y - h * 0.42); g.lineTo(x, y - h * 0.5); g.lineTo(x, y); g.closePath(); g.fill();
    g.fillStyle = '#3a9a48'; g.beginPath(); g.moveTo(x + w, y); g.lineTo(x + w * 0.6, y - h * 0.42); g.lineTo(x, y - h * 0.5); g.lineTo(x, y); g.closePath(); g.fill();
  };
  for (let i = 0; i < 11; i++) { const x = 16 + i * 43 + ((rn() * 14) | 0), h = 32 + ((rn() * 22) | 0); if (i % 4 === 2) round(x, wallT + 5, h * 0.8); else pine(x, wallT + 5, h); }
  g.fillStyle = '#a4a4ac'; g.fillRect(0, wallT, STRIP, wallB - wallT); g.fillStyle = '#cfcfd5'; g.fillRect(0, wallT, STRIP, 3); g.fillStyle = '#80808a'; g.fillRect(0, wallB - 2, STRIP, 2);      // the stone wall: a lit cap, courses of blocks, a shaded foot
  for (let y = wallT + 3, row = 0; y < wallB - 2; y += 5, row++) { g.fillStyle = '#8d8d96'; g.fillRect(0, y + 4, STRIP, 1); for (let x = (row % 2) * 8; x < STRIP; x += 16) g.fillRect(x, y, 1, 5); }
  g.fillStyle = '#5db04a'; g.fillRect(0, wallB, STRIP, fieldB - wallB);      // the grass field, mown in stripes
  for (let y = wallB, i = 0; y < fieldB; y += 4, i++) { g.fillStyle = i % 2 ? '#67ba52' : '#53a541'; g.fillRect(0, y, STRIP, Math.min(4, fieldB - y)); }
  g.fillStyle = '#3f8a35'; for (let i = 0; i < 70; i++) g.fillRect((rn() * STRIP) | 0, wallB + 1 + ((rn() * (fieldB - wallB - 2)) | 0), 1 + ((rn() * 2) | 0), 1);
  [alleyTile, g] = mk(84, VH - fieldB); const th = g.canvas.height;      // the red running track: a sandy edge, grit, white lane lines
  g.fillStyle = '#e2c585'; g.fillRect(0, 0, 84, 3); g.fillStyle = '#c4452d'; g.fillRect(0, 3, 84, th - 3);
  for (let i = 0; i < 110; i++) { g.fillStyle = rn() < 0.5 ? '#b63b26' : '#d4553a'; g.fillRect((rn() * 84) | 0, 3 + ((rn() * (th - 3)) | 0), 1 + ((rn() * 2) | 0), 1); }
  g.fillStyle = '#f3efe4'; for (const [y, h] of [[4, 2], [17, 1], [31, 2], [47, 2]]) if (y + h < th) g.fillRect(0, y, 84, h);
  g.fillStyle = '#e0dbd0'; for (const y of [10, 24, 39]) if (y + 1 < th) g.fillRect(36, y, 7, 1);
  g.fillStyle = '#d9822b'; for (const [x, y] of [[9, 8], [58, 21], [27, 36], [70, 12]]) if (y < th) g.fillRect(x, y, 2, 1);      // a few fallen leaves
  [tnClouds, g] = mk(STRIP, 50);      // clouds (they drift slowly): puffs of overlapping circles, a pale blue underside
  for (const [x, y, s] of [[70, 12, 1], [230, 26, 0.8], [380, 10, 1.1]]) { for (const [dx, dy, r, c] of [[0, 6, 9, '#dbe8f2'], [14, 7, 8, '#dbe8f2'], [-14, 8, 6, '#dbe8f2'], [0, 0, 10, '#ffffff'], [-12, 3, 7, '#ffffff'], [13, 2, 8, '#ffffff']]) { g.fillStyle = c; g.beginPath(); g.arc(x + dx * s, y + dy * s, r * s, 0, 6.2832); g.fill(); } }
}
let tnClouds = null;
function drawTrack(now) {      // the whole picture of the field: sky, sun (rising in the opening), rays, clouds, trees, wall, grass, track, birds
  buildAlley(); const t = now / 1000, sx = Math.round(VW * 0.78), sy = Math.round(lerp(gy - 16, VH * 0.2, tnSunK));
  ctx.drawImage(alleyBg, 0, 0);
  ctx.save(); ctx.globalCompositeOperation = 'lighter'; const gl = ctx.createRadialGradient(sx, sy, 3, sx, sy, 78); gl.addColorStop(0, 'rgba(255,238,170,0.6)'); gl.addColorStop(1, 'rgba(255,205,120,0)'); ctx.fillStyle = gl; ctx.fillRect(sx - 78, sy - 78, 156, 156);
  for (let i = 0; i < 4; i++) { const a = 2.0 + i * 0.34 + Math.sin(t * 0.4 + i) * 0.03; ctx.fillStyle = 'rgba(255,236,170,' + (0.045 + 0.02 * Math.sin(t * 0.7 + i * 2)).toFixed(3) + ')'; ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(sx + Math.cos(a - 0.07) * 330, sy + Math.sin(a - 0.07) * 330); ctx.lineTo(sx + Math.cos(a + 0.07) * 330, sy + Math.sin(a + 0.07) * 330); ctx.closePath(); ctx.fill(); }
  ctx.restore(); ctx.fillStyle = '#ffc94d'; ctx.beginPath(); ctx.arc(sx, sy, 8.5, 0, 6.2832); ctx.fill(); ctx.fillStyle = '#ffe58a'; ctx.beginPath(); ctx.arc(sx, sy, 7, 0, 6.2832); ctx.fill(); ctx.fillStyle = '#fffbe0'; ctx.beginPath(); ctx.arc(sx, sy, 4.5, 0, 6.2832); ctx.fill();
  if (tnClouds) { const off = Math.round((t * 3) % STRIP); ctx.drawImage(tnClouds, -off, 0); ctx.drawImage(tnClouds, STRIP - off, 0); if (STRIP - off + STRIP < VW) ctx.drawImage(tnClouds, 2 * STRIP - off, 0); }
  layer(alleyProps, 0.55);
  const o = Math.round(((-wx % 84) + 84) % 84); for (let x = o - 84; x < VW; x += 84) ctx.drawImage(alleyTile, x, gy - 12);
  if (tnBirdsOn) { ctx.fillStyle = '#2c3a46'; for (let i = 0; i < 5; i++) { const x = ((t * (14 + i * 3) + i * 97) % (VW + 60)) - 30, y = 16 + i * 7 + Math.sin(t * 1.3 + i) * 3, up = Math.floor(t * 5 + i) % 2; ctx.fillRect(Math.round(x), Math.round(y), 1, 1); ctx.fillRect(Math.round(x) - 1, Math.round(y) + (up ? -1 : 1), 1, 1); ctx.fillRect(Math.round(x) + 1, Math.round(y) + (up ? -1 : 1), 1, 1); ctx.fillRect(Math.round(x) - 2, Math.round(y) + (up ? -2 : 1), 1, 1); ctx.fillRect(Math.round(x) + 2, Math.round(y) + (up ? -2 : 1), 1, 1); } }
}

// ---- pictures: where a picture's edge is, Yuji's picture for a pose, the speech box
const TN_EDGE = new Map();
function tnEdges(img) {      // the outermost opaque columns of a picture (L / R) and the mean height of the opaque pixels near each (ly / ry): found once per picture
  let r = TN_EDGE.get(img); if (r) return r;
  const w = img.width, h = img.height, c = document.createElement('canvas'); c.width = w; c.height = h; const g = c.getContext('2d'); g.drawImage(img, 0, 0); const d = g.getImageData(0, 0, w, h).data;
  const col = x => { for (let y = 0; y < h; y++) if (d[(y * w + x) * 4 + 3] > 40) return true; return false; }, my = x0 => { let s = 0, n = 0; for (let x = Math.max(0, x0 - 1); x <= Math.min(w - 1, x0 + 1); x++) for (let y = 0; y < h; y++) if (d[(y * w + x) * 4 + 3] > 40) { s += y; n++; } return n ? s / n : h / 2; };
  let L = 0, R = w - 1; while (L < w - 1 && !col(L)) L++; while (R > 0 && !col(R)) R--;
  r = { L, R, ly: my(L), ry: my(R) }; TN_EDGE.set(img, r); return r;
}
const tnPick = a => yujiPick(Object.assign({ now: 0, spawnAt: 0, modeAt: 0, idle: true, mode: 'idle' }, a));      // Yuji's picture for a pose (the same function the fight uses for the player)
function tnDlg(name, l1, l2, n) {      // the speech box: at the top (the sky) so that the fighters' feet stay free; n letters are shown so far
  const x = 6, w = VW - 12, h = l2 ? 30 : 20, y = 14, col = TN_COL[name] || '#ffd34d'; ctx.fillStyle = 'rgba(8,6,22,0.88)'; ctx.fillRect(x, y, w, h); ctx.fillStyle = '#9d8cff'; ctx.fillRect(x, y, w, 2); ctx.fillRect(x, y + h - 2, w, 2); ctx.fillRect(x, y, 2, h); ctx.fillRect(x + w - 2, y, 2, h);
  ctx.fillStyle = '#2a2060'; ctx.fillRect(x, y - 10, name.length * 8 + 10, 10); ctx.fillStyle = '#9d8cff'; ctx.fillRect(x, y - 10, name.length * 8 + 10, 2); pxt(name, x + 5, y - 2, col, 8);
  pxt(l1.slice(0, Math.max(0, n)), x + 8, y + 13, '#ffffff', 8); if (l2) pxt(l2.slice(0, Math.max(0, n - l1.length)), x + 8, y + 24, '#ffffff', 8);
}
function tnRipple(x, y, a, big) {      // the blow reaches the barrier: rings run out from the point of contact, a white star flashes, sparks fly back (a = seconds since contact)
  if (a < 0 || a > 0.7) return; const f = 1 - a / 0.7; ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.lineWidth = 1;
  for (let i = 0; i < 3; i++) { ctx.strokeStyle = 'rgba(150,225,255,' + (f * (1 - i * 0.28)).toFixed(3) + ')'; ctx.beginPath(); ctx.arc(x, y, 3 + a * (big ? 74 : 52) + i * 6, 0, 6.2832); ctx.stroke(); }
  if (a < 0.12) { ctx.fillStyle = '#fff'; ctx.fillRect(x - 3, y, 7, 1); ctx.fillRect(x, y - 3, 1, 7); ctx.fillRect(x - 1, y - 1, 3, 3); }
  ctx.fillStyle = 'rgba(200,240,255,' + f.toFixed(2) + ')'; for (let i = 0; i < 8; i++) { const an = Math.PI + (i - 3.5) * 0.4, r = 4 + a * 70 * (0.6 + (i % 3) * 0.25); ctx.fillRect(Math.round(x + Math.cos(an) * r), Math.round(y + Math.sin(an) * r), 1, 1); }
  ctx.restore();
}

// ---- the geometry of Yuji's tries: where he must stand so that the tip of his fist reaches the barrier (5 pixels in front of Gojo) at the moment of contact
const tnGX = () => Math.max(44, Math.min(90, (VW >> 1) - 84));      // Gojo's place in the world: where the fight puts him (Yuji is at 0 when it starts)
function tnGeo(n) {
  const k = TN_TRY[n].k, fps = YU_ATK.fps[k], imps = YU_ATK.imp[k], sw = YU_ATK.swing[k][0], p = tnPick({ atkOn: true, atkK: k, af: imps[0] }), e = tnEdges(p.set[imps[0]]), hx = p.info.cx - p.info.x0, ge = tnEdges(idleF[0]), ghx = D.idle.cx - D.idle.x0;
  const front = tnGX() + ghx - ge.R, tip = -hx + e.R, slide = k === 12 ? 24 : 0;      // front: where Gojo's body begins on his left; tip: where the fist ends (from Yuji's place); RUSH FIST slides him 24 px at the enemy
  return { k, fps, imps, sw, yA: front - 5 - tip, slide, tipY: gy - 60 - p.info.top - p.lift + e.ry, tip };
}
function tnFrameAt(e, fps, imps) {      // the swing's picture e seconds after it started; the picture stops for TN_HOLD at every impact frame
  let shift = 0; for (const ip of imps) { const t = ip / fps + shift; if (e < t) break; if (e < t + TN_HOLD) return ip; shift += TN_HOLD; } return Math.max(0, (e - shift) * fps);
}
let tnHitsC = null, tnHitsK = '';
function tnHits() {      // the moments the blows reach the barrier: [{ t, n, big, first }] (scene time; worked out once for each screen size)
  const key = VW + 'x' + gy; if (tnHitsC && tnHitsK === key) return tnHitsC; const out = []; for (const s of TN_SEQ) if (s.k === 'try') { const G = tnGeo(s.n); G.imps.forEach((ip, i) => out.push({ t: s.t0 + TN_UA + ip / G.fps + i * TN_HOLD, n: s.n, big: s.n === 2, first: s.n === 0 })); } tnHitsC = out; tnHitsK = key; return out;
}
function tnYuX(T) {      // where Yuji is (world x) and what he does at scene time T: { x, mode: 'idle' | 'fwd' | 'back' | 'atk' | 'none', k, af, m0 }
  const GX = tnGX(), YS = GX - 70, cam = GX - 40, start = cam - (VW >> 1) - 50; let x = start;
  for (const s of TN_SEQ) {
    const u = T - s.t0, last = u >= s.d;
    if (s.k === 'in') { if (u < 0) return { x, mode: 'none' }; if (!last) return { x: lerp(x, YS, u / s.d), mode: 'fwd', m0: s.t0 }; x = YS; }
    else if (s.k === 'try') {
      const G = tnGeo(s.n), x0 = G.yA - G.slide, ea = u - TN_UA; if (u < 0) return { x, mode: 'idle' };
      if (u < TN_UA) { const q = ease3(u / TN_UA); return { x: lerp(x, x0, q), mode: x0 > x ? 'fwd' : x0 < x ? 'back' : 'idle', m0: s.t0 }; }
      const f = tnFrameAt(ea, G.fps, G.imps), movedF = Math.min(f, G.imps[0]); if (f < 15) return { x: x0 + G.slide * clamp01(movedF / G.imps[0]), mode: 'atk', k: G.k, af: Math.min(14, Math.floor(f)) };
      if (!last) return { x: G.yA, mode: 'idle' }; x = G.yA;
    }
    else if (s.k === 'back') { if (u < 0) return { x, mode: 'idle' }; if (!last) return { x: lerp(x, 0, ease3(u / s.d)), mode: 'back', m0: s.t0 }; x = 0; }
    else if (u < 0) return { x, mode: s.k === 'sun' ? 'none' : 'idle' };
  }
  return { x, mode: 'idle' };
}

// ---- the opening (and, with the same code, the ending): one frame
function tnScene(now, dt, end) {
  const S = end ? TNE_SEQ : TN_SEQ, T = story.T = Math.max(0, now - story.t0) / 1000, GX = tnGX(), step = S.find(s => T >= s.t0 && T < s.t0 + s.d) || S[S.length - 1], i = S.indexOf(step), t1 = T - step.t0;
  let cam = GX - 40; if (end) cam = 0; else { const bk = TN_SEQ.find(s => s.k === 'back'); if (T >= bk.t0) cam = lerp(GX - 40, 0, ease3((T - bk.t0) / bk.d)); }
  wx = cam; tnSunK = end ? 1 : ease3(T / 3.4);
  const hits = end ? [] : tnHits(), shk = hits.reduce((m, h) => Math.max(m, T >= h.t && T < h.t + 0.14 ? (1 - (T - h.t) / 0.14) * (h.big ? 2.2 : 1.4) : 0), 0);
  ctx.save(); ctx.imageSmoothingEnabled = false; ctx.fillStyle = '#000'; ctx.fillRect(0, 0, VW, VH); if (shk) ctx.translate(Math.round((Math.random() * 2 - 1) * shk), Math.round((Math.random() * 2 - 1) * shk));
  drawTrack(now);
  const scr = x => Math.round(VW / 2 + x - cam), off = !end && T >= TN_SEQ.find(s => s.off).t0 + 1.0;      // off: Infinity has been switched off
  // sounds: birds now and then, the swing and the contact of each blow, the footsteps, the dispelling of Infinity
  const ev = (k, tt, f, win) => { if (T >= tt && T < tt + (win || 0.4)) once2(k, f); };
  if (Math.floor(T / 2.6) !== story.tn.bk) { story.tn.bk = Math.floor(T / 2.6); if (T > 0.5) snd('tbirds'); }
  // Gojo: idle, leans back a little at every blow, speaks with his mouth
  let lean = 0; for (const h of hits) { const a = (T - h.t) / 0.45; if (a >= 0 && a < 1) lean = Math.max(lean, Math.sin(a * Math.PI) * (h.big ? 4 : 2.6)); }
  const gTalk = step.k === 'say' && step.w === 'GOJO' && t1 * TN_RATE < (step.a + step.b).length + 3, gx = scr(GX + lean), laugh = end && gTalk ? Math.round(Math.abs(Math.sin(T * 13)) * 1.5) : 0;
  if (!end && !off) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.strokeStyle = 'rgba(150,225,255,' + (0.1 + 0.05 * Math.sin(T * 3)).toFixed(3) + ')'; ctx.lineWidth = 1; ctx.beginPath(); ctx.ellipse(scr(GX + 2), gy - 33, 27, 40, 0, 0, 6.2832); ctx.stroke(); ctx.restore(); }
  shadow(gx, 9); sprAt(idleF[Math.floor(T * IDLE_FPS) % idleF.length], D.idle, gx, laugh, true, gTalk ? 1 + (Math.floor(T * 11) % 2) : 0);
  // Yuji
  const Y = end ? { x: 0, mode: 'idle' } : tnYuX(T);
  if (Y.mode !== 'none') {
    const yx = scr(Y.x), nowMs = T * 1000; let p;
    if (Y.mode === 'atk') p = tnPick({ atkOn: true, atkK: Y.k, af: Y.af }); else if (Y.mode === 'fwd' || Y.mode === 'back') p = tnPick({ idle: false, mode: Y.mode, now: nowMs, modeAt: Y.m0 * 1000 }); else p = tnPick({ now: nowMs * (step.k === 'tired' ? 2 : 1) });
    const br = step.k === 'tired' ? Math.round(Math.abs(Math.sin(T * 9)) * 1.4) : 0;
    shadow(yx, 9); sprAt(p.set[p.fi], p.info, yx, p.lift + br, false, 0);
    if (Y.mode === 'fwd' || Y.mode === 'back') { const st = Math.floor((T - Y.m0) / 0.42); if (st !== story.tn.fs) { story.tn.fs = st; snd('step'); } }
  }
  // Infinity: the barrier's shimmer, the rings of every blow, the word INFINITY at the first, the moment Gojo switches it off
  for (const h of hits) { const a = T - h.t; if (a >= 0 && a < 0.7) { const G = tnGeo(h.n); tnRipple(scr(tnYuX(h.t).x + G.tip), Math.round(G.tipY), a, h.big); if (h.first && a > 0.1 && a < 1.5) { ctx.globalAlpha = clamp01(Math.min((a - 0.1) / 0.25, (1.5 - a) / 0.4)); pxt('INFINITY', scr(tnYuX(h.t).x + G.tip) + 6, Math.round(G.tipY) - 18, '#8fe0ff', 8, 'center'); ctx.globalAlpha = 1; } } }
  hits.forEach((h, j) => { if (T >= h.t && T < h.t + 0.3) once2('hit' + j, () => { snd('tink', h.big ? 1 : 0); snd('f:hit', 0); }); });
  if (!end) { const sws = TN_SEQ.filter(s => s.k === 'try'); sws.forEach(s => { const G = tnGeo(s.n); ev('sw' + s.n, s.t0 + TN_UA + G.sw / G.fps, () => snd('f:swing', ySwingK(G.k)), 0.3); }); const od = TN_SEQ.find(s => s.off).t0 + 1.0; ev('dispel', od, () => snd('tinkoff'), 0.4); if (T >= od && T < od + 0.7) { const a = (T - od) / 0.7; ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.strokeStyle = 'rgba(180,235,255,' + (1 - a).toFixed(3) + ')'; ctx.lineWidth = 2; ctx.beginPath(); ctx.ellipse(scr(GX + 2), gy - 33, 27 + a * 40, 40 + a * 30, 0, 0, 6.2832); ctx.stroke(); ctx.restore(); } }
  if (end) { ctx.fillStyle = 'rgba(255,170,190,0.9)'; for (let q = 0; q < 14; q++) { const x = (q * 53 + T * (8 + q % 3 * 3)) % (VW + 20) - 10, y = ((q * 37 + T * (14 + q % 4 * 4)) % (VH + 10)) - 5; ctx.fillRect(Math.round(x), Math.round(y), 2, 1); ctx.fillRect(Math.round(x) + 1, Math.round(y) + 1, 1, 1); } }      // petals fall in the ending
  // the title, the speech, the tiredness
  if (!end && T > 0.7 && T < 3.7) { const a = clamp01(Math.min((T - 0.7) / 0.6, (3.7 - T) / 0.6)); ctx.globalAlpha = a; pxt('A HAPPY MORNING', VW / 2, Math.round(VH * 0.3) + 8, '#ffe9a0', 16, 'center'); ctx.globalAlpha = 1; }
  if (!end && step.k === 'tired') { const al = clamp01(Math.min(t1 / 0.3, (step.d - t1) / 0.3)); ctx.globalAlpha = al; pxt('HAH... HAH...', scr(tnYuX(T).x), gy - 70, '#ffffff', 8, 'center'); ctx.globalAlpha = 1; }
  if (step.k === 'say') { const n = Math.floor(t1 * TN_RATE), sp = step.a + step.b; if (story.tn.vi !== i) { story.tn.vi = i; story.tn.vc = 0; } while (story.tn.vc < Math.min(n, sp.length)) { story.tn.vc++; if (sp[story.tn.vc - 1] !== ' ') snd('tvoice', step.w === 'GOJO' ? 0 : 1); } tnDlg(step.w, step.a, step.b, n); }
  // the light of the morning, the fade in from the sun (and the fade out at the end)
  ctx.fillStyle = 'rgba(255,214,140,0.05)'; ctx.fillRect(0, 0, VW, VH);
  const fi = end ? 1 - clamp01(T / 1.2) : 1 - clamp01(T / 0.9); if (fi > 0) { ctx.fillStyle = 'rgba(255,246,214,' + fi.toFixed(3) + ')'; ctx.fillRect(0, 0, VW, VH); }
  if (end && step.k === 'fade') { ctx.fillStyle = 'rgba(255,246,214,' + clamp01(t1 / step.d).toFixed(3) + ')'; ctx.fillRect(0, 0, VW, VH); }
  ctx.restore();
}

// ---- the chapter: start, frame, taps, the fight, the ending
function startTraining(slot) {
  audio(); show('story'); story = { slot, t0: pnow(), battle: false, T: 0, ev: {}, tn: { end: false, bk: -1, fs: -1, vc: 0, vi: -1 } }; alley = true; court = false; track = true; wx = 0; tnSunK = 0; snd('tmusic', 0);
}
function trainFrame(now, dt) {
  if (story.tn.rest) { restFrame(now, dt); return; }      // (the restaurant: the last scene of part 2)
  if (story.tn.end) { trainEnd(now, dt); return; }
  tnScene(now, dt, false); const T = story.T; if (T >= 14.3) once2('mus2', () => snd('tmusic', 0)); if (T >= 28.6) once2('mus3', () => snd('tmusic', 0));
  if (T >= TN_SEQ.end && !story.battle) startTrainBattle();
}
function startTrainBattle() { story.battle = true; track = true; alley = true; court = false; startMatch(2, true, 0, 'gojo'); }      // (a story fight against Gojo = the training: you are Yuji, see startMatch)
function startTrainEnd(now) {      // Yuji has won: the happy ending
  show('story'); story.tn = { end: true, bk: -1, fs: -1, vc: 0, vi: -1 }; story.battle = false; story.t0 = now; story.T = 0; story.ev = {}; alley = true; court = false; track = true; wx = 0; snd('tmusic', 1);
}
function trainEnd(now, dt) {      // the happy ending of the training; when it has faded to cream the restaurant (rest.js) follows
  if (Math.max(0, now - story.t0) / 1000 < TNE_SEQ.end) { tnScene(now, dt, true); return; }
  startRest(now);
}
function trainSkip() {      // a tap: on to the next step (in the opening the last cut is the fight itself, in the ending it is the restaurant)
  if (story.tn.rest) { restSkip(); return; }
  const end = story.tn.end, T = story.T, n = (end ? TNE_CUTS : TN_CUTS).concat(end ? [TNE_SEQ.end] : [TN_SEQ.end]).find(c => c > T + 0.05); if (n !== undefined) story.t0 = pnow() - n * 1000;
}
function storyDone3() { if (!story) return; const a = loadSaves(); if (a[story.slot]) a[story.slot].tn = true; storeSaves(a); }
function storyDone4() { if (!story) return; const a = loadSaves(); if (a[story.slot]) a[story.slot].c2 = true; storeSaves(a); }      // (part 2 is finished: its last scene has reached the card)
