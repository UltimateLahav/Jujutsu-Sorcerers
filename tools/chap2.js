// ---------------------------------------------------------------- v1.95 CHAPTER 2: THE PORTAL, the opening (this file is spliced into template.html by build_html.py, in place of the marker line after the custom mode's)
// After END OF CHAPTER 1 (the Master took Gojo through his portal): night, the alley where it all began. The same dark portal opens at the end of it. Yuji cries out and charges for it, Verity blinks in and stops him with his long arm (his real JUMPSCARE grab picture), says "HEY, IT'S ME, IT'S VERITY" in his real voice, and they throw hands: seven blows, Yuji's and Verity's by turns (the pictures are the fighters' own: Yuji's R.HOOK, L.HOOK, UPPERCUT and R.KICK, Verity's three swings, each hit with its own reaction), and the last two meet in the middle (Yuji's CONCENTRATED FIST against Verity's long arm): equal. Then the fight is yours: you are Yuji with the moves of the training (TN_KIT) against Verity (GRADE 2). When Verity falls the portal collapses just before Yuji reaches it: TO BE CONTINUED.
// Every actor is a pure function of the scene time T, so a tap that skips to the next cut (or a test that jumps in time) always draws the right picture.
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
const C3E = { talk: 1.2, charge: 3.4, close: 3.9, kneel: 4.6, say: 5.3, fade: 7.3, card: 8.2 };      // the times of the ending (seconds)
const C3E_CUTS = [C3E.talk, C3E.charge, C3E.say, C3E.fade, C3E.card];

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
function c3Ring(x, y, a, big, col) {      // a blow lands: rings run out from the point of contact and a white star flashes (a = seconds since contact)
  if (a < 0 || a > 0.4) return; const f = 1 - a / 0.4; ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.lineWidth = 1;
  for (let i = 0; i < 2; i++) { ctx.strokeStyle = 'rgba(' + col + ',' + (0.8 * f * (1 - i * 0.35)).toFixed(3) + ')'; ctx.beginPath(); ctx.arc(x, y, 3 + a * (big ? 80 : 40) + i * 5, 0, 6.2832); ctx.stroke(); }
  if (a < 0.12) { ctx.fillStyle = '#fff'; ctx.fillRect(x - 3, y, 7, 1); ctx.fillRect(x, y - 3, 1, 7); ctx.fillRect(x - 1, y - 1, 3, 3); }
  ctx.restore();
}
function c3Talk(T) {      // the speech box of the line that is on now; the letters come out 20 a second, each with a blip of its speaker's voice (Verity's first line is his real voice instead)
  const i = C3_TALK.findIndex(s => T >= s.t && T < s.t + s.d); if (i < 0) return; const s = C3_TALK[i], n = Math.floor((T - s.t) * TN_RATE), sp = s.a + s.b, c = story.c3;
  if (c.vi !== i) { c.vi = i; c.vc = 0; } while (c.vc < Math.min(n, sp.length)) { c.vc++; if (sp[c.vc - 1] !== ' ' && !s.voice) snd('tvoice', s.w === 'YUJI' ? 1 : 0); } tnDlg(s.w, s.a, s.b, n);
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

// ---- the ending (after Verity falls): the portal is still open, Verity fades away, Yuji runs for it, it collapses just before he gets there; the card
function c3EndFrame(now, dt) {
  const T = story.T = Math.max(0, now - story.t0) / 1000, G = c3Geo(), cx = Math.round(VW / 2), sx = x => Math.round(cx + x), ev = (k, t, f, win) => { if (T >= t && T < t + (win || 0.5)) once2(k, f); };
  if (T >= C3E.card) { c3Card(now, T); return; }
  wx = 0; ctx.save(); ctx.imageSmoothingEnabled = false; ctx.fillStyle = '#000'; ctx.fillRect(0, 0, VW, VH);
  const sk = story.shk && now < story.shk.until ? story.shk.amp : 0; ctx.save(); if (sk) ctx.translate(Math.round((Math.random() * 2 - 1) * sk), Math.round((Math.random() * 2 - 1) * sk));
  drawAlley(now); const pp = 1 - ease3((T - C3E.close) / 0.7);
  if (pp > 0) { rsPortal(sx(G.PX), pp, T); ctx.fillStyle = 'rgba(30,10,60,' + (0.16 * pp).toFixed(3) + ')'; ctx.fillRect(0, 0, VW, VH); }
  const vk = clamp01((T - 0.8) / 1.6);      // Verity lies where he fell and fades away (flickering white at first)
  if (vk < 1) { const src = vrx(4, 13), I = VRXIN[4]; ctx.globalAlpha = 1 - vk; sprAt(vk < 0.25 && ((T * 14) | 0) % 2 ? whiteOf(src) : src, I, sx(G.Vh), 0, true, 0); ctx.globalAlpha = 1; }
  let yx = 0, p, run = 0;
  if (T < C3E.charge) p = tnPick({ now: T * 1000 * 2 }); else if (T < C3E.kneel) { const u = clamp01((T - C3E.charge) / (C3E.kneel - C3E.charge)); yx = lerp(0, G.PX - 34, 1 - Math.pow(1 - u, 1.5)); run = 1; } else p = yujiPick({ hurting: true, hurtK: 9, hurtAt: 0, now: 330 });
  if (run) rsYuji(sx(yx), 0, 'dash', T, { fps: 36, wind: 0.5 }); else { yx = T < C3E.charge ? 0 : G.PX - 34; shadow(sx(yx), 9); sprAt(p.set[p.fi], p.info, sx(yx), p.lift + (T < C3E.charge ? Math.round(Math.abs(Math.sin(T * 9)) * 1.2) : 0), false, 0); }
  ev('vanish', 0.9, () => snd('vanish')); ev('go', C3E.charge, () => snd('dash', 0)); { const s = Math.floor((T - C3E.charge) / 0.17); if (T >= C3E.charge && T < C3E.kneel && s !== story.c3.rs) { story.c3.rs = s; snd('yrun', 0); } }
  ev('close', C3E.close, () => snd('portalclose'), 1.0); ev('end', C3E.kneel, () => { c2Shake(now, 300, 3); snd('land', 1); puff(G.PX - 34, 8); });
  drawSmoke(now, dt); ctx.restore(); rsWindBits(T, 0.3 * Math.max(0, pp), 0, VW);
  const L = T >= C3E.say - 0.01 && T < C3E.say + 1.9 ? { w: 'YUJI', a: 'NO... NOT AGAIN.', b: '', t: C3E.say } : T >= C3E.talk && T < C3E.talk + 2.0 ? { w: 'YUJI', a: 'SENSEI... I AM COMING!', b: '', t: C3E.talk } : null;
  if (L) { const n = Math.floor((T - L.t) * TN_RATE), c = story.c3, i = L.t === C3E.talk ? 0 : 1; if (c.vi !== i) { c.vi = i; c.vc = 0; } while (c.vc < Math.min(n, L.a.length)) { c.vc++; if (L.a[c.vc - 1] !== ' ') snd('tvoice', 1); } tnDlg(L.w, L.a, L.b, n); }
  const fa = T < 0.6 ? 1 - T / 0.6 : T > C3E.fade ? clamp01((T - C3E.fade) / 0.8) : 0; if (fa > 0) { ctx.fillStyle = 'rgba(0,0,0,' + fa.toFixed(3) + ')'; ctx.fillRect(0, 0, VW, VH); }
  ctx.restore();
}
function c3Card(now, T) {      // CHAPTER 2: THE PORTAL, TO BE CONTINUED
  const t = T - C3E.card; ctx.save(); ctx.imageSmoothingEnabled = false; ctx.fillStyle = '#000'; ctx.fillRect(0, 0, VW, VH); once2('card', () => { snd('msting'); storyDone5(); }); ctx.globalAlpha = clamp01((t + 0.1) / 1.0);
  pxt('CHAPTER 2', VW / 2, Math.round(VH / 2) - 10, '#ffffff', 16, 'center'); pxt('THE PORTAL', VW / 2, Math.round(VH / 2) + 8, '#c9a8ff', 8, 'center'); pxt('TO BE CONTINUED', VW / 2, Math.round(VH / 2) + 26, '#ffd34d', 8, 'center'); if (t > 2.2 && Math.floor(now / 600) % 2 === 0) pxt('TAP TO CONTINUE', VW / 2, VH - 8, '#9d8cff', 8, 'center'); ctx.globalAlpha = 1; ctx.restore();
}

// ---- the chapter: start, frame, taps, the fight, the ending
function startC3(slot) { audio(); show('story'); voiceLoad(); story = { slot, t0: pnow(), battle: false, T: 0, ev: {}, shk: null, c3: { end: false, vi: -1, vc: 0, rs: -1, dust: -1 } }; alley = true; court = false; track = false; wx = 0; }
function c3Frame0(now, dt) { if (story.c3.end) c3EndFrame(now, dt); else c3Frame(now, dt); }
function startC3Battle() { story.battle = true; alley = true; court = false; track = false; startMatch(2, 'c3', 0, 'verity'); }      // (a story fight against Verity with you as Yuji: see startMatch)
function startC3End(now) { show('story'); story.c3 = { end: true, vi: -1, vc: 0, rs: -1, dust: -1 }; story.battle = false; story.t0 = now; story.T = 0; story.ev = {}; story.shk = null; alley = true; court = false; track = false; wx = 0; }
function c3Skip() {      // a tap: on to the next cut; on the card (after its first 1.2 s) back to the saves
  const c = story.c3; if (c.end) { const T = story.T; if (T >= C3E.card + 1.2) { show('saves'); renderSaves(); return; } const n = C3E_CUTS.find(x => x > T + 0.05); if (n !== undefined) story.t0 = pnow() - n * 1000; return; }
  const n = C3_CUTS.find(x => x > story.T + 0.05); if (n !== undefined) story.t0 = pnow() - n * 1000;
}
function storyDone5() { if (!story) return; const a = loadSaves(); if (a[story.slot]) a[story.slot].c3 = true; storeSaves(a); }      // (chapter 2, part 1 is finished: its last scene has reached the card)
