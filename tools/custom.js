// ---------------------------------------------------------------- v1.64 CUSTOM: draw your own character (this file is spliced into template.html by build_html.py, in place of the marker line after the continuation's)
// CUSTOM is a card on the mode screen. It shows 3 slots; a slot asks for a NAME and then for a DRAWING: a 64 x 64 pixel picture like the people of the game, made with a pencil, an eraser, a bucket, a picker and a line, with mirror drawing, a grid, undo / redo and a 16-bit style palette of 66 colours. The drawings are kept on the device (localStorage 'js_custom'): for each slot the name, the colours that are used and one character for each of the 4096 pixels (0 = see-through). For now they are only drawn and saved.
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
function cuEncode(art, name) {      // the name, the colours that are used and one character per pixel (48 + the number of its colour in that list; '0' = see-through)
  const used = [], idx = new Map(); let s = '';
  for (let i = 0; i < 4096; i++) { const v = art[i]; if (!v) { s += '0'; continue; } let k = idx.get(v); if (!k) { used.push(CU_PAL[v - 1]); k = used.length; idx.set(v, k); } s += String.fromCharCode(48 + k); }
  return { n: name, p: used, a: s };
}
function cuDecode(d) {      // the 4096 colour numbers (0 = see-through, otherwise 1 + the place in CU_PAL) of a kept drawing; anything damaged is simply left empty
  const art = new Uint8Array(4096); if (!d || typeof d.a !== 'string' || !Array.isArray(d.p)) return art;
  for (let i = 0; i < 4096 && i < d.a.length; i++) { const k = d.a.charCodeAt(i) - 48; if (k > 0 && d.p[k - 1]) { const v = CU_PAL.indexOf(d.p[k - 1]); art[i] = v >= 0 ? v + 1 : 0; } }
  return art;
}
function cuThumb(cv, d) {      // a kept drawing on a 64 x 64 canvas (a slot card)
  const g = cv.getContext('2d'); g.clearRect(0, 0, 64, 64); if (!d) return; const art = cuDecode(d), im = g.createImageData(64, 64);
  for (let i = 0; i < 4096; i++) if (art[i]) { const c = CU_RGB[art[i] - 1]; im.data[i * 4] = c[0]; im.data[i * 4 + 1] = c[1]; im.data[i * 4 + 2] = c[2]; im.data[i * 4 + 3] = 255; }
  g.putImageData(im, 0, 0);
}

// ---- the editor
let cuSlot = -1, cuNameV = '', cuArt = new Uint8Array(4096), cuTool = 'pen', cuColor = 1, cuMirror = false, cuGrid = true, cuUndo = [], cuRedo = [], cuDirty = false, cuCell = 4, cuSt = null, cuChk = null, cuGr = null, cuArmed = '', cuArmT = 0;
const cuOff = document.createElement('canvas'); cuOff.width = cuOff.height = 64;
const CU_TOOLS = [['pen', 'PEN'], ['era', 'ERASE'], ['fill', 'FILL'], ['pick', 'PICK'], ['line', 'LINE']];
function cuSure(key, btn, label) {      // a button that needs a second tap within 2.5 s ("SURE?") before it does something that throws work away; true on the second tap
  if (cuArmed === key && performance.now() - cuArmT < 2500) { cuArmed = ''; return true; }
  cuArmed = key; cuArmT = performance.now(); if (btn) { const t0 = btn.dataset.t || btn.textContent; btn.dataset.t = t0; btn.textContent = label; setTimeout(() => { if (btn.dataset.t) { btn.textContent = btn.dataset.t; delete btn.dataset.t; } }, 2500); } return false;
}
function cuFlash(btn, text) { const t0 = btn.dataset.t || btn.textContent; btn.dataset.t = t0; btn.textContent = text; setTimeout(() => { if (btn.dataset.t) { btn.textContent = btn.dataset.t; delete btn.dataset.t; } }, 1400); }
function cuLayout() {      // the board is a whole number of screen pixels for each art pixel, as big as the screen allows
  const c = $('cdCv'), k = Math.max(3, Math.min(Math.floor(innerHeight * 0.82 / 64), Math.floor(innerWidth * 0.46 / 64))); cuCell = k; c.width = c.height = 64 * k; c.style.width = c.style.height = 64 * k + 'px';
  cuChk = document.createElement('canvas'); cuChk.width = cuChk.height = 64 * k; let g = cuChk.getContext('2d'); for (let y = 0; y < 64; y++) for (let x = 0; x < 64; x++) { g.fillStyle = (x + y) & 1 ? '#1f1834' : '#171127'; g.fillRect(x * k, y * k, k, k); }
  cuGr = document.createElement('canvas'); cuGr.width = cuGr.height = 64 * k; g = cuGr.getContext('2d'); for (let i = 0; i <= 64; i++) { g.fillStyle = i % 8 === 0 ? 'rgba(255,255,255,0.28)' : 'rgba(255,255,255,0.10)'; g.fillRect(Math.min(i * k, 64 * k - 1), 0, 1, 64 * k); g.fillRect(0, Math.min(i * k, 64 * k - 1), 64 * k, 1); }
}
function cuPaint(art) {      // the board: the checkerboard of the see-through pixels, the picture, the grid (every 8th line is stronger) and the mirror line; and the real-size preview
  art = art || cuArt; const c = $('cdCv'), g = c.getContext('2d'), k = cuCell, o = cuOff.getContext('2d'), im = o.createImageData(64, 64);
  for (let i = 0; i < 4096; i++) { const v = art[i]; if (v) { const r = CU_RGB[v - 1]; im.data[i * 4] = r[0]; im.data[i * 4 + 1] = r[1]; im.data[i * 4 + 2] = r[2]; im.data[i * 4 + 3] = 255; } }
  o.putImageData(im, 0, 0); g.imageSmoothingEnabled = false; g.drawImage(cuChk, 0, 0); g.drawImage(cuOff, 0, 0, 64 * k, 64 * k);
  if (cuGrid) g.drawImage(cuGr, 0, 0); if (cuMirror) { g.fillStyle = 'rgba(255,211,77,0.75)'; g.fillRect(32 * k - 1, 0, 2, 64 * k); }
  const p = $('cdPrev').getContext('2d'); p.clearRect(0, 0, 64, 64); p.drawImage(cuOff, 0, 0);
}
function cuSync() {      // which tool, toggle and colour is selected
  for (const b of $('cdTools').children) { const t = b.dataset.tool, a = b.dataset.act; b.classList.toggle('sel', t ? t === cuTool : a === 'mirror' ? cuMirror : a === 'grid' ? cuGrid : false); if (a === 'undo') b.disabled = !cuUndo.length; if (a === 'redo') b.disabled = !cuRedo.length; }
  for (const b of $('cdPal').children) b.classList.toggle('sel', +b.dataset.i === cuColor);
}
function cuSetColor(i) { cuColor = i; if (cuTool === 'era' || cuTool === 'pick') cuTool = 'pen'; cuSync(); }
function cuAct(id, b) {
  if (id === 'mirror') { cuMirror = !cuMirror; } else if (id === 'grid') { cuGrid = !cuGrid; }
  else if (id === 'undo') { if (cuUndo.length) { cuRedo.push(cuArt.slice()); cuArt = cuUndo.pop(); } }
  else if (id === 'redo') { if (cuRedo.length) { cuUndo.push(cuArt.slice()); cuArt = cuRedo.pop(); } }
  else if (id === 'clear') { if (!cuSure('clear', b, 'SURE?')) return; cuPush(); cuArt.fill(0); }
  cuSync(); cuPaint();
}
const cuPut = (art, x, y, v) => { if (x < 0 || y < 0 || x > 63 || y > 63) return; art[y * 64 + x] = v; if (cuMirror) art[y * 64 + 63 - x] = v; };
function cuLine(art, x0, y0, x1, y1, v) {      // a line of pixels (Bresenham), mirrored when the mirror is on
  const dx = Math.abs(x1 - x0), dy = -Math.abs(y1 - y0), sx = x0 < x1 ? 1 : -1, sy = y0 < y1 ? 1 : -1; let e = dx + dy, n = 0;
  for (; ;) { cuPut(art, x0, y0, v); if ((x0 === x1 && y0 === y1) || ++n > 400) break; const e2 = 2 * e; if (e2 >= dy) { e += dy; x0 += sx; } if (e2 <= dx) { e += dx; y0 += sy; } }
}
function cuFill(art, x, y, v) {      // the bucket: every pixel joined to (x, y) (up, down, left, right) that has the same colour
  const t = art[y * 64 + x]; if (t === v) return; const st = [[x, y]];
  while (st.length) { const [px, py] = st.pop(); if (px < 0 || py < 0 || px > 63 || py > 63 || art[py * 64 + px] !== t) continue; art[py * 64 + px] = v; st.push([px + 1, py], [px - 1, py], [px, py + 1], [px, py - 1]); }
}
const cuXY = e => { const c = $('cdCv'), r = c.getBoundingClientRect(); return [Math.floor((e.clientX - r.left - c.clientLeft) / cuCell), Math.floor((e.clientY - r.top - c.clientTop) / cuCell)]; };
function cuPush() { cuUndo.push(cuArt.slice()); if (cuUndo.length > 60) cuUndo.shift(); cuRedo.length = 0; cuDirty = true; }
function cuDown(e) {
  e.preventDefault(); const [x, y] = cuXY(e); if (x < 0 || y < 0 || x > 63 || y > 63) return;
  if (cuTool === 'pick') { const v = cuArt[y * 64 + x]; if (v) cuSetColor(v - 1); return; }
  try { $('cdCv').setPointerCapture(e.pointerId); } catch (er) { }
  cuPush(); cuSync();
  if (cuTool === 'fill') { cuFill(cuArt, x, y, cuColor + 1); cuPaint(); return; }
  cuSt = { x0: x, y0: y, lx: x, ly: y, base: cuArt.slice() };
  if (cuTool === 'pen' || cuTool === 'era') { cuPut(cuArt, x, y, cuTool === 'era' ? 0 : cuColor + 1); cuPaint(); }
}
function cuMove(e) {
  if (!cuSt) return; const [x, y] = cuXY(e); if (x === cuSt.lx && y === cuSt.ly) return;
  if (cuTool === 'line') { const t = cuSt.base.slice(); cuLine(t, cuSt.x0, cuSt.y0, x, y, cuColor + 1); cuPaint(t); }      // (the line follows the finger and is only drawn for good when it lets go)
  else { cuLine(cuArt, cuSt.lx, cuSt.ly, x, y, cuTool === 'era' ? 0 : cuColor + 1); cuPaint(); }
  cuSt.lx = x; cuSt.ly = y;
}
function cuUp(e) { if (!cuSt) return; if (cuTool === 'line') { const [x, y] = cuXY(e); cuLine(cuArt, cuSt.x0, cuSt.y0, x, y, cuColor + 1); } cuSt = null; cuPaint(); }

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
  for (const [id, lab] of [['mirror', 'MIRROR'], ['grid', 'GRID'], ['undo', 'UNDO'], ['redo', 'REDO'], ['clear', 'CLEAR']]) { const b = document.createElement('button'); b.textContent = lab; b.dataset.act = id; b.addEventListener('click', () => cuAct(id, b)); t.appendChild(b); }
  CU_PAL.forEach((c, i) => { const b = document.createElement('button'); b.style.background = c; b.dataset.i = i; b.setAttribute('aria-label', 'colour ' + (i + 1)); b.addEventListener('click', () => cuSetColor(i)); pal.appendChild(b); });
  const cv = $('cdCv'); cv.addEventListener('pointerdown', cuDown); cv.addEventListener('pointermove', cuMove); cv.addEventListener('pointerup', cuUp); cv.addEventListener('pointercancel', cuUp);
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
    audio(); cuNameV = $('cuName').value.trim().replace(/\s+/g, ' '); if (!cuNameV) return; $('cuName').blur(); const d = cuLoad()[cuSlot]; cuArt = cuDecode(d); cuUndo = []; cuRedo = []; cuDirty = false; cuSt = null;
    $('cdName').textContent = cuNameV; show('custdraw'); cuLayout(); cuSync(); cuPaint();
  });
  $('cdDone').addEventListener('click', () => {
    if (!cuArt.some(v => v)) { cuFlash($('cdDone'), 'DRAW FIRST'); return; }
    const a = cuLoad(); a[cuSlot] = cuEncode(cuArt, cuNameV); cuStore(a); cuDirty = false; audio(); show('cust'); renderCust();
  });
  $('cdBack').addEventListener('click', () => { if (cuDirty && !cuSure('back', $('cdBack'), 'SURE?')) return; show('cust'); renderCust(); });
  addEventListener('resize', () => { if (state === 'custdraw') { cuLayout(); cuPaint(); } });
})();
window.__custom = () => ({ pal: CU_PAL.length, slots: cuLoad(), art: cuArt, tool: cuTool, color: cuColor, cell: cuCell, dirty: cuDirty });
