#!/usr/bin/env python3
"""Gojo in side view (facing right), same 64x64 16-bit style as the front idle.
6-frame wind idle + 6-frame walk forward + 6-frame walk backward -> side.json, side_sheet.png.
Wind is a headwind (blows right->left): hair, blindfold tails and jacket trail behind him."""
import math, json, sys, os, random
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from PIL import Image, ImageDraw
import gojo, ce

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

def leg(f, hx, hy, th, k, swing, near, foot=None, rimc='O'):
    kn = (hx + L1 * sin(th), hy + L1 * cos(th)); al = th - k
    an = (kn[0] + L2 * sin(al), kn[1] + L2 * cos(al))
    body = seg((hx, hy), kn, 5.2, 4.4) | seg(kn, an, 4.4, 3.2) | disc(kn[0], kn[1], 2.3)
    ph = foot if foot is not None else (.55 * k if swing else 0)
    shoe = pm([(an[0] + x * cos(ph) - y * sin(ph), an[1] + x * sin(ph) + y * cos(ph)) for x, y in SHOE])
    f.fill(body, 'B'); f.fill(shoe, 'Q' if near else 'P')
    f.bands(body, 'B', 'C' if near else 'B', 'A')
    f.rim(body | shoe, rimc)
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
BLUE_FX, RED_FX = ('g', 'j', 'h'), ('r', 'm', 'n')
PAL['y'] = PAL['V']                                          # the outline of a hand that is out, drawn with its own letter in the hands-out poses so red mode can make it red (the same colour as before otherwise)          # outline, outer glow, highlight
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
def draw_arm(f, S, ua, fa, near, gl, fx, rimc='O'):                   # shoulder -> elbow -> wrist -> fist; returns elbow and fist centre
    a, b = rad(ua), rad(fa)
    E = (S[0] + UA * sin(a), S[1] + UA * cos(a)); W = (E[0] + FA * sin(b), E[1] + FA * cos(b)); H = (W[0] + 2.0 * sin(b), W[1] + 2.0 * cos(b))
    body = seg(S, E, 4.2, 3.6) | seg(E, W, 3.4, 2.6) | disc(E[0], E[1], 2.0)
    base, lit = ('B', 'C') if near else ('A', 'A')          # the far arm is darker so it reads as behind the body
    f.fill(body, base); f.bands(body, base, lit, 'A'); f.rim(body, rimc)
    if near: f.line([(S[0] + 1, S[1] + 2), (E[0] + 1, E[1] - 1)], 'D'); f.line([(E[0] + 2, E[1] + 2), (W[0] - 1, W[1] - 1)], 'D')
    if abs(ua - POCKET[0]) + abs(fa - POCKET[1]) > 12 or gl > 0:      # hand out of the pocket: a fist with the glow around it
        fist = disc(H[0], H[1], 2.3); f.fill(fist, 'S')
        for x, y in fist:
            d = (x - H[0]) + (y - H[1]); f.set(x, y, 'T' if d < -1.3 else 'U' if d > 1.4 else 'S')
        if gl > .45: glowring(f, fist, gl, fx)
        else: f.rim(fist, 'y' if HO else 'V'); glowring(f, fist, gl, fx)
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
    if k in (4, 5, 8): lapse_fx(f, i, k, Hn); return
    fx = BLUE_FX
    ph = foot
    if k in (3, 15, 17, 18, 19): pt = (an[0] + 7 * cos(ph) - 2.5 * sin(ph), an[1] + 7 * sin(ph) + 2.5 * cos(ph))     # toe of the kicking foot
    elif k == 2: pt = (E[0] + 2.4 * sin(rad(nfp)), E[1] + 2.4 * cos(rad(nfp)))                       # tip of the elbow
    else: pt = Hf if k in (1, 7, 16, 20) else Hn
    PT[(k, i)] = pt
    for back, col in ((1, fx[0]), (2, fx[1])):               # motion trail while the strike is fast and glowing
        if i - back >= 0 and gl > .55 and ATK_IMPACT[k] - 2 <= i <= ATK_IMPACT[k] + 1:
            p0, p1 = PT[(k, i - back)], PT[(k, i - back + 1)]
            if 2.5 < math.hypot(p1[0] - p0[0], p1[1] - p0[1]) < 18: f.line([p0, p1], col)
    burst_fx(f, i, k, fx)

# ---------------------------------------------------------------- 10 hit reactions x 10 frames (Gojo's own pose, normal colours; the game also uses them inverted for the dummy)
RX_ORDER = ('dx', 'dy', 'lean', 'hs', 'rot', 'sx', 'nax', 'nl', 'fax', 'fl', 'nua', 'nfa', 'fua', 'ffa')     # hips fwd, hips down, torso lean, head shift, body rotation, horizontal scale, feet x / lift (near, far), arm angles
def P(**kw):
    v = dict(dx=0, dy=0, lean=0, hs=0, rot=0, sx=1, nax=0, nl=0, fax=0, fl=0, nua=-16, nfa=45, fua=-16, ffa=45); v.update(kw); return tuple(v[k] for k in RX_ORDER)
RX = {
    0: [K(0, P(lean=-1, hs=-5)), K(1, P(dx=-1, lean=-3, hs=-9)), K(3, P(dx=-1, lean=-2, hs=-6)), K(6, P(lean=-1, hs=-2)), K(9, P())],                                  # head snaps back
    1: [K(0, P(dx=-1, dy=1, lean=2, hs=2, nua=-10, nfa=90)), K(2, P(dx=-2, dy=3, lean=6, hs=5, nua=-10, nfa=90)), K(4, P(dx=-2, dy=4, lean=7, hs=6, nua=-10, nfa=90)),
        K(6, P(dx=-1, dy=3, lean=5, hs=3, nua=-10, nfa=90)), K(8, P(dy=1, lean=2, hs=1)), K(9, P())],                                                                      # doubled over
    2: [K(0, P(dx=-1, lean=-2, hs=-2, fax=-3, fl=3)), K(2, P(dx=-3, lean=-3, hs=-2, nax=-4, nl=4, fax=-6)), K(4, P(dx=-5, lean=-3, hs=-1, nax=-8, fax=-9, fl=3)),
        K(6, P(dx=-4, lean=-2, nax=-6, fax=-9)), K(8, P(dx=-1, lean=-1, nax=-2, fax=-3)), K(9, P())],                                                                      # staggers back
    3: [K(0, P(lean=-1)), K(1, P(sx=.55, lean=-1)), K(2, P(sx=.1)), K(3, P(sx=-.55)), K(4, P(sx=-1)), K(5, P(sx=-.55)), K(6, P(sx=.1)), K(7, P(sx=.6)), K(8, P(sx=.9)), K(9, P())],   # spins right round
    4: [K(0, P(dx=-1, lean=-3, hs=-3, rot=-8)), K(1, P(dx=-2, dy=1, lean=-4, hs=-2, rot=-25, nl=1, fl=1)), K(2, P(dx=-3, dy=2, lean=-4, rot=-45, nl=2, fl=2)),
        K(3, P(dx=-4, dy=4, lean=-3, rot=-62, nl=2, fl=2)), K(4, P(dx=-5, dy=6, lean=-2, rot=-72)), K(5, P(dx=-5, dy=6, rot=-74)), K(6, P(dx=-5, dy=6, rot=-72)),
        K(7, P(dx=-3, dy=4, rot=-55)), K(8, P(dx=-1, dy=3, rot=-25)), K(9, P())],                                                                                          # knocked flat, gets up
    5: [K(0, P(lean=-2, hs=-1, nax=-1, fax=-1, nua=0, nfa=50, fua=0, ffa=50)), K(2, P(dx=-2, lean=-4, hs=-2, nax=-6, fax=-6, nua=35, nfa=60, fua=35, ffa=60)),
        K(5, P(dx=-3, lean=-4, hs=-1, nax=-8, fax=-8, nua=35, nfa=60, fua=35, ffa=60)), K(7, P(dx=-1, lean=-2, nax=-4, fax=-4, nua=15, nfa=50, fua=15, ffa=50)), K(9, P())],   # skids back on his heels
    6: [K(0, P(lean=-1)), K(1, P(dx=-1, dy=1, lean=-1, nua=35, nfa=160, fua=20, ffa=150)), K(3, P(dx=-2, dy=2, lean=-3, hs=-1, nua=35, nfa=160, fua=20, ffa=150)),
        K(6, P(dx=-1, dy=1, lean=-1, nua=25, nfa=150, fua=15, ffa=140)), K(9, P())],                                                                                       # arms up to guard
    7: [K(0, P(lean=-2, hs=-1)), K(1, P(dx=-1, lean=-4, hs=-2, nl=3, fl=3)), K(3, P(dx=-1, lean=-4, hs=-2, nl=5, fl=5, nua=45, nfa=80, fua=45, ffa=80)),
        K(6, P(dx=-1, dy=1, lean=-2, hs=-1, nl=2, fl=2, nua=30, nfa=70, fua=30, ffa=70)), K(8, P(dy=2)), K(9, P())],                                                      # hops backwards
    8: [K(0, P(lean=-2, hs=-2)), K(1, P(dy=1, lean=2, hs=2)), K(2, P(lean=-3, hs=-3)), K(3, P(dy=1, lean=3, hs=3)), K(4, P(lean=-3, hs=-2)), K(5, P(dy=1, lean=3, hs=2)),
        K(6, P(lean=-2, hs=-2)), K(7, P(dy=1, lean=2, hs=1)), K(8, P(lean=-1, hs=-1)), K(9, P())],                                                                         # dizzy wobble
    9: [K(0, P(dx=-1, dy=1, lean=1)), K(2, P(dx=-2, dy=5, lean=3, hs=2, fax=-8, fl=5, nua=40, nfa=25)), K(4, P(dx=-3, dy=9, lean=5, hs=4, fax=-12, fl=9, nua=40, nfa=25)),
        K(6, P(dx=-3, dy=9, lean=5, hs=4, fax=-12, fl=9, nua=40, nfa=25)), K(8, P(dx=-1, dy=4, lean=2, hs=1, fax=-5, fl=3)), K(9, P())],                                  # drops to one knee
}
RX_SH = [8, 8, 10, 8, 23, 12, 8, 10, 8, 10]                 # each reaction is drawn this many px right of the usual spot so a backwards fall fits in the canvas
RX_LIFT = {7: [0, 4, 8, 10, 10, 8, 5, 2, 0, 0]}              # the hop: height above the ground per frame (applied by the game)
def rot(f, deg, px, py):                                    # rotate a finished frame about (px, py), inverse-mapped so there are no holes
    a = rad(deg); ca, sa = cos(a), sin(a); src = [r[:] for r in f.g]; f.g = [['.'] * N for _ in range(NH)]
    for y in range(NH):
        for x in range(N):
            ox, oy = round(px + (x - px) * ca + (y - py) * sa), round(py - (x - px) * sa + (y - py) * ca)
            if 0 <= ox < N and 0 <= oy < NH: f.g[y][x] = src[oy][ox]

# ---------------------------------------------------------------- crouch (down 10, idle 6, walk 15 + 15, crouch-jump 15) and Lapse Blue (pull 15, blink 15)
CR_KINDS = ('cdn', 'cidle', 'cfwd', 'cback')
CR_DY, CR_LEAN, CR_HS = 15, 6, 3                 # a deep crouch: the hips drop 15 px
def cr_pose(kind, i):                            # -> hip x, hip y, near thigh, near knee, far thigh, far knee, foot, torso lean, head shift
    nax = fax = nl = fl = 0.0
    if kind == 'cdn':                            # standing -> crouching: ease down with a small overshoot, then settle
        t = i / 14; k = t * t * (3 - 2 * t) + (0.1 * sin(math.pi * t) if t > .5 else 0)
        dy, lean, hs, nax, fax = CR_DY * k, CR_LEAN * k, CR_HS * k, 1.5 * k, -1.5 * k
    elif kind == 'cidle':
        dy, lean, hs, nax, fax = CR_DY, CR_LEAN, CR_HS + (1 if 4 <= i <= 9 else 0), 1.5, -1.5      # 15 frames; the hips and legs never move, only the head sways
    else:                                        # short low stride: the feet pass each other, the hips bob a little
        p = i / NW if kind == 'cfwd' else ((-i) % NW) / NW
        dy, lean, hs = CR_DY - 0.5 + 0.7 * cos(4 * math.pi * p), CR_LEAN, CR_HS
        stride = lambda q: (4.5 * cos(2 * math.pi * q), 3.2 * sin(math.pi * (q - .5) / .5) if q >= .5 else 0.0)
        (nax, nl), (fax, fl) = stride(p % 1), stride((p + .5) % 1)
    hx, hy = 33, 38 + TOP + round(dy)
    return (hx, hy, *ik(hx, hy, 33.7 + nax, GROUND - nl), *ik(hx, hy, 29.7 + fax, GROUND - fl), 0.0, lean, hs)
CJ_SQUAT = {0: (CR_DY, 3, 3), 1: (CR_DY + 2, 5, 4), 2: (CR_DY - 6, 3, 2), 13: (6, 4, 2), 14: (2, 1, 0)}      # frame: (hips down, hips back, lean); starts from the crouch, lands standing
CJ_AIR = {4: (-2, 14, -10, 20, 36), 5: (26, 70, 14, 52, 30), 6: (40, 104, 26, 84, 22), 7: (46, 122, 34, 106, 16), 8: (46, 122, 34, 106, 16),
          9: (34, 92, 22, 74, 20), 10: (18, 50, 8, 32, 28), 11: (8, 14, 0, 8, 36)}       # heels tucked up behind him at the top (the normal jump tucks the knees forward)
CJ_LIFT = [0, 0, 0, 0, 12, 21, 27, 30, 30, 27, 21, 12, 0, 0, 0]                              # a higher spring than the normal jump (22)
def cjump_pose(i):
    if i in CJ_SQUAT:
        drop, back, lean = CJ_SQUAT[i]; hx, hy = 33 - back, 38 + TOP + drop
        return (hx, hy, *ik(hx, hy, 33.7, GROUND), *ik(hx, hy, 29.7, GROUND), 0.0, lean)
    if i in (3, 12): return jump_pose(i)         # push-off on the toes / touchdown on the toes, as in the normal jump
    a, b, c, d, fa = CJ_AIR[i]; return (33, 38 + TOP, rad(a), rad(b), rad(c), rad(d), rad(fa), 1 if 6 <= i <= 9 else 0)
ATK[4] = [K(0, I0), K(2, (0, 0, 0, 4, 0, 0, 20, 70, -16, 45, .3)), K(4, (-1, 1, 1, 4, 0, 0, 70, 90, -16, 45, .6)), K(7, (-1, 1, 1, 4, 0, 0, 78, 92, -16, 45, 1)),
          K(9, (0, 0, -1, 4, 0, 0, 40, 150, -16, 45, .8), 'in'), K(11, (0, 0, 0, 4, 0, 0, 5, 110, -16, 45, .4)), K(14, I0)]       # Lapse Blue (pull): hand out of the pocket, orb gathers, hand drags back
ATK[5] = [K(0, I0), K(3, (0, 0, 0, 4, 0, 0, 40, 150, -16, 45, .6)), K(8, (0, 0, 0, 4, 0, 0, 45, 155, -16, 45, 1)), K(11, (0, 0, 0, 4, 0, 0, 10, 100, -16, 45, .4)), K(14, I0)]   # Lapse Blue (blink): hand raised
ATK_HANDS[4] = ATK_HANDS[5] = 'n'; ATK_IMPACT.extend([8, 6])
def lapse_fx(f, i, k, H):
    if k == 4:                                   # an orb of blue light in front of the open hand grows, spins, then is dragged in
        r = [0, 0, 1, 2, 3, 4, 5, 5.5, 5, 3.5, 2, 1, 0, 0, 0][i]; cx, cy = H[0] + 5, H[1] - 1
        if r > 0:
            for x, y in disc(cx, cy, r + 1.6): f.set(x, y, 'j')
            for x, y in disc(cx, cy, r): f.set(x, y, 'g')
            for x, y in disc(cx, cy, max(0, r - 2)): f.set(x, y, 'h')
            if r >= 3: f.set(cx, cy, 'k')
            for a in range(0, 360, 90): f.set(cx + (r + 3) * cos(rad(a + i * 30)), cy + (r + 3) * sin(rad(a + i * 30)), 'h')
        if 8 <= i <= 10:                         # suction lines racing into the orb while it is pulled
            for a in range(0, 360, 45):
                u, v = cos(rad(a)), sin(rad(a)); f.line([(cx + u * 13, cy + v * 13), (cx + u * (9 - 2 * (i - 8)), cy + v * (9 - 2 * (i - 8)))], 'g')
    else:                                        # blink: body aura, collapse into blue light, a flat blue streak, re-form
        top = min(y for x, y in cells_of(f)); cy = top + 22; sx = [1, 1, 1, 1, .6, .25, 2.6, 3.0, 2.4, .3, .7, 1, 1, 1, 1][i]
        if i <= 2: aura(f, 'g', 'j')
        elif i <= 11:
            energy(f)
            if sx != 1: warp(f, sx, 1 if sx < 1 else .45, 33, cy)
            aura(f, 'g', 'j')
        elif i <= 13: aura(f, 'h', 'g')

# ---------------------------------------------------------------- crouch punches (atk6 right low punch, atk7 left uppercut), the 40-frame MAX BLUE summon (atk8) and the 20-frame orb loop
DEB = {'u': '#5b516b', 'v': '#9a8fb0', 'w': '#3d3548'}      # stone and rubble for the debris
PAL.update(DEB)
C0 = (0, 9, 4, 4, 0, 0, -16, 45, -16, 45, 0)                # the crouch as a starting pose (arms in the pockets)
ATK[6] = [K(0, C0), K(2, (-1, 10, 3, 4, 0, 0, -20, 100, -16, 45, .4)), K(4, (-2, 11, 2, 4, 0, 0, -45, -100, -16, 45, .7)), K(6, (2, 10, 5, 4, 0, 0, 70, 100, -16, 45, 1), 'in'),
          K(8, (3, 10, 5, 4, 0, 0, 90, 110, -16, 45, .85), 'out'), K(11, (1, 9, 4, 4, 0, 0, 30, 100, -16, 45, .4)), K(14, C0)]                       # right low punch from the crouch
ATK[7] = [K(0, C0), K(2, (-1, 10, 3, 4, 0, 0, 15, 135, -25, 10, .4)), K(4, (-2, 12, 2, 4, 0, 0, 15, 135, -40, -10, .7)), K(6, (1, 8, 5, 4, 0, 0, 12, 132, 55, 140, .95), 'in'),
          K(7, (2, 6, 6, 4, 0, 0, 10, 130, 85, 175, 1), 'in'), K(9, (2, 5, 6, 4, 0, 0, 12, 132, 100, 190, .85), 'out'), K(11, (1, 8, 4, 4, 0, 0, 12, 130, 30, 120, .4)), K(14, C0)]   # left uppercut from the crouch
ATK[8] = [K(0, I0), K(4, (0, 0, 0, 4, 0, 0, 30, 120, -16, 45, .4)), K(9, (-1, 0, -1, 4, 0, 0, 80, 175, -16, 45, .7)), K(16, (-1, 1, -2, 4, 0, 0, 88, 182, -16, 45, 1)),
          K(22, (-2, 1, -3, 4, 0, 0, 90, 185, -16, 45, 1)), K(28, (-2, 1, -1, 4, 0, 0, 92, 190, -16, 45, 1)), K(33, (-1, 0, -1, 4, 0, 0, 70, 160, -16, 45, .7)),
          K(37, (0, 0, 0, 4, 0, 0, 25, 100, -16, 45, .3)), K(39, I0)]                                                                              # MAX BLUE summon: hand up, orb forms, braced channel, release
ATK_HANDS[6] = 'n'; ATK_HANDS[7] = 'f'; ATK_HANDS[8] = 'n'; ATK_IMPACT.extend([6, 7, 18])
def draw_orb(f, cx, cy, r, i):
    if r <= 0: return
    for x, y in disc(cx, cy, r + 1.6): f.set(x, y, 'j')
    for x, y in disc(cx, cy, r): f.set(x, y, 'g')
    for x, y in disc(cx, cy, max(0, r - 2)): f.set(x, y, 'h')
    if r >= 3: f.set(cx, cy, 'k')
    for a in range(0, 360, 90): f.set(cx + (r + 3) * cos(rad(a + i * 30)), cy + (r + 3) * sin(rad(a + i * 30)), 'h')
_lapse_fx = lapse_fx
def lapse_fx(f, i, k, H):
    if k != 8: return _lapse_fx(f, i, k, H)
    r = ([0, 0, 0, 0, 1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 6, 3, 1, 0] + [0] * 40)[i]; cx, cy = H[0] + 7, H[1] - 7      # a small orb above the raised palm; the big one takes over in the world
    draw_orb(f, cx, cy, r, i)
    if 14 <= i <= 34: aura(f, 'j', 'j')                                                                                      # deep-blue outline while he channels
    if 17 <= i <= 33:
        for a in range(0, 360, 60): f.set(cx + 9 * cos(rad(a + i * 40)), cy + 9 * sin(rad(a + i * 40)), 'h')
ORB = {'a': '#07153a', 'b': '#0e2c70', 'c': '#1a4fb4', 'd': '#2f7fe0', 'e': '#62b4f5', 'f': '#a2dcfb', 'i': '#d6f5ff', 'l': '#7ee4ff'}      # the big orb's blues (white is the glow 'k')
PAL.update(ORB)
ORB_N = 15                                                  # frames in the orb loop
RAMP = 'abcdefik'                                           # the orb's shades from dark navy to white
BAY = [[0, 8, 2, 10], [12, 4, 14, 6], [3, 11, 1, 9], [15, 7, 13, 5]]
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
def smooth(a, b, x): t = max(0, min(1, (x - a) / (b - a))); return t * t * (3 - 2 * t)
OW, OH, CX, CY = 64, 72, 32, 36
rnd = random.Random(7)
ARCS = []                                # thin streaks hugging the rim in small groups of parallel arcs: (radius, start angle, length, sway, sway phase, colour)
for n in range(9):                       # nine groups spread evenly round the ball
    a0, r0 = n * 40 + rnd.uniform(-10, 10), rnd.uniform(.94, 1.04); ph0 = rnd.uniform(0, 6.28)
    for j in range(rnd.choice((2, 2, 3))):
        ARCS.append((r0 + (j - 1) * rnd.uniform(.105, .125), a0 + rnd.uniform(-9, 9), rnd.uniform(14, 34) * (1 - .25 * j), rnd.uniform(2, 6), ph0 + j * .5, 'l' if j else rnd.choice('lli')))
def orb_rows(i, R0=20.0):
    ph = 2 * math.pi * i / ORB_N; A = 1.25
    ox, oy = A * math.cos(ph), A * math.sin(ph)                 # the noise field travels on a circle: the clouds boil and the loop is seamless
    R = R0 + .7 * math.sin(ph)
    g = [['.'] * OW for _ in range(OH)]
    def put(x, y, c):
        if 0 <= x < OW and 0 <= y < OH: g[y][x] = c
    for y in range(OH):
        for x in range(OW):
            dx, dy = x + .5 - CX, y + .5 - CY; rr = math.hypot(dx, dy); th = math.atan2(dy, dx)
            edge = R * (.93 + .1 * (fbm(math.cos(th) * 1.6 + ox * .8 + 5, math.sin(th) * 1.6 + oy * .8 + 5, 91, 2) - .5) * 2)   # ragged rim
            if rr > edge: continue
            bay = (BAY[y % 4][x % 4] + .5) / 16
            if rr > edge: continue
            r = rr / R
            b0 = 1 - smooth(.38, 1.04, r) * .93
            cl = fbm(dx * .10 + ox + 20, dy * .10 + oy + 20, 3); fine = fbm(dx * .30 + ox + 33, dy * .30 + oy + 33, 12, 2)
            wv = 1 - abs(2 * fbm(dx * .07 + ox * .9 + 40, dy * .07 + oy * .9 + 40, 8, 3) - 1)           # ridged noise: thin curly veins
            wv2 = 1 - abs(2 * fbm(dx * .115 + ox * .7 + 90, dy * .115 + oy * .7 + 90, 21, 2) - 1)
            B = b0 * .80 + (cl - .5) * .62 * smooth(.12, .55, r) * (1 - smooth(.92, 1.0, r)) + (fine - .5) * .16 + math.exp(-(r / .26) ** 2) * .30
            B += (smooth(.915, .985, wv) * .42 + smooth(.93, .99, wv2) * .30) * max(0, 1 - r) ** .45 * smooth(.04, .25, r)          # veins brighten only the inside of the ball
            B -= smooth(.80, 1.0, r) * .30
            if r > .88: B -= (1 - fbm(dx * .22 + ox + 70, dy * .22 + oy + 70, 5)) * .30               # the rim is a dark, blotchy navy
            B = max(0, min(1, B)); v = B * 7 + (bay - .5) * .9
            g[y][x] = RAMP[max(0, min(7, int(v + .5)))]
    for k, (rad, a0, ln, wob, wph, col) in enumerate(ARCS):                              # thin cyan arcs along the rim, gently swaying
        a_s = a0 + wob * math.sin(ph + wph); rrad = R * rad + .6 * math.sin(ph * 2 + wph)
        if (k + i) % 7 == 0 and k % 3 == 0: continue                                     # a few flicker off
        steps = int(ln * 2.2)
        for s_ in range(steps + 1):
            a = math.radians(a_s + ln * s_ / steps)
            put(int(math.floor(CX + rrad * math.cos(a))), int(math.floor(CY + rrad * math.sin(a))), col)
    for k, (rr_, seg) in enumerate(((.74, 12), (.86, 10))):                                # two faint broken white rings inside
        rad = R * rr_ + .8 * math.sin(ph + k * 2)
        for s_ in range(180):
            if (s_ // seg + k) % 3 != 0: continue
            a = math.radians(s_ * 2 + 40 * k)
            x, y = int(math.floor(CX + rad * math.cos(a))), int(math.floor(CY + rad * math.sin(a)))
            if 0 <= x < OW and 0 <= y < OH and g[y][x] in 'cdef': g[y][x] = 'i'
    return [''.join(r) for r in g]
def orb_frame(i):                                           # MAX BLUE orb, one frame of the 15-frame loop: a soft cloudy ball with a white-hot core, a dark ragged rim and thin cyan arcs
    f = F()
    for y, r in enumerate(orb_rows(i)):
        for x, c in enumerate(r):
            if c != '.': f.set(x, y, c)
    return f

# ---------------------------------------------------------------- DASH (evade): 15 frames forward (atk9) and backward (atk10); the game also plays them in the air and from a crouch
DASH = {   # per frame: hips down / forward, torso lean, near and far foot (forward distance, height off the ground)
    9: dict(dy=[1, 4, 6, 7, 7, 7, 7, 7, 7, 6, 5, 4, 3, 1, 0], dx=[0, 1, 2, 3, 3, 3, 3, 3, 3, 2, 1, 0, 0, 0, 0], lean=[1, 3, 5, 7, 8, 8, 8, 8, 8, 7, 6, 4, 2, 1, 0],
            nx=[0, 2, 5, 8, 9, 9, 9, 9, 8, 7, 5, 3, 1, 0, 0], nl=[0, 0, 1, 2, 3, 3, 3, 3, 2, 1, 0, 0, 0, 0, 0], fx=[0, 2, 4, 6, 8, 9, 9, 9, 8, 6, 4, 2, 1, 0, 0], fl=[0, 0, 2, 4, 5, 5, 5, 5, 4, 3, 1, 0, 0, 0, 0]),
    10: dict(dy=[1, 3, 4, 5, 5, 5, 5, 5, 5, 4, 3, 2, 1, 0, 0], dx=[0, 0, -1, -2, -2, -2, -2, -2, -2, -1, -1, 0, 0, 0, 0], lean=[1, 0, -2, -4, -5, -5, -5, -5, -4, -3, -2, -1, 0, 0, 0],
             nx=[0, 1, 3, 5, 6, 6, 6, 6, 5, 4, 3, 1, 0, 0, 0], nl=[0, 0, 2, 4, 4, 4, 4, 4, 3, 2, 0, 0, 0, 0, 0], fx=[0, 1, 2, 3, 4, 4, 4, 4, 3, 2, 1, 0, 0, 0, 0], fl=[0, 0, 2, 3, 3, 3, 3, 3, 2, 1, 0, 0, 0, 0, 0]),
}
def dash_pose(k, i, ex=0):                                           # -> hip x shift, hip drop, lean, near leg (thigh, knee), far leg (thigh, knee)
    d = DASH[k]; hx, hy = 33 + d['dx'][i], 38 + TOP + d['dy'][i] + ex; sg = -1 if k == 9 else 1       # the far foot trails behind him (forward dash) or leads ahead (back dash)
    return d['dx'][i], d['dy'][i] + ex, d['lean'][i], ik(hx, hy, 33.7 + d['nx'][i], GROUND - d['nl'][i]), ik(hx, hy, 29.7 + sg * d['fx'][i], GROUND - d['fl'][i])
def dash_fx(f, i, k):                                          # blue afterimages and speed streaks trailing behind the way he is moving
    a = [0, 0, 1, 2, 3, 3, 3, 3, 3, 2, 2, 1, 0, 0, 0][i]
    if not a: return
    sg = -1 if k == 9 else 1
    cells = [(x, y) for y in range(NH) for x in range(N) if f.g[y][x] != '.']
    for L in range(a, 0, -1):
        for x, y in cells:
            x2 = x + sg * 6 * L
            if 0 <= x2 < N and (x + y + L) % (L + 1) == 0 and f.g[y][x2] == '.': f.set(x2, y, 'g' if L == 1 else 'j')
    for j, (row, ln) in enumerate(((22, 12), (31, 16), (40, 10), (49, 15), (56, 11))):      # speed streaks, a little different every frame
        n = ln + ((i + j) % 3) * 2; x0 = 38 + sg * 12 if k == 9 else 29 + 12
        x0 = 21 if k == 9 else 44
        for t in range(n):
            x = x0 + sg * t if sg < 0 else x0 + t
            y = row + TOP + (i + j) % 2
            if 0 <= x < N and f.g[y][x] == '.': f.set(x, y, 'h' if t % 4 < 3 else 'g')
ATK_HANDS[9] = ATK_HANDS[10] = ''; ATK_IMPACT.extend([99, 99])
# ---------------------------------------------------------------- BLOCK: his signature pose, 10 frames; the near hand comes out of the pocket and rises beside his face with two fingers up (frames 0-4), holds (5-9, loops, a hair of sway), lowering plays 4..0; the far hand stays in the pocket
G0 = (0, 0, 0, 4, 0, 0, 68, 170, -16, 45, 0)                  # the held pose; frames 4-9 are all exactly this, so nothing moves while he blocks (only the hair tips)
ATK[11] = [K(0, I0), K(2, (0, 0, 0, 4, 0, 0, 40, 95, -16, 45, 0)), K(4, G0), K(9, G0)]
def peace_hand(f, H, fa):                                   # an open hand with the index and middle fingers pointing up along the forearm (the other fingers stay curled)
    OV = 'y' if HO else 'V'                                 # (the outline of the raised hand is red in red mode too)
    b = rad(fa); dx, dy = sin(b), cos(b); px, py = cos(b), -sin(b)
    for side in (-1.0, 0.0, 1.0): f.set(H[0] + dx * 1.6 + px * side, H[1] + dy * 1.6 + py * side, OV)       # the knuckle line where the two fingers leave the palm
    for t in range(1, 7):
        for side, c in ((-0.5, 'T'), (0.5, 'S')):
            x, y = H[0] + dx * (1.6 + t) + px * side, H[1] + dy * (1.6 + t) + py * side
            f.set(x, y, OV if t == 6 else c)
    for t in range(1, 6):                                  # a thin outline down both sides of the two fingers
        for side in (-1.5, 1.5): f.set(H[0] + dx * (1.6 + t) + px * side, H[1] + dy * (1.6 + t) + py * side, OV)
ATK_HANDS[11] = ''; ATK_IMPACT.extend([99])
ATK_HANDS[12] = ATK_HANDS[13] = ''; ATK_IMPACT.extend([99, 99])
ATK[14] = [K(0, I0), K(1, (-1, 1, -1, 4, 0, 0, 25, 125, -16, 45, .3)), K(3, (3, 1, 3, 4, 0, 0, 88, 98, -16, 45, 1), 'in'), K(5, (4, 1, 4, 4, 0, 0, 92, 100, -16, 45, 1)),
           K(8, (2, 1, 2, 4, 0, 0, 45, 115, -16, 45, .5), 'out'), K(11, (1, 1, 0, 4, 0, 0, 10, 80, -16, 45, .2)), K(14, I0)]                                 # 14: a quick straight jab with the near hand
ATK[15] = [K(0, I0), K(2, (-1, 1, -1, 62, 100, 12, -16, 45, -16, 45, .3)), K(5, (-2, 1, -3, 90, 6, -8, -16, 45, -16, 45, 1), 'in'), K(8, (-2, 1, -3, 92, 6, -8, -16, 45, -16, 45, .9)),
           K(11, (-1, 1, -1, 60, 70, 10, -16, 45, -16, 45, .3)), K(14, I0)]                                                                                 # 15: a front kick with the near leg
ATK[16] = [K(0, I0), K(1, (-1, 1, -1, 4, 0, 0, -16, 45, 25, 125, .3)), K(3, (3, 1, 3, 4, 0, 0, -16, 45, 88, 98, 1), 'in'), K(5, (4, 1, 4, 4, 0, 0, -16, 45, 92, 100, 1)),
           K(8, (2, 1, 2, 4, 0, 0, -16, 45, 45, 115, .5), 'out'), K(11, (1, 1, 0, 4, 0, 0, -16, 45, 10, 80, .2)), K(14, I0)]                                 # 16: a straight punch with the other (far) hand
ATK[17] = [K(0, I0), K(2, (-1, 1, -1, 62, 100, 12, -16, 45, -16, 45, .3)), K(5, (-2, 1, -3, 92, 6, -6, -16, 45, -16, 45, 1), 'in'), K(8, (-2, 1, -3, 94, 6, -6, -16, 45, -16, 45, .9)),
           K(11, (-1, 1, -1, 60, 70, 10, -16, 45, -16, 45, .3)), K(14, I0)]                                                                                 # 17: a kick with the other (far) leg (its three leg angles are the far leg's)
ATK_HANDS.update({14: 'n', 15: '', 16: 'f', 17: ''}); ATK_IMPACT.extend([4, 6, 4, 6])
ATK[18] = [K(0, I0), K(2, (-1, 1, -2, 70, 110, 12, -16, 45, -16, 45, .3)), K(4, (-2, 1, -4, 125, 12, -8, -16, 45, -16, 45, .7), 'in'), K(6, (-3, 1, -5, 140, 2, -10, -16, 45, -16, 45, 1), 'in'),
           K(9, (-3, 1, -5, 138, 4, -10, -16, 45, -16, 45, .8)), K(12, (-1, 1, -2, 80, 60, 5, -16, 45, -16, 45, .3)), K(14, I0)]                              # 18 (red combo 1): a high kick to the neck with the near leg
ATK[19] = [K(0, I0), K(2, (-1, 1, -1, 62, 100, 12, -16, 45, -16, 45, .3)), K(4, (-2, 1, -3, 98, 12, -6, -16, 45, -16, 45, .8), 'in'), K(5, (-2, 1, -3, 104, 6, -6, -16, 45, -16, 45, 1)),
           K(8, (-2, 1, -3, 102, 8, -6, -16, 45, -16, 45, .9)), K(11, (-1, 1, -1, 60, 70, 10, -16, 45, -16, 45, .3)), K(14, I0)]                              # 19: a kick to the stomach with the other (far) leg
ATK[20] = [K(0, I0), K(1, (-1, 1, -1, 4, 0, 0, -16, 45, 25, 125, .3)), K(3, (3, 1, 3, 4, 0, 0, -16, 45, 88, 98, 1), 'in'), K(4, (4, 1, 4, 4, 0, 0, -16, 45, 92, 100, 1)),
           K(8, (2, 1, 2, 4, 0, 0, -16, 45, 45, 115, .5), 'out'), K(11, (1, 1, 0, 4, 0, 0, -16, 45, 10, 80, .2)), K(14, I0)]                                 # 20: a straight punch with the far hand
ATK[21] = [K(0, I0), K(3, (-3, 2, -3, 4, 0, 0, -55, -120, -16, 45, .5)), K(5, (-4, 3, -4, 4, 0, 0, -75, -150, -16, 45, .8)), K(7, (4, 2, 6, 4, 0, 0, 88, 100, -16, 45, 1), 'in'),
           K(9, (6, 2, 7, 4, 0, 0, 95, 105, -16, 45, 1)), K(11, (4, 1, 4, 4, 0, 0, 60, 110, -16, 45, .5), 'out'), K(14, I0)]                                 # 21: a hard punch: long wind-up, the whole body goes into it
ATK[22] = [K(0, I0), K(5, (0, 0, -2, 4, 0, 0, 75, 165, -16, 45, 0)), K(8, (0, 0, -2, 4, 0, 0, 79, 168, -16, 45, 0)), K(11, (0, 0, -2, 4, 0, 0, 75, 164, -16, 45, 0)), K(14, (0, 0, -2, 4, 0, 0, 79, 169, -16, 45, 0)),
           K(17, (0, 0, -3, 4, 0, 0, 76, 165, -16, 45, 0)), K(19, (0, 0, -3, 4, 0, 0, 80, 170, -16, 45, 0)), K(20, (0, 0, 2, 4, 0, 0, 88, 110, -16, 45, 0), 'in'), K(22, (0, 0, 4, 4, 0, 0, 92, 98, -16, 45, 0)),
           K(26, (0, 0, 2, 4, 0, 0, 70, 105, -16, 45, 0), 'out'), K(29, I0)]       # 22 (RED): the remastered block pose: the hand comes up with two fingers raised (frames 0-5), holds and trembles while the orb grows (6-19), then snaps forward and fires (20-29)
ATK_HANDS.update({18: '', 19: '', 20: 'f', 21: 'n', 22: ''}); ATK_IMPACT.extend([6, 5, 4, 7, 99])
STRIKES = (0, 1, 2, 3, 6, 7, 14, 15, 16, 17, 18, 19, 20, 21)                  # the attacks whose hitting limbs get a blue outline
# ---------------------------------------------------------------- HANDS OUT (used while cursed energy is on): the same animations with both hands out of the pockets
HO = False                                                    # build() draws the hands-out version of every pose while this is True
HO_N, HO_F = (14, 44), (-24, -4)                              # relaxed arms: the near hand hangs forward and low, the far hand trails behind him (upper arm, forearm angles)
HO_BAL = ((-32, -6), (42, 72))                                # the kicks: arms out for balance (the near arm back, the far arm forward and up, clear of the leg)
HO_ARMS = {15: HO_BAL, 17: HO_BAL, 18: HO_BAL, 19: HO_BAL}
def ho_tbl(tbl, near, far):                                   # an attack table with every arm that sat in the pocket swapped for the relaxed hands-out arm
    out = []
    for f, v, m in tbl:
        v = list(v)
        if (v[6], v[7]) == POCKET: v[6], v[7] = near
        if (v[8], v[9]) == POCKET: v[8], v[9] = far
        out.append((f, tuple(v), m))
    return out
ATK_H = {k: ho_tbl(t, *HO_ARMS.get(k, (HO_N, HO_F))) for k, t in ATK.items()}
JARMS = [K(0, (*HO_N, *HO_F)), K(2, (-30, -8, -40, -12)), K(3, (45, 40, 30, 30)), K(5, (62, 50, 48, 40)), K(8, (70, 55, 55, 45)), K(11, (40, 45, 25, 35)), K(12, (20, 46, 0, 30)), K(14, (*HO_N, *HO_F))]       # jump: arms swing back as he squats, up as he leaves the ground, down as he lands
TARMS = [K(0, (25, 60, 10, 50)), K(6, (30, 70, 15, 60)), K(8, (55, 50, 40, 40)), K(11, (35, 45, 20, 35)), K(12, (20, 46, 0, 30)), K(14, (*HO_N, *HO_F))]                                    # teleport: hugged in while he vanishes, then the same fall as the jump
def ho_arms(kind, i):                                         # the arms for the hands-out versions of the standing / walking / crouching / jumping poses -> near upper arm, near forearm, far upper arm, far forearm
    if kind in ('jump', 'cjump'): return keyframe(JARMS, i)
    if kind == 'tele': return keyframe(TARMS, i)
    if kind == 'run':                                                             # RUN: the arms pump with bent elbows (the arm opposite the leg that is forward swings forward)
        p = i / NW; cn, cf = cos(2 * math.pi * p), cos(2 * math.pi * ((p + .5) % 1)); sn, sf = (1 - cn) / 2, (1 - cf) / 2
        return (-30 + 80 * sn, 70 + 34 * sn, -30 + 80 * sf, 70 + 34 * sf)
    if kind in ('fwd', 'back', 'cfwd', 'cback'):
        p = i / NW if kind in ('fwd', 'cfwd') else ((-i) % NW) / NW; amp = 18 if kind in ('fwd', 'back') else 8
        cn, cf = cos(2 * math.pi * p), cos(2 * math.pi * ((p + .5) % 1))             # +1 = that leg is forward, so its arm swings back
        sn, sf = (1 - cn) / 2, (1 - cf) / 2                                          # 0 = the arm is back ... 1 = the arm is forward
        return (HO_N[0] - 2 - amp * cn, 26 + 20 * sn, HO_F[0] + 14 - 1.3 * amp * cf, 10 + 28 * sf)
    return (*HO_N, *HO_F)
def hand_at(S, ua, fa):                                       # where the fist ends up (the same geometry draw_arm uses)
    a, b = rad(ua), rad(fa); E = (S[0] + UA * sin(a), S[1] + UA * cos(a)); W = (E[0] + FA * sin(b), E[1] + FA * cos(b))
    return (W[0] + 2.0 * sin(b), W[1] + 2.0 * cos(b))
ANCH = {}                                                     # (hands out?, kind, frame) -> near hand x, y, far hand x, y in canvas pixels (None = no cursed energy on this frame)
BLK_MAP = {'wfb': 'fwd', 'wbb': 'back', 'cb': 'cidle', 'cfb': 'cfwd', 'cbb': 'cback'}      # blocking while walking / crouched / crouch-walking: the same bodies with the near hand raised (two fingers up)

def build(kind, i):
    okind = kind; blkk = kind in BLK_MAP; kind = BLK_MAP.get(kind, kind); gl = 0
    if blkk: (nua, nfa), (fua, ffa), gl, k_ = (68, 170), HO_F if HO else POCKET, 0, 11
    idx = i                               # (i is reused for the head loop below)
    f = F(); u = F()                      # f: legs, u: everything above the hips
    hx, foot, lean = 33, None, 0
    atk = kind.startswith('atk'); rxk = kind.startswith('rx'); crk = kind in CR_KINDS; foot2 = None; hs = 0; sx_ = 1; rot_ = 0
    hoa = (HO or kind == 'run') and not (atk or rxk or blkk)                 # the standing / walking / crouching / jumping poses with both hands out (the attacks get theirs from ATK_H)
    if kind == 'idle':
        L = [.15, .35, .55, .7, .5, .25][i]; bob = [0, 0, 0, 1, 1, 0][i]
        thn, kn_, thf, kf, swn, swf = rad(4), 0, rad(-8), 0, False, False; p = i / 6
    elif kind in ('jump', 'tele', 'cjump'):
        hx, hy, thn, kn_, thf, kf, foot, lean = {'jump': jump_pose, 'tele': tele_pose, 'cjump': cjump_pose}[kind](i); swn = swf = False; L = 0; bob = 0; p = 0
    elif crk:
        hx, hy, thn, kn_, thf, kf, foot, lean, hs = cr_pose(kind, i); swn = swf = False; L = 0; bob = 0; p = 0
    elif rxk:
        k_ = int(kind[2:]); SH = RX_SH[k_]; gl = 0
        dx, dy, lean, hs, rot_, sx_, nax, nl, fax, fl, nua, nfa, fua, ffa = keyframe(RX[k_], i)
        hx, hy = 33 + SH + dx, 38 + TOP + round(dy); swn = swf = False; L = 0; bob = 0; p = 0; foot = 0.0
        thn, kn_ = ik(hx, hy, 33.7 + SH + nax, GROUND - nl); thf, kf = ik(hx, hy, 29.7 + SH + fax, GROUND - fl)
    elif atk:
        k_ = int(kind[3:])
        if k_ in (9, 10, 12, 13): dx, dy, lean, (thn, kn_), (thf, kf) = dash_pose(k_ if k_ < 11 else k_ - 3, i, 0 if k_ < 11 else 10); (nua, nfa), (fua, ffa) = (HO_N, HO_F) if HO else (POCKET, POCKET); gl = 0; nth = nk = nf = 0
        else:
            dx, dy, lean, nth, nk, nf, nua, nfa, fua, ffa, gl = pv = keyframe((ATK_H if HO else ATK)[k_], i)
            if k_ in (6, 7): dy += CR_DY - 9
        hx, hy = 33 + dx, 38 + TOP + round(dy); swn = swf = False; L = 0; bob = 0; p = 0; foot = 0.0
        if k_ not in (9, 10, 12, 13): thf, kf = ik(hx, hy, 29.7, GROUND)
        rc_n = rc_f = 'O'
        hs = 2 if k_ in (6, 7) else 0
        if k_ in (11, 22): thn, kn_, thf, kf, foot = rad(4), 0, rad(-8), 0, None       # the idle pose's legs, exactly: no pop when the block starts or ends and nothing moves in the legs while it is held
        elif k_ in (9, 10, 12, 13): pass
        elif k_ in (3, 15, 18): thn, kn_, foot2 = rad(nth), rad(nk), rad(nf); rc_n = 'j' if gl > .25 else 'O'
        elif k_ in (17, 19): thf, kf, foot = rad(nth), rad(nk), rad(nf); thn, kn_ = ik(hx, hy, 33.7, GROUND); foot2 = 0.0; rc_f = 'j' if gl > .25 else 'O'
        else: thn, kn_ = ik(hx, hy, 33.7, GROUND)
    else:
        amp, kmax = (26, 50) if kind == 'fwd' else (42, 95) if kind == 'run' else (20, 40)
        p = i / NW if kind in ('fwd', 'run') else ((-i) % NW) / NW
        qn, qf = p % 1, (p + .5) % 1
        thn, kn_ = gait(qn, amp, kmax); thf, kf = gait(qf, amp, kmax); swn, swf = qn >= .5, qf >= .5
        L = .8 + .25 * sin(2 * math.pi * i / NW) if kind in ('fwd', 'run') else max(-.2, .05 + .12 * sin(2 * math.pi * i / NW)); bob = 0
        if kind == 'run': lean = 6; FLY = round(3.4 * max(0.0, cos(4 * math.pi * p)) ** 1.4)      # RUN: the whole body leans forward and leaves the ground at the two moments of the stride when the legs are fully open
    drop = lambda th, k: L1 * cos(th) + L2 * cos(th - k)
    if (kind not in ('jump', 'tele', 'cjump') and not (atk or rxk or crk)) or kind in ('atk11', 'atk22'): hy = round(58 + TOP - max(drop(thn, kn_), drop(thf, kf)))
    if kind == 'run': hy -= FLY                            # (in flight both feet are off the ground)
    dxb = round(hx - 33)                                   # the body follows the hips (the planted feet stay put)
    oy = hy - 34; hb = bob
    if hoa: nua, nfa, fua, ffa = ho_arms(kind, i)
    wave = round(sin(2 * math.pi * 2 * i / NW)) if kind in ('fwd', 'back') else [0, 1, 0, -1, 0, 1][i % 6]      # tail sway: whole cycles per loop, so the walk loops without a pop
    kf_, af_ = leg(f, hx, hy, thf, kf, swf, False, foot, rc_f if atk else 'O')
    kn, an = leg(f, hx, hy, thn, kn_, swn, True, foot if foot2 is None else foot2, rc_n if atk else 'O')

    # jacket (+ flap trailing behind in the wind)
    jk = set()
    for y in range(17, 35):
        a, b = (31, 35) if y == 17 else (30, 36) if y < 23 else (30, 35) if y < 30 else (30, 36)
        jk |= {(x, y + oy) for x in range(a, b + 1)}
    u.fill(jk, 'B'); u.bands(jk, 'B', 'C', 'A'); u.rim(jk, 'O')                 # lower clothes stay still: no flap, no billow
    # near arm, hand in the pocket (the attacks draw their own arms further down)
    if not (atk or rxk or blkk or hoa):
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
    tip = {'idle': [0, 0, 1, 1, 0, -1], 'fwd': [round(sin(2 * math.pi * 2 * k / NW)) for k in range(NW)], 'back': [round(sin(2 * math.pi * (2 * k + 4) / NW)) for k in range(NW)], 'jump': [0, 0, 1, 1, 0, -1] * 3, 'tele': [0, 0, 1, 1, 0, -1] * 3, **{f'atk{j}': [0, 0, 1, 1, 0, -1] * 3 for j in range(4)}, **{f'rx{j}': [0, 0, 1, 1, 0, -1] * 2 for j in range(10)}}.get(kind, [0, 0, 1, 1, 0, -1] * 7)[i]
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
    if atk or rxk or blkk or hoa:                         # the far arm goes first so the torso covers its shoulder
        Sy = hy - 16; Sx = 32 + dxb + round(.8 * lean); fxc = BLUE_FX
        gf = gl if atk and 'f' in ATK_HANDS[k_] else 0
        _, Hf = draw_arm(f, (Sx - 1, Sy), fua, ffa, False, gf, fxc, 'j' if (atk and k_ in STRIKES and gf > .25) else 'O')
    for y in range(NH):                                                   # lean the torso/head forward and slide it over the planted feet
        for x in range(N):
            c = u.g[y][x]
            if c != '.': f.set(x + dxb + round(lean * max(0.0, (34 + oy - y) / 20.0)) + (round(hs) if y < oy + 15 else 0), y, c)
    if atk or rxk or blkk or hoa:                         # near arm in front of everything, then (attacks) glow trail and impact flash
        gn = gl if atk and 'n' in ATK_HANDS[k_] else 0
        E, Hn = draw_arm(f, (Sx, Sy), nua, nfa, True, gn, fxc, 'j' if (atk and k_ in STRIKES and gn > .25) else 'O')
        if atk and k_ in (11, 22): peace_hand(f, Hn, nfa)
        if blkk: peace_hand(f, Hn, nfa)
        if atk and k_ in (9, 10, 12, 13): dash_fx(f, idx, k_ if k_ < 11 else k_ - 3)
        elif atk: atk_fx(f, idx, k_, af_ if k_ in (17, 19) else an, foot if k_ in (17, 19) else (foot2 if foot2 is not None else 0.0), nua, E, Hn, Hf, gl)
    if atk or rxk or blkk or hoa: an_n, an_f = Hn, Hf                          # where the fists are (final canvas pixels; hit reactions are moved along with the body below)
    else:                                                                       # the hands are in the pockets: the same spot, carried through the lean of the upper body like the pixels are
        u2f = lambda x, y: (x + dxb + round(lean * max(0.0, (34 + oy - round(y)) / 20.0)) + (round(hs) if round(y) < oy + 15 else 0), y)
        an_n, an_f = u2f(*hand_at((32, 18 + oy), *POCKET)), u2f(*hand_at((31, 18 + oy), *POCKET))
    if blkk or (atk and k_ in (11, 22)): an_n = (an_n[0] + 3 * sin(rad(nfa)), an_n[1] + 3 * cos(rad(nfa)))      # on the raised hand the energy sits up among the two fingers
    if rxk:                                               # spin (squash about the body axis) and fall (rotate about the feet)
        if sx_ != 1:
            sq = sx_ if abs(sx_) > .08 else .08; an_n, an_f = [(hx + (x - hx) * sq, y) for x, y in (an_n, an_f)]; warp(f, sq, 1, hx, 30)
        if rot_:
            ca, sa = cos(rad(rot_)), sin(rad(rot_)); qx, qy = 33.7 + SH, GROUND + 3
            an_n, an_f = [(qx + (x - qx) * ca - (y - qy) * sa, qy + (x - qx) * sa + (y - qy) * ca) for x, y in (an_n, an_f)]; rot(f, rot_, qx, qy)
    if kind == 'tele': tele_fx(f, idx)
    ANCH[(HO, okind, idx)] = None if (kind == 'tele' and 1 <= idx <= 5) or (kind == 'atk5' and 3 <= idx <= 11) else (*an_n, *an_f)       # (while he turns into a streak of light or vanishes there are no hands to light)
    return f

def rows(f, x0, w): return [''.join(r[x0:x0 + w]) for r in f.g]

def NFR(k): return NW if k in ('fwd', 'back', 'run', 'cfwd', 'cback', 'wfb', 'wbb', 'cfb', 'cbb') else 40 if k == 'atk8' else 10 if k == 'atk11' else 30 if k == 'atk22' else 15 if k in ('jump', 'tele', 'cjump', 'cdn', 'cidle', 'cb') or k.startswith('atk') else 10 if k.startswith('rx') else 6
sets = {k: [build(k, i) for i in range(NFR(k))] for k in ('idle', 'fwd', 'back', 'run', 'jump', 'tele', 'atk0', 'atk1', 'atk2', 'atk3', 'atk4', 'atk5', 'atk6', 'atk7', 'atk8', 'atk9', 'atk10', 'atk11', 'atk12', 'atk13', 'atk14', 'atk15', 'atk16', 'atk17', 'wfb', 'wbb', 'cb', 'cfb', 'cbb', 'cdn', 'cidle', 'cfwd', 'cback', 'cjump', *['rx%d' % j for j in range(10)])}
HO = True                                                    # the red combo and the red technique only exist with the hands out: they are built that way, so they need no separate hands-out version
for k in ('atk18', 'atk19', 'atk20', 'atk21', 'atk22'):
    sets[k] = [build(k, i) for i in range(NFR(k))]
    for i in range(NFR(k)): ANCH[(False, k, i)] = ANCH[(True, k, i)]
HO = False
HO_KINDS = ('idle', 'fwd', 'back', 'jump', 'tele', 'cjump', 'cdn', 'cidle', 'cfwd', 'cback', 'atk4', 'atk5', 'atk6', 'atk7', 'atk8', 'atk9', 'atk10', 'atk11', 'atk12', 'atk13', 'atk14', 'atk15', 'atk16', 'atk17', 'wfb', 'wbb', 'cb', 'cfb', 'cbb')     # every pose he can be in while cursed energy is on (the normal combo and the hit reactions keep the pockets)
HO = True
hsets = {k: [build(k, i) for i in range(NFR(k))] for k in HO_KINDS}                 # the same poses with both hands out of the pockets
HO = False
for k in ('idle', 'fwd', 'back', 'wfb', 'wbb'):
    for f in sets[k] + hsets[k]: f.g = f.g[TOP:TOP + N]
allsets = {**sets, **{'h_' + k: v for k, v in hsets.items()}}
cells = [(x, y) for k, fs in allsets.items() if not k.startswith(('atk', 'rx', 'orb', 'h_atk')) for f in fs for y in range(len(f.g)) for x in range(N) if f.g[y][x] != '.']
acx = [x for k, fs in allsets.items() if k.startswith(('atk', 'h_atk')) for f in fs for r in f.g for x, c in enumerate(r) if c != '.']
ax0, ax1 = max(0, min(acx) - 1), max(acx) + 1        # one window for the four attack sets (they reach further forward than the others)
x0, x1 = min(x for x, y in cells) - 1, max(x for x, y in cells) + 1
print('bbox cols', x0 + 1, x1 - 1, 'rows', min(y for x, y in cells), max(y for x, y in cells))
bad = {c for f in (f for fs in allsets.values() for f in fs) for r in f.g for c in r} - set(PAL) - {'.'}
assert not bad, bad
sets['orb'] = [orb_frame(i) for i in range(ORB_N)]
RXWIN = {k: (max(0, min(xs) - 1), min(N - 1, max(xs) + 1)) for k, fs in sets.items() if k.startswith(('rx', 'orb')) for xs in [[x for f in fs for r in f.g for x, c in enumerate(r) if c != '.']]}
def win(k): return (ax0, ax1) if k.startswith('atk') else RXWIN[k] if k.startswith(('rx', 'orb')) else (x0, x1)
CROPPED = ('idle', 'fwd', 'back', 'wfb', 'wbb')                  # these sets drop the top TOP rows of the canvas
def meta(k, fs):                                                  # everything about a set except its pixels
    return {'x0': win(k)[0], 'w': win(k)[1] - win(k)[0] + 1, 'h': len(fs[0].g), 'top': TOP if k in ('run', 'jump', 'tele', 'cjump', 'cdn', 'cidle', 'cfwd', 'cback', 'cb', 'cfb', 'cbb') or k.startswith(('atk', 'rx')) else 0, 'cx': 33 + RX_SH[int(k[2:])] if k.startswith('rx') else 32 if k == 'orb' else 33}
def anchors(k, fs, h):                                            # per frame: [x, y] of the near and of the far fist inside the set's window (null = nothing to light)
    out = ([], [])
    for i in range(len(fs)):
        a = ANCH.get((h, k, i))
        for j in (0, 1):
            out[j].append(None if a is None else [round(a[2 * j] - win(k)[0], 1), round(a[2 * j + 1] - (TOP if k in CROPPED else 0), 1)])
    return out
def delta(base, ho):                                              # the pixels that differ: x, y (as characters from '0') and the new letter, three characters each
    return ''.join(chr(48 + x) + chr(48 + y) + b for y, (r0, r1) in enumerate(zip(base, ho)) for x, (a, b) in enumerate(zip(r0, r1)) if a != b)
out = {}
for k, fs in sets.items():
    out[k] = {**meta(k, fs), 'frames': [rows(f, win(k)[0], win(k)[1] - win(k)[0] + 1) for f in fs], **({'lift': JUMP_LIFT} if k == 'jump' else {}), **({'lift': CJ_LIFT} if k == 'cjump' else {}), **({'lift': RX_LIFT[int(k[2:])]} if k.startswith('rx') and int(k[2:]) in RX_LIFT else {}), **({'lift_k': TELE_K} if k == 'tele' else {})}
    out[k]['hn'], out[k]['hf'] = anchors(k, fs, False)
for k, fs in hsets.items():                                       # hands-out versions: only what differs from the normal frame, plus the fist positions
    w0, w1 = win(k); assert all(w0 <= x <= w1 for f in fs for y in range(len(f.g)) for x in range(N) if f.g[y][x] != '.'), ('hands-out pixels outside the window', k)
    hn, hf = anchors(k, fs, True)
    out['h_' + k] = {'dl': [delta(b, rows(f, w0, w1 - w0 + 1)) for b, f in zip(out[k]['frames'], fs)], 'hn': hn, 'hf': hf}
out['ce'] = {'x0': 0, 'w': ce.CEW, 'h': ce.CEH, 'top': 0, 'cx': ce.CECX, 'cy': ce.CECY, 'frames': ce.ce_frames()}          # the 15-frame cursed energy that is drawn over the fists
out['pal_extra'] = {**GLOW, **RED, **DEB, **ORB, **ce.CE_PAL, 'y': PAL['V']}
json.dump(out, open('side.json', 'w'))

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
