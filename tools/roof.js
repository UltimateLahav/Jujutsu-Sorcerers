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
const rofWin = () => twFloorData(rof.slab).outer[1];      // (the glass at the right end of the floor you are at: the window you break)
const rofWindK = () => rof && rof.ph === 'fall' ? 1 + 3 * Math.min(1, rof.v / ROF_VM) : 1;      // (the wind sound: louder the faster you fall, see sfx.windPush)
const rofYo = () => -(rof.L - rof.s) * ROF.FL;      // (how far the slab you are at is above the line you stand on: 0 on the balcony, 78 px while you hang)

// ---------------------------------------------------------------- the enemy
function rofPlace(now, x) { const d = dummy; d.twAway = false; d.x = x; d.vx = 0; d.down = 0; d.air = null; d.airH = 0; d.stunUntil = now + 300; d.ai = 'rest'; d.aiAt = now; d.restFor = 300; }
function rofHold(now) { const d = dummy; if (!d || d.ko >= 0) return; d.twAway = true; twFoeHold(now); if (rofHang()) d.x = wx - 1e5; }      // (he is not in the fight: far off and still; far to your LEFT while you are at the building, so you face the window)
function rofHere(now) { if (!rof || !dummy || dummy.ko >= 0 || rof.ph === 'cling' || rof.ph === 'climb') return; rof.fs = 'with'; rofPlace(now, Math.min(ROF.RW + (rof.ph === 'roof' ? -6 : rof.ph === 'balcony' ? ROF.BAL - 3 : ROF.HI), wx + 48)); }      // (PUT ENEMY / RESET of free play)
function rofJoin(now) { const r = rof, hi = r.ph === 'fall' ? ROF.RW + ROF.HI : ROF.RW + ROF.BAL; r.fs = 'with'; rofPlace(now, wx + 48 > hi ? wx - 48 : wx + 48); puff(dummy.x, 5); snd('swing', 3); shakeUntil = now + 200; shakeAmp = 2; }      // (he jumped after you inside 2 s: he is next to you)
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
    const p = r.pj[i], t = (now - p.at) / 1000; if (t < 0) continue; const k = t / p.T; p.x = p.x0 + (p.tx - p.x0) * k; p.y = p.y0 + (p.ty - p.y0) * k;
    if (!p.br && p.x >= ROF.RW - 2) { p.br = true; if (r.slab && !rofWin().broken) rofWinBreak(now); }
    if (!p.done && k >= 1) { p.done = true; if (!p.gone && Math.abs(wx - p.tx) < 16 && rofHang()) rofHit(now, p); }
    if (p.gone || t > 1.6) r.pj.splice(i, 1);
  }
}
function rofHit(now, p) {      // it reached you: under it (crouched) or over it (in the air) on the balcony, or it hits; a guard takes most of it; otherwise you are knocked off
  const r = rof, bal = r.ph === 'balcony', blocked = bal && blockHeld; if (bal && (stance === 'down' || stance === 'crouch' || gojoLift > 14 || (gAirH || 0) > 26)) return;
  twHurtMe(Math.max(1, Math.round(PHP * (blocked ? 0.02 : p.k === 'throw' ? 0.07 : 0.05))), now, true);
  debBurst(wx, 34, 10, p.k === 'throw' ? TW_K[p.sp].cols : ['#ffd34d', '#ff7a2a', '#ffffff'], 130); spark(wx, gy - 34, 6, ['#ffffff', '#ffd34d'], true, 1); snd(p.k === 'throw' ? 'twbreak' : 'hit', p.k === 'throw' ? 7 : 2); shakeUntil = now + 220; shakeAmp = 4; hitStop(70); p.gone = true;
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
  rof = { ph: 'roof', at: now, ft: 0, s: 50, s0: 50, v0: 0.45, v: 0, slab: 0, L: 0, fs: live ? 'wait' : 'away', pend: here ? 'follow' : 'travel', fAt: now + (here ? 1000 : Math.min(9000, 2600 + 700 * Math.abs(T.fFoe - TW_N))), foeFl: T.fFoe, inAt: 0, inFl: 0, join: 0, amb: 0, pj: [], doorAt: -1, sd: false, leap: null, br: null, brT: 1, bt: 0, ct: 0, gripAt: 0, swAt: 0, swP: 6, px: 0, gv: 0, gat: 0, fAt2: 0 };
  twClearWorld(); wx = ROF.HATCH + 28; wxv = 0; wvx = 0; popups = []; snd('twbreak', 6); puff(wx, 5); if (live) rofHold(now);
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
  snd('swing', 3); shakeUntil = now + 300; shakeAmp = 2; twClearWorld();
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
function rofDrop(now) {      // knocked off the slab: the fall goes on from here
  const r = rof; r.ph = 'fall'; r.at = now; r.s0 = r.s; r.v0 = 0.5; r.v = 0.5; r.ft = 0; r.br = null; r.gripAt = 0; r.leap = { at: now, x0: wx, x1: ROF.RW + 64, ms: 380 }; jumpReq = false;
}
function rofHangTick(now, dt) {
  const r = rof; if (r.ph === 'balcony') { rofBalcony(now); return; }
  vs.nHold = Math.max(vs.nHold || 0, now + 120); wx = ROF.RW + 8; wxv = 0; wvx = 0;      // (the engine's own freeze: no walking, no blows while you hang or climb)
  if (r.ph === 'cling') {
    if (r.br) { r.bt += dt; const u = Math.min(1, r.bt / r.br.T); r.s = r.br.s1 + (r.br.s2 - r.br.s1) * (1 - (1 - u) * (1 - u)); r.v = r.br.v * (1 - u); if (u >= 1) { r.s = r.br.s2; r.br = null; r.v = 0; } }
    else if (jumpReq && now >= r.gripAt) { jumpReq = false; r.ph = 'climb'; r.at = now; r.ct = 0; snd('swing', 3); }
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
  } else if (wx <= ROF.RW - 8) rofToTower(now, r.slab, twFloorData(r.slab).W - 22);
}
function rofLand(now) {      // the street: the crater, 30% of the health (never a K.O.), the enemy next to you if he fell with you
  const r = rof, T = vs.tw, d = dummy, live = !!d && d.ko < 0, lx = ctLand(1), n = Math.max(1, Math.round(r.s0)), p = Math.min(ROF.DMG, 0.03 * n), dm = Math.max(1, Math.round(PHP * p)), withMe = live && r.fs === 'with';
  rof = null;
  if (live) { T.away = true; d.twAway = true; if (withMe) { T.foeSt = true; T.foeX = lx + 44; } else { T.foeSt = false; T.fFoe = Math.max(1, Math.min(TW_N, r.fs === 'inside' || r.fs === 'above' || r.fs === 'latch' || r.fs === 'melee' ? (r.inFl || r.slab) : r.foeFl)); } }
  ctSwitchOut(now, lx, 'glass', 1, false); twHurtMe(dm, now, true); twLand(now, 'FALL', n, dm); vs.crater = { x: lx };
  if (withMe) twHurtFoe(Math.max(1, Math.round((d.max || DUMMY_HP) * p)), now, true);
  debBurst(lx, 4, 30, ['#6a6a76', '#8a8a96', '#a0a0ac', '#4a4a56'], 220); puff(lx - 14, 8); puff(lx + 14, 8); puff(lx, 10); gritAt(lx, 14, 160, 0); shockAt(lx, 360, 140, 0.9); snd('twbreak', 4); snd('land', 1.8); flash(now, 180, 0.45); shakeUntil = now + 800; shakeAmp = 8; hitStop(120);
}
function rofTick(now, dt) {      // every frame, before the tower's and the training step
  const r = rof; if (!r || state !== 'play' || !vs || !dummy) return; if (!rofRun()) { if (dummy.ko < 0 && !rofFight()) rofHold(now); return; }
  if (r.ph === 'roof') rofRoof(now); else if (r.ph === 'fall') rofFall(now, dt); else rofHangTick(now, dt);
  if (rof) { rofFoe(now); rofShots(now); }
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

// ---------------------------------------------------------------- what is seen: the sky, the action lines, the building at the left (over the lines), the roof, the street rushing up
const ROF_SKY = ['#04061a', '#070b26', '#0b1236', '#101a48', '#17245a', '#223270', '#34468a', '#4e64a6'];      // (night, like the tower's outside and the street: deep blue at the top, a glow at the horizon)
function rofSky(k, stars) { const n = ROF_SKY.length, h = Math.ceil((VH + 16) / 9); for (let i = 0; i < h; i++) twR(-8, -8 + i * 9, VW + 16, 9, ROF_SKY[Math.max(0, Math.min(n - 1, Math.floor(i / h * (n - 3) + k * 3)))]); if (stars) for (let i = 0; i < 46; i++) { const x = Math.round(twHash(i, 3) * (VW + 8) - wx * 0.03) % (VW + 8), y = Math.round(twHash(i, 9) * VH * 0.55); twR((x + VW + 8) % (VW + 8), y, 1, 1, twHash(i, 17) < 0.2 ? '#ffffff' : '#9fb0e8'); } }
function rofCity(base) {      // the other towers far below, in two layers anchored to the world
  for (let l = 0; l < 2; l++) {
    const par = l ? 0.32 : 0.16, col = l ? '#101a40' : '#18245a', W = l ? 22 : 16, i0 = Math.floor((wx * par - VW / 2) / W) - 1;
    for (let i = i0; i <= i0 + Math.ceil(VW / W) + 3; i++) { const h = 8 + Math.floor(twHash(i, 77 + l) * (l ? 34 : 24)), x = Math.round(VW / 2 + i * W - wx * par), y = base - h + l * 6; twR(x, y, W - 1, VH + 8 - y, col); if (twQ() >= 2) { for (let wy = 4; wy < Math.min(h - 2, 30); wy += 6) if (twHash(i * 9 + wy, 91 + l) < 0.5) twR(x + 3 + (wy % 12), y + wy, 2, 2, twHash(i, wy) < 0.2 ? '#bfe6ff' : '#ffd98a'); } }
  }
}
function rofLines(now, k) {      // the ACTION LINES: streaks fly up the picture (we fall), more and longer the faster it goes
  if (k <= 0.02) return; const n = 10 + Math.round(28 * k), t = now / 1000;
  for (let i = 0; i < n; i++) {
    const h1 = twHash(i, 11), h2 = twHash(i, 23), h3 = twHash(i, 37), h4 = twHash(i, 53), len = Math.max(3, Math.round((8 + h3 * 46) * (0.3 + 0.7 * k))), sp = (200 + h2 * 700) * (0.25 + 0.75 * k), cyc = VH + 40 + len;
    ctx.fillStyle = h3 > 0.55 ? 'rgba(255,255,255,0.75)' : 'rgba(205,228,255,0.5)'; ctx.fillRect(Math.round(h1 * (VW + 8)) - 4, Math.round(VH + len - ((t * sp + h4 * cyc) % cyc)), h2 > 0.8 ? 2 : 1, len);
  }
}
function rofStreet(u) { const y = Math.round(gy - 12 + u * u * (VH - gy + 14)); twR(-8, y, VW + 16, VH + 16 - y, '#2b2e3e'); twR(-8, y, VW + 16, 2, '#5d627c'); twR(-8, y + 7, VW + 16, 1, '#1c1e2a'); }      // (the last 0.6 s: the ground comes up to the line the street's ground starts at)
function rofPane(x, y, w, h, lit, broken) {
  twR(x - 1, y - 1, w + 2, h + 2, '#0a0f20');
  if (broken) { twR(x, y, w, h, '#05070f'); for (let i = 0; i < 4; i++) twR(x + Math.round(i * w / 4), y, Math.round(w / 4) - 1, 3 + (i * 5) % 7, '#8fb6e6'); return; }      // (the glass is gone: a dark room and the teeth of what is left along the top)
  twR(x, y, w, h, lit ? '#f4d68a' : '#27437a'); if (lit) twR(x, y + h - 4, w, 4, '#d4a455'); else { twR(x, y, w, 1, '#4a6aa6'); twR(x + 3, y + 3, 2, h - 9, '#3f5c92'); }
}
function rofRoofTop(now, y, bx) {      // the roof: its surface is at y (the soles of whoever stands on it); its right end is the face of the building at bx
  const xl = Math.round(VW / 2 - wx), a = Math.max(-8, xl);
  twR(a, y - 14, bx - a, 18, '#7b818e'); twR(a, y - 14, bx - a, 2, '#9299a6'); twR(a, y + 4, bx - a, 1, '#b4bac7'); twR(a, y + 5, bx - a, 5, '#4a505c');
  for (let x = xl + 28; x < bx; x += 28) if (x > -2) twR(x, y - 12, 1, 15, '#666c79');
  twR(a, y - 18, bx - a, 4, '#98a0ae'); twR(a, y - 18, bx - a, 1, '#c3c9d6'); twR(bx - 5, y - 15, 5, 19, '#b9c0cd'); twR(bx - 5, y - 15, 5, 1, '#e2e7f1');      // (the low wall along the back and the one at the right end: the one you jump over)
  if (xl + 60 > -4) { twR(xl, y - 50, 58, 34, '#5a6170'); twR(xl, y - 50, 58, 3, '#8c93a2'); twR(xl + ROF.HATCH - 9, y - 40, 18, 24, '#161b29'); twR(xl + ROF.HATCH - 9, y - 40, 18, 2, '#9aa1b0'); twR(xl + ROF.HATCH - 2, y - 45, 4, 2, ((now / 500) | 0) & 1 ? '#4cf08a' : '#1f7a46'); }      // (the hatch: the stairs come up behind its door)
  const prop = (x, w, h, c) => { const sx = xl + x; if (sx + w < -2 || sx > VW + 2) return; twR(sx, y - 14 - h, w, h, c); twR(sx, y - 14 - h, w, 2, '#aeb5c3'); twR(sx + 2, y - 11 - h + h / 2, w - 4, 2, '#3d4350'); };
  prop(118, 26, 14, '#69707e'); prop(190, 16, 22, '#5c6371'); prop(262, 22, 12, '#6f7684');
  { const sx = xl + 306; if (sx > -4 && sx < VW + 4) { twR(sx, y - 70, 1, 56, '#aeb5c3'); twR(sx - 3, y - 50, 7, 1, '#aeb5c3'); twR(sx - 1, y - 72, 3, 3, ((now / 600) | 0) & 1 ? '#ff4a3a' : '#6a1a14'); } }      // (the mast with its red lamp)
}
function rofArms(sx, yS) { twR(sx - 6, yS - 2, 4, 3, '#e8c3a0'); twR(sx + 3, yS - 2, 4, 3, '#e8c3a0'); twR(sx - 5, yS + 1, 2, Math.max(0, gy - 50 - yS), '#5f6990'); twR(sx + 4, yS + 1, 2, Math.max(0, gy - 50 - yS), '#5f6990'); }      // (the hands over the edge of the slab, the arms down to the shoulders)
function rofFacade(now, r, bx, s) {      // the building: its wall at the left of the face, a slab with a balcony at every floor, a window above each; levels are floors above the street
  const FL = ROF.FL, y0 = gy + 2, y50 = Math.round(y0 - (50 - s) * FL), q = twQ(); if (y50 < VH + 4) { twR(-8, y50, bx + 8, VH + 16 - y50, '#1b2438'); twR(bx - 4, y50, 4, VH + 16 - y50, '#6e7aa0'); twR(bx - 6, y50, 2, VH + 16 - y50, '#33415f'); }
  const L0 = Math.max(0, Math.floor(s - (VH - y0) / FL) - 1), L1 = Math.min(49, Math.ceil(s + (y0 + 80) / FL));
  for (let L = L0; L <= L1; L++) {
    const yL = Math.round(y0 - (L - s) * FL); if (yL < -4 || yL - 66 > VH) continue;
    twR(-8, yL, bx + 8, 5, '#3b4666'); twR(-8, yL, bx + 8, 1, '#56638a'); twR(bx, yL, ROF.BAL, 3, '#a9b1c6'); twR(bx, yL, ROF.BAL, 1, '#e2e8f4'); twR(bx, yL + 3, ROF.BAL, 2, '#4a526e');
    if (q >= 1) { twR(bx, yL - 9, ROF.BAL, 1, '#c9d1e4'); for (let j = 0; j < 5; j++) twR(bx + j * 5, yL - 9, 1, 9, '#7f8aa8'); twR(bx + ROF.BAL - 1, yL - 11, 1, 11, '#c9d1e4'); }
    const fd = vs.tw.fl[L + 1], special = (r.ph === 'cling' || r.ph === 'climb' || r.ph === 'balcony') && L === r.L;
    for (let i = 0; i < 6; i++) { const x = bx - 20 - i * 26; if (x + 18 < 0) break; const brk = i === 0 && (special ? rofWin().broken : !!(fd && fd.outer[1].broken)); rofPane(x, yL - 62, 18, 52, twHash(L * 6 + i, 5) < 0.32 || (special && i === 0 && !brk && r.pj.some(p => now > p.at - 450 && now < p.at)), brk); }
  }
  if (y50 < VH + 4 && y50 > -90) { rofRoofTop(now, y50, bx); for (let x = bx - 30; x > 0; x -= 26) twR(x, y50 + 11, 2, VH, '#222c45'); }      // (L 50 is the roof itself)
}
function rofBack(now) {
  const r = rof, bx = Math.round(VW / 2 + ROF.RW - wx), s = r.s; rofSky(Math.max(0, Math.min(1, 1 - s / 50)), !(r.ph === 'fall' || (r.ph === 'cling' && r.br)));
  if (r.ph === 'fall' || (r.ph === 'cling' && r.br)) rofLines(now, r.v / ROF_VM); else rofCity(gy + 30 - Math.round(24 * Math.min(1, s / 50)));
  rofFacade(now, r, bx, s);
  if (r.ph === 'cling' || r.ph === 'climb') { const yS = Math.round(gy + 2 + rofYo()); if (yS < gy - 52) rofArms(Math.round(VW / 2), yS); }
  if (r.ph === 'fall') { const tl = rofTLand(r.s0, r.v0) - r.ft; if (tl < 0.6) rofStreet(Math.max(0, tl / 0.6)); }
}
function rofFoeFx(now, draw) {      // (drawFoes asks) the enemy when he is not in the fight: false = draw him as usual
  const r = rof, d = dummy; if (!r || !d || d.ko >= 0 || rofFight()) return false;
  const gx = d.x, ga = d.airH, cx = VW / 2, st = r.fs; d.airH = 0;
  if (st === 'past') { const ts = (now - r.gat) / 1000, T = r.brT, dy = Math.round(r.gv * ROF.FL * (ts < T ? ts * ts / (2 * T) : T / 2 + ts - T)); if (dy < VH + 70) { ctx.save(); ctx.translate(0, dy); d.x = r.px; draw(); ctx.restore(); } }
  else if (st === 'latch') { const yS = Math.round(gy + 2 + rofYo()); if (yS < gy - 52) rofArms(Math.round(cx + ROF.RW + 24 - wx), yS); d.x = ROF.RW + 24; draw(); }
  else if (st === 'above' || st === 'inside') {
    const yo = Math.round(rofYo()), bx = Math.round(cx + ROF.RW - wx), yl = gy + 2 + yo; ctx.save();
    if (st === 'inside') { ctx.beginPath(); ctx.rect(bx - 56, yl - 64, 54, 62); ctx.clip(); ctx.globalAlpha = rofWin().broken ? 1 : 0.7; }
    ctx.translate(0, yo); d.x = st === 'above' ? ROF.RW + 16 : ROF.RW - 30; draw(); ctx.restore();
  }
  d.x = gx; d.airH = ga; return true;
}
function rofFront(now) {      // over the fighters: what is flying
  const r = rof; if (!r) return;
  for (const p of r.pj) {
    const t = (now - p.at) / 1000; if (t < 0 || p.gone) continue; const x = Math.round(VW / 2 + p.x - wx), y = Math.round(p.y);
    if (p.k === 'shoot') { twR(x - 11, y - 1, 9, 2, 'rgba(255,140,40,0.55)'); twR(x - 3, y - 3, 6, 6, '#ff7a2a'); twR(x - 2, y - 2, 4, 4, '#fff2b0'); }
    else { const s = twSprite(p.sp, 0); ctx.save(); ctx.translate(x, y); ctx.rotate(t * 9); ctx.drawImage(s.c, -(s.c.width >> 1), -(s.c.height >> 1)); ctx.restore(); }
  }
}
window.__rof = () => rof ? { ph: rof.ph, fs: rof.fs, s: +rof.s.toFixed(2), v: +rof.v.toFixed(2), ft: +rof.ft.toFixed(2), slab: rof.slab, L: rof.L, pj: rof.pj.length, inAt: Math.round(rof.inAt - pnow()), wx: Math.round(wx), dx: dummy ? Math.round(dummy.x - wx) : null, win: rof.slab ? { hp: rofWin().hp, broken: rofWin().broken } : null } : null;      // test hook
