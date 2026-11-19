// ================================================================ v1.211 CHAPTER 5, PART 3: THE BATTLE IN THE HUGE ROOM (Yuji against Iron Man; the scene before it is tools/chap5b.js)
// After Tony's charge in the huge room (the dodge, or the wall) and his landing, the picture goes black and a real fight begins: the VERSUS engine with Yuji as your fighter and Iron Man as the enemy (the story fight 'k5': vs.k5; vs.story is true too, so there is no timer, no rounds, no FATALITY, no pace).
// WHAT IS DIFFERENT FROM A VERSUS FIGHT: (1) the picture is turned over: Iron Man is on the LEFT and Yuji on the RIGHT (the engine still has you on the left and him on the right: everything is drawn, the canvas is flipped just before the bars and the numbers, so the text is not, and the left and right controls are swapped
// (k5In, setStick): you walk to the left to reach him; the bars and names are swapped (drawVs0, drawHits, drawPopups). (2) YUJI IN BLACK FLASH MODE, as in chapter 4's fight against Meguna: walking, jumping, dashing, blocking and crouching, and ONE attack: the BLACK FLASH on the ATTACK button (it says FLASH): standing the punch (strip 20), in the air the kick
// to the head (21), crouched the blow to the stomach (22); a RING is put on the enemy where he is going the moment you press (k5BfStart), and when the fist lands (hitFoe) it is a full BLACK FLASH if he is still inside the ring (and not already reeling from a blow), else a WEAK one (a quarter of the damage); all of Yuji's damage is halved (INH_DMG) as in chapter 4. No BLUE, MODE, DOMAIN or FATAL.
// (3) IRON MAN has every ability he has as an enemy and the ULTIMATE (the UNIBEAM) only when he FEELS THREATENED (k5Threat: his health is below 60%, or he has lost 22% of it in 7 s, or two perfect Black Flashes hit him in 10 s). (4) THE ARENA is the huge hall (k5Back), 60 m wide with a wall at each end. (5) NOBODY CAN DIE: nobody's health goes below 1, there is no round, no result screen; the pause menu's MENU leaves to the chapter list. v1.216: when HIS health is at its floor the story goes on (tools/westcity.js: the building shakes, he raises his palm, Yuji is sent to West City, black, the chapter list).
// It begins when chapter 5's part 2 is over (k5FightGo, called by k5Step2 in chap5b.js); chapter 5 counts as finished from that moment (storyDone16).
const K5A = { lo: -300, hi: 300, gap: 70 };      // (the arena in the engine's coordinates: the left and right wall, how far apart they start)
const K5_KIT = new Set(['y_crouch', 'y_dash', 'y_block', 'y_cpunch']);      // (the skills Yuji has in this fight: owns() answers from this list while vs.k5)
const k5In = k => vs && vs.k5 && (k === 'L' || k === 'R') ? (k === 'L' ? 'R' : 'L') : k;      // (the left and right controls: the key's meaning in the engine's own direction)

function k5New() { return { ring: null, cur: null, dm: [], pf: [], bf: 0, weak: 0, px: 0, v: 0, at: -1, t0: 0 }; }      // (the ring, the last Black Flash's verdict, the damage Iron Man took lately [t, dm], the perfect ones' times, counts, where he was a frame ago and how fast he moves, the swing the ring was made for)
function k5FightGo() {      // the end of part 2: chapter 5 counts as finished, the story scene is over, the fight begins (from black)
  storyDone16(); c4xOff(); startMatch(3, 'k5', 0, 'cu5');
}
function k5Begin(t) {      // beginRound of the fight: the buttons as in chapter 4's fight (the ATTACK button says FLASH, see drawScene), the picture comes up from black, the two of them in the middle of the hall
  document.body.classList.add('c4'); wx = 0; wxv = 0; cm = 0; blackUntil = t + 800;
  if (dummy) { dummy.x = wx + K5A.gap; vs.k5.px = dummy.x; }
}
function k5Off() { if (!c4x) document.body.classList.remove('c4'); }      // (show() calls it for every screen: the buttons that the fight hides come back)
function k5Leave() { const a = story ? story.slot : -1; svSel = a; svView = 1; $('vsres').classList.remove('on'); show('saves'); renderSaves(); }      // (the MENU button: back to the chapter list of the save; show() puts the buttons back)
function k5Threat(now) {      // does Iron Man FEEL threatened? (his health below 60%, 22% of it lost in 7 s, or two perfect Black Flashes in 10 s)
  const K = vs.k5, d = dummy; if (!K || !d) return false; K.dm = K.dm.filter(e => now - e[0] < 7000); K.pf = K.pf.filter(t => now - t < 10000);
  const lost = K.dm.reduce((s, e) => s + e[1], 0);
  return d.hp < 0.6 * d.max || lost >= 0.22 * d.max || K.pf.length >= 2;
}
function k5Tick(now, dt) {      // every frame of the fight: the walls of the hall, nobody's health runs out (the other safeguards are in vsHurt, hitFoe and koDummy), how fast the enemy moves, and the ring of a Black Flash that has just begun
  const K = vs.k5, d = dummy; wx = Math.max(K5A.lo, Math.min(K5A.hi, wx));
  if (vs.hp < 1) vs.hp = 1; if (vs.sh < 1) vs.sh = 1;
  if (d && d.ko < 0 && !(K.end && K.end.wc)) { d.x = Math.max(K5A.lo - 6, Math.min(K5A.hi + 6, d.x)); if (d.hp < 1) d.hp = 1; if (d.shown < 1) d.shown = 1; K.v = dt > 0 ? (d.x - K.px) / dt : 0; K.px = d.x; }
  if (d && d.ko < 0 && d.hp <= 1 && !K.end && !K.noEnd) k5EndGo(now);      // (v1.216 his health is at its floor: the end of the fight, tools/westcity.js; K.noEnd is for the scan, which takes him to 1 health many times)
  if (K.end) k5EndTick(now, dt); else if (atkAt >= 0 && atkK >= 20 && atkK <= 22 && K.at !== atkAt) { K.at = atkAt; k5BfStart(now); }
}

// ---- YUJI'S BLACK FLASH: the ring
function k5BfStart(now) {      // a Black Flash begins (atkK 20, 21 or 22): the ring goes where he is going, no further than the fist can reach
  const K = vs.k5, d = dummy; K.ring = null; K.cur = null; if (!d || d.ko >= 0 || !K) return;
  const k = atkK, S = C4YJ[k === 20 ? 'p' : k === 21 ? 'k' : 'g'], imp = YU_ATK.imp[k][0] / YU_ATK.fps[k], lift = airUp(d) ? (d.airH || 0) : 0, v = Math.max(-160, Math.min(160, K.v || 0));
  const x = Math.max(wx + 12, Math.min(wx + S.reach + S.lunge, d.x + v * imp));
  K.ring = { k, x, lift, t0: atkAt, ms: imp * 1000, h: S.ring };
}
function k5BfDmg(now) {      // the Black Flash lands (hitFoe): the verdict of the ring and the damage (as chapter 4's Meguna fight: half of the Black Flash's own numbers, a quarter of that when it is weak)
  const K = vs.k5, d = dummy, r = K.ring, full = Math.round(BF_DMG[atkK - 20] * INH_DMG), hurt = now < (d.stunUntil || 0) || now - d.rxAt < RX_DUR[d.rx];
  const lift = airUp(d) ? (d.airH || 0) : 0, perfect = !!r && r.k === atkK && Math.abs(d.x - r.x) <= 13 && Math.abs(lift - r.lift) <= 16 && !hurt;
  K.cur = { perfect, k: atkK }; if (perfect) { K.bf++; K.pf.push(now); } else K.weak++;
  return perfect ? full : Math.max(1, Math.round(full * 0.25));
}
function k5Hurt(dm, now) { const K = vs.k5; if (K) K.dm.push([now, dm]); }      // (what Iron Man has lost lately, for k5Threat)
function k5Say(now, perfect) {      // what a Black Flash looks and sounds like once the ring has judged it (called by hitFoe, as chapter 4's c4xYImpact does): a perfect one shakes the screen and flashes, a weak one says WEAK and barely moves him
  if (perfect) { snd('yfbf'); shakeUntil = now + 360; shakeAmp = 5; flash(now, 120, 0.4); buzz(90); }
  else { say('WEAK', dummy.x, '#9a9ab0', 8, now); hitStop(45); shakeUntil = now + 90; shakeAmp = 1; }
}
function k5RingDraw(now) {      // the ring, over him: it grows brighter and flashes just before the impact (c4xRing, as in chapter 4)
  const K = vs.k5, r = K && K.ring; if (!r) return; const e = now - r.t0; if (e > r.ms + 60 || atkAt < 0 || atkK !== r.k) { K.ring = null; return; }
  const cx = Math.round(VW / 2), sx = cx + Math.round(r.x - wx), sy = gy - r.h - Math.round(r.lift), k = Math.min(1, e / r.ms), bright = e >= r.ms - 90;
  ctx.globalAlpha = bright ? 1 : 0.35 + 0.5 * k; c4xRing(sx, sy, 13, bright ? '#ffffff' : '#ff6a7a'); if (bright) c4xRing(sx, sy, 14, '#ff2a3a'); ctx.globalAlpha = 1;
}

// ---- THE PICTURE TURNED OVER (the canvas is flipped after the world, before the numbers and the bars)
function k5Flip() {
  const w = cv.width, h = cv.height, f = k5Flip.c || (k5Flip.c = document.createElement('canvas')); if (f.width !== w || f.height !== h) { f.width = w; f.height = h; }
  const g = f.getContext('2d'); g.setTransform(1, 0, 0, 1, 0, 0); g.globalCompositeOperation = 'copy'; g.drawImage(cv, 0, 0);
  ctx.save(); ctx.setTransform(-1, 0, 0, 1, w, 0); ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'copy'; ctx.imageSmoothingEnabled = false; gDI.call(ctx, f, 0, 0); ctx.restore();      // (the browser's own drawImage: the trail and shadow hook of tools/gfx.js must not treat the whole picture as a sprite)
}

// ---- THE HUGE HALL (the arena): the walls and pillars of chapter 5's huge room, the floor, a wall at each end
function k5Back(now) {
  const cx = Math.round(VW / 2), X = x => cx + Math.round(x - wx), lo = wx - VW * 0.8, hi = wx + VW * 0.8, x0 = X(lo), ww = hi - lo, CE = gy - 260, f = k5F, H4 = 4 * VH, t = now / 1000;
  f('#090c11', x0, gy - H4, ww, H4 - 260);
  for (let i = 0; i < 8; i++) f(['#141a25', '#161d29', '#182030', '#1b2434', '#1e2839', '#222d40', '#263249', '#2a374e'][i], x0, CE + i * 33, ww, 34);
  for (let k = Math.floor(lo / 120); k * 120 < hi; k++) { f('#0f141d', X(k * 120), CE, 2, 260); f('#33405a', X(k * 120) + 2, CE, 1, 260); }
  for (const dy of [60, 132, 204]) { f('#0f141d', x0, gy - dy, ww, 1); f('#2d3a52', x0, gy - dy + 1, ww, 1); }
  f('#0a0d13', x0, CE, ww, 4); for (let k = Math.floor(lo / 40); k * 40 < hi; k++) f('#0a0d13', X(k * 40), CE + 4, 2, 10);
  for (let k = Math.floor((lo - 40) / 300); k * 300 + 40 < hi; k++) { const px = k * 300 + 40, sx = X(px); f('#202938', sx - 20, CE, 40, 260); f('#34425c', sx + 14, CE, 6, 260); f('#141a25', sx - 20, CE, 3, 260); f('rgba(70,200,240,0.85)', sx - 15, CE, 2, 260); f('rgba(70,200,240,0.14)', sx - 19, CE, 8, 260); for (let y = 20; y < 260; y += 70) { f('#141a25', sx - 22, gy - y, 44, 4); f('#3a4a68', sx - 22, gy - y, 44, 1); } f('rgba(70,200,240,0.10)', sx - 15, gy, 2, 40); }
  f('#0d121b', x0, gy - 132, ww, 5); f('#27324a', x0, gy - 142, ww, 1); for (let k = Math.floor(lo / 22); k * 22 < hi; k++) f('#27324a', X(k * 22), gy - 142, 1, 10);
  for (let k = Math.floor((lo - 190) / 300); k * 300 + 190 < hi; k++) { const lx = X(k * 300 + 190); f('#0d121b', lx - 1, CE + 4, 2, 38); f('#2a3347', lx - 22, CE + 42, 44, 5); f('#fff6dc', lx - 18, CE + 47, 36, 2); ctx.fillStyle = 'rgba(255,244,214,0.05)'; ctx.beginPath(); ctx.moveTo(lx - 18, CE + 49); ctx.lineTo(lx + 18, CE + 49); ctx.lineTo(lx + 100, gy); ctx.lineTo(lx - 100, gy); ctx.fill(); }
  const wl = X(K5A.lo - 18), wr = X(K5A.hi + 18);      // (the wall at each end: dark, with a cyan strip where it meets the hall)
  f('#0e131b', x0, gy - H4, wl - x0, H4 + VH * 2); f('#46c8ee', wl - 1, CE, 1, 260); f('rgba(70,200,240,0.16)', wl - 4, CE, 3, 260);
  f('#0a0d12', wr, gy - H4, X(hi) - wr + 2, H4 + VH * 2); f('#46c8ee', wr, CE, 1, 260); f('rgba(70,200,240,0.16)', wr + 1, CE, 3, 260);
  f('#363e50', x0, gy, ww, 3 * VH); f('#4c586e', x0, gy, ww, 1); for (const dy of [7, 17, 31, 49]) f('#2a3140', x0, gy + dy, ww, 1);
  ctx.strokeStyle = '#2a3140'; ctx.lineWidth = 1; ctx.beginPath(); for (let k = Math.floor(lo / 70); k * 70 < hi; k++) { const sx = X(k * 70); ctx.moveTo(sx, gy + 1); ctx.lineTo(sx + (k * 70 - wx) * 0.5, gy + VH); } ctx.stroke();
  for (let i = 0; i < 3; i++) f('rgba(130,160,200,0.07)', x0, gy - 20 - i * 24, ww, 24);
  ctx.fillStyle = 'rgba(255,244,214,0.5)'; for (let i = 0; i < 14; i++) { const px = lo + ((i * 97 + t * 4 * (1 + i % 3 * 0.4)) % (hi - lo)), py = gy - 30 - ((i * 53 + t * 5) % 200); ctx.fillRect(Math.round(X(px)), Math.round(py), 1, 1); }
}
window.__k5f = () => vs && vs.k5 ? { me: vs.me, foe: vs.foe, hp: Math.round(vs.hp), ehp: dummy ? Math.round(dummy.hp) : -1, emax: dummy ? dummy.max : -1, wx: Math.round(wx), ex: dummy ? Math.round(dummy.x) : 0, ph: vs.ph, bf: vs.k5.bf, weak: vs.k5.weak, ring: !!vs.k5.ring, threat: k5Threat(pnow()), fa: dummy && dummy.fa ? dummy.fa.type : '', end: vs.k5.end ? { ts: vs.k5.end.ts, wc: vs.k5.end.wc, T: vs.k5.end.ts < 0 ? -1 : +((pnow() - vs.k5.end.ts) / 1000).toFixed(2) } : null } : null;      // test hook
