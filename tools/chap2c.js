// ---------------------------------------------------------------- v1.102 THE EYES (this file is spliced into template.html by build_html.py, after chap2b.js): what the Master does to Gojo's face
// The last scene of chapter 2 goes on after the gauntlet (the shots etalk ... ecrush of C4_SEQ, made of the code below): the Master tears Gojo's blindfold off; the bare face (the game's own picture of Gojo without his blindfold, blood and all) is seen; the Master's claw clamps his eyes and Gojo screams and hits him again and again while the eyes go redder and redder; he kicks the Master away, the eyes hang out of their sockets by a few blood vessels, he pushes them back in (red now, with the blue still in them), tries to cast his domain and fails; the Master pulls him back, tears one eye out, crushes it and holds up what is left: the blue part, glowing.
// Everything on the face is drawn in the pixels of Gojo's own picture: ONE FACE PIXEL IS Z SCREEN PIXELS (Z a whole number) and everything that is added to his face (blood, the claw, the eyeballs and the vessels they hang by, his hands, the glow of his eyes) is made of whole face pixels under the same transform (c6On), so all of it lies on the grid of the picture and none of it looks pasted on. Every shot is a pure function of the scene time T, so a tap that skips and a test that jumps in time always draw the right picture.

// ---- the face: the game's picture of Gojo (idle, with the blood on it) cut as his bust (18 x 37 pixels), with his blindfold (what the game draws) or without it (blindDown: the same head redrawn with his eyes, the blood kept)
const c6BC = {};
function c6Bust(bare) {
  const k = bare ? 1 : 0; if (c6BC[k]) return c6BC[k];
  const f0 = bloody(idleF[0]), f = bare ? blindDown(f0) : f0, w = f0.width, h = f0.height, d = f0.getContext('2d').getImageData(0, 0, w, h).data; let top = -1, x0 = w, x1 = 0;
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) if (d[(y * w + x) * 4 + 3] > 40) { if (top < 0) top = y; if (y < top + 36) { x0 = Math.min(x0, x); x1 = Math.max(x1, x); } }      // (the cut is the one of rsGoBust: his bust in the talk)
  const sx = Math.max(0, x0 - 1), sy = Math.max(0, top - 1), sw = Math.min(w - sx, x1 + 2 - sx), sh = Math.min(h - sy, 37), c = document.createElement('canvas'); c.width = sw; c.height = sh; c.getContext('2d').drawImage(f, sx, sy, sw, sh, 0, 0, sw, sh);
  return c6BC[k] = c;
}
let c6LC = null;      // the small canvas the light of his eyes is made on (face pixels + a margin of 8 on the left and 4 on the top), cut to the shape of his head
function c6Shade(bare) {      // his head's shape in a cold violet, except the blood (so that the blood stays as bright as it is): multiplied onto the picture it dims it into shadow
  const k = bare ? 's1' : 's0'; if (c6BC[k]) return c6BC[k]; const b = c6Bust(bare), c = document.createElement('canvas'); c.width = b.width; c.height = b.height; const g = c.getContext('2d'); g.drawImage(b, 0, 0); const im = g.getImageData(0, 0, c.width, c.height), d = im.data;
  for (let i = 0; i < d.length; i += 4) { if (d[i] >= 100 && d[i + 1] <= 40 && d[i + 2] <= 50) d[i + 3] = 0; else { d[i] = 107; d[i + 1] = 95; d[i + 2] = 168; } } g.putImageData(im, 0, 0); return c6BC[k] = c;
}
function c6Lit(bare, lights) {      // light on his face from lights [{ x, y, R, a, col: 'r,g,b' }]: made in face pixels in 6 steps (like the rest of the picture), and only on the pixels of his head
  if (!c6LC) { c6LC = document.createElement('canvas'); c6LC.width = 48; c6LC.height = 44; } const g = c6LC.getContext('2d'); g.clearRect(0, 0, 48, 44); g.globalCompositeOperation = 'lighter';
  for (const l of lights) for (let y = Math.floor(l.y - l.R); y <= Math.ceil(l.y + l.R); y++) for (let x = Math.floor(l.x - l.R); x <= Math.ceil(l.x + l.R); x++) { const d = Math.hypot(x + 0.5 - l.x, y + 0.5 - l.y); if (d >= l.R) continue; const q = Math.floor(l.a * Math.pow(1 - d / l.R, 1.3) * 6) / 6; if (q > 0) { g.fillStyle = 'rgba(' + l.col + ',' + q.toFixed(3) + ')'; g.fillRect(x + 8, y + 4, 1, 1); } }
  g.globalCompositeOperation = 'destination-in'; g.drawImage(c6Bust(bare), 8, 4); g.globalCompositeOperation = 'source-over';
  ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.drawImage(c6LC, -8, -4); ctx.restore();
}
function c6Mix(a, b, t) {      // the colour between two '#rrggbb' colours
  t = clamp01(t); const p = s => [1, 3, 5].map(i => parseInt(s.slice(i, i + 2), 16)), A = p(a), B = p(b);
  return '#' + A.map((v, i) => Math.round(v + (B[i] - v) * t).toString(16).padStart(2, '0')).join('');
}
function c6On(Z, fx, fy, sx, sy) { ctx.save(); ctx.translate(Math.round(sx - fx * Z), Math.round(sy - fy * Z)); ctx.scale(Z, Z); }      // the face's own pixels: the face point (fx, fy) is put on the screen point (sx, sy) and one face pixel is Z screen pixels
const c6Off = () => ctx.restore();
const c6P = (x, y, c, w, h) => { ctx.fillStyle = c; ctx.fillRect(x, y, w || 1, h || 1); };      // one face pixel (or a block of them): the coordinates are whole numbers
function c6Line(x0, y0, x1, y1, c) {      // a line one pixel thick
  x0 = Math.round(x0); y0 = Math.round(y0); x1 = Math.round(x1); y1 = Math.round(y1); const n = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0), 1); ctx.fillStyle = c;
  for (let i = 0; i <= n; i++) ctx.fillRect(Math.round(x0 + (x1 - x0) * i / n), Math.round(y0 + (y1 - y0) * i / n), 1, 1);
}
function c6Band(x0, y0, x1, y1, w, c, rim) {      // a thick straight band of whole pixels (a sleeve, a strip of cloth) from (x0, y0) to (x1, y1), w pixels thick; its upper edge in the colour rim
  const n = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0), 1), h = Math.floor(w / 2);
  for (let i = 0; i <= n; i++) { const px = Math.round(x0 + (x1 - x0) * i / n), py = Math.round(y0 + (y1 - y0) * i / n) - h; c6P(px, py, c, 1, w); if (rim) c6P(px, py, rim); }
}
const c6H = (i, k) => (Math.imul(i * 7919 + k * 104729 + 12345, 2654435761) >>> 0) / 4294967296;      // a repeatable random number (0 to 1) for thing i and trait k

// ---- the eyes: the pixels of his two eyes in the bare picture, with the colour each has and the colour it takes when the eye is bloodshot (the white and the lids go red; the blue stays)
const C6_EYE = [
  { c: [8.5, 12.5], px: [[7, 11, '#ffffff', '#d4141f'], [8, 11, '#0e2c70', '#6e0a12'], [9, 11, '#0e2c70', '#6e0a12'], [10, 11, '#0e2c70', '#6e0a12'], [7, 12, '#d6f5ff', '#e8505a'], [8, 12, '#7ee4ff', '#7ee4ff'], [9, 12, '#ffffff', '#ffd6d6'], [10, 12, '#59b8ff', '#59b8ff'], [7, 13, '#a2dcfb', '#c8404a'], [8, 13, '#2f7fe0', '#2f7fe0'], [9, 13, '#1a4fb4', '#1a4fb4'], [10, 13, '#2f7fe0', '#2f7fe0']] },
  { c: [13.5, 12.5], px: [[13, 11, '#0e2c70', '#6e0a12'], [14, 11, '#0e2c70', '#6e0a12'], [13, 12, '#7ee4ff', '#7ee4ff'], [14, 12, '#59b8ff', '#59b8ff'], [13, 13, '#2f7fe0', '#2f7fe0'], [14, 13, '#62b4f5', '#62b4f5']] }];
const C6_SK = ['#fbe3d4', '#eec7b4', '#d1a08f', '#a06d68'];      // his skin: lit, normal, shade, dark

// ---- blood on the face: patches that can be stained, each with the "level" at which it is stained (found once from the bare picture itself): clots in the hair, a dark bruise round the eyes, thin patches on the cheeks and the jaw; and rivers that run from the eyes down the face (they grow with the level)
let c6Stain = null;
function c6Noise(u, v) {      // smooth noise (0 - 1): random values on a grid, blended
  const i = Math.floor(u), j = Math.floor(v), fx = u - i, fy = v - j, sx = fx * fx * (3 - 2 * fx), sy = fy * fy * (3 - 2 * fy), n = (a, b) => c6H(a * 57 + b, 13);
  return lerp(lerp(n(i, j), n(i + 1, j), sx), lerp(n(i, j + 1), n(i + 1, j + 1), sx), sy);
}
function c6Stains() {
  if (c6Stain) return c6Stain; const b = c6Bust(true), d = b.getContext('2d').getImageData(0, 0, b.width, b.height).data, S = [];
  for (let y = 8; y < 24; y++) for (let x = 4; x < 18; x++) {
    const i = (y * b.width + x) * 4; if (d[i + 3] < 200) continue; if (C6_EYE.some(e => e.px.some(q => q[0] === x && q[1] === y))) continue;
    const de = Math.min(...C6_EYE.map(e => Math.hypot(x - e.c[0], (y - e.c[1]) * 1.25))), n = c6Noise(x / 1.8, y / 1.8), h = c6H(x * 17 + y, 9); let thr, c;
    if (y <= 10) { thr = 0.5 + (1 - n) * 0.9; c = h < 0.5 ? BLD[1] : h < 0.8 ? BLD[2] : BLD[0]; }      // (clots in the hair)
    else if (de <= 3.7) { thr = 0.1 + de * 0.13 + (n - 0.5) * 0.4; c = h < 0.3 ? BLD[3] : h < 0.8 ? BLD[2] : BLD[1]; }      // (the bruise: dark, swollen)
    else { thr = 0.6 + de * 0.04 + (0.5 - n) * 0.8; c = h < 0.5 ? BLD[1] : h < 0.78 ? BLD[0] : BLD[2]; }      // (thin patches on the cheeks, the jaw, the neck)
    if (thr <= 1) S.push({ x, y, thr, c });
  }
  S.sort((a, b) => a.thr - b.thr); return c6Stain = S;
}
const C6_RUN = (() => { const R = []; for (let k = 0; k < 15; k++) { const e = k & 1; R.push({ x: Math.max(5, Math.min(16, Math.round((e ? 13.5 : 8.5) + (c6H(k, 61) - 0.5) * 8))), y: 10 + Math.floor(c6H(k, 62) * 5), len: 5 + Math.floor(c6H(k, 63) * 11), w: c6H(k, 64) < 0.4 ? 2 : 1, st: 0.15 + c6H(k, 65) * 2.6, sp: 5 + c6H(k, 66) * 4 }); } return R; })();      // the rivers of blood: where each one starts, how long it gets, how wide, when it starts (level) and how fast it runs
function c6Blood(L, T) {      // L = the blood level: 0 nothing added, 1 a first trickle, 2 the eyes run, 3 the face is red, 4 as bloody as it can be
  for (const p of c6Stains()) { if (p.thr * 4 > L) break; c6P(p.x, p.y, p.c); }
  C6_RUN.forEach((r, i) => {
    const n = Math.min(r.len, Math.floor((L - r.st) * r.sp)); if (n <= 0) return;
    for (let j = 0; j < n; j++) { const wob = c6H(i * 13 + j, 3) < 0.25 ? 1 : 0; if (r.w === 1) c6P(r.x + wob, r.y + j, j > n - 3 ? BLD[1] : c6H(i * 7 + j, 4) < 0.3 ? BLD[2] : BLD[0]); else { c6P(r.x + wob, r.y + j, BLD[0]); c6P(r.x + wob + 1, r.y + j, BLD[2]); } }
    c6P(r.x, r.y, '#ff6a6a'); c6P(r.x + (r.w > 1 ? 1 : 0), r.y + n, BLD[0]);      // (a wet shine where it starts, a rounded head)
    if (L > r.st + 0.8 && n >= r.len) { const q = (T * 0.8 + i * 0.37) % 1, A = ctx.globalAlpha; ctx.globalAlpha = A * (1 - q * 0.6); c6P(r.x, r.y + n + 1 + Math.round(q * q * 11), BLD[0], 1, 2); ctx.globalAlpha = A; }      // (a drop falls from its end)
  });
}

// ---- the claw: the Master's hand (black, with a violet rim of light on its upper and left edges): the back of the hand, four fingers and a long thin blade on each (as on Freddy's glove); it comes from the right and the blades straddle his eyes (two above them, two below). Drawn in two passes: pass 0 = its rim of light and the glow behind it (BEFORE the face, so that the rim only shows where the hand is against the dark and never on the face), pass 1 = the black hand (AFTER the face).
// o.x = how far it is from the face (0 = on it), o.y = how high, o.tips = where the four blades end when they are shut (instead of the eyes), o.thick = 1 for blades two pixels thick (the big close-ups), o.ct = how far the blades have closed (0 = spread wide open, 1 = shut round the eyes), o.dig = how deep they press into the eyes (0 - 1), o.hook = 1 for the grip on the blindfold (the blades close on the band's front end, nothing is dug in)
function c6Claw(o, pass) {
  const x = Math.round(o.x || 0), y = Math.round(o.y || 0), ct = ease3(clamp01(o.ct || 0)), dg = clamp01(o.dig || 0), K = '#05030a', by = [8, 9, 15, 16];
  const open = [[11, 2], [14, 4], [14, 21], [11, 23]], shut = o.tips || (o.hook ? [[14, 9], [15, 10], [15, 14], [14, 15]] : [[8, 9 + dg], [12, 10 + dg], [12, 14 - dg], [8, 15 - dg]]);
  const shapes = (col, dx, dy) => {
    c6Band(30 + x + dx, 14 + y + dy, 78 + x + dx, 37 + y + dy, 8, col);      // (the sleeve runs down to the right: his shoulder is far below the edge of the picture)
    for (let r = 0; r < 11; r++) { const a = [22, 21, 20, 20, 20, 20, 20, 20, 20, 21, 22][r], b = [27, 28, 29, 29, 29, 29, 29, 29, 29, 28, 27][r]; c6P(a + x + dx, 7 + r + y + dy, col, b - a + 1, 1); }      // (the back of the hand)
    for (const f of [8, 15]) c6P(17 + x + dx, f + y + dy, col, 5, 2);      // (the fingers, two by two)
    for (let i = 0; i < 4; i++) { const t = Math.round(lerp(open[i][0], shut[i][0], ct)), u = Math.round(lerp(open[i][1], shut[i][1], ct)); c6Line(17 + x + dx, by[i] + y + dy, t + x + dx, u + y + dy, col); if (o.thick) c6Line(17 + x + dx, by[i] + y + dy + (i < 2 ? -1 : 1), t + x + dx, u + y + dy + (i < 2 ? -1 : 1), col); }      // (the blades: 1 pixel thick, or 2 in the big close-up)
  };
  if (pass === 0) { c6Glow2(x + 24, y + 12, 24, 0.55); shapes('#9a62f0', -1, 0); shapes('#9a62f0', 0, -1); return; }
  shapes(K, 0, 0);
  for (let r = 0; r < 4; r++) c6P(20 + x, 8 + r * 2 + y, '#3a2a60');      // (the knuckles)
  c6P(27 + x, 8 + y, '#241a40', 1, 8);      // (the cuff of the sleeve)
  for (let i = 0; i < 4; i++) { const t = Math.round(lerp(open[i][0], shut[i][0], ct)), u = Math.round(lerp(open[i][1], shut[i][1], ct)); c6P(t + x, u + y, '#c8b8f0'); }      // (a glint on the point of each blade)
}
function c6Glow2(x, y, R, a) {      // the violet light that shows the black hand against the dark (in face pixels: a few discs, each fainter than the one inside it)
  ctx.save(); for (let r = 4; r >= 1; r--) { ctx.fillStyle = 'rgba(120,56,176,' + (a * 0.1 * (5 - r) / 4).toFixed(3) + ')'; const R2 = R * r / 4; for (let j = -Math.round(R2); j <= Math.round(R2); j++) { const w = Math.round(Math.sqrt(Math.max(0, R2 * R2 - j * j))); ctx.fillRect(x - w, y + j, 2 * w, 1); } } ctx.restore();
}

// ---- the eyes themselves
function c6Frame(e, bx, red, bulge) {      // the swollen, bloodshot rim round an eye that is bloodshot (red) or bulging (bulge); bx = how far it has been pushed forward
  const xs = e.px.map(q => q[0]), x0 = Math.min(...xs) + bx, x1 = Math.max(...xs) + bx;
  for (let x = x0 - 1; x <= x1 + 1; x++) for (const y of [10, 14]) { const h = c6H(x * 5 + y, 21); if (bulge > 0.3 && x >= x0 && x <= x1) c6P(x, y, h < 0.35 ? '#d4141f' : '#d86a78'); else if (red > 0 && h < red * 1.1) c6P(x, y, h < 0.5 ? BLD[2] : BLD[1]); }
  for (const x of [x0 - 1, x1 + 1]) for (let y = 11; y <= 13; y++) if (c6H(x * 5 + y, 22) < red * 1.1) c6P(x, y, y === 12 ? BLD[0] : BLD[2]);
}
function c6Eyes(o) {      // his eyes in the bare face: o.red = how bloodshot (0 - 1), o.bulge = how far they swell out of the sockets (0 - 1), o.gone = the sockets that are empty (bit 1 = the big eye, bit 2 = the small one), o.glow = how brightly the blue shines (0 - 1)
  C6_EYE.forEach((e, n) => {
    if (o.gone & (1 << n)) return; const bx = o.bulge > 1.2 ? 2 : o.bulge > 0.55 ? 1 : 0;
    if (o.red > 0 || o.bulge > 0) c6Frame(e, bx, o.red || 0, o.bulge || 0);
    for (const [x, y, c0, c1] of e.px) c6P(x + bx, y, c6Mix(c0, c1, o.red || 0));
    if (bx) c6P(e.px[0][0], 11, BLD[2], bx, 3);      // (the tissue that is stretched behind an eye that is pulled forward)
    if (o.glow > 0) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = o.glow * 0.4 * (0.6 + 0.4 * Math.sin((o.T || 0) * 40 + n * 2)); for (const q of e.px) if (q[3] === q[2]) c6P(q[0] + bx, q[1], '#ffffff'); ctx.restore(); }
  });
}
function c6Star(x, y, len, a) {      // a four-pointed glint of light (the Six Eyes shine), its arms getting fainter toward their ends
  ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = '#d6f5ff'; for (let i = 1; i <= len; i++) { ctx.globalAlpha = a * (1 - (i - 1) / len); ctx.fillRect(x + i, y, 1, 1); ctx.fillRect(x - i, y, 1, 1); ctx.fillRect(x, y + i, 1, 1); ctx.fillRect(x, y - i, 1, 1); } ctx.globalAlpha = a; ctx.fillStyle = '#ffffff'; ctx.fillRect(x - 1, y, 3, 1); ctx.fillRect(x, y - 1, 1, 3); ctx.restore();
}
function c6Socket(n) {      // an empty eye socket: a dark red hole in a rim of torn flesh, with blood welling in its lower lip
  const e = C6_EYE[n], xs = e.px.map(q => q[0]), x0 = Math.min(...xs), x1 = Math.max(...xs);
  c6P(x0 - 1, 10, BLD[3], x1 - x0 + 3, 1); c6P(x0 - 1, 14, BLD[2], x1 - x0 + 3, 1); c6P(x0 - 1, 11, BLD[2], 1, 3); c6P(x1 + 1, 11, BLD[2], 1, 3); c6P(x0, 11, '#2a0408', x1 - x0 + 1, 3); c6P(x0 + 1, 12, '#12010a', Math.max(1, x1 - x0 - 1), 1);
  c6P(x0, 14, BLD[0], x1 - x0 + 1, 1); c6P(x0 + (x1 - x0 >> 1), 14, '#ff5a5a');
}
function c6Iris(x, y) {      // the blue part of an eye on its own: three pixels across (a ring of blue, a lighter cross, a bright middle and a white catchlight): the stone the Master is left with
  c6P(x - 1, y - 1, '#2f7fe0', 3, 3); c6P(x, y - 1, '#59b8ff', 1, 3); c6P(x - 1, y, '#59b8ff', 3, 1); c6P(x, y, '#d6f5ff'); c6P(x - 1, y - 1, '#ffffff');
}
function c6Ball(x, y, o) {      // a loose eyeball, 5 pixels across, its centre on the pixel (x, y): white (red as o.red), the blue iris looking toward (o.ix, o.iy) (each -1, 0 or 1) and the thick stub of nerve at its back (o.up = 0 when it is held in a hand and has none); o.flat = squeezed flat (7 across, 3 high)
  x = Math.round(x); y = Math.round(y); o = o || {}; const red = o.red == null ? 0.5 : o.red, ix = o.ix || 0, iy = o.iy || 0, base = ['#f4f2f8', '#dcd6e8', '#dcd6e8', '#c5bbdc', '#a99fc0'];
  (o.flat ? [[-2, -1, 5], [-3, 0, 7], [-2, 1, 5]] : [[-1, -2, 3], [-2, -1, 5], [-2, 0, 5], [-2, 1, 5], [-1, 2, 3]]).forEach(([dx, dy, w], r) => c6P(x + dx, y + dy, c6Mix(base[o.flat ? r + 1 : r], '#d4141f', red * 0.75), w, 1));
  if (!o.flat) for (const [dx, dy] of [[-2, -1], [2, 1], [1, -2], [-1, 2], [2, -1], [-2, 1]]) if (c6H(x * 3 + dx, y * 5 + dy + 7) < 0.35 + red * 0.65) c6P(x + dx, y + dy, '#d4141f');
  c6Iris(x + ix, y + iy);
  if (o.up !== 0 && !o.flat) { c6P(x, y - 3, '#b8707a'); c6P(x - 1, y - 2, '#8e0c18', 1, 1); c6P(x + 1, y - 2, '#8e0c18', 1, 1); }
}
function c6Strands(ax, ay, bx, by, n, sag, T, snap) {      // n thin blood vessels from the socket (ax, ay) to the back of an eyeball (bx, by): each hangs in a curve that sways a little (a dark shadow beside each so that it shows on the red); snap = how many of them have snapped (a snapped one is two short stumps: 4 pixels at the socket, 5 at the eyeball)
  for (let k = 0; k < n; k++) {
    const cx = (ax + bx) / 2 + (k - (n - 1) / 2) * 1.7 + sag * 0.35 + Math.sin(T * 3.1 + k * 2.1) * 0.8, cy = (ay + by) / 2 + sag * 0.6, L = Math.round(Math.hypot(bx - ax, by - ay)) + 6, broken = k < (snap || 0), pts = []; let px0 = -99, py0 = -99;
    for (let i = 0; i <= L; i++) { const t = i / L, u = 1 - t; if (broken && t > Math.min(0.4, 4 / L) && t < Math.max(0.62, 1 - 5 / L)) continue; const px = Math.round(u * u * ax + 2 * u * t * cx + t * t * bx), py = Math.round(u * u * ay + 2 * u * t * cy + t * t * by); if (px === px0 && py === py0) continue; px0 = px; py0 = py; pts.push([px, py, i]); }
    for (const p of pts) c6P(p[0] + 1, p[1], '#3a0610'); for (const p of pts) c6P(p[0], p[1], p[2] % 3 === 2 ? '#d4141f' : k === 1 ? '#ff9a9a' : '#ff6a6a');
  }
}
function c6Mouth(m) {      // his mouth: m = 0 shut (the picture as it is), up to 1 = open as wide as he can scream (rows 16 - 18, under his nose)
  if (m <= 0.05) return; const rows = m > 0.8 ? 3 : m > 0.4 ? 2 : 1;
  c6P(11, 16, '#4a0812', 4, rows); c6P(11, 16, '#f4f2f8'); c6P(13, 16, '#f4f2f8', 2, 1); if (rows > 2) c6P(12, 18, '#d8506a', 2, 1); if (rows > 1) c6P(11, 16 + rows, BLD[2], 4, 1);
}
function c6Hand(x, y, dir) {      // one of Gojo's hands (a few pixels of his own skin and a dark sleeve) with its fingertips on the pixel (x, y): it comes from below, to the left (dir -1) or to the right (dir 1)
  const d = dir || -1; c6Band(x + 3 * d, y + 5, x + 17 * d, y + 19, 6, '#2a2230', '#6d56a0'); c6P(x - 2, y, '#1a0f14', 5, 6); c6P(x - 1, y + 1, C6_SK[1], 3, 4); c6P(x - 1, y + 1, C6_SK[0], 1, 1); c6P(x, y - 1, C6_SK[2], 1, 2); c6P(x + 1, y - 1, C6_SK[1], 1, 2); c6P(x - 2, y - 1, C6_SK[2], 1, 2); c6P(x - 1, y + 4, C6_SK[3], 3, 1);
}
function c6Sign(x, y) {      // Gojo's hand in the sign of his domain: the index finger crossed over the middle finger, both pointing up; the other fingers curled (skin, dark outline); (x, y) = where the two fingers cross
  c6Band(x + 2, y + 9, x + 14, y + 21, 5, '#2a2230', '#6d56a0');      // (the sleeve)
  c6P(x - 3, y + 4, '#1a0f14', 7, 7); c6P(x - 2, y + 5, C6_SK[1], 5, 5); c6P(x - 2, y + 5, C6_SK[0], 2, 1); c6P(x - 2, y + 9, C6_SK[2], 5, 1); c6P(x - 4, y + 6, '#1a0f14', 1, 3); c6P(x - 3, y + 7, C6_SK[2], 1, 1);      // (the back of the hand, the thumb folded in)
  const f = (x0, y0, x1, y1) => { c6Line(x0 - 1, y0, x1 - 1, y1, '#1a0f14'); c6Line(x0 + 1, y0, x1 + 1, y1, '#1a0f14'); c6Line(x0, y0, x1, y1, C6_SK[1]); c6P(x1, y1, C6_SK[0]); c6P(x1 - 1, y1 - 1, '#1a0f14', 3, 1); };
  f(x - 3, y + 4, x + 3, y - 7); f(x + 3, y + 4, x - 3, y - 7);      // (the two fingers cross: the second is over the first)
}
function c6Bolt(x0, y0, x1, y1, seed, T, col) {      // a jagged bolt of light (cursed energy) from one point to another, new every 50 ms
  const n = Math.max(2, Math.ceil(Math.hypot(x1 - x0, y1 - y0) / 3)), k = Math.floor(T * 20) * 13 + seed; let px = x0, py = y0; ctx.save(); ctx.globalCompositeOperation = 'lighter';
  for (let i = 1; i <= n; i++) { const t = i / n, nx = lerp(x0, x1, t) + (i < n ? (c6H(k, i) - 0.5) * 5 : 0), ny = lerp(y0, y1, t) + (i < n ? (c6H(k, i + 40) - 0.5) * 5 : 0); c6Line(px, py, nx, ny, col || '#9ff0ff'); px = nx; py = ny; } ctx.restore();
}
function c6Spurt(T, t0, x, y, n, o) {      // n specks of blood thrown from the face pixel (x, y) at the time t0 (o: v the speed, an the direction (radians), sp how wide they fan, life, g gravity): drawn in face pixels, the same for the same T
  const a = T - t0, life = o.life || 0.6; if (a < 0 || a > life) return; ctx.save(); ctx.globalAlpha = a > life * 0.7 ? 1 - (a - life * 0.7) / (life * 0.3) : 1;
  for (let i = 0; i < n; i++) { const h = c6H(i + (o.seed || 0), 71), an = (o.an || 0) + (c6H(i + (o.seed || 0), 72) - 0.5) * (o.sp || 1.6), v = (o.v || 30) * (0.4 + 0.8 * h); c6P(Math.round(x + Math.cos(an) * v * a), Math.round(y + Math.sin(an) * v * a + (o.g == null ? 60 : o.g) * a * a), o.cols ? o.cols[i % o.cols.length] : c6H(i, 73) < 0.6 ? BLD[0] : BLD[1], c6H(i, 74) < 0.2 ? 2 : 1, c6H(i, 74) < 0.2 ? 2 : 1); }
  ctx.restore();
}
function c6Key(k, t) {      // a value that follows the keys [[t0, v0], [t1, v1], ...] (eased between them; the first and the last value hold)
  if (t <= k[0][0]) return k[0][1]; for (let i = 1; i < k.length; i++) if (t < k[i][0]) { const a = k[i - 1], b = k[i]; return lerp(a[1], b[1], ease3((t - a[0]) / (b[0] - a[0]))); } return k[k.length - 1][1];
}
function c6Arm(blood) {      // Gojo's punching arm in pixels, the tip of the fist at (0, 0): a dark sleeve that gets thinner toward the wrist, with a lit edge and a cuff, and the fist (skin with a dark outline, its knuckles, his blood on it; blood = how much, 0 - 3)
  for (let i = 0; i <= 74; i++) { const t = i / 74, w = Math.round(lerp(10, 6, t)), x = -82 + i, y = Math.round(lerp(8, 1, t) + 2.2 * Math.sin(Math.PI * t)) - Math.floor(w / 2); c6P(x, y, '#2a2230', 1, w); c6P(x, y, '#6d56a0'); if (i % 9 === 4) c6P(x, y + 1, '#3c345a', 1, w - 2); }
  c6P(-9, -3, '#4a3e72', 2, 8);
  c6P(-7, -3, '#1a0f14', 8, 1); c6P(-7, 4, '#1a0f14', 8, 1); c6P(-8, -2, '#1a0f14', 1, 6); c6P(1, -2, '#1a0f14', 1, 6);      // (the outline)
  c6P(-7, -2, C6_SK[1], 8, 6); c6P(-7, -2, C6_SK[0], 8, 1); c6P(-7, 3, C6_SK[2], 8, 1); for (const y of [-1, 0, 1, 2]) c6P(0, y, y & 1 ? C6_SK[3] : C6_SK[2], 1, 1); for (const x of [-2, -4]) c6P(x, -1, C6_SK[3], 1, 4); c6P(-6, -1, C6_SK[2], 2, 1);      // (the fist: the four fingers curled in, the thumb over them)
  for (let i = 0; i < 6 + 5 * blood; i++) { const x = -7 + Math.floor(c6H(i, 41) * 8), y = -2 + Math.floor(c6H(i, 42) * 6); c6P(x, y, BLD[Math.floor(c6H(i, 43) * 3)], 1 + (i & 1), 1); }
}

// ---- the whole head: o.band (1 = with the blindfold), o.L (the blood level), o.red, o.bulge, o.gone, o.glow, o.mouth, o.T, o.dx / o.dy (a shake, in face pixels) and o.loose: the eyeballs that hang out [{ n: the socket, x, y: where the ball is, red, ix, iy, snap, sag, n2: strands (3), held: 1 if no nerve }]
function c6Head(o) {
  ctx.save(); ctx.translate(o.dx || 0, o.dy || 0); ctx.drawImage(c6Bust(!o.band), 0, 0); if (o.dim > 0) { const A = ctx.globalAlpha; ctx.globalCompositeOperation = 'multiply'; ctx.globalAlpha = A * o.dim; ctx.drawImage(c6Shade(!o.band), 0, 0); ctx.globalAlpha = A; ctx.globalCompositeOperation = 'source-over'; }
  if (!o.band) {
    c6Blood(o.L || 0, o.T || 0); if (o.glow > 0) { const f = o.glow * (0.9 + 0.1 * Math.sin((o.T || 0) * 33)); c6Lit(true, C6_EYE.filter((e, n) => !(o.gone & (1 << n))).map(e => ({ x: e.c[0] + (o.bulge > 0.55 ? 1 : 0), y: e.c[1], R: 6, a: 0.5 * f, col: '110,220,255' }))); } c6Eyes(o); for (let n = 0; n < 2; n++) if (o.gone & (1 << n)) c6Socket(n);
    if (o.mouth > 0) c6Mouth(o.mouth);
    for (const b of o.loose || []) { const e = C6_EYE[b.n]; c6Strands(e.c[0] - 0.5, e.c[1], b.x, b.y - 3, b.n2 || 3, b.sag == null ? 3 : b.sag, o.T || 0, b.snap); if (!b.out) c6Ball(b.x, b.y, { red: b.red, ix: b.ix, iy: b.iy, up: b.held ? 0 : 1 }); }
  }
  ctx.restore();
}

// ---------------------------------------------------------------- the shots
const c6Zf = () => Math.max(3, Math.floor(VH / 22));      // the enlargement of the face in the big close-ups (6 on the usual screen: the whole head fits between the cinema bars)
const c6Shk = (T, a) => a < 0.3 ? [0, 0] : [Math.round((c6H(Math.floor(T * 36), 1) - 0.5) * 2 * a), Math.round((c6H(Math.floor(T * 36), 2) - 0.5) * 2 * a)];      // a shake in whole face pixels (the same for the same T)
function c6Glow(x, y, R, col, a) {      // a soft light on the picture (the way the Master's light is made in the other shots): colour col = 'r,g,b'
  if (a <= 0.01) return; ctx.save(); ctx.globalCompositeOperation = 'lighter'; const g = ctx.createRadialGradient(x, y, 2, x, y, R); g.addColorStop(0, 'rgba(' + col + ',' + a.toFixed(3) + ')'); g.addColorStop(1, 'rgba(' + col + ',0)'); ctx.fillStyle = g; ctx.fillRect(x - R, y - R, 2 * R, 2 * R); ctx.restore();
}
function c6RedEdge(a) {      // the edges of the picture turn blood red (a = how much, 0 - 1): his pulse in his head
  if (a <= 0.01) return; const g = ctx.createRadialGradient(VW / 2, VH / 2, VH * 0.35, VW / 2, VH / 2, VW * 0.62); g.addColorStop(0, 'rgba(110,0,10,0)'); g.addColorStop(1, 'rgba(110,0,10,' + Math.min(0.6, a).toFixed(3) + ')'); ctx.fillStyle = g; ctx.fillRect(0, 0, VW, VH);
}
const c6Beat = (T, t0, n) => { let p = 0; for (let i = 0; i < n; i++) { const a = T - (t0 + 0.7 * i); if (a >= 0) p = Math.max(p, Math.exp(-a * 7) * (1 - Math.exp(-a * 60))); } return p; };      // a heart that beats n times, 0.7 s apart from t0: 1 at the beat, fading
function c6Black(a) { if (a > 0.004) { ctx.fillStyle = 'rgba(0,0,0,' + Math.min(1, a).toFixed(3) + ')'; ctx.fillRect(0, 0, VW, VH); } }
function c6White(a) { if (a > 0.004) { ctx.fillStyle = 'rgba(255,255,255,' + Math.min(1, a).toFixed(3) + ')'; ctx.fillRect(0, 0, VW, VH); } }
const c6Line1 = (w, from) => C3E_TALK.find(q => q.w === w && q.t >= from);      // the first line of a speaker from the scene time `from` on

// ---- 1. "NOW... LET ME SEE THOSE EYES.": the two of them close (the picture of the call's talk); his free hand comes out from behind his head to Gojo's blindfold and closes on its front end
function c6STalk(now, dt, T, st, t1) {
  const Z = rsZ(), Gx = Math.round(VW * 0.33), Gy = Math.round(VH * 0.6), Mx = Math.round(VW * 0.72), My = Gy + Math.round(2 * Z), tt = c6Line1('MASTER', st.t0), n = Math.floor(Math.max(0, T - tt.t) * TN_RATE), talking = T >= tt.t && T < tt.t + tt.d && n < tt.a.length + 3;
  const arm = ease3(clamp01((t1 - 1.9) / 1.15)), hook = clamp01((t1 - 3.0) / 0.25), sw = Math.sin(T * 2.2) > 0.35 ? 1 : 0, fear = t1 > 3.0 ? Math.round((c6H(Math.floor(T * 30), 3) - 0.5) * 2) : 0;
  rsCloseBg(T); rsSmoke(Mx + 40 * rsLay().U, My - 10 * rsLay().U, T, rsLay().U * 1.2);
  const cl = { x: Math.round(lerp(60, 0, arm)), ct: hook, hook: 1 }; c6On(Z, 12, 16, Gx, Gy); ctx.translate(fear, sw); if (arm > 0) c6Claw(cl, 0); c6Head({ band: 1, dim: 0.4 }); if (arm > 0) c6Claw(cl, 1); c6Off();
  rsFredHead(Mx, My, Z, talking ? 0.02 * Math.sin(T * 9) : 0, 0, 1.0 + 0.25 * Math.sin(T * 6), talking ? 0.7 : 0.15);
  { const gr = ctx.createLinearGradient(VW * 0.2, 0, VW * 0.8, 0); gr.addColorStop(0, 'rgba(4,2,10,0.6)'); gr.addColorStop(0.48, 'rgba(4,2,10,0)'); ctx.fillStyle = gr; ctx.fillRect(0, 0, VW, VH); }      // (Gojo is in shadow)
  msFinish(1); c6Black(1 - clamp01(t1 / 0.5));
}

// ---- 2. the claw tears the blindfold off: the band is dragged forward, the picture flashes, the claw goes off with the band hanging from it; and the face with the Six Eyes shining blue is seen, bloody as it was
const C6_RIP = { hold: 0.3, pull: 0.12, flash: 0.44 };      // seconds into the shot: the claw holds the band, it pulls, the band comes off (the flash)
function c6SRip(now, dt, T, st, t1) {
  const Z = c6Zf(), Fx = Math.round(VW * 0.4), Fy = Math.round(VH * 0.57), a = t1 - C6_RIP.flash, off = a >= 0, pu = ease3(clamp01((t1 - C6_RIP.hold) / C6_RIP.pull)), q = clamp01(a / 0.5), cx = off ? Math.round(6 + 64 * (1 - (1 - q) * (1 - q))) : Math.round(6 * pu), cl = { x: cx, ct: 1, hook: 1 };
  const sh = off ? c6Shk(T, 2.2 * Math.max(0, 1 - a / 0.5)) : c6Shk(T, t1 > C6_RIP.hold ? 1.3 : 0.5), glow = off ? clamp01(a / 0.1) * (0.85 + 0.15 * Math.sin(T * 35)) : 0, kn = off ? clamp01(a / 0.12) : 0, fade = 1 - clamp01((a - 0.12) / 0.5);
  rsCloseBg(T); c6Glow(Fx + 14 * Z, Fy, 90 * Z / 6, '120,56,176', 0.22);
  c6On(Z, 12, 13, Fx, Fy); ctx.translate(sh[0] + (off ? (a < 0.1 ? -1 : 0) : (t1 > C6_RIP.hold + 0.05 ? 1 : 0)), sh[1]); c6Claw(cl, 0);
  if (!off) { c6Head({ band: 1, dim: 0.4 }); if (cx > 0) { c6P(15, 11, '#0e0b12', cx, 3); c6P(15, 11, '#2f2744', cx, 1); } }
  else {
    c6Head({ glow, T, L: 0, dim: 0.5, mouth: 0.25 + 0.1 * Math.sin(T * 9) }); if (kn > 0) for (const e of C6_EYE) c6Star(Math.round(e.c[0]), Math.round(e.c[1]), Math.round(8 * kn * fade), 0.9 * fade);
    const hx = 15 + cx; for (let i = 0; i < 16; i++) { const y = 12 + Math.round(0.06 * i * i + Math.sin(T * 18 - i * 0.7) * 0.8 * i / 15); c6P(Math.round(hx - i * 0.95), y, '#0e0b12', 1, 2); if (i % 2) c6P(Math.round(hx - i * 0.95), y, '#2f2744'); }      // (the band hangs from the blades and flutters)
    if (a < 0.9) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = '#7ee4ff'; for (let x = -40; x < 70; x++) { ctx.globalAlpha = 0.6 * (1 - a / 0.9) * Math.max(0, 1 - Math.abs(x - 11) / 55); ctx.fillRect(x, 12, 1, 1); } ctx.restore(); }      // (a streak of light along the line of his eyes)
  }
  c6Claw(cl, 1); c6Off();
  if (off) c6Glow(Fx - Z, Fy - Math.round(Z / 2), 70 * Z / 6, '126,228,255', 0.22 * glow * (1 - 0.6 * clamp01((a - 0.4) / 1.5)));
  msFinish(1); c6White(off && a < 0.14 ? 0.95 * (1 - a / 0.14) : 0);
}

// ---- 3. the claw clamps shut on his eyes; he screams; blood runs from them, the eyes go red and swell
const C6_GRAB = { clamp: 0.4, scream: 0.55 };      // seconds into the shot: the claw closes on the eyes, the scream begins
function c6SGrab(now, dt, T, st, t1) {
  const Z = c6Zf(), Fx = Math.round(VW * 0.4), Fy = Math.round(VH * 0.57), arr = ease3(clamp01(t1 / C6_GRAB.clamp)), ct = clamp01((t1 - 0.3) / 0.15), sc = t1 - C6_GRAB.scream, L = 2.1 * clamp01((t1 - 0.5) / 2.1), sh = c6Shk(T, sc > 0 ? 1.6 + 1.2 * clamp01(sc / 1.5) : 0.5), cl = { x: Math.round(lerp(46, 0, arr)), ct, dig: clamp01(L / 2) * 0.7 };
  rsCloseBg(T); c6Glow(Fx + 14 * Z, Fy, 90 * Z / 6, '120,56,176', 0.22);
  c6On(Z, 12, 13, Fx, Fy); ctx.translate(sh[0], sh[1]); c6Claw(cl, 0);
  c6Head({ T, L, dim: 0.5, red: clamp01(L / 1.5) * 0.85, bulge: clamp01((L - 0.7) / 1.2) * 0.8, glow: 0.7 * (1 - clamp01(L / 3)), mouth: sc > 0 ? 0.85 + 0.15 * Math.sin(T * 41) : 0.2 });
  c6Claw(cl, 1); c6Off();
  if (t1 > C6_GRAB.clamp && t1 < C6_GRAB.clamp + 0.12) c6White(0.55 * (1 - (t1 - C6_GRAB.clamp) / 0.12));
  if (sc > 0 && sc < st.d - C6_GRAB.scream - 0.2) c4Shout(T, 'AAAAAAAGH!!', sc, 22);
  msFinish(1);
}

// ---- 4 and 6. Gojo hits the Master in the face, again and again (his fist, his own blood on it); each blow is weaker, the head hardly moves, the eye only glows brighter; at the end the fist slides down his face and falls away. hits = [[the time the fist lands, how hard (0 - 1)], ...], limp = the time the arm gives out (0 = never)
function c6Punch(T, t1, hits, limp) {
  const Z = rsZ(), U = rsLay().U, Cx = Math.round(VW * 0.62), Cy = Math.round(VH * 0.6), keys = [[0, 8 * Z]]; let imp = 0, done = 0;
  hits.forEach(([th, s], i) => { keys.push([th - 0.3, i ? 4 * Z : 8 * Z], [th - 0.07, (7 + 9 * s) * Z], [th, 0], [th + 0.14, 0]); if (i < hits.length - 1) keys.push([th + 0.42, 5 * Z]); else if (limp) keys.push([limp + 0.5, 4 * Z]); else keys.push([th + 0.42, 5 * Z]); });
  for (const [th, s] of hits) { const a = t1 - th; if (a >= 0) { done++; imp += s * Math.exp(-a * 9) * (1 - Math.exp(-a * 70)); } }
  const D = c6Key(keys, t1), fy = limp ? c6Key([[limp, 0], [limp + 0.7, 19 * Z]], t1) : 0, rot = 0.3 * imp, sh = Math.round(8 * Z * imp), tr = limp && t1 > limp - 0.4 ? 1 : 0, jx = tr ? Math.round((c6H(Math.floor(T * 30), 8) - 0.5) * 2) * Z : 0;
  rsCloseBg(T); rsSmoke(Cx + 60 * U, Cy - 6 * U, T, U * 1.2); rsFredHead(Cx, Cy, Z, rot, sh, 0.9 + 0.1 * done + 0.25 * imp, 0.25 + 0.7 * imp);
  c6On(Z, 0, 0, Math.round(Cx - D + jx + sh * 0.5), Math.round(Cy + fy)); c6Arm(done);
  for (const [th] of hits) { const a = th - t1; if (a >= 0 && a < 0.09) { ctx.fillStyle = 'rgba(235,225,255,' + (0.8 * (1 - a / 0.09)).toFixed(2) + ')'; for (const [dy, w] of [[-4, 22], [0, 30], [4, 18]]) ctx.fillRect(-12 - w - Math.round(a * 120), dy, w, 1); } }      // (streaks of speed behind the fist as it flies)
  c6Off(); rsDrip(Cx - 7 * Z, Cy + 5 * Z + fy, T, 2, 0.3);
  for (const [th, s] of hits) { const a = t1 - th; if (a >= 0 && a < 0.4) { c3Ring(Cx, Cy, a, false, '255,235,200', 0.6 + 0.4 * s); ctx.fillStyle = BLD[0]; for (let i = 0; i < 7; i++) { const an = -2.6 + c6H(i, 81) * 2.2, v = 40 + c6H(i, 82) * 80; ctx.fillRect(Math.round(Cx - 6 + Math.cos(an) * v * a), Math.round(Cy + Math.sin(an) * v * a + 170 * a * a), 2, 2); } } }      // (blood flies off the fist)
  msFinish(1);
}
function c6SPun1(now, dt, T, st, t1) { c6Punch(T, t1, [[0.3, 1], [1.05, 0.75], [1.8, 0.5]], 0); }
function c6SPun2(now, dt, T, st, t1) { c6Punch(T, t1, [[0.3, 0.4], [1.1, 0.25]], 1.4); }

// ---- 5. the claw pulls: the eyes are dragged out of their sockets as far as they go, blood spurts, he screams
function c6SGrab2(now, dt, T, st, t1) {
  const Z = c6Zf() + 1, Fx = Math.round(VW * 0.38), Fy = Math.round(VH * 0.56), k = t1 / st.d, L = lerp(2.1, 3.6, ease3(k)), pull = Math.round(c6Key([[0, 0], [1.2, 0], [1.8, 5]], t1)), sh = c6Shk(T, 2.2 + 1.4 * k), cl = { x: pull, ct: 1, dig: 1 };
  rsCloseBg(T); c6Glow(Fx + 14 * Z, Fy, 90 * Z / 6, '120,56,176', 0.22);
  c6On(Z, 12, 13, Fx, Fy); ctx.translate(sh[0], sh[1]); c6Claw(cl, 0);
  c6Head({ T, L, dim: 0.5, red: 0.95, bulge: pull >= 2 ? 1.5 : 1, glow: 0.3 * (1 - k), mouth: 0.9 + 0.1 * Math.sin(T * 41) });
  for (let i = 0; i < 4; i++) { c6Spurt(T, st.t0 + 0.3 + i * 0.5, 8 + (i & 1) * 5, 14, 9, { v: 34, an: 1.2 + (i & 1) * 0.5, sp: 1.2, seed: i * 17, life: 0.5 }); }
  c6Claw(cl, 1); c6Off(); if (t1 > 1.2 && t1 < 1.28) c6White(0.4 * (1 - (t1 - 1.2) / 0.08));
  c4Shout(T, 'AAAAAAAGH!!', t1, 22); msFinish(1);
}

// ---- 7. the kick: he is held by the neck in the Master's void, a little way off the ground; his leg comes up (his real kick pictures, bloody, with his eyes bare) and lands in the Master's belly; the picture stops for an instant, then the Master is thrown back out of the picture, the claw lets go, Gojo drops to his knees and presses his hands over his eyes
const C6K = { wind: 0.4, hit: 1.05, stop: 0.08, free: 1.2 };      // seconds into the shot: the leg starts to rise, it lands, the picture holds for a moment (the Master is thrown after it), the claw lets go
const c6EC = new Map();
function c6EyeMid(img) {      // where the middle of his eyes is in a picture of him with his eyes bare (the blue pixels of the eyes)
  let r = c6EC.get(img); if (r) return r; const w = img.width, h = img.height, d = img.getContext('2d').getImageData(0, 0, w, h).data; let sx = 0, sy = 0, n = 0;
  for (let y = 0; y < Math.min(h, 40); y++) for (let x = 0; x < w; x++) { const i = (y * w + x) * 4; if (d[i + 3] > 200 && d[i + 2] > 170 && d[i + 2] > d[i] + 50 && d[i + 1] > 90) { sx += x + 0.5; sy += y + 0.5; n++; } }
  r = n ? [sx / n, sy / n] : [16, 12]; c6EC.set(img, r); return r;
}
function c6Dang1(lx, ly, rx, ry, T, a) {      // the eyeballs hanging on their vessels, seen from far away (scene pixels): a red thread and a little white ball with a blue middle, swinging less and less
  for (const [x, y, ph] of [[lx, ly, 0], [rx, ry, 1.7]]) { const sw = Math.sin(a * 6 + ph) * 2.2 * Math.exp(-a * 1.2) + 0.5; ctx.fillStyle = '#d4141f'; for (let i = 0; i < 5; i++) ctx.fillRect(Math.round(x + sw * i / 5), Math.round(y + i), 1, 1); const bx = Math.round(x + sw - 1), by = Math.round(y + 5); ctx.fillStyle = '#f4f2f8'; ctx.fillRect(bx, by, 3, 3); ctx.fillStyle = '#59b8ff'; ctx.fillRect(bx + 1, by + 1, 2, 2); ctx.fillStyle = '#d4141f'; ctx.fillRect(bx, by + 2, 1, 1); }
}
function c6SKick(now, dt, T, st, t1) {
  const Gx = Math.round(VW * 0.36), Mx0 = Gx + 24, a = t1 - C6K.hit, ah = a - C6K.stop, freed = t1 >= C6K.free, bent = t1 >= 1.9, hold = a >= 0 && ah < 0;
  const fi = t1 < C6K.wind ? 0 : t1 < C6K.hit ? Math.min(7, 1 + Math.floor((t1 - C6K.wind) / (C6K.hit - C6K.wind) * 7)) : ah < 0.04 ? 8 : Math.min(14, 9 + Math.floor((ah - 0.04) / 0.1));
  const mx = Math.round(Mx0 + (ah > 0 ? 120 * (1 - Math.exp(-ah * 3)) : 0)), lift = freed ? 9 * (1 - Math.pow(clamp01((t1 - C6K.free) / 0.16), 2)) : 9, z = lerp(1.7, 2.3, ease3(clamp01((t1 - 1.8) / 1.4))), jx = hold ? Math.round(c6H(Math.floor(T * 40), 5) * 2 - 1) : 0;
  c4Void(T, Math.round(VW * 0.27), 0.15); ctx.save(); c4CamOn(z, Gx + 12, gy - 34, Math.round(VW * 0.46), Math.round(VH * 0.6));
  const hf = ah < 0 ? 0 : ah < 0.07 ? 1 : ah < 0.19 ? 2 : ah < 0.33 ? 3 : 4, src = a > 0 ? fredH(3, hf) : rsCarrySrc(fredF(Math.floor(T * IDLE_FPS)), 1);
  shadow(mx, 9); rsAura(mx, T, 1, 60); rsFredDraw(mx + jx, T, { src, right: false, eye: a > 0 && hf >= 3 ? 0 : 1 + 0.3 * clamp01(1 - ah * 3), flare: a > 0 && ah < 0.3 ? 0.8 : 0.2 });
  if (!bent) { shadow(Gx, 9); sprAt(blindDown(bloody(atkF[3][fi])), D.atk3, Gx - jx, lift, false, 0); if (!freed) rsBlades(Gx + 0.5, gy - 41 - lift, -1); rsDrip(Gx + 5, gy - 52 - lift, T, 3, 0.2);
    if (freed) { const m = mouthOf(atkF[3][fi]); if (m) c6Dang1(Math.round(Gx - jx - 33 + m.x - 3.5), Math.round(gy - 64 - lift + m.y - 3), Math.round(Gx - jx - 33 + m.x + 1.5), Math.round(gy - 64 - lift + m.y - 3), T, t1 - C6K.free); } }
  else {
    const f = Math.min(5, 2 + Math.floor(clamp01((t1 - 1.9) / 0.4) * 4)), img = blindDown(bloody(rxN[9][f])), em = c6EyeMid(img), hx = D.rx9.cx - D.rx9.x0, ex = Math.round(Gx - hx + em[0]), ey = Math.round(gy - 60 - D.rx9.top + em[1]), tr = Math.round(Math.sin(T * 31));
    shadow(Gx, 9); sprAt(img, D.rx9, Gx, 0, false, 0); for (const hx0 of [ex - 6, ex + 0]) { ctx.fillStyle = '#1a0f14'; ctx.fillRect(hx0, ey - 4 + tr, 6, 7); ctx.fillStyle = '#eec7b4'; ctx.fillRect(hx0 + 1, ey - 3 + tr, 4, 5); ctx.fillStyle = '#d1a08f'; ctx.fillRect(hx0 + 1, ey + 1 + tr, 4, 1); ctx.fillStyle = '#a06d68'; ctx.fillRect(hx0 + 2, ey - 3 + tr, 1, 3); ctx.fillRect(hx0 + 4, ey - 3 + tr, 1, 3); }      // (his hands over his eyes)
    rsDrip(ex - 2, ey + 3, T, 4, 0.1); rsDrip(ex + 2, ey + 3, T, 3, 0.6); c6Dang1(ex - 3, ey + 3 + tr, ex + 3, ey + 3 + tr, T, t1 - C6K.free);
  }
  if (a >= 0) { c3Ring(Gx + 22, gy - 38, a, true, '255,240,190', 1); if (ah > 0) c4Dust(T, st.t0 + C6K.hit + C6K.stop, Mx0 + 18, 12, { w: 60, h: 14, life: 1.0, big: 5, seed: 41 }); }
  if (freed) c4Dust(T, st.t0 + C6K.free + 0.16, Gx, 8, { w: 24, h: 8, life: 0.8, big: 4, seed: 43 });
  c4Cam0(); ctx.restore(); if (a >= 0 && a < 0.07) c6White(0.7 * (1 - a / 0.07)); ctx.fillStyle = 'rgba(30,10,60,0.14)'; ctx.fillRect(0, 0, VW, VH); msFinish(1);
}

// ---- 8. the eyes hang out of their sockets by a few blood vessels, swinging, dripping; his hands come up, shaking, to catch them
function c6Swing(n, a) {      // eyeball n, a seconds after it was torn out: it hangs by its vessels, stretches, jerks and swings, less and less
  const S = C6_EYE[n].c, L = n ? 7.5 : 8.5, th = (n ? -0.5 : 0.55) * Math.exp(-a * 1.3) * Math.cos(a * (n ? 6.4 : 5.6)), r = L + 2.5 * Math.exp(-a * 3) * Math.cos(a * 11);
  return { x: S[0] + r * Math.sin(th) + (n ? 1 : 0), y: S[1] + r * Math.cos(th) };
}
function c6SDang(now, dt, T, st, t1) {
  const Z = c6Zf() - 1, Fx = Math.round(VW * 0.5), Fy = Math.round(VH * 0.5), a = t1 + 0.35, b0 = c6Swing(0, a), b1 = c6Swing(1, a), sh = c6Shk(T, 0.6), h0 = ease3(clamp01((t1 - 0.9) / 1.2)), h1 = ease3(clamp01((t1 - 1.3) / 1.2)), tr = () => Math.round((c6H(Math.floor(T * 28), 9) - 0.5) * 2);
  rsCloseBg(T); c6Glow(Fx + 12 * Z, Fy, 80 * Z / 5, '120,56,176', 0.16);
  c6On(Z, 11.5, 15, Fx, Fy); ctx.translate(sh[0], sh[1]);
  c6Head({ T, L: 3.8, dim: 0.5, gone: 3, mouth: 0.55 + 0.15 * Math.sin(T * 9), loose: [{ n: 0, x: Math.round(b0.x), y: Math.round(b0.y), red: 0.7, ix: 1, iy: 1, sag: 3 }, { n: 1, x: Math.round(b1.x), y: Math.round(b1.y), red: 0.7, ix: 1, iy: 0, sag: -2 }] });
  c6Spurt(T, st.t0 + 0.0, 9, 14, 8, { v: 24, an: 1.5, sp: 1.5, seed: 5, life: 0.5 });
  if (h0 > 0) c6Hand(Math.round(lerp(b0.x - 9, b0.x - 1, h0)) + (h0 > 0.9 ? tr() : 0), Math.round(lerp(b0.y + 17, b0.y + 4, h0)), -1);
  if (h1 > 0) c6Hand(Math.round(lerp(b1.x + 12, b1.x + 3, h1)) + (h1 > 0.9 ? tr() : 0), Math.round(lerp(b1.y + 17, b1.y + 4, h1)), 1);
  c6Off(); c6RedEdge(0.1 + 0.4 * c6Beat(T, st.t0 + 0.6, 3)); msFinish(1);
}

// ---- 9. his hands take the eyeballs and push them back in, one after the other: a wet burst of blood as each goes home; the eyes are red now, with the blue still in them, and his face is as bloody as a face can be
const C6_PUSH = [0.5, 1.35], C6_PD = 0.45;      // seconds into the shot: when his hands start to push the big eye and the small eye in, and how long a push takes
function c6SShove(now, dt, T, st, t1) {
  const Z = c6Zf() - 1, Fx = Math.round(VW * 0.5), Fy = Math.round(VH * 0.5), a = t1 + 3.15, tr = () => Math.round((c6H(Math.floor(T * 28), 9) - 0.5) * 2), loose = [], hands = [];
  let gone = 0, shake = 0.5, fl = 0, inn = 0;
  for (let n = 0; n < 2; n++) {
    const tp = C6_PUSH[n], S = C6_EYE[n].c, rest = c6Swing(n, a), since = t1 - tp - C6_PD, e = ease3(clamp01((t1 - tp) / C6_PD)), dx = n ? 3 : -1;
    if (since < 0) { gone |= 1 << n; const bx = lerp(rest.x, S[0] + n * 0.5, e), by = lerp(rest.y, S[1], e); loose.push({ n, x: Math.round(bx), y: Math.round(by), red: 0.8, ix: 1, iy: 0, sag: lerp(n ? -2 : 3, n ? 4 : -5, e) }); hands.push([Math.round(bx + dx) + (t1 < tp ? tr() : 0), Math.round(by + 4), n ? 1 : -1]); if (t1 > tp) shake = Math.max(shake, 1.6 * e); }
    else { inn++; if (since < 0.5) hands.push([Math.round(S[0] + dx + (n ? 1 : -1) * since * 16), Math.round(S[1] + 4 + since * 26), n ? 1 : -1]); if (since < 0.25) shake = Math.max(shake, 2.6 * (1 - since / 0.25)); if (since < 0.06) fl = Math.max(fl, 0.28 * (1 - since / 0.06)); }
  }
  const sh = c6Shk(T, shake), L = lerp(3.8, 4, clamp01((t1 - 1.8) / 1.2)), gl = inn === 2 ? 0.28 * (c6H(Math.floor(T * 14), 3) > 0.35 ? 1 : 0.25) : 0;
  rsCloseBg(T); c6Glow(Fx + 12 * Z, Fy, 80 * Z / 5, '120,56,176', 0.16);
  c6On(Z, 11.5, 15, Fx, Fy); ctx.translate(sh[0], sh[1]);
  c6Head({ T, L, dim: 0.5, red: 1, glow: gl, gone, loose, mouth: inn === 2 ? 0.3 + 0.1 * Math.sin(T * 5) : 0.7 + 0.15 * Math.sin(T * 17) });
  for (let n = 0; n < 2; n++) { const S = C6_EYE[n].c; c6Spurt(T, st.t0 + C6_PUSH[n] + C6_PD, S[0], S[1] + 1, 12, { v: 30, an: 1.2 + n * 0.5, sp: 2.4, seed: n * 7 + 3, life: 0.55 }); }
  for (const h of hands) c6Hand(h[0], h[1], h[2]);
  c6Off(); c6White(fl); c6RedEdge(0.14); msFinish(1);
}

// ---- 10. he raises his hand in the sign of his domain: his eyes blaze blue, bolts run from them to his fingers, the void begins to open behind him... and goes out: the eyes are not what they were
function c6Tear(T, n, amp) {      // the picture tears: n bands of it slide sideways
  const k = Math.floor(T * 30) * 7, c = ctx.canvas, S = c.width / VW;
  for (let i = 0; i < n; i++) { const y = Math.floor(c6H(k, i) * VH), h = 2 + Math.floor(c6H(k, i + 9) * 7), dx = Math.round((c6H(k, i + 19) - 0.5) * amp); ctx.drawImage(c, 0, y * S, c.width, h * S, dx, y, VW, h); }
}
const C6_DOM = { fail: 2.65 };
function c6SDom(now, dt, T, st, t1) {
  const Z = c6Zf(), Fx = Math.round(VW * 0.38), Fy = Math.round(VH * 0.56), fail = C6_DOM.fail, up = ease3(clamp01(t1 / 0.5)), dead = t1 >= fail, fz = dead && t1 < fail + 0.5;
  const g = !dead ? lerp(0.25, 1.4, ease3(clamp01((t1 - 0.5) / 2.1))) : fz ? (c6H(Math.floor(T * 26), 3) > 0.55 ? 0.9 : 0.1) : 0.1, hy = Math.round((1 - up) * 26 + (dead ? 34 * ease3(clamp01((t1 - fail - 0.35) / 0.5)) : 0)), tr = !dead && t1 > 0.6 ? Math.round((c6H(Math.floor(T * 30), 6) - 0.5) * 2) : 0;
  const va = t1 < 1.95 ? 0 : t1 < 2.35 ? 0.85 * ease3((t1 - 1.95) / 0.4) : !dead ? 0.85 : 0.85 * (1 - clamp01((t1 - fail) / 0.25)), sh = c6Shk(T, dead ? (fz ? 2 : 0.6) : 0.6 + 1.6 * clamp01((t1 - 1.2) / 1.4));
  rsCloseBg(T); if (va > 0.01) { ctx.save(); ctx.globalAlpha = va; drawVoid(ctx, T * 1000, VW, VH); ctx.restore(); }
  c6Glow(Fx + 14 * Z, Fy, 90 * Z / 6, '120,56,176', 0.12);
  c6On(Z, 12, 13, Fx, Fy); ctx.translate(sh[0], sh[1]);
  const cl = { x: Math.round(lerp(62, 14, ease3(clamp01((t1 - 3.3) / 0.7)))), ct: 0 }; if (t1 > 3.3) c6Claw(cl, 0);
  c6Head({ T, L: 4, dim: 0.45, red: 1, glow: g, mouth: 0.2 + 0.1 * Math.sin(T * 6) - (dead ? 0.1 : 0) });
  if (!dead && g > 0.5) for (const e of C6_EYE) for (let b = 0; b < 1 + Math.floor(g * 1.6); b++) c6Bolt(e.c[0], e.c[1], 23 + tr, 5 + hy, b * 5 + (e.c[0] > 10 ? 3 : 0), T);
  if (fz) c6Spurt(T, st.t0 + fail, 11, 12, 14, { v: 22, an: 1.57, sp: 3.2, seed: 21, life: 0.7, g: 50, cols: ['#9ff0ff', '#4aa8ff', '#d6f5ff'] });
  c6Sign(22 + tr, 5 + hy); if (t1 > 3.3) c6Claw(cl, 1); c6Off();
  if (g > 0.8 && !dead) c6Glow(Fx - Z, Fy - Math.round(Z / 2), 70 * Z / 6, '126,228,255', 0.2 * (g - 0.8)); if (t1 > fail - 0.35 && t1 < fail + 0.25) c6Tear(T, 8, 26);
  if (t1 > 2.3 && t1 < fail) c6White(0.5 * Math.pow(clamp01((t1 - 2.3) / 0.35), 2)); if (dead && t1 < fail + 0.1) c6White(0.7 * (1 - (t1 - fail) / 0.1));
  msFinish(1);
}

// ---- 11. the Master pulls him back by an eye: the claw closes on the big eye behind its ball, and he is dragged to the right, with the picture streaking
const C6_E0 = [[6, 10], [8, 10], [8, 15], [6, 15]];      // where the four blades end when they close behind the big eye (the claw's own pixels)
function c6SYank(now, dt, T, st, t1) {
  const Z = c6Zf(), k = ease3(clamp01((t1 - 0.3) / 0.25)), Fy = Math.round(VH * 0.56), fx = q => Math.round(lerp(0.38, 0.52, q) * VW), cl = { x: Math.round(lerp(26, 0, ease3(clamp01(t1 / 0.3)))), ct: ease3(clamp01((t1 - 0.12) / 0.2)), tips: C6_E0 };
  const L = 4.2, sh = c6Shk(T, t1 > 0.3 ? 2 : 0.8), o = { T, L, dim: 0.45, red: 1, bulge: t1 > 0.55 ? 1.5 : 1, mouth: 0.8 + 0.2 * Math.sin(T * 39) };
  rsCloseBg(T); c6Glow(fx(k) + 14 * Z, Fy, 90 * Z / 6, '120,56,176', 0.2);
  if (k > 0 && k < 1) for (const [q, al] of [[0.5, 0.18], [0.25, 0.3]]) { ctx.save(); ctx.globalAlpha = al; c6On(Z, 12, 13, fx(k * q), Fy); c6Head(o); c6Off(); ctx.restore(); }      // (the picture streaks: two fainter copies of the face where it has just been)
  c6On(Z, 12, 13, fx(k), Fy); ctx.translate(sh[0], sh[1]); c6Claw(cl, 0); c6Head(o); c6Spurt(T, st.t0 + 0.35, 8, 14, 10, { v: 34, an: 1.2, sp: 1.4, seed: 31, life: 0.5 }); c6Claw(cl, 1); c6Off();
  if (t1 > 0.3 && t1 < 0.38) c6White(0.4 * (1 - (t1 - 0.3) / 0.08)); if (t1 > 0.35) c4Shout(T, 'AAAAAAGH!!', t1, 22); msFinish(1);
}

// ---- 12. the eye is torn out: its vessels stretch and snap one after the other, blood fountains from the socket, and the claw goes off with the eye
function c6SPluck(now, dt, T, st, t1) {
  const Z = c6Zf(), Fx = Math.round(VW * 0.52), Fy = Math.round(VH * 0.56), d = c6Key([[0, 0], [0.45, 4], [0.85, 9], [1.2, 17], [1.55, 30], [2.1, 80]], t1), snap = (t1 >= 0.6 ? 1 : 0) + (t1 >= 0.85 ? 1 : 0) + (t1 >= 1.0 ? 1 : 0), free = t1 >= 1.0, S = C6_EYE[0].c;
  const sh = c6Shk(T, free ? Math.max(0.8, 3 * (1 - (t1 - 1.0) / 0.4)) : 2 + t1), dy = t1 > 1.8 ? 2 : t1 > 1.4 ? 1 : 0, cl = { x: Math.round(d), ct: 1, tips: C6_E0 }, bx = Math.round(S[0] + d), by = Math.round(S[1] - d * 0.12);
  rsCloseBg(T); c6Glow(Fx + 14 * Z, Fy, 90 * Z / 6, '120,56,176', 0.2);
  c6On(Z, 12, 13, Fx, Fy); ctx.translate(sh[0], sh[1] + dy); c6Claw(cl, 0);
  c6Head({ T, L: 4.4, dim: 0.45, red: 1, gone: 1, glow: 0, mouth: free ? 0.9 : 0.8 + 0.2 * Math.sin(T * 41), loose: [{ n: 0, x: bx, y: by, red: 0.8, ix: 1, iy: 0, snap, n2: 3, sag: Math.max(0, 3 - d * 0.3), held: free }] });
  for (const [ts, sd] of [[0.6, 1], [0.85, 2], [1.0, 3]]) c6Spurt(T, st.t0 + ts, 8, 13, 12, { v: 40, an: 1.0, sp: 2.4, seed: sd * 9, life: 0.6 });
  for (let i = 0; i < 6; i++) c6Spurt(T, st.t0 + 0.25 + i * 0.28, 8, 14, 5, { v: 20, an: 1.3, sp: 1.2, seed: 70 + i, life: 0.5 });
  c6Claw(cl, 1); c6Off();
  if (t1 >= 1.0 && t1 < 1.08) c6White(0.55 * (1 - (t1 - 1.0) / 0.08)); if (t1 < 1.0) c4Shout(T, 'AAAAAAAGH!!', t1, 22); c6RedEdge(0.2); msFinish(1);
}

// ---- 13. the claw holds the eye in front of the camera and shuts: the white of it bursts and runs down the blades, and what is left between their points is the blue part, three pixels of it, glowing: it lights the claw, the dark, the whole picture; it does not fade out: the next shot (tport) goes on in the same picture
function c6SCrush(now, dt, T, st, t1) {
  const Z = Math.max(4, c6Zf() + 3), sx = Math.round(VW * 0.4), sy = Math.round(VH * 0.5), sq = clamp01((t1 - 1.2) / 0.3), burst = t1 >= 1.5, on = ease3(clamp01((t1 - 1.55) / 2.2)), X = -4, Y = -12, rows = burst ? 2 : 3 - sq;
  const tips = [[-2 - X, -Math.round(rows) - Y], [0 - X, -Math.round(rows) - Y], [0 - X, Math.round(rows) - Y], [-2 - X, Math.round(rows) - Y]], cl = { x: X + Math.round(c6H(Math.floor(T * 30), 4) * (burst ? 0 : sq * 2)), y: Y, ct: 1, tips, thick: 1 };
  rsCloseBg(T); c6Glow(sx, sy, 170, '60,150,255', 0.2 * on);
  c6On(Z, 0, 0, sx, sy); c6Claw(cl, 0);
  if (!burst) { c6Ball(0, 0, { red: 0.7, ix: 1, iy: 0, up: 0, flat: sq > 0.6 }); if (sq === 0) c6Strands(-1, 2, -1, 9, 2, 1, T, 0); } else c6Iris(0, 0);
  for (let i = 0; i < 3; i++) { const q = (T * 0.9 + i * 0.37) % 1; ctx.globalAlpha = 1 - q * 0.5; c6P(-2 + i * 2, 4 + Math.round(q * q * 16), BLD[0], 1, 2); } ctx.globalAlpha = 1;      // (blood drips from the blades)
  if (sq > 0.05 && !burst) c6Spurt(T, st.t0 + 1.2, 0, 3, 8, { v: 20, an: 1.57, sp: 3, seed: 40, life: 0.4 });
  c6Spurt(T, st.t0 + 1.5, 0, 0, 30, { v: 50, an: 0, sp: 6.28, seed: 11, life: 0.8, g: 90 });
  c6Claw(cl, 1);
  if (on > 0) { c6StoneLight(0, 0, 4 + 14 * on, on, T); const tw = (T * 0.9) % 2.6; c6Rays(0, 0, Math.round(4 + 10 * on * (tw < 0.8 ? Math.sin(Math.PI * tw / 0.8) : 0)), 0.8 * on); for (let i = 0; i < 8; i++) { const ph = (T * 0.45 + c6H(i, 91)) % 1; ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = on * (1 - ph) * 0.8; c6P(Math.round((c6H(i, 92) - 0.5) * 14), Math.round(-2 - ph * 14), '#9ff0ff'); ctx.restore(); } }
  c6Off(); if (t1 >= 1.5 && t1 < 1.58) c6White(0.8 * (1 - (t1 - 1.5) / 0.08)); msFinish(1);
}
function c6StoneLight(cx, cy, R, a, T) {      // the light of the stone in face pixels, in 8 steps (like the rest of the picture): a blue glow that is brightest close to the stone and fades out, a slow pulse; it lights everything it falls on, the black claw too; the three pixels of the stone itself are left as they are
  ctx.save(); ctx.globalCompositeOperation = 'lighter'; const pul = 0.92 + 0.08 * Math.sin(T * 5);
  for (let y = Math.floor(cy - R); y <= Math.ceil(cy + R); y++) for (let x = Math.floor(cx - R); x <= Math.ceil(cx + R); x++) { if (Math.abs(x - cx) <= 1 && Math.abs(y - cy) <= 1) continue; const d = Math.hypot(x + 0.5 - cx, y + 0.5 - cy); if (d >= R) continue; const q = Math.floor(a * pul * Math.pow(1 - d / R, 1.7) * 8) / 8; if (q > 0) { ctx.globalAlpha = q * 0.5; ctx.fillStyle = d < R * 0.25 ? '#7ad0ff' : '#2f86f0'; ctx.fillRect(x, y, 1, 1); } }
  ctx.restore();
}
function c6Rays(cx, cy, len, a) {      // thin rays of light along the four directions and the four corners, getting fainter and ending in a point (the stone's glint)
  ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = '#bfeaff';
  for (let i = 2; i <= len + 1; i++) { ctx.globalAlpha = a * (1 - (i - 2) / len); for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) ctx.fillRect(cx + dx * i, cy + dy * i, 1, 1); if (i < len * 0.6) { ctx.globalAlpha = a * 0.5 * (1 - i / (len * 0.6)); for (const [dx, dy] of [[1, 1], [-1, 1], [1, -1], [-1, -1]]) ctx.fillRect(cx + dx * i, cy + dy * i, 1, 1); } }
  ctx.restore();
}

// ---- what they say (after the gauntlet: the Master, then Gojo, who is in no state to answer)
C3E_TALK.push({ t: c4T('etalk') + 0.5, d: 2.3, w: 'MASTER', vk: 2, a: 'NOW... LET ME SEE THOSE EYES.', b: '' }, { t: c4T('erip') + 1.3, d: 1.5, w: 'MASTER', vk: 2, a: 'THERE THEY ARE.', b: '' }, { t: c4T('edom') + 0.55, d: 1.25, w: 'GOJO', vk: 0, a: 'DOMAIN EXPANSION:', b: '' }, { t: c4T('edom') + 1.8, d: 0.95, w: 'GOJO', vk: 0, a: 'UNLIMITED VO-', b: '' }, { t: c4T('eyank') + 0.75, d: 1.2, w: 'MASTER', vk: 2, a: 'ONE IS ENOUGH.', b: '' }, { t: c4T('ecrush') + 0.5, d: 1.5, w: 'MASTER', vk: 2, a: 'ONLY THE BLUE REMAINS.', b: '' });

// ---- the sounds and shakes of the shots: every one fires once, at its own time (ev = the scene's own scheduler: see c3EndFrame)
function c6Events(ev, now) {
  const Te = c4T('etalk'), Tr = c4T('erip'), Tg = c4T('egrab'), Tp = c4T('epun1'), Tg2 = c4T('egrab2'), Tq = c4T('epun2'), Tk = c4T('ekick'), Td = c4T('edang'), Ts = c4T('eshove'), Tm = c4T('edom'), Ty = c4T('eyank'), Tl = c4T('epluck'), Tc = c4T('ecrush');
  ev('e_scrape', Te + 1.95, () => snd('c6scrape')); ev('e_hook', Te + 3.1, () => snd('c6hook'));
  ev('e_stretch', Tr + C6_RIP.hold, () => snd('c6stretch')); ev('e_rip', Tr + C6_RIP.flash, () => { snd('c6rip'); snd('sixeyes'); c2Shake(now, 420, 4); });
  ev('e_clamp', Tg + C6_GRAB.clamp, () => { snd('c6clamp'); c2Shake(now, 250, 3); }); ev('e_scream0', Tg + C6_GRAB.scream, () => snd('c6scream', 0), 1);
  [0.3, 1.05, 1.8].forEach((t, i) => ev('e_hit' + i, Tp + t, () => { snd('c6thud', [1, 0.75, 0.5][i]); c2Shake(now, 120 - 20 * i, [3, 2, 1.5][i]); }));
  ev('e_scream1', Tg2 + 0.1, () => snd('c6scream', 1), 1); [0.3, 0.8, 1.3].forEach((t, i) => ev('e_squirt' + i, Tg2 + t, () => snd('c6wet', 0))); ev('e_pull', Tg2 + 1.2, () => { snd('c6stretch'); c2Shake(now, 200, 3); });
  [0.3, 1.1].forEach((t, i) => ev('e_lhit' + i, Tq + t, () => snd('c6thud', [0.4, 0.25][i]))); ev('e_arm', Tq + 1.5, () => snd('gasp', 2));
  ev('e_kswing', Tk + 0.45, () => snd('f:swing', 3)); ev('e_kick', Tk + C6K.hit, () => { snd('f:hit', 3); snd('smack', 3); snd('c4crater'); c2Shake(now, 500, 6); }); ev('e_fall', Tk + C6K.free + 0.16, () => snd('land')); ev('e_kgrunt', Tk + 1.5, () => snd('gasp', 1)); ev('e_hands', Tk + 1.95, () => snd('c6thud', 0.3));
  ev('e_dang', Td, () => snd('c6wet', 2)); for (let i = 0; i < 3; i++) ev('e_beat' + i, Td + 0.6 + 0.7 * i, () => snd('c5beat')); ev('e_dgasp', Td + 1.0, () => snd('gasp', 2));
  C6_PUSH.forEach((t, n) => ev('e_push' + n, Ts + t + C6_PD, () => { snd('c6wet', 1); c2Shake(now, 220, 3); })); ev('e_sgasp', Ts + 2.0, () => snd('gasp', 2));
  ev('e_dom', Tm + 0.55, () => snd('c6domain'), 1); ev('e_fizz', Tm + C6_DOM.fail, () => { snd('c6fizzle'); c2Shake(now, 300, 3); }); ev('e_claw', Tm + 3.3, () => snd('c6scrape'));
  ev('e_yclamp', Ty + 0.3, () => { snd('c6clamp'); snd('rsgrab'); c2Shake(now, 300, 4); }); ev('e_yscream', Ty + 0.35, () => snd('c6scream', 3), 1);
  ev('e_pluck', Tl, () => snd('c6pluck'), 1); ev('e_pscream', Tl, () => snd('c6scream', 2), 1); [0.6, 0.85, 1.0].forEach((t, i) => ev('e_snap' + i, Tl + t, () => snd('c6wet', 3))); ev('e_pop', Tl + 1.0, () => { snd('c6wet', 2); c2Shake(now, 400, 5); });
  ev('e_crush', Tc + 1.2, () => snd('c6crush'), 1); ev('e_stone', Tc + 1.55, () => snd('c6stone'), 1);
  d6Events(ev, now); t6Events(ev, now);
}
// ---------------------------------------------------------------- v1.104 THE SUMMONING: after "WASTED POTENTIAL" (the shot line of C4_SEQ) a voice says DID SOMEONE SAY... POTENTIAL?, a cold light comes in, Megumi (the 64 x 64 picture tools/megumi_64.png, 15 colours) stands in it and calls MAHORAGA
// Six shots (dsay, dpot, dwith, dsword, ddiv, dmaho), each a pure function of the scene time like all the others, so a tap that skips and a test that jumps always draw the right picture. The light does the work: every shot has a key light on the picture (d6Lit: the colour of the light on the edge that faces it, the far side dimmed), a glow behind it (c6Glow), light shafts, mist and motes (d6Bg), and the dark edges, grain and bars of msFinish. The close-ups are whole-number enlargements of the picture (2, 4, 8 and 12 times), so one pixel of it stays a block of whole screen pixels and nothing shimmers; the camera drifts instead of scaling.
const D6_IMG = (() => { const i = new Image(); i.src = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAFd0lEQVR4nOVbXWgjVRT+EqSEnSZDs7SdxpZ2my1iWZEiQQrCgi/LwrLIvq+++VD3TVBEVl+UfRVcfVZBxZf6gwjFBxfFVihSZSVLWfsTMs5Ou2TCTDJlyEPrQ/bezkwmaTJzz60/HwQmM3dmzvnuud8999wE+J8jRf2C3HDhCACcppEKn2OIuuY/RwkpLwk7fIgDflyYnodZ2Q20l+U8IIkA4JgEbXom8jojQabzAJCmfkFuuHAUjoCT2lPaEwYpAXGdkUmCNA04xAEK0/M92xmVMtI489/WgGw+DwB47fpFAMAHX20AOHYekKsDj1G/IBzOzPGn5mYAAK+80D6+eqMceQ81GVKnwWw+D9vS4dz/DvrmDiafOAcA0Dd3sPjiLSjZHCbGRrGxvs7vpSZAWgQslEoAgD8fnWfOA8CX36/y47rb4lNlOD+gAPkssFAqYaFUQt1toe62oGRzeP/2p7wNO1ayOQCA59oAgIyiUprGQZ4HAO1e9VybO7e8qvNrH33xOZZXdUyMjSKjqPwjC1IIANo96jYcAMAPn73Oz//607cA2iSdBsgIYOEf7n2gLXp+vP3Scx33b5fXqEwLgDQCtPE8PNcOhDWLAr8OAMCTsxonynNtaQkR6Qv8UcBQM6uwLR3f3H6Tn3v1nVvYbxWgZHNwGw4aliUtGSKfBv347eub/Hjq2Zd9VwoAjqNDJkiHgNM0UiypeW/p+cC1tU/eiLznfLFIaVIHpMwCUYLmT4QYWC4gE+QEOE0jlcYZXL3xLu6s/Hxi+431damLIWl5AABcf+tj6Js70Dd3QhpwepC2GGLL4JNwvliUGgVSSmL+ImgvnNWmiK3phJQhoOYnAXQXOSWb484/2H8owyQOKatB5mBGUSN72b/4mRgbpTSpA1ISofDqzk8CS31ZG228P60QBTIC+h37Mpe+USAbAmz+HxT3tk1cvnJJWmmcdDl8+colvhCqmdW+7quZVZh7FpVZHSCZa5n4Pdh/iImx0chiB6sPGJVyYJZgQ2K3/LuUXIAsArTxPDKK2uG859qomVVeI1DzkzirTfFZgkHWMCAjICqMt8tryChqIB/olvzc2zapTAtAOAHhse/H7PxiQAv8ZbIoLJRK5FEgdTHEYFTKgbm/G2QUSoWKDOv9buHLymFsejzEAWbnF3s+03NtmJVdMkGUFgF+552mkWJ5wknVX+pESRgBvXrfc+2A8+y8n4RuecKIMiTKxEhIiYBe+/6MBNvSI0Wx7rZIxZCcgJpZPbHGz0hg4igTQgjoFv6ea/dd4+9FAmUUCIuAcOLjuTaMSrlL62gwEqL2B6imRGEEhA2M+3sfp2mkGpYVKYoU6XFiAti6P2zwM6WLiZ5rW3rHM809SzgJZCKYpLLrryXUzConou62hJMgrCLEFjWiVPwRebycXjOrULI51KGiLnChJCQCwumsqNSV6QGD23B4NMzMPy0kChIRwAofflDs8NqWHvjeb3WpHwjVAIokxp8pht91iIPEUSBcBMOGikBUgdVtOFDzk4kTJOEEUP60JYrcpDtJsQmI+vkLJbqV2ZMKbqIICO/iyNjWEj3EEhHgz/9HlCHybe1wFIggI5GxbN8/qthBCf+225yWxpaZif3u2JlgbrhwVNQ8AAbGtDS25FSxOeY0Mfodi4DccOFo6ZoKoF2v+3DZlv5nJ4bHR4cAeNgyC0dxbEhM4x/360kfMTCcppHaMjP8e5uEeBiYgOPe/+fgwtxI7HsTR8CFuREUNU/6392AYM8vXVNj2TAQAVG9v7K6l0iFRSIOCX0T0C30T9P5O3c9/PWwxXVoZXVv4Gf0bTir/J4b+gVAW/x+vJs+1Z6P6u1B7Rmoca9/ff9b8TfDwNiReU6YBwAAAABJRU5ErkJggg=='; return i; })();
const D6 = { cv: null, lit: new Map(), cv2: new WeakMap(), n: 0, H: [30.5, 9], F: [29, 19], face: [30.6, 11.8] };      // the picture as a canvas, the lit copies, and where his head, his fists and his face are in it (picture pixels); v1.105: cv2 / n = the readable copies of other pictures and their numbers (the lit copies of every picture share one cache)
function d6Base() { if (D6.cv) return D6.cv; if (!D6_IMG.complete || !D6_IMG.naturalWidth) return null; const c = document.createElement('canvas'); c.width = c.height = 64; c.getContext('2d').drawImage(D6_IMG, 0, 0); D6.cv = c; return c; }
function d6Cv(img) {      // any picture (an image or a canvas) as a canvas whose pixels can be read; null while it is still loading (no picture = Megumi's)
  if (!img) return d6Base(); if (img.getContext) return img; let c = D6.cv2.get(img); if (c) return c; if (!img.complete || !img.naturalWidth) return null;
  c = document.createElement('canvas'); c.width = img.naturalWidth; c.height = img.naturalHeight; c.getContext('2d').drawImage(img, 0, 0); D6.cv2.set(img, c); return c;
}
function d6Lit(lights, k, img, dim) {      // the picture lit from the sides: lights = [[lx, ly, 'r,g,b'], ...] (lx, ly: the way to the light, each -1, 0 or 1; the first is the key light). A pixel that faces a light with nothing in front of it takes that light's colour (the rim); the others are brighter on the key side and dimmed by k (0 - 1) on the far side. img = another picture than Megumi's (any size), dim = how much of its own brightness the rest keeps (1 if left out: a picture that is too bright for the room gets less, with a little of the key light's colour instead)
  const b = d6Cv(img); if (!b) return null; const w = b.width, h = b.height, dm = dim == null ? 1 : dim, key = (img ? img.d6id || (img.d6id = ++D6.n) : 0) + JSON.stringify(lights) + k + '|' + dm, hit = D6.lit.get(key); if (hit) return hit;
  const p = b.getContext('2d').getImageData(0, 0, w, h).data, c = document.createElement('canvas'); c.width = w; c.height = h; const g = c.getContext('2d'), o = g.createImageData(w, h), q = o.data, K = lights[0], rc = lights.map(l => l[2].split(',').map(Number)), sc = w * 0.3125;
  const A = (x, y) => x < 0 || y < 0 || x >= w || y >= h ? 0 : p[(y * w + x) * 4 + 3];
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const i = (y * w + x) * 4; if (!p[i + 3]) continue; let rim = -1; for (let n = 0; n < lights.length; n++) if (!A(x + lights[n][0], y + lights[n][1])) { rim = n; break; }
    const s = ((x - w / 2) * K[0] + (y - h / 2) * K[1]) / sc, lit = Math.max(0, Math.min(1, 0.5 + 0.5 * s)), m = 1 - k + k * (0.45 + lit);
    for (let j = 0; j < 3; j++) q[i + j] = Math.max(0, Math.min(255, rim >= 0 ? p[i + j] * 0.2 + rc[rim][j] * 0.9 : p[i + j] * m * dm + rc[0][j] * (0.12 * lit + (1 - dm) * 0.16)));
    q[i + 3] = 255;
  }
  g.putImageData(o, 0, 0); if (D6.lit.size > 80) D6.lit.clear(); D6.lit.set(key, c); return c;
}
function d6Put(img, x, y, z) { if (img) ctx.drawImage(img, 0, 0, img.width, img.height, Math.round(x), Math.round(y), img.width * z, img.height * z); }      // the picture enlarged z times (a whole number), its corner at (x, y)
function d6Bg(T, o) {      // the place: a gradient (o.top to o.bot), light shafts that fan out from (o.sx, o.sy) around the angle o.ang (o.shaft: how strong), mist along the floor (o.mist), o.mote motes; o.col = the colour of the light, 'r,g,b'
  const g = ctx.createLinearGradient(0, 0, 0, VH); g.addColorStop(0, o.top); g.addColorStop(1, o.bot); ctx.fillStyle = g; ctx.fillRect(0, 0, VW, VH);
  const fy = Math.round(VH * (o.floor || 0.84)); ctx.fillStyle = 'rgba(0,0,0,0.35)'; ctx.fillRect(0, fy, VW, VH - fy); ctx.fillStyle = 'rgba(' + o.col + ',0.12)'; ctx.fillRect(0, fy, VW, 1);
  if (o.shaft > 0.01) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; for (let i = 0; i < 7; i++) { const a = o.ang + (i - 3) * 0.14 + 0.03 * Math.sin(T * 0.6 + i), w = 0.035 + 0.03 * c6H(i, 1), al = o.shaft * (0.05 + 0.07 * c6H(i, 2)) * (0.8 + 0.2 * Math.sin(T * 1.3 + i * 2)), L = VW * 2; ctx.fillStyle = 'rgba(' + o.col + ',' + al.toFixed(3) + ')'; ctx.beginPath(); ctx.moveTo(o.sx, o.sy); ctx.lineTo(o.sx + Math.sin(a - w) * L, o.sy + Math.cos(a - w) * L); ctx.lineTo(o.sx + Math.sin(a + w) * L, o.sy + Math.cos(a + w) * L); ctx.closePath(); ctx.fill(); } ctx.restore(); }
  if (o.mist > 0.01) for (let i = 0; i < 5; i++) { const W2 = VW * 1.6, x = ((c6H(i, 3) * W2 + T * (4 + 3 * c6H(i, 4))) % W2) - VW * 0.3, y = fy - 4 + 16 * c6H(i, 5), r = VW * (0.2 + 0.15 * c6H(i, 6)); ctx.save(); ctx.translate(x, y); ctx.scale(1, 0.3); const gr = ctx.createRadialGradient(0, 0, 2, 0, 0, r); gr.addColorStop(0, 'rgba(' + o.col + ',' + (o.mist * 0.17).toFixed(3) + ')'); gr.addColorStop(1, 'rgba(' + o.col + ',0)'); ctx.fillStyle = gr; ctx.fillRect(-r, -r, 2 * r, 2 * r); ctx.restore(); }
  if (o.mote) { ctx.save(); ctx.fillStyle = 'rgb(' + o.col + ')'; for (let i = 0; i < o.mote; i++) { ctx.globalAlpha = 0.2 + 0.5 * Math.abs(Math.sin(T * (1 + 2 * c6H(i, 11)) + i)); ctx.fillRect(Math.round((c6H(i, 7) * VW + T * (3 + 6 * c6H(i, 8))) % VW), Math.round(VH - ((c6H(i, 9) * VH + T * (4 + 8 * c6H(i, 10))) % VH)), 1, 1); } ctx.restore(); }
}
function d6Wheel(cx, cy, r, T, a) {      // the wheel of the Divine General: a ring with eight spokes that end in handles, turning slowly, drawn in blocks of 2 px; a = how much of it shows (0 - 1)
  if (a <= 0.01) return; ctx.save(); ctx.globalAlpha = Math.min(1, a); const P = 2, dot = (x, y, c) => { ctx.fillStyle = c; ctx.fillRect(Math.round(x / P) * P, Math.round(y / P) * P, P, P); }, n = Math.ceil(6.2832 * r / P);
  for (let i = 0; i < n; i++) { const t = i / n * 6.2832, c = Math.cos(t), s = Math.sin(t); dot(cx + c * (r + P), cy + s * (r + P), '#b8862a'); dot(cx + c * r, cy + s * r, '#ffd86a'); dot(cx + c * (r - P), cy + s * (r - P), '#fff4c0'); }
  for (let s = 0; s < 8; s++) { const t = T * 0.45 + s * 0.7854, c = Math.cos(t), si = Math.sin(t); for (let d = P * 2; d < r * 1.3; d += P) dot(cx + c * d, cy + si * d, d > r ? '#ffd86a' : '#fff4c0'); const hx = cx + c * r * 1.3, hy = cy + si * r * 1.3; for (let u = -1; u <= 1; u++) for (let v = -1; v <= 1; v++) dot(hx + u * P, hy + v * P, '#ffd86a'); }
  ctx.restore();
}
function d6Title(txt, x, y, size, a, col) {      // a big title: the words again behind it in the colour col (a glow, shifted a little each way), a dark edge, and the words in gold white; a = how much of it shows
  if (a <= 0.01) return; ctx.save(); ctx.globalAlpha = Math.min(1, a) * 0.3; for (const [dx, dy] of [[-2, 0], [2, 0], [0, -2], [0, 2]]) pxt(txt, x + dx, y + dy, 'rgb(' + col + ')', size, 'center'); ctx.globalAlpha = Math.min(1, a); pxt(txt, x + 1, y + 1, '#2a1a05', size, 'center'); pxt(txt, x, y, '#fff6d8', size, 'center'); ctx.restore();
}
function d6Blade(x0, y0, x1, y1, a) {      // a blade of light from (x0, y0) to (x1, y1), thinner towards the tip: a wide soft body, a gold one and a white edge, in blocks of 2 px
  if (a <= 0.01) return; const n = Math.ceil(Math.hypot(x1 - x0, y1 - y0) / 2); ctx.save();
  for (const [w, c, al] of [[10, '#ff9a2a', 0.22], [5, '#ffd86a', 0.9], [2, '#ffffff', 1]]) { ctx.fillStyle = c; ctx.globalAlpha = Math.min(1, a) * al; for (let i = 0; i <= n; i++) { const t = i / n, w2 = w * (1 - 0.6 * t); ctx.fillRect(Math.round((x0 + (x1 - x0) * t) / 2) * 2, Math.round((y0 + (y1 - y0) * t - w2 / 2) / 2) * 2, 2, Math.max(2, Math.round(w2 / 2) * 2)); } }
  ctx.restore();
}
function d6SSay(now, dt, T, st, t1, cx, g) {      // "DID SOMEONE SAY...": Verity's close-up stays, pushed in a little more; the red goes out of it and a cold light comes in from a door on the left
  const k = t1 / st.d, ln = C4_SEQ.find(q => q.k === 'line'), s = 1 + 0.06 * ease3(k), li = ease3(clamp01((t1 - 0.45) / 1.5)), w = VW * (0.2 + 0.45 * li);
  ctx.save(); ctx.translate(VW / 2, VH * 0.57); ctx.scale(s, s); ctx.translate(-VW / 2, -VH * 0.57); c4SLine(now, dt, T, ln, ln.d, cx, g); ctx.restore();
  ctx.fillStyle = 'rgba(4,8,30,' + (0.55 * ease3(clamp01(t1 / 1.6))).toFixed(3) + ')'; ctx.fillRect(0, 0, VW, VH);
  ctx.save(); ctx.globalCompositeOperation = 'lighter'; const gr = ctx.createLinearGradient(0, 0, w, 0); gr.addColorStop(0, 'rgba(170,205,255,' + (0.62 * li).toFixed(3) + ')'); gr.addColorStop(1, 'rgba(170,205,255,0)'); ctx.fillStyle = gr; ctx.fillRect(0, 0, w, VH); ctx.restore();
  c6Glow(0, VH * 0.5, VW * 0.55, '150,190,255', 0.4 * li); msDust(T, 0, 0, VW * 0.8, VH, 26, 0.6 * li, 7);
  if (t1 > 1.95) c6White(0.16 * Math.sin((t1 - 1.95) / 0.45 * 3.14159));      // (the light surges)
  msFinish(1);
}
function d6SPot(now, dt, T, st, t1) {      // "POTENTIAL?": a smash cut to Megumi standing in the light, seen from below, dark against it with a rim of light all the way round; the picture is 2 times its size and starts under the speech box, so his legs go down into the mist
  const k = t1 / st.d, z = 2, x = VW / 2 - 31 * z + Math.round(4 * (k - 0.5)), y = 33 + Math.round(Math.sin(T * 1.7));
  d6Bg(T, { top: '#04060e', bot: '#0a1226', sx: VW * 0.5, sy: VH * 0.3, ang: 0, shaft: 1.0, col: '175,205,255', mist: 1, mote: 46, floor: 0.82 });
  c6Glow(VW * 0.5, VH * 0.42, VW * 0.55, '150,190,255', 0.95); c6Glow(VW * 0.5, VH * 0.5, VW * 0.2, '255,255,255', 0.75);
  ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = 'rgba(200,225,255,0.35)'; ctx.fillRect(0, Math.round(VH * 0.45), VW, 1); ctx.restore();
  d6Put(d6Lit([[-1, 0, '190,215,255'], [1, 0, '190,215,255'], [0, -1, '235,245,255']], 0.82), x, y, z);
  { const gr = ctx.createLinearGradient(0, VH * 0.6, 0, VH * 0.92); gr.addColorStop(0, 'rgba(110,150,225,0)'); gr.addColorStop(1, 'rgba(80,120,205,0.92)'); ctx.fillStyle = gr; ctx.fillRect(0, VH * 0.6, VW, VH * 0.4); }
  c6Glow(VW * 0.5, VH * 0.45, VW * 0.3, '200,225,255', 0.18);
  if (t1 < 0.1) c6Black(1); else c6White(Math.max(0, 1 - (t1 - 0.1) / 0.3));      // (black, then a flash that dies)
  msFinish(1);
}
function d6SWith(now, dt, T, st, t1) {      // "WITH THIS SACRED TREASURE, I SUMMON...": his head and fists 4 times the size, under the speech box; a warm key light from the upper right, a cold fill from the left, his fists glowing blue, the wheel beginning to show behind his head
  const k = t1 / st.d, z = 4, x = VW / 2 - D6.H[0] * z + Math.round(6 * (k - 0.5)), y = 40, hx = Math.round(x + D6.H[0] * z);
  d6Bg(T, { top: '#05060c', bot: '#0b0b1a', sx: VW * 0.95, sy: -10, ang: -0.5, shaft: 0.7 + 0.5 * k, col: '255,214,140', mist: 0.8, mote: 40, floor: 0.9 });
  d6Wheel(hx, y + 8 * z, 56, T, ease3(clamp01((t1 - 0.8) / 1.6)) * 0.55); c6Glow(hx, y + 8 * z, 80, '255,214,140', 0.3 * k);
  d6Put(d6Lit([[1, -1, '255,214,140'], [-1, 0, '120,170,255']], 0.55), x, y, z);
  c6Glow(x + D6.F[0] * z, y + D6.F[1] * z, 52, '130,190,255', 0.28 + 0.3 * (0.5 + 0.5 * Math.sin(T * 7)) * ease3(clamp01(t1 / 1.0)));
  ctx.fillStyle = 'rgba(0,0,8,' + (0.35 * (1 - k)).toFixed(3) + ')'; ctx.fillRect(0, 0, VW, VH); msFinish(1);
}
function d6SSword(now, dt, T, st, t1) {      // "EIGHT-HANDLED SWORD": his face and fists 6 times the size on the left; a blade of light is drawn from his fists across the picture and the words stand over it; a flash on the draw
  const k = t1 / st.d, z = 6, x = Math.round(VW * 0.3 - 30 * z + 8 * (k - 0.5)), y = 40 - 8 * z, hx = x + D6.F[0] * z + 4, hy = y + D6.F[1] * z + 3, bl = ease3(clamp01((t1 - 0.35) / 0.35));
  d6Bg(T, { top: '#05050c', bot: '#0a0a16', sx: VW * 0.3, sy: VH, ang: 3.14159, shaft: 0.5 + 0.8 * bl, col: '255,226,160', mist: 0.6, mote: 36, floor: 0.95 });
  c6Glow(hx, hy, 90, '255,226,160', 0.5 * bl); d6Put(d6Lit([[0, -1, '255,230,170'], [1, 0, '255,200,120']], 0.5), x, y, z);
  d6Wheel(hx, hy, 11, T, bl); d6Blade(hx, hy, hx + (VW - 6 - hx) * bl, hy - 36 * bl, bl);
  const wa = ease3(clamp01((t1 - 0.5) / 0.25)); d6Title('EIGHT-HANDLED', 226, 56, 10, wa, '255,190,80'); d6Title('SWORD', 226, 90, 24, wa, '255,190,80');
  if (t1 >= 0.35) c6White(0.5 * Math.exp(-(t1 - 0.35) * 8)); msFinish(1);
}
function d6SDiv(now, dt, T, st, t1) {      // "DIVERGENT SILA DIVINE GENERAL": his head 6 times the size under the speech box, lit from above in gold; the wheel opens behind it; the two names come one after the other on the right, each with a flash
  const k = t1 / st.d, z = 6, x = Math.round(VW * 0.28 - D6.H[0] * z + 6 * (k - 0.5)), y = 40, hx = Math.round(x + D6.H[0] * z), hy = Math.round(y + 8 * z), wa = ease3(clamp01((t1 - 0.2) / 0.9)), t0 = 0.35, t2 = 1.55;
  d6Bg(T, { top: '#06050a', bot: '#120d0a', sx: hx, sy: hy - 30, ang: 0, shaft: 0.6 + 0.8 * ease3(clamp01(t1 / 1.2)), col: '255,220,140', mist: 0.5, mote: 44, floor: 0.97 });
  d6Wheel(hx, hy, Math.round(26 + 34 * wa), T, wa); c6Glow(hx, hy, 110, '255,214,120', 0.5 * wa);
  d6Put(d6Lit([[0, -1, '255,226,150'], [1, 0, '255,196,110']], 0.62), x, y, z); c6Glow(hx, hy - 20, 70, '255,240,190', 0.2 * wa);
  { const a1 = ease3(clamp01((t1 - t0) / 0.2)), a2 = ease3(clamp01((t1 - t2) / 0.2)); d6Title('DIVERGENT', 230, 66, 14, a1, '255,200,90'); d6Title('SILA', 230, 85, 14, a1, '255,200,90'); d6Title('DIVINE', 230, 111, 16, a2, '255,200,90'); d6Title('GENERAL', 230, 129, 16, a2, '255,200,90'); }
  c6White((t1 >= t0 ? 0.45 * Math.exp(-(t1 - t0) * 9) : 0) + (t1 >= t2 ? 0.5 * Math.exp(-(t1 - t2) * 9) : 0)); msFinish(1);
}
function d6SMaho(now, dt, T, st, t1) {      // "MAHORAGA": black, a white flash, and the wheel turns up behind the name in gold with rays; the picture shakes; it fades to black at the end
  const hit = 0.25, g = ease3(clamp01((t1 - hit) / 0.5)), sh = c6Shk(T, t1 >= hit && t1 < hit + 0.7 ? 3 : 0), mx = VW / 2, my = VH * 0.62;
  ctx.save(); ctx.translate(sh[0], sh[1]);
  d6Bg(T, { top: '#0a0806', bot: '#1a1206', sx: mx, sy: my, ang: 0, shaft: 0, col: '255,214,120', mist: 0.4, mote: 50, floor: 0.97 });
  ctx.save(); ctx.globalCompositeOperation = 'lighter'; for (let i = 0; i < 16; i++) { const a = T * 0.15 + i * 0.3927, w = 0.05; ctx.fillStyle = 'rgba(255,214,120,' + (0.1 * g * (0.6 + 0.4 * Math.sin(T * 2 + i))).toFixed(3) + ')'; ctx.beginPath(); ctx.moveTo(mx, my); ctx.lineTo(mx + Math.cos(a - w) * VW, my + Math.sin(a - w) * VW); ctx.lineTo(mx + Math.cos(a + w) * VW, my + Math.sin(a + w) * VW); ctx.closePath(); ctx.fill(); } ctx.restore();
  c6Glow(mx, my, VW * 0.5, '255,214,120', 0.7 * g); d6Wheel(Math.round(mx), Math.round(my), Math.round(40 + 20 * g), T, g);
  d6Title('MAHORAGA', Math.round(mx), Math.round(VH * 0.55), 30, t1 >= hit ? ease3(clamp01((t1 - hit) / 0.12)) : 0, '255,200,80'); ctx.restore();
  if (t1 >= hit && t1 < hit + 0.45) c6White(0.85 * (1 - (t1 - hit) / 0.45)); c6Black(clamp01((t1 - (st.d - 0.9)) / 0.9)); msFinish(1);
}
TN_COL.MEGUMI = '#8fb8ff'; C3E_TALK.push({ t: c4T('dsay') + 0.35, d: 1.9, w: '???', vk: 3, a: 'DID SOMEONE SAY...', b: '' }, { t: c4T('dpot') + 0.3, d: 1.5, w: '???', vk: 3, a: 'POTENTIAL?', b: '' }, { t: c4T('dwith') + 0.4, d: 2.5, w: 'MEGUMI', vk: 4, a: 'WITH THIS SACRED TREASURE', b: 'I SUMMON...' }, { t: c4T('dsword') + 0.35, d: 2.1, w: 'MEGUMI', vk: 4, a: 'EIGHT-HANDLED SWORD', b: '' }, { t: c4T('ddiv') + 0.3, d: 2.5, w: 'MEGUMI', vk: 4, a: 'DIVERGENT SILA', b: 'DIVINE GENERAL' }, { t: c4T('dmaho') + 0.5, d: 2.2, w: 'MEGUMI', vk: 4, a: 'MAHORAGA', b: '' });
function d6Events(ev, now) {      // the sounds and shakes of the summoning (each fires once)
  const Ts = c4T('dsay'), Tp = c4T('dpot'), Tw = c4T('dwith'), Tb = c4T('dsword'), Td = c4T('ddiv'), Tm = c4T('dmaho');
  ev('m_wind', Ts, () => snd('dwind'), 1); ev('m_smash', Tp, () => { snd('dsmash'); c2Shake(now, 360, 3); }, 0.6);
  ev('m_c0', Tw + 0.4, () => snd('dchant', 0), 1); ev('m_c1', Tb + 0.35, () => { snd('dchant', 1); c2Shake(now, 200, 2); }, 1);
  ev('m_c2', Td + 0.35, () => snd('dchant', 2), 1); ev('m_c2b', Td + 1.55, () => { snd('dchant', 2); c2Shake(now, 240, 2); }, 1);
  ev('m_c3', Tm + 0.25, () => { snd('dchant', 3); c2Shake(now, 700, 5); }, 1.2);
}
// ---------------------------------------------------------------- v1.105 THE BLUE EYE, part 1: after MAHORAGA (the shot dmaho) Verity charges at Megumi (vchg) and a large white being wrapped in tight white cloth tears itself together behind him (vmaho); then the Master sends the blue eye to "???" and the chapter ends (part 2, below)
// Lit like the summoning: the cold light from Megumi's end of the room, a gold light from the wheel, a rim of colour on every edge (d6Lit, which lights any picture now). All shots are pure functions of the scene time T.
const V6_IMG = (() => { const i = new Image(); i.src = 'data:image/png;base64,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'; return i; })();      // the being: 96 x 124, from the front, cut off at the thighs; every part is a shaded dome and the cloth is saw-tooth ridges, the eyes are dark slits (tools/maho_96.png)
const V6 = { run: 1.9, eyes: [[42, 14, 4], [50, 14, 4], [44, 20, 2], [50, 20, 2]] };      // the charge runs 1.9 s, then he leaps; the eye slits in the picture (x, y, width; each 2 pixels high)
const t6H = (i, k) => { let h = Math.imul(i ^ Math.imul(k + 1, 0x9e3779b1), 0x85ebca6b); h ^= h >>> 13; h = Math.imul(h, 0xc2b2ae35); h ^= h >>> 16; return (h >>> 0) / 4294967296; };      // a repeatable random number (0 to 1) for thing i and trait k, mixed well enough that two traits of the same thing (its x and its y) are not on a line (c6H is not)
const v6D = t => 60 * t + 271.4 * Math.pow(Math.max(0, t) / 1.9, 2.8);      // how far the camera has run t seconds into the charge (px; the speed climbs from 60 to 460 px/s)
function v6Streaks(D, n, col, a, y0, y1, m) {      // n thin lines that rush to the left (the camera runs to the right): D = how far the camera has run, m = how long the lines are; each line has its own height, length and share of D
  ctx.save(); ctx.fillStyle = col; const S = VW + 160; for (let i = 0; i < n; i++) { const x = (((t6H(i, 23) * S - D * (0.5 + 1.1 * t6H(i, 21))) % S) + S) % S - 80; ctx.globalAlpha = a * (0.2 + 0.5 * t6H(i, 25)); ctx.fillRect(Math.round(x), Math.round(y0 + t6H(i, 24) * (y1 - y0)), Math.max(2, Math.round((4 + 40 * t6H(i, 22)) * m)), 1); } ctx.restore();
}
function v6Room(T, o) {      // the room of the summoning again (cold blue, the light at one end): o.sx = where the light is, o.glow / o.shaft = how strong, o.fy = the floor (a share of the height)
  d6Bg(T, { top: '#04060e', bot: '#0a1226', sx: o.sx, sy: VH * 0.45, ang: o.sx > VW / 2 ? -1.4 : 0, shaft: o.shaft, col: '175,205,255', mist: 1, mote: 40, floor: o.fy });
  c6Glow(o.sx, VH * 0.45, VW * 0.6, '150,190,255', 0.85 * o.glow); c6Glow(o.sx, VH * 0.48, VW * 0.22, '255,255,255', 0.7 * o.glow);
}
function v6Ring(x, y, r, a, col) {      // a ring of light (a = how much of it shows), drawn in 2 steps: a wide faint band and a thin bright line
  if (a <= 0.01) return; ctx.save(); ctx.globalCompositeOperation = 'lighter'; for (const [w, k] of [[5, 0.3], [1.5, 1]]) { ctx.lineWidth = w; ctx.strokeStyle = 'rgba(' + col + ',' + (a * k).toFixed(3) + ')'; ctx.beginPath(); ctx.arc(x, y, Math.max(1, r), 0, 6.2832); ctx.stroke(); } ctx.restore();
}

// ---- 1. the charge: the camera runs beside Verity along the floor, the speed lines and the cold light of Megumi's end of the room rushing at them, Megumi a small dark shape ahead against it; after 1.9 s Verity leaps
function v6SChg(now, dt, T, st, t1) {
  const Fy = Math.round(VH * 0.84), run = V6.run, u = clamp01(t1 / run), lp = clamp01((t1 - run) / (st.d - run)), D = v6D(t1 < run ? t1 : run + (t1 - run) * 0.5), light = [[1, 0, '175,205,255'], [0, -1, '120,150,225']];
  const sh = c6Shk(T, 1 + 3 * u), vx = t1 < run ? 70 + 24 * u * u : 94 + 160 * Math.pow(Math.min(1.1, (t1 - run) / 0.85), 1.7), air = t1 < run ? 0 : 14 * Math.sin(lp * 3.14159), vf = (nm, f, lp2) => d6Lit(light, 0.7, vfr(nm, f, lp2), 0.62);
  ctx.save(); ctx.translate(sh[0], sh[1]);
  v6Room(T, { sx: VW + 20, glow: 0.5 + 0.5 * u, shaft: 0.6 + 0.9 * u, fy: 0.84 });
  v6Streaks(D, 26, '#cfe0ff', 0.55, 20, Fy - 2, 0.2 + 1.3 * u); v6Streaks(D * 1.4, 18, '#9fb6ee', 0.5, Fy + 2, Fy + 12, 0.3 + 1.6 * u);
  const mx = Math.round(330 - 0.22 * (v6D(Math.min(t1, run)) - v6D(1.1))), mg = d6Lit([[1, 0, '190,215,255'], [0, -1, '235,245,255']], 0.85);
  if (mx < VW + 40) d6Put(mg, mx - 32, Fy - 62, 1);      // (Megumi, far ahead)
  ctx.fillStyle = 'rgba(0,0,10,0.55)'; ctx.fillRect(Math.round(vx) - 6, Fy + 1, 44 + Math.round(30 * u), 2);      // (his shadow, longer the faster he is)
  if (t1 < run) { for (let i = 3; i >= 1; i--) { ctx.globalAlpha = 0.3 / i; d6Put(vf('run', Math.floor((t1 - 0.04 * i) * 22), true), vx - 15 * i * (0.4 + u), Fy - 62, 1); } ctx.globalAlpha = 1; d6Put(vf('run', Math.floor(t1 * 22), true), vx, Fy - 62, 1); }      // (three ghosts behind him, then himself)
  else { for (let i = 3; i >= 1; i--) { ctx.globalAlpha = 0.28 / i; d6Put(vf('fx_leap', 5 + Math.min(4, (t1 - run) * 18), false), vx - 26 * i, Fy - 62 - air, 1); } ctx.globalAlpha = 1; d6Put(vf('fx_leap', 5 + Math.min(4, (t1 - run) * 18), false), vx, Fy - 62 - air, 1); }
  v6Streaks(D * 1.9, 10, '#ffffff', 0.5, 20, Fy + 10, 0.6 + 2.4 * u);      // (a few streaks in front of everybody)
  ctx.restore(); msDust(T, 0, 0, VW, VH, 20, 0.3, 9); c6Black(1 - t1 / 0.3); c6White(0.95 * clamp01((t1 - (st.d - 0.22)) / 0.2)); msFinish(1);
}

// ---- 2. the being: the picture of it tears itself together in strips from the sides, from the feet up (the strips come from alternate sides and snap tight), behind Megumi while Verity flies at them; the ring, the wheel and the four eyes; then a cut in close to its face
function v6Strips(img, x, y, t) {      // the picture in strips 4 px high, the lowest first; each slides in from the side and snaps tight (a small overshoot); t = seconds since the first one moved; returns how many have landed (0 - 1)
  const n = Math.ceil(img.height / 4); let done = 0;
  for (let i = 0; i < n; i++) {
    const u = clamp01((t - (n - 1 - i) * 0.022) / 0.55); if (u >= 1) done++; if (u <= 0) continue;
    const e = 1 + 1.9 * Math.pow(u - 1, 3) + 0.9 * Math.pow(u - 1, 2); ctx.globalAlpha = clamp01(u * 5); ctx.drawImage(img, 0, i * 4, img.width, 4, Math.round(x + (i % 2 ? 1 : -1) * VW * 0.6 * (1 - e)), y + i * 4, img.width, 4);
  }
  ctx.globalAlpha = 1; return done / n;
}
function v6Eyes(ox, oy, z, T, on) {      // the four eye slits of the being, lit one after the other (on = 0 - 1 for all of them), each with a bloom
  V6.eyes.forEach((e, i) => { const a = ease3(clamp01(on * 1.9 - i * 0.22)) * (0.88 + 0.12 * Math.sin(T * 7 + i)); if (a < 0.02) return; ctx.save(); ctx.globalAlpha = a; ctx.fillStyle = '#ffd36a'; ctx.fillRect(ox + e[0] * z, oy + e[1] * z, e[2] * z, 2 * z); ctx.fillStyle = '#fff4c8'; ctx.fillRect(ox + (e[0] + 1) * z, oy + e[1] * z, Math.max(1, e[2] - 2) * z, z); ctx.restore(); c6Glow(ox + (e[0] + e[2] / 2) * z, oy + (e[1] + 1) * z, 5 * z, '255,190,70', 0.32 * a); });
}
function v6SMaho(now, dt, T, st, t1) {
  const Fy = Math.round(VH * 0.84), cut = 2.55;
  if (t1 >= cut) {      // ---- the close-up: his head and shoulders 3 times the size in the light of the wheel; the eyes are lit
    const t2 = t1 - cut, z = 3, hx = Math.round(VW / 2), hy = 76, ox = hx - 48 * z, oy = hy - 19 * z + Math.round(Math.sin(T * 1.3)), on = ease3(clamp01(t2 / 0.7)), sh = c6Shk(T, t2 > 1.7 ? 3 : 0);
    ctx.save(); ctx.translate(sh[0], sh[1]); ctx.fillStyle = '#05040a'; ctx.fillRect(0, 0, VW, VH);
    c6Glow(hx, hy, VW * 0.6, '255,196,90', 0.55 * on);
    ctx.save(); ctx.globalCompositeOperation = 'lighter'; for (let i = 0; i < 16; i++) { const a = T * 0.12 + i * 0.3927, w = 0.045; ctx.fillStyle = 'rgba(255,200,100,' + (0.1 * on * (0.6 + 0.4 * Math.sin(T * 2 + i))).toFixed(3) + ')'; ctx.beginPath(); ctx.moveTo(hx, hy); ctx.lineTo(hx + Math.cos(a - w) * VW, hy + Math.sin(a - w) * VW); ctx.lineTo(hx + Math.cos(a + w) * VW, hy + Math.sin(a + w) * VW); ctx.closePath(); ctx.fill(); } ctx.restore();
    d6Wheel(hx, hy, 50, T, on); c6Glow(hx, hy - 20, 60, '255,240,190', 0.3 * on);
    d6Put(d6Lit([[0, -1, '255,214,140'], [-1, 0, '255,170,90'], [1, 0, '255,170,90']], 0.45, V6_IMG), ox, oy, z); v6Eyes(ox, oy, z, T, ease3(clamp01((t2 - 0.35) / 1.0)));
    ctx.restore(); c6White(t2 < 0.16 ? 0.7 * (1 - t2 / 0.16) : 0); c6White(0.95 * clamp01((t2 - (st.d - cut - 0.2)) / 0.18)); msFinish(1); return;
  }
  const bx = Math.round(VW * 0.62 - 48), by = 16, hx = bx + 48, hy = by + 19, ta = t1 - 0.3, lock = 1.55, sh = c6Shk(T, t1 >= lock && t1 < lock + 0.4 ? 3 : 0), vt = clamp01(t1 / 2.5), vf = d6Lit([[1, 0, '175,205,255'], [0, -1, '120,150,225']], 0.7, vfr('fx_leap', 6 + Math.min(3, t1 * 5), false), 0.62);
  ctx.save(); ctx.translate(sh[0], sh[1]);
  v6Room(T, { sx: VW * 0.62, glow: 0.7, shaft: 0.9, fy: 0.84 });
  const wa = ease3(clamp01((t1 - 1.7) / 0.7)); d6Wheel(hx, hy, 30, T, wa); c6Glow(hx, hy, 80, '255,200,100', 0.5 * wa);      // (the wheel behind his head)
  const bl = d6Lit([[0, -1, '255,214,140'], [-1, 0, '150,190,255']], 0.5, V6_IMG); if (bl && ta > 0) v6Strips(bl, bx, by, ta);
  if (t1 >= lock) { c6Glow(hx, by + 60, 120, '255,236,190', 0.5 * Math.exp(-(t1 - lock) * 4)); v6Ring(hx, by + 60, (t1 - lock) * 150, Math.max(0, 1 - (t1 - lock) * 1.8), '255,226,160'); }
  v6Eyes(bx, by, 1, T, ease3(clamp01((t1 - 1.9) / 0.6)));
  { const gr = ctx.createLinearGradient(0, Fy - 22, 0, Fy + 6); gr.addColorStop(0, 'rgba(60,90,160,0)'); gr.addColorStop(1, 'rgba(70,105,185,0.85)'); ctx.fillStyle = gr; ctx.fillRect(0, Fy - 22, VW, 28); }      // (the mist rises over the cut-off legs)
  ctx.fillStyle = 'rgba(0,0,10,0.5)'; ctx.fillRect(Math.round(VW * 0.47) - 16, Fy + 1, 32, 2);
  d6Put(d6Lit([[1, 0, '190,215,255'], [0, -1, '235,245,255']], 0.85), VW * 0.47 - 32, Fy - 62, 1);      // (Megumi stands in front of it, small)
  { const vx = lerp(-34, 84, ease3(vt)), vy = Fy - 62 - 24 * Math.sin(vt * 3.14159); for (let i = 3; i >= 1; i--) { ctx.globalAlpha = 0.22 / i; d6Put(vf, vx - 18 * i * (1 - vt), vy, 1); } ctx.globalAlpha = 1; d6Put(vf, vx, vy, 1); }      // (Verity in the air, still coming)
  if (t1 >= 0.3 && t1 < lock) for (let i = 0; i < 18; i++) { const q = (t1 * 1.3 + c6H(i, 31)) % 1; ctx.globalAlpha = 0.5 * (1 - q); ctx.fillStyle = '#e8ecff'; ctx.fillRect(Math.round(bx + c6H(i, 32) * 96), Math.round(by + 124 - q * 120 * (0.4 + c6H(i, 33))), 2, 1); } ctx.globalAlpha = 1;      // (scraps of cloth fly up)
  ctx.restore(); msDust(T, 0, 0, VW, VH, 22, 0.35, 5); c6White(t1 < 0.25 ? 1 - t1 / 0.25 : 0); c6White(t1 >= lock ? 0.55 * Math.exp(-(t1 - lock) * 9) : 0); msFinish(1);
}

// ================================================================ part 2: the blue eye reaches "???"
// The Master's claw lets go of the stone and a violet circle takes it (tport); "???" stands in space, a violet circle opens in front of him and the stone comes out of it (tspace); his hand takes it (ttake) and puts it in the socket of the thumb (tthumb); it flares (tpower), he lifts the gauntlet (tlift) and the planet he stands on is torn apart (tplanet); then the card. The light does the work again: every picture is lit again at every frame by the lights that are in the picture at that moment (t6Lit: the stone, the violet circle, the other stones), in steps like the rest of the picture.
const T6 = { px: new Map(), cv: new Map() };
function t6Px(img) {      // the pixels (RGBA) of a picture, read once
  let o = T6.px.get(img); if (o) return o; const c = d6Cv(img); if (!c) return null; o = c.getContext('2d').getImageData(0, 0, c.width, c.height).data; T6.px.set(img, o); return o;
}
function t6Lit(img, key, L) {      // the picture lit again for this frame: L = { amb: how much of its own colour it keeps in the dark, tint: 'r,g,b' added in the dark, lights: [{ x, y, R, col: 'r,g,b', a, add }] (picture pixels; add = the light adds to the colours the picture has instead of changing them), rim: [{ dx, dy, col: 'r,g,b', a }] (an edge that faces (dx, dy) takes that colour), steps: 7 }; returns the canvas of the lit picture (one per key, made again each time). Where a light reaches a pixel, the pixel's own brightness is looked up in a ramp of that light's colour (deep, strong, pale, white), so the drawing keeps its shading but takes the light's colour (as the purple stone did on the gold)
  const c = d6Cv(img), px = c && t6Px(img); if (!px) return null; const w = c.width, h = c.height; let o = T6.cv.get(key);
  if (!o) { const cv = document.createElement('canvas'); cv.width = w; cv.height = h; const g = cv.getContext('2d'); o = { cv, g, im: g.createImageData(w, h) }; T6.cv.set(key, o); }
  const q = o.im.data, S = L.steps || 7, amb = L.amb, tn = (L.tint || '0,0,0').split(',').map(Number), rm = (c0, t) => c0 + (255 - c0) * t, rs = (L.rim || []).map(r => ({ dx: r.dx, dy: r.dy, a: r.a, c: r.col.split(',').map(Number) }));
  const ls = L.lights.map(l => { const c3 = l.col.split(',').map(Number); return { x: l.x, y: l.y, R: l.R, a: l.a, add: !!l.add, c3, r: [c3.map(v => v * 0.12), c3.map(v => v * 0.6), c3.map(v => rm(v, 0.4)), c3.map(v => rm(v, 0.88))] }; });
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const i = (y * w + x) * 4; if (px[i + 3] < 128) { q[i + 3] = 0; continue; }
    const lum = (0.3 * px[i] + 0.59 * px[i + 1] + 0.11 * px[i + 2]) / 255, t = Math.min(1, lum * 1.2); let r = px[i] * amb + tn[0], g = px[i + 1] * amb + tn[1], b = px[i + 2] * amb + tn[2];
    for (const l of ls) {
      const d = Math.hypot(x + 0.5 - l.x, y + 0.5 - l.y) / l.R; if (d >= 1) continue; const f = Math.floor(Math.pow(1 - d, 1.5) * l.a * S) / S; if (f <= 0.12) continue;
      if (l.add) { const k = f * 0.9, sp = f * Math.max(0, lum - 0.55) * 1.3; r += px[i] * l.c3[0] / 255 * k + l.c3[0] * sp; g += px[i + 1] * l.c3[1] / 255 * k + l.c3[1] * sp; b += px[i + 2] * l.c3[2] / 255 * k + l.c3[2] * sp; continue; } const m = Math.min(0.95, Math.pow(Math.min(1, (f - 0.12) / 0.88), 1.4) * 0.95), A = t < 0.34 ? 0 : t < 0.67 ? 1 : 2, u = A === 0 ? t / 0.34 : A === 1 ? (t - 0.34) / 0.33 : (t - 0.67) / 0.33, c0 = l.r[A], c1 = l.r[A + 1];
      r += (c0[0] + (c1[0] - c0[0]) * u - r) * m; g += (c0[1] + (c1[1] - c0[1]) * u - g) * m; b += (c0[2] + (c1[2] - c0[2]) * u - b) * m;
    }
    for (const e of rs) { const nx = x + e.dx, ny = y + e.dy; if (nx >= 0 && ny >= 0 && nx < w && ny < h && px[(ny * w + nx) * 4 + 3] >= 128) continue; r += (e.c[0] - r) * e.a; g += (e.c[1] - g) * e.a; b += (e.c[2] - b) * e.a; }
    q[i] = r > 255 ? 255 : r; q[i + 1] = g > 255 ? 255 : g; q[i + 2] = b > 255 ? 255 : b; q[i + 3] = 255;
  }
  o.g.putImageData(o.im, 0, 0); return o.cv;
}
function t6Stone(x, y, k, a) {      // the blue stone, drawn as the iris of the Six Eyes: a ring of blue, a lighter cross, a bright middle and a white catchlight, 3 x 3 cells of k screen pixels, its middle on (x, y); a = how much of it shows
  if (a <= 0.01) return; const X = Math.round(x - 1.5 * k), Y = Math.round(y - 1.5 * k); ctx.save(); ctx.globalAlpha = Math.min(1, a);
  ctx.fillStyle = '#2f7fe0'; ctx.fillRect(X, Y, 3 * k, 3 * k); ctx.fillStyle = '#59b8ff'; ctx.fillRect(X + k, Y, k, 3 * k); ctx.fillRect(X, Y + k, 3 * k, k); ctx.fillStyle = '#d6f5ff'; ctx.fillRect(X + k, Y + k, k, k); ctx.fillStyle = '#ffffff'; ctx.fillRect(X, Y, k, k); ctx.restore();
}
function t6Rays(x, y, len, a, k) {      // thin rays of light along the four directions and the four corners, in steps of k screen pixels, getting fainter and ending in a point
  if (a <= 0.01 || len < 1) return; ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = '#bfeaff';
  for (let i = 2; i <= len + 1; i++) { ctx.globalAlpha = Math.min(1, a) * (1 - (i - 2) / len); for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) ctx.fillRect(x + dx * i * k, y + dy * i * k, k, k); if (i < len * 0.6) { ctx.globalAlpha = Math.min(1, a) * 0.5 * (1 - i / (len * 0.6)); for (const [dx, dy] of [[1, 1], [-1, 1], [1, -1], [-1, -1]]) ctx.fillRect(x + dx * i * k, y + dy * i * k, k, k); } }
  ctx.restore();
}
function t6Portal(x, y, r, T, a, col) {      // the Master's circle in the air: a dark disc in a ring of light with a second ring and runes (small marks) that turn; r = radius, a = how much of it shows, col = 'r,g,b' (violet)
  if (a <= 0.01 || r < 2) return; ctx.save(); ctx.globalAlpha = Math.min(1, a); const gr = ctx.createRadialGradient(x, y, 0, x, y, r); gr.addColorStop(0, 'rgba(8,2,18,0)'); gr.addColorStop(0.55, 'rgba(14,4,30,0.25)'); gr.addColorStop(0.85, 'rgba(30,8,60,0.6)'); gr.addColorStop(1, 'rgba(' + col + ',0)'); ctx.fillStyle = gr; ctx.beginPath(); ctx.arc(x, y, r, 0, 6.2832); ctx.fill();
  ctx.globalCompositeOperation = 'lighter'; for (const [rr, w, al] of [[r, 3, 0.35], [r, 1, 1], [r * 0.78, 1, 0.55]]) { ctx.lineWidth = w; ctx.strokeStyle = 'rgba(' + col + ',' + al + ')'; ctx.beginPath(); ctx.arc(x, y, rr, 0, 6.2832); ctx.stroke(); }
  ctx.fillStyle = 'rgb(' + col + ')'; const n = Math.max(8, Math.round(r / 2.2)); for (let i = 0; i < n; i++) { const an = T * (i & 1 ? -0.9 : 0.9) + i * 6.2832 / n, rr = r * (i % 3 === 0 ? 0.9 : 0.86); ctx.globalAlpha = Math.min(1, a) * (0.5 + 0.5 * Math.sin(T * 5 + i * 2)); ctx.fillRect(Math.round(x + Math.cos(an) * rr), Math.round(y + Math.sin(an) * rr), i % 3 === 0 ? 2 : 1, i % 3 === 0 ? 2 : 1); }
  ctx.restore();
}

// ---- 1. the claw lets go: the same picture as the end of the crush (the claw shut on the glowing stone); the claw opens, the stone rises, a violet circle opens round it and closes on it with a flash: the stone is gone
const T6P = { open: 0.35, go: 1.85 };      // seconds into the shot: the claw starts to open, the circle shuts and the stone is gone
function t6SPort(now, dt, T, st, t1) {
  const Z = Math.max(4, c6Zf() + 3), sx = Math.round(VW * 0.4), sy = Math.round(VH * 0.5), X = -4, Y = -12, op = ease3(clamp01((t1 - T6P.open) / 1.0)), rise = ease3(clamp01((t1 - 0.9) / 0.9)), gone = t1 >= T6P.go, pa = clamp01((t1 - 1.05) / 0.5), pr = t1 < T6P.go ? (1 - Math.pow(1 - clamp01((t1 - 1.05) / 0.8), 2)) * 14 * Z : Math.max(0, 1 - (t1 - T6P.go) / 0.25) * 14 * Z;
  const tips = [[-2 - X, -2 - Y], [0 - X, -2 - Y], [0 - X, 2 - Y], [-2 - X, 2 - Y]], cl = { x: X, y: Y, ct: 1 - op, tips, thick: 1 }, sy2 = -Math.round(7 * rise + Math.sin(T * 3) * 0.6 * rise), on = 1 + 0.5 * pa;
  const sh = c6Shk(T, !gone ? 2 * pa : 0);
  ctx.save(); ctx.translate(sh[0], sh[1]); rsCloseBg(T); c6Glow(sx, sy + sy2 * Z, 170, gone ? '150,80,240' : '60,150,255', gone ? 0.25 * Math.max(0, 1 - (t1 - T6P.go) / 0.9) : 0.2 + 0.25 * pa);
  if (pa > 0) { t6Portal(sx, sy + sy2 * Z, pr, T, pa, '190,130,255'); if (!gone) c6Glow(sx, sy + sy2 * Z, pr * 1.3, '170,100,255', 0.3 * pa); }
  c6On(Z, 0, 0, sx, sy); c6Claw(cl, 0);
  if (!gone) { for (let i = 0; i < 3; i++) { const q = (T * 0.9 + i * 0.37) % 1; ctx.globalAlpha = 1 - q * 0.5; c6P(-2 + i * 2, 4 + Math.round(q * q * 16), BLD[0], 1, 2); } ctx.globalAlpha = 1; c6Iris(0, sy2); }
  c6Claw(cl, 1);
  if (!gone) { c6StoneLight(0, sy2, 4 + 14 * on, 1, T); const tw = (T * 0.9) % 2.6; c6Rays(0, sy2, Math.round(4 + 10 * (tw < 0.8 ? Math.sin(Math.PI * tw / 0.8) : 0) + 6 * pa), 0.8 + 0.2 * pa); }
  c6Off();
  if (gone) { const a = t1 - T6P.go; v6Ring(sx, sy + sy2 * Z, 20 + a * 380, Math.max(0, 1 - a * 2.2), '210,170,255'); for (let i = 0; i < 26; i++) { const an = c6H(i, 81) * 6.2832, v = 40 + 160 * c6H(i, 82), q = Math.min(1, a / 1.2); ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = 1 - q; ctx.fillStyle = i & 1 ? '#c9a0ff' : '#8fd0ff'; ctx.fillRect(Math.round(sx + Math.cos(an) * v * a * 0.8), Math.round(sy + sy2 * Z + Math.sin(an) * v * a * 0.8 + 30 * a * a), 2, 2); ctx.restore(); } }
  ctx.restore(); if (gone) { const a = t1 - T6P.go; c6White(0.9 * Math.exp(-a * 11)); if (a > 0.06) { ctx.fillStyle = 'rgba(150,80,240,' + (0.3 * Math.exp(-(a - 0.06) * 6)).toFixed(3) + ')'; ctx.fillRect(0, 0, VW, VH); } }
  c6Black(clamp01((t1 - (st.d - 0.55)) / 0.5)); msFinish(1);
}

// ---- the place: space. Stars that twinkle, a faint violet haze, a big banded planet in the sky (its light is the only light "???" has in the dark) and the ground, the curved edge of a dark world with a violet rim and a few rocks
function t6Sky(T, o) {      // o.neb = how strong the haze is, o.al = how bright the stars are
  ctx.fillStyle = '#020308'; ctx.fillRect(0, 0, VW, VH);
  for (const [x, y, r, col, a] of [[0.82, 0.18, 0.7, '120,60,190', 0.16], [0.15, 0.7, 0.6, '40,70,170', 0.12], [0.5, 0.45, 0.9, '70,40,130', 0.08]]) { if (o.neb <= 0) break; const g = ctx.createRadialGradient(VW * x, VH * y, 4, VW * x, VH * y, VW * r); g.addColorStop(0, 'rgba(' + col + ',' + (a * o.neb).toFixed(3) + ')'); g.addColorStop(1, 'rgba(' + col + ',0)'); ctx.fillStyle = g; ctx.fillRect(0, 0, VW, VH); }
  for (let i = 0; i < 150; i++) { const b = t6H(i, 43), x = Math.floor(t6H(i, 41) * VW), y = Math.floor(t6H(i, 42) * VH * 0.92), a = (0.25 + 0.75 * b * b) * (0.6 + 0.4 * Math.sin(T * (0.8 + 2 * t6H(i, 44)) + i * 1.7)) * o.al; ctx.globalAlpha = Math.min(1, a); ctx.fillStyle = b > 0.85 ? '#cfe0ff' : b > 0.6 ? '#ffe9cf' : '#b9b9e8'; ctx.fillRect(x, y, 1, 1); if (b > 0.94) { ctx.globalAlpha = Math.min(1, a) * 0.5; ctx.fillRect(x - 1, y, 3, 1); ctx.fillRect(x, y - 1, 1, 3); } }
  ctx.globalAlpha = 1;
}
function t6Giant(x, y, r, a) {      // a big banded planet, lit from the left, with a thin ring behind it
  ctx.save(); ctx.globalAlpha = a * 0.55; ctx.strokeStyle = 'rgba(190,150,255,0.55)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.ellipse(x, y, r * 1.75, r * 0.3, -0.3, 0, 6.2832); ctx.stroke(); ctx.restore();
  ctx.save(); ctx.globalAlpha = a; ctx.beginPath(); ctx.arc(x, y, r, 0, 6.2832); ctx.clip();
  const gr = ctx.createRadialGradient(x - r * 0.5, y - r * 0.3, r * 0.1, x, y, r * 1.1); gr.addColorStop(0, '#7a58a8'); gr.addColorStop(0.5, '#3c2868'); gr.addColorStop(1, '#0a0716'); ctx.fillStyle = gr; ctx.fillRect(x - r, y - r, 2 * r, 2 * r);
  for (let i = 0; i < 9; i++) { ctx.fillStyle = i % 2 ? 'rgba(170,120,220,0.13)' : 'rgba(16,8,34,0.22)'; ctx.fillRect(x - r, Math.round(y - r + r * 2 * (i + 0.25 * Math.sin(i * 2.1)) / 9), 2 * r, Math.round(r * 0.11 + 3 * (i % 3))); }
  ctx.restore();
}
function t6Gy(x, top) { return Math.round(top + (x - VW / 2) * (x - VW / 2) / 1120); }      // the height of the ground at x (a gentle curve: it is a small world)
function t6Ground(top, lt) {      // the ground: columns 2 px wide under the curve; a violet rim along its edge, brighter toward the big planet (lt = how much); a few rocks
  for (let x = 0; x < VW; x += 2) { const y = t6Gy(x, top) + (t6H(x >> 2, 51) < 0.3 ? 1 : 0); ctx.fillStyle = '#06040c'; ctx.fillRect(x, y, 2, VH - y); ctx.fillStyle = 'rgba(' + '150,100,230' + ',' + (lt * (0.18 + 0.5 * x / VW)).toFixed(3) + ')'; ctx.fillRect(x, y, 2, 1); }
  for (let i = 0; i < 9; i++) { const x = Math.round(t6H(i, 52) * VW), w = 6 + Math.round(t6H(i, 53) * 12), h = 3 + Math.round(t6H(i, 54) * 6), y = t6Gy(x, top); ctx.fillStyle = '#0a0712'; ctx.fillRect(x, y - h, w, h + 2); ctx.fillRect(x + 2, y - h - 2, w - 5, 2); ctx.fillStyle = 'rgba(150,100,230,' + (0.35 * lt).toFixed(3) + ')'; ctx.fillRect(x + 2, y - h - 2, w - 5, 1); ctx.fillRect(x + w - 1, y - h, 1, h); }
}

// ---- 2. "???" stands in space: wide, dark; a violet circle opens in the air in front of him, the blue stone comes out of it and floats to his gauntlet, and its light floods the ground and him
const T6S = { fx: 96, top: 114 };      // where he stands (the screen x of his middle) and the height of the ground in the middle of the screen
function t6SSpace(now, dt, T, st, t1) {
  const fy = t6Gy(T6S.fx, T6S.top), ox = T6S.fx - 32, oy = fy - 62, pOn = ease3(clamp01((t1 - 1.1) / 0.6)), pOff = 1 - ease3(clamp01((t1 - 2.45) / 0.5)), pa = pOn * pOff, pr = 17 * (1 - Math.pow(1 - clamp01((t1 - 1.1) / 0.8), 2)) * (0.3 + 0.7 * pOff), px = T6S.fx + 36, py = oy + 24;
  const em = ease3(clamp01((t1 - 1.9) / 0.5)), mv = ease3(clamp01((t1 - 2.15) / 1.0)), sxn = lerp(px, T6S.fx + 11, mv), syn = lerp(py, oy + 21, mv), A = em * (0.88 + 0.12 * Math.sin(T * 6)), sh = c6Shk(T, t1 >= 1.9 && t1 < 2.3 ? 2 : 0);
  ctx.save(); ctx.translate(sh[0], sh[1]); t6Sky(T, { neb: 1, al: 0.9 }); t6Giant(VW * 0.86, 22, 52, 1); c6Glow(VW * 0.86, 22, 150, '150,100,230', 0.2);
  t6Ground(T6S.top, 1);
  c6Glow(sxn, fy, 100, '70,150,255', 0.4 * A);      // (the stone's light on the ground)
  const fg = t6Lit(C5I.body, 'figS', { amb: 0.32, tint: '8,5,16', lights: [{ x: sxn - ox, y: syn - oy, R: 44, col: '90,175,255', a: 1.15 * A }, { x: px - ox, y: py - oy, R: 36, col: '170,100,255', a: 0.9 * pa }], rim: [{ dx: 1, dy: -1, col: '150,100,230', a: 0.55 }, { dx: 1, dy: 0, col: '110,170,255', a: 0.6 * A }] }); if (fg) d6Put(fg, ox, oy, 1);
  if (pa > 0) { c6Glow(px, py, 70, '160,90,255', 0.35 * pa); t6Portal(px, py, pr, T, pa, '190,130,255'); }
  if (A > 0.01) { c6Glow(sxn, syn, 60, '70,150,255', 0.55 * A); c6Glow(sxn, syn, 20, '210,240,255', 0.8 * A); t6Rays(sxn, syn, Math.round(10 * A), A, 1); t6Stone(sxn, syn, 1, A); const a = t1 - 1.9; v6Ring(sxn, syn, a * 150, Math.max(0, 1 - a * 1.4), '150,210,255'); }
  ctx.restore(); c6Black(1 - t1 / 0.7); c6White(t1 >= 1.9 && t1 < 2.05 ? 0.35 * (1 - (t1 - 1.9) / 0.15) : 0); msFinish(1);
}

// ---- the hand: his bare hand from the side, pointing left (tools/hand_open.png, hand_shut.png: 64 x 64), pinching: open = the stone floats between the thumb and the finger, shut = the tips meet on it
const T6H = (() => { const mk = u => { const i = new Image(); i.src = u; return i; }; return { open: mk('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAEF0lEQVR4nO2YTWgbRxTH/y69qBatgtIlOTQ4UOpAG0goFSH44vagUBI3lDQ5xIU2MYQSaIuaQ0+Jk37k0gScgxODbSh2D7LA1HUPTSDZixFBOqxRVzQSQYboIGnx1vJmFfWmHpQZz+pjtYpXkiHvB0KzM6OZeX/NzntvAIIgCIIgCIIgCIIgCIIgCIIgCIIgiJeAvk4O7vVIFSf9zLLW0XXY0ZGJmeHj38wDAHJ5zbb/VDhUV9ctUVydxM5wvbhV9vskyzOrE6kVpVOCuDao1yNV7kUSUBMZpNIZAFtG6xv2O4Dh37UlgihIdHURf6dWbH/7ogK5JkD0z3xFTWRgGCbUR6pjo52wvpnGl6cvwTBM5PIawn/9hIVpmberiQxCP5zkz+2I4eoOuHDmJvSiBn1Dgxybte0/HDjneOxsQcHoye+Qy2vQixr8PgnR1UXc+HESaiJT15+J4USIjpwBTiYX+7YSI1tQ8NGRzwGAC8x2RS2GYfLy+MRoyzX3zP2IeD1SpZkI8WQEZ49fBbBlPICGAojGi7vl/sM5LqDIVDiEV90yYrtkCwoAIL/+GB+8+xniyQhe79+LY0MXWx6mouFAvfd5Vi41nXfHCHDoQPB5KYiosohjQxcBNDZaSS3h2y8m6gwH6mMO8fdsR4j0XADmPk+PDePw4CcAgMGBoab/djwZwaWx23X1jWIONsbm0395XXpNhX+XxNtecc+U7bEwLSNbUBBPRhq2x5MRZAuKxfhcXuMfRrPXRd+onh/MeBZz9HwHMNREhru6+w/nLG359cfYs/ttAMD87zd4vfhuHz38KS/bxSCsjX33VAC2/UX0ooZDB4Lw+yQsy3dglHLof60fk7/8CqAq1LVb57EwLfMYwDBMXL89Br9vHwYHhtpaQ0/doChAdCXBt/KyfAd68Ql8b/gwN3kPLMJksGjw8tczlvEMw8SVibP4MHCe1z2IzVieReTYbOcFsAuOvB6pcvT96un/1Cyh/F8J2dw/WP4tZvl3GbUnPBOhts/8Hz8jcHDE1nigCwLUJkhihmeWtT6xnWHn0xnMnelFDauP7vKzg7VF7l6H1/MmAgdHbNcnx2Y7fwawrZ1eU3Eq+D2AaqY3FQ5VLpy5iehK9RVodWcAWFPq9JrKyyzqA6qHmxPjGR0XoHZx7JuFvq0MF8PfRjwrlyxisCSsNhlrFmp35QxoleyIvrmdNFp8x5nBzZKwZtdzXfECbPJ2UuBWPIjNoE9Y/otciHg9UqWrbtAtIZTUEoqbuivXZD2JA5zeFg8HzkFJLWG3bx+P+gbe2o9TH38FwzAxPjG6bRF6Egk6XbQcm7XcMgHAieAIvxpzgx2TCzTCLGt9U+GQZbe8s/+9lp6hHXbEjVA7tHPtRhAEQRAEQdjwP2c1YIl02DMgAAAAAElFTkSuQmCC'), shut: mk('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAELUlEQVR4nO2YT2gUZxjGnwUv2yxly+oQD7YKoRFswCAGCbloDyvFpqHYejBF0YC0gimrBy/atNbaQw3dHrSBJFiSHjYrIf45GCHuJV3C5pB0MwE3yKZoYbeDW9dx1vU2PWy/r9/M7OxOsrNZKe/vsvN/v+eZ93vfdz6AIAiCIAiCIAiCIAiCIAiCIAiCIAiC+P/jaeSf+7ySbndOKyobMrYNNcAseKB/3PbagXCvYb9ehmyIAUy4KDiTVRzfH1+cxFJqtuI16zVo03pucopZeDnRK6syAm9JyD1TbH8BYPDCFFRVQyarIHLvMiaGY/wZcjKN0KUeHl1rMaNuEeDzSvr9aBLx2aRBeC5f2mbCnPDkrwX09pxFJqsgl1cQ8EuIL07i6rfXICfTlutDl3oAODOiLhHg80r64IUpg/hcXlmTaDOiiSurMgCUFa+qGo+4gXCvbZJluG4AE8/CFfhvwAAQS4xa7tnfccL2efPLURw99DWA6iaqqsa3M1kFh4PnEfBLmJkbw/v7PrNcPxQJuWuAOezZgEXR5cIylhjVW95pR/bpI+zd9QmAkvA3m7biYNfpqtNGFA7AMuVeFgu2Y3bNgPjdrA6UwpKH/b/inczF3TuDAIKIL0wCAA52nebPMLOQuoUvj4ctwgFrohXvZ/lDxNUIYG9+ZVXmb72aeBY1n/btR3vrR2jd3mUZuMj8chTn+q5bjldKtM9f/M2PiVUHcNGAzkPNHrHRWWtdnhiO4YtzxwzTQGR+OYrmzS0G8eXKqt10YftiiQVcjoBaujU5mealbmZuzHAu+/QRmje3AADGp67y4+Lc7mz/mG9XSpTsnOsRsB5Y+Ivk8gp27wwi4JdwJ/Yz1EIGTW804doPvwAoGfXNTycxMRzjZVBVNVy53oeA/20+hZxS11bY3PubI0Q0gOWPmbkxvCwWkMs/xp1fEwaRIj/e6MfFMyOGY6qq4avwURzoOMmPPUiMGPZFYonR+htwP5qEnEwjnpjDzenv+TmtqHh8Xknv3BMEALzQClj983dM3vgNcjJdsbQxIvcu4+KZEUv9H7/9HTrauiuKBzbIgIH+cV4ZgFISCvglDEVCOHVkEFubJdv77T6YWDnL5RUsPpzmuYOdi05fgc+7BR1t3RXHF0uM1j8HyA9lYy1+VmqOWPdX7atQFCtmb7G7ZE0Xe74T8Yy6fw77vJJeqdUFrKVJ3Gb7dqT+mDUkvnKtNlC+3a77FGCwZFjNiLUizvFqjZfd6lNDVoTcMOJBYgQeYfjr6UF8XklvyJqg3dtwasxC6hbyz3OuLJM1dFHUjNmYttbS3C6+KvCub/u2HTj8weel7/5wb80mNLQTNGMWs5Sa1U8dGTSsA3wY7DasNdTKa2WAGa2oeIYiIUNUvLvjvZpXl0ReqynghFq+OAmCIAiCIAiBfwBGAXaRMFaG0AAAAABJRU5ErkJggg=='), P: { open: [18.5, 39.5], shut: [19, 41.5] } }; })();
function t6Hand(shut, px, py, z, key, a) {      // the hand with the point between its fingertips on the screen point (px, py), lit by the stone that is there (a = how bright the stone is, 0 - 1.3); returns nothing
  const P = shut ? T6H.P.shut : T6H.P.open, c = t6Lit(shut ? T6H.shut : T6H.open, key, { amb: 0.2, tint: '16,9,30', lights: [{ x: P[0], y: P[1], R: 62, col: '140,170,255', a: 0.9 * a, add: true }, { x: P[0], y: P[1], R: 16, col: '90,175,255', a: 1.2 * a }], rim: [{ dx: -1, dy: 0, col: '120,190,255', a: 0.5 * a }, { dx: 0, dy: -1, col: '120,190,255', a: 0.3 * a }] });
  if (c) d6Put(c, px - P[0] * z, py - P[1] * z, z);
}

// ---- 3. his hand takes the stone: black but for the stone's own light; the hand comes in from the right (its fingertips are lit first, then the rest as it gets close), pinches the stone and carries it away to the left
function t6STake(now, dt, T, st, t1) {
  const S0 = [190, 70], u = ease3(clamp01((t1 - 0.25) / 1.3)), pinch = t1 >= 1.65, car = ease3(clamp01((t1 - 1.95) / 1.25)), A = 0.9 + 0.1 * Math.sin(T * 6);
  let hx = lerp(S0[0] + 200, S0[0], u), hy = lerp(S0[1] - 30, S0[1], u); if (t1 >= 1.95) { hx = lerp(S0[0], -70, Math.pow(car, 1.5)); hy = lerp(S0[1], S0[1] + 40, car); }
  const stx = pinch ? hx : S0[0], sty = pinch ? hy : S0[1] + Math.sin(T * 2.4) * 1.2, k = 4;
  t6Sky(T, { neb: 0.5, al: 0.35 }); c6Glow(stx, sty, 150, '60,140,255', 0.5 * A); c6Glow(stx, sty, 48, '200,235,255', 0.55 * A);
  t6Hand(pinch, hx, hy, 3, pinch ? 'hs' : 'ho', A); t6Stone(stx, sty, k, 1); t6Rays(stx, sty, 6, A, k / 2); c6Glow(stx, sty, 22, '230,248,255', 0.5);
  if (pinch) { const a = t1 - 1.65; v6Ring(stx, sty, a * 120, Math.max(0, 1 - a * 3.5), '170,220,255'); c6White(a < 0.1 ? 0.3 * (1 - a / 0.1) : 0); }
  c6Black(1 - t1 / 0.3); msFinish(1);
}

// ---- 4. the stone goes into the thumb: the gauntlet 4 times the size of its picture, dark but for the purple stone; the hand brings the blue stone in from the right, its light running over the gold; it is pressed into the socket of the thumb; the socket flares, the hand lets go and leaves
function t6Gem() {      // the pixels of the thumb socket's hole (its two dark colours, within 2.8 pixels of its middle) with the colour each has as a blue stone: light at the upper left, deep at the lower right, one white highlight; found once from the picture itself
  if (T6.gem) return T6.gem; const px = t6Px(C5I.gaunt); if (!px) return null; const cx = 32.6, cy = 20.6, hole = [];
  for (let y = 15; y < 27; y++) for (let x = 27; x < 39; x++) { const i = (y * 64 + x) * 4, wall = px[i] === 58 && px[i + 1] === 34 && px[i + 2] === 8; if (px[i + 3] > 200 && Math.hypot(x + 0.5 - cx, y + 0.5 - cy) < 2.8 && (wall || (px[i] === 18 && px[i + 1] === 10 && px[i + 2] === 4))) hole.push([x, y, wall]); }
  const hx = hole.reduce((a, q) => a + q[0] + 0.5, 0) / hole.length, hy = hole.reduce((a, q) => a + q[1] + 0.5, 0) / hole.length, us = hole.map(q => -(q[0] + 0.5 - hx) - (q[1] + 0.5 - hy)), top = us.indexOf(Math.max(...us)), mixh = (a, b, t) => '#' + [1, 3, 5].map(j => Math.round(parseInt(a.slice(j, j + 2), 16) * (1 - t) + parseInt(b.slice(j, j + 2), 16) * t).toString(16).padStart(2, '0')).join('');
  const C = ['#0b2b70', '#1f60d2', '#3f96ff', '#9bd9ff', '#ffffff'];
  return T6.gem = { cx: hx, cy: hy, px: hole.map((q, j) => ({ x: q[0], y: q[1], c: mixh(C[j === top ? 4 : us[j] > 0.8 ? 3 : us[j] > -0.3 ? 2 : us[j] > -1.2 ? 1 : 0], q[2] ? '#3a2208' : '#120a04', j === top ? 0 : q[2] ? 0.06 : 0.22) })) };
}
const T6G = { z: 4, ox: 12, oy: -9 };      // the gauntlet's picture on the screen (its corner, and how many screen pixels one of its pixels is)
function t6Gaunt(T, o) {      // the gauntlet lit for this frame: o.stone = [x, y, a] the blue stone in the picture's pixels (or null), o.purple = how bright the purple stone is, o.flare = a white-blue surge over everything, o.amb = how much of its own colour it keeps, o.o = [x, y, z] another place for the picture than T6G; draws it and both gems
  const A = c5Art(), G = t6Gem(); if (!A || !G) return;
  const L = { amb: o.amb == null ? 0.18 : o.amb, tint: '6,4,13', lights: [{ x: C5G.sc[0], y: C5G.sc[1], R: 15, col: '160,90,255', a: 0.6 * o.purple }], rim: [], steps: 8 };
  if (o.stone) L.lights.push({ x: o.stone[0], y: o.stone[1], R: o.stone[3] || 36, col: '70,160,255', a: 1.2 * o.stone[2] });
  if (o.flare > 0) L.lights.push({ x: 36, y: 22, R: 60, col: '150,210,255', a: o.flare });
  const c = t6Lit(C5I.gaunt, 'gaunt', L); if (!c) return; const [ox, oy, z] = o.o || [T6G.ox, T6G.oy, T6G.z]; d6Put(c, ox, oy, z);
  ctx.save(); ctx.translate(ox, oy); ctx.scale(z, z); ctx.globalAlpha = 0.6 + 0.4 * o.purple; for (const g of A.gem) { ctx.fillStyle = g.c; ctx.fillRect(g.x, g.y, 1, 1); } ctx.globalAlpha = 1;
  if (o.gem > 0) { ctx.globalAlpha = Math.min(1, o.gem) * (0.94 + 0.06 * Math.sin(T * 5)); for (const g of G.px) { ctx.fillStyle = g.c; ctx.fillRect(g.x, g.y, 1, 1); } ctx.globalAlpha = 1; }
  ctx.restore();
}
const t6GP = (x, y) => [T6G.ox + x * T6G.z, T6G.oy + y * T6G.z];      // a point of the gauntlet's picture on the screen
function t6SThumb(now, dt, T, st, t1) {
  const G = t6Gem(), sock = G ? t6GP(G.cx, G.cy) : [142, 73], hov = [sock[0] + 26, sock[1] - 30], u = ease3(clamp01((t1 - 0.2) / 1.3)), ins = ease3(clamp01((t1 - 1.8) / 0.2)), inn = t1 >= 2.0, lv = ease3(clamp01((t1 - 2.05) / 0.5)), lv2 = Math.pow(ease3(clamp01((t1 - 2.1) / 0.8)), 1.4);
  let sx = lerp(VW + 90, hov[0], u), sy = lerp(hov[1] - 40, hov[1], u); if (t1 >= 1.8) { sx = lerp(hov[0], sock[0], ins); sy = lerp(hov[1], sock[1], ins); }
  const A = 0.9 + 0.1 * Math.sin(T * 6), purple = 0.55 + 0.1 * Math.sin(T * 3) + 0.4 * ease3(clamp01((t1 - 2.4) / 0.6)), sp = [(sx - T6G.ox) / T6G.z, (sy - T6G.oy) / T6G.z], gem = inn ? 1 : 0, shk = c6Shk(T, t1 > 2.0 && t1 < 2.5 ? 3 : 0);
  ctx.save(); ctx.translate(shk[0], shk[1]); ctx.fillStyle = '#030208'; ctx.fillRect(-4, -4, VW + 8, VH + 8); const hz = ctx.createRadialGradient(VW / 2, VH * 0.55, 4, VW / 2, VH * 0.55, VW * 0.5); hz.addColorStop(0, 'rgba(60,25,100,0.1)'); hz.addColorStop(1, 'rgba(20,8,40,0)'); ctx.fillStyle = hz; ctx.fillRect(0, 0, VW, VH);
  t6Gaunt(T, { stone: inn ? [sp[0], sp[1], 0.75 + 0.3 * lv, 14 + 14 * lv2] : [sp[0], sp[1], 1.1, 24], purple, flare: 0, gem });
  const hand = t1 < 2.0 ? [sx, sy, 1] : [lerp(sock[0], VW + 90, Math.pow(ease3(clamp01((t1 - 2.15) / 0.7)), 1.6)), lerp(sock[1], sock[1] - 10, ease3(clamp01((t1 - 2.15) / 0.7))), t1 < 2.2 ? 1 : 0];
  if (!inn) { c6Glow(sx, sy, 150, '60,140,255', 0.45 * A); c6Glow(sx, sy, 46, '200,235,255', 0.5 * A); }
  c6Glow(sock[0], sock[1], 60 + 150 * lv2, '60,150,255', (0.15 + 0.6 * lv) * A); if (inn) { c6Glow(sock[0], sock[1], 30, '220,245,255', 0.7 * lv); t6Rays(Math.round(sock[0]), Math.round(sock[1]), Math.round(4 + 12 * lv), 0.9 * lv, 3); }
  c6Glow(...t6GP(C5G.sc[0], C5G.sc[1]), 60, '150,80,240', 0.35 * purple);
  if (t1 < 2.9) t6Hand(hand[2], hand[0], hand[1], 4, hand[2] ? 'hs' : 'ho', A);
  if (!inn) t6Stone(sx, sy, 5, 1);
  if (inn) { const a = t1 - 2.0; v6Ring(sock[0], sock[1], a * 220, Math.max(0, 1 - a * 1.6), '150,210,255'); c6White(a < 0.12 ? 0.55 * (1 - a / 0.12) : 0); }
  ctx.restore(); c6Black(1 - t1 / 0.3); msFinish(1);
}

// ---- 5. the stone flares: the gauntlet as it was (4 times its picture); bolts of blue light jump from the stone to the other sockets, each one flashes, the whole fist floods with light and shakes; then the camera pulls back from the gauntlet to "???" (the gauntlet's picture hands over to his), the stone's light on his body and face, bolts crackling round his arm
const T6C = { boom: 1.5, zoom: 2.6 };      // seconds into the shot: the white surge, and where the pull-back is over
function t6SPower(now, dt, T, st, t1) {
  const G = t6Gem(), A = c5Art(); if (!G || !A) { c6Black(1); return; }
  const p = ease3(clamp01(t1 / T6C.boom)), pul = 0.9 + 0.1 * Math.sin(T * 7), sock = t6GP(G.cx, G.cy), sh = c6Shk(T, t1 < T6C.boom + 0.3 ? 1 + 5 * p : 0);
  ctx.save(); ctx.translate(sh[0], sh[1]);
  if (t1 < T6C.boom + 0.15) {      // ---- the fist, close
    ctx.fillStyle = '#030208'; ctx.fillRect(-6, -6, VW + 12, VH + 12);
    const sk = [[41.5, 17.5], [47.2, 21.9], [49.5, 25], [42, 30.5]], hit = i => Math.max(0, Math.sin((T * 9 + i * 1.7) % 6.2832)) * p;      // (the four other sockets and how bright each one is when a bolt has just hit it)
    t6Gaunt(T, { stone: [G.cx, G.cy, 1.0 + 0.3 * p, 20 + 14 * p], purple: 0.9, flare: 0.55 * p * p, gem: 1 });
    c6Glow(sock[0], sock[1], 80 + 120 * p, '60,150,255', (0.45 + 0.4 * p) * pul); c6Glow(sock[0], sock[1], 30, '220,245,255', 0.8 * pul); t6Rays(Math.round(sock[0]), Math.round(sock[1]), Math.round(8 + 20 * p), 0.9, 3);
    ctx.save(); ctx.translate(T6G.ox, T6G.oy); ctx.scale(T6G.z, T6G.z); ctx.globalCompositeOperation = 'lighter';
    sk.forEach((q, i) => { if (p > 0.08) c6Bolt(G.cx, G.cy, q[0], q[1], i * 31, T, i & 1 ? '#8fd0ff' : '#e6faff'); const h = hit(i); if (h > 0.05) { ctx.globalAlpha = h; ctx.fillStyle = '#d6f5ff'; ctx.fillRect(Math.round(q[0]) - 1, Math.round(q[1]) - 1, 3, 3); ctx.globalAlpha = 1; } });
    ctx.restore(); sk.forEach((q, i) => { const h = hit(i), s2 = t6GP(q[0], q[1]); if (h > 0.05) c6Glow(s2[0], s2[1], 40, '120,200,255', 0.6 * h); });
    for (let i = 0; i < 16; i++) { const q = (T * 1.3 + t6H(i, 91)) % 1, an = t6H(i, 92) * 6.2832, d = 10 + q * (60 + 140 * t6H(i, 93)) * (0.4 + p); ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = (1 - q) * p; ctx.fillStyle = i & 1 ? '#9fe0ff' : '#ffffff'; ctx.fillRect(Math.round(sock[0] + Math.cos(an) * d), Math.round(sock[1] + Math.sin(an) * d), 2, 2); ctx.restore(); }      // (sparks fly off it)
  }
  if (t1 >= T6C.boom - 0.05) {      // ---- the pull-back: the camera goes from the fist (the gauntlet's picture is 4 times as fine as his) out to his body; his picture comes up out of the dark as the camera pulls back, and the gauntlet's picture hands over to his at the end
    const u = clamp01((t1 - T6C.boom) / (T6C.zoom - T6C.boom)), e = ease3(u), z = 16 * Math.pow(4 / 16, e), ca = 1 - ease3(clamp01((u - 0.8) / 0.2)), fa = ease3(clamp01((u - 0.55) / 0.35)), fx0 = lerp(C5G.o[0] + 36 * 0.25, 35, e), fy0 = lerp(C5G.o[1] + 22 * 0.25, 17.5, e), sx = Math.round(VW * 0.5), sy = Math.round(VH * 0.56);
    const fx = C5G.o[0] - Math.round((C5G.o[0] - fx0) * z) / z, fy = C5G.o[1] - Math.round((C5G.o[1] - fy0) * z) / z, stn = [C5G.o[0] + G.cx / 4, C5G.o[1] + G.cy / 4], on = 0.85 + 0.15 * Math.sin(T * 6);
    ctx.fillStyle = '#030208'; ctx.fillRect(-6, -6, VW + 12, VH + 12);
    ctx.save(); c6Glow(sx + (stn[0] - fx) * z, sy + (stn[1] - fy) * z, Math.max(60, 12 * z), '60,150,255', 0.55 * on);
    c4CamOn(z, fx, fy, sx, sy);
    const fg = t6Lit(C5I.body, 'figP', { amb: 0.28, tint: '6,4,14', lights: [{ x: stn[0], y: stn[1], R: 40, col: '120,175,255', a: 1.0 * on, add: true }, { x: stn[0], y: stn[1], R: 7, col: '80,170,255', a: 1.4 * on }], rim: [{ dx: 1, dy: 0, col: '110,170,255', a: 0.5 }, { dx: 0, dy: -1, col: '110,170,255', a: 0.35 }], steps: 8 }); if (fg) { ctx.globalAlpha = fa; ctx.drawImage(fg, 0, 0); ctx.globalAlpha = 1; }
    if (ca > 0.01) { const gc = t6Lit(C5I.gaunt, 'gauntP', { amb: 0.12, tint: '4,2,10', lights: [{ x: C5G.sc[0], y: C5G.sc[1], R: 15, col: '160,90,255', a: 0.6 }, { x: G.cx, y: G.cy, R: 36, col: '70,160,255', a: 1.7 * on }, { x: 36, y: 22, R: 50, col: '150,210,255', a: 0.8 }], rim: [], steps: 8 }); if (gc) { ctx.save(); ctx.translate(C5G.o[0], C5G.o[1]); ctx.scale(0.25, 0.25); ctx.globalAlpha = ca; ctx.drawImage(gc, 0, 0); ctx.globalAlpha = ca; for (const g of A.gem) { ctx.fillStyle = g.c; ctx.fillRect(g.x, g.y, 1, 1); } for (const g of G.px) { ctx.fillStyle = g.c; ctx.fillRect(g.x, g.y, 1, 1); } ctx.restore(); ctx.globalAlpha = 1; } }
    ctx.save(); ctx.globalCompositeOperation = 'lighter'; for (let i = 0; i < 4; i++) { const k = Math.floor(T * 14) * 7 + i * 13, a = t6H(k, 94) * 6.2832, d = 5 + 9 * t6H(k, 95); c6Bolt(stn[0], stn[1], stn[0] + Math.cos(a) * d, stn[1] + Math.sin(a) * d * 0.8, i * 17, T, i & 1 ? '#8fd0ff' : '#e6faff'); } ctx.restore();      // (bolts crackle round the stone: in his pixels, the chunky bolts of the other scenes)
    c4Cam0(); ctx.restore();
    { const a2 = t1 - T6C.boom; if (a2 > 0 && a2 < 0.9) { const rx = sx + (stn[0] - fx) * z, ry = sy + (stn[1] - fy) * z; v6Ring(rx, ry, 30 + a2 * 520, 1 - a2 / 0.9, '170,220,255'); if (a2 > 0.12) v6Ring(rx, ry, 20 + (a2 - 0.12) * 420, 0.7 * (1 - a2 / 0.9), '120,180,255'); } }
    c6Glow(sx + (stn[0] - fx) * z, sy + (stn[1] - fy) * z, 40 + 4 * z, '200,240,255', 0.45 * on); t6Rays(Math.round(sx + (stn[0] - fx) * z), Math.round(sy + (stn[1] - fy) * z), Math.round(10 + 6 * Math.sin(T * 3)), 0.8, 2);
    for (let i = 0; i < 20; i++) { const q = (T * 0.9 + t6H(i, 96)) % 1, an = t6H(i, 97) * 6.2832, d = 8 + q * (30 + 90 * t6H(i, 98)); ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = (1 - q) * 0.9 * e; ctx.fillStyle = '#bfeaff'; ctx.fillRect(Math.round(sx + (stn[0] - fx) * z + Math.cos(an) * d), Math.round(sy + (stn[1] - fy) * z + Math.sin(an) * d), 1, 1); ctx.restore(); }
  }
  ctx.restore();
  if (t1 >= T6C.boom - 0.05 && t1 < T6C.boom + 0.4) c6White(0.95 * (t1 < T6C.boom + 0.02 ? 1 : Math.max(0, 1 - (t1 - T6C.boom - 0.02) / 0.38)));      // (the surge: white at the cut, then it dies down on the pull-back)
  { const f2 = clamp01((t1 - (st.d - 0.4)) / 0.3); if (f2 > 0) c6White(f2); }      // (white again at the end: the next shot comes out of it)
  c6Black(1 - t1 / 0.2); msFinish(1);
}

// ---- 6. "???" lifts the gauntlet: from below, the fist rises out of the bottom of the picture (3 times its picture) with the stone burning in it; a column of blue light stands up from the stone to the top of the picture, rings run out along the ground, the ground cracks and stones rise; the whole picture shakes harder and harder and goes white
const T6L = { z: 3 };
function t6SLift(now, dt, T, st, t1) {
  const G = t6Gem(); if (!G) { c6Black(1); return; } t6Planet();      // (the planet of the next shot is made while this one plays)
  const e = ease3(clamp01((t1 - 0.2) / 1.7)), z = T6L.z, ox = Math.round(VW * 0.5 - 36 * z), oy = Math.round(lerp(150, 52, e) - 22 * z), sx = ox + G.cx * z, sy = oy + G.cy * z, on = 0.9 + 0.1 * Math.sin(T * 8), colA = ease3(clamp01((t1 - 0.5) / 1.6)), sh = c6Shk(T, 1.5 + 5 * ease3(clamp01(t1 / 3.0)));
  ctx.save(); ctx.translate(sh[0], sh[1]); t6Sky(T, { neb: 0.4, al: 0.6 }); const gtop = 124;
  // the column: a wide soft body, a bright one and a white core, from the stone up to the top of the picture; it flickers
  ctx.save(); ctx.globalCompositeOperation = 'lighter'; for (const [w, c, a] of [[90, '40,110,255', 0.2], [46, '80,170,255', 0.4], [20, '170,225,255', 0.7], [8, '255,255,255', 0.95]]) { const ww = w * colA * (0.85 + 0.15 * Math.sin(T * 11 + w)), gr = ctx.createLinearGradient(0, 0, 0, sy); gr.addColorStop(0, 'rgba(' + c + ',' + (a * colA).toFixed(3) + ')'); gr.addColorStop(1, 'rgba(' + c + ',' + (a * colA * 0.6).toFixed(3) + ')'); ctx.fillStyle = gr; ctx.fillRect(Math.round(sx - ww / 2), 0, Math.round(ww), Math.round(sy)); } ctx.restore();
  c6Glow(sx, sy, 200, '60,150,255', 0.6 * colA * on); c6Glow(sx, 40, 150, '80,170,255', 0.4 * colA);
  // the ground far below: its edge, lit blue from above; cracks run along it from the middle; rings run out
  for (let x = 0; x < VW; x += 2) { const y = t6Gy(x, gtop + 6) + (t6H(x >> 2, 51) < 0.3 ? 1 : 0); ctx.fillStyle = '#05040a'; ctx.fillRect(x, y, 2, VH - y); ctx.fillStyle = 'rgba(100,170,255,' + (colA * 0.8 * Math.max(0, 1 - Math.abs(x - sx) / 200)).toFixed(3) + ')'; ctx.fillRect(x, y, 2, 1); }
  { ctx.save(); ctx.globalCompositeOperation = 'lighter'; for (let i = 0; i < 3; i++) { const q = (T * 0.7 + i / 3) % 1; ctx.strokeStyle = 'rgba(120,190,255,' + (0.7 * (1 - q) * colA).toFixed(3) + ')'; ctx.lineWidth = 1 + 2 * (1 - q); ctx.beginPath(); ctx.ellipse(sx, gtop + 4, 20 + q * 220, 4 + q * 26, 0, 0, 6.2832); ctx.stroke(); } ctx.restore(); }
  for (let i = 0; i < 9; i++) { const d = colA * (14 + 130 * t6H(i, 101)), sgn = i & 1 ? 1 : -1, y = gtop + 5 + t6H(i, 102) * 3; ctx.fillStyle = 'rgba(150,215,255,' + (0.9 * colA).toFixed(3) + ')'; ctx.fillRect(Math.round(sx + sgn * d * 0.2), Math.round(y), Math.round(d * 0.8) * sgn || 1, 1); }      // (cracks: lines of light along the ground)
  for (let i = 0; i < 26; i++) { const q = ((t1 - 0.4) * (0.35 + 0.35 * t6H(i, 103)) + t6H(i, 104)) % 1, x = Math.round(sx + (t6H(i, 105) - 0.5) * 300), y = Math.round(gtop + 6 - Math.max(0, q) * (90 + 50 * t6H(i, 106))); if (t1 > 0.4) { ctx.fillStyle = '#05040a'; ctx.fillRect(x, y, 2 + (i & 3), 2 + (i & 1)); ctx.fillStyle = 'rgba(160,220,255,' + (0.7 * colA * (1 - q)).toFixed(3) + ')'; ctx.fillRect(x, y, 2 + (i & 3), 1); } }      // (stones rise off the ground)
  // the fist
  t6Gaunt(T, { stone: [G.cx, G.cy, 1.1 + 0.2 * colA, 22 + 10 * colA], purple: 0.9, flare: 0.3 * colA, gem: 1, o: [ox, oy, z] });
  c6Glow(sx, sy, 60, '220,245,255', 0.55 * on); t6Rays(Math.round(sx), Math.round(sy), Math.round(10 + 10 * colA), 0.9, 3);
  ctx.restore();
  c6White(clamp01((t1 - (st.d - 0.55)) / 0.5)); c6Black(1 - t1 / 0.25); msFinish(1);
}

// ---- 7. the planet: from space, the whole of it in the middle of the picture, a dark violet world lit from the upper left; the column of light stands on the top of it (where "???" is) and shoots up into the sky; cracks of light run from that point over the whole world, wider and brighter; it glows from inside, shakes, and bursts: a white flash, rings of light, the pieces fly out of the picture; the picture fades to black
const T6B = { crack: 0.9, boom: 3.6 };      // seconds into the shot: the cracks start to run, the planet bursts
function t6Noise(u, v) {      // smooth noise (0 - 1) from the well-mixed hash: random values on a grid, blended
  const i = Math.floor(u), j = Math.floor(v), fx = u - i, fy = v - j, sx = fx * fx * (3 - 2 * fx), sy = fy * fy * (3 - 2 * fy), n = (a, b) => t6H(a + b * 977, 13);
  return lerp(lerp(n(i, j), n(i + 1, j), sx), lerp(n(i, j + 1), n(i + 1, j + 1), sx), sy);
}
function t6Planet() {      // the planet (a sphere of rock 92 pixels across, lit from the upper left, with craters and ridges from noise, in 7 steps), cut into 22 shards (every pixel belongs to the nearest of 22 points), and the cracks (jagged lines of light from the top of the planet down over it, each with two branches); made once
  if (T6.pl) return T6.pl; const R = 46, W2 = 2 * R + 2, c = document.createElement('canvas'); c.width = c.height = W2; const g = c.getContext('2d'), im = g.createImageData(W2, W2), d = im.data, L = [-0.55, -0.6, 0.58], pal = [[14, 10, 26], [28, 20, 46], [48, 36, 74], [76, 58, 108], [110, 86, 142], [150, 122, 182], [196, 170, 222]];
  const fbm = (u, v) => { let s = 0, a = 0.5; for (let o = 0; o < 4; o++) { s += a * t6Noise(u, v); u = u * 2.1 + 3.7; v = v * 2.1 + 1.3; a *= 0.5; } return s; };
  const seeds = []; for (let i = 0; i < 22; i++) { const an = t6H(i, 111) * 6.2832, rr = R * Math.sqrt(t6H(i, 112)) * 0.95; seeds.push([R + 1 + Math.cos(an) * rr, R + 1 + Math.sin(an) * rr]); }
  const sid = new Int16Array(W2 * W2).fill(-1);
  for (let y = 0; y < W2; y++) for (let x = 0; x < W2; x++) {
    const nx = (x + 0.5 - W2 / 2) / R, ny = (y + 0.5 - W2 / 2) / R, r2 = nx * nx + ny * ny; if (r2 >= 1) continue; const i = (y * W2 + x) * 4, nz = Math.sqrt(1 - r2), u = nx * 3.2 + 7, v = ny * 3.2 + 3, h = fbm(u, v), hx = fbm(u + 0.07, v) - h, hy = fbm(u, v + 0.07) - h;
    let bx = nx - hx * 2.4, by = ny - hy * 2.4, bz = nz; const bl = Math.hypot(bx, by, bz); bx /= bl; by /= bl; bz /= bl;
    let t = Math.max(0, bx * L[0] + by * L[1] + bz * L[2]); t = Math.pow(t, 0.85) * (0.6 + 0.55 * h); if (t6Noise(u * 2.4 + 11, v * 2.4 + 5) > 0.7) t *= 0.7; t *= 0.55 + 0.45 * nz;
    const k = Math.max(0, Math.min(pal.length - 1, Math.floor(t * pal.length * 1.1))); d[i] = pal[k][0]; d[i + 1] = pal[k][1]; d[i + 2] = pal[k][2]; d[i + 3] = 255;
    let bi = 0, bd = 1e9; for (let s = 0; s < seeds.length; s++) { const dd = (x - seeds[s][0]) ** 2 + (y - seeds[s][1]) ** 2; if (dd < bd) { bd = dd; bi = s; } } sid[y * W2 + x] = bi;
  }
  g.putImageData(im, 0, 0); const shards = [];
  for (let s = 0; s < seeds.length; s++) {
    let x0 = 1e9, y0 = 1e9, x1 = -1, y1 = -1, n = 0, mx = 0, my = 0; for (let y = 0; y < W2; y++) for (let x = 0; x < W2; x++) if (sid[y * W2 + x] === s) { x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y); n++; mx += x; my += y; } if (!n) continue;
    const w = x1 - x0 + 1, h = y1 - y0 + 1, sc = document.createElement('canvas'); sc.width = w; sc.height = h; const sg = sc.getContext('2d'), si = sg.createImageData(w, h); for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) if (sid[y * W2 + x] === s) { const a = (y * W2 + x) * 4, b = ((y - y0) * w + x - x0) * 4; si.data[b] = d[a]; si.data[b + 1] = d[a + 1]; si.data[b + 2] = d[a + 2]; si.data[b + 3] = 255; } sg.putImageData(si, 0, 0);
    const wc = document.createElement('canvas'); wc.width = w; wc.height = h; const wg = wc.getContext('2d'); wg.drawImage(sc, 0, 0); wg.globalCompositeOperation = 'source-in'; wg.fillStyle = '#cfeaff'; wg.fillRect(0, 0, w, h);      // (the same shard all white-blue, for the heat)
    let dx = mx / n - (R + 1), dy = my / n - (R + 1), dl = Math.hypot(dx, dy); if (dl < 5) { const an = t6H(s, 114) * 6.2832; dx = Math.cos(an); dy = Math.sin(an); dl = 1; } shards.push({ c: sc, w: wc, x: x0, y: y0, dx: dx / dl, dy: dy / dl, v: 80 + 150 * t6H(s, 113) + 1.6 * Math.min(dl, 40), k: 0.8 + 0.7 * t6H(s, 115) });
  }
  const cr = []; for (let i = 0; i < 13; i++) { const an = 0.3 + 2.55 * (i + (t6H(i, 61) - 0.5) * 0.6) / 12, len = 70 + 40 * t6H(i, 62), pts = [[0, -R + 2]]; let x = 0, y = -R + 2, a = an; for (let s = 1; s <= 9; s++) { a += (t6H(i * 9 + s, 63) - 0.5) * 0.8; x += Math.cos(a) * len / 9; y += Math.sin(a) * len / 9; pts.push([x, y]); }
    const br = []; for (const sp of [3, 6]) { let bx = pts[sp][0], by = pts[sp][1], ba = a + (t6H(i * 9 + sp, 64) - 0.5) * 3; const bp = [[bx, by]]; for (let s = 1; s <= 4; s++) { ba += (t6H(i * 9 + sp + s, 65) - 0.5) * 0.9; bx += Math.cos(ba) * 7; by += Math.sin(ba) * 7; bp.push([bx, by]); } br.push(bp); } cr.push({ pts, br, d: 0.4 * t6H(i, 66) }); }
  return T6.pl = { cv: c, shards, cr, R };
}
function t6Cracks(cx, cy, p, w) {      // the cracks, p = how far they have run (0 - 1), w = how thick; each in three passes (a wide blue one, a bright one, a white core), only on the planet
  const P = t6Planet(); ctx.save(); ctx.beginPath(); ctx.arc(cx, cy, P.R - 0.5, 0, 6.2832); ctx.clip(); ctx.globalCompositeOperation = 'lighter'; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  const line = (pts, f) => { const L = pts.length - 1, n = Math.floor(f * L), fr = f * L - n; ctx.beginPath(); ctx.moveTo(cx + pts[0][0], cy + pts[0][1]); for (let i = 1; i <= n; i++) ctx.lineTo(cx + pts[i][0], cy + pts[i][1]); if (n < L) ctx.lineTo(cx + lerp(pts[n][0], pts[n + 1][0], fr), cy + lerp(pts[n][1], pts[n + 1][1], fr)); ctx.stroke(); };
  for (const [lw, col] of [[5 * w, 'rgba(40,110,255,0.35)'], [2.4 * w, 'rgba(110,190,255,0.85)'], [Math.max(1, 1 * w), 'rgba(255,255,255,1)']]) { ctx.lineWidth = lw; ctx.strokeStyle = col; for (const c of P.cr) { const q = clamp01((p - c.d) / (1 - c.d)); if (q <= 0.01) continue; line(c.pts, q); for (const b of c.br) { const qb = clamp01((q - 0.3) / 0.7); if (qb > 0.01) line(b, qb); } } }
  ctx.restore();
}
function t6SPlanet(now, dt, T, st, t1) {
  const P = t6Planet(), R = P.R, cx = Math.round(VW / 2), cy = Math.round(VH / 2) + 2, a = t1 - T6B.boom, p = clamp01((t1 - T6B.crack) / (T6B.boom - 0.3 - T6B.crack)), pe = ease3(p), ox = cx, oy = cy - R + 2;
  t6Sky(T, { neb: 0.6, al: 0.85 });
  if (a < 0) {      // ---- before: the planet, the column of light on its top, the cracks, the light inside
    const s = c6Shk(T, 4.5 * pe * pe), X = cx + s[0], Y = cy + s[1], bw = ease3(clamp01((t1 - 0.1) / 0.8));
    c6Glow(X, Y, 80, '120,90,220', 0.22);
    ctx.drawImage(P.cv, X - R - 1, Y - R - 1);
    ctx.save(); ctx.beginPath(); ctx.arc(X, Y, R - 0.5, 0, 6.2832); ctx.clip(); ctx.globalCompositeOperation = 'lighter'; const gi = ctx.createRadialGradient(X, Y - R * 0.6, 2, X, Y, R * 1.15); gi.addColorStop(0, 'rgba(160,215,255,' + (0.5 * pe * pe).toFixed(3) + ')'); gi.addColorStop(1, 'rgba(60,130,255,' + (0.32 * pe * pe).toFixed(3) + ')'); ctx.fillStyle = gi; ctx.fillRect(X - R, Y - R, 2 * R, 2 * R); ctx.restore();
    if (p > 0) t6Cracks(X, Y, pe, 0.55 + 0.7 * pe);
    ctx.save(); ctx.globalCompositeOperation = 'lighter'; for (const [w, c, al] of [[16, '60,140,255', 0.3], [7, '130,200,255', 0.6], [3, '255,255,255', 0.95]]) { const ww = Math.max(1, Math.round(w * bw * (0.9 + 0.1 * Math.sin(T * 12 + w)) * (1 + 1.4 * pe))); const gr = ctx.createLinearGradient(0, 0, 0, oy + s[1]); gr.addColorStop(0, 'rgba(' + c + ',' + (al * 0.5 * bw).toFixed(3) + ')'); gr.addColorStop(1, 'rgba(' + c + ',' + (al * bw).toFixed(3) + ')'); ctx.fillStyle = gr; ctx.fillRect(Math.round(ox + s[0] - ww / 2), 0, ww, oy + s[1]); } ctx.restore();      // (the column of light, from the top of the planet to the top of the picture)
    c6Glow(ox + s[0], oy + s[1], 30 + 60 * pe, '150,210,255', (0.5 + 0.4 * pe) * bw); t6Rays(ox + s[0], oy + s[1], Math.round(6 + 16 * pe), 0.8 * bw, 2);
    if (p > 0) c6Glow(X, Y, 100 + 60 * pe, '90,170,255', 0.35 * pe);
    c6White(a > -0.18 ? clamp01((a + 0.18) / 0.18) : 0);      // (white just before the burst: the picture is flooded)
  } else {      // ---- after: the flash, the rings, the pieces
    const q = a, tail = Math.exp(-q * 1.4);
    c6Glow(cx, cy, 200, '120,190,255', 0.9 * tail); c6Glow(cx, cy, 60, '255,255,255', 0.9 * Math.exp(-q * 3));
    for (const sh of P.shards) { for (let g = 3; g >= 0; g--) { const qq = Math.max(0, q - 0.05 * g), dd = sh.v * (1 - Math.exp(-sh.k * qq)) / sh.k, px = cx - R - 1 + sh.x + sh.dx * dd, py = cy - R - 1 + sh.y + sh.dy * dd; ctx.globalAlpha = g ? 0.16 / g : 1; ctx.drawImage(sh.c, Math.round(px), Math.round(py)); if (!g) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = Math.max(0, 1 - q * 0.9); ctx.drawImage(sh.w, Math.round(px), Math.round(py)); ctx.restore(); } } ctx.globalAlpha = 1; }
    ctx.save(); ctx.globalCompositeOperation = 'lighter'; for (let i = 0; i < 110; i++) { const an = t6H(i, 121) * 6.2832, v = 60 + 320 * t6H(i, 122), k = 1 + 0.9 * t6H(i, 123), dd = v * (1 - Math.exp(-k * q)) / k, al = Math.max(0, 1 - q / (1.4 + 2 * t6H(i, 124))); if (al <= 0) continue; ctx.globalAlpha = al; ctx.fillStyle = i % 3 ? '#9fd8ff' : '#ffffff'; const s2 = i % 7 === 0 ? 2 : 1; ctx.fillRect(Math.round(cx + Math.cos(an) * dd), Math.round(cy + Math.sin(an) * dd), s2, s2); } ctx.restore();      // (dust and sparks)
    v6Ring(cx, cy, 20 + 380 * (1 - Math.exp(-2.6 * q)), Math.max(0, 1 - q * 1.1), '170,220,255'); if (q > 0.12) v6Ring(cx, cy, 10 + 380 * (1 - Math.exp(-2.2 * (q - 0.12))), Math.max(0, 0.7 - (q - 0.12) * 1.0), '120,180,255');
    if (q < 0.5) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = 'rgba(210,235,255,' + (0.9 * (1 - q / 0.5)).toFixed(3) + ')'; ctx.fillRect(0, cy - 1, VW, 3); ctx.restore(); }      // (a thin streak of light across the picture)
    c6White(q < 0.1 ? 1 : Math.exp(-(q - 0.1) * 3.2));
  }
  c6Black(clamp01((t1 - (st.d - 1.0)) / 0.9)); c6White(t1 < 0.3 ? 1 - t1 / 0.3 : 0); msFinish(1);
}

// ---- the sounds and shakes of part 1 and 2: every one fires once, at its own time (ev = the scene's own scheduler: see c3EndFrame)
function t6Events(ev, now) {
  const Tv = c4T('vchg'), Tm = c4T('vmaho'), Tp = c4T('tport'), Ts = c4T('tspace'), Tk = c4T('ttake'), Th = c4T('tthumb'), Tw = c4T('tpower'), Tl = c4T('tlift'), Tq = c4T('tplanet');
  ev('v_run', Tv, () => snd('vrush'), 1); ev('v_leap', Tv + V6.run, () => snd('vleap'), 0.6);
  ev('v_cloth', Tm + 0.3, () => snd('vcloth'), 1); ev('v_lock', Tm + 1.55, () => { snd('vlock'); c2Shake(now, 450, 5); }, 0.8); ev('v_awake', Tm + 1.85, () => snd('vawake'), 1); ev('v_cut', Tm + 2.55, () => { snd('dsmash'); c2Shake(now, 300, 3); }, 0.5); ev('v_hit', Tm + 4.35, () => { snd('vthud'); c2Shake(now, 600, 7); }, 0.4);
  ev('t_open', Tp + T6P.open, () => snd('t6open'), 1); ev('t_circ', Tp + 1.05, () => snd('t6circle'), 0.8); ev('t_zip', Tp + T6P.go, () => { snd('t6zip'); snd('blink'); c2Shake(now, 350, 4); }, 0.6);
  ev('s_hum', Ts, () => snd('t6hum'), 1); ev('s_circ', Ts + 1.1, () => snd('t6circle'), 0.8); ev('s_arr', Ts + 1.9, () => snd('t6arrive'), 0.8);
  ev('k_grasp', Tk + 1.65, () => snd('t6grasp'), 0.6);
  ev('h_slot', Th + 1.95, () => { snd('t6slot'); c2Shake(now, 350, 4); }, 0.6);
  ev('w_swell', Tw, () => snd('t6power', 0), 1); ev('w_surge', Tw + T6C.boom - 0.05, () => { snd('t6power', 1); c2Shake(now, 600, 8); }, 0.6);
  ev('l_lift', Tl + 0.2, () => snd('t6lift'), 1);
  ev('p_beam', Tq + 0.2, () => snd('t6circle'), 0.8); for (let i = 0; i < 5; i++) ev('p_crack' + i, Tq + 1.1 + 0.55 * i, () => snd('t6crack', i), 0.5); ev('p_rumble', Tq + 1.4, () => snd('t6rumble'), 1); ev('p_boom', Tq + T6B.boom, () => { snd('t6boom'); c2Shake(now, 900, 10); }, 0.8);
}
// ---- end of the eyes
