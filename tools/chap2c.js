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

// ---- 13. the claw holds the eye in front of the camera and shuts: the white of it bursts and runs down the blades, and what is left between their points is the blue part, three pixels of it, glowing: it lights the claw, the dark, the whole picture
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
  c6Off(); if (t1 >= 1.5 && t1 < 1.58) c6White(0.8 * (1 - (t1 - 1.5) / 0.08)); msFinish(1); c6Black(clamp01((t1 - (st.d - 1.1)) / 1.1));
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
  d6Events(ev, now);
}
// ---------------------------------------------------------------- v1.104 THE SUMMONING: after "WASTED POTENTIAL" (the shot line of C4_SEQ) a voice says DID SOMEONE SAY... POTENTIAL?, a cold light comes in, Megumi (the 64 x 64 picture tools/megumi_64.png, 15 colours) stands in it and calls MAHORAGA
// Six shots (dsay, dpot, dwith, dsword, ddiv, dmaho), each a pure function of the scene time like all the others, so a tap that skips and a test that jumps always draw the right picture. The light does the work: every shot has a key light on the picture (d6Lit: the colour of the light on the edge that faces it, the far side dimmed), a glow behind it (c6Glow), light shafts, mist and motes (d6Bg), and the dark edges, grain and bars of msFinish. The close-ups are whole-number enlargements of the picture (2, 4, 8 and 12 times), so one pixel of it stays a block of whole screen pixels and nothing shimmers; the camera drifts instead of scaling.
const D6_IMG = (() => { const i = new Image(); i.src = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAFd0lEQVR4nOVbXWgjVRT+EqSEnSZDs7SdxpZ2my1iWZEiQQrCgi/LwrLIvq+++VD3TVBEVl+UfRVcfVZBxZf6gwjFBxfFVihSZSVLWfsTMs5Ou2TCTDJlyEPrQ/bezkwmaTJzz60/HwQmM3dmzvnuud8999wE+J8jRf2C3HDhCACcppEKn2OIuuY/RwkpLwk7fIgDflyYnodZ2Q20l+U8IIkA4JgEbXom8jojQabzAJCmfkFuuHAUjoCT2lPaEwYpAXGdkUmCNA04xAEK0/M92xmVMtI489/WgGw+DwB47fpFAMAHX20AOHYekKsDj1G/IBzOzPGn5mYAAK+80D6+eqMceQ81GVKnwWw+D9vS4dz/DvrmDiafOAcA0Dd3sPjiLSjZHCbGRrGxvs7vpSZAWgQslEoAgD8fnWfOA8CX36/y47rb4lNlOD+gAPkssFAqYaFUQt1toe62oGRzeP/2p7wNO1ayOQCA59oAgIyiUprGQZ4HAO1e9VybO7e8qvNrH33xOZZXdUyMjSKjqPwjC1IIANo96jYcAMAPn73Oz//607cA2iSdBsgIYOEf7n2gLXp+vP3Scx33b5fXqEwLgDQCtPE8PNcOhDWLAr8OAMCTsxonynNtaQkR6Qv8UcBQM6uwLR3f3H6Tn3v1nVvYbxWgZHNwGw4aliUtGSKfBv347eub/Hjq2Zd9VwoAjqNDJkiHgNM0UiypeW/p+cC1tU/eiLznfLFIaVIHpMwCUYLmT4QYWC4gE+QEOE0jlcYZXL3xLu6s/Hxi+431damLIWl5AABcf+tj6Js70Dd3QhpwepC2GGLL4JNwvliUGgVSSmL+ImgvnNWmiK3phJQhoOYnAXQXOSWb484/2H8owyQOKatB5mBGUSN72b/4mRgbpTSpA1ISofDqzk8CS31ZG228P60QBTIC+h37Mpe+USAbAmz+HxT3tk1cvnJJWmmcdDl8+colvhCqmdW+7quZVZh7FpVZHSCZa5n4Pdh/iImx0chiB6sPGJVyYJZgQ2K3/LuUXIAsArTxPDKK2uG859qomVVeI1DzkzirTfFZgkHWMCAjICqMt8tryChqIB/olvzc2zapTAtAOAHhse/H7PxiQAv8ZbIoLJRK5FEgdTHEYFTKgbm/G2QUSoWKDOv9buHLymFsejzEAWbnF3s+03NtmJVdMkGUFgF+552mkWJ5wknVX+pESRgBvXrfc+2A8+y8n4RuecKIMiTKxEhIiYBe+/6MBNvSI0Wx7rZIxZCcgJpZPbHGz0hg4igTQgjoFv6ea/dd4+9FAmUUCIuAcOLjuTaMSrlL62gwEqL2B6imRGEEhA2M+3sfp2mkGpYVKYoU6XFiAti6P2zwM6WLiZ5rW3rHM809SzgJZCKYpLLrryXUzConou62hJMgrCLEFjWiVPwRebycXjOrULI51KGiLnChJCQCwumsqNSV6QGD23B4NMzMPy0kChIRwAofflDs8NqWHvjeb3WpHwjVAIokxp8pht91iIPEUSBcBMOGikBUgdVtOFDzk4kTJOEEUP60JYrcpDtJsQmI+vkLJbqV2ZMKbqIICO/iyNjWEj3EEhHgz/9HlCHybe1wFIggI5GxbN8/qthBCf+225yWxpaZif3u2JlgbrhwVNQ8AAbGtDS25FSxOeY0Mfodi4DccOFo6ZoKoF2v+3DZlv5nJ4bHR4cAeNgyC0dxbEhM4x/360kfMTCcppHaMjP8e5uEeBiYgOPe/+fgwtxI7HsTR8CFuREUNU/6392AYM8vXVNj2TAQAVG9v7K6l0iFRSIOCX0T0C30T9P5O3c9/PWwxXVoZXVv4Gf0bTir/J4b+gVAW/x+vJs+1Z6P6u1B7Rmoca9/ff9b8TfDwNiReU6YBwAAAABJRU5ErkJggg=='; return i; })();
const D6 = { cv: null, lit: new Map(), H: [30.5, 9], F: [29, 19], face: [30.6, 11.8] };      // the picture as a canvas, the lit copies, and where his head, his fists and his face are in it (picture pixels)
function d6Base() { if (D6.cv) return D6.cv; if (!D6_IMG.complete || !D6_IMG.naturalWidth) return null; const c = document.createElement('canvas'); c.width = c.height = 64; c.getContext('2d').drawImage(D6_IMG, 0, 0); D6.cv = c; return c; }
function d6Lit(lights, k) {      // the picture lit from the sides: lights = [[lx, ly, 'r,g,b'], ...] (lx, ly: the way to the light, each -1, 0 or 1; the first is the key light). A pixel that faces a light with nothing in front of it takes that light's colour (the rim); the others are brighter on the key side and dimmed by k (0 - 1) on the far side
  const key = JSON.stringify(lights) + k, hit = D6.lit.get(key); if (hit) return hit; const b = d6Base(); if (!b) return null;
  const p = b.getContext('2d').getImageData(0, 0, 64, 64).data, c = document.createElement('canvas'); c.width = c.height = 64; const g = c.getContext('2d'), o = g.createImageData(64, 64), q = o.data, K = lights[0], rc = lights.map(l => l[2].split(',').map(Number));
  const A = (x, y) => x < 0 || y < 0 || x > 63 || y > 63 ? 0 : p[(y * 64 + x) * 4 + 3];
  for (let y = 0; y < 64; y++) for (let x = 0; x < 64; x++) {
    const i = (y * 64 + x) * 4; if (!p[i + 3]) continue; let rim = -1; for (let n = 0; n < lights.length; n++) if (!A(x + lights[n][0], y + lights[n][1])) { rim = n; break; }
    const s = ((x - 32) * K[0] + (y - 32) * K[1]) / 20, lit = Math.max(0, Math.min(1, 0.5 + 0.5 * s)), m = 1 - k + k * (0.45 + lit);
    for (let j = 0; j < 3; j++) q[i + j] = Math.max(0, Math.min(255, rim >= 0 ? p[i + j] * 0.2 + rc[rim][j] * 0.9 : p[i + j] * m + rc[0][j] * 0.12 * lit));
    q[i + 3] = 255;
  }
  g.putImageData(o, 0, 0); if (D6.lit.size > 20) D6.lit.clear(); D6.lit.set(key, c); return c;
}
function d6Put(img, x, y, z) { if (img) ctx.drawImage(img, 0, 0, 64, 64, Math.round(x), Math.round(y), 64 * z, 64 * z); }      // the picture enlarged z times (a whole number), its corner at (x, y)
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
// ---- end of the eyes
