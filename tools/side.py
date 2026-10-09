#!/usr/bin/env python3
"""Gojo in side view (facing right), same 64x64 16-bit style as the front idle.
6-frame wind idle + 6-frame walk forward + 6-frame walk backward -> side.json, side_sheet.png.
Wind is a headwind (blows right->left): hair, blindfold tails and jacket trail behind him."""
import math, json, sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from PIL import Image, ImageDraw
import gojo

PAL = gojo.PAL
N = 64
TOP, BOT = 4, 4                                 # jump frames get extra rows above/below the usual 64
NH = TOP + N + BOT
NW = 15                                              # frames in each walk cycle (idle has 6)
L1 = L2 = 10.0
sin, cos, rad = math.sin, math.cos, math.radians

def pm(pts):                                     # polygon -> set of pixels (aliased)
    im = Image.new('L', (N, NH), 0)
    ImageDraw.Draw(im).polygon([(round(x), round(y)) for x, y in pts], fill=255)
    a = im.load(); return {(x, y) for y in range(NH) for x in range(N) if a[x, y]}
def disc(cx, cy, r): return {(x, y) for y in range(NH) for x in range(N) if (x - cx) ** 2 + (y - cy) ** 2 <= r * r}
def seg(p0, p1, w0, w1):
    dx, dy = p1[0] - p0[0], p1[1] - p0[1]; l = math.hypot(dx, dy) or 1; nx, ny = -dy / l, dx / l
    return pm([(p0[0] + nx * w0 / 2, p0[1] + ny * w0 / 2), (p1[0] + nx * w1 / 2, p1[1] + ny * w1 / 2),
               (p1[0] - nx * w1 / 2, p1[1] - ny * w1 / 2), (p0[0] - nx * w0 / 2, p0[1] - ny * w0 / 2)])

class F:                                         # one frame of palette letters (64 wide, NH tall)
    def __init__(s): s.g = [['.'] * N for _ in range(NH)]
    def set(s, x, y, c):
        x, y = round(x), round(y)
        if 0 <= x < N and 0 <= y < NH: s.g[y][x] = c
    def at(s, x, y): return s.g[y][x] if 0 <= x < N and 0 <= y < NH else '.'
    def fill(s, m, c):
        for x, y in m: s.set(x, y, c)
    def rim(s, m, c='O'):                        # 1px outline just outside a part, over whatever is below it
        for x, y in m:
            for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                if (x + dx, y + dy) not in m: s.set(x + dx, y + dy, c)
    def bands(s, m, base, lit, shade):           # lit back edge, shaded front edge (like the front sprite)
        rows = {}
        for x, y in m: rows.setdefault(y, []).append(x)
        for y, xs in rows.items():
            if len(xs) >= 3:
                if s.at(min(xs), y) == base: s.set(min(xs), y, lit)
                if s.at(max(xs), y) == base: s.set(max(xs), y, shade)
    def line(s, pts, c):
        for (x0, y0), (x1, y1) in zip(pts, pts[1:]):
            n = max(abs(x1 - x0), abs(y1 - y0), 1)
            for k in range(int(n) + 1): s.set(x0 + (x1 - x0) * k / n, y0 + (y1 - y0) * k / n, c)

def gait(q, amp, kmax):                          # hip angle (forward +) and knee flex for a leg at phase q
    th = amp * cos(2 * math.pi * q)
    k = kmax * sin(2 * math.pi * (q - .5)) if q >= .5 else .12 * kmax * sin(2 * math.pi * q)
    return rad(th), rad(k)

SHOE = ((-2, -1), (2, -1), (4, 1), (7, 2), (7, 3), (-2, 3))

def leg(f, hx, hy, th, k, swing, near, foot=None):
    kn = (hx + L1 * sin(th), hy + L1 * cos(th)); al = th - k
    an = (kn[0] + L2 * sin(al), kn[1] + L2 * cos(al))
    body = seg((hx, hy), kn, 5.2, 4.4) | seg(kn, an, 4.4, 3.2) | disc(kn[0], kn[1], 2.3)
    ph = foot if foot is not None else (.55 * k if swing else 0)
    shoe = pm([(an[0] + x * cos(ph) - y * sin(ph), an[1] + x * sin(ph) + y * cos(ph)) for x, y in SHOE])
    f.fill(body, 'B'); f.fill(shoe, 'Q' if near else 'P')
    f.bands(body, 'B', 'C' if near else 'B', 'A')
    f.rim(body | shoe, 'O')
    f.fill(shoe, 'Q' if near else 'P')
    if near:                                     # sheen: thigh edge, knee crescent, shin dash, shoe gloss
        d = (sin(th), cos(th)); nf = (cos(th), -sin(th))
        f.line([(hx + nf[0] * 1.6 + d[0] * 3, hy + nf[1] * 1.6 + d[1] * 3), (kn[0] + nf[0] * 1.4 - d[0] * 3, kn[1] + nf[1] * 1.4 - d[1] * 3)], 'D')
        for dx, dy, c in ((1.4, -1, 'D'), (1.8, 0, 'E'), (1.4, 1, 'D'), (.4, 2, 'D')): f.set(kn[0] + nf[0] * dx + d[0] * dy, kn[1] + nf[1] * dx + d[1] * dy, c)
        sd = (sin(al), cos(al)); f.line([(kn[0] + sd[0] * 5 + .6, kn[1] + sd[1] * 5), (an[0] - sd[0] * 2 + .6, an[1] - sd[1] * 2)], 'D')
        for x, y in shoe:
            if (x, y - 1) not in shoe and (x - an[0]) > -1 and (x - an[0]) < 6: f.set(x, y, 'R')
        if foot is None or f.at(round(an[0] + 4), round(an[1] + 1)) == 'Q': f.set(an[0] + 4, an[1] + 1, 'Z')     # sole detail stays on the shoe when the foot is turned
    return kn, an

TIPS = [(27, 3), (30, 1), (33, 1), (36, 3)]
HAIR_TOP = {x: min(6, min(t + 2 * abs(x - tx) for tx, t in TIPS)) for x in range(25, 39)}
HAIR_TOP[25] = 7
HAIR_BOT = {25: 9, 26: 10, 27: 9, 28: 8, **{x: 6 for x in range(29, 39)}}

HEAD = [                      # x = 22..40, y = 11..18: band, tiny hair strip behind the ear, ear, nose, lips, chin
    "......MXXXXXJXJXJX.",
    "......MXXXXYXXXXXX.",
    "......MXXXXXXXXXXX.",
    "......MIIUUSSSSSST.",
    "......MMUVUSSSSSSST",
    ".......VSSSSSSVUV..",
    "..........VUUSSSV..",
    "............VVVV...",
]
TIPS = [(29, 4), (32, 1), (35, 0), (38, 3)]                     # four upright spikes, tallest just forward of the middle
CROWN = {x: min(10, round(min(t + 2.5 * abs(x - tx) for tx, t in TIPS))) for x in range(28, 39)}
STRAND = {(32, 2): 'I', (32, 3): 'I', (35, 1): 'I', (35, 2): 'I', (35, 3): 'I', (29, 5): 'I', (33, 6): 'I', (37, 6): 'I', (31, 8): 'I', (34, 8): 'I', (36, 8): 'I'}
SHINE = {(33, 5): 'W', (35, 4): 'W', (30, 7): 'W', (36, 7): 'W', (33, 8): 'W'}
assert all(len(r) == 19 for r in HEAD), [len(r) for r in HEAD]

def sole(ph): return max(x * sin(ph) + y * cos(ph) for x, y in SHOE)      # how far below the ankle a foot turned by ph reaches
def ik(hx, hy, ax, ay):                                                    # two-bone leg onto a planted ankle, knee in front -> thigh angle, knee flex
    d = min(math.hypot(ax - hx, ay - hy), L1 + L2 - 1e-6); a, b = math.atan2(ax - hx, ay - hy), math.acos(d / (L1 + L2))
    return a + b, 2 * b

GROUND = 58 + TOP                                                          # ankle row of a flat foot on the ground (its sole outline lands on row 62)
SQUAT = {0: (1, 1, 0), 1: (3, 2.5, 1), 2: (6, 4.5, 2), 13: (6, 4, 2), 14: (2, 1, 0)}    # frame: (hips down px, hips back px, torso lean px), feet flat and planted
AIR = {                                                                    # frame: near thigh, near knee, far thigh, far knee, foot (degrees)
    4: (-4, 6, -12, 10, 36),       # just left the ground, legs trailing, toes pointed
    5: (36, 54, 20, 34, 30),       # knees start to lift
    6: (70, 90, 50, 68, 26),       # knees rising
    7: (94, 118, 80, 104, 22),     # knees up to the crotch
    8: (98, 122, 84, 108, 22),     # top of the jump, fully tucked
    9: (82, 102, 66, 88, 24),      # starting to fall, knees lowering
    10: (44, 62, 28, 44, 30),      # legs reaching for the floor
    11: (12, 14, 0, 8, 36),        # legs long, toes pointed
}
AIR_LEAN = {4: 0, 5: 0, 6: 1, 7: 1, 8: 1, 9: 1, 10: 0, 11: 0}
JUMP_LIFT = [0, 0, 0, 0, 10, 16, 20, 22, 22, 20, 16, 10, 0, 0, 0]       # hip height gained per frame (the game moves the sprite up by this); feet-on-ground frames carry their own height

def jump_pose(i):                  # -> hip x, hip y, near thigh, near knee, far thigh, far knee, foot angle, torso lean
    if i in SQUAT:
        drop, back, lean = SQUAT[i]; hx, hy = 33 - back, 38 + TOP + drop
        return (hx, hy, *ik(hx, hy, 33.7, GROUND), *ik(hx, hy, 29.7, GROUND), 0.0, lean)
    if i in (3, 12):               # 3: push-off on the toes, back leg trailing.  12: touchdown on the toes, legs long
        ph = rad(32 if i == 3 else 28); ay = 61 + TOP - sole(ph); hx = 32.4 if i == 3 else 33; hy = round(ay - 19.6)
        far = (rad(-9), rad(18)) if i == 3 else ik(hx, hy, 30.3, ay)
        return (hx, hy, *ik(hx, hy, 33.7 if i == 3 else 34.3, ay), *far, ph, 1 if i == 3 else 0)
    a, b, c, d, fa = AIR[i]
    return (33, 38 + TOP, rad(a), rad(b), rad(c), rad(d), rad(fa), AIR_LEAN[i])

TELE_POSE = {                                          # frame: near thigh, near knee, far thigh, far knee, foot (deg), torso lean
    **{i: (98, 122, 84, 108, 22, 1) for i in range(7)},  # 0-6: the tucked pose from the top of the jump (charge, vanish, flash, arrive)
    7: (82, 102, 66, 88, 24, 0), 8: (60, 78, 44, 62, 28, 0), 9: (36, 50, 20, 34, 30, 0), 10: (14, 20, 2, 10, 34, 0), 11: (6, 8, -4, 6, 38, 0)}
TELE_SQUAT = {13: (8, 5, 3), 14: (3, 1.5, 0)}          # heavier landing than the normal jump: hips down, hips back, lean
TELE_K = [None, None, None, 1, 1, 1, 1, .972, .889, .75, .556, .306, 0, 0, 0]   # height as a fraction of the teleport height (None = where he vanished)

def tele_pose(i):
    if i == 12: return jump_pose(12)
    if i in TELE_SQUAT:
        drop, back, lean = TELE_SQUAT[i]; hx, hy = 33 - back, 38 + TOP + round(drop)
        return (hx, hy, *ik(hx, hy, 33.7, GROUND), *ik(hx, hy, 29.7, GROUND), 0.0, lean)
    a, b, c, d, fa, lean = TELE_POSE[i]
    return (33, 38 + TOP, rad(a), rad(b), rad(c), rad(d), rad(fa), lean)

GLOW = {'g': '#59b8ff', 'h': '#c8f2ff', 'j': '#2060d8', 'k': '#ffffff'}      # Six Eyes blues, same as the glowing eye on the title art
PAL.update(GLOW)
def cells_of(f): return [(x, y) for y in range(NH) for x in range(N) if f.g[y][x] != '.']
def lum(c): h = PAL[c].lstrip('#'); return sum(int(h[i:i + 2], 16) for i in (0, 2, 4))
def energy(f):                                         # the whole sprite as a blue-white energy silhouette
    for x, y in cells_of(f): f.g[y][x] = 'k' if lum(f.g[y][x]) >= 520 else 'h' if lum(f.g[y][x]) >= 300 else 'g' if lum(f.g[y][x]) >= 150 else 'j'
def warp(f, sx, sy, cx, cy):                           # squash / stretch about (cx, cy), inverse-mapped so there are no holes
    src = [r[:] for r in f.g]; f.g = [['.'] * N for _ in range(NH)]
    for y in range(NH):
        for x in range(N):
            ox, oy = round(cx + (x - cx) / sx), round(cy + (y - cy) / sy)
            if 0 <= ox < N and 0 <= oy < NH: f.g[y][x] = src[oy][ox]
def aura(f, c1='h', c2='g'):                           # bright 1px outline plus a dithered second ring
    body = set(cells_of(f)); n4 = ((1, 0), (-1, 0), (0, 1), (0, -1))
    ring = {(x + dx, y + dy) for x, y in body for dx, dy in n4} - body
    ring2 = {(x + dx, y + dy) for x, y in ring for dx, dy in n4} - body - ring
    for x, y in ring2:
        if (x + y) % 2 == 0: f.set(x, y, c2)
    for x, y in ring: f.set(x, y, c1)
def star(f, cx, cy, r, c, c2):                         # four-point sparkle: cross + short diagonals
    for k in range(-r, r + 1): f.set(cx + k, cy, c); f.set(cx, cy + k, c)
    for k in range(1, r // 2 + 1):
        for a_, b_ in ((1, 1), (1, -1), (-1, 1), (-1, -1)): f.set(cx + a_ * k, cy + b_ * k, c2)
    f.set(cx, cy, 'k')

def tele_fx(f, i):
    top = min(y for x, y in cells_of(f)); cy = top + 22
    if i == 0:   aura(f); star(f, 25, top + 6, 2, 'h', 'g'); star(f, 42, top + 16, 2, 'h', 'g'); star(f, 27, cy + 8, 1, 'h', 'g')     # charging
    elif i == 1: energy(f); warp(f, .62, 1.05, 33, cy); aura(f); star(f, 41, top + 4, 2, 'h', 'g')                                   # collapsing into light
    elif i == 2: energy(f); warp(f, .22, 1.12, 33, cy); aura(f, 'g', 'j'); star(f, 33, cy, 7, 'k', 'h')                              # a sliver and a pop: gone
    elif i == 3:                                                                                                                      # flash + light column where he arrives
        f.g = [['.'] * N for _ in range(NH)]
        for y in range(top - 2, top + 56): f.set(33, y, 'h' if (y // 2) % 2 == 0 else 'g'); f.set(34, y, 'g' if (y // 2) % 2 == 0 else 'j')
        star(f, 33, cy, 9, 'k', 'h')
        for x, y in ((24, cy - 9), (43, cy - 6), (26, cy + 14), (41, cy + 12)): star(f, x, y, 2, 'h', 'g')
    elif i == 4: energy(f); warp(f, .34, 1.1, 33, cy); aura(f, 'g', 'j'); star(f, 33, cy, 5, 'k', 'h')                              # thin sliver stepping out
    elif i == 5: energy(f); warp(f, .8, 1.02, 33, cy); aura(f)                                                                       # filling out
    elif i == 6: aura(f); star(f, 26, top + 3, 1, 'h', 'g'); star(f, 41, cy - 4, 1, 'h', 'g')                                        # arrived, still glowing
    elif 8 <= i <= 11:                                                                                                                # speed streaks above him while he drops
        n = [3, 5, 7, 9][i - 8]
        for x, ln in ((28, n), (32, n + 2), (36, n + 1), (39, n - 1)):
            for k in range(ln): f.set(x, top - 2 - k, 'h' if k % 3 == 0 else 'g')

# ---------------------------------------------------------------- 4-hit attack combo: right hook, left hook, right elbow (blue hands), roundhouse kick (red hands)
RED = {'r': '#ff3b3b', 'm': '#b0122a', 'n': '#ffc9b8'}      # Reversal Red
PAL.update(RED)
BLUE_FX, RED_FX = ('g', 'j', 'h'), ('r', 'm', 'n')          # outline, outer glow, highlight
UA, FA = 7.3, 7.0                                           # upper arm / forearm length (the pocket pose of the idle arm is exactly UA at -16 deg and FA at 45 deg)
POCKET = (-16, 45)
def ease(t, m): return t * t if m == 'in' else 1 - (1 - t) ** 2 if m == 'out' else t * t * (3 - 2 * t) if m == 'io' else t
def keyframe(keys, i):                                            # smooth interpolation between key poses (the easing belongs to the segment that ends at that key)
    for (f0, v0, _), (f1, v1, m) in zip(keys, keys[1:]):
        if f0 <= i <= f1:
            t = ease((i - f0) / (f1 - f0), m); return tuple(a + (b - a) * t for a, b in zip(v0, v1))
    return keys[-1][1]
# pose = (hips forward px, hips down px, torso lean px, near thigh, near knee, near foot, near upper arm, near forearm, far upper arm, far forearm, glow 0-1); angles in degrees, 0 = hanging down, + = forward/up
I0 = (0, 0, 0, 4, 0, 0, -16, 45, -16, 45, 0)
K = lambda f, v, m='io': (f, v, m)
ATK = {
    0: [K(0, I0), K(2, (-1, 1, -1, 4, 0, 0, 0, 105, -16, 45, .35)), K(4, (-2, 2, -2, 4, 0, 0, -55, -125, -16, 45, .6)),       # right hook: hand out, cock back, whip through, follow, return
        K(6, (1, 1, 1, 4, 0, 0, 35, 125, -16, 45, .9), 'in'), K(7, (3, 1, 3, 4, 0, 0, 72, 100, -16, 45, 1), 'in'),
        K(9, (4, 1, 3, 4, 0, 0, 100, 112, -16, 45, .85), 'out'), K(11, (2, 1, 1, 4, 0, 0, 30, 110, -16, 45, .4)), K(14, I0)],
    1: [K(0, I0), K(2, (-1, 1, -1, 4, 0, 0, 15, 135, 0, 105, .35)), K(4, (-2, 2, -2, 4, 0, 0, 15, 135, -55, -125, .6)),      # left hook: far arm swings, near hand guards the chin
        K(6, (1, 1, 1, 4, 0, 0, 12, 132, 35, 125, .9), 'in'), K(7, (3, 1, 3, 4, 0, 0, 10, 130, 72, 100, 1), 'in'),
        K(9, (4, 1, 3, 4, 0, 0, 12, 132, 100, 112, .85), 'out'), K(11, (2, 1, 1, 4, 0, 0, 12, 130, 30, 110, .4)), K(14, I0)],
    2: [K(0, I0), K(2, (-1, 1, -1, 4, 0, 0, 20, 160, -16, 45, .35)), K(4, (-3, 2, -2, 4, 0, 0, -40, 105, -16, 45, .6)),       # right elbow: fist by the chin, elbow drives forward
        K(6, (0, 1, 1, 4, 0, 0, 50, 150, -16, 45, .9), 'in'), K(7, (4, 1, 3, 4, 0, 0, 88, 188, -16, 45, 1), 'in'),
        K(9, (5, 1, 3, 4, 0, 0, 95, 195, -16, 45, .85), 'out'), K(11, (2, 1, 1, 4, 0, 0, 30, 140, -16, 45, .4)), K(14, I0)],
    3: [K(0, I0), K(2, (-1, 0, -1, 30, 60, 15, -40, -10, 20, 120, .35)), K(4, (-2, 1, -2, 88, 120, 25, -70, -30, 30, 130, .6)),   # roundhouse: knee up, leg whips round, arms out for balance
        K(6, (-2, 1, -3, 108, 80, 15, -75, -35, 35, 135, .85), 'in'), K(8, (-1, 1, -4, 118, 8, -5, -80, -40, 40, 140, 1), 'in'),
        K(9, (-1, 1, -4, 120, 10, -5, -80, -40, 40, 140, .9), 'out'), K(11, (-1, 1, -2, 80, 100, 10, -60, -20, 25, 125, .5)),
        K(13, (0, 0, -1, 20, 25, 0, -30, 0, 0, 80, .15)), K(14, I0)],
}
ATK_HANDS = {0: 'n', 1: 'f', 2: 'n', 3: 'nf'}               # which hand(s) glow
ATK_IMPACT = [7, 7, 7, 8]
PT = {}                                                     # attack point (fist / elbow / toe) per frame, for the motion trails

def glowring(f, cells, gl, fx):
    c1, c2, _ = fx; n4 = ((1, 0), (-1, 0), (0, 1), (0, -1))
    r1 = {(x + dx, y + dy) for x, y in cells for dx, dy in n4} - cells; r2 = {(x + dx, y + dy) for x, y in r1 for dx, dy in n4} - cells - r1
    if gl > .15:
        for x, y in r2:
            if (x + y) % 2 == 0 or gl > .8: f.set(x, y, c2)
    if gl > .45:
        for x, y in r1: f.set(x, y, c1)
def draw_arm(f, S, ua, fa, near, gl, fx):                   # shoulder -> elbow -> wrist -> fist; returns elbow and fist centre
    a, b = rad(ua), rad(fa)
    E = (S[0] + UA * sin(a), S[1] + UA * cos(a)); W = (E[0] + FA * sin(b), E[1] + FA * cos(b)); H = (W[0] + 2.0 * sin(b), W[1] + 2.0 * cos(b))
    body = seg(S, E, 4.2, 3.6) | seg(E, W, 3.4, 2.6) | disc(E[0], E[1], 2.0)
    base, lit = ('B', 'C') if near else ('A', 'A')          # the far arm is darker so it reads as behind the body
    f.fill(body, base); f.bands(body, base, lit, 'A'); f.rim(body, 'O')
    if near: f.line([(S[0] + 1, S[1] + 2), (E[0] + 1, E[1] - 1)], 'D'); f.line([(E[0] + 2, E[1] + 2), (W[0] - 1, W[1] - 1)], 'D')
    if abs(ua - POCKET[0]) + abs(fa - POCKET[1]) > 12 or gl > 0:      # hand out of the pocket: a fist with the glow around it
        fist = disc(H[0], H[1], 2.3); f.fill(fist, 'S')
        for x, y in fist:
            d = (x - H[0]) + (y - H[1]); f.set(x, y, 'T' if d < -1.3 else 'U' if d > 1.4 else 'S')
        if gl > .45: glowring(f, fist, gl, fx)
        else: f.rim(fist, 'V'); glowring(f, fist, gl, fx)
        if gl > .8:
            for k in range(3): ang = rad(120 * k + 47 * ((ua + 360) % 7)); f.set(H[0] + 4.2 * cos(ang), H[1] + 4.2 * sin(ang), fx[2])
    elif near: f.set(W[0] + 1, W[1], 'S'); f.set(W[0] + 1, W[1] + 1, 'U')          # hand still in the pocket
    return E, H
def burst_fx(f, i, k, fx):                                  # impact flash, then a ring that expands and fades
    c1, c2, c3 = fx; imp = ATK_IMPACT[k]
    if i < imp or i > imp + 2: return
    x, y = PT[(k, imp)]
    if i == imp:
        for d in range(-6, 7): f.set(x + d, y, c3 if abs(d) > 2 else 'k'); f.set(x, y + d, c3 if abs(d) > 2 else 'k')
        for d in range(1, 4):
            for sx, sy in ((1, 1), (1, -1), (-1, 1), (-1, -1)): f.set(x + sx * d, y + sy * d, c1)
        f.set(x, y, 'k')
    else:
        r = 5 + 3 * (i - imp)
        for a in range(0, 360, 10 if i == imp + 1 else 18):
            if (a // 10) % 2 == 0: f.set(x + r * cos(rad(a)), y + r * sin(rad(a)), c1 if i == imp + 1 else c2)
def atk_fx(f, i, k, an, foot, nfp, E, Hn, Hf, gl):
    fx = RED_FX if k == 3 else BLUE_FX
    ph = foot
    if k == 3: pt = (an[0] + 7 * cos(ph) - 2.5 * sin(ph), an[1] + 7 * sin(ph) + 2.5 * cos(ph))     # toe of the kicking foot
    elif k == 2: pt = (E[0] + 2.4 * sin(rad(nfp)), E[1] + 2.4 * cos(rad(nfp)))                       # tip of the elbow
    else: pt = Hf if k == 1 else Hn
    PT[(k, i)] = pt
    for back, col in ((1, fx[0]), (2, fx[1])):               # motion trail while the strike is fast and glowing
        if i - back >= 0 and gl > .55 and ATK_IMPACT[k] - 2 <= i <= ATK_IMPACT[k] + 1:
            p0, p1 = PT[(k, i - back)], PT[(k, i - back + 1)]
            if 2.5 < math.hypot(p1[0] - p0[0], p1[1] - p0[1]) < 18: f.line([p0, p1], col)
    burst_fx(f, i, k, fx)

def build(kind, i):
    idx = i                               # (i is reused for the head loop below)
    f = F(); u = F()                      # f: legs, u: everything above the hips
    hx, foot, lean = 33, None, 0
    atk = kind.startswith('atk'); foot2 = None
    if kind == 'idle':
        L = [.15, .35, .55, .7, .5, .25][i]; bob = [0, 0, 0, 1, 1, 0][i]
        thn, kn_, thf, kf, swn, swf = rad(4), 0, rad(-8), 0, False, False; p = i / 6
    elif kind in ('jump', 'tele'):
        hx, hy, thn, kn_, thf, kf, foot, lean = (jump_pose if kind == 'jump' else tele_pose)(i); swn = swf = False; L = 0; bob = 0; p = 0
    elif atk:
        k_ = int(kind[3:]); dx, dy, lean, nth, nk, nf, nua, nfa, fua, ffa, gl = pv = keyframe(ATK[k_], i)
        hx, hy = 33 + dx, 38 + TOP + round(dy); swn = swf = False; L = 0; bob = 0; p = 0; foot = 0.0
        thf, kf = ik(hx, hy, 29.7, GROUND)
        if k_ == 3: thn, kn_, foot2 = rad(nth), rad(nk), rad(nf)
        else: thn, kn_ = ik(hx, hy, 33.7, GROUND)
    else:
        amp, kmax = (26, 50) if kind == 'fwd' else (20, 40)
        p = i / NW if kind == 'fwd' else ((-i) % NW) / NW
        qn, qf = p % 1, (p + .5) % 1
        thn, kn_ = gait(qn, amp, kmax); thf, kf = gait(qf, amp, kmax); swn, swf = qn >= .5, qf >= .5
        L = .8 + .25 * sin(2 * math.pi * i / NW) if kind == 'fwd' else max(-.2, .05 + .12 * sin(2 * math.pi * i / NW)); bob = 0
    drop = lambda th, k: L1 * cos(th) + L2 * cos(th - k)
    if kind not in ('jump', 'tele') and not atk: hy = round(58 + TOP - max(drop(thn, kn_), drop(thf, kf)))
    dxb = round(hx - 33)                                   # the body follows the hips (the planted feet stay put)
    oy = hy - 34; hb = bob
    wave = round(sin(2 * math.pi * 2 * i / NW)) if kind in ('fwd', 'back') else [0, 1, 0, -1, 0, 1][i % 6]      # tail sway: whole cycles per loop, so the walk loops without a pop
    leg(f, hx, hy, thf, kf, swf, False, foot)
    kn, an = leg(f, hx, hy, thn, kn_, swn, True, foot if foot2 is None else foot2)

    # jacket (+ flap trailing behind in the wind)
    jk = set()
    for y in range(17, 35):
        a, b = (31, 35) if y == 17 else (30, 36) if y < 23 else (30, 35) if y < 30 else (30, 36)
        jk |= {(x, y + oy) for x in range(a, b + 1)}
    u.fill(jk, 'B'); u.bands(jk, 'B', 'C', 'A'); u.rim(jk, 'O')                 # lower clothes stay still: no flap, no billow
    # near arm, hand in the pocket (the attacks draw their own arms further down)
    if not atk:
        sw = round(1.2 * sin(2 * math.pi * p)) * (-1 if kind == 'back' else 1) if kind in ('fwd', 'back') else 0
        S, E, P = (32, 18 + oy), (30 + sw, 25 + oy), (35, 30 + oy)
        arm = seg(S, E, 4.2, 3.6) | seg(E, P, 3.4, 2.6) | disc(E[0], E[1], 2.0)
        u.fill(arm, 'B'); u.bands(arm, 'B', 'C', 'A'); u.rim(arm, 'O')
        u.line([(S[0] + 1, S[1] + 2), (E[0] + 1, E[1] - 1)], 'D'); u.line([(E[0] + 2, E[1] + 2), (P[0] - 1, P[1] - 1)], 'D')
        u.set(P[0] + 1, P[1], 'S'); u.set(P[0] + 1, P[1] + 1, 'U')
    # jacket sheen
    u.line([(32, 17 + oy), (35, 17 + oy)], 'D'); u.set(34, 17 + oy, 'E')
    u.line([(35, 19 + oy), (35, 22 + oy)], 'D'); u.line([(32, 24 + oy), (34, 27 + oy)], 'D')
    u.line([(31, 25 + oy), (31, 28 + oy)], 'D'); u.line([(31, 33 + oy), (35, 33 + oy)], 'D')
    # collar (high, black, sheen strips)
    col = pm([(31, 12 + oy + hb), (32, 13 + oy + hb), (34, 15 + oy + hb), (37, 15 + oy + hb), (37, 19 + oy), (31, 19 + oy)])
    u.fill(col, 'B'); u.bands(col, 'B', 'C', 'A'); u.rim(col, 'O')
    u.line([(32, 16 + oy + hb), (34, 17 + oy + hb)], 'D'); u.line([(35, 18 + oy), (36, 18 + oy)], 'D'); u.set(31, 14 + oy + hb, 'D')
    # blindfold tails first (they emerge from under the hair at the back and trail in the wind)
    for y, a_ in ((11, 29), (12, 29), (13, 29)): u.fill({(x, y + oy - 4 + hb) for x in range(a_, 40)}, 'X')
    for k, dx0 in enumerate((0, 1)):                             # short blindfold tails hang behind the head (tiny sway)
        pts = [(27 - dx0 - (j + 1) // 2 + (wave if j >= 1 else 0), 12 + oy - 4 + hb + j + k) for j in range(3)]
        for x, y in pts: u.set(x, y, 'X'); u.set(x + 1, y, 'X')
        u.set(*pts[1], 'Y')
    # head, hand-drawn (x = 22 + column, y = 1 + row): static face/band first, then the hair on top, sheared by the wind
    tip = {'idle': [0, 0, 1, 1, 0, -1], 'fwd': [round(sin(2 * math.pi * 2 * k / NW)) for k in range(NW)], 'back': [round(sin(2 * math.pi * (2 * k + 4) / NW)) for k in range(NW)], 'jump': [0, 0, 1, 1, 0, -1] * 3, 'tele': [0, 0, 1, 1, 0, -1] * 3, **{f'atk{j}': [0, 0, 1, 1, 0, -1] * 3 for j in range(4)}}[kind][i]
    sh = lambda y: tip if y <= 1 else 0                        # hair stays upright; only the tip pixels flutter
    hair = []
    for x, top in CROWN.items():                              # crown: white, lavender toward the band
        for y in range(top, 11):
            c = SHINE.get((x, y)) or STRAND.get((x, y)) or ('H' if y <= 8 else ('H' if (x + y) % 2 == 0 else 'I') if y == 9 else ('I' if (x + y) % 2 == 0 else 'J'))
            hair.append((x + sh(y), y + oy - 4 + hb, c))
    for r, row in enumerate(HEAD):
        for i, ch in enumerate(row):
            if ch == '.': continue
            x, y = 22 + i, 11 + r
            if ch in 'MHIJW': hair.append((x + sh(y), y + oy - 4 + hb, ch))
            else: u.set(x, y + oy - 4 + hb, ch)
    for x, y, ch in hair: u.set(x, y, ch)
    for x, y, ch in hair:                                    # re-outline any edge the shear exposed
        if ch != 'M' and any(u.at(x + dx, y + dy) == '.' for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1))): u.set(x, y, 'M')
    if atk:                                               # the far arm goes first so the torso covers its shoulder
        Sy = hy - 16; Sx = 32 + dxb + round(.8 * lean); fxc = RED_FX if k_ == 3 else BLUE_FX
        _, Hf = draw_arm(f, (Sx - 1, Sy), fua, ffa, False, gl if 'f' in ATK_HANDS[k_] else 0, fxc)
    for y in range(NH):                                                   # lean the torso/head forward and slide it over the planted feet
        for x in range(N):
            c = u.g[y][x]
            if c != '.': f.set(x + dxb + round(lean * max(0.0, (34 + oy - y) / 20.0)), y, c)
    if atk:                                               # near arm in front of everything, then glow trail and impact flash
        E, Hn = draw_arm(f, (Sx, Sy), nua, nfa, True, gl if 'n' in ATK_HANDS[k_] else 0, fxc)
        atk_fx(f, idx, k_, an, foot2 if foot2 is not None else 0.0, nua, E, Hn, Hf, gl)
    if kind == 'tele': tele_fx(f, idx)
    return f

def rows(f, x0, w): return [''.join(r[x0:x0 + w]) for r in f.g]

sets = {k: [build(k, i) for i in range(NW if k in ('fwd', 'back') else 15 if k in ('jump', 'tele') or k.startswith('atk') else 6)] for k in ('idle', 'fwd', 'back', 'jump', 'tele', 'atk0', 'atk1', 'atk2', 'atk3')}
for k in ('idle', 'fwd', 'back'):
    for f in sets[k]: f.g = f.g[TOP:TOP + N]
cells = [(x, y) for k, fs in sets.items() if not k.startswith('atk') for f in fs for y in range(len(f.g)) for x in range(N) if f.g[y][x] != '.']
acx = [x for k, fs in sets.items() if k.startswith('atk') for f in fs for r in f.g for x, c in enumerate(r) if c != '.']
ax0, ax1 = min(acx) - 1, max(acx) + 1        # one window for the four attack sets (they reach further forward than the others)
x0, x1 = min(x for x, y in cells) - 1, max(x for x, y in cells) + 1
print('bbox cols', x0 + 1, x1 - 1, 'rows', min(y for x, y in cells), max(y for x, y in cells))
bad = {c for f in (f for fs in sets.values() for f in fs) for r in f.g for c in r} - set(PAL) - {'.'}
assert not bad, bad
def win(k): return (ax0, ax1) if k.startswith('atk') else (x0, x1)
json.dump({k: {'x0': win(k)[0], 'w': win(k)[1] - win(k)[0] + 1, 'h': len(fs[0].g), 'top': TOP if k in ('jump', 'tele') or k.startswith('atk') else 0, 'cx': 33, 'frames': [rows(f, win(k)[0], win(k)[1] - win(k)[0] + 1) for f in fs], **({'lift': JUMP_LIFT} if k == 'jump' else {}), **({'lift_k': TELE_K} if k == 'tele' else {})} for k, fs in sets.items()}, open('side.json', 'w'))
d_ = json.load(open('side.json')); d_['pal_extra'] = {**GLOW, **RED}; json.dump(d_, open('side.json', 'w'))

def render(f, sc, bg):
    H = len(f.g); im = Image.new('RGB', ((x1 - x0 + 1) * sc, H * sc), bg); px = im.load()
    for y in range(H):
        for x in range(x0, x1 + 1):
            c = f.g[y][x]
            if c != '.':
                h = PAL[c].lstrip('#'); rgb = tuple(int(h[i:i + 2], 16) for i in (0, 2, 4))
                for dy in range(sc):
                    for dx in range(sc): px[(x - x0) * sc + dx, y * sc + dy] = rgb
    return im
sc, W = 3, x1 - x0 + 1
sheet = Image.new('RGB', (8 * (W * sc + 4), 4 * (N * sc + 4)), (110, 110, 128))      # fwd frames 1-15 in rows 1-2, back frames 1-15 in rows 3-4
for r, k in enumerate(('fwd', 'back')):
    for i, f in enumerate(sets[k]): sheet.paste(render(f, sc, (110, 110, 128)), ((i % 8) * (W * sc + 4), (r * 2 + i // 8) * (N * sc + 4)))
sheet.save('side_sheet.png')
render(sets['idle'][0], 8, (110, 110, 128)).save('side_idle0.png'); print('sheet', sheet.size)

trio = Image.new('RGB', (3 * (W * 6 + 6), N * 6), (110, 110, 128))
for j, (k, i) in enumerate((('idle', 3), ('fwd', 2), ('back', 5))): trio.paste(render(sets[k][i], 6, (110, 110, 128)), (j * (W * 6 + 6), 0))
trio.save('side_trio.png')

jsheet = Image.new('RGB', (8 * (W * 3 + 4), 2 * (NH * 3 + 4)), (110, 110, 128))
for i, f in enumerate(sets['jump']): jsheet.paste(render(f, 3, (110, 110, 128)), ((i % 8) * (W * 3 + 4), (i // 8) * (NH * 3 + 4)))
jsheet.save('jump_sheet.png')
sc2, PADY = 2, 26                                                          # motion strip: every frame at its real height above the ground line
strip = Image.new('RGB', (15 * (W * sc2 + 2), (NH + PADY) * sc2), (110, 110, 128)); dr = ImageDraw.Draw(strip)
gl = (PADY + TOP + 63) * sc2; dr.line([(0, gl), (strip.width, gl)], fill=(240, 220, 120), width=1)
for i, f in enumerate(sets['jump']): strip.paste(render(f, sc2, (110, 110, 128)), (i * (W * sc2 + 2), (PADY - JUMP_LIFT[i]) * sc2))
strip.save('jump_strip.png'); print('jump sheet', jsheet.size, 'strip', strip.size)
