"""CURSED ENERGY: a 15-frame, deliberately unstable flame that is drawn over his hands.
Electric cyan like the reference picture: a glassy bright rim, a ragged black outline, black cracks, soot and sparks.
Standalone (no dependency on side.py): ce_frames() -> 15 frames, each a list of row strings of palette letters '1'..'7' ('.' = transparent).
Every frame is a new random shape (the silhouette, the tendrils and the cracks all change from frame to frame), with a few surge frames and a few dim
frames mixed in, so it flickers instead of pulsing smoothly."""
import math, random

CE_PAL = {'1': '#010708', '2': '#155e60', '3': '#188585', '4': '#1eb4b4', '5': '#28f6f5', '6': '#8bfffa', '7': '#e6ffff'}      # black, then deep teal -> bright cyan -> white-cyan
CE_N, CEW, CEH, CECX, CECY = 15, 42, 52, 21, 36                     # frames in the loop, frame size, and where the hand sits in it (flames rise, so there is more room above)
SURGE = [0, 0, 1, 0, 0, 2, 0, 0, 1, 0, 2, 0, 0, 1, 0]               # frames where the flare jumps out (1 = bigger, 2 = much bigger)
DIM = [0, 1, 0, 0, 2, 0, 0, 1, 0, 0, 1, 0, 2, 0, 0]                 # frames where the energy dips (0 = normal)
MODE = 'TWCTTCWTCWTTCWT'                                           # the character of each frame: T = a tall flame, W = lashing sideways, C = a compact lump with sparks

def hashf(ix, iy, seed):
    n = (ix * 374761393 + iy * 668265263 + seed * 1442695041) & 0xffffffff
    n = ((n ^ (n >> 13)) * 1274126177) & 0xffffffff
    n ^= n >> 16
    return (n & 0xffff) / 65536.0
def vnoise(x, y, seed):
    ix, iy = math.floor(x), math.floor(y); fx, fy = x - ix, y - iy
    u = fx * fx * (3 - 2 * fx); v = fy * fy * (3 - 2 * fy)
    a, b, c, d = hashf(ix, iy, seed), hashf(ix + 1, iy, seed), hashf(ix, iy + 1, seed), hashf(ix + 1, iy + 1, seed)
    return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v
def fbm(x, y, seed, octs=3):
    s = tot = 0; amp = .5; f = 1
    for o in range(octs): s += amp * vnoise(x * f, y * f, seed + o * 17); tot += amp; amp *= .5; f *= 2.03
    return s / tot

N4 = ((1, 0), (-1, 0), (0, 1), (0, -1))

def ce_frame(i):
    rg = random.Random(4000 + 131 * i)
    ph = 2 * math.pi * i / CE_N; surge, dim = SURGE[i], DIM[i]
    R0 = 6.6 + 1.2 * surge + .8 * math.sin(2 * ph + 1.3) + rg.uniform(-.4, .4)
    blobs = [(CECX, CECY, R0)]                                                  # the body: one big lump on the hand and four more that boil round it (they turn a little every frame, plus a random nudge)
    for k in range(4):
        a = k * math.pi / 2 + ph * 1.6 + rg.uniform(-.5, .5); d = 3.4 + 1.3 * math.sin(3 * ph + k * 1.7) + rg.uniform(-.6, .6)
        blobs.append((CECX + math.cos(a) * d, CECY + math.sin(a) * d * .85, 4.1 + 1.0 * math.sin(2 * ph + k) + rg.uniform(-.4, .4)))
    def flame(a0, length, base, sway, ph0):                                      # a curling tongue of flame: a chain of discs that narrows to a point and snakes from side to side
        pts = []; n = 14
        for k in range(n + 1):
            t = k / n; off = sway * math.sin(2.2 * math.pi * t + ph0) * t
            pts.append((CECX + math.cos(a0) * length * t - math.sin(a0) * off, CECY + math.sin(a0) * length * t * .95 + math.cos(a0) * off, max(.5, base * (1 - t) ** .8)))
        return pts
    mode = MODE[i]
    if mode == 'T':
        blobs += flame(-math.pi / 2 + rg.uniform(-.45, .45), 14.5 + 3.0 * surge + rg.uniform(-1.5, 2.5), 5.0, rg.uniform(-4.2, 4.2), rg.uniform(0, 6.28))
        blobs += flame(-math.pi / 2 + rg.choice((-1, 1)) * rg.uniform(.7, 1.2), rg.uniform(6, 9), 3.0, rg.uniform(-2, 2), rg.uniform(0, 6.28))
    elif mode == 'W':
        a1 = -math.pi / 2 + rg.choice((-1, 1)) * rg.uniform(.75, 1.25)
        blobs += flame(a1, 12.5 + 2.0 * surge + rg.uniform(-1.5, 2), 4.6, rg.uniform(-3.5, 3.5), rg.uniform(0, 6.28))
        blobs += flame(-math.pi / 2 - (a1 + math.pi / 2) * rg.uniform(.6, 1.0), rg.uniform(8, 12), 3.6, rg.uniform(-3, 3), rg.uniform(0, 6.28))
        blobs += flame(-math.pi / 2 + rg.uniform(-.4, .4), rg.uniform(7, 10) + surge * 2, 3.2, rg.uniform(-2, 2), rg.uniform(0, 6.28))
    else:
        blobs += flame(-math.pi / 2 + rg.uniform(-.7, .7), rg.uniform(7, 10) + surge * 2, 3.8, rg.uniform(-2.5, 2.5), rg.uniform(0, 6.28))
    if rg.random() < .5: blobs += flame(math.pi / 2 + rg.uniform(-.9, .9), rg.uniform(4.5, 7.0), 3.0, rg.uniform(-1.5, 1.5), rg.uniform(0, 6.28))          # sometimes a lick below
    inside = set()
    for y in range(CEH):
        for x in range(CEW):
            px_, py_ = x + .5, y + .5
            f = min(math.hypot(px_ - bx, py_ - by) - br for bx, by, br in blobs)
            f -= (fbm(px_ * .2 + 2.5 * math.cos(ph) + 11, py_ * .2 + 2.5 * math.sin(ph) + 11, 61 + i, 2) - .5) * 2.6 + (hashf(x, y, 7 + i) - .5) * .7       # a wobbling, unstable edge
            if f <= 0: inside.add((x, y))
    depth = {}; layer = {p for p in inside if any((p[0] + dx, p[1] + dy) not in inside for dx, dy in N4)}; d = 0
    while layer:                                                                # how many pixels in from the edge each pixel is
        for p in layer: depth[p] = d
        d += 1; layer = {(p[0] + dx, p[1] + dy) for p in layer for dx, dy in N4} & (inside - set(depth))
    g = [['.'] * CEW for _ in range(CEH)]
    def put(x, y, c):
        if 0 <= x < CEW and 0 <= y < CEH: g[y][x] = c
    for (x, y), dp in depth.items():
        ang = math.atan2(y + .5 - CECY, x + .5 - CECX); sector = int(math.floor(ang / (math.pi / 6)))
        if dp == 0: c = '1' if hashf(x, y, 31 + i) < .9 else '5'                 # ragged black outline
        elif dp == 1: c = '5' if (dim < 2 and hashf(x, y, 53 + i) < .9) else '4'   # the bright glassy band, two pixels wide (it dims on the dim frames)
        elif dp == 2: c = '5' if (dim == 0 and hashf(x, y, 17 + i) < .55) else '4'
        elif dp == 3: c = '1' if hashf(sector, i, 5) < .33 else '4' if hashf(x, y, 19 + i) < .5 else '3'      # a broken black line inside the band, like the reference's glassy double outline
        else:
            lit = (CECY - y) / 18.0 + (CECX - x) / 40.0                         # lighter towards the tip and the back, darker deep inside
            c = '4' if (dp == 4 and hashf(x, y, 23 + i) < .45 - dim * .15) else '3' if (dp < 7 or hashf(x, y, 29 + i) < .5 + lit * .4) else '2'
        put(x, y, c)
    for (x, y), dp in depth.items():                                              # glassy highlights on the upper-left of the rim
        if 1 <= dp <= 2 and (x < CECX + 3 and y < CECY - 1) and hashf(x, y, 44 + i) < .25 and dim < 2: put(x, y, '6')
    for yy in range(-3, 4):                                                       # the fist shows through the middle
        for xx in range(-3, 4):
            if xx * xx + yy * yy <= 6 and (CECX + xx, CECY + yy) in depth and depth[(CECX + xx, CECY + yy)] >= 3: put(CECX + xx, CECY + yy, '.')
    rimcells = [p for p, dp in depth.items() if dp == 0]
    for _ in range(rg.choice((2, 3, 3))):                                         # black cracks running in from the rim
        x, y = rg.choice(rimcells); a = math.atan2(CECY - y, CECX - x) + rg.uniform(-.7, .7)
        for _ in range(rg.randint(4, 9)):
            if (round(x), round(y)) in depth and depth[(round(x), round(y))] >= 1: put(round(x), round(y), '1')
            a += rg.uniform(-.8, .8); x += math.cos(a) * 1.1; y += math.sin(a) * 1.1
    for _ in range(rg.randint(3, 5)):                                             # a few thicker spots in the outline
        x, y = rg.choice(rimcells)
        for dx, dy in rg.sample(N4, 2):
            if (x + dx, y + dy) in depth and depth[(x + dx, y + dy)] == 1: put(x + dx, y + dy, '1')
    for _ in range(rg.randint(3, 5) + (4 if mode == 'C' else 0)):                    # soot flecks and sparks outside the flame (more of them on the compact frames)
        a = -math.pi / 2 + rg.uniform(-1.4, 1.4); dd = R0 + rg.uniform(6.0, 16.0); x, y = math.floor(CECX + math.cos(a) * dd), math.floor(CECY + math.sin(a) * dd * .9)
        if (x, y) not in inside and (x, y + 1) not in inside: put(x, y, rg.choice('566777') if rg.random() < .7 else '1')
    for _ in range(rg.randint(1, 2)):                                             # a rising streak
        a = -math.pi / 2 + rg.uniform(-.8, .8); dd = R0 + rg.uniform(8, 14); x, y = math.floor(CECX + math.cos(a) * dd), math.floor(CECY + math.sin(a) * dd * .9)
        for k in range(rg.choice((2, 3))):
            if (x, y - k) not in inside: put(x, y - k, '6' if k == 0 else '5')
    return [''.join(r) for r in g]

def ce_frames(): return [ce_frame(i) for i in range(CE_N)]

if __name__ == '__main__':
    from PIL import Image, ImageDraw
    fr = ce_frames(); sc = 5
    pal = {k: tuple(int(v[j:j + 2], 16) for j in (1, 3, 5)) for k, v in CE_PAL.items()}
    sheet = Image.new('RGB', (5 * (CEW * sc + 4), 3 * (CEH * sc + 4)), (14, 26, 32)); px = sheet.load()
    for n, rows in enumerate(fr):
        ox, oy = (n % 5) * (CEW * sc + 4), (n // 5) * (CEH * sc + 4)
        for y, r in enumerate(rows):
            for x, c in enumerate(r):
                if c != '.':
                    for dy in range(sc):
                        for dx in range(sc): px[ox + x * sc + dx, oy + y * sc + dy] = pal[c]
        ImageDraw.Draw(sheet).rectangle([ox + (CECX - 1) * sc, oy + (CECY - 1) * sc, ox + (CECX + 1) * sc, oy + (CECY + 1) * sc], outline=(255, 60, 60))      # the anchor (where the hand is)
    sheet.save('ce_sheet.png'); print('ce sheet', sheet.size, 'frames', len(fr), 'size', CEW, 'x', CEH)
