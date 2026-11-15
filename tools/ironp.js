// ================================================================ v1.196 IRON MAN'S GROUND PUNCH AND LASER (this file is spliced into template.html by build_html.py, right after ironb.js)
// The user, after v1.195: "now add to bearhug if i crouch and i use the move i will punch the ground and then while me and the enemy are falling i will punch their face sending them back but if its the street map then i will punch the ground cracking it and unstabling the enemy, if i walk back and use blast then i will fire a concentrated red laser that cuts through anything for 1 second if it hits the enemy it will pierce them and for a moment while the laser is through them they are stunned but not bleed as all blood is vaporized and after that they start to bleed as they are stunned for a few seconds".
// The BLUE button now has FOUR forms, chosen by what he does when he presses it (irBhStart in tools/ironh.js; the label follows): standing = BEAR HUG, crouched = GROUND PUNCH (here), the REPULSOR mode on = BLAST (tools/ironb.js) and, walking back (holding the back key) in that mode = LASER (here). All of them are played by the state g.bh with a `kind` of its own, and customScene asks irBhStep for his picture while one runs.
// GROUND PUNCH (kind 'gp' on the street and in the lobby, 'gt' in the skyscraper): from the crouch he raises his right fist high over his head (0.26 s) and slams it into the ground.
//   STREET: the road cracks towards the enemy (the cracks of Freddy's ground slam, fgCracks, drawn by fgDrawGround), chunks fly up, the shock runs along the ground at 520 px a second and when it reaches the enemy (up to 200 px away) it throws him off balance: 8 damage, he is flung 16 px up and comes down stunned for 1.2 s. An enemy in the air (a jump) is not reached, a guard does not stop it, a crouching one is not spared.
//   SKYSCRAPER (floor 2 or higher, the enemy on his floor, not in the elevator): the floor breaks under BOTH of them, two floors deep (one on the 2nd), and the two fall (the camera falls 1.1 s with them, the fall costs each 3% of health a floor, never a K.O.: the rule of every fall, as in Freddy's floor break); the enemy hangs in the air next to him, and 0.4 s into the fall Iron Man punches him in the face: 14 damage and the enemy is sent flying back 84 px; when the fall ends both land (the enemy on his back, down).
// The cooldown is 10 s of the game's clock (the hug's: g.bhCd; 3 s when a blow stops it during the wind-up). It is the street move in the lobby, in the elevator's neighbourhood and with the enemy on another floor.
// LASER (kind 'laser', the BLAST's relatives: raise 0.24 s, charge 0.56 s, FIRE 1 s, lower): a thin, concentrated red beam, exactly 2 pixel rows thick (v1.197: it was 3 rows with a glow) at the height of his palm, to the edge of the screen. It cuts through anything: the skyscraper's furniture, walls and doors in its way are cut at once (twSweep) and a guard does not stop it. An enemy it touches is PIERCED: 20 damage, a hole through him (a glowing spot, steam: all his blood is vaporized), he is stunned for as long as the beam is through him and he does not bleed; the beam does 1 more damage every 0.1 s on its way through him. When the beam is gone the hole opens and he starts to BLEED (2 damage every 0.5 s for 4 s, the engine's d.bleed, with drops of blood when SETTINGS > GRAPHIC DAMAGE is FULL) and stays stunned for 3 s. A crouching, flat, dodging or lying enemy is not touched. Cooldown 12 s (the blast's: g.bmCd).
const IRP = { wind: 260, hold: 150, rise: 360, fall: 1100, kb: 260, knockPx: 84, land: 480, cd: 10000, dmgS: 8, dmgF: 14, floors: 2, wave: 520, range: 200, gap: 34 };      // (times in game ms; wave: how fast the shock runs, px a second; range: how far it reaches; gap: how far in front of him the enemy hangs in the fall)
const IRL = { raise: 240, charge: 560, fire: 1000, lower: 300, t0: 30, tick: 100, pierce: 20, thru: 1, bleedDm: 2, bleedGap: 500, bleedMs: 4000, stun: 3000, cd: 12000, sweep0: 90, sweepD: 36 };      // (charge and fire are REAL ms, irRate() turns them into game ms: the beam is on for exactly one second; pierce: the first touch; thru: every tick after it)
// ---- the pictures
function irpPics(g) {      // the ground punch: gw = the fist goes up (4), gs = the fist in the ground (2), gr = he stands up again (4), gf = falling (3), gx = the punch in the face (3: the fist drawn back, the arm out, held)
  const feet = [{ ax: 33, ay: C4IG, a: 0 }, { ax: 59, ay: C4IG, a: 0 }], wide = [{ ax: 31, ay: C4IG, a: 0 }, { ax: 58, ay: C4IG, a: 0 }];
  const up0 = crG({ x: 43, lean: 10, hdx: 1.4, hdt: 0, arms: [IR_CA[0], { al: 146, el: 12 }] }), up1 = crG({ x: 43, lean: 8, hdx: 1.2, hdt: -2, arms: [{ al: 30, el: 70 }, { al: 156, el: 8 }], legs: feet });
  const hit = crG({ x: 41, y: 81, lean: 44, hdx: 3, hdy: 2.2, hdt: 20, arms: [{ al: 10, el: 60 }, { al: 24, el: -6 }], legs: wide }), held = crG({ x: 41, y: 81, lean: 43, hdx: 3, hdy: 2.2, hdt: 19, arms: [{ al: 12, el: 56 }, { al: 24, el: -6 }], legs: wide });
  const rise = crG({ x: 43, y: 70, lean: 30, hdx: 2.2, hdy: 1.4, hdt: 10, arms: [{ al: 30, el: 70 }, { al: 40, el: 40 }], legs: feet });
  const fl = (lean, hdt, a0, a1, l0, l1) => irG({ x: 46, y: 64, lean, hdx: 1.3, hdt, arms: [a0, a1], legs: [{ ax: 40, ay: C4IG - l0[0], a: l0[1] }, { ax: 54, ay: C4IG - l1[0], a: l1[1] }] });
  const fp = (lean, hdt, hdx, a, l0, l1) => irG({ x: 44, y: 64, lean, hdx, hdt, arms: [{ al: 30, el: 80 }, a], legs: [{ ax: 38, ay: C4IG - l0[0], a: l0[1] }, { ax: 54, ay: C4IG - l1[0], a: l1[1] }] });
  g.bpp = {
    gw: [c4xMixPose(IR_CRO, up0, 0.5), up0, c4xMixPose(up0, up1, 0.5), up1].map(ironCut), gs: [hit, held].map(ironCut), gr: [c4xMixPose(held, rise, 0.5), rise, c4xMixPose(rise, IR_GD, 0.5), IR_GD].map(ironCut),
    gf: [fl(4, -4, { al: 74, el: 44 }, { al: 90, el: 30 }, [6, 14], [4, -10]), fl(8, 0, { al: 96, el: 20 }, { al: 60, el: 50 }, [8, 18], [5, -8]), fl(2, -6, { al: 56, el: 60 }, { al: 84, el: 24 }, [5, 8], [9, -16])].map(ironCut),
    gx: [fp(6, 2, 1.5, { al: -30, el: 100 }, [8, 14], [6, -10]), fp(16, 8, 1.8, { al: 90, el: 0 }, [8, 18], [7, -14]), fp(18, 9, 2, { al: 92, el: -2 }, [9, 20], [7, -16])].map(ironCut)
  };
}
function irlPics(g) {      // the laser: the same four sets as the blast (raise 4, charge 2, fire 2, lower 4) but braced with both hands (the left forearm under the right arm), without the blue palm glow (the red light is drawn), every picture knows its palm
  const feet = [{ ax: 35, ay: C4IG, a: 0 }, { ax: 59, ay: C4IG, a: 0 }], brace = o => irG({ y: 63, hdy: 1.5, legs: feet, rr: 0, ...o });
  const hold = (x, lean) => brace({ x, lean, hdx: 1.1, hdt: -2, arms: [{ al: 62, el: 34 }, { al: 84, el: 2 }] }), fire = lean => brace({ x: 44, lean, hdx: 0.8, hdt: -6, arms: [{ al: 66, el: 28 }, { al: 86, el: 0 }] });
  const cut = p => { const c = ironCut(p); c.palm = irbPalm(p); return c; };
  g.blp = { rz: [0.25, 0.5, 0.75, 1].map(k => c4xMixPose(IR_GD, hold(45, -3), k)).map(cut), ch: [hold(45, -3), hold(45, -5)].map(cut), fi: [fire(-7), fire(-9)].map(cut), lo: [0.25, 0.5, 0.75, 1].map(k => c4xMixPose(fire(-8), IR_GD, k)).map(cut) };
}
// ---- GROUND PUNCH
const irpTower = () => twOn() && !vs.tw.cab && vs.tw.fMe >= 2 && !vs.tw.away && vs.tw.fFoe === vs.tw.fMe;      // (the floor can be broken: the skyscraper, not the lobby, not in the cab, and the enemy is on this floor)
function irpStart(g, now) {      // BLUE pressed crouched, the repulsor mode off: the ground punch begins (false when it cannot)
  if (!g.bpp) irpPics(g);
  if (now < (g.bhCd || 0)) { say('WAIT', wx, '#9a9aa8', 8, now); return false; }
  if (!irhOk(now)) { say('NO ENEMY HERE', wx, '#9a9aa8', 8, now); return false; }
  g.bh = { kind: irpTower() ? 'gt' : 'gp', lab: 'punch', ph: 'wind', at: now, last: now, lift: 0, rot: 0, wave: null, kb: null, fp: false, ms: 0, tf: 0, n: 0 };
  g.bhCd = now + IRP.cd; stance = 'stand'; stickCr = false; snd('swing', 3); return true;
}
function irpHurt(g, now) { const b = g.bh; if (b.ph === 'wind') { g.bhCd = Math.min(g.bhCd || 0, now + IRH.cdMiss); irBhEnd(g, now); } }      // (a blow that lands while he is still winding up stops it; after the punch nothing can reach him)
function irpImpact(g, b, now) {      // the fist hits the ground: the shock, the dust, and then the street's cracks or the skyscraper's broken floor
  const d = dummy, ix = wx + 24, dir = d && d.x >= wx ? 1 : -1, tw = b.kind === 'gt';
  gritAt(ix, 12, 130, 0); shockAt(ix, 240, 100, 0.9); puff(ix - 6, 8); puff(ix + 6, 8); snd('land', 1.8); snd(tw ? 'concboom' : 'twbreak', tw ? undefined : 3); flash(now, 90, 0.2); hitStop(60); shakeUntil = Math.max(shakeUntil, now + 380); shakeAmp = Math.max(shakeAmp, 5);
  debBurst(ix, 6, 18, ['#8a8a92', '#6d6d75', '#b8b0a0', '#4c4a40'], 160);
  if (tw) { irpBreak(g, b, now); return; }
  fgCracks.push({ x: ix, at: now, dir, len: Math.min(170, Math.max(70, Math.abs(d.x - wx) + 30)), seed: (now | 0) & 255, ir: true }); if (fgCracks.length > 4) fgCracks.shift();      // (a crack runs along the road towards the enemy)
  b.wave = { x0: ix, dir, at: now, hit: false };
}
function irGround(now, cx) {      // customScene, on the floor under everybody: Freddy's cracks (fgDrawGround), and over his the deeper cracks of the ground punch: wider, with a light lip and branches
  fgDrawGround(now, cx);
  for (const c of fgCracks) {
    if (!c.ir) continue; const a = now - c.at; if (a > 6000) continue; const al = a > 4500 ? (6000 - a) / 1500 : 1, n = Math.floor(c.len * Math.min(1, a / 200)); let y = 0, s = c.seed * 977 + 13;
    for (let i = 0; i < n; i++) {
      if (i % 3 === 0) { s = (s * 1103515245 + 12345) >>> 0; y = Math.max(0, Math.min(5, y + ((s >> 8) & 1 ? 1 : -1))); }
      const X = cx + Math.round(c.x + c.dir * i - wx); ctx.fillStyle = 'rgba(188,180,158,' + (0.55 * al).toFixed(2) + ')'; ctx.fillRect(X, gy + y, 1, 1); ctx.fillStyle = 'rgba(6,4,10,' + al.toFixed(2) + ')'; ctx.fillRect(X, gy + 1 + y, 1, 2);      // (the lip of the crack, the dark crack)
      if (i % 13 === 6) { ctx.fillRect(X, gy + 3 + y, 1, 3); ctx.fillRect(X + c.dir, gy + 5 + y, 1, 2); }      // (a branch)
    }
    if (a < 500) { ctx.fillStyle = 'rgba(255,200,120,' + (0.6 * (1 - a / 500)).toFixed(2) + ')'; ctx.fillRect(cx + Math.round(c.x - wx) - 2, gy - 1, 5, 3); }      // (the glow of the fist where it hit)
  }
}
function irpWave(g, b, now) {      // the shock on the ground reaches the enemy: he is thrown off balance (once)
  const w = b.wave, d = dummy; if (!w || w.hit) return; if (!d || d.ko >= 0 || d.cap || (twOn() && vs.tw.away)) { b.wave = null; return; }
  const dist = (d.x - w.x0) * w.dir; if (dist < -30) { b.wave = null; return; } if (dist > IRP.range) { b.wave = null; return; }
  if (now - w.at < Math.max(0, dist) / IRP.wave * 1000) return; w.hit = true;
  if ((d.airH || 0) > 8) { say('MISS', d.x, '#9fd8ff', 8, now); return; }      // (a jump over the shock)
  if (irhHit(now, IRP.dmgS, { launch: 16, sy: 6, low: true, rx: 7 })) { if (d.ko < 0) { cuStun(1.2, now, true); say('UNSTABLE', d.x, '#ffd34d', 8, now + 60); } spark(d.x, gy - 4, 8, ['#b8b0a0', '#8a8a92', '#ffffff'], false, 1); }
}
function irpBreak(g, b, now) {      // the floor breaks under both of them and both fall (the way Freddy's does it, fgTowerBreak): holes, the camera falls with them, the fall damage, the enemy hangs next to him
  const T = vs.tw, d = dummy, f = T.fMe, F = twFloorData(f), n = Math.min(IRP.floors, f - 1), x = wx, gap = d.x - wx;
  for (let i = 0; i < n; i++) { twAddHole(f - i, x, 28, now); if (Math.abs(gap) > 24) twAddHole(f - i, d.x, 28, now); }
  debBurst(x, 6, 18 + 2 * n, ['#8a8a92', '#6d6d75', '#b8b0a0', '#6d3b2c'], 150 + 10 * n); puff(x - 8, 6); puff(x + 8, 6); shockAt(x, 280, 120, 0.9); shakeUntil = Math.max(shakeUntil, now + 520); shakeAmp = Math.max(shakeAmp, 6); hitStop(70);
  for (const dr of F.doors) if (dr.k === 'elev' && Math.abs(dr.x - x) < 50) twDoorHit(F, dr, 25 + 15 * n, now);
  twLightsShock(F, x, 90 + 20 * n, 30 + 20 * n, now); twHaze(now, 0.8); twFlash(x, now, [255, 240, 210], 36);
  const to = f - n, dmMe = Math.max(1, Math.round(PHP * Math.min(0.30, 0.03 * n))), dmFoe = Math.round((d.max || DUMMY_HP) * Math.min(0.30, 0.03 * n));
  T.fMe = to; T.fFoe = to; T.lastFallX = x; T.away = false; d.twAway = false; twFloorSwitch(now, x, 'fall'); d.x = twPlace(twFloorData(to), wx + IRP.gap); d.vx = 0; d.down = 0;
  twHurtMe(dmMe, now, true); twHurtFoe(dmFoe, now, true); T.dx = d.x; T.dHp = d.hp; T.pHp = vs.hp; T.dHit = d.hitAt;
  let ms = IRP.fall; if (T.slide) { T.slide.pair = true; T.slide.ms = ms; vs.nHold = Math.max(vs.nHold || 0, now + ms); if (T.banner) T.banner.at = now + ms; } else ms = 600;
  b.ms = ms; b.tf = Math.round(ms * 0.36); b.n = n; say('BREAK!', x, '#ffd34d', 8, now); irhHold(now, 4, true);
}
function irpFace(g, b, now) {      // the punch in the face, in the middle of the fall: 14 damage, he is sent back
  const d = dummy; if (!d || d.ko >= 0) return;
  if (irhHit(now, IRP.dmgF, { sy: 50, rx: 5 })) { b.kb = { at: now, x0: d.x }; hitStop(60); shakeUntil = Math.max(shakeUntil, now + 200); shakeAmp = Math.max(shakeAmp, 4); spark(d.x - 6, gy - 50, 10, ['#ffffff', '#ffe9a0', '#ff8a7a'], true, 1); snd('smack', 3); }
}
function irpLand(g, b, now) {      // the fall ends: both land, the enemy on his back
  const d = dummy; b.ph = 'land'; b.at = now; b.lift = 0; b.kb = null;
  if (d && d.air && d.air.hover) { d.air = null; d.airH = 0; }
  if (d && d.ko < 0) { d.rx = 4; d.rxAt = now; d.down = now + RX_DUR[4]; d.stunUntil = Math.max(d.stunUntil || 0, now + RX_DUR[4] + 200); d.hitDone = false; d.vx = 0; if (twOn()) { const T = vs.tw; T.dDown = d.down; T.dHit = d.hitAt; } }
  puff(d ? d.x : wx, 8); puff(wx, 6); gritAt(wx, 10, 100, 0); snd('land', 2.2); shakeUntil = Math.max(shakeUntil, now + 300); shakeAmp = Math.max(shakeAmp, 4);
}
function irpStep(g, b, now, dt) {      // every frame of the ground punch: the picture
  const P = g.bpp, d = dummy, u = now - b.at; b.last = now; b.rot = 0;
  if (vs.ph !== 'fight' || !d) { irBhEnd(g, now); return null; }
  if (b.wave) irpWave(g, b, now);
  if (b.ph === 'wind') { b.lift = 0; if (u >= IRP.wind) { b.ph = b.kind === 'gt' ? 'fall' : 'hold'; b.at = now; irpImpact(g, b, now); if (!g.bh) return null; return P.gs[0]; } return P.gw[Math.min(3, Math.floor(u / IRP.wind * 4))]; }
  if (b.ph === 'hold') { b.lift = 0; if (u >= IRP.hold) { b.ph = 'rise'; b.at = now; } return P.gs[u < 60 ? 0 : 1]; }
  if (b.ph === 'rise') { b.lift = 0; if (u >= IRP.rise) { irBhEnd(g, now); return null; } return P.gr[Math.min(3, Math.floor(u / IRP.rise * 4))]; }
  if (b.ph === 'fall') {      // the two of them fall together: he floats at the height the enemy hangs at, the face punch comes at b.tf
    b.lift = 14 * Math.min(1, u / 120); irhHold(now, b.lift + 4, true);
    if (u >= b.tf && !b.fp) { b.fp = true; irpFace(g, b, now); }
    if (b.kb) { const q = Math.min(1, (now - b.kb.at) / IRP.kb); d.x = twPlace(twFloorData(vs.tw.fMe), b.kb.x0 + IRP.knockPx * (1 - (1 - q) * (1 - q))); vs.tw.dx = d.x; }
    if (u >= b.ms) { irpLand(g, b, now); return g.bhp.land[0]; }
    if (u < 90) return P.gs[1];
    if (u >= b.tf - 140 && u < b.tf + 200) return P.gx[u < b.tf - 50 ? 0 : u < b.tf + 90 ? 1 : 2];
    return P.gf[Math.floor(u / 100) % 3];
  }
  if (b.ph === 'land') { b.lift = 0; if (u >= IRP.land) { irBhEnd(g, now); return null; } return g.bhp.land[Math.min(5, Math.floor(u / IRP.land * 6))]; }
  irBhEnd(g, now); return null;
}
// ---- LASER
let irlHole = null, irDrop = 0;      // the hole the laser made in the enemy { who, at, off (when the beam left him: 0 while it is through him), hgt (height above the floor), ox }; when the next drop of blood may fly
function irlStart(g, now) {      // BLUE pressed walking back in the repulsor mode: the laser begins (false when it cannot)
  if (!g.blp) irlPics(g);
  if (now < (g.bmCd || 0)) { say('WAIT', wx, '#9a9aa8', 8, now); return false; }
  if (!irhOk(now)) { say('NO ENEMY HERE', wx, '#9a9aa8', 8, now); return false; }
  const R = irRate();
  g.bh = { kind: 'laser', lab: 'laser', ph: 'raise', at: now, last: now, lift: 0, rot: 0, tk: 0, nt: Math.floor(IRL.fire * R / IRL.tick), cm: IRL.charge * R, fm: IRL.fire * R, hit: false, imm: false, miss: false, on: -1, off: -1, imp: -1e9, ix: 0, sn: 0, ko: false };
  g.bmCd = now + IRL.cd; stance = 'stand'; stickCr = false; snd('thrust', 0.5); return true;
}
function irlEnd(g, b, now) {      // the beam is gone (it ran out, he was hit, or the enemy was knocked out): an enemy it went through starts to bleed and stays stunned
  if (b.off >= 0) return; b.off = now; const d = dummy, H = irlHole;
  if (b.hit && d && d.ko < 0 && H && H.who === d && !H.off) {
    H.off = now; d.bleed = { next: now + 300, until: now + IRL.bleedMs, gap: IRL.bleedGap, dm: IRL.bleedDm, quiet: true }; cuStun(IRL.stun / 1000, now, true); say('BLEEDING', d.x, '#ff3a4a', 8, now); snd('hit', 1);
    if (gdSet() === 0) spark(d.x, gy - H.hgt - (d.airH || 0), 8, ['#8a0a14', '#c4121c', '#ff2a3a'], false, 1);
  } else if (H && !H.off) H.off = now;
}
function irlHurt(g, now) {      // a blow lands on him: the laser stops (before it fires the cooldown is cut to 3 s; an enemy it went through starts to bleed)
  const b = g.bh; if (b.ph === 'raise' || b.ph === 'charge') g.bmCd = Math.min(g.bmCd || 0, now + IRH.cdMiss); else if (b.ph === 'fire') irlEnd(g, b, now); irBhEnd(g, now);
}
function irlShape(b) { const s = {}, m = irbMx(b); for (let r = b.py - 1; r <= b.py; r++) s[r] = [m, m + irbLen(b)]; return s; }      // (2 rows, the two the beam is drawn on: the palm's row - 1 and the palm's row)
function irlTick(g, b, now) {      // one tick of the laser: it cuts what is in its way, and an enemy it touches is pierced (the first time) or burnt on its way through him
  if (twOn() && !vs.tw.cab) twSweep(irbMx(b), irbMx(b) + irbLen(b), b.tk === 0 ? IRL.sweep0 : IRL.sweepD, now);      // (it cuts through anything: furniture, walls and doors)
  const d = dummy; if (!d || d.ko >= 0 || d.cap || !vs || vs.ph !== 'fight' || now - d.born < 600) return;
  if (twOn()) { const T = vs.tw; if (T.away || T.cab || T.fFoe !== T.fMe || d.twAway) return; }
  if (!hbTouchFoe(irlShape(b), d)) return;
  if (d.vform && d.vform !== 'verity') { if (!b.imm) { b.imm = true; say('IMMUNE', d.x, '#ffe9a0', 8, now); } return; }
  if ((d.vact && d.vact.type === 'crouch') || now < (d.down || 0) || (d.cact && d.cact.flat) || now < (d.dodgeUntil || 0)) { if (!b.miss) { b.miss = true; say('MISS', d.x, '#9fd8ff', 8, now); } return; }      // (the same enemies the other blows cannot touch; a guard is not one of them)
  const hgt = 61 - b.py, ey = gy - hgt - (d.airH || 0), first = !b.hit; b.ix = d.x; b.imp = now;
  const dm = Math.max(1, Math.round((first ? IRL.pierce : IRL.thru) * cuS.dm / 100));
  if (now > hits.until) { hits.n = 0; hits.dmg = 0; hits.seq = 0; } if (first) { b.hit = true; hits.n++; vs.bestCmb = Math.max(vs.bestCmb | 0, hits.n); } hits.dmg += dm; hits.until = now + COMBO_WIN; hits.last = now; hits.bonus = 0;
  d.hp = Math.max(0, d.hp - dm); d.hitAt = now; cuStun(0.3, now, true); d.vx = 0;      // (stunned for as long as the beam is through him)
  if (first) {      // the pierce: a hole through him, steam where his blood boiled away, a bright flash
    irlHole = { who: d, at: now, off: 0, hgt, ox: 0 }; say('PIERCED', d.x, '#ff6a5a', 8, now); say('' + dm, d.x + 8, popCol(), 8, now); hitStop(70); flash(now, 100, 0.25); shakeUntil = Math.max(shakeUntil, now + 260); shakeAmp = Math.max(shakeAmp, 4);
    spark(d.x, ey, 12, ['#ffffff', '#ffd9a0', '#ff6a3a'], true, 1); spark(d.x, ey, 8, ['#ffffff', '#ffb070'], false, -1); snd('hit', 3);
  } else { puff(d.x + (Math.random() * 6 - 3), 1); if (b.tk % 3 === 0) spark(d.x + 4, ey, 3, ['#ffffff', '#ffb070', '#ff6a3a'], false, 1); }
  if (twOn()) { const T = vs.tw; T.dHp = d.hp; T.dHit = d.hitAt; T.dDown = d.down || 0; }      // (the skyscraper's watcher must not take it for a blow that puts him down)
  if (d.hp <= 0) { koDummy(now); b.ko = true; }
}
function irlStep(g, b, now, dt) {      // every frame of the laser: the picture
  const P = g.blp, u = now - b.at; b.last = now; b.lift = 0; b.rot = 0;
  if (vs.ph !== 'fight') { irBhEnd(g, now); return null; }
  let pic;
  if (b.ph === 'raise') { pic = P.rz[Math.min(3, Math.floor(u / IRL.raise * 4))]; if (u >= IRL.raise) { b.ph = 'charge'; b.at = now; snd('redcharge'); snd('thrust', 0.6); } }
  else if (b.ph === 'charge') {
    pic = P.ch[Math.floor(u / 80) % 2]; if (Math.random() < 0.05) puff(wx - 6, 2);
    if (u >= b.cm) { b.ph = 'fire'; b.at = now; b.on = now; b.tk = 0; b.sn = 0; snd('redfire'); snd('concboom'); flash(now, 140, 0.3); shakeUntil = Math.max(shakeUntil, now + 260); shakeAmp = Math.max(shakeAmp, 4); gritAt(wx - 8, 10, 100, -1); if (twOn()) twLightsShock(twFloorData(vs.tw.fMe), wx + 40, 140, 70, now); }
  }
  else if (b.ph === 'fire') {
    pic = P.fi[Math.floor(u / 60) % 2]; b.px = pic.palm.px; b.py = pic.palm.py;
    while (b.tk < b.nt && u >= IRL.t0 + b.tk * IRL.tick && !b.ko) { irlTick(g, b, now); b.tk++; }
    shakeUntil = Math.max(shakeUntil, now + 80); shakeAmp = Math.max(shakeAmp, 1.5);
    if (u >= b.sn) { snd('cecrackle'); b.sn = u + 150; }
    if (u >= b.fm || b.ko) { b.ph = 'lower'; b.at = now; irlEnd(g, b, now); snd('ceoff'); }
  }
  else if (b.ph === 'lower') { pic = P.lo[Math.min(3, Math.floor(u / IRL.lower * 4))]; if (u >= IRL.lower) { irBhEnd(g, now); return null; } }
  else { irBhEnd(g, now); return null; }
  if (pic.palm) { b.px = pic.palm.px; b.py = pic.palm.py; }
  return pic;
}
// ---- what customScene draws for the laser: the beam (before him), the light at his palm (after him), and the hole in the enemy with the steam and the blood (every frame, also after the move is over)
function irlBack(g, b, now, x, y, src) {      // the beam: exactly 2 pixels thick (two rows: a hot, almost white one on top of a red one), straight through the enemy to the edge of the screen; streaks of light run along it, and where it goes into him and comes out of him it flares
  if (b.on < 0 || !src || !src.palm) return;
  const k = b.off < 0 ? 1 : Math.max(0, 1 - (now - b.off) / 160), grow = Math.min(1, (now - b.on) / 50); if (k <= 0) return;
  const x0 = Math.round(x + src.palm.px) + 2, yc = Math.round(y + src.palm.py) + 1, len = Math.max(4, Math.round(irbLen(b) * grow)), hot = Math.floor(now / 40) % 3 === 1;
  ctx.save(); ctx.globalAlpha = k;
  ctx.fillStyle = hot ? '#ffffff' : '#ffe2da'; ctx.fillRect(x0, yc, len, 1); ctx.fillStyle = '#ff2d3d'; ctx.fillRect(x0, yc + 1, len, 1);      // (the two rows)
  ctx.fillStyle = '#ffffff'; for (let i = 0; i < 8; i++) ctx.fillRect(x0 + Math.round((i * 71 + now * 1.6) % len), yc + 1, 4 + (i % 3) * 2, 1);      // (streaks of light along the red row)
  if (b.hit && now - b.imp < 200) { const ex = Math.round(Math.round(VW / 2) + b.ix - wx); for (const px of [ex - 8, ex + 8]) { irbDisc(px, yc, 3, '#ff5a4a', 0.3 * k); ctx.globalAlpha = k; ctx.fillStyle = '#ffc0a8'; ctx.fillRect(px - 1, yc - 1, 3, 4); ctx.fillStyle = '#ffffff'; ctx.fillRect(px, yc, 1, 2); ctx.fillRect(px, yc - 3, 1, 8); } }      // (the flare where it goes in and where it comes out: a bright spot with a short cross, no wider than the beam's own glow)
  ctx.restore();
}
function irlFront(g, b, now, x, y, src) {      // the light at his palm: in the charge a ring of red light closes on the palm while sparks fall into it, a hard point of light when it fires
  if (!src || !src.palm || b.ph === 'raise') return;
  const px = Math.round(x + src.palm.px) + 1, py = Math.round(y + src.palm.py) + 1; ctx.save();
  if (b.ph === 'charge') {
    const k = Math.min(1, (now - b.at) / b.cm), e = k * k * (3 - 2 * k), r = Math.round(16 - 13 * e);
    ctx.strokeStyle = 'rgba(255,80,90,' + (0.35 + 0.4 * e).toFixed(2) + ')'; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(px + 0.5, py + 0.5, r, 0, 6.2832); ctx.stroke();      // (the ring closes: the energy is concentrated)
    irbDisc(px, py, 2 + Math.round(2 * e), '#ff4a5a', 0.5); irbDisc(px, py, 1 + Math.round(e * 2), '#ffffff', 1);
    ctx.fillStyle = '#ff8a8a'; for (let i = 0; i < 14; i++) { const ph = (now * 0.006 + i * 0.151) % 1, rad = (1 - ph) * 30 * (1.1 - 0.7 * e), an = i * 2.4 + now * 0.003; ctx.globalAlpha = 0.9 * ph; ctx.fillRect(Math.round(px + Math.cos(an) * rad), Math.round(py + Math.sin(an) * rad * 0.8), 2, 1); }
  } else if (b.on >= 0) {
    const k = b.off < 0 ? 1 : Math.max(0, 1 - (now - b.off) / 160), r = Math.round((2 + (Math.floor(now / 50) % 2)) * k);
    if (r > 0) { irbDisc(px + 1, py, r + 2, '#ff4a5a', 0.22 * k); irbDisc(px + 1, py, r, '#ffc8b8', 0.85 * k); irbDisc(px + 1, py, Math.max(1, r - 1), '#ffffff', k); ctx.globalAlpha = 0.8 * k; ctx.fillStyle = '#ffffff'; ctx.fillRect(px - 5, py, 11, 1); ctx.fillRect(px + 1, py - 4, 1, 9); }
  }
  ctx.restore(); ctx.globalAlpha = 1;
}
function irlWorld(now, cx) {      // the hole in the enemy: while the beam is through him a glowing spot with steam (his blood has boiled away), when it is gone the hole opens: a dark centre, a rim that cools, and (with GRAPHIC DAMAGE on FULL) blood that runs down him
  const H = irlHole; if (!H) return; const d = H.who;
  if (d !== dummy || d.ko >= 0 || !vs || vs.ph !== 'fight' || now - (H.off || H.at) > 7000) { irlHole = null; return; }
  const hx = Math.round(cx + d.x - wx + H.ox), hy = Math.round(gy - H.hgt - (d.airH || 0)), blood = gdSet() === 0; ctx.save();
  if (!H.off) {      // (the beam is through him)
    irbDisc(hx, hy, 5, '#ff7a3a', 0.3); irbDisc(hx, hy, 3, '#ffd9a0', 0.8); irbDisc(hx, hy, 1, '#ffffff', 1);
    ctx.fillStyle = '#eef0f4'; for (let i = 0; i < 4; i++) { const t = ((now * 0.05 + i * 7) % 16), a = 1 - t / 16; ctx.globalAlpha = 0.7 * a; ctx.fillRect(hx - 3 + i * 2 + Math.round(Math.sin(now * 0.01 + i) * 2), hy - 3 - Math.round(t), 1, 2); }      // (steam)
  } else {
    const age = now - H.off, cool = Math.max(0, 1 - age / 1600);
    if (cool > 0) irbDisc(hx, hy, 3, '#ff8a3a', 0.55 * cool);
    ctx.globalAlpha = 1; ctx.fillStyle = '#12050a'; ctx.fillRect(hx, hy, 2, 2); ctx.fillStyle = cool > 0 ? 'rgba(255,140,60,' + cool.toFixed(2) + ')' : '#5a0a12'; ctx.fillRect(hx - 1, hy, 1, 2); ctx.fillRect(hx + 2, hy, 1, 2); ctx.fillRect(hx, hy - 1, 2, 1); ctx.fillRect(hx, hy + 2, 2, 1);      // (a hole of 2 x 2 with a rim that cools from orange to dark red)
    if (blood) { for (let i = -1; i <= 1; i++) { const len = Math.min(12 + i * i * 2, Math.round(age / 90) + 1 + (i === 0 ? 3 : 0)), bx = hx + i * 2; ctx.fillStyle = '#7a0812'; ctx.fillRect(bx, hy + 2, 1, len); ctx.fillStyle = '#d4141f'; ctx.fillRect(bx, hy + 2 + len - 1, 1, 1); } }      // (blood runs down from the hole)
    else if (age < 1200) { ctx.fillStyle = '#ffb070'; ctx.globalAlpha = 1 - age / 1200; ctx.fillRect(hx - 2 + (Math.floor(now / 60) % 3), hy - 2 - (Math.floor(now / 90) % 3), 1, 1); }      // (a few embers when there is no blood)
  }
  ctx.restore(); ctx.globalAlpha = 1;
}
function irBleedFx(now) {      // every frame he fights: the enemy's bleeding goes on (the engine's d.bleed: vpBleed takes its damage) and drops of blood fly off him (GRAPHIC DAMAGE on FULL)
  vpBleed(now); const d = dummy, H = irlHole; if (!d || !d.bleed || d.ko >= 0 || now < irDrop || gdSet() !== 0 || !H || H.who !== d) return;
  irDrop = now + 150; spark(d.x + Math.random() * 4 - 2, gy - H.hgt - (d.airH || 0) + 2, 1, ['#c4121c', '#ff2a3a'], false, Math.random() < 0.5 ? 1 : -1);
}
