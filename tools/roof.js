// ================================================================ v1.220 THE ROOF, THE LONG FALL, THE CLING, THE BALCONY AND THE CRATER (spliced into template.html by build_html.py, right after wifi.js; the state `rof` is declared next to `bcl`)
// The user, after v1.219: "if you go on the top floor of the sky scraper map then you will be able to go to the roof which then you can jump off but if you do then you will fall for around 10 seconds with action lines as the background ... if the enemy falls too are 2 seconds or before then he will appear next to you and the user / enemy can fight while falling and also the building will be shown so it will be above layer of the action lines background and if i jump on the building then i will grab onto a random floor letting me cling on to the floor while the enemy falls down or the enemy can latch to but the timing of course, to get back in the building i will have to jump again to get on the balcony and if the window was not broken then the user will have to break it to get in letting the enemy if he is on the same floor in the building to shoot something at the user shooting him off maybe, if i fall to the ground then a crater will appear and also if i fall off the building then a crater will appear". Answers: normal fights first (no Wi-Fi), the landing is big damage but never a K.O., the enemy can hit you with a blow, throw a piece of furniture or shoot.
// ONE STATE, `rof` (null = none): ph 'roof' (the stairs up from floor 50: a flat roof, the hatch at its left end, a low wall at its right end: JUMP at it and you are over) -> 'fall' (50 floors in 10 s; the fighters stay on the line gy where the engine keeps them and the BACKDROP moves: sky, action lines, the building at the left with a balcony slab on every floor) -> 'cling' (JUMP close to the building catches the slab that comes next: a random floor) -> 'climb' (JUMP again) -> 'balcony' (the glass of the floor must be broken, then you walk into the room and the tower takes over again) ... 'fall' again when you are knocked off, and in the street: the crater and 30% of the health, never a K.O. While `rof` is set twOn() is false: the tower's own rules (floors, craters, stairs) sleep and the engine runs the fight as it does in the street.
// The enemy (`rof.fs`): 'with' (fighting next to you) 'melee' (the same, at the window) | held far off and drawn by rofFoeFx: 'wait' (still coming up the stairs) 'up' (will jump after you) 'away' (up on the roof / down in the street / on his way: `inAt` is when he is in the room) 'past' (fell past while you cling) 'latch' (hangs next to you) 'above' (stands on the balcony over you) 'inside' (in the room behind the glass: throws, shoots or comes to the window).
const ROF = { RW: 330, HATCH: 40, EDGE: 24, FL: 88, LO: 14, HI: 120, BAL: 24, HANG: 78, DMG: 0.3, JOINP: 0.85, NEAR: 34 };      // (RW: the right end of the roof = the face of the building in the fall; HATCH: where the stairs come up; EDGE: how close to the end a jump takes you over; FL: a floor (TW_CEIL); LO, HI: where the fighters may stand in the fall, from the face; BAL: how far a balcony reaches; HANG: how far below the slab your feet hang; DMG: the share of the health the street takes; JOINP: the chance that the enemy jumps after you; NEAR: how close to the face a JUMP catches a slab)
const ROF_VM = 5.45, ROF_A = ROF_VM / 2, ROF_HL = ROF.HANG / ROF.FL;      // (floors per second at full speed: 50 floors take 10 s from rest; it speeds up over about 2 s; the hang in floors)
const rofDist = (v0, t) => { const t1 = (ROF_VM - v0) / ROF_A; return t < t1 ? v0 * t + ROF_A * t * t / 2 : v0 * t1 + ROF_A * t1 * t1 / 2 + ROF_VM * (t - t1); };      // (floors fallen after t seconds, starting at v0 floors / s)
const rofSpd = (v0, t) => Math.min(ROF_VM, v0 + ROF_A * t);
const rofTLand = (s0, v0) => { const t1 = (ROF_VM - v0) / ROF_A, d1 = v0 * t1 + ROF_A * t1 * t1 / 2; return s0 <= d1 ? (-v0 + Math.sqrt(v0 * v0 + 2 * ROF_A * s0)) / ROF_A : t1 + (s0 - d1) / ROF_VM; };      // (seconds until s0 floors are fallen)
const rofRun = () => !!vs && vs.ph === 'fight' && !cutsceneOn() && !dom && !paused;      // (the clock of the fall only runs while the fight does)
const rofGnd = () => gojoLift < 5 && !(gAir && gAirH > 5);
const rofAir = () => !!rof && (rof.ph === 'fall' || rof.ph === 'cling' || rof.ph === 'climb');      // (no ground under anyone: no shadows)
const rofHang = () => !!rof && (rof.ph === 'cling' || rof.ph === 'climb' || rof.ph === 'balcony');
const rofFight = () => !!rof && (rof.fs === 'with' || rof.fs === 'melee');
const rofWin = () => twFloorData(rof.slab).outer[rof.side];      // (the glass of the floor you are at, on the side you fell from (the roof: the right end): the window you break)
const rofWindK = () => rof && rof.ph === 'fall' ? 1 + 3 * Math.min(1, rof.v / ROF_VM) : 1;      // (the wind sound: louder the faster you fall, see sfx.windPush)
const rofNew = (now, o) => Object.assign({ ph: 'roof', at: now, ft: 0, s: 50, s0: 50, v0: 0.45, v: 0, slab: 0, L: 0, fs: 'away', pend: '', fAt: 0, foeFl: 0, inAt: 0, inFl: 0, join: 0, amb: 0, pj: [], doorAt: -1, sd: false, sd2: false, leap: null, br: null, brT: 1, bt: 0, ct: 0, gripAt: 0, swAt: 0, swP: 6, px: 0, gv: 0, gat: 0, fAt2: 0, side: 1, jat: -1e9, psMe: 1, psFoe: 1, actUntil: 0 }, o);      // (every field of the state, so the roof and a window can both begin one)
const rofYo = () => -(rof.L - rof.s) * ROF.FL;      // (how far the slab you are at is above the line you stand on: 0 on the balcony, 78 px while you hang)

// ---------------------------------------------------------------- the enemy
function rofPlace(now, x) { const d = dummy; d.twAway = false; d.x = x; d.vx = 0; d.down = 0; d.air = null; d.airH = 0; d.stunUntil = now + 300; d.ai = 'rest'; d.aiAt = now; d.restFor = 300; }
function rofHold(now) { const d = dummy; if (!d || d.ko >= 0) return; d.twAway = true; twFoeHold(now); if (rofHang()) d.x = wx - 1e5; }      // (he is not in the fight: far off and still; far to your LEFT while you are at the building, so you face the window)
function rofHere(now) { if (!rof || !dummy || dummy.ko >= 0 || rof.ph === 'cling' || rof.ph === 'climb') return; rof.fs = 'with'; rofPlace(now, Math.min(ROF.RW + (rof.ph === 'roof' ? -6 : rof.ph === 'balcony' ? ROF.BAL - 3 : ROF.HI), wx + 48)); }      // (PUT ENEMY / RESET of free play)
function rofJoin(now) { const r = rof, hi = r.ph === 'fall' ? ROF.RW + ROF.HI : ROF.RW + ROF.BAL; r.fs = 'with'; r.jat = now; rofPlace(now, wx + 48 > hi ? wx - 48 : wx + 48); puff(dummy.x, 5); snd('swing', 3); shakeUntil = now + 200; shakeAmp = 2; }      // (he jumped after you inside 2 s: he is next to you)
function rofInside(now) { const r = rof; r.fs = 'inside'; r.inFl = r.slab; r.amb = now + 1100 + Math.random() * 500; snd('twbreak', 6); }      // (he is in the room of the floor you hang at)
function rofFoeGrab(now) {      // you caught a slab: what the enemy does about it
  const r = rof, d = dummy; if (!d || d.ko >= 0) return;
  if (r.fs === 'with') { r.fs = Math.random() < 0.45 ? 'latch' : 'past'; r.px = d.x; r.gv = r.br.v; r.brT = r.br.T; r.gat = now; r.fAt2 = now + 1400 + Math.random() * 1200; }      // (the timing: he catches the slab too, or he falls on past)
  else if (r.fs === 'inside' && r.inFl !== r.slab) { r.fs = 'away'; r.foeFl = r.inFl; r.inAt = 0; }      // (the room is not this one: he comes)
  else if (r.fs === 'up') r.fs = 'away';      // (he had not jumped yet: he does not any more)
  if (r.fs === 'away') r.inAt = now + Math.min(9000, 2600 + 700 * Math.abs(r.foeFl - r.slab));
}
function rofFoe(now) {      // every frame
  const r = rof, d = dummy; if (!d || d.ko >= 0) return;
  if (!rofFight()) rofHold(now);
  if (r.fs === 'past') { const ts = (now - r.gat) / 1000, T = r.brT, dy = r.gv * ROF.FL * (ts < T ? ts * ts / (2 * T) : T / 2 + ts - T); if (dy > VH + 70) { const n = Math.max(1, r.slab - 1), p = Math.min(ROF.DMG, 0.03 * n); twHurtFoe(Math.max(1, Math.round((d.max || DUMMY_HP) * p)), now, true); r.fs = 'away'; r.foeFl = 1; r.inAt = now + Math.min(9000, 2600 + 700 * n); } }      // (he hit the street: 3% a floor, never a K.O.; he walks back up)
  if (r.fs === 'latch' && now >= r.fAt2) { r.fs = 'above'; r.amb = now + 900 + Math.random() * 500; }      // (he climbs onto the balcony over you, and a moment later he throws or shoots down at you)
  if (r.fs === 'away' && rofHang() && r.inAt && now >= r.inAt) rofInside(now);
  if ((r.fs === 'inside' || r.fs === 'above') && rofHang()) rofAmbush(now);
}
function rofAmbush(now) {      // he is where you are going: after a moment he comes to the window, or throws a piece of furniture, or shoots
  const r = rof; if (now < r.amb) return; const O = rofWin(), k = Math.random();
  if (r.fs === 'inside' && r.ph === 'balcony' && O.broken && k < 0.34) { r.fs = 'melee'; rofPlace(now, ROF.RW - 10); r.amb = 1e12; return; }      // (the glass is gone: he steps to the opening and fights)
  const th = k < 0.7, yo = rofYo(), sx = ROF.RW - 14;
  r.pj.push({ k: th ? 'throw' : 'shoot', at: now + 450, x0: sx, y0: gy + 2 + yo - 30, tx: wx, ty: gy - 32, T: th ? 0.55 : 0.3, sp: ['chair', 'desk', 'table', 'computer'][(Math.random() * 4) | 0], x: sx, y: gy + 2 + yo - 30, done: false, br: false, gone: false });
  r.amb = now + 1700 + Math.random() * 900;
}
function rofShots(now) {      // what is flying: the aim is where you stood when it left; the glass breaks as it passes
  const r = rof;
  for (let i = r.pj.length - 1; i >= 0; i--) {
    const p = r.pj[i], t = (now - p.at) / 1000; if (t < 0) continue; if (!p.snd) { p.snd = true; snd('swing', p.k === 'throw' ? 3 : 1); } const k = t / p.T; p.x = p.x0 + (p.tx - p.x0) * k; p.y = p.y0 + (p.ty - p.y0) * k;
    if (!p.br && p.x >= ROF.RW - 2) { p.br = true; if (r.slab && !rofWin().broken) rofWinBreak(now); }
    if (!p.done && k >= 1) { p.done = true; if (!p.gone && Math.abs(wx - p.tx) < 16 && rofHang()) rofHit(now, p); }
    if (p.gone || t > 1.6) r.pj.splice(i, 1);
  }
}
function rofHit(now, p) {      // it reached you: under it (crouched) or over it (in the air) on the balcony, or it hits; a guard takes most of it; otherwise you are knocked off
  const r = rof, bal = r.ph === 'balcony', blocked = bal && blockHeld; if (bal && (stance === 'down' || stance === 'crouch' || gojoLift > 14 || (gAirH || 0) > 26)) return;
  twHurtMe(Math.max(1, Math.round(PHP * (blocked ? 0.02 : p.k === 'throw' ? 0.07 : 0.05))), now, true);
  debBurst(wx, 34, 10, p.k === 'throw' ? TW_K[p.sp].cols : ['#ffd34d', '#ff7a2a', '#ffffff'], 130); spark(wx, gy - 34, 6, ['#ffffff', '#ffd34d'], true, 1); snd(p.k === 'throw' ? 'twbreak' : 'hit', p.k === 'throw' ? 7 : 2); shakeUntil = now + 220; shakeAmp = 4; hitStop(70); flash(now, 90, 0.25); p.gone = true;
  if (blocked) wxv -= 90; else rofDrop(now);
}
function rofWinHit(now, p) {      // a blow on the glass (the same numbers as the tower's: 30 holds a few blows)
  const O = rofWin(), by = -rofYo(); O.hp -= p; O.at = now; debBurst(ROF.RW - 6, by + 28, 3 + ((p / 6) | 0), ['#e8f6ff', '#9fd8ff', '#2c63c9'], 70 + p); snd('twbreak', 1);
  if (O.hp <= 0) rofWinBreak(now);
}
function rofWinBreak(now) { const O = rofWin(), by = -rofYo(); O.broken = true; O.hp = 0; O.at = now; debBurst(ROF.RW - 6, by + 28, 26, ['#e8f6ff', '#9fd8ff', '#2c63c9'], 170); spark(ROF.RW - 4, gy + 2 - by - 28, 12, ['#ffffff', '#9fd8ff'], true, 1); snd('twbreak', 1); shakeUntil = Math.max(shakeUntil, now + 200); shakeAmp = Math.max(shakeAmp, 3); }

// ---------------------------------------------------------------- the stairs up, the roof
function rofEnter(now) {      // (twTravel at the top floor) the roof
  const T = vs.tw, d = dummy, live = !!d && d.ko < 0, here = live && !T.away;
  rof = rofNew(now, { fs: live ? 'wait' : 'away', pend: here ? 'follow' : 'travel', fAt: now + (here ? 1000 : Math.min(9000, 2600 + 700 * Math.abs(T.fFoe - TW_N))), foeFl: T.fFoe });
  twClearWorld(); wx = ROF.HATCH + 28; wxv = 0; wvx = 0; popups = []; snd('twbreak', 6); puff(wx, 5); if (live) rofHold(now);
}
function rofWindow(now, f, side) {      // (ctGoOut) out of a window of floor f > 1, thrown or walked: the same long fall as from the roof, from that floor; he who is in the room jumps after you (inside 2 s) or stays, he who was thrown out before you is in the street
  const T = vs.tw, d = dummy, live = !!d && d.ko < 0, here = live && !T.away && T.fFoe === f, out = live && T.away && T.foeSt;
  rof = rofNew(now, { ph: 'fall', s: f - 1, s0: f - 1, v0: 0.6, v: 0.6, side, fs: out ? 'street' : here && Math.random() < ROF.JOINP ? 'up' : 'away', foeFl: out ? 1 : T.fFoe, join: now + 450 + Math.random() * 1400, leap: { at: now, x0: ROF.RW - 6, x1: ROF.RW + 30, ms: 420 } });
  twClearWorld(); wx = ROF.RW - 6; wxv = 0; wvx = 0; popups = []; if (live) rofHold(now);
  debBurst(wx, 28, 24, ['#e8f6ff', '#9fd8ff', '#2c63c9'], 180); spark(wx, gy - 28, 12, ['#ffffff', '#9fd8ff'], true, 1); snd('twbreak', 1); snd('swing', 3); flash(now, 110, 0.3); shakeUntil = now + 320; shakeAmp = 3; slowMo(380, 0.45);
}
function rofToTower(now, n, x) {      // you are on floor n of the tower again, at x: the tower takes over; the enemy is where he was: with you, or still on his way
  const r = rof, T = vs.tw, d = dummy, live = !!d && d.ko < 0; rof = null;
  T.fMe = n; T.cab = null; T.slide = null; T.q.length = 0; T.lastFallX = null; const F = twFloorData(n); twFloorSwitch(now, x, 'cut');
  if (!live) { T.away = false; twBase(now); return; }
  const here = r.fs === 'with' || r.fs === 'melee' || r.fs === 'latch' || r.fs === 'above' || r.fs === 'inside' || (r.fs === 'wait' && r.pend === 'follow');
  if (here) { T.away = false; T.fFoe = n; T.foeSt = false; rofPlace(now, twPlace(F, wx + (n === TW_N ? 46 : -60))); d.stunUntil = now + 250; T.dx = d.x; twBase(now); return; }      // (up the stairs he is next to you; in at the window he is further in the room, never out of the opening)
  T.away = true; d.twAway = true; T.foeSt = false; T.via = 'stairs'; if (r.fs !== 'wait') T.fFoe = r.foeFl; if (T.fFoe === n) T.fFoe = n > 1 ? n - 1 : 2; T.awayX = wx; twFoeHold(now); twPlanArrival(now); if (T.via === 'stairs' && r.inAt) T.arriveAt = Math.max(now + 800, r.inAt); twBase(now);      // (twBase: what happened in the fall is not a blow of the tower: the health the tower measures from is today's)
}
function rofLeave(now) { rofToTower(now, TW_N, twFloorData(TW_N).doors.find(q => q.k === 'stairs').x); snd('twbreak', 6); }
function rofRoof(now) {
  const r = rof;
  if (r.fs === 'wait') { rofHold(now); if (now >= r.fAt) { r.fs = 'with'; r.pend = ''; rofPlace(now, ROF.HATCH + 12); puff(ROF.HATCH + 10, 5); snd('twbreak', 6); } }      // (he comes up the stairs after you)
  const near = rofGnd() && Math.abs(wx - ROF.HATCH) < 28, dn = crReq || (stickDown && !r.sd); r.sd = stickDown; if (near) { if (r.doorAt < 0) r.doorAt = now; } else r.doorAt = -1;
  if (near && now - r.doorAt >= 350 && dn) { crReq = false; rofLeave(now); return; }      // (CROUCH at the hatch: back down to floor 50)
  if (jumpReq && rofGnd() && ctFree(now) && wx > ROF.RW - ROF.EDGE) rofJump(now);      // (the engine's own hop is the leap)
}
function rofJump(now) {      // over the low wall: the fall begins
  const r = rof, d = dummy; r.ph = 'fall'; r.at = now; r.ft = 0; r.s0 = r.s = 50; r.v0 = r.v = 0.45; r.leap = { at: now, x0: wx, x1: ROF.RW + 30, ms: 420 }; if (r.pend !== 'travel') r.foeFl = TW_N; r.pend = '';
  if (d && d.ko < 0) { if (r.fs === 'with' && Math.random() < ROF.JOINP) { r.fs = 'up'; r.join = now + 450 + Math.random() * 1400; } else r.fs = 'away'; }      // (he jumps after you inside 2 s, or stays up)
  snd('swing', 3); shakeUntil = now + 300; shakeAmp = 2; twClearWorld(); slowMo(320, 0.5);      // (a short slow-motion beat as you leave the roof)
}

// ---------------------------------------------------------------- the fall, the grip, the climb, the balcony
function rofFall(now, dt) {
  const r = rof; r.ft += dt; r.s = r.s0 - rofDist(r.v0, r.ft); r.v = rofSpd(r.v0, r.ft);
  if (r.leap) { const k = Math.min(1, (now - r.leap.at) / r.leap.ms); wx = r.leap.x0 + (r.leap.x1 - r.leap.x0) * (1 - (1 - k) * (1 - k)); wxv = 0; if (k >= 1) r.leap = null; }
  if (r.fs === 'up') { rofHold(now); if (now >= r.join) rofJoin(now); }
  if (jumpReq && !r.leap && r.ft > 0.3 && ctFree(now) && rofGnd() && wx <= ROF.RW + ROF.NEAR && rofGrab(now)) jumpReq = false;
  if (r.s <= 0) { rofLand(now); return; }
  if (r.v > 2) { shakeUntil = now + 90; shakeAmp = 1.2; }
}
function rofGrab(now) {      // JUMP at the building: the slab that comes next under your hands is caught (a random floor): you brake in a fraction of a second and hang
  const r = rof, h = r.s + ROF_HL, L = Math.floor(h - 0.16 * r.v - 1e-6); if (L < 2 || L > 47) return false;
  const T = Math.max(0.15, Math.min(0.9, 2 * (h - L) / Math.max(0.3, r.v)));
  r.ph = 'cling'; r.at = now; r.slab = L + 1; r.L = L; r.br = { T, s1: r.s, s2: L - ROF_HL, v: r.v }; r.bt = 0; r.gripAt = now + T * 1000 + 300; r.leap = null; rofFoeGrab(now);
  snd('twbreak', 2); shakeUntil = now + 260; shakeAmp = 4; hitStop(60); spark(ROF.RW + 8, gy - 80, 10, ['#ffffff', '#ffd34d'], true, 1); return true;
}
function rofDrop(now, x1) {      // knocked off the slab (x1 = far from the wall) or let go (close to it): the fall goes on from here
  const r = rof; r.ph = 'fall'; r.at = now; r.s0 = r.s; r.v0 = 0.5; r.v = 0.5; r.ft = 0; r.br = null; r.gripAt = 0; r.leap = { at: now, x0: wx, x1: x1 || ROF.RW + 64, ms: 380 }; jumpReq = false;
  if (r.fs === 'melee' || r.fs === 'above' || r.fs === 'latch') { r.fs = 'inside'; r.inFl = r.slab; r.amb = now + 1200 + Math.random() * 600; }      // (the enemy who was at your window, on your balcony or hanging beside you stays up there, in the room)
}
function rofHangTick(now, dt) {
  const r = rof; if (r.ph === 'balcony') { rofBalcony(now); return; }
  vs.nHold = Math.max(vs.nHold || 0, now + 120); wx = ROF.RW + 8; wxv = 0; wvx = 0; const dn = crReq || (stickDown && !r.sd2); r.sd2 = stickDown;      // (the engine's own freeze: no walking, no blows while you hang or climb)
  if (r.ph === 'cling') {
    if (r.br) { r.bt += dt; const u = Math.min(1, r.bt / r.br.T); r.s = r.br.s1 + (r.br.s2 - r.br.s1) * (1 - (1 - u) * (1 - u)); r.v = r.br.v * (1 - u); if (u >= 1) { r.s = r.br.s2; r.br = null; r.v = 0; } }
    else if (jumpReq && now >= r.gripAt) { jumpReq = false; r.ph = 'climb'; r.at = now; r.ct = 0; snd('swing', 3); }
    else if (dn && now >= r.gripAt) { rofDrop(now, ROF.RW + 30); return; }      // (CROUCH: let go)
    else if (Math.random() < dt * 1.4) debBurst(wx + 4, 80, 1, ['#8a8a96', '#6a6a76'], 25);      // (bits of the slab fall from where you hold it)
  } else {      // climb: 0.5 s up onto the slab
    r.ct += dt; const u = Math.min(1, r.ct / 0.5); r.s = (r.L - ROF_HL) + ROF_HL * (1 - (1 - u) * (1 - u));
    if (u >= 1) { r.ph = 'balcony'; r.s = r.L; r.swAt = 0; snd('land', 1); puff(wx, 4); if (r.fs === 'latch' || r.fs === 'above') { r.fs = 'melee'; rofPlace(now, ROF.RW + 18); } }      // (he climbed too: the fight is on the balcony)
  }
}
function rofBalcony(now) {      // standing on the slab: break the glass (ATTACK / BLUE at it), then walk in
  const r = rof, O = rofWin();
  if (!O.broken) {
    if ((atkReq || lpReq) && now > r.swAt + 220) { r.swAt = now + 120; r.swP = lpReq ? 11 : 6; }
    if (r.swAt && now >= r.swAt) { r.swAt = 0; if (wx < ROF.RW + 30) rofWinHit(now, r.swP); }
  } else if (wx <= ROF.RW - 8) rofToTower(now, r.slab, r.side ? twFloorData(r.slab).W - 22 : 22);
}
function rofLand(now) {      // the street: the crater, 30% of the health (never a K.O.), the enemy next to you if he fell with you
  const r = rof, T = vs.tw, d = dummy, live = !!d && d.ko < 0, lx = ctLand(r.side), n = Math.max(1, Math.round(r.s0)), p = Math.min(ROF.DMG, 0.03 * n), dm = Math.max(1, Math.round(PHP * p)), withMe = live && r.fs === 'with', street = live && r.fs === 'street';
  rof = null;
  if (live) { T.away = true; d.twAway = true; if (withMe) { T.foeSt = true; T.foeX = lx + 44; } else if (street) T.foeSt = true; else { T.foeSt = false; T.fFoe = Math.max(1, Math.min(TW_N, r.fs === 'inside' || r.fs === 'above' || r.fs === 'latch' || r.fs === 'melee' ? (r.inFl || r.slab) : r.foeFl)); } }
  ctSwitchOut(now, lx, 'glass', r.side, false); twHurtMe(dm, now, true); twLand(now, 'FALL', n, dm); vs.crater = { x: lx };
  if (withMe) twHurtFoe(Math.max(1, Math.round((d.max || DUMMY_HP) * p)), now, true);
  debBurst(lx, 4, 44, ['#6a6a76', '#8a8a96', '#a0a0ac', '#4a4a56'], 260); puff(lx - 14, 8); puff(lx + 14, 8); puff(lx, 10); puff(lx - 26, 6); puff(lx + 26, 6); gritAt(lx, 14, 160, 0); shockAt(lx, 360, 140, 0.9); shockAt(lx, 220, 90, 0.6); snd('twbreak', 4); snd('land', 1.8); flash(now, 180, 0.45); shakeUntil = now + 800; shakeAmp = 8; hitStop(120); slowMo(650, 0.3);
}
function rofTick(now, dt) {      // every frame, before the tower's and the training step
  const r = rof; if (!r || state !== 'play' || !vs || !dummy) return; if (!rofRun()) { if (dummy.ko < 0 && !rofFight()) rofHold(now); return; }
  if (r.ph === 'roof') rofRoof(now); else if (r.ph === 'fall') rofFall(now, dt); else rofHangTick(now, dt);
  if (rof) { rofFoe(now); rofShots(now); const d = dummy; if (atkReq || lpReq || dashReq || ceReq || domReq) r.actUntil = now + 550;
    const busyMe = r.ph === 'fall' && (now < r.actUntil || atkAt >= 0 || (hurtAt >= 0 && now - hurtAt < 700) || blockHeld || !!dash || dgAt >= 0 || teleAt >= 0 || jumpAt >= 0 || stance === 'down' || stance === 'crouch'), busyF = r.ph === 'fall' && d.ko < 0 && ((d.ai !== 'rest' && d.ai !== 'think' && d.ai !== 'walk') || now - d.rxAt < RX_DUR[d.rx]);      // (the pose fades out while a fighter does something: a blow, a block, a dash, a hit; it is the idle and the walk that are posed)
    r.psMe += ((busyMe ? 0 : 1) - r.psMe) * Math.min(1, dt * 9); r.psFoe += ((busyF ? 0 : 1) - r.psFoe) * Math.min(1, dt * 9); }
}
function rofClamp() {      // after the player's movement (drawScene): the walls of the roof, of the fall and of the balcony
  const r = rof, d = dummy; if (!r) return; let lo, hi, flo, fhi;
  if (r.ph === 'roof') lo = flo = 16, hi = fhi = ROF.RW - 4;
  else if (r.ph === 'fall') lo = flo = ROF.RW + ROF.LO, hi = fhi = ROF.RW + ROF.HI;
  else if (r.ph === 'balcony') lo = rofWin().broken ? ROF.RW - 90 : ROF.RW + 4, hi = fhi = ROF.RW + ROF.BAL - 3, flo = ROF.RW - 80;
  else return;      // (hanging: the tick holds you at one place)
  if (!r.leap) { if (wx < lo) { wx = lo; if (wxv < 0) wxv = 0; if (wvx < 0) wvx = 0; } else if (wx > hi) { wx = hi; if (wxv > 0) wxv = 0; if (wvx > 0) wvx = 0; } }
  if (d && d.ko < 0 && rofFight()) { if (d.x < flo) { d.x = flo; if (d.vx < 0) d.vx = 0; } else if (d.x > fhi) { d.x = fhi; if (d.vx > 0) d.vx = 0; } }
}

// ---------------------------------------------------------------- what is seen: the night sky (stars, a moon, clouds), the towers far below, the ACTION LINES, the building at the left (over the lines: a stone base, a glass tower, a penthouse; at every floor a slab with a balcony and a window, rooms with furniture behind the glass, a lit sign band every tenth floor), the clouds you fall through, the roof, the street rushing up
const ROF_SKY = ['#04061a', '#070b26', '#0b1236', '#101a48', '#17245a', '#223270', '#34468a', '#4e64a6'];      // (night, like the tower's outside and the street: deep blue at the top, a glow at the horizon)
const ROF_NEON = ['#4ae8ff', '#ff4ad8', '#ffd34a', '#4aff9a', '#ff7a3a'], ROF_FUR = ['lamp', 'plant', 'shelf', 'chair', 'rack', 'cooler', 'cabinet', 'vending'];      // (the colours of the sign bands; the furniture behind the windows: the tower's own pieces)
function rofMoon() { const mx = Math.round(VW * 0.5), my = 24; for (let dy = -14; dy <= 14; dy++) { const w = Math.round(Math.sqrt(196 - dy * dy)); twR(mx - w, my + dy, w * 2 + 1, 1, 'rgba(190,205,255,0.07)'); } for (let dy = -8; dy <= 8; dy++) { const w = Math.round(Math.sqrt(64 - dy * dy)); twR(mx - w, my + dy, w * 2 + 1, 1, dy < -3 ? '#f4f6ff' : '#dfe4fa'); } twR(mx - 3, my - 3, 3, 2, '#bcc4e8'); twR(mx + 2, my + 2, 2, 2, '#bcc4e8'); twR(mx - 5, my + 3, 2, 1, '#bcc4e8'); }
function rofClouds(now) { for (let i = 0; i < 5; i++) { const w = 46 + ((twHash(i, 61) * 50) | 0), x = Math.round((((twHash(i, 63) * (VW + 200) + now / 1000 * (1.2 + twHash(i, 62) * 1.6) - wx * 0.1) % (VW + 200)) + VW + 200) % (VW + 200)) - 100, y = 20 + Math.round(twHash(i, 64) * 70); twR(x + 8, y, w - 16, 3, 'rgba(70,90,150,0.28)'); twR(x, y + 3, w, 4, 'rgba(60,80,140,0.3)'); twR(x + 12, y + 7, w - 22, 2, 'rgba(50,70,130,0.25)'); } }
function rofSky(now, k, calm) {
  const n = ROF_SKY.length, h = Math.ceil((VH + 16) / 9); for (let i = 0; i < h; i++) twR(-8, -8 + i * 9, VW + 16, 9, ROF_SKY[Math.max(0, Math.min(n - 1, Math.floor(i / h * (n - 3) + k * 3)))]);
  if (calm) for (let i = 0; i < 46; i++) { const x = Math.round(twHash(i, 3) * (VW + 8) - wx * 0.03), y = Math.round(twHash(i, 9) * VH * 0.55); twR(((x % (VW + 8)) + VW + 8) % (VW + 8), y, 1, 1, twHash(i, 17) < 0.2 ? '#ffffff' : ((now / 400 + i) | 0) % 7 === 0 ? '#5f6fb0' : '#9fb0e8'); }
  rofMoon(); if (calm) rofClouds(now);
}
function rofCity(now, base) {      // the other towers far below, in three layers anchored to the world: lit windows, red lamps on the nearest
  for (let l = 0; l < 3; l++) {
    const par = [0.1, 0.2, 0.34][l], col = ['#141d48', '#0f1740', '#0a1030'][l], W = [14, 19, 26][l], i0 = Math.floor((wx * par - VW / 2) / W) - 1;
    for (let i = i0; i <= i0 + Math.ceil(VW / W) + 3; i++) {
      const h = 10 + Math.floor(twHash(i, 77 + l) * [24, 34, 46][l]), x = Math.round(VW / 2 + i * W - wx * par), y = base - h + l * 6; twR(x, y, W - 1, VH + 8 - y, col);
      if (twQ() >= 2) for (let wy = 4; wy < Math.min(h - 2, 40); wy += 5) for (let xo = 3; xo < W - 4; xo += 5) if (twHash(i * 31 + wy * 7 + xo, 91 + l) < 0.38) twR(x + xo, y + wy, 2, 2, twHash(i + wy, xo) < 0.2 ? '#bfe6ff' : '#ffd98a');
      if (l === 2 && twHash(i, 99) < 0.4) { twR(x + (W >> 1), y - 6, 1, 6, '#8a90b0'); twR(x + (W >> 1) - 1, y - 7, 3, 2, ((now / 700 + i) | 0) % 2 ? '#ff4a3a' : '#5a1a14'); }
    }
  }
}
function rofLines(now, k) {      // the ACTION LINES: streaks fly up the picture (we fall), bright near ones and dim far ones, more and longer the faster it goes
  if (k <= 0.02) return; const t = now / 1000, n = 14 + Math.round(34 * k);
  for (let i = 0; i < n; i++) {
    const h1 = twHash(i, 11), h2 = twHash(i, 23), h3 = twHash(i, 37), h4 = twHash(i, 53), near = h3 > 0.62, len = Math.max(3, Math.round((8 + h3 * 50) * (0.3 + 0.7 * k))), sp = (220 + h2 * 760) * (0.25 + 0.75 * k) * (near ? 1.25 : 1), cyc = VH + 40 + len;
    ctx.fillStyle = near ? 'rgba(255,255,255,0.8)' : 'rgba(190,215,255,0.38)'; ctx.fillRect(Math.round(h1 * (VW + 8)) - 4, Math.round(VH + len - ((t * sp + h4 * cyc) % cyc)), near && h2 > 0.5 ? 2 : 1, near ? len : len >> 1);
  }
}
function rofVeil(now, s) {      // the clouds you fall through (at floors 44, 31, 19 and 9): a veil over the whole picture with streaks in it
  let a = 0; for (const c of [44, 31, 19, 9]) a = Math.max(a, 1 - Math.abs(s - c) / 2.4); if (a <= 0) return;
  ctx.fillStyle = 'rgba(150,168,215,' + (a * 0.5).toFixed(3) + ')'; ctx.fillRect(-8, -8, VW + 16, VH + 16);
  for (let i = 0; i < 7; i++) twR(Math.round(twHash(i, 73) * (VW + 100) - 50 + Math.sin(now / 900 + i) * 20), Math.round(twHash(i, 71) * VH), 60 + ((twHash(i, 72) * 140) | 0), 3, 'rgba(235,242,255,' + (a * 0.35).toFixed(3) + ')');
}
function rofStreet(u) {      // the last 0.6 s: the street comes up (the sidewalk, the kerb, the lane marks, a lamp) to the line the street's ground starts at
  const y = Math.round(gy - 12 + u * u * (VH - gy + 14)); twR(-8, y, VW + 16, VH + 16 - y, '#2b2e3e'); twR(-8, y, VW + 16, 5, '#4a4f66'); twR(-8, y + 5, VW + 16, 1, '#1c1e2a'); twR(-8, y, VW + 16, 1, '#8a8fa6');
  for (let x = -((wx | 0) % 28) - 14; x < VW; x += 28) twR(x, y + 13, 14, 1, '#8a8fa6');
  const lx = Math.round(VW * 0.78); twR(lx, y - 34, 1, 34, '#6d7488'); twR(lx - 3, y - 36, 7, 2, '#ffe9a8'); twR(lx - 5, y - 35, 11, 4, 'rgba(255,233,168,0.18)');
}
function rofPane(x, y, w, h, kind, broken, now, seed) {      // a window: kind 0 dark glass, 1 a warm room, 2 a cool office, 3 curtains, 4 a screen's glow; furniture stands in the lit ones; broken = the dark room and the teeth of the glass
  twR(x - 1, y - 1, w + 2, h + 2, '#080c1a'); twR(x - 1, y + h + 1, w + 2, 1, '#8c97b8'); const f = twSprite(ROF_FUR[seed % ROF_FUR.length], 0);
  if (broken) { twR(x, y, w, h, '#05070f'); ctx.save(); ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip(); ctx.globalAlpha = 0.35; ctx.drawImage(f.c, Math.round(x + w / 2 - f.ox), Math.round(y + h - 2 - f.by)); ctx.restore(); for (let i = 0; i < 4; i++) twR(x + Math.round(i * w / 4), y, Math.round(w / 4) - 1, 3 + (i * 5) % 7, '#8fb6e6'); return; }
  if (kind === 0) { twR(x, y, w, h, '#26417a'); twR(x, y, w, (h * 0.4) | 0, '#2f4f8c'); twR(x + 2, y + 3, 2, h - 8, '#3f5fa0'); twR(x + w - 5, y + 7, 1, h - 16, '#35559a'); }
  else {
    const c = kind === 2 ? ['#d8ecff', '#b4d4f4', '#8ab0d8'] : kind === 4 ? ['#5a96f0', '#3f7ad8', '#2a5ab0'] : ['#f9de92', '#e8c070', '#c9954a']; twR(x, y, w, h, c[0]); twR(x, y + (h >> 1), w, h >> 1, c[1]); twR(x, y + h - 4, w, 4, c[2]);
    if (kind === 4) twR(x + 3, y + 12, w - 6, 14, ((now / 160 + seed) | 0) % 5 ? '#cfe6ff' : '#ffffff');
    else { ctx.save(); ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip(); ctx.drawImage(f.c, Math.round(x + w / 2 - f.ox), Math.round(y + h - 2 - f.by)); ctx.restore(); }
    if (kind === 3) { twR(x, y, 4, h, '#7a2a3a'); twR(x + w - 4, y, 4, h, '#7a2a3a'); twR(x, y + 22, 4, 2, '#d8b45a'); twR(x + w - 4, y + 22, 4, 2, '#d8b45a'); }
  }
  twR(x + (w >> 1), y, 1, h, 'rgba(8,12,26,0.5)');
}
function rofRoofTop(now, y, bx) {      // the roof: its surface is at y (the soles of whoever stands on it); its right end is the face of the building at bx
  const xl = Math.round(VW / 2 - wx), a = Math.max(-8, xl);
  twR(a, y - 14, bx - a, 18, '#6f7582'); twR(a, y - 14, bx - a, 2, '#8a91a0'); twR(a, y + 4, bx - a, 1, '#b4bac7'); twR(a, y + 5, bx - a, 5, '#444a56');
  for (let x = xl + 28; x < bx; x += 28) if (x > -2) twR(x, y - 12, 1, 15, '#5c626f');
  { const hx = xl + 170; if (hx > -40 && hx < VW + 4) { for (const [px, py, pw, ph] of [[0, -11, 40, 1], [0, -1, 40, 1], [0, -11, 1, 11], [39, -11, 1, 11], [14, -9, 2, 7], [24, -9, 2, 7], [14, -6, 12, 2]]) twR(hx + px, y + py, pw, ph, '#e8c83a'); } }      // (the helipad: the H painted on the floor)
  twR(a, y - 18, bx - a, 4, '#98a0ae'); twR(a, y - 18, bx - a, 1, '#c3c9d6');
  for (let k = 0; k < 4; k++) twR(bx - 5, y - 15 + k * 5, 5, 5, k % 2 ? '#1a1a22' : '#e8c83a'); twR(bx - 5, y - 15, 5, 1, '#e2e7f1'); twR(bx - 4, y - 18, 2, 2, ((now / 400) | 0) & 1 ? '#ffb02a' : '#5a3a10');      // (the low wall at the right end, with hazard stripes and a warning lamp: the one you jump over)
  if (xl + 60 > -4) { twR(xl, y - 50, 58, 34, '#5a6170'); twR(xl, y - 50, 58, 3, '#8c93a2'); twR(xl + ROF.HATCH - 9, y - 40, 18, 24, '#161b29'); twR(xl + ROF.HATCH - 9, y - 40, 18, 2, '#9aa1b0'); twR(xl + ROF.HATCH - 2, y - 45, 4, 2, ((now / 500) | 0) & 1 ? '#4cf08a' : '#1f7a46'); }      // (the hatch: the stairs come up behind its door)
  const prop = (x, w, h, c) => { const sx = xl + x; if (sx + w < -2 || sx > VW + 2) return; twR(sx, y - 14 - h, w, h, c); twR(sx, y - 14 - h, w, 2, '#aeb5c3'); twR(sx + 2, y - 11 - h + h / 2, w - 4, 2, '#3d4350'); if (w > 20) twR(sx + 4, y - 12 - h + h / 2, 5, 5, ((now / 90) | 0) & 1 ? '#3d4350' : '#58606e'); };
  prop(118, 26, 14, '#69707e'); prop(262, 22, 12, '#6f7684'); { const sx = xl + 222; if (sx > -30 && sx < VW + 4) { twR(sx, y - 40, 2, 26, '#8a91a2'); twR(sx + 6, y - 40, 2, 26, '#8a91a2'); twR(sx - 3, y - 54, 14, 14, '#7f8696'); twR(sx - 3, y - 54, 14, 2, '#a8afc0'); } }      // (an air unit with a fan, a water tank on legs)
  { const sx = xl + 306; if (sx > -4 && sx < VW + 4) { twR(sx, y - 70, 1, 56, '#aeb5c3'); twR(sx - 3, y - 50, 7, 1, '#aeb5c3'); twR(sx - 1, y - 72, 3, 3, ((now / 600) | 0) & 1 ? '#ff4a3a' : '#6a1a14'); } }      // (the mast with its red lamp)
  for (const fx of [96, 250]) { const sx = xl + fx; if (sx < -34 || sx > VW + 34) continue; twR(sx, y - 46, 1, 32, '#7d8496'); twR(sx - 3, y - 48, 8, 2, '#fff7c0'); ctx.fillStyle = 'rgba(255,247,192,0.07)'; ctx.beginPath(); ctx.moveTo(sx - 2, y - 47); ctx.lineTo(sx + 4, y - 47); ctx.lineTo(sx + 34, y - 8); ctx.lineTo(sx - 30, y - 8); ctx.fill(); }      // (two floodlights with their cones)
}
const ROF_OC = document.createElement('canvas'), ROF_HIP = { yuji: 27, gojo: 27, verity: 30, cat: 29, freddy: 27, cu3: 27, cu4: 24, cu5: 29, cu6: 30 };      // (the capture canvas; how high the hips are above the soles, per fighter)
const ROF_ARM = { yuji: ['#1d2a5c', '#e8b896'], gojo: ['#2a2540', '#f0d2b4'], verity: ['#c9b72f', '#d8c848'], cat: ['#1c1c24', '#ffffff'], freddy: ['#9a2626', '#7a5a3a'], cu3: ['#262640', '#e8b896'], cu4: ['#1c2030', '#e0b090'], cu5: ['#c02828', '#e8c030'], cu6: ['#d09c80', '#ecc0a0'] };      // (the sleeve and the hand of each fighter, for the arms that hold the slab)
let rofCap = null;      // (a capture that is running: what ctx.drawImage was before)
function rofCapBegin() {      // from here until rofCapEnd every picture drawn goes to ROF_OC (with the transform it was drawn under) instead of the screen, so the whole fighter can be posed; false = nothing to do now
  if (rofCap || !rof || (rof.ph !== 'fall' && rof.ph !== 'cling' && rof.ph !== 'climb')) return false;
  const oc = ROF_OC, W = VW + 16, H = VH + 16; if (oc.width !== W || oc.height !== H) { oc.width = W; oc.height = H; } const g = oc.getContext('2d'); g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, W, H); g.imageSmoothingEnabled = false;
  const has = n => Object.prototype.hasOwnProperty.call(ctx, n), own = has('drawImage'), ownR = has('fillRect'), orig = ctx.drawImage, origR = ctx.fillRect, to = () => { const m = ctx.getTransform(); g.setTransform(m.a, m.b, m.c, m.d, m.e + 8, m.f + 8); g.globalAlpha = ctx.globalAlpha; g.globalCompositeOperation = ctx.globalCompositeOperation; };
  ctx.drawImage = function (img) { if (img == null) return; to(); return g.drawImage.apply(g, arguments); };
  ctx.fillRect = function (x, y, w, h) { to(); g.fillStyle = ctx.fillStyle; g.fillRect(x, y, w, h); };      // (the dots of his hair and his coat go with his picture, so they stay on him when he is tilted)
  rofCap = { own, ownR, orig, origR }; return true;
}
function rofCapStop() { if (!rofCap) return; if (rofCap.own) ctx.drawImage = rofCap.orig; else delete ctx.drawImage; if (rofCap.ownR) ctx.fillRect = rofCap.origR; else delete ctx.fillRect; rofCap = null; }
function rofWind() { const r = rof; return r && r.ph === 'fall' ? Math.min(1, 1.6 * r.v / ROF_VM) : 0; }      // (how hard the wind blows up past a falling fighter, 0 to 1: the hair and the coat stream up, see clStep)
function rofCapEnd(now, sx) {      // (the player's scenes call it after his picture and his cloth) the captured picture, posed
  if (!rofCap) return; rofCapStop(); const r = rof; if (!r) return;
  rofRig(now, sx, 1, r.ph === 'fall' ? 'fall' : 'hang', r.psMe, ROF_HIP[vs.me] || 27, 0);      // (his picture always faces right, whichever side the enemy is on)
}
function rofRig(now, sx, face, mode, ps, hip, dy) {      // the captured picture of a fighter, posed with his own pixels: falling = the legs kick about the hips, the body leans back and sways, afterimages stream up from him; hanging = the legs dangle and swing a little
  const oc = ROF_OC, W = oc.width, H = oc.height, hy = gy + 2 - hip, t = now / 1000, fall = mode === 'fall', k = fall && rof ? Math.min(1, rof.v / ROF_VM) : 0;
  const lean = ps * face * (fall ? -(0.16 + 0.16 * k) + 0.04 * Math.sin(t * 4.3) : 0.025 * Math.sin(t * 1.9)), leg = ps * face * (fall ? (0.28 + 0.14 * k) * Math.sin(t * (6.5 + 4 * k)) : 0.13 * Math.sin(t * 2.3));
  const part = (oy, a, legs) => {
    ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha *= a; ctx.translate(0, (dy || 0) + oy); ctx.translate(sx, hy); ctx.rotate(lean); ctx.translate(-sx, -hy);
    if (legs) {
      ctx.save(); ctx.translate(sx, hy); ctx.rotate(leg); ctx.translate(-sx, -hy); ctx.drawImage(oc, 0, hy + 7, W, H - hy - 7, -8, hy - 1, W, H - hy - 7); ctx.restore();      // (the legs, swung about the hip)
      ctx.drawImage(oc, 0, 0, W, hy + 10, -8, -8, W, hy + 10);      // (the body above them, over the join)
    } else ctx.drawImage(oc, -8, -8);      // (an afterimage: one faint picture, leaning)
    ctx.restore();
  };
  if (fall && k > 0.15 && ps > 0.2) for (let i = 3; i >= 1; i--) part(-Math.round(5 * i * (0.5 + k)), 0.12 / i * ps + 0.02, false);      // (the afterimages the speed leaves above him)
  part(0, 1, true);
}
function rofArms(sx, yS, who) { const c = ROF_ARM[who] || ['#5f6990', '#e8c3a0']; twR(sx - 6, yS - 2, 4, 3, c[1]); twR(sx + 3, yS - 2, 4, 3, c[1]); twR(sx - 5, yS + 1, 2, Math.max(0, gy - 50 - yS), c[0]); twR(sx + 4, yS + 1, 2, Math.max(0, gy - 50 - yS), c[0]); }      // (the hands over the edge of the slab, the arms down to the shoulders)
function rofFacade(now, r, bx, s) {      // the building: a wall with a corner pilaster at the left of the face, at every level a slab with a balcony, a wall under the windows, a lintel with wall lamps and the windows themselves; levels are floors above the street
  const FL = ROF.FL, y0 = gy + 2, y50 = Math.round(y0 - (50 - s) * FL), q = twQ(), fast = r.ph === 'fall' ? r.v / ROF_VM : 0, hang = r.ph === 'cling' || r.ph === 'climb' || r.ph === 'balcony', sd = r.side;
  if (y50 < VH + 4) { const h = VH + 16 - y50; twR(-8, y50, bx + 8, h, '#1b2438'); twR(bx - 9, y50, 6, h, '#2a3858'); twR(bx - 9, y50, 1, h, '#4a5a86'); twR(bx - 4, y50, 1, h, '#141c32'); twR(bx - 3, y50, 3, h, '#6e7aa0'); twR(bx - 1, y50, 1, h, '#b6c2e2'); }
  const L0 = Math.max(0, Math.floor(s - (VH - y0) / FL) - 1), L1 = Math.min(49, Math.ceil(s + (y0 + 80) / FL));
  for (let L = L0; L <= L1; L++) {
    const yL = Math.round(y0 - (L - s) * FL); if (yL < -4 || yL - 66 > VH) continue;
    const base = L < 8, pent = L >= 44, band = L % 10 === 9 && L < 49, spec = hang && L === r.L, wall = base ? '#2c2b40' : pent ? '#202a48' : '#1b2438', fd = vs.tw.fl[L + 1];
    twR(-8, yL - 10, bx - 9, 10, base ? '#26253a' : '#222b46'); twR(-8, yL - 10, bx - 9, 1, '#344066'); twR(-8, yL + 6, bx - 9, 18, wall); twR(-8, yL + 12, bx - 9, 1, '#262f4e');      // (the wall under a window, the lintel)
    twR(-8, yL, bx, 5, '#3b4666'); twR(-8, yL, bx, 1, '#56638a'); twR(-8, yL + 5, bx, 1, '#10152a');      // (the slab)
    for (let x = bx - 40; x > -8; x -= 52) { twR(x, yL + 8, 3, 2, '#ffe9a8'); if (q >= 2) { ctx.globalAlpha = 0.1; twR(x - 2, yL + 6, 7, 6, '#ffe9a8'); ctx.globalAlpha = 1; } }      // (wall lamps)
    twR(bx, yL, ROF.BAL, 2, '#dfe6f4'); twR(bx, yL + 2, ROF.BAL, 3, '#9aa3bc'); twR(bx, yL + 5, ROF.BAL, 1, '#5a6482'); ctx.globalAlpha = 0.3; twR(bx + 2, yL + 6, ROF.BAL - 2, 2, '#000000'); ctx.globalAlpha = 1;      // (the balcony slab)
    if (q >= 1) { ctx.globalAlpha = 0.16; twR(bx + 1, yL - 9, ROF.BAL - 1, 9, '#a0d7ff'); ctx.globalAlpha = 1; twR(bx, yL - 10, ROF.BAL, 1, '#d6deee'); for (let j = 0; j < 5; j++) twR(bx + j * 6, yL - 10, 1, 10, '#8794b4'); twR(bx + ROF.BAL - 1, yL - 12, 1, 12, '#d6deee'); }      // (the glass railing)
    if (!spec && q >= 2) { if (twHash(L, 31) < 0.3) { twR(bx + 16, yL - 6, 7, 4, '#5a3a22'); twR(bx + 15, yL - 11, 9, 5, '#2f7d4f'); twR(bx + 17, yL - 12, 3, 2, '#4fb070'); } else if (twHash(L, 32) < 0.3) { twR(bx + 2, yL - 8, 9, 7, '#8a91a2'); twR(bx + 2, yL - 8, 9, 1, '#b4bac7'); twR(bx + 4, yL - 6, 5, 3, '#3d4350'); } }      // (a planter or an air unit on some balconies)
    if (band) { const c = ROF_NEON[((L / 10) | 0) % 5]; twR(-8, yL - 56, bx - 9, 46, '#161d34'); for (let yy = yL - 54; yy < yL - 12; yy += 4) twR(-8, yy, bx - 9, 1, '#0c1226'); ctx.globalAlpha = 0.2; twR(-8, yL - 40, bx - 9, 10, c); ctx.globalAlpha = 1; twR(-8, yL - 36, bx - 9, 3, c); twR(-8, yL - 36, bx - 9, 1, '#ffffff'); continue; }      // (every tenth floor: louvers and a lit sign band)
    for (let i = 0; i < 14; i++) {
      const x = bx - 28 - i * 26; if (x + 18 < 0) break; const hs = twHash(L * 14 + i, 5), kind = hs < (base ? 0.5 : 0.16) ? 1 : hs < 0.27 ? 2 : hs < 0.34 ? 3 : hs < 0.38 ? 4 : 0, brk = i === 0 && (spec ? rofWin().broken : !!(fd && fd.outer[sd].broken));
      rofPane(x, yL - 62, 18, 52, spec && i === 0 && !brk && r.pj.some(p => now > p.at - 450 && now < p.at) ? 1 : kind, brk, now, (L * 14 + i) & 255);
    }
  }
  if (fast > 0.3) for (let k = 0; k < 10; k++) twR(Math.round(twHash(k, 81) * (bx - 12)), 0, 1, VH, 'rgba(170,195,255,' + (0.05 + 0.07 * fast).toFixed(2) + ')');      // (the building streaks past)
  if (y50 < VH + 4 && y50 > -90) { rofRoofTop(now, y50, bx); for (let x = bx - 30; x > 0; x -= 26) twR(x, y50 + 11, 2, VH, '#222c45'); }      // (L 50 is the roof itself)
}
function rofBack(now) {
  rofCapStop(); const r = rof, bx = Math.round(VW / 2 + ROF.RW - wx), s = r.s, fall = r.ph === 'fall' || (r.ph === 'cling' && r.br); rofSky(now, Math.max(0, Math.min(1, 1 - s / 50)), !fall);
  if (fall) rofLines(now, r.v / ROF_VM); else rofCity(now, gy + 30 - Math.round(24 * Math.min(1, s / 50)));
  rofFacade(now, r, bx, s); if (fall) rofVeil(now, s);
  if (r.ph === 'cling' || r.ph === 'climb') { const yS = Math.round(gy + 2 + rofYo()); if (yS < gy - 52) rofArms(Math.round(VW / 2), yS, vs.me); }
  if (r.ph === 'fall') { const tl = rofTLand(r.s0, r.v0) - r.ft; if (tl < 0.6) rofStreet(Math.max(0, tl / 0.6)); }
}
function rofFoeFx(now, draw) {      // (drawFoes asks) the enemy when he is not in the fight, or is in the fall (posed): false = draw him as usual
  const r = rof, d = dummy; if (!r || !d || d.ko >= 0) return false;
  const hip = ROF_HIP[vs.foe] || 27;
  if (rofFight()) {
    if (r.ph !== 'fall' || r.fs !== 'with') return false;      // (on the roof and on the balcony he is drawn as usual)
    const k = (now - r.jat) / 320, dy = k >= 0 && k < 1 ? -Math.round(110 * (1 - k) * (1 - k)) : 0, on = rofCapBegin();      // (he dives in from above: the first 0.3 s)
    draw(); if (on) { rofCapStop(); rofRig(now, Math.round(VW / 2 + d.x - wx), wx >= d.x ? 1 : -1, 'fall', r.psFoe, hip, dy); } return true;
  }
  const gx = d.x, ga = d.airH, cx = VW / 2, st = r.fs; d.airH = 0;
  if (st === 'past') { const ts = (now - r.gat) / 1000, T = r.brT, dy = Math.round(r.gv * ROF.FL * (ts < T ? ts * ts / (2 * T) : T / 2 + ts - T)); if (dy < VH + 70) { d.x = r.px; const on = rofCapBegin(); draw(); if (on) { rofCapStop(); rofRig(now, Math.round(cx + d.x - wx), wx >= d.x ? 1 : -1, 'fall', 1, hip, dy); } } }
  else if (st === 'latch') { const yS = Math.round(gy + 2 + rofYo()); if (yS < gy - 52) rofArms(Math.round(cx + ROF.RW + 24 - wx), yS, vs.foe); d.x = ROF.RW + 24; const on = rofCapBegin(); draw(); if (on) { rofCapStop(); rofRig(now, Math.round(cx + d.x - wx), -1, 'hang', 1, hip, 0); } }
  else if (st === 'above' || st === 'inside') {
    const yo = Math.round(rofYo()), bx = Math.round(cx + ROF.RW - wx), yl = gy + 2 + yo; ctx.save();
    if (st === 'inside') { ctx.beginPath(); ctx.rect(bx - 56, yl - 64, 54, 62); ctx.clip(); ctx.globalAlpha = rofWin().broken ? 1 : 0.7; }
    ctx.translate(0, yo); d.x = st === 'above' ? ROF.RW + 16 : ROF.RW - 30; draw(); ctx.restore();
  }
  d.x = gx; d.airH = ga; return true;
}
function rofFront(now) {      // over the fighters: the wind streaks past them and darkens the edges while you fall fast; what is flying
  const r = rof; if (!r) return;
  if (r.ph === 'fall' && r.v > 1.5) { const k = r.v / ROF_VM, t = now / 1000; ctx.fillStyle = 'rgba(255,255,255,0.45)'; for (let i = 0; i < 9; i++) { const h = twHash(i, 131), len = 6 + ((twHash(i, 132) * 16) | 0); ctx.fillRect(Math.round(VW / 2 - 30 + h * 190), Math.round(VH + len - ((t * (500 + h * 400) * k + twHash(i, 133) * 300) % (VH + len))), 1, len); } ctx.fillStyle = 'rgba(0,0,24,' + (0.1 * k).toFixed(3) + ')'; ctx.fillRect(0, 0, 12, VH); ctx.fillRect(VW - 12, 0, 12, VH); }
  for (const p of r.pj) {
    const t = (now - p.at) / 1000; if (t < 0 || p.gone) continue; const x = Math.round(VW / 2 + p.x - wx), y = Math.round(p.y);
    if (p.k === 'shoot') { twR(x - 11, y - 1, 9, 2, 'rgba(255,140,40,0.55)'); twR(x - 3, y - 3, 6, 6, '#ff7a2a'); twR(x - 2, y - 2, 4, 4, '#fff2b0'); }
    else { const s = twSprite(p.sp, 0); ctx.save(); ctx.translate(x, y); ctx.rotate(t * 9); ctx.drawImage(s.c, -(s.c.width >> 1), -(s.c.height >> 1)); ctx.restore(); }
  }
}
window.__rof = () => rof ? { ph: rof.ph, fs: rof.fs, s: +rof.s.toFixed(2), v: +rof.v.toFixed(2), ft: +rof.ft.toFixed(2), slab: rof.slab, L: rof.L, pj: rof.pj.length, inAt: Math.round(rof.inAt - pnow()), wx: Math.round(wx), dx: dummy ? Math.round(dummy.x - wx) : null, side: rof.side, win: rof.slab ? { hp: rofWin().hp, broken: rofWin().broken } : null } : null;      // test hook
