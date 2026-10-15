"""Draws the five CURSES of the challenge ladder (v1.00) as pixel art and writes curses.json.
Run from this folder:  python3 -B curse_art.py            (writes curses.json)
                       python3 -B curse_art.py sheet.png  (also writes a contact sheet to look at)

Every curse is a small figure function figure(P) that draws one picture from a dict of pose numbers P (body bob, arm and leg
angles, mouth, wings ...). An animation is a list of key poses; the frames in between are mixed smoothly (see track()).
Each figure faces RIGHT (the game mirrors it to face Gojo), stands on the row G of its canvas, and has head room inside the
canvas for hops, flights and dives, so the game needs no lift tables. Shading is automatic (shade()): every pixel of a body
material gets its light colour where the edge faces up/left and its dark colour where it faces down/right; an outline is
added last. Animations: idle, walk (loops), a1 a2 a3 (the three attacks: 8 frames, the blow lands on frame 4), hurt (2 frames).
"""
import json, math, sys
from PIL import Image, ImageDraw

# ------------------------------------------------------------------ the little paint box
class Cv:
    def __init__(s, w, h):
        s.w, s.h = w, h
        s.g = [['.'] * w for _ in range(h)]
    def _m(s, fn):
        im = Image.new('L', (s.w, s.h), 0); fn(ImageDraw.Draw(im)); return im
    def put(s, im, ch):
        bb = im.getbbox()
        if not bb: return
        px = im.load()
        for y in range(bb[1], bb[3]):
            for x in range(bb[0], bb[2]):
                if px[x, y]: s.g[y][x] = ch
    def ell(s, cx, cy, rx, ry, ch): s.put(s._m(lambda d: d.ellipse([cx - rx, cy - ry, cx + rx, cy + ry], fill=255)), ch)
    def poly(s, pts, ch): s.put(s._m(lambda d: d.polygon([(round(x), round(y)) for x, y in pts], fill=255)), ch)
    def line(s, x0, y0, x1, y1, w, ch): s.put(s._m(lambda d: d.line([(round(x0), round(y0)), (round(x1), round(y1))], fill=255, width=max(1, round(w)))), ch)
    def rect(s, x0, y0, x1, y1, ch): s.put(s._m(lambda d: d.rectangle([round(x0), round(y0), round(x1), round(y1)], fill=255)), ch)
    def dot(s, x, y, ch):
        x, y = round(x), round(y)
        if 0 <= x < s.w and 0 <= y < s.h: s.g[y][x] = ch

def pt(x, y, a, l):
    r = math.radians(a); return x + math.cos(r) * l, y + math.sin(r) * l

def limb(c, x, y, a1, l1, a2, l2, w, ch):
    """two segments from (x, y): angles in degrees (0 = right, 90 = down); returns the elbow and the tip"""
    x1, y1 = pt(x, y, a1, l1); x2, y2 = pt(x1, y1, a2, l2)
    c.line(x, y, x1, y1, w, ch); c.line(x1, y1, x2, y2, w, ch); c.ell(x1, y1, w / 2, w / 2, ch)
    return (x1, y1), (x2, y2)

def shade(c, mats):
    """mats: base letter -> (dark letter, light letter). Edges facing up/left get the light one, down/right the dark one."""
    W, H, g = c.w, c.h, c.g
    op = lambda x, y: 0 <= x < W and 0 <= y < H and g[y][x] != '.'
    out = [r[:] for r in g]
    for y in range(H):
        for x in range(W):
            ch = g[y][x]
            if ch in mats:
                tl = not op(x - 1, y) or not op(x, y - 1); br = not op(x + 1, y) or not op(x, y + 1)
                if tl and not br: out[y][x] = mats[ch][1]
                elif br and not tl: out[y][x] = mats[ch][0]
    for y in range(H):
        for x in range(W):
            if g[y][x] == '.' and (op(x + 1, y) or op(x - 1, y) or op(x, y + 1) or op(x, y - 1)): out[y][x] = 'o'
    c.g = out

# ------------------------------------------------------------------ animation: key poses mixed smoothly
def ease(t): return 0.5 - 0.5 * math.cos(math.pi * t)
def track(keys, n, loop=False):
    """keys: [(time 0..1, pose dict)] -> n pose dicts (a loop mixes the last key back into the first)"""
    out = []
    ks = sorted(keys, key=lambda k: k[0])
    if loop: ks = ks + [(1.0, ks[0][1])]
    for i in range(n):
        t = i / n if loop else i / (n - 1)
        for a, b in zip(ks, ks[1:]):
            if a[0] <= t <= b[0] or b is ks[-1]:
                u = 0 if b[0] == a[0] else min(1, max(0, (t - a[0]) / (b[0] - a[0]))); u = ease(u)
                out.append({k: a[1][k] + (b[1][k] - a[1][k]) * u for k in a[1]}); break
    return out

def build(fig, base, anims, W, H, mats):
    sets = {}
    for name, (n, loop, keys) in anims.items():
        frames = []
        for P in track([(t, {**base, **kw}) for t, kw in keys], n, loop):
            c = fig(P); shade(c, mats); frames.append([''.join(r) for r in c.g])
        sets[name] = frames
    return sets

def attack(rest, wind, strike, follow=None, fr=None):
    """the standard 8-frame blow: stand, wind up (peak on frame 3), strike (frame 4), follow through, recover"""
    follow = follow if follow is not None else strike
    return (8, False, [(0, rest), (3 / 7, wind), (4 / 7, strike), (5 / 7, follow), (1, rest)])

# ------------------------------------------------------------------ 1. WRETCHED GRUB (a small hunched sludge curse: scratch, bite lunge, spit)
def grub(P):
    c = Cv(56, 44); b, L, sq = P['bob'], P['lean'], P['sq']
    sx, sy = 31 + L * .5, 25 + b
    limb(c, sx - 3, sy, P['fa1'], 8, P['fa2'], 8, 2, '4')
    for dx, off, lift in ((-7, P['legA'], P['liftA']), (4, P['legB'], P['liftB'])):
        c.ell(26 + dx + off, 38 - lift, 5, 4, '5')
    for i in range(3): c.poly([(11 + i * 5, 22 + b + i), (13.5 + i * 5, 14 + b + i * 2), (16 + i * 5, 21 + b + i)], '7')
    c.ell(24, 28 + b, 15, 12 * sq, '2'); c.ell(28, 32 + b, 9, 6.5 * sq, '3')
    c.ell(36 + L, 20 + b, 10, 9, '2')
    c.ell(40 + L, 17 + b, 4, 4, 'e'); c.dot(42 + L, 17 + b, 'p'); c.dot(41 + L, 16 + b, 'p')
    mh = 1 + round(P['mouth'] * 5); c.rect(33 + L, 22 + b, 46 + L, 22 + b + mh, 'm')
    for k in range(0, 14, 3): c.dot(33 + L + k, 22 + b, 'w'); c.dot(34 + L + k, 22 + b + mh, 'w')
    (ex, ey), (tx, ty) = limb(c, sx, sy, P['na1'], 9, P['na2'], 9, 3, '2')
    for da in (-30, 0, 30):
        x2, y2 = pt(tx, ty, P['na2'] + da, 5); c.line(tx, ty, x2, y2, 1, 'w')
    if P['goo'] > .5: c.ell(47 + L, 22 + b + mh / 2, 3, 3, 'g')
    return c
GRUB_B = dict(bob=0, lean=0, sq=1, legA=0, legB=0, liftA=0, liftB=0, na1=70, na2=25, fa1=75, fa2=35, mouth=.2, goo=0)
GRUB = dict(
    idle=(6, True, [(0, {}), (.5, dict(bob=1, sq=.94, na1=78, fa1=80, mouth=.35))]),
    walk=(6, True, [(0, dict(legA=-4, legB=4, liftA=0, liftB=3, bob=0, na1=60)), (.5, dict(legA=4, legB=-4, liftA=3, liftB=0, bob=1, na1=80))]),
    a1=attack(dict(), dict(lean=-3, na1=-100, na2=-50, mouth=.1, sq=.95), dict(lean=4, na1=15, na2=-5, mouth=.8, bob=1), dict(lean=3, na1=40, na2=5, mouth=.5)),
    a2=attack(dict(), dict(sq=.78, bob=3, lean=-3, mouth=.1, legA=-3, legB=3), dict(bob=-5, lean=7, mouth=1, sq=1.05, na1=-10, na2=0, liftA=3, liftB=3), dict(bob=-2, lean=5, mouth=.8, liftA=2, liftB=2)),
    a3=attack(dict(), dict(lean=-4, sq=.9, mouth=0, bob=1, na1=95), dict(lean=5, mouth=1, goo=1, bob=0, sq=1.05), dict(lean=3, mouth=.6, goo=0)),
    hurt=(2, False, [(0, dict(lean=-5, sq=.85, mouth=1, bob=2, na1=110, na2=60)), (1, dict(lean=-3, sq=.9, mouth=.7, bob=1, na1=100, na2=50))]),
)
GRUB_PAL = {'o': '#15190f', '1': '#3c4a33', '2': '#5d7550', '3': '#8aa675', '4': '#7d8a63', '5': '#a9b58a', '6': '#d4dcb4', '7': '#3a2f22', '8': '#5a4a38', '9': '#8a7458',
            'w': '#f2efe0', 'e': '#ffe14a', 'p': '#1a1208', 'm': '#7a1420', 'g': '#9cff5a', 'r': '#ff4a3a'}
GRUB_MATS = {'2': ('1', '3'), '4': ('1', '6'), '5': ('4', '6'), '3': ('2', '3'), '7': ('o', '8')}

# ------------------------------------------------------------------ 2. LONG-ARM STALKER (tall and thin, arms that reach: reach sweep, double claw, shadow step)
def stalker(P):
    c = Cv(88, 84); b, L = P['bob'], P['lean']
    hx, hy = 29, 52 + b                                              # hips
    for idx, (kx, fx, lift) in enumerate(((P['kB'], P['fB'], P['liftB']), (P['kA'], P['fA'], P['liftA']))):
        ch = '4' if idx == 0 else '2'
        kx0, ky0 = hx + kx + 1, 66 + b * .5
        c.line(hx, hy, kx0, ky0, 3, ch); c.line(kx0, ky0, 28 + fx, 80 - lift, 3, ch); c.rect(26 + fx, 80 - lift, 33 + fx, 81 - lift, ch)
    sxx, syy = 30 + L, 29 + b                                        # shoulders
    limb(c, sxx - 1, syy, P['fa1'], 21, P['fa2'], 23, 3, '4')
    c.poly([(sxx - 5, syy - 2), (sxx + 5, syy - 2), (hx + 5, hy), (hx - 5, hy)], '2')
    c.poly([(sxx - 7, syy - 3), (sxx - 2, syy - 4), (sxx - 13 + P['cloak'], syy + 22), (sxx - 8, syy + 24)], '1')   # the ragged cloak hanging behind
    c.line(sxx, syy - 3, sxx + L * .5 + 1, 21 + b, 3, '2')                                                           # neck
    hdx, hdy = sxx + L * .6 + 1 + P['hx'], 15 + b
    for i in range(4): c.line(hdx - 3, hdy - 4 + i * 3, hdx - 15 + P['hair'] + i, hdy + 3 + i * 5, 1, '1')          # long black hair streaming back
    c.ell(hdx, hdy, 6, 9, '5'); c.rect(hdx + 1, hdy - 6, hdx + 3, hdy + 1 + round(P['eye']), 'r'); c.dot(hdx + 2, hdy - 5, 'w')   # the pale mask and the red slit eye
    c.line(hdx - 3, hdy + 6, hdx + 4, hdy + 6 + round(P['mouth'] * 3), 1, 'm')
    (ex, ey), (tx, ty) = limb(c, sxx + 1, syy, P['na1'], 21, P['na2'], 23, 3, '2')
    for da in (-35, 0, 35):
        x2, y2 = pt(tx, ty, P['na2'] + da, 7); c.line(tx, ty, x2, y2, 1, '5')
    return c
STAL_B = dict(bob=0, lean=0, hx=0, hair=0, cloak=0, kA=-1, kB=3, fA=-2, fB=5, liftA=0, liftB=0, fa1=82, fa2=84, na1=78, na2=88, eye=2, mouth=.2)
STAL = dict(
    idle=(6, True, [(0, {}), (.5, dict(bob=1, hair=-2, cloak=2, na1=84, fa1=86, eye=3))]),
    walk=(6, True, [(0, dict(kA=4, kB=-3, fA=6, fB=-4, liftA=0, liftB=3, bob=0, hair=-3)), (.5, dict(kA=-3, kB=4, fA=-4, fB=6, liftA=3, liftB=0, bob=1, hair=1))]),
    a1=attack(dict(), dict(lean=-4, na1=-95, na2=-70, hx=-1, eye=4), dict(lean=5, na1=-8, na2=2, hx=2, eye=1, cloak=-3, fa1=60, fa2=70), dict(lean=3, na1=5, na2=10, eye=1)),
    a2=attack(dict(), dict(lean=-3, na1=-120, na2=-80, fa1=-60, fa2=-50, eye=4), dict(lean=5, na1=-20, na2=15, fa1=-5, fa2=10, eye=1, cloak=-3), dict(lean=3, na1=40, na2=60, fa1=30, fa2=50)),
    a3=attack(dict(), dict(lean=-6, bob=3, na1=100, na2=100, fa1=100, fa2=100, kA=-3, kB=0, eye=0, mouth=.1), dict(lean=6, bob=-1, na1=-5, na2=0, fa1=20, fa2=30, eye=4, mouth=.8, cloak=-4), dict(lean=3, na1=20, na2=30, eye=2)),
    hurt=(2, False, [(0, dict(lean=-6, bob=2, hx=-2, na1=110, na2=130, fa1=110, fa2=130, eye=0, mouth=1, hair=3)), (1, dict(lean=-4, bob=1, hx=-1, na1=100, na2=115, fa1=100, fa2=110, eye=1, mouth=.6))]),
)
STAL_PAL = {'o': '#0a0612', '1': '#1a1226', '2': '#2f2145', '3': '#54407a', '4': '#3b2a56', '5': '#e9e2f2', '6': '#ffffff', '7': '#2b2036', '8': '#463a5a', '9': '#6a5a88',
            'w': '#ffffff', 'e': '#d8c8f0', 'p': '#120a1c', 'm': '#5a1a30', 'g': '#c8a0ff', 'r': '#ff2a3a'}
STAL_MATS = {'2': ('1', '3'), '4': ('1', '3'), '1': ('o', '2')}

# ------------------------------------------------------------------ 3. CYCLOPS WISP (a floating one-eyed orb: tentacle whip, eye beam, spin dash)
def wisp(P):
    c = Cv(72, 72); b = P['bob']; sx, sy = P['sx'], P['sy']
    bx, by = 30, 31 + b
    tp = P['tp']
    for i, (ox, w) in enumerate(((-9, 3), (-3, 3), (3, 3), (9, 3))):
        x0, y0 = bx + ox * sx, by + 11 * sy
        ch = '5' if i % 2 == 0 else '4'
        px, py = x0, y0
        for k in range(1, 8):
            ang = 90 + math.sin(tp + i * 1.3 + k * .8) * P['tamp'] * (k / 7)
            nx, ny = pt(px, py, ang, 4.2)
            c.line(px, py, nx, ny, 3 if k < 4 else 2, ch); px, py = nx, ny
        c.dot(px, py + 1, 'g')
    if P['whip'] > .05:                                                  # the front tentacle lashes forward
        wx0, wy0 = bx + 10 * sx, by + 8 * sy
        a = P['wa']; px, py = wx0, wy0
        for k in range(1, 9):
            ang = a + math.sin(k * .7 + tp) * 14 * P['whip']
            nx, ny = pt(px, py, ang, 4.6 * P['whip'] + 1.4); c.line(px, py, nx, ny, 3 if k < 5 else 2, '5'); px, py = nx, ny
        c.ell(px, py, 2, 2, 'g')
    for i in range(5):
        a = -150 + i * 30 + (P['spin'] * 12 * (i % 2))                  # little horns round the top
        x1, y1 = pt(bx, by, a, 15 * sx + P['spin'] * 7); x0, y0 = pt(bx, by, a, 11 * sx)
        c.line(x0, y0, x1, y1, 2 if i % 2 else 3, '8')
    c.ell(bx, by, 15 * sx, 14 * sy, '2'); c.ell(bx - 2, by + 4 * sy, 9 * sx, 7 * sy, '3')
    ex, ey = bx + 6 * sx + P['ex'], by - 1
    c.ell(ex, ey, 8, 7.5 * P['lid'], 'w'); c.ell(ex + 3, ey, 4.2, 4.2 * min(1, P['lid'] * 1.2), 'r' if P['glow'] < .5 else 'g'); c.ell(ex + 4, ey, 1.8, 2, 'p')
    c.line(ex - 8, ey - 7 * P['lid'], ex + 6, ey - 8 * P['lid'], 1, '1')
    if P['glow'] > .5:
        for k in range(8): x, y = pt(ex + 3, ey, k * 45, 7); c.dot(x, y, 'g')
    for k in range(round(P['streak'])):                                       # speed lines behind the spinning dash
        c.line(bx - 18 - k * 4, by - 8 + k * 5, bx - 30 - k * 4, by - 8 + k * 5, 1, '6')
    return c
WISP_B = dict(bob=0, sx=1, sy=1, tp=0, tamp=14, whip=0, wa=20, spin=0, ex=0, lid=1, glow=0, streak=0)
WISP = dict(
    idle=(6, True, [(0, dict(bob=0, tp=0, sy=1)), (.5, dict(bob=-2, tp=3.1, sy=1.04))]),
    walk=(6, True, [(0, dict(bob=0, tp=0, tamp=22, sx=1.03)), (.5, dict(bob=-3, tp=3.1, tamp=22, sx=.97))]),
    a1=attack(dict(), dict(sx=.95, tp=1, whip=.35, wa=-70, ex=-1), dict(sx=1.05, whip=1, wa=12, tp=2, ex=1, lid=.8), dict(whip=.7, wa=30, tp=2.5)),
    a2=attack(dict(), dict(sx=1.12, sy=1.12, glow=1, lid=1.1, ex=-2, bob=-3, tamp=24), dict(sx=1.15, sy=1.15, glow=1, lid=1.15, ex=2, bob=-3, tamp=30), dict(sx=1.05, sy=1.05, glow=1, lid=1, bob=-1)),
    a3=attack(dict(), dict(sx=.82, sy=.9, bob=3, tamp=30, spin=0, lid=.6), dict(sx=1.15, sy=.82, spin=1, streak=3, tamp=6, bob=0, lid=.7, ex=2), dict(sx=1.08, sy=.9, spin=.6, streak=2, tamp=12, bob=0)),
    hurt=(2, False, [(0, dict(sx=1.1, sy=.85, ex=-3, lid=.35, bob=2, tamp=28, tp=1)), (1, dict(sx=1.05, sy=.92, ex=-2, lid=.6, bob=1, tamp=20, tp=2))]),
)
WISP_PAL = {'o': '#14081c', '1': '#2c1346', '2': '#6a3da8', '3': '#a07ad8', '4': '#8a56c8', '5': '#c79af0', '6': '#e8d4ff', '7': '#2c1346', '8': '#e9d9a8', '9': '#fff2c8',
            'w': '#f4f0ff', 'e': '#ffffff', 'p': '#14081c', 'm': '#5a1a30', 'g': '#6cf3ff', 'r': '#ff3a6a'}
WISP_MATS = {'2': ('1', '3'), '3': ('2', '5'), '4': ('1', '5'), '5': ('4', '6'), '8': ('7', '9')}

# ------------------------------------------------------------------ 4. HOLLOW OGRE (a huge slow brute with a bone mask: club smash, ground slam, charge)
def ogre(P):
    c = Cv(112, 100); b, L = P['bob'], P['lean']
    hipx, hipy = 44, 66 + b
    for dx, off, lift, ch in ((-9, P['legB'], P['liftB'], '4'), (7, P['legA'], P['liftA'], '2')):
        c.rect(hipx + dx + off - 6, hipy + 2, hipx + dx + off + 6, 95 - lift, ch); c.rect(hipx + dx + off - 7, 91 - lift, hipx + dx + off + 8, 96 - lift, ch)
    sxx, syy = 46 + L, 40 + b
    limb(c, sxx - 8, syy + 2, P['fa1'], 22, P['fa2'], 22, 9, '4')
    c.ell(sxx - 8 + math.cos(math.radians(P['fa1'])) * 22 + math.cos(math.radians(P['fa2'])) * 24, syy + 2 + math.sin(math.radians(P['fa1'])) * 22 + math.sin(math.radians(P['fa2'])) * 24, 8, 8, '4')
    for i in range(5): c.poly([(22 + i * 5 + L * .4, 36 + b - i), (26 + i * 5 + L * .4, 24 + b - i * 2), (30 + i * 5 + L * .4, 38 + b - i)], '8')   # the bone spikes down the back
    c.poly([(sxx - 22, syy + 6), (sxx - 12, syy - 12), (sxx + 14, syy - 12), (sxx + 24, syy + 10), (hipx + 16, hipy + 8), (hipx - 18, hipy + 8)], '2')    # the hulking torso
    c.ell(sxx + 3, syy + 14, 12, 12, '3')
    for k in range(3): c.line(sxx - 6 + k * 6, syy + 6 + k * 3, sxx - 3 + k * 6, syy + 14 + k * 3, 1, 'r')                    # cracks glowing red
    hx2, hy2 = sxx + 9 + P['hx'], syy - 17
    c.ell(hx2, hy2, 11, 10, '5'); c.rect(hx2 - 2, hy2 + 4, hx2 + 11, hy2 + 7 + round(P['jaw'] * 4), '5')                      # the bone mask and its jaw
    c.rect(hx2 + 1, hy2 - 3, hx2 + 5, hy2 + 1, 'p'); c.rect(hx2 + 7, hy2 - 3, hx2 + 10, hy2 + 1, 'p'); c.dot(hx2 + 3, hy2 - 1, 'e'); c.dot(hx2 + 8, hy2 - 1, 'e')
    for k in range(0, 10, 3): c.dot(hx2 + 1 + k, hy2 + 5, 'p')
    c.poly([(hx2 - 6, hy2 - 8), (hx2 - 3, hy2 - 17), (hx2, hy2 - 9)], '8'); c.poly([(hx2 + 1, hy2 - 10), (hx2 + 5, hy2 - 19), (hx2 + 8, hy2 - 9)], '8')   # horns
    (ex, ey), (tx, ty) = limb(c, sxx + 12, syy + 1, P['na1'], 22, P['na2'], 22, 10, '2')
    c.ell(tx + math.cos(math.radians(P['na2'])) * 3, ty + math.sin(math.radians(P['na2'])) * 3, 9, 9, '2')
    for k in range(3): c.dot(tx + 4 + k * 3, ty - 2, 'w')
    return c
OGRE_B = dict(bob=0, lean=0, hx=0, jaw=.3, legA=0, legB=0, liftA=0, liftB=0, na1=70, na2=80, fa1=75, fa2=85)
OGRE = dict(
    idle=(6, True, [(0, {}), (.5, dict(bob=1, na1=76, fa1=80, jaw=.5, hx=1))]),
    walk=(6, True, [(0, dict(legA=-5, legB=5, liftA=0, liftB=4, bob=0, lean=1)), (.5, dict(legA=5, legB=-5, liftA=4, liftB=0, bob=2, lean=-1))]),
    a1=attack(dict(), dict(lean=-5, na1=-150, na2=-100, fa1=-140, fa2=-95, jaw=.8, bob=-1), dict(lean=8, na1=40, na2=20, fa1=45, fa2=25, jaw=1, bob=3, hx=3), dict(lean=6, na1=60, na2=50, fa1=60, fa2=55)),
    a2=attack(dict(), dict(lean=-6, na1=-160, na2=-110, fa1=40, fa2=60, jaw=.7, bob=-2), dict(lean=9, na1=70, na2=90, fa1=60, fa2=70, jaw=1, bob=5, hx=3), dict(lean=7, na1=75, na2=88)),
    a3=attack(dict(), dict(lean=-4, bob=4, na1=100, na2=120, fa1=100, fa2=120, legA=-6, legB=4, jaw=.2), dict(lean=11, bob=1, na1=20, na2=10, fa1=30, fa2=20, legA=7, legB=-5, liftB=4, jaw=1, hx=4), dict(lean=8, na1=45, na2=45, legA=4, legB=-2)),
    hurt=(2, False, [(0, dict(lean=-7, bob=3, na1=120, na2=150, fa1=125, fa2=150, jaw=1, hx=-3)), (1, dict(lean=-4, bob=2, na1=105, na2=125, fa1=105, fa2=125, jaw=.7, hx=-2))]),
)
OGRE_PAL = {'o': '#14100e', '1': '#3a3640', '2': '#6f6a78', '3': '#9d98a6', '4': '#58535f', '5': '#e6dcc0', '6': '#fff6dc', '7': '#3a2e24', '8': '#c8bc9c', '9': '#f2e8cc',
            'w': '#fff6dc', 'e': '#ff9a2a', 'p': '#14100e', 'm': '#5a1a30', 'g': '#ff9a2a', 'r': '#d83a2a'}
OGRE_MATS = {'2': ('1', '3'), '3': ('2', '3'), '4': ('1', '3'), '5': ('8', '6'), '8': ('7', '9')}

# ------------------------------------------------------------------ 5. CARRION IMP (a winged crimson imp: dive claw, fire bolt, wing gust)
def imp(P):
    c = Cv(96, 92); a = P['air']; b = P['bob'] - a; L = P['lean']
    bx, by = 38 + L * .4, 62 + b
    # tail (behind)
    px, py = bx - 8, by + 6
    for k in range(1, 9):
        ang = 180 - 20 + math.sin(P['ts'] + k * .5) * 25 + k * 5
        nx, ny = pt(px, py, ang, 3.6); c.line(px, py, nx, ny, 2, '4'); px, py = nx, ny
    c.poly([(px - 3, py - 3), (px + 3, py), (px - 3, py + 4)], '8')
    # far wing then near wing
    for sh, ch, off in ((-3, '7', 0), (3, '4', 1)):
        wa = P['wa'] + off * 6
        ox, oy = bx - 1 + sh, by - 9
        tipx, tipy = pt(ox, oy, -90 - 40 + wa, 34 * P['ws']); mid = pt(ox, oy, -90 - 5 + wa * .6, 26 * P['ws'])
        low = pt(ox, oy, 25 + wa * .5, 22 * P['ws'])
        c.poly([(ox, oy), (tipx, tipy), mid, low], ch)
        c.line(ox, oy, tipx, tipy, 2, '8')
    c.ell(bx, by, 9, 12, '2'); c.ell(bx + 2, by + 3, 5, 8, '3')
    for dx, kb, ch in ((-4, P['kb'], '4'), (4, -P['kb'], '2')):
        kx, ky = bx + dx + kb * .6, by + 12; c.line(bx + dx, by + 8, kx, ky, 3, ch); c.line(kx, ky, bx + dx + kb, by + 20 + (4 if a else 0) * 0, 3, ch); c.rect(bx + dx + kb - 1, by + 20, bx + dx + kb + 4, by + 21, ch)
    hx2, hy2 = bx + 5 + L * .4, by - 20
    c.ell(hx2, hy2, 8, 8, '2')
    c.poly([(hx2 - 6, hy2 - 5), (hx2 - 5, hy2 - 15), (hx2 - 1, hy2 - 7)], '8'); c.poly([(hx2 + 1, hy2 - 7), (hx2 + 6, hy2 - 16), (hx2 + 7, hy2 - 5)], '8')
    c.ell(hx2 + 4, hy2 - 1, 2.6, 2.2, 'e'); c.dot(hx2 + 5, hy2 - 1, 'p')
    mh = 1 + round(P['mouth'] * 4); c.rect(hx2 + 1, hy2 + 3, hx2 + 10, hy2 + 3 + mh, 'm'); c.dot(hx2 + 2, hy2 + 3, 'w'); c.dot(hx2 + 6, hy2 + 3, 'w'); c.dot(hx2 + 9, hy2 + 3, 'w')
    (ex, ey), (tx, ty) = limb(c, bx + 4, by - 8, P['na1'], 10, P['na2'], 10, 3, '2')
    for da in (-30, 0, 30):
        x2, y2 = pt(tx, ty, P['na2'] + da, 5); c.line(tx, ty, x2, y2, 1, 'w')
    if P['fire'] > .5: c.ell(tx + 5, ty, 5, 5, 'g'); c.ell(tx + 5, ty, 3, 3, 'y'); c.dot(tx + 5, ty, 'w')
    return c
IMP_B = dict(air=0, bob=0, lean=0, wa=20, ws=1, ts=0, kb=3, na1=60, na2=40, mouth=.2, fire=0)
IMP = dict(
    idle=(6, True, [(0, dict(wa=10, ts=0)), (.5, dict(wa=45, ts=3, bob=1, air=0, mouth=.4))]),
    walk=(6, True, [(0, dict(wa=0, air=3, kb=5, ts=0, bob=0)), (.5, dict(wa=55, air=0, kb=-3, ts=3, bob=1))]),
    a1=attack(dict(), dict(air=16, wa=-5, ws=1.05, lean=-5, kb=-2, na1=-110, na2=-90, mouth=.1), dict(air=2, wa=70, ws=.9, lean=7, kb=6, na1=15, na2=5, mouth=1), dict(air=0, wa=40, lean=4, na1=40, na2=30, mouth=.5)),
    a2=attack(dict(), dict(lean=-5, na1=-120, na2=-100, wa=5, kb=-2, mouth=.1, fire=1), dict(lean=6, na1=0, na2=-5, wa=40, mouth=1, fire=0), dict(lean=4, na1=30, na2=20, wa=30)),
    a3=attack(dict(), dict(wa=-30, ws=1.25, lean=-3, air=4, kb=0, na1=100, na2=90, mouth=.2), dict(wa=75, ws=1.3, lean=4, air=2, mouth=1), dict(wa=20, ws=1.15, air=1, mouth=.6)),
    hurt=(2, False, [(0, dict(lean=-7, wa=80, air=2, kb=-2, na1=120, na2=140, mouth=1)), (1, dict(lean=-4, wa=50, air=1, na1=105, na2=120, mouth=.7))]),
)
IMP_PAL = {'o': '#1a0608', '1': '#4a0f18', '2': '#b02a34', '3': '#e0584a', '4': '#7c1824', '5': '#c05a5a', '6': '#e8a090', '7': '#2a1018', '8': '#e8dcc0', '9': '#fff4d8',
           'w': '#fff4d8', 'e': '#ffe14a', 'p': '#1a0608', 'm': '#4a0a12', 'g': '#ff7a1a', 'y': '#ffe14a', 'r': '#ff3a2a'}
IMP_MATS = {'2': ('1', '3'), '3': ('2', '3'), '4': ('1', '2'), '7': ('o', '4'), '8': ('7', '9')}

CURSES = [
    ('grub', grub, GRUB_B, GRUB, 56, 44, 41, GRUB_PAL, GRUB_MATS, dict(cx=26, hw=12)),
    ('stalker', stalker, STAL_B, STAL, 88, 84, 81, STAL_PAL, STAL_MATS, dict(cx=29, hw=7)),
    ('wisp', wisp, WISP_B, WISP, 72, 72, 69, WISP_PAL, WISP_MATS, dict(cx=30, hw=13)),
    ('ogre', ogre, OGRE_B, OGRE, 112, 100, 96, OGRE_PAL, OGRE_MATS, dict(cx=46, hw=20)),
    ('imp', imp, IMP_B, IMP, 96, 92, 83, IMP_PAL, IMP_MATS, dict(cx=38, hw=10)),
]

def main():
    out = {}
    for name, fig, base, anims, W, H, G, pal, mats, meta in CURSES:
        sets = build(fig, base, anims, W, H, mats)
        out[name] = {'w': W, 'h': H, 'g': G, 'pal': pal, **meta, **{k: {'w': W, 'h': H, 'frames': v} for k, v in sets.items()}}
    json.dump(out, open('curses.json', 'w'), separators=(',', ':'))
    print('wrote curses.json', {k: sum(len(v[a]['frames']) for a in ('idle', 'walk', 'a1', 'a2', 'a3', 'hurt')) for k, v in out.items()})
    if len(sys.argv) > 1:
        rows = []
        for name, d in out.items():
            col = {k: tuple(int(v[i:i + 2], 16) for i in (1, 3, 5)) for k, v in d['pal'].items()}
            frames = [f for a in ('idle', 'walk', 'a1', 'a2', 'a3', 'hurt') for f in d[a]['frames']]
            S = 2; cols = 8; W, H = d['w'], d['h']
            sheet = Image.new('RGB', (cols * (W * S + 4), ((len(frames) + cols - 1) // cols) * (H * S + 4)), (58, 52, 74))
            for i, fr in enumerate(frames):
                im = Image.new('RGB', (W, H), (58, 52, 74))
                for y, r in enumerate(fr):
                    for x, ch in enumerate(r):
                        if ch != '.': im.putpixel((x, y), col.get(ch, (255, 0, 255)))
                sheet.paste(im.resize((W * S, H * S), Image.NEAREST), ((i % cols) * (W * S + 4), (i // cols) * (H * S + 4)))
            sheet.save(sys.argv[1].replace('.png', '_' + name + '.png'))

if __name__ == '__main__': main()
