// ---------------------------------------------------------------- v1.107 SUKUNA: a new fighter in FREE PLAY (this file is spliced into template.html by build_html.py, right after custom.js)
// He is a fighter of the custom kind (customScene in custom.js) whose only drawing is his 15 idle pictures (tools/sukuna_art.py makes them; build_html.py fills SUK_PNG with their picture strip): in the match he stands, breathes and blinks like Yuji and does nothing else yet - no walking, jumping, crouching, dashing, blocking or punching (whatever you press is dropped, as for a custom fighter that has not drawn them) - and his body is measured on his pictures like every custom fighter's (cuMeasure). His slot is 3, after the three that can be drawn, so cuSelRefresh leaves his card alone.
const SUK_WHO = 'cu3', SUK_PNG = '__SUKPNG__';
NAMES[SUK_WHO] = 'SUKUNA'; CEC[SUK_WHO] = ['#2a0a12', '#d02a3a', '#ffb0b8', '#ff7a86'];      // (his name on the HUD and his energy bar: crimson)
(() => {
  const im = new Image();
  im.onload = () => {      // the strip is cut into 64 x 64 pictures (until then he is not there: his card shows nothing and a match shows no picture)
    const frames = [], arts = [], none = () => [[], [], [], []];
    for (let i = 0; i < Math.floor(im.width / 64); i++) {
      const c = document.createElement('canvas'); c.width = c.height = 64; const g = c.getContext('2d'); g.drawImage(im, i * 64, 0, 64, 64, 0, 0, 64, 64);
      const d = g.getImageData(0, 0, 64, 64).data, a = new Uint8Array(4096); for (let k = 0; k < 4096; k++) a[k] = d[k * 4 + 3] > 127 ? 1 : 0;
      frames.push(c); arts.push(a);
    }
    const body = cuWiden(arts.map(a => cuSpan(a, r => r - 1))), hs = Object.values(body).map(v => v[1]).sort((a, b) => a - b);      // (the widest every row gets over his pictures, and half as wide as his torso for the push, as in cuMeasure)
    CU_GAME[3] = { name: 'SUKUNA', frames, walk: [], jump: [], hu: [], ko: [], bl: [], df: [], db: [], cr: [], ci: [], st: cuStats(null), vfx: none(), atk: none(), an: ['M1 #1', 'M1 #2', 'M1 #3', 'M1 #4'], rdy: [], ev: none(), set: [{}, {}, {}, {}], body, push: Math.max(5, hs.length ? hs[hs.length >> 1] : 5), tipAll: [{}, {}, {}, {}], vxs: none() };
  };
  im.src = SUK_PNG;
})();
