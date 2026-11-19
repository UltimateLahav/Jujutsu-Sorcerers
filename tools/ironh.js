// ================================================================ v1.194 IRON MAN'S BEAR HUG (this file is spliced into template.html by build_html.py, right after ironm.js)
// The user, after v1.193: "Add to his base a charge grab move through his special and when he grabs the enemy he bear hugs them and then flies up breaking floors above and then he goes 180 and flies down much faster breaking floors below" (and: no questions, do it purely on what he said).
// His SPECIAL is the BLUE button (key L, `lpReq`), which was hidden for him until now: it says BEAR HUG. One press (every 12 s) starts a move that is played by a state of its own, g.bh (like Sukuna's counter, g.cs, and Ryu's ultimate): customScene asks irBhStep for his picture and his height every frame while it runs and he cannot do anything else.
//   WIND (0.11 s: arms wide open) -> FLY (the charge of v1.192 on his side, both arms out in front: 520 px a second, at most 150 px) -> the first time his arms touch the enemy: GRAB (0.17 s: he pulls him in) -> HUG (0.72 s: the bear hug, three squeezes of 3 damage) -> UP (both rise: in the SKYSCRAPER the ceilings above break, 3 floors, the camera slides up with the two of them; on the street they rise to the top of the screen) -> TURN (0.44 s: the two of them turn over 180 degrees together about the middle of the hug) -> DIVE (head first, about twice as fast as the climb: in the skyscraper the floors below the one he started on break, 3 of them, on the way down through the holes of the climb; on the street to the ground) -> SLAM (the enemy is thrown down onto the floor: 30 damage on the street, 22 + 5 a floor in the skyscraper) -> he lands (a hero landing). A charge that touches nothing flies up to 150 px and lands (the cooldown is only 3 s then).
// The two of them are ONE body while they are held: the enemy hangs in the air next to him (the same hover as Freddy's ground slam: d.air.hover, d.airH = the height of the hug), 16 px in front of his hips; while they turn over, customScene draws the enemy and him turned about the middle of the hug (irBhGrp: a canvas transform, the enemy's own picture whatever he is). The skyscraper's own functions are used like Freddy's floor break does (fred2.js fgTowerBreak): twAddHole for every floor that breaks, T.fMe = T.fFoe (both are on the same floor: nobody is away), twFloorSwitch for the camera slide, T.slide.pair = true so that the enemy is drawn where he is, and the baseline of the hits (T.dHp, T.dHit, T.dDown) is set again so that twWatch does not break the floor a second time for the same blow.
const IRH = { wind: 110, fly: 520, reach: 150, grab: 170, hug: 720, ticks: [140, 380, 620], tickD: 3, turn: 440, land: 560, miss: 460, cd: 12000, cdMiss: 3000, up: 3, down: 3, hx: 16, sUp: 520, sDive: 230, slamS: 30, slamT: 22, slamF: 5 };      // (times in game ms, speeds in px a second; cd: the cooldown of the special, 12 s of the game's clock (about 9 s real); up / down: floors above and below; hx: how far in front of his hips the enemy hangs; sUp / sDive: the climb and the dive on the street; slam damage: street / skyscraper base + each floor)
const irhE = k => k * k * (3 - 2 * k);      // (smoothstep)
function irhPics(g) {      // the pictures of the bear hug (built the first time): the wind-up with the arms wide open, the flight (WIDE pictures of 128 x 64 like the charge's: c.ox), the arms closing, the hug (three squeezes), the climb and the dive (the same three pictures: the boots burn, the flames flicker), the landing
  const ez = IR_EZ.io, legs0 = [{ ax: 33, ay: C4IG, a: 0 }, { ax: 60, ay: C4IG, a: 0 }];
  const open = irG({ x: 46, y: 66, lean: 18, hdx: 1.6, hdy: 1, hdt: 8, fl: 0.5, arms: [{ al: 112, el: 4 }, { al: 100, el: 8 }], legs: legs0 });
  const close = irG({ x: 46, y: 65, lean: 18, hdx: 1.6, hdy: 1, hdt: 10, fl: 0.5, arms: [{ al: 108, el: 6 }, { al: 94, el: 10 }], legs: legs0 });
  const hug = el => irG({ x: 45, y: 65, lean: 16 + el / 8, hdx: 1.8, hdy: 1, hdt: 10, arms: [{ al: 94, el: 8 + el }, { al: 82, el: 12 + el }], legs: [{ ax: 36, ay: C4IG, a: 0 }, { ax: 58, ay: C4IG, a: 0 }] });
  const up = p => irG({ x: 46, y: 63, lean: 8, hdx: 1.6, hdy: 1.2, hdt: 6, fl: 1, fa: 0, ph: p, arms: [{ al: 94, el: 16 }, { al: 82, el: 20 }], legs: [{ ax: 45, ay: C4IG - 6, a: -22 }, { ax: 50, ay: C4IG - 8, a: -26 }] });
  const fly = i => irWide({ ...K5P.sm, fl: 0.95, ph: i / 2, arms: [{ al: 186, el: 4 }, { al: 194, el: 0 }] }, 90, i), ld = { ...K5P.land, fl: 0 };
  const flyP = [0, 1, 2].map(fly), tip = cuMaxRows(flyP.map(irTipOf));
  g.bhp = {
    open: [c4xMixPose(IR_GD, open, 0.5), open].map(ironCut), close: [close, c4xMixPose(close, hug(0), 0.5)].map(ironCut),
    hug: [hug(0), hug(10), hug(18), hug(10)].map(ironCut), up: [0, 0.5, 1].map(up).map(ironCut), fly: flyP, tip,
    land: [0, 1, 2, 3, 4, 5].map(i => ironCut(i < 2 ? c4xMixPose(IR_GD, ld, i === 0 ? 0.7 : 1) : c4xMixPose(ld, IR_GD, ez((i - 1) / 5)))), skid: [0, 1, 2, 3].map(i => ironCut(c4xMixPose(ld, IR_GD, ez(i / 3))))
  };
}
const IR_BL = {      // the BLUE button: what it says and tells (a screen reader) in each of its five forms (v1.196: crouched = the ground punch, the repulsor mode + walking back = the laser; v1.202: in the air in the repulsor mode = the spin blast)
  hug: ['BEAR<br>HUG', 'Bear hug: he charges at the enemy, grabs him and hugs him, flies up through the floors above, turns over and dives down through the floors below'],
  punch: ['GROUND<br>PUNCH', 'Ground punch: he punches the ground; on the street it cracks and throws the enemy off balance, in the skyscraper the floor breaks under both of them and he punches the enemy in the face while they fall'],
  blast: ['BLAST', 'Blast: he lifts his arm, charges a beam in his palm and fires it forward; it hurts the enemy for as long as it touches him'],
  spin: ['SPIN<br>BLAST', 'Spin blast: jumping in the repulsor mode, he hangs in the air in a T pose and spins, firing a beam from each hand; the beams sweep to both sides and hurt the enemy while they touch him'],
  laser: ['LASER', 'Laser: walking back in the repulsor mode, he fires a concentrated red laser, 2 pixels thick, for one second that cuts through anything and pierces the enemy: stunned, then bleeding']
};
function irBlueLabel(g, now) {      // the BLUE button names the form it would be now (a move that is going on keeps its name)
  const b = g.bh, k = b ? b.lab || (b.kind === 'beam' ? 'blast' : 'hug') : g.rp ? (cuJumpAt >= 0 ? 'spin' : (keyL || padL) && !(keyR || padR) ? 'laser' : 'blast') : stance === 'crouch' || stance === 'down' ? 'punch' : 'hug', el = $('lapl'), L = IR_BL[k];
  if (el.innerHTML !== L[0]) { el.innerHTML = L[0]; $('lap').setAttribute('aria-label', L[1]); $('lap').classList.toggle('lg', k === 'punch'); }
}
// ---- the checks
function irhOk(now) {      // an enemy that can be charged at: here (in the skyscraper: on this floor, not in the cab) and alive
  const d = dummy; if (!d || d.ko >= 0 || d.cap || !vs || vs.ph !== 'fight') return false;
  if (twOn()) { const T = vs.tw; if (T.away || T.cab || T.fFoe !== T.fMe) return false; }
  return true;
}
function irhCan(now) {      // an enemy that can be grabbed now: not just born, not another form (Verity's ball), not crouching, flat, dodging, down, in the air or in the middle of an action of his own
  const d = dummy; return irhOk(now) && now - d.born >= 600 && !(d.vform && d.vform !== 'verity') && !(d.vact || d.cact) && now >= (d.down || 0) && now >= (d.dodgeUntil || 0) && (d.airH || 0) < 14 && !d.held && !d.cheld && !d.pull;
}
function irBhStart(g, now) {      // BLUE: the move begins (false when it cannot, or when he has not bought it: v1.215)
  if (!g.bhp) irhPics(g);
  if (!owns(g.rp ? ((keyL || padL) && !(keyR || padR) ? 'i_laser' : 'i_blast') : stance === 'crouch' || stance === 'down' ? 'i_gpunch' : 'i_hug')) { lockPop(now); return false; }
  if (g.rp) return (keyL || padL) && !(keyR || padR) ? irlStart(g, now) : irbStart(g, now);      // (v1.195 in the repulsor mode BLUE is the BLAST, see tools/ironb.js; v1.196 walking back it is the LASER, see tools/ironp.js)
  if (stance === 'crouch' || stance === 'down') return irpStart(g, now);      // (v1.196 crouched it is the GROUND PUNCH)
  if (now < (g.bhCd || 0)) { say('WAIT', wx, '#9a9aa8', 8, now); return false; }
  if (!irhOk(now)) { say('NO ENEMY HERE', wx, '#9a9aa8', 8, now); return false; }
  g.bh = { lab: 'hug', ph: 'wind', at: now, last: now, lift: 0, rot: 0, x0: wx, f0: twOn() ? vs.tw.fMe : 0, n: 0, D: 0, tk: [], gap: 0, hx: wx };
  g.bhCd = now + IRH.cd; stance = 'stand'; stickCr = false; snd('thrust', 0.6); return true;
}
function irBhEnd(g, now) {      // the move is over (or cut short): the enemy is let go, he is where he is
  const d = dummy; g.bh = null; if (d && d.air && d.air.hover) { d.air = null; d.airH = 0; } cuDashReady = now + 150;
}
function irBhHeld(g) { const b = g.bh; return !!b && !b.kind && b.ph !== 'wind' && b.ph !== 'fly' && b.ph !== 'miss'; }      // (he has the enemy: grab, hug, climb, turn, dive and landing)
function irBhHurt(g, now) { const k = g.bh && g.bh.kind; if (k === 'uni') return; else if (k === 'spin') irsHurt(g, now); else if (k === 'beam') irbHurt(g, now); else if (k === 'laser') irlHurt(g, now); else if (k === 'gp' || k === 'gt') irpHurt(g, now); else if (g.bh && !irBhHeld(g)) { g.bhCd = Math.min(g.bhCd || 0, now + IRH.cdMiss); irBhEnd(g, now); } }      // (a blow that lands while he is still charging stops it; once he holds the enemy nothing can reach him)
function irhHold(now, h, keep) {      // the enemy is held: IRH.hx in front of his hips (unless keep: where he is), h above the floor, still, and he cannot act
  const d = dummy; if (!d || d.ko >= 0) return;
  if (!keep) d.x = wx + IRH.hx; d.vx = 0; d.stunUntil = Math.max(d.stunUntil || 0, now + 250); d.ai = 'rest'; d.aiAt = now; d.restFor = 250; d.hitDone = true;
  if (hits.n > 0 && now <= hits.until) hits.until = now + COMBO_WIN;      // (the squeezes and the slam are one combo: the counter does not lapse while he holds him, the climb and the dive take longer than the 1.2 s window)
  if (!d.air || !d.air.hover) d.air = { at: now, h0: h, v0: 0, g: 0, kind: 'up', T: 1e9, hover: true }; d.air.h0 = h; d.airH = h;
}
function irhHit(now, dmg, o) { const d = dummy; if (!d || d.ko >= 0) return false; const ok = cuHit(dmg, now, { gb: true, ...o }, d.x - 4, 1e9, -1e9); if (twOn()) { const T = vs.tw; T.dHp = d.hp; T.dHit = d.hitAt; T.dDown = d.down || 0; T.pHp = vs.hp; } return ok; }      // (a hit that cannot be blocked; in the skyscraper twWatch is told it has seen it: it would break the floor for a hit that puts him down)
// ---- the skyscraper: the climb and the dive
function irhClimb(g, b, now) {      // the ceilings above break, 3 floors (fewer near the top), the camera slides up with the two of them; the time it takes (ms)
  const T = vs.tw, f = T.fMe, d = dummy, x = wx + IRH.hx / 2, n = Math.min(IRH.up, TW_N - f); b.hx = x;
  const burst = () => { debBurst(x, 70, 16, ['#8a8a92', '#6d6d75', '#b8b0a0', '#c9b27a'], 140); puff(x, 8); shakeUntil = now + 300; shakeAmp = 5; snd('twbreak', 4); hitStop(50); twLightsShock(twFloorData(f), x, 100, 60, now); twHaze(now, 0.6); twFlash(x, now, [255, 240, 210], 36); };
  if (n < 1) { burst(); say('NO MORE FLOORS', x, '#ffd34d', 8, now); return 480; }      // (the top floor: only the ceiling above him cracks)
  for (let i = 1; i <= n; i++) twAddHole(f + i, x, 26, now);
  burst(); say('CEILING! ' + n, x, '#ffd34d', 8, now);
  T.fMe = T.fFoe = f + n; T.away = false; d.twAway = false; T.lastFallX = null; twFloorSwitch(now, wx, 'ceil'); d.x = twPlace(twFloorData(T.fMe), wx + IRH.hx); d.vx = 0; T.dx = d.x; T.dHp = d.hp; T.pHp = vs.hp; T.dHit = d.hitAt;
  b.n = n; let ms = Math.min(900, 420 + 110 * n); if (T.slide) { T.slide.pair = true; T.slide.ms = ms; vs.nHold = Math.max(vs.nHold || 0, now + ms); if (T.banner) T.banner.at = now + ms; } else ms = 520; return ms;
}
function irhDive(g, b, now) {      // the floors below the one he started on break, 3 of them (fewer near the lobby), and they fall through all of them, the holes of the climb too, much faster than they rose; the time it takes (ms)
  const T = vs.tw, d = dummy, x = b.hx, cur = T.fMe, start = b.f0, m = Math.max(0, Math.min(IRH.down, start - 1)), D = Math.max(0, cur - (start - m)), to = cur - D; b.D = D;
  for (let j = 0; j < m; j++) twAddHole(start - j, x, 28, now);
  if (D < 1) return 300;
  debBurst(x, 6, 18 + 2 * D, ['#8a8a92', '#6d6d75', '#b8b0a0', '#6d3b2c'], 150 + 10 * D); puff(x - 8, 6); puff(x + 8, 6); shockAt(x, 280, 120, 0.9); snd('twbreak', 4); flash(now, 120, 0.25); shakeUntil = Math.max(shakeUntil, now + 520); shakeAmp = Math.max(shakeAmp, 6);
  twLightsShock(twFloorData(cur), x, 90 + 20 * D, 30 + 20 * D, now); twHaze(now, 0.8); twFlash(x, now, [255, 240, 210], 36);
  T.fMe = T.fFoe = to; T.away = false; d.twAway = false; T.lastFallX = x; twFloorSwitch(now, x - IRH.hx / 2, 'fall'); d.x = twPlace(twFloorData(to), wx + IRH.hx); d.vx = 0; T.dx = d.x; T.dHp = d.hp; T.pHp = vs.hp; T.dHit = d.hitAt;
  let ms = Math.min(800, 230 + 60 * D); if (T.slide) { T.slide.pair = true; T.slide.ms = ms; vs.nHold = Math.max(vs.nHold || 0, now + ms); if (T.banner) T.banner.at = now + ms; } else ms = 300; return ms;      // (the landing's word is said by irhSlam: the skyscraper's own, T.slide.land, is a long line that would be drawn over the damage number and the health bar)
}
// ---- the state: irBhStep is called by customScene every frame while g.bh is there; it moves him, the enemy and the camera and returns the picture
function irBhStep(g, now, dt) {
  const b = g.bh; if (!b) return null; if (!g.bhp) irhPics(g);
  if (b.kind) return b.kind === 'spin' ? irsStep(g, b, now, dt) : b.kind === 'uni' ? iruStep(g, b, now, dt) : b.kind === 'beam' ? irbStep(g, b, now, dt) : b.kind === 'laser' ? irlStep(g, b, now, dt) : irpStep(g, b, now, dt);      // (v1.195 the BLAST, v1.196 the LASER and the GROUND PUNCH have their own phases, see tools/ironb.js and tools/ironp.js)
  const d = dummy, P = g.bhp, tw = twOn(), u = now - b.at; dt = Math.max(0, Math.min(0.05, dt)); b.last = now;
  if (vs.ph !== 'fight' || !d || (d.ko >= 0 && b.ph !== 'land')) { b.lift = 0; b.rot = 0; irBhEnd(g, now); return null; }
  const apex = tw ? 22 : Math.max(36, gy - 76);
  if (b.ph === 'wind') {
    if (u >= IRH.wind) { b.ph = 'fly'; b.at = now; b.x0 = wx; snd('thrust', 1); puff(wx - 6, 9); } return P.open[Math.min(1, Math.floor(u / IRH.wind * 2))];
  }
  if (b.ph === 'fly') {      // the charge: along the floor with his arms out; the first time they touch the enemy he is grabbed (if he can be), a charge that touches nothing stops after IRH.reach px
    wx += IRH.fly * dt; b.lift = Math.min(9, u / 5); const gap = d.x - wx;
    if (d.ko < 0 && gap >= -3 && gap <= irReach(P.tip)) {
      if (irhCan(now)) { b.ph = 'grab'; b.at = now; b.gap = gap; { const x = d.x; irhHold(now, 0); d.x = x; } hitStop(70); snd('hit', 3); shakeUntil = Math.max(shakeUntil, now + 140); shakeAmp = Math.max(shakeAmp, 3); say('GOT YOU!', wx, '#ffd34d', 8, now); }
      else { b.ph = 'miss'; b.at = now; b.lift = 0; g.bhCd = now + IRH.cdMiss; say('MISS', wx + 20, '#9fd8ff', 8, now); }
    } else if (wx - b.x0 >= IRH.reach || gap < -12 || u > 600) { b.ph = 'miss'; b.at = now; b.lift = 0; g.bhCd = now + IRH.cdMiss; }
    return P.fly[Math.floor(u / 70) % 3];
  }
  if (b.ph === 'miss') { b.lift = 0; wx += Math.max(0, 1 - u / IRH.miss) * 160 * dt; if (u >= IRH.miss) { irBhEnd(g, now); return null; } return P.skid[Math.min(3, Math.floor(u / IRH.miss * 4))]; }
  if (b.ph === 'grab') {      // he is pulled in, to IRH.hx in front of his hips, and starts to hang
    const k = Math.min(1, u / IRH.grab); b.lift = 0; irhHold(now, 4 * k); d.x = wx + b.gap + (IRH.hx - b.gap) * irhE(k);
    if (u >= IRH.grab) { b.ph = 'hug'; b.at = now; b.tk = []; snd('block'); } return P.close[Math.min(1, Math.floor(u / IRH.grab * 2))];
  }
  if (b.ph === 'hug') {      // the bear hug: he hangs 5 px up and is squeezed three times
    b.lift = 0; irhHold(now, 5);
    for (let i = 0; i < IRH.ticks.length; i++) if (!b.tk[i] && u >= IRH.ticks[i]) { b.tk[i] = 1; irhHit(now, IRH.tickD, { knock: 0.01, sy: 34, rx: 1 }); snd('c4crunch'); shakeUntil = Math.max(shakeUntil, now + 110); shakeAmp = Math.max(shakeAmp, 2); }
    if (u >= IRH.hug) { b.ph = 'up'; b.at = now; b.hx = wx + IRH.hx / 2; b.ms = tw ? irhClimb(g, b, now) : IRH.sUp; snd('thrust', 1.4); }
    return P.hug[Math.floor(u / 110) % 4];
  }
  if (b.ph === 'up') {      // both rise: the camera slides up through the ceilings (skyscraper) or they go up to the top of the screen (street)
    const k = Math.min(1, u / b.ms); b.lift = tw ? apex * Math.min(1, u / 140) : apex * (1 - (1 - k) * (1 - k)); irhHold(now, b.lift + 5);
    if (u >= b.ms) { b.ph = 'turn'; b.at = now; snd('vanish'); } return P.up[Math.floor(u / 60) % 3];
  }
  if (b.ph === 'turn') {      // the two of them turn over 180 degrees about the middle of the hug (customScene draws both turned: irBhGrp)
    const k = Math.min(1, u / IRH.turn); b.lift = apex; b.rot = Math.PI * irhE(k); irhHold(now, b.lift + 5);
    if (u >= IRH.turn) { b.rot = Math.PI; b.ph = 'dive'; b.at = now; b.ms = tw ? irhDive(g, b, now) : IRH.sDive; snd('thrust', 0.9); }
    return P.up[Math.floor(u / 60) % 3];
  }
  if (b.ph === 'dive') {      // head first: the street dive is a fall (it speeds up); in the skyscraper the camera falls past them
    const k = Math.min(1, u / b.ms); b.rot = Math.PI; b.lift = tw ? apex : apex * (1 - k * k); irhHold(now, b.lift + 5);
    if (u >= b.ms) irhSlam(g, b, now);
    return b.ph === 'dive' ? P.up[Math.floor(u / 45) % 3] : P.land[0];
  }
  if (b.ph === 'land') { b.lift = 0; b.rot = 0; if (u >= IRH.land) { irBhEnd(g, now); return null; } return P.land[Math.min(5, Math.floor(u / IRH.land * 6))]; }
  irBhEnd(g, now); return null;
}
function irhSlam(g, b, now) {      // the end of the dive: the enemy is thrown down onto the floor in front of him, the damage, the dust; he lands
  const d = dummy, tw = twOn(), x = wx + IRH.hx / 2; b.ph = 'land'; b.at = now; b.lift = 0; b.rot = 0;
  if (d && d.ko < 0) {
    d.air = null; d.airH = 0; d.x = wx + 26; d.vx = 0; irhHit(now, tw ? IRH.slamT + IRH.slamF * b.D : IRH.slamS, { knock: 2, sy: 18, rx: 4 });
    if (d.ko < 0) { d.rx = 4; d.rxAt = now; d.down = now + RX_DUR[4]; d.stunUntil = Math.max(d.stunUntil || 0, now + RX_DUR[4] + 200); d.hitDone = false; if (tw) { const T = vs.tw; T.dDown = d.down; T.dHit = d.hitAt; } }
  }
  debBurst(x, 6, 20, ['#8a8a92', '#6d6d75', '#b8b0a0', '#6d3b2c'], 170); puff(x - 8, 8); puff(x + 8, 8); gritAt(x, 14, 130, 0); shockAt(x, 300, 130, 1); snd('concboom'); snd('land', 2.4); flash(now, 120, 0.25); shakeUntil = Math.max(shakeUntil, now + 520); shakeAmp = Math.max(shakeAmp, 6); hitStop(90);
  if (tw) snd('twbreak', 7); say('SLAM!', wx - 16, '#ffd34d', 8, now);      // (left of the damage number, which is where the enemy lies, 26 px in front of him)
}
// ---- what customScene draws round the move: the pair turning over (a canvas transform about the middle of the hug), the wind of the climb and the dive
function irBhGrp(g) { const b = g.bh; if (!b || !b.rot) return null; return { px: Math.round(VW / 2) + IRH.hx / 2, py: gy - 32 - Math.round(b.lift), a: b.rot, hi: b.lift > 5 }; }      // (the middle of the hug is IRH.hx / 2 in front of his hips and 32 px above the floor, where his hips are: lift is the height of his feet)
function irGrpTf(grp) { ctx.translate(grp.px, grp.py); ctx.rotate(grp.a); ctx.translate(-grp.px, -grp.py); }
function irGrpBegin(grp, foe) {      // the enemy is drawn in the turned frame, cut to the place the two of them take up (his shadow, on the floor, would turn with him and hang in the air)
  ctx.save(); irGrpTf(grp); if (foe && grp.hi) { ctx.beginPath(); ctx.rect(grp.px - 70, grp.py - 37, 140, 72); ctx.clip(); }
}
function irBhFx(g, now, cx, x, y, src) {      // streaks of wind: the climb and the turn (they run down the screen), the dive (up the screen, much faster); v1.195 the light at the palm in the BLAST
  const b = g.bh; if (b && b.kind) { if (b.kind === 'spin') irsFront(g, b, now, x, y, src); else if (b.kind === 'uni') iruFront(g, b, now, x, y, src); else if (b.kind === 'beam') irbFront(g, b, now, x, y, src); else if (b.kind === 'laser') irlFront(g, b, now, x, y, src); return; } if (!b || (b.ph !== 'up' && b.ph !== 'turn' && b.ph !== 'dive')) return; const dir = b.ph === 'dive' ? -1 : 1, v = b.ph === 'dive' ? 1100 : 420;
  ctx.save(); ctx.fillStyle = 'rgba(235,245,255,0.34)';
  for (let i = 0; i < 14; i++) { const x = (i * 47 + 13) % VW, len = 12 + (i * 7) % 16, y = (((now * v / 1000 * dir * (0.8 + (i % 3) * 0.3) + i * 37) % VH) + VH) % VH; if (Math.abs(x - cx) > 14) ctx.fillRect(x, Math.round(y), 1, len); }
  ctx.restore();
}
function irWorld(g, now, cx, x, y, src) {      // customScene, after the enemy and before him: the beam of the BLAST or the laser, and (every frame, also when the move is over) the hole the laser made in the enemy
  const b = g.bh; if (b && b.kind === 'spin') irsBack(g, b, now, x, y, src); else if (b && b.kind === 'uni') iruBack(g, b, now, x, y, src); else if (b && b.kind === 'beam') irbBack(g, b, now, x, y, src); else if (b && b.kind === 'laser') irlBack(g, b, now, x, y, src);
  irlWorld(now, cx);
}
