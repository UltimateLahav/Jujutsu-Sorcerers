#!/usr/bin/env python3
"""The Cartoon Cat (a curse; chapter 2), drawn from tools/cat_ref.png: a tall black rubber-hose cat with two white arcs for eyes, a wide grin of teeth, long thin arms with big white gloves, thin legs. A little rig of joints is rasterised at 4x and cut to whole pixels, then lit by rule (light from the upper left: the top and left edges are lit, the bottom and right edges are in the shade) and outlined, so every frame is clean 16-bit pixel art in the same look as the other fighters. He faces right (the game mirrors him); his feet are on row 62.
strips() -> {name: PNG data URL, 15 frames wide}; cells are 64x64 (idle, walk, the flat strips, stun), 128x64 (the stretching moves m0, m1, m3 and the dashes: the figure stands on column 36) and 96x64 (the hit reactions rx*: column 64, like Verity's). INFO gives the game each strip's cell size and anchor column.
Run on its own to write contact sheets:  python3 -B cat_rig.py <dir>"""
import base64, io, math, os, sys, copy
import numpy as np
from PIL import Image, ImageDraw
HERE = os.path.dirname(os.path.abspath(__file__))
N, SS = 15, 4
def url(im): b = io.BytesIO(); im.save(b, 'PNG', optimize=True); return 'data:image/png;base64,' + base64.b64encode(b.getvalue()).decode()

# ---------------------------------------------------------------- colours: five tones per material (lit edge, light, base, shade, dark edge)
BODY = [(78, 80, 100), (44, 45, 58), (23, 23, 31), (14, 14, 20), (8, 8, 12)]
GLOVE = [(255, 255, 255), (242, 242, 250), (222, 222, 236), (180, 180, 202), (132, 132, 160)]
OL = (3, 3, 6, 255)
EYE, EYE2, TEETH, GUM, MOUTH, NOSE = (252, 252, 255), (186, 186, 210), (240, 228, 202), (196, 74, 92), (64, 10, 26), (84, 84, 104)
BELLY = [(148, 148, 158), (112, 112, 124), (76, 76, 88)]

# ---------------------------------------------------------------- poses (x is relative to the anchor column, y is the picture row; his feet are on row 62)
STAND = dict(lean=0.0, hx=0.0, hy=9.6, hrot=0.0, sy=19.0, hp=44.0, aL=[(-7.4, 33), (-8.2, 46)], aR=[(7.4, 33), (8.2, 46)], gL=0.0, gR=0.0,
             lL=[(-2.2, 53), (-2.4, 60)], lR=[(2.2, 53), (2.4, 60)], eyes=0, mouth=0, sx=1.0, sz=1.0, rot=0.0, tx=0.0, ty=0.0, piv=(0.0, 62.0), belly=1, fl=0.0, nk=None, nw=4.8)
def pose(**kw): p = copy.deepcopy(STAND); p.update(kw); return p
mix = lambda a, b, t: [mix(x, y, t) for x, y in zip(a, b)] if isinstance(a, (list, tuple)) else a + (b - a) * t
ease = lambda t: t * t * (3 - 2 * t)
def blend(p, q, t): return {k: (mix(p[k], q[k], t) if isinstance(p[k], (list, tuple, float, int)) and not isinstance(p[k], bool) else p[k]) for k in p}
def keys(kf, f):                                    # kf: [(frame, pose)], eased between the neighbours; the discrete settings (eyes, mouth, belly) come from the earlier key
    kf = sorted(kf, key=lambda k: k[0])
    if f <= kf[0][0]: return kf[0][1]
    for (f0, p0), (f1, p1) in zip(kf, kf[1:]):
        if f0 <= f <= f1:
            q = blend(p0, p1, ease((f - f0) / max(1e-9, f1 - f0)))
            for k in ('eyes', 'mouth', 'belly'): q[k] = p0[k] if f < f1 else p1[k]
            return q
    return kf[-1][1]

# ---------------------------------------------------------------- shapes
class Cv:
    def __init__(s, W, H, ax, oy=0): s.W, s.H, s.ax, s.oy = W, H, ax, oy; s.im = Image.new('L', (W * SS, H * SS), 0); s.d = ImageDraw.Draw(s.im)
    def P(s, x, y): return ((s.ax + 0.5 + x) * SS, (y + s.oy) * SS)
    def poly(s, pts): s.d.polygon([s.P(*p) for p in pts], fill=255)
    def ell(s, cx, cy, rx, ry): s.d.ellipse([s.P(cx - rx, cy - ry), s.P(cx + rx, cy + ry)], fill=255)
    def line(s, pts, w):                                                  # a polyline of width w with round joints
        for (x0, y0), (x1, y1) in zip(pts, pts[1:]):
            L = math.hypot(x1 - x0, y1 - y0) or 1e-9; nx, ny = -(y1 - y0) / L * w / 2, (x1 - x0) / L * w / 2
            s.poly([(x0 + nx, y0 + ny), (x1 + nx, y1 + ny), (x1 - nx, y1 - ny), (x0 - nx, y0 - ny)])
        for x, y in pts: s.ell(x, y, w / 2, w / 2)
    def mask(s): return np.asarray(s.im.resize((s.W, s.H), Image.BOX)) >= 128
def rbox(cx, cy, w, h, r, n=7):                                           # the outline points of a rounded box (so it can be moved, scaled and turned like every other point)
    pts = []
    for (qx, qy, a0) in ((1, -1, -90), (1, 1, 0), (-1, 1, 90), (-1, -1, 180)):
        ccx, ccy = qx * (w / 2 - r), qy * (h / 2 - r)
        for i in range(n + 1): a = math.radians(a0 + 90 * i / n); pts.append((cx + ccx + r * math.cos(a), cy + ccy + r * math.sin(a)))
    return pts
def shade(m, tones):                                                      # light from the upper left: lit where the pixel above or to the left is empty, in shade where the one below or to the right is
    H, W = m.shape; pad = np.pad(m, 2); c = pad[2:-2, 2:-2]
    up1, lf1, dn1, rt1 = pad[1:-3, 2:-2], pad[2:-2, 1:-3], pad[3:-1, 2:-2], pad[2:-2, 3:-1]; up2, lf2, dn2, rt2 = pad[0:-4, 2:-2], pad[2:-2, 0:-4], pad[4:, 2:-2], pad[2:-2, 4:]
    t = np.full((H, W), 2, np.uint8)
    t[(~dn2) | (~rt2)] = 3; t[(~up2) | (~lf2)] = 1; t[(~dn1) | (~rt1)] = 4; t[(~up1) | (~lf1)] = 0      # (the edge facing the light wins over the one facing away)
    out = np.zeros((H, W, 4), np.uint8)
    for k, col in enumerate(tones): out[(t == k) & m] = col + (255,)
    return out

# ---------------------------------------------------------------- the figure
def render(p, W=64, ax=32, Hc=64, oy=0):
    """One frame: the pose p drawn in a W x Hc cell (Hc = 64 + oy: oy rows of room above him) with the middle of his body on column ax."""
    s_x, s_z, rot, tx, ty, pv = p['sx'], p['sz'], math.radians(p['rot']), p['tx'], p['ty'], p['piv']
    cr, sr = math.cos(rot), math.sin(rot)
    def T(x, y):                                                           # squash / stretch about the feet, turn about the pivot, move
        x, y = pv[0] + (x - pv[0]) * s_x, pv[1] + (y - pv[1]) * s_z
        dx, dy = x - pv[0], y - pv[1]; return (pv[0] + dx * cr - dy * sr + tx, pv[1] + dx * sr + dy * cr + ty)
    TL = lambda pts: [T(*q) for q in pts]
    lean, sy, hp = p['lean'], p['sy'], p['hp']; up = lambda y: lean * max(0.0, min(1.0, (hp - y) / 26.0))      # (the upper body leans: the higher a point is above the hips the more it moves)
    hy = p['hy']; hx = p['hx'] + up(hy)
    parts = []                                                             # (mask layer, tones) in drawing order, back to front
    def layer(fn, tones):
        c = Cv(W, Hc, ax, oy); fn(c); parts.append((c.mask(), tones))
    # legs and feet
    for key, sgn in (('lL', -1), ('lR', 1)):
        K, A = p[key]; hip = (sgn * 2.2, hp - 1)
        layer(lambda c: (c.line(TL([hip, K, A]), 2.6)), BODY)
        layer(lambda c: c.poly(TL([(A[0] - 1.8, A[1] - 0.8), (A[0] + 1.0, A[1] - 0.8), (A[0] + 4.6, A[1] + 1.0), (A[0] + 4.6, A[1] + 2.4), (A[0] - 1.8, A[1] + 2.4)])), BODY)
    # torso and neck
    chest, waist = 5.8, 4.7
    layer(lambda c: c.poly(TL([(-chest + up(sy), sy), (chest + up(sy), sy), (waist + up(36), 36), (4.9, hp), (-4.9, hp), (-waist + up(36), 36)])), BODY)
    if p.get('nk'):                                                                                       # (a stretched rubber neck: a tube along the points nk from the top of the body to the chin, 4.8 thick at the body and nw thick at the head)
        npts = TL(p['nk']); nn = len(npts) - 1
        def tube(c):
            for k in range(nn): c.line(npts[k:k + 2], 4.8 + (p['nw'] - 4.8) * (k + 0.5) / nn)
        layer(tube, BODY)
    else: layer(lambda c: c.poly(TL([(-2.4 + up(sy), sy + 1.5), (2.4 + up(sy), sy + 1.5), (2.4 + hx, hy + 5), (-2.4 + hx, hy + 5)])), BODY)
    # the head: a wide box with rounded corners and two ears
    hr = math.radians(p['hrot']); H0 = lambda a, b: (a * math.cos(hr) - b * math.sin(hr) + hx, a * math.sin(hr) + b * math.cos(hr) + hy)
    HEAD = [(-7.0, -7.2), (7.0, -7.2), (7.7, -3.0), (7.4, 2.6), (5.6, 6.6), (2.6, 8.0), (-2.6, 8.0), (-5.6, 6.6), (-7.4, 2.6), (-7.7, -3.0)]
    EAR = [(7.3, -5.4), (6.8, -12.0), (1.8, -7.0)]
    layer(lambda c: (c.poly(TL([H0(*q) for q in HEAD])), [c.poly(TL([H0(sg * a, b) for a, b in EAR])) for sg in (-1, 1)]), BODY)
    # the arms (thin rubber hoses) and their gloves
    gl = []; gaps = []
    for key, sgn, gk in (('aL', -1, 'gL'), ('aR', 1, 'gR')):
        E, H = p[key]; S0 = (sgn * 5.4 + up(sy + 1.6), sy + 1.8); d = (H[0] - E[0], H[1] - E[1]); L = math.hypot(*d) or 1; d = (d[0] / L, d[1] / L); n = (-d[1], d[0]); o = p[gk]
        if math.hypot(H[0] - S0[0], H[1] - S0[1]) > 30: E = ((S0[0] + H[0]) / 2, (S0[1] + H[1]) / 2)          # (a stretched arm is straight)
        layer(lambda c: c.line(TL([S0, E, H]), 1.9), BODY)
        gl.append((H, d, n, o))
    for H, d, n, o in gl:
        def glove(c, H=H, d=d, n=n, o=o):
            pc = (H[0] + d[0] * 1.8, H[1] + d[1] * 1.8)
            pts = [(pc[0] + n[0] * 3.0 * math.cos(a) + d[0] * 3.3 * math.sin(a), pc[1] + n[1] * 3.0 * math.cos(a) + d[1] * 3.3 * math.sin(a)) for a in np.linspace(0, 2 * math.pi, 14, endpoint=False)]
            c.poly(TL(pts))                                                                                   # the palm
            for k, ang in enumerate((-0.5, -0.1, 0.3)):                                                      # three fingers, spread when the hand is open
                a = ang * (0.4 + 1.4 * o); fd = (d[0] * math.cos(a) - d[1] * math.sin(a), d[0] * math.sin(a) + d[1] * math.cos(a)); b = (pc[0] + n[0] * (k - 1) * 1.6 + d[0] * 2.4, pc[1] + n[1] * (k - 1) * 1.6 + d[1] * 2.4)
                c.line(TL([b, (b[0] + fd[0] * (1.4 + 2.2 * o), b[1] + fd[1] * (1.4 + 2.2 * o))]), 1.5)
            tb = (pc[0] - n[0] * 2.6, pc[1] - n[1] * 2.6); c.line(TL([tb, (tb[0] - n[0] * (0.6 + 1.4 * o) + d[0] * (0.8 + 1.0 * o), tb[1] - n[1] * (0.6 + 1.4 * o) + d[1] * (0.8 + 1.0 * o))]), 1.6)    # the thumb
            c.poly(TL([(H[0] - d[0] * 1.4 + n[0] * 2.4, H[1] - d[1] * 1.4 + n[1] * 2.4), (H[0] + d[0] * 0.6 + n[0] * 2.4, H[1] + d[1] * 0.6 + n[1] * 2.4), (H[0] + d[0] * 0.6 - n[0] * 2.4, H[1] + d[1] * 0.6 - n[1] * 2.4), (H[0] - d[0] * 1.4 - n[0] * 2.4, H[1] - d[1] * 1.4 - n[1] * 2.4)]))   # the cuff
        layer(glove, GLOVE); gaps.append((H, d, n, o))
    # ---- compose
    out = np.zeros((Hc, W, 4), np.uint8)
    for m, tones in parts:
        sh = shade(m, tones); out[m] = sh[m]
    for H, d, n, o in gaps:                                                 # (the gaps between the fingers: short dark lines from the fingertips inwards)
        for k in (-1, 1):
            for r in (0.0, 1.0, 2.0):
                q = (H[0] + d[0] * (5.4 - r) + n[0] * k * (1.1 + 0.9 * o * (1 + r * 0.3)), H[1] + d[1] * (5.4 - r) + n[1] * k * (1.1 + 0.9 * o * (1 + r * 0.3))); X, Y = T(*q)
                gx, gy_ = int(math.floor(ax + 0.5 + X)), int(math.floor(Y)) + oy
                if 0 <= gx < W and 0 <= gy_ < Hc and out[gy_, gx, 3]: out[gy_, gx] = GLOVE[4] + (255,)
    def dot(x, y, col):
        X, Y = int(math.floor(ax + 0.5 + x)), int(math.floor(y)) + oy
        if 0 <= X < W and 0 <= Y < Hc and out[Y, X, 3]: out[Y, X] = col + (255,) if len(col) == 3 else col
    def hd(a, b, col):                                                       # a point on the head, from its own centre (when the figure is stretched the next row or column of the head can be two pixels away: the gap gets this point's colour)
        x, y = T(*H0(a, b)); dot(x, y, col); x2, y2 = T(*H0(a, b + 1)); x3, y3 = T(*H0(a + 1, b))
        if int(math.floor(y2)) - int(math.floor(y)) >= 2: dot((x + x2) / 2, (y + y2) / 2, col)
        if int(math.floor(x3)) - int(math.floor(x)) >= 2: dot((x + x3) / 2, (y + y3) / 2, col)
    if p['belly']:                                                          # the pale smudge on the belly
        for yy in range(31, 45):
            for xx in range(-4, 5):
                q = ((xx - 0.3) / 3.2) ** 2 + ((yy - 38.0) / 6.0) ** 2
                if q < 1.0: X, Y = T(xx + up(yy), yy); dot(X, Y, BELLY[0] if q < 0.22 else BELLY[1] if q < 0.62 else BELLY[2])
    e = p['eyes']
    for sg in (-1, 1):                                                      # the eyes: two white arcs (happy, closed); stunned: crosses; wide: ovals
        ex = sg * 3.7
        if e == 0:
            for dx in range(-2, 3): hd(ex + dx, -4.0, EYE); hd(ex + dx, -3.0, EYE if abs(dx) == 2 else EYE2) if abs(dx) == 2 else None
            for dx in (-3, 3): hd(ex + dx, -2.0, EYE); hd(ex + dx, -3.0, EYE)
            for dx in (-1, 0, 1): hd(ex + dx, -5.0, EYE2)
        elif e == 1:
            for k in range(-2, 3): hd(ex + k, -4.0 + k * 0.8, EYE); hd(ex + k, -4.0 - k * 0.8, EYE)
        elif e == 3:                                                        # bulging (shock): two big white discs, each with a tiny dark pupil looking forward
            for dy, w in enumerate((1, 2, 2, 2, 1)):
                for dx in range(-w, w + 1): hd(ex + dx, -6.0 + dy, EYE)
            hd(ex + 1, -4.0, OL[:3]); hd(ex + 1, -3.0, OL[:3])
        else:
            for dx in range(-2, 3): hd(ex + dx, -3.0, EYE)
            for dx in range(-2, 3): hd(ex + dx, -4.0, EYE2)
    hd(-1, 0.0, NOSE); hd(0, 0.0, NOSE)                                      # the nose
    m = p['mouth']; mw = 4 + (1 if m == 1 else 0)
    for dx in (range(-mw, mw + 1) if m != 2 else ()):                       # the grin: a row of teeth over gums over a row of teeth, the corners curl up (open: a dark mouth between them)
        yo = 3.0 - (1.0 if abs(dx) >= mw else 0.0)
        hd(dx, yo, TEETH); hd(dx, yo + 1, MOUTH if m == 1 else GUM)
        if abs(dx) < mw: hd(dx, yo + 2, MOUTH if m == 1 else TEETH)
        if m == 1 and abs(dx) < mw - 1: hd(dx, yo + 3, MOUTH); hd(dx, yo + 4, TEETH)
    for dx in (range(-mw + 1, mw, 2) if m != 2 else ()): hd(dx, 3.0, (176, 160, 134))                      # (the gaps between the teeth)
    if m == 2:                                                              # SHOCK: the grin drops into a big round O (a row of teeth along the top, the tongue at the bottom)
        for dy, w in enumerate((2, 3, 3, 3, 2, 1)):
            for dx in range(-w, w + 1): hd(dx, 3.0 + dy, TEETH if dy == 0 else GUM if dy == 4 else MOUTH)
    if p.get('face', 1) == 0:                                                # (seen from the back: no face)
        for a_ in range(-6, 7):
            for b_ in range(-5, 8): hd(a_, b_, BODY[2])
    # ---- the outline
    a = out[..., 3] > 0; edge = np.zeros_like(a)
    edge[1:, :] |= a[:-1, :]; edge[:-1, :] |= a[1:, :]; edge[:, 1:] |= a[:, :-1]; edge[:, :-1] |= a[:, 1:]
    out[edge & ~a] = OL
    return Image.fromarray(out, 'RGBA')

def flat(p, W=64, ax=32, H=64, oy=0):
    """The Cat smashed flat: a black strip two pixels thick on the floor (rows 60-61), ears and gloves poking out, the grin at one end. p: len (half length), wave (ripple phase), amp (ripple height), thick, face (0/1)."""
    out = np.zeros((H, W, 4), np.uint8); L = p.get('len', 23); amp = p.get('amp', 0.0); ph = p.get('wave', 0.0); y0 = 60
    def put(x, y, col):
        X, Y = ax + int(round(x)), int(round(y)) + oy
        if 0 <= X < W and 0 <= Y < H: out[Y, X] = col + (255,)
    for xi in range(-int(L), int(L) + 1):
        w = amp * math.sin(xi * 0.45 + ph); top = y0 + int(round(min(0, w))) ; bot = 61 + int(round(max(0, w)))
        for y in range(top, bot + 1): put(xi, y, BODY[1] if y == top else BODY[4] if y == bot else BODY[2])
    for sg in (-1, 1):                                                      # the gloves at both ends
        gx = sg * (int(L) + 1); put(gx, 60, GLOVE[1]); put(gx, 61, GLOVE[3]); put(gx + sg, 60, GLOVE[2]); put(gx + sg, 61, GLOVE[4])
    put(-int(L) + 2, 59, BODY[0]); put(-int(L) + 5, 59, BODY[0])            # the ears
    put(-int(L) + 3, 60, EYE); put(-int(L) + 6, 60, EYE); put(-int(L) + 4, 61, TEETH)       # the eyes and the grin
    a = out[..., 3] > 0; edge = np.zeros_like(a)
    edge[1:, :] |= a[:-1, :]; edge[:-1, :] |= a[1:, :]; edge[:, 1:] |= a[:, :-1]; edge[:, :-1] |= a[:, 1:]
    out[edge & ~a] = OL
    return Image.fromarray(out, 'RGBA')

# ---------------------------------------------------------------- the animations (15 frames each). A = anchor column of the cell.
WIDE, REACT = (128, 36), (96, 64)                                            # cells: 128 wide with the figure on column 36 (the stretching moves), 96 wide with it on column 64 (hit reactions); everything else is 64 x 64, column 32
def lerp(a, b, t): return a + (b - a) * t
def seg(f, a, b): return max(0.0, min(1.0, (f - a) / max(1e-9, b - a)))      # how far f is between frames a and b (0..1)
def hand(f, path):                                                           # a hand that goes through (frame, (x, y)) points, eased
    kf = sorted(path, key=lambda k: k[0])
    if f <= kf[0][0]: return kf[0][1]
    for (f0, p0), (f1, p1) in zip(kf, kf[1:]):
        if f0 <= f <= f1: t = ease((f - f0) / max(1e-9, f1 - f0)); return (lerp(p0[0], p1[0], t), lerp(p0[1], p1[1], t))
    return kf[-1][1]
def bend(S, H, sag=3.0):                                                      # the elbow of a rubber arm: half way, sagging a little when the arm is short, straight when it is stretched
    L = math.hypot(H[0] - S[0], H[1] - S[1]); k = max(0.0, 1 - L / 38.0) * sag
    return ((S[0] + H[0]) / 2, (S[1] + H[1]) / 2 + k)

def a_idle(i):                                                                # he stands: sways, the arms dangle and swing, the head bobs
    t = 2 * math.pi * i / N; s, c = math.sin(t), math.cos(t)
    return pose(lean=1.0 * s, hy=9.6 + 0.6 * math.sin(2 * t), hrot=2.2 * s, aL=[(-7.4 + 0.6 * s, 33), (-8.4 + 1.6 * math.sin(t + 0.8), 46 + 0.8 * math.sin(2 * t + 0.4))], aR=[(7.4 + 0.6 * s, 33), (8.4 + 1.6 * math.sin(t + 2.2), 46 + 0.8 * math.sin(2 * t + 1.4))])
def a_walk(i):                                                                # a bouncy cartoon walk: the feet take turns, the arms swing the other way, the body bobs
    t = 2 * math.pi * i / N; s = math.sin(t); legs = {}
    for key, ph, sg in (('lL', t, -1), ('lR', t + math.pi, 1)):
        x = 5.0 * math.sin(ph); lift = 3.4 * max(0.0, math.cos(ph)); ank = (sg * 2.2 + x, 60 - lift); hip = (sg * 2.2, 44); kn = ((hip[0] + ank[0]) / 2 + 1.6 + 0.6 * lift, (hip[1] + ank[1]) / 2 + 0.5)
        legs[key] = [kn, ank]
    b = 1.1 * abs(math.cos(t))
    return pose(lean=1.8, hp=44 - b, sy=19 - b, hy=9.6 - b, hrot=2.0 * s, aL=[(-7.2 + 2.2 * math.sin(t + math.pi), 33), (-8.0 + 4.6 * math.sin(t + math.pi), 46 - 1.5 * abs(math.sin(t)))], aR=[(7.2 + 2.2 * s, 33), (8.0 + 4.6 * s, 46 - 1.5 * abs(math.sin(t)))], **legs)
def a_m0(i):                                                                  # GRAB (hits 1 and 3): the near arm coils back, shoots out 66 px and grabs; the glove closes and pulls back (impact: frame 6; the pull is frames 8-13)
    f = float(i); S = (5.4, 20.8)
    H = hand(f, [(0, (8.2, 46)), (3, (-12.0, 31)), (6, (68.0, 25)), (8, (68.0, 25)), (13, (19.0, 32)), (14, (10.0, 42))])
    op = 0.0 if f < 3 else lerp(0.0, 1.0, seg(f, 3, 6)) if f < 6 else 1.0 - 0.7 * seg(f, 6.5, 8) if f < 13 else 0.3 * (1 - seg(f, 13, 14))
    lean = lerp(0.0, -3.0, seg(f, 0, 3)) if f < 3 else lerp(-3.0, 4.0, seg(f, 3, 6)) if f < 8 else lerp(4.0, 0.0, seg(f, 11, 14))
    return pose(lean=lean, hrot=lerp(0.0, -4.0, seg(f, 0, 3)) if f < 3 else lerp(-4.0, 6.0, seg(f, 3, 6)) if f < 11 else lerp(6.0, 0.0, seg(f, 11, 14)), mouth=1 if 5 <= f <= 10 else 0,
                aR=[bend(S, H), H], gR=op, aL=[(-8.4 - 1.5 * math.sin(f * 0.5), 33), (-10.0 - 2.0 * math.sin(f * 0.5 + 1), 44)], lR=[(2.2 + 1.4 * seg(f, 3, 6), 53), (2.4 + 3.0 * seg(f, 3, 6) - 3.0 * seg(f, 11, 14), 60)])
def a_m1(i):                                                                  # PUNCH (hit 2): the near hand still holds the enemy; the other arm winds back and punches him in the face (impact: frame 7)
    f = float(i); SR, SL = (5.4, 20.8), (-5.4, 20.8)
    HR = hand(f, [(0, (17.0, 31)), (9, (17.0, 31)), (11, (22.0, 36)), (14, (9.0, 44))]); HL = hand(f, [(0, (-9.0, 40)), (5, (-14.0, 29)), (7, (27.0, 25)), (8, (27.0, 25)), (14, (-8.4, 46))])
    shake = 0.5 * math.sin(f * 2.6) if f < 9 else 0.0
    return pose(lean=lerp(0.0, -2.0, seg(f, 0, 5)) if f < 6 else lerp(-2.0, 4.0, seg(f, 6, 7.5)) if f < 9 else lerp(4.0, 0.0, seg(f, 9, 14)), hrot=lerp(0.0, 5.0, seg(f, 5.5, 7.5)) if f < 10 else lerp(5.0, 0.0, seg(f, 10, 14)), mouth=1 if 5 <= f <= 10 else 0,
                aR=[bend(SR, (HR[0], HR[1] + shake)), (HR[0], HR[1] + shake)], gR=0.25 if f < 10 else lerp(0.25, 0.0, seg(f, 10, 12)) + (0.7 if 10 <= f < 11.5 else 0.0), aL=[bend(SL, HL), HL], gL=0.0)
def a_m3(i):                                                                  # KICK (hit 4): he leans back, the knee comes up, the rubber leg shoots out and kicks the enemy away (impact: frame 8)
    f = float(i); hip = (2.2, 43); A = hand(f, [(0, (2.4, 60)), (4, (6.0, 45)), (8, (36.0, 35)), (9, (36.0, 35)), (14, (2.4, 60))]); K = ((hip[0] + A[0]) / 2 + (1.0 - seg(f, 5, 8)) * 2.0, (hip[1] + A[1]) / 2 - 3.0 * (1 - seg(f, 4, 8)) * (1 - seg(f, 9, 12)))
    return pose(lean=lerp(0.0, -5.0, seg(f, 0, 5)) if f < 10 else lerp(-5.0, 0.0, seg(f, 10, 14)), hrot=lerp(0.0, -6.0, seg(f, 0, 5)) if f < 10 else lerp(-6.0, 0.0, seg(f, 10, 14)), mouth=1 if 6 <= f <= 10 else 0,
                lR=[K, A], lL=[(-2.2, 53), (-2.6, 60)], aL=[(-10.0, 28), (-14.0 - 2.0 * seg(f, 0, 5), 31)], aR=[(9.0, 27), (13.0, 31)], gL=0.6, gR=0.6)
def a_dashf(i):                                                               # DASH forward: he bends over, puts both gloves on the ground ahead, pushes off with his arms and glides low, then lands (the game moves him during frames 3-10)
    f = float(i); push = seg(f, 2, 5); glide = seg(f, 5, 7) * (1 - seg(f, 10, 13)); land = seg(f, 10, 14)
    rot = lerp(0.0, 38.0, seg(f, 0, 3)) if f < 5 else lerp(38.0, 62.0, seg(f, 5, 7)) if f < 10 else lerp(62.0, 0.0, land)
    ty = -16 * glide - (3 * push if f < 5 else 0); hands = [(15.0 + 6 * push, 61 - 1 * glide)]
    p = pose(rot=rot, piv=(0.0, 52.0), ty=ty, tx=lerp(0.0, 4.0, glide), hy=9.6 + 1.0 * seg(f, 0, 3) * (1 - land), mouth=1 if 3 <= f <= 11 else 0)
    if f <= 10:
        HL, HR = (13 + 6 * push, 52 + 4 * glide - 6 * push * 0 - 8 * (1 - seg(f, 0, 3))), (16 + 6 * push, 54 + 3 * glide - 8 * (1 - seg(f, 0, 3)))
        p['aL'], p['aR'] = [((HL[0] - 5) / 1.5 - 4, 40), HL], [((HR[0] - 5) / 1.5 - 2, 41), HR]; p['gL'] = p['gR'] = 0.8 - 0.6 * push
    p['lL'] = [(-2.2 - 2 * glide, 53 - 4 * glide), (-2.4 - 7 * glide, 60 - 8 * glide)]; p['lR'] = [(2.2 - 2 * glide, 53 - 4 * glide), (2.4 - 7 * glide, 60 - 8 * glide)]
    return p
def a_dashb(i):                                                               # DASH back: he puts both gloves on the ground behind him and pushes himself backwards, leaning back, sliding low, then lands
    f = float(i); push = seg(f, 2, 5); glide = seg(f, 5, 7) * (1 - seg(f, 10, 13)); land = seg(f, 10, 14)
    rot = lerp(0.0, -30.0, seg(f, 0, 3)) if f < 5 else lerp(-30.0, -52.0, seg(f, 5, 7)) if f < 10 else lerp(-52.0, 0.0, land)
    p = pose(rot=rot, piv=(0.0, 56.0), ty=-12 * glide, tx=lerp(0.0, -4.0, glide), hrot=-6.0 * (1 - land), mouth=1 if 3 <= f <= 11 else 0)
    if f <= 10:
        HL, HR = (-14 - 5 * push, 55 - 3 * glide), (-11 - 5 * push, 56 - 2 * glide); p['aL'], p['aR'] = [((HL[0] + 5) / 1.5, 40), HL], [((HR[0] + 5) / 1.5, 41), HR]; p['gL'] = p['gR'] = 0.8 - 0.6 * push
    p['lL'] = [(-2.2 + 3 * glide, 53 - 3 * glide), (-2.4 + 8 * glide, 60 - 6 * glide)]; p['lR'] = [(2.2 + 3 * glide, 53 - 3 * glide), (2.4 + 8 * glide, 60 - 6 * glide)]
    return p
def a_stun(i):                                                                # dizzy after being flat too long: swaying, eyes crossed, mouth wobbling
    t = 2 * math.pi * i / N; s = math.sin(t)
    return pose(lean=3.0 * s, hrot=11.0 * math.sin(t + 0.5), hy=10.6 + 0.5 * math.sin(2 * t), eyes=1, mouth=1, aL=[(-8.0 + 2.5 * s, 33), (-9.0 + 5.0 * s, 47)], aR=[(8.0 + 2.5 * s, 33), (9.0 + 5.0 * s, 47)],
                lL=[(-3.2 + s, 53), (-2.6 + 2 * s, 60)], lR=[(3.2 + s, 53), (2.6 + 2 * s, 60)], hp=45.0, sy=20.0)
def a_smash(i):                                                               # smashing himself flat (frames 0-7 pictured, 8-14 the thin strip). He jumps up with his arms raised, slams down and is squashed, bounces once and settles as a black strip two pixels thick
    f = float(i)
    up = pose(sz=1.08, ty=-11.0, hy=8.2, sy=18.0, aL=[(-9, 22), (-8, 8)], aR=[(9, 22), (8, 8)], gL=0.7, gR=0.7, lL=[(-2.0, 52), (-2.0, 57)], lR=[(2.0, 52), (2.0, 57)], mouth=1)
    if f <= 3: return keys([(0, pose()), (3, up)], f)
    SQ = pose(mouth=1, eyes=2, aL=[(-10, 36), (-15, 48)], aR=[(10, 36), (15, 48)], gL=1.0, gR=1.0, lL=[(-3.0, 53), (-3.6, 60)], lR=[(3.0, 53), (3.6, 60)])
    if f <= 4: return dict(squash=(1.45, 0.58), src=SQ)
    if f <= 5: return dict(squash=(2.5, 0.2), src=SQ)
    if f <= 6: return dict(squash=(2.1, 0.32), src=SQ)
    if f <= 7: return dict(squash=(2.8, 0.13), src=SQ)
    return {'flat': True, 'len': lerp(21.0, 23.0, seg(f, 8, 12)), 'amp': 1.4 * (1 - seg(f, 8, 12)), 'wave': -f * 1.4}
def a_flat(i):                                                                # flat on the floor: the strip ripples a little
    t = 2 * math.pi * i / N; return {'flat': True, 'len': 23, 'amp': 0.55, 'wave': t * 1.0}
def a_flatwalk(i):                                                            # sliding along the floor (3 times his walking speed): the strip ripples, stretching and shrinking like a worm
    t = 2 * math.pi * i / N; return {'flat': True, 'len': 23 + 2.0 * math.sin(t * 2), 'amp': 0.95, 'wave': -t * 2.0}
def a_flatpunch(i):                                                           # punching up from the floor: a glove on a thin arm shoots straight up out of the front end of the strip (impact: frame 6), then drops back
    f = float(i); h = 0 if f < 1 else 52 * ease(seg(f, 1, 6)) if f <= 7 else 52 * (1 - ease(seg(f, 8, 13)))
    return {'flat': True, 'len': 23, 'amp': 0.3, 'wave': f * 0.5, 'up': h, 'upx': 24}


def sc(f, path):                                                              # a number that goes through (frame, value) points, eased
    kf = sorted(path, key=lambda k: k[0])
    if f <= kf[0][0]: return kf[0][1]
    for (f0, v0), (f1, v1) in zip(kf, kf[1:]):
        if f0 <= f <= f1: return lerp(v0, v1, ease((f - f0) / max(1e-9, f1 - f0)))
    return kf[-1][1]
def a_rx0(i):                                                                 # hit reaction 0: the head snaps back, the arms fly up
    f = float(i); k = sc(f, [(0, 0), (3, 1), (6, 1), (14, 0)])
    return pose(lean=-4.5 * k, hx=-2.0 * k, hy=9.6 + 1.2 * k, hrot=-27 * k, eyes=1 if 1 <= f <= 10 else 0, mouth=1 if 1 <= f <= 11 else 0, aL=[(-9 - 3 * k, 31), (-13 - 6 * k, 37 - 5 * k)], aR=[(9 - 2 * k, 31), (12 - 3 * k, 35 - 6 * k)], gL=0.9 * k, gR=0.9 * k)
def a_rx1(i):                                                                 # hit reaction 1: doubled over, the head down by the belly
    f = float(i); k = sc(f, [(0, 0), (4, 1), (9, 1), (14, 0)])
    return pose(lean=8 * k, sy=19 + 6 * k, hy=9.6 + 13 * k, hx=3 * k, hrot=10 * k, eyes=1 if k > 0.3 else 0, mouth=1 if k > 0.3 else 0, aL=[(-7.4 - k, 33 + 5 * k), (-8.4 - 2 * k, 46 + 2 * k)], aR=[(7.4 + 3 * k, 33 + 5 * k), (8.4 + 5 * k, 46 + 2 * k)], lL=[(-2.2 - 1.4 * k, 53), (-2.4 - 1.5 * k, 60)], lR=[(2.2 + 2 * k, 53), (2.4 + 2.5 * k, 60)])
def a_rx2(i):                                                                 # hit reaction 2: he staggers back two steps, leaning away, the arms waving
    f = float(i); k = sc(f, [(0, 0), (3, 1), (10, 1), (14, 0)]); tx = sc(f, [(0, 0), (9, -9), (14, -9)]); s = math.sin(f * 1.1)
    la = hand(f, [(0, (-2.4, 60)), (2, (-2.4, 60)), (4, (-4.0, 56)), (6, (-7.0, 60)), (14, (-2.4, 60))]); ra = hand(f, [(0, (2.4, 60)), (6, (2.4, 60)), (8, (-1.0, 56)), (10, (-3.5, 60)), (14, (2.4, 60))])
    return pose(tx=tx, lean=-6.5 * k, hrot=-9 * k, hy=9.6 + 0.8 * k, eyes=1 if 1 <= f <= 11 else 0, mouth=1 if 1 <= f <= 12 else 0, aL=[(-9 - 3 * k * s, 30), (-12 - 6 * k * s, 29 - 3 * k)], aR=[(9 + 3 * k * s, 30), (12 + 6 * k * s, 29 + 3 * k * s)], gL=0.8 * k, gR=0.8 * k,
                lL=[((-2.2 + la[0]) / 2, (53 + la[1]) / 2), la], lR=[((2.2 + ra[0]) / 2, (53 + ra[1]) / 2), ra])
def a_rx4(i):                                                                 # hit reaction 4: knocked off his feet, he flies backwards, lands flat on his back, lies there and gets up (the engine uses this one for the big blows)
    f = float(i); rot = sc(f, [(0, -6), (1, -25), (2, -52), (3, -76), (4, -90), (9, -90), (14, 0)]); tx = sc(f, [(0, -2), (4, -24), (6, -26), (9, -26), (14, -10)]); ty = sc(f, [(0, 0), (1, -8), (2, -15), (3, -11), (4, 8), (5, 10), (6, 12), (9, 12), (14, 0)])
    return pose(rot=rot, piv=(0.0, 44.0), tx=tx, ty=ty, eyes=1 if f <= 11 else 0, mouth=1 if f <= 11 else 0, aL=[(-10, 30), (-13, 24 + (2 if f > 5 else 0))], aR=[(10, 30), (13, 24)], gL=0.9, gR=0.9, hrot=-8 if 4 <= f <= 10 else 0.0)

def a_jump(i):                                                                # JUMP (the game lifts him on its jump curve): he squashes down, springs up stretched with his arms over his head, tucks his legs at the top, falls stretched and lands in a squash
    f = float(i); sz = sc(f, [(0, 1.0), (2, 0.86), (3, 1.0), (5, 1.1), (9, 1.04), (11, 1.08), (12.5, 1.0), (13, 0.88), (14, 1.0)]); sx = sc(f, [(0, 1.0), (2, 1.1), (3, 1.0), (5, 0.94), (11, 0.95), (13, 1.1), (14, 1.0)])
    up = sc(f, [(0, 0), (3, 0), (5, 1), (10, 1), (12, 0.2), (14, 0)]); tuck = sc(f, [(0, 0), (5, 0), (7, 1), (9, 1), (11, 0), (14, 0)])
    return pose(sz=sz, sx=sx, mouth=1 if 3 <= f <= 12 else 0, aL=[(-7.4 - 3 * up, 33 - 12 * up), (-8.4 - 4 * up, 46 - 36 * up)], aR=[(7.4 + 3 * up, 33 - 12 * up), (8.4 + 4 * up, 46 - 36 * up)], gL=0.8 * up, gR=0.8 * up,
                lL=[(-2.2 - tuck, 53 - 5 * tuck), (-2.4 - 1.5 * tuck, 60 - 9 * tuck)], lR=[(2.2 + tuck, 53 - 5 * tuck), (2.4 + 1.5 * tuck, 60 - 9 * tuck)])
def a_toon(i):                                                                # CARTOON ATTACK (the summoning): he raises both arms with a wide grin, trembles, and lowers them
    f = float(i); up = sc(f, [(0, 0), (4, 1), (11, 1), (14, 0)]); sh = math.sin(f * 2.4) * up
    return pose(ty=-1.5 * up, lean=-1.0 * up + 0.8 * sh, hrot=4 * sh, mouth=1, eyes=2 if 5 <= f <= 11 else 0, aL=[(-8 - 3 * up, 33 - 10 * up), (-9 - 5 * up + sh, 46 - 34 * up)], aR=[(8 + 3 * up, 33 - 10 * up), (9 + 5 * up - sh, 46 - 34 * up)], gL=0.9 * up, gR=0.9 * up)
def a_huge(i):                                                                # the HUGE Cat of CARTOON ATTACK (the game draws him 3 times as big): he stands, leans back, and a low sweeping kick shoots out along the floor (impact: frame 10)
    f = float(i); hip = (2.2, 43)
    A = hand(f, [(0, (2.4, 60)), (5, (2.4, 60)), (8, (7.0, 54)), (10, (52.0, 51)), (12, (52.0, 51)), (14, (2.4, 60))])      # (his rubbery leg stretches out 52 px: the giant's kick reaches over 100 px
    K = ((hip[0] + A[0]) / 2 + 1.5 * (1 - seg(f, 8, 10)) * seg(f, 5, 8), (hip[1] + A[1]) / 2 - 4.0 * seg(f, 5, 8) * (1 - seg(f, 9, 11)))
    return pose(lean=sc(f, [(0, 0), (6, -4), (10, -6), (13, -2), (14, 0)]), hrot=-4 * seg(f, 4, 9), mouth=1 if 8 <= f <= 12 else 0, lR=[K, A], lL=[(-2.2, 53), (-2.6, 60)], aL=[(-10, 30), (-14 - 2 * seg(f, 5, 9), 38)], aR=[(9, 29), (13, 36)], gL=0.6, gR=0.6)
def a_rx3(i):                                                                 # hit reaction 3: he spins right round (his back comes to the picture, then his face again)
    f = float(i); k = sc(f, [(0, 0), (2, 1), (12, 1), (14, 0)]); cs = math.cos(2 * math.pi * (f - 2) / 10.0) if 2 <= f <= 12 else 1.0; sxv = cs if abs(cs) >= 0.12 else (0.12 if cs >= 0 else -0.12)
    return pose(sx=sxv, face=1 if cs >= 0 else 0, lean=-2.5 * k, hrot=-8 * k, eyes=1, mouth=1, aL=[(-9, 31), (-12, 25)], aR=[(9, 31), (12, 25)], gL=0.8, gR=0.8)
def a_rx5(i):                                                                 # hit reaction 5: he skids back on his heels, leaning away with his arms out, and shuffles back to where he stood
    f = float(i); k = sc(f, [(0, 0), (3, 1), (9, 1), (14, 0)]); tx = sc(f, [(0, 0), (4, -14), (9, -16), (14, 0)])
    return pose(tx=tx, lean=-7 * k, hrot=-10 * k, eyes=1 if k > 0.4 else 0, mouth=1, aL=[(-9 - 3 * k, 32), (-13 - 6 * k, 36 - 3 * k)], aR=[(9 + 2 * k, 32), (13 + 4 * k, 34 - 2 * k)], gL=0.7 * k, gR=0.7 * k, lL=[(-2.2 + 3 * k, 52), (-2.4 + 7 * k, 58 - 1.5 * k)], lR=[(2.2 + 4 * k, 52), (2.4 + 9 * k, 58 - 3 * k)])
def a_rx6(i):                                                                 # hit reaction 6: both arms up in front of his face to guard, ducking and shaking
    f = float(i); k = sc(f, [(0, 0), (3, 1), (11, 1), (14, 0)]); sh = math.sin(f * 3.2) * k
    return pose(hp=44 + 2 * k, sy=19 + 2 * k, hy=9.6 + 2 * k, lean=3 * k + 0.6 * sh, hrot=6 * k, eyes=1 if k > 0.5 else 0, mouth=1, aL=[(lerp(-7.4, -4, k), 31), (lerp(-8.4, 0, k), lerp(46, 13, k))], aR=[(lerp(7.4, 6, k), 31), (lerp(8.4, 6, k), lerp(46, 13, k))], gL=0.3 * k, gR=0.3 * k, lL=[(-3.5, 53), (-4, 60)], lR=[(3.5, 53), (4.2, 60)])
def a_rx7(i):                                                                 # hit reaction 7: he hops backwards (the game lifts him), knees tucked, arms out
    f = float(i); k = sc(f, [(0, 0), (2, 1), (12, 1), (14, 0)]); tx = sc(f, [(0, 0), (6, -10), (11, -10), (14, 0)])
    return pose(tx=tx, lean=-4 * k, hrot=-6 * k, eyes=1 if 1 <= f <= 11 else 0, mouth=1, aL=[(-10 * k - 7.4 * (1 - k), 30), (-14 * k - 8.2 * (1 - k), 32 + 14 * (1 - k))], aR=[(10 * k + 7.4 * (1 - k), 30), (14 * k + 8.2 * (1 - k), 32 + 14 * (1 - k))], gL=0.8 * k, gR=0.8 * k, lL=[(-2.2 - k, 53 - 4 * k), (-2.4 - 2 * k, 60 - 7 * k)], lR=[(2.2 + k, 53 - 4 * k), (2.4 + 2 * k, 60 - 7 * k)])
def a_rx8(i):                                                                 # hit reaction 8: dizzy, he wobbles from side to side with crossed eyes
    f = float(i); t = 2 * math.pi * f / 14.0; k = sc(f, [(0, 0), (2, 1), (12, 1), (14, 0)]); s = math.sin(t * 2) * k
    return pose(lean=4.5 * s, hrot=12 * math.sin(t * 2 + 0.6) * k, hy=10.2 + 0.6 * math.sin(t * 4) * k, eyes=1 if k > 0.3 else 0, mouth=1, aL=[(-8 + 2.5 * s, 33), (-9 + 5 * s, 47)], aR=[(8 + 2.5 * s, 33), (9 + 5 * s, 47)], lL=[(-3.2 + s, 53), (-2.6 + 2 * s, 60)], lR=[(3.2 + s, 53), (2.6 + 2 * s, 60)])
def a_rx9(i):                                                                 # hit reaction 9: he drops to one knee, head bowed, then gets up
    f = float(i); k = sc(f, [(0, 0), (4, 1), (10, 1), (14, 0)])
    return pose(hp=44 + 10 * k, sy=19 + 10 * k, hy=9.6 + 11 * k, lean=2.5 * k, hrot=8 * k, eyes=1 if k > 0.4 else 0, mouth=1, aL=[(-7.4, 33 + 10 * k), (-8.4, 46 + 8 * k)], aR=[(7.4 + 2 * k, 33 + 10 * k), (8.4 + 4 * k, 46 + 8 * k)], lL=[(-2.2 - 5 * k, 53 + 3 * k), (-2.4 - 3 * k, 60)], lR=[(2.2 + 2 * k, 53 + 5 * k), (2.4 - 6 * k, 60 + 1.0 * k)])

def a_ult1(i):                                                                # ULTIMATE, the knees: a loop of 6 knees in 15 frames (the game plays it at about 29 FPS, so 15 knees take 1.3 s). The near arm holds the enemy up by the neck, the knees drive into his gut, right, left, right ... (the impacts are on frames 0.75 + 2.5 j)
    f = float(i); k = [max(0.0, 1.0 - abs(((f - (0.75 + 2.5 * j) + 7.5) % 15.0) - 7.5) / 1.25) for j in range(6)]
    kR, kL = k[0] + k[2] + k[4], k[1] + k[3] + k[5]; kk = kR + kL; S = (5.4, 20.8); H = (22.5, 22.0 + 0.5 * math.sin(f * 2.1))
    return pose(lean=4.0 + 2.2 * kk, ty=-1.0 * kk, hrot=3.0 + 1.5 * kk, mouth=1, aR=[bend(S, H), H], gR=0.15, aL=[(-9.0, 31 - 2 * kk), (-13.0 + math.sin(f * 1.3), 39 - 4 * kk)], gL=0.5,
                lR=[(lerp(2.2, 15.0, kR), lerp(53, 38.0, kR)), (lerp(2.4, 11.0, kR), lerp(60, 50.0, kR))], lL=[(lerp(-2.2, 13.0, kL), lerp(53, 40.0, kL)), (lerp(-2.4, 9.5, kL), lerp(60, 51.0, kL))])
def a_ult2(i):                                                                # ULTIMATE, the throw (he lets go on frame 9): he heaves the enemy, hanging from his hand by the neck, back, then thrusts the arm forward and opens the glove (the game flings the enemy away)
    f = float(i); S = (5.4, 20.8)
    H = hand(f, [(0, (22.5, 22.0)), (5, (22.5, 22.0)), (7, (20.0, 25.0)), (9, (35.0, 14.0)), (11, (37.0, 13.0)), (14, (9.0, 44.0))])
    op = 0.15 if f < 8 else lerp(0.15, 1.0, seg(f, 8, 9.5)) if f < 11 else lerp(1.0, 0.3, seg(f, 11, 14))
    lean = lerp(4.0, -8.0, seg(f, 0, 6)) if f < 7 else lerp(-8.0, 9.0, seg(f, 7, 9.5)) if f < 10 else lerp(9.0, 0.0, seg(f, 10, 14))
    sz = lerp(1.0, 0.95, seg(f, 0, 6)) if f < 7 else lerp(0.95, 1.04, seg(f, 7, 9.5)) if f < 11 else lerp(1.04, 1.0, seg(f, 11, 14))
    return pose(lean=lean, sz=sz, hrot=lerp(3.0, -6.0, seg(f, 0, 6)) if f < 7 else lerp(-6.0, 6.0, seg(f, 7, 9.5)) if f < 12 else lerp(6.0, 0.0, seg(f, 12, 14)), mouth=1 if 6 <= f <= 12 else 0, aR=[bend(S, H), H], gR=op,
                aL=[(-9.0 - 2 * seg(f, 0, 6), 31), (-13.0 - 4 * seg(f, 0, 6) + 6 * seg(f, 7, 10), 39 - 6 * seg(f, 7, 10))], gL=0.5, lR=[(2.2 + 1.0 * seg(f, 7, 9.5), 53), (2.4 + 3.0 * seg(f, 7, 9.5) - 3 * seg(f, 11, 14), 60)])
def a_run(i):                                                                 # a cartoon sprint (the victim of Verity's FATALITY runs away from him): long strides, the arms pump, he leans into it
    t = 2 * math.pi * i / N; legs = {}
    for key, ph, sg in (('lL', t, -1), ('lR', t + math.pi, 1)):
        x = 8.5 * math.sin(ph); lift = 9.0 * max(0.0, math.cos(ph)); ank = (sg * 2.2 + x, 60 - lift); hip = (sg * 2.2, 44); kn = ((hip[0] + ank[0]) / 2 + 2.4 + 0.7 * lift, (hip[1] + ank[1]) / 2 + 0.5 - 0.3 * lift)
        legs[key] = [kn, ank]
    b = 1.6 * abs(math.cos(t))
    return pose(lean=7.0, hp=44 - b, sy=19 - b, hy=9.6 - b, hrot=2.5 * math.sin(t), mouth=1, aL=[(-6.0 + 5.0 * math.sin(t + math.pi), 33), (-3.0 + 11.0 * math.sin(t + math.pi), 40 - 4.0 * abs(math.sin(t)))], aR=[(6.0 + 5.0 * math.sin(t), 33), (3.0 + 11.0 * math.sin(t), 40 - 4.0 * abs(math.sin(t)))], gL=0.4, gR=0.4, **legs)

SNAP_HX, SNAP_HY = 44.0, 16.0                                                 # where the head is when it smashes into Gojo: this far in front of the body, at the height of his face
def neck(hx, hy, lean, sag, n=16):                                            # the points of a stretched rubber neck: a curve from the top of the body to the chin, sagging by sag pixels in the middle (a negative sag arches it up)
    b = (lean * 25.0 / 26.0, 20.5); e = (hx + lean, hy + 5.0); c = ((b[0] + e[0]) / 2, (b[1] + e[1]) / 2 + 2.0 * sag); pts = []
    for k in range(n): t = k / (n - 1.0); pts.append(((1 - t) ** 2 * b[0] + 2 * (1 - t) * t * c[0] + t * t * e[0], (1 - t) ** 2 * b[1] + 2 * (1 - t) * t * c[1] + t * t * e[1]))
    return pts
def a_shock(i):                                                               # SHOCK (he sees his shield cut in two): he squashes down, springs up with a take, hops, the eyes pop and the jaw drops, the arms fly up; then he stands trembling (frames 8-14 are a tremble that the game repeats)
    f = float(i); u = seg(f, 2.5, 4.5); air = math.sin(math.pi * seg(f, 3.0, 7.5)); tr = seg(f, 6.0, 8.0); sh = math.sin(f * 5.3); kn = math.sin(f * 4.6) * tr
    sz = sc(f, [(0, 1.0), (2.5, 0.88), (4.5, 1.2), (6.5, 1.04), (14, 1.04)])
    return pose(sz=sz, sx=1.0 + (1.0 - sz) * 0.6, ty=-7.0 * air, lean=-3.0 * u, hrot=5.0 * math.sin(f * 4.1) * tr, tx=0.7 * math.sin(f * 6.2) * tr, eyes=3 if f >= 2.5 else 0, mouth=2 if f >= 3.0 else 0, gL=1.0 * u, gR=1.0 * u,
                aL=[(-8.0 - 5.0 * u, 33 - 13.0 * u), (-9.0 - 6.0 * u + sh * tr, 46 - 42.0 * u + math.cos(f * 4.4) * tr)], aR=[(8.0 + 5.0 * u, 33 - 13.0 * u), (9.0 + 6.0 * u - sh * tr, 46 - 42.0 * u - math.cos(f * 4.4) * tr)],
                lL=[(-2.2 - 1.5 * air + kn, 53 - 3.0 * air), (-2.4 - 1.5 * air + kn * 1.5, 60 - 6.0 * air)], lR=[(2.2 + 1.5 * air - kn, 53 - 3.0 * air), (2.4 + 1.5 * air - kn * 1.5, 60 - 6.0 * air)])
def a_kickb(i):                                                               # KICKED IN THE FACE: the head shoots backwards on a rubber neck up to 170 px long, bounces on the end of it and hangs there shaking (frames 11-14 are a vibration that the game repeats); the arms flail, the knees knock
    f = float(i)
    u = sc(f, [(0, 0.0), (1, 0.05), (3, 0.42), (5, 0.84), (7, 1.07)]) if f < 7 else 1.0 + 0.07 * math.cos((f - 7) * math.pi / 2) * (0.35 + 0.65 * math.exp(-0.35 * (f - 7)))
    hx, hy = -2.0 - 160.0 * u, 10.8 - 16.0 * min(1.0, u); lean = -4.5 * seg(f, 0, 4); fl = seg(f, 1, 4); sw, cw = math.sin(f * 1.9), math.cos(f * 2.3)
    sag = 9.0 * u * u * (1.0 + 0.25 * math.sin(f * 1.6) * seg(f, 6, 9)); kn = math.sin(f * 2.2)
    return pose(lean=lean, hx=hx, hy=hy, hrot=-27.0 * seg(f, 0, 1.5) + 14.0 * math.sin(f * 1.1) * seg(f, 2, 9), nk=neck(hx, hy, lean, sag), nw=4.8 - 1.3 * min(1.0, u), sz=1.04 - 0.04 * seg(f, 0, 6), eyes=3 if f < 1.5 else 1, mouth=2 if f < 1.5 else 1, gL=1.0, gR=1.0,
                aL=[(-13.0, 20.0), (-15.0 + 2.0 * sw * fl, 4.0 + 3.0 * cw * fl)], aR=[(13.0, 20.0), (15.0 - 2.0 * sw * fl, 4.0 - 3.0 * cw * fl)],
                lL=[(-2.2 + 1.5 * kn, 53), (-2.4 + 2.0 * math.sin(f * 2.2 + 0.5), 60)], lR=[(2.2 - 1.5 * kn, 53), (2.4 - 2.0 * math.sin(f * 2.2 + 0.5), 60)])
def a_snap(i):                                                                # THE SNAP: the head is pulled back even further (frames 0-3), then it whips back over the body on its rubber neck and smashes into whatever stands in front of him (impact: frame 10, the head is SNAP_HX px in front of the body at face height), bounces back a little and hangs there; the body is dragged forward
    f = float(i); wd = ease(seg(f, 0, 3)); s = seg(f, 3.0, 9.6) ** 1.7; rec = max(0.0, f - 10.0); k = seg(f, 6, 10); st = ease(seg(f, 2, 9))
    if f < 3.0: hx, hy = -162.0 - 24.0 * wd, -5.2 - 2.0 * wd
    elif f <= 10.0: hx, hy = lerp(-186.0, SNAP_HX, s), lerp(-7.2, SNAP_HY, s) - 22.0 * math.sin(math.pi * s)
    else: hx, hy = SNAP_HX - 7.0 * math.sin(rec * math.pi / 2.5) * math.exp(-0.45 * rec), SNAP_HY + 1.5 * math.sin(rec * 1.4) * math.exp(-0.4 * rec)
    lean = 3.5 * wd + 4.5 * seg(f, 8, 10) - 1.5 * seg(f, 11, 14); sag = lerp(9.0, -22.0, seg(f, 3, 6.5)) if f < 6.5 else lerp(-22.0, 2.0, seg(f, 6.5, 10))
    return pose(lean=lean, hx=hx, hy=hy, hrot=-8.0 * wd * (1 - seg(f, 3, 4)) + 22.0 * math.sin(math.pi * seg(f, 3.0, 10.0)), nk=neck(hx, hy, lean, sag), nw=3.5 + 1.3 * s, sz=1.0 - 0.03 * st, eyes=1 if f < 2 else 0, mouth=1, gL=1.0, gR=1.0,
                aL=[(-9.0 - 2.0 * wd, 31), (-11.0 - 4.0 * wd + 14.0 * k, 42 - 10.0 * k)], aR=[(8.0 + 6.0 * k, 30 - 2.0 * k), (9.0 + 14.0 * k, 36 - 8.0 * k)],
                lL=[(-2.2 - 2.5 * st, 53), (-2.4 - 3.5 * st, 60)], lR=[(2.2 + 3.5 * st, 53), (2.4 + 4.5 * st, 60)])

def pose_of(name, i):
    if name == 'idle': return a_idle(i)
    if name == 'walk': return a_walk(i)
    if name == 'm0': return a_m0(i)
    if name == 'm1': return a_m1(i)
    if name == 'm3': return a_m3(i)
    if name == 'dashf': return a_dashf(i)
    if name == 'dashb': return a_dashb(i)
    if name == 'stun': return a_stun(i)
    if name == 'smash': return a_smash(i)
    if name == 'unsmash': return a_smash(14 - i)
    if name == 'flat': return a_flat(i)
    if name == 'flatwalk': return a_flatwalk(i)
    if name == 'flatpunch': return a_flatpunch(i)
    if name == 'rx0': return a_rx0(i)
    if name == 'rx1': return a_rx1(i)
    if name == 'rx2': return a_rx2(i)
    if name == 'rx4': return a_rx4(i)
    if name == 'jump': return a_jump(i)
    if name == 'toon': return a_toon(i)
    if name == 'huge': return a_huge(i)
    if name == 'rx3': return a_rx3(i)
    if name == 'rx5': return a_rx5(i)
    if name == 'rx6': return a_rx6(i)
    if name == 'rx7': return a_rx7(i)
    if name == 'rx8': return a_rx8(i)
    if name == 'rx9': return a_rx9(i)
    if name == 'ult1': return a_ult1(i)
    if name == 'ult2': return a_ult2(i)
    if name == 'run': return a_run(i)
    if name == 'shock': return a_shock(i)
    if name == 'kickb': return a_kickb(i)
    if name == 'snap': return a_snap(i)
    raise KeyError(name)
CELL = {'idle': (64, 32, 64, 0), 'walk': (64, 32, 64, 0), 'stun': (64, 32, 64, 0), 'smash': (64, 32, 80, 16), 'unsmash': (64, 32, 80, 16), 'flat': (64, 32, 64, 0), 'flatwalk': (64, 32, 64, 0), 'flatpunch': (64, 32, 64, 0), 'm0': WIDE + (64, 0), 'm1': WIDE + (64, 0), 'm3': WIDE + (64, 0), 'dashf': WIDE + (64, 0), 'dashb': WIDE + (64, 0), 'rx0': REACT + (64, 0), 'rx1': REACT + (64, 0), 'rx2': REACT + (64, 0), 'rx4': REACT + (64, 0), 'jump': (64, 32, 72, 8), 'toon': (64, 32, 64, 0), 'huge': WIDE + (64, 0), 'rx3': REACT + (64, 0), 'rx5': REACT + (64, 0), 'rx6': REACT + (64, 0), 'rx7': REACT + (64, 0), 'rx8': REACT + (64, 0), 'rx9': REACT + (64, 0), 'ult1': WIDE + (64, 0), 'ult2': WIDE + (64, 0), 'run': (64, 32, 64, 0), 'shock': (64, 32, 96, 32), 'kickb': (288, 196, 100, 36), 'snap': (288, 196, 100, 36)}
def frame(name, i):
    W, ax, H, oy = CELL[name]; p = pose_of(name, i)
    if p.get('squash'):                                                    # a cartoon squash: the picture itself is scaled (wider, much lower), standing on the floor
        src = render(p['src'], W, ax, H, oy); bb = src.getbbox(); sx, sz = p['squash']; crop = src.crop(bb); nw, nh = max(1, int(round(crop.width * sx))), max(1, int(round(crop.height * sz)))
        out = Image.new('RGBA', (W, H), (0, 0, 0, 0)); out.paste(crop.resize((nw, nh), Image.NEAREST), (int(round(ax + 0.5 - nw / 2)), bb[3] - nh)); return out
    if p.get('flat'):
        im = flat(p, W, ax, H, oy)
        if p.get('up'):                                                    # the arm that punches up: drawn with the same machinery (a thin black arm, a white glove on its end)
            c = Cv(W, H, ax, oy); x, h = p['upx'], p['up']; c.line([(x, 60), (x, 60 - h)], 1.9); arm = c.mask(); g = Cv(W, H, ax, oy); g.ell(x, 60 - h - 3.2, 3.3, 3.8); g.poly([(x - 2.4, 60 - h + 1.0), (x + 2.4, 60 - h + 1.0), (x + 2.4, 60 - h + 3.0), (x - 2.4, 60 - h + 3.0)]); gm = g.mask()
            a = np.asarray(im).copy(); sa = shade(arm, BODY); a[arm] = sa[arm]; sg = shade(gm, GLOVE); a[gm] = sg[gm] if h > 3 else a[gm]
            al = a[..., 3] > 0; edge = np.zeros_like(al); edge[1:, :] |= al[:-1, :]; edge[:-1, :] |= al[1:, :]; edge[:, 1:] |= al[:, :-1]; edge[:, :-1] |= al[:, 1:]; a[edge & ~al] = OL; im = Image.fromarray(a, 'RGBA')
        return im
    return render(p, W, ax, H, oy)
def strip(name):
    W, ax, H, oy = CELL[name]; out = Image.new('RGBA', (W * N, H), (0, 0, 0, 0))
    for i in range(N): out.paste(frame(name, i), (i * W, 0))
    return out
NAMES = list(CELL)
INFO = {n: {'w': CELL[n][0], 'h': CELL[n][2], 'cx': CELL[n][1], 'x0': 0, 'top': CELL[n][3]} for n in CELL}
def strips(names=None): return {n: url(strip(n)) for n in (names or NAMES)}

def sheet(d, names, zoom=2, cols=None):                                      # contact sheets for looking at the animations (not used by the game)
    cols = cols or N; rows = []
    for n in names:
        s = strip(n); bg = Image.new('RGBA', s.size, (34, 22, 36, 255)); bg.alpha_composite(s); rows.append(bg.resize((s.width * zoom, s.height * zoom), Image.NEAREST))
    out = Image.new('RGB', (max(r.width for r in rows), sum(r.height for r in rows) + 2 * len(rows)), (60, 50, 70)); y = 0
    for r in rows: out.paste(r.convert('RGB'), (0, y)); y += r.height + 2
    return out
if __name__ == '__main__':
    d = sys.argv[1] if len(sys.argv) > 1 else '.'
    for nm, names in (('a', ['idle', 'walk', 'stun']), ('b', ['smash', 'flat', 'flatwalk', 'flatpunch']), ('c', ['m0', 'm1', 'm3']), ('d', ['dashf', 'dashb']), ('e', ['rx0', 'rx1', 'rx2', 'rx4']), ('f', ['jump', 'toon', 'huge']), ('g', ['rx3', 'rx5', 'rx6']), ('h', ['rx7', 'rx8', 'rx9']), ('i', ['ult1', 'ult2', 'run']), ('j', ['shock', 'kickb', 'snap'])):
        sheet(d, names, 1).save(os.path.join(d, 'cat_%s.png' % nm))
