// ================================================================ v1.140 THE QUICK TIME EVENTS OF THE AIR FIGHT
// Every blow Mahoraga throws in the fight (the second half, bars 22 - 57 of the first song) shows a ring that closes on Sukuna: TAP as it closes and he dodges (or blocks, or meets the fist). Miss, and the story BRANCHES a little: the blow lands,
// Sukuna is thrown back, he cannot attack for a few seconds (his next blows are cancelled) and Mahoraga follows up with another blow (with a prompt of its own) - then it goes back to the normal story. After MORE THAN 3 misses Mahoraga attacks
// again and again: a flurry of blows on every beat (5 at the 4th miss, 2 more with every miss after it), each with a prompt. At the end of the fight (just before the last kick) the taps that hit are counted: under 75% and Sukuna is overwhelmed: the
// scene starts again from the beginning of the air fight; at 75% or more it goes on as before (the kick, the silence, the domain).
// Like everything in chapter 3 the picture is a function of the scene time, now also of the OUTCOMES so far (C13Q.res: prompt id -> 'perfect' / 'good' / 'miss' / 'skip'): c11Eff() makes the list of blows from the script (C11EV) and the outcomes
// and c11Build() (tools/chap3d.js) turns it into the windows of the two fighters; every new outcome rebuilds them (C13Q.ver). An unanswered prompt (or one skipped with the SKIP button or a test jump) leaves the script as v1.136 made it.

const C13 = { lead: 0.4, win: [-0.18, 0.14], early: 0.35, perfect: 0.06, need: 0.75, upper: 3.6, mashN: 5, mvs: ['hookN', 'hookF', 'hookN', 'kick', 'hookF', 'punch'] };      // a tap or a release from win[0] to win[1] s round the moment the ring closes counts (perfect: within `perfect`); a tap a little early is a miss; 75% needed; after a miss Sukuna cannot attack for `upper` s; a clash needs `mashN` taps
const C13P = { tap: { lead: 0.40, vis: 0.90, dl: 0.14 }, hold: { lead: 0.40, vis: 0.65, dl: 0.14 }, mash: { lead: 0.30, vis: 0.90, dl: 0 }, swipe: { lead: 0.30, vis: 0.80, dl: 0.25 } };      // per kind of prompt: how long before the blow the ring closes, how long it shows before that, how long after that it can still be answered
const c13Tc = e => e.t - C13P[e.pt].lead, c13Dl = e => c13Tc(e) + C13P[e.pt].dl, c13Vis = e => c13Tc(e) - C13P[e.pt].vis;
const c13New = () => ({ res: {}, shown: {}, rt: {}, early: {}, why: {}, mash: {}, hold: null, sw: null, ver: 0, evald: false, def: null, pass: null, intro: null, introDone: false });      // the outcomes so far, which prompts were seen, when each was decided (song time), which were too early, a counter that changes with every outcome, the verdict, the how-to-play card
let C13Q = c13New();
const c13Off = () => !!window.__noQte;      // (test pages only: no prompts, taps skip the cuts as before)
function c13Reset() { C13Q = c13New(); C11.b = null; }

// ---- the list of blows: the script and the outcomes. Every blow has a prompt except the last (the kick that ends the song) and the ones marked np:
// Mahoraga's blow: TAP (a hit is a dodge); a clash: MASH; Sukuna's blow: HOLD and release (a miss: Mahoraga blocks and gets the upper hand); a SWIPE marker (a: 'W') in a set piece. A miss: the blow lands or is blocked, Sukuna cannot attack for a few
// seconds, Mahoraga follows up with one blow of his own (with a prompt); from the 4th miss a flurry of blows on every beat (5, and 2 more with every miss after that)
function c11Eff() {
  const R = C13Q.res, ok = id => R[id] === 'perfect' || R[id] === 'good', bad = id => R[id] === 'miss', base = C11EV.map((e, i) => ({ ...e, id: e.id || 'b' + i })), out = [], beat = C9.beat, wins = [], lim = C11K.kick - 1.7;
  const after = t => C9.first + Math.ceil((t - C9.first) / beat - 1e-9) * beat, inW = t => wins.some(w => t > w[0] && t < w[1] + 1.0);
  let misses = R.p0 === 'miss' ? 1 : 0, cancel = -1e9, nx = 0, nf = 0;      // (a miss at the first punch counts too)
  const place = e => {
    const pt = e.pt || (e.a === 'W' ? 'swipe' : e.a === 'S' ? 'hold' : e.re === 'clash' ? 'mash' : 'tap'), lab = pt === 'hold' ? 'HOLD' : pt === 'mash' ? 'MASH' : pt === 'swipe' ? 'SWIPE' : e.re === 'block' ? 'BLOCK' : 'DODGE', p = { ...e, pr: true, pt, lab };
    if (bad(e.id)) {
      if (pt === 'hold') return { ...p, re: 'block', kb: 16, imp: 0, sh: 1, blood: 0 };      // (Mahoraga blocks his blow)
      if (pt === 'swipe') return p;
      return { ...p, re: 'hit', kb: Math.max(e.kb || 0, e.fl ? 45 : 60), imp: Math.max(e.imp || 0, e.fl ? 0 : 1), sh: Math.max(e.sh || 0, e.fl ? 3 : 4), blood: 1, with: null };      // (the blow lands)
    }
    if (ok(e.id) && pt === 'tap' && e.re === 'hit') return { ...p, re: 'dodge', kb: undefined, imp: 0, sh: 0, blood: 0 };      // (a hit of the script is dodged)
    return p;
  };
  const flurry = e => {      // more than 3 misses: he attacks again and again, on every beat, and more of them every time
    const n = Math.min(15, 5 + 2 * (misses - 4)), t0 = after(e.t + 1.6); let t1 = e.t;
    for (let j = 0; j < n; j++) { const t = t0 + j * beat; if (t > lim) break; const b = { t, a: 'M', mv: C13.mvs[nf++ % C13.mvs.length], re: 'dodge', id: 'f' + e.id + '.' + j, fl: true }; out.push(place(b)); t1 = t; if (bad(b.id)) misses++; }
    wins.push([e.t, t1]);
  };
  for (const e of base) {
    if (inW(e.t) || ((e.a === 'S' || e.a === 'W') && e.t < cancel)) continue;      // (replaced by a flurry; or Sukuna is still on the floor)
    if (e.last || e.np) { out.push(e); continue; }
    out.push(place(e)); if (!bad(e.id)) continue;
    misses++; if (e.a === 'W') { if (misses > 3) flurry(e); continue; }      // (a swipe that is missed only counts: the wall breaks the ragged way, in tools/chap3g.js)
    const mine = e.a === 'M'; cancel = Math.max(cancel, e.t + (mine ? C13.upper : 2.2));
    if (misses > 3) flurry(e);
    else if (!base.some(x => x.a === 'M' && !x.last && x.t > e.t + (mine ? 0.6 : 0.4) && x.t < e.t + (mine ? 2.4 : 2.2))) {      // a miss: he follows up with one more blow (a miss on that one is a miss too, and the fourth miss brings the flurry)
      const t = after(e.t + (mine ? 1.0 : 0.9)), b = { t, a: 'M', mv: nx++ % 2 ? 'hookF' : 'hookN', re: 'dodge', id: 'x' + e.id }; out.push(place(b));
      if (bad(b.id)) { misses++; cancel = Math.max(cancel, t + 2.0); if (misses > 3) flurry(b); }
    }
  }
  const res = out.filter(e => e.fl || e.last || !inW(e.t)); res.sort((a, b) => a.t - b.t); return res;
}
const c13List = B => [{ id: 'p0', t: C10K.dash - 0.15 + C13P.tap.lead, pr: true, pt: 'tap', lab: 'DODGE' }].concat(B.EV.filter(e => e.pr), (B.WL || []).filter(e => e.pr));      // (the first punch of the fight, in bullet time (tools/chap3c.js), and then every blow of the second half)
function c13T0() {      // when the fist of the first punch is at Sukuna: the nearest it gets to him while he hangs where he dashed from
  if (C13.t0 && C13.key === VW + 'x' + gy) return C13.t0; const K = C10K, f = c8Fly(K.dash + C9.m0), B0 = { x: f.x + 1.2 * Math.sin(K.dash * 1.9), y: f.y + 2.4 * Math.sin(K.dash * 2.7) }; let best = 1e9, bt = K.dash + 0.5;
  for (let m = K.dash; m < K.cut; m += 0.01) { const M = c10Mah(m), a = M ? c10An(M, 'fist') : null; if (!a) continue; const d = Math.hypot(a[0] - B0.x, a[1] - B0.y); if (d < best) { best = d; bt = m; } }
  C13.key = VW + 'x' + gy; return C13.t0 = bt;
}
function c13P0(S, m) {      // the first punch was not dodged: he hangs where he was, the fist hits him and throws him back, he tumbles and finds his balance; then it is the story again (the cut, the kick)
  const K = C10K; if (!S || C13Q.res.p0 !== 'miss' || m < K.dash + 0.1 || m > K.cut + 0.35) return S;
  const t0 = c13T0(), u = m - t0, k = 1 - Math.exp(-Math.max(0, u) / 0.1), dec = Math.exp(-Math.max(0, u) / 0.4), f = c8Fly(K.dash + C9.m0), B0 = { x: f.x + 1.2 * Math.sin(K.dash * 1.9), y: f.y + 2.4 * Math.sin(K.dash * 2.7) }, D = CU_GAME[3];
  const kx = -75 * k * dec, ky = -18 * k * dec, kr = -0.9 * k * dec, bl = clamp01((m - (K.cut - 0.3)) / 0.25), fade = clamp01(1 - (m - K.cut) / 0.35), o = { ...S };
  o.x = B0.x + kx * fade + (S.x - B0.x) * bl; o.y = B0.y + ky * fade + (S.y - B0.y) * bl; o.rot = kr * fade + (S.rot || 0) * bl;
  if (bl < 0.5) {      // (hanging, hit, tumbling, hanging again: his own pictures; the scripted dodge comes back as he recovers)
    o.mode = 'hit'; const fi = u < 0 ? -1 : u < 0.1 ? 1 : u < 0.25 ? 2 : u < 0.5 ? 3 : -1, h = Math.floor(m * 7) & 3;
    if (fi < 0) { o.pic = D.air[h]; o.pv = C10PV; o.ei = h; o.eye = null; } else { o.pic = c8SukPic(fi); o.pv = [33, 34]; o.ei = null; o.eye = [3, -17]; } o.back = null;
  }
  return o;
}
function c13Score() { let hits = 0, n = 0; for (const id in C13Q.res) { const r = C13Q.res[id]; if (r === 'miss') n++; else if (r === 'perfect' || r === 'good') { n++; hits++; } } return { hits, n, pct: n ? hits / n : 1 }; }
function c13Resolve(id, r, m, why) { const Q = C13Q; Q.res[id] = r; Q.rt[id] = m; if (why) Q.why[id] = why; if (r !== 'skip') { Q.ver++; C11.b = null; } }      // (a new outcome changes the future of the fight: the windows are built again)
const c13Zone = m => (m >= C11K.air2 - 1.2 && m <= C11K.kick + 0.3) || (m >= C10K.dash - 1.6 && m <= C10K.dash + 1.4);      // (the fight: the first punch and then bars 21 - 58; in between the taps skip the cuts as before)
const c13Intro0 = () => C10K.dash - 1.7;      // (the how-to-play card comes just before the first ring)

// ---- every frame (c7Frame): the how-to-play card, the prompts that were seen and not answered in time are misses, at the end of the fight the verdict
function c13Step(now, T) {
  const Q = C13Q; if (c13Off() || !story || !story.c7) return; const m = T - c9Start();
  if (Q.def) { story.t0 = now - Q.def.T * 1000; return; }      // (defeated: the picture stands still on the last moment)
  if (Q.intro) { story.t0 = now - Q.intro.T * 1000; return; }      // (the how-to-play card stands on the picture until a tap)
  if (!Q.introDone && m >= c13Intro0() && m <= C11K.kick) { Q.intro = { T, at: now }; return; }      // (also if a skip jumped past the first ring: it comes at the first frame of the fight)
  if (!c13Zone(m)) return; const B = c11Build(); if (!B) return;
  for (const e of c13List(B)) {
    if (!e.pr || Q.res[e.id] !== undefined) continue; const dl = c13Dl(e);
    if (m >= c13Vis(e) + 0.2 && m < dl) Q.shown[e.id] = true;
    if (m >= dl) {
      const seen = Q.shown[e.id]; let why = null; if (e.pt === 'hold' && Q.hold && Q.hold.id === e.id) { why = 'TOO LATE'; Q.hold = null; } else if (e.pt === 'hold' && seen) why = 'NO HOLD'; else if (e.pt === 'mash') why = 'TOO SLOW';
      c13Resolve(e.id, seen ? 'miss' : 'skip', m, why); if (seen) { snd('c7thud', 1); break; }
    }
  }
  if (m >= C11K.kick - 0.5 && !Q.evald) { Q.evald = true; const s = c13Score(); if (s.n > 0 && s.pct < C13.need) { Q.def = { T, at: now, s }; Q.hold = Q.sw = null; snd('c7smash'); snd('c7wheel', 1); } else Q.pass = s; }
}
function c13InSkip(ev) { try { const r = cv.getBoundingClientRect(), x = (ev.clientX - r.left) / r.width * VW, y = (ev.clientY - r.top) / r.height * VH; return x > VW - 48 && y < 18; } catch (e) { return false; } }      // (the SKIP button in the corner)
function c13Restart() { if (story && story.c7) { story.t0 = pnow() - (c8R() + C8T.hit) * 1000; story.ev = {}; } c13Reset(); }      // (the air fight again from the beginning: the shot after the uppercut; the how-to-play card comes again)
function c13Tap(ev) {      // a finger goes down: true = the quick time events used it (otherwise it skips the cut as before)
  const Q = C13Q; if (c13Off() || !story || !story.c7) return false; const now = pnow(), T = Math.max(0, now - story.t0) / 1000, m = T - c9Start();
  if (Q.intro) { if (now - Q.intro.at > 1800) { story.t0 = now - Q.intro.T * 1000; Q.intro = null; Q.introDone = true; } return true; }
  if (Q.def) { if (now - Q.def.at > 900) c13Restart(); return true; }
  if (!c13Zone(m) || m > C11K.kick + 0.1) return false; if (ev && c13InSkip(ev)) return false;
  const B = c11Build(); if (!B) return true; const L = c13List(B).filter(e => e.pr && Q.res[e.id] === undefined);
  for (const e of L) if (e.pt === 'mash' && m >= c13Vis(e) && m < c13Tc(e)) { const n = (Q.mash[e.id] = (Q.mash[e.id] || 0) + 1); if (n >= C13.mashN) { c13Resolve(e.id, 'perfect', m); snd('dash', 1); } else snd('c7beat', 1); return true; }
  for (const e of L) if (e.pt === 'hold') { if (m >= c13Vis(e) && m < c13Tc(e) - 0.2) { Q.hold = { id: e.id, m }; return true; } if (m >= c13Tc(e) - 0.2 && m <= c13Dl(e)) { c13Resolve(e.id, 'miss', m, 'TOO LATE'); snd('c7thud', 1); return true; } }
  for (const e of L) if (e.pt === 'swipe' && m >= c13Vis(e) && m < c13Dl(e)) { Q.sw = { id: e.id, m, x: ev ? ev.clientX : 0, y: ev ? ev.clientY : 0 }; return true; }
  let hit = null, early = null;
  for (const e of L) { if (e.pt !== 'tap') continue; const u = m - c13Tc(e); if (u >= C13.win[0] && u <= C13.win[1]) { hit = e; break; } if (u >= -C13.early && u < C13.win[0] && !early) early = e; }
  if (hit) { const u = m - c13Tc(hit); c13Resolve(hit.id, Math.abs(u) <= C13.perfect ? 'perfect' : 'good', m); snd('dash', 1); }
  else if (early) { Q.early[early.id] = true; c13Resolve(early.id, 'miss', m, 'TOO EARLY'); snd('c7thud', 1); }
  return true;
}
function c13Up(ev) {      // the finger comes up: a HOLD is let go (on the ring: it counts), a SWIPE is judged by where the finger went
  const Q = C13Q; if (c13Off() || !story || !story.c7 || (!Q.hold && !Q.sw)) return; const m = Math.max(0, pnow() - story.t0) / 1000 - c9Start(), B = c11Build(); if (!B) return; const L = c13List(B);
  if (Q.hold) { const h = Q.hold, e = L.find(x => x.id === h.id); Q.hold = null; if (e && Q.res[e.id] === undefined) { const u = m - c13Tc(e); if (u >= C13.win[0] && u <= C13.win[1]) { c13Resolve(e.id, Math.abs(u) <= C13.perfect ? 'perfect' : 'good', m); snd('dash', 0); } else { c13Resolve(e.id, 'miss', m, u < C13.win[0] ? 'TOO EARLY' : 'TOO LATE'); snd('c7thud', 1); } } }
  if (Q.sw) { const s = Q.sw, e = L.find(x => x.id === s.id); Q.sw = null; if (e && Q.res[e.id] === undefined) { const dx = (ev ? ev.clientX : 0) - s.x, dy = (ev ? ev.clientY : 0) - s.y, dir = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'R' : 'L') : (dy > 0 ? 'D' : 'U'), good = Math.hypot(dx, dy) >= 30 && dir === e.dir && m >= c13Tc(e) - 0.25 && m <= c13Dl(e); c13Resolve(e.id, good ? 'good' : 'miss', m, good ? null : Math.hypot(dx, dy) < 30 ? 'TOO SHORT' : dir !== e.dir ? 'WRONG WAY' : 'TOO EARLY'); snd(good ? 'dash' : 'c7thud', good ? 0 : 1); } }
}

// ---- the picture: the ring that closes on Sukuna (white = TAP, orange = HOLD, blue = SWIPE, a bar = MASH), what was made of the finger, the counter, the SKIP button, the how-to-play card, the verdict
function c13Arrow(px, py, dir, r, col) { const v = { U: [0, -1], D: [0, 1], L: [-1, 0], R: [1, 0] }[dir] || [0, -1], nx = -v[1], ny = v[0]; ctx.strokeStyle = col; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(px - v[0] * r, py - v[1] * r); ctx.lineTo(px + v[0] * r, py + v[1] * r); ctx.moveTo(px + v[0] * r, py + v[1] * r); ctx.lineTo(px + v[0] * r * 0.3 + nx * r * 0.7, py + v[1] * r * 0.3 + ny * r * 0.7); ctx.moveTo(px + v[0] * r, py + v[1] * r); ctx.lineTo(px + v[0] * r * 0.3 - nx * r * 0.7, py + v[1] * r * 0.3 - ny * r * 0.7); ctx.stroke(); }
function c13Ring(px, py, rad, col, gold, core, txt, lab) {
  ctx.lineWidth = 2; ctx.strokeStyle = 'rgba(255,255,255,0.3)'; ctx.beginPath(); ctx.arc(px, py, 11, 0, 6.2832); ctx.stroke();
  ctx.strokeStyle = gold ? '#ffe08a' : col; ctx.beginPath(); ctx.arc(px, py, Math.max(rad, 11), 0, 6.2832); ctx.stroke(); ctx.fillStyle = core; ctx.beginPath(); ctx.arc(px, py, 9, 0, 6.2832); ctx.fill();
  if (txt) pxt(txt, px, py + 3, '#ffffff', 8, 'center'); if (lab) pxt(lab, px, py + 25, '#ffd36a', 8, 'center');
}
function c13Intro() {      // the card that says how to play: a looping demo of a TAP and of a HOLD, and the rules (the letters are 8 px wide: a line from x = 52 has 30 letters at most)
  const Q = C13Q, t = (pnow() - Q.intro.at) / 1000, a = Math.min(1, t / 0.4); ctx.save(); ctx.imageSmoothingEnabled = false; ctx.globalAlpha = a; ctx.fillStyle = 'rgba(3,3,12,0.92)'; ctx.fillRect(0, 0, VW, VH); ctx.strokeStyle = '#ffd36a'; ctx.lineWidth = 1; ctx.strokeRect(2.5, 2.5, VW - 5, VH - 5);
  pxt('HOW TO PLAY', VW / 2, 14, '#ffd36a', 8, 'center');
  const p = (t % 1.8) / 1.8, rad = 11 + 10 * (1 - Math.min(1, p / 0.8)), fl = p > 0.8; c13Ring(26, 34, rad, '#ffffff', fl, '#c4121c', 'TAP');
  pxt('TAP WHEN THE CIRCLE REACHES', 52, 30, '#ffffff', 8, 'left'); pxt('THE MIDDLE CIRCLE: DODGE', 52, 40, '#8dff9a', 8, 'left');
  const h = (t % 2.4) / 2.4, down = h > 0.08, rh = 11 + 10 * (1 - clamp01((h - 0.08) / 0.72)), rel = h > 0.8; c13Ring(26, 76, rh, '#ff9a3a', rel, down && !rel ? '#27c75a' : '#d4570f', 'HOLD');
  if (down && !rel) { ctx.fillStyle = 'rgba(255,255,255,0.25)'; ctx.fillRect(8, 94, 36, 3); ctx.fillStyle = '#27c75a'; ctx.fillRect(8, 94, 36 * clamp01((h - 0.08) / 0.72), 3); }
  pxt('HOLD WHEN SUKUNA ATTACKS:', 52, 62, '#ffffff', 8, 'left'); pxt('PRESS WHEN THE RING SHOWS,', 52, 72, '#ffffff', 8, 'left'); pxt('LET GO WHEN IT REACHES THE', 52, 82, '#ffffff', 8, 'left'); pxt('MIDDLE CIRCLE', 52, 92, '#8dff9a', 8, 'left');
  pxt('CLASH: MASH TAPS  THROW: SWIPE', VW / 2, 106, '#9fd4ff', 8, 'center'); pxt('MISS: MAHORAGA GETS THE UPPER HAND', VW / 2, 116, '#ff8a8a', 8, 'center'); pxt('75% HIT OR SUKUNA FALLS', VW / 2, 126, '#ffd36a', 8, 'center');
  if (t > 1.8) { ctx.globalAlpha = 0.5 + 0.5 * Math.sin(t * 6); pxt('TAP TO START', VW / 2, 135, '#ffffff', 8, 'center'); } ctx.restore();
}
function c13Draw(m, cam, S) {      // in the picture (the cinema bars come over it): the rings, what was made of the finger, the first punch landing
  const Q = C13Q; if (c13Off() || Q.intro) return; if (!(c13Zone(m) || (m >= C11K.air2 - 2 && m <= C11K.kick + 2.2) || (m >= C10K.dash - 1.6 && m <= C10K.dash + 2.2))) return; const B = c11Build(); if (!B) return;
  const sp = S ? c10Scr(cam, S.x, S.y - 26) : [VW / 2, VH / 2], px = Math.max(58, Math.min(VW - 58, sp[0])), py = Math.max(36, Math.min(VH - 40, sp[1]));      // (the labels are up to 14 letters of 8 px)
  ctx.save(); ctx.imageSmoothingEnabled = false; ctx.lineWidth = 2;
  for (const e of c13List(B)) {
    if (!e.pr) continue; const Tc = c13Tc(e), u = m - Tc, r = Q.res[e.id], P = C13P[e.pt];
    if (r === undefined && u > -P.vis && u < P.dl + 0.25 && !Q.def) {
      const rad = 11 + 26 * Math.pow(clamp01(-u / P.vis), 1.2), gold = Math.abs(u) <= C13.perfect + 0.02;
      if (e.pt === 'tap') c13Ring(px, py, rad, '#ffffff', gold, '#c4121c', 'TAP', e.lab);
      else if (e.pt === 'hold') { const hd = Q.hold && Q.hold.id === e.id; c13Ring(px, py, rad, '#ff9a3a', gold, hd ? '#27c75a' : '#d4570f', hd && u > -0.3 ? 'GO!' : 'HOLD', hd ? (u > -0.3 ? 'RELEASE!' : 'KEEP HOLDING') : 'PRESS AND HOLD'); if (hd) { ctx.fillStyle = 'rgba(255,255,255,0.25)'; ctx.fillRect(px - 20, py + 30, 40, 3); ctx.fillStyle = '#27c75a'; ctx.fillRect(px - 20, py + 30, 40 * clamp01((m - Q.hold.m) / Math.max(0.05, Tc - Q.hold.m)), 3); } }
      else if (e.pt === 'swipe') { c13Ring(px, py, rad, '#7fd4ff', gold, '#1c5a8a', null, 'SWIPE'); c13Arrow(px, py, e.dir, 6, '#ffffff'); }
      else { const n = Q.mash[e.id] || 0; pxt('MASH!', px, py - 6 + 2 * Math.sin(m * 40), '#ffd36a', 10, 'center'); ctx.fillStyle = 'rgba(255,255,255,0.25)'; ctx.fillRect(px - 30, py, 60, 6); ctx.fillStyle = '#ff6a3a'; ctx.fillRect(px - 30, py, 60 * clamp01(n / C13.mashN), 6); ctx.fillStyle = '#ffffff'; ctx.fillRect(px - 30, py + 8, 60 * clamp01(-u / P.vis), 2); }
    } else if (r !== undefined && r !== 'skip') {
      const t = m - Q.rt[e.id]; if (t < 0 || t > 0.8) continue; ctx.globalAlpha = 1 - t / 0.8; const txt = r === 'perfect' ? (e.pt === 'mash' ? 'CLASH WON' : 'PERFECT') : r === 'good' ? 'GOOD' : (Q.why[e.id] || 'MISS');
      pxt(txt, px, py - 22 - t * 12, r === 'miss' ? '#ff3347' : r === 'perfect' ? '#ffe08a' : '#ffffff', 10, 'center'); ctx.globalAlpha = 1;
      if (r === 'miss' && t < 0.4) { ctx.fillStyle = 'rgba(255,0,20,' + (0.3 * (1 - t / 0.4)).toFixed(3) + ')'; ctx.fillRect(0, 0, VW, VH); }
    }
  }
  if (Q.res.p0 === 'miss' && m >= c13T0() && m < c13T0() + 0.7 && S) { const a = m - c13T0(), q = c10Scr(cam, S.x, S.y); c3Ring(q[0], q[1], a, true, '255,235,200', 0.8); c4Spray(m, c13T0(), q[0], q[1], 9, { v: 90, up: 1, dir: 0, life: 0.7, cols: C4_BLOOD, sz: 1, seed: 5, g: 160, gnd: 1e9 }); c6White(0.4 * Math.exp(-a * 9)); }      // (the punch lands on him)
  ctx.restore();
}
function c13Top(m) {      // over everything, the cinema bars too: the how-to-play card, the counter and the SKIP button (in the top bar), the verdict, the defeat
  const Q = C13Q; if (c13Off()) return; if (Q.intro) { c13Intro(); return; } const sc = c13Score(); ctx.save(); ctx.imageSmoothingEnabled = false; ctx.lineWidth = 2;
  if (c13Zone(m) && m < C11K.kick + 0.3 && !Q.def) { pxt('SCORE ' + sc.hits + '/' + sc.n + '  ' + Math.round(sc.pct * 100) + '%', 4, 11, sc.pct >= C13.need ? '#8dff9a' : '#ff6a7a', 8, 'left'); ctx.strokeStyle = 'rgba(255,255,255,0.7)'; ctx.lineWidth = 1; ctx.strokeRect(VW - 39.5, 2.5, 36, 10); pxt('SKIP', VW - 21, 11, '#ffffff', 8, 'center'); }
  if (Q.pass && m > C11K.kick - 0.4 && m < C11K.kick + 2.0) pxt('SCORE ' + Q.pass.hits + '/' + Q.pass.n + '  ' + Math.round(Q.pass.pct * 100) + '%', VW / 2, 32, '#8dff9a', 10, 'center');
  if (Q.def) {
    const a = Math.min(1, (pnow() - Q.def.at) / 600); ctx.fillStyle = 'rgba(50,0,10,' + (0.78 * a).toFixed(3) + ')'; ctx.fillRect(0, 0, VW, VH); ctx.globalAlpha = a;
    pxt('DEFEATED', VW / 2, 52, '#ff3347', 20, 'center'); pxt('SUKUNA WAS OVERWHELMED', VW / 2, 70, '#ffffff', 8, 'center'); pxt(Q.def.s.hits + '/' + Q.def.s.n + ' HIT = ' + Math.round(Q.def.s.pct * 100) + '%   75% NEEDED', VW / 2, 86, '#ffd36a', 8, 'center');
    if (pnow() - Q.def.at > 900) { ctx.globalAlpha = 0.5 + 0.5 * Math.sin(pnow() / 200); pxt('TAP TO TRY AGAIN', VW / 2, 112, '#ffffff', 8, 'center'); } ctx.globalAlpha = 1;
  }
  ctx.restore();
}
window.__c13 = () => ({ res: { ...C13Q.res }, ...c13Score(), def: !!C13Q.def, pass: !!C13Q.pass, intro: !!C13Q.intro, ver: C13Q.ver, early: { ...C13Q.early }, why: { ...C13Q.why }, mash: { ...C13Q.mash } });      // test hooks
window.__c13Press = () => c13Tap(null); window.__c13Down = (x, y) => c13Tap({ clientX: x == null ? 450 : x, clientY: y == null ? 210 : y }); window.__c13Up = (x, y) => c13Up({ clientX: x == null ? 450 : x, clientY: y == null ? 210 : y }); window.__c13Reset = () => { c13Reset(); }; window.__c13Done = () => { C13Q.intro = null; C13Q.introDone = true; };
