#!/usr/bin/env python3
"""Gojo side-view walk cycles (facing right): 6 frames forward + 6 frames backward -> walk.json, walk_sheet.png"""
import math, json, sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from PIL import Image, ImageDraw
import gojo

N = 64
PAL = gojo.PAL
def hx(c): c = PAL[c].lstrip('#'); return tuple(int(c[i:i + 2], 16) for i in (0, 2, 4)) + (255,)
def new(): return Image.new('RGBA', (N, N), (0, 0, 0, 0))
def R(v): return int(round(v))
def poly(im, pts, c): ImageDraw.Draw(im).polygon([(R(x), R(y)) for x, y in pts], fill=hx(c))
def line(im, pts, c, w=1): ImageDraw.Draw(im).line([(R(x), R(y)) for x, y in pts], fill=hx(c), width=w)
def put(im, x, y, c):
    if 0 <= R(x) < N and 0 <= R(y) < N: im.putpixel((R(x), R(y)), hx(c))
def rim(im, c):
    a = im.split()[3].load(); out = []
    for y in range(N):
        for x in range(N):
            if a[x, y] == 0 and any(0 <= x + dx < N and 0 <= y + dy < N and a[x + dx, y + dy] > 0 for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1))):
                out.append((x, y))
    for x, y in out: put(im, x, y, c)

L1 = L2 = 12
def leg(q, amp, kmax):
    th = amp * math.cos(2 * math.pi * q)
    k = kmax * math.sin(2 * math.pi * (q - .5)) if q >= .5 else .12 * kmax * math.sin(2 * math.pi * q)
    return math.radians(th), math.radians(k)

def joints(h, th, k):
    kn = (h[0] + L1 * math.sin(th), h[1] + L1 * math.cos(th))
    al = th - k
    return kn, (kn[0] + L2 * math.sin(al), kn[1] + L2 * math.cos(al))

def draw_leg(im, h, th, k, swing, near):
    kn, an = joints(h, th, k)
    body, hi = ('B', 'C') if near else ('A', 'B')
    lay = new()
    line(lay, [h, kn], body, 5); line(lay, [kn, an], body, 4)
    line(lay, [(h[0] + 2, h[1] + 1), (kn[0] + 2, kn[1])], hi, 1)                 # lit front edge
    rim(lay, 'O'); im.alpha_composite(lay)
    ph = .55 * k if swing else 0
    pts = [(-2, -1), (2, -1), (3, 0), (7, 2), (7, 3), (-2, 3)]
    sh = new()
    poly(sh, [(an[0] + x * math.cos(ph) - y * math.sin(ph), an[1] + x * math.sin(ph) + y * math.cos(ph)) for x, y in pts], 'Q' if near else 'P')
    rim(sh, 'O'); im.alpha_composite(sh)
    if near:
        put(im, an[0] + 1 + math.cos(ph), an[1] + math.sin(ph), 'R')
        put(im, an[0] + 4 + math.cos(ph), an[1] + 1.5, 'Z')
    return kn

def hair_pts(w):
    base = [(4, -4), (6, -8), (2, -7), (3, -12), (-1, -8), (-2, -13), (-5, -8), (-9, -10), (-7, -4), (-11, -2),
            (-8, 0), (-7, 4), (-5, 1), (-6, -2), (-5, -3), (3, -4)]
    return [(x - w * max(0.0, (-3 - y)) / 9.0, y if y > -4 else -4 + (y + 4) * 0.78) for x, y in base]

def frame(i, back):
    amp, kmax = (20, 40) if back else (26, 50)
    p = ((-i) % 6) / 6 if back else i / 6
    qn, qf = p % 1, (p + .5) % 1
    thn, kn_ = leg(qn, amp, kmax); thf, kf = leg(qf, amp, kmax)
    drop = lambda th, k: L1 * math.cos(th) + L2 * math.cos(th - k)
    hx0 = 31
    hy = R(58 - max(drop(thn, kn_), drop(thf, kf)))
    H = (hx0, hy); l = -1 if back else 1
    wind = (2.0 + (i % 2)) if not back else -(1.5 + (i % 2))                 # relative wind: hair streams backward when walking forward
    im = new()
    draw_leg(im, H, thf, kf, qf >= .5, False)
    draw_leg(im, H, thn, kn_, qn >= .5, True)
    # jacket
    hl = 1 if i % 3 == 1 else 0
    jk = new()
    poly(jk, [(hx0 - 5 + l, hy - 15), (hx0 + 5 + l, hy - 15), (hx0 + 6 + l * .5, hy - 7), (hx0 + 6, hy + 2),
              (hx0 - 6 - hl, hy + 3 - hl), (hx0 - 6, hy - 7)], 'B')
    line(jk, [(hx0 - 4 + l, hy - 14), (hx0 - 5, hy - 6)], 'C'); line(jk, [(hx0 - 5 - hl, hy + 2 - hl), (hx0 + 5, hy + 2)], 'A')
    rim(jk, 'O'); im.alpha_composite(jk)
    line(im, [(hx0 + 4 + l, hy - 14), (hx0 + 5 + l, hy - 9)], 'D'); line(im, [(hx0 - 3, hy - 1), (hx0 + 2, hy)], 'D')
    # near arm, hand in the pocket
    sw = R(1.4 * math.sin(2 * math.pi * p)) * (-1 if back else 1)
    S, E, P = (hx0 - 1 + l, hy - 13), (hx0 - 4 + sw, hy - 5), (hx0 + 4, hy - 1)
    arm = new(); line(arm, [S, E], 'B', 4); line(arm, [E, P], 'B', 3)
    line(arm, [(S[0] - 1, S[1] + 1), (E[0] - 1, E[1])], 'C'); rim(arm, 'O'); im.alpha_composite(arm)
    line(im, [(S[0] + 1, S[1] + 2), (E[0] + 1, E[1] - 1)], 'D')
    # collar + head
    ox, oy = hx0 + 2 + l, hy - 22
    col = new(); poly(col, [(ox - 5, oy + 8), (ox - 5, oy + 15), (ox + 6, oy + 15), (ox + 6, oy + 9), (ox + 3, oy + 10)], 'B')
    rim(col, 'O'); im.alpha_composite(col); line(im, [(ox - 3, oy + 11), (ox + 4, oy + 12)], 'D')
    P2 = lambda pts: [(ox + x, oy + y) for x, y in pts]
    fc = new(); poly(fc, P2([(-5, -3), (3, -4), (5, -1), (6, 2), (5, 3), (5, 5), (4, 7), (0, 8), (-4, 5), (-5, 0)]), 'S')
    poly(fc, P2([(-4, 3), (0, 8), (4, 7), (4, 6), (0, 6)]), 'U'); rim(fc, 'V'); im.alpha_composite(fc)
    line(im, P2([(4, 5), (5, 5)]), 'V'); put(im, ox + 6, oy + 2, 'T'); line(im, P2([(-2, 1), (-2, 3)]), 'U')
    f = i % 2
    tail = new(); poly(tail, P2([(-6, -1), (-11, 1 + f), (-12, 3 + f), (-9, 3), (-6, 1)]), 'X'); im.alpha_composite(tail)
    bd = new(); poly(bd, P2([(-6, -2), (5, -2), (6, -1), (6, 0), (-6, 0)]), 'X'); line(bd, P2([(-3, -1), (3, -1)]), 'Y')
    im.alpha_composite(bd)
    hr = new(); poly(hr, P2(hair_pts(wind)), 'H')
    for y in range(N):
        for x in range(N):
            if hr.getpixel((x, y))[3] and y > oy - 4: hr.putpixel((x, y), hx('I' if (x + y) % 2 else 'H'))
    line(hr, P2([(1, -5), (2, -9)]), 'I'); line(hr, P2([(-3, -5), (-3, -10)]), 'I'); put(hr, ox + 3, oy - 10, 'W'); put(hr, ox - 1, oy - 11, 'W')
    rim(hr, 'M'); im.alpha_composite(hr)
    return im

def rows(im, x0, w):
    return [''.join('.' if im.getpixel((x, y))[3] == 0 else next(k for k in PAL if hx(k) == im.getpixel((x, y))[:3] + (255,))
                    for x in range(x0, x0 + w)) for y in range(N)]

def align(im):                       # put the lowest pixel (shoe outline) on row 62, same as the idle sprite
    a = im.split()[3].load()
    low = max(y for y in range(N) for x in range(N) if a[x, y])
    out = new(); out.paste(im, (0, 62 - low)); return out

sets = {'fwd': [align(frame(i, False)) for i in range(6)], 'back': [align(frame(i, True)) for i in range(6)]}
xs = [x for fs in sets.values() for f in fs for y in range(N) for x in range(N) if f.getpixel((x, y))[3]]
ys = [y for fs in sets.values() for f in fs for y in range(N) for x in range(N) if f.getpixel((x, y))[3]]
x0, x1 = min(xs) - 1, max(xs) + 1
print('bbox cols', min(xs), max(xs), 'rows', min(ys), max(ys))
json.dump({k: {'x0': x0, 'w': x1 - x0 + 1, 'h': N, 'cx': 32, 'frames': [rows(f, x0, x1 - x0 + 1) for f in fs]} for k, fs in sets.items()}, open('walk.json', 'w'))
sc = 3; W = x1 - x0 + 1
sheet = Image.new('RGBA', (6 * (W * sc + 4), 2 * (N * sc + 4)), (110, 110, 128, 255))
for r, k in enumerate(('fwd', 'back')):
    for i, f in enumerate(sets[k]):
        bg = Image.new('RGBA', (N, N), (110, 110, 128, 255)); bg.alpha_composite(f)
        sheet.paste(bg.crop((x0, 0, x1 + 1, N)).resize((W * sc, N * sc), Image.NEAREST), (i * (W * sc + 4), r * (N * sc + 4)))
sheet.save('walk_sheet.png'); print('sheet', sheet.size)
