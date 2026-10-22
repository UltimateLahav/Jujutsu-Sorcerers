// ---------------------------------------------------------------- v1.56 CHAPTER 2, THE RESTAURANT (the last scene of chapter 2; this file is spliced into template.html by build_html.py, in place of the marker line before drawScene)
// After the training Yuji and Gojo eat in a ramen shop. A dark portal opens behind Gojo and the Master walks out of it (he is still only a black shape with one glowing red eye). Gojo makes Yuji get behind him, runs at him with a purple punch and lands it; close-ups: Gojo smirks while the Master's head snaps back with a HUGE shockwave, the head comes back while the fist is still on his face, Gojo is shocked, the Master grabs his fist and punches him back through the diners (gore like the Cartoon Cat's) into the wall. Then the card END OF CHAPTER 2.
const RS_SEQ = [
  { k: 'eat', d: 2.2 },
  { k: 'say', w: 'YUJI', a: 'THIS RAMEN IS SO GOOD!', b: '' },
  { k: 'say', w: 'GOJO', a: 'TRAINING MAKES EVERYTHING', b: 'TASTE BETTER, RIGHT?' },
  { k: 'say', w: 'YUJI', a: 'NEXT TIME I WILL BEAT YOU!', b: '' },
  { k: 'say', w: 'GOJO', a: 'HA HA! I CANNOT WAIT.', b: '' },
  { k: 'portal', d: 4.6 }, { k: 'emerge', d: 5.0 },
  { k: 'say', w: 'GOJO', a: 'YUJI. GET BEHIND ME.', b: '', warn: true },
  { k: 'charge', d: 1.6 }, { k: 'punch', d: 0.7 },
  { k: 'closeA', d: 3.4 }, { k: 'closeB', d: 3.2 }, { k: 'closeC', d: 3.2 },
  { k: 'launch', d: 5.4 }, { k: 'black', d: 1.6 }];
{ let t = 0; for (const s of RS_SEQ) { s.t0 = t; if (!s.d) s.d = Math.max(1.9, ((s.a || '').length + (s.b || '').length) / TN_RATE + 0.9); t += s.d; } RS_SEQ.end = t; }
const RS_CUTS = RS_SEQ.slice(1).map(s => s.t0), RS_CARD = RS_SEQ.end, rsT = k => RS_SEQ.find(s => s.k === k).t0, RS_LAUNCH = { grab: 0.9, punch: 1.8, v: 270 };      // the card follows the last step; the flight of Gojo: the Master grabs at 0.9 s, hits at 1.8 s, Gojo flies at 270 px a second
const RS_KILLS = ['halve', 'head', 'crush'];      // how the three diners in Gojo's way die (the Cat's own kills)

// ---- the room: where everything stands (worked out once for each screen size)
function rsLay() {
  const key = VW + 'x' + VH + 'x' + gy; if (rsLay.key === key) return rsLay.v; rsLay.key = key; const U = VH / 135;
  const v = { U, YX: Math.round(VW * 0.37), GX: Math.round(VW * 0.535), top: gy - Math.round(27 * U), PX: VW - Math.round(24 * U), FX: 0, back: -Math.round(9 * U), wall: Math.round(7 * U) };
  v.tx = Math.round((v.YX + v.GX) / 2);
  v.FX = Math.min(VW - Math.round(30 * U), Math.max(VW - Math.round(78 * U), v.GX + Math.round(58 * U)));      // where the Master stops: 78 px from the right edge, but always far enough from Gojo for a run (narrow screens)
  v.npc = [{ t: 0, x: Math.round(VW * 0.07), f: false }, { t: 1, x: Math.round(VW * 0.18), f: true }, { t: 2, x: Math.round(VW * 0.28), f: true }];      // the three in the way (the first one hit is the last in the list)
  v.tbl = [{ x: Math.round(VW * 0.125), w: Math.round(20 * U) }, { x: Math.round(VW * 0.225), w: Math.round(18 * U) }];
  return rsLay.v = v;
}
let rsBgC = null, rsBgKey = '';
function rsBg() {      // the shop: plaster wall over dark wooden panels, a window with daylight, menu boards, the kitchen hatch with its counter, a wooden floor (drawn once)
  const key = VW + 'x' + VH + 'x' + gy; if (rsBgC && rsBgKey === key) return rsBgC; rsBgKey = key; const c = document.createElement('canvas'); c.width = VW; c.height = VH; const g = c.getContext('2d'), U = VH / 135; let hs = 77; const rn = () => { hs = (hs * 1103515245 + 12345) & 0x7fffffff; return hs / 0x7fffffff; };
  const wallB = gy - Math.round(6 * U), wain = wallB - Math.round(40 * U);
  g.fillStyle = '#ead8b4'; g.fillRect(0, 0, VW, wallB); for (let i = 0; i < 170; i++) { g.fillStyle = rn() < 0.5 ? '#e2cfa8' : '#f1e1c2'; g.fillRect((rn() * VW) | 0, (rn() * wain) | 0, 2, 1); }
  g.fillStyle = '#7b4a2a'; g.fillRect(0, wain, VW, wallB - wain); g.fillStyle = '#6a3e22'; for (let x = 0; x < VW; x += 7) g.fillRect(x, wain, 1, wallB - wain); g.fillStyle = '#4e2c16'; g.fillRect(0, wain - 2, VW, 3); g.fillStyle = '#9a6a3c'; g.fillRect(0, wain + 1, VW, 1);
  g.fillStyle = '#4a2c18'; g.fillRect(0, 0, VW, Math.round(7 * U)); g.fillStyle = '#6a4226'; g.fillRect(0, Math.round(7 * U), VW, 1);
  const x0 = Math.round(VW * 0.05), x1 = Math.round(VW * 0.27), y0 = Math.round(16 * U), y1 = wain - Math.round(10 * U);      // the window: daylight, treetops, a cloud, cross bars
  g.fillStyle = '#3e2412'; g.fillRect(x0 - 3, y0 - 3, x1 - x0 + 6, y1 - y0 + 6); const sk = g.createLinearGradient(0, y0, 0, y1); sk.addColorStop(0, '#8fd0f6'); sk.addColorStop(1, '#e8f4e0'); g.fillStyle = sk; g.fillRect(x0, y0, x1 - x0, y1 - y0);
  g.fillStyle = '#4a9a56'; for (let x = x0; x < x1; x += 11) { g.beginPath(); g.arc(x + 5, y1, 10 + ((x * 7) % 9), Math.PI, 0); g.fill(); } g.fillStyle = '#f4ecd8'; g.fillRect(x0 + 4, y0 + 5, 12, 3); g.fillRect(x0 + 30, y0 + 12, 16, 3);
  g.fillStyle = '#3e2412'; g.fillRect((x0 + x1) >> 1, y0, 2, y1 - y0); g.fillRect(x0, (y0 + y1) >> 1, x1 - x0, 2);
  for (const fx of [0.36, 0.45, 0.54]) { const x = Math.round(VW * fx), y = Math.round(18 * U), w = Math.round(22 * U), h = Math.round(20 * U); g.fillStyle = '#2a1a10'; g.fillRect(x, y, w, h); g.fillStyle = '#6a4226'; g.fillRect(x, y, w, 1); g.fillStyle = '#f0e6d0'; for (let r = 0; r < 4; r++) g.fillRect(x + 3, y + 4 + r * Math.round(4 * U), Math.round((9 + ((r * 5 + fx * 30) % 9)) * U), 1); }      // menu boards with writing
  const kx = Math.round(VW * 0.64), cy = gy - Math.round(36 * U), ky = Math.round(14 * U);      // the kitchen hatch (warm light, a shelf with pots) and the counter under it
  g.fillStyle = '#2a1a12'; g.fillRect(kx, ky, VW - kx - 3, cy - ky); const kg = g.createLinearGradient(0, ky, 0, cy); kg.addColorStop(0, '#5a3a22'); kg.addColorStop(1, '#c8863c'); g.fillStyle = kg; g.fillRect(kx + 3, ky + 3, VW - kx - 9, cy - ky - 3);
  g.fillStyle = '#3a2416'; g.fillRect(kx + 3, Math.round(40 * U), VW - kx - 9, 2); for (let x = kx + 10; x < VW - 16; x += 18) { g.fillStyle = '#c9c1b0'; g.fillRect(x, Math.round(31 * U), 8, 9); g.fillStyle = '#8a8274'; g.fillRect(x, Math.round(31 * U) + 7, 8, 2); }
  g.fillStyle = '#a06a3a'; g.fillRect(kx - 3, cy, VW - kx + 3, Math.round(3 * U)); g.fillStyle = '#5a3820'; g.fillRect(kx - 3, cy + Math.round(3 * U), VW - kx + 3, wallB - cy - Math.round(3 * U)); g.fillStyle = '#4a2c18'; for (let x = kx; x < VW; x += 9) g.fillRect(x, cy + Math.round(3 * U), 1, wallB - cy);
  g.fillStyle = '#b8824e'; g.fillRect(0, wallB, VW, VH - wallB); for (let y = wallB + 5, r = 0; y < VH; y += Math.round(9 * U), r++) { g.fillStyle = '#8f5f36'; g.fillRect(0, y, VW, 1); for (let x = (r % 2) * 17; x < VW; x += 34) g.fillRect(x, y - Math.round(9 * U), 1, Math.round(9 * U)); }
  g.fillStyle = '#d6a66a'; g.fillRect(0, wallB, VW, 2); g.fillStyle = '#3e2412'; g.fillRect(0, wallB - 3, VW, 3);
  return rsBgC = c;
}
function rsLights(T, cold) {      // the paper lanterns (they flicker and go out as the portal opens) and the window's light
  const U = rsLay().U; for (const fx of [0.31, 0.58, 0.83]) { const x = Math.round(VW * fx), y = Math.round(11 * U), on = 1 - cold * 0.9 + (cold > 0.2 ? Math.sin(T * 31 + fx * 40) * 0.25 * cold : 0); ctx.fillStyle = '#3e2412'; ctx.fillRect(x, 0, 1, y - 2); ctx.fillStyle = on > 0.4 ? '#c8402a' : '#5a2418'; ctx.fillRect(x - 5, y - 2, 11, Math.round(12 * U)); ctx.fillStyle = on > 0.4 ? '#ffb070' : '#7a3a28'; ctx.fillRect(x - 3, y, 7, Math.round(8 * U)); ctx.save(); ctx.globalCompositeOperation = 'lighter'; const gl = ctx.createRadialGradient(x, y + 6, 2, x, y + 6, 46 * U); gl.addColorStop(0, 'rgba(255,170,90,' + (0.3 * Math.max(0, on)).toFixed(3) + ')'); gl.addColorStop(1, 'rgba(255,170,90,0)'); ctx.fillStyle = gl; ctx.fillRect(x - 46 * U, 0, 92 * U, y + 60 * U); ctx.restore(); }
}

// ---- furniture
function rsTable(cx, w, lane, broken) {
  const L = rsLay(), y = L.top + lane, x0 = Math.round(cx - w / 2);
  if (broken) { ctx.fillStyle = '#8a5a32'; ctx.save(); ctx.translate(x0 + 3, gy + 7 + lane); ctx.rotate(-0.32); ctx.fillRect(0, 0, w * 0.55, 3); ctx.restore(); ctx.save(); ctx.translate(x0 + w * 0.52, gy + 10 + lane); ctx.rotate(0.5); ctx.fillRect(0, 0, w * 0.5, 3); ctx.restore(); ctx.fillStyle = '#5a3a1e'; ctx.fillRect(x0 + 1, gy + 10 + lane, 2, 5); ctx.fillRect(x0 + w - 7, gy + 12 + lane, 6, 2); return; }
  ctx.fillStyle = '#5a3a1e'; ctx.fillRect(x0 + 2, y + 3, 3, gy + 9 + lane - y); ctx.fillRect(x0 + w - 5, y + 3, 3, gy + 9 + lane - y); ctx.fillStyle = '#9a6a3c'; ctx.fillRect(x0, y, w, 3); ctx.fillStyle = '#c28a50'; ctx.fillRect(x0, y, w, 1); ctx.fillStyle = '#6a4226'; ctx.fillRect(x0, y + 3, w, 1);
}
function rsBowl(cx, lane, T, steam) {
  const y = rsLay().top + lane; ctx.fillStyle = '#f2efe6'; ctx.fillRect(cx - 5, y - 4, 10, 4); ctx.fillRect(cx - 4, y - 1, 8, 1); ctx.fillStyle = '#c0762a'; ctx.fillRect(cx - 4, y - 5, 8, 1); ctx.fillStyle = '#f0d890'; ctx.fillRect(cx - 3, y - 5, 2, 1); ctx.fillRect(cx + 1, y - 5, 2, 1);
  if (steam) { ctx.fillStyle = 'rgba(255,255,255,0.4)'; for (let i = 0; i < 3; i++) { const ph = (T * 0.8 + i * 0.33) % 1; ctx.fillRect(cx - 3 + i * 3 + Math.round(Math.sin(T * 2 + i) * 1.2), Math.round(y - 7 - ph * 9), 1, 2); } }
}
const rsSitC = new Map();
function rsSit(src) {      // a NEW picture of the same person sitting: the standing picture is cut at the hip, the upper body is lowered to the seat (14 pixels above the feet), a thigh runs forward and a shin down to a shoe, in the colours of his own trousers and shoes; .seat = the row of the hip
  let r = rsSitC.get(src); if (r) return r;
  const w = src.width, h = src.height, t = document.createElement('canvas'); t.width = w; t.height = h; const tg = t.getContext('2d'); tg.drawImage(src, 0, 0); const d = tg.getImageData(0, 0, w, h).data, at = (x, y) => (y * w + x) * 4;
  let top = -1, bot = -1; for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) if (d[at(x, y) + 3] > 40) { if (top < 0) top = y; bot = y; break; }
  const hip = top + Math.round(0.53 * (bot - top)), seat = bot - 15; let sx = 0, n = 0; for (let y = hip; y < hip + 7; y++) for (let x = 0; x < w; x++) if (d[at(x, y) + 3] > 40) { sx += x; n++; } const cx = Math.round(n ? sx / n : w / 2);
  const avg = (y0, y1) => { let R = 0, G = 0, B = 0, m = 0; for (let y = y0; y <= y1; y++) for (let x = 0; x < w; x++) { const i = at(x, y); if (d[i + 3] > 40) { R += d[i]; G += d[i + 1]; B += d[i + 2]; m++; } } return m ? [R / m, G / m, B / m] : [30, 30, 40]; }, rgb = (c, k) => 'rgb(' + Math.round(c[0] * k) + ',' + Math.round(c[1] * k) + ',' + Math.round(c[2] * k) + ')';
  const tr = avg(hip + 3, hip + 8), sh = avg(bot - 2, bot), c = document.createElement('canvas'); c.width = w; c.height = h; const g = c.getContext('2d');
  for (const [dx, k] of [[3, 0.68], [0, 1]]) { g.fillStyle = rgb(tr, k); g.fillRect(cx - 3 + dx, seat - 3, 18, 7); g.fillRect(cx + 10 + dx, seat, 6, bot - 3 - seat); g.fillStyle = rgb(tr, k * 0.7); g.fillRect(cx - 3 + dx, seat + 3, 18, 1); g.fillStyle = rgb(sh, k); g.fillRect(cx + 9 + dx, bot - 3, 10, 4); }
  g.drawImage(src, 0, top, w, hip - top, 0, top + seat - hip, w, hip - top); c.seat = seat; rsSitC.set(src, c); return c;
}
function rsStool(x, lane) {      // a stool with a red cushion; the hips of everyone sitting are 15 pixels above the floor line
  ctx.fillStyle = '#3e2412'; ctx.fillRect(x - 6, gy - 10 + lane, 2, 21); ctx.fillRect(x + 4, gy - 10 + lane, 2, 21); ctx.fillStyle = '#7a2a2a'; ctx.fillRect(x - 9, gy - 14 + lane, 18, 4); ctx.fillStyle = '#9a3a3a'; ctx.fillRect(x - 9, gy - 14 + lane, 18, 1);
}
function rsPerson(src, info, x, lane, flip, bob, mouth, alpha) {      // someone sitting: his new sitting picture (see rsSit), set so that his hip is on the cushion
  const S = rsSit(src), inf = info || { cx: 32, x0: 0, top: 0 }; ctx.save(); ctx.translate(0, lane); if (alpha < 1) ctx.globalAlpha = alpha; sprAt(S, inf, x, S.seat - 45 - (inf.top || 0) - bob, flip, mouth || 0); ctx.restore();
}

// ---- the dark things: the portal, the aura, the Master as a black shape with a red eye, shockwaves, the purple punch
function rsPortal(px, p, T) {
  if (p <= 0.01) return; const U = rsLay().U, cy = gy - Math.round(34 * U), rx = 15 * U * p, ry = 39 * U * p;
  ctx.save(); ctx.globalCompositeOperation = 'lighter'; const gl = ctx.createRadialGradient(px, cy, 2, px, cy, 72 * U * p); gl.addColorStop(0, 'rgba(130,45,190,0.4)'); gl.addColorStop(1, 'rgba(60,10,110,0)'); ctx.fillStyle = gl; ctx.fillRect(px - 80 * U, cy - 80 * U, 160 * U, 160 * U); ctx.restore();
  ctx.fillStyle = '#04010a'; ctx.beginPath(); ctx.ellipse(px, cy, rx, ry, 0, 0, 6.2832); ctx.fill();
  ctx.save(); ctx.beginPath(); ctx.ellipse(px, cy, rx, ry, 0, 0, 6.2832); ctx.clip(); for (let i = 0; i < 6; i++) { const a = T * (1.2 + i * 0.25) + i * 1.1, k = 0.25 + i * 0.13; ctx.strokeStyle = 'rgba(' + (110 + i * 18) + ',' + (30 + i * 8) + ',' + (170 + i * 12) + ',' + (0.6 - i * 0.06).toFixed(2) + ')'; ctx.lineWidth = 1; ctx.beginPath(); ctx.ellipse(px, cy, rx * k, ry * k, 0, a, a + 2.4); ctx.stroke(); } ctx.restore();
  ctx.strokeStyle = 'rgba(60,10,100,0.9)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.ellipse(px, cy, rx + 2, ry + 2, 0, 0, 6.2832); ctx.stroke(); ctx.strokeStyle = 'rgba(176,86,255,' + (0.75 + 0.15 * Math.sin(T * 9)).toFixed(2) + ')'; ctx.lineWidth = 2; ctx.beginPath(); ctx.ellipse(px, cy, rx, ry, 0, 0, 6.2832); ctx.stroke();
  ctx.fillStyle = '#c890ff'; for (let i = 0; i < 12; i++) { const ph = (T * 0.9 + i * 0.37) % 1, a = (i * 0.52 + T * 1.7) % 6.2832, r = 1 + ph * 12 * p; ctx.globalAlpha = 0.9 - ph * 0.9; ctx.fillRect(Math.round(px + Math.cos(a) * (rx + r)), Math.round(cy + Math.sin(a) * (ry + r * 1.6)), 1, 1); } ctx.globalAlpha = 1;
}
function rsAura(x, T, k, H) {      // a dark aura: black-violet smoke rising off him with thin violet edges
  if (k <= 0) return; const U = rsLay().U; ctx.save(); for (let i = 0; i < 18; i++) { const ph = (T * 0.45 + i * 0.173) % 1, ax = x + Math.sin(i * 2.1 + T * 0.8) * (9 + ph * 8) * U, ay = gy - ph * (H + 14 * U), r = (3 + ph * 7) * U * k; ctx.fillStyle = 'rgba(20,6,36,' + (0.55 * (1 - ph) * k).toFixed(3) + ')'; ctx.beginPath(); ctx.arc(ax, ay, r, 0, 6.2832); ctx.fill(); ctx.strokeStyle = 'rgba(140,55,210,' + (0.32 * (1 - ph) * k).toFixed(3) + ')'; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(ax, ay, r, 0.5, 2.2); ctx.stroke(); } ctx.restore();
}
function rsMaster(x, T, H, eyeK, walkK, arm, arm2) {      // the Master: a lanky, hunched human shape all in black (a wide-brimmed hat, a long neck, a short coat with tails, arms that hang to his knees with long thin fingers, long legs); no face, no detail, only one red eye; arm = { x, y } puts his near arm and hand out to that point (arm2: the other arm, a fist)
  const U = rsLay().U, s = H / 66, ph = T * 3.4, sw = Math.sin(ph) * walkK, top = gy - H + Math.round(Math.abs(Math.sin(ph)) * 0.8 * walkK), ln = 3 * s, Y = v => top + v * s, hx = x - 6 * s - ln;      // ln: how far he leans forward (to the left); hx: the middle of his head
  const draw = col => {
    ctx.fillStyle = col; ctx.strokeStyle = col; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    ctx.lineWidth = 3.2 * s; for (const [i, a] of [[0, sw], [1, -sw]]) { const px = x - 1 * s + i * 2.6 * s - ln * 0.4, kx = px + (a * 8 - 2) * s, fx = px + (a * 13 - 3) * s; ctx.beginPath(); ctx.moveTo(px, Y(39)); ctx.lineTo(kx, Y(53)); ctx.lineTo(fx, gy - 2); ctx.stroke(); ctx.fillRect(Math.round(fx - 5 * s), gy - Math.round(3 * s), Math.round(6 * s), Math.round(3 * s)); }      // the legs and the shoes
    ctx.beginPath(); ctx.moveTo(x - 10 * s - ln, Y(24)); ctx.lineTo(x + 6 * s - ln * 0.4, Y(23)); ctx.lineTo(x + 6 * s, Y(41)); ctx.lineTo(x - 7 * s, Y(41)); ctx.closePath(); ctx.fill();      // the hunched coat
    ctx.beginPath(); ctx.moveTo(x + 5 * s, Y(33)); ctx.lineTo(x + 13 * s + sw * 2 * s, Y(52)); ctx.lineTo(x + 8 * s, Y(50)); ctx.lineTo(x + 1 * s, Y(42)); ctx.closePath(); ctx.fill();      // the tails of the coat
    ctx.fillRect(Math.round(hx - 1.7 * s), Math.round(Y(19)), Math.round(3.4 * s), Math.round(6 * s));      // the long neck
    ctx.beginPath(); ctx.ellipse(hx, Y(14.5), 5.4 * s, 6.6 * s, 0, 0, 6.2832); ctx.fill(); ctx.beginPath(); ctx.moveTo(hx - 4 * s, Y(13)); ctx.lineTo(hx - 7.6 * s, Y(16)); ctx.lineTo(hx - 3.6 * s, Y(18)); ctx.closePath(); ctx.fill();      // the head and a sharp nose
    ctx.beginPath(); ctx.ellipse(hx, Y(8.6), 12.5 * s, 2.3 * s, -0.06, 0, 6.2832); ctx.fill(); ctx.beginPath(); ctx.moveTo(hx - 5.6 * s, Y(8.6)); ctx.lineTo(hx - 5 * s, Y(1.6)); ctx.quadraticCurveTo(hx - 4 * s, Y(0), hx - 1 * s, Y(0)); ctx.lineTo(hx + 3 * s, Y(0)); ctx.quadraticCurveTo(hx + 5.2 * s, Y(0.4), hx + 5.4 * s, Y(2.4)); ctx.lineTo(hx + 5.8 * s, Y(8.6)); ctx.closePath(); ctx.fill();      // the wide brim and the round crown of the hat
    const hand = (ax, ay, dx, dy) => { ctx.lineWidth = 1.1 * s; for (const a of [-0.45, 0, 0.45]) { const c = Math.cos(a), sn = Math.sin(a); ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo(ax + (dx * c - dy * sn) * 6 * s, ay + (dx * sn + dy * c) * 6 * s); ctx.stroke(); } };      // long thin fingers
    ctx.lineWidth = 2.6 * s; const ex0 = x - 8 * s - ln, ey0 = Y(26);
    if (arm) { ctx.beginPath(); ctx.moveTo(ex0, ey0); ctx.lineTo(arm.x + 4 * U, arm.y); ctx.stroke(); ctx.fillRect(Math.round(arm.x - 2 * U), Math.round(arm.y - 3 * U), Math.round(6 * U), Math.round(6 * U)); hand(arm.x - 2 * U, arm.y, -1, 0); }
    else { const ox = x - 11 * s - ln + sw * 2 * s, hxp = x - 10 * s - ln + sw * 3 * s; ctx.beginPath(); ctx.moveTo(ex0, ey0); ctx.lineTo(ox, Y(39)); ctx.lineTo(hxp, Y(52)); ctx.stroke(); hand(hxp, Y(52), 0, 1); }
    ctx.lineWidth = 2.4 * s; if (arm2) { ctx.lineWidth = 2.8 * s; ctx.beginPath(); ctx.moveTo(x + 3 * s, Y(27)); ctx.lineTo(arm2.x + 4 * U, arm2.y); ctx.stroke(); ctx.fillRect(Math.round(arm2.x - 4 * U), Math.round(arm2.y - 4 * U), Math.round(8 * U), Math.round(8 * U)); }
    else { ctx.beginPath(); ctx.moveTo(x + 3 * s, Y(27)); ctx.lineTo(x + 6 * s - sw * 2 * s, Y(51)); ctx.stroke(); hand(x + 6 * s - sw * 2 * s, Y(51), 0, 1); }
  };
  ctx.save(); ctx.translate(1, 0); draw('rgba(160,80,240,0.55)'); ctx.restore(); draw('#030208');
  msEye(hx - 3.2 * s, Y(14), Math.max(1, U * 0.9), eyeK, 0, 0);
}
function rsShock(cx, cy, age, R) {      // the HUGE shockwave: rings of white and violet running out, speed lines, a flash
  if (age < 0 || age > 1.5) return; const f = 1 - age / 1.5; ctx.save(); ctx.globalCompositeOperation = 'lighter';
  { const r = age * 240 * R; ctx.strokeStyle = 'rgba(190,130,255,' + (0.14 * f).toFixed(3) + ')'; ctx.lineWidth = Math.max(2, 26 * f * R); ctx.beginPath(); ctx.arc(cx, cy, r * 0.92, 0, 6.2832); ctx.stroke(); }
  for (let i = 0; i < 3; i++) { const a = f * (1 - i * 0.25); ctx.strokeStyle = i === 0 ? 'rgba(255,255,255,' + a.toFixed(3) + ')' : 'rgba(200,140,255,' + a.toFixed(3) + ')'; ctx.lineWidth = Math.max(1, (6 - i * 1.5) * f * R * 1.6); ctx.beginPath(); ctx.arc(cx, cy, age * (240 + i * 90) * R, 0, 6.2832); ctx.stroke(); }
  ctx.strokeStyle = 'rgba(230,200,255,' + (0.8 * f).toFixed(3) + ')'; ctx.lineWidth = 1; for (let i = 0; i < 30; i++) { const an = i * 0.2094 + 0.1, r0 = (24 + age * 180) * R, r1 = r0 + (26 + (i % 4) * 22) * R * f; ctx.beginPath(); ctx.moveTo(cx + Math.cos(an) * r0, cy + Math.sin(an) * r0); ctx.lineTo(cx + Math.cos(an) * r1, cy + Math.sin(an) * r1); ctx.stroke(); }
  ctx.restore(); if (age < 0.16) { ctx.fillStyle = 'rgba(255,255,255,' + (0.9 * (1 - age / 0.16)).toFixed(3) + ')'; ctx.fillRect(0, 0, VW, VH); }
}
function rsPurple(x, y, T, p, R) {      // HOLLOW PURPLE in his fist: a red and a blue orb circle in and merge into a purple sphere with black-violet lightning
  ctx.save(); ctx.globalCompositeOperation = 'lighter'; const gl = ctx.createRadialGradient(x, y, 1, x, y, (8 + 16 * p) * R); gl.addColorStop(0, 'rgba(255,200,255,' + (0.9 * p).toFixed(3) + ')'); gl.addColorStop(0.35, 'rgba(190,70,255,' + (0.7 * p).toFixed(3) + ')'); gl.addColorStop(1, 'rgba(90,20,180,0)'); ctx.fillStyle = gl; ctx.fillRect(x - 30 * R, y - 30 * R, 60 * R, 60 * R);
  const rr = (16 - 15 * p) * R, a = T * 9; ctx.fillStyle = 'rgba(255,60,70,0.95)'; ctx.fillRect(Math.round(x + Math.cos(a) * rr) - 1, Math.round(y + Math.sin(a) * rr) - 1, 3, 3); ctx.fillStyle = 'rgba(70,140,255,0.95)'; ctx.fillRect(Math.round(x - Math.cos(a) * rr) - 1, Math.round(y - Math.sin(a) * rr) - 1, 3, 3); ctx.restore();
  if (p > 0.5) { ctx.fillStyle = '#e8b8ff'; ctx.beginPath(); ctx.arc(x, y, (2 + 5 * p) * R, 0, 6.2832); ctx.fill(); ctx.fillStyle = '#2a0840'; ctx.beginPath(); ctx.arc(x, y, (1 + 2.5 * p) * R, 0, 6.2832); ctx.fill(); ctx.strokeStyle = 'rgba(210,140,255,0.9)'; ctx.lineWidth = 1; for (let i = 0; i < 4; i++) { const an = T * 7 + i * 1.57, r0 = (4 + 5 * p) * R; ctx.beginPath(); ctx.moveTo(x + Math.cos(an) * r0, y + Math.sin(an) * r0); ctx.lineTo(x + Math.cos(an + 0.3) * (r0 + 5 * R), y + Math.sin(an + 0.3) * (r0 + 4 * R)); ctx.lineTo(x + Math.cos(an - 0.1) * (r0 + 9 * R), y + Math.sin(an - 0.1) * (r0 + 8 * R)); ctx.stroke(); } }
}

// ---- Gojo seen from the side in a close-up (a profile made of curves, crisp edges, rim light): smirking (mood 0) or shocked (mood 1)
const rsRimC = new Map();
function rsRim(src, dir, col) {      // a rim of light along the edge of a picture that faces dir (1 = right, -1 = left): found from the picture's own shape
  const key = dir + col.join(), M = rsRimC.get(src) || (rsRimC.set(src, {}), rsRimC.get(src)); if (M[key]) return M[key];
  const w = src.width, h = src.height, a = src.getContext('2d').getImageData(0, 0, w, h).data, c = document.createElement('canvas'); c.width = w; c.height = h; const q = c.getContext('2d'), im = q.createImageData(w, h), o = im.data;
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { if (a[(y * w + x) * 4 + 3] < 128) continue; const e = (dx, dy) => { const xx = x + dx * dir, yy = y + dy; return xx < 0 || xx >= w || yy < 0 || yy >= h || a[(yy * w + xx) * 4 + 3] < 128; }; const v = e(1, 0) ? 1 : e(1, -1) ? 0.7 : e(2, 0) ? 0.45 : 0; if (v) { const i = (y * w + x) * 4; o[i] = col[0]; o[i + 1] = col[1]; o[i + 2] = col[2]; o[i + 3] = Math.round(255 * v); } }
  q.putImageData(im, 0, 0); return M[key] = c;
}
function rsSounds(T, st) {      // the sounds that belong to the clock of the scene (each fires once, in the first moments after its time)
  const ev = (k, t, f, win) => { if (T >= t && T < t + (win || 0.5)) once2(k, f); }, tP = rsT('portal'), tE = rsT('emerge'), tC = rsT('charge'), tPu = rsT('punch'), tL = rsT('launch'), cA = rsT('closeA'), cC = rsT('closeC');
  ev('mur', 0.05, () => snd('rsmur'), 1e9); if (T < tP) { const c = Math.floor(T / 2.3); if (c !== story.tn.ck) { story.tn.ck = c; if (T > 0.8) snd('rsclink'); } }
  ev('p0', tP + 0.1, () => { snd('rsportal'); snd('tmusicoff'); }); ev('p1', tP + 1.2, () => snd('rsmuroff'), 1e9);
  if (T >= tP + 1.5 && T < tC) { const b = Math.floor((T - tP - 1.5) / 1.05); if (b !== story.tn.bt) { story.tn.bt = b; snd('rsbeat'); } }
  if (T >= tE + 0.7 && T < tE + 4.9) { const s = Math.floor((T - tE - 0.7) / 1.15); if (s !== story.tn.st) { story.tn.st = s; snd('rsstep'); } }
  ev('chg', tC, () => snd('rscharge')); ev('pu0', tPu + 0.12, () => snd('rspunch', 0)); ev('pu1', cA + 0.08, () => snd('rspunch', 1)); ev('grabC', cC + 2.35, () => snd('rsgrab'));
  ev('gr', tL + RS_LAUNCH.grab, () => snd('rsgrab')); ev('pu2', tL + RS_LAUNCH.punch, () => snd('rspunch', 1));
}

// ---- the wide shots
function rsGeo() {      // where Gojo stands when his fist meets the Master's face, and how tall the Master is so that the fist meets his face: found from the real pictures (as the training finds where Yuji's fist ends)
  const L = rsLay(), U = L.U, f = atkF[0][ATK_IMPACT[0]], e = tnEdges(f), hx = D.atk0.cx - D.atk0.x0, tip = -hx + e.R, tipY = gy - 60 - (D.atk0.top || 0) + e.ry, H = Math.max(62 * U, (gy - tipY) * 1.28);
  return { gxC: L.FX - 15 * U - tip, tipY, tip, H, f };
}
function rsWide(now, dt, T, st, t1) {
  const L = rsLay(), U = L.U, G = rsGeo(), tP = rsT('portal'), tE = rsT('emerge'), tW = RS_SEQ.find(s => s.warn).t0, tC = rsT('charge'), tPu = rsT('punch'), tL = rsT('launch'), u = T - tL, k = st.k, last = T >= RS_SEQ.end - RS_SEQ[RS_SEQ.length - 1].d;
  const cold = clamp01((T - tP) / 3.2) * 0.5, open = ease3(clamp01((T - tP - 0.4) / 2.2)), nowMs = T * 1000, mx = Math.round(VW / 2);
  const V = RS_LAUNCH.v, uF = RS_LAUNCH.punch + 0.1, flying = u >= uF, uW = uF + (G.gxC - L.wall - 12) / V;
  const gxF = flying ? Math.max(L.wall + 12, G.gxC - V * (u - uF)) : G.gxC, hitW = u >= uW;      // Gojo's x in the flight (he stops at the wall)
  let zoom = 1, zx = G.gxC + G.tip, zy = G.tipY; if (k === 'punch' && t1 > 0.2) zoom = 1 + 2.4 * ease3((t1 - 0.2) / 0.5);
  let shk = 0; if (k === 'punch' && t1 > 0.12 && t1 < 0.5) shk = 3; if (k === 'launch') { if (u >= RS_LAUNCH.punch && u < RS_LAUNCH.punch + 0.5) shk = 4 * (1 - (u - RS_LAUNCH.punch) / 0.5); if (hitW) shk = Math.max(shk, 8 * Math.max(0, 1 - (u - uW) / 1.3)); }
  ctx.save(); if (zoom > 1) { ctx.translate(zx, zy); ctx.scale(zoom, zoom); ctx.translate(-zx, -zy); } if (shk > 0.2) ctx.translate(Math.round((Math.random() * 2 - 1) * shk), Math.round((Math.random() * 2 - 1) * shk));
  ctx.drawImage(rsBg(), 0, 0); rsLights(T, cold);
  // the people behind: two diners at the far table (they eat and notice nothing)
  { const bx = [Math.round(VW * 0.67), Math.round(VW * 0.75)], bl = L.back; rsTable((bx[0] + bx[1]) / 2, Math.round(18 * U), bl); rsBowl(bx[0] + 6, bl, T, true); for (let i = 0; i < 2; i++) { rsStool(bx[i], bl); rsPerson(HUM[3 + i].walk[0], null, bx[i], bl, i === 1, (T * 0.7 + i * 0.4) % 1 < 0.18 ? 1 : 0, 0, 1); } }
  rsPortal(L.PX, open * (1 - clamp01((T - (RS_SEQ.end - RS_SEQ[RS_SEQ.length - 1].d)) / 1.2)), T);
  if (open > 0.3) { ctx.save(); ctx.fillStyle = 'rgba(40,12,70,0.35)'; for (let i = 0; i < 10; i++) { const ph = (T * 0.3 + i * 0.1) % 1, fx = L.PX - ph * 120 * U * open, fy = gy + 6 + ((i * 7) % 12); ctx.globalAlpha = 0.55 * (1 - ph) * open; ctx.beginPath(); ctx.ellipse(fx, fy, 14 * U * (0.4 + ph), 2.5 * U, 0, 0, 6.2832); ctx.fill(); } ctx.restore(); }      // a low black fog creeps out of the portal along the floor
  // the diners in the way and their tables (the kills happen as Gojo's body passes)
  const hitN = (x) => flying && gxF <= x + 12, tAB = flying && gxF <= L.tx + 14;
  for (let i = 0; i < 2; i++) { const T0 = L.tbl[i], broken = i === 0 ? hitN(L.npc[1].x) : hitN(L.npc[2].x); rsTable(T0.x, T0.w, 0, broken); if (!broken) rsBowl(T0.x, 0, T, true); }
  L.npc.forEach((n, i) => { rsStool(n.x, 0); if (!hitN(n.x)) rsPerson(HUM[n.t].walk[0], null, n.x, 0, n.f, (T * 0.7 + i * 0.37) % 1 < 0.2 ? 1 : 0, 0, 1); });
  rsTable(L.tx, L.GX - L.YX - Math.round(14 * U), 0, tAB); if (!tAB) { rsBowl(L.tx - 6, 0, T, true); rsBowl(L.tx + 6, 0, T, true); }
  if (tAB) once2('tblA', () => snd('rssmash'));
  // Yuji: sits and eats on his stool (a new sitting picture), stands when Gojo does, steps up and is stopped by Gojo's hand, then backs away into the back row
  rsStool(L.YX, 0); { const a = T >= tW ? clamp01((T - tW) / 0.2) : 0, q = ease3(clamp01((T - tW - 0.2) / 0.4)), r = ease3(clamp01((T - tC) / 0.6)), yx = Math.round(L.YX + lerp(0, Math.round(11 * U), q) - lerp(0, Math.round(4 * U), r)), lane = Math.round(lerp(0, L.back, r)), mv = T >= tW + 0.2 && q < 1 ? 'fwd' : T >= tC && r < 1 ? 'back' : 'idle';
    const eat = T < tP + 0.5 && (T * 0.62 + 0.3) % 1 < 0.2 ? 1 : 0, idle = tnPick({ now: nowMs }), p = mv === 'idle' ? idle : tnPick({ idle: false, mode: mv, now: nowMs, modeAt: (mv === 'fwd' ? tW + 0.2 : tC) * 1000 });
    if (a < 1) rsPerson(idle.set[idle.fi], idle.info, L.YX, 0, false, eat, 0, 1 - a);
    if (a > 0) { ctx.save(); ctx.translate(0, lane); ctx.globalAlpha = a; shadow(yx, 9); sprAt(p.set[p.fi], p.info, yx, p.lift, false, 0); ctx.restore(); }
  }
  rsStool(L.GX, 0);
  // Gojo: sits facing Yuji, turns to the portal, stands with an arm out (to stop Yuji), runs with the purple punch, hits, is grabbed, is punched away
  { const gTalk = st.k === 'say' && st.w === 'GOJO' && t1 * TN_RATE < (st.a + st.b).length + 3, mouth = gTalk ? 1 + (Math.floor(T * 11) % 2) : 0, a = T >= tW ? clamp01((T - tW) / 0.2) : 0, flip = T < tP + 1.5;
    if (T < tC) {
      const eat = T < tP + 0.5 && (T * 0.62) % 1 < 0.2 ? 1 : 0, f = idleF[Math.floor(T * IDLE_FPS) % idleF.length];
      if (a < 1) rsPerson(f, D.idle, L.GX, 0, flip, eat, mouth, 1 - a);
      if (a > 0) { ctx.save(); ctx.globalAlpha = a; shadow(L.GX, 9); sprAt(f, D.idle, L.GX, 0, flip, mouth); ctx.restore(); }
      if (T >= tW + 0.45) { const a = ease3(clamp01((T - tW - 0.45) / 0.25)), sx = L.GX - 3 * U, sy = gy - 47 * U, ex = sx - 24 * U * a; ctx.strokeStyle = '#14141e'; ctx.lineWidth = Math.round(5 * U); ctx.lineCap = 'butt'; ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(ex, sy); ctx.stroke(); ctx.fillStyle = '#f1cfb8'; ctx.fillRect(Math.round(ex - 4 * U), Math.round(sy - 4 * U), Math.round(5 * U), Math.round(8 * U)); ctx.fillStyle = '#d8a88c'; for (let i = 0; i < 3; i++) ctx.fillRect(Math.round(ex - 6 * U), Math.round(sy - 3.5 * U + i * 2.6 * U), 2, 1); }      // the arm held out behind him, the palm open
    } else if (k === 'charge' || (k === 'punch') || (k === 'launch' && !flying)) {
      const rt = clamp01((T - tC) / (RS_SEQ.find(s => s.k === 'charge').d)), gx = Math.round(lerp(L.GX, G.gxC, ease3(rt))), run = k === 'charge' && rt < 1, fr = run ? RUNF[Math.floor((T - tC) * 30) % 15] : G.f, info = run ? D.run : D.atk0;
      for (let i = 3; i >= 1 && run; i--) { ctx.globalAlpha = 0.14 * (4 - i); ctx.drawImage(RUNF[Math.floor((T - tC) * 30) % 15], gx - i * 7 - (D.run.cx - D.run.x0), gy - 60 - (D.run.top || 0)); } ctx.globalAlpha = 1;
      shadow(gx, 9); sprAt(fr, info, gx, 0, false, 0); const px = run ? gx + 22 * U : G.gxC + G.tip, py = run ? gy - 44 * U : G.tipY, pp = k === 'launch' ? Math.max(0.2, 1 - u / 1.6) : clamp01(rt * 1.1);
      rsPurple(px, py, T, pp, U);
    } else if (flying) {
      const age = u - uF, ang = -Math.min(1.5, age * 8) + (hitW ? 0 : Math.sin(age * 9) * 0.06), src = idleF[0], hx = D.idle.cx - D.idle.x0, pivY = gy - 30;
      for (let i = 2; i >= 1 && !hitW; i--) { ctx.save(); ctx.globalAlpha = 0.14 * (3 - i); ctx.translate(gxF + i * 24, pivY); ctx.rotate(ang); ctx.drawImage(src, -hx, gy - 60 - (D.idle.top || 0) - pivY); ctx.restore(); }
      if (!hitW) { ctx.fillStyle = 'rgba(255,255,255,0.4)'; for (let i = 0; i < 6; i++) ctx.fillRect(Math.round(gxF + 16 + i * 4), Math.round(gy - 52 + i * 6), Math.round(40 + (i % 3) * 26), 1); }      // speed streaks
      ctx.save(); ctx.translate(gxF, hitW ? gy - 16 : pivY); ctx.rotate(hitW ? -1.5 : ang); ctx.drawImage(src, -hx, gy - 60 - (D.idle.top || 0) - pivY); ctx.restore();
    }
  }
  // the kills as his body passes each diner (the Cartoon Cat's gore), the dust and the cracks where he hits the wall
  if (u >= 0) { [2, 1, 0].forEach((ni, j) => { const n = L.npc[ni]; if (flying && gxF <= n.x + 12) once2('kill' + ni, () => { goreKill(RS_KILLS[j], n.x - mx, 10, -1, n.t, now); snd('rssmash'); }); }); if (hitW) { once2('wall', () => { snd('rswall'); }); rsWallFx(T, u - uW); } }
  drawBlood(now); drawGibs(now);
  // the Master: walks out of the portal, stands with his dark aura, grabs and punches
  if (T >= tE && !(T >= RS_SEQ.find(s => s.k === 'closeA').t0 && T < tL)) {
    const wk = clamp01((T - tE - 0.6) / 4.0), mxp = k === 'emerge' || T < tE + 4.6 ? Math.round(lerp(L.PX + 8 * U, L.FX, ease3(wk))) : L.FX, walking = T < tE + 4.6 && wk < 1, pulse = 0.85 + 0.12 * Math.sin(T * 2.3) + (k === 'say' ? 0.1 : 0);
    ctx.save(); if (T < tE + 3.0) { ctx.beginPath(); ctx.rect(0, 0, L.PX + 1, VH); ctx.clip(); } rsAura(mxp, T, ease3(clamp01((T - tE) / 2)), G.H); let arm = null, arm2 = null;
    if (k === 'launch') { const g0 = ease3(clamp01((u - RS_LAUNCH.grab) / 0.25)), tx = G.gxC + G.tip + 4 * U, q = u - RS_LAUNCH.punch; arm = u < RS_LAUNCH.grab ? null : { x: lerp(L.FX - 22 * U, tx, g0), y: G.tipY + 2 }; if (q > -0.2 && q < 0.35) arm2 = { x: lerp(L.FX - 18 * U, G.gxC + 12 * U, ease3(clamp01((q + 0.2) / 0.2))), y: gy - 38 * U }; }
    rsMaster(mxp, T, G.H, pulse, walking ? 1 : 0.2, arm, arm2); ctx.restore();
  }
  // the purple punch's shockwave in the wide shot (the close-ups follow at once)
  if (k === 'punch' && t1 > 0.12) rsShock(G.gxC + G.tip, G.tipY, t1 - 0.12, U * 0.6);
  if (k === 'launch' && u >= RS_LAUNCH.punch) rsShock(G.gxC + G.tip, G.tipY, u - RS_LAUNCH.punch, U * 0.9);
  // the room goes cold and dark as the portal opens
  if (cold > 0) { ctx.fillStyle = 'rgba(24,8,44,' + (cold * 0.8).toFixed(3) + ')'; ctx.fillRect(0, 0, VW, VH); }
  ctx.restore();
  // the speech (like the training's), the exclamation marks
  if (st.k === 'say') rsSay(st, t1);
  if (T >= tP + 1.5 && T < tP + 2.4) pxt('!', L.GX, gy - 66 * U, '#ff3a3a', 16, 'center'); if (T >= tE + 2.0 && T < tE + 2.9) pxt('!', L.YX, gy - 62 * U, '#ff3a3a', 16, 'center');
  const fo = last ? clamp01((T - (RS_SEQ.end - RS_SEQ[RS_SEQ.length - 1].d)) / (RS_SEQ[RS_SEQ.length - 1].d - 0.2)) : 0; if (fo > 0) { ctx.fillStyle = 'rgba(0,0,0,' + fo.toFixed(3) + ')'; ctx.fillRect(0, 0, VW, VH); const ez = fo < 1 ? 1 - ease3((fo - 0.3) / 0.7) : 0; msEye(L.FX - 12.2 * G.H / 66, gy - G.H + 14 * G.H / 66, Math.max(1, U * 0.9), 0.9 * ez, 0, 0); }
  const fi = 1 - clamp01(T / 1.2); if (fi > 0) { ctx.fillStyle = 'rgba(255,246,214,' + fi.toFixed(3) + ')'; ctx.fillRect(0, 0, VW, VH); }
}
function rsSay(st, t1) {      // the typed speech with a voice blip for each letter (the same as the training's)
  const n = Math.floor(t1 * TN_RATE), sp = st.a + st.b, i = RS_SEQ.indexOf(st); if (story.tn.vi !== i) { story.tn.vi = i; story.tn.vc = 0; } while (story.tn.vc < Math.min(n, sp.length)) { story.tn.vc++; if (sp[story.tn.vc - 1] !== ' ') snd('tvoice', st.w === 'GOJO' ? 0 : 1); } tnDlg(st.w, st.a, st.b, n);
}
function rsWallFx(T, a) {      // where Gojo hits the wall: cracks in the plaster, a cloud of dust, flying rubble
  const L = rsLay(), U = L.U, cx = L.wall + 4, cy = gy - 28 * U; ctx.save(); ctx.strokeStyle = '#2a1a10'; ctx.lineWidth = 1; for (let i = 0; i < 9; i++) { const an = i * 0.7 + 0.3, len = (14 + (i * 13) % 22) * U * clamp01(a * 8); ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + Math.cos(an) * len * 0.5 + (i % 2 ? 2 : -2), cy + Math.sin(an) * len * 0.5); ctx.lineTo(cx + Math.cos(an) * len, cy + Math.sin(an) * len); ctx.stroke(); }
  for (let i = 0; i < 26; i++) { const sp = 20 + (i * 17) % 60, an = -1.2 + (i % 13) * 0.2, x = cx + 6 + Math.cos(an) * sp * a * 1.6, y = cy + Math.sin(an) * sp * a * 1.2 + 90 * a * a, r = (3 + (i % 5) * 2 + a * 9) * U; ctx.fillStyle = 'rgba(' + (150 + (i % 3) * 14) + ',' + (126 + (i % 3) * 10) + ',100,' + (0.55 * Math.max(0, 1 - a / 2.2)).toFixed(3) + ')'; ctx.beginPath(); ctx.arc(x, y, r, 0, 6.2832); ctx.fill(); }
  ctx.fillStyle = '#4a3a2a'; for (let i = 0; i < 12; i++) { const sp = 40 + (i * 23) % 80, an = -0.9 + (i % 7) * 0.3, x = cx + 4 + Math.cos(an) * sp * a * 2, y = Math.min(gy + 12, cy + Math.sin(an) * sp * a * 2 + 240 * a * a); ctx.fillRect(Math.round(x), Math.round(y), 2 + (i % 3), 2); } ctx.restore();
}

// ---- the close-ups (the same side view as the Master's scene in chapter 1: dark, a rim of light on the edges, grain, cinema bars)
function rsCloseBg(T) {
  ctx.fillStyle = '#07040c'; ctx.fillRect(0, 0, VW, VH); const U = rsLay().U;
  for (let i = 0; i < 9; i++) { const bx = (i * 83 + 20) % VW, by = (i * 47 + 12) % Math.round(VH * 0.7), r = (7 + (i % 3) * 5) * U; ctx.fillStyle = 'rgba(' + (i % 2 ? '120,40,170' : '170,80,40') + ',' + (0.12 + 0.04 * Math.sin(T * 1.5 + i)).toFixed(3) + ')'; ctx.beginPath(); ctx.arc(bx, by, r, 0, 6.2832); ctx.fill(); }      // the shop's lanterns as dim blurs
  ctx.fillStyle = 'rgba(210,190,255,0.35)'; for (let i = 0; i < 24; i++) ctx.fillRect(Math.round((i * 53 + T * (4 + i % 5)) % VW), Math.round((i * 29 + T * (2 + i % 3)) % VH), 1, 1);
}
function rsSmoke(cx, cy, T, R) {      // black-violet smoke drifting round a head
  for (let i = 0; i < 14; i++) { const ph = (T * 0.4 + i * 0.21) % 1, a = i * 1.9 + T * 0.5, rr = (30 + ph * 40) * R; ctx.fillStyle = 'rgba(26,8,44,' + (0.5 * (1 - ph)).toFixed(3) + ')'; ctx.beginPath(); ctx.arc(cx + Math.cos(a) * rr * 0.9, cy + Math.sin(a) * rr * 0.7 - ph * 20 * R, (8 + ph * 12) * R, 0, 6.2832); ctx.fill(); }
}
const rsMFigC = new Map();
function rsMFig(k) {      // the Master's head and shoulders in profile, facing right, all black: a wide-brimmed hat with a round crown, a sharp nose, a long neck, hunched shoulders (it is mirrored when he faces left); .eye = where the red eye is, .pivot = his neck, .nose = the tip of his nose
  let r = rsMFigC.get(k); if (r) return r; const X = x => (x + 14) * k, Y = y => (y + 10) * k, W = Math.ceil(X(110)), H = Math.ceil(Y(172)), c = document.createElement('canvas'); c.width = W; c.height = H; const g = c.getContext('2d');
  const P = pts => { const p = new Path2D(); pts.forEach((q, i) => q.length === 2 ? (i ? p.lineTo(X(q[0]), Y(q[1])) : p.moveTo(X(q[0]), Y(q[1]))) : p.quadraticCurveTo(X(q[0]), Y(q[1]), X(q[2]), Y(q[3]))); p.closePath(); return p; };
  g.fillStyle = '#0b0912'; g.fill(P([[26, 30], [20, 40, 20, 62], [20, 90, 28, 104], [26, 118], [14, 126, 4, 140], [0, 170], [100, 170], [96, 160], [66, 134], [40, 122], [38, 104], [42, 102], [54, 108, 66, 104], [72, 98, 71, 89], [73, 84], [77, 82, 75, 78], [73, 74], [80, 75, 90, 73], [95, 66], [77, 57, 72, 46], [73, 38], [70, 31]]));
  g.beginPath(); g.ellipse(X(46), Y(28), 46 * k, 5.2 * k, -0.05, 0, 6.2832); g.fill(); g.fill(P([[24, 28], [24, 8, 30, 3], [34, 0, 44, 0], [56, 0, 63, 3], [68, 8, 68, 28]]));
  const id = g.getImageData(0, 0, W, H), d = id.data; for (let i = 0; i < W * H; i++) d[i * 4 + 3] = d[i * 4 + 3] >= 128 ? 255 : 0; g.putImageData(id, 0, 0);
  r = { B: c, w: W, h: H, eye: [X(63), Y(40)], pivot: [X(34), Y(112)], nose: [X(95), Y(66)] }; rsMFigC.set(k, r); return r;
}
function rsMasterHead(ex, ey, k, rot, shift, T, eyeG, flare) {      // the Master's head from the side, facing left, all black with a violet rim and a violet glow behind it; (ex, ey) = his eye when he is upright; rot = turned back (radians), shift = pushed back (pixels)
  const F = rsMFig(k), px = ex + (F.eye[0] - F.pivot[0]), py = ey + (F.pivot[1] - F.eye[1]);
  ctx.save(); ctx.globalCompositeOperation = 'lighter'; const gx = ex + 20 * k + shift * 0.6, gy1 = ey + 16 * k, bl = ctx.createRadialGradient(gx, gy1, 6 * k, gx, gy1, 96 * k); bl.addColorStop(0, 'rgba(120,56,176,0.5)'); bl.addColorStop(1, 'rgba(60,20,110,0)'); ctx.fillStyle = bl; ctx.fillRect(gx - 100 * k, gy1 - 100 * k, 200 * k, 200 * k); ctx.restore();
  ctx.save(); ctx.translate(px + shift, py); ctx.rotate(rot); ctx.translate(-px, -py); ctx.translate(ex, ey); ctx.scale(-1, 1); ctx.drawImage(F.B, -F.eye[0], -F.eye[1]);
  ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = 0.9; ctx.drawImage(rsRim(F.B, 1, [200, 110, 255]), -F.eye[0], -F.eye[1]); ctx.restore();
  const c = Math.cos(rot), s = Math.sin(rot), dx = ex - px, dy = ey - py; msEye(px + shift + c * dx - s * dy, py + s * dx + c * dy, k * 2.2, eyeG, 0, flare);
}
const rsZ = () => Math.max(2, Math.floor(VH * 0.9 / 40)), rsCropC = new Map();      // the enlargement of the close-ups of Gojo (whole pixels, so that the picture stays sharp)
function rsGoCrop(mood, Z, arm) {      // Gojo's close-up: his REAL picture (the one he punches in) cropped to his head, shoulders and fist and enlarged with hard pixels, nothing redrawn; mood 0: a smirk made of three pixels of the picture's own dark colour on his mouth, mood 1: his mouth open in shock
  const key = mood + ':' + Z + ':' + (arm ? 1 : 0); let r = rsCropC.get(key); if (r) return r;
  const f = atkF[0][ATK_IMPACT[0]], w = f.width, h = f.height, e = tnEdges(f), t = document.createElement('canvas'); t.width = w; t.height = h; const tg = t.getContext('2d'); tg.drawImage(f, 0, 0);
  const d = tg.getImageData(0, 0, w, h).data; let top = 0; for (let y = 0; y < h; y++) { let any = false; for (let x = 0; x < w; x++) if (d[(y * w + x) * 4 + 3] > 40) { any = true; break; } if (any) { top = y; break; } }
  const m = mouthOf(f) || { x: e.R - 8, y: top + 12 };
  const sk = tg.getImageData(m.x - 2, m.y - 1, 1, 1).data, skin = sk[3] > 200 ? 'rgb(' + sk[0] + ',' + sk[1] + ',' + sk[2] + ')' : '#eec9b1';
  if (mood === 0) { tg.fillStyle = skin; tg.fillRect(m.x - 1, m.y, 4, 1); tg.fillStyle = '#4a1422'; tg.fillRect(m.x - 1, m.y + 1, 2, 1); tg.fillRect(m.x + 1, m.y, 2, 1); tg.fillStyle = '#d9a98d'; tg.fillRect(m.x + 2, m.y - 1, 1, 1); } else { tg.fillStyle = '#3a0c14'; tg.fillRect(m.x, m.y, 3, 4); tg.fillStyle = '#ffffff'; tg.fillRect(m.x, m.y, 3, 1); tg.fillStyle = '#b8505a'; tg.fillRect(m.x + 1, m.y + 3, 1, 1); }
  const sx = Math.max(0, e.L - 1), sy = Math.max(0, top - 1), sw = Math.min(w - sx, e.R + 3 - sx), sh = Math.min(h - sy, 40), c = document.createElement('canvas'); c.width = sw * Z; c.height = sh * Z; const g = c.getContext('2d'); g.imageSmoothingEnabled = false; g.drawImage(t, sx, sy, sw, sh, 0, 0, sw * Z, sh * Z);
  if (arm) { const tipY0 = Math.round((e.ry - sy + 0.5) * Z), gr = g.createLinearGradient(c.width * 0.5, 0, c.width * 0.64, 0); gr.addColorStop(0, 'rgba(0,0,0,1)'); gr.addColorStop(1, 'rgba(0,0,0,0)'); g.globalCompositeOperation = 'destination-out'; g.fillStyle = gr; g.fillRect(0, 0, c.width * 0.64, c.height); g.fillStyle = '#000'; g.fillRect(0, 0, c.width, Math.max(0, tipY0 - 3 * Z)); g.globalCompositeOperation = 'source-over'; }
  r = { c, Z, sw, sh, tipX: (e.R + 1 - sx) * Z, tipY: Math.round((e.ry - sy + 0.5) * Z), mouth: [(m.x - sx) * Z, (m.y - sy) * Z] }; rsCropC.set(key, r); return r;
}
function rsFistGlow(x, y, k, glow, T) {      // the purple light and the crackling round his fist
  ctx.save(); ctx.globalCompositeOperation = 'lighter'; const gl = ctx.createRadialGradient(x, y, 2, x, y, (16 + 14 * glow) * k * 1.4); gl.addColorStop(0, 'rgba(255,190,255,' + (0.85 * glow).toFixed(3) + ')'); gl.addColorStop(0.4, 'rgba(180,60,255,' + (0.6 * glow).toFixed(3) + ')'); gl.addColorStop(1, 'rgba(80,10,160,0)'); ctx.fillStyle = gl; ctx.fillRect(x - 50 * k, y - 50 * k, 100 * k, 100 * k); ctx.restore();
  ctx.strokeStyle = 'rgba(220,150,255,' + (0.7 * glow).toFixed(3) + ')'; ctx.lineWidth = 1; for (let i = 0; i < 5; i++) { const an = T * 11 + i * 1.3, r0 = 8 * k, r1 = (22 + (i % 3) * 8) * k; ctx.beginPath(); ctx.moveTo(x + Math.cos(an) * r0, y + Math.sin(an) * r0); ctx.lineTo(x + Math.cos(an + 0.25) * (r0 + r1) / 2, y + Math.sin(an + 0.25) * (r0 + r1) / 2 + 2); ctx.lineTo(x + Math.cos(an - 0.1) * r1, y + Math.sin(an - 0.1) * r1); ctx.stroke(); }
}
function rsCloseA(T, u) {      // Gojo (his own picture, enlarged) smirks; the fist is on the Master's face; his head is thrown back and a HUGE shockwave runs out
  const U = rsLay().U, Z = rsZ(), G = rsGoCrop(0, Z), kM = Z * 0.26, F = rsMFig(kM), Cx = Math.round(VW * 0.56), Cy = Math.max(Math.round(VH * 0.58), Math.round(VH * 0.1) + 9 + G.tipY), snap = ease3(clamp01(u / 0.35)), shk = u < 1 ? 6 * (1 - u) : 0, zk = 1 + 0.07 * clamp01(u / 3.4);
  ctx.save(); ctx.translate(Cx, Cy); ctx.scale(zk, zk); ctx.translate(-Cx, -Cy); if (shk > 0.2) ctx.translate(Math.round((Math.random() * 2 - 1) * shk), Math.round((Math.random() * 2 - 1) * shk));
  rsSmoke(Cx + 70 * U, Cy - 10 * U, T, U); rsMasterHead(Cx + 3 + Math.round(F.nose[0] - F.eye[0]), Cy - Math.round((F.nose[1] - F.eye[1]) * 0.8), kM, 0.34 * snap, Math.round(30 * snap), T, 1.0 + 0.6 * (1 - snap), 1);
  ctx.drawImage(G.c, Math.round(Cx - G.tipX + 3 * snap), Math.round(Cy - G.tipY)); rsFistGlow(Cx, Cy, Z * 0.34, 1, T);
  ctx.restore(); if (u < 0.6) { const q = u / 0.6, sc = 1.03 + 0.07 * (1 - q); ctx.save(); ctx.globalAlpha = 0.42 * (1 - q); ctx.drawImage(ctx.canvas, 0, 0, VW, VH, Cx - Cx * sc, Cy - Cy * sc, VW * sc, VH * sc); ctx.restore(); }      // a blur of the picture rushing out from the blow
  rsShock(Cx, Cy, u, U * 1.4);
}
function rsCloseB(T, u) {      // the Master's head comes back, pushing against the fist that is still on his face (only Gojo's forearm and fist are in this picture)
  const U = rsLay().U, Z = rsZ(), G = rsGoCrop(0, Z, true), kM = Z * 0.34, F = rsMFig(kM), Cx = Math.round(VW * 0.36), Cy = Math.round(VH * 0.58), q = ease3(clamp01((u - 0.5) / 1.8));
  rsSmoke(Cx + 60 * U, Cy - 6 * U, T, U * 1.2); rsMasterHead(Cx + 3 + Math.round(F.nose[0] - F.eye[0]), Cy - Math.round((F.nose[1] - F.eye[1]) * 0.8), kM, 0.34 * (1 - q), Math.round(34 * (1 - q)), T, 1.0 + 0.25 * Math.sin(T * 5), 0.2 + 0.8 * q);
  const jx = Math.round((Math.random() - 0.5) * 1.8), jy = Math.round((Math.random() - 0.5) * 1.8); ctx.drawImage(G.c, Cx - G.tipX + jx, Cy - G.tipY + jy); rsFistGlow(Cx, Cy, Z * 0.34, 0.85 - 0.3 * q, T);
}
function rsHand(x, y, k, hand) {      // the Master's hand closing round Gojo's fist: a black sleeve, a palm and four long thin fingers with a violet rim; hand 0 = open and far away, 1 = closed
  const ink = '#030208', rim = 'rgba(200,120,255,0.9)', open = 1 - hand, R = Math.round;
  ctx.save(); ctx.translate(R(open * 50 * k), 0); ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  ctx.fillStyle = ink; ctx.fillRect(R(x + 6 * k), R(y - 11 * k), VW, R(22 * k)); ctx.fillRect(R(x + 18 * k), R(y - 15 * k), VW, R(30 * k)); ctx.fillStyle = rim; ctx.fillRect(R(x + 6 * k), R(y - 11 * k), VW, 1); ctx.fillRect(R(x + 18 * k), R(y - 15 * k), VW, 1);
  ctx.beginPath(); ctx.ellipse(x + 5 * k, y, 11 * k, 12.5 * k, 0, 0, 6.2832); ctx.fillStyle = ink; ctx.fill();
  for (let i = 0; i < 4; i++) {
    const s = i - 1.5, bx = x + 3 * k, by = y + s * 6.5 * k, a1 = Math.PI - s * 0.5 * open, a2 = a1 + s * (0.5 * open + 0.85 * hand), p1x = bx + Math.cos(a1) * 13 * k, p1y = by + Math.sin(a1) * 13 * k, p2x = p1x + Math.cos(a2) * 10 * k, p2y = p1y + Math.sin(a2) * 10 * k;
    for (let pass = 0; pass < 2; pass++) { const o = pass ? 0 : 0.8; ctx.strokeStyle = pass ? ink : rim; ctx.lineWidth = (pass ? 4.4 : 5.6) * k; ctx.beginPath(); ctx.moveTo(bx, by - o); ctx.lineTo(p1x, p1y - o); ctx.lineTo(p2x, p2y - o); ctx.stroke(); }
  }
  ctx.restore();
}
function rsCloseC(T, u) {      // Gojo (his own picture, enlarged) is shocked; his fist is still out; the Master's hand closes round it
  const U = rsLay().U, Z = rsZ(), G = rsGoCrop(1, Z), Cx = Math.round(VW * 0.80), Cy = Math.max(Math.round(VH * 0.60), Math.round(VH * 0.1) + 9 + G.tipY), hand = ease3(clamp01((u - 2.0) / 0.35)), jit = u > 2.3 ? 1.4 : 0.8;
  const jx = Math.round((Math.random() - 0.5) * 2), jy = Math.round((Math.random() - 0.5) * 2), gx = Math.round(Cx - G.tipX) + jx, gy0 = Math.round(Cy - G.tipY) + jy, hx = gx + G.mouth[0] - 2 * Z, hy = gy0 + G.mouth[1] - 6 * Z;
  ctx.save(); ctx.strokeStyle = 'rgba(235,225,255,' + (0.5 + 0.25 * Math.sin(T * 40)).toFixed(3) + ')'; ctx.lineWidth = 1; for (let i = 0; i < 26; i++) { const an = i * 0.2417, r0 = (34 + (i % 3) * 6) * Z, r1 = r0 + (22 + (i % 4) * 10) * Z; ctx.beginPath(); ctx.moveTo(hx + Math.cos(an) * r0, hy + Math.sin(an) * r0); ctx.lineTo(hx + Math.cos(an) * r1, hy + Math.sin(an) * r1); ctx.stroke(); } ctx.restore();      // shock lines
  ctx.drawImage(G.c, gx, gy0); rsFistGlow(Cx, Cy, Z * 0.34, u > 2.35 ? 0.4 + 0.5 * Math.random() : 0.75, T);
  const dy = (T * 30) % 26; ctx.fillStyle = 'rgba(190,232,255,' + (0.95 - dy / 30).toFixed(3) + ')'; ctx.fillRect(gx + G.mouth[0] - 7 * Z, gy0 + G.mouth[1] - 10 * Z + Math.round(dy), Math.round(Z * 0.8), Math.round(Z * 1.2)); ctx.fillRect(gx + G.mouth[0] - 7 * Z, gy0 + G.mouth[1] - 10 * Z + Math.round(dy) - Math.round(Z * 0.8), Math.max(1, Math.round(Z * 0.4)), Math.round(Z * 0.8));      // a drop of sweat runs down his temple
  if (hand > 0) { rsHand(Cx, Cy, Z / 3, hand); if (u > 2.35) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = 'rgba(255,255,255,' + clamp01(1 - (u - 2.35) / 0.2).toFixed(3) + ')'; ctx.fillRect(0, 0, VW, VH); ctx.restore(); } }
}
function rsClose(now, T, st, t1) {
  rsCloseBg(T); if (st.k === 'closeA') rsCloseA(T, t1); else if (st.k === 'closeB') rsCloseB(T, t1); else rsCloseC(T, t1);
  msFinish(1); const fl = clamp01(1 - t1 / 0.14); if (fl > 0) { ctx.fillStyle = (st.k === 'closeA' ? 'rgba(255,255,255,' : 'rgba(0,0,0,') + (fl * 0.9).toFixed(3) + ')'; ctx.fillRect(0, 0, VW, VH); }
}

// ---- the scene: start, frame, taps, the card
function startRest(now) {
  if (!HUM) HUM = makeHumans(document); story.tn = { rest: true, ck: -1, bt: -1, st: -1, vc: 0, vi: -1 }; story.t0 = now; story.T = 0; story.ev = {}; story.battle = false; alley = false; court = false; track = false; wx = 0;
  gibs.length = drops.length = decals.length = pools.length = fount.length = flashes.length = 0;
}
function restFrame(now, dt) {
  const T = Math.max(0, now - story.t0) / 1000; story.T = T; if (T >= RS_CARD + 0.3) { rsCard(now, T); return; }
  const st = RS_SEQ.find(s => T >= s.t0 && T < s.t0 + s.d) || RS_SEQ[RS_SEQ.length - 1], t1 = T - st.t0;
  ctx.save(); ctx.imageSmoothingEnabled = false; ctx.fillStyle = '#000'; ctx.fillRect(0, 0, VW, VH); updateGore(now, dt); rsSounds(T, st);
  if (st.k === 'closeA' || st.k === 'closeB' || st.k === 'closeC') rsClose(now, T, st, t1); else rsWide(now, dt, T, st, t1);
  ctx.restore();
}
function rsCard(now, T) {      // END OF CHAPTER 2
  const t = T - (RS_CARD + 0.3); ctx.save(); ctx.imageSmoothingEnabled = false; ctx.fillStyle = '#000'; ctx.fillRect(0, 0, VW, VH); once2('card', () => { snd('msting'); storyDone4(); }); ctx.globalAlpha = clamp01((t + 0.1) / 1.0);
  pxt('END OF CHAPTER 2', VW / 2, Math.round(VH / 2) - 2, '#ffffff', 16, 'center'); pxt('TO BE CONTINUED', VW / 2, Math.round(VH / 2) + 20, '#ffd34d', 8, 'center'); if (t > 2.2 && Math.floor(now / 600) % 2 === 0) pxt('TAP TO CONTINUE', VW / 2, VH - 8, '#9d8cff', 8, 'center'); ctx.globalAlpha = 1; ctx.restore();
}
function restSkip() {      // a tap: on to the next step; on the card (after its first 1.2 s) back to the saves
  const T = story.T; if (T >= RS_CARD + 0.3 + 1.2) { show('saves'); renderSaves(); return; }
  const n = RS_CUTS.concat([RS_CARD + 0.3]).find(c => c > T + 0.05); if (n !== undefined) story.t0 = pnow() - n * 1000;
}
