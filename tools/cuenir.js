// ================================================================ v1.211 IRON MAN'S OTHER MOVES AS THE ENEMY (this file is spliced into template.html by build_html.py, right after cuen.js, which calls it)
// The user, about the chapter 5 fight against Iron Man: "all his abilities but he uses his ultimate when he feels threatened" and, asked, "Everything, now". v1.208 gave the enemy Iron Man his four blows, the two repulsor bolts, the rocket uppercut, the low jabs and the UNIBEAM; here are the rest of what you can do when you play him, as the ENEMY's moves (they are in the Versus fights against him too, and in the ADMIN box of Training):
//   DOWNSLAM (data: the blow of tools/ironm.js, lifted now: he hangs in the air, dives and drives both fists down), CHARGE (the flying punch of chapter 5: he flies at you along the floor and the first time his fist touches you it is 14 damage, you are knocked down), BACKFLIP (data: he turns over backwards away from you, 70 px),
//   BLAST (tools/ironb.js: the arm comes up, the palm charges, a beam of blue light for 1.5 s that hurts you every 0.1 s as long as you stand in front of it: crouching or jumping lets it pass, a guard stops it), LASER (tools/ironp.js: the braced arm, the red beam exactly 2 pixels thick for 1 s: a guard does not stop it, one touch is 20 damage, a stun, and you bleed afterwards), SPIN BLAST (tools/ironb.js: he rises and turns in a T pose, both palms fire, the beams breathe in and out with every half turn: you are hurt while the one on your side reaches you),
//   GROUND PUNCH (tools/ironp.js, the street's version: the fist high, down into the floor, the road cracks towards you and a shock wave runs along it at 520 px a second: when it reaches you (within 200 px) you are thrown up a little and stunned; a jump passes over it, a guard does not stop it) and BEAR HUG (tools/ironh.js: he charges, grabs you, squeezes three times, carries you up, dives and slams you down: 30 damage. The half turn in mid-air that the player's version draws is not drawn here).
// They all play through the enemy engine of tools/cuen.js (d.fa = { type, k, at, ... }): CUIR[type] has start (when it begins), look (his picture and height at time t), act (every frame: his movement, the damage) and draw (the light and the beams, after him). The pictures are the ones his player-side moves are made from (g.bmp, g.blp, g.smp, g.bpp, g.bhp: ironMoves makes them with the rest); they face right and drawDummy turns them over, so a palm that is at column px of a picture is at 32 - px from his middle when he faces you on the left.
// The brain is cuirTry (cuen.js asks it every 0.35 - 0.8 s, after the UNIBEAM): which move he starts for how far you are, with its own cooldown and from the grade that is in CUIR_G (the fight of chapter 5 is grade 3: everything). A blow of yours ends the move he is making (freActEnd), as for every enemy.
const CUIR = {};      // (the moves by type)
const CUIR_G = { flip: 2, hug: 2, gp: 2, spin: 3, laser: 3, blast: 1, charge: 1, slam: 1 };      // (the first grade index each move is used from)
let cuirOk = false;
const cuirDir = () => dummy.x - wx > -4 ? -1 : 1, cuirPx = (sx, dir, px) => sx + (dir < 0 ? 32 - px : px - 32);      // (the way he faces: -1 = left, towards you; the screen column of the column px of the picture he is drawn with when his middle is at sx)
function cuirReg() {      // the hit numbers of the new moves (cuenNum: damage, knock-back on you, and { nb: nothing blocks it, heavy: the big fall }); a number in KICKS.cu5 hits a crouching you as a kick does
  if (cuirOk) return; cuirOk = true; const reg = (key, dm, kn, ex, low) => { CUEN_X[key] = cuenK++; cuenNum(CUEN_X[key], dm, kn, ex); if (low) KICKS.cu5.push(CUEN_X[key]); };
  reg('icharge', 14, 120, { heavy: true }); reg('iblast', 7, 14, {}); reg('ilaser', 20, 40, { nb: true }); reg('ispin', 6, 10, {}); reg('igp', 8, 0, { nb: true }, true);
}
function cuirHit(key, now) { const h = hurtAt; gojoHit(CUEN_X[key], now); return hurtAt !== h; }      // (one blow on you through the engine's own rules: true when it hurt you)
function cuirDive(g) { const t = irDive(34); [0.3, 0.65, 0.9].forEach((f, i) => { t[i] = Math.round(34 * f); }); g.al[5] = t; }      // (the DOWNSLAM starts on the floor: he rises during its first three pictures, hangs, dives onto you on the 8th and lands)
function cuirTry(now, gap, ag, G, g) {      // which of his other moves he starts now (true when one did); every move has a cooldown (ms) and a range
  const d = dummy, gi = vs.gi, S = d.sp = d.sp || {}, roll = p => Math.random() < p, can = k => gi >= CUIR_G[k] && now >= (S[k] === undefined ? d.born + 3000 : S[k]), use = (k, cd, type, kk) => { S[k] = now + cd; cuenStart(kk || 0, now, type); return true; };
  if (gap < -4) return false;      // (you are behind him: nothing that flies or fires forwards)
  if (ag <= 40 && can('flip') && now - (d.hitAt || -1e9) < 1200 && roll(0.4)) return use('flip', 9000, 'cu', 8);      // (you are on top of him and he was hit a moment ago: the BACKFLIP gets him out)
  if (ag <= 150 && can('hug') && roll(0.12)) return use('hug', 14000, 'ihug');
  if (ag >= 20 && ag <= 190 && can('gp') && roll(0.12)) return use('gp', 10000, 'igp');
  if (ag <= 280 && can('spin') && roll(0.1)) return use('spin', 13000, 'ispin');
  if (ag >= 100 && ag <= 330 && can('laser') && roll(0.1)) return use('laser', 14000, 'ilaser');
  if (ag >= 70 && ag <= 330 && can('blast') && roll(0.14)) return use('blast', 8000, 'iblast');
  if (ag >= 70 && ag <= 230 && can('charge') && roll(0.16)) return use('charge', 6000, 'icharge', 7);
  if (ag >= 14 && ag <= 52 && can('slam') && roll(0.14)) return use('slam', 6000, 'cu', 5);      // (the DOWNSLAM reaches 36 px and steps 12)
  return false;
}
// ---- the light: a ball in the palm that grows with sparks drawn into it, the flare of a beam, and the beam itself
function cuirCharge(px, py, k, now, c) {      // c = [outer, middle, inner] colours; k 0 - 1: how far the charge is
  const e = k * k * (3 - 2 * k), r = Math.round(1 + 7 * e); ctx.save();
  irbDisc(px, py, r + 4, c[0], 0.14 + 0.1 * e); irbDisc(px, py, r + 2, c[1], 0.3 + 0.2 * e); irbDisc(px, py, r, c[2], 0.85); irbDisc(px, py, Math.max(1, r - 3), '#ffffff', 1);
  ctx.fillStyle = c[2]; for (let i = 0; i < 12; i++) { const ph = (now * 0.0042 + i * 0.173) % 1, rad = (1 - ph) * 34 * (1.1 - 0.6 * e), an = i * 2.4 + now * 0.002; ctx.globalAlpha = 0.9 * ph; ctx.fillRect(Math.round(px + Math.cos(an) * rad), Math.round(py + Math.sin(an) * rad * 0.8), 2, 1); }
  ctx.restore(); ctx.globalAlpha = 1;
}
function cuirFlare(px, py, k, now, c) { const r = Math.round((6 + (Math.floor(now / 50) % 3)) * k); if (r < 1) return; irbDisc(px, py, r + 3, c, 0.2 * k); irbDisc(px, py, r, '#d8faff', 0.8 * k); irbDisc(px, py, Math.max(1, r - 3), '#ffffff', k); }
function cuirBeam(x0, yc, dir, len, k, now) {      // the blue beam of the BLAST (the layers of tools/ironb.js irbBack, to the left when dir is -1) from column x0 for len px, k 0 - 1 how far it has grown
  const th = Math.max(1, Math.round(IRB.th * k)), pulse = Math.floor(now / 45) % 3, L = Math.max(4, Math.round(len)), rect = (h, col) => { ctx.fillStyle = col; ctx.fillRect(dir < 0 ? x0 - L : x0, yc - h, L, h * 2 + 1); }; ctx.save();
  for (const [h, col] of [[th + 4, 'rgba(111,224,255,0.14)'], [th + 2, 'rgba(111,224,255,0.3)'], [th + (pulse === 1 ? 2 : 1), 'rgba(150,238,255,0.7)'], [Math.max(1, th - 1), 'rgba(222,252,255,0.96)'], [Math.max(1, th - 3), '#ffffff']]) rect(h, col);
  ctx.fillStyle = 'rgba(255,255,255,0.85)'; for (let i = 0; i < 12; i++) { const o = Math.round((i * 61 + now * 1.3) % L); ctx.fillRect(dir < 0 ? x0 - o - 6 : x0 + o, yc + ((i * 5) % 7) - 3, 6 + (i % 3) * 4, 1); }
  if (!SET.lite) { ctx.fillStyle = 'rgba(190,245,255,0.8)'; for (let i = 0; i < 14; i++) ctx.fillRect(dir < 0 ? x0 - Math.floor(Math.random() * L) : x0 + Math.floor(Math.random() * L), yc + (Math.random() < 0.5 ? -1 : 1) * (th + 2 + Math.floor(Math.random() * 4)), 1 + Math.floor(Math.random() * 3), 1); }
  ctx.restore();
}
// ---- BLAST and LASER: the same four phases (raise, charge, fire, lower: IRB and IRL have the times), pictures of g.bmp / g.blp
function cuirRay(P, T, t) {      // [the picture, the phase, how far through it (0 - 1), ms into it] of a ray move at time t
  let u = t; if (u < T.raise) return [P.rz[Math.min(3, Math.floor(u / T.raise * 4))], 'raise', u / T.raise, u];
  u -= T.raise; if (u < T.charge) return [P.ch[Math.floor(u / 90) % 2], 'charge', u / T.charge, u];
  u -= T.charge; if (u < T.fire) return [P.fi[Math.floor(u / 60) % 2], 'fire', u / T.fire, u];
  u -= T.fire; if (u < T.lower) return [P.lo[Math.min(3, Math.floor(u / T.lower * 4))], 'lower', u / T.lower, u];
  return [P.lo[3], 'end', 1, u];
}
CUIR.iblast = {
  start(a, now, g) { if (!g.bmp) irbPics(g); a.tk = 0; a.sn = 0; a.ch = false; a.on = false; snd('thrust', 0.5); },
  look(a, t, g) { return { src: cuirRay(g.bmp, IRB, t)[0] }; },
  act(a, t, now, dt, gap, ag, toward, G, g) {      // the beam hurts you every 0.1 s (15 times) while you stand in front of him: a guard stops it, crouching or jumping lets it pass (gojoHit's rules)
    const [, ph, , u] = cuirRay(g.bmp, IRB, t);
    if (ph === 'charge' && !a.ch) { a.ch = true; snd('redcharge'); snd('thrust', 0.9); }
    if (ph === 'fire') {
      if (!a.on) { a.on = true; snd('redfire'); snd('thrust', 1.5); flash(now, 120, 0.22); shakeUntil = Math.max(shakeUntil, now + 200); shakeAmp = Math.max(shakeAmp, 3); }
      while (a.tk < IRB.ticks && u >= IRB.t0 + a.tk * IRB.tick) { a.tk++; if (gap > -4 && ag <= 330) cuirHit('iblast', now); }
      shakeUntil = Math.max(shakeUntil, now + 80); shakeAmp = Math.max(shakeAmp, 1); if (u >= a.sn) { snd('cecrackle'); a.sn = u + 230; }
    }
    if (ph === 'end') cuenEnd(now);
  },
  draw(a, now, d, cx, g) {
    const [pic, ph, k, u] = cuirRay(g.bmp, IRB, now - a.at); if (!pic.palm) return; const dir = cuirDir(), sx = cx + Math.round(d.x - wx), x0 = cuirPx(sx, dir, pic.palm.px) + dir * 2, yc = gy - 61 + pic.palm.py + 1;
    if (ph === 'charge') cuirCharge(x0 - dir, yc, k, now, ['#6fe0ff', '#8fe9ff', '#d8faff']);
    else if (ph === 'fire' || (ph === 'lower' && u < 200)) { const kk = ph === 'fire' ? Math.min(1, u / 70) : Math.max(0, 1 - u / 200); if (kk > 0) { cuirBeam(x0, yc, dir, (dir < 0 ? x0 + 6 : VW - x0 + 6) * kk, kk, now); cuirFlare(x0 - dir, yc, kk, now, '#6fe0ff'); } }
  }
};
CUIR.ilaser = {
  start(a, now, g) { if (!g.blp) irlPics(g); a.on = false; a.hit = false; a.ch = false; snd('thrust', 0.5); },
  look(a, t, g) { return { src: cuirRay(g.blp, IRL, t)[0] }; },
  act(a, t, now, dt, gap, ag, toward, G, g) {      // one touch in the first 30 ms of the beam pierces you: 20 damage, the engine's stun, and then you bleed (2 damage every 0.5 s for 4 s)
    const [, ph, , u] = cuirRay(g.blp, IRL, t);
    if (ph === 'charge' && !a.ch) { a.ch = true; snd('redcharge'); snd('thrust', 0.9); }
    if (ph === 'fire') {
      if (!a.on) { a.on = true; snd('redfire'); snd('thrust', 1.5); flash(now, 100, 0.2); shakeUntil = Math.max(shakeUntil, now + 160); shakeAmp = Math.max(shakeAmp, 2); }
      if (!a.hit && u >= IRL.t0) { a.hit = true; if (gap > -4 && ag <= 360 && cuirHit('ilaser', now)) { say('PIERCED', wx, '#ff4a4a', 8, now + 80); pStun = Math.max(pStun, now + 1200); dotStart('p', 'bleed', { until: now + IRL.bleedMs, next: now + 250, gap: 250 }, now); snd('c4crunch'); } }
    }
    if (ph === 'end') cuenEnd(now);
  },
  draw(a, now, d, cx, g) {
    const [pic, ph, k, u] = cuirRay(g.blp, IRL, now - a.at); if (!pic.palm) return; const dir = cuirDir(), sx = cx + Math.round(d.x - wx), x0 = cuirPx(sx, dir, pic.palm.px) + dir * 2, yc = gy - 61 + pic.palm.py + 1;
    if (ph === 'charge') { const e = k * k * (3 - 2 * k), r = Math.round(9 - 7 * e); ctx.fillStyle = 'rgba(255,60,60,0.5)'; for (let i = 0; i < 24; i++) { const an = i / 24 * 6.2832 + now * 0.004; ctx.fillRect(Math.round(x0 - dir + Math.cos(an) * r), Math.round(yc + Math.sin(an) * r * 0.8), 1, 1); } cuirCharge(x0 - dir, yc, k * 0.7, now, ['#ff4a4a', '#ff7a6a', '#ffd0c8']); }
    else if (ph === 'fire' || (ph === 'lower' && u < 150)) { const kk = ph === 'fire' ? Math.min(1, u / 40) : Math.max(0, 1 - u / 150); if (kk > 0) { const L = Math.round((dir < 0 ? x0 + 6 : VW - x0 + 6) * kk), xs = dir < 0 ? x0 - L : x0; ctx.fillStyle = '#fff0ea'; ctx.fillRect(xs, yc - 1, L, 1); ctx.fillStyle = '#ff2a3a'; ctx.fillRect(xs, yc, L, 1); cuirFlare(x0 - dir, yc, kk * 0.7, now, '#ff4a4a'); } }
  }
};
// ---- SPIN BLAST: g.smp (irsPics): the arms swinging out (rz), then the T pose turning (sp[0] looking right, sp[1] turned over, A pictures from full arms to none)
const cuirSpinT = () => ({ raise: IRS.raise, spin: IRS.raise + IRS.spin, wind: IRS.raise + IRS.spin + IRS.wind, drop: IRS.raise + IRS.spin + IRS.wind + 140, end: IRS.raise + IRS.spin + IRS.wind + 140 + IRS.land });
CUIR.ispin = {
  start(a, now, g) { if (!g.smp) irsPics(g); a.tk = 0; a.sn = 0; a.on = false; a.lift = 0; snd('thrust', 0.9); },
  look(a, t, g) {
    const P = g.smp, T = cuirSpinT(); let src, lift = 0;
    if (t < T.raise) { const k = t / IRS.raise, e = k * k * (3 - 2 * k); lift = IRS.hover * e; src = P.rz[Math.min(P.rz.length - 1, Math.floor(k * P.rz.length))]; }
    else if (t < T.wind) { const u = t - T.raise, c = Math.cos(2 * Math.PI * u / IRS.rev), n = P.sp[0].length - 1; lift = t < T.spin ? IRS.hover + 0.4 * Math.sin(u / 70) : IRS.hover; src = P.sp[c < 0 ? 1 : 0][Math.round(Math.acos(Math.min(1, Math.abs(c))) / (Math.PI / 2) * n)]; }
    else if (t < T.drop) { const u = (t - T.wind) / 1000; lift = Math.max(0, IRS.hover - 0.5 * IRS.g * u * u); src = g.jump[Math.min(g.jump.length - 1, 8 + Math.floor(u * 1000 / 60))]; }
    else { src = g.jump[g.jump.length - 1]; }
    a.lift = lift; return { src, lift };
  },
  act(a, t, now, dt, gap, ag, toward, G, g) {      // every 0.1 s (16 times) the beams are as long as the turn lets them: you are hurt while the one on your side reaches you
    const T = cuirSpinT(), u = t - IRS.raise;
    if (!a.on && t >= IRS.raise) { a.on = true; snd('redfire'); snd('thrust', 1.5); flash(now, 120, 0.22); shakeUntil = Math.max(shakeUntil, now + 200); shakeAmp = Math.max(shakeAmp, 3); gritAt(dummy.x - 8, 10, 100, -1); gritAt(dummy.x + 8, 10, 100, 1); }
    if (t >= IRS.raise && t < T.spin) {
      while (a.tk < IRS.ticks && u >= IRS.t0 + a.tk * IRS.tick) { const q = Math.abs(Math.cos(2 * Math.PI * (IRS.t0 + a.tk * IRS.tick) / IRS.rev)), reach = Math.round(g.smp.tip * q) + 2 + Math.round(IRS.len * q); a.tk++; if (ag <= reach) cuirHit('ispin', now); }
      shakeUntil = Math.max(shakeUntil, now + 80); shakeAmp = Math.max(shakeAmp, 1); if (u >= a.sn) { snd('cecrackle'); a.sn = u + 230; }
    }
    if (t >= T.drop && !a.ld) { a.ld = true; snd('land', 1); puff(dummy.x - 6, 5); puff(dummy.x + 6, 5); gritAt(dummy.x, 8, 90, 0); }
    if (t >= T.end) cuenEnd(now);
  },
  draw(a, now, d, cx, g) {
    const T = cuirSpinT(), t = now - a.at; if (t < IRS.raise || t > T.wind + 200) return; const u = t - IRS.raise, sx = cx + Math.round(d.x - wx), yc = gy - 61 + g.smp.py - Math.round(a.lift || 0) - 1;
    const q = t < T.spin ? Math.abs(Math.cos(2 * Math.PI * u / IRS.rev)) : 0, kk = t < T.spin ? Math.min(1, u / 70) : Math.max(0, 1 - (t - T.spin) / 100), tip = Math.round(g.smp.tip * q) + 2, len = Math.round(IRS.len * q * kk);
    if (len > 3) { cuirBeam(sx - tip, yc, -1, len, kk, now); cuirBeam(sx + tip, yc, 1, len, kk, now); }
    if (kk > 0) { cuirFlare(sx - tip, yc, kk * q, now, '#6fe0ff'); cuirFlare(sx + tip, yc, kk * q, now, '#6fe0ff'); }
  }
};
// ---- GROUND PUNCH (the street's): g.bpp (irpPics): the fist goes up (gw 4), into the ground (gs 2), he stands up again (gr 4)
const cuirGpT = () => ({ wind: IRP.wind, hold: IRP.wind + IRP.hold, slam: IRP.wind + IRP.hold + 300, end: IRP.wind + IRP.hold + 300 + 260 });
CUIR.igp = {
  start(a, now, g) { a.hit = false; a.im = false; snd('thrust', 0.4); },
  look(a, t, g) { const T = cuirGpT(), P = g.bpp; return { src: t < T.wind ? P.gw[Math.min(3, Math.floor(t / T.wind * 4))] : t < T.hold ? P.gw[3] : t < T.slam ? P.gs[Math.floor((t - T.hold) / 120) % 2] : P.gr[Math.min(3, Math.floor((t - T.slam) / 65))] }; },
  act(a, t, now, dt, gap, ag, toward, G, g) {
    const T = cuirGpT(), d = dummy, dir = cuirDir();
    if (!a.im && t >= T.hold) { a.im = true; a.x0 = d.x + dir * 14; d.cuirCr = { x: a.x0, dir, at: now, len: 0 }; snd('concboom'); snd('land', 2); puff(a.x0, 8); gritAt(a.x0, 12, 120, 0); shockAt(a.x0, 220, 120, 0.9); shakeUntil = Math.max(shakeUntil, now + 260); shakeAmp = Math.max(shakeAmp, 3); }
    if (a.im && !a.hit) {      // the shock wave runs along the floor towards you: when it reaches you, you are thrown off balance
      const s = (t - T.hold) / 1000 * IRP.wave; if (d.cuirCr) d.cuirCr.len = Math.min(IRP.range, s);
      if (gap > -4 && s >= ag - 10) { a.hit = true; if (ag <= IRP.range && gojoLift <= 12 && !gAir && cuirHit('igp', now)) { gAir = airMake(now, 0, Math.sqrt(2 * AIR_G * 16), AIR_G, 'up'); hurtK = AIR_RX; pStun = Math.max(pStun, now + 1200); say('OFF BALANCE', wx, '#ffd34d', 8, now + 80); } }
    }
    if (t >= T.end) cuenEnd(now);
  },
  draw() { }
};
function cuirWorld(now, d, cx) {      // what a move left behind: the cracks of the ground punch, drawn from where the fist hit towards you, they fade in 2.5 s
  const c = d.cuirCr; if (!c) return; const age = now - c.at; if (age > 2500) { d.cuirCr = null; return; }
  const al = age < 1800 ? 1 : 1 - (age - 1800) / 700, x0 = cx + Math.round(c.x - wx); ctx.save(); ctx.globalAlpha = al;
  for (let r = 0; r < 3; r++) { ctx.fillStyle = r === 1 ? '#3a404c' : '#14171d'; let y = gy + 2 + r * 2, x = x0; for (let s = 0; s < c.len; s += 3) { x += c.dir * 3; y += ((Math.imul(s + r * 31, 2654435761) >>> 24) % 3) - 1; y = Math.max(gy + 1, Math.min(gy + 8, y)); ctx.fillRect(x, y, 3, 1); } }
  const sh = c.len; ctx.fillStyle = 'rgba(255,240,200,0.55)'; ctx.fillRect(x0 + c.dir * sh - 1, gy - 2, 2, 5); ctx.restore();
}
// ---- CHARGE: the flying punch of chapter 5 (g.atk[7]: 26 wide pictures, the flight is 7 - 17, IR_CHP: how far he has flown at each of them)
CUIR.icharge = {
  start(a, now, g) { a.lg = 0; a.done = false; a.s7 = false; a.s19 = false; },
  look(a, t, g) { const n = g.atk[7].length, ms = 1000 / (g.set[7].v * GRADES[vs.gi].spd), i = Math.min(n - 1, Math.floor(t / ms)); return { src: g.atk[7][i], lift: IR_BLOWS[7].lift[i] || 0 }; },
  act(a, t, now, dt, gap, ag, toward, G, g) {      // he flies along the floor at you, held back so that the fist never goes into you; the first picture of the flight on which the fist touches you is the one hit (14 damage, you are knocked down), and he stops
    const d = dummy, n = g.atk[7].length, ms = 1000 / (g.set[7].v * G.spd), uu = Math.min(n, t / ms), j = Math.min(n - 1, Math.floor(uu)), B = hbBody(hbMe()), reach = B && g.chTip[j] ? hbGap(g.chTip[j], B, 0) : 40;
    if (!a.s7 && j >= 7) { a.s7 = true; snd('thrust', 1); puff(d.x, 9); }
    let to = a.done ? a.lg : IR_CHP[j] + (IR_CHP[j + 1] - IR_CHP[j]) * (uu - j); if (!a.done) to = Math.min(to, a.lg + Math.max(0, ag - reach + 6));
    if (to > a.lg) { d.x += toward * (to - a.lg); a.lg = to; }
    if (!a.done && j >= 7 && j <= 17 && gap > -4 && ag <= reach) { a.done = true; cuirHit('icharge', now); }
    if (!a.s19 && j >= 19) { a.s19 = true; snd('land', 2); puff(d.x, 8); shakeUntil = Math.max(shakeUntil, now + 140); shakeAmp = Math.max(shakeAmp, 2); }
    if (t >= n * ms) cuenEnd(now);
  },
  draw() { }
};
// ---- BEAR HUG: g.bhp (irhPics): open, fly (wide), close, hug, up, land, skid. wind -> fly (520 px a second, up to 150) -> grab (0.17 s) -> hug (0.72 s, three squeezes) -> up (he carries you up) -> dive -> slam
const CUIR_HUG = { apex: 54, up: 420, dive: 230, slam: 30, squeeze: 5 };      // (how high he carries you, how long it takes to go up and to dive, the slam's damage and a squeeze's, both times the grade's damage)
function cuirHold(a, now, d, dir, lift) {      // you are held: in front of his hips, still, stunned a moment at a time (when his move ends you are free at once), lifted when he is
  pStun = Math.max(pStun, now + 160); blkAt = blkEnd = -1; blockHeld = false; atkAt = -1; atkQ = false; jumpAt = teleAt = -1; lpAt = -1; dash = null; mbAt = -1; mbPending = false; dgAt = -1; stance = 'stand'; wxv = 0; wx = d.x + dir * IRH.hx;
  if (lift > 0) { if (!gAir || !gAir.hover) gAir = { at: now, h0: 0, v0: 0, g: 0, kind: 'up', T: 1e9, hover: true }; gAir.h0 = lift + 5; gAir.until = now + 250; } else { hurtK = 1; hurtAt = now; }
}
CUIR.ihug = {
  start(a, now, g) { a.ph = 'wind'; a.p0 = now; a.fl = 0; a.tk = []; a.lift = 0; snd('thrust', 0.6); },
  look(a, t, g, now) {
    const P = g.bhp, u = now - a.p0; let src;
    if (a.ph === 'wind') src = P.open[Math.min(1, Math.floor(u / IRH.wind * 2))]; else if (a.ph === 'fly') src = P.fly[Math.floor(u / 70) % 3]; else if (a.ph === 'miss') src = P.skid[Math.min(3, Math.floor(u / IRH.miss * 4))];
    else if (a.ph === 'grab') src = P.close[Math.min(1, Math.floor(u / IRH.grab * 2))]; else if (a.ph === 'hug') src = P.hug[Math.floor(u / 110) % 4]; else if (a.ph === 'up') src = P.up[Math.floor(u / 60) % 3]; else if (a.ph === 'dive') src = P.up[Math.floor(u / 45) % 3]; else src = P.land[Math.min(5, Math.floor(u / IRH.land * 6))];
    return { src, lift: a.lift };
  },
  act(a, t, now, dt, gap, ag, toward, G, g) {
    const d = dummy, P = g.bhp, dir = cuirDir(), u = now - a.p0, st = ph => { a.ph = ph; a.p0 = now; };
    dt = Math.min(0.05, dt); a.lift = 0;
    if (a.ph === 'wind') { if (u >= IRH.wind) { st('fly'); a.fl = 0; snd('thrust', 1); puff(d.x, 9); } }
    else if (a.ph === 'fly') {      // the charge along the floor, arms out: the first time they touch you he has you (unless you are in the air, dashing or crouching), a charge that touches nothing stops after 150 px
      const step = Math.min(IRH.fly * dt, IRH.reach - a.fl); d.x += toward * step; a.fl += step; const B = hbBody(hbMe()), reach = B ? hbGap(P.tip, B, 0) : 24, ag2 = Math.abs(d.x - wx), can = gojoLift <= 12 && !gAir && stance === 'stand' && !(dgAt >= 0 && now - dgAt < 11 * 1000 / DASH_FPS) && !dom;
      if (ag2 <= reach && gap > -4) { if (can) { st('grab'); hitStop(70); snd('hit', 3); shakeUntil = Math.max(shakeUntil, now + 140); shakeAmp = Math.max(shakeAmp, 3); say('GOT YOU!', wx, '#ffd34d', 8, now); } else { st('miss'); say('MISS', d.x, '#9fd8ff', 8, now); } }
      else if (a.fl >= IRH.reach || u > 600) st('miss');
    }
    else if (a.ph === 'miss') { d.x += toward * Math.max(0, 1 - u / IRH.miss) * 160 * dt; if (u >= IRH.miss) cuenEnd(now); }
    else if (a.ph === 'grab') { cuirHold(a, now, d, dir, 0); if (u >= IRH.grab) { st('hug'); snd('block'); } }
    else if (a.ph === 'hug') {
      cuirHold(a, now, d, dir, 0);
      for (let i = 0; i < IRH.ticks.length; i++) if (!a.tk[i] && u >= IRH.ticks[i]) { a.tk[i] = 1; const dm = Math.max(1, Math.round(CUIR_HUG.squeeze * G.dmg)); vsHurt(dm, now); say('' + dm, wx, '#ff9a5a', 8, now); snd('c4crunch'); shakeUntil = Math.max(shakeUntil, now + 110); shakeAmp = Math.max(shakeAmp, 2); }
      if (u >= IRH.hug) { st('up'); snd('thrust', 1.4); }
    }
    else if (a.ph === 'up') { const k = Math.min(1, u / CUIR_HUG.up); a.lift = CUIR_HUG.apex * (1 - (1 - k) * (1 - k)); cuirHold(a, now, d, dir, a.lift); if (u >= CUIR_HUG.up) { st('dive'); snd('thrust', 0.9); } }
    else if (a.ph === 'dive') { const k = Math.min(1, u / CUIR_HUG.dive); a.lift = CUIR_HUG.apex * (1 - k * k); cuirHold(a, now, d, dir, a.lift); if (u >= CUIR_HUG.dive) cuirSlam(a, now, d, dir, G); }
    else if (a.ph === 'land') { if (u >= IRH.land) cuenEnd(now); }
  },
  draw() { }
};
function cuirSlam(a, now, d, dir, G) {      // the end of the dive: you are thrown down in front of him, the damage, the dust; he lands
  a.ph = 'land'; a.p0 = now; a.lift = 0; gAir = null; gAirH = 0; hurtAt = -1; hurtEnd = now - 300; wx = d.x + dir * 26; wxv = 0; pStun = Math.max(pStun, now + 400);
  const dm = Math.max(1, Math.round(CUIR_HUG.slam * G.dmg)); vsHurt(dm, now); say('' + dm, wx, '#ff9a5a', 8, now); say('SLAM!', wx + dir * 16, '#ffd34d', 8, now);
  hurtK = 4; hurtAt = now; gDownUntil = now + RX_DUR[4]; wxv -= 120 * pScale() * -dir; snd('hurt', 4);
  debBurst(d.x + dir * 8, 6, 20, ['#8a8a92', '#6d6d75', '#b8b0a0', '#6d3b2c'], 170); puff(d.x - 8, 8); puff(d.x + 8, 8); gritAt(d.x, 14, 130, 0); shockAt(d.x, 300, 130, 1); snd('concboom'); snd('land', 2.4); flash(now, 120, 0.25); shakeUntil = Math.max(shakeUntil, now + 520); shakeAmp = Math.max(shakeAmp, 6); hitStop(90);
}
window.__cuir = type => { const g = CU_GAME[5]; if (!vs || !dummy || !g || !cuenReg()) return false; cuenStart(type === 'slam' ? 5 : type === 'icharge' ? 7 : type === 'flip' ? 8 : 0, pnow(), type === 'slam' || type === 'flip' ? 'cu' : type); return true; };      // test hook: he starts the move now (slam, flip, icharge, iblast, ilaser, ispin, igp, ihug)
