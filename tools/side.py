#!/usr/bin/env python3
"""Gojo in side view (facing right), same 64x64 16-bit style as the front idle.
6-frame wind idle + 6-frame walk forward + 6-frame walk backward -> side.json, side_sheet.png.
Wind is a headwind (blows right->left): hair, blindfold tails and jacket trail behind him."""
import math, json, sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from PIL import Image, ImageDraw
import gojo

PAL = gojo.PAL
N = 64
L1 = L2 = 12.0
sin, cos, rad = math.sin, math.cos, math.radians

def pm(pts):                                     # polygon -> set of pixels (aliased)
    im = Image.new('L', (N, N), 0)
    ImageDraw.Draw(im).polygon([(round(x), round(y)) for x, y in pts], fill=255)
    a = im.load(); return {(x, y) for y in range(N) for x in range(N) if a[x, y]}
def disc(cx, cy, r): return {(x, y) for y in range(N) for x in range(N) if (x - cx) ** 2 + (y - cy) ** 2 <= r * r}
def seg(p0, p1, w0, w1):
    dx, dy = p1[0] - p0[0], p1[1] - p0[1]; l = math.hypot(dx, dy) or 1; nx, ny = -dy / l, dx / l
    return pm([(p0[0] + nx * w0 / 2, p0[1] + ny * w0 / 2), (p1[0] + nx * w1 / 2, p1[1] + ny * w1 / 2),
               (p1[0] - nx * w1 / 2, p1[1] - ny * w1 / 2), (p0[0] - nx * w0 / 2, p0[1] - ny * w0 / 2)])

class F:                                         # one 64x64 frame of palette letters
    def __init__(s): s.g = [['.'] * N for _ in range(N)]
    def set(s, x, y, c):
        x, y = round(x), round(y)
        if 0 <= x < N and 0 <= y < N: s.g[y][x] = c
    def at(s, x, y): return s.g[y][x] if 0 <= x < N and 0 <= y < N else '.'
    def fill(s, m, c):
        for x, y in m: s.set(x, y, c)
    def rim(s, m, c='O'):                        # 1px outline just outside a part, over whatever is below it
        for x, y in m:
            for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                if (x + dx, y + dy) not in m: s.set(x + dx, y + dy, c)
    def bands(s, m, base, lit, shade):           # lit back edge, shaded front edge (like the front sprite)
        rows = {}
        for x, y in m: rows.setdefault(y, []).append(x)
        for y, xs in rows.items():
            if len(xs) >= 3:
                if s.at(min(xs), y) == base: s.set(min(xs), y, lit)
                if s.at(max(xs), y) == base: s.set(max(xs), y, shade)
    def line(s, pts, c):
        for (x0, y0), (x1, y1) in zip(pts, pts[1:]):
            n = max(abs(x1 - x0), abs(y1 - y0), 1)
            for k in range(int(n) + 1): s.set(x0 + (x1 - x0) * k / n, y0 + (y1 - y0) * k / n, c)

def gait(q, amp, kmax):                          # hip angle (forward +) and knee flex for a leg at phase q
    th = amp * cos(2 * math.pi * q)
    k = kmax * sin(2 * math.pi * (q - .5)) if q >= .5 else .12 * kmax * sin(2 * math.pi * q)
    return rad(th), rad(k)

def leg(f, hx, hy, th, k, swing, near):
    kn = (hx + L1 * sin(th), hy + L1 * cos(th)); al = th - k
    an = (kn[0] + L2 * sin(al), kn[1] + L2 * cos(al))
    body = seg((hx, hy), kn, 7, 5.5) | seg(kn, an, 5.5, 3.8) | disc(kn[0], kn[1], 2.8)
    ph = .55 * k if swing else 0
    shoe = pm([(an[0] + x * cos(ph) - y * sin(ph), an[1] + x * sin(ph) + y * cos(ph)) for x, y in ((-3, -1), (2, -1), (4, 1), (8, 2), (8, 3), (-3, 3))])
    f.fill(body, 'B'); f.fill(shoe, 'Q' if near else 'P')
    f.bands(body, 'B', 'C' if near else 'B', 'A')
    f.rim(body | shoe, 'O')
    f.fill(shoe, 'Q' if near else 'P')
    if near:                                     # sheen: thigh edge, knee crescent, shin dash, shoe gloss
        d = (sin(th), cos(th)); nf = (cos(th), -sin(th))
        f.line([(hx + nf[0] * 2.2 + d[0] * 3, hy + nf[1] * 2.2 + d[1] * 3), (kn[0] + nf[0] * 1.8 - d[0] * 3, kn[1] + nf[1] * 1.8 - d[1] * 3)], 'D')
        for dx, dy, c in ((1.8, -1, 'D'), (2.2, 0, 'E'), (1.8, 1, 'D'), (.6, 2, 'D')): f.set(kn[0] + nf[0] * dx + d[0] * dy, kn[1] + nf[1] * dx + d[1] * dy, c)
        sd = (sin(al), cos(al)); f.line([(kn[0] + sd[0] * 5 + 1, kn[1] + sd[1] * 5), (an[0] - sd[0] * 2 + 1, an[1] - sd[1] * 2)], 'D')
        for x, y in shoe:
            if (x, y - 1) not in shoe and (x - an[0]) > -1 and (x - an[0]) < 6: f.set(x, y, 'R')
        f.set(an[0] + 4, an[1] + 1, 'Z')
    return kn, an

TIPS = [(27, 3), (30, 1), (33, 1), (36, 3)]
HAIR_TOP = {x: min(6, min(t + 2 * abs(x - tx) for tx, t in TIPS)) for x in range(25, 39)}
HAIR_TOP[25] = 7
HAIR_BOT = {25: 9, 26: 10, 27: 9, 28: 8, **{x: 6 for x in range(29, 39)}}

HEAD = [                      # x = 22..40
    ".......M..M........",
    "....M.MHMMHM.M.....",
    "...MHHIHHIHHIHM....",
    "..MHHWHIHHHHIHHM...",
    ".MIHIHIHIHIHIHIHM..",
    ".MJIJIJIJIJIJIJIM..",
    ".MJJJJJXXXXXJXJXJ..",
    "..MJJJXXXXXYXXXXX..",
    "...MJM..SUUSSSSSS..",
    "....MM..SUVSSSSSTT.",
    "........UUUSSSSVUV.",
    ".........VUUUSSSV..",
    "..........VUUUUV...",
]
assert all(len(r) == 19 for r in HEAD), [len(r) for r in HEAD]

def build(kind, i):
    f = F()
    if kind == 'idle':
        L = [.15, .35, .55, .7, .5, .25][i]; bob = [0, 0, 0, 1, 1, 0][i]
        thn, kn_, thf, kf, swn, swf = rad(4), 0, rad(-8), 0, False, False; p = i / 6
    else:
        amp, kmax = (26, 50) if kind == 'fwd' else (20, 40)
        p = i / 6 if kind == 'fwd' else ((-i) % 6) / 6
        qn, qf = p % 1, (p + .5) % 1
        thn, kn_ = gait(qn, amp, kmax); thf, kf = gait(qf, amp, kmax); swn, swf = qn >= .5, qf >= .5
        L = .8 + .25 * sin(2 * math.pi * i / 6) if kind == 'fwd' else max(-.2, .05 + .12 * sin(2 * math.pi * i / 6)); bob = 0
    drop = lambda th, k: L1 * cos(th) + L2 * cos(th - k)
    hy = round(58 - max(drop(thn, kn_), drop(thf, kf))); oy = hy - 34 + bob
    wave = [0, 1, 0, -1, 0, 1][i % 6]
    leg(f, 32, hy, thf, kf, swf, False)
    kn, an = leg(f, 32, hy, thn, kn_, swn, True)

    # jacket (+ flap trailing behind in the wind)
    jk = set()
    for y in range(15, 35):
        a, b = (30, 35) if y == 15 else (29, 36) if y < 23 else (29, 35) if y < 30 else (29, 37)
        jk |= {(x, y + oy) for x in range(a, b + 1)}
    fl = round(L * 3.5)
    flap = pm([(29, 27 + oy), (27 - fl, 28 + oy), (25 - fl * 2, 31 + oy), (25 - fl * 2, 33 + oy), (27 - fl, 34 + oy), (29, 34 + oy)]) if fl > 0 else set()
    f.fill(jk | flap, 'B'); f.bands(jk, 'B', 'C', 'A'); f.rim(jk | flap, 'O')
    for x, y in flap:
        if (x, y) not in jk: f.set(x, y, 'B')
    f.line([(27 - fl, 29 + oy), (28, 28 + oy)], 'D') if fl > 1 else None
    # near arm, hand in the pocket
    sw = round(1.2 * sin(2 * math.pi * p)) * (-1 if kind == 'back' else 1) if kind != 'idle' else 0
    S, E, P = (31, 16 + oy), (29 + sw, 26 + oy), (35, 31 + oy)
    arm = seg(S, E, 5, 4.4) | seg(E, P, 4.2, 3) | disc(E[0], E[1], 2.3)
    f.fill(arm, 'B'); f.bands(arm, 'B', 'C', 'A'); f.rim(arm, 'O')
    f.line([(S[0] + 1, S[1] + 2), (E[0] + 1, E[1] - 1)], 'D'); f.line([(E[0] + 2, E[1] + 2), (P[0] - 1, P[1] - 1)], 'D')
    f.set(P[0] + 1, P[1], 'S'); f.set(P[0] + 1, P[1] + 1, 'U')
    # jacket sheen
    f.line([(31, 15 + oy), (35, 15 + oy)], 'D'); f.set(33, 15 + oy, 'E')
    f.line([(34, 18 + oy), (35, 22 + oy)], 'D'); f.line([(32, 24 + oy), (34, 27 + oy)], 'D')
    f.line([(30, 25 + oy), (30, 28 + oy)], 'D'); f.line([(31, 33 + oy), (34, 33 + oy)], 'D')
    # collar (high, black, sheen strips)
    col = pm([(29, 10 + oy), (31, 11 + oy), (34, 13 + oy), (37, 13 + oy), (37, 17 + oy), (30, 17 + oy), (29, 13 + oy)])
    f.fill(col, 'B'); f.bands(col, 'B', 'C', 'A'); f.rim(col, 'O')
    f.line([(31, 13 + oy), (33, 14 + oy)], 'D'); f.line([(34, 15 + oy), (36, 15 + oy)], 'D'); f.set(30, 12 + oy, 'D')
    # blindfold tails first (they emerge from under the hair at the back and trail in the wind)
    for y, a_ in ((7, 29), (8, 28)): f.fill({(x, y + oy) for x in range(a_, 39)}, 'X')
    tl = 3 + round(L * 6)
    for k, dy0 in enumerate((0, 2)):
        pts = [(28 - j, 8 + oy + dy0 + round(.9 * sin(j * .9 + wave + k * 1.7))) for j in range(1, tl + 1)]
        for x, y in pts: f.set(x, y, 'X'); f.set(x, y + 1, 'X')
        f.set(*pts[len(pts) // 2], 'Y')
    # head, hand-drawn (x = 22 + column, y = 1 + row): static face/band first, then the hair on top, sheared by the wind
    sh = lambda y: -round(L * (7 - y) * .7) if y <= 6 else -round(L * 1.4)
    hair = []
    for r, row in enumerate(HEAD):
        for i, ch in enumerate(row):
            if ch == '.': continue
            x, y = 22 + i, 1 + r
            if ch in 'MHIJW': hair.append((x + sh(y), y + oy, ch))
            else: f.set(x, y + oy, ch)
    for x, y, ch in hair: f.set(x, y, ch)
    for x, y, ch in hair:                                    # re-outline any edge the shear exposed
        if ch != 'M' and any(f.at(x + dx, y + dy) == '.' for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1))): f.set(x, y, 'M')
    return f

def rows(f, x0, w): return [''.join(f.g[y][x0:x0 + w]) for y in range(N)]

sets = {k: [build(k, i) for i in range(6)] for k in ('idle', 'fwd', 'back')}
cells = [(x, y) for fs in sets.values() for f in fs for y in range(N) for x in range(N) if f.g[y][x] != '.']
x0, x1 = min(x for x, y in cells) - 1, max(x for x, y in cells) + 1
print('bbox cols', x0 + 1, x1 - 1, 'rows', min(y for x, y in cells), max(y for x, y in cells))
bad = {c for f in (f for fs in sets.values() for f in fs) for r in f.g for c in r} - set(PAL) - {'.'}
assert not bad, bad
json.dump({k: {'x0': x0, 'w': x1 - x0 + 1, 'h': N, 'cx': 32, 'frames': [rows(f, x0, x1 - x0 + 1) for f in fs]} for k, fs in sets.items()}, open('side.json', 'w'))

def render(f, sc, bg):
    im = Image.new('RGB', ((x1 - x0 + 1) * sc, N * sc), bg); px = im.load()
    for y in range(N):
        for x in range(x0, x1 + 1):
            c = f.g[y][x]
            if c != '.':
                h = PAL[c].lstrip('#'); rgb = tuple(int(h[i:i + 2], 16) for i in (0, 2, 4))
                for dy in range(sc):
                    for dx in range(sc): px[(x - x0) * sc + dx, y * sc + dy] = rgb
    return im
sc, W = 3, x1 - x0 + 1
sheet = Image.new('RGB', (6 * (W * sc + 4), 3 * (N * sc + 4)), (110, 110, 128))
for r, k in enumerate(('idle', 'fwd', 'back')):
    for i, f in enumerate(sets[k]): sheet.paste(render(f, sc, (110, 110, 128)), (i * (W * sc + 4), r * (N * sc + 4)))
sheet.save('side_sheet.png')
render(sets['idle'][0], 8, (110, 110, 128)).save('side_idle0.png'); print('sheet', sheet.size)

trio = Image.new('RGB', (3 * (W * 6 + 6), N * 6), (110, 110, 128))
for j, (k, i) in enumerate((('idle', 3), ('fwd', 1), ('back', 2))): trio.paste(render(sets[k][i], 6, (110, 110, 128)), (j * (W * 6 + 6), 0))
trio.save('side_trio.png')
