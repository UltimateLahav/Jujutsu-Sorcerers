// ---------------------------------------------------------------- v1.107 SUKUNA (v1.108: he walks, jumps and crouches like Yuji; v1.109: his blows and his counter): a fighter of FREE PLAY (this file is spliced into template.html by build_html.py, right after custom.js)
// He is a fighter of the custom kind (customScene in custom.js) whose drawings are made by tools/sukuna_art.py (build_html.py fills SUK_PNG with their picture strip: 11 rows of 15 pictures, the rows named in SUK_ROWS): his idle pictures, Yuji's own pictures of the walk, the jump, the crouch down, the crouched idle, the crouch walk, the two hooks (his jabs) and the back dash (his dodge), all with his head, and a kick and a slash made with Yuji's rig.
// He moves like Yuji (g.yu): he walks at 56 px/s forward and 38 back with Yuji's legs (walkVel) and his 15 walking pictures at 19 a second (backwards for walking back), jumps with Yuji's timing (jumpFrame) and height (YU.jump.lift) and the dust of his jump, can be steered in the air as Yuji can (pictures 3 to 11), crouches with S, C or the stick's down position (15 pictures at 48 a second, the same backwards to get up) and crouch-walks at 60% of the speed.
// His blows (ATTACK, one after the other within 0.7 s; a press during a blow is kept for 0.45 s): a RIGHT JAB, a LEFT JAB, a FACE KICK (a hop with a high kick) and the COUNTER. The three blows are punches of the custom kind (SU_ATK: their pictures, the picture each lands on, its damage; the limb of each impact, the part of the picture that reaches out, decides how far it reaches, like every custom punch). The COUNTER is not a blow: he stands still on his idle pictures (so that it does not look as if he is going to attack) for 2 s; if a swing of the enemy reaches him in that time he dodges it (a quick step back on the pictures of Yuji's back dash, and nothing touches him from then on), steps forward and SLASHES the enemy (the pictures of the slash; white and red slash across the enemy as in Yuji's cursed technique): the slash takes no health by itself, it makes the enemy BLEED for 4 s, 0.1 of health every 0.03 s (the bleeding of the enemy: dummy.bleed with dm, and quiet so that he does not flash white all the time). Without a swing the stance just ends after 2 s.
// He cannot crouch-jump, dash, block or be hurt in pictures yet (whatever is pressed is dropped, as for a custom fighter that has not drawn them), and his body is measured on his idle pictures like every custom fighter's (cuMeasure). His slot is 3, after the three that can be drawn, so cuSelRefresh leaves his card alone.
const SUK_WHO = 'cu3', SUK_PNG = '__SUKPNG__', SUK_ROWS = ['frames', 'walk', 'jump', 'cr', 'ci', 'cwk', 'a0', 'a1', 'a2', 'dg', 'a3'];      // (the rows of the picture strip: idle, walk, jump, crouch down, crouched idle, crouch walk, right jab, left jab, face kick, dodge, slash; the names are those of the pictures of a custom fighter: a0 to a3 are its four punches)
const SU_ATK = [['R.JAB', 8, 0, 8, 6, 30], ['L.JAB', 8, 0, 8, 6, 30], ['FACE KICK', 16, 14, 6, 14, 30]];      // the three blows: name, damage, knock-back, the picture (1 - 15) the blow lands on, how far he steps forward (px), pictures a second (the jabs are Yuji's hooks, 30 a second, landing on his 8th picture; the kick lands its sole on the 6th)
const SU_KICK_LIFT = [0, 0, 0, 4, 9, 12, 12, 8, 4, 2, 0, 0, 0, 0, 0];      // how high the face kick hops (px) in each of its pictures (Yuji's kick to the head, the first of his three: the foot is 34 px above the ground in the picture and he is lifted 12 more: the height of a standing enemy's face)
const SU_WAIT = 2000, SU_DODGE = { ms: 233, px: 30, from: 2, n: 7 }, SU_SLASH = { fps: 30, hit: 7, stand: 24, max: 80 }, SU_BLEED = { ms: 4000, gap: 30, dm: 0.1 };      // the counter: how long he waits (ms); the dodge (ms, how far back, the first picture of Yuji's back dash and how many are used); the slash (pictures a second, the picture the cut lands on, how far from the enemy he stops, the longest step) and the bleeding (ms, ms between two ticks, health a tick)
NAMES[SUK_WHO] = 'SUKUNA'; CEC[SUK_WHO] = ['#2a0a12', '#d02a3a', '#ffb0b8', '#ff7a86'];      // (his name on the HUD and his energy bar: crimson)
(() => {
  const im = new Image();
  im.onload = () => {      // the strip is cut into 64 x 64 pictures, a row for each move (until then he is not there: his card shows nothing and a match shows no picture)
    const n = Math.floor(im.width / 64), set = {}, arts = [], none = () => [[], [], [], []], tipOf = a => { const sp = cuSpan(a, r => r - 1), o = {}; for (const r in sp) o[r] = sp[r][1]; return o; };      // (tipOf: how far each row of a picture reaches in front of his middle column)
    SUK_ROWS.forEach((k, r) => {
      set[k] = []; arts[r] = []; for (let i = 0; i < n; i++) {
        const c = document.createElement('canvas'); c.width = c.height = 64; const g = c.getContext('2d'); g.drawImage(im, i * 64, r * 64, 64, 64, 0, 0, 64, 64); set[k].push(c);
        const d = g.getImageData(0, 0, 64, 64).data, a = new Uint8Array(4096); for (let q = 0; q < 4096; q++) a[q] = d[q * 4 + 3] > 127 ? 1 : 0; arts[r].push(a);
      }
    });
    const body = cuWiden(arts[0].map(a => cuSpan(a, r => r - 1))), hs = Object.values(body).map(v => v[1]).sort((a, b) => a - b);      // (the widest every row gets over his idle pictures, and half as wide as his torso for the push, as in cuMeasure)
    const ev = [0, 1, 2, 3].map(k => {      // the impact of each blow (the slash's is only used for its reach): { f: its picture, k: 'i', d: damage, fx: knock-back and, if it hit, a hit stop and a shake, tip: the limb on the impact's pictures, dy: how high the body is then }
      const [, d, kn, f] = SU_ATK[k] || ['', 0, 0, 8], tips = arts[6 + k + (k === 3 ? 1 : 0)].map(tipOf), hop = k === 2 ? Math.max(SU_KICK_LIFT[f - 1], SU_KICK_LIFT[f]) : 0;
      const e = { f, k: 'i', d, sp: d, fx: (kn ? [['k', kn, 0, 0, -1]] : []).concat(k < 3 ? [['h', k === 2 ? 70 : 35, 0, 1, 0], ['w', k === 2 ? 4 : 2, 0, 1, 0]] : []), c: 0, src: -1, id: 0, dy: -hop }; e.tip = cuMaxRows([tips[f - 1], tips[f]]); return [e];
    });
    CU_GAME[3] = { name: 'SUKUNA', frames: set.frames, walk: set.walk, jump: set.jump, hu: [], ko: [], bl: [], df: [], db: [], cr: set.cr, ci: set.ci, cwk: set.cwk, st: { ...cuStats(null), fw: FWD_SPEED, bk: BACK_SPEED, cw: 60, jh: 22, jt: 713 }, vfx: none(), atk: [set.a0, set.a1, set.a2, set.a3], an: SU_ATK.map(a => a[0]).concat('COUNTER'), rdy: [0, 1, 2, 3], ev, set: [0, 1, 2, 3].map(k => ({ v: k < 3 ? SU_ATK[k][5] : 30, m: k < 3 ? SU_ATK[k][4] : 0, c: 0, d: 0 })), body, push: Math.max(5, hs.length ? hs[hs.length >> 1] : 5),
      tipAll: ev.map(l => cuMaxRows(l.map(e => e.tip))), vxs: none(), dg: set.dg, al: [null, null, SU_KICK_LIFT, null], cs: null, yu: true, wf: WALK_FPS, crMs: 1000 / CR_FPS };      // (yu: he moves like Yuji; wf: his walking pictures a second; crMs: how long a picture of the crouch lasts; al: the height of each picture of a blow that hops; cs: the counter in progress; dg: the pictures of the dodge; the stats are Yuji's: 56 and 38 px/s, 60% while crouched, a jump of 22 px, 713 ms of flight)
  };
  im.src = SUK_PNG;
})();

// ---- the COUNTER (the 4th blow): g.cs = null, { ph: 'wait', t0 } (he stands still), { ph: 'dodge', t0, done } (the step back) or { ph: 'slash', t0, done, dx, hit } (the step forward and the cut); cuAtkAt >= 0 all the time keeps every other action out (as for any blow)
function suStart(g, now) {      // ATTACK as the 4th blow: he waits (his idle pictures)
  g.cs = { ph: 'wait', t0: now }; cuAtkK = 3; cuAtkAt = now; cuLunged = 0; cuCmb = 0; cuCmbBy = now + 1e9; cuFired = []; cuRes = [];
  say('COUNTER', wx, '#ff7a86', 8, now); snd('ceon');
}
function suEnd(g, now) { g.cs = null; cuAtkAt = -1; cuCmb = 0; cuCmbBy = now + 500; }
function suHit(now) {      // a swing of the enemy reaches him (gojoHit): true = it misses; waiting he dodges it, and until the cut has landed nothing touches him
  const g = CU_GAME[3], c = g && g.cs; if (!c || vs.me !== SUK_WHO) return false;
  if (c.ph === 'wait') { c.ph = 'dodge'; c.t0 = now; c.done = 0; snd('dash', 1); puff(wx + 4, 5); say('DODGE!', wx, '#9fd8ff', 8, now); return true; }
  return c.ph === 'dodge' || !c.hit;
}
function suCut(g, c, now) {      // the cut lands: a white and red slash across the enemy and, if he can be touched (he is not blocking, down or out of reach), a flinch and the bleeding
  c.hit = true; const d = dummy; snd('c6scrape'); snd('smack', 3); tqFx.push({ k: 'slash', x: d ? d.x : wx + 24, real: performance.now() });
  const e = g.ev[3][0], B = d && hbBody(hbKey(d));
  if (cuHit(0, now, { free: true, knock: 6 }, undefined, e.tip && B ? hbGap(e.tip, B, 0) : undefined)) {
    d.bleed = { until: now + SU_BLEED.ms, next: now + SU_BLEED.gap, gap: SU_BLEED.gap, dm: SU_BLEED.dm, quiet: true };      // (it ticks in updateFighter's bleeding: 133 times 0.1 of health in 4 s; a second cut starts the four seconds again)
    say('BLEEDING', d.x, '#ff3a4a', 8, now + 90); tqBlood(d.x - 4, gy - 34, 26, 1); shakeUntil = now + 140; shakeAmp = 3; hitStop(60);
  }
}
function suStep(g, now) {      // every frame of the counter: the state moves on, he moves, and the picture to show (null: his idle pictures)
  const c = g.cs; if (!c) return null;
  if (vs.ph !== 'fight') { suEnd(g, now); return null; }
  const t = now - c.t0;
  if (c.ph === 'wait') { if (t >= SU_WAIT) suEnd(g, now); return null; }
  if (c.ph === 'dodge') {
    const k = Math.min(1, t / SU_DODGE.ms), tg = -SU_DODGE.px * (1 - Math.pow(1 - k, 2)); wx += tg - c.done; c.done = tg;
    if (k >= 1) { c.ph = 'slash'; c.t0 = now; c.done = 0; c.dx = Math.max(0, Math.min(SU_SLASH.max, (dummy ? dummy.x - wx : 60) - SU_SLASH.stand)); snd('swing', 3); }
    return g.dg[SU_DODGE.from + Math.min(SU_DODGE.n - 1, Math.floor(k * SU_DODGE.n))];
  }
  const f = Math.floor(t * SU_SLASH.fps / 1000), k = Math.min(1, t / (SU_SLASH.hit * 1000 / SU_SLASH.fps)), tg = c.dx * (1 - Math.pow(1 - k, 2)); wx += tg - c.done; c.done = tg;      // (the step forward takes until the cut)
  if (!c.hit && f >= SU_SLASH.hit) suCut(g, c, now);
  if (f >= g.atk[3].length) { suEnd(g, now); return null; }
  return g.atk[3][f];
}
let suDrop = 0;
function suBleedFx(now) {      // every frame: the bleeding of the enemy goes on (vpBleed ticks dummy.bleed; the scenes of the others call it, the custom scene did not need it before) and drops fly off him (about 7 a second)
  vpBleed(now); const d = dummy; if (!d || !d.bleed || !d.bleed.quiet || d.ko >= 0 || now < suDrop) return;
  suDrop = now + 140; spark(d.x + Math.random() * 6 - 3, gy - 20 - Math.random() * 24, 1, ['#c4121c', '#ff2a3a'], false, Math.random() < 0.5 ? 1 : -1);
}
