// ---------------------------------------------------------------- v1.173 THE SKYSCRAPER (this file is spliced into template.html by build_html.py, right after ryu.js; how it LOOKS is in towerart.js, v1.174)
// A second MAP for FREE PLAY and VERSUS (the MAP button of the fighter and versus screens): the inside of a 50-floor skyscraper, ONE FLOOR AT A TIME. The match starts on floor 50 (the penthouse). Every floor is a long corridor of 2 to 4 rooms that is made at random the first time you see it
// (twFloorData: its size, its colours, its furniture, its lights, its windows with the city outside: the higher the floor the higher the view) and it STAYS as the fights leave it (broken walls, wrecks, holes: they are kept for the whole match, `vs.tw`; a new match starts a fresh building).
// WHAT BREAKS: furniture (desks, chairs, tables, computers, lamps, glass, vending machines, safes, pillars, server racks, crates, plants) breaks when a blow lands near it, when a body is thrown into it (the heavy ones hurt) or when you attack it; the INNER WALLS between the rooms are solid until they break;
// the OUTER WALLS are glass: a fighter thrown through one falls to the street; gas tanks and fire extinguishers EXPLODE (an area blast that can open the floor, and set off the next one). A SLAM (a hit that puts a fighter on the floor from above) or a heavy hit breaks the FLOOR under the victim, 1 floor or more by how hard it was (twSlamN):
// he falls through the crater, 3% of his health a floor (at most 30%, never a K.O.). A launch that is high enough breaks the CEILING and sends the victim up a floor. The crater stays: anybody who walks into it falls too. Stairs (1 floor) and elevators (5 floors) are in the rooms: stand at the door and press JUMP (up) or CROUCH (down).
// The fighters are on ONE floor at a time (the camera follows you): a fighter who is on another floor is AWAY (twAway: his place is far off, he is held still); he comes after you: through the crater if you fell, by the stairs or the elevator if not (twFoeArrive). The enemy also stays away from the edge of a crater.
// The module is hooked in at: drawBackdrop (twBackdrop), the pedestrians (off), tick (twTick, twOverlay), startMatch / beginRound (twInit, twRound), the MAP buttons, and Ryu's ULTIMATE (twSlam, twSweep).
const TW_N = 50, TW_CEIL = 88, TW_BODY = 12, TW_CABW = 220;      // (floors, the height of a room (px), half the width of a body, for the walls, and the width of the elevator cab)
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
  for (let i = 0; i < nr; i++) F.doors.push({ x: Math.round(xs[i] + 70 + R() * (xs[i + 1] - xs[i] - 140)), k: i % 2 ? 'elev' : 'stairs', room: i, hp: 70, st: 0 });      // (every room has a way up and down: stairs in the even rooms, an elevator in the odd ones)
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
  vs.map = 'tower'; vs.tw = { seed: (Math.random() * 1e9) | 0, fl: {}, fMe: TW_N, fFoe: TW_N, q: [], px: 0, dx: 0, pHp: 0, dHp: 0, dHit: -9999, dDown: 0, pDown: 0, swingAt: 0, fade: null, banner: null, away: false, awayX: 0, arrX: 0, via: 'stairs', lastDoor: 0, hint: 0, on: false, expl: [], doorAt: -1, flashes: [], haze: null, cab: null, seen: {}, cf: TW_N, prevF: 0, oorAt: -9999, cabF: { f: 0, xs: [0, TW_CABW], W: TW_CABW, nr: 1, th: 'CAB', walls: [], objs: [], wrecks: [], holes: [], lights: [], doors: [], pick: [], decals: [], outer: [{ hp: 1e9, mx: 1e9, broken: false, at: 0 }, { hp: 1e9, mx: 1e9, broken: false, at: 0 }] } };
}
function twRound(now) {
  const T = vs.tw, d = dummy; T.fMe = T.fFoe = TW_N; T.q.length = 0; T.away = false; T.fade = null; T.haze = null; T.flashes = []; T.cab = null; T.seen[TW_N] = 1; T.cf = TW_N; T.prevF = 0; T.expl.length = 0; const F = twFloorData(TW_N), gap = d ? d.x - wx : 60; wx = twFreeX(F, Math.round((F.xs[1] + F.xs[2]) / 2) - 30, gap); wxv = 0; wvx = 0;
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
function twRoomOf(F, x) { let r = 0; for (let i = 1; i < F.xs.length - 1; i++) if (x >= F.xs[i]) r = i; return r; }
function twPlace(F, x) { x = Math.max(24, Math.min(F.W - 24, x)); for (const w of F.walls) if (!w.broken && Math.abs(x - w.x) < 20) x = w.x + (x >= w.x ? 20 : -20); return x; }
function twFloorSwitch(now, x) {      // you are on another floor now: its place, a fade in from black and the new floor's number
  const T = vs.tw, F = twFloorData(T.fMe); if (T.cf !== T.fMe) { T.prevF = T.cf; T.cf = T.fMe; } T.seen[T.fMe] = 1; twClearWorld(); wx = twPlace(F, x); wxv = 0; wvx = 0; T.px = wx; T.fade = { at: now, ms: 520 }; T.banner = { txt: 'FLOOR ' + T.fMe, at: now }; popups = [];
}
function twPlanArrival(now) {      // the enemy is on another floor: when and how he comes: through the crater when you fell and it reaches your floor, otherwise by the stairs or the elevator (the farther, the longer)
  const T = vs.tw; if (!T.away) return; const dl = Math.abs(T.fFoe - T.fMe);
  if (T.fFoe > T.fMe && T.lastFallX !== null && twDepthAt(T.fFoe, T.lastFallX) >= T.fFoe - T.fMe) { T.via = 'hole'; T.arrX = T.lastFallX; T.arriveAt = now + 1200; }
  else { T.via = 'stairs'; T.arriveAt = now + Math.min(9000, 2600 + 700 * dl); }
}
function twFoeFall(n, now, x, tag) {      // the enemy falls n floors (a slam, a crater): 3% of his health a floor, at most 30%, never a K.O.; he is away on the floor he lands on
  const T = vs.tw, d = dummy; if (!d || d.ko >= 0 || T.away) return; const to = Math.max(1, T.fFoe - n), nn = T.fFoe - to; if (nn < 1) return;
  const dm = Math.round((d.max || DUMMY_HP) * Math.min(0.30, 0.03 * nn)); say((tag || 'FALL') + ' ' + nn + (nn > 1 ? ' FLOORS' : ' FLOOR') + ' -' + dm, d.x, '#ffd34d', 8, now); twHurtFoe(dm, now, true);
  T.fFoe = to; T.away = true; d.twAway = true; T.awayX = x; T.lastFallX = x; d.air = null; d.airH = 0; d.down = 0; d.x = wx + 1e5; d.vx = 0; d.stunUntil = now + 900; twPlanArrival(now);
}
function twMeFall(n, now, x, tag) {      // you fall n floors
  const T = vs.tw, d = dummy, to = Math.max(1, T.fMe - n), nn = T.fMe - to; if (nn < 1) return;
  const dm = Math.max(1, Math.round(PHP * Math.min(0.30, 0.03 * nn))), foeHere = !!d && d.ko < 0 && !T.away;
  T.fMe = to; T.lastFallX = x; twFloorSwitch(now, x); twHurtMe(dm, now, true); say((tag || 'FALL') + ' ' + nn + (nn > 1 ? ' FLOORS' : ' FLOOR') + ' -' + dm, wx, '#ff9a5a', 8, now); snd('twbreak', 7); puff(wx, 8); shakeUntil = now + 300; shakeAmp = 4;
  if (foeHere) { T.away = true; d.twAway = true; T.awayX = d.x; } twPlanArrival(now);
}
function twCeiling(who, n, now, x) {      // a launch breaks the ceiling: the victim goes up n floors and the crater stays in the floor above
  const T = vs.tw, f = who === 'foe' ? T.fFoe : T.fMe; if (f >= TW_N) return; n = Math.min(n, TW_N - f); if (n < 1) return;
  for (let i = 1; i <= n; i++) twAddHole(f + i, x, 22, now);
  debBurst(x, 70, 16, ['#8a8a92', '#6d6d75', '#b8b0a0', '#c9b27a'], 140); puff(x, 8); shakeUntil = now + 300; shakeAmp = 5; snd('twbreak', 4); say('CEILING!', x, '#ffd34d', 8, now); hitStop(50);
  twLightsShock(twFloorData(f), x, 100, 60, now); if (T.fMe === f) { twHaze(now, 0.6); twFlash(x, now, [255, 240, 210], 36); }
  if (who === 'foe') { const d = dummy; T.fFoe = f + n; T.away = true; d.twAway = true; T.awayX = x + 38; T.lastFallX = x; twPlanArrival(now); }
  else { const d = dummy, foeHere = !!d && d.ko < 0 && !T.away; T.fMe = f + n; T.lastFallX = x; twFloorSwitch(now, x + 38); snd('twbreak', 7); if (foeHere) { T.away = true; d.twAway = true; T.awayX = d.x; } T.lastFallX = null; twPlanArrival(now); }
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
function twTravel(dir, door, now) {      // the stairs (1 floor) or the elevator (5): you are on another floor, at the same kind of door
  const T = vs.tw, f = T.fMe, n = door.k === 'elev' ? 5 : 1, to = Math.max(1, Math.min(TW_N, f + dir * n)); if (to === f) { say(dir > 0 ? 'TOP FLOOR' : 'GROUND FLOOR', wx, '#9a9aa8', 8, now); return; }
  const d = dummy, foeHere = !!d && d.ko < 0 && !T.away; T.fMe = to; const F = twFloorData(to); let best = F.doors[0]; for (const dr of F.doors) if (dr.k === door.k && Math.abs(dr.room - door.room) < Math.abs(best.room - door.room) || (best.k !== door.k && dr.k === door.k)) best = dr;
  twFloorSwitch(now, best.x); snd('twbreak', 6); T.lastFallX = null; if (foeHere) { T.away = true; d.twAway = true; T.awayX = d.x; } twPlanArrival(now);
}
function twFoeHere(now) {      // (PUT ENEMY and RESET of free play): the enemy is where you are (in the cab too)
  if (!twOn()) return; const T = vs.tw, d = dummy; T.away = false; T.fFoe = T.fMe; if (d) d.twAway = false; T.q.length = 0; if (T.cab && d && d.ko < 0) T.cab.foe = 'in';
}
function twFoeArrive(now) {      // the enemy comes: out of the crater above you, or out of the door of your room
  const T = vs.tw, d = dummy, F = twFloorData(T.fMe); if (!d || d.ko >= 0) { T.away = false; return; }
  let x, hole = T.via === 'hole'; if (hole) x = T.arrX; else { const dr = F.doors[Math.min(F.doors.length - 1, twRoomOf(F, wx))]; x = dr.x; if (dr.st !== 2) dr.force = now + 1000; }      // (the door he comes out of swings open)
  x = twPlace(F, x); if (Math.abs(x - wx) < 26) x = twPlace(F, wx + (x >= wx ? 38 : -38));
  T.away = false; T.fFoe = T.fMe; d.twAway = false; d.x = x; d.vx = 0; d.down = 0; d.stunUntil = now + 350; d.ai = 'rest'; d.aiAt = now; d.restFor = 350;
  if (hole) { d.air = airMake(now, 90, 0, 520, 'bounce'); puff(x, 8); debBurst(x, 40, 10, ['#8a8a92', '#b8b0a0'], 110); snd('twbreak', 7); } else { puff(x, 5); snd('twbreak', 6); }
  say('ENEMY!', x, '#ffd34d', 8, now); T.dHp = d.hp; T.dx = d.x;
}
function twAwayStep(now) {      // every frame the enemy is on another floor: he is held far off, still, until he comes (or until you are on his floor: then he is where he fell)
  const T = vs.tw, d = dummy; if (!d || d.ko >= 0) { T.away = false; return; }
  d.x = wx + 1e5; d.vx = 0; d.stunUntil = now + 900; d.ai = 'rest'; d.aiAt = now; d.restFor = 900; d.air = null; d.airH = 0;
  if (T.fFoe === T.fMe) { const F = twFloorData(T.fMe); T.away = false; d.twAway = false; d.x = twPlace(F, T.awayX); d.stunUntil = now + 300; T.dx = d.x; return; }
  if (now >= T.arriveAt) twFoeArrive(now);
}
function twFallOut(who, now, side) {      // a fighter went through the broken glass: down to the street (the lobby); the other follows him a moment later
  const T = vs.tw, f = who === 'foe' ? T.fFoe : T.fMe; if (f <= 1) return; const lobby = twFloorData(1), x = side ? lobby.W - 20 : 20;
  if (who === 'foe') { twFoeFall(f - 1, now, x); T.q.push({ at: now + 1300, k: 'followMe', x }); }
  else { twMeFall(f - 1, now, x); const d = dummy; if (d && d.ko < 0 && T.away) { T.fFoe = f; T.arrX = x; T.via = 'hole'; T.arriveAt = now + 1500; } }
}
function twRunQ(e, now) {
  const T = vs.tw; if (e.k === 'followMe' && T.fMe > 1 && vs.ph === 'fight') { twFloorData(1); T.fMe = 1; twFloorSwitch(now, e.x); snd('twbreak', 7); puff(wx, 6); say('DOWN TO THE STREET', wx, '#9fd8ff', 8, now); T.lastFallX = null; twPlanArrival(now); }
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
  if (T.cab) twCabTick(now, dt); else if (T.away) twAwayStep(now);
  if (vs.ph !== 'fight') { T.px = wx; T.dx = d.x; return; }
  if (Math.abs(wx - T.px) > 60) T.px = wx; if (Math.abs(d.x - T.dx) > 60) T.dx = d.x;      // (a body that was put somewhere (PUT ENEMY, a floor change, the enemy coming back) is where it is: no wall between)
  if (T.cab) { twBodies(now); T.px = wx; T.dx = d.x; return; }      // (in the cab there is only the cab: its walls, you and him)
  twWatch(now);
  let F = twFloorData(T.fMe); const grounded = gojoLift < 5 && !(gAir && gAirH > 5);
  const near = grounded ? F.doors.find(dr => Math.abs(dr.x - wx) < 22 && dr.st !== 2) : null, dn = crReq || (stickDown && !T.sdPrev); T.sdPrev = stickDown;      // (the stairs and the elevator: JUMP goes up, CROUCH goes down; at an elevator both open the panel of the cab)
  if (near) { if (T.doorAt < 0) T.doorAt = now; } else T.doorAt = -1;
  const door = near && now - T.doorAt >= 350 ? near : null;      // (only after standing at the door for a third of a second: a jump on the way past is a jump)
  if (door) { if (door.k === 'elev') { if (jumpReq || dn) { jumpReq = false; crReq = false; twCabEnter(F, door, now); } } else if (jumpReq) { jumpReq = false; twTravel(1, door, now); } else if (dn) { crReq = false; twTravel(-1, door, now); } if (T.cab) { T.px = wx; T.dx = d.x; return; } F = twFloorData(T.fMe); }
  if (grounded && vs.ph === 'fight') { const h = twHoleAt(F, wx); if (h && h.shaft) { twShaftFall('me', now); F = twFloorData(T.fMe); } else { const n = twDepthAt(T.fMe, wx); if (n > 0) { twMeFall(n, now, wx); F = twFloorData(T.fMe); } } }      // (you walked into a crater or an open shaft)
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
function twOverlay(now) {      // over the picture: the fade after a fall or a climb, the floor you are on (and where the enemy is when he is not here), and the big number when you arrive
  if (!twOn() || state !== 'play') { twPanelSync(now); return; } const T = vs.tw;
  if (T.fade) { const a = 1 - (now - T.fade.at) / T.fade.ms; if (a <= 0) T.fade = null; else { ctx.fillStyle = 'rgba(0,0,0,' + a.toFixed(2) + ')'; ctx.fillRect(0, 0, VW, VH); } }
  if (ryUlNoHud()) { twPanelSync(now); return; }
  if (T.prompt && now - T.prompt.at < 80) { const mx = Math.round(VW / 2); if (T.prompt.up) pxt(T.prompt.up, mx, gy + 18, '#9fffd0', 8, 'center'); if (T.prompt.dn) pxt(T.prompt.dn, mx, gy + 27, '#9fd8ff', 8, 'center'); }
  const c = T.cab, fl = c ? Math.round(c.curF) : T.fMe, hx = Math.round(VW / 2) + (c ? 20 : 0), ha = c ? 'left' : 'center'; pxt('FLOOR ' + fl, hx, 44, '#cfe8ff', 8, ha); if (T.away) pxt(c && c.foe === 'out' ? 'FOE AT DOORS' : 'FOE ' + T.fFoe + (T.fFoe > fl ? ' UP' : ' DOWN'), hx, c ? 62 : 53, '#ffb27a', 8, ha);      // (in the cab the lines start right of the middle of the screen, clear of the panel and of your head, and the enemy's line sits lower, clear of his grade label)
  twPanelSync(now);
  if (T.banner && now - T.banner.at < 1300) { const u = (now - T.banner.at) / 1300; ctx.globalAlpha = u > 0.6 ? Math.max(0, (1 - u) / 0.4) : 1; pxt(T.banner.txt, Math.round(VW / 2), Math.round(VH * 0.46), '#ffffff', 16, 'center'); ctx.globalAlpha = 1; }
}
// ---------------------------------------------------------------- v1.175 THE ELEVATOR: doors that break, the cab you ride in, its panel
// Stand at an elevator door (350 ms) and press JUMP or CROUCH: the doors shut behind you and the view goes INSIDE THE CAB (T.cab: a small room, TW_CABW px wide, with a wall at each end; you walk, jump, block and attack in it as anywhere). The PANEL (twPanelBuild: a scrolling
// grid of the 50 floors + TOP / LOBBY / ENEMY'S FLOOR / LAST FLOOR + OPEN / CLOSE / STOP) is over the picture; tapping a floor starts the ride at once: it takes 0.1 s a floor (1 s at least, 4 s at most), the display counts, the cab shakes, the city and the sky outside the window change with the height.
// The enemy is left outside the doors: if he was on your floor he runs to the doors and BANGS, and about 8 s after the doors shut he BREAKS IN (the fight goes on inside the cab, also during the ride); if he was on another floor he comes later as before (and if he arrives while you are choosing he bangs too). Time never stops.
// DOORS BREAK (twDoorHit; d.hp 70, d.st 0 whole / 1 OUT OF ORDER (hp 40: its button is dead) / 2 torn out: the shaft is open and whoever walks into it falls to the lobby, 3% a floor, at most 30%).
const twElevOk = f => { const F = vs.tw.fl[f]; return !F || F.doors.some(dr => dr.k === 'elev' && dr.st === 0); };      // (an elevator works on a floor while one of its doors is whole; a floor nobody has seen is whole)
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
function twCabEnter(F, door, now) {      // you step into an elevator: the doors close behind you, the view is inside the cab, the panel opens, the enemy (if he is here) is left outside
  const T = vs.tw, d = dummy; if (T.cab || vs.ph !== 'fight') return;
  if (door.st === 1) { if (now - T.oorAt > 1200) { T.oorAt = now; say('OUT OF ORDER', door.x, '#ff6a5a', 8, now); snd('twlift', 6); } return; }
  const foeHere = !!d && d.ko < 0 && !T.away && T.fFoe === T.fMe, foeAway = !!d && d.ko < 0 && T.away;
  const c = T.cab = { f0: T.fMe, dk: door, ph: 'in', at: now, from: T.fMe, curF: T.fMe, dest: T.fMe, dur: 1000, door: 1, closeAt: now + 1100, closed: false, foe: foeHere ? 'out' : foeAway ? 'away' : 'none', foeX: foeHere ? d.x : T.awayX, bangs: 0, nextBang: 0, bangAt: 0, breakAt: 0, hit: -9999, broke: false, brokeAt: 0, sStart: false, rumAt: 0, popped: false, outAt: 0, stopAt: 0, vel: 0, long: false };
  if (foeHere) { T.away = true; d.twAway = true; T.awayX = d.x; T.lastFallX = null; d.air = null; d.airH = 0; d.down = 0; d.vx = 0; c.bangAt = c.closeAt + 450 + Math.min(2500, Math.abs(d.x - door.x) * 9); c.breakAt = Math.max(c.closeAt + 8000, c.bangAt + 2500); }
  T.swingAt = 0; T.doorAt = -1; twClearWorld(); wx = TW_CABW / 2; wxv = 0; wvx = 0; T.px = wx; T.dx = d ? d.x : 0; T.fade = { at: now, ms: 320 }; T.banner = null; popups = [];
}
function twCabLeave(now, quiet) {      // OPEN: back out onto the floor you came from, at the door you came in by (the enemy, if he was outside or came in, is right there)
  const T = vs.tw, c = T.cab, d = dummy; if (!c) return; T.cab = null; T.fMe = c.f0; const F = twFloorData(c.f0); twFloorSwitch(now, c.dk.x); T.banner = null; c.dk.force = now + 900; T.doorAt = now; T.sdPrev = !!stickDown;      // (no second entry at once) if (!quiet) snd('twlift', 1);
  if (d && d.ko < 0 && (c.foe === 'out' || c.foe === 'in' || c.foe === 'left')) { T.away = false; T.fFoe = c.f0; d.twAway = false; d.x = twPlace(F, c.dk.x + (c.foeX >= c.dk.x ? 46 : -46)); if (Math.abs(d.x - wx) < 26) d.x = twPlace(F, wx + 40); d.vx = 0; d.air = null; d.down = 0; d.stunUntil = now + 300; d.ai = 'rest'; d.aiAt = now; d.restFor = 300; T.dHp = d.hp; T.dx = d.x; if (!quiet && c.foe === 'out') say('ENEMY!', d.x, '#ffd34d', 8, now); }
}
function twCabPick(f, now) {      // a floor button: the ride starts at once (the doors shut first if they are still open)
  const T = vs.tw, c = T && T.cab, d = dummy; if (!c || (c.ph !== 'in' && c.ph !== 'stop')) return false; f = Math.round(f);
  if (!(f >= 1 && f <= TW_N) || f === Math.round(c.curF)) return false;
  if (!twElevOk(f)) { say('OUT OF ORDER', wx, '#ff6a5a', 8, now); snd('twlift', 6); return false; }
  twFloorData(f); const dist = Math.abs(f - c.curF); c.from = c.curF; c.dest = f; c.dur = Math.max(1000, Math.min(4000, Math.round(dist * 100))); c.at = c.ph === 'in' && c.door > 0.05 ? now + 380 : now; c.ph = 'ride'; c.sStart = false; c.popped = false; c.long = c.dur >= 2800; c.rumAt = 0;
  if (c.foe === 'out') { c.foe = 'left'; T.fFoe = c.f0; T.away = true; if (d) d.twAway = true; T.awayX = c.foeX; }      // (the cab goes: he is left behind on the floor)
  T.fMe = f; T.lastFallX = null;
  if (c.foe === 'in') { T.fFoe = f; T.away = false; } else if (T.away) { twPlanArrival(now); T.arriveAt = Math.max(T.arriveAt, c.at + c.dur + 700); }      // (he follows later, never before the cab stops)
  snd('twlift', 9); return true;
}
function twCabStop(now) { const T = vs.tw, c = T && T.cab; if (!c || c.ph !== 'ride' || now < c.at) return; c.ph = 'stop'; c.stopAt = now; c.vel = 0; snd('twlift', 10); shakeUntil = Math.max(shakeUntil, now + 350); shakeAmp = Math.max(shakeAmp, 4); say('EMERGENCY STOP', wx, '#ff6a5a', 8, now); }      // (the cab hangs between floors until you press a floor again)
function twCabClose(now) { const T = vs.tw, c = T && T.cab; if (c && c.ph === 'in' && !c.closed) c.closeAt = Math.min(c.closeAt, now); }
function twCabBang(now) { const c = vs.tw.cab; c.bangs++; c.hit = now; snd('twlift', 7); shakeUntil = Math.max(shakeUntil, now + 100); shakeAmp = Math.max(shakeAmp, 1.5); debBurst(TW_CABW / 2, 30, 3, ['#9aa4b8', '#6d7488'], 60); if (c.bangs === 1) say('HE IS AT THE DOORS!', TW_CABW / 2, '#ff8a3a', 8, now); }
function twCabBreakIn(now) {      // about 8 s of banging: the doors give way and he is in the cab
  const T = vs.tw, c = T.cab, d = dummy; if (!d || d.ko >= 0) return; c.foe = 'in'; c.broke = true; c.brokeAt = now; T.away = false; T.fFoe = T.fMe; d.twAway = false;
  d.x = TW_CABW / 2 + (wx < TW_CABW / 2 ? 26 : -26); d.vx = 0; d.air = null; d.down = 0; d.stunUntil = now + 450; d.ai = 'rest'; d.aiAt = now; d.restFor = 450; T.dHp = d.hp; T.dx = d.x;
  debBurst(TW_CABW / 2, 34, 22, ['#c9d0de', '#9aa4b8', '#6d7488', '#2a2f3d'], 170); spark(TW_CABW / 2, gy - 34, 16, ['#ffffff', '#ffd34d', '#7fd0ff'], true, 0); puff(TW_CABW / 2, 8); shockAt(TW_CABW / 2, 220, 90, 0.7); flash(now, 120, 0.2);
  shakeUntil = Math.max(shakeUntil, now + 380); shakeAmp = Math.max(shakeAmp, 5); say('HE BREAKS IN!', TW_CABW / 2, '#ff8a3a', 8, now); snd('twlift', 8); hitStop(60);
}
function twCabArrive(now) { const T = vs.tw, c = T.cab; c.ph = 'out'; c.curF = c.dest; c.vel = 0; c.outAt = now + 650; snd('twbreak', 6); snd('twlift', 3); shakeUntil = Math.max(shakeUntil, now + 200); shakeAmp = Math.max(shakeAmp, 2); }      // (a ding, the doors open on the new floor)
function twCabExit(now) {      // you step out at an elevator of the new floor (the nearest room to the one you left); the enemy who rode with you steps out too, and one who has been waiting is there
  const T = vs.tw, c = T.cab, d = dummy, to = c.dest; T.cab = null; T.fMe = to; const F = twFloorData(to), ds = F.doors.filter(dr => dr.k === 'elev' && dr.st === 0);
  let best = ds[0] || F.doors.find(dr => dr.k === 'elev') || F.doors[0]; for (const dr of ds) if (Math.abs(dr.room - c.dk.room) < Math.abs(best.room - c.dk.room)) best = dr;
  twFloorSwitch(now, best.x); T.lastFallX = null; best.force = now + 1000; T.doorAt = now; T.sdPrev = !!stickDown;
  if (c.foe === 'in' && d && d.ko < 0) { T.away = false; d.twAway = false; T.fFoe = to; d.x = twPlace(F, best.x + 46); if (Math.abs(d.x - wx) < 26) d.x = twPlace(F, wx - 40); d.vx = 0; d.stunUntil = now + 450; d.ai = 'rest'; d.aiAt = now; d.restFor = 450; T.dHp = d.hp; T.dx = d.x; }
  else if (T.away && d && d.ko < 0 && now >= T.arriveAt) twFoeArrive(now);      // (he was faster than the ride: he is waiting)
}
function twCabTick(now, dt) {      // every frame in the cab: the doors, the enemy outside (he bangs, then breaks in), the ride
  const T = vs.tw, c = T.cab, d = dummy; if (vs.ph !== 'fight') { twCabLeave(now, true); return; }
  if (!d || d.ko >= 0) c.foe = 'none';
  const open = (c.ph === 'in' && now < c.closeAt) || c.ph === 'out' ? 1 : 0; c.door += Math.max(-dt / 0.45, Math.min(dt / 0.45, open - c.door));
  if (c.ph === 'in' && !c.closed && now >= c.closeAt) { c.closed = true; snd('twlift', 0); }
  if (c.foe === 'out' || c.foe === 'away' || c.foe === 'left') { d.x = wx + 1e5; d.vx = 0; d.stunUntil = now + 900; d.ai = 'rest'; d.aiAt = now; d.restFor = 900; d.air = null; d.airH = 0; }      // (outside: held far off, still)
  if (c.foe === 'away' && c.ph === 'in' && now >= T.arriveAt) { c.foe = 'out'; T.fFoe = c.f0; c.foeX = c.dk.x + 40; c.bangAt = now + 500; c.breakAt = now + 7000; }      // (he arrived while you were choosing: he is at the doors)
  if (c.foe === 'out' && c.ph === 'in' && c.closed) { if (now >= c.bangAt && now >= c.nextBang) { twCabBang(now); c.nextBang = now + 700; } if (now >= c.breakAt) twCabBreakIn(now); }
  if (c.ph === 'ride' && now >= c.at) {
    const u = Math.min(1, (now - c.at) / c.dur), e = u < 0.5 ? 2 * u * u : 1 - Math.pow(2 - 2 * u, 2) / 2, prev = c.curF; c.curF = c.from + (c.dest - c.from) * e; c.vel = Math.abs(c.curF - prev) / Math.max(0.001, dt);
    if (!c.sStart) { c.sStart = true; snd('twlift', 2); c.rumAt = now + 700; } else if (now >= c.rumAt) { snd('twlift', 4); c.rumAt = now + 850; }
    if (c.long && !c.popped && u > 0.15) { c.popped = true; snd('twlift', 5); }
    shakeUntil = Math.max(shakeUntil, now + 80); shakeAmp = Math.max(shakeAmp, c.vel > 6 ? 1.6 : 1);
    if (u >= 1) twCabArrive(now);
  }
  if (c.ph === 'out' && now >= c.outAt) twCabExit(now);
}

// ---- the panel (DOM, over the picture; made the first time a cab opens)
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
  p.innerHTML = '<div id="twpq"><button data-q="top" aria-label="Top floor"><span>TOP</span><b>50</b></button><button data-q="lobby" aria-label="Lobby"><span>LOBBY</span><b>1</b></button><button data-q="foe" aria-label="The enemy\'s floor"><span>ENEMY</span><b>-</b></button><button data-q="last" aria-label="The floor you came from"><span>LAST</span><b>-</b></button></div><div id="twpg">' + g + '</div><div id="twpf"><button data-a="open" aria-label="Open the doors and step out">OPEN</button><button data-a="close" aria-label="Close the doors">CLOSE</button><button data-a="stop" class="stop" aria-label="Emergency stop">STOP</button></div>';
  p.addEventListener('pointerdown', e => e.stopPropagation());
  p.addEventListener('click', e => {
    const b = e.target.closest('button'); if (!b || b.disabled || !twOn()) return; e.stopPropagation(); const T = vs.tw, c = T.cab, now = pnow(); if (!c) return;
    if (b.dataset.f) twCabPick(+b.dataset.f, now); else if (b.dataset.q === 'top') twCabPick(TW_N, now); else if (b.dataset.q === 'lobby') twCabPick(1, now); else if (b.dataset.q === 'foe') twCabPick(T.fFoe, now); else if (b.dataset.q === 'last') twCabPick(T.prevF, now);
    else if (b.dataset.a === 'open') { if (c.ph === 'in') twCabLeave(now); } else if (b.dataset.a === 'close') twCabClose(now); else if (b.dataset.a === 'stop') twCabStop(now);
    twpAt = -1e9;
  });
  document.body.appendChild(p); return p;
}
function twPanelSync(now) {      // shows / hides the panel and keeps its buttons true (the floor you are on, the one you ride to, floors you have seen, the enemy's floor, damage, dead buttons)
  const T = typeof vs !== 'undefined' && vs && vs.tw, c = T && T.cab, show = !!c && twOn() && state === 'play' && !paused && !ryUlNoHud();
  if (!show) { if (twpEl && twpShown) { twpEl.classList.remove('on'); twpShown = false; } return; }
  const p = twPanelBuild(); if (!twpShown) { twpShown = true; for (let f = 1; f <= TW_N; f++) twFloorData(f); p.classList.add('on'); p.classList.toggle('r', !!$('pad') && $('pad').classList.contains('lh')); twpSig = ''; const g = p.querySelector('#twpg'), cur = Math.round(c.curF); g.scrollTop = Math.max(0, ((TW_N - cur) / 5 - 2) * (g.scrollHeight / 10)); }
  if (now - twpAt < 120) return; twpAt = now; const cur = Math.round(c.curF), moving = c.ph === 'ride', foeUp = T.away && c.foe !== 'out' && c.foe !== 'in' && T.fFoe !== cur;
  const sig = [c.ph, cur, c.dest, T.fFoe, T.away ? 1 : 0, c.foe, T.prevF, Object.keys(T.seen).length, TW_N].join(',') + '|' + Object.keys(T.fl).map(f => { const F = T.fl[f]; return (F.holes.length ? 1 : 0) + (F.lights.some(l => !l.ok) ? 2 : 0) + (F.walls.some(w => w.broken) ? 4 : 0) + (F.outer.some(o => o.broken) ? 8 : 0) + F.doors.reduce((n, dr) => n + dr.st * 16, 0); }).join('.');
  if (sig === twpSig) return; twpSig = sig;
  for (const b of p.querySelectorAll('.twf')) {
    const f = +b.dataset.f, F = T.fl[f]; b.querySelector('i').textContent = TW_ABBR[F.th] || F.th; const oor = !twElevOk(f), dmg = F.holes.length > 0 || F.lights.some(l => !l.ok) || F.walls.some(w => w.broken) || F.outer.some(o => o.broken) || F.doors.some(dr => dr.st > 0);
    b.className = 'twf' + (T.seen[f] ? ' vis' : '') + (f === cur ? ' cur' : '') + (moving && f === c.dest ? ' dest' : '') + (oor ? ' oor' : '') + (T.away && f === T.fFoe && c.foe !== 'in' ? ' foe' : '') + (dmg ? ' dmg' : ''); b.disabled = moving || f === cur || oor;
  }
  const q = n => p.querySelector('[data-q="' + n + '"]'), setQ = (n, f, ok) => { const b = q(n); b.querySelector('b').textContent = f > 0 ? f : '-'; b.disabled = moving || !(f > 0) || f === cur || !twElevOk(f) || !ok; };
  setQ('top', TW_N, true); setQ('lobby', 1, true); setQ('foe', foeUp ? T.fFoe : 0, foeUp); setQ('last', T.prevF > 0 && T.prevF !== cur ? T.prevF : 0, true);
  p.querySelector('[data-a="open"]').disabled = c.ph !== 'in'; p.querySelector('[data-a="close"]').disabled = c.ph !== 'in' || c.closed; p.querySelector('[data-a="stop"]').disabled = !(c.ph === 'ride' && now >= c.at);
}

window.__tw = () => twOn() ? (() => { const T = vs.tw, F = twFloorData(T.fMe); return { fMe: T.fMe, fFoe: T.fFoe, away: T.away, W: F.W, nr: F.nr, th: F.th, walls: F.walls.map(w => [w.x, Math.round(w.hp), w.broken]), holes: F.holes.map(h => [h.x, h.r]), objs: F.objs.length, wrecks: F.wrecks.length, wx: Math.round(wx), dx: dummy ? Math.round(dummy.x - wx) : null, via: T.via, arrive: Math.round(T.arriveAt - pnow()), doors: F.doors.map(d => [d.x, d.k]), pick: F.pick.length, fade: !!T.fade }; })() : null;      // test hook
window.__twF = f => twOn() ? twFloorData(f) : null;
window.__twCab = () => twOn() && vs.tw.cab ? (() => { const c = vs.tw.cab; return { ph: c.ph, f0: c.f0, dest: c.dest, cur: +c.curF.toFixed(2), foe: c.foe, door: +c.door.toFixed(2), dur: c.dur, bangs: c.bangs, broke: c.broke, closed: c.closed }; })() : null;      // test hook
