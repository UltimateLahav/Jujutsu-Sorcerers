// ---------------------------------------------------------------- v1.64 CUSTOM: draw your own character (this file is spliced into template.html by build_html.py, in place of the marker line after the continuation's)
// CUSTOM is a card on the mode screen. It shows 3 slots; a slot asks for a NAME and then for a DRAWING: a 64 x 64 pixel picture like the people of the game, made with a pencil, an eraser, a bucket, a picker and a line, with mirror drawing, a grid, undo / redo and a 16-bit style palette of 66 colours. The drawings are kept on the device (localStorage 'js_custom'): for each slot the name, the colours that are used and one character for each of the 4096 pixels (0 = see-through). v1.65: a character has up to 15 IDLE frames (one 4096-character string for each, sharing one list of colours) and is a playable fighter in FREE PLAY that stands on its idle pictures and cannot move yet.
const CU_KEY = 'js_custom';
const CU_PAL = (() => {      // 66 colours: 8 darks to whites, 13 hues in 4 shades (dark to light), 6 skin tones and browns
  const hx = (h, s, l) => { s /= 100; l /= 100; const a = s * Math.min(l, 1 - l), f = n => { const k = (n + h / 30) % 12; return l - a * Math.max(-1, Math.min(k - 3, 9 - k, 1)); }; return '#' + [f(0), f(8), f(4)].map(v => Math.round(v * 255).toString(16).padStart(2, '0')).join(''); };
  const o = ['#000000', '#1a1426', '#3a3350', '#6a6488', '#9a96b4', '#cfcde0', '#f4f2f8', '#ffffff'];
  for (const h of [0, 18, 38, 52, 78, 125, 160, 185, 210, 238, 268, 300, 330]) for (const [s, l] of [[70, 26], [72, 40], [74, 56], [80, 74]]) o.push(hx(h, s, l));
  return o.concat(['#fbe3d0', '#f1cfb8', '#e2a98a', '#c27c5a', '#8a4d34', '#5a3220']);
})();
const CU_RGB = CU_PAL.map(c => [parseInt(c.slice(1, 3), 16), parseInt(c.slice(3, 5), 16), parseInt(c.slice(5, 7), 16)]);

// ---- what is kept on the device
function cuLoad() { try { const a = JSON.parse(localStorage.getItem(CU_KEY)); if (Array.isArray(a) && a.length === 3) return a; } catch (e) { } return [null, null, null]; }
function cuStore(a) { try { localStorage.setItem(CU_KEY, JSON.stringify(a)); } catch (e) { } }
function cuEncode(frames, name) {      // the name, the colours that are used by any frame and, for each frame, one character per pixel (48 + the number of its colour in that list; '0' = see-through); .a is the first frame (what older versions read)
  const used = [], idx = new Map(), fr = frames.map(art => { let s = ''; for (let i = 0; i < 4096; i++) { const v = art[i]; if (!v) { s += '0'; continue; } let k = idx.get(v); if (!k) { used.push(CU_PAL[v - 1]); k = used.length; idx.set(v, k); } s += String.fromCharCode(48 + k); } return s; });
  return { n: name, p: used, a: fr[0], f: fr };
}
function cuDecodeOne(d, str) {      // the 4096 colour numbers (0 = see-through, otherwise 1 + the place in CU_PAL) of one frame; anything damaged is simply left empty
  const art = new Uint8Array(4096); if (typeof str !== 'string' || !d || !Array.isArray(d.p)) return art;
  for (let i = 0; i < 4096 && i < str.length; i++) { const k = str.charCodeAt(i) - 48; if (k > 0 && d.p[k - 1]) { const v = CU_PAL.indexOf(d.p[k - 1]); art[i] = v >= 0 ? v + 1 : 0; } }
  return art;
}
function cuFrames(d) { const l = d && Array.isArray(d.f) && d.f.length ? d.f.slice(0, 15) : [d && d.a]; return l.map(str => cuDecodeOne(d, str)); }      // all the frames of a kept drawing (1 - 15; a drawing kept by v1.64 has one)
function cuImg(art, cv) {      // a frame on a 64 x 64 canvas (see-through pixels stay see-through)
  const g = cv.getContext('2d'), im = g.createImageData(64, 64); for (let i = 0; i < 4096; i++) { const v = art[i]; if (v) { const c = CU_RGB[v - 1]; im.data[i * 4] = c[0]; im.data[i * 4 + 1] = c[1]; im.data[i * 4 + 2] = c[2]; im.data[i * 4 + 3] = 255; } } g.putImageData(im, 0, 0);
}
function cuThumb(cv, d) { cv.getContext('2d').clearRect(0, 0, 64, 64); if (d) cuImg(cuFrames(d)[0], cv); }      // a kept drawing's first frame (a slot card)

// ---- the editor
let cuSlot = -1, cuNameV = '', cuFr = [new Uint8Array(4096)], cuCur = 0, cuArt = cuFr[0], cuTool = 'pen', cuColor = 1, cuMirror = false, cuGrid = true, cuUndo = [], cuRedo = [], cuDirty = false, cuCell = 4, cuSt = null, cuArmed = '', cuArmT = 0;
let cuZoom = 1, cuPX = 0, cuPY = 0, cuOffset = true, cuOnion = false, cuBig = false, cuSel = null, cuCopy = false, cuCursor = null, cuTpl = 0, cuPtrs = new Map(), cuPinch = null, cuIgnore = false;
const cuOff = document.createElement('canvas'); cuOff.width = cuOff.height = 64; const cuOn = document.createElement('canvas'); cuOn.width = cuOn.height = 64;
const CU_TOOLS = [['pen', 'PEN'], ['era', 'ERASE'], ['fill', 'FILL'], ['pick', 'PICK'], ['line', 'LINE'], ['rect', 'BOX'], ['frect', 'FILL BOX'], ['circ', 'OVAL'], ['fcirc', 'FILL OVAL'], ['sel', 'SELECT']];
const CU_ACTS = [['mirror', 'MIRROR'], ['grid', 'GRID'], ['onion', 'ONION'], ['big', '32 MODE'], ['offset', 'OFFSET'], ['undo', 'UNDO'], ['redo', 'REDO'], ['clear', 'CLEAR'], ['zin', 'ZOOM +'], ['zout', 'ZOOM -'], ['fit', 'FIT'], ['flipx', 'FLIP H'], ['flipy', 'FLIP V'], ['copy', 'COPY'], ['outline', 'OUTLINE'], ['shade', 'SHADE'], ['import', 'IMPORT'], ['templ', 'TEMPLATE'], ['delfr', 'DEL FRAME']];
function cuSure(key, btn, label) {      // a button that needs a second tap within 2.5 s ("SURE?") before it does something that throws work away; true on the second tap
  if (cuArmed === key && performance.now() - cuArmT < 2500) { cuArmed = ''; return true; }
  cuArmed = key; cuArmT = performance.now(); if (btn) { const t0 = btn.dataset.t || btn.textContent; btn.dataset.t = t0; btn.textContent = label; setTimeout(() => { if (btn.dataset.t) { btn.textContent = btn.dataset.t; delete btn.dataset.t; } }, 2500); } return false;
}
function cuFlash(btn, text) { const t0 = btn.dataset.t || btn.textContent; btn.dataset.t = t0; btn.textContent = text; setTimeout(() => { if (btn.dataset.t) { btn.textContent = btn.dataset.t; delete btn.dataset.t; } }, 1400); }
function cuLayout() { const c = $('cdCv'), k = Math.max(3, Math.min(Math.floor(innerHeight * 0.82 / 64), Math.floor(innerWidth * 0.46 / 64))); cuCell = k; c.width = c.height = 64 * k; c.style.width = c.style.height = 64 * k + 'px'; }
function cuSetZoom(z, cx, cy) {      // zoom 1, 2, 4 or 8 times, keeping the art point (cx, cy) in the middle of the view; the view never leaves the board
  z = Math.max(1, Math.min(8, z)); cuZoom = z; const w = 64 / z; cuPX = Math.max(0, Math.min(64 - w, Math.round(cx - w / 2))); cuPY = Math.max(0, Math.min(64 - w, Math.round(cy - w / 2)));
}
const cuSnap = z => z < 1.5 ? 1 : z < 3 ? 2 : z < 6 ? 4 : 8;
function cuPaint(art) {      // the board (the part of it that is in view): checkerboard, the frame before it (ONION), the picture, the grid, the mirror line, the selection and the crosshair
  const real = !art; art = art || cuArt; const c = $('cdCv'), g = c.getContext('2d'), V = 64 * cuCell, k = cuCell * cuZoom, w = 64 / cuZoom; cuImg(art, cuOff); g.imageSmoothingEnabled = false; g.clearRect(0, 0, V, V);
  for (let y = 0; y < w; y++) for (let x = 0; x < w; x++) { g.fillStyle = ((x + cuPX + y + cuPY) & 1) ? '#1f1834' : '#171127'; g.fillRect(x * k, y * k, k, k); }
  if (cuOnion && cuFr.length > 1) { cuImg(cuFr[(cuCur + cuFr.length - 1) % cuFr.length], cuOn); g.globalAlpha = 0.3; g.drawImage(cuOn, cuPX, cuPY, w, w, 0, 0, V, V); g.globalAlpha = 1; }
  g.drawImage(cuOff, cuPX, cuPY, w, w, 0, 0, V, V);
  if (cuGrid) for (let i = 0; i <= w; i++) { g.fillStyle = (cuPX + i) % 8 === 0 ? 'rgba(255,255,255,0.28)' : 'rgba(255,255,255,0.10)'; g.fillRect(Math.min(i * k, V - 1), 0, 1, V); g.fillStyle = (cuPY + i) % 8 === 0 ? 'rgba(255,255,255,0.28)' : 'rgba(255,255,255,0.10)'; g.fillRect(0, Math.min(i * k, V - 1), V, 1); }
  if (cuMirror) { g.fillStyle = 'rgba(255,211,77,0.75)'; g.fillRect((32 - cuPX) * k - 1, 0, 2, V); }
  if (cuSel) { g.strokeStyle = '#ffd34d'; g.setLineDash([4, 3]); g.lineWidth = 2; g.strokeRect((cuSel.x0 - cuPX) * k, (cuSel.y0 - cuPY) * k, (cuSel.x1 - cuSel.x0 + 1) * k, (cuSel.y1 - cuSel.y0 + 1) * k); g.setLineDash([]); }
  if (cuCursor) { const cx = (cuCursor[0] - cuPX + 0.5) * k, cy = (cuCursor[1] - cuPY + 0.5) * k; g.fillStyle = '#ffd34d'; g.fillRect(cx - 9, cy - 1, 6, 2); g.fillRect(cx + 4, cy - 1, 6, 2); g.fillRect(cx - 1, cy - 9, 2, 6); g.fillRect(cx - 1, cy + 4, 2, 6); }
  const fb = $('cdFr').children[cuCur]; if (real && fb) cuImg(cuArt, fb.querySelector('canvas'));
}
function cuSync() {      // which tool, toggle and colour is selected
  const on = { mirror: cuMirror, grid: cuGrid, onion: cuOnion, big: cuBig, offset: cuOffset, copy: cuCopy };
  for (const b of $('cdTools').children) { const t = b.dataset.tool, a = b.dataset.act; b.classList.toggle('sel', t ? t === cuTool : !!on[a]); if (a === 'undo') b.disabled = !cuUndo.length; if (a === 'redo') b.disabled = !cuRedo.length; }
  for (const b of $('cdPal').children) b.classList.toggle('sel', +b.dataset.i === cuColor);
}
function cuSetColor(i) { cuColor = i; if (cuTool === 'era' || cuTool === 'pick') cuTool = 'pen'; cuSync(); }
const cuRect = () => cuSel || { x0: 0, y0: 0, x1: 63, y1: 63 };      // the selection, or the whole frame when nothing is selected
function cuFlip(h) { cuPush(); const r = cuRect(), w = r.x1 - r.x0 + 1, hh = r.y1 - r.y0 + 1, src = cuArt.slice(); for (let y = 0; y < hh; y++) for (let x = 0; x < w; x++) cuArt[(r.y0 + y) * 64 + r.x0 + x] = src[(r.y0 + (h ? y : hh - 1 - y)) * 64 + r.x0 + (h ? w - 1 - x : x)]; }
function cuOutline() { cuPush(); const a = cuArt, o = a.slice(); for (let y = 0; y < 64; y++) for (let x = 0; x < 64; x++) if (!o[y * 64 + x]) { if ((x > 0 && o[y * 64 + x - 1]) || (x < 63 && o[y * 64 + x + 1]) || (y > 0 && o[(y - 1) * 64 + x]) || (y < 63 && o[(y + 1) * 64 + x])) a[y * 64 + x] = 2; } }      // a dark outline (the game's outline colour) round the picture
function cuShade() {      // light on the top and left edges, shade on the bottom and right edges: a colour from the hue rows of the palette moves one step lighter or darker
  cuPush(); const a = cuArt, o = a.slice(), at = (x, y) => x < 0 || y < 0 || x > 63 || y > 63 ? 0 : o[y * 64 + x];
  for (let y = 0; y < 64; y++) for (let x = 0; x < 64; x++) { const v = o[y * 64 + x]; if (v < 9 || v > 60) continue; const s = (v - 9) % 4; if ((!at(x + 1, y) || !at(x, y + 1)) && s > 0) a[y * 64 + x] = v - 1; else if ((!at(x - 1, y) || !at(x, y - 1)) && s < 3) a[y * 64 + x] = v + 1; }
}
function cuNearest(r, g, b) { let best = 0, bd = 1e9; for (let i = 0; i < CU_RGB.length; i++) { const c = CU_RGB[i], d = (c[0] - r) ** 2 + (c[1] - g) ** 2 + (c[2] - b) ** 2; if (d < bd) { bd = d; best = i; } } return best + 1; }
function cuLoadCanvas(cv, dx) {      // a picture (any canvas) turned into the 66 colours: see-through stays see-through
  const t = document.createElement('canvas'); t.width = t.height = 64; const g = t.getContext('2d'); g.imageSmoothingEnabled = true; g.drawImage(cv, dx || 0, 0); const d = g.getImageData(0, 0, 64, 64).data; cuPush(); for (let i = 0; i < 4096; i++) cuArt[i] = d[i * 4 + 3] < 128 ? 0 : cuNearest(d[i * 4], d[i * 4 + 1], d[i * 4 + 2]);
}
function cuBody() { cuPush(); cuArt.fill(0); const sk = CU_PAL.indexOf('#f1cfb8') + 1, sh = CU_PAL.indexOf('#3a3350') + 1, tp = 8 + 4 * 8 + 2 + 1, bx = (x0, y0, x1, y1, v) => { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) cuArt[y * 64 + x] = v; }; bx(28, 8, 37, 17, sk); bx(26, 18, 39, 36, tp); bx(22, 19, 25, 34, tp); bx(40, 19, 43, 34, tp); bx(22, 35, 25, 37, sk); bx(40, 35, 43, 37, sk); bx(27, 37, 32, 58, sh); bx(33, 37, 38, 58, sh); bx(26, 59, 32, 61, 2); bx(33, 59, 39, 61, 2); cuOutline(); cuUndo.pop(); }
function cuTemplate(b) {      // each tap loads the next starting picture into this frame: a plain body, then the fighters (draw over it and recolour)
  const names = ['BODY', 'GOJO', 'YUJI', 'VERITY', 'CAT', 'FREDDY'], n = names[cuTpl % 6];
  if (cuArt.some(v => v) && !cuSure('tpl', b, 'SURE?')) return;
  if (n === 'BODY') cuBody(); else { const src = n === 'GOJO' ? idleF[0] : n === 'YUJI' ? YUF.norm.idle[0] : n === 'VERITY' ? vfr('idle', 0, true, false) : n === 'CAT' ? cfr('idle', 0, true, false) : fredF(0); cuLoadCanvas(src, (64 - src.width) >> 1); }
  cuTpl++; b.dataset.t = 'TEMPLATE: ' + names[cuTpl % 6]; b.textContent = b.dataset.t; delete b.dataset.t; b.textContent = 'TEMPLATE'; cuFlash(b, 'LOADED ' + n);
}
function cuImport() {      // a picture from the phone: shrunk to fit the board (keeping its shape), centred, matched to the 66 colours
  let f = $('cdFile'); if (!f) { f = document.createElement('input'); f.type = 'file'; f.accept = 'image/*'; f.id = 'cdFile'; f.style.display = 'none'; document.body.appendChild(f); f.addEventListener('change', () => { const file = f.files && f.files[0]; if (!file) return; const im = new Image(); im.onload = () => { const sc = Math.min(64 / im.width, 64 / im.height), w = Math.max(1, Math.round(im.width * sc)), h = Math.max(1, Math.round(im.height * sc)), c = document.createElement('canvas'); c.width = c.height = 64; c.getContext('2d').drawImage(im, (64 - w) >> 1, (64 - h) >> 1, w, h); cuLoadCanvas(c, 0); URL.revokeObjectURL(im.src); cuSync(); cuPaint(); cuFrSync(); }; im.src = URL.createObjectURL(file); f.value = ''; }); }
  f.click();
}
function cuAct(id, b) {
  if (id === 'mirror') cuMirror = !cuMirror; else if (id === 'grid') cuGrid = !cuGrid; else if (id === 'onion') cuOnion = !cuOnion; else if (id === 'big') cuBig = !cuBig; else if (id === 'offset') cuOffset = !cuOffset; else if (id === 'copy') cuCopy = !cuCopy;
  else if (id === 'undo') { if (cuUndo.length) { cuRedo.push(cuArt.slice()); cuArt = cuUndo.pop(); cuFr[cuCur] = cuArt; } }
  else if (id === 'redo') { if (cuRedo.length) { cuUndo.push(cuArt.slice()); cuArt = cuRedo.pop(); cuFr[cuCur] = cuArt; } }
  else if (id === 'delfr') { cuDelFrame(b); return; }
  else if (id === 'clear') { if (!cuSure('clear', b, 'SURE?')) return; cuPush(); cuArt.fill(0); }
  else if (id === 'zin') cuSetZoom(cuZoom * 2, cuPX + 32 / cuZoom, cuPY + 32 / cuZoom); else if (id === 'zout') cuSetZoom(cuZoom / 2, cuPX + 32 / cuZoom, cuPY + 32 / cuZoom); else if (id === 'fit') cuSetZoom(1, 32, 32);
  else if (id === 'flipx') cuFlip(true); else if (id === 'flipy') cuFlip(false); else if (id === 'outline') cuOutline(); else if (id === 'shade') cuShade();
  else if (id === 'import') { cuImport(); return; } else if (id === 'templ') { cuTemplate(b); }
  cuSync(); cuPaint(); cuFrSync();
}
function cuFrSync() {      // the grid of frames: a small picture for each frame (the chosen one is framed in gold), a "+" for the next new one
  const box = $('cdFr'), n = cuFr.length;
  for (let i = 0; i < 15; i++) { const b = box.children[i], cv = b.querySelector('canvas'); if (i < n) { b.style.display = ''; b.classList.toggle('sel', i === cuCur); b.classList.remove('add'); cv.style.display = ''; b.querySelector('span').textContent = ''; cuImg(cuFr[i], cv); } else if (i === n && n < 15) { b.style.display = ''; b.classList.remove('sel'); b.classList.add('add'); cv.style.display = 'none'; b.querySelector('span').textContent = '+'; } else b.style.display = 'none'; }
  $('cdFrInfo').textContent = 'FRAME ' + (cuCur + 1) + ' OF ' + n; const del = $('cdTools').querySelector('[data-act="delfr"]'); if (del) del.disabled = n < 2;
}
function cuSelect(i) { cuCur = i; cuArt = cuFr[i]; cuUndo = []; cuRedo = []; cuSt = null; cuSel = null; cuSync(); cuPaint(); cuFrSync(); }
function cuAddFrame() { if (cuFr.length >= 15) return; cuFr.splice(cuCur + 1, 0, cuArt.slice()); cuDirty = true; cuSelect(cuCur + 1); }
function cuDelFrame(b) { if (cuFr.length < 2 || !cuSure('delfr', b, 'SURE?')) return; cuFr.splice(cuCur, 1); cuDirty = true; cuSelect(Math.min(cuCur, cuFr.length - 1)); }
const cuPut = (art, x, y, v) => { if (cuBig) { x &= ~1; y &= ~1; for (let j = 0; j < 2; j++) for (let i = 0; i < 2; i++) cuPut1(art, x + i, y + j, v); } else cuPut1(art, x, y, v); };
const cuPut1 = (art, x, y, v) => { if (x < 0 || y < 0 || x > 63 || y > 63) return; art[y * 64 + x] = v; if (cuMirror) art[y * 64 + 63 - x] = v; };
function cuLine(art, x0, y0, x1, y1, v) {
  const dx = Math.abs(x1 - x0), dy = -Math.abs(y1 - y0), sx = x0 < x1 ? 1 : -1, sy = y0 < y1 ? 1 : -1; let e = dx + dy, n = 0;
  for (; ;) { cuPut(art, x0, y0, v); if ((x0 === x1 && y0 === y1) || ++n > 400) break; const e2 = 2 * e; if (e2 >= dy) { e += dy; x0 += sx; } if (e2 <= dx) { e += dx; y0 += sy; } }
}
function cuShape(art, t, x0, y0, x1, y1, v) {      // a box or an oval between two corners, empty or filled
  const a = Math.min(x0, x1), b = Math.min(y0, y1), c = Math.max(x0, x1), d = Math.max(y0, y1), fill = t === 'frect' || t === 'fcirc';
  if (t === 'rect' || t === 'frect') { for (let y = b; y <= d; y++) for (let x = a; x <= c; x++) if (fill || x === a || x === c || y === b || y === d) cuPut(art, x, y, v); return; }
  const cx = (a + c) / 2, cy = (b + d) / 2, rx = (c - a) / 2 + 0.5, ry = (d - b) / 2 + 0.5;
  for (let y = b; y <= d; y++) for (let x = a; x <= c; x++) { const q = ((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2; if (fill ? q <= 1 : q <= 1 && (((x - cx + 1) / rx) ** 2 + ((y - cy) / ry) ** 2 > 1 || ((x - cx - 1) / rx) ** 2 + ((y - cy) / ry) ** 2 > 1 || ((x - cx) / rx) ** 2 + ((y - cy + 1) / ry) ** 2 > 1 || ((x - cx) / rx) ** 2 + ((y - cy - 1) / ry) ** 2 > 1)) cuPut(art, x, y, v); }
}
function cuFill(art, x, y, v) {
  const t = art[y * 64 + x]; if (t === v) return; const st = [[x, y]];
  while (st.length) { const [px, py] = st.pop(); if (px < 0 || py < 0 || px > 63 || py > 63 || art[py * 64 + px] !== t) continue; art[py * 64 + px] = v; st.push([px + 1, py], [px - 1, py], [px, py + 1], [px, py - 1]); }
}
const cuXY = e => { const c = $('cdCv'), r = c.getBoundingClientRect(), k = cuCell * cuZoom, oy = cuOffset && e.pointerType === 'touch' ? 26 : 0; return [Math.floor(cuPX + (e.clientX - r.left - c.clientLeft) / k), Math.floor(cuPY + (e.clientY - oy - r.top - c.clientTop) / k)]; };      // (a finger draws 26 screen pixels ABOVE where it touches, so it does not hide the pixel; the crosshair shows where)
function cuPush() { cuUndo.push(cuArt.slice()); if (cuUndo.length > 60) cuUndo.shift(); cuRedo.length = 0; cuDirty = true; }
const cuIn = (x, y) => x >= 0 && y >= 0 && x <= 63 && y <= 63, cuClamp = v => Math.max(0, Math.min(63, v));
function cuDown(e) {
  e.preventDefault(); cuPtrs.set(e.pointerId, [e.clientX, e.clientY]); try { $('cdCv').setPointerCapture(e.pointerId); } catch (er) { }
  if (cuPtrs.size >= 2) { if (cuSt && cuSt.base) cuArt.set(cuSt.base); cuSt = null; cuCursor = null; cuIgnore = true; const [a, b] = [...cuPtrs.values()]; cuPinch = { d: Math.hypot(a[0] - b[0], a[1] - b[1]) || 1, z: cuZoom, mx: (a[0] + b[0]) / 2, my: (a[1] + b[1]) / 2 }; cuPaint(); return; }
  if (cuIgnore) return; const [x, y] = cuXY(e); if (e.pointerType === 'touch' && cuOffset) cuCursor = [cuClamp(x), cuClamp(y)]; if (!cuIn(x, y)) { cuPaint(); return; }
  if (cuTool === 'pick') { const v = cuArt[y * 64 + x]; if (v) cuSetColor(v - 1); cuPaint(); return; }
  cuPush(); cuSync(); cuSt = { x0: x, y0: y, lx: x, ly: y, base: cuArt.slice() };
  if (cuTool === 'sel') { if (cuSel && x >= cuSel.x0 && x <= cuSel.x1 && y >= cuSel.y0 && y <= cuSel.y1) { cuSt.mode = 'move'; const r = cuSel, w = r.x1 - r.x0 + 1, h = r.y1 - r.y0 + 1, pix = new Uint8Array(w * h); for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) { pix[j * w + i] = cuArt[(r.y0 + j) * 64 + r.x0 + i]; if (!cuCopy) cuSt.base[(r.y0 + j) * 64 + r.x0 + i] = 0; } cuSt.pix = pix; cuSt.r = { ...r }; } else { cuSt.mode = 'rect'; cuSel = { x0: x, y0: y, x1: x, y1: y }; } cuPaint(); return; }
  if (cuTool === 'pen' || cuTool === 'era') cuPut(cuArt, x, y, cuTool === 'era' ? 0 : cuColor + 1);
  cuPaint();
}
function cuMove(e) {
  if (cuPtrs.has(e.pointerId)) cuPtrs.set(e.pointerId, [e.clientX, e.clientY]);
  if (cuPinch && cuPtrs.size >= 2) {      // two fingers: spread to zoom, move to look around
    const [a, b] = [...cuPtrs.values()], d = Math.hypot(a[0] - b[0], a[1] - b[1]) || 1, mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2, k0 = cuCell * cuZoom, nz = cuSnap(cuPinch.z * d / cuPinch.d);
    if (nz !== cuZoom) { const r = $('cdCv').getBoundingClientRect(), ax = cuPX + (mx - r.left) / k0, ay = cuPY + (my - r.top) / k0; cuSetZoom(nz, ax, ay); cuPinch.mx = mx; cuPinch.my = my; }
    const k = cuCell * cuZoom, dx = Math.round((cuPinch.mx - mx) / k), dy = Math.round((cuPinch.my - my) / k); if (dx || dy) { const w = 64 / cuZoom; cuPX = Math.max(0, Math.min(64 - w, cuPX + dx)); cuPY = Math.max(0, Math.min(64 - w, cuPY + dy)); cuPinch.mx = mx; cuPinch.my = my; }
    cuPaint(); return;
  }
  if (!cuSt) return; const [x, y] = cuXY(e); if (e.pointerType === 'touch' && cuOffset) cuCursor = [cuClamp(x), cuClamp(y)]; if (x === cuSt.lx && y === cuSt.ly) { cuPaint(); return; }
  const t = cuTool;
  if (t === 'sel') { if (cuSt.mode === 'rect') { cuSel = { x0: Math.min(cuSt.x0, cuClamp(x)), y0: Math.min(cuSt.y0, cuClamp(y)), x1: Math.max(cuSt.x0, cuClamp(x)), y1: Math.max(cuSt.y0, cuClamp(y)) }; cuPaint(); } else { const tmp = cuSt.base.slice(), dx = x - cuSt.x0, dy = y - cuSt.y0, r = cuSt.r, w = r.x1 - r.x0 + 1, h = r.y1 - r.y0 + 1; for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) { const v = cuSt.pix[j * w + i], X = r.x0 + i + dx, Y = r.y0 + j + dy; if (v && cuIn(X, Y)) tmp[Y * 64 + X] = v; } cuSt.tmp = tmp; cuSt.dx = dx; cuSt.dy = dy; cuPaint(tmp); } }
  else if (t === 'pen' || t === 'era') { cuLine(cuArt, cuSt.lx, cuSt.ly, x, y, t === 'era' ? 0 : cuColor + 1); cuPaint(); }
  else if (t !== 'fill') { const tmp = cuSt.base.slice(); if (t === 'line') cuLine(tmp, cuSt.x0, cuSt.y0, x, y, cuColor + 1); else cuShape(tmp, t, cuSt.x0, cuSt.y0, x, y, cuColor + 1); cuPaint(tmp); }
  cuSt.lx = x; cuSt.ly = y;
}
function cuUp(e) {
  cuPtrs.delete(e.pointerId); if (cuPtrs.size < 2) cuPinch = null; if (cuPtrs.size === 0) cuIgnore = false;
  if (!cuSt) { cuCursor = null; cuPaint(); return; } const [x, y] = cuXY(e), t = cuTool;
  if (t === 'fill') { if (cuIn(cuSt.x0, cuSt.y0)) cuFill(cuArt, cuSt.x0, cuSt.y0, cuColor + 1); }
  else if (t === 'line') cuLine(cuArt, cuSt.x0, cuSt.y0, x, y, cuColor + 1);
  else if (t === 'rect' || t === 'frect' || t === 'circ' || t === 'fcirc') cuShape(cuArt, t, cuSt.x0, cuSt.y0, x, y, cuColor + 1);
  else if (t === 'sel' && cuSt.mode === 'move' && cuSt.tmp) { cuArt.set(cuSt.tmp); const r = cuSel; cuSel = { x0: r.x0 + cuSt.dx, y0: r.y0 + cuSt.dy, x1: r.x1 + cuSt.dx, y1: r.y1 + cuSt.dy }; }
  cuSt = null; cuCursor = null; cuPaint(); cuFrSync();
}

// ---- the screens: CUSTOM (3 slots) > a slot > the NAME > the DRAWING
function renderCust() {
  const a = cuLoad(); for (let i = 0; i < 3; i++) { const b = $('cu' + i), d = a[i]; cuThumb(b.querySelector('canvas'), d); b.querySelector('b').textContent = d && d.n ? d.n : 'EMPTY'; b.querySelector('i').textContent = d ? 'EDIT' : 'DRAW'; }
}
function customBack() {      // the Android back button inside CUSTOM: the drawing asks "SURE?" before it is thrown away; true when it was used
  if (state === 'custdraw') { if (cuDirty && !cuSure('back', $('cdBack'), 'SURE?')) return true; show('cust'); renderCust(); return true; }
  if (state === 'custname') { show('cust'); return true; }
  if (state === 'cust') { show('modes'); return true; }
  return false;
}
(function cuInit() {
  const t = $('cdTools'), pal = $('cdPal');
  for (const [id, lab] of CU_TOOLS) { const b = document.createElement('button'); b.textContent = lab; b.dataset.tool = id; b.addEventListener('click', () => { cuTool = id; cuSync(); }); t.appendChild(b); }
  for (const [id, lab] of CU_ACTS) { const b = document.createElement('button'); b.textContent = lab; b.dataset.act = id; if (id === 'delfr' || id === 'templ') b.style.gridColumn = '1 / 3'; b.addEventListener('click', () => cuAct(id, b)); t.appendChild(b); }
  for (let i = 0; i < 15; i++) { const b = document.createElement('button'); b.innerHTML = '<canvas width="64" height="64"></canvas><span></span>'; b.setAttribute('aria-label', 'frame ' + (i + 1)); b.addEventListener('click', () => { if (i < cuFr.length) cuSelect(i); else cuAddFrame(); }); $('cdFr').appendChild(b); }
  setInterval(() => { if (state === 'custdraw') cuImg(cuFr[Math.floor(performance.now() / (1000 / IDLE_FPS)) % cuFr.length], $('cdPrev')); }, 1000 / IDLE_FPS);      // (the real-size preview plays the frames over and over, as they will play in the game)
  CU_PAL.forEach((c, i) => { const b = document.createElement('button'); b.style.background = c; b.dataset.i = i; b.setAttribute('aria-label', 'colour ' + (i + 1)); b.addEventListener('click', () => cuSetColor(i)); pal.appendChild(b); });
  const cv = $('cdCv'); cv.addEventListener('pointerdown', cuDown); cv.addEventListener('pointermove', cuMove); cv.addEventListener('pointerup', cuUp); cv.addEventListener('pointercancel', cuUp); cv.addEventListener('lostpointercapture', e => { if (cuPtrs.has(e.pointerId)) cuUp(e); });
  $('customMode').addEventListener('click', () => { audio(); renderCust(); show('cust'); });
  $('cuBack').addEventListener('click', () => show('modes'));
  ['cu0', 'cu1', 'cu2'].forEach((id, i) => $(id).addEventListener('click', () => {      // a slot: asks for the name (the old one is already written there)
    audio(); cuSlot = i; const d = cuLoad()[i]; $('cuName').value = d && d.n ? d.n : ''; $('cuDel').style.display = d ? '' : 'none'; $('cuNext').disabled = !$('cuName').value.trim(); $('cuNameSlot').textContent = 'SLOT ' + (i + 1); show('custname');
  }));
  $('cuName').addEventListener('input', e => { const v = e.target.value.toUpperCase().replace(/[^A-Z0-9 ]/g, '').slice(0, 12); if (v !== e.target.value) e.target.value = v; $('cuNext').disabled = !v.trim(); });
  $('cuName').addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); if (!$('cuNext').disabled) $('cuNext').click(); } });
  $('cuNameBack').addEventListener('click', () => show('cust'));
  $('cuDel').addEventListener('click', () => { if (!cuSure('del', $('cuDel'), 'SURE?')) return; const a = cuLoad(); a[cuSlot] = null; cuStore(a); show('cust'); renderCust(); });
  $('cuNext').addEventListener('click', () => {      // on to the drawing: a new slot starts empty, an old one opens its picture
    audio(); cuNameV = $('cuName').value.trim().replace(/\s+/g, ' '); if (!cuNameV) return; $('cuName').blur(); const d = cuLoad()[cuSlot]; cuFr = d ? cuFrames(d) : [new Uint8Array(4096)]; cuCur = 0; cuArt = cuFr[0]; cuUndo = []; cuRedo = []; cuDirty = false; cuSt = null; cuSel = null; cuZoom = 1; cuPX = cuPY = 0; cuPtrs.clear(); cuPinch = null; cuIgnore = false;
    $('cdName').textContent = cuNameV; show('custdraw'); cuLayout(); cuSync(); cuPaint(); cuFrSync();
  });
  $('cdDone').addEventListener('click', () => {
    if (!cuFr.some(f => f.some(v => v))) { cuFlash($('cdDone'), 'DRAW FIRST'); return; }
    const a = cuLoad(); a[cuSlot] = cuEncode(cuFr, cuNameV); cuStore(a); cuDirty = false; audio(); show('cust'); renderCust();
  });
  $('cdBack').addEventListener('click', () => { if (cuDirty && !cuSure('back', $('cdBack'), 'SURE?')) return; show('cust'); renderCust(); });
  addEventListener('resize', () => { if (state === 'custdraw') { cuLayout(); cuPaint(); } });
})();
window.__custom = () => ({ pal: CU_PAL.length, slots: cuLoad(), art: cuArt, frames: cuFr.length, cur: cuCur, tool: cuTool, color: cuColor, cell: cuCell, dirty: cuDirty });

// ---- v1.65 the custom characters in the game: FREE PLAY (the fighter select screen) has a small card for each drawn slot; in the match the character stands on its idle frames (up to 15, at the speed of the others) and does nothing: it cannot move, attack or block yet (whatever you press is dropped)
const cuMe = () => !!vs && typeof vs.me === 'string' && vs.me.slice(0, 2) === 'cu';
const CU_GAME = [null, null, null];      // for each slot { name, frames: 64 x 64 canvases }, made again every time the select screen opens
function cuSelRefresh() {
  const row = $('selCu'), a = cuLoad(); row.innerHTML = ''; for (let i = selPv.length - 1; i >= 0; i--) if (selPv[i].who.slice(0, 2) === 'cu') selPv.splice(i, 1); let n = 0;
  a.forEach((d, i) => {
    CU_GAME[i] = d ? { name: d.n || 'CUSTOM', frames: cuFrames(d).map(f => { const c = document.createElement('canvas'); c.width = c.height = 64; cuImg(f, c); return c; }) } : null; if (!d) return; n++;
    const b = document.createElement('button'); b.className = 'card pp'; b.dataset.who = 'cu' + i; b.innerHTML = '<canvas width="64" height="64"></canvas><b></b>'; b.querySelector('b').textContent = CU_GAME[i].name; selPv.push({ g: b.querySelector('canvas').getContext('2d'), who: 'cu' + i });
    b.addEventListener('click', () => { NAMES['cu' + i] = CU_GAME[i].name; startPractice('cu' + i); }); row.appendChild(b);
  });
  $('selCuLab').style.display = n ? '' : 'none'; row.style.display = n ? '' : 'none';
}
const cuIdleCv = (who, now) => { const g = CU_GAME[+who.slice(2)]; return g ? g.frames[Math.floor(now / (1000 / IDLE_FPS)) % g.frames.length] : null; };
function customScene(now, dt) {      // one frame of a match with a CUSTOM character as the player: it only stands there on its idle frames; the enemy, the HUD and the effects are the shared ones
  const el = Math.max(0, now - spawnAt), t = Math.min(1, el / 900), e = 1 - Math.pow(1 - t, 3), cx = Math.round(VW / 2), g = CU_GAME[+vs.me.slice(2)]; setDomUI(now);
  keyL = keyR = padL = padR = jumpReq = atkReq = crReq = lpReq = dashReq = ceReq = domReq = senseReq = blockHeld = false; atkHold = -1; teleAt = blkAt = blkEnd = -1; gojoGone = false; atkAt = dgAt = jumpAt = -1; stance = 'stand'; stickCr = false; mode = 'idle'; gojoLift = 0;      // (it cannot move yet)
  if (hurtAt >= 0 && now - hurtAt > 700) { hurtAt = -1; hurtEnd = now; }
  playerSlide(dt); physCollide(now, dt);
  ctx.save(); shkX = shkY = 0; if (now < shakeUntil && !SET.lite) { shkX = Math.round((Math.random() * 2 - 1) * shakeAmp); shkY = Math.round((Math.random() * 2 - 1) * shakeAmp); ctx.translate(shkX, shkY); }
  ctx.imageSmoothingEnabled = false; drawBackdrop(now); drawSmoke(now, dt); drawBloodFloor(now, dt); drawFoes(now, dt); updatePeds(now, dt); drawPeds(now, dt, 0);
  const src = g ? g.frames[Math.floor(el / (1000 / IDLE_FPS)) % g.frames.length] : null, x = cx - 32, y = gy - 64, ry = Math.round(64 * (1 - e));
  ctx.fillStyle = 'rgba(0,0,0,0.4)'; ctx.fillRect(cx - 9, gy + 3, 18, 2); ctx.fillRect(cx - 6, gy + 2, 12, 1); ctx.fillRect(cx - 6, gy + 5, 12, 1);
  if (src) { ctx.save(); ctx.beginPath(); ctx.rect(x, y + ry, 64, 64 - ry); ctx.clip(); ctx.globalAlpha = Math.min(1, t * 2); ctx.drawImage(src, x, y); if (hurtAt >= 0 && now - hurtAt < 70) ctx.drawImage(whiteOf(src), x, y); ctx.restore(); }
  drawGiantNow('foe');
  if (t < 1) { const R = 6 + t * 70; ctx.fillStyle = 'rgba(255,225,110,' + (1 - t) + ')'; for (let a = 0; a < 64; a++) { const th = a / 64 * 6.2832; ctx.fillRect(Math.round(cx + Math.cos(th) * R), Math.round(y + 34 + Math.sin(th) * R * 0.45), 1, 1); } ctx.fillStyle = 'rgba(255,255,255,' + Math.max(0, 0.55 - t * 1.8) + ')'; ctx.fillRect(0, 0, VW, VH); }      // (it appears with a ring and a flash, like the others)
  drawDivFx(now); drawSparks(now, dt); drawPeds(now, dt, 1); drawGibs(now); drawPopups(now); drawVs(now, -shkX, -shkY);
  ctx.restore();
  if (now < flashUntil) { ctx.fillStyle = 'rgba(190,225,255,' + (flashA * (flashUntil - now) / flashMs) + ')'; ctx.fillRect(0, 0, VW, VH); }
  if (now < blackUntil) { ctx.fillStyle = 'rgba(0,0,0,' + ((blackUntil - now) / 600).toFixed(2) + ')'; ctx.fillRect(0, 0, VW, VH); }
  drawHits(now);
}
