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
// ---- v1.192 THREE MORE MOVES. The user, after v1.191: "if I crouch and punch I will do 2 lower punches, and if I dash and I punch I will do the same punch that Iron Man almost did on Yuji at the end of chapter 5, and if I double dash back I will do a backflip using the thrusters in the legs to help Iron Man backflip back (no questions asked)".
// CROUCHED, ATTACK throws the LOW JABS (blow 6): two quick low punches, right and left, one press (a press kept during them throws two more); they reach a crouching enemy too (low). DASH and then ATTACK (or both together) is the CHARGE (blow 7), the punch of chapter 5: he crouches back with his fist drawn, lights the boots and flies at the enemy lying flat, the fist straight out, one leg trailing and the other bent, the flames behind him; the fist is tried on every picture of the flight, the first time it touches him it lands (or is blocked) and he stops; one that touches nothing carries him as far as 150 px and he lands. A second DASH BACK within 0.5 s of the first is the BACKFLIP (blow 8): the boots burst, he rises curled up and turns over backwards with the flames lit, opens and lands 70 px behind where he was, out of reach while he is high. All the times are real seconds (see irRate).
const IR_CA = [{ al: 48, el: 76 }, { al: 36, el: 84 }], IR_CL = [{ ax: 34, ay: C4IG, a: 0 }, { ax: 58, ay: C4IG, a: 0 }];      // (the crouch's arms and feet, see IR_CRO)
const crG = o => irG({ x: 45, y: 76, lean: 26, hdx: 1.8, hdy: 1, hdt: 8, arms: IR_CA, legs: IR_CL, ...o });
const IR_JA = { al: 66, el: 6 }, IR_JB = { al: -24, el: 96 }, IR_JL = [{ ax: 33, ay: C4IG - 1, a: -14 }, { ax: 60, ay: C4IG, a: 0 }];      // (a low jab: the arm out, a little downwards; the arm drawn back to the hip; the back foot pushes)
IR_BLOWS.push({
  n: 'LOW JABS', d: 5, f: 4, v: 36, m: 9, e: 1, lt: 0.45, kn: 3, w: 1, h: 40, sy: 22, rx: 1, low: true, np: 12, imp: [
    { f: 4, d: 5, kn: 3, w: 1, h: 36, sy: 22, rx: 1 }, { f: 8, d: 6, kn: 5, w: 2, h: 46, sy: 22, rx: 8 }], keys: [
    [0, IR_CRO], [1, crG({ x: 43, lean: 22, hdx: 1.5, hdt: 4, arms: [IR_CA[0], IR_JB] }), 'io'],
    [3, crG({ x: 43, lean: 32, hdx: 2.2, hdt: 10, arms: [IR_CA[0], IR_JA], legs: IR_JL }), 'in'], [4, crG({ x: 43, lean: 33, hdx: 2.3, hdt: 11, arms: [IR_CA[0], { al: 68, el: 2 }], legs: IR_JL }), 'out'],
    [5, crG({ x: 44, lean: 28, hdx: 1.8, hdt: 8, arms: [IR_JB, IR_CA[1]] }), 'io'],
    [7, crG({ x: 43, lean: 32, hdx: 2.2, hdt: 10, arms: [IR_JA, IR_CA[1]], legs: IR_JL }), 'in'], [8, crG({ x: 43, lean: 33, hdx: 2.3, hdt: 11, arms: [{ al: 68, el: 2 }, IR_CA[1]], legs: IR_JL }), 'out'],
    [10, IR_CRO, 'io'], [11, IR_CRO]]
});
const IR_CHP = [0, 0, 0, 0, 0, 0, 0, 8, 24, 46, 70, 92, 110, 124, 135, 143, 148, 151, 152, 152, 152, 152, 152, 152, 152, 152, 152];      // (the CHARGE: how far he has flown at the start of each of its 26 pictures, px; the flight is pictures 7 - 17)
const IR_CHD = [0, 0, 0, 0, 0, 0, 26, 62, 90, 90, 90, 90, 90, 90, 90, 90, 72, 46, 20, 0, 0, 0, 0, 0, 0, 0];      // (how far he is turned forward on each picture, degrees)
IR_BLOWS.push({ n: 'CHARGE', d: 14, v: 36, m: 0, kn: 150, w: 5, h: 90, sy: 44, rx: 3, dn: true, chg: true, mk: () => irChargePics(), lift: [0, 0, 0, 0, 0, 0, 3, 7, 9, 9, 9, 9, 9, 9, 9, 9, 9, 7, 4, 2, 0, 0, 0, 0, 0, 0], keys: [] });
const IR_BFD = [0, 0, 20, 58, 108, 162, 216, 270, 318, 348, 360, 360, 360, 360, 360, 360];      // (the BACKFLIP: how far he is turned backward on each of its 16 pictures, degrees)
IR_BLOWS.push({ n: 'BACKFLIP', d: 0, v: 24, m: -70, e: 1, lt: 0.9, kn: 0, w: 0, h: 0, sy: 0, flip: true, mk: () => irFlipPics(), lift: [0, 6, 16, 24, 30, 33, 34, 33, 30, 24, 16, 8, 2, 0, 0, 0], keys: [] });
// ---- v1.193 THE REPULSOR MODE. The user, after v1.192: "add to iron man a repulsor mode which makes his M1's be blasts from his right hand and the second is left hand, that's it for now, no questions needed".
// The MODE button (key E; it was hidden for him until now) switches the mode on and off (g.rp). In the mode the M1 of the ground, the chain of ATTACK presses, is R.BLAST (blow 9: a bolt from his right hand) and then L.BLAST (blow 10: from his left hand), and then again; everything else (the rocket uppercut, the downslam, the low jabs, the charge, the backflip) is as it was. A blast is a SHOT of the engine (an 'o' event, like Sukuna's slashes): the arm comes up and points at the enemy with the palm lit (pose number `rr` for the right hand, `rep` for the left, see c4xDrawIron), on the 4th picture a bolt leaves the palm (`x0`: where) and flies at IR_BSP px a second until it touches the enemy (the bolt's picture against his body: the rows they share), a blocker blocks it, or it is 1.2 s old.
const IR_BR = irG({ x: 46, lean: -2, hdx: 1.2, hdt: -2, rr: 1, arms: [IR_GA[0], { al: 84, el: 2 }] }), IR_BLF = irG({ x: 46, lean: -2, hdx: 1.2, hdt: -2, rep: 1, arms: [{ al: 90, el: 2 }, IR_GA[1]] });      // (the poses a blast is fired from: the arm straight out at the enemy, the palm lit)
const IR_RP = [9, 10], irM1 = k => k < 4 || k === 9 || k === 10, irRdy = g => g.rp ? IR_RP : g.rdy;      // (the blows of the chain in the repulsor mode; the blows of ATTACK on the ground; the chain that is on now)
function irBlastKeys(right) {      // the key poses of a blast from one hand: the arm comes up, it points at the enemy with the palm lit (picture 4: the bolt leaves), the body kicks back a little and the arm comes down
  const fire = right ? IR_BR : IR_BLF, ai = right ? 1 : 0, gl = right ? 'rr' : 'rep', arm = o => right ? [IR_GA[0], o] : [o, IR_GA[1]];
  return [[0, IR_GD],
    [1, irG({ x: 47, lean: 6, hdx: 1.5, hdt: 3, [gl]: 0.5, arms: arm({ al: 62, el: 52 }) }), 'out'],
    [3, fire, 'in'],
    [4, { ...fire, x: 44, lean: -8, hdx: 0.8, hdt: -6, legs: [{ ax: 36, ay: C4IG, a: 0 }, { ax: 58, ay: C4IG, a: 0 }], arms: arm({ al: fire.arms[ai].al + 3, el: 0 }) }, 'out'],
    [6, irG({ x: 45, lean: -4, hdx: 1, hdt: -3, [gl]: 0.5, arms: arm({ al: 78, el: 10 }) }), 'io'],
    [9, IR_GD, 'io']];
}
const IR_BSP = 420;      // (the speed of a bolt, px a second)
IR_BLOWS.push({ n: 'R.BLAST', d: 6, f: 4, v: 26, m: 0, kn: 2, w: 1, h: 30, rx: 6, shot: true, fire: IR_BR, arm: 1, spd: IR_BSP, ms: 1200, np: 10, keys: irBlastKeys(true) });
IR_BLOWS.push({ n: 'L.BLAST', d: 7, f: 4, v: 26, m: 0, kn: 2, w: 1, h: 35, rx: 5, shot: true, fire: IR_BLF, arm: 0, spd: IR_BSP, ms: 1200, np: 10, keys: irBlastKeys(false) });
function irBolts(b) {      // the pictures of a blast's bolt (3, a shot is drawn 62 px above the floor line) and where it leaves: the glow of the palm of the pose he fires from, found from the rig of that pose (c4xRig); { pics, x0: the column of the palm from his middle column, sy: how high above the floor it is }
  const J = c4xRig(C4I, b.fire), a = J.arms[b.arm], gx = a.h[0] + Math.sin(a.a2) * 2.4, gy = a.h[1] + Math.cos(a.a2) * 2.4, row = Math.round(gy - IRON_OY);
  return { pics: [0, 1, 2].map(ph => irBoltCv(ph, row + 1)), x0: Math.round(gx - IRON_OX - 32) + 1, sy: 61 - row, px: Math.round(gx - IRON_OX), py: row };
}
function irFlashAt(cv, px, py, k) {      // the flash of a repulsor at the palm, drawn on a picture of the blast: a white core in two pale blue rings (k: how strong, 0 - 1)
  const g = cv.getContext('2d'); for (const [r, col, a] of [[5, '#6fe0ff', 0.3 * k], [3, '#aef6ff', 0.55 * k], [2, '#ffffff', 0.95 * k]]) { g.globalAlpha = a; g.fillStyle = col; for (let y = -r; y <= r; y++) { const w = Math.floor(Math.sqrt(r * r - y * y)); g.fillRect(px + 1 - w, py + y, w * 2 + 1, 1); } } g.globalAlpha = 1;
}
function irBoltCv(ph, row) {      // a bolt of the repulsor on a 64 x 64 canvas: its middle on column 32 and `row`; a white core, a pale blue body, a blue glow at the edge, and streaks of light behind it (ph 0 - 2: it pulses)
  const c = document.createElement('canvas'); c.width = c.height = 64; const g = c.getContext('2d'), R = [4.6, 4.1, 4.9][ph % 3];
  const dot = (x, y, col, a) => { g.globalAlpha = a; g.fillStyle = col; g.fillRect(x, y, 1, 1); };
  for (let i = -2; i <= 2; i++) { const len = 6 + ((i + 3) * 3 + ph * 2) % 7; for (let k = 0; k < len; k++) dot(32 - 4 - k, row + i, i === 0 ? '#ffffff' : '#aef6ff', (i === 0 ? 0.8 : 0.45) * (1 - k / len)); }      // (the streaks behind it)
  for (let y = -6; y <= 6; y++) for (let x = -6; x <= 6; x++) { const d = Math.hypot(x, y); if (d <= R) dot(32 + x, row + y, d <= 1.6 ? '#ffffff' : d <= R * 0.62 ? '#d8faff' : '#7fe6ff', d > R - 0.9 ? 0.55 : 1); }
  g.globalAlpha = 1; return c;
}
function irToggle(g, now) {      // the MODE button: the repulsor mode on / off (the next ATTACK begins the chain of the mode with the right hand); a burst of light round him
  g.rp = !g.rp; cuCmb = 0; cuCmbBy = 0; snd(g.rp ? 'ceon' : 'ceoff'); if (g.rp) flash(now, 140, 0.2);
  const cols = g.rp ? ['#ffffff', '#aef6ff', '#6fe0ff'] : ['#aef6ff', '#5aa8c0']; spark(wx, gy - 34, g.rp ? 9 : 6, cols, false, 1); spark(wx, gy - 34, g.rp ? 9 : 6, cols, false, -1);
}
function irModeUI(g) {      // every frame: the MODE button's name and light follow the mode (setModeUI of the others writes the button now and then, so it is checked every time, like Ryu's)
  const el = $('cel'), b = $('ce'), on = !!g.rp, want = 'MODE<br>' + (on ? 'REPULSOR' : 'OFF'), p = on ? 'true' : 'false', aria = on ? 'Mode: Repulsor is on, tap to switch it off. His attacks are blasts from his right hand and then his left hand' : 'Mode: tap to switch Repulsor on. His attacks become blasts from his right hand and then his left hand';
  if (el.innerHTML !== want) el.innerHTML = want;
  if (b.classList.contains('lit') !== on) b.classList.toggle('lit', on);
  b.classList.remove('red', 'fl'); if (b.getAttribute('aria-pressed') !== p) b.setAttribute('aria-pressed', p); if (b.getAttribute('aria-label') !== aria) b.setAttribute('aria-label', aria);
}
function irSpin(pose, deg) {      // a pose of the BACKFLIP as a usual 64 x 64 picture, turned deg degrees BACKWARD (counter-clockwise) about his hips, which stay where they are in the usual window
  const c = document.createElement('canvas'); c.width = c.height = 64; const g = c.getContext('2d'); g.imageSmoothingEnabled = false;
  const r = deg * Math.PI / 180, cs = Math.abs(Math.cos(r)) < 1e-9 ? 0 : Math.cos(r), sn = Math.abs(Math.sin(r)) < 1e-9 ? 0 : Math.sin(r);
  g.setTransform(cs, -sn, sn, cs, pose.x - IRON_OX, pose.y - IRON_OY); g.drawImage(c4xIron(pose), -pose.x, -pose.y); return c;
}
function irWide(pose, deg, i) {      // a pose of the CHARGE as a picture 128 x 64: 28 columns more on the left of the usual window (c.ox, which customScene draws it from), because lying flat he is 75 px long; turned deg degrees FORWARD (clockwise) about his hips, which go from where they stand (deg 0) to column 60 (= the usual middle column 32 + 28) and row 28 when he flies flat (deg 90); i = the picture (the speed lines move)
  const c = document.createElement('canvas'); c.width = 128; c.height = 64; c.ox = 28; const g = c.getContext('2d'); g.imageSmoothingEnabled = false;
  const f = deg / 90, hx = (pose.x + 12) * (1 - f) + 60 * f, hy = (pose.y - IRON_OY) * (1 - f) + 28 * f;
  if (deg > 50) { g.fillStyle = 'rgba(255,243,200,' + (0.3 + 0.35 * f).toFixed(2) + ')'; for (let s = 0; s < 6; s++) g.fillRect(2 + ((i * 9 + s * 11) % 13), Math.round(hy) - 15 + s * 6, 12 + (s * 5) % 9, 1); }      // (the air streaming past)
  const r = deg * Math.PI / 180, cs = Math.abs(Math.cos(r)) < 1e-9 ? 0 : Math.cos(r), sn = Math.sin(r);
  g.setTransform(cs, sn, -sn, cs, hx, hy); g.drawImage(c4xIron(pose), -pose.x, -pose.y); return c;
}
function irChargePics() {      // the 26 pictures of the CHARGE: the poses of chapter 5 (K5P.wu the wind-up, K5P.sm the flight, K5P.land the landing) mixed with eases and turned on his side (irWide)
  const ez = IR_EZ.io, wu = irG({ x: 47, y: 64, lean: 20, hdx: 1.6, hdy: 0.6, hdt: 6, rep: 0.8, fl: 0.45, arms: [{ al: 38, el: 40 }, { al: -46, el: 74 }], legs: [{ ax: 34, ay: C4IG, a: 0 }, { ax: 62, ay: C4IG, a: 0 }] }), sm = { ...K5P.sm, fl: 0.95 }, ld = { ...K5P.land, fl: 0.3 }, out = [];
  for (let i = 0; i < 26; i++) {
    const p = i <= 4 ? c4xMixPose(IR_GD, wu, ez(i / 4)) : i <= 5 ? wu : i <= 8 ? c4xMixPose(wu, sm, ez((i - 5) / 3)) : i <= 15 ? { ...sm, fl: i % 2 ? 0.85 : 1 } : i <= 19 ? c4xMixPose(sm, ld, ez((i - 15) / 4)) : c4xMixPose(ld, IR_GD, ez((i - 19) / 6));
    out.push(irWide(p, IR_CHD[i], i));
  }
  return out;
}
function irFlipPics() {      // the 16 pictures of the BACKFLIP: he crouches with the boots lit (0 - 1), springs up and back curled up (2 - 3), turns over backwards with the flames of the boots lit (4 - 9), opens out and lands crouched (10 - 12) and stands (13 - 15)
  const ez = IR_EZ.io, crouch = irG({ x: 46, y: 70, lean: 18, hdx: 1.6, hdy: 1, hdt: 6, fl: 0.8, fa: -25, arms: [{ al: 20, el: 70 }, { al: 12, el: 76 }], legs: [{ ax: 36, ay: C4IG, a: 0 }, { ax: 56, ay: C4IG, a: 0 }] });
  const tuck = irG({ x: 47, y: 63, lean: 22, hdx: 1.8, hdy: 1, hdt: 14, fl: 0.4, fa: -30, arms: [{ al: 52, el: 116 }, { al: 44, el: 124 }], legs: [{ ax: 43, ay: 76, a: -56 }, { ax: 51, ay: 77, a: -60 }] });
  const open = irG({ x: 47, y: 63, lean: 8, hdx: 1.4, hdy: 1.5, hdt: 4, fl: 0.5, fa: -20, arms: [{ al: 40, el: 40 }, { al: 30, el: 46 }], legs: [{ ax: 40, ay: C4IG - 6, a: -20 }, { ax: 54, ay: C4IG - 8, a: -24 }] });
  const land = irG({ x: 46, y: 70, lean: 20, hdx: 1.6, hdy: 1, hdt: 8, fl: 0.3, fa: -10, arms: [{ al: 30, el: 60 }, { al: 20, el: 66 }], legs: [{ ax: 36, ay: C4IG, a: 0 }, { ax: 58, ay: C4IG, a: 0 }] }), out = [];
  for (let i = 0; i < 16; i++) {
    const p = i === 0 ? IR_GD : i === 1 ? crouch : i <= 3 ? c4xMixPose(crouch, tuck, ez((i - 1) / 2)) : i <= 7 ? tuck : i <= 9 ? c4xMixPose(tuck, open, ez((i - 7) / 2)) : i === 10 ? open : i <= 12 ? c4xMixPose(open, land, ez((i - 10) / 2)) : c4xMixPose(land, IR_GD, ez((i - 12) / 3));
    out.push(irSpin(p, IR_BFD[i]));
  }
  return out;
}
function irTipOf(cv) {      // the limb as drawn: { row of the tables (picture row - 1): the farthest pixel in front of his hips (the middle column of the usual window, 32, or 32 + c.ox of a wide picture) }
  const w = cv.width, o = cv.ox || 0, d = cv.getContext('2d').getImageData(0, 0, w, 64).data, t = {};
  for (let r = 0; r < 64; r++) for (let c = w - 1; c >= 0; c--) if (d[(r * w + c) * 4 + 3] > 127) { t[r - 1] = c - 32 - o; break; }
  return t;
}
function irKo() {      // the K.O. (12 pictures): he staggers back, his feet leave the floor and he falls on his back (the picture of the fall, turned about his hips and let down onto the floor), bounces once and lies there
  const A = irG({ x: 44, lean: -16, hdx: 0.4, hdt: -20, arms: [{ al: -30, el: 30 }, { al: 20, el: 40 }] }), B = irG({ x: 42, y: 64, lean: -28, hdx: 0.2, hdt: -28, arms: [{ al: -50, el: 20 }, { al: -30, el: 30 }], legs: [{ ax: 36, ay: C4IG, a: 0 }, { ax: 48, ay: C4IG - 8, a: 10 }] });
  const F = ironCut(irG({ x: 44, y: 64, lean: -26, hdx: 0.4, hdt: -26, arms: [{ al: -56, el: 30 }, { al: -40, el: 24 }], legs: [{ ax: 36, ay: 80, a: 20 }, { ax: 48, ay: 84, a: 10 }] }));
  const out = [ironCut(IR_GD), ironCut(A), ironCut(c4xMixPose(A, B, 0.5)), ironCut(B)];
  [[18, 0], [34, 0.15], [52, 0.35], [70, 0.6], [84, 0.85], [90, 1], [86, 0.9], [90, 1]].forEach(([deg, t]) => out.push(irRot(F, deg, 28, 33, 28 + 8 * t, 33 + 17 * t)));
  return out;
}
function irImpact(b, im, j, tips) {      // the IMPACT j of blow b (on the picture im.f): its damage, knock-back, launch, hit stop, shake, down, reaction and the height of the sparks (an effect with `1, j` happens only when this impact landed), and the limb as drawn on its picture and the next, measured against the enemy's body when it comes
  const fx = [['k', im.kn, 0, 0, -1]].concat(im.l ? [['l', im.l, 0, 0, -1]] : [], [['h', im.h, 0, 1, j], ['w', im.w, 0, 1, j]], im.dn ? [['d', 0, 0, 1, j]] : [], im.rx !== undefined ? [['r', im.rx, 0, 0, -1]] : [], [['y', im.sy, 0, 0, -1]]);
  const e = { f: im.f, k: 'i', d: im.d, sp: im.d, fx, c: 0, src: -1, id: j, low: !!b.low }; Object.defineProperty(e, 'dy', { get: () => Math.round(((dummy && dummy.airH) || 0) - (gojoLift || 0)), enumerable: true });      // (dy: how many rows higher the enemy's body is than his limb: an enemy thrown up, or he himself in the air, is met where they are NOW; low: it reaches a crouching enemy)
  e.tip = im.f ? cuMaxRows([tips[im.f - 1], tips[im.f]]) : {}; return e;
}
function irReach(tip) {      // how far in front of his hips a limb (tip) touches the enemy's body now (the rows they share, at the heights they are at); CU_REACH + 10 when the enemy's body is not known
  const B = dummy && hbBody(hbKey(dummy)); return B && tip ? hbGap(tip, B, Math.round(((dummy && dummy.airH) || 0) - (gojoLift || 0))) : CU_REACH + 10;
}
function irChargeEv(g, k, b, tips, cb) {      // the events of the CHARGE: its fist is tried on every picture of the flight (7 - 17) and the first time it touches the enemy the one IMPACT (damage, knock-back, down) is played, a hit or a block, and he stops (irChDone); the thrusters roar at the start, he lands in dust
  const imp = irImpact(b, { f: 0, d: b.d, kn: b.kn, w: b.w, h: b.h, sy: b.sy, rx: b.rx, dn: b.dn }, 0, tips), l = [];
  g.chTip = tips.map((t, j) => cuMaxRows([t, tips[j + 1]]));      // (the limb on picture j and the next, like every blow's)
  for (let f = 7; f <= 17; f++) l.push(cb(f, now => {
    if (irChDone || !dummy) return; const tip = g.chTip[f - 1], gap = dummy.x - wx;
    if (gap <= irReach(tip) && gap >= -3) { irChDone = true; imp.tip = tip; cuEv(imp, now, g, k); }
  }));
  l.push(cb(7, () => { snd('thrust', 1); puff(wx - 6, 9); }));
  l.push(cb(19, now => { snd('land', 2); puff(wx + 4, 8); shakeUntil = Math.max(shakeUntil, now + 140); shakeAmp = Math.max(shakeAmp, 2); }));
  return l;
}
// ---- THE DATA: everything he cannot do in iron.js is made here the first time a Training room starts (or the first frame customScene plays him): the pictures of every move, the events of every blow (the same form as Ryu's: an IMPACT with its damage, knock-back, launch, hit stop, shake and the height of the sparks, and the limb as drawn on its picture, measured against the enemy's body), the speed, step and lift of each blow
function ironMoves(g) {
  if (g.moves) return; g.moves = true;
  const seq = (keys, n) => irTrack(keys, n).map(ironCut), cb = (f, fn) => ({ f, k: 'cb', cb: fn, c: 0, src: -1, id: 0 });
  const atk = IR_BLOWS.map(b => b.mk ? b.mk() : seq(b.keys, b.np || (b.lift ? b.lift.length : 15))), allTips = atk.map(fr => fr.map(irTipOf));      // (the pictures of every blow, and the limb as drawn on each)
  const bolts = IR_BLOWS.map(b => b.shot ? irBolts(b) : null), ev = IR_BLOWS.map((b, k) => {
    const tips = allTips[k]; if (b.chg) return irChargeEv(g, k, b, tips, cb);
    if (b.shot) { const bo = bolts[k]; return [{ f: b.f, k: 'o', d: b.d, sp: b.spd, ms: b.ms, x0: bo.x0, fx: [['k', b.kn, 0, 0, -1], ['h', b.h, 0, 1, 0], ['w', b.w, 0, 1, 0], ['r', b.rx, 0, 0, -1], ['y', bo.sy, 0, 0, -1]], c: 0, src: -1, id: 0 }, cb(b.f, () => snd('thrust', 0.2))]; }      // (a blast: one SHOT leaves the palm on its picture, with its damage, knock-back, hit stop, shake, reaction and the height of the sparks, and a thrust of the boots' sound)
    const l = (b.imp || [b]).map((im, j) => irImpact(b, im, j, tips));
    if (k === 4) l.push(cb(14, () => snd('land', 1)));      // (the uppercut: he is back on the floor)
    if (k === 5) l.push(cb(11, now => { snd('land', 2); puff(wx + 4, 8); shakeUntil = Math.max(shakeUntil, now + 160); shakeAmp = Math.max(shakeAmp, 2); }));      // (the downslam: he lands in a cloud of dust)
    return l;
  });
  bolts.forEach((bo, k) => { if (bo) [3, 4, 5].forEach((i, q) => irFlashAt(atk[k][i], bo.px, bo.py, [1, 0.8, 0.45][q])); });      // (the flash at the palm on the picture the bolt leaves and the two after it)
  const ci = irTrack([[0, IR_CRO], [3, { ...IR_CRO, y: 76.6, lean: 27.5 }, 'io'], [7, IR_CRO, 'io']], 8).map(ironCut);
  const cwk = Array.from({ length: 8 }, (_, k) => { const u = k / 8 * 2 * Math.PI, leg = (ph, x0) => { const s = Math.sin(ph), lf = Math.max(0, Math.cos(ph)); return { ax: x0 + 5 * s, ay: C4IG - 2.5 * lf, a: 3 * lf }; }; return ironCut({ ...IR_CRO, y: 76 + 0.5 * Math.abs(Math.sin(u)), legs: [leg(u, 38), leg(u + Math.PI, 56)] }); });
  const hu = seq(IR_HU, 8), hb = seq(IR_HB, 8), hf = seq(IR_HF, 10), rows = [hu, hb, hf, hf, hf, hu, hu, hf, hb, hb];      // (the ten reactions the game picks from: 0, 5, 6 the head snaps back, 1, 8, 9 doubled over, 2, 3, 4, 7 a stagger back; each lasts as long as the enemy's own reaction does)
  Object.assign(g, {
    atk, ev, set: IR_BLOWS.map(b => ({ v: b.v, m: b.m, c: 0, d: 0, e: b.e, lt: b.lt })), rdy: [0, 1, 2, 3], an: IR_BLOWS.map(b => b.n), al: IR_BLOWS.map(() => null), vfx: bolts.map(o => o ? o.pics : []), vxs: bolts.map(o => o ? o.pics.map(c => cuSpan(suAlpha(c), r => r - 2)) : []), tipAll: ev.map((l, k) => cuMaxRows(IR_BLOWS[k].chg ? allTips[k] : l.map(e => e.tip))),
    cr: seq([[0, IR_GD], [3, IR_CRO, 'io']], 4), ci, cwk, bl: seq(IR_BLOCK, 6), df: seq(IR_DASH, 8), db: seq(IR_DASHB, 8), hu, hus: rows.map((f, k) => ({ f, ms: RX_DUR[k] / f.length })), ko: irKo()
  });
  g.st = { ...g.st, dfw: 60, dbk: 44, dtm: 240 };      // (his dash: a burst of 60 px forward, 44 back, 0.24 s)
  irhPics(g);      // (v1.194 the pictures of the bear hug are made now too, not when BLUE is pressed)
  irbPics(g);      // (v1.195 and those of the blast)
}
// ---- WHAT customScene CALLS: irTick decides, every frame, what the JUMP and ATTACK presses do (the generic jump and attack of the engine are off for him, see custom.js)
const IR_SIM = 120, IR_AIR = 200, IR_DD = 520, IR_DP = 380;      // (real ms: JUMP and ATTACK this close together are the UPPERCUT; in the air, ATTACK from IR_AIR ms after the jump began is the DOWNSLAM, an ATTACK before that waits until then; a second DASH BACK within IR_DD of the first is the BACKFLIP; ATTACK within IR_DP of a DASH press, or while it goes on, is the CHARGE)
const irRate = () => (TR.spd && freePlay() ? TRS[TR.spd] : 1) * paceNow();      // (how many game ms pass in one real ms: the pace of the fight (1.25 or 1.5) and the GAME SPEED of SETTINGS > TRAIN)
let irChain = false, irDiveAt = 0, irChDone = false, irDshAt = -1e9, irBackAt = -1e9, irJabQ = 0;      // (the blow in progress is the first of a chain; when an ATTACK pressed in the air too early turns into the downslam, 0 = none; the CHARGE's fist has touched him (or been blocked); when the last DASH press was and when the last one that was a DASH BACK; until when an ATTACK pressed during the low jabs is kept)
function irDive(h0) {      // the rise of the downslam's 15 pictures: he hangs at h0 while he winds up, dives to where his fists meet the enemy (16 px, or h0 when he is lower than that) on the 8th picture and has landed by the 11th
  const top = Math.max(0, h0), imp = Math.min(16, top), t = [];
  for (let i = 0; i < 15; i++) t.push(Math.round(i <= 3 ? top : i <= 7 ? top + (imp - top) * IR_EZ.io((i - 3) / 4) : i <= 10 ? imp * (1 - (i - 7) / 3) : 0));
  return t;
}
function irStart(g, k, now, h0) {      // blow k begins: the state customScene plays it from (cuAtkK, cuAtkAt, the chain, the lift of its pictures)
  const b = IR_BLOWS[k], st = g.set[k];
  cuAtkK = k; cuAtkAt = now; cuFired = []; cuRes = []; cuLunged = 0; cuMs = 1000 / st.v; cuCmbBy = now + 1e9; cuAtkQ = 0; irDiveAt = 0; irChain = k === 0 || k === 9; irChDone = false; irJabQ = 0; cuCmb = k < 3 ? k + 1 : k === 9 ? 1 : 0;
  if (b.dive) g.al[k] = irDive(h0); else if (b.lift) g.al[k] = b.lift.map((v, i) => Math.max(v, Math.round(h0 * Math.max(0, 1 - i / 4))));      // (the uppercut that begins in the air goes on from where he is)
  if (!b.flip && !b.chg && !b.shot) snd('swing', b.kick ? 3 : 0); if (k === 4) snd('thrust', 0.5); if (b.flip) snd('thrust', 0.9);      // (the backflip, the charge and the blasts do not swing: the backflip roars with his boots at once, the charge at its 7th picture, a blast at the 4th)
}
function irCombo(g, now) { const rd = irRdy(g); if (now > cuCmbBy) cuCmb = 0; irStart(g, rd[cuCmb % rd.length], now, 0); }      // (the next blow of the chain, the first one when the 0.7 s are over)
function irChMove(g, now) {      // the CHARGE's flight: where he is on his way (IR_CHP: between two pictures a straight line), held back by the enemy: the fist never goes into him; once it has touched him, landed or been blocked, he stops where he is
  const n = g.atk[7].length, u = Math.min(n, Math.max(0, (now - cuAtkAt) / cuMs)), j = Math.min(n - 1, Math.floor(u));
  let to = irChDone ? cuLunged : IR_CHP[j] + (IR_CHP[j + 1] - IR_CHP[j]) * (u - j);
  if (!irChDone && dummy && dummy.ko < 0 && dummy.x > wx - 8) to = Math.min(to, cuLunged + Math.max(0, dummy.x - irReach(g.chTip[j]) + 6 - wx));
  if (to > cuLunged) { wx += to - cuLunged; cuLunged = to; }
}
function irTick(g, now, ctl, jmp, atk, dsh, lpr) {      // true when it used this frame's DASH press (the generic dash of customScene must not start then)
  if (!g.moves) ironMoves(g);
  if (g.bh) return false;      // (v1.194 the bear hug has him: customScene asks irBhStep for everything while it lasts)
  if (lpr && ctl && stance === 'stand' && cuJumpAt < 0 && cuAtkAt < 0 && !cuDash && blkAt < 0 && irBhStart(g, now)) return true;      // (BLUE: the bear hug, see tools/ironh.js; true: a DASH pressed with it is not a dash)
  const R = irRate(), sim = IR_SIM * R, wait = IR_AIR * R, idle = ctl && stance === 'stand' && !cuDash && blkAt < 0, h0 = Math.max(0, Math.round(gojoLift || 0)), air = cuJumpAt >= 0, el = air ? now - cuJumpAt : 0;
  if (!air) irDiveAt = 0;
  // ---- v1.192 the three new moves: the DASH presses and the crouch
  const fwd = keyR || padR, gnd = ctl && stance === 'stand' && cuJumpAt < 0 && cuAtkAt < 0 && blkAt < 0, crh = ctl && stance === 'crouch' && cuJumpAt < 0 && cuAtkAt < 0 && !cuDash && blkAt < 0; let used = false;
  if (dsh && gnd && !fwd && now - irBackAt <= IR_DD * R) { cuDash = null; irStart(g, 8, now, 0); irBackAt = irDshAt = -1e9; used = true; }      // 1. the BACKFLIP: DASH BACK again soon after the first one (the dash that is still going on is dropped)
  else if (atk && !jmp && gnd && (dsh || cuDash || now - irDshAt <= IR_DP * R)) { cuDash = null; irStart(g, 7, now, 0); irBackAt = irDshAt = -1e9; used = !!dsh; atk = false; }      // 2. the CHARGE: ATTACK during a dash, soon after it or together with it (JUMP pressed with it is the uppercut)
  else if (dsh && ctl) { irDshAt = now; irBackAt = fwd ? -1e9 : now; }      // (the first DASH press: the time it is counted from)
  if (atk && crh) { irStart(g, 6, now, 0); atk = false; }      // 3. crouched, ATTACK: the LOW JABS ...
  else if (atk && ctl && cuAtkAt >= 0 && cuAtkK === 6) { irJabQ = now + 450; atk = false; }      // ... a press during them is kept for 0.45 s: two more follow
  else if (crh && irJabQ > now) { irJabQ = 0; irStart(g, 6, now, 0); }
  if (cuAtkAt >= 0 && cuAtkK === 7) irChMove(g, now);      // (the CHARGE flies on)
  let J = jmp && idle, A = atk && idle;      // (the presses that count: only while he can act)
  if (J && A && cuAtkAt < 0 && !air) { irStart(g, 4, now, 0); J = A = false; }      // 1. the ROCKET UPPERCUT: JUMP and ATTACK together ...
  else if (A && air && cuAtkAt < 0 && el <= sim) { cuJumpAt = -1; irStart(g, 4, now, h0); J = A = false; }      // ... or ATTACK just after the jump began ...
  else if (J && cuAtkAt >= 0 && irChain && now - cuAtkAt <= sim) { cuCmb = 0; irStart(g, 4, now, 0); J = A = false; }      // ... or JUMP just after the first blow began (it is dropped)
  if (J && cuAtkAt < 0 && !air) { cuJumpAt = now; cuJumpC = false; snd('jump'); snd('thrust', g.jet); }      // 2. JUMP
  if (A) {      // 3. ATTACK
    if (cuAtkAt >= 0) cuAtkQ = now + 450;      // (a press during a blow is kept for 0.45 s: the next blow of the chain follows at once)
    else if (air) { if (el >= wait) { cuJumpAt = -1; irStart(g, 5, now, h0); } else irDiveAt = cuJumpAt + wait; }      // (in the air: the DOWNSLAM, from 0.2 s after the jump began; a press before that is kept until then)
    else irCombo(g, now);
  } else if (cuAtkAt < 0 && idle) {
    if (air && irDiveAt > 0 && now >= irDiveAt) { cuJumpAt = -1; irStart(g, 5, now, h0); }
    else if (!air && cuAtkQ > now) irCombo(g, now);
  }
  if (cuAtkAt >= 0 && irM1(cuAtkK) && cuAtkQ > now && idle && now - cuAtkAt >= g.atk[cuAtkK].length * cuMs) { cuCmbBy = now + 700; irCombo(g, now); }      // (a press that was kept while a blow of the chain went on: the next blow begins in the very frame the one before it is over, so that no picture of his idle comes between two blows)
  return used;
}
const irLabel = (g, now) => cuJumpAt >= 0 && cuAtkAt < 0 ? 'DOWNSLAM' : stance === 'crouch' ? 'LOW JABS' : cuDash || now - irDshAt <= IR_DP * irRate() ? 'CHARGE' : g.an[irRdy(g)[(now > cuCmbBy ? 0 : cuCmb) % irRdy(g).length]];      // (what the ATTACK button says: in the air the downslam, crouched the low jabs, during a dash and just after it the charge, on the ground the blow that comes next: in the repulsor mode R.BLAST and L.BLAST)
