"""pxart.py (v1.27): a shaded pixel-art paint box for the curses of curse_art2.py.
Every body part is a mask (an ellipse, a polygon, a tapered limb ...). paint() shades it like a rounded shape lit from the top left: the distance to the edge
gives a bevel, the bevel gives a normal, the normal gives a light value, the light value picks a colour of the part's ramp (dark ... light) with a little
ordered dithering. Parts are painted back to front; a part throws a small contact shadow on what is behind it, edges facing the light get a rim light, glow()
adds light, finish() draws a dark outline round the whole figure. pack() then reduces all frames of a curse to one palette of about 56 colours and writes
them as rows of letters (the format of curses.json)."""
import math, colorsys
import numpy as np, cv2
from PIL import Image

SS = 4                                  # masks are drawn 4 times bigger and shrunk, so curves come out clean
BAYER = np.array([[0, 8, 2, 10], [12, 4, 14, 6], [3, 11, 1, 9], [15, 7, 13, 5]], np.float32) / 16 - .5
LIGHT = np.array([-.55, -.62, .56], np.float32); LIGHT /= np.linalg.norm(LIGHT)

def rgb(h): return np.array([int(h[i:i + 2], 16) for i in (1, 3, 5)], np.float32)

def ramp(base, n=6, dark=.26, light=1.3, hs=-16, hl=9, mid=.55, sd=1.15, sl=.8):
    """n colours from dark to light out of one base colour (it sits at `mid`): shadows are darker and bluer, lights warmer and paler"""
    r, g, b = (rgb(base) if isinstance(base, str) else np.array(base, np.float32)) / 255; h, s, v = colorsys.rgb_to_hsv(r, g, b); out = []
    for i in range(n):
        t = i / (n - 1); k = dark + (1 - dark) * t / mid if t <= mid else 1 + (light - 1) * (t - mid) / (1 - mid)
        hh = (h + (hs + (hl - hs) * t) / 360) % 1; ss = min(1, s * (sd + (sl - sd) * t)); vv = min(1, v * k)
        out.append(np.array(colorsys.hsv_to_rgb(hh, ss, vv)) * 255)
    return np.array(out, np.float32)

class Spr:
    def __init__(s, w, h, K=1.0, seed=3):
        s.K = K; s.w, s.h = w, h; s.rgb = np.zeros((h, w, 3), np.float32); s.a = np.zeros((h, w), bool)
        s.Y, s.X = np.mgrid[:h, :w].astype(np.float32); s.bay = np.tile(BAYER, (h // 4 + 1, w // 4 + 1))[:h, :w]
        rs = np.random.RandomState(seed); s.noise = cv2.GaussianBlur(rs.rand(h, w).astype(np.float32), (0, 0), .8); s.noise = (s.noise - s.noise.mean()) / (s.noise.std() + 1e-6)
    # ---- masks (coordinates in pixels, floats are fine)
    def _m(s): return np.zeros((s.h * SS, s.w * SS), np.uint8)
    def ell(s, cx, cy, rx, ry, rot=0, m=None):
        m = s._m() if m is None else m; K = s.K; cv2.ellipse(m, (round(cx * K * SS), round(cy * K * SS)), (max(1, round(rx * K * SS)), max(1, round(ry * K * SS))), rot, 0, 360, 255, -1); return m
    def poly(s, pts, m=None):
        m = s._m() if m is None else m; K = s.K; cv2.fillPoly(m, [np.array([[round(x * K * SS), round(y * K * SS)] for x, y in pts], np.int32)], 255); return m
    def seg(s, x0, y0, x1, y1, r0, r1, m=None):
        m = s._m() if m is None else m
        K = s.K; cv2.circle(m, (round(x0 * K * SS), round(y0 * K * SS)), max(1, round(r0 * K * SS)), 255, -1); cv2.circle(m, (round(x1 * K * SS), round(y1 * K * SS)), max(1, round(r1 * K * SS)), 255, -1)
        a = math.atan2(y1 - y0, x1 - x0) + math.pi / 2; c, d = math.cos(a), math.sin(a)
        return s.poly([(x0 + c * r0, y0 + d * r0), (x1 + c * r1, y1 + d * r1), (x1 - c * r1, y1 - d * r1), (x0 - c * r0, y0 - d * r0)], m)
    def line(s, pts, w, m=None):
        m = s._m() if m is None else m; K = s.K; cv2.polylines(m, [np.array([[round(x * K * SS), round(y * K * SS)] for x, y in pts], np.int32)], False, 255, max(1, round(w * K * SS))); return m
    @staticmethod
    def U(*ms): return np.maximum.reduce(ms)
    @staticmethod
    def D(a, b): return np.where(b > 0, 0, a).astype(np.uint8)
    @staticmethod
    def I(a, b): return np.minimum(a, b)
    def chain(s, pts, r0, r1, m=None):      # a bendy limb: tapered segments through the points (radius r0 at the first, r1 at the last)
        m = s._m() if m is None else m
        for i in range(len(pts) - 1):
            ra = r0 + (r1 - r0) * i / (len(pts) - 1); rb = r0 + (r1 - r0) * (i + 1) / (len(pts) - 1); s.seg(pts[i][0], pts[i][1], pts[i + 1][0], pts[i + 1][1], ra, rb, m)
        return m
    # ---- painting
    def paint(s, m, rp, R=3.5, bump=None, dither=.35, shadow=.7, rim=True, amb=.2, alpha=1., emis=None, spec=0, grain=0., lift=0.):
        """rp = the ramp of the part. R = how far in from the edge the surface curves (the bigger, the rounder). bump(X, Y) -> (dx, dy) tilts the normal (folds, scales).
        emis = an index of the ramp: the part glows with that flat colour. spec = a shiny part (metal, glass). alpha < 1: a see-through part."""
        m1 = cv2.resize(m, (s.w, s.h), interpolation=cv2.INTER_AREA) > 127
        if not m1.any(): return m1
        n = len(rp); d = cv2.distanceTransform(m1.astype(np.uint8), cv2.DIST_L2, 5); db = cv2.GaussianBlur(d, (3, 3), 0)
        gx = cv2.Sobel(db, cv2.CV_32F, 1, 0, ksize=3) / 8; gy = cv2.Sobel(db, cv2.CV_32F, 0, 1, ksize=3) / 8; gl = np.hypot(gx, gy) + 1e-5
        t = np.clip((d - .5) / R, 0, 1); th = (math.pi / 2) * (1 - t) ** 1.2; sn = np.sin(th)
        nx, ny, nz = -gx / gl * sn, -gy / gl * sn, np.cos(th)
        R = R * s.K
        if bump is not None: bx, by = bump(s.X / s.K, s.Y / s.K); nx = nx + bx; ny = ny + by; nl = np.sqrt(nx * nx + ny * ny + nz * nz); nx, ny, nz = nx / nl, ny / nl, nz / nl
        lam = np.clip(nx * LIGHT[0] + ny * LIGHT[1] + nz * LIGHT[2], 0, 1); lvl = amb + (1 - amb) * lam + lift + grain * s.noise
        if spec: hv = np.array([LIGHT[0], LIGHT[1], LIGHT[2] + 1]); hv /= np.linalg.norm(hv); sp = np.clip(nx * hv[0] + ny * hv[1] + nz * hv[2], 0, 1) ** spec; lvl = lvl + sp * .9
        pos = lvl * (n - 1) + (s.bay * dither if dither else 0)
        if rim: pos = pos + ((d <= 1.6) & (lam > .55)) * .9
        idx = np.clip(np.floor(pos + .5), 0, n - 1).astype(int)
        if emis is not None: idx = np.full_like(idx, emis if emis >= 0 else n + emis)
        col = rp[idx]
        if shadow and s.a.any():      # a contact shadow on whatever is behind, down and to the right of this part
            sh = np.zeros_like(m1); sh[2:, 2:] = m1[:-2, :-2]; sh[1:, 1:] |= m1[:-1, :-1]; sh &= ~m1 & s.a; s.rgb[sh] *= shadow
        if alpha < 1:
            keep = m1 & (s.bay + .5 < alpha); s.rgb[m1 & s.a] = s.rgb[m1 & s.a] * (1 - alpha) + col[m1 & s.a] * alpha; put = keep & ~s.a; s.rgb[put] = col[put]; s.a |= keep
        else: s.rgb[m1] = col[m1]; s.a |= m1
        return m1
    def glow(s, x, y, r, color, k=.7, halo=.3):
        """light: it brightens the figure near (x, y) and a dithered halo is added round it"""
        x, y, r = x * s.K, y * s.K, r * s.K; g = np.clip(1 - np.hypot(s.X - x, s.Y - y) / r, 0, 1) ** 2 * k; c = rgb(color) if isinstance(color, str) else np.array(color, np.float32)
        s.rgb[s.a] += (c - s.rgb[s.a]) * g[s.a][:, None] * .8
        hm = (g > halo * .25) & ~s.a & (s.bay + .5 < g * 2.2); s.rgb[hm] = c * (.55 + g[hm][:, None] * .6); s.a |= hm
    def px(s, x, y, color):
        x, y = round(x * s.K), round(y * s.K)
        if 0 <= x < s.w and 0 <= y < s.h: s.rgb[y, x] = rgb(color) if isinstance(color, str) else color; s.a[y, x] = True
    def finish(s, outline=.3):
        """the dark outline round the figure: the colour of the pixel next to it, much darker"""
        a = s.a; o = np.zeros_like(a)
        o[1:, :] |= a[:-1, :]; o[:-1, :] |= a[1:, :]; o[:, 1:] |= a[:, :-1]; o[:, :-1] |= a[:, 1:]; o &= ~a
        col = np.zeros_like(s.rgb); cnt = np.zeros((s.h, s.w, 1), np.float32)
        for dy, dx in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            sh = np.roll(np.roll(s.rgb, dy, 0), dx, 1); sa = np.roll(np.roll(a, dy, 0), dx, 1); col += sh * sa[..., None]; cnt += sa[..., None]
        oc = col / np.maximum(cnt, 1) * outline + np.array([5, 4, 10], np.float32)
        s.rgb[o] = oc[o]; s.a = a | o
        return s.rgb, s.a

def pack(sets, ncol=56):
    """sets: {anim: [(rgb, alpha), ...]} -> (palette {letter: '#rrggbb'}, {anim: [rows of letters]}) with one palette for all frames"""
    allpx = np.concatenate([np.clip(f[0][f[1]], 0, 255) for fr in sets.values() for f in fr]).astype(np.uint8)
    q = Image.fromarray(allpx.reshape(1, -1, 3)).quantize(colors=ncol, method=Image.Quantize.MEDIANCUT, dither=Image.Dither.NONE)
    P = np.array(q.getpalette()[:ncol * 3], np.float32).reshape(-1, 3); P = P[:int(q.getextrema()[1]) + 1]
    CH = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz!#$%&()*+,-/:;<=>?@[]^_{|}~'; assert len(P) <= len(CH)
    pal = {CH[i]: '#%02x%02x%02x' % tuple(int(v) for v in P[i]) for i in range(len(P))}; out = {}
    for name, frames in sets.items():
        rows = []
        for c, a in frames:
            idx = np.argmin(((np.clip(c, 0, 255)[:, :, None, :] - P[None, None, :, :]) ** 2).sum(-1), axis=2)
            rows.append([''.join(CH[idx[y, x]] if a[y, x] else '.' for x in range(a.shape[1])) for y in range(a.shape[0])])
        out[name] = rows
    return pal, out
