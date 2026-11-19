// ================================================================ v1.216 WEST CITY AND THE END OF THE CHAPTER 5 FIGHT (this file is spliced into template.html by build_html.py, after chap5c.js; k5Tick, drawScene and the k5 background call it)
// The user: "lets work on the story so after yuji beats iron man, the building starts to shake as iron man looks at yuji and is about hte blast him but then yuji is sent to another universe where the city is now 'West City' thats it for now". Answers: he is sent "the same way he was teleported to the MCU" (the violet circle of chapter 4), the name only on a sign (no title card), then black and back to the chapter list; and four pictures of how West City looks ("make the map look similar to the pictures but of course it should be in pixel style"): a bright city of silver domes, white towers with coloured tops, balls on stilts, a red monorail tube, a blimp, palm trees, green road signs.
// THE SCENE (it plays inside the live fight, nothing is replaced): when Iron Man's health is at its floor (k5Tick asks) the controls are locked and the screen shows no bars; once the last blow has played out (he is on his feet and still, at most 1.8 s) the scene's own clock T (seconds) starts and his brain is off for good: the hall rumbles and shakes more and more, dust falls, the lights flicker; Iron Man steps back until he is about 100 px from Yuji (his walk, no blow: his backflip kicks), raises his palm at Yuji and the charge swells (his BLAST move, held in its charge by this code: the beam never fires); a violet circle opens under Yuji (tools/chap4e.js c4xPortalAt), a column of violet light closes round him, the picture goes white; West City (wctWorld) comes up out of the white with Yuji coming in feet first as at the start of a round and the column fading; a few seconds of the city, black, and the chapter list (k5Leave). No words anywhere but the name on the road sign.
const K5E = { rumble: 0, blast: 0.4, portal: 3.2, beam: 3.65, white: 4.2, cut: 4.7, clear: 5.7, gk: 7.0 };      // (seconds after the scene's clock starts: the first rumble, the earliest the palm goes up (he steps back first when he is close), the violet circle opens, the column of light, the white begins to rise, the cut to the city (full white), the white is gone, the black begins, the chapter list)
function k5EndGo(now) {      // Iron Man's health is at its floor: the scene begins (the picture of the city is made at once, the cut must not stutter)
  vs.k5.end = { t0: now, ts: -1, wc: false, bt: -1, ev: {}, dust: [], last: now }; wctBuild(); gkHillBuild(); gkBuildingBuild();
}
function k5EndTick(now, dt) {      // every frame of the scene (k5Tick): no controls, the wait for the last blow, the rumble, his palm, the cut to the city, the end
  const K = vs.k5, E = K.end, d = dummy;
  keyL = keyR = padL = padR = jumpReq = atkReq = crReq = lpReq = dashReq = ceReq = domReq = blockHeld = false; stickDown = false; fatReq = 0; atkQ = false;
  if (E.ts < 0) {      // (the last blow plays out: he is up and still, or a second and a half has gone; he starts nothing meanwhile)
    if (d && d.ko < 0 && !d.fa) { d.ai = 'rest'; d.aiAt = now; d.restFor = 1e9; }
    const free = !d || d.ko >= 0 || (!d.fa && now - d.rxAt >= (RX_DUR[d.rx] || 0) && now >= (d.stunUntil || 0) && !airUp(d) && !(d.airH > 0) && !d.held && !d.cap && Math.abs(d.vx || 0) < 25);
    if (!free && now - E.t0 < 1800) return; E.ts = now; if (d) { d.fa = null; d.stunUntil = 1e15; d.vx = 0; d.ai = 'rest'; d.aiAt = now; d.restFor = 1e9; }      // (from now on his brain is off: all he does here is done by this code)
  }
  const T = (now - E.ts) / 1000, ev = (n, t, f) => { if (T >= t && !E.ev[n]) { E.ev[n] = 1; f(); } };
  if (!E.wc) {
    ev('rumble', K5E.rumble, () => snd('rumble', 1.6));
    shakeUntil = Math.max(shakeUntil, now + 90); shakeAmp = Math.max(shakeAmp, 0.8 + 3.4 * Math.min(1, T / 3.6));      // (the building shakes more and more)
    if (d && d.ko < 0) {
      if (E.bt < 0) {      // (he is close: he steps back (his walk) until his palm can point at Yuji from a distance, then it goes up)
        const away = d.x >= wx ? 1 : -1, gap = Math.abs(d.x - wx), wall = away > 0 ? d.x >= K5A.hi - 8 : d.x <= K5A.lo + 8;
        if (T >= K5E.blast && (gap >= 95 || wall || T >= 1.9)) { E.bt = now; cuenStart(0, now, 'iblast'); d.stunUntil = 1e15; snd('redcharge'); snd('thrust', 0.9); }
        else if (T >= 0.15 && gap < 95 && !wall) { d.x += away * FOE_WALK * 1.4 * dt; d.ai = 'walk'; d.walkDir = away; }
      } else {
        const a = d.fa; if (a && a.type === 'iblast') { const u = now - E.bt; a.at = u < IRB.raise ? E.bt : now - (IRB.raise + Math.min(IRB.charge * 0.97, (u - IRB.raise) * 0.45)); }      // (his palm goes up at the speed of the move and then the charge swells slowly: the move's own beam never comes, its clock is held here and his brain is off)
        if (now - (E.cr || 0) > 450) { E.cr = now; snd('cecrackle'); }
      }
    }
    ev('portal', K5E.portal, () => { snd('charge'); shakeUntil = now + 300; shakeAmp = Math.max(shakeAmp, 5); });
    ev('white', K5E.white, () => { snd('vanish'); snd('portalclose'); });
    ev('cut', K5E.cut, () => {      // (full white: the hall is gone, Iron Man is gone, Yuji comes in again in the city; he stands for good)
      E.wc = true; if (d) { d.fa = null; d.stunUntil = 1e15; d.vx = 0; d.x = wx + 5000; }
      spawnAt = now; popups = []; sparks = []; smoke = []; deb = []; shakeUntil = 0; shakeAmp = 0; snd('concboom'); snd('land', 1.4);
    });
  }
  if (T >= K5E.gk - 0.3 && !E.gk) E.gk = gkNew();      // (v1.217: Yuji has stood in the city for a moment: the picture goes dark, then the Goku scene (tools/gokuscene.js) takes over the whole frame and ends in the chapter list)
  if (E.gk && !E.gk.live && T >= K5E.gk) E.gk.live = true;
}
function k5EndDraw(now) {      // the effects of the scene over the picture (the hall's or the city's): flicker, dust, the violet circle and its column, the white, the black
  const E = vs.k5.end; if (!E || E.ts < 0) return; const T = (now - E.ts) / 1000, dt = Math.min(0.1, Math.max(0, (now - E.last) / 1000)), cx = Math.round(VW / 2), cl = (a, b, c) => Math.max(b, Math.min(c, a)), wh = SET.nf ? '0,0,0' : '246,236,255'; E.last = now;      // (wh: the colour of the change from the hall to the city: white; with SETTINGS > no flashes it goes through black instead)
  if (!E.wc) {
    const w = Math.floor(now / 450), st = w * 450 + wctR(w, 3) * 280, fl = !SET.nf && now >= st && now < st + 70 + 70 * wctR(w, 5) ? Math.min(1, T / 2.2) * SET.fl / 100 : 0; if (fl > 0.02) { ctx.fillStyle = 'rgba(0,0,10,' + (0.55 * fl).toFixed(3) + ')'; ctx.fillRect(0, 0, VW, VH); }      // (the lights fail and come back: one short dip at most every 0.45 s, none with SETTINGS > no flashes)
    const n = (4 + 38 * Math.min(1, T / 3)) * dt + Math.random(); for (let i = 0; i < n && E.dust.length < 90; i++) E.dust.push({ x: Math.random() * VW, y: -2, vy: 22 + Math.random() * 60, w: Math.random() < 0.12 ? 3 : Math.random() < 0.4 ? 2 : 1, c: ['#5d6272', '#7b8090', '#9a9fae', '#aab3c6', '#3a3f4e'][(Math.random() * 5) | 0], die: gy + Math.random() * 18 });
    ctx.save(); for (const p of E.dust) { p.y += p.vy * dt; ctx.fillStyle = p.c; ctx.fillRect(Math.round(p.x), Math.round(p.y), p.w, p.w > 2 ? 2 : p.w); } E.dust = E.dust.filter(p => p.y < p.die); ctx.restore();
    if (T >= K5E.portal) { const k = cl((T - K5E.portal) / 0.6, 0, 1); c4xPortalAt(cx, Math.round(30 * (1 - Math.pow(1 - k, 3))), now, 1, false); }
    if (T >= K5E.beam) c4xBeam(cx, 1.8 * cl((T - K5E.beam) / 0.55, 0, 1), now);
    if (T >= K5E.white) { ctx.fillStyle = 'rgba(' + wh + ',' + cl((T - K5E.white) / (K5E.cut - K5E.white), 0, 1).toFixed(3) + ')'; ctx.fillRect(0, 0, VW, VH); }
  } else {
    const u = cl((T - K5E.cut) / 1.2, 0, 1); if (u < 1) { c4xBeam(cx, 1.8 * (1 - u), now); c4xPortalAt(cx, Math.round(30 * (1 - u)), now, 1 - u, false); }
    if (T < K5E.clear) { ctx.fillStyle = 'rgba(' + wh + ',' + (1 - cl((T - K5E.cut) / (K5E.clear - K5E.cut), 0, 1)).toFixed(3) + ')'; ctx.fillRect(0, 0, VW, VH); }
    if (E.gk) { ctx.fillStyle = 'rgba(0,0,0,' + cl((T - (K5E.gk - 0.3)) / 0.3, 0, 1).toFixed(3) + ')'; ctx.fillRect(0, 0, VW, VH); }
  }
}
// ---------------------------------------------------------------- WEST CITY (the picture: made once as two layers, the sky and everything on the ground; clouds, the blimp, the train, the palms and the sign are drawn each frame)
const WCT = { w: 0, h: 0, M: 260, sky: null, mnt: null, far: null, mid: null, gnd: null, cl: null };      // (the picture for this size of screen: the sky, the clouds and four layers of the city, each as wide as the screen plus 260 pixels at either side, so that the camera can slide: the mountains, the far towers with the monorail, the middle city, the ground)
const wctR = (i, s) => c4xR(i, s);
const wctCv = (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; };
function wctDome(g, cx, base, rx, ry, P, seed) {      // a half ball on the floor: three tones from the light (left) to the shade (right), rows of windows, a band and a door, an aerial. P = [light, mid, dark, edge, window, lit window, band]
  for (let dy = 0; dy < ry; dy++) {
    const w = Math.round(rx * Math.sqrt(Math.max(0, 1 - Math.pow((dy + 0.5) / ry, 2)))); if (w < 1) continue; const y = base - 1 - dy, x0 = cx - w, W = 2 * w, a = Math.round(W * 0.3), b = Math.round(W * 0.68);
    g.fillStyle = P[0]; g.fillRect(x0, y, a, 1); g.fillStyle = P[1]; g.fillRect(x0 + a, y, b - a, 1); g.fillStyle = P[2]; g.fillRect(x0 + b, y, W - b, 1); g.fillStyle = P[3]; g.fillRect(x0 + W - 1, y, 1, 1);
  }
  for (let r = 6; r < ry - 3; r += 6) { const w = Math.round(rx * Math.sqrt(Math.max(0, 1 - Math.pow((r + 0.5) / ry, 2)))), y = base - 1 - r; for (let x = -w + 3; x < w - 4; x += 5) { g.fillStyle = wctR(x + r * 7 + seed, 5) < 0.28 ? P[5] : P[4]; g.fillRect(cx + x, y, 3, 2); } }
  g.fillStyle = P[6]; g.fillRect(cx - rx, base - 3, rx * 2, 3); g.fillStyle = P[3]; g.fillRect(cx - rx, base - 1, rx * 2, 1);
  g.fillStyle = '#2a3550'; g.fillRect(cx - 3, base - 8, 6, 8); g.fillStyle = '#cfd6e4'; g.fillRect(cx - 4, base - 9, 8, 1); g.fillRect(cx - 4, base - 8, 1, 8); g.fillRect(cx + 3, base - 8, 1, 8);
  if (wctR(seed, 9) < 0.5) { g.fillStyle = '#5b6478'; g.fillRect(cx - (rx >> 2), base - ry - 5, 1, 6); g.fillStyle = '#e04a3a'; g.fillRect(cx - (rx >> 2), base - ry - 6, 1, 1); }
}
function wctCyl(g, cx, base, w, h, seed) {      // a tall round tower with balcony rings (the one on the left of the street picture), a small dome on top
  const x0 = cx - (w >> 1), P = ['#bcc4d3', '#a0aabd', '#7d889f', '#5d677c', '#33456b', '#8fd3ff', '#6a748b']; g.fillStyle = P[0]; g.fillRect(x0, base - h, w, h); g.fillStyle = P[1]; g.fillRect(x0 + Math.round(w * 0.32), base - h, Math.round(w * 0.42), h); g.fillStyle = P[2]; g.fillRect(x0 + Math.round(w * 0.74), base - h, w - Math.round(w * 0.74), h);
  for (let y = base - h + 7; y < base - 5; y += 9) { g.fillStyle = '#f2f5fa'; g.fillRect(x0 - 2, y, w + 4, 2); g.fillStyle = '#6f7a90'; g.fillRect(x0 - 2, y + 2, w + 4, 1); for (let x = x0 + 2; x < x0 + w - 2; x += 4) { g.fillStyle = wctR(x + y, seed) < 0.25 ? P[5] : P[4]; g.fillRect(x, y + 4, 2, 3); } }
  wctDome(g, cx, base - h, (w >> 1) + 2, 6, P, seed); g.fillStyle = P[6]; g.fillRect(x0 - 1, base - 3, w + 2, 3);
}
function wctBall(g, cx, base, h, r, band, seed) {      // a ball on a stilt (the water towers of West City): a slim shaft with a platform ring, the ball with a band of windows and a mast
  const top = base - h; g.fillStyle = '#c9d0de'; g.fillRect(cx - 2, top, 4, h); g.fillStyle = '#8a94a8'; g.fillRect(cx + 1, top, 2, h); g.fillStyle = '#e4e9f2'; g.fillRect(cx - 2, top, 1, h);
  g.fillStyle = '#c4cad8'; g.fillRect(cx - 6, base - (h >> 1), 12, 2); g.fillStyle = '#7d8699'; g.fillRect(cx - 6, base - (h >> 1) + 2, 12, 1); g.fillStyle = '#9aa3b5'; g.fillRect(cx - 9, base - 3, 18, 3);
  const cy = top - r + 2; for (let dy = -r; dy <= r; dy++) { const w = Math.round(Math.sqrt(Math.max(0, r * r - dy * dy))), x0 = cx - w, W = 2 * w, a = Math.round(W * 0.3), b = Math.round(W * 0.7); g.fillStyle = '#e4e9f2'; g.fillRect(x0, cy + dy, a, 1); g.fillStyle = '#bcc6d9'; g.fillRect(x0 + a, cy + dy, b - a, 1); g.fillStyle = '#8c98b2'; g.fillRect(x0 + b, cy + dy, W - b, 1); }
  g.fillStyle = band; g.fillRect(cx - r, cy - 3, 2 * r, 2); const w2 = Math.round(Math.sqrt(Math.max(0, r * r - 1))); for (let x = -w2 + 2; x < w2 - 2; x += 3) { g.fillStyle = wctR(x + seed, 4) < 0.3 ? '#bfe6ff' : '#3b4d78'; g.fillRect(cx + x, cy, 2, 2); }
  g.fillStyle = '#7d8699'; g.fillRect(cx, cy - r - 6, 1, 6); g.fillStyle = '#e04a3a'; g.fillRect(cx, cy - r - 7, 1, 1);
}
function wctTower(g, x, base, w, h, cap, seed) {      // a white tower with a coloured top (the tall ones of the aerial picture), lit windows, sometimes a step and a mast
  const bodies = ['#f3f1ec', '#e8eef6', '#f6ece4', '#ecf2e9'], B = bodies[(wctR(seed, 3) * bodies.length) | 0];
  g.fillStyle = B; g.fillRect(x, base - h, w, h); g.fillStyle = '#ffffff'; g.fillRect(x, base - h, 1, h); g.fillStyle = '#c9cfdb'; g.fillRect(x + w - 2, base - h, 2, h);
  for (let y = base - h + 6; y < base - 3; y += 4) for (let xx = x + 3; xx < x + w - 4; xx += 4) { const r = wctR(xx * 3 + y, seed); g.fillStyle = r < 0.1 ? '#ffe9a3' : r < 0.35 ? '#6fa7d6' : '#a9d5f2'; g.fillRect(xx, y, 2, 2); }
  const step = wctR(seed, 6) < 0.4 && w > 14; let top = base - h; if (step) { const sw = w - 8; g.fillStyle = B; g.fillRect(x + 4, top - 9, sw, 9); g.fillStyle = '#ffffff'; g.fillRect(x + 4, top - 9, 1, 9); g.fillStyle = '#c9cfdb'; g.fillRect(x + 4 + sw - 2, top - 9, 2, 9); for (let xx = x + 7; xx < x + 4 + sw - 3; xx += 4) { g.fillStyle = '#a9d5f2'; g.fillRect(xx, top - 6, 2, 2); } g.fillStyle = cap; g.fillRect(x + 3, top - 13, sw + 2, 4); g.fillStyle = 'rgba(255,255,255,0.45)'; g.fillRect(x + 3, top - 13, sw + 2, 1); top -= 9; }
  else { g.fillStyle = cap; g.fillRect(x - 1, top - 4, w + 2, 4); g.fillStyle = 'rgba(255,255,255,0.45)'; g.fillRect(x - 1, top - 4, w + 2, 1); g.fillStyle = 'rgba(0,0,0,0.18)'; g.fillRect(x - 1, top - 1, w + 2, 1); }
  if (wctR(seed, 7) < 0.45) { g.fillStyle = '#8a93a8'; g.fillRect(x + (w >> 1), top - (step ? 13 : 4) - 8, 1, 8); }
}
function wctCloud(w, h, seed) {      // a puffy cloud: ellipses with a flat bottom, white on top and pale blue underneath
  const c = wctCv(w, h), g = c.getContext('2d'), n = 5 + Math.floor(w / 16), E = [];
  for (let i = 0; i < n; i++) { const ry = h * (0.26 + 0.28 * wctR(i, seed + 1)), rx = h * (0.55 + 0.55 * wctR(i, seed)); E.push([w * 0.14 + w * 0.72 * (i / (n - 1)), h - 1 - ry - (h * 0.3) * wctR(i, seed + 2) * (i === 0 || i === n - 1 ? 0 : 1), rx, ry]); }
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) if (E.some(e => Math.pow((x - e[0]) / e[2], 2) + Math.pow((y - e[1]) / e[3], 2) <= 1)) { g.fillStyle = y > h - 3 ? '#c4d8ee' : y > h - 6 ? '#e2edf9' : '#ffffff'; g.fillRect(x, y, 1, 1); }
  return c;
}
function wctBuild() {      // the layers for this picture size; made once
  if (WCT.w === VW && WCT.h === VH && WCT.gnd) return; WCT.w = VW; WCT.h = VH; const M = WCT.M, W = VW + 2 * M, H = VH, X = f => M + Math.round(VW * f), cx = M + Math.round(VW / 2), mid = gy - 12, far = gy - 16, mk = () => { const c = wctCv(W, H); return [c, c.getContext('2d')]; };
  const hz = (g, a) => { g.save(); g.globalCompositeOperation = 'source-atop'; g.fillStyle = 'rgba(206,230,250,' + a + ')'; g.fillRect(0, 0, W, H); g.restore(); };
  // the sky: blue at the top, nearly white at the horizon, the sun low on the right with its glow
  { const c = WCT.sky = wctCv(VW, H), g = c.getContext('2d'), gr = g.createLinearGradient(0, 0, 0, gy - 10); gr.addColorStop(0, '#3a86dc'); gr.addColorStop(0.45, '#66b0ec'); gr.addColorStop(0.8, '#b4def6'); gr.addColorStop(1, '#f1f9ff'); g.fillStyle = gr; g.fillRect(0, 0, VW, H);
    const sx = Math.round(VW * 0.74), sy = gy - 44, gl = g.createRadialGradient(sx, sy, 3, sx, sy, 78); gl.addColorStop(0, 'rgba(255,250,222,0.95)'); gl.addColorStop(0.35, 'rgba(255,244,210,0.5)'); gl.addColorStop(1, 'rgba(255,244,210,0)'); g.fillStyle = gl; g.fillRect(0, 0, VW, H);
    g.fillStyle = '#fffbe6'; g.beginPath(); g.arc(sx, sy, 7, 0, 7); g.fill(); g.fillStyle = '#ffffff'; g.beginPath(); g.arc(sx, sy, 4, 0, 7); g.fill(); }
  WCT.cl = [wctCloud(58, 17, 11), wctCloud(40, 13, 23), wctCloud(72, 19, 37)];
  // the mountains: two ridges
  { const [c, g] = mk(); WCT.mnt = c; for (const [base, amp, seed, col, hi] of [[gy - 20, 30, 1.3, '#8fb0d8', '#bdd3ee'], [gy - 17, 20, 4.1, '#7396c6', '#a3c0e4']]) for (let x = 0; x < W; x++) { const xs = x - M, n = 0.55 * (1 - Math.abs(Math.sin(xs * 0.019 + seed))) + 0.3 * (1 - Math.abs(Math.sin(xs * 0.047 + seed * 1.7))) + 0.15 * Math.sin(xs * 0.11 + seed), y = Math.round(base - amp * n); g.fillStyle = col; g.fillRect(x, y, 1, base - y); g.fillStyle = hi; g.fillRect(x, y, 1, 1); if (n > 0.8) { g.fillStyle = '#f2f7fd'; g.fillRect(x, y, 1, 2); } }
    hz(g, 0.3); hz(g, 0.22); }
  // the far city: white towers with coloured tops and balls on stilts, hazy; the monorail: a red tube from the top left down to the right on thin pylons
  { const [c, g] = mk(); WCT.far = c; const caps = ['#ff78ad', '#ffd13b', '#4d86e8', '#3fc9b7', '#ff9a3d', '#9a6be0', '#e8604a'], tw = i => ({ w: 10 + Math.round(wctR(i, 1) * 13), h: 26 + Math.round(wctR(i, 2) * 36), gap: Math.round(wctR(i, 4) * 4) });
    let x = M - 4; for (let i = 0; x < W + 10; i++) { const q = tw(i); if (i % 7 === 4) { wctBall(g, x + 6, far, 40 + Math.round(wctR(i, 3) * 14), 8, caps[i % caps.length], i); x += 18; } else { wctTower(g, x, far, q.w, q.h, caps[(i * 3 + 1) % caps.length], i + 40); x += q.w + 1 + q.gap; } }
    x = M - 4; for (let i = -1; x > -30; i--) { const q = tw(i); x -= q.w + 1 + q.gap; wctTower(g, x, far, q.w, q.h, caps[(((i * 3 + 1) % caps.length) + caps.length) % caps.length], i + 40); }
    hz(g, 0.22); const ty = xs => 12 + 0.09 * xs + 0.00012 * xs * xs;
    for (let xs = 70 - 88 * 3; xs < VW + M; xs += 88) { const y = Math.round(ty(xs)) + 4, px = M + xs; g.fillStyle = '#8b93a4'; g.fillRect(px, y, 3, mid - y); g.fillStyle = '#69717f'; g.fillRect(px + 2, y, 1, mid - y); g.fillStyle = '#a9b0be'; g.fillRect(px - 3, y - 1, 9, 2); g.fillRect(px - 2, y + 1, 1, 3); g.fillRect(px + 4, y + 1, 1, 3); }
    for (let xc = 0; xc < W; xc++) { const y = Math.round(ty(xc - M)); for (const [dy, col] of [[-3, '#e0735f'], [-2, '#cf5444'], [-1, '#bd4034'], [0, '#ac332a'], [1, '#98291f'], [2, '#7f2118'], [3, '#4a120d']]) { g.fillStyle = col; g.fillRect(xc, y + dy, 1, 1); } if ((xc - M) % 24 === 0) { g.fillStyle = '#e8c1b8'; g.fillRect(xc, y - 3, 1, 1); } } }
  // the middle city: filler domes, then the ones that make the picture
  { const [c, g] = mk(); WCT.mid = c; const P1 = ['#c4ccd9', '#a3adbf', '#7e899f', '#5c667b', '#2f3f5e', '#8fd3ff', '#6a748b'], P2 = ['#f6f8fb', '#dfe4ee', '#b6bfd0', '#8c96ab', '#3c4f78', '#a6dcff', '#98a2b8'], P3 = ['#f7d44a', '#e5b92b', '#c18f19', '#8f650f', '#5a3d0e', '#fff2b0', '#a87a14'], dm = i => ({ r: 13 + Math.round(wctR(i, 9) * 10), step: 30 + Math.round(wctR(i, 8) * 26) });
    const dome = (x, i) => { const r = dm(i).r; wctDome(g, x, mid - 2, r, Math.round(r * 0.62), i % 3 === 0 ? P2 : P1, i + 70); };
    for (let x = M + 6, i = 0; x < W + 20; x += dm(i).step, i++) dome(x, i);
    for (let x = M + 6, i = -1; x > -30; i--) { x -= dm(i).step; dome(x, i); }
    wctCyl(g, X(0.06), mid, 28, 62, 3); wctDome(g, X(0.2), mid, 44, 28, P1, 1); wctDome(g, X(0.4), mid, 24, 15, P2, 2);
    wctBall(g, X(0.4), mid, 40, 10, '#ff78ad', 5); wctDome(g, X(0.84), mid, 36, 22, P3, 6); wctDome(g, X(1.0) - 6, mid, 34, 21, P2, 7); }
  // the ground: the hedge and the pavement in front of the buildings, the road with its crossing, the street lamps
  { const [c, g] = mk(); WCT.gnd = c;
    for (let i = -Math.ceil(M / 9) - 2; ; i++) { const x = M - 4 + 9 * i; if (x > W + 8) break; const r = 5 + Math.round(wctR(i, 12) * 2), y = gy - 12 + Math.round(wctR(i, 13) * 2); g.fillStyle = '#245f33'; g.beginPath(); g.arc(x, y, r + 1, 0, 7); g.fill(); g.fillStyle = '#2f8a43'; g.beginPath(); g.arc(x, y - 1, r, 0, 7); g.fill(); g.fillStyle = '#58b25a'; g.fillRect(x - 2, y - r + 1, 3, 1); if (wctR(i, 14) < 0.3) { g.fillStyle = '#ff9fc4'; g.fillRect(x + 1, y - 1, 1, 1); g.fillRect(x - 2, y + 1, 1, 1); } }
    g.fillStyle = '#d2d6df'; g.fillRect(0, gy - 8, W, 5); g.fillStyle = '#e8ebf1'; g.fillRect(0, gy - 8, W, 1); g.fillStyle = '#b6bbc7'; for (let xs = 4 - 17 * Math.ceil((M + 4) / 17); xs < VW + M; xs += 17) g.fillRect(M + xs, gy - 7, 1, 4); g.fillStyle = '#9aa0ae'; g.fillRect(0, gy - 3, W, 1); g.fillStyle = '#767c8b'; g.fillRect(0, gy - 2, W, 1);
    g.fillStyle = '#3d414d'; g.fillRect(0, gy - 1, W, H - gy + 1); g.fillStyle = '#464a57'; g.fillRect(0, gy - 1, W, 2); g.fillStyle = '#343843'; g.fillRect(0, gy + 18, W, H - gy - 18);
    g.fillStyle = '#ecece4'; for (let xs = 5 - 26 * Math.ceil((M + 5) / 26); xs < VW + M; xs += 26) g.fillRect(M + xs, gy + 17, 13, 1);
    for (let i = -4; i < 5; i++) { const bx = cx - 4 + i * 13; for (let y = gy + 1; y < H; y++) { const sk = Math.round((y - gy) * 0.22); g.fillStyle = wctR(i * 31 + y, 3) < 0.9 ? '#eeeee6' : '#c9c9c2'; g.fillRect(bx - sk, y, 6, 1); } }      // (the crossing: slanting white bars across the road, a few worn)
    const sp = Math.round(VW * 0.935); for (let k = -3; k <= 3; k++) { const lx = X(0.03) + k * sp; g.fillStyle = '#7c8493'; g.fillRect(lx, gy - 84, 2, 82); g.fillStyle = '#9aa2b0'; g.fillRect(lx, gy - 84, 1, 82); g.fillRect(lx - 9, gy - 86, 11, 2); g.fillStyle = '#fff6c8'; g.fillRect(lx - 11, gy - 85, 4, 2); g.fillStyle = '#5e6572'; g.fillRect(lx - 2, gy - 5, 6, 3); } }
}
function wctPalm(x, base, h, lean, now, seed) {      // a palm tree: a curved ringed trunk and a crown of drooping fronds that sway
  const t = now / 1000, sw = Math.sin(t * 1.15 + seed) * 1.6; let tx = x, ty = base;
  for (let i = 0; i <= h; i++) { const k = i / h; tx = x + lean * k * k * h * 0.4 + sw * k * k; ty = base - i; const wd = i > h * 0.8 ? 2 : 3; ctx.fillStyle = '#9b7a4c'; ctx.fillRect(Math.round(tx) - 1, ty, wd, 1); ctx.fillStyle = '#6f5231'; ctx.fillRect(Math.round(tx) + wd - 2, ty, 1, 1); if (i % 4 === 0) { ctx.fillStyle = '#54401f'; ctx.fillRect(Math.round(tx) - 1, ty, wd, 1); } }
  const cxp = Math.round(tx), cyp = ty; ctx.fillStyle = '#5a3d1c'; ctx.fillRect(cxp - 2, cyp + 1, 2, 2); ctx.fillRect(cxp + 1, cyp + 2, 2, 2);
  for (let f = 0; f < 8; f++) { const a = -Math.PI * (0.05 + 0.9 * f / 7), L = 13 + (f % 3) * 3 + (f === 3 || f === 4 ? 3 : 0), wob = Math.sin(t * 1.3 + f + seed) * 0.6;
    for (let s = 0; s <= L; s += 1) { const px = cxp + Math.cos(a) * s * 1.1, py = cyp + Math.sin(a) * s * 0.7 + (s * s) / (L * 2.2) + wob * s * 0.05; ctx.fillStyle = s < 3 ? '#245f33' : f % 2 ? '#2f9e44' : '#3fae4f'; ctx.fillRect(Math.round(px), Math.round(py), 1, 2); if (s > 2 && s % 2 === 0) { ctx.fillStyle = '#1d5a2e'; ctx.fillRect(Math.round(px), Math.round(py) + 2, 1, 1); } if (s > 4 && f % 2 === 0) { ctx.fillStyle = '#7bd36a'; ctx.fillRect(Math.round(px), Math.round(py) - 1, 1, 1); } } }
}
function wctSign(sx) {      // the green road sign over the street: the name of the city and an arrow, on two poles
  const top = Math.round(gy - 80); ctx.fillStyle = '#4b505b'; ctx.fillRect(sx - 48, top + 18, 2, 76); ctx.fillRect(sx + 46, top + 18, 2, 76); ctx.fillStyle = '#6b7280'; ctx.fillRect(sx - 48, top + 18, 1, 76); ctx.fillRect(sx + 46, top + 18, 1, 76);
  ctx.fillStyle = '#10161a'; ctx.fillRect(sx - 55, top - 1, 110, 23); ctx.fillStyle = '#1a8a55'; ctx.fillRect(sx - 54, top, 108, 21); ctx.fillStyle = '#f4f4f0'; ctx.fillRect(sx - 54, top, 108, 1); ctx.fillRect(sx - 54, top + 20, 108, 1); ctx.fillRect(sx - 54, top, 1, 21); ctx.fillRect(sx + 53, top, 1, 21);
  pxt('WEST CITY', sx - 10, top + 15, '#ffffff', 8, 'center'); ctx.fillStyle = '#ffffff'; ctx.fillRect(sx + 32, top + 10, 13, 2); ctx.fillRect(sx + 41, top + 7, 2, 8); ctx.fillRect(sx + 43, top + 8, 2, 6); ctx.fillRect(sx + 45, top + 9, 1, 4);
}
function wctWorld(now, cam, between) {      // the whole picture of West City: sky, clouds, blimp, the layers (they slide by cam, the world x in the middle of the screen, each at its own speed), the train on the tube, the palms and the sign
  wctBuild(); cam = cam || 0; const t = now / 1000, M = WCT.M, cx = Math.round(VW / 2), sh = k => -M - Math.round(cam * k), sxw = x => cx + x - Math.round(cam); ctx.drawImage(WCT.sky, 0, 0);
  [[0.12, 0.2, 0, 3.2], [0.55, 0.33, 1, 2.2], [0.84, 0.14, 2, 2.8], [0.33, 0.1, 1, 1.8]].forEach(([fx, fy, k, sp]) => { const c = WCT.cl[k], x = Math.round(((fx * (VW + 140) + t * sp) % (VW + 140)) - 70 - cam * 0.03); ctx.drawImage(c, x, Math.round(fy * (gy - 40))); });
  const bx = Math.round(VW * 0.57 + 26 * Math.sin(t * 0.11) - cam * 0.05), by = Math.round(11 + 2 * Math.sin(t * 0.7)); ctx.fillStyle = '#9aab26'; for (let dy = -5; dy <= 5; dy++) { const w = Math.round(17 * Math.sqrt(Math.max(0, 1 - dy * dy / 31))); ctx.fillRect(bx - w, by + dy, 2 * w, 1); } ctx.fillStyle = '#dbe84f'; for (let dy = -5; dy <= 1; dy++) { const w = Math.round(17 * Math.sqrt(Math.max(0, 1 - dy * dy / 31))); ctx.fillRect(bx - w + 1, by + dy, 2 * w - 3, 1); } ctx.fillStyle = '#e8584a'; ctx.fillRect(bx - 12, by - 1, 24, 1); ctx.fillStyle = '#5a6272'; ctx.fillRect(bx - 4, by + 6, 8, 3); ctx.fillStyle = '#9aab26'; ctx.fillRect(bx - 21, by - 3, 4, 6); ctx.fillRect(bx - 20, by - 5, 2, 10);
  ctx.drawImage(WCT.mnt, sh(0.08), 0); ctx.drawImage(WCT.far, sh(0.2), 0);
  { const xc = ((t * 36) % (VW + 120)) - 60 + M, ty = xs => 12 + 0.09 * xs + 0.00012 * xs * xs, tx = xc + sh(0.2), y = Math.round(ty(xc - M)); ctx.fillStyle = '#f4f6fa'; ctx.fillRect(tx - 14, y - 9, 28, 6); ctx.fillStyle = '#c9ced9'; ctx.fillRect(tx - 14, y - 4, 28, 1); ctx.fillStyle = '#d6453a'; ctx.fillRect(tx - 14, y - 6, 28, 1); ctx.fillStyle = '#5a9ee0'; for (let k = -12; k < 12; k += 5) ctx.fillRect(tx + k, y - 8, 3, 2); ctx.fillStyle = '#f4f6fa'; ctx.fillRect(tx + 14, y - 8, 2, 4); }
  ctx.drawImage(WCT.mid, sh(0.5), 0); if (between) between(); ctx.drawImage(WCT.gnd, sh(1), 0);
  for (const [x, h, lean, seed] of [[-64, 62, -0.6, 1], [56, 46, 0.5, 2.4], [-126, 40, 0.4, 4.1], [-190, 50, 0.5, 5.3], [190, 52, -0.4, 6.2], [250, 44, 0.5, 7.1]]) { const sx = sxw(x); if (sx > -40 && sx < VW + 40) wctPalm(sx, gy - 3, h, lean, now, seed); }
  wctSign(sxw(Math.min(84, Math.round(VW / 2) - 58)));
  const sx = Math.round(VW * 0.74), sy = gy - 44, gl = ctx.createRadialGradient(sx, sy, 2, sx, sy, 60); gl.addColorStop(0, 'rgba(255,248,214,0.28)'); gl.addColorStop(1, 'rgba(255,248,214,0)'); ctx.fillStyle = gl; ctx.fillRect(0, 0, VW, gy);      // (the sun's light over everything on the ground)
}
