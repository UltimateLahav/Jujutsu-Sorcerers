// ---------------------------------------------------------------- v1.143 RYU ISHIGORI (this file is spliced into template.html by build_html.py, right after sukuna.js)
// A fighter of FREE PLAY of the custom kind (customScene in custom.js): his pictures are made by tools/ryu_art.py out of the design the user chose (tools/ryu_src/master.png, cut into parts by tools/ryu_parts.py and put together again in every
// pose: build_html.py fills RYU_PNG with the picture strip, 18 rows of 15 pictures, the rows named in RYU_ROWS). He is slot 4 of CU_GAME (the three slots of the drawings and Sukuna come first) and moves like Yuji (g.ry: the jump, the walk and
// the push of the legs are Yuji's, see customScene) but is a big, heavy man: he walks at 46 px/s forward and 34 back, his DASH is 0.2 s long and his BLOCK uses both hands.
// His blows (ATTACK): standing still, a CHAIN within 0.7 s: LEFT HOOK, RIGHT HOOK, KICK UP (the enemy is thrown up) and JUMP PUNCH (a hop with a punch that sends the enemy flying forward); CROUCHED a kick at the enemy's LEGS; in the AIR a
// DOWNSLAM (both fists drive down onto the enemy); holding FORWARD a HARD PUNCH (a lunge: the enemy is sent back); holding BACK a FRONT KICK forward. ATTACK pressed during a blow is kept for 0.45 s.
const RYU_WHO = 'cu4', RYU_PNG = '__RYUPNG__', RYU_ROWS = ['frames', 'walk', 'wback', 'jump', 'cr', 'ci', 'cwk', 'bl', 'dg', 'db', 'a0', 'a1', 'a2', 'a3', 'cp', 'as', 'hp', 'fk'];      // (idle, walk, walk back, jump, crouch down, crouched idle, crouch walk, block, dash, dash back, the four chain blows, the leg kick, the downslam, the hard punch, the front kick)
const RY_MV = [      // the blows: name, row, damage, the picture (1 - 15) it lands on, pictures a second, how far he steps forward (px), knock-back (x 6 = the enemy's speed in px/s: 100 sends him ~85 px, 140 ~130 px), launch (px high at the top), stun (s), shake, hit stop (ms), dn = he is put on the floor (a sweep / a slam)
  { n: 'L.HOOK', r: 'a0', d: 8, f: 8, v: 38, m: 4, kn: 10, l: 0, st: 0, w: 2, h: 40 },
  { n: 'R.HOOK', r: 'a1', d: 9, f: 8, v: 38, m: 4, kn: 14, l: 0, st: 0, w: 2, h: 45 },
  { n: 'KICK UP', r: 'a2', d: 14, f: 7, v: 32, m: 0, kn: 20, l: 60, st: 0, w: 3, h: 70 },
  { n: 'JUMP PUNCH', r: 'a3', d: 18, f: 8, v: 30, m: 10, kn: 140, l: 8, st: 0, w: 4, h: 80 },
  { n: 'LEG KICK', r: 'cp', d: 11, f: 7, v: 34, m: 0, kn: 15, l: 0, st: 0, w: 2, h: 50, low: true, dn: true },
  { n: 'DOWNSLAM', r: 'as', d: 17, f: 7, v: 30, m: 0, kn: 10, l: 0, st: 0, w: 4, h: 80, dn: true },
  { n: 'HARD PUNCH', r: 'hp', d: 16, f: 8, v: 30, m: 8, kn: 100, l: 0, st: 0, w: 4, h: 80 },
  { n: 'FRONT KICK', r: 'fk', d: 12, f: 7, v: 32, m: 6, kn: 40, l: 0, st: 0, w: 3, h: 60 }];
const RY_HOP = [0, 0, 0, 5, 12, 19, 22, 22, 20, 16, 10, 5, 0, 0, 0];      // the hop of the JUMP PUNCH (px, picture by picture)
let ryUI = false;      // (is Ryu's HUD on: the buttons he does not use are hidden, see tick)
const RY_WF = 16;      // his walking pictures a second (a slow, heavy stride)
NAMES[RYU_WHO] = 'RYU'; CEC[RYU_WHO] = ['#10142a', '#3a58c8', '#a8c0f0', '#7aa0ff'];      // (his name on the HUD and his energy bar: steel blue)
(() => {
  const im = new Image();
  im.onload = () => {      // the strip is cut into 64 x 64 pictures, a row for each animation (until then he is not there: his card shows nothing)
    const n = Math.floor(im.width / 64), set = {}, arts = {}, tipOf = a => { const sp = cuSpan(a, r => r - 1), o = {}; for (const r in sp) o[r] = sp[r][1]; return o; };      // (tipOf: how far each row of a picture reaches in front of his middle column)
    RYU_ROWS.forEach((k, r) => {
      set[k] = []; arts[k] = []; for (let i = 0; i < n; i++) { const c = document.createElement('canvas'); c.width = c.height = 64; c.getContext('2d').drawImage(im, i * 64, r * 64, 64, 64, 0, 0, 64, 64); set[k].push(c); arts[k].push(suAlpha(c)); }
    });
    const body = cuWiden(arts.frames.map(a => cuSpan(a, r => r - 1))), hs = Object.values(body).map(v => v[1]).sort((a, b) => a - b);      // (the widest every row gets over his idle pictures, and half as wide as his torso for the push)
    const ev = RY_MV.map((mv, k) => {      // the impact of each blow: { f: its picture, k: 'i', d: damage, fx: knock-back, launch, stun and, if it hit, a hit stop and a shake, tip: the limb on the impact's pictures, dy: how high the body is then }
      const tips = arts[mv.r].map(tipOf);
      const fx = [['k', mv.kn, 0, 0, -1]].concat(mv.l ? [['l', mv.l, 0, 0, -1]] : [], mv.st ? [['t', mv.st, 0, 0, -1]] : [], [['h', mv.h, 0, 1, 0], ['w', mv.w, 0, 1, 0]], mv.dn ? [['d', 0, 0, 1, 0]] : []);
      const e = { f: mv.f, k: 'i', d: mv.d, sp: mv.d, fx, c: 0, src: -1, id: 0 }; Object.defineProperty(e, 'dy', { get: () => Math.round(((dummy && dummy.airH) || 0) - (gojoLift || 0)), enumerable: true }); if (mv.low) e.low = true;      // (dy: how many rows higher the enemy's body is than his limb: an enemy thrown up, or he himself in the air, is met where they are NOW)
       e.tip = cuMaxRows([tips[mv.f - 1], tips[mv.f]]); return [e];
    });
    const vfx = RY_MV.map(() => []);
    CU_GAME[4] = { name: 'RYU', frames: set.frames, walk: set.walk, wbk: set.wback, jump: set.jump, hu: [], ko: [], bl: set.bl, df: set.dg, db: set.db, cr: set.cr, ci: set.ci, cwk: set.cwk, st: { ...cuStats(null), fw: 46, bk: 34, cw: 55, jh: 22, jt: 713, dfw: 62, dbk: 40, dtm: 200, hp: 340 }, vfx, atk: RY_MV.map(m => set[m.r]),
      an: RY_MV.map(m => m.n), rdy: [0, 1, 2, 3], cl: [], ev, set: RY_MV.map(m => ({ v: m.v, m: m.m, c: 0, d: 0 })), body, push: Math.max(6, hs.length ? hs[hs.length >> 1] : 6), tipAll: ev.map(l => cuMaxRows(l.map(e => e.tip))), vxs: vfx.map(() => []),
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
