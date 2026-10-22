// ---------------------------------------------------------------- v1.62 THE CONTINUATION OF THE RESTAURANT: the end of chapter 1, THE MYSTERY (this file is spliced into template.html by build_html.py, in place of the marker line after the restaurant's)
// Gojo has hit the wall; the room goes SILENT. Yuji's hair is torn back by the wind of the portal; he screams SENSEI NO! and charges the Master; Gojo, bleeding, holds him with BLUE (Yuji runs with all his strength and gets nowhere); the Master walks towards Yuji; Gojo BLINKS between them and sends Yuji back to Jujutsu High with BLUE (SENSEI STO- is cut off); Gojo and the Master talk (what this is, what is happening, why: the Master wants the end of mankind, because it is killing the earth); the Master's blow stops at Gojo's INFINITY, the screen shakes, he breaks through, takes Gojo by the neck and walks back into the portal with him. END OF CHAPTER 1.
// Every actor is a pure function of the scene time T, so a tap that jumps to the next step (or a test that jumps in time) always draws the right picture.

// ---- where everybody is (worked out once for each screen size, from the real pictures)
function rsReach() {      // how far the Master's claw reaches in front of his middle when his arm is stretched out (his real picture fredA 0 12)
  if (rsReach.v) return rsReach.v; if (!FRED_IMG.complete) return 26;
  const B = rsFred(fredA(0, 12)).B, w = B.width, h = B.height, d = B.getContext('2d').getImageData(0, 0, w, h).data; let xr = 0;
  for (let y = 0; y < h; y++) for (let x = w - 1; x > xr; x--) if (d[(y * w + x) * 4 + 3] > 100) { xr = x; break; }
  return rsReach.v = xr > RS_FC ? xr + 1 - RS_FC : 26;
}
function rsCL() {
  const L = rsLay(), U = L.U, key = VW + 'x' + VH + 'x' + gy + 'x' + FRED_IMG.complete; if (rsCL.key === key) return rsCL.v; rsCL.key = key;
  const yx0 = L.YX + Math.round(7 * U), fm = L.FX, yx1 = yx0 + Math.round(Math.min(24, 0.4 * (fm - yx0))), yx2 = yx1 - 34, xg = yx2 + 36, rch = rsReach(), xm0 = Math.min(xg + 18 + rch, fm - 12);
  return rsCL.v = { L, U, yx0, yx1, yx2, fm, xg, xm0, rch, bx: xm0 - rch, gw: L.wall + 12, gs: L.wall + 42, back: L.back };      // Yuji starts at yx0 (the back row), charges to yx1, is held and dragged back to yx2; the Master stands at fm and walks to xm0; Gojo lies at the wall at gw, gets up at gs and blinks to xg (36 px in front of Yuji, 18 + the claw's reach in front of the Master); bx = where the claw touches INFINITY
}
const rsCT = k => rsT(k), rsTi = id => RS_SEQ.find(s => s.id === id).t0;
function rsMX(C, T) { const a = rsCT('ystop'), b = rsCT('tele') + 1.0; return Math.round(lerp(C.fm, C.xm0, ease3(clamp01((T - a) / (b - a))))); }      // where the Master stands: he starts to walk when Yuji stops and reaches Gojo 1 s into the teleport
function rsYX(C, T) { const a = rsCT('ycharge'), b = rsCT('bstop'); return T < a ? C.yx0 : T < b ? rsYChargeX(T - a) : Math.round(C.yx1 - (C.yx1 - C.yx2) * Math.pow(clamp01((T - b) / 4.2), 1.5)); }      // where Yuji stands: the charge, then BLUE drags him back

// ---- the room after the blow (the same room as the wide shot's, everything broken, the three diners gone, the two at the back frozen with fear)
function rsRoom2(now, T, portal) {
  const L = rsLay(), U = L.U, cold = 0.5;
  ctx.drawImage(rsBg(), 0, 0); rsLights(T, cold);
  { const bx = [Math.round(VW * 0.635), Math.round(VW * 0.765)], bl = L.back; rsTable((bx[0] + bx[1]) / 2, bx[1] - bx[0] - 13, bl); rsBowl(bx[0] + 12, bl, T, false); rsBowl(bx[1] - 12, bl, T, false); for (let i = 0; i < 2; i++) { rsStool(bx[i], bl); rsPerson(HUM[3 + i].walk[0], null, bx[i] + Math.round(Math.sin(T * 38 + i * 2) * 0.6), bl, i === 1, 0, 0, 1); } }
  rsPortal(L.PX, portal == null ? 1 : portal, T);
  if (portal == null || portal > 0.3) { ctx.save(); ctx.fillStyle = 'rgba(40,12,70,0.35)'; for (let i = 0; i < 10; i++) { const ph = (T * 0.3 + i * 0.1) % 1, fx = L.PX - ph * 120 * U, fy = gy + 6 + ((i * 7) % 12); ctx.globalAlpha = 0.55 * (1 - ph); ctx.beginPath(); ctx.ellipse(fx, fy, 14 * U * (0.4 + ph), 2.5 * U, 0, 0, 6.2832); ctx.fill(); } ctx.restore(); }
  for (let i = 0; i < 2; i++) rsTable(L.tbl[i].x, L.tbl[i].w, 0, true);
  L.npc.forEach(n => rsStool(n.x, 0)); rsTable(L.tx, L.GX - L.YX - 13, 0, true); rsStool(L.YX, 0); rsStool(L.GX, 0);
  rsWallFx(T, 4); drawBlood(now); drawGibs(now);
}
function rsCold() { ctx.fillStyle = 'rgba(24,8,44,0.4)'; ctx.fillRect(0, 0, VW, VH); }      // the room is cold and dark

// ---- the wind of the portal: scraps of paper, dust and sparks torn to the left (k = how strong)
function rsWindBits(T, k, x0, x1) {
  ctx.save(); const n = Math.round(46 * k); for (let i = 0; i < n; i++) { const h = Math.imul(i + 7, 2654435761) >>> 0, sp = 70 + (h % 120), w = x1 - x0 + 40, x = x1 + 20 - ((T * sp + (h >> 8) % w) % w), y = 10 + ((h >> 4) % Math.max(1, gy)) + Math.sin(T * (2 + (h % 5)) + i) * 3, len = 2 + (h >> 12) % 5 * k; ctx.globalAlpha = 0.25 + 0.4 * ((h >> 16) % 3) / 3; ctx.fillStyle = (h >> 20) % 5 === 0 ? '#ffb070' : (h >> 20) % 3 === 0 ? '#f4ecd8' : '#b8a888'; ctx.fillRect(Math.round(x), Math.round(y), Math.max(1, Math.round(len)), 1); } ctx.restore();
}

// ---- the camera: it never shows anything outside the room (z = the zoom, (fx, fy) = the point of the room that is put on the screen point (sx, sy))
function rsCamOn(z, fx, fy, sx, sy) {
  sx = sx == null ? VW / 2 : sx; sy = sy == null ? VH / 2 : sy; fx = Math.max(sx / z, Math.min(VW - (VW - sx) / z, fx)); fy = Math.max(sy / z, Math.min(VH - (VH - sy) / z, fy));
  ctx.save(); ctx.translate(Math.round(sx), Math.round(sy)); ctx.scale(z, z); ctx.translate(-fx, -fy);
}
function rsCamOff() { ctx.restore(); }

// ---- Yuji's hair in the wind: his picture in two layers (the hair, the rest); the hair rows are torn to the left and smeared, the face and the body stay
const rsHLC = new Map();
function rsHairLayers(src) {
  let r = rsHLC.get(src); if (r) return r;
  const w = src.width, h = src.height, mk = () => { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; }, base = mk(), hair = mk(), d = src.getContext('2d').getImageData(0, 0, w, h).data, bi = base.getContext('2d').createImageData(w, h), hi = hair.getContext('2d').createImageData(w, h);
  let top = -1; for (let y = 0; y < h && top < 0; y++) for (let x = 0; x < w; x++) if (d[(y * w + x) * 4 + 3] > 40) { top = y; break; }
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { const i = (y * w + x) * 4; if (d[i + 3] < 40) continue; const R = d[i], G = d[i + 1], B = d[i + 2], skin = G > B + 10 && R > 190, pink = R > 120 && R - G >= 28 && G <= B + 8, isHair = y < top + 11 ? !skin : pink; (isHair ? hi : bi).data.set([R, G, B, d[i + 3]], i); }
  base.getContext('2d').putImageData(bi, 0, 0); hair.getContext('2d').putImageData(hi, 0, 0); r = { base, hair, top }; rsHLC.set(src, r); return r;
}
function rsWindAt(src, ox, oy, Z, t, k, x0, y0, x1, y1) {      // draws the part (x0, y0)-(x1, y1) of his picture with its corner at (ox, oy), enlarged Z times; k = the strength of the wind (0 = none)
  const L = rsHairLayers(src), W = x1 - x0; ctx.drawImage(L.base, x0, y0, W, y1 - y0, ox, oy, W * Z, (y1 - y0) * Z);
  for (let row = y0; row < y1; row++) {
    const kk = clamp01((L.top + 12 - row) / 12), dy = oy + (row - y0) * Z; let dr = 0;
    if (kk > 0 && k > 0) { const fl = Math.sin(t * 11 + row * 0.55); dr = Math.round(-(kk * (3.5 + 2.8 * fl) + kk * kk * 2.5) * k * Z); if (kk > 0.3 && k > 0.5) for (const [m, a] of [[2.6, 0.4], [5.2, 0.22]]) { ctx.globalAlpha = a; ctx.drawImage(L.hair, x0, row, W, 1, ox + dr - Math.round(m * k * Z * kk), dy, W * Z, Z); } ctx.globalAlpha = 1; }
    ctx.drawImage(L.hair, x0, row, W, 1, ox + dr, dy, W * Z, Z);
  }
}
function rsYuji(x, lane, mode, T, o) {      // Yuji in the wide shot: mode 'idle' (breathing), 'dash' (his real dash pictures, o.f = the frame or o.fps), 'pant' (breathing hard); o.wind = the strength of the wind in his hair
  o = o || {}; const ms = T * 1000, p = mode === 'dash' ? yujiPick({ now: ms, spawnAt: 0, modeAt: 0, dodging: true, dgK: 0, df: Math.floor((o.f != null ? o.f : T * (o.fps || 30)) % 15), dgCr: false }) : tnPick({ now: ms }), src = p.set[p.fi], hx = p.info.cx - p.info.x0, bob = mode === 'pant' ? Math.round(Math.sin(T * 17) * 0.7 + 0.5) : 0;
  ctx.save(); ctx.translate(0, lane); if (o.alpha != null) ctx.globalAlpha = o.alpha; shadow(x, 9);
  if (o.wind > 0) rsWindAt(src, Math.round(x) - hx, gy - 60 - (p.info.top || 0) - p.lift + bob, 1, T, o.wind, 0, 0, src.width, src.height); else sprAt(src, p.info, x, p.lift - bob, false, 0);
  ctx.restore(); return p;
}
function rsYujiHead(cx, cy, Z, t, k, scream) {      // Yuji's head and shoulders in a close-up: the face point (22, 18) of his picture is on (cx, cy); scream = 0 mouth shut, 1 wide open, 2 teeth clenched
  const p = tnPick({ now: 0 }), src = p.set[p.fi], X0 = 12, Y0 = 3, X1 = 31, Y1 = 34, ox = Math.round(cx - (22 - X0) * Z), oy = Math.round(cy - (18 - Y0) * Z);
  rsWindAt(src, ox, oy, Z, t, k, X0, Y0, X1, Y1);
  const P = (x, y, w, h, c) => { ctx.fillStyle = c; ctx.fillRect(ox + (x - X0) * Z, oy + (y - Y0) * Z, w * Z, h * Z); };
  if (scream === 1) { P(20, 19, 6, 5, '#14091a'); P(21, 20, 5, 4, '#4a0c1c'); P(21, 19, 5, 1, '#f4f0ec'); P(22, 22, 3, 1, '#d8506a'); P(20, 15, 5, 1, '#14091a'); P(25, 16, 1, 1, '#14091a'); }      // the open mouth with its teeth and tongue, a hard brow
  else if (scream === 2) { P(20, 20, 6, 3, '#14091a'); P(21, 20, 5, 1, '#f4f0ec'); P(21, 22, 5, 1, '#e8e2dc'); P(20, 15, 5, 1, '#14091a'); P(25, 16, 1, 1, '#14091a'); }      // the teeth clenched, the same brow
}

// ---- Gojo, hurt: his pictures with blood on them (bloody() keeps a copy of each)
function rsGojoRot(src, info, px, py, ang, row, flip, alpha) {      // a picture of Gojo turned by ang about its row `row` (30 = his hip, 60 = his feet, 19 = his neck), which is put on (px, py); flip = he faces left
  const hx = info.cx - info.x0; ctx.save(); ctx.translate(Math.round(px), Math.round(py)); ctx.rotate(ang); if (flip) ctx.scale(-1, 1); if (alpha != null) ctx.globalAlpha = alpha; ctx.drawImage(src, -hx, -row - (info.top || 0)); ctx.restore();
}
function rsGojoLie(C, ang, dx, dy) {      // on the floor at the wall (his idle picture, bloody, turned onto its back), as the blow left him
  rsGojoRot(bloody(idleF[0]), D.idle, C.gw + (dx || 0), gy - 16 + (dy || 0), ang == null ? -1.5 : ang, 30);
}
function rsDrip(x, y, T, n, ph) {      // blood dripping from (x, y): n drops that fall one after another
  ctx.save(); ctx.fillStyle = '#a3141c'; for (let i = 0; i < n; i++) { const q = (T * 0.8 + i * 0.37 + (ph || 0)) % 1; ctx.globalAlpha = 1 - q * 0.5; ctx.fillRect(Math.round(x + (i % 3 - 1) * 2), Math.round(y + q * q * 28), 1, 2); } ctx.restore();
}
function rsGojoStand(x, T, o) {      // Gojo, hurt, on his feet at x: his bloody picture leaning forward about his feet (o.lean), breathing, bleeding; o.alpha
  o = o || {}; const f = bloody(idleF[Math.floor(T * IDLE_FPS) % idleF.length]), lean = o.lean == null ? 0.1 + 0.012 * Math.sin(T * 2.1) : o.lean;
  ctx.fillStyle = 'rgba(110,8,14,' + (o.alpha == null ? 0.85 : 0.85 * o.alpha).toFixed(2) + ')'; ctx.beginPath(); ctx.ellipse(x + 2, gy + 5, 9, 2, 0, 0, 6.2832); ctx.fill();      // the pool at his feet
  shadow(x, 9); rsGojoRot(f, D.idle, x, gy + Math.round(Math.sin(T * 3.1) * 0.5 + 0.5), lean, 60, false, o.alpha); rsDrip(x + 7, gy - 24, T, 3, x * 0.01);
}
function rsWindLines(T, k) {      // long thin lines torn across a close-up to the left by the wind
  ctx.save(); for (let i = 0; i < 16; i++) { const h = Math.imul(i + 3, 2654435761) >>> 0, sp = 380 + (h % 360), len = 24 + (h >> 8) % 60, y = 8 + (h >> 4) % (VH - 16), x = VW + 80 - ((T * sp + (h >> 12) % (VW + 160)) % (VW + 160)); ctx.globalAlpha = (0.12 + 0.22 * ((h >> 18) % 4) / 4) * k; ctx.fillStyle = '#e8e0ff'; ctx.fillRect(Math.round(x), y, len, 1); } ctx.restore();
}
function rsMaster(C, T, eye, o) {      // the Master in the wide shot (standing, or walking while he is on his way to Gojo) with his aura; returns his x
  const mx = rsMX(C, T), walking = T > rsCT('ystop') + 0.05 && T < rsCT('tele') + 0.98;
  shadow(mx, 9); rsAura(mx, T, 1, 60); rsFredDraw(mx, T, Object.assign({ mode: walking ? 'walk' : 'idle', d: C.fm - mx, eye: eye == null ? 1 : eye }, o)); return mx;
}

// ---- BLUE
function rsBlue(x, y, r, T, k) {      // the glow of the game's orb (blueOrb), a hot white core, two tilted rings of light and sparks drawn in towards it (k = how strongly it pulls)
  if (r <= 0.3) return; blueOrb(x, y, r); ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = 'rgba(225,246,255,0.95)'; ctx.beginPath(); ctx.arc(x, y, Math.max(1, r * 0.38), 0, 6.2832); ctx.fill();
  ctx.strokeStyle = 'rgba(150,215,255,0.7)'; ctx.lineWidth = 1; for (let i = 0; i < 2; i++) { ctx.beginPath(); ctx.ellipse(x, y, r * 1.25, r * 0.42, T * 5 * (i ? -1 : 1) + i * 1.4, 0, 6.2832); ctx.stroke(); }
  for (let i = 0, n = Math.round(14 * k); i < n; i++) { const h = Math.imul(i + 3, 2654435761) >>> 0, ph = (T * (0.9 + (h % 5) * 0.2) + (h >> 8) % 100 / 100) % 1, a = (h >> 4) % 628 / 100, d = (1 - ph) * (r * 3.2 + (h % 9) * 3); ctx.fillStyle = 'rgba(170,225,255,' + (0.8 * (1 - ph)).toFixed(2) + ')'; ctx.fillRect(Math.round(x + Math.cos(a) * d), Math.round(y + Math.sin(a) * d * 0.8), 1, 1); }
  ctx.restore();
}
function rsPullFx(T, ox, oy, x1, k) {      // BLUE's pull: bits of dust and light stream from the right to the orb at (ox, oy), faster as they come close
  ctx.save(); ctx.globalCompositeOperation = 'lighter'; for (let i = 0; i < 34; i++) { const h = Math.imul(i + 11, 2654435761) >>> 0, ph = (T * (0.55 + (h % 7) * 0.08) + (h >> 8) % 100 / 100) % 1, q = ph * ph, x = lerp(x1 + 30 + (h % 40), ox, q), y = lerp(oy + ((h >> 4) % 60) - 22, oy, q), len = 2 + q * 14; ctx.globalAlpha = k * (0.15 + 0.6 * q); ctx.fillStyle = (h >> 12) % 3 ? '#9fd8ff' : '#ffffff'; ctx.fillRect(Math.round(x), Math.round(y), Math.max(1, Math.round(len)), 1); } ctx.restore();
}
function rsSparks(x, y, a, n, dir, seed) {      // sparks thrown from (x, y) in a fan round the direction dir; a = seconds since the blow
  if (a < 0 || a > 0.9) return; ctx.save(); ctx.globalCompositeOperation = 'lighter'; for (let i = 0; i < n; i++) { const h = Math.imul(i + (seed || 1), 2654435761) >>> 0, an = dir + ((h % 100) / 100 - 0.5) * 2.2, sp = 50 + (h >> 8) % 150; ctx.fillStyle = (h >> 16) % 3 ? '#aae1ff' : '#ffffff'; ctx.globalAlpha = 1 - a / 0.9; ctx.fillRect(Math.round(x + Math.cos(an) * sp * a), Math.round(y + Math.sin(an) * sp * a + 220 * a * a), 1 + (h >> 20) % 2, 1); } ctx.restore();
}

// ---- INFINITY: a shell of thin light round Gojo (a lattice of hexagons)
function rsInfinity(cx, cy, rx, ry, T, k, o) {      // o.hx, o.hy, o.age = where the blow touched the shell and how long ago (rings run across it); o.crack = how far the cracks have run (0 - 1)
  if (k <= 0) return; o = o || {}; ctx.save(); ctx.globalCompositeOperation = 'lighter';
  const gl = ctx.createRadialGradient(cx, cy, ry * 0.2, cx, cy, ry * 1.1); gl.addColorStop(0, 'rgba(110,190,255,0)'); gl.addColorStop(0.8, 'rgba(110,190,255,' + (0.12 * k).toFixed(3) + ')'); gl.addColorStop(1, 'rgba(110,190,255,0)'); ctx.fillStyle = gl; ctx.fillRect(cx - rx * 1.5, cy - ry * 1.3, rx * 3, ry * 2.6);
  ctx.save(); ctx.beginPath(); ctx.ellipse(cx, cy, rx, ry, 0, 0, 6.2832); ctx.clip();
  const s = 6, hh = s * 0.866; ctx.strokeStyle = 'rgba(150,220,255,' + ((0.2 + 0.08 * Math.sin(T * 6)) * k).toFixed(3) + ')'; ctx.lineWidth = 1; ctx.beginPath();
  for (let col = Math.floor(-rx / (s * 1.5)) - 1; col <= Math.ceil(rx / (s * 1.5)) + 1; col++) for (let row = Math.floor(-ry / (hh * 2)) - 1; row <= Math.ceil(ry / (hh * 2)) + 1; row++) { const x = cx + col * s * 1.5, y = cy + row * hh * 2 + (col & 1 ? hh : 0); ctx.moveTo(x + s, y); for (let a = 1; a < 6; a++) ctx.lineTo(x + Math.cos(a * 1.0472) * s, y + Math.sin(a * 1.0472) * s); ctx.closePath(); }
  ctx.stroke();
  if (o.age != null && o.age >= 0 && o.age < 1) { const f = 1 - o.age; for (let i = 0; i < 3; i++) { ctx.strokeStyle = 'rgba(200,240,255,' + (0.8 * f * (1 - i * 0.25)).toFixed(3) + ')'; ctx.lineWidth = 2 - i * 0.5; ctx.beginPath(); ctx.arc(o.hx, o.hy, 2 + o.age * 70 + i * 7, 0, 6.2832); ctx.stroke(); } if (o.age < 0.1) { ctx.fillStyle = '#fff'; ctx.fillRect(o.hx - 4, o.hy, 9, 1); ctx.fillRect(o.hx, o.hy - 4, 1, 9); } }
  if (o.crack > 0) { ctx.strokeStyle = 'rgba(235,250,255,0.9)'; ctx.lineWidth = 1; const n = 5 + Math.round(8 * o.crack);
    for (let i = 0; i < n; i++) { const h = Math.imul(i + 5, 2654435761) >>> 0, an = Math.PI + ((h % 100) / 100 - 0.5) * 2.6, L = (10 + (h >> 8) % 26) * clamp01(o.crack * 1.4 - i / (n * 2.2)), j = ((h >> 4) % 7) - 3; let x = o.hx, y = o.hy; ctx.beginPath(); ctx.moveTo(x, y); for (let q = 1; q <= 3; q++) { x += Math.cos(an) * L / 3 + (q % 2 ? j : -j) * 0.7; y += Math.sin(an) * L / 3 + (q % 2 ? -j : j) * 0.5; ctx.lineTo(x, y); } ctx.stroke(); } }
  ctx.restore();
  ctx.strokeStyle = 'rgba(200,240,255,' + (0.6 * k).toFixed(3) + ')'; ctx.lineWidth = 2; ctx.beginPath(); ctx.ellipse(cx, cy, rx, ry, 0, 0, 6.2832); ctx.stroke(); ctx.strokeStyle = 'rgba(255,255,255,' + (0.35 * k).toFixed(3) + ')'; ctx.lineWidth = 1; ctx.beginPath(); ctx.ellipse(cx, cy, Math.max(1, rx - 2), ry - 2, 0, 0, 6.2832); ctx.stroke();
  ctx.restore();
}
function rsShards(cx, cy, rx, ry, a) {      // INFINITY breaks: shards of the shell fly out and fall (a = seconds since it broke)
  if (a < 0 || a > 1.1) return; ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = 'rgba(190,235,255,' + (0.9 * (1 - a / 1.1)).toFixed(3) + ')';
  for (let i = 0; i < 40; i++) { const h = Math.imul(i + 9, 2654435761) >>> 0, th = i * 0.157, v = 70 + (h % 110), x = cx + Math.cos(th) * rx + Math.cos(th) * v * a, y = cy + Math.sin(th) * ry + Math.sin(th) * v * a + 250 * a * a, z = 2 + (h >> 8) % 3, r = th * 3 + a * 8; ctx.beginPath(); ctx.moveTo(x + Math.cos(r) * z, y + Math.sin(r) * z); ctx.lineTo(x + Math.cos(r + 2.2) * z, y + Math.sin(r + 2.2) * z); ctx.lineTo(x + Math.cos(r + 4.1) * z * 0.6, y + Math.sin(r + 4.1) * z * 0.6); ctx.fill(); }
  ctx.restore();
}

// ---- Gojo's bust for the talk: his idle picture with blood on it, head and shoulders, enlarged with hard pixels (the mouth moves while he speaks)
const rsGbC = new Map();
function rsGoBust(Z) {      // .c = the picture, .mx / .my = his mouth in it, .nx / .ny = his neck in it
  let r = rsGbC.get(Z); if (r) return r;
  const f = bloody(idleF[0]), w = f.width, h = f.height, d = f.getContext('2d').getImageData(0, 0, w, h).data; let top = -1, x0 = w, x1 = 0;
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) if (d[(y * w + x) * 4 + 3] > 40) { if (top < 0) top = y; if (y < top + 36) { x0 = Math.min(x0, x); x1 = Math.max(x1, x); } }
  const sx = Math.max(0, x0 - 1), sy = Math.max(0, top - 1), sw = Math.min(w - sx, x1 + 2 - sx), sh = Math.min(h - sy, 37), c = document.createElement('canvas'); c.width = sw * Z; c.height = sh * Z; const g = c.getContext('2d'); g.imageSmoothingEnabled = false; g.drawImage(f, sx, sy, sw, sh, 0, 0, sw * Z, sh * Z);
  const m = mouthOf(f) || { x: 19, y: 16 }; r = { c, mx: (m.x - sx) * Z, my: (m.y - sy) * Z, nx: (16.5 - sx) * Z, ny: (19 - sy) * Z, sw, sh }; rsGbC.set(Z, r); return r;
}

// ---- the Master carrying Gojo: his strike picture (the arm stretched out) down to his hips with the arm taken off, the legs of his walk, and a NEW arm drawn raised to the neck; lq = how high the arm lifts (0 - 1, in 4 steps); .palm = [column, row] of his palm
const rsCrC = new Map();
function rsCarrySrc(legs, lq) {
  const kq = Math.round(lq * 3) / 3, key = kq; let M = rsCrC.get(legs); if (!M) rsCrC.set(legs, M = {}); if (M[key]) return M[key];
  const c = document.createElement('canvas'); c.width = 64; c.height = 64; const g = c.getContext('2d'); g.drawImage(fredA(0, 12), 0, 0, 64, 38, 0, 0, 64, 38); g.clearRect(44, 18, 20, 20); g.drawImage(legs, 0, 38, 64, 26, 0, 38, 64, 26);
  const pr = Math.round(lerp(20, 11, kq)), pc = 55; rsLine(g, 41, 27, pc - 1, pr + 1, 4, '#1a1426'); g.fillStyle = '#1a1426'; g.fillRect(pc - 3, pr - 2, 6, 6); c.palm = [pc, pr]; M[key] = c; return c;      // (the colours do not matter: rsFred paints the whole picture black)
}
function rsBlades(x, y, dir) {      // the claw's blades laid round a neck at (x, y): four thin black blades with a violet edge (dir = 1 when the arm comes from the left)
  ctx.save(); ctx.lineWidth = 1; for (const [a, b, c, d] of [[-3, -2, 5, -1], [-3, -1, 6, 1], [-3, 0, 5, 3], [-3, 1, 3, 5]]) { ctx.strokeStyle = '#06030c'; ctx.beginPath(); ctx.moveTo(x + a * dir, y + b); ctx.lineTo(x + c * dir, y + d); ctx.stroke(); ctx.strokeStyle = 'rgba(170,100,255,0.55)'; ctx.beginPath(); ctx.moveTo(x + a * dir, y + b - 1); ctx.lineTo(x + c * dir, y + d - 1); ctx.stroke(); } ctx.restore();
}

// ---- 1. HUSH: the room after the blow, no sound at all, the wind of the portal; the camera creeps in on Yuji, whose hair is torn back
function rsHush(now, dt, T, st, t1) {
  const C = rsCL(), p = ease3(clamp01(t1 / st.d)), z = 1 + 0.5 * p, fx = lerp(VW * 0.5, C.yx0 + 14, p), fy = lerp(gy - 40, gy - 34, p);
  rsCamOn(z, fx, fy, VW / 2, VH * 0.58); rsRoom2(now, T);
  rsGojoLie(C); shadow(C.fm, 9); rsAura(C.fm, T, 1, 60); rsFredDraw(C.fm, T, { mode: 'idle', eye: 0.85 + 0.1 * Math.sin(T * 2.1) });
  rsYuji(C.yx0, C.back, 'idle', T, { wind: 0.55 + 0.5 * clamp01(t1 / 2.6) });
  rsWindBits(T, 1, 0, VW); rsCamOff(); rsCold();
}
// ---- 2. SENSEI NO!: Yuji, in a close-up, hair streaming; he screams
function rsScreamShot(now, dt, T, st, t1) {
  rsCloseBg(T); const Z = Math.max(3, Math.floor(VH * 0.85 / 31)), Cx = Math.round(VW * 0.6), Cy = Math.round(VH * 0.5), on = t1 >= 1.4, a = on ? t1 - 1.4 : 0, shk = on ? 3.5 * Math.max(0, 1 - a / 1.8) : 0.5;
  ctx.save(); if (shk > 0.2) ctx.translate(Math.round((Math.random() * 2 - 1) * shk), Math.round((Math.random() * 2 - 1) * shk));
  rsWindLines(T, 1); rsHeadGlow(Cx - 6 * Z, Cy - 6 * Z, Z * 0.3); rsYujiHead(Cx, Cy, Z, T, 1.0 + 0.6 * (on ? 1 : 0), on ? 1 : 0); ctx.restore();
  msFinish(1);
  if (on) { const jx = Math.round((Math.random() * 2 - 1) * 2), jy = Math.round((Math.random() * 2 - 1) * 2); ctx.save(); pxt('SENSEI NO!', VW / 2 + jx + 1, Math.round(VH * 0.9) + jy + 1, '#7a0a0a', 24, 'center'); pxt('SENSEI NO!', VW / 2 + jx, Math.round(VH * 0.9) + jy, '#ffffff', 24, 'center'); ctx.restore(); const fl = clamp01(1 - a / 0.16); if (fl > 0) { ctx.fillStyle = 'rgba(255,255,255,' + (fl * 0.8).toFixed(3) + ')'; ctx.fillRect(0, 0, VW, VH); } }
}
// ---- 3. Yuji charges the Master on his real dash pictures
function rsYChargeX(t) { const C = rsCL(); return Math.round(lerp(C.yx0, C.yx1, 1 - Math.pow(1 - clamp01(t / 1.1), 2))); }
function rsYCharge(now, dt, T, st, t1) {
  const C = rsCL(), x = rsYChargeX(t1), lane = Math.round(lerp(C.back, 0, ease3(clamp01(t1 / 1.1)))), cx = lerp(C.yx0 + 14, x + 18, ease3(clamp01(t1 / 1.2)));
  rsCamOn(1.5, cx, gy - 34, VW / 2, VH * 0.58); rsRoom2(now, T);
  rsGojoLie(C); shadow(C.fm, 9); rsAura(C.fm, T, 1, 60); rsFredDraw(C.fm, T, { mode: 'idle', eye: 1.0 });
  for (let i = 0; i < 6; i++) { const ph = (t1 * 3 + i * 0.17) % 1; ctx.fillStyle = 'rgba(176,140,110,' + (0.35 * (1 - ph)).toFixed(2) + ')'; ctx.fillRect(Math.round(x - 6 - ph * 26), gy + lane - 1 - Math.round(ph * 7), 3, 2); }      // dust kicked up behind him
  rsYuji(x, lane, 'dash', T, { fps: 36, wind: 0.5 });
  for (let i = 0; i < 7; i++) { const h = Math.imul(i + 5, 2654435761) >>> 0, y = gy - 52 + (h % 44) + lane, len = 14 + (h >> 8) % 22, xx = x - 14 - ((t1 * 260 + (h >> 4) % 60) % 70); ctx.globalAlpha = 0.3; ctx.fillStyle = '#ffffff'; ctx.fillRect(Math.round(xx - len), y, len, 1); } ctx.globalAlpha = 1;      // speed lines
  rsWindBits(T, 0.8, 0, VW); rsCamOff(); rsCold();
}

// ---- 4. BLUE: Gojo gets up from the floor and casts; a wave of it runs across the room and meets Yuji
function rsGBlue(now, dt, T, st, t1) {
  const C = rsCL(), e = ease3(clamp01((t1 - 1.9) / 0.8)), k = ease3(clamp01(t1 / 1.35)), cast = t1 - 1.35, ox = C.gs + 19, oy = gy - 37, ring = (t1 - 2.15) * 170;
  rsCamOn(lerp(1.9, 1.35, e), lerp(C.gs + 18, 120, e), gy - 36, VW / 2, VH * 0.58); rsRoom2(now, T); rsMaster(C, T, 1);
  const jolt = clamp01((t1 - 2.15 - (C.yx1 - ox) / 170) / 0.25); rsYuji(C.yx1 - Math.round(3 * jolt), 0, 'dash', T, { fps: 36, wind: 0.6 + 0.6 * jolt });
  if (cast < 0) { rsGojoRot(bloody(idleF[Math.floor(T * IDLE_FPS) % idleF.length]), D.idle, lerp(C.gw, C.gs, k) + (k < 1 ? Math.sin(T * 40) * 0.8 : 0), lerp(gy - 16, gy - 30, k), lerp(-1.5, 0.1, k), 30); if (k > 0.8) rsDrip(C.gs + 7, gy - 24, T, 3, 0); }
  else { const f = Math.min(9, Math.floor(cast * 24)); shadow(C.gs, 9); rsGojoRot(bloody(lapseF[0][f]), D.atk4, C.gs, gy, 0.07, 60); rsDrip(C.gs + 7, gy - 24, T, 3, 0); if (f >= 5) rsBlue(ox, oy, 3 + 5 * clamp01((cast - 0.2) / 0.5) + 2 * clamp01((t1 - 2.0) / 0.5) + Math.sin(T * 30), T, 0.6 + 0.4 * clamp01((t1 - 2.0) / 0.6)); }
  if (ring > 0 && ring < 150) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; for (let i = 0; i < 2; i++) { ctx.strokeStyle = 'rgba(160,225,255,' + (0.7 * (1 - ring / 150) * (1 - i * 0.4)).toFixed(3) + ')'; ctx.lineWidth = 2 - i; ctx.beginPath(); ctx.arc(ox, oy, Math.max(0.1, ring - i * 7), -1.2, 1.2); ctx.stroke(); } ctx.restore(); }      // the wave of the pull
  rsCamOff(); rsCold();
}
// ---- 5. Yuji runs with all his strength against the pull and gets nowhere (a close-up of his face in the middle)
function rsBStop(now, dt, T, st, t1) {
  const C = rsCL(), yx = rsYX(C, T), p = clamp01(t1 / st.d), ox = C.gs + 19, oy = gy - 37, tr = Math.round(Math.sin(T * 47));
  if (t1 > 1.9 && t1 < 2.9) {
    rsCloseBg(T); const Z = Math.max(3, Math.floor(VH * 0.85 / 31)), Cx = Math.round(VW * 0.58), Cy = Math.round(VH * 0.5), g = ctx.createLinearGradient(0, 0, VW * 0.7, 0); g.addColorStop(0, 'rgba(90,170,255,0.45)'); g.addColorStop(1, 'rgba(90,170,255,0)'); ctx.fillStyle = g; ctx.fillRect(0, 0, VW, VH);
    ctx.save(); ctx.translate(Math.round((Math.random() * 2 - 1) * 2.5), Math.round((Math.random() * 2 - 1) * 2.5)); rsWindLines(T, 1.4); rsHeadGlow(Cx - 6 * Z, Cy - 6 * Z, Z * 0.3); rsYujiHead(Cx, Cy, Z, T, 1.6, 2); ctx.restore(); msFinish(1); return;
  }
  rsCamOn(1.35 + 0.1 * p, lerp(120, 112, p), gy - 36, VW / 2, VH * 0.58); rsRoom2(now, T); rsMaster(C, T, 1);
  rsPullFx(T, ox, oy, yx, 1); ctx.fillStyle = 'rgba(60,35,20,0.35)'; ctx.fillRect(yx, gy + 3, C.yx1 - yx + 8, 1);      // the mark of his soles on the floor
  for (let i = 0; i < 8; i++) { const ph = (T * 5 + i * 0.13) % 1; ctx.fillStyle = 'rgba(190,160,120,' + (0.5 * (1 - ph)).toFixed(2) + ')'; ctx.fillRect(Math.round(yx + 6 - ph * -22), gy - 1 - Math.round(ph * 8), 2, 1); }      // dust thrown up by his heels
  rsYuji(yx + tr, 0, 'dash', T, { fps: 40 + 8 * p, wind: 1.1 });
  shadow(C.gs, 9); rsGojoRot(bloody(lapseF[0][9]), D.atk4, C.gs + tr * 0.5, gy, 0.07 + 0.012 * Math.sin(T * 9), 60); rsDrip(C.gs + 7, gy - 24, T, 3, 0); rsBlue(ox, oy, 8 + 3 * p + Math.sin(T * 30), T, 1);
  rsCamOff(); rsCold();
}
// ---- 6. Yuji gives out and stops; BLUE is let go; the Master starts to walk to him
function rsYStop(now, dt, T, st, t1) {
  const C = rsCL(), mx = rsMX(C, T), p = ease3(clamp01(t1 / st.d)), ox = C.gs + 19, oy = gy - 37, q = clamp01(t1 / 0.45);
  rsCamOn(lerp(1.45, 1.75, p), lerp(118, (C.yx2 + mx) / 2 + 8, p), gy - 36, VW / 2, VH * 0.58); rsRoom2(now, T); rsGojoStand(C.gs, T);
  if (q < 1) { rsBlue(ox, oy, 11 * (1 - q), T, 1 - q); ctx.fillStyle = 'rgba(200,235,255,' + (0.5 * (1 - q)).toFixed(2) + ')'; ctx.fillRect(ox - 12, oy - 12, 25, 25); }
  rsMaster(C, T, 1); rsYuji(C.yx2, 0, 'pant', T, { wind: 1.0 * (1 - clamp01(t1 / 0.7)) });
  rsWindBits(T, 0.5 * (1 - p * 0.5), 0, VW); rsCamOff(); rsCold();
}
// ---- 7. Gojo uses BLUE to blink to the Master: a streak across the room, and he stands between the Master and Yuji
function rsTele(now, dt, T, st, t1) {
  const C = rsCL(), mx = rsMX(C, T), p = ease3(clamp01((t1 - 0.9) / 1.2)), a = t1 - 0.8, hy = gy - 34, x0 = C.gs + 25, x1 = C.xg + 6, arr = clamp01((a - 0.12) / 0.1);
  rsCamOn(lerp(1.45, 1.8, p), lerp((C.gs + mx) / 2, (C.yx2 + mx) / 2 + 2, p), gy - 36, VW / 2, VH * 0.58); rsRoom2(now, T);
  rsMaster(C, T, 1); rsYuji(C.yx2, 0, 'pant', T, {});
  if (t1 < 0.55) rsGojoStand(C.gs, T);
  else if (a < 0.25) { const f = Math.min(9, Math.floor(Math.max(0, t1 - 0.55) * 24)); shadow(C.gs, 9); rsGojoRot(bloody(lapseF[0][f]), D.atk4, C.gs, gy, 0.07, 60, false, a < 0 ? 1 : 1 - a / 0.25); if (a < 0) rsBlue(C.gs + 19, gy - 37, 2 + 6 * (t1 - 0.55) / 0.25, T, 0.6); }
  if (a >= 0 && a < 0.45) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; const hd = x0 + (x1 - x0) * Math.min(1, a / 0.14), fa = 1 - clamp01((a - 0.14) / 0.3), gr = ctx.createLinearGradient(x0, 0, hd, 0); gr.addColorStop(0, 'rgba(120,200,255,0)'); gr.addColorStop(1, 'rgba(235,250,255,' + fa.toFixed(2) + ')'); ctx.strokeStyle = gr; ctx.lineWidth = 3 * fa + 0.5; ctx.beginPath(); ctx.moveTo(x0, hy); ctx.lineTo(hd, hy); ctx.stroke(); ctx.restore(); }      // the streak
  if (a >= 0.12) { const b = a - 0.12; rsGojoStand(C.xg, T, { alpha: arr }); rsInfinity(C.xg + 3, gy - 30, C.bx - C.xg - 3, 33, T, 0.25, null); if (b < 0.5) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; for (let i = 0; i < 3; i++) { ctx.strokeStyle = 'rgba(170,230,255,' + (0.8 * (1 - b / 0.5) * (1 - i * 0.25)).toFixed(3) + ')'; ctx.lineWidth = 2 - i * 0.5; ctx.beginPath(); ctx.ellipse(C.xg + 3, gy - 30, 4 + b * 60 + i * 8, 10 + b * 70 + i * 8, 0, 0, 6.2832); ctx.stroke(); } ctx.restore(); } }
  rsWindBits(T, 0.4, 0, VW); rsCamOff(); rsCold(); if (a >= 0.12 && a < 0.2) { ctx.fillStyle = 'rgba(210,240,255,' + (0.4 * (1 - (a - 0.12) / 0.08)).toFixed(2) + ')'; ctx.fillRect(0, 0, VW, VH); }
}
// ---- 8. Gojo holds his hand back to Yuji, BLUE in the palm; Yuji screams SENSEI STO- and is sucked into it: gone, and the scream is cut off dead
function rsYFly(now, dt, T, st, t1) {
  const C = rsCL(), mx = C.xm0, kb = ease3(clamp01((t1 - 0.1) / 0.45)) * (1 - ease3(clamp01((t1 - 2.2) / 1.2))), vk = clamp01((t1 - 1.16) / 0.34), gone = t1 >= 1.5, f = idleF[Math.floor(T * IDLE_FPS) % idleF.length], bl = rsGojoBlock(f, kb), lean = 0.08 + 0.012 * Math.sin(T * 2.1);
  rsCamOn(1.75, (C.yx2 + mx) / 2 + 6, gy - 36, VW / 2, VH * 0.58); rsRoom2(now, T); rsMaster(C, T, 1 + 0.15 * Math.sin(T * 9));
  let hx = C.xg - 28, hy = gy - 44; ctx.fillStyle = 'rgba(110,8,14,0.85)'; ctx.beginPath(); ctx.ellipse(C.xg + 2, gy + 5, 9, 2, 0, 0, 6.2832); ctx.fill(); shadow(C.xg, 9);
  if (kb > 0.02) { const inf = { ...D.idle, cx: D.idle.cx + bl.pad }; rsGojoRot(bloody(bl), inf, C.xg, gy, lean, 60); if (bl.hand) { const lx = bl.hand[0] - (D.idle.cx - D.idle.x0 + bl.pad), ly = bl.hand[1] - 60 - (D.idle.top || 0); hx = C.xg + lx * Math.cos(lean) - ly * Math.sin(lean); hy = gy + lx * Math.sin(lean) + ly * Math.cos(lean); } }
  else rsGojoRot(bloody(f), D.idle, C.xg, gy, lean, 60);
  rsDrip(C.xg + 7, gy - 24, T, 3, 0.3); rsInfinity(C.xg + 3, gy - 30, C.bx - C.xg - 3, 33, T, 0.25, null);
  { const ro = 8 * clamp01((t1 - 0.45) / 0.35) * (1 - clamp01((t1 - 1.5) / 0.3)); if (bl.hand && kb > 0.3 && ro > 0.3) rsBlue(hx, hy, ro + Math.sin(T * 30), T, 1); }
  if (!gone) { const u = ease3(vk), ycx = C.yx2, ycy = gy - 30; ctx.save(); ctx.translate(lerp(ycx, hx, u), lerp(ycy, hy, u)); ctx.scale(1 - 0.95 * u, 1 + 0.4 * Math.sin(u * Math.PI) - 0.3 * u); ctx.translate(-ycx, -ycy); rsYuji(C.yx2, 0, 'idle', T, {}); ctx.restore();
    if (vk > 0) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.strokeStyle = 'rgba(160,225,255,0.55)'; ctx.lineWidth = 1; for (let i = 0; i < 7; i++) { const yy = gy - 56 + i * 8, xs = lerp(ycx - 6, hx, (i % 3) * 0.1); ctx.beginPath(); ctx.moveTo(xs - 8 * (1 - vk), yy); ctx.lineTo(lerp(xs, hx, ease3(vk)), lerp(yy, hy, ease3(vk))); ctx.stroke(); } ctx.restore(); } }
  if (gone && t1 < 1.9 && bl.hand) { const b = (t1 - 1.5) / 0.4; ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.strokeStyle = 'rgba(200,240,255,' + (0.9 * (1 - b)).toFixed(2) + ')'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(hx, hy, 3 + b * 40, 0, 6.2832); ctx.stroke(); ctx.restore(); }
  rsCamOff(); rsCold();
  if (t1 >= 0.88 && t1 < 1.62) { const n = Math.min(11, Math.floor((t1 - 0.88) / 0.05)), s = 'SENSEI STO-', fa = t1 < 1.5 ? 1 : 1 - (t1 - 1.5) / 0.12, jx = Math.round((Math.random() * 2 - 1) * (t1 < 1.5 ? 1.5 : 7)), jy = Math.round((Math.random() * 2 - 1) * 1.5); ctx.save(); ctx.globalAlpha = Math.max(0, fa); pxt(s.slice(0, n), VW / 2 + jx + 1, 40 + jy + 1, '#7a0a0a', 16, 'center'); pxt(s.slice(0, n), VW / 2 + jx, 40 + jy, '#ffffff', 16, 'center'); ctx.restore(); }      // (it is typed fast, shakes, and breaks up the moment he is gone)
  if (gone && t1 < 1.62) { ctx.fillStyle = 'rgba(220,245,255,' + (0.7 * (1 - (t1 - 1.5) / 0.12)).toFixed(2) + ')'; ctx.fillRect(0, 0, VW, VH); }
}

// ---- 9. the talk: Gojo (bloody) on the left, the Master on the right, close; whoever speaks is lit, the other is in shadow
function rsTalk(now, dt, T, st, t1) {
  const U = rsLay().U, Z = rsZ(), b = rsGoBust(Z), gm = st.w === 'GOJO', len = (st.a + st.b).length, talking = t1 * TN_RATE < len + 3, p = clamp01(t1 / st.d), id = st.id;
  const Gx = Math.round(VW * 0.33), Gy = Math.round(VH * 0.5), Mx = Math.round(VW * 0.72), My = Math.round(VH * 0.5) + Math.round(2 * Z);
  rsCloseBg(T); if (id === 'd5') { ctx.fillStyle = 'rgba(150,160,40,' + (0.1 + 0.05 * Math.sin(T * 2)).toFixed(3) + ')'; ctx.fillRect(0, 0, VW, VH); } if (id === 'd7') { ctx.fillStyle = 'rgba(190,20,30,' + (0.1 + 0.06 * Math.sin(T * 4)).toFixed(3) + ')'; ctx.fillRect(0, 0, VW, VH); }
  rsCamOn(1 + 0.05 * p, gm ? Gx : Mx, VH * 0.5, gm ? Gx : Mx, VH * 0.5);
  rsSmoke(Mx + 40 * U, My - 10 * U, T, U * 1.2);
  ctx.drawImage(b.c, Gx - b.mx, Gy - b.my + Math.round(Math.sin(T * 2.2)));      // (he sways a little: he is hurt)
  if (talking && gm) { ctx.fillStyle = '#3a0c14'; ctx.fillRect(Gx - 1 + 0, Gy, 3 * Z, (1 + (Math.floor(T * 11) % 2)) * Z); }
  rsDrip(Gx + Z, Gy + 3 * Z, T, 3, 0.1);
  if (id === 'd8') rsInfinity(Gx - 2 * Z, Gy + 2 * Z, 20 * Z, 34 * Z, T, 0.35, null);
  rsFredHead(Mx, My, Z, !gm && talking ? 0.02 * Math.sin(T * 9) : 0, 0, 1.0 + (gm ? 0 : 0.25 * Math.sin(T * 6)), !gm && talking ? 0.7 : 0.15);
  rsCamOff();
  { const g = ctx.createLinearGradient(VW * 0.2, 0, VW * 0.8, 0); g.addColorStop(gm ? 0.52 : 0.0, 'rgba(4,2,10,' + (gm ? 0 : 0.6) + ')'); g.addColorStop(gm ? 1.0 : 0.48, 'rgba(4,2,10,' + (gm ? 0.6 : 0) + ')'); ctx.fillStyle = g; ctx.fillRect(0, 0, VW, VH); }      // the one who is not speaking is in shadow
  msFinish(1); rsSay(st, t1);
}

// ---- 10. INFINITY: the Master's blow stops a hand's width from Gojo and holds there, trembling; the shell begins to crack
function rsCPunch(now, dt, T, st, t1) {
  const C = rsCL(), hit = 1.05, a = t1 - hit, mx0 = C.xm0, sh = a >= 0 ? 0.6 + 2.4 * clamp01((a - 1.2) / 1.0) : 0, jx = (Math.random() * 2 - 1) * sh, jy = (Math.random() * 2 - 1) * sh;
  const f = t1 < 0.5 ? -1 : t1 < 0.9 ? 5 + Math.min(3, Math.floor((t1 - 0.5) / 0.1)) : Math.min(12, 9 + Math.floor((t1 - 0.9) / 0.0375));
  rsCamOn(2.0, (C.xg + mx0) / 2 + 2 + jx, gy - 36 + jy, VW / 2, VH * 0.58); rsRoom2(now, T);
  rsGojoStand(C.xg, T, { lean: a >= 0 ? -0.04 : 0.1 });
  shadow(mx0, 9); rsAura(mx0, T, 1, 60); rsFredDraw(mx0 + (a >= 0 ? Math.round(Math.sin(T * 70) * 0.6) : 0), T, { src: f < 0 ? null : fredA(0, f), eye: 1 + (a >= 0 ? 0.2 : 0), flare: a >= 0 ? 0.7 : 0 });
  rsInfinity(C.xg + 3, gy - 30, C.bx - C.xg - 3, 33, T, a >= 0 ? 1 : 0.3, { hx: C.bx, hy: gy - 34, age: a, crack: clamp01((a - 1.0) / 1.2) });
  rsSparks(C.bx, gy - 34, a, 16, -0.3, 3); rsCamOff(); rsCold(); if (a >= 0 && a < 0.1) { ctx.fillStyle = 'rgba(255,255,255,' + (0.35 * (1 - a / 0.1)).toFixed(2) + ')'; ctx.fillRect(0, 0, VW, VH); }
}
// ---- 11. the screen shakes; INFINITY breaks; the claw takes Gojo by the neck and lifts him; a close-up of the grip
function rsPierce(now, dt, T, st, t1) {
  const C = rsCL(), pr = rsCarrySrc(fredF(Math.floor(T * IDLE_FPS)), 0), br = t1 - 1.4, lung = Math.round(C.xm0 - (C.xg + 4 + 24)), lq = Math.round(clamp01((t1 - 1.7) / 0.4) * 3) / 3;
  if (t1 >= 2.1) {      // the close-up: his hand round Gojo's throat, Gojo's head back, his mouth open
    rsCloseBg(T); const Z = rsZ(), b = rsGoBust(Z), Cx = Math.round(VW * 0.4), Cy = Math.round(VH * 0.5), u = t1 - 2.1, shk = 2.2 * Math.max(0, 1 - u / 1.0) + 0.5;
    ctx.save(); ctx.translate(Math.round((Math.random() * 2 - 1) * shk), Math.round((Math.random() * 2 - 1) * shk));
    ctx.save(); ctx.translate(Cx, Cy + b.ny - b.my); ctx.rotate(-0.22 - 0.05 * Math.sin(T * 5)); ctx.drawImage(b.c, -b.nx, -b.ny); ctx.fillStyle = '#3a0c14'; ctx.fillRect(b.mx - b.nx - 1, b.my - b.ny, 3 * Z, 2 * Z); ctx.restore();
    rsFredArm(Cx - 8 * Z + Math.round(Z * 0.5 * Math.sin(T * 30)), Cy + b.ny - b.my + Math.round(Z * 0.5), Z);
    rsDrip(Cx - 2 * Z, Cy + 4 * Z, T, 4, 0.2); { const ee = VW * 0.9, ey = VH * 0.3; msEye(ee, ey, Z * 0.5, 1.0, 0, 0.5 + 0.3 * Math.sin(T * 7)); } ctx.restore(); msFinish(1); return;
  }
  const sh = br < 0 ? 3 + 6 * clamp01(t1 / 1.4) : 5 * Math.max(0, 1 - br / 0.6), jx = (Math.random() * 2 - 1) * sh, jy = (Math.random() * 2 - 1) * sh;
  rsCamOn(2.0, (C.xg + C.xm0) / 2 + 2 + jx, gy - 36 + jy, VW / 2, VH * 0.58); rsRoom2(now, T);
  if (br < 0) {
    rsGojoStand(C.xg, T, { lean: -0.04 - 0.05 * clamp01(t1 / 1.4) }); shadow(C.xm0, 9); rsAura(C.xm0, T, 1, 60); rsFredDraw(C.xm0 - Math.round(3 * clamp01(t1 / 1.4)), T, { src: fredA(0, 12), eye: 1.2, flare: 0.8 });
    rsInfinity(C.xg + 3, gy - 30, C.bx - C.xg - 3, 33, T, 1.2, { hx: C.bx - 3 * clamp01(t1 / 1.4), hy: gy - 34, age: 1.5, crack: 1 });
    for (let i = 0; i < 12; i++) { const h = Math.imul(i + 21, 2654435761) >>> 0, ph = (T * (0.8 + (h % 5) * 0.15) + (h >> 8) % 100 / 100) % 1; ctx.fillStyle = 'rgba(150,130,110,' + (0.5 * (1 - ph)).toFixed(2) + ')'; ctx.fillRect(C.xg - 30 + (h % 90), Math.round(gy - 80 + ph * 80), 1, 2); }      // dust shaken from the ceiling
  } else {
    const mxp = C.xm0 - Math.round(lung * ease3(clamp01(br / 0.12))), nx = C.xg + 4, ny = gy - 41 - 9 * lq, lg = Math.max(0, 1 - br / 0.5);
    rsGojoRot(bloody(idleF[0]), D.idle, nx, ny + 3 * clamp01(br / 0.12), -0.12 - 0.2 * lg + 0.04 * Math.sin(T * 6), 19); shadow(mxp, 9); rsAura(mxp, T, 1, 60); rsFredDraw(mxp, T, { src: rsCarrySrc(fredF(Math.floor(T * IDLE_FPS)), lq), eye: 1.3, flare: 0.9 }); rsBlades(nx, ny, 1);
    rsShards(C.xg + 3, gy - 30, C.bx - C.xg - 3, 33, br); rsSparks(C.bx, gy - 34, br, 24, 0, 5);
  }
  rsCamOff(); rsCold(); if (br >= 0 && br < 0.14) { ctx.fillStyle = 'rgba(255,255,255,' + (0.9 * (1 - br / 0.14)).toFixed(2) + ')'; ctx.fillRect(0, 0, VW, VH); }
}
// ---- 12. he turns and walks Gojo back to the portal in his hand; they go through; the portal collapses
function rsCarryX(C, T) { const t0 = rsCT('carry'); return lerp(C.xg + 28, C.L.PX + 12, ease3(clamp01((T - t0 - 0.7) / 3.7))); }
function rsCarry(now, dt, T, st, t1) {
  const C = rsCL(), px = C.L.PX, mx = Math.round(rsCarryX(C, T)), right = t1 >= 0.55, d = mx - (C.xg + 28), walking = right && t1 < 4.4, lq = 1, ang = 0.08 * Math.sin(T * 2.2) + (t1 > 0.55 ? 0.5 * Math.max(0, 1 - (t1 - 0.55) / 0.5) : 0);
  const cl = clamp01((t1 - 3.85) / 1.2), pp = 1 - ease3(cl), z = 1.5, legs = walking ? fredF(d * 0.5, true) : fredF(Math.floor(T * IDLE_FPS)), src = rsCarrySrc(legs, lq), pal = src.palm, sgn = right ? 1 : -1;
  const nx = mx + sgn * (pal[0] - 31), ny = gy - 61 + pal[1];
  rsCamOn(z, Math.min(Math.max(mx + 14, C.xg), px - 40), gy - 36, VW / 2, VH * 0.58); rsRoom2(now, T, pp);
  ctx.save(); ctx.beginPath(); ctx.rect(0, 0, px - 5, VH); ctx.clip(); shadow(mx, 9); rsAura(mx, T, 1, 60); rsFredDraw(mx, T, { src, right, eye: 1.2 });
  rsGojoRot(bloody(idleF[0]), D.idle, nx, ny, ang, 19, right, 1); rsBlades(nx, ny, sgn); ctx.restore();
  if (t1 > 0.45 && t1 < 0.75) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = 'rgba(120,50,200,' + (0.5 * (1 - Math.abs(t1 - 0.6) / 0.15)).toFixed(2) + ')'; ctx.beginPath(); ctx.ellipse(mx, gy - 34, 30, 40, 0, 0, 6.2832); ctx.fill(); ctx.restore(); }      // (the dark burst that hides his turn)
  if (cl > 0.92) { ctx.fillStyle = 'rgba(210,170,255,' + (0.7 * (1 - (cl - 0.92) / 0.08)).toFixed(2) + ')'; ctx.fillRect(px - 40, gy - 90, 80, 120); }
  rsWindBits(T, 0.6 * pp, 0, VW); rsCamOff(); rsCold();
}
// ---- 13. the empty room fades to black
function rsBlack(now, dt, T, st, t1) {
  rsRoom2(now, T, 0); for (let i = 0; i < 10; i++) { const h = Math.imul(i + 31, 2654435761) >>> 0, ph = (T * 0.3 + (h % 100) / 100) % 1; ctx.fillStyle = 'rgba(200,190,170,' + (0.3 * (1 - ph)).toFixed(2) + ')'; ctx.fillRect(10 + (h >> 4) % (VW - 20), Math.round(gy - 60 + ph * 50), 1, 1); }
  rsCold(); ctx.fillStyle = 'rgba(0,0,0,' + ease3(t1 / st.d).toFixed(3) + ')'; ctx.fillRect(0, 0, VW, VH);
}

// ---- the sounds of the continuation (the ones that belong to the clock of the scene); the hush has none: it is SILENT
function rsSounds2(T) {
  const ev = (k, t, f, win) => { if (T >= t && T < t + (win || 0.5)) once2(k, f); }, t = rsCT, C = rsCL(), tn = story.tn;
  const tS = t('scream'), tY = t('ycharge'), tG = t('gblue'), tB = t('bstop'), tY2 = t('ystop'), tT = t('tele'), tF = t('yfly'), tK = t('cpunch'), tP = t('pierce'), tC = t('carry');
  ev('c_gasp', tS + 1.0, () => snd('gasp', 0)); ev('c_scream', tS + 1.4, () => snd('yscream', 0), 1); ev('c_dash', tY, () => snd('dash', 0));
  { const s = Math.floor((T - tY) / 0.17); if (T >= tY && T < tY + 1.1 && s !== tn.ys) { tn.ys = s; snd('yrun', 0); } }
  ev('c_g1', tG + 0.45, () => snd('gasp', 1)); ev('c_cast', tG + 1.35, () => snd('mbcharge')); ev('c_orb', tG + 2.0, () => snd('orbstart'));
  { const hold = T >= tG + 2.5 && T < tY2 + 0.15; if (hold !== !!tn.bp) { tn.bp = hold ? 1 : 0; snd(hold ? 'bluepull' : 'bluepulloff'); } }      // BLUE hums for as long as it holds Yuji (a state, so that a tap that skips into or out of the step starts and stops it)
  { const s = Math.floor((T - tB) / 0.14); if (T >= tB && T < tB + 4.2 && s !== tn.ysk) { tn.ysk = s; snd('yrun', 1); } }
  ev('c_roar', tB + 0.3, () => snd('yscream', 2), 1); ev('c_p1', tY2 + 0.5, () => snd('gasp', 0)); ev('c_p2', tY2 + 1.4, () => snd('gasp', 0)); ev('c_p3', tY2 + 2.2, () => snd('gasp', 0));
  { const mx = rsMX(C, T), s = Math.floor((C.fm - mx) / 14); if (T > tY2 && T < tT + 1.0 && s > 0 && s !== tn.ms) { tn.ms = s; snd('rsstep'); } }      // one heavy step for every 14 pixels he walks
  ev('c_b0', tT + 0.55, () => snd('pull')); ev('c_blink', tT + 0.82, () => snd('blink')); ev('c_g2', tT + 1.8, () => snd('gasp', 1));
  ev('c_arm', tF + 0.1, () => snd('pull')); ev('c_sto', tF + 0.88, () => snd('yscream', 1), 1); ev('c_vac', tF + 1.16, () => snd('bluevac'), 1);
  ev('c_hit', tK + 1.05, () => snd('tink', 1)); ev('c_chg', tK + 1.4, () => snd('rscharge'), 1); ev('c_ic', tK + 1.9, () => snd('infcrack', 0), 1.5); ev('c_rum', tK + 1.6, () => snd('rumble', 3), 1.5);
  ev('c_shat', tP + 1.4, () => { snd('infcrack', 1); snd('rsgrab'); }); ev('c_g3', tP + 1.7, () => snd('gasp', 2));
  { const mx = rsCarryX(C, T), s = Math.floor((mx - C.xg) / 14); if (T > tC + 0.7 && T < tC + 4.4 && s !== tn.cs) { tn.cs = s; snd('rsstep'); } }
  ev('c_pc', tC + 3.85, () => snd('portalclose'), 1);
}

// ---- the continuation: one shot for each of its steps
function rsCont(now, dt, T, st, t1) {
  rsSounds2(T);
  switch (st.k) {
    case 'hush': return rsHush(now, dt, T, st, t1);
    case 'scream': return rsScreamShot(now, dt, T, st, t1);
    case 'ycharge': return rsYCharge(now, dt, T, st, t1);
    case 'gblue': return rsGBlue(now, dt, T, st, t1);
    case 'bstop': return rsBStop(now, dt, T, st, t1);
    case 'ystop': return rsYStop(now, dt, T, st, t1);
    case 'tele': return rsTele(now, dt, T, st, t1);
    case 'yfly': return rsYFly(now, dt, T, st, t1);
    case 'say': return rsTalk(now, dt, T, st, t1);
    case 'cpunch': return rsCPunch(now, dt, T, st, t1);
    case 'pierce': return rsPierce(now, dt, T, st, t1);
    case 'carry': return rsCarry(now, dt, T, st, t1);
    default: return rsBlack(now, dt, T, st, t1);
  }
}
