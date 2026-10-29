# python3 hand_art.py -> hand_open.png, hand_shut.png (embedded in tools/chap2c.js as T6H). Thanos' bare hand seen from the side, pointing left, in two poses: pinch OPEN (the stone floats between thumb and finger) and pinch SHUT (the tips meet at the stone). 64 x 64, his skin colours.
import numpy as np, sys, os
from PIL import Image
W = H = 64
yy, xx = np.mgrid[0:H, 0:W].astype(float)
SP = os.path.dirname(os.path.abspath(__file__)) + '/'

def build(pose):
    parts = []      # dict(depth, m, z, gx, gy, tag)
    def dome(cx, cy, rx, ry, depth, tag, h=1.0):
        d2 = ((xx - cx) / rx) ** 2 + ((yy - cy) / ry) ** 2; m = d2 < 1
        z = h * np.sqrt(np.clip(1 - d2, 0, 1)) * min(rx, ry)
        parts.append(dict(depth=depth, m=m, z=z, gx=np.gradient(z, axis=1), gy=np.gradient(z, axis=0), tag=tag))
    def chain(pts, rs, depth, tag):
        # pts: joints (x, y); rs: radius at every joint; dense domes along each segment
        for i in range(len(pts) - 1):
            (x0, y0), (x1, y1) = pts[i], pts[i + 1]; n = int(max(abs(x1 - x0), abs(y1 - y0)) * 1.4) + 2
            for k in range(n + 1):
                t = k / n; r = rs[i] + (rs[i + 1] - rs[i]) * t; dome(x0 + (x1 - x0) * t, y0 + (y1 - y0) * t, r, r, depth + 0.00005 * (len(parts)), tag)
    # the arm: a band that runs off the right edge of the picture; the wrist is narrower than the palm
    chain([(78, 43), (60, 41.5)], [8.5, 7.0], 0.20, 'arm')
    chain([(60, 41.5), (52, 40.5)], [7.0, 6.2], 0.22, 'arm')
    dome(46, 39, 11, 7.5, 0.30, 'palm')                 # the back of the hand
    dome(39, 35.5, 6.5, 4.8, 0.34, 'knuck')             # the knuckles
    dome(45, 45.5, 8, 4.2, 0.36, 'thenar')              # the muscle at the base of the thumb
    # the three curled fingers (behind the index): knuckle humps, then the fingers folded down and back in under the palm
    for (cx, cy, d) in [(35.5, 40.5, 0.28), (39.5, 42.5, 0.27), (43.5, 43.5, 0.26)]:
        chain([(cx + 2, cy - 4), (cx - 1, cy), (cx - 2.5, cy + 5.5), (cx + 1.5, cy + 8.5)], [3.3, 3.2, 2.9, 2.4], d, 'curl')
    if pose == 'open':
        idx = [(37, 33.5), (30, 31.8), (24, 31.3), (19.5, 33.2)]; th = [(43, 46), (36, 48.2), (29.5, 48.2), (24.5, 46)]
    else:
        idx = [(37, 33.5), (30, 33.2), (24, 35), (20, 38.5)]; th = [(43, 46), (36, 47.6), (29.5, 47.2), (24.5, 44.8)]
    chain(idx, [3.6, 3.2, 2.8, 2.3], 0.45, 'index')
    chain(th, [4.2, 3.6, 3.1, 2.5], 0.50, 'thumb')
    depth = np.full((H, W), -1.0); pid = np.full((H, W), -1, dtype=int)
    for i, p in enumerate(parts):
        b = p['m'] & (p['depth'] >= depth); depth[b] = p['depth']; pid[b] = i
    body = pid >= 0
    gx = np.zeros((H, W)); gy = np.zeros((H, W)); tag = np.full((H, W), '', dtype=object); zz = np.zeros((H, W))
    for i, p in enumerate(parts):
        s = pid == i; gx[s] = p['gx'][s]; gy[s] = p['gy'][s]; tag[s] = p['tag']; zz[s] = p['z'][s]
    L = np.array([-0.5, -0.75, 0.6]); L /= np.linalg.norm(L)
    nx, ny, nz = -gx * 0.9, -gy * 0.9, np.ones((H, W)); nn = np.sqrt(nx * nx + ny * ny + nz * nz); nx, ny, nz = nx / nn, ny / nn, nz / nn
    I = 0.2 + 0.8 * np.clip(nx * L[0] + ny * L[1] + nz * L[2], 0, 1)
    def nb(a, dx, dy): return np.roll(np.roll(a, dy, axis=0), dx, axis=1)
    occl = np.zeros((H, W))
    for dx, dy in [(1, 0), (-1, 0), (0, 1), (0, -1)]:
        occl = np.where(body & (nb(pid, dx, dy) >= 0) & (nb(pid, dx, dy) != pid) & (nb(depth, dx, dy) > depth + 0.04), 1.0, occl)
    I = np.where(occl > 0, I * 0.6, I)
    # knuckle creases on the fingers: a darker line at every joint
    pal = [(46, 36, 84), (77, 63, 120), (96, 80, 142), (115, 96, 164), (140, 120, 186), (154, 134, 198), (198, 180, 232)]
    q = np.clip((I * len(pal)).astype(int), 0, len(pal) - 1)
    img = np.zeros((H, W, 4), dtype=np.uint8)
    for k, c in enumerate(pal):
        s = body & (q == k); img[s, :3] = c; img[s, 3] = 255
    OUT = (12, 9, 22)
    edge = body & ~(nb(body, 1, 0) & nb(body, -1, 0) & nb(body, 0, 1) & nb(body, 0, -1))
    img[edge, :3] = OUT
    for dx, dy in [(1, 0), (-1, 0), (0, 1), (0, -1)]:     # a dark line where a finger lies in front of another part
        front = body & (nb(pid, dx, dy) >= 0) & (nb(pid, dx, dy) != pid) & (nb(depth, dx, dy) > depth + 0.04)
        img[front & ~edge, :3] = (img[front & ~edge, :3] * 0.5).astype(np.uint8)
    tips = [(17, 33), (18, 33), (17, 34)] if pose == 'open' else [(18, 38), (19, 38), (18, 39)]
    for (tx, ty) in tips:
        if body[ty, tx]: img[ty, tx, :3] = (198, 180, 232)
    return img, body

for pose in ('open', 'shut'):
    img, body = build(pose)
    Image.fromarray(img).save(SP + f'hand_{pose}.png')
print('ok')
