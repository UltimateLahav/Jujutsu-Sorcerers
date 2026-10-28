"""v1.98 THE GAUNTLET: draws the close-up of Thanos's Infinity Gauntlet with NO stones (tools/gauntlet_64.png, 64 x 64): a golden fist on a cuff, seen from the back of the hand, with six EMPTY sockets (the thumb, the four fingers, the middle of the hand). The picture is shaded from a height map (a cuff, a wrist ring, four finger plates, the fist with its raised back plate, the thumb) lit from the upper left, cut into seven tones of gold, then engraved by hand (the panels of the cuff, its vents, the ring's grooves and bolts) and outlined.
The sprite of the whole figure, tools/thanos_64.png, was traced from reference pictures with an offline tool and cleaned by hand; this script makes only the gauntlet. Run from tools/: python3 thanos_art.py   (writes gauntlet_64.png and prints where the sockets are: the game puts the purple shine on the middle finger's, see c5Sock in chap2b.js)."""
import numpy as np, math, sys
from PIL import Image, ImageDraw
W = H = 64
def hx(h): h = h.lstrip('#'); return (int(h[0:2], 16), int(h[2:4], 16), int(h[4:6], 16), 255)
GOLD = [hx(c) for c in ('#fff1a8', '#f8dc70', '#e0b040', '#b88428', '#8a5c1a', '#5c3c10', '#34200a')]
OUT = hx('#120a04'); HOLE2 = hx('#3a2208')
TH = math.radians(-52); U = (math.cos(TH), math.sin(TH)); V = (-math.sin(TH), math.cos(TH)); W0 = (33.0, 37.0)
L = np.array([-0.55, -0.68, 0.5]); L /= np.linalg.norm(L)
def loc(x, y): dx, dy = x - W0[0], y - W0[1]; return dx * U[0] + dy * U[1], dx * V[0] + dy * V[1]
def sup(a, b, ca, cb, ra, rb, p): return (abs((a - ca) / ra)) ** p + (abs((b - cb) / rb)) ** p
def cuff_hw(a): return 8.8 + (-1.0 - a) * 0.15
# ---- parts (z = the height, used for which part is in front and for the normal)
def cuff(a, b):
    if not (-21.5 <= a <= -1.0): return None
    hw = cuff_hw(a)
    if abs(b) >= hw: return None
    s = b / hw; z = hw * 0.75 * math.sqrt(1 - s * s)
    if a < -18.6: z += 1.6                                              # the rolled flare at the elbow end
    return z, 'cuff'
def ring(a, b):
    if not (-1.8 <= a <= 3.4): return None
    hw = 10.0
    if abs(b) >= hw: return None
    s = b / hw; z = 3 + hw * 0.62 * math.sqrt(1 - s * s) * (0.8 + 0.2 * math.sqrt(max(0, 1 - ((a - 0.8) / 2.7) ** 2)))
    return z, 'ring'
def fingers(a, b):
    if not (3.0 <= a <= 10.5): return None
    hw = 10.6 - (a - 3) * 0.1
    if abs(b) >= hw: return None
    k = (b + hw) / (2 * hw) * 4; i = min(3, int(k)); fr = k - i
    z = 6 + 4.2 * math.sin(math.pi * min(1, max(0, fr))) ** 0.6 + 1.6 * math.sqrt(max(0, 1 - ((a - 6.5) / 4.5) ** 2))
    return z, 'fing'
def fist(a, b):
    f = sup(a, b, 17.0, 0.0, 9.2, 10.6, 2.7)
    if f >= 1: return None
    return 9 + 9 * (1 - f) ** 0.5, 'fist'
def plate(a, b):
    f = sup(a, b, 15.8, 1.4, 8.6, 8.9, 2.5)
    if f >= 1: return None
    return 18.5 + 3.2 * (1 - f) ** 0.45, 'plate'
def thumb(a, b):
    p0, p1, r0, r1 = (5.5, -10.0), (21.8, -8.0), 4.2, 3.2
    da, db = p1[0] - p0[0], p1[1] - p0[1]; ln2 = da * da + db * db; t = max(0, min(1, ((a - p0[0]) * da + (b - p0[1]) * db) / ln2)); ca, cb = p0[0] + da * t, p0[1] + db * t; r = r0 + (r1 - r0) * t
    d = math.hypot(a - ca, b - cb)
    if d >= r: return None
    return 15 + r * 1.25 * math.sqrt(1 - (d / r) ** 2) + 1.3 * math.exp(-((t - 0.55) / 0.12) ** 2), 'thumb'
PARTS = [cuff, ring, fingers, fist, plate, thumb]
SOCK = [(12.6, -9.4, 2.7, 'thumb'), (20.2, -3.6, 2.25, 'index'), (20.6, 1.9, 2.25, 'middle'), (19.4, 7.0, 2.25, 'ring'), (17.0, 11.0, 1.85, 'pinky'), (10.6, 4.4, 3.9, 'palm')]
def sample(a, b):
    best = None
    for P in PARTS:
        r = P(a, b)
        if r and (best is None or r[0] >= best[0]): best = r
    return best
def panel(a, s):      # which sunken panel of the cuff (1 left, 2 right) a point is in
    if -19.0 < a < -4.4:
        if -0.86 < s < -0.13: return 1
        if 0.13 < s < 0.86: return 2
    return 0
def render(out='gauntlet'):
    z = np.full((H, W), -9.0); mat = np.full((H, W), '', dtype=object); A = np.zeros((H, W)); B = np.zeros((H, W))
    for y in range(H):
        for x in range(W):
            a, b = loc(x + 0.5, y + 0.5); A[y, x], B[y, x] = a, b; r = sample(a, b)
            if r: z[y, x], mat[y, x] = r
    tone = np.full((H, W), -1)
    for y in range(H):
        for x in range(W):
            if mat[y, x] == '': continue
            a, b = A[y, x], B[y, x]; e = 0.9
            def zz(da, db):
                r = sample(a + da, b + db); return r[0] if r else z[y, x] - 3
            ga = (zz(e, 0) - zz(-e, 0)) / (2 * e); gb = (zz(0, e) - zz(0, -e)) / (2 * e)
            na, nb = -ga * 0.5, -gb * 0.5
            n = np.array([na * U[0] + nb * V[0], na * U[1] + nb * V[1], 1.0]); n /= np.linalg.norm(n)
            lam = max(0.0, float(n @ L)); rr = 2 * (n @ L) * n - L; spec = max(0.0, float(rr[2])) ** 16
            v = 0.12 + 0.88 * lam + 0.5 * spec
            if mat[y, x] == 'cuff' and panel(a, b / cuff_hw(a)): v *= 0.82      # (the sunken panels are a shade darker)
            tone[y, x] = 0 if v > 0.95 else 1 if v > 0.78 else 2 if v > 0.56 else 3 if v > 0.34 else 4
    # mode filter on the tone map (removes lone pixels, keeps the edges)
    t2 = tone.copy()
    for y in range(1, H - 1):
        for x in range(1, W - 1):
            if tone[y, x] < 0: continue
            nb = [tone[y + dy, x + dx] for dy in (-1, 0, 1) for dx in (-1, 0, 1) if (dx or dy) and tone[y + dy, x + dx] >= 0]
            if len(nb) >= 6:
                c = {}; [c.__setitem__(q, c.get(q, 0) + 1) for q in nb]; best = max(c, key=c.get)
                if c[best] >= 6 and tone[y, x] != best and c.get(tone[y, x], 0) <= 1: t2[y, x] = best
    tone = t2
    # ---- engraved lines and bevels (in the arm's coordinates, on the finished tone map)
    for y in range(H):
        for x in range(W):
            if mat[y, x] != 'cuff': continue
            a, b = A[y, x], B[y, x]; hw = cuff_hw(a); s = b / hw; p = panel(a, s)
            if p == 1:
                for s0 in (-0.62, -0.38):
                    if abs(s - s0) < 0.065 and -17.2 < a < -6.2: tone[y, x] = 5
            if p == 2 and -17.2 < a < -5.8:
                for a0 in (-16.0, -12.9, -9.8, -6.7):
                    if abs(a - a0) < 0.5 and 0.3 < s < 0.7: tone[y, x] = 5
            # panel bevel: dark on the inner upper-left edge, light on the outer lower-right edge (seen from where the light comes)
            if p:
                for dx, dy in ((-1, 0), (0, -1)):
                    a2, b2 = A[y + dy, x + dx], B[y + dy, x + dx]
                    if mat[y + dy, x + dx] == 'cuff' and not panel(a2, b2 / cuff_hw(a2)): tone[y, x] = 5; break
            else:
                for dx, dy in ((1, 0), (0, 1)):
                    if 0 <= y + dy < H and 0 <= x + dx < W and mat[y + dy, x + dx] == 'cuff':
                        a2, b2 = A[y + dy, x + dx], B[y + dy, x + dx]
                        if panel(a2, b2 / cuff_hw(a2)) and tone[y, x] > 1: tone[y, x] = 1; break
            if a < -19.4 and a > -20.4: tone[y, x] = 5                  # the groove behind the flare
        for x in range(W):
            if mat[y, x] == 'ring':
                a, b = A[y, x], B[y, x]
                if abs(a + 1.2) < 0.5 or abs(a - 2.9) < 0.5: tone[y, x] = 5
                elif math.hypot(a - 0.8, abs(b) - 6.2) < 0.8: tone[y, x] = 0
            if mat[y, x] == 'fing':
                a, b = A[y, x], B[y, x]; hw = 10.6 - (a - 3) * 0.1; k = (b + hw) / (2 * hw) * 4
                if abs(k - round(k)) < 0.09 and 0 < round(k) < 4: tone[y, x] = 5
    # ---- sockets: a dark ring round the bezel, a lit bezel (upper-left bright, lower-right shaded), the hole, a sliver of its far wall
    sockc = []
    for (sa, sb, r, nm) in SOCK:
        sx = W0[0] + sa * U[0] + sb * V[0]; sy = W0[1] + sa * U[1] + sb * V[1]; sockc.append((sx, sy, r, nm))
        for y in range(H):
            for x in range(W):
                if tone[y, x] < 0: continue
                dx, dy = x + 0.5 - sx, y + 0.5 - sy; d = math.hypot(dx, dy); q = dx + dy
                if d < r - 0.8: tone[y, x] = 7 if q < 0.35 * (r - 1) else 8                 # the hole, its lower-right wall lit a little
                elif d < r + 0.6: tone[y, x] = 0 if q < -0.4 else 2 if q < 1.0 else 3        # the bezel
                elif d < r + 1.55: tone[y, x] = 5                                                   # the dark ring round it
    img = np.zeros((H, W, 4), np.uint8)
    for y in range(H):
        for x in range(W):
            t = tone[y, x]
            if t < 0: continue
            img[y, x] = OUT if t == 7 else HOLE2 if t == 8 else GOLD[t]
    img2 = img.copy()
    for y in range(H):
        for x in range(W):
            if mat[y, x] == '' or tone[y, x] in (7, 8): continue
            for dx, dy in ((1, 0), (0, 1), (-1, 0), (0, -1)):
                xx, yy = x + dx, y + dy
                if 0 <= xx < W and 0 <= yy < H and mat[yy, xx] != '' and mat[yy, xx] != mat[y, x] and z[yy, xx] > z[y, x] + 1.8: img2[y, x] = GOLD[5]; break
    img = img2; img3 = img.copy()
    for y in range(H):
        for x in range(W):
            if img[y, x, 3] == 0 and any(0 <= x + dx < W and 0 <= y + dy < H and img[y + dy, x + dx, 3] for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1))): img3[y, x] = OUT
    Image.fromarray(img3, 'RGBA').save(out + '_64.png')
    print([(nm, round(sx, 1), round(sy, 1), r) for sx, sy, r, nm in sockc])
if __name__ == '__main__': render()
