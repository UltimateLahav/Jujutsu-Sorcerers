// ================================================================ v1.148 THE FACES: the close-ups of chapter 4 drawn as cel-shaded pixel portraits at the game's own pixel size (1 picture pixel = 1 game pixel).
// Everything is made of flat-coloured polygons and tapered strokes (splines through a few points) that are filled straight into the pixel grid of tools/megumi.js (no smoothing, no blur): the head, the neck and the ears, the cel shadows and lights on the skin
// (a tone is only painted over the tones it is darker / lighter than, so it stays inside the face), the eyes (lid, eyeball, iris in 3 tones, pupil, two lights, lashes), the brows, the nose, the mouth, the marks of Sukuna, the hair in spikes with a dark outline.
// All the numbers below are in "design" units (1 unit = 1.3 pixels, measured from the middle between the eyes); the painter scales them. c15Faces.face({ who: 'suk' | 'yuji' | 'meg', ... }) -> a 320 x 330 canvas (the eyes on row 170).
// Pictures are cached by their numbers: pass numbers cut into steps.
const c15Faces = (() => {
  const { Pix, K } = c15MegKit, W = 320, H = 330, CX = 160, EY = 170, SC = 1.3, cache = new Map(), lerp = (a, b, t) => a + (b - a) * t, cl = (v, a, b) => Math.max(a, Math.min(b, v)), BAY = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];
  const C = h => K(h) >>> 0, hexMix = (a, b, t) => { const u = [1, 3, 5].map(i => parseInt(a.slice(i, i + 2), 16)), v = [1, 3, 5].map(i => parseInt(b.slice(i, i + 2), 16)); return '#' + u.map((x, i) => Math.round(x + (v[i] - x) * t).toString(16).padStart(2, '0')).join(''); };
  const memo = (k, f, max, st) => { const m = st || cache; let c = m.get(k); if (!c) { c = f(); m.set(k, c); if (m.size > (max || 24)) m.delete(m.keys().next().value); } return c; }, hcache = new Map();
  // ---- the pixel painter: polygons, tapered strokes, 1 px lines, with "only over these colours" and a dither (a number 0 - 1, or a function of x, y)
  function spl(pts, closed, seg) {      // a smooth curve through the points (Catmull-Rom), as a list of points
    const n = pts.length, out = [], sg = seg || 6, P = i => closed ? pts[(i + n) % n] : pts[cl(i, 0, n - 1)];
    for (let i = 0; i < (closed ? n : n - 1); i++) { const p0 = P(i - 1), p1 = P(i), p2 = P(i + 1), p3 = P(i + 2); for (let s = 0; s < sg; s++) { const t = s / sg, t2 = t * t, t3 = t2 * t; out.push([0.5 * (2 * p1[0] + (-p0[0] + p2[0]) * t + (2 * p0[0] - 5 * p1[0] + 4 * p2[0] - p3[0]) * t2 + (-p0[0] + 3 * p1[0] - 3 * p2[0] + p3[0]) * t3), 0.5 * (2 * p1[1] + (-p0[1] + p2[1]) * t + (2 * p0[1] - 5 * p1[1] + 4 * p2[1] - p3[1]) * t2 + (-p0[1] + 3 * p1[1] - 3 * p2[1] + p3[1]) * t3)]); } }
    if (!closed) out.push(pts[n - 1]); return out;
  }
  const elp = (cx, cy, rx, ry, rot, n) => { const o = [], c = Math.cos(rot || 0), s = Math.sin(rot || 0), m = n || 28; for (let i = 0; i < m; i++) { const a = i / m * Math.PI * 2, x = Math.cos(a) * rx, y = Math.sin(a) * ry; o.push([cx + x * c - y * s, cy + x * s + y * c]); } return o; };
  class Cv extends Pix {
    constructor(w, h, sc, ox, oy) { super(w || W, h || H); this.sc = sc || SC; this.ox = ox === undefined ? CX : ox; this.oy = oy === undefined ? EY : oy; }
    tr(q) { return [this.ox + (q[0] - CX) * this.sc, this.oy + (q[1] - EY) * this.sc]; }
    poly(pts0, col, over, d) {      // fills a polygon with a flat colour; over = only where the pixel has one of these colours; d = 0 - 1: a dither (0.5 = every other pixel), or a function (x, y) -> true where to paint
      const pts = pts0.map(q => this.tr(q)), n = pts.length, g = this.g, w = this.w, fn = typeof d === 'function', lim = d === undefined || fn ? 99 : Math.round(d * 16), xs = []; let y0 = 1e9, y1 = -1e9; for (let i = 0; i < n; i++) { const y = pts[i][1]; if (y < y0) y0 = y; if (y > y1) y1 = y; }
      y0 = Math.max(0, Math.ceil(y0 - 0.5)); y1 = Math.min(this.h - 1, Math.floor(y1 - 0.5));
      for (let y = y0; y <= y1; y++) {
        const yc = y + 0.5; xs.length = 0; for (let i = 0; i < n; i++) { const a = pts[i], b = pts[i + 1 === n ? 0 : i + 1]; if ((a[1] <= yc) !== (b[1] <= yc)) xs.push(a[0] + (yc - a[1]) * (b[0] - a[0]) / (b[1] - a[1])); }
        xs.sort((p, q) => p - q);
        for (let k = 0; k + 1 < xs.length; k += 2) for (let x = Math.max(0, Math.ceil(xs[k] - 0.5)), xe = Math.min(w - 1, Math.floor(xs[k + 1] - 0.5)); x <= xe; x++) { if (fn ? !d(x, y) : BAY[(y & 3) * 4 + (x & 3)] >= lim) continue; const i = y * w + x; if (over === undefined || over.includes(g[i])) g[i] = col; }
      }
    }
    stroke(pts, ws, col, over, d) {      // a line along the points whose width goes through the numbers of ws (design units; it can taper to a point)
      const n = pts.length, L = [], R = [], cum = [0]; let tot = 0; for (let i = 1; i < n; i++) { tot += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); cum.push(tot); }
      for (let i = 0; i < n; i++) {
        const a = pts[Math.max(0, i - 1)], b = pts[Math.min(n - 1, i + 1)], dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy) || 1, f = (tot ? cum[i] / tot : 0) * (ws.length - 1), k = Math.min(ws.length - 2, Math.floor(f)), wd = (ws.length === 1 ? ws[0] : lerp(ws[k], ws[k + 1], f - k)) / 2;
        L.push([pts[i][0] - dy / l * wd, pts[i][1] + dx / l * wd]); R.push([pts[i][0] + dy / l * wd, pts[i][1] - dx / l * wd]);
      }
      this.poly(L.concat(R.reverse()), col, over, d);
    }
    pl(pts, col, over) {      // a 1 px line through the points
      const q = pts.map(a => this.tr(a)); for (let i = 0; i + 1 < q.length; i++) { const a = q[i], b = q[i + 1], m = Math.ceil(Math.max(Math.abs(b[0] - a[0]), Math.abs(b[1] - a[1]))) || 1; for (let k = 0; k <= m; k++) { const x = Math.round(a[0] + (b[0] - a[0]) * k / m), y = Math.round(a[1] + (b[1] - a[1]) * k / m); if (x < 0 || y < 0 || x >= this.w || y >= this.h) continue; const j = y * this.w + x; if (over === undefined || over.includes(this.g[j])) this.g[j] = col; } }
    }
  }
  // ---- the colours: skin = deep shade mid light hi; hair = ink dark shade mid light hi
  const SKINH = { sy: ['#9a5a48', '#d08c6c', '#f2b894', '#fdd4b0', '#ffe9d0'], meg: ['#a2685a', '#d89a82', '#f7c9aa', '#ffdfc4', '#fff0e0'] };      // (warm human skin: peach lights, red-brown shadows)
  const SKIN = { sy: SKINH.sy.map(C), meg: SKINH.meg.map(C) };
  const SKINP = { sy: ['#a8786a', '#d9ae9a', '#f0d0b8', '#f9e3d0', '#fff2e6'], meg: ['#ac8274', '#dfb8a4', '#f5d9c4', '#fcead9', '#fff6ee'] };      // (a face that has lost its blood: still skin, only pale and cool)
  const HAIR = { sy: ['#3a1a2c', '#7e4660', '#bb7486', '#e49aaa', '#f8c4d0', '#fee6ea'].map(C), meg: ['#04030a', '#0c0a18', '#141228', '#222046', '#3e3e72', '#7070aa'].map(C) };
  const INK = C('#0a0610'), WHITE = C('#fff8f0'), TEARC = C('#cfe8f4'), TEARH = C('#ffffff'), TEETH = C('#f4eee8'), TEETHS = C('#c9bfc0'), MOUTH = C('#2a0a12'), TONGUE = C('#b04a58'), TONGUEH = C('#dc7884');
  const IRIS = { suk: ['#5c0c18', '#c42234', '#f0585c'], yuji: ['#3a200c', '#8a5428', '#d49648'], meg: ['#08121e', '#1c3a52', '#4a7e94'] };
  // ---- the looks: the head (the right half from the top to the chin: dx, dy from the eyes), the ears, the lips, the eyes, the brows
  const ST = {
    sy: { skin: SKIN.sy, hair: HAIR.sy, head: [[0, -64], [28, -62], [44, -52], [52, -36], [55, -12], [55, 12], [53, 34], [49, 52], [42, 65], [29, 72], [14, 75], [0, 75.5]], ear: [58, 3, 8, 16], lipU: C('#c0705c'), lipL: C('#d08470'), lipLine: C('#5a2a2a'), nose: 1.3, socket: 1 },
    meg: { skin: SKIN.meg, hair: HAIR.meg, head: [[0, -63], [26, -61], [41, -51], [49, -35], [51, -10], [51, 12], [49, 34], [45, 52], [38, 65], [26, 72], [13, 75], [0, 75.5]], ear: [54, 4, 7, 14], lipU: C('#b8786a'), lipL: C('#c88c7c'), lipLine: C('#52302e'), nose: 1.15, socket: 1 },
  };
  const ptone = (ms, pale) => pale > 0.05 ? Object.assign({}, ST[ms], { skin: SKINH[ms].map((h, i) => C(hexMix(h, SKINP[ms][i], pale))) }) : ST[ms];
  const EYE = {
    suk: { x0: 13, w: 29, h: 5.2, tilt: 3.4, ir: 6.2, pup: 'slit', pr: 1.4, ink: 3.0, lashes: 0, lash: 0, wing: 1.6 },
    yuji: { x0: 13, w: 29, h: 6.6, tilt: -0.4, ir: 7.0, pup: 'round', pr: 3, ink: 3.4, lashes: 0, lash: 0, wing: 1.2 },
    meg: { x0: 12, w: 28, h: 4.9, tilt: 1.8, ir: 6.2, pup: 'round', pr: 3.2, ink: 3.0, lashes: 0, lash: 0, wing: 1.4 },
  };
  const BROW = {      // the centre line of a brow (dx, dy from the eyes: the inner end first) and its widths
    suk: { pts: [[8, -13], [22, -17], [36, -18.5], [50, -17]], w: [6.4, 5.6, 3] },
    yuji: { pts: [[8, -15], [22, -18], [36, -19], [50, -16]], w: [8, 7.2, 4.4] },
    meg: { pts: [[8, -13], [22, -16], [36, -17], [50, -14]], w: [6.4, 5.6, 2.8] },
  };
  const mixO = (a, b, t) => { const o = {}; for (const k in a) o[k] = typeof a[k] === 'number' ? lerp(a[k], b[k], t) : t < 0.5 ? a[k] : b[k]; return o; };
  const mixB = (a, b, t) => ({ pts: a.pts.map((q, i) => [lerp(q[0], b.pts[i][0], t), lerp(q[1], b.pts[i][1], t)]), w: a.w.map((v, i) => lerp(v, b.w[i], t)) });
  const Q = (dx, dy) => [CX + dx, EY + dy], mid2 = (a, b, t) => [lerp(a[0], b[0], t), lerp(a[1], b[1], t)];
  // ---- the hair: a spike = base left, base right, tip, bend; filled, shaded on its right half, lit along its left edge, with strands, outlined
  function spike(p, Hc, b0, b1, tip, bend) {
    const mid = mid2(b0, b1, 0.5), nx = -(tip[1] - mid[1]), ny = tip[0] - mid[0], nl = Math.hypot(nx, ny) || 1, bd = bend || 0, bx = nx / nl * bd, by = ny / nl * bd;
    const cL = [lerp(b0[0], tip[0], 0.55) + bx, lerp(b0[1], tip[1], 0.55) + by], cR = [lerp(b1[0], tip[0], 0.55) + bx, lerp(b1[1], tip[1], 0.55) + by], cM = [lerp(mid[0], tip[0], 0.55) + bx, lerp(mid[1], tip[1], 0.55) + by];
    const left = spl([b0, cL, tip], false, 5), right = spl([tip, cR, b1], false, 5), outline = left.concat(right), centre = spl([mid, cM, tip], false, 5);
    p.poly(outline, Hc[3]); p.poly(right.concat([mid]), Hc[2], [Hc[3]]); p.poly(left.slice(0, Math.ceil(left.length * 0.8)).concat(spl([mid2(tip, mid, 0.3), mid2(b0, mid, 0.5)], false, 2)), Hc[4], [Hc[3]]);
    p.pl(centre.slice(2, -3), Hc[2], [Hc[3], Hc[4]]); p.pl(outline, Hc[0]);      // (the outline is open at the base: the spike grows out of the hair)
  }
  const SPY = { back: [[[-62, -18], [-60, -46], [-80, -22], -5], [[-60, -46], [-46, -70], [-82, -76], 6], [[-48, -70], [-24, -86], [-54, -112], -8], [[-26, -86], [2, -92], [-12, -124], 6], [[0, -92], [28, -86], [20, -122], -6], [[26, -86], [50, -70], [56, -108], 8], [[48, -70], [61, -46], [86, -72], -6], [[60, -46], [62, -18], [80, -20], 5]],
    crown: [[[-58, -48], [-40, -72], [-66, -92], -5], [[-44, -72], [-20, -82], [-42, -108], 6], [[-22, -82], [4, -86], [-10, -114], -4], [[2, -86], [28, -82], [18, -112], 5], [[26, -82], [48, -70], [44, -102], -6], [[46, -70], [60, -50], [74, -84], 5]],
    front: [[[-56, -36], [-34, -58], [-56, -10], 6], [[-38, -58], [-14, -62], [-24, -30], -4], [[-16, -62], [8, -62], [-2, -34], 3], [[4, -62], [30, -58], [18, -26], -5], [[26, -58], [52, -44], [46, -16], 5], [[58, -24], [50, -4], [54, 3], 0], [[-58, -24], [-50, -4], [-54, 3], 0]] };
  const SPM = { back: [[[-60, -36], [-50, -66], [-84, -80], 5], [[-52, -66], [-30, -84], [-58, -112], -4], [[-32, -84], [-8, -92], [-32, -122], 6], [[-10, -92], [14, -92], [2, -126], 0], [[12, -92], [36, -84], [36, -118], -6], [[34, -84], [54, -64], [64, -104], 4], [[52, -66], [60, -36], [86, -78], -5]],
    crown: [[[-52, -50], [-34, -74], [-58, -98], -4], [[-36, -74], [-12, -86], [-28, -114], 5], [[-14, -86], [12, -88], [0, -118], -3], [[10, -88], [34, -80], [28, -112], 5], [[32, -80], [54, -62], [62, -96], -5]],
    front: [[[-52, -34], [-34, -56], [-46, -25], 3], [[-36, -56], [-14, -60], [-26, -27], 0], [[-16, -60], [10, -60], [-4, -14], 0], [[6, -60], [30, -56], [16, -28], 0], [[26, -56], [50, -40], [42, -25], -3], [[54, -30], [48, -8], [52, 4], 0], [[-54, -30], [-48, -8], [-50, 4], 0]] };
  function hairBack(p, st, ms) {
    const Hc = st.hair, back = ms === 'sy' ? SPY.back : SPM.back, top = ms === 'sy' ? 88 : 92;
    p.poly(spl([Q(-62, -10), Q(-66, -34), Q(-62, -58), Q(-48, -top + 12), Q(-24, -top + 2), Q(0, -top), Q(24, -top + 2), Q(48, -top + 12), Q(62, -58), Q(66, -34), Q(62, -10)], false, 5).concat([Q(40, 10), Q(-40, 10)]), Hc[1]);
    for (const b of back) spike(p, Hc, Q(b[0][0], b[0][1]), Q(b[1][0], b[1][1]), Q(b[2][0], b[2][1]), b[3]);
  }
  function hairFront(p, st, ms, o) {
    const Hc = st.hair, fr = ms === 'sy' ? SPY.front : SPM.front, cr = ms === 'sy' ? SPY.crown : SPM.crown, hl = o.hair || 0;
    const line = [Q(-54, -26), Q(-48, -44), Q(-30, -54), Q(0, -58), Q(30, -54), Q(48, -44), Q(54, -26)];
    p.poly(spl([Q(-60, -22), Q(-66, -42), Q(-60, -64), Q(-44, -80), Q(-22, -90), Q(0, -93), Q(22, -90), Q(44, -80), Q(60, -64), Q(66, -42), Q(60, -22)], false, 5).concat(spl(line, false, 5).reverse()), Hc[3]);
    for (const b of cr) spike(p, Hc, Q(b[0][0], b[0][1]), Q(b[1][0], b[1][1]), Q(b[2][0], b[2][1]), b[3]);
    const S = st.skin; for (const b of fr) { const lo = ms === 'meg' && hl > 0 && Math.abs(b[2][0]) < 30 ? hl * 32 : 0; p.poly([Q(b[0][0] + 2, b[0][1] + 3), Q(b[1][0] + 3, b[1][1] + 4), Q(b[2][0] + 3, b[2][1] + lo + 5)], S[1], [S[2], S[3]], 0.7); }
    for (const b of fr) { const lo = ms === 'meg' && hl > 0 && Math.abs(b[2][0]) < 30 ? hl * 32 : 0; spike(p, Hc, Q(b[0][0], b[0][1]), Q(b[1][0], b[1][1]), Q(b[2][0], b[2][1] + lo), b[3]); }
  }
  // ---- one eye (s = -1: the left one on the picture, +1: the right one); e = the numbers of the eye
  function eyeAt(p, s, e, st) {
    const X = u => CX + s * (e.x0 + u), Y = v => e.y + v, N = 18, up = [], lo = [], lid = e.lid, S = st.skin, base = t => 2.4 - 1.3 * t - e.tilt * t;
    const hu = e.h * (lid >= 0 ? 1 - lid : 1 - 0.5 * lid), hl = e.h * 0.5 * (lid >= 0 ? 1 - 0.55 * lid : 1 - 0.25 * lid);
    for (let i = 0; i <= N; i++) { const t = i / N, bt = base(t); up.push([X(t * e.w), Y(bt - hu * Math.pow(Math.sin(Math.PI * Math.pow(t, 0.76)), 0.85))]); lo.push([X(t * e.w), Y(bt + hl * Math.pow(Math.sin(Math.PI * t), 0.9))]); }
    const scl = C(e.scl || '#f2ece4'), scl2 = C(e.scl2 || '#cdbfbb'), closed = lid > 0.93, so = e.socket || 0;
    if (so > 0.05) { const sh = (k, d) => p.poly(up.map(q => [q[0], q[1] - 1.5]).concat(up.map((q, i) => [q[0] + s * 1.5, q[1] - k * (0.35 + 0.65 * Math.sin(Math.PI * Math.min(1, (i + 3) / (N + 3)))) - 4]).reverse()), S[1], [S[2]], d); sh(e.h * 0.55 * so + 2); sh(e.h * 0.9 * so + 5, 0.4); }      // (the shadow of the brow bone over the lid: it curves with the lid and fades out)
    const cr = e.circles || 0; if (cr > 0.05) { const lw = lo.slice(1, N), th = i => (1.6 + 4.4 * cr) * Math.pow(Math.sin(Math.PI * (i + 1) / N), 0.7), ring = k => lw.map(q => [q[0], q[1] + 0.5]).concat(lw.map((q, i) => [q[0] + s * 0.4, q[1] + 1 + th(i) * k]).reverse()); p.poly(ring(1), S[1], [S[2], S[3]], 0.75); p.poly(ring(0.6), S[0], [S[1], S[2], S[3]], 0.35); }      // (dark rings under the eyes: a crescent)
    if (!closed) {
      p.poly(up.concat(lo.slice().reverse()), scl);
      const band = up.concat(up.slice().reverse().map(q => [q[0], q[1] + Math.max(1.6, hu * 0.32)])); p.poly(band, scl2, [scl]);
      const ic = [X(e.w * 0.5) + (e.look ? e.look[0] : 0), Y(-0.06 * e.h) + (e.look ? e.look[1] : 0)], r = e.ir * (lid < 0 ? 1 + 0.3 * lid : 1), all = [scl, scl2, e.iD, e.iM, e.iL, e.pupC];
      p.poly(elp(ic[0], ic[1], r, r * 1.04), e.iD, all); p.poly(elp(ic[0], ic[1] + 0.5, r * 0.84, r * 0.86), e.iL, all); p.poly(elp(ic[0], ic[1] - 0.1, r * 0.84, r * 0.8), e.iM, all);
      if (e.pup === 'slit') p.poly(elp(ic[0], ic[1], Math.max(0.9, e.pr * 0.55), r * 0.9), e.pupC, all); else p.poly(elp(ic[0], ic[1], e.pr, e.pr * 1.04), e.pupC, all);
      const wi = e.hi === undefined ? 1 : e.hi; if (wi) p.poly(elp(ic[0] - r * 0.36, ic[1] - r * 0.38, r * 0.16, r * 0.18, 0, 12), WHITE, all);      // (one small light; no light at all in a dead stare)
      if (e.veins) for (const [u0, v0, u1, v1] of [[0.04, 0.2, 0.3, 0.1], [0.06, 0.5, 0.26, 0.55], [0.96, 0.15, 0.74, 0.1], [0.97, 0.45, 0.78, 0.5], [0.9, 0.7, 0.72, 0.62]]) p.stroke(spl([[X(e.w * u0), Y(e.h * v0 * 0.5)], [X(e.w * (u0 + u1) / 2), Y(e.h * (v0 + v1) * 0.25 + 1)], [X(e.w * u1), Y(e.h * v1 * 0.5)]], false, 4), [0.5 * e.veins * (p.sc > 3 ? 1 : 1.8), 0.25], C('#c4585c'), [scl, scl2]);      // (red veins in the white of the eye)
      if (p.sc > 3) {      // a big eye: the fibres of the iris, the dark ring, a wet light, the veins in the white
        const rr = i => c4R(i, 71);
        for (let k = 0; k < 64; k++) { const a = k / 64 * Math.PI * 2 + rr(k) * 0.08, r0 = r * (0.34 + 0.14 * rr(k + 100)), r1 = r * (0.74 + 0.16 * rr(k + 200)); p.pl([[ic[0] + Math.cos(a) * r0, ic[1] + Math.sin(a) * r0 * 1.02], [ic[0] + Math.cos(a) * r1, ic[1] + Math.sin(a) * r1 * 1.02]], k % 3 ? e.iL : e.iD, [e.iM]); }
        p.poly(elp(ic[0], ic[1], r * 0.6, r * 0.6, 0, 28), e.iD, [e.iM, e.iL], 0.4); p.poly(elp(ic[0], ic[1], e.pr * 1.25, e.pr * 1.3, 0, 22), e.pupC, [e.iM, e.iL, e.iD]);
        if (e.refl) { const fx2 = ic[0], fy2 = ic[1] + r * 0.36, fr = r * 0.52, io = [e.iM, e.iL, e.iD, e.pupC], hc = e.refl === 2 ? C('#14122a') : C('#e8909e'), sk = C('#e8c9bd'), skd = C('#c8a096');
          p.poly(elp(fx2, fy2, fr, fr * 1.05, 0, 20), skd, io); p.poly(elp(fx2 - 0.5, fy2 - 0.3, fr * 0.9, fr, 0, 20), sk, [skd]); p.poly(spl([[fx2 - fr * 1.02, fy2 - fr * 0.2], [fx2 - fr * 0.8, fy2 - fr * 0.9], [fx2, fy2 - fr * 1.15], [fx2 + fr * 0.8, fy2 - fr * 0.9], [fx2 + fr * 1.02, fy2 - fr * 0.2], [fx2 + fr * 0.4, fy2 - fr * 0.55], [fx2 - fr * 0.4, fy2 - fr * 0.5]], false, 4), hc, [sk, skd, e.iM, e.iL, e.iD, e.pupC]);
          for (const sx of [-1, 1]) p.poly(elp(fx2 + sx * fr * 0.38, fy2 - fr * 0.08, fr * 0.14, fr * 0.1, 0, 8), C('#ff2a3c'), [sk]); p.stroke(spl([[fx2 - fr * 0.55, fy2 + fr * 0.38], [fx2, fy2 + fr * 0.62], [fx2 + fr * 0.55, fy2 + fr * 0.38]], false, 4), [fr * 0.2, fr * 0.2], C('#fff4ee'), [sk]); }
      }
      p.poly(band, INK, [e.iM, e.iL], 0.45);      // (the lid shadows the eye)
      p.stroke(lo.slice(2), [0.6, 1.0, 1.0, 0.6], C(e.lowC || '#8a5a58'), undefined, 0.9);
    }
    const ink = e.ink * (closed ? 0.8 : 1), lidPts = closed ? lo.map((q, i) => [q[0], q[1] + 1.2 * Math.sin(Math.PI * i / N)]) : up;
    p.stroke(lidPts.map(q => [q[0], q[1] - 0.6]), [ink * 0.55, ink * 0.8, ink, ink * 0.9, ink * 0.8], INK);
    const ot = lidPts[N], wing = spl([lidPts[N - 3], lidPts[N], [ot[0] + s * e.wing * 0.7, ot[1] - e.wing * 0.18], [ot[0] + s * e.wing * 1.5, ot[1] - e.wing * 0.5]], false, 4); p.stroke(wing, [ink * 0.9, ink * 0.5, 0.4], INK);
    for (let k = 0; k < e.lashes; k++) { const t = 0.62 + 0.34 * k / Math.max(1, e.lashes - 1), i = Math.round(t * N), a = lidPts[i], l = e.lash * (0.75 + 0.35 * Math.sin(Math.PI * (k + 0.5) / e.lashes)); p.stroke([a, [a[0] + s * l * 0.5, a[1] - l * 0.35], [a[0] + s * l * 0.95, a[1] - l * 0.2 - 1]], [1.4, 0.9, 0.3], INK); }
    if (!closed) { p.stroke(up.map(q => [q[0] + s * 0.4, q[1] - e.h * 0.62 - 3]).slice(1, N - 1), [0.5, 1.0, 1.0, 0.5], S[1], [S[2], S[3]], 0.8); p.poly(elp(X(0.8), Y(2.2), 1.4, 1.1, 0, 8), C('#d98a86'), [scl, S[2], S[3]]); }
    return { up, lo };
  }
  const ms2 = who => who === 'meg' ? 'meg' : 'sy';
  // ---- the brows (bw: worry = the inner end up, bf: anger = the inner end down and in, br: raised)
  function brow(p, s, who, o, st, ey) {
    const B = who === 'meg' ? BROW.meg : mixB(BROW.suk, BROW.yuji, ey), bw = o.bw || 0, bf = o.bf || 0, br = o.br || 0, n = B.pts.length;
    const pts = B.pts.map((q, i) => { const k = 1 - i / (n - 1); return [CX + s * (q[0] - bf * 0.3 * k), EY + q[1] - br - bw * k + bf * 0.9 * k]; }), c = spl(pts, false, 5);
    const bc = ms2(who) === 'meg' ? st.hair[1] : C('#6a3a44'); p.stroke(c, B.w, bc); if (who !== 'meg' && ey > 0.5) p.stroke(c.map(q => [q[0], q[1] - B.w[0] * 0.22]), [1.1, 1.1, 0.6], C('#94545e'), [bc]);
  }
  // ---- the mouth: m = 'closed' 'slack' 'smirk' 'sad' (shut), 'smile' (a wide grin with teeth), 'scream' / 'horror' (open: mo = how far, 0 - 1)
  const MY = 43;
  function mouth(p, st, o) {
    const m = o.m || 'closed', S = st.skin, U = st.lipU, L = st.lipL, LN = st.lipLine, mo = o.mo === undefined ? 1 : o.mo, P = (dx, dy) => Q(dx, MY + dy), rev = a => a.slice().reverse();
    if (m === 'smile' || m === 'scream' || m === 'horror') {
      const w = m === 'smile' ? 27 : m === 'scream' ? (o.mw || 22) : 17, op = m === 'smile' ? 1 : mo;
      const top = m === 'smile' ? spl([P(-w, -7), P(-15, -1), P(0, 1), P(15, -1), P(w, -7)], false, 6) : spl([P(-w, -9 * op), P(-w * 0.55, -14 * op), P(0, -16 * op), P(w * 0.55, -14 * op), P(w, -9 * op)], false, 6);
      const bot = m === 'smile' ? spl([P(w, -6), P(18, 9), P(0, 14), P(-18, 9), P(-w, -6)], false, 6) : spl([P(w, -8 * op), P(w * 0.9, 8 * op), P(w * 0.45, 18 * op), P(0, 21 * op), P(-w * 0.45, 18 * op), P(-w * 0.9, 8 * op), P(-w, -8 * op)], false, 6);
      p.poly(top.concat(bot), MOUTH);
      const th = x => (m === 'smile' ? 6.5 : 7 * op) * (1 - Math.pow(x / (w + 1), 2)), tt = top.filter(q => Math.abs(q[0] - CX) < w - 2);
      p.poly(tt.concat(rev(tt).map(q => [q[0], q[1] + th(q[0] - CX)])), TEETH);
      for (let x = -w + 4; x < w - 3; x += 4.6) { const q = tt.reduce((a, b) => Math.abs(b[0] - (CX + x)) < Math.abs(a[0] - (CX + x)) ? b : a); p.pl([[q[0], q[1] + 0.5], [q[0], q[1] + th(x) - 0.5]], TEETHS); }
      const bt = bot.filter(q => Math.abs(q[0] - CX) < w * 0.8 && q[1] > EY + MY + (m === 'smile' ? 5 : 3)); if (bt.length > 3 && op > 0.4) p.poly(bt.concat(rev(bt).map(q => [q[0], q[1] - 3.4 * op])), TEETH, [MOUTH]);
      const tg = elp(CX, EY + MY + (m === 'smile' ? 10 : 12 * op), (m === 'smile' ? 11 : 12) * 0.9, 3.6 + 2.6 * op, 0, 16); p.poly(tg, TONGUE, [MOUTH]); p.poly(elp(CX - 2, EY + MY + (m === 'smile' ? 9 : 10 * op), 6, 1.6, 0, 10), TONGUEH, [TONGUE]);
      p.poly(top.map(q => [q[0], q[1] - 0.5]).concat(rev(top).map(q => [q[0], q[1] - 3.4])), U, [S[2], S[1], S[3]]); p.poly(bot.map(q => [q[0], q[1] + 0.5]).concat(rev(bot).map(q => [q[0], q[1] + 4.6])), L, [S[2], S[1], S[3]]);
      p.stroke(top, [0.8, 1.4, 0.8], LN); p.stroke(bot, [0.8, 1.4, 0.8], LN, undefined, 0.8);
      if (m === 'smile') for (const s of [-1, 1]) p.stroke(spl([P(s * 27, -6), P(s * 31, -10), P(s * 33.5, -15)], false, 4), [1.4, 0.5], LN);
      return;
    }
    const sm = m === 'smirk', sd = m === 'sad', cL = sm ? 0.8 : sd ? 2.6 : 0.8, cR = sm ? -4.2 : sd ? 2.6 : 0.8;
    const line = spl([P(-18, cL), P(-9, (cL + 2.2) / 2 + 0.4), P(0, 2.2), P(9, (cR + 2.2) / 2 + 0.4), P(18, cR)], false, 6);
    p.poly(spl([P(-17, cL - 0.6), P(-8, -2.4), P(-3, -3.8), P(0, -2.6), P(3, -3.8), P(8, -2.4 + cR * 0.3), P(17, cR - 0.6)], false, 4).concat(rev(line)), U, [S[2], S[1], S[3]]);
    p.poly(line.concat(spl([P(17, cR + 0.6), P(10, 4.8 + cR * 0.3 - (sd ? 1.5 : 0)), P(0, 7.6 - (sd ? 1.6 : 0)), P(-10, 4.8 + cL * 0.3 - (sd ? 1.5 : 0)), P(-17, cL + 0.6)], false, 4)), L, [S[2], S[1], S[3]]);
    p.stroke(line, [0.8, 1.8, 0.8], LN); p.poly(elp(CX, EY + MY + 11, 9, 2.2, 0, 14), S[1], [S[2]]);
    if (sm) { p.stroke(spl([P(19, cR + 1), P(22, cR - 1), P(23, cR - 4)], false, 4), [1.2, 0.4], LN); p.poly([P(13, cR + 2.4), P(16.4, cR + 1.6), P(14.8, cR + 5)], TEETH, [L, U]); }      // (a fang shows at the raised corner)
    if (sd) for (const s of [-1, 1]) p.stroke(spl([P(s * 6, 13), P(s * 3, 15.5), P(0, 14.4)], false, 4), [0.8, 0.8], S[1], [S[2]]);
  }
  // ---- the marks of Sukuna: the band across the nose, a mark on each cheek, two on the forehead (mk: 0 - 1 how strong; they fade away)
  function marks(p, mk) {
    if (mk < 0.12) return; const d = mk >= 0.98 ? undefined : mk, wk = 0.55 + 0.45 * mk;
    p.stroke(spl([Q(-47, 12.5), Q(-30, 9.5), Q(-12, 8.8), Q(0, 9.2), Q(12, 8.8), Q(30, 9.5), Q(47, 12.5)], false, 5), [1.6 * wk, 4.6 * wk, 4.2 * wk, 4.6 * wk, 1.6 * wk], INK, undefined, d);
    for (const s of [-1, 1]) { p.stroke(spl([Q(s * 34, 25), Q(s * 40, 34), Q(s * 43, 47)], false, 4), [3 * wk, 2 * wk, 0.5], INK, undefined, d); p.stroke([Q(s * 3, -50), Q(s * 3, -38)], [1.8 * wk, 0.8], INK, undefined, d); }
  }
  // ---- drops of sweat (0 - 2: how many / how far they have run)
  function fx(p, o) {
    if (o.sweat) for (const [dx, dy] of [[-44, -46], [47, -36], [34, -54], [-30, -58]]) { const x = CX + dx, y = EY + dy + (o.sweat > 1 ? (o.sweat - 1) * 14 : 0); p.poly([[x, y - 5.5], [x + 3, y + 0.5], [x, y + 3.6], [x - 3, y + 0.5]], TEARC); p.poly(elp(x - 1, y + 0.6, 0.9, 1.3, 0, 8), TEARH); }
  }
  // ---- fingers. digit() draws one finger along a spine of points (pixel coordinates: the painter must have sc = 1): o.pts base -> tip, o.w = [width at the base, width at the tip], o.R = the skin ramp (deep .. hi), o.nail = 'top' (seen from above) | 'side' (a sliver on its back) | 0,
  // o.cr = where the creases of the joints lie (0 - 1 along the finger), o.lit = the direction the light comes from, o.sh = [dx, dy, colour, over] a cast shadow on what is under it. It returns the spine (sp) and the length along it (T).
  const OLC = C('#5a2820'), NAIL = ['#e8b4a2', '#f4d0c0', '#fbe8de', '#fff6ee'].map(C), FLESH = ['#3c0810', '#6e0e1a', '#a81c28', '#d4404c'].map(C), PINK = ['#a8625a', '#cc857a', '#e8a79a', '#f6c4b8'].map(C), BONE = C('#f0e6d6');
  const dimC = (v, k) => { const r = v & 255, g = (v >>> 8) & 255, b = (v >>> 16) & 255; return ((255 << 24) | (Math.round(b + (16 - b) * k) << 16) | (Math.round(g + (10 - g) * k) << 8) | Math.round(r + (24 - r) * k)) >>> 0; }, dimG = (g, k) => { const lut = new Map(); for (let i = 0; i < g.length; i++) { const v = g[i]; let d = lut.get(v); if (d === undefined) { d = dimC(v, k); lut.set(v, d); } g[i] = d; } };      // (mix a colour / a whole picture a part of the way to the dark)
  function digit(p, o) {
    const R = o.R || SKIN.sy, lt = o.lit || [-0.55, -0.83], sp = spl(o.pts, false, 8), n = sp.length, cum = [0];
    for (let i = 1; i < n; i++) cum.push(cum[i - 1] + Math.hypot(sp[i][0] - sp[i - 1][0], sp[i][1] - sp[i - 1][1]));
    const tot = cum[n - 1], capf = Math.min(0.3, o.w[1] * 0.5 / tot), cr = o.cr || [0.44, 0.74], T = cum.map(c => c / tot), W = [], NX = [], NY = [], TX = [], TY = [];
    for (let i = 0; i < n; i++) {
      const a = sp[Math.max(0, i - 1)], b = sp[Math.min(n - 1, i + 1)], dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy) || 1; let w = lerp(o.w[0], o.w[1], T[i]);
      for (const j of cr) w *= 1 + 0.06 * Math.exp(-Math.pow((T[i] - j) / 0.045, 2));      // (a knuckle is a little thicker)
      if (T[i] > 1 - capf) w *= Math.sqrt(Math.max(0, 1 - Math.pow((T[i] - (1 - capf)) / capf, 2)));      // (the round tip)
      W.push(w); TX.push(dx / l); TY.push(dy / l); NX.push(-dy / l); NY.push(dx / l);
    }
    const sg = NX[n >> 1] * lt[0] + NY[n >> 1] * lt[1] > 0 ? -1 : 1; for (let i = 0; i < n; i++) { NX[i] *= sg; NY[i] *= sg; }      // (+ is the side away from the light)
    const rb = (a, b, t0, t1) => { const A = [], B = []; for (let i = 0; i < n; i++) { if (T[i] < (t0 || 0) || T[i] > (t1 === undefined ? 1 : t1)) continue; A.push([sp[i][0] + NX[i] * a * W[i], sp[i][1] + NY[i] * a * W[i]]); B.push([sp[i][0] + NX[i] * b * W[i], sp[i][1] + NY[i] * b * W[i]]); } return A.concat(B.reverse()); };
    const body = rb(-0.5, 0.5); if (o.sh) p.poly(body.map(q => [q[0] + o.sh[0], q[1] + o.sh[1]]), o.sh[2], o.sh[3]);
    for (const [dx, dy] of [[-1, 0], [1, 0], [0, -1], [0, 1], [-1, -1], [1, 1], [1, -1], [-1, 1]]) p.poly(body.map(q => [q[0] + dx, q[1] + dy]), OLC);      // (the outline)
    p.poly(body, R[2]); p.poly(rb(0.06, 0.5), R[1], [R[2]]); p.poly(rb(-0.1, 0.08), R[1], [R[2]], 0.5); p.poly(rb(0.38, 0.5), R[0], [R[1]], 0.7); p.poly(rb(-0.4, -0.14, 0.03, 0.97), R[3], [R[2]]); p.poly(rb(-0.34, -0.25, 0.1, 0.82), R[4], [R[3]]);
    for (const j of cr) {      // the creases of the joints: a dark one across and two soft ones beside it
      const i = Math.round(j * (n - 1)), w = W[i], x = sp[i][0], y = sp[i][1], nx = NX[i], ny = NY[i], tx = TX[i], ty = TY[i], ln = (k, a, b, col) => p.pl([[x + tx * k - nx * w * a, y + ty * k - ny * w * a], [x + tx * k + nx * w * b, y + ty * k + ny * w * b]], col, [R[1], R[2], R[3]]);
      ln(0, 0.34, 0.34, R[0]); ln(2.6, 0.24, 0.3, R[1]); ln(-2.6, 0.28, 0.2, R[1]);
    }
    const t1 = 1 - capf * 0.4, t0 = t1 - Math.min(0.32, o.w[1] * 1.1 / tot);
    if (o.nail === 'top') {      // the nail seen from above: pink, a light side, the half moon at the root, the white free edge
      const A = [], B = [], A2 = []; let i0 = -1;
      for (let i = 0; i < n; i++) { const t = T[i]; if (t < t0 || t > t1) continue; if (i0 < 0) i0 = i; const u = (t - t0) / (t1 - t0), e = u > 0.8 ? 0.2 + 0.8 * Math.sqrt(Math.max(0, 1 - Math.pow((u - 0.8) / 0.2, 2))) : u < 0.1 ? 0.8 + 2 * u : 1, hw = 0.36 * W[i] * e; A.push([sp[i][0] - NX[i] * hw, sp[i][1] - NY[i] * hw]); B.push([sp[i][0] + NX[i] * hw, sp[i][1] + NY[i] * hw]); A2.push([sp[i][0] - NX[i] * hw * 0.3, sp[i][1] - NY[i] * hw * 0.3]); }
      if (A.length > 3) {
        const nl = A.concat(B.slice().reverse()), k0 = Math.round(A.length * 0.86); for (const [dx, dy] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) p.poly(nl.map(q => [q[0] + dx, q[1] + dy]), R[0]);
        p.poly(nl, NAIL[0]); p.poly(A.concat(A2.slice().reverse()), NAIL[1], [NAIL[0]]); p.poly(A.slice(k0).concat(B.slice(k0).reverse()), NAIL[3], [NAIL[0], NAIL[1]]);
        p.poly(elp(sp[i0][0] + TX[i0] * 2.2, sp[i0][1] + TY[i0] * 2.2, 0.3 * W[i0], 2.6, Math.atan2(TY[i0], TX[i0]) + Math.PI / 2, 14), NAIL[2], [NAIL[0], NAIL[1]]);
      }
    } else if (o.nail === 'side') {      // the nail seen from the side: a thin plate along the back of the finger
      const pl = rb(-0.5, -0.3, t0, t1); if (pl.length > 6) { p.poly(pl, NAIL[1], [R[2], R[3], R[1]]); p.pl(pl.slice(0, pl.length >> 1), R[0]); }
    }
    return { sp, T };
  }
  function fingerAt(p, x0, y0, x1, y1, w0, w1, nonail, ramp, bend) {      // a finger of Sukuna's hand from (x0, y0) to its tip (x1, y1) with a nail (the painter must be in pixel coordinates)
    const dx = x1 - x0, dy = y1 - y0, L = Math.hypot(dx, dy) || 1, nx = -dy / L, ny = dx / L, b = (bend === undefined ? 0.05 : bend) * L;
    return digit(p, { pts: [[x0, y0], [x0 + dx * 0.4 + nx * b * 0.6, y0 + dy * 0.4 + ny * b * 0.6], [x0 + dx * 0.72 + nx * b, y0 + dy * 0.72 + ny * b], [x1, y1]], w: [w0, w1], R: ramp || SKIN.sy, nail: nonail ? 0 : 'top', cr: [0.46, 0.76] });
  }
  // ---- a big eye for the close-ups of the eyes (the eye on the left of the picture, the nose on the right): o.who 'meg' | 'yuji', o.lid (0 normal, < 0 wide), o.look [x, y], o.pr (the pupil), o.red (0 - 1), o.veins, o.refl (a grin in the iris),
  // o.circles (0 - 1: dark rings under the eye), o.dead (1: no light in the eye), o.pale (0 - 1), o.sweat (0 - 2), o.bw / o.bf / o.br (the brow), o.fp (the fingers of Sukuna on his cheek: 0 - 1 how far they are in)
  function eyeEcu(o) {
    const who = o.who === 'yuji' ? 'yuji' : 'meg', st = ptone(who === 'meg' ? 'meg' : 'sy', o.pale || 0), S = st.skin, ek = who === 'meg' ? EYE.meg : EYE.yuji, EW = 360, EH = 250, SE = 6.2, ir = irisOf(who, o.red || 0);
    const p = new Cv(EW, EH, SE, EW * 0.5 - 6 + (ek.x0 + ek.w * 0.5) * SE, 150); p.g.fill(S[2]);
    const e = Object.assign({}, ek, { y: EY, lid: o.lid || 0, look: o.look || [0, 0], iD: ir[0], iM: ir[1], iL: ir[2], pupC: C('#10040a'), socket: who === 'meg' ? 0.9 : 0.5, pr: o.pr === undefined ? ek.pr : o.pr, veins: o.veins || 0, refl: o.refl || 0, ink: ek.ink * 1.2, hi: o.dead ? 0 : 1, circles: (o.circles || 0) * 0.55 });
    p.poly([Q(-8, -44), Q(-2, -44), Q(3, 44), Q(-9, 44)], S[1], [S[2]]); p.poly([Q(-12, -40), Q(-9, -40), Q(-11, 40), Q(-14, 40)], S[3], [S[2]]);      // (the side of the nose: a shadow, a light)
    p.poly(elp(CX - 30, EY + 16, 16, 5, 0.1), S[3], [S[2]]); p.poly(elp(CX - 24, EY + 28, 30, 12), S[1], [S[2]], 0.5);
    eyeAt(p, -1, e, st); const bw = o.bw || 0, bf = o.bf || 0, br = o.br || 0, B = who === 'meg' ? BROW.meg : BROW.yuji, n = B.pts.length;
    const bp = spl(B.pts.map((q, i) => { const k = 1 - i / (n - 1); return [CX - (q[0] - bf * 0.3 * k) - 4, EY + q[1] - br - bw * k + bf * 0.9 * k]; }), false, 6), bc = who === 'meg' ? st.hair[1] : C('#6a3a44'), bh = who === 'meg' ? st.hair[3] : C('#a4606a');
    if (br > 1) for (let k = 0; k < 3; k++) p.stroke(spl([Q(-14 - k, -34 - br - k * 5), Q(-26, -37 - br - k * 5.5), Q(-40 + k * 2, -34 - br - k * 5)], false, 4), [0.3, 0.9, 0.3], S[1], [S[2]]);
    p.stroke(bp, B.w.map(v => v * 1.15), bc);
    for (let k = 0; k < 46; k++) { const t = k / 45, i = Math.min(bp.length - 2, Math.floor(t * (bp.length - 1))), a = bp[i], b = bp[i + 1], dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy) || 1, wd = lerp(B.w[0], B.w[2], t), sd = (c4R(k, 5) - 0.5) * wd * 0.9; p.pl([[a[0] - dy / l * sd, a[1] + dx / l * sd], [a[0] - dy / l * sd - dx / l * (3 + 3 * c4R(k, 6)), a[1] + dx / l * sd - dy / l * (3 + 3 * c4R(k, 6)) - 1]], k % 3 ? bh : bc, [bc, S[2], S[1]]); }
    if (o.sweat) for (const [dx, dy] of [[-42, -30], [-24, -38]]) { const x = CX + dx, y = EY + dy + (o.sweat > 1 ? (o.sweat - 1) * 16 : 0); p.poly([[x, y - 6.5], [x + 3.6, y + 0.6], [x, y + 4.4], [x - 3.6, y + 0.6]], TEARC); p.poly(elp(x - 1.2, y + 0.8, 1.1, 1.6, 0, 8), TEARH); }
    if (o.fp) fingers(p, o.fp);
    return p.canvas();
  }
  function fingers(p, k) {      // four fingers of Sukuna press on the cheek from the lower right (pixel coordinates)
    const sv = [p.sc, p.ox, p.oy], Mm = SKIN.meg, d = [0.75, 0.66], pe = [0.66, -0.75], sl = (1 - k) * 90; p.sc = 1; p.ox = CX; p.oy = EY;
    for (let i = 3; i >= 0; i--) {
      const tx = 262 + 32 * i * pe[0] + d[0] * sl, ty = 214 + 32 * i * pe[1] + d[1] * sl, ln = 190, at = f => [tx + d[0] * ln * f, ty + d[1] * ln * f];
      p.poly(elp(tx - d[0] * 8 + 2, ty - d[1] * 8 + 6, 26, 19, 0.7), Mm[1], [Mm[2], Mm[3]]); p.poly(elp(tx - d[0] * 12 - 5, ty - d[1] * 12 - 6, 16, 8, 0.7), Mm[3], [Mm[2]], 0.5);      // (the dent in the cheek and the skin pushed up around it)
      digit(p, { pts: [at(1), at(0.62), at(0.3), [tx, ty]], w: [38, 31], nail: 'top', cr: [0.16, 0.34, 0.62], sh: [6, 8, Mm[0], [Mm[1], Mm[2], Mm[3]]] });
    }
    p.sc = sv[0]; p.ox = sv[1]; p.oy = sv[2];
  }
  // ---- the lower face of Megumi with his mouth forced open: o.mo (how far open, 0 - 1), o.mw (how wide the corners are pulled), o.fin (the finger with the black nail: 0 - 1 how far in), o.pale (0 - 1), o.spit
  function mouthEcu(o) {
    const st = ptone('meg', o.pale || 0), S = st.skin, EW = 360, EH = 250, SM = 3.9, p = new Cv(EW, EH, SM, EW * 0.5, 125 - 43 * SM), mo = o.mo === undefined ? 1 : o.mo; p.g.fill(S[2]);
    p.poly([Q(-60, 14), Q(-8, 14), Q(-8, 120), Q(-60, 120)], S[3], [S[2]], 0.3); p.poly([Q(34, 14), Q(70, 14), Q(70, 120), Q(34, 120)], S[1], [S[2]]);      // (a light on the left, the shadow side on the right)
    p.poly([Q(-60, 20), Q(60, 20), Q(60, 120), Q(-60, 120)], S[1], [S[2], S[3]], (x, y) => c4R(y * 331 + x, 9) < 0.16);      // (a day of beard)
    p.poly([Q(-11, 24), Q(11, 24), Q(9, 29), Q(0, 31), Q(-9, 29)], S[1], [S[2], S[3]]); for (const s of [-1, 1]) { p.poly(elp(CX + s * 5, EY + 27, 2.4, 1.6), S[0]); p.stroke(spl([Q(s * 6.5, 19), Q(s * 9.5, 22), Q(s * 8, 26.5)], false, 4), [1.4, 1.2, 0.5], s > 0 ? S[0] : S[1]); }
    p.poly([Q(-3.5, 31), Q(3.5, 31), Q(4.5, 38), Q(-4.5, 38)], S[1], [S[2]]); p.stroke([Q(-1.2, 32), Q(-1.6, 37)], [0.8, 0.8], S[3], [S[1]]);
    p.poly(elp(CX, EY + 54 + 8 * mo, 22, 9), S[1], [S[2]], 0.5); p.poly(elp(CX - 2, EY + 62 + 8 * mo, 11, 4.4), S[3], [S[2]]);
    mouth(p, st, { m: 'scream', mo, mw: o.mw || 22 });
    if (o.spit) for (const x of [-9, -2, 7, 13]) { const y0 = EY + MY - 8 * mo + 2, y1 = EY + MY + 4 * mo; p.stroke([[CX + x, y0], [CX + x + 0.8, (y0 + y1) / 2 + 2], [CX + x - 0.4, y1 + 3 * o.spit]], [0.7 * o.spit, 0.4, 0.8], TEARC, [MOUTH, TONGUE, TEETH]); }
    const sv = [p.sc, p.ox, p.oy]; p.sc = 1; p.ox = CX; p.oy = EY;      // (Sukuna's fingers, in pixel coordinates: four on his left cheek pull the corner of the mouth out, the thumb on the right)
    const pull = (o.mw || 22) > 24 ? 1 : 0.6; for (let i = 0; i < 4; i++) fingerAt(p, -30, 40 + i * 58, 54 + 12 * pull + (i === 1 || i === 2 ? 12 : 0), 46 + i * 56, 38, 36 - i * 2); fingerAt(p, 400, 150, 296, 146, 42, 38);
    if (o.fin) {      // the red finger with the long black nail (the same one as in its own close-up) comes in from the right
      const tx = lerp(340, 120, o.fin), ty = 128, RC = ['#3a0810', '#6a0c18', '#a01c28', '#c83a44', '#e0505a'].map(C);
      digit(p, { pts: [[470, ty + 4], [380, ty + 2], [tx + 80, ty - 1], [tx + 24, ty]], w: [66, 50], R: RC, nail: 0, cr: [0.5, 0.78], lit: [-0.3, -0.95] });
      for (let k = 0; k < 7; k++) { const cx2 = tx + 70 + k * 46, cy2 = ty - 14 + c4R(k, 8) * 30; p.pl([[cx2, cy2], [cx2 + 3, cy2 + 6], [cx2 + 1, cy2 + 12]], RC[0], [RC[1], RC[2], RC[3]]); }
      p.poly([[tx + 30, ty - 21], [tx - 4, ty - 14], [tx - 90, ty + 6], [tx - 4, ty + 15], [tx + 30, ty + 23]], C('#0e0a16')); p.poly([[tx + 30, ty - 21], [tx - 4, ty - 14], [tx - 80, ty + 4], [tx + 30, ty - 5]], C('#3a3050')); p.pl([[tx + 26, ty - 15], [tx - 60, ty + 2]], C('#6a5a88'));
    }
    p.sc = sv[0]; p.ox = sv[1]; p.oy = sv[2];
    return p.canvas();
  }
  // ---- Megumi's throat when he swallows: the jaw of Sukuna's hand under his chin, the lump (Adam's apple) goes down: o.g (0 - 1), o.strain (the tendons stand out), o.drool, o.sweat
  function neckEcu(o) {
    const st = ptone('meg', o.pale || 0), S = st.skin, EW = 360, EH = 250, SN = 2.7, p = new Cv(EW, EH, SN, EW * 0.5, 30 - 62 * SN), g = o.g || 0; p.g.fill(C('#140a10'));
    p.poly([Q(-41, 56), Q(41, 56), Q(48, 140), Q(-48, 140)], S[1]); p.poly([Q(-41, 56), Q(-2, 56), Q(-4, 140), Q(-48, 140)], S[2], [S[1]]);
    for (const s of [-1, 1]) p.stroke(spl([Q(s * 31, 64), Q(s * 20, 90), Q(s * 8, 120)], false, 5), [2.6, 3.2, 2.4], s < 0 ? S[1] : S[0], [s < 0 ? S[2] : S[1]]);      // (the two tendons of the neck)
    p.poly(elp(CX, EY + 40, 46, 24), S[2]); p.poly(elp(CX - 6, EY + 52, 26, 8), S[3], [S[2]]);      // (the underside of his jaw)
    p.poly([Q(-44, 56), Q(44, 56), Q(44, 62), Q(30, 72), Q(0, 76), Q(-30, 72), Q(-44, 62)], S[0], [S[1], S[2]]);      // (the shadow of the jaw on the neck)
    if (o.strain) for (const s of [-1, 1]) { p.stroke(spl([Q(s * 26, 66), Q(s * 17, 92), Q(s * 7, 122)], false, 5), [3, 3.4, 2.6], S[0]); p.stroke(spl([Q(s * 23, 68), Q(s * 14, 92), Q(s * 4, 120)], false, 5), [1.4, 1.6, 1], S[3], [S[1], S[2]]); }
    const ay = EY + 84 + 26 * g; p.poly(elp(CX + 1.4, ay + 2.4, 7.4, 9.6, 0.1), S[0], [S[1], S[2]], 0.6); p.poly(elp(CX, ay, 6.6, 8.8, 0.1), S[2]); p.poly(elp(CX - 1.4, ay - 1.2, 3.6, 5, 0.1), S[3]); p.poly(elp(CX - 2, ay - 2.6, 1.4, 2, 0.1), S[4], [S[3]]); p.stroke(spl([Q(-6, 84 + 26 * g + 9), Q(0, 84 + 26 * g + 10.6), Q(6, 84 + 26 * g + 9)], false, 4), [0.8, 0.8], S[0], [S[2], S[1]]);
    p.poly([Q(-70, 118), Q(-34, 106), Q(0, 116), Q(34, 106), Q(70, 118), Q(110, 140), Q(-110, 140)], C('#26304c')); p.poly([Q(-70, 118), Q(-34, 106), Q(0, 116), Q(34, 106), Q(70, 118), Q(70, 124), Q(0, 122), Q(-70, 124)], C('#3e4a72'));
    if (o.drool) p.stroke(spl([Q(-14, 74), Q(-13, 92), Q(-15, 108 + 14 * o.drool)], false, 5), [1.6, 1.2, 1.8], TEARC, undefined);
    if (o.sweat) for (const [dx, dy] of [[-30, 78], [32, 92]]) { const x = CX + dx, y = EY + dy + o.sweat * 6; p.poly([[x, y - 5], [x + 3, y + 0.6], [x, y + 3.6], [x - 3, y + 0.6]], TEARC); p.poly(elp(x - 1, y + 0.6, 0.9, 1.3, 0, 8), TEARH); }
    const sv = [p.sc, p.ox, p.oy]; p.sc = 1; p.ox = CX; p.oy = EY;      // (Sukuna's hand holds his jaw: the thumb on the left, four fingers on the right)
    fingerAt(p, -40, 20, 112, 54, 40, 36); for (let i = 0; i < 4; i++) fingerAt(p, 420, 10 + i * 34, 252 - (i === 1 || i === 2 ? 10 : 0), 34 + i * 30, 36, 32);
    p.sc = sv[0]; p.ox = sv[1]; p.oy = sv[2];
    return p.canvas();
  }
  // ---- Megumi's head hanging: the black hair falls over his face in locks, the shadowed face and the neck show between them (o.sway: -2 .. 2, how far the tips swing)
  function hairdownEcu(o) {
    const Hc = HAIR.meg, S = SKIN.meg, EW = 360, EH = 250, p = new Cv(EW, EH, 0.74, 166, 157), sw = o.sway || 0; p.g.fill(C('#1c0c14'));
    p.poly([[110, 190], [250, 190], [270, 250], [90, 250]], S[0]); p.poly([[130, 200], [230, 200], [236, 250], [124, 250]], S[1], [S[0]], 0.5);
    p.poly([[-120, 250], [-40, 226], [100, 214], [180, 226], [260, 214], [400, 226], [480, 250], [480, 300], [-120, 300]], C('#26304c')); p.poly([[-40, 226], [100, 214], [180, 226], [260, 214], [400, 226], [400, 234], [260, 222], [180, 234], [100, 222], [-40, 234]], C('#3e4a72'));
    p.poly([[96, 110], [264, 110], [262, 200], [180, 228], [98, 200]], S[0]);
    p.poly(spl([[-90, -40], [-70, 60], [20, 108], [180, 122], [340, 108], [430, 60], [450, -40]], false, 5), Hc[2]); p.poly(elp(150, 64, 90, 16, -0.05), Hc[3], [Hc[2]]); p.poly(elp(132, 56, 52, 7, -0.05), Hc[4], [Hc[3]]);
    const back = [[-60, 170, 7], [-18, 190, -7], [24, 190, 7], [86, 226, -6], [142, 206, 8], [200, 236, -7], [262, 212, 6], [322, 196, -8], [380, 188, 7], [420, 170, -7]], front = [[-30, 150, 6], [54, 168, 8], [112, 214, -7], [172, 190, 6], [232, 228, -8], [292, 186, 7], [350, 170, -6], [20, 150, 5], [400, 150, 6]];
    for (const [x, ty, bd] of back) spike(p, Hc, [x - 38, 78], [x + 38, 82], [x + sw * (ty / 100) + (x - 180) * 0.05, ty * 1.28 + 22], bd);
    for (const [x, ty, bd] of front) spike(p, Hc, [x - 30, 92], [x + 30, 96], [x + 6 - sw * (ty / 120) + (x - 180) * 0.04, ty * 1.25 + 16], -bd);
    for (const [x, ty] of [[70, 290], [128, 300], [214, 306], [270, 296]]) { p.stroke(spl([[x, 150], [x + 6 + sw * 2, 220], [x + 2 + sw * 3, ty]], false, 6), [5, 3.2, 0.8], Hc[1]); p.stroke(spl([[x - 1, 156], [x + 5 + sw * 2, 220], [x + 1 + sw * 3, ty - 6]], false, 6), [1.4, 1, 0.4], Hc[4], [Hc[1]]); }
    if (o.drop !== undefined && o.drop >= 0) { const dx = 200, dy = 224 + o.drop * 40; p.poly([[dx, dy - 7], [dx + 4, dy + 1], [dx, dy + 5], [dx - 4, dy + 1]], o.blood ? C('#b8121c') : TEARC); p.poly(elp(dx - 1.4, dy, 1.2, 1.8, 0, 8), o.blood ? C('#e8606a') : TEARH); }
    return p.canvas();
  }
  function rawEnd(p, x, y, rx, ry, rot, WD, seed) {      // the raw end where a finger was torn off: skin torn into points, red flesh, a knob of white bone (rx: along the finger, ry: across it)
    const c = Math.cos(rot), s = Math.sin(rot), at = (X, Y) => [x + X * c - Y * s, y + X * s + Y * c], ring = (n, sc, jg, k, ox, oy) => { const pts = []; for (let i = 0; i < n; i++) { const a = i / n * Math.PI * 2, r = sc * (jg && i % 2 ? 1.22 : 1) * (0.82 + 0.34 * c4R(i + k, seed)); pts.push(at(Math.cos(a) * rx * r + (ox || 0), Math.sin(a) * ry * r + (oy || 0))); } return pts; };
    p.poly(ring(22, 1.18, 1, 0), OLC); p.poly(ring(22, 1.08, 1, 0), SKIN.sy[1]); p.poly(ring(16, 0.84, 0, 30, -rx * 0.04, ry * 0.05), WD[1]); p.poly(ring(14, 0.6, 0, 60, -rx * 0.1, -ry * 0.04), WD[2], [WD[1]]); p.poly(ring(10, 0.26, 0, 90, -rx * 0.14, -ry * 0.1), BONE); p.poly(ring(8, 0.12, 0, 5, -rx * 0.16, -ry * 0.16), C('#ffffff'), [BONE]);
    p.poly(elp(x - rx * 0.2, y + ry * 0.5, 2.2, 1.4, rot, 8), WD[3]);
  }
  // ---- the pictures of the hands: tools/hands_make.js draws small 3D hands once and packs them (run length coded bytes: 0 - 3 a shadow on what is behind, 8 + = (material << 3) | tone); here they get their colours.
  const HD = __HANDSDATA__, HPIX = new Map();
  function hdata(key) {
    let a = HPIX.get(key); if (a) return a; const f = HD.f[key]; if (!f) return null;
    const bin = atob(f.d); a = new Uint8Array(HD.w * HD.h); let o = 0; for (let i = 0; i + 1 < bin.length; i += 2) { const c = bin.charCodeAt(i + 1); a.fill(bin.charCodeAt(i), o, o + c); o += c; }
    HPIX.set(key, a); return a;
  }
  function hramps(o) {      // the colours of the materials: skin, nail, sleeve, flesh, bone, stretched skin, claw (5 tones and the dark line)
    const RR = ['#3a0810', '#6a0c18', '#a01c28', '#c83a44', '#e0505a'], skin = SKINH.sy.slice(), mk = (a, l) => a.concat([l]).map(C);
    return [null, mk(skin, '#5a2820'), mk(['#b8706a', '#e8a8a0', '#f4c8bc', '#fce4dc', '#fff6f0'].map(h => hexMix(h, '#5a1018', (o.red || 0) * 0.7)), '#7a3a36'), mk(['#0c1428', '#1c2a52', '#2e3f74', '#44589a', '#6678b8'], '#060a18'),
      o.blood ? mk(['#3c0810', '#6e0e1a', '#a81c28', '#d4404c', '#f07078'], '#240408') : mk(['#a8625a', '#cc857a', '#e8a79a', '#f6c4b8', '#fadcd4'], '#6a3a34'), mk(['#a89c8c', '#cfc4b2', '#f0e6d6', '#fff8ec', '#ffffff'], '#6a5e50'),
      mk(skin.map(h => hexMix(h, '#fff0e8', 0.35)), '#6a3a30'), mk(['#0a0608', '#16101a', '#2c2238', '#4a3c5c', '#6a5a88'], '#000000'), mk(SKINH.sy.map((h, i) => hexMix(h, RR[i], o.red || 0)), '#5a2820')];
  }
  function hpaint(p, key, rp) {      // draws the hand picture over the painter: its colours where the hand is, a darker tone where it throws a shadow
    const a = hdata(key); if (!a) return; const g = p.g, n = a.length, lut = [new Map(), new Map(), new Map(), new Map()], SH = [0, 0.22, 0.4, 0.58];
    for (let i = 0; i < n; i++) { const b = a[i]; if (b >= 8) g[i] = rp[b >> 3][b & 7]; else if (b) { const v = g[i]; let d = lut[b].get(v); if (d === undefined) { d = dimC(v, SH[b]); lut[b].set(v, d); } g[i] = d; } }
  }
  let HBG = null;
  // ---- Sukuna's hand holds Megumi's cheek (Megumi's face is dark behind it) and his other hand takes the little finger: o.pull (0 - 1: how far it is pulled out, in steps of 1/8), o.torn (1: it is off and the other hand takes it away: o.pull 0 - 1 in steps of 1/6), o.blood
  function handsEcu(o) {
    const EW = 360, EH = 250, p = new Cv(EW, EH, 0.95, 104, 82), tn = !!o.torn, key = tn ? 't' + Math.round((o.pull || 0) * 6) : 'g' + Math.round((o.pull || 0) * 8), f = HD.f[key], Sf = ptone('meg', 0.35).skin, WD = o.blood ? FLESH : PINK;
    if (!HBG) { p.g.fill(C('#140a10')); faceDraw(p, { who: 'meg', m: 'sad', lid: -0.3, pr: 2, bw: 4, circles: 0.4, pale: 0.35, sweat: 1 }); dimG(p.g, 0.5); HBG = p.g.slice(); } else p.g.set(HBG);      // (Megumi's face, dark and a little out of focus: drawn once)
    const Sm = Sf.map(c => dimC(c, 0.5)); p.sc = 1; p.ox = CX; p.oy = EY;      // (pixel coordinates from here on)
    if (f) for (const k in f.m.tips) { const t = f.m.tips[k]; p.poly(elp(t[0] + 3, t[1] + 4, 14, 10, 0.5), Sm[1], [Sm[2], Sm[3]]); p.poly(elp(t[0] - 1, t[1] + 1, 9, 6, 0.5), Sm[0], [Sm[1]], 0.55); p.poly(elp(t[0] - 7, t[1] - 5, 10, 6, 0.5), Sm[3], [Sm[2]], 0.5); }      // (a dent in the cheek under each finger tip)
    hpaint(p, key, hramps(o));
    if (tn && f) {      // the raw hole where the finger was, the raw end of the finger in the other hand
      const s0 = f.m.stump; rawEnd(p, s0[0], s0[1], 8, 11, Math.atan2(f.m.stump[3], f.m.stump[2]) + 1.57, WD, 5);
      if (o.blood) for (const [x, y, l] of [[s0[0] + 1, s0[1] + 8, 30], [s0[0] + 8, s0[1] + 9, 20], [s0[0] - 6, s0[1] + 9, 16]]) { p.stroke(spl([[x, y], [x + 1.5, y + l * 0.5], [x + 1, y + l]], false, 5), [3, 2.4, 1.4], FLESH[1]); p.stroke([[x - 0.7, y + 1], [x - 0.7, y + l * 0.8]], [0.8, 0.8], FLESH[3]); }
    }
    return p.canvas();
  }
  // ---- the finger in the pinch of his thumb and first finger, ripped off (seen large): o.red (0 - 1: it turns dark red), o.nl (0 - 1, in steps of 1/8: the black claw grows out of its nail), o.blood
  function fingerEcu(o) {
    const p = new Cv(360, 250, 1, CX, EY); p.g.fill(C('#10060a')); hpaint(p, 'f' + Math.round((o.nl || 0) * 8), hramps(o)); return p.canvas();
  }
  // ---- Yuji's right hand seen from his own eyes (palm to him, fingers up, the thumb on the right): the little finger is gone; o.blood (FULL): the stump bleeds, else a clean pink stump
  function yhandEcu(o) {
    const p = new Cv(360, 250, 1, CX, EY), f = HD.f.y0, WD = o.blood ? FLESH : PINK; p.g.fill(C('#120608')); hpaint(p, 'y0', hramps(o));
    if (f) { const s0 = f.m.stump; rawEnd(p, s0[0] - 2, s0[1] + 4, 12, 7, 0.3, WD, 7); if (o.blood) for (const [x, l] of [[s0[0] - 6, 40], [s0[0] + 1, 60], [s0[0] + 8, 30]]) { p.stroke(spl([[x, s0[1] + 8], [x + 1, s0[1] + 8 + l * 0.5], [x - 1, s0[1] + 8 + l]], false, 5), [3.2, 2.6, 1.5], FLESH[1]); p.stroke([[x - 0.8, s0[1] + 10], [x - 0.8, s0[1] + 8 + l * 0.8]], [0.9, 0.9], FLESH[3]); } }
    return p.canvas();
  }
  const irisOf = (who, red) => { const b = IRIS[who === 'meg' ? 'meg' : who === 'yuji' ? 'yuji' : 'suk'], r = IRIS.suk, t = who === 'suk' ? 1 : red; return b.map((h, i) => C(hexMix(h, r[i], t))); };
  // ---- the whole face
  function faceDraw(p, o) {
    const who = o.who || 'suk', ms = who === 'meg' ? 'meg' : 'sy', st = ptone(ms, o.pale || 0), S = st.skin, lid = o.lid === undefined ? 0 : o.lid, mk = o.marks === undefined ? (who === 'suk' ? 1 : 0) : o.marks, red = o.red === undefined ? (who === 'suk' ? 1 : 0) : o.red, e2 = o.e2 || 0;
    const hd = st.head, right = hd.map(q => Q(q[0], q[1])), left = hd.slice(1, -1).reverse().map(q => Q(-q[0], q[1])), outline = spl(right.concat(left), true, 6), n6 = outline.length;
    hairBack(p, st, ms);
    // the neck and the collar
    p.poly([Q(-42, 30), Q(42, 30), Q(54, 130), Q(-54, 130)], S[1]); p.poly([Q(-42, 30), Q(4, 30), Q(4, 130), Q(-54, 130)], S[2], [S[1]]);
    for (const s of [-1, 1]) { p.stroke(spl([Q(s * 33, 54), Q(s * 22, 78), Q(s * 8, 106)], false, 5), [2.2, 3, 2], s < 0 ? S[1] : S[0], [s < 0 ? S[2] : S[1]]); }      // (the two tendons of the neck)
    const jaw = outline.filter(q => q[1] > EY + 26 && q[1] < EY + 71); p.poly(jaw.concat(jaw.slice().reverse().map(q => [q[0], q[1] + 9])), S[0], [S[1], S[2]]);      // (the shadow of the head on the neck)
    if (ms === 'sy') { p.poly([Q(-52, 62), Q(-22, 82), Q(0, 100), Q(22, 82), Q(52, 62), Q(104, 86), Q(122, 130), Q(-122, 130), Q(-104, 86)], C('#a8202e')); p.poly([Q(-52, 62), Q(-22, 82), Q(0, 100), Q(22, 82), Q(52, 62), Q(58, 70), Q(0, 112), Q(-58, 70)], C('#d84a52')); }
    else p.poly([Q(-60, 62), Q(-30, 74), Q(0, 80), Q(30, 74), Q(60, 62), Q(110, 90), Q(120, 130), Q(-120, 130), Q(-110, 90)], C('#26304c'));
    // the ears, the head and the cel shadows
    for (const s of [-1, 1]) { const ea = st.ear; p.poly(elp(CX + s * ea[0], EY + ea[1], ea[2], ea[3], s * 0.12), S[2]); p.poly(elp(CX + s * (ea[0] - s * 0.5), EY + ea[1] + 1, ea[2] * 0.5, ea[3] * 0.6, s * 0.12), S[1], [S[2]]); p.pl(spl([Q(s * (ea[0] + ea[2] * 0.7), ea[1] - ea[3] * 0.8), Q(s * (ea[0] + ea[2]), ea[1]), Q(s * (ea[0] + ea[2] * 0.6), ea[1] + ea[3] * 0.9)], false, 4), S[0]); }
    p.poly(outline, S[2]);
    p.poly([Q(40, -48), Q(42, -26), Q(40, -4), Q(37, 18), Q(31, 38), Q(22, 54), Q(10, 64), Q(12, 90), Q(100, 90), Q(100, -70)], S[1], [S[2]], 0.5);
    p.poly([Q(44, -48), Q(46, -26), Q(44, -4), Q(41, 18), Q(35, 38), Q(25, 54), Q(12, 64), Q(12, 90), Q(100, 90), Q(100, -70)], S[1], [S[2]]);      // (the shadow side: the right side of the face)
    p.poly(elp(CX - 8, EY - 38, 20, 8), S[3], [S[2]]); p.poly(elp(CX - 34, EY + 14, 10, 6, 0.5), S[3], [S[2]], 0.5);       // (the lights: forehead, cheekbone)
    p.stroke(spl([Q(-47, 24), Q(-41, 36), Q(-31, 48)], false, 4), [0.6, 4.2, 0.6], S[1], [S[2]], 0.55);      // (the hollow under the cheekbone)
    const jl = outline.filter(q => q[0] < CX && q[1] > EY + 30 && q[1] < EY + 74); p.poly(jl.concat(jl.slice().reverse().map(q => [q[0] + 5, q[1] - 3])), S[1], [S[2], S[3]], 0.7);      // (the plane of the jaw)
    const lw = outline.filter(q => q[1] > EY + 34); p.poly(lw.concat(lw.slice().reverse().map(q => [q[0] + (q[0] > CX ? -10 : 10), q[1] - 9])), S[1], [S[2], S[3]], (x, y) => c4R(y * 331 + x, 9) < 0.24);      // (a day of beard on the jaw and the chin)
    p.stroke(outline.slice(Math.round(n6 * 0.1), Math.round(n6 * 0.62)), [0.5, 1.5, 1.7, 1.7, 1.3, 0.5], S[0]);      // (the dark edge of the face on the shadow side and under the chin)
    // the nose: a soft shadow on its right side, the tip lit, the wings and the nostrils, the shadow under it
    const nz = st.nose; p.poly([Q(4, -22), Q(7.5, -12), Q(9, 4), Q(12 * nz, 14), Q(10 * nz, 21), Q(5, 19), Q(3, 4), Q(3.5, -14)], S[1], [S[2]]); p.poly(elp(CX - 1.5, EY + 17, 4.2 * nz, 2.6), S[3], [S[2]]);
    p.stroke([Q(-3.2, -20), Q(-4.4, -4), Q(-5.6, 12)], [1, 1.8, 1.2], S[3], [S[2]]);      // (the light edge of the bridge)
    p.poly([Q(-10 * nz, 25), Q(10 * nz, 25), Q(8 * nz, 29), Q(0, 31), Q(-8 * nz, 29)], S[1], [S[2], S[3]]);
    for (const s of [-1, 1]) { p.stroke(spl([Q(s * 6.5 * nz, 19), Q(s * 9.5 * nz, 22), Q(s * 8 * nz, 26.5)], false, 4), [1.4, 1.2, 0.5], s > 0 ? S[0] : S[1]); p.poly(elp(CX + s * 4.6 * nz, EY + 27, 2.1, 1.3, 0, 10), S[0]); }
    p.poly([Q(-3.5, 31), Q(3.5, 31), Q(4.5, 37.5), Q(-4.5, 37.5)], S[1], [S[2]]); p.stroke([Q(-1.2, 32), Q(-1.6, 37)], [0.8, 0.8], S[3], [S[1]]);
    // the eyes, the second eyes
    const ey = o.ey === undefined ? (who === 'yuji' ? 1 : 0) : o.ey, ek = who === 'meg' ? EYE.meg : mixO(EYE.suk, EYE.yuji, ey), ir = irisOf(who, red), hy = o.look || [0, 0];
    for (const s of [-1, 1]) {
      const e = Object.assign({}, ek, { y: EY, lid, look: hy, iD: ir[0], iM: ir[1], iL: ir[2], pupC: C('#10040a'), socket: st.socket, circles: o.circles || 0, veins: o.veins || 0, pr: o.pr === undefined ? ek.pr : o.pr, hi: o.dead ? 0 : undefined }); eyeAt(p, s, e, st); brow(p, s, who, o, st, ey);
      if (e2 > 0 && mk > 0.3) { const e3 = Object.assign({}, EYE.suk, { x0: 14, w: 23, h: 4.2 * e2, tilt: 2.2, ir: 5.2, pr: 1.2, ink: 1.8, lashes: 0, wing: 3, y: EY + 19, lid: 0, look: [0, 0], iD: ir[0], iM: ir[1], iL: ir[2], pupC: C('#10040a'), hi: 0 }); eyeAt(p, s, e3, st); }
    }
    if (who === 'meg' || ey < 0.5) for (const s of [-1, 1]) p.stroke(spl([Q(s * 14, 9), Q(s * 26, 11.5), Q(s * 38, 9)], false, 4), [0.4, 1.0, 0.4], S[1], [S[2]]);      // (the bags under the eyes)
    if (o.m === 'smile' || o.m === 'smirk') for (const s of [-1, 1]) p.stroke(spl([Q(s * 12, 22), Q(s * 20, 32), Q(s * 24, 42)], false, 4), [0.4, 1.2, 0.4], S[1], [S[2]]);      // (the folds from the nose to the corners of the mouth)
    mouth(p, st, o); marks(p, mk); fx(p, o); hairFront(p, st, ms, o);
  }
  function face(o) { const p = new Cv(); faceDraw(p, o); return p.canvas(); }
  const FY = EY + 16;      // (the row of the picture to put in the middle of the screen: the eyes are a little above the middle, the mouth a little below)
  const hbg = (fx0, fy0, fs) => { const q = new Cv(360, 250, fs || 0.95, fx0 === undefined ? 112 : fx0, fy0 === undefined ? 100 : fy0); q.g.fill(C('#140a10')); faceDraw(q, { who: 'meg', m: 'sad', lid: -0.3, pr: 2, bw: 4, circles: 0.4, pale: 0.35, sweat: 1 }); dimG(q.g, 0.5); return q.canvas(); };      // (Megumi's face, dark and a little out of focus: the backdrop of the hands)
  return { hmeta: k => HD.f[k] && HD.f[k].m, hbg, face: o => memo('F' + JSON.stringify(o), () => face(o)), eye: o => memo('E' + JSON.stringify(o), () => eyeEcu(o)), mouth: o => memo('M' + JSON.stringify(o), () => mouthEcu(o)), neck: o => memo('N' + JSON.stringify(o), () => neckEcu(o)), hair: o => memo('H' + JSON.stringify(o), () => hairdownEcu(o)), hands: o => memo('X' + JSON.stringify(o), () => handsEcu(o), 40, hcache), finger: o => memo('R' + JSON.stringify(o), () => fingerEcu(o)), yhand: o => memo('Y' + JSON.stringify(o), () => yhandEcu(o)), FY };
})();
