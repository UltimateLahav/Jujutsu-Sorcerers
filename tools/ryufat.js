// ================================================================ v1.212 RYU'S FATALITY (this file is spliced into template.html by build_html.py, right after cuenir.js)
// The user: "make the fatality for ryu go like this: ryu charges forward and is about [to] punch the enemy but misses and punches the ground making it crack itself wide open and as they both fall (enemy and ryu) ryu grabs the enemy's legs as ryu says SWEET as we see a picture of the first picture but in pixel
// style as it zooms out of the middle dessert as ryu knees his opponent in the back cracking it as the enemy is on the ground the enemy tries to punch ryu but ryu tanks it as he violently flashing the enemy aggressively with a shit ton of blasts to his face as the enemy is left having his right arm denigrated
// and he has a big ass hole on his right side as he is left to a crust saying I thought you had abandoned that pride and then before the enemy dies he says you disgusting ass N- and then he dies". Asked: the last word = "he just says N- and then cuts off" (so only the letter and the dash are ever written),
// the first line is the ENEMY's, who can do it = "you and the enemy Ryu", his poses = no preference (his own pictures, the cracks, the fall and the burns are drawn round them).
// THE SCENE (19 s, its own clock, the attacker on the left; when the enemy Ryu does it to you the whole picture is turned round like the Cat's): 1 Ryu charges, the enemy hops back, the fist whiffs and goes into the ground. 2 The floor cracks, the gap opens under both. 3 They fall (the street
// slides away up the screen, a rock wall rushes past); Ryu catches the enemy by the ankles and says SWEET. 4 CUT: a pixel picture of a tea table (made here, no file), starting on the cake in the middle and zooming out until the whole table is there; a crack of bone and a white flash end it.
// 5 The knee has landed (his back is folded), they hit the bottom, the enemy is thrown down, gets up on his knees and swings; Ryu does not move. 6 The barrage: blasts out of the hair, a hundred flashes, the enemy burns to a crust; his right arm (the near one) is blown into pixels and a hole is
// blown through his right side. 7 He lies there and says I THOUGHT YOU HAD ABANDONED THAT PRIDE, then YOU DISGUSTING ASS N- (typed out, cut off after the dash) and dies. The title, the black. SETTINGS > GAME > GRAPHIC DAMAGE: FULL = blood and red flesh; CLEAN = the same without red;
// OFF = from the first blast to the first word the screen is black (only the sounds play) and he lies there whole.
const RFT = { charge: 0.5, miss: 1.0, hit: 1.4, fall: 2.5, grab: 3.0, sweet: 3.15, cut: 3.95, knee: 6.75, back: 6.95, land: 7.6, rise: 8.2, swing: 8.95, tank: 9.1, burn: 9.55, arm: 10.45, hole: 11.2, burnEnd: 12.3, say1: 13.1, say2: 15.3, die: 16.9, title: 17.3, end: 19.2 };
const RF_D = 520, RF_HW = 92, RF_L1 = ['I THOUGHT YOU HAD', 'ABANDONED THAT PRIDE'], RF_L2 = 'YOU DISGUSTING ASS N-', RF_L2B = ['YOU DISGUSTING', 'ASS N-'], RF_ROW = 0.06;      // (how deep the pit is; half its width; what the enemy says: the second line is cut off after the N and the dash; seconds a letter takes)
const rfH = (x, y, s) => { let h = Math.imul(x | 0, 73856093) ^ Math.imul(y | 0, 19349663) ^ Math.imul(s | 0, 83492791); h = Math.imul(h ^ (h >>> 13), 1274126177); h ^= h >>> 16; return (h >>> 0) / 4294967296; };      // (a number 0 - 1 from three whole numbers, always the same one)
const rfFl = a => { a = a * SET.fl / 100; return SET.nf ? Math.min(a, 0.1) : a; };      // (a flash as bright as SETTINGS > FLASHES allows)
function ryfState(now) {      // the FATAL button while you play Ryu (the same rules as the others': the enemy at 20% health or less and close, half of the energy; v1.213 Iron Man's too, tools/ironfat.js): 0 = ready; 1 = the enemy is above 20% health; 2 = too far away; 3 = not possible right now
  const g = CU_GAME[vs && vs.me === 'cu5' ? 5 : 4];
  if (!vs || vs.story || vs.cv || lacks('fat') || vs.ph !== 'fight' || js || vf || fat || yf || yu || (dom && domLock()) || ult || cf || ff || ryf || irf || sr || ke || fd || bcl || ryUl || !g || g.bh || !dummy || dummy.ko >= 0 || dummy.cap || dummy.mode !== 'fighter' || (dummy.vform && dummy.vform !== 'verity') || now - spawnAt < 900) return 3;
  if (!(dummy.hp <= dummy.max * FAT_LOW)) return 1;
  if (Math.abs(dummy.x - wx) > FAT_RANGE) return 2;
  return hurtAt >= 0 || gojoGone || cuJumpAt >= 0 || cuAtkAt >= 0 || cuDash || blkAt >= 0 || stance !== 'stand' || (twOn() && vs.tw && vs.tw.slide) ? 3 : 0;
}
function ryfStart(now, rev) {      // rev = the enemy Ryu does it to you
  const d = dummy, A = CU_GAME[4]; if (!A || !A.atk || !A.frames.length) return false;
  cineClear(); closeSettings(); stickDown = false; d.ai = 'rest'; d.pull = null; d.vx = 0; d.vact = null; d.cact = null; d.cheld = null; d.held = null; d.fa = null; vs.catHold = 0;
  slowAt = -1e9; slowFin = false; stopMs = 0; cuAtkAt = cuJumpAt = -1; cuDash = null; cuShots = []; cuAtkQ = cuLpQ = 0;      // (a slow motion or a hit-stop of the blow before it is over: the scene runs on real time)
   blkAt = blkEnd = -1; stance = 'stand'; ryBeams = []; $('pad').classList.add('cine'); $('hud').classList.add('cine'); snd('fatalstart');
  ryf = { rev: !!rev, t: 0, ev: {}, parts: [], beams: [], cc: new Map(), freeze: 0, shake: 0, flash: 0, nb: 0, wx0: wx, vx0: rev ? wx : d.x, vk: rev ? vs.me : vs.foe, gm: gdSet(), vinv: !rev && !!vs.inv, ainv: !!rev && !!vs.inv, V: null, R: null, rock: null, said: [] };
  return true;
}
function ryfReset() { ryf = null; $('pad').classList.remove('cine'); $('hud').classList.remove('cine'); }
function ryfEnd(now) {      // he is dead and Ryu wins the round (the pit stays in the street until the next round, and the head does not come off: he has been burnt already)
  const s = ryf, rev = s.rev; wx = s.wx0; if (vs) { vs.crater = { x: s.vx0 }; vs.noHead = true; } ryfReset(); blackUntil = now + 500; if (!vs || vs.ph !== 'fight') return;
  if (rev) { vs.hp = 0; vs.sh = 0; vs.hitAt = now; endRound('enemy', 'fatal', now); return; }
  dummy.hp = 0; dummy.shown = 0; dummy.ko = now - 3000; dummy.koAt = dummy.ko; kos++; endRound('player', 'fatal', now);
}

// ---- the pictures: the victim (whole, without his near arm, and with a hole through his side), burnt to a crust a little at a time, and the table of the cut
function rfBox(img) { const b = ffBox(img); return b.x1 >= b.x0 ? b : { x0: 0, x1: img.width - 1, y0: 0, y1: img.height - 1 }; }
function rfFace(img, bb) {      // where the face is in a picture: the middle of the top rows (a column) and a little below the top of the head (a row)
  const h = bb.y1 - bb.y0 + 1, W = img.width, d = img.getContext('2d').getImageData(0, 0, W, img.height).data; let n = 0, sx = 0;
  for (let y = bb.y0; y < bb.y0 + Math.max(2, Math.round(h * 0.14)); y++) for (let x = bb.x0; x <= bb.x1; x++) if (d[(y * W + x) * 4 + 3] > 8) { n++; sx += x; }
  return [(n ? sx / n : (bb.x0 + bb.x1) / 2) + 2, bb.y0 + h * 0.1];
}
function rfRipArm(img, bb, hx) {      // a picture that has no patches (Ryu, Iron Man): the arm in front of his chest is cut away in a ragged ellipse; returns { c: the picture, arm: the pixels that went }
  const W = img.width, H = img.height, c = document.createElement('canvas'); c.width = W; c.height = H; const g = c.getContext('2d'); g.drawImage(img, 0, 0);
  const id = g.getImageData(0, 0, W, H), px = id.data, arm = [], h = bb.y1 - bb.y0 + 1, fw = Math.max(6, bb.x1 - hx), ex = hx + fw * 0.5, ey = bb.y0 + h * 0.4, rx = fw * 0.55 + 3, ry = h * 0.2;
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) { const i = (y * W + x) * 4; if (px[i + 3] < 8 || x < hx - 2) continue; if (Math.hypot((x - ex) / rx, (y - ey) / ry) + (rfH(x, y, 9) - 0.5) * 0.4 < 1) { arm.push({ u: x, v: y, c: 'rgb(' + px[i] + ',' + px[i + 1] + ',' + px[i + 2] + ')' }); px[i + 3] = 0; } }
  g.putImageData(id, 0, 0); return { c, arm };
}
function rfArmOf(img, gv) {      // the pixels of the near arm: those that the picture without it has no more (or has in another colour: the stump)
  const W = img.width, H = img.height, a = img.getContext('2d').getImageData(0, 0, W, H).data, b = gv.getContext('2d').getImageData(0, 0, W, H).data, arm = [];
  for (let i = 0; i < W * H; i++) { const q = i * 4; if (a[q + 3] > 8 && (b[q + 3] < 8 || Math.abs(a[q] - b[q]) + Math.abs(a[q + 1] - b[q + 1]) + Math.abs(a[q + 2] - b[q + 2]) > 60)) arm.push({ u: i % W, v: (i / W) | 0, c: 'rgb(' + a[q] + ',' + a[q + 1] + ',' + a[q + 2] + ')' }); }
  return arm;
}
function rfHole(src, cx, cy, r, gm) {      // a hole through the picture: a ragged circle is cleared; its rim is scorched black with a few embers (a little red flesh in FULL)
  const W = src.width, H = src.height, c = document.createElement('canvas'); c.width = W; c.height = H; const g = c.getContext('2d'); g.drawImage(src, 0, 0);
  const id = g.getImageData(0, 0, W, H), px = id.data;
  for (let y = Math.max(0, Math.floor(cy - r - 3)); y <= Math.min(H - 1, Math.ceil(cy + r + 3)); y++) for (let x = Math.max(0, Math.floor(cx - r - 3)); x <= Math.min(W - 1, Math.ceil(cx + r + 3)); x++) {
    const dx = x - cx, dy = y - cy, dist = Math.hypot(dx, dy), ang = Math.atan2(dy, dx), R = r * (0.78 + 0.42 * rfH(Math.round(ang * 3), 7, 5)), i = (y * W + x) * 4;
    if (dist <= R) px[i + 3] = 0;
    else if (dist <= R + 1.9 && px[i + 3] > 8) { const n = rfH(x, y, 11); const col = n < 0.2 ? [255, 140, 40] : n < 0.4 && gm === 0 ? [142, 12, 24] : [14, 8, 8]; px[i] = col[0]; px[i + 1] = col[1]; px[i + 2] = col[2]; px[i + 3] = 255; }
  }
  g.putImageData(id, 0, 0); return c;
}
const RF_RAMP = [[10, 7, 8], [22, 15, 13], [36, 26, 21], [52, 38, 30], [74, 56, 44]];
function rfChar(src, p) {      // the picture with each of its pixels burnt when its own number (0 - 1) is below p: 0 = as it is, 1 = all of it a black crust with a few embers
  if (p <= 0) return src;
  const W = src.width, H = src.height, d = src.getContext('2d').getImageData(0, 0, W, H).data, c = document.createElement('canvas'); c.width = W; c.height = H; const g = c.getContext('2d'), o = g.createImageData(W, H), od = o.data;
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const i = (y * W + x) * 4, a = d[i + 3]; if (!a) continue;
    if (rfH(x, y, 1) >= p) { od[i] = d[i]; od[i + 1] = d[i + 1]; od[i + 2] = d[i + 2]; od[i + 3] = a; continue; }
    const L = (0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2]) / 255, edge = (y > 0 && !d[i - W * 4 + 3]) || (y < H - 1 && !d[i + W * 4 + 3]) || (x > 0 && !d[i - 1]) || (x < W - 1 && !d[i + 7]);
    let col = RF_RAMP[edge ? 0 : Math.max(0, Math.min(4, Math.floor(L * 5 + (rfH(x, y, 2) - 0.5) * 1.6)))]; const em = rfH(x, y, 3); if (em < 0.04) col = em < 0.014 ? [255, 190, 60] : [230, 90, 24];
    od[i] = col[0]; od[i + 1] = col[1]; od[i + 2] = col[2]; od[i + 3] = a;
  }
  g.putImageData(o, 0, 0); return c;
}
function ryfPrep(s) {      // the victim and Ryu: their pictures, their sizes, and the damaged versions of the victim (made once, when the scene starts)
  const V = cfVictim({ vk: s.vk, inv: s.vinv }, 0); let img = V.img; if (s.vinv && /^cu/.test(s.vk)) img = invOf(img);
  const bb = rfBox(img), fr = bb.y1 + 1, H = bb.y1 - bb.y0 + 1, hx = V.hx, o = { img, bb, fr, hx, top: V.top || 0, W: img.width, H, hh: fr - (bb.y0 + bb.y1) / 2, back: Math.max(4, hx - bb.x0), front: Math.max(4, bb.x1 - hx), face: rfFace(img, bb), g1: img, g2: img, arm: [] };
  if (s.gm < 2) {
    const gv = goreVar(img, 1, 0); if (gv !== img) { o.g1 = gv; o.arm = rfArmOf(img, gv); } else { const r = rfRipArm(img, bb, hx); o.g1 = r.c; o.arm = r.arm; }
    o.g2 = rfHole(o.g1, hx - 1, bb.y0 + H * 0.45, Math.max(5, Math.round(H * 0.12)), s.gm);
  }
  s.V = o; const A = CU_GAME[4], idle = A.frames[0], rb = rfBox(idle); s.R = { fr: rb.y1 + 1, hx: 32 }; rfCake();      // (the table is drawn now, not in the middle of the scene)
}
const rfIn = (s, c) => s.ainv ? invOf(c) : c;      // (Ryu's picture, in the colours of the inverted fighter when that is who he is)

// ---- the table: a pixel picture of a tea table seen from above (144 x 81): a pink gingham cloth, a cake on a white plate in the middle, a three-tier stand, a tart, a teapot, a jug, cups, a plate with little cakes
let RF_CAKE = null;
function rfCake() {
  if (RF_CAKE) return RF_CAKE;
  const W = 144, H = 81, c = document.createElement('canvas'); c.width = W; c.height = H; const g = c.getContext('2d');
  const px = (x, y, w, h, col) => { g.fillStyle = col; g.fillRect(Math.round(x), Math.round(y), w, h); };
  const disc = (cx, cy, r, col) => { g.fillStyle = col; for (let y = -Math.ceil(r); y <= Math.ceil(r); y++) { const w = Math.floor(Math.sqrt(Math.max(0, r * r - y * y)) + 0.5); g.fillRect(Math.round(cx - w), Math.round(cy + y), 2 * w + 1, 1); } };
  const obj = (cx, cy, r, edge, fill, hi) => { disc(cx + 1, cy + 1, r + 1, 'rgba(90,40,50,0.32)'); disc(cx, cy, r + 1, edge); disc(cx, cy, r, fill); if (hi) disc(cx - r * 0.3, cy - r * 0.3, Math.max(1, r * 0.4), hi); };
  for (let y = 0; y < H; y += 6) for (let x = 0; x < W; x += 6) { px(x, y, 6, 6, ((x + y) / 6) % 2 ? '#f6dede' : '#f9ecec'); if (((x / 6) | 0) % 2 === 0 && ((y / 6) | 0) % 2 === 0) px(x, y, 6, 6, '#f1c9d0'); }      // (the gingham cloth)
  for (let x = 0; x < W; x += 6) { px(x, 0, 3, 2, '#e9a9b8'); px(x + 3, H - 2, 3, 2, '#e9a9b8'); }
  // the three-tier stand, top left: three plates, little cakes, scones, macarons and a strawberry
  obj(27, 21, 16, '#a98a8a', '#fdf6f1', '#ffffff'); disc(27, 21, 13, '#f3d5da'); obj(27, 21, 11, '#b99a9a', '#fffaf6'); obj(27, 21, 6, '#b99a9a', '#fdf1f1');
  for (const [x, y] of [[18, 15], [34, 15], [20, 29], [35, 27]]) { px(x - 2, y - 2, 5, 5, '#8a4a5c'); px(x - 1, y - 1, 3, 3, '#ff9fb5'); px(x - 1, y - 1, 3, 1, '#ffffff'); }
  for (const [x, y] of [[16, 22], [38, 22], [27, 10]]) { disc(x, y, 2.4, '#8a5a30'); disc(x, y, 1.6, '#d89a52'); }
  for (const [x, y, col] of [[23, 19, '#ffb3c7'], [29, 18, '#b8e2a0'], [26, 24, '#ffe08a']]) { disc(x, y, 2.4, '#9a6a78'); disc(x, y, 1.7, col); }
  disc(27, 21, 2.6, '#7a2230'); disc(27, 21, 1.8, '#e0344d'); px(26, 18, 2, 1, '#4aa86a');
  // the strawberry tart, top right
  obj(103, 17, 11, '#7a4a22', '#e3b15c', '#f3d28a'); disc(103, 17, 8, '#fff0b8'); disc(103, 17, 7, '#ffe7a0');
  for (let i = 0; i < 7; i++) { const a = i / 7 * 6.2832; obj(103 + Math.cos(a) * 5.2, 17 + Math.sin(a) * 5.2, 1.9, '#7a1a28', '#e8344a', '#ff9aa8'); } obj(103, 17, 2.1, '#7a1a28', '#e8344a', '#ff9aa8');
  // the teapot, right: round body with pink flowers, a gold lid with a knob, a spout and a handle
  for (let i = 0; i < 9; i++) { const w = 4 - Math.floor(i / 3); px(117 - i, 41 + Math.floor(i * 0.6) - 1, 1, w + 2, '#9a8282'); px(117 - i, 41 + Math.floor(i * 0.6), 1, w, '#fffafa'); } obj(126, 39, 10, '#9a8282', '#fffafa', '#ffffff'); disc(126, 39, 8, '#f6e3e3'); disc(126, 39, 6, '#fffafa');
  for (const [x, y] of [[121, 36], [131, 36], [121, 43], [131, 43], [126, 46]]) { disc(x, y, 1.5, '#f27a96'); px(x, y, 1, 1, '#ffe08a'); }
  g.fillStyle = '#9a8282'; for (let a = -1.2; a <= 1.2; a += 0.15) g.fillRect(Math.round(137 + Math.cos(a) * 4), Math.round(39 + Math.sin(a) * 8), 2, 2);
  obj(126, 37, 4, '#b8903c', '#ffffff', '#fff7c0'); disc(126, 37, 1.6, '#e0b04a');
  // the jug, the two cups with their saucers
  obj(99, 57, 5, '#9a8282', '#ffffff', '#ffe9ee'); px(92, 55, 5, 4, '#9a8282'); px(93, 56, 5, 2, '#fffafa'); px(104, 54, 3, 6, '#9a8282'); px(105, 55, 1, 4, '#fffafa'); disc(99, 57, 3, '#fff6e8');
  for (const [x, y] of [[21, 56], [117, 66]]) { obj(x, y, 9, '#a98a8a', '#fdf6f1', '#ffffff'); obj(x, y, 6, '#a98a8a', '#ffffff'); disc(x, y, 4, '#7a4220'); disc(x + 1, y - 1, 2.4, '#a8602c'); px(x - 1, y - 2, 2, 1, '#e3a868'); px(x + 6, y - 1, 3, 3, '#a98a8a'); px(x + 7, y, 1, 1, '#fffafa'); }
  // the octagon plate with little cakes
  { const cx = 47, cy = 67; for (const [r, col] of [[13, '#a98a8a'], [12, '#fffaf6'], [9, '#f3d5da'], [8, '#fffaf6']]) { g.fillStyle = col; for (let y = -r; y <= r; y++) { const hw = r - Math.max(0, Math.abs(y) - Math.round(r * 0.45)); g.fillRect(cx - hw, cy + y, 2 * hw + 1, 1); } }
    for (const [x, y, a, b] of [[-5, -4, '#ff9fb5', '#ffffff'], [1, -5, '#8a5030', '#d89a52'], [5, -1, '#b8e2a0', '#ffffff'], [-2, 1, '#ffe08a', '#fff7c0'], [-6, 3, '#ffb3c7', '#ffd6e0'], [3, 5, '#f27a96', '#ffc0cc']]) { px(cx + x - 2, cy + y - 2, 5, 5, '#6a3a40'); px(cx + x - 1, cy + y - 1, 3, 3, a); px(cx + x - 1, cy + y - 1, 3, 1, b); } }
  // the cake in the middle: a white plate, a slice of pink berry cake (its layers at the front), cream, a halved strawberry, blueberries, a macaron and a mint leaf
  obj(73, 40, 19, '#a98a8a', '#fffaf7', '#ffffff'); disc(73, 40, 15, '#f1e4e0'); disc(73, 40, 14, '#fffaf7');
  { const ax = 61, ay = 53, R = 24; for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) { const dx = x - ax, dy = y - ay, an = Math.atan2(dy, dx);
      const inW = (r, a0, a1, oy) => { const ddx = x - ax, ddy = y - ay - oy, dd = Math.hypot(ddx, ddy), aa = Math.atan2(ddy, ddx); return dd <= r && aa >= a0 && aa <= a1; };
      if (inW(R + 1.2, -1.42, -0.1, 0)) px(x, y, 1, 1, '#7a2e44');
      if (inW(R, -1.4, -0.12, 5) && !inW(R, -1.4, -0.12, 0)) { const k = (y - ay) % 5; px(x, y, 1, 1, ['#f7b3c1', '#fff3f0', '#d6455d', '#f7b3c1', '#fff3f0'][Math.abs(k) % 5]); }
      if (inW(R, -1.4, -0.12, 0)) px(x, y, 1, 1, an > -0.75 ? '#e9718f' : '#ff9eb5'); } }
  for (let i = 0; i < 6; i++) { const a = -1.28 + i * 0.2, x = 61 + Math.cos(a) * 19, y = 53 + Math.sin(a) * 19; obj(x, y, 2.6, '#c98aa0', '#ffffff', '#ffffff'); }
  obj(70, 38, 4, '#7a1a28', '#e8344a', '#ff9aa8'); disc(70, 38, 1.8, '#ffe3e6'); px(69, 33, 3, 1, '#4aa86a'); px(70, 32, 1, 1, '#4aa86a');
  for (const [x, y] of [[78, 42], [74, 46], [79, 47], [76, 38]]) { obj(x, y, 2.5, '#1e2860', '#38449a', '#9eb0ff'); }
  obj(54, 33, 3.6, '#b06a86', '#ffc2d4', '#ffe0ea'); px(51, 33, 7, 1, '#fffaf7'); obj(64, 27, 2.4, '#2a6a44', '#4aa86a', '#9ae0a8'); px(63, 26, 3, 1, '#9ae0a8');
  for (const [x, y, l] of [[84, 28, 11], [86, 33, 10], [88, 38, 12]]) { px(x, y, l, 1, '#b8b4b4'); px(x + l, y - 1, 3, 3, '#d8d4d4'); px(x, y + 1, l, 1, 'rgba(90,40,50,0.3)'); }      // (cutlery)
  for (let i = 0; i < 26; i++) px(rfH(i, 1, 21) * W, rfH(i, 2, 21) * H, 1, 1, i % 3 ? '#ffd3dc' : '#fff7c0');      // (sugar and petals)
  RF_CAKE = c; return c;
}

// ---- the pit: a cross-section of rock (or concrete in the skyscraper) with a wide slot cut into it, a rubble floor at the bottom; made once as one tall picture (its top row is the row under the street's own road)
function rfRock(s) {
  const W = VW + 16, Hh = RF_D + VH + 40, c = document.createElement('canvas'); c.width = W; c.height = Hh; const g = c.getContext('2d'), tw = twOn(), sc = Math.round(VW / 2) + 8 + 8, floorC = gy + 2 + RF_D - VH;
  const RK = tw ? ['#4c5666', '#414a59', '#586377', '#363e4b', '#4a5262'] : ['#4a4058', '#3d3548', '#544a66', '#2f283a', '#473d57'], DK = tw ? ['#1f252e', '#1a2028', '#252c36', '#141a21'] : ['#241e2e', '#1d1826', '#2b2436', '#171220'], LT = tw ? '#8b97ab' : '#8a7ea4', DD = tw ? '#10141a' : '#0a0610';
  for (let y = 0; y < Hh; y++) {
    const el = sc - RF_HW + Math.round((rfH(y >> 1, 1, 1) - 0.5) * 9), er = sc + RF_HW + Math.round((rfH(y >> 1, 2, 2) - 0.5) * 9), band = Math.floor(y / 7 + rfH(0, y >> 3, 3) * 2.2) % 5;
    g.fillStyle = RK[band]; g.fillRect(0, y, el, 1); g.fillRect(er, y, W - er, 1); g.fillStyle = DK[band % 4]; g.fillRect(el, y, er - el, 1);
    g.fillStyle = LT; g.fillRect(el - 1, y, 1, 1); g.fillRect(er, y, 1, 1); g.fillStyle = DD; g.fillRect(el - 2, y, 1, 1); g.fillRect(er + 1, y, 1, 1);
  }
  for (let i = 0; i < 4200; i++) { const x = (rfH(i, 4, 6) * W) | 0, y = (rfH(i, 5, 6) * Hh) | 0, inSlot = x > sc - RF_HW + 5 && x < sc + RF_HW - 5; g.fillStyle = inSlot ? (i % 2 ? '#3a3248' : '#0e0a14') : (i % 3 ? '#6d5f86' : '#241d2e'); g.fillRect(x, y, 1 + (i % 7 === 0 ? 1 : 0), 1); }
  const gr = g.createLinearGradient(0, 0, 0, floorC); gr.addColorStop(0, 'rgba(0,0,0,0)'); gr.addColorStop(1, 'rgba(0,0,0,0.5)'); g.fillStyle = gr; g.fillRect(sc - RF_HW + 4, 0, RF_HW * 2 - 8, floorC);      // (it gets darker the deeper it goes)
  g.fillStyle = DD; g.fillRect(0, 0, W, 2);      // (the cut face under the road)
  for (let y = floorC; y < Hh; y++) { g.fillStyle = (y - floorC) % 6 < 3 ? '#2a2432' : '#231d2b'; g.fillRect(sc - RF_HW - 2, y, RF_HW * 2 + 4, 1); }      // (the rubble floor)
  g.fillStyle = LT; g.fillRect(sc - RF_HW - 2, floorC, RF_HW * 2 + 4, 1); g.fillStyle = '#4a4058'; g.fillRect(sc - RF_HW - 2, floorC + 1, RF_HW * 2 + 4, 1);
  for (let i = 0; i < 70; i++) { const x = sc - RF_HW + 4 + ((rfH(i, 8, 7) * (RF_HW * 2 - 8)) | 0), w = 2 + ((rfH(i, 9, 7) * 7) | 0), h = 1 + ((rfH(i, 10, 7) * 3) | 0); g.fillStyle = i % 3 ? '#4a4058' : '#6d5f86'; g.fillRect(x, floorC - h + 1, w, h); g.fillStyle = '#1a1422'; g.fillRect(x, floorC + 1, w, 1); }
  s.rock = c; s.rockK = VW + ',' + VH + ',' + gy; return c;
}

// ---- where everything is at the time t of the scene (scene places: Ryu on the left, the enemy on the right; when the enemy Ryu does it the whole picture is turned round when it is drawn)
const RF_BS = 0.15, RF_BL = [{ k: 12, row: 'g1', f: 6 }, { k: 13, row: 'g2', f: 5 }, { k: 15, row: 'ga', f: 4 }];      // (a blast takes 0.15 s: its pictures 4 - 9; which of his blast rows, the table of the hair tips, and on which picture the beam leaves)
const rfMap = (P, u, v) => { const lx = P.flip ? P.hx - u : u - P.hx, ly = v - P.pv, c = Math.cos(P.th), sn = Math.sin(P.th); return [P.x + lx * c - ly * sn, P.y + lx * sn + ly * c]; };      // (a point of the victim's picture (u, v) -> where it is on the screen, for the place and the turn P gives it)
function ryfPose(s, t, now) {
  const T = RFT, V = s.V, R = s.R, A = CU_GAME[4], mx = Math.round(VW / 2), Y0 = gy + 2, ph = (a, b) => clamp01((t - a) / (b - a)), S3 = ease3, PI = Math.PI, off = s.gm === 2;
  const AX0 = mx - 56, EX0 = mx + 6, EX1 = EX0 + 16, SC = mx + 8, GX = mx + 12, KX = mx + 56, LX = GX + 22, LX2 = mx + 42;      // (Ryu's start, the enemy's start and where he lands after his hop, the middle of the crack, where Ryu holds the ankles, where the enemy kneels, where he lies after the throw and at the end)
  const fu = ph(T.fall, T.land), camY = t < T.fall ? 0 : RF_D * Math.pow(fu, 1.25);      // (how far the picture has slid up: they fall, the street goes)
  const lag = t < T.fall ? 0 : t < T.land - 0.14 ? -14 * S3((t - T.fall) / 0.3) : t < T.land ? lerp(-14, 0, Math.pow((t - (T.land - 0.14)) / 0.14, 2)) : 0;      // (they hang a little higher on the screen than their floor while they fall, and drop the last 14 px)
  const Q = { mx, Y0, SC, camY, lag, floor: Y0 + RF_D - camY, GX, blast: null, vflash: 0 };
  const dash = A.df, jmp = A.jump, cr = A.cr, hp = A.atk[6], as = A.atk[5], idle = A.frames[Math.floor(now / 66) % A.frames.length];
  let ax = AX0, pic = idle, rt = 0;
  if (t < T.charge) ax = AX0;
  else if (t < T.miss + 0.05) { ax = lerp(AX0, EX0 - 28, S3(ph(T.charge, T.miss + 0.05))); pic = t < T.miss - 0.12 ? dash[4 + Math.floor((t - T.charge) * 30) % 8] : hp[8]; }      // (the charge, then the fist that finds nothing)
  else if (t < T.hit) { const u = ph(T.miss + 0.05, T.hit); ax = lerp(EX0 - 28, EX0 - 16, S3(u)); pic = as[Math.min(14, 5 + Math.floor(u * 5))]; }      // (the downslam: both fists go down)
  else if (t < T.fall - 0.25) { ax = EX0 - 16; pic = as[9]; }
  else if (t < T.grab) { ax = lerp(EX0 - 16, GX, S3(ph(T.fall - 0.25, T.grab))); pic = jmp[6 + Math.floor(now / 80) % 3]; rt = 0.12; }
  else if (t < T.knee) { ax = GX + Math.sin(t * 7); pic = cr[9]; }
  else if (t < T.back + 0.45) { ax = GX + 9; pic = jmp[6]; rt = 0.1; }      // (the knee: he leans into the enemy)
  else if (t < T.land - 0.14) { ax = GX; pic = cr[9]; }
  else if (t < T.land + 0.28) { ax = GX; pic = cr[7]; }
  else if (t >= T.burn && t < T.burnEnd) { const k = Math.floor((t - T.burn) / RF_BS), u = ((t - T.burn) % RF_BS) / RF_BS, bl = RF_BL[k % 3], idx = Math.min(14, 3 + Math.floor(u * 6)); ax = GX + (Math.random() - 0.5) * 1.5; pic = A.atk[bl.k][idx]; Q.blast = { k, idx, bl }; }
  else ax = GX;
  Object.assign(Q, { ax, pic, rt, rx: ax - 32, ry: Y0 + lag - R.fr });
  // the enemy: a place (the point of his picture that is on the floor, or that Ryu holds), a turn and a bend (his back folds over the knee)
  const pivY = Y0 - 62 - V.top + V.fr, hh = V.hh, LY = Q.floor + 1 - V.back, vp = { x: EX0, y: pivY, th: 0, pv: V.fr, hx: V.hx, flip: true }, G = { x: ax + 24, y: Y0 + lag - 41 };
  const tum = u => { const th = PI * S3(u), cx = EX1 + 14 * S3(u), cy = pivY - hh + lag * 0.5 + 10 * S3(u); return { x: cx - hh * Math.sin(th), y: cy + hh * Math.cos(th), th }; };      // (he tumbles head over heels: his middle falls and he turns half a turn; where his feet are then)
  let bend = 0;
  if (off && t >= T.burn - 0.1 && t < T.die + 0.4) { vp.x = LX2; vp.y = LY; vp.th = 1.33 + (t >= T.die ? 0.2 : 0); }      // (GRAPHIC DAMAGE OFF: the middle is cut away, he lies there whole)
  else if (t < T.miss - 0.15) { const f = t > 0.25 ? fearOff(now) : [0, 0]; vp.x = EX0 + f[0]; vp.y = pivY + f[1]; }
  else if (t < T.hit - 0.05) { const u = ph(T.miss - 0.15, T.hit - 0.05); vp.x = lerp(EX0, EX1, S3(u)); vp.y = pivY - 20 * Math.sin(PI * u); vp.th = 0.2 * Math.sin(PI * u); }      // (he hops back out of the way)
  else if (t < T.fall) { const f = fearOff(now); vp.x = EX1 + f[0]; vp.y = pivY + f[1]; }
  else if (t < T.grab) { const q = tum(ph(T.fall, T.grab - 0.2)), b = S3(ph(T.grab - 0.2, T.grab)); vp.x = lerp(q.x, G.x, b); vp.y = lerp(q.y, G.y, b); vp.th = lerp(q.th, PI, b); }
  else if (t < T.land - 0.12) { vp.x = G.x + 1.5 * Math.sin(t * 8); vp.y = G.y; vp.th = PI + 0.06 * Math.sin(t * 6); bend = t >= T.knee ? 0.75 * (1 - 0.35 * S3(ph(T.back, T.back + 0.6))) : 0; }
  else if (t < T.land) { const u = Math.pow((t - (T.land - 0.12)) / 0.12, 2); vp.x = lerp(G.x, LX, u); vp.y = lerp(G.y, LY, u); vp.th = lerp(PI, PI / 2, u); bend = 0.49 * (1 - u); }      // (thrown down: he hits the floor on his back)
  else if (t < T.rise) { vp.x = LX; vp.y = LY; vp.th = PI / 2 + 0.03 * Math.sin(t * 13); }
  else if (t < T.swing - 0.2) { const u = S3(ph(T.rise, T.swing - 0.2)); vp.x = lerp(LX, KX, u); vp.y = lerp(LY, pivY + 16, u); vp.th = lerp(PI / 2, -0.1, u); }      // (he gets up on his knees: his legs are under the floor line)
  else if (t < T.burn) { const l = t < T.swing + 0.14 ? S3(ph(T.swing - 0.2, T.swing + 0.05)) : 1 - S3(ph(T.swing + 0.14, T.tank + 0.25)); vp.x = KX - 10 * l; vp.y = pivY + 16; vp.th = -0.1 - 0.1 * l; }      // (the lunge of his punch and what comes back from Ryu's face)
  else if (t < T.burnEnd) { const u = ph(T.burn, T.burnEnd); vp.x = KX + 5 * S3(u) + (Math.random() - 0.5) * 2; vp.y = pivY + 16 + (Math.random() - 0.5); vp.th = -0.1 + 0.05 * Math.sin(t * 45) + 0.12 * S3(u); }
  else if (t < T.say1 - 0.2) { const u = S3(ph(T.burnEnd, T.say1 - 0.2)); vp.x = lerp(KX + 5, LX2, u); vp.y = lerp(pivY + 16, LY, u * u); vp.th = lerp(0.02, 1.33, u * u); }      // (he falls over backwards)
  else { const u = S3(ph(T.die - 0.15, T.die + 0.25)); vp.x = LX2; vp.y = LY; vp.th = 1.33 + 0.2 * u + (t < T.die ? 0.015 * Math.sin(t * 17) : 0); }
  Q.vp = vp; Q.bend = bend; Q.face = rfMap(vp, V.face[0], V.face[1]); Q.hole = rfMap(vp, V.hx - 1, V.bb.y0 + V.H * 0.45); Q.arm = rfMap(vp, V.hx + 4, V.bb.y0 + V.H * 0.3); Q.sho = rfMap(vp, V.hx, V.bb.y0 + V.H * 0.27); Q.waist = rfMap(vp, V.hx, V.bb.y0 + V.H * 0.5);
  return Q;
}
function rfDrawV(img, P, bend, flashA) {      // the enemy: his picture turned and bent (the upper half is turned about his waist), mirrored so that he looks at Ryu; flashA = how white
  ctx.save(); ctx.translate(Math.round(P.x), Math.round(P.y)); if (P.th) ctx.rotate(P.th); if (P.flip) ctx.scale(-1, 1);
  const bb = ryf.V.bb, yw = Math.round(bb.y0 + (bb.y1 - bb.y0) * 0.5), W = img.width, H = img.height;
  const put = im => {
    if (bend) { ctx.drawImage(im, 0, yw - 1, W, H - yw + 1, -P.hx, yw - 1 - P.pv, W, H - yw + 1); ctx.save(); ctx.translate(0, yw - P.pv); ctx.rotate(P.flip ? -bend : bend); ctx.drawImage(im, 0, 0, W, yw, -P.hx, -yw, W, yw); ctx.restore(); }
    else ctx.drawImage(im, -P.hx, -P.pv);
  };
  put(img); if (flashA > 0.02) { ctx.globalAlpha = Math.min(1, flashA); put(whiteOf(img)); ctx.globalAlpha = 1; }
  ctx.restore();
}
function ryfImg(s, ge, p) {      // the enemy's picture now: whole, without his arm, or without arm and with the hole, and burnt as far as p (cached by tenths)
  const V = s.V, q = Math.round(p * 14), k = ge + ':' + q; let c = s.cc.get(k); if (!c) { c = rfChar(ge === 2 ? V.g2 : ge === 1 ? V.g1 : V.img, q / 14); s.cc.set(k, c); } return c;
}
// ---- the little things that fly
function rfSpawn(s, o) { if (s.parts.length < 420) s.parts.push(Object.assign({ x: 0, y: 0, vx: 0, vy: 0, g: 0, life: 1, age: 0, col: '#ffffff', z: 1, w: false, k: 'px' }, o)); }
function rfDust(s, x, y, n, sp, w) { for (let i = 0; i < n; i++) rfSpawn(s, { x: x + (Math.random() - 0.5) * 18, y, vx: (Math.random() - 0.5) * sp, vy: -Math.random() * sp * 0.4, g: -8, life: 0.7 + Math.random() * 0.7, k: 'dust', z: 2 + ((Math.random() * 2) | 0), col: '#b8aec8', w }); }
function rfRocks(s, x, y, n, w) { for (let i = 0; i < n; i++) rfSpawn(s, { x, y, vx: (Math.random() - 0.5) * 150, vy: -70 - Math.random() * 130, g: 420, life: 1.3, col: STONE[i % 4], z: 1 + (i % 3 === 0 ? 1 : 0), w }); }
function rfSparks(s, x, y, n, sp) { for (let i = 0; i < n; i++) { const a = Math.random() * 6.2832, v = 30 + Math.random() * sp; rfSpawn(s, { x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 20, g: 160, life: 0.25 + Math.random() * 0.3, col: ['#ffffff', '#9ff3ff', '#17e3ff'][i % 3], z: i % 4 ? 1 : 2 }); } }
function rfBlood(s, x, y, n, dir) { for (let i = 0; i < n; i++) rfSpawn(s, { x, y, vx: dir * (20 + Math.random() * 90) + (Math.random() - 0.5) * 40, vy: -Math.random() * 110, g: 420, life: 0.9, col: BLD[i % 4], z: 1 + (i % 4 === 0 ? 1 : 0) }); }
function rfSmoke(s, x, y) { rfSpawn(s, { x, y, vx: (Math.random() - 0.5) * 6, vy: -(8 + Math.random() * 12), g: 0, life: 1.4 + Math.random(), k: 'smoke', z: 2, col: '#4a4048' }); }
function ryfBeam(s, t, now, Q, bl) {      // one blast leaves his hair for the enemy's face: the beam, the sparks, the flash, the blood
  const T = RY_GB[bl.row] && RY_GB[bl.row][bl.f]; if (!T || !Q.face) return; const F = Q.face, k = s.nb++, th = 5 + (k % 3 === 0 ? 3 : 0), x0 = Q.rx + T[0], y0 = Q.ry + T[1];
  s.beams.push({ t0: t, x0, y0, x1: F[0] + (Math.random() - 0.5) * 4, y1: F[1] + (Math.random() - 0.5) * 4, th }); s.lastHit = t;
  snd('redfire'); if (k % 2 === 0) snd('hit', 1); rfSparks(s, F[0], F[1], 9, 120); s.shake = now + 130; if (k % 2 === 0) s.flash = now + 55; if (s.gm === 0) rfBlood(s, F[0], F[1], 4, 1);
}
function ryfEvents(s, t, now, Q, at, off) {
  const T = RFT, V = s.V, full = s.gm === 0, ck = Q.SC;
  at('dash', T.charge, () => snd('dash', 0)); at('whiff', T.miss, () => snd('swing', 3));
  at('hit', T.hit, () => { s.freeze = now + 110; s.flash = now + 110 + 60; s.shake = now + 110 + 600; snd('land', 1.9); snd('twbreak', 3); snd('quake'); rfRocks(s, ck, gy + 2, 14, true); rfDust(s, ck, gy + 2, 14, 120, true); });
  at('rumble', T.hit + 0.3, () => snd('rumble', 1.8)); at('fall', T.fall, () => { snd('twbreak', 3); snd('rumble', 1.8); s.shake = now + 300; rfRocks(s, ck, gy + 2, 10, true); });
  at('grab', T.grab, () => { snd('c4crunch'); snd('hit', 3); s.shake = now + 220; s.flash = now + 50; });
  at('sweet', T.sweet, () => snd('ceon')); at('cut', T.cut, () => { s.flash = now + 100; snd('finisher'); });
  at('knee', T.knee, () => { snd('c4crunch'); snd('c4stab'); snd('twbreak', 3); if (full) snd('rip'); s.flash = now + 100; s.shake = now + 400; });
  at('land', T.land, () => { snd('land', 1.9); snd('smack', 3); s.shake = now + 260; rfDust(s, Q.GX + 10, Q.Y0, 16, 150, false); rfRocks(s, Q.GX + 10, Q.Y0 - 4, 8, false); });
  at('rise', T.rise, () => snd('step', 0, false)); at('swing', T.swing, () => snd('swing', 0));
  at('punch', T.swing + 0.14, () => { snd('hit', 0); snd('block'); rfSparks(s, Q.ax + 12, Q.Y0 + Q.lag - 52, 8, 80); s.shake = now + 90; });
  if (t >= T.burn && t < T.burnEnd) {      // the barrage: a blast each 0.15 s, two beams on every third one
    const b = Q.blast; if (b && s.nbc !== b.k && b.idx >= b.bl.f) { s.nbc = b.k; ryfBeam(s, t, now, Q, b.bl); if (b.k % 3 === 2) ryfBeam(s, t, now, Q, b.bl); }
  }
  at('arm', T.arm, () => {      // his near arm goes: every pixel of it flies off, going dark and falling to ash
    s.flash = now + 90; s.freeze = now + 70; s.shake = now + 400; snd('rip'); snd('concboom'); if (off) return;
    for (const q of V.arm) { const m = rfMap(Q.vp, q.u, q.v); rfSpawn(s, { x: m[0], y: m[1], vx: 30 + Math.random() * 120, vy: -40 - Math.random() * 90, g: 140, life: 0.9 + Math.random() * 0.8, col: q.c, col2: '#1a1210', z: 1, k: 'arm' }); }
    if (full) rfBlood(s, Q.arm[0], Q.arm[1], 16, 1);
  });
  at('hole', T.hole, () => { s.flash = now + 90; s.freeze = now + 80; s.shake = now + 500; snd('c4guts'); snd('concboom'); if (off) return; rfSparks(s, Q.hole[0], Q.hole[1], 22, 140); if (full) rfBlood(s, Q.hole[0], Q.hole[1], 20, 1); for (let i = 0; i < 6; i++) rfSmoke(s, Q.hole[0], Q.hole[1]); });
  at('end', T.burnEnd, () => { snd('ko'); if (!off) for (let i = 0; i < 8; i++) rfSmoke(s, Q.face[0], Q.face[1]); });
  at('cutoff', T.say2 + (RF_L2.length - 1) * RF_ROW + 0.05, () => snd('c6scream', 2));
  at('die', T.die, () => { snd('land', 1); if (!off) for (let i = 0; i < 6; i++) rfSmoke(s, Q.hole[0], Q.hole[1]); }); at('title', T.title, () => snd('finisher'));
  if (!off && t >= T.arm && t < T.die + 1.2 && Math.random() < 0.5) { if (Math.random() < 0.5) rfSmoke(s, Q.hole[0] + (Math.random() - 0.5) * 6, Q.hole[1]); else rfSpawn(s, { x: Q.hole[0] + (Math.random() - 0.5) * 8, y: Q.hole[1] + (Math.random() - 0.5) * 8, vx: (Math.random() - 0.5) * 10, vy: -12 - Math.random() * 16, g: -4, life: 0.6, col: Math.random() < 0.5 ? '#ff7a1c' : '#ffd24a', z: 1 }); }
}

// ---- drawing: the street with its cracks and its gap, the pit, the two of them, the beams and the little things; then the cut, the words, the title and the bars
function ryfCracks(s, t, now, Q) {      // (in the street's own places) cracks run away from the fist along the road for half a second after the blow, then the gap under both of them opens, wider and wider
  const T = RFT, SC = Q.SC, gt = clamp01((t - T.hit) / 0.5);
  for (const [dir, len, sd] of [[-1, 150, 0], [-1, 110, 3], [-1, 80, 6], [1, 150, 1], [1, 120, 4], [1, 70, 7]]) {
    const n = Math.floor(len * gt); let y = gy + 3 + (sd % 4) * 5;
    for (let i = 0; i < n; i++) { const x = SC + dir * i; if (i % 4 === 0) y += Math.round((rfH(i, sd, 31) - 0.5) * 5); y = Math.max(gy + 1, Math.min(VH - 1, y)); ctx.fillStyle = '#07040c'; ctx.fillRect(x, y, 1, 1); ctx.fillStyle = 'rgba(190,180,215,0.7)'; ctx.fillRect(x, y - 1, 1, 1); }
  }
  if (t >= T.hit + 0.3) { const w = RF_HW * ease3((t - T.hit - 0.3) / (T.fall - T.hit - 0.3)); for (let y = gy - 1; y < VH + 1; y++) { const j = Math.round((rfH(y, 3, 41) - 0.5) * 6); ctx.fillStyle = y === gy - 1 ? '#9a8fb0' : '#0a0610'; ctx.fillRect(Math.round(SC - w) + j, y, Math.round(2 * w), 1); } }
}
function ryfWorld(s, t, now, Q) {
  const T = RFT, cy = Q.camY, off = s.gm === 2;
  ctx.save(); ctx.translate(0, -cy); drawBackdrop(now); ctx.fillStyle = 'rgba(20,0,10,0.2)'; ctx.fillRect(-8, 0, VW + 16, VH); if (t >= T.hit) ryfCracks(s, t, now, Q); ctx.drawImage(s.rock, -8, VH); ctx.restore();
  if (cy > 0 && gy - cy + 140 > 0 && gy - cy < VH) { const y0 = gy - cy, gr = ctx.createLinearGradient(0, y0, 0, y0 + 140); gr.addColorStop(0, 'rgba(210,200,255,0.2)'); gr.addColorStop(1, 'rgba(210,200,255,0)'); ctx.fillStyle = gr; ctx.fillRect(Q.SC - RF_HW + 6, Math.max(0, Math.round(y0)), RF_HW * 2 - 12, 140); }      // (the light from the street falls down the slot)
  if (t >= T.fall && t < T.land) { const sp = Math.min(1, (t - T.fall) / 0.4); for (let i = 0; i < 14; i++) { const x = Math.round(Q.SC - RF_HW + 6 + rfH(i, 1, 51) * (RF_HW * 2 - 12)), y = (rfH(i, 2, 51) * (VH + 40) + cy * 1.6) % (VH + 40); ctx.fillStyle = 'rgba(190,180,215,' + (0.25 * sp).toFixed(2) + ')'; ctx.fillRect(x, Math.round(VH - y), 1, 6 + (i % 4) * 3); } }      // (the wall rushes past)
  const gnd = t < T.fall - 0.25 || t >= T.land;
  if (s.gm === 0 && t >= T.arm && cy >= RF_D - 1) { const k = clamp01((t - T.arm) / 7), px = Q.vp.x + 28, rx = 8 + 36 * k, ry = 2 + 3.4 * k; for (let yy = -Math.floor(ry); yy <= Math.floor(ry); yy++) { const w = Math.floor(rx * Math.sqrt(Math.max(0, 1 - yy * yy / ((ry + 0.5) * (ry + 0.5))))); ctx.fillStyle = '#4a0810'; ctx.fillRect(Math.round(px - w), Q.Y0 + 2 + yy, 2 * w + 1, 1); if (Math.abs(yy) < ry - 1) { ctx.fillStyle = '#7a0c16'; ctx.fillRect(Math.round(px - w + 2), Q.Y0 + 2 + yy, Math.max(0, 2 * w - 3), 1); } } }      // (the pool under him)
  if (gnd) { shadow(Q.ax, 9); shadow(t >= T.land ? (t < T.rise ? Q.vp.x + 26 : Q.vp.x) : Q.vp.x, t >= T.land && (t < T.rise || t >= T.say1 - 0.2) ? 28 : 9); }
  // the enemy (everything is cut off at the floor: on his knees his legs are under it)
  const ge = off ? 0 : t >= T.hole ? 2 : t >= T.arm ? 1 : 0, p = off || t < T.burn ? 0 : t >= T.burnEnd ? 1 : ease3((t - T.burn) / (T.burnEnd - T.burn)), fa = s.lastHit !== undefined ? 0.75 * Math.max(0, 1 - (t - s.lastHit) / 0.07) : 0;
  ctx.save(); ctx.beginPath(); ctx.rect(-8, -8, VW + 16, Math.round(Q.floor) + 8); ctx.clip();
  rfDrawV(ryfImg(s, ge, p), Q.vp, Q.bend, t >= T.burn && t < T.burnEnd ? fa : t >= T.hit && t < T.hit + 0.1 ? 0.8 : t >= T.knee && t < T.knee + 0.12 ? 0.9 : 0);
  if (t >= T.back && t < T.back + 0.7 && Q.waist) { const k = (t - T.back) / 0.7, w = Q.waist, a = 1 - k; ctx.globalAlpha = a; ctx.fillStyle = '#ffffff'; for (let i = 0; i < 7; i++) { const an = -1.1 + i * 0.36, L = 4 + (i % 3) * 3 + k * 6; let x = w[0], y = w[1]; for (let r = 0; r < L; r++) { x += Math.cos(an + (rfH(r, i, 71) - 0.5) * 0.9); y += Math.sin(an + (rfH(r, i, 72) - 0.5) * 0.9); ctx.fillRect(Math.round(x), Math.round(y), 1, 1); } } if (k < 0.15) ctx.fillRect(Math.round(w[0]) - 2, Math.round(w[1]) - 2, 5, 5); ctx.globalAlpha = 1; }      // (the crack of the back: white lines run out from the waist)
  if (t >= T.swing + 0.0 && t < T.swing + 0.3 && t >= T.swing - 0.05) { const k = clamp01((t - T.swing) / 0.14), a = Q.sho, f = [Q.ax + 8, Q.Y0 + Q.lag - 50], x = a[0] + (f[0] - a[0]) * k, y = a[1] + (f[1] - a[1]) * k; bline(a[0], a[1], x, y, '#2a1a1a', 4); bline(a[0], a[1], x, y, '#e8b88c', 3); ctx.fillStyle = '#2a1a1a'; ctx.fillRect(Math.round(x) - 3, Math.round(y) - 3, 6, 6); ctx.fillStyle = '#f0c8a0'; ctx.fillRect(Math.round(x) - 2, Math.round(y) - 2, 4, 4); if (t >= T.swing + 0.14) { ctx.fillStyle = '#ffffff'; ctx.fillRect(Math.round(x) + 1, Math.round(y) - 1, 4, 3); } }      // (his punch: a straight arm and a fist at Ryu's face)
  ctx.restore();
  // Ryu (in front of him)
  ctx.save(); ctx.beginPath(); ctx.rect(-8, -8, VW + 16, Math.round(Q.floor) + 8); ctx.clip(); ctx.translate(Math.round(Q.ax), Math.round(Q.Y0 + Q.lag)); if (Q.rt) ctx.rotate(Q.rt); ctx.drawImage(rfIn(s, Q.pic), -32, -s.R.fr); ctx.restore();
  // the beams, then everything small
  const co = ryCol(0);
  for (const b of s.beams) { const age = t - b.t0; if (age < 0 || age > 0.2) continue; const u = age / 0.2, th = Math.max(1, Math.round(b.th * (u < 0.3 ? 1 : 1 - (u - 0.3) / 0.7))), h = c => Math.floor(c / 2); ctx.globalAlpha = u > 0.7 ? (1 - u) / 0.3 : 1;
    for (const [w, c] of [[th + 2, co.o], [th, co.m], [Math.max(1, Math.round(th * 0.45)), co.c]]) bline(b.x0 - h(w), b.y0 - h(w), b.x1 - h(w), b.y1 - h(w), c, w);
    if (u < 0.5) { ctx.fillStyle = co.c; ctx.fillRect(Math.round(b.x1) - 2, Math.round(b.y1) - 2, 5, 5); ctx.fillStyle = co.m; ctx.fillRect(Math.round(b.x0) - 2, Math.round(b.y0) - 2, 4, 4); } ctx.globalAlpha = 1; }
  for (const q of s.parts) { const a = q.age / q.life, y = Math.round(q.y - (q.w ? cy : 0)); if (q.k === 'dust') { ctx.globalAlpha = 0.32 * (1 - a); ctx.fillStyle = q.col; const z = Math.round(q.z + q.age * 4); ctx.fillRect(Math.round(q.x - z / 2), y - z, z, z); } else if (q.k === 'smoke') { ctx.globalAlpha = 0.45 * (1 - a); ctx.fillStyle = q.col; const z = Math.round(q.z + q.age * 2); ctx.fillRect(Math.round(q.x - z / 2), y - z, z, z); } else { ctx.globalAlpha = q.k === 'arm' ? 1 - Math.max(0, a - 0.5) * 2 : 1 - a * 0.4; ctx.fillStyle = q.k === 'arm' && a > 0.3 ? q.col2 : q.col; ctx.fillRect(Math.round(q.x), y, q.z, q.z); } ctx.globalAlpha = 1; }
}
function ryfCut(s, t, now) {      // the table: it starts on the cake in the middle and zooms out until the whole table is there; the last moment shakes and a crack runs through the picture
  const T = RFT, c = rfCake(), bh = Math.round(VH * 0.11), fit = Math.min((VW - 8) / 144, (VH - 2 * bh - 6) / 81), u = clamp01((t - T.cut) / (T.knee - T.cut - 0.3)), z = lerp(fit * 4.6, fit, ease3(u)), end = clamp01((t - (T.knee - 0.3)) / 0.3);
  ctx.fillStyle = '#120a10'; ctx.fillRect(0, 0, VW, VH); ctx.save(); ctx.beginPath(); ctx.rect(0, bh, VW, VH - 2 * bh); ctx.clip();
  const jx = end > 0 ? Math.round((Math.random() * 2 - 1) * 3 * end * SET.shk / 100) : 0, jy = end > 0 ? Math.round((Math.random() * 2 - 1) * 2 * end * SET.shk / 100) : 0;
  ctx.translate(VW / 2 + jx, VH / 2 + jy); ctx.scale(z, z); ctx.translate(-73, -40); ctx.imageSmoothingEnabled = false; ctx.drawImage(c, 0, 0);
  for (const [i, [x, y]] of [[66, 27], [84, 33], [58, 45], [82, 50], [73, 23], [49, 38], [95, 40]].entries()) { const a = 0.5 + 0.5 * Math.sin(now / 130 + i * 1.7); if (a < 0.45) continue; ctx.fillStyle = '#ffffff'; ctx.fillRect(x - 3, y, 7, 1); ctx.fillRect(x, y - 3, 1, 7); ctx.fillStyle = '#fff0a0'; ctx.fillRect(x - 1, y, 3, 1); ctx.fillRect(x, y - 1, 1, 3); }      // (twinkles round the cake)
  ctx.restore();
  if (t >= T.knee - 0.12) { ctx.fillStyle = '#ffffff'; let x = VW / 2 + 6; for (let y = bh; y < VH - bh; y += 2) { x += Math.round((rfH(y, 1, 61) - 0.5) * 7); ctx.fillRect(x, y, 2, 2); } }      // (the crack: his back)
}
function ryfX(s, x) { return s.rev ? VW - x : x; }      // (a place of the scene -> the column of the screen: the enemy Ryu's scene is drawn turned round, the words are not)
function rfSay(s, txt, x, y, col, sz, al) { if (!s.said.includes(txt)) s.said.push(txt); return pxt(txt, x, y, col, sz, al); }
function ryfText(s, t, now, Q) {      // SWEET (Ryu's) and the two things the enemy says
  const T = RFT;
  if (t >= T.sweet && t < T.cut - 0.05) { const j = Math.round(Math.sin(now / 40)); const hd = ryHairTop(Q.pic) || [32, 8]; rfSay(s, 'SWEET', ryfX(s, Q.rx + hd[0]) + j, Math.round(Math.max(VH * 0.11 + 18, Q.ry + hd[1] - 6)) + (j ? 1 : 0), '#ffd0e4', 16, 'center'); }
  const f = [ryfX(s, Q.face[0]), Q.face[1]], bh = Math.round(VH * 0.11), y = bh + 22;
  const block = (lines, shown, W, col) => { const x0 = Math.max(4, Math.min(VW - W - 4, Math.round(f[0] - W / 2))); let left = shown; lines.forEach((l, i) => { const n = Math.min(l.length, left); left -= l.length + 1; if (n > 0) pxt(l.slice(0, n), x0, y + i * 11, col, 8, 'left'); });
    ctx.fillStyle = '#ffe6d6'; for (let yy = y + lines.length * 11 - 4; yy < f[1] - 10; yy += 3) ctx.fillRect(Math.max(x0 + 4, Math.min(x0 + W - 4, Math.round(f[0]))), yy, 1, 1); };      // (the words and a dotted line from them down to his head)
  if (t >= T.say1 && t < T.say2 - 0.15) { block(RF_L1, 99, 160, '#ffe6d6'); if (!s.said.includes(RF_L1.join(' '))) s.said.push(RF_L1.join(' ')); }
  if (t >= T.say2 && t < T.die + 0.3) { const n = Math.min(RF_L2.length, 1 + Math.floor((t - T.say2) / RF_ROW)); block(RF_L2B, n, 112, n >= RF_L2.length ? '#ffffff' : '#ffe6d6'); if (!s.said.includes(RF_L2.slice(0, n))) s.said.push(RF_L2.slice(0, n)); }      // (typed out letter by letter: it ends with the N and the dash, and nothing comes after them)
}
function ryfFrame(now, dt) {
  const s = ryf, T = RFT; keyL = keyR = padL = padR = jumpReq = atkReq = crReq = lpReq = dashReq = ceReq = domReq = blockHeld = false; fatReq = 0; cuAtkQ = cuLpQ = 0;
  if (!s.V) ryfPrep(s); if (!s.rock || s.rockK !== VW + ',' + VH + ',' + gy) rfRock(s);
  const live = now >= s.freeze; if (live) s.t += dt; const t = s.t, sdt = live ? dt : 0, off = s.gm === 2, at = (k, tt, f) => { if (!s.ev[k] && t >= tt) { s.ev[k] = 1; f(); } };
  const Q = ryfPose(s, t, now); ryfEvents(s, t, now, Q, at, off); s.beams = s.beams.filter(b => t - b.t0 < 0.3);
  for (const q of s.parts) { q.age += sdt; q.x += q.vx * sdt; q.y += q.vy * sdt; q.vy += q.g * sdt; } s.parts = s.parts.filter(q => q.age < q.life);
  ctx.save(); ctx.imageSmoothingEnabled = false; ctx.fillStyle = '#000'; ctx.fillRect(0, 0, VW, VH);
  const cutIn = t >= T.cut && t < T.knee, dark = off && t >= T.burn - 0.1 && t < T.burnEnd + 0.1;
  if (cutIn) ryfCut(s, t, now);
  else if (!dark) {
    ctx.save(); if (s.rev) { ctx.translate(VW, 0); ctx.scale(-1, 1); } const amp = (t < T.fall ? 3 : 2) * SET.shk / 100; if (now < s.shake) ctx.translate(Math.round((Math.random() * 2 - 1) * amp), Math.round((Math.random() * 2 - 1) * amp)); wx = s.wx0;
    ryfWorld(s, t, now, Q); ctx.restore();
  }
  if (now < s.flash && now >= s.freeze - 1 && !dark) { const a = rfFl(0.85); if (a > 0.004) { ctx.globalCompositeOperation = 'difference'; ctx.fillStyle = 'rgba(255,255,255,' + a.toFixed(3) + ')'; ctx.fillRect(0, 0, VW, VH); ctx.globalCompositeOperation = 'source-over'; } }
  if (!cutIn && !dark) ryfText(s, t, now, Q);
  if (t >= T.title) { ctx.fillStyle = 'rgba(0,0,0,' + (0.55 * clamp01((t - T.title) / 0.3)).toFixed(2) + ')'; ctx.fillRect(0, 0, VW, VH); fatTitle(t - T.title, 1); }
  const bh = Math.round(VH * 0.11), b = bh * ease3(clamp01(t / 0.3)) * (1 - ease3((t - (T.end - 0.5)) / 0.4)); ctx.fillStyle = '#000'; ctx.fillRect(0, 0, VW, Math.round(b)); ctx.fillRect(0, VH - Math.round(b), VW, Math.round(b));
  const fa = clamp01((t - (T.end - 0.5)) / 0.5); if (fa > 0) { ctx.fillStyle = 'rgba(0,0,0,' + fa.toFixed(3) + ')'; ctx.fillRect(0, 0, VW, VH); }
  ctx.restore();
  if (t >= T.end) ryfEnd(now);
}
