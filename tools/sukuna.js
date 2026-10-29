// ---------------------------------------------------------------- v1.107 SUKUNA (v1.108: he walks, jumps and crouches like Yuji; v1.109: his blows and his counter; v1.110: his crouch punches and his flying slashes): a fighter of FREE PLAY (this file is spliced into template.html by build_html.py, right after custom.js)
// He is a fighter of the custom kind (customScene in custom.js) whose drawings are made by tools/sukuna_art.py (build_html.py fills SUK_PNG with their picture strip: 15 rows of 15 pictures, the rows named in SUK_ROWS): his idle pictures, Yuji's own pictures of the walk, the jump, the crouch down, the crouched idle, the crouch walk, the two hooks (his jabs), the back dash (his dodge) and the two crouch punches, all with his head, and a kick and three slashes (right hand, left hand, both hands) made with Yuji's rig.
// He moves like Yuji (g.yu): he walks at 56 px/s forward and 38 back with Yuji's legs (walkVel) and his 15 walking pictures at 19 a second (backwards for walking back), jumps with Yuji's timing (jumpFrame) and height (YU.jump.lift) and the dust of his jump, can be steered in the air as Yuji can (pictures 3 to 11), crouches with S, C or the stick's down position (15 pictures at 48 a second, the same backwards to get up) and crouch-walks at 60% of the speed.
// His blows (ATTACK, one after the other within 0.7 s; a press during a blow is kept for 0.45 s): a RIGHT JAB, a LEFT JAB, a FACE KICK (a hop with a high kick) and the COUNTER. The three blows are punches of the custom kind (SU_ATK: their pictures, the picture each lands on, its damage; the limb of each impact, the part of the picture that reaches out, decides how far it reaches, like every custom punch). The COUNTER is not a blow: he stands still on his idle pictures (so that it does not look as if he is going to attack) for 2 s; if a swing of the enemy reaches him in that time he dodges it (a quick step back on the pictures of Yuji's back dash, and nothing touches him from then on), steps forward and SLASHES the enemy (the pictures of the slash; white and red slash across the enemy as in Yuji's cursed technique): the slash takes no health by itself, it makes the enemy BLEED for 4 s, 0.1 of health every 0.03 s (the bleeding of the enemy: dummy.bleed with dm, and quiet so that he does not flash white all the time). Without a swing the stance just ends after 2 s.
// v1.110: ATTACK picks by where he is: CROUCHED it plays Yuji's own two crouch punches in turn (his R.JAB, strip 30, 10 damage, and his L.UPPR, strip 31, 13 damage, with the names he gives them; 38 pictures a second; they reach a crouching enemy: o.low), STANDING with an enemy in front of him within SU_NEAR (60 px) it plays the combo above, and STANDING with NO enemy that close it throws SLASHES that fly: a slash with the right hand, then one with the left hand (6 damage each, they fly half as far as the X), then, if its 5 s are over, both hands at once: two slashes that cross as an X (12 damage each, 24 if both hit), which fly as far as the screen's edge; the X can be thrown once every 5 s (SU_THROW.cd), until then the 3rd press is another single slash (right, left, right, ...). All slashes fly for 0.6 s (a shot of the custom kind with its own life: ms), cannot be blocked (a guard break), are drawn by suSlashCv (a crescent, and the two diagonals of the X) and are thrown on the 8th picture of their animation (the slash of the counter for the right hand, tools/sukuna_art.py's slashL and slashX).
// He cannot crouch-jump, dash, block or be hurt in pictures yet (whatever is pressed is dropped, as for a custom fighter that has not drawn them), and his body is measured on his idle pictures like every custom fighter's (cuMeasure). His slot is 3, after the three that can be drawn, so cuSelRefresh leaves his card alone.
const SUK_WHO = 'cu3', SUK_PNG = '__SUKPNG__', SUK_ROWS = ['frames', 'walk', 'jump', 'cr', 'ci', 'cwk', 'a0', 'a1', 'a2', 'dg', 'a3', 'cp0', 'cp1', 'sl', 'sx'];      // (the rows of the picture strip: idle, walk, jump, crouch down, crouched idle, crouch walk, right jab, left jab, face kick, dodge, slash (the counter's and the right hand's), the two crouch punches, the left hand's slash and the slash of both hands; the names are those of the pictures of a custom fighter: a0 to a3 are its four punches)
const SU_ATK = [['R.JAB', 8, 0, 8, 6, 30], ['L.JAB', 8, 0, 8, 6, 30], ['FACE KICK', 16, 14, 6, 14, 30]];      // the three blows: name, damage, knock-back, the picture (1 - 15) the blow lands on, how far he steps forward (px), pictures a second (the jabs are Yuji's hooks, 30 a second, landing on his 8th picture; the kick lands its sole on the 6th)
const SU_KICK_LIFT = [0, 0, 0, 4, 9, 12, 12, 8, 4, 2, 0, 0, 0, 0, 0];      // how high the face kick hops (px) in each of its pictures (Yuji's kick to the head, the first of his three: the foot is 34 px above the ground in the picture and he is lifted 12 more: the height of a standing enemy's face)
const SU_NEAR = 60, SU_CP = [['R.JAB', 10, 7], ['L.UPPR', 13, 8]], SU_CP_FPS = 38, SU_THROW = { d: 6, share: 0.25, shareX: 0.5, lead: 24, ms: 600, cd: 5, fps: 45, hit: 8 };      // v1.110: an enemy this close in front (px) is punched, a further one slashed at; Yuji's crouch punches: name, damage (his hits 6 and 7: 10 and 13), the picture they land on (1 - 15), 38 pictures a second; the slashes: damage of a single slash (the X's are twice that), how much of the screen's width each flies from him in its 0.6 s (a single one a quarter, the X half: the screen's edge, since he stands in the middle), the lead the slash already has when it leaves (px: where it starts and where its middle is), its life (ms), the wait before the X can be thrown again (s), pictures a second and the picture it leaves the hand on
const SU_WAIT = 2000, SU_DODGE = { ms: 233, px: 30, from: 2, n: 7 }, SU_SLASH = { fps: 30, hit: 7, stand: 24, max: 80 }, SU_BLEED = { ms: 4000, gap: 30, dm: 0.1 };      // the counter: how long he waits (ms); the dodge (ms, how far back, the first picture of Yuji's back dash and how many are used); the slash (pictures a second, the picture the cut lands on, how far from the enemy he stops, the longest step) and the bleeding (ms, ms between two ticks, health a tick)
NAMES[SUK_WHO] = 'SUKUNA'; CEC[SUK_WHO] = ['#2a0a12', '#d02a3a', '#ffb0b8', '#ff7a86'];      // (his name on the HUD and his energy bar: crimson)
(() => {
  const im = new Image();
  im.onload = () => {      // the strip is cut into 64 x 64 pictures, a row for each move (until then he is not there: his card shows nothing and a match shows no picture)
    const n = Math.floor(im.width / 64), set = {}, arts = [], tipOf = a => { const sp = cuSpan(a, r => r - 1), o = {}; for (const r in sp) o[r] = sp[r][1]; return o; };      // (tipOf: how far each row of a picture reaches in front of his middle column)
    SUK_ROWS.forEach((k, r) => {
      set[k] = []; arts[r] = []; for (let i = 0; i < n; i++) {
        const c = document.createElement('canvas'); c.width = c.height = 64; const g = c.getContext('2d'); g.drawImage(im, i * 64, r * 64, 64, 64, 0, 0, 64, 64); set[k].push(c);
        arts[r].push(suAlpha(c));
      }
    });
    const body = cuWiden(arts[0].map(a => cuSpan(a, r => r - 1))), hs = Object.values(body).map(v => v[1]).sort((a, b) => a - b);      // (the widest every row gets over his idle pictures, and half as wide as his torso for the push, as in cuMeasure)
    const ev = [0, 1, 2, 3].map(k => {      // the impact of each blow (the slash's is only used for its reach): { f: its picture, k: 'i', d: damage, fx: knock-back and, if it hit, a hit stop and a shake, tip: the limb on the impact's pictures, dy: how high the body is then }
      const [, d, kn, f] = SU_ATK[k] || ['', 0, 0, 8], tips = arts[6 + k + (k === 3 ? 1 : 0)].map(tipOf), hop = k === 2 ? Math.max(SU_KICK_LIFT[f - 1], SU_KICK_LIFT[f]) : 0;
      const e = { f, k: 'i', d, sp: d, fx: (kn ? [['k', kn, 0, 0, -1]] : []).concat(k < 3 ? [['h', k === 2 ? 70 : 35, 0, 1, 0], ['w', k === 2 ? 4 : 2, 0, 1, 0]] : []), c: 0, src: -1, id: 0, dy: -hop }; e.tip = cuMaxRows([tips[f - 1], tips[f]]); return [e];
    });
    ev.push(...[0, 1].map(k => { const [, d, f] = SU_CP[k], tips = arts[11 + k].map(tipOf), e = { f, k: 'i', d, sp: d, fx: [['k', 8 / 6, 0, 0, -1], ['h', 30, 0, 1, 0]], c: 0, src: -1, id: 0, dy: 0, low: true }; e.tip = cuMaxRows([tips[f - 1], tips[f]]); return [e]; }));      // 4 and 5: the crouch punches: Yuji's knock-back of 8, a hit stop if they hit, and they reach a crouching enemy (low)
    const thrown = (d, share, vk, id) => ({ f: SU_THROW.hit, k: 'o', d, sp: () => (VW * share - SU_THROW.lead) / (SU_THROW.ms / 1000), ms: SU_THROW.ms, fx: [['q', 0, 0, 0, -1]], c: 0, src: -1, id, vk });      // (a slash that leaves the hand: its speed is a function of the screen's width, it cannot be blocked: q = a guard break, and it flies for ms)
    ev.push([thrown(SU_THROW.d, SU_THROW.share, 6, 0)], [thrown(SU_THROW.d, SU_THROW.share, 7, 0)], [thrown(SU_THROW.d * 2, SU_THROW.shareX, 9, 0), thrown(SU_THROW.d * 2, SU_THROW.shareX, 10, 1)]);      // 6 and 7: the single slashes, 8: the two slashes of the X (each with its own picture)
    const one = [0, 1].map(ph => suSlashCv(0, ph)), up = [0, 1].map(ph => suSlashCv(1, ph)), dn = [0, 1].map(ph => suSlashCv(2, ph)), vfx = Array.from({ length: 11 }, () => []), vxs = Array.from({ length: 11 }, () => []), spans = l => l.map(c => cuSpan(suAlpha(c), r => r - 2));
    vfx[6] = vfx[7] = one; vfx[9] = up; vfx[10] = dn; vxs[6] = vxs[7] = spans(one); vxs[9] = spans(up); vxs[10] = spans(dn);      // (the pictures of the flying slashes and the rows each covers, for the touch with the enemy)
    CU_GAME[3] = { name: 'SUKUNA', frames: set.frames, walk: set.walk, jump: set.jump, hu: [], ko: [], bl: [], df: [], db: [], cr: set.cr, ci: set.ci, cwk: set.cwk, st: { ...cuStats(null), fw: FWD_SPEED, bk: BACK_SPEED, cw: 60, jh: 22, jt: 713 }, vfx, atk: [set.a0, set.a1, set.a2, set.a3, set.cp0, set.cp1, set.a3, set.sl, set.sx], an: SU_ATK.map(a => a[0]).concat('COUNTER', SU_CP.map(a => a[0]), 'R.SLASH', 'L.SLASH', 'X SLASH'), rdy: [0, 1, 2, 3], ev, set: [0, 1, 2, 3].map(k => ({ v: k < 3 ? SU_ATK[k][5] : 30, m: k < 3 ? SU_ATK[k][4] : 0, c: 0, d: 0 })).concat([SU_CP_FPS, SU_CP_FPS, SU_THROW.fps, SU_THROW.fps, SU_THROW.fps].map((v, i) => ({ v, m: 0, c: 0, d: i === 4 ? SU_THROW.cd : 0 }))), body, push: Math.max(5, hs.length ? hs[hs.length >> 1] : 5),
      tipAll: ev.map(l => cuMaxRows(l.map(e => e.tip))), vxs, dg: set.dg, al: [null, null, SU_KICK_LIFT, null, null, null, null, null, null], cs: null, yu: true, wf: WALK_FPS, crMs: 1000 / CR_FPS };      // (the blows: 0 R.JAB, 1 L.JAB, 2 FACE KICK, 3 COUNTER, 4 R.JAB and 5 L.UPPR crouched, 6 R.SLASH, 7 L.SLASH, 8 X SLASH; yu: he moves like Yuji; wf: his walking pictures a second; crMs: how long a picture of the crouch lasts; al: the height of each picture of a blow that hops; cs: the counter in progress; dg: the pictures of the dodge; the stats are Yuji's: 56 and 38 px/s, 60% while crouched, a jump of 22 px, 713 ms of flight)
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

// ---- v1.110 which blow ATTACK plays, and the pictures of the flying slashes
function suAlpha(cv) { const d = cv.getContext('2d').getImageData(0, 0, 64, 64).data, a = new Uint8Array(4096); for (let q = 0; q < 4096; q++) a[q] = d[q * 4 + 3] > 127 ? 1 : 0; return a; }      // (which pixels of a 64 x 64 canvas are there)
function suSlashCv(kind, ph) {      // a picture of a flying slash on a 64 x 64 canvas, around column 40 and row 34 (chest height: a shot is drawn 62 px above the floor line): kind 0 = a crescent that bulges forward (a single slash), 1 = a diagonal "/" and 2 = a diagonal "\" (the two slashes of the X); a white core, a pink and a red edge, a dark rim, thin at the tips, with faint streaks behind it; ph 0 and 1 differ in the streaks
  const c = document.createElement('canvas'); c.width = c.height = 64; const g = c.getContext('2d'), H = 14, at = t => kind === 0 ? 40 + 8 * (1 - (t / H) * (t / H)) : 40 + (kind === 1 ? -t : t) * 0.55;
  const dot = (x, y, col, a) => { g.globalAlpha = a; g.fillStyle = col; g.fillRect(Math.round(x), Math.round(y), 1, 1); };
  for (let i = 0; i < 6; i++) { const y = 34 + (i - 2.5) * 4.6 + (ph ? 1 : -1), len = 5 + (i * 3 + ph * 2) % 6, xe = at(Math.max(-H, Math.min(H, y - 34))) - 4; for (let k = 0; k < len; k++) dot(xe - k, y, '#eeeeff', 0.5 * (1 - k / len)); }      // (the streaks it leaves behind)
  for (let q = 0; q <= 4 * H; q++) {
    const u = q / (4 * H), t = (u - 0.5) * 2 * H, x = at(t), y = 34 + t, w = 1.2 + 1.8 * Math.sin(Math.PI * u);
    for (let dx = -Math.ceil(w) - 1; dx <= Math.ceil(w) + 1; dx++) { const d = Math.abs(dx); if (d > w + 0.9) continue; dot(x + dx, y, d <= w * 0.3 ? '#ffffff' : d <= w * 0.65 ? '#ffc0c8' : d <= w * 0.95 ? '#ff2a3a' : '#12030a', 1); }
  }
  dot(at(-H) + 1, 34 - H - 1, '#ffffff', ph ? 1 : 0.6); dot(at(H) + 1, 34 + H + 1, '#ffffff', ph ? 0.6 : 1);      // (a glint at each tip)
  g.globalAlpha = 1; return c;
}
function suNear() {      // is a living enemy standing in front of him within SU_NEAR px (a punch makes sense)?
  for (const f of foesOf()) if (f.ko < 0 && !f.cap && f.x - wx >= -4 && f.x - wx <= SU_NEAR) return true;
  return false;
}
function suPick(g, now) {      // the blow ATTACK plays now: crouched, the crouch punches in turn; standing with an enemy near, the combo (jab, jab, kick, counter); standing with none near, the slashes: right hand, left hand, then both hands if the 5 s of the X are over (otherwise another single slash)
  if (stance === 'crouch') return 4 + cuCp;
  if (suNear()) return g.rdy[cuCmb % g.rdy.length];
  return cuSn >= 2 && now >= (cuCd[8] || 0) ? 8 : 6 + (cuSn % 2);
}
function suNext(k) {      // blow k has started: the index of the combo that comes next (each chain keeps its own place)
  if (k < 3) return (k + 1) % 4;
  if (k === 4 || k === 5) cuCp = k === 4 ? 1 : 0; else if (k === 8) cuSn = 0; else cuSn++;
  return cuCmb;
}
function suLabel(g, now) {      // what the ATTACK button says: the blow that comes next
  const fresh = now > cuCmbBy;
  if (stance === 'crouch') return g.an[4 + (fresh ? 0 : cuCp)];
  if (suNear()) return g.an[g.rdy[(fresh ? 0 : cuCmb) % g.rdy.length]];
  const sn = fresh ? 0 : cuSn; return sn >= 2 && now >= (cuCd[8] || 0) ? g.an[8] : g.an[6 + (sn % 2)];
}
