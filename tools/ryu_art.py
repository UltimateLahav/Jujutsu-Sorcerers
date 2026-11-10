#!/usr/bin/env python3
"""python3 ryu_art.py [--preview DIR] -> ryu_sheet.png + ryu_sheet.json: RYU ISHIGORI's sprite sheet for the game: 64 x 64 pictures, 15 to an animation, one animation to a row (ROWS), facing right.
Every picture is the DESIGN the user chose (tools/ryu_src/master.png) put together again in another pose with tools/ryu_parts.py: the head, the two arms (a sleeve, a fur cuff and a hand each), the torso with the open jacket,
and the legs are turned, stretched and moved about their joints, and the whole is made small (52 px high in his stance). Fast limbs leave ACTION LINES, and the middle of the dash is smudged.
The idle is the design itself, breathing."""
import json, math, os, sys
import numpy as np
from PIL import Image
import ryu_parts as rp
from yuji_art import kv

HERE = os.path.dirname(os.path.abspath(__file__))
F0, B0 = rp.FOOT0['R'], rp.FOOT0['L']      # the ankles of the design: the front foot and the back one (master coordinates)
HAND_A, HAND_B = (172, 14), (173, 50)      # the tips of the two cuffs in the design (where the fists are)
LINE, LINE2 = (244, 244, 248), (150, 178, 236)      # the white and the light blue of the action lines

def sm(t): t = max(0.0, min(1.0, t)); return t * t * (3 - 2 * t)
def mkpose(T):
    """T: the picture's numbers {channel: value}; channels: tr torso (dx, dy, rot), hd head, A / B arms (dx, dy, rot, sx, sy), F / K front and back ankle (x, y), ft / bt the shoes' angles, g the shift in the cell (px).
    Returns the pose and the shift."""
    g = lambda c, d: T.get(c, d)
    tr = g('tr', (0, 0, 0)); pose = {'head': g('hd', (0, 0, 0)), 'armA': g('A', (0, 0, 0, 1, 1)), 'armB': g('B', (0, 0, 0, 1, 1))}
    rp.feet(pose, g('F', F0), g('K', B0), tr, g('ft', 0), g('bt', 0)); return pose, g('g', (0, 0))

# ---------------------------------------------------------------- where things are (for the action lines)
def locate(pose, part, p):
    """the world position (master coordinates) of the design's point p of `part` in the pose"""
    q = part; x, y = p
    while q:
        t = pose.get(q)
        if rp._moves(t):
            sx, sy = (t[3], t[4]) if len(t) > 3 else (1, 1); cx, cy = rp.PIV[q]; X, Y = (x - cx) * sx, (y - cy) * sy; a = math.radians(t[2]); c, s = math.cos(a), math.sin(a)
            x, y = cx + X * c - Y * s + t[0], cy + X * s + Y * c + t[1]
        q = rp.PARENT.get(q)
    return (x, y)
def gxy(p, gs):      # master -> game pixels
    return (rp.CX + gs[0] + (p[0] - rp.HX) * rp.SCALE, rp.GROUND + gs[1] + 1 - (rp.SOLE + 1 - p[1]) * rp.SCALE)

# ---------------------------------------------------------------- action lines and the smudge of the dash
def put(a, x, y, c, over=True):
    x, y = int(round(x)), int(round(y))
    if 0 <= x < 64 and 0 <= y < 64 and (over or a[y, x, 3] == 0): a[y, x] = (*c, 255)
def lines(a, pts, seed, length=7, n=3, spread=3, over=False, col=None):
    """n streaks trailing behind each moving point of pts = [(x, y, vx, vy)] (game px, velocity in px per picture): they start at the point, run against the movement and are white at the head, light blue at the tail"""
    for k, (x, y, vx, vy) in enumerate(pts):
        sp = math.hypot(vx, vy)
        if sp < 1.2: continue
        ux, uy = -vx / sp, -vy / sp; L = min(14, length * min(2.2, sp / 3.0) + 2)
        for j in range(n):
            off = (j - (n - 1) / 2) * spread + (((seed * 7 + k * 3 + j * 5) % 3) - 1) * .6; ox, oy = x + (-uy) * off, y + ux * off; ln = L * (.65 + .35 * (((seed + j * 3 + k) % 4) / 3))
            for t in range(int(ln)):
                put(a, ox + ux * (t + 1), oy + uy * (t + 1), col or (LINE if t < ln * .6 else LINE2), over)
def smudge(a, k, sgn=1):
    """the body smeared sideways (against the dash): every solid pixel leaves a fading trail of its own colour, bluer and lighter with the distance"""
    out = a.copy(); H, W = a.shape[:2]
    for y in range(H):
        for x in range(W):
            if a[y, x, 3] and tuple(a[y, x, :3]) != rp.OUTLINE:
                c = a[y, x, :3].astype(float)
                for d in range(1, k + 1):
                    xx = x - sgn * d
                    if 0 <= xx < W and out[y, xx, 3] == 0:
                        t = d / (k + 1); out[y, xx] = (*[int(c[j] * (1 - .55 * t) + LINE2[j] * .55 * t) for j in range(3)], 255)
    return out

# ---------------------------------------------------------------- the animations (15 pictures each); each returns the pose tables of the animation
def foot(p, base, S, lift, toeup=0):
    p %= 1.0
    if p < .5: return (base[0] + S * (1 - 4 * p), base[1]), 0
    q = (p - .5) * 2; return (base[0] - S + 2 * S * sm(q), base[1] - lift * math.sin(math.pi * q)), -toeup * math.sin(math.pi * q)

def a_idle(i):
    ph = 2 * math.pi * i / 15; b = .5 - .5 * math.cos(ph)
    return dict(
        tr=(0, 3.5 * b, 0), hd=(0, -1.2 * b, 1.2 * math.sin(ph)), A=(0, 1.8 * math.sin(ph + .6), 1.6 * math.sin(ph + .6), 1, 1), B=(0, 2.0 * math.sin(ph + 1.1), -1.8 * math.sin(ph + 1.1), 1, 1), F=F0, K=B0)
def a_walk(i, back=False):
    p = (14 - i) / 15 if back else i / 15; S = 16 if back else 20; lf, tf = foot(p, F0, S, 15, 14); lb, tb = foot(p + .5, B0, S, 15, 14)
    bob = 3.2 * math.cos(4 * math.pi * p); ph = 4 * math.pi * p
    return dict(tr=(0, bob + 1, -3.5 if back else 3), hd=(0, -bob * .3, 0), A=(0, 2 * math.sin(ph), -2 * math.sin(ph), 1, 1), B=(0, -2 * math.sin(ph), 2 * math.sin(ph), 1, 1), F=lf, K=lb, ft=tf, bt=tb)
def a_jump(i):
    T = dict(
        tr={0: (0, 0, 0), 1: (0, 12, 3), 2: (0, 18, 5), 3: (0, 4, -2), 4: (0, -2, -3), 5: (0, -4, -4), 6: (0, -6, -4), 7: (0, -8, -3), 8: (0, -8, -2), 9: (0, -6, 0), 10: (0, -2, 2), 11: (0, 2, 3), 12: (0, 12, 4), 13: (0, 16, 4), 14: (0, 6, 1)},
        A={0: (0, 0, 0, 1, 1), 2: (-6, 12, 16, .8, 1), 3: (0, -4, -26, 1, 1), 5: (0, -14, -36, 1, 1), 8: (0, -12, -30, 1, 1), 11: (0, 2, -8, 1, 1), 13: (-4, 12, 12, .8, 1), 14: (0, 0, 0, 1, 1)},
        B={0: (0, 0, 0, 1, 1), 2: (-8, 10, 14, .8, 1), 3: (0, -4, -22, 1, 1), 5: (0, -12, -30, 1, 1), 8: (0, -10, -26, 1, 1), 11: (0, 2, -8, 1, 1), 13: (-6, 10, 10, .8, 1), 14: (0, 0, 0, 1, 1)},
        F={0: F0, 2: F0, 3: (F0[0] - 2, F0[1]), 4: (F0[0] - 8, F0[1] - 14), 5: (150, 128), 6: (146, 118), 8: (146, 116), 9: (150, 124), 10: (156, 138), 11: (158, 148), 12: F0, 14: F0},
        K={0: B0, 2: B0, 3: (B0[0] + 2, B0[1]), 4: (B0[0] + 12, B0[1] - 14), 5: (66, 130), 6: (72, 120), 8: (72, 118), 9: (66, 126), 10: (52, 140), 11: (42, 148), 12: B0, 14: B0},
        ft={0: 0, 5: 18, 8: 22, 11: 6, 12: 0}, bt={0: 0, 5: 14, 8: 18, 11: 6, 12: 0})
    return {c: kv(v, i) if isinstance(v, dict) else v for c, v in T.items()}
def crouch_t(i):      # the crouch: the hips drop, the feet stay, the legs fold and the knees go out
    t = sm(i / 14)
    return dict(tr=(2 * t, 30 * t, 4 * t), hd=(1 * t, 3 * t, 0), A=(0, 14 * t, -6 * t, 1, 1), B=(-2 * t, 16 * t, -4 * t, 1, 1), F=F0, K=B0)
def a_cdown(i): return crouch_t(i)
def a_cidle(i):
    ph = 2 * math.pi * i / 15; b = .5 - .5 * math.cos(ph)
    return dict(tr=(2, 30 + 2.5 * b, 4), hd=(1, 3 - .8 * b, 1.2 * math.sin(ph)), A=(0, 14 + 1.6 * math.sin(ph + .6), -6 + 1.4 * math.sin(ph + .6), 1, 1), B=(-2, 16 + 1.8 * math.sin(ph + 1.1), -4 - 1.5 * math.sin(ph + 1.1), 1, 1), F=F0, K=B0)
def a_cwalk(i):
    p = i / 15; lf, tf = foot(p, F0, 10, 9, 8); lb, tb = foot(p + .5, B0, 10, 9, 8); bob = 2 * math.cos(4 * math.pi * p); ph = 4 * math.pi * p
    return dict(tr=(2, 30 + bob, 4), hd=(1, 3, 0), A=(0, 14 + math.sin(ph), -6, 1, 1), B=(-2, 16 - math.sin(ph), -4, 1, 1), F=lf, K=lb, ft=tf, bt=tb)
def a_block(i):
    r = sm(i / 6); ph = 2 * math.pi * (i - 6) / 9; sw = math.sin(ph) if i >= 6 else 0
    return dict(tr=(2 * r, 7 * r + .8 * sw, 5 * r), hd=(2 * r, 4 * r, 0), A=(4 * r, 12 * r, -10 * r, 1 - .45 * r, 1), B=(-6 * r, -12 * r + 1.2 * sw, -16 * r, 1 - .38 * r, 1), F=F0, K=B0)
def a_dash(i):
    t = {0: 0, 1: .3, 2: .7, 3: 1, 11: 1, 12: .6, 13: .25, 14: 0}; r = kv(t, i)
    return dict(tr=(10 * r, 6 * r, 15 * r), hd=(0, 0, 2 * r), A=(-12 * r, 6 * r, 22 * r, 1, 1), B=(-10 * r, 4 * r, 16 * r, 1, 1), F=(F0[0] + 24 * r, F0[1] - 6 * r * (1 if 2 <= i <= 11 else 0)), K=(B0[0] + 6 * r, B0[1] - 12 * r * (1 if 3 <= i <= 11 else 0)), ft=-18 * r, bt=30 * r, g=(0, 0))
def a_dashb(i):
    t = {0: 0, 1: .3, 2: .7, 3: 1, 11: 1, 12: .6, 13: .25, 14: 0}; r = kv(t, i)
    return dict(tr=(-8 * r, 4 * r, -12 * r), hd=(0, 0, -2 * r), A=(6 * r, 0, -6 * r, 1, 1), B=(4 * r, 0, -4 * r, 1, 1), F=(F0[0] - 20 * r, F0[1] - 4 * r), K=(B0[0] - 14 * r, B0[1] - 8 * r), ft=10 * r, bt=-10 * r)
def hook_t(i, arm):      # a hook: the arm is cocked back (1-4), the body turns and the arm swings round and forward (5-7, the impact is 7), and it comes back
    T = {'tr': {0: (0, 0, 0), 2: (-4, 2, -7), 4: (-6, 3, -9), 5: (2, 2, 6), 7: (8, 2, 15), 9: (6, 3, 10), 12: (1, 1, 2), 14: (0, 0, 0)},
         'hd': {0: (0, 0, 0), 4: (-2, 0, -4), 7: (3, 1, 5), 14: (0, 0, 0)},
         'F': {0: F0, 4: (F0[0] - 4, F0[1]), 6: (F0[0] + 8, F0[1]), 8: (F0[0] + 14, F0[1]), 11: (F0[0] + 6, F0[1]), 14: F0}, 'K': {0: B0, 5: (B0[0] + 2, B0[1]), 8: (B0[0] + 10, B0[1]), 12: (B0[0] + 4, B0[1]), 14: B0}}
    cock = (-14, 2, -34, .62, 1) if arm == 'A' else (-16, -8, -42, .6, 1); swing = (14, 0, 6, 1.32, 1) if arm == 'A' else (14, -14, 4, 1.32, 1)
    T[arm] = {0: (0, 0, 0, 1, 1), 2: (-6, 2, -14, .86, 1), 4: cock, 5: (0, 0, -10, 1.1, 1), 7: swing, 9: (8, 0, 4, 1.2, 1), 12: (2, 0, 1, 1.05, 1), 14: (0, 0, 0, 1, 1)}
    oth = 'B' if arm == 'A' else 'A'; T[oth] = {0: (0, 0, 0, 1, 1), 4: (-4, 6, -16, .8, 1), 7: (-2, 8, -10, .75, 1), 14: (0, 0, 0, 1, 1)}
    return {c: kv(v, i) if isinstance(v, dict) else v for c, v in T.items()}
def a_hookL(i): return hook_t(i, 'B')
def a_hookR(i): return hook_t(i, 'A')
def a_kickup(i):      # the front leg: the knee comes up (2-3), the foot whips up and forward (4-7, the impact is 6), and comes down
    Fp = {0: F0, 1: (F0[0] - 4, F0[1] - 8), 2: (F0[0] + 2, F0[1] - 22), 3: (168, 120), 4: (180, 104), 5: (192, 88), 6: (200, 76), 7: (204, 70), 8: (198, 82), 9: (186, 102), 10: (172, 126), 11: (162, 144), 12: F0, 14: F0}
    T = dict(tr={0: (0, 0, 0), 2: (-4, -2, -8), 4: (-8, -4, -12), 7: (-6, -6, -14), 10: (-2, -2, -6), 12: (0, 0, -1), 14: (0, 0, 0)}, hd={0: (0, 0, 0), 5: (0, 0, 8), 14: (0, 0, 0)},
             A={0: (0, 0, 0, 1, 1), 3: (-8, 10, 20, .8, 1), 7: (-10, 14, 26, .75, 1), 12: (0, 0, 2, 1, 1), 14: (0, 0, 0, 1, 1)}, B={0: (0, 0, 0, 1, 1), 3: (-12, -8, -26, .8, 1), 7: (-16, -12, -34, .7, 1), 12: (0, 0, -2, 1, 1), 14: (0, 0, 0, 1, 1)},
             F=Fp, K={0: B0, 3: (B0[0] - 4, B0[1]), 8: (B0[0] - 6, B0[1]), 12: B0, 14: B0}, ft={0: 0, 3: -20, 6: -52, 8: -40, 10: -10, 12: 0}, bt={0: 0, 4: 12, 9: 12, 12: 0})
    return {c: kv(v, i) if isinstance(v, dict) else v for c, v in T.items()}
def a_jpunch(i):      # a jump and a punch forward: crouch (0-2), the arm cocked back as he leaps (3-5), the punch (6-8, the impact is 7), the fall (9-11) and the landing (12-14)
    T = dict(
        tr={0: (0, 0, 0), 2: (0, 14, 4), 3: (-2, 2, -8), 5: (-4, -4, -10), 6: (4, -6, 8), 7: (12, -6, 18), 9: (8, -4, 12), 11: (2, 2, 4), 12: (0, 12, 5), 13: (0, 10, 3), 14: (0, 0, 0)}, hd={0: (0, 0, 0), 7: (3, 1, 6), 14: (0, 0, 0)},
        A={0: (0, 0, 0, 1, 1), 2: (-4, 10, 14, .8, 1), 4: (-18, 6, -40, .6, 1), 5: (-18, 4, -40, .6, 1), 7: (22, 6, 6, 1.5, 1), 9: (14, 6, 12, 1.35, 1), 11: (2, 6, 14, 1, 1), 13: (-2, 10, 10, .85, 1), 14: (0, 0, 0, 1, 1)},
        B={0: (0, 0, 0, 1, 1), 4: (-10, 6, -18, .8, 1), 7: (-6, 12, 16, .7, 1), 11: (0, 6, 12, 1, 1), 14: (0, 0, 0, 1, 1)},
        F={0: F0, 2: F0, 4: (150, 128), 5: (146, 122), 7: (160, 124), 9: (166, 130), 11: (158, 146), 12: F0, 14: F0}, K={0: B0, 2: B0, 4: (66, 130), 5: (70, 124), 7: (48, 132), 9: (44, 138), 11: (40, 148), 12: B0, 14: B0}, ft={0: 0, 5: 18, 9: 8, 12: 0}, bt={0: 0, 5: 14, 12: 0})
    return {c: kv(v, i) if isinstance(v, dict) else v for c, v in T.items()}
def a_cleg(i):      # crouched, the front leg shoots out along the floor into the enemy's legs (the impact is 6)
    Fp = {0: F0, 1: (F0[0] - 8, F0[1] - 10), 2: (F0[0] - 4, F0[1] - 14), 3: (172, 150), 4: (196, 150), 5: (214, 150), 6: (224, 150), 7: (226, 150), 8: (212, 150), 10: (186, 150), 12: (160, 152), 14: F0}
    T = dict(tr={0: (2, 30, 4), 3: (-4, 32, -4), 6: (-12, 34, -10), 8: (-10, 34, -8), 12: (0, 31, 2), 14: (2, 30, 4)}, hd={0: (1, 3, 0), 6: (-2, 2, 6), 14: (1, 3, 0)},
             A={0: (0, 14, -6, 1, 1), 3: (-6, 14, 16, .8, 1), 7: (-10, 14, 24, .75, 1), 14: (0, 14, -6, 1, 1)}, B={0: (-2, 16, -4, 1, 1), 3: (-8, 4, -22, .8, 1), 7: (-14, 0, -34, .7, 1), 14: (-2, 16, -4, 1, 1)},
             F=Fp, K={0: B0, 5: (B0[0] - 6, B0[1]), 9: (B0[0] - 6, B0[1]), 14: B0}, ft={0: 0, 3: -8, 6: -4, 10: 0}, bt={0: 0, 6: 8, 12: 0})
    return {c: kv(v, i) if isinstance(v, dict) else v for c, v in T.items()}
def a_slam(i):      # in the air: both fists up over his head (1-4), then the whole body drops into a hammer blow (the impact is 6); the legs are tucked
    T = dict(
        tr={0: (0, -2, 0), 2: (-6, -4, -12), 4: (-8, -4, -16), 5: (2, 0, 14), 6: (12, 4, 30), 9: (10, 4, 26), 12: (4, 0, 10), 14: (0, -2, 0)}, hd={0: (0, 0, 0), 4: (-2, -2, -6), 6: (4, 4, 12), 14: (0, 0, 0)},
        A={0: (0, 0, 0, 1, 1), 2: (-8, -8, -52, .75, 1), 4: (-10, -12, -72, .7, 1), 5: (0, 0, -10, .9, 1), 6: (14, 14, 56, 1.15, 1), 9: (12, 14, 50, 1.1, 1), 12: (4, 6, 20, 1, 1), 14: (0, 0, 0, 1, 1)},
        B={0: (0, 0, 0, 1, 1), 2: (-10, -10, -46, .75, 1), 4: (-12, -14, -62, .7, 1), 5: (0, 4, -6, .9, 1), 6: (14, 16, 50, 1.15, 1), 9: (12, 16, 46, 1.1, 1), 12: (4, 6, 18, 1, 1), 14: (0, 0, 0, 1, 1)},
        F={0: (150, 124), 4: (148, 116), 6: (160, 120), 9: (164, 128), 12: (158, 140), 14: (150, 124)}, K={0: (66, 126), 4: (72, 118), 6: (54, 126), 9: (48, 132), 12: (46, 140), 14: (66, 126)}, ft={0: 16, 6: 20, 14: 16}, bt={0: 12, 6: 14, 14: 12})
    return {c: kv(v, i) if isinstance(v, dict) else v for c, v in T.items()}
def a_hard(i):      # walking forward + ATTACK: a hard straight punch: the weight goes back (1-4), he lunges and drives the big cuff straight out (the impact is 7), and it comes back
    T = dict(
        tr={0: (0, 0, 0), 3: (-8, 3, -10), 5: (0, 3, 4), 7: (14, 4, 20), 10: (10, 4, 14), 13: (2, 1, 3), 14: (0, 0, 0)}, hd={0: (0, 0, 0), 3: (-3, 0, -5), 7: (4, 1, 8), 14: (0, 0, 0)},
        B={0: (0, 0, 0, 1, 1), 3: (-14, 6, -18, .62, 1), 5: (-4, 2, -6, .9, 1), 7: (24, -4, 0, 1.6, 1), 10: (18, -2, 2, 1.45, 1), 13: (2, 0, 1, 1.05, 1), 14: (0, 0, 0, 1, 1)},
        A={0: (0, 0, 0, 1, 1), 3: (-6, 8, -20, .8, 1), 7: (-6, 12, 18, .7, 1), 14: (0, 0, 0, 1, 1)},
        F={0: F0, 3: (F0[0] - 6, F0[1]), 5: (F0[0] + 2, F0[1] - 6), 7: (F0[0] + 22, F0[1]), 11: (F0[0] + 14, F0[1]), 14: F0}, K={0: B0, 5: (B0[0] + 4, B0[1]), 7: (B0[0] + 16, B0[1]), 11: (B0[0] + 8, B0[1]), 14: B0}, ft={0: 0, 5: -10, 7: 0}, bt={0: 0, 7: 10, 12: 0})
    return {c: kv(v, i) if isinstance(v, dict) else v for c, v in T.items()}
def a_front(i):      # walking back + ATTACK: a front kick forward at the belly (the knee comes up, the sole drives out: the impact is 6)
    Fp = {0: F0, 1: (F0[0] - 4, F0[1] - 12), 2: (F0[0] + 2, F0[1] - 30), 3: (166, 112), 4: (188, 102), 5: (210, 100), 6: (222, 100), 7: (224, 100), 8: (208, 106), 9: (188, 118), 10: (170, 136), 11: (160, 148), 12: F0, 14: F0}
    T = dict(tr={0: (0, 0, 0), 2: (-6, -2, -10), 6: (-14, -2, -16), 9: (-8, -2, -10), 12: (0, 0, -1), 14: (0, 0, 0)}, hd={0: (0, 0, 0), 6: (0, 0, 8), 14: (0, 0, 0)},
             A={0: (0, 0, 0, 1, 1), 3: (-6, 10, 18, .8, 1), 7: (-8, 14, 26, .72, 1), 12: (0, 0, 2, 1, 1), 14: (0, 0, 0, 1, 1)}, B={0: (0, 0, 0, 1, 1), 3: (-12, -6, -22, .8, 1), 7: (-16, -10, -30, .7, 1), 12: (0, 0, -2, 1, 1), 14: (0, 0, 0, 1, 1)},
             F=Fp, K={0: B0, 3: (B0[0] - 6, B0[1]), 9: (B0[0] - 8, B0[1]), 12: B0, 14: B0}, ft={0: 0, 3: -18, 6: -72, 9: -30, 12: 0}, bt={0: 0, 4: 10, 10: 10, 12: 0})
    return {c: kv(v, i) if isinstance(v, dict) else v for c, v in T.items()}

# the rows of the sheet: name, the function of the picture's number, the effector points whose speed makes action lines (part, design point, 'foot' for the front ankle), smudge profile
ROWS = [('frames', a_idle, []), ('walk', a_walk, []), ('wback', lambda i: a_walk(i, True), []), ('jump', a_jump, []), ('cr', a_cdown, []), ('ci', a_cidle, []), ('cwk', a_cwalk, []), ('bl', a_block, []),
        ('dg', a_dash, ['body']), ('db', a_dashb, ['body']), ('a0', a_hookL, [('armB', HAND_B)]), ('a1', a_hookR, [('armA', HAND_A)]), ('a2', a_kickup, ['foot']), ('a3', a_jpunch, [('armA', HAND_A)]),
        ('cp', a_cleg, ['foot']), ('as', a_slam, [('armA', HAND_A), ('armB', HAND_B)]), ('hp', a_hard, [('armB', HAND_B)]), ('fk', a_front, ['foot'])]

def build_row(name, fn, eff):
    poses = []; gs = []
    for i in range(15):
        pose, g = mkpose(fn(i)); poses.append(pose); gs.append(g)
    ext = []      # how far each picture's figure reaches in the cell (game px) when it is not shifted
    for pose in poses:
        m = rp.downscale(rp.render(pose), dx=0, dy=0)[..., 3] > 0; xs = np.where(m.any(axis=0))[0]; ext.append((xs.min(), xs.max()) if len(xs) else (32, 32))
    need = [min(0, 59 - e[1]) + max(0, 4 - e[0]) + int(round(gs[i][0])) for i, e in enumerate(ext)]      # (a negative number moves him left, a positive one right)
    near = [min(need[max(0, i - 2):i + 3]) if min(need) < 0 else max(need[max(0, i - 2):i + 3]) for i in range(15)]      # (the shift of a picture also holds for its neighbours ...)
    sh = [int(round(sum(near[max(0, i - 1):i + 2]) / len(near[max(0, i - 1):i + 2]))) for i in range(15)]      # (... and is softened, so that nothing jumps from one picture to the next, but never less than the picture needs)
    sh = [min(sh[i], need[i]) if min(need) < 0 else max(sh[i], need[i]) for i in range(15)]
    gs = [(sh[i], gs[i][1]) for i in range(15)]
    pos = []      # the effectors' positions picture by picture (game px)
    for i, pose in enumerate(poses):
        pts = []
        for e in eff:
            if e == 'foot': pts.append(gxy(fn(i).get('F', F0), gs[i]))
            elif e == 'body': pts.append(gxy((rp.HX, 100), gs[i]))
            else: pts.append(gxy(locate(pose, *e), gs[i]))
        pos.append(pts)
    frames = []
    for i, pose in enumerate(poses):
        a = rp.frame(pose, int(round(gs[i][0])), int(round(gs[i][1])))
        if eff:
            if name in ('dg', 'db'):
                r = max(0.0, 1 - abs(i - 7) / 4.5)
                if r > 0: a = smudge(a, int(2 + 9 * r), 1 if name == 'dg' else -1)
                if r > .25:
                    sgn = 1 if name == 'dg' else -1; pts = [(14 + (j % 3) * 9 - sgn * 4 * r + (3 if name == 'db' else 0), 20 + j * 6 + (i % 2), sgn * 8 * r, 0) for j in range(7)]
                    lines(a, pts, i, length=8, n=1, spread=0, over=False)
            else:
                prev = pos[i - 1] if i else pos[i]; vel = [(p[0] - q[0], p[1] - q[1]) for p, q in zip(pos[i], prev)]
                lines(a, [(p[0], p[1], v[0], v[1]) for p, v in zip(pos[i], vel)], i, n=3, spread=2.6, over=True)
        frames.append(a)
    return frames

if __name__ == '__main__':
    only = [a for a in sys.argv[1:] if not a.startswith('--') and a in [r[0] for r in ROWS]]
    rows = [r for r in ROWS if not only or r[0] in only]; sheet = Image.new('RGBA', (15 * 64, len(ROWS) * 64), (0, 0, 0, 0)); meta = {}
    if only and os.path.exists(os.path.join(HERE, 'ryu_sheet.png')): sheet = Image.open(os.path.join(HERE, 'ryu_sheet.png')).convert('RGBA')      # (a partial rebuild keeps the other rows)
    for r, (name, fn, eff) in enumerate(ROWS):
        if only and name not in only: continue
        fr = build_row(name, fn, eff)
        for i, a in enumerate(fr): sheet.paste(Image.fromarray(a, 'RGBA'), (i * 64, r * 64))
    sheet.save(os.path.join(HERE, 'ryu_sheet.png'))
    if '--preview' in sys.argv:
        d = sys.argv[sys.argv.index('--preview') + 1]; os.makedirs(d, exist_ok=True)
        for r, (name, fn, eff) in enumerate(ROWS):
            if only and name not in only: continue
            row = sheet.crop((0, r * 64, 15 * 64, r * 64 + 64)); bg = Image.new('RGBA', row.size, (58, 62, 92, 255)); bg.alpha_composite(row); bg.resize((row.width * 2, row.height * 2), Image.NEAREST).save(os.path.join(d, 'row_%s.png' % name))
    print('ryu_sheet.png', sheet.size)
