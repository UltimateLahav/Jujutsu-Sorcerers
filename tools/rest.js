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
  const v = { U, YX: Math.round(VW * 0.37), GX: Math.round(VW * 0.535), top: gy - RS_TABLE, PX: VW - Math.round(24 * U), FX: 0, back: -Math.round(9 * U), wall: Math.round(7 * U) };
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

// ---- furniture and people (v1.58: everything redrawn with a dark outline, light and shade, in the style of the characters)
const RS_SEAT = 19, RS_TABLE = 26;      // the height of a sitting person's hip and of the top of a table above the floor line (pixels: the people's pictures are always 64 x 64 whatever the screen)
const rsRgb = (c, k) => 'rgb(' + Math.max(0, Math.min(255, Math.round(c[0] * k))) + ',' + Math.max(0, Math.min(255, Math.round(c[1] * k))) + ',' + Math.max(0, Math.min(255, Math.round(c[2] * k))) + ')';
function rsLine(g, x0, y0, x1, y1, w, col) {      // a thick line of whole pixels (w x w squares along it)
  g.fillStyle = col; const n = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0), 1); for (let i = 0; i <= n; i++) g.fillRect(Math.round(x0 + (x1 - x0) * i / n - (w - 1) / 2), Math.round(y0 + (y1 - y0) * i / n - (w - 1) / 2), w, w);
}
function rsTable(cx, w, lane, broken) {      // a wooden table with an apron, two legs with a bar, a little shade on the floor, a soy bottle and a shaker; its top is RS_TABLE pixels above the floor line
  const y = gy - RS_TABLE + lane, x0 = Math.round(cx - w / 2); w = Math.round(w);
  if (broken) { ctx.fillStyle = '#a8723e'; ctx.save(); ctx.translate(x0 + 3, gy + 7 + lane); ctx.rotate(-0.32); ctx.fillRect(0, 0, w * 0.55, 3); ctx.restore(); ctx.save(); ctx.translate(x0 + w * 0.52, gy + 10 + lane); ctx.rotate(0.5); ctx.fillRect(0, 0, w * 0.5, 3); ctx.restore(); ctx.fillStyle = '#6a4226'; ctx.fillRect(x0 + 1, gy + 10 + lane, 2, 5); ctx.fillRect(x0 + w - 7, gy + 12 + lane, 6, 2); return; }
  ctx.fillStyle = 'rgba(40,20,8,0.22)'; ctx.fillRect(x0 + 1, gy + 1 + lane, w - 2, 2);
  for (const lx of [x0 + 3, x0 + w - 6]) { ctx.fillStyle = '#2a160a'; ctx.fillRect(lx - 1, y + 5, 5, gy + 3 + lane - y - 5); ctx.fillStyle = '#6a4226'; ctx.fillRect(lx, y + 5, 3, gy + 2 + lane - y - 5); ctx.fillStyle = '#8a5a34'; ctx.fillRect(lx + 2, y + 5, 1, gy + 2 + lane - y - 5); ctx.fillStyle = '#4a2a14'; ctx.fillRect(lx, y + 5, 1, gy + 2 + lane - y - 5); }
  ctx.fillStyle = '#4a2a14'; ctx.fillRect(x0 + 3, gy - 9 + lane, w - 6, 2); ctx.fillStyle = '#6a4226'; ctx.fillRect(x0 + 3, gy - 9 + lane, w - 6, 1);
  ctx.fillStyle = '#2a160a'; ctx.fillRect(x0 - 1, y - 1, w + 2, 5); ctx.fillStyle = '#5a361c'; ctx.fillRect(x0, y + 3, w, 1); ctx.fillStyle = '#a8723e'; ctx.fillRect(x0, y, w, 3); ctx.fillStyle = '#d0a064'; ctx.fillRect(x0, y, w, 1); ctx.fillStyle = '#82522c'; ctx.fillRect(x0, y + 2, w, 1);
  if (w >= 16) { const sx = Math.round(cx) - 2; ctx.fillStyle = '#2a160a'; ctx.fillRect(sx - 1, y - 6, 4, 6); ctx.fillRect(sx + 3, y - 5, 3, 5); ctx.fillStyle = '#3a2418'; ctx.fillRect(sx, y - 5, 2, 5); ctx.fillStyle = '#c0392b'; ctx.fillRect(sx, y - 6, 2, 1); ctx.fillStyle = '#e8e0cc'; ctx.fillRect(sx + 3, y - 4, 2, 4); ctx.fillStyle = '#b8b09c'; ctx.fillRect(sx + 4, y - 5, 1, 1); }
}
const RS_BOWL = [      // a ramen bowl seen from the side, 9 x 8 pixels (the table top is under its last row): o outline, W china, w shade, r red band, b broth, n noodle, e egg, y yolk, p pork, g green onion, k nori
  '..gknpyb.', '.bnbennb.', 'oWWWWWWWo', 'orrrrrrro', '.oWWWWWo.', '..owwwo..', '...ooo...'];
function rsBowl(cx, lane, T, steam) {
  const y = gy - RS_TABLE + lane, x = Math.round(cx) - 4, C = { o: '#2a160a', W: '#f6f2e8', w: '#cfc7b4', r: '#c0392b', b: '#c8782a', n: '#f4d878', e: '#fffaf0', y: '#f0a020', p: '#e8a09a', g: '#3fa84a', k: '#2a4a32' };
  for (let r = 0; r < RS_BOWL.length; r++) for (let c = 0; c < RS_BOWL[r].length; c++) { const ch = RS_BOWL[r][c]; if (ch === '.') continue; ctx.fillStyle = C[ch]; ctx.fillRect(x + c, y - RS_BOWL.length + r, 1, 1); }
  if (steam) { ctx.fillStyle = 'rgba(255,255,255,0.45)'; for (let i = 0; i < 3; i++) { const ph = (T * 0.8 + i * 0.33) % 1; ctx.fillRect(x + 2 + i * 2 + Math.round(Math.sin(T * 2 + i) * 1.2), Math.round(y - 9 - ph * 9), 1, 2); } }
}
function rsStool(x, lane) {      // a round wooden stool with a red cushion: the cushion's top is 2 pixels under the hips of the person sitting
  x = Math.round(x); const y = gy + lane;
  ctx.fillStyle = 'rgba(40,20,8,0.22)'; ctx.fillRect(x - 9, y + 1, 18, 2);
  for (const s of [-1, 1]) { rsLine(ctx, x + s * 4, y - 12, x + s * 6, y - 1, 4, '#2a160a'); rsLine(ctx, x + s * 4, y - 12, x + s * 6, y - 1, 2, s < 0 ? '#8a5a34' : '#6a4226'); }
  ctx.fillStyle = '#2a160a'; ctx.fillRect(x - 6, y - 7, 13, 3); ctx.fillStyle = '#6a4226'; ctx.fillRect(x - 5, y - 5, 11, 1);
  ctx.fillStyle = '#2a160a'; ctx.fillRect(x - 8, y - 14, 17, 4); ctx.fillStyle = '#8a5a34'; ctx.fillRect(x - 7, y - 13, 15, 2); ctx.fillStyle = '#5a361c'; ctx.fillRect(x - 7, y - 12, 15, 1);
  ctx.fillStyle = '#3a1410'; ctx.fillRect(x - 10, y - 18, 21, 5); ctx.fillStyle = '#b03a3a'; ctx.fillRect(x - 9, y - 17, 19, 3); ctx.fillStyle = '#d65a52'; ctx.fillRect(x - 8, y - 17, 17, 1); ctx.fillStyle = '#7a2020'; ctx.fillRect(x - 9, y - 15, 19, 1);
}
const rsBlC = new Map();
function rsGojoBlock(f, k) {      // a NEW picture of Gojo with his far arm stretched out behind him, palm open, to stop Yuji: the arm is drawn behind his body at shoulder height, with an outline, light and shade in the colours of his own uniform and skin, and a flat open hand (4 fingers up); k = how far it has come out (0 to 1)
  const kq = Math.round(k * 4) / 4; let M = rsBlC.get(f); if (!M) rsBlC.set(f, M = {}); if (M[kq]) return M[kq];
  const w = f.width, h = f.height, q = document.createElement('canvas'); q.width = w; q.height = h; const qg = q.getContext('2d'); qg.drawImage(f, 0, 0); const d = qg.getImageData(0, 0, w, h).data, at = (x, y) => (y * w + x) * 4, op = (x, y) => x >= 0 && y >= 0 && x < w && y < h && d[at(x, y) + 3] > 40, PAD = 16;
  let top = -1, bot = -1; for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) if (op(x, y)) { if (top < 0) top = y; bot = y; break; }
  const hip = top + Math.round(0.53 * (bot - top)), sy = bot - 30; let back = w; for (let y = sy - 1; y <= sy + 3; y++) for (let x = 0; x < w; x++) if (op(x, y)) { back = Math.min(back, x); break; }
  const avg = (y0, y1, ok) => { let R = 0, G = 0, B = 0, m = 0; for (let y = y0; y <= y1; y++) for (let x = 0; x < w; x++) if (op(x, y)) { const i = at(x, y); if (!ok || ok(d[i], d[i + 1], d[i + 2])) { R += d[i]; G += d[i + 1]; B += d[i + 2]; m++; } } return m ? [R / m, G / m, B / m] : null; };
  const slv = avg(hip - 8, hip - 2) || [30, 30, 46], skin = avg(top, top + 26, (R, G, B) => R > 150 && G > 100 && B > 70 && R > B + 25 && R >= G) || [241, 207, 184], OL = rsRgb([20, 16, 30], 1), len = Math.round(2 + 16 * kq), xs = back + PAD + 4, xe = back + PAD - len, ay = sy, c = document.createElement('canvas'); c.width = w + PAD; c.height = h; c.pad = PAD; const g = c.getContext('2d');
  g.fillStyle = OL; g.fillRect(xe - 1, ay - 2, xs - xe + 2, 6); g.fillStyle = rsRgb(slv, 1.1); g.fillRect(xe, ay - 1, xs - xe, 4); g.fillStyle = rsRgb(slv, 1.9); g.fillRect(xe, ay - 1, xs - xe, 1); g.fillStyle = rsRgb(slv, 0.55); g.fillRect(xe, ay + 2, xs - xe, 1);      // the sleeve
  if (kq > 0.2) { const hx = xe - 3, sk = (m, y0, y1, c) => { g.fillStyle = rsRgb(skin, m); g.fillRect(...c); }; g.fillStyle = OL; g.fillRect(hx - 2, ay - 2, 6, 6); g.fillRect(hx - 1, ay - 8, 5, 8); g.fillRect(hx - 3, ay - 3, 3, 4); g.fillStyle = rsRgb(skin, 1); g.fillRect(hx - 1, ay - 1, 4, 4); g.fillRect(hx, ay - 7, 3, 6); g.fillRect(hx - 2, ay - 2, 1, 2); g.fillStyle = rsRgb(skin, 1.12); g.fillRect(hx - 1, ay - 1, 1, 4); g.fillRect(hx, ay - 7, 1, 5); g.fillStyle = rsRgb(skin, 0.7); g.fillRect(hx + 1, ay - 7, 1, 4); g.fillRect(hx + 2, ay - 1, 1, 4); g.fillRect(hx - 1, ay + 2, 4, 1); }      // the open hand: the palm faces Yuji, three fingers point up (with the gaps between them), the thumb sticks out
  g.drawImage(f, PAD, 0); return M[kq] = c;
}
const rsSitC = new Map();
function rsSit(src) {      // NEW sitting pictures of the same person, 3 poses of eating (0 the chopsticks at the bowl, 1 lifting, 2 at the mouth): the upper body of the standing picture is kept pixel for pixel and lowered to the seat; the legs, the far arm, the hand and the chopsticks are drawn new with an outline and light and shade in the colours of the person himself; .seat = the row of the hip, .fx = the front of his chest
  let r = rsSitC.get(src); if (r) return r;
  const w = src.width, h = src.height, q = document.createElement('canvas'); q.width = w; q.height = h; const qg = q.getContext('2d'); qg.drawImage(src, 0, 0); const d = qg.getImageData(0, 0, w, h).data, at = (x, y) => (y * w + x) * 4, op = (x, y) => x >= 0 && y >= 0 && x < w && y < h && d[at(x, y) + 3] > 40;
  let top = -1, bot = -1; for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) if (op(x, y)) { if (top < 0) top = y; bot = y; break; }
  const hip = top + Math.round(0.53 * (bot - top)), seat = bot - RS_SEAT, dy = seat - hip;
  const avg = (y0, y1, x0, x1, ok) => { let R = 0, G = 0, B = 0, m = 0; for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) if (op(x, y)) { const i = at(x, y); if (!ok || ok(d[i], d[i + 1], d[i + 2])) { R += d[i]; G += d[i + 1]; B += d[i + 2]; m++; } } return m ? [R / m, G / m, B / m] : null; };
  let sx = 0, sn = 0, bx = w, fxh = 0; for (let y = hip; y < hip + 7; y++) for (let x = 0; x < w; x++) if (op(x, y)) { sx += x; sn++; bx = Math.min(bx, x); } const cx = Math.round(sn ? sx / sn : w / 2);
  for (let y = hip - 9; y <= hip - 5; y++) for (let x = 0; x < w; x++) if (op(x, y)) fxh = Math.max(fxh, x);      // the front of his chest
  const hist = {}; for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) if (op(x, y) && !(op(x - 1, y) && op(x + 1, y) && op(x, y - 1) && op(x, y + 1))) { const i = at(x, y), k = (d[i] >> 5) + ',' + (d[i + 1] >> 5) + ',' + (d[i + 2] >> 5); (hist[k] = hist[k] || { n: 0, c: [0, 0, 0] }).n++; hist[k].c[0] += d[i]; hist[k].c[1] += d[i + 1]; hist[k].c[2] += d[i + 2]; }
  let ol = [30, 24, 40], best = 0; for (const k in hist) if (hist[k].n > best) { best = hist[k].n; ol = hist[k].c.map(v => v / hist[k].n); }
  const trs = avg(bot - 17, bot - 6, 0, w - 1) || [50, 50, 70], shoe = avg(bot - 2, bot, 0, w - 1) || [40, 30, 30], top0 = avg(hip - 8, hip - 2, 0, w - 1) || [60, 60, 80], skin = avg(top, top + 24, 0, w - 1, (R, G, B) => R > 150 && G > 100 && B > 70 && R > B + 25 && R >= G) || [241, 207, 184];
  const my = top + Math.round(0.3 * (bot - top)), mm = typeof mouthOf === 'function' ? mouthOf(src) : null, mrow = mm ? mm.y + 1 : my; let ffx = 0; for (let y = mrow - 2; y <= mrow + 1; y++) for (let x = 0; x < w; x++) if (op(x, y)) ffx = Math.max(ffx, x);
  const OL = rsRgb(ol, 0.85), TR = trs, rt = bot - RS_TABLE, fx = fxh, mouthY = mrow + dy + 1;
  const leg = (g, ddx, k) => {      // one leg: the thigh, the shin, the shoe
    const bk = Math.max(2, Math.min(bx, cx - 4)) + ddx, X = cx + ddx, th = [bk, seat - 2, X + 16 - bk, 5], sh = [X + 11, seat + 3, 5, bot - 4 - (seat + 3)], so = [X + 10, bot - 3, 10, 3], sl = [X + 10, bot, 10, 1];
    g.fillStyle = OL; for (const [x, y, ww, hh] of [th, sh, so, sl]) g.fillRect(x - 1, y - 1, ww + 2, hh + 2);
    g.fillStyle = rgb2(TR, k); g.fillRect(...th); g.fillRect(...sh); g.fillStyle = rgb2(TR, k * 1.35); g.fillRect(th[0] + 1, th[1], th[2] - 2, 1); g.fillRect(sh[0] + sh[2] - 1, sh[1], 1, sh[3]); g.fillStyle = rgb2(TR, k * 0.62); g.fillRect(th[0], th[1] + 4, th[2], 1); g.fillRect(sh[0], sh[1], 1, sh[3]); g.fillRect(sh[0] + 1, sh[1] + 5, 3, 1);
    g.fillStyle = OL; g.fillRect(th[0] + th[2] - 1, th[1], 1, 1); g.fillRect(th[0] + th[2] - 1, th[1] + 4, 1, 1);      // (the knee is rounded)
    g.fillStyle = rgb2(shoe, k); g.fillRect(...so); g.fillStyle = rgb2(shoe, k * 1.5); g.fillRect(so[0] + 4, so[1], 6, 1); g.fillStyle = rgb2(shoe, k * 0.45); g.fillRect(...sl);
  };
  function rgb2(c, k) { return rsRgb(c, k); }
  const poses = [];
  for (let pose = 0; pose < 3; pose++) {
    const c = document.createElement('canvas'); c.width = w; c.height = h; const g = c.getContext('2d'); leg(g, 3, 0.6); leg(g, 0, 1);
    const H = pose === 0 ? [fx + 4, rt - 2] : pose === 1 ? [fx + 4, rt - 8] : [ffx - 1, mouthY], E = pose === 2 ? [fx - 4, rt + 4] : pose === 1 ? [fx - 1, rt - 1] : [fx - 1, rt + 3], sl = rgb2(top0, 1);      // the hand, the (hidden) elbow
    rsLine(g, E[0], E[1], H[0], H[1], 5, OL); rsLine(g, E[0], E[1], H[0], H[1], 3, sl); rsLine(g, E[0], E[1] - 1, H[0], H[1] - 1, 1, rgb2(top0, 1.5)); rsLine(g, H[0] - 2, H[1] + 1, H[0] - 2, H[1] + 1, 1, rgb2(skin, 0.8));      // the far arm (behind his body): his forearm
    g.drawImage(src, 0, top, w, hip - top, 0, top + dy, w, hip - top);
    g.fillStyle = OL; g.fillRect(H[0] - 2, H[1] - 2, 5, 5); g.fillStyle = rgb2(skin, 1); g.fillRect(H[0] - 1, H[1] - 1, 3, 3); g.fillStyle = rgb2(skin, 1.12); g.fillRect(H[0] - 1, H[1] - 1, 3, 1); g.fillStyle = rgb2(skin, 0.78); g.fillRect(H[0] - 1, H[1] + 1, 3, 1);      // his hand
    const cs = pose === 0 ? [[H[0] + 1, H[1], H[0] + 7, H[1] + 3], [H[0] + 1, H[1] + 1, H[0] + 7, H[1] + 4]] : pose === 1 ? [[H[0] + 1, H[1], H[0] + 4, H[1] - 4], [H[0] + 2, H[1], H[0] + 5, H[1] - 3]] : [[H[0] + 1, H[1], H[0] + 7, H[1] + 1], [H[0] + 1, H[1] + 1, H[0] + 7, H[1] + 2]];
    for (const [a, b, e, f] of cs) { rsLine(g, a, b, e, f, 1, '#e8cc8c'); g.fillStyle = '#8a5a2a'; g.fillRect(e, f, 1, 1); }      // the chopsticks
    if (pose === 1) { g.fillStyle = '#f4d878'; g.fillRect(H[0] + 4, H[1] - 4, 2, 2); g.fillRect(H[0] + 5, H[1] - 3, 1, 3); }      // noodles on them
    poses.push(c);
  }
  r = { f: poses, seat, fx, ffx, top, bot, cx }; rsSitC.set(src, r); return r;
}
const rsEat = (T, ph) => { const c = (T * 0.45 + ph) % 1; return c < 0.6 ? 0 : c < 0.7 ? 1 : c < 0.88 ? 2 : c < 0.95 ? 1 : 0; };      // the eating cycle (2.2 s): the chopsticks at the bowl, up, at the mouth (chewing), down
function rsPerson(src, info, x, lane, flip, pose, mouth, alpha) {      // someone sitting at the table: his sitting picture in the pose of his eating (see rsSit)
  const R = rsSit(src), inf = info || { cx: 32, x0: 0, top: 0 }; ctx.save(); ctx.translate(0, lane); if (alpha < 1) ctx.globalAlpha = alpha; sprAt(R.f[pose | 0], inf, x, R.bot - 60 - (inf.top || 0), flip, mouth || 0); ctx.restore();      // (the lift puts the soles of his shoes on the floor line)
}

// ---- the dark things: the portal, the aura, the Master as a black shape with a red eye, shockwaves, the purple punch
function rsPortal(px, p, T) {      // the dark portal: a black well with a deep violet edge, three slow spiral arms, a bright double rim, sparks, and its light on the wall and the floor
  if (p <= 0.01) return; const U = rsLay().U, cy = gy - Math.round(34 * U), rx = 15 * U * p, ry = 39 * U * p;
  ctx.save(); ctx.globalCompositeOperation = 'lighter'; const gl = ctx.createRadialGradient(px, cy, 2, px, cy, 72 * U * p); gl.addColorStop(0, 'rgba(130,45,190,0.4)'); gl.addColorStop(1, 'rgba(60,10,110,0)'); ctx.fillStyle = gl; ctx.fillRect(px - 80 * U, cy - 80 * U, 160 * U, 160 * U);
  ctx.save(); ctx.translate(px - 6 * U * p, gy + 3); ctx.scale(1, 0.26); const fl = ctx.createRadialGradient(0, 0, 2, 0, 0, 46 * U * p); fl.addColorStop(0, 'rgba(140,50,200,0.42)'); fl.addColorStop(1, 'rgba(60,10,110,0)'); ctx.fillStyle = fl; ctx.fillRect(-50 * U, -50 * U, 100 * U, 100 * U); ctx.restore(); ctx.restore();      // (its light lies on the floor)
  const wl = ctx.createRadialGradient(px, cy, 1, px, cy, Math.max(2, ry)); wl.addColorStop(0, '#010004'); wl.addColorStop(0.7, '#07021a'); wl.addColorStop(1, '#1c0a3c'); ctx.fillStyle = wl; ctx.beginPath(); ctx.ellipse(px, cy, rx, ry, 0, 0, 6.2832); ctx.fill();
  ctx.save(); ctx.beginPath(); ctx.ellipse(px, cy, rx, ry, 0, 0, 6.2832); ctx.clip(); ctx.lineCap = 'round';
  for (let k = 0; k < 3; k++) { for (let pass = 0; pass < 2; pass++) { ctx.strokeStyle = pass ? 'rgba(190,110,255,0.55)' : 'rgba(110,40,190,0.5)'; ctx.lineWidth = pass ? 1 : 3; ctx.beginPath(); for (let t = 0.08; t <= 1.001; t += 0.04) { const an = k * 2.0944 + t * 4.2 - T * 1.1, xx = px + Math.cos(an) * rx * t * 1.08, yy = cy + Math.sin(an) * ry * t * 1.08; if (t < 0.09) ctx.moveTo(xx, yy); else ctx.lineTo(xx, yy); } ctx.stroke(); } }
  ctx.restore();
  ctx.strokeStyle = 'rgba(60,10,100,0.9)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.ellipse(px, cy, rx + 2, ry + 2, 0, 0, 6.2832); ctx.stroke(); ctx.strokeStyle = 'rgba(176,86,255,' + (0.75 + 0.15 * Math.sin(T * 9)).toFixed(2) + ')'; ctx.lineWidth = 2; ctx.beginPath(); ctx.ellipse(px, cy, rx, ry, 0, 0, 6.2832); ctx.stroke(); ctx.strokeStyle = 'rgba(220,160,255,0.32)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.ellipse(px, cy, Math.max(1, rx - 2), Math.max(1, ry - 2), 0, 0, 6.2832); ctx.stroke();
  ctx.fillStyle = '#c890ff'; for (let i = 0; i < 12; i++) { const ph = (T * 0.9 + i * 0.37) % 1, a = (i * 0.52 + T * 1.7) % 6.2832, r = 1 + ph * 12 * p; ctx.globalAlpha = 0.9 - ph * 0.9; ctx.fillRect(Math.round(px + Math.cos(a) * (rx + r)), Math.round(cy + Math.sin(a) * (ry + r * 1.6)), 1, 1); } ctx.globalAlpha = 1;
}
function rsAura(x, T, k, H) {      // a dark aura: black-violet smoke rising off him with thin violet edges
  if (k <= 0) return; const U = rsLay().U; ctx.save(); for (let i = 0; i < 18; i++) { const ph = (T * 0.45 + i * 0.173) % 1, ax = x + Math.sin(i * 2.1 + T * 0.8) * (9 + ph * 8) * U, ay = gy - ph * (H + 14 * U), r = (3 + ph * 7) * U * k; ctx.fillStyle = 'rgba(20,6,36,' + (0.55 * (1 - ph) * k).toFixed(3) + ')'; ctx.beginPath(); ctx.arc(ax, ay, r, 0, 6.2832); ctx.fill(); ctx.strokeStyle = 'rgba(140,55,210,' + (0.32 * (1 - ph) * k).toFixed(3) + ')'; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(ax, ay, r, 0.5, 2.2); ctx.stroke(); } ctx.restore();
}
// ---------------------------------------------------------------- THE MASTER IS FREDDY KRUEGER (v1.58): the game's own pictures of him (the fighter of v1.39, tools/freddy_art.py), painted black, with one red eye
const rsFrC = new Map(), RS_FC = 31, RS_FY = 61;      // the picture column that stands at the middle of the screen (FRED_INFO.cx) and the number of rows from the floor up to the top of his 64 x 64 picture (60 + FRED_INFO.top)
const rsEdgeC = new Map();
function rsEdge(src, col) {      // the whole outline of a picture (every opaque pixel with a see-through neighbour above, below, left or right) in one colour
  const key = col.join(), M = rsEdgeC.get(src) || (rsEdgeC.set(src, {}), rsEdgeC.get(src)); if (M[key]) return M[key];
  const w = src.width, h = src.height, a = src.getContext('2d').getImageData(0, 0, w, h).data, c = document.createElement('canvas'); c.width = w; c.height = h; const q = c.getContext('2d'), im = q.createImageData(w, h), o = im.data, al = (x, y) => x < 0 || y < 0 || x >= w || y >= h ? 0 : a[(y * w + x) * 4 + 3];
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) if (al(x, y) >= 128 && (al(x - 1, y) < 128 || al(x + 1, y) < 128 || al(x, y - 1) < 128 || al(x, y + 1) < 128)) { const i = (y * w + x) * 4; o[i] = col[0]; o[i + 1] = col[1]; o[i + 2] = col[2]; o[i + 3] = 255; }
  q.putImageData(im, 0, 0); return M[key] = c;
}
function rsFred(src) {      // a black copy of one of Freddy's pictures (he faces right): .B = the picture, .face = [x0, y0, x1, y1] of his face (found from the skin colours of the real picture), .eye = [column, row] of his red eye, .neck = the first row under his face
  let r = rsFrC.get(src); if (r) return r;
  const w = src.width, h = src.height, c = document.createElement('canvas'); c.width = w; c.height = h; const g = c.getContext('2d'); g.drawImage(src, 0, 0); const im = g.getImageData(0, 0, w, h), d = im.data, SK = [[122, 66, 52], [184, 124, 88], [220, 168, 120]]; let x0 = w, x1 = -1, y0 = h, y1 = -1;
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const i = (y * w + x) * 4; if (d[i + 3] < 100) { d[i + 3] = 0; continue; } const R = d[i], G = d[i + 1], B = d[i + 2];
    if (y < 26 && x < 44 && SK.some(s => Math.abs(R - s[0]) + Math.abs(G - s[1]) + Math.abs(B - s[2]) < 28)) { x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y); }
    const L = 0.3 * R + 0.59 * G + 0.11 * B; d[i] = 3 + L * 0.035; d[i + 1] = 2 + L * 0.03; d[i + 2] = 8 + L * 0.05; d[i + 3] = 255;      // every colour of the picture becomes a black with only a trace of its light and dark
  }
  g.putImageData(im, 0, 0); if (x1 < 0) { x0 = 28; x1 = 40; y0 = 8; y1 = 17; }
  r = { B: c, face: [x0, y0, x1, y1], eye: [x1 - 3, y0 + 3], neck: y1 + 1 }; rsFrC.set(src, r); return r;
}
function rsFrFront(B, row) {      // the front-most column of his HEAD at a row of the picture (the claw hand, from column 44 on, does not count)
  const d = B.getContext('2d').getImageData(0, row, B.width, 1).data; for (let x = 43; x >= 0; x--) if (d[x * 4 + 3] > 100) return x; return 40;
}
const rsEyeAt = (mx, F, lift) => [mx - (F.eye[0] + 0.5 - RS_FC), gy - RS_FY - (lift || 0) + F.eye[1] + 0.5];      // where his eye is on the screen when he stands at mx facing left
function rsFredDraw(mx, T, o) {      // the Master in the wide shot: black, a violet rim of light (the portal behind him, Gojo's fist in front), one red eye; o.mode = 'idle' | 'walk' (o.d = the ground he has covered) | 'grab' | 'punch' (the claw slash pictures); o.eye = how bright the eye is
  const src = o.mode === 'walk' ? fredF(o.d * 0.5, true) : o.mode === 'grab' ? fredA(0, 13) : o.mode === 'punch' ? fredA(0, 11) : fredF(Math.floor(T * IDLE_FPS)), F = rsFred(src), U = rsLay().U;
  sprAt(F.B, FRED_INFO, mx, 0, true, 0);
  ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = 0.85; sprAt(rsRim(F.B, -1, [170, 90, 255]), FRED_INFO, mx, 0, true, 0); ctx.globalAlpha = 0.45; sprAt(rsRim(F.B, 1, [200, 130, 255]), FRED_INFO, mx, 0, true, 0); ctx.globalAlpha = 0.4; sprAt(rsEdge(F.B, [150, 80, 230]), FRED_INFO, mx, 0, true, 0); ctx.restore();
  const e = rsEyeAt(mx, F, 0); msEye(e[0], e[1], Math.max(1, U * 0.75), o.eye, 0, o.flare || 0);
}
const rsFhC = new Map();
function rsFredParts(Z) {      // Freddy's idle picture for the close-ups, black, enlarged Z times with hard pixels and cut in two: .body = chest and shoulders (no head, no claw hand), .head = hat and face, which turns about .pv (his neck); .rim = the violet edge of the body; .bx / .hx = the picture column of each piece's left edge
  let r = rsFhC.get(Z); if (r) return r;
  const F = rsFred(fredF(0)), B = F.B, nk = F.neck, HX0 = 18, HX1 = 43, hw = HX1 - HX0 + 1, erase = [[HX0, 0, hw, nk + 1], [44, 0, 20, 22]];
  const cut = (sx, sy, sw, sh, er) => { const c = document.createElement('canvas'); c.width = sw * Z; c.height = sh * Z; const g = c.getContext('2d'); g.imageSmoothingEnabled = false; g.drawImage(B, sx, sy, sw, sh, 0, 0, sw * Z, sh * Z); if (er) { g.globalCompositeOperation = 'destination-out'; for (const q of er) g.fillRect((q[0] - sx) * Z, (q[1] - sy) * Z, q[2] * Z, q[3] * Z); } return c; };
  const full = cut(12, 0, 40, 40), rim = document.createElement('canvas'); rim.width = full.width; rim.height = full.height; { const g = rim.getContext('2d'); g.drawImage(rsRim(full, 1, [200, 130, 255]), 0, 0); g.globalAlpha = 0.7; g.drawImage(rsRim(full, -1, [150, 80, 230]), 0, 0); g.globalAlpha = 1; g.globalCompositeOperation = 'destination-out'; for (const q of erase) g.fillRect((q[0] - 12) * Z, q[1] * Z, q[2] * Z, q[3] * Z); }      // the rim is found from the whole picture, then the head's place is taken out of it
  const fullE = rsEdge(full, [170, 100, 240]), edgeB = document.createElement('canvas'); edgeB.width = full.width; edgeB.height = full.height; { const g = edgeB.getContext('2d'); g.drawImage(fullE, 0, 0); g.globalCompositeOperation = 'destination-out'; for (const q of erase) g.fillRect((q[0] - 12) * Z, q[1] * Z, q[2] * Z, q[3] * Z); }
  r = { body: cut(12, 0, 40, 40, erase), bx: 12, rim, fullE, edgeB, head: cut(HX0, 0, hw, nk + 2), hx: HX0, hw, hh: nk + 2, pv: [30, nk] }; rsFhC.set(Z, r); return r;
}
function rsHeadGlow(x, y, k) {      // a violet light behind a black head, so that its shape shows
  ctx.save(); ctx.globalCompositeOperation = 'lighter'; const bl = ctx.createRadialGradient(x, y, 6 * k, x, y, 96 * k); bl.addColorStop(0, 'rgba(120,56,176,0.5)'); bl.addColorStop(1, 'rgba(60,20,110,0)'); ctx.fillStyle = bl; ctx.fillRect(x - 100 * k, y - 100 * k, 200 * k, 200 * k); ctx.restore();
}
function rsFredHead(Cx, Cy, Z, rot, shift, eyeG, flare) {      // Freddy's head and shoulders (his real picture, black, enlarged Z times) facing left with his mouth on (Cx, Cy), where Gojo's fist is: rot = how far the blow has thrown his head back (radians), shift = how far it has pushed it back (pixels)
  const P = rsFredParts(Z), F = rsFred(fredF(0)), cr = F.face[3] - 2, fc = rsFrFront(F.B, cr) + 1, ox = fc * Z, oy = (cr + 0.5) * Z, pvx = P.pv[0] * Z - ox, pvy = P.pv[1] * Z - oy, R = [200, 130, 255];
  rsHeadGlow(Cx - 1 + (fc - 34) * Z, Cy + (10 - cr - 0.5) * Z, Z * 0.33);
  ctx.save(); ctx.translate(Cx - 1, Cy); ctx.scale(-1, 1);      // (the picture is drawn mirrored: his face is the right edge of the picture, so it ends on (Cx - 1, Cy) and touches the fist)
  ctx.drawImage(P.body, P.bx * Z - ox, -oy); ctx.fillStyle = '#05030a'; ctx.beginPath(); ctx.ellipse(pvx, pvy, 7 * Z, 4 * Z, 0, 0, 6.2832); ctx.fill();      // (a black patch on the neck fills the wedge that opens when the head turns)
  ctx.save(); ctx.translate(pvx - shift, pvy); ctx.rotate(-rot); ctx.translate(-pvx, -pvy); ctx.drawImage(P.head, P.hx * Z - ox, -oy); ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = 0.9; ctx.drawImage(rsRim(P.head, 1, R), P.hx * Z - ox, -oy); ctx.globalAlpha = 0.7; ctx.drawImage(rsRim(P.head, -1, [150, 80, 230]), P.hx * Z - ox, -oy); ctx.globalAlpha = 0.65; ctx.drawImage(P.fullE, (P.hx - P.bx) * Z, 0, P.hw * Z, P.hh * Z, P.hx * Z - ox, -oy, P.hw * Z, P.hh * Z); ctx.restore();
  ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = 0.9; ctx.drawImage(P.rim, P.bx * Z - ox, -oy); ctx.globalAlpha = 0.65; ctx.drawImage(P.edgeB, P.bx * Z - ox, -oy); ctx.restore();
  const lx = (F.eye[0] + 0.5) * Z - ox - pvx, ly = (F.eye[1] + 0.5) * Z - oy - pvy, c = Math.cos(-rot), s = Math.sin(-rot);
  msEye(Cx - 1 - (pvx - shift + c * lx - s * ly), Cy + pvy + s * lx + c * ly, Z * 0.5, eyeG, 0, flare);
}
const rsFaC = new Map();
function rsFredArm(tx, ty, Z) {      // Freddy's claw arm (his real picture of the slash, black), enlarged and mirrored so that the blades point left; (tx, ty) = the tips of the blades; the sleeve behind the picture's 5 columns of it is those same real sleeve pixels, repeated all the way off the right edge of the screen, with the same violet outline
  let c = rsFaC.get(Z); if (!c) { const B = rsFred(fredA(0, 12)).B; c = document.createElement('canvas'); c.width = 94 * Z; c.height = 12 * Z; const g = c.getContext('2d'); g.imageSmoothingEnabled = false; for (let i = 0; i < 20; i++) g.drawImage(B, 44, 22, 4, 12, i * 4 * Z, 0, 4 * Z, 12 * Z); g.drawImage(B, 44, 22, 14, 12, 80 * Z, 0, 14 * Z, 12 * Z); rsFaC.set(Z, c); }
  const R = Math.round, y0 = R(-6.5 * Z); tx = R(tx); ty = R(ty);
  ctx.save(); ctx.translate(tx, ty); ctx.scale(-1, 1); ctx.drawImage(c, -93 * Z, y0); ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = 0.9; ctx.drawImage(rsRim(c, 1, [200, 130, 255]), -93 * Z, y0); ctx.globalAlpha = 0.7; ctx.drawImage(rsRim(c, -1, [150, 80, 230]), -93 * Z, y0); ctx.globalAlpha = 0.6; ctx.drawImage(rsEdge(c, [170, 100, 240]), -93 * Z, y0); ctx.restore();
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
function rsGeo() {      // where Gojo stands, and how high in the air, when his fist meets Freddy's face: found from the real pictures of both (the fist's height and the front of the face at the mouth row)
  const L = rsLay(), key = VW + 'x' + VH + 'x' + gy + 'x' + FRED_IMG.complete; if (rsGeo.key === key) return rsGeo.v; rsGeo.key = key;
  const f = atkF[0][ATK_IMPACT[0]], e = tnEdges(f), top = D.atk0.top || 0, hx = D.atk0.cx - D.atk0.x0, tip = -hx + e.R, F = rsFred(fredF(0)), cr = F.face[3] - 2, fc = rsFrFront(F.B, cr), lift = Math.max(0, Math.round(1 - top + e.ry - cr));      // he leaps into the blow: his fist is lower than Freddy's mouth
  return rsGeo.v = { gxC: L.FX - (fc - RS_FC) - 2 - tip, tipY: gy - 60 - top + e.ry - lift, tip, lift, H: 60, f, cr, fc };
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
  { const bx = [Math.round(VW * 0.635), Math.round(VW * 0.765)], bl = L.back; rsTable((bx[0] + bx[1]) / 2, bx[1] - bx[0] - 13, bl); rsBowl(bx[0] + 12, bl, T, true); rsBowl(bx[1] - 12, bl, T, true); for (let i = 0; i < 2; i++) { rsStool(bx[i], bl); rsPerson(HUM[3 + i].walk[0], null, bx[i], bl, i === 1, rsEat(T, i * 0.4 + 0.2), 0, 1); } }
  rsPortal(L.PX, open * (1 - clamp01((T - (RS_SEQ.end - RS_SEQ[RS_SEQ.length - 1].d)) / 1.2)), T);
  if (open > 0.3) { ctx.save(); ctx.fillStyle = 'rgba(40,12,70,0.35)'; for (let i = 0; i < 10; i++) { const ph = (T * 0.3 + i * 0.1) % 1, fx = L.PX - ph * 120 * U * open, fy = gy + 6 + ((i * 7) % 12); ctx.globalAlpha = 0.55 * (1 - ph) * open; ctx.beginPath(); ctx.ellipse(fx, fy, 14 * U * (0.4 + ph), 2.5 * U, 0, 0, 6.2832); ctx.fill(); } ctx.restore(); }      // a low black fog creeps out of the portal along the floor
  // the diners in the way and their tables (the kills happen as Gojo's body passes)
  const hitN = (x) => flying && gxF <= x + 12, tAB = flying && gxF <= L.tx + 14;
  for (let i = 0; i < 2; i++) { const T0 = L.tbl[i], broken = i === 0 ? hitN(L.npc[1].x) : hitN(L.npc[2].x); rsTable(T0.x, T0.w, 0, broken); if (!broken) { rsBowl(T0.x + (i === 0 ? -4 : 0), 0, T, true); if (i === 0) rsBowl(T0.x + 5, 0, T, true); } }
  L.npc.forEach((n, i) => { rsStool(n.x, 0); if (!hitN(n.x)) rsPerson(HUM[n.t].walk[0], null, n.x, 0, n.f, rsEat(T, i * 0.37), 0, 1); });
  rsTable(L.tx, L.GX - L.YX - 13, 0, tAB); if (!tAB) { rsBowl(L.YX + 12, 0, T, true); rsBowl(L.GX - 12, 0, T, true); }
  if (tAB) once2('tblA', () => snd('rssmash'));
  // Yuji: sits and eats on his stool (a new sitting picture), stands when Gojo does, steps up and is stopped by Gojo's hand, then backs away into the back row
  rsStool(L.YX, 0); { const a = T >= tW ? clamp01((T - tW) / 0.2) : 0, q = ease3(clamp01((T - tW - 0.2) / 0.4)), r = ease3(clamp01((T - tC) / 0.6)), yx = Math.round(L.YX + lerp(0, Math.round(11 * U), q) - lerp(0, Math.round(4 * U), r)), lane = Math.round(lerp(0, L.back, r)), mv = T >= tW + 0.2 && q < 1 ? 'fwd' : T >= tC && r < 1 ? 'back' : 'idle';
    const eat = T < tP + 0.5 && st.k !== 'say' ? rsEat(T, 0.3) : 0, idle = tnPick({ now: nowMs }), p = mv === 'idle' ? idle : tnPick({ idle: false, mode: mv, now: nowMs, modeAt: (mv === 'fwd' ? tW + 0.2 : tC) * 1000 });
    if (a < 1) rsPerson(idle.set[idle.fi], idle.info, L.YX, 0, false, eat, 0, 1 - a);
    if (a > 0) { ctx.save(); ctx.translate(0, lane); ctx.globalAlpha = a; shadow(yx, 9); sprAt(p.set[p.fi], p.info, yx, p.lift, false, 0); ctx.restore(); }
  }
  rsStool(L.GX, 0);
  // Gojo: sits facing Yuji, turns to the portal, stands with an arm out (to stop Yuji), runs with the purple punch, hits, is grabbed, is punched away
  { const gTalk = st.k === 'say' && st.w === 'GOJO' && t1 * TN_RATE < (st.a + st.b).length + 3, mouth = gTalk ? 1 + (Math.floor(T * 11) % 2) : 0, a = T >= tW ? clamp01((T - tW) / 0.2) : 0, flip = T < tP + 1.5;
    if (T < tC) {
      const eat = T < tP + 0.5 && st.k !== 'say' ? rsEat(T, 0.0) : 0, f = idleF[Math.floor(T * IDLE_FPS) % idleF.length];
      if (a < 1) rsPerson(f, D.idle, L.GX, 0, flip, eat, mouth, 1 - a);
      const kb = T >= tW + 0.45 ? ease3(clamp01((T - tW - 0.45) / 0.25)) : 0;      // the arm held out behind him to stop Yuji (a new picture of Gojo)
      if (a > 0) { ctx.save(); ctx.globalAlpha = a; shadow(L.GX, 9); { const bl = kb > 0 ? rsGojoBlock(f, kb) : null; sprAt(bl || f, bl ? { ...D.idle, cx: D.idle.cx + bl.pad } : D.idle, L.GX, 0, flip, mouth); } ctx.restore(); }
    } else if (k === 'charge' || (k === 'punch') || (k === 'launch' && !flying)) {
      const rt = clamp01((T - tC) / (RS_SEQ.find(s => s.k === 'charge').d)), gx = Math.round(lerp(L.GX, G.gxC, ease3(rt))), run = k === 'charge' && rt < 1, fr = run ? RUNF[Math.floor((T - tC) * 30) % 15] : G.f, info = run ? D.run : D.atk0, lift = k === 'charge' ? G.lift * ease3(clamp01((T - (tPu - 0.35)) / 0.35)) : G.lift;
      for (let i = 3; i >= 1 && run; i--) { ctx.globalAlpha = 0.14 * (4 - i); ctx.drawImage(RUNF[Math.floor((T - tC) * 30) % 15], gx - i * 7 - (D.run.cx - D.run.x0), gy - 60 - (D.run.top || 0) - lift); } ctx.globalAlpha = 1;
      shadow(gx, 9); sprAt(fr, info, gx, lift, false, 0); const px = run ? gx + 22 * U : G.gxC + G.tip, py = run ? gy - 44 * U - lift : G.tipY, pp = k === 'launch' ? Math.max(0.2, 1 - u / 1.6) : clamp01(rt * 1.1);
      rsPurple(px, py, T, pp, U);
    } else if (flying) {
      const age = u - uF, ang = -Math.min(1.5, age * 8) + (hitW ? 0 : Math.sin(age * 9) * 0.06), src = idleF[0], hx = D.idle.cx - D.idle.x0, pivY = gy - 30 - Math.round(G.lift * Math.max(0, 1 - age / 0.25));
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
    ctx.save(); if (T < tE + 3.0) { ctx.beginPath(); ctx.rect(0, 0, L.PX + 1, VH); ctx.clip(); } rsAura(mxp, T, ease3(clamp01((T - tE) / 2)), G.H);
    const q = u - RS_LAUNCH.punch, mode = walking ? 'walk' : (k === 'launch' || k === 'black') ? (q > -0.05 && q < 0.5 ? 'punch' : u >= RS_LAUNCH.grab && q <= -0.05 ? 'grab' : 'idle') : 'idle';      // his claw takes Gojo's wrist, then he strikes
    shadow(mxp, 9); rsFredDraw(mxp, T, { mode, d: L.PX + 8 * U - mxp, eye: pulse }); ctx.restore();
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
  const fo = last ? clamp01((T - (RS_SEQ.end - RS_SEQ[RS_SEQ.length - 1].d)) / (RS_SEQ[RS_SEQ.length - 1].d - 0.2)) : 0; if (fo > 0) { ctx.fillStyle = 'rgba(0,0,0,' + fo.toFixed(3) + ')'; ctx.fillRect(0, 0, VW, VH); const ez = fo < 1 ? 1 - ease3((fo - 0.3) / 0.7) : 0; { const ee = rsEyeAt(L.FX, rsFred(fredF(0)), 0); msEye(ee[0], ee[1], Math.max(1, U * 0.75), 0.9 * ez, 0, 0); } }
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
function rsCloseA(T, u) {      // Gojo (his own picture, enlarged) smirks; his fist is ON Freddy's face; the head is thrown back from the blow and a HUGE shockwave runs out
  const U = rsLay().U, Z = rsZ(), G = rsGoCrop(0, Z), Cx = Math.round(VW * 0.56), Cy = Math.max(Math.round(VH * 0.58), Math.round(VH * 0.1) + 9 + G.tipY), snap = ease3(clamp01((u - 0.28) / 0.3)), shk = u < 1 ? 6 * (1 - u) : 0, zk = 1 + 0.07 * clamp01(u / 3.4);
  ctx.save(); ctx.translate(Cx, Cy); ctx.scale(zk, zk); ctx.translate(-Cx, -Cy); if (shk > 0.2) ctx.translate(Math.round((Math.random() * 2 - 1) * shk), Math.round((Math.random() * 2 - 1) * shk));
  rsSmoke(Cx + 70 * U, Cy - 10 * U, T, U); rsFredHead(Cx, Cy, Z, 0.34 * snap, Math.round(9 * Z * snap), 0.8 + 0.3 * (1 - snap), 0.6);
  ctx.drawImage(G.c, Math.round(Cx - G.tipX + 3 * snap), Math.round(Cy - G.tipY)); rsFistGlow(Cx, Cy, Z * 0.34, 1, T);
  ctx.restore(); if (u < 0.6) { const q = u / 0.6, sc = 1.03 + 0.07 * (1 - q); ctx.save(); ctx.globalAlpha = 0.42 * (1 - q); ctx.drawImage(ctx.canvas, 0, 0, VW, VH, Cx - Cx * sc, Cy - Cy * sc, VW * sc, VH * sc); ctx.restore(); }      // a blur of the picture rushing out from the blow
  rsShock(Cx, Cy, u, U * 1.4);
}
function rsCloseB(T, u) {      // Freddy's head comes back, unhurt, pushing against the fist that is still on his face (only Gojo's forearm and fist are in this picture)
  const U = rsLay().U, Z = rsZ(), G = rsGoCrop(0, Z, true), Cx = Math.round(VW * 0.36), Cy = Math.round(VH * 0.58), q = ease3(clamp01((u - 0.5) / 1.8));
  rsSmoke(Cx + 60 * U, Cy - 6 * U, T, U * 1.2); rsFredHead(Cx, Cy, Z, 0.34 * (1 - q), Math.round(9 * Z * (1 - q)), 0.8 + 0.15 * Math.sin(T * 5), 0.1 + 0.5 * q);
  const jx = Math.round((Math.random() - 0.5) * 1.8), jy = Math.round((Math.random() - 0.5) * 1.8); ctx.drawImage(G.c, Cx - G.tipX + jx, Cy - G.tipY + jy); rsFistGlow(Cx, Cy, Z * 0.34, 0.85 - 0.3 * q, T);
}
function rsCloseC(T, u) {      // Gojo (his own picture, enlarged) is shocked; his fist is still out; Freddy's claw arm (his real picture of the slash) closes round it
  const U = rsLay().U, Z = rsZ(), G = rsGoCrop(1, Z), Cx = Math.round(VW * 0.80), Cy = Math.max(Math.round(VH * 0.60), Math.round(VH * 0.1) + 9 + G.tipY), hand = ease3(clamp01((u - 2.0) / 0.35));
  const jx = Math.round((Math.random() - 0.5) * 2), jy = Math.round((Math.random() - 0.5) * 2), gx = Math.round(Cx - G.tipX) + jx, gy0 = Math.round(Cy - G.tipY) + jy, hx = gx + G.mouth[0] - 2 * Z, hy = gy0 + G.mouth[1] - 6 * Z;
  ctx.save(); ctx.strokeStyle = 'rgba(235,225,255,' + (0.5 + 0.25 * Math.sin(T * 40)).toFixed(3) + ')'; ctx.lineWidth = 1; for (let i = 0; i < 26; i++) { const an = i * 0.2417, r0 = (34 + (i % 3) * 6) * Z, r1 = r0 + (22 + (i % 4) * 10) * Z; ctx.beginPath(); ctx.moveTo(hx + Math.cos(an) * r0, hy + Math.sin(an) * r0); ctx.lineTo(hx + Math.cos(an) * r1, hy + Math.sin(an) * r1); ctx.stroke(); } ctx.restore();      // shock lines
  ctx.drawImage(G.c, gx, gy0); rsFistGlow(Cx, Cy, Z * 0.34, u > 2.35 ? 0.4 + 0.5 * Math.random() : 0.75, T);
  const dy = (T * 30) % 26; ctx.fillStyle = 'rgba(190,232,255,' + (0.95 - dy / 30).toFixed(3) + ')'; ctx.fillRect(gx + G.mouth[0] - 7 * Z, gy0 + G.mouth[1] - 10 * Z + Math.round(dy), Math.round(Z * 0.8), Math.round(Z * 1.2)); ctx.fillRect(gx + G.mouth[0] - 7 * Z, gy0 + G.mouth[1] - 10 * Z + Math.round(dy) - Math.round(Z * 0.8), Math.max(1, Math.round(Z * 0.4)), Math.round(Z * 0.8));      // a drop of sweat runs down his temple
  if (hand > 0) { rsFredArm(Cx - 3 * Z + Math.round((1 - hand) * 50 * Z), Cy, Z); if (u > 2.35) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = 'rgba(255,255,255,' + clamp01(1 - (u - 2.35) / 0.2).toFixed(3) + ')'; ctx.fillRect(0, 0, VW, VH); ctx.restore(); } }
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
