// ================================================================ v1.136 CHAPTER 3, PART 4: THE AIR FIGHT, SECOND HALF (to 2:00 of the first song), THEN SILENCE AND THE DOMAIN
// After v1.135 (tools/chap3c.js) Sukuna and Mahoraga hang face to face high over the city; the rest of the first song (bars 21 - 58, up to 2:00) is their fight: hooks, dodges, counters, kicks, clashes of fists, a fall together through the clouds to the roofs of the city, a long
// calm (the breakdown of the song) with the wheel turning, a climb back to the moon, and at last Sukuna dodges a hook and punches him, Mahoraga kicks him back, and the song STOPS dead as the kick lands. Then, in silence: Sukuna flies back, makes the hand sign, the user's GIF (in
// pixel form: tools/gif_pixel.py) fills the screen with the words DOMAIN EXPANSION / MALEVOLENT SHRINE, the domain spreads and Mahoraga disappears into blood.
// The fight is a SCRIPT of blows (C11EV: the moment it lands on a beat of the song, who hits with which move, what the other does); c11Build() turns it into windows for each fighter (the pose over time and where he is, measured from the places their pictures' anchors must be at the moment of
// contact) and everything is a function of the song time m again, so a tap, a pause or a test jump draws the same picture.

// ---- the blows. Mahoraga's: the clip, how many pictures, a second, the picture the blow lands on, and the anchor that hits. Sukuna's: the row of CU_GAME[3].atk, the same, and how far in front of his pivot the blow reaches ([x, y])
const C11MV = {
  hookN: { who: 'M', clip: 'hookN', n: 12, fps: 18, hit: 7, anc: 'fist', tail: 0.3 }, hookF: { who: 'M', clip: 'hookF', n: 12, fps: 18, hit: 7, anc: 'fistF', tail: 0.3 },
  kick: { who: 'M', clip: 'kick', n: 12, fps: 16, hit: 6, anc: 'toeN', tail: 0.35 }, punch: { who: 'M', clip: 'apunch', n: 16, fps: 22, hit: 10, anc: 'fist', tail: 0.3 },
  jab: { who: 'S', row: 0, n: 15, fps: 30, hit: 7, reach: [22, -4], tail: 0.25 }, jab2: { who: 'S', row: 1, n: 15, fps: 30, hit: 7, reach: [22, -4], tail: 0.25 },
  skick: { who: 'S', row: 2, n: 15, fps: 30, hit: 5, reach: [24, -8], tail: 0.3 }, chop: { who: 'S', air: [7, 8], n: 2, fps: 9, hit: 1, reach: [20, 0], tail: 0.3 }
};

// ---- the script of the fight: t = the moment the blow lands (a beat of the song), a = who hits (M Mahoraga, S Sukuna), mv = the blow, re = what the other does (dodge, block, hit: thrown back, hurt: the head snaps back, slash: cut and the wheel adapts, clash: both hit at once),
// imp = the impact frame (0 none, 1 a flash, 2 the black-and-white one), kb = how far the other is thrown (px), sh = shake, tg = where it lands ('head' or 'body')
const C11EV = [
  { t: c9B(22, 1), a: 'M', mv: 'hookN', re: 'dodge' }, { t: c9B(23, 0), a: 'S', mv: 'jab', re: 'hurt', imp: 1, tg: 'head' },
  { t: c9B(24, 2), a: 'M', mv: 'hookF', re: 'block', kb: 22 }, { t: c9B(25, 1), a: 'S', mv: 'skick', re: 'hurt', imp: 1, tg: 'head' },
  { t: c9B(26, 3), a: 'M', mv: 'kick', re: 'block', kb: 34, sh: 3 }, { t: c9B(27, 1), a: 'S', mv: 'jab2', re: 'hurt', tg: 'head' },
  { t: c9B(28, 1), a: 'M', mv: 'hookN', re: 'dodge' }, { t: c9B(29, 0), a: 'S', mv: 'skick', re: 'hurt', imp: 2, tg: 'head', kb: 30, sh: 4 },
  { t: c9B(30, 0), a: 'M', mv: 'punch', re: 'hit', imp: 2, kb: 120, sh: 6 }, { t: c9B(31, 0), a: 'S', mv: 'chop', re: 'slash', imp: 1, tg: 'body', sh: 3 },
  { t: c9B(32, 0), a: 'M', mv: 'hookF', re: 'dodge' }, { t: c9B(32, 3), a: 'S', mv: 'jab2', re: 'hurt', tg: 'head' },
  { t: c9B(33, 2), a: 'M', mv: 'punch', re: 'clash', imp: 2, sh: 6, with: { a: 'S', mv: 'jab' } }, { t: c9B(34, 1), a: 'M', mv: 'hookN', re: 'hit', kb: 70, sh: 4 },
  { t: c9B(35, 0), a: 'M', mv: 'kick', re: 'clash', imp: 2, sh: 8, with: { a: 'S', mv: 'skick' } },
  { t: c9B(43, 3), a: 'M', mv: 'hookN', re: 'hit', imp: 1, kb: 60, sh: 4, blood: 1 }, { t: c9B(44, 2), a: 'M', mv: 'hookF', re: 'hit', kb: 60, sh: 4 },
  { t: c9B(45, 3), a: 'S', mv: 'jab', re: 'hurt', tg: 'head' }, { t: c9B(47, 0), a: 'M', mv: 'kick', re: 'hit', imp: 1, kb: 80, sh: 5 },
  { t: c9B(49, 0), a: 'S', mv: 'chop', re: 'slash', imp: 1, tg: 'body', sh: 3 }, { t: c9B(50, 2), a: 'M', mv: 'punch', re: 'clash', imp: 2, sh: 6, with: { a: 'S', mv: 'jab2' } },
  { t: c9B(51, 0), a: 'M', mv: 'hookN', re: 'block', kb: 26 }, { t: c9B(52, 0), a: 'M', mv: 'punch', re: 'hit', imp: 1, kb: 90, sh: 5 },
  { t: c9B(53, 0), a: 'S', mv: 'jab2', re: 'hurt', imp: 1, tg: 'head', sh: 4 },
  { t: c9B(55, 2), a: 'M', mv: 'hookF', re: 'dodge' }, { t: c9B(56, 3), a: 'S', mv: 'jab', re: 'hurt', imp: 2, tg: 'head', kb: 40, sh: 6 },
  { t: c9B(58, 1), a: 'M', mv: 'kick', re: 'hit', imp: 2, kb: 400, sh: 9, last: true }
];
// the slow parts: the wheel turns a notch (the times in song time), the first at the end of the first quiet bars
const C11NOTCH = [c9B(31, 1), c9B(36, 3), c9B(40, 2), c9B(43, 1), c9B(49, 1), c9B(57, 2)];
const C11POSE = [{ who: 'S', t0: c9B(37, 0), dur: 2.0, pic: { air: 4 } }, { who: 'S', t0: c9B(41, 0), dur: 1.6, pic: { air: 4 } }];      // (poses on their own in the calm: Sukuna beckons)
// where the middle of the pair is: [song time, x from the arena, y from the arena]: high up with the moon, the fall together to the roofs, the calm there, the climb back
const C11PATH = [[c9B(21, 0), 2, -298], [c9B(29, 0), 14, -304], [c9B(33, 2), -6, -298], [c9B(35, 0), 10, 455], [c9B(46, 0), -16, 455], [c9B(50, 2), 8, -250], [c9B(58, 1), 0, -300]];
const C11G = { sep: 108, dy: 12 };      // how far apart they hang (px) and how much lower Sukuna hangs than Mahoraga

function c11Spl(keys, m, comp) {      // a smooth path through keys [t, a, b, ...] (the same spline as the cameras, c10Kf, for any numbers: comp = which of the numbers)
  const n = keys.length; if (m <= keys[0][0]) return keys[0][comp]; if (m >= keys[n - 1][0]) return keys[n - 1][comp]; let i = 0; while (i < n - 2 && m > keys[i + 1][0]) i++;
  const t0 = keys[i][0], t1 = keys[i + 1][0], u = (m - t0) / (t1 - t0), v0 = keys[i][comp], v1 = keys[i + 1][comp], pa = i > 0 ? keys[i - 1] : null, pb = i + 2 < n ? keys[i + 2] : null, h = t1 - t0, u2 = u * u, u3 = u2 * u;
  const m0 = pa ? (v1 - pa[comp]) / (t1 - pa[0]) : 0, m1 = pb ? (pb[comp] - v0) / (pb[0] - t0) : 0;      // (the ends are flat: the pair starts and ends at rest)
  return (2 * u3 - 3 * u2 + 1) * v0 + (u3 - 2 * u2 + u) * h * m0 + (-2 * u3 + 3 * u2) * v1 + (u3 - u2) * h * m1;
}
function c11Mid(m) { const E = c10Env(); return { x: E.AC.x + c11Spl(C11PATH, m, 1) + 6 * Math.sin(m * 0.37), y: E.AC.y + c11Spl(C11PATH, m, 2) }; }      // the middle of the pair (a slow sway on top)
function c11Base(who, m) {      // where he hangs when nothing is happening: Sukuna on the left, Mahoraga on the right (a little higher), each bobbing
  const B = c11Mid(m), s = m + C9.m0, G = C11G; return who === 'S' ? { x: B.x - G.sep / 2 + 1.2 * Math.sin(m * 1.9), y: B.y + G.dy / 2 + 2.4 * Math.sin(m * 2.7) } : { x: B.x + G.sep / 2 + 1.5 * Math.sin(s * 1.6), y: B.y - G.dy / 2 + 2.4 * Math.sin(s * 2.3) };
}

// ---- smooth curves of one number through keys [u, value] (smoothstep between them)
function c11K(keys, u) { if (u <= keys[0][0]) return keys[0][1]; for (let i = 0; i < keys.length - 1; i++) if (u <= keys[i + 1][0]) { const a = keys[i], b = keys[i + 1], k = (u - a[0]) / (b[0] - a[0]); return a[1] + (b[1] - a[1]) * k * k * (3 - 2 * k); } return keys[keys.length - 1][1]; }

// ---- the windows. A window = what one fighter does for a while: { t0, dur, pose(u) -> { dx, dy, rot, pic } } with u = seconds since t0, dx / dy = where he is from where he hangs
function c11MFrame(clip, k) { return c10mf(clip, k); }
function c11Build() {
  const key = VW + 'x' + gy + 'x' + c8X0(); if (C11.b && C11.b.key === key) return C11.b;
  const W = { S: [], M: [] }, EV = [], D = CU_GAME[3], atk = D && D.atk, air = D && D.air;
  if (!atk || !air || !air.length) return null;
  C11EV.forEach((e, idx) => {
    const A = e.a, Dd = A === 'M' ? 'S' : 'M', tc = e.t;
    // where the blow lands: on the defender's head (or body) at the moment of contact (the defender's base, plus his own offset in that moment)
    const bD = c11Base(Dd, tc), PF = M7.frames[c10mf('floatg', 0)], mh = [PF.head[0] - PF.pelvis[0], PF.head[1] - PF.pelvis[1] + 4], mc = [PF.chest[0] - PF.pelvis[0], PF.chest[1] - PF.pelvis[1]], tgOff = Dd === 'S' ? (e.tg === 'body' ? [0, -4] : [3.5, -18.5]) : (e.tg === 'body' ? mc : mh);
    let dOff = [0, 0];
    // the defender's reaction window (it starts before the blow for a dodge or a block, with it for a hit)
    const kb = e.kb == null ? 28 : e.kb, re = e.re;
    const rdur = e.last ? 60 : re === 'dodge' ? 0.95 : re === 'block' ? 0.8 : re === 'clash' ? 0.7 : 0.8, rt0 = re === 'dodge' ? tc - 0.3 : re === 'block' ? tc - 0.12 : tc - 0.02;
    const decay = (a, tau, u0) => Math.exp(-Math.max(0, a - u0) / tau);
    let rpose = null;
    if (re === 'dodge') rpose = u => { const e1 = c11K([[0, 0], [0.22, 1], [0.62, 1], [0.95, 0]], u); return { dx: -13 * e1, dy: 14 * e1, rot: -0.58 * e1, pic: { air: u < 0.1 ? 5 : u < 0.7 ? 6 : 5 } }; };
    else if (re === 'block') rpose = u => { const k = Math.exp(-Math.max(0, u - 0.12) / 0.22); return { dx: -kb * (1 - k) + 2 * Math.sin(u * 90) * k, dy: 0, rot: -0.1 * (1 - k), pic: { air: 9 } }; };
    else if (re === 'hurt') rpose = u => { const k = 1 - Math.exp(-Math.max(0, u - 0.02) / 0.1); return { dx: (Dd === 'S' ? -1 : 1) * (kb * 0.3) * k * decay(u, 0.5, 0.2), dy: -3 * k * decay(u, 0.3, 0.1), rot: 0, pic: Dd === 'M' ? { clip: 'hurt', f: u * 15 } : { fall: u < 0.1 ? 1 : 2 } }; };
    if (e.last) rpose = u => {      // (the blow that ends the song: he is thrown far back, tumbles, finds his balance, hangs there; at 3.4 s the hand sign: his hands rise, the fingertips touch, the sign is held)
      const k = 1 - Math.exp(-Math.max(0, u - 0.02) / 0.75), t = Math.max(0, u - 1.5) / 0.45, tum = -7 * (1 - Math.exp(-u / 0.6)), rot = u < 1.5 ? tum : lerp(-7 * (1 - Math.exp(-1.5 / 0.6)), -2 * Math.PI, c10bk(t)), r = u - 3.4;
      const pic = u < 0.06 ? { fall: 1 } : u < 0.15 ? { fall: 2 } : u < 0.3 ? { fall: 3 } : u < 1.5 ? { fall: 4 } : u < 3.4 ? { air: 0 } : { row: 23, f: r < 0.48 ? r / 0.12 : 5 + (Math.floor((r - 0.48) / 0.11) % 6) };
      return { dx: -kb * k, dy: -50 * k + (u > 1.5 ? 8 * Math.sin(u * 2.4) : 0), rot, pic };
    }; else if (re === 'hit' || re === 'clash' || re === 'slash') rpose = u => {
      const k = 1 - Math.exp(-Math.max(0, u - 0.02) / 0.16), dir = Dd === 'S' ? -1 : 1, d = re === 'slash' ? Math.min(kb, 30) : kb;
      return { dx: dir * d * k * decay(u, 0.9, 0.3) * (re === 'hit' ? 1 : 0.8), dy: (re === 'hit' ? -14 : -4) * k * decay(u, 0.4, 0.1), rot: Dd === 'S' ? (re === 'hit' ? 0.9 * dir * k * decay(u, 0.8, 0.2) : 0.4 * dir * k) : 0, pic: Dd === 'M' ? { clip: 'hurt', f: u * 15 } : { fall: u < 0.08 ? 1 : u < 0.2 ? 2 : u < 0.4 ? 3 : 4 } };
    };
    if (re !== 'clash') { const R = { t0: rt0, dur: rdur, pose: rpose, ev: idx, kind: 'react' }; W[Dd].push(R); dOff = rpose(tc - rt0 + 0.0); dOff = [dOff.dx, dOff.dy]; }
    // the attacker: the offset that puts the anchor of the blow on the target at the moment of contact
    const bA0 = c11Base(A, tc), target = re === 'clash' ? [(bD.x + bA0.x) / 2, (bD.y + bA0.y) / 2 - 12] : [bD.x + dOff[0] + tgOff[0], bD.y + dOff[1] + tgOff[1]];
    const mkAtk = (who, mvk) => {
      const m2 = C11MV[mvk], lead2 = m2.hit / m2.fps, base = c11Base(who, tc); let off;
      if (who === 'M') { const fi = c11MFrame(m2.clip, m2.hit), P = M7.frames[fi], r = [P[m2.anc][0] - P.pelvis[0], P[m2.anc][1] - P.pelvis[1]]; off = [target[0] - r[0] - base.x, target[1] - r[1] - base.y]; }
      else { off = [target[0] - m2.reach[0] - base.x, target[1] - m2.reach[1] - base.y]; }
      return { t0: tc - lead2, dur: lead2 + m2.tail, kind: 'atk', ev: idx, who, pose: u => {
        const k = c11K([[0, 0], [Math.max(0.05, lead2 - 0.2), 0.12], [lead2, 1], [lead2 + 0.1, 1.07], [lead2 + m2.tail, 0.25]], u), o = [off[0] * k, off[1] * k];
        const f = u * m2.fps + 0.02;      // (a hundredth more, so that the picture of the contact is on at the very moment of contact)
        if (who === 'M') return { dx: o[0], dy: o[1], rot: 0, pic: { clip: m2.clip, f } };
        return { dx: o[0], dy: o[1], rot: 0, pic: m2.air ? { air: m2.air[Math.min(1, Math.floor(f))] } : { row: m2.row, f } };
      } };
    };
    W[A].push(mkAtk(A, e.mv));
    if (re === 'clash') { const o = e.with; W[o.a].push(mkAtk(o.a, o.mv)); }
    EV.push({ ...e, px: target[0], py: target[1], t: tc, idx });
  });
  for (const q of C11POSE) W[q.who].push({ t0: q.t0, dur: q.dur, kind: 'pose', pose: () => ({ dx: 0, dy: 0, rot: 0, pic: q.pic }) });
  for (const w of [W.S, W.M]) w.sort((a, b) => a.t0 - b.t0);
  return C11.b = { key, W, EV };
}
const C11 = { b: null };

// ---- one fighter at the song time m: where he is (his place and the offset of the window that is on), the picture (null = the hovering one) and the one that was on just before (it fades out over 0.07 s)
function c11St(who, m, depth) {
  const B = c11Build(); if (!B) return null; const Wn = B.W[who], base = c11Base(who, m); let k = -1;
  for (let i = 0; i < Wn.length; i++) { if (Wn[i].t0 <= m) k = i; else break; }
  let off = [0, 0], rot = 0, pic = null, back = null;
  if (k >= 0) {
    const w = Wn[k], u = m - w.t0;
    if (u <= w.dur) { const P = w.pose(u); off = [P.dx, P.dy]; rot = P.rot || 0; pic = P.pic; }
    else { const P = w.pose(w.dur), r = Math.exp(-(u - w.dur) / 0.22); off = [P.dx * r, P.dy * r]; rot = (P.rot || 0) * r; }
    if (k > 0 && u < 0.2 && (depth || 0) < 2) {      // (the window before this one: his place and his picture carry over, fading out)
      const Q = c11St(who, w.t0 - 1e-4, (depth || 0) + 1), P0 = w.pose(0), e = Math.exp(-u / 0.09);
      off = [off[0] + (Q.off[0] - P0.dx) * e, off[1] + (Q.off[1] - (P0.dy || 0)) * e]; rot += (Q.rot - (P0.rot || 0)) * e; if (u < 0.07 && Q.pic) back = { pic: Q.pic, a: 1 - u / 0.07 };
    }
  }
  return { x: base.x + off[0], y: base.y + off[1], off, rot, pic, back, k };
}
function c11Suk(m) {
  const D = CU_GAME[3], st = c11St('S', m, 0); if (!st) return null; const air = D.air, f4 = Math.floor(m * 7) & 3, PV = C10PV;
  const pic = sp => { if (!sp) return { pic: air[f4], pv: PV, ei: f4 }; if (sp.air != null) return { pic: air[sp.air], pv: PV, ei: sp.air }; if (sp.row != null) return { pic: D.atk[sp.row][Math.max(0, Math.min(14, Math.floor(sp.f)))], pv: PV, eye: [4.5, -18.5] }; return { pic: c8SukPic(sp.fall), pv: [33, 34], eye: [3, -17] }; };
  const P = pic(st.pic), o = { ...P, x: st.x, y: st.y, rot: st.rot + (st.pic ? 0 : 0.04 * Math.sin(m * 1.3)), sx: 1, a: 1, mode: 'b' };
  if (st.back) { const Q = pic(st.back.pic); o.back = { pic: Q.pic, pv: Q.pv, a: st.back.a }; } return o;
}
function c11Mah(m) {
  const st = c11St('M', m, 0); if (!st) return null; const s = m + C9.m0, fr = sp => !sp ? c10mf('floatg', Math.floor(s * 8) % 12) : c10mf(sp.clip, sp.f);
  const o = { i: fr(st.pic), x: st.x, y: st.y, rot: st.rot, sx: 1, mode: 'b' }; if (st.back) o.back = { i: fr(st.back.pic), a: st.back.a }; return o;
}

// ---- the cameras: every shot (b01 - b29) is a scene of the fight with its own zoom (z0 to z1 over the shot), where it looks (mode: the middle of the two, or Sukuna, or Mahoraga, or toward the blow that lands next to it), a slow roll (amplitude and turns) and a punch-in on every blow
const C11CAM = {
  b01: { z: [1.0, 1.18] }, b02: { z: [1.25, 1.5], roll: 0.03 }, b03: { z: [1.4, 1.3], mode: 'hit', roll: 0.04 }, b04: { z: [1.7, 1.9], mode: 'hit' }, b05: { z: [1.35, 1.2], roll: 0.12, cyc: 1 }, b06: { z: [1.9, 1.5], mode: 'hit' },
  b07: { z: [1.15, 0.95], roll: 0.05 }, b08: { z: [1.8, 1.5], mode: 'hit' }, b09: { z: [1.35, 1.2], roll: 0.05 }, b10: { z: [1.3, 1.05], roll: 0.15, cyc: 1 }, b11: { z: [0.95, 0.85], roll: 0.08 }, b12: { z: [1.6, 1.3], mode: 'hit' },
  b13: { z: [0.95, 1.1], roll: 0.1, cyc: 0.5 }, b14: { z: [2.4, 2.8], mode: 'S', roll: 0.03 }, b15: { z: [2.2, 2.6], mode: 'M', roll: 0.03 }, b16: { z: [1.0, 1.35], roll: 0.06 }, b17: { z: [1.4, 1.6], mode: 'hit' }, b18: { z: [1.3, 1.15], roll: 0.05 },
  b19: { z: [1.7, 1.9], mode: 'hit' }, b20: { z: [1.05, 0.95], roll: 0.1, cyc: 1 }, b21: { z: [1.8, 1.6], mode: 'hit' }, b22: { z: [1.5, 1.7], mode: 'hit' }, b23: { z: [1.3, 1.2], roll: 0.05 }, b24: { z: [1.9, 1.6], mode: 'hit' },
  b25: { z: [1.0, 1.1] }, b26: { z: [1.3, 1.45] }, b27: { z: [1.9, 2.2], mode: 'hit' }, b28: { z: [2.4, 2.9], mode: 'M', roll: 0.02 }, b29: { z: [1.6, 1.3], mode: 'hit' }
};
function c11CamD(m, name) {      // the silent shots: after the kick Sukuna flies back and the camera chases him; the sign: in on his hands; the domain: on him as it spreads
  const K = C11K.kick, cx = VW / 2, cy = VH * 0.5, C = (z, fx, fy, rot) => ({ z, fx, fy, tx: cx, ty: cy, rot: rot || 0 }), S = t => c11Suk(t) || { x: 0, y: 0, rot: 0, sx: 1 }, B = c11Build(), e = B ? B.EV[B.EV.length - 1] : { px: 0, py: 0 };
  if (name === 'd01') return c10Kf([[K, C(1.5, e.px, e.py)], [K + 0.6, C(1.2, (S(K + 0.6).x + e.px) / 2, (S(K + 0.6).y + e.py) / 2)], [K + 1.6, C(1.0, S(K + 1.6).x + 40, S(K + 1.6).y - 10, 0.04)], [K + 3.4, C(1.1, S(K + 3.4).x + 30, S(K + 3.4).y - 12)]], m);
  if (name === 'd02') return c10Kf([[K + 3.4, C(1.4, S(K + 3.4).x + 22, S(K + 3.4).y - 8)], [K + 4.4, C(2.4, S(K + 4.4).x + 12, S(K + 4.4).y - 12)], [K + 5.6, C(3.3, S(K + 5.6).x + 10, S(K + 5.6).y - 14, -0.02)]], m);
  return c10Kf([[K + 9.9, C(1.6, S(K + 9.9).x, S(K + 9.9).y - 10)], [K + 12.2, C(1.45, S(K + 12.2).x, S(K + 12.2).y - 10)]], m);
}
function c11Cam(m, name) {
  if (/^d0[1-5]$/.test(name)) return c11CamD(m, name);
  const B = c11Build(), cx = VW / 2, cy = VH * 0.5, sc = C11CAM[name] || { z: [1.2, 1.2] }, i = C11S.findIndex(a => a[0] === name), t0 = i >= 0 ? C11S[i][1] : m, t1 = i >= 0 && i + 1 < C11S.length ? C11S[i + 1][1] : t0 + 4, u = clamp01((m - t0) / (t1 - t0));
  const pos = (mm) => { const S = c11Suk(mm), M = c11Mah(mm); return S && M ? [(S.x + M.x) / 2, (S.y - 12 + M.y - 38) / 2] : [c11Mid(mm).x, c11Mid(mm).y - 20]; };
  let fx = 0, fy = 0; for (let j = 0; j < 4; j++) { const p = pos(m - 0.12 * j); fx += p[0] / 4; fy += p[1] / 4; }      // (the middle, smoothed over the last half second)
  if (sc.mode === 'S' || sc.mode === 'M') { const q = sc.mode === 'S' ? c11Suk(m) : c11Mah(m); const h = sc.mode === 'S' ? c10Hp(q, C10E[q.ei == null ? 0 : q.ei] || [3.5, -18.5]) : c10An(q, 'head'); fx = lerp(fx, h[0], 0.85); fy = lerp(fy, h[1], 0.85); }
  let zp = 1; if (B) for (const e of B.EV) { const a = m - e.t; if (a >= 0 && a < 1.2) zp += (e.imp ? 0.12 : 0.06) * Math.exp(-a * 8); if (sc.mode === 'hit' && a > -0.5 && a < 0.7) { const w = Math.exp(-a * a / 0.18) * 0.65; fx = lerp(fx, e.px, w); fy = lerp(fy, e.py, w); } }
  const z = lerp(sc.z[0], sc.z[1], ease3(u)) * zp;
  return { z, fx, fy, tx: cx, ty: cy, rot: (sc.roll || 0) * Math.sin(Math.PI * 2 * (sc.cyc || 0.5) * u) };
}

// ---- effects of the blows: the ring at the contact, sparks where he blocks or is cut, blood where he is hit, after-images of whoever strikes, the shake and the lights
function c11Lit(m) { const B = c11Build(); if (B) for (const e of B.EV) if (e.imp && Math.abs(m - e.t) < 0.04) return 'white'; for (const t of C11NOTCH) if (m >= t && m < t + 0.7) return 'gold'; return 'cold'; }
function c11Calm(m) {      // the calm: embers and specks drift slowly through the picture (the breakdown of the song)
  const a = c9B(36, 0), b = c9B(43, 0); if (m < a || m > b) return; const k = Math.min(clamp01((m - a) / 1.5), clamp01((b - m) / 1.5)), P = c11Mid(m); ctx.save(); ctx.globalCompositeOperation = 'lighter';
  for (let i = 0; i < 36; i++) { const ph = (m * 0.1 * (0.6 + 0.8 * c4R(i, 1)) + c4R(i, 2)) % 1, x = P.x + 200 - ph * 400, y = P.y - 100 + c4R(i, 3) * 190 - ph * 24 * c4R(i, 4); ctx.globalAlpha = Math.sin(Math.PI * ph) * 0.85 * k * (0.65 + 0.35 * Math.sin(m * 3 + i)); ctx.fillStyle = i % 3 ? '#ffe9a8' : '#cfe0ff'; ctx.fillRect(Math.round(x), Math.round(y), 1 + (i & 1), 1 + (i & 1)); }
  ctx.restore();
}
function c11Fx(m) {
  const B = c11Build(); if (!B) return; c11Calm(m); if (m >= C11K.kick + 3.4 && m < C11K.kick + 6) c11Aura(m, c11Suk(m));
  for (const e of B.EV) {
    const a = m - e.t; if (a < -0.2 || a > 1.8) continue;
    if (Math.abs(a) < 0.17) { if (e.a === 'M' || e.re === 'clash') c10Ghosts(m, 0.035, 3, 0.3, 'cold'); if (e.a === 'S' || e.re === 'clash') c10GhostsS(m, 0.035, 3, 0.34); }
    if (a < 0) continue; const big = e.imp === 2 || e.sh >= 5;
    c3Ring(e.px, e.py, a, big, '255,235,200', big ? 1 : 0.7); if (a < 0.7 && e.re !== 'dodge') v6Ring(e.px, e.py, 8 + (big ? 140 : 90) * c10out(a / 0.7), 0.8 * (1 - a / 0.7), '255,230,210');
    if (e.re === 'block' || e.re === 'slash' || e.re === 'clash') c4Spray(m, e.t, e.px, e.py, 16, { v: 170, up: 1, dir: 0, life: 0.5, cols: ['#ffffff', '#ffe08a', '#ffb0b0', '#ff7a8a'], sz: 1, seed: 40 + e.idx, g: 60, gnd: 1e9 });
    if ((e.a === 'M' && (e.re === 'hit' || e.re === 'slash')) || e.blood) c10Blood(m, e.t, e.px, e.py, e.blood ? 16 : 6, 70 + e.idx, 100, 0.8);
    if (e.re === 'slash') { const L = 46 + 40 * c10out(a / 0.1), al = a < 0.1 ? 1 : Math.exp(-(a - 0.1) * 5); if (al > 0.03) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = al; c6Line(Math.round(e.px - L * 0.8), Math.round(e.py + L * 0.6), Math.round(e.px + L * 0.8), Math.round(e.py - L * 0.6), a < 0.1 ? '#ffffff' : '#ff5a6a'); c6Line(Math.round(e.px - L * 0.8), Math.round(e.py - L * 0.6), Math.round(e.px + L * 0.8), Math.round(e.py + L * 0.6), a < 0.1 ? '#ffffff' : '#ff5a6a'); ctx.restore(); } }
  }
}
function c11Impacts(m, cam) {
  const B = c11Build(); if (!B) return;
  for (const e of B.EV) { if (!e.imp) continue; const k = m - e.t; if (k < 0 || k > 0.55) continue; if (e.imp === 2) c10Impact(m, e.t, cam, e.px, e.py, 0.45); else if (k < 0.04) { ctx.save(); ctx.globalCompositeOperation = 'difference'; ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, VW, VH); ctx.restore(); } else c6White(0.34 * Math.exp(-(k - 0.04) * 13)); }
}
function c11Shake(m) { const B = c11Build(); let a = 0; if (B) for (const e of B.EV) if (e.sh && m >= e.t) a += e.sh * Math.exp(-(m - e.t) * 6); return a; }

// ---- the sounds of the fight
function c11Events(T, ev) {
  const B = c11Build(); if (!B) return; const R = c9Start();
  B.EV.forEach(e => {
    const mv = C11MV[e.mv], lead = mv.hit / mv.fps, k = 'c11' + e.idx;
    ev(k + 'w', R + e.t - lead, () => snd(e.a === 'M' ? 'c7cloth' : 'dash', e.a === 'M' ? 1 : 1), 0.4);
    ev(k + 'a', R + e.t - 0.04, () => { snd('c7whoosh'); if (e.re === 'block') snd('c8crack'); else if (e.re === 'slash') { snd('c6scrape'); snd('c7tear'); } else if (e.re !== 'dodge') snd('smack', e.imp === 2 ? 3 : e.a === 'M' ? 2 : 1); if (e.imp === 2 || e.re === 'clash') snd('c7smash'); if (e.imp === 2 && e.re !== 'clash') snd('c7thud', 0); }, 0.5);
    if (e.re === 'dodge') ev(k + 'd', R + e.t - 0.3, () => snd('dash', 0), 0.4);
  });
  C11NOTCH.forEach((t, i) => ev('c11n' + i, R + t, () => { snd('c7wheel', 1); snd('rct', 0); }, 0.8));
  const K = C11K.kick;      // (the silent part: the wind of the flight, the sign, the touch of the fingertips, the face of the GIF, the domain, the blood)
  ev('c11s0', R + K + 0.1, () => snd('c7whoosh'), 0.6); ev('c11s1', R + K + 1.0, () => snd('c7whoosh'), 0.6); ev('c11s2', R + K + 2.0, () => snd('c7cloth', 0), 0.6);
  ev('c11sg0', R + K + 3.4, () => snd('sukdom', 0), 1.0); ev('c11sg1', R + K + 3.9, () => snd('sukdom', 1), 0.8); ev('c11gif', R + K + 5.6, () => { snd('sukdom', 2); snd('c7beat', 0); }, 1.0);
  ev('c11w1', R + K + 5.6 + C11R.word1, () => snd('c7beat', 1), 0.6); ev('c11w2', R + K + 5.6 + C11R.word2, () => snd('c7beat', 1), 0.6);
  ev('c11dom', R + K + 9.9, () => snd('sukdom', 3), 1.2); ev('c11bl0', R + K + 12.2 + 0.5, () => { snd('c7tear'); snd('c4guts'); snd('c7shatter'); }, 1.0); ev('c11bl1', R + K + 12.2 + 1.6, () => snd('c4guts'), 0.8); ev('c11wind', R + K + 12.2 + 0.9, () => { snd('c7whoosh'); snd('c7rise'); }, 1.0);
}
for (const a of C11S) c7Shots[a[0]] = c10Shot;      // (the shots of the second half are drawn by c10Shot too)
C8N.push(...C11NOTCH.map(t => C9.m0 + t));


// ---- the silent part (C11K.kick on): r = seconds since the kick. d01 Sukuna flies back, d02 the hand sign, d03 the GIF fills the screen with the words, d04 the domain spreads from him, d05 Mahoraga disappears into blood
const SGIF = { w: 150, h: 123, n: 38, ms: 100 }, SGIF_IMG = (() => { const i = new Image(); i.src = '__SUKGIFPNG__'; return i; })();      // (the user's GIF in pixel form: tools/gif_pixel.py)
const C11R = { word1: 1.4, word2: 2.4 };      // (in the GIF shot: when the two words begin to be written)
function c11Gif(m) {      // the GIF over the whole screen: its 38 pictures at 10 a second, the picture tilting down from the hair and the hands to the face; flash at the start, the grain, the two words written letter by letter on a dark band at the bottom
  const r = m - C11K.kick - 5.6, W = SGIF.w, H = SGIF.h, sc = Math.max(VW / W, 1), pw = W * sc, ph = H * sc, fi = Math.floor(Math.max(0, r) * 1000 / SGIF.ms) % SGIF.n, jx = Math.round((c6H(Math.floor(m * 40), 5) - 0.5) * 2), jy = Math.round((c6H(Math.floor(m * 40), 6) - 0.5) * 2);
  ctx.fillStyle = '#000'; ctx.fillRect(0, 0, VW, VH); ctx.imageSmoothingEnabled = false;
  if (SGIF_IMG.complete && SGIF_IMG.naturalWidth) { const pan = ease3(clamp01(r / 3.6)) * 0.74, oy = -pan * Math.max(0, ph - VH) + jy; ctx.drawImage(SGIF_IMG, fi * W, 0, W, H, Math.round((VW - pw) / 2) + jx, Math.round(oy), Math.round(pw), Math.round(ph)); }
  const g = ctx.createRadialGradient(VW / 2, VH * 0.45, VH * 0.3, VW / 2, VH * 0.45, Math.hypot(VW, VH) * 0.6); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(0,0,0,0.62)'); ctx.fillStyle = g; ctx.fillRect(0, 0, VW, VH);
  ctx.fillStyle = 'rgba(255,255,255,0.06)'; for (let i = 0; i < 40; i++) ctx.fillRect((c4R(i + Math.floor(m * 24) * 7, 8) * VW) | 0, (c4R(i + Math.floor(m * 24) * 7, 9) * VH) | 0, 1, 1);      // (grain)
  const bandY = VH - 34; ctx.fillStyle = 'rgba(0,0,0,' + (0.55 * clamp01((r - C11R.word1 + 0.2) / 0.4)).toFixed(2) + ')'; ctx.fillRect(0, bandY, VW, 34);
  const w1 = 'DOMAIN EXPANSION', w2 = 'MALEVOLENT SHRINE', n1 = Math.max(0, Math.min(w1.length, Math.floor((r - C11R.word1) * 22))), n2 = Math.max(0, Math.min(w2.length, Math.floor((r - C11R.word2) * 22)));
  if (n1) pxt(w1.slice(0, n1), VW / 2, VH - 18, '#ffffff', 16, 'center'); if (n2) pxt(w2.slice(0, n2), VW / 2, VH - 6, '#ff4a5a', 8, 'center');
  if (r < 0.5) c6White(0.9 * (1 - r / 0.5)); if (r >= 3.5 && r < 4.3) c6White(0.7 * clamp01((r - 3.5) / 0.8) * 0 + 0.5 * Math.sin(Math.PI * clamp01((r - 3.5) / 0.8)) * 0.4);
}
function c11Aura(m, S) {      // the cursed energy that streams in to his hands while the sign is held: red and white specks that spiral inward, a red glow on the fingertips
  const r = m - C11K.kick - 3.4; if (r < 0 || r > 2.4 || !S) return; const k = clamp01(r / 0.8), hp = c10Hp(S, [10, -14]); ctx.save(); ctx.globalCompositeOperation = 'lighter';
  for (let i = 0; i < 60; i++) { const ph = (r * 0.9 + c4R(i, 11)) % 1, an = c4R(i, 12) * 6.283 + ph * 5, rad = (46 + 40 * c4R(i, 13)) * (1 - ph) + 3; ctx.globalAlpha = Math.sin(Math.PI * ph) * 0.9 * k; ctx.fillStyle = i % 4 === 0 ? '#ffffff' : i % 4 === 1 ? '#ff2a3a' : '#ff6a7a'; ctx.fillRect(Math.round(hp[0] + Math.cos(an) * rad), Math.round(hp[1] + Math.sin(an) * rad * 0.8), 1 + (i & 1), 1 + (i & 1)); }
  ctx.restore(); c6Glow(hp[0], hp[1] - 4, 14 + 10 * k, '255,40,60', 0.55 * k);
}
function c11DomBg() { const key = VW + 'x' + VH + 'x' + gy; if (!suDomBg || suDomKey !== key) { suDomBgBuild(); suDomKey = key; } return suDomBg; }      // (the domain's own picture of the whole screen, made by Sukuna's code)
function c11Shrine(r) {      // the shrine rising out of the floor behind everything (the pictures of his domain in the game)
  if (!suShrSheet) return; const L = suShrLod(VH + 6), baseY = VH - SU_DOM.foot, X = Math.round(VW / 2 - L.w / 2), e = 1 - Math.pow(1 - clamp01(r / 1.7), 3), top = baseY - L.h + Math.round((1 - e) * (L.h + 8));
  ctx.save(); ctx.beginPath(); ctx.rect(0, 0, VW, baseY); ctx.clip(); const gyy = top + L.h * 0.55, gr = ctx.createRadialGradient(VW / 2, gyy, 6, VW / 2, gyy, L.h * 0.8); gr.addColorStop(0, 'rgba(210,24,48,' + (0.32 * e).toFixed(3) + ')'); gr.addColorStop(1, 'rgba(210,24,48,0)');
  ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = gr; ctx.fillRect(VW / 2 - L.h, gyy - L.h, L.h * 2, L.h * 2); ctx.globalCompositeOperation = 'source-over'; ctx.drawImage(L.cv, X, top); ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = (0.1 + 0.08 * Math.sin(r * 4)) * e; ctx.drawImage(L.glow, X, top); ctx.restore();
}
function c11Domain(m, cam, S) {      // the domain spreads from Sukuna: a hard-edged circle of its blood-red picture grows out of him (0.8 s), with a glowing rippling edge, and covers the screen; then the shrine rises
  const r = m - C11K.kick - 9.9, p = S ? c10Scr(cam, S.x, S.y) : [VW / 2, VH / 2], full = Math.hypot(Math.max(p[0], VW - p[0]), Math.max(p[1], VH - p[1])) + 12, R = full * c10out(clamp01(r / 0.8)); if (r < 0) return;
  const bg = c11DomBg(); ctx.save(); ctx.beginPath(); ctx.arc(p[0], p[1], Math.max(1, R), 0, 6.2832); ctx.clip(); ctx.imageSmoothingEnabled = false; ctx.drawImage(bg, -8, -8); c11Shrine(r - 0.3); ctx.restore();
  if (R < full) { for (let i = 0; i < 160; i++) { const th = i / 160 * 6.2832, rr = R + Math.sin(th * 7 + m * 11) * 2; ctx.fillStyle = i % 3 ? '#ff5a6a' : '#ffd0d6'; ctx.fillRect(Math.round(p[0] + Math.cos(th) * rr), Math.round(p[1] + Math.sin(th) * rr), 2, 2); } }
  if (r < 0.25) c6White(0.8 * (1 - r / 0.25));
}
function c11MPx(i) {      // the pixels of Mahoraga's picture i (lit), once: x, y, colour
  if (C11.px && C11.px.i === i) return C11.px; const img = m7Lit(i, 'cold'); if (!img) return null; const d = img.getContext('2d').getImageData(0, 0, img.width, img.height).data, xs = [], ys = [], cs = [];
  for (let y = 0; y < img.height; y++) for (let x = 0; x < img.width; x++) { const a = (y * img.width + x) * 4; if (d[a + 3] > 200) { xs.push(x); ys.push(y); cs.push([d[a], d[a + 1], d[a + 2]]); } } return C11.px = { i, xs, ys, cs };
}
function c11Blood(m) {      // Mahoraga hangs in the domain, the red wave goes through him from the left, and he comes apart pixel by pixel into blood that a strong wind blows away to the right (v1.139)
  const r = m - C11K.kick - 12.2, bg = c11DomBg(), i = c10mf('idle', Math.floor((m + C9.m0) * 8) % 12), P = M7.frames[i], sc = 0.8, X = Math.round(VW * 0.62), fl = gy + 2, Y = fl - (P.footN[1] + 7 - P.pelvis[1]) * sc, t0 = 0.5, tw = 1.0;      // (he stands on the floor of the domain)
  ctx.imageSmoothingEnabled = false; ctx.drawImage(bg, -8, -8); c11Shrine(10);
  const wx = X + (P.head[0] - P.pelvis[0]) * sc + 4 * sc, wy = Y + (P.head[1] - P.pelvis[1]) * sc - 6 * sc, wa = 1 - clamp01((r - t0 - 0.2) / 0.8);
  if (wa > 0.01) { ctx.save(); ctx.globalAlpha = wa; c6Glow(wx, wy, 60 * sc, '255,200,100', 0.25 * wa); m7Wheel(wx, wy, 27 * sc, c8Ang(m + C9.m0), 1); ctx.restore(); }
  const px = c11MPx(i); if (!px) return; const n = px.xs.length;
  for (let k = 0; k < n; k++) {
    const x = X + (px.xs[k] - P.pelvis[0]) * sc, y = Y + (px.ys[k] - P.pelvis[1]) * sc, dl = t0 + tw * (0.65 * (1 - px.xs[k] / 168) + 0.35 * c4R(k, 7)), a = r - dl;
    if (a < 0) { const q = clamp01(r / dl); const c = px.cs[k], f = q * q * q; ctx.fillStyle = 'rgb(' + Math.round(c[0] + (200 - c[0]) * f) + ',' + Math.round(c[1] * (1 - 0.85 * f)) + ',' + Math.round(c[2] * (1 - 0.85 * f)) + ')'; ctx.fillRect(Math.round(x), Math.round(y), 1, 1); continue; }
    const wd = 150 + 330 * c4R(k, 8), px2 = x + wd * a * (1 + 1.6 * a), py = y + (c4R(k, 9) - 0.6) * 38 * a + 22 * a * a, ln = Math.min(10, 1 + Math.floor(wd * a * 0.04));      // (v1.139 a strong wind takes it: it streaks away to the right, faster and faster, and is gone off the screen)
    if (px2 - ln > VW + 4) continue; ctx.fillStyle = k % 4 === 0 ? '#ff2a3a' : k % 4 === 1 ? '#e0192b' : '#b3121f'; ctx.globalAlpha = 0.95; ctx.fillRect(Math.round(px2 - ln), Math.round(py), ln, 1 + (k & 1)); ctx.globalAlpha = 1;
  }
  { const wk = clamp01((r - 0.6) / 0.3) * (1 - clamp01((r - 2.6) / 0.7)); if (wk > 0.01) c10Wind(m, 900, 0, wk, 41); }      // (and streaks of wind across the picture)
}
