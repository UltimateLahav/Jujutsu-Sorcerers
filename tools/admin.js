// ---------------------------------------------------------------- v1.206 THE ADMIN PANEL OF THE TRAINING (this file is spliced into template.html by build_html.py, after cuen.js; tick, trainStep and the scan call it). The user: "add in the training a button to click on at the top and when I click in it then it will open an admin panel with the moves of the enemy and the UI is scrollable so at least it won't take up the whole screen, I want the UI to take up a small part of the screen on the top". Asked, he chose: a click makes the enemy do that move ONCE, RIGHT NOW; EVERY move he has (the big ones too: ultimates, domains, finishers); a SMALL BOX that scrolls up and down; and four extras: FREEZE the enemy's own AI while the box is open, HEALTH buttons, DISTANCE buttons and a switch for WHICH ENEMY it is.
// The ADMIN button sits in the top bar next to SET (training only, in a room with an enemy who fights). The box is at the top, in the middle when there is room and always after the last button of the top bar (and after the elevator panel), with two tabs, MOVES (the moves of the enemy that is there: a click starts one) and TOOLS (HEAL, INF HP, CLOSE / MID / FAR, ENEMY IS), and a FREEZE button in its header. A move is started the way the enemy's own brain starts it (the same state, the same numbers: the swing code, cuenStart, freStart, cStart, vStart ... of each enemy), so what you see is what he does in a fight; the box does not move him to a place, the DISTANCE buttons do.
const ADM = { open: false, tab: 0, freeze: true, key: '', list: [], hold: 0, btnOn: null, l: -1, ht: '', res: '', ceBack: 0 };      // (open; which tab; FREEZE on or off; whose list is built; the moves of the list; until when a BLOCK or a DODGE of the box lasts; the left edge the box must keep clear of the top bar; the top of the damage meter; what the last click did; 1 = the box switched his cursed energy mode on for a blow and switches it off when the blow is over)
const admOn = () => state === 'play' && !!vs && !!vs.practice && !vs.net && !vs.story && !!dummy && dummy.mode === 'fighter';      // (the training room, with an enemy who fights: not the old free play of the dummy)
const admFrozen = () => ADM.open && ADM.freeze && admOn();      // (his own brain stands still while the box is open and FREEZE is on: trainStep treats him as a DUMMY, but a move that was clicked still runs)
const admBusy = (d, now) => !!d && (d.ai === 'attack' || d.ai === 'power' || !!d.fa || !!d.cact || !!d.vact || ADM.hold > now);      // (a move of his is running)
const admRun = (d, now) => ADM.open && admOn() && admBusy(d, now);      // (a move is running while the box is open, so a move that was clicked: the behaviour of the room, which would stand him still, block or walk, waits until it is over. With the box closed the room's behaviour rules every frame, as before the box was there: a DUMMY who is in the middle of a swing is stood still at once)
function admClear(d, now) {      // a click cancels what he was doing (not a K.O., not a cutscene): his reeling, his own move, a grab; chain 99 so that a swing of the grade AI does not go on into the next blow of its chain (the AI sets it back to 0 when it rests)
  d.stunUntil = 0; d.rxAt = -9999; d.fa = null; d.cact = null; d.vact = null; d.held = null; d.cheld = null; d.counter = 0; d.dodgeUntil = 0; d.down = 0; d.chain = 99; d.hitDone = false; d.swung = false; d.hitN = 0; d.ai = 'think'; d.aiAt = now; ADM.hold = 0;
}
function admWhy(now) {      // why a click cannot start a move now ('' = it can)
  const d = dummy; if (!admOn()) return 'NOT HERE'; if (vs.ph !== 'fight') return 'WAIT'; if (d.ko >= 0) return 'K.O.';
  if (cutsceneOn() || fat || fd || ult || js || vf || cf || ff || yf || dom || ke || d.cap) return 'BUSY'; if (d.air || d.airH > 0) return 'WAIT'; return '';
}
// the moves of each enemy: [{ n: name on the button, go: now => starts it (false = not possible just now), big: a cutscene or a domain }]. The brains: the grade AI of updateFighterVs (Gojo, Yuji, Verity and the Cat swing with d.ai = 'attack' and d.k), freFoe (Freddy), cuFoe (Sukuna and Ryu: d.fa)
function admMoves() {
  const f = vs.foe, L = [], M = (n, go, big) => L.push({ n: L.some(q => q.n === n) ? n + ' 2' : n, go, big: !!big });      // (two blows of one name, Sukuna's two R.JABs, get a 2)
  const atk = (k, pre) => now => { const d = dummy; d.k = k; d.ai = 'attack'; d.aiAt = now; if (pre) pre(d, now); return true; };      // (a swing of the grade AI: the numbers it sets when it starts one)
  const defence = () => {
    M('BLOCK', now => { const d = dummy; d.ai = 'block'; d.aiAt = now; d.until = ADM.hold = now + 1000; return true; });
    M('DODGE', now => { const d = dummy, gap = d.x - wx; d.ai = 'dodge'; d.aiAt = now; d.until = d.dodgeUntil = ADM.hold = now + 300; d.vx += (gap > 0 ? 1 : -1) * 250; puff(d.x, 4); return true; });
  };
  const fatal = () => { if (cuMe() && (f === 'verity' || f === 'freddy')) return; M('FINISHER', now => { if (fat || fd || ult || js || vf || cf || ff || yf) return false; fatGo(now, 0, true); return true; }, true); };      // (his FATALITY on you: Gojo's, Verity's, the Cat's and Freddy's have a version for the enemy; Yuji, Sukuna and Ryu have none, and a custom fighter of yours has none for Verity's or Freddy's, as in fatAiState; it ends the round for you)
  if (f === 'gojo') { ATK_NAMES.forEach((n, k) => M(n, atk(k))); defence(); fatal(); }
  else if (f === 'yuji') {
    const T = YU_ATK.names, ce = (d, now) => { if (!d.ce) ADM.ceBack = 1; d.ce = true; d.ceFlame = d.ceAt = now; d.ceUntil = now + 6000; }, conc = () => snd('f:concgather');      // (R.KICK, ELBOW, DOWNSLAM and PUSH KICK are the blows of his cursed energy mode: the flames come on with them)
    for (const k of [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 12, 13, 14, 15]) M(T[k], atk(k, (d, now) => { if (k === 3) d.vx -= 100; if (k === 4 || k === 12) d.divOk = 0; if (k >= 5 && k <= 8) ce(d, now); if (k === 9 || k === 13 || k === 15) conc(); }));
    M('POWER UP', now => { const d = dummy; d.ce = true; d.ceFlame = d.ceAt = now + POW_FLAME; d.ceUntil = now + 8000; d.ceNext = d.ceUntil + 5000; ADM.ceBack = 0; d.ai = 'power'; d.aiAt = now; d.k = 5; snd('ceon'); return true; });
    M('POWER OFF', () => { const d = dummy; d.ce = false; d.ceFlame = 0; d.k = 0; ADM.ceBack = 0; snd('ceoff'); return true; });
    defence();
  } else if (f === 'verity') {
    ATK_NAMES.forEach((n, k) => M(n, atk(k)));
    M('BITE', now => { vStart(dummy, 'bite', now); return true; }); M('LOW CLAW', now => { vStart(dummy, 'crouch', now); return true; });
    M('JUMPSCARE', now => { if (!jsVictimOk(now)) return false; vStart(dummy, 'scare', now); return true; }, true);
    defence(); fatal();
  } else if (f === 'cat') {
    CAT_ATK.names.slice(0, 4).forEach((n, k) => M(k === 2 ? 'GRAB 2' : n, atk(k)));
    M('SMASH', now => { cStart(dummy, 'flat', now); return true; }); M('PUSH DASH', now => { cStart(dummy, 'dash', now); return true; }); M('CARTOON', now => { cStart(dummy, 'toon', now); return true; });
    M('ULTIMATE', now => { if (!ultVictimOk(now)) return false; ultStart(now, 'enemy'); return true; }, true);
    defence(); fatal();
  } else if (f === 'freddy') {
    FRED_M1.forEach((n, k) => M(n, atk(k))); FRED_FAR.names.forEach((n, k) => M('FAR ' + n, atk(FRED_FAR.k0 + k)));
    M('BOILING WATER', now => freStart('water', now)); M('PIERCE', now => freStart('pierce', now)); M('GROUND SLAM', now => freStart('slam', now));
    M('NIGHTMARE', now => { if (dom || ult || fd || stance !== 'stand' || gAir || hurtAt >= 0 || jumpAt >= 0 || gojoGone || dgAt >= 0) return false; fdStartRev(now); return true; }, true);
    defence(); fatal();
  } else if (cuFoeOn() && cuenReg()) {      // Sukuna and Ryu: the blows of the custom engine, one after the other (d.fa), and each one's special moves
    const g = cuFoeG(), n = +f.slice(2), cu = (k, type) => now => { dummy.chain = 99; cuenStart(k, now, type); return true; };
    if (n === 3) { for (const k of [0, 1, 2, 3, 4, 5, 6, 7, 8, 14, 15, 16]) M(g.an[k], cu(k, 'cu')); M('AIR CUT', cu(9, 'aircut')); M('FIRE ARROW', cu(22, 'arrow')); M('SHRINE', cu(0, 'dom'), true); }
    else if (n === 4) { for (const k of [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]) M(g.an[k], cu(k, 'cu')); M('KI BLAST', cu(12, 'blast')); M('JUST ONCE', cu(16, 'beam'), true); }
    else { for (const k of [0, 1, 2, 3, 4, 5, 6, 8, 9, 10]) M(g.an[k], cu(k, 'cu')); M('CHARGE', cu(7, 'icharge')); M('BLAST', cu(0, 'iblast')); M('LASER', cu(0, 'ilaser')); M('SPIN BLAST', cu(0, 'ispin')); M('GROUND PUNCH', cu(0, 'igp')); M('BEAR HUG', cu(0, 'ihug')); M('UNIBEAM', cu(0, 'uni'), true); }      // (v1.208 Iron Man: the chain, the rocket uppercut, the low jabs, the two bolts, and the UNIBEAM)
    defence();
  }
  return L;
}
function admGo(i) {      // a click on a move
  const m = ADM.list[i], now = pnow(); if (!m) return; const why = admWhy(now); if (why) { ADM.res = why; say(why, wx, '#9a9aa8', 8, now); snd('block'); return; }
  const d = dummy; admClear(d, now); if (m.go(now) === false) { ADM.res = 'NOT NOW'; say('NOT NOW', wx, '#9a9aa8', 8, now); snd('block'); return; }
  ADM.res = 'OK'; say(m.n, d.x, m.big ? '#ffb347' : '#ffe9a0', 8, now);
}
function admBuild() {      // the buttons of the MOVES tab, made again when the enemy is another one
  const key = vs ? vs.foe + (cuFoeOn() && !cuenReg() ? '?' : '') : ''; if (ADM.key === key) return; ADM.key = key; ADM.list = vs && admOn() ? admMoves() : [];
  const box = $('admL'); box.textContent = '';
  ADM.list.forEach((m, i) => { const b = document.createElement('button'); b.textContent = m.n; b.tabIndex = -1; if (m.big) b.className = 'big'; b.addEventListener('click', () => { admGo(i); b.blur(); }); box.appendChild(b); });
  if (!ADM.list.length) { const s = document.createElement('small'); s.textContent = 'LOADING...'; box.appendChild(s); }
}
function admLabels() {
  const set = (id, txt, on) => { const b = $(id); if (b.textContent !== txt) b.textContent = txt; b.classList.toggle('on', !!on); };
  set('admF', 'FREEZE: ' + (ADM.freeze ? 'ON' : 'OFF'), ADM.freeze); set('admInf', 'INF HP: ' + (TR.ehp === 1 ? 'ON' : 'OFF'), TR.ehp === 1); set('admFoe', 'ENEMY: ' + TRV.foe[TR.foe], false);
  ['admP0', 'admP1', 'admP2'].forEach((id, i) => $(id).classList.toggle('on', TR.put === i)); $('admT0').classList.toggle('on', ADM.tab === 0); $('admT1').classList.toggle('on', ADM.tab === 1);
  $('admL').style.display = ADM.tab === 0 ? '' : 'none'; $('admK').style.display = ADM.tab === 1 ? '' : 'none';
}
function admHeal() {      // the health buttons: a K.O.'d enemy comes back with a new round, the others get their full health and stop bleeding
  const d = dummy; if (!d) return; if (d.ko >= 0 || d.hp <= 0) { trainReset(); return; } d.hp = d.shown = d.max || DUMMY_HP; d.bleed = null; TR.hpPrev = d.hp;
}
function admPut(i) { TR.put = (i + 2) % 3; trainPut(); }      // (the three distances of PUT ENEMY, one tap each: trainPut goes to the next one)
function admUI(now) {      // every frame (tick): the button and the box show or hide, the labels follow the settings
  if (ADM.ceBack && dummy && !admBusy(dummy, now)) { ADM.ceBack = 0; dummy.ce = false; dummy.ceFlame = 0; }      // (R.KICK, ELBOW, DOWNSLAM and PUSH KICK of Yuji are blows of his cursed energy mode: it was switched on for the blow, and it goes off with it)
  const on = admOn(), hide = !on || cutsceneOn() || $('hud').classList.contains('cine');      // (the pause and the settings screens, z-index 4 and 5, cover the box like everything else: tick does not run while the game is paused)
  if (!on && state !== 'play') ADM.open = false;
  const btn = $('admBtn'), box = $('adm'), want = on && !hide; if (ADM.btnOn !== want) { ADM.btnOn = want; btn.style.display = want ? '' : 'none'; }
  btn.classList.toggle('on', ADM.open); const show = want && ADM.open; if (box.classList.contains('on') !== show) { box.classList.toggle('on', show); box.setAttribute('aria-hidden', show ? 'false' : 'true'); }
  if (show) { admBuild(); admLabels(); const t = 'ADMIN: ' + TRV.foe[TR.foe]; if ($('admTt').textContent !== t) $('admTt').textContent = t; }
  const tw = twpEl, l = show ? Math.ceil(Math.max(btn.getBoundingClientRect().right, tw && tw.classList.contains('on') ? tw.getBoundingClientRect().right : 0)) + 8 : 0; if (l !== ADM.l) { ADM.l = l; box.style.setProperty('--admL', l + 'px'); }      // (the box starts after the last button of the top bar and after the elevator panel when that is shown, so it covers neither: it is in the middle when there is room)
  const ht = show ? Math.ceil(box.getBoundingClientRect().bottom) + 4 + 'px' : ''; if (ht !== ADM.ht) { ADM.ht = ht; $('trHud').style.top = ht; }      // (the DAMAGE METER and MOVE INFO of the TRAIN page, which sit at the top in the middle, go down under the box while it is open: a click on a move and the number of the meter are seen together)
}
{
  const click = (id, fn) => { const b = $(id); b.tabIndex = -1; b.addEventListener('click', () => { audio(); fn(); b.blur(); admLabels(); }); };
  click('admBtn', () => { ADM.open = !ADM.open; if (ADM.open) ADM.tab = 0; }); click('admX', () => { ADM.open = false; });
  click('admF', () => { ADM.freeze = !ADM.freeze; }); click('admT0', () => { ADM.tab = 0; }); click('admT1', () => { ADM.tab = 1; });
  const tro = k => TRO.find(o => o[0] === k)[3];      // (what changing a setting of the TRAIN page does: the same functions)
  click('admHeal', admHeal); click('admInf', () => { TR.ehp = TR.ehp === 1 ? 0 : 1; tro('ehp')(TR.ehp); trainUI(); });
  ['admP0', 'admP1', 'admP2'].forEach((id, i) => click(id, () => { admPut(i); trainUI(); }));
  click('admFoe', () => { TR.foe = (TR.foe + 1) % TRF.length; tro('foe')(TR.foe); trainUI(); });
}
window.__adm = () => ({ open: ADM.open, tab: ADM.tab, freeze: ADM.freeze, on: admOn(), key: ADM.key, moves: ADM.list.map(m => m.n), busy: admBusy(dummy, pnow()), res: ADM.res });      // test hook (res: what the last click did: OK, NOT NOW, WAIT, BUSY, K.O., NOT HERE)
