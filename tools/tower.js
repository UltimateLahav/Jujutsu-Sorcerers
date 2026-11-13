// ---------------------------------------------------------------- v1.173 THE SKYSCRAPER (this file is spliced into template.html by build_html.py, right after ryu.js; how it LOOKS is in towerart.js, v1.174)
// A second MAP for FREE PLAY and VERSUS (the MAP button of the fighter and versus screens): the inside of a 50-floor skyscraper, ONE FLOOR AT A TIME. The match starts on floor 50 (the penthouse). Every floor is a long corridor of 2 to 4 rooms that is made at random the first time you see it
// (twFloorData: its size, its colours, its furniture, its lights, its windows with the city outside: the higher the floor the higher the view) and it STAYS as the fights leave it (broken walls, wrecks, holes: they are kept for the whole match, `vs.tw`; a new match starts a fresh building).
// WHAT BREAKS: furniture (desks, chairs, tables, computers, lamps, glass, vending machines, safes, pillars, server racks, crates, plants) breaks when a blow lands near it, when a body is thrown into it (the heavy ones hurt) or when you attack it; the INNER WALLS between the rooms are solid until they break;
// the OUTER WALLS are glass: a fighter thrown through one falls to the street; gas tanks and fire extinguishers EXPLODE (an area blast that can open the floor, and set off the next one). A SLAM (a hit that puts a fighter on the floor from above) or a heavy hit breaks the FLOOR under the victim, 1 floor or more by how hard it was (twSlamN):
// he falls through the crater, 3% of his health a floor (at most 30%, never a K.O.). A launch that is high enough breaks the CEILING and sends the victim up a floor. The crater stays: anybody who walks into it falls too. Stairs (1 floor) and elevators (5 floors) are in the rooms: stand at the door and press JUMP (up) or CROUCH (down).
// The fighters are on ONE floor at a time (the camera follows you): a fighter who is on another floor is AWAY (twAway: his place is far off, he is held still); he comes after you: through the crater if you fell, by the stairs or the elevator if not (twFoeArrive). The enemy also stays away from the edge of a crater.
// The module is hooked in at: drawBackdrop (twBackdrop), the pedestrians (off), tick (twTick, twOverlay), startMatch / beginRound (twInit, twRound), the MAP buttons, and Ryu's ULTIMATE (twSlam, twSweep).
const TW_N = 50, TW_CEIL = 88, TW_BODY = 12;      // (floors, the height of a room (px) and half the width of a body, for the walls)
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
  for (let i = 0; i < nr; i++) F.doors.push({ x: Math.round(xs[i] + 70 + R() * (xs[i + 1] - xs[i] - 140)), k: i % 2 ? 'elev' : 'stairs', room: i });      // (every room has a way up and down: stairs in the even rooms, an elevator in the odd ones)
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
  vs.map = 'tower'; vs.tw = { seed: (Math.random() * 1e9) | 0, fl: {}, fMe: TW_N, fFoe: TW_N, q: [], px: 0, dx: 0, pHp: 0, dHp: 0, dHit: -9999, dDown: 0, pDown: 0, swingAt: 0, fade: null, banner: null, away: false, awayX: 0, arrX: 0, via: 'stairs', lastDoor: 0, hint: 0, on: false, expl: [], doorAt: -1, flashes: [], haze: null };
}
function twRound(now) {
  const T = vs.tw, d = dummy; T.fMe = T.fFoe = TW_N; T.q.length = 0; T.away = false; T.fade = null; T.haze = null; T.flashes = []; T.expl.length = 0; const F = twFloorData(TW_N), gap = d ? d.x - wx : 60; wx = twFreeX(F, Math.round((F.xs[1] + F.xs[2]) / 2) - 30, gap); wxv = 0; wvx = 0;
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
}
function twSweep(x0, x1, p, now) {      // a beam or a wave crosses the floor between x0 and x1: everything in its way takes p (Ryu's ULTIMATE)
  if (!twOn()) return; const F = twFloorData(vs.tw.fMe), lo = Math.min(x0, x1), hi = Math.max(x0, x1);
  for (const o of F.objs.slice()) if (o.x > lo && o.x < hi) twDamageObj(F, o, p, now);
  for (const w of F.walls) if (w.x > lo && w.x < hi) twWallHit(F, w, p, now);
}
function twExplode(F, x, pw, rad, now) {      // a gas tank or an extinguisher goes off: an area blast that hurts both fighters, breaks what is near, sets off the next one and, from 50 up, opens the floor
  const T = vs.tw; if (T.expl.length > 5) return; T.expl.push(1); const vis = T.fMe === F.f, d = dummy;
  if (vis) { divFx.push({ wx: x, y: gy - 22, born: now, big: true }); if (divFx.length > 8) divFx.shift(); spark(x, gy - 18, 20, ['#ffffff', '#ffd34d', '#ff7a2a'], true, 1); puff(x, 8); gritAt(x, 14, 130, 0); shockAt(x, pw * 5, rad + 30, 0.9); flash(now, 150, 0.3); shakeUntil = Math.max(shakeUntil, now + 380); shakeAmp = Math.max(shakeAmp, 5); snd('twbreak', 5); hitStop(60); twHaze(now, 0.7); }
  twDecal(F, 'scorch', x, 30); twDecal(F, 'scorch', x, 6); twLightsShock(F, x, rad + 50, pw * 1.2, now); if (vis) twFlash(x, now, [255, 160, 70], 52);
  if (vis && vs.ph === 'fight') { const dd = Math.abs(wx - x); if (dd < rad) { const k = 1 - dd / rad; twHurtMe(Math.max(1, Math.round(pw * 0.4 * k)), now, false); wxv += (wx >= x ? 1 : -1) * 260 * k; say('BLAST', wx, '#ff8a3a', 8, now); } }
  if (d && d.ko < 0 && !T.away && T.fFoe === F.f) { const dd = Math.abs(d.x - x); if (dd < rad) { const k = 1 - dd / rad; d.vx += (d.x >= x ? 1 : -1) * 300 * k; twHurtFoe(Math.max(1, Math.round(pw * 0.4 * k)), now, false); d.hitAt = now; say('BLAST', d.x, '#ff8a3a', 8, now); } }
  for (const o of F.objs.slice()) { const dd = Math.abs(o.x - x); if (dd < rad) twDamageObj(F, o, pw * (1 - dd / rad) * 2.4, now); }
  for (const w of F.walls) { const dd = Math.abs(w.x - x); if (dd < rad) twWallHit(F, w, pw * (1 - dd / rad) * 1.8, now); }
  if (x < rad) twOuterHit(F, 0, pw * 1.4, now); if (F.W - x < rad) twOuterHit(F, 1, pw * 1.4, now);
  if (pw >= 50) twAddHole(F.f, x, 24, now);
  T.expl.pop();
}

// ---------------------------------------------------------------- the floors: falling, climbing, being away
const twHoleAt = (F, x) => { for (const h of F.holes) if (Math.abs(x - h.x) < h.r - 4) return h; return null; };
function twDepthAt(f, x) { let n = 0, g = f; while (g > 1 && twHoleAt(twFloorData(g), x)) { n++; g--; } return n; }      // (how many floors a body at x falls from floor f)
function twRoomOf(F, x) { let r = 0; for (let i = 1; i < F.xs.length - 1; i++) if (x >= F.xs[i]) r = i; return r; }
function twPlace(F, x) { x = Math.max(24, Math.min(F.W - 24, x)); for (const w of F.walls) if (!w.broken && Math.abs(x - w.x) < 20) x = w.x + (x >= w.x ? 20 : -20); return x; }
function twFloorSwitch(now, x) {      // you are on another floor now: its place, a fade in from black and the new floor's number
  const T = vs.tw, F = twFloorData(T.fMe); twClearWorld(); wx = twPlace(F, x); wxv = 0; wvx = 0; T.px = wx; T.fade = { at: now, ms: 520 }; T.banner = { txt: 'FLOOR ' + T.fMe, at: now }; popups = [];
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
  const T = vs.tw, f = who === 'foe' ? T.fFoe : T.fMe; if (f <= 1) { say('SOLID FLOOR', x, '#9a9aa8', 8, now); return false; }
  n = Math.min(n, f - 1); const r = Math.min(46, 20 + 4 * n), side = who === 'foe' ? (x >= wx ? 1 : -1) : (dummy && x >= dummy.x ? 1 : -1), hx = Math.round(x + side * r * 0.6);      // (the crater is centred a little AWAY from the attacker, who stands next to the victim: he does not fall unless he walks in)
  for (let i = 0; i < n; i++) twAddHole(f - i, hx, r, now);
  debBurst(x, 6, 18 + 2 * n, ['#8a8a92', '#6d6d75', '#b8b0a0', '#6d3b2c'], 150 + 10 * n); puff(x - 8, 6); puff(x + 8, 6); gritAt(x, 14, 130, 0); shockAt(x, 280, 120, 0.9); snd('twbreak', 4); flash(now, 120, 0.25); shakeUntil = Math.max(shakeUntil, now + 520); shakeAmp = Math.max(shakeAmp, 6); hitStop(70);
  twLightsShock(twFloorData(f), x, 90 + 20 * n, 30 + 20 * n, now); if (T.fMe === f) { twHaze(now, 0.8); twFlash(x, now, [255, 240, 210], 36); }
  if (who === 'foe') twFoeFall(n, now, x, 'SLAM!'); else twMeFall(n, now, x, 'SLAM!'); return true;
}
function twTravel(dir, door, now) {      // the stairs (1 floor) or the elevator (5): you are on another floor, at the same kind of door
  const T = vs.tw, f = T.fMe, n = door.k === 'elev' ? 5 : 1, to = Math.max(1, Math.min(TW_N, f + dir * n)); if (to === f) { say(dir > 0 ? 'TOP FLOOR' : 'GROUND FLOOR', wx, '#9a9aa8', 8, now); return; }
  const d = dummy, foeHere = !!d && d.ko < 0 && !T.away; T.fMe = to; const F = twFloorData(to); let best = F.doors[0]; for (const dr of F.doors) if (dr.k === door.k && Math.abs(dr.room - door.room) < Math.abs(best.room - door.room) || (best.k !== door.k && dr.k === door.k)) best = dr;
  twFloorSwitch(now, best.x); snd('twbreak', 6); T.lastFallX = null; if (foeHere) { T.away = true; d.twAway = true; T.awayX = d.x; } twPlanArrival(now);
}
function twFoeHere(now) {      // (PUT ENEMY and RESET of free play): the enemy is where you are
  if (!twOn()) return; const T = vs.tw, d = dummy; T.away = false; T.fFoe = T.fMe; if (d) d.twAway = false; T.q.length = 0;
}
function twFoeArrive(now) {      // the enemy comes: out of the crater above you, or out of the door of your room
  const T = vs.tw, d = dummy, F = twFloorData(T.fMe); if (!d || d.ko >= 0) { T.away = false; return; }
  let x, hole = T.via === 'hole'; if (hole) x = T.arrX; else { const dr = F.doors[Math.min(F.doors.length - 1, twRoomOf(F, wx))]; x = dr.x; }
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
  return slow;
}
function twWatch(now) {      // what hit whom (watched from the health, the knock-down and the launch: every fighter's blows end there): the furniture next to the victim takes part of it; a SLAM (put on the floor from above) or a heavy hit breaks the floor; a high launch breaks the ceiling
  const T = vs.tw, d = dummy; if (!d || vs.ph !== 'fight' || T.away || d.ko >= 0 || T.fFoe !== T.fMe) return; const F = twFloorData(T.fMe);
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
function twTick(now, dt) {
  if (!twOn() || state !== 'play') return; const T = vs.tw, d = dummy; if (!T.on || !d) return;
  for (let i = T.q.length - 1; i >= 0; i--) if (now >= T.q[i].at) twRunQ(T.q.splice(i, 1)[0], now);
  if (T.away) twAwayStep(now);
  if (vs.ph !== 'fight') { T.px = wx; T.dx = d.x; return; }
  if (Math.abs(wx - T.px) > 60) T.px = wx; if (Math.abs(d.x - T.dx) > 60) T.dx = d.x;      // (a body that was put somewhere (PUT ENEMY, a floor change, the enemy coming back) is where it is: no wall between)
  twWatch(now);
  let F = twFloorData(T.fMe); const grounded = gojoLift < 5 && !(gAir && gAirH > 5);
  const near = grounded ? F.doors.find(dr => Math.abs(dr.x - wx) < 22) : null, dn = crReq || (stickDown && !T.sdPrev); T.sdPrev = stickDown;      // (the stairs and the elevator: JUMP goes up, CROUCH goes down)
  if (near) { if (T.doorAt < 0) T.doorAt = now; } else T.doorAt = -1;
  const door = near && now - T.doorAt >= 350 ? near : null;      // (only after standing at the door for a third of a second: a jump on the way past is a jump)
  if (door) { if (jumpReq) { jumpReq = false; twTravel(1, door, now); } else if (dn) { crReq = false; twTravel(-1, door, now); } F = twFloorData(T.fMe); }
  if (grounded && vs.ph === 'fight') { const n = twDepthAt(T.fMe, wx); if (n > 0) { twMeFall(n, now, wx); F = twFloorData(T.fMe); } }      // (you walked into a crater)
  if (!T.away && d.ko < 0 && T.fFoe === T.fMe) {
    const h = twHoleAt(F, d.x);
    if (h && !d.air && (d.airH || 0) < 5) { const sp = Math.abs(d.vx * mScale(massOf(d))); if (sp <= 100 && now - d.hitAt > 500 && now >= (d.down || 0)) { const side = T.dx < h.x ? -1 : T.dx > h.x ? 1 : (wx < h.x ? -1 : 1); d.x = h.x + side * (h.r + 3); d.vx = 0; } else { twFoeFall(twDepthAt(T.fFoe, d.x), now, d.x); } }      // (the enemy stays away from the edge of a crater unless he is thrown in)
  }
  F = twFloorData(T.fMe);
  { const r = twRoomClamp(F, wx, T.px, Math.abs(wxv), 'me', now); if (r.x !== wx) { wx = r.x; if (r.bump > 0) { const dm = Math.round((r.bump - 150) * 0.1); if (dm > 0) { twHurtMe(dm, now, false); say('WALL! -' + dm, wx, '#ff9a5a', 8, now); } wxv = -wxv * 0.3; wvx = 0; snd('hit', 1); } } else if (r.bump < 0) wxv *= 0.6;
    if (wx < -8 || wx > F.W + 8) { if (F.f > 1) twFallOut('me', now, wx < 0 ? 0 : 1); } else wxv *= twBodyObjs(F, wx, Math.abs(wxv), 'me', now) < 1 ? 0.7 : 1; }
  if (!T.away && d.ko < 0 && T.fFoe === T.fMe) {
    F = twFloorData(T.fMe); const v = Math.abs(d.vx * mScale(massOf(d))), r = twRoomClamp(F, d.x, T.dx, v, 'foe', now);
    if (r.x !== d.x) { d.x = r.x; if (r.bump > 0) { const dm = Math.round((r.bump - 160) * 0.12); if (dm > 0) { twHurtFoe(dm, now, false); d.hitAt = now; say('WALL! ' + dm, d.x, '#ffd34d', 8, now); } d.vx = -d.vx * 0.3; snd('smack', 1); } } else if (r.bump < 0) d.vx *= 0.6;
    if (d.x < -8 || d.x > F.W + 8) { if (F.f > 1) twFallOut('foe', now, d.x < 0 ? 0 : 1); } else d.vx *= twBodyObjs(F, d.x, v, 'foe', now) < 1 ? 0.7 : 1;
  }
  F = twFloorData(T.fMe);
  if ((atkReq || lpReq) && now > T.swingAt + 200) { T.swingAt = now + 120; T.swingP = lpReq ? 11 : 6; }      // (a press of ATTACK or BLUE: 0.12 s later the blow lands on what stands in front of you)
  if (T.swingAt && now >= T.swingAt) { T.swingAt = 0; for (const o of F.objs.slice()) if (o.x > wx - 6 && o.x < wx + 38) twDamageObj(F, o, T.swingP, now); for (const w of F.walls) if (!w.broken && w.x > wx - 6 && w.x < wx + 30) twWallHit(F, w, T.swingP * 0.6, now); }
  for (let i = F.pick.length - 1; i >= 0; i--) if (Math.abs(wx - F.pick[i].x) < 12) { F.pick.splice(i, 1); vs.hp = Math.min(PHP, vs.hp + Math.round(PHP * 0.06)); T.pHp = vs.hp; say('SODA +6%', wx, '#7af0a0', 8, now); snd('twbreak', 6); }
  T.px = wx; T.dx = d.x;
}
function twBase(now) {      // right after the training step (which gives an infinite-health enemy his health back): this is what the next frame's hits are measured against
  if (!twOn() || !vs.tw.on || !dummy) return; const T = vs.tw, d = dummy; T.dHp = d.hp; T.dHit = d.hitAt; T.dDown = d.down || 0; T.pHp = vs.hp; T.pDown = gDownUntil;
}
function twOverlay(now) {      // over the picture: the fade after a fall or a climb, the floor you are on (and where the enemy is when he is not here), and the big number when you arrive
  if (!twOn() || state !== 'play') return; const T = vs.tw;
  if (T.fade) { const a = 1 - (now - T.fade.at) / T.fade.ms; if (a <= 0) T.fade = null; else { ctx.fillStyle = 'rgba(0,0,0,' + a.toFixed(2) + ')'; ctx.fillRect(0, 0, VW, VH); } }
  if (ryUlNoHud()) return;
  if (T.prompt && now - T.prompt.at < 80) { const mx = Math.round(VW / 2); if (T.prompt.up) pxt(T.prompt.up, mx, gy + 18, '#9fffd0', 8, 'center'); if (T.prompt.dn) pxt(T.prompt.dn, mx, gy + 27, '#9fd8ff', 8, 'center'); }
  pxt('FLOOR ' + T.fMe, Math.round(VW / 2), 44, '#cfe8ff', 8, 'center'); if (T.away) pxt('FOE ' + T.fFoe + (T.fFoe > T.fMe ? ' UP' : ' DOWN'), Math.round(VW / 2), 53, '#ffb27a', 8, 'center');
  if (T.banner && now - T.banner.at < 1300) { const u = (now - T.banner.at) / 1300; ctx.globalAlpha = u > 0.6 ? Math.max(0, (1 - u) / 0.4) : 1; pxt(T.banner.txt, Math.round(VW / 2), Math.round(VH * 0.46), '#ffffff', 16, 'center'); ctx.globalAlpha = 1; }
}
window.__tw = () => twOn() ? (() => { const T = vs.tw, F = twFloorData(T.fMe); return { fMe: T.fMe, fFoe: T.fFoe, away: T.away, W: F.W, nr: F.nr, th: F.th, walls: F.walls.map(w => [w.x, Math.round(w.hp), w.broken]), holes: F.holes.map(h => [h.x, h.r]), objs: F.objs.length, wrecks: F.wrecks.length, wx: Math.round(wx), dx: dummy ? Math.round(dummy.x - wx) : null, via: T.via, arrive: Math.round(T.arriveAt - pnow()), doors: F.doors.map(d => [d.x, d.k]), pick: F.pick.length, fade: !!T.fade }; })() : null;      // test hook
window.__twF = f => twOn() ? twFloorData(f) : null;
