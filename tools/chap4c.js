// ================================================================ v1.156 CHAPTER 4, PART 3: YUJI VS MEGUNA (tools/chap4c.js = the shell, the pictures and the cutscenes; tools/chap4d.js = the fight)
// After the hard cut to black of part 2 (346.6 s) the chapter goes on in the NORMAL look of the game: the same rooftop city (c15Sky / c15Roof / c15Prop of chap4.js), Yuji in his own pixel pictures (YUF.norm) and Sukuna in Megumi's body, "MEGUNA": black spiky hair,
// Megumi's dark uniform with the gold buttons, Sukuna's black face marks and RED eyes (tools/meguna_idle.png = `MEGUNA=1 python3 sukuna_art.py`: the same 36 rows of 15 pictures as Sukuna's strip, SUK_ROWS; only the rows C4_USE are cut).
// It runs in the game's 'play' state on top of the normal touch controls: the hook is at the top of drawScene (`if (c4x) { c4xFrame(now, dt); return; }`, like the FATALITY cutscenes), there is no `vs` (no Versus engine) and `story` stays set (it knows the save slot).
// c4x.ph: 'cut' (c4xCutStep: the cutscene, 7.5 s, plain fade from black, silence, the fight song from Yuji's first punch) -> 'fight' (chap4d.js: c4xFightStep) -> 'ranos' (v1.157, chap4e.js: a win and a loss both end the same way: RANOS steps in between Yuji and Sukuna, punches Yuji in the stomach
// and takes him away through a violet circle) -> 'ny' (New York: Yuji falls onto a freeway, the cars honk, Iron Man lands and threatens him with a blade, a hard cut, TO BE CONTINUED, the chapter menu; the flag c15 is set there).
const MEG_PNG = '__MEGPNG__', C4_USE = new Set(['frames', 'walk', 'jump', 'cr', 'ci', 'a0', 'a1', 'a2', 'el', 'cp1', 'sx', 'df', 'dg', 'bl', 'h0', 'h1', 'h2', 'h5', 'h9']), C4M = {};      // (C4M[row] = the 15 pictures of a row, 64 x 64 each, cut from the strip when it has loaded)
(() => {
  const im = new Image();
  im.onload = () => { const n = Math.floor(im.width / 64); SUK_ROWS.forEach((k, r) => { if (!C4_USE.has(k)) return; const a = C4M[k] = []; for (let i = 0; i < n; i++) { const c = document.createElement('canvas'); c.width = c.height = 64; c.getContext('2d').drawImage(im, i * 64, r * 64, 64, 64, 0, 0, 64, 64); a.push(c); } }); };
  im.src = MEG_PNG;
})();
const C4X = { arL: -230, arR: 230, hw: 9, fadeIn: 1.0, end: 7.5, vol: 0.62 };      // (the roof: x from arL to arR; hw = half the width of a fighter; the cutscene lasts `end` seconds, C4S.shock is when Sukuna's shock close-up begins)
const C4X_PROPS = [[-205, 'antenna'], [-150, 'vent'], [-70, 'ac'], [60, 'tank'], [150, 'crate'], [205, 'vent']];
let c4x = null;
const C4S = (() => {      // the cutscene's clock (seconds): every picture of it is a function of T; the timings of the blows are the pictures' own (YU_ATK, SU_CP_FPS)
  const j = YU_ATK.imp[0][0] / YU_ATK.fps[0], k = YU_ATK.imp[8][0] / YU_ATK.fps[8], b = YU_ATK.imp[20][0] / YU_ATK.fps[20], u = 7 / SU_CP_FPS, o = { glow: 1.0, run: 1.45, punch: 1.9, sink: 1.88, sunk: 2.14, slide: 2.2, slideEnd: 2.6, erupt: 2.85, flyMs: 0.81, j, k, b, u };
  o.fly = o.erupt + u;                                        // the uppercut lands on the 8th picture of Meguna's blow
  o.flyEnd = o.fly + o.flyMs; o.rise = o.flyEnd + 0.12; o.up = o.rise + 0.22; o.kick = o.up; o.kickHit = o.kick + k;      // (Yuji lies for 0.12 s, gets up in 0.22 s, kicks)
  o.charge = o.kick + 15 / YU_ATK.fps[8]; o.bf = o.charge + 0.25; o.bfHit = o.bf + b; o.shock = o.bfHit + 0.7; return o;
})();
const C4_TALK = [{ t: 1.5, d: 1.4, w: 'YUJI', vk: 1, a: 'SUKUNA!!', b: '' }, { t: C4S.charge + 0.04, d: 1.2, w: 'YUJI', vk: 1, a: 'AAAAAAAAH!!', b: '' }, { t: C4S.shock + 0.1, d: 1.7, w: 'SUKUNA', vk: 5, a: '...A BLACK FLASH?!', b: '' }];

// ---- the pictures: a Yuji picture is { set, fi, k } (set = a name of YUF.norm, 'atk' / 'rx' / 'dash' with the strip k), a Meguna picture is { row, fi }
function c4xYPic(p) {
  const F = YUF.norm; let a, info;
  if (p.set === 'atk') { a = F.atk[p.k]; info = YU.atk[p.k]; } else if (p.set === 'rx') { a = F.rx[p.k]; info = YU.rx[p.k]; } else if (p.set === 'dash') { a = F.dash[p.k]; info = YU.dash[p.k]; } else { a = F[p.set]; info = YU[p.set]; }
  if (!a || !info) return null; const i = Math.max(0, Math.min(a.length - 1, Math.floor(p.fi) || 0)); return { cv: a[i], info, i };
}
const c4xSX = x => Math.round(VW / 2 + x - c4x.cam);      // (a world x on the screen)
function c4xHand(Y, P) { const h = P.info.hn && P.info.hn[P.i]; return h ? [c4xSX(Y.x) + Math.round((h[0] - (P.info.cx - P.info.x0)) * Y.face), gy - 60 - P.info.top - Math.round(Y.lift) + Math.round(h[1])] : null; }      // (where his hand is on the screen)
function c4xDrawY(Y) {
  const P = Y.pose && c4xYPic(Y.pose); if (!P) return; const top = gy - 60 - P.info.top - Math.round(Y.lift) + Math.round((Y.sink || 0) * 58), off = P.info.cx - P.info.x0;
  ctx.save(); if (Y.sink > 0) { ctx.beginPath(); ctx.rect(0, 0, VW, gy + 2); ctx.clip(); } ctx.translate(c4xSX(Y.x), top + 32); if (Y.rot) ctx.rotate(Y.rot * Y.face); if (Y.face < 0) ctx.scale(-1, 1); if (Y.alpha !== undefined) ctx.globalAlpha = Y.alpha;
  ctx.drawImage(P.cv, -off, -32); if (Y.white) ctx.drawImage(whiteOf(P.cv), -off, -32); if (Y.tint > 0) { ctx.globalAlpha = Y.tint; ctx.drawImage(c15Tint(P.cv, '#b46aff'), -off, -32); } ctx.restore();
}
function c4xDrawM(M) {
  const a = M.pose && C4M[M.pose.row]; if (!a) return; const cv = a[Math.max(0, Math.min(a.length - 1, Math.floor(M.pose.fi) || 0))], y = gy - 61 - Math.round(M.lift) + Math.round((M.sink || 0) * 58);
  ctx.save(); ctx.translate(c4xSX(M.x), 0); if (M.face < 0) ctx.scale(-1, 1); if (M.sink > 0) { ctx.beginPath(); ctx.rect(-48, 0, 96, gy + 2); ctx.clip(); }      // (sinking into the shadow: what is below the roof is not drawn)
  if (M.alpha !== undefined) ctx.globalAlpha = M.alpha; ctx.drawImage(cv, -32, y); if (M.white) ctx.drawImage(whiteOf(cv), -32, y); ctx.restore();
}
function c4xShadow(x, lift, w) { const sx = c4xSX(x), s = Math.max(4, Math.round((w || 9) * (1 - Math.min(1, lift / 70)))), v = Math.round(s * 2 / 3); ctx.fillStyle = 'rgba(0,0,0,0.4)'; ctx.fillRect(sx - s, gy + 3, s * 2, 2); ctx.fillRect(sx - v, gy + 2, v * 2, 1); ctx.fillRect(sx - v, gy + 5, v * 2, 1); }
function c4xPool(x, rx, now, a) {      // a pool of shadow in the roof: a dark ellipse with a violet rim and a ripple
  const sx = c4xSX(x), cy = gy + 3, ry = Math.max(2, Math.round(rx * 0.22)); ctx.save(); ctx.globalAlpha = a === undefined ? 1 : a;
  for (let dy = -ry; dy <= ry; dy++) { const w = Math.round(rx * Math.sqrt(Math.max(0, 1 - (dy * dy) / (ry * ry + 0.01)))); ctx.fillStyle = Math.abs(dy) >= ry - 0 ? '#3a2f6a' : '#05030d'; ctx.fillRect(sx - w, cy + dy, 2 * w, 1); }
  const k = (now / 420) % 1, rr = Math.round(rx * (0.25 + 0.65 * k)); ctx.fillStyle = 'rgba(150,130,230,' + (0.5 * (1 - k)).toFixed(2) + ')'; ctx.fillRect(sx - rr, cy, 2, 1); ctx.fillRect(sx + rr - 2, cy, 2, 1); ctx.fillRect(sx - (rr >> 1), cy - 1, 2, 1); ctx.fillRect(sx + (rr >> 1), cy + 1, 2, 1); ctx.restore();
}
function c4xRing(sx, sy, r, col) { ctx.fillStyle = col; const n = Math.max(12, r * 5); for (let i = 0; i < n; i++) { const th = i / n * 6.2832; ctx.fillRect(Math.round(sx + Math.cos(th) * r), Math.round(sy + Math.sin(th) * r), 1, 1); } }
function c4xGlow(sx, sy, r, cols) { for (let k = 0; k < cols.length; k++) { const rr = Math.max(1, Math.round(r * (1 - k / cols.length))); ctx.fillStyle = cols[k]; for (let yy = -rr; yy <= rr; yy++) { const w = Math.floor(Math.sqrt(rr * rr - yy * yy)); ctx.fillRect(sx - w, sy + yy, 2 * w + 1, 1); } } }
const C4_CE = ['rgba(47,195,230,0.28)', 'rgba(125,244,255,0.55)', 'rgba(214,252,255,0.95)'], C4_BF = ['rgba(18,3,10,0.55)', 'rgba(255,42,58,0.6)', 'rgba(255,176,160,0.95)'];      // (the glow of his fist: cursed energy, then the Black Flash's black and red)

// ---- the world: the night sky of chapter 4 with the moon and the skylines, the roof with its props
function c4xWorld(now) {
  const c = c4x; c15Sky(now / 1000, c.cam, 0); ctx.save(); ctx.translate(Math.round(VW / 2 - c.cam), gy + 2);
  c15Roof(C4X.arL - 60, C4X.arR + 60, 0, 5); for (const [x, k] of C4X_PROPS) c15Prop(k, x, -3, now / 1000);
  ctx.fillStyle = '#232b59'; for (const x of [C4X.arL - 6, C4X.arR + 3]) ctx.fillRect(x, -6, 3, 6);      // (the posts of the low wall at the two ends of the fight)
  ctx.restore();
}
function c4xCam(c, dt, snap) {
  const lock = c.ph === 'ranos' && c.camTo !== undefined, mid = lock ? c.camTo : (c.y.x + c.m.x) / 2, lo = C4X.arL + VW / 2 - 24, hi = C4X.arR - VW / 2 + 24, tg = lo > hi ? 0 : Math.max(lo, Math.min(hi, mid));      // (in the scene of Ranos the camera finds him and then stands still: no sliding about the picture, no flicker from a body that shakes)
  c.cam = snap ? tg : c.cam + (tg - c.cam) * Math.min(1, dt * 7); if (lock && Math.abs(c.cam - tg) < 0.05) c.cam = tg;
}

// ---- start, leave, retry
function c4xStart() {      // called by chapter 4 when its black cut is over: the part begins with the cutscene
  show('play'); const now = pnow(); c4xUi(true); c4xCine(true);
  c4x = { ph: 'cut', t0: now, T: 0, ev: {}, cam: 0, camOk: false, vi: -1, vc: 0, mus: 'off', musAt: now, musGo: false, y: { x: -72, face: 1, lift: 0, pose: null }, m: { x: 36, face: -1, lift: 0, sink: 0, pose: null }, pool: null, fx: [] };
  popups = []; sparks = []; smoke = []; bfList = []; stopMs = 0; shakeUntil = 0; flashUntil = 0; blackUntil = 0;
}
function c4xCine(on) { $('pad').classList.toggle('cine', on); $('hud').classList.toggle('cine', on); }      // (the touch buttons and the top bar are hidden while a cutscene plays, as in the other cutscenes)
function c4xUi(on) { if (!on) c4xCine(false); document.body.classList.toggle('c4', on); $('hud').classList.toggle('vs', on); $('fat').parentNode.classList.toggle('vs', on); $('fat').parentNode.classList.toggle('yj', on); if (on) $('atkl').textContent = 'FLASH'; else lastLabel = ''; }      // (the buttons and the top bar as they are in a Versus match as Yuji: the name of Gojo is hidden, the buttons that Yuji has no use for are hidden by the CSS of body.c4)
function c4xOff() { if (!c4x) return; if (c4x.slow) snd('slowout'); c4x = null; c4xUi(false); if (c9A) { try { c9A.pause(); c9A.currentTime = 0; } catch { /* nothing to stop */ } } }      // (called by show(): any other screen ends the part)
function c4xLeave() { const a = story ? story.slot : -1; c4xOff(); svSel = a; svView = 0; $('vsres').classList.remove('on'); show('saves'); renderSaves(); }      // (the MENU button: back to the saves)
window.__c4x = () => c4x ? { ph: c4x.ph, T: c4x.T, yx: c4x.y.x, mx: c4x.m.x, hp: c4x.F ? c4x.F.hp : -1, mhp: c4x.F ? c4x.F.mhp : -1, fph: c4x.F ? c4x.F.ph : '', bf: c4x.F ? c4x.F.bfN : 0, weak: c4x.F ? c4x.F.weakN : 0, my: c4x.m.st, ys: c4x.y.st, lv: c4xLevel(), win: c4x.rs ? !!c4x.rs.win : null } : null;      // test hook
window.__c4xSkip = () => { if (c4x) c4xSkip(); };
function c4xSkip() {      // the SKIP button: the cutscene -> the fight; Ranos -> New York; New York -> the black and the card; the card -> the chapter menu (the events that are over are not played, see c4xEv)
  const c = c4x; if (!c) return; const now = pnow();
  if (c.ph === 'cut') c.t0 = now - C4X.end * 1000; else if (c.ph === 'ranos') c.t0 = now - (C4RS.lw + C4RS.end) * 1000; else if (c.ph === 'ny') c.t0 = now - (c.T < C4NS.cut ? C4NS.cut + 0.05 : C4NS.end + 0.05) * 1000; else if (c.ph === 'k5') k5Skip(c, now);
}
addEventListener('pointerdown', e => { if (c4x && (c4x.ph === 'cut' || c4x.ph === 'ranos' || c4x.ph === 'ny') && c4x.T > 0.2 && c13InSkip(e)) c4xSkip(); });

// ---- the frame (the hook at the top of drawScene)
function c4xEv(c, T, name, t, fn) { if (T >= t && !c.ev[name]) { c.ev[name] = 1; if (T - t < 0.4) fn(); } }      // (a step of the cutscene fires once; one that a skip jumped over by more than 0.4 s is not played late)
function c4xFrame(now, dt) {
  const c = c4x; if (!c) return; const T = c.T = (now - c.t0) / 1000;
  if (c.ph === 'cut') c4xCutStep(c, now, dt, T); else if (c.ph === 'fight') c4xFightStep(c, now, dt); else if (c.ph === 'ranos') c4xRanosStep(c, now, dt, T); else if (c.ph === 'ny') c4xNyStep(c, now, dt, T); else if (c.ph === 'k5') k5Step(c, now, dt, T);
  if (c4x !== c) return;      // (a step may have ended the part)
  if (c.ph !== 'ny' && c.ph !== 'k5') { c4xCam(c, dt, !c.camOk); c.camOk = true; wx = Math.round(c.cam); } else wx = 0; shkX = shkY = 0;
  ctx.save(); ctx.imageSmoothingEnabled = false;
  if (now < shakeUntil && !SET.lite) { shkX = Math.round((Math.random() * 2 - 1) * shakeAmp * SET.shk / 100); shkY = Math.round((Math.random() * 2 - 1) * shakeAmp * SET.shk / 100); ctx.translate(shkX, shkY); }
  if (c.ph === 'ny') c4xNyDraw(c, now, dt, T); else if (c.ph === 'k5') k5Draw(c, now, dt, T);
  else { c4xWorld(now); if (c.pool) for (const p of c.pool) { if (p.violet) c4xPortal(p.x, p.rx, now, p.a); else c4xPool(p.x, p.rx, now, p.a); } drawSmoke(now, dt); c4xDrawActors(c, now); c4xFx(c, now); drawSparks(now, dt); drawPopups(now); }
  ctx.restore(); c4xOverlay(c, now, T); c4xMusic(c, now);
}
function c4xDrawActors(c, now) {
  const Y = c.y, M = c.m; if (!Y.gone) c4xShadow(Y.x, Y.lift, 9); if (!M.gone && !(M.sink >= 1)) c4xShadow(M.x, M.lift, 9);
  if (c.mFront) { if (!Y.gone) c4xDrawY(Y); c4xDrawM(M); } else { c4xDrawM(M); if (!Y.gone) c4xDrawY(Y); }      // (whoever is in front is drawn last: Yuji, unless Meguna is the one who is striking)
  if (c.pool2) for (const p of c.pool2) c4xPool(p.x, p.rx, now, p.a);      // (a pool that lies over a fighter's feet: drawn after him)
}
function c4xOverlay(c, now, T) {
  if (now < flashUntil) { ctx.fillStyle = 'rgba(190,225,255,' + (flashA * (flashUntil - now) / flashMs) + ')'; ctx.fillRect(0, 0, VW, VH); }
  if (c.vf && now < c.vf) { ctx.fillStyle = 'rgba(' + (c.vfc || '190,130,255') + ',' + (c.vfa * (c.vf - now) / c.vfm).toFixed(3) + ')'; ctx.fillRect(0, 0, VW, VH); }
  const skip = (end, from) => { if (T > (from || 0.2) && T < end - 0.4) { ctx.strokeStyle = 'rgba(255,255,255,0.55)'; ctx.lineWidth = 1; ctx.strokeRect(VW - 39.5, 2.5, 36, 10); pxt('SKIP', VW - 21, 11, '#ffffff', 8, 'center'); } };
  if (c.ph === 'cut') { c4xTalk(c, T, C4_TALK); if (T >= C4S.shock && T < C4X.end - 0.1) c4xCloseUp(c, T); skip(C4X.end); }
  else if (c.ph === 'ranos') { c4xTalk(c, T, C4_TALK_R, VH - 38); skip(C4RS.lw + C4RS.end, 0.8); if (c.whiteA > 0) { ctx.fillStyle = 'rgba(236,222,255,' + c.whiteA.toFixed(3) + ')'; ctx.fillRect(0, 0, VW, VH); } }
  else if (c.ph === 'ny') { if (T < C4NS.cut) { c4xTalk(c, T, C4_TALK_N); skip(C4NS.cut, 0.8); } }
  else if (c.ph === 'fight') c4xHud(c, now); else if (c.ph === 'k5') k5Overlay(c, now, T);
  const a = c.ph === 'cut' ? 1 - c4xEase(T / C4X.fadeIn) : c.black ? c.black(now) : 0; if (a > 0.004) { ctx.fillStyle = 'rgba(0,0,0,' + Math.min(1, a).toFixed(3) + ')'; ctx.fillRect(0, 0, VW, VH); }
  if (c.ph === 'fight' || c.ph === 'ranos') c4xBanner(c, now);
  if (c.ph === 'k5') k5After(c, now, T);      // (v1.177 chapter 5: the words after a death are over the black)
}
const c4xEase = u => { u = Math.max(0, Math.min(1, u)); return u * u * (3 - 2 * u); }, c4xOut = u => { u = Math.max(0, Math.min(1, u)); return 1 - (1 - u) * (1 - u); };
function c4xTalk(c, T, L, oy) {      // the few lines: the speech box in the corner (oy = how far down it is moved), the letters come out with the blips of the speaker's voice
  const i = L.findIndex(s => T >= s.t && T < s.t + s.d); if (i < 0) return; const s = L[i], n = Math.floor((T - s.t) * TN_RATE);
  if (c.vi !== i) { c.vi = i; c.vc = 0; } while (c.vc < Math.min(n, s.a.length)) { c.vc++; if (s.a[c.vc - 1] !== ' ') snd('tvoice', s.vk || 0); } if (oy) { ctx.save(); ctx.translate(0, oy); } c7Dlg(s.w, s.a, n, s.b); if (oy) ctx.restore();
}
function c4xCloseUp(c, T) {      // Sukuna is shocked: his face from the picture, four times as big, in a frame on the right
  const a = C4M.frames; if (!a) return; const cv = a[0], S = 3, w = 28, h = 26, x0 = VW - 8 - w * S, y0 = 22, k = c4xEase((T - C4S.shock) / 0.12);
  ctx.save(); ctx.globalAlpha = k; ctx.fillStyle = '#12030a'; ctx.fillRect(x0 - 3, y0 - 3, w * S + 6, h * S + 6); ctx.fillStyle = '#ff2a3a'; ctx.fillRect(x0 - 3, y0 - 3, w * S + 6, 1); ctx.fillRect(x0 - 3, y0 + h * S + 2, w * S + 6, 1); ctx.fillRect(x0 - 3, y0 - 3, 1, h * S + 6); ctx.fillRect(x0 + w * S + 2, y0 - 3, 1, h * S + 6);
  ctx.beginPath(); ctx.rect(x0, y0, w * S, h * S); ctx.clip(); ctx.fillStyle = '#241c3c'; ctx.fillRect(x0, y0, w * S, h * S); ctx.translate(x0 + w * S / 2 + Math.round((Math.random() - 0.5) * 2), y0); ctx.scale(-S, S);      // (he faces left: mirrored so he looks at Yuji)
  ctx.drawImage(cv, 21, 3, w, h, -w / 2, 0, w, h); ctx.restore();
  if (((T * 8) | 0) % 2 === 0) pxt('?!', x0 + 6, y0 + h * S - 3, '#ffffff', 16);
}

// ---- the music: silence in the cutscene until Yuji's first punch, then the fight song (tools/fight_music.mp3, the same audio element as chapter 3's) in a loop
function c4xMusic(c, now) {
  const want = c.mus !== 'off' && !paused && !document.hidden, a = want ? c9Audio() : c9A;
  if (!want) { if (a && !a.paused) a.pause(); return; } if (!a) return; a.loop = true;
  const k = c.mus === 'on' ? Math.min(1, (now - c.musAt) / 300) : Math.max(0, 1 - (now - c.musAt) / 1000), g = C4X.vol * k, node = sfx && soundOn && sfx.ac.state === 'running' ? sfx.music(a) : null;
  if (node) node.gain.setTargetAtTime(Math.max(0, g), sfx.ac.currentTime, 0.04); else a.volume = soundOn ? Math.max(0, Math.min(1, g)) : 0;
  if (c.mus === 'out' && k <= 0) { if (!a.paused) a.pause(); c.mus = 'off'; return; }
  if (c.mus === 'on' && !c.musGo) { c.musGo = true; try { a.currentTime = 0; } catch { /* not ready yet */ } }
  if (a.paused) { const pr = a.play(); if (pr && pr.catch) pr.catch(() => { }); }
}
function c4xMus(c, on, now) { if (on && c.mus !== 'on') { c.mus = 'on'; c.musAt = now; c.musGo = false; } else if (!on && c.mus === 'on') { c.mus = 'out'; c.musAt = now; } }

// ================================================================ THE CUTSCENE (C4S: the clock)
// Yuji (left) charges at Sukuna (right, in Megumi's body) with a glowing fist and punches; Meguna sinks into his shadow, the shadow slides under Yuji's feet and Meguna comes up out of it with an uppercut that throws Yuji up and back; Yuji lands, kicks Meguna away,
// runs at him screaming with a black-and-red fist and lands a BLACK FLASH; Sukuna is shocked (a close-up of his face), then the fight begins where they stand.
function c4xCutStep(c, now, dt, T) {
  const Y = c.y, M = c.m, ev = (n, t, f) => c4xEv(c, T, n, t, f), idle = now / (1000 / IDLE_FPS);
  c.pool = null; c.pool2 = null; c.mFront = true; Y.rot = 0; Y.white = 0; M.white = 0; Y.lift = 0; M.lift = 0; M.sink = 0; Y.face = 1; M.face = -1; c.glow = null;
  // ---- Yuji
  if (T < C4S.run) { Y.x = -72; Y.pose = { set: 'idle', fi: idle }; }
  else if (T < C4S.punch) { Y.x = -72 + 190 * (T - C4S.run); Y.pose = { set: 'run', fi: (T - C4S.run) * 30 }; }
  else if (T < C4S.fly) { Y.x = 13.5; const e = T - C4S.punch; Y.pose = e < 0.5 ? { set: 'atk', k: 0, fi: e * YU_ATK.fps[0] } : { set: 'idle', fi: idle }; }
  else if (T < C4S.flyEnd) { const tau = T - C4S.fly, u = tau / C4S.flyMs; Y.x = 13.5 - 44 * u; Y.lift = Math.max(0, 170 * tau - 210 * tau * tau); Y.pose = { set: 'rx', k: 4, fi: Math.min(9, u * 9.9) }; }
  else if (T < C4S.rise) { Y.x = -30.5; Y.pose = { set: 'rx', k: 4, fi: 10 + (T - C4S.flyEnd) / (C4S.rise - C4S.flyEnd) }; }
  else if (T < C4S.up) { Y.x = -30.5; Y.pose = { set: 'rx', k: 4, fi: 12 + 2.99 * (T - C4S.rise) / (C4S.up - C4S.rise) }; }
  else if (T < C4S.charge) { Y.x = -30.5; Y.pose = { set: 'atk', k: 8, fi: (T - C4S.kick) * YU_ATK.fps[8] }; }
  else if (T < C4S.bf) { Y.x = -30.5 + 250 * (T - C4S.charge); Y.pose = { set: 'run', fi: (T - C4S.charge) * 30 }; }
  else if (T < C4S.bf + 15 / YU_ATK.fps[20]) { const e = T - C4S.bf; Y.x = 32 + 16 * c4xOut(e / C4S.b); Y.pose = { set: 'atk', k: 20, fi: e * YU_ATK.fps[20] }; }
  else { Y.x = 48; Y.pose = { set: 'idle', fi: idle }; }
  // ---- Meguna
  if (T < C4S.sink) { M.x = 36; M.pose = { row: 'frames', fi: idle }; }
  else if (T < C4S.sunk) { M.x = 36; M.sink = c4xEase((T - C4S.sink) / (C4S.sunk - C4S.sink)); M.pose = { row: 'frames', fi: idle }; }
  else if (T < C4S.erupt) { M.sink = 1; M.pose = { row: 'frames', fi: 0 }; const u = c4xEase((T - C4S.slide) / (C4S.slideEnd - C4S.slide)); c.pool = [{ x: 36 + (13.5 - 36) * u, rx: 14 + 8 * u, a: 1 }]; M.x = c.pool[0].x; }
  else if (T < C4S.fly + 0.3) { M.x = 20; M.face = -1; const e = T - C4S.erupt; M.sink = Math.max(0, 1 - e / 0.1); M.pose = { row: 'cp1', fi: e * SU_CP_FPS }; if (e < 0.45) c.pool = [{ x: 14, rx: 22 * (1 - c4xEase((e - 0.1) / 0.35)), a: 1 }]; }
  else if (T < C4S.kick - 0.2) { M.x = 20; M.pose = { row: 'frames', fi: idle }; }
  else if (T < C4S.kickHit) { const u = c4xOut((T - (C4S.kick - 0.2)) / (C4S.kickHit - C4S.kick + 0.2)); M.x = 20 - 28 * u; M.pose = { row: 'df', fi: Math.min(14, u * 14.9) }; }
  else if (T < C4S.kickHit + 0.55) { const u = c4xOut((T - C4S.kickHit) / 0.55); M.x = -8 + 78 * u; M.pose = { row: 'h9', fi: Math.min(14, (T - C4S.kickHit) * 28.5) }; }
  else if (T < C4S.bfHit) { M.x = 70; M.pose = { row: 'frames', fi: idle }; }
  else if (T < C4S.bfHit + 0.75) { const u = c4xOut((T - C4S.bfHit) / 0.75); M.x = 70 + 50 * u; M.pose = { row: 'h9', fi: Math.min(14, (T - C4S.bfHit) * 22) }; }
  else { M.x = 120; M.pose = { row: 'h1', fi: Math.min(14, 8 + (T - C4S.bfHit - 0.75) * 6) }; }
  // ---- the fist: cursed energy from C4S.glow, black and red from the charge on
  const P = c4xYPic(Y.pose), h = P && c4xHand(Y, P);
  if (T >= C4S.glow && T < C4S.bf + 0.6 && h && !(T >= C4S.fly && T < C4S.charge)) { const bf = T >= C4S.charge, r = 3 + ((now / 70) & 1) + (T > C4S.punch - 0.1 && T < C4S.punch + 0.3 ? 1 : 0); c.glow = { x: h[0], y: h[1], r, cols: bf ? C4_BF : C4_CE }; }
  // ---- sounds and effects
  ev('ceon', C4S.glow, () => snd('ceon')); ev('run', C4S.run, () => snd('yrun'));
  if (T >= C4S.punch && !c.musDone) { c.musDone = 1; c4xMus(c, true, now); }      // (the song begins with Yuji's first punch; after a skip it begins at once)
  ev('swing1', C4S.punch + C4S.j - 0.07, () => snd('swing', 1)); ev('sink', C4S.sink, () => snd('vanish'));
  ev('slide', C4S.slide, () => snd('c7slide'));
  ev('erupt', C4S.erupt, () => { snd('arrive'); shakeUntil = now + 120; shakeAmp = 1; });
  ev('upHit', C4S.fly, () => { snd('hit', 3); snd('smack', 3); hitStop(70); buzz(60); shakeUntil = now + 200; shakeAmp = 3; flash(now, 80, 0.25); spark(Y.x + 2, gy - 22, 14, ['#ffffff', '#ffb09a', '#ff6a5a'], true, -1); });
  ev('land', C4S.flyEnd, () => { snd('land', 1.6); puff(Y.x, 8); shakeUntil = now + 120; shakeAmp = 2; });
  ev('kick', C4S.kick + 0.03, () => snd('swing', 3));
  ev('kickHit', C4S.kickHit, () => { snd('hit', 3); snd('smack', 3); hitStop(70); buzz(60); shakeUntil = now + 220; shakeAmp = 3; flash(now, 70, 0.2); spark(M.x + 4, gy - 26, 14, ['#ffffff', '#ffb09a', '#ff6a5a'], true, 1); puff(M.x, 6); });
  ev('scream', C4S.charge, () => snd('yscream'));
  ev('slow', C4S.bf + 0.04, () => slowMo(1000, 0.35));
  ev('bfswing', C4S.bf + 0.18, () => snd('swing', 3));
  ev('bfHit', C4S.bfHit, () => { bfFx(now, M.x, 20); snd('hit', 3); snd('smack', 3); snd('yfbf'); shakeUntil = now + 420; shakeAmp = 5; flash(now, 140, 0.5); }); if (T >= C4S.bfHit && T < C4S.bfHit + 0.5) M.white = ((now / 60) & 1) ? 1 : 0;
  ev('gasp', C4S.shock, () => snd('gasp'));
  if (T >= C4X.end) c4xBegin(now);
}
function c4xFx(c, now) {
  if (c.glow) { c4xGlow(c.glow.x, c.glow.y, c.glow.r, c.glow.cols); if (c.glow.cols === C4_BF) for (let i = 0; i < 4; i++) bfBolt(c.glow.x, c.glow.y, Math.random() * 6.283, 4 + ((Math.random() * 6) | 0)); else if (Math.random() < 0.5) { ctx.fillStyle = '#d6fcff'; ctx.fillRect(c.glow.x + Math.round((Math.random() - 0.5) * 12), c.glow.y + Math.round((Math.random() - 0.5) * 12), 1, 1); } }
  if (c.fx) for (const f of c.fx) f(now);
}
