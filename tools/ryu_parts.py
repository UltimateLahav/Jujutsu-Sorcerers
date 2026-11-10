#!/usr/bin/env python3
"""RYU's design cut into parts and put together again in other poses (the sprite sheet of tools/ryu_art.py is made with this).
ryu_src/master.png is the pixel picture of Ryu the user chose (182 x 172, facing right like every fighter of the game). It is only the LOOK of Ryu (his face, hair, jacket, fur, belt, jeans and boots); his poses are new.
BODY parts: the PELVIS (belt and jeans), the CHEST (the open jacket's body, the belly), the head, two arms (each one piece: a sleeve, a fur cuff, a hand) and two legs (a thigh, a shin and a boot each).
LOOSE parts (they swing on their own, see ryu_art.py): the HAIR, the white fur of the COLLAR, the outer JACKET with its spiky tail, the fur CUFF at the belly and the fur cuffs at the ends of both arms.
A pose says how far each part is moved, turned, stretched and sheared about its joint; render() puts the parts together on a bigger canvas (made at the master's size so that the turned parts stay clean)
and downscale() / outline() make the 64 x 64 picture of the game out of it. leg() works out the angles of a leg from where its foot is (a two-bone solver on the design's own thigh and shin)."""
import math, os
import numpy as np
from PIL import Image, ImageDraw

HERE = os.path.dirname(os.path.abspath(__file__))
MASTER = Image.open(os.path.join(HERE, 'ryu_src', 'master.png')).convert('RGBA'); MW, MH = MASTER.size
SRC = np.asarray(MASTER).copy()
POLY = {      # the parts' own regions (master coordinates); the first polygon that holds a pixel owns it, what is left is the torso
 'head': [(91, 14), (94, 6), (102, 1), (113, 0), (122, 2), (126, 9), (126, 17), (124, 25), (124, 34), (116, 38), (108, 36), (103, 31), (97, 27), (92, 22)],
 'armA': [(118, 8), (126, 5), (140, 5), (150, 2), (160, 1), (170, 3), (176, 12), (174, 23), (167, 29), (158, 27), (152, 31), (146, 37), (138, 45), (130, 49), (123, 46), (118, 36), (118, 22)],
 'armB': [(124, 36), (134, 37), (146, 43), (150, 36), (158, 31), (169, 32), (174, 42), (173, 55), (167, 63), (155, 63), (144, 59), (133, 53), (126, 47)],
 'footL': [(0, 151), (60, 151), (60, 172), (0, 172)],
 'footR': [(130, 152), (190, 152), (190, 172), (130, 172)],
 'thighL': [(72, 86), (40, 86), (30, 126), (66, 126), (67, 112)],
 'shinL': [(0, 126), (66, 126), (70, 134), (52, 152), (49, 172), (0, 172)],
 'thighR': [(146, 84), (190, 84), (190, 126), (152, 126), (150, 112)],
 'shinR': [(130, 126), (152, 126), (190, 126), (190, 172), (130, 172)]}
EXT = {'thighL': [(88, 84), (40, 84), (30, 126), (70, 126), (74, 112)], 'thighR': [(130, 84), (190, 84), (190, 126), (152, 126), (132, 112)],      # (a leg also keeps a copy of the pelvis next to its hip, drawn under the pelvis, so that a turned leg leaves no gap)
       'shinL': [(0, 118), (66, 118), (70, 134), (52, 152), (49, 172), (0, 172)], 'shinR': [(130, 118), (152, 118), (190, 118), (190, 172), (130, 172)]}      # (and a shin a little of the thigh above the knee)
FILL = [(98, 24), (132, 24), (142, 40), (138, 72), (100, 84), (96, 50)]      # (where the chest is painted in behind a part that moves away: the neck, the chest)
WAIST = 77      # the chest ends here (the belt and the jeans are the pelvis); the jacket's hem (left of column 106) goes down to row 80 with the chest
HAIRC = {(24, 26, 44), (40, 46, 72), (70, 80, 112), (30, 30, 48), (52, 52, 78), (86, 86, 116), (55, 63, 92), (32, 36, 58), (14, 12, 22)}      # (the navy and black of the hair)
FURC = {(196, 196, 208), (244, 244, 248), (128, 128, 146), (226, 222, 222)}      # (the white and grey of the fur)
LOOSE = {      # the parts that swing: name: (the body part they hang on, polygon, colours (None = all), joint, how the base keeps its look: 'rim' = a band of `rim` pixels round what is left, 'fill' = painted in from the neighbours)
 'hair': ('head', [(88, -1), (130, -1), (130, 24), (104, 26), (90, 24)], HAIRC, (108, 20), 'rim', 3),
 'collarL': ('chest', [(80, 10), (104, 10), (106, 36), (100, 42), (82, 42)], FURC | {(14, 12, 22)}, (100, 34), 'rim', 3),
 'jacketO': ('chest', [(60, 36), (100, 32), (102, 46), (106, 62), (112, 76), (112, 80), (60, 80)], None, (100, 38), 'rim', 4),
 'cuffN': ('chest', [(98, 48), (134, 48), (136, 68), (112, 74), (98, 62)], FURC, (116, 50), 'fill', 0),
 'cuffA': ('armA', [(134, -1), (190, -1), (190, 40), (134, 40)], FURC, (138, 24), 'rim', 3),
 'cuffB': ('armB', [(148, 28), (190, 28), (190, 68), (148, 68)], FURC, (150, 48), 'rim', 3)}
PIV = {'pelvis': (118, 82), 'chest': (118, 77), 'head': (112, 34), 'armA': (124, 34), 'armB': (128, 44), 'thighL': (64, 92), 'shinL': (47, 126), 'footL': (38, 152), 'thighR': (152, 96), 'shinR': (172, 124), 'footR': (156, 153),
       'hair': (108, 20), 'collarL': (100, 34), 'jacketO': (100, 38), 'cuffN': (116, 50), 'cuffA': (138, 24), 'cuffB': (150, 48)}      # the joints (master coordinates)
ORDER = ['footL', 'legL', 'footR', 'legR', 'pelvis', 'jacketO', 'chest', 'collarL', 'cuffN', 'armB', 'cuffB', 'head', 'hair', 'armA', 'cuffA']      # back to front
PARENT = {'footL': 'shinL', 'shinL': 'thighL', 'footR': 'shinR', 'shinR': 'thighR', 'thighL': 'pelvis', 'thighR': 'pelvis', 'chest': 'pelvis', 'head': 'chest', 'armA': 'chest', 'armB': 'chest',
          'hair': 'head', 'collarL': 'chest', 'jacketO': 'chest', 'cuffN': 'chest', 'cuffA': 'armA', 'cuffB': 'armB'}      # a part follows its parent's move
OUTLINE = (14, 12, 22)
FEATURE = {(58, 34, 44), (40, 22, 32), (92, 56, 60), (86, 86, 116), (140, 86, 58)}      # (thin dark lines of the face, the hair's shine, the belt's leather: a game pixel keeps them when only a part of it has them)

def _mask(poly):
    m = Image.new('L', (MW, MH), 0); ImageDraw.Draw(m).polygon(poly, fill=255); return np.asarray(m) > 0
def _colmask(m, colors):
    if colors is None: return m
    out = np.zeros_like(m); ys, xs = np.nonzero(m)
    for y, x in zip(ys, xs):
        if (int(SRC[y, x, 0]), int(SRC[y, x, 1]), int(SRC[y, x, 2])) in colors: out[y, x] = True
    return out
def _grow(m, r):
    g = m.copy()
    for _ in range(r):
        n = g.copy()
        for dy, dx in ((1, 0), (-1, 0), (0, 1), (0, -1)): n |= np.roll(g, (dy, dx), (0, 1))
        g = n
    return g
def _diffuse(rgb, known, want, steps=40):
    """paints the pixels of `want` with the colours of the known pixels round them (spreading inwards a pixel at a time)"""
    rgb = rgb.astype(float).copy(); known = known.copy()
    for _ in range(steps):
        acc = np.zeros_like(rgb); cnt = np.zeros(known.shape)
        for dy, dx in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            kk = np.roll(known, (dy, dx), (0, 1)); acc += np.roll(rgb, (dy, dx), (0, 1)) * kk[..., None]; cnt += kk
        new = want & ~known & (cnt > 0)
        if not new.any(): break
        rgb[new] = acc[new] / cnt[new][..., None]; known |= new
    return rgb.round().astype(np.uint8), known

def _build():
    solid = SRC[..., 3] > 0; own = {}; taken = np.zeros((MH, MW), bool)
    for k in ('head', 'armA', 'armB', 'footL', 'footR', 'thighL', 'shinL', 'thighR', 'shinR'):
        m = _mask(POLY[k]) & solid & ~taken; own[k] = m; taken |= m
    torso = solid & ~taken; ys, xs = np.mgrid[0:MH, 0:MW]
    own['chest'] = torso & ((ys < WAIST) | ((xs < 106) & (ys < 80))); own['pelvis'] = torso & ~own['chest']
    # the loose parts are cut out of the part they hang on
    loose = {}
    for k, (par, poly, colors, joint, how, rim) in LOOSE.items():
        loose[k] = _colmask(own[par] & _mask(poly), colors)
    base = {k: own[k].copy() for k in own}
    for k, (par, poly, colors, joint, how, rim) in LOOSE.items():
        cut = loose[k]; rest = base[par] & ~cut
        base[par] = (rest | (cut & _grow(rest, rim))) if how == 'rim' else rest      # 'rim': the base keeps a band of the part round the cut; 'fill': what is cut is painted in below
    layers = {}
    for k, m in base.items():
        if k in ('shinL', 'shinR'): continue
        if k in ('thighL', 'thighR'):      # a leg is ONE piece of cloth (thigh + shin) that bends smoothly at the knee, see _skin
            sh = 'shin' + k[-1]; mm = m | base[sh] | (_mask(EXT[k]) & solid); L = np.zeros((MH, MW, 4), np.uint8); L[mm] = SRC[mm]; layers['leg' + k[-1]] = L; continue
        L = np.zeros((MH, MW, 4), np.uint8); mm = (m | (_mask(EXT[k]) & solid)) if k in EXT else m; L[mm] = SRC[mm]; layers[k] = L
    for k, cut in loose.items():
        L = np.zeros((MH, MW, 4), np.uint8); L[cut] = SRC[cut]; layers[k] = L
    # 'fill' parts: the body below them is painted in from what is round them
    for k, (par, poly, colors, joint, how, rim) in LOOSE.items():
        if how != 'fill': continue
        t = layers[par]; known = base[par].copy(); rgb, kn = _diffuse(t[..., :3], known, loose[k] & ~known); t[..., :3] = rgb; t[..., 3] = np.where(kn, 255, 0)
        t[base[par]] = SRC[base[par]]
    # the chest is painted in behind the parts that sit on it (the neck and the chest, behind the head and the arms)
    t = layers['chest']; known = base['chest'].copy(); want = _mask(FILL) & ~known & (own['head'] | own['armA'] | own['armB']); rgb, kn = _diffuse(t[..., :3], known, want); t[..., :3] = rgb; t[..., 3] = np.where(kn, 255, 0); t[base['chest']] = SRC[base['chest']]
    # the pelvis keeps a copy of the belly above the waist, under the chest, so that a bent waist shows no gap
    belly = own['chest'] & (ys >= 58) & (ys < WAIST) & (xs >= 96) & (xs <= 146); p = layers['pelvis']; p[belly] = SRC[belly]
    return own, layers
OWN, LAYERS = _build()

def _xform(arr, org, piv, dx, dy, rot, sx=1.0, sy=1.0, shx=0.0):
    """the part `arr` (RGBA, its top left corner at org on the canvas) sheared sideways by shx (columns per row below the joint, negative above it), stretched by (sx, sy) and turned by rot degrees (clockwise, nearest neighbour)
    about piv, then moved by (dx, dy). Returns the new array and its corner (only as big as the moved part)"""
    h, w = arr.shape[:2]; a = math.radians(rot); c, s = math.cos(a), math.sin(a); xs_, ys_ = [], []
    for X, Y in ((org[0], org[1]), (org[0] + w, org[1]), (org[0], org[1] + h), (org[0] + w, org[1] + h)):
        X -= piv[0]; Y -= piv[1]; X = (X + shx * Y) * sx; Y = Y * sy; xs_.append(piv[0] + dx + X * c - Y * s); ys_.append(piv[1] + dy + X * s + Y * c)
    x0, x1, y0, y1 = int(math.floor(min(xs_))) - 2, int(math.ceil(max(xs_))) + 2, int(math.floor(min(ys_))) - 2, int(math.ceil(max(ys_))) + 2
    ys, xs = np.mgrid[y0:y1, x0:x1]; X = xs - dx - piv[0]; Y = ys - dy - piv[1]; rx = (c * X + s * Y) / sx; ry = (-s * X + c * Y) / sy; rx = rx - shx * ry
    ix = np.rint(rx + piv[0]).astype(int) - org[0]; iy = np.rint(ry + piv[1]).astype(int) - org[1]; ok = (ix >= 0) & (ix < w) & (iy >= 0) & (iy < h)
    out = np.zeros((y1 - y0, x1 - x0, 4), np.uint8); out[ok] = arr[iy[ok], ix[ok]]; return out, (x0, y0)
def _moves(p): return bool(p) and (any(abs(v) > 1e-9 for v in p[:3]) or (len(p) > 3 and (abs(p[3] - 1) > 1e-9 or abs(p[4] - 1) > 1e-9)) or (len(p) > 5 and abs(p[5]) > 1e-9))
_BOX = {}
for _k, _L in LAYERS.items():
    _ys, _xs = np.nonzero(_L[..., 3]); _BOX[_k] = (_xs.min(), _ys.min(), _xs.max() + 1, _ys.max() + 1)
def _chain(pose, part):
    """the moves a design point of `part` goes through, the part's own first and then every parent's (each: joint, dx, dy, rot, sx, sy, shx)"""
    out = []; q = part
    while q:
        p = pose.get(q)
        if _moves(p): out.append((PIV[q], p[0], p[1], p[2], p[3] if len(p) > 3 else 1, p[4] if len(p) > 4 else 1, p[5] if len(p) > 5 else 0))
        q = PARENT.get(q)
    return out
def _apply(chain, X, Y):
    for (cx, cy), dx, dy, rot, sx, sy, shx in chain:
        a = math.radians(rot); c, s = math.cos(a), math.sin(a); u = X - cx; v = Y - cy; u = (u + shx * v) * sx; v = v * sy; X = cx + dx + u * c - v * s; Y = cy + dy + u * s + v * c
    return X, Y
_SK = {}      # the skin weights of the legs: how much of a pixel of the leg follows the shin (0 = the thigh), from where it lies along the leg
def _weights(side):
    if side in _SK: return _SK[side]
    G = LEGS[side]; k = np.array(G['knee'], float); d1 = np.array(G['knee'], float) - np.array(G['hip'], float); d2 = np.array(G['ank'], float) - np.array(G['knee'], float)
    d1 /= np.linalg.norm(d1); d2 /= np.linalg.norm(d2); n = d1 + d2; n /= np.linalg.norm(n); L = LAYERS['leg' + side]; ys, xs = np.nonzero(L[..., 3] > 0)
    t = ((xs - k[0]) * n[0] + (ys - k[1]) * n[1]) / 16.0; w = np.clip(t * .5 + .5, 0, 1); w = w * w * (3 - 2 * w)
    _SK[side] = (xs, ys, w, L[ys, xs]); return _SK[side]
def render(pose, size=(280, 240), off=(50, 36), skip=()):
    """pose: {part: (dx, dy, rot[, sx, sy[, shx]])}: how far a part is moved and turned (degrees, clockwise) about its joint (and stretched, sheared); it also follows what its parent does (a shin its thigh, an arm / the head the chest, the chest the pelvis).
    Returns an RGBA array of `size` (master pixels) with the master's picture at `off`."""
    canvas = np.zeros((size[1], size[0], 4), np.uint8)
    for k in ORDER:
        if k in skip: continue
        if k in ('legL', 'legR'):
            xs, ys, w, col = _weights(k[-1]); X = xs.astype(float); Y = ys.astype(float); t = _apply(_chain(pose, 'thigh' + k[-1]), X, Y); h = _apply(_chain(pose, 'shin' + k[-1]), X, Y)
            px = (t[0] * (1 - w) + h[0] * w) + off[0]; py = (t[1] * (1 - w) + h[1] * w) + off[1]; order = np.argsort(w, kind='stable'); H, W = canvas.shape[:2]
            sub = np.zeros((2 * H, 2 * W, 4), np.uint8)
            for dy in (0, 1):      # (every pixel goes down as a 2 x 2 block of half pixels: a turned or stretched leg has no holes, a leg that was not moved stays as it was)
                for dx in (0, 1):
                    ix = np.floor((px[order] - .25) * 2 + .5).astype(int) + dx; iy = np.floor((py[order] - .25) * 2 + .5).astype(int) + dy; ok = (ix >= 0) & (ix < 2 * W) & (iy >= 0) & (iy < 2 * H); sub[iy[ok], ix[ok]] = col[order][ok]
            cell = sub.reshape(H, 2, W, 2, 4); fill = cell[:, 0, :, 0]; res = fill.copy()
            for a_, b_ in ((0, 1), (1, 0), (1, 1)):
                alt = cell[:, a_, :, b_]; miss = res[..., 3] == 0; res[miss] = alt[miss]
            m = res[..., 3] > 0; canvas[m] = res[m]; continue
        x0, y0, x1, y1 = _BOX[k]; arr = LAYERS[k][y0:y1, x0:x1]; org = (off[0] + x0, off[1] + y0); q = k
        while q:
            p = pose.get(q)
            if _moves(p): arr, org = _xform(arr, org, (PIV[q][0] + off[0], PIV[q][1] + off[1]), p[0], p[1], p[2], *(p[3:6] if len(p) > 3 else ()))
            q = PARENT.get(q)
        h, w = arr.shape[:2]; cx0, cy0 = max(org[0], 0), max(org[1], 0); cx1, cy1 = min(org[0] + w, size[0]), min(org[1] + h, size[1])
        if cx1 <= cx0 or cy1 <= cy0: continue
        sub = arr[cy0 - org[1]:cy1 - org[1], cx0 - org[0]:cx1 - org[0]]; m = sub[..., 3] > 0; dst = canvas[cy0:cy1, cx0:cx1]; dst[m] = sub[m]
    return canvas

# ---------------------------------------------------------------- legs: where is the foot -> the angles
LEGS = {'R': dict(hip=(152, 96), knee=(172, 124), ank=(156, 153), t='thighR', s='shinR', f='footR', out=1), 'L': dict(hip=(64, 92), knee=(47, 126), ank=(38, 152), t='thighL', s='shinL', f='footL', out=-1)}
FOOT0 = {'R': LEGS['R']['ank'], 'L': LEGS['L']['ank']}      # (where the ankles are in the design)
def _ang(p, q): return math.degrees(math.atan2(q[1] - p[1], q[0] - p[0]))
def _rot(p, c, deg):
    a = math.radians(deg); X, Y = p[0] - c[0], p[1] - c[1]; return (c[0] + X * math.cos(a) - Y * math.sin(a), c[1] + X * math.sin(a) + Y * math.cos(a))
REST = {}      # (the angles the solver gives for the design's own pose: taken off, so that the design's feet are exactly no turn)
def leg(side, foot, pel=(0, 0, 0), toe=0, bend=None, _raw=False):
    """the pose entries (thigh, shin, foot) of a leg whose ankle is at `foot` (master coordinates, world) when the pelvis is moved as given (dx, dy, rot); bend: +1 the knee points outward (away from the body), -1 inward;
    toe: the shoe's angle in the world (degrees, clockwise, 0 = as in the design). A foot that cannot be reached is brought as near as the leg allows. Returns the entries, the hip and the knee."""
    G = LEGS[side]; bend = G['out'] if bend is None else bend
    hip = _rot(G['hip'], PIV['pelvis'], pel[2]); hip = (hip[0] + pel[0], hip[1] + pel[1])
    L1 = math.dist(G['hip'], G['knee']); L2 = math.dist(G['knee'], G['ank']); d = math.dist(hip, foot); d = max(abs(L1 - L2) + .5, min(d, L1 + L2 - .5))
    a = _ang(hip, foot); cosb = max(-1, min(1, (L1 * L1 + d * d - L2 * L2) / (2 * L1 * d))); b = math.degrees(math.acos(cosb))
    k1 = (hip[0] + L1 * math.cos(math.radians(a + b)), hip[1] + L1 * math.sin(math.radians(a + b))); k2 = (hip[0] + L1 * math.cos(math.radians(a - b)), hip[1] + L1 * math.sin(math.radians(a - b)))
    cx = (hip[0] + foot[0]) / 2; knee = max((k1, k2), key=lambda k: (k[0] - cx) * bend)      # (the knee on the outer side)
    thigh_w = _ang(hip, knee) - _ang(G['hip'], G['knee']); shin_w = _ang(knee, foot) - _ang(G['knee'], G['ank'])
    r = (thigh_w - pel[2], shin_w - thigh_w, toe - shin_w)
    if _raw: return r, hip, knee
    r0 = REST[side]; return {G['t']: (0, 0, r[0] - r0[0]), G['s']: (0, 0, r[1] - r0[1]), G['f']: (0, 0, r[2] - r0[2])}, hip, knee
for _s in 'RL': REST[_s] = leg(_s, FOOT0[_s], (0, 0, 0), 0, None, True)[0]
def feet(pose, frontfoot, backfoot, pel=(0, 0, 0), ftoe=0, btoe=0, fbend=None, bbend=None):
    """fills `pose` with both legs for the given feet (and the pelvis); returns the two knees"""
    pr, _, kr = leg('R', frontfoot, pel, ftoe, fbend); pl, _, kl = leg('L', backfoot, pel, btoe, bbend); pose.update(pr); pose.update(pl); pose['pelvis'] = pel; return kr, kl

# ---------------------------------------------------------------- the game's picture: 64 x 64 pixels made out of the master-size canvas
SCALE = 52 / MH                 # master pixels -> game pixels (he is 52 px high in his stance: the master's 172)
CX, GROUND = 32, 61             # the game column of the middle of the picture and the row of the soles (the outline is the row after)
HX, SOLE = 91, 171              # (the master column that goes to the game column CX and the master row of the soles)
def _lum(c): return (int(c[0]) + int(c[1]) + int(c[2])) / 3
def _cls(c):      # which kind of material a colour of the design is: O outline, F a thin feature (face lines, belt, the hair's shine), S skin, L light (fur), D dark (jeans, jacket, hair)
    if c == OUTLINE: return 'O'
    if c in FEATURE: return 'F'
    l = _lum(c)
    if c[0] > c[2] + 25: return 'S'
    return 'L' if l >= 115 else 'D'
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

def cls(c):      # which kind of material a colour of the design is: O outline, F a thin feature (face lines, belt, the hair's shine), S skin, L light (fur), D dark (jeans, jacket, hair)
    c = tuple(int(v) for v in c[:3])
    if c == OUTLINE: return 'O'
    if c in FEATURE: return 'F'
    if c[0] > c[2] + 25: return 'S'
    return 'L' if _lum(c) >= 115 else 'D'
def calm(frames, loop):
    """takes the one-picture flicker out of a row of 64 x 64 pictures: a pixel that has another shade of the same material in this picture than in the one before AND the one after (the same shade in both) gets that shade
    (the shading of a moving part flips a little as it moves by a part of a pixel; a limb that really passes through a pixel changes the material or the edge, and is left alone)"""
    n = len(frames); out = [f.copy() for f in frames]
    for i in range(n):
        if not loop and (i == 0 or i == n - 1): continue
        p, c, q = frames[i - 1], frames[i], frames[(i + 1) % n]
        m = (p[..., 3] > 0) & (c[..., 3] > 0) & (q[..., 3] > 0) & (p[..., :3] == q[..., :3]).all(axis=2) & (c[..., :3] != p[..., :3]).any(axis=2)
        for y, x in zip(*np.nonzero(m)):
            if cls(c[y, x]) == cls(p[y, x]) and cls(p[y, x]) in ('D', 'S', 'L'): out[i][y, x, :3] = p[y, x, :3]
    return out
