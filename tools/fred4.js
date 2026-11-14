// ---------------------------------------------------------------- v1.188 FREDDY AS AN ENEMY (this file is spliced into template.html by build_html.py, after fred3.js; updateFighterVs, drawDummy and drawFoes in template.html call it). The user: "make freddy an enemy in versus and make his damage balanced". Until now Freddy could only be the fighter you play (the select screen said NOT AS ENEMY). He has his own brain here: it uses the grade table (GRADES) like every enemy's, and what he does to you goes through gojoHit like every other enemy's blow, so your guard, your dodge, your crouch, the damage of the grade and the M1 cap (v1.179) work on him as they do on the rest.
// 1. THE NUMBERS 92 - 95 of the game's tables (the curses' moves have 49 - 82, which is why his stretched punches are 90 and 91 and not 60 and 61 as they were in V1.185: those two numbers belong to two curse moves, whose damage and push the old numbers had overwritten) (ATK_FPS, ATK_SWING, ATK_IMPACT, DMG, KNOCK, KNOCK_G, REACH): the four things he throws or drives into you that are not a swing of his body: 92 = a hit of his boiling water, 93 = the pierce, 94 = a chunk of the road, 95 = a thrown piece of the room. The damage numbers are the ones he has when you play him (FRED_WATER, FRED_PIERCE, FG): the same Freddy on both sides.
const FRE_K = { water: 92, pierce: 93, stone: 94, obj: 95 };
[[FRE_K.water, FRED_WATER.dmg, 70], [FRE_K.pierce, FRED_PIERCE.dmg, 120], [FRE_K.stone, FG.dmg, 40], [FRE_K.obj, FG.objDmg, 40]].forEach(([k, dm, kn]) => { ATK_FPS[k] = Math.round(30 * PACE); ATK_SWING[k] = 1; ATK_IMPACT[k] = 1; DMG[k] = dm; KNOCK[k] = kn; KNOCK_G[k] = kn; REACH[k] = 60; });
KNOCK_G[FRED_FAR.k0] = 24; KNOCK_G[FRED_FAR.k0 + 1] = 34;      // (the stretched punches push you a little when HE throws them: they pushed nobody when you did, KNOCK_G is the push on the player)
const freOn = () => !!vs && vs.foe === 'freddy' && !vs.net && !vs.story && !!dummy && dummy.mode === 'fighter';      // is the enemy Freddy in charge of this fight? (not the Wi-Fi fight: there the other phone is)
// 2. HIS LOOK: the picture, its info and the offsets that drawDummy needs, for what the enemy Freddy is doing now (the same pictures you see when you play him)
function freBlockPic(now) {      // his standing block, the arm held out in front of him (made fresh by fredPose, which reads four numbers of the player's own scene: they are kept and put back, so a Freddy you play is not disturbed)
  const sv = [fredBlkExt, fredGrabAt, fredTx, fredTy]; fredBlkExt = 1; fredGrabAt = dummy.gbAt && now - dummy.gbAt < 700 ? now - 100 : -1e9; fredTx = 54; fredTy = 27;
  try { return fredPose(now, -1, true); } finally { [fredBlkExt, fredGrabAt, fredTx, fredTy] = sv; }
}
function freFoeLook(now, reacting, hitT, kt) {
  const d = dummy; let src, info = FRED_INFO, ox = 0, oy = 0, lift = 0;
  if (kt >= 0) src = fredF(0);      // (beaten: drawDummy draws his own K.O. pictures, fredK)
  else if (d.fa) { const L = freActLook(now); src = L.src; if (L.info) info = L.info; ox = L.ox || 0; oy = L.oy || 0; lift = L.lift || 0; }      // (a special of his is running)
  else if (d.airH > 0) src = fredH(3, 2);      // (thrown up by the UPPERCUT: he flies with the picture of the knock-down)
  else if (reacting) { const fi = Math.min(9, Math.floor((now - d.rxAt) * RX_FPS[d.rx] / 1000)); src = fredH(FRED_HF[d.rx % 10], fi); }
  else if (d.ai === 'attack') { const fi = Math.min(14, Math.floor((now - d.aiAt) * ATK_FPS[d.k] * (d.spd || 1) / 1000)); src = fredA(d.k, fi); if (d.k >= FRED_FAR.k0) info = { ...FRED_INFO, w: 128 }; }
  else if (d.ai === 'block' || d.ai === 'dodge') { src = freBlockPic(now); info = { ...FRED_INFO, w: 96 }; }
  else if (d.ai === 'walk') src = fredF(Math.floor(now * WALK_FPS / 1000), true);
  else src = fredF(Math.max(0, now - d.born) / (1000 / IDLE_FPS));
  if (vs.inv && src !== EMPTY && src.width) src = src === FRED_PC ? invNow(src) : invOf(src);      // (a mirror match: the enemy Freddy has the inverted colours, as the enemy Gojo, Yuji, Verity and Cat do)
  if (reacting && hitT < 70 && src !== EMPTY && src.width) src = whiteOf(src);
  return { src, info, lift, ox, oy };
}
// 3. HIS BRAIN. Called by updateFighterVs once the part every enemy shares is done (he is not stunned or reeling, he has read your swing and has dodged or blocked or not). He walks in, strikes and rests like the others; at the long distance he stretches his arm (the same blows 60 and 61 you throw when you play him); the specials come in part 4.
function freFoe(now, dt, gap, ag, toward, G) {
  const d = dummy;
  if (d.fa) { freAct(now, dt, gap, ag, toward, G); return; }      // (a special of his is running: boiling water, pierce, ground slam, the nightmare)
  const near = eMove(0) - 1, farR = eHit(FRED_FAR.k0) - 2;      // how far his slashes reach, how far the stretched punch does
  if (d.ai === 'attack') {      // a swing in progress: the whoosh, the blow, and maybe the next one of the chain
    const f = Math.floor((now - d.aiAt) * ATK_FPS[d.k] * G.spd / 1000);
    if (!d.swung && f >= ATK_SWING[d.k]) { d.swung = true; snd('f:swing', d.k); }
    if (!d.hitDone && f >= ATK_IMPACT[d.k]) { d.hitDone = true; snd('f:hit', d.k); hbE(d.k); if (ag <= eHit(d.k)) gojoHit(d.k, now); }
    if (f >= 15) {
      d.chain = (d.chain || 0) + 1; const far = d.k >= FRED_FAR.k0, nk = far ? (d.k === FRED_FAR.k0 ? FRED_FAR.k0 + 1 : FRED_FAR.k0) : (d.k + 1) % 2;
      if (d.chain < G.combo && Math.random() < 0.8 && (far ? ag > near + 6 && ag <= farR : ag <= eMove(nk) - 1) && !(G.smart >= 2 && atkAt >= 0 && gap > 0 && ag <= pMove(atkK) + 4)) { d.k = nk; d.aiAt = now; d.hitDone = false; d.swung = false; }      // (from Grade 2 up he does not keep chaining into a swing of yours: he drops the combo and defends)
      else { d.ai = 'rest'; d.aiAt = now; d.restFor = (430 + Math.random() * 600) / (0.45 + G.aggr * 0.9); }
    }
    return;
  }
  if (d.ai === 'rest') { if (now - d.aiAt > d.restFor && now - d.born > 900) d.ai = 'think'; else return; }
  if (freSpecialTry(now, gap, ag, G)) return;      // (he may start a special instead of a swing: part 4)
  // thinking: walk in (the smartest one stays just outside your longest move, where his stretched punch still reaches), and decide when to strike
  const want = G.smart >= 3 ? Math.min(farR - 4, Math.max(...[0, 1, 2, 3].map(pMove)) + 8) : near - 5; let move = 0;
  if (ag > want + 4) move = toward; else if (G.smart >= 3 && ag < want - 6 && ag > 20) move = -toward;
  const hold = G.smart >= 1 && atkAt >= 0 && gap > 0 && ag <= pMove(vs.seenK) + 4 && now < atkAt + pImpMs(vs.seenK) && !(vs.rolled && !vs.defended);      // (a smart enemy does not start his own swing while yours is coming: he defends first)
  const punish = G.smart >= 2 && vs.whiffAt > 0 && now - vs.whiffAt < 450 && gap > 0 && ag < near + 8 && Math.random() < [0, 0, 0.25, 0.5, 0.8, 1][vs.gi] * dt * 14;      // (you just missed: strike while you are open)
  const counter = G.smart >= 2 && d.counter && now - d.counter < 500 && gap > 0 && ag < near + 8;      // (he just blocked: answer at once)
  let go = punish || counter, k = 0;
  if (!go && !hold && now >= (d.nextDecide || 0)) {
    if (ag <= near) { d.nextDecide = now + 250; go = Math.random() < G.aggr; }
    else if (ag > near + 6 && ag <= farR && now >= (d.farAt || 0)) { d.nextDecide = now + 250; if (Math.random() < G.aggr * 0.7) { go = true; k = FRED_FAR.k0 + ((d.farC = (d.farC | 0) + 1) & 1); d.farAt = now + 700 + Math.random() * 600; } }
  }
  if (go) { d.k = k; d.held = null; d.ai = 'attack'; d.aiAt = now; d.hitDone = false; d.swung = false; d.hitN = 0; d.chain = 0; d.counter = 0; return; }
  if (move) { d.x += move * FOE_WALK * G.spd * dt; d.ai = 'walk'; } else d.ai = 'think';
}
// 4. HIS SPECIALS. Each one is a small timeline in dummy.fa = { type, t0, ... } (the swing code is not used while one runs); a blow of yours ends it (updateFighterVs calls freActEnd). What they do to you goes through gojoHit with the numbers of part 1, so your guard, your crouch, your jump and your dash decide what reaches you. What he throws lives in the enemy's own lists (fb: water, ff: stones and furniture, fc: cracks in the road).
const FRE_SP = { water: { cd: 6500, from: 1 }, pierce: { cd: 9000, from: 2 }, slam: { cd: 13000, from: 2 } };      // cooldown, first grade (index) that uses it
function freSpecialTry(now, gap, ag, G) {      // thinking: now and then, instead of a swing, one of the specials (never while you are down or he is not facing you)
  const d = dummy; if (now < (d.spNext || 0) || gap < -4 || vs.ph !== 'fight' || now - d.born < 1200) return false; d.spNext = now + 350 + Math.random() * 450;
  const r = Math.random(), gi = vs.gi;
  if (gi >= 3 && ag <= FD.reach && now >= (d.dreamAt === undefined ? d.born + 8000 : d.dreamAt) && !fd && !dom && !ult && stance === 'stand' && !gAir && hurtAt < 0 && jumpAt < 0 && !gojoGone && gojoLift <= 12 && dgAt < 0 && !(twOn() && vs.tw.away) && r < 0.2 + (gi - 3) * 0.06) { fdStartRev(now); return true; }      // (his ULTIMATE, once in 30 s: you fall asleep and he comes for you in the dream; from Semi-Grade 1 up, when you stand within 150 px)
  if (gi >= FRE_SP.pierce.from && ag <= 54 && now >= (d.pierceAt || 0) && r < 0.12 + gi * 0.03) return freStart('pierce', now);      // (close: the claw drawn back for a moment, then through you: nothing blocks it)
  if (gi >= FRE_SP.water.from && ag >= 70 && ag <= 210 && now >= (d.waterAt || 0) && r < 0.22 + gi * 0.03) return freStart('water', now);      // (far: he touches the floor, the water boils, and he throws it)
  if (gi >= FRE_SP.slam.from && ag >= 24 && ag <= 150 && now >= (d.slamAt || 0) && (!twOn() || fgTower() || !vs.tw.cab) && r < 0.1 + gi * 0.03) return freStart('slam', now);      // (he crouches, springs up and drives his claw into the floor)
  return false;
}
function freStart(type, now) {
  const d = dummy; d.held = null; d.counter = 0; d.chain = 0; d.ai = 'think'; d.aiAt = now; d.vx = 0;
  d.fa = { type, t0: now, coil: Math.round(720 - vs.gi * 45), n: 0, hit: false };
  if (type === 'water') { d.waterAt = now + FRE_SP.water.cd; snd('swing', 3); }
  else if (type === 'pierce') { d.pierceAt = now + FRE_SP.pierce.cd; snd('charge'); }
  else { d.slamAt = now + FRE_SP.slam.cd; d.fa.tw = twOn() && fgTower(); d.fa.N = FG.N[d.fa.tw ? 1 : 0]; d.fa.items = []; snd('jump'); }
  return true;
}
function freActEnd(now, hit) {
  const d = dummy; if (!d || !d.fa) return; const a = d.fa; d.fa = null;
  if (a.fell && d.air && d.air.hover) { d.air = null; d.airH = 0; }      // (the fall is over: he stands again)
  if (!hit) { d.ai = 'rest'; d.aiAt = now; d.restFor = 420 / (0.45 + GRADES[vs.gi].aggr * 0.9); }
}
function freActLook(now) {      // the picture of the special that is running, for freFoeLook
  const a = dummy.fa, t = now - a.t0;
  if (a.type === 'water') { const tm = 15000 / FRED_WATER.touchFps; return t < tm ? { src: fredT(t * FRED_WATER.touchFps / 1000), ox: FRED_RAKE_X } : { src: fredR((t - tm) * FRED_WATER.throwFps / 1000), ox: FRED_RAKE_X }; }
  if (a.type === 'pierce') return t < a.coil ? { src: fredP(Math.min(4, t / a.coil * 5)), ox: FRED_PIERCE.x } : { src: fredP(5 + Math.min(9, (t - a.coil) * FRED_PIERCE.fps / 1000)), ox: FRED_PIERCE.x };
  const L = a.look || {}; return { src: L.src || fredF(0), ox: L.ox || 0, lift: L.lift || 0 };      // (the slam: freSlam says what it shows)
}
function freAct(now, dt, gap, ag, toward, G) {
  const d = dummy, a = d.fa, t = now - a.t0;
  if (a.type === 'water') {
    const tm = 15000 / FRED_WATER.touchFps, rm = 15000 / FRED_WATER.throwFps;      // (the touch of the floor, then the throw; the water leaves the hand on the 7th picture of the throw)
    if (!a.thrown && t >= tm + FRED_WATER.rel * 1000 / FRED_WATER.throwFps) { a.thrown = true; freBall(now); snd('swing', 3); }
    if (t >= tm + rm) freActEnd(now, false);
  } else if (a.type === 'pierce') {
    const hitAt = a.coil + FRED_PIERCE.hit * 1000 / FRED_PIERCE.fps, endAt = a.coil + FRED_PIERCE.len * 1000 / FRED_PIERCE.fps + 120;
    if (!a.hit && t >= hitAt) { a.hit = true; snd('clawscrape'); if (ag <= FRED_PIERCE.reach + 14 && gap > -4) { const h = hurtAt; gojoHit(FRE_K.pierce, now); if (hurtAt !== h) { vs.bleed = { until: now + 2000, next: now + 100 }; tqBlood(wx, gy - 34, 22, -1); say('PIERCED!', wx, '#ff4a5a', 8, now + 120); } } }
    if (t >= endAt) freActEnd(now, false);
  } else freSlam(now, dt, a, t);
}
function freBall(now) { const d = dummy; (d.fb = d.fb || []).push({ x: d.x - 14, x0: d.x - 14, at: now, dir: d.x >= wx ? -1 : 1 }); }
function freSlam(now, dt, a, t) {      // spring up, drive the claw in, pick up the pieces and throw them at you (the same timeline as when you play him: fred2.js)
  const d = dummy, tI = FG.spring + FG.air, tH = tI + FG.stoop + FG.hold, CY = Math.round(8000 / FG.fps), tT = tH + a.N * CY, tR = Math.round(5000 / FG.fps);
  a.look = { src: fredF(0), ox: 0, lift: 0 };
  if (t < FG.spring) a.look.src = fredC(1, 14.99 * t / FG.spring);
  else if (t < tI) { const p = (t - FG.spring) / FG.air, u = p < 0.55 ? 1 - Math.pow(1 - p / 0.55, 2) : 1 - Math.pow((p - 0.55) / 0.45, 2); a.look = { src: fredJ(p < 0.55 ? 6 + 8 * p / 0.55 : 14 + 19 * (p - 0.55) / 0.45), ox: 0, lift: FG.apex * u }; }
  else {
    if (!a.hit) { a.hit = true; freSlamImpact(now, a); if (!d.fa) return; }
    if (t < tI + FG.stoop) a.look = { src: fredJ(36), ox: 0, lift: 0 }; else if (t < tH) a.look = { src: fredT(12 + 2.99 * (t - tI - FG.stoop) / FG.hold), ox: FRED_RAKE_X, lift: 0 };
    else if (t < tT) { const i = Math.floor((t - tH) / CY), q = (t - tH - i * CY) / CY, fi = 2 + Math.min(7, Math.floor(q * 8)); a.look = { src: fredR(fi), ox: FRED_RAKE_X, lift: 0 }; if (a.n <= i && fi >= FG.rel) { a.n = i + 1; freThrow(now, a); } }
    else if (t < tT + tR) a.look = { src: fredR(10 + 4.99 * (t - tT) / tR), ox: FRED_RAKE_X, lift: 0 };
    else if (a.fell && vs.tw && vs.tw.slide) a.look = { src: fredR(14), ox: FRED_RAKE_X, lift: 0 };      // (the fall is still going: he holds the last picture)
    else { freActEnd(now, false); return; }
  }
  if (a.fell) { d.stunUntil = Math.max(d.stunUntil || 0, now + 200); d.hitDone = true; d.vx = 0; if (!d.air || !d.air.hover) { d.air = { at: now, h0: FG.hang, v0: 0, g: 0, kind: 'up', T: 1e9, hover: true }; d.airH = FG.hang; } }      // (he falls next to you: he hangs in the air)
}
function freSlamImpact(now, a) {      // the claw hits the floor: the road cracks towards you (a stone burst at his feet), or the floor breaks under both of you
  const d = dummy, x = d.x - FG.reach * (d.x >= wx ? 1 : -1), dir = d.x >= wx ? -1 : 1;
  gritAt(x, 12, 130, 0); shockAt(x, 220, 90, 0.9); puff(x - 6, 8); puff(x + 6, 8); snd('land', 1.6); snd('twbreak', 4); flash(now, 90, 0.18); hitStop(60); shakeUntil = Math.max(shakeUntil, now + 360); shakeAmp = Math.max(shakeAmp, 5);
  if (a.tw) { freTowerBreak(now, a); return; }
  (d.fc = d.fc || []).push({ x, at: now, dir, len: Math.min(170, Math.max(60, Math.abs(d.x - wx) + 24)), seed: (now | 0) & 255 }); if (d.fc.length > 4) d.fc.shift(); a.ix = x;
  debBurst(x, 6, 18, ['#8a8a92', '#6d6d75', '#b8b0a0', '#4c4a40'], 160);
}
function freTowerBreak(now, a) {      // the skyscraper: the floor breaks under both, both fall, and he grabs what is around him (the same as fgTowerBreak with the two of you the other way round)
  const T = vs.tw, d = dummy, f = T.fMe, F = twFloorData(f), n = Math.min(FG.floors, f - 1), gap = d.x - wx, x = wx;
  const top = F.objs.filter(o => !o.on && o.k !== 'pillar' && Math.abs(o.x - wx) < 190).sort((p, q) => Math.abs(p.x - wx) - Math.abs(q.x - wx)).slice(0, a.N);
  a.items = top.map((o, i) => ({ k: o.k, v: o.v | 0 })); while (a.items.length < a.N) a.items.push({ k: 'rock', v: a.items.length });
  for (const o of top) { const i = F.objs.indexOf(o); if (i >= 0) F.objs.splice(i, 1); } for (const c of F.objs.slice()) if (top.includes(c.on)) twBreakObj(F, c, now);
  for (let i = 0; i < n; i++) { twAddHole(f - i, wx, 28, now); if (Math.abs(gap) > 24) twAddHole(f - i, d.x, 28, now); }
  debBurst(x, 6, 18 + 2 * n, ['#8a8a92', '#6d6d75', '#b8b0a0', '#6d3b2c'], 150 + 10 * n); puff(x - 8, 6); puff(x + 8, 6); shockAt(x, 280, 120, 0.9); shakeUntil = Math.max(shakeUntil, now + 520); shakeAmp = Math.max(shakeAmp, 6); hitStop(70);
  for (const dr of F.doors) if (dr.k === 'elev' && Math.abs(dr.x - x) < 50) twDoorHit(F, dr, 25 + 15 * n, now);
  twLightsShock(F, x, 90 + 20 * n, 30 + 20 * n, now); twHaze(now, 0.8); twFlash(x, now, [255, 240, 210], 36);
  const to = f - n, dmMe = Math.max(1, Math.round(PHP * Math.min(0.30, 0.03 * n))), dmFoe = Math.round((d.max || DUMMY_HP) * Math.min(0.30, 0.03 * n));
  T.fMe = to; T.fFoe = to; T.lastFallX = x; T.away = false; d.twAway = false; twFloorSwitch(now, x, 'fall'); d.x = twPlace(twFloorData(to), wx + gap); d.vx = 0; d.down = 0;
  twHurtMe(dmMe, now, true); twHurtFoe(dmFoe, now, true); T.dx = d.x; T.dHp = d.hp; T.pHp = vs.hp; T.dHit = d.hitAt;
  if (T.slide) { T.slide.pair = true; T.slide.ms = FG.fallMs; T.slide.land = ['BREAK!', n, dmMe]; vs.nHold = Math.max(vs.nHold || 0, now + FG.fallMs); if (T.banner) T.banner.at = now + FG.fallMs; } else twLand(now, 'BREAK!', n, dmMe);
  say('BREAK!', x, '#ffd34d', 8, now); a.fell = true;
}
function freThrow(now, a) {      // a stone (or a piece of furniture) leaves his hand and flies at you
  const d = dummy, it = a.tw ? a.items.shift() : null, k = it ? it.k : 'rock', v = it ? it.v : (Math.random() * 4) | 0, dir = d.x >= wx ? -1 : 1, X = d.x + dir * 26, Y = 40, T = Math.max(0.12, Math.abs(wx - X) / FG.speed);
  (d.ff = d.ff || []).push({ k, v, x0: X, y0: Y, yT: 30, T, at: now, x: X, y: Y, dir, rot: 0, spin: (Math.random() < 0.5 ? -1 : 1) * (5 + Math.random() * 5), kk: k === 'rock' ? FRE_K.stone : FRE_K.obj }); snd('swing', 3);
}
function freWorld(now, dt) {      // every frame while the enemy Freddy fights: what he threw flies, hits you or lands, and is drawn; the scalding of the water goes on
  const d = dummy, cx = Math.round(VW / 2);
  if (vs.ph !== 'fight' && !d.fb && !d.ff && !d.fc) return;
  const on = vs.ph === 'fight' && d.ko < 0;
  if (d.fc) { for (const c of d.fc) { const age = now - c.at; if (age > 6000) continue; const al = age > 4500 ? (6000 - age) / 1500 : 1, n = Math.floor(c.len * Math.min(1, age / 260)); let y = 0, s = c.seed * 977 + 13; ctx.fillStyle = 'rgba(8,6,12,' + al.toFixed(2) + ')'; for (let i = 0; i < n; i++) { if (i % 3 === 0) { s = (s * 1103515245 + 12345) >>> 0; y = Math.max(0, Math.min(5, y + ((s >> 8) & 1 ? 1 : -1))); } ctx.fillRect(cx + Math.round(c.x + c.dir * i - wx), gy + 1 + y, 1, 1 + (i % 7 === 0 ? 1 : 0)); } } d.fc = d.fc.filter(c => now - c.at < 6000); }
  if (d.fb) {      // the boiling water: a ball that flies straight at you
    for (const b of d.fb) {
      b.x += b.dir * FRED_WATER.speed * dt; const sx = cx + Math.round(b.x - wx), y = gy - 27;
      ctx.fillStyle = '#2f7fd0'; ctx.fillRect(sx - 3, y - 3, 7, 7); ctx.fillStyle = '#9fdcff'; ctx.fillRect(sx - 2, y - 2, 5, 5); ctx.fillStyle = '#ffffff'; ctx.fillRect(sx - 1, y - 2, 2, 2); ctx.fillStyle = 'rgba(159,220,255,0.5)'; ctx.fillRect(sx - b.dir * 9, y, 6, 1); ctx.fillRect(sx - b.dir * 14, y + 1, 4, 1);
      if (!on) { b.done = 1; continue; }
      if (b.dir * (wx - b.x) < 8) { b.done = 1; const h = hurtAt; gojoHit(FRE_K.water, now); if (hurtAt !== h) { vs.fscald = { until: now + 6000, next: now + 450 }; spark(wx, gy - 28, 14, ['#9fdcff', '#ffffff', '#2f7fd0'], false, -b.dir); snd('splash'); say('SCALDED!', wx, '#ff9a3a', 8, now + 120); } else spark(b.x, gy - 28, 6, ['#9fdcff', '#ffffff'], false, b.dir); }
      else if (Math.abs(b.x - b.x0) > FRED_WATER.reach) { b.done = 1; spark(b.x, gy - 4, 8, ['#9fdcff', '#ffffff', '#2f7fd0'], false, 0); snd('splash'); }
    }
    d.fb = d.fb.filter(b => !b.done);
  }
  if (d.ff) {      // stones and furniture
    for (const p of d.ff) {
      const t = (now - p.at) / 1000, q = t / p.T; p.x = p.x0 + p.dir * FG.speed * t; p.y = p.y0 + (p.yT - p.y0) * q + 9 * Math.sin(Math.min(1, q) * Math.PI); p.rot += p.spin * dt;
      const sx = cx + Math.round(p.x - wx), sy = Math.round(gy - p.y);
      if (p.k === 'rock') fgRock(sx, sy, p.v); else { const s = twSprite(p.k, p.v), K = TW_K[p.k]; ctx.save(); ctx.translate(sx, sy); ctx.rotate(p.rot); ctx.drawImage(s.c, -s.ox, -s.by + (K.h >> 1)); ctx.restore(); }
      if (on && p.dir * (wx - p.x) < 10) { p.done = 1; const h = hurtAt; gojoHit(p.kk, now); if (hurtAt !== h) { if (p.k !== 'rock') { const K = TW_K[p.k]; debBurst(p.x, p.y, 8 + (K.w >> 3), K.cols, 120); snd('twbreak', K.s); } else { debBurst(p.x, p.y, 7, ['#8a8a92', '#6d6d75', '#b8b0a0'], 100); snd('twbreak', 3); } } }
      else if (!on || t > 2 || p.y < -6 || Math.abs(p.x - wx) > 360) { p.done = 1; if (p.y < -6) { gritAt(p.x, 4, 60, 0); snd('land', 1.2); } }
    }
    d.ff = d.ff.filter(p => !p.done);
  }
  if (vs.fscald) { const b = vs.fscald; if (vs.ph !== 'fight') vs.fscald = null; else { while (vs.fscald && b.next <= now && b.next <= b.until) { vsHurt(1, b.next); b.next += 450; } if (now >= b.until) vs.fscald = null; } }      // (the boiling water burns you: 1 damage every 0.45 s for 6 s)
}
function freBleed(now) { if (vs.bleed) { const b = vs.bleed; if (vs.ph !== 'fight') vs.bleed = null; else { while (vs.bleed && b.next <= now && b.next <= b.until) { vsHurt(1, b.next); b.next += 100; } if (now >= b.until) vs.bleed = null; } } }      // (the bleeding of his claw: 1 damage every 0.1 s; only Verity's story fight ticked it until now, storyBattleTick)
// 5. HIS NIGHTMARE ON YOU: the same sequence as when you play him (freddyDream in template.html, the numbers FD), with you as the sleeper. The picture is the same too, only the other way round: he stands on the right and sings, you fall asleep in the middle, in the dream you stand there and he comes out of the dark, four slashes, the pierce, and you wake up bleeding. The damage is FD.dmg and FD.pierce times the damage of the grade.
function fdStartRev(now) {
  const d = dummy; fd = { at: now, rev: true, slept: false, sank: false, dreamed: false, hit: [false, false, false, false], pierced: false, woke: false, fx: [], glitch: -1e9, v: { rx: -1, rxAt: -1e9 } };
  d.dreamAt = now + FD.cd; d.fa = null; d.ai = 'rest'; d.aiAt = now; d.restFor = 800; d.vx = 0; d.chain = 0; d.hitDone = true; d.held = null;
  atkAt = -1; atkQ = false; jumpAt = teleAt = -1; stance = 'stand'; lpAt = -1; dash = null; mbAt = -1; mbPending = false; ride = null; dgAt = -1; blkAt = -1; blkEnd = -1; cineClear(); snd('lullaby');
}
function freVicPic(now) {      // the picture of the sleeper (you): standing, reeling from a blow, or on the floor
  const S = fatSets(true), v = fd.v, rx = v.rx, R = rx >= 0 ? S.vRx[rx] : null;
  if (R) { const fps = R.length > 10 ? RXF15[rx] : RX_FPS[rx], fi = Math.max(0, Math.min(R.length - 1, Math.floor((now - v.rxAt) * fps / 1000))), info = S.vi ? S.vi(rx) : D['rx' + rx]; return { src: now - v.rxAt < 70 ? whiteOf(R[fi]) : R[fi], info, lift: info.lift ? info.lift[fi] : 0 }; }
  const fi = Math.floor(now / (1000 / IDLE_FPS)) % S.vF.length; return { src: S.vF[fi], info: S.vi ? S.vi(-1) : D.idle, lift: 0 };
}
function freDreamRev(now, dt) {      // every frame of the nightmare he gives you; false = it is over (the normal scene goes on)
  const d = dummy, t = (now - fd.at) / 1000, cx = Math.round(VW / 2), G = GRADES[vs.gi], v = fd.v, stop = () => { fd = null; return false; };
  if (!d || d.ko >= 0 || !vs || vs.ph !== 'fight') return stop();
  d.stunUntil = Math.max(d.stunUntil, now + 400); d.ai = 'rest'; d.aiAt = now; d.restFor = 800; d.vx = 0; d.chain = 0; d.hitDone = true;
  const dream = t >= FD.B && t < FD.dream, FX = () => dream ? cx + 40 : cx + Math.max(24, Math.round(d.x - wx)), VX = wx + 40;      // (FX: where he stands on the screen, you are in the middle; VX: the world place of him, for the blood)
  if (t >= FD.sleep && !fd.slept) { fd.slept = true; v.rx = 4; v.rxAt = now; }
  if (t >= FD.A && !fd.sank) { fd.sank = true; snd('nightmare'); }
  if (t >= FD.B && !fd.dreamed) { fd.dreamed = true; v.rx = -1; shakeUntil = now + 120; shakeAmp = 1; }
  FD.hits.forEach((h, k) => { if (t >= h && !fd.hit[k]) { fd.hit[k] = true; vsHurt(Math.max(1, Math.round(FD.dmg[k] * G.dmg)), now); if (vs.ph !== 'fight') return; v.rx = (Math.random() * 10) | 0; v.rxAt = now; tqBlood(wx - 4, gy - 34, 16 + k * 4, 1); fd.fx.push({ at: now, k }); fd.glitch = now; shakeUntil = now + 110; shakeAmp = 2; snd('clawscrape'); } });
  if (t >= FD.pierceAt && !fd.pierced && vs.ph === 'fight') { fd.pierced = true; vsHurt(Math.max(1, Math.round(FD.pierce * G.dmg)), now); v.rx = 4; v.rxAt = now; tqBlood(wx - 4, gy - 34, 40, 1); tqBlood(wx - 4, gy - 34, 16, -1); fd.fx.push({ at: now, k: 4 }); fd.glitch = now; shakeUntil = now + 220; shakeAmp = 4; hitStop(80); snd('clawscrape'); snd('hit', 3); }
  if (vs.ph !== 'fight') return stop();      // (you died in the dream: the round is over)
  if (t >= FD.wake && !fd.woke) { fd.woke = true; v.rx = 4; v.rxAt = now - 340; vs.bleed = { until: now + 2000, next: now + 100 }; snd('wakeup'); }
  freBleed(now);
  if (!dream && fd.slept && !(fd.woke && t >= FD.wake + FD.rise) && now - v.rxAt > 340) v.rxAt = now - 340;      // (asleep you lie flat: the picture of the fall is held on its last lying frame; it goes on when you wake)
  if (t >= FD.end) { fd = null; return false; }
  ctx.save(); shkX = shkY = 0; if (now < shakeUntil && !SET.lite) { shkX = Math.round((Math.random() * 2 - 1) * shakeAmp * SET.shk / 100); shkY = Math.round((Math.random() * 2 - 1) * shakeAmp * SET.shk / 100); ctx.translate(shkX, shkY); }
  ctx.imageSmoothingEnabled = false;
  const R = (c, x, y, w, h) => { ctx.fillStyle = c; ctx.fillRect(Math.round(x), Math.round(y), w, h); };
  if (dream) fdBg(now);
  else { drawBackdrop(now); ctx.fillStyle = 'rgba(220,210,255,0.35)'; for (const p of parts) { p.x -= p.v * dt; if (p.x < -p.l) p.x = VW; ctx.fillRect(p.x | 0, p.y | 0, p.l, 1); } drawSmoke(now, dt); drawBloodFloor(now, dt); updatePeds(now, dt); drawPeds(now, dt, 0); }
  // you: in the middle, facing right
  { const P = freVicPic(now), I = P.info, hx = I.cx - I.x0, y = gy - 60 - (I.top || 0) - P.lift; ctx.fillStyle = 'rgba(0,0,0,0.4)'; ctx.fillRect(cx - 9, gy + 3, 18, 2); ctx.fillRect(cx - 6, gy + 2, 12, 1); ctx.fillRect(cx - 6, gy + 5, 12, 1); ctx.drawImage(P.src, cx - hx, y); }
  // Freddy: coiled while he sings, out of the dark in the dream, his own slashes and the pierce, then standing; facing left
  let pic = null, ox = 0, ap = 1;
  if (!dream) { if (t < FD.dream) { pic = fredP(Math.min(4, t * 5 / 0.9)); ox = FRED_PIERCE.x; } else pic = fredF(Math.max(0, now - d.born) / (1000 / IDLE_FPS)); }
  else {
    ap = Math.max(0, Math.min(1, (t - FD.appear[0]) / (FD.appear[1] - FD.appear[0]))); pic = fredF(Math.max(0, now - d.born) / (1000 / IDLE_FPS));
    FD.hits.forEach((h, k) => { const st = h - 7 / FD.swing; if (t >= st && t < st + 15 / FD.swing) pic = fredA(k % 2, Math.min(14, (t - st) * FD.swing)); });
    if (t >= FD.charge[0] && t < FD.charge[1]) { pic = fredP(Math.min(4, (t - FD.charge[0]) / (FD.charge[1] - FD.charge[0]) * 5)); ox = FRED_PIERCE.x; if (((now / 90) | 0) % 2 === 0) spark(wx + 26, gy - 24, 2, ['#ff3a4a', '#7a0a14', '#ffb0a0'], false, -1); }
    else if (t >= FD.charge[1] && t < FD.charge[1] + 10 / FRED_PIERCE.fps) { pic = fredP(5 + Math.min(9, (t - FD.charge[1]) * FRED_PIERCE.fps)); ox = FRED_PIERCE.x; }
  }
  if (vs.inv && pic !== EMPTY && pic.width) pic = invOf(pic);
  if (ap > 0) { const fx = FX(), jit = ap < 1 && Math.random() < 0.4 ? (Math.random() < 0.5 ? -2 : 2) : 0; ctx.fillStyle = 'rgba(0,0,0,0.4)'; ctx.fillRect(fx - 9, gy + 3, 18, 2); ctx.fillRect(fx - 6, gy + 2, 12, 1); ctx.fillRect(fx - 6, gy + 5, 12, 1); ctx.save(); ctx.translate(fx, 0); ctx.scale(-1, 1); ctx.globalAlpha = ap; ctx.drawImage(pic, -31 + ox + jit, gy - 61); ctx.restore(); }
  // the lullaby: notes drift from his claw to you
  if (t < FD.B) { const fx = FX(); for (let i = 0; i < 6; i++) { const u = (t * 0.45 + i / 6) % 1, nx = fx - 12 - u * (fx - 12 - cx), ny = gy - 40 - Math.sin(u * 9) * 7 - u * 10; R('#cdb8ff', nx, ny, 3, 2); R('#cdb8ff', nx + 2, ny - 5, 1, 5); R('#cdb8ff', nx + 3, ny - 5, 2, 1); } }
  for (const f of fd.fx) {      // the marks of the claws: four lines slash across you; the pierce is a bright streak straight through
    const a = (now - f.at) / 260; if (a >= 1) continue; const fx = FX(), q = Math.min(1, a * 5), al = (1 - a).toFixed(2);
    if (f.k === 4) { const x1 = fx - 14, len = Math.round((x1 - cx + 22) * q); R('rgba(255,70,90,' + al + ')', x1 - len, gy - 34, len, 1); R('rgba(255,255,255,' + al + ')', x1 - len, gy - 33, len, 2); R('rgba(255,70,90,' + al + ')', x1 - len, gy - 31, len, 1); }
    else for (let l = 0; l < 4; l++) for (let i = 0, n = Math.round(30 * q); i < n; i++) { const u = i / 30; R(l < 2 ? 'rgba(255,255,255,' + al + ')' : 'rgba(255,90,110,' + al + ')', (f.k % 2 ? cx + 14 - u * 28 : cx - 14 + u * 28) + l * 3, gy - 52 + u * 30, 1, 1); } }
  fd.fx = fd.fx.filter(f => now - f.at < 260);
  drawDivFx(now); drawSparks(now, dt); if (!dream) drawPeds(now, dt, 1); drawGibs(now); drawPopups(now);
  // the transitions: the blue dusk of the lullaby, the waves and rings of the fall, the dark that lifts, the white of the waking
  if (t < FD.B) { R('rgba(30,50,140,' + Math.min(0.4, t * 0.4).toFixed(2) + ')', 0, 0, VW, VH); }
  if (t >= FD.A && t < FD.B) { const p = (t - FD.A) / (FD.B - FD.A), amp = 5 * p; if (!(now < shakeUntil) && !SET.lite) for (let y = 0; y < VH; y++) ctx.drawImage(cv, 0, y, VW, 1, Math.round(Math.sin(y / 5 + now / 60) * amp), y, VW, 1); const hx = cx, hy = gy - 12; ctx.fillStyle = 'rgba(190,170,255,' + (0.8 * p).toFixed(2) + ')'; for (let i = 0; i < 5; i++) { const r = ((p * 60 + i * 14) % 70) + 2; for (let a = 0; a < 28; a++) { const th = a / 28 * 6.2832 + p * 4; ctx.fillRect(Math.round(hx + Math.cos(th) * r), Math.round(hy + Math.sin(th) * r * 0.7), 1, 1); } } R('rgba(10,10,50,' + (p * p).toFixed(2) + ')', 0, 0, VW, VH); }
  if (t >= FD.B && t < FD.B + 0.5) R('rgba(10,10,50,' + (1 - (t - FD.B) / 0.5).toFixed(2) + ')', 0, 0, VW, VH);
  if (now - fd.glitch < 150) for (let k = 0; k < 7; k++) { const y = (Math.random() * (VH - 8)) | 0; ctx.drawImage(cv, 0, y, VW, 4 + ((Math.random() * 5) | 0), Math.round((Math.random() * 2 - 1) * 8), y, VW, 4); }
  const bar = Math.round(9 * Math.min(1, t / 0.5) * Math.min(1, (FD.end - t) / 0.5)); if (bar > 0) { R('#000', 0, 0, VW, bar); R('#000', 0, VH - bar, VW, bar); }
  if (t >= FD.dream - 0.3 && t < FD.wake + 0.5) { const f = t < FD.wake ? (t - FD.dream + 0.3) / (FD.wake - FD.dream + 0.3) : 1 - (t - FD.wake) / 0.5; R('rgba(255,255,255,' + Math.max(0, Math.min(1, f)).toFixed(2) + ')', 0, 0, VW, VH); }
  ctx.restore();
  return true;
}
