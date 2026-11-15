// ================================================================ v1.195 IRON MAN'S REPULSOR BLAST (this file is spliced into template.html by build_html.py, right after ironh.js)
// The user, after v1.194: "make the bear hug change in the repoulser mode change into 'Blast' which will make iron lift his arm forward and charge a beam from his palm and then he fires a beam forward it deals continuous damage".
// The BLUE button is ONE special in two forms: BEAR HUG (tools/ironh.js) and, while the REPULSOR mode is on (g.rp, the MODE button), BLAST (here). One press (every 10 s) starts it; it is played by the same state as the bear hug, g.bh, with kind 'beam' (customScene asks irBhStep, which hands over to irbStep, for his picture every frame while it runs and he cannot do anything else):
//   RAISE (0.24 s: the right arm comes up, straight out in front of him, his feet braced) -> CHARGE (0.9 s: a ball of light grows in the palm, sparks are drawn into it, the palm flickers) -> FIRE (1.5 s: a beam leaves the palm and runs straight forward across the screen; 15 times, every 0.1 s, it hurts what it touches for 3) -> LOWER (0.32 s: the arm comes down).
// "Continuous damage" = a tick of 3 every 0.1 s for as long as the beam touches the enemy (45 in all): the beam is a band of 9 pixel rows at the height of his palm that runs to the edge of the screen, and hbTouchFoe asks whether it touches the enemy's BODY as he is drawn (a crouching enemy is flown over, one in the air only when his body reaches the band). A blocking enemy is not hurt: the beam only sparks on his guard. While it touches him he is held (cuStun, a hit reaction every 0.25 s) and the combo counter counts one hit and the damage grows. In the skyscraper the beam also hurts the furniture, walls and doors in its way (twSweep, as Ryu's ULTIMATE does).
// A blow that lands on him before the beam is out (raise, charge, fire) stops it. The cooldown is 10 s of the game's clock (3 s when it is stopped before it fires).
const IRB = { raise: 240, charge: 900, fire: 1500, lower: 320, t0: 40, tick: 100, ticks: 15, tickD: 3, th: 4, cd: 10000, objD: 4 };      // (times in game ms; th: half the beam's thickness: 9 rows; objD: what a tick does to a piece of furniture)
function irbPalm(pose) {      // where the near hand's palm is on the 64 x 64 picture of a pose (the same rig as irBolts): { px, py }
  const J = c4xRig(C4I, pose), a = J.arms[1];
  return { px: Math.round(a.h[0] + Math.sin(a.a2) * 2.4 - IRON_OX), py: Math.round(a.h[1] + Math.cos(a.a2) * 2.4 - IRON_OY) };
}
function irbPics(g) {      // the pictures of the blast (made with the others by ironMoves): the arm comes up (rz 4), the charge (ch 2: the palm flickers), the beam (fi 2: he leans back against it, shaking), the arm comes down (lo 4); every picture knows where its palm is (.palm)
  const feet = [{ ax: 35, ay: C4IG, a: 0 }, { ax: 59, ay: C4IG, a: 0 }], brace = o => irG({ y: 63, hdy: 1.5, legs: feet, ...o });
  const hold = (rr, x, lean) => brace({ x, lean, hdx: 1.1, hdt: -2, rr, arms: [{ al: 14, el: 80 }, { al: 84, el: 2 }] });      // (the right arm out in front, the left fist at his belt)
  const fire = lean => brace({ x: 44, lean, hdx: 0.8, hdt: -6, rr: 1, arms: [{ al: 10, el: 84 }, { al: 86, el: 0 }] });
  const lift = [0.25, 0.5, 0.75, 1].map(k => c4xMixPose(IR_GD, hold(0, 45, -3), k)), chP = [hold(0.5, 45, -3), hold(1, 45, -4)], fiP = [fire(-7), fire(-9)];
  const loP = [0.25, 0.5, 0.75, 1].map(k => c4xMixPose(fire(-8), IR_GD, k));
  const cut = p => { const c = ironCut(p); c.palm = irbPalm(p); return c; };
  g.bmp = { rz: lift.map(cut), ch: chP.map(cut), fi: fiP.map(cut), lo: loP.map(cut) };
}
// ---- the start, and what stops it
function irbStart(g, now) {      // BLUE while the repulsor mode is on (irBhStart hands over to this): the blast begins (false when it cannot)
  if (!g.bmp) irbPics(g);
  if (now < (g.bmCd || 0)) { say('WAIT', wx, '#9a9aa8', 8, now); return false; }
  if (!irhOk(now)) { say('NO ENEMY HERE', wx, '#9a9aa8', 8, now); return false; }
  g.bh = { kind: 'beam', lab: 'blast', ph: 'raise', at: now, last: now, lift: 0, rot: 0, tk: 0, hit: false, imm: false, miss: false, rxAt: -1e9, fl: -1e9, acc: 0, on: -1, off: -1, imp: -1e9, blk: -1e9, ix: 0, iy: 0 };
  g.bmCd = now + IRB.cd; stance = 'stand'; stickCr = false; snd('thrust', 0.5); return true;
}
function irbHurt(g, now) {      // a blow lands on him: the blast stops (the cooldown is cut to 3 s when it had not fired yet)
  const b = g.bh; if (b.ph === 'raise' || b.ph === 'charge') g.bmCd = Math.min(g.bmCd || 0, now + IRH.cdMiss); irBhEnd(g, now);
}
// ---- the beam: where it is, what it touches
const irbMx = b => wx + (b.px - 32) + 2;      // (the world column where the beam starts: just in front of the palm of the picture he is drawn with)
const irbLen = b => VW - (Math.round(VW / 2) + (b.px - 32) + 2) + 6;      // (the beam runs to the edge of the screen: what is not on the screen is not hit)
function irbShape(b) {      // the place the beam takes up in the world, row by row (the rows of the hit tables: 60 minus the height above the floor; the beam is drawn on the palm's row + 1 like a bolt, so its middle row is the palm's row - 1)
  const s = {}, m = irbMx(b); for (let r = b.py - 1 - IRB.th; r <= b.py - 1 + IRB.th; r++) s[r] = [m, m + irbLen(b)]; return s;
}
function irbTick(g, b, now) {      // one tick of the beam on what is in front of him: 3 damage unless the enemy is not there, ducking, dodging, down or blocking; the skyscraper's furniture, walls and doors in the way take a little too
  if (twOn() && !vs.tw.cab) twSweep(irbMx(b), irbMx(b) + irbLen(b), IRB.objD, now);
  const d = dummy; if (!d || d.ko >= 0 || d.cap || !vs || vs.ph !== 'fight' || now - d.born < 600) return;
  if (twOn()) { const T = vs.tw; if (T.away || T.cab || T.fFoe !== T.fMe || d.twAway) return; }
  if (!hbTouchFoe(irbShape(b), d)) return;
  if (d.vform && d.vform !== 'verity') { if (!b.imm) { b.imm = true; say('IMMUNE', d.x, '#ffe9a0', 8, now); } return; }
  if ((d.vact && d.vact.type === 'crouch') || now < (d.down || 0) || (d.cact && d.cact.flat) || now < (d.dodgeUntil || 0)) { if (!b.miss) { b.miss = true; say('MISS', d.x, '#9fd8ff', 8, now); } return; }      // (the same enemies the other blows cannot touch: a crouching one is flown over)
  const hgt = 61 - b.py, ey = gy - hgt;
  b.ix = d.x; b.iy = ey;
  if (dBlocks() && d.x - irbMx(b) > 0 && now - d.rxAt >= RX_DUR[d.rx]) {      // a blocker: nothing hurts him, the beam sparks on his guard
    b.blk = now; spark(d.x - 8, ey, 3, ['#ffffff', '#9fd8ff'], false, -1); if (b.tk % 3 === 0) snd('block'); return;
  }
  const dm = Math.max(1, Math.round(IRB.tickD * cuS.dm / 100));
  if (now > hits.until) { hits.n = 0; hits.dmg = 0; hits.seq = 0; } if (!b.hit) { b.hit = true; hits.n++; vs.bestCmb = Math.max(vs.bestCmb | 0, hits.n); } hits.dmg += dm; hits.until = now + COMBO_WIN; hits.last = now; hits.bonus = 0;      // (one hit of the combo counter, the damage grows)
  d.hp = Math.max(0, d.hp - dm); if (now - b.fl >= 250) { d.hitAt = now; b.fl = now; } b.imp = now; b.acc += dm;      // (the white flash of a hit comes every quarter of a second, not every tick)
  if (!airUp(d) && now - b.rxAt >= 250) { d.rx = 6; d.rxAt = now; b.rxAt = now; }      // (he flinches again every quarter of a second while it burns him)
  cuStun(0.28, now, true); d.vx = Math.min(d.vx || 0, 0);
  spark(d.x - 8, ey, 4, ['#ffffff', '#9ff3ff', '#17e3ff'], false, 1); shakeUntil = Math.max(shakeUntil, now + 100); shakeAmp = Math.max(shakeAmp, 1.5);
  if (b.tk % 3 === 0) { say('' + b.acc, d.x + (Math.random() * 10 - 5), popCol(), 8, now); b.acc = 0; snd('smack', 0); }      // (the numbers come every 0.3 s: the sum of three ticks)
  if (twOn()) { const T = vs.tw; T.dHp = d.hp; T.dHit = d.hitAt; T.dDown = d.down || 0; }      // (the skyscraper's watcher must not take it for a blow that puts him down; his own health is left alone: the enemy can hit him while it runs)
  if (d.hp <= 0) { koDummy(now); b.ko = true; }
}
// ---- the state: irBhStep hands over to this every frame while the blast runs; it returns his picture
function irbStep(g, b, now, dt) {
  const P = g.bmp, u = now - b.at; b.last = now; b.lift = 0; b.rot = 0;
  if (vs.ph !== 'fight') { irBhEnd(g, now); return null; }
  let pic;
  if (b.ph === 'raise') { pic = P.rz[Math.min(3, Math.floor(u / IRB.raise * 4))]; if (u >= IRB.raise) { b.ph = 'charge'; b.at = now; snd('redcharge'); snd('thrust', 0.9); } }
  else if (b.ph === 'charge') {
    pic = P.ch[Math.floor(u / 90) % 2];
    if (Math.random() < 0.04) puff(wx - 6, 2);
    if (u >= IRB.charge) { b.ph = 'fire'; b.at = now; b.on = now; b.tk = 0; b.sn = 0; snd('redfire'); snd('thrust', 1.5); flash(now, 120, 0.22); shakeUntil = Math.max(shakeUntil, now + 200); shakeAmp = Math.max(shakeAmp, 3); gritAt(wx - 8, 10, 100, -1); if (twOn()) twLightsShock(twFloorData(vs.tw.fMe), wx + 40, 120, 60, now); }
  }
  else if (b.ph === 'fire') {
    pic = P.fi[Math.floor(u / 60) % 2]; b.px = pic.palm.px; b.py = pic.palm.py;
    while (b.tk < IRB.ticks && u >= IRB.t0 + b.tk * IRB.tick && !b.ko) { irbTick(g, b, now); b.tk++; }
    shakeUntil = Math.max(shakeUntil, now + 80); shakeAmp = Math.max(shakeAmp, 1);
    if (u >= b.sn) { snd('cecrackle'); b.sn = u + 230; }
    if (u >= IRB.fire || b.ko) { b.ph = 'lower'; b.at = now; b.off = now; snd('ceoff'); }
  }
  else if (b.ph === 'lower') { pic = P.lo[Math.min(3, Math.floor(u / IRB.lower * 4))]; if (u >= IRB.lower) { irBhEnd(g, now); return null; } }
  else { irBhEnd(g, now); return null; }
  if (pic.palm) { b.px = pic.palm.px; b.py = pic.palm.py; }
  return pic;
}
// ---- what customScene draws: the beam (before him, so that his hand and arm stay in front of it) and the light at his palm (after him)
const irbDisc = (px, py, r, col, a) => { ctx.globalAlpha = a; ctx.fillStyle = col; for (let y = -r; y <= r; y++) { const w = Math.floor(Math.sqrt(r * r - y * y)); ctx.fillRect(px - w, py + y, w * 2 + 1, 1); } ctx.globalAlpha = 1; };      // (a round spot of light, row by row like the flash of a bolt)
function irbBack(g, b, now, x, y, src) {      // the beam: layers of light from the palm to the enemy (it ends on his body while it touches him) or across the screen; it grows in 70 ms and fades in 200
  if (b.on < 0 || !src || !src.palm) return;
  const k = Math.min(1, (now - b.on) / 70) * (b.off < 0 ? 1 : Math.max(0, 1 - (now - b.off) / 200)); if (k <= 0) return;
  const x0 = Math.round(x + src.palm.px) + 2, yc = Math.round(y + src.palm.py) + 1, touch = now - b.imp < 160 || now - b.blk < 160, ex = Math.round(Math.round(VW / 2) + b.ix - wx) - 8;
  const len = Math.max(4, Math.min(Math.round(irbLen(b) * k), touch ? ex - x0 + 4 : 1e9)), th = Math.max(1, Math.round(IRB.th * k)), pulse = Math.floor(now / 45) % 3;
  ctx.save();
  for (const [h, col] of [[th + 4, 'rgba(111,224,255,0.14)'], [th + 2, 'rgba(111,224,255,0.3)'], [th + (pulse === 1 ? 2 : 1), 'rgba(150,238,255,0.7)'], [Math.max(1, th - 1), 'rgba(222,252,255,0.96)'], [Math.max(1, th - 3), '#ffffff']]) { ctx.fillStyle = col; ctx.fillRect(x0, yc - h, len, h * 2 + 1); }
  ctx.fillStyle = 'rgba(255,255,255,0.85)'; for (let i = 0; i < 12; i++) ctx.fillRect(x0 + Math.round((i * 61 + now * 1.3) % len), yc + ((i * 5) % 7) - 3, 6 + (i % 3) * 4, 1);      // (streaks of light run along it)
  if (!SET.lite) { ctx.fillStyle = 'rgba(190,245,255,0.8)'; for (let i = 0; i < 14; i++) ctx.fillRect(x0 + Math.floor(Math.random() * len), yc + (Math.random() < 0.5 ? -1 : 1) * (th + 2 + Math.floor(Math.random() * 4)), 1 + Math.floor(Math.random() * 3), 1); }      // (and it crackles at its edges)
  if (touch) { const bl = now - b.blk < 160, r = bl ? 4 : 7; irbDisc(ex, yc, r + 3, '#6fe0ff', 0.25 * k); irbDisc(ex, yc, r, '#aef6ff', 0.55 * k); irbDisc(ex, yc, Math.max(2, r - 3), '#ffffff', 0.95 * k); }      // (where it meets him: a flare, a small one on his guard)
  ctx.restore();
}
function irbFront(g, b, now, x, y, src) {      // the light at his palm: the ball that grows in the charge with sparks drawn into it, the flare of the beam while it is on
  if (!src || !src.palm || b.ph === 'raise') return;
  const px = Math.round(x + src.palm.px) + 1, py = Math.round(y + src.palm.py) + 1; ctx.save();
  if (b.ph === 'charge') {
    const k = Math.min(1, (now - b.at) / IRB.charge), e = k * k * (3 - 2 * k), r = Math.round(1 + 7 * e);
    irbDisc(px, py, r + 4, '#6fe0ff', 0.14 + 0.1 * e); irbDisc(px, py, r + 2, '#8fe9ff', 0.3 + 0.2 * e); irbDisc(px, py, r, '#d8faff', 0.85); irbDisc(px, py, Math.max(1, r - 3), '#ffffff', 1);
    ctx.fillStyle = '#aef6ff'; for (let i = 0; i < 12; i++) { const ph = (now * 0.0042 + i * 0.173) % 1, rad = (1 - ph) * 34 * (1.1 - 0.6 * e), an = i * 2.4 + now * 0.002; ctx.globalAlpha = 0.9 * ph; ctx.fillRect(Math.round(px + Math.cos(an) * rad), Math.round(py + Math.sin(an) * rad * 0.8), 2, 1); }      // (twelve sparks fall into the palm, faster and closer as the ball grows)
  } else if (b.on >= 0) {
    const k = b.off < 0 ? 1 : Math.max(0, 1 - (now - b.off) / 200), r = Math.round((6 + (Math.floor(now / 50) % 3)) * k);
    if (r > 0) { irbDisc(px + 1, py, r + 3, '#6fe0ff', 0.2 * k); irbDisc(px + 1, py, r, '#d8faff', 0.8 * k); irbDisc(px + 1, py, Math.max(1, r - 3), '#ffffff', k); ctx.globalAlpha = 0.7 * k; ctx.fillStyle = '#ffffff'; ctx.fillRect(px - 10, py, 24, 1); ctx.fillRect(px + 1, py - 8, 1, 17); }      // (a bright flare with a cross of light)
  }
  ctx.restore(); ctx.globalAlpha = 1;
}
// ================================================================ v1.202 IRON MAN'S SPIN BLAST (this section is part of tools/ironb.js: it is the BLAST in the air)
// The user, after v1.201: "Now add to iron man (btw let's do that a meter in real life is 10 pixels ok? Nice) so when I jump and I use the blast special then iron man will spin while using both his hands to fire blasts beam from his hand he will be in a T pose while doing it and no questions asked NOW GO". No question round.
// BLUE in the air (a JUMP going on) while the REPULSOR mode is on is the SPIN BLAST; on the ground it is the BLAST above. It is the same special (they share the cooldown of 10 s) and is played by the same state as the others, g.bh, with kind 'spin' (irTick starts it, customScene asks irBhStep, which hands over to irsStep):
//   RAISE (0.22 s: he sinks or rises to his hover height and his arms swing out) -> SPIN (1.7 s: he hangs 0.6 m above the floor in a T pose, the boots blazing, and turns on the spot 2.7 times a second; both palms fire, one beam to each side) -> 0.1 s while the beams go out -> DROP (he falls; a blow that lands on him stops it and he falls with the hurt picture) -> LAND (0.16 s).
// The beams are the arms of the T. Seen from the side, an arm that points across the screen is as long as it is and one that points at you or away from you is short, so the reach of the beams is IRS.len (25 m) times |cos| of the turn: they breathe in and out, one to the left and one to the right at the same time, twice a turn. An enemy close to him is touched most of the time, one far away only while they are at their longest. The pictures are the suit of chapter 5 (the same rig, tools/chap4e.js) in a T pose with its arms shortened to |cos| (C4I.UA and C4I.FA times it) and turned over for the half of the turn in which he looks the other way (irsPics). Every 0.1 s (16 times) the beam on the enemy's side hurts what it touches for 3: the rules of the BLAST (a crouching enemy is flown over, a blocker only sparks, a smoke ball is immune, one hit of the combo counter), and in the skyscraper both beams cut what is in their way (twSweep).
// 1 m = 10 px (the user's scale for every number of this move): the hover is 0.6 m and the reach 25 m. A T pose at the height of a jump would fire over the head of a standing enemy (his shoulders are 47 rows above his soles, the enemy's body is 62 rows high), so he hovers low: the beams pass at the rows 3 - 11 of the hit tables, the head and neck of a standing enemy; a crouching one is flown over.
const IR_M = 10;
const IRS = { hover: Math.round(0.6 * IR_M), len: 25 * IR_M, raise: 220, spin: 1700, wind: 100, rev: 370, t0: 60, tick: 100, ticks: 16, tickD: 3, th: 4, g: 620, land: 160, A: 8 };      // (times in game ms; rev: ms for one turn; A: the pictures of a quarter turn, the arms from full length to none)
function irsDraw(pose, a) {      // the pose as a 64 x 64 picture with both arms a (0 - 1) times as long: the suit with the shoulders turned, an arm that points at you or away from you is short; .hands = [far hand, near hand] palms on the picture
  const ua = C4I.UA, fa = C4I.FA; C4I.UA = ua * a; C4I.FA = fa * a;
  try {
    const cv = document.createElement('canvas'); cv.width = cv.height = 64; const q = cv.getContext('2d'); q.imageSmoothingEnabled = false; q.drawImage(c4xDrawIron(pose).canvas(), IRON_OX, IRON_OY, 64, 64, 0, 0, 64, 64);
    const J = c4xRig(C4I, pose), hand = k => { const m = J.arms[k]; return { px: Math.round(m.h[0] + Math.sin(m.a2) * 2.4 - IRON_OX), py: Math.round(m.h[1] + Math.cos(m.a2) * 2.4 - IRON_OY) }; };
    cv.pl = { L: hand(0), R: hand(1) }; return cv;      // (the far arm points back = the left of the picture, the near arm forward = the right)
  } finally { C4I.UA = ua; C4I.FA = fa; }      // (the rig sizes belong to everybody: they are put back whatever happens)
}
function irsFlip(cv) {      // the same picture turned over (the middle column stays the middle column: 32 -> 32); the left hand becomes the right one
  const c = document.createElement('canvas'); c.width = c.height = 64; const q = c.getContext('2d'); q.imageSmoothingEnabled = false; q.translate(65, 0); q.scale(-1, 1); q.drawImage(cv, 0, 0);
  c.pl = { L: { px: 64 - cv.pl.R.px, py: cv.pl.R.py }, R: { px: 64 - cv.pl.L.px, py: cv.pl.L.py } }; return c;
}
function irsPics(g) {      // the pictures of the spin blast (made the first time it is needed): the arms swinging out (rz 4), and the T pose turning: sp[0] = looking right, sp[1] = turned over, A pictures from the arms at full length to none
  const T = ironPose({ x: 48, y: 62.4, lean: 0, hdx: 1.2, hdy: 1.5, hdt: 0, rep: 1, rr: 1, arms: [{ al: -90, el: 0 }, { al: 90, el: 0 }], legs: [{ ax: 45, ay: C4IG, a: 0 }, { ax: 51, ay: C4IG, a: 0 }] });
  const sp = [[], []]; for (let k = 0; k < IRS.A; k++) { const c = irsDraw(T, Math.max(0.02, Math.cos(k / (IRS.A - 1) * Math.PI / 2))); sp[0].push(c); sp[1].push(irsFlip(c)); }
  const from = ironJump(5, 12), rz = [1, 2, 3, 4].map(k => { const c = k === 4 ? irsDraw(T, 1) : ironCut(c4xMixPose(from, T, k / 4)); if (!c.pl) c.pl = sp[0][0].pl; return c; });
  g.smp = { sp, rz, py: sp[0][0].pl.R.py, tip: sp[0][0].pl.R.px - 32 };
}
// ---- the start, and what stops it
function irsStart(g, now) {      // BLUE in the air while the repulsor mode is on (irTick hands over to this): the spin blast begins (false when it cannot)
  if (!g.smp) irsPics(g);
  if (now < (g.bmCd || 0)) { say('WAIT', wx, '#9a9aa8', 8, now); return false; }
  const l0 = Math.max(0, Math.round(gojoLift || 0));
  g.bh = { kind: 'spin', lab: 'spin', ph: 'raise', at: now, last: now, lift: l0, l0, rot: 0, tk: 0, hit: false, imm: false, miss: false, rxAt: -1e9, fl: -1e9, acc: 0, on: -1, off: -1, imp: -1e9, blk: -1e9, ix: 0, iy: 0, side: 1, a: 1, vy: 0, sn: 0, py: g.smp.py, tip: g.smp.tip, pl: null, ko: false };
  g.bmCd = now + IRB.cd; cuJumpAt = -1; stance = 'stand'; stickCr = false; snd('thrust', 0.9); return true;      // (the jump is over: the state has his height from now on, and the landing is its own)
}
function irsHurt(g, now) {      // a blow lands on him: the beams go out and he falls (the hurt picture is drawn meanwhile; the cooldown is cut to 3 s when they had not fired yet); called every frame the hurt lasts
  const b = g.bh; if (b.ph === 'drop' || b.ph === 'land') return;
  if (b.ph === 'raise') g.bmCd = Math.min(g.bmCd || 0, now + IRH.cdMiss); if (b.on >= 0 && b.off < 0) b.off = now; b.ph = 'drop'; b.at = now; b.vy = 0;
}
// ---- the beams: where they are, what they touch
function irsTick(g, b, now, a) {      // one tick of the two beams, a (0 - 1) times their full reach: 3 damage on the enemy's side unless he is not there, ducking, dodging, down or blocking; the furniture, walls and doors of the skyscraper in the way of either take a little too
  const len = Math.round(IRS.len * a), tip = Math.round(b.tip * a), mr = wx + tip + 2, ml = wx - tip - 2;
  if (twOn() && !vs.tw.cab) { twSweep(mr, mr + len, IRB.objD, now); twSweep(ml - len, ml, IRB.objD, now); }
  const d = dummy; if (!d || d.ko >= 0 || d.cap || !vs || vs.ph !== 'fight' || now - d.born < 600) return;
  if (twOn()) { const T = vs.tw; if (T.away || T.cab || T.fFoe !== T.fMe || d.twAway) return; }
  const side = d.x >= wx ? 1 : -1, m = side > 0 ? mr : ml, r0 = b.py - 1 - Math.round(b.lift), sh = {}; for (let r = r0 - IRS.th; r <= r0 + IRS.th; r++) sh[r] = side > 0 ? [m, m + len] : [m - len, m];
  if (!hbTouchFoe(sh, d)) return;
  if (d.vform && d.vform !== 'verity') { if (!b.imm) { b.imm = true; say('IMMUNE', d.x, '#ffe9a0', 8, now); } return; }
  if ((d.vact && d.vact.type === 'crouch') || now < (d.down || 0) || (d.cact && d.cact.flat) || now < (d.dodgeUntil || 0)) { if (!b.miss) { b.miss = true; say('MISS', d.x, '#9fd8ff', 8, now); } return; }
  const ey = gy - (61 - b.py) - Math.round(b.lift); b.ix = d.x; b.iy = ey; b.side = side;
  if (dBlocks() && side * (d.x - m) > 0 && now - d.rxAt >= RX_DUR[d.rx]) { b.blk = now; spark(d.x - 8 * side, ey, 3, ['#ffffff', '#9fd8ff'], false, -side); if (b.tk % 3 === 0) snd('block'); return; }
  const dm = Math.max(1, Math.round(IRS.tickD * cuS.dm / 100));
  if (now > hits.until) { hits.n = 0; hits.dmg = 0; hits.seq = 0; } if (!b.hit) { b.hit = true; hits.n++; vs.bestCmb = Math.max(vs.bestCmb | 0, hits.n); } hits.dmg += dm; hits.until = now + COMBO_WIN; hits.last = now; hits.bonus = 0;
  d.hp = Math.max(0, d.hp - dm); if (now - b.fl >= 250) { d.hitAt = now; b.fl = now; } b.imp = now; b.acc += dm;
  if (!airUp(d) && now - b.rxAt >= 250) { d.rx = 6; d.rxAt = now; b.rxAt = now; }
  cuStun(0.28, now, true); d.vx = 0;
  spark(d.x - 8 * side, ey, 4, ['#ffffff', '#9ff3ff', '#17e3ff'], false, side); shakeUntil = Math.max(shakeUntil, now + 100); shakeAmp = Math.max(shakeAmp, 1.5);
  if (b.tk % 3 === 0) { say('' + b.acc, d.x + (Math.random() * 10 - 5), popCol(), 8, now); b.acc = 0; snd('smack', 0); }
  if (twOn()) { const T = vs.tw; T.dHp = d.hp; T.dHit = d.hitAt; T.dDown = d.down || 0; }
  if (d.hp <= 0) { koDummy(now); b.ko = true; }
}
// ---- the state: irBhStep hands over to this every frame while the spin blast runs; it returns his picture
function irsStep(g, b, now, dt) {
  const P = g.smp, u = now - b.at; dt = Math.max(0, Math.min(0.05, dt)); b.last = now; b.rot = 0;
  if (vs.ph !== 'fight') { b.lift = 0; irBhEnd(g, now); return null; }
  let pic;
  if (b.ph === 'raise') {
    const k = Math.min(1, u / IRS.raise), e = k * k * (3 - 2 * k); b.lift = b.l0 + (IRS.hover - b.l0) * e; pic = P.rz[Math.min(P.rz.length - 1, Math.floor(k * P.rz.length))];
    if (u >= IRS.raise) { b.ph = 'spin'; b.at = now; b.on = now; b.tk = 0; b.sn = 0; b.lift = IRS.hover; snd('redfire'); snd('thrust', 1.5); flash(now, 120, 0.22); shakeUntil = Math.max(shakeUntil, now + 200); shakeAmp = Math.max(shakeAmp, 3); gritAt(wx - 8, 10, 100, -1); gritAt(wx + 8, 10, 100, 1); if (twOn()) twLightsShock(twFloorData(vs.tw.fMe), wx, 140, 60, now); }
  } else if (b.ph === 'spin') {
    const c = Math.cos(2 * Math.PI * u / IRS.rev), a = Math.abs(c), last = P.sp[0].length - 1; b.a = a; b.lift = IRS.hover + 0.4 * Math.sin(u / 70);
    pic = P.sp[c < 0 ? 1 : 0][Math.round(Math.acos(Math.min(1, a)) / (Math.PI / 2) * last)];
    if (b.off < 0) {
      while (b.tk < IRS.ticks && u >= IRS.t0 + b.tk * IRS.tick && !b.ko) { irsTick(g, b, now, Math.abs(Math.cos(2 * Math.PI * (IRS.t0 + b.tk * IRS.tick) / IRS.rev))); b.tk++; }
      shakeUntil = Math.max(shakeUntil, now + 80); shakeAmp = Math.max(shakeAmp, 1);
      if (u >= b.sn) { snd('cecrackle'); b.sn = u + 230; }
      if (Math.random() < 0.15) puff(wx + Math.random() * 12 - 6, 2);
      if (u >= IRS.spin || b.ko) { b.off = now; snd('ceoff'); }
    } else if (now - b.off >= IRS.wind) { b.ph = 'drop'; b.at = now; b.vy = 0; }
  } else if (b.ph === 'drop') {
    b.vy += IRS.g * dt; b.lift = Math.max(0, b.lift - b.vy * dt); pic = g.jump[Math.min(g.jump.length - 1, 8 + Math.floor(u / 60))];
    if (b.lift <= 0) { b.ph = 'land'; b.at = now; b.lift = 0; snd('land', 1); puff(wx - 6, 5); puff(wx + 6, 5); gritAt(wx, 8, 90, 0); }
  } else if (b.ph === 'land') { b.lift = 0; pic = g.jump[g.jump.length - 1]; if (u >= IRS.land) { irBhEnd(g, now); return null; } }
  else { irBhEnd(g, now); return null; }
  if (pic && pic.pl) b.pl = pic.pl;
  return pic;
}
// ---- what customScene draws: the beams (before him, so that his arms stay in front of them) and the light at his palms and the flames of his boots (after him)
function irsBack(g, b, now, x, y, src) {      // one beam to each side from the palms: layers of light that grow in 70 ms and go out in 0.1 s; the one on the enemy's side ends on his body while it touches him
  if (b.on < 0 || !b.pl) return;
  const k = Math.min(1, (now - b.on) / 70) * (b.off < 0 ? 1 : Math.max(0, 1 - (now - b.off) / IRS.wind)); if (k <= 0) return;
  const yc = Math.round(y + b.pl.R.py) + 1, th = Math.max(1, Math.round(IRB.th * k)), pulse = Math.floor(now / 45) % 3, touch = now - b.imp < 160 || now - b.blk < 160, scr = Math.round(VW / 2) + b.ix - wx;
  ctx.save();
  for (const dir of [-1, 1]) {
    const x0 = dir > 0 ? Math.round(x + b.pl.R.px) + 2 : Math.round(x + b.pl.L.px) - 1, hit = touch && b.side === dir, ex = scr - 8 * dir;
    const len = Math.max(3, Math.min(Math.round(IRS.len * b.a * k), hit ? dir * (ex - x0) + 4 : 1e9)), xa = dir > 0 ? x0 : x0 - len;
    for (const [h, col] of [[th + 4, 'rgba(111,224,255,0.14)'], [th + 2, 'rgba(111,224,255,0.3)'], [th + (pulse === 1 ? 2 : 1), 'rgba(150,238,255,0.7)'], [Math.max(1, th - 1), 'rgba(222,252,255,0.96)'], [Math.max(1, th - 3), '#ffffff']]) { ctx.fillStyle = col; ctx.fillRect(xa, yc - h, len, h * 2 + 1); }
    ctx.fillStyle = 'rgba(255,255,255,0.85)'; for (let i = 0; i < 8; i++) { const o = Math.round((i * 61 + now * 1.3) % len); ctx.fillRect(dir > 0 ? x0 + o : x0 - o - 6, yc + ((i * 5) % 7) - 3, 6 + (i % 3) * 4, 1); }
    if (!SET.lite) { ctx.fillStyle = 'rgba(190,245,255,0.8)'; for (let i = 0; i < 9; i++) ctx.fillRect(xa + Math.floor(Math.random() * len), yc + (Math.random() < 0.5 ? -1 : 1) * (th + 2 + Math.floor(Math.random() * 4)), 1 + Math.floor(Math.random() * 3), 1); }
    if (hit) { const bl = now - b.blk < 160, r = bl ? 4 : 7; irbDisc(ex, yc, r + 3, '#6fe0ff', 0.25 * k); irbDisc(ex, yc, r, '#aef6ff', 0.55 * k); irbDisc(ex, yc, Math.max(2, r - 3), '#ffffff', 0.95 * k); }
  }
  ctx.restore();
}
function irsFront(g, b, now, x, y, src) {      // the light at both palms while the beams are on, and the flames of his boots until he falls
  if (b.ph === 'drop' || b.ph === 'land') return; ctx.save();
  const k = b.on < 0 ? 0 : b.off < 0 ? 1 : Math.max(0, 1 - (now - b.off) / IRS.wind);
  if (k > 0 && b.pl) for (const p of [b.pl.L, b.pl.R]) { const px = Math.round(x + p.px) + 1, py = Math.round(y + p.py) + 1, r = Math.round((5 + (Math.floor(now / 50) % 3)) * k); if (r > 0) { irbDisc(px, py, r + 3, '#6fe0ff', 0.2 * k); irbDisc(px, py, r, '#d8faff', 0.8 * k); irbDisc(px, py, Math.max(1, r - 3), '#ffffff', k); } }
  const fy = Math.round(y) + 62; for (const dx of [-3, 3]) { const fx = Math.round(x) + 32 + dx, len = Math.round(11 + 5 * Math.sin(now / 41 + dx)); ctx.globalAlpha = 0.9; ctx.fillStyle = '#ff8a1e'; ctx.fillRect(fx - 2, fy, 5, len); ctx.fillStyle = '#ffd24a'; ctx.fillRect(fx - 1, fy, 3, Math.round(len * 0.7)); ctx.fillStyle = '#ffffff'; ctx.fillRect(fx, fy, 1, Math.round(len * 0.4)); }
  ctx.restore(); ctx.globalAlpha = 1;
}
