// ================================================================ v1.219 THE WI-FI FIGHT, EVERYTHING ONLINE (this file is spliced into template.html by build_html.py, after ach.js). The user: "add everything to the wifi anything to it that you need"; asked, he chose ALL IN ONE UPDATE and: Sukuna, Ryu and Iron Man online; every special move; domains, fatalities and the beam clash; the map choice (street or skyscraper); Yuji's INHERITENCE too, "nerfed to the ground". The Wi-Fi fight of v1.115 (the lobby, the two roads, the pictures sent as names, a blow checked on the attacker's screen and decided on the victim's phone) is the base; what is new is here, and the small hooks in template.html, custom.js and the other modules call it.
// ---------------------------------------------------------------- 1. THE PICTURES OF SUKUNA, RYU AND IRON MAN: the other phone cuts the same pictures from the same code, so a picture of the custom engine is named by its place in CU_GAME: "k3.walk.2" is CU_GAME[3].walk[2], "k4.atk.5.7" the 8th picture of Ryu's blow 5, "k5.hus.1.3" the 4th picture of Iron Man's hurt number 1
const NET_CU_KEYS = ['frames', 'walk', 'wbk', 'jump', 'cj', 'hu', 'ko', 'bl', 'df', 'db', 'cr', 'ci', 'cwk'];
function netCuIndex() {      // the pictures get their names (made again when a fight starts: Iron Man's blows are added by ironMoves)
  CU_GAME.forEach((g, slot) => {
    if (!g) return; const tag = (c, p) => { if (c && c.getContext && c.width && !c.__nd) c.__nd = 'k' + slot + '.' + p; };
    for (const key of NET_CU_KEYS) (g[key] || []).forEach((c, i) => tag(c, key + '.' + i));
    (g.atk || []).forEach((a, k) => (a || []).forEach((c, i) => tag(c, 'atk.' + k + '.' + i)));
    (g.hus || []).forEach((h, k) => h && (h.f || []).forEach((c, i) => tag(c, 'hus.' + k + '.' + i)));
  });
}
function netCuPic(d) {      // the picture a name like "k3.atk.4.7" stands for (null when this phone has no such picture)
  const m = d.split('.'), g = CU_GAME[+m[0].slice(1)]; if (!g) return null;
  const two = m[1] === 'atk' || m[1] === 'hus', a = m[1] === 'atk' ? g.atk && g.atk[+m[2]] : m[1] === 'hus' ? g.hus && g.hus[+m[2]] && g.hus[+m[2]].f : g[m[1]];
  return (a && a[+m[two ? 3 : 2]]) || null;
}
for (const w of ['cu3', 'cu4', 'cu5']) NET_KO[w] = () => { const g = CU_GAME[+w.slice(2)], c = g && ((g.ko && g.ko[g.ko.length - 1]) || (g.frames && g.frames[0])); return [c || EMPTY, -32, -63]; };      // (how a beaten Sukuna, Ryu or Iron Man lies: drawRemote plays g.ko picture by picture)
// ---------------------------------------------------------------- 2. A BLOW OF HIS SUKUNA, RYU OR IRON MAN: his phone checks the reach in cuHit (custom.js) and sends Q|damage|knock|stun|launch|guardbreak|bleed damage|bleed seconds|low|free|heavy; my phone applies the rules of the player's own fighter: nothing reaches me in a domain, in a glove or in the invulnerable part of a dash or a counter; a crouched fighter is only reached by a low blow; a raised guard blocks it unless it breaks the guard (a guard raised just before is a PARRY); otherwise it hurts: the damage, the push, the reaction, the stun, the launch, the bleeding. R|q|result|damage answers (m: nothing, b: blocked, h: it hurt)
const nresQ = (r, dm) => lanSend('R|q|' + r + '|' + (dm | 0));
function netCuSend(dmg, o) {      // my blow reaches him (cuHit has checked the reach on my screen): his phone decides what it does
  o = o || {}; const b = o.bleed || [0, 0]; lanSend('Q|' + [dmg, o.knock || 0, o.stun || 0, o.launch || 0, o.gb ? 1 : 0, b[0], b[1], o.low ? 1 : 0, o.free ? 1 : 0, o.launch || dmg >= 20 ? 1 : 0].join('|'));
}
function netCuHit(a, now) {
  const [dmg, knock, stun, launch, gb, bd, bs, low, free, heavy] = a.map(Number);
  if (!vs || !vs.net || vs.ph !== 'fight' || !dummy || !(dmg >= 0) || dummy.twAway) { nresQ('m', 0); return; }      // (dummy.twAway: he is on another floor of the skyscraper)
  if (catGlove(now) || dom || (cuMe() && (suHit(now) || ryUlHit() || irUlHit()))) { nresQ('m', 0); return; }
  if (dgAt >= 0 && now - dgAt < 11 * 1000 / DASH_FPS) { if (now - dgAt < 7 * 1000 / DASH_FPS && now - dodgeAt > 400) { dodgeAt = now; ceGain(E_DODGE); flowAdd(10, now); say('DODGE!', wx, '#9fd8ff', 8, now); } nresQ('m', 0); return; }
  const airMe = !!gAir && gAir.kind === 'up', downed = now < gDownUntil;
  if (airMe ? gojoGone : downed ? (!low || gojoLift > 12 || gojoGone) : (hurtAt >= 0 || now - hurtEnd < 250 || gojoLift > 12 || gojoGone)) { nresQ('m', 0); return; }      // (already reeling, on the floor, teleported away)
  if (stance !== 'stand' && !low) { nresQ('m', 0); return; }      // (crouched: only a low blow reaches him)
  const guardWas = (guardUp(now) || autoGuard()) && dummy.x > wx, kb = knock ? knock * 6 : Math.min(120, 9 + dmg * 2);
  if (guardWas && !gb) {      // (blocked: a guard raised just before the blow is a PARRY)
    if (blkAt >= 0 && now - blkAt <= (cuMe() ? cuS.pt : PARRY_MS) * paceBase() * (assistLvl() >= 1 ? 2 : 1)) { parryHit(now); nresQ('b', 0); return; }
    wxv -= kb * 0.3 * pScale(); shakeUntil = now + 80; shakeAmp = 1; buzz(8); say('BLOCKED', wx + 14, '#9fd8ff', 8, now); snd('block'); nresQ('b', 0); return;
  }
  hurtK = launch ? AIR_RX : heavy ? 4 : (Math.random() * 10) | 0; hurtAt = now; if (launch && (!gAir || gAir.kind === 'bounce')) gAir = airMake(now, 0, Math.sqrt(2 * AIR_G * launch), AIR_G, 'up');
  atkAt = -1; atkQ = false; jumpAt = teleAt = -1; stance = 'stand'; lpAt = -1; dash = null; mbAt = -1; mbPending = false; ride = null; dgAt = -1; blkAt = -1; blkEnd = -1; wxv -= kb * 0.9 * pScale(); shockAt(wx, 90, 45, 0.5); shakeUntil = now + 120; shakeAmp = heavy ? 4 : 2; if (heavy && !launch) gDownUntil = now + RX_DUR[4];
  if (stun) pStun = Math.max(pStun, now + stun * 1000); if (bd && bs && !dotOnP(now)) vs.bleed = { until: now + bs * 1000, next: now + 1000, gap: 1000, dm: bd };
  const dm = free ? 0 : Math.max(1, Math.round(dmg)); if (dm) say('' + dm, wx, '#ff9a5a', 8, now); if (vs.ph === 'fight') vsHurt(dm, now);
  snd('hurt', hurtK); nresQ('h', dm); onHurt(-1, dm, now);
}
function netResultQ(r, dm, now) {      // R|q: what my blow did on his phone: the numbers, the sparks, the combo
  if (!vs || !vs.net || !dummy || vs.ph !== 'fight') return;
  if (r === 'h') { if (now > hits.until) { hits.n = 0; hits.dmg = 0; hits.seq = 0; } hits.n++; hits.dmg += dm; hits.until = now + COMBO_WIN; hits.last = now; vs.bestCmb = Math.max(vs.bestCmb | 0, hits.n); dummy.hitAt = now; shakeUntil = now + 110; shakeAmp = dm >= 20 ? 4 : 2; if (dm) say('' + dm, dummy.x, popCol(), 8, now); spark(dummy.x, gy - 26, dm >= 20 ? 12 : 7, ['#ffffff', '#ffe9a0', '#7fc4ff'], dm >= 20, 1); snd('smack', dm >= 20 ? 3 : dm >= 10 ? 1 : 0); }
  else if (r === 'b') { shakeUntil = now + 70; shakeAmp = 1; say('BLOCKED', dummy.x, '#9fd8ff', 8, now); snd('block'); }
  else say('MISS', dummy.x, '#9fd8ff', 8, now);
}
// ---------------------------------------------------------------- 3. EVERYTHING ELSE MY MOVES DO TO HIS DUMMY: every special move of every fighter (beams, orbs, cuts, ticks, percent hits...) hurts the dummy on my screen the way it hurts an enemy offline. The dummy is only a picture of the other player, so what happens to it is not kept: every frame netWatch sends the health it lost (D|damage) and the stun and the knock-down it was given (E|s|ms, E|d|ms) to his phone, which applies them with the rules of the player (nothing in a domain, a dash or a counter; a raised guard takes most of it), and puts its health back to what his phone last said. A blow that has its own packet (the numbered swings W|, the custom blows Q|) never reaches this
function netWatch(now) {
  if (vs && vs.netU && now >= vs.netU.until) vs.netU = null;
  const d = dummy; if (!vs || !vs.net || !d || vs.ph !== 'fight') return;
  const rep = d.netHp === undefined ? PHP : d.netHp;
  if (d.hp < rep - 0.01) { const dm = rep - d.hp; d.hp = rep; lanSend('D|' + (Math.round(dm * 10) / 10)); }
  if ((d.stunUntil || 0) > now + 100 && d.stunUntil > (d.netStun || 0) + 120) { lanSend('E|s|' + Math.round(d.stunUntil - now)); d.netStun = d.stunUntil; }
  if ((d.down || 0) > now + 100 && d.down > (d.netDown || 0) + 120) { lanSend('E|d|' + Math.round(d.down - now)); d.netDown = d.down; }
}
function netHurtD(dm, now) {      // D|: health his moves took (a beam's tick, an orb, a percent hit): damage with the player's rules, a flinch only for a big one
  if (!vs || !vs.net || vs.ph !== 'fight' || !(dm > 0) || dm > PHP || (now < (vs.netNeg || 0) && smdIn()) || (dummy && dummy.twAway)) return;      // (netNeg: my SIMPLE DOMAIN negated his last long hold: while its circle stands his health ticks do nothing)
  if (dom || catGlove(now) || gojoGone || (cuMe() && (suHit(now) || ryUlHit() || irUlHit()))) return;
  if (dgAt >= 0 && now - dgAt < 11 * 1000 / DASH_FPS) return;      // (a dash: nothing reaches him)
  if ((guardUp(now) || autoGuard()) && dummy && dummy.x > wx) { dm = dm * 0.15; if (now - (vs.netBlkAt || 0) > 400) { vs.netBlkAt = now; say('BLOCKED', wx + 14, '#9fd8ff', 8, now); snd('block'); } }      // (a raised guard takes most of it)
  else if (dm >= 10 && hurtAt < 0 && now - hurtEnd > 250) { hurtK = (Math.random() * 10) | 0; hurtAt = now; atkAt = -1; atkQ = false; dash = null; blkAt = blkEnd = -1; stance = 'stand'; snd('hurt', hurtK); shakeUntil = now + 100; shakeAmp = 2; }
  if (dm >= 1 && now - (vs.netSayAt || 0) > 120) { vs.netSayAt = now; say('' + Math.round(dm), wx, '#ff9a5a', 8, now); }
  vsHurt(dm, now);
}
const NET_UCOL = { gojo: '2,6,44', yuji: '56,0,8', verity: '0,0,0', cat: '4,34,10', freddy: '38,6,58', cu3: '66,0,6', cu4: '6,26,66', cu5: '70,30,0' };      // (the colour of his ultimate or domain on my screen)
function netTint(ms, now) { vs.netU = { at: vs.netU && now < vs.netU.until ? vs.netU.at : now, until: Math.max(vs.netU ? vs.netU.until : 0, now + ms), col: NET_UCOL[vs.foe] || '0,0,0' }; }      // (the tint of his move: the longest of the ones that run)
function netUSent(ms) { if (vs && vs.net) lanSend('U|' + Math.round(ms)); }      // (my ultimate or domain begins and lasts ms: the other phone tints its screen that long)
function netUIn(ms, now) { if (vs && vs.net && vs.ph === 'fight' && ms > 0 && ms <= 30000 && !dom && !(dummy && dummy.twAway) && !(now < (vs.netNeg || 0) && smdIn())) netTint(ms, now); }
function netUDraw(now) {      // the other phone's ultimate or domain holds me: a dark tint with a lighter middle, fading in and out (his phone plays the real picture, mine only says that it is happening)
  const u = vs && vs.net ? vs.netU : null; if (!u) return; if (now >= u.until || vs.ph !== 'fight') { vs.netU = null; return; }
  const a = Math.min(1, (now - u.at) / 400, (u.until - now) / 400), top = 50, cy = (VH + top) / 2, g = ctx.createRadialGradient(VW / 2, cy, VH * 0.15, VW / 2, cy, VW * 0.62);      // (the bars at the top stay clear)
  g.addColorStop(0, 'rgba(' + u.col + ',' + (0.1 * a).toFixed(3) + ')'); g.addColorStop(1, 'rgba(' + u.col + ',' + (0.72 * a).toFixed(3) + ')'); ctx.fillStyle = g; ctx.fillRect(0, top, VW, VH - top);
}
function netEffectIn(k, ms, now) {      // E|: his move stunned me (s) or put me on the floor (d) for ms
  if (!vs || !vs.net || vs.ph !== 'fight' || !(ms > 0) || ms > 25000 || dom || catGlove(now) || gojoGone || (dummy && dummy.twAway)) return;      // (a domain freezes for up to 21.5 s)
  if (k === 's' && ms >= 1500 && smdBlocks('ult', now)) { vs.netNeg = now + 25000; return; }      // (my SIMPLE DOMAIN is up: his ultimate or domain does nothing, nor does what it does while the circle stands, see netHurtD)
  if (k === 's') { pStun = Math.max(pStun, now + ms); atkAt = -1; atkQ = false; dash = null; blkAt = blkEnd = -1; if (ms >= 1500) netTint(ms, now); }      // (a long hold = one of his ultimates or domains: the screen takes his colour)
  else if (k === 'd' && now >= gDownUntil) { gDownUntil = now + ms; hurtK = 4; hurtAt = now; atkAt = -1; atkQ = false; dash = null; blkAt = blkEnd = -1; stance = 'stand'; }
}
// ---------------------------------------------------------------- 4. THE FATALITY: it is a cutscene that takes over the whole frame, and every fighter has two versions of it, the one he does and the one the enemy does to you (fatGo's rev). When mine starts on his dummy here (the button, the enemy at 20% health or less and close, as offline) G|go tells his phone, which plays the enemy's version of MY fighter on him at once; both scenes end the round the right way round (I win it, he loses it) and the next round starts on both phones
const netFatBusy = () => !!(fat || vf || cf || yf || ff || sr || ryf || irf || suFat);
function netFatSent(was, rev) { if (!rev && !was && vs && vs.net && netFatBusy()) lanSend('G|go'); }      // (called when a fatality of mine has begun)
function netFatIn(now) { if (vs && vs.net && vs.ph === 'fight') vs.netFat = now; }      // (G|go: his fatality on me: it starts as soon as nothing of mine is in the way)
function netFatTake(now) {      // every frame: true once, when the enemy's fatality on me can start now
  if (!vs || !vs.netFat) return false;
  const ok = vs.ph === 'fight' && !netFatBusy() && !fd && !ult && !js && !ryUl && !yu && !ke && !(dom && domLock());
  if (ok || now - vs.netFat > 1200) { vs.netFat = 0; return ok; } return false;
}

// ---------------------------------------------------------------- 5. THE BEAM CLASH (tools/clash.js): when Iron Man's UNIBEAM and Ryu's JUST THIS ONCE go off within a moment of each other, both phones play the clash scene. B|s = my ultimate began (the other phone fills in dummy.fa, which is what the offline code reads to see the enemy's ultimate), B|t|n = my taps so far (cumulative, so a lost one does not matter), B|w|h or g|1 or 0 = the HOST says who won and whether it kills.
function netBeamSent() { if (vs && vs.net) lanSend('B|s'); }
function netBeamIn(a, p, now) {
  if (!vs || !vs.net || !dummy) return;
  if (a === 's') { dummy.fa = { type: vs.foe === 'cu5' ? 'uni' : 'beam', at: now }; bclTry(now, 'foe'); }
  else if (a === 't') { if (bcl) bcl.taps[1] = Math.max(bcl.taps[1], +p[2] | 0); }
  else if (a === 'w') { if (bcl) bcl.netW = { win: p[2] === (lanHost ? 'h' : 'g') ? 'me' : 'foe', kill: p[3] === '1' }; }
}
function netBeamTaps(now, B, t) {      // every frame of the mash: my taps go to the other phone every 100 ms, his are already in B.taps[1]
  if (now - (B.netSent || 0) >= 100) { B.netSent = now; lanFast('B|t|' + B.taps[0]); }
}
function netBeamDecide(now, B, t) {      // the 7 s are over: true once the winner is known on this phone (the host works it out and tells the guest; the guest waits 1.5 s at most for it)
  if (lanHost) return true;
  if (B.netW) { B.force = B.netW; return true; }
  return t >= BCL.mash + 1500;
}
