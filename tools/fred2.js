// ---------------------------------------------------------------- v1.185 FREDDY'S NEW MOVES (this file is spliced into template.html by build_html.py, after the select screens; freddyScene and fredA in template.html call it). The user: "add to freddy kruger if he is far away from the enemy, same range as sukuna, and uses his M1 he will extend his arm out and punch with his left hand forward, same range as the cartoon cat, and if i use it again i will punch with the right arm; add that freddy, if crouching and using his special, will punch the ground in the street map and then throw stones at the enemy, if it is the skyscraper map he will break the ground and as he and the enemy are falling he will grab anything around him and chuck it quickly at the enemy; add a fatality ..."
// 1. THE STRETCHED PUNCH (M1 with the enemy FAR). Sukuna's M1 turns into a ranged attack when the enemy is more than SU_NEAR = 60 px away, so that is where Freddy's turns into the stretched punch too: his arm shoots out like the Cartoon Cat's (the Cat's M1 grab touches an enemy up to 82 - 90 px away, HIT.cat[30]; Freddy's blows 60 and 61 use the very same numbers). The first press punches with his LEFT hand (a bare fist, from behind the chest: his glove stays up as a guard), the next with the RIGHT (the clawed glove goes out), then the left again ... (the sequence starts again with the left hand after 1.4 s without a press). Closer than 60 px his two slashes are what they were. The blows are numbers 60 (left) and 61 (right) of the game's tables (ATK_FPS, ATK_SWING, ATK_IMPACT, DMG, KNOCK, REACH, HIT: 15 pictures at 38 a second, the whoosh on picture 3, the blow on picture 6, 10 and 12 damage, both M1 blows of the M1 cap): every rule of a normal blow applies (guard, dodge, a crouching enemy ducks it, combo meter, FLOW, stagger, whiff). The pictures are made fresh from his idle picture (the body leans, the sleeve with its red and green stripes stretches out to the fist or the claw), see fredFarPic.
const FRED_FAR = { near: 60, fps: Math.round(30 * PACE), whoosh: 3, hit: 6, dmg: [10, 12], k0: 90, names: ['L.PUNCH', 'R.PUNCH'], tip: 76 };      // (near: the gap beyond which his M1 is the stretched punch; tip: how far in front of his hips the farthest pixel of the fist (or of the claw's blades) is on the blow's pictures: the same 76 px as the Cat's glove, which the reach numbers below come from)
for (let i = 0; i < 2; i++) { const k = FRED_FAR.k0 + i; ATK_FPS[k] = FRED_FAR.fps; ATK_SWING[k] = FRED_FAR.whoosh; ATK_IMPACT[k] = FRED_FAR.hit; DMG[k] = FRED_FAR.dmg[i]; KNOCK[k] = 16; KNOCK_G[k] = 0; REACH[k] = 82; HIT.freddy[k] = HIT.cat[30]; M1_HITS.freddy.push(k); HB_TIP.freddy[k] = { 18: FRED_FAR.tip, 19: FRED_FAR.tip, 20: FRED_FAR.tip, 21: FRED_FAR.tip, 22: FRED_FAR.tip, 23: FRED_FAR.tip, 24: FRED_FAR.tip, 25: FRED_FAR.tip }; }      // (HB_TIP: the rows the limb covers, for SET > SHOW HITBOXES and for a curse, whose body is measured from these)
let fredFarC = 0;      // how many stretched punches of this sequence have been thrown (even: the next is the left hand)
function fredFarGap(now) {      // the gap to the nearest enemy in front of him when a stretched punch is on (he stands, an enemy that can be hit is in front of him and farther than FRED_FAR.near); 0 = it is not on
  if (!vs || vs.net || vs.ph !== 'fight' || stance !== 'stand' || (twOn() && vs.tw.away)) return 0; let g = 1e9;
  for (const e of vs.foes && vs.foes.length > 1 ? vs.foes : [dummy]) if (e && e.ko < 0 && !e.cap && e.x - wx >= -3 && now - e.born >= 600) g = Math.min(g, e.x - wx);
  return g > FRED_FAR.near && g < 1e9 ? g : 0;
}
function fredFarK(now) { if (!fredFarGap(now)) return 0; return FRED_FAR.k0 + (fredFarC++ & 1); }      // the blow of the next press of ATTACK when the enemy is far: 60 = the left hand, 61 = the right, then the left again; 0 = not far: the normal slash
const FRED_FAR_EXT = [      // how far the arm is out in each of the 15 pictures (0 = in at the chest, 1 = all the way out, below 0 = drawn back to throw it); the blow lands on picture 6
  [0, -0.12, -0.25, 0.45, 0.95, 1, 1, 1, 0.96, 0.78, 0.52, 0.32, 0.16, 0.05, 0],         // the jab (left)
  [0, -0.2, -0.45, -0.35, 0.55, 1, 1, 1, 0.98, 0.82, 0.56, 0.35, 0.18, 0.06, 0]];        // the cross (right): a bigger wind-up
const FRED_FAR_LEAN = [[0, -1, -2, 1, 3, 3, 3, 3, 3, 2, 2, 1, 1, 0, 0], [0, -1, -3, -3, 2, 4, 4, 4, 4, 3, 2, 2, 1, 0, 0]];      // how far the upper body leans forward in each picture (px at the head; less lower down, nothing at the hips)
const FRED_FC = new Map();
function fredFarPic(k, af) {      // picture af (0-14) of a stretched punch (k 60 = the left hand: a bare fist, 61 = the right hand: the clawed glove) as a canvas of 128 x 64: his body is in the first 64 columns like every picture of his (his hips at column 31), the arm reaches out to the right
  af = Math.max(0, Math.min(14, Math.floor(af))); const key = k * 20 + af; let c = FRED_FC.get(key); if (c) return c; const idle = fredF(0); if (idle === EMPTY) return EMPTY;
  const R = k - FRED_FAR.k0, ext = FRED_FAR_EXT[R][af], lean = FRED_FAR_LEAN[R][af], claw = R === 1;
  c = document.createElement('canvas'); c.width = 128; c.height = 64; const g = c.getContext('2d'); g.imageSmoothingEnabled = false;
  const P = (col, x, y, w, h) => { g.fillStyle = col; g.fillRect(Math.round(x), Math.round(y), w, h); };
  const show = claw ? af >= 4 && af <= 11 : af >= 3 && af <= 12;      // (the first and the last pictures are his idle picture, leaning: the arm is in)
  const body = () => {      // the body: the legs stay, the rows above the hips lean (each row a little further than the one below it: a smooth bend, no tear)
    const src = !show ? idle : claw ? fredNoClaw(idle) : fredFarNoArm(idle); g.drawImage(src, 0, 36, 64, 28, 0, 36, 64, 28);
    for (let y = 0; y < 36; y++) g.drawImage(src, 0, y, 64, 1, Math.round(lean * (36 - y) / 36), y, 64, 1);
  };
  const S = claw ? [37 + Math.round(lean * 0.45), 21] : [25 + Math.round(lean * 0.45), 21];      // the shoulder the arm leaves from (the right one in front of the chest; the left one at his back)
  const rest = claw ? 44 : 47, far = FRED_FAR.tip - (claw ? 12 : 3) + 31;      // where the hand is at rest (a column of the picture) and at full stretch (the middle of the fist, or of the glove when the blades reach the tip)
  const hx = Math.round(ext >= 0 ? rest + (far - rest) * ext : rest + ext * 22), hy = 22 + (ext < 0 ? Math.round(-ext * 4) : 0) + (claw ? 0 : 1) - Math.round(Math.min(1, Math.max(0, ext)) * 1);
  const per = 3 + Math.round(Math.max(0, ext) * 2), sleeve = (x0, y0, x1, y1, w, off) => {      // a striped sleeve (as the block's): the dark outline first, then red and green stripes with light on top and shade below; the stripes stretch with the arm
    const n = Math.max(1, Math.round(Math.hypot(x1 - x0, y1 - y0))), at = i => [x0 + (x1 - x0) * i / n, y0 + (y1 - y0) * i / n], o = w >> 1;
    for (let i = 0; i <= n; i++) { const [px, py] = at(i); P('#14101a', px - o - 1, py - o - 1, w + 2, w + 2); }
    for (let i = 0; i <= n; i++) { const [px, py] = at(i), st = Math.floor((i + off) / per) % 2; P(st ? '#2f7a43' : '#b3303d', px - o, py - o, w, w); P(st ? '#55a868' : '#d6505c', px - o, py - o, w, 1); P(st ? '#1f5430' : '#7a1f2b', px - o, py + o - 1 + (w & 1), w, 1); } };
  const arm = () => {
    const dd = Math.hypot(hx - S[0], hy - S[1]);
    if (dd > 21.5) sleeve(S[0], S[1], hx, hy, 4, 0);      // (out far enough: a straight arm)
    else { const ux = (hx - S[0]) / Math.max(1, dd), uy = (hy - S[1]) / Math.max(1, dd), a = dd / 2, h = Math.sqrt(Math.max(0, 11 * 11 - a * a)), E = [S[0] + ux * a - uy * h, S[1] + uy * a + ux * h]; sleeve(S[0], S[1], E[0], E[1], 5, 0); sleeve(E[0], E[1], hx, hy, 4, 4); }      // (in at the chest: a bent arm with an elbow that points down and back)
    if (claw) { P('#b3303d', S[0] - 2, S[1] - 2, 5, 4); P('#d6505c', S[0] - 2, S[1] - 2, 5, 1); }      // (the shoulder of the right arm; the left one is hidden behind his body)
    if (ext > 0.3) for (const dy of [-4, 4]) P('rgba(255,255,255,0.3)', S[0] + 14 + dy, hy + dy, Math.max(3, (hx - S[0]) * 0.5), 1);      // (the air streaks past the arm)
    if (!claw) { P('#14101a', hx - 3, hy - 3, 7, 7); P('#b87c58', hx - 2, hy - 2, 5, 5); P('#dca878', hx - 2, hy - 2, 5, 1); P('#dca878', hx - 2, hy - 1, 1, 2); P('#7a4234', hx - 2, hy + 2, 5, 1); P('#7a4234', hx, hy - 1, 1, 3); P('#7a4234', hx + 1, hy - 1, 1, 3); }      // (a bare fist: outline, skin, light on top, shade below, the lines of the fingers)
    else { P('#14101a', hx - 3, hy - 3, 7, 7); P('#7a4e2c', hx - 2, hy - 2, 5, 5); P('#a8703f', hx - 2, hy - 2, 5, 1); P('#4a2f1a', hx - 2, hy + 2, 5, 1); P('#c58a52', hx - 1, hy - 1, 1, 1); P('#c58a52', hx + 1, hy - 1, 1, 1);
      const open = af >= 4 && af <= 9, sp = open ? 4 : 2.5, len = open ? 8 : 6; for (let j = 0; j < 4; j++) { const o = (j - 1.5) * sp / 1.5; for (let i = 3; i < 3 + len; i++) { const f = 1 + (i - 3) * 0.12; P(j === 3 ? '#9aa3b8' : '#e9edf6', hx + i, hy + o * f, 1, 1); } P('#ffffff', hx + 2 + len, hy + o * (1 + (len - 1) * 0.12), 1, 1); } }      // (the clawed glove: outline, brown, light top, dark bottom, two knuckles, four blades along the arm that spread wide at the blow)
    if (af === 6 || af === 7) { const tx = hx + (claw ? 11 : 4); P('#ffffff', tx, hy - 3, 1, 7); P('#ffffff', tx - 2, hy, 5, 1); P('#ffe9a0', tx - 1, hy - 1, 3, 3); }      // (a flash at the tip on the blow)
  };
  if (!show) body(); else if (claw) { body(); arm(); } else { arm(); body(); }      // (the right arm is in front of the body, the left one behind it)
  FRED_FC.set(key, c); return c;
}
const FRED_NA = new Map();
function fredFarNoArm(idle) {      // his idle picture without the left arm that hangs at his back: it is the one that punches, from behind the body (the first and the last pictures keep it)
  let o = FRED_NA.get(idle); if (o) return o;
  o = document.createElement('canvas'); o.width = o.height = 64; const g = o.getContext('2d'); g.drawImage(idle, 0, 0); g.clearRect(10, 17, 17, 21); FRED_NA.set(idle, o); return o;
}

// 2. THE GROUND SLAM (BLUE while CROUCHED; the BLUE button reads STONES, or BREAK in the skyscraper). The user: "if crouching and using his special then he will punch the ground in the street map and then he will throw stones at the enemy, if it is the skyscraper map he will break the ground and as he and the enemy are falling freddy will grab anything around him and chuck it quickly at the enemy".
// He springs up out of the crouch (the jump's own pictures), comes down on his claw hand and drives it into the ground (0.41 s: nothing of the enemy's reaches him in the air), and the ground gives way where it lands.
// STREET: the road cracks towards the enemy (a crack runs along the floor), chunks of it fly up and lie in front of him (4), and he picks them up and throws them one after the other (the pictures of his water throw, 0.18 s each, they leave his hand on the 6th picture): 340 px/s, a little arc, 6 damage and a flinch each (24 in all), a crouching enemy ducks them, a dodge misses, nothing else stops them (they fly over a guard). Anyone within 30 px of the fist takes 6 more from the burst.
// SKYSCRAPER (floor 2 or higher, not in the elevator): the floor breaks under BOTH of them, two floors deep (one if he is on the 2nd floor): both fall (the camera falls 1.3 s with them, the enemy hangs in the air next to him, 3% of health a floor for each of them, never a K.O.: the rule of every fall) and the whole time he grabs what is around him (the 5 pieces of furniture of the room nearest to him; what the room does not have is broken floor) and chucks them at the enemy, one every 0.18 s, 5 damage plus the piece's own (a desk 9, a chair 7, a computer 6, a safe 19) and a flinch each; the enemy lands next to him when the fall ends. In the lobby, in the elevator or with the enemy on another floor it is the street move.
// It costs 25 energy (nothing if he is out of it: the bar flashes), 0.9 s before the next one, not while the enemy is not there (NO TARGET), a blow on him ends it (the stones already in the air keep flying), not in the Wi-Fi fight. While it lasts he cannot do anything else.
const FG = { cost: 25, cd: 900, spring: 110, air: 300, apex: 26, stoop: 60, hold: 200, fps: 45, N: [4, 5], rel: 7, speed: 340, dmg: 8, objDmg: 5, knock: 40, fallMs: 1300, floors: 2, reach: 26, hang: 18, burst: 30 };
CE_COST.fGround = FG.cost;
let fg = null, fgCd = 0, fgFly = [], fgCracks = [];      // the move going on { at, tw (the skyscraper kind), N (how many throws), n (thrown so far), pile (chunks lying in front of him), items (the pieces he grabbed), jp / pic (the picture of this frame, jp = one of the jump's: not drawn 8 px to the right), lift, hit (the ground was hit), fell (the fall began) }, when the next may begin, what is flying (stones and furniture), the cracks in the road
const fgTower = () => twOn() && !vs.tw.cab && vs.tw.fMe >= 2 && !vs.tw.away;      // (the floor can be broken: not in the lobby, not in the elevator, and the enemy is here)
function fgReset() { fg = null; fgFly.length = 0; fgCracks.length = 0; fgCd = 0; }
function fgTarget() { const d = dummy; return d && vs && !vs.net && vs.ph === 'fight' && d.ko < 0 && !d.cap && !(twOn() && vs.tw.away) && !(d.vform && d.vform !== 'verity') ? d : null; }
function fgTry(now) {      // BLUE pressed while crouched
  if (now < fgCd || vs.net) return; if (!fgTarget()) { say('NO TARGET', wx, '#ff8a7a', 8, now); return; } if (!ceSpend(FG.cost, now)) return;
  const tw = fgTower(); fg = { at: now, tw, N: FG.N[tw ? 1 : 0], n: 0, pile: 0, items: [], jp: null, pic: null, lift: 0, hit: false, fell: false };
  fwPh = 'ground'; fredWalk = false; fredTg = wvx = 0; atkQ = false; fredCrQ = fredUpQ = -1; snd('jump');
}
function fgEnd(now, hurt) {      // the move is over (or a blow ended it): the enemy hanging in the air lands, he stands up
  const d = dummy; if (fg && fg.fell && d && d.air && d.air.hover) { d.air = null; d.airH = 0; if (d.ko < 0) { d.rx = (Math.random() * 10) | 0; d.rxAt = now; d.stunUntil = Math.max(d.stunUntil || 0, now + 450); puff(d.x, 8); snd('land', 1.4); } }
  const was = fg; fg = null; fwPh = ''; fgCd = now + FG.cd; if (was && !hurt) { stance = 'stand'; stickCr = false; fredSf = -1; }
}
function fgImpact(now) {      // the claw hits the ground
  const d = dummy, x = wx + FG.reach, dir = d && d.x >= wx ? 1 : -1;
  gritAt(x, 12, 130, 0); shockAt(x, 220, 90, 0.9); puff(x - 6, 8); puff(x + 6, 8); snd('land', 1.6); snd('twbreak', 4); flash(now, 90, 0.18); hitStop(60); shakeUntil = Math.max(shakeUntil, now + 360); shakeAmp = Math.max(shakeAmp, 5);
  if (fg.tw) { fgTowerBreak(now); return; }
  fgCracks.push({ x, at: now, dir, len: Math.min(170, Math.max(60, Math.abs(d.x - wx) + 24)), seed: (now | 0) & 255 }); if (fgCracks.length > 4) fgCracks.shift(); fg.pile = fg.N; fg.ix = x;
  debBurst(x, 6, 18, ['#8a8a92', '#6d6d75', '#b8b0a0', '#4c4a40'], 160);
  if (d && d.ko < 0 && !d.cap && Math.abs(d.x - x) <= FG.burst) { techDmg(d, 6, now, 50 * dir, false); say('BURST', d.x, '#ffd34d', 8, now + 100); }
}
function fgTowerBreak(now) {      // the floor breaks under both of them and both fall
  const T = vs.tw, d = dummy, f = T.fMe, F = twFloorData(f), n = Math.min(FG.floors, f - 1), gap = d.x - wx, x = wx;
  const top = F.objs.filter(o => !o.on && o.k !== 'pillar' && Math.abs(o.x - wx) < 190).sort((a, b) => Math.abs(a.x - wx) - Math.abs(b.x - wx)).slice(0, FG.N[1]);      // (what he grabs: the nearest pieces, not the pillars)
  fg.items = top.map((o, i) => ({ k: o.k, v: o.v | 0, hx: [26, 40, 20, 48, 33][i % 5] + Math.max(0, (TW_K[o.k].w >> 1) - 10), hy: [34, 46, 22, 30, 54][i % 5] + (TW_K[o.k].h >> 2), ph: i * 1.7 }));      // (a wide piece hangs further out, so it does not cover him)
  while (fg.items.length < FG.N[1]) { const i = fg.items.length; fg.items.push({ k: 'rock', v: i, hx: [26, 40, 20, 48, 33][i % 5], hy: [34, 46, 22, 30, 54][i % 5], ph: i * 1.7 }); }
  for (const o of top) { const i = F.objs.indexOf(o); if (i >= 0) F.objs.splice(i, 1); } for (const c of F.objs.slice()) if (top.includes(c.on)) twBreakObj(F, c, now);      // (they leave the room; a computer that stood on a desk he took breaks)
  for (let i = 0; i < n; i++) { twAddHole(f - i, wx, 28, now); if (Math.abs(gap) > 24) twAddHole(f - i, d.x, 28, now); }
  debBurst(x, 6, 18 + 2 * n, ['#8a8a92', '#6d6d75', '#b8b0a0', '#6d3b2c'], 150 + 10 * n); puff(x - 8, 6); puff(x + 8, 6); shockAt(x, 280, 120, 0.9); shakeUntil = Math.max(shakeUntil, now + 520); shakeAmp = Math.max(shakeAmp, 6); hitStop(70);
  for (const dr of F.doors) if (dr.k === 'elev' && Math.abs(dr.x - x) < 50) twDoorHit(F, dr, 25 + 15 * n, now);
  twLightsShock(F, x, 90 + 20 * n, 30 + 20 * n, now); twHaze(now, 0.8); twFlash(x, now, [255, 240, 210], 36);
  const to = f - n, dmMe = Math.max(1, Math.round(PHP * Math.min(0.30, 0.03 * n))), dmFoe = Math.round((d.max || DUMMY_HP) * Math.min(0.30, 0.03 * n));
  T.fMe = to; T.fFoe = to; T.lastFallX = x; T.away = false; d.twAway = false; twFloorSwitch(now, x, 'fall'); d.x = twPlace(twFloorData(to), wx + gap); d.vx = 0; d.down = 0;
  twHurtMe(dmMe, now, true); twHurtFoe(dmFoe, now, true); T.dx = d.x; T.dHp = d.hp; T.pHp = vs.hp; T.dHit = d.hitAt;
  if (T.slide) { T.slide.pair = true; T.slide.ms = FG.fallMs; T.slide.land = ['BREAK!', n, dmMe]; vs.nHold = Math.max(vs.nHold || 0, now + FG.fallMs); if (T.banner) T.banner.at = now + FG.fallMs; } else twLand(now, 'BREAK!', n, dmMe);
  say('BREAK!', x, '#ffd34d', 8, now); fg.fell = true; fgFoeKeep(now);
}
function fgFoeKeep(now) {      // the enemy falls next to him: he hangs in the air and cannot act
  const d = dummy; if (!d || d.ko >= 0) return; d.stunUntil = Math.max(d.stunUntil || 0, now + 200); d.ai = 'rest'; d.aiAt = now; d.restFor = 200; d.hitDone = true; d.vx = 0;
  if (!d.air || !d.air.hover) { d.air = { at: now, h0: FG.hang, v0: 0, g: 0, kind: 'up', T: 1e9, hover: true }; d.airH = FG.hang; }
}
function fgThrow(now) {      // a stone (or a piece of furniture) leaves his hand
  const d = dummy, it = fg.tw ? fg.items.shift() : null, k = it ? it.k : 'rock', v = it ? it.v : (Math.random() * 4) | 0, X = wx + (it ? it.hx : 26), Y = it ? it.hy : 40, tx = d && d.ko < 0 ? d.x : wx + 120, T = Math.max(0.12, Math.abs(tx - X) / FG.speed);
  fgFly.push({ k, v, x0: X, y0: Y, yT: 30, T, at: now, x: X, y: Y, dir: tx >= X ? 1 : -1, rot: 0, spin: (Math.random() < 0.5 ? -1 : 1) * (5 + Math.random() * 5), dmg: k === 'rock' ? FG.dmg : FG.objDmg + TW_K[k].dmg });
  if (!fg.tw) fg.pile = Math.max(0, fg.pile - 1); snd('swing', 3);
}
function fgScene(now, dt, hf) {      // one frame of the move: which picture he shows (jp: one of the jump's, lifted by lift; pic: one of the touch / throw), the impact, the throws, the end
  const e = now - fg.at, tI = FG.spring + FG.air, tH = tI + FG.stoop + FG.hold, CY = Math.round(8000 / FG.fps), tT = tH + fg.N * CY, tR = Math.round(5000 / FG.fps);
  if (hf >= 0 || !vs || vs.ph !== 'fight' || !dummy) { fgEnd(now, hf >= 0); return; }
  fg.jp = fg.pic = null; fg.lift = 0;
  if (e < FG.spring) fg.jp = fredC(1, 14.99 * e / FG.spring);
  else if (e < tI) { const p = (e - FG.spring) / FG.air, u = p < 0.55 ? 1 - Math.pow(1 - p / 0.55, 2) : 1 - Math.pow((p - 0.55) / 0.45, 2); fg.lift = FG.apex * u; fg.jp = fredJ(p < 0.55 ? 6 + 8 * p / 0.55 : 14 + 19 * (p - 0.55) / 0.45); }      // (up, a hang at the top, a quick fall)
  else {
    if (!fg.hit) { fg.hit = true; fgImpact(now); if (!fg) return; }
    if (e < tI + FG.stoop) fg.jp = fredJ(36); else if (e < tH) fg.pic = fredT(12 + 2.99 * (e - tI - FG.stoop) / FG.hold);
    else if (e < tT) { const i = Math.floor((e - tH) / CY), q = (e - tH - i * CY) / CY, fi = 2 + Math.min(7, Math.floor(q * 8)); fg.pic = fredR(fi); if (fg.n <= i && fi >= FG.rel) { fg.n = i + 1; fgThrow(now); } }      // (scoop, rise, fling: the pictures 2 - 9 of the water throw, the chunk leaves on the 7th)
    else if (e < tT + tR) fg.pic = fredR(10 + 4.99 * (e - tT) / tR);
    else if (fg.fell && vs.tw && vs.tw.slide) fg.pic = fredR(14);      // (the fall is still going: he holds the last picture)
    else { fgEnd(now, false); return; }
  }
  if (fg.fell) fgFoeKeep(now);
}
function fgStep(now, dt) {      // every frame of Freddy: what he threw flies, hits the enemy or lands
  if (!fgFly.length) return; const d = dummy, on = !!d && d.ko < 0 && !d.cap && !!vs && vs.ph === 'fight' && !(twOn() && vs.tw.away);
  for (const p of fgFly) {
    const t = (now - p.at) / 1000, q = t / p.T; p.x = p.x0 + p.dir * FG.speed * t; p.y = p.y0 + (p.yT - p.y0) * q + 9 * Math.sin(Math.min(1, q) * Math.PI); p.rot += p.spin * dt;
    if (on && p.dir * (d.x - p.x) < 14 && p.dir * (d.x - p.x) > -14 && p.y > -2 && p.y < 62 + (d.airH || 0) && !(d.vact && d.vact.type === 'crouch' && p.y > 32)) { p.done = 1; fgHit(p, now); }
    else if (p.y < -6 || Math.abs(p.x - wx) > 360 || t > 2) { p.done = 1; if (p.y < -6) { gritAt(p.x, 4, 60, 0); snd('land', 1.2); } }
  }
  fgFly = fgFly.filter(p => !p.done);
}
function fgHit(p, now) {      // a stone or a piece of furniture lands on the enemy
  const d = dummy; if (now < (d.dodgeUntil || 0)) { say('MISS', d.x, '#9fd8ff', 8, now); return; }
  techDmg(d, p.dmg, now, FG.knock * p.dir, false); const K = p.k === 'rock' ? null : TW_K[p.k];
  if (K) { debBurst(p.x, p.y, 8 + (K.w >> 3), K.cols, 120); snd('twbreak', K.s); if (K.sp) spark(p.x, gy - p.y, 6, ['#7fd0ff', '#ffffff', '#ffd34d'], false, p.dir); } else { debBurst(p.x, p.y, 7, ['#8a8a92', '#6d6d75', '#b8b0a0'], 100); snd('twbreak', 3); }
  shakeUntil = Math.max(shakeUntil, now + 100); shakeAmp = Math.max(shakeAmp, 2);
}
const FG_ROCK = [[5, 4], [4, 4], [6, 5], [3, 3]];
function fgRock(x, y, v) {      // a chunk of road: dark outline, grey, a light edge on top and left, a dark one underneath
  const [w, h] = FG_ROCK[v & 3], x0 = Math.round(x - w / 2), y0 = Math.round(y - h / 2); ctx.fillStyle = '#1d1b18'; ctx.fillRect(x0 - 1, y0 - 1, w + 2, h + 2); ctx.fillStyle = '#7a7668'; ctx.fillRect(x0, y0, w, h); ctx.fillStyle = '#b4b09a'; ctx.fillRect(x0, y0, w - 1, 1); ctx.fillRect(x0, y0, 1, h - 1); ctx.fillStyle = '#4c4a40'; ctx.fillRect(x0 + 1, y0 + h - 1, w - 1, 1); ctx.fillRect(x0 + w - 1, y0 + 1, 1, h - 1);
}
function fgDrawGround(now, cx) {      // on the floor, under everybody: the cracks in the road and the chunks that lie in front of him
  for (const c of fgCracks) {
    const a = now - c.at; if (a > 6000) continue; const al = a > 4500 ? (6000 - a) / 1500 : 1, n = Math.floor(c.len * Math.min(1, a / 260)); let y = 0, s = c.seed * 977 + 13; ctx.fillStyle = 'rgba(8,6,12,' + al.toFixed(2) + ')';
    for (let i = 0; i < n; i++) { if (i % 3 === 0) { s = (s * 1103515245 + 12345) >>> 0; y = Math.max(0, Math.min(5, y + ((s >> 8) & 1 ? 1 : -1))); } ctx.fillRect(cx + Math.round(c.x + c.dir * i - wx), gy + 1 + y, 1, 1 + (i % 7 === 0 ? 1 : 0)); if (i % 11 === 5) ctx.fillRect(cx + Math.round(c.x + c.dir * i - wx), gy + 2 + y, 1, 2); }
  }
  if (fg && fg.pile > 0 && fg.hit) { const age = now - fg.at - FG.spring - FG.air, X = [0, 7, 3, 11, 6]; for (let i = 0; i < fg.pile; i++) { const j = FG.N[0] - 1 - i, up = age < 260 ? Math.sin(Math.PI * age / 260) * (14 + j * 5) : 0; fgRock(cx + Math.round(fg.ix - wx) + X[j % 5] - 5, gy - 2 - (j % 2 ? 4 : 0) - up, j); } }
}
function fgDrawAir(now, cx) {      // over the fighters: what he grabbed hangs next to him, and what he threw flies
  if (fg && fg.items.length) for (const it of fg.items) { const x = Math.round(cx + it.hx + Math.sin(now / 260 + it.ph) * 2), y = Math.round(gy - it.hy - Math.sin(now / 310 + it.ph) * 2); if (it.k === 'rock') fgRock(x, y, it.v); else { const s = twSprite(it.k, it.v), K = TW_K[it.k]; ctx.save(); ctx.translate(x, y); ctx.rotate(Math.sin(now / 400 + it.ph) * 0.25); ctx.drawImage(s.c, -s.ox, -s.by + (K.h >> 1)); ctx.restore(); } }
  for (const p of fgFly) { const x = Math.round(cx + p.x - wx), y = Math.round(gy - p.y); if (p.k === 'rock') { fgRock(x, y, p.v); ctx.fillStyle = 'rgba(255,255,255,0.35)'; ctx.fillRect(x - p.dir * 8, y, 5, 1); } else { const s = twSprite(p.k, p.v), K = TW_K[p.k]; ctx.save(); ctx.translate(x, y); ctx.rotate(p.rot); ctx.drawImage(s.c, -s.ox, -s.by + (K.h >> 1)); ctx.restore(); ctx.fillStyle = 'rgba(255,255,255,0.35)'; ctx.fillRect(x - p.dir * 12, y, 6, 1); } }
}
