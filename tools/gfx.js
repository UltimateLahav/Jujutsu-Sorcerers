// ================================================================ v1.153 GFX: what the graphics options do (the page is in tools/mset.js, the numbers live in SET, see the top of tools/template.html).
//   pt particles (0 none .. 3 normal .. 4 many), bgd background detail (0 flat .. 3 full), au auras and shock rings (0 off, 1 only the flames, 2 all), ov screen tints (0 off, 1 half, 2 full), glow (the bloom), trl (motion trails), shd (shadows and light),
//   zoom (the camera, fights and free play), smooth, retro (a fixed 288 x 128 picture with black bars), fps (0 auto, 30 ... 144, 999 unlimited), fpsc (0 off, 1 fps, 2 details).
// The game calls pq() and gfxCap() (how many particles), gfxParts() (the wind), gfxFrame() / gfxPost() / gfxEnd() (every frame), gfxKey() (resize() runs again when it changes: the zoom) and gfxApply() (when an option changes, from msApply).
const GFX_PTK = [0, 0.35, 0.7, 1, 2.2], GFX_KEYS = ['pt', 'bgd', 'au', 'ov', 'glow', 'trl', 'shd'];
const GFX_PRE = [['POTATO', [0, 0, 0, 0, 0, 0, 0]], ['LOW', [1, 1, 1, 1, 0, 0, 0]], ['MEDIUM', [2, 2, 2, 1, 0, 0, 0]], ['HIGH', [3, 3, 2, 2, 0, 0, 0]], ['ULTRA', [4, 3, 2, 2, 2, 2, 2]]];      // (the presets set the seven keys above; HIGH is how the game looked before this version; shake, flash and the rest are yours)
const pq = n => { const k = GFX_PTK[SET.pt]; return k === 1 || n <= 0 ? n : k === 0 ? 0 : Math.max(1, Math.round(n * k)); };      // (how many particles a burst of n makes)
const gfxCap = c => SET.pt === 4 ? Math.round(c * 2.2) : c;      // (and how many of them may live at once)
const gfxParts = rf => Array.from({ length: [0, 0, 14, 30][SET.bgd] }, () => ({ x: rf() * VW, y: rf() * gy, l: 3 + ((rf() * 7) | 0), v: 40 + rf() * 80 }));      // (the wind streaks: none, half, all)
const gfxZoomK = () => !SET.retro && SET.zoom !== 100 && state === 'play' && !story && !(vs && vs.story) ? SET.zoom / 100 : 1;      // (the zoom is for fights and free play, not for the story; the fixed retro size has none)
const gfxKey = () => Math.round(gfxZoomK() * 100) + (SET.retro ? 1000 : 0);
let gfxZ = -1;      // the zoom key resize() used last (-1 until the first resize)
const gfxQ = () => { const i = GFX_PRE.findIndex(p => GFX_KEYS.every((k, j) => SET[k] === p[1][j])); return i < 0 ? 5 : i; };      // which preset the options match (5 = CUSTOM)
function gfxPreset(i) { GFX_KEYS.forEach((k, j) => { SET[k] = GFX_PRE[i][1][j]; }); saveSet(); gfxApply(); buildOpts(); }
const gCss = document.createElement('style');
gCss.textContent = '#gfxSt{position:fixed;right:1vh;top:1vh;z-index:7;display:none;pointer-events:none;white-space:pre;text-align:right;color:#7dff7d;background:rgba(0,0,0,.6);padding:.4vh .8vh;font-size:clamp(7px,1.7vh,10px);line-height:1.5}'
  + '#gbOv{position:fixed;inset:0;z-index:60;background:#06040d;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2vh}#gbOv canvas{width:min(70vw,120vh);image-rendering:pixelated;border:3px solid var(--line,#39305a)}'
  + '#gbOv .gbT{white-space:pre;text-align:center;font-size:clamp(8px,2.4vh,14px);line-height:1.8;color:var(--ink,#fff)}'
  + '#gbMsg{position:fixed;left:50%;bottom:6vh;transform:translateX(-50%);z-index:60;background:rgba(10,6,24,.94);border:3px solid var(--acc,#e0242f);padding:1.2vh 2vh;white-space:pre;text-align:center;font-size:clamp(7px,2vh,11px);line-height:1.7;pointer-events:none}';
document.head.appendChild(gCss);
// ---------------------------------------------------------------- shadows and the glow (the game and the preview of the page use the same two functions)
function gfxShadow(g, cx, gnd, w, air, level) {      // a pixel oval on the floor under a fighter: 3 rows (SIMPLE), 5 softer rows (SOFT), and a pale pool of light round it (SOFT + LIGHT); it shrinks and fades while he is in the air
  const k = Math.max(0.3, 1 - air / 90), W = Math.max(4, Math.round(w * 0.5 * k)), rows = level === 1 ? [[-1, 0.6, 0.3], [0, 1, 0.34], [1, 0.6, 0.3]] : [[-2, 0.4, 0.1], [-1, 0.7, 0.18], [0, 1, 0.26], [1, 0.7, 0.18], [2, 0.4, 0.1]];
  g.save();
  if (level >= 3) { g.globalCompositeOperation = 'lighter'; g.fillStyle = 'rgba(255,230,170,0.07)'; for (const [dy, f] of [[-2, 1.9], [-1, 2.3], [0, 2.5], [1, 2.3], [2, 1.9]]) { const ww = Math.round(W * f); g.fillRect(Math.round(cx - ww / 2), gnd + dy, ww, 1); } g.globalCompositeOperation = 'source-over'; }
  for (const [dy, f, a] of rows) { g.fillStyle = 'rgba(0,0,0,' + (a * k + 0.04).toFixed(2) + ')'; const ww = Math.max(2, Math.round(W * f)); g.fillRect(Math.round(cx - ww / 2), gnd + dy, ww, 1); }
  g.restore();
}
const gCP = Object.getPrototypeOf(ctx), gDI = gCP.drawImage, gFR = gCP.fillRect, gBC = document.createElement('canvas'), gBG = gBC.getContext('2d'), gBloomOk = 'filter' in gBG;
function gfxBloom(src, g, tmpC, tmpG, level) {      // the GLOW: the bright parts of the picture, blurred on a small copy (3 or 4 times smaller: that is the blur), are added back on top of it
  if (!level || !gBloomOk) return;
  const d = level >= 3 ? 3 : 4, w = Math.max(8, Math.ceil(src.width / d)), h = Math.max(8, Math.ceil(src.height / d));
  if (tmpC.width !== w || tmpC.height !== h) { tmpC.width = w; tmpC.height = h; }
  tmpG.globalCompositeOperation = 'copy'; tmpG.imageSmoothingEnabled = true; tmpG.filter = 'brightness(0.85) contrast(2)'; gDI.call(tmpG, src, 0, 0, w, h); tmpG.filter = 'none';
  g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.globalCompositeOperation = 'lighter'; g.globalAlpha = [0, 0.34, 0.5, 0.7][level]; g.imageSmoothingEnabled = true; gDI.call(g, tmpC, 0, 0, src.width, src.height); g.restore();
}
const gfxPost = still => { if (SET.glow && state === 'play' && !still) gfxBloom(cv, ctx, gBC, gBG, SET.glow); };      // (only on a picture that was drawn afresh: in a hit-stop the old picture stays and would glow brighter and brighter)
// ---------------------------------------------------------------- the pictures of the fighters: a trail behind the fast ones and a shadow under them. These two are put on ctx.drawImage only while one of the options is on.
const gTr = [], gHasTf = typeof gCP.getTransform === 'function', gS = { n: 0, t: 0, ms: 0, worst: 0, at: 0, hz: 0, hzAt: -9999, f: 0 };
let gGhost = false;
function gfxDI(img) {
  const A = arguments, n = A.length;
  if (gGhost || state !== 'play' || img === cv || (n !== 3 && n !== 5 && n !== 9)) return gDI.apply(ctx, A);
  const dw = n === 3 ? img.width : n === 5 ? A[3] : A[7], dh = n === 3 ? img.height : n === 5 ? A[4] : A[8];
  if (!(dw >= 40 && dw <= 140 && dh >= 48 && dh <= 100)) return gDI.apply(ctx, A);      // (only the pictures of fighters: a spark or a tile is not 40 x 48 or bigger)
  const dx = n === 9 ? A[5] : A[1], dy = n === 9 ? A[6] : A[2], m = ctx.getTransform(), px = m.a * dx + m.c * dy + m.e, py = m.b * dx + m.d * dy + m.f, now = gS.t;      // (px, py = where it lands on the screen, whatever was moved or flipped before)
  if (SET.trl) {
    let t = null, best = 40; for (const q of gTr) if (q.f !== gS.f) { const d = Math.abs(q.x - px) + Math.abs(q.y - py); if (d < best) { best = d; t = q; } }      // (the same fighter as in the last frames: the nearest track)
    if (!t) { t = { x: px, y: py, h: [], f: gS.f }; gTr.push(t); }
    const life = [0, 110, 170, 260][SET.trl], h = t.h; while (h.length && now - h[0].t > life) h.shift();
    gGhost = true; ctx.save();
    for (const q of h) { if (Math.abs(q.x - px) + Math.abs(q.y - py) < 4) continue; ctx.setTransform(q.m); ctx.globalAlpha = 0.32 * (1 - (now - q.t) / life); gDI.apply(ctx, q.a); }
    ctx.restore(); gGhost = false;
    if (!h.length || Math.abs(h[h.length - 1].x - px) + Math.abs(h[h.length - 1].y - py) >= 4) { h.push({ a: Array.from(A), m, x: px, y: py, t: now }); if (h.length > 14) h.shift(); }
    t.x = px; t.y = py; t.f = gS.f;
  }
  if (SET.shd) { const gnd = gy + 1 + (shkY || 0), air = gnd - (py + m.d * dh - 3); if (air > -12 && air < 130) { ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); gfxShadow(ctx, px + m.a * dw / 2, gnd, dw, Math.max(0, air), SET.shd); ctx.restore(); } }      // (his feet are 3 rows above the bottom of the picture)
  return gDI.apply(ctx, A);
}
function gfxFR(x, y, w, h) {      // the tints over the whole screen in a fight (a see-through fill of the whole picture): off, or half as strong
  if (w >= VW - 2 && h >= VH - 2 && state === 'play') {
    const fs = ctx.fillStyle, ga = ctx.globalAlpha, m = typeof fs === 'string' ? /^rgba\((\d+), (\d+), (\d+), ([\d.]+)\)$/.exec(fs) : null;
    if (ga * (m ? +m[4] : 1) < 0.5 && (m || ga < 1)) { if (!SET.ov) return; ctx.globalAlpha = ga * 0.5; gFR.call(ctx, x, y, w, h); ctx.globalAlpha = ga; return; }
  }
  gFR.call(ctx, x, y, w, h);
}
// ---------------------------------------------------------------- the numbers on the screen (FPS, how long a picture takes, the screen's rate) and the screen's own refresh rate
const gSt = document.createElement('div'); gSt.id = 'gfxSt'; document.body.appendChild(gSt);
function gfxFrame() { gS.t = performance.now(); gS.f++; gS.n++; for (let i = gTr.length - 1; i >= 0; i--) if (gS.f - gTr[i].f > 30) gTr.splice(i, 1); }
function gfxEnd() {
  const now = performance.now(), c = now - gS.t; gS.ms += c; if (c > gS.worst) gS.worst = c;
  if (now - gS.at < 500) return;
  if (SET.fpsc) { const fps = Math.round(gS.n * 1000 / (now - gS.at)), cap = fpsCap(); gSt.textContent = SET.fpsc === 1 ? fps + ' FPS' : 'FPS ' + fps + (cap ? ' (CAP ' + cap + ')' : ' (NO CAP)') + '\nFRAME ' + (gS.ms / Math.max(1, gS.n)).toFixed(1) + ' MS, WORST ' + gS.worst.toFixed(0) + ' MS\nSCREEN ' + (gS.hz || '?') + ' HZ\nPICTURE ' + VW + ' X ' + VH + ', PIXEL ' + S + '\nQUALITY ' + (GFX_PRE[gfxQ()] || ['CUSTOM'])[0]; if (SET.fpsc === 2 && now - gS.hzAt > 4000) { gS.hzAt = now; gfxMeasure(); } }
  gS.n = 0; gS.ms = 0; gS.worst = 0; gS.at = now;
}
function gfxMeasure(cb) {      // how many pictures a second the SCREEN really shows: 0.6 s of requestAnimationFrame calls (the screen's rate, not the game's; a very busy phone shows less)
  let n = 0, t0 = 0; const f = t => { if (!t0) t0 = t; else n++; if (t - t0 >= 600) { gS.hz = Math.round(n * 1000 / (t - t0)); if (cb) cb(gS.hz); } else requestAnimationFrame(f); }; requestAnimationFrame(f);
}
const gfxMaxHz = () => { try { return window.AndroidApp && window.AndroidApp.maxRefresh ? window.AndroidApp.maxRefresh() : 0; } catch { return 0; } };      // (the app tells the fastest rate the screen offers; 0 = a browser or an older app)
let gHzWant = -1;
function gfxRefresh() {      // 72 FPS and more and UNLIMITED ask Android for a fast screen mode (without it many phones keep an app at 60 Hz); everything else lets Android choose
  const want = SET.lite ? 0 : SET.fps === 999 ? 1000 : SET.fps >= 72 ? SET.fps : 0; if (want === gHzWant) return; const first = gHzWant < 0; gHzWant = want; if (first && !want) return;      // (nothing to ask for at the first start with the default)
  try { if (window.AndroidApp && window.AndroidApp.setRefresh) window.AndroidApp.setRefresh(want); } catch { /* an older app: nothing to ask for */ }
}
function gfxApply() {
  if ((SET.trl || SET.shd) && gHasTf) ctx.drawImage = gfxDI; else { delete ctx.drawImage; gTr.length = 0; }      // (the trail and the shadow need ctx.getTransform: an old WebView goes without them)
  if (SET.ov < 2) ctx.fillRect = gfxFR; else delete ctx.fillRect;
  cv.style.imageRendering = SET.smooth ? 'auto' : '';
  gSt.style.display = SET.fpsc ? 'block' : 'none';
  gfxRefresh();
  if (parts.length !== [0, 0, 14, 30][SET.bgd]) parts = gfxParts(Math.random);
  if (gfxZ >= 0 && gfxZ !== gfxKey()) resize();
}
function gfxWarn() {      // what the options cost, in words (the page shows it under the tools)
  const w = [], mx = gfxMaxHz();
  if (SET.fps === 999) w.push('UNLIMITED: THE GAME DRAWS AS MANY PICTURES AS THE SCREEN CAN SHOW' + (mx ? ' (YOURS: UP TO ' + mx + ' HZ)' : '') + '. THIS USES THE MOST BATTERY AND CAN MAKE THE PHONE WARM.');
  else if (SET.fps >= 72) w.push(SET.fps + ' FPS ' + (mx && mx < SET.fps ? 'IS MORE THAN YOUR SCREEN CAN SHOW (' + mx + ' HZ): YOU GET ' + mx + '.' : 'NEEDS A FAST SCREEN AND USES MORE BATTERY.'));
  if (SET.fps === 45 || SET.fps === 72) w.push(SET.fps + ' FPS CAN LOOK A LITTLE UNEVEN: IT DOES NOT FIT EVENLY INTO A 60 OR 120 HZ SCREEN.');
  if (SET.lite && SET.fps) w.push('THE BATTERY SAVER WINS: IT KEEPS THE GAME AT 30 FPS.');
  if (SET.glow || SET.trl || SET.shd || SET.pt === 4) w.push('GLOW, TRAILS, SHADOWS AND MANY PARTICLES ARE HEAVY: ON AN OLDER PHONE THE GAME CAN DROP BELOW 30 FPS. TRY TEST MY PHONE.');
  if (SET.glow && !gBloomOk) w.push('GLOW DOES NOTHING HERE: THIS PHONE DOES NOT SUPPORT IT.');
  if (SET.retro) w.push('FIXED RETRO SIZE SHOWS BLACK BARS WHEN THE SCREEN IS NOT THE SAME SHAPE. THE CAMERA ZOOM IS OFF WHILE IT IS ON.');
  else if (SET.zoom !== 100) w.push('THE ZOOM WORKS IN FIGHTS AND FREE PLAY ONLY, NOT IN THE STORY.');
  if (SET.smooth) w.push('SMOOTHING BLURS THE PIXELS ON PURPOSE.');
  return w;
}
const gfxInfo = () => { const mx = gfxMaxHz(); return 'YOUR SCREEN: ' + (gS.hz ? gS.hz + ' HZ NOW' : 'MEASURING...') + (mx ? ', UP TO ' + mx + ' HZ' : '') + '. PICTURE: ' + VW + ' X ' + VH + ' PIXELS, EACH ' + S + ' ON THE SCREEN.\nHZ = HOW MANY PICTURES A SECOND THE SCREEN CAN SHOW.'; };
// ---------------------------------------------------------------- TEST MY PHONE: a 5 second test that draws more and more (pictures, glows, trails, a bloom pass) and counts how many pictures a second the phone keeps up with
function gfxBench(done) {      // 6 steps of 0.8 s; a step passes when the phone still shows (nearly) its screen's whole rate. done(0 to 4, the screen's rate) = the preset that fits, done(-1) = cancelled
  if (document.getElementById('gbOv')) return;
  const ov = document.createElement('div'), c = document.createElement('canvas'), tx = document.createElement('div'), W = Math.max(160, VW), H = Math.max(80, VH);
  ov.id = 'gbOv'; tx.className = 'gbT'; c.width = W; c.height = H; ov.appendChild(c); ov.appendChild(tx); document.body.appendChild(ov);
  const g = c.getContext('2d'), sp = document.createElement('canvas'), tmpC = document.createElement('canvas'), tmpG = tmpC.getContext('2d');
  sp.width = sp.height = 32; { const q = sp.getContext('2d'); for (let i = 0; i < 40; i++) { q.fillStyle = 'hsl(' + (i * 37 % 360) + ',70%,' + (45 + i % 4 * 10) + '%)'; q.fillRect(i * 7 % 28, i * 11 % 28, 4 + i % 5, 4 + i % 3); } }
  const LV = [[80, 0, 0, 0], [220, 6, 0, 0], [420, 12, 1, 0], [650, 18, 1, 1], [900, 26, 1, 1], [1300, 36, 1, 1]], PER = 800, WARM = 450, iv = [], pick = p => p <= 0 ? 0 : p === 1 ? 1 : p === 2 ? 2 : p <= 4 ? 3 : 4;      // (a level = pictures, glows, bloom, trails)
  let lv = -1, t0 = 0, last = 0, lvT = 0, pass = 0, fails = 0, hz = 60, stop = false;
  const med = a => { const s = a.slice().sort((x, y) => x - y); return s[s.length >> 1] || 16.7; }, finish = id => { if (stop) return; stop = true; ov.remove(); done(id, hz); };
  ov.addEventListener('pointerdown', () => finish(-1));
  const draw = (k, t) => {
    const [n, gl, bl, tr] = LV[Math.max(0, k)]; g.globalAlpha = 1; g.fillStyle = '#0d0a17'; g.fillRect(0, 0, W, H);
    for (let i = 0; i < n; i++) { g.globalAlpha = 0.6 + (i % 3) * 0.2; const s = 24 + i % 3 * 6; g.drawImage(sp, (i * 53 + Math.sin(t / 300 + i) * 6 + W) % W, (i * 29 + Math.cos(t / 280 + i) * 5 + H) % H, s, s); }
    g.globalAlpha = 1;
    for (let i = 0; i < gl; i++) { const x = (i * 71) % W, y = (i * 37) % H, gr = g.createRadialGradient(x, y, 0, x, y, 30); gr.addColorStop(0, 'rgba(120,220,255,0.7)'); gr.addColorStop(1, 'rgba(120,220,255,0)'); g.fillStyle = gr; g.fillRect(x - 30, y - 30, 60, 60); }
    if (tr) for (let i = 0; i < 40; i++) { g.globalAlpha = 0.2; g.drawImage(sp, (i * 41 + t / 8) % W, (i * 23) % H, 28, 28); g.globalAlpha = 0.3; g.fillStyle = '#000'; g.fillRect((i * 41) % W, (i * 23 + 28) % H, 20, 2); }
    g.globalAlpha = 1; if (bl) gfxBloom(c, g, tmpC, tmpG, 2);
  };
  const frame = t => {
    if (stop) return; requestAnimationFrame(frame);
    if (last) iv.push(t - last); last = t;
    if (lv < 0) { tx.textContent = 'TESTING YOUR PHONE...\nTAP TO CANCEL'; draw(0, t); if (!t0) t0 = t; if (t - t0 > WARM) { hz = Math.round(1000 / med(iv)); iv.length = 0; lv = 0; lvT = t; } return; }
    draw(lv, t); tx.textContent = 'TESTING YOUR PHONE...\nTAP TO CANCEL\n' + Math.min(99, Math.round((lv + (t - lvT) / PER) / LV.length * 100)) + '%';
    if (t - lvT >= PER) {
      const ok = 1000 / med(iv) >= Math.min(54, hz * 0.9); iv.length = 0;
      if (ok) { pass++; fails = 0; } else if (++fails >= 2) { finish(pick(pass)); return; }
      if (++lv >= LV.length) { finish(pick(pass)); return; } lvT = t;
    }
  };
  requestAnimationFrame(frame);
}
function gfxBenchApply(id, auto) {      // the answer of the test: the preset is set (an automatic test says so in a message)
  gfxPreset(id); if (!auto) return; const m = document.createElement('div'); m.id = 'gbMsg'; m.textContent = 'GRAPHICS SET TO ' + GFX_PRE[id][0] + '\nCHANGE IT IN SETTINGS, GRAPHICS'; document.body.appendChild(m); setTimeout(() => m.remove(), 4500);
}
function gfxAuto() {      // once, after the first start with this version: the test runs by itself on the title screen and its preset is applied (not in an automated browser)
  let seen = '1'; try { seen = localStorage.getItem('js_gtest'); } catch { seen = '1'; }
  if (seen || navigator.webdriver) return;
  const go = () => { if (state !== 'title') { setTimeout(go, 2500); return; } try { localStorage.setItem('js_gtest', '1'); } catch { /* storage blocked */ } gfxBench(id => { if (id >= 0) gfxBenchApply(id, true); }); };
  setTimeout(go, 2500);
}
// ---------------------------------------------------------------- the little live picture at the top of the graphics page: a fighter runs back and forth and jumps and throws sparks; every option changes it at once
let gPrevId = 0;
function gfxPreview(c) {
  const g = c.getContext('2d'), id = ++gPrevId, tC = document.createElement('canvas'), tG = tC.getContext('2d'), W = c.width, H = c.height, gnd = H - 10, trail = [], sp = [], t0 = performance.now();
  let next = 400, shake = 0;
  const loop = t => {
    if (id !== gPrevId || !c.isConnected || !c.offsetParent) return;      // (the page was rebuilt or left: the loop ends)
    requestAnimationFrame(loop);
    const e = t - t0, x = W * 0.5 + Math.sin(e / 900) * W * 0.3, dir = Math.cos(e / 900) > 0 ? 1 : -1, air = Math.max(0, Math.sin(e / 450) * 10), by = Math.round(gnd - air);
    if (e > next) { next = e + 1300; shake = SET.shk / 100 * 2; for (let i = pq(14); i > 0; i--) sp.push({ x: x + dir * 8, y: gnd - 12 - air, vx: dir * (10 + Math.random() * 30), vy: -20 - Math.random() * 30, b: e }); }
    g.save(); g.fillStyle = SET.bgd === 0 ? '#1a1530' : '#0d0a17'; g.fillRect(0, 0, W, H);
    if (shake > 0.05) g.translate(Math.round((Math.random() * 2 - 1) * shake), 0); shake *= 0.8;
    if (SET.bgd >= 1) { g.fillStyle = '#17122a'; for (let i = 0; i < 9; i++) g.fillRect(i * 16 - (e / 90) % 16, gnd - 30 - (i * 7 % 5) * 5, 12, 40); }
    if (SET.bgd >= 2) { g.fillStyle = '#231b3d'; for (let i = 0; i < 6; i++) g.fillRect(i * 26 - (e / 45) % 26, gnd - 18 - (i * 5 % 3) * 4, 16, 30); }
    if (SET.bgd >= 3) { g.fillStyle = 'rgba(220,210,255,0.35)'; for (let i = 0; i < 8; i++) g.fillRect(((i * 37 - e / 12) % W + W) % W, 6 + i * 4, 6, 1); }
    g.fillStyle = '#241c3f'; g.fillRect(-4, gnd, W + 8, H - gnd + 4);
    if (SET.shd) gfxShadow(g, x, gnd + 1, 12, air, SET.shd);
    trail.push([x, by, e]); while (trail.length && e - trail[0][2] > 260) trail.shift();
    if (SET.trl) { const life = [0, 110, 170, 260][SET.trl]; for (const q of trail) { const a = 0.32 * (1 - (e - q[2]) / life); if (a <= 0 || Math.abs(q[0] - x) < 4) continue; g.globalAlpha = a; g.fillStyle = '#f2eefc'; g.fillRect(Math.round(q[0] - 3), q[1] - 14, 6, 14); } g.globalAlpha = 1; }
    g.fillStyle = '#f2eefc'; g.fillRect(Math.round(x - 3), by - 14, 6, 6); g.fillStyle = '#39a2ff'; g.fillRect(Math.round(x - 3), by - 8, 6, 5); g.fillStyle = '#1b1e2c'; g.fillRect(Math.round(x - 3), by - 3, 2, 3); g.fillRect(Math.round(x + 1), by - 3, 2, 3);
    if (SET.au >= 1) for (let i = 0; i < 6; i++) { g.fillStyle = i % 2 ? '#6cf3ff' : '#2aa8d8'; g.fillRect(Math.round(x + dir * 5 + Math.sin(e / 60 + i * 2) * 2), Math.round(by - 8 - (e / 40 + i * 3) % 7), 1, 2); }
    if (SET.au >= 2) { const rr = (e % 1300) / 1300; g.strokeStyle = 'rgba(160,230,255,' + (0.7 * (1 - rr)).toFixed(2) + ')'; g.strokeRect(Math.round(x - rr * 22) + 0.5, gnd - 4 - rr * 3 + 0.5, Math.round(rr * 44), 3 + rr * 3); }
    for (let i = sp.length - 1; i >= 0; i--) { const q = sp[i], a = (e - q.b) / 1000; if (a > 0.55) { sp.splice(i, 1); continue; } g.fillStyle = i % 3 ? '#ffd34d' : '#ffffff'; g.fillRect(Math.round(q.x + q.vx * a), Math.round(q.y + q.vy * a + 120 * a * a), 1, 1); }
    if (SET.ov > 0) { g.fillStyle = 'rgba(200,20,40,' + (SET.ov === 2 ? 0.12 + 0.06 * Math.sin(e / 400) : 0.06).toFixed(2) + ')'; g.fillRect(-4, 0, W + 8, H); }
    g.restore(); gfxBloom(c, g, tC, tG, SET.glow);
  };
  requestAnimationFrame(loop);
}
window.__gfxReady = 1; gfxAuto();
