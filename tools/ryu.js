// ---------------------------------------------------------------- v1.144 RYU ISHIGORI (this file is spliced into template.html by build_html.py, right after sukuna.js)
// A fighter of FREE PLAY of the custom kind (customScene in custom.js): his pictures are made by tools/ryu_art.py out of the LOOK the user chose (tools/ryu_src/master.png: face, hair, fur, jacket, belt, jeans, boots; the picture is only his look, every pose
// is new: tools/ryu_parts.py cuts it into a body that bends at the waist and the knees, with hair, fur, jacket tail and cuffs that swing on their own). build_html.py fills RYU_PNG with the picture strip: 29 rows of 15 pictures, the rows named in RYU_ROWS.
// He is slot 4 of CU_GAME (the three slots of the drawings and Sukuna come first) and moves like Yuji (g.ry: the jump, the walk and the push of the legs are Yuji's, see customScene) but is a big, heavy man: he walks at 46 px/s forward and 34 back with
// STOMPING steps (dust, a step sound and a hair of screen shake on every one), his DASH is a 0.2 s shoulder charge and his BLOCK is a high guard with both hands; he has HURT and K.O. pictures.
// v1.163 BLUE (the button is back for him): standing a hard POWER PUNCH, in the air a DIVE PUNCH, holding forward a 5-HIT COMBO, and DASH right after the punch or the combo is a DASH KICK; see 'his BLUE moves' below.
// His blows (ATTACK): standing still, a CHAIN within 0.7 s: LEFT HOOK (boxing), RIGHT HOOK, KICK UP (capoeira: the enemy is thrown up) and JUMP PUNCH (an anime flying punch: it hits the enemy who was kicked up and sends him flying forward); CROUCHED (one knee down) a
// Muay Thai kick at the enemy's LEGS; in the AIR a pro-wrestling DOWNSLAM (both fists drive down onto the enemy); holding FORWARD a karate HARD PUNCH (a lunge: the enemy is sent back); holding BACK a Muay Thai FRONT KICK. ATTACK pressed during a blow is kept for 0.45 s.
const RYU_WHO = 'cu4', RYU_PNG = '__RYUPNG__', RYU_ROWS = ['frames', 'walk', 'wback', 'jump', 'cr', 'ci', 'cwk', 'bl', 'dg', 'db', 'a0', 'a1', 'a2', 'a3', 'cp', 'as', 'hp', 'fk', 'hu', 'ko', 'uc', 'el', 'bp', 'dv', 'dk', 'hb', 'hs', 'hf', 'hl'];      // (idle, walk, walk back, jump, crouch down, crouched idle, crouch walk, block, dash, dash back, the four chain blows, the leg kick, the downslam, the hard punch, the front kick, hurt, K.O.; v1.163: the uppercut, the elbow, the blue punch, the dive punch, the dash kick; v1.164: four more hurt pictures: doubled over, a stagger, a fall, the legs buckling)
const RY_MV = [      // the blows: name, row, damage, the picture (1 - 15) it lands on, pictures a second, how far he steps forward (px), knock-back (x 6 = the enemy's speed in px/s: 100 sends him ~85 px, 140 ~130 px), launch (px high at the top), stun (s), shake, hit stop (ms), dn = he is put on the floor (a sweep / a slam)
  { n: 'L.HOOK', r: 'a0', d: 8, f: 8, v: 38, m: 4, kn: 10, l: 0, st: 0, w: 2, h: 40, rx: 5, sy: 38 },
  { n: 'R.HOOK', r: 'a1', d: 9, f: 8, v: 38, m: 4, kn: 14, l: 0, st: 0, w: 2, h: 45, rx: 6, sy: 38 },
  { n: 'KICK UP', r: 'a2', d: 14, f: 7, v: 32, m: 0, kn: 8, l: 44, st: 0, w: 3, h: 70, sy: 30 },
  { n: 'JUMP PUNCH', r: 'a3', d: 18, f: 8, v: 30, m: 24, kn: 140, l: 8, st: 0, w: 4, h: 80, rx: 3, sy: 36 },
  { n: 'LEG KICK', r: 'cp', d: 11, f: 7, v: 34, m: 6, kn: 15, l: 0, st: 0, w: 2, h: 50, low: true, dn: true, sy: 10 },
  { n: 'DOWNSLAM', r: 'as', d: 17, f: 7, v: 30, m: 0, kn: 10, l: 0, st: 0, w: 4, h: 80, dn: true, sy: 44 },
  { n: 'HARD PUNCH', r: 'hp', d: 16, f: 8, v: 30, m: 8, kn: 100, l: 0, st: 0, w: 4, h: 80, rx: 3, sy: 36 },
  { n: 'FRONT KICK', r: 'fk', d: 12, f: 7, v: 32, m: 6, kn: 40, l: 0, st: 0, w: 3, h: 60, rx: 1, sy: 28 },
  { n: 'POWER PUNCH', r: 'bp', d: 28, f: 9, v: 30, m: 16, e: 1, lt: .6, kn: 105, l: 0, st: 0, w: 5, h: 100, x: 2, cd: .7, rx: 3, sy: 36 },      // (v1.163 his BLUE moves, see ryBlue: e = the step forward is fast at first, lt = how much of the blow it takes, x = the burst of blue light (1 on the enemy, 2 twice as big), cd = cooldown (s))
  { n: 'DIVE PUNCH', r: 'dv', d: 26, f: 9, v: 30, m: 0, e: 1, lt: .45, kn: 6, l: 0, st: 1.4, w: 5, h: 90, dn: true, x: 1, cd: 3, sy: 46, nm: 1 },      // (m is set when it starts: the way to the enemy; he is put on the floor and stunned)
  { n: '5-HIT COMBO', combo: true, v: 40, m: 34, cd: 2.5 },      // (cut out of five blows, see RY_COMBO)
  { n: 'DASH KICK', r: 'dk', d: 24, f: 8, v: 34, m: 80, e: 1, lt: .45, kn: 170, l: 0, st: 0, w: 5, h: 110, x: 2, cd: 1.5, rx: 3, sy: 30 }];      // (DASH right after a blue punch or a blue combo)
const RY_COMBO = [      // the 5-HIT COMBO: right hook, left hook, uppercut, kick, and an elbow that pushes the enemy back; each is the row's pictures a to b (1 - 15) of the blow, f = the picture it lands on, kn = knock-back (the first four only nudge the enemy, so he stays in reach)
  { r: 'a1', a: 5, b: 10, f: 8, d: 7, kn: 4, w: 2, h: 40, x: 1, rx: 6, sy: 38 }, { r: 'a0', a: 5, b: 10, f: 8, d: 7, kn: 4, w: 2, h: 40, x: 1, rx: 5, sy: 38 }, { r: 'uc', a: 5, b: 11, f: 8, d: 10, kn: 5, l: 14, w: 3, h: 55, x: 1, sy: 40 },
  { r: 'fk', a: 4, b: 10, f: 7, d: 9, kn: 10, w: 3, h: 55, x: 1, rx: 1, sy: 28 }, { r: 'el', a: 5, b: 11, f: 8, d: 14, kn: 95, w: 5, h: 100, x: 2, rx: 2, sy: 38 }];
const RY_DIVE_HI = 34;      // (how high above the floor he is when the dive punch lands)
const RY_HOP = [0, 0, 0, 6, 15, 24, 30, 30, 26, 20, 12, 6, 0, 0, 0];      // the hop of the JUMP PUNCH (px, picture by picture)
let ryUI = false;      // (is Ryu's HUD on: the buttons he does not use are hidden, see tick)
const RY_WF = 16, RY_STEP = { fw: [0, 7], bk: [14, 7] };      // (RY_STEP: the pictures of the walk (and of the walk back) on which a foot comes down, see ryu_art.py)
const RY_HU_MS = 24;      // (a picture of his HURT lasts 24 ms: 15 pictures = 0.36 s)      // his walking pictures a second (a slow, heavy stride)
NAMES[RYU_WHO] = 'RYU'; CEC[RYU_WHO] = ['#10142a', '#3a58c8', '#a8c0f0', '#7aa0ff'];      // (his name on the HUD and his energy bar: steel blue)
(() => {
  const im = new Image();
  im.onload = () => {      // the strip is cut into 64 x 64 pictures, a row for each animation (until then he is not there: his card shows nothing)
    const n = Math.floor(im.width / 64), set = {}, arts = {}, tipOf = a => { const sp = cuSpan(a, r => r - 1), o = {}; for (const r in sp) o[r] = sp[r][1]; return o; };      // (tipOf: how far each row of a picture reaches in front of his middle column)
    RYU_ROWS.forEach((k, r) => {
      set[k] = []; arts[k] = []; for (let i = 0; i < n; i++) { const c = document.createElement('canvas'); c.width = c.height = 64; c.getContext('2d').drawImage(im, i * 64, r * 64, 64, 64, 0, 0, 64, 64); set[k].push(c); arts[k].push(suAlpha(c)); }
    });
    const body = cuWiden(arts.frames.map(a => cuSpan(a, r => r - 1))), hs = Object.values(body).map(v => v[1]).sort((a, b) => a - b);      // (the widest every row gets over his idle pictures, and half as wide as his torso for the push)
    const hit = (r, fr, f, id, o) => {      // one impact: f = the picture of the blow it comes on, fr = the picture of the row it lands on (the limb on that picture and the next gives the reach), id = its place in cuRes; { f: its picture, k: 'i', d: damage, fx: knock-back, launch, stun and, if it hit, a hit stop, a shake and the blue burst, tip: the limb on the impact's pictures, dy: how high the body is then }
      const tips = arts[r].map(tipOf), fx = [['k', o.kn, 0, 0, -1]].concat(o.l ? [['l', o.l, 0, 0, -1]] : [], o.st ? [['t', o.st, 0, 0, -1]] : [], [['h', o.h, 0, 1, id], ['w', o.w, 0, 1, id]], o.dn ? [['d', 0, 0, 1, id]] : [], o.x ? [['x', o.x, 0, 1, id]] : [], o.rx !== undefined ? [['r', o.rx, 0, 0, -1]] : [], o.sy ? [['y', o.sy, 0, 0, -1]] : []);
      const e = { f, k: 'i', d: o.d, sp: o.d, fx, c: 0, src: -1, id }; Object.defineProperty(e, 'dy', { get: () => Math.round(((dummy && dummy.airH) || 0) - (gojoLift || 0)), enumerable: true }); if (o.low) e.low = true;      // (dy: how many rows higher the enemy's body is than his limb: an enemy thrown up, or he himself in the air, is met where they are NOW)
      e.tip = cuMaxRows([tips[fr - 1], tips[fr]]); return e;
    };
    const cb = (f, fn, c, src, id) => ({ f, k: 'cb', cb: fn, c, src, id }), blow = (r, fr, f, id, o) => [hit(r, fr, f, id, o), cb(f, now => ryOnHit(now, o), 1, id), cb(f, now => ryOnMiss(now), 2, id)];      // (blow: an impact and what he feels when it lands (a push back, dust) or does not (off balance))      // (a callback of a blow's timeline: it runs when its picture comes up, and, with c = 1, only if the impact src hit)
    const comboPics = [], comboEv = []; { let off = 0; RY_COMBO.forEach((q, j) => { if (j) comboEv.push(cb(off + 1, () => snd('swing', j === 3 ? 3 : 0))); comboEv.push(...blow(q.r, q.f, off + q.f - q.a + 1, j, q)); for (let i = q.a - 1; i < q.b; i++) comboPics.push(set[q.r][i]); off += q.b - q.a + 1; }); comboEv.push(cb(comboEv[comboEv.length - 1].f, now => { ryBlImp = now; })); }      // (the 5-HIT COMBO is the pictures a to b of five blows one after the other: the impact of each is on its own picture, the last callback marks the end of the combo for the DASH KICK)
    const ev = RY_MV.map((mv, k) => {
      if (mv.combo) return comboEv;
      const e = blow(mv.r, mv.f, mv.f, 0, mv);
      if (k === 8) e.push(cb(mv.f, now => { ryBlImp = now; }));      // (the blue punch has landed: a DASH now is the DASH KICK; the combo's last callback does the same)
      if (k === 9) { e.push(cb(mv.f, () => ryDust(dummy ? dummy.x : wx + 20, 1), 1, 0, 1)); e.push(cb(mv.f + 2, now => { snd('land', 1); ryLand(now); ryDust(wx, .5); }, 0, -1, 2)); }      // (the dive punch: smoke where the enemy hits the floor, then he lands)
      return e;
    });
    const burst = ryBurst(), vfx = RY_MV.map(m => m.x || m.combo ? burst : []);
    CU_GAME[4] = { name: 'RYU', frames: set.frames, walk: set.walk, wbk: set.wback, jump: set.jump, hu: set.hu, hus: ryHus(set), ko: set.ko, huMs: RY_HU_MS, bl: set.bl, df: set.dg, db: set.db, cr: set.cr, ci: set.ci, cwk: set.cwk, st: { ...cuStats(null), fw: 46, bk: 34, cw: 55, jh: 22, jt: 713, dfw: 62, dbk: 40, dtm: 200, hp: 340 }, vfx, atk: RY_MV.map(m => m.combo ? comboPics : set[m.r]),
      an: RY_MV.map(m => m.n), rdy: [0, 1, 2, 3], cl: [], ev, set: RY_MV.map(m => ({ v: m.v, m: m.m, c: 0, d: m.cd || 0, e: m.e, lt: m.lt, nm: m.nm })), body, push: Math.max(6, hs.length ? hs[hs.length >> 1] : 6), tipAll: ev.map(l => cuMaxRows(l.map(e => e.tip))), vxs: vfx.map(() => []),
      al: RY_MV.map((m, k) => k === 3 ? RY_HOP : null), cs: null, ry: true, wf: RY_WF, crMs: 1000 / CR_FPS };      // (ry: he moves like Yuji and picks his blow by what is held, see ryPick; wbk: the pictures of walking back; wf: his walking pictures a second; crMs: how long a picture of the crouch lasts; al: the height of each picture of a blow that hops)
  };
  im.src = RYU_PNG;
})();

// ---- which blow ATTACK plays now: in the air the downslam, crouched the kick at the legs, holding BACK the front kick, holding FORWARD the hard punch, otherwise the next of the chain
const ryAir = now => { const jf = jumpFrame(Math.max(0, now - cuJumpAt)); return cuJumpAt >= 0 && jf >= 4 && jf <= 11; };      // (he is in the air: after the push-off and before the landing)
function ryPick(g, now, cmb) {
  if (cuJumpAt >= 0) return 5;
  if (stance === 'crouch') return 4;
  if (keyL || padL) return 7;
  if (keyR || padR) return 6;
  return g.rdy[(cmb === undefined ? cuCmb : cmb) % g.rdy.length];
}
function ryNext(k) { return k < 4 ? (k + 1) % 4 : cuCmb; }      // (blow k has started: the chain goes on with the next one; the other blows leave its place alone)
function ryLabel(g, now) { return g.an[ryPick(g, now, now > cuCmbBy ? 0 : cuCmb)]; }      // (what the ATTACK button says: the blow that comes next)

// ---- v1.164 CONTACT: a blow touches the enemy, and both of them feel it
const RY_CLOSE = 30, RY_CLOSE_V = 450;      // (the most he steps in for a blow, px, and how fast, px/s)
let ryStepAt = -1, ryMissAt = -1;      // (the blow (cuAtkAt) whose step-in dust has been made / whose miss has been felt: once for a whole move)
function ryMagnet(g, ap, dt) {      // before a blow lands he closes in on the enemy: the way still to go is what the enemy's body and the limb on the impact's picture ask for (hbGap), less what the blow's own step will still cover; the fist or foot then touches him, within RY_CLOSE px of steps; farther away the blow misses
  if (!dummy || dummy.ko >= 0 || !(dt > 0) || g.set[cuAtkK].nm) return;      // (nm: the dive punch flies to a place just above the enemy by itself)
  const ev = g.ev[cuAtkK], j = ev.findIndex((e, q) => e.k === 'i' && !cuFired[q]); if (j < 0) return;
  const e = ev[j], B = hbBody(hbKey(dummy)); if (!B || !e.tip) return;
  const rc = hbGap(e.tip, B, e.dy); if (rc < -1e8) return;      // (the limb and the body share no row: there is nothing to touch)
  const st = g.set[cuAtkK], lg = st.m || 0, lt = st.lt || 1, n = g.atk[cuAtkK].length, fl = u => { u = Math.min(1, u / lt); return lg * (st.e ? 1 - (1 - u) * (1 - u) : u); };
  const left = Math.max(0, fl((e.f - 1) / n) - cuLunged), need = dummy.x - wx - left - (rc - 2);      // (left: the step of the blow itself that is still to come before it lands; need: how far the enemy then still is from the place where the limb just touches him)
  if (need > .5 && need <= RY_CLOSE) { wx += Math.min(need, RY_CLOSE_V * dt); if (ryStepAt !== cuAtkAt) { ryStepAt = cuAtkAt; if (need > 10) { gritAt(wx, 3, 40, 0); puff(wx - 4, 2); } } }
  else if (need < -.5 && left > 0) cuLunged += Math.min(left, -need);      // (he is close enough already: the blow's own step would carry him into the enemy, so that much of it is not taken)
}
function ryOnHit(now, o) {      // a blow landed: it pushes him back a little (more for a heavy one) and a heavy one kicks up dust at the enemy's feet
  if (!dummy) return; wxv -= 10 + o.d * .8;
  if (o.d >= 14) { gritAt(dummy.x - 4, 4, 55, 1); puff(dummy.x - 8, 2); }
}
function ryOnMiss(now) {      // a blow that hit nothing carries him forward and the rest of it takes half as long again (once for a whole move): he is off balance
  wxv += 14; if (ryMissAt === cuAtkAt) return;
  const n = CU_GAME[4].atk[cuAtkK].length, ap = (now - cuAtkAt) / (n * cuMs); cuMs *= 1.5; cuAtkAt = now - ap * n * cuMs; ryMissAt = cuAtkAt;      // (the picture he is on stays the same: only the time per picture grows; ryMissAt is the NEW start time, so a second miss in the same move (the combo) does not slow it down again)
}
const RY_HUR = ['hu', 'hb', 'hs', 'hs', 'hf', 'hu', 'hu', 'hf', 'hl', 'hl'];      // (his hurt picture row for each of the ten reactions the game picks from: 0, 5 and 6 the head snap, 1 doubled over, 2 and 3 a stagger back, 4 and 7 knocked down, 8 and 9 the legs buckle)
const ryHus = set => RY_HUR.map((r, k) => ({ f: set[r], ms: 1000 / RXF15[k] }));      // (15 pictures last as long as the reaction does)

// ---- v1.163 his BLUE moves: BLUE standing is a hard POWER PUNCH, in the air a DIVE PUNCH (he flies above the enemy and punches him down into the floor: smoke and a stun), holding FORWARD a 5-HIT COMBO (right hook, left hook, uppercut, kick, and an elbow that pushes the enemy back); DASH right after the punch or the combo (within 0.6 s of its last blow, or pressed during it) is a DASH KICK that sends the enemy flying back
let ryBlImp = 0, ryDkQ = 0;      // (when the last blow of a POWER PUNCH / 5-HIT COMBO landed, 0 = not yet; until when a DASH press is kept for the DASH KICK)
const RY_BLN = [['POWER<br>PUNCH', 'Power punch: a hard punch that sends the enemy flying back'], ['DIVE<br>PUNCH', 'Dive punch: in the air, he flies above the enemy and punches him down to the floor in a cloud of smoke, the enemy is stunned'], ['5-HIT<br>COMBO', 'Five-hit combo: holding forward, right hook, left hook, uppercut, kick and an elbow that pushes the enemy back. Press dash right after it for a dash kick']];      // (the names of his moves on the BLUE button: v1.165 the two that said BLUE are POWER PUNCH and 5-HIT COMBO)
function ryBlue(now) { return ryAir(now) ? 9 : (keyR || padR) ? 10 : 8; }      // (the BLUE move this stance asks for: the number in RY_MV)
function ryBlueLabel(now) {      // the BLUE button's name; the DASH button says DASH KICK while that is what it does
  const n = RY_BLN[ryBlue(now) - 8], el = $('lapl'), dk = ryDkOk(now) || (cuAtkAt >= 0 && (cuAtkK === 8 || cuAtkK === 10)) ? 'DASH<br>KICK' : 'DASH', d = $('dashl');
  if (el.innerHTML !== n[0]) { el.innerHTML = n[0]; $('lap').setAttribute('aria-label', n[1]); }
  if (d.innerHTML !== dk) { d.innerHTML = dk; $('dash').setAttribute('aria-label', dk === 'DASH' ? 'Dash' : 'Dash kick: a flying kick that sends the enemy back'); }
}
const ryDkOk = now => ryBlImp > 0 && now - ryBlImp < 600 && now >= (cuCd[11] || 0);      // (the last blow of a blue punch or combo landed less than 0.6 s ago)
function ryBlueGo(g, k, now) {      // BLUE move k (8 - 10), or the DASH KICK (11), starts; false when its cooldown is not over
  const st = g.set[k];
  if (now < (cuCd[k] || 0)) { say('WAIT', wx, '#9a9aa8', 8, now); return false; }
  if (stance === 'crouch') { stance = 'stand'; stickCr = false; }      // (he gets up and throws it)
  if (k === 9) {      // (the dive: how far to fly is the way to a place just short of the enemy; his height goes from where he is now up to RY_DIVE_HI over the enemy and down to the floor, and the jump is over)
    const L0 = Math.max(0, Math.round(gojoLift || 0)), H = Math.max(RY_DIVE_HI, L0 + 4);
    st.m = Math.max(0, Math.min(150, (dummy && dummy.ko < 0 ? dummy.x - wx : 44) - 14)); g.al[9] = [L0, L0 + 3, L0 + 7, H - 10, H - 4, H, H, H, H - 3, 18, 8, 2, 0, 0, 0]; cuJumpAt = -1;
  }
  if (k === 11) st.m = Math.max(36, Math.min(135, (dummy && dummy.ko < 0 ? dummy.x - wx + .14 * Math.max(0, dummy.vx || 0) : 60) - 14));      // (the dash kick: he flies to where the enemy will be, which is farther when the enemy is still flying back from the last blow)
  cuAtkK = k; cuAtkAt = now; cuFired = []; cuRes = []; cuLunged = 0; cuMs = 1000 / st.v; cuCd[k] = st.d ? now + st.d * 1000 : 0; cuCmb = cuSn = cuCp = 0; cuCmbBy = now + 1e9; ryBlImp = 0; ryDkQ = 0; snd('swing', k === 11 ? 3 : 0);
  return true;
}
function ryBlueStep(g, now, ctl, lpr, dsh) {      // one frame of his BLUE and the DASH KICK (customScene calls it every frame he fights)
  if (lpr && (cuAtkAt >= 0 || (cuJumpAt >= 0 && !ryAir(now)))) cuLpQ = now + 300;      // (a BLUE press while a blow is thrown, or in the push-off of a jump, is kept for 0.3 s)
  if ((lpr || (cuLpQ > now && cuAtkAt < 0)) && ctl && cuAtkAt < 0 && !cuDash && blkAt < 0 && (cuJumpAt < 0 || ryAir(now)) && (stance === 'stand' || stance === 'crouch')) { cuLpQ = 0; ryBlueGo(g, ryBlue(now), now); }
  if (dsh && cuAtkAt >= 0 && (cuAtkK === 8 || cuAtkK === 10) && !ryBlImp) ryDkQ = now + 800;      // (DASH pressed before the last blow lands: kept until it has)
  if (ctl && cuJumpAt < 0 && !cuDash && blkAt < 0 && ryDkOk(now) && (dsh || ryDkQ > now)) ryBlueGo(g, 11, now);      // (the DASH KICK cuts the end of the blue move short)
}
function ryDust(x, big) {      // SMOKE and grit where he hits the floor (the dive punch), and a gust that blows the litter away
  puff(x - 9, Math.round(7 * big)); puff(x, Math.round(9 * big)); puff(x + 9, Math.round(7 * big)); gritAt(x, Math.round(12 * big), 80, 0); shockAt(x, 120 * big, 60, .6);
}
function ryBurst() {      // the BLUE BURST (the effect of his blue blows, preset 1 and 2 of cuDrawVfx): 6 pictures of a star of blue light that grows and fades, white in the middle
  const out = [];
  for (let i = 0; i < 6; i++) {
    const c = document.createElement('canvas'); c.width = c.height = 64; const g = c.getContext('2d'), R = 7 + i * 4.2, th0 = .3 + i * .22;
    for (let a = 0; a < 10; a++) {      // ten rays, the odd ones short: white near the middle, light blue, then blue at the tip (they thin out as the burst fades)
      const th = th0 + a * Math.PI / 5, len = R * (a % 2 ? .62 : 1);
      for (let r = 3; r <= len; r += .7) { if (i > 2 && (a + Math.round(r)) % 3 === i % 3) continue; g.fillStyle = r < len * .3 ? '#ffffff' : r < len * .65 ? '#8fd0ff' : '#2f6cff'; const w = i < 3 && r < len * .7 ? 2 : 1; g.fillRect(Math.round(32 + Math.cos(th) * r), Math.round(32 + Math.sin(th) * r * .9), w, w); }
    }
    for (let a = 0; a < 36; a++) { const th = a / 36 * Math.PI * 2; if (i > 3 && a % 2) continue; g.fillStyle = '#5aa0ff'; g.fillRect(Math.round(32 + Math.cos(th) * R * .6), Math.round(32 + Math.sin(th) * R * .54), 1, 1); }      // (a thin ring)
    const cr = Math.max(0, 3 - (i >> 1)); g.fillStyle = '#ffffff'; for (let y = -cr; y <= cr; y++) for (let x = -cr; x <= cr; x++) if (x * x + y * y <= cr * cr) g.fillRect(32 + x, 32 + y, 1, 1);      // (the white core, it shrinks)
    out.push(c);
  }
  return out;
}

// ---- the heavy steps: every time a foot of the walk comes down he scuffs the ground (grit, a puff, the sound of a step) and the screen shakes a hair; the same, a little bigger, when the DASH stops and when he lands from a jump
let ryWi = -1, ryStepN = 0;
function ryShake(now, ms) { if (now >= shakeUntil) { shakeUntil = now + ms; shakeAmp = 1; } }
function ryStep(now, dir) {
  if (!dir || stance !== 'stand' || cuJumpAt >= 0 || cuAtkAt >= 0 || cuDash || blkAt >= 0) { ryWi = -1; return; }
  const n = 15, wi = ((Math.floor(dir > 0 ? cuPh : -cuPh) % n) + n) % n;
  if (wi === ryWi) return;
  const prev = ryWi; ryWi = wi; if (prev < 0 || !RY_STEP[dir > 0 ? 'fw' : 'bk'].includes(wi)) return;
  snd('step', ++ryStepN & 1, dir < 0); gritAt(wx + dir * 7, 3, 38, 0); puff(wx + dir * 6, 2); ryShake(now, 70);
}
function ryDashEnd(now) { gritAt(wx, 5, 50, 0); puff(wx, 4); ryShake(now, 80); }
function ryLand(now) { ryShake(now, 90); }
