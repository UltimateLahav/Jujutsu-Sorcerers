// ================================================================ v1.191 IRON MAN'S MOVES (this file is spliced into template.html by build_html.py, right after iron.js)
// The user, after v1.190 (Iron Man walks and jumps in TRAINING): "add attack which will be a right hook and then a left hook and then a roundhouse kick and then a punch forward; if you jump and do punch at the same time then you will do a uppercut; and if i jump, wait 0.2 seconds to click and then i click punch then I will downslam (all this for iron man)". Asked, he chose: the uppercut throws the enemy up and the downslam knocks him down, a ROCKET uppercut (boot flames), and "block + dash", "crouch" and "hurt + K.O. pictures" too.
// ATTACK on the ground is a CHAIN within 0.7 s: R.HOOK, L.HOOK, R.KICK, the roundhouse (a kick at chest height) and PUNCH (a lunging straight punch that sends the enemy back). JUMP and ATTACK pressed together (within 0.12 s of each other, either one first) is the ROCKET UPPERCUT: he blasts up with his boots lit and the fist rises through the enemy's chin and throws him up. In the air, 0.2 s or more after the jump began, ATTACK is the DOWNSLAM: he dives with both fists and knocks the enemy onto the floor. His BLOCK is a high guard, his DASH a burst of the boots (forward: flames behind him; back: flames in front), he CROUCHES, and he has HURT and K.O. pictures. All times are real seconds (the game's clock runs PACE times faster, see irRate).
// ---- THE PICTURES: every move is a few KEY POSES of the suit (c4xIron, tools/chap4e.js: a pose is the hip, the lean, the head, both arms and both legs, see there) mixed into 15 pictures with an ease between the keys (irTrack); arms are [the far arm = his LEFT, the near arm = his RIGHT]. All of him fits the 64 x 64 window of iron.js (his hips are on column 32, 4 - 5 px further back in the blows, which step forward).
const IR_EZ = { io: u => u * u * (3 - 2 * u), in: u => u * u, out: u => 1 - (1 - u) * (1 - u), lin: u => u };
function irTrack(keys, n) {      // keys: [[picture, pose, ease of the way TO this key], ...]; returns n poses, the first key at its picture, the last held
  const out = [];
  for (let i = 0; i < n; i++) {
    let a = keys[0], b = keys[keys.length - 1];
    if (i <= keys[0][0]) b = a; else if (i >= keys[keys.length - 1][0]) a = b; else for (let j = 0; j < keys.length - 1; j++) if (i >= keys[j][0] && i <= keys[j + 1][0]) { a = keys[j]; b = keys[j + 1]; break; }
    out.push(a === b ? a[1] : c4xMixPose(a[1], b[1], (IR_EZ[b[2]] || IR_EZ.io)((i - a[0]) / (b[0] - a[0]))));
  }
  return out;
}
const IR_FT = [{ ax: 38, ay: C4IG, a: 0 }, { ax: 56, ay: C4IG, a: 0 }];      // (his feet in the fighting stance: 18 apart)
const IR_GA = [{ al: 44, el: 74 }, { al: 32, el: 82 }];      // (both fists up in front of the chin)
const IR_GD = ironPose({ x: 47, y: 63, lean: 8, hdx: 1.4, hdy: 1.5, hdt: 2, arms: IR_GA, legs: IR_FT });      // the guard: where every blow starts and ends
const IR_LUNGE = [{ ax: 30, ay: C4IG - 2, a: -26 }, { ax: 66, ay: C4IG, a: 0 }];      // (the back foot pushes off, the front foot is planted: the legs of a blow)
const irG = o => ironPose({ x: 47, y: 63, lean: 8, hdx: 1.4, hdy: 1.5, hdt: 2, arms: IR_GA, legs: IR_FT, ...o });
// the six blows: [name, damage, key poses, the picture it lands on, pictures a second, step forward (px), knock-back, launch (px), hit stop (ms), shake, down, spark height, the lift of every picture (px, a rise of the whole picture) or null]
const IR_BLOWS = [
  {
    n: 'R.HOOK', d: 8, f: 8, v: 38, m: 6, kn: 4, w: 2, h: 40, sy: 36, rx: 6, keys: [
      [0, IR_GD], [4, irG({ x: 45, y: 63.5, lean: -4, hdx: 1, hdt: -4, arms: [IR_GA[0], { al: -40, el: 100 }], legs: [{ ax: 34, ay: C4IG, a: 0 }, { ax: 58, ay: C4IG, a: 0 }] }), 'io'],
      [7, irG({ x: 48, y: 63, lean: 20, hdx: 1.7, hdy: 1.2, hdt: 6, arms: [IR_GA[0], { al: 62, el: 52 }], legs: [{ ax: 32, ay: C4IG - 1, a: -20 }, { ax: 64, ay: C4IG, a: 0 }] }), 'in'],
      [9, irG({ x: 48, y: 63, lean: 26, hdx: 2, hdy: 1.2, hdt: 8, arms: [{ al: 40, el: 76 }, { al: 112, el: -24 }], legs: IR_LUNGE }), 'out'], [14, IR_GD, 'io']]
  },
  {
    n: 'L.HOOK', d: 9, f: 8, v: 38, m: 6, kn: 5, w: 2, h: 45, sy: 36, rx: 5, keys: [
      [0, IR_GD], [4, irG({ x: 45, y: 63.5, lean: -4, hdx: 1, hdt: -4, arms: [{ al: -40, el: 100 }, IR_GA[1]], legs: [{ ax: 34, ay: C4IG, a: 0 }, { ax: 58, ay: C4IG, a: 0 }] }), 'io'],
      [7, irG({ x: 48, y: 63, lean: 20, hdx: 1.7, hdy: 1.2, hdt: 6, arms: [{ al: 62, el: 52 }, IR_GA[1]], legs: [{ ax: 32, ay: C4IG - 1, a: -20 }, { ax: 64, ay: C4IG, a: 0 }] }), 'in'],
      [9, irG({ x: 48, y: 63, lean: 26, hdx: 2, hdy: 1.2, hdt: 8, arms: [{ al: 112, el: -24 }, { al: 36, el: 80 }], legs: IR_LUNGE }), 'out'], [14, IR_GD, 'io']]
  },
  {
    n: 'R.KICK', d: 12, f: 8, v: 32, m: 12, kn: 9, w: 3, h: 55, sy: 38, rx: 1, kick: true, keys: [
      [0, IR_GD], [3, irG({ x: 44, y: 63.5, lean: -8, hdx: 1.2, hdt: -3, arms: [{ al: 50, el: 70 }, { al: -10, el: 60 }], legs: [{ ax: 42, ay: C4IG, a: 0 }, { ax: 52, ay: 76, a: 30 }] }), 'io'],
      [7, irG({ x: 42, y: 64, lean: -16, hdx: 0.8, hdt: -6, arms: [{ al: 60, el: 40 }, { al: -34, el: 30 }], legs: [{ ax: 40, ay: C4IG, a: 0 }, { ax: 66, ay: 54, a: 15 }] }), 'in'],
      [9, irG({ x: 42, y: 64, lean: -14, hdx: 0.8, hdt: -5, arms: [{ al: 60, el: 40 }, { al: -30, el: 30 }], legs: [{ ax: 40, ay: C4IG, a: 0 }, { ax: 62, ay: 58, a: 12 }] }), 'out'],
      [12, irG({ x: 44, y: 63.5, lean: -6, hdx: 1.2, hdt: -2, arms: [{ al: 50, el: 70 }, { al: 10, el: 60 }], legs: [{ ax: 42, ay: C4IG, a: 0 }, { ax: 52, ay: 76, a: 30 }] }), 'io'], [14, IR_GD, 'io']]
  },
  {
    n: 'PUNCH', d: M1_TO, f: 7, v: 30, m: 10, kn: 100, w: 4, h: 80, sy: 36, rx: 3, keys: [
      [0, IR_GD], [3, irG({ x: 42, y: 63.5, lean: -4, hdx: 1, hdt: -3, arms: [IR_GA[0], { al: 6, el: 112 }], legs: [{ ax: 34, ay: C4IG, a: 0 }, { ax: 58, ay: C4IG, a: 0 }] }), 'io'],
      [6, irG({ x: 44, y: 63.5, lean: 22, hdx: 1.8, hdy: 1.2, hdt: 6, arms: [IR_GA[0], { al: 90, el: 0 }], legs: IR_LUNGE }), 'in'],
      [8, irG({ x: 44, y: 63.5, lean: 24, hdx: 1.9, hdy: 1.2, hdt: 7, arms: [IR_GA[0], { al: 92, el: 0 }], legs: IR_LUNGE }), 'out'], [14, IR_GD, 'io']]
  }];
// the ROCKET UPPERCUT (4): it starts at once, coiled, boots lit; the fist passes the enemy's chin on the 3rd picture and goes on up (the whole picture rises, see lift), then he comes down. The suit is only 64 rows high, so while the arm is up he is coiled (hips low, knees tucked: the flames show under the boots) or the fist would leave the picture.
// the DOWNSLAM (5): in the air he winds up with both fists overhead, then dives forward and drives them down onto the enemy on the 8th picture, and lands; its lift is made when it starts (irDive) from where he is
const IR_UK = [0, 5, 14, 24, 33, 39, 41, 40, 36, 30, 22, 13, 5, 0];      // (the rise of every picture of the uppercut, px)
IR_BLOWS.push({
  n: 'UPPERCUT', d: 14, f: 3, v: 30, m: 14, e: 1, lt: 0.5, kn: 8, l: 44, w: 3, h: 70, sy: 40, lift: IR_UK, keys: [
    [0, irG({ x: 46, y: 68, lean: 10, hdx: 1.6, hdy: 1.5, hdt: 3, fl: 0.6, arms: [IR_GA[0], { al: 8, el: 100 }], legs: [{ ax: 38, ay: 83, a: -30 }, { ax: 50, ay: 84, a: -34 }] })],
    [2, irG({ x: 46, y: 70, lean: 2, hdx: 1.2, hdy: 1.5, hdt: -6, fl: 1, arms: [{ al: 52, el: 62 }, { al: 112, el: 14 }], legs: [{ ax: 40, ay: 82, a: -34 }, { ax: 50, ay: 83, a: -38 }] }), 'in'],
    [5, irG({ x: 45, y: 76, lean: -4, hdx: 1, hdy: 1.5, hdt: -10, fl: 1, arms: [{ al: 40, el: 60 }, { al: 156, el: 6 }], legs: [{ ax: 38, ay: 83, a: -34 }, { ax: 48, ay: 84, a: -38 }] }), 'out'],
    [9, irG({ x: 46, y: 70, lean: 0, hdx: 1.2, hdy: 1.5, hdt: -4, fl: 0.5, arms: [{ al: 56, el: 60 }, { al: 100, el: 30 }], legs: [{ ax: 40, ay: 84, a: -20 }, { ax: 50, ay: 85, a: -24 }] }), 'io'],
    [13, IR_GD, 'io']]
});
IR_BLOWS.push({
  n: 'DOWNSLAM', d: M1_TO, f: 8, v: 30, m: 12, kn: 10, w: 4, h: 80, dn: true, sy: 34, dive: true, keys: [
    [0, irG({ x: 45, y: 72, lean: -4, hdx: 1.2, hdy: 1.5, hdt: -6, fl: 0.7, arms: [{ al: 120, el: 40 }, { al: 126, el: 36 }], legs: [{ ax: 40, ay: 82, a: -30 }, { ax: 50, ay: 83, a: -34 }] })],
    [3, irG({ x: 44, y: 77, lean: -14, hdx: 1, hdy: 1.5, hdt: -14, fl: 0.8, arms: [{ al: 150, el: 20 }, { al: 156, el: 16 }], legs: [{ ax: 38, ay: 83, a: -34 }, { ax: 48, ay: 84, a: -38 }] }), 'io'],
    [6, irG({ x: 42, y: 66, lean: 34, hdx: 2.2, hdy: 2, hdt: 12, fl: 0.9, fa: 40, arms: [{ al: 70, el: 20 }, { al: 76, el: 16 }], legs: [{ ax: 30, ay: 74, a: -40 }, { ax: 38, ay: 76, a: -44 }] }), 'in'],
    [8, irG({ x: 40, y: 67, lean: 40, hdx: 2.4, hdy: 2, hdt: 14, fl: 0.7, fa: 40, arms: [{ al: 52, el: 14 }, { al: 58, el: 12 }], legs: [{ ax: 28, ay: 72, a: -40 }, { ax: 36, ay: 74, a: -44 }] }), 'lin'],
    [11, irG({ x: 44, y: 72, lean: 30, hdx: 1.8, hdy: 1.5, hdt: 10, arms: [{ al: 40, el: 50 }, { al: 36, el: 56 }], legs: [{ ax: 36, ay: C4IG, a: 0 }, { ax: 58, ay: C4IG, a: 0 }] }), 'out'],
    [14, IR_GD, 'io']]
});
// BLOCK (6): the guard goes up in two pictures (his hands are up from the 3rd, like everyone's) and stays: both forearms in front of the face, the palm lit
const IR_BLK = irG({ x: 46, y: 64, lean: 10, hdx: 1.4, hdy: 2, hdt: 4, rep: 1, arms: [{ al: 70, el: 100 }, { al: 52, el: 112 }], legs: [{ ax: 37, ay: C4IG, a: 0 }, { ax: 57, ay: C4IG, a: 0 }] });
const IR_BLOCK = [[0, IR_GD], [2, IR_BLK, 'out'], [4, { ...IR_BLK, y: 64.6, lean: 11 }, 'io'], [5, IR_BLK, 'io']];
// DASH (8 forward, 8 back): the boots burst: forward he leans into it, the arms swept back and the flames behind him; back he hovers away leaning back with the flames in front
const IR_DASH = [
  [0, irG({ x: 54, y: 63, lean: 22, hdx: 1.8, hdy: 1.5, hdt: 8, fl: 0.5, fa: 45, arms: [{ al: 20, el: 40 }, { al: 16, el: 36 }], legs: [{ ax: 44, ay: C4IG - 6, a: -20 }, { ax: 56, ay: C4IG - 8, a: -24 }] })],
  [3, irG({ x: 52, y: 68, lean: 52, hdx: 2.5, hdy: 2, hdt: 18, fl: 0.6, fa: 62, arms: [{ al: -30, el: 10 }, { al: -34, el: 8 }], legs: [{ ax: 33, ay: 76, a: -60 }, { ax: 39, ay: 78, a: -64 }] }), 'out'],
  [6, irG({ x: 52, y: 68, lean: 50, hdx: 2.5, hdy: 2, hdt: 16, fl: 0.5, fa: 62, arms: [{ al: -30, el: 10 }, { al: -34, el: 8 }], legs: [{ ax: 33, ay: 76, a: -60 }, { ax: 39, ay: 78, a: -64 }] }), 'lin'],
  [7, irG({ x: 50, y: 64, lean: 24, hdx: 1.8, hdy: 1.5, hdt: 8, fl: 0.3, fa: 45, arms: [{ al: 30, el: 50 }, { al: 24, el: 50 }], legs: [{ ax: 41, ay: C4IG - 3, a: -14 }, { ax: 55, ay: C4IG - 3, a: -16 }] }), 'io']];
const IR_DASHB = [
  [0, irG({ x: 46, y: 63, lean: -6, hdx: 1, hdy: 1.5, hdt: -4, fl: 0.6, fa: -50, arms: [{ al: 50, el: 70 }, { al: 36, el: 78 }], legs: [{ ax: 40, ay: C4IG - 5, a: 0 }, { ax: 54, ay: C4IG - 5, a: 0 }] })],
  [3, irG({ x: 46, y: 64, lean: -24, hdx: 0.4, hdy: 1.5, hdt: -12, fl: 0.7, fa: -55, arms: [{ al: 60, el: 60 }, { al: 44, el: 70 }], legs: [{ ax: 46, ay: C4IG - 8, a: 10 }, { ax: 58, ay: C4IG - 9, a: 6 }] }), 'out'],
  [6, irG({ x: 46, y: 64, lean: -22, hdx: 0.4, hdy: 1.5, hdt: -10, fl: 0.5, fa: -55, arms: [{ al: 60, el: 60 }, { al: 44, el: 70 }], legs: [{ ax: 46, ay: C4IG - 8, a: 10 }, { ax: 58, ay: C4IG - 9, a: 6 }] }), 'lin'],
  [7, irG({ x: 47, y: 63, lean: 4, hdx: 1.2, hdy: 1.5, hdt: 0, fl: 0.2, fa: -40, arms: IR_GA, legs: [{ ax: 40, ay: C4IG - 2, a: 0 }, { ax: 56, ay: C4IG - 2, a: 0 }] }), 'io']];
// CROUCH: 4 pictures down (played backwards to get up), a breathing idle of 8 and a shuffling walk of 8; HURT: a flinch (head snapped back), doubled over, and a stagger back, which are the reactions the game picks from; K.O.: he staggers and falls on his back (turned in irKo)
const IR_CRO = irG({ x: 45, y: 76, lean: 26, hdx: 1.8, hdy: 1, hdt: 8, arms: [{ al: 48, el: 76 }, { al: 36, el: 84 }], legs: [{ ax: 34, ay: C4IG, a: 0 }, { ax: 58, ay: C4IG, a: 0 }] });
const IR_HU = [[0, IR_GD], [2, irG({ lean: -10, hdx: 0.2, hdt: -28, arms: [{ al: 70, el: 50 }, { al: 60, el: 56 }] }), 'out'], [5, irG({ lean: -6, hdx: 0.4, hdt: -20, arms: [{ al: 64, el: 54 }, { al: 54, el: 60 }] }), 'io'], [7, IR_GD, 'io']];
const IR_HB = [[0, IR_GD], [2, irG({ y: 66, lean: 34, hdx: 2, hdy: 3, hdt: 24, arms: [{ al: 20, el: 90 }, { al: 14, el: 96 }] }), 'out'], [5, irG({ y: 65, lean: 28, hdx: 2, hdy: 2.5, hdt: 20, arms: [{ al: 24, el: 86 }, { al: 18, el: 92 }] }), 'io'], [7, IR_GD, 'io']];
const IR_HF = [[0, IR_GD], [2, irG({ x: 44, lean: -24, hdx: 0.4, hdt: -22, arms: [{ al: -20, el: 40 }, { al: 50, el: 30 }], legs: [{ ax: 34, ay: C4IG, a: 0 }, { ax: 50, ay: C4IG - 5, a: 10 }] }), 'out'], [5, irG({ x: 42, lean: -30, hdx: 0.2, hdt: -26, arms: [{ al: -30, el: 30 }, { al: 40, el: 40 }], legs: [{ ax: 32, ay: C4IG, a: 0 }, { ax: 46, ay: C4IG - 6, a: 10 }] }), 'io'], [9, IR_GD, 'io']];
function irRot(src, deg, px, py, dx, dy) {      // a picture turned counter-clockwise by deg about its point (px, py), which is put at (dx, dy) of a new 64 x 64 picture (the pixels are not smoothed)
  const c = document.createElement('canvas'); c.width = c.height = 64; const g = c.getContext('2d'); g.imageSmoothingEnabled = false;
  g.translate(dx, dy); g.rotate(-deg * Math.PI / 180); g.drawImage(src, -px, -py); return c;
}
function irKo() {      // the K.O. (12 pictures): he staggers back, his feet leave the floor and he falls on his back (the picture of the fall, turned about his hips and let down onto the floor), bounces once and lies there
  const A = irG({ x: 44, lean: -16, hdx: 0.4, hdt: -20, arms: [{ al: -30, el: 30 }, { al: 20, el: 40 }] }), B = irG({ x: 42, y: 64, lean: -28, hdx: 0.2, hdt: -28, arms: [{ al: -50, el: 20 }, { al: -30, el: 30 }], legs: [{ ax: 36, ay: C4IG, a: 0 }, { ax: 48, ay: C4IG - 8, a: 10 }] });
  const F = ironCut(irG({ x: 44, y: 64, lean: -26, hdx: 0.4, hdt: -26, arms: [{ al: -56, el: 30 }, { al: -40, el: 24 }], legs: [{ ax: 36, ay: 80, a: 20 }, { ax: 48, ay: 84, a: 10 }] }));
  const out = [ironCut(IR_GD), ironCut(A), ironCut(c4xMixPose(A, B, 0.5)), ironCut(B)];
  [[18, 0], [34, 0.15], [52, 0.35], [70, 0.6], [84, 0.85], [90, 1], [86, 0.9], [90, 1]].forEach(([deg, t]) => out.push(irRot(F, deg, 28, 33, 28 + 8 * t, 33 + 17 * t)));
  return out;
}
// ---- THE DATA: everything he cannot do in iron.js is made here the first time a Training room starts (or the first frame customScene plays him): the pictures of every move, the events of every blow (the same form as Ryu's: an IMPACT with its damage, knock-back, launch, hit stop, shake and the height of the sparks, and the limb as drawn on its picture, measured against the enemy's body), the speed, step and lift of each blow
function ironMoves(g) {
  if (g.moves) return; g.moves = true;
  const seq = (keys, n) => irTrack(keys, n).map(ironCut), tipOf = a => { const sp = cuSpan(a, r => r - 1), o = {}; for (const r in sp) o[r] = sp[r][1]; return o; };
  const atk = IR_BLOWS.map(b => seq(b.keys, b.lift ? b.lift.length : 15)), arts = atk.map(fr => fr.map(suAlpha)), cb = (f, fn) => ({ f, k: 'cb', cb: fn, c: 0, src: -1, id: 0 });
  const ev = IR_BLOWS.map((b, k) => {
    const tips = arts[k].map(tipOf), fx = [['k', b.kn, 0, 0, -1]].concat(b.l ? [['l', b.l, 0, 0, -1]] : [], [['h', b.h, 0, 1, 0], ['w', b.w, 0, 1, 0]], b.dn ? [['d', 0, 0, 1, 0]] : [], b.rx !== undefined ? [['r', b.rx, 0, 0, -1]] : [], [['y', b.sy, 0, 0, -1]]);
    const e = { f: b.f, k: 'i', d: b.d, sp: b.d, fx, c: 0, src: -1, id: 0 }; Object.defineProperty(e, 'dy', { get: () => Math.round(((dummy && dummy.airH) || 0) - (gojoLift || 0)), enumerable: true });      // (dy: how many rows higher the enemy's body is than his limb: an enemy thrown up, or he himself in the air, is met where they are NOW)
    e.tip = cuMaxRows([tips[b.f - 1], tips[b.f]]); const l = [e];
    if (k === 4) l.push(cb(14, () => snd('land', 1)));      // (the uppercut: he is back on the floor)
    if (k === 5) l.push(cb(11, now => { snd('land', 2); puff(wx + 4, 8); shakeUntil = Math.max(shakeUntil, now + 160); shakeAmp = Math.max(shakeAmp, 2); }));      // (the downslam: he lands in a cloud of dust)
    return l;
  });
  const ci = irTrack([[0, IR_CRO], [3, { ...IR_CRO, y: 76.6, lean: 27.5 }, 'io'], [7, IR_CRO, 'io']], 8).map(ironCut);
  const cwk = Array.from({ length: 8 }, (_, k) => { const u = k / 8 * 2 * Math.PI, leg = (ph, x0) => { const s = Math.sin(ph), lf = Math.max(0, Math.cos(ph)); return { ax: x0 + 5 * s, ay: C4IG - 2.5 * lf, a: 3 * lf }; }; return ironCut({ ...IR_CRO, y: 76 + 0.5 * Math.abs(Math.sin(u)), legs: [leg(u, 38), leg(u + Math.PI, 56)] }); });
  const hu = seq(IR_HU, 8), hb = seq(IR_HB, 8), hf = seq(IR_HF, 10), rows = [hu, hb, hf, hf, hf, hu, hu, hf, hb, hb];      // (the ten reactions the game picks from: 0, 5, 6 the head snaps back, 1, 8, 9 doubled over, 2, 3, 4, 7 a stagger back; each lasts as long as the enemy's own reaction does)
  Object.assign(g, {
    atk, ev, set: IR_BLOWS.map(b => ({ v: b.v, m: b.m, c: 0, d: 0, e: b.e, lt: b.lt })), rdy: [0, 1, 2, 3], an: IR_BLOWS.map(b => b.n), al: IR_BLOWS.map(() => null), vfx: IR_BLOWS.map(() => []), vxs: IR_BLOWS.map(() => []), tipAll: ev.map(l => cuMaxRows(l.map(e => e.tip))),
    cr: seq([[0, IR_GD], [3, IR_CRO, 'io']], 4), ci, cwk, bl: seq(IR_BLOCK, 6), df: seq(IR_DASH, 8), db: seq(IR_DASHB, 8), hu, hus: rows.map((f, k) => ({ f, ms: RX_DUR[k] / f.length })), ko: irKo()
  });
  g.st = { ...g.st, dfw: 60, dbk: 44, dtm: 240 };      // (his dash: a burst of 60 px forward, 44 back, 0.24 s)
}
// ---- WHAT customScene CALLS: irTick decides, every frame, what the JUMP and ATTACK presses do (the generic jump and attack of the engine are off for him, see custom.js)
const IR_SIM = 120, IR_AIR = 200;      // (real ms: JUMP and ATTACK this close together are the UPPERCUT; in the air, ATTACK from IR_AIR ms after the jump began is the DOWNSLAM, an ATTACK before that waits until then)
const irRate = () => (TR.spd && freePlay() ? TRS[TR.spd] : 1) * paceNow();      // (how many game ms pass in one real ms: the pace of the fight (1.25 or 1.5) and the GAME SPEED of SETTINGS > TRAIN)
let irChain = false, irDiveAt = 0;      // (the blow in progress is the first of a chain; when an ATTACK pressed in the air too early turns into the downslam, 0 = none)
function irDive(h0) {      // the rise of the downslam's 15 pictures: he hangs at h0 while he winds up, dives to where his fists meet the enemy (16 px, or h0 when he is lower than that) on the 8th picture and has landed by the 11th
  const top = Math.max(0, h0), imp = Math.min(16, top), t = [];
  for (let i = 0; i < 15; i++) t.push(Math.round(i <= 3 ? top : i <= 7 ? top + (imp - top) * IR_EZ.io((i - 3) / 4) : i <= 10 ? imp * (1 - (i - 7) / 3) : 0));
  return t;
}
function irStart(g, k, now, h0) {      // blow k begins: the state customScene plays it from (cuAtkK, cuAtkAt, the chain, the lift of its pictures)
  const b = IR_BLOWS[k], st = g.set[k];
  cuAtkK = k; cuAtkAt = now; cuFired = []; cuRes = []; cuLunged = 0; cuMs = 1000 / st.v; cuCmbBy = now + 1e9; cuAtkQ = 0; irDiveAt = 0; irChain = k === 0; cuCmb = k < 3 ? k + 1 : 0;
  if (b.dive) g.al[k] = irDive(h0); else if (b.lift) g.al[k] = b.lift.map((v, i) => Math.max(v, Math.round(h0 * Math.max(0, 1 - i / 4))));      // (the uppercut that begins in the air goes on from where he is)
  snd('swing', b.kick ? 3 : 0); if (k === 4) snd('thrust', 0.5);
}
function irCombo(g, now) { if (now > cuCmbBy) cuCmb = 0; irStart(g, g.rdy[cuCmb % g.rdy.length], now, 0); }      // (the next blow of the chain, the first one when the 0.7 s are over)
function irTick(g, now, ctl, jmp, atk) {
  if (!g.moves) ironMoves(g);
  const R = irRate(), sim = IR_SIM * R, wait = IR_AIR * R, idle = ctl && stance === 'stand' && !cuDash && blkAt < 0, h0 = Math.max(0, Math.round(gojoLift || 0)), air = cuJumpAt >= 0, el = air ? now - cuJumpAt : 0;
  if (!air) irDiveAt = 0;
  let J = jmp && idle, A = atk && idle;      // (the presses that count: only while he can act)
  if (J && A && cuAtkAt < 0 && !air) { irStart(g, 4, now, 0); J = A = false; }      // 1. the ROCKET UPPERCUT: JUMP and ATTACK together ...
  else if (A && air && cuAtkAt < 0 && el <= sim) { cuJumpAt = -1; irStart(g, 4, now, h0); J = A = false; }      // ... or ATTACK just after the jump began ...
  else if (J && cuAtkAt >= 0 && irChain && cuAtkK === 0 && now - cuAtkAt <= sim) { cuCmb = 0; irStart(g, 4, now, 0); J = A = false; }      // ... or JUMP just after the first blow began (it is dropped)
  if (J && cuAtkAt < 0 && !air) { cuJumpAt = now; cuJumpC = false; snd('jump'); snd('thrust', g.jet); }      // 2. JUMP
  if (A) {      // 3. ATTACK
    if (cuAtkAt >= 0) cuAtkQ = now + 450;      // (a press during a blow is kept for 0.45 s: the next blow of the chain follows at once)
    else if (air) { if (el >= wait) { cuJumpAt = -1; irStart(g, 5, now, h0); } else irDiveAt = cuJumpAt + wait; }      // (in the air: the DOWNSLAM, from 0.2 s after the jump began; a press before that is kept until then)
    else irCombo(g, now);
  } else if (cuAtkAt < 0 && idle) {
    if (air && irDiveAt > 0 && now >= irDiveAt) { cuJumpAt = -1; irStart(g, 5, now, h0); }
    else if (!air && cuAtkQ > now) irCombo(g, now);
  }
  if (cuAtkAt >= 0 && cuAtkK < 4 && cuAtkQ > now && idle && now - cuAtkAt >= g.atk[cuAtkK].length * cuMs) { cuCmbBy = now + 700; irCombo(g, now); }      // (a press that was kept while a blow of the chain went on: the next blow begins in the very frame the one before it is over, so that no picture of his idle comes between two blows)
}
const irLabel = (g, now) => cuJumpAt >= 0 && cuAtkAt < 0 ? 'DOWNSLAM' : g.an[g.rdy[(now > cuCmbBy ? 0 : cuCmb) % g.rdy.length]];      // (what the ATTACK button says: in the air the downslam, on the ground the blow that comes next)
