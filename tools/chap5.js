// ================================================================ v1.177 CHAPTER 5: THE IRON MAN
// Chapter 5 starts where chapter 4 stopped: Yuji and Iron Man on the freeway in New York, the blade at Yuji's chest ("And if I don't?"). It runs in the machinery of chapter 4's part 3 (c4x, tools/chap4c.js): c4x.ph 'k5', and like every scene there the picture is a function of the scene time T (seconds)
// and of ONE outcome, the TAP (c.q.res: 'hit' / 'miss'). A ring closes on Yuji (the same ring and the same window as the quick time events of chapter 3: tap from 0.18 s before it closes to 0.14 s after, a tap up to 0.35 s early is a miss) as Iron Man rushes in with the blade:
// MISS: the blade goes through Yuji's chest, he falls, black, "YUJI DIED", and chapter 5 starts again from the beginning. HIT: Yuji dodges, punches Iron Man in the face and slides back; then the scene plays on (who are you / Tony Stark / the gauntlet with 2 stones / come with me / no / a punch, a charge, a hook, a kick,
// the blade swings, the repulser, the grip on the neck, the punch that knocks Yuji out and the black). No music yet (the user will send a song): every time below is a seconds value of K5T / the key lists, so a song can be fitted by moving them.

// ---- the times (seconds of the scene)
const K5T = {
  fade: 1.0, stance: 6.3, wind0: 6.5, lunge: 7.55, q: 7.65, hit: 8.05,      // (the stance, the wind-up, the lunge starts, the ring closes on Yuji, the blade arrives: 0.4 s after the ring closes, like every blow of chapter 3)
  cut: 36.9,      // (the black after the last punch: Yuji wakes up in Stark Tower, see tools/chap5b.js, which also has the times of the cards END OF CHAPTER 5 and TO BE CONTINUED)
  d0: 0.0, d1: 0.5, d2: 1.1, d3: 1.45, d4: 1.9, restart: 12.4      // (the death: seconds after the blade arrives: the blade is pulled out, he falls, the black comes, the words; the scene starts again at `restart`)
};
const k5L = (t, w, vk, a, b) => ({ t, d: (a + (b || '')).length / TN_RATE + 1.1, w, vk, a, b: b || '' });      // (a line of the speech box: it stays as long as it takes to type it and a second to read)
const K5_TALK = [
  k5L(1.2, 'YUJI', 1, "AND IF I DON'T?"), k5L(3.3, 'IRON MAN', 0, 'WELL... THEN I WILL HAVE TO END YOU.'),
  k5L(9.2, 'YUJI', 1, 'WHO ARE YOU?'), k5L(11.0, 'IRON MAN', 0, 'I AM TONY STARK.'),
  k5L(13.1, 'YUJI', 1, 'I WAS SENT HERE BY A BEING', 'WITH A GAUNTLET THAT'), k5L(16.6, 'YUJI', 1, 'HAD 2 STONES.'),
  k5L(18.5, 'IRON MAN', 0, 'OH, WE FOUGHT WITH THAT GUY', 'A FEW YEARS AGO.'),
  k5L(23.0, 'IRON MAN', 0, 'WELL THEN, COME WITH ME.'), k5L(25.5, 'YUJI', 1, 'NO!'), k5L(26.9, 'IRON MAN', 0, 'OH WELL.'),
  k5L(28.6, 'YUJI', 1, 'TCH.')
];

// ---- IRON MAN'S POSES (a pose is what c4xDrawIron takes, see tools/chap4e.js: x, y = the hip, lean, hdx / hdy / hdt = the head, arms [the far arm = the repulser's, the near arm = the blade's] { al: the upper arm's angle from straight down, forward positive, el: the bend of the elbow }, legs [{ ax, ay, a }, ...], bl = the blade, rep = the glow of the repulser, fl = the flames of the boots);
// the poses are mixed number by number between the keys of a track (k5Keys), so every pose has all of them
const k5IP = o => Object.assign({ x: 48, y: 59.5, lean: 3, hdx: 1.2, hdy: 0, hdt: 0, fl: 0, rep: 0, bl: 0, vis: 1, ph: 0, arms: [{ al: 14, el: 26 }, { al: 10, el: 22 }], legs: [{ ax: 41, ay: C4IG, a: 0 }, { ax: 55, ay: C4IG, a: 0 }] }, o);
const K5P = {
  blade: k5IP({ x: 49, y: 60, lean: 9, hdx: 1.4, hdt: 3, rep: 0.9, bl: 26, arms: [{ al: 78, el: 4 }, { al: 86, el: 2 }], legs: [{ ax: 39, ay: C4IG, a: 0 }, { ax: 59, ay: C4IG, a: 0 }] }),      // (where chapter 4 stopped)
  cock: k5IP({ x: 47, y: 64, lean: -8, hdx: 1.0, hdt: -2, bl: 26, arms: [{ al: 55, el: 25 }, { al: 20, el: 72 }], legs: [{ ax: 33, ay: C4IG, a: 0 }, { ax: 62, ay: C4IG, a: 0 }] }),      // (leaning back, the blade drawn back for the thrust)
  lunge: k5IP({ x: 53, y: 65, lean: 24, hdx: 1.8, hdy: 0.5, hdt: 8, bl: 26, fl: 0.35, arms: [{ al: -25, el: 30 }, { al: 88, el: 1 }], legs: [{ ax: 28, ay: C4IG - 3, a: -34 }, { ax: 70, ay: C4IG, a: 0 }] }),      // (the thrust: the whole body behind the blade)
  hit: k5IP({ x: 46, y: 61, lean: -10, hdx: -1.2, hdy: 0.6, hdt: -40, bl: 26, arms: [{ al: 52, el: 42 }, { al: 66, el: 22 }], legs: [{ ax: 36, ay: C4IG, a: 0 }, { ax: 52, ay: C4IG, a: 0 }] }),      // (a punch to the face: the head snapped back)
  recover: k5IP({ x: 48, y: 60, lean: 4, hdx: 1.3, hdt: 2, bl: 26, arms: [{ al: 36, el: 50 }, { al: 52, el: 34 }], legs: [{ ax: 40, ay: C4IG, a: 0 }, { ax: 56, ay: C4IG, a: 0 }] }),
  talk: k5IP({ x: 48, y: 59.5, lean: 2, hdx: 1.2, hdt: 0, arms: [{ al: 10, el: 24 }, { al: 6, el: 20 }] }),      // (relaxed, the blade away)
  akimbo: k5IP({ x: 48, y: 59.5, lean: -2, hdx: 1.0, hdt: -5, arms: [{ al: -12, el: 70 }, { al: -8, el: 62 }], legs: [{ ax: 38, ay: C4IG, a: 0 }, { ax: 58, ay: C4IG, a: 0 }] }),      // (hands on the hips: I AM TONY STARK)
  laugh: k5IP({ x: 47, y: 60, lean: -9, hdx: 0.4, hdt: -26, arms: [{ al: 8, el: 64 }, { al: 20, el: 30 }], legs: [{ ax: 40, ay: C4IG, a: 0 }, { ax: 56, ay: C4IG, a: 0 }] }),
  offer: k5IP({ x: 49, y: 59.5, lean: 6, hdx: 1.4, hdt: 2, arms: [{ al: 10, el: 24 }, { al: 76, el: -8 }], legs: [{ ax: 40, ay: C4IG, a: 0 }, { ax: 58, ay: C4IG, a: 0 }] }),      // (the hand held out: come with me)
  shrug: k5IP({ x: 48, y: 59.5, lean: 0, hdx: 1.2, hdt: 8, arms: [{ al: 46, el: 42 }, { al: 56, el: 36 }], legs: [{ ax: 40, ay: C4IG, a: 0 }, { ax: 56, ay: C4IG, a: 0 }] }),
  pwind: k5IP({ x: 46, y: 62, lean: -6, hdx: 1.0, hdt: -2, arms: [{ al: 38, el: 50 }, { al: 6, el: 112 }], legs: [{ ax: 34, ay: C4IG, a: 0 }, { ax: 60, ay: C4IG, a: 0 }] }),      // (the fist drawn back)
  punch: k5IP({ x: 53, y: 64, lean: 22, hdx: 1.8, hdy: 0.5, hdt: 6, fl: 0.2, arms: [{ al: 30, el: 60 }, { al: 90, el: 0 }], legs: [{ ax: 30, ay: C4IG - 2, a: -26 }, { ax: 68, ay: C4IG, a: 0 }] }),      // (the fist out)
  tank: k5IP({ x: 47, y: 60, lean: -4, hdx: 0.4, hdy: 0.8, hdt: -30, arms: [{ al: 14, el: 30 }, { al: 12, el: 26 }], legs: [{ ax: 38, ay: C4IG, a: 0 }, { ax: 57, ay: C4IG, a: 0 }] }),      // (a kick under the chin: the head up, the body does not move)
  turn: k5IP({ x: 48, y: 60, lean: 6, hdx: 1.3, hdt: 10, arms: [{ al: 24, el: 40 }, { al: 22, el: 36 }], legs: [{ ax: 40, ay: C4IG, a: 0 }, { ax: 56, ay: C4IG, a: 0 }] }),      // (the head down again, a smirk)
  hwind: k5IP({ x: 46, y: 62, lean: -8, hdx: 1.0, hdt: -2, arms: [{ al: 30, el: 56 }, { al: -42, el: 98 }], legs: [{ ax: 33, ay: C4IG, a: 0 }, { ax: 61, ay: C4IG, a: 0 }] }),      // (the right hook drawn way back)
  hook: k5IP({ x: 52, y: 63, lean: 20, hdx: 1.7, hdy: 0.4, hdt: 6, arms: [{ al: 20, el: 70 }, { al: 62, el: 52 }], legs: [{ ax: 31, ay: C4IG - 1, a: -20 }, { ax: 67, ay: C4IG, a: 0 }] }),      // (the fist coming round)
  hend: k5IP({ x: 55, y: 63, lean: 26, hdx: 2.0, hdy: 0.5, hdt: 8, arms: [{ al: 16, el: 80 }, { al: 108, el: 30 }], legs: [{ ax: 30, ay: C4IG - 2, a: -28 }, { ax: 70, ay: C4IG, a: 0 }] }),      // (the follow-through)
  bladeUp: k5IP({ x: 48, y: 59.5, lean: 4, hdx: 1.3, hdt: 3, bl: 26, rep: 0, arms: [{ al: 16, el: 36 }, { al: 24, el: 60 }], legs: [{ ax: 40, ay: C4IG, a: 0 }, { ax: 56, ay: C4IG, a: 0 }] }),
  s1w: k5IP({ x: 46, y: 62, lean: -6, hdx: 1.0, hdt: -2, bl: 26, arms: [{ al: 30, el: 40 }, { al: -38, el: 52 }], legs: [{ ax: 34, ay: C4IG, a: 0 }, { ax: 60, ay: C4IG, a: 0 }] }),      // (slash 1: from behind)
  s1: k5IP({ x: 52, y: 63, lean: 18, hdx: 1.7, hdt: 6, bl: 26, arms: [{ al: 30, el: 40 }, { al: 98, el: -2 }], legs: [{ ax: 31, ay: C4IG - 1, a: -20 }, { ax: 68, ay: C4IG, a: 0 }] }),      // (the blade at head height)
  s2w: k5IP({ x: 47, y: 61, lean: -4, hdx: 1.0, hdt: -2, bl: 26, arms: [{ al: 30, el: 40 }, { al: 168, el: -8 }], legs: [{ ax: 35, ay: C4IG, a: 0 }, { ax: 60, ay: C4IG, a: 0 }] }),      // (slash 2: the blade raised high)
  s2: k5IP({ x: 52, y: 64, lean: 22, hdx: 1.8, hdt: 8, bl: 26, arms: [{ al: 30, el: 40 }, { al: 62, el: 4 }], legs: [{ ax: 30, ay: C4IG - 2, a: -24 }, { ax: 68, ay: C4IG, a: 0 }] }),      // (chopping down at the head)
  s3w: k5IP({ x: 47, y: 63, lean: 2, hdx: 1.2, hdt: 0, bl: 26, arms: [{ al: 30, el: 40 }, { al: 18, el: 40 }], legs: [{ ax: 35, ay: C4IG, a: 0 }, { ax: 60, ay: C4IG, a: 0 }] }),      // (slash 3: from low)
  s3: k5IP({ x: 53, y: 64, lean: 20, hdx: 1.8, hdt: 8, bl: 26, arms: [{ al: 30, el: 40 }, { al: 118, el: -6 }], legs: [{ ax: 30, ay: C4IG - 2, a: -26 }, { ax: 69, ay: C4IG, a: 0 }] }),      // (rising across the head)
  aim: k5IP({ x: 48, y: 60, lean: 8, hdx: 1.5, hdt: 2, rep: 1, arms: [{ al: 90, el: 0 }, { al: 12, el: 44 }], legs: [{ ax: 36, ay: C4IG, a: 0 }, { ax: 60, ay: C4IG, a: 0 }] }),      // (the palm of the repulser held out)
  fire: k5IP({ x: 45, y: 60, lean: -2, hdx: 1.2, hdt: 0, rep: 1, arms: [{ al: 92, el: 2 }, { al: 10, el: 40 }], legs: [{ ax: 33, ay: C4IG, a: 0 }, { ax: 60, ay: C4IG, a: 0 }] }),      // (the recoil of the shot)
  fly: k5IP({ x: 48, y: 58, lean: 0, hdx: 1.2, hdt: 0, fl: 1, arms: [{ al: 92, el: 0 }, { al: 96, el: 0 }], legs: [{ ax: 44, ay: C4IG - 2, a: -10 }, { ax: 52, ay: C4IG - 2, a: -10 }] }),      // (in the air, the flames of the boots: drawn turned on its side by k5Draw)
  land: k5IP({ x: 46, y: 70, lean: 30, hdx: 1.8, hdy: 1, hdt: 14, arms: [{ al: -30, el: 36 }, { al: 30, el: 20 }], legs: [{ ax: 30, ay: C4IG + 0.5, a: -40 }, { ax: 58, ay: C4IG, a: 0 }] }),
  grab: k5IP({ x: 50, y: 62, lean: 12, hdx: 1.6, hdy: 0.4, hdt: 6, arms: [{ al: 8, el: 112 }, { al: 98, el: 2 }], legs: [{ ax: 34, ay: C4IG, a: 0 }, { ax: 63, ay: C4IG, a: 0 }] }),      // (one arm out, the hand on a neck; the other drawn back)
  gpunch: k5IP({ x: 52, y: 62, lean: 16, hdx: 1.8, hdy: 0.5, hdt: 8, arms: [{ al: 94, el: 2 }, { al: 98, el: 2 }], legs: [{ ax: 33, ay: C4IG, a: 0 }, { ax: 65, ay: C4IG, a: 0 }] })      // (both arms out: one holds, the other has punched)
};

// two more poses the fight needs
K5P.cuff = k5IP({ x: 47, y: 60, lean: -3, hdx: 0.6, hdt: -16, arms: [{ al: 14, el: 30 }, { al: 12, el: 26 }], legs: [{ ax: 39, ay: C4IG, a: 0 }, { ax: 56, ay: C4IG, a: 0 }] });      // (a punch that only turns his head)

// ---- the tracks: Iron Man [t, 'pose', x, ease] (the ease of the way TO the key: 'io' smooth, 'in' accelerating, 'out' slowing, 'lin'), numbers [t, value, ease], Yuji's pictures [t, set, k, f0, f1, fps] (fps < 0: a loop f0 - f1 at -fps; 0: the picture f0 stays)
const K5EZ = { io: u => u * u * (3 - 2 * u), in: u => u * u, out: u => 1 - (1 - u) * (1 - u), lin: u => u };
const k5Seg = (K, T, ei) => { const n = K.length; if (T <= K[0][0]) return [K[0], K[0], 0]; if (T >= K[n - 1][0]) return [K[n - 1], K[n - 1], 0]; let i = 0; while (i < n - 2 && T >= K[i + 1][0]) i++; const a = K[i], b = K[i + 1]; return [a, b, (K5EZ[b[ei]] || K5EZ.io)((T - a[0]) / Math.max(1e-6, b[0] - a[0]))]; };
const k5Val = (K, T) => { const [a, b, e] = k5Seg(K, T, 2); return a[1] + (b[1] - a[1]) * e; };
const K5K = {
  im0: [[0, 'blade', 46], [6.4, 'blade', 46], [7.45, 'cock', 54, 'io'], [7.55, 'cock', 54], [8.05, 'lunge', 29, 'in']],      // (until the tap is judged: he stands with the blade out, draws it back and thrusts)
  imH: [[8.05, 'lunge', 34, 'in'], [8.2, 'lunge', 34], [8.26, 'hit', 36, 'out'], [8.95, 'hit', 45, 'out'], [9.5, 'recover', 45], [10.5, 'recover', 45], [10.85, 'talk', 45], [11.4, 'akimbo', 45], [13.0, 'akimbo', 45], [13.5, 'talk', 45], [18.2, 'talk', 45], [18.45, 'laugh', 45], [21.4, 'laugh', 45], [21.95, 'talk', 45],
    [23.0, 'talk', 45], [23.4, 'offer', 18, 'io'], [25.3, 'offer', 18], [25.85, 'talk', 18], [26.85, 'talk', 18], [27.05, 'shrug', 18], [27.55, 'shrug', 18], [27.75, 'pwind', 18], [27.95, 'punch', -4, 'in'], [28.25, 'punch', -4], [28.7, 'turn', -4], [29.35, 'turn', -4], [29.5, 'cuff', -3, 'out'], [29.9, 'cuff', -3],
    [29.95, 'hwind', -3], [30.1, 'hook', -4, 'in'], [30.2, 'hend', -6, 'out'], [30.24, 'hend', -6], [30.3, 'tank', -4, 'out'], [30.95, 'tank', -4], [31.25, 'turn', -4], [31.4, 'bladeUp', -4], [31.85, 's1w', -6], [32.05, 's1', -9, 'in'], [32.3, 's1', -9], [32.55, 's2w', -9], [32.72, 's2', -12, 'in'], [32.95, 's2', -12], [33.2, 's3w', -12], [33.36, 's3', -16, 'in'], [33.6, 's3', -16],
    [33.8, 'aim', -16], [34.45, 'aim', -16], [34.5, 'fire', -18, 'out'], [34.9, 'fire', -18], [35.0, 'fly', -18], [35.9, 'fly', -64], [36.05, 'land', -66, 'out'], [36.25, 'grab', -68], [36.45, 'grab', -68], [36.5, 'gpunch', -68, 'in'], [36.95, 'gpunch', -68]],
  imM: [[8.05, 'lunge', 24, 'in'], [8.5, 'lunge', 24], [8.65, 'cock', 28, 'out'], [9.4, 'blade', 28]],      // (the blade is through Yuji, then pulled out)
  iml: [[0, 0], [34.95, 0], [35.15, 12, 'out'], [35.85, 12, 'lin'], [36.05, 0, 'in']],      // (Iron Man's height: he flies low to Yuji)
  imr: [[0, 0], [34.95, 0], [35.2, 1.05, 'out'], [35.85, 1.2, 'lin'], [36.05, 0, 'io']],      // (and how far he leans: the picture is turned on its side in flight)
  yxP: [[0, -16], [6.3, -16], [6.5, -19, 'out'], [7.8, -19]],
  yxH: [[8.05, -34, 'out'], [8.12, -34], [8.245, 5, 'in'], [8.5, 5], [9.15, -26, 'out'], [25.5, -26], [25.8, -34, 'out'], [27.95, -34], [28.25, -46, 'out'], [29.35, -46], [29.475, -34, 'in'], [30.0, -34], [30.25, -31, 'io'], [30.75, -34, 'io'], [31.95, -34], [32.15, -40, 'out'], [32.85, -40], [33.0, -46, 'out'], [33.45, -46], [33.6, -52, 'out'], [34.5, -52], [35.15, -92, 'out'], [36.5, -90, 'io']],
  yxM: [[8.05, -19], [8.45, -19], [9.1, -33, 'out']],
  ylH: [[0, 0], [34.5, 0], [34.78, 24, 'out'], [35.15, 0, 'in'], [35.9, 0], [36.25, 10, 'out']],      // (Yuji's height: the blast throws him up and back; later Iron Man lifts him by the neck)
  yrH: [[0, 0], [34.5, 0], [34.62, -0.8, 'out'], [35.0, -1.25, 'io'], [35.15, 0, 'in']],
  ycP: [[0, 'blk', 0, 9, 9, 0], [6.3, 'blk', 0, 5, 9, -8]],
  ycH: [[7.8, 'dash', 1, 2, 12, 38], [8.12, 'atk', 12, 0, 14, 48], [8.5, 'dash', 1, 3, 11, 26], [9.15, 'blk', 0, 5, 9, -8], [25.5, 'blk', 0, 0, 9, 24], [27.97, 'rx', 0, 0, 14, 22], [28.75, 'blk', 0, 5, 9, -8], [29.35, 'atk', 12, 0, 14, 48], [29.95, 'blk', 0, 5, 9, -8], [30.0, 'atk', 14, 0, 14, 30], [30.7, 'blk', 0, 5, 9, -8],
    [31.9, 'atk', 14, 0, 3, 30], [32.15, 'atk', 14, 2, 2, 0], [32.55, 'blk', 0, 5, 9, -8], [32.75, 'dash', 1, 2, 9, 34], [33.1, 'blk', 0, 5, 9, -8], [33.38, 'dash', 1, 2, 9, 34], [33.75, 'blk', 0, 5, 9, -8], [34.52, 'rx', 1, 2, 9, 14], [35.15, 'rx', 4, 6, 9, 10], [35.75, 'rx', 4, 12, 14, 10], [36.1, 'rx', 0, 3, 3, 0], [36.52, 'rx', 5, 4, 4, 0]],
  ycM: [[8.05, 'rx', 1, 3, 3, 0], [8.5, 'rx', 4, 0, 8, 14]]
};
// where Iron Man or Yuji is hit, for the rings and the blood: [time, who, height above the road, what: 'p' a blow, 'b' a bleed (the blood follows GRAPHIC DAMAGE: only FULL shows it)]
const K5I = [[8.245, 'i', 46], [27.95, 'y', 50], [29.475, 'i', 44], [30.233, 'i', 40], [34.55, 'y', 34], [36.55, 'y', 50]];
const k5Gore = () => typeof window.__k5Gore === 'number' ? window.__k5Gore : (SET.gore | 0);      // (0 FULL: blood, 1 CLEAN: none, 2 OFF: the stab is cut away; window.__k5Gore: tests)
const k5Re = () => k5Gore() === 2 ? K5T.hit + 3.3 : K5T.restart;      // (when the scene starts again after a death: sooner when GRAPHIC DAMAGE is OFF, the black comes at once)
const k5Q = () => window.__k5Q;      // (tests: 'hit' / 'miss' forces the tap's outcome)

// ---- the scene at time T for the outcome so far: where Iron Man and Yuji are and what each looks like
function k5Keys(c) {      // the tracks for the outcome (built when the tap is judged: until then the way to the thrust is the same for both)
  const r = c.q.res; if (c.kc === r && c.k) return c.k; c.kc = r;
  const hit = r === 'hit', im = K5K.im0.slice(0, -1).concat(hit ? K5K.imH : r === 'miss' ? K5K.imM : [K5K.im0[K5K.im0.length - 1]]);
  return (c.k = { im, yx: K5K.yxP.concat(hit ? K5K.yxH : r === 'miss' ? K5K.yxM : []), yc: K5K.ycP.concat(hit ? K5K.ycH : r === 'miss' ? K5K.ycM : []) });
}
function k5Eval(c, T) {
  const K = k5Keys(c), [a, b, e] = k5Seg(K.im, T, 3), pose = a[1] === b[1] ? K5P[a[1]] : c4xMixPose(K5P[a[1]], K5P[b[1]], e), ix = a[2] + (b[2] - a[2]) * e, bob = Math.sin(T * 2.2) * 0.3;
  const im = { pose: Object.assign({}, pose, { y: pose.y + bob * (a[1] === b[1] && (a[1] === 'blade' || a[1] === 'talk') ? 1 : 0) }), x: ix, lift: k5Val(K5K.iml, T), rot: k5Val(K5K.imr, T) };
  let yc = K.yc[0]; for (const q of K.yc) if (q[0] <= T) yc = q; const f = yc[5] < 0 ? yc[3] + (((T - yc[0]) * -yc[5]) % (yc[4] - yc[3] + 1)) : Math.min(yc[4], yc[3] + (T - yc[0]) * yc[5]);
  const yx = k5Val(K.yx, T), y = { x: yx, face: 1, lift: c.q.res === 'hit' ? k5Val(K5K.ylH, T) : 0, rot: c.q.res === 'hit' ? k5Val(K5K.yrH, T) : 0, pose: { set: yc[1], k: yc[2], fi: f } };
  return { im, y };
}

// ---- the tap (the quick time event): the same ring, window and feel as chapter 3's: tap (or press any key) from 0.18 s before the ring closes to 0.14 s after: a hit; up to 0.35 s earlier: TOO EARLY, a miss; no tap: a miss
function k5Resolve(c, res, why, T) {      // the tap is judged: the scene goes on one way or the other (the tracks are rebuilt, see k5Keys)
  if (c.q.res) return; const f = k5Q(); c.q.res = f === 'hit' || f === 'miss' ? f : res; c.q.why = why; c.q.at = T === undefined ? c.T : T;
  if (c.q.res === 'miss') snd('c7thud', 1); else snd('dash', 1);
}
function k5Tap(ev) {      // a finger or a key: true when the scene used it
  const c = c4x; if (!c || c.ph !== 'k5' || paused) return false; if ((pnow() - c.t0) / 1000 >= K5T.cut) return k5Tap2(ev);      // (after the black: the tap of the huge room)
  if (c.q.res || c13Off()) return false; if (ev && c13InSkip(ev)) return false;
  const T = (pnow() - c.t0) / 1000, u = T - K5T.q, W = C13.win;
  if (u >= W[0] && u <= W[1]) { k5Resolve(c, 'hit', Math.abs(u) <= C13.perfect ? 'PERFECT' : 'GOOD', T); return true; }
  if (u >= -C13.early && u < W[0]) { k5Resolve(c, 'miss', 'TOO EARLY', T); return true; }
  return false;
}
addEventListener('pointerdown', e => { const c = c4x; if (c && c.ph === 'k5' && c.T > 0.2) { if (c13InSkip(e)) c4xSkip(); else k5Tap(e); } });
addEventListener('keydown', e => { const c = c4x; if (c && c.ph === 'k5' && !e.repeat && !e.ctrlKey && !e.metaKey && !e.altKey && !['Escape', 'Tab', 'ShiftLeft', 'ShiftRight', 'ControlLeft', 'ControlRight', 'AltLeft', 'AltRight', 'KeyP'].includes(e.code) && !/^F\d/.test(e.code)) k5Tap(null); });

// ---- start, skip, the end
function storyDone16() { if (!story) return; const a = loadSaves(); if (a[story.slot]) { a[story.slot].c15 = true; a[story.slot].c16 = true; } storeSaves(a); }      // (chapter 5 is finished for now)
function startC16(slot) {      // the chapter list or CONTINUE: chapter 5 (it needs no story scene of its own: it runs in the machinery of chapter 4's part 3)
  const a = loadSaves(); if (!a[slot]) a[slot] = { ch: 1 }; storeSaves(a); audio(); story = { slot, t0: pnow(), battle: false, T: 0, ev: {}, c16: true }; alley = false; court = false; track = false; wx = 0; k5Start();
}
function k5Start() {      // chapter 5 begins, or begins again after a death: the freeway of New York, Yuji and Iron Man where chapter 4 left them
  show('play'); const now = pnow(); c4xUi(true); c4xCine(true);
  const cars = [['taxi', -76, 1], ['sedan', -136, 1], ['van', -202, 1], ['dark', 104, -1], ['white', 164, -1], ['truck', 246, -1]].map(([k, x, dir]) => ({ k, x, dir, hk: 0, next: 1e9 })), far = [['bus', 40, 66], ['taxi', 190, 84], ['white', 330, 74], ['truck', 450, 62], ['sedan', 580, 96]].map(([k, x, v]) => ({ k, x: x - 150, v: -v, w: 0 }));
  c4x = { ph: 'k5', t0: now, T: 0, ev: {}, cam: 0, camOk: true, vi: -1, vc: 0, mus: 'off', musAt: now, musGo: false, y: { x: -16, face: 1, lift: 0, pose: null }, m: { x: 0, face: -1, lift: 0, pose: null }, pool: null, fx: [], ny: { cars, far }, q: { res: null, why: '', at: 0 }, q2: { res: null, why: '', at: 0 }, k: null, kc: undefined, black: null, whiteA: 0 };
  const c = c4x; c.black = () => k5Black(c); popups = []; sparks = []; smoke = []; bfList = []; stopMs = 0; shakeUntil = 0; flashUntil = 0; blackUntil = 0; wx = 0; snd('windOff');
}
function k5Skip(c, now) {      // the SKIP button: a lost try starts again at once; otherwise the tap counts as made and the scene goes on to the next part: the road -> the black (Yuji wakes up), the lab -> the huge room, the huge room -> the cards, the cards -> the chapters
  const T = (now - c.t0) / 1000; if (c.q.res === 'miss') { c.t0 = now - (k5Re() - 0.05) * 1000; return; }
  if (!c.q.res) k5Resolve(c, 'hit', '', T);
  if (T < K5T.cut) c.t0 = now - (K5T.cut + 0.05) * 1000;
  else if (T < K5B.room) c.t0 = now - K5B.room * 1000;
  else { if (!c.q2.res) k5Resolve2(c, 'hit', '', T); const cd = k5Cards(c); c.t0 = now - (T < cd.card ? cd.card + 0.05 : cd.end + 0.05) * 1000; }
}
window.__k5At = (t, res, gore, res2) => { if (!c4x || c4x.ph !== 'k5') { if (!story) story = { slot: -1, t0: pnow(), battle: false, T: 0, ev: {}, c16: true }; k5Start(); } const c = c4x; if (c.slow) { snd('slowout'); c.slow = 0; } c.t0 = pnow() - t * 1000; c.ev = {}; c.q = { res: null, why: '', at: 0 }; c.q2 = { res: null, why: '', at: 0 }; c.k = null; c.kc = undefined; c.vi = -1; if (!res && t >= K5T.cut) res = 'hit'; if (res) k5Resolve(c, res, '', Math.min(t, K5T.q + C13.win[1])); if (res2) k5Resolve2(c, res2, '', Math.min(Math.max(t, K5B.q2 - 0.05), K5B.q2 + C13.win[1])); if (gore !== undefined) window.__k5Gore = gore; };      // test hook: start the chapter (or jump in it) at scene time t, with the outcome res of the first tap and res2 of the second
window.__k5 = () => c4x && c4x.ph === 'k5' ? { T: +c4x.T.toFixed(2), res: c4x.q.res, why: c4x.q.why, at: +c4x.q.at.toFixed(2), res2: c4x.q2.res, why2: c4x.q2.why, at2: +c4x.q2.at.toFixed(2) } : null;
window.__k5Tap = () => k5Tap(null);
window.__k5Eval = t => { const c = c4x; if (!c || c.ph !== 'k5') return null; const S = k5Eval(c, t === undefined ? c.T : t); return { ix: +S.im.x.toFixed(1), yx: +S.y.x.toFixed(1), yp: S.y.pose }; };

// ---- the step: the sounds and shakes of every blow (each fires once; one that a skip jumped over by more than 0.4 s is not played late, see c4xEv), the far lane, the end
function k5Step(c, now, dt, T) {
  const ev = (n, t, f) => c4xEv(c, T, n, t, f), N = K5T, miss = c.q.res === 'miss', H = N.hit, gore = k5Gore();
  for (const f of c.ny.far) { f.x += f.v * 0.12 * dt; if (f.x < -330) f.x += 900; }
  if (!c.q.res && T >= N.q + C13.win[1]) k5Resolve(c, c13Off() ? 'hit' : 'miss', 'MISS', N.q + C13.win[1]);
  ev('wind', N.wind0, () => snd('swing', 1)); ev('lunge', N.lunge, () => { snd('thrust', 0.6); snd('swing', 3); puff(54, 6); });
  if (miss) {      // ---- the blade goes through Yuji's chest; he falls; the black, the words, again
    ev('stab', H, () => { snd('c4stab'); hitStop(110); shakeUntil = now + 360; shakeAmp = 6; flash(now, 140, 0.35); if (gore < 2) spark(-18, gy - 34, 14, ['#ffffff', '#ffd27a', '#ff5a6a'], true, -1); });
    ev('pull', H + N.d1, () => { snd('c4pull'); shakeUntil = now + 160; shakeAmp = 2; }); ev('fall', H + 1.0, () => { snd('land', 1.4); puff(-30, 6); });
    ev('died', H + N.d3, () => snd('c5beat'));
    if (T >= k5Re()) k5Start(); return;
  }
  if (!c.q.res) return;      // (the tap is not judged yet: nothing of the fight has happened)
  const blow = (x, k) => { snd('hit', k); hitStop(70); shakeUntil = now + 240; shakeAmp = 4; flash(now, 90, 0.22); puff(x, 3); };
  ev('dodge', 7.8, () => { snd('dash', 1); puff(-19, 4); }); ev('i1', 8.245, () => { blow(33, 3); spark(32, gy - 46, 8, ['#ffffff', '#ffd27a'], true, 1); });
  ev('slide', 8.55, () => { snd('dash', 0); puff(5, 5); }); ev('retract', 10.85, () => snd('shing'));
  ev('gasp', 21.9, () => snd('gasp', 0)); ev('oh', 27.05, () => snd('swing', 0)); ev('pstep', 27.8, () => { snd('thrust', 0.35); puff(18, 4); }); ev('y1', 27.95, () => { blow(-30, 3); snd('smack', 3); });
  ev('i2', 29.475, () => blow(-8, 1)); ev('hook', 30.05, () => snd('swing', 0)); ev('i3', 30.233, () => { blow(-6, 3); snd('swing', 15); });
  ev('shing', 31.4, () => snd('shing')); ev('s1', 31.98, () => snd('swing', 0)); ev('s2', 32.64, () => snd('swing', 0)); ev('s3', 33.3, () => snd('swing', 0));
  ev('chg', 33.8, () => snd('redcharge')); ev('fire', 34.5, () => { snd('redfire'); flash(now, 120, 0.4); shakeUntil = now + 300; shakeAmp = 3; }); ev('y2', 34.55, () => { snd('concboom'); hitStop(90); shakeUntil = now + 420; shakeAmp = 6; puff(-52, 8); spark(-52, gy - 34, 16, ['#ffffff', '#aef6ff', '#ffd27a'], true, -1); });
  ev('fly', 35.0, () => snd('thrust', 0.9)); ev('lnd', 36.05, () => { snd('land', 2); puff(-66, 8); shakeUntil = now + 260; shakeAmp = 3; });
  ev('y3', 36.55, () => { blow(-90, 3); snd('smack', 3); }); ev('cut', N.cut, () => { snd('ko'); snd('windOff'); });
  if (T >= N.cut) k5Step2(c, now, dt, T);      // (v1.178 the lab and the huge room, tools/chap5b.js)
}
function k5Black(c) {      // the black over the picture: the fade in; and after the stab (or at once with GRAPHIC DAMAGE OFF) the fall to black; in part 2 (tools/chap5b.js) the fall to black before the cards
  const T = c.T, N = K5T; if (c.q.res !== 'miss' && T >= N.cut) return k5Black2(c, T); let a = T < N.fade ? 1 - c4xEase(T / N.fade) : 0;
  if (c.q.res === 'miss') { const d = T - N.hit; a = k5Gore() === 2 ? (d >= 0 ? 1 : a) : Math.max(a, c4xEase((d - N.d2) / 0.45)); }
  return a;
}

// ---- the picture
function k5DrawIM(S) {      // Iron Man at the world x, facing left (turned on his side by `rot` when he flies: the pivot is his hip)
  const R = C4I, cv = c4xIron(S.pose), top = gy - R.GY - Math.round(S.lift), hip = S.pose.y;
  ctx.save(); ctx.translate(c4xSX(S.x), 0); ctx.scale(-1, 1); if (S.rot) { ctx.translate(0, top + hip); ctx.rotate(S.rot); ctx.drawImage(cv, -R.cx, -hip); } else ctx.drawImage(cv, -R.cx, top); ctx.restore();
}
const K5SL = [[31.98, 32.3], [32.64, 32.95], [33.3, 33.6]];      // (the three blade swings: the red trail of the blade's point)
function k5Fx(c, now, T, S, miss) {
  const gore = k5Gore(), SX = c4xSX, ix = S.im.x, ch = gy - 34;
  // ---- rings and a bright star where a blow lands; the blood of the ones on Yuji (GRAPHIC DAMAGE FULL)
  for (let i = 0; i < K5I.length; i++) { const [t, who, up] = K5I[i], a = T - t; if (miss || a < 0 || a > (who === 'y' && gore === 0 ? 2.4 : 0.5)) continue; const e = k5Eval(c, t), px = SX(who === 'y' ? e.y.x + 4 : e.im.x - 8), py = gy - up;
    if (a <= 0.5) c3Ring(px, py, a, who === 'y' || i === 3, '255,235,200', 1); if (who === 'y' && gore === 0) c4Spray(T, t, px - 4, py, i === 4 ? 12 : 7, { v: 80, up: 1, dir: -1, life: 0.75, cols: C4_BLOOD, sz: 1, seed: 3 + i, g: 320, gnd: gy + 4, stain: 1.5 }); }
  if (miss) {      // the stab: the red flash where the blade enters, the spray, the second spurt when the blade is pulled out (each is a function of the time since: it is drawn every frame until it is over)
    const a = T - K5T.hit; if (a >= 0 && gore < 2) { if (a < 0.5) c3Ring(SX(-18), ch, a, true, '255,200,200', 1); if (gore === 0) { c4Spray(T, K5T.hit, SX(-18) - 4, ch, 14, { v: 90, up: 1, dir: -1, life: 0.9, cols: C4_BLOOD, sz: 1, seed: 11, g: 300, gnd: gy + 4, stain: 2 }); c4Spray(T, K5T.hit + K5T.d1, SX(-22), ch, 10, { v: 70, up: 1, dir: -1, life: 0.8, cols: C4_BLOOD, sz: 1, seed: 12, g: 300, gnd: gy + 4, stain: 2 }); } }
    return;
  }
  // ---- the rush: dust under his boots and streaks behind him (the thrusters), the slide of Yuji, the blade's trail, the repulser
  const e0 = k5Eval(c, T - 0.04), v = (S.im.x - e0.im.x) / 0.04;
  if (Math.abs(v) > 160) { ctx.save(); ctx.globalAlpha = Math.min(0.7, Math.abs(v) / 700); ctx.fillStyle = '#fff3c8'; const dir = v < 0 ? 1 : -1; for (let i = 0; i < 4; i++) ctx.fillRect(SX(ix) + dir * (16 + i * 5), gy - 8 - i * 7 - S.im.lift, 14 + (i % 2) * 6, 1); ctx.restore(); }
  c4Dust(T, K5T.lunge, SX(54), 7, { w: 16, h: 6, life: 0.5, col: '210,205,190', big: 4, seed: 2 }); c4Dust(T, 8.5, SX(-8), 7, { w: 20, h: 6, life: 0.6, col: '210,205,190', big: 4, seed: 4 }); c4Dust(T, 27.8, SX(10), 6, { w: 18, h: 6, life: 0.5, col: '210,205,190', big: 4, seed: 5 }); c4Dust(T, 35.9, SX(-66), 8, { w: 22, h: 8, life: 0.7, col: '210,205,190', big: 5, seed: 6 });
  for (const [t0, t1] of K5SL) if (T > t0 && T < t1 + 0.16) { const pts = []; for (let s = Math.max(t0, T - 0.15); s <= Math.min(T, t1); s += 0.02) { const e = k5Eval(c, s), bl = c4xIronBlade(e.im.pose); if (bl) pts.push([SX(e.im.x) - bl[1][0], gy - bl[1][1] - e.im.lift]); }
    if (pts.length > 1) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.lineCap = 'round'; for (let i = 1; i < pts.length; i++) { const k = i / pts.length; for (const [w, al, col] of [[5, 0.18, '255,40,56'], [2, 0.8, '255,200,205']]) { ctx.strokeStyle = 'rgba(' + col + ',' + (al * k).toFixed(2) + ')'; ctx.lineWidth = w; ctx.beginPath(); ctx.moveTo(pts[i - 1][0], pts[i - 1][1]); ctx.lineTo(pts[i][0], pts[i][1]); ctx.stroke(); } } ctx.restore(); } }
  if (T > 33.7 && T < 34.7) { const rig = c4xRig(C4I, S.im.pose), h = rig.arms[0].h, px = SX(ix) - (h[0] - C4I.cx), py = gy - (C4I.GY - h[1]) - S.im.lift;      // (the palm: it gathers light, then the beam to Yuji's chest)
    if (T < 34.5) c4xGlow(Math.round(px), Math.round(py), 2 + Math.round(5 * (T - 33.8) / 0.7), ['rgba(120,220,255,0.3)', 'rgba(190,245,255,0.6)', 'rgba(255,255,255,0.95)']);
    else { const k = Math.max(0, 1 - (T - 34.5) / 0.16), tx = SX(-52 + 4), ty = gy - 34; ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.lineCap = 'round'; for (const [w, al, col] of [[9, 0.25, '120,220,255'], [4, 0.7, '200,248,255'], [2, 1, '255,255,255']]) { ctx.strokeStyle = 'rgba(' + col + ',' + (al * k).toFixed(2) + ')'; ctx.lineWidth = w * (0.6 + 0.4 * k); ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(tx, ty); ctx.stroke(); } ctx.restore(); if (k > 0) c4xGlow(Math.round(tx), Math.round(ty), Math.round(9 * k), ['rgba(120,220,255,0.3)', 'rgba(200,248,255,0.65)', 'rgba(255,255,255,0.95)']); } }
}
function k5Draw(c, now, dt, T) {
  const N = K5T, miss = c.q.res === 'miss', ny = c.ny; if (T >= N.cut && !miss) { k5Draw2(c, now, dt, T); return; }
  c4xNyWorld(now); c4xNySign(-70); for (const f of ny.far) c4xDrawCar(f.x, gy - 5, f.k, f.v < 0 ? -1 : 1, false); for (const k of ny.cars) c4xDrawCar(k.x, gy + 5, k.k, k.dir, true); c4xCrater(58, 1);
  const S = k5Eval(c, T), Y = Object.assign(c.y, S.y), imp = S.im, front = !miss && ((T >= 8.12 && T < 8.5) || (T >= 29.35 && T < 29.75) || (T >= 30.0 && T < 30.65));
  Y.white = 0; for (const [t, who] of K5I) if (who === 'y' && T - t >= 0 && T - t < 0.08) Y.white = 1; if (miss && T >= N.hit && T < N.hit + 0.1) Y.white = 1;
  c4xShadow(Y.x, Y.lift, 9); c4xShadow(imp.x, imp.lift, 9);
  const drawI = () => { k5DrawIM(imp); if (imp.pose.bl > 4) { const bd = c4xIronBlade(imp.pose); if (bd) { const sx = c4xSX(imp.x), x1 = sx - bd[1][0], y1 = gy - bd[1][1] - Math.round(imp.lift), k = ((now / 90) | 0) % 2; c4xGlow(Math.round(x1), Math.round(y1), 3 + k, ['rgba(255,40,56,0.3)', 'rgba(255,110,120,0.55)', 'rgba(255,220,224,0.95)']); } } };
  if (front) { drawI(); c4xDrawY(Y); } else { c4xDrawY(Y); drawI(); }
  k5Fx(c, now, T, S, miss); drawSmoke(now, dt); drawSparks(now, dt); drawPopups(now);
}
function k5Tbc(T) {      // black, then the words: END OF CHAPTER 5 (with the name of the chapter), then TO BE CONTINUED
  ctx.fillStyle = '#000'; ctx.fillRect(0, 0, VW, VH); const N = k5Cards(c4x), cx = Math.round(VW / 2), y = Math.round(VH * 0.44), wide = VW >= 272, fade = (t0, t1, t2, t3) => T < t0 ? 0 : T < t1 ? c4xEase((T - t0) / (t1 - t0)) : T < t2 ? 1 : T < t3 ? 1 - c4xEase((T - t2) / (t3 - t2)) : 0, a = fade(N.card, N.card + 0.8, N.card1 - 0.6, N.card1), b = fade(N.card2, N.card2 + 0.8, N.end - 0.7, N.end);
  if (a > 0) { ctx.globalAlpha = a; if (wide) pxt('END OF CHAPTER 5', cx, y, '#ffffff', 16, 'center'); else { pxt('END OF', cx, y - 10, '#ffffff', 16, 'center'); pxt('CHAPTER 5', cx, y + 10, '#ffffff', 16, 'center'); } ctx.fillStyle = '#ff2a3a'; ctx.fillRect(cx - 40, y + (wide ? 8 : 20), 80, 1); pxt('THE IRON MAN', cx, y + (wide ? 24 : 36), '#ff5a6a', 8, 'center'); ctx.globalAlpha = 1; }
  if (b > 0) { ctx.globalAlpha = b; pxt('TO BE CONTINUED', cx, Math.round(VH * 0.5), '#ffffff', 16, 'center'); ctx.globalAlpha = 1; }
}
function k5Overlay(c, now, T) {      // over the picture: the speech box, the ring of the tap and what was made of it, Yuji's shock, the SKIP button, and after a death the words
  const N = K5T, miss = c.q.res === 'miss', d = T - N.hit;
  if (!miss && T >= 21.9 && T < 22.65) c4xFear(c, C4NS.eye + Math.min(0.45, T - 21.9));      // (Yuji's eye, close and full screen: the blade's glint comes late in that picture, so it is held back)
  else if (!(miss && d >= N.d2)) c4xTalk(c, T, miss ? K5_TALK.slice(0, 2) : K5_TALK);      // (the lines of part 2 are in the same list: they come after the black)
  const u = T - N.q, px = c4xSX(c.y.x), py = gy - 34;
  if (!c.q.res && u > -C13P.tap.vis && u < C13.win[1] + 0.25 && !c13Off()) { const rad = 11 + 26 * Math.pow(clamp01(-u / C13P.tap.vis), 1.2), gold = Math.abs(u) <= C13.perfect + 0.02; ctx.save(); ctx.imageSmoothingEnabled = false; c13Ring(px, py, rad, '#ffffff', gold, '#c4121c', 'TAP', 'DODGE'); if (u < -0.2) pxt('TAP OR PRESS ANY KEY', Math.round(VW / 2), VH - 6, '#ffffff', 8, 'center'); ctx.restore(); }
  else if (c.q.res && c.q.why) { const t = T - c.q.at; if (t >= 0 && t < 0.8) { const r = c.q.res; ctx.save(); ctx.globalAlpha = 1 - t / 0.8; pxt(c.q.why, px, py - 22 - t * 12, r === 'miss' ? '#ff3347' : c.q.why === 'PERFECT' ? '#ffe08a' : '#ffffff', 10, 'center'); ctx.restore(); if (r === 'miss' && t < 0.4) { ctx.fillStyle = 'rgba(255,0,20,' + (0.3 * (1 - t / 0.4)).toFixed(3) + ')'; ctx.fillRect(0, 0, VW, VH); } } }
  if (T >= N.cut && !miss) k5Overlay2(c, now, T);
  if (T > 0.8 && T < (miss ? N.hit : k5Cards(c).black) - 0.4) { ctx.strokeStyle = 'rgba(255,255,255,0.55)'; ctx.lineWidth = 1; ctx.strokeRect(VW - 39.5, 2.5, 36, 10); pxt('SKIP', VW - 21, 11, '#ffffff', 8, 'center'); }
}

function k5After(c, now, T) {      // over the black too: after a death the words YUJI DIED (they come as the picture goes black, and go before the scene starts again)
  const N = K5T, d = T - N.hit; if (c.q.res !== 'miss') return;
  if (d >= (k5Gore() === 2 ? 0.5 : N.d3)) { const a = c4xEase((d - (k5Gore() === 2 ? 0.5 : N.d3)) / 0.5) * (1 - c4xEase((T - (k5Re() - 0.6)) / 0.5)); if (a > 0.01) { ctx.save(); ctx.globalAlpha = a; pxt('YUJI DIED', Math.round(VW / 2), Math.round(VH * 0.46), '#ff3347', 16, 'center'); ctx.restore(); } }
}
