// ---------------------------------------------------------------- v1.173 THE SKYSCRAPER (this file is spliced into template.html by build_html.py, right after ryu.js; how it LOOKS is in towerart.js, v1.174)
// A second MAP for FREE PLAY and VERSUS (the MAP button of the fighter and versus screens): the inside of a 50-floor skyscraper, ONE FLOOR AT A TIME. The match starts on floor 50 (the penthouse). Every floor is a long corridor of 2 to 4 rooms that is made at random the first time you see it
// (twFloorData: its size, its colours, its furniture, its lights, its windows with the city outside: the higher the floor the higher the view) and it STAYS as the fights leave it (broken walls, wrecks, holes: they are kept for the whole match, `vs.tw`; a new match starts a fresh building).
// WHAT BREAKS: furniture (desks, chairs, tables, computers, lamps, glass, vending machines, safes, pillars, server racks, crates, plants) breaks when a blow lands near it, when a body is thrown into it (the heavy ones hurt) or when you attack it; the INNER WALLS between the rooms are solid until they break;
// the OUTER WALLS are glass: a fighter thrown through one falls to the street; gas tanks and fire extinguishers EXPLODE (an area blast that can open the floor, and set off the next one). A SLAM (a hit that puts a fighter on the floor from above) or a heavy hit breaks the FLOOR under the victim, 1 floor or more by how hard it was (twSlamN):
// he falls through the crater, 3% of his health a floor (at most 30%, never a K.O.). A launch that is high enough breaks the CEILING and sends the victim up a floor. The crater stays: anybody who walks into it falls too. Stairs (1 floor) and elevators (5 floors) are in the rooms: stand at the door and press JUMP (up) or CROUCH (down).
// The fighters are on ONE floor at a time (the camera follows you): a fighter who is on another floor is AWAY (twAway: his place is far off, he is held still); he comes after you: through the crater if you fell, by the stairs or the elevator if not (twFoeArrive). The enemy also stays away from the edge of a crater.
// The module is hooked in at: drawBackdrop (twBackdrop), the pedestrians (off), tick (twTick, twOverlay), startMatch / beginRound (twInit, twRound), the MAP buttons, and Ryu's ULTIMATE (twSlam, twSweep).
const TW_N = 50, TW_CEIL = 88, TW_BODY = 12, TW_CABW = 100, TW_PEND = 600;      // (floors, the height of a room (px), half the width of a body, for the walls, the width of the elevator cab (a tight 100 px) and how long after a floor button the cab waits for you to step out)
let twPick = 0, twWant = false;      // (the map chosen on the screens: 0 street, 1 skyscraper; startMatch reads twWant)
try { twPick = +localStorage.getItem('js_map') ? 1 : 0; } catch { twPick = 0; }
function twOn() { return !!vs && vs.map === 'tower' && !!vs.tw; }
function twRng(s) { let a = s >>> 0; return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
const twMix = (a, b, k) => { const p = s => [1, 3, 5].map(i => parseInt(s.substr(i, 2), 16)); const x = p(a), y = p(b); return '#' + x.map((v, i) => Math.round(v + (y[i] - v) * k).toString(16).padStart(2, '0')).join(''); };

// ---- the colours of a floor and the kinds of floor
const TW_PAL = [
  { w: '#cdbf9e', w2: '#b9aa86', base: '#6b5a3a', car: '#6d3b2c', car2: '#5a2f23', ceil: '#d9d4c4', acc: '#a0522d' },
  { w: '#9fb4c8', w2: '#8aa0b6', base: '#47576b', car: '#2f4666', car2: '#27395a', ceil: '#cfd8e0', acc: '#2e5f9e' },
  { w: '#a9c4a0', w2: '#93b08a', base: '#4f6a49', car: '#3d4a3a', car2: '#323d30', ceil: '#d4dccd', acc: '#2f7d4f' },
  { w: '#e4e4ea', w2: '#cfcfd8', base: '#8a8a98', car: '#9aa0ae', car2: '#868c9a', ceil: '#f0f0f4', acc: '#c0392b' },
  { w: '#6e4a3a', w2: '#5d3d2f', base: '#2e1d16', car: '#7a1f2b', car2: '#641923', ceil: '#2b2220', acc: '#d4a017' },
  { w: '#8a8a8f', w2: '#77777c', base: '#44444a', car: '#3b3b42', car2: '#323238', ceil: '#5a5a60', acc: '#e07b00' }];
const TW_THEMES = [      // what a floor is: name, how often, which colours, the furniture [kind, weight] and how many pieces a room gets
  { n: 'OFFICE', w: 6, pal: [0, 1, 2, 3], objs: [['desk', 6], ['chair', 3], ['plant', 1], ['lamp', 1], ['glass', 1], ['extinguisher', 1], ['cabinet', 1], ['cooler', 1]], cnt: [5, 8] },
  { n: 'OPEN PLAN', w: 3, pal: [1, 3, 5], objs: [['desk', 7], ['chair', 2], ['pillar', 2], ['plant', 1], ['cooler', 1], ['cabinet', 1]], cnt: [6, 9] },
  { n: 'CONFERENCE', w: 2, pal: [3, 4, 1], objs: [['table', 4], ['chair', 5], ['glass', 2], ['lamp', 1], ['plant', 1], ['shelf', 1], ['sofa', 1]], cnt: [5, 8] },
  { n: 'LOUNGE', w: 2, pal: [4, 0], objs: [['table', 3], ['lamp', 3], ['plant', 2], ['glass', 1], ['chair', 2], ['sofa', 4], ['shelf', 2]], cnt: [5, 7] },
  { n: 'PANTRY', w: 2, pal: [2, 3, 0], objs: [['vending', 3], ['table', 2], ['chair', 3], ['plant', 1], ['extinguisher', 1], ['cooler', 2], ['cabinet', 2]], cnt: [4, 7] },
  { n: 'SERVER ROOM', w: 1, pal: [5, 1], objs: [['rack', 6], ['extinguisher', 1], ['safe', 1], ['cabinet', 1]], cnt: [5, 8] },
  { n: 'STORAGE', w: 1, pal: [5], objs: [['crate', 5], ['gas', 3], ['extinguisher', 2], ['safe', 1], ['cabinet', 2]], cnt: [5, 8] }];
const TW_K = {      // the furniture: width, height (px), strength, damage to a body that is thrown into it, the colours of its pieces, the sound it makes (0 wood, 1 glass, 2 metal, 3 stone), what it does
  desk: { w: 34, h: 16, hp: 26, dmg: 4, cols: ['#b07a3a', '#8a5a2b', '#5a3a1a'], s: 0 },
  chair: { w: 12, h: 15, hp: 9, dmg: 2, cols: ['#3a3f55', '#2a2d3d', '#9aa2b8'], s: 0 },
  table: { w: 40, h: 14, hp: 22, dmg: 4, cols: ['#c9a36a', '#8a5a2b', '#5a3a1a'], s: 0 },
  computer: { w: 14, h: 12, hp: 8, dmg: 1, cols: ['#2b2f3a', '#9aa2b8', '#7fd0ff'], s: 2, sp: 1 },
  lamp: { w: 8, h: 42, hp: 8, dmg: 1, cols: ['#ffd27a', '#3a3f55', '#fff2b0'], s: 1, lt: 1 },
  glass: { w: 6, h: 50, hp: 12, dmg: 3, cols: ['#e8f6ff', '#9fd8ff', '#2c63c9'], s: 1 },
  vending: { w: 20, h: 42, hp: 60, dmg: 10, cols: ['#c0392b', '#e8f6ff', '#9aa2b8'], s: 2, drop: 1 },
  safe: { w: 18, h: 24, hp: 110, dmg: 14, cols: ['#4a5064', '#6d7488', '#9aa2b8'], s: 2 },
  pillar: { w: 18, h: TW_CEIL - 4, hp: 140, dmg: 12, cols: ['#9a8fb0', '#6d5f86', '#b8b0a0'], s: 3 },
  gas: { w: 12, h: 26, hp: 18, dmg: 3, cols: ['#c0392b', '#9aa2b8', '#2a2a30'], s: 2, boom: [62, 76] },
  extinguisher: { w: 7, h: 16, hp: 8, dmg: 2, cols: ['#c0392b', '#ffffff', '#9aa2b8'], s: 2, boom: [34, 54] },
  rack: { w: 16, h: 40, hp: 80, dmg: 10, cols: ['#2b2f3a', '#7fd0ff', '#9aa2b8'], s: 2, sp: 1 },
  crate: { w: 16, h: 16, hp: 16, dmg: 3, cols: ['#b07a3a', '#8a5a2b', '#5a3a1a'], s: 0 },
  plant: { w: 10, h: 22, hp: 8, dmg: 1, cols: ['#2f7d4f', '#5a3a1a', '#7bc67e'], s: 0 },
  sofa: { w: 40, h: 20, hp: 30, dmg: 5, cols: ['#7a4f33', '#583622', '#9a6a4a'], s: 0 },
  shelf: { w: 22, h: 40, hp: 30, dmg: 5, cols: ['#774a33', '#59331f', '#c0392b'], s: 0 },
  cabinet: { w: 14, h: 26, hp: 40, dmg: 5, cols: ['#8d95a8', '#7d859a', '#c3cad9'], s: 2 },
  cooler: { w: 10, h: 28, hp: 14, dmg: 2, cols: ['#e4e8f0', '#7fb6e0', '#aab2c4'], s: 1, splash: 1 }};

// ---- one floor, made the first time it is needed from the match's seed and its number (so it is always the same floor), and then kept
function twFloorData(f) {
  const T = vs.tw; let F = T.fl[f]; if (F) return F;
  const R = twRng(T.seed * 131 + f * 7919 + 17), lobby = f === 1, pent = f === TW_N, nr = lobby || pent ? 3 : 2 + ((R() * 3) | 0);
  const xs = [0]; for (let i = 0; i < nr; i++) xs.push(xs[i] + 340 + ((R() * 180) | 0));
  let th; if (lobby) th = { n: 'LOBBY', pal: [3, 0], objs: [['pillar', 3], ['plant', 2], ['glass', 1], ['table', 1], ['lamp', 1], ['sofa', 2]], cnt: [3, 5] }; else if (pent) th = { n: 'PENTHOUSE', pal: [4], objs: [['table', 2], ['lamp', 3], ['plant', 3], ['glass', 2], ['pillar', 1], ['safe', 1], ['sofa', 3], ['shelf', 1]], cnt: [3, 5] };
  else { let tot = 0; for (const t of TW_THEMES) tot += t.w; let r = R() * tot; th = TW_THEMES[0]; for (const t of TW_THEMES) { r -= t.w; if (r <= 0) { th = t; break; } } }
  if (T.forceTh) { const ft = TW_THEMES.find(t => t.n === T.forceTh); if (ft) th = ft; }      // (a test hook: every floor of this theme)
  const pi = th.pal[(R() * th.pal.length) | 0];
  F = { f, xs, W: xs[nr], nr, th: th.n, pal: TW_PAL[T.forcePal !== undefined ? T.forcePal : pi], wt: twWeather(T.seed, f), decals: [], walls: [], objs: [], wrecks: [], holes: [], lights: [], doors: [], pick: [], outer: [{ hp: 30, broken: false, at: 0 }, { hp: 30, broken: false, at: 0 }], seed: (T.seed ^ (f * 2654435761)) >>> 0 };
  for (let i = 1; i < nr; i++) F.walls.push({ x: xs[i], hp: 80, mx: 80, broken: false, at: 0 });
  for (let i = 0; i < nr; i++) F.doors.push({ x: Math.round(xs[i] + 70 + R() * (xs[i + 1] - xs[i] - 140)), k: i === 1 ? 'elev' : 'stairs', room: i, hp: 70, st: 0 });      // (every floor has stairs in its first room and every other room but one, and ONE elevator door, in the second room: the cab is one machine for the whole building)
  for (let x = 44; x < F.W - 30; x += 84) F.lights.push({ x, ok: true, hp: 30 });
  const near = (x, w) => F.doors.some(d => Math.abs(d.x - x) < 34 + w / 2) || F.objs.some(o => Math.abs(o.x - x) < (TW_K[o.k].w + w) / 2 + 3 && !o.on);
  const pick = () => { let tot = 0; for (const o of th.objs) tot += o[1]; let r = R() * tot; for (const o of th.objs) { r -= o[1]; if (r <= 0) return o[0]; } return th.objs[0][0]; };
  const add = (k, x) => { const K = TW_K[k], o = { k, x: Math.round(x), hp: K.hp, mx: K.hp, wob: 0, hitAt: -9999, v: (twHash(Math.round(x), f * 13 + k.length) * 4) | 0 }; F.objs.push(o); return o; };
  for (let i = 0; i < nr; i++) {
    const a = xs[i] + 26, b = xs[i + 1] - 26, n = th.cnt[0] + ((R() * (th.cnt[1] - th.cnt[0] + 1)) | 0);
    for (let q = 0; q < n; q++) {
      const k = pick(), K = TW_K[k]; let x = 0, ok = false; for (let tr = 0; tr < 8 && !ok; tr++) { x = a + K.w / 2 + R() * (b - a - K.w); ok = !near(x, K.w); } if (!ok) continue;
      const o = add(k, x); if (k === 'desk') { if (R() < 0.8) { const c = add('computer', x + (R() < 0.5 ? -6 : 6)); c.on = o; } if (R() < 0.7 && !near(x + 28, 12)) add('chair', x + (R() < 0.5 ? 27 : -27)); }
    }
  }
  return (T.fl[f] = F);
}

// ---- the match: a new building (twInit, from startMatch), a new round (twRound, from beginRound: floor 50 again, the damage stays)
function twInit() {
  vs.map = 'tower'; vs.tw = { seed: (Math.random() * 1e9) | 0, fl: {}, fMe: TW_N, fFoe: TW_N, q: [], px: 0, dx: 0, pHp: 0, dHp: 0, dHit: -9999, dDown: 0, pDown: 0, swingAt: 0, slide: null, ff: null, banner: null, away: false, awayX: 0, arrX: 0, via: 'stairs', lastDoor: 0, hint: 0, on: false, expl: [], doorAt: -1, flashes: [], haze: null, cab: null, lift: twLiftNew(false), viaLift: false, jobAt: 0, cabAt: -1, seen: {}, cf: TW_N, prevF: 0, oorAt: -9999, cabF: { f: 0, xs: [0, TW_CABW], W: TW_CABW, nr: 1, th: 'CAB', walls: [], objs: [], wrecks: [], holes: [], lights: [], doors: [], pick: [], decals: [], outer: [{ hp: 1e9, mx: 1e9, broken: false, at: 0 }, { hp: 1e9, mx: 1e9, broken: false, at: 0 }] } };
}
function twRound(now) {
  const T = vs.tw, d = dummy; T.fMe = T.fFoe = TW_N; T.q.length = 0; T.away = false; T.slide = null; T.ff = null; T.haze = null; T.flashes = []; T.cab = null; T.lift = twLiftNew(T.lift && T.lift.broken); T.viaLift = false; vs.nHold = 0; T.seen[TW_N] = 1; T.cf = TW_N; T.prevF = 0; T.expl.length = 0; const F = twFloorData(TW_N), gap = d ? d.x - wx : 60; wx = twFreeX(F, Math.round((F.xs[1] + F.xs[2]) / 2) - 30, gap); wxv = 0; wvx = 0;
  if (d) { d.x = wx + gap; d.twAway = false; }
  T.px = wx; T.dx = d ? d.x : 0; T.pHp = vs.hp; T.dHp = d ? d.hp : 0; T.dHit = d ? d.hitAt : -9999; T.dDown = d ? d.down || 0 : 0; T.pDown = gDownUntil; T.on = true; T.banner = { txt: 'FLOOR ' + TW_N, at: now };
}
function twFreeX(F, x, gap) {      // a place for you (and the enemy gap px in front of you) that is not in a crater: the middle of the room if it is free, else the nearest free place in steps of 40 px
  const bad = (q, m) => F.holes.some(h => Math.abs(q - h.x) < h.r + m);
  for (let k = 0; k < 40; k++) { const q = x + (k % 2 ? 1 : -1) * Math.ceil(k / 2) * 40; if (q > 30 && q < F.W - 30 && !bad(q, 14) && !bad(q + gap, 14) && !F.doors.some(d => Math.abs(d.x - q) < 36 || Math.abs(d.x - q - gap) < 36) && twPlace(F, q) === q) return q; }
  return x;
}
function twClearWorld() { deb = []; lit = []; smoke = []; decals = []; drops = []; pools = []; gibs = []; sparks = []; }      // (what lay about the floor you left is gone)

// ---------------------------------------------------------------- what is seen: see towerart.js (twBackdrop, twFront)
function twLightFrac(F) { let n = 0; for (const l of F.lights) if (l.ok) n++; let m = n, t = F.lights.length; for (const o of F.objs) if (TW_K[o.k].lt) { t++; if (o.hp > 0) m++; } return t ? m / t : 1; }

// ---------------------------------------------------------------- what breaks
function twHurtMe(dm, now, safe) {      // damage to you from the building (a fall never kills: safe)
  if (dm < 1 || !vs) return; const T = vs.tw;
  if (safe) { if (!SET.ihp) { vs.hp = Math.max(1, vs.hp - dm); vs.hitAt = now; } } else vsHurt(dm, now);
  T.pHp = vs.hp;
}
function twHurtFoe(dm, now, safe) {
  const d = dummy; if (!d || d.ko >= 0 || dm < 1) return; const T = vs.tw;
  d.hp = Math.max(safe ? 1 : 0, d.hp - dm); T.dHp = d.hp; if (d.hp <= 0) koDummy(now);
}
function twAddHole(f, x, r, now) {      // the floor of floor f is broken at x (radius r): a crater; what stood on it falls in
  if (f <= 1 || f > TW_N) return false; const F = twFloorData(f);
  for (const h of F.holes) if (Math.abs(h.x - x) < Math.max(h.r, r)) { h.r = Math.min(70, Math.max(h.r, r) + 4); return true; }
  F.holes.push({ x: Math.round(x), r, at: now });
  for (const o of F.objs.slice()) if (Math.abs(o.x - x) < r - 2) twBreakObj(F, o, now);
  return true;
}
function twDamageObj(F, o, p, now) {
  if (o.hp <= 0 || p <= 0) return; const K = TW_K[o.k], by = o.on ? TW_K[o.on.k].h : 0; o.hp -= p; o.wob = now + 220; o.hitAt = now;
  debBurst(o.x, by + K.h * 0.5, 2 + ((p / 6) | 0), K.cols, 50 + p); if (K.sp) spark(o.x, gy - by - K.h * 0.6, 3, ['#7fd0ff', '#ffffff'], false, 1); snd('twbreak', K.s === 1 ? 1 : K.s === 3 ? 3 : 7);
  if (o.hp <= 0) twBreakObj(F, o, now);
}
function twBreakObj(F, o, now) {
  const i = F.objs.indexOf(o); if (i < 0) return; F.objs.splice(i, 1); const K = TW_K[o.k], by = o.on ? TW_K[o.on.k].h : 0, T = vs.tw, vis = T.fMe === F.f;
  F.wrecks.push({ x: o.x, w: K.w, n: Math.max(3, K.w >> 2), c: K.cols }); if (F.wrecks.length > 70) F.wrecks.shift();
  if (vis) { debBurst(o.x, by + K.h * 0.5, 10 + (K.w >> 2), K.cols, 110 + K.h); debBurst(o.x, by + 3, 4, K.cols, 60, 2); snd('twbreak', K.s); if (K.sp) spark(o.x, gy - by - K.h * 0.5, 8, ['#7fd0ff', '#ffffff', '#ffd34d'], false, 1); shakeUntil = Math.max(shakeUntil, now + 90); shakeAmp = Math.max(shakeAmp, o.k === 'pillar' ? 4 : 1); }
  if (K.drop) F.pick.push({ x: o.x + 9 });
  if (K.splash) { twDecal(F, 'puddle', o.x, 0); if (vis) debBurst(o.x, 16, 10, ['#9fd8ff', '#cfeaff', '#ffffff'], 100); }
  if (o.k === 'pillar' && vis) { puff(o.x - 6, 5); puff(o.x + 6, 5); debBurst(o.x, 40, 12, ['#b8b0a0', '#8a8478'], 120); shockAt(o.x, 160, 70, 0.6); twHaze(now, 0.4); }
  for (const c of F.objs.slice()) if (c.on === o) twBreakObj(F, c, now);
  if (K.boom) twExplode(F, o.x, K.boom[0], K.boom[1], now);
}
function twWallHit(F, w, p, now) {      // an inner wall takes p; at 0 it breaks (true)
  if (w.broken || p <= 0) return false; w.hp -= p; w.at = now; const T = vs.tw;
  if (T.fMe === F.f) { debBurst(w.x, 24, 3 + ((p / 8) | 0), ['#8a8a92', '#6d6d75', '#b8b0a0'], 70); snd('twbreak', 3); }
  if (w.hp <= 0) { w.broken = true; if (T.fMe === F.f) { debBurst(w.x, 30, 22, ['#8a8a92', '#6d6d75', '#b8b0a0'], 150); puff(w.x - 6, 6); puff(w.x + 6, 6); shockAt(w.x, 220, 90, 0.7); shakeUntil = Math.max(shakeUntil, now + 260); shakeAmp = Math.max(shakeAmp, 4); say('WALL DOWN', w.x, '#ffd34d', 8, now); twHaze(now, 0.5); twFlash(w.x, now, [255, 240, 210], 36); } twLightsShock(F, w.x, 110, 30, now); return true; }
  return false;
}
function twOuterHit(F, side, p, now) {      // the glass at an end of the floor takes p; at 0 it shatters (true)
  const O = F.outer[side]; if (O.broken || p <= 0) return false; O.hp -= p; O.at = now; const x = side ? F.W : 0, T = vs.tw;
  if (O.hp <= 0) { O.broken = true; if (T.fMe === F.f) { debBurst(x, 28, 26, ['#e8f6ff', '#9fd8ff', '#2c63c9'], 170); spark(x, gy - 30, 12, ['#ffffff', '#9fd8ff'], true, side ? 1 : -1); snd('twbreak', 1); shakeUntil = Math.max(shakeUntil, now + 200); shakeAmp = Math.max(shakeAmp, 3); say('GLASS!', x, '#9fd8ff', 8, now); } return true; }
  return false;
}
function twImpactNear(F, x, p, now, reach) {      // a blow lands at x: what stands close takes part of it (a hard one shakes the lights above and chips the wall behind)
  for (const o of F.objs.slice()) if (Math.abs(o.x - x) < reach + TW_K[o.k].w / 2) twDamageObj(F, o, p, now);
  if (p >= 12) twLightsShock(F, x, 54, p * 0.45, now); if (p >= 14) twDecal(F, 'chip', x + Math.random() * 20 - 10, 14 + Math.random() * 40);
  if (p >= 8) for (const dr of F.doors) if (dr.k === 'elev' && Math.abs(dr.x - x) < 30) twDoorHit(F, dr, p, now);
}
function twSweep(x0, x1, p, now) {      // a beam or a wave crosses the floor between x0 and x1: everything in its way takes p (Ryu's ULTIMATE)
  if (!twOn() || vs.tw.cab) return; const F = twFloorData(vs.tw.fMe), lo = Math.min(x0, x1), hi = Math.max(x0, x1);      // (in the cab there is no floor to hit)
  for (const o of F.objs.slice()) if (o.x > lo && o.x < hi) twDamageObj(F, o, p, now);
  for (const w of F.walls) if (w.x > lo && w.x < hi) twWallHit(F, w, p, now);
  for (const dr of F.doors) if (dr.k === 'elev' && dr.x > lo && dr.x < hi) twDoorHit(F, dr, p, now);
}
function twExplode(F, x, pw, rad, now) {      // a gas tank or an extinguisher goes off: an area blast that hurts both fighters, breaks what is near, sets off the next one and, from 50 up, opens the floor
  const T = vs.tw; if (T.expl.length > 5) return; T.expl.push(1); const vis = T.fMe === F.f, d = dummy;
  if (vis) { divFx.push({ wx: x, y: gy - 22, born: now, big: true }); if (divFx.length > 8) divFx.shift(); spark(x, gy - 18, 20, ['#ffffff', '#ffd34d', '#ff7a2a'], true, 1); puff(x, 8); gritAt(x, 14, 130, 0); shockAt(x, pw * 5, rad + 30, 0.9); flash(now, 150, 0.3); shakeUntil = Math.max(shakeUntil, now + 380); shakeAmp = Math.max(shakeAmp, 5); snd('twbreak', 5); hitStop(60); twHaze(now, 0.7); }
  twDecal(F, 'scorch', x, 30); twDecal(F, 'scorch', x, 6); twLightsShock(F, x, rad + 50, pw * 1.2, now); if (vis) twFlash(x, now, [255, 160, 70], 52);
  if (vis && vs.ph === 'fight') { const dd = Math.abs(wx - x); if (dd < rad) { const k = 1 - dd / rad; twHurtMe(Math.max(1, Math.round(pw * 0.4 * k)), now, false); wxv += (wx >= x ? 1 : -1) * 260 * k; say('BLAST', wx, '#ff8a3a', 8, now); } }
  if (d && d.ko < 0 && !T.away && T.fFoe === F.f) { const dd = Math.abs(d.x - x); if (dd < rad) { const k = 1 - dd / rad; d.vx += (d.x >= x ? 1 : -1) * 300 * k; twHurtFoe(Math.max(1, Math.round(pw * 0.4 * k)), now, false); d.hitAt = now; say('BLAST', d.x, '#ff8a3a', 8, now); } }
  for (const o of F.objs.slice()) { const dd = Math.abs(o.x - x); if (dd < rad) twDamageObj(F, o, pw * (1 - dd / rad) * 2.4, now); }
  for (const w of F.walls) { const dd = Math.abs(w.x - x); if (dd < rad) twWallHit(F, w, pw * (1 - dd / rad) * 1.8, now); }
  for (const dr of F.doors) { const dd = Math.abs(dr.x - x); if (dr.k === 'elev' && dd < rad) twDoorHit(F, dr, pw * (1 - dd / rad) * 3.2 + 10, now); }
  if (x < rad) twOuterHit(F, 0, pw * 1.4, now); if (F.W - x < rad) twOuterHit(F, 1, pw * 1.4, now);
  if (pw >= 50) twAddHole(F.f, x, 24, now);
  T.expl.pop();
}

// ---------------------------------------------------------------- the floors: falling, climbing, being away
const twHoleAt = (F, x) => { for (const h of F.holes) if (Math.abs(x - h.x) < h.r - 4) return h; for (const d of F.doors) if (d.st === 2 && Math.abs(x - d.x) < 14) return { x: d.x, r: 18, shaft: true, door: d }; return null; };      // (a crater, or the open shaft of a torn-out elevator door)
function twDepthAt(f, x) { let n = 0, g = f; while (g > 1) { const h = twHoleAt(twFloorData(g), x); if (!h) break; if (h.shaft) { n += g - 1; break; } n++; g--; } return n; }      // (how many floors a body at x falls from floor f: a crater 1 floor each, a shaft all the way down)
function twPlace(F, x) { x = Math.max(24, Math.min(F.W - 24, x)); for (const w of F.walls) if (!w.broken && Math.abs(x - w.x) < 20) x = w.x + (x >= w.x ? 20 : -20); return x; }
function twFloorSwitch(now, x, kind) {      // you are on another floor now: its place and its number; unless it is a straight cut (the elevator) the CAMERA SLIDES there (kind 'fall', 'stairs' or 'ceil': twSlideStart), never a fade
  const T = vs.tw, F = twFloorData(T.fMe), f0 = T.cf, x0 = wx, d = dummy, foeX = d && d.ko < 0 && !T.away && T.fFoe === f0 ? d.x : null; if (T.cf !== T.fMe) { T.prevF = T.cf; T.cf = T.fMe; } T.seen[T.fMe] = 1; twClearWorld(); wx = twPlace(F, x); wxv = 0; wvx = 0; T.px = wx; T.banner = { txt: 'FLOOR ' + T.fMe, at: now }; popups = []; T.slide = null;
  if (kind && kind !== 'cut' && f0 !== T.fMe && vs.ph === 'fight') twSlideStart(now, f0, T.fMe, x0, kind, foeX);
}
function twSlideStart(now, f0, f1, x0, kind, foeX) {      // the camera follows you from floor f0 to floor f1: the floors run past (a fall speeds up, the stairs glide, a launch slows down), you cannot move for as long as it takes; foeX = where the enemy stands on the floor you leave (he stays there, in sight)
  const T = vs.tw, n = Math.abs(f1 - f0), ms = kind === 'stairs' ? 520 : kind === 'ceil' ? Math.min(900, 380 + 80 * n) : Math.min(1000, 360 + 90 * n);
  T.slide = { at: now, ms, f0, f1, n, dir: f1 < f0 ? 1 : -1, x0, kind, foeX, land: null }; vs.nHold = Math.max(vs.nHold || 0, now + ms);
}
function twLand(now, tag, nn, dm) { say((tag || 'FALL') + ' ' + nn + (nn > 1 ? ' FLOORS' : ' FLOOR') + ' -' + dm, wx, '#ff9a5a', 8, now); snd('twbreak', 7); puff(wx, 8); shakeUntil = now + 300; shakeAmp = 4; }      // (the thud when a fall ends)
function twPlanArrival(now) {      // the enemy is on another floor: when and how he comes: through the crater when you fell and it reaches your floor, in the cab if it is free (twLiftJob, after a moment), otherwise by the stairs (the farther, the longer)
  const T = vs.tw, L = T.lift; if (!T.away) return; const dl = Math.abs(T.fFoe - T.fMe); T.jobAt = now + 1100;
  if (L.job || L.inFoe) { T.viaLift = true; T.arriveAt = 1e12; return; }      // (he is already on his way in the cab: it takes him to wherever you are now)
  T.viaLift = false;
  if (T.fFoe > T.fMe && T.lastFallX !== null && twDepthAt(T.fFoe, T.lastFallX) >= T.fFoe - T.fMe) { T.via = 'hole'; T.arrX = T.lastFallX; T.arriveAt = now + 1200; }
  else { T.via = 'stairs'; T.arriveAt = now + Math.min(9000, 2600 + 700 * dl); }
}
function twFoeFall(n, now, x, tag, out) {      // the enemy falls n floors (a slam, a crater, the shaft, the glass): 3% of his health a floor, at most 30%, never a K.O.; you SEE him drop through the hole (T.ff, drawn by twFoeFx); he is away on the floor he lands on
  const T = vs.tw, d = dummy; if (!d || d.ko >= 0 || T.away) return; const to = Math.max(1, T.fFoe - n), nn = T.fFoe - to; if (nn < 1) return;
  const dm = Math.round((d.max || DUMMY_HP) * Math.min(0.30, 0.03 * nn)), h = twHoleAt(twFloorData(T.fFoe), d.x); say((tag || 'FALL') + ' ' + nn + (nn > 1 ? ' FLOORS' : ' FLOOR') + ' -' + dm, d.x, '#ffd34d', 8, now); twHurtFoe(dm, now, true);
  T.ff = { k: 'down', at: now, ms: 560, x: d.x, f: T.fFoe, r: h ? Math.max(14, h.r) : 22, out: !!out };
  T.fFoe = to; T.away = true; d.twAway = true; T.awayX = x; T.lastFallX = x; d.air = null; d.airH = 0; d.down = 0; d.x = wx + 1e5; d.vx = 0; d.stunUntil = now + 900; twPlanArrival(now);
}
function twMeFall(n, now, x, tag) {      // you fall n floors: the camera follows you down (a slide, no fade) and the thud comes when it ends; the enemy, if he was here, stays up there in sight
  const T = vs.tw, d = dummy, to = Math.max(1, T.fMe - n), nn = T.fMe - to; if (nn < 1) return;
  const dm = Math.max(1, Math.round(PHP * Math.min(0.30, 0.03 * nn))), foeHere = !!d && d.ko < 0 && !T.away;
  T.fMe = to; T.lastFallX = x; twFloorSwitch(now, x, 'fall'); twHurtMe(dm, now, true); if (T.slide) T.slide.land = [tag, nn, dm]; else twLand(now, tag, nn, dm);
  if (foeHere) { T.away = true; d.twAway = true; T.awayX = d.x; } twPlanArrival(now);
}
function twCeiling(who, n, now, x) {      // a launch breaks the ceiling: the victim goes up n floors and the crater stays in the floor above (you see him fly up through it; for you the camera slides up)
  const T = vs.tw, f = who === 'foe' ? T.fFoe : T.fMe; if (f >= TW_N) return; n = Math.min(n, TW_N - f); if (n < 1) return;
  for (let i = 1; i <= n; i++) twAddHole(f + i, x, 22, now);
  debBurst(x, 70, 16, ['#8a8a92', '#6d6d75', '#b8b0a0', '#c9b27a'], 140); puff(x, 8); shakeUntil = now + 300; shakeAmp = 5; snd('twbreak', 4); say('CEILING!', x, '#ffd34d', 8, now); hitStop(50);
  twLightsShock(twFloorData(f), x, 100, 60, now); if (T.fMe === f) { twHaze(now, 0.6); twFlash(x, now, [255, 240, 210], 36); }
  if (who === 'foe') { const d = dummy; T.ff = { k: 'up', at: now, ms: 520, x: d.x, f, r: 22, h0: d.airH || 0 }; T.fFoe = f + n; T.away = true; d.twAway = true; T.awayX = x + 38; T.lastFallX = x; twPlanArrival(now); }
  else { const d = dummy, foeHere = !!d && d.ko < 0 && !T.away; T.fMe = f + n; T.lastFallX = x; twFloorSwitch(now, x + 38, 'ceil'); snd('twbreak', 7); if (foeHere) { T.away = true; d.twAway = true; T.awayX = d.x; } T.lastFallX = null; twPlanArrival(now); }
}
function twSlamN(P, heavy) { return Math.min(12, heavy ? 1 + Math.floor(Math.max(0, P - 40) / 25) : 1 + Math.floor(Math.max(0, P - 12) / 12)); }      // (how many floors a hit of P damage breaks)
function twSlam(who, n, now, x) {      // a slam: the floor under the victim breaks n floors deep and he goes down through it
  const T = vs.tw, f = who === 'foe' ? T.fFoe : T.fMe; if (T.cab) return false; if (f <= 1) { say('SOLID FLOOR', x, '#9a9aa8', 8, now); return false; }      // (the floor of a cab does not break)
  n = Math.min(n, f - 1); const r = Math.min(46, 20 + 4 * n), side = who === 'foe' ? (x >= wx ? 1 : -1) : (dummy && x >= dummy.x ? 1 : -1), hx = Math.round(x + side * r * 0.6);      // (the crater is centred a little AWAY from the attacker, who stands next to the victim: he does not fall unless he walks in)
  for (let i = 0; i < n; i++) twAddHole(f - i, hx, r, now);
  for (const dr of twFloorData(f).doors) if (dr.k === 'elev' && Math.abs(dr.x - x) < 50) twDoorHit(twFloorData(f), dr, 25 + 15 * n, now);
  debBurst(x, 6, 18 + 2 * n, ['#8a8a92', '#6d6d75', '#b8b0a0', '#6d3b2c'], 150 + 10 * n); puff(x - 8, 6); puff(x + 8, 6); gritAt(x, 14, 130, 0); shockAt(x, 280, 120, 0.9); snd('twbreak', 4); flash(now, 120, 0.25); shakeUntil = Math.max(shakeUntil, now + 520); shakeAmp = Math.max(shakeAmp, 6); hitStop(70);
  twLightsShock(twFloorData(f), x, 90 + 20 * n, 30 + 20 * n, now); if (T.fMe === f) { twHaze(now, 0.8); twFlash(x, now, [255, 240, 210], 36); }
  if (who === 'foe') twFoeFall(n, now, x, 'SLAM!'); else twMeFall(n, now, x, 'SLAM!'); return true;
}
function twTravel(dir, door, now) {      // the stairs (1 floor): you are on another floor, at its stairs; the camera slides up or down
  const T = vs.tw, f = T.fMe, to = Math.max(1, Math.min(TW_N, f + dir)); if (to === f) { say(dir > 0 ? 'TOP FLOOR' : 'GROUND FLOOR', wx, '#9a9aa8', 8, now); return; }
  const d = dummy, foeHere = !!d && d.ko < 0 && !T.away; T.fMe = to; const F = twFloorData(to); let best = null; for (const dr of F.doors) if (dr.k === 'stairs' && (!best || Math.abs(dr.room - door.room) < Math.abs(best.room - door.room))) best = dr;
  twFloorSwitch(now, best.x, 'stairs'); snd('twbreak', 6); T.lastFallX = null; if (foeHere) { T.away = true; d.twAway = true; T.awayX = d.x; } twPlanArrival(now);
}
function twFoeHere(now) {      // (PUT ENEMY and RESET of free play): the enemy is where you are (in the cab too)
  if (!twOn()) return; const T = vs.tw, d = dummy, L = T.lift; T.away = false; T.fFoe = T.fMe; if (d) d.twAway = false; T.q.length = 0; T.viaLift = false; T.ff = null; L.job = null; L.out = false; L.foeInAt = 0; L.inFoe = false;
  if (L.me && d && d.ko < 0) twCabFoeIn(now, false);
}
function twFoeArrive(now) {      // the enemy comes: out of the crater above you, the door of the cab, or the stairs nearest to you
  const T = vs.tw, d = dummy, F = twFloorData(T.fMe); if (!d || d.ko >= 0) { T.away = false; return; }
  let x, hole = T.via === 'hole', dr = null; if (hole) x = T.arrX; else { if (T.via === 'lift') dr = twElevOf(F); else for (const q of F.doors) if (q.k === 'stairs' && (!dr || Math.abs(q.x - wx) < Math.abs(dr.x - wx))) dr = q; x = dr.x; if (dr.st !== 2) dr.force = now + 1000; }      // (the door he comes out of swings open)
  x = twPlace(F, x); if (Math.abs(x - wx) < 26) x = twPlace(F, wx + (x >= wx ? 38 : -38));
  T.away = false; T.fFoe = T.fMe; d.twAway = false; d.x = x; d.vx = 0; d.down = 0; d.stunUntil = now + 350; d.ai = 'rest'; d.aiAt = now; d.restFor = 350;
  if (hole) { d.air = airMake(now, 90, 0, 520, 'bounce'); puff(x, 8); debBurst(x, 40, 10, ['#8a8a92', '#b8b0a0'], 110); snd('twbreak', 7); } else { puff(x, 5); snd('twbreak', 6); }
  say('ENEMY!', x, '#ffd34d', 8, now); T.dHp = d.hp; T.dx = d.x;
}
function twFoeHold(now) { const d = dummy; d.x = wx + 1e5; d.vx = 0; d.stunUntil = now + 900; d.ai = 'rest'; d.aiAt = now; d.restFor = 900; d.air = null; d.airH = 0; }      // (the enemy is not on this floor: held far off, still)
function twAwayStep(now) {      // every frame the enemy is on another floor: he is held far off, still, until he comes (or until you are on his floor: then he is where he fell); in the cab it is the cab that brings him
  const T = vs.tw, d = dummy; if (!d || d.ko >= 0) { T.away = false; return; }
  twFoeHold(now); if (T.lift.inFoe) { twLiftJob(now); return; }      // (he is riding the cab: its job goes on)
  if (T.fFoe === T.fMe) { const F = twFloorData(T.fMe); T.away = false; d.twAway = false; d.x = twPlace(F, T.awayX); d.stunUntil = now + 300; T.dx = d.x; return; }
  twLiftJob(now); if (now >= T.arriveAt) twFoeArrive(now);
}
function twFoeFx(now, draw) {      // (drawFoes asks) the enemy SEEN dropping through a crater or the glass (T.ff 'down'), flying up through a broken ceiling (T.ff 'up'), or standing on the floor you are leaving while the camera slides: draws him there (clipped to the hole) and returns true; false = draw him as usual
  const T = vs.tw, d = dummy; if (!T || !d || d.ko >= 0) return false;
  const ff = T.ff && now < T.ff.at + T.ff.ms ? T.ff : null, sl = T.slide && now < T.slide.at + T.slide.ms ? T.slide : null; if (!ff && !sl) return false;
  const gx = d.x, ga = d.airH, cx = Math.round(VW / 2), yc = gy - TW_CEIL; let did = false;
  if (ff) {
    const t = (now - ff.at) / 1000, sx = Math.round(cx + ff.x - wx); ctx.save(); ctx.beginPath();
    if (ff.k === 'down') { ctx.rect(-8, -8, VW + 16, gy + 10); if (ff.out) ctx.rect(-8, gy, VW + 16, VH + 8 - gy); else ctx.rect(sx - ff.r, gy + 2, ff.r * 2, VH + 8 - gy); ctx.clip(); ctx.translate(0, Math.round(520 * t * t)); d.airH = 0; }
    else { ctx.rect(-8, yc + 4, VW + 16, VH + 8 - yc); ctx.rect(sx - ff.r + 4, -8, ff.r * 2 - 8, yc + 12); ctx.clip(); d.airH = ff.h0 + Math.round(300 * t + 380 * t * t); }
    d.x = ff.x; draw(); ctx.restore(); did = true;
  } else if (!T.away) { ctx.save(); ctx.translate(0, Math.round(twSlideOff(sl, sl.f1, now))); draw(); ctx.restore(); did = true; }      // (he is on the floor you land on: he rides in with its band)
  else if (sl.foeX !== null) { ctx.save(); ctx.translate(0, Math.round(twSlideOff(sl, sl.f0, now))); d.x = wx + (sl.foeX - sl.x0); draw(); ctx.restore(); did = true; }      // (he is up there where you left him)
  d.x = gx; d.airH = ga; return did;
}
function twFallOut(who, now, side) {      // a fighter went through the broken glass: down to the street (the lobby); the other follows him a moment later
  const T = vs.tw, f = who === 'foe' ? T.fFoe : T.fMe; if (f <= 1) return; const lobby = twFloorData(1), x = side ? lobby.W - 20 : 20;
  if (who === 'foe') { twFoeFall(f - 1, now, x, undefined, true); T.q.push({ at: now + 1300, k: 'followMe', x }); }
  else { twMeFall(f - 1, now, x); const d = dummy; if (d && d.ko < 0 && T.away) { T.fFoe = f; T.arrX = x; T.via = 'hole'; T.arriveAt = now + 1500; } }
}
function twRunQ(e, now) {
  const T = vs.tw; if (e.k === 'followMe' && T.fMe > 1 && vs.ph === 'fight' && !T.cab) { twFloorData(1); T.fMe = 1; twFloorSwitch(now, e.x, 'fall'); snd('twbreak', 7); puff(wx, 6); say('DOWN TO THE STREET', wx, '#9fd8ff', 8, now); T.lastFallX = null; twPlanArrival(now); }
}

// ---------------------------------------------------------------- every frame (tick: twTick before the training step, twBase right after it, twOverlay after the picture)
function twRoomClamp(F, x, px, v, who, now) {      // keeps a body between the walls of its room and the glass at the ends; a hard hit breaks them (and he goes on); returns the new x and how hard he hit (0 = he did not)
  let lo = -1e9, hi = 1e9, wl = null, wr = null, ol = false, or = false;
  if (!F.outer[0].broken) { lo = 3 + TW_BODY; ol = true; } else if (F.f === 1) lo = -40;
  if (!F.outer[1].broken) { hi = F.W - 3 - TW_BODY; or = true; } else if (F.f === 1) hi = F.W + 40;
  for (const w of F.walls) { if (w.broken) continue; if (w.x <= px) { if (w.x + 5 + TW_BODY > lo) { lo = w.x + 5 + TW_BODY; wl = w; ol = false; } } else if (w.x - 5 - TW_BODY < hi) { hi = w.x - 5 - TW_BODY; wr = w; or = false; } }
  let bump = 0;
  if (x < lo) { if (wl) { if (v > 90 && twWallHit(F, wl, (v - 90) * 0.35, now)) bump = -v; else { x = lo; bump = v; } } else if (ol) { if (v > 100 && twOuterHit(F, 0, (v - 100) * 0.2, now)) bump = -v; else { x = lo; bump = v; } } }
  else if (x > hi) { if (wr) { if (v > 90 && twWallHit(F, wr, (v - 90) * 0.35, now)) bump = -v; else { x = hi; bump = v; } } else if (or) { if (v > 100 && twOuterHit(F, 1, (v - 100) * 0.2, now)) bump = -v; else { x = hi; bump = v; } } }
  return { x, bump };
}
function twBodyObjs(F, x, v, who, now) {      // a body that slides or is thrown through the furniture smashes it (and the heavy pieces hurt him)
  if (v < 110) return 1; let slow = 1;
  for (const o of F.objs.slice()) { const K = TW_K[o.k]; if (Math.abs(o.x - x) > K.w / 2 + 6 || now - o.hitAt < 350 || o.on) continue; const bd = Math.round(K.dmg * Math.min(1.6, v / 220)); twDamageObj(F, o, (v - 60) * 0.16, now); slow = 0.7;
    if (K.dmg >= 6 && bd > 0) { if (who === 'me') twHurtMe(bd, now, false); else { twHurtFoe(bd, now, false); dummy.hitAt = now; } say('SMASH ' + bd, x, '#ffd34d', 8, now); } }
  for (const dr of F.doors) if (dr.k === 'elev' && dr.st !== 2 && Math.abs(dr.x - x) < 16 && v > 160 && now - (dr.hit || -9999) > 400) { twDoorHit(F, dr, (v - 100) * 0.2, now); slow = 0.7; }      // (a body thrown into an elevator door dents it)
  return slow;
}
function twWatch(now) {      // what hit whom (watched from the health, the knock-down and the launch: every fighter's blows end there): the furniture next to the victim takes part of it; a SLAM (put on the floor from above) or a heavy hit breaks the floor; a high launch breaks the ceiling
  const T = vs.tw, d = dummy; if (!d || T.cab || vs.ph !== 'fight' || T.away || d.ko >= 0 || T.fFoe !== T.fMe) return; const F = twFloorData(T.fMe);
  if (d.hitAt > T.dHit) {
    const lost = Math.max(0, T.dHp - d.hp), P = Math.max(lost, 3), a = d.air; if (lost >= 3) twImpactNear(F, d.x, P * 0.9, now, 18);      // (a hit of 3 or more: bleeding and the like is no blow)
    const downNew = (d.down || 0) > now && d.down !== T.dDown; let n = 0;
    if (downNew && lost >= 10 && (gojoLift >= 6 || lost >= 20)) n = twSlamN(lost, false); else if (lost >= 40 && (d.airH || 0) < 4) n = twSlamN(lost, true);
    if (n > 0) { twSlam('foe', n, now, d.x); return; }
    if (a && a.kind === 'up' && now - a.at < 150 && lost >= 12 && a.h0 + a.v0 * a.v0 / (2 * a.g) >= 40) twCeiling('foe', a.h0 + a.v0 * a.v0 / (2 * a.g) >= 70 ? 2 : 1, now, d.x);
  }
  if (vs.hp < T.pHp) {
    const lost = T.pHp - vs.hp, P = Math.max(lost, 3), a = gAir; if (lost >= 3) twImpactNear(F, wx, P * 0.9, now, 18);
    const downNew = gDownUntil > now && gDownUntil !== T.pDown; let n = 0;
    if (downNew && lost >= 10 && ((d.airH || 0) >= 6 || lost >= 20)) n = twSlamN(lost, false); else if (lost >= 40 && gojoLift < 4) n = twSlamN(lost, true);
    if (n > 0) { twSlam('me', n, now, wx); return; }
    if (a && a.kind === 'up' && now - a.at < 150 && lost >= 12 && a.h0 + a.v0 * a.v0 / (2 * a.g) >= 40) twCeiling('me', a.h0 + a.v0 * a.v0 / (2 * a.g) >= 70 ? 2 : 1, now, wx);
  }
}
function twBodies(now) {      // both bodies stay between the walls of the room (or the cab); a hard hit breaks a wall or the glass (and they go on), the furniture on the way is smashed
  const T = vs.tw, d = dummy, getF = () => (T.cab ? T.cabF : twFloorData(T.fMe)); let F = getF();
  { const r = twRoomClamp(F, wx, T.px, Math.abs(wxv), 'me', now); if (r.x !== wx) { wx = r.x; if (r.bump > 0) { const dm = Math.round((r.bump - 150) * 0.1); if (dm > 0) { twHurtMe(dm, now, false); say('WALL! -' + dm, wx, '#ff9a5a', 8, now); } wxv = -wxv * 0.3; wvx = 0; snd('hit', 1); } } else if (r.bump < 0) wxv *= 0.6;
    if (wx < -8 || wx > F.W + 8) { if (F.f > 1) twFallOut('me', now, wx < 0 ? 0 : 1); } else wxv *= twBodyObjs(F, wx, Math.abs(wxv), 'me', now) < 1 ? 0.7 : 1; }
  if (!T.away && d.ko < 0 && T.fFoe === T.fMe) {
    F = getF(); const v = Math.abs(d.vx * mScale(massOf(d))), r = twRoomClamp(F, d.x, T.dx, v, 'foe', now);
    if (r.x !== d.x) { d.x = r.x; if (r.bump > 0) { const dm = Math.round((r.bump - 160) * 0.12); if (dm > 0) { twHurtFoe(dm, now, false); d.hitAt = now; say('WALL! ' + dm, d.x, '#ffd34d', 8, now); } d.vx = -d.vx * 0.3; snd('smack', 1); } } else if (r.bump < 0) d.vx *= 0.6;
    if (d.x < -8 || d.x > F.W + 8) { if (F.f > 1) twFallOut('foe', now, d.x < 0 ? 0 : 1); } else d.vx *= twBodyObjs(F, d.x, v, 'foe', now) < 1 ? 0.7 : 1;
  }
}
function twTick(now, dt) {
  if (!twOn() || state !== 'play') return; const T = vs.tw, d = dummy; if (!T.on || !d) return;
  for (let i = T.q.length - 1; i >= 0; i--) if (now >= T.q[i].at) twRunQ(T.q.splice(i, 1)[0], now);
  twLiftTick(now, dt);
  if (T.slide && now >= T.slide.at + T.slide.ms) { const s = T.slide; T.slide = null; if (s.land) twLand(now, s.land[0], s.land[1], s.land[2]); }      // (the slide is over: the thud of a fall)
  if (T.ff && now >= T.ff.at + T.ff.ms) T.ff = null;
  if (T.cab) { if (T.away && !T.lift.inFoe) twFoeHold(now); } else if (T.away) twAwayStep(now);
  if (vs.ph !== 'fight') { T.px = wx; T.dx = d.x; return; }
  if (Math.abs(wx - T.px) > 60) T.px = wx; if (Math.abs(d.x - T.dx) > 60) T.dx = d.x;      // (a body that was put somewhere (PUT ENEMY, a floor change, the enemy coming back) is where it is: no wall between)
  if (T.cab) { twCabKeys(now); twBodies(now); T.px = wx; T.dx = d.x; return; }      // (in the cab there is only the cab: its walls, you and him)
  twWatch(now);
  let F = twFloorData(T.fMe); const grounded = gojoLift < 5 && !(gAir && gAirH > 5);
  const near = grounded && !T.slide ? F.doors.find(dr => Math.abs(dr.x - wx) < 22 && dr.st !== 2) : null, dn = crReq || (stickDown && !T.sdPrev); T.sdPrev = stickDown;      // (the stairs and the elevator: JUMP goes up, CROUCH goes down; at the elevator both get you in, or call it down)
  if (near) { if (T.doorAt < 0) T.doorAt = now; } else T.doorAt = -1;
  const door = near && now - T.doorAt >= 350 ? near : null;      // (only after standing at the door for a third of a second: a jump on the way past is a jump)
  if (door) { if (door.k === 'elev') { if (jumpReq || dn) { jumpReq = false; crReq = false; twLiftUse(F, door, now); } } else if (jumpReq) { jumpReq = false; twTravel(1, door, now); } else if (dn) { crReq = false; twTravel(-1, door, now); } if (T.cab) { T.px = wx; T.dx = d.x; return; } F = twFloorData(T.fMe); }
  if (grounded && vs.ph === 'fight' && !T.slide) { const h = twHoleAt(F, wx); if (h && h.shaft) { twShaftFall('me', now); F = twFloorData(T.fMe); } else { const n = twDepthAt(T.fMe, wx); if (n > 0) { twMeFall(n, now, wx); F = twFloorData(T.fMe); } } }      // (you walked into a crater or an open shaft)
  if (!T.away && d.ko < 0 && T.fFoe === T.fMe) {
    const h = twHoleAt(F, d.x);
    if (h && !d.air && (d.airH || 0) < 5) { const sp = Math.abs(d.vx * mScale(massOf(d))); if (sp <= 100 && now - d.hitAt > 500 && now >= (d.down || 0)) { const side = T.dx < h.x ? -1 : T.dx > h.x ? 1 : (wx < h.x ? -1 : 1); d.x = h.x + side * (h.r + 3); d.vx = 0; } else if (h.shaft) twShaftFall('foe', now); else twFoeFall(twDepthAt(T.fFoe, d.x), now, d.x); }      // (the enemy stays away from the edge of a crater or a shaft unless he is thrown in)
  }
  twBodies(now);
  F = twFloorData(T.fMe);
  if ((atkReq || lpReq) && now > T.swingAt + 200) { T.swingAt = now + 120; T.swingP = lpReq ? 11 : 6; }      // (a press of ATTACK or BLUE: 0.12 s later the blow lands on what stands in front of you)
  if (T.swingAt && now >= T.swingAt) { T.swingAt = 0; for (const o of F.objs.slice()) if (o.x > wx - 6 && o.x < wx + 38) twDamageObj(F, o, T.swingP, now); for (const w of F.walls) if (!w.broken && w.x > wx - 6 && w.x < wx + 30) twWallHit(F, w, T.swingP * 0.6, now); for (const dr of F.doors) if (dr.k === 'elev' && dr.x > wx - 6 && dr.x < wx + 30) twDoorHit(F, dr, T.swingP * 0.9, now); }
  for (let i = F.pick.length - 1; i >= 0; i--) if (Math.abs(wx - F.pick[i].x) < 12) { F.pick.splice(i, 1); vs.hp = Math.min(PHP, vs.hp + Math.round(PHP * 0.06)); T.pHp = vs.hp; say('SODA +6%', wx, '#7af0a0', 8, now); snd('twbreak', 6); }
  T.px = wx; T.dx = d.x;
}
function twBase(now) {      // right after the training step (which gives an infinite-health enemy his health back): this is what the next frame's hits are measured against
  if (!twOn() || !vs.tw.on || !dummy) return; const T = vs.tw, d = dummy; T.dHp = d.hp; T.dHit = d.hitAt; T.dDown = d.down || 0; T.pHp = vs.hp; T.pDown = gDownUntil;
}
function twOverlay(now) {      // over the picture: what the elevator door tells you, the floor you are on (and where the enemy is when he is not here), and the big number when you arrive
  if (!twOn() || state !== 'play') { twPanelSync(now); return; } const T = vs.tw;
  if (ryUlNoHud()) { twPanelSync(now); return; }
  if (T.prompt && now - T.prompt.at < 80) { const mx = Math.round(VW / 2); if (T.prompt.up) pxt(T.prompt.up, mx, gy + 18, '#9fffd0', 8, 'center'); if (T.prompt.dn) pxt(T.prompt.dn, mx, gy + 27, '#9fd8ff', 8, 'center'); }
  const c = T.cab, fl = c ? Math.round(c.curF) : T.fMe, hx = Math.round(VW / 2) + (c ? 20 : 0), ha = c ? 'left' : 'center'; pxt('FLOOR ' + fl, hx, 44, '#cfe8ff', 8, ha); if (T.away) pxt(c && c.out ? 'FOE AT DOORS' : T.lift.inFoe ? 'FOE ' + T.fFoe + ' IN CAB' : 'FOE ' + T.fFoe + (T.fFoe > fl ? ' UP' : ' DOWN'), hx, c ? 62 : 53, '#ffb27a', 8, ha);      // (in the cab the lines start right of the middle of the screen, clear of the panel and of your head, and the enemy's line sits lower, clear of his grade label)
  twPanelSync(now);
  if (T.banner && now - T.banner.at < 1300) { const u = (now - T.banner.at) / 1300; ctx.globalAlpha = u > 0.6 ? Math.max(0, (1 - u) / 0.4) : 1; pxt(T.banner.txt, Math.round(VW / 2), Math.round(VH * 0.46), '#ffffff', 16, 'center'); ctx.globalAlpha = 1; }
}
// ---------------------------------------------------------------- v1.176 ONE ELEVATOR for the whole building (v1.175 made its doors, the cab and its panel; v1.176 made the cab ONE shared machine, T.lift)
// There is one cab for the whole building. It is parked at a floor (doors shut or open) or it rides to another one. At an elevator door (stand still there for 350 ms): JUMP or CROUCH: if the cab is HERE you step in (a straight cut to the inside: T.cab is the cab while you are in it); if it is somewhere else
// you CALL it (it comes, the number over the door counts, its doors open and wait about 6 s for you); if the ENEMY is riding it (or is coming for it) it is IN USE: you can neither call it nor get in. The cab is a tight 100 px (TW_CABW) with a wall at each end, the doors in the middle of the back wall.
// The PANEL (twPanelBuild: a scrolling grid of the 50 floors + TOP / LOBBY / ENEMY'S FLOOR / LAST FLOOR + OPEN / CLOSE / STOP) is over the picture: a floor button starts a countdown of 0.6 s (TW_PEND); then the doors shut and the cab goes. If you STEP OUT in that time (stand on the doors, JUMP) it goes WITHOUT you,
// with whoever is still in it: the enemy, carried to the floor you chose, alone. When it arrives the doors open and wait: you get out by standing on the doors and pressing JUMP (a straight cut). Falls and stairs have no fade: the camera slides (twSlideStart, towerart.js), the enemy is SEEN dropping through a hole (twFoeFx).
// The doors of the cab shut behind you; an enemy who was on the floor is left outside: he BANGS and after about 8 s BREAKS THEM IN (lift.broken: for good, for the whole match: they never shut again and he walks in whenever he reaches the cab). Open doors do not keep him out either (he walks in after 1.2 s).
// The enemy rides the cab himself to chase you (twLiftJob: he calls it to his floor, gets in, rides to yours, steps out of its door; the stairs when the cab is busy or a door on the way is broken). The floor doors break for good too (twDoorHit: d.st 1 OUT OF ORDER (its button is dead), 2 torn out: the shaft is open and whoever walks in falls to the lobby).
const twElevOf = F => F.doors.find(d => d.k === 'elev');      // (every floor has exactly one elevator door)
const twElevOk = f => { const F = vs.tw.fl[f]; return !F || twElevOf(F).st === 0; };      // (the cab can stop at a floor while its door is whole; a floor nobody has seen is whole)
function twDoorHit(F, d, p, now) {      // an elevator door takes a blow: it dents, a second hard one jams it (OUT OF ORDER), a lot of damage or a blast tears it out (the SHAFT is open)
  if (d.k !== 'elev' || d.st === 2 || p < 6) return; const T = vs.tw, vis = T.fMe === F.f && !T.cab; d.hp -= p; d.hit = now;
  if (vis) { debBurst(d.x, 30, 3 + ((p / 10) | 0), ['#c9d0de', '#9aa4b8', '#6d7488'], 80 + p); snd('twbreak', 2); }
  if (d.hp <= 0) {
    d.st = 2; F.wrecks.push({ x: d.x - 8, w: 16, n: 6, c: ['#c9d0de', '#9aa4b8', '#6d7488'] }, { x: d.x + 9, w: 14, n: 5, c: ['#9aa4b8', '#6d7488', '#4a5064'] }); if (F.wrecks.length > 70) F.wrecks.splice(0, F.wrecks.length - 70); twLightsShock(F, d.x, 70, 24, now);
    if (vis) { debBurst(d.x, 36, 18, ['#c9d0de', '#9aa4b8', '#6d7488', '#2a2f3d'], 170); spark(d.x, gy - 34, 14, ['#ffffff', '#ffd34d', '#7fd0ff'], true, 0); puff(d.x, 6); shockAt(d.x, 200, 80, 0.7); shakeUntil = Math.max(shakeUntil, now + 300); shakeAmp = Math.max(shakeAmp, 4); say('SHAFT OPEN!', d.x, '#ffd34d', 8, now); snd('twbreak', 4); twHaze(now, 0.4); }
  } else if (d.hp <= 40 && d.st === 0) { d.st = 1; if (vis) { spark(d.x, gy - 34, 8, ['#ffffff', '#ffd34d'], false, 0); say('OUT OF ORDER', d.x, '#ff6a5a', 8, now); snd('twlift', 6); } }
}
function twShaftFall(who, now) {      // into an open shaft: down to the lobby (3% of health a floor, at most 30%, never a K.O.: the rule of a crater); you land at the lobby's elevator, which bursts open
  const T = vs.tw, f = who === 'foe' ? T.fFoe : T.fMe; if (f <= 1) return; const L = twFloorData(1), best = L.doors.find(dr => dr.k === 'elev' && dr.st !== 2) || L.doors[0];
  if (who === 'foe') twFoeFall(f - 1, now, best.x, 'SHAFT'); else twMeFall(f - 1, now, best.x, 'SHAFT');
  T.lastFallX = null; best.force = now + 900; if (T.fMe === 1) { debBurst(best.x, 30, 12, ['#c9d0de', '#9aa4b8', '#6d7488'], 130); puff(best.x, 6); }
}
function twLiftNew(broken) {      // the one cab of the building: where it is (f, curF), what it does (ph: 'park' / 'ride' / 'stop' = an emergency stop between floors), its doors, who is in it, and the enemy's part (outside the doors, inside, riding it on a job)
  return { f: TW_N, curF: TW_N, ph: 'park', from: TW_N, dest: TW_N, at: 0, dur: 1000, vel: 0, long: false, sStart: false, rumAt: 0, popped: false, why: '', door: 0, open: false, closeAt: 0, me: false, inFoe: false, out: false, foeX: 0, foeInAt: 0, broken: !!broken, brokeAt: 0, bangs: 0, nextBang: 0, bangAt: 0, breakAt: 0, hit: -9999, pend: null, job: null, hold: 0, stopAt: 0 };
}
function twLiftRefuse(now, txt, x) { const T = vs.tw; if (now - T.oorAt > 1200) { T.oorAt = now; say(txt, x, '#ff6a5a', 8, now); snd('twlift', 6); } }
function twLiftUse(F, door, now) {      // JUMP or CROUCH at the elevator door: the cab is here: you get in; it is somewhere else: you call it down (it comes, its doors open and wait about 6 s); the enemy is riding it or coming for it: IN USE
  const T = vs.tw, L = T.lift; if (L.me || vs.ph !== 'fight') return;
  if (door.st === 1) { twLiftRefuse(now, 'OUT OF ORDER', door.x); return; }
  if (L.inFoe || L.job || L.pend) { twLiftRefuse(now, 'IN USE', door.x); return; }
  if (L.f === F.f && L.ph === 'park') { twCabEnter(F, door, now); return; }
  if (L.ph === 'ride' && L.dest === F.f && L.why === 'call') return;      // (it is already coming)
  twLiftGo(F.f, now, 'call', 0); L.hold = now + L.dur + 6500; say('ELEVATOR COMING', door.x, '#9fd8ff', 8, now); snd('twlift', 9);
}
function twLiftGo(to, now, why, delay) {      // the cab sets off for floor `to` from wherever it is (why: 'me' your panel, 'pend' it goes without you, 'call' you called it, 'foe' the enemy rides it); delay = the doors shutting first
  const T = vs.tw, L = T.lift, d = dummy; twFloorData(to); const dist = Math.abs(to - L.curF);
  L.from = L.curF; L.dest = to; L.dur = Math.max(1000, Math.min(4000, Math.round(dist * 100))); L.at = now + (delay || 0); L.ph = 'ride'; L.sStart = false; L.popped = false; L.long = L.dur >= 2800; L.rumAt = 0; L.why = why; L.pend = null; L.vel = 0; L.closeAt = 0; L.foeInAt = 0;
  if (!L.broken) { if (L.open && (L.me || L.f === T.fMe)) snd('twlift', 0); L.open = false; }
  if (L.me) {
    T.fMe = to; T.lastFallX = null;
    if (L.out) { L.out = false; T.fFoe = L.f; T.awayX = L.foeX; }      // (the cab goes: he is left behind on the floor)
    if (L.inFoe) T.fFoe = to; else if (T.away) { twPlanArrival(now); T.arriveAt = Math.max(T.arriveAt, L.at + L.dur + 700); }      // (the enemy who was not in it follows later, never before the cab stops)
  } else if (L.inFoe) { T.fFoe = to; T.away = true; if (d) d.twAway = true; }      // (he rides alone)
}
function twLiftOpen(now) { const L = vs.tw.lift; if (L.ph !== 'park') return; if (!L.open) { L.open = true; if (L.me || L.f === vs.tw.fMe) snd('twlift', 1); } }
function twLiftShut(now) {      // the doors shut: an enemy who is outside has to bang them in (8 s), unless they are broken
  const L = vs.tw.lift; if (L.broken || L.ph !== 'park') return; if (L.open) { L.open = false; if (L.me || L.f === vs.tw.fMe) snd('twlift', 0); } L.foeInAt = 0; if (L.out) { L.bangAt = now + 600; L.breakAt = now + 8000; L.nextBang = 0; }
}
function twLiftOut(now, fx, grace) {      // the enemy is outside the doors of the cab you are in (grace: they are about to shut): later he bangs on them and breaks them in, or walks in through open ones
  const T = vs.tw, L = T.lift, dk = twElevOf(twFloorData(L.f)), t0 = grace ? L.closeAt || now : now;
  L.out = true; L.foeX = fx; T.fFoe = L.f; L.bangs = 0; L.nextBang = 0; L.foeInAt = 0; L.bangAt = t0 + 450 + Math.min(2500, Math.abs(fx - dk.x) * 9); L.breakAt = Math.max(t0 + 8000, L.bangAt + 2500);
}
function twCabEnter(F, door, now) {      // you step into the cab (it is here and free): a straight cut to the inside; the enemy, if he is on the floor, is left outside the doors
  const T = vs.tw, L = T.lift, d = dummy; if (L.me || vs.ph !== 'fight') return;
  const foeHere = !!d && d.ko < 0 && !T.away && T.fFoe === T.fMe;
  L.me = true; T.cab = L; L.pend = null; L.hold = 0; L.open = true; L.closeAt = L.broken ? 0 : now + 1100; L.out = false; L.foeInAt = 0;
  if (foeHere) { T.away = true; d.twAway = true; T.awayX = d.x; T.lastFallX = null; d.air = null; d.airH = 0; d.down = 0; d.vx = 0; twLiftOut(now, d.x, true); }
  T.swingAt = 0; T.doorAt = -1; T.cabAt = now; twClearWorld(); wx = TW_CABW / 2; wxv = 0; wvx = 0; T.px = wx; T.banner = null; popups = []; if (foeHere) twFoeHold(now); T.dx = d ? d.x : 0;
}
function twCabLeave(now, quiet) {      // you step out at the floor the cab is at (a straight cut, in front of its door); the enemy who was outside or inside is right there, unless the cab is about to go with him in it
  const T = vs.tw, L = T.lift, d = dummy; if (!L.me) return; L.me = false; T.cab = null; T.fMe = L.f; const F = twFloorData(L.f), dk = twElevOf(F);
  T.doorAt = now; T.sdPrev = !!stickDown; twFloorSwitch(now, dk.x, 'cut'); T.banner = null; dk.force = now + 900; L.hold = Math.max(L.hold, now + 1500); if (!L.pend) L.closeAt = L.broken ? 0 : now + 1500;      // (the enemy waits a moment before he uses the cab you just left)
  if (d && d.ko < 0) {
    if (L.inFoe && L.pend) { T.away = true; d.twAway = true; T.fFoe = L.f; T.awayX = dk.x; }      // (the trick: he stays in the cab and goes with it)
    else if (L.inFoe || L.out) { const was = L.out; L.inFoe = false; L.out = false; L.foeInAt = 0; T.away = false; T.fFoe = L.f; d.twAway = false; d.x = twPlace(F, dk.x + ((L.foeX || dk.x) >= dk.x ? 46 : -46)); if (Math.abs(d.x - wx) < 26) d.x = twPlace(F, wx + 40); d.vx = 0; d.air = null; d.down = 0; d.stunUntil = now + 300; d.ai = 'rest'; d.aiAt = now; d.restFor = 300; T.dHp = d.hp; T.dx = d.x; if (!quiet && was) say('ENEMY!', d.x, '#ffd34d', 8, now); }
  }
}
function twCabKeys(now) {      // in the cab: stand on the doors (the middle of the back wall) for a moment and press JUMP: you step out
  const T = vs.tw, L = T.lift, on = L.ph === 'park' && Math.abs(wx - TW_CABW / 2) < 18 && gojoLift < 5 && !(gAir && gAirH > 5);
  if (on) { if (T.cabAt < 0) T.cabAt = now; T.prompt = { at: now, up: 'JUMP = GET OUT', dn: '' }; } else T.cabAt = -1;
  if (on && now - T.cabAt >= 220 && jumpReq) { jumpReq = false; twCabLeave(now); }
}
function twCabPick(f, now) {      // a floor button: 0.6 s later the doors shut and the cab goes (with you, or without you if you stepped out in time, with the enemy if he is in it); while it hangs after an emergency stop it goes at once
  const T = vs.tw, L = T && T.lift; if (!L || !L.me || L.ph === 'ride') return false; f = Math.round(f); const here = L.ph === 'stop' ? Math.round(L.curF) : L.f;
  if (!(f >= 1 && f <= TW_N) || f === here) return false;
  if (!twElevOk(f)) { say('OUT OF ORDER', wx, '#ff6a5a', 8, now); snd('twlift', 6); return false; }
  twFloorData(f); snd('twlift', 9);
  if (L.ph === 'stop') { twLiftGo(f, now, 'me', 0); return true; }
  L.pend = { f, at: now + TW_PEND }; L.closeAt = 0; return true;
}
function twCabStop(now) { const T = vs.tw, L = T && T.lift; if (!L || !L.me || L.ph !== 'ride' || now < L.at) return; L.ph = 'stop'; L.stopAt = now; L.vel = 0; snd('twlift', 10); shakeUntil = Math.max(shakeUntil, now + 350); shakeAmp = Math.max(shakeAmp, 4); say('EMERGENCY STOP', wx, '#ff6a5a', 8, now); }      // (the cab hangs between floors until you press a floor again)
function twCabBang(now) { const L = vs.tw.lift; L.bangs++; L.hit = now; snd('twlift', 7); shakeUntil = Math.max(shakeUntil, now + 100); shakeAmp = Math.max(shakeAmp, 1.5); debBurst(TW_CABW / 2, 30, 3, ['#9aa4b8', '#6d7488'], 60); if (L.bangs === 1) say('HE IS AT THE DOORS!', TW_CABW / 2, '#ff8a3a', 8, now); }
function twCabFoeIn(now, brk) {      // the enemy gets into the cab: he BREAKS THE DOORS IN (they stay broken for good, the whole match) or walks in through open or broken ones
  const T = vs.tw, L = T.lift, d = dummy; if (!d || d.ko >= 0 || !L.me) return; const mid = TW_CABW / 2;
  L.inFoe = true; L.out = false; L.foeInAt = 0; T.away = false; T.fFoe = L.f; d.twAway = false; d.x = Math.max(16, Math.min(TW_CABW - 16, wx <= mid ? wx + 30 : wx - 30)); d.vx = 0; d.air = null; d.airH = 0; d.down = 0; d.stunUntil = now + 450; d.ai = 'rest'; d.aiAt = now; d.restFor = 450; T.dHp = d.hp; T.dx = d.x;
  if (brk) {
    L.broken = true; L.brokeAt = now; L.open = true; L.closeAt = 0;
    debBurst(mid, 34, 22, ['#c9d0de', '#9aa4b8', '#6d7488', '#2a2f3d'], 170); spark(mid, gy - 34, 16, ['#ffffff', '#ffd34d', '#7fd0ff'], true, 0); puff(mid, 8); shockAt(mid, 220, 90, 0.7); flash(now, 120, 0.2);
    shakeUntil = Math.max(shakeUntil, now + 380); shakeAmp = Math.max(shakeAmp, 5); say('DOORS BROKEN FOR GOOD!', mid, '#ff8a3a', 8, now); snd('twlift', 8); hitStop(60);
  } else { puff(mid, 4); say('HE STEPS IN!', mid, '#ff8a3a', 8, now); snd('twlift', 1); }
}
function twLiftArrive(now) {      // the cab stops at a floor: a ding, the doors open and wait (for you: until you press a floor or CLOSE)
  const T = vs.tw, L = T.lift, d = dummy; L.ph = 'park'; L.f = L.dest; L.curF = L.dest; L.vel = 0; L.at = 0; T.seen[L.f] = 1;
  if (L.me || L.f === T.fMe) { snd('twbreak', 6); snd('twlift', 3); } if (L.me) { shakeUntil = Math.max(shakeUntil, now + 200); shakeAmp = Math.max(shakeAmp, 2); }
  L.open = true; L.closeAt = L.me || L.job ? 0 : now + (L.why === 'call' ? 6500 : 1800); if (L.why === 'call') L.hold = now + 6500;
  let J = L.job;
  if (J) { if (L.inFoe) { if (L.f === T.fMe) { J.st = 'out'; J.at = now + 500; } else { J.st = 'go'; J.at = now + 600; } } else if (J.st === 'call') { if (L.f === T.fFoe) { J.st = 'board'; J.at = now + 700; } else twLiftGo(T.fFoe, now, 'foe', 0); } }
  else if (L.inFoe && !L.me && d && d.ko < 0) {      // (he was carried here without a job: the trick; he rides on to you)
    if (L.f === T.fMe) L.job = { st: 'out', at: now + 500 }; else if (twElevOk(T.fMe) && twElevOk(L.f)) { L.job = { st: 'go', at: now + 800 }; T.viaLift = true; T.arriveAt = 1e12; }
    else { L.inFoe = false; T.away = true; d.twAway = true; T.fFoe = L.f; T.awayX = twElevOf(twFloorData(L.f)).x + 40; twPlanArrival(now); }
  }
}
function twLiftJobEnd(now) {      // the cab cannot do it (a door on the way broke): he gets out where it is and takes the stairs
  const T = vs.tw, L = T.lift, d = dummy; L.job = null; T.viaLift = false; if (L.inFoe) { L.inFoe = false; T.away = true; if (d) d.twAway = true; T.fFoe = L.f; T.awayX = twElevOf(twFloorData(L.f)).x + 40; } twPlanArrival(now);
}
function twLiftJob(now) {      // the enemy is away: if the cab is free and both doors work, he calls it to his floor, gets in, rides to yours and steps out of its door; otherwise he takes the stairs
  const T = vs.tw, L = T.lift; let J = L.job;
  if (!J) {
    if (L.me || L.inFoe || L.pend || L.ph !== 'park' || now < L.hold || now < T.jobAt || T.via === 'hole' || T.fFoe === T.fMe || T.arriveAt - now < 1800 || vs.ph !== 'fight' || !twElevOk(T.fFoe) || !twElevOk(T.fMe)) return;
    J = L.job = { st: 'call', at: now }; T.viaLift = true; T.arriveAt = 1e12;
    if (L.f === T.fFoe) { J.st = 'board'; J.at = now + 700; L.open = true; } else twLiftGo(T.fFoe, now, 'foe', 300);
    return;
  }
  if (L.ph === 'park' && (!twElevOk(T.fMe) || (!L.inFoe && !twElevOk(T.fFoe)))) { twLiftJobEnd(now); return; }
  if (J.st === 'board' && now >= J.at) { L.inFoe = true; if (!L.broken) L.open = false; J.st = 'go'; J.at = now + 450; }
  else if (J.st === 'go' && now >= J.at && L.ph === 'park') { if (L.f === T.fMe) { J.st = 'out'; J.at = now; } else { twLiftGo(T.fMe, now, 'foe', 350); J.st = 'ride'; } }
  else if (J.st === 'out' && now >= J.at) { L.job = null; L.inFoe = false; T.viaLift = false; T.via = 'lift'; L.closeAt = now + 2500; twFoeArrive(now); }
}
function twLiftTick(now, dt) {      // every frame, wherever you are: the doors, the trip, the enemy outside the doors (he bangs, breaks in or walks in), the enemy using the cab
  const T = vs.tw, L = T.lift, d = dummy; if (!L) return;
  if (!d || d.ko >= 0) { if (L.inFoe || L.out || L.job) { L.inFoe = false; L.out = false; L.job = null; L.foeInAt = 0; T.viaLift = false; } }
  if (vs.ph !== 'fight') { if (L.me) twCabLeave(now, true); return; }
  L.door += Math.max(-dt / 0.45, Math.min(dt / 0.45, (L.broken || (L.ph === 'park' && L.open) ? 1 : 0) - L.door)); if (L.broken) L.open = true;
  if (L.ph === 'park') {
    if (L.pend && now >= L.pend.at) { const f = L.pend.f; L.pend = null; if (twElevOk(f)) twLiftGo(f, now, L.me ? 'me' : 'pend', L.broken ? 0 : 380); else if (L.me) { say('OUT OF ORDER', wx, '#ff6a5a', 8, now); snd('twlift', 6); } }
    else if (L.open && L.closeAt && now >= L.closeAt) { L.closeAt = 0; twLiftShut(now); }
    if (L.me && L.ph === 'park') {
      if (T.away && !L.out && !L.inFoe && !T.viaLift && (T.fFoe === L.f || now >= T.arriveAt)) twLiftOut(now, T.fFoe === L.f ? T.awayX : twElevOf(twFloorData(L.f)).x + 40, false);      // (he arrived: outside the doors)
      if (L.out) {
        const open = L.broken || (L.open && !L.closeAt);      // (doors that stand open for good, or are broken: he just walks in)
        if (open) { if (!L.foeInAt) L.foeInAt = now + (L.broken ? 700 : 1200); } else L.foeInAt = 0;
        if (L.foeInAt && now >= L.foeInAt) twCabFoeIn(now, false);
        else if (!open && L.door < 0.05) { if (now >= L.bangAt && now >= L.nextBang) { twCabBang(now); L.nextBang = now + 700; } if (now >= L.breakAt) twCabFoeIn(now, true); }
      }
    }
  } else if (L.ph === 'ride' && now >= L.at) {
    const u = Math.min(1, (now - L.at) / L.dur), e = u < 0.5 ? 2 * u * u : 1 - Math.pow(2 - 2 * u, 2) / 2, prev = L.curF; L.curF = L.from + (L.dest - L.from) * e; L.vel = Math.abs(L.curF - prev) / Math.max(0.001, dt);
    if (L.me) { if (!L.sStart) { L.sStart = true; snd('twlift', 2); L.rumAt = now + 700; } else if (now >= L.rumAt) { snd('twlift', 4); L.rumAt = now + 850; } if (L.long && !L.popped && u > 0.15) { L.popped = true; snd('twlift', 5); } shakeUntil = Math.max(shakeUntil, now + 80); shakeAmp = Math.max(shakeAmp, L.vel > 6 ? 1.6 : 1); }
    if (u >= 1) twLiftArrive(now);
  }
}
function twLiftPrompt(F, d) {      // what an elevator door tells you when you stand at it (twDoorEmit)
  const L = vs.tw.lift; if (d.st === 1) return { up: 'OUT OF ORDER', dn: '' }; if (L.inFoe || L.job || L.pend) return { up: 'IN USE', dn: '' };
  return L.f === F.f && L.ph === 'park' ? { up: 'JUMP = GET IN', dn: 'CROUCH = GET IN' } : { up: 'JUMP = CALL IT', dn: 'CROUCH = CALL IT' };
}

// ---- the panel (DOM, over the picture; made the first time you step into the cab)
const TW_ABBR = { 'OFFICE': 'OFFICE', 'OPEN PLAN': 'OPEN', 'CONFERENCE': 'CONF', 'LOUNGE': 'LOUNGE', 'PANTRY': 'PANTRY', 'SERVER ROOM': 'SERVER', 'STORAGE': 'STORE', 'LOBBY': 'LOBBY', 'PENTHOUSE': 'PENT' };
const TW_CSS = '#twp{position:fixed;z-index:3;display:none;flex-direction:column;gap:.9vh;box-sizing:border-box;padding:1vh;left:calc(env(safe-area-inset-left) + 3vh + 40vh*var(--pbs,1) + 1.5vh);top:calc(env(safe-area-inset-top) + 12vh);bottom:calc(env(safe-area-inset-bottom) + 3vh);width:max(150px,min(52vh,calc(50vw - 48.5vh),260px));border:2px solid #20242e;border-radius:5px;background:linear-gradient(90deg,#8d94a1,#b6bcc8 16%,#9aa1ae 50%,#b2b8c4 84%,#838a97);box-shadow:inset 0 0 0 2px #dfe4ec,inset 0 0 14px #0007,0 0 0 3px #0008;touch-action:pan-y}#twp.on{display:flex}#twp.r{left:auto;right:calc(env(safe-area-inset-right) + 3vh + 40vh*var(--pbs,1) + 1.5vh)}'
  + '#twp button{font:inherit;color:#1c2029;cursor:pointer;margin:0;padding:0;border:2px solid #444a59;background:radial-gradient(circle at 35% 28%,#f4f6fa,#bcc2ce 58%,#8c93a2);position:relative;touch-action:manipulation;-webkit-tap-highlight-color:transparent}#twp button:active{filter:brightness(.82)}#twp button:disabled{cursor:default}'
  + '#twpq{display:grid;grid-template-columns:repeat(4,1fr);gap:.7vh}#twpq button{border-radius:5px;height:6.4vh;min-height:26px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:.5vh;font-size:clamp(5px,1.35vh,8px);line-height:1}#twpq b{font-size:clamp(8px,2.3vh,13px)}#twpq button:disabled{opacity:.35}'
  + '#twpg{flex:1;min-height:0;overflow-y:auto;overscroll-behavior:contain;display:grid;grid-template-columns:repeat(5,minmax(0,1fr));grid-auto-rows:min-content;gap:1vh;padding:.9vh;background:#262a34;border-radius:4px;box-shadow:inset 0 0 9px #000;touch-action:pan-y;scrollbar-width:thin;scrollbar-color:#8a91a0 #262a34}'
  + '.twf{aspect-ratio:1;min-width:0;overflow:hidden;border-radius:50%;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:.4vh;font-size:clamp(8px,2.5vh,14px);line-height:1}.twf i{font-style:normal;font-size:clamp(4px,1.05vh,6px);letter-spacing:0;opacity:.85;max-width:100%;overflow:hidden;white-space:nowrap}.twf u,.twf s{display:none;position:absolute;text-decoration:none}.twf u{right:5%;top:5%;width:24%;height:24%;border-radius:50%;background:#e8281c;box-shadow:0 0 5px #f33}.twf s{left:10%;bottom:6%;font-size:clamp(5px,1.5vh,9px);color:#d86a00}'
  + '.twf.vis{background:radial-gradient(circle at 35% 28%,#fff6e4,#ffc27e 56%,#d98b3c);border-color:#8a4a14;box-shadow:0 0 6px #ff9a3a}.twf.cur{border-color:#fff;outline:2px solid #5cd0ff;background:radial-gradient(circle at 35% 28%,#fff,#dff4ff 56%,#7fc4e8)}.twf.dest{animation:twblink .45s steps(2) infinite}.twf.oor{background:radial-gradient(circle at 35% 28%,#6a6f7c,#464a56 60%,#2c2f38);color:#8a8f9c;border-color:#2a2d36}.twf.oor::after{content:"X";position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-size:2.8vh;color:#ff2a1a;text-shadow:0 0 4px #000}.twf.foe u{display:block}.twf.dmg s{display:block}@keyframes twblink{50%{box-shadow:0 0 12px #ffb04a;filter:brightness(1.25)}}'
  + '#twpf{display:grid;grid-template-columns:repeat(3,1fr);gap:.8vh}#twpf button{border-radius:5px;height:6.4vh;min-height:26px;font-size:clamp(6px,1.7vh,10px)}#twpf button.stop{background:radial-gradient(circle at 35% 28%,#ff9d8d,#d12a1a 60%,#880f06);color:#fff;border-color:#4a0a05}#twpf button:disabled{opacity:.35}';
var twpEl = null, twpAt = -1e9, twpSig = '', twpShown = false;      // (var: show() and setPause() look at twpEl before this line has run)
function twPanelBuild() {
  if (twpEl) return twpEl; const st = document.createElement('style'); st.id = 'twpCss'; st.textContent = TW_CSS; document.head.appendChild(st);
  const p = twpEl = document.createElement('div'); p.id = 'twp'; p.setAttribute('role', 'dialog'); p.setAttribute('aria-label', 'Elevator panel');
  let g = ''; for (let f = TW_N; f >= 1; f--) g += '<button class="twf" data-f="' + f + '" aria-label="Floor ' + f + '"><b>' + f + '</b><i></i><u></u><s>!</s></button>';
  p.innerHTML = '<div id="twpq"><button data-q="top" aria-label="Top floor"><span>TOP</span><b>50</b></button><button data-q="lobby" aria-label="Lobby"><span>LOBBY</span><b>1</b></button><button data-q="foe" aria-label="The enemy\'s floor"><span>ENEMY</span><b>-</b></button><button data-q="last" aria-label="The floor you came from"><span>LAST</span><b>-</b></button></div><div id="twpg">' + g + '</div><div id="twpf"><button data-a="open" aria-label="Open the doors">OPEN</button><button data-a="close" aria-label="Close the doors">CLOSE</button><button data-a="stop" class="stop" aria-label="Emergency stop">STOP</button></div>';
  p.addEventListener('pointerdown', e => e.stopPropagation());
  p.addEventListener('click', e => {
    const b = e.target.closest('button'); if (!b || b.disabled || !twOn()) return; e.stopPropagation(); const T = vs.tw, c = T.cab, now = pnow(); if (!c) return;
    if (b.dataset.f) twCabPick(+b.dataset.f, now); else if (b.dataset.q === 'top') twCabPick(TW_N, now); else if (b.dataset.q === 'lobby') twCabPick(1, now); else if (b.dataset.q === 'foe') twCabPick(T.fFoe, now); else if (b.dataset.q === 'last') twCabPick(T.prevF, now);
    else if (b.dataset.a === 'open') { if (c.ph === 'park') { c.closeAt = 0; twLiftOpen(now); } } else if (b.dataset.a === 'close') { if (c.ph === 'park') { c.closeAt = 0; twLiftShut(now); } } else if (b.dataset.a === 'stop') twCabStop(now);
    twpAt = -1e9;
  });
  document.body.appendChild(p); return p;
}
function twPanelSync(now) {      // shows / hides the panel and keeps its buttons true (the floor you are on, the one you ride to or have pressed, floors you have seen, the enemy's floor, damage, dead buttons)
  const T = typeof vs !== 'undefined' && vs && vs.tw, c = T && T.cab, show = !!c && twOn() && state === 'play' && !paused && !ryUlNoHud();
  if (!show) { if (twpEl && twpShown) { twpEl.classList.remove('on'); twpShown = false; } return; }
  const p = twPanelBuild(); if (!twpShown) { twpShown = true; for (let f = 1; f <= TW_N; f++) twFloorData(f); p.classList.add('on'); p.classList.toggle('r', !!$('pad') && $('pad').classList.contains('lh')); twpSig = ''; const g = p.querySelector('#twpg'), cur = Math.round(c.curF); g.scrollTop = Math.max(0, ((TW_N - cur) / 5 - 2) * (g.scrollHeight / 10)); }
  if (now - twpAt < 120) return; twpAt = now; const cur = Math.round(c.curF), moving = c.ph === 'ride', pf = c.pend ? c.pend.f : 0, foeUp = T.away && !c.out && !c.inFoe && T.fFoe !== cur;
  const sig = [c.ph, cur, c.dest, pf, c.open ? 1 : 0, c.broken ? 1 : 0, T.fFoe, T.away ? 1 : 0, c.out ? 1 : 0, c.inFoe ? 1 : 0, T.prevF, Object.keys(T.seen).length, TW_N].join(',') + '|' + Object.keys(T.fl).map(f => { const F = T.fl[f]; return (F.holes.length ? 1 : 0) + (F.lights.some(l => !l.ok) ? 2 : 0) + (F.walls.some(w => w.broken) ? 4 : 0) + (F.outer.some(o => o.broken) ? 8 : 0) + F.doors.reduce((n, dr) => n + dr.st * 16, 0); }).join('.');
  if (sig === twpSig) return; twpSig = sig;
  for (const b of p.querySelectorAll('.twf')) {
    const f = +b.dataset.f, F = T.fl[f]; b.querySelector('i').textContent = TW_ABBR[F.th] || F.th; const oor = !twElevOk(f), dmg = F.holes.length > 0 || F.lights.some(l => !l.ok) || F.walls.some(w => w.broken) || F.outer.some(o => o.broken) || F.doors.some(dr => dr.st > 0);
    b.className = 'twf' + (T.seen[f] ? ' vis' : '') + (f === cur ? ' cur' : '') + ((moving && f === c.dest) || (pf && f === pf) ? ' dest' : '') + (oor ? ' oor' : '') + (T.away && f === T.fFoe && !c.inFoe && !c.out ? ' foe' : '') + (dmg ? ' dmg' : ''); b.disabled = moving || f === cur || oor;
  }
  const q = n => p.querySelector('[data-q="' + n + '"]'), setQ = (n, f, ok) => { const b = q(n); b.querySelector('b').textContent = f > 0 ? f : '-'; b.disabled = moving || !(f > 0) || f === cur || !twElevOk(f) || !ok; };
  setQ('top', TW_N, true); setQ('lobby', 1, true); setQ('foe', foeUp ? T.fFoe : 0, foeUp); setQ('last', T.prevF > 0 && T.prevF !== cur ? T.prevF : 0, true);
  p.querySelector('[data-a="open"]').disabled = c.ph !== 'park' || c.open || c.broken; p.querySelector('[data-a="close"]').disabled = c.ph !== 'park' || !c.open || c.broken; p.querySelector('[data-a="stop"]').disabled = !(c.ph === 'ride' && now >= c.at);
}

window.__tw = () => twOn() ? (() => { const T = vs.tw, F = twFloorData(T.fMe); return { fMe: T.fMe, fFoe: T.fFoe, away: T.away, W: F.W, nr: F.nr, th: F.th, walls: F.walls.map(w => [w.x, Math.round(w.hp), w.broken]), holes: F.holes.map(h => [h.x, h.r]), objs: F.objs.length, wrecks: F.wrecks.length, wx: Math.round(wx), dx: dummy ? Math.round(dummy.x - wx) : null, via: T.via, arrive: Math.round(T.arriveAt - pnow()), doors: F.doors.map(d => [d.x, d.k]), pick: F.pick.length, slide: !!T.slide, ff: !!T.ff }; })() : null;      // test hook
window.__twF = f => twOn() ? twFloorData(f) : null;
window.__twCab = () => twOn() && vs.tw.cab ? (() => { const T = vs.tw, c = T.cab; return { ph: c.ph, f0: c.f, dest: c.dest, cur: +c.curF.toFixed(2), foe: c.inFoe ? 'in' : c.out ? 'out' : T.away ? 'away' : 'none', door: +c.door.toFixed(2), dur: c.dur, bangs: c.bangs, broke: c.broken, closed: c.door < 0.05, open: c.open, pend: c.pend ? c.pend.f : 0 }; })() : null;      // test hook
window.__twLift = () => twOn() ? (() => { const L = vs.tw.lift; return { f: L.f, cur: +L.curF.toFixed(2), ph: L.ph, dest: L.dest, me: L.me, inFoe: L.inFoe, out: L.out, broken: L.broken, open: L.open, door: +L.door.toFixed(2), pend: L.pend ? L.pend.f : 0, job: L.job ? L.job.st : '', why: L.why || '' }; })() : null;      // test hook
