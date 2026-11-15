// ================================================================ v1.198 THE CITY: THE STREET AND THE SKYSCRAPER ARE ONE PLACE (this file is spliced into template.html by build_html.py, right after towerart.js)
// The user, after v1.197: "I want you to connect the maps together, the street will be on floor one of you leave the building through the front door you will go right into the street map". He answered one round of questions: the door is walked into (no button), the enemy follows a moment later, the maps are joined both ways and the map screen keeps both buttons (it only says where the match STARTS), a fighter thrown through the glass of any floor falls into the street, and the lobby's windows show the street.
// THE STREET is floor 0 of the building: a match that starts in the street (twPick 0) has the building too, in the lobby of which you walk in through the FRONT DOOR of the building, which stands in the street at CITY.door; a match that starts in the skyscraper (twPick 1, the penthouse as always) has the street too, at the front door of the LOBBY (floor 1), at CITY.fx, the left end of its first room. You use a door by WALKING INTO IT (ctWalk): stand in its place for a moment (CITY.dwell ms) walking towards it, free to move, on the ground. The building is made by twNew (tools/tower.js): by twInit when the match starts in it, or by ctGoIn the first time you walk in. vs.map is 'tower' while you are in it and 'street' while you are out: twOn() is false in the street, so everything that is the street's (the street's drawing, the street's rules, every fighter's street move) is simply the street. vs.tw stays: the building is kept (its damage, its elevator, its floors) while you are out.
// THE ENEMY follows a moment later (the state is T.away: he is held far off, still, until he comes): out of the front door after CITY.follow ms when he was with you, after more when he is on a higher floor (CITY.base + CITY.step a floor), down through the window after you when you were thrown out of it (CITY.hole); and into the lobby through its front door when you go in. A fighter thrown out through the glass of a floor lands in the street (the camera falls with the thrower: the slide of tools/tower.js ends in a band that is the street, ctStreetBand), and the other follows: the enemy flung out is in the street (T.foeSt), and you jump out after him a moment later (twRunQ).
// THE ROUNDS: every round of a match begins where the match began (ctRound), the damage of the building stays.
const CITY = { door: -150, hw: 62, fx: 42, zone: 15, dwell: 110, follow: 1100, hole: 1500, base: 1400, step: 420, max: 8000, lock: 700, land: 100, out: 46, inn: 44 };      // (door: where the front door of the building stands in the street; hw: half the width of its front; fx: where the front door stands in the lobby; zone: how close you must be (px) to walk into a door; dwell: for how long (ms); follow, hole, base, step, max: when the enemy comes out (ms); lock: the doors do not take you for this long after one has; land: how far from the door a fighter who fell out of a window lands; out, inn: where you stand when you come out / come in)
let ctS = { t: 0, arm: true, lock: 0, px: 0 };      // (the door you are walking into: for how long, whether it is armed (you have let go since the last one), when it may take you again, where you were a frame ago)

const ctOn = () => !!vs && state === 'play' && !vs.story && !vs.hunt && !vs.rush && !vs.cv && !vs.net && !alley;      // (is the city joined up in this fight? free play and Versus: not the story fights, the hunts, the rush, the curses, the Wi-Fi fight)
const ctLand = side => CITY.door + (side ? CITY.land : -CITY.land);      // (where a fighter lands who came out of a window at the left (0) or the right (1) end of a floor)
function ctFree(now) { return !!vs && vs.ph === 'fight' && !dom && !cutsceneOn() && !paused && gojoLift < 5 && !(gAir && gAirH > 5) && !redWhy(now) && !(vs.nHold > now) && !(twOn() && vs.tw.slide); }      // (he can walk: on the ground, not hit, down, held or in a cutscene, the camera not travelling)
function ctWalk(now, dt, dx) {      // he is walking INTO a door that is dx px to his right (negative: to his left): true on the frame it takes him
  const dir = ((keyR || padR) ? 1 : 0) - ((keyL || padL) ? 1 : 0), mv = wx - ctS.px; ctS.px = wx;
  if (dir === 0 || Math.abs(dx) > CITY.zone * 4) ctS.arm = true;      // (he has let go, or is far away: the door is armed again after the last one)
  const into = Math.abs(dx) < 3 || Math.sign(dx) === dir;
  if (ctS.arm && now >= ctS.lock && Math.abs(dx) < CITY.zone && dir !== 0 && into && mv * dir > 0.02) ctS.t += dt * 1000; else ctS.t = 0;
  return ctS.t >= CITY.dwell;
}
function ctHoldLift() { const T = vs.tw, L = T.lift; L.job = null; L.inFoe = false; L.out = false; L.foeInAt = 0; T.viaLift = false; }      // (the enemy is not in the cab any more, nor on his way to it)

// ---- the frame: the door you are walking into, the enemy coming out
function ctTick(now, dt) {
  if (!ctOn() || !dummy || state !== 'play') return;
  const T = vs.tw;
  if (twOn()) {      // (in the building: the front door of the lobby)
    const F = T.fl[1]; if (!F || !F.front || T.fMe !== 1 || T.cab || T.slide) { ctS.t = 0; return; }
    if (ctFree(now) && ctWalk(now, dt, F.front.x - wx)) ctGoOut(now, 'door', 0); else if (!ctFree(now)) ctS.t = 0;
    return;
  }
  if (T && T.out && T.away) { const d = dummy; if (d.ko >= 0) { T.away = false; d.twAway = false; } else { twFoeHold(now); if (now >= T.outAt) ctFoeOut(now); } }      // (in the street, the enemy is still in the building: he comes out when it is time)
  if (ctFree(now) && ctWalk(now, dt, CITY.door - wx)) ctGoIn(now); else if (!ctFree(now)) ctS.t = 0;
}

// ---- out of the building
function ctGoOut(now, how, side) {      // you leave the building: how 'door' = through the front door of the lobby, 'glass' = through the glass of any floor (from above the camera falls with you, floor after floor, and ends in the street)
  const T = vs.tw, d = dummy, f = T.fMe; if (T.cab || T.slide || !(f >= 1) || !d) return;
  const lx = how === 'door' ? CITY.door + CITY.out : ctLand(side), foeHere = d.ko < 0 && !T.away && T.fFoe === f; T.q.length = 0;
  if (how === 'glass' && f > 1) {
    const nn = f - 1, dm = Math.max(1, Math.round(PHP * Math.min(0.30, 0.03 * nn))); twHurtMe(dm, now, true); T.lastFallX = null;
    twSlideStart(now, f, 0, wx, 'fall', foeHere ? d.x : null); T.slide.street = { x: lx, how, side, foeHere, land: ['FALL', nn, dm] };
    if (foeHere) { T.away = true; d.twAway = true; T.awayX = d.x; T.via = 'street'; }      // (he stays up there, in sight while the camera falls: twAwayStep waits; ctSwitchOut says when he comes)
    return;
  }
  ctSwitchOut(now, lx, how, side, foeHere);
}
function ctArrive(now, s) { const q = s.street; ctSwitchOut(now, q.x, q.how, q.side, q.foeHere); if (q.land) twLand(now, q.land[0], q.land[1], q.land[2]); }      // (the camera has fallen to the street: you are in it)
function ctSwitchOut(now, lx, how, side, foeHere) {      // the street: you stand at lx, the building stays as it is (the enemy: out here already, or following, or still coming down from his floor)
  const T = vs.tw, d = dummy, f0 = T.fMe, live = !!d && d.ko < 0, outside = live && !foeHere && T.away && (T.foeSt || T.via === 'front'), fx0 = T.foeSt ? T.foeX : CITY.door + 70;
  vs.map = 'street'; T.out = true; T.cab = null; T.slide = null; T.q.length = 0; T.cf = 1; twClearWorld(); wx = lx; wxv = 0; wvx = 0; popups = []; ctS.arm = false; ctS.lock = now + CITY.lock; ctS.t = 0; ctS.px = wx;
  T.fMe = 0; T.via = 'stairs';
  if (!live) { T.away = false; if (d) d.twAway = false; return; }
  if (outside) {      // (he is out here already: he was flung out through the glass, or was still on his way in)
    T.away = false; d.twAway = false; T.fFoe = 0; T.foeSt = false; d.x = Math.abs(fx0 - wx) < 30 ? wx + 44 : fx0; d.vx = 0; d.down = 0; d.air = null; d.airH = 0; d.stunUntil = now + 600; d.ai = 'rest'; d.aiAt = now; d.restFor = 600; T.dx = d.x; ctHoldLift(); return;
  }
  if (foeHere) { const dr = how === 'door' || f0 === 1; T.fFoe = f0; T.awayX = d.x; T.outAt = now + (dr ? CITY.follow : CITY.hole); T.outVia = dr ? 'door' : 'hole'; T.outX = lx + (side ? 36 : -36); }      // (he was with you: he follows, out of the door, or down through the window after you from a floor above the lobby)
  else { T.outAt = now + Math.min(CITY.max, CITY.base + CITY.step * Math.max(0, T.fFoe - 1)); T.outVia = 'door'; ctHoldLift(); }      // (he is on another floor: down the stairs, and out of the front door)
  T.away = true; d.twAway = true; twFoeHold(now);
}
function ctFoeOut(now) {      // the enemy comes out into the street: through the front door, or down through the window after you
  const T = vs.tw, d = dummy, hole = T.outVia === 'hole'; let x = hole ? T.outX : CITY.door + (wx >= CITY.door ? 1 : -1) * 30; if (Math.abs(x - wx) < 50) x = wx + 44;      // (if you stand next to where he comes out, he is in front of you)
  ctHoldLift(); T.away = false; T.fFoe = 0; T.foeSt = false; d.twAway = false; d.x = x; d.vx = 0; d.down = 0; d.stunUntil = now + 350; d.ai = 'rest'; d.aiAt = now; d.restFor = 350; T.dx = d.x;
  if (hole) { d.air = airMake(now, 90, 0, 520, 'bounce'); puff(x, 8); debBurst(x, 40, 10, ['#8a8a92', '#b8b0a0'], 110); snd('twbreak', 7); } else { puff(x, 5); snd('twbreak', 6); snd('twlift', 1); ctDoorS.force = now + 1200; }      // (he comes out of the door: its leaves slide apart for him)
  say('ENEMY!', x, '#ffd34d', 8, now);
}
function ctFoeGlass(now, side, x) {      // the enemy goes out through the glass of the lobby: he is in the street (T.foeSt, set by twFallOut), away from you until you come out or he comes in
  const T = vs.tw, d = dummy; if (!d || d.ko >= 0 || T.away) return;
  T.fFoe = 1; T.away = true; d.twAway = true; T.awayX = x; T.lastFallX = null; d.air = null; d.airH = 0; d.down = 0; d.x = wx + 1e5; d.vx = 0; d.stunUntil = now + 900; twPlanArrival(now);
}
function ctFoeHere(now) {      // (PUT ENEMY and RESET of free play, in the street): the enemy is where you are, not in the building
  const T = vs && vs.tw; if (!T || !T.out) return; const d = dummy; T.away = false; T.foeSt = false; T.fFoe = 0; T.outAt = 0; T.q.length = 0; if (d) d.twAway = false; ctHoldLift();
}

// ---- into the building
function ctBuild() { if (!vs.tw) { twNew(); const T = vs.tw; T.cf = 1; T.prevF = 0; T.seen[1] = 1; } return vs.tw; }      // (a match that began in the street has no building until you first walk in: it starts as the lobby)
function ctGoIn(now) {      // you walk into the front door of the building: you are in its lobby (floor 1), in front of its door
  const T = ctBuild(), d = dummy; T.on = true; const F = twFloorData(1), together = !!d && d.ko < 0 && !T.away, foeIn = !!d && d.ko < 0 && T.away;
  vs.map = 'tower'; T.out = false; T.cab = null; T.slide = null; T.q.length = 0; T.fMe = 1; T.lastFallX = null; twFloorSwitch(now, F.front.x + CITY.inn, 'cut'); snd('twlift', 1); snd('twbreak', 6);
  ctS.arm = false; ctS.lock = now + CITY.lock; ctS.t = 0; ctS.px = wx;
  if (together) { T.away = true; d.twAway = true; T.fFoe = 1; T.via = 'front'; T.arriveAt = now + CITY.follow; T.awayX = F.front.x + 30; T.foeSt = false; twFoeHold(now); ctHoldLift(); }      // (he was with you in the street: he follows through the door)
  else if (foeIn) { if (T.fFoe < 1) T.fFoe = 1; twPlanArrival(now); }      // (he was still inside, on his way out: now he comes to you as he does from any floor)
  T.px = wx; T.dx = d ? d.x : 0; T.pHp = vs.hp; T.dHp = d ? d.hp : 0; T.dHit = d ? d.hitAt : -9999; T.dDown = d ? d.down || 0 : 0; T.pDown = gDownUntil;      // (what the blows of the next frame are measured against: not what happened out in the street)
}

// ---- a round (beginRound): where the match began
function ctRound(now) {
  ctS = { t: 0, arm: true, lock: 0, px: wx }; const T = vs.tw; if (!T) return; ctHoldLift(); T.q.length = 0; T.slide = null; T.cab = null; T.away = false; T.foeSt = false; T.outAt = 0; T.via = 'stairs'; if (dummy) dummy.twAway = false;
  if (vs.twStart) { vs.map = 'tower'; T.out = false; } else { vs.map = 'street'; T.out = true; T.fMe = 0; T.fFoe = 0; }
}

// ---- what the screen says: where the enemy is while you are out and he is not
function ctOverlay(now) {
  const T = vs && vs.tw; if (!T || !T.out || twOn() || !ctOn() || !T.away) return; if (ryUlNoHud() || cutsceneOn()) return;
  pxt(T.fFoe > 1 ? 'FOE ' + T.fFoe + ' DOWN' : 'FOE COMING', Math.round(VW / 2), 53, '#ffb27a', 8, 'center');
}
window.__ct = () => ({ on: ctOn(), map: vs ? vs.map || 'street' : '', built: !!(vs && vs.tw), out: !!(vs && vs.tw && vs.tw.out), away: !!(vs && vs.tw && vs.tw.away), fMe: vs && vs.tw ? vs.tw.fMe : -1, fFoe: vs && vs.tw ? vs.tw.fFoe : -1, outAt: vs && vs.tw ? Math.round(vs.tw.outAt - pnow()) : 0, via: vs && vs.tw ? vs.tw.via : '', foeSt: !!(vs && vs.tw && vs.tw.foeSt), wx: Math.round(wx), dx: dummy ? Math.round(dummy.x - wx) : null, door: CITY.door, fx: CITY.fx, t: Math.round(ctS.t), arm: ctS.arm });      // test hook

// ================================================================ THE LOOK: the front of the building in the street, the front door of the lobby, the street seen through the lobby's windows, the street as the last band of a fall
let ctDoorS = { open: 0, ot: 0, force: 0 };      // the front of the building in the street: how far its doors are open (they slide apart for you, and for the enemy who comes out)
function ctOpenStep(a, near, now) { const dt = Math.min(80, Math.max(0, now - (a.ot || now))); a.ot = now; a.open = (a.open || 0) + ((near || (a.force || 0) > now ? 1 : 0) - (a.open || 0)) * (1 - Math.exp(-dt / 110)); return a.open; }
function ctEntrance(now) {      // (inside the street's picture, which is shifted up FAR px: the base line is gy - 2) the front of the building: the tower rising off the top of the screen, the lit lobby behind its glass, the canopy and the sign, the doors
  const sx = Math.round(VW / 2 + CITY.door - wx), hw = CITY.hw; if (sx + hw + 6 < 0 || sx - hw - 6 > VW) return;
  const B = gy - 2, r = twR, q = twQ(), W = hw * 2, x0 = sx - hw, o = ctOpenStep(ctDoorS, Math.abs(wx - CITY.door) < 30, now);
  const tw = 104, tx = sx - (tw >> 1), top = B - 58;      // (the shaft above the lobby is a little narrower than the lobby)
  r(tx, -24, tw, top + 24, '#0e1426'); r(tx, -24, 2, top + 24, '#050812'); r(tx + tw - 2, -24, 2, top + 24, '#1d2848');
  if (q >= 1) for (let c = 1; c < 6; c++) r(tx + c * 17, -24, 1, top + 24, '#0a0f1f');
  if (q >= 2) for (let ro = 0; ro < 10; ro++) for (let c = 0; c < 5; c++) { const px = tx + 8 + c * 17, py = top - 12 - ro * 12, lit = twHash(c * 7 + ro, 11) < 0.4; r(px, py, 9, 7, lit ? (twHash(c + 3, ro) < 0.2 ? '#bfe6ff' : '#ffd98a') : '#162040'); if (lit) r(px, py, 9, 1, '#fff2c4'); r(px, py + 7, 9, 1, '#080c1a'); }      // (a window every 17 px, 12 px up, some lit)
  r(x0, top - 4, W, 4, '#2c3556'); r(x0, top - 4, W, 1, '#58648e'); r(x0, top, W, 1, '#0a0e1c');      // (the cornice)
  r(x0, top, W, 58, '#171d34'); r(x0, top, 5, 58, '#7d84a0'); r(x0 + 5, top, 1, 58, '#4a5070'); r(x0 + W - 5, top, 5, 58, '#59607c'); r(x0 + W - 6, top, 1, 58, '#3a4058');      // (the lobby: stone, a pilaster at each end)
  const gx = x0 + 9, gw = W - 18, gt = B - 38;      // (the glass front, lit from inside)
  for (let i = 0; i < 5; i++) r(gx, gt + i * 7, gw, 7, ['#fff2c4', '#ffe9a8', '#fbd884', '#f0c470', '#dca85a'][i]);
  if (q >= 2) { r(gx + 8, B - 22, 6, 18, '#3a2a1c'); r(gx + 6, B - 26, 10, 5, '#2f7d4f'); r(gx + gw - 18, B - 22, 6, 18, '#3a2a1c'); r(gx + gw - 20, B - 26, 10, 5, '#2f7d4f'); r(gx + 22, B - 14, 20, 10, '#7a1f2b'); r(gx + 22, B - 14, 20, 2, '#a63a48'); r(gx + gw - 44, B - 14, 20, 10, '#7a1f2b'); r(gx + gw - 44, B - 14, 20, 2, '#a63a48'); }      // (plants and sofas inside: dark shapes against the light)
  for (let k = 0; k <= 6; k++) r(gx + Math.round(k * (gw - 2) / 6), gt, 2, 34, '#2a2418'); r(gx, B - 22, gw, 2, '#2a2418'); r(gx, B - 4, gw, 4, '#3a3f58'); r(gx, B - 4, gw, 1, '#6d7488');
  const dx0 = sx - 17, dw = 34, dh = 34, dt = B - dh;      // (the doors)
  r(dx0 - 2, dt - 3, dw + 4, dh + 3, '#cfd6e6'); r(dx0 - 2, dt - 3, dw + 4, 1, '#ffffff'); r(dx0, dt, dw, dh, '#0b1024');
  const gap = Math.round(o * 15); if (gap > 0) { r(sx - gap, dt, gap * 2, dh, '#fff6d0'); r(sx - gap, dt, gap * 2, 2, '#ffffff'); }
  for (const sd of [-1, 1]) { const lw = (dw >> 1) - gap; if (lw <= 0) continue; const lx = sd < 0 ? dx0 : sx + gap; r(lx, dt, lw, dh, '#5f93b4'); r(lx, dt, lw, 1, '#dff2fb'); for (let i = 0; i < 6; i++) r(lx + 2 + ((i * 5) % Math.max(1, lw - 4)), dt + 3 + i * 5, 2, 3, 'rgba(255,255,255,.35)'); r(lx, dt, 1, dh, sd < 0 ? '#dff2fb' : '#3a5a72'); r(lx + lw - 1, dt, 1, dh, sd < 0 ? '#3a5a72' : '#dff2fb'); r(lx, dt + 18, lw, 1, '#3a5a72'); r(sd < 0 ? lx + lw - 3 : lx + 1, dt + 16, 2, 5, '#cfd6e6'); }
  r(sx - 24, B - 43, 48, 4, '#0a0d18'); r(sx - 24, B - 43, 48, 1, '#58648e'); r(sx - 24, B - 40, 48, 1, '#000000');      // (the canopy)
  r(sx - 24, top + 3, 48, 14, '#06070c'); r(sx - 24, top + 3, 48, 1, '#8a6a22'); r(sx - 24, top + 16, 48, 1, '#8a6a22'); r(sx - 24, top + 3, 1, 14, '#8a6a22'); r(sx + 23, top + 3, 1, 14, '#8a6a22');
  const sw = twTextW('TOWER', 2); twText(ctx, 'TOWER', sx - (sw >> 1) + 1, top + 7, 2, '#6a4a10'); twText(ctx, 'TOWER', sx - (sw >> 1), top + 6, 2, '#f1d68a');      // (the sign, in the colours of the logo of the lobby)
  r(x0 - 3, B, W + 6, 2, '#8a90ac'); r(x0 - 3, B, W + 6, 1, '#c9cee2');      // (the step)
}
function ctEntranceGlow(now) {      // (after the road is drawn) the light of the lobby on the road in front of the doors
  const sx = Math.round(VW / 2 + CITY.door - wx); if (sx + 80 < 0 || sx - 80 > VW) return; const y0 = gy - FAR, n = VH - y0; ctx.save(); ctx.fillStyle = '#ffd98a';
  for (let i = 0; i < Math.min(n, 18); i++) { ctx.globalAlpha = 0.2 * (1 - i / 18) * (0.85 + 0.15 * ctDoorS.open); const hw = 30 + i * 2; ctx.fillRect(sx - hw, y0 + i, hw * 2, 1); }
  ctx.restore();
}
function ctFrontDoor(F, sx, now) {      // the front door of the lobby: two glass leaves that slide apart as you come up to it, the night street behind them
  const fr = F.front, x = Math.round(sx), yf = gy - 7, top = yf - 62, r = twR, o = ctOpenStep(fr, vs.tw.fMe === F.f && Math.abs(wx - fr.x) < 30, now);
  r(x - 24, yf, 48, 2, 'rgba(0,0,0,.32)');
  r(x - 26, top - 5, 52, 67, '#6d7488'); r(x - 26, top - 5, 52, 1, '#c9d0de'); r(x - 26, top - 5, 1, 67, '#aab2c4'); r(x + 25, top - 5, 1, 67, '#3a4052'); r(x - 23, top - 1, 46, 59, '#080d20');
  r(x - 23, top - 1, 46, 20, '#0d1638'); r(x - 23, top + 19, 46, 20, '#101a42');      // (the night, the street outside: blocks of buildings with lit windows, a lamp)
  r(x - 23, top + 32, 14, 26, '#0b1230'); r(x - 6, top + 26, 16, 32, '#0a102a'); r(x + 12, top + 34, 11, 24, '#0b1230');
  for (let i = 0; i < 9; i++) r(x - 21 + (i % 3) * 5, top + 35 + ((i / 3) | 0) * 7, 2, 3, i % 4 === 1 ? '#262e58' : '#ffd98a'); for (let i = 0; i < 6; i++) r(x - 4 + (i % 3) * 5, top + 30 + ((i / 3) | 0) * 8, 2, 3, i % 2 ? '#bfe6ff' : '#262e58'); for (let i = 0; i < 4; i++) r(x + 14 + (i % 2) * 5, top + 38 + ((i / 2) | 0) * 8, 2, 3, i % 3 === 2 ? '#262e58' : '#ffd98a');
  r(x + 3, top + 16, 1, 42, '#06070e'); r(x - 1, top + 14, 9, 2, '#06070e'); r(x - 2, top + 16, 4, 3, '#ffd98a'); r(x - 2, top + 19, 4, 1, 'rgba(255,217,138,.4)');
  const gap = Math.round(o * 14), lw0 = 23;
  if (gap > 0) { r(x - gap, top - 1, gap * 2, 59, 'rgba(255,246,208,.18)'); }
  for (const sd of [-1, 1]) { const lw = lw0 - gap; if (lw <= 0) continue; const lx = sd < 0 ? x - 23 : x + gap; ctx.fillStyle = 'rgba(150,205,235,.30)'; ctx.fillRect(lx, top - 1, lw, 59); for (let i = 0; i < 7; i++) r(lx + 2 + ((i * 5) % Math.max(1, lw - 4)), top + 3 + i * 7, 2, 4, 'rgba(255,255,255,.30)'); r(lx, top - 1, lw, 2, '#cfd6e6'); r(lx, top + 55, lw, 3, '#8a93a8'); r(lx, top - 1, 1, 59, '#cfd6e6'); r(lx + lw - 1, top - 1, 1, 59, '#cfd6e6'); r(lx, top + 29, lw, 1, '#cfd6e6'); r(sd < 0 ? lx + lw - 4 : lx + 2, top + 26, 2, 7, '#e8ecf4'); }
  r(x - 23, yf - 3, 46, 3, '#59607a'); r(x - 23, yf - 3, 46, 1, '#8a93a8'); r(x - 18, yf - 1, 36, 2, '#2a211c');
}
function ctFrontEmit(F, sx, now) {      // (over the darkness) the lit sign over the front door of the lobby
  const x = Math.round(sx), top = gy - 7 - 62, r = twR, y = top + 1; r(x - 14, y, 28, 12, '#05101c'); r(x - 14, y, 28, 1, '#2c63c9'); r(x - 14, y + 11, 28, 1, '#12306a'); r(x - 14, y, 1, 12, '#12306a'); r(x + 13, y, 1, 12, '#12306a');
  twText(ctx, 'STREET', x - 12, y + 4, 1, '#d8f0ff'); r(x + 11, y + 3, 1, 5, '#d8f0ff'); r(x + 10, y + 5, 1, 1, '#d8f0ff');      // (the sign is in the top of the doorway: the bars of the health stand over the top of the wall)
}
function ctStreetPic(now) {      // the street map's own picture, without the fighters: the night sky over the city, the shops, the lamps and the road, and the front of the building
  if (!bg) return; ctx.save(); ctx.translate(0, -FAR); ctx.drawImage(bg, 0, 0); if (SET.bgd >= 1) layer(far, 0.25); if (SET.bgd >= 2) { layer(near, 0.55); drawProps(now); } ctEntrance(now); ctx.restore(); drawGround(); ctEntranceGlow(now);
}
function ctStreetBand(camX, off, now) {      // the street as the last band of a fall out of a window (twSlideDraw): its picture in its own band of the screen
  const kw = wx; wx = camX; ctx.save(); ctx.beginPath(); ctx.rect(-8, gy - TW_CEIL - SH_Y - 9 + off, VW + 16, SH_H + 9); ctx.clip(); ctx.translate(0, off);
  try { ctStreetPic(now); } finally { ctx.restore(); wx = kw; }
}
function ctCar(x, y, dir, col, now, i) {      // a car seen from the side (22 x 9) with its lights on: the cabin, the wheels, the lights at the front (white) and the back (red)
  const r = twR, dk = twMix(col, '#000000', 0.45), lt = twMix(col, '#ffffff', 0.35);
  r(x + 1, y + 4, 20, 4, col); r(x + 1, y + 4, 20, 1, lt); r(x + 5, y, 11, 5, dk); r(x + 5, y, 11, 1, col); r(x + 6, y + 1, 4, 3, '#9fd0ee'); r(x + 11, y + 1, 4, 3, '#9fd0ee'); r(x + 3, y + 7, 4, 2, '#06070c'); r(x + 15, y + 7, 4, 2, '#06070c');
  const fx = dir > 0 ? x + 21 : x, bx = dir > 0 ? x : x + 21; r(fx, y + 5, 1, 2, '#fff6c0'); r(bx, y + 5, 1, 2, '#ff3a3a');
  ctx.save(); ctx.globalAlpha = 0.28; ctx.fillStyle = '#fff3b0'; for (let k = 1; k <= 7; k++) ctx.fillRect(dir > 0 ? fx + k : fx - k, y + 4 + (k >> 2), 1, 3 - (k >> 2)); ctx.restore();
}
const CT_CARS = [['#c0392b', 31], ['#2d6fa8', 44], ['#d4a017', 27], ['#3a8a6a', 38], ['#e8e8ee', 50], ['#7a3f9d', 34]];
function ctStreetSeen(F, now, x0, x1, yc, Q) {      // the lobby (floor 1): its windows, and what lies beyond the ends of the building, show the STREET: the sky and shops of the street map, the lamps, and cars with their lights on
  const T = vs.tw; T.lightning = 0; ctx.fillStyle = '#06081a'; ctx.fillRect(0, 0, VW, VH); if (!bg) return;
  const sh = -34 - FAR; ctx.save(); ctx.translate(0, sh); ctx.drawImage(bg, 0, 0); if (Q >= 1) layer(far, 0.25); if (Q >= 2) { layer(near, 0.55); drawProps(now); } ctx.restore();
  ctx.fillStyle = '#12132a'; ctx.fillRect(0, VH + sh, VW, -sh);      // (the road goes on below the picture)
  if (Q < 1) return;
  const P = 380, par = 0.75; for (let i = 0; i < CT_CARS.length; i++) {
    const dir = i % 2 ? 1 : -1, u = (((i * 71 + dir * now * 0.001 * CT_CARS[i][1]) % P) + P) % P, sx = Math.round((((u - wx * par) % P) + P) % P) - 40, y = 55 + (i % 3) * 2; if (sx > VW + 10) continue; ctCar(sx, y, dir, CT_CARS[i][0], now, i);
  }
}
