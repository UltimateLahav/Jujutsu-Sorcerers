// ---------------------------------------------------------------- v1.189 SUKUNA AND RYU AS ENEMIES (this file is spliced into template.html by build_html.py, after fred4.js; updateFighterVs, drawDummy and drawFoes in template.html call it). The user: "make sukuna in the fighting mode and not just the training mode" and, asked, "play him and fight him" and "Sukuna and Ryu". Both were fighters of the custom engine (tools/custom.js) that only a player could be; here they are enemies too. Their blows are DATA (CU_GAME[n].atk: the pictures of each blow, .ev: its events, .set: its speed and step), so the enemy plays them from the same data: the pictures at the speed of the blow, and every IMPACT event of a blow hurts you through gojoHit with the damage of the event (each impact gets an attack number from 100 on, see cuenReg), so your guard, crouch, jump, dash, the grade damage and the energy rules work on them as on every enemy. The moves that are code and not data (Sukuna's AIR CUT, fire arrow and Malevolent Shrine, Ryu's ki blast and beam) have enemy versions of their own below.
const cuFoeOn = () => !!vs && typeof vs.foe === 'string' && vs.foe.slice(0, 2) === 'cu' && !vs.net && !vs.story && !!dummy && dummy.mode === 'fighter';      // is Sukuna or Ryu the enemy of this fight?
const cuFoeG = () => CU_GAME[+vs.foe.slice(2)];
// 1. THE NUMBERS: every IMPACT (and every SHOT) event of the 25 blows of Sukuna and the 19 of Ryu gets an attack number from 100 on (the tables ATK_FPS, DMG, KNOCK, KNOCK_G, REACH, KICKS and CU_EXTRA, which gojoHit reads), and the special moves of part 4 get theirs (CUEN_X). Made the first time an enemy of this kind is there, because the fighters' pictures are cut when their sheets have loaded.
let cuenOk = false, cuenK = 100; const CUEN_X = {};
function cuenMods(e) { const o = {}; for (const [t, a, b, c] of (e.fx || [])) { if ('ktlqbry'.indexOf(t) < 0 || c) continue; if (t === 'k') o.knock = a; else if (t === 't') o.stun = a; else if (t === 'l') o.launch = a; else if (t === 'q') o.gb = true; else if (t === 'b') o.bleed = [a, b]; } return o; }
function cuenReg() {
  if (cuenOk) return true; const gs = [CU_GAME[3], CU_GAME[4]]; if (!gs[0] || !gs[1] || !gs[0].ev || !gs[1].ev) return false;
  const reg = (kk, dm, kn, ex) => { ATK_FPS[kk] = 30; ATK_SWING[kk] = 1; ATK_IMPACT[kk] = 1; DMG[kk] = dm; KNOCK[kk] = 20; KNOCK_G[kk] = kn; REACH[kk] = 40; CU_EXTRA[kk] = ex || {}; };
  gs.forEach((g, gi) => {
    const nm = 'cu' + (gi + 3); KICKS[nm] = [];
    g.ev.forEach((ev, k) => ev.forEach(e => { if (e.k !== 'i' && e.k !== 'o') return; const o = cuenMods(e); e.gk = cuenK++; reg(e.gk, e.d, o.knock ? o.knock * 6 : Math.min(120, 9 + e.d * 2), { nb: !!o.gb, heavy: !!o.launch }); if (/KICK/.test(g.an[k]) || e.low) KICKS[nm].push(e.gk); }));
  });
  CUEN_X.aircut = cuenK++; reg(CUEN_X.aircut, 10, 40); CUEN_X.arrow = cuenK++; reg(CUEN_X.arrow, 4, 50); CUEN_X.blast = cuenK++; reg(CUEN_X.blast, 12, 70); CUEN_X.beam = cuenK++; reg(CUEN_X.beam, 6, 30);
  cuenOk = true; return true;
}
// 2. HIS LOOK: the picture and its place for what the enemy Sukuna or Ryu is doing, for drawDummy (the pictures are 64 x 64, his middle at column 32, the same ones you see when you play him)
const CUEN_INFO = { w: 64, h: 64, cx: 32, x0: 0, top: 1 };
function cuenMove(g, k) { return { fr: g.atk[k], st: g.set[k], ms: 1000 / (g.set[k].v * GRADES[vs.gi].spd) }; }
function cuenLook(now, reacting, hitT, kt) {
  const d = dummy, g = cuFoeG(); let src, lift = 0, ox = 0, oy = 0; const idle = () => g.frames[Math.floor(Math.max(0, now - d.born) / (1000 / IDLE_FPS)) % g.frames.length];
  if (kt >= 0) src = idle();      // (beaten: drawDummy draws his K.O. pictures when he has some, else he topples like the others)
  else if (d.fa) { const L = cuenActLook(now, g); src = L.src; lift = L.lift || 0; }
  else if (d.airH > 0) { const hs = g.hus[4], fr = hs ? hs.f : g.hu; src = fr[Math.min(fr.length - 1, 6)] || idle(); }      // (thrown up by the UPPERCUT: the picture of the big fall)
  else if (reacting) { const hs = g.hus[d.rx], fr = hs ? hs.f : g.hu; src = fr.length ? fr[Math.min(fr.length - 1, Math.floor((now - d.rxAt) * fr.length / RX_DUR[d.rx]))] : idle(); }
  else if (d.ai === 'block') { const t = now - d.aiAt; src = g.bl.length ? g.bl[Math.min(g.bl.length - 1, Math.floor(t * BLK_FPS / 1000))] : idle(); }
  else if (d.ai === 'dodge') { const t = now - d.aiAt, fr = g.db.length ? g.db : g.df; src = fr.length ? fr[Math.min(fr.length - 1, Math.floor(t * fr.length / 300))] : idle(); }
  else if (d.ai === 'walk') { const fr = (d.walkDir > 0 && g.wbk && g.wbk.length) ? g.wbk : g.walk; src = fr.length ? fr[Math.floor(now * (g.wf || 12) / 1000) % fr.length] : idle(); }
  else src = idle();
  if (vs.inv && src && src.width) src = invOf(src);      // (a mirror match: the enemy has the inverted colours)
  if ((reacting || d.air) && hitT < 70 && src && src.width) src = whiteOf(src);
  return { src, info: CUEN_INFO, lift, ox, oy };
}
// 3. HIS BRAIN, called by updateFighterVs after the part every enemy shares (stun, hurt, your swing read, dodge and block)
const CUEN = {
  3: { chain: [0, 1, 2], far: [6, 7, 6, 8], farCd: 1100 },      // Sukuna: R.JAB, L.JAB, FACE KICK; from afar (beyond SU_NEAR) his M1 throws slashes, as when you play him
  4: { chain: [0, 1, 0, 1, 6, 7, 4, 2], far: [], farCd: 0, power: 8, combo: 10, dash: 11 }      // Ryu: hooks, hard punch, front kick, leg kick, kick up; and POWER PUNCH, the 5-HIT COMBO and the DASH KICK now and then
};
function cuenReach(g, k) {      // how far blow k reaches (the shortest of its impacts), against your body
  const B = hbBody(hbMe()); let r = 1e9; for (const e of g.ev[k]) if (e.k === 'i' && e.tip && B) r = Math.min(r, hbGap(e.tip, B, e.dy)); return r < 1e8 ? r : 36;
}
function cuFoe(now, dt, gap, ag, toward, G) {
  const d = dummy, g = cuFoeG(), n = +vs.foe.slice(2); if (!g || !cuenReg()) { d.ai = 'think'; return; }
  if (d.fa) { cuenAct(now, dt, gap, ag, toward, G, g, n); return; }
  if (d.ai === 'rest') { if (now - d.aiAt > d.restFor && now - d.born > 900) d.ai = 'think'; else return; }
  if (cuenSpecialTry(now, gap, ag, G, g, n)) return;
  const P = CUEN[n], near = cuenReach(g, P.chain[0]) - 2; d.walkDir = toward;
  const want = G.smart >= 3 ? Math.max(near - 4, Math.max(...[0, 1, 2, 3].map(pMove)) + 8) : near - 5; let move = 0;
  if (ag > want + 4) move = toward; else if (G.smart >= 3 && ag < want - 6 && ag > 20) move = -toward;
  const hold = G.smart >= 1 && atkAt >= 0 && gap > 0 && ag <= pMove(vs.seenK) + 4 && now < atkAt + pImpMs(vs.seenK) && !(vs.rolled && !vs.defended);
  const punish = G.smart >= 2 && vs.whiffAt > 0 && now - vs.whiffAt < 450 && gap > 0 && ag < near + 8 && Math.random() < [0, 0, 0.25, 0.5, 0.8, 1][vs.gi] * dt * 14;
  const counter = G.smart >= 2 && d.counter && now - d.counter < 500 && gap > 0 && ag < near + 8;
  let go = punish || counter, k = -1;
  if (!go && !hold && now >= (d.nextDecide || 0) && gap > -4) {
    d.nextDecide = now + 250;
    if (ag <= near) { if (Math.random() < G.aggr) { go = true; k = cuenPickNear(now, g, n, G, ag); } }
    else if (n === 3 && ag > 60 && ag <= 210 && now >= (d.farAt || 0) && Math.random() < G.aggr * 0.7) { go = true; k = P.far[(Math.random() * P.far.length) | 0]; d.farAt = now + P.farCd + Math.random() * 700; }
    else if (n === 4 && P.dash && ag > near + 10 && ag <= 130 && now >= (d.dashAt || 0) && Math.random() < G.aggr * 0.5) { go = true; k = P.dash; d.dashAt = now + 3500 + Math.random() * 2000; }
  }
  if (go) { if (k < 0) k = P.chain[(d.cuC = (d.cuC | 0) + 1) % P.chain.length]; d.chain = 0; cuenStart(k, now, 'cu'); return; }
  if (move) { d.x += move * FOE_WALK * G.spd * dt * (n === 4 ? 1.2 : 1); d.ai = 'walk'; } else d.ai = 'think';
}
function cuenPickNear(now, g, n, G, ag) {      // which blow at arm's length: the next of the chain, now and then one of Ryu's big ones (each has its own wait)
  const P = CUEN[n], r = Math.random(), d_ = dummy;
  if (n === 4) {
    if (G.smart >= 1 && r < 0.12 && now >= (d_.pwAt || 0)) { d_.pwAt = now + g.set[P.power].d * 1000 * 3 + 2500; return P.power; }
    if (vs.gi >= 2 && r < 0.2 && now >= (d_.cbAt || 0)) { d_.cbAt = now + 6000; return P.combo; }
  }
  return P.chain[(d_.cuC = (d_.cuC | 0) + 1) % P.chain.length];
}
function cuenStart(k, now, type, extra) {
  const d = dummy, g = cuFoeG(); d.held = null; d.counter = 0; d.ai = 'think'; d.aiAt = now; d.vx = 0; d.fa = { type, k, at: now, fired: [], lg: 0, ...extra };      // (d.chain, how many blows of the chain he has thrown, is kept)
  if (type === 'cu') { const m = cuenMove(g, k); d.fa.dur = m.fr.length * m.ms; snd('swing', k); }
  else if (type === 'aircut') d.fa.ms = 1000 / (30 * GRADES[vs.gi].spd) * g.atk[k].length;
  else if (type === 'blast') d.fa.ms = 1000 / (26 * GRADES[vs.gi].spd) * g.atk[k].length;      // (the length of the two moves that play the pictures of a blow: set at once, the picture is asked for in the same frame)
}
// the blows: the pictures at the speed of the blow, the step of the blow, and every event when its picture comes up
function cuenAct(now, dt, gap, ag, toward, G, g, n) {
  const d = dummy, a = d.fa;
  if (a.type !== 'cu') { cuenSpecialAct(now, dt, gap, ag, toward, G, g, n, a); return; }
  const m = cuenMove(g, a.k), nF = m.fr.length, ap = (now - a.at) / (nF * m.ms), fi = ap >= 1 ? nF : Math.floor(ap * nF) + 1, st = m.st;
  if (st.m) { const u = Math.min(1, ap / (st.lt || 1)), tg = st.m * (st.e ? 1 - (1 - u) * (1 - u) : u), dx = tg - a.lg; a.lg = tg; if (ag > 16) d.x += toward * dx; }      // (the step of the blow, not through you)
  g.ev[a.k].forEach((e, j) => { if (!a.fired[j] && e.f <= fi) { a.fired[j] = 1; cuenEv(e, now, gap, ag, toward, g, a.k); } });
  if (ap >= 1) { d.fa = null; const P = CUEN[n]; d.chain = (d.chain || 0) + 1;
    const nk = P.chain[(d.cuC = (d.cuC | 0) + 1) % P.chain.length];
    if (P.chain.includes(a.k) && d.chain < G.combo && Math.random() < 0.8 && ag <= cuenReach(g, nk) - 2 && !(G.smart >= 2 && atkAt >= 0 && gap > 0 && ag <= pMove(atkK) + 4)) cuenStart(nk, now, 'cu');
    else { d.ai = 'rest'; d.aiAt = now; d.restFor = (430 + Math.random() * 600) / (0.45 + G.aggr * 0.9); d.chain = 0; } }
}
function cuenEv(e, now, gap, ag, toward, g, k) {      // one event of the blow comes up
  const d = dummy, o = cuenMods(e);
  if (e.k === 'i') {
    const B = hbBody(hbMe()), reach = e.tip && B ? hbGap(e.tip, B, e.dy) : 36; if (!(ag <= reach && gap > -4)) return;
    snd('f:hit', e.d >= 20 ? 3 : 0); const h = hurtAt; gojoHit(e.gk, now); if (hurtAt === h) return;
    if (o.launch && !gAir) { gAir = airMake(now, 0, Math.sqrt(2 * AIR_G * o.launch), AIR_G, 'up'); hurtK = AIR_RX; }
    if (o.stun) pStun = Math.max(pStun, now + o.stun * 1000);
    if (o.bleed) vs.bleed = { until: now + o.bleed[1] * 1000, next: now + 100 };
  } else if (e.k === 'o') {      // a SHOT (Sukuna's slashes): it leaves his hand at the height of the fist and flies at you
    const vk = e.vk === undefined ? k : e.vk, vf = g.vfx[vk]; if (!vf || !vf.length) return; (d.cs = d.cs || []).push({ x: d.x - toward * -10, x0: d.x, dir: toward, v: typeof e.sp === 'function' ? e.sp() : (e.sp || 300), gk: e.gk, vf, at: now });
  }
}
// 4. THE SPECIAL MOVES (code in the player's version, so each has a small enemy version here). Sukuna: AIR CUT (a slash that cuts you and makes you bleed), the fire arrow (the long cast, then an arrow that burns you), MALEVOLENT SHRINE (his domain: 6 seconds of cuts). Ryu: the ki blast and the beam of JUST THIS ONCE. A blow of yours ends the move he is making.
const CUEN_SP = { 3: { aircut: [7000, 1], arrow: [14000, 3], dom: [40000, 4] }, 4: { blast: [4500, 0], beam: [35000, 4] } };      // [cooldown ms, first grade index]
function cuenSpecialTry(now, gap, ag, G, g, n) {
  const d = dummy; if (now < (d.spNext || 0) || gap < -4 || vs.ph !== 'fight' || now - d.born < 1500) return false; d.spNext = now + 350 + Math.random() * 450; const r = Math.random(), gi = vs.gi, S = CUEN_SP[n]; d.sp = d.sp || {};
  const ok = k => gi >= S[k][1] && now >= (d.sp[k] === undefined ? d.born + (k === 'dom' || k === 'beam' ? 15000 : 0) : d.sp[k]);
  if (n === 3) {
    if (ok('dom') && ag <= 200 && r < 0.25 && !dom && !fd && !ult) { d.sp.dom = now + S.dom[0]; cuenStart(0, now, 'dom'); return true; }
    if (ok('arrow') && ag >= 80 && ag <= 280 && r < 0.2) { d.sp.arrow = now + S.arrow[0]; cuenStart(22, now, 'arrow'); return true; }
    if (ok('aircut') && ag >= 30 && ag <= 220 && r < 0.3) { d.sp.aircut = now + S.aircut[0]; cuenStart(9, now, 'aircut'); return true; }
  } else {
    if (ok('beam') && ag <= 300 && r < 0.2 && !dom && !fd && !ult) { d.sp.beam = now + S.beam[0]; cuenStart(16, now, 'beam'); return true; }
    if (ok('blast') && ag >= 90 && ag <= 320 && r < 0.3) { d.sp.blast = now + S.blast[0]; cuenStart(12, now, 'blast'); return true; }
  }
  return false;
}
function cuenActLook(now, g) {
  const a = dummy.fa, t = now - a.at;
  if (a.type === 'cu') { const m = cuenMove(g, a.k), ap = Math.min(0.999, t / (m.fr.length * m.ms)), fi = Math.min(m.fr.length - 1, Math.floor(ap * m.fr.length)); return { src: m.fr[fi], lift: g.al && g.al[a.k] ? g.al[a.k][Math.min(g.al[a.k].length - 1, Math.floor(ap * g.al[a.k].length))] : 0 }; }
  const fr = g.atk[a.k], N = fr.length;
  if (a.type === 'arrow') return { src: fr[suPicAt(SU_FL.T, Math.min(t, SU_FL.end - 1))] };
  if (a.type === 'dom') return { src: fr[Math.min(N - 1, Math.floor(Math.min(1, t / 1900) * N))] };
  if (a.type === 'beam') return { src: fr[Math.min(N - 1, Math.floor(Math.min(1, t / 1500) * N))] };
  return { src: fr[Math.min(N - 1, Math.floor(t / a.ms * N))] };      // aircut, blast: the blow's own pictures
}
function cuenSpecialAct(now, dt, gap, ag, toward, G, g, n, a) {
  const d = dummy, t = now - a.at;
  if (a.type === 'aircut') {
    a.ms = 1000 / (30 * G.spd) * g.atk[9].length; if (!a.hit && t >= a.ms * SU_BLUE.cut.hit / g.atk[9].length) { a.hit = true; snd('swing', 9); const h = hurtAt; if (ag <= 230) gojoHit(CUEN_X.aircut, now); if (hurtAt !== h) { vs.bleed = { until: now + 2000, next: now + 100 }; spark(wx, gy - 30, 10, ['#ffffff', '#ff2a3a', '#ffb0b8'], false, -toward); } }
    if (t >= a.ms) cuenEnd(now);
  } else if (a.type === 'arrow') {
    if (!a.shot && t >= SU_FL.T[13]) { a.shot = true; snd('swing', 3); (d.ca = d.ca || []).push({ x: d.x - toward * -14, x0: d.x, dir: toward, at: now }); }
    if (t >= SU_FL.end) cuenEnd(now);
  } else if (a.type === 'dom') {      // the sign for 1.9 s, then the shrine opens: a cut across you every 0.5 s for 6 s (about 3 health, times the damage of the grade), no guard stops it
    if (t >= 1900 && t - (a.tick || 1900) >= 500 && t < 7900) { a.tick = t; vsHurt(Math.max(1, Math.round(3 * G.dmg)), now); spark(wx, gy - 28 - ((Math.random() * 20) | 0), 8, ['#ffffff', '#ff2a3a', '#ffb0b8'], false, Math.random() < 0.5 ? 1 : -1); snd('hit', 1); shakeUntil = now + 90; shakeAmp = 1; }
    if (t >= 7900 || vs.ph !== 'fight') cuenEnd(now);
  } else if (a.type === 'blast') {
    a.ms = 1000 / (26 * G.spd) * g.atk[12].length; if (!a.shot && t >= a.ms * 7 / g.atk[12].length) { a.shot = true; snd('swing', 3); (d.cb = d.cb || []).push({ x: d.x - toward * -16, x0: d.x, dir: toward, at: now }); }
    if (t >= a.ms) cuenEnd(now);
  } else if (a.type === 'beam') {      // JUST THIS ONCE: the stance for 1.5 s (the screen darkens), then the beam for 1.3 s that hits you every 0.13 s, as long as you stand in front of him
    if (t >= 1500 && t < 2800 && t - (a.tick || 1500) >= 130) { a.tick = t; if (ag <= 330 && gap > -4) gojoHit(CUEN_X.beam, now); }
    if (t >= 2800 || vs.ph !== 'fight') cuenEnd(now);
  }
}
function cuenEnd(now) { const d = dummy; d.fa = null; d.ai = 'rest'; d.aiAt = now; d.restFor = 500 / (0.45 + GRADES[vs.gi].aggr * 0.9); }
// 5. WHAT HE THREW, once a frame (drawFoes calls it): the slashes, the fire arrows (they burn you: 1 health every 0.5 s for 8 s), the ki blasts, and the picture of the domain and the beam
function cuenWorld(now, dt) {
  const d = dummy, g = cuFoeG(), cx = Math.round(VW / 2); if (!g) return; const on = vs.ph === 'fight' && d.ko < 0;
  const hitP = (list, kk, spark_) => { for (const s of list) { if (!on) { s.done = 1; continue; } if (s.dir * (wx - s.x) < 10) { s.done = 1; const h = hurtAt; gojoHit(kk(s), now); spark_(s, hurtAt !== h); } else if (Math.abs(s.x - s.x0) > 460) s.done = 1; } };
  if (d.cs) {
    for (const s of d.cs) { s.x += s.dir * s.v * dt; const sx = cx + Math.round(s.x - wx); ctx.save(); ctx.translate(sx, 0); ctx.scale(-s.dir, 1); ctx.drawImage(s.vf[Math.floor(now / 80) % s.vf.length], -32, gy - 62, 64, 64); ctx.restore(); }
    hitP(d.cs, s => s.gk, (s, hit) => { if (hit) spark(wx, gy - 30, 6, ['#ffffff', '#ff2a3a'], false, -s.dir); }); d.cs = d.cs.filter(s => !s.done);
  }
  if (d.ca) {
    for (const s of d.ca) { s.x += s.dir * SU_FL.arrow.speed * dt; const sx = cx + Math.round(s.x - wx), y = gy - 39; ctx.fillStyle = 'rgba(255,150,34,0.35)'; ctx.fillRect(sx - s.dir * 30 - 6, y - 5, 30, 10); ctx.fillStyle = '#ff9622'; ctx.fillRect(sx - 6, y - 4, 12, 8); ctx.fillStyle = '#fff0c0'; ctx.fillRect(sx - 3, y - 2, 6, 4); for (let i = 0; i < 4; i++) { ctx.fillStyle = i % 2 ? '#ff7408' : '#ffd27a'; ctx.fillRect(sx - s.dir * (10 + i * 7), y - 3 + (((now / 60 + i) | 0) % 3), 6, 2); } }
    hitP(d.ca, () => CUEN_X.arrow, (s, hit) => { spark(wx, gy - 38, 12, SU_FL.cols, false, -s.dir); if (hit) { vs.fburn = { until: now + SU_FL.burn.ms, next: now + SU_FL.burn.gap }; say('BURNING', wx, '#ff9a3a', 8, now + 120); } }); d.ca = d.ca.filter(s => !s.done);
  }
  if (d.cb) {
    for (const s of d.cb) { s.x += s.dir * 420 * dt; const sx = cx + Math.round(s.x - wx), y = gy - 30; ctx.fillStyle = 'rgba(120,200,255,0.4)'; ctx.fillRect(sx - 7, y - 7, 14, 14); ctx.fillStyle = '#7aa0ff'; ctx.fillRect(sx - 5, y - 5, 10, 10); ctx.fillStyle = '#e8f4ff'; ctx.fillRect(sx - 3, y - 3, 6, 6); ctx.fillStyle = 'rgba(160,210,255,0.5)'; ctx.fillRect(sx - s.dir * 18, y - 1, 12, 2); }
    hitP(d.cb, () => CUEN_X.blast, (s, hit) => { spark(wx, gy - 30, 10, ['#e8f4ff', '#7aa0ff', '#ffffff'], false, -s.dir); }); d.cb = d.cb.filter(s => !s.done);
  }
  const a = d.fa;
  if (a && a.type === 'dom') { const t = now - a.at; if (t >= 1900) { ctx.fillStyle = 'rgba(150,6,24,' + (Math.min(0.38, (t - 1900) / 1000)).toFixed(2) + ')'; ctx.fillRect(0, 0, VW, VH); ctx.fillStyle = 'rgba(255,255,255,0.55)'; for (let i = 0; i < 5; i++) { const h = Math.imul(i * 7919 + ((now / 90) | 0) * 104729, 2246822519) >>> 0; ctx.fillRect(h % VW, (h >> 9) % VH, 30 + (h >> 4) % 90, 1); } } }
  if (a && a.type === 'beam') { const t = now - a.at; if (t < 1500) { ctx.fillStyle = 'rgba(0,0,0,' + (0.35 * Math.min(1, t / 700)).toFixed(2) + ')'; ctx.fillRect(0, 0, VW, VH); } else if (t < 2800) { const sx = cx + Math.round(d.x - wx), th = 22 + Math.round(Math.sin(now / 35) * 3); ctx.fillStyle = 'rgba(120,180,255,0.5)'; ctx.fillRect(0, gy - 31 - th / 2 - 3, sx - 8, th + 6); ctx.fillStyle = '#cfe6ff'; ctx.fillRect(0, gy - 31 - th / 2, sx - 8, th); ctx.fillStyle = '#ffffff'; ctx.fillRect(0, gy - 31 - 4, sx - 8, 8); } }
  if (vs.fburn) { const b = vs.fburn; if (vs.ph !== 'fight') vs.fburn = null; else { while (vs.fburn && b.next <= now && b.next <= b.until) { vsHurt(SU_FL.burn.dmg, b.next); b.next += SU_FL.burn.gap; } if (now >= b.until) vs.fburn = null; } }
  freBleed(now);
}
// 6. AS A VICTIM: the picture kit the fatalities use (his idle with a white and a blue copy, and the ten reactions of 15 pictures: his own hurt pictures, spread over the 15)
const CUV = {};
function cuVictim(n) {
  if (CUV[n]) return CUV[n]; const g = CU_GAME[n]; if (!g || !g.frames.length) return victimKit(Array.from({ length: 15 }, () => EMPTY), Array.from({ length: 10 }, () => Array.from({ length: 15 }, () => EMPTY)), () => CUEN_INFO);
  const rx = Array.from({ length: 10 }, (_, k) => { const f = g.hus && g.hus[k] ? g.hus[k].f : g.hu; return Array.from({ length: 15 }, (_, i) => f.length ? f[Math.min(f.length - 1, Math.floor(i * f.length / 15))] : g.frames[i % g.frames.length]); });
  return CUV[n] = victimKit(g.frames.slice(0, 15), rx, () => CUEN_INFO);
}
