#!/usr/bin/env python3
"""python3 ryu_art.py [row names] [--preview DIR] -> ryu_sheet.png: RYU ISHIGORI's sprite sheet for the game: 64 x 64 pictures, 15 to an animation, one animation to a row (ROWS), facing right.
Every picture is the LOOK the user chose (tools/ryu_src/master.png: face, hair, fur, jacket, belt, jeans, boots) put together again in a NEW pose by tools/ryu_parts.py. A pose (see mkpose) says where the pelvis is, how the chest, head and arms are turned
and where the two ankles are (the legs are solved from them); the hair, the collar fur, the jacket with its tail and the fur cuffs then SWING ON THEIR OWN (swing(): a spring that is pushed by how the part they hang on moves), and fast limbs leave ACTION LINES.
He is a heavy brawler who mixes styles: boxer's bounce, stomping walk, one knee down to crouch, high guard, a shoulder-charge dash, boxing hooks, a capoeira rising kick, an anime flying punch, a Muay Thai low kick and push kick,
a pro-wrestling slam and a karate straight punch; v1.163 adds an uppercut and an elbow (the BLUE COMBO), a blue punch, a dive punch and a dash kick (ROWS_V1163). `python3 -B ryu_art.py idle walk` rebuilds only those rows (the others stay as they are in the sheet)."""
import json, math, os, sys
import numpy as np
from PIL import Image
import ryu_parts as rp

HERE = os.path.dirname(os.path.abspath(__file__))
F0, B0 = rp.FOOT0['R'], rp.FOOT0['L']      # the ankles of the design: the front foot and the back one (master coordinates)
HAND_A, HAND_B = (172, 14), (173, 50)      # the tips of the two cuffs in the design (where the fists are)
LINE, LINE2 = (244, 244, 248), (150, 178, 236)      # the white and the light blue of the action lines
sin, cos, pi = math.sin, math.cos, math.pi

def sm(t): t = max(0.0, min(1.0, t)); return t * t * (3 - 2 * t)
def mix(a, b, t):
    if a is None or b is None: return b if t >= 1 else a      # (a choice such as which way a knee points does not blend: it changes at the next key)
    if isinstance(a, (tuple, list)): return tuple(mix(x, y, t) for x, y in zip(a, b))
    return a + (b - a) * t
def kv(keys, i, ease=sm):
    """keyframes {picture: value} -> the value at picture i, eased between the keys (tuples are mixed part by part)"""
    ks = sorted(keys.items())
    if i <= ks[0][0]: return ks[0][1]
    for (a, va), (b, vb) in zip(ks, ks[1:]):
        if a <= i <= b: return mix(va, vb, ease((i - a) / (b - a)))
    return ks[-1][1]
def lin(t): return t
def tup(T): return {c: (kv(v, T_i[0]) if isinstance(v, dict) else v) for c, v in T.items()}
T_i = [0]
def K(T, i):      # one picture of an animation given as {channel: {picture: value}} (a channel that is no table is the same in every picture)
    return {c: (kv(v, i) if isinstance(v, dict) else v) for c, v in T.items()}

# ---------------------------------------------------------------- a pose and where things are
def mkpose(T):
    """T: the picture's numbers {channel: value}; channels: pel pelvis (dx, dy, rot), chs chest (dx, dy, rot) about the waist, hd head, A / B arms (dx, dy, rot, sx, sy) about the shoulder, F / K front and back ankle (x, y),
    ft / bt the boots' angles, fb / kb which way the knees point (+1 out, -1 in), g the shift in the cell (px). Returns the pose."""
    g = lambda c, d: T.get(c, d)
    pose = {'chest': g('chs', (0, 0, 0)), 'head': g('hd', (0, 0, 0)), 'armA': g('A', (0, 0, 0, 1, 1)), 'armB': g('B', (0, 0, 0, 1, 1))}
    rp.feet(pose, g('F', F0), g('K', B0), g('pel', (0, 0, 0)), g('ft', 0), g('bt', 0), g('fb', None), g('kb', None)); return pose
def locate(pose, part, p):
    """the world position (master coordinates) of the design's point p of `part` in the pose"""
    q = part; x, y = p
    while q:
        t = pose.get(q)
        if rp._moves(t):
            sx, sy = (t[3], t[4]) if len(t) > 3 else (1, 1); shx = t[5] if len(t) > 5 else 0; cx, cy = rp.PIV[q]; X, Y = (x - cx), (y - cy); X = (X + shx * Y) * sx; Y = Y * sy; a = math.radians(t[2]); c, s = math.cos(a), math.sin(a)
            x, y = cx + X * c - Y * s + t[0], cy + X * s + Y * c + t[1]
        q = rp.PARENT.get(q)
    return (x, y)
def gxy(p, gs):      # master -> game pixels
    return (rp.CX + gs[0] + (p[0] - rp.HX) * rp.SCALE, rp.GROUND + gs[1] + 1 - (rp.SOLE + 1 - p[1]) * rp.SCALE)

# ---------------------------------------------------------------- the loose parts: a spring pushed by the part they hang on
SW = {      # name: (the part it hangs on, its joint (design point), the way it hangs (design), spring speed (radians a picture), damping, push from acceleration, push from speed, most it turns (degrees), strength)
 'hair': ('head', (108, 20), (0, -1), 0.95, 0.30, 1.5, 0.55, 20, 1.0),
 'collarL': ('chest', (100, 34), (-1, 0), 0.85, 0.28, 1.2, 0.50, 26, 1.0),
 'jacketO': ('chest', (100, 38), (0, 1), 0.75, 0.26, 1.35, 0.60, 17, 1.0),
 'cuffN': ('chest', (116, 50), (0, 1), 1.05, 0.30, 1.3, 0.40, 22, 1.0),
 'cuffA': ('armA', (138, 24), (1, 0), 1.05, 0.28, 1.3, 0.50, 26, 1.0),
 'cuffB': ('armB', (150, 48), (1, 0), 1.05, 0.28, 1.3, 0.50, 26, 1.0)}
def swing(poses, wv, loop, mult=1.0, sub=4):
    """works out the swing of every loose part picture by picture: the joint's own movement (and `wv`, how fast the whole body is moving through the world, master px a picture: pictures have no walking in them but the game moves him)
    pushes it; a part hangs in the direction d and turns clockwise (positive) about its joint. Returns one dict of pose entries per picture."""
    n = len(poses); out = [dict() for _ in range(n)]
    for name, (par, joint, d, w, z, ka, kvv, mx, st) in SW.items():
        pts = [locate(p, par, joint) for p in poses]
        vel = [((pts[k][0] - pts[k - 1][0]) + wv[k][0], (pts[k][1] - pts[k - 1][1]) + wv[k][1]) if (k or loop) else (wv[0][0], wv[0][1]) for k in range(n)]      # (how fast the joint moves: its own move plus the whole body's)
        acc = [(vel[k][0] - vel[k - 1][0], vel[k][1] - vel[k - 1][1]) if (k or loop) else (0, 0) for k in range(n)]
        tx, ty = -d[1], d[0]; th = 0.0; om = 0.0; res = [0.0] * n; passes = 4 if loop else 1
        for ps in range(passes):
            for k in range(n):
                drive = -ka * (acc[k][0] * tx + acc[k][1] * ty) * st * mult; eq = -kvv * (vel[k][0] * tx + vel[k][1] * ty) * st * mult; eq = mx * math.tanh(eq / mx)
                for _ in range(sub):
                    h = 1.0 / sub; alpha = drive - w * w * (th - eq) - 2 * z * w * om; om += alpha * h; th += om * h
                res[k] = mx * math.tanh(th / mx)      # (soft limit: a part never turns further than mx, and does not stick there)
        for k in range(n):
            if name == 'hair': out[k][name] = (0, 0, res[k] * .55, 1, 1, math.tan(math.radians(res[k])) * .5)
            else: out[k][name] = (0, 0, res[k])
    return out

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

# ---------------------------------------------------------------- the animations (15 pictures each); each returns the numbers of picture i (see mkpose)
def foot(p, base, S, lift, toeup=0, stomp=1.4):
    """a walking foot: p = how far through the step (0 - 1); the first half it is on the ground and slides back, the second half it swings forward: up slowly and down fast (the stomp)"""
    p %= 1.0
    if p < .5: return (base[0] + S * (1 - 4 * p), base[1]), 0
    q = (p - .5) * 2; x = base[0] - S + 2 * S * sm(q ** .85); lf = math.sin(math.pi * q ** stomp)
    return (x, base[1] - lift * lf), -toeup * lf
def dip(p, w=.09):      # the weight comes down when a foot lands (p = 0 and .5 of the step)
    d = min(abs(((p + .25) % .5) - .25), 1); return math.exp(-(d / w) ** 2)

def a_idle(i):      # BOXER'S BOUNCE: two bounces a loop on bent knees, the weight goes from one foot to the other, the fists drift, the chest breathes
    f = 2 * pi * 2 * i / 15; s = 2 * pi * i / 15; b = .5 - .5 * cos(f)
    return dict(pel=(6 * sin(s), 9.5 * b + 1.5, 3 * sin(s + .5)), chs=(1 * sin(s + 1), -2.2 * b, -3 * sin(s + .9) + 1.8 * b), hd=(0.6 * sin(s + 1.2), 1.6 * b, 3 * sin(s + 1.6) - 1.8 * b),
                A=(0, 3 * sin(f + .8), 3.5 * sin(f + .8), 1, 1), B=(0, 3 * sin(f + 2.0), -3.5 * sin(f + 2.0), 1, 1),
                F=(F0[0] + 3 * sin(s), F0[1] - 3.4 * max(0, sin(f - .4))), K=(B0[0] - 3 * sin(s), B0[1] - 3.4 * max(0, sin(f + 2.7))), ft=-12 * max(0, sin(f - .4)), bt=-12 * max(0, sin(f + 2.7)))
def a_walk(i, back=False):      # HEAVY STOMP: a foot comes up slowly and comes down hard, the whole body rocks from side to side and drops on every landing, the fists pump
    p = (14 - i) / 15 if back else i / 15; S = 17 if back else 22; L = 19 if back else 24; lf, tf = foot(p, F0, S, L, 16); lb, tb = foot(p + .5, B0, S, L, 16)
    d = dip(p); sw = sin(2 * pi * p); ph = 4 * pi * p; up = B0[1] - lb[1] > 2.5
    return dict(pel=(7 * sw * (-1 if back else 1), 3 + 7.5 * d + 1.5 * cos(ph), (-3 if back else 3) * sw + 1.5), chs=(1.2 * sw, -2 * d, (-1 if back else 1) * 4 * sw - (3 if back else 0)), hd=(0.5 * sw, 1.8 * d, -3 * sw),
                A=(0, 3.5 * sin(ph) - (4 if back else 0), -3.5 * sin(ph) + (-4 if back else 0), 1, 1), B=(0, -3.5 * sin(ph) - (4 if back else 0), 3.5 * sin(ph) + (-4 if back else 0), 1, 1), F=lf, K=lb, ft=tf, bt=tb, kb=1 if up else None)
STEPS = (0, 7)      # (the pictures of the walk on which a foot comes down: the game puffs dust and shakes the screen a hair there)

def a_jump(i):      # KNEES TUCKED: he drops and springs (0-3), the legs fold up under him while the fists stay up (4-8), they come down again (9-11) and he lands (12-14)
    T = dict(
        pel={0: (0, 2, 0), 1: (1, 10, 2), 2: (1, 17, 3), 3: (0, 8, 0), 4: (0, -1, -2), 5: (0, -3, -3), 6: (0, -3, -3), 7: (0, -2, -2), 8: (0, -2, -2), 9: (0, -1, -1), 10: (0, 0, 0), 11: (0, 3, 2), 12: (0, 13, 3), 13: (0, 17, 3), 14: (0, 4, 0)},
        chs={0: (0, 0, 0), 2: (0, 0, 8), 3: (0, -1, -3), 5: (0, -1, -7), 8: (0, 0, -4), 11: (0, 0, 2), 13: (0, 0, 8), 14: (0, 0, 0)}, hd={0: (0, 0, 0), 2: (0, 3, 5), 5: (0, -1, -4), 11: (0, 1, 3), 13: (0, 3, 6), 14: (0, 0, 0)},
        A={0: (0, 0, 0, 1, 1), 2: (-4, 10, 18, .85, 1), 4: (-2, -6, -26, 1, 1), 6: (0, -12, -34, 1, 1), 8: (0, -10, -28, 1, 1), 11: (0, 0, -6, 1, 1), 13: (-2, 10, 14, .85, 1), 14: (0, 0, 0, 1, 1)},
        B={0: (0, 0, 0, 1, 1), 2: (-6, 8, 16, .8, 1), 4: (-2, -4, -20, 1, 1), 6: (0, -10, -40, .8, 1), 8: (0, -8, -36, .8, 1), 11: (0, 0, -8, 1, 1), 13: (-4, 8, 12, .85, 1), 14: (0, 0, 0, 1, 1)},
        F={0: F0, 2: F0, 3: (F0[0], F0[1] - 2), 4: (F0[0] - 2, F0[1] - 8), 5: (152, 130), 6: (150, 118), 8: (148, 112), 9: (150, 122), 10: (154, 136), 11: (158, 148), 12: F0, 14: F0},
        K={0: B0, 2: B0, 3: (B0[0], B0[1] - 2), 4: (B0[0] + 4, B0[1] - 8), 5: (64, 130), 6: (72, 120), 8: (74, 112), 9: (68, 124), 10: (54, 138), 11: (42, 148), 12: B0, 14: B0},
        ft={0: 0, 4: -10, 6: 20, 8: 24, 11: 6, 12: 0}, bt={0: 0, 4: -10, 6: 16, 8: 20, 11: 6, 12: 0}, kb={0: None, 4: 1, 11: 1, 12: None})
    return K(T, i)
LIFT = [0, 0, 0, 0, 10, 16, 20, 22, 22, 20, 16, 10, 0, 0, 0]      # (the game's own height of the jump, picture by picture, game px: it moves the whole picture, so the cloth feels it)
def w_jump(i): return (0, -(LIFT[i] - LIFT[i - 1]) * 3.3 if i else 0)

# the one knee down CROUCH: the front foot stays, the hips drop between the feet, the back knee goes to the floor
KNEEL = dict(pel=(-6, 34, 0), chs=(0, 0, 11), hd=(0, 2, -6), A=(0, 6, -2, 1, 1), B=(-2, 16, 52, .92, 1), F=(F0[0] + 6, F0[1]), K=(36, 150), ft=0, bt=-62, kb=1)
def kneel_mix(i, t):      # the stand (picture 0 of the idle) mixed into the kneel by t
    a = a_idle(0); out = {}
    for c in ('pel', 'chs', 'hd', 'A', 'B', 'F', 'K', 'ft', 'bt'): out[c] = mix(a[c], KNEEL[c], t)
    out['kb'] = KNEEL['kb'] if t > .45 else None; return out
def a_cdown(i):
    t = {0: 0, 3: .22, 7: .72, 10: 1.07, 12: .98, 14: 1}; r = kv(t, i); return kneel_mix(i, r)
def a_cidle(i):      # kneeling: he breathes, the weight rocks a little, the fur and the jacket move
    ph = 2 * pi * i / 15; b = .5 - .5 * cos(ph); d = dict(KNEEL)
    d.update(pel=(-6 + 1.2 * sin(ph), 34 + 2.2 * b, 0.8 * sin(ph + .5)), chs=(0, -1 * b, 11 - 1.5 * sin(ph + .8)), hd=(0, 2 + .8 * b, -6 + 1.5 * sin(ph + 1.2)), A=(0, 6 + 1.6 * sin(ph + .6), -2 + 1.4 * sin(ph + .6), 1, 1), B=(-2, 16 + 1.2 * sin(ph + 1.5), 52 - 1.5 * sin(ph + 1.5), .92, 1)); return d
def a_cwalk(i):      # a low crawl-step: the front foot reaches and sets down, the back knee drags after it
    p = i / 15; lf, tf = foot(p, (KNEEL['F'][0], F0[1]), 9, 7, 6); lb, tb = foot(p + .5, KNEEL['K'], 9, 6, 0, 1.0); ph = 4 * pi * p; d = dict(KNEEL)
    d.update(pel=(-6 + 3 * sin(2 * pi * p), 34 + 2 * cos(ph), 1.5 * sin(2 * pi * p)), chs=(0, 0, 11 + 2 * sin(2 * pi * p)), A=(0, 6 + 1.5 * sin(ph), -2, 1, 1), B=(-2, 16 - 1.5 * sin(ph), 52, .92, 1), F=lf, K=lb, ft=tf, bt=-62 + tb); return d
def a_block(i):      # HIGH GUARD: both forearms come up in front of his face, elbows in, knees bent, he leans back a little
    T = dict(pel={0: (0, 1.5, 0), 3: (3, 8, 0), 6: (4, 12, 0), 14: (4, 12.5, 0)}, chs={0: (0, 0, 0), 3: (0, 0, -3), 6: (-1, 0, -7), 14: (-1, 0, -7.5)}, hd={0: (0, 0, 0), 6: (3, 6, 5), 14: (3, 6, 5)},
             A={0: (0, 0, 0, 1, 1), 3: (-2, 2, -10, .95, 1), 6: (-8, 6, -22, .78, 1), 14: (-8, 6, -22, .78, 1)}, B={0: (0, 0, 0, 1, 1), 3: (-10, -6, -38, .82, 1), 6: (-22, -12, -78, .62, 1), 14: (-22, -12, -78, .62, 1)},
             F={0: F0, 6: (F0[0] + 2, F0[1]), 14: (F0[0] + 2, F0[1])}, K={0: B0, 6: (B0[0] - 2, B0[1]), 14: (B0[0] - 2, B0[1])}, ft={0: 0}, bt={0: 0})
    d = K(T, i); d['pel'] = (d['pel'][0], d['pel'][1] + (0.7 * sin(2 * pi * (i - 6) / 9) if i >= 6 else 0), 0); return d
def a_dash(i):      # SHOULDER CHARGE: he loads (0-2), then drives forward head down with the big cuff in front of him, the back leg pushing and the jacket flying behind (3-11), and pulls up (12-14)
    r = kv({0: 0, 1: .3, 2: .6, 3: 1, 11: 1, 12: .6, 13: .25, 14: 0}, i); lo = kv({0: 0, 1: .5, 2: 1, 3: 0, 14: 0}, i)
    return dict(pel=(11 * r - 3 * lo, 9 * r + 5 * lo, 7 * r - 2 * lo), chs=(2 * r, 0, 22 * r - 4 * lo), hd=(3 * r, 5 * r, 8 * r), A=(-10 * r, 8 * r, 30 * r, .9, 1), B=(-14 * r, -8 * r, -32 * r, .7, 1),
                F=(F0[0] + 20 * r, F0[1] - 2 * r * (1 if 4 <= i <= 10 else 0)), K=(B0[0] - 24 * r + 2 * lo, B0[1] - 5 * r * (1 if 3 <= i <= 11 else 0)), ft=-8 * r, bt=34 * r)
def w_dash(i): return (27 * max(0.0, 1 - i / 15), 0)
def a_dashb(i):      # the back dash: a quick hop back with the guard up, the feet trailing forward
    r = kv({0: 0, 1: .3, 2: .7, 3: 1, 11: 1, 12: .6, 13: .25, 14: 0}, i); hop = kv({0: 0, 2: 0, 5: 1, 9: 1, 12: 0, 14: 0}, i)
    return dict(pel=(-14 * r, 4 * r - 10 * hop, -8 * r), chs=(-2 * r, 0, -8 * r), hd=(-2 * r, 2 * r, -3 * r), A=(-4 * r, 3 * r, -12 * r, .95, 1), B=(-10 * r, -4 * r, -34 * r, .78, 1),
                F=(F0[0] - 22 * r + 18 * hop, F0[1] - 18 * hop), K=(B0[0] - 6 * r + 20 * hop, B0[1] - 14 * hop), ft=14 * hop, bt=-10 * hop)
def w_dashb(i): return (-20 * max(0.0, 1 - i / 15), 0)

def hook_t(i, arm):      # a BOXING hook (v1.164 remade): the hips and the shoulders turn away and he loads on the back foot (0-3), then the hips drive round first, the chest follows and the arm whips through last (4-7: the impact is 7), he steps in on it, drops his chin behind the shoulder, holds the contact (8), snaps back (9-11) and comes to his guard (12-14); the other hand guards the chin all the time. (The arm's own turn is worked out so that it points level at the head when he leans: an arm points at -23 degrees (A) or +7.6 (B) plus its turn plus the lean of the pelvis and the chest.)
    A_ = arm == 'A'
    T = dict(pel={0: (0, 0, 0), 1: (-2, 2, -3), 2: (-5, 4, -7), 3: (-7, 5, -10), 4: (-4, 5, -3), 5: (3, 6, 7), 6: (8, 7, 9), 7: (12, 8, 12), 8: (13, 8, 13), 9: (11, 7, 10), 10: (8, 6, 7), 12: (3, 3, 3), 14: (0, 1, 0)},
             chs={0: (0, 0, 0), 2: (-1, 0, -8), 3: (-2, 0, -15), 4: (-1, 0, -8), 5: (1, 0, 8), 6: (3, 0, 11), 7: (4, 0, 14), 8: (4, 0, 15), 9: (4, 0, 12), 10: (3, 0, 8), 12: (1, 0, 3), 14: (0, 0, 0)},
             hd={0: (0, 0, 0), 3: (-3, 1, -6), 5: (-1, 1, 1), 7: (3, 3, 9), 9: (3, 2, 7), 12: (0, 0, 1), 14: (0, 0, 0)},
             F={0: F0, 3: (F0[0] - 5, F0[1]), 5: (F0[0] + 3, F0[1] - 3), 6: (F0[0] + 10, F0[1]), 7: (F0[0] + 14, F0[1]), 10: (F0[0] + 10, F0[1]), 13: (F0[0] + 2, F0[1]), 14: F0},
             K={0: B0, 3: (B0[0] - 3, B0[1]), 5: (B0[0] + 1, B0[1] - 4), 7: (B0[0] + 10, B0[1] - 8), 10: (B0[0] + 8, B0[1] - 5), 13: (B0[0] + 1, B0[1]), 14: B0},
             ft={0: 0, 3: 8, 6: -4, 7: -8, 12: 0}, bt={0: 0, 5: -14, 7: -30, 10: -20, 13: 0})
    if A_:
        T['A'] = {0: (0, 0, 0, 1, 1), 2: (-6, 2, -14, .88, 1), 3: (-14, 3, -38, .62, 1), 4: (-12, 2, -34, .66, 1), 5: (-2, 0, -22, .92, 1), 6: (3, 0, -9, 1.25, 1), 7: (5, 0, -6, 1.52, 1), 8: (5, 1, -5, 1.52, 1), 9: (3, 1, 9, 1.28, 1), 10: (1, 2, -2, 1.0, 1), 12: (-2, 1, -4, .9, 1), 14: (0, 0, 0, 1, 1)}
        T['B'] = {0: (0, 0, 0, 1, 1), 2: (-4, -6, -20, .9, 1), 4: (-8, -12, -38, .75, 1), 8: (-8, -12, -36, .75, 1), 11: (-3, -4, -12, .92, 1), 14: (0, 0, 0, 1, 1)}
    else:
        T['B'] = {0: (0, 0, 0, 1, 1), 2: (-8, -3, -18, .85, 1), 3: (-16, -8, -42, .6, 1), 4: (-14, -8, -40, .64, 1), 5: (-3, -8, -42, .9, 1), 6: (3, -9, -38, 1.28, 1), 7: (5, -7, -37, 1.52, 1), 8: (5, -6, -36, 1.52, 1), 9: (3, -3, -22, 1.28, 1), 10: (1, -2, -31, 1.02, 1), 12: (-2, -2, -8, .92, 1), 14: (0, 0, 0, 1, 1)}
        T['A'] = {0: (0, 0, 0, 1, 1), 2: (-3, -2, -10, .9, 1), 4: (-5, -3, -18, .8, 1), 8: (-5, -3, -14, .8, 1), 11: (-2, -1, -6, .92, 1), 14: (0, 0, 0, 1, 1)}
    return K(T, i)
def a_hookL(i): return hook_t(i, 'B')
def a_hookR(i): return hook_t(i, 'A')
def a_kickup(i):      # a CAPOEIRA RISING KICK: he leans back and a hand drops for balance (0-3), the front leg swings from low to high in a long arc (4-7: the impact is 6) and comes back down
    Fp = {0: F0, 1: (F0[0] - 6, F0[1] - 8), 2: (F0[0] - 4, F0[1] - 16), 3: (162, 128), 4: (178, 108), 5: (194, 82), 6: (204, 60), 7: (208, 46), 8: (200, 56), 9: (188, 82), 10: (174, 112), 11: (164, 138), 12: F0, 14: F0}
    T = dict(pel={0: (0, 0, 0), 2: (-6, 3, -6), 5: (-12, 4, -12), 7: (-12, 3, -14), 10: (-4, 2, -5), 12: (0, 1, -1), 14: (0, 0, 0)}, chs={0: (0, 0, 0), 3: (-2, 0, -10), 6: (-3, 0, -18), 8: (-3, 0, -18), 12: (0, 0, -2), 14: (0, 0, 0)}, hd={0: (0, 0, 0), 5: (0, 0, 9), 14: (0, 0, 0)},
             A={0: (0, 0, 0, 1, 1), 3: (-8, -4, -34, .9, 1), 7: (-12, -6, -46, .9, 1), 12: (0, 0, -3, 1, 1), 14: (0, 0, 0, 1, 1)}, B={0: (0, 0, 0, 1, 1), 3: (-10, 4, 36, .9, 1), 7: (-14, 8, 56, .85, 1), 12: (0, 0, 3, 1, 1), 14: (0, 0, 0, 1, 1)},
             F=Fp, K={0: B0, 3: (B0[0] - 3, B0[1]), 8: (B0[0] - 5, B0[1]), 12: B0, 14: B0}, ft={0: 0, 3: -20, 6: -58, 8: -42, 10: -10, 12: 0}, bt={0: 0, 4: 14, 9: 14, 12: 0})
    return K(T, i)
def a_jpunch(i):      # an ANIME FLYING PUNCH: crouch (0-2), the arm cocked back as he leaps (3-5), the body stretches out behind the fist (6-8, the impact is 7), the fall (9-11) and the landing (12-14)
    T = dict(
        pel={0: (0, 0, 0), 2: (0, 14, 4), 3: (-2, 4, -4), 5: (-4, -2, 4), 6: (4, -6, 18), 7: (12, -8, 26), 9: (8, -4, 18), 11: (2, 2, 6), 12: (0, 12, 5), 13: (0, 10, 3), 14: (0, 0, 0)}, chs={0: (0, 0, 0), 2: (0, 0, 6), 4: (0, 0, -6), 7: (4, 0, 14), 9: (2, 0, 8), 12: (0, 0, 6), 14: (0, 0, 0)}, hd={0: (0, 0, 0), 7: (3, 1, 6), 14: (0, 0, 0)},
        A={0: (0, 0, 0, 1, 1), 2: (-4, 10, 14, .8, 1), 4: (-18, 6, -40, .6, 1), 5: (-18, 4, -40, .6, 1), 7: (4, 4, 4, 1.9, 1), 9: (3, 5, 12, 1.5, 1), 11: (2, 6, 14, 1, 1), 13: (-2, 10, 10, .85, 1), 14: (0, 0, 0, 1, 1)},
        B={0: (0, 0, 0, 1, 1), 4: (-10, 6, -18, .8, 1), 7: (-6, 12, 16, .7, 1), 11: (0, 6, 12, 1, 1), 14: (0, 0, 0, 1, 1)},
        F={0: F0, 2: F0, 4: (150, 128), 5: (140, 128), 7: (112, 126), 9: (130, 134), 11: (158, 146), 12: F0, 14: F0}, K={0: B0, 2: B0, 4: (66, 130), 5: (62, 128), 7: (62, 120), 9: (52, 134), 11: (40, 148), 12: B0, 14: B0},
        ft={0: 0, 5: 18, 7: 34, 9: 8, 12: 0}, bt={0: 0, 5: 14, 7: 26, 12: 0}, kb={0: None, 5: 1, 11: 1, 12: None})
    return K(T, i)
def a_cleg(i):      # a MUAY THAI LOW KICK from one knee: he twists away (0-3), the front leg shoots out along the floor into the enemy's legs (4-7: the impact is 6) and comes back to the kneel
    Fp = {0: KNEEL['F'], 1: (KNEEL['F'][0] - 6, F0[1] - 8), 2: (KNEEL['F'][0] - 2, F0[1] - 12), 3: (176, 150), 4: (198, 152), 5: (214, 153), 6: (224, 153), 7: (226, 153), 8: (214, 153), 10: (190, 153), 12: (170, 153), 14: KNEEL['F']}
    T = dict(pel={0: KNEEL['pel'], 3: (-12, 35, -6), 6: (-18, 36, -10), 8: (-16, 36, -8), 12: (-8, 34, -1), 14: KNEEL['pel']}, chs={0: KNEEL['chs'], 3: (0, 0, 3), 6: (-2, 0, -4), 8: (-2, 0, -2), 12: (0, 0, 9), 14: KNEEL['chs']},
             hd={0: KNEEL['hd'], 6: (-2, 2, 4), 14: KNEEL['hd']}, A={0: KNEEL['A'], 3: (-8, 12, 14, .8, 1), 7: (-12, 12, 26, .75, 1), 14: KNEEL['A']}, B={0: KNEEL['B'], 3: (-8, 2, -10, .8, 1), 7: (-14, -2, -32, .7, 1), 14: KNEEL['B']},
             F=Fp, K={0: KNEEL['K'], 5: (KNEEL['K'][0] - 4, KNEEL['K'][1]), 9: (KNEEL['K'][0] - 4, KNEEL['K'][1]), 14: KNEEL['K']}, ft={0: 0, 3: -8, 6: -4, 10: 0}, bt={0: KNEEL['bt']}, kb={0: 1})
    return K(T, i)
def a_slam(i):      # a PRO-WRESTLING SLAM in the air: both fists go up over his head and he arches back (0-4), then his whole body folds forward into a hammer blow (5-8: the impact is 6)
    T = dict(
        pel={0: (0, -2, 0), 2: (-6, -4, -8), 4: (-8, -4, -12), 5: (2, 0, 10), 6: (12, 4, 22), 9: (10, 4, 20), 12: (4, 0, 8), 14: (0, -2, 0)}, chs={0: (0, 0, 0), 4: (-2, 0, -12), 5: (2, 0, 10), 6: (6, 2, 20), 9: (5, 2, 16), 12: (2, 0, 6), 14: (0, 0, 0)}, hd={0: (0, 0, 0), 4: (-2, -2, -8), 6: (4, 4, 12), 14: (0, 0, 0)},
        A={0: (0, 0, 0, 1, 1), 2: (-8, -8, -52, .75, 1), 4: (-10, -12, -72, .7, 1), 5: (0, 0, -10, .9, 1), 6: (3, 10, 56, 1.3, 1), 9: (3, 10, 50, 1.25, 1), 12: (4, 6, 20, 1, 1), 14: (0, 0, 0, 1, 1)},
        B={0: (0, 0, 0, 1, 1), 2: (-10, -10, -46, .75, 1), 4: (-12, -14, -62, .7, 1), 5: (0, 4, -6, .9, 1), 6: (3, 12, 50, 1.3, 1), 9: (3, 12, 46, 1.25, 1), 12: (4, 6, 18, 1, 1), 14: (0, 0, 0, 1, 1)},
        F={0: (150, 124), 4: (146, 112), 6: (152, 120), 9: (160, 128), 12: (158, 140), 14: (150, 124)}, K={0: (66, 126), 4: (74, 114), 6: (60, 122), 9: (50, 130), 12: (46, 140), 14: (66, 126)}, ft={0: 16, 6: 20, 14: 16}, bt={0: 12, 6: 14, 14: 12}, kb={0: 1})
    return K(T, i)
def a_hard(i):      # a STRAIGHT PUNCH with the whole body (v1.164 remade): the weight goes back and the fist is drawn to the hip (0-4), the back leg drives, the hips and the chest turn through and the big cuff shoots out level with the shoulder (5-7: the impact is 7), the front foot lands and the heel of the back foot is up (7-8), it snaps back (9-11); the other hand guards
    T = dict(
        pel={0: (0, 0, 0), 2: (-5, 3, -4), 4: (-9, 5, -7), 5: (-3, 6, 0), 6: (6, 7, 7), 7: (13, 8, 10), 8: (14, 8, 11), 10: (9, 7, 8), 12: (4, 3, 3), 14: (0, 1, 0)},
        chs={0: (0, 0, 0), 3: (-2, 0, -10), 4: (-3, 0, -12), 5: (0, 0, 0), 6: (3, 0, 10), 7: (5, 0, 12), 8: (5, 0, 13), 10: (4, 0, 9), 12: (1, 0, 3), 14: (0, 0, 0)}, hd={0: (0, 0, 0), 4: (-3, 0, -6), 7: (4, 2, 9), 12: (0, 0, 1), 14: (0, 0, 0)},
        B={0: (0, 0, 0, 1, 1), 3: (-14, 5, -20, .64, 1), 4: (-16, 6, -24, .6, 1), 5: (-4, 2, -10, .9, 1), 6: (3, -2, -33, 1.4, 1), 7: (5, -5, -35, 1.95, 1), 8: (5, -5, -35, 1.95, 1), 10: (4, -3, -28, 1.5, 1), 12: (4, 0, -6, 1.08, 1), 14: (0, 0, 0, 1, 1)},
        A={0: (0, 0, 0, 1, 1), 3: (-6, 0, -14, .82, 1), 4: (-8, 0, -20, .78, 1), 8: (-6, 0, -16, .8, 1), 12: (-1, 0, -3, .97, 1), 14: (0, 0, 0, 1, 1)},
        F={0: F0, 4: (F0[0] - 7, F0[1]), 6: (F0[0] + 8, F0[1] - 5), 7: (F0[0] + 26, F0[1]), 10: (F0[0] + 20, F0[1]), 13: (F0[0] + 4, F0[1]), 14: F0}, K={0: B0, 5: (B0[0] + 4, B0[1] - 2), 7: (B0[0] + 4, B0[1] - 3), 10: (B0[0] + 8, B0[1]), 13: (B0[0] + 2, B0[1]), 14: B0},
        ft={0: 0, 5: -10, 7: 0}, bt={0: 0, 6: -20, 7: -34, 10: -24, 13: 0})
    return K(T, i)
def a_front(i):      # a MUAY THAI PUSH KICK (the teep, v1.164 remade): the knee comes up high (0-3) and the sole drives straight out at the enemy's belly with the hips pushed through (4-7: the impact is 6), he only leans back as far as the kick needs, the other leg is bent and planted, both hands stay up; it is pulled back fast (8-11)
    Fp = {0: F0, 1: (F0[0] - 3, F0[1] - 12), 2: (F0[0] + 4, F0[1] - 32), 3: (172, 106), 4: (196, 100), 5: (218, 98), 6: (228, 98), 7: (230, 98), 8: (214, 103), 9: (194, 116), 10: (174, 134), 11: (162, 148), 12: F0, 14: F0}
    T = dict(pel={0: (0, 0, 0), 2: (-4, 2, -4), 6: (-11, 3, -8), 9: (-6, 2, -5), 12: (0, 1, -1), 14: (0, 0, 0)}, chs={0: (0, 0, 0), 3: (-2, 0, -5), 6: (-3, 0, -8), 9: (-2, 0, -5), 12: (0, 0, -1), 14: (0, 0, 0)}, hd={0: (0, 0, 0), 6: (1, 0, 8), 14: (0, 0, 0)},
             A={0: (0, 0, 0, 1, 1), 3: (-4, 2, -6, .9, 1), 7: (-6, 3, -8, .88, 1), 12: (0, 0, 1, 1, 1), 14: (0, 0, 0, 1, 1)}, B={0: (0, 0, 0, 1, 1), 3: (-12, -8, -36, .78, 1), 7: (-14, -10, -44, .72, 1), 12: (0, 0, -2, 1, 1), 14: (0, 0, 0, 1, 1)},
             F=Fp, K={0: B0, 3: (B0[0] - 5, B0[1]), 9: (B0[0] - 6, B0[1]), 12: B0, 14: B0}, ft={0: 0, 3: -18, 6: -72, 9: -30, 12: 0}, bt={0: 0, 4: 8, 10: 8, 12: 0}, kb={0: None, 4: 1, 11: 1, 12: None})
    return K(T, i)
def a_hurt(i):      # HURT, a hit to the head (v1.164 remade): the head snaps back at once and the chest folds away from the blow (0-2), he is pushed back a step with his hands thrown up (3-7) and finds his stance again (8-14)
    k = kv({0: 0, 1: .75, 2: 1, 4: .92, 7: .5, 10: .16, 14: 0}, i, ease=sm); st = kv({0: 0, 3: .2, 6: .8, 9: 1, 14: 0}, i)
    return dict(pel=(-14 * k, 4 * k, -7 * k), chs=(-2 * k, 0, -14 * k), hd=(-4 * k, 1 * k, -26 * k), A=(-10 * k, -8 * k, -34 * k, .9, 1), B=(-8 * k, 4 * k, -40 * k, .85, 1),
                F=(F0[0] - 10 * k + 4 * st, F0[1] - 3 * st), K=(B0[0] - 8 * k, B0[1]), ft=6 * k, bt=-8 * k)
def a_hurt_body(i):      # HURT, a hit to the belly (v1.164): he folds forward over it at the waist and drops (0-3), holds it with both hands (4-8), straightens up slowly (9-14)
    k = kv({0: 0, 1: .6, 3: 1, 8: .94, 11: .45, 14: 0}, i, ease=sm)
    return dict(pel=(-8 * k, 10 * k, 12 * k), chs=(2 * k, 0, 36 * k), hd=(3 * k, 4 * k, 22 * k), A=(-6 * k, 12 * k, 38 * k, .85, 1), B=(-4 * k, 12 * k, 46 * k, .82, 1),
                F=(F0[0] - 6 * k, F0[1]), K=(B0[0] - 4 * k, B0[1]), ft=4 * k, bt=-6 * k, kb=1 if k > .5 else None)
def a_hurt_stagger(i):      # HURT, a heavy hit (v1.164): thrown back and he staggers two steps back with his arms out for balance (0-9) and catches himself (10-14)
    k = kv({0: 0, 1: .8, 2: 1, 8: .9, 11: .35, 14: 0}, i, ease=sm); s1 = max(0.0, min(1.0, (i - 1) / 4.0)); s2 = max(0.0, min(1.0, (i - 6) / 4.0)); lf1 = math.sin(math.pi * s1) if 0 < s1 < 1 else 0; lf2 = math.sin(math.pi * s2) if 0 < s2 < 1 else 0
    return dict(pel=(-16 * k, 3 * k, -10 * k), chs=(-2 * k, 0, -10 * k), hd=(-4 * k, 1 * k, -18 * k), A=(-6 * k, -10 * k, -52 * k, .95, 1), B=(-6 * k, 8 * k, 18 * k, .95, 1),
                F=(F0[0] - 14 * min(1.0, s1 * 1.0) * k - 6 * s2 * k, F0[1] - 12 * lf1), K=(B0[0] - 8 * k - 8 * s2 * k, B0[1] - 12 * lf2), ft=-8 * lf1, bt=-8 * lf2, kb=1 if (lf1 > .2 or lf2 > .2) else None)
def a_hurt_fall(i):      # HURT, knocked off his feet (v1.164): he is lifted and goes over backwards (0-4), lands flat on his back with a bounce (5-7) and rolls up onto his feet (8-14)
    T = dict(pel={0: (0, 0, 0), 1: (-6, 0, -8), 3: (-24, -8, -40), 5: (-40, 40, -84), 6: (-44, 70, -90), 7: (-42, 62, -88), 8: (-38, 56, -70), 10: (-22, 30, -36), 12: (-6, 8, -10), 14: (0, 0, 0)},
             chs={0: (0, 0, 0), 3: (0, 0, -8), 6: (0, 0, 2), 8: (0, 0, 24), 10: (0, 0, 20), 13: (0, 0, 4), 14: (0, 0, 0)}, hd={0: (0, 0, 0), 3: (-4, 0, -22), 6: (0, 3, 6), 9: (0, 2, 4), 14: (0, 0, 0)},
             A={0: (0, 0, 0, 1, 1), 3: (-12, -8, -50, .9, 1), 6: (2, 8, 40, .9, 1), 10: (-4, 6, 20, .9, 1), 14: (0, 0, 0, 1, 1)}, B={0: (0, 0, 0, 1, 1), 3: (-10, 4, -52, .88, 1), 6: (4, 10, 34, .86, 1), 10: (-2, 8, 24, .9, 1), 14: (0, 0, 0, 1, 1)},
             F={0: F0, 2: (F0[0] - 10, F0[1] - 6), 4: (166, 118), 6: (204, 142), 8: (190, 132), 10: (170, 146), 12: (160, 152), 14: F0}, K={0: B0, 2: (B0[0] - 10, B0[1] - 6), 4: (86, 126), 6: (170, 148), 8: (140, 140), 10: (90, 150), 12: (52, 152), 14: B0},
             ft={0: 0, 5: 20, 6: -70, 10: -10, 13: 0}, bt={0: 0, 5: 10, 6: -80, 10: -10, 13: 0}, kb={0: None, 5: 1, 9: 1, 12: None})
    return K(T, i)
def a_hurt_low(i):      # HURT, a hit to the legs (v1.164): the knees buckle and he drops (0-3), kneels there with his hands down (4-8) and pushes himself up (9-14)
    k = kv({0: 0, 1: .5, 3: 1, 8: .96, 11: .4, 14: 0}, i, ease=sm)
    return dict(pel=(-4 * k, 26 * k, 4 * k), chs=(0, 0, 14 * k), hd=(0, 3 * k, 10 * k), A=(-4 * k, 12 * k, 26 * k, .9, 1), B=(-4 * k, 14 * k, 36 * k, .88, 1),
                F=(F0[0] + 4 * k, F0[1]), K=(B0[0] + 10 * k, B0[1] - 2 * k), ft=0, bt=-30 * k, kb=1 if k > .4 else None)
def a_ko(i):      # K.O.: knocked back (0-3), falling over backwards with his feet leaving the floor (4-8), hitting the ground with a small bounce (9-11) and lying on his back (12-14: the last picture stays)
    T = dict(
        pel={0: (0, 0, 0), 2: (-8, 2, -8), 4: (-22, -6, -26), 6: (-34, -4, -52), 8: (-44, 34, -80), 9: (-46, 76, -90), 10: (-46, 66, -91), 11: (-46, 77, -90), 14: (-46, 76, -90)},
        chs={0: (0, 0, 0), 3: (0, 0, -10), 6: (0, 0, -6), 9: (0, 0, 2), 14: (0, 0, 0)}, hd={0: (0, 0, 0), 3: (-4, 0, -22), 8: (-2, 2, -10), 11: (0, 3, 8), 14: (0, 3, 10)},
        A={0: (0, 0, 0, 1, 1), 3: (-14, -6, -48, .85, 1), 8: (-12, 2, -20, .9, 1), 11: (0, 6, 40, .9, 1), 14: (2, 8, 52, .9, 1)}, B={0: (0, 0, 0, 1, 1), 3: (-12, 6, -52, .85, 1), 8: (-8, 4, -10, .9, 1), 11: (2, 8, 30, .85, 1), 14: (4, 10, 44, .85, 1)},
        F={0: F0, 3: (F0[0] - 12, F0[1] - 4), 5: (158, 128), 7: (166, 112), 9: (190, 128), 11: (206, 150), 14: (208, 152)}, K={0: B0, 3: (B0[0] - 12, B0[1] - 4), 5: (70, 130), 7: (96, 128), 9: (150, 132), 11: (192, 150), 14: (194, 156)},
        ft={0: 0, 5: 20, 9: -30, 14: -70}, bt={0: 0, 5: 10, 9: -30, 14: -80}, kb={0: None, 6: 1, 12: 1})
    return K(T, i)


# ---------------------------------------------------------------- v1.163 the BLUE moves (see ryu.js): five more animations
def a_upper(i):      # an UPPERCUT with the right fist: he sinks and the fist drops low behind the hip (0-4), the legs drive him up and the fist rises in an arc (5-6) to the impact at the chin (7), the body is stretched up behind it (8-10)
    T = dict(pel={0: (0, 0, 0), 2: (-3, 10, -5), 4: (-5, 15, -9), 6: (4, 3, 8), 7: (8, -2, 12), 9: (7, 0, 8), 12: (1, 1, 1), 14: (0, 0, 0)},
             chs={0: (0, 0, 0), 3: (-1, 0, -8), 4: (-2, 0, -11), 6: (1, 0, 6), 7: (3, -1, 12), 9: (2, 0, 8), 12: (0, 0, 1), 14: (0, 0, 0)}, hd={0: (0, 0, 0), 4: (-2, 2, -6), 7: (3, -2, 8), 14: (0, 0, 0)},
             A={0: (0, 0, 0, 1, 1), 2: (-6, 10, 24, .9, 1), 4: (-12, 18, 52, .7, 1), 6: (8, 8, -30, 1.1, 1), 7: (4, -6, -64, 1.55, 1), 9: (3, -8, -58, 1.42, 1), 12: (2, 0, -10, 1.05, 1), 14: (0, 0, 0, 1, 1)},
             B={0: (0, 0, 0, 1, 1), 4: (-6, -4, -30, .8, 1), 7: (-4, -2, -20, .8, 1), 14: (0, 0, 0, 1, 1)},
             F={0: F0, 4: (F0[0] - 6, F0[1]), 6: (F0[0] + 6, F0[1]), 8: (F0[0] + 14, F0[1]), 11: (F0[0] + 6, F0[1]), 14: F0}, K={0: B0, 5: (B0[0] + 2, B0[1] - 2), 8: (B0[0] + 8, B0[1] - 6), 12: (B0[0] + 2, B0[1]), 14: B0},
             ft={0: 0, 4: 8, 7: -4, 12: 0}, bt={0: 0, 5: -14, 8: -22, 12: 0})
    return K(T, i)
def a_elbow(i):      # a Muay Thai ELBOW with the left arm: he turns away and the arm folds back (0-5), then he steps in and the hips snap round so that the point of the elbow drives straight into the enemy (6-7: the impact is 7)
    T = dict(pel={0: (0, 0, 0), 3: (-6, 4, -8), 5: (-4, 5, -4), 6: (8, 6, 10), 7: (14, 6, 16), 9: (12, 6, 14), 12: (2, 2, 2), 14: (0, 0, 0)},
             chs={0: (0, 0, 0), 3: (-2, 0, -12), 5: (-1, 0, -6), 6: (3, 0, 12), 7: (6, 0, 20), 9: (5, 0, 16), 12: (0, 0, 2), 14: (0, 0, 0)}, hd={0: (0, 0, 0), 3: (-2, 0, -4), 7: (4, 1, 8), 14: (0, 0, 0)},
             B={0: (0, 0, 0, 1, 1), 3: (-10, -2, -30, .7, 1), 5: (-12, 0, -40, .6, 1), 6: (4, -4, -14, .66, 1), 7: (8, -6, -8, .85, 1), 9: (6, -4, -6, .8, 1), 12: (2, 0, -1, 1, 1), 14: (0, 0, 0, 1, 1)},
             A={0: (0, 0, 0, 1, 1), 4: (-8, 6, -20, .8, 1), 7: (-10, 8, -14, .8, 1), 14: (0, 0, 0, 1, 1)},
             F={0: F0, 5: (F0[0] - 4, F0[1]), 7: (F0[0] + 18, F0[1]), 10: (F0[0] + 12, F0[1]), 14: F0}, K={0: B0, 6: (B0[0] + 4, B0[1] - 2), 8: (B0[0] + 4, B0[1] - 4), 12: (B0[0] + 2, B0[1]), 14: B0}, ft={0: 0, 5: 6, 7: -6, 12: 0}, bt={0: 0, 6: -12, 8: -16, 12: 0})
    return K(T, i)
def a_bluep(i):      # the BLUE PUNCH: a straight punch with everything he has: he leans far back and the fist is drawn back to the hip (0-5), then a long lunge, the hips and the chest drive and the big cuff shoots out (6-8: the impact is 8), blue light round it
    T = dict(pel={0: (0, 0, 0), 3: (-10, 6, -6), 5: (-12, 8, -8), 7: (6, 8, 12), 8: (16, 9, 18), 11: (12, 8, 12), 14: (0, 0, 0)}, chs={0: (0, 0, 0), 3: (-3, 0, -12), 5: (-3, 0, -14), 7: (2, 0, 8), 8: (5, 0, 16), 11: (4, 0, 12), 14: (0, 0, 0)}, hd={0: (0, 0, 0), 5: (-3, 0, -6), 8: (5, 1, 10), 14: (0, 0, 0)},
             B={0: (0, 0, 0, 1, 1), 3: (-16, 6, -22, .6, 1), 5: (-20, 8, -26, .55, 1), 7: (2, -3, -26, 1.3, 1), 8: (6, -5, -42, 2.08, 1), 11: (5, -3, -40, 1.85, 1), 14: (0, 0, 0, 1, 1)}, A={0: (0, 0, 0, 1, 1), 5: (-8, 6, -24, .8, 1), 8: (-10, 10, -20, .75, 1), 13: (0, 0, 0, 1, 1)},
             F={0: F0, 4: (F0[0] - 8, F0[1]), 7: (F0[0] + 8, F0[1] - 6), 8: (F0[0] + 30, F0[1]), 12: (F0[0] + 22, F0[1]), 14: F0}, K={0: B0, 6: (B0[0] + 2, B0[1]), 8: (B0[0] - 10, B0[1] - 2), 12: (B0[0] + 6, B0[1]), 14: B0}, ft={0: 0, 6: -10, 8: 0}, bt={0: 0, 8: 20, 12: 0})
    return K(T, i)
def a_dive(i):      # the DIVE PUNCH: he springs up (0-2), shoots forward through the air flat (3-5), pitches up above the enemy with the fist cocked over his head (6-7), leans over it and drives it straight down (8: the impact) and lands in a crouch (9-12)
    T = dict(pel={0: (0, 0, 0), 1: (0, 12, 4), 2: (-2, -4, -6), 3: (6, -6, 22), 4: (8, -8, 34), 5: (10, -8, 40), 6: (8, -6, 22), 7: (4, -4, 8), 8: (8, -2, 26), 9: (8, 4, 24), 10: (6, 14, 22), 12: (0, 8, 6), 14: (0, 0, 0)},
             chs={0: (0, 0, 0), 2: (0, 0, 4), 3: (2, 0, 14), 5: (3, 0, 22), 6: (2, 0, 8), 7: (0, 0, -6), 8: (4, 0, 14), 10: (2, 0, 12), 14: (0, 0, 0)}, hd={0: (0, 0, 0), 5: (3, 2, 10), 7: (-1, 0, -6), 8: (5, 3, 14), 12: (0, 0, 4), 14: (0, 0, 0)},
             A={0: (0, 0, 0, 1, 1), 2: (-4, -4, -30, .8, 1), 4: (-10, -6, -62, .7, 1), 6: (-12, -10, -104, .62, 1), 7: (-6, -4, -60, .9, 1), 8: (3, 10, 52, 1.95, 1), 10: (3, 10, 44, 1.55, 1), 12: (2, 4, 20, 1, 1), 14: (0, 0, 0, 1, 1)},
             B={0: (0, 0, 0, 1, 1), 3: (-6, 4, 20, .85, 1), 7: (-12, 6, 36, .8, 1), 8: (-14, 8, 50, .75, 1), 10: (-4, 10, 30, .8, 1), 14: (0, 0, 0, 1, 1)},
             F={0: F0, 1: F0, 2: (F0[0] - 4, F0[1] - 18), 4: (F0[0] - 14, F0[1] - 30), 6: (F0[0] - 16, F0[1] - 42), 8: (F0[0] - 22, F0[1] - 46), 10: (F0[0] - 6, F0[1] - 6), 12: F0, 14: F0},
             K={0: B0, 1: B0, 2: (B0[0] - 6, B0[1] - 12), 4: (B0[0] - 18, B0[1] - 24), 6: (B0[0] - 22, B0[1] - 38), 8: (B0[0] - 28, B0[1] - 40), 10: (B0[0] - 6, B0[1] - 4), 12: B0, 14: B0},
             ft={0: 0, 3: 24, 8: 40, 10: 10, 12: 0}, bt={0: 0, 3: 20, 8: 34, 12: 0}, kb={0: None, 3: 1, 11: 1, 12: None})
    return K(T, i)
def a_dkick(i):      # the DASH KICK: he leans back and the knee comes up (0-3), then he slides in on the standing foot and the other one drives straight out, flat, into the enemy (4-8: the impact is 7), the body leans far back behind it
    Fp = {0: F0, 1: (F0[0] - 4, F0[1] - 14), 2: (F0[0] + 2, F0[1] - 34), 3: (168, 108), 4: (192, 98), 5: (214, 94), 6: (228, 94), 7: (232, 94), 8: (224, 98), 9: (204, 108), 10: (180, 130), 11: (164, 148), 12: F0, 14: F0}
    T = dict(pel={0: (0, 0, 0), 2: (-6, 2, -8), 5: (-18, 3, -22), 7: (-24, 3, -26), 9: (-12, 3, -12), 12: (0, 1, -1), 14: (0, 0, 0)}, chs={0: (0, 0, 0), 3: (-2, 0, -10), 6: (-4, 0, -20), 8: (-4, 0, -20), 12: (0, 0, -1), 14: (0, 0, 0)}, hd={0: (0, 0, 0), 6: (0, 0, 10), 14: (0, 0, 0)},
             A={0: (0, 0, 0, 1, 1), 3: (-6, 8, 14, .85, 1), 7: (-10, 10, 24, .8, 1), 12: (0, 0, 2, 1, 1), 14: (0, 0, 0, 1, 1)}, B={0: (0, 0, 0, 1, 1), 3: (-12, -6, -34, .8, 1), 7: (-18, -8, -52, .7, 1), 12: (0, 0, -2, 1, 1), 14: (0, 0, 0, 1, 1)},
             F=Fp, K={0: B0, 3: (B0[0] - 6, B0[1]), 5: (B0[0] + 14, B0[1]), 9: (B0[0] + 20, B0[1]), 12: B0, 14: B0}, ft={0: 0, 3: -18, 6: -78, 9: -30, 12: 0}, bt={0: 0, 4: 10, 10: 10, 12: 0})
    return K(T, i)
def glow(a, x, y, r=4.6):      # BLUE LIGHT round a fist: where the picture is empty a blue ball of light (light blue inside, blue further out, the outer ring on every other pixel so it looks soft), and the bright parts of the fist itself (the white cuff, the skin) are tinted blue, the dark parts and the outline stay
    for yy in range(int(y - r) - 1, int(y + r) + 2):
        for xx in range(int(x - r) - 1, int(x + r) + 2):
            d = math.hypot(xx - x, yy - y)
            if d > r or not (0 <= xx < 64 and 0 <= yy < 64): continue
            if a[yy, xx, 3] == 0:
                if d < r * .5: put(a, xx, yy, (170, 214, 255))
                elif d < r * .8: put(a, xx, yy, (80, 142, 252))
                elif (xx + yy) % 2 == 0: put(a, xx, yy, (46, 96, 224))
            elif a[yy, xx, :3].astype(int).sum() > 420 and d < r * .8:
                t = .75 if d < r * .5 else .5; c = a[yy, xx, :3].astype(float); a[yy, xx, :3] = np.clip(c * (1 - t) + np.array([120, 182, 255]) * t, 0, 255).astype(np.uint8)

ROWS_V1163 = [('uc', a_upper, [('armA', HAND_A)], False, None, .5), ('el', a_elbow, [('armB', HAND_B)], False, None, .5), ('bp', a_bluep, [('armB', HAND_B)], False, (3, 0), .5), ('dv', a_dive, ['body'], False, (2, 0), .4), ('dk', a_dkick, ['foot'], False, (3, 0), .6)]

ROWS_V1164 = [('hb', a_hurt_body, [], False, (-5, 0), .5), ('hs', a_hurt_stagger, [], False, (-6, 0), .5), ('hf', a_hurt_fall, [], False, (-8, 0), .4), ('hl', a_hurt_low, [], False, (-3, 0), .5)]


# ---------------------------------------------------------------- v1.170 GRANITE BLAST MODE (see ryu.js): the blasts come out of his HAIR. He lowers his head like a bull and the hair stands out forward; the game draws the beam from the hair's front tip (GB_TIP,
# worked out for every picture and written to ryu_gb.json), here only the body, the hair and a little cyan light round the hair are drawn. Each animation is 15 pictures; FIRE = the picture the game fires on.
GB_TIP = (121, 6)      # (the front tuft of the hair, master coordinates)
CY, CYL, CYW = (24, 230, 255), (150, 245, 255), (255, 255, 255)      # (the cyan of the beam, a light cyan, white)
def a_gb1(i):      # BLAST 1: he sinks and the head tips back as the energy gathers in the hair (0-4), the head snaps forward and down (5-6: FIRE on 6), the hair stands out in front of him (6-9), the body is braced against the kick and comes back up (10-14)
    T = dict(pel={0: (0, 0, 0), 2: (-4, 3, -4), 4: (-6, 4, -7), 5: (2, 5, 4), 6: (8, 6, 8), 8: (9, 6, 9), 11: (5, 3, 4), 14: (0, 1, 0)},
             chs={0: (0, 0, 0), 2: (-1, 0, -6), 4: (-2, 0, -12), 5: (1, 0, 6), 6: (3, 0, 14), 8: (4, 0, 15), 11: (2, 0, 7), 14: (0, 0, 0)},
             hd={0: (0, 0, 0), 3: (-2, 0, -10), 4: (-3, 0, -16), 5: (2, 1, 8), 6: (5, 3, 24), 8: (6, 4, 28), 10: (5, 3, 20), 12: (2, 1, 8), 14: (0, 0, 0)},
             A={0: (0, 0, 0, 1, 1), 3: (-6, 6, 18, .9, 1), 4: (-8, 8, 26, .85, 1), 6: (-4, 6, 10, .95, 1), 9: (-4, 5, 8, .95, 1), 14: (0, 0, 0, 1, 1)},
             B={0: (0, 0, 0, 1, 1), 3: (-8, 10, 28, .85, 1), 4: (-10, 12, 36, .8, 1), 6: (-6, 8, 22, .9, 1), 9: (-6, 7, 20, .9, 1), 14: (0, 0, 0, 1, 1)},
             F={0: F0, 5: (F0[0] + 2, F0[1]), 6: (F0[0] + 8, F0[1]), 8: (F0[0] + 10, F0[1]), 12: (F0[0] + 4, F0[1]), 14: F0}, K={0: B0, 4: (B0[0] - 3, B0[1]), 6: (B0[0] + 2, B0[1] - 3), 8: (B0[0] + 4, B0[1]), 12: (B0[0] + 1, B0[1]), 14: B0},
             ft={0: 0, 6: -6, 12: 0}, bt={0: 0, 6: -12, 12: 0})
    return K(T, i)
def a_gb2(i):      # BLAST 2: a step in and a lower, harder thrust: the head goes up and back for a moment (0-3), then he lunges forward and the head drives down and forward (4-5: FIRE on 5), the arms are thrown back for balance (5-8), recovery (9-14)
    T = dict(pel={0: (0, 0, 0), 2: (-5, 2, -5), 3: (-7, 3, -8), 4: (4, 6, 6), 5: (12, 8, 12), 7: (14, 8, 13), 10: (7, 4, 6), 14: (0, 1, 0)},
             chs={0: (0, 0, 0), 3: (-2, 0, -14), 4: (0, 0, 4), 5: (4, 0, 18), 7: (5, 0, 20), 10: (3, 0, 9), 14: (0, 0, 0)},
             hd={0: (0, 0, 0), 3: (-3, 0, -20), 4: (1, 1, 12), 5: (6, 4, 36), 7: (7, 5, 40), 10: (4, 3, 22), 13: (1, 1, 6), 14: (0, 0, 0)},
             A={0: (0, 0, 0, 1, 1), 3: (-8, 4, -8, .9, 1), 5: (-6, 8, 30, .9, 1), 7: (-6, 8, 34, .9, 1), 11: (-2, 3, 12, 1, 1), 14: (0, 0, 0, 1, 1)},
             B={0: (0, 0, 0, 1, 1), 3: (-10, 6, 10, .85, 1), 5: (-8, 10, 40, .8, 1), 7: (-8, 10, 44, .8, 1), 11: (-3, 4, 16, .95, 1), 14: (0, 0, 0, 1, 1)},
             F={0: F0, 4: (F0[0] + 4, F0[1] - 2), 5: (F0[0] + 16, F0[1]), 8: (F0[0] + 18, F0[1]), 12: (F0[0] + 8, F0[1]), 14: F0}, K={0: B0, 3: (B0[0] - 4, B0[1]), 5: (B0[0] + 6, B0[1] - 4), 8: (B0[0] + 10, B0[1]), 12: (B0[0] + 3, B0[1]), 14: B0},
             ft={0: 0, 5: -8, 12: 0}, bt={0: 0, 5: -18, 8: -22, 12: 0})
    return K(T, i)
def a_gbs(i):      # GRANITE BLAST (the strong one): he drops low with his fists at his hips and the hair draws in and gathers (0-7), then the head drives forward (8: FIRE) with the whole body behind it, he slides back on his heels from the force (8-11) and straightens up (12-14)
    T = dict(pel={0: (0, 0, 0), 2: (-3, 6, -3), 5: (-6, 12, -6), 7: (-8, 14, -8), 8: (6, 12, 6), 9: (10, 10, 9), 11: (8, 7, 7), 14: (0, 1, 0)},
             chs={0: (0, 0, 0), 3: (-1, 0, -6), 6: (-2, 0, -12), 7: (-2, 0, -15), 8: (2, 0, 12), 9: (4, 0, 18), 11: (3, 0, 12), 14: (0, 0, 0)},
             hd={0: (0, 0, 0), 4: (-2, 1, -12), 7: (-3, 2, -22), 8: (3, 3, 26), 9: (6, 5, 38), 11: (5, 4, 28), 13: (1, 1, 8), 14: (0, 0, 0)},
             A={0: (0, 0, 0, 1, 1), 3: (-6, 8, 22, .88, 1), 6: (-10, 14, 34, .8, 1), 8: (-6, 10, 14, .9, 1), 11: (-4, 6, 14, .92, 1), 14: (0, 0, 0, 1, 1)},
             B={0: (0, 0, 0, 1, 1), 3: (-8, 12, 30, .84, 1), 6: (-12, 18, 46, .76, 1), 8: (-8, 12, 26, .85, 1), 11: (-6, 8, 24, .88, 1), 14: (0, 0, 0, 1, 1)},
             F={0: F0, 5: (F0[0] - 2, F0[1]), 9: (F0[0] + 4, F0[1]), 12: (F0[0] + 3, F0[1]), 14: F0}, K={0: B0, 6: (B0[0] - 8, B0[1]), 8: (B0[0] - 6, B0[1] - 1), 10: (B0[0] - 2, B0[1]), 14: B0},
             ft={0: 0, 9: -8, 13: 0}, bt={0: 0, 7: 6, 9: -12, 13: 0}, kb={0: None})
    return K(T, i)
def a_gbd(i):      # DOUBLE BLAST: two thrusts of the head one after the other: gather (0-2), the first blast (3: FIRE), the head comes back and gathers again (4-6), the second thrust, harder (7: FIRE), and the recovery (8-14)
    T = dict(pel={0: (0, 0, 0), 2: (-4, 3, -4), 3: (6, 5, 6), 4: (4, 5, 3), 6: (-3, 6, -5), 7: (10, 7, 10), 9: (9, 7, 9), 12: (3, 2, 3), 14: (0, 1, 0)},
             chs={0: (0, 0, 0), 2: (-1, 0, -8), 3: (3, 0, 12), 4: (1, 0, 6), 6: (-1, 0, -10), 7: (4, 0, 17), 9: (4, 0, 14), 12: (1, 0, 5), 14: (0, 0, 0)},
             hd={0: (0, 0, 0), 2: (-2, 0, -14), 3: (5, 3, 30), 4: (1, 1, 6), 6: (-3, 0, -16), 7: (6, 4, 36), 9: (6, 4, 32), 12: (2, 1, 10), 14: (0, 0, 0)},
             A={0: (0, 0, 0, 1, 1), 2: (-6, 6, 18, .9, 1), 3: (-4, 6, 10, .95, 1), 6: (-6, 7, 20, .9, 1), 7: (-4, 6, 10, .95, 1), 14: (0, 0, 0, 1, 1)},
             B={0: (0, 0, 0, 1, 1), 2: (-8, 10, 28, .85, 1), 3: (-6, 8, 22, .9, 1), 6: (-8, 10, 30, .85, 1), 7: (-6, 8, 22, .9, 1), 14: (0, 0, 0, 1, 1)},
             F={0: F0, 3: (F0[0] + 6, F0[1]), 6: (F0[0] + 2, F0[1]), 7: (F0[0] + 12, F0[1]), 10: (F0[0] + 12, F0[1]), 14: F0}, K={0: B0, 2: (B0[0] - 3, B0[1]), 7: (B0[0] + 4, B0[1] - 2), 10: (B0[0] + 5, B0[1]), 14: B0},
             ft={0: 0, 7: -6, 12: 0}, bt={0: 0, 7: -14, 12: 0})
    return K(T, i)
def a_gbj(i):      # the AIR TRIPLE: in the air with his knees tucked he drives his head down at the enemy twice (3 and 6: FIRE), then he tips his head back and looks up (8-9) and the third blast goes up (10: FIRE), and he falls back (11-14)
    T = dict(pel={0: (0, -1, -2), 2: (0, -2, 2), 3: (4, -2, 6), 5: (3, -2, 3), 6: (6, -2, 8), 8: (-2, -3, -6), 10: (-6, -2, -12), 12: (-2, 2, -4), 14: (0, 6, 0)},
             chs={0: (0, 0, -4), 3: (2, 0, 12), 5: (1, 0, 6), 6: (3, 0, 14), 8: (-2, 0, -12), 10: (-3, 0, -20), 12: (0, 0, -4), 14: (0, 0, 4)},
             hd={0: (0, 0, -4), 3: (4, 3, 32), 5: (1, 1, 14), 6: (5, 4, 36), 8: (-3, 0, -24), 10: (-5, -1, -42), 12: (-2, 0, -14), 14: (0, 0, 0)},
             A={0: (0, -6, -22, 1, 1), 3: (-4, 2, 10, .95, 1), 6: (-4, 2, 12, .95, 1), 9: (-6, 0, -14, .9, 1), 10: (-8, 2, -4, .9, 1), 13: (-2, 4, 8, .95, 1), 14: (0, 0, 0, 1, 1)},
             B={0: (0, -4, -26, .9, 1), 3: (-6, 4, 16, .9, 1), 6: (-6, 4, 18, .9, 1), 9: (-8, 0, -22, .85, 1), 10: (-10, 4, -6, .85, 1), 13: (-3, 6, 12, .9, 1), 14: (0, 0, 0, 1, 1)},
             F={0: (152, 130), 3: (156, 122), 6: (156, 124), 10: (150, 126), 12: (152, 138), 14: F0}, K={0: (66, 128), 3: (70, 122), 6: (70, 124), 10: (66, 126), 12: (56, 142), 14: B0},
             ft={0: 14, 6: 18, 10: 10, 13: 0}, bt={0: 12, 6: 14, 10: 8, 13: 0}, kb={0: 1, 12: 1, 14: None})
    return K(T, i)
def a_gbc(i):      # the LOW BLAST: from one knee he drops his head down and forward and the blast runs along the floor (0-3 gather, 4: FIRE, 5-8 hold, 9-14 back to the kneel)
    T = dict(pel={0: KNEEL['pel'], 2: (-8, 34, -2), 4: (-3, 36, 5), 6: (-1, 37, 8), 9: (-3, 35, 4), 14: KNEEL['pel']}, chs={0: KNEEL['chs'], 2: (0, 0, 7), 4: (1, 0, 18), 6: (2, 0, 22), 9: (1, 0, 14), 14: KNEEL['chs']},
             hd={0: KNEEL['hd'], 2: (-1, 1, -12), 4: (3, 4, 34), 6: (4, 5, 40), 9: (2, 3, 22), 14: KNEEL['hd']}, A={0: KNEEL['A'], 4: (-4, 8, 4, .9, 1), 6: (-4, 8, 6, .9, 1), 14: KNEEL['A']}, B={0: KNEEL['B'], 4: (-4, 14, 44, .88, 1), 6: (-4, 14, 44, .88, 1), 14: KNEEL['B']},
             F={0: KNEEL['F'], 4: (KNEEL['F'][0] + 6, F0[1]), 8: (KNEEL['F'][0] + 6, F0[1]), 14: KNEEL['F']}, K={0: KNEEL['K'], 14: KNEEL['K']}, ft={0: 0}, bt={0: KNEEL['bt']}, kb={0: 1})
    return K(T, i)
def a_gba(i):      # the AIR BLAST: a quick one with his knees tucked: the head goes back (0-2), then drives down and forward (3-4: FIRE on 4), he hangs there (5-8) and drops his legs for the landing (9-14)
    T = dict(pel={0: (0, -1, -2), 2: (-2, -2, -5), 3: (2, -2, 3), 4: (5, -2, 7), 7: (5, -2, 7), 10: (1, 0, 1), 12: (0, 4, 0), 14: (0, 6, 0)}, chs={0: (0, 0, -4), 2: (-1, 0, -10), 4: (3, 0, 14), 7: (3, 0, 14), 10: (1, 0, 4), 14: (0, 0, 2)},
             hd={0: (0, 0, -4), 2: (-2, 0, -16), 4: (5, 4, 34), 7: (5, 4, 34), 10: (2, 1, 12), 14: (0, 0, 0)}, A={0: (0, -6, -22, 1, 1), 4: (-4, 2, 12, .95, 1), 8: (-4, 2, 12, .95, 1), 12: (-2, 4, 8, .95, 1), 14: (0, 0, 0, 1, 1)},
             B={0: (0, -4, -26, .9, 1), 4: (-6, 4, 18, .9, 1), 8: (-6, 4, 18, .9, 1), 12: (-3, 6, 12, .9, 1), 14: (0, 0, 0, 1, 1)}, F={0: (152, 130), 4: (156, 124), 8: (156, 124), 11: (152, 140), 12: F0, 14: F0},
             K={0: (66, 128), 4: (70, 124), 8: (70, 124), 11: (56, 142), 12: B0, 14: B0}, ft={0: 14, 4: 18, 11: 6, 12: 0}, bt={0: 12, 4: 14, 11: 6, 12: 0}, kb={0: 1, 11: 1, 12: None})
    return K(T, i)
GB_ROWS = [('g1', a_gb1, [], False, None, .6), ('g2', a_gb2, [], False, (4, 0), .6), ('gs', a_gbs, [], False, None, .5), ('gd', a_gbd, [], False, None, .6), ('gj', a_gbj, [], False, None, .5), ('gc', a_gbc, [], False, None, .8), ('ga', a_gba, [], False, None, .5)]
# the hair is pushed to stand out in front when he drives his head forward (the extra turn in degrees and the stretch, picture by picture) and drawn in with the energy gathering (a negative turn)
GB_HAIR = {'g1': {0: (0, 1), 3: (-8, .95), 4: (-14, .9), 5: (14, 1.2), 6: (30, 1.55), 8: (34, 1.6), 10: (24, 1.3), 12: (10, 1.05), 14: (0, 1)},
           'g2': {0: (0, 1), 3: (-14, .9), 4: (14, 1.2), 5: (34, 1.6), 7: (38, 1.62), 10: (22, 1.25), 13: (8, 1), 14: (0, 1)},
           'gs': {0: (0, 1), 4: (-10, .9), 7: (-22, .82), 8: (16, 1.3), 9: (36, 1.7), 11: (30, 1.5), 13: (10, 1.05), 14: (0, 1)},
           'gd': {0: (0, 1), 2: (-14, .9), 3: (32, 1.55), 4: (6, 1), 6: (-16, .9), 7: (36, 1.65), 9: (32, 1.5), 12: (12, 1.05), 14: (0, 1)},
           'gj': {0: (0, 1), 3: (30, 1.5), 5: (10, 1.1), 6: (34, 1.55), 8: (14, 1.1), 9: (54, 1.35), 10: (78, 1.6), 11: (60, 1.4), 12: (20, 1.05), 14: (0, 1)},
           'gc': {0: (0, 1), 2: (-8, .95), 4: (30, 1.55), 6: (36, 1.6), 9: (20, 1.2), 14: (0, 1)},
           'ga': {0: (0, 1), 2: (-10, .95), 4: (32, 1.55), 7: (32, 1.55), 10: (12, 1.05), 14: (0, 1)}}
GB_FIRE = {'g1': (6, 7, 8), 'g2': (5, 6, 7), 'gs': (8, 9, 10, 11), 'gd': (3, 7, 8), 'gj': (3, 6, 10), 'gc': (4, 5, 6), 'ga': (4, 5, 6)}      # (the pictures with the flash at the hair)
GB_CHARGE = {'g1': (2, 5), 'g2': (1, 4), 'gs': (1, 8), 'gd': (0, 3, 4, 7), 'gj': (0, 3, 4, 6), 'gc': (0, 4), 'ga': (0, 4)}      # (pictures on which the energy gathers in the hair: from, to ...)
def hair_only(pose):      # the hair alone, drawn at the pose (the loose part with its turn and stretch)
    return rp.render(pose, skip=[k for k in rp.ORDER if k != 'hair'])
def hair_front(pose, gs):      # where the hair really ends in front of him (game px): the frontmost pixels of the hair as drawn
    cv = hair_only(pose); ys, xs = np.nonzero(cv[..., 3] > 0)
    if not len(xs): return gxy(locate(pose, 'hair', GB_TIP), gs)
    xm = xs.max(); sel = xs >= xm - 2; return gxy((xm - 50, float(ys[sel].mean()) - 36), gs)
def gb_fx(a, name, i, tip, hm=None):      # cyan light round the hair: sparks that gather while he charges, a white and cyan flash at the tip when he fires
    x, y = tip; ch = GB_CHARGE[name]; fire = i in GB_FIRE[name]; strong = name == 'gs'
    on0 = any(ch[k] <= i <= ch[k + 1] for k in range(0, len(ch), 2))
    if hm is not None and (fire or on0):      # (the hair itself turns to energy: white at the tip, cyan towards the root, grey for the strong blast; while he gathers only some of its pixels)
        k = 1.0 if fire else min(1.0, .25 + .75 * (i - ch[0]) / max(1, ch[1] - ch[0]))
        for yy, xx in zip(*np.nonzero(hm & (a[..., 3] > 0))):
            if math.hypot(xx - x, yy - y) > (11 if fire else 8): continue      # (only the front of the hair burns)
            if tuple(a[yy, xx, :3]) == rp.OUTLINE and not fire: continue
            if not fire and ((xx * 3 + yy * 5 + i) % 4) / 3.0 > k: continue
            u = max(0.0, min(1.0, (xx - (x - 11)) / 11.0)); c = np.array(CYW if u > .62 else (CYL if u > .3 else CY), float)
            if strong: c = c * .45 + np.array((196, 210, 214)) * .55
            if (xx + yy) % 2 == 0 and u < .85: c = np.minimum(255, c * 1.12 + 10)
            a[yy, xx, :3] = c.astype(np.uint8)
    on = any(ch[k] <= i <= ch[k + 1] for k in range(0, len(ch), 2)); gray = (200, 214, 218) if strong else CYL
    if on and not fire:
        u = (i - ch[0]) / max(1, ch[1] - ch[0]); n = 3 + int(5 * u)
        for j in range(n):      # (sparks fall in towards the hair)
            ang = (j * 2.4 + i * 1.3); r = (7 - 5 * u) * (.6 + .4 * ((j * 5 + i) % 3) / 2); put(a, x - 2 + math.cos(ang) * r, y + math.sin(ang) * r * .8, CYW if j % 3 == 0 else gray, over=False)
    if fire:
        k = (GB_FIRE[name].index(i) + 1) / len(GB_FIRE[name]); R = (5.5 if strong else 6.5) - 2.2 * k
        for yy in range(int(y - R) - 1, int(y + R) + 2):
            for xx in range(int(x - R) - 1, int(x + R) + 2):
                d = math.hypot(xx - x, yy - y)
                if d <= R and a[yy, xx, 3] == 0 if 0 <= xx < 64 and 0 <= yy < 64 else False: put(a, xx, yy, CYW if d < R * .4 else (gray if strong else CYL) if d < R * .75 else (CY if not strong else (143, 177, 185)))
        for j in range(8):      # (short rays)
            th = j * math.pi / 4 + i * .4; L = R + 2 + (j % 2) * 2
            for t in range(int(R), int(L) + 1): put(a, x + math.cos(th) * t, y + math.sin(th) * t, CYW if t < R + 1 else gray, over=False)

# ---------------------------------------------------------------- v1.172 JUST THIS ONCE (his ULTIMATE, see ryu.js): he stands still with his feet planted, the right hand held out in front of him like a gun with the index finger pointing at the enemy, and drives his head forward so that the HAIR
# stands out in front like a cannon barrel and fills with energy (the game draws the beam from its front tip, see ryu_gb.json). Four rows of 15 pictures: u1 = he plants his feet and raises the hand (the hair starts to glow), u2 = he holds it and the hair burns brighter (a loop), u3 = the beam fires:
# the recoil and the hold, u4 = the hand comes down and the hair settles. The finger is painted pixel by pixel (ju_hand) because the design's arm has no pointing hand; the hair is lit by ju_fx.
I0 = a_idle(0)      # (the boxer's stance the rows start from and end in)
JS = dict(pel=(0, -5, 1), chs=(2, 0, 6), hd=(8, 5, 34), A=(-12, 16, 56, .75, 1), B=(2, -3, -16, 1.35, 1), F=(F0[0] + 2, F0[1]), K=(B0[0] + 36, B0[1]), ft=0, bt=0)      # (the planted stance with the hand out, in the poses' numbers)
def ju_mix(prog):      # a pose between the boxer's stance (0) and the planted one (1): prog = {channel: how far (0 - 1)}
    return {c: mix(I0[c], JS[c], max(0.0, min(1.0, sm(prog.get(c, 0.0))))) for c in JS}
JU_FIN = {'u1': {0: 0, 5: 0, 9: 1, 14: 1}, 'u2': {0: 1}, 'u3': {0: 1}, 'u4': {0: 1, 3: 1, 8: 0, 14: 0}}      # (how far the finger is out, picture by picture: 0 = a fist, 1 = the index finger points)
def a_ju1(i):      # RAISE: he straightens out of the bounce and plants his feet wide (0-6), the right arm lifts and reaches out (3-9), the finger comes out (6-9), the head drives forward and the hair starts to stand (5-13)
    g = lambda a, b: kv({a: 0, b: 1}, i, lin)
    return ju_mix(dict(pel=g(0, 6), chs=g(1, 7), F=g(0, 6), K=g(0, 6), ft=g(0, 6), bt=g(0, 6), A=g(2, 8), B=g(3, 10), hd=g(5, 12)))
def a_ju2(i):      # CHARGE (a loop): he stands as still as a rock, the chest swells with every breath, the head and the arm tremble a little as the energy builds
    f = 2 * pi * i / 15; d = ju_mix({c: 1 for c in JS})
    d['pel'] = (d['pel'][0] + .5 * sin(f), d['pel'][1] + .5 * sin(2 * f + 1), d['pel'][2]); d['chs'] = (d['chs'][0], d['chs'][1] - .8 * sin(f + .6), d['chs'][2] + .8 * sin(f)); d['hd'] = (d['hd'][0], d['hd'][1], d['hd'][2] + 1.4 * sin(2 * f)); d['B'] = (d['B'][0], d['B'][1] + .5 * sin(3 * f), d['B'][2] + .8 * sin(2 * f + 1), d['B'][3], 1)
    return d
def a_ju3(i):      # FIRE: the beam leaves the hair and the force throws him back: the chest and the head jerk back and the feet slide (0-3), then he leans into it and holds against the push, shaking (4-12), and eases (13-14)
    d = ju_mix({c: 1 for c in JS}); r = kv({0: 0, 1: .6, 3: 1, 5: .8, 10: .6, 14: .35}, i); sh = sin(i * 2.6) * kv({0: 0, 3: 1, 11: 1, 14: .3}, i)
    d['pel'] = (d['pel'][0] - 7 * r + .6 * sh, d['pel'][1] + 1 * r, d['pel'][2] - 5 * r); d['chs'] = (d['chs'][0] - 1 * r, d['chs'][1], d['chs'][2] - 7 * r); d['hd'] = (d['hd'][0], d['hd'][1], d['hd'][2] - 5 * r + .8 * sh)
    d['F'] = (F0[0] + 2 - 4 * r, F0[1]); d['K'] = (B0[0] + 36 - 9 * r, B0[1]); d['B'] = (d['B'][0] - 3 * r, d['B'][1] + .5 * sh, d['B'][2] + 5 * r, d['B'][3], 1); d['bt'] = -12 * r; d['ft'] = -4 * r
    return d
def a_ju4(i):      # RELEASE: the arm comes down and the finger folds (0-8), the head comes up and the hair settles (3-11), he rocks back into his boxer's bounce (6-14)
    g = lambda a, b: 1 - kv({a: 0, b: 1}, i, lin)
    return ju_mix(dict(pel=g(5, 13), chs=g(4, 12), F=g(5, 13), K=g(5, 13), ft=g(5, 13), bt=g(5, 13), A=g(3, 11), B=g(0, 9), hd=g(2, 11)))
def w_ju3(i): return (0, 0)
JU_ROWS = [('u1', a_ju1, [], False, None, .5), ('u2', a_ju2, [], True, None, 1.0), ('u3', a_ju3, [], False, None, .6), ('u4', a_ju4, [], False, None, .5)]
JU_HAIR = {'u1': {0: (0, 1), 5: (-4, .96), 8: (16, 1.25), 11: (40, 1.9), 14: (48, 2.3)}, 'u2': {0: (48, 2.3), 4: (50, 2.4), 8: (48, 2.3), 12: (51, 2.45), 14: (48, 2.3)},
           'u3': {0: (54, 2.55), 3: (56, 2.65), 8: (54, 2.55), 12: (50, 2.4), 14: (48, 2.3)}, 'u4': {0: (48, 2.3), 3: (38, 1.9), 6: (22, 1.4), 9: (6, 1.06), 11: (0, 1), 14: (0, 1)}}      # (the hair's extra turn (degrees) and stretch, picture by picture)
JU_GLOW = {'u1': {0: 0, 5: 0, 7: .22, 10: .5, 14: .8}, 'u2': {0: .85, 5: 1, 10: .9, 14: .85}, 'u3': {0: 1.5, 1: 1.35, 3: 1.25, 8: 1.2, 12: 1.05, 14: .9}, 'u4': {0: .8, 3: .55, 6: .3, 9: .1, 11: 0}}      # (how much of the hair is lit, picture by picture: 0 = none, 1 = all of it, over 1 = the flash at the tip as well)
JU_ROW_NAMES = [r[0] for r in JU_ROWS]
def ju_hand(a, tip, ang, fin):
    """the hand at the end of the arm: a fist (3 pixels long, 4 high) with the thumb standing up and, when fin is more than 0, the index finger out straight along the top of the fist, like a gun; tip = the end of the arm in game px, ang = which way the arm points (degrees, down is +)"""
    th = math.radians(ang); ux, uy = cos(th), sin(th); nx, ny = -uy, ux; px = {}
    def dot(t, s_, c): px[(int(round(tip[0] + ux * t + nx * s_)), int(round(tip[1] + uy * t + ny * s_)))] = c
    L, M, D, W = (250, 222, 198), (222, 176, 148), (168, 118, 100), (255, 244, 232)
    for t in range(0, 3):      # (the fist: the upper rows light, the lower ones in shade)
        for s_, c in ((-1, L), (0, L), (1, M), (2, D)): dot(t, s_, c)
    n = int(round(5 * fin))
    for t in range(3, 3 + n): dot(t, -1, W if t == 2 + n else L)      # (the index finger, one pixel thick, a lighter tip)
    if n: dot(3, 0, M)      # (the base of the finger is two pixels thick)
    dot(0, -2, L); dot(1, -2, L); dot(0, -3, L)      # (the thumb stands up from the top of the fist)
    for (x, y), c in px.items():
        if 0 <= x < 64 and 0 <= y < 64: a[y, x] = (*c, 255)
    for (x, y) in list(px):      # (a dark outline round the hand)
        for dx in (-1, 0, 1):
            for dy in (-1, 0, 1):
                xx, yy = x + dx, y + dy
                if (xx, yy) not in px and 0 <= xx < 64 and 0 <= yy < 64 and a[yy, xx, 3] == 0: a[yy, xx] = (*rp.OUTLINE, 255)
def ju_fx(a, name, i, tip, hm):
    """the hair turns to energy from its front tip backwards: white at the tip, light cyan, then cyan towards the root; JU_GLOW says how much of it is lit; over 1 the muzzle flash at the tip as well; sparks fall in towards the tip"""
    lv = kv(JU_GLOW[name], i, lin); x, y = tip
    if lv > 0:
        for yy, xx in zip(*np.nonzero(hm & (a[..., 3] > 0))):
            d = math.hypot(xx - x, yy - y); reach = 5 + 17 * min(1.0, lv)
            if d > reach: continue
            if tuple(a[yy, xx, :3]) == rp.OUTLINE and lv < .95: continue
            if lv < 1 and ((xx * 3 + yy * 5 + i * 2) % 4) / 3.0 > lv * 1.25 + .1 - d / reach * .5: continue
            u = d / reach; c = np.array(CYW if u < .34 else (CYL if u < .66 else CY), float)
            if (xx + yy) % 2 == 0 and u > .3: c = np.minimum(255, c * 1.1 + 8)
            a[yy, xx, :3] = c.astype(np.uint8)
    if 0 < lv <= 1.2:      # (sparks fall in towards the tip while he gathers)
        n = int(2 + 7 * min(1.0, lv))
        for j in range(n):
            ang = j * 2.4 + i * 1.7; r = (3 + 9 * ((j * 7 + i * 3) % 5) / 4.0); put(a, x - 1 + math.cos(ang) * r, y + math.sin(ang) * r * .8, CYW if j % 3 == 0 else CYL if j % 3 == 1 else CY, over=False)
    if lv > 1.0:
        R = 4.2 + 3.4 * min(1.0, lv - 1.0)
        for yy in range(int(y - R) - 1, int(y + R) + 2):
            for xx in range(int(x - R) - 1, int(x + R) + 2):
                d = math.hypot(xx - x, yy - y)
                if d <= R and 0 <= xx < 64 and 0 <= yy < 64 and a[yy, xx, 3] == 0: put(a, xx, yy, CYW if d < R * .45 else CYL if d < R * .78 else CY)
        for j in range(8):
            th = j * math.pi / 4 + i * .5; L = R + 2 + (j % 2) * 3
            for t in range(int(R), int(L) + 1): put(a, x + math.cos(th) * t, y + math.sin(th) * t, CYW if t < R + 1 else CYL, over=False)

SH_OUT = {}      # (v1.172 the shift of the JUST THIS ONCE pictures, written to ryu_gb.json as ju_dx)
GB_OUT = {}      # (the front tip of the hair in every picture of the blast rows, game px in the 64 x 64 cell: written to ryu_gb.json)
ROWS = [('frames', a_idle, [], True, None, 2.4), ('walk', a_walk, [], True, (11.8, 0), 1.3), ('wback', lambda i: a_walk(i, True), [], True, (-8.8, 0), 1.3), ('jump', a_jump, [], False, w_jump, .35), ('cr', a_cdown, [], False, None, 1.2), ('ci', a_cidle, [], True, None, 2.4),
        ('cwk', a_cwalk, [], True, (4, 0), 1.6), ('bl', a_block, [], False, None, 1.5), ('dg', a_dash, ['body'], False, w_dash, .35), ('db', a_dashb, ['body'], False, w_dashb, .4), ('a0', a_hookL, [('armB', HAND_B)], False, None, .5), ('a1', a_hookR, [('armA', HAND_A)], False, None, .5),
        ('a2', a_kickup, ['foot'], False, None, .6), ('a3', a_jpunch, [('armB', HAND_B)], False, (3, 0), .45), ('cp', a_cleg, ['foot'], False, None, .8), ('as', a_slam, [('armA', HAND_A), ('armB', HAND_B)], False, None, .45), ('hp', a_hard, [('armB', HAND_B)], False, (2, 0), .5),
        ('fk', a_front, ['foot'], False, None, .6), ('hu', a_hurt, [], False, (-6, 0), .5), ('ko', a_ko, [], False, (-9, 0), .4)] + ROWS_V1163 + ROWS_V1164 + GB_ROWS + JU_ROWS
ROWN = [r[0] for r in ROWS]

def build_row(name, fn, eff, loop, wvel, mult=1.0):
    T = [fn(i) for i in range(15)]; poses = [mkpose(t) for t in T]; gs = [t.get('g', (0, 0)) for t in T]
    wv = [(wvel(i) if callable(wvel) else wvel) if wvel else (0, 0) for i in range(15)]
    sec = swing(poses, wv, loop, mult)
    for p, s in zip(poses, sec): p.update(s)
    if name in JU_HAIR:      # (v1.172 the fur cuff at the end of the long arm keeps its own size: the arm's stretch is taken out of it again)
        for i, p in enumerate(poses): c = p['cuffB']; p['cuffB'] = (c[0], c[1], c[2], 1.0 / max(.5, T[i]['B'][3]), 1)
    HR = GB_HAIR.get(name) or JU_HAIR.get(name)
    if HR:      # (v1.170 the hair stands out in front when he drives his head forward)
        for i, p in enumerate(poses): rot, sy = kv(HR, i); h = p['hair']; p['hair'] = (h[0], h[1], h[2] * .25 + rot, h[3], sy, h[5] * .25)
    ext = []; canv = []      # how far each picture's figure reaches in the cell (game px) when it is not shifted
    for pose in poses:
        cv = rp.render(pose); canv.append(cv); al = cv[..., 3] > 0; xs = np.where(al.any(axis=0))[0]; ys = np.where(al.any(axis=1))[0]
        if not len(xs): ext.append((32, 32, 0, 0)); continue
        gx = lambda x: rp.CX + (x - 50 - rp.HX) * rp.SCALE; gyy = lambda y: rp.GROUND + 1 - (rp.SOLE + 1 - (y - 36)) * rp.SCALE      # (the figure's own edges in game px, before the cell cuts them off)
        ext.append((int(math.floor(gx(xs.min()))), int(math.ceil(gx(xs.max() + 1))) - 1, int(math.floor(gyy(ys.min()))), int(math.ceil(gyy(ys.max() + 1))) - 1))
    if name in JU_HAIR: ext = [(e[0], e[1] + int(round(9 * kv(JU_FIN[name], i, lin))) + 2, e[2], e[3]) for i, e in enumerate(ext)]      # (the painted hand reaches beyond the arm)
    need = [min(0, 61 - e[1]) + max(0, 3 - e[0]) + int(round(gs[i][0])) for i, e in enumerate(ext)]      # (a negative number moves him left, a positive one right)
    near = [min(need[max(0, i - 2):i + 3]) if min(need) < 0 else max(need[max(0, i - 2):i + 3]) for i in range(15)]
    sh = [int(round(sum(near[max(0, i - 1):i + 2]) / len(near[max(0, i - 1):i + 2]))) for i in range(15)]
    sh = [min(sh[i], need[i]) if min(need) < 0 else max(sh[i], need[i]) for i in range(15)]
    gy = [int(round(gs[i][1])) + max(0, 1 - (ext[i][2] + int(round(gs[i][1])))) - max(0, ext[i][3] + int(round(gs[i][1])) - 62) for i in range(15)]      # (and down when the head would go through the top, up when he would sink into the floor)
    gs = [(sh[i], gy[i]) for i in range(15)]
    if name in JU_HAIR: SH_OUT[name] = [int(v) for v in sh]      # (how far each picture is shifted left (-) in its cell: the game draws it that much to the right again, see ryu.js)
    pos = []      # the effectors' positions picture by picture (game px)
    for i, pose in enumerate(poses):
        pts = []
        for e in eff:
            if e == 'foot': pts.append(gxy(T[i].get('F', F0), gs[i]))
            elif e == 'body': pts.append(gxy((rp.HX, 100), gs[i]))
            else: pts.append(gxy(locate(pose, *e), gs[i]))
        pos.append(pts)
    raw = rp.calm(rp.calm([rp.downscale(canv[i], dx=int(round(gs[i][0])), dy=int(round(gs[i][1]))) for i in range(15)], loop), loop)      # (the shading is calmed: no flicker from one picture to the next)
    frames = []
    for i, pose in enumerate(poses):
        a = rp.outline(raw[i])
        if name == 'bp' and 6 <= i <= 11:      # (v1.163 the fist of the blue punch: the right-most part of the figure above the legs, found before the action lines are drawn; the cell may cut the figure off, so this is read from the picture and not from the arm's numbers)
            ys, xs = np.where(a[..., 3] > 0); up = ys < 50; fx = int(xs[up].max()); sel = up & (xs >= fx - 5); fist = (min(pos[i][0][0] + 1, fx - 3), float(ys[sel].mean()))
        if eff:
            if name in ('dg', 'db'):
                r = max(0.0, 1 - abs(i - 7) / 4.5)
                if r > 0: a = smudge(a, int(2 + 9 * r), 1 if name == 'dg' else -1)
                if r > .25:
                    sgn = 1 if name == 'dg' else -1; pts = [(14 + (j % 3) * 9 - sgn * 4 * r + (3 if name == 'db' else 0), 20 + j * 6 + (i % 2), sgn * 8 * r, 0) for j in range(7)]
                    lines(a, pts, i, length=8, n=1, spread=0, over=False)
            elif name == 'dv':      # (v1.163 the dive: the body is smeared along its flight (pictures 2 - 7) and white lines run against it)
                r = max(0.0, 1 - abs(i - 4.5) / 3.2)
                if r > 0: a = smudge(a, int(2 + 8 * r), 1)
                if r > .3: lines(a, [(18 + (j % 3) * 9, 14 + j * 6 + (i % 2), 9 * r, 0) for j in range(6)], i, length=8, n=1, spread=0, over=False)
            else:
                prev = pos[i - 1] if i else pos[i]; vel = [(p[0] - q[0], p[1] - q[1]) for p, q in zip(pos[i], prev)]
                lines(a, [(p[0], p[1], v[0], v[1]) for p, v in zip(pos[i], vel)], i, n=3, spread=2.6, over=True)
            if name == 'bp' and 6 <= i <= 11: glow(a, fist[0], fist[1], {6: 3.6, 7: 4.6, 8: 6.2, 9: 6.0, 10: 5.2, 11: 4.0}[i])      # (v1.163 blue light round the fist while it flies and at the impact)
        if name in JU_HAIR:      # (v1.172 JUST THIS ONCE: the hand held out like a gun, and the hair lit)
            T_ = T[i]; ang = 7.6 + T_['B'][2] + T_['pel'][2] + T_['chs'][2]; ju_hand(a, gxy(locate(pose, 'armB', HAND_B), gs[i]), ang, kv(JU_FIN[name], i, lin))
            tip = hair_front(pose, gs[i]); GB_OUT.setdefault(name, [None] * 15)[i] = [round(tip[0], 1), round(tip[1], 1)]; ju_fx(a, name, i, tip, rp.downscale(hair_only(pose), dx=int(round(gs[i][0])), dy=int(round(gs[i][1])))[..., 3] > 0)
        elif name in GB_HAIR:
            tip = hair_front(pose, gs[i]); GB_OUT.setdefault(name, [None] * 15)[i] = [round(tip[0], 1), round(tip[1], 1)]; gb_fx(a, name, i, tip, rp.downscale(hair_only(pose), dx=int(round(gs[i][0])), dy=int(round(gs[i][1])))[..., 3] > 0)
        frames.append(a)
    return frames

if __name__ == '__main__':
    only = [a for a in sys.argv[1:] if not a.startswith('--') and a in ROWN]
    sheet = Image.new('RGBA', (15 * 64, len(ROWS) * 64), (0, 0, 0, 0)); path = sys.argv[sys.argv.index('--out') + 1] if '--out' in sys.argv else os.path.join(HERE, 'ryu_sheet.png')
    if only and os.path.exists(path): sheet = Image.open(path).convert('RGBA')      # (a partial rebuild keeps the other rows)
    if sheet.height < len(ROWS) * 64: s2 = Image.new('RGBA', (15 * 64, len(ROWS) * 64), (0, 0, 0, 0)); s2.paste(sheet, (0, 0)); sheet = s2
    for r, (name, fn, eff, loop, wv, mult) in enumerate(ROWS):
        if only and name not in only: continue
        fr = build_row(name, fn, eff, loop, wv, mult)
        for i, a in enumerate(fr): sheet.paste(Image.fromarray(a, 'RGBA'), (i * 64, r * 64))
    sheet.save(path)
    if GB_OUT:      # (the tips of the hair: merged into the file so that a partial rebuild keeps the other rows)
        gp = os.path.join(HERE, 'ryu_gb.json'); old = json.load(open(gp)) if os.path.exists(gp) else {}; old.update(GB_OUT); old.setdefault('ju_dx', {}).update(SH_OUT); json.dump(old, open(gp, 'w'), separators=(',', ':'))
    if '--preview' in sys.argv:
        d = sys.argv[sys.argv.index('--preview') + 1]; os.makedirs(d, exist_ok=True)
        for r, (name, fn, eff, loop, wv, mult) in enumerate(ROWS):
            if only and name not in only: continue
            row = sheet.crop((0, r * 64, 15 * 64, r * 64 + 64)); bg = Image.new('RGBA', row.size, (58, 62, 92, 255)); bg.alpha_composite(row); bg.resize((row.width * 2, row.height * 2), Image.NEAREST).save(os.path.join(d, 'row_%s.png' % name))
    print('ryu_sheet.png', sheet.size)
