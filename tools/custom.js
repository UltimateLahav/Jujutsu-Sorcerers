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
function cuEncode(frames, name, walk, jump, atk, names, progs, vfx) {      // the name, the colours used by any frame of either animation and, for each frame, one character per pixel (48 + the number of its colour in that list; '0' = see-through); .f = the IDLE frames (.a the first, what older versions read), .w = the WALKING frames, .j = the JUMP frames, .m = the 4 ATTACK (M1) sets of frames, .mn = their 4 names, .pg = their 4 scripts (CODE blocks), .vx = their 4 VFX drawings (up to 5 frames)
  const used = [], idx = new Map(), enc = art => { let s = ''; for (let i = 0; i < 4096; i++) { const v = art[i]; if (!v) { s += '0'; continue; } let k = idx.get(v); if (!k) { used.push(CU_PAL[v - 1]); k = used.length; idx.set(v, k); } s += String.fromCharCode(48 + k); } return s; };
  const fr = frames.map(enc), w = (walk || []).map(enc), j = (jump || []).map(enc), m = (atk || []).map(set => set.map(enc)); return { n: name, p: used, a: fr[0], f: fr, w, j, m, mn: (names || []).slice(0, 4), pg: (progs || []).slice(0, 4), vx: (vfx || []).slice(0, 4).map(set => set.map(enc)) };
}
function cuDecodeOne(d, str) {      // the 4096 colour numbers (0 = see-through, otherwise 1 + the place in CU_PAL) of one frame; anything damaged is simply left empty
  const art = new Uint8Array(4096); if (typeof str !== 'string' || !d || !Array.isArray(d.p)) return art;
  for (let i = 0; i < 4096 && i < str.length; i++) { const k = str.charCodeAt(i) - 48; if (k > 0 && d.p[k - 1]) { const v = CU_PAL.indexOf(d.p[k - 1]); art[i] = v >= 0 ? v + 1 : 0; } }
  return art;
}
function cuFrames(d) { const l = d && Array.isArray(d.f) && d.f.length ? d.f.slice(0, 15) : [d && d.a]; return l.map(str => cuDecodeOne(d, str)); }      // all the frames of a kept drawing (1 - 15; a drawing kept by v1.64 has one)
function cuJumpFrames(d) { return d && Array.isArray(d.j) ? d.j.slice(0, 15).map(str => cuDecodeOne(d, str)) : []; }
function cuAtkFrames(d, n) { return d && Array.isArray(d.m) && Array.isArray(d.m[n]) ? d.m[n].slice(0, 15).map(str => cuDecodeOne(d, str)) : []; }
const cuAtkNames = d => [0, 1, 2, 3].map(q => d && Array.isArray(d.mn) && typeof d.mn[q] === 'string' ? d.mn[q].slice(0, 9) : '');      // the 4 names of the punches ('' = not named: M1 #1 to #4)
function cuVfxFrames(d, n) { return d && Array.isArray(d.vx) && Array.isArray(d.vx[n]) ? d.vx[n].slice(0, 5).map(str => cuDecodeOne(d, str)) : []; }
function cuWalkFrames(d) { return d && Array.isArray(d.w) ? d.w.slice(0, 15).map(str => cuDecodeOne(d, str)) : []; }
function cuImg(art, cv) {      // a frame on a 64 x 64 canvas (see-through pixels stay see-through)
  const g = cv.getContext('2d'), im = g.createImageData(64, 64); for (let i = 0; i < 4096; i++) { const v = art[i]; if (v) { const c = CU_RGB[v - 1]; im.data[i * 4] = c[0]; im.data[i * 4 + 1] = c[1]; im.data[i * 4 + 2] = c[2]; im.data[i * 4 + 3] = 255; } } g.putImageData(im, 0, 0);
}
function cuThumb(cv, d) { cv.getContext('2d').clearRect(0, 0, 64, 64); if (d) cuImg(cuFrames(d)[0], cv); }      // a kept drawing's first frame (a slot card)

// ---- the editor
let cuChar = null, cuSetKey = 'idle', cuSlot = -1, cuNameV = '', cuFr = [new Uint8Array(4096)], cuCur = 0, cuArt = cuFr[0], cuTool = 'pen', cuColor = 1, cuMirror = false, cuGrid = true, cuUndo = [], cuRedo = [], cuDirty = false, cuCell = 4, cuSt = null, cuArmed = '', cuArmT = 0;
let cuZoom = 1, cuPX = 0, cuPY = 0, cuOffset = true, cuOnion = false, cuBig = false, cuSel = null, cuCopy = false, cuCursor = null, cuTpl = 0, cuPtrs = new Map(), cuPinch = null, cuIgnore = false;
let cuPad = true, cuStable = false, cuPerfect = true, cuC = [32, 32], cuTouchSeen = false, cuTap = null, cuLastTap = 0, cuLastTapPos = [0, 0], cuShapeStart = null, cuAutoDone = false, cuBigOn = false, cuBigSt = null, cuBigUndo = [], cuPath = null, cuLazy = null;
const cuBigCv = document.createElement('canvas'); cuBigCv.width = cuBigCv.height = 128; const cuN = () => cuBigOn ? 128 : 64, cuKk = () => cuCell * 64 / cuN() * cuZoom;
const cuOff = document.createElement('canvas'); cuOff.width = cuOff.height = 64; const cuOn = document.createElement('canvas'); cuOn.width = cuOn.height = 64;
const CU_TOOLS = [['pen', 'PEN'], ['era', 'ERASE'], ['fill', 'FILL'], ['pick', 'PICK'], ['line', 'LINE'], ['rect', 'BOX'], ['frect', 'FILL BOX'], ['circ', 'OVAL'], ['fcirc', 'FILL OVAL'], ['sel', 'SELECT']];
const CU_ACTS = [['mirror', 'MIRROR'], ['grid', 'GRID'], ['onion', 'ONION'], ['big', '32 MODE'], ['offset', 'OFFSET'], ['undo', 'UNDO'], ['redo', 'REDO'], ['clear', 'CLEAR'], ['zin', 'ZOOM +'], ['zout', 'ZOOM -'], ['fit', 'FIT'], ['flipx', 'FLIP H'], ['flipy', 'FLIP V'], ['copy', 'COPY'], ['outline', 'OUTLINE'], ['shade', 'SHADE'], ['import', 'IMPORT'], ['templ', 'TEMPLATE'], ['atpl', 'ANIM TEMPLATE'], ['pad', 'PAD'], ['stable', 'STABLE'], ['perfect', 'PERFECT'], ['bigm', 'BIG'], ['shrink', 'SHRINK'], ['delfr', 'DEL FRAME']];
function cuSure(key, btn, label) {      // a button that needs a second tap within 2.5 s ("SURE?") before it does something that throws work away; true on the second tap
  if (cuArmed === key && performance.now() - cuArmT < 2500) { cuArmed = ''; return true; }
  cuArmed = key; cuArmT = performance.now(); if (btn) { const t0 = btn.dataset.t || btn.textContent; btn.dataset.t = t0; btn.textContent = label; setTimeout(() => { if (btn.dataset.t) { btn.textContent = btn.dataset.t; delete btn.dataset.t; } }, 2500); } return false;
}
function cuFlash(btn, text) { const t0 = btn.dataset.t || btn.textContent; btn.dataset.t = t0; btn.textContent = text; setTimeout(() => { if (btn.dataset.t) { btn.textContent = btn.dataset.t; delete btn.dataset.t; } }, 1400); }
function cuLayout() { const c = $('cdCv'), k = Math.max(3, Math.min(Math.floor(innerHeight * 0.82 / 64), Math.floor(innerWidth * 0.46 / 64))); cuCell = k; c.width = c.height = 64 * k; c.style.width = c.style.height = 64 * k + 'px'; }
function cuSetZoom(z, cx, cy) {      // zoom 1, 2, 4 or 8 times, keeping the point (cx, cy) in the middle of the view; the view never leaves the board
  z = Math.max(1, Math.min(8, z)); cuZoom = z; const n = cuN(), w = n / z; cuPX = Math.max(0, Math.min(n - w, Math.round(cx - w / 2))); cuPY = Math.max(0, Math.min(n - w, Math.round(cy - w / 2)));
}
const cuSnap = z => z < 1.5 ? 1 : z < 3 ? 2 : z < 6 ? 4 : 8;
function cuPaint(art) {      // the board (the part of it that is in view): checkerboard, the frame before it (ONION), the picture, the grid, the mirror line, the selection, the crosshair; a small map of the whole board when zoomed in
  const real = !art; art = art || cuArt; const c = $('cdCv'), g = c.getContext('2d'), n = cuN(), V = 64 * cuCell, w = n / cuZoom, k = V / w; g.imageSmoothingEnabled = false; g.clearRect(0, 0, V, V);
  if (cuBigOn) { g.fillStyle = '#171127'; g.fillRect(0, 0, V, V); g.drawImage(cuBigCv, cuPX, cuPY, w, w, 0, 0, V, V); }
  else {
    cuImg(art, cuOff);
    for (let y = 0; y < w; y++) for (let x = 0; x < w; x++) { g.fillStyle = ((x + cuPX + y + cuPY) & 1) ? '#2e2750' : '#252042'; g.fillRect(x * k, y * k, k, k); }
    if (cuOnion && cuFr.length > 1) { cuImg(cuFr[(cuCur + cuFr.length - 1) % cuFr.length], cuOn); g.globalAlpha = 0.3; g.drawImage(cuOn, cuPX, cuPY, w, w, 0, 0, V, V); g.globalAlpha = 1; }
    g.drawImage(cuOff, cuPX, cuPY, w, w, 0, 0, V, V);
    if (cuGrid) for (let i = 0; i <= w; i++) { g.fillStyle = (cuPX + i) % 8 === 0 ? 'rgba(255,255,255,0.28)' : 'rgba(255,255,255,0.10)'; g.fillRect(Math.min(i * k, V - 1), 0, 1, V); g.fillStyle = (cuPY + i) % 8 === 0 ? 'rgba(255,255,255,0.28)' : 'rgba(255,255,255,0.10)'; g.fillRect(0, Math.min(i * k, V - 1), V, 1); }
    if (cuMirror) { g.fillStyle = 'rgba(255,211,77,0.75)'; g.fillRect((32 - cuPX) * k - 1, 0, 2, V); }
    if (cuSel) { g.strokeStyle = '#ffd34d'; g.setLineDash([4, 3]); g.lineWidth = 2; g.strokeRect((cuSel.x0 - cuPX) * k, (cuSel.y0 - cuPY) * k, (cuSel.x1 - cuSel.x0 + 1) * k, (cuSel.y1 - cuSel.y0 + 1) * k); g.setLineDash([]); }
    if (cuShapeStart) { g.strokeStyle = '#ffd34d'; g.lineWidth = 2; g.strokeRect((cuShapeStart[0] - cuPX) * k + 1, (cuShapeStart[1] - cuPY) * k + 1, k - 2, k - 2); }
  }
  { const fy = ((cuBigOn ? 122 : 61) - cuPY) * k; if (fy >= 0 && fy < V) { g.fillStyle = 'rgba(224,36,47,0.14)'; g.fillRect(0, fy, V, V - fy); g.fillStyle = '#ffd34d'; for (let x = 0; x < V; x += 8) g.fillRect(x, Math.max(0, fy - 1), 5, 2); } }      // THE FLOOR: the game puts the bottom of row 60 on the ground, so the feet of every frame should end on this gold line (below it is under the floor)
  const cc = cuCursor || (cuPad && cuTouchSeen && !cuBigOn ? [Math.floor(cuC[0]), Math.floor(cuC[1])] : null);
  if (cc) { const cx = (cc[0] - cuPX + 0.5) * k, cy = (cc[1] - cuPY + 0.5) * k; g.fillStyle = '#ffd34d'; g.fillRect(cx - 9, cy - 1, 6, 2); g.fillRect(cx + 4, cy - 1, 6, 2); g.fillRect(cx - 1, cy - 9, 2, 6); g.fillRect(cx - 1, cy + 4, 2, 6); }
  const mm = $('cdMini'); if (cuZoom > 1) { mm.style.display = 'block'; const m = mm.getContext('2d'), sc = 64 / n; m.imageSmoothingEnabled = false; m.fillStyle = '#0b0a0f'; m.fillRect(0, 0, 64, 64); m.drawImage(cuBigOn ? cuBigCv : cuOff, 0, 0, 64, 64); m.strokeStyle = '#e0242f'; m.lineWidth = 2; m.strokeRect(cuPX * sc + 1, cuPY * sc + 1, w * sc - 2, w * sc - 2); } else mm.style.display = 'none';
  const fb = $('cdFr').children[cuCur]; if (real && fb && !cuBigOn) cuImg(cuArt, fb.querySelector('canvas'));
}
function cuSync() {      // which tool, toggle and colour is selected
  const on = { mirror: cuMirror, grid: cuGrid, onion: cuOnion, big: cuBig, offset: cuOffset, copy: cuCopy, pad: cuPad, stable: cuStable, perfect: cuPerfect, bigm: cuBigOn };
  for (const b of $('cdTools').children) { const t = b.dataset.tool, a = b.dataset.act; b.classList.toggle('sel', t ? t === cuTool : !!on[a]); if (a === 'shrink') b.disabled = !cuBigOn; if (a === 'undo') b.disabled = cuBigOn ? !cuBigUndo.length : !cuUndo.length; if (a === 'redo') b.disabled = !cuRedo.length; }
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
  if (cuBigOn && !['undo', 'zin', 'zout', 'fit', 'bigm', 'shrink', 'clear', 'pad', 'offset'].includes(id)) return;      // (the big canvas only has the brush, the eraser, the bucket, the picker and the line)
  if (id === 'bigm') { cuBigToggle(!cuBigOn); cuSync(); cuPaint(); return; } if (id === 'shrink') { if (cuBigOn) cuShrink(); cuSync(); cuPaint(); cuFrSync(); return; }
  if (cuBigOn && id === 'undo') { const sn = cuBigUndo.pop(); if (sn) cuBigCv.getContext('2d').putImageData(sn, 0, 0); cuSync(); cuPaint(); return; }
  if (cuBigOn && id === 'clear') { if (!cuSure('clear', b, 'SURE?')) return; cuBigPush(); cuBigCv.getContext('2d').clearRect(0, 0, 128, 128); cuPaint(); return; }
  if (id === 'mirror') cuMirror = !cuMirror; else if (id === 'grid') cuGrid = !cuGrid; else if (id === 'onion') cuOnion = !cuOnion; else if (id === 'big') cuBig = !cuBig; else if (id === 'offset') cuOffset = !cuOffset; else if (id === 'copy') cuCopy = !cuCopy; else if (id === 'pad') cuPad = !cuPad; else if (id === 'stable') cuStable = !cuStable; else if (id === 'perfect') cuPerfect = !cuPerfect;
  else if (id === 'undo') { if (cuUndo.length) { cuRedo.push(cuArt.slice()); cuArt = cuUndo.pop(); cuFr[cuCur] = cuArt; } }
  else if (id === 'redo') { if (cuRedo.length) { cuUndo.push(cuArt.slice()); cuArt = cuRedo.pop(); cuFr[cuCur] = cuArt; } }
  else if (id === 'delfr') { cuDelFrame(b); return; }
  else if (id === 'clear') { if (!cuSure('clear', b, 'SURE?')) return; cuPush(); cuArt.fill(0); }
  else if (id === 'zin') cuSetZoom(cuZoom * 2, cuPX + cuN() / 2 / cuZoom, cuPY + cuN() / 2 / cuZoom); else if (id === 'zout') cuSetZoom(cuZoom / 2, cuPX + cuN() / 2 / cuZoom, cuPY + cuN() / 2 / cuZoom); else if (id === 'fit') cuSetZoom(1, cuN() / 2, cuN() / 2);
  else if (id === 'flipx') cuFlip(true); else if (id === 'flipy') cuFlip(false); else if (id === 'outline') cuOutline(); else if (id === 'shade') cuShade();
  else if (id === 'atpl') { cuAnimTemplate(b); return; } else if (id === 'import') { cuImport(); return; } else if (id === 'templ') { cuTemplate(b); }
  cuSync(); cuPaint(); cuFrSync();
}
function cuFrSync() {      // the grid of frames: a small picture for each frame (the chosen one is framed in gold), a "+" for the next new one
  const box = $('cdFr'), n = cuFr.length;
  for (let i = 0; i < 15; i++) { const b = box.children[i], cv = b.querySelector('canvas'); if (i < n) { b.style.display = ''; b.classList.toggle('sel', i === cuCur); b.classList.remove('add'); cv.style.display = ''; b.querySelector('span').textContent = ''; cuImg(cuFr[i], cv); } else if (i === n && n < cuMaxFr()) { b.style.display = ''; b.classList.remove('sel'); b.classList.add('add'); cv.style.display = 'none'; b.querySelector('span').textContent = '+'; } else b.style.display = 'none'; }
  $('cdFrInfo').textContent = 'FRAME ' + (cuCur + 1) + ' OF ' + n; const del = $('cdTools').querySelector('[data-act="delfr"]'); if (del) del.disabled = n < 2;
}
function cuSelect(i) { if (cuBigOn) cuBigToggle(false); cuShapeStart = null; cuCur = i; cuArt = cuFr[i]; cuUndo = []; cuRedo = []; cuSt = null; cuSel = null; cuSync(); cuPaint(); cuFrSync(); }
const cuMaxFr = () => cuSetKey[0] === 'x' ? 5 : 15;      // (a VFX has up to 5 frames, the others 15)
function cuAddFrame() { if (cuFr.length >= cuMaxFr()) return; cuFr.splice(cuCur + 1, 0, cuArt.slice()); cuDirty = true; cuSelect(cuCur + 1); }
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
const cuXY = e => { const c = $('cdCv'), r = c.getBoundingClientRect(), k = cuKk(), oy = cuOffset && e.pointerType === 'touch' ? 26 : 0; return [Math.floor(cuPX + (e.clientX - r.left - c.clientLeft) / k), Math.floor(cuPY + (e.clientY - oy - r.top - c.clientTop) / k)]; };      // (a finger draws 26 screen pixels ABOVE where it touches in direct mode)
function cuPush() { cuUndo.push(cuArt.slice()); if (cuUndo.length > 60) cuUndo.shift(); cuRedo.length = 0; cuDirty = true; }
const cuIn = (x, y) => x >= 0 && y >= 0 && x <= 63 && y <= 63, cuClamp = v => Math.max(0, Math.min(63, v));
function cuDown(e) {
  e.preventDefault(); cuPtrs.set(e.pointerId, [e.clientX, e.clientY]); try { $('cdCv').setPointerCapture(e.pointerId); } catch (er) { }
  if (cuPtrs.size >= 2) { cuCancelStroke(); cuIgnore = true; const [a, b] = [...cuPtrs.values()]; cuPinch = { d: Math.hypot(a[0] - b[0], a[1] - b[1]) || 1, z: cuZoom, mx: (a[0] + b[0]) / 2, my: (a[1] + b[1]) / 2 }; cuPaint(); return; }
  if (cuIgnore) return; if (cuBigOn) { cuBigDown(e); return; } if (e.pointerType === 'touch' && cuPad) { cuPadDown(e); return; }
  const [x, y] = cuXY(e); if (e.pointerType === 'touch' && cuOffset) cuCursor = [cuClamp(x), cuClamp(y)]; if (!cuIn(x, y)) { cuPaint(); return; }
  if (cuTool === 'pick') { const v = cuArt[y * 64 + x]; if (v) cuSetColor(v - 1); cuPaint(); return; }
  cuPush(); cuSync(); cuSt = { x0: x, y0: y, lx: x, ly: y, base: cuArt.slice() };
  if (cuTool === 'sel') { if (cuSel && x >= cuSel.x0 && x <= cuSel.x1 && y >= cuSel.y0 && y <= cuSel.y1) { cuSt.mode = 'move'; const r = cuSel, w = r.x1 - r.x0 + 1, h = r.y1 - r.y0 + 1, pix = new Uint8Array(w * h); for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) { pix[j * w + i] = cuArt[(r.y0 + j) * 64 + r.x0 + i]; if (!cuCopy) cuSt.base[(r.y0 + j) * 64 + r.x0 + i] = 0; } cuSt.pix = pix; cuSt.r = { ...r }; } else { cuSt.mode = 'rect'; cuSel = { x0: x, y0: y, x1: x, y1: y }; } cuPaint(); return; }
  if (cuTool === 'pen' || cuTool === 'era') cuPut(cuArt, x, y, cuTool === 'era' ? 0 : cuColor + 1);
  cuPaint();
}
function cuMove(e) {
  if (cuPtrs.has(e.pointerId)) cuPtrs.set(e.pointerId, [e.clientX, e.clientY]);
  if (cuPinch && cuPtrs.size >= 2) {      // two fingers: spread to zoom, move to look around
    const [a, b] = [...cuPtrs.values()], d = Math.hypot(a[0] - b[0], a[1] - b[1]) || 1, mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2, k0 = cuKk(), nz = cuSnap(cuPinch.z * d / cuPinch.d);
    if (nz !== cuZoom) { const r = $('cdCv').getBoundingClientRect(), ax = cuPX + (mx - r.left) / k0, ay = cuPY + (my - r.top) / k0; cuSetZoom(nz, ax, ay); cuPinch.mx = mx; cuPinch.my = my; }
    const k = cuKk(), dx = Math.round((cuPinch.mx - mx) / k), dy = Math.round((cuPinch.my - my) / k); if (dx || dy) { const w = cuN() / cuZoom; cuPX = Math.max(0, Math.min(cuN() - w, cuPX + dx)); cuPY = Math.max(0, Math.min(cuN() - w, cuPY + dy)); cuPinch.mx = mx; cuPinch.my = my; }
    cuPaint(); return;
  }
  if (cuBigOn) { cuBigMove(e); return; } if (e.pointerType === 'touch' && cuPad) { cuPadMove(e); return; }
  if (!cuSt) return; const [x, y] = cuXY(e); if (e.pointerType === 'touch' && cuOffset) cuCursor = [cuClamp(x), cuClamp(y)]; if (x === cuSt.lx && y === cuSt.ly) { cuPaint(); return; }
  const t = cuTool;
  if (t === 'sel') { if (cuSt.mode === 'rect') { cuSel = { x0: Math.min(cuSt.x0, cuClamp(x)), y0: Math.min(cuSt.y0, cuClamp(y)), x1: Math.max(cuSt.x0, cuClamp(x)), y1: Math.max(cuSt.y0, cuClamp(y)) }; cuPaint(); } else { const tmp = cuSt.base.slice(), dx = x - cuSt.x0, dy = y - cuSt.y0, r = cuSt.r, w = r.x1 - r.x0 + 1, h = r.y1 - r.y0 + 1; for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) { const v = cuSt.pix[j * w + i], X = r.x0 + i + dx, Y = r.y0 + j + dy; if (v && cuIn(X, Y)) tmp[Y * 64 + X] = v; } cuSt.tmp = tmp; cuSt.dx = dx; cuSt.dy = dy; cuPaint(tmp); } }
  else if (t === 'pen' || t === 'era') { cuLine(cuArt, cuSt.lx, cuSt.ly, x, y, t === 'era' ? 0 : cuColor + 1); cuPaint(); }
  else if (t !== 'fill') { const tmp = cuSt.base.slice(); if (t === 'line') cuLine(tmp, cuSt.x0, cuSt.y0, x, y, cuColor + 1); else cuShape(tmp, t, cuSt.x0, cuSt.y0, x, y, cuColor + 1); cuPaint(tmp); }
  cuSt.lx = x; cuSt.ly = y;
}
function cuUp(e) {
  cuPtrs.delete(e.pointerId); if (cuPtrs.size < 2) cuPinch = null; if (cuPtrs.size === 0) cuIgnore = false;
  if (cuBigOn) { cuBigUp(e); return; } if (e.pointerType === 'touch' && cuPad) { cuPadUp(e); return; }
  if (!cuSt) { cuCursor = null; cuPaint(); return; } const [x, y] = cuXY(e), t = cuTool;
  if (t === 'fill') { if (cuIn(cuSt.x0, cuSt.y0)) cuFill(cuArt, cuSt.x0, cuSt.y0, cuColor + 1); }
  else if (t === 'line') cuLine(cuArt, cuSt.x0, cuSt.y0, x, y, cuColor + 1);
  else if (t === 'rect' || t === 'frect' || t === 'circ' || t === 'fcirc') cuShape(cuArt, t, cuSt.x0, cuSt.y0, x, y, cuColor + 1);
  else if (t === 'sel' && cuSt.mode === 'move' && cuSt.tmp) { cuArt.set(cuSt.tmp); const r = cuSel; cuSel = { x0: r.x0 + cuSt.dx, y0: r.y0 + cuSt.dy, x1: r.x1 + cuSt.dx, y1: r.y1 + cuSt.dy }; }
  cuSt = null; cuCursor = null; cuPaint(); cuFrSync();
}

// ---- v1.70 ANIMATION TEMPLATES: 5 characters, each with 4 IDLE frames and 5 WALKING frames (20 and 25 frames in all), drawn by code in the colours of the palette; ANIM TEMPLATE loads the next one into the set you are drawing
const CU_TPLS = [      // name, skin, hair, top, bottom, shoes, accent, hair style
  ['SORCERER', '#f1cfb8', '#f4f2f8', '#3a3a5e', '#34304c', '#1a1426', '#3b8cff', 'spiky'],
  ['FIGHTER', '#f1cfb8', '#e8788a', '#1f2f6a', '#16204a', '#7a1f1f', '#d93a2f', 'short'],
  ['HOODED', '#e2a98a', '#5a3a80', '#5a3a80', '#3a2358', '#1a1426', '#ff3a4a', 'hood'],
  ['KNIGHT', '#f1cfb8', '#8a8aa6', '#7a7a96', '#55556e', '#34344a', '#e8b030', 'helmet'],
  ['ONI', '#c8403a', '#f4f2f8', '#c8403a', '#1a1426', '#1a1426', '#e8b030', 'horns']];
const CU_ATK = [      // the 4 M1 punches of a template, 5 frames each (wind-up, half way, the HIT, back, ready): [front hand x, y, back hand x, y, feet apart, crouch, and for a kick the foot x, y]
  [[33, 30, 38, 27, 0, 0], [42, 26, 38, 27, 1, 0], [52, 24, 38, 27, 3, 1], [44, 25, 38, 27, 2, 0], [35, 30, 38, 28, 1, 0]],      // M1 #1: a jab with the front hand
  [[34, 29, 27, 31, 1, 0], [38, 28, 44, 26, 2, 0], [34, 29, 54, 24, 3, 1], [38, 28, 46, 25, 2, 0], [37, 29, 36, 30, 1, 0]],      // M1 #2: a cross with the back hand
  [[36, 40, 38, 27, 2, 2], [42, 36, 38, 27, 2, 2], [46, 16, 38, 27, 2, 0], [44, 22, 38, 27, 1, 0], [38, 30, 38, 28, 0, 0]],      // M1 #3: an uppercut
  [[36, 29, 38, 27, 1, 0, 40, 48], [37, 29, 38, 27, 1, 0, 46, 44], [37, 29, 38, 27, 2, 0, 54, 41], [37, 29, 38, 27, 1, 0, 48, 45], [36, 29, 38, 28, 1, 0, 41, 51]]];      // M1 #4: a kick
function cuTplFrame(st, kind, i) {      // one frame (a Uint8Array of 4096 colour numbers) of template st; kind 'idle' (4 frames: it breathes), 'walk' (5: a full step, the arms swing the other way), 'jump' (10) or 'm0'..'m3' (5 each: the 4 punches)
  const T = CU_TPLS[st % 5], a = new Uint8Array(4096), C = h => cuNearest(parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)), sk = C(T[1]), hr = C(T[2]), tp = C(T[3]), bt = C(T[4]), sh = C(T[5]), ac = C(T[6]), dk = 2, hs = T[7];
  const px = (x, y, v) => { if (x >= 0 && y >= 0 && x < 64 && y < 64) a[y * 64 + x] = v; }, rc = (x0, y0, x1, y1, v) => { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) px(x, y, v); };
  const th = (x0, y0, x1, y1, w, v) => { const n = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0), 1); for (let k = 0; k <= n; k++) rc(Math.round(x0 + (x1 - x0) * k / n), Math.round(y0 + (y1 - y0) * k / n), Math.round(x0 + (x1 - x0) * k / n) + w - 1, Math.round(y0 + (y1 - y0) * k / n) + w - 1, v); };
  const JP = [[2, 0, 0, -3, -2], [4, 0, 0, -4, -3], [1, 0, 6, 0, 0], [0, 3, 10, 3, 3], [0, 6, 12, 4, 4], [0, 8, 12, 4, 5], [0, 6, 8, 2, 4], [0, 3, 4, 0, 3], [3, 0, 0, -2, -3], [1, 0, 0, 0, -1]][i % 10], J = kind === 'jump' ? JP : null, A = kind[0] === 'm' ? CU_ATK[+kind[1]][i % 5] : null;      // a jump frame: [crouch, feet raised, arms up, arm swing, legs apart]
  const ph = kind === 'walk' ? i / 5 * 6.2832 : 0, bob = J ? J[0] : A ? A[5] : kind === 'walk' ? -Math.round(Math.abs(Math.sin(ph)) * 2) : [0, 0, 1, 1][i % 4], sw = J ? J[4] : A ? A[4] : kind === 'walk' ? Math.round(Math.sin(ph) * 6) : 0, as = J ? J[3] : kind === 'walk' ? -Math.round(Math.sin(ph) * 5) : [0, 1, 1, 0][i % 4], y0 = bob, fe = J ? 56 - J[1] : 56, hy = J || A ? 41 + y0 : 41, ay = J ? 22 + y0 + Math.round(14 - J[2] * 20 / 12) : 36 + y0;
  const nx = A ? A[0] : 34 + as, ny = A ? A[1] : ay, fx = A ? A[2] : 29 - as, fy = A ? A[3] : ay, nf = A && A[6] ? [A[6], A[7]] : null;      // (where the hands are, and the foot of a kick)
  const dim = v => v;      // (one colour for the far side: the same, the outline separates it)
  th(30, hy, 30 - sw - (kind === 'idle' ? 1 : 0), fe, 4, dim(bt)); rc(30 - sw - 1 - (kind === 'idle' ? 1 : 0), fe, 33 - sw - (kind === 'idle' ? 1 : 0), fe + 2, sh);      // far leg and shoe
  th(29, 22 + y0, fx, fy, 3, dim(tp)); rc(fx - 1, fy, fx + 2, fy + 2, sk);      // far arm and hand
  rc(27, 21 + y0, 37, 37 + y0, tp); rc(27, 38 + y0, 37, 43 + y0, bt); rc(27, 33 + y0, 37, 34 + y0, ac);      // body, hips and a belt
  if (T[0] === 'KNIGHT') { rc(26, 21 + y0, 38, 25 + y0, ac); rc(29, 26 + y0, 35, 30 + y0, T[0] === 'KNIGHT' ? hr : tp); } else rc(32, 21 + y0, 35, 24 + y0, ac);      // shoulders / collar
  const lx = nf ? nf[0] : 34 + sw + (kind === 'idle' ? 1 : 0), ly = nf ? nf[1] : fe; th(34, hy, lx, ly, 4, bt); rc(lx, ly, lx + 4, ly + 2, sh);      // (the feet and their outline end on row 60: the floor line)      // near leg and shoe
  th(34, 22 + y0, nx, ny, 3, tp); rc(nx - 1, ny, nx + 2, ny + 2, sk);      // near arm and hand
  rc(28, 8 + y0, 38, 19 + y0, sk); px(39, 14 + y0, sk); px(39, 15 + y0, sk); rc(34, 12 + y0, 35, 13 + y0, dk); px(36, 17 + y0, dk);      // head, nose, eye, mouth
  if (hs === 'spiky') { rc(27, 5 + y0, 38, 10 + y0, hr); for (const [x, y] of [[27, 3], [30, 1], [33, 0], [36, 2], [38, 4], [25, 6]]) rc(x, y + y0, x + 2, y + 3 + y0, hr); rc(34, 11 + y0, 38, 12 + y0, dk); }      // white spiky hair and a blindfold
  else if (hs === 'short') { rc(27, 5 + y0, 38, 11 + y0, hr); rc(27, 12 + y0, 29, 17 + y0, hr); px(30, 4 + y0, hr); px(34, 4 + y0, hr); px(37, 4 + y0, hr); }
  else if (hs === 'hood') { rc(26, 5 + y0, 39, 20 + y0, hr); rc(33, 9 + y0, 39, 19 + y0, sk); rc(34, 12 + y0, 35, 13 + y0, ac); rc(26, 21 + y0, 38, 23 + y0, hr); }
  else if (hs === 'helmet') { rc(26, 5 + y0, 39, 13 + y0, hr); rc(26, 14 + y0, 29, 19 + y0, hr); rc(33, 10 + y0, 39, 12 + y0, dk); rc(31, 2 + y0, 33, 4 + y0, ac); }
  else { rc(27, 6 + y0, 38, 9 + y0, hr); rc(28, 3 + y0, 30, 7 + y0, hr); rc(35, 3 + y0, 37, 7 + y0, hr); rc(34, 12 + y0, 35, 13 + y0, ac); }      // horns
  const o = a.slice(); for (let y = 0; y < 64; y++) for (let x = 0; x < 64; x++) if (!o[y * 64 + x] && ((x > 0 && o[y * 64 + x - 1]) || (x < 63 && o[y * 64 + x + 1]) || (y > 0 && o[(y - 1) * 64 + x]) || (y < 63 && o[(y + 1) * 64 + x]))) a[y * 64 + x] = dk;      // the dark outline
  return a;
}
let cuAT = 0, cuLastSet = '';
function cuAnimTemplate(b) {      // a template's frames (4 idle, 5 walking, 10 jump or 5 for a punch) replace the frames of the set you are drawing: the first tap in a set gives the same character as the last set, a second tap in it the next character
  if (cuBigOn) return; if (cuFr.some(f => f.some(v => v)) && !cuSure('atpl', b, 'SURE?')) return;
  const n = { idle: 4, walk: 5, jump: 10, m0: 5, m1: 5, m2: 5, m3: 5, x0: 5, x1: 5, x2: 5, x3: 5 }[cuSetKey], st = cuLastSet === cuSetKey ? (cuAT = (cuAT + 1) % 5) : cuAT; cuLastSet = cuSetKey; cuFr = []; for (let i = 0; i < n; i++) cuFr.push(cuSetKey[0] === 'x' ? cuVfxTpl(st, i) : cuTplFrame(st, cuSetKey, i)); cuCur = 0; cuArt = cuFr[0]; cuUndo = []; cuRedo = []; cuDirty = true; cuSel = null; cuShapeStart = null;
  cuSync(); cuPaint(); cuFrSync(); cuFlash(b, (cuSetKey[0] === 'x' ? CU_FXC : CU_TPLS)[st][0]);
}
const CU_FXC = [['WHITE', '#ffffff', '#cfd8ff', '#8f9bd6'], ['BLUE', '#ffffff', '#9fd8ff', '#39a2ff'], ['RED', '#ffffff', '#ff9a7a', '#e0242f'], ['GOLD', '#ffffff', '#ffe9a0', '#ffb347'], ['GREEN', '#ffffff', '#b8ffb0', '#3fbf5a']];      // the 5 colours of the VFX template
function cuVfxTpl(st, i) {      // picture i (0-4) of a hit burst: spokes and a ring that open and fade, in colour st
  const a = new Uint8Array(4096), cs = CU_FXC[st % 5], cols = [1, 2, 3].map(k => cuNearest(parseInt(cs[k].slice(1, 3), 16), parseInt(cs[k].slice(3, 5), 16), parseInt(cs[k].slice(5, 7), 16))), r = 5 + i * 5;
  const px = (x, y, v) => { x = Math.round(x); y = Math.round(y); if (x >= 0 && y >= 0 && x < 64 && y < 64) a[y * 64 + x] = v; };
  for (let k = 0; k < 8; k++) { const an = k * Math.PI / 4 + (i % 2) * 0.2; for (let d = r * 0.35; d <= r; d += 0.7) px(32 + Math.cos(an) * d, 32 + Math.sin(an) * d, cols[d > r * 0.7 ? 2 : d > r * 0.45 ? 1 : 0]); }
  if (i >= 1) for (let k = 0; k < 48; k++) { const an = k * Math.PI / 24; px(32 + Math.cos(an) * r * 0.8, 32 + Math.sin(an) * r * 0.8, cols[Math.min(2, i - 1)]); }
  if (i < 4) for (let y = -2; y <= 2; y++) for (let x = -2; x <= 2; x++) if (Math.abs(x) + Math.abs(y) <= 2) px(32 + x, 32 + y, cols[0]);
  return a;
}
window.__cuTpl = cuTplFrame; window.__palRgb = CU_RGB;

// ---- v1.69 TRACKPAD DRAWING (a finger moves a cursor and a TAP puts the pixel down), AUTO-ZOOM, STABILIZER, PIXEL-PERFECT and the BIG 128 x 128 canvas that SHRINKs into the frame
function cuCancelStroke() { if (cuSt && cuSt.base) cuArt.set(cuSt.base); cuSt = null; cuCursor = null; cuTap = null; cuPath = null; if (cuBigSt) { cuBigCv.getContext('2d').putImageData(cuBigSt.snap, 0, 0); cuBigSt = null; } }
const cuCell2 = () => [Math.floor(cuC[0]), Math.floor(cuC[1])], cuPutTool = (x, y) => cuPut(cuArt, x, y, cuTool === 'era' ? 0 : cuColor + 1);
function cuFollow() {      // the view scrolls so that the cursor stays in its middle half
  if (cuZoom <= 1) return; const w = 64 / cuZoom, m = w * 0.25;
  if (cuC[0] < cuPX + m) cuPX = Math.max(0, Math.floor(cuC[0] - m)); else if (cuC[0] > cuPX + w - m) cuPX = Math.min(64 - w, Math.ceil(cuC[0] - w + m));
  if (cuC[1] < cuPY + m) cuPY = Math.max(0, Math.floor(cuC[1] - m)); else if (cuC[1] > cuPY + w - m) cuPY = Math.min(64 - w, Math.ceil(cuC[1] - w + m));
}
function cuPadDown(e) {
  cuTouchSeen = true; if (!cuAutoDone) { cuAutoDone = true; if (cuZoom < 4) cuSetZoom(4, cuC[0], cuC[1]); }
  const now = performance.now(), dbl = now - cuLastTap < 350 && Math.hypot(e.clientX - cuLastTapPos[0], e.clientY - cuLastTapPos[1]) < 60;
  cuTap = { x: e.clientX, y: e.clientY, lx: e.clientX, ly: e.clientY, t: now, moved: false, paint: false };
  if (dbl && (cuTool === 'pen' || cuTool === 'era')) { cuTap.paint = true; cuPush(); const [x, y] = cuCell2(); cuSt = { base: cuArt.slice(), lx: x, ly: y }; cuPath = [[x, y]]; cuLazy = [cuC[0], cuC[1]]; cuPutTool(x, y); cuSync(); }      // (a tap and then a press that stays down: paint while the finger moves)
  cuPaint();
}
function cuStroke(x, y) {      // paint from the last pixel of this stroke to (x, y); PERFECT takes out the corner pixel of every L-shaped step so lines and curves stay one pixel thick
  const x0 = cuSt.lx, y0 = cuSt.ly, dx = Math.abs(x - x0), dy = -Math.abs(y - y0), sx = x0 < x ? 1 : -1, sy = y0 < y ? 1 : -1; let e = dx + dy, cx = x0, cy = y0, n = 0;
  for (; ;) {
    if (cx !== x0 || cy !== y0) { cuPath.push([cx, cy]); cuPutTool(cx, cy); const L = cuPath.length; if (cuPerfect && !cuBig && L >= 3) { const a = cuPath[L - 3], b = cuPath[L - 2], c = cuPath[L - 1]; if (Math.abs(a[0] - c[0]) === 1 && Math.abs(a[1] - c[1]) === 1 && (a[0] === b[0] || a[1] === b[1]) && (c[0] === b[0] || c[1] === b[1])) { cuArt[b[1] * 64 + b[0]] = cuSt.base[b[1] * 64 + b[0]]; if (cuMirror) cuArt[b[1] * 64 + 63 - b[0]] = cuSt.base[b[1] * 64 + 63 - b[0]]; cuPath.splice(L - 2, 1); } } }
    if ((cx === x && cy === y) || ++n > 300) break; const e2 = 2 * e; if (e2 >= dy) { e += dy; cx += sx; } if (e2 <= dx) { e += dx; cy += sy; }
  }
  cuSt.lx = x; cuSt.ly = y;
}
function cuPadMove(e) {
  const T = cuTap; if (!T) return; const k = cuKk(), dx = (e.clientX - T.lx) / k, dy = (e.clientY - T.ly) / k; T.lx = e.clientX; T.ly = e.clientY;
  if (Math.hypot(e.clientX - T.x, e.clientY - T.y) > 8) T.moved = true;
  cuC[0] = cuClamp(cuC[0] + dx); cuC[1] = cuClamp(cuC[1] + dy); let tmp = null;
  if (T.paint) {
    let [x, y] = cuCell2(); if (cuStable) { const d = Math.hypot(cuC[0] - cuLazy[0], cuC[1] - cuLazy[1]); if (d <= 3) { cuFollow(); cuPaint(); return; } const f = (d - 3) / d; cuLazy = [cuLazy[0] + (cuC[0] - cuLazy[0]) * f, cuLazy[1] + (cuC[1] - cuLazy[1]) * f]; x = Math.floor(cuLazy[0]); y = Math.floor(cuLazy[1]); }      // (STABLE: the brush hangs 3 pixels behind the cursor on a rope, so a shaky finger draws a smooth line)
    if (x !== cuSt.lx || y !== cuSt.ly) cuStroke(x, y);
  } else if (cuShapeStart && T.moved) { tmp = cuArt.slice(); const [x, y] = cuCell2(); if (cuTool === 'line') cuLine(tmp, cuShapeStart[0], cuShapeStart[1], x, y, cuColor + 1); else if (cuTool !== 'sel') cuShape(tmp, cuTool, cuShapeStart[0], cuShapeStart[1], x, y, cuColor + 1); }
  cuFollow(); cuPaint(tmp || undefined);
}
function cuPadUp(e) {
  const T = cuTap; cuTap = null; if (!T) return;
  if (T.paint) { cuSt = null; cuPath = null; cuPaint(); cuFrSync(); return; }
  const now = performance.now(); if (!T.moved && now - T.t < 280) { cuLastTap = now; cuLastTapPos = [e.clientX, e.clientY]; cuTapAction(); }
  cuPaint();
}
function cuTapAction() {      // a short tap puts the tool down at the cursor (pen, eraser, bucket, picker); the line, boxes, ovals and SELECT take two taps: the first corner, then the other
  const [x, y] = cuCell2(), t = cuTool;
  if (t === 'pick') { const v = cuArt[y * 64 + x]; if (v) cuSetColor(v - 1); return; }
  if (t === 'fill') { cuPush(); cuFill(cuArt, x, y, cuColor + 1); cuSync(); cuFrSync(); return; }
  if (t === 'pen' || t === 'era') { cuPush(); cuPutTool(x, y); cuSync(); cuFrSync(); return; }
  if (!cuShapeStart) { cuShapeStart = [x, y]; return; }
  const [x0, y0] = cuShapeStart; cuShapeStart = null;
  if (t === 'sel') { cuSel = { x0: Math.min(x0, x), y0: Math.min(y0, y), x1: Math.max(x0, x), y1: Math.max(y0, y) }; return; }
  cuPush(); if (t === 'line') cuLine(cuArt, x0, y0, x, y, cuColor + 1); else cuShape(cuArt, t, x0, y0, x, y, cuColor + 1); cuSync(); cuFrSync();
}
function cuBigToggle(on) {      // BIG: a 128 x 128 canvas of this frame (it starts as the frame, twice as big) to paint freely with a round brush; SHRINK turns it back into 64 x 64
  cuBigOn = on; cuZoom = 1; cuPX = cuPY = 0; cuSel = null; cuShapeStart = null; cuCursor = null; cuSt = null; cuTap = null;
  if (on) { cuImg(cuArt, cuOff); const g = cuBigCv.getContext('2d'); g.clearRect(0, 0, 128, 128); g.imageSmoothingEnabled = false; g.drawImage(cuOff, 0, 0, 128, 128); cuBigUndo = []; }
}
function cuBigPush() { cuBigUndo.push(cuBigCv.getContext('2d').getImageData(0, 0, 128, 128)); if (cuBigUndo.length > 20) cuBigUndo.shift(); }
function cuBigStroke(x0, y0, x1, y1) {
  const g = cuBigCv.getContext('2d'), er = cuTool === 'era'; g.save(); g.lineCap = g.lineJoin = 'round'; g.lineWidth = er ? 7 : 3; if (er) { g.globalCompositeOperation = 'destination-out'; g.strokeStyle = '#000'; } else g.strokeStyle = CU_PAL[cuColor];
  g.beginPath(); g.moveTo(x0 + 0.5, y0 + 0.5); g.lineTo(x1 + 0.5, y1 + 0.5); g.stroke(); g.restore();
}
function cuBigFill(x, y) {
  const g = cuBigCv.getContext('2d'), im = g.getImageData(0, 0, 128, 128), d = im.data, i0 = (y * 128 + x) * 4, t = [d[i0], d[i0 + 1], d[i0 + 2], d[i0 + 3]], c = CU_RGB[cuColor], st = [[x, y]], seen = new Uint8Array(16384);
  if (t[3] > 250 && Math.abs(t[0] - c[0]) + Math.abs(t[1] - c[1]) + Math.abs(t[2] - c[2]) < 8) return;
  while (st.length) { const [px, py] = st.pop(); if (px < 0 || py < 0 || px > 127 || py > 127 || seen[py * 128 + px]) continue; const i = (py * 128 + px) * 4; if (Math.abs(d[i] - t[0]) + Math.abs(d[i + 1] - t[1]) + Math.abs(d[i + 2] - t[2]) + Math.abs(d[i + 3] - t[3]) >= 60) continue; seen[py * 128 + px] = 1; d[i] = c[0]; d[i + 1] = c[1]; d[i + 2] = c[2]; d[i + 3] = 255; st.push([px + 1, py], [px - 1, py], [px, py + 1], [px, py - 1]); }
  g.putImageData(im, 0, 0);
}
function cuBigDown(e) {
  const [x, y] = cuXY(e); if (x < 0 || y < 0 || x > 127 || y > 127) return; const g = cuBigCv.getContext('2d');
  if (cuTool === 'pick') { const d = g.getImageData(x, y, 1, 1).data; if (d[3] > 100) cuSetColor(cuNearest(d[0], d[1], d[2]) - 1); cuPaint(); return; }
  cuBigPush(); cuDirty = true; cuBigSt = { x0: x, y0: y, lx: x, ly: y, snap: cuBigUndo[cuBigUndo.length - 1] };
  if (cuTool === 'fill') { cuBigFill(x, y); cuBigSt = null; } else if (cuTool !== 'line') cuBigStroke(x, y, x, y);
  cuCursor = e.pointerType === 'touch' && cuOffset ? [Math.max(0, Math.min(127, x)), Math.max(0, Math.min(127, y))] : null; cuPaint(); cuSync();
}
function cuBigMove(e) {
  if (!cuBigSt) return; const [x, y] = cuXY(e); if (e.pointerType === 'touch' && cuOffset) cuCursor = [Math.max(0, Math.min(127, x)), Math.max(0, Math.min(127, y))]; if (x === cuBigSt.lx && y === cuBigSt.ly) { cuPaint(); return; }
  if (cuTool === 'line') { cuBigCv.getContext('2d').putImageData(cuBigSt.snap, 0, 0); cuBigStroke(cuBigSt.x0, cuBigSt.y0, x, y); } else cuBigStroke(cuBigSt.lx, cuBigSt.ly, x, y);
  cuBigSt.lx = x; cuBigSt.ly = y; cuPaint();
}
function cuBigUp(e) { cuPtrs.size; cuBigSt = null; cuCursor = null; cuPaint(); }
function cuShrink() {      // the big picture becomes the 64 x 64 frame: shrunk smoothly, then every pixel takes the nearest of the 66 colours (mostly see-through pixels stay see-through)
  const t = document.createElement('canvas'); t.width = t.height = 64; const g = t.getContext('2d'); g.imageSmoothingEnabled = true; g.imageSmoothingQuality = 'high'; g.drawImage(cuBigCv, 0, 0, 64, 64); const d = g.getImageData(0, 0, 64, 64).data;
  cuPush(); for (let i = 0; i < 4096; i++) cuArt[i] = d[i * 4 + 3] < 110 ? 0 : cuNearest(d[i * 4], d[i * 4 + 1], d[i * 4 + 2]); cuBigToggle(false);
}

// ---- the screens: CUSTOM (3 slots) > a slot > the NAME > the DRAWING
function renderCust() {
  const a = cuLoad(); for (let i = 0; i < 3; i++) { const b = $('cu' + i), d = a[i]; cuThumb(b.querySelector('canvas'), d); b.querySelector('b').textContent = d && d.n ? d.n : 'EMPTY'; b.querySelector('i').textContent = d ? 'EDIT' : 'DRAW'; }
}
function renderAnim() {      // the list after the name: IDLE, WALKING, JUMP and ATTACK, each with its first frame and how many frames it has (ATTACK: how many of its 4 punches have the 5 frames they need)
  for (const [i, k] of [[0, 'idle'], [1, 'walk'], [2, 'jump']]) { const b = $('ca' + i), f = cuChar[k], n = f.filter(a => a.some(v => v)).length; cuImg(f.find(a => a.some(v => v)) || new Uint8Array(4096), b.querySelector('canvas')); b.querySelector('i').textContent = n ? n + (n === 1 ? ' FRAME' : ' FRAMES') : 'EMPTY'; }
  const ms = [0, 1, 2, 3].map(q => cuChar['m' + q].filter(a => a.some(v => v))), any = ms.find(f => f.length), b3 = $('ca3'); cuImg(any ? any[0] : new Uint8Array(4096), b3.querySelector('canvas')); b3.querySelector('i').textContent = any ? ms.filter(f => f.length >= 5).length + '/4 READY' : 'EMPTY';
  const cg = $('ca4').querySelector('canvas').getContext('2d'), ni = [0, 1, 2, 3].reduce((a, q) => a + cuImpacts(cuChar.pg[q], cuChar['m' + q].length).length, 0); cg.clearRect(0, 0, 64, 64);
  for (const [c, x, y, w] of [['#39a2ff', 8, 10, 40], ['#e0242f', 8, 28, 48], ['#39a2ff', 8, 46, 32]]) { cg.fillStyle = c; cg.fillRect(x, y, w, 12); cg.fillStyle = '#000'; cg.fillRect(x, y + 12, w, 2); }      // (a picture of two or three blocks)
  $('ca4').querySelector('i').textContent = ni ? ni + (ni === 1 ? ' IMPACT' : ' IMPACTS') : 'EMPTY';
  $('caName').textContent = cuNameV;
}
function renderAtk() {      // the 4 punches (M1) of the combo: the first frame and the number of frames of each; under 5 frames a punch is not ready and would be left out, like an empty one
  for (let q = 0; q < 4; q++) { const b = $('cm' + q), f = cuChar['m' + q].filter(a => a.some(v => v)), n = f.length; cuImg(f[0] || new Uint8Array(4096), b.querySelector('canvas')); b.querySelector('i').textContent = !n ? 'EMPTY' : n < 5 ? n + ' (NEEDS 5)' : n + ' FRAMES'; }
  for (let q = 0; q < 4; q++) $('cn' + q).value = cuChar.mn[q];
  $('cmName').textContent = cuNameV;
}
function cuSaveChar() { if (!cuChar.idle.some(f => f.some(v => v))) return false; const a = cuLoad(); a[cuSlot] = cuEncode(cuChar.idle, cuNameV, cuChar.walk, cuChar.jump, [cuChar.m0, cuChar.m1, cuChar.m2, cuChar.m3], cuChar.mn, cuChar.pg, [cuChar.x0, cuChar.x1, cuChar.x2, cuChar.x3]); cuStore(a); return true; }      // (false: the IDLE is still empty, nothing is kept)
// ---- v1.75 CODE (blocks for the punches), v1.77 with many more blocks. Every block hangs under the nearest FRAME or IMPACT above it. An IMPACT hurts for its damage on the picture of the FRAME above it (with no good FRAME above it, it does nothing); under an IMPACT, KNOCKBACK, STUN, LAUNCH, GUARD BREAK and BLEED change the hit and VFX, SOUND, SHAKE and HIT STOP play with it; under a FRAME alone the effects play at that picture. SPEED, LUNGE, COST and COOLDOWN are settings of the punch and work anywhere in its script.
let cuTab = 0, cuDrag = null;
const CU_MAXB = 20;      // blocks in one script
const CU_FX = [['SPARK', 'ON THE ENEMY'], ['BURST', 'ON THE ENEMY, TWICE AS BIG'], ['FIST', 'ON YOUR FIST'], ['GROUND', 'ON THE FLOOR UNDER HIM'], ['SHOT', 'FLIES FROM YOUR FIST TO HIM']];      // the 5 VFX presets: where the drawing shows when its IMPACT comes
const CU_SND = [['PUNCH', 'LIGHT BODY BLOW', 'smack', 0], ['HEAVY', 'HEAVY BODY BLOW', 'smack', 3], ['HIT', 'CRACKLING HIT', 'hit', 0], ['BIG HIT', 'BIG CRACKLING HIT', 'hit', 3], ['SWING', 'WHOOSH', 'swing', 0], ['KICK SWING', 'DEEP WHOOSH', 'swing', 3], ['BLOCK', 'FORCEFIELD BOUNCE', 'block'], ['ZAP', 'BLUE CRACKLE', 'stun'], ['BOOM', 'HUGE BOOM', 'rspunch', 0]];      // the SOUND presets: [name, what it is, the game's cue and its number]
const CU_BLK = {      // the blocks, in the order of the list: n = name, g = group (t time, h on the hit, e effects, y you), v = its number boxes [label, least, most, first value], pre = its presets instead
  f: { n: 'FRAME', g: 't', v: [['', 1, 15, 3]] }, i: { n: 'IMPACT', g: 't', v: [['DMG', 1, 99, 5]] },
  k: { n: 'KNOCKBACK', g: 'h', v: [['', 1, 99, 15]] }, t: { n: 'STUN', g: 'h', v: [['SEC', 1, 9, 1]] }, l: { n: 'LAUNCH', g: 'h', v: [['PX', 10, 99, 40]] }, q: { n: 'GUARD BREAK', g: 'h', v: [] }, b: { n: 'BLEED', g: 'h', v: [['DMG', 1, 20, 2], ['SEC', 1, 9, 3]] },
  x: { n: 'VFX', g: 'e', pre: CU_FX }, s: { n: 'SOUND', g: 'e', pre: CU_SND }, w: { n: 'SHAKE', g: 'e', v: [['', 1, 20, 3]] }, h: { n: 'HIT STOP', g: 'e', v: [['MS', 1, 110, 60]] },
  v: { n: 'SPEED', g: 'y', v: [['PICS/S', 1, 60, 20]] }, m: { n: 'LUNGE', g: 'y', v: [['PX', 1, 60, 12]] }, c: { n: 'COST', g: 'y', v: [['%', 1, 100, 20]] }, d: { n: 'COOLDOWN', g: 'y', v: [['SEC', 1, 30, 2]] } };
const CU_GRP = [['t', 'TIME'], ['h', 'ON THE HIT'], ['e', 'EFFECTS'], ['y', 'YOU']];
const cuSpec = t => CU_BLK[t].pre ? [['', 1, CU_BLK[t].pre.length, 1]] : CU_BLK[t].v;
function cuNew(t) { const b = [t, ...cuSpec(t).map(sp => sp[3])]; if (t === 'f') b[1] = Math.max(1, Math.ceil(cuChar['m' + cuTab].length / 2)); return b; }      // a new block with its first values (a FRAME starts on the middle picture)
const cuProgs = d => [0, 1, 2, 3].map(q => (d && Array.isArray(d.pg) && Array.isArray(d.pg[q]) ? d.pg[q] : []).slice(0, CU_MAXB).filter(b => Array.isArray(b) && CU_BLK[b[0]]).map(b => [b[0], ...cuSpec(b[0]).map((sp, k) => Math.max(sp[1], Math.min(sp[2], Math.round(+b[k + 1]) || sp[3])))]));      // the 4 scripts kept with a character: lists of [block letter, its values]
function cuScan(prog, n) {      // reads a script of a punch with n pictures: live = for each block 0 if it does nothing (a FRAME past the last picture, an IMPACT with no good FRAME above it, an effect with nothing to hang under, a change of the hit with no IMPACT above it) else the picture (FRAME, IMPACT) or 1; imp = [picture, damage, the blocks under it] of every IMPACT that works; tm = [picture, blocks] of the pictures that have effects under them; set = the settings of the punch (the last block of each kind wins)
  let f = 0, an = null; const live = [], imp = [], tm = [], set = { v: 20, m: 0, c: 0, d: 0 };
  prog.forEach(([t, a, b]) => {
    const g = CU_BLK[t].g;
    if (t === 'f') { f = a <= n ? a : 0; an = f ? { f, fx: [] } : null; if (an) tm.push(an); live.push(f); }
    else if (t === 'i') { if (f) { an = { f, d: a, fx: [] }; imp.push(an); } else an = null; live.push(f); }
    else if (g === 'h') { const ok = !!an && an.d !== undefined; if (ok) an.fx.push([t, a, b]); live.push(ok ? 1 : 0); }
    else if (g === 'e') { if (an) an.fx.push([t, a, b]); live.push(an ? 1 : 0); }
    else { set[t] = a; live.push(1); }
  });
  return { live, imp: imp.map(x => [x.f, x.d, x.fx]), tm: tm.filter(x => x.fx.length).map(x => [x.f, x.fx]), set };
}
const cuImpacts = (prog, n) => cuScan(prog, n).imp;
function cuStrip() {      // the pictures of the open punch, numbered; the ones an IMPACT lands on say how much it hurts
  const q = cuTab, fr = cuChar['m' + q], hit = {}, st = $('ccFr'); cuImpacts(cuChar.pg[q], fr.length).forEach(([f, d]) => { hit[f] = (hit[f] || 0) + d; }); st.innerHTML = '';
  if (!fr.length) { st.textContent = 'DRAW THIS PUNCH FIRST (5 FRAMES OR MORE)'; return; }
  fr.forEach((a, i) => { const c = document.createElement('div'), cv = document.createElement('canvas'), e = document.createElement('em'); c.className = 'cf' + (hit[i + 1] ? ' hit' : ''); cv.width = cv.height = 64; cuImg(a, cv); e.textContent = hit[i + 1] ? (i + 1) + ': -' + hit[i + 1] : i + 1; c.append(cv, e); st.appendChild(c); });
}
function cuFlags() {      // after a change: the blocks that work, the others are dimmed and say why, and the marks on the pictures
  const q = cuTab, n = cuChar['m' + q].length, prog = cuChar.pg[q], live = cuScan(prog, n).live, nv = cuChar['x' + q].length;
  [...$('ccList').children].forEach((d, i) => {
    const t = prog[i][0], g = CU_BLK[t].g, ok = live[i] > 0 && (t !== 'x' || nv > 0); d.classList.toggle('off', !ok);
    d.querySelector('i').textContent = t === 'f' ? (live[i] ? '' : 'ONLY ' + n + ' PICTURES') : t === 'i' ? (live[i] ? 'DAMAGE, ON FRAME ' + live[i] : 'NEEDS A FRAME ABOVE') : g === 'h' ? (live[i] ? '' : 'NEEDS AN IMPACT ABOVE') : g === 'e' ? (!live[i] ? 'NEEDS A FRAME OR AN IMPACT ABOVE' : t === 'x' && !nv ? 'DRAW IT FIRST' : '') : '';
  });
  cuStrip();
}
const cuSndPlay = k => { const c = CU_SND[k]; snd(c[2], c[3]); };
function cuPreset(b) {      // the button of a VFX or SOUND block: asks which of its presets it uses (a sound plays when you pick it)
  const B = CU_BLK[b[0]], L = $('ccPreL'); L.innerHTML = ''; $('ccPreBox').querySelector('b').textContent = B.n + ' PRESET';
  B.pre.forEach(([nm, ds], k) => { const x = document.createElement('button'); x.innerHTML = '<span></span><small></small>'; x.firstChild.textContent = nm; x.lastChild.textContent = ds; if (b[1] === k + 1) x.className = 'on'; x.addEventListener('click', () => { b[1] = k + 1; if (b[0] === 's') cuSndPlay(k); $('ccPre').classList.remove('on'); renderCode(); }); L.appendChild(x); });
  $('ccPre').classList.add('on');
}
function cuBlock(b) {      // one block of the script: its number boxes, or for VFX and SOUND the preset button (VFX also a DRAW button); a finger drags it by its body, the boxes, buttons and the X work as they are
  const t = b[0], B = CU_BLK[t], d = document.createElement('div'); d.className = 'blk g_' + B.g; d.dataset.t = t;
  let h = '<span>' + B.n + '</span>';
  if (B.pre) h += '<button class="vp"></button>' + (t === 'x' ? '<button class="vd">DRAW</button>' : '');
  else B.v.forEach(sp => { h += (sp[0] ? '<em>' + sp[0] + '</em>' : '') + '<input type="number" inputmode="numeric" min="' + sp[1] + '" max="' + sp[2] + '">'; });
  d.innerHTML = h + '<i></i><u>X</u>';
  if (B.pre) { const vp = d.querySelector('.vp'); vp.textContent = B.pre[b[1] - 1][0]; vp.addEventListener('click', () => cuPreset(b)); if (t === 'x') d.querySelector('.vd').addEventListener('click', () => { audio(); cuEdit('x' + cuTab); }); }
  else d.querySelectorAll('input').forEach((inp, k) => { const sp = B.v[k]; inp.value = b[k + 1]; inp.addEventListener('change', () => { b[k + 1] = Math.max(sp[1], Math.min(sp[2], Math.round(+inp.value) || sp[3])); inp.value = b[k + 1]; cuFlags(); }); });
  d.querySelector('u').addEventListener('click', () => { const p = cuChar.pg[cuTab]; p.splice(p.indexOf(b), 1); renderCode(); });
  d.addEventListener('pointerdown', e => { if (!e.target.closest('input,u,button')) cuDragStart(e, d, b); });
  return d;
}
function cuPalette() {      // the list of blocks on the left, by group (built once)
  const L = $('ccPalL'); L.innerHTML = '';
  CU_GRP.forEach(([g, nm]) => { const h = document.createElement('h6'); h.textContent = nm; L.appendChild(h); Object.keys(CU_BLK).filter(t => CU_BLK[t].g === g).forEach(t => { const d = document.createElement('div'); d.className = 'blk g_' + g; d.dataset.t = t; d.innerHTML = '<span>' + CU_BLK[t].n + '</span>'; d.addEventListener('pointerdown', e => cuDragStart(e, d, null)); L.appendChild(d); }); });
}
function renderCode() {      // the CODE screen: the 4 punches as tabs, the pictures of the open one and its script
  const q = cuTab, tb = $('ccTabs'), ls = $('ccList'); tb.innerHTML = ''; ls.innerHTML = '';
  for (let k = 0; k < 4; k++) { const b = document.createElement('button'); b.textContent = cuChar.mn[k] || 'M1 #' + (k + 1); b.className = k === q ? 'on' : ''; b.addEventListener('click', () => { cuTab = k; renderCode(); }); tb.appendChild(b); }
  cuChar.pg[q].forEach(b => ls.appendChild(cuBlock(b))); $('ccName').textContent = cuNameV; cuFlags();
}
const cuIn2 = (e, el) => { const r = el.getBoundingClientRect(); return e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom; };
function cuDragStart(e, el, b) {      // a block is picked up: b = its data when it is already in the script (it leaves the script while it is carried), null for a new one from the list on the left
  if (cuDrag || e.button > 0) return; e.preventDefault();
  const r = el.getBoundingClientRect(), prog = cuChar.pg[cuTab], gh = el.cloneNode(true), ph = document.createElement('div'), gi = gh.querySelectorAll('input'); if (b) gi.forEach((x, k) => { x.value = b[k + 1]; });
  gh.classList.add('gh'); gh.style.width = r.width + 'px'; document.body.appendChild(gh); ph.className = 'blk ph'; ph.style.height = r.height + 'px';
  cuDrag = { id: e.pointerId, gh, ph, el, orig: b ? prog.indexOf(b) : -1, b: b || cuNew(el.dataset.t), ox: e.clientX - r.left, oy: e.clientY - r.top, x0: e.clientX, y0: e.clientY, moved: false, idx: -1 };
  if (b) { prog.splice(cuDrag.orig, 1); el.style.display = 'none'; }
  cuDragMove(e); addEventListener('pointermove', cuDragMove); addEventListener('pointerup', cuDragEnd); addEventListener('pointercancel', cuDragEnd);
}
function cuDragMove(e) {
  const D = cuDrag; if (!D || e.pointerId !== D.id) return; if (Math.hypot(e.clientX - D.x0, e.clientY - D.y0) > 6) D.moved = true;
  D.gh.style.left = (e.clientX - D.ox) + 'px'; D.gh.style.top = (e.clientY - D.oy) + 'px';
  const ls = $('ccList');
  if (cuIn2(e, $('ccWork'))) { D.ph.remove(); const kids = [...ls.children].filter(k => k !== D.el); let idx = 0; for (const k of kids) { const r = k.getBoundingClientRect(); if (e.clientY > r.top + r.height / 2) idx++; } D.idx = idx; ls.insertBefore(D.ph, kids[idx] || null); }      // (over the script: a gap opens where it would go; the places are measured without the gap, or it would jump about under the finger)
  else { D.idx = -1; D.ph.remove(); }
  $('ccPal').classList.toggle('del', D.orig >= 0 && cuIn2(e, $('ccPal')));      // (a block of the script over the list on the left: letting go throws it away)
}
function cuDragEnd(e) {
  const D = cuDrag; if (!D || e.pointerId !== D.id) return; cuDrag = null; removeEventListener('pointermove', cuDragMove); removeEventListener('pointerup', cuDragEnd); removeEventListener('pointercancel', cuDragEnd);
  D.gh.remove(); D.ph.remove(); $('ccPal').classList.remove('del'); const prog = cuChar.pg[cuTab], back = () => { if (D.orig >= 0) prog.splice(D.orig, 0, D.b); };
  if (e.type === 'pointercancel') back();
  else if (D.idx >= 0) { if (prog.length < CU_MAXB) prog.splice(D.idx, 0, D.b); else back(); }      // (a full script takes no more)
  else if (!D.moved) { if (D.orig >= 0) back(); else if (prog.length < CU_MAXB) prog.push(D.b); }      // (a tap on a block of the list adds it at the end)
  else if (!cuIn2(e, $('ccPal'))) back();      // (let go anywhere else: back where it was; over the list on the left: thrown away)
  renderCode();
}
function cuToList() { if (cuSetKey[0] === 'x') { show('custcode'); renderCode(); } else if (cuSetKey[0] === 'm') { show('custatk'); renderAtk(); } else { show('custanim'); renderAnim(); } }      // (from the drawing back to the list it was opened from)
function cuEdit(k) { cuBigOn = false; cuAutoDone = false; cuShapeStart = null; cuC = [32, 32]; cuSetKey = k; cuFr = cuChar[k].length ? cuChar[k].map(a => a.slice()) : [new Uint8Array(4096)]; cuCur = 0; cuArt = cuFr[0]; cuUndo = []; cuRedo = []; cuDirty = false; cuSt = null; cuSel = null; cuZoom = 1; cuPX = cuPY = 0; cuPtrs.clear(); cuPinch = null; cuIgnore = false; $('cdName').textContent = cuNameV + ' - ' + (k[0] === 'x' ? 'VFX OF M1 #' + (+k[1] + 1) : k[0] === 'm' ? 'M1 #' + (+k[1] + 1) + (cuChar.mn[+k[1]] ? ' ' + cuChar.mn[+k[1]] : '') : { idle: 'IDLE', walk: 'WALKING', jump: 'JUMP' }[k]); show('custdraw'); cuLayout(); cuSync(); cuPaint(); cuFrSync(); }
function customBack() {      // the Android back button inside CUSTOM: the drawing asks "SURE?" before it is thrown away; true when it was used
  if (state === 'custdraw') { if (cuDirty && !cuSure('back', $('cdBack'), 'SURE?')) return true; cuToList(); return true; }
  if (state === 'custcode') { if ($('ccPre').classList.contains('on')) { $('ccPre').classList.remove('on'); return true; } cuSaveChar(); show('custanim'); renderAnim(); return true; }
  if (state === 'custatk') { cuSaveChar(); show('custanim'); renderAnim(); return true; }
  if (state === 'custanim') { show('cust'); renderCust(); return true; }
  if (state === 'custname') { show('cust'); return true; }
  if (state === 'cust') { show('modes'); return true; }
  return false;
}
(function cuInit() {
  const t = $('cdTools'), pal = $('cdPal');
  for (const [id, lab] of CU_TOOLS) { const b = document.createElement('button'); b.textContent = lab; b.dataset.tool = id; b.addEventListener('click', () => { cuTool = id; cuShapeStart = null; cuSync(); cuPaint(); }); t.appendChild(b); }
  for (const [id, lab] of CU_ACTS) { const b = document.createElement('button'); b.textContent = lab; b.dataset.act = id; if (id === 'delfr' || id === 'templ' || id === 'atpl') b.style.gridColumn = '1 / 3'; b.addEventListener('click', () => cuAct(id, b)); t.appendChild(b); }
  for (let i = 0; i < 15; i++) { const b = document.createElement('button'); b.innerHTML = '<canvas width="64" height="64"></canvas><span></span>'; b.setAttribute('aria-label', 'frame ' + (i + 1)); b.addEventListener('click', () => { if (i < cuFr.length) cuSelect(i); else cuAddFrame(); }); $('cdFr').appendChild(b); }
  setInterval(() => { if (state === 'custdraw') { const pv = $('cdPrev'); cuImg(cuFr[Math.floor(performance.now() / (1000 / IDLE_FPS)) % cuFr.length], pv); const g = pv.getContext('2d'); g.fillStyle = '#ffd34d'; for (let x = 0; x < 64; x += 4) g.fillRect(x, 61, 2, 1); } }, 1000 / IDLE_FPS);      // (the real-size preview plays the frames over and over, as they will play in the game)
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
  $('cuNext').addEventListener('click', () => {      // on to the list of animations (a new slot starts empty, an old one opens its pictures)
    audio(); cuNameV = $('cuName').value.trim().replace(/\s+/g, ' '); if (!cuNameV) return; $('cuName').blur(); const d = cuLoad()[cuSlot];
    cuChar = { idle: d ? cuFrames(d) : [], walk: d ? cuWalkFrames(d) : [], jump: d ? cuJumpFrames(d) : [], m0: cuAtkFrames(d, 0), m1: cuAtkFrames(d, 1), m2: cuAtkFrames(d, 2), m3: cuAtkFrames(d, 3), mn: cuAtkNames(d), pg: cuProgs(d), x0: cuVfxFrames(d, 0), x1: cuVfxFrames(d, 1), x2: cuVfxFrames(d, 2), x3: cuVfxFrames(d, 3) }; show('custanim'); renderAnim();
  });
  $('ca0').addEventListener('click', () => { audio(); cuEdit('idle'); }); $('ca1').addEventListener('click', () => { audio(); cuEdit('walk'); }); $('ca2').addEventListener('click', () => { audio(); cuEdit('jump'); }); $('ca3').addEventListener('click', () => { audio(); show('custatk'); renderAtk(); });
  for (let q = 0; q < 4; q++) $('cm' + q).addEventListener('click', () => { audio(); cuEdit('m' + q); });
  for (let q = 0; q < 4; q++) { const n = $('cn' + q), norm = () => n.value.toUpperCase().replace(/\s+/g, ' ').trim().slice(0, 9); n.addEventListener('input', () => { cuChar.mn[q] = norm(); }); n.addEventListener('change', () => { n.value = cuChar.mn[q] = norm(); cuSaveChar(); }); }      // (a name is kept as you type, written to the phone when the box is left)
  $('cmBack').addEventListener('click', () => { cuSaveChar(); show('custanim'); renderAnim(); });
  $('ca4').addEventListener('click', () => { audio(); cuTab = 0; $('ccPre').classList.remove('on'); show('custcode'); renderCode(); });
  $('ccPreX').addEventListener('click', () => $('ccPre').classList.remove('on'));
  $('ccBack').addEventListener('click', () => { cuSaveChar(); show('custanim'); renderAnim(); });
  cuPalette();
  $('caBack').addEventListener('click', () => { show('cust'); renderCust(); });
  $('cdDone').addEventListener('click', () => {
    const has = cuFr.some(f => f.some(v => v)), keep = cuFr.filter(f => f.some(v => v));
    if (!has && cuSetKey === 'idle') { cuFlash($('cdDone'), 'DRAW FIRST'); return; }
    cuChar[cuSetKey] = keep; if (!cuSaveChar()) { cuFlash($('cdDone'), 'DO IDLE FIRST'); return; }
    cuDirty = false; audio(); cuToList();
  });
  $('cdBack').addEventListener('click', () => { if (cuDirty && !cuSure('back', $('cdBack'), 'SURE?')) return; cuToList(); });
  addEventListener('resize', () => { if (state === 'custdraw') { cuLayout(); cuPaint(); } });
})();
window.__custom = () => ({ c: cuC.slice(), zoom: cuZoom, big: cuBigOn, pal: CU_PAL.length, slots: cuLoad(), art: cuArt, frames: cuFr.length, cur: cuCur, tool: cuTool, color: cuColor, cell: cuCell, dirty: cuDirty });

// ---- v1.65 the custom characters in the game: FREE PLAY (the fighter select screen) has a small card for each drawn slot; in the match the character stands on its idle frames (up to 15, at the speed of the others) and does nothing: it cannot move, attack or block yet (whatever you press is dropped)
let cuPh = 0, cuJumpAt = -1, cuAtkAt = -1, cuAtkK = 0, cuCmb = 0, cuCmbBy = 0, cuFired = 0, cuFiredT = 0, cuMs = 50, cuLunged = 0, cuCd = [0, 0, 0, 0], cuBleed = null, cuVfx = [];      // (the jump, the punch being thrown (which of the 4, since when), the next punch of the combo and until when it goes on)
const cuMe = () => !!vs && typeof vs.me === 'string' && vs.me.slice(0, 2) === 'cu';
const CU_GAME = [null, null, null];      // for each slot { name, frames: 64 x 64 canvases }, made again every time the select screen opens
function cuSelRefresh() {
  const row = $('selCu'), a = cuLoad(); row.innerHTML = ''; for (let i = selPv.length - 1; i >= 0; i--) if (selPv[i].who.slice(0, 2) === 'cu') selPv.splice(i, 1); let n = 0;
  a.forEach((d, i) => {
    const mk = f => { const c = document.createElement('canvas'); c.width = c.height = 64; cuImg(f, c); return c; }; CU_GAME[i] = d ? { name: d.n || 'CUSTOM', frames: cuFrames(d).map(mk), walk: cuWalkFrames(d).map(mk), jump: cuJumpFrames(d).map(mk), vfx: [0, 1, 2, 3].map(q => cuVfxFrames(d, q).map(mk)), atk: [0, 1, 2, 3].map(q => cuAtkFrames(d, q).map(mk)), an: cuAtkNames(d).map((nm, q) => nm || 'M1 #' + (q + 1)) } : null; if (CU_GAME[i]) { CU_GAME[i].rdy = [0, 1, 2, 3].filter(q => CU_GAME[i].atk[q].length >= 5); const sc = cuProgs(d).map((pr, q) => cuScan(pr, CU_GAME[i].atk[q].length)); CU_GAME[i].imp = sc.map(x => x.imp); CU_GAME[i].tm = sc.map(x => x.tm); CU_GAME[i].set = sc.map(x => x.set); } if (!d) return; n++;      // (rdy: the punches with the 5 frames they need, an: their names for the ATTACK button, imp, tm, set: what their blocks say, see cuScan)
    const b = document.createElement('button'); b.className = 'card pp'; b.dataset.who = 'cu' + i; b.innerHTML = '<canvas width="64" height="64"></canvas><b></b>'; b.querySelector('b').textContent = CU_GAME[i].name; selPv.push({ g: b.querySelector('canvas').getContext('2d'), who: 'cu' + i });
    b.addEventListener('click', () => { NAMES['cu' + i] = CU_GAME[i].name; startPractice('cu' + i); }); row.appendChild(b);
  });
  $('selCuLab').style.display = n ? '' : 'none'; row.style.display = n ? '' : 'none';
}
const cuIdleCv = (who, now) => { const g = CU_GAME[+who.slice(2)]; return g ? g.frames[Math.floor(now / (1000 / IDLE_FPS)) % g.frames.length] : null; };
const CU_REACH = 36;      // how far in front of its hips an IMPACT reaches (the punches of the others reach 23 to 34)
function cuHit(dmg, now, o) {      // an IMPACT of a custom punch: the enemy takes exactly dmg when he is in front of the fighter, within arm's reach and can be touched (the rules of the others' punches: not the smiley form, not folded up, on the floor, flat or dodging; a blocker blocks it unless GUARD BREAK); o = what the blocks under the impact ask for (knock, stun, launch, gb, bleed [damage, seconds]); true when it landed
  o = o || {};
  if (!dummy || dummy.ko >= 0 || dummy.cap || now - dummy.born < 600 || vs.ph !== 'fight') return false;
  if (dummy.vform && dummy.vform !== 'verity') { say('IMMUNE', dummy.x, '#ffe9a0', 8, now); return false; }
  if ((dummy.vact && dummy.vact.type === 'crouch') || now < (dummy.down || 0) || (dummy.cact && dummy.cact.flat) || now < (dummy.dodgeUntil || 0)) { say('MISS', dummy.x, '#9fd8ff', 8, now); return false; }
  const gap = dummy.x - wx; if (gap > CU_REACH || gap < -3) return false;
  const blk = dBlocks() && gap > 0 && now - dummy.rxAt >= RX_DUR[dummy.rx];
  if (blk && !o.gb) { dummy.counter = now; dummy.vx += 3; shakeUntil = now + 70; shakeAmp = 1; say('BLOCKED', dummy.x, '#9fd8ff', 8, now); snd('block'); return false; }
  if (now > hits.until) { hits.n = 0; hits.dmg = 0; hits.seq = 0; } hits.n++; hits.dmg += dmg; hits.until = now + COMBO_WIN; hits.last = now; hits.bonus = 0; vs.bestCmb = Math.max(vs.bestCmb | 0, hits.n);      // (the combo counter counts it)
  dummy.hp = Math.max(0, dummy.hp - dmg); dummy.hitAt = now; dummy.vx += o.knock ? o.knock * 6 : Math.min(120, 9 + dmg * 2); shakeUntil = now + 110; shakeAmp = dmg >= 20 ? 4 : 2; if (!airUp(dummy)) { dummy.rx = (Math.random() * 10) | 0; dummy.rxAt = now; }
  say('' + dmg, dummy.x, popCol(), 8, now); spark(dummy.x, gy - 26, dmg >= 20 ? 12 : 7, ['#ffffff', '#ffe9a0', '#7fc4ff'], dmg >= 20, 1); snd('smack', dmg >= 20 ? 3 : dmg >= 10 ? 1 : 0);
  if (blk) say('GUARD BREAK', dummy.x, '#ffd34d', 8, now + 90);
  if (o.stun) { const ms = o.stun * 1000; dummy.stunUntil = Math.max(dummy.stunUntil || 0, now + ms); if (dummy.mode === 'fighter' && !dummy.cact && !dummy.vact) { dummy.ai = 'rest'; dummy.aiAt = now; dummy.restFor = ms; dummy.chain = 0; dummy.hitDone = true; } say('STUN', dummy.x, '#59b8ff', 8, now + 60); snd('stun'); }      // (frozen as long as he is stunned, like the free counter's STUN)
  if (o.launch && (!dummy.air || dummy.air.kind === 'bounce')) { dummy.air = airMake(now, 0, Math.sqrt(2 * AIR_G * o.launch), AIR_G, 'up'); dummy.rx = AIR_RX; dummy.rxAt = now; }      // (thrown up like the UPPERCUT: o.launch px high at the top)
  if (o.bleed) cuBleed = { who: dummy, until: now + o.bleed[1] * 1000, next: now + 1000, d: o.bleed[0] };
  if (dummy.hp <= 0) koDummy(now);
  return true;
}
function cuBleedStep(now) {      // BLEED: every second of its time he loses its damage
  const B = cuBleed; if (!B) return; if (B.who !== dummy || dummy.ko >= 0 || vs.ph !== 'fight') { cuBleed = null; return; }
  while (B.next <= B.until && now >= B.next) { B.next += 1000; dummy.hp = Math.max(0, dummy.hp - B.d); say('' + B.d, dummy.x, '#ff3a4a', 8, now); if (dummy.hp <= 0) { koDummy(now); cuBleed = null; return; } }
  if (now >= B.until) cuBleed = null;
}
function cuFx(fx, now, hit, vf) {      // the effects of an impact or of a picture: VFX, SOUND, SHAKE and HIT STOP (hit: the impact landed)
  for (const [t, a] of fx) {
    if (t === 'x') { if (vf.length) cuVfx.push({ fr: vf, pre: a, at: now, hit, x0: wx, ex: dummy ? dummy.x : wx + 40 }); }
    else if (t === 's') cuSndPlay(a - 1);
    else if (t === 'w') { shakeAmp = now < shakeUntil ? Math.max(shakeAmp, a) : a; shakeUntil = Math.max(shakeUntil, now + 200); }
    else if (t === 'h') hitStop(a);
  }
}
function cuImpact(im, now, vf) {      // an IMPACT comes: the hit with what the blocks under it ask for, then their effects
  const o = {}; for (const [t, a, b] of im[2]) { if (t === 'k') o.knock = a; else if (t === 't') o.stun = a; else if (t === 'l') o.launch = a; else if (t === 'q') o.gb = true; else if (t === 'b') o.bleed = [a, b]; }
  cuFx(im[2], now, cuHit(im[1], now, o), vf);
}
function cuPunch(g, now) {      // the punch being thrown: its time ap (0 to 1, -1 = none), the LUNGE, and every picture effect and IMPACT when its picture comes up; it ends after the last picture
  if (cuAtkAt < 0 || !g) return -1;
  const n = g.atk[cuAtkK].length, ap = (now - cuAtkAt) / (n * cuMs), fi = ap >= 1 ? n : Math.floor(ap * n) + 1, im = g.imp[cuAtkK], tm = g.tm[cuAtkK], lg = g.set[cuAtkK].m;
  if (lg) { const tg = lg * Math.min(1, ap); wx += tg - cuLunged; cuLunged = tg; }
  for (let j = 0; j < tm.length; j++) if (!(cuFiredT >> j & 1) && tm[j][0] <= fi) { cuFiredT |= 1 << j; cuFx(tm[j][1], now, false, g.vfx[cuAtkK]); }
  for (let j = 0; j < im.length; j++) if (!(cuFired >> j & 1) && im[j][0] <= fi) { cuFired |= 1 << j; cuImpact(im[j], now, g.vfx[cuAtkK]); }
  if (ap >= 1) { cuAtkAt = -1; cuCmbBy = now + 700; return -1; }
  return ap;
}
const CU_FXD = [300, 450, 300, 400, 450];      // how long each VFX preset plays (ms), the pictures spread over it
function cuDrawVfx(now, cx) {      // the VFX of the impacts: preset 1 on the enemy, 2 on him twice as big, 3 on the fighter's fist, 4 on the floor under him (1.5 times), 5 flying from the fist to him (or 80 px ahead); an enemy the impact did not reach gets presets 1, 2 and 4 on the fist instead; the last part fades
  cuVfx = cuVfx.filter(v => now - v.at < CU_FXD[v.pre - 1]);
  for (const v of cuVfx) {
    const u = (now - v.at) / CU_FXD[v.pre - 1], img = v.fr[Math.min(v.fr.length - 1, Math.floor(u * v.fr.length))], fist = v.x0 + 26, k = v.pre === 2 ? 2 : v.pre === 4 ? 1.5 : 1;
    let X = v.pre === 3 || (!v.hit && v.pre !== 5) ? fist : v.ex - 4; if (v.pre === 5) X = fist + (v.hit ? v.ex - 4 - fist : 80) * (1 - Math.pow(1 - u, 2));
    const Y = v.pre === 4 && v.hit ? gy + 2 - 32 * k : gy - 30; ctx.globalAlpha = u > 0.7 ? (1 - u) / 0.3 : 1; ctx.drawImage(img, Math.round(cx + X - wx - 32 * k), Math.round(Y - 32 * k), 64 * k, 64 * k); ctx.globalAlpha = 1;
  }
}
function customScene(now, dt) {      // one frame of a match with a CUSTOM character as the player: it stands on its idle frames, walks on its walking frames, jumps on its jump frames and plays its punches when ATTACK is pressed (the IMPACT blocks of its CODE hurt the enemy; the other moves are not there yet); the enemy, the HUD and the effects are the shared ones
  const el = Math.max(0, now - spawnAt), t = Math.min(1, el / 900), e = 1 - Math.pow(1 - t, 3), cx = Math.round(VW / 2), g = CU_GAME[+vs.me.slice(2)]; setDomUI(now);
  const ctl = t >= 1 && now >= pStun && vs.ph === 'fight', jmp = jumpReq, atk = atkReq; jumpReq = atkReq = false;      // (it answers the buttons only when it is there, not stunned and in the FIGHT)
  if (t < 1) { cuJumpAt = cuAtkAt = -1; cuCmb = 0; cuCmbBy = 0; cuFired = cuFiredT = 0; cuVfx = []; cuBleed = null; cuCd = [0, 0, 0, 0]; }
  if (jmp && ctl && g && g.jump.length && cuJumpAt < 0 && cuAtkAt < 0) { cuJumpAt = now; snd('jump'); }
  if (atk && ctl && g && g.rdy.length && cuJumpAt < 0 && cuAtkAt < 0) {      // (ATTACK: the next of its ready punches plays once, if its COOLDOWN is over and its COST can be paid; 20 pictures a second unless SPEED says otherwise; the combo goes on for 0.7 s after a punch)
    if (now > cuCmbBy) cuCmb = 0; const k = g.rdy[cuCmb % g.rdy.length], st = g.set[k];
    if (now < cuCd[k]) say('WAIT', wx, '#9a9aa8', 8, now);
    else if (!st.c || ceSpend(st.c, now)) { cuAtkK = k; cuAtkAt = now; cuFired = cuFiredT = 0; cuLunged = 0; cuMs = 1000 / st.v; cuCd[k] = st.d ? now + st.d * 1000 : 0; cuCmbBy = now + 1e9; cuCmb = (cuCmb + 1) % g.rdy.length; snd('swing', k); }
  }
  const ap = cuPunch(g, now); cuBleedStep(now);
  { const lab = g && g.rdy.length ? g.an[g.rdy[(now > cuCmbBy ? 0 : cuCmb) % g.rdy.length]] : 'ATTACK'; if (lab !== lastLabel) { lastLabel = lab; $('atkl').textContent = lab; } }      // (the ATTACK button shows the name of the punch that comes next)
  let jp = -1, lift = 0; if (cuJumpAt >= 0) { jp = (now - cuJumpAt) / 800; if (jp >= 1) { cuJumpAt = -1; jp = -1; snd('land', 1); } else lift = Math.round(46 * 4 * jp * (1 - jp)); }      // (JUMP: 0.8 s, 46 pixels high, the jump frames play once over it)
  gojoLift = lift;
  const can = g && g.walk.length && ctl && cuAtkAt < 0, dir = can ? ((keyR || padR) ? 1 : 0) - ((keyL || padL) ? 1 : 0) : 0;      // (the only thing it can do: walk, when it has walking frames)
  jumpReq = atkReq = crReq = lpReq = dashReq = ceReq = domReq = senseReq = blockHeld = false; atkHold = -1; teleAt = blkAt = blkEnd = -1; gojoGone = false; atkAt = dgAt = jumpAt = -1; stance = 'stand'; stickCr = false; mode = 'idle';      // (it cannot attack or block yet; gojoLift, set above, makes the enemy's swings miss while it is high in the air)
  if (hurtAt >= 0 && now - hurtAt > 700) { hurtAt = -1; hurtEnd = now; }
  wx += dir * 70 * dt; cuPh = dir ? cuPh + dir * dt * 12 : 0; playerSlide(dt); physCollide(now, dt);
  ctx.save(); shkX = shkY = 0; if (now < shakeUntil && !SET.lite) { shkX = Math.round((Math.random() * 2 - 1) * shakeAmp); shkY = Math.round((Math.random() * 2 - 1) * shakeAmp); ctx.translate(shkX, shkY); }
  ctx.imageSmoothingEnabled = false; drawBackdrop(now); drawSmoke(now, dt); drawBloodFloor(now, dt); drawFoes(now, dt); updatePeds(now, dt); drawPeds(now, dt, 0);
  const af = ap >= 0 ? g.atk[cuAtkK] : null, src = !g ? null : af ? af[Math.min(af.length - 1, Math.floor(ap * af.length))] : jp >= 0 ? g.jump[Math.min(g.jump.length - 1, Math.floor(jp * g.jump.length))] : dir ? g.walk[((Math.floor(cuPh) % g.walk.length) + g.walk.length) % g.walk.length] : g.frames[Math.floor(el / (1000 / IDLE_FPS)) % g.frames.length], x = cx - 32, y = gy - 61 - lift, ry = Math.round(64 * (1 - e));
  { const sw = Math.max(5, Math.round(9 * (1 - lift / 70))), sv = Math.round(sw * 2 / 3); ctx.fillStyle = 'rgba(0,0,0,0.4)'; ctx.fillRect(cx - sw, gy + 3, sw * 2, 2); ctx.fillRect(cx - sv, gy + 2, sv * 2, 1); ctx.fillRect(cx - sv, gy + 5, sv * 2, 1); }
  if (src) { ctx.save(); ctx.beginPath(); ctx.rect(x, y + ry, 64, 64 - ry); ctx.clip(); ctx.globalAlpha = Math.min(1, t * 2); ctx.drawImage(src, x, y); if (hurtAt >= 0 && now - hurtAt < 70) ctx.drawImage(whiteOf(src), x, y); ctx.restore(); }
  drawGiantNow('foe'); cuDrawVfx(now, cx);
  if (t < 1) { const R = 6 + t * 70; ctx.fillStyle = 'rgba(255,225,110,' + (1 - t) + ')'; for (let a = 0; a < 64; a++) { const th = a / 64 * 6.2832; ctx.fillRect(Math.round(cx + Math.cos(th) * R), Math.round(y + 34 + Math.sin(th) * R * 0.45), 1, 1); } ctx.fillStyle = 'rgba(255,255,255,' + Math.max(0, 0.55 - t * 1.8) + ')'; ctx.fillRect(0, 0, VW, VH); }      // (it appears with a ring and a flash, like the others)
  drawDivFx(now); drawSparks(now, dt); drawPeds(now, dt, 1); drawGibs(now); drawPopups(now); drawVs(now, -shkX, -shkY);
  ctx.restore();
  if (now < flashUntil) { ctx.fillStyle = 'rgba(190,225,255,' + (flashA * (flashUntil - now) / flashMs) + ')'; ctx.fillRect(0, 0, VW, VH); }
  if (now < blackUntil) { ctx.fillStyle = 'rgba(0,0,0,' + ((blackUntil - now) / 600).toFixed(2) + ')'; ctx.fillRect(0, 0, VW, VH); }
  drawHits(now);
}
