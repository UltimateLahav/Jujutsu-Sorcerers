// ================================================================ v1.145 CHAPTER 4: THE VESSEL (update 1 of 2: the title, the aftermath on the roof, the playable rooftop chase as Megumi, the catch and the grab of his face)
// The whole chapter is as long as the user's song (tools/vessel_music.mp3, Andrea Garner, L'AMOUR TOUJOURS, organ, slowed: 5:47.6, a steady organ wash with no beat; its swells are on C15.sw). Everything is a function of the scene time T = the song time
// (story.t0 is "now" at the start): title 0 - 5.6 s, the aftermath on the roof 5.6 - 38 s (Sukuna steps out of the smoke on the swell at 17.0 s, says "Run." on 34.5 s), the CHASE 38 - 158 s (you are Megumi: auto-run, tap = jump, hold = higher,
// swipe down / Down = slide; you cannot lose, a stumble only slows him and brings Sukuna closer), the catch 158 - 199.4 s (the slow-motion leap, Sukuna lands in front of him on the swell at 172 s, Megumi turns and runs, Sukuna has his face on the swell at 182 s)
// and a hard cut to black on the swell at 199.4 s and the TO BE CONTINUED card (update 2 goes on from there: the finger, the shove, the scream, Yuji, the smile at 342 s).
// pictures: Megumi is drawn pose by pose by tools/megumi.js (c15Meg); Sukuna is the sprite of FREE PLAY (CU_GAME[3]); the city, the roofs and the obstacles are drawn here.
const C15 = {
  title: 0.5, titleEnd: 5.6, after: 5.6, run: 38.0, runEnd: 157.0, leap: 157.0, land: 172.0, grab: 181.8, black: 199.4, card: 201.6, len: 347.6, fade1: 203.0,
  sw: [5.8, 8.5, 13.0, 15.5, 17.2, 20.5, 22.2, 26.2, 30.5, 32.2, 34.5, 41.0, 43.5, 47.2, 51.2, 55.5, 61.0, 64.8, 67.0, 69.8, 71.8, 77.2, 79.8, 84.2, 87.0, 90.2, 93.8, 98.8, 104.2, 106.8, 110.2, 113.2, 118.5, 121.0, 126.0, 129.8, 134.0, 137.2, 142.2, 144.5, 147.8, 151.5, 153.2, 157.0, 159.5, 161.2, 164.5, 166.5, 168.2, 172.0, 173.8, 176.8, 181.8, 186.5, 188.8, 190.8, 194.0, 197.2, 199.0]
};
const C15_MUSIC = '__VESSELMUSIC__', C15V = { vol: 0.74, len: 347.6 };
let c15A = null;
function c15Audio() {
  if (c15A) return c15A; if (!C15_MUSIC || C15_MUSIC.length < 100) return null;
  try { const bin = atob(C15_MUSIC.slice(C15_MUSIC.indexOf(',') + 1)), u = new Uint8Array(bin.length); for (let i = 0; i < bin.length; i++) u[i] = bin.charCodeAt(i); c15A = new Audio(URL.createObjectURL(new Blob([u], { type: 'audio/mpeg' }))); c15A.preload = 'auto'; } catch { c15A = null; }
  return c15A;
}
function c15Music(T) {      // the song plays on the scene time (it is made and starts to load a moment before): a hard cut at the grab, and it fades out under the card
  const on = T >= 0 && T < C15V.len && T < C15.fade1 && !document.hidden && !(typeof paused !== 'undefined' && paused);
  if (T > -4 && T < 0.5) c15Audio();
  if (!on) { if (c15A && !c15A.paused) c15A.pause(); return; }
  const a = c15Audio(); if (!a) return;
  const g = C15V.vol * Math.min(1, T / 0.05) * (T > C15.black ? Math.max(0, (C15.fade1 - T) / (C15.fade1 - C15.black)) : 1), node = sfx && soundOn && sfx.ac.state === 'running' ? sfx.music(a) : null;
  if (node) node.gain.setTargetAtTime(Math.max(0, g), sfx.ac.currentTime, 0.04); else a.volume = soundOn ? Math.max(0, Math.min(1, g)) : 0;
  if (a.paused) { try { a.currentTime = T; } catch { /* not ready yet */ } const pr = a.play(); if (pr && pr.catch) pr.catch(() => { }); } else if (Math.abs(a.currentTime - T) > 0.3) { try { a.currentTime = T; } catch { /* not ready yet */ } }
}
function c15Stop() { if (c15A) { try { c15A.pause(); c15A.currentTime = 0; } catch { /* nothing to stop */ } } }      // (the song stops with the story)
window.__c15 = () => c15A ? { t: c15A.currentTime, paused: c15A.paused, vol: c15A.volume, len: c15A.duration } : null;      // test hook

// ---- the chapter: start, one frame, the fingers and keys, the skip, the card
function startC15(slot) { audio(); show('story'); story = { slot, t0: pnow(), battle: false, T: 0, ev: {}, shk: null, c15: c15New() }; alley = true; court = false; track = false; wx = 0; }
function c15New() { return { run: null, shake: 0, shakeAt: 0, shakeMs: 400, flash: 0, meg: null, p: [], blood: [], hb: -1, vi: -1, vc: 0 }; }
function c15Frame(now, dt) {
  const T = story.T = Math.max(0, now - story.t0) / 1000; c15Music(T); c15Events(T); wx = 0;
  ctx.save(); ctx.imageSmoothingEnabled = false; ctx.fillStyle = '#000'; ctx.fillRect(0, 0, VW, VH);
  if (T >= C15.card) c15Card(now, T);
  else if (T < C15.after) c15Title(now, T);
  else if (T < C15.run) c15After(now, dt, T);
  else if (T < C15.leap) c15Run(now, dt, T);
  else if (T < C15.black) c15Catch(now, dt, T);
  if (T >= C15.title && T < C15.card && T < C15.black - 0.3) { ctx.strokeStyle = 'rgba(255,255,255,0.55)'; ctx.lineWidth = 1; ctx.strokeRect(VW - 39.5, 2.5, 36, 10); pxt('SKIP', VW - 21, 11, '#ffffff', 8, 'center'); }      // (the SKIP button: on to the next part)
  ctx.restore();
}
function c15Tap(ev) {      // a finger goes down: in the chase it is a jump (the SKIP button in the corner skips); otherwise it skips to the next part
  const T = story.T; if (T >= C15.card) { if (T >= C15.card + 1.2) { show('saves'); renderSaves(); } return; }
  if (ev && c13InSkip(ev)) { c15Skip(); return; }
  if (T >= C15.run && T < C15.leap && c15RunInput) { c15RunInput('down', ev); return; }
}
function c15Up(ev) { if (story && story.c15 && story.T >= C15.run && story.T < C15.leap && c15RunInput) c15RunInput('up', ev); }
function c15Key(e, down) {      // the keyboard: Space / Up / W / J = jump (hold = higher), Down / S = slide; true = the key was used
  if (!story || !story.c15) return false; const T = story.T, c = e.code;
  if (T >= C15.run && T < C15.leap && c15RunInput) { if (c === 'Space' || c === 'ArrowUp' || c === 'KeyW' || c === 'KeyJ') { if (!e.repeat) c15RunInput(down ? 'down' : 'up', null); return true; } if (c === 'ArrowDown' || c === 'KeyS') { if (down && !e.repeat) c15RunInput('slide', null); return true; } }
  if (down && !e.repeat && (c === 'Space' || c === 'Enter') && T >= C15.card + 1.2) { show('saves'); renderSaves(); return true; }
  return false;
}
const C15_CUTS = [C15.after, C15.run, C15.leap, C15.land, C15.grab, C15.black];      // (the SKIP button: the start of the aftermath, the chase, the leap, the landing, the grab, the black)
function c15Skip() { const T = story.T, n = C15_CUTS.find(x => x > T + 0.05); if (n !== undefined) { story.t0 = pnow() - n * 1000; story.ev = {}; } }
function c15Card(now, T) {      // the card of update 1: the song has been cut, the chapter goes on in the next update
  const t = T - C15.card; ctx.fillStyle = '#000'; ctx.fillRect(0, 0, VW, VH); once2('card', () => { snd('msting'); storyDone15(); }); ctx.globalAlpha = clamp01((t + 0.1) / 1.0);
  pxt('CHAPTER 4', VW / 2, Math.round(VH / 2) - 10, '#ffffff', 16, 'center'); pxt('THE VESSEL', VW / 2, Math.round(VH / 2) + 8, '#e0505e', 8, 'center'); pxt('TO BE CONTINUED', VW / 2, Math.round(VH / 2) + 26, '#ffd34d', 8, 'center');
  if (t > 2.2 && Math.floor(now / 600) % 2 === 0) pxt('TAP TO CONTINUE', VW / 2, VH - 8, '#9d8cff', 8, 'center'); ctx.globalAlpha = 1;
}
function storyDone15() { if (!story) return; const a = loadSaves(); if (a[story.slot]) a[story.slot].c15 = true; storeSaves(a); }      // (the card of chapter 4 has been reached)
window.__c15At = t => { if (!story) return; if (!story.c15) startC15(story.slot); story.t0 = pnow() - (t || 0) * 1000; story.ev = {}; story.c15 = c15New(); };      // test hook: start the chapter (or jump in it) at scene time t
window.__c15T = () => story ? story.T : -1;

// ---- the title card: black, the first note of the organ, the words come out of the dark
function c15Title(now, T) {
  const t = T - C15.title, a = clamp01(Math.min(t / 1.2, (C15.titleEnd - T) / 0.9)); if (a <= 0) return; ctx.globalAlpha = a;
  pxt('CHAPTER 4', VW / 2, Math.round(VH * 0.42), '#ffffff', 16, 'center'); pxt('THE VESSEL', VW / 2, Math.round(VH * 0.42) + 18, '#e0505e', 8, 'center'); ctx.globalAlpha = 1;
}
let c15RunInput = null;      // (set by the chase, see below)

// ================================================================ the city: the sky, the moon, two skylines that move at different speeds, the roofs and the things on them. World = x along the roofs, y = 0 on the surface of the roof, up is negative; the camera looks at (x, y) with a zoom z
const c15Cl = (v, a, b) => Math.max(a, Math.min(b, v)), c15E = t => { t = c15Cl(t, 0, 1); return t * t * (3 - 2 * t); }, c15S = (T, a, b) => c15Cl((T - a) / (b - a), 0, 1);
const c15GY = () => Math.round(VH * 0.74);      // (the row of the screen the roof is on when the camera looks at y = 0)
const C15S = { h: 0, w: 0, far: null, mid: null, stars: [] };
function c15Layers() {      // the two skylines are drawn once as wide strips (dark slabs with a few lit windows and the red lights of the tall ones)
  if (C15S.h === VH) return; C15S.h = VH; C15S.w = 900;
  const mk = (seed, col, side, tops, bw, lit, tall) => {
    const c = document.createElement('canvas'); c.width = C15S.w; c.height = VH; const g = c.getContext('2d'); let x = -10, i = 0;
    while (x < C15S.w) {
      const w = bw[0] + c4R(i, seed) * (bw[1] - bw[0]), top = Math.round(VH * (tops[0] + c4R(i, seed + 1) * (tops[1] - tops[0]))); g.fillStyle = col; g.fillRect(Math.round(x), top, Math.round(w), VH - top); g.fillStyle = side; g.fillRect(Math.round(x), top, 1, VH - top); g.fillRect(Math.round(x), top, Math.round(w), 1);
      for (let wy = top + 5; wy < VH - 6; wy += 5) for (let wx = Math.round(x) + 3; wx < x + w - 3; wx += 4) if (c4R(i * 31 + wy, wx + seed) < lit) { g.fillStyle = c4R(wx, wy + seed) < 0.7 ? 'rgba(255,217,138,0.55)' : 'rgba(150,190,255,0.5)'; g.fillRect(wx, wy, 2, 2); }
      if (c4R(i, seed + 3) < tall) { g.fillStyle = col; g.fillRect(Math.round(x + w / 2), top - 9, 1, 9); C15S.red = C15S.red || []; C15S.red.push([seed, Math.round(x + w / 2), top - 10]); }
      x += w + c4R(i, seed + 2) * 5; i++;
    }
    return c;
  };
  C15S.red = []; C15S.far = mk(11, '#0a1030', '#141c44', [0.30, 0.60], [22, 44], 0.12, 0.16); C15S.mid = mk(23, '#0d1438', '#1a2452', [0.44, 0.68], [30, 60], 0.10, 0.1);
  C15S.stars = Array.from({ length: 70 }, (_, i) => [c4R(i, 1) * 1.0, c4R(i, 2) * 0.55, 0.4 + 0.6 * c4R(i, 3)]);
}
function c15Sky(T, cx, dim) {      // the night: the sky, stars, the moon with its glow, the two skylines (cx = how far the camera is along the roofs; dim 0 - 1 darkens everything)
  c15Layers(); const g = ctx.createLinearGradient(0, 0, 0, VH); g.addColorStop(0, '#050818'); g.addColorStop(0.5, '#0d1636'); g.addColorStop(0.8, '#1b2350'); g.addColorStop(1, '#2a2552'); ctx.fillStyle = g; ctx.fillRect(0, 0, VW, VH);
  for (const [sx, sy, b] of C15S.stars) { ctx.fillStyle = 'rgba(255,255,255,' + (0.25 + 0.5 * b * (0.7 + 0.3 * Math.sin(T * 1.7 + sx * 40))).toFixed(2) + ')'; ctx.fillRect(Math.round(sx * VW), Math.round(sy * VH), 1, 1); }
  const mx = Math.round(VW * 0.74 - cx * 0.0012), my = Math.round(VH * 0.27), mr = Math.round(VH * 0.19), gl = ctx.createRadialGradient(mx, my, mr * 0.7, mx, my, mr * 2.6); gl.addColorStop(0, 'rgba(190,205,255,0.35)'); gl.addColorStop(1, 'rgba(190,205,255,0)'); ctx.fillStyle = gl; ctx.fillRect(mx - mr * 3, my - mr * 3, mr * 6, mr * 6);
  ctx.fillStyle = '#e8ecff'; ctx.beginPath(); ctx.arc(mx, my, mr, 0, 7); ctx.fill(); ctx.fillStyle = 'rgba(160,172,215,0.55)'; for (const [dx, dy, r] of [[-0.35, -0.2, 0.22], [0.25, 0.1, 0.3], [-0.1, 0.45, 0.16], [0.45, -0.35, 0.12]]) { ctx.beginPath(); ctx.arc(mx + dx * mr, my + dy * mr, r * mr, 0, 7); ctx.fill(); }
  ctx.fillStyle = 'rgba(14,20,50,0.6)'; for (let i = 0; i < 4; i++) { const w = 80 + c4R(i, 5) * 90, x = ((i * 190 - T * (2.5 + i) - cx * 0.03) % (VW + 240) + VW + 240) % (VW + 240) - 120; ctx.fillRect(Math.round(x), Math.round(VH * (0.18 + 0.12 * i)), Math.round(w), 3); }      // (clouds)
  for (const [lay, par] of [[C15S.far, 0.08], [C15S.mid, 0.2]]) { const off = Math.round(((cx * par) % C15S.w + C15S.w) % C15S.w); for (let x = -off; x < VW; x += C15S.w) ctx.drawImage(lay, x, 0); }
  if (Math.floor(T * 1.1) % 2 === 0) { ctx.fillStyle = '#ff3a3a'; for (const [sd, x, y] of C15S.red) { const par = sd === 11 ? 0.08 : 0.2, off = Math.round(((cx * par) % C15S.w + C15S.w) % C15S.w); for (let xx = -off; xx < VW; xx += C15S.w) ctx.fillRect(xx + x, y, 1, 1); } }
  if (dim > 0) { ctx.fillStyle = 'rgba(0,0,10,' + dim.toFixed(2) + ')'; ctx.fillRect(0, 0, VW, VH); }
}
function c15Cam(c, f) { ctx.save(); ctx.translate(Math.round(VW / 2 + (c.sx || 0)), Math.round(c15GY() + (c.sy || 0))); if (c.rot) ctx.rotate(c.rot); ctx.scale(c.z, c.z); ctx.translate(-Math.round(c.x), -Math.round(c.y)); f(); ctx.restore(); }
function c15Roof(x0, x1, top, seed) {      // a rooftop: the slab with its lit edge, seams and stains, a low wall at each end, and the face of the building below with a few lit windows
  const w = x1 - x0; ctx.fillStyle = '#0b0f26'; ctx.fillRect(x0, top, w, 260); ctx.fillStyle = '#1b2147'; ctx.fillRect(x0, top, w, 7); ctx.fillStyle = '#323c76'; ctx.fillRect(x0, top, w, 1); ctx.fillStyle = '#0f1430'; ctx.fillRect(x0, top + 7, w, 2);
  ctx.fillStyle = '#141a3c'; for (let x = x0 + 20; x < x1; x += 24 + (c4R(x | 0, 9) * 8 | 0)) ctx.fillRect(x, top + 1, 1, 6);
  ctx.fillStyle = 'rgba(0,0,8,0.35)'; for (let i = 0; i < w / 40; i++) ctx.fillRect(x0 + 10 + c4R(i + seed, 3) * (w - 30), top + 2, 6 + c4R(i, 4) * 10, 2);      // (stains)
  ctx.fillStyle = '#232b59'; ctx.fillRect(x0, top - 3, 3, 3); ctx.fillRect(x1 - 3, top - 3, 3, 3);
  for (let wy = top + 14; wy < top + 130; wy += 12) for (let wx = x0 + 8; wx < x1 - 10; wx += 14) { const lit = c4R(wx | 0, wy + seed) < 0.16; ctx.fillStyle = lit ? 'rgba(255,217,138,0.75)' : '#131a40'; ctx.fillRect(wx, wy, 7, 6); }
}
function c15Prop(kind, x, y, T) {      // the things on a roof, standing on y: a crate, a vent, an air conditioner, a water tank, an antenna, a pipe and a washing line at head height
  if (kind === 'crate') { ctx.fillStyle = '#1b1510'; ctx.fillRect(x - 8, y - 14, 16, 14); ctx.fillStyle = '#5a4430'; ctx.fillRect(x - 7, y - 13, 14, 12); ctx.fillStyle = '#7a5e42'; ctx.fillRect(x - 7, y - 13, 14, 2); ctx.fillStyle = '#3a2c1e'; ctx.fillRect(x - 7, y - 7, 14, 1); ctx.fillRect(x - 1, y - 13, 2, 12); }
  else if (kind === 'vent') { ctx.fillStyle = '#0c1020'; ctx.fillRect(x - 6, y - 19, 12, 19); ctx.fillStyle = '#4a5478'; ctx.fillRect(x - 5, y - 18, 10, 17); ctx.fillStyle = '#6c78a2'; ctx.fillRect(x - 5, y - 18, 3, 17); ctx.fillStyle = '#252c4c'; ctx.fillRect(x - 8, y - 22, 16, 4); ctx.fillStyle = '#7a86b0'; ctx.fillRect(x - 8, y - 22, 16, 1); ctx.fillStyle = '#1a2040'; for (let i = 0; i < 3; i++) ctx.fillRect(x - 4, y - 14 + i * 4, 8, 1); }
  else if (kind === 'ac') { ctx.fillStyle = '#0c1020'; ctx.fillRect(x - 13, y - 22, 26, 22); ctx.fillStyle = '#566084'; ctx.fillRect(x - 12, y - 21, 24, 20); ctx.fillStyle = '#7b87b0'; ctx.fillRect(x - 12, y - 21, 24, 2); ctx.fillStyle = '#2c3456'; ctx.beginPath(); ctx.arc(x - 3, y - 11, 7, 0, 7); ctx.fill(); ctx.fillStyle = '#161c38'; ctx.beginPath(); ctx.arc(x - 3, y - 11, 5, 0, 7); ctx.fill(); ctx.fillStyle = '#44507a'; const a = (T || 0) * 14; ctx.fillRect(x - 3 + Math.round(Math.cos(a) * 4) - 1, y - 11 + Math.round(Math.sin(a) * 4) - 1, 2, 2); ctx.fillStyle = '#2a3252'; for (let i = 0; i < 4; i++) ctx.fillRect(x + 6, y - 19 + i * 4, 5, 1); }
  else if (kind === 'tank') { ctx.fillStyle = '#0c1020'; for (const dx of [-8, 6]) ctx.fillRect(x + dx, y - 14, 2, 14); ctx.fillStyle = '#1a2040'; ctx.fillRect(x - 11, y - 38, 22, 24); ctx.fillStyle = '#3a4474'; ctx.fillRect(x - 10, y - 37, 20, 22); ctx.fillStyle = '#5a68a0'; ctx.fillRect(x - 10, y - 37, 4, 22); ctx.fillStyle = '#242c54'; ctx.fillRect(x - 10, y - 30, 20, 1); ctx.fillRect(x - 10, y - 23, 20, 1); ctx.fillStyle = '#242c54'; ctx.beginPath(); ctx.moveTo(x - 12, y - 38); ctx.lineTo(x, y - 46); ctx.lineTo(x + 12, y - 38); ctx.fill(); }
  else if (kind === 'antenna') { ctx.fillStyle = '#2a3258'; ctx.fillRect(x - 1, y - 58, 2, 58); ctx.fillRect(x - 7, y - 50, 14, 1); ctx.fillRect(x - 5, y - 42, 10, 1); ctx.fillRect(x - 3, y - 34, 6, 1); if (Math.floor((T || 0) * 1.3) % 2 === 0) { ctx.fillStyle = '#ff3a3a'; ctx.fillRect(x - 1, y - 60, 3, 3); } }
  else if (kind === 'pipe') { ctx.fillStyle = '#0c1020'; ctx.fillRect(x - 15, y - 30, 3, 30); ctx.fillRect(x + 12, y - 30, 3, 30); ctx.fillStyle = '#3a4474'; ctx.fillRect(x - 16, y - 30, 32, 5); ctx.fillStyle = '#6c78a8'; ctx.fillRect(x - 16, y - 30, 32, 1); ctx.fillStyle = '#242c54'; ctx.fillRect(x - 16, y - 26, 32, 1); }
  else if (kind === 'line') { ctx.fillStyle = '#0c1020'; ctx.fillRect(x - 17, y - 32, 2, 32); ctx.fillRect(x + 15, y - 32, 2, 32); ctx.fillStyle = '#8a92b8'; ctx.fillRect(x - 15, y - 31, 30, 1); const sw = Math.sin((T || 0) * 3 + x) * 1.2; for (const [dx, col] of [[-10, '#c8c0d8'], [-1, '#6a7ab8'], [8, '#c8b0a8']]) { ctx.fillStyle = col; ctx.fillRect(x + dx + Math.round(sw), y - 30, 7, 12); ctx.fillStyle = 'rgba(0,0,0,0.25)'; ctx.fillRect(x + dx + Math.round(sw), y - 22, 7, 4); } }
}
// ---- particles (ash and embers that rise, dust, sparks, flakes of the roof): kind, where, how fast, how long
function c15Spawn(kind, x, y, n, o = {}) {
  const P = story.c15.p; for (let i = 0; i < n; i++) { const r = Math.random; P.push({ k: kind, x: x + (r() - 0.5) * (o.sx || 0), y: y + (r() - 0.5) * (o.sy || 0), vx: (o.vx || 0) + (r() - 0.5) * (o.rx || 20), vy: (o.vy || 0) + (r() - 0.5) * (o.ry || 20), life: (o.life || 1.5) * (0.6 + 0.8 * r()), age: 0, s: o.s || 1 }); }
  if (P.length > 260) P.splice(0, P.length - 260);
}
function c15Parts(dt) {
  const P = story.c15.p; for (let i = P.length - 1; i >= 0; i--) { const q = P[i]; q.age += dt; if (q.age >= q.life) { P.splice(i, 1); continue; } q.x += q.vx * dt; q.y += q.vy * dt; if (q.k === 'ash') { q.vx += (-10 - q.vx) * dt * 0.6; q.vy -= 4 * dt; } else if (q.k === 'dust') { q.vy += 6 * dt; q.vx *= 1 - 1.4 * dt; q.vy *= 1 - 1.4 * dt; } else if (q.k === 'deb') { q.vy += 260 * dt; } else if (q.k === 'drop') { q.vy += 300 * dt; } }
}
function c15DrawParts() {
  for (const q of story.c15.p) { const u = q.age / q.life, a = 1 - u;
    if (q.k === 'ash') { ctx.fillStyle = 'rgba(' + (u < 0.4 ? '255,150,70' : '120,120,140') + ',' + (a * 0.9).toFixed(2) + ')'; ctx.fillRect(Math.round(q.x), Math.round(q.y), q.s, q.s); }
    else if (q.k === 'dust') { ctx.fillStyle = 'rgba(150,158,200,' + (a * 0.5).toFixed(2) + ')'; const r = Math.round(1 + u * 5 * q.s); ctx.fillRect(Math.round(q.x - r / 2), Math.round(q.y - r / 2), r, r); }
    else if (q.k === 'deb') { ctx.fillStyle = '#3a4474'; ctx.fillRect(Math.round(q.x), Math.round(q.y), 2, 2); }
    else if (q.k === 'drop') { ctx.fillStyle = '#c0141e'; ctx.fillRect(Math.round(q.x), Math.round(q.y), 1, 2); }
    else if (q.k === 'spark') { ctx.fillStyle = 'rgba(255,230,170,' + a.toFixed(2) + ')'; ctx.fillRect(Math.round(q.x), Math.round(q.y), 1, 1); }
  }
}
function c15Tint(img, col) {      // a picture as a dark silhouette (cached): the backlit Sukuna
  const k = img.__tint || (img.__tint = {}); if (k[col]) return k[col]; const c = document.createElement('canvas'); c.width = img.width; c.height = img.height; const g = c.getContext('2d'); g.drawImage(img, 0, 0); g.globalCompositeOperation = 'source-atop'; g.fillStyle = col; g.fillRect(0, 0, c.width, c.height); return (k[col] = c);
}
function c15Sprite(img, x, y, flip, base) {      // a 64 wide picture whose sole row is `base`, standing at world (x, y)
  ctx.save(); ctx.translate(Math.round(x), Math.round(y)); if (flip) ctx.scale(-1, 1); ctx.drawImage(img, -32, -base); ctx.restore();
}
function c15Shake(amp, ms) { const st = story.c15; st.shake = Math.max(st.shake * Math.max(0, 1 - (pnow() - st.shakeAt) / 600), amp); st.shakeAt = pnow(); st.shakeMs = ms || 400; }
function c15ShakeOff() { const st = story.c15, t = (pnow() - st.shakeAt) / (st.shakeMs || 400); if (t >= 1 || st.shake <= 0) return [0, 0]; const a = st.shake * (1 - t); return [(Math.random() * 2 - 1) * a, (Math.random() * 2 - 1) * a]; }

// ================================================================ PART 1: THE AFTERMATH (5.6 - 38 s)
// The roof where the fight ended, at night. Megumi kneels in the dust and ash among the pieces of the broken wheel (facing left, towards where the fight was), bleeding, heaving; he gets up. Sukuna (Yuji's body) steps out of the smoke on the swell at 17.2 s
// and walks to him slowly while the camera cuts between his boots, Megumi's face and the whole roof; Megumi backs away; at 34.5 s Sukuna says "RUN." and Megumi spins and runs: the chase begins at 38 s.
const C15_TALK = [{ t: 34.5, d: 2.3, w: 'SUKUNA', vk: 5, a: 'RUN.', b: '' }];
function c15Talk(T) {
  const i = C15_TALK.findIndex(s => T >= s.t && T < s.t + s.d); if (i < 0) return; const s = C15_TALK[i], n = Math.floor((T - s.t) * TN_RATE), st = story.c15, sp = s.a + s.b;
  if (st.vi !== i) { st.vi = i; st.vc = 0; } while (st.vc < Math.min(n, sp.length)) { st.vc++; if (sp[st.vc - 1] !== ' ') snd('tvoice', s.vk || 0); } c7Dlg(s.w, s.a, n, s.b);
}
const C15A = { mx: 96, sx0: -128, sx1: 38, sIn: 17.2, sStop: 30.0, back0: 22.0, turn: 35.0, go: 35.35 };
function c15MegX(T) {      // where Megumi is on the roof (world x): kneeling, standing, backing away, then running
  if (T < C15A.back0) return C15A.mx; if (T < C15A.turn) return C15A.mx + 3.6 * Math.max(0, Math.min(T, C15A.sStop) - C15A.back0); if (T < C15A.go) return C15A.mx + 3.6 * (C15A.sStop - C15A.back0);
  const u = T - C15A.go; return C15A.mx + 3.6 * (C15A.sStop - C15A.back0) + 150 * u * u / (2 * 1.4) * (u < 1.4 ? 1 : 0) + (u >= 1.4 ? 150 * 1.4 / 2 + 150 * (u - 1.4) : 0);
}
function c15SukX(T) { return c15Lerp(C15A.sx0, C15A.sx1, c15E((T - C15A.sIn) / (C15A.sStop - C15A.sIn))); }
const c15Lerp = (a, b, t) => a + (b - a) * t;
const C15BEAT = (() => { const o = []; let t = 11.8; while (t < 34.6) { o.push(t); const u = (t - 11.8) / 22.8; t += 1.15 - 0.5 * u; } return o; })();      // (a heart that speeds up from 11.8 s to the word at 34.5 s)
function c15Wheel(T) {      // what is left of the wheel: pieces of a thick ring and a few spokes on the floor, dull gold with the glow of embers in the cracks
  const pieces = [[-34, 14, 30, 0.2, 1.5], [-6, 8, 24, 3.3, 4.3], [22, 11, 18, 1.2, 2.2]]; ctx.lineWidth = 3; ctx.lineCap = 'butt';
  for (const [x, , r, a0, a1] of pieces) { ctx.save(); ctx.translate(x, -r * 0.18); ctx.scale(1, 0.3); ctx.strokeStyle = '#4a3a1c'; ctx.lineWidth = 5; ctx.beginPath(); ctx.arc(0, 0, r, a0, a1); ctx.stroke(); ctx.strokeStyle = '#a08a48'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(0, -1, r, a0, a1); ctx.stroke(); ctx.strokeStyle = 'rgba(255,140,60,' + (0.4 + 0.3 * Math.sin(T * 5 + x)).toFixed(2) + ')'; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(0, 0, r - 1, a0 + 0.05, a1 - 0.05); ctx.stroke(); ctx.restore(); }
  for (const [x, a] of [[-52, 0.3], [-20, -0.5], [4, 0.9], [40, -0.2]]) { ctx.save(); ctx.translate(x, -2); ctx.rotate(a * 0.25); ctx.fillStyle = '#4a3a1c'; ctx.fillRect(-7, -3, 14, 4); ctx.fillStyle = '#a08a48'; ctx.fillRect(-7, -3, 14, 2); ctx.restore(); }
}
function c15AfterWorld(now, dt, T, cam) {      // everything that stands on the roof, in world coordinates
  const st = story.c15, mx = c15MegX(T), sk = T >= C15A.sIn ? c15SukX(T) : null, kneel = T < 14.4, rise = T >= 14.4 && T < C15A.sIn;
  c15Roof(-700, 1400, 0, 5); for (const [x, k] of [[-120, 'vent'], [150, 'ac'], [210, 'tank'], [-300, 'antenna'], [330, 'crate']]) c15Prop(k, x, 0, T);
  c15Wheel(T); for (const b of st.blood) { ctx.fillStyle = b.c; ctx.fillRect(Math.round(b.x), 0 - 1 + b.y, b.w, 1); }
  ctx.fillStyle = 'rgba(0,0,0,0.4)'; ctx.fillRect(Math.round(mx - 9), 0, 18, 2); if (sk !== null) ctx.fillRect(Math.round(sk - 10), 0, 20, 2);
  // Megumi: facing left until he turns, then running right
  let img, flip = true; const t = T;
  if (kneel) img = c15Meg(c15MegPoses.kneel(t)); else if (rise) img = c15Meg(c15MegPoses.rise((T - 14.4) / (C15A.sIn - 14.4)));
  else if (T < C15A.back0) img = c15Meg(T > C15A.sIn ? c15MegPoses.shock(t) : c15MegPoses.stand(t)); else if (T < C15A.sStop) img = c15Meg(c15MegPoses.backstep(-(T - C15A.back0) * 1.6));
  else if (T < C15A.turn) img = c15Meg(c15MegPoses.shock(t)); else if (T < C15A.go) { const u = (T - C15A.turn) / (C15A.go - C15A.turn); img = c15Meg(c15MegPoses.skid(0)); flip = u < 0.5; }
  else { img = c15Meg(c15MegPoses.run((T - C15A.go) * 2.6)); flip = false; }
  ctx.save(); ctx.translate(Math.round(mx), 0); if (T >= C15A.turn && T < C15A.go) { const u = (T - C15A.turn) / (C15A.go - C15A.turn); ctx.scale(Math.max(0.15, Math.abs(Math.cos(u * Math.PI))), 1); }
  c15Sprite(img, 0, 0, flip && !(T >= C15A.turn && T < C15A.go && (T - C15A.turn) / (C15A.go - C15A.turn) >= 0.5), C15MG.BASE); ctx.restore();
  // Sukuna: a dark shape in the smoke when he arrives, the walk of the free play sprite
  if (sk !== null && typeof CU_GAME !== 'undefined' && CU_GAME[3] && CU_GAME[3].walk && CU_GAME[3].walk.length) {
    const wk = CU_GAME[3].walk, ph = Math.max(0, T - C15A.sIn) * 9, fi = Math.floor(ph) % wk.length, dk = c15S(T, C15A.sIn, C15A.sIn + 9); let pic = wk[fi]; if (dk < 1) pic = c15Tint(pic, 'rgba(8,10,28,' + (0.85 * (1 - dk)).toFixed(2) + ')');
    c15Sprite(pic, sk, 0, false, 61); if (T < C15A.sStop && (fi === 0 || fi === 7) && st.sf !== fi + ':' + Math.floor(ph / 15)) { st.sf = fi + ':' + Math.floor(ph / 15); snd('mfoot'); c15Spawn('dust', sk + 6, -1, 4, { sx: 10, vx: 0, rx: 40, vy: -6, ry: 12, life: 0.9, s: 1.4 }); if (cam.z > 1.2 || T < C15A.sIn + 6) c15Shake(1.4, 250); }
  }
  c15DrawParts();
}
function c15After(now, dt, T) {
  const st = story.c15; st.t = T; c15Parts(dt); if (!st.blood) st.blood = [];
  // the shots: the camera (x, y, z) in world coordinates
  const mx = c15MegX(T), sk = c15SukX(T); let cam;
  if (T < 11.8) { const u = c15E(c15S(T, C15.after, 11.8)); cam = { x: c15Lerp(20, 62, u), y: c15Lerp(-56, -8, c15E(u * 1.15)), z: c15Lerp(1.0, 1.06, u) }; }
  else if (T < 16.8) { const u = c15S(T, 11.8, 16.8), r = c15E(c15S(T, 14.4, 17.0)); cam = { x: C15A.mx - 4, y: c15Lerp(-22, -31, r), z: c15Lerp(2.3, 1.85, u) }; }
  else if (T < 22.4) { const u = c15S(T, 16.8, 22.4); cam = { x: c15Lerp(6, 16, u), y: -15, z: c15Lerp(1.1, 1.22, u) }; }
  else if (T < 24.6) cam = { x: sk + 12, y: -13, z: c15Lerp(3.0, 3.3, c15S(T, 22.4, 24.6)) };
  else if (T < 26.6) cam = { x: mx - 6, y: -44, z: c15Lerp(3.3, 3.7, c15S(T, 24.6, 26.6)) };
  else if (T < 28.2) cam = { x: 66, y: -16, z: 1.4 };
  else if (T < 30.0) cam = { x: sk + 14, y: -11, z: c15Lerp(3.2, 3.6, c15S(T, 28.2, 30.0)) };
  else if (T < C15A.go) { const u = c15S(T, 30.0, 35.35); cam = { x: 84, y: -25, z: c15Lerp(1.55, 1.95, u) }; }
  else { const u = c15S(T, C15A.go, 38.0); cam = { x: c15Lerp(84, mx + VW * 0.14, c15E(u)), y: c15Lerp(-25, -7, c15E(u)), z: c15Lerp(1.95, 1.0, c15E(u)) }; }
  const [shx, shy] = c15ShakeOff(); cam.sx = shx; cam.sy = shy + (T < 11.8 ? 0 : Math.sin(T * 1.3) * 0.4);
  c15Sky(T, cam.x, 0); c15Cam(cam, () => c15AfterWorld(now, dt, T, cam));
  if (T >= 16.4 && T < 27) { const sm = c15S(T, 16.4, 17.4) * (1 - c15S(T, 20, 27)), g2 = ctx.createLinearGradient(0, 0, VW * 0.55, 0); g2.addColorStop(0, 'rgba(14,16,40,' + (0.85 * sm).toFixed(2) + ')'); g2.addColorStop(1, 'rgba(14,16,40,0)'); ctx.fillStyle = g2; ctx.fillRect(0, 0, VW * 0.55, VH); }      // (a bank of smoke on the left edge: he comes out of it)
  // the dark of the night comes in at the edges (and closes in as the heart beats faster)
  const vg = ctx.createRadialGradient(VW / 2, VH / 2, VH * 0.35, VW / 2, VH / 2, VH * 0.95), hb = c15Heart(T); vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(10,0,6,' + (0.55 + 0.25 * hb).toFixed(2) + ')'); ctx.fillStyle = vg; ctx.fillRect(0, 0, VW, VH);
  if (T < C15.after + 1.2) { ctx.fillStyle = 'rgba(0,0,0,' + (1 - (T - C15.after) / 1.2).toFixed(2) + ')'; ctx.fillRect(0, 0, VW, VH); }      // (fades up out of the title card)
  c15Talk(T);
}
function c15Heart(T) { let b = 0; for (const t of C15BEAT) { const d = T - t; if (d >= 0 && d < 0.4) b = Math.max(b, 1 - d / 0.4); } return b; }
function c15Events(T) {      // the sounds and the small things that happen on the roof (each once)
  const st = story.c15; if (!st.blood) st.blood = []; if (st.hb === undefined) st.hb = -1;
  while (st.hb + 1 < C15BEAT.length && T >= C15BEAT[st.hb + 1]) { st.hb++; if (T - C15BEAT[st.hb] < 0.5) snd('c7beat', T > 26 ? 1 : 0); }
  if (T >= C15.after && T < C15.run) {
    if (T >= C15A.sIn && T < C15A.sIn + 0.4) once2('sIn', () => { snd('land', 1.8); snd('c7thud', 1); c15Shake(3.5, 700); c15Spawn('dust', c15SukX(T) + 10, -1, 14, { sx: 30, rx: 60, vy: -10, ry: 20, life: 1.4, s: 2 }); });
    const wp = [[14.4, 'rise'], [C15A.turn, 'turn']]; for (const [t, k] of wp) if (T >= t && T < t + 0.4) once2(k, () => { if (k === 'rise') snd('gasp', 0); else { snd('gasp', 1); snd('dash', 1); } });
    if (T >= 29.4 && T < 29.8) once2('crunch', () => { snd('c4crunch'); c15Shake(2.5, 400); c15Spawn('spark', c15SukX(T) + 10, -4, 10, { sx: 8, rx: 80, vy: -30, ry: 40, life: 0.5 }); });
    if (T >= 34.5 && T < 34.9) once2('sword', () => snd('c8crack'));
    if (T >= C15A.go && T < C15A.go + 0.2) once2('go1', () => snd('step', 0, false));
    // ashes drift across the roof, embers from the wheel; blood drips from his hand while he kneels
    if (Math.random() < 0.5) c15Spawn('ash', st.t !== undefined ? st.t * 0 + 300 : 300, -10 - Math.random() * 60, 1, { sx: 80, sy: 20, vx: -22, rx: 14, vy: -3, ry: 6, life: 6 });
    if (Math.random() < 0.18) c15Spawn('ash', -34 + Math.random() * 60, -6, 1, { vx: -4, rx: 8, vy: -14, ry: 8, life: 3, s: 1 });
    if (SET.gore === 0 && T < 14.4 && Math.floor((T - 6) / 1.25) !== st.dr) { st.dr = Math.floor((T - 6) / 1.25); if (T > 6.5) { c15Spawn('drop', C15A.mx - 15, -20, 1, { vx: 0, rx: 2, vy: 0, ry: 2, life: 0.5 }); st.blood.push({ x: C15A.mx - 16 + Math.random() * 3, y: 0, w: 2 + (Math.random() * 3 | 0), c: '#8a0f18', at: T }); } }
  }
}

// ================================================================ PART 2: THE CHASE (38 - 158 s): you are Megumi on the roofs. He runs by himself, to the right: TAP = jump (HOLD = higher), SWIPE DOWN / the left side of the screen / Down = slide.
// You cannot lose: a stumble only slows him (he drops back on the screen, Sukuna is closer: the heart beats faster and the edges go red); the catch comes at 158 s whatever you do. What stands on the roofs comes on a SCRIPT (C15SCR: the second of the chase clock it reaches him, what, how wide);
// each thing is put just past the right edge of the screen when it is due, so a stumble never makes them pile up. Sukuna is not seen: his slashes cut the roofs (a red line, then a white cut, a gap that opens and a moment of slow motion) and sweep in from behind at head height (slide);
// far away on the other roofs a black shape runs and leaps along with him (C15GH). The chase clock G runs slower than the song in the slow-motion moments; what he sees (him, the roofs, the things) is a function of G and of what the player did.
const C15R = { vBase: 165, g: 560, jv: 205, holdMax: 0.26, holdG: 0.45, slideT: 0.55, tripT: 0.5, saveT: 0.55, slowD: 1.7, h: 30, hs: 12, w: 5, stage: 5200 };
const C15SCR = [      // [when it reaches him (s), what, how wide]  (crate, vent, ac = jump over; pipe, line, tank = slide under; gap = jump over it (the wide ones need a HELD jump); cut = Sukuna cuts the roof in front of him; hslash = a slash sweeps in from behind at head height)
  [3.0, 'crate'], [5.4, 'vent'], [7.6, 'pipe'], [9.8, 'ac'], [12.0, 'crate'], [12.9, 'crate'], [14.8, 'gap', 44], [17.6, 'tank'], [19.8, 'vent'], [20.9, 'vent'], [22.8, 'line'], [25.4, 'cut', 38], [28.4, 'ac'],
  [31.0, 'pipe'], [32.6, 'pipe'], [34.6, 'gap', 56], [37.0, 'crate'], [38.0, 'crate'], [39.0, 'crate'], [41.6, 'gap', 84], [44.2, 'line'], [45.8, 'tank'], [47.8, 'hslash'], [50.0, 'gap', 52], [52.2, 'vent'], [53.6, 'ac'], [55.6, 'pipe'], [57.0, 'crate'], [58.8, 'cut', 44],
  [61.8, 'vent'], [63.2, 'pipe'], [64.6, 'crate'], [66.0, 'gap', 60], [68.0, 'hslash'], [69.8, 'tank'], [71.2, 'crate'], [72.6, 'crate'], [74.6, 'cut', 40], [77.0, 'line'], [78.4, 'vent'], [80.0, 'gap', 92], [82.6, 'pipe'], [84.0, 'hslash'], [85.8, 'ac'], [87.4, 'crate'], [89.0, 'gap', 58],
  [92.0, 'cut', 42], [94.4, 'pipe'], [95.8, 'crate'], [97.2, 'hslash'], [99.0, 'gap', 64], [101.0, 'vent'], [102.4, 'vent'], [104.2, 'cut', 46], [106.6, 'tank'], [108.2, 'ac'], [110.0, 'hslash'], [111.8, 'gap', 100]
];
const C15OB = { crate: [8, 0, 14], vent: [7, 0, 22], ac: [13, 0, 22], tank: [11, 14, 46], pipe: [16, 25, 30], line: [15, 18, 32] };      // half width, and how far above the roof the thing starts and ends (what can hurt him)
const c15Off = () => VW * 0.64 + 36;      // (how far in front of him new things come in: just past the right edge of the screen)
const c15Lead = e => e[1] === 'hslash' ? 1.15 : (c15Off() + (e[1] === 'cut' ? 90 : 0)) / C15R.vBase;      // (the seconds from a thing coming in to its reaching him)
const C15GH = [{ t: 77.2, d: 3.6, s: 0 }, { t: 98.8, d: 3.2, s: 1 }, { t: 121.0, d: 11.0, s: 2 }];      // (the black shape on the far roofs, song time: it crosses; it crosses; it stops on a roof in front of the moon and watches, then leaps away)
function c15RunInit(T) {
  const st = story.c15, G0 = Math.max(0, T - C15.run), x = c15MegX(Math.min(T, C15.run)) + (T > C15.run ? 150 * (T - C15.run) : 0);
  st.run = { x, x0: x - 150 * G0, v: 150, h: 0, vh: 0, mode: 'run', mt: 0, hold: 0, holdOn: false, jbuf: 0, sbuf: 0, coy: 0, ph: (((T - C15A.go) * 2.6) % 1 + 1) % 1, lead: 0, bump: 0, hits: 0, inv: 0, slowT: 9, G: G0, slow: null, si: 0, obs: [], gaps: [], cuts: [], sl: [], fx: [], hbAt: T + 1, pulse: 0, hint: {}, hintAt: -9, sx0: 0, sx1: 0, stepN: -1, saves: 0, tilt: 0, tiltAt: -9 };
  while (st.run.si < C15SCR.length && C15SCR[st.run.si][0] - c15Lead(C15SCR[st.run.si]) < G0) st.run.si++;
  st.cam = { x: x + VW * 0.14, y: -7, z: 1, rot: 0 };
}
function c15Rate(run, T) {      // the speed of the chase clock (1 = as the song): slow motion in the big moments
  const w = run.slow; if (!w) return 1; const u = T - w.t0; if (u < 0 || u > w.dur) { run.slow = null; return 1; } const k = Math.min(1, u / 0.18, (w.dur - u) / 0.45); return 1 - (1 - w.rate) * c15E(k);
}
function c15SlowMo(run, T, dur, rate) { run.slow = { t0: T, dur, rate }; snd('slowin'); }
const c15Gnd = (run, x) => !run.gaps.some(g => x >= g.x0 && x < g.x1);      // (is there a roof under x?)
function c15AddGap(run, x0, w, kind, T) { run.gaps.push({ x0, x1: x0 + w, k: kind, t: T }); run.gaps.sort((a, b) => a.x0 - b.x0); }
function c15Free(run, x, d) {      // is there room for something at x (nothing within d px)?
  for (const o of run.obs) if (Math.abs(o.x - x) < d) return false;
  for (const g of run.gaps) if (x > g.x0 - d && x < g.x1 + d) return false;
  for (const c of run.cuts) if (Math.abs(c.x + c.w / 2 - x) < d + c.w) return false;
  return true;
}
function c15RunSpawn(run, T) {      // the script: what is due comes onto the roof ahead of him (it waits a moment when there is no room)
  const cam = story.c15.cam;
  while (run.si < C15SCR.length) {
    const e = C15SCR[run.si]; if (run.G < e[0] - c15Lead(e)) break;
    const kind = e[1], w = e[2], xs = Math.max(run.x + c15Off(), cam.x + VW / 2 + 24);
    if (kind === 'hslash') { if (run.sl.length) break; run.sl.push({ state: 0, age: 0, rel: 0, hit: false }); snd('sukcut', 0); }
    else if (kind === 'cut') { if (!c15Free(run, xs + 90 + w / 2, 70)) break; run.cuts.push({ x: xs + 90, w, t0: T + 1.0 }); }
    else if (kind === 'gap') { if (!c15Free(run, xs + w / 2, 60 + w / 2)) break; c15AddGap(run, xs, w, 'gap', T); }
    else { if (!c15Free(run, xs, 60)) break; run.obs.push({ k: kind, x: xs, hit: false }); }
    run.si++;
  }
}
function c15Cut(run, T, c) {      // the cut: a white line through the roof, the piece between the lines drops away, a gap, rubble, a moment of slow motion
  const st = story.c15; run.cuts.splice(run.cuts.indexOf(c), 1); c15AddGap(run, c.x, c.w, 'cut', T); run.fx.push({ k: 'cut', x: c.x, w: c.w, g: run.G });
  c15Shake(5, 800); st.flash = 0.55; c15SlowMo(run, T, 1.6, 0.34); snd('sukcut', 3); snd('c7thud', 1); snd('c8crack');
  c15Spawn('deb', c.x + c.w / 2, -2, 16, { sx: c.w, vy: -70, ry: 60, rx: 100, life: 1.3 }); c15Spawn('dust', c.x + c.w / 2, -2, 12, { sx: c.w, vy: -16, ry: 30, life: 1.4, s: 2 });
}
function c15Hit(run, why) {      // he trips: slowed, dropped back on the screen, the heart beats faster
  if (run.inv > 0 || run.mode === 'save') return false;
  run.mode = 'stumble'; run.mt = 0; run.hits++; run.inv = 1.3; run.slowT = 0; run.bump = Math.min(0.45, run.bump + 0.13); run.lead = Math.min(56, run.lead + 22); run.jbuf = run.sbuf = 0; if (run.h > 0) run.vh = Math.min(run.vh, 0);
  snd('c7thud', 0); snd('gasp', 1); c15Shake(2.8, 380); c15Spawn('dust', run.x, 0, 8, { sx: 14, vy: -20, ry: 20, life: 0.8, s: 1.4 }); run.tilt = 0.045; run.tiltAt = story.T;
  if (why === 'hs') { story.c15.flash = 0.3; if (SET.gore === 0) c15Spawn('drop', run.x + 3, -run.h - 20, 7, { sx: 4, rx: 60, vx: -30, vy: -50, ry: 40, life: 0.8 }); else c15Spawn('spark', run.x + 3, -run.h - 20, 8, { sx: 4, rx: 90, vy: -30, ry: 50, life: 0.5 }); }
  return true;
}
function c15Jump(run) { run.vh = C15R.jv; run.h = 0.001; run.mode = 'air'; run.mt = 0; run.hold = 0; run.jbuf = 0; run.coy = 9; snd('jump'); c15Spawn('dust', run.x - 2, -1, 4, { sx: 8, vy: -8, ry: 8, life: 0.6 }); }
function c15Slide(run) { run.mode = 'slide'; run.mt = 0; run.sbuf = 0; snd('dash', 1); c15Spawn('dust', run.x - 6, -1, 6, { sx: 10, vx: -30, rx: 20, vy: -6, ry: 8, life: 0.7, s: 1.2 }); }
function c15Save(run) {      // he ran off the edge without jumping, or fell short: a desperate scramble over the rest of the gap (no falling): he comes out the far side stumbling
  const g = run.gaps.find(q => run.x >= q.x0 && run.x < q.x1); run.mode = 'save'; run.mt = 0; run.sx0 = run.x; run.sx1 = (g ? g.x1 : run.x + 40) + 6; run.h = Math.max(run.h, 0); run.vh = 0; run.jbuf = run.sbuf = 0; run.saves++; snd('gasp', 2); story.c15.flash = 0.18;
}
function c15RunStep(run, T, dt, live) {      // one step of the chase clock (live = false: the catch, nothing to dodge any more)
  const R = C15R; run.mt += dt; run.inv = Math.max(0, run.inv - dt); run.jbuf = Math.max(0, run.jbuf - dt); run.sbuf = Math.max(0, run.sbuf - dt); run.slowT += dt; run.lead = Math.max(0, run.lead - 9 * dt); run.bump = Math.max(0, run.bump - 0.018 * dt);
  if (run.mode === 'save') {
    const u = c15Cl(run.mt / R.saveT, 0, 1); run.x = run.sx0 + (run.sx1 - run.sx0) * c15E(u); run.h = 18 * Math.sin(Math.PI * u); run.vh = 18 * Math.PI * Math.cos(Math.PI * u) / R.saveT;
    if (u >= 1) { run.h = 0; run.vh = 0; run.mode = 'stumble'; run.mt = 0.25; run.inv = 1.2; run.slowT = 0; run.bump = Math.min(0.45, run.bump + 0.12); run.lead = Math.min(56, run.lead + 20); snd('land', 0.8); c15Shake(2.2, 320); c15Spawn('dust', run.x, 0, 8, { sx: 14, vy: -18, ry: 18, life: 0.8, s: 1.4 }); }
    return;
  }
  const spd = run.slowT < R.slowD ? 0.4 + 0.6 * c15E(run.slowT / R.slowD) : 1; run.v += (R.vBase * spd * (run.mode === 'slide' ? 0.97 : 1) - run.v) * Math.min(1, dt * 10); run.x += run.v * dt;
  const gnd = c15Gnd(run, run.x), air = run.h > 0 || run.vh > 0; if (!air) run.coy = gnd ? 0 : run.coy + dt;
  const able = live && (run.mode !== 'stumble' || run.mt > 0.28);
  if (able && run.jbuf > 0 && !air && (gnd || run.coy < 0.08)) c15Jump(run); else if (able && run.sbuf > 0 && !air && gnd && run.mode !== 'slide') c15Slide(run);
  if (run.h > 0 || run.vh > 0) {      // in the air (a held jump goes on rising for a moment)
    const up = live && run.vh > 0 && run.holdOn && run.hold < R.holdMax && run.mode === 'air'; if (up) run.hold += dt;
    run.vh -= R.g * (up ? R.holdG : 1) * dt; run.h += run.vh * dt;
    if (run.h <= 0 && run.vh <= 0) {
      if (gnd) { const fall = -run.vh; run.h = 0; run.vh = 0; if (run.mode === 'air') { run.mode = 'run'; run.mt = 0; } snd('land', 0.7); c15Spawn('dust', run.x, -1, 5, { sx: 10, vy: -8, ry: 8, life: 0.7 }); if (fall > 220) c15Shake(1.2, 200); }
      else if (run.h < -3) c15Save(run);
    }
  } else if (!gnd && run.coy >= 0.08) c15Save(run);      // (ran off an edge)
  if (run.mode === 'slide' && run.mt >= R.slideT) { run.mode = 'run'; run.mt = 0; }
  if (run.mode === 'stumble' && run.mt >= R.tripT) { run.mode = run.h > 0 ? 'air' : 'run'; run.mt = 0; }
  if (run.mode !== 'air' && run.mode !== 'stumble' && run.h === 0) run.ph = (run.ph + run.v / 57 * dt) % 1;
  else if (run.mode === 'stumble') run.ph = (run.ph + run.v / 57 * dt) % 1;
  if (!live || run.mode === 'save') return;
  if (run.inv <= 0) {      // what can hurt him
    const ht = run.mode === 'slide' ? R.hs : R.h;
    for (const o of run.obs) { if (o.hit) continue; const [hw, lo, hi] = C15OB[o.k]; if (Math.abs(o.x - run.x) < hw + R.w - 3 && run.h < hi - 3 && run.h + ht > lo + 2) { o.hit = true; c15Hit(run, o.k); if (o.k === 'crate') c15Spawn('deb', o.x, -8, 12, { sx: 12, vx: 40, rx: 100, vy: -50, ry: 60, life: 1.1 }); break; } }
    for (const s of run.sl) if (s.state === 1 && !s.hit && Math.abs(s.rel) < 12 && run.h < 39 && run.h + ht > 18) { s.hit = true; c15Hit(run, 'hs'); }
  }
  for (const s of run.sl) {      // the slashes: a red glint at the left edge, then it sweeps in
    if (s.state === 0) { s.age += dt; if (s.age >= 0.55) { s.state = 1; s.rel = VW * 0.36 + run.lead + 44; snd('sukcut', 2); } }
    else { const was = s.rel; s.rel -= 250 * dt; if (was > 0 && s.rel <= 0) { c15Spawn('spark', run.x, -30, 6, { sx: 6, rx: 90, vy: -10, ry: 40, life: 0.45 }); if (!s.hit) { run.tilt = -0.03; run.tiltAt = story.T; } } if (s.rel < -170) s.state = 2; }
  }
  run.sl = run.sl.filter(s => s.state < 2);
  for (const c of run.cuts.slice()) if (T >= c.t0) c15Cut(run, T, c);
  const back = run.x - VW; run.obs = run.obs.filter(o => o.x > back); run.gaps = run.gaps.filter(g => g.x1 > back - 120); run.fx = run.fx.filter(f => run.G - f.g < 3);
}
function c15Near(run) { return Math.min(1, 0.12 + 0.5 * c15Cl(run.G / 118, 0, 1) + run.bump); }      // (how close Sukuna is, 0 - 1)
function c15RunBot(run, T) {      // for the tests: the next thing on the roof is cleared with the right move (window.__c15Bot) - or nothing is done at all (window.__c15Idle)
  let best = null; const see = (k, d, w) => { if (d > -6 && (!best || d < best.d)) best = { k, d, w }; };
  for (const o of run.obs) if (!o.hit) see(o.k, o.x - run.x); for (const g of run.gaps) see('gap', g.x0 - run.x, g.x1 - g.x0); for (const c of run.cuts) see('gap', c.x - run.x, c.w);
  if (run.sl.some(s => s.state === 1 && s.rel < 74 && s.rel > -14) && run.mode === 'run') run.sbuf = 0.2;
  if (!best) { run.holdOn = false; return; }
  const { k, d, w } = best;
  if (k === 'pipe' || k === 'line' || k === 'tank') { if (d < 36 && run.mode === 'run') run.sbuf = 0.2; }
  else if (k === 'gap') { if (d < 14 && (run.mode === 'run' || run.mode === 'slide')) { run.jbuf = 0.2; run.holdOn = w > 70; } }
  else if (d < (k === 'ac' ? 60 : k === 'vent' ? 58 : 55) && run.mode === 'run') { run.jbuf = 0.2; run.holdOn = false; }
  if (run.mode === 'air' && k !== 'gap') run.holdOn = false;
}
function c15Zone(ev) { try { const r = cv.getBoundingClientRect(); return [(ev.clientX - r.left) / r.width * VW, (ev.clientY - r.top) / r.height * VH]; } catch { return [VW, 0]; } }
c15RunInput = function (kind, ev) {
  const st = story.c15, run = st && st.run; if (!run) return;
  if (kind === 'down') { if (ev && c15Zone(ev)[0] < VW * 0.22) { run.sbuf = 0.16; return; } run.jbuf = 0.14; run.holdOn = true; if (ev) { st.pj = ev.pointerId; st.py = ev.clientY; st.pdt = pnow(); } }
  else if (kind === 'up') { if (!ev || ev.pointerId === st.pj) { run.holdOn = false; st.pj = undefined; } }
  else if (kind === 'slide') run.sbuf = 0.16;
};
window.addEventListener('pointermove', ev => {      // a swipe down with the jumping finger = slide (the jump that began with the touch is taken back if it has hardly begun)
  const st = story && story.c15, run = st && st.run; if (!run || st.pj === undefined || ev.pointerId !== st.pj || st.py === undefined) return;
  const r = cv.getBoundingClientRect(); if ((ev.clientY - st.py) / r.height * VH > 16 && pnow() - st.pdt < 450) { st.py = undefined; run.holdOn = false; run.jbuf = 0; run.sbuf = 0.16; if (run.mode === 'air' && run.h < 16 && run.mt < 0.2) { run.h = 0; run.vh = 0; run.mode = 'run'; } }
});
// ---- the look of the chase: nearer roofs, a crane, glass towers, a red glow, the black shape on the far roofs. The stage (0 - 3) is a function of the DISTANCE run (p = how many 5200 px stages), so a stumble never moves it
const c15Ln = (g, x0, y0, x1, y1) => { const n = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0)) || 1; for (let i = 0; i <= n; i++) g.fillRect(Math.round(x0 + (x1 - x0) * i / n), Math.round(y0 + (y1 - y0) * i / n), 1, 1); };
const c15Win = (p, a, b, c, d) => c15Cl((p - a) / (b - a), 0, 1) * (1 - c15Cl((p - c) / (d - c), 0, 1));
function c15RunLayers() {
  if (C15S.nh === VH) return; C15S.nh = VH; const mk = (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; };
  let c = mk(760, VH), g = c.getContext('2d'), x = -8, i = 0;      // the nearer roofs
  while (x < 760) {
    const bw = 44 + Math.round(c4R(i, 41) * 56), top = Math.round(VH * (0.58 + c4R(i, 42) * 0.18)), x0 = Math.round(x), r = c4R(i, 43), cx = x0 + Math.round(bw * (0.25 + 0.5 * c4R(i, 45)));
    g.fillStyle = '#070b24'; g.fillRect(x0, top, bw, VH - top); g.fillStyle = '#161e4a'; g.fillRect(x0, top, bw, 1); g.fillRect(x0, top, 1, VH - top); g.fillStyle = '#0b1030'; g.fillRect(x0 + bw - 2, top + 1, 2, VH - top);
    for (let wy = top + 5; wy < VH - 3; wy += 6) for (let wx = x0 + 4; wx < x0 + bw - 5; wx += 6) if (c4R(i * 19 + wy, wx + 3) < 0.13) { g.fillStyle = c4R(wx, wy) < 0.75 ? 'rgba(255,208,120,0.6)' : 'rgba(140,180,255,0.5)'; g.fillRect(wx, wy, 3, 2); }
    g.fillStyle = '#0a0f2c';
    if (r < 0.3) { g.fillRect(cx, top - 16, 1, 16); g.fillRect(cx - 3, top - 12, 7, 1); g.fillRect(cx - 2, top - 8, 5, 1); if (c4R(i, 46) < 0.5) { g.fillStyle = '#ff3a3a'; g.fillRect(cx, top - 18, 1, 2); } }
    else if (r < 0.5) { g.fillRect(cx - 7, top - 11, 14, 10); g.fillStyle = '#161e4a'; g.fillRect(cx - 7, top - 11, 14, 1); }
    else if (r < 0.65) { g.fillRect(cx - 8, top - 8, 16, 8); g.fillStyle = '#161e4a'; g.fillRect(cx - 8, top - 8, 16, 1); g.fillStyle = 'rgba(255,208,120,0.6)'; g.fillRect(cx + 2, top - 5, 3, 3); }
    x += bw + 2 + Math.round(c4R(i, 44) * 8); i++;
  }
  C15S.near = c;
  c = mk(240, VH); g = c.getContext('2d'); const ct = Math.round(VH * 0.2), mx = 120;      // the crane: the mast (a lattice), the long arm, the short arm with its weight, the stays
  g.fillStyle = '#0a1030'; g.fillRect(mx - 4, ct, 1, VH - ct); g.fillRect(mx + 3, ct, 1, VH - ct); g.fillStyle = '#141c48'; for (let y = ct; y < VH - 7; y += 7) { c15Ln(g, mx - 4, y, mx + 3, y + 7); c15Ln(g, mx + 3, y, mx - 4, y + 7); }
  g.fillStyle = '#0a1030'; g.fillRect(mx - 6, ct - 3, 13, 6); g.fillRect(mx - 46, ct - 10, 148, 1); g.fillRect(mx - 46, ct - 2, 148, 1); g.fillStyle = '#141c48'; for (let xx = mx - 46; xx < mx + 100; xx += 8) { c15Ln(g, xx, ct - 2, xx + 4, ct - 10); c15Ln(g, xx + 4, ct - 10, xx + 8, ct - 2); }
  g.fillStyle = '#0a1030'; g.fillRect(mx, ct - 28, 1, 18); c15Ln(g, mx, ct - 28, mx + 100, ct - 10); c15Ln(g, mx, ct - 28, mx - 46, ct - 10); g.fillRect(mx - 46, ct - 2, 12, 9); C15S.crane = c; C15S.craneTop = ct; C15S.craneX = mx;
  c = mk(520, VH); g = c.getContext('2d');      // the glass towers: panels, seams, a slanting shine, a few lit rooms
  [[24, 56, 0.14], [186, 66, 0.06], [356, 50, 0.22]].forEach(([x0, w, t], k) => {
    const top = Math.round(VH * t); g.fillStyle = '#0a1c34'; g.fillRect(x0, top, w, VH - top); for (let xx = x0 + 1; xx < x0 + w - 1; xx += 6) { g.fillStyle = ((xx - x0) / 6 | 0) % 2 ? '#0d2646' : '#0b2038'; g.fillRect(xx, top + 1, 5, VH - top); }
    g.fillStyle = 'rgba(60,130,190,0.35)'; for (let yy = top + 6; yy < VH; yy += 8) g.fillRect(x0, yy, w, 1); g.fillStyle = '#3e86b8'; g.fillRect(x0, top, 1, VH - top); g.fillStyle = '#2a5f8a'; g.fillRect(x0, top, w, 1);
    g.save(); g.beginPath(); g.rect(x0, top, w, VH - top); g.clip(); for (const [a, b, al] of [[0.55, 0.78, 0.11], [0.2, 0.3, 0.07]]) { g.fillStyle = 'rgba(200,230,255,' + al + ')'; g.beginPath(); g.moveTo(x0 + w * a, top); g.lineTo(x0 + w * b, top); g.lineTo(x0 + w * (b - 0.5), VH); g.lineTo(x0 + w * (a - 0.5), VH); g.fill(); } g.restore();
    for (let yy = top + 8; yy < VH - 4; yy += 8) for (let xx = x0 + 3; xx < x0 + w - 5; xx += 6) if (c4R(k * 50 + yy, xx) < 0.07) { g.fillStyle = 'rgba(255,224,160,0.75)'; g.fillRect(xx, yy, 3, 2); }
    g.fillStyle = '#0a1c34'; g.fillRect(x0 + 8, top - 5, w - 16, 5); g.fillRect(x0 + (w >> 1), top - 15, 1, 10); g.fillStyle = '#ff3a3a'; g.fillRect(x0 + (w >> 1), top - 16, 1, 1);
  });
  C15S.glass = c;
}
function c15Strip(img, par, cx, gap) { const w = img.width + gap, off = Math.round(((cx * par) % w + w) % w); for (let x = -off; x < VW; x += w) ctx.drawImage(img, x, 0); return off; }
function c15Ghost(T) {      // the black shape on the far roofs: it runs and leaps along with him, then stands in front of the moon and watches
  const D = typeof CU_GAME !== 'undefined' && CU_GAME[3], idle = D && D.frames && D.frames[0]; if (!idle) return; const wk = D.walk && D.walk.length ? D.walk : [idle], sc = 0.62, y0 = Math.round(VH * 0.6);
  for (const g of C15GH) {
    const u = (T - g.t) / g.d; if (u < 0 || u > 1) continue; let x, y = y0, mv = true;
    if (g.s < 2) { x = c15Lerp(-26, VW + 26, u); y = y0 - Math.abs(Math.sin(u * Math.PI * 3)) * 16; }
    else { const a = c15E(c15S(T, g.t, g.t + 3.2)), b = c15E(c15S(T, g.t + 8.4, g.t + 11)); x = c15Lerp(-26, VW * 0.68, a) + (VW + 40 - VW * 0.68) * b; mv = a < 1 || b > 0; if (mv) y = y0 - Math.abs(Math.sin((a + b) * Math.PI * 3)) * 14; }
    const pic = mv ? wk[Math.floor(T * 9) % wk.length] : idle, t = c15Tint(pic, 'rgba(2,3,12,0.95)'), al = Math.min(1, u * 8, (1 - u) * 8); ctx.globalAlpha = al; ctx.drawImage(t, Math.round(x - 32 * sc), Math.round(y - 61 * sc), Math.round(64 * sc), Math.round(64 * sc));
    if (!mv || Math.floor(T * 2) % 3 !== 0) { ctx.fillStyle = '#ff2a3a'; ctx.fillRect(Math.round(x + 5 * sc), Math.round(y - 50 * sc), 2, 1); }      // (the eyes)
    ctx.globalAlpha = 1;
  }
}
function c15RunBack(T, run, cam, p) {
  c15RunLayers(); const ca = c15Win(p, 0.55, 0.95, 1.8, 2.2), ga = c15Win(p, 1.5, 1.9, 2.9, 3.3), cx = cam.x;
  if (ga > 0.01) { ctx.globalAlpha = ga; c15Strip(C15S.glass, 0.42, cx, 200); ctx.globalAlpha = 1; }
  if (ca > 0.01) { ctx.globalAlpha = ca; const off = c15Strip(C15S.crane, 0.3, cx, 420), w = 660; for (let x = -off; x < VW; x += w) { const sw = Math.sin(T * 0.9) * 2, hx = Math.round(x + C15S.craneX + 62 + sw), ty = C15S.craneTop; ctx.fillStyle = '#0a1030'; ctx.fillRect(hx, ty, 1, 38); ctx.fillRect(hx - 1, ty + 38, 3, 3); ctx.fillRect(hx - 10 + Math.round(sw), ty + 41, 21, 3); ctx.fillStyle = '#141c48'; ctx.fillRect(hx - 10 + Math.round(sw), ty + 41, 21, 1); if (Math.floor(T * 1.2) % 2 === 0) { ctx.fillStyle = '#ff3a3a'; ctx.fillRect(Math.round(x + C15S.craneX), ty - 30, 2, 2); } } ctx.globalAlpha = 1; }
  c15Strip(C15S.near, 0.55, cx, 0); c15Ghost(T);
  const fa = c15Cl((p - 2.5) / 0.5, 0, 1); if (fa > 0.01) { const gl = ctx.createLinearGradient(0, VH * 0.4, 0, VH); gl.addColorStop(0, 'rgba(190,30,40,0)'); gl.addColorStop(1, 'rgba(210,60,40,' + (0.3 * fa * (0.85 + 0.15 * Math.sin(T * 3))).toFixed(2) + ')'); ctx.fillStyle = gl; ctx.fillRect(0, VH * 0.4, VW, VH * 0.6); }
}
const C15PAL = [['#0b0f26', '#1b2147', '#323c76', '#141a3c'], ['#0e1026', '#252a4a', '#464c80', '#181c3a'], ['#08182c', '#0f2f4a', '#3c7aa8', '#0c2038'], ['#160a14', '#2c1624', '#b04050', '#200c1a']];      // (a roof by stage: the face, the top, the lit lip, the seams)
const c15Rgb = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16));
function c15Pal(p) { const a = c15Cl(Math.floor(p), 0, 3), b = Math.min(3, a + 1), f = c15Cl(p - a, 0, 1), o = []; for (let k = 0; k < 4; k++) { const u = c15Rgb(C15PAL[a][k]), v = c15Rgb(C15PAL[b][k]); o.push('rgb(' + [0, 1, 2].map(i => Math.round(u[i] + (v[i] - u[i]) * f)).join(',') + ')'); } return o; }
function c15Roof2(x0, x1, pal, p) {      // a stretch of roof between x0 and x1: its pattern belongs to the world, not to the piece, so it never swims
  const w = x1 - x0; if (w <= 0) return; ctx.save(); ctx.beginPath(); ctx.rect(x0, -90, w, 480); ctx.clip();
  ctx.fillStyle = pal[0]; ctx.fillRect(x0, 0, w, 260); ctx.fillStyle = pal[1]; ctx.fillRect(x0, 0, w, 7); ctx.fillStyle = pal[2]; ctx.fillRect(x0, 0, w, 1); ctx.fillStyle = pal[3]; ctx.fillRect(x0, 7, w, 2);
  const st = c15Cl(Math.floor(p), 0, 3);
  for (let k = Math.floor(x0 / 24) - 1; k <= Math.floor(x1 / 24); k++) { const cx = k * 24, r1 = c4R(k, 21), r2 = c4R(k, 22); ctx.fillStyle = pal[3]; ctx.fillRect(cx, 1, 1, 6); if (r1 < 0.3) { ctx.fillStyle = 'rgba(0,0,8,0.35)'; ctx.fillRect(cx + 4, 2, 6 + (r2 * 10 | 0), 2); } if (st === 2 && r1 > 0.86) { ctx.fillStyle = 'rgba(90,170,220,0.45)'; ctx.fillRect(cx + 3, 1, 14, 3); ctx.fillStyle = 'rgba(220,240,255,0.5)'; ctx.fillRect(cx + 6, 1, 2, 3); } if (st === 3 && r1 > 0.8) { ctx.fillStyle = '#04030a'; ctx.fillRect(cx + 5, 1, 1, 5); ctx.fillRect(cx + 6, 3, 2, 1); ctx.fillStyle = 'rgba(255,110,50,0.5)'; ctx.fillRect(cx + 5, 6, 3, 1); } }
  for (let wk = Math.floor(x0 / 14) - 1; wk <= Math.floor(x1 / 14); wk++) for (let wy = 14; wy < 70; wy += 12) { const r = c4R(wk * 31 + wy, 7); if (r < 0.17) { ctx.fillStyle = st === 2 ? 'rgba(140,210,255,0.6)' : st === 3 ? 'rgba(255,120,60,0.6)' : 'rgba(255,217,138,0.7)'; ctx.fillRect(wk * 14 + 8, wy, 7, 6); } else { ctx.fillStyle = pal[3]; ctx.fillRect(wk * 14 + 8, wy, 7, 6); } }
  ctx.restore();
}
function c15Gap(g, T, p) {      // a gap between two roofs: the dark of the alley with the walls lit by the moon
  const w = g.x1 - g.x0, dp = ctx.createLinearGradient(0, 3, 0, 150); dp.addColorStop(0, '#0a0e24'); dp.addColorStop(1, '#010208'); ctx.fillStyle = dp; ctx.fillRect(g.x0, 3, w, 280);
  ctx.fillStyle = '#10163a'; ctx.fillRect(g.x0 - 2, 7, 2, 280); ctx.fillRect(g.x1, 7, 2, 280); ctx.fillStyle = '#3a4580'; ctx.fillRect(g.x0 - 2, 0, 2, 7); ctx.fillRect(g.x1, 0, 2, 7);
  if (p > 2.4) { const a = c15Cl((p - 2.4) / 0.6, 0, 1); ctx.fillStyle = 'rgba(255,90,40,' + (0.16 * a).toFixed(2) + ')'; ctx.fillRect(g.x0, 40, w, 240); }
}
const C15DEC = [['ant', 'hut', 'dish'], ['scaf', 'ant', 'ladder'], ['sign', 'dish', 'hut'], ['rebar', 'ladder', 'scaf']];      // (the things on the far side of the roof, by stage; dark and flat: they are behind him)
function c15Dec(kind, x, T) {
  ctx.fillStyle = '#0a0f2c';
  if (kind === 'ant') { ctx.fillRect(x, -44, 1, 44); ctx.fillRect(x - 5, -36, 11, 1); ctx.fillRect(x - 4, -29, 9, 1); ctx.fillRect(x - 3, -22, 7, 1); if (Math.floor(T * 1.3 + x) % 2 === 0) { ctx.fillStyle = '#ff3a3a'; ctx.fillRect(x, -46, 1, 2); } }
  else if (kind === 'hut') { ctx.fillRect(x - 12, -22, 24, 22); ctx.fillStyle = '#161e4a'; ctx.fillRect(x - 12, -22, 24, 1); ctx.fillStyle = '#04061a'; ctx.fillRect(x - 3, -12, 6, 12); ctx.fillStyle = 'rgba(255,208,120,0.7)'; ctx.fillRect(x + 6, -16, 3, 3); }
  else if (kind === 'dish') { ctx.fillRect(x - 1, -14, 2, 14); ctx.beginPath(); ctx.ellipse(x, -20, 10, 5, -0.6, 0, 7); ctx.fill(); ctx.fillStyle = '#161e4a'; ctx.fillRect(x - 6, -24, 3, 1); }
  else if (kind === 'scaf') { for (const dx of [-12, 12]) ctx.fillRect(x + dx, -38, 1, 38); for (let y = -38; y <= 0; y += 12) ctx.fillRect(x - 12, y, 25, 1); ctx.fillStyle = '#161e4a'; for (let y = -38; y < 0; y += 12) c15Ln(ctx, x - 12, y + 12, x + 12, y); }
  else if (kind === 'ladder') { ctx.fillRect(x - 3, -34, 1, 34); ctx.fillRect(x + 3, -34, 1, 34); for (let y = -32; y < 0; y += 4) ctx.fillRect(x - 3, y, 7, 1); }
  else if (kind === 'sign') { ctx.fillRect(x - 12, -8, 2, 8); ctx.fillRect(x + 10, -8, 2, 8); ctx.fillRect(x - 15, -28, 30, 20); ctx.fillStyle = 'rgba(120,200,255,0.35)'; ctx.fillRect(x - 13, -26, 26, 16); ctx.fillStyle = 'rgba(220,245,255,0.4)'; ctx.fillRect(x - 10, -23, 12, 2); ctx.fillRect(x - 10, -18, 18, 1); }
  else if (kind === 'rebar') { ctx.fillRect(x - 10, -16, 20, 16); ctx.fillRect(x - 4, -22, 8, 6); ctx.fillStyle = '#2a1a22'; for (const dx of [-8, -2, 5]) ctx.fillRect(x + dx, -30 + ((dx * 7) & 7), 1, 16); ctx.fillStyle = 'rgba(255,110,50,0.5)'; ctx.fillRect(x - 10, -2, 20, 2); }
}
function c15Slash(x, y, a) {      // a slash in the air: a thin bright crescent that leans forward, with a red edge and a trail behind it
  ctx.globalAlpha = a; for (let i = 0; i < 4; i++) { ctx.fillStyle = 'rgba(255,70,90,' + (0.5 - i * 0.11).toFixed(2) + ')'; ctx.fillRect(Math.round(x - 40 + i * 4), Math.round(y - 5 + i * 3), 34 - i * 4, 1); }
  for (let th = -1.15; th <= 1.15; th += 0.09) { const ox = x - 8 + Math.cos(th) * 14, oy = y + Math.sin(th) * 13, ix = x - 12 + Math.cos(th) * 11, iy = y + Math.sin(th) * 10.5; ctx.fillStyle = '#ff3a50'; ctx.fillRect(Math.round(ix), Math.round(iy), 1, 2); ctx.fillStyle = '#ffffff'; ctx.fillRect(Math.round(ox) - 1, Math.round(oy), 2, 2); }
  ctx.globalAlpha = 1;
}
function c15RunPose(run) {
  const R = C15R, qn = (v, s) => Math.round(v / s) * s; let o;
  if (run.mode === 'save' || run.mode === 'air' || run.h > 0.5) o = c15MegPoses.air(qn(-run.vh, 40));
  else if (run.mode === 'slide') o = c15MegPoses.slide(qn(c15Cl(run.mt / R.slideT, 0, 1), 1 / 12));
  else if (run.mode === 'stumble') o = c15MegPoses.stumble(qn(c15Cl(run.mt / 0.5, 0, 1), 1 / 12));
  else o = c15MegPoses.run(Math.floor(run.ph * 12) / 12);
  o.blood = 0.55; return o;
}
function c15RunWorld(now, T, run, cam, p) {      // everything on the roofs, in world coordinates
  const z = cam.z, vx0 = cam.x - VW / (2 * z) - 40, vx1 = cam.x + VW / (2 * z) + 40, pal = c15Pal(p); let cur = vx0;
  for (const g of run.gaps) { if (g.x1 <= vx0) continue; if (g.x0 >= vx1) break; if (g.x0 > cur) c15Roof2(cur, g.x0, pal, p); c15Gap(g, T, p); cur = Math.max(cur, g.x1); } if (cur < vx1) c15Roof2(cur, vx1, pal, p);
  for (const [x, k] of [[-120, 'vent'], [150, 'ac'], [210, 'tank'], [-300, 'antenna'], [330, 'crate']]) if (x > vx0 - 30 && x < vx1 + 30) c15Prop(k, x, 0, T);      // (what stood on the roof of the aftermath)
  for (let k = Math.floor(vx0 / 150); k <= Math.floor(vx1 / 150); k++) {      // the things far on the other side of the roof
    if (c4R(k, 61) > 0.5) continue; const x = k * 150 + 30 + Math.floor(c4R(k, 63) * 90); if (x < run.x0 + 60 || !c15Gnd(run, x) || !c15Gnd(run, x - 16) || !c15Gnd(run, x + 16)) continue;
    ctx.globalAlpha = 0.7; c15Dec(C15DEC[c15Cl(Math.floor((x - run.x0) / C15R.stage), 0, 3)][Math.floor(c4R(k, 62) * 3)], x, T); ctx.globalAlpha = 1;
  }
  for (const c of run.cuts) { const k = c15Cl((T - (c.t0 - 0.9)) / 0.9, 0, 1); if (k > 0) { const x = Math.round(c.x + c.w / 2); ctx.fillStyle = 'rgba(255,40,60,' + (k * 0.22).toFixed(2) + ')'; ctx.fillRect(x - 3, -110, 7, 150); ctx.fillStyle = 'rgba(255,50,70,' + (k * 0.9 * ((Math.floor(T * 30) & 1) ? 1 : 0.65)).toFixed(2) + ')'; ctx.fillRect(x - 1, -110, 2, 150); ctx.fillStyle = 'rgba(255,215,215,' + (k * 0.6).toFixed(2) + ')'; ctx.fillRect(x, -110 + ((T * 90) % 140 | 0), 1, 14); } }
  for (const f of run.fx) {      // the cut itself: two white lines through the roof for a moment, and the piece between them drops away
    const u = run.G - f.g; if (u < 0.45) { ctx.fillStyle = 'rgba(255,255,255,' + (1 - u / 0.45).toFixed(2) + ')'; for (const d of [0, 1]) { c15Ln(ctx, f.x + d, -120, f.x + 16 + d, 70); c15Ln(ctx, f.x + f.w + d, -120, f.x + f.w + 16 + d, 70); } }
    if (u < 1.6) { ctx.save(); ctx.translate(f.x + f.w / 2, 230 * u * u); ctx.rotate(u * 0.35 * ((f.x | 0) & 1 ? 1 : -1)); ctx.fillStyle = '#1b2147'; ctx.fillRect(-f.w / 2, 0, f.w, 7); ctx.fillStyle = '#0b0f26'; ctx.fillRect(-f.w / 2, 7, f.w, 26); ctx.restore(); }
  }
  for (const o of run.obs) { if (o.hit && o.k === 'crate') continue; if (o.x > vx0 - 20 && o.x < vx1 + 20) c15Prop(o.k, o.x, 0, T); }
  for (const s of run.sl) { if (s.state === 0) { const a = c15Cl(s.age / 0.55, 0, 1), x = Math.round(cam.x - VW / (2 * z) + 8); ctx.fillStyle = 'rgba(255,50,70,' + (a * (0.55 + 0.45 * Math.sin(T * 60))).toFixed(2) + ')'; ctx.fillRect(x, -44, 2, 30); ctx.fillStyle = 'rgba(255,230,230,' + (a * 0.9).toFixed(2) + ')'; ctx.fillRect(x, -32, 2, 6); } else c15Slash(run.x - s.rel, -29, 1); }
  if (run.noMeg) return;
  if (c15Gnd(run, run.x)) { const sw = Math.max(6, 10 - run.h * 0.08); ctx.fillStyle = 'rgba(0,0,0,' + Math.max(0.1, 0.38 - run.h * 0.004).toFixed(2) + ')'; ctx.fillRect(Math.round(run.x - sw), 0, Math.round(sw * 2), 2); }
  ctx.globalAlpha = run.inv > 0 && (Math.floor(T * 16) & 1) ? 0.55 : 1; c15Sprite(c15Meg(c15RunPose(run)), run.x, -run.h, false, C15MG.BASE); ctx.globalAlpha = 1;
  c15DrawParts();
}
const C15HINT = { crate: ['TAP = JUMP'], vent: ['TAP = JUMP'], ac: ['TAP = JUMP'], pipe: ['SLIDE UNDER IT: SWIPE DOWN', 'OR TAP THE LEFT SIDE'], line: ['SLIDE UNDER IT'], tank: ['SLIDE UNDER IT'], gap: ['JUMP THE GAP', 'HOLD = HIGHER'], hs: ['SLIDE UNDER THE SLASH!'] };
function c15RunOver(now, T, run, cam, near) {
  const st = story.c15;
  ctx.fillStyle = 'rgba(190,205,255,0.1)'; for (let i = 0; i < 7; i++) { const len = 12 + Math.round(c4R(i, 81) * 14), y = 10 + Math.round(c4R(i, 82) * VH * 0.7), x = VW + 30 - ((cam.x * 1.7 + i * 83) % (VW + 60)); ctx.fillRect(Math.round(x), y, len, 1); }      // (streaks of air)
  if (st.slowK > 0.01) { ctx.fillStyle = 'rgba(30,50,120,' + (0.16 * st.slowK).toFixed(2) + ')'; ctx.fillRect(0, 0, VW, VH); }
  const vg = ctx.createRadialGradient(VW / 2, VH / 2, VH * (0.5 - 0.12 * near), VW / 2, VH / 2, VH); vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(' + (30 + Math.round(60 * near)) + ',0,8,' + (0.5 + 0.3 * near + 0.18 * run.pulse).toFixed(2) + ')'); ctx.fillStyle = vg; ctx.fillRect(0, 0, VW, VH);      // (the dark closes in, red, with every beat)
  const wd = 8 + 56 * near, sg = ctx.createLinearGradient(0, 0, wd, 0); sg.addColorStop(0, 'rgba(2,0,8,' + (0.85 * near).toFixed(2) + ')'); sg.addColorStop(1, 'rgba(2,0,8,0)'); ctx.fillStyle = sg; ctx.fillRect(0, 0, wd, VH);      // (his shadow creeps in from the left)
  if (near > 0.55 && Math.floor(T * 0.8) % 4 !== 0) { const a = c15Cl((near - 0.55) / 0.2, 0, 1), ex = 5 + Math.round(10 * (near - 0.55)); ctx.fillStyle = 'rgba(255,40,60,' + (0.8 * a).toFixed(2) + ')'; ctx.fillRect(ex, Math.round(VH * 0.62), 2, 1); ctx.fillRect(ex + 7, Math.round(VH * 0.62), 2, 1); }
  if (st.flash > 0.01) { ctx.fillStyle = 'rgba(255,255,255,' + Math.min(0.8, st.flash).toFixed(2) + ')'; ctx.fillRect(0, 0, VW, VH); }
  if (T - run.hintAt < 2.6 && run.hintTx) { const a = Math.min(1, (T - run.hintAt) * 3, (2.6 - (T - run.hintAt)) * 3); ctx.globalAlpha = a; run.hintTx.forEach((s, i) => pxt(s, VW / 2, 16 + i * 9, i ? '#9fc4ff' : '#ffffff', 8, 'center')); ctx.globalAlpha = 1; }
  const pa = c15Cl(1 - run.G / 40, 0.18, 0.5); ctx.strokeStyle = 'rgba(255,255,255,' + (pa * 0.7).toFixed(2) + ')'; ctx.lineWidth = 1; ctx.strokeRect(2.5, VH - 24.5, Math.round(VW * 0.22) - 5, 21); ctx.globalAlpha = pa; pxt('SLIDE', Math.round(VW * 0.11), VH - 9, '#ffffff', 8, 'center'); ctx.globalAlpha = 1;      // (the pad on the left: slide)
}
function c15RunSim(now, dt, T, live) {
  const st = story.c15; if (!st.run) c15RunInit(T); const run = st.run, cam = st.cam; if (!live && !run.over) { run.over = 1; run.obs = []; run.cuts = []; run.sl = []; run.gaps = run.gaps.filter(g => g.x0 <= run.x); }
  const rate = live ? c15Rate(run, T) : 1, rdt = Math.min(dt, 0.05), gdt = rdt * rate;
  run.G += gdt; if (live) { if (window.__c15Idle) { run.jbuf = run.sbuf = 0; run.holdOn = false; } else if (window.__c15Bot) c15RunBot(run, T); c15RunSpawn(run, T); }
  c15RunStep(run, T, gdt, live); c15Parts(gdt);
  const k = run.slow ? c15Cl((1 - rate) / 0.66, 0, 1) : 0; st.slowK = k; st.flash = Math.max(0, st.flash - rdt * 2.2);
  const tx = run.x + run.v / 7 + VW * 0.14 + run.lead, ty = -7 - Math.min(run.h, 62) * 0.25;      // (the camera trails him a little: it looks ahead by the amount it lags)
  cam.x += (tx - cam.x) * Math.min(1, gdt * 7); cam.y += (ty - cam.y) * Math.min(1, rdt * 4); cam.z += (1 + 0.14 * k - cam.z) * Math.min(1, rdt * 5);
  const tl = Math.abs(T - run.tiltAt) < 0.35 ? run.tilt * (1 - Math.abs(T - run.tiltAt) / 0.35) : 0; cam.rot += (tl - cam.rot) * Math.min(1, rdt * 14);
  const fl = Math.floor(run.ph * 2); if (run.mode === 'run' && run.h === 0 && fl !== run.stepN) { run.stepN = fl; snd('c15step', fl & 1); if ((fl & 1) === 0 && c15Gnd(run, run.x)) c15Spawn('dust', run.x - 6, -1, 1, { sx: 4, vx: -20, rx: 10, vy: -4, ry: 4, life: 0.5, s: 0.8 }); }
  const near = c15Near(run); run.pulse = Math.max(0, run.pulse - rdt * 3); if (T >= run.hbAt) { run.hbAt = T + 1.35 - 0.85 * near; run.pulse = 1; if (live) snd('c7beat', near > 0.45 ? 1 : 0); }
  if (live) {
    const p = (cam.x - run.x0) / C15R.stage; if (Math.random() < (p > 2.5 ? 0.5 : 0.07)) c15Spawn('ash', cam.x - VW / 2 + Math.random() * VW * 1.3, -Math.random() * 100, 1, { vx: -26, rx: 18, vy: -8, ry: 12, life: 3.2 });
    if (T - run.hintAt > 3) { const cand = [...run.obs.filter(o => !o.hit).map(o => [o.k, o.x - run.x]), ...run.gaps.map(g => ['gap', g.x0 - run.x]), ...run.sl.filter(s => s.state === 0).map(() => ['hs', 0])].filter(([kk, d]) => d >= 0 && d < 150 && !run.hint[kk === 'vent' || kk === 'ac' ? 'crate' : kk === 'line' || kk === 'tank' ? 'pipe' : kk]); if (cand.length) { const kk = cand[0][0]; run.hint[kk === 'vent' || kk === 'ac' ? 'crate' : kk === 'line' || kk === 'tank' ? 'pipe' : kk] = 1; run.hintTx = C15HINT[kk]; run.hintAt = T; } }
  }
}
function c15RunDraw(now, T, run) {
  const st = story.c15, cam = st.cam, near = c15Near(run), p = (cam.x - run.x0) / C15R.stage; c15Sky(T, cam.x, 0); c15RunBack(T, run, cam, p);
  const [shx, shy] = c15ShakeOff(); c15Cam({ x: cam.x, y: cam.y, z: cam.z, sx: shx, sy: shy, rot: cam.rot }, () => c15RunWorld(now, T, run, cam, p)); c15RunOver(now, T, run, cam, near);
}
function c15Run(now, dt, T) { c15RunSim(now, dt, T, true); c15RunDraw(now, T, story.c15.run); }


// ================================================================ PART 3: THE CATCH (157 - 199.4 s): a movie, nothing to play any more. Slow motion: the black shape leaps over the moon and falls in front of him (172 s), he skids, turns and runs, a flash and Sukuna is in front of him,
// he backs away and at 181.8 s a hand clamps his face: a black two-shot against the moon, his eye (twice), his boots kicking in the air, Sukuna's face grinning, a wide shot of the two. A hard cut to black on the swell at 199.4 s.
const C15C = { sl: 0.38, fd: 15, xs: 128 };      // (how slow the leap is, how long it lasts, how far in front of him Sukuna lands)
const C15T = { land: 172.0, stand: 173.8, turn: 175.0, go: 175.35, dash: 176.8, stop: 177.7, grab: 181.8, eye1: 184.4, boots: 186.5, face: 188.8, beat: 190.8, wide: 194.0, last: 197.2 };
const c15CRate = u => { if (u < 0 || u > C15C.fd) return 1; const k = Math.min(1, u / 0.18, (C15C.fd - u) / 0.45); return 1 - (1 - C15C.sl) * c15E(k); };
function c15CS(u) { u = Math.max(0, u); let s = 0; const e = Math.min(u, C15C.fd), n = Math.ceil(e / 0.02); for (let i = 0; i < n; i++) { const a = i * 0.02, b = Math.min(e, a + 0.02); s += c15CRate((a + b) / 2) * (b - a); } return s + Math.max(0, u - C15C.fd); }      // (how long the leap has been, on the clock of the slow motion)
function c15CInit(T) {
  const st = story.c15, run = st.run, u = Math.max(0, T - C15.leap), x = run ? run.x : c15MegX(C15.run) + 150 * (T - C15.run), x0 = x - 165 * c15CS(u), x172 = x0 + 165 * c15CS(C15C.fd);
  st.ct = { x0, x172, xs: x172 + C15C.xs, ph0: (run ? run.ph : 0) - 165 * c15CS(u) / 57, h0: run ? Math.max(0, run.h) : 0, vh0: run ? run.vh : 0, cam0: st.cam ? { x: st.cam.x, y: st.cam.y, z: st.cam.z } : { x: x + VW * 0.14, y: -7, z: 1 }, run0: { gaps: [], obs: [], cuts: [], sl: [], fx: [], x: x0, x0: run ? run.x0 : x0 - 19800, h: 0, G: 0, inv: 0, noMeg: true }, cb: -1 };
}
const C15CB = (() => { const o = []; let t = C15.leap + 0.6; while (t < C15.black) { o.push(t); t += 0.95 - 0.5 * Math.min(1, (t - C15.leap) / 25); } return o; })();      // (his heart, faster and faster)
const c15CHeart = T => { let b = 0; for (const t of C15CB) { const d = T - t; if (d >= 0 && d < 0.4) b = Math.max(b, 1 - d / 0.4); } return b; };
const c15Moon = cx => [Math.round(VW * 0.74 - cx * 0.0012), Math.round(VH * 0.27), Math.round(VH * 0.19)];
function c15CMeg(T) {      // Megumi: { x, flip (faces left), pose, sx (the width of the turn) }
  const ct = story.c15.ct, u = T - C15.leap, xst = ct.x172 + 36, up = T - C15T.go, dist = up < 0.7 ? 150 * up * up : 73.5 + 210 * (up - 0.7), xd = xst - 231, xp = xd - 36;
  if (T < C15T.land) { const ts = c15CS(u), ph = ct.ph0 + 165 * ts / 57, w = c15S(T, 159.2, 160.6) * (1 - c15S(T, 166.4, 168.2)), vh = ct.vh0 - 560 * ts, h = Math.max(0, ct.h0 + ct.vh0 * ts - 280 * ts * ts); return { x: ct.x0 + 165 * ts, h, flip: false, pose: h > 0.5 ? c15MegPoses.air(Math.round(-vh / 40) * 40) : c15MegPoses.lookup(Math.floor((((ph % 1) + 1) % 1) * 12) / 12, Math.round(w * 6) / 6), sx: 1 }; }
  if (T < C15T.turn) { const k = c15E(Math.min(1, (T - C15T.land) / 0.9)); return { x: ct.x172 + 36 * k, flip: false, pose: T < C15T.land + 0.9 ? c15MegPoses.skid(0) : c15MegPoses.shock(T), sx: 1 }; }
  if (T < C15T.go) { const v = (T - C15T.turn) / (C15T.go - C15T.turn); return { x: xst, flip: v < 0.5, pose: c15MegPoses.skid(0), sx: Math.max(0.15, Math.abs(Math.cos(v * Math.PI))) }; }
  if (T < C15T.dash) return { x: xst - dist, flip: true, pose: c15MegPoses.run(Math.floor(up * 2.8 * 12) / 12), sx: 1 };
  if (T < C15T.stop) { const k = c15E((T - C15T.dash) / (C15T.stop - C15T.dash)); return { x: xd - 36 * k, flip: true, pose: c15MegPoses.skid(0), sx: 1 }; }
  return { x: xp + 12 * (T - C15T.stop), flip: true, pose: c15MegPoses.backstep(-Math.floor((T - C15T.stop) * 0.8 * 12) / 12), sx: 1 };
}
function c15CSuk(T) {      // Sukuna in the world after he has landed: { x, flip, img (null = not there yet) }
  const ct = story.c15.ct, D = typeof CU_GAME !== 'undefined' && CU_GAME[3]; if (!D || !D.frames || !D.frames[0] || T < C15T.land) return null; const xst = ct.x172 + 36, xp = xst - 231 - 36;
  if (T < C15T.dash) { const u = T - C15T.land, wk = c15E(c15S(T, C15T.stand, C15T.turn)), pic = u < 0.5 && D.air && D.air[14] ? D.air[14] : u < 1.3 && D.cr && D.cr[6] ? D.cr[6] : wk > 0 && wk < 1 && D.walk ? D.walk[Math.floor((T - C15T.stand) * 3) % D.walk.length] : D.frames[0]; return { x: ct.xs - 16 * wk, flip: true, img: pic }; }
  const w = T - C15T.stop; return { x: xp - 74 + 17 * Math.max(0, w), flip: false, img: D.walk && D.walk.length ? D.walk[Math.floor(Math.max(0, w) * 3) % D.walk.length] : D.frames[0] };
}
function c15CCam(T) {      // the camera of each shot of the wide world shots (x, y, z)
  const ct = story.c15.ct, m = c15CMeg(T), s = c15CSuk(T), mid = s ? (m.x + s.x) / 2 : m.x;
  if (T < 161.2) { const u = c15S(T, C15.leap, 161.2); return { x: m.x + VW * 0.14 + 24 + c15Lerp(0, 8, u), y: c15Lerp(ct.cam0.y, -10, c15E(u)), z: c15Lerp(ct.cam0.z, 1.28, c15E(u)) }; }
  if (T < 164.5) return { x: m.x - 10 + 5 * Math.sin(T * 0.6), y: -36, z: 3.4 };
  if (T < 168.2) return { x: ct.xs - 60, y: -72, z: 1.0 };
  if (T < C15T.land) return { x: ct.xs - 60, y: -34 + 20 * c15S(T, 168.2, C15T.land), z: c15Lerp(1.05, 1.22, c15S(T, 168.2, C15T.land)) };
  if (T < C15T.stand) return { x: ct.xs - 60, y: -22, z: 1.22 + 0.06 * c15S(T, C15T.land, C15T.stand) };
  if (T < C15T.turn) { const u = c15S(T, C15T.stand, C15T.turn); return { x: (ct.x172 + 36 + ct.xs) / 2, y: c15Lerp(-22, -26, u), z: c15Lerp(1.3, 1.55, c15E(u)) }; }
  if (T < C15T.dash) return { x: m.x - 36, y: -22, z: 1.3 };
  if (T < 179.0) return { x: mid, y: -22, z: 1.5 + 0.1 * c15S(T, C15T.stop, 179.0) };
  if (T < 180.4) return { x: mid + 2, y: -6, z: 3.0 + 0.4 * c15S(T, 179.0, 180.4) };
  return { x: m.x - 6, y: -41, z: 3.2 + 0.5 * c15S(T, 180.4, C15T.grab) };
}
function c15CShot(T) { return T < 161.2 ? 'run' : T < 164.5 ? 'face' : T < 168.2 ? 'moon' : T < C15T.land ? 'fall' : T < C15T.dash ? 'land' : T < 177.4 ? 'dash' : T < 179.0 ? 'two' : T < 180.4 ? 'boots' : T < C15T.grab ? 'face2' : T < C15T.eye1 ? 'clamp' : T < C15T.boots ? 'eye' : T < C15T.face ? 'hang' : T < C15T.wide ? 'suk' : T < C15T.last ? 'wide' : 'eye2'; }
function c15Embers(T, n, col, up) {      // sparks that drift up across the screen (a function of the time only)
  for (let i = 0; i < n; i++) { const x = ((c4R(i, 11) * (VW + 40) + T * (6 + c4R(i, 12) * 14)) % (VW + 40)) - 20, y = (((c4R(i, 13) * (VH + 20) - T * up * (8 + c4R(i, 14) * 16)) % (VH + 20)) + VH + 20) % (VH + 20) - 10, a = 0.35 + 0.5 * Math.abs(Math.sin(T * 3 + i)); ctx.fillStyle = 'rgba(' + col + ',' + a.toFixed(2) + ')'; ctx.fillRect(Math.round(x), Math.round(y), 1 + (i % 4 === 0 ? 1 : 0), 1); }
}
function c15CVig(T, a0, red) {      // the dark edges, red, with every beat of his heart
  const hb = c15CHeart(T), vg = ctx.createRadialGradient(VW / 2, VH / 2, VH * 0.4, VW / 2, VH / 2, VH * 1.0); vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(' + red + ',0,8,' + Math.min(0.95, a0 + 0.2 * hb).toFixed(2) + ')'); ctx.fillStyle = vg; ctx.fillRect(0, 0, VW, VH);
}
function c15CWorld(T, cam, actors) {      // the roof, the sky and the far roofs seen from cam, and what the shot puts on the roof
  const st = story.c15, ct = st.ct, run0 = ct.run0, p = (cam.x - run0.x0) / C15R.stage; c15Sky(T, cam.x, 0); c15RunBack(T, run0, cam, p);
  const [shx, shy] = c15ShakeOff(); c15Cam({ x: cam.x, y: cam.y, z: cam.z, sx: shx, sy: shy, rot: 0 }, () => { c15RunWorld(T, T, run0, cam, p); actors(); c15DrawParts(); });
}
function c15CActors(T, cam, o = {}) {      // Megumi and Sukuna on the roof in the wide shots
  const m = c15CMeg(T), s = c15CSuk(T);
  ctx.fillStyle = 'rgba(0,0,0,0.4)'; ctx.fillRect(Math.round(m.x - 9), 0, 18, 2); if (s) ctx.fillRect(Math.round(s.x - 10), 0, 20, 2);
  if (s && !o.noSuk) { if (T < C15T.land + 1.6 && T >= C15T.land) { const k = 1 - c15S(T, C15T.land + 0.3, C15T.land + 1.7); c15Sprite(c15Tint(s.img, 'rgba(6,4,14,' + (0.9 * k).toFixed(2) + ')'), s.x, 0, s.flip, 61); } c15Sprite(s.img, s.x, 0, s.flip, 61); }
  if (!o.noMeg) { ctx.save(); ctx.translate(Math.round(m.x), 0); if (m.sx !== 1) ctx.scale(m.sx, 1); const pp = m.pose; pp.blood = 0.6; c15Sprite(c15Meg(pp), 0, -(m.h || 0), m.flip, C15MG.BASE); ctx.restore(); }
}
function c15CHold(T, o) {      // the black two-shot against the moon: Sukuna holds Megumi up by the face. o.sc = size, o.lift = how far off the ground his feet are
  const cx = story.c15.ct.cam0.x, [mx, my] = c15Moon(cx), sc = o.sc, gy = Math.round(VH * 0.96), hx = o.hx === undefined ? mx : o.hx, hy = o.hy === undefined ? my : o.hy - o.lift, sx = hx - 70 * sc, mp = c15MegPoses.grabbed(T), px = hx + 10 * sc, py = hy + 52 * sc + 2 * Math.sin(T * 1.5);
  const draw = col => {      // (Megumi first, then Sukuna, his arm and his hand over Megumi's face)
    ctx.save(); ctx.translate(Math.round(px), Math.round(py)); ctx.scale(sc, sc); ctx.rotate(0.02 * Math.sin(T * 1.3)); ctx.drawImage(c15Tint(c15Meg(mp), col), -32, -C15MG.BASE); ctx.restore();
    ctx.save(); ctx.translate(Math.round(sx), gy); ctx.scale(sc, sc); ctx.drawImage(c15Tint(CU_GAME[3].frames[0], col), -32, -61); ctx.restore();
    const shx = sx + 3 * sc, shy = gy - 34 * sc, ex = hx - 4 * sc, ey = hy + 1; ctx.strokeStyle = col; ctx.fillStyle = col; ctx.lineCap = 'round'; ctx.lineWidth = 7 * sc; ctx.beginPath(); ctx.moveTo(shx, shy); ctx.quadraticCurveTo((shx + ex) / 2, (shy + ey) / 2 - 6 * sc, ex, ey); ctx.stroke();
    ctx.beginPath(); ctx.arc(ex + 3 * sc, ey, 6.5 * sc, 0, 7); ctx.fill(); for (const a of [-1.1, -0.45, 0.2, 0.85]) { ctx.lineWidth = 2.4 * sc; ctx.beginPath(); ctx.moveTo(ex + 3 * sc, ey); ctx.lineTo(ex + 3 * sc + Math.cos(a) * 11 * sc, ey + Math.sin(a) * 11 * sc); ctx.stroke(); }      // (the hand: a palm and four fingers over his face)
    ctx.lineCap = 'butt';
  };
  ctx.globalAlpha = 0.5; for (const [dx, dy] of [[-1.5, 0], [1.5, 0], [0, -1.5], [0, 1.5]]) { ctx.save(); ctx.translate(dx, dy); draw('#d49ab8'); ctx.restore(); } ctx.globalAlpha = 1; draw('#05030a');
}
function c15CSky2(T, dim) { c15Sky(T, story.c15.ct.cam0.x, dim); }
function c15CEye(T, o) {      // Megumi's eye, large, with the fingers' shadow over his face; o.open, o.pup, o.refl, o.sweat, o.zoom, o.dx, o.dy
  ctx.fillStyle = '#080408'; ctx.fillRect(0, 0, VW, VH); const im = c15Big.eye({ open: Math.round(o.open * 20) / 20, pup: Math.round(o.pup), refl: o.refl ? 1 : 0, sweat: o.sweat || 0, brow: o.brow || 0 }), z = 2, w = im.width * z, h = im.height * z, bx = Math.round((VW - w) / 2 + (o.dx || 0) + Math.sin(T * 17) * (o.tr || 0)), by = Math.round((VH - h) / 2 + 4 + (o.dy || 0));
  ctx.drawImage(im, bx, by, w, h); ctx.fillStyle = 'rgba(10,2,14,0.42)'; ctx.fillRect(0, 0, VW, VH); const g = ctx.createLinearGradient(VW * 0.5, 0, VW, 0); g.addColorStop(0, 'rgba(200,20,40,0)'); g.addColorStop(1, 'rgba(200,20,40,0.28)'); ctx.fillStyle = g; ctx.fillRect(0, 0, VW, VH);
  const fp = o.fp === undefined ? 1 : o.fp; ctx.fillStyle = 'rgba(2,0,6,' + (0.8 * fp).toFixed(2) + ')'; for (let i = 0; i < 4; i++) { ctx.save(); ctx.translate(VW - 18 - i * 34 + (1 - fp) * 60, VH + 4); ctx.rotate(-0.38 + i * 0.04); ctx.fillRect(-9, -128 - i * 4, 18, 150); ctx.restore(); }      // (the four fingers over the lower part of his face)
  c15Embers(T, 18, '255,90,70', 1);
}
function c15CFig(img, x, y, sc, al) { ctx.globalAlpha = al; ctx.drawImage(img, Math.round(x - 32 * sc), Math.round(y - 32 * sc), Math.round(64 * sc), Math.round(64 * sc)); ctx.globalAlpha = 1; }
function c15CLeap(T) {      // the black shape that leaps over the moon (in the sky: screen coordinates)
  const D = CU_GAME[3], air = D && D.air; if (!air || air.length < 15) return; const [mx, my] = c15Moon(story.c15.ct.cam0.x), dk = 'rgba(3,2,10,0.96)'; let u, x, y, sc, fi, rot = 0;
  if (T >= C15.leap + 0.6 && T < 161.2) { u = c15S(T, C15.leap + 0.6, 161.2); x = c15Lerp(-26, VW * 0.36, c15E(u)); y = VH * 0.17 - 6 * Math.sin(u * Math.PI); sc = 0.55; fi = [4, 5, 7, 10][Math.min(3, Math.floor(u * 4))]; }
  else if (T >= 164.5 && T < 168.2) { u = c15S(T, 164.5, 168.2); x = mx + (u - 0.55) * (VW + 160); y = my + 52 - 56 * Math.sin(u * Math.PI); sc = 1.9; fi = [10, 10, 10, 10, 11, 12, 12][Math.min(6, Math.floor(u * 7))]; rot = (u - 0.5) * 0.9; }
  else return;
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); c15CFig(c15Tint(air[fi], dk), 0, 0, sc, 1); ctx.restore();
}
function c15CEvents(T) {      // the sounds and the things that happen once
  const st = story.c15, ct = st.ct; while (ct.cb + 1 < C15CB.length && T >= C15CB[ct.cb + 1]) { ct.cb++; if (T - C15CB[ct.cb] < 0.5) snd('c7beat', 1); }
  const at = (k, t0, f) => { if (T >= t0 && T < t0 + 0.6) once2(k, f); };
  at('cl0', C15.leap, () => { snd('slowin'); c15Shake(1.6, 400); });
  at('cl1', C15T.land, () => { snd('land', 1.8); snd('c7thud', 1); snd('c8crack'); snd('dash', 0); st.flash = 1; c15Shake(7, 1100); const x = ct.xs; c15Spawn('dust', x, -2, 40, { sx: 60, rx: 150, vy: -22, ry: 36, life: 2.4, s: 3 }); c15Spawn('deb', x, -4, 24, { sx: 30, rx: 120, vy: -90, ry: 70, life: 1.5 }); c15Spawn('spark', x, -6, 16, { sx: 20, rx: 160, vy: -50, ry: 60, life: 0.8 }); });
  at('cl2', C15T.turn, () => snd('gasp', 0)); at('cl3', C15T.go, () => snd('dash', 0));
  at('cl4', C15T.dash, () => { snd('sukcut', 3); snd('dash', 1); snd('c7thud', 0); st.flash = 1; c15Shake(4, 500); }); at('cl5', C15T.stop, () => { snd('gasp', 1); c15Shake(1.5, 300); });
  at('cl6', C15T.grab, () => { snd('c4crunch'); snd('c7thud', 1); snd('c8crack'); snd('gasp', 1); st.flash = 1; c15Shake(7, 900); });
  at('cl7', C15T.eye1, () => { snd('c7thud', 0); c15Shake(1.2, 400); }); at('cl8', C15T.beat, () => { snd('c7thud', 0); c15Shake(2.5, 500); st.flash = 0.25; }); at('cl9', C15.black - 0.5, () => { snd('c7thud', 1); c15Shake(2, 400); });
  if (T >= C15T.boots && T < C15T.face && T - (ct.dust || 0) > 0.22) { ct.dust = T; c15Spawn('dust', ct.xs + (Math.random() - 0.5) * 26, -2, 1, { sx: 4, vy: -6, ry: 6, life: 1.1, s: 1 }); if (SET.gore === 0) c15Spawn('drop', ct.xs - 4 + Math.random() * 8, -12, 1, { life: 0.7 }); }
}
function c15Catch(now, dt, T) {
  const D = CU_GAME[3]; if (!D || !D.frames || !D.frames[0] || !D.air || !D.walk) { ctx.fillStyle = '#000'; ctx.fillRect(0, 0, VW, VH); return; }      // (Sukuna's pictures are not loaded: black instead of a crash)
  const st = story.c15; if (!st.ct) c15CInit(T); const ct = st.ct, rdt = Math.min(dt, 0.05), sh = c15CShot(T), rate = T < C15T.land ? c15CRate(T - C15.leap) : 1;
  c15Parts(rdt * rate); c15CEvents(T); st.flash = Math.max(0, st.flash - rdt * 2.2);
  if (sh === 'run' || sh === 'face' || sh === 'moon' || sh === 'fall') {
    const cam = c15CCam(T), fall = sh === 'fall';
    c15CWorld(T, cam, () => { c15CActors(T, cam, { noSuk: true }); if (fall && D.air && D.air[13]) { const f = (T - 168.2) / 3.8, y = -190 * (1 - f * f), k = c15S(T, 171.4, C15T.land); c15Sprite(c15Tint(D.air[13], 'rgba(3,2,10,' + (0.96 * (1 - k * 0.5)).toFixed(2) + ')'), ct.xs + 5 * (1 - f), y, false, 61); } });
    c15CLeap(T);
    if (sh === 'face') { const u = c15S(T, 162.6, 164.3), x = c15Lerp(-VW * 0.7, VW * 1.15, u), g = ctx.createLinearGradient(x - 70, 0, x + 70, 0); g.addColorStop(0, 'rgba(0,0,8,0)'); g.addColorStop(0.5, 'rgba(0,0,8,0.88)'); g.addColorStop(1, 'rgba(0,0,8,0)'); ctx.fillStyle = g; ctx.fillRect(x - 70, 0, 140, VH); }      // (the shadow of what flies over him sweeps across his face)
    c15CVig(T, 0.55, 40);
  } else if (sh === 'land' || sh === 'dash' || sh === 'two' || sh === 'boots' || sh === 'face2') {
    if (sh === 'dash' && T < 176.9) { ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, VW, VH); return; }
    if (sh === 'dash' && T < 177.12) { ctx.fillStyle = '#070208'; ctx.fillRect(0, 0, VW, VH); for (let i = 0; i < 9; i++) { ctx.fillStyle = i % 3 ? '#ffffff' : '#ff3a4a'; ctx.fillRect(0, 14 + i * 13 + (i % 2) * 3, VW, 1 + (i & 1)); } return; }
    const cam = c15CCam(T), s = c15CSuk(T);
    c15CWorld(T, cam, () => {
      c15CActors(T, cam);
      if (sh === 'dash' && s) { const k = c15S(T, 177.12, 177.45); for (let i = 1; i <= 5; i++) { ctx.globalAlpha = (0.5 - i * 0.08) * (1 - k); c15Sprite(s.img, s.x + i * 26 * (1 - k * 0.5), 0, s.flip, 61); } ctx.globalAlpha = 1; }
      if (T >= C15T.land && T < C15T.dash) { const u = T - C15T.land; ctx.strokeStyle = 'rgba(255,255,255,' + Math.max(0, 0.8 - u * 0.9).toFixed(2) + ')'; ctx.lineWidth = 2; for (const r of [u * 150, u * 105]) { ctx.beginPath(); ctx.ellipse(ct.xs, 0, r, r * 0.12, 0, 0, 7); ctx.stroke(); } ctx.strokeStyle = '#0a0612'; ctx.lineWidth = 1; for (const [dx, dy] of [[-30, 5], [-14, 7], [8, 6], [26, 5], [40, 3]]) { ctx.beginPath(); ctx.moveTo(ct.xs + dx * 0.5, 0); ctx.lineTo(ct.xs + dx, dy); ctx.stroke(); } }      // (the rings of the shock, the cracks in the roof)
      if (sh === 'face2' && T >= 181.35) { const m = c15CMeg(T), u = c15E((T - 181.35) / 0.45), x1 = c15Lerp(m.x - 150, m.x - 6, u); ctx.fillStyle = '#05030a'; ctx.fillRect(Math.round(x1 - 120), -33, 120, 9); ctx.beginPath(); ctx.arc(x1, -28, 6, 0, 7); ctx.fill(); }      // (his arm comes in from the left, blurred)
    });
    if (T < C15T.land + 1.6) { c15CSukEyes(T, cam); }
    c15CVig(T, 0.5 + 0.2 * c15S(T, 177.7, C15T.grab), 40);
  } else if (sh === 'clamp' || sh === 'wide') {
    c15CSky2(T, 0.1); ctx.fillStyle = 'rgba(110,10,24,0.3)'; ctx.fillRect(0, 0, VW, VH); const fr = T < C15T.grab + 0.14, tt = fr ? C15T.grab : T, [shx, shy] = c15ShakeOff();
    ctx.save(); ctx.translate(Math.round(shx), Math.round(shy)); c15CHold(tt, sh === 'clamp' ? { sc: 1.7, lift: 14 * c15E(Math.min(1, (tt - C15T.grab) / 0.8)), hy: undefined } : { sc: 1.2 + 0.05 * c15S(T, C15T.wide, C15T.last), lift: 15 + 1.5 * Math.sin(T * 1.2), hy: undefined }); ctx.restore();
    c15Embers(T, 24, '255,100,70', 1); c15CVig(T, 0.6, 60);
  } else if (sh === 'eye' || sh === 'eye2') {
    const a = sh === 'eye' ? c15S(T, C15T.eye1, C15T.boots) : c15S(T, C15T.last, C15.black), [shx, shy] = c15ShakeOff();
    ctx.save(); ctx.translate(Math.round(shx), Math.round(shy)); c15CEye(T, sh === 'eye' ? { open: 1.0 + 0.2 * c15E(a * 2), pup: 7 - 2 * a, sweat: 1 + a * 0.6, brow: 4, tr: 0.6, fp: 1, dx: Math.round(-3 * a) } : { open: 1.25 + 0.05 * a, pup: 5 - 3 * c15E(a), refl: a > 0.35, sweat: 1.4 + a * 0.9, brow: 8, tr: 1.2, fp: 1, dx: Math.round(-5 * a), dy: Math.round(2 * a) }); ctx.restore(); c15CVig(T, 0.55, 60);
  } else if (sh === 'hang') {
    const cam = { x: ct.xs, y: -4, z: 4 }; c15CWorld(T, cam, () => { const pp = c15MegPoses.grabbed(T); pp.blood = 0.8; ctx.fillStyle = 'rgba(0,0,0,0.35)'; ctx.fillRect(Math.round(ct.xs - 8), 0, 16, 2); c15Sprite(c15Meg(pp), ct.xs, -17 + 1.5 * Math.sin(T * 2.6), true, C15MG.BASE); if (D.walk) c15Sprite(D.walk[0], ct.xs - 36, 0, false, 61); }); c15CVig(T, 0.6, 60);
  } else if (sh === 'suk') {
    const u = c15S(T, C15T.face, C15T.wide), bt = T >= C15T.beat, sw = bt ? 1.15 : 0.7 + 0.3 * c15S(T, C15T.face, C15T.beat), e2 = bt ? c15S(T, C15T.beat, C15T.beat + 1.4) : 0.3 * c15S(T, C15T.face, C15T.beat), im = c15Big.suk({ sw: Math.round(sw * 10) / 10, e2: Math.round(e2 * 10) / 10, lid: bt ? 0.7 : 0.4 }), z = 2, w = im.width * z, h = im.height * z;
    ctx.fillStyle = '#0c0306'; ctx.fillRect(0, 0, VW, VH); const g = ctx.createRadialGradient(VW / 2, VH * 0.6, 10, VW / 2, VH * 0.6, 170); g.addColorStop(0, 'rgba(170,22,34,0.6)'); g.addColorStop(1, 'rgba(170,22,34,0)'); ctx.fillStyle = g; ctx.fillRect(0, 0, VW, VH);
    const [shx, shy] = c15ShakeOff(); ctx.drawImage(im, Math.round((VW - w) / 2 + shx + Math.sin(T * 0.7) * 2), Math.round(-92 - 18 * u + shy), w, h); ctx.fillStyle = 'rgba(8,0,10,0.28)'; ctx.fillRect(0, 0, VW, VH); c15Embers(T, 26, '255,120,80', 1); c15CVig(T, 0.7, 80);
  }
  if (st.flash > 0.01) { ctx.fillStyle = 'rgba(255,255,255,' + Math.min(0.92, st.flash).toFixed(2) + ')'; ctx.fillRect(0, 0, VW, VH); }
}
function c15CSukEyes(T, cam) {      // two red points in the dust: his eyes (screen position from the world)
  const ct = story.c15.ct; if (T < C15T.land + 0.25 || T > C15T.land + 1.6) return; const z = cam.z, sx = Math.round(VW / 2 + (ct.xs - 3 - cam.x) * z), sy = Math.round(c15GY() + (-46 - cam.y) * z), a = Math.min(1, (T - C15T.land - 0.25) * 4) * (1 - c15S(T, C15T.land + 1.1, C15T.land + 1.6));
  ctx.fillStyle = 'rgba(255,40,60,' + a.toFixed(2) + ')'; ctx.fillRect(sx - 6, sy, 3, 1); ctx.fillRect(sx - 1, sy, 3, 1);
}
