// ---------------------------------------------------------------- v1.54 THE MASTER, the last scene of chapter 1 (this file is spliced into template.html by build_html.py, in place of the marker line before drawScene)
// After the Cartoon Cat dies: a dark room. A hooded figure in side close-up (the next big villain) watches a floating cursed screen in front of him that shows THE FIGHT YOU JUST PLAYED: the game records a small copy of its own screen during the fight with the Cat, and the screen replays the last seconds up to the moment the Cat bursts, then dies. Cut to the room: a door opens on a bright corridor, Verity's silhouette stands in it, walks in and closes the door behind him, the dark returns, only the Master's red eye glows: "HELLO MASTER." Then END OF CHAPTER 1.
const MS = { fade: 0.9, burst: 7.0, die: 9.4, dark: 10.2, creak: 11.2, wide: 12.6, open: 13.4, open1: 15.6, walk: 17.6, turn: 21.0, close: 21.6, shut: 23.2, face: 23.7, talk: 25.4, end: 29.8, black: 31.6, card: 33.0 };
const MS_CUTS = [MS.burst, MS.dark, MS.wide, MS.open, MS.walk, MS.close, MS.talk, MS.card], MS_FPS = 20, MS_KEEP = 18000, MS_LINE = 'HELLO MASTER.';
const msBuf = []; let msLast = -1e9, msBurstAt = -1;
function msRecord(now) {      // every 50 ms of the story fight against the Cat (and of its ending cutscene): a small copy of the game's own picture, kept for 18 s (the Cat's ending runs about 9 s after the burst before the scene starts, and the scene needs 7 s of the fight before the burst); the Master's screen plays it back
  if (!vs || !vs.story || vs.foe !== 'cat' || now - msLast < 1000 / MS_FPS - 3) return; msLast = now;
  const c0 = ctx.canvas, w = 120, h = Math.max(8, Math.round(w * c0.height / c0.width)); const f = msBuf.length && now - msBuf[0].t > MS_KEEP ? msBuf.shift() : { c: document.createElement('canvas') };
  if (f.c.width !== w || f.c.height !== h) { f.c.width = w; f.c.height = h; } const g = f.c.getContext('2d'); g.imageSmoothingEnabled = false; g.drawImage(c0, 0, 0, c0.width, c0.height, 0, 0, w, h); f.t = now; f.l = -1; msBuf.push(f);
}
function msFootage(T) {      // the recorded picture that belongs to scene time T (the Cat's burst is at MS.burst): the closest one, or null when there is none
  if (!msBuf.length || msBurstAt < 0) return null; const want = msBurstAt + (T - MS.burst) * 1000; let best = null, bd = 1e9;
  for (let i = 0; i < msBuf.length; i++) { const d = Math.abs(msBuf[i].t - want); if (d < bd) { bd = d; best = msBuf[i]; } }
  return best && (bd < 170 || (want < msBuf[0].t && bd < 1500)) ? best : null;
}
function msLum(f) {      // how bright a recorded picture is (0-1): it lights his face
  if (f.l >= 0) return f.l; const d = f.c.getContext('2d').getImageData(0, 0, f.c.width, f.c.height).data; let s = 0; for (let i = 0; i < d.length; i += 16) s += d[i] + d[i + 1] + d[i + 2]; return f.l = Math.min(1, s / (d.length / 16) / 765 * 2.2);
}
// ---- the pictures: the hooded figure (drawn from curves, made crisp, with a rim of light on the side the screen is on), Verity's silhouette
const msFigC = new Map(), msSilC = new Map();
function msFig(k) {      // the Master in profile, facing right, at k pixels per unit: B = his body (almost black cloth), R = the cold rim the screen throws on his right edge, RL = the warm rim of the door on his back; eye / mouth = places in pixels
  const key = Math.round(k * 1000); let r = msFigC.get(key); if (r) return r;
  const X = x => (x + 34) * k, Y = y => y * k, W = Math.ceil(X(100)), H = Math.ceil(Y(146)), mk = () => { const c = document.createElement('canvas'); c.width = W; c.height = H; return c; };
  const B = mk(), g = B.getContext('2d'), p = new Path2D(), Q = (a, b, x, y) => p.quadraticCurveTo(X(a), Y(b), X(x), Y(y)), L = (x, y) => p.lineTo(X(x), Y(y));
  p.moveTo(X(-34), Y(146)); L(-30, 104); Q(-27, 72, -12, 50); Q(-3, 28, 18, 10); Q(38, -4, 60, 6); Q(76, 14, 82, 32); L(85, 40); Q(80, 43, 73, 44); L(75, 48); L(73, 52); L(76, 56); L(86, 65); L(79, 68); L(80, 71); L(77, 73); L(80, 75); Q(80, 79, 78, 83); Q(72, 88, 64, 91); L(62, 98); Q(66, 108, 74, 120); L(88, 146); p.closePath();
  g.fillStyle = '#0b0912'; g.fill(p);
  const id = g.getImageData(0, 0, W, H), d = id.data, A = new Uint8Array(W * H); for (let i = 0; i < W * H; i++) { A[i] = d[i * 4 + 3] >= 128 ? 1 : 0; d[i * 4 + 3] = A[i] * 255; } g.putImageData(id, 0, 0);
  g.globalCompositeOperation = 'source-atop'; g.lineCap = 'round';      // cloth: a darker lower half and a few soft folds
  const gr = g.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, 'rgba(30,24,46,0.5)'); gr.addColorStop(1, 'rgba(0,0,0,0.5)'); g.fillStyle = gr; g.fillRect(0, 0, W, H);
  g.strokeStyle = 'rgba(46,38,70,0.55)'; g.lineWidth = Math.max(1, k * 1.3); for (const [x0, y0, a, b, x1, y1] of [[-10, 56, -4, 32, 16, 14], [-20, 100, -14, 70, -4, 54], [10, 130, 14, 100, 26, 84], [40, 8, 56, 14, 70, 26], [30, 138, 38, 118, 52, 106]]) { g.beginPath(); g.moveTo(X(x0), Y(y0)); g.quadraticCurveTo(X(a), Y(b), X(x1), Y(y1)); g.stroke(); }
  const rim = (dir, col) => {      // the lit edge: a pixel whose neighbour on the light's side is empty (1), two pixels in (0.5), three (0.24); upper edges a little less
    const c = mk(), q = c.getContext('2d'), im = q.createImageData(W, H), o = im.data;
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      if (!A[y * W + x]) continue; const e = (dx, dy) => { const xx = x + dx * dir, yy = y + dy; return xx < 0 || xx >= W || yy < 0 || yy >= H || !A[yy * W + xx]; };
      const v = e(1, 0) ? 1 : e(1, -1) ? 0.7 : e(2, 0) ? 0.5 : e(3, 0) ? 0.24 : 0; if (v) { const i = (y * W + x) * 4; o[i] = col[0]; o[i + 1] = col[1]; o[i + 2] = col[2]; o[i + 3] = Math.round(255 * v); }
    }
    q.putImageData(im, 0, 0); return c;
  };
  r = { B, R: rim(1, [160, 220, 255]), RL: rim(-1, [255, 206, 140]), w: W, h: H, eye: [X(69), Y(55)], mouth: [X(78), Y(73)] }; msFigC.set(key, r); return r;
}
function msSil(c) {      // a picture as a black silhouette (S) with a thin red rim on its right edge (R: the Master's eye lights him)
  let r = msSilC.get(c); if (r) return r; const w = c.width, h = c.height, s = document.createElement('canvas'); s.width = w; s.height = h; const g = s.getContext('2d'); g.drawImage(c, 0, 0); g.globalCompositeOperation = 'source-atop'; g.fillStyle = '#040308'; g.fillRect(0, 0, w, h);
  const a = g.getImageData(0, 0, w, h).data, R = document.createElement('canvas'); R.width = w; R.height = h; const q = R.getContext('2d'), im = q.createImageData(w, h);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { if (a[(y * w + x) * 4 + 3] < 128) continue; const e = dx => x + dx >= w || a[(y * w + x + dx) * 4 + 3] < 128; if (e(1) || e(2)) { const i = (y * w + x) * 4; im.data[i] = 255; im.data[i + 1] = 60; im.data[i + 2] = 60; im.data[i + 3] = e(1) ? 255 : 120; } }
  q.putImageData(im, 0, 0); r = { s, R }; msSilC.set(c, r); return r;
}
// ---- small drawing helpers
function msEye(ex, ey, k, glow, blink, flare) {      // the red eye: a glow, a slanted almond of red with a hot centre
  if (glow <= 0.01) return; ctx.save(); ctx.globalCompositeOperation = 'lighter';
  const R = k * (9 + 9 * flare), gr = ctx.createRadialGradient(ex, ey, 0, ex, ey, R); gr.addColorStop(0, 'rgba(255,40,50,' + Math.min(1, 0.6 * glow).toFixed(3) + ')'); gr.addColorStop(1, 'rgba(255,40,50,0)'); ctx.fillStyle = gr; ctx.fillRect(ex - R, ey - R, 2 * R, 2 * R); ctx.restore();
  const w = Math.max(3, Math.round(5 * k)), h = Math.max(1, Math.round(2 * k * (1 - blink))), x = Math.round(ex - w / 2), y = Math.round(ey - h / 2); if (blink > 0.95) return;
  ctx.globalAlpha = Math.min(1, glow); ctx.fillStyle = '#9a0a16'; ctx.fillRect(x, y, w, h); ctx.fillStyle = '#ff3a3a'; ctx.fillRect(x + 1, y, w - 2, h); ctx.fillStyle = '#ffd0c0'; ctx.fillRect(x + Math.round(w / 2) - 1, y, Math.max(1, Math.round(k)), Math.max(1, h - (h > 2 ? 1 : 0))); ctx.globalAlpha = 1;
}
function msFinish(bars) {      // grain, the dark edges and the cinema bars
  const key = VW + 'x' + VH; if (msFinish.k !== key) { msFinish.k = key; const g = ctx.createRadialGradient(VW * 0.45, VH * 0.5, VH * 0.35, VW * 0.45, VH * 0.5, Math.hypot(VW, VH) * 0.62); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(0,0,0,0.72)'); msFinish.g = g; }
  ctx.fillStyle = msFinish.g; ctx.fillRect(0, 0, VW, VH); ctx.fillStyle = 'rgba(255,255,255,0.07)'; for (let i = 0; i < 36; i++) ctx.fillRect((Math.random() * VW) | 0, (Math.random() * VH) | 0, 1, 1);
  const bh = Math.round(VH * 0.1 * bars); if (bh > 0) { ctx.fillStyle = '#000'; ctx.fillRect(0, 0, VW, bh); ctx.fillRect(0, VH - bh, VW, bh); }
}
function msDust(T, x0, y0, x1, y1, n, al, seed) {      // motes drifting in a beam of light
  ctx.fillStyle = '#dff4ff'; for (let i = 0; i < n; i++) {
    const a = (i * 0.618 + seed) % 1, b = (i * 0.381 + seed * 2) % 1, x = x0 + (x1 - x0) * ((a + T * (0.012 + (i % 5) * 0.004)) % 1), y = y0 + (y1 - y0) * (((b + Math.sin(T * 0.5 + i) * 0.03 + T * 0.01 * ((i % 3) - 1)) % 1 + 1) % 1);
    ctx.globalAlpha = al * (0.35 + 0.65 * ((i * 7) % 10) / 10); ctx.fillRect(Math.round(x), Math.round(y), 1, 1);
  } ctx.globalAlpha = 1;
}
// ---- shot 1: the close-up of the watcher and his screen
function msShot1(T) {
  const U = VH / 135, k = U * 1.22, F = msFig(k), zoom = 1 + 0.11 * ease3(T / MS.dark), ex = VW * 0.4, ey = VH * 0.46;
  const foot = msFootage(T), live = T < MS.die, flash = T >= MS.burst ? Math.max(0, 1 - (T - MS.burst) / 0.55) : 0;
  let L = live ? (foot ? 0.28 + 0.9 * msLum(foot) : 0.4 + 0.3 * Math.sin(T * 11) * Math.sin(T * 3.7)) : Math.max(0, 0.3 * (1 - (T - MS.die) / 0.5));      // how strongly the screen lights him
  L = Math.min(1.25, L + flash * 0.9);
  ctx.save(); ctx.translate(ex, ey); ctx.scale(zoom, zoom); ctx.translate(-ex, -ey); ctx.fillStyle = '#03030a'; ctx.fillRect(-20, -20, VW + 40, VH + 40);
  // the floating screen in front of his face (a little in perspective: the near side is taller), with the recorded fight in it; at the end it collapses to a line and a dot like an old tube
  const sx0 = Math.round(ex + 44 * U), sx1 = Math.min(Math.round(sx0 + 126 * U), VW - 4), cy = ey - 8 * U, hl = 52 * U, hr = 66 * U, W = sx1 - sx0, mid = (sx0 + sx1) / 2;
  const hq = T < MS.die + 0.2 ? 1 : Math.max(0.03, 1 - ease3((T - MS.die - 0.2) / 0.25)), wq = T < MS.die + 0.45 ? 1 : Math.max(0.02, 1 - ease3((T - MS.die - 0.45) / 0.2)), on = T < MS.die + 0.72;
  if (on && L > 0) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; const gl = ctx.createRadialGradient(sx0 + 40 * U, cy, 4, sx0 + 40 * U, cy, 150 * U); gl.addColorStop(0, 'rgba(120,190,255,' + Math.min(0.4, 0.26 * L).toFixed(3) + ')'); gl.addColorStop(1, 'rgba(60,100,200,0)'); ctx.fillStyle = gl; ctx.fillRect(0, 0, VW, VH); ctx.restore(); }
  if (on) {
    for (let x = 0; x < W; x++) {
      const u = x / W, h = lerp(hl, hr, u) * hq, top = Math.round(cy - h / 2), hh = Math.max(1, Math.round(h)), X = Math.round(mid + (sx0 + x - mid) * wq);
      if (foot && T < MS.die - 0.15) ctx.drawImage(foot.c, u * foot.c.width, 0, Math.max(1, foot.c.width / W), foot.c.height, X, top, 1, hh); else { ctx.fillStyle = (x + ((T * 60) | 0)) % 3 ? 'rgb(20,40,70)' : 'rgb(130,180,235)'; ctx.fillRect(X, top, 1, hh); }
      ctx.fillStyle = 'rgba(80,170,255,0.16)'; ctx.fillRect(X, top, 1, hh);
    }
    const qa = mid + (sx0 - mid) * wq, qb = mid + (sx1 - mid) * wq, quad = () => { ctx.beginPath(); ctx.moveTo(qa, cy - hl / 2 * hq); ctx.lineTo(qb, cy - hr / 2 * hq); ctx.lineTo(qb, cy + hr / 2 * hq); ctx.lineTo(qa, cy + hl / 2 * hq); ctx.closePath(); };      // (the outline collapses with the picture: first to a line, then to a dot)
    ctx.save(); quad(); ctx.clip(); ctx.fillStyle = 'rgba(0,0,10,0.17)'; for (let y = Math.round(cy - hr / 2); y < cy + hr / 2; y += 2) ctx.fillRect(sx0, y, W, 1);
    if (T >= MS.die - 0.15 && T < MS.die + 0.55) { ctx.fillStyle = 'rgba(255,255,255,0.8)'; for (let i = 0; i < 120; i++) ctx.fillRect(sx0 + ((Math.random() * W) | 0), Math.round(cy - hr / 2 + Math.random() * hr), 1 + (i % 3), 1); }
    if (flash > 0) { ctx.fillStyle = 'rgba(255,255,255,' + (0.8 * flash).toFixed(2) + ')'; ctx.fillRect(sx0, cy - hr / 2, W, hr); }
    ctx.restore(); ctx.strokeStyle = 'rgba(150,210,255,0.6)'; ctx.lineWidth = 1; quad(); ctx.stroke();
    if (Math.floor(T * 2) % 2 === 0 && T < MS.die - 0.2) { ctx.fillStyle = '#ff3a3a'; ctx.fillRect(sx0 + 3, Math.round(cy - hl / 2) + 3, 3, 3); pxt('LIVE', sx0 + 9, Math.round(cy - hl / 2) + 8, '#ffb0a8', 8); }
  }
  // the figure: breathing, the cloth, the cold rim of the screen on his face, the smile that comes when the Cat dies, the red eye
  const br = Math.round(Math.sin(T * 1.2) * 0.9 * k), fx = Math.round(ex - F.eye[0]), fy = Math.round(ey - F.eye[1]) + br;
  ctx.drawImage(F.B, fx, fy); ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = Math.min(1, L * 0.9); ctx.drawImage(F.R, fx, fy); if (flash > 0.2) { ctx.globalAlpha = Math.min(1, flash); ctx.drawImage(F.R, fx - 1, fy); } ctx.restore();
  const sm = ease3((T - MS.burst - 0.45) / 0.9), eyeG = 0.55 + 0.25 * Math.sin(T * 2.4) + flash * 0.8 + (T > MS.dark ? 0.15 : 0) + (T >= MS.creak && T < MS.creak + 0.7 ? 0.3 : 0), bl = (T % 5.1) > 4.95 ? 1 - Math.abs(((T % 5.1) - 5.025) / 0.075) : 0;
  if (sm > 0) { const mx = fx + F.mouth[0], my = fy + F.mouth[1]; ctx.globalAlpha = sm; ctx.fillStyle = '#e9d4cc'; for (let i = 0; i < 7; i++) ctx.fillRect(Math.round(mx - i * k * 1.05), Math.round(my - (i > 4 ? (i - 4) * k * 0.9 : 0)), Math.max(1, Math.round(k)), Math.max(1, Math.round(k * 0.7))); ctx.globalAlpha = 1; }
  msEye(ex, ey + br, k, eyeG, bl, flash);
  if (T < MS.die + 0.4) msDust(T, sx0 - 26 * U, ey - 50 * U, sx0 + 10 * U, ey + 50 * U, 26, 0.5 * Math.min(1, L), 3);
  ctx.restore();
}
// ---- shot 2: the room in side view: the door (left), the Master in his chair (right), Verity
function msWalk(T) {      // Verity's walks: from the doorway a few steps in, and after the door is shut a few more towards the Master (x in units of U); phase = where the walk cycle starts
  if (T >= MS.walk && T < MS.turn - 0.4) return { t0: MS.walk, base: 0 }; if (T >= MS.face + 0.1 && T < MS.talk) return { t0: MS.face + 0.1, base: 100 }; return null;
}
function msShot2(T, m) {
  const U = VH / 135, gyW = Math.round(VH * 0.78), dx = Math.round(VW * 0.22), dw = Math.round(36 * U), dh = Math.round(76 * U), mx = Math.round(VW * 0.8), top = gyW - dh;
  const opening = ease3((T - MS.open) / (MS.open1 - MS.open)), closing = ease3((T - MS.close) / (MS.shut - MS.close)), p = T < MS.close ? opening : opening * (1 - closing), gapW = Math.round(dw * (1 - Math.cos(p * 1.36))), cam = ease3((T - MS.wide) / (MS.talk - MS.wide)) * 14 * U;
  ctx.fillStyle = '#04030a'; ctx.fillRect(0, 0, VW, VH); ctx.save(); ctx.translate(-Math.round(cam), 0);
  let gr = ctx.createLinearGradient(0, 0, 0, gyW); gr.addColorStop(0, '#05040c'); gr.addColorStop(1, '#0d0a18'); ctx.fillStyle = gr; ctx.fillRect(-20, 0, VW + 80, gyW); ctx.fillStyle = '#0a0814'; for (const x of [0.04, 0.46, 0.64, 0.92, 1.1]) ctx.fillRect(Math.round(VW * x), 0, Math.round(5 * U), gyW); ctx.fillRect(-20, gyW, VW + 80, VH - gyW + 4);
  // the door: a frame, the bright corridor in the gap, two leaves
  const gl = dx - Math.round(gapW / 2); ctx.fillStyle = '#0c0a14'; ctx.fillRect(Math.round(dx - dw / 2 - 5 * U), Math.round(top - 5 * U), Math.round(dw + 10 * U), Math.round(dh + 5 * U));
  if (gapW > 0) { gr = ctx.createLinearGradient(0, top, 0, gyW); gr.addColorStop(0, '#fffbe6'); gr.addColorStop(0.6, '#ffe7a8'); gr.addColorStop(1, '#ffb864'); ctx.fillStyle = gr; ctx.fillRect(gl, top, gapW, dh); }
  const lw = Math.round((dw - gapW) / 2); for (const s of [-1, 1]) { const x = Math.round(s < 0 ? dx - dw / 2 : dx + dw / 2 - lw); ctx.fillStyle = '#1b1210'; ctx.fillRect(x, top, lw, dh); ctx.fillStyle = '#33241a'; ctx.fillRect(s < 0 ? x : x + lw - 1, top, 1, dh); ctx.fillStyle = '#2a1d16'; for (let y = top + 6 * U; y < gyW - 4 * U; y += 12 * U) ctx.fillRect(x + 2, Math.round(y), Math.max(0, lw - 4), 1); }
  if (p > 0.01) {      // the light: a cone in the air, a long beam on the floor, dust in it
    ctx.save(); ctx.globalCompositeOperation = 'lighter'; gr = ctx.createLinearGradient(dx, 0, dx + 230 * U, 0); gr.addColorStop(0, 'rgba(255,226,160,' + (0.34 * p).toFixed(3) + ')'); gr.addColorStop(1, 'rgba(255,200,120,0)');
    ctx.fillStyle = gr; ctx.beginPath(); ctx.moveTo(gl + gapW, top + 2 * U); ctx.lineTo(dx + 230 * U, top - 30 * U); ctx.lineTo(dx + 230 * U, VH); ctx.lineTo(gl, gyW + 1); ctx.closePath(); ctx.fill();
    gr = ctx.createLinearGradient(dx, 0, dx + 200 * U, 0); gr.addColorStop(0, 'rgba(255,230,170,' + (0.55 * p).toFixed(3) + ')'); gr.addColorStop(1, 'rgba(255,200,120,0)'); ctx.fillStyle = gr; ctx.beginPath(); ctx.moveTo(gl, gyW + 1); ctx.lineTo(gl + gapW, gyW + 1); ctx.lineTo(dx + 230 * U, gyW + (VH - gyW) * 0.85); ctx.lineTo(dx + 10 * U, gyW + (VH - gyW) * 0.85); ctx.closePath(); ctx.fill(); ctx.restore();
    msDust(T, dx, top, dx + 150 * U, gyW + 4 * U, 34, 0.55 * p, 7);
  }
  // the Master in his chair (a small copy of the same figure): his back rimmed by the door's light, the dead screen in front of him, the red eye
  const k2 = U * 0.42, F2 = msFig(k2), seat = gyW - Math.round(4 * U), fx = Math.round(mx - F2.eye[0]), fy = Math.round(seat - F2.h + 8 * U), br = Math.round(Math.sin(T * 1.2) * 0.5);
  ctx.fillStyle = '#0c0a15'; ctx.fillRect(Math.round(fx - 3 * U), fy + Math.round(4 * U), Math.round(26 * U), gyW - fy - Math.round(4 * U));
  ctx.drawImage(F2.B, fx, fy + br); if (p > 0.01) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = Math.min(1, 0.85 * p); ctx.drawImage(F2.RL, fx, fy + br); ctx.restore(); }
  ctx.fillStyle = '#0a0814'; ctx.fillRect(Math.round(fx - 6 * U), seat - Math.round(10 * U), Math.round(36 * U), Math.round(14 * U)); ctx.fillStyle = '#15102a'; ctx.fillRect(Math.round(fx - 6 * U), seat - Math.round(10 * U), Math.round(36 * U), 1);
  const spx = Math.round(mx + 14 * U), spy = Math.round(fy + F2.eye[1] - 18 * U), spw = Math.round(30 * U), sph = Math.round(22 * U); ctx.fillStyle = 'rgba(0,0,0,0.6)'; ctx.fillRect(spx, spy, spw, sph); ctx.strokeStyle = 'rgba(120,180,255,' + (0.12 + 0.05 * Math.sin(T * 7)).toFixed(3) + ')'; ctx.strokeRect(spx + 0.5, spy + 0.5, spw, sph);
  const talkK = T >= MS.talk ? ease3((T - MS.talk - 0.5) / 0.5) * (1 - ease3((T - MS.talk - 2.2) / 1.2)) : 0, eyeY = fy + F2.eye[1] + br, eyeK = Math.max(1, k2 * 1.6);
  m.eye = [mx - Math.round(cam), eyeY, eyeK]; msEye(mx, eyeY, eyeK, 0.8 + 0.12 * Math.sin(T * 2.2) + talkK * 0.8, (T % 6.3) > 6.2 ? 1 : 0, talkK);
  // Verity: a black shape against the light, in the doorway, walking in, turning to close the door, facing the Master
  if (T >= MS.open + 1.5) {
    const a = ease3((T - MS.walk) / (MS.turn - MS.walk)), b = ease3((T - MS.face) / (MS.talk - MS.face)), vx = dx + (T < MS.walk ? 0 : 30 * U * a + (T >= MS.face ? 46 * U * b : 0)), face = T >= MS.turn && T < MS.face ? -1 : 1, w = msWalk(T), bow = T >= MS.talk ? ease3((T - MS.talk) / 0.6) * 2 * U : 0;
    const img = w ? vfr('walk', (T - w.t0) * 9, true, false) : vfr('idle', T * 8, true, false), S = msSil(img), oy = -62 + Math.round(bow);
    ctx.save(); ctx.translate(Math.round(vx), gyW + 2); if (face < 0) ctx.scale(-1, 1); ctx.drawImage(S.s, -32, oy); if (T >= MS.face) { ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = 0.4 * (0.7 + talkK); ctx.drawImage(S.R, -32, oy); } ctx.restore();
  }
  ctx.restore();
}
// ---- the whole scene
function startMaster(now) {
  show('story'); story.master = true; story.battle = false; story.t0 = now; story.T = 0; story.ev = {}; story.ms = { vc: 0, foot: -1, eye: null }; alley = true; wx = 0; snd('mhum');
}
function masterFrame(now, dt) {
  const T = Math.max(0, now - story.t0) / 1000; story.T = T; ctx.save(); ctx.imageSmoothingEnabled = false; ctx.fillStyle = '#000'; ctx.fillRect(0, 0, VW, VH); const m = story.ms;
  if (T >= MS.card - 0.2) { msCard(now, T); ctx.restore(); return; }
  if (T < MS.wide) msShot1(T); else msShot2(T, m);
  msFinish(ease3(T / 1.2));
  if (T >= MS.talk && T < MS.end + 0.6) { const n = Math.floor((T - MS.talk) * 11); dlg2('VERITY', MS_LINE, '', n, '#c8e04a'); while (m.vc < Math.min(n, MS_LINE.length)) { m.vc++; if (MS_LINE[m.vc - 1] !== ' ') snd('mvoice'); } }
  // the cut between the two shots (a dip to black), the fade in and the fade out (the eye stays a little longer than the rest)
  const dip = T >= MS.dark + 1.2 && T < MS.wide + 0.5 ? Math.max(0, 1 - Math.abs(T - (MS.wide - 0.15)) / 0.45) : 0, fo = clamp01((T - MS.end) / (MS.black - MS.end)), dk = Math.max(dip, 1 - clamp01(T / MS.fade), fo * fo);
  if (dk > 0) { ctx.fillStyle = 'rgba(0,0,0,' + dk.toFixed(3) + ')'; ctx.fillRect(0, 0, VW, VH); }
  if (T >= MS.end && T < MS.black && m.eye) msEye(m.eye[0], m.eye[1], m.eye[2], 0.9 * (1 - clamp01((T - MS.end - 0.8) / 1.0)), 0, 0);
  if (T >= MS.burst) once2('burst', () => snd('mflash')); if (T >= MS.die) once2('die', () => snd('mstatic')); if (T >= MS.creak) once2('creak', () => snd('mdoor', 0.45)); if (T >= MS.open - 0.1) once2('open', () => snd('mdoor', 1)); if (T >= MS.close) once2('close', () => snd('mdoor', 0.7));
  if (T >= MS.shut) once2('shut', () => { snd('mthud'); shakeUntil = now + 260; shakeAmp = 2; }); if (T >= MS.talk + 0.9) once2('sting', () => snd('msting'));
  const w = msWalk(T); if (w) { const s = w.base + Math.floor((T - w.t0) / 0.62); if (s > m.foot) { m.foot = s; snd('mfoot'); } }
  ctx.restore();
}
function msCard(now, T) {      // END OF CHAPTER 1
  const t = T - MS.card; once2('ms_off', () => snd('mhumoff')); ctx.fillStyle = '#000'; ctx.fillRect(0, 0, VW, VH); ctx.globalAlpha = clamp01((t + 0.2) / 1.2);
  pxt('END OF CHAPTER 1', VW / 2, Math.round(VH / 2) - 2, '#ffffff', 16, 'center'); pxt('TO BE CONTINUED', VW / 2, Math.round(VH / 2) + 20, '#ffd34d', 8, 'center');
  if (t > 2.2 && Math.floor(now / 600) % 2 === 0) pxt('TAP TO CONTINUE', VW / 2, VH - 8, '#9d8cff', 8, 'center'); ctx.globalAlpha = 1;
}
