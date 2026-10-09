#!/usr/bin/env python3
"""Gojo idle: hands in pockets, 6 wind frames. Writes frames.json + sheet.png"""
import sys, os, copy, json
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import gojo, tools
from collections import deque

N = 64
base = copy.deepcopy(gojo.grid)

# ---- 1. hands in pockets: drop the raised arm, mirror the pocket arm onto the left side
for r in range(7, 35):
    for c in range(20, 26):
        base[r][c] = '.'
for r in range(14, 35):
    for c in range(36 if r < 26 else 35, 42):
        ch = base[r][c]
        if ch == '.':
            continue
        if c >= 37 and ch in 'AC':          # outer edge: lit on the left, shaded on the right
            ch = 'C' if ch == 'A' else 'A'
        base[r][61 - c] = ch


def flare_right(g, r, dx):
    """push the right silhouette edge of row r out by dx pixels (cloth billowing)"""
    c = max(cc for cc in range(N) if g[r][cc] != '.')
    if g[r][c] != 'O':
        return
    for k in range(dx):
        g[r][c + k] = 'A'
    g[r][c + dx] = 'O'


# ---- 2. per-frame wind parameters (gust cycle, wind blows to the right)
LEAN = [0.0, 0.2, 0.4, 0.5, 0.35, 0.15]      # hair lean
HEM = [(0, 0, 0), (0, 1, 1), (1, 1, 2), (1, 2, 2), (1, 1, 1), (0, 0, 1)]   # jacket hem rows 32..34
CUFF = [0, 0, 1, 1, 1, 0]                    # trouser / elbow billow
BOB = [0, 0, 0, 1, 1, 0]                     # body drops 1px at the gust peak
CHEST_DY = [0, 0, 1, 1, 0, 0]                # sheen ripple on the chest
HEM_DX = [0, 1, 1, 0, -1, -1]                # sheen ripple on the hem


def hair_pixels():
    return gojo.make_hair(
        top={27: 4, 28: 2, 29: 4, 30: 2, 31: 3, 32: 1, 33: 2, 34: 4},
        extra=[(26, 5), (35, 5)],
        strands=[((31, 4), 'I'), ((29, 5), 'I'), ((33, 5), 'I'), ((30, 5), 'I')],
        hi=[((30, 3), 'W'), ((32, 3), 'W'), ((32, 4), 'W'), ((28, 4), 'W')],
        bangs=[((27, 7), 'M'), ((28, 7), 'J'), ((30, 7), 'J'), ((33, 7), 'J')])


CHEST = [s for s in gojo.STROKES if 19 <= s[1] <= 28 and 26 <= s[0] <= 36]
HEMS = [s for s in gojo.STROKES if s[1] == 32]


def make_frame(k):
    g = copy.deepcopy(base)
    # sheen ripple: lift the strokes, repaint them one pixel along
    for grp, dx, dy in ((CHEST, 0, CHEST_DY[k]), (HEMS, HEM_DX[k], 0)):
        for c, r, ch in grp:
            if g[r][c] == ch:
                g[r][c] = 'B'
        for c, r, ch in grp:
            if g[r + dy][c + dx] in 'BCA':
                g[r + dy][c + dx] = ch
    # cloth billow
    for r, dx in zip((32, 33, 34), HEM[k]):
        if dx:
            flare_right(g, r, dx)
    if CUFF[k]:
        for r in (24, 25, 38, 39, 40):
            flare_right(g, r, 1)
    # hair: lean with the wind (shear rows by height), keep the blindfold band
    for r in range(0, 7):
        for c in range(20, 46):
            g[r][c] = '.'
    for c in range(26, 37):
        g[7][c] = '.'
    for c in range(28, 35):
        g[7][c] = 'X'
    lean = LEAN[k]
    shear = lambda r: int(lean * (6 - r) + 0.5) if r <= 6 else int(lean * 3 + 0.5)
    placed = {}
    for (c, r), ch in hair_pixels().items():
        placed[(c + shear(r), r)] = ch
    for (c, r), ch in placed.items():
        g[r][c] = ch
    for (c, r), ch in placed.items():          # re-outline pixels the shear exposed
        if r <= 6 and ch != 'M':
            if any(g[r + dr][c + dc] == '.' for dc, dr in ((1, 0), (-1, 0), (0, -1), (0, 1))):
                g[r][c] = 'M'
    # breathing: upper body drops one pixel
    if BOB[k]:
        for r in range(34, 0, -1):
            g[r + 1] = g[r][:]
        g[1] = ['.'] * N
    return g


def pieces(g):
    cells = {(c, r) for r in range(N) for c in range(N) if g[r][c] != '.'}
    seen, n = set(), 0
    for p in cells:
        if p in seen:
            continue
        n += 1
        q = deque([p]); seen.add(p)
        while q:
            c, r = q.popleft()
            for dc in (-1, 0, 1):
                for dr in (-1, 0, 1):
                    m = (c + dc, r + dr)
                    if m in cells and m not in seen:
                        seen.add(m); q.append(m)
    return n, cells


X0, X1 = 16, 47                                # crop window (32 columns)
frames = [make_frame(k) for k in range(6)]
for k, g in enumerate(frames):
    n, cells = pieces(g)
    cs = [c for c, r in cells]; rs = [r for c, r in cells]
    ok = X0 <= min(cs) and max(cs) <= X1
    print(f"frame {k}: pieces={n} cols {min(cs)}-{max(cs)} rows {min(rs)}-{max(rs)} in-crop={ok} px={len(cells)}")

json.dump({'x0': X0, 'w': X1 - X0 + 1, 'h': N, 'pal': {k: v for k, v in gojo.PAL.items()},
           'frames': [[''.join(g[r][X0:X1 + 1]) for r in range(N)] for g in frames]},
          open('frames.json', 'w'))

# contact sheet for review
from PIL import Image
sc, gap = 5, 6
sheet = Image.new('RGB', (6 * (32 * sc + gap), 64 * sc), (110, 110, 128))
for k, g in enumerate(frames):
    sheet.paste(tools.render(g, gojo.PAL, sc, bg=(110, 110, 128), box=(X0, 0, X1 + 1, 64)), (k * (32 * sc + gap), 0))
sheet.save('sheet.png')
print('sheet', sheet.size)
