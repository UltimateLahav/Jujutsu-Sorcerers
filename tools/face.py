#!/usr/bin/env python3
"""Gojo close-up, blindfold lifted halfway, one glowing eye. 64x64 pixel art -> face_art.png"""
import math
from PIL import Image, ImageDraw

N = 64
def hx(h, a=255):
    h = h.lstrip('#'); return tuple(int(h[i:i + 2], 16) for i in (0, 2, 4)) + (a,)

COL = dict(O='#0f0b14', A='#17121c', B='#2a2230', C='#3b3050', D='#6d56a0', E='#8f7ac4',
           H='#f4f2f8', I='#dcd6e8', J='#c5bbdc', K='#9a8cc0', M='#b3a9d9', W='#ffffff',
           S='#eec7b4', T='#fbe3d4', U='#d1a08f', V='#a06d68', X='#0e0b12', Y='#2f2744', Z='#4a3d70')
GLOW = (90, 180, 255)

def new(): return Image.new('RGBA', (N, N), (0, 0, 0, 0))
def poly(img, pts, c): ImageDraw.Draw(img).polygon(pts, fill=hx(COL[c]))
def put(img, x, y, c):
    if 0 <= x < N and 0 <= y < N: img.putpixel((x, y), hx(COL[c]) if c in COL else hx(c))
def line(img, pts, c): ImageDraw.Draw(img).line(pts, fill=hx(COL[c]), width=1)

def rim(layer, c, skip_below=False):
    """1px outline (4-neighbour) around a layer's silhouette, drawn on the layer"""
    a = layer.split()[3]; px = a.load(); out = []
    for y in range(N):
        for x in range(N):
            if px[x, y] == 0:
                for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                    nx, ny = x + dx, y + dy
                    if 0 <= nx < N and 0 <= ny < N and px[nx, ny] > 0:
                        out.append((x, y)); break
    for x, y in out: put(layer, x, y, c)

img = new()

# ---- jacket + tall collar
jk = new()
poly(jk, [(4, 63), (8, 55), (15, 49), (24, 51), (32, 55), (40, 51), (49, 49), (56, 55), (60, 63)], 'B')
poly(jk, [(14, 52), (16, 41), (21, 43), (24, 52)], 'B'); poly(jk, [(40, 52), (43, 43), (48, 41), (50, 52)], 'B')
rim(jk, 'O')
for (x0, y0, x1, y1) in ((16, 44, 22, 47), (42, 46, 47, 43), (9, 58, 20, 53), (44, 53, 55, 58)):
    line(jk, [(x0, y0), (x1, y1)], 'D')
line(jk, [(32, 56), (32, 63)], 'A'); line(jk, [(30, 57), (24, 63)], 'D')
img.alpha_composite(jk)

# ---- face (skin) with light from the left
fc = new()
poly(fc, [(18, 22), (24, 19), (41, 19), (47, 23), (48, 33), (46, 43), (42, 50), (37, 54), (28, 54), (23, 49), (19, 41), (17, 31)], 'S')
poly(fc, [(43, 24), (48, 25), (48, 33), (46, 43), (42, 50), (39, 52), (43, 44)], 'U')          # shaded right side
poly(fc, [(20, 36), (25, 36), (24, 44), (21, 42)], 'T')                                         # lit cheek
poly(fc, [(26, 51), (38, 51), (36, 54), (28, 54)], 'U')                                         # under the chin
poly(fc, [(47, 33), (51, 36), (51, 42), (47, 43)], 'S'); line(fc, [(50, 37), (50, 41)], 'U')    # ear
rim(fc, 'V')
img.alpha_composite(fc)
for p in ((32, 41), (33, 42), (34, 43), (32, 43), (35, 42)): put(img, *p, 'U')                  # nose
put(img, 32, 44, 'V'); put(img, 34, 44, 'V')
line(img, [(29, 48), (35, 48)], 'V'); put(img, 36, 47, 'V'); put(img, 37, 46, 'V')              # smirk
line(img, [(30, 49), (34, 49)], 'U')

# ---- blindfold: right half still on, left half pulled up (fold at x~31..35)
bd = new()
poly(bd, [(12, 19), (24, 20), (36, 24), (51, 27), (54, 30), (53, 38), (36, 37), (31, 31), (23, 28), (13, 28), (10, 24)], 'X')
line(bd, [(31, 32), (35, 38)], 'Y'); line(bd, [(32, 31), (36, 37)], 'Z')                         # fold crease
line(bd, [(13, 26), (22, 27)], 'Y'); line(bd, [(37, 27), (52, 29)], 'Y'); line(bd, [(40, 36), (52, 37)], 'Y')
img.alpha_composite(bd)

# ---- hair (main mass, then bangs hanging over the band)
hr = new()
poly(hr, [(11, 35), (9, 28), (10, 22), (7, 16), (12, 17), (11, 9), (17, 13), (17, 4), (23, 11), (26, 2), (30, 10),
          (34, 1), (38, 10), (43, 3), (45, 11), (51, 6), (50, 14), (57, 13), (53, 20), (57, 27), (53, 29), (54, 36),
          (50, 30), (47, 22), (44, 19), (36, 21), (28, 20), (20, 20), (16, 24), (14, 31)], 'H')
for t in ([(19, 20), (21, 27), (25, 21)], [(29, 21), (32, 29), (35, 22)], [(40, 21), (44, 28), (47, 22)]):
    poly(hr, t, 'H')
hp = hr.load()
for y in range(N):                                          # lavender shading toward the band, light strands
    for x in range(N):
        if hp[x, y][3]:
            if y >= 26: hr.putpixel((x, y), hx(COL['J']))
            elif y == 25: hr.putpixel((x, y), hx(COL['J' if x % 2 else 'I']))
            elif y >= 19: hr.putpixel((x, y), hx(COL['I']))
            elif y == 18: hr.putpixel((x, y), hx(COL['I' if x % 2 else 'H']))
for pts in ([(30, 19), (30, 11)], [(22, 19), (23, 12)], [(38, 19), (38, 11)], [(45, 18), (46, 12)], [(16, 22), (17, 15)], [(34, 14), (34, 6)], [(27, 14), (26, 6)]):
    line(hr, pts, 'I')
for p in ((25, 5), (33, 4), (42, 6), (14, 12), (30, 13), (48, 10)): put(hr, *p, 'W')
rim(hr, 'M')
img.alpha_composite(hr)

# ---- hand in front: thumb + index finger pinch the band's corner and lift it
hd = new()
poly(hd, [(0, 58), (0, 38), (5, 35), (10, 37), (9, 42), (11, 52), (7, 60)], 'S')            # back of the hand
poly(hd, [(4, 36), (8, 33), (15, 27), (17, 29), (11, 37), (6, 39)], 'S')                     # index finger
poly(hd, [(3, 44), (6, 40), (13, 31), (16, 32), (10, 42), (6, 47)], 'T')                     # thumb
line(hd, [(7, 36), (15, 29)], 'U'); line(hd, [(8, 41), (14, 33)], 'U'); line(hd, [(9, 44), (10, 52)], 'U')
poly(hd, [(17, 27), (20, 28), (17, 31)], 'X')                                                # pinched cloth between the tips
rim(hd, 'V')
img.alpha_composite(hd)

# ---- blink frames: 0 open, 1 starting to close (25%), 2 half, 3 three-quarters, 4 fully closed
base = img.copy()
CX, CY = 26.5, 33.5
YE = [30, 32, 34, 36, 37]                   # row where the upper lid edge (lashes) sits
OPEN = [1.0, 0.75, 0.5, 0.25, 0.0]          # how much of the eye (and its glow) is left

def eye_frame(lid):
    im = base.copy(); ye = YE[lid]; op = OPEN[lid]
    for y in range(N):                                         # stepped glow, fades as the lid drops
        for x in range(N):
            d = math.hypot(x + .5 - CX, (y + .5 - CY) / 0.9)
            k = (max(0.0, 1 - d / 8.0) ** 1.3 * 0.9 + max(0.0, 1 - d / 17.0) ** 2 * 0.35) * (0.1 + 0.9 * op)
            lv = round(k * 6) / 6
            if lv > 0:
                r, g, b, a = im.getpixel((x, y))
                if a: im.putpixel((x, y), tuple(min(255, int(c + gc * lv * 0.85)) for c, gc in zip((r, g, b), (60, 150, 255))) + (255,))
                else: im.putpixel((x, y), GLOW + (int(210 * lv),))
    ex, ey, rx, ry = 26.5, 33.5, 6.6, 3.7
    for y in range(28, 39):
        for x in range(18, 36):
            nx, ny = (x + .5 - ex) / rx, (y + .5 - ey) / ry
            if nx * nx + ny * ny <= 1:
                if y < ye or lid == 4:
                    put(im, x, y, 'U' if y <= 31 else 'S')       # eyelid skin
                else:
                    d = math.hypot(x + .5 - ex, y + .5 - ey)
                    c = ('#0a2a6a' if d < 1.1 else '#c8f2ff' if d < 2.2 else '#59b8ff' if d < 3.0 else '#2060d8' if d < 3.7 else '#eaf2ff')
                    put(im, x, y, c)
    if lid < 4:
        for x in range(21, 33): put(im, x, ye, 'H')                      # thick white lashes on the lid edge
        for x in range(20, 34): put(im, x, ye - 1, 'M')
        for dx, dy in ((19, 0), (18, 1), (34, 0), (35, 1), (20, -2), (33, -2), (22, -2), (31, -2)): put(im, dx, ye + dy, 'M')
        for x in range(22, 32): put(im, x, 37, 'U') if ye < 37 else None
        if ye <= 32: put(im, 25, 32, 'W'); put(im, 26, 32, 'W'); put(im, 25, 33, 'W')
    else:                                                                # fully closed: lash line along the bottom of the eye
        for x in range(21, 33): put(im, x, 37, 'H')
        for x in range(22, 32): put(im, x, 38, 'M')
        for p in ((20, 36), (33, 36), (19, 35), (34, 35)): put(im, *p, 'M')
    if op >= 0.5:                                                        # light streak + sparkle only while the eye is open
        for x in range(10, 44):
            a = int(170 * max(0, 1 - abs(x - CX) / 17) * op)
            if a > 12:
                r = im.getpixel((x, 34)); f = a / 255
                im.putpixel((x, 34), tuple(int(r[i] * (1 - f) + (200, 235, 255)[i] * f) for i in range(3)) + (max(r[3], a),))
        for dx, dy in ((0, 0), (1, 0), (-1, 0), (2, 0), (-2, 0), (0, 1), (0, -1), (0, 2), (0, -2)): put(im, 22 + dx, 29 + dy, 'W')
    return im

frames = [eye_frame(i) for i in range(5)]
for i, f in enumerate(frames): f.save(f'face_art_{i}.png')
frames[0].save('face_art.png')
sheet = Image.new('RGBA', (5 * 64 * 3 + 40, 64 * 3), hx('#140c26'))
for i, f in enumerate(frames):
    bg = Image.new('RGBA', (N, N), hx('#140c26')); bg.alpha_composite(f)
    sheet.paste(bg.resize((192, 192), Image.NEAREST), (i * 202, 0))
sheet.save('face_blink_sheet.png')
bg = Image.new('RGBA', (N, N), hx('#140c26')); bg.alpha_composite(frames[0]); bg.resize((512, 512), Image.NEAREST).save('face_preview.png')
print('blink frames ok')
