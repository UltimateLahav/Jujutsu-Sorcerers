// ---------------------------------------------------------------- v1.95 CHAPTER 2: THE PORTAL, the opening (this file is spliced into template.html by build_html.py, in place of the marker line after the custom mode's)
// After END OF CHAPTER 1 (the Master took Gojo through his portal): night, the alley where it all began. The same dark portal opens at the end of it. Yuji cries out and charges for it, Verity blinks in and stops him with his long arm (his real JUMPSCARE grab picture), says "HEY, IT'S ME, IT'S VERITY" in his real voice, and they throw hands: seven blows, Yuji's and Verity's by turns (the pictures are the fighters' own: Yuji's R.HOOK, L.HOOK, UPPERCUT and R.KICK, Verity's three swings, each hit with its own reaction), and the last two meet in the middle (Yuji's CONCENTRATED FIST against Verity's long arm): equal. Then the fight is yours: you are Yuji with the moves of the training (TN_KIT) against Verity (GRADE 2), and the aim is NOT to knock him out but to get INTO THE PORTAL (v1.96, the last part of this file): he stands in the way, and his STOP (a blink and a long arm, a red arm, a low sweep) pushes you back. When you are in, the ending starts: it is in chap2b.js (v1.97: the grab, the Master's side of the portal, the beating, the pierce, WASTED POTENTIAL).
// Every actor is a pure function of the scene time T, so a tap that skips to the next cut (or a test that jumps in time) always draws the right picture.
// v1.103 THE PORTAL FIGHTS BACK: the run to the portal was far too easy (a bot that only held RIGHT and dashed past him was in after 4 to 9 seconds), so the fight was rebuilt in the last part of this file: a street more than twice as long in three zones that get meaner, four kinds of STOP, the portal's wind, and a free run that is much shorter.
TN_COL.VERITY = '#f0d84a';
const C3 = { portal: 1.6, say1: 3.7, charge: 6.0, arrive: 6.25, stop: 6.9, voice: 7.4, brawl: 14.6, step: 0.72, hold: 0.09, hold2: 0.16, gap: 34 };      // the times of the opening (seconds); step = the time of one exchange of blows, hold = the picture stops for that long at every impact (the hit-stop), gap = how far apart their chests stand
const C3_STEPS = [{ w: 'y', k: 0, r: 6 }, { w: 'v', k: 0, r: 2 }, { w: 'y', k: 1, r: 2 }, { w: 'v', k: 2, r: 5 }, { w: 'y', k: 13, r: 7 }, { w: 'v', k: 3, r: 8 }, { w: 'y', k: 5, r: 0 }];      // w = who strikes (y = Yuji, v = Verity), k = his move (Yuji's numbers are YU_ATK's, Verity's are ATK_FPS's), r = the reaction of the one who is hit (0-9)
C3.clash = C3.brawl + C3_STEPS.length * C3.step + 0.55; C3.stand = C3.clash + C3.hold2 + 0.6; C3.end = C3.stand + 2.4;      // the moment the two big blows meet, the stand-off, the fight
const C3_TALK = [
  { t: C3.say1, d: 2.2, w: 'YUJI', a: 'THE PORTAL AGAIN!', b: 'SENSEI IS IN THERE!' },
  { t: C3.voice, d: 3.6, w: 'VERITY', a: 'HEY, ITS ME.', b: 'ITS VERITY.', voice: true },
  { t: 11.4, d: 1.6, w: 'YUJI', a: 'GOJO DELETED YOU!', b: '' },
  { t: 13.0, d: 1.5, w: 'VERITY', a: 'NOBODY ENTERS.', b: '' },
  { t: C3.stand + 0.1, d: 1.8, w: 'YUJI', a: 'THEN I WILL GO', b: 'THROUGH YOU!' }];
const C3_CUTS = [C3.say1, C3.charge, C3.voice, 11.4, C3.brawl, C3.stand, C3.end];      // taps jump to the next of these

// ---- where everybody is (worked out from the real pictures: Yuji faces right, Verity left)
const c3YT = (k, f) => { const p = tnPick({ atkOn: true, atkK: k, af: Math.min(14, Math.floor(f)) }); return -(p.info.cx - p.info.x0) + tnEdges(p.set[p.fi]).R; };      // how far in front of his middle Yuji's fist is at frame f of his move k
const c3VT = (nm, f) => 32 - tnEdges(vfr(nm, f, false)).R;      // where Verity's hand is, from his middle (a negative number: he faces left)
function c3Geo() {
  const yp = tnPick({ now: 0 }), yF = -(yp.info.cx - yp.info.x0) + tnEdges(yp.set[yp.fi]).R, vF = c3VT('idle', 0), Yh = 0, Vh = Math.round(Yh + yF + C3.gap - vF), dp = yujiPick({ dodging: true, dgK: 0, df: 5, dgCr: false }), yD = -(dp.info.cx - dp.info.x0) + tnEdges(dp.set[dp.fi]).R;
  return { yF, vF, Yh, Vh, Ys: -Math.round(VW * 0.3), PX: Math.min(Vh + 62, Math.round(VW / 2) - 24), Yst: Math.round(Vh + c3VT('scare_grab', 12) + 2 - yD) };      // Yst: where Yuji's chest meets the palm of Verity's stretched arm
}
const c3Mv = (w, k) => w === 'y' ? { fps: YU_ATK.fps[k], imp: YU_ATK.imp[k][0], sw: YU_ATK.swing[k][0] } : { fps: ATK_FPS[k], imp: ATK_IMPACT[k], sw: ATK_SWING[k] };      // the speed of a move, its impact frame and the frame it starts to swing on
const c3F = (M, e, h) => e < M.imp / M.fps ? e * M.fps : e < M.imp / M.fps + h ? M.imp : (e - h) * M.fps;      // the picture of a swing e seconds after it began: it stops for h seconds at the impact
const c3AC = {};
function c3Acts(who, G) {      // what this fighter does in the brawl: his own blows and his flinches, each from t0 to t1 (a later one takes over the picture; the places they put him at add up)
  const ready = !!(SIMG.vanim && SIMG.vanim.m0 && SIMG.vanim.m0.complete && SIMG.vanim.m0.naturalWidth && SIMG.vanim.scare_grab && SIMG.vanim.scare_grab.complete && SIMG.vanim.scare_grab.naturalWidth), key = who + VW + 'x' + gy; if (ready && c3AC[key]) return c3AC[key];
  const out = [];
  C3_STEPS.forEach((S, i) => {
    const s = C3.brawl + i * C3.step, M = c3Mv(S.w, S.k), ti = M.imp / M.fps;
    if (S.w === who) { const nm = who === 'y' ? '' : 'm' + S.k, lunge = who === 'y' ? G.Vh + G.vF + 3 - c3YT(S.k, M.imp) - G.Yh : G.Yh + G.yF - 3 - c3VT(nm, M.imp) - G.Vh; out.push({ t0: s, t1: s + 15 / M.fps + C3.hold, kind: 'atk', k: S.k, nm, M, ti, h: C3.hold, lunge: Math.max(-10, Math.min(24, lunge)), i }); }
    else out.push({ t0: s + ti + C3.hold, t1: s + ti + C3.hold + RX_DUR[S.r] / 1000, kind: 'rx', r: S.r, kb: 5 });
  });
  const mid = Math.round((G.Yh + G.yF + G.Vh + G.vF) / 2), yt = c3YT(9, 7), vt = c3VT('scare_grab', 10), c0 = C3.clash + C3.hold2;      // the clash: Yuji's CONCENTRATED FIST (impact on 7 at 24 a second) against Verity's stretched arm (his JUMPSCARE grab, impact on 10): the two tips meet in the middle, the picture stops, then both are thrown back
  if (who === 'y') { const M = { fps: 24, imp: 7, sw: 6 }, ti = 7 / 24; out.push({ t0: C3.clash - ti, t1: c0 + 0.4, kind: 'atk', k: 9, nm: '', M, ti, h: C3.hold2, lunge: mid - 1 - yt - G.Yh, clash: true }); }
  else { const M = { fps: 24, imp: 10, sw: 4 }, ti = 10 / 24; out.push({ t0: C3.clash - ti, t1: c0 + 0.4, kind: 'atk', k: 0, nm: 'scare_grab', M, ti, h: C3.hold2, lunge: mid + 1 - vt - G.Vh, clash: true }); }
  out.push({ t0: c0, t1: c0 + RX_DUR[0] / 1000, kind: 'rx', r: 0, kb: 16 });
  if (ready) c3AC[key] = out; return out;
}
const c3Env = (a, T) => {      // how far from his home place a blow has taken him: a lunge forward on the swing, a push back on a flinch (0 at both ends of the action)
  const e = T - a.t0;
  if (a.kind === 'atk') return a.lunge * (e < a.ti ? ease3(e / a.ti) : e < a.ti + a.h ? 1 : 1 - ease3((e - a.ti - a.h) / 0.3));
  return a.kb * Math.sin(Math.PI * clamp01(e / (a.kb > 8 ? 0.6 : 0.4)));
};

// ---- the two fighters at scene time T: { x, p } for Yuji (his picture pick, run = the charge with his hair in the wind), { x, src, info, lift, a } for Verity
function c3Pose(T, G) {
  const ms = T * 1000, V0 = { w: 64, h: 64, cx: 32, x0: 0, top: 0 };
  let Y = { x: G.Ys, p: tnPick({ now: ms }), run: 0 }, V = { x: G.Vh, src: vfr('idle', T * 10, true), info: V0, lift: 0, a: 1 };
  if (T >= C3.charge && T < C3.stop) { const u = (T - C3.charge) / (C3.stop - C3.charge); Y = { x: lerp(G.Ys, G.Yst, 1 - Math.pow(1 - u, 1.5)), p: null, run: 1, f: T * 36 }; }
  else if (T >= C3.stop) {
    const a = T - C3.stop;
    if (a < 0.55) Y = { x: G.Yst + Math.round(Math.sin(a * 60)) * 0.6, p: null, run: 1, f: 5 };      // stopped dead: he strains against the arm
    else if (a < 1.1) Y = { x: lerp(G.Yst, G.Yh, ease3((a - 0.55) / 0.55)), p: tnPick({ idle: false, mode: 'back', now: ms, modeAt: (C3.stop + 0.55) * 1000 }), run: 0 };
    else Y = { x: G.Yh, p: yujiPick({ blocking: true, dir: 0, bf: 9 }), run: 0 };      // then the guard: fists up
  }
  const g0 = C3.arrive + 0.3;      // Verity: blinks in (his own teleport picture, the second half), the arm shoots out (frames 4-10 of the grab), holds, comes back
  if (T < C3.arrive) V.a = 0;
  else if (T < g0) { const u = (T - C3.arrive) / 0.3; V.src = vfr('tele', 6 + 8.99 * u, false); V.x = G.Vh + Math.round(12 * (1 - ease3(u))); }
  else if (T < C3.voice + 0.3) V.src = vfr('scare_grab', Math.min(12, 4 + (T - g0) * 24), false);
  else if (T < C3.voice + 1.0) V.src = vfr('scare_grab', 12 - (T - C3.voice - 0.3) / 0.7 * 12, false);
  if (T >= C3.brawl - 0.1) {      // the brawl: every action that is on right now, the latest one wins; the guard and the idle breathing between
    const yA = c3Acts('y', G).filter(a => T >= a.t0 && T < a.t1), vA = c3Acts('v', G).filter(a => T >= a.t0 && T < a.t1), yAct = yA.sort((a, b) => b.t0 - a.t0)[0], vAct = vA.sort((a, b) => b.t0 - a.t0)[0];
    Y = { x: G.Yh + yA.reduce((m, a) => m + (a.kind === 'atk' ? 1 : -1) * c3Env(a, T), 0), p: yujiPick({ blocking: true, dir: 0, bf: 9 }), run: 0 }; V = { x: G.Vh + vA.reduce((m, a) => m + c3Env(a, T), 0), src: vfr('idle', T * 10, true), info: V0, lift: 0, a: 1 };
    if (yAct) { const e = T - yAct.t0; Y.p = yAct.kind === 'atk' ? tnPick({ atkOn: true, atkK: yAct.k, af: Math.min(14, Math.floor(c3F(yAct.M, e, yAct.h))) }) : yujiPick({ hurting: true, hurtK: yAct.r, hurtAt: 0, now: Math.max(0, e) * 1000 }); }
    if (vAct) {
      const e = T - vAct.t0;
      if (vAct.kind === 'atk') V.src = vfr(vAct.nm, Math.min(14, c3F(vAct.M, e, vAct.h)), false);
      else { const fi = Math.min(14, e * 1000 / RX_DUR[vAct.r] * 15); V.src = vrx(vAct.r, fi); V.info = VRXIN[vAct.r]; V.lift = V.info.lift ? V.info.lift[Math.floor(fi)] : 0; }
    }
  }
  return { Y, V };
}
function c3Draw(now, dt, T, G, cx) {      // the two fighters, the dust, the sparks, the rings
  const P = c3Pose(T, G), sx = x => Math.round(cx + x);
  if (P.V.a > 0) { ctx.globalAlpha = P.V.a; shadow(sx(P.V.x), 9); sprAt(P.V.src, P.V.info, sx(P.V.x), P.V.lift, true, 0); ctx.globalAlpha = 1; }
  if (P.Y.run) rsYuji(sx(P.Y.x), 0, 'dash', T, { f: P.Y.f, wind: T < C3.stop ? 0.55 : 0.25 }); else { shadow(sx(P.Y.x), 9); sprAt(P.Y.p.set[P.Y.p.fi], P.Y.p.info, sx(P.Y.x), P.Y.p.lift, false, 0); }
  return P;
}
function c3Sparks(now, dt, cx) {      // the sparks of the blows (the world's spark list), drawn here because the cutscene has no other scene to draw them
  sparks = sparks.filter(p => now - p.born < p.life);
  for (const p of sparks) { p.x += p.vx * dt; p.y += p.vy * dt; p.vy += 230 * dt; p.vx *= Math.exp(-3 * dt); const k = (now - p.born) / p.life, h = Math.abs(p.vx) > Math.abs(p.vy); ctx.globalAlpha = Math.max(0, Math.min(1, 1.7 * (1 - k))); ctx.fillStyle = p.c; ctx.fillRect(Math.round(cx + p.x), Math.round(p.y), h ? p.len : 1, h ? 1 : p.len); }
  ctx.globalAlpha = 1;
}
function c3Ring(x, y, a, big, col, sc) {      // a blow lands: rings run out from the point of contact and a white star flashes (a = seconds since contact; sc = the size, 1 if left out: smaller in a close-up)
  if (a < 0 || a > 0.4) return; const f = 1 - a / 0.4; ctx.save(); if (sc && sc !== 1) { ctx.translate(x, y); ctx.scale(sc, sc); ctx.translate(-x, -y); } ctx.globalCompositeOperation = 'lighter'; ctx.lineWidth = 1 / (sc || 1);
  for (let i = 0; i < 2; i++) { ctx.strokeStyle = 'rgba(' + col + ',' + (0.8 * f * (1 - i * 0.35)).toFixed(3) + ')'; ctx.beginPath(); ctx.arc(x, y, 3 + a * (big ? 80 : 40) + i * 5, 0, 6.2832); ctx.stroke(); }
  if (a < 0.12) { ctx.fillStyle = '#fff'; ctx.fillRect(x - 3, y, 7, 1); ctx.fillRect(x, y - 3, 1, 7); ctx.fillRect(x - 1, y - 1, 3, 3); }
  ctx.restore();
}
function c3Talk(T, L) {      // the speech box of the line that is on now (L: the list of lines, the opening's by default); the letters come out 20 a second, each with a blip of its speaker's voice (s.vk = the voice's number, as tvoice: 0 Gojo, 1 Yuji, 2 the Master, 3 "???")
  L = L || C3_TALK; const i = L.findIndex(s => T >= s.t && T < s.t + s.d); if (i < 0) return; const s = L[i], n = Math.floor((T - s.t) * TN_RATE), sp = s.a + s.b, c = story.c3;
  if (c.vi !== i) { c.vi = i; c.vc = 0; } while (c.vc < Math.min(n, sp.length)) { c.vc++; if (sp[c.vc - 1] !== ' ' && !s.voice) snd('tvoice', s.vk != null ? s.vk : s.w === 'YUJI' ? 1 : 0); } tnDlg(s.w, s.a, s.b, n);
}

// ---- the opening: one frame
function c3Frame(now, dt) {
  const T = story.T = Math.max(0, now - story.t0) / 1000, G = c3Geo(), cx = Math.round(VW / 2), sx = x => Math.round(cx + x), ev = (k, t, f, win) => { if (T >= t && T < t + (win || 0.5)) once2(k, f); };
  wx = 0; ctx.save(); ctx.imageSmoothingEnabled = false; ctx.fillStyle = '#000'; ctx.fillRect(0, 0, VW, VH);
  const sk = story.shk && now < story.shk.until ? story.shk.amp : 0; ctx.save(); if (sk) ctx.translate(Math.round((Math.random() * 2 - 1) * sk), Math.round((Math.random() * 2 - 1) * sk));
  drawAlley(now); const pp = ease3((T - C3.portal) / 1.4);
  if (pp > 0) { rsPortal(sx(G.PX), pp, T); ctx.fillStyle = 'rgba(30,10,60,' + (0.16 * pp).toFixed(3) + ')'; ctx.fillRect(0, 0, VW, VH); }
  const P = c3Draw(now, dt, T, G, cx);
  // sounds and effects (each fires once; the window keeps a skipped step from firing late)
  ev('portal', C3.portal, () => snd('rsportal'), 1.0); ev('dash', C3.charge, () => snd('dash', 0)); { const s = Math.floor((T - C3.charge) / 0.17); if (T >= C3.charge && T < C3.stop && s !== story.c3.rs) { story.c3.rs = s; snd('yrun', 0); } }
  ev('arrive', C3.arrive + 0.1, () => { snd('arrive'); snd('blink'); spark(G.Vh, gy - 30, 10, ['#c890ff', '#7a3aff', '#ffffff'], false, 1); }); ev('grab', C3.arrive + 0.35, () => snd('f:swing', 3));
  ev('stop', C3.stop, () => { snd('f:hit', 3); snd('smack', 2); c2Shake(now, 200, 2); story.fl = now; spark(G.Yst + 14, gy - 34, 14, ['#ffffff', '#ffe9a0', '#f0d84a'], true, -1); puff(G.Yst, 4); });
  ev('voice', C3.voice, () => { voiceLoad(); playVoice(); }, 0.4);
  if (T >= C3.stop && T < C3.stop + 0.5 && Math.floor(T * 14) !== story.c3.dust) { story.c3.dust = Math.floor(T * 14); puff(G.Yst - 6, 1); }
  C3_STEPS.forEach((S, i) => { const s = C3.brawl + i * C3.step, M = c3Mv(S.w, S.k), ti = M.imp / M.fps, tip = S.w === 'y' ? G.Yh + c3Env(c3Acts('y', G).find(a => a.i === i), s + ti) + c3YT(S.k, M.imp) : G.Vh + c3Env(c3Acts('v', G).find(a => a.i === i), s + ti) + c3VT('m' + S.k, M.imp), hy = S.k === 5 ? gy - 22 : S.k === 13 ? gy - 40 : gy - 34;
    ev('sw' + i, s + M.sw / M.fps, () => snd('f:swing', ySwingK(S.k)), 0.3);
    ev('ht' + i, s + ti, () => { snd('f:hit', S.k === 13 ? 3 : 0); snd('smack', S.k === 13 ? 2 : 1); c2Shake(now, 130, S.k === 13 ? 2.2 : 1.4); spark(tip, hy, S.k === 13 ? 12 : 8, ['#ffffff', '#ffe9a0', S.w === 'y' ? '#ff9a9a' : '#f0d84a'], S.k === 13, S.w === 'y' ? 1 : -1); }, 0.3);
    const a = T - (s + ti); if (a > 0 && a < 0.4) c3Ring(sx(tip), hy, a, false, S.w === 'y' ? '255,235,200' : '240,220,90'); });
  { const mid = Math.round((G.Yh + G.yF + G.Vh + G.vF) / 2), a = T - C3.clash;
    ev('clash', C3.clash, () => { snd('tink', 1); snd('finisher'); snd('smack', 3); snd('rumble', 3); c2Shake(now, 320, 4); story.fl = now; spark(mid, gy - 36, 22, ['#ffffff', '#ffe9a0', '#f0d84a', '#c890ff'], true, 1); spark(mid, gy - 36, 22, ['#ffffff', '#ffe9a0', '#f0d84a', '#c890ff'], true, -1); puff(mid - 16, 3); puff(mid + 16, 3); }, 0.3); c3Ring(sx(mid), gy - 36, a, true, '255,240,190'); }
  drawSmoke(now, dt); c3Sparks(now, dt, cx); ctx.restore();
  rsWindBits(T, 0.25 + 0.45 * pp, 0, VW);
  if (story.fl && now - story.fl < 120) { ctx.fillStyle = 'rgba(255,255,255,' + (0.6 * (1 - (now - story.fl) / 120)).toFixed(2) + ')'; ctx.fillRect(0, 0, VW, VH); }
  if (T > 0.7 && T < 3.9) { const a = clamp01(Math.min((T - 0.7) / 0.6, (3.9 - T) / 0.6)); ctx.globalAlpha = a; pxt('CHAPTER 2', VW / 2, Math.round(VH * 0.38), '#ffffff', 16, 'center'); pxt('THE PORTAL', VW / 2, Math.round(VH * 0.38) + 16, '#c9a8ff', 8, 'center'); ctx.globalAlpha = 1; }
  c3Talk(T);
  const fa = T < 0.7 ? 1 - T / 0.7 : T > C3.end - 0.6 ? clamp01((T - (C3.end - 0.6)) / 0.6) : 0; if (fa > 0) { ctx.fillStyle = 'rgba(0,0,0,' + fa.toFixed(3) + ')'; ctx.fillRect(0, 0, VW, VH); }
  ctx.restore(); if (T >= C3.end && !story.battle) startC3Battle();
}

// ---- the chapter: start, frame, taps, the fight, the ending
function startC3(slot) { audio(); show('story'); voiceLoad(); story = { slot, t0: pnow(), battle: false, T: 0, ev: {}, shk: null, c3: { end: false, vi: -1, vc: 0, rs: -1, dust: -1 } }; alley = true; court = false; track = false; wx = 0; }
function c3Frame0(now, dt) { if (story.c3.end) c3EndFrame(now, dt); else c3Frame(now, dt); }
function startC3Battle() { story.battle = true; alley = true; court = false; track = false; startMatch(2, 'c3', 0, 'verity'); }      // (a story fight against Verity with you as Yuji: see startMatch; REMATCH starts the same one)
function startC3End(now) { show('story'); story.c3 = { end: true, vi: -1, vc: 0, rs: -1, dust: -1 }; story.battle = false; story.t0 = now; story.T = 0; story.ev = {}; story.shk = null; alley = true; court = false; track = false; wx = 0; }
function c3Skip() {      // a tap: on to the next cut; on the card (after its first 1.2 s) back to the saves
  const c = story.c3; if (c.end) { const T = story.T; if (T >= C3E.card + 1.2) { show('saves'); renderSaves(); return; } const n = C3E_CUTS.find(x => x > T + 0.05); if (n !== undefined) story.t0 = pnow() - n * 1000; return; }
  const n = C3_CUTS.find(x => x > story.T + 0.05); if (n !== undefined) story.t0 = pnow() - n * 1000;
}
function storyDone5() { if (!story) return; const a = loadSaves(); if (a[story.slot]) a[story.slot].c3 = true; storeSaves(a); }      // (chapter 2, part 1 is finished: its last scene has reached the card)

// ---------------------------------------------------------------- v1.96 THE PORTAL IS THE GOAL: the fight is not won by knocking Verity out but by getting INTO the portal
// The street is a corridor: its left end 120 px behind you, the portal 850 px ahead (v1.103: it was 330), Verity in between. He is a wall (you cannot walk through him; a forward DASH slides you past his back, and a dash needs 1.4 s to come back; fill his stagger bar until he is OPEN and you walk through him too), he cannot be knocked out for good (at no health he folds into his ball for 4 s, the free run, and comes back with 40%; v1.103: there is no ball at half health any more), and when you are past him, or near the portal with him not in your face, his STOP comes: he blinks out (0.22 s), blinks in where you will be (0.22 s), waits (0.2 to 0.6 s at most, never the same twice) and strikes. Four kinds, and the colour of the ring on the floor says which one it is: the ARM (purple: it shoots out in 0.25 s; the guard, a jump, a crouch or a dash gets out of it), the RED arm (red: the same arm, but nothing blocks it), the LOW sweep (teal: he folds up and his claw swings along the floor; a crouch does not save you, a jump, a dash or the guard does) and the RED LOW sweep (orange: nothing blocks it and a crouch does not help: only a jump or a dash). A blocked blow still chips a tenth of its damage. Hit him at any time while he is at it and the move is broken.
// v1.103 THE PORTAL FIGHTS BACK: the street is cut in three zones (C3_LV): the further you get, the sooner the next STOP comes, the harder it pushes and hurts, the longer he may wait before he strikes, and the more of them are RED, LOW or both. In the last 220 px the portal's wind blows you back (up to 24 px a second at the door: a crouch or a guard is too slow to get in, a dash is not).
const C3_ARM = 49 + CMOVE.length;      // the STOP's blows have hit numbers of their own, so gojoHit (damage, guard, dash, jump and crouch rules) deals with them like with every other blow: the ARM, the RED arm (nb: nothing blocks it), the LOW sweep (a kick for KICKS: a crouch does not save you) and the RED LOW sweep (both); c3Blow sets the damage and the push from the zone before every blow, the numbers here are only a start
CMOVE.push({ k: C3_ARM, nb: false, heavy: false }); REACH.push(40); KNOCK.push(0); KNOCK_G.push(470); DMG.push(14);
const C3_RED = 49 + CMOVE.length; CMOVE.push({ k: C3_RED, nb: true, heavy: false }); REACH.push(40); KNOCK.push(0); KNOCK_G.push(470); DMG.push(14);
const C3_LOW = 49 + CMOVE.length; CMOVE.push({ k: C3_LOW, nb: false, heavy: false }); REACH.push(30); KNOCK.push(0); KNOCK_G.push(470); DMG.push(14);
const C3_RL = 49 + CMOVE.length; CMOVE.push({ k: C3_RL, nb: true, heavy: false }); REACH.push(30); KNOCK.push(0); KNOCK_G.push(470); DMG.push(14); KICKS.verity = [C3_LOW, C3_RL];      // (the RED LOW sweep: both at once)
const C3W = { L: -120, PX: 850, door: 12, sep: 22, dashCd: 2600, wind: 24, windFrom: 220, chip: 0.1 };      // the left end of the street and the portal's place (world pixels; you start on 0), how close to its middle you must be to go in, how far apart two bodies stand (measured when the fight begins), how long a dash needs from its start to come back (v1.103: 2.6 s, it was 1.4), how hard the portal's wind blows at the door and from how far away it reaches, and what share of a blocked blow's damage still hurts (a tenth)
const C3_LV = [      // the three zones of the street (a third each): the wait for the next STOP (ms; 0.8 of it in the last 100 px), the push (px) and the damage of its blows (100 px and 26, 125 and 36, 150 and 48), the longest wait before he strikes (ms, random: a jump or a dash is safe for 0.3 s, so the longer the wait the more of a gamble the timing is), the chances of a RED, a LOW and a RED LOW one (the rest are the plain arm)
  { cd: 2100, push: 100, dmg: 26, wait: 200, red: 0, low: 0, rl: 0 },
  { cd: 1700, push: 125, dmg: 36, wait: 350, red: 0.25, low: 0.2, rl: 0 },
  { cd: 1450, push: 150, dmg: 48, wait: 600, red: 0.25, low: 0.25, rl: 0.2 }];
const C3_RGB = { hi: '200,144,255', red: '255,90,74', low: '90,216,255', rl: '255,176,42' }, C3_HEX = { hi: '#c890ff', red: '#ff5a4a', low: '#5ad8ff', rl: '#ffb02a' };      // the colour of the ring on the floor and of the "!" for each kind of STOP
let c3s = null;      // the fight's own state: { t0, stopReady, cd (the wait of the last STOP), seen (since when the STOP is wanted), warnAt, warnN, to (where he will stand), kind (of the last STOP: hi, red, low or rl), kinds (the last four), tell (how many of each kind have come), hintOn (the last one says what to do), fwd (when a forward dash last ran), dgLast (the start of the dash that is running), slide (+1 = you slide past his back), pushing (ms you have pressed against him), hintUntil, hintCool, down (when he last folded into the ball), talkAt (when he said NOBODY ENTERS!), seenP (the portal has been on the screen), windSeen, windAt (when the portal's wind first reached you), crSince (since when you have been crouched), sweepAt (the next low claw for a crouched fighter), lastAt and lastKind (the last blow of a STOP that reached you: when, and which kind) }
const c3Reach = () => Math.max(34, -c3VT('scare_grab', 10) + 2);      // how far from his middle the hand is when the arm is out (read from the picture)
const c3ReachLow = () => Math.max(26, -c3VT('c0', 9) + 2);      // the same for the claw of the low sweep
const c3Lv = () => C3_LV[Math.min(2, Math.floor(clamp01(wx / C3W.PX) * 3))];      // the zone you are in
function c3Blow(k, lv) { DMG[k] = Math.round(lv.dmg * (k === C3_RED || k === C3_RL ? 1.25 : 1) / GRADES[vs.gi].dmg); KNOCK_G[k] = Math.round(lv.push * 7 / 0.9); }      // (the damage you will take after the grade's factor, and the push: a hit pushes KNOCK_G x 0.9 / 7 px)
function c3Begin(now) {      // a fight begins (also a rematch): the width of the two bodies is measured, the first STOP is ready as soon as the intro is over
  C3W.sep = hbPush('yuji', 5) + hbPush('verity', 6);
  c3s = { t0: now, stopReady: now + INTRO_MS, cd: C3_LV[0].cd, seen: 0, warnAt: -1e9, warnN: 0, to: 0, kind: 'hi', kinds: [], tell: {}, hintOn: false, lastAt: -1e9, lastKind: '', fwd: -1e9, dgLast: -1, slide: 0, pushing: 0, hintUntil: 0, hintCool: 0, down: -1e9, talkAt: -1e9, seenP: false, windSeen: false, windAt: -1e9 };
}
function c3Block(now, dt) {      // every frame after the movements: the street's ends, the portal's wind, Verity as a wall, and the portal's mouth
  const c = c3s, d = dummy; if (!c || !d || !vs || vs.ph !== 'fight') return;
  const P = C3W.PX, sep = C3W.sep;
  if (d.ko < 0) { if (d.x > P - 26 && d.vx > 0 || d.x < C3W.L - 24 && d.vx < 0) d.vx = 0; d.x = Math.max(C3W.L - 24, Math.min(P - 26, d.x)); }      // (Verity can not go into his portal, nor out of the street: a blow that throws him at the end of it leaves him standing against it)
  if (d.vform && d.vform !== 'verity') c.stopReady = Math.max(c.stopReady, now + 1200);      // (as a ball he does not STOP anybody, and when he is back his STOP needs 1.2 s)
  wx = Math.max(C3W.L, Math.min(P, wx));
  const wk = clamp01(1 - (P - wx) / C3W.windFrom); if (wk > 0 && hurtAt < 0 && dgAt < 0 && !c.slide) { if (!c.windSeen) { c.windSeen = true; c.windAt = now; } wx = Math.max(C3W.L, wx - C3W.wind * wk * dt); }      // (the portal's wind blows you back, up to 24 px a second at the door; a dash, a slide and a hit are not slowed by it)
  if (dgAt >= 0 && dgK === 0) c.fwd = now;
  if (dgAt >= 0) c.dgLast = dgAt; else if (c.dgLast >= 0) { dgLock = dgReady = Math.max(dgReady, c.dgLast + C3W.dashCd); c.dgLast = -1; }      // (a dash needs 2.6 s from its start to come back (C3W.dashCd), and the DASH button counts it down: it is spent on getting past him or on the arm, not on both)
  const gap = d.x - wx, wall = d.ko < 0 && (!d.vform || d.vform === 'verity') && now >= (d.openUntil || 0) && now >= d.stunUntil && dgAt < 0 && !dash && teleAt < 0 && hurtAt < 0, stopOn = !!d.vact && d.vact.type === 'stop' && d.vact.moved;      // (he is a wall unless he is down, a ball, OPEN or stunned, or you are dashing, blinking or reeling; while his STOP is on, with him standing in front of you, he is solid even for a dash: you cannot slip through the blow, only the dash's own dodge time can save you)
  if (stopOn && d.ko < 0 && gap > 0 && wx > d.x - sep) { wx = d.x - sep; c.slide = 0; }
  if (c.slide) { const to = d.x + c.slide * sep; wx += (to - wx) * Math.min(1, dt * 20); if (Math.abs(to - wx) < 1) { wx = to; c.slide = 0; } }      // (a forward dash that ended inside him: you slide on, out of his back)
  else if (wall && Math.abs(gap) < sep) { if (now - c.fwd < 50 && gap > -sep + 1 && !stopOn) c.slide = 1; else { const to = gap >= 0 ? d.x - sep : d.x + sep; wx += (to - wx) * (Math.abs(to - wx) <= 3 ? 1 : Math.min(1, dt * 24)); } }
  c.pushing = wall && gap > 0 && gap < sep + 4 && (keyR || padR) ? c.pushing + dt * 1000 : Math.max(0, c.pushing - dt * 2000);
  if (c.pushing > 700 && now >= c.hintCool) { c.hintUntil = now + 3200; c.hintCool = now + 14000; }
  if (wx >= P - C3W.door && hurtAt < 0 && now >= gDownUntil) c3Enter(now);
}
function c3Enter(now) {      // you are in the portal's mouth: the fight is won (no K.O. banner, no result screen: the ending starts at once)
  vs.ph = 'over'; vs.pw = 1; vs.res = { win: true, stars: 3 }; earnOnce('s4', 400); story.toC3End = true;
}
function c3Fall(now) {      // his health runs out: he does not fall for good, he folds into his ball (6.45 s in which nothing hurts him; v1.103: 4 s, see storyBattleTick) and comes back with 40%; the way to the portal is free
  const d = dummy, c = c3s; if (d.vform && d.vform !== 'verity') return;      // (he is a ball already)
  d.vform = 'smoke1'; d.vAt = now; d.bAt = now + 200; d.bSnd = false; d.lock = d.hp = d.shown = Math.round(d.max * 0.4); d.vact = null; d.fear = null; d.bleed = null; d.ai = 'rest'; d.vx = 0; d.stunUntil = 0; d.openUntil = 0; d.stg = 0;
  if (c) c.down = now;
  snd('vanish'); hitStop(90); shakeUntil = now + 220; shakeAmp = 3; flash(now, 120, 0.3);
}
function c3Pick(lv) {      // which STOP it will be: the arm, the RED arm, the LOW sweep or the RED LOW sweep (the same special one never comes three times in a row)
  const r = Math.random(), h = c3s.kinds, n = h.length; let k = r < lv.red ? 'red' : r < lv.red + lv.low ? 'low' : r < lv.red + lv.low + lv.rl ? 'rl' : 'hi';
  if (k !== 'hi' && n >= 2 && h[n - 1] === k && h[n - 2] === k) k = 'hi';
  return k;
}
function c3StopCheck(d, now) {      // is it time for the STOP? He is free (no move of his own, no flinch), the STOP is ready, and you are past him or near the portal with him not in your face for a moment
  const c = c3s, P = C3W.PX; if (!c || vs.ph !== 'fight' || d.vact || now < c.stopReady || !(d.ai === 'think' || d.ai === 'walk' || d.ai === 'rest') || now - d.rxAt < RX_DUR[d.rx]) { if (c) c.seen = 0; return false; }
  const gap = d.x - wx, left = P - wx, want = !(gap > -6 && gap < 56) && (gap <= -6 || left < 150) && left > 34 && hurtAt < 0 && now >= gDownUntil;
  if (!want) { c.seen = 0; return false; } if (!c.seen) c.seen = now; if (now - c.seen < 150) return false;
  const lv = c3Lv(), kind = c3Pick(lv), w = Math.round(Math.random() * lv.wait), lo = kind === 'low' || kind === 'rl', sp = Math.max(0, FWD_SPEED * (stance === 'stand' ? 1 : 0.6) * (blkAt >= 0 ? 0.3 : 1) - C3W.wind * clamp01(1 - left / C3W.windFrom));
  const xp = dgAt >= 0 ? dgTo : wx + ((keyR || padR) ? sp : 0) * ((lo ? 0.8 : 0.69) + w / 1000), to = Math.min(xp + (lo ? 22 : 21), P - 22); if (to - wx < 20) return false;      // (he reads the way you are heading and blinks in where you will be when the blow lands, 21 px ahead of that place, and then slides at you: so a runner is hit, and so is one who stops or backs away; he is solid, so a dash does not take you through him, only the dash's own dodge time can save you)
  d.vact = { type: 'stop', at: now, hit: 0, anim: 'tele', fi: 0, to, moved: false, swung: false, kind, w, lv }; d.ai = 'rest'; d.aiAt = now; d.restFor = 99999;
  c.tell[kind] = (c.tell[kind] || 0) + 1; c.hintOn = kind === 'hi' ? c.tell.hi <= 2 : c.tell[kind] === 1; c.kind = kind; c.kinds.push(kind); if (c.kinds.length > 4) c.kinds.shift();      // (the first two plain arms, the first RED one and the first LOW one say what to do)
  c.warnAt = now; c.warnN++; c.to = to; c.cd = Math.round(lv.cd * (left < 100 ? 0.8 : 1)); c.stopReady = now + c.cd; c.seen = 0; snd('c3warn', kind === 'red' ? 1 : kind === 'low' ? 2 : kind === 'rl' ? 3 : 0); return true;
}
function c3Strike(d, a, now, reach) {      // his blow lands, if he stands in front of you and the tip reaches (gojoHit says whether the guard, a jump, a crouch or a dash saves you)
  const k = a.kind === 'red' ? C3_RED : a.kind === 'low' ? C3_LOW : a.kind === 'rl' ? C3_RL : C3_ARM;
  if (d.x - wx > -4 && Math.abs(d.x - wx) - 8 <= reach) {
    const gu = guardUp(now) && stance === 'stand'; c3Blow(k, a.lv); c3s.lastAt = now; c3s.lastKind = a.kind; const h = hurtAt; gojoHit(k, now);
    if (hurtAt !== h) { say(gu && (a.kind === 'red' || a.kind === 'rl') ? 'GUARD BREAK' : 'STOPPED!', wx, C3_HEX[a.kind], 8, now + 90); puff(wx, 4); }
  } else say('MISS', wx, '#9fd8ff', 8, now);
}
function c3Chip(k, now) {      // a blocked blow of the STOP still hurts a little: a tenth (C3W.chip) of what it would have done (called by gojoHit when the guard takes it)
  if ((k !== C3_ARM && k !== C3_LOW) || !vs || vs.ph !== 'fight') return;
  const dm = Math.max(1, Math.round(DMG[k] * GRADES[vs.gi].dmg * C3W.chip)); say('' + dm, wx, '#ff9a5a', 8, now + 60); vsHurt(dm, now);
}
function c3Tip() {      // the line under DEFEAT: what the STOP that took your last health wanted from you (the colour of its ring), or what to do about his fists
  const c = c3s, k = c && Math.abs(vs.hitAt - c.lastAt) < 50 ? c.lastKind : '';
  return k === 'hi' ? 'PURPLE RING: BLOCK IT, DUCK OR JUMP' : k === 'red' ? 'RED RING: A GUARD DOES NOT HELP, DUCK OR JUMP' : k === 'low' ? 'TEAL RING: DUCKING DOES NOT HELP, BLOCK OR JUMP' : k === 'rl' ? 'ORANGE RING: ONLY A WELL TIMED JUMP OR DASH' : 'HIT HIM WHEN HE RESTS, GUARD HIS FISTS, DASH PAST HIM';
}
function c3StopEnd(d, now) { const a = d.vact; if (c3s && c3s.warnN === 1 && !(a && a.reflex)) c3s.talkAt = now; vEnd(d, now); d.ai = 'rest'; d.aiAt = now; d.restFor = 600 + Math.random() * 300; }      // (the first time he has said his line: NOBODY ENTERS!, see c3Hud; and he rests for 0.6 to 0.9 s after every blow, the moment to hit him back)
function c3Reflex(d, now) {      // a fighter who stays crouched in front of him (for 0.35 s) is not safe (all his punches pass over a crouch): he folds up and swings his low claw at him, the LOW sweep without the blink, at most once every 1.6 s
  const c = c3s; if (!c || vs.ph !== 'fight') return false;
  if (stance === 'stand') c.crSince = 0; else if (!c.crSince) c.crSince = now;      // (since when you have been down)
  if (d.vact || now < (c.sweepAt || 0) || !(d.ai === 'think' || d.ai === 'walk' || d.ai === 'rest') || now - d.rxAt < RX_DUR[d.rx] || !c.crSince || now - c.crSince < 350 || d.x < wx || d.x - wx > c3ReachLow() + 8) return false;
  c.sweepAt = now + 1600; d.vact = { type: 'stop', at: now, hit: 0, anim: 'crouch', fi: 0, to: d.x, moved: true, swung: false, kind: 'low', w: 0, lv: c3Lv(), reflex: true }; d.ai = 'rest'; d.aiAt = now; d.restFor = 99999; return true;
}
function c3StopTick(d, a, t, now, dt) {      // the STOP: blink out and in (0.44 s), he waits (a.w: 0 to 0.6 s), then the blow: the arm shoots out (0.25 s) or, for the LOW sweep, he folds up (0.15 s) and his claw swings along the floor (0.5 s, the blow on picture 6); the arm hangs out (0.2 s) and draws back (0.45 s) / he rises (0.35 s); a hit on him ends it (see vActTick). While the blow comes he slides at you (220 px a second for the arm, 150 for the sweep, never closer than 25 px), so stopping or backing away does not get you out of it
  const slide = v => { const g = d.x - wx; if (g > 25) d.x -= Math.min(v * dt, g - 25); };
  if (a.reflex) t += 440;      // (the low claw for a crouched fighter has no blink: it starts where the blink ends)
  if (t < 440) {
    a.anim = 'tele'; a.fi = t / 440 * 14.99;
    if (!a.moved && t >= 220) { a.moved = true; const sc = a.kind === 'red' ? ['#ff8a7a', '#ff3a2a', '#ffffff'] : a.kind === 'low' ? ['#8aeaff', '#2aa8ff', '#ffffff'] : a.kind === 'rl' ? ['#ffd070', '#ff8a1a', '#ffffff'] : ['#c890ff', '#7a3aff', '#ffffff']; spark(d.x, gy - 30, 8, sc, false, 1); d.x = a.to; d.vx = 0; snd('blink'); spark(d.x, gy - 30, 8, sc, false, -1); }
    return;
  }
  const u = t - 440 - a.w;      // (the time since his wait was over: it is random, so the blow cannot be timed by counting)
  if (u < 0) { a.anim = 'tele'; a.fi = 14.99; return; }
  if (a.kind === 'low' || a.kind === 'rl') {
    if (u < 150) { a.anim = 'crouch'; a.fi = u / 150 * 14.99; slide(150); return; }
    const s = u - 150;
    if (s < 500) { a.anim = 'c0'; a.fi = s / 500 * 14.99; if (!a.hit) slide(150); if (!a.swung) { a.swung = true; snd('f:swing', 3); } if (!a.hit && a.fi >= 6) { a.hit = 1; snd('f:hit', 3); shakeUntil = now + 90; shakeAmp = 1; c3Strike(d, a, now, c3ReachLow()); } return; }
    if (s < 850) { a.anim = 'crouch'; a.fi = 14.99 - (s - 500) / 350 * 14.99; return; }
    c3StopEnd(d, now); return;
  }
  if (u < 250) { a.anim = 'scare_grab'; a.fi = 4 + u / 250 * 6; slide(220); if (!a.swung) { a.swung = true; snd('f:swing', 3); } return; }
  if (!a.hit) { a.hit = 1; snd('f:hit', 3); shakeUntil = now + 90; shakeAmp = 1; c3Strike(d, a, now, c3Reach()); }
  a.anim = 'scare_grab'; if (u < 450) a.fi = 10 + (u - 250) / 200 * 2; else if (u < 900) a.fi = 12 - (u - 450) / 450 * 12; else c3StopEnd(d, now);
}

// ---- the picture: the portal in the street, the aim in the HUD
function c3Crate(x, y, w, h) { ctx.fillStyle = '#2a1d14'; ctx.fillRect(x, y, w, h); ctx.fillStyle = '#5f4531'; ctx.fillRect(x + 1, y + 1, w - 2, h - 2); ctx.fillStyle = '#7a5a40'; ctx.fillRect(x + 1, y + 1, w - 2, 1); ctx.fillStyle = '#4a3425'; for (let i = 1; i < 3; i++) ctx.fillRect(x + 1, y + Math.round(i * h / 3), w - 2, 1); ctx.fillStyle = '#34261b'; for (let i = 0; i < Math.min(w, h) - 4; i++) ctx.fillRect(x + 2 + i, y + 2 + i, 1, 1); }      // (a wooden crate: dark outline, planks, a lit top edge, a brace)
function c3World(now) {      // behind the fighters: the end of the street (a stack of crates), the portal (when it is on the screen), a purple edge when it is not, the dark violet that grows as it comes near, and its wind (as many streaks as it blows hard)
  if (!c3s) return; const P = C3W.PX, sx = Math.round(VW / 2 + P - wx), bx = Math.round(VW / 2 + C3W.L - wx), k = clamp01(1 - (P - wx) / 260), wk = clamp01(1 - (P - wx) / C3W.windFrom);
  if (bx > -50 && bx < VW + 20) { c3Crate(bx - 44, gy - 17, 18, 18); c3Crate(bx - 26, gy - 17, 18, 18); c3Crate(bx - 35, gy - 34, 18, 17); }
  if (!c3s.seenP && sx < VW + 10) { c3s.seenP = true; snd('rumble', 1.8); }      // (the first time the portal comes into the picture)
  if (sx > -40 && sx < VW + 40) rsPortal(sx, 1, now / 1000);
  else if (sx >= VW + 40) { const g = ctx.createLinearGradient(VW - 46, 0, VW, 0); g.addColorStop(0, 'rgba(110,40,190,0)'); g.addColorStop(1, 'rgba(150,60,220,' + (0.12 + 0.3 * k).toFixed(3) + ')'); ctx.fillStyle = g; ctx.fillRect(VW - 46, 0, 46, VH); }
  ctx.fillStyle = 'rgba(30,10,60,' + (0.04 + 0.12 * k).toFixed(3) + ')'; ctx.fillRect(0, 0, VW, VH); rsWindBits(now / 1000, 0.1 + 0.9 * wk, 0, VW);
}
function c3Hud(now, W) {      // the aim: a bar along the bottom with the portal at its end, you and Verity on it; what to do now; the STOP's warning (a ring where he will stand, in the colour of its kind, and a "!" over you); the sign over Verity's head that says when the STOP is ready
  const c = c3s, d = dummy; if (!c || !d || !vs || (vs.ph !== 'fight' && vs.ph !== 'intro')) return;
  const mx = Math.round(W / 2), sx = x => Math.round(mx + x - wx), by = gy + 9, x0 = mx - 48, fx = v => x0 + Math.round(clamp01((v - C3W.L) / (C3W.PX - C3W.L)) * 96), ball = !!d.vform && d.vform !== 'verity';
  ctx.save();
  ctx.fillStyle = 'rgba(0,0,0,0.6)'; ctx.fillRect(x0 - 2, by - 2, 100, 5); ctx.fillStyle = '#4a3a8a'; ctx.fillRect(x0, by, 96, 1); ctx.fillStyle = '#b056ff'; ctx.fillRect(x0 + 97, by - 4, 3, 9); ctx.fillStyle = '#e6c8ff'; ctx.fillRect(x0 + 98, by - 3, 1, 7);      // (the way, the portal)
  ctx.fillStyle = '#f0d84a'; ctx.fillRect(fx(d.x) - 1, by - 1, 3, 3); ctx.fillStyle = '#ff9a5a'; ctx.fillRect(fx(wx) - 1, by - 2, 3, 5);
  let msg = '', col = '#e6c8ff'; const nar = W < 215, wn = now - c.warnAt, kd = c.kind;      // (a narrow screen: the middle between the touch controls is only about 100 px wide, so the words are shorter)
  if (ball && now - c.down < 4200) { msg = nar ? 'RUN FOR IT!' : 'RUN! GET IN THE PORTAL!'; col = ((now / 160) | 0) % 2 ? '#ffffff' : '#ffb070'; } else if (c.hintOn && wn >= 0 && wn < 1300) { msg = kd === 'red' ? (nar ? 'NO BLOCKING!' : 'RED: NO BLOCKING!') : kd === 'low' ? (nar ? 'JUMP OR DASH!' : 'LOW: JUMP OR DASH!') : kd === 'rl' ? (nar ? 'ONLY JUMP!' : 'NO BLOCK, NO DUCK!') : (nar ? 'JUMP OR DUCK!' : 'BLOCK, JUMP OR DUCK!'); col = C3_HEX[kd]; } else if (now - c.talkAt < 1700) { msg = 'NOBODY ENTERS!'; col = '#f0d84a'; } else if (now < c.hintUntil) { msg = 'DASH PAST HIM!'; col = '#ffd34d'; } else if (now - c.windAt < 2400) msg = nar ? 'IT PUSHES BACK!' : 'THE PORTAL PUSHES BACK!'; else if (now - c.t0 < 8000) msg = nar ? 'TO THE PORTAL!' : 'GET INTO THE PORTAL!';
  if (msg && vs.ph !== 'ko') pxt(msg, mx, gy + 22, col, 8, 'center');
  if (!nar) pxt(Math.max(0, Math.round((C3W.PX - wx) / 10)) + 'M', x0 + 104, by + 4, '#e6c8ff', 8);      // (how far the portal is: 10 px = 1 M; the touch controls cover the edges of the screen, so it stands by the bar)
  if (vs.ph === 'fight' && d.ko < 0 && !ball) { const vx = sx(d.x), vy = gy - 62, left = c.stopReady - now; if (left <= 0) { ctx.fillStyle = 'rgba(200,144,255,' + (0.55 + 0.45 * Math.sin(now / 90)).toFixed(2) + ')'; ctx.fillRect(vx - 1, vy - 2, 3, 5); ctx.fillRect(vx - 2, vy - 1, 5, 3); ctx.fillStyle = '#ffffff'; ctx.fillRect(vx, vy, 1, 1); } else { ctx.fillStyle = 'rgba(0,0,0,0.6)'; ctx.fillRect(vx - 7, vy - 1, 14, 4); ctx.fillStyle = '#3a2a66'; ctx.fillRect(vx - 6, vy, 12, 2); ctx.fillStyle = '#b056ff'; ctx.fillRect(vx - 6, vy, Math.round(12 * (1 - clamp01(left / c.cd))), 2); } }      // (the sign over his head)
  const wk = (now - c.warnAt) / 440;
  if (wk >= 0 && wk < 1.1) { const s = 1 - clamp01(wk) * 0.6; ctx.strokeStyle = 'rgba(' + C3_RGB[kd] + ',' + (0.9 - 0.3 * clamp01(wk)).toFixed(2) + ')'; ctx.lineWidth = 1; ctx.beginPath(); ctx.ellipse(sx(c.to), gy + 3, 18 * s + 3, 4 * s + 1, 0, 0, 6.2832); ctx.stroke(); if (wk < 0.95 && ((now / 70) | 0) % 2 === 0) pxt('!', mx, gy - 66, C3_HEX[kd], 16, 'center'); }
  ctx.restore();
}
window.__c3 = () => c3s && ({ s: c3s, W: C3W, now: pnow(), wx, dx: dummy && dummy.x, vform: dummy && dummy.vform, vact: dummy && dummy.vact && dummy.vact.type, kind: dummy && dummy.vact && dummy.vact.kind, ph: vs && vs.ph, reach: c3Reach(), hp: dummy && dummy.hp });      // test hook
window.__c3Set = o => { if (o.s) Object.assign(c3s, o.s); if (o.wx !== undefined) wx = o.wx; if (o.dx !== undefined && dummy) dummy.x = o.dx; };
