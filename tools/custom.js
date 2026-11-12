// ---------------------------------------------------------------- the fighter engine of the free-play fighters of the "custom" kind: Sukuna (cu3, tools/sukuna.js) and Ryu (cu4, tools/ryu.js); this file is spliced into template.html by build_html.py, in place of the marker line after the continuation's
// (v1.155: the ART section of the mode screen, where you drew your own characters in a pixel editor (v1.64 to v1.85: slots, drawings, the CODE blocks, the stats page), was taken out. What is left is what the two built-in fighters run on: customScene (one frame of a match with such a fighter: it walks, crouches, jumps, dashes, blocks, is hurt, throws its blows, shots and effects), the stats (cuStats), the hit and stun rules (cuHit, cuStun, cuBleedStep) and the measuring of their pictures for the hitboxes.)
// A fighter of this kind is a CU_GAME[slot] = { name, frames (idle), walk, jump, cr, ci, cwk, bl, df, db, hu / hus, ko, atk: [the pictures of each blow], ev: [the events of each blow: its impact, its shots, its callbacks], set: [pictures a second, step, cost, cooldown of each blow], body, tipAll, vxs, st (the stats) ...}; sukuna.js and ryu.js cut their picture strips into these when the page has loaded.
const CU_STAT = [      // the STATS of a fighter: [key, name, unit, least, most, first value, what the other fighters have]
  ['hp', 'HEALTH', '', 50, 999, 300, 'THEY HAVE 300'], ['fw', 'WALK SPEED', 'PX/S', 10, 200, 70, 'THEY HAVE 56'], ['bk', 'BACK SPEED', 'PX/S', 10, 200, 70, 'THEY HAVE 38'], ['cw', 'CROUCH WALK', '%', 0, 100, 60, 'THEY HAVE 60'],
  ['jh', 'JUMP HEIGHT', 'PX', 10, 120, 46, 'THEY HAVE 22'], ['jt', 'JUMP TIME', 'MS', 300, 1500, 800, 'THEY HAVE 713'], ['dfw', 'DASH FORWARD', 'PX', 10, 200, 50, 'THEY HAVE 50'], ['dbk', 'DASH BACK', 'PX', 10, 200, 42, 'THEY HAVE 42'], ['dtm', 'DASH TIME', 'MS', 100, 1000, 375, 'THEY HAVE 375'], ['pt', 'PARRY TIME', 'MS', 0, 600, 260, 'THEY HAVE 260'], ['em', 'ENERGY', '%', 20, 300, 100, 'THEY HAVE 100'], ['er', 'ENERGY REFILL', '%', 0, 300, 100, 'THEY HAVE 100'], ['dm', 'DAMAGE', '%', 10, 300, 100, 'THEY HAVE 100']];
const cuStats = d => { const o = {}; CU_STAT.forEach(([k, , , lo, hi, df]) => { const v = d && d.st ? Math.round(+d.st[k]) : NaN; o[k] = isNaN(v) ? df : Math.max(lo, Math.min(hi, v)); }); return o; };
let cuS = cuStats(null);      // the stats of the fighter in the match

// ---- the fighters in the game: FREE PLAY (the fighter select screen) has a card for Sukuna and one for Ryu; in the match customScene plays the fighter (see the notes at the top)
let cuSn = 0, cuCp = 0, cuAtkQ = 0, cuLpQ = 0, cuPh = 0, cuJumpAt = -1, cuJumpC = false, cuAtkAt = -1, cuAtkK = 0, cuCmb = 0, cuCmbBy = 0, cuFired = [], cuRes = [], cuShots = [], cuMs = 50, cuLunged = 0, cuCd = [0, 0, 0, 0], cuBleed = null, cuVfx = [], cuDash = null, cuDashReady = 0;      // (the jump, the punch being thrown (which of the 4, since when), the next punch of the combo and until when it goes on)
const cuMe = () => !!vs && typeof vs.me === 'string' && vs.me.slice(0, 2) === 'cu';
const CU_GAME = [];      // the fighters of the match: 3 = Sukuna, 4 = Ryu (sukuna.js and ryu.js fill them when their pictures are cut): { name, frames: 64 x 64 canvases, ... }
function cuSelRefresh() {      // the select screen opens: the hitbox pictures are measured again, and Sukuna's card is open once he is bought
  HB_C.clear();
  { const sk = document.querySelector('#select [data-who="cu3"]'); if (sk) { const has = suHas(); sk.disabled = !has; sk.querySelector('i').textContent = has ? 'FREE PLAY' : 'LOCKED: $3000 IN SKILLS'; } }      // (v1.131 Sukuna's card is open once he is bought in SKILLS > CHARACTERS)
}
// ---- v1.85 HITBOXES: a custom fighter is measured on its own drawings, like everyone (see HB_TIP in the engine): its body is its idle pictures (the widest every row gets), the limb of an IMPACT is the picture it lands on and the next one, a shot is its drawing; a row of a drawing sits on the row (picture row - 1) of the tables because a custom picture is drawn 61 px above the floor line
function cuSpan(art, key) {      // the rows of a drawing: { row: [farthest pixel behind its middle column, farthest in front of it] }
  const o = {}; for (let r = 0; r < 64; r++) { let lo = 99, hi = -99; for (let c = 0; c < 64; c++) if (art[r * 64 + c]) { if (c < lo) lo = c; if (c > hi) hi = c; } if (hi >= 0) o[key(r)] = [lo - 32, hi - 32]; } return o;
}
function cuWiden(list) { const o = {}; for (const sp of list) for (const r in sp) { const q = o[r]; o[r] = q ? [Math.min(q[0], sp[r][0]), Math.max(q[1], sp[r][1])] : sp[r].slice(); } return o; }      // (several drawings: how far behind and in front each row ever gets)
function cuMaxRows(list) { const o = {}; for (const t of list) if (t) for (const r in t) if (o[r] === undefined || t[r] > o[r]) o[r] = t[r]; return o; }      // (several limbs: the farthest each row ever reaches)
const cuHbBody = who => { const G = CU_GAME[+who.slice(2)]; return G && G.body; }, cuTipAll = (who, k) => { const G = CU_GAME[+who.slice(2)]; return G && G.tipAll && G.tipAll[k]; }, cuHbPush = who => { const G = CU_GAME[+who.slice(2)]; return G ? G.push : 5; };
window.__cuShots = () => cuShots.map(s => ({ x: s.x - wx, born: s.born }));      // test hook
function cuShotShape(s, now) {      // the pixels of a shot in the world, row by row (its picture changes every 80 ms, as drawn)
  const sp = s.sp[Math.floor(now / 80) % s.sp.length], o = {}; if (sp) for (const r in sp) o[r] = [s.x + sp[r][0], s.x + sp[r][1] + 1]; return o;
}
const cuIdleCv = (who, now) => { const g = CU_GAME[+who.slice(2)]; return g ? g.frames[Math.floor(now / (1000 / IDLE_FPS)) % g.frames.length] : null; };
const CU_HU_MS = 60, CU_KO_FPS = 12;      // one picture of the HURT lasts 60 ms; the KO plays at 12 a second and its last picture stays
const CU_CR_MS = 70;      // one picture of the CROUCH lasts 70 ms (4 pictures = 0.28 s down, the same back up)
const CU_REACH = 36;      // how far in front of its hips an IMPACT reaches when the enemy's body is not known (v1.85: otherwise the limb as drawn on the IMPACT's picture against his body as drawn, see cuMeasure)
function cuHit(dmg, now, o, ax, rc, lo) {      // an IMPACT (or a shot) of a custom punch: the enemy takes exactly dmg when he is in front of the fighter (ax, default you), within arm's reach (rc) and can be touched (the rules of the others' punches: not the smiley form, not folded up, on the floor, flat or dodging; a blocker blocks it unless GUARD BREAK); o = what the blocks under it ask for (knock, stun, launch, gb, bleed [damage, seconds]); true when it landed
  o = o || {}; dmg = o.free ? 0 : Math.max(1, Math.round(dmg * cuS.dm / 100));      // (the DAMAGE stat; v1.109 o.free: a hit that takes no health, the slash of Sukuna's counter)
  if (!dummy || dummy.ko >= 0 || dummy.cap || now - dummy.born < 600 || vs.ph !== 'fight') return false;
  if (dummy.vform && dummy.vform !== 'verity') { say('IMMUNE', dummy.x, '#ffe9a0', 8, now); return false; }
  if ((!o.low && dummy.vact && dummy.vact.type === 'crouch') || now < (dummy.down || 0) || (dummy.cact && dummy.cact.flat) || now < (dummy.dodgeUntil || 0)) { say('MISS', dummy.x, '#9fd8ff', 8, now); return false; }
  const gap = dummy.x - (ax === undefined ? wx : ax); if (gap > (rc === undefined ? CU_REACH : rc) || gap < (lo === undefined ? -3 : lo)) return false;
  const blk = dBlocks() && gap > 0 && now - dummy.rxAt >= RX_DUR[dummy.rx];
  if (blk && !o.gb) { dummy.counter = now; dummy.vx += 3; shakeUntil = now + 70; shakeAmp = 1; say('BLOCKED', dummy.x, '#9fd8ff', 8, now); snd('block'); return false; }
  if (now > hits.until) { hits.n = 0; hits.dmg = 0; hits.seq = 0; } hits.n++; hits.dmg += dmg; hits.until = now + COMBO_WIN; hits.last = now; hits.bonus = 0; vs.bestCmb = Math.max(vs.bestCmb | 0, hits.n);      // (the combo counter counts it)
  dummy.hp = Math.max(0, dummy.hp - dmg); dummy.hitAt = now; dummy.vx += o.knock ? o.knock * 6 : Math.min(120, 9 + dmg * 2); shakeUntil = now + 110; shakeAmp = dmg >= 20 ? 4 : 2; if (!airUp(dummy)) { dummy.rx = o.rx !== undefined ? o.rx : (Math.random() * 10) | 0; dummy.rxAt = now; }
  if (dmg) say('' + dmg, dummy.x, popCol(), 8, now); spark(dummy.x - (o.sy ? 4 : 0), gy - (o.sy || 26), dmg >= 20 ? 12 : 7, ['#ffffff', '#ffe9a0', '#7fc4ff'], dmg >= 20, 1); snd('smack', dmg >= 20 ? 3 : dmg >= 10 ? 1 : 0);
  if (blk) say('GUARD BREAK', dummy.x, '#ffd34d', 8, now + 90);
  if (o.stun) cuStun(o.stun, now);
  if (o.launch && (!dummy.air || dummy.air.kind === 'bounce')) { dummy.air = airMake(now, 0, Math.sqrt(2 * AIR_G * o.launch), AIR_G, 'up'); dummy.rx = AIR_RX; dummy.rxAt = now; }      // (thrown up like the UPPERCUT: o.launch px high at the top)
  if (o.bleed) cuBleed = { who: dummy, until: now + o.bleed[1] * 1000, next: now + 1000, d: o.bleed[0] };
  if (dummy.hp <= 0) koDummy(now);
  return true;
}
function cuStun(sec, now, quiet) {      // the enemy is frozen for sec seconds (frozen as long as he is stunned, like the free counter's STUN); quiet = no "STUN" and no sound (the later slashes of Sukuna's CUT STORM)
  const ms = sec * 1000; dummy.stunUntil = Math.max(dummy.stunUntil || 0, now + ms); if (dummy.mode === 'fighter' && !dummy.cact && !dummy.vact) { dummy.ai = 'rest'; dummy.aiAt = now; dummy.restFor = ms; dummy.chain = 0; dummy.hitDone = true; }
  if (!quiet) { say('STUN', dummy.x, '#59b8ff', 8, now + 60); snd('stun'); }
}
function cuBleedStep(now) {      // BLEED: every second of its time he loses its damage
  const B = cuBleed; if (!B) return; if (B.who !== dummy || dummy.ko >= 0 || vs.ph !== 'fight') { cuBleed = null; return; }
  while (B.next <= B.until && now >= B.next) { B.next += 1000; dummy.hp = Math.max(0, dummy.hp - B.d); say('' + B.d, dummy.x, '#ff3a4a', 8, now); if (dummy.hp <= 0) { koDummy(now); cuBleed = null; return; } }
  if (now >= B.until) cuBleed = null;
}
function cuFx(fx, now, hit, vf) {      // the effects of an impact or of a picture: VFX, SOUND, SHAKE and HIT STOP (hit: the impact landed)
  for (const [t, a] of fx) {
    if (t === 'x') { if (vf.length) cuVfx.push({ fr: vf, pre: a, at: now, hit, x0: wx, ex: dummy ? dummy.x : wx + 40 }); }
    else if (t === 'w') { shakeAmp = now < shakeUntil ? Math.max(shakeAmp, a) : a; shakeUntil = Math.max(shakeUntil, now + 200); }
    else if (t === 'h') hitStop(a);
    else if (t === 'd' && dummy && dummy.ko < 0) { dummy.air = null; dummy.airH = 0; dummy.rx = 4; dummy.rxAt = now; dummy.down = now + RX_DUR[4]; dummy.stunUntil = Math.max(dummy.stunUntil || 0, now + RX_DUR[4] + 200); }      // (v1.143 'd' = a SWEEP or a SLAM: he is put on the floor for as long as the fall lasts, like Yuji's)
  }
}
const cuOk = (c, src, res) => !c || (src >= 0 && res[src] !== undefined && res[src] === (c === 1));      // an IF: 1 = IF HIT, 2 = IF MISS, about the IMPACT src once it has come (before that neither is true)
const cuMods = 'ktlqbry';      // the blocks that change the hit itself (v1.164 r = which of the enemy's ten hit reactions he plays, y = how high above the floor the blow lands: where the sparks are)
function cuEv(e, now, g, k) {      // one event of the punch's timeline comes up
  const res = cuRes, vk = e.vk === undefined ? k : e.vk, vf = g.vfx[vk]; if (!cuOk(e.c, e.src, res)) return;
  if (e.cb) { e.cb(now, g, k); return; }      // (v1.111 a callback: a slash of Sukuna's BLUE moves, see suCutAt in sukuna.js)
  if (e.k === 'e') { cuFx(e.fx.filter(x => cuOk(x[3], x[4], res)), now, false, vf); return; }
  const o = {}; if (e.low) o.low = true;      // (v1.110 low: the crouch punches of a built-in fighter reach a crouching enemy)
  for (const [t, a, b, c, s] of e.fx) {
    if (cuMods.indexOf(t) < 0) continue;
    if (c && !(s === e.id ? c === 1 : cuOk(c, s, res))) continue;      // (a change of the hit under IF HIT of its own IMPACT counts, under IF MISS never)
    if (t === 'k') o.knock = a; else if (t === 't') o.stun = a; else if (t === 'l') o.launch = a; else if (t === 'q') o.gb = true; else if (t === 'b') o.bleed = [a, b]; else if (t === 'r') o.rx = a; else if (t === 'y') o.sy = a;
  }
  if (e.k === 'o') { if (vf.length) cuShots.push({ x: wx + 12, v: typeof e.sp === 'function' ? e.sp() : e.sp, d: e.d, o, fx: e.fx, res, id: e.id, born: now, vf, sp: g.vxs[vk], ms: e.ms }); return; }      // (SHOOT: a shot leaves your body at the fist's height; it hits an enemy as close as he can stand; its blocks work when it hits)
  const T = hbKey(dummy), B = hbBody(T); if (dummy) hbMark(vs.me, 0, wx, false, T, dummy.x, dummy.x - wx > -4, e.tip || {}); const hit = cuHit(e.d, now, o, undefined, e.tip && B ? hbGap(e.tip, B, e.dy) : undefined); res[e.id] = hit;      // (the limb of this IMPACT against the enemy's body: the rows they share decide how far it reaches)
  cuFx(e.fx.filter(x => cuMods.indexOf(x[0]) < 0 && cuOk(x[3], x[4], res)), now, hit, vf);
}
function cuShotStep(now, dt) {      // the shots fly on; the first time one touches the enemy it hurts him and is gone
  cuShots = cuShots.filter(s => {
    s.x += s.v * dt; if (now - s.born > (s.ms || 3000) || s.x - wx > VW) return false;      // (v1.110 ms: a shot that flies for less than 3 s, Sukuna's slashes for 0.6 s)
    if (dummy && dummy.ko < 0 && hbTouchFoe(cuShotShape(s, now), dummy)) { const hit = cuHit(s.d, now, s.o, s.x, 1e9, -1e9);      // (its drawing against his body: the rows they share)
       s.res[s.id] = hit; if (hit) cuFx(s.fx.filter(x => cuMods.indexOf(x[0]) < 0 && cuOk(x[3], x[4], s.res)), now, true, s.vf); return false; }
    return true;
  });
}
function cuDrawShots(now, cx) { for (const s of cuShots) ctx.drawImage(s.vf[Math.floor(now / 80) % s.vf.length], Math.round(cx + s.x - wx - 32), gy - 62, 64, 64); }
function cuPunch(g, now, dt) {      // the punch being thrown: its time ap (0 to 1, -1 = none), the LUNGE, and every event of its timeline when its picture comes up; it ends after the last picture
  if (cuAtkAt < 0 || !g || g.cs) return -1;      // (the counter of a built-in fighter, g.cs, is played by suStep)
  const n = g.atk[cuAtkK].length, ap = (now - cuAtkAt) / (n * cuMs), fi = ap >= 1 ? n : Math.floor(ap * n) + 1, ev = g.ev[cuAtkK], lg = g.set[cuAtkK].m;
  if (lg) { const st = g.set[cuAtkK], u = Math.min(1, ap / (st.lt || 1)), tg = lg * (st.e ? 1 - (1 - u) * (1 - u) : u); if (g.ry && lg > 0 && tg < cuLunged) { /* v1.164 Ryu skipped part of the step (see ryMagnet): it waits until the blow's own step has caught up, he never goes back */ } else { wx += tg - cuLunged; cuLunged = tg; } }      // (v1.163 e: the step is fast at first and slows down, lt: it is over after that part of the blow, Ryu's BLUE moves)
  if (g.ry) ryMagnet(g, ap, dt);      // (v1.164 Ryu closes in on the enemy before a blow lands, so that the fist or foot touches him)
  for (let j = 0; j < ev.length; j++) if (!cuFired[j] && ev[j].f <= fi) { cuFired[j] = 1; cuEv(ev[j], now, g, cuAtkK); }
  if (ap >= 1) { cuAtkAt = -1; cuCmbBy = now + 700; return -1; }
  return ap;
}
const CU_FXD = [300, 450, 300, 400, 450];      // how long each VFX preset plays (ms), the pictures spread over it
function cuDrawVfx(now, cx) {      // the VFX of the impacts: preset 1 on the enemy, 2 on him twice as big, 3 on the fighter's fist, 4 on the floor under him (1.5 times), 5 flying from the fist to him (or 80 px ahead); an enemy the impact did not reach gets presets 1, 2 and 4 on the fist instead; the last part fades
  cuVfx = cuVfx.filter(v => now - v.at < CU_FXD[v.pre - 1]);
  for (const v of cuVfx) {
    const u = (now - v.at) / CU_FXD[v.pre - 1], img = v.fr[Math.min(v.fr.length - 1, Math.floor(u * v.fr.length))], fist = v.x0 + 26, k = v.pre === 2 ? 2 : v.pre === 4 ? 1.5 : 1;
    let X = v.pre === 3 || (!v.hit && v.pre !== 5) ? fist : v.ex - 4; if (v.pre === 5) X = fist + (v.hit ? v.ex - 4 - fist : 80) * (1 - Math.pow(1 - u, 2));
    const Y = v.pre === 4 && v.hit ? gy + 2 - 32 * k : gy - 30; ctx.globalAlpha = u > 0.7 ? (1 - u) / 0.3 : 1; ctx.drawImage(img, Math.round(cx + X - wx - 32 * k), Math.round(Y - 32 * k), 64 * k, 64 * k); ctx.globalAlpha = 1;
  }
}
function customScene(now, dt) {      // one frame of a match with a CUSTOM character as the player: it stands on its idle frames, walks on its walking frames, crouches, dashes, blocks, is hurt and knocked out, jumps on its jump frames and plays its punches when ATTACK is pressed (the IMPACT blocks of its CODE hurt the enemy; the other moves are not there yet; v1.108: a built-in fighter can move like Yuji: g.yu, g.wf, g.crMs and g.cwk, see sukuna.js); the enemy, the HUD and the effects are the shared ones
  const el = Math.max(0, now - spawnAt), t = Math.min(1, el / 900), e = 1 - Math.pow(1 - t, 3), cx = Math.round(VW / 2), g = CU_GAME[+vs.me.slice(2)]; setDomUI(now);
  if (g) cuS = g.st;
  const hs = g && g.hus ? g.hus[hurtK] : null, hu = hs ? hs.f : g ? g.hu : [], hn = hu.length, hf = hn && hurtAt >= 0 ? Math.floor((now - hurtAt) / (hs ? hs.ms : (g && g.huMs) || CU_HU_MS)) : -1, hurting = hf >= 0 && hf < hn && !(g && g.yu && g.cs), kod = vs.ph === 'ko' && vs.who === 'enemy' && !!g && g.ko.length > 0;      // (HURT: when the enemy's blow lands its pictures play and it cannot act meanwhile, a punch, dash or block in progress is dropped; KO: when its health runs out the KO pictures play once, the last stays)
  const ctl = t >= 1 && now >= pStun && vs.ph === 'fight' && !hurting, jmp = jumpReq, atk = atkReq, crq = crReq, dsh = dashReq, lpr = lpReq; jumpReq = atkReq = crReq = dashReq = false; if (suFgOn() && (jmp || atk || crq || dsh || lpr || ceReq || domReq)) suFgSkip(now);      // (v1.127 a button pressed during the FUGA cutscene skips it) (it answers the buttons only when it is there, not stunned and in the FIGHT)
  if (t < 1) { stance = 'stand'; stickCr = false; cuJumpAt = cuAtkAt = -1; cuCmb = 0; cuCmbBy = 0; cuFired = []; cuRes = []; cuShots = []; cuVfx = []; cuBleed = null; cuCd = [0, 0, 0, 0]; cuDash = null; cuDashReady = 0; blkAt = blkEnd = -1; cuAtkQ = cuLpQ = 0; if (g) g.cs = null; suReset(); if (g && g.ry) ryReset(); }
  if (ceReq && ctl && g && g.blue) suToggle(); else if (ceReq && ctl && g && g.ry) ryToggle(now);      // (v1.119 MODE of a built-in fighter: Sukuna's CLEAVE on / off, in silence, see sukuna.js; the press is dropped at the end of this scene like the other buttons)
  if (domReq && ctl && g && g.blue) suDomTry(now);      // (v1.124 the DOMAIN button of a built-in fighter is his ULTIMATE: Sukuna's Malevolent Shrine, see sukuna.js; read here, the press is dropped at the end of this scene)
  if (hurting && (cuAtkAt >= 0 || cuDash || blkAt >= 0)) { cuAtkAt = -1; cuDash = null; blkAt = blkEnd = -1; cuLunged = 0; if (g) g.cs = null; }
  if (jmp && ctl && g && g.jump.length && stance === 'stand' && cuJumpAt < 0 && cuAtkAt < 0 && !cuDash && blkAt < 0) { cuJumpAt = now; cuJumpC = false; snd('jump'); }
  else if (jmp && ctl && g && g.cj && g.jump.length && stance === 'crouch' && cuJumpAt < 0 && cuAtkAt < 0 && !cuDash && blkAt < 0 && !g.cs) { cuJumpAt = now; cuJumpC = true; stance = 'stand'; stickCr = false; snd('jump'); }      // (v1.154 CROUCH JUMP of a built-in fighter: from a crouch he springs up (the spring pictures g.cj, 250 ms), then the jump goes on a little higher than a standing one: Yuji's own crouch jump)
  if (atk && g && g.ry && cuJumpAt >= 0 && cuAtkAt < 0 && jumpFrame(Math.max(0, now - cuJumpAt)) < 4) cuAtkQ = now + 300;      // (v1.143 Ryu: JUMP and ATTACK pressed together: the press is kept through the push-off and the DOWNSLAM starts as soon as he is in the air)
  if (atk && g && (g.yu || g.ry) && cuAtkAt >= 0 && !g.cs) cuAtkQ = now + 450;      // (v1.109: a press while a blow is being thrown is kept for 0.45 s and starts the next blow as soon as this one is over)
  if ((atk || (cuAtkQ > now && cuAtkAt < 0)) && ctl && g && g.rdy.length && (stance === 'stand' || ((g.yu || g.ry) && stance === 'crouch')) && (cuJumpAt < 0 || (g.ry && ryAir(now))) && cuAtkAt < 0 && !cuDash && blkAt < 0) {      // (ATTACK: the next of its ready punches plays once, if its COOLDOWN is over and its COST can be paid; 20 pictures a second unless SPEED says otherwise; the combo goes on for 0.7 s after a punch)
    cuAtkQ = 0; if (now > cuCmbBy) { cuCmb = 0; cuSn = 0; cuCp = 0; } const k = g.yu ? suPick(g, now) : g.ry ? ryPick(g, now) : g.rdy[cuCmb % g.rdy.length], st = g.set[k];      // (a built-in fighter picks by where he stands and where the enemy is: suPick)
    if (now < cuCd[k]) say('WAIT', wx, '#9a9aa8', 8, now);
    else if (g.yu && k === 3) suStart(g, now);      // (the 4th blow of a built-in fighter is his COUNTER: see suStart in sukuna.js)
    else if (!st.c || ceSpend(st.c * 100 / cuS.em, now)) { cuAtkK = k; cuAtkAt = now; cuFired = []; cuRes = []; cuLunged = 0; cuMs = 1000 / st.v; cuCd[k] = st.d ? now + st.d * 1000 : 0; cuCmbBy = now + 1e9; cuCmb = g.yu ? suNext(k) : g.ry ? ryNext(k) : (cuCmb + 1) % g.rdy.length; snd('swing', k); }
  }
  const bk = g && g.blue ? suBlue(now) : -1; if (lpr && ctl && g && g.blue && bk < 0 && suBlueLocked(now)) lockPop(now);      // (v1.131 a BLUE move he has not bought: LOCKED)
       // (v1.112 the BLUE move this stance asks for: standing the AIR CUT or, holding back, the CUT STORM; crouched the LEG CUT; in the air DISMANTLE; -1 = none)
  if (lpr && g && g.blue && cuAtkAt >= 0 && !g.cs) cuLpQ = now + 300;      // (v1.111: a BLUE press while a blow is being thrown is kept for 0.3 s)
  if ((lpr || (cuLpQ > now && cuAtkAt < 0)) && ctl && bk >= 0 && cuAtkAt < 0 && !cuDash && blkAt < 0 && !g.cs) {      // (BLUE of a built-in fighter: his own move, see suBlue in sukuna.js; it is paid for and played like a blow)
    cuLpQ = 0; const st = g.set[bk];
    if (suBlueOk(bk, now) && (!st.c || ceSpend(st.c * 100 / cuS.em, now))) { cuAtkK = bk; cuAtkAt = now; cuFired = []; cuRes = []; cuLunged = 0; cuMs = 1000 / st.v; cuCmb = cuSn = cuCp = 0; cuCmbBy = now + 1e9; suBlueStart(bk, now); snd('swing', bk); }
  }
  if (g && g.ry) ryBlueStep(g, now, ctl, lpr, dsh);      // (v1.163 Ryu's BLUE moves and the DASH KICK, see ryu.js; before the dash, which a kick that has just started takes the place of)
  if (dsh && ctl && g && stance === 'stand' && cuJumpAt < 0 && cuAtkAt < 0 && !cuDash && blkAt < 0 && now > cuDashReady && (g.df.length || g.db.length)) {      // (DASH: holding forward is a front dash, anything else a back dash, like the others; the pictures of that dash, or the other dash's pictures backwards; free, a 0.15 s pause after it, and his blows miss you for the first part)
    const d = (keyR || padR) ? 1 : -1, fr = d > 0 ? (g.df.length ? g.df : g.db.slice().reverse()) : (g.db.length ? g.db : g.df.slice().reverse());
    cuDash = { at: now, dur: cuS.dtm, len: d * (d > 0 ? cuS.dfw : cuS.dbk), done: 0, fr }; dgK = d > 0 ? 0 : 1; snd('dash', dgK); puff(wx - d * 5, 5);
  }
  let dp = -1; if (cuDash) { dp = (now - cuDash.at) / cuDash.dur; const tg = cuDash.len * (1 - Math.pow(1 - Math.min(1, dp), 2)); wx += tg - cuDash.done; cuDash.done = tg; if (dp >= 1) { cuDash = null; dp = -1; cuDashReady = now + 150; if (g && g.ry) ryDashEnd(now); } }
  const canBlk = ctl && !!g && g.bl.length > 0 && stance === 'stand' && cuJumpAt < 0 && cuAtkAt < 0 && !cuDash;      // (BLOCK: hold the button; the pictures of BLOCK play at 24 a second and the last one holds; hits from the front bounce off as for the others, a block raised just before a blow is a PARRY (PARRY TIME); you walk at a third of the speed while blocking; nothing else starts while it is up)
  if (blockHeld && canBlk && blkAt < 0) { blkAt = now; blkEnd = -1; } else if (blkAt >= 0 && (!blockHeld || !canBlk)) { blkAt = -1; blkEnd = -1; }
  const hasCr = !!g && g.cr.length > 0; let cf = -1;      // (CROUCH: S, the down arrow or C taps down and up again, the stick's down position crouches while it is held, like the other fighters; the pictures of CROUCH play down and the same ones backwards to get up, in between CROUCH IDLE loops; it costs 3% of the energy and needs the CROUCH drawn; no jumping or punching while down)
  if (!hasCr || t < 1) { stance = 'stand'; stickCr = false; }
  else {
    if (ctl && cuJumpAt < 0 && cuAtkAt < 0 && !cuDash && blkAt < 0) {
      if (crq) { if (stance === 'stand') { stance = 'down'; stAt = now; } else if (stance === 'crouch') { stance = 'up'; stAt = now; } }
      if (stickDown && stance === 'stand') { stance = 'down'; stAt = now; stickCr = true; }
      else if (!stickDown && stickCr && stance === 'crouch' && now - stickDownEnd > 140) { stance = 'up'; stAt = now; }
    }
    if (stance === 'down' || stance === 'up') { const k = Math.floor((now - stAt) / (g.crMs || CU_CR_MS)); if (k >= g.cr.length) stance = stance === 'down' ? 'crouch' : 'stand'; else cf = stance === 'down' ? k : g.cr.length - 1 - k; }
    if (stance === 'stand') stickCr = false;
  }
  const ap = cuPunch(g, now, dt); cuShotStep(now, dt); if (g && g.blue) suFlStepArrows(now, dt); cuBleedStep(now); ceTick(now, dt); const sp = g && g.yu ? suStep(g, now) : null; if (g && g.yu) suBleedFx(now);      // (v1.109 sp: the picture of the counter's dodge and slash, or nothing)
  if (g && g.blue) { suBlueLabel(now); suModeUI(); suUltUI(now); } else if (g && g.ry) ryBlueLabel(now);
  { const lab = g && g.cs && !g.cs.air && !g.cs.dash && !g.cs.cl && !g.cs.fl && !g.cs.dom ? 'COUNTER' : g && g.yu ? suLabel(g, now) : g && g.ry ? ryLabel(g, now) : g && g.rdy.length ? g.an[g.rdy[(now > cuCmbBy ? 0 : cuCmb) % g.rdy.length]] : 'ATTACK'; if (lab !== lastLabel) { lastLabel = lab; $('atkl').textContent = lab; } }      // (the ATTACK button shows the name of the punch that comes next)
  let jp = -1, lift = 0, jfr = -1; if (cuJumpAt >= 0) {      // (JUMP: the jump frames play once over JUMP TIME while it rises JUMP HEIGHT pixels and comes down; v1.108: a fighter with `yu` jumps as Yuji does, with his timing and his height for every picture, and the dust of his push-off and landing)
    if (g && (g.yu || g.ry)) { jfr = jumpFrame(Math.max(0, now - cuJumpAt)); if (jfr >= g.jump.length) { cuJumpAt = -1; jfr = -1; snd('land', 1); if (g.ry) ryLand(now); } else { jp = (jfr + 0.5) / g.jump.length; lift = (cuJumpC && g.cj ? YU.cjump : YU.jump).lift[jfr]; jumpDust(jfr); } }
    else { jp = (now - cuJumpAt) / cuS.jt; if (jp >= 1) { cuJumpAt = -1; jp = -1; snd('land', 1); } else lift = Math.round(cuS.jh * 4 * jp * (1 - jp)); }
  }
  if (ap >= 0 && g.al && g.al[cuAtkK]) lift = g.al[cuAtkK][Math.min(g.al[cuAtkK].length - 1, Math.floor(ap * g.al[cuAtkK].length))];      // (v1.109: a blow that hops, with its own height for every picture)
  if (g && g.cs && g.cs.lift !== undefined) lift = g.cs.lift;      // (v1.119 the DIVE CLEAVE: his height is the state's)
  gojoLift = lift;
  const can = (stance === 'crouch' ? hasCr : stance === 'stand' && !!g && g.walk.length > 0) && ctl && cuAtkAt < 0 && !cuDash && (jfr < 0 || (jfr >= 3 && jfr <= 11)), dir = can ? ((keyR || padR) ? 1 : 0) - ((keyL || padL) ? 1 : 0) : 0;      // (the only thing it can do: walk, when it has walking frames)
  jumpReq = atkReq = crReq = lpReq = dashReq = ceReq = domReq = senseReq = false; atkHold = -1; teleAt = -1; gojoGone = false; atkAt = jumpAt = -1; dgAt = cuDash ? cuDash.at : -1; mode = 'idle';      // (it cannot attack or block yet; gojoLift, set above, makes the enemy's swings miss while it is high in the air)
  if (hurtAt >= 0 && now - hurtAt > 700) { hurtAt = -1; hurtEnd = now; }
  { const v = dir * (dir > 0 ? cuS.fw : cuS.bk) * (stance === 'crouch' ? cuS.cw / 100 : 1) * (blkAt >= 0 ? 0.3 : 1); wx += (g && (g.yu || g.ry) ? walkVel(v, dt, jfr >= 0 && jfr <= 11) : v * goreSpd()) * dt; } cuPh = dir ? cuPh + dir * dt * ((g && g.wf) || 12) : 0; if (g && g.ry) ryStep(now, dir); playerSlide(dt); if (!(g && g.cs && (g.cs.dash || g.cs.cl || g.cs.fat))) physCollide(now, dt);      // (the DASH SLASH passes through the enemy and the CLEAVE moves put him exactly where they need him: the bodies are not solid for them)
  ctx.save(); shkX = shkY = 0; if (now < shakeUntil && !SET.lite) { shkX = Math.round((Math.random() * 2 - 1) * shakeAmp); shkY = Math.round((Math.random() * 2 - 1) * shakeAmp); ctx.translate(shkX, shkY); }
  ctx.imageSmoothingEnabled = false; const fgc = g && g.blue ? suFgCam(now) : null; if (fgc) suFgCamBegin(fgc); const dk = g && g.blue ? suDomCover(now) : 0; if (dk < 1) drawBackdrop(now); if (g && g.blue) suDomBack(now, cx, dt); drawSmoke(now, dt); drawBloodFloor(now, dt); drawFoes(now, dt); updatePeds(now, dt); if (!dk) drawPeds(now, dt, 0); if (fgc) suFgBack(now, cx);      // (v1.125 / v1.126 THE ORDER, back to front: the ground (the map, drawn by drawBackdrop), then Sukuna's picture (the face of the sign, then the domain: suDomBack), then everything else: the smoke and the blood on the floor, the enemy and what he throws, Sukuna, his effects, the slashes and sparks, the health bars. While the face or the domain covers the whole screen the map is not drawn at all (it would be hidden), and the passers-by are not drawn while the picture shows: only the two fighters and their effects)
  const sdx = g && g.blue ? suFatDx() : 0, af = ap >= 0 ? g.atk[cuAtkK] : null, src = !g ? null : kod && now >= vs.koAt ? g.ko[Math.min(g.ko.length - 1, Math.floor((now - vs.koAt) * CU_KO_FPS / 1000))] : hurting ? hu[hf] : sp ? sp : af ? af[Math.min(af.length - 1, Math.floor(ap * af.length))] : dp >= 0 ? cuDash.fr[Math.min(cuDash.fr.length - 1, Math.floor(dp * cuDash.fr.length))] : blkAt >= 0 && g.bl.length ? g.bl[Math.min(g.bl.length - 1, Math.floor((now - blkAt) * BLK_FPS / 1000))] : cf >= 0 ? g.cr[cf] : stance === 'crouch' ? (dir && g.cwk ? g.cwk[((Math.floor(cuPh) % g.cwk.length) + g.cwk.length) % g.cwk.length] : g.ci.length ? g.ci[Math.floor(el / (1000 / IDLE_FPS)) % g.ci.length] : g.cr[g.cr.length - 1]) : jp >= 0 ? (cuJumpC && g.cj && now - cuJumpAt < YJ_T.spring ? g.cj[Math.min(g.cj.length - 1, Math.floor((now - cuJumpAt) * g.cj.length / YJ_T.spring))] : g.jump[Math.min(g.jump.length - 1, Math.floor(jp * g.jump.length))]) : dir ? (g.wbk && dir < 0 ? g.wbk[((Math.floor(-cuPh) % g.wbk.length) + g.wbk.length) % g.wbk.length] : g.walk[((Math.floor(cuPh) % g.walk.length) + g.walk.length) % g.walk.length]) : g.frames[Math.floor(el / (1000 / IDLE_FPS)) % g.frames.length], x = cx - 32 + sdx, y = gy - 61 - lift + goreBob('p', now), ry = Math.round(64 * (1 - e));
  { const sw = Math.max(5, Math.round(9 * (1 - lift / 70))), sv = Math.round(sw * 2 / 3); ctx.fillStyle = 'rgba(0,0,0,0.4)'; ctx.fillRect(cx + sdx - sw, gy + 3, sw * 2, 2); ctx.fillRect(cx + sdx - sv, gy + 2, sv * 2, 1); ctx.fillRect(cx + sdx - sv, gy + 5, sv * 2, 1); }
  if (g && g.cs && (g.cs.dash || g.cs.cl === 'dash')) suGhostDraw(now, x, y);      // (the afterimages and speed lines of the DASH SLASH and the DASH CLEAVE, behind him)
  if (src) { const gsrc = gdActive('p') ? goreSrc('p', src, (px, py) => ({ x: wx + (x + px - cx), y: y + py - gy })) : src; ctx.save(); ctx.beginPath(); ctx.rect(x, y + ry, 64, 64 - ry); ctx.clip(); ctx.globalAlpha = Math.min(1, t * 2); ctx.drawImage(gsrc, x, y); if (hurtAt >= 0 && now - hurtAt < 70) ctx.drawImage(whiteOf(gsrc), x, y); ctx.restore(); }      // (v1.128 GRAPHIC DAMAGE: without the limbs he has lost)
  drawGiantNow('foe'); cuDrawVfx(now, cx); cuDrawShots(now, cx); if (g && g.ry) ryDraw(now, cx, x, y, src); if (g && g.blue) { suFlDraw(now, cx, x, y); suDomFront(now, cx, x, y, dt); suFgDraw(now, dt, cx, x, y, src); }      // (v1.120 the flames, the slime, the bow, the fire arrows and the burning enemy of the FLAME mode; v1.124 the slashes, flashes and words of the ULTIMATE)
  if (t < 1) { const R = 6 + t * 70; ctx.fillStyle = 'rgba(255,225,110,' + (1 - t) + ')'; for (let a = 0; a < 64; a++) { const th = a / 64 * 6.2832; ctx.fillRect(Math.round(cx + Math.cos(th) * R), Math.round(y + 34 + Math.sin(th) * R * 0.45), 1, 1); } ctx.fillStyle = 'rgba(255,255,255,' + Math.max(0, 0.55 - t * 1.8) + ')'; ctx.fillRect(0, 0, VW, VH); }      // (it appears with a ring and a flash, like the others)
  drawDivFx(now); drawSparks(now, dt); if (!dk) drawPeds(now, dt, 1); drawGibs(now); drawPopups(now); if (fgc) suFgCamEnd(now, shkX, shkY); else drawVs(now, -shkX, -shkY);      // (v1.127 the FUGA cutscene: everything above was seen through its camera; the health bars give way to the black bars)
  ctx.restore();
  if (now < flashUntil) { ctx.fillStyle = 'rgba(190,225,255,' + (flashA * (flashUntil - now) / flashMs) + ')'; ctx.fillRect(0, 0, VW, VH); }
  if (now < blackUntil) { ctx.fillStyle = 'rgba(0,0,0,' + ((blackUntil - now) / 600).toFixed(2) + ')'; ctx.fillRect(0, 0, VW, VH); }
  if (!fgc) drawHits(now);
}
