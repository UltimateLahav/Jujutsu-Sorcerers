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
  const v = { U, YX: Math.round(VW * 0.37), GX: Math.round(VW * 0.535), SD: Math.round(14 * U), seat: gy - Math.round(11 * U), top: gy - Math.round(27 * U), PX: VW - Math.round(24 * U), FX: 0, back: -Math.round(9 * U), wall: Math.round(7 * U) };
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
function rsSeat(x, lane, draw) {      // someone sits: his picture (painted lowered by SD pixels) is cut off at the seat, then the cushion and the stool
  const L = rsLay(); ctx.save(); ctx.beginPath(); ctx.rect(x - 40, 0, 80, L.seat + lane); ctx.clip(); draw(); ctx.restore();
  ctx.fillStyle = '#3e2412'; ctx.fillRect(x - 6, L.seat + lane + 4, 2, gy + 10 + lane - L.seat - 4); ctx.fillRect(x + 4, L.seat + lane + 4, 2, gy + 10 + lane - L.seat - 4); ctx.fillStyle = '#7a2a2a'; ctx.fillRect(x - 9, L.seat + lane, 18, 4); ctx.fillStyle = '#9a3a3a'; ctx.fillRect(x - 9, L.seat + lane, 18, 1);
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
function rsMasterPath(x, top, U, sw) {      // the Master facing left: a hood with a peaked front, a long cloak down to the floor with a wavy hem
  const p = new Path2D(); p.moveTo(x - 3 * U, top); p.quadraticCurveTo(x - 11 * U, top + 1 * U, x - 12.5 * U, top + 12 * U); p.lineTo(x - 14.5 * U, top + 16 * U); p.lineTo(x - 11 * U, top + 20 * U); p.quadraticCurveTo(x - 15 * U + sw, top + 34 * U, x - 20 * U + sw, gy + 1);
  for (let i = 0; i < 6; i++) p.lineTo(x - 20 * U + sw + (i + 1) * 6.6 * U, gy + 1 + (i % 2 ? 0 : -2)); p.quadraticCurveTo(x + 15 * U, top + 36 * U, x + 11 * U, top + 22 * U); p.quadraticCurveTo(x + 14 * U, top + 10 * U, x + 6 * U, top + 1 * U); p.closePath(); return p;
}
function rsMaster(x, T, H, eyeK, walkK, arm, arm2) {      // black, no face, no detail: only the eye glows; arm = { x, y } puts his sleeve and hand out to that point (arm2: the other arm, the fist that strikes)
  const U = rsLay().U, sw = Math.sin(T * 3.4) * 1.8 * walkK, top = gy - H + Math.round(Math.sin(T * 3.4) * 0.7 * walkK), p = rsMasterPath(x, top, U, sw);
  ctx.save(); ctx.translate(1, 0); ctx.fillStyle = 'rgba(160,80,240,0.55)'; ctx.fill(p); ctx.restore(); ctx.fillStyle = '#030208'; ctx.fill(p);
  if (arm) { ctx.strokeStyle = '#030208'; ctx.lineWidth = 5 * U; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(x - 10 * U, top + 24 * U); ctx.lineTo(arm.x + 4 * U, arm.y); ctx.stroke(); ctx.fillStyle = '#030208'; ctx.fillRect(arm.x - 3 * U, arm.y - 4 * U, 7 * U, 8 * U); ctx.strokeStyle = 'rgba(176,86,255,0.7)'; ctx.lineWidth = 1; ctx.strokeRect(arm.x - 3 * U + 0.5, arm.y - 4 * U + 0.5, 7 * U, 8 * U); }
  if (arm2) { ctx.strokeStyle = '#030208'; ctx.lineWidth = 5 * U; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(x - 8 * U, top + 30 * U); ctx.lineTo(arm2.x + 4 * U, arm2.y); ctx.stroke(); ctx.fillStyle = '#030208'; ctx.fillRect(arm2.x - 4 * U, arm2.y - 4 * U, 8 * U, 8 * U); }
  msEye(x - 9 * U, top + 11.5 * U, Math.max(1, U * 0.9), eyeK, 0, 0);
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
const rsGoC = new Map();
function rsGoFig(k, mood) {
  const key = Math.round(k * 1000) + ':' + mood; let r = rsGoC.get(key); if (r) return r;
  const X = x => (x + 10) * k, Y = y => (y + 10) * k, W = Math.ceil(X(122)), H = Math.ceil(Y(170)), mk = () => { const c = document.createElement('canvas'); c.width = W; c.height = H; return c; };
  const B = mk(), g = B.getContext('2d'), P = (pts, close = true) => { const p = new Path2D(); pts.forEach((q, i) => q.length === 2 ? (i ? p.lineTo(X(q[0]), Y(q[1])) : p.moveTo(X(q[0]), Y(q[1]))) : p.quadraticCurveTo(X(q[0]), Y(q[1]), X(q[2]), Y(q[3]))); if (close) p.closePath(); return p; };
  const skin = P([[34, 170], [34, 130], [26, 120, 24, 104], [14, 86, 18, 64], [24, 40, 48, 30], [72, 24, 86, 38], [94, 48, 95, 60], [97, 67], [99, 75, 108, 86], [108, 90], [101, 92, 95, 92], [96, 97], [97, 100, 95, 103], [93, 105], [93, 113, 89, 119], [82, 127, 68, 125], [60, 127], [56, 140, 58, 170]]);
  g.fillStyle = '#f1cfb8'; g.fill(skin);
  g.fillStyle = '#101018'; g.fill(P([[24, 124], [44, 118, 66, 122], [70, 170], [24, 170]]));      // the black collar
  g.fillStyle = '#d8a88c'; g.beginPath(); g.ellipse(X(46), Y(90), 5 * k, 9 * k, 0, 0, 6.2832); g.fill();      // the ear
  g.fillStyle = '#0c0c14'; g.fill(P([[14, 60], [98, 62], [99, 72], [14, 71]]));      // the blindfold
  g.fillStyle = '#2a2a3a'; g.fillRect(X(18), Y(63), 80 * k, Math.max(1, k * 0.8));
  const hr = g.createLinearGradient(0, Y(0), 0, Y(70)); hr.addColorStop(0, '#fbfcff'); hr.addColorStop(1, '#b9c6e2'); g.fillStyle = hr;      // the white spiky hair
  g.fill(P([[18, 70], [4, 58], [16, 52], [6, 36], [22, 40], [18, 22], [32, 30], [32, 10], [44, 24], [54, 4], [62, 22], [76, 6], [78, 26], [94, 16], [90, 36], [102, 38], [96, 52], [90, 46, 80, 42], [60, 36, 42, 42], [24, 54, 20, 74]]));
  g.strokeStyle = '#8a98bc'; g.lineWidth = Math.max(1, k * 0.9); g.beginPath(); for (const [a, b, c, d] of [[30, 30, 32, 44], [54, 10, 56, 38], [76, 14, 76, 38], [92, 24, 90, 44]]) { g.moveTo(X(a), Y(b)); g.lineTo(X(c), Y(d)); } g.stroke();
  g.save(); g.globalCompositeOperation = 'source-atop'; const sh = g.createLinearGradient(X(20), 0, X(100), 0); sh.addColorStop(0, 'rgba(150,90,70,0.38)'); sh.addColorStop(0.55, 'rgba(150,90,70,0)'); g.fillStyle = sh; g.fillRect(0, Y(70), W, Y(60)); g.fillStyle = 'rgba(150,90,70,0.3)'; g.beginPath(); g.moveTo(X(100), Y(90)); g.lineTo(X(94), Y(92)); g.lineTo(X(98), Y(86)); g.fill(); g.fillStyle = 'rgba(120,70,60,0.28)'; g.fillRect(X(56), Y(118), 40 * k, 12 * k); g.restore();      // the shade of the cheek, under the nose and under the jaw
  g.fillStyle = '#d08a84'; g.fill(P([[94, 97], [97.5, 98.5], [96, 101], [92, 100.5]])); g.fillStyle = '#c47a76'; g.fill(P([[92, 101], [96, 101.5], [94.5, 105], [91, 104]]));      // the lips
  if (mood === 0) { g.strokeStyle = '#4a1e22'; g.lineWidth = Math.max(1.2, k * 1.7); g.lineCap = 'round'; g.beginPath(); g.moveTo(X(95.5), Y(101)); g.quadraticCurveTo(X(89), Y(103.5), X(83), Y(95.5)); g.stroke(); g.lineWidth = Math.max(1, k * 1.1); g.beginPath(); g.moveTo(X(83), Y(95.5)); g.lineTo(X(81), Y(91)); g.stroke(); g.beginPath(); g.moveTo(X(79), Y(98)); g.quadraticCurveTo(X(82), Y(98), X(84), Y(94)); g.stroke(); g.fillStyle = '#ffffff'; g.fillRect(X(90.5), Y(100.6), 4 * k, Math.max(1, 1.3 * k)); }      // the smirk: a line running up into the cheek, a crease, a flash of teeth
  else { g.fillStyle = '#3a0c14'; g.fill(P([[96, 97.5], [89, 100.5], [88, 106], [94.5, 109]])); g.fillStyle = '#ffffff'; g.fillRect(X(90), Y(100), 5 * k, Math.max(1, 1.7 * k)); g.fillStyle = '#a84a52'; g.fillRect(X(90), Y(105), 4 * k, Math.max(1, 1.6 * k)); }      // shocked: the mouth open inside the profile (teeth, a tongue)
  const id = g.getImageData(0, 0, W, H), d = id.data, A = new Uint8Array(W * H); for (let i = 0; i < W * H; i++) { A[i] = d[i * 4 + 3] >= 128 ? 1 : 0; d[i * 4 + 3] = A[i] * 255; } g.putImageData(id, 0, 0);
  const rim = (dir, col) => { const c = mk(), q = c.getContext('2d'), im = q.createImageData(W, H), o = im.data; for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) { if (!A[y * W + x]) continue; const e = (dx, dy) => { const xx = x + dx * dir, yy = y + dy; return xx < 0 || xx >= W || yy < 0 || yy >= H || !A[yy * W + xx]; }; const v = e(1, 0) ? 1 : e(1, -1) ? 0.7 : e(2, 0) ? 0.45 : 0; if (v) { const i = (y * W + x) * 4; o[i] = col[0]; o[i + 1] = col[1]; o[i + 2] = col[2]; o[i + 3] = Math.round(255 * v); } } q.putImageData(im, 0, 0); return c; };
  r = { B, R: rim(1, [200, 120, 255]), w: W, h: H, nose: [X(108), Y(88)], temple: [X(60), Y(48)], mouth: [X(96), Y(102)] }; rsGoC.set(key, r); return r;
}

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
  const L = rsLay(), U = L.U, f = atkF[0][ATK_IMPACT[0]], e = tnEdges(f), hx = D.atk0.cx - D.atk0.x0, tip = -hx + e.R, tipY = gy - 60 - (D.atk0.top || 0) + e.ry, H = Math.max(58 * U, gy - tipY + 13 * U);
  return { gxC: L.FX - 13 * U - tip, tipY, tip, H, f };
}
function rsWide(now, dt, T, st, t1) {
  const L = rsLay(), U = L.U, G = rsGeo(), tP = rsT('portal'), tE = rsT('emerge'), tW = RS_SEQ.find(s => s.warn).t0, tC = rsT('charge'), tPu = rsT('punch'), tL = rsT('launch'), u = T - tL, k = st.k, last = T >= RS_SEQ.end - RS_SEQ[RS_SEQ.length - 1].d;
  const cold = clamp01((T - tP) / 3.2) * 0.5, open = ease3(clamp01((T - tP - 0.4) / 2.2)), nowMs = T * 1000, mx = Math.round(VW / 2);
  const V = RS_LAUNCH.v, uF = RS_LAUNCH.punch + 0.1, flying = k === 'launch' && u >= uF, uW = uF + (G.gxC - L.wall - 12) / V;
  const gxF = flying ? Math.max(L.wall + 12, G.gxC - V * (u - uF)) : G.gxC, hitW = k === 'launch' && u >= uW;      // Gojo's x in the flight (he stops at the wall)
  let zoom = 1, zx = G.gxC + G.tip, zy = G.tipY; if (k === 'punch' && t1 > 0.2) zoom = 1 + 2.4 * ease3((t1 - 0.2) / 0.5);
  let shk = 0; if (k === 'punch' && t1 > 0.12 && t1 < 0.5) shk = 3; if (k === 'launch') { if (u >= RS_LAUNCH.punch && u < RS_LAUNCH.punch + 0.5) shk = 4 * (1 - (u - RS_LAUNCH.punch) / 0.5); if (hitW) shk = Math.max(shk, 8 * Math.max(0, 1 - (u - uW) / 1.3)); }
  ctx.save(); if (zoom > 1) { ctx.translate(zx, zy); ctx.scale(zoom, zoom); ctx.translate(-zx, -zy); } if (shk > 0.2) ctx.translate(Math.round((Math.random() * 2 - 1) * shk), Math.round((Math.random() * 2 - 1) * shk));
  ctx.drawImage(rsBg(), 0, 0); rsLights(T, cold);
  // the people behind: two diners at the far table (they eat and notice nothing)
  { const bx = [Math.round(VW * 0.67), Math.round(VW * 0.75)], bl = L.back; rsTable((bx[0] + bx[1]) / 2, Math.round(18 * U), bl); rsBowl(bx[0] + 6, bl, T, true); for (let i = 0; i < 2; i++) rsSeat(bx[i], bl, () => vsp(HUM[3 + i].walk[0], bx[i], -L.SD - ((T * 0.7 + i * 0.4) % 1 < 0.18 ? 1 : 0), i === 1)); }
  rsPortal(L.PX, open * (1 - clamp01((T - (RS_SEQ.end - RS_SEQ[RS_SEQ.length - 1].d)) / 1.2)), T);
  if (open > 0.3) { ctx.save(); ctx.fillStyle = 'rgba(40,12,70,0.35)'; for (let i = 0; i < 10; i++) { const ph = (T * 0.3 + i * 0.1) % 1, fx = L.PX - ph * 120 * U * open, fy = gy + 6 + ((i * 7) % 12); ctx.globalAlpha = 0.55 * (1 - ph) * open; ctx.beginPath(); ctx.ellipse(fx, fy, 14 * U * (0.4 + ph), 2.5 * U, 0, 0, 6.2832); ctx.fill(); } ctx.restore(); }      // a low black fog creeps out of the portal along the floor
  // the diners in the way and their tables (the kills happen as Gojo's body passes)
  const hitN = (x) => flying && gxF <= x + 12, tAB = flying && gxF <= L.tx + 14;
  for (let i = 0; i < 2; i++) { const T0 = L.tbl[i], broken = i === 0 ? hitN(L.npc[1].x) : hitN(L.npc[2].x); rsTable(T0.x, T0.w, 0, broken); if (!broken) rsBowl(T0.x, 0, T, true); }
  L.npc.forEach((n, i) => { if (!hitN(n.x)) rsSeat(n.x, 0, () => vsp(HUM[n.t].walk[0], n.x, -L.SD - ((T * 0.7 + i * 0.37) % 1 < 0.2 ? 1 : 0), n.f)); });
  rsTable(L.tx, L.GX - L.YX - Math.round(14 * U), 0, tAB); if (!tAB) { rsBowl(L.tx - 6, 0, T, true); rsBowl(L.tx + 6, 0, T, true); }
  if (tAB) once2('tblA', () => snd('rssmash'));
  // Yuji: sits and eats, stands when Gojo does, steps up and is stopped by Gojo's hand, then backs away into the back lane
  { const standing = T >= tW, sdY = standing ? lerp(L.SD, 0, ease3((T - tW) / 0.3)) : L.SD, q = ease3(clamp01((T - tW - 0.2) / 0.4)), r = ease3(clamp01((T - tC) / 0.6)), yx = Math.round(L.YX + lerp(0, Math.round(11 * U), q) - lerp(0, Math.round(4 * U), r)), lane = Math.round(lerp(0, L.back, r)), mv = T >= tW + 0.2 && q < 1 ? 'fwd' : T >= tC && r < 1 ? 'back' : 'idle';
    const eat = T < tP + 0.5 && (T * 0.62 + 0.3) % 1 < 0.2 ? 1 : 0, p = mv === 'idle' ? tnPick({ now: nowMs }) : tnPick({ idle: false, mode: mv, now: nowMs, modeAt: (mv === 'fwd' ? tW + 0.2 : tC) * 1000 });
    const draw = () => sprAt(p.set[p.fi], p.info, yx, p.lift - sdY - eat, false, 0);
    if (sdY > 1) rsSeat(yx, 0, draw); else { ctx.save(); ctx.translate(0, lane); shadow(yx, 9); draw(); ctx.restore(); }
  }
  // Gojo: sits facing Yuji, turns to the portal, stands with an arm out (to stop Yuji), runs with the purple punch, hits, is grabbed, is punched away
  { const gTalk = st.k === 'say' && st.w === 'GOJO' && t1 * TN_RATE < (st.a + st.b).length + 3, mouth = gTalk ? 1 + (Math.floor(T * 11) % 2) : 0, stand = ease3((T - tW) / 0.35), sd = T < tW ? L.SD : lerp(L.SD, 0, stand), flip = T < tP + 1.5;
    if (T < tC) {
      const eat = T < tP + 0.5 && (T * 0.62) % 1 < 0.2 ? 1 : 0, draw = () => sprAt(idleF[Math.floor(T * IDLE_FPS) % idleF.length], D.idle, L.GX, -sd - eat, flip, mouth);
      if (sd > 1) rsSeat(L.GX, 0, draw); else { shadow(L.GX, 9); draw(); }
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
  if (k === 'launch') { [2, 1, 0].forEach((ni, j) => { const n = L.npc[ni]; if (flying && gxF <= n.x + 12) once2('kill' + ni, () => { goreKill(RS_KILLS[j], n.x - mx, 10, -1, n.t, now); snd('rssmash'); }); }); if (hitW) { once2('wall', () => { snd('rswall'); }); rsWallFx(T, u - uW); } }
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
  const fo = last ? clamp01((T - (RS_SEQ.end - RS_SEQ[RS_SEQ.length - 1].d)) / (RS_SEQ[RS_SEQ.length - 1].d - 0.2)) : 0; if (fo > 0) { ctx.fillStyle = 'rgba(0,0,0,' + fo.toFixed(3) + ')'; ctx.fillRect(0, 0, VW, VH); const ez = fo < 1 ? 1 - ease3((fo - 0.3) / 0.7) : 0; msEye(L.FX - 9 * U, gy - G.H + 11.5 * U, Math.max(1, U * 0.9), 0.9 * ez, 0, 0); }
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
function rsFist(x, y, k, glow, T, jit) {      // Gojo's fist and sleeve seen from the side with purple light; (x, y) = the front of the fist; the arm comes from the lower left
  const w = 38 * k, h = 15 * k, jx = jit ? Math.round((Math.random() - 0.5) * 2 * jit) : 0, jy = jit ? Math.round((Math.random() - 0.5) * 2 * jit) : 0, fx = Math.round(x - w + jx), fy = Math.round(y - h / 2 + jy);
  ctx.fillStyle = '#12121c'; ctx.beginPath(); ctx.moveTo(fx - 90 * k, fy + 74 * k); ctx.lineTo(fx - 90 * k, fy + 52 * k); ctx.lineTo(fx + 8 * k, fy - 2 * k); ctx.lineTo(fx + 8 * k, fy + h + 4 * k); ctx.closePath(); ctx.fill(); ctx.strokeStyle = '#33334a'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(fx - 90 * k, fy + 52 * k); ctx.lineTo(fx + 8 * k, fy - 2 * k); ctx.stroke();
  ctx.fillStyle = '#1c1c28'; ctx.fillRect(fx + 4 * k, Math.round(fy - 3 * k), Math.round(8 * k), Math.round(h + 7 * k)); ctx.fillStyle = '#f1cfb8'; ctx.fillRect(fx + 12 * k, fy, w - 12 * k, h); ctx.fillStyle = '#d8a88c'; ctx.fillRect(fx + 12 * k, Math.round(fy + h - 3 * k), w - 12 * k, Math.round(3 * k)); ctx.fillStyle = '#c99a80'; for (let i = 1; i < 4; i++) ctx.fillRect(Math.round(fx + w - 3 * k), Math.round(fy + i * h / 4), Math.round(3 * k), 1);
  ctx.save(); ctx.globalCompositeOperation = 'lighter'; const gl = ctx.createRadialGradient(x, y, 2, x, y, (16 + 14 * glow) * k * 1.4); gl.addColorStop(0, 'rgba(255,190,255,' + (0.85 * glow).toFixed(3) + ')'); gl.addColorStop(0.4, 'rgba(180,60,255,' + (0.6 * glow).toFixed(3) + ')'); gl.addColorStop(1, 'rgba(80,10,160,0)'); ctx.fillStyle = gl; ctx.fillRect(x - 50 * k, y - 50 * k, 100 * k, 100 * k); ctx.restore();
  ctx.strokeStyle = 'rgba(220,150,255,' + (0.7 * glow).toFixed(3) + ')'; ctx.lineWidth = 1; for (let i = 0; i < 5; i++) { const an = T * 11 + i * 1.3, r0 = 8 * k, r1 = (22 + (i % 3) * 8) * k; ctx.beginPath(); ctx.moveTo(x + Math.cos(an) * r0, y + Math.sin(an) * r0); ctx.lineTo(x + Math.cos(an + 0.25) * (r0 + r1) / 2, y + Math.sin(an + 0.25) * (r0 + r1) / 2 + 2); ctx.lineTo(x + Math.cos(an - 0.1) * r1, y + Math.sin(an - 0.1) * r1); ctx.stroke(); }
}
function rsMasterHead(ex, ey, k, rot, shift, T, eyeG, flare) {      // the Master's head from the side, facing left, all black with a violet rim on the side of Gojo's fist; (ex, ey) = his eye when he is upright; rot = turned back (radians), shift = pushed back (pixels)
  const F = msFig(k), px = ex + 59 * k, py = ey + 50 * k; ctx.save(); ctx.globalCompositeOperation = 'lighter'; const bl = ctx.createRadialGradient(ex + 30 * k + shift * 0.6, ey + 14 * k, 6 * k, ex + 30 * k + shift * 0.6, ey + 14 * k, 92 * k); bl.addColorStop(0, 'rgba(120,56,176,0.5)'); bl.addColorStop(1, 'rgba(60,20,110,0)'); ctx.fillStyle = bl; ctx.fillRect(ex - 70 * k, ey - 80 * k, 190 * k, 190 * k); ctx.restore();      // a violet glow behind his head so that the black shape shows
  ctx.save(); ctx.translate(px + shift, py); ctx.rotate(rot); ctx.translate(-px, -py); ctx.translate(ex, ey); ctx.scale(-1, 1); ctx.drawImage(F.B, -F.eye[0], -F.eye[1]);
  ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = 0.9; ctx.drawImage(rsRim(F.B, 1, [200, 110, 255]), -F.eye[0], -F.eye[1]); ctx.restore();
  const c = Math.cos(rot), s = Math.sin(rot), dx = ex - px, dy = ey - py; msEye(px + shift + c * dx - s * dy, py + s * dx + c * dy, k * 2.2, eyeG, 0, flare);
}
function rsCloseA(T, u) {      // Gojo smirks; the fist is on the Master's face; his head is thrown back and a HUGE shockwave runs out
  const U = rsLay().U, kG = U * 0.74, kM = U * 0.72, G = rsGoFig(kG, 0), Cx = Math.round(VW * 0.58), Cy = Math.round(VH * 0.55), snap = ease3(clamp01(u / 0.35)), shk = u < 1 ? 6 * (1 - u) : 0, zk = 1 + 0.07 * clamp01(u / 3.4);
  ctx.save(); ctx.translate(Cx, Cy); ctx.scale(zk, zk); ctx.translate(-Cx, -Cy); if (shk > 0.2) ctx.translate(Math.round((Math.random() * 2 - 1) * shk), Math.round((Math.random() * 2 - 1) * shk));
  rsSmoke(Cx + 70 * U, Cy - 10 * U, T, U); rsMasterHead(Cx + Math.round(21 * kM), Cy - Math.round(14 * kM), kM, 0.34 * snap, Math.round(30 * snap), T, 1.0 + 0.6 * (1 - snap), 1);
  rsFist(Cx + 3, Cy, kG * 1.1, 1, T, 0.6); const gx = Math.round(Cx - 72 - G.nose[0] + 3 * snap), gy0 = Math.round(Cy - 4 - G.nose[1]); ctx.drawImage(G.B, gx, gy0); ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = 0.85; ctx.drawImage(G.R, gx, gy0); ctx.restore();
  ctx.restore(); if (u < 0.6) { const q = u / 0.6, sc = 1.03 + 0.07 * (1 - q); ctx.save(); ctx.globalAlpha = 0.42 * (1 - q); ctx.drawImage(ctx.canvas, 0, 0, VW, VH, Cx - Cx * sc, Cy - Cy * sc, VW * sc, VH * sc); ctx.restore(); }      // a blur of the picture rushing out from the blow
  rsShock(Cx, Cy, u, U * 1.4);
}
function rsCloseB(T, u) {      // the Master's head comes back, pushing against the fist that is still on his face
  const U = rsLay().U, kM = U * 1.2, Cx = Math.round(VW * 0.40), Cy = Math.round(VH * 0.54), q = ease3(clamp01((u - 0.5) / 1.8));
  rsSmoke(Cx + 60 * U, Cy - 6 * U, T, U * 1.2); rsMasterHead(Cx + Math.round(21 * kM), Cy - Math.round(14 * kM), kM, 0.34 * (1 - q), Math.round(34 * (1 - q)), T, 1.0 + 0.25 * Math.sin(T * 5), 0.2 + 0.8 * q); rsFist(Cx + 4, Cy, U * 1.0, 0.85 - 0.3 * q, T, 0.9);
}
function rsCloseC(T, u) {      // Gojo is shocked; his fist is still out; the Master's hand closes round it
  const U = rsLay().U, kG = U * 0.92, G = rsGoFig(kG, 1), nx = Math.round(VW * 0.40), ny = Math.round(VH * 0.55), hx = nx - 30 * U, hy = ny - 22 * U, fxF = Math.round(VW * 0.86), fyF = ny + 4 * U, hand = ease3(clamp01((u - 2.0) / 0.35)), jit = u > 2.3 ? 1.4 : 0.8;
  ctx.save(); ctx.strokeStyle = 'rgba(235,225,255,' + (0.5 + 0.25 * Math.sin(T * 40)).toFixed(3) + ')'; ctx.lineWidth = 1; for (let i = 0; i < 26; i++) { const an = i * 0.2417, r0 = (62 + (i % 3) * 8) * U, r1 = r0 + (50 + (i % 4) * 26) * U; ctx.beginPath(); ctx.moveTo(hx + Math.cos(an) * r0, hy + Math.sin(an) * r0); ctx.lineTo(hx + Math.cos(an) * r1, hy + Math.sin(an) * r1); ctx.stroke(); } ctx.restore();      // shock lines
  rsFist(fxF, Math.round(fyF), U * 0.95, u > 2.35 ? 0.4 + 0.5 * Math.random() : 0.75, T, jit);
  const jx = Math.round((Math.random() - 0.5) * 2), jy = Math.round((Math.random() - 0.5) * 2), gx = Math.round(nx - G.nose[0]) + jx, gy0 = Math.round(ny - G.nose[1]) + jy; ctx.drawImage(G.B, gx, gy0); ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = 0.7; ctx.drawImage(G.R, gx, gy0); ctx.restore();
  const dy = (T * 30) % 26; ctx.fillStyle = 'rgba(190,232,255,' + (0.95 - dy / 30).toFixed(3) + ')'; ctx.fillRect(gx + Math.round(G.temple[0]), gy0 + Math.round(G.temple[1] + dy), 2, 3); ctx.fillRect(gx + Math.round(G.temple[0]) + 0, gy0 + Math.round(G.temple[1] + dy) - 2, 1, 2);      // a drop of sweat runs down his temple
  if (hand > 0) { const k = U * 0.95, ox = lerp(60 * k, 0, hand), x0 = fxF - 30 * k + ox; ctx.fillStyle = '#030208'; ctx.fillRect(Math.round(x0 + 14 * k), Math.round(fyF - 12 * k), Math.round(42 * k), Math.round(24 * k)); for (let i = 0; i < 4; i++) { const fy = Math.round(fyF - 12 * k + i * 6 * k + lerp(i < 2 ? -8 * k : 8 * k, 0, hand)); ctx.fillStyle = '#030208'; ctx.fillRect(Math.round(x0 - 10 * k), fy, Math.round(30 * k), Math.round(6 * k)); ctx.fillStyle = 'rgba(190,100,255,0.85)'; ctx.fillRect(Math.round(x0 - 10 * k), fy, Math.round(30 * k), 1); } if (u > 2.35) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = 'rgba(255,255,255,' + clamp01(1 - (u - 2.35) / 0.2).toFixed(3) + ')'; ctx.fillRect(0, 0, VW, VH); ctx.restore(); } }
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
