// ================================================================ v1.209 THE BEAM CLASH (this file is spliced into template.html by build_html.py, after admin.js; drawScene, cutsceneOn, beginRound, iruStart, ryUlStart and cuenStart in tools/template.html, tools/ironb.js, tools/ryu.js and tools/cuen.js call it)
// The user: "add a beam clash mechanic that works like this, when a beam fires and it detects another beam getting fired then the game will slow both beams down and in this case since its iron man and ryu then if iron man fired the beam first then a cutscene will show him charging his beam up while ryu is pointing at iron man saying just this once as the just this once in japanese of ryu appears as they both fire at the same time and a button mashing appears and the one after 7 seconds of button mashing wins then he will win the clash, if iron man wins then he will over power ryu's beam as ryu steps back and fires a granite blast which gets destroyed almost instantly by iron man's beam as he gets ingulfed in the beam but if its not a finisher then ryu will just get launched back but if ryu wins then iron man will use his repoulsers to fire 2 more beams as he tries to over power ryu's as iron man jumps up when he files but in an instant ryu downslams iron man down to the beam disintegrating him but if its not a finisher then iron man will just get sent back".
// The answers to the questions before it was made: ONLY THE TWO ULTIMATES clash (Iron Man's UNIBEAM and Ryu's JUST THIS ONCE); Iron Man is an enemy too (v1.208), so it works whichever of them is yours; when RYU fires first, "ryu points at iron man as he fires his beam but then we see iron man charging up and then fire his own beam"; a FINISHER is a clash that WOULD KILL the loser.
// WHEN: the SECOND of the two ultimates starts while the FIRST one is still going on (from its start to the end of its beam): the live fight stops, both ultimates are over (their buttons wait 30 s as always) and the scene below plays (drawScene hands the whole frame to bclFrame, as it does for a FATALITY). Not in the cab of the skyscraper, not when the enemy is on another floor, not in a mirror match (Iron Man against Iron Man, Ryu against Ryu), not in the Wi-Fi fight.
// THE SCENE (bcl.u = ms into it; the left one is always YOU, the camera stays on you): 1. THE INTRO. Iron Man first: he is charging (the sun at his chest swells, the ground shakes), Ryu points at him, the four letters of 今回だけ ("just this once", the same pictures as Ryu's own ultimate) pop up one after the other and the voice says it, then both fire at the same moment. Ryu first: Ryu points and fires, his beam crosses the screen and hits Iron Man, who braces; then the camera goes to Iron Man, the sun swells, he fires, and his beam pushes Ryu's back from his own chest to the middle. 2. THE MASH, 7 seconds: the two beams meet in a ball of light that moves with the taps: tap the screen (or any key) as fast as you can; the enemy taps too (about 5 to 8 a second, by his grade). The one with more taps wins (a tie is the enemy's). The beams are drawn slow and heavy, as the user asked. 3. THE END, by who won and whether it would KILL the loser (the loser's health is not more than 45% of his whole health, which is what the winning beam takes; never when his health is infinite in the TRAIN page or in SETTINGS): IRON MAN WINS: his beam overpowers Ryu's, which shrinks to his hair; Ryu steps back and fires a GRANITE BLAST that his beam destroys almost at once, and the beam engulfs him: a finisher disintegrates him (nothing is left, the round is over), else he is launched back and stunned. RYU WINS: his beam overpowers Iron Man's; Iron Man flies up on his boots and fires two repulsor beams, the orb gives a little, but in an instant Ryu leaps and DOWNSLAMS him down into the beam: a finisher disintegrates him, else he is sent back and stunned. The winner takes nothing from his health.
const BCL = { G: 130, mash: 7000, pct: 0.45, tA: [1700, 1950], tB: [650, 1800, 2250], endI: 3400, endR: 3700 };      // (how far apart they stand, the mash, the winning beam's share of the loser's whole health; the intro when Iron Man fired first: both fire, the mash starts; when Ryu fired first: Ryu fires, Iron Man fires, the mash starts; how long each ending lasts, ms)
// (bcl, the clash that is running, and bclGone, true when the player was disintegrated so that nothing of him is drawn until the next round, are declared at the top of tools/template.html: show() resets them)
const bclE = u => u <= 0 ? 0 : u >= 1 ? 1 : u * u * (3 - 2 * u), bclMix = (a, b, u) => a + (b - a) * u, bclClamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
// ---- WHEN
const bclPair = () => !!vs && !vs.net && !vs.story && !vs.hunt && !vs.rush && ((vs.me === 'cu4' && vs.foe === 'cu5') || (vs.me === 'cu5' && vs.foe === 'cu4'));      // (only Iron Man against Ryu, either way round)
function bclMeUlt(now) {      // is MY ultimate going on, before its beam is over?
  if (vs.me === 'cu5') { const g = CU_GAME[5], b = g && g.bh; return !!b && b.kind === 'uni' && now - b.t0 < IRU.tRel; }
  return !!ryUl && now - ryUl.t0 < RY_U.tRel;
}
function bclFoeUlt(now) {      // is the ENEMY's going on?
  const a = dummy && dummy.fa; if (!a) return false;
  return vs.foe === 'cu5' ? a.type === 'uni' && now - a.at < IRU.tRel : a.type === 'beam' && now - a.at < 2800;
}
function bclTry(now, starter) {      // a fighter has just started his ultimate ('me' or 'foe'): when the other one's is going on, the beams clash
  if (bcl || !vs || state !== 'play' || vs.ph !== 'fight' || !bclPair() || !dummy || dummy.ko >= 0 || dummy.cap || dummy.twAway || dummy.mode !== 'fighter') return false;
  if (dom || fat || yf || fd || ult || js || vf || cf || ff || ke || se || de || c4x) return false;
  if (twOn()) { const T = vs.tw; if (T.away || T.cab || T.fFoe !== T.fMe) return false; }
  if (starter === 'me' ? !bclFoeUlt(now) : !bclMeUlt(now)) return false;
  return bclBegin(now, starter === 'me' ? 'foe' : 'me');
}
const bclInf = who => who === 'foe' ? !!vs.practice && TR.ehp === 1 : !!SET.ihp || (!!vs.practice && TR.php === 0);      // (a health that cannot run out: nothing is a finisher on it)
function bclBegin(now, first, force) {      // first = who fired first ('me' or 'foe'); force = for the tests: { win: 'me' | 'foe', kill: true | false }
  const g4 = CU_GAME[4], g5 = CU_GAME[5], d = dummy, ir = vs.me === 'cu5' ? 'me' : 'foe'; if (!g4 || !g5 || !g4.ulr || !g4.ulr.u1 || !g5.moves) return false; if (!g5.ump) iruPics(g5);
  if (vs.me === 'cu5') iruEnd(g5, now); else ryUlEnd(now);      // (both ultimates are over: the buttons wait 30 s from now)
  d.fa = null; d.ai = 'rest'; d.aiAt = now; d.restFor = 900; d.vx = 0; d.chain = 0; d.held = null; d.stunUntil = Math.max(d.stunUntil || 0, now + 300);
  stance = 'stand'; stickCr = false; stickDown = false; cuAtkQ = cuLpQ = 0; cuJumpAt = -1; atkAt = -1; atkQ = false; jumpAt = teleAt = -1; lpAt = -1; dash = null; mbAt = -1; blkAt = -1; blkEnd = -1; wxv = 0; wvx = 0; keyL = keyR = padL = padR = jumpReq = atkReq = crReq = lpReq = dashReq = ceReq = false; closeSettings();
  const A = first === ir;      // (Iron Man fired first)
  bcl = { t0: now, u: 0, first, ir, A, ph: 'intro', mx: wx, mx0: wx, fx: d.x, fx0: d.x, taps: [0, 0], pos: 0.5, posT: 0.5, win: null, kill: false, dmg: 0, uE: 0, p: [], rings: [], fl: 0, shk: 0, pulse: 0, aiAcc: 0, seed: Math.random() * 100, say: [0, 0, 0], did: {}, force: force || null, tM: A ? BCL.tA[1] : BCL.tB[2], inf: [bclInf('me'), bclInf('foe')] };
  $('pad').classList.add('cine'); $('hud').classList.add('cine'); bclGone = false; window.__bclCount = (window.__bclCount || 0) + 1;      // (test hook: how many clashes there have been)
  snd('concboom'); return true;
}
// ---- THE TAPS
const bclTapEl = document.createElement('div'); bclTapEl.id = 'bclTap'; bclTapEl.style.cssText = 'position:fixed;left:0;right:0;bottom:0;top:0;z-index:3;display:none;touch-action:none;-webkit-user-select:none;user-select:none;-webkit-tap-highlight-color:transparent'; document.body.appendChild(bclTapEl);
function bclTapOff() { const e = document.getElementById('bclTap'); if (e) e.style.display = 'none'; }      // (show() calls it: a fight that is left in the middle of the mash)
function bclTap() { const B = bcl; if (!B || B.ph !== 'mash' || paused) return; B.taps[0]++; B.pulse = 1; if (B.taps[0] % 2 === 0) snd('cecrackle'); }
bclTapEl.addEventListener('pointerdown', e => { e.preventDefault(); bclTap(); });
window.addEventListener('keydown', e => { if (bcl && bcl.ph === 'mash' && !paused && !e.repeat && !e.ctrlKey && !e.metaKey && !e.altKey) { bclTap(); e.preventDefault(); } }, true);      // (any key but a shortcut: the browser's own keys keep working)
// ---- THE FRAME
function bclFrame(now, dt) {
  const B = bcl; keyL = keyR = padL = padR = jumpReq = atkReq = crReq = lpReq = dashReq = ceReq = domReq = false; fatReq = 0;
  B.u += Math.min(0.05, dt) * 1000; bclStep(now, dt, B); if (bcl !== B) return; bclDraw(now, dt, B);
}
function bclStep(now, dt, B) {
  const u = B.u, S = BCL;
  if (B.ph === 'intro' && u >= B.tM) { B.ph = 'mash'; B.posT = 0.5; bclTapEl.style.display = 'block'; }
  if (B.ph === 'mash') {
    const t = u - B.tM, g = vs.gi, base = [4.6, 5.2, 5.8, 6.4, 7.0, 7.8][g] * (t < 1500 ? 1.15 : 1) * (0.85 + 0.3 * (0.5 + 0.5 * Math.sin(t * 0.0021 + B.seed)));      // (the enemy mashes 5 - 8 times a second by his grade, a little faster at the start, rising and falling)
    B.aiAcc += base * dt; while (B.aiAcc >= 1) { B.aiAcc -= 1; B.taps[1]++; }
    B.posT = bclClamp(0.5 + (B.taps[0] - B.taps[1]) / 36, 0.14, 0.86); B.pos += (B.posT - B.pos) * Math.min(1, dt * 7); B.pulse = Math.max(0, B.pulse - dt * 6);
    if (t >= S.mash) bclDecide(now, B);
  } else B.pulse = Math.max(0, B.pulse - dt * 6);
  if (B.ph === 'end' && u >= B.uE + (B.win === B.ir ? S.endI : S.endR)) { bclFinish(now, B); return; }
  B.fl = Math.max(0, B.fl - dt * 3.2); B.shk = Math.max(0, B.shk - dt * 9);
  B.rings = B.rings.filter(r => u - r.t0 < 480); B.p = B.p.filter(q => u - q.t0 < q.life);
}
function bclDecide(now, B) {      // the 7 seconds are over: who won, and would it kill him
  const f = B.force, a = B.taps[0], b = B.taps[1]; B.win = f && f.win ? f.win : a > b ? 'me' : 'foe'; const lose = B.win === 'me' ? 'foe' : 'me';
  B.dmg = lose === 'foe' ? Math.round((dummy.max || DUMMY_HP) * BCL.pct * SET.pdm / 100) : Math.round(PHP * BCL.pct); const eff = lose === 'foe' ? B.dmg : Math.round(B.dmg * SET.edm / 100);      // (what the beam takes: your own damage setting on the enemy; the enemy damage setting is applied by vsHurt)
  B.kill = f && f.kill !== undefined ? !!f.kill : !B.inf[lose === 'foe' ? 1 : 0] && (lose === 'foe' ? dummy.hp : vs.hp) <= eff;
  B.ph = 'end'; B.uE = B.u; B.posT = B.pos; B.pos0 = B.pos; B.did = {}; bclTapOff(); B.shk = 4; B.fl = 0.3;
}
function bclFinish(now, B) {      // the scene is over: what it did to the loser goes into the fight, and the fight goes on (or the round is over)
  bcl = null; bclTapOff(); if (!ryUl) { $('pad').classList.remove('cine'); $('hud').classList.remove('cine'); }
  if (vs.me === 'cu5') { vs.jto = (vs.jto || 0) + 1; if (vs.jto >= 2) achGive('jto'); }      // (v1.210 the achievement JUST THIS ONCE: the second clash against the enemy Ryu in this fight, see tools/ach.js)
  wx = B.mx; dummy.x = B.fx; wxv = 0; wvx = 0; dummy.vx = 0; const d = dummy, loseFoe = B.win === 'me';
  if (loseFoe) {
    d.hp = Math.max(0, d.hp - B.dmg); d.hitAt = now; d.dodgeUntil = 0; d.ai = 'rest'; d.aiAt = now; d.restFor = 900;
    if (B.kill) { d.hp = 0; koDummy(now); d.del = now - 1800; } else { d.rx = 6; d.rxAt = now; cuStun(1.4, now, true); }
  } else {
    if (B.kill) { bclGone = true; vs.hp = 0; vs.hitAt = now; if (vs.ph === 'fight') endRound('enemy', 'ko', now); }
    else { vsHurt(Math.max(1, Math.round(B.dmg * cuS.hp / PHP)), now); hurtK = 4; hurtAt = now; pStun = Math.max(pStun, now + 1200); }
  }
}
window.__bcl = () => bcl && ({ ph: bcl.ph, u: Math.round(bcl.u), first: bcl.first, ir: bcl.ir, A: bcl.A, taps: bcl.taps.slice(), win: bcl.win, kill: bcl.kill, dmg: bcl.dmg, pos: +bcl.pos.toFixed(2), tM: bcl.tM });
window.__bclGo = (first, force) => { const now = pnow(); return bclBegin(now, first, force); };

// ---- THE DRAWING: helpers (the beams, the ball where they meet, the sparks, the letters, the pieces of a fighter who is disintegrated)
function bclRyuBeam(a, sx, sy, dir, span, th) {      // Ryu's beam, the same four layers as in his own ultimate (ryUlBack in tools/ryu.js), from (sx, sy) for span px to the right (dir 1) or to the left (dir -1); a = ms since it fired
  const ramp = a < 220 ? 0.18 + 0.82 * ryEase(a / 220) : 1, TH = th * ramp, lead = Math.min(Math.round(span), Math.round((VW + 40) * ryEase(Math.min(1, a / 150)))); if (TH < 1 || lead < 2) return; const X = (l, w) => dir > 0 ? sx + l : sx - l - w;
  for (let l = 0; l < lead; l += 2) {
    const cone = Math.min(1, 0.28 + l / 46), h = Math.max(2, TH * cone * (1 + 0.07 * Math.sin(l * 0.11 - a * 0.05) + 0.04 * Math.sin(l * 0.27 + a * 0.09))), xx = X(l, 2), c1 = Math.max(1, Math.round(h * 0.7)), c2 = Math.max(1, Math.round(h * 0.42));
    ctx.fillStyle = '#e4f7ff'; ctx.fillRect(xx, Math.round(sy - h / 2 - 3), 2, Math.round(h + 6)); ctx.fillStyle = '#17e3ff'; ctx.fillRect(xx, Math.round(sy - h / 2), 2, Math.round(h));
    ctx.fillStyle = '#8ff6ff'; ctx.fillRect(xx, Math.round(sy - c1 / 2), 2, c1); ctx.fillStyle = '#ffffff'; ctx.fillRect(xx, Math.round(sy - c2 / 2), 2, c2);
  }
  ctx.fillStyle = 'rgba(255,255,255,.75)';
  for (let j = 0; j < 7; j++) { const yy = Math.round(sy + (((j * 37 + 11) % 100) / 100 - 0.5) * TH * 0.8), sp = j % 2 ? 1.1 : 1.5; for (let x0 = -((a * sp + j * 41) % 70); x0 < lead; x0 += 70) { const xs = Math.max(0, x0), xe = Math.min(lead, x0 + 22); if (xe > xs) { const w = Math.round(xe - xs); ctx.fillRect(X(Math.round(xs), w), yy, w, 1); } } }
  if (!SET.lite) for (let j = 0; j < 22; j++) { const l = Math.random() * lead, h = TH * Math.min(1, 0.28 + l / 46), side = Math.random() < 0.5 ? -1 : 1; ctx.fillStyle = Math.random() < 0.5 ? '#ffffff' : '#9ff3ff'; ctx.fillRect(Math.round(X(l, 2)), Math.round(sy + side * (h / 2 + 4 + Math.random() * 9)), 2, 1); }
}
function bclBar(sx, sy, dir, len, th, cols) {      // a thin straight beam of three layers (a repulsor, the granite blast): cols = [the outline, the beam, the middle]
  if (len < 1) return; const x0 = dir > 0 ? sx : sx - len, L = Math.round(len);
  ctx.fillStyle = cols[0]; ctx.fillRect(Math.round(x0), Math.round(sy - th / 2 - 1), L, th + 2); ctx.fillStyle = cols[1]; ctx.fillRect(Math.round(x0), Math.round(sy - th / 2), L, th); ctx.fillStyle = cols[2]; ctx.fillRect(Math.round(x0), Math.round(sy - Math.max(1, th * 0.22)), L, Math.max(1, Math.round(th * 0.45)));
}
function bclRay(x0, y0, x1, y1, th, cols) {      // a thin straight beam from (x0, y0) to (x1, y1), one pixel column at a time (the repulsors)
  const n = Math.abs(Math.round(x1 - x0)); if (n < 1) return; const dx = x1 > x0 ? 1 : -1;
  for (const [t, c] of [[th + 2, cols[0]], [th, cols[1]], [Math.max(1, Math.round(th * 0.4)), cols[2]]]) { ctx.fillStyle = c; for (let i = 0; i <= n; i++) ctx.fillRect(Math.round(x0 + dx * i), Math.round(y0 + (y1 - y0) * i / n - t / 2), 1, t); }
}
const bclDisc = (x, y, r, col) => ryUlDisc(x, y, r, col);
function bclOrb(x, y, R, now, dirI) {      // where the two beams meet: a white ball with an orange side (Iron Man's) and a cyan one (Ryu's), a cross of light, and a flicker
  const k = 1 + 0.06 * Math.sin(now * 0.05); R = Math.round(R * k); ryUlDisc(x, y, R + 10, 'rgba(255,255,255,0.12)'); ryUlDisc(x + dirI * 2, y, R + 5, 'rgba(255,140,30,0.55)'); ryUlDisc(x - dirI * 2, y, R + 4, 'rgba(23,227,255,0.6)'); ryUlDisc(x, y, R, '#ffffff'); ryUlDisc(x, y, Math.max(1, R - 4), '#fffbe0');
  ctx.fillStyle = 'rgba(255,255,255,0.7)'; ctx.fillRect(Math.round(x - R * 2.2), Math.round(y), Math.round(R * 4.4) + 1, 1); ctx.fillRect(Math.round(x), Math.round(y - R * 2), 1, Math.round(R * 4) + 1);
}
function bclSpark(B, x, y, n, spd, cols, life) {      // n bits of light fly out of (x, y) on the screen
  for (let i = 0; i < n && B.p.length < 400; i++) { const a = Math.random() * 6.2832, v = spd * (0.35 + Math.random() * 0.65); B.p.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v * 0.8 - 20, t0: B.u, life: (life || 480) * (0.6 + Math.random() * 0.6), c: cols[(Math.random() * cols.length) | 0], s: Math.random() < 0.3 ? 2 : 1 }); }
}
function bclFlames(X, dir, lift, now) {      // the flames of his boots (the blast pictures have none)
  for (const o of [-7, 7]) { const h = 7 + ((now / 40 + o) % 5), x = Math.round(X + dir * o * 0.6), y = Math.round(gy + 2 - lift); ctx.fillStyle = '#ff7a1a'; ctx.fillRect(x - 2, y, 5, Math.round(h)); ctx.fillStyle = '#ffd34d'; ctx.fillRect(x - 1, y, 3, Math.round(h * 0.7)); ctx.fillStyle = '#ffffff'; ctx.fillRect(x, y, 1, Math.round(h * 0.4)); }
}
function bclFig(src, X, dir, lift, dx, alpha) {      // a 64 x 64 picture of a fighter (middle column 32, soles on row 62), at the screen place X, facing dir (1 right, -1 left), raised by lift; dx = how far the cell is shifted in its own direction (Ryu's long arm)
  if (!src) return; ctx.save(); ctx.translate(Math.round(X), 0); if (dir < 0) ctx.scale(-1, 1); if (alpha !== undefined && alpha < 1) ctx.globalAlpha = alpha; ctx.drawImage(src, -32 + (dx || 0) - (src.ox || 0), Math.round(gy - 61 - lift)); ctx.restore();
}
function bclRyuTip(row, i, X, dir, lift) {      // where the front tip of Ryu's hair is on the screen in picture i of a row of his sheet
  const T = RY_GB[row] && RY_GB[row][i] || [50, 14], dx = -((RY_JU[row] || [])[i] || 0); return [X + dir * (T[0] - 32 + dx), gy - 61 - lift + T[1]];
}
function bclIronCore(pic, X, dir, lift) {      // where the reactor in Iron Man's chest is
  const c = pic && pic.core || { px: 42, py: 24 }; return [X + dir * (c.px - 32 + 2), gy - 61 - lift + c.py + 1];
}
function bclLetters(now, t) {      // 今回だけ, "just this once": the four letters of Ryu's own ultimate pop in one after the other (170 ms apart, each a little too big at first) with a line that grows under them; t = ms since the first one began; they fade after 1.5 s
  const J = ryJpC || (ryJpC = ryJpMake()), k = Math.max(1, Math.min(Math.floor((VW - 16) / 128), Math.floor(VH * 0.4 / 36))), gx0 = Math.round((VW - 128 * k) / 2), gy0 = Math.round(VH * 0.13), out = t > 1500 ? Math.max(0, 1 - (t - 1500) / 260) : 1; if (t < 0 || out <= 0) return;
  for (let i = 0; i < 4; i++) {
    const u = (t - i * 170) / 220; if (u <= 0) continue; const s = 1 + 0.45 * (1 - Math.min(1, u)), dw = 36 * k * s, dx = gx0 + i * 32 * k - 2 * k - (dw - 36 * k) / 2, dy = gy0 - 2 * k - (dw - 36 * k) / 2, al = Math.min(1, u * 1.8) * out * (u < 1 && Math.floor(now / 40) % 3 === 0 ? 0.6 : 1);
    for (const [cv, o] of [[J.g2, 0.55], [J.g1, 1], [J.w, 1]]) { ctx.globalAlpha = al * o; ctx.drawImage(cv, i * 36, 0, 36, 36, Math.round(dx), Math.round(dy), Math.round(dw), Math.round(dw)); }
  }
  const lu = ryEase((t - 300) / 450), lw = Math.round(124 * k * lu), ly = gy0 + 32 * k + 4 * k; if (lw > 0) { ctx.globalAlpha = out; ctx.fillStyle = '#17e3ff'; ctx.fillRect(Math.round(VW / 2 - lw / 2), ly, lw, Math.max(1, k)); ctx.fillStyle = '#ffffff'; ctx.fillRect(Math.round(VW / 2 - lw / 4), ly, Math.round(lw / 2), Math.max(1, k)); }
  ctx.globalAlpha = 1;
}
function bclDisMake(src, X, dir, lift, dx, bd) {      // a fighter is disintegrated: every second pixel of his picture becomes a piece that is carried off in the direction of the beam (bd), the ones nearest to the beam first
  const out = []; if (!src) return out; let d; try { d = src.getContext('2d').getImageData(0, 0, src.width, src.height).data; } catch { return out; }
  for (let y = 0; y < src.height; y++) for (let x = 0; x < src.width; x++) {
    const i = (y * src.width + x) * 4; if (d[i + 3] < 90 || ((x + y) & 1)) continue; const px = X + dir * (x - 32 + (dx || 0) - (src.ox || 0)), py = gy - 61 - lift + y;
    out.push({ x: px, y: py, c: 'rgb(' + d[i] + ',' + d[i + 1] + ',' + d[i + 2] + ')', vx: bd * (50 + Math.random() * 190), vy: (Math.random() - 0.5) * 80 - 25, d: (px - X) * bd * 7 + 260 + Math.random() * 140 });
  }
  return out;
}
function bclDisDraw(list, e) {      // the pieces (e = ms since the beam took him): white at first, then their own colours, flying and fading
  for (const q of list) { const t = (e - q.d) / 950; if (t >= 1) continue; if (t <= 0) { ctx.fillStyle = q.c; ctx.fillRect(Math.round(q.x), Math.round(q.y), 1, 1); continue; } ctx.globalAlpha = 1 - t * t; ctx.fillStyle = t < 0.18 ? '#ffffff' : q.c; ctx.fillRect(Math.round(q.x + q.vx * t), Math.round(q.y + q.vy * t + 55 * t * t), 1, 1); }
  ctx.globalAlpha = 1;
}

// ---- THE FRAME'S PICTURE
function bclDraw(now, dt, B) {
  const u = B.u, S = BCL, ir = B.ir, ry = ir === 'me' ? 'foe' : 'me', id = ir === 'me' ? 1 : -1, rd = -id, g4 = CU_GAME[4], g5 = CU_GAME[5], P = g5.ump, cx = Math.round(VW / 2), eas = bclE;
  const inEnd = B.ph === 'end', E = inEnd ? u - B.uE : -1, iW = inEnd && B.win === ir, rW = inEnd && B.win === ry, kill = inEnd && B.kill, G = bclClamp(Math.round(VW * 0.36), 88, S.G), FLY = bclClamp(Math.round(VW * 0.3), 70, 100);      // (G: they stand 130 px apart, less on a narrow screen)
  // ---- 1. WHERE THEY STAND AND HOW HIGH (in the world: the enemy slides to G px in front of you; the endings add a step back, a leap or a flight). The left one is always you, and the camera stays on you.
  const off = { me: 0, foe: 0 }, lift = { me: 0, foe: 0 };
  if (iW) {
    off[ry] = -rd * 28 * eas((E - 450) / 420);
    if (!kill && E >= 1400) { const t = bclClamp((E - 1400) / 800, 0, 1); off[ry] += id * FLY * eas(t); lift[ry] = 38 * Math.sin(Math.PI * t); }
  } else if (rW) {
    off[ir] = -id * 8 * eas(E / 420); lift[ir] = E < 1590 ? 38 * eas((E - 420) / 400) : 38 * (1 - eas((E - 1590) / 110));
    if (E >= 1380) { off[ry] = rd * (G - 10) * eas((E - 1380) / 240); lift[ry] = E < 1650 ? 56 * Math.sin(Math.PI * (E - 1380) / 270) : 0; }
    if (!kill && E >= 1700) { const t = bclClamp((E - 1700) / 800, 0, 1); off[ir] += rd * FLY * eas(t); lift[ir] = 30 * Math.sin(Math.PI * t); }
  }
  const fxBase = bclMix(B.fx0, B.mx0 + G, eas(u / 450)); B.mx = B.mx0 + off.me; B.fx = fxBase + off.foe;
  let camX = (B.mx + B.fx) / 2; if (inEnd) camX = bclMix(camX, B.mx, eas((E - ((iW ? S.endI : S.endR) - 320)) / 320));      // (the camera is on the middle of the two of them; at the end it goes back to you)
  wx = camX; const Lx = Math.round(cx + (B.mx - camX)), Rx = Math.round(cx + (B.fx - camX)), X = { me: Lx, foe: Rx };
  // ---- 2. WHAT EACH OF THEM IS DOING: the picture, and where his beam starts
  let iPic = P.pu[0], rPic = g4.frames[0], rRow = null, rIdx = 0, rDx = 0, iFl = false, iWhite = false, rWhite = false, iHide = false, rHide = false, iAlpha = 1, rAlpha = 1;
  const tF = S.tA[0], tR = S.tB[0], tI = S.tB[1];
  if (B.ph === 'intro' && B.A) {      // Iron Man first: he charges, Ryu points, both fire at tF
    iPic = u >= tF ? P.fi[Math.floor(u / 45) % 2] : u < 330 ? P.ch[Math.min(2, Math.floor(u / 110))] : P.pu[Math.floor(u / 90) % 2];
    if (u < 935) { rRow = 'u1'; rIdx = Math.min(14, Math.floor(u / 935 * 15)); } else if (u < tF) { rRow = 'u2'; rIdx = Math.floor((u - 935) / 83) % 15; } else { rRow = 'u3'; rIdx = 2 + Math.floor(u / 70) % 4; }
  } else if (B.ph === 'intro') {      // Ryu first: he points and fires at tR, Iron Man braces under it, then charges and fires at tI
    iPic = u < 330 ? P.ch[Math.min(2, Math.floor(u / 110))] : u < tR + 100 ? P.br[Math.min(3, Math.floor((u - 330) / 60))] : u < 1000 ? P.fi[Math.floor(u / 45) % 2] : u < tI ? P.pu[Math.floor(u / 90) % 2] : P.fi[Math.floor(u / 45) % 2];
    if (u < tR) { rRow = 'u1'; rIdx = Math.min(14, Math.floor(u / tR * 15)); } else { rRow = 'u3'; rIdx = 2 + Math.floor((u - tR) / 70) % 4; }
  } else if (B.ph === 'mash') {
    iPic = P.fi[Math.floor(u / 45) % 2]; rRow = 'u3'; rIdx = 2 + Math.floor(u / 70) % 4;
  } else if (iW) {      // Ryu is beaten
    iPic = E < (kill ? 2650 : 2300) ? P.fi[Math.floor(u / 45) % 2] : P.rl[Math.min(3, Math.floor((E - (kill ? 2650 : 2300)) / 100))];
    if (E < 450) { rRow = 'u3'; rIdx = 2 + Math.floor(E / 70) % 4; } else if (E < 870) rPic = g4.db[Math.min(14, Math.floor((E - 450) / 420 * 15))]; else if (E < 1400) { rPic = g4.atk[16][Math.min(14, Math.floor((E - 870) / 700 * 15))]; rRow = 'gs'; rIdx = Math.min(14, Math.floor((E - 870) / 700 * 15)); }
    else if (kill) { rPic = g4.atk[16][14]; rWhite = E < 1520; rHide = E >= 1520; } else { const t = bclClamp((E - 1400) / 800, 0, 1), hp = g4.hus[4].f; rPic = hp[Math.min(hp.length - 1, E < 2200 ? Math.floor(t * 10.99) : 11 + Math.min(3, Math.floor((E - 2200) / 110)))]; }
  } else if (rW) {      // Iron Man is beaten
    const ia = g5.atk[9], ib = g5.atk[10], hu1 = g5.hus[1].f, hu4 = g5.hus[4].f;
    if (E < 420) iPic = P.fi[Math.floor(u / 45) % 2]; else if (E < 720) iPic = g5.jump[Math.min(8, Math.floor((E - 420) / 300 * 9))]; else if (E < 1050) { iPic = ia[3]; iFl = true; } else if (E < 1590) { iPic = ib[3]; iFl = true; }
    else if (E < 1700) iPic = hu1[3]; else if (kill) { iPic = hu1[3]; iWhite = E < 1830; iHide = E >= 1830; } else { const t = bclClamp((E - 1700) / 800, 0, 1); iPic = hu4[Math.min(hu4.length - 1, E < 2500 ? Math.floor(t * 8.99) : 9)]; }
    if (E < 1380) { rRow = 'u3'; rIdx = 2 + Math.floor(E / 70) % 4; } else if (E < 1500) rPic = g4.jump[Math.min(14, 2 + Math.floor((E - 1380) / 120 * 6))]; else if (E < 1700) rPic = g4.atk[5][Math.min(14, 3 + Math.floor((E - 1500) / 200 * 7))]; else rPic = g4.atk[5][Math.min(14, 10 + Math.floor((E - 1700) / 80))];
  }
  if (rRow) { rPic = g4.ulr[rRow] ? g4.ulr[rRow][rIdx] : g4.atk[16][rIdx]; rDx = -((RY_JU[rRow] || [])[rIdx] || 0); }
  // ---- 3. WHERE THE BEAMS START AND WHERE THEY MEET
  const iSrc = bclIronCore(iPic, X[ir], id, lift[ir]); let rSrc = rRow ? bclRyuTip(rRow, rIdx, X[ry], rd, lift[ry]) : [X[ry] + rd * 24, gy - 47 - lift[ry]];
  if (rW) { if (E < 1380) { B.tipW = camX + (rSrc[0] - cx); B.tipY = rSrc[1]; } else rSrc = [cx + (B.tipW - camX), B.tipY]; }      // (the beam goes on where it was when he leaps: the place is kept in the world)
  const mid = (iSrc[0] + rSrc[0]) / 2, my = (iSrc[1] + rSrc[1]) / 2, lo = Math.min(iSrc[0], rSrc[0]) + 16, hi = Math.max(iSrc[0], rSrc[0]) - 16;
  let ox = mid, oy = my, oR = 0, iOn = false, rOn = false, iA = 0, rA = 0, iRel = -1, rFade = 1, iTh = 1, rTh = 1, farI = 0, farR = 0;
  const mashOx = () => bclClamp(Lx + (Rx - Lx) * B.pos, lo, hi);
  if (B.ph === 'intro' && B.A) {
    if (u >= tF) { iOn = rOn = true; iA = rA = u - tF; oR = 9 * eas((u - tF) / 150); ox = mid; }
  } else if (B.ph === 'intro') {
    if (u >= tR) { rOn = true; rA = u - tR; }
    if (u < tI) { ox = iSrc[0] + id * 6; oR = u >= tR + 60 ? 5 : 0; } else { iOn = true; iA = u - tI; ox = bclMix(iSrc[0] + id * 6, mid, eas((u - tI) / 350)); oR = 9 * eas((u - tI) / 200 + 0.3); }
  } else if (B.ph === 'mash') {
    iOn = rOn = true; iA = rA = 240 + (u - (B.A ? tF : tI)) * 0.35; ox = mashOx();      // (the beams run slow and heavy while they push: their waves go at a third of the speed)
    oR = 9 + B.pulse * 4 + 2 * Math.sin(u / 60); const pI = ir === 'me' ? B.pos : 1 - B.pos; iTh = 0.78 + 0.5 * pI; rTh = 0.78 + 0.5 * (1 - pI);
  } else if (iW) {
    if (!B.did.o0) { B.did.o0 = 1; B.orb0 = mashOx(); } iOn = true; iA = 9999; rA = 9999;
    const rFront = X[ry] + rd * 46; ox = E < 420 ? bclMix(B.orb0, rFront, eas(E / 420)) : rFront; oR = E < 1330 ? 9 : 9 * (1 - eas((E - 1330) / 90)); rOn = E < 870; rTh = 1 - 0.75 * eas(E / 420);
    if (E >= 1330) farI = (id > 0 ? VW + 40 - iSrc[0] : iSrc[0] + 40) * eas((E - 1330) / 170); iRel = E - (kill ? 2650 : 2300);
  } else if (rW) {
    if (!B.did.o0) { B.did.o0 = 1; B.orb0 = mashOx(); } iOn = E < 700; rOn = true; iA = 9999; rA = 9999; iTh = 1 - 0.7 * eas(E / 420);
    const iFront = iSrc[0] + id * 24, k1 = bclClamp((E - 760) / 260, 0, 1), k2 = bclClamp((E - 1090) / 260, 0, 1), kick = 18 * (Math.sin(Math.PI * k1) + Math.sin(Math.PI * k2));
    ox = E < 420 ? bclMix(B.orb0, iFront, eas(E / 420)) : iFront + rd * kick; oR = E < 1650 ? 9 : 9 * (1 - eas((E - 1650) / 90));
    if (E >= 1650) { const far = rd > 0 ? VW + 40 : -40; ox = bclMix(iFront, far, eas((E - 1650) / 250)); farR = 1; }
    rFade = 1 - eas((E - (kill ? 2900 : 2500)) / 400);
  }
  oy = my;
  // ---- 4. THE CAMERA
  let z = 1, fx = (Lx + Rx) / 2, fy = gy - 44;
  if (B.ph === 'intro' && B.A) { z = 1 + 0.3 * eas(u / 1400) - 0.2 * eas((u - tF) / 300); }
  else if (B.ph === 'intro') { if (u < 700) { z = 1 + 0.25 * eas(u / 500); fx = bclMix((Lx + Rx) / 2, rSrc[0], 0.5); } else if (u < tI) { z = 1.25 + 0.55 * eas((u - 700) / 400); fx = bclMix(fx, iSrc[0], eas((u - 700) / 400)); fy = bclMix(fy, iSrc[1], eas((u - 700) / 400)); } else z = 1.8 - 0.65 * eas((u - tI) / 350); }
  else if (B.ph === 'mash') z = 1.12 + 0.03 * B.pulse;
  else if (iW) z = E < 1300 ? 1.12 + 0.2 * eas(E / 800) : 1.32 - 0.1 * eas((E - 1300) / 800);
  else if (rW) z = E < 1300 ? 1.12 : 1.12 + 0.12 * eas((E - 1300) / 300);
  z = Math.max(1, z); const hw = VW / (2 * z), hh = VH / (2 * z); fx = bclClamp(fx, hw, VW - hw); fy = bclClamp(fy, hh, VH - hh);
  // ---- 5. THE EVENTS (sounds, flashes, sparks)
  const D = B.did, at = (k, c, fn) => { if (!D[k] && c) { D[k] = 1; fn(); } };
  if (B.ph === 'intro' && B.A) {
    at('w1', u >= 250, () => snd('ryult', 1)); at('w2', u >= 675, () => snd('ryult', 6)); at('w3', u >= 1100, () => snd('ryult', 7));
    at('fire', u >= tF, () => { snd('irult', 2); snd('ryult', 3); B.fl = 0.4; B.shk = 6; bclSpark(B, ox, oy, 28, 220, ['#ffffff', '#ffd34d', '#17e3ff'], 520); B.rings.push({ x: ox, y: oy, t0: u }); });
  } else if (B.ph === 'intro') {
    at('w1', u >= 60, () => snd('ryult', 1)); at('w2', u >= 480, () => snd('ryult', 6)); at('w3', u >= 900, () => snd('ryult', 7));
    at('rfire', u >= tR, () => { snd('ryult', 3); B.fl = 0.4; B.shk = 5; }); at('ichg', u >= 900, () => snd('irult', 0)); at('ibr', u >= 1500, () => snd('irult', 1));
    at('ifire', u >= tI, () => { snd('irult', 2); B.fl = 0.4; B.shk = 6; bclSpark(B, ox, oy, 30, 230, ['#ffffff', '#ffd34d', '#17e3ff'], 520); B.rings.push({ x: ox, y: oy, t0: u }); });
    if (u >= tR && u < tI && Math.random() < 0.6) bclSpark(B, iSrc[0] + id * 14, iSrc[1] + (Math.random() - 0.5) * 24, 1, 110, ['#ffffff', '#9ff3ff'], 300);
  } else if (B.ph === 'mash') {
    if (B.last === undefined || u - B.last > 360) { B.last = u; B.rings.push({ x: ox, y: oy, t0: u }); }
    bclSpark(B, ox, oy, 2 + (B.pulse > 0.5 ? 3 : 0), 170, ['#ffffff', '#ffd34d', '#17e3ff', '#ff9a22'], 420); B.shk = Math.max(B.shk, 1.3 + B.pulse * 1.5);
  } else if (iW) {
    at('push', E >= 0, () => { snd('irult', 2); B.fl = 0.3; }); at('gb', E >= 1243, () => snd('redfire')); at('gbx', E >= 1303, () => { B.fl = 0.4; B.shk = 7; snd('concboom'); bclSpark(B, ox, oy, 34, 240, ['#ffffff', '#ffd34d', '#eef5f6'], 500); B.rings.push({ x: ox, y: oy, t0: u }); });
    at('hit', E >= 1400, () => { snd('hit', 3); snd('smack', 3); B.shk = 8; B.fl = 0.3; bclSpark(B, X[ry], gy - 36, 26, 230, ['#ffffff', '#ffd34d', '#ff7a1a'], 560); if (kill) { snd('ko'); } });
    if (kill && E >= 1520 && !B.dis) B.dis = bclDisMake(g4.atk[16][14], X[ry], rd, lift[ry], 0, id);
    if (E >= (kill ? 2650 : 2300)) at('rel', true, () => snd('irult', 4));
  } else if (rW) {
    at('back', E >= 0, () => { snd('ryult', 3); B.fl = 0.3; }); at('hop', E >= 420, () => snd('thrust', 1)); at('r1', E >= 760, () => { snd('redfire'); B.fl = 0.4; B.rings.push({ x: ox, y: oy, t0: u }); }); at('r2', E >= 1090, () => { snd('redfire'); B.fl = 0.4; B.rings.push({ x: ox, y: oy, t0: u }); });
    at('leap', E >= 1380, () => snd('swing', 3)); at('slam', E >= 1590, () => { snd('hit', 3); snd('smack', 3); snd('land', 2); B.shk = 9; B.fl = 0.4; bclSpark(B, X[ir], gy - 20, 30, 240, ['#ffffff', '#ffd34d', '#ff7a1a'], 560); puff(wx + (X[ir] - cx), 6); });
    at('hit', E >= 1700, () => { snd('hit', 3); B.shk = 7; bclSpark(B, X[ir], gy - 36, 26, 230, ['#ffffff', '#9ff3ff', '#17e3ff'], 560); if (kill) snd('ko'); });
    if (kill && E >= 1830 && !B.dis) B.dis = bclDisMake(g5.hus[1].f[3], X[ir], id, lift[ir], 0, rd);
  }
  // ---- 6. THE PICTURE
  ctx.save(); ctx.imageSmoothingEnabled = false;
  const sk = B.shk * SET.shk / 100; if (sk > 0.05) ctx.translate(Math.round((Math.random() * 2 - 1) * sk), Math.round((Math.random() * 2 - 1) * sk));
  ctx.translate(Math.round(VW / 2), Math.round(VH / 2)); if (z !== 1) ctx.scale(z, z); ctx.translate(-Math.round(fx), -Math.round(fy));
  ctx.fillStyle = '#070b1e'; ctx.fillRect(-VW, -400, VW * 3, 400 + gy); drawBackdrop(now); ctx.fillStyle = 'rgba(8,4,24,' + (0.18 + 0.2 * Math.min(1, u / 900)).toFixed(2) + ')'; ctx.fillRect(-VW, -400, VW * 3, 900); drawSmoke(now, dt);
  for (const s of ['me', 'foe']) { if ((s === ir ? iHide : rHide)) continue; const l = lift[s], sw = Math.max(5, Math.round(9 * (1 - l / 70))), sv = Math.round(sw * 2 / 3); ctx.fillStyle = 'rgba(0,0,0,0.4)'; ctx.fillRect(X[s] - sw, gy + 3, sw * 2, 2); ctx.fillRect(X[s] - sv, gy + 2, sv * 2, 1); ctx.fillRect(X[s] - sv, gy + 5, sv * 2, 1); }
  // the beams (behind the two of them)
  const iLen = Math.max(0, Math.abs(ox - iSrc[0])) + farI, rLen = Math.max(0, Math.abs(ox - rSrc[0])) + (farR ? 0 : 0);
  const iOver = iW && E >= 1330, rOver = rW && E >= 1650;
  if (iOn && !(rW && E >= 700) && !iOver) iruBeamPaint(iA, iRel, iSrc[0], iSrc[1] + 1, id, iLen, iTh);
  if (rOn && !rOver) bclRyuBeam(rA, rSrc[0], rSrc[1], rd, rLen, 54 * rTh * rFade);
  // the repulsors of Iron Man (RYU WINS) and the granite blast of Ryu (IRON MAN WINS)
  if (rW) for (const e0 of [760, 1090]) if (E >= e0 && E < e0 + 240) { const px = X[ir] + id * 26, py = gy - 61 - lift[ir] + 27, a = (E - e0) / 240; bclRay(px, py, ox, oy, Math.round(6 * (1 - a * 0.5)), ['#5fb8ff', '#d8f0ff', '#ffffff']); bclDisc(px, py, 5, '#ffffff'); }
  if (iW && E >= 1243 && E < 1345) { const tp = bclRyuTip('gs', 8, X[ry], rd, lift[ry]), len = bclClamp((E - 1243) * 0.5 + 8, 0, Math.abs(ox - tp[0])); bclBar(tp[0], tp[1], rd, len, 8, ['#c9d8dd', '#8fb3bd', '#eef5f6']); }
  // the fighters
  const drawIron = !iHide && !(B.dis && rW && E >= 1830), drawRyu = !rHide && !(B.dis && iW && E >= 1520);
  if (drawIron) { bclFig(iPic, X[ir], id, lift[ir], 0, iAlpha); if (iWhite) bclFig(whiteOf(iPic), X[ir], id, lift[ir], 0, 0.9); if (iFl) bclFlames(X[ir], id, lift[ir], now); }
  if (drawRyu) { bclFig(rPic, X[ry], rd, lift[ry], rDx, rAlpha); if (rWhite) bclFig(whiteOf(rPic), X[ry], rd, lift[ry], rDx, 0.9); }
  // the engulfing beam goes over the loser, and the pieces of the one who is disintegrated over the beam
  if (iOver && iOn) iruBeamPaint(iA, iRel, iSrc[0], iSrc[1] + 1, id, iLen, 1);
  if (rOver && rOn) bclRyuBeam(rA, rSrc[0], rSrc[1], rd, Math.abs(ox - rSrc[0]), 54 * rFade);
  if (B.dis) bclDisDraw(B.dis, iW ? E - 1520 : E - 1830);
  // the sun at his reactor and the ball at Ryu's hair
  { const fb = { core: { px: 0, py: 0 }, t0: now - (iOn ? IRU.tF + 60 : Math.min(IRU.tF - 1, IRU.charge * (0.3 + 0.7 * Math.min(1, u / (B.A ? tF : tI))) + (u > (B.A ? tF - 300 : tI - 300) ? 100 : 0))), fired: iOn, fireAt: now - iA };
    if (!(rW && E >= 700) && !iHide) iruFront(g5, fb, now, iSrc[0] - 1, iSrc[1] - 1); }
  if (B.ph === 'intro' && !rOn && rRow) { const c = bclClamp(u / (B.A ? tF : tR), 0, 1), R = 1 + Math.round(8 * Math.pow(c, 1.2) + Math.abs(Math.sin(now * 0.03)) * 1.5); ctx.globalAlpha = 1; ryUlDisc(rSrc[0] + rd * 3, rSrc[1], R + 2, 'rgba(23,227,255,.45)'); ryUlDisc(rSrc[0] + rd * 3, rSrc[1], R, '#17e3ff'); ryUlDisc(rSrc[0] + rd * 3, rSrc[1], Math.max(1, Math.round(R * 0.55)), '#ffffff'); }
  if (rOn && rA < 320 && rRow) { const R = Math.round(15 * (1 - rA / 320)) + 2; ryUlDisc(rSrc[0], rSrc[1], R, '#17e3ff'); ryUlDisc(rSrc[0], rSrc[1], Math.max(1, R - 3), '#ffffff'); }
  if (oR > 0.5 && (iOn || rOn)) bclOrb(ox, oy, oR, now, id);
  // rings and sparks
  for (const r of B.rings) { const a = (u - r.t0) / 480, R = 70 * a; ctx.fillStyle = 'rgba(255,255,255,' + (0.7 * (1 - a)).toFixed(2) + ')'; for (let q = 0; q < 48; q++) { const th = q / 48 * 6.2832; ctx.fillRect(Math.round(r.x + Math.cos(th) * R), Math.round(r.y + Math.sin(th) * R * 0.6), 1, 1); } }
  for (const q of B.p) { const a = (u - q.t0) / q.life, t = (u - q.t0) / 1000; ctx.globalAlpha = Math.max(0, 1 - a); ctx.fillStyle = q.c; ctx.fillRect(Math.round(q.x + q.vx * t), Math.round(q.y + q.vy * t + 40 * t * t), q.s, q.s); } ctx.globalAlpha = 1;
  ctx.restore();
  // ---- 7. OVER EVERYTHING (not moved by the camera): the letters, the flash, the black bars, the mash
  const bh = Math.round(VH * 0.07 * Math.min(1, u / 300)); ctx.fillStyle = '#000'; ctx.fillRect(0, 0, VW, bh); ctx.fillRect(0, VH - bh, VW, bh);
  if (B.ph === 'intro') bclLetters(now, B.A ? u - 250 : u - 60);
  if (B.fl > 0.01) { const a = B.fl * (SET.nf ? 0.2 : SET.fl / 100); if (a > 0.004) { ctx.fillStyle = 'rgba(255,255,255,' + Math.min(1, a).toFixed(2) + ')'; ctx.fillRect(0, 0, VW, VH); } }
  if (B.ph === 'mash') bclUI(now, B, ir);
}
function bclUI(now, B, ir) {      // the mash: the seconds left, the bar of the two taps (yours on the left), and the call
  const t = B.u - B.tM, left = Math.max(0, BCL.mash - t), cx = Math.round(VW / 2), w = Math.min(200, VW - 40), x0 = cx - Math.round(w / 2), y = 24, cI = '#ff7a1a', cR = '#17e3ff', cL = ir === 'me' ? cI : cR, cF = ir === 'me' ? cR : cI;
  pxt(String(Math.ceil(left / 1000)), cx, 19, left < 2000 ? '#ff6a5a' : '#ffffff', 16, 'center');
  ctx.fillStyle = '#000'; ctx.fillRect(x0 - 1, y - 1, w + 2, 8); ctx.fillStyle = cF; ctx.fillRect(x0, y, w, 6); ctx.fillStyle = cL; ctx.fillRect(x0, y, Math.round(w * B.pos), 6); ctx.fillStyle = '#ffffff'; ctx.fillRect(x0 + Math.round(w * B.pos) - 1, y - 2, 2, 10);
  pxt(String(B.taps[0]), x0, y + 18, cL, 8, 'left'); pxt(String(B.taps[1]), x0 + w, y + 18, cF, 8, 'right');
  const big = Math.floor(now / 110) % 2 ? 24 : 16; pxt('MASH!', cx, VH - 12, '#ffffff', big, 'center');
}
