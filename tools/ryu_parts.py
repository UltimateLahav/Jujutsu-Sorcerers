#!/usr/bin/env python3
"""RYU's design cut into parts and put together again in other poses (the sprite sheet of tools/ryu_art.py is made with this).
ryu_src/master.png is the pixel picture of Ryu the user chose (182 x 172, flipped to face right like every fighter of the game). It is cut by polygons into the head, the two arms (each one piece:
a sleeve, a fur cuff, a hand), the torso (the chest, the open jacket, the belt and the pelvis) and the two legs (a thigh, a shin and a shoe each). A pose says how far every part is moved, turned and stretched about its joint;
render() puts the parts together on a bigger canvas (the picture is made at the master's size, so that the turned parts stay clean) and downscale() / outline() make the 64 x 64 picture of the game out of it.
leg() works out the angles of a leg from where its foot is (a two-bone IK on the master's own thigh and shin)."""
import math, os
import numpy as np
from PIL import Image, ImageDraw

HERE = os.path.dirname(os.path.abspath(__file__))
MASTER = Image.open(os.path.join(HERE, 'ryu_src', 'master.png')).convert('RGBA'); MW, MH = MASTER.size
SRC = np.asarray(MASTER).copy()
POLY = {      # the parts' own regions (master coordinates, facing right); the first polygon that holds a pixel owns it, what is left is the torso
 'head': [(91, 14), (94, 6), (102, 1), (113, 0), (122, 2), (126, 9), (126, 17), (124, 25), (124, 34), (116, 38), (108, 36), (103, 31), (97, 27), (92, 22)],
 'armA': [(118, 8), (126, 5), (140, 5), (150, 2), (160, 1), (170, 3), (176, 12), (174, 23), (167, 29), (158, 27), (152, 31), (146, 37), (138, 45), (130, 49), (123, 46), (118, 36), (118, 22)],
 'armB': [(124, 36), (134, 37), (146, 43), (150, 36), (158, 31), (169, 32), (174, 42), (173, 55), (167, 63), (155, 63), (144, 59), (133, 53), (126, 47)],
 'footL': [(0, 151), (60, 151), (60, 172), (0, 172)],
 'footR': [(130, 152), (190, 152), (190, 172), (130, 172)],
 'thighL': [(72, 86), (40, 86), (30, 126), (66, 126), (67, 112)],
 'shinL': [(0, 126), (66, 126), (70, 134), (52, 152), (49, 172), (0, 172)],
 'thighR': [(146, 84), (190, 84), (190, 126), (152, 126), (150, 112)],
 'shinR': [(130, 126), (152, 126), (190, 126), (190, 172), (130, 172)]}
EXT = {'thighL': [(88, 84), (40, 84), (30, 126), (70, 126), (74, 112)], 'thighR': [(130, 84), (190, 84), (190, 126), (152, 126), (132, 112)],      # (a leg also keeps a copy of the pelvis next to its hip, drawn under the torso, so that a turned leg leaves no gap)
       'shinL': [(0, 118), (66, 118), (70, 134), (52, 152), (49, 172), (0, 172)], 'shinR': [(130, 118), (152, 118), (190, 118), (190, 172), (130, 172)]}      # (and a shin a little of the thigh above the knee)
FILL = [(98, 24), (132, 24), (142, 40), (138, 72), (100, 84), (96, 50)]      # (where the torso is painted in behind a part that moves away: the neck, the chest)
PIV = {'head': (112, 34), 'armA': (124, 34), 'armB': (128, 44), 'thighL': (64, 92), 'shinL': (47, 126), 'footL': (38, 152), 'thighR': (152, 96), 'shinR': (172, 124), 'footR': (156, 153), 'torso': (118, 82)}      # the joints (master coordinates)
ORDER = ['footL', 'shinL', 'thighL', 'footR', 'shinR', 'thighR', 'torso', 'armB', 'head', 'armA']      # back to front
PARENT = {'footL': 'shinL', 'shinL': 'thighL', 'footR': 'shinR', 'shinR': 'thighR', 'thighL': 'torso', 'thighR': 'torso', 'head': 'torso', 'armA': 'torso', 'armB': 'torso'}      # a part follows its parent's move
OUTLINE = (14, 12, 22)
FEATURE = {(58, 34, 44), (40, 22, 32), (92, 56, 60), (86, 86, 116), (140, 86, 58)}      # (thin dark lines of the face, the hair's shine, the belt's leather: a game pixel keeps them when only a part of it has them)

def _mask(poly):
    m = Image.new('L', (MW, MH), 0); ImageDraw.Draw(m).polygon(poly, fill=255); return np.asarray(m) > 0
def _build():
    own = {}; taken = np.zeros((MH, MW), bool); solid = SRC[..., 3] > 0
    for k in ('head', 'armA', 'armB', 'footL', 'footR', 'thighL', 'shinL', 'thighR', 'shinR'):
        m = _mask(POLY[k]) & solid & ~taken; own[k] = m; taken |= m
    own['torso'] = solid & ~taken; layers = {}
    for k, m in own.items():
        L = np.zeros((MH, MW, 4), np.uint8); mm = (m | (_mask(EXT[k]) & solid)) if k in EXT else m; L[mm] = SRC[mm]; layers[k] = L
    # the torso is painted in behind the parts that sit on it (diffusing the colours of its own pixels into the places they cover)
    t = layers['torso']; known = own['torso'].copy(); fill = _mask(FILL) & ~own['torso'] & (own['head'] | own['armA'] | own['armB']); rgb = t[..., :3].astype(float)
    for _ in range(40):
        acc = np.zeros_like(rgb); cnt = np.zeros((MH, MW))
        for dy, dx in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            kk = np.roll(known, (dy, dx), (0, 1)); acc += np.roll(rgb, (dy, dx), (0, 1)) * kk[..., None]; cnt += kk
        new = fill & ~known & (cnt > 0); rgb[new] = acc[new] / cnt[new][..., None]; known |= new
    t[..., :3] = rgb.round().astype(np.uint8); t[..., 3] = np.where(known, 255, 0); t[own['torso']] = SRC[own['torso']]      # (the original pixels stay exactly as they were)
    return own, layers
OWN, LAYERS = _build()

def _xform(img, piv, dx, dy, rot, sx=1.0, sy=1.0):
    """the image stretched by (sx, sy) and turned by rot degrees (clockwise, nearest neighbour) about piv, then moved by (dx, dy)"""
    H, W = img.shape[:2]; a = math.radians(rot); c, s = math.cos(a), math.sin(a); ys, xs = np.mgrid[0:H, 0:W]
    X = xs - dx - piv[0]; Y = ys - dy - piv[1]; rx = (c * X + s * Y) / sx; ry = (-s * X + c * Y) / sy
    ix = np.rint(rx + piv[0]).astype(int); iy = np.rint(ry + piv[1]).astype(int); ok = (ix >= 0) & (ix < W) & (iy >= 0) & (iy < H)
    out = np.zeros_like(img); out[ok] = img[iy[ok], ix[ok]]; return out
def _moves(p): return bool(p) and (any(abs(v) > 1e-9 for v in p[:3]) or (len(p) > 3 and (abs(p[3] - 1) > 1e-9 or abs(p[4] - 1) > 1e-9)))
def render(pose, size=(280, 240), off=(50, 36), skip=()):
    """pose: {part: (dx, dy, rot[, sx, sy])}: how far a part is moved and turned (degrees, clockwise) about its joint (and stretched); it also follows what its parent does (a shin its thigh, an arm / the head / a thigh the torso).
    Returns an RGBA array of `size` (master pixels) with the master's picture at `off`."""
    canvas = np.zeros((size[1], size[0], 4), np.uint8)
    for k in ORDER:
        if k in skip: continue
        res = np.zeros((size[1], size[0], 4), np.uint8); res[off[1]:off[1] + MH, off[0]:off[0] + MW] = LAYERS[k]; q = k
        while q:
            p = pose.get(q)
            if _moves(p): res = _xform(res, (PIV[q][0] + off[0], PIV[q][1] + off[1]), p[0], p[1], p[2], *(p[3:5] if len(p) > 3 else ()))
            q = PARENT.get(q)
        m = res[..., 3] > 0; canvas[m] = res[m]
    return canvas

# ---------------------------------------------------------------- legs: where is the foot -> the angles
LEGS = {'R': dict(hip=(152, 96), knee=(172, 124), ank=(156, 153), t='thighR', s='shinR', f='footR', out=1), 'L': dict(hip=(64, 92), knee=(47, 126), ank=(38, 152), t='thighL', s='shinL', f='footL', out=-1)}
FOOT0 = {'R': LEGS['R']['ank'], 'L': LEGS['L']['ank']}      # (where the ankles are in the design)
def _ang(p, q): return math.degrees(math.atan2(q[1] - p[1], q[0] - p[0]))
def _rot(p, c, deg):
    a = math.radians(deg); X, Y = p[0] - c[0], p[1] - c[1]; return (c[0] + X * math.cos(a) - Y * math.sin(a), c[1] + X * math.sin(a) + Y * math.cos(a))
REST = {}      # (the angles the solver gives for the design's own pose: taken off, so that the design's feet are exactly no turn)
def leg(side, foot, torso=(0, 0, 0), toe=0, bend=None, _raw=False):
    """the pose entries (thigh, shin, foot) of a leg whose ankle is at `foot` (master coordinates, world) when the torso is moved as given (dx, dy, rot); bend: +1 the knee points outward (away from the body), -1 inward;
    toe: the shoe's angle in the world (degrees, clockwise, 0 = as in the design). A foot that cannot be reached is brought as near as the leg allows. Returns the entries, the hip and the knee."""
    G = LEGS[side]; bend = G['out'] if bend is None else bend
    hip = _rot(G['hip'], PIV['torso'], torso[2]); hip = (hip[0] + torso[0], hip[1] + torso[1])
    L1 = math.dist(G['hip'], G['knee']); L2 = math.dist(G['knee'], G['ank']); d = math.dist(hip, foot); d = max(abs(L1 - L2) + .5, min(d, L1 + L2 - .5))
    a = _ang(hip, foot); cosb = max(-1, min(1, (L1 * L1 + d * d - L2 * L2) / (2 * L1 * d))); b = math.degrees(math.acos(cosb))
    k1 = (hip[0] + L1 * math.cos(math.radians(a + b)), hip[1] + L1 * math.sin(math.radians(a + b))); k2 = (hip[0] + L1 * math.cos(math.radians(a - b)), hip[1] + L1 * math.sin(math.radians(a - b)))
    cx = (hip[0] + foot[0]) / 2; knee = max((k1, k2), key=lambda k: (k[0] - cx) * bend)      # (the knee on the outer side)
    ft = (hip[0] + (foot[0] - hip[0]), foot[1])
    thigh_w = _ang(hip, knee) - _ang(G['hip'], G['knee']); shin_w = _ang(knee, foot) - _ang(G['knee'], G['ank'])
    r = (thigh_w - torso[2], shin_w - thigh_w, toe - shin_w)
    if _raw: return r, hip, knee
    r0 = REST[side]; return {G['t']: (0, 0, r[0] - r0[0]), G['s']: (0, 0, r[1] - r0[1]), G['f']: (0, 0, r[2] - r0[2])}, hip, knee
for _s in 'RL': REST[_s] = leg(_s, FOOT0[_s], (0, 0, 0), 0, None, True)[0]
def feet(pose, frontfoot, backfoot, torso=(0, 0, 0), ftoe=0, btoe=0):
    """fills `pose` with both legs for the given feet (and the torso); returns the two knees"""
    pr, _, kr = leg('R', frontfoot, torso, ftoe); pl, _, kl = leg('L', backfoot, torso, btoe); pose.update(pr); pose.update(pl); pose['torso'] = torso; return kr, kl

# ---------------------------------------------------------------- the game's picture: 64 x 64 pixels made out of the master-size canvas
SCALE = 52 / MH                 # master pixels -> game pixels (he is 52 px high in his stance: the master's 172)
CX, GROUND = 32, 61             # the game column of the middle of the picture and the row of the soles (the outline is the row after)
HX, SOLE = 91, 171              # (the master column that goes to the game column CX and the master row of the soles)
def _lum(c): return (int(c[0]) + int(c[1]) + int(c[2])) / 3
def downscale(canvas, off=(50, 36), dx=0, dy=0):
    """the 64 x 64 RGBA array of a render() canvas (no outline yet): the master column HX goes to game column CX + dx and its soles to row GROUND + dy; every game pixel takes the colour most of the master pixels under it
    have (whites and skin count a little more, thin dark lines of the face a lot more, the outline is left out)"""
    H, W = canvas.shape[:2]; f = 1 / SCALE; out = np.zeros((64, 64, 4), np.uint8)
    ox = off[0] + HX - (CX + dx) * f; oy = off[1] + SOLE + 1 - (GROUND + dy + 1) * f      # (canvas coordinates of the cell's top left corner)
    for j in range(64):
        ya = int(round(oy + j * f)); yb = max(ya + 1, int(round(oy + (j + 1) * f)))
        if yb <= 0 or ya >= H: continue
        for i in range(64):
            xa = int(round(ox + i * f)); xb = max(xa + 1, int(round(ox + (i + 1) * f)))
            if xb <= 0 or xa >= W: continue
            blk = canvas[max(ya, 0):yb, max(xa, 0):xb].reshape(-1, 4); sol = blk[blk[:, 3] > 0]
            if len(sol) * 2 < (yb - ya) * (xb - xa): continue
            cnt = {}
            for p in sol:
                c = (int(p[0]), int(p[1]), int(p[2])); l = _lum(c)
                w = 0.15 if c == OUTLINE else 5.0 if c in FEATURE else 1.6 if l > 200 else 1.3 if (c[0] > c[2] + 25 and l > 120) else 1.0
                cnt[c] = cnt.get(c, 0) + w
            c = max(cnt.items(), key=lambda kv: kv[1])[0]; out[j, i, :3] = c; out[j, i, 3] = 255
    return out
def outline(a):
    al = a[..., 3] > 0; edge = np.zeros_like(al)
    for dy, dx in ((1, 0), (-1, 0), (0, 1), (0, -1)): edge |= np.roll(al, (dy, dx), (0, 1))
    edge &= ~al; edge[0, :] = edge[-1, :] = False; edge[:, 0] = edge[:, -1] = False
    a = a.copy(); a[edge] = (*OUTLINE, 255); return a
def frame(pose, dx=0, dy=0): return outline(downscale(render(pose), dx=dx, dy=dy))
