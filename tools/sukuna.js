// ---------------------------------------------------------------- v1.107 SUKUNA (v1.108: he walks, jumps and crouches like Yuji): a new fighter in FREE PLAY (this file is spliced into template.html by build_html.py, right after custom.js)
// He is a fighter of the custom kind (customScene in custom.js) whose drawings are made by tools/sukuna_art.py (build_html.py fills SUK_PNG with their picture strip: 6 rows of 15 pictures, the rows named in SUK_ROWS): his 15 idle pictures, and Yuji's own pictures of the walk, the jump, the crouch down, the crouched idle and the crouch walk with his head. In the match he stands, breathes and blinks like Yuji, and he moves like Yuji (g.yu): he walks at 56 px/s forward and 38 back with Yuji's legs (walkVel) and his 15 walking pictures at 19 a second (backwards for walking back), jumps with Yuji's timing (jumpFrame: the push-off, the flight along the real arc, the landing) and height (YU.jump.lift) and the dust of his jump, can be steered in the air as Yuji can (pictures 3 to 11), crouches with S, C or the stick's down position (15 pictures at 48 a second, the same backwards to get up, then the crouched idle at 12 a second) and crouch-walks at 60% of the speed with the pictures of the crouch walk. He cannot crouch-jump, dash, block or punch yet (whatever is pressed is dropped, as for a custom fighter that has not drawn them), and his body is measured on his idle pictures like every custom fighter's (cuMeasure). His slot is 3, after the three that can be drawn, so cuSelRefresh leaves his card alone.
const SUK_WHO = 'cu3', SUK_PNG = '__SUKPNG__', SUK_ROWS = ['frames', 'walk', 'jump', 'cr', 'ci', 'cwk'];      // (the rows of the picture strip: idle, walk, jump, crouch down, crouched idle, crouch walk; the cut-out names are those of the pictures of a custom fighter)
NAMES[SUK_WHO] = 'SUKUNA'; CEC[SUK_WHO] = ['#2a0a12', '#d02a3a', '#ffb0b8', '#ff7a86'];      // (his name on the HUD and his energy bar: crimson)
(() => {
  const im = new Image();
  im.onload = () => {      // the strip is cut into 64 x 64 pictures, a row for each move (until then he is not there: his card shows nothing and a match shows no picture)
    const n = Math.floor(im.width / 64), set = {}, arts = [], none = () => [[], [], [], []];
    SUK_ROWS.forEach((k, r) => {
      set[k] = []; for (let i = 0; i < n; i++) {
        const c = document.createElement('canvas'); c.width = c.height = 64; const g = c.getContext('2d'); g.drawImage(im, i * 64, r * 64, 64, 64, 0, 0, 64, 64); set[k].push(c);
        if (!r) { const d = g.getImageData(0, 0, 64, 64).data, a = new Uint8Array(4096); for (let q = 0; q < 4096; q++) a[q] = d[q * 4 + 3] > 127 ? 1 : 0; arts.push(a); }
      }
    });
    const body = cuWiden(arts.map(a => cuSpan(a, r => r - 1))), hs = Object.values(body).map(v => v[1]).sort((a, b) => a - b);      // (the widest every row gets over his idle pictures, and half as wide as his torso for the push, as in cuMeasure)
    CU_GAME[3] = { name: 'SUKUNA', frames: set.frames, walk: set.walk, jump: set.jump, hu: [], ko: [], bl: [], df: [], db: [], cr: set.cr, ci: set.ci, cwk: set.cwk, st: { ...cuStats(null), fw: FWD_SPEED, bk: BACK_SPEED, cw: 60, jh: 22, jt: 713 }, vfx: none(), atk: none(), an: ['M1 #1', 'M1 #2', 'M1 #3', 'M1 #4'], rdy: [], ev: none(), set: [{}, {}, {}, {}], body, push: Math.max(5, hs.length ? hs[hs.length >> 1] : 5), tipAll: [{}, {}, {}, {}], vxs: none(),
      yu: true, wf: WALK_FPS, crMs: 1000 / CR_FPS };      // (yu: he moves like Yuji; wf: his walking pictures a second; crMs: how long a picture of the crouch lasts; the stats are Yuji's: 56 and 38 px/s, 60% while crouched, a jump of 22 px, 713 ms of flight)
  };
  im.src = SUK_PNG;
})();
