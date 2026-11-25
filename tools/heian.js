// ================================================================ v1.223 HEIAN SUKUNA, A FIGHTER OF TRAINING (this file is spliced into template.html by build_html.py, after Iron Man's chapters; build_html.py fills HE_PNG with tools/heian_sheet.png, which tools/heian_art.py draws)
// The user: "add him to the training section as a playable character, letting you only walk forward and backwards and stand still so add a walking anim to him and an idle anim". He is the fighter slot cu6 of the custom engine (tools/custom.js): customScene walks him and draws him, the enemy, the HUD and the effects are the shared ones.
// His pictures are the figure of the Heian art series (96 px tall, four arms, the mouth on his belly; the user approved it as version 8), 64 x 100 each: the strip has three rows: IDLE (20 pictures: a breath, his hair and the ends of his sash sway, the tongue of the belly mouth flicks, he blinks once), WALK (8) and WALK BACK (8). His middle column is 32 and his soles are on row 98 (the 62 of a 64 row picture plus 36): g.eh = 36 tells customScene that his pictures have 36 rows more above than the usual 64, so he stands on the same floor line as everyone. 8 pictures a stride at 14 a second and 56 px a second (40 walking back) keep his feet on the floor.
// He has no blows, no block, no dash, no jump, no crouch and no HURT or K.O. pictures, so while he fights all the buttons are hidden (the CSS of body.he, toggled in tick), and the fighter screen lets him fight in TRAINING only, as your fighter (fsWhy in tools/select.js).
const HE_WHO = 'cu6', HE_PNG = '__HEPNG__', HE_ROWS = [['frames', 20], ['walk', 8], ['wbk', 8]], HE_W = 64, HE_H = 100, HE_EH = HE_H - 64, HE_WF = 14;      // (the rows of the strip and how many pictures each has; HE_WF: his walking pictures a second)
NAMES[HE_WHO] = 'HEIAN SUKUNA'; CEC[HE_WHO] = ['#1a1228', '#6a4ad0', '#c8b4ff', '#a080ff'];      // (his name on the HUD and his energy bar: the violet of his sash)
let heUI = false;      // (is his HUD on: every button is hidden, see tick)
function heSpan(c) {      // the rows of a 64 x 100 picture, as cuSpan measures a 64 x 64 one: { row: [farthest pixel behind his middle column, farthest in front of it] }; a row of a picture sits on the row (picture row - 1 - HE_EH) of the tables, so his feet are on the same row as everyone's and his head is above row 0
  const d = c.getContext('2d').getImageData(0, 0, HE_W, HE_H).data, o = {};
  for (let r = 0; r < HE_H; r++) { let lo = 99, hi = -99; for (let x = 0; x < HE_W; x++) if (d[(r * HE_W + x) * 4 + 3] > 127) { if (x < lo) lo = x; if (x > hi) hi = x; } if (hi >= 0) o[r - 1 - HE_EH] = [lo - 32, hi - 32]; }
  return o;
}
(() => {
  const im = new Image();
  im.onload = () => {      // the strip is cut into 64 x 100 pictures, a row for each animation (until then he is not there: his card shows nothing)
    const set = {}; HE_ROWS.forEach(([k, n], r) => { set[k] = []; for (let i = 0; i < n; i++) { const c = document.createElement('canvas'); c.width = HE_W; c.height = HE_H; c.getContext('2d').drawImage(im, i * HE_W, r * HE_H, HE_W, HE_H, 0, 0, HE_W, HE_H); set[k].push(c); } });
    const body = cuWiden(set.frames.map(heSpan)), hs = Object.values(body).map(v => v[1]).sort((a, b) => a - b);      // (the widest every row of his idle pictures gets: his body in the hitboxes of the enemy's blows, and the middle of the rows' reach for the push, like Iron Man's)
    const vic = set.frames.slice(0, 15).map(c => { const v = document.createElement('canvas'); v.width = v.height = 64; const g = v.getContext('2d'); g.imageSmoothingEnabled = false; g.drawImage(c, 0, 0, HE_W, HE_H, 12, 0, 41, 64); return v; });      // (the cutscenes that need a 64 x 64 victim, see cuVictim, get him smaller: they were drawn for the usual size)
    CU_GAME[6] = { name: 'HEIAN SUKUNA', frames: set.frames, walk: set.walk, wbk: set.wbk, jump: [], hu: [], ko: [], bl: [], df: [], db: [], cr: [], ci: [], cwk: [], atk: [], an: [], rdy: [], cl: [], ev: [], set: [], vfx: [], vxs: [], tipAll: [], body, push: Math.max(6, hs.length ? hs[hs.length >> 1] : 6), cs: null, wf: HE_WF, eh: HE_EH, vic, he: true, st: { ...cuStats(null), fw: 56, bk: 40 } };      // (everything he cannot do is an empty list, which customScene reads as "not there")
  };
  im.src = HE_PNG;
})();
