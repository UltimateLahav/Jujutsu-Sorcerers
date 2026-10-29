# python3 maho_art.py -> maho_96.png (embedded in tools/chap2c.js as V6_IMG). Mahoraga: a large white being wrapped in tight white cloth (front view), 96 x 124, shaded like a sculpture:
# every part is a dome (ellipsoid) with a depth, the cloth bands are saw-tooth ridges on top of the domes, the light comes from the upper left;
# the result is cut into 8 cool whites and outlined
import numpy as np, os
from PIL import Image
W, H = 96, 124
yy, xx = np.mgrid[0:H, 0:W].astype(float)
rng = np.random.RandomState(7)

parts = []      # (name, depth, mask, z, gx, gy)
def dome(name, cx, cy, rx, ry, depth, h=1.0, rot=0.0):
    c, s = np.cos(rot), np.sin(rot)
    dx = (xx - cx) * c + (yy - cy) * s; dy = -(xx - cx) * s + (yy - cy) * c
    d2 = (dx / rx) ** 2 + (dy / ry) ** 2
    m = d2 < 1
    z = h * np.sqrt(np.clip(1 - d2, 0, 1)) * min(rx, ry)      # a dome as high as the narrower radius
    gx = np.gradient(z, axis=1); gy = np.gradient(z, axis=0)
    parts.append(dict(name=name, depth=depth, m=m, z=z, gx=gx, gy=gy, cx=cx, cy=cy, rx=rx, ry=ry, rot=rot))

def capsule(name, x0, y0, x1, y1, r0, r1, depth):      # a limb: a chain of domes from (x0, y0) to (x1, y1), thick r0 -> r1
    n = int(max(abs(x1 - x0), abs(y1 - y0)) / 1.5) + 2
    for i in range(n):
        t = i / (n - 1); dome(name, x0 + (x1 - x0) * t, y0 + (y1 - y0) * t, r0 + (r1 - r0) * t, r0 + (r1 - r0) * t, depth + 0.0001 * i)

# ---- body, back to front (a tall, lean, heavy-shouldered figure; cut off at the thighs: the mist hides the rest)
dome('legL', 38, 112, 11, 26, 0.1); dome('legR', 58, 112, 11, 26, 0.1)
dome('hips', 48, 95, 19, 11, 0.3)
dome('torso', 48, 66, 17, 30, 0.35)
dome('abs', 48, 76, 14, 12, 0.42)
dome('chest', 48, 50, 27, 15, 0.4)
dome('pecL', 37, 51, 12, 10, 0.5, 1.0); dome('pecR', 59, 51, 12, 10, 0.5, 1.0)
dome('shL', 17, 46, 12, 12, 0.55); dome('shR', 79, 46, 12, 12, 0.55)
dome('neck', 48, 34, 7, 7, 0.3)
dome('neckwrap', 48, 36, 11, 4, 0.66, 0.9)
dome('head', 48, 15, 11, 13, 0.6)
dome('browhood', 48, 7, 10, 6, 0.65, 0.8)
dome('jaw', 48, 26, 8, 11, 0.62)
dome('chin', 48, 33, 4.5, 5, 0.63)
dome('face', 48, 19, 7, 10, 0.7, 0.5)
capsule('armL', 14, 50, 9, 74, 8.5, 6.5, 0.7); dome('bicepL', 11, 62, 8, 9, 0.72); capsule('foreL', 9, 74, 11, 96, 7, 5.5, 0.75); dome('handL', 12, 104, 6, 8, 0.8); dome('thumbL', 18, 100, 2.5, 5, 0.82)
capsule('armR', 82, 50, 87, 74, 8.5, 6.5, 0.7); dome('bicepR', 85, 62, 8, 9, 0.72); capsule('foreR', 87, 74, 85, 96, 7, 5.5, 0.75); dome('handR', 84, 104, 6, 8, 0.8); dome('thumbR', 78, 100, 2.5, 5, 0.82)
dome('belt', 48, 85, 21, 5, 0.9, 0.8)
dome('belt2', 48, 92, 21, 4, 0.88, 0.8)
dome('skirt', 48, 106, 21, 8, 0.5, 0.8)
# loose cloth hanging from the belt, swaying
for i in range(26):
    t = i / 25.0; capsule('tailL', 30 + 3 * np.sin(t * 4.0) - 3 * t, 90 + t * 34, 30 + 3 * np.sin(t * 4.0 + 0.2) - 3 * t, 91 + t * 34, 3.2, 3.2, 0.95 + 0.0001 * i)
    capsule('tailR', 66 + 3 * np.sin(t * 4.0 + 1.5) + 3 * t, 90 + t * 34, 66 + 3 * np.sin(t * 4.0 + 1.7) + 3 * t, 91 + t * 34, 3.2, 3.2, 0.95 + 0.0001 * i)

# ---- which part is in front at every pixel
depth = np.full((H, W), -1.0); pid = np.full((H, W), -1, dtype=int)
for i, p in enumerate(parts):
    better = p['m'] & (p['depth'] >= depth)
    depth[better] = p['depth']; pid[better] = i
body = pid >= 0
# smooth the silhouette gaps between neighbouring limb domes
gx = np.zeros((H, W)); gy = np.zeros((H, W)); zz = np.zeros((H, W)); lid = np.zeros((H, W), dtype=int)
for i, p in enumerate(parts):
    s = pid == i; gx[s] = p['gx'][s]; gy[s] = p['gy'][s]; zz[s] = p['z'][s]

# ---- cloth: saw-tooth ridges; each region has its own direction and period (the bands wrap round the body)
def saw(u, period): f = (u / period) % 1.0; return f
cloth = np.zeros((H, W)); edge = np.zeros((H, W)); lipf = np.zeros((H, W))
names = np.array([parts[i]['name'] if i >= 0 else '' for i in pid.flatten()]).reshape(H, W)
def band(mask, u, period, amp):
    global cloth, edge, lipf
    f = (u / period) % 1.0
    cloth = np.where(mask, amp * f, cloth)
    edge = np.where(mask & (f < 0.16), 1.0, edge)          # the overlapped edge: a shadow line
    lipf = np.where(mask & (f >= 0.16) & (f < 0.34), 1.0, lipf)   # and its lit lip
isin = lambda *ns: np.isin(names, ns)
# the chest and the torso: two diagonal crossings
tor = isin('torso', 'abs', 'chest', 'pecL', 'pecR', 'hips', 'neck', 'neckwrap')
u1 = (xx * 0.8 + yy * 0.6) + 2.2 * np.sin(yy * 0.11) + 3.0 * (zz / 20.0)
u2 = (xx * 0.8 - yy * 0.6) + 2.2 * np.sin(yy * 0.09 + 1.0) + 3.0 * (zz / 20.0)
band(tor & (yy < 78), u1, 8.0, 0.55)
band(tor & (yy >= 76), yy + 1.5 * np.sin(xx * 0.2), 5.0, 0.5)
# the belly: wide horizontal rolls
band(isin('belt', 'belt2'), yy + 0.8 * np.sin(xx * 0.18), 5.0, 0.6)
band(isin('skirt'), yy * 0.9 + xx * 0.25, 5.5, 0.5)
# the arms: spirals round the limb
band(isin('armL', 'bicepL', 'foreL', 'handL', 'thumbL'), yy * 0.95 - (xx - 10) * 0.5 + 1.5 * (zz / 10), 5.5, 0.55)
band(isin('armR', 'bicepR', 'foreR', 'handR', 'thumbR'), yy * 0.95 + (xx - 86) * 0.5 + 1.5 * (zz / 10), 5.5, 0.55)
band(isin('shL', 'shR'), (xx * 0.5 + yy * 0.86) + 3 * (zz / 10), 6.0, 0.5)
# the legs: tight straight wraps
band(isin('legL', 'legR', 'tailL', 'tailR'), yy * 0.95 + 0.3 * np.sin(xx * 0.4), 5.5, 0.5)
# the head: wraps round the head with a gap at the face
band(isin('head', 'browhood', 'jaw', 'chin', 'face'), yy * 0.92 + 1.5 * (zz / 12.0) + 0.5 * np.sin(xx * 0.35), 4.2, 0.5)

# ---- light: from the upper left (and a little from the front)
L = np.array([-0.55, -0.7, 0.62]); L /= np.linalg.norm(L)
nx = -(gx) * 0.9; ny = -(gy) * 0.9; nz = np.ones((H, W))
cl = np.gradient(cloth, axis=1), np.gradient(cloth, axis=0)
nx = nx - np.clip(cl[0], -0.9, 0.9) * 0.6; ny = ny - np.clip(cl[1], -0.9, 0.9) * 0.6
nn = np.sqrt(nx * nx + ny * ny + nz * nz); nx /= nn; ny /= nn; nzz = nz / nn
I = np.clip(nx * L[0] + ny * L[1] + nzz * L[2], 0, 1)
I = 0.22 + 0.78 * I
I = np.where(edge > 0, I * 0.62, I); I = np.where(lipf > 0, I + 0.12, I)
# ambient occlusion where a part sits behind another part (the edge between two parts)
def nb(a, dx, dy): return np.roll(np.roll(a, dy, axis=0), dx, axis=1)
occl = np.zeros((H, W))
for dx, dy in [(1, 0), (-1, 0), (0, 1), (0, -1)]:
    other = nb(pid, dx, dy)
    occl = np.where(body & (other >= 0) & (other != pid) & (nb(depth, dx, dy) > depth + 0.05), 1.0, occl)
I = np.where(occl > 0, I * 0.55, I)
# a darker bottom (the floor's mist) and a little noise so that the cloth is not too clean
I = I * (1 - 0.18 * np.clip((yy - 90) / 34.0, 0, 1)) + (rng.rand(H, W) - 0.5) * 0.04
I = np.clip(I, 0, 1)

pal = [(30, 34, 66), (56, 62, 104), (88, 98, 144), (132, 144, 188), (180, 190, 224), (220, 226, 246), (244, 246, 255), (255, 255, 255)]
q = np.clip((I * len(pal)).astype(int), 0, len(pal) - 1)
img = np.zeros((H, W, 4), dtype=np.uint8)
for k, c in enumerate(pal):
    s = body & (q == k); img[s, 0:3] = c; img[s, 3] = 255

# ---- the outline: dark where the body meets the background
OUT = (12, 14, 38)
edge_bg = body & ~(nb(body, 1, 0) & nb(body, -1, 0) & nb(body, 0, 1) & nb(body, 0, -1))
img[edge_bg, 0:3] = OUT
# between the limbs and the torso: a thin dark line where a limb is in front of the torso
limb_names = ('armL', 'bicepL', 'foreL', 'handL', 'thumbL', 'armR', 'bicepR', 'foreR', 'handR', 'thumbR', 'shL', 'shR', 'belt', 'belt2', 'head', 'browhood', 'jaw', 'chin', 'face', 'tailL', 'tailR', 'neckwrap')
lim = np.isin(names, limb_names)
for dx, dy in [(1, 0), (-1, 0), (0, 1), (0, -1)]:
    o = nb(names, dx, dy)
    line = body & ~lim & np.isin(o, limb_names) & (nb(depth, dx, dy) > depth + 0.05)
    line2 = lim & body & ~np.isin(o, limb_names) & (o != '') & (nb(body, dx, dy))
    img[line2, 0:3] = (img[line2, 0:3] * 0.45).astype(np.uint8)
    img[line, 0:3] = (img[line, 0:3] * 0.5).astype(np.uint8)

# ---- the face: a smooth hood with four narrow eye slits (dark; the game lights them), a seam down the middle
def px(x, y, c):
    if 0 <= x < W and 0 <= y < H and body[y, x]: img[y, x, 0:3] = c
for (x0, x1, y) in [(42, 46, 14), (50, 54, 14), (44, 46, 20), (50, 52, 20)]:
    for x in range(x0 - 1, x1 + 1):
        for yy_ in (y - 1, y + 2): 
            if 0 <= x < W and body[yy_, x]: img[yy_, x, 0:3] = (img[yy_, x, 0:3] * 0.55).astype(np.uint8)
    for x in range(x0, x1):
        for yy_ in (y, y + 1): px(x, yy_, (10, 10, 26))
for (bx_, by_) in [(40, 12), (41, 12), (42, 12), (43, 13), (44, 13), (45, 13), (56, 12), (55, 12), (54, 12), (53, 13), (52, 13), (51, 13)]:
    if body[by_, bx_]: img[by_, bx_, 0:3] = (img[by_, bx_, 0:3] * 0.45).astype(np.uint8)
for y in range(3, 38):
    if y not in (14, 15, 20, 21): px(48, y, tuple(int(v) for v in (img[y, 48, 0:3] * 0.75)))
for hx in (12, 84):      # the fingers: dark lines down the hands
    for fx in (-3, 0, 3):
        for fy in range(106, 111): px(hx + fx, fy, tuple(int(v) for v in (img[fy, hx + fx, 0:3] * 0.6)))

Image.fromarray(img).save(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'maho_96.png'))
print('ok', body.sum())
