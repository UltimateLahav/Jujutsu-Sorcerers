// ================================================================ v1.140 THE QUICK TIME EVENTS OF THE AIR FIGHT
// Every blow Mahoraga throws in the fight (the second half, bars 22 - 57 of the first song) shows a ring that closes on Sukuna: TAP as it closes and he dodges (or blocks, or meets the fist). Miss, and the story BRANCHES a little: the blow lands,
// Sukuna is thrown back, he cannot attack for a few seconds (his next blows are cancelled) and Mahoraga follows up with another blow (with a prompt of its own) - then it goes back to the normal story. After MORE THAN 3 misses Mahoraga attacks
// again and again: a flurry of blows on every beat (5 at the 4th miss, 2 more with every miss after it), each with a prompt. At the end of the fight (just before the last kick) the taps that hit are counted: under 75% and Sukuna is overwhelmed: the
// scene starts again from the beginning of the air fight; at 75% or more it goes on as before (the kick, the silence, the domain).
// Like everything in chapter 3 the picture is a function of the scene time, now also of the OUTCOMES so far (C13Q.res: prompt id -> 'perfect' / 'good' / 'miss' / 'skip'): c11Eff() makes the list of blows from the script (C11EV) and the outcomes
// and c11Build() (tools/chap3d.js) turns it into the windows of the two fighters; every new outcome rebuilds them (C13Q.ver). An unanswered prompt (or one skipped with the SKIP button or a test jump) leaves the script as v1.136 made it.

const C13 = { lead: 0.4, win: [-0.18, 0.14], early: 0.6, perfect: 0.06, show: 0.9, need: 0.75, upper: 3.6, mvs: ['hookN', 'hookF', 'hookN', 'kick', 'hookF', 'punch'] };      // the ring closes `lead` s before the blow; a tap from win[0] to win[1] s round that moment counts (perfect: within `perfect`); a tap a little early is a miss; the ring shows `show` s ahead; 75% needed; after a miss Sukuna cannot attack for `upper` s
let C13Q = { res: {}, shown: {}, rt: {}, early: {}, ver: 0, evald: false, def: null, pass: null };      // the outcomes so far, which prompts were seen, when each was decided (song time), which were too early, a counter that changes with every outcome, the verdict
const c13Off = () => !!window.__noQte;      // (test pages only: no prompts, taps skip the cuts as before)
function c13Reset() { C13Q = { res: {}, shown: {}, rt: {}, early: {}, ver: 0, evald: false, def: null, pass: null }; C11.b = null; }

// ---- the list of blows: the script and the outcomes. A prompt belongs to every blow of Mahoraga's except the last (the kick that ends the song): the success is a dodge (or the block / the clash the script has), a miss is a hit
function c11Eff() {
  const R = C13Q.res, ok = id => R[id] === 'perfect' || R[id] === 'good', bad = id => R[id] === 'miss', base = C11EV.map((e, i) => ({ ...e, id: 'b' + i })), out = [], beat = C9.beat, wins = [], lim = C11K.kick - 1.7;
  const after = t => C9.first + Math.ceil((t - C9.first) / beat - 1e-9) * beat, inW = t => wins.some(w => t > w[0] && t < w[1] + 0.6);
  let misses = R.p0 === 'miss' ? 1 : 0, cancel = -1e9, nx = 0, nf = 0;      // (a miss at the first punch counts too)
  const place = e => {
    const lab = e.re === 'block' ? 'BLOCK' : e.re === 'clash' ? 'CLASH' : 'DODGE';
    if (bad(e.id)) return { ...e, pr: true, lab, re: 'hit', kb: Math.max(e.kb || 0, e.fl ? 45 : 60), imp: Math.max(e.imp || 0, e.fl ? 0 : 1), sh: Math.max(e.sh || 0, e.fl ? 3 : 4), blood: 1, with: null };      // (the blow lands)
    if (ok(e.id) && e.re === 'hit') return { ...e, pr: true, lab, re: 'dodge', kb: undefined, imp: 0, sh: 0, blood: 0 };      // (a hit of the script is dodged)
    return { ...e, pr: true, lab };
  };
  const flurry = e => {      // more than 3 misses: he attacks again and again, on every beat, and more of them every time
    const n = Math.min(15, 5 + 2 * (misses - 4)), t0 = after(e.t + 1.6); let t1 = e.t;
    for (let j = 0; j < n; j++) { const t = t0 + j * beat; if (t > lim) break; const b = { t, a: 'M', mv: C13.mvs[nf++ % C13.mvs.length], re: 'dodge', id: 'f' + e.id + '.' + j, fl: true }; out.push(place(b)); t1 = t; if (bad(b.id)) misses++; }
    wins.push([e.t, t1]);
  };
  for (const e of base) {
    if (inW(e.t) || (e.a === 'S' && e.t < cancel)) continue;      // (replaced by a flurry; or Sukuna is still on the floor)
    if (e.a !== 'M' || e.last) { out.push(e); continue; }
    out.push(place(e)); if (!bad(e.id)) continue;
    misses++; cancel = Math.max(cancel, e.t + C13.upper);
    if (misses > 3) flurry(e);
    else if (!base.some(x => x.a === 'M' && !x.last && x.t > e.t + 0.6 && x.t < e.t + 2.4)) {      // a miss: he follows up with one more blow (a miss on that one is a miss too, and the fourth miss brings the flurry)
      const t = after(e.t + 1.0), b = { t, a: 'M', mv: nx++ % 2 ? 'hookF' : 'hookN', re: 'dodge', id: 'x' + e.id }; out.push(place(b));
      if (bad(b.id)) { misses++; cancel = Math.max(cancel, t + 2.0); if (misses > 3) flurry(b); }
    }
  }
  const res = out.filter(e => e.fl || e.last || !inW(e.t)); res.sort((a, b) => a.t - b.t); return res;
}
const c13List = B => [{ id: 'p0', t: C10K.dash - 0.15 + C13.lead, pr: true, lab: 'DODGE' }].concat(B.EV.filter(e => e.pr));      // (the first punch of the fight, in bullet time (tools/chap3c.js), and then every blow of the second half)
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
function c13Resolve(id, r, m) { const Q = C13Q; Q.res[id] = r; Q.rt[id] = m; if (r !== 'skip') { Q.ver++; C11.b = null; } }      // (a new outcome changes the future of the fight: the windows are built again)
const c13Zone = m => (m >= C11K.air2 - 1.2 && m <= C11K.kick + 0.3) || (m >= C10K.dash - 1.6 && m <= C10K.dash + 1.4);      // (the fight: the first punch and then bars 21 - 58; in between the taps skip the cuts as before)

// ---- every frame (c7Frame): the prompts that were seen and not answered in time are misses; at the end of the fight the verdict
function c13Step(now, T) {
  const Q = C13Q; if (c13Off() || !story || !story.c7) return; const m = T - c9Start();
  if (Q.def) { story.t0 = now - Q.def.T * 1000; return; }      // (defeated: the picture stands still on the last moment)
  if (!c13Zone(m)) return; const B = c11Build(); if (!B) return;
  for (const e of c13List(B)) {
    if (!e.pr || Q.res[e.id] !== undefined) continue; const Tc = e.t - C13.lead;
    if (m >= Tc - C13.show + 0.2 && m < Tc + C13.win[1]) Q.shown[e.id] = true;
    if (m >= Tc + C13.win[1]) { c13Resolve(e.id, Q.shown[e.id] ? 'miss' : 'skip', m); if (Q.shown[e.id]) { snd('c7thud', 1); break; } }
  }
  if (m >= C11K.kick - 0.5 && !Q.evald) { Q.evald = true; const s = c13Score(); if (s.n > 0 && s.pct < C13.need) { Q.def = { T, at: now, s }; snd('c7smash'); snd('c7wheel', 1); } else Q.pass = s; }
}
function c13InSkip(ev) { try { const r = cv.getBoundingClientRect(), x = (ev.clientX - r.left) / r.width * VW, y = (ev.clientY - r.top) / r.height * VH; return x > VW - 48 && y < 18; } catch (e) { return false; } }      // (the SKIP button in the corner)
function c13Restart() { if (story && story.c7) { story.t0 = pnow() - (c8R() + C8T.hit) * 1000; story.ev = {}; } c13Reset(); }      // (the air fight again from the beginning: the shot after the uppercut)
function c13Tap(ev) {      // a tap on the screen: true = the quick time events used it (otherwise it skips the cut as before)
  const Q = C13Q; if (c13Off() || !story || !story.c7) return false; const T = Math.max(0, pnow() - story.t0) / 1000, m = T - c9Start();
  if (Q.def) { if (pnow() - Q.def.at > 900) c13Restart(); return true; }
  if (!c13Zone(m) || m > C11K.kick + 0.1) return false; if (ev && c13InSkip(ev)) return false;
  const B = c11Build(); if (!B) return true; let hit = null, early = null;
  for (const e of c13List(B)) { if (!e.pr || Q.res[e.id] !== undefined) continue; const u = m - (e.t - C13.lead); if (u >= C13.win[0] && u <= C13.win[1]) { hit = e; break; } if (u >= -C13.early && u < C13.win[0] && !early) early = e; }
  if (hit) { const u = m - (hit.t - C13.lead); c13Resolve(hit.id, Math.abs(u) <= C13.perfect ? 'perfect' : 'good', m); snd('dash', 1); }
  else if (early) { Q.early[early.id] = true; c13Resolve(early.id, 'miss', m); snd('c7thud', 1); }
  return true;
}

// ---- the picture: the ring that closes on Sukuna, what was made of the tap, the counter, the SKIP button, the verdict
function c13Draw(m, cam, S) {
  if (c13Off() || !(c13Zone(m) || (m >= C11K.air2 - 2 && m <= C11K.kick + 2.2) || (m >= C10K.dash - 1.6 && m <= C10K.dash + 2.2))) return; const Q = C13Q, B = c11Build(); if (!B) return;
  const sc = c13Score(), sp = S ? c10Scr(cam, S.x, S.y - 26) : [VW / 2, VH / 2], px = Math.max(36, Math.min(VW - 36, sp[0])), py = Math.max(36, Math.min(VH - 40, sp[1]));
  ctx.save(); ctx.imageSmoothingEnabled = false; ctx.lineWidth = 2;
  for (const e of c13List(B)) {
    if (!e.pr) continue; const Tc = e.t - C13.lead, u = m - Tc, r = Q.res[e.id];
    if (r === undefined && u > -C13.show && u < C13.win[1] + 0.2 && !Q.def) {
      const rad = 11 + 26 * Math.pow(clamp01(-u / C13.show), 1.2), gold = Math.abs(u) <= C13.perfect + 0.02;
      ctx.strokeStyle = 'rgba(255,255,255,0.3)'; ctx.beginPath(); ctx.arc(px, py, 11, 0, 6.2832); ctx.stroke();
      ctx.strokeStyle = gold ? '#ffe08a' : '#ffffff'; ctx.beginPath(); ctx.arc(px, py, Math.max(rad, 11), 0, 6.2832); ctx.stroke();
      ctx.fillStyle = '#c4121c'; ctx.beginPath(); ctx.arc(px, py, 9, 0, 6.2832); ctx.fill(); pxt('TAP', px, py + 3, '#ffffff', 8, 'center'); pxt(e.lab, px, py + 25, '#ffd36a', 8, 'center');
    } else if (r !== undefined && r !== 'skip') {
      const t = m - Q.rt[e.id]; if (t < 0 || t > 0.8) continue; ctx.globalAlpha = 1 - t / 0.8; const txt = r === 'perfect' ? 'PERFECT' : r === 'good' ? 'GOOD' : Q.early[e.id] ? 'TOO EARLY' : 'MISS';
      pxt(txt, px, py - 22 - t * 12, r === 'miss' ? '#ff3347' : r === 'perfect' ? '#ffe08a' : '#ffffff', 10, 'center'); ctx.globalAlpha = 1;
      if (r === 'miss' && t < 0.4) { ctx.fillStyle = 'rgba(255,0,20,' + (0.3 * (1 - t / 0.4)).toFixed(3) + ')'; ctx.fillRect(0, 0, VW, VH); }
    }
  }
  if (Q.res.p0 === 'miss' && m >= c13T0() && m < c13T0() + 0.7 && S) { const a = m - c13T0(), q = c10Scr(cam, S.x, S.y); c3Ring(q[0], q[1], a, true, '255,235,200', 0.8); c4Spray(m, c13T0(), q[0], q[1], 9, { v: 90, up: 1, dir: 0, life: 0.7, cols: C4_BLOOD, sz: 1, seed: 5, g: 160, gnd: 1e9 }); c6White(0.4 * Math.exp(-a * 9)); }      // (the punch lands on him)
  if (c13Zone(m) && m < C11K.kick + 0.3 && !Q.def) { pxt('DODGE ' + sc.hits + '/' + sc.n + '  ' + Math.round(sc.pct * 100) + '%', 4, 10, sc.pct >= C13.need ? '#8dff9a' : '#ff6a7a', 8, 'left'); ctx.fillStyle = 'rgba(0,0,0,0.55)'; ctx.fillRect(VW - 40, 2, 38, 12); pxt('SKIP', VW - 21, 11, '#ffffff', 8, 'center'); }
  if (Q.pass && m > C11K.kick - 0.4 && m < C11K.kick + 2.0) pxt('DODGES ' + Q.pass.hits + '/' + Q.pass.n + '  ' + Math.round(Q.pass.pct * 100) + '%', VW / 2, 16, '#8dff9a', 10, 'center');
  if (Q.def) {
    const a = Math.min(1, (pnow() - Q.def.at) / 600); ctx.fillStyle = 'rgba(50,0,10,' + (0.78 * a).toFixed(3) + ')'; ctx.fillRect(0, 0, VW, VH); ctx.globalAlpha = a;
    pxt('DEFEATED', VW / 2, 52, '#ff3347', 20, 'center'); pxt('SUKUNA WAS OVERWHELMED', VW / 2, 70, '#ffffff', 8, 'center'); pxt(Q.def.s.hits + '/' + Q.def.s.n + ' DODGED = ' + Math.round(Q.def.s.pct * 100) + '%   75% NEEDED', VW / 2, 86, '#ffd36a', 8, 'center');
    if (pnow() - Q.def.at > 900) { ctx.globalAlpha = 0.5 + 0.5 * Math.sin(pnow() / 200); pxt('TAP TO TRY AGAIN', VW / 2, 112, '#ffffff', 8, 'center'); } ctx.globalAlpha = 1;
  }
  ctx.restore();
}
window.__c13 = () => ({ res: { ...C13Q.res }, ...c13Score(), def: !!C13Q.def, pass: !!C13Q.pass, ver: C13Q.ver, early: { ...C13Q.early } });      // test hooks
window.__c13Press = () => c13Tap(null); window.__c13Reset = () => { c13Reset(); };
