// ================================================================ v1.210 ACHIEVEMENTS
// The ACHIEVEMENTS card of the mode screen (next to STORY MODE) opens a screen with one card for each: its picture, its name and what to do (the picture is dark and the card says LOCKED until you earn it).
// PROG.ach = { id: 1 } is saved with the money and the skills (js_prog). achGive(id) earns one (true when it was new): it is saved, and a rectangle with its picture and name slides in over the top of the screen, stays ACHT.hold ms and slides out again (two at once wait for each other).
// Where each one is given: JUST THIS ONCE: bclFinish (tools/clash.js), when a clash with the ENEMY Ryu is over and it is the second one in this fight (vs.jto, a new fight starts at 0); WANNA SEE SOMETHING COOL?: suFgHit (tools/sukuna.js), when the arrow of FUGA itself takes the last of the enemy's health (FUGA only exists with the domain open);
// CLIP THIS JARVIS: twFallOut (tools/tower.js), when the enemy goes out through the glass of the skyscraper within ACH_JV ms of one of YOUR UNIBEAM bursts (iruTick, tools/ironb.js, sets achU to the time of each burst that hits him).
// The pictures are cut out of the game itself (tools/ach_0.png - ach_2.png, 174 x 98 art pixels: Ryu's GRANITE BLAST, Sukuna's FUGA, the UNIBEAM across a floor of the skyscraper); build_html.py puts them in as __ACHIMG__ (data addresses, in the order of ACH).
const ACH_IMG = __ACHIMG__, ACHT = { hold: 3500, out: 600 }, ACH_JV = 4000;      // (how long a rectangle stays, how long it takes to slide out (ms; the scan makes them short), how soon after a UNIBEAM burst the enemy must be out of the building)
const ACH = [
  { id: 'jto', nm: 'JUST THIS ONCE', tx: 'CLASH AGAINST RYU AT LEAST TWICE IN THE SAME GAME' },
  { id: 'cool', nm: 'WANNA SEE SOMETHING COOL?', tx: "FINISH AN ENEMY OFF WITH SUKUNA'S FUGA WHILE HIS DOMAIN IS ACTIVE" },
  { id: 'jarvis', nm: 'CLIP THIS JARVIS', tx: 'ACTIVATE UNIBEAM AND THROW THE ENEMY OFF THE SKYSCRAPER MAP' }
];
let achQ = [], achBusy = false, achU = -1e9;      // (the ones waiting to slide in, a rectangle is on the screen, the time of the last UNIBEAM burst on the enemy)
const achN = () => ACH.filter(a => PROG.ach[a.id]).length;
function achSub() { $('achSub').textContent = achN() + ' OF ' + ACH.length; }
function achGive(id) {      // earn one: true when it was new
  const a = ACH.find(x => x.id === id); if (!a || PROG.ach[id]) return false;
  PROG.ach[id] = 1; saveProg(); achSub(); if (state === 'ach') achBuild(); achQ.push(a); achNext(); return true;
}
function achNext() {      // the next rectangle slides in from above (one at a time), stays, and slides out; then the next one
  if (achBusy || !achQ.length) return; achBusy = true;
  const a = achQ.shift(), t = $('achT'); $('achTi').src = ACH_IMG[ACH.indexOf(a)]; $('achTn').textContent = a.nm;
  t.classList.remove('show'); t.classList.add('on'); void t.offsetWidth; t.classList.add('show');
  setTimeout(() => { t.classList.remove('show'); setTimeout(() => { t.classList.remove('on'); achBusy = false; achNext(); }, ACHT.out); }, ACHT.hold);
}
function achBuild() {      // the screen: one card for each
  const L = $('achList'); L.textContent = '';
  ACH.forEach((a, i) => {
    const on = !!PROG.ach[a.id], c = document.createElement('div'), im = new Image(), nm = document.createElement('b'), tx = document.createElement('i'), st = document.createElement('em');
    c.className = 'card achC ' + (on ? 'on' : 'off'); c.dataset.id = a.id; im.src = ACH_IMG[i]; im.alt = ''; nm.textContent = a.nm; tx.textContent = a.tx; st.textContent = on ? 'EARNED' : 'LOCKED';
    c.append(im, nm, tx, st); L.append(c);
  });
  $('achCnt').textContent = achN() + ' OF ' + ACH.length + ' EARNED';
}
(function achIcon() {      // the little trophy on the card, 16 x 16 pixels
  const g = $('achIc').getContext('2d'), r = (c, x, y, w, h) => { g.fillStyle = c; g.fillRect(x, y, w, h); }, Y = '#ffd34d', O = '#e0a020', W = '#fff4c4';
  r(Y, 3, 1, 10, 1); r(Y, 3, 2, 10, 5); r(Y, 4, 7, 8, 1); r(Y, 5, 8, 6, 1); r(Y, 6, 9, 4, 1); r(W, 4, 2, 2, 4); r(O, 11, 2, 2, 5); r(O, 10, 7, 1, 1);      // (the cup, lit from the left)
  r(Y, 1, 2, 2, 1); r(Y, 0, 3, 1, 3); r(Y, 1, 6, 2, 1); r(Y, 13, 2, 2, 1); r(Y, 15, 3, 1, 3); r(Y, 13, 6, 2, 1);      // (the two handles)
  r(O, 7, 10, 2, 2); r(Y, 5, 12, 6, 1); r(O, 4, 13, 8, 2);      // (the stem and the foot)
})();
$('achMode').addEventListener('click', () => { audio(); achBuild(); show('ach'); });
$('achBack').addEventListener('click', () => show('modes'));
achSub();
window.__ach = () => ({ got: { ...PROG.ach }, q: achQ.length, busy: achBusy, u: achU });      // (test hook)
