// ================================================================ v1.156 CHAPTER 4, PART 3: THE FIGHT (YUJI VS MEGUNA; the shell and the cutscene are in tools/chap4c.js)
// YUJI (you): walk, jump, crouch, block, dash with the normal buttons; his ONLY attack is the BLACK FLASH (the ATTACK button, labelled FLASH): standing = the punch (strip 20), in the air = the kick to the head (21), crouched = the blow to the stomach (22).
// A spark RING is put on Meguna where he is (and where he is walking to) the moment you press: Yuji lunges at it and a ring flashes just before the impact; if Meguna is still inside the ring when the fist lands it is a full BLACK FLASH (lightning, flash, the longest hit-stop,
// it breaks a guard), if he has moved out of it (or the blow only grazes him) it is a weak punch (a quarter of the damage), and if he is out of reach or dodging it misses. All of Yuji's damage is HALVED (the BF_DMG numbers x INH_DMG, as in INHERITENCE).
// MEGUNA: only walking, jumping, dashing, blocking, an M1 chain of 2 - 4 blows (jab, jab, elbow, then the face kick that knocks you back) and, rarely, the SHADOW SINK (he sinks, his pool slides under your feet, a ring warns, and he comes up with an uppercut that nothing blocks);
// his BRAIN (c4xThink) sees Yuji as he was `rt` seconds ago (c4xSee: a reaction time), reads the wind-up of a Black Flash and dodges or blocks it, punishes a blow that missed, remembers what Yuji does (c4xHab: jumps, dashes in and out, long Black Flashes, blocking) and counters it, baits with feints,
// and gets smarter and faster while the fight goes on (c4xLevel: 0 - 6, from the health Meguna has lost and the time: reaction time, the chance of a correct reaction, fewer slips, speed, damage). You win when Meguna is at HALF health (the bar has a mark); a win and a loss both go on with RANOS stepping in (c4xRanosStart in chap4e.js).
const C4YJ = (() => { const o = {}; [['p', 20, 26, 12, 46, 16, 0], ['k', 21, 30, -2, 40, 0, 1], ['g', 22, 28, 0, 32, 10, 2]].forEach(([n, k, reach, y0, y1, lunge, i]) => { o[n] = { k, fps: YU_ATK.fps[k], imp: YU_ATK.imp[k][0], reach, y0, y1, lunge, dmg: Math.round(BF_DMG[i] * INH_DMG), ring: [32, 30, 18][i] }; }); return o; })();      // (the three Black Flashes: strip, pictures a second, the impact picture, how far the fist is in front of him, the band of height it hits (px above the floor), how far he lunges, the damage (half of the normal one), the height of the ring)
const C4MB = [      // Meguna's blows: his row, pictures a second, the impact picture (0 - 14), how far the fist reaches in front of him, how far he steps (px), damage, the push (px/s), Yuji's reaction (his strip rx), high = a crouching Yuji ducks it
  { row: 'a0', fps: 34, imp: 7, reach: 28, step: 8, dmg: 7, push: 25, rx: 0, snd: 0 }, { row: 'a1', fps: 34, imp: 7, reach: 28, step: 8, dmg: 7, push: 25, rx: 1, snd: 1 },
  { row: 'el', fps: 34, imp: 7, reach: 22, step: 14, dmg: 9, push: 30, rx: 2, snd: 2 }, { row: 'a2', fps: 30, imp: 5, reach: 32, step: 14, dmg: 13, push: 150, rx: 9, snd: 3, high: true, brk: true }];
const C4_SINK = { in: 0.32, travel: 0.6, warn: 0.5, up: 7 / 38, dmg: 22, cd: 9 };      // the shadow sink: sinking (s), the pool's travel to Yuji, the warning ring under his feet, the uppercut's impact (s after the eruption), its damage, the wait before he may do it again
const c4xRxMs = rx => 15 / RXF15[rx] * 1000;
const c4xLevel = () => { if (window.__c4xLv !== undefined) return window.__c4xLv; const F = c4x && c4x.F; return F ? Math.max(0, Math.min(6, Math.floor((PHP - F.mhp) / 30) + Math.floor((pnow() - F.t0 - 1300) / 30000))) : 0; };      // (he learns as the fight goes: +1 for every 30 health he has lost and for every 30 seconds)
function c4xAIP() { const L = c4xLevel(); return { L, rt: 0.2 - 0.0133 * L, reactP: 0.4 + 0.07 * L, mist: 0.2 - 0.025 * L, aggr: 0.78 + 0.07 * L, spd: 0.94 + 0.02 * L, dmg: 0.85 + 0.035 * L }; }      // (what the fight so far has made of him (0 - 6): reaction time in s (0.2 - 0.12), the chance that he reacts to a Black Flash (0.4 - 0.82), slips (0.2 - 0.05), eagerness, speed, damage)
const c4xClamp = (v, a, b) => Math.max(a, Math.min(b, v));

// ---- the start of the fight (after the cutscene)
function c4xBegin(now) {
  const c = c4x, Y = c.y, M = c.m; c.ph = 'fight'; c.t0 = now; c.ev = {}; c.res = false; c.cutAt = 0; c.lose = null; c.pool = c.pool2 = null; c.fx = []; c.gib = null; c.black = null; c.glow = null; c.mFront = false;
  Object.assign(Y, { face: 1, lift: 0, vx: 0, rot: 0, white: 0, gone: false, alpha: undefined, st: 'idle', hurt: null, atk: null, dash: null, jump: null, fly: null, blk: false, blkAt: 0, cr: 0, crAt: 0, crTog: false, inv: 0, dashCd: 0, breakCd: 0, aBuf: -1e9, jBuf: -1e9, dBuf: -1e9, ph: 0, guard: 0, hitAt: -1e9 });
  Object.assign(M, { face: -1, lift: 0, sink: 0, vx: 0, white: 0, gone: false, alpha: undefined, st: 'idle', t0: now, atk: null, dash: null, jump: null, blk: 0, blkAt: 0, hurt: null, sk: null, inv: 0, dashCd: now + 800, sinkCd: now + 3000, actAt: now + 1300, walk: 0, wspd: 0, plan: null, guard: 0, hitAt: -1e9 });
  Y.x = c4xClamp(Y.x, C4X.arL + 12, C4X.arR - 12); M.x = c4xClamp(M.x, C4X.arL + 12, C4X.arR - 12);
  c.F = { ph: 'intro', t0: now, hp: PHP, sh: PHP, mhp: PHP, msh: PHP, half: PHP / 2, hist: [], log: [], hitAt: -1e9, mhitAt: -1e9, bfN: 0, weakN: 0, ai: { seenAtk: -1, punished: -1, followAt: -1e9 }, banner: now };
  c4xMus(c, true, now);      // (the song is on in the fight: after a skip of the cutscene it begins here)
  c4xUi(true); c4xCine(false); keyL = keyR = padL = padR = jumpReq = atkReq = crReq = lpReq = dashReq = ceReq = domReq = blockHeld = false;
}

// ---- YUJI (the player)
function c4xYSnap(c, now) {
  const Y = c.y, a = Y.atk, S = a && C4YJ[a.kind];
  return { t: now, x: Y.x, lift: Y.lift, face: Y.face, hurt: !!Y.hurt || !!Y.fly, blk: Y.blk, cr: Y.cr === 1, air: !!Y.jump && Y.lift > 2, jumpT0: Y.jump ? Y.jump.t0 : -1, landing: !!Y.jump && Y.lift <= 2 && now - Y.jump.t0 > JUMP_T.crouch + JUMP_T.air - 40, dash: !!Y.dash, atk: !!a, kind: a ? a.kind : '', atkT0: a ? a.t0 : -1, atkHit: a ? a.hit : false, whiff: a ? !!a.whiff : false, atkMs: S ? 15 / S.fps * 1000 : 0, impMs: S ? S.imp / S.fps * 1000 : 0 };
}
function c4xLog(c, now, k) { const F = c.F; F.log.push({ t: now, k }); if (F.log.length > 80) F.log.shift(); }
function c4xYStep(c, now, dt) {
  const F = c.F, Y = c.y, M = c.m, go = F.ph === 'go', L = keyL || padL, R = keyR || padR, dirIn = (R ? 1 : 0) - (L ? 1 : 0);
  let jReq = jumpReq, aReq = atkReq, dReq = dashReq, cReq = crReq; jumpReq = atkReq = dashReq = crReq = lpReq = ceReq = domReq = false;
  if (!go) { jReq = aReq = dReq = cReq = false; }
  if (jReq) Y.jBuf = now; if (aReq) Y.aBuf = now; if (dReq) Y.dBuf = now; if (cReq) Y.crTog = !Y.crTog;
  const act = !Y.hurt && !Y.fly && !Y.dash && !Y.atk;      // (free to start something)
  // ---- physics of a push
  Y.x += Y.vx * dt; Y.vx *= Math.exp(-6 * dt); if (Math.abs(Y.vx) < 1) Y.vx = 0;
  // ---- the launch (the shadow uppercut): up and back, lies for a moment, gets up; nothing touches him
  if (Y.fly) {
    const f = Y.fly, tau = (now - f.t0) / 1000, air = f.v0 * 2 / f.g;
    if (tau < air) { Y.lift = Math.max(0, f.v0 * tau - f.g / 2 * tau * tau); Y.x += f.dir * 34 * dt; } else Y.lift = 0;
    if (tau >= air + 0.28) { Y.fly = null; Y.inv = now + 150; }
  }
  // ---- the hit reaction
  if (Y.hurt) {
    const h = Y.hurt, e = now - h.t0; if (e >= h.ms) Y.hurt = null;
    else if (e >= 350 && dReq && now >= Y.breakCd && go) { Y.hurt = null; Y.breakCd = now + 3500; c4xYDash(c, now, dirIn || -Y.face, true); say('COMBO BREAK!', Y.x, '#7dff9a', 8, now); }      // (DASH gets him out of a combo: after 0.35 s, once in 3.5 s)
  }
  // ---- the dash
  if (Y.dash) { const d = Y.dash, u = (now - d.t0) / DASH_MS; Y.x = d.from + (d.to - d.from) * c4xOut(u); if (now - d.t0 >= 300) { Y.dash = null; } }
  // ---- the Black Flash
  if (Y.atk) {
    const a = Y.atk, S = C4YJ[a.kind], e = (now - a.t0) / 1000, f = e * S.fps;
    if (a.kind !== 'k') { const u = c4xOut(Math.min(1, e / (S.imp / S.fps))); Y.x = a.x0 + a.dir * a.lg * u; }
    if (!a.hit) { if (f >= S.imp) { a.hit = true; c4xYImpact(c, now, a); } } else if (f >= 14.5 || (a.whiff && f >= 13)) { Y.atk = null; Y.ph = 0; }
    if (a.kind === 'k' && Y.lift <= 0 && e > 0.55) Y.atk = null;
  }
  // ---- the jump (frames and height are the game's own: jumpFrame, YU.jump.lift); it goes on while he kicks in the air
  if (Y.jump && !Y.fly && !Y.hurt && !Y.dash) { const e = now - Y.jump.t0, fi = jumpFrame(e); if (fi >= 15) { Y.jump = null; Y.lift = 0; } else { Y.lift = YU.jump.lift[fi] || 0; if (e >= JUMP_T.crouch && e < JUMP_T.crouch + JUMP_T.air) Y.x += dirIn * 50 * dt; } }
  if (!act) { Y.blk = false; }
  else {
    Y.blk = false;
    if (go && !Y.jump) {
      if (now - Y.jBuf < 160) { Y.jBuf = -1e9; Y.jump = { t0: now }; Y.crTog = false; Y.cr = 0; snd('jump'); c4xLog(c, now, 'jump'); }
      else if (now - Y.dBuf < 160 && now >= Y.dashCd) { Y.dBuf = -1e9; c4xYDash(c, now, dirIn || -Y.face, false); }
      else if (now - Y.aBuf < 200) { Y.aBuf = -1e9; c4xYAttack(c, now, Y.cr === 1 ? 'g' : 'p'); }
      else if (blockHeld && Y.cr === 0) { Y.blk = true; if (!Y.blkAt) Y.blkAt = now; }
    } else if (go && Y.jump && now - Y.aBuf < 200 && Y.lift >= 4) { Y.aBuf = -1e9; c4xYAttack(c, now, 'k'); }
    if (!Y.blk) Y.blkAt = 0;
    // ---- crouch (the stick's down position, or the C / S key once)
    if (!Y.jump && act && !Y.atk && !Y.dash) { const want = !Y.blk && go && (stickDown || Y.crTog); if (want && Y.cr === 0) { Y.cr = 1; Y.crAt = now; c4xLog(c, now, 'crouch'); } else if (!want && Y.cr === 1) { Y.cr = 0; Y.crAt = now; } }
    // ---- walking (Yuji's own speeds; he always looks at Meguna; blocking and crouching are slower or still)
    if (go && !Y.blk && !Y.atk && !Y.dash && !Y.hurt && !Y.fly) {
      const toward = dirIn === Y.face, v = dirIn ? (toward ? FWD_SPEED : BACK_SPEED) * (Y.cr === 1 ? 0.5 : 1) : 0; if (!Y.jump) { Y.x += dirIn * v * dt; if (dirIn) { const ph = Y.ph, np = ph + dt * WALK_FPS * (Y.cr === 1 ? 0.6 : 1) * (toward ? 1 : -1); Y.ph = ((np % 15) + 15) % 15; for (const s of [3, 11]) if (Math.floor(ph) !== Math.floor(Y.ph) && Math.floor(Y.ph) === s && Y.cr === 0) snd('step', s === 3 ? 0 : 1, false); } }
    }
  }
  Y.x = c4xClamp(Y.x, C4X.arL + 8, C4X.arR - 8);
  if (!Y.atk && !Y.fly && !Y.hurt && !Y.dash) Y.face = Math.sign(M.x - Y.x) || Y.face;
  if (Y.white > 0) Y.white = now - Y.hitAt < 70 ? 1 : 0;
  if (Y.guard && now - (Y.guardAt || 0) > 1500) Y.guard = 0;
}
function c4xYDash(c, now, dir, brk) {
  const Y = c.y; dir = dir > 0 ? 1 : -1; const toward = dir === Y.face, to = c4xClamp(Y.x + dir * (toward ? DASH_FWD : DASH_BACK), C4X.arL + 8, C4X.arR - 8);
  Y.dash = { t0: now, from: Y.x, to, k: toward ? 0 : 1, dir }; Y.dashCd = now + 700; Y.inv = now + (brk ? 260 : 130); Y.jump = null; Y.lift = 0; Y.atk = null; Y.blk = false; Y.crTog = false; Y.cr = 0;
  snd('dash', toward ? 0 : 1); puff(Y.x - dir * 5, 3); c4xLog(c, now, toward ? 'dashIn' : 'dashOut');
}
function c4xYAttack(c, now, kind) {
  const Y = c.y, M = c.m, S = C4YJ[kind], rel = (M.x - Y.x) * Y.face, mv = M.st === 'walk' ? M.walk * M.wspd : 0, imp = S.imp / S.fps;
  let tx = M.x + (M.dash ? 0 : mv) * imp; tx = c4xClamp(tx, Y.x + Y.face * 12, Y.x + Y.face * (S.reach + S.lunge));      // (the ring: on him, led by the way he is walking, and not further than the fist can reach)
  const lg = kind === 'k' ? 0 : c4xClamp(((tx - Y.x) * Y.face) - S.reach + 6, 0, S.lunge);
  Y.atk = { kind, t0: now, hit: false, whiff: false, x0: Y.x, dir: Y.face, lg, ringX: tx, ringL: M.lift };
  Y.blk = false; snd('charge'); c4xLog(c, now, rel > 55 ? 'bfFar' : 'bf'); if (kind !== 'k') Y.jump = null;
  void rel;
}
function c4xYImpact(c, now, a) {      // the impact picture of a Black Flash: does it land, and is it a perfect one
  const F = c.F, Y = c.y, M = c.m, S = C4YJ[a.kind], fx = Y.x + Y.face * S.reach, dx = (M.x - Y.x) * Y.face;
  const inX = Math.abs(M.x - fx) <= C4X.hw + 5 && dx > -4, y0 = Y.lift + S.y0, y1 = Y.lift + S.y1, inY = y1 >= M.lift && y0 <= M.lift + 54;
  snd('swing', 3);
  if (!inX || !inY) { a.whiff = true; c4xLog(c, now, 'whiff'); return; }
  if (M.sink >= 0.5 || now < M.inv || (M.sk && M.sk.ph !== 'up')) { a.whiff = true; say('DODGED', M.x, '#9fd8ff', 8, now); c4xLog(c, now, 'whiff'); return; }
  const perfect = Math.abs(M.x - a.ringX) <= 13 && Math.abs(M.lift - a.ringL) <= 16 && !M.hurt, dmgF = S.dmg, blocking = now < M.blk && M.face === -Y.face;
  if (blocking && !perfect) { say('BLOCKED', M.x, '#9fd8ff', 8, now); snd('block'); M.vx += Y.face * 40; M.guard++; shakeUntil = now + 70; shakeAmp = 1; hitStop(40); a.hit = true; return; }
  if (perfect) {
    const dm = blocking ? Math.round(dmgF * 0.6) : dmgF; bfFx(now, M.x, 20 + (a.kind === 'k' ? 1 : a.kind === 'g' ? 2 : 0)); snd('hit', 3); snd('smack', 3); snd('yfbf'); shakeUntil = now + 360; shakeAmp = 5; flash(now, 120, 0.4); buzz(90);
    if (blocking) say('GUARD BREAK', M.x, '#ffd34d', 8, now + 90);
    c4xMHurt(c, now, dm, 'h9', 220 * Y.face, 526); F.bfN++; c4xLog(c, now, 'hit'); return;
  }
  const dm = Math.max(1, Math.round(dmgF * 0.25)); say('WEAK', M.x, '#9a9ab0', 8, now); snd('hit', 0); snd('smack', 0); spark(M.x - Y.face * 6, gy - 30, 6, ['#ffffff', '#ffe9a0', '#ff9a8a'], false, Y.face); hitStop(45); shakeUntil = now + 90; shakeAmp = 1;
  c4xMHurt(c, now, dm, 'h0', 55 * Y.face, 420); F.weakN++; c4xLog(c, now, 'hit');
}

// ---- MEGUNA (the enemy): the body (c4xMStep) and the brain (c4xThink)
function c4xMHurt(c, now, dm, row, push, ms) {
  const F = c.F, M = c.m; F.mhp = Math.max(0, F.mhp - dm); F.mhitAt = now; M.hitAt = now; M.white = 1; M.vx += push; M.atk = null; M.dash = null; M.jump = null; M.sk = null; M.sink = 0; M.lift = 0; M.blk = 0; M.plan = null; M.walk = 0;
  M.hurt = { t0: now, row, ms }; M.st = 'hurt'; M.inv = 0; say('' + dm, M.x, '#ffd34d', 8, now);
  if (F.mhp <= F.half && F.ph === 'go') c4xWin(now);
}
function c4xMBlow(c, now, B) {      // the impact picture of a blow of Meguna's: true when it hit or was blocked (the chain goes on)
  const Y = c.y, M = c.m, P = c4xAIP(), dist = Math.abs(Y.x - M.x), front = (Y.x - M.x) * M.face > -4, reach = B.reach + C4X.hw + 2;
  snd('swing', B.snd);
  if (!front || dist > reach) return false;
  if (B.high && Y.cr === 1) { say('DUCKED', Y.x, '#9fd8ff', 8, now); return false; }
  if (now < Y.inv || Y.fly) return false;
  const dm = Math.max(1, Math.round(B.dmg * P.dmg));
  if (Y.blk && (Y.x - M.x) * M.face > 0) {      // (he guards: the jabs and the elbow cost him a little; the face kick and the fourth blocked blow break the guard: he reels for a moment, with a little damage)
    Y.guard++; Y.guardAt = now; const brk = B.brk || Y.guard >= 4; snd('block'); shakeUntil = now + 70; shakeAmp = 1; hitStop(brk ? 60 : 30);
    if (!brk) { c4xYHp(c, now, Math.max(1, Math.round(dm * 0.12))); Y.vx += M.face * B.push * 1.2; say('BLOCKED', Y.x, '#9fd8ff', 8, now); return true; }
    c4xYHp(c, now, Math.max(1, Math.round(dm * 0.35))); c4xYHit(c, now, 0, 2, 'GUARD BREAK', B); return true;
  }
  c4xYHit(c, now, dm, B.rx, '', B); return true;
}
function c4xYHp(c, now, dm) { const F = c.F; F.hp = Math.max(0, F.hp - dm); F.hitAt = now; if (F.hp <= 0 && F.ph === 'go') c4xLose(now); }
function c4xYHit(c, now, dm, rx, txt, B) {
  const Y = c.y, M = c.m; Y.hurt = { t0: now, rx, ms: c4xRxMs(rx) }; Y.atk = null; Y.dash = null; Y.blk = false; Y.crTog = false; Y.cr = 0; Y.jump = null; Y.lift = 0; Y.hitAt = now; Y.white = 1; Y.vx += M.face * (B ? B.push : 30); Y.guard = 0;
  if (dm > 0) { snd('hit', B ? B.snd : 0); snd('hurt', 1); say('' + dm, Y.x, '#ff9a5a', 8, now); hitStop(B && B.brk ? 70 : 45); shakeUntil = now + (B && B.brk ? 160 : 90); shakeAmp = B && B.brk ? 3 : 1; buzz(B && B.brk ? 40 : 20); spark(Y.x + M.face * -6, gy - 30, B && B.brk ? 12 : 7, ['#ffffff', '#ffb09a', '#ff6a5a'], !!(B && B.brk), -M.face); c4xLog(c, now, 'hurt'); c4xYHp(c, now, dm); }
  if (txt) say(txt, Y.x, '#ffd34d', 8, now + 60);
}
function c4xMGo(c, now, k, a, b) {      // Meguna starts something
  const M = c.m, Y = c.y; M.plan = null; M.walk = 0; if (k !== 'block') M.blk = 0;
  if (k === 'chain') { const n = a, seq = n >= 4 ? [0, 1, 2, 3] : n === 3 ? [0, 1, 3] : [0, 3]; M.atk = { seq, i: 0, t0: now, hit: false, ok: true }; M.st = 'atk'; }
  else if (k === 'dash') { const toward = a > 0, dir = (toward ? 1 : -1) * M.face, len = toward ? c4xClamp((Y.x - M.x) * M.face - 26, 0, DASH_FWD) : DASH_BACK, to = c4xClamp(M.x + dir * len, C4X.arL + 8, C4X.arR - 8); M.dash = { t0: now, from: M.x, to, toward }; M.st = 'dash'; M.dashCd = now + 850 / c4xAIP().spd; M.inv = now + 130; snd('dash', toward ? 0 : 1); puff(M.x - dir * 5, 3); }
  else if (k === 'jump') { M.jump = { t0: now, vx: a * M.face * 70 }; M.st = 'jump'; snd('jump'); }
  else if (k === 'block') { M.blk = now + a; M.blkAt = now; M.st = 'block'; }
  else if (k === 'sink') { M.sk = { ph: 'in', t0: now, x: M.x }; M.st = 'sink'; M.sinkCd = now + C4_SINK.cd * 1000 / c4xAIP().spd; snd('vanish'); }
}
function c4xMStep(c, now, dt) {
  const F = c.F, M = c.m, Y = c.y, P = c4xAIP(), go = F.ph === 'go';
  M.x += M.vx * dt; M.vx *= Math.exp(-5 * dt); if (Math.abs(M.vx) < 1) M.vx = 0;
  if (M.hurt && now >= M.hurt.t0 + M.hurt.ms) { M.hurt = null; M.st = 'idle'; M.actAt = Math.max(M.actAt, now + 120 / P.spd); }
  if (M.white > 0 && now - M.hitAt > 70) M.white = 0;
  const free = !M.hurt && !M.atk && !M.dash && !M.jump && !M.sk;
  if (M.st === 'block' && now >= M.blk) { M.st = 'idle'; M.actAt = Math.max(M.actAt, now + 80); }
  if (M.st === 'walk' && !M.walk) M.st = 'idle';
  if (free && go) {      // ---- the brain
    c4xThink(c, now);
    if (!M.atk && !M.dash && !M.sk && !M.jump) { if (!M.plan && M.st !== 'block' && now >= M.actAt) c4xNeutral(c, now); if (M.plan) c4xPlan(c, now); }
  }
  if (!free || !go) M.walk = 0;
  // ---- walking
  if (free && M.st !== 'block' && M.walk) { const v = M.walk * M.wspd; M.x += v * dt; M.st = 'walk'; M.ph = ((M.ph || 0) + dt * WALK_FPS * Math.sign(M.walk * M.face) * (M.walk * M.face < 0 ? 0.9 : 1)); M.ph = ((M.ph % 15) + 15) % 15; }
  // ---- the blows
  if (M.atk) {
    const a = M.atk, B = C4MB[a.seq[a.i]], e = (now - a.t0) / 1000, f = e * B.fps * P.spd;
    if (e < 0.12) M.x += M.face * B.step * dt / 0.12;
    if (!a.hit && f >= B.imp) { a.hit = true; a.ok = c4xMBlow(c, now, B); }
    const more = a.i < a.seq.length - 1, cut = a.ok && more ? 11 : 15;
    if (f >= cut) { if (a.ok && more) { a.i++; a.t0 = now; a.hit = false; } else { M.atk = null; M.st = 'idle'; M.actAt = now + (a.ok ? 160 : 90) / P.spd; } }
  }
  // ---- the dash
  if (M.dash) { const d = M.dash, u = (now - d.t0) / DASH_MS; M.x = d.from + (d.to - d.from) * c4xOut(u); if (now - d.t0 >= 300) { M.dash = null; M.st = 'idle'; M.actAt = Math.max(M.actAt, now + 60); } }
  // ---- the jump
  if (M.jump) {
    const e = now - M.jump.t0, fi = jumpFrame(e); if (fi >= 15) { M.jump = null; M.lift = 0; M.st = 'idle'; M.actAt = Math.max(M.actAt, now + 80); } else { M.lift = YU.jump.lift[fi] || 0; if (e >= JUMP_T.crouch && e < JUMP_T.crouch + JUMP_T.air) M.x += M.jump.vx * dt; }
  }
  // ---- the shadow sink: sink (he cannot be hurt), the pool slides to Yuji, it waits under his feet with a ring, the uppercut comes up
  if (M.sk) {
    const k = M.sk, e = (now - k.t0) / 1000;
    if (k.ph === 'in') { M.sink = c4xEase(e / C4_SINK.in); M.inv = now + 100; if (e >= C4_SINK.in) { k.ph = 'travel'; k.t0 = now; k.x = M.x; M.sink = 1; } }
    else if (k.ph === 'travel') { const tg = Y.x, dx = tg - k.x, step = 190 * P.spd * dt; k.x += Math.abs(dx) <= step ? dx : Math.sign(dx) * step; M.x = k.x; M.inv = now + 100; if (e >= C4_SINK.travel * 0.6 && Math.abs(Y.x - k.x) < 4 || e >= C4_SINK.travel) { k.ph = 'warn'; k.t0 = now; k.fx = k.x; } }
    else if (k.ph === 'warn') { M.x = k.fx; M.inv = now + 100; if (e >= C4_SINK.warn / P.spd) { k.ph = 'up'; k.t0 = now; k.hit = false; M.face = Math.sign(Y.x - M.x) || M.face; snd('arrive'); shakeUntil = now + 100; shakeAmp = 1; } }
    else if (k.ph === 'up') {
      M.sink = Math.max(0, 1 - e / 0.1); M.inv = M.sink > 0 ? now + 50 : 0;
      if (!k.hit && e >= C4_SINK.up) { k.hit = true; if (Math.abs(Y.x - k.fx) <= 17 && Y.lift < 12 && now >= Y.inv && !Y.fly && !Y.dash) { c4xYLaunch(c, now); } else if (Math.abs(Y.x - k.fx) <= 17 && Y.lift >= 12) say('MISSED', Y.x, '#9fd8ff', 8, now); }
      if (e >= 15 / 38) { M.sk = null; M.st = 'idle'; M.sink = 0; M.actAt = now + 250 / P.spd; }
    }
  }
  M.x = c4xClamp(M.x, C4X.arL + 8, C4X.arR - 8);
  if (free && go && M.st !== 'block') M.face = Math.sign(Y.x - M.x) || M.face;
}
function c4xYLaunch(c, now) {
  const Y = c.y, M = c.m, dm = C4_SINK.dmg; Y.fly = { t0: now, v0: 130, g: 430, dir: M.face }; Y.hurt = null; Y.atk = null; Y.dash = null; Y.blk = false; Y.jump = null; Y.cr = 0; Y.crTog = false; Y.inv = now + 1400; Y.hitAt = now; Y.white = 1;
  snd('hit', 3); snd('smack', 3); hitStop(70); buzz(60); shakeUntil = now + 220; shakeAmp = 3; flash(now, 80, 0.25); say('' + dm, Y.x, '#ff9a5a', 8, now); spark(Y.x, gy - 20, 14, ['#ffffff', '#ffb09a', '#ff6a5a'], true, -M.face); c4xYHp(c, now, dm);
}

// ---- the brain
function c4xSee(F, t) { const h = F.hist; for (let i = h.length - 1; i >= 0; i--) if (h[i].t <= t) return h[i]; return h[0] || F.snap; }      // (Yuji as he was at the time t: the newest picture of him that is not newer)
function c4xHab(F, now, k, rt, win) { let n = 0; for (const e of F.log) if (e.k === k && e.t <= now - rt * 1000 && e.t > now - (win || 9000)) n++; return n; }      // (how often he has done k in the last seconds, as far as Meguna has seen)
function c4xEvade(c, now, P, S, d) {      // a Black Flash is coming: what to do about it
  const M = c.m, opts = [];
  if (now >= M.dashCd) opts.push(['dash', 3]);
  if (now >= M.sinkCd) opts.push(['sink', 0.5 + 0.4 * P.L]);
  opts.push(['block', now >= M.dashCd ? 0.5 : 2]);
  let tot = 0; for (const o of opts) tot += o[1]; let r = Math.random() * tot, pick = opts[0][0]; for (const o of opts) { r -= o[1]; if (r <= 0) { pick = o[0]; break; } }
  if (pick === 'dash') { c4xMGo(c, now, 'dash', -1); if (P.L >= 1) M.plan = { steps: [['wait', 80], ['dash', 1], ['chain', 3]], i: 0, t0: now, after: true }; } else if (pick === 'sink') c4xMGo(c, now, 'sink'); else c4xMGo(c, now, 'block', 650);
  void S; void d;
}
function c4xThink(c, now) {      // the reactions: every frame, on what Yuji's picture showed one reaction time (rt) ago
  const F = c.F, M = c.m, P = c4xAIP(), A = F.ai, S = c4xSee(F, now - P.rt * 1000), dx = S.x - M.x, d = Math.abs(dx), rel = Math.sign(dx) || M.face;
  if (M.st !== 'block') M.face = rel;
  const habBF = c4xHab(F, now, 'bf', P.rt) + c4xHab(F, now, 'bfFar', P.rt);
  // 1. a Black Flash is on its way (the wind-up is seen after his reaction time): dodge it, block it or sink; the better he is, the more often he does the right thing
  if (S.atk && !S.atkHit && !S.whiff && S.atkT0 !== A.seenAtk) {
    A.seenAtk = S.atkT0;
    const reach = C4YJ[S.kind].reach + C4YJ[S.kind].lunge + C4X.hw + 5, bonus = Math.min(0.2, 0.04 * habBF * (P.L >= 2 ? 1 : 0));
    if (d <= reach + 4 && Math.random() > P.mist && Math.random() < P.reactP + bonus) { c4xEvade(c, now, P, S, d); return; }
    if (d > reach + 4 && d <= 105 && now >= M.dashCd && Math.random() > P.mist && Math.random() < P.reactP) { c4xMGo(c, now, 'dash', 1); M.plan = { steps: [['chain', 3]], i: 0, t0: now, after: true }; return; }      // (a Black Flash that is going to miss: he is open for a moment: in with a dash and a chain, before the next one comes)
  }
  // 2. he has swung and missed: step in and punish if there is time; he has landed from a jump or reels from a blow: the same
  if (S.atk && S.whiff && S.atkT0 !== A.punished) {
    const left = S.atkT0 + S.atkMs - now;
    if (d <= 42 && left >= 190 / P.spd) { A.punished = S.atkT0; c4xMGo(c, now, 'chain', left > 380 ? 4 : 3); return; }
    if (d <= 100 && left >= 360 && now >= M.dashCd && P.L >= 1) { A.punished = S.atkT0; c4xMGo(c, now, 'dash', 1); M.plan = { steps: [['chain', 3]], i: 0, t0: now, after: true }; return; }
  }
  if (now - A.followAt > 500) {
    if (S.landing && d <= 50 && Math.random() < 0.5 + 0.08 * P.L) { A.followAt = now; c4xMGo(c, now, 'chain', 3); return; }
    if (S.hurt && d <= 64) { A.followAt = now; if (d > 40) { c4xMGo(c, now, 'dash', 1); M.plan = { steps: [['chain', 3]], i: 0, t0: now, after: true }; } else c4xMGo(c, now, 'chain', 3 + ((Math.random() * 2) | 0)); return; }
  }
}
function c4xNeutral(c, now) {      // nothing is going on: where to stand and what to start (every 0.1 - 0.35 s). Yuji's Black Flash reaches about 56 px: outside it Meguna stalks and baits, inside it he never stands still (a Black Flash on a target that moves is a weak one): he strikes first, steps away or guards
  const F = c.F, M = c.m, Y = c.y, P = c4xAIP(), S = c4xSee(F, now - P.rt * 1000), d = Math.abs(S.x - M.x), r = Math.random(), n = () => 2 + ((Math.random() * 3) | 0);
  M.actAt = now + (90 + Math.random() * 170) / P.spd;
  const habFar = c4xHab(F, now, 'bfFar', P.rt, 7000), habJump = c4xHab(F, now, 'jump', P.rt, 8000), wallM = M.x < C4X.arL + 40 || M.x > C4X.arR - 40;
  const sp = (FWD_SPEED + 4) * P.spd, st = (dir, w) => { M.walk = dir; M.wspd = sp * (w || 1); }, away = -M.face, rnd = () => (Math.random() < 0.5 ? 1 : -1) * M.face, chainAt = (steps) => { M.plan = { steps, i: 0, t0: now }; }, dashChain = () => { c4xMGo(c, now, 'dash', 1); M.plan = { steps: [['chain', n()]], i: 0, t0: now, after: true }; };
  if (S.blk && d <= 70 && now >= M.sinkCd && (P.L >= 1 || Math.random() < 0.3) && r < 0.12 + 0.05 * P.L) { c4xMGo(c, now, 'sink'); return; }      // (he turtles: the shadow comes up from under the guard)
  if (S.air && d <= 60 && P.L >= 2 && habJump >= 2 && r < 0.5) { if (now >= M.dashCd) c4xMGo(c, now, 'dash', -1); else st(away, 1); return; }      // (he jumps a lot: let him land)
  if (S.hurt || Y.fly) { if (d <= 56) c4xMGo(c, now, 'chain', 4); else if (now >= M.dashCd) dashChain(); else st(M.face, 1); return; }
  if (wallM && d < 70 && r < 0.45 && now >= M.sinkCd && P.L >= 2) { c4xMGo(c, now, 'sink'); return; }
  if (wallM && d < 62 && r < 0.5) { if (now >= M.dashCd && (M.x < 0) === (M.face > 0)) dashChain(); else c4xMGo(c, now, 'jump', 1); return; }      // (cornered: over him or through him)
  if (d > 100) {      // far: walk in, sometimes dash in
    if (now >= M.dashCd && r < 0.16 * P.aggr) { dashChain(); return; }
    if (now >= M.sinkCd && P.L >= 3 && r < 0.06) { c4xMGo(c, now, 'sink'); return; }
    st(M.face, 1); return;
  }
  if (d > 66) {      // just outside his Black Flash: stalk, stutter, feint, dash in
    if (r < 0.3) st(M.face, 0.8); else if (r < 0.5) st(rnd(), 0.6); else if (r < 0.62) chainAt([['walk', 1, 140], ['walk', -1, 170], ['wait', 60]]);
    else if (r < 0.62 + 0.14 * P.aggr && now >= M.dashCd && habFar < 2) dashChain();
    else if (r < 0.88 && habJump >= 2 && P.L >= 2) c4xMGo(c, now, 'jump', 1); else M.walk = 0;
    return;
  }
  if (d > 56) {      // the knife edge: a dash in, a quick poke, a step back or a guard
    if (r < 0.26 * P.aggr && now >= M.dashCd && habFar < 3) dashChain();
    else if (r < 0.26 * P.aggr + 0.2) chainAt([['walk', 1, 70], ['chain', n()]]);
    else if (r < 0.7) st(rnd(), 0.9); else if (r < 0.85) c4xMGo(c, now, 'block', 350 + Math.random() * 300); else st(away, 0.9);
    return;
  }
  if (d > 34) {      // inside his Black Flash, outside the jabs: strike first, leave, guard, or shuffle (never stand still)
    const strike = (0.4 + 0.05 * P.L) * P.aggr;
    if (r < strike) chainAt([['walk', 1, 50], ['chain', n()]]);
    else if (r < strike + 0.22) { if (now >= M.dashCd && Math.random() < 0.6) c4xMGo(c, now, 'dash', -1); else st(away, 1); }
    else if (r < strike + 0.34) c4xMGo(c, now, 'block', 350 + Math.random() * 300); else st(rnd(), 0.9);
    return;
  }
  // close: chain, leave, guard
  if (r < 0.62 * P.aggr) c4xMGo(c, now, 'chain', n());
  else if (r < 0.78) { if (now >= M.dashCd) c4xMGo(c, now, 'dash', -1); else st(away, 1); }
  else if (r < 0.9) c4xMGo(c, now, 'block', 350 + Math.random() * 300); else st(rnd(), 0.9);
}
function c4xPlan(c, now) {      // a short script of steps: ['walk', direction (1 = at him), ms], ['wait', ms], ['chain', n], ['dash', direction]
  const M = c.m, p = M.plan; if (!p) return; const P = c4xAIP(), s = p.steps[p.i];
  if (!s) { M.plan = null; return; }
  if (M.dash || M.jump) return;      // (a dash that is still going is part of the plan before it: wait for it)
  if (s[0] === 'chain') { M.plan = null; c4xMGo(c, now, 'chain', s[1]); return; }
  if (s[0] === 'dash') { const rest = p.steps.slice(p.i + 1); c4xMGo(c, now, 'dash', s[1]); if (rest.length) M.plan = { steps: rest, i: 0, t0: now }; return; }
  if (!p.st) p.st = now;
  if (s[0] === 'walk') { M.walk = s[1] * M.face; M.wspd = (FWD_SPEED + 4) * P.spd; if (now - p.st >= s[2] / P.spd) { p.i++; p.st = 0; M.walk = 0; } }
  else if (s[0] === 'wait') { M.walk = 0; if (now - p.st >= s[1] / P.spd) { p.i++; p.st = 0; } }
}
function c4xSeparate(c, dt) {      // two fighters on the floor do not stand inside each other; one in the air can pass over
  const Y = c.y, M = c.m, gap = 12; if (Y.lift > 6 || M.lift > 6 || Y.fly || M.sink > 0.2 || (M.sk && M.sk.ph !== 'up')) return; const dx = M.x - Y.x, ov = gap - Math.abs(dx); if (ov <= 0) return;
  const s = dx >= 0 ? 1 : -1, my = !!(Y.atk || Y.dash), mm = !!(M.atk || M.dash); const a = my && !mm ? 0 : mm && !my ? 1 : 0.5;
  M.x += s * ov * (1 - a) * Math.min(1, dt * 20); Y.x -= s * ov * a * Math.min(1, dt * 20);
}

// ---- poses
function c4xYPose(c, now) {
  const Y = c.y; Y.rot = 0; const idle = now / (1000 / IDLE_FPS);
  if (Y.fly) { const f = Y.fly, tau = (now - f.t0) / 1000, air = f.v0 * 2 / f.g; Y.pose = { set: 'rx', k: 4, fi: tau < air ? Math.min(9, tau / air * 9.9) : tau < air + 0.08 ? 10 + (tau - air) / 0.08 : 12 + 2.99 * Math.min(1, (tau - air - 0.08) / 0.2) }; return; }
  if (Y.hurt) { const h = Y.hurt; Y.pose = { set: 'rx', k: h.rx, fi: (now - h.t0) / 1000 * RXF15[h.rx] }; return; }
  if (Y.atk) { const a = Y.atk, S = C4YJ[a.kind]; Y.pose = { set: 'atk', k: S.k, fi: (now - a.t0) / 1000 * S.fps }; return; }
  if (Y.dash) { Y.pose = { set: 'dash', k: Y.dash.k, fi: (now - Y.dash.t0) / 1000 * 50 }; return; }
  if (Y.jump) { Y.pose = { set: 'jump', fi: jumpFrame(now - Y.jump.t0) }; return; }
  if (Y.blk) { Y.pose = { set: 'blk', fi: Math.min(9, (now - Y.blkAt) * BLK_FPS / 1000) }; return; }
  const cr = Y.cr === 1, dir = (keyR || padR ? 1 : 0) - (keyL || padL ? 1 : 0), moving = !!dir && c.F && c.F.ph === 'go' && now - Y.crAt > 300;
  if (cr || now - Y.crAt < 280) { const u = (now - Y.crAt) / 280; if (u < 1 && Y.crAt) { Y.pose = { set: 'cdn', fi: cr ? u * 14 : 14 - u * 14 }; return; } Y.pose = moving && cr ? { set: 'cfwd', fi: Y.ph } : { set: 'cidle', fi: idle }; return; }
  Y.pose = moving ? { set: 'fwd', fi: Y.ph } : { set: 'idle', fi: idle };      // (Y.ph runs backwards when he walks back)
}
function c4xMPose(c, now) {
  const M = c.m, P = c4xAIP(), idle = now / (1000 / IDLE_FPS); c.mFront = !!(M.atk || (M.sk && M.sk.ph === 'up')); M.rot = 0;
  if (M.hurt) { M.pose = { row: M.hurt.row, fi: (now - M.hurt.t0) / 1000 * (M.hurt.row === 'h9' ? 28.5 : 33) }; return; }
  if (M.sk) { const k = M.sk; M.pose = k.ph === 'up' ? { row: 'cp1', fi: (now - k.t0) / 1000 * SU_CP_FPS } : { row: 'frames', fi: idle }; return; }
  if (M.atk) { const a = M.atk, B = C4MB[a.seq[a.i]], f = (now - a.t0) / 1000 * B.fps * P.spd; M.pose = { row: B.row, fi: f }; M.lift = B.row === 'a2' ? (SU_KICK_LIFT[Math.max(0, Math.min(14, Math.floor(f)))] || 0) : 0; return; }
  if (M.dash) { M.pose = { row: M.dash.toward ? 'df' : 'dg', fi: (now - M.dash.t0) / 1000 * 50 }; return; }
  if (M.jump) { M.pose = { row: 'jump', fi: jumpFrame(now - M.jump.t0) }; return; }
  if (M.st === 'block') { M.pose = { row: 'bl', fi: Math.min(9, (now - M.blkAt) * BLK_FPS / 1000) }; return; }
  M.pose = M.st === 'walk' && M.walk ? { row: 'walk', fi: M.ph } : { row: 'frames', fi: idle };
}

// ---- the frame of the fight
function c4xFightStep(c, now, dt) {
  const F = c.F;
  if (F.ph === 'intro' && now - F.t0 >= 1300) { F.ph = 'go'; }
  if (F.ph !== 'over') { F.hist.push(c4xYSnap(c, now)); while (F.hist.length > 2 && F.hist[1].t < now - 800) F.hist.shift(); }
  c4xYStep(c, now, dt); c4xMStep(c, now, dt); c4xSeparate(c, dt);
  if (now - F.hitAt > 350) F.sh += (F.hp - F.sh) * Math.min(1, dt * 4); if (now - F.mhitAt > 350) F.msh += (F.mhp - F.msh) * Math.min(1, dt * 4);
  c4xYPose(c, now); c4xMPose(c, now); if (F.ph !== 'over') c4xFightFx(c, now);
  c.glow = null;
}
function c4xFightFx(c, now) {      // the ring of the Black Flash: it appears where the blow is going, grows brighter, and flashes just before the impact
  const Y = c.y, a = Y.atk; c.fx = [];
  if (a && !a.hit) { const S = C4YJ[a.kind], tImp = S.imp / S.fps * 1000, e = now - a.t0, k = Math.min(1, e / tImp), sx = c4xSX(a.ringX), sy = gy - S.ring - Math.round(a.ringL), bright = e >= tImp - 90;
    c.fx.push(() => { ctx.globalAlpha = bright ? 1 : 0.35 + 0.5 * k; c4xRing(sx, sy, 13, bright ? '#ffffff' : '#ff6a7a'); if (bright) c4xRing(sx, sy, 14, '#ff2a3a'); ctx.globalAlpha = 1; });
    const P = c4xYPic(Y.pose), h = P && c4xHand(Y, P); if (h && e > 40) c.glow = { x: h[0], y: h[1], r: 3 + ((now / 70) & 1), cols: C4_BF };
  }
  if (c.m.sk && (c.m.sk.ph === 'travel' || c.m.sk.ph === 'warn' || c.m.sk.ph === 'up')) { const k = c.m.sk; c.pool = [{ x: k.ph === 'up' ? k.fx : k.x, rx: k.ph === 'warn' ? 17 + 2 * Math.sin(now / 80) : k.ph === 'up' ? 17 * Math.max(0, 1 - (now - k.t0) / 400) : 15, a: 1 }];
    if (k.ph === 'warn') { const sx = c4xSX(k.fx); c.fx.push(() => { c4xRing(sx, gy + 3, 18 + Math.round(3 * Math.sin(now / 60)), '#9d8cff'); }); } }
  else if (c.m.sk) { const k = c.m.sk; c.pool = [{ x: k.x, rx: 14, a: 1 }]; } else c.pool = null;
}
function c4xHud(c, now) {
  const F = c.F, W0 = (b, x, y, f, g, right, W) => { ctx.fillStyle = '#000'; ctx.fillRect(x - 1, y - 1, W + 2, 8); ctx.fillStyle = '#3a1a2a'; ctx.fillRect(x, y, W, 6); const w1 = Math.round(W * g), w2 = Math.round(W * f); ctx.fillStyle = '#ffd27a'; ctx.fillRect(right ? x + W - w1 : x, y, w1, 6); ctx.fillStyle = f > 0.3 ? '#52e08a' : '#ff4a4a'; ctx.fillRect(right ? x + W - w2 : x, y, w2, 6); };
  const draw = VW => { const W = Math.max(60, Math.min(96, (VW - 52) >> 1)), pf = Math.max(0, F.hp) / PHP, ps = Math.max(0, F.sh) / PHP, mf = Math.max(0, F.mhp) / PHP, ms = Math.max(0, F.msh) / PHP;
    W0(0, 6, 20, pf, ps, false, W); W0(0, VW - 6 - W, 20, mf, ms, true, W);
    const hx = VW - 6 - W + Math.round(W * 0.5); ctx.fillStyle = '#ffffff'; ctx.fillRect(hx - 1, 17, 2, 13); ctx.fillStyle = '#000'; ctx.fillRect(hx - 1, 17, 1, 1);      // (the mark at half: bring him down to it)
    pxt('HALF', hx, 15, '#ffffff', 8, 'center'); pxt('YUJI', 6, 45, '#ffffff', 8); pxt('MEGUNA', VW - 6, 45, '#ffffff', 8, 'right'); pxt('CHAPTER 4', VW - 6, 55, '#ffd34d', 8, 'right'); };
  if (!safeC) draw(VW); else { ctx.save(); ctx.translate(safeC, 0); draw(VW - 2 * safeC); ctx.restore(); }
}
function c4xBanner(c, now) {
  const F = c.F; if (c.ph === 'fight' && F) {
    const a = now - F.t0; if (a < 1300) { const k = a < 200 ? a / 200 : a > 1000 ? (1300 - a) / 300 : 1; ctx.globalAlpha = Math.max(0, Math.min(1, k)); pxt('FIGHT!', VW / 2, Math.round(VH * 0.4), '#ffffff', 24, 'center'); ctx.globalAlpha = 1; }
    if (a >= 600 && a < 3800) { const k = a < 900 ? (a - 600) / 300 : a > 3500 ? (3800 - a) / 300 : 1; ctx.globalAlpha = Math.max(0, Math.min(1, k)); pxt('BRING MEGUNA TO HALF HEALTH', VW / 2, Math.round(VH * 0.4) + 14, '#ffd34d', 8, 'center'); ctx.globalAlpha = 1; }
  } else if (c.ph === 'ranos' && c.rs && c.rs.win) { const t = (now - c.t0) / 1000; if (t > 0.2 && t < 1.2) { ctx.globalAlpha = Math.min(1, (t - 0.2) / 0.2) * Math.min(1, (1.2 - t) / 0.3); pxt('HALF HEALTH!', VW / 2, Math.round(VH * 0.4), '#ffd34d', 16, 'center'); ctx.globalAlpha = 1; } }
}

// ---- the end of the fight: half health (a win) and no health (a loss) go on the same way: Ranos steps in (tools/chap4e.js)
function c4xWin(now) {      // the Black Flash that took Meguna to half health: the long freeze, the flash, and the lead-in of the Ranos scene
  const c = c4x; c.y.atk = c.y.dash = null; c.m.plan = null; c.F.mhp = c.F.half; c.F.msh = Math.max(c.F.half, c.F.msh);
  snd('finisher'); hitStop(150); slowMo(1100, 0.3); flash(now, 260, 0.7); buzz(120); shakeUntil = now + 420; shakeAmp = 4; c4xRanosStart(now, true);
}
function c4xLose(now) {      // Yuji's health is gone: Meguna's last blow punches him back (and no more), and Meguna comes for the slash
  const c = c4x, Y = c.y, M = c.m; Y.atk = Y.dash = null; Y.blk = false; Y.jump = null; Y.lift = 0; Y.fly = null; Y.hurt = { t0: now, rx: 9, ms: c4xRxMs(9) }; Y.vx += M.face * 150; M.plan = null; M.atk = null; M.dash = null; M.jump = null; M.sk = null; M.sink = 0; M.lift = 0; M.hurt = null; M.walk = 0; M.blk = 0;
  hitStop(110); slowMo(900, 0.35); buzz(120); c4xRanosStart(now, false);
}
