#!/usr/bin/env python3
"""Yuji Itadori in side view (facing right), 64x64 16-bit style like Gojo's sprites.
Writes yuji.json (also atk0-atk3 = the M1, atk4 = DIVERGENT FIST, atk5-atk8 = the cursed energy M1 (roundhouse, elbow, downslam, push kick), atk9 = CONCENTRATED FIST, atk10 = the SWEEP, atk11 = the POWER-UP (switching cursed energy on), atk12 = RUSH FIST (the super fast DIVERGENT FIST on the run), atk13 = the UPPERCUT (crouched CONCENTRATED FIST: launches the enemy), atk14 = the FACE KICK (the flying kick into the launched enemy), atk15 = the SPIN ELBOW (BLUE in the air in cursed energy mode: a spin, then an elbow down onto the enemy), blk = BLOCK (10 frames) and bfwd = walking with the guard up): idle (15 frames), fwd (15-frame walk; the game plays it backwards for walking back), jump (15 frames + the lift per frame).
Every frame is drawn from joints: hips, a two-bone IK for each leg, shoulders, a boxer's guard for the arms, hair tufts that move."""
import json, math, os, random, sys
from PIL import Image, ImageDraw
N = 64
PAL = {'O': '#0e0a1a', 'A': '#0e0c1e', 'B': '#1a1e3c', 'C': '#28305c', 'D': '#3e4a80', 'E': '#6070b8', 'r': '#b02834', 's': '#7c1c2c', 't': '#541424', 'u': '#e25454', 'g': '#deb040',
       'S': '#eec7b4', 'T': '#fbe3d4', 'U': '#d1a08f', 'V': '#a06d68', 'H': '#f8c8cc', 'I': '#e49aa0', 'K': '#c47482', 'L': '#8c4e60', 'k': '#362432',
       'P': '#541424', 'Q': '#aa3636', 'R': '#d66060', 'W': '#ececf0', 'e': '#0e0a1a',
       'X': '#ff2a3a', 'Y': '#ffb0a0', 'Z': '#12030a', 'z': '#7a0f1e'}      # v1.15 BLACK FLASH: X bright red, Y a pale red-white spark, Z black, z dark red
def pm(pts):
    im = Image.new('L', (N, N), 0); ImageDraw.Draw(im).polygon([(round(x), round(y)) for x, y in pts], fill=255); a = im.load()
    return {(x, y) for y in range(N) for x in range(N) if a[x, y]}
def disc(cx, cy, r): return {(x, y) for y in range(N) for x in range(N) if (x-cx)**2 + (y-cy)**2 <= r*r}
def seg(p0, p1, w0, w1):
    dx, dy = p1[0]-p0[0], p1[1]-p0[1]; l = math.hypot(dx, dy) or 1; nx, ny = -dy/l, dx/l
    return pm([(p0[0]+nx*w0/2, p0[1]+ny*w0/2), (p1[0]+nx*w1/2, p1[1]+ny*w1/2), (p1[0]-nx*w1/2, p1[1]-ny*w1/2), (p0[0]-nx*w0/2, p0[1]-ny*w0/2)])
class F:
    def __init__(s): s.g = [['.']*N for _ in range(N)]
    def set(s, x, y, c):
        x, y = round(x), round(y)
        if 0 <= x < N and 0 <= y < N: s.g[y][x] = c
    def at(s, x, y): return s.g[y][x] if 0 <= x < N and 0 <= y < N else '.'
    def fill(s, m, c):
        for x, y in m: s.set(x, y, c)
    def rim(s, m, c='O'):
        for x, y in m:
            for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                if (x+dx, y+dy) not in m: s.set(x+dx, y+dy, c)
    def bands(s, m, base, lit, shade):
        rows = {}
        for x, y in m: rows.setdefault(y, []).append(x)
        for y, xs in rows.items():
            if len(xs) >= 3:
                if s.at(min(xs), y) == base: s.set(min(xs), y, lit)
                if s.at(max(xs), y) == base: s.set(max(xs), y, shade)
    def line(s, pts, c):
        for (x0, y0), (x1, y1) in zip(pts, pts[1:]):
            n = max(abs(x1-x0), abs(y1-y0), 1)
            for k in range(int(n)+1): s.set(x0+(x1-x0)*k/n, y0+(y1-y0)*k/n, c)
    def blit(s, o, dx, dy):
        for y in range(N):
            for x in range(N):
                if o.g[y][x] != '.': s.set(x+dx, y+dy, o.g[y][x])
SHOE = ((-2, -1), (2, -1), (4, 1), (7, 2), (7, 3), (-2, 3))
def shoe(f, ax, ay, near, ph=0):
    r = math.radians(ph); m = pm([(ax + x*math.cos(r) - y*math.sin(r), ay + x*math.sin(r) + y*math.cos(r)) for x, y in SHOE]); f.fill(m, 'Q' if near else 'P'); f.rim(m, 'O')
    if near:
        for x, y in m:
            if (x, y-1) not in m and ax-1 < x < ax+6: f.set(x, y, 'R')
def limb(f, p0, p1, p2, w, base, lit, shade):
    m = seg(p0, p1, w[0], w[1]) | seg(p1, p2, w[1], w[2]) | disc(p1[0], p1[1], w[1]/2+.3)
    f.fill(m, base); f.bands(m, base, lit, shade); f.rim(m, 'O'); f.fill(m, base); f.bands(m, base, lit, shade)
def unit(dx, dy):
    l = math.hypot(dx, dy) or 1; return (dx/l, dy/l)
def ik(H, A, L1=8.7, L2=7.4):                    # two-bone leg: the knee bends forward (towards +x)
    dx, dy = A[0]-H[0], A[1]-H[1]; d = max(abs(L1-L2)+.05, min(math.hypot(dx, dy), L1+L2-.05)); a = math.atan2(dy, dx)
    b = math.acos(max(-1, min(1, (L1*L1 + d*d - L2*L2) / (2*L1*d)))); k1 = (H[0] + L1*math.cos(a+b), H[1] + L1*math.sin(a+b)); k2 = (H[0] + L1*math.cos(a-b), H[1] + L1*math.sin(a-b))
    return k1 if k1[0] > k2[0] else k2
def leg(f, H, A, near, ph, base, lit, shade, knee=None):
    k = knee or ik(H, A); w = (4.6, 4.0, 3.4) if near else (4.2, 3.8, 3.2)
    if knee:
        d = unit(A[0]-k[0], A[1]-k[1]); limb(f, H, k, (A[0]-d[0], A[1]-d[1]), w, base, lit, shade); f.fill(seg((A[0]-d[0]*3.5, A[1]-d[1]*3.5), (A[0], A[1]), 3.5, 3.5), 'A')
    else: limb(f, H, k, (A[0], A[1]-1), w, base, lit, shade); f.fill(seg((A[0], A[1]-3.5), (A[0], A[1]), 3.5, 3.5), 'A')
    shoe(f, A[0], A[1], near, ph)
def head_block(P):                               # hood, face and hair, drawn at the usual place; the caller shifts it
    f = F(); hp = P.get('hp', 0.0); up = P.get('hup', 0); back = P.get('hback', 0)
    Hd = pm([(32, 21), (36, 21), (37, 23), (37, 26), (32, 26), (31, 23)]); f.fill(Hd, 'r'); f.rim(Hd, 'O'); f.fill(Hd, 'r')
    f.line([(32, 22), (36, 22)], 'u'); f.line([(31, 25), (37, 25)], 's'); f.set(36, 23, 'g'); f.set(36, 25, 'g')
    face = pm([(31, 11), (38, 11), (39, 12), (39, 14), (40, 15), (41, 16), (40, 17), (40, 18), (39, 19), (39, 20), (37, 21), (33, 21), (31, 18), (30, 13)])
    f.fill(face, 'S'); f.rim(face, 'O'); f.fill(face, 'S')
    for x, y in face:
        if y >= 18 and x >= 36: f.set(x, y, 'U')
    tips = [(28 - back, 8 + round(math.sin(hp + 0.0))), (31 - back, 6 + round(math.sin(hp + 1.3)) - up), (34 - back, 5 + round(math.sin(hp + 2.6)) - up), (37 - back, 5 + round(math.sin(hp + 3.9)) - up), (40 - back, 7 + round(math.sin(hp + 5.2)))]
    top = {x: round(min(ty + (1.0*(tx-x) if x < tx else 2.4*(x-tx)) for tx, ty in tips)) for x in range(29, 42)}
    bot = {24: 11, 25: 12, 26: 14, 27: 15, 28: 16, 29: 17, 30: 18, 31: 18, 32: 14, 33: 14, 34: 11, 35: 11, 36: 11, 37: 11, 38: 11, 39: 10, 40: 10, 41: 9}
    hair = {(x, y) for x in range(29, 42) for y in range(top[x], bot[x]+1)} | {(35, 12), (37, 12), (37, 13), (39, 12)}
    f.fill(hair, 'I')
    for x, y in hair:
        if y == top[x]: f.set(x, y, 'H')
        elif y >= bot[x]-1 and x < 34: f.set(x, y, 'K')
        if 29 <= x <= 31 and y >= 14: f.set(x, y, 'k')
    for x in (32, 35, 38):
        for dx, dy in ((0, 1), (0, 2), (1, 3)):
            if (x+dx, top[x]+dy) in hair: f.set(x+dx, top[x]+dy, 'L')
    for x, y in ((35, 8), (36, 8), (37, 9), (30, 9), (31, 9), (29, 10)):
        if (x, y) in hair: f.set(x, y, 'H')
    for y in range(12, 15): f.set(32, y, 'K')
    f.set(33, 15, 'U'); f.set(33, 16, 'V'); f.set(34, 16, 'U'); f.set(36, 13, 'L'); f.set(37, 13, 'L'); f.set(38, 13, 'L')
    if P.get('blink'): f.set(37, 14, 'S'); f.set(38, 14, 'S'); f.set(37, 15, 'e'); f.set(38, 15, 'e')
    else: f.set(37, 14, 'W'); f.set(38, 14, 'e'); f.set(38, 15, 'e')
    f.set(39, 18, 'V'); f.set(40, 18, 'V')
    if P.get('mo'): f.set(39, 18, 'e'); f.set(40, 18, 'e'); f.set(39, 19, 'e')                  # a pained, open mouth
    return f
def figure(P):
    by, ln = P.get('by', 0), P.get('ln', 0); nf, ff = P.get('nf', (0, 0)), P.get('ff', (0, 0)); f = F()
    sx, sy = ln, by                                                       # shoulders and head move with the lean and the bob
    if P.get('fa'):                                                       # an explicit far arm: elbow and wrist relative to its shoulder
        S0 = (36+sx, 31+sy); fe = (S0[0]+P['fa'][0][0], S0[1]+P['fa'][0][1]); fw = (S0[0]+P['fa'][1][0], S0[1]+P['fa'][1][1]); d = unit(fw[0]-fe[0], fw[1]-fe[1])
        limb(f, S0, fe, fw, (3.2, 3.0, 2.8), 'B', 'C', 'A'); f.fill(seg((fw[0]-d[0]*2.4, fw[1]-d[1]*2.4), (fw[0]-d[0]*.4, fw[1]-d[1]*.4), 3.0, 3.0), 't'); fc = (fw[0]+d[0]*1.6, fw[1]+d[1]*1.6)
        fist = disc(fc[0], fc[1], 1.8); f.fill(fist, 'U'); f.rim(fist, 'O'); f.fill(fist, 'U'); far_h = (fc[0], fc[1]-1)
    else:
        fx, fy = 35.5 + sx + ff[0], 38.0 + sy + ff[1]                     # far arm: behind the body, only its fist shows in front of the chest
        limb(f, (36+sx, 31+sy), (35.5+sx+ff[0]*.5, 36+sy+ff[1]*.5), (fx, fy), (2.8, 2.8, 2.6), 'B', 'C', 'A'); fist = disc(fx+.8, fy+.6, 1.7); f.fill(fist, 'U'); f.rim(fist, 'O'); f.fill(fist, 'U'); far_h = (fx+1.0, fy+.6-1)
    lb, lf = P['lb'], P['lf']; hipB, hipF = (32 + P.get('hx', 0), 44 + by), (34 + P.get('hx', 0), 44 + by)
    leg(f, hipB, lb[:2], False, lb[2], 'B', 'C', 'A', P.get('kb'))
    T = pm([(32+sx, 29+sy), (37+sx, 29+sy), (37, 40+by), (36, 44+by), (32, 44+by)]); f.fill(T, 'C'); f.bands(T, 'C', 'D', 'B'); f.rim(T, 'O'); f.fill(T, 'C'); f.bands(T, 'C', 'D', 'B')
    f.line([(32, 44+by), (36, 44+by)], 'A'); f.line([(33+sx, 31+sy), (33, 41+by)], 'D'); f.set(36, 35+sy, 'g')
    leg(f, hipF, lf[:2], True, lf[2], 'B', 'C', 'A', P.get('kf'))
    f.blit(head_block(P), sx + P.get('hs', 0), sy + 3 + P.get('hd', 0))
    if P.get('na'):                                                       # an explicit near arm: elbow and wrist relative to its shoulder
        S0 = (34+sx, 31+sy); ne = (S0[0]+P['na'][0][0], S0[1]+P['na'][0][1]); nw = (S0[0]+P['na'][1][0], S0[1]+P['na'][1][1]); d = unit(nw[0]-ne[0], nw[1]-ne[1])
        limb(f, S0, ne, nw, (3.4, 3.0, 2.8), 'C', 'D', 'B'); f.fill(seg((nw[0]-d[0]*2.4, nw[1]-d[1]*2.4), (nw[0]-d[0]*.4, nw[1]-d[1]*.4), 3.0, 3.0), 's'); fc = (nw[0]+d[0]*1.6, nw[1]+d[1]*1.6)
        fist = disc(fc[0], fc[1], 1.9); f.fill(fist, 'S'); f.rim(fist, 'O'); f.fill(fist, 'S'); f.set(fc[0]-.4, fc[1]-1.3, 'T'); f.set(fc[0]+.3, fc[1]+1.4, 'U'); near_h = (fc[0], fc[1]-1)
    else:
        wx, wy = 34.6 + sx + nf[0], 41.0 + sy + nf[1]                     # near arm: down the side of the body, forearm forward to a fist at the belt
        limb(f, (34+sx, 31+sy), (34+sx+nf[0]*.5, 37.5+sy+nf[1]*.5), (wx, wy), (3.4, 3.0, 2.8), 'C', 'D', 'B'); f.fill(seg((wx-.8, wy-2.0), (wx+.1, wy-.4), 3.0, 3.0), 's')
        fist = disc(wx+.9, wy+.9, 1.8); f.fill(fist, 'S'); f.rim(fist, 'O'); f.fill(fist, 'S'); f.line([(wx+.2, wy+2.3), (wx+2.0, wy+2.3)], 'U'); f.set(wx+.2, wy-.7, 'T'); near_h = (wx+.9, wy+.9-1)
    if P.get('top'): P['top'](f, sx, sy)                                  # (v1.50: a caller's own drawing over the near arm, e.g. fingers)
    out = [(x, y) for y in range(N) for x in range(N) if f.g[y][x] == '.' and any(f.at(x+dx, y+dy) != '.' for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)))]
    for x, y in out: f.set(x, y, 'O')
    f.g = f.g[1:] + [['.']*N]                                             # feet on row 62, as in Gojo's sprites
    return f, near_h, far_h
GR = 59                                                                    # ankle row on the ground
def idle(i):
    ph = 2*math.pi*i/15
    P = dict(by=round(.5 + .5*math.sin(ph - 1.2)), ln=round(.6*math.sin(ph + 1)), nf=(round(.6*math.sin(2*ph)), round(.7*math.sin(ph + .6))), ff=(round(.6*math.sin(2*ph + 2)), round(.7*math.sin(ph + 2.2))),
             hp=ph*2, blink=i in (9, 10), lf=(34 + (1 if i in (5, 6, 7) else 0), GR - (1 if i in (6, 7) else 0), 0), lb=(31, GR, 0), hup=1 if i in (2, 3, 4) else 0)
    return figure(P)
def walk(i):
    ph = i/15; S = 3.5; L = 3.4
    def foot(p, base):
        p %= 1.0; x = base + S*math.cos(2*math.pi*p); lift = L*max(0.0, -math.sin(2*math.pi*p)); a = 20 if 0.36 <= p < 0.5 else (-8 if 0.5 <= p < 0.88 else 0)
        return (x, GR - lift, a)
    P = dict(by=round(.5 + .5*math.cos(4*math.pi*ph)), ln=1, nf=(round(2*math.sin(2*math.pi*ph)), 0), ff=(-round(2*math.sin(2*math.pi*ph)), 0), hp=ph*4*math.pi, hback=1, lf=foot(ph, 34), lb=foot(ph + .5, 31), blink=False)
    return figure(P)
JL = [0, 0, 0, 0, 10, 16, 20, 22, 22, 20, 16, 10, 0, 0, 0]                 # same lift curve as Gojo's jump
def jump(i):                                       # v1.47 the standing JUMP, 15 new pictures (the game plays 0-3 in the 160 ms of the push-off, 4-11 in the flight, following the real arc: 4 the rise, 5-6 higher, 7-8 the top, 9-11 the fall, and 12-14 in the 160 ms of the landing): 0 ready, 1-2 he dips and swings his arms back, 3 the push-off (the heels lift, the arms swing up), 4 the toes leave the floor, 5-6 the rise with the arms high and the legs trailing, 7-8 the top: the knees tuck and the arms open for balance, 9-11 the legs reach down and the arms come down and out, 12 touch-down, 13 the knees absorb it, 14 up again
    return figure(jpar(JUMPK, i, 1 if 4 <= i <= 8 else 0, 1 if 4 <= i <= 9 else 0))
def mix(a, b, t):
    return tuple(mix(x, y, t) for x, y in zip(a, b)) if isinstance(a, tuple) else a + (b - a)*t
def kv(keys, i):                                  # keyframes {frame: value} -> the value at frame i, eased between the keys (tuples are mixed part by part)
    ks = sorted(keys.items())
    if i <= ks[0][0]: return ks[0][1]
    for (a, va), (b, vb) in zip(ks, ks[1:]):
        if a <= i <= b: t = (i-a)/(b-a); return mix(va, vb, t*t*(3-2*t))
    return ks[-1][1]
IDLE_N, IDLE_F = ((0.0, 6.5), (0.6, 10.0)), ((-.5, 5), (-.5, 7)); GUARD_N, GUARD_F = ((3, 4), (6, 0)), ((1.5, 4.5), (4, 1))
JUMPK = {0: (0, 0, (34, GR, 0), (31, GR, 0), GUARD_N, GUARD_F), 1: (3, 1, (35, GR, 0), (30, GR, 0), ((-1, 5), (-3, 8)), ((-2, 5), (-4, 8))), 2: (6, 3, (37, GR, 0), (29, GR, 0), ((-3, 4), (-6, 7)), ((-3, 5), (-5, 8))),
         3: (2, 1, (36, GR-2, 25), (31, GR-1, 15), ((4, 0), (7, -5)), ((3, 1), (6, -3))), 4: (-2, 0, (36, GR-5, 40), (32, GR-4, 25), ((5, -3), (7, -9)), ((4, -2), (7, -7))), 5: (-2, 0, (37, GR-8, 30), (33, GR-7, 20), ((4, -4), (5, -11)), ((3, -3), (5, -9))),
         6: (-2, 0, (38, GR-10, 15), (34, GR-9, 10), ((5, -2), (9, -6)), ((4, -1), (8, -4))), 7: (-2, 0, (39, GR-11, 0), (35, GR-10, 0), ((5, 0), (10, -2)), ((4, 1), (9, 0))), 8: (-2, 0, (39, GR-11, 0), (34, GR-10, 0), ((5, 1), (11, 0)), ((3, 2), (8, 2))),
         9: (-2, 0, (38, GR-8, -5), (33, GR-7, 0), ((4, 2), (9, 3)), ((3, 3), (7, 4))), 10: (-1, 0, (37, GR-5, -10), (32, GR-4, -5), ((3, 3), (7, 6)), ((2, 4), (5, 7))), 11: (-1, 0, (36, GR-2, -15), (31, GR-1, -10), ((2, 4), (5, 8)), ((1, 5), (3, 8))),
         12: (3, 2, (36, GR, 0), (30, GR, 0), ((4, 3), (8, 2)), ((3, 3), (6, 3))), 13: (6, 3, (37, GR, 0), (29, GR, 0), ((3, 4), (6, 0)), GUARD_F), 14: (1, 0, (34, GR, 0), (31, GR, 0), GUARD_N, GUARD_F)}      # the standing jump, a picture each: body height, lean, front foot (x, y, tilt), back foot, near arm (elbow, hand), far arm
def jpar(K, i, up, back):                          # the figure's numbers for picture i of a table of key pictures (every number is eased between the keys)
    by, ln, lf, lb, na, fa = kv(K, i)
    return dict(by=round(by), ln=round(ln), lf=(round(lf[0]), round(lf[1]), lf[2]), lb=(round(lb[0]), round(lb[1]), lb[2]), na=na, fa=fa, hp=i*.9, hup=up, hback=back)
HOOK = {0: IDLE_N, 2: GUARD_N, 4: ((-4, 3), (-3, -4)), 5: ((0, -1), (3, -7)), 6: ((5, -2), (9, -5)), 7: ((7, -1), (12, -4)), 8: ((7.5, -.5), (12.5, -3.5)), 9: ((6, 1), (10, -1)), 10: ((4, 3), (8, 2)), 12: ((2, 5), (3, 3)), 14: IDLE_N}      # a hook: the elbow comes up and round, the bent arm swings at head height
def hook(i, far):                                  # right hook (the near arm) or left hook (the far arm): wind back, swing round, snap back; the impact is frame 7
    g = {0: IDLE_F if far else IDLE_N, 2: GUARD_N if far else GUARD_F, 12: GUARD_N if far else GUARD_F, 14: IDLE_N if far else IDLE_F}
    P = dict(by=round(kv({0: 0, 3: 1, 7: 0, 14: 0}, i)), ln=round(kv({0: 0, 3: -1, 5: 0, 7: 2, 10: 1, 14: 0}, i)), hx=round(kv({0: 0, 3: -1, 7: 1, 10: 0, 14: 0}, i)), lf=(round(kv({0: 34, 5: 34, 7: 36, 10: 35, 14: 34}, i)), GR, 0), lb=(round(kv({0: 31, 7: 30, 14: 31}, i)), GR, 0),
             hp=i*.8, hback=1 if 5 <= i <= 9 else 0, blink=False)
    P['fa'], P['na'] = (kv(HOOK, i), kv(g, i)) if far else (kv(g, i), kv(HOOK, i)); P['fa'], P['na'] = (P['fa'], P['na']) if far else (P['na'], P['fa'])
    return figure(P)
def knee(i):                                       # both fists up, then the near knee drives up and forward into the enemy; the impact is frame 7
    kn = {3: (37, 48), 5: (40, 44), 7: (43, 41), 8: (43, 41), 10: (40, 45), 12: (37, 50)}; an = {3: (35, 56, 10), 5: (37, 53, 30), 7: (38, 50, 40), 8: (38, 50, 40), 10: (36, 54, 25), 12: (35, 57, 10)}
    up = 3 <= i <= 12; hp = {0: 0, 4: 0, 7: 2, 10: 1, 14: 0}
    P = dict(by=round(kv({0: 0, 3: 1, 7: -1, 10: 0, 14: 0}, i)), ln=round(kv({0: 0, 3: -1, 7: 2, 10: 1, 14: 0}, i)), hx=round(kv(hp, i)), lf=tuple(round(v) for v in kv(an, i)) if up else (34, GR, 0), kf=tuple(kv(kn, i)) if up else None, lb=(31, GR, 0),
             na=kv({0: IDLE_N, 2: GUARD_N, 5: GUARD_N, 7: ((6, 3), (10, 2)), 10: GUARD_N, 13: IDLE_N, 14: IDLE_N}, i), fa=kv({0: IDLE_F, 2: GUARD_F, 5: GUARD_F, 7: ((5, 2), (9, 0)), 10: GUARD_F, 13: IDLE_F, 14: IDLE_F}, i), hp=i*.7, hback=0, blink=False)
    return figure(P)
KICK = {0: (1, 0, 0, (34, GR, 0), (31, GR, 0)), 1: (4, 1, 0, (34, GR, 0), (30, GR, 0)), 2: (3, 1, 0, (34, GR, 0), (30, GR, 0)), 3: (-2, 0, 0, (36, 56, 20), (31, 56, 10)), 4: (-2, -1, 1, (38, 49, -10), (33, 51, 10)),
        5: (-2, -3, 2, (45, 28, -55), (33, 51, 10)), 6: (-2, -2, 2, (41, 40, -20), (33, 51, 10)), 7: (-2, -1, 2, (40, 44, -10), (33, 51, 10)), 8: (-2, 0, 2, (46, 42, -5), (33, 50, 10)), 9: (-2, 0, 2, (51, 41, -5), (33, 50, 10)),
        10: (-2, 0, 2, (43, 47, 10), (33, 50, 10)), 11: (-2, 1, 2, (41, 50, 20), (33, 51, 10)), 12: (-1, 2, 3, (48, 54, 35), (33, 52, 10)), 13: (1, 1, 2, (40, 57, 20), (31, 57, 10)), 14: (2, 0, 1, (35, GR, 0), (31, GR, 0))}
KICK_LIFT = [0, 0, 0, 4, 9, 12, 12, 11, 11, 12, 12, 12, 10, 4, 0]    # the jump (the game raises the sprite by this many px); the kicks land on frames 5, 9 and 12
def kick3(i):                                      # a jump, then ONE leg kicks three times: high (the head), middle (the stomach), low (the legs); the arms balance
    by, ln, hx, lf, lb = KICK[i]; air = 3 <= i <= 12
    P = dict(by=by, ln=ln, hx=hx, lf=lf, lb=lb, na=kv({0: IDLE_N, 2: GUARD_N, 4: ((-3, 5), (-5, 9)), 12: ((-3, 5), (-5, 9)), 14: IDLE_N}, i), fa=kv({0: IDLE_F, 2: GUARD_F, 4: ((3, 3), (7, -1)), 12: ((3, 3), (7, -1)), 14: IDLE_F}, i), hp=i*.9, hup=1 if air else 0, hback=1 if 4 <= i <= 12 else 0, blink=False)
    return figure(P)
DIV_N = {0: GUARD_N, 1: ((-1, 5.5), (-1.5, 8.0)), 3: ((-3, 6), (-4, 8.5)), 4: ((-1.5, 4), (0, 5.5)), 5: ((3, 1.5), (7, 1.3)), 6: ((7, .2), (14.5, -.6)), 8: ((7.2, .2), (14.8, -.7)), 9: ((6, .6), (12, -.4)), 10: ((3.5, 2), (7, .6)), 11: ((2.5, 3.2), (5.5, 0)), 12: GUARD_N, 14: IDLE_N}
DIV_F = {0: GUARD_F, 3: ((4, 3.5), (8, .5)), 5: ((3, 4), (6.5, 2)), 6: ((2.5, 4.5), (5.5, 3)), 9: ((3, 4), (6, 1.5)), 12: GUARD_F, 14: IDLE_F}
def divergent(i):                                  # DIVERGENT FIST: the near fist is pulled back to the hip (cursed energy gathers in it), drives straight forward into the enemy (the first impact is frame 6), stays pressed in, then is pulled back (the second impact lands on frame 10 while it comes back)
    P = dict(by=round(kv({0: 0, 2: 1, 4: 1, 6: -1, 8: -1, 10: 0, 14: 0}, i)), ln=round(kv({0: 0, 3: -1, 5: 1, 6: 3, 8: 3, 10: 1, 12: 0, 14: 0}, i)), hx=round(kv({0: 0, 3: -1, 6: 2, 8: 2, 10: 1, 12: 0, 14: 0}, i)),
             lf=(round(kv({0: 34, 3: 34, 6: 38, 8: 38, 11: 36, 14: 34}, i)), GR, 0), lb=(round(kv({0: 31, 3: 30, 6: 28, 8: 28, 11: 30, 14: 31}, i)), GR, 0), na=kv(DIV_N, i), fa=kv(DIV_F, i), hp=i*.8, hback=0, blink=False)
    return figure(P)
RUSH_F = {0: GUARD_F, 2: ((2, 4.5), (4, 2)), 4: ((-2, 4), (-5, 7)), 5: ((-1, 4), (-3, 6)), 6: ((2.5, 4.5), (5.5, 3)), 9: ((3, 4), (6, 1.5)), 12: GUARD_F, 14: IDLE_F}
def rush(i):                                       # RUSH FIST (forward + BLUE): a super fast DIVERGENT FIST on the run: he crouches into the stride and pulls the fist back (frames 1-3), sprints forward leaning right over (4-5), plants his front foot and drives the fist straight out (the first impact is frame 6), holds it (7-9), the second impact lands on frame 10 as he recoils, then he straightens up; the game plays it at twice the speed and slides him forward while it runs; speed lines and a puff of dust trail behind him
    P = dict(by=round(kv({0: 0, 2: 2, 4: 1, 6: -1, 9: -1, 11: 0, 14: 0}, i)), ln=round(kv({0: 0, 2: 2, 4: 5, 6: 7, 9: 7, 11: 3, 13: 1, 14: 0}, i)), hx=round(kv({0: 0, 2: -1, 4: 2, 6: 4, 9: 4, 11: 2, 14: 0}, i)),
             lf=tuple(round(v) for v in kv({0: (34, GR, 0), 2: (33, GR, 0), 3: (38, GR - 4, -15), 4: (43, GR - 3, -15), 5: (45, GR - 1, -8), 6: (44, GR, 0), 9: (44, GR, 0), 11: (40, GR, 0), 14: (34, GR, 0)}, i)),
             lb=tuple(round(v) for v in kv({0: (31, GR, 0), 2: (29, GR, 0), 3: (27, GR - 2, 20), 4: (24, GR - 6, 30), 5: (22, GR - 5, 28), 6: (24, GR - 3, 20), 9: (26, GR - 1, 10), 11: (29, GR, 0), 14: (31, GR, 0)}, i)),
             na=kv(DIV_N, i), fa=kv(RUSH_F, i), hp=i*1.1, hback=1 if 3 <= i <= 10 else 0, mo=5 <= i <= 9, blink=False)
    f, nh, fh = figure(P); streaks(f, False, i)
    if 3 <= i <= 5: puff(f, 26 - (i - 3)*2, 61, 2 if i < 5 else 1)
    return f, nh, fh
BLK_N, BLK_F = ((5.5, 3.5), (7.5, -5.5)), ((4, 3.5), (7, -8))                # BLOCK: both forearms up tight in front of the face, the elbows tucked in front of the ribs (the far fist peeks out above the near one)
def block(i):                                      # BLOCK, 10 frames: 0-4 the guard comes up (the game plays them in a quarter of a second), 5-9 held with a slow breathing sway (that part loops); the knees bend, the shoulders hunch, the head ducks behind the fists
    r = kv({0: 0, 4: 1}, i); sw = math.sin((i - 5)*2*math.pi/5) if i >= 5 else 0.0
    P = dict(by=round(2*r + .5*sw), ln=round(1.4*r), hx=-round(r), hs=round(r), hd=round(2*r), lf=(round(34 + 1.6*r), GR, 0), lb=(round(31 - 1.6*r), GR, 0),
             na=kv({0: IDLE_N, 4: BLK_N}, i), fa=kv({0: IDLE_F, 4: BLK_F}, i), hp=i*.8, hback=0, blink=False)
    if i >= 5: P['na'] = (BLK_N[0], (BLK_N[1][0], BLK_N[1][1] + .6*sw)); P['fa'] = (BLK_F[0], (BLK_F[1][0], BLK_F[1][1] - .6*sw))
    return figure(P)
def bwalk(i):                                      # walking with the guard up (15 frames, a slow shuffle; the game plays it backwards for walking back)
    ph = i/15; S = 2.6; L = 2.0
    def foot(p, base):
        p %= 1.0; return (base + S*math.cos(2*math.pi*p), GR - L*max(0.0, -math.sin(2*math.pi*p)), 0)
    P = dict(by=2 + round(.5 + .5*math.cos(4*math.pi*ph)) - 1, ln=1, hx=-1, hs=1, hd=2, lf=foot(ph, 35), lb=foot(ph + .5, 30), na=BLK_N, fa=BLK_F, hp=ph*4*math.pi, hback=0, blink=False)
    return figure(P)
# ---------------------------------------------------------------- CURSED ENERGY MODE moves (15 frames each; the hit numbers are 38-43): the 4-hit M1 = R.KICK (roundhouse), ELBOW, DOWNSLAM, PUSH KICK; the CONCENTRATED FIST (BLUE in the mode); the SWEEP (BLUE while crouched, normal mode)
def rkick(i):                                      # R.KICK: a standing roundhouse; the front leg chambers, whips out to chest height (the impact is frame 7) and snaps back; the other leg carries him, the body leans away, the arms balance
    kn = {0: None, 2: (40, 42), 4: (42, 39), 6: (44, 38), 7: (44, 37), 8: (44, 37), 10: (42, 40), 12: (38, 46)}
    ft = {0: (34, GR, 0), 2: (36, 50, 30), 4: (39, 46, 20), 6: (49, 36, -15), 7: (52, 35, -35), 8: (52, 35, -35), 10: (44, 44, 0), 12: (36, 52, 10), 14: (34, GR, 0)}
    up = 2 <= i <= 12; f = tuple(round(v) for v in kv(ft, i)); k = kv({a: b for a, b in kn.items() if b}, i) if up else None
    P = dict(by=round(kv({0: 0, 3: 1, 7: -1, 11: 0, 14: 0}, i)), ln=round(kv({0: 0, 3: -1, 7: -3, 11: -1, 14: 0}, i)), hx=round(kv({0: 0, 7: -2, 12: 0, 14: 0}, i)), lf=f, kf=k, lb=(round(kv({0: 31, 7: 29, 12: 30, 14: 31}, i)), GR, 0),
             na=kv({0: IDLE_N, 3: GUARD_N, 6: ((-3, 5), (-5, 9)), 9: ((-3, 5), (-5, 9)), 12: GUARD_N, 14: IDLE_N}, i), fa=kv({0: IDLE_F, 3: GUARD_F, 6: ((3, 3), (7, -1)), 9: ((3, 3), (7, -1)), 12: GUARD_F, 14: IDLE_F}, i), hp=i*.9, hback=1 if 5 <= i <= 10 else 0, blink=False)
    return figure(P)
def elbow(i):                                      # ELBOW: a step in and a short, hard elbow at head height (the impact is frame 7): the upper arm points straight at the enemy and the forearm is folded back against the shoulder
    P = dict(by=round(kv({0: 0, 3: 1, 7: 0, 14: 0}, i)), ln=round(kv({0: 0, 3: -2, 6: 2, 7: 4, 10: 3, 14: 0}, i)), hx=round(kv({0: 0, 3: -1, 7: 2, 11: 1, 14: 0}, i)), hs=round(kv({0: 0, 7: 1, 14: 0}, i)),
             lf=(round(kv({0: 34, 3: 34, 7: 39, 11: 37, 14: 34}, i)), GR, 0), lb=(round(kv({0: 31, 3: 30, 7: 28, 11: 29, 14: 31}, i)), GR, 0),
             na=kv({0: IDLE_N, 2: GUARD_N, 4: ((-3, 4), (-1, -3)), 6: ((6, 1), (3, -4.5)), 7: ((9, .5), (5, -5.5)), 9: ((9, .5), (5, -5.5)), 12: GUARD_N, 14: IDLE_N}, i), fa=kv({0: IDLE_F, 2: GUARD_F, 7: ((1.5, 4), (4, 1)), 12: GUARD_F, 14: IDLE_F}, i), hp=i*.8, hback=0, blink=False)
    return figure(P)
def downslam(i):                                   # DOWNSLAM: both fists up over the head (frames 2-4), then the whole body drops into a hammer blow that ends low in front of him (the impact is frame 7)
    P = dict(by=round(kv({0: 0, 3: -1, 5: 0, 7: 4, 10: 4, 14: 0}, i)), ln=round(kv({0: 0, 3: -2, 5: 1, 7: 6, 10: 5, 14: 0}, i)), hx=round(kv({0: 0, 3: -1, 7: 2, 11: 1, 14: 0}, i)), hs=round(kv({0: 0, 7: 2, 14: 0}, i)), hd=round(kv({0: 0, 4: 0, 7: 3, 11: 2, 14: 0}, i)),
             lf=(round(kv({0: 34, 3: 35, 7: 38, 11: 36, 14: 34}, i)), GR, 0), lb=(round(kv({0: 31, 3: 29, 7: 28, 11: 29, 14: 31}, i)), GR, 0),
             na=kv({0: IDLE_N, 2: ((2, -6), (3, -13)), 4: ((2, -6.5), (3, -14)), 6: ((6, 0), (10, 5)), 7: ((8, 5), (13, 15)), 10: ((8, 5), (13, 15)), 13: GUARD_N, 14: IDLE_N}, i),
             fa=kv({0: IDLE_F, 2: ((1.5, -6), (2, -13)), 4: ((1.5, -6.5), (2.5, -14)), 6: ((5, 0), (9, 5)), 7: ((7, 5), (12, 15)), 10: ((7, 5), (12, 15)), 13: GUARD_F, 14: IDLE_F}, i), hp=i*.8, hup=1 if 2 <= i <= 5 else 0, hback=0, blink=False)
    return figure(P)
def pushkick(i):                                   # PUSH KICK: the knee comes up, then the whole leg drives straight out with the sole first at hip height (the impact is frame 7); he leans right back to throw his weight into it
    kn = {0: None, 2: (41, 40), 4: (43, 41), 7: (44, 42), 9: (44, 42), 11: (42, 44), 12: (38, 47)}
    ft = {0: (34, GR, 0), 2: (37, 49, 40), 4: (45, 43, -45), 7: (53, 42, -80), 9: (53, 42, -80), 11: (43, 47, -20), 12: (37, 52, 10), 14: (34, GR, 0)}
    up = 2 <= i <= 12; f = tuple(round(v) for v in kv(ft, i)); k = kv({a: b for a, b in kn.items() if b}, i) if up else None
    P = dict(by=round(kv({0: 0, 3: 1, 7: 0, 11: 0, 14: 0}, i)), ln=round(kv({0: 0, 3: -1, 7: -4, 11: -2, 14: 0}, i)), hx=round(kv({0: 0, 7: -3, 12: -1, 14: 0}, i)), lf=f, kf=k, lb=(round(kv({0: 31, 7: 28, 12: 30, 14: 31}, i)), GR, 0),
             na=kv({0: IDLE_N, 3: GUARD_N, 6: ((-4, 3), (-8, 5)), 10: ((-4, 3), (-8, 5)), 12: GUARD_N, 14: IDLE_N}, i), fa=kv({0: IDLE_F, 3: GUARD_F, 6: ((3, 3), (8, 1)), 10: ((3, 3), (8, 1)), 12: GUARD_F, 14: IDLE_F}, i), hp=i*.9, hback=1 if 5 <= i <= 10 else 0, blink=False)
    return figure(P)
CONC_N = {0: GUARD_N, 1: ((-1.5, 5.5), (-2.5, 8)), 4: ((-4, 6), (-6, 8.5)), 5: ((-4, 5.5), (-6, 8)), 6: ((3, 2), (9, .5)), 7: ((7.5, .5), (16, -1)), 9: ((7.5, .5), (16, -1)), 10: ((6.5, 1), (13, -.5)), 12: GUARD_N, 14: IDLE_N}
CONC_F = {0: GUARD_F, 4: ((3.5, 4), (7, 1)), 6: ((2.5, 4.5), (5.5, 3)), 9: ((3, 4), (6, 1.5)), 12: GUARD_F, 14: IDLE_F}
def conc(i):                                       # CONCENTRATED FIST: he sinks and coils with the fist drawn right back (frames 1-5, the energy gathers), then lunges and drives it straight out, arm fully stretched (the impact is frame 7), holds it there and comes back
    P = dict(by=round(kv({0: 0, 3: 2, 5: 2, 7: -1, 10: -1, 14: 0}, i)), ln=round(kv({0: 0, 4: -2, 5: -2, 6: 2, 7: 4, 10: 3, 14: 0}, i)), hx=round(kv({0: 0, 4: -1, 7: 3, 10: 2, 14: 0}, i)), hs=round(kv({0: 0, 7: 1, 14: 0}, i)),
             lf=(round(kv({0: 34, 4: 33, 6: 37, 7: 40, 11: 38, 14: 34}, i)), GR, 0), lb=(round(kv({0: 31, 4: 29, 7: 27, 11: 29, 14: 31}, i)), GR, 0), na=kv(CONC_N, i), fa=kv(CONC_F, i), hp=i*.8, hback=0, blink=False)
    return figure(P)
def streak(f, pts, ws, ts, over):                  # a ribbon along the points (tail first) with a width and a brightness (0 dark tail .. 1 white head) at each: every pixel near the line is painted by its distance to it (white core, light edge; dark when faint); over=True paints it over the body, otherwise only on empty pixels (behind him)
    xs = [p[0] for p in pts]; ys = [p[1] for p in pts]; pad = max(ws)/2 + 1
    for y in range(max(0, int(min(ys) - pad)), min(N, int(max(ys) + pad) + 2)):
        for x in range(max(0, int(min(xs) - pad)), min(N, int(max(xs) + pad) + 2)):
            best = None
            for j in range(len(pts) - 1):
                (x0, y0), (x1, y1) = pts[j], pts[j+1]; dx, dy = x1 - x0, y1 - y0; l2 = dx*dx + dy*dy or 1; u = max(0.0, min(1.0, ((x - x0)*dx + (y - y0)*dy)/l2)); d = math.hypot(x - (x0 + u*dx), y - (y0 + u*dy))
                if best is None or d < best[0]: best = (d, ws[j] + (ws[j+1] - ws[j])*u, ts[j] + (ts[j+1] - ts[j])*u)
            d, w, t = best
            if d <= w/2 and (over or f.at(x, y) == '.'): f.set(x, y, ('W' if d <= w*.22 else 'E') if t > .5 else ('E' if d <= w*.22 else 'D'))
def ring(xh, length, R=19.5, cx=35.5, yf=53.5, ry=7.0, n=44):             # the foot's path round him on the floor, an oval seen from the side (the lower half is the near side): the swoosh ends at the foot (x = xh) and trails back along the path for `length` radians; returns the far part (it goes behind him) and the near part (it goes over him)
    th_h = math.acos(max(-1.0, min(1.0, (xh - cx)/R))); th_t = th_h + max(0.0, min(length, 2*math.pi - th_h)); far, near = ([], []), ([], [])
    for q in range(n + 1):
        th = th_t + (th_h - th_t)*q/n; t = q/n; part = far if math.sin(th) < 0 else near
        part[0].append((cx + R*math.cos(th), yf + ry*math.sin(th))); part[1].append((.8 + 3.4*t**1.3, t))
    return far, near
def swoosh(f, xh, length):
    for (pts, wt), over in zip(ring(xh, length), (False, True)):
        if len(pts) > 2: streak(f, pts, [w for w, t in wt], [t for w, t in wt], over)
def burst(f, x, y, r):                              # a white star: a cross and a diagonal cross
    for k in range(-r, r + 1):
        f.set(x + k, y, 'W' if abs(k) < r else 'E'); f.set(x, y + k, 'W' if abs(k) < r else 'E')
        if abs(k) <= r - 1 and k: f.set(x + k, y + k, 'E'); f.set(x + k, y - k, 'E')
def puff(f, x, y, n):                               # a small cloud of dust on the floor (n = 1..3)
    for dx, dy in ((0, 0), (1, 0), (-1, 0), (0, -1), (1, -1), (2, 0), (-2, 0), (0, -2), (-1, -1), (3, 0), (-3, 0), (2, -1), (-2, -1), (1, -2))[:(3, 7, 14)[n - 1]]:
        if f.at(x + dx, y + dy) == '.': f.set(x + dx, y + dy, 'E' if (dx + dy) % 2 else 'D')
SW_X = {0: 37, 1: 31, 2: 20, 3: 27, 4: 39, 5: 50, 6: 55, 7: 56, 8: 56, 9: 54, 10: 49, 11: 43, 12: 39, 13: 38, 14: 37}                                  # where the sweeping foot is, frame by frame
SW_Y = {0: GR, 1: GR, 2: GR - 1, 3: GR, 4: GR, 5: GR - 1, 6: GR - 1, 7: GR - 1, 8: GR - 1, 9: GR - 1, 10: GR - 1, 11: GR, 12: GR, 13: GR, 14: GR}
SW_A = {0: 0, 1: 10, 2: 25, 3: 0, 4: -20, 5: -45, 6: -70, 7: -75, 8: -75, 9: -60, 10: -40, 11: -20, 12: -5, 13: 0, 14: 0}
def sweep(i):                                      # SWEEP: from the crouch he sinks onto one planted hand and swings the other leg back (frames 1-2, the wind-up), whips it right round under him (3-5) and out along the floor into the enemy's feet (the impact is frame 6) with a white swoosh behind the foot, a star at the impact and dust; he holds it, then pulls it in and is back in his crouch
    by = round(kv({0: CR, 1: 9, 2: 11, 8: 11, 10: 10, 12: 8, 13: CR, 14: CR}, i)); hx = round(kv({0: 0, 1: -1, 2: -2, 4: 0, 14: 0}, i)); H = (34 + hx, 44 + by); fx, fy, fa = SW_X[i], SW_Y[i], SW_A[i]
    kn = ((H[0] + fx)/2, (H[1] + fy)/2 - 1.5) if (fx <= 31 or fx >= 42) else None
    P = dict(by=by, ln=round(kv({0: 2, 1: 3, 2: 6, 3: 3, 4: -2, 5: -6, 6: -8, 8: -8, 9: -6, 10: -3, 11: 0, 12: 1, 14: 2}, i)), hx=hx, hd=round(kv({0: 0, 2: 2, 4: 1, 9: 1, 11: 0, 14: 0}, i)), lf=(fx, fy, fa), kf=kn, lb=(round(kv({0: 30, 2: 29, 10: 29, 12: 30, 14: 30}, i)), GR, 0), kb=(37, 46 + by) if 1 <= i <= 11 else None,
             na=kv({0: ((3, 4), (6, 0)), 1: ((2, 6), (4, 11)), 2: ((3, 8), (4, 16.5)), 3: ((1, 8), (1, 16.5)), 4: ((-3, 8), (-7, 16)), 10: ((-3, 8), (-7, 16)), 11: ((0, 5), (2, 8)), 12: ((3, 5), (6, 3)), 14: ((3, 4), (6, 0))}, i),
             fa=kv({0: ((1.5, 4.5), (4, 1)), 1: ((2, 5), (5, 8)), 2: ((3, 5), (7, 10)), 3: ((0, 4), (-3, 8)), 4: ((-3.5, 1.5), (-9, -2)), 8: ((-3.5, 1.5), (-9, -3)), 10: ((-2, 3), (-6, 3)), 12: ((1.5, 4.5), (4, 1)), 14: ((1.5, 4.5), (4, 1))}, i), hp=i*.9, hup=1 if 4 <= i <= 6 else 0, hback=1 if 4 <= i <= 9 else 0, mo=4 <= i <= 9, blink=False)
    f, nh, fh = figure(P)
    if 3 <= i <= 10:                                                           # the swoosh: a white ring on the floor round him following the foot, long while it whips round, shorter and fading afterwards
        swoosh(f, fx - 3, kv({3: 1.6, 4: 3.4, 5: 5.0, 6: 5.8, 7: 5.8, 8: 4.6, 9: 3.4, 10: 2.2}, i))
    if 5 <= i <= 8:                                                            # wind lines in the air above the leg
        for k, (dy, ln_) in enumerate(((-9, 11), (-12, 8))):
            for x in range(ln_):
                if f.at(fx - 6 - k*3 - x, 58 + dy) == '.': f.set(fx - 6 - k*3 - x, 58 + dy, 'W' if x < ln_ - 3 else 'E')
    if i in (6, 7): burst(f, min(fx + 3, 56), 56, 4 if i == 6 else 3)           # the hit
    for k, (dx, d0) in enumerate(((-4, 6), (-11, 7), (-18, 8), (-25, 9))):      # dust drifting up behind the foot
        age = i - d0 + 3
        if 0 <= age <= 5: puff(f, min(fx, 54) + dx, 61 - age//2, 1 if age < 3 else 2 if age < 5 else 3)
    return f, nh, fh
PU_N = {0: IDLE_N, 1: ((1, 6), (0, 10)), 2: ((-1, 3), (-3, -2)), 3: ((-3, -3), (-6, -9)), 4: ((-4, -6.5), (-8, -14)), 5: ((-4.5, -7.5), (-9, -16.5)), 6: ((-4.5, -7.5), (-9, -16.5)), 7: ((2, -4), (4, -10)), 8: ((6, 3), (10, 6)), 9: ((5.5, 8), (9, 17)), 10: ((5.5, 8), (9, 17)), 11: ((4, 5), (7.5, 8)), 12: GUARD_N, 13: ((1.5, 5.5), (3, 6)), 14: IDLE_N}
PU_F = {0: IDLE_F, 1: ((-.5, 5.5), (-1, 9)), 2: ((3, 0), (6, -5)), 3: ((4, -4), (8, -10)), 4: ((5, -7), (9.5, -14.5)), 5: ((5.5, -8), (10.5, -17)), 6: ((5.5, -8), (10.5, -17)), 7: ((4, -3), (7, -9)), 8: ((5, 3), (8.5, 6)), 9: ((4.5, 8), (7.5, 17)), 10: ((4.5, 8), (7.5, 17)), 11: ((3, 5), (6, 8)), 12: GUARD_F, 13: ((.5, 5), (1, 7)), 14: IDLE_F}
def pu_params(i):
    return dict(by=[0, 2, 0, -1, -2, -2, -2, 0, 3, 5, 5, 3, 1, 0, 0][i], ln=[0, 1, 0, 0, -1, -1, -1, 1, 3, 4, 4, 2, 1, 0, 0][i], hd=[0, 0, 0, 0, 0, -1, -1, 0, 1, 2, 2, 1, 0, 0, 0][i],
                hx=[0, 0, 0, 0, 0, 0, 0, 0, 1, 2, 2, 1, 0, 0, 0][i], lf=(34 + [0, 1, 0, 0, 0, 0, 0, 0, 1, 3, 3, 2, 1, 0, 0][i], GR, 0), lb=(31 - [0, 1, 0, 0, 0, 0, 0, 0, 1, 3, 3, 2, 1, 0, 0][i], GR, 0),
                na=PU_N[i], fa=PU_F[i], hp=i*.9, hup=1 if 3 <= i <= 7 else 0, hback=1 if 4 <= i <= 6 else 0, mo=8 <= i <= 10, blink=False)
def powerup(i):                                    # CURSED ENERGY ON: both hands go up behind his head with nothing on them (frames 1-4, a beat at the top, 5-6), then slam down in front of him (7-9) and the flames light up on the way down (the game lights them after 7.5 frames); he crouches under the blow, then straightens up with his fists burning
    f, nh, fh = figure(pu_params(i))
    if i in (7, 8, 9):                                                         # a swoosh behind each falling fist (from where it was a frame ago)
        pn, pf = figure(pu_params(i - 1))[1:]
        streak(f, [pf, fh], (1.0, 3.4), (0, 1), False); streak(f, [pn, nh], (1.0, 3.4), (0, 1), False)
    return f, nh, fh
# ---------------------------------------------------------------- the CROUCHED CONCENTRATED FIST (cursed energy mode, BLUE while crouched): the UPPERCUT (atk13, hit 46) launches the enemy into the air, and pressing it again within the air time throws the FACE KICK (atk14, hit 47): a flying kick up into the airborne enemy's face. Both start and end in the crouch (cidle) so the stance never pops.
UP_N = {0: ((3, 4), (6, 0)), 1: ((0, 6), (-1.5, 11)), 2: ((-2, 7), (-3, 13.5)), 3: ((-1, 8), (0, 14.5)), 4: ((3, 7), (6.5, 11.5)), 5: ((6, 2.5), (9.5, -1.5)), 6: ((5.5, -4), (8, -11.5)), 7: ((5, -4.5), (7.5, -12.5)), 9: ((5, -4), (7.5, -11.5)), 10: ((4.5, -1.5), (7.5, -6.5)), 11: ((4, 1.5), (7.5, -2)), 12: ((3.5, 3.5), (6.5, -.5)), 13: ((3, 4), (6, 0)), 14: ((3, 4), (6, 0))}
UP_F = {0: ((1.5, 4.5), (4, 1)), 2: ((2, 4.5), (5, 1)), 4: ((0, 5), (1, 8)), 6: ((-2.5, 3.5), (-6, 6)), 9: ((-2.5, 3.5), (-6, 6)), 11: ((0, 4.5), (1, 5)), 13: ((1.5, 4.5), (4, 1)), 14: ((1.5, 4.5), (4, 1))}
UP_LF = {0: (37, GR, 0), 3: (37, GR, 0), 4: (37, GR - 1, 5), 5: (36, GR - 3, 20), 6: (36, GR - 4, 28), 9: (36, GR - 3, 25), 11: (37, GR - 1, 10), 12: (37, GR, 0), 14: (37, GR, 0)}
UP_LB = {0: (30, GR, 0), 3: (30, GR, 0), 4: (30, GR - 1, 5), 5: (30, GR - 4, 30), 6: (29, GR - 6, 38), 9: (30, GR - 4, 32), 11: (30, GR - 1, 10), 12: (30, GR, 0), 14: (30, GR, 0)}
UP_LIFT = [0, 0, 0, 0, 1, 3, 4, 4, 4, 3, 2, 0, 0, 0, 0]                           # the little hop of the rising punch (the game raises the sprite by this many px)
def up_params(i):
    return dict(by=round(kv({0: CR, 1: 9, 2: 11, 3: 10, 4: 6, 5: 1, 6: -2, 8: -2, 9: 0, 10: 2, 11: 4, 12: 6, 13: CR, 14: CR}, i)), ln=round(kv({0: 2, 1: 0, 2: -2, 3: -1, 4: 1, 5: 3, 6: 4, 8: 4, 9: 3, 10: 3, 11: 2, 14: 2}, i)), hx=round(kv({0: 0, 2: -1, 4: 0, 6: 2, 8: 2, 10: 1, 12: 0, 14: 0}, i)),
                hs=round(kv({0: 0, 6: 1, 9: 1, 12: 0, 14: 0}, i)), hd=round(kv({0: 0, 2: 2, 4: 0, 14: 0}, i)), lf=tuple(round(v) for v in kv(UP_LF, i)), lb=tuple(round(v) for v in kv(UP_LB, i)),
                na=kv(UP_N, i), fa=kv(UP_F, i), hp=i*.9, hup=1 if 4 <= i <= 9 else 0, hback=1 if 5 <= i <= 9 else 0, mo=5 <= i <= 9, blink=False)
def uppercut(i):                                   # UPPERCUT: from the crouch he sinks and coils with the near fist dragged back low behind his hip (frames 1-3, the energy gathers), then drives up out of the crouch, the fist rising in front of him in a long arc (4-5) and ends high in front of the chin (the impact is frame 6) with a hop, a white trail behind the fist, a star at the hit and speed lines rising off it; he holds it (7-8), comes down (9-11) and sinks back into his crouch (12-14)
    f, nh, fh = figure(up_params(i))
    if 3 <= i <= 9:                                                            # the cursed energy trail: the path the fist has just taken
        pts = [figure(up_params(j))[1] for j in (max(0, i - 3), max(0, i - 2), max(0, i - 1), i)]
        if i <= 9 and pts[0] != pts[-1]: streak(f, pts, (.8, 1.8, 3.0, 4.2), (0, .3, .7, 1), False)
    if i in (6, 7): burst(f, round(nh[0]) + 2, round(nh[1]) - 2, 4 if i == 6 else 3)
    if 6 <= i <= 9:                                                            # speed lines rising off the fist
        for k, dx in enumerate((-3, 0, 3)):
            n = 9 - 2*abs(dx)//2 - (i - 6)
            for y in range(max(0, n)):
                x, yy = round(nh[0]) + dx, round(nh[1]) - 5 - y - k
                if 0 <= yy < N and f.at(x, yy) == '.': f.set(x, yy, 'W' if y < n - 3 else 'E')
    if 3 <= i <= 5:
        for dx in (-9, 9): puff(f, 34 + dx, 61, 2 if i < 5 else 1)             # dust kicked up as he pushes off
    return f, nh, fh
FK_KN = {0: None, 3: (38, 44), 4: (42, 42), 5: (44, 38), 6: (46, 36), 7: (47, 35), 9: (46, 36), 10: (44, 39), 11: (42, 43), 12: None}
FK_LF = {0: (37, GR, 0), 1: (37, GR, 0), 2: (36, GR - 1, 10), 3: (37, GR - 4, 25), 4: (39, 49, 25), 5: (49, 36, -15), 6: (52, 32, -32), 7: (54, 30, -40), 9: (53, 31, -38), 10: (47, 38, -10), 11: (41, 47, 10), 12: (38, GR - 5, 15), 13: (37, GR, 0), 14: (37, GR, 0)}
FK_LB = {0: (30, GR, 0), 1: (30, GR, 0), 2: (31, GR - 2, 15), 3: (30, GR - 5, 30), 4: (30, 53, 40), 6: (31, 51, 45), 9: (31, 51, 45), 11: (30, 54, 30), 12: (31, GR - 4, 20), 13: (30, GR, 0), 14: (30, GR, 0)}
FK_KB = {3: None, 4: (35, 51), 6: (36, 47), 9: (36, 47), 11: (34, 50), 12: None}
FK_LIFT = [0, 0, 6, 16, 28, 38, 44, 46, 46, 42, 34, 24, 12, 4, 0]                  # the flying jump: the game raises the sprite by this many px (the face kick lands on frame 7 at the top, where the launched enemy hangs)
def fk_params(i):
    up = 3 <= i <= 11; kf = kv({a: b for a, b in FK_KN.items() if b}, i) if up and 3 <= i <= 11 else None
    kb = kv({a: b for a, b in FK_KB.items() if b}, i) if 4 <= i <= 11 else None
    return dict(by=round(kv({0: CR, 1: 10, 2: 6, 3: 2, 4: 1, 5: 0, 7: 1, 9: 1, 10: 2, 11: 3, 12: 5, 13: 9, 14: CR}, i)), ln=round(kv({0: 2, 1: 0, 2: 0, 4: -1, 6: -3, 8: -4, 10: -2, 12: 0, 13: 1, 14: 2}, i)), hx=round(kv({0: 0, 2: -1, 6: 2, 9: 2, 11: 1, 13: 0, 14: 0}, i)),
                hs=round(kv({0: 0, 6: -1, 9: -1, 12: 0, 14: 0}, i)), hd=round(kv({0: 0, 1: 2, 3: 0, 14: 0}, i)), lf=tuple(round(v) for v in kv(FK_LF, i)), lb=tuple(round(v) for v in kv(FK_LB, i)), kf=tuple(kf) if kf else None, kb=tuple(kb) if kb else None,
                na=kv({0: ((3, 4), (6, 0)), 1: ((-1, 6), (-2, 10)), 2: ((2, 1), (5, -3)), 4: ((3, -1), (6, -6)), 7: ((-3, 3), (-7, 6)), 10: ((-1, 4), (-3, 7)), 12: ((2, 2), (5, -1)), 13: ((3, 4), (6, 0)), 14: ((3, 4), (6, 0))}, i),
                fa=kv({0: ((1.5, 4.5), (4, 1)), 1: ((0, 5), (-1, 9)), 2: ((1, 2), (4, -2)), 4: ((2, -1), (5, -5)), 7: ((-2, 4), (-6, 7)), 10: ((0, 4), (-2, 7)), 12: ((1.5, 3), (4, 0)), 13: ((1.5, 4.5), (4, 1)), 14: ((1.5, 4.5), (4, 1))}, i), hp=i*.9, hup=1 if 3 <= i <= 10 else 0, hback=1 if 4 <= i <= 10 else 0, mo=4 <= i <= 9, blink=False)
def fkick(i):                                      # FACE KICK: from the crouch he coils (frame 1), springs up (2-3) and chambers the front knee (4), whips the leg out up into the air (5-6) and lands the sole on the launched enemy's face (the impact is frame 7), the whole body leaning back, with a white swoosh behind the foot, a star at the hit and a column of speed lines under him; he holds it (8-9), pulls the leg in (10-11), drops (12) and lands back in his crouch (13-14). The game raises the sprite up to 46 px (FK_LIFT) and the enemy floats about 30 px up when the foot arrives
    f, nh, fh = figure(fk_params(i))
    if 4 <= i <= 9:                                                            # the foot's path (the ankle of the front leg)
        pts = [fk_params(j)['lf'][:2] for j in (max(0, i - 3), max(0, i - 2), max(0, i - 1), i)]; pts = [(x + 1.5, y - 1.5) for x, y in pts]
        if pts[0] != pts[-1]: streak(f, pts, (.8, 1.8, 3.0, 4.4), (0, .3, .7, 1), False)
    if i in (7, 8): burst(f, 57, 28, 4 if i == 7 else 3)
    if 2 <= i <= 6:                                                            # speed lines under him as he shoots up
        for k, dx in enumerate((-4, 0, 4)):
            n = 6 + k % 2*2
            for y in range(n):
                x, yy = 34 + dx, 62 - y - (i - 2)*2
                if 0 <= yy < N and f.at(x, yy) == '.': f.set(x, yy, 'W' if y < n - 3 else 'E')
    if i in (1, 2): puff(f, 28, 61, 2); puff(f, 40, 61, 2)
    return f, nh, fh
# ---------------------------------------------------------------- v1.15 BLACK FLASH (THE ZONE): atk16 = the punch (standing), atk17 = the head kick in the air, atk18 = the body blow from the crouch (15 frames each, the impact is frame 7)
def bolt(f, x, y, ang, length, seed):                 # a jagged lightning bolt: sharp zigzags along the line (2-3 px legs turning 25-55 degrees to one side and the other), a black core with a bright red glow either side (the black-and-red of a BLACK FLASH)
    rnd = random.Random(seed); px, py = float(x), float(y); pts = []; k = 0
    while len(pts) < length:
        a = math.radians(ang + (-1)**k*rnd.uniform(25, 55)); leg_ = rnd.choice((2, 2, 3))
        for _ in range(leg_): px += math.cos(a); py += math.sin(a); pts.append((round(px), round(py)))
        k += 1
    ps = set(pts)
    for qx, qy in pts:
        for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            if (qx+dx, qy+dy) not in ps and f.at(qx+dx, qy+dy) == '.': f.set(qx+dx, qy+dy, 'X')
    for qx, qy in pts:
        if f.at(qx, qy) in '.X': f.set(qx, qy, 'Z')
def bf_ring(f, x, y, r, seed):                       # the shock ring of a BLACK FLASH: a broken ring of black with a red edge on the outside
    rnd = random.Random(seed); gap = rnd.uniform(0, 6.28)
    for k in range(int(r*7)):
        t = 6.2832*k/int(r*7)
        if (t - gap) % 6.2832 < 1.1 or k % 5 == 4: continue
        px, py = round(x + math.cos(t)*r), round(y + math.sin(t)*r*.9)
        if f.at(px, py) == '.': f.set(px, py, 'Z')
        qx, qy = round(x + math.cos(t)*(r + 1.4)), round(y + math.sin(t)*(r + 1.4)*.9)
        if f.at(qx, qy) == '.': f.set(qx, qy, 'X')
def bf_burst(f, x, y, r, n, seed, spread=360, aim=0):            # the flash at the point of impact: a white-hot core, a red ring and n bolts around it
    for dx in range(-r, r + 1):
        for dy in range(-r, r + 1):
            d = math.hypot(dx, dy)
            if d <= r*.5: f.set(x + dx, y + dy, 'W' if d <= r*.28 else 'Y')
            elif d <= r*.85 and (dx + dy) % 2 == 0: f.set(x + dx, y + dy, 'X')
    for k in range(n):
        ang = aim - spread/2 + spread*(k + .5)/n + random.Random(seed*31 + k).uniform(-14, 14)
        bolt(f, x + math.cos(math.radians(ang))*r*.7, y + math.sin(math.radians(ang))*r*.7, ang, 5 + (k*7 + seed) % 9 + r, seed*17 + k)
def charge(f, x, y, t, seed):                      # cursed energy gathering: red and black specks spiralling in on the fist (t 0..1: far..near)
    for k in range(9):
        a = math.radians(k*40 + seed*23 + t*160); rad = 2 + (1 - t)*11 + (k % 3)
        px, py = round(x + math.cos(a)*rad), round(y + math.sin(a)*rad*.8)
        if f.at(px, py) == '.': f.set(px, py, 'X' if k % 2 else 'Z')
        if k % 3 == 0 and f.at(px + 1, py) == '.': f.set(px + 1, py, 'z')
def rstreak(f, pts, ws):                           # a red ribbon along the points (tail first): the path the fist or foot has just taken (only on empty pixels)
    xs = [p[0] for p in pts]; ys = [p[1] for p in pts]; pad = max(ws)/2 + 1
    for y in range(max(0, int(min(ys) - pad)), min(N, int(max(ys) + pad) + 2)):
        for x in range(max(0, int(min(xs) - pad)), min(N, int(max(xs) + pad) + 2)):
            best = None
            for j in range(len(pts) - 1):
                (x0, y0), (x1, y1) = pts[j], pts[j+1]; dx, dy = x1 - x0, y1 - y0; l2 = dx*dx + dy*dy or 1; u = max(0.0, min(1.0, ((x - x0)*dx + (y - y0)*dy)/l2)); d = math.hypot(x - (x0 + u*dx), y - (y0 + u*dy))
                if best is None or d < best[0]: best = (d, ws[j] + (ws[j+1] - ws[j])*u, j + u)
            d, w, t = best
            if d <= w/2 and f.at(x, y) == '.': f.set(x, y, 'Y' if d <= w*.2 else ('X' if t > .8 else 'z'))
def lines_r(f, x, y, n, length, i):                # red speed lines streaming back from the hit
    for k in range(n):
        yy = y - n*2 + k*4 + (i % 2); xx = x - 3 - (k % 2)*2
        for q in range(length - (k % 3)*2):
            if f.at(xx - q, yy) == '.': f.set(xx - q, yy, 'X' if q < length - 3 else 'z')
def bfp_params(i):                                 # the standing punch: he sinks and coils with the fist drawn right back (1-5), steps in and drives it out arm fully stretched (7), holds it, comes back
    return dict(by=round(kv({0: 0, 2: 2, 5: 3, 7: -1, 10: -1, 14: 0}, i)), ln=round(kv({0: 0, 3: -2, 5: -3, 6: 2, 7: 5, 10: 4, 12: 2, 14: 0}, i)), hx=round(kv({0: 0, 4: -1, 5: -2, 7: 4, 10: 3, 14: 0}, i)), hs=round(kv({0: 0, 7: 1, 14: 0}, i)),
                lf=(round(kv({0: 34, 4: 33, 6: 38, 7: 42, 11: 40, 14: 34}, i)), GR, 0), lb=(round(kv({0: 31, 4: 28, 7: 25, 11: 28, 14: 31}, i)), GR, 0),
                na=kv({0: GUARD_N, 1: ((-1.5, 5.5), (-2.5, 8)), 4: ((-5, 6), (-8, 8.5)), 5: ((-5, 5.5), (-8, 8)), 6: ((3, 1.5), (10, 0)), 7: ((8, .5), (17, -1.5)), 9: ((8, .5), (17, -1.5)), 10: ((7, 1), (14, -.5)), 12: GUARD_N, 14: IDLE_N}, i),
                fa=kv({0: GUARD_F, 4: ((3.5, 4), (7, 1)), 6: ((2.5, 4.5), (5.5, 3)), 9: ((3, 4), (6, 1.5)), 12: GUARD_F, 14: IDLE_F}, i), hp=i*.8, hback=0, mo=5 <= i <= 9, blink=False)
def bf_punch(i):
    f, nh, fh = figure(bfp_params(i)); hx, hy = round(nh[0]), round(nh[1])
    if 2 <= i <= 6: charge(f, hx, hy, (i - 2)/4, i)
    if 3 <= i <= 6:
        for k in range(3): bolt(f, hx, hy, (k*120 + i*40) % 360, 4 + i % 3, i*9 + k)
    if 5 <= i <= 10:
        pts = [figure(bfp_params(j))[1] for j in (max(0, i - 3), max(0, i - 2), max(0, i - 1), i)]
        if pts[0] != pts[-1]: rstreak(f, pts, (.8, 1.8, 3.2, 4.6))
    if i == 7: bf_burst(f, hx - 1, hy, 5, 9, 7, 300, 180)
    if i == 8: bf_burst(f, hx - 1, hy, 4, 7, 8, 280, 180)
    if i in (9, 10): bf_burst(f, hx - 1, hy, 2, 5, i, 240, 180)
    if 7 <= i <= 10: lines_r(f, hx - 4, hy, 3, 9 - (i - 7)*2, i)
    if 5 <= i <= 7: puff(f, 34 - 9, 61, 2); puff(f, 34 + 9, 61, 1)
    return f, nh, fh
BFK_LIFT = [0, 6, 16, 22, 26, 28, 28, 28, 26, 22, 17, 12, 7, 2, 0]                   # the hop of the head kick (the game starts it on frame 2, where his jump has taken him)
BK_KN = {3: (40, 44), 4: (44, 40), 5: (47, 41), 6: (48, 42), 7: (48, 42), 9: (48, 42), 10: (45, 43), 11: (42, 46)}
BK_LF = {0: (36, 50, 20), 2: (38, 50, 20), 4: (41, 46, 25), 5: (49, 42, 0), 6: (54, 41, -30), 7: (57, 40, -60), 9: (56, 40, -55), 10: (48, 44, -10), 11: (42, 49, 10), 12: (39, 54, 15), 13: (37, GR, 0), 14: (34, GR, 0)}
BK_LB = {0: (31, 52, 40), 3: (30, 53, 40), 6: (31, 52, 45), 9: (31, 52, 45), 11: (30, 54, 30), 12: (31, 56, 20), 13: (31, GR, 0), 14: (31, GR, 0)}
BK_KB = {4: (34, 49), 6: (35, 47), 9: (35, 47), 11: (34, 50)}
def bfk_params(i):
    kf = kv(BK_KN, i) if 3 <= i <= 11 else None; kb = kv(BK_KB, i) if 4 <= i <= 11 else None
    return dict(by=round(kv({0: 0, 2: -1, 4: -2, 7: 0, 10: 1, 12: 2, 14: 0}, i)), ln=round(kv({0: 0, 2: 0, 4: -1, 6: -3, 8: -4, 10: -2, 12: 0, 14: 0}, i)), hx=round(kv({0: 0, 2: -1, 6: 2, 9: 2, 11: 1, 13: 0, 14: 0}, i)),
                hs=round(kv({0: 0, 6: -1, 9: -1, 12: 0, 14: 0}, i)), lf=tuple(round(v) for v in kv(BK_LF, i)), lb=tuple(round(v) for v in kv(BK_LB, i)), kf=tuple(kf) if kf else None, kb=tuple(kb) if kb else None,
                na=kv({0: ((3, 4), (6, 0)), 2: ((2, 1), (5, -3)), 4: ((3, -1), (6, -6)), 7: ((-3, 3), (-7, 6)), 10: ((-1, 4), (-3, 7)), 12: ((2, 2), (5, -1)), 13: ((3, 4), (6, 0)), 14: IDLE_N}, i),
                fa=kv({0: ((1.5, 4.5), (4, 1)), 2: ((1, 2), (4, -2)), 4: ((2, -1), (5, -5)), 7: ((-2, 4), (-6, 7)), 10: ((0, 4), (-2, 7)), 12: ((1.5, 3), (4, 0)), 13: ((1.5, 4.5), (4, 1)), 14: IDLE_F}, i),
                hp=i*.9, hup=1 if 3 <= i <= 10 else 0, hback=1 if 4 <= i <= 10 else 0, mo=4 <= i <= 9, blink=False)
def bf_kick(i):
    f, nh, fh = figure(bfk_params(i)); foot = bfk_params(i)['lf']; fx, fy = foot[0] + 1, foot[1] - 1; nh = (fx, fy)       # (the "near hand" of this move is the foot: the game puts its crackling sparks there)
    if 2 <= i <= 6: charge(f, fx, fy, (i - 2)/4, i)
    if 5 <= i <= 6:
        for k in range(3): bolt(f, fx, fy, (k*120 + i*40) % 360, 4 + i % 3, i*9 + k)
    if 4 <= i <= 9:
        pts = [(x + 1.5, y - 1.5) for x, y in [bfk_params(j)['lf'][:2] for j in (max(0, i - 3), max(0, i - 2), max(0, i - 1), i)]]
        if pts[0] != pts[-1]: rstreak(f, pts, (.8, 1.8, 3.2, 4.6))
    if i == 7: bf_burst(f, min(58, fx - 1), fy, 5, 9, 7, 300, 180)
    if i == 8: bf_burst(f, min(58, fx - 1), fy, 4, 7, 8, 280, 180)
    if i in (9, 10): bf_burst(f, min(58, fx - 1), fy, 2, 5, i, 240, 180)
    if 7 <= i <= 10: lines_r(f, fx - 6, fy, 3, 8 - (i - 7)*2, i)
    return f, nh, fh
def bfg_params(i):                                 # the body blow: from the crouch he coils with the fist low behind his hip (1-5), drives forward out of the crouch and the fist into the stomach (7), holds, settles back into the crouch
    return dict(by=round(kv({0: CR, 2: CR + 2, 4: CR + 3, 6: CR + 1, 7: CR, 12: CR, 14: CR}, i)), ln=round(kv({0: 2, 3: 0, 5: -2, 6: 3, 7: 6, 10: 5, 13: 3, 14: 2}, i)), hx=round(kv({0: 0, 4: -1, 7: 3, 10: 2, 14: 0}, i)), hd=round(kv({0: 0, 4: 1, 7: 0, 14: 0}, i)),
                lf=(round(kv({0: 37, 4: 36, 6: 40, 7: 44, 11: 42, 14: 37}, i)), GR, 0), lb=(round(kv({0: 30, 4: 27, 7: 24, 11: 27, 14: 30}, i)), GR, 0),
                na=kv({0: GUARD_N, 2: ((-1, 5), (-2.5, 8.5)), 4: ((-4, 5.5), (-6.5, 8)), 5: ((-4, 5), (-6.5, 7.5)), 6: ((3, 2), (9, 2.5)), 7: ((7.5, 1), (15.5, -.5)), 9: ((7.5, 1), (15.5, -.5)), 10: ((6.5, 1.5), (13, .5)), 12: GUARD_N, 14: GUARD_N}, i),
                fa=kv({0: GUARD_F, 4: ((3, 4.5), (6, 1.5)), 7: ((2.5, 5), (5.5, 3.5)), 14: GUARD_F}, i), hp=i*1.1, hback=0, mo=5 <= i <= 9, blink=False)
def bf_gut(i):
    f, nh, fh = figure(bfg_params(i)); hx, hy = round(nh[0]), round(nh[1])
    if 2 <= i <= 6: charge(f, hx, hy, (i - 2)/4, i)
    if 3 <= i <= 6:
        for k in range(3): bolt(f, hx, hy, (k*120 + i*40) % 360, 4 + i % 3, i*9 + k)
    if 5 <= i <= 10:
        pts = [figure(bfg_params(j))[1] for j in (max(0, i - 3), max(0, i - 2), max(0, i - 1), i)]
        if pts[0] != pts[-1]: rstreak(f, pts, (.8, 1.8, 3.2, 4.6))
    if i == 7: bf_burst(f, hx - 1, hy, 5, 9, 7, 300, 180)
    if i == 8: bf_burst(f, hx - 1, hy, 4, 7, 8, 280, 180)
    if i in (9, 10): bf_burst(f, hx - 1, hy, 2, 5, i, 240, 180)
    if 7 <= i <= 10: lines_r(f, hx - 4, hy, 3, 9 - (i - 7)*2, i)
    if 5 <= i <= 7: puff(f, 34 - 9, 61, 2); puff(f, 34 + 9, 61, 1)
    return f, nh, fh
# ---------------------------------------------------------------- v1.47 YUJI'S CROUCH -> JUMP and JUMP -> CROUCH (15 pictures each, with the standing JUMP above: 45 new pictures)
CJUK = {0: (7, 2, (37, GR, 0), (30, GR, 0), GUARD_N, GUARD_F), 2: (10, 4, (38, GR, 0), (29, GR, 0), ((-3, 5), (-6, 8)), ((-3, 5), (-5, 8))), 3: (8, 3, (37, GR, 0), (30, GR, 0), ((-1, 4), (-2, 8)), ((-2, 5), (-3, 8))),
        5: (2, 1, (36, GR, 10), (31, GR, 5), ((4, -1), (6, -6)), ((3, 0), (5, -4))), 6: (0, 0, (36, GR-1, 30), (31, GR, 20), ((4, -3), (6, -10)), ((3, -2), (5, -8))), 8: (-2, 0, (36, GR-3, 45), (32, GR-2, 35), ((4, -4), (5, -12)), ((3, -3), (5, -10))),
        14: JUMPK[4]}
def cju(i):                                        # CROUCH -> JUMP, the spring (the game plays it in 250 ms: the 160 ms of the push-off and the first 90 ms of the rise): from the crouch (0) he dips lower and swings his arms back (1-2), drives up (3-6: the legs straighten, the arms swing up), rises onto his toes (7-8) and the feet leave the floor (9-13: the legs trail, the arms stay high); picture 14 is picture 4 of the jump (the first one in the air), so the flight goes on from it
    return figure(jpar(CJUK, i, 1 if i >= 7 else 0, 1 if i >= 9 else 0))
JCRK = {0: JUMPK[12], 2: (6, 3, (37, GR, 0), (29, GR, 0), ((3, 4), (6, 0)), GUARD_F), 4: (10, 4, (38, GR, 0), (29, GR, 0), ((2, 5), (4, 1)), ((1, 5), (3, 2))), 7: (8, 3, (37, GR, 0), (30, GR, 0), GUARD_N, GUARD_F), 14: (7, 2, (37, GR, 0), (30, GR, 0), GUARD_N, GUARD_F)}
def jcr(i):                                        # JUMP -> CROUCH, the crouch landing (CROUCH pressed in the air; the game plays it in 250 ms from the touch-down): picture 0 is picture 12 of the jump (touch-down), the knees buckle deeper than the crouch (1-4), come back up (5-8) and he settles into the crouch (9-14: the picture the crouch has when it is held)
    return figure(jpar(JCRK, i, 0, 0))
# ---------------------------------------------------------------- v1.48 YUJI'S CROUCH PUNCHES (the skill CROUCH PUNCHES: ATTACK while he is crouched): 1 the R.JAB (strip 30), 2 the L.UPPR, a left uppercut (strip 31): 15 pictures each, from the crouch guard and back into it (the same pose as the crouch the game shows); the impact is picture 6 of the jab and 7 of the uppercut, as for Gojo's
CJABK = {0: (7, 2, (37, GR, 0), (30, GR, 0), GUARD_N, GUARD_F), 2: (8, 1, (37, GR, 0), (30, GR, 0), ((1, 3), (-1, 1)), ((2, 4), (5, 1))), 4: (8, 0, (37, GR, 0), (29, GR, 0), ((-1, 4), (-4, 3)), ((2, 4), (5, 1))), 5: (7, 3, (38, GR, 0), (29, GR, 0), ((4, 3), (8, 2)), ((2, 4), (5, 1))),
         6: (7, 6, (39, GR, 0), (29, GR, 0), ((7, 2), (13, 1)), ((2, 4), (5, 1))), 9: (7, 6, (39, GR, 0), (29, GR, 0), ((7, 2), (13, 1)), ((2, 4), (5, 1))), 11: (7, 3, (38, GR, 0), (30, GR, 0), ((5, 3), (9, 2)), GUARD_F), 14: (7, 2, (37, GR, 0), (30, GR, 0), GUARD_N, GUARD_F)}
CUPRK = {0: (7, 2, (37, GR, 0), (30, GR, 0), GUARD_N, GUARD_F), 2: (9, 2, (38, GR, 0), (29, GR, 0), GUARD_N, ((-1, 7), (-2, 11))), 4: (10, 1, (38, GR, 0), (29, GR, 0), GUARD_N, ((-2, 8), (-3, 12))), 6: (7, 4, (39, GR, 0), (29, GR, 0), GUARD_N, ((4, 5), (8, 4))),
         7: (5, 6, (39, GR, 0), (29, GR, 0), GUARD_N, ((7, 0), (12, -7))), 9: (5, 6, (39, GR, 0), (29, GR, 0), GUARD_N, ((6, 0), (11, -8))), 11: (6, 4, (38, GR, 0), (30, GR, 0), GUARD_N, ((4, 3), (7, -2))), 14: (7, 2, (37, GR, 0), (30, GR, 0), GUARD_N, GUARD_F)}
def cjab(i):                                       # R.JAB: from the crouch guard the near fist is drawn back to the chin (1-4), then drives straight out at chest height with the body leaning into it and the front foot stepping in (the impact is picture 6), is held (7-9) and comes back (10-14)
    return figure(jpar(CJABK, i, 0, 0))
def cupr(i):                                       # L.UPPR: he sinks lower with the far fist dropped behind his hip (1-4), then rises out of the crouch and the far fist swings up from low to the chin (the impact is picture 7), is held (8-9) and comes back (10-14)
    return figure(jpar(CUPRK, i, 1 if 6 <= i <= 9 else 0, 0))
# ---------------------------------------------------------------- v1.46 THE ULTIMATE (the DOMAIN button, tools/template.html YUT): four BLACK FLASHES in a row. 1 = this LEAP (atk28), 2 = the BLACK FLASH KICK (atk17, he is already up in the air), 3 = this HAND SLASH (atk29), 4 = the CHARGED BLACK FLASH (atk19). The game lifts the picture and the enemy (the heights are in YUT.lift), the legs are drawn tucked here.
def bfgj_params(i):                                # the body blow as a LEAP: the same coil (1-5) and the same blow into the stomach (7), but he drives UP out of the crouch: the body straightens and both legs tuck under him (8-11) while the game lifts the picture, the fist stays high, then the legs reach down (14)
    P = bfg_params(i); u = kv({6: 0, 9: 1, 12: 1, 14: .3}, i)
    P['by'] = round(kv({0: CR, 2: CR + 2, 4: CR + 3, 6: CR + 1, 7: CR - 1, 9: -1, 12: -1, 14: 0}, i))
    P['lf'] = (P['lf'][0] - round(4*u), GR - round(11*u), 0); P['lb'] = (P['lb'][0] + round(1*u), GR - round(9*u), 0)
    return P
def bf_gutj(i):
    f, nh, fh = figure(bfgj_params(i)); hx, hy = round(nh[0]), round(nh[1])
    if 2 <= i <= 6: charge(f, hx, hy, (i - 2)/4, i)
    if 3 <= i <= 6:
        for k in range(3): bolt(f, hx, hy, (k*120 + i*40) % 360, 4 + i % 3, i*9 + k)
    if 5 <= i <= 10:
        pts = [figure(bfgj_params(j))[1] for j in (max(0, i - 3), max(0, i - 2), max(0, i - 1), i)]
        if pts[0] != pts[-1]: rstreak(f, pts, (.8, 1.8, 3.2, 4.6))
    if i == 7: bf_burst(f, hx - 1, hy, 5, 9, 7, 300, 180)
    if i == 8: bf_burst(f, hx - 1, hy, 4, 7, 8, 280, 180)
    if i in (9, 10): bf_burst(f, hx - 1, hy, 2, 5, i, 240, 180)
    if 7 <= i <= 10: lines_r(f, hx - 4, hy, 3, 9 - (i - 7)*2, i)
    if 5 <= i <= 7: puff(f, 34 - 9, 61, 2); puff(f, 34 + 9, 61, 1)
    return f, nh, fh
def bfs_params(i):                                 # the HAND SLASH: a crouch and a leap (1-4) with the near hand lifted straight up over his head (2-5), held at the top (5) with the energy gathering in it, then the hand comes down in one diagonal chop in front of him, edge first, arm stretched (the impact is frame 7); he hangs there (8-10), the legs reach down (11) and he lands in a crouch and comes back up (14)
    return dict(by=round(kv({0: 0, 1: 3, 2: 4, 3: 1, 5: -1, 7: 0, 9: 2, 11: 4, 12: 5, 13: 2, 14: 0}, i)), ln=round(kv({0: 0, 2: -2, 4: -3, 6: 1, 7: 5, 10: 5, 12: 2, 14: 0}, i)), hx=round(kv({0: 0, 4: -1, 7: 2, 12: 1, 14: 0}, i)), hd=round(kv({0: 0, 6: 0, 7: 1, 10: 1, 14: 0}, i)),
                lf=(round(kv({0: 34, 2: 33, 3: 36, 7: 38, 10: 38, 11: 39, 12: 37, 14: 34}, i)), GR - round(kv({0: 0, 2: 0, 3: 4, 4: 9, 5: 11, 8: 11, 9: 8, 10: 4, 11: 0, 14: 0}, i)), 0),
                lb=(round(kv({0: 31, 4: 28, 7: 27, 10: 30, 12: 31, 14: 31}, i)), GR - round(kv({0: 0, 2: 0, 3: 5, 4: 10, 5: 12, 8: 12, 9: 9, 10: 4, 11: 0, 14: 0}, i)), 0),
                na=kv({0: GUARD_N, 2: ((2, 0), (3, -3)), 4: ((1, -5.5), (2, -12.5)), 5: ((.5, -6.5), (0, -14)), 6: ((6, -5), (11, -9)), 7: ((9, -.5), (17, 6)), 8: ((9, 1), (16.5, 8)), 10: ((7, 2.5), (13, 9)), 12: ((4, 4), (7, 3)), 14: IDLE_N}, i),
                fa=kv({0: GUARD_F, 3: ((-2, 2), (-5, -1)), 5: ((-3, 3), (-7, 1)), 7: ((-4, 3), (-8, 5)), 10: ((-2, 3.5), (-5, 5)), 12: GUARD_F, 14: IDLE_F}, i),
                hp=i*1.1, hup=1 if 3 <= i <= 6 else 0, hback=1 if 4 <= i <= 9 else 0, mo=6 <= i <= 9, blink=False)
def bf_slash(i):
    f, nh, fh = figure(bfs_params(i)); hx, hy = round(nh[0]), round(nh[1])
    if 1 <= i <= 5: charge(f, hx, hy, (i - 1)/4, i)
    if 3 <= i <= 6:
        for k in range(3): bolt(f, hx, hy, (k*120 + i*40) % 360, 4 + i % 3, i*9 + k)
    if 5 <= i <= 11:
        pts = [figure(bfs_params(j))[1] for j in range(max(4, i - 5), i + 1)]
        if len(pts) >= 2 and pts[0] != pts[-1]: rstreak(f, pts, [.8, 1.4, 2.2, 3.0, 4.0, 5.0][-len(pts):])
    if i == 7: bf_burst(f, hx - 1, hy, 5, 9, 7, 300, 200)
    if i == 8: bf_burst(f, hx - 1, hy, 4, 7, 8, 280, 200)
    if i in (9, 10): bf_burst(f, hx - 1, hy, 2, 5, i, 240, 200)
    if 7 <= i <= 10: lines_r(f, hx - 4, hy, 3, 9 - (i - 7)*2, i)
    if 2 <= i <= 3 or 11 <= i <= 13: puff(f, 34 - 9, 61, 2); puff(f, 34 + 9, 61, 1)
    return f, nh, fh
# ---------------------------------------------------------------- v1.49 YUJI'S FATALITY: the three pictures only the 30-second cutscene uses (keys fx_charge, fx_pose, fx_dive): the CHARGE (a loop: a low wide stance, the near fist drawn back with cursed energy streaming into it, the other hand pointing at the enemy), the POSE after the last blow (the arm comes down, steam off the fist, he stands up and looks ahead) and the DIVE KICK (a spring, both feet driven out in the air, the blow with a Black Flash at the feet, a crouch landing)
def charge2(f, x, y, i):                            # cursed energy streaming into the fist without a break: three rings of specks, each a third of a turn behind the last, drawn in towards the fist
    for L in range(3):
        t = ((i + 5*L) % 15)/15
        for q in range(5):
            a = math.radians(q*72 + L*40 + t*120); rad = 1.5 + (1 - t)*(10 + 3*L)
            px, py = round(x + math.cos(a)*rad), round(y + math.sin(a)*rad*.8)
            if f.at(px, py) == '.': f.set(px, py, 'X' if (q + L) % 2 else 'Z')
            if q % 2 == 0 and f.at(px + 1, py) == '.': f.set(px + 1, py, 'z')
def fc_params(i):
    br = 1 if i in (3, 4, 5, 10, 11, 12) else 0
    return dict(by=4 + br, ln=3, hx=-2, hs=2, hd=2, lf=(40, GR, 0), lb=(23, GR, 0), na=((-6, 7 + br*.5), (-10, 10 + br*.5)), fa=((4, 3 + br*.4), (9, 0.5 + br*.6)), hp=i*.9, hback=0, blink=False)
def f_charge(i):
    f, nh, fh = figure(fc_params(i)); hx, hy = round(nh[0]), round(nh[1]); charge2(f, hx, hy, i)
    r = 2.3 + 0.5*math.sin(i/15*6.2832)                                          # the ball of cursed energy in the fist: black with a red rim, a little bigger and smaller as it pulses
    for dx in range(-5, 6):
        for dy in range(-5, 6):
            d = math.hypot(dx, dy)
            if d <= r and f.at(hx + dx, hy + dy) in ('.', 'S', 'U', 'T', 'V'): f.set(hx + dx, hy + dy, 'Z')
            elif d <= r + 1.2 and f.at(hx + dx, hy + dy) == '.': f.set(hx + dx, hy + dy, 'X' if (dx + dy + i) % 3 else 'z')
    for k in range(2): bolt(f, hx, hy, (k*160 + i*47) % 360, 3 + (i + k) % 4, i*5 + k)
    for k in range(3):                                                         # embers climbing off his back
        px, py = 27 + k*3 + (i*2 + k*5) % 3, 40 - ((i*2 + k*4) % 14)
        if f.at(px, py) == '.': f.set(px, py, 'X' if k % 2 else 'z')
    return f, nh, fh
def fp_params(i):
    return dict(by=round(kv({0: 1, 3: 2, 8: 1, 14: 0}, i)), ln=round(kv({0: 3, 5: 2, 9: 0, 14: 0}, i)), hx=round(kv({0: 1, 8: 0, 14: 0}, i)), hs=0, hd=round(kv({0: 1, 5: 1, 10: 0, 14: 0}, i)),
                lf=(round(kv({0: 40, 8: 37, 14: 35}, i)), GR, 0), lb=(round(kv({0: 27, 8: 29, 14: 31}, i)), GR, 0),
                na=kv({0: ((7, 1), (13, 2)), 3: ((5, 3), (9, 6)), 6: ((3, 5), (5, 9)), 8: ((2, 6), (3, 10)), 10: ((1, 6.5), (3, 10.5)), 12: IDLE_N, 14: IDLE_N}, i),
                fa=kv({0: ((3, 4), (6, 1.5)), 6: ((1, 5), (2, 9)), 12: IDLE_F, 14: IDLE_F}, i), hp=i*.9, hup=1 if i >= 8 else 0, hback=0, mo=3 <= i <= 6, blink=(i == 11))
def f_pose(i):
    f, nh, fh = figure(fp_params(i)); nx, ny = round(nh[0]), round(nh[1])
    if i <= 11:
        for k in range(1, 6):                                                  # steam off the fist
            px, py = round(nx + math.sin(i*.8 + k*1.3)*1.4), ny - 2*k - (i % 3)
            if f.at(px, py) == '.': f.set(px, py, 'W' if k < 3 else 'E')
    if i <= 3:
        for k in range(3): bolt(f, nx, ny, (k*130 + i*50) % 360, 3 + k, i*7 + k)
    return f, nh, fh
DV_LF = {0: (34, GR, 0), 2: (36, GR, 0), 3: (37, 53, 15), 4: (41, 47, 10), 5: (49, 44, -25), 6: (56, 41, -65), 7: (58, 40, -75), 9: (57, 41, -70), 10: (50, 44, -35), 11: (42, 49, -5), 12: (38, 54, 10), 13: (36, GR, 0), 14: (34, GR, 0)}
DV_LB = {0: (31, GR, 0), 2: (29, GR, 0), 3: (32, 54, 25), 4: (35, 49, 25), 5: (42, 46, -10), 6: (51, 43, -55), 7: (54, 42, -65), 9: (53, 43, -60), 10: (45, 46, -25), 11: (38, 51, 5), 12: (33, 55, 15), 13: (31, GR, 0), 14: (31, GR, 0)}
DV_KF = {4: (45, 43), 5: (51, 41), 6: (53, 40), 7: (54, 40), 9: (54, 40), 10: (48, 43)}
DV_KB = {4: (38, 45), 5: (45, 43), 6: (48, 42), 7: (50, 42), 9: (50, 42), 10: (43, 45)}
DV_LIFT = [0, 0, 0, 6, 16, 24, 28, 28, 28, 26, 20, 12, 5, 0, 0]
def dv_params(i):
    kf = kv(DV_KF, i) if 4 <= i <= 10 else None; kb = kv(DV_KB, i) if 4 <= i <= 10 else None
    return dict(by=round(kv({0: 0, 2: 3, 3: -2, 5: -2, 7: 0, 10: 1, 12: 2, 13: 4, 14: 0}, i)), ln=round(kv({0: 0, 2: 1, 4: 1, 6: -4, 8: -5, 10: -2, 12: 0, 13: 2, 14: 0}, i)), hx=round(kv({0: 0, 4: -1, 6: 3, 9: 3, 12: 1, 14: 0}, i)), hs=round(kv({0: 0, 6: -1, 9: -1, 12: 0, 14: 0}, i)),
                lf=tuple(round(v) for v in kv(DV_LF, i)), lb=tuple(round(v) for v in kv(DV_LB, i)), kf=tuple(kf) if kf else None, kb=tuple(kb) if kb else None,
                na=kv({0: GUARD_N, 2: ((-2, 3), (-4, 6)), 4: ((3, -2), (6, -5)), 6: ((-4, 2), (-9, 4)), 8: ((-4, 3), (-8, 6)), 11: ((1, 3), (3, 5)), 13: GUARD_N, 14: IDLE_N}, i),
                fa=kv({0: GUARD_F, 2: ((-1, 3), (-3, 6)), 4: ((2, -2), (5, -5)), 6: ((-3, 2), (-8, 5)), 8: ((-3, 3), (-7, 6)), 11: ((1, 3), (3, 5)), 13: GUARD_F, 14: IDLE_F}, i),
                hp=i*.9, hup=1 if 3 <= i <= 10 else 0, hback=1 if 5 <= i <= 10 else 0, mo=5 <= i <= 9, blink=False)
def f_dive(i):
    P = dv_params(i); f, nh, fh = figure(P); fx, fy = P['lf'][0] + 1, P['lf'][1] - 1; nh = (fx, fy)
    if 2 <= i <= 6: charge(f, fx, fy, (i - 2)/4, i)
    if 5 <= i <= 6:
        for k in range(3): bolt(f, fx, fy, (k*120 + i*40) % 360, 4 + i % 3, i*9 + k)
    if 4 <= i <= 9:
        pts = [(x + 1.5, y - 1.5) for x, y in [dv_params(j)['lf'][:2] for j in (max(0, i - 3), max(0, i - 2), max(0, i - 1), i)]]
        if pts[0] != pts[-1]: rstreak(f, pts, (.8, 1.8, 3.2, 4.6))
    if i == 7: bf_burst(f, min(59, fx - 1), fy, 5, 9, 7, 300, 180)
    if i == 8: bf_burst(f, min(59, fx - 1), fy, 4, 7, 8, 280, 180)
    if i in (9, 10): bf_burst(f, min(59, fx - 1), fy, 2, 5, i, 240, 180)
    if 7 <= i <= 10: lines_r(f, fx - 6, fy, 3, 8 - (i - 7)*2, i)
    return f, nh, fh
FATAL = (('fx_charge', f_charge, 16, 48), ('fx_pose', f_pose, 16, 48), ('fx_dive', f_dive, 16, 48))
ATTACKS = (('atk0', lambda i: hook(i, False)), ('atk1', lambda i: hook(i, True)), ('atk2', knee), ('atk3', kick3), ('atk4', divergent), ('atk5', rkick, 16, 48), ('atk6', elbow), ('atk7', downslam), ('atk8', pushkick), ('atk9', conc), ('atk10', sweep, 12, 52), ('atk11', powerup), ('atk12', rush, 16, 48), ('atk13', uppercut, 16, 48), ('atk14', fkick, 16, 48), ('atk16', bf_punch, 16, 48), ('atk17', bf_kick, 16, 48), ('atk18', bf_gut, 16, 48), ('atk28', bf_gutj, 16, 48), ('atk29', bf_slash, 16, 48), ('atk30', cjab, 16, 48), ('atk31', cupr, 16, 48))
# ---------------------------------------------------------------- crouch, crouch walk, crouch jump and the four dashes (15 frames each)
CR = 7                                                                          # how far the hips drop in a crouch (the leg IK folds the knees by itself)
def cdn(i):                                                                     # standing -> crouched (standing up plays it backwards)
    P = dict(by=round(kv({0: 0, 4: 2, 9: 6, 14: CR}, i)), ln=round(kv({0: 0, 14: 2}, i)), lf=(round(kv({0: 34, 14: 37}, i)), GR, 0), lb=(round(kv({0: 31, 14: 30}, i)), GR, 0),
             na=kv({0: IDLE_N, 5: GUARD_N, 14: GUARD_N}, i), fa=kv({0: IDLE_F, 5: GUARD_F, 14: GUARD_F}, i), hp=i*.8, blink=False)
    return figure(P)
def cidle(i):                                                                   # crouched, guard up, breathing
    ph = 2*math.pi*i/15; bob = round(.7*math.sin(ph + .5))
    P = dict(by=CR + round(.6*math.sin(ph - 1.2)), ln=2 + round(.6*math.sin(ph + 1)), lf=(37, GR, 0), lb=(30, GR, 0), na=((3, 4+bob), (6, bob)), fa=((1.5, 4.5-bob), (4, 1-bob)), hp=i*1.1, blink=i in (9, 10), hup=1 if i in (2, 3, 4) else 0)
    return figure(P)
def cwalk(i):                                                                   # crouch-walking forward: small shuffling steps, guard up (the game plays it backwards for walking back)
    ph = i/15; S = 3.0; L = 2.2; sw = round(math.sin(2*math.pi*ph))
    def foot(p, base):
        p %= 1.0; return (base + S*math.cos(2*math.pi*p), GR - L*max(0.0, -math.sin(2*math.pi*p)), 0)
    P = dict(by=CR - 1 + round(.5 + .5*math.cos(4*math.pi*ph)), ln=2, lf=foot(ph, 37), lb=foot(ph + .5, 30), na=((3, 4+sw), (6, sw)), fa=((1.5, 4.5-sw), (4, 1-sw)), hp=ph*4*math.pi, hback=0, blink=False)
    return figure(P)
CJ_LIFT = [0, 0, 0, 0, 12, 21, 27, 30, 30, 27, 21, 12, 0, 0, 0]                 # a crouch jump springs higher than the normal one (the same curve as Gojo's)
def cjump(i):                                                                   # deep crouch, spring, knees tucked, reach for the ground, land
    T = {0: (7, 2, (37, GR), (30, GR), 0, ((3, 4), (6, 0))), 1: (9, 3, (37, GR), (30, GR), 0, ((-2, 5), (-4, 9))), 2: (10, 3, (37, GR), (30, GR), 0, ((-3, 5), (-5, 9))), 3: (8, 2, (36, GR), (31, GR), 0, ((-1, 4), (-2, 8))),
         4: (-3, 0, (35, GR), (32, GR), 38, ((4, -2), (6, -8))), 5: (-2, 0, (38, GR-5), (32, GR-4), 20, ((4, -2), (6, -8))), 6: (-2, 0, (39, GR-8), (33, GR-7), 10, ((4, -1), (6, -7))), 7: (-2, 0, (40, GR-10), (34, GR-9), 0, ((3, 0), (5, -6))),
         8: (-2, 0, (40, GR-10), (33, GR-8), 0, ((3, 0), (5, -6))), 9: (-2, 0, (39, GR-8), (33, GR-6), 0, ((3, 1), (5, -4))), 10: (-1, 0, (38, GR-5), (32, GR-4), 10, ((3, 2), (5, -2))), 11: (-1, 0, (37, GR-1), (31, GR-1), 25, ((2, 3), (4, 0))),
         12: (3, 1, (36, GR), (30, GR), 0, ((3, 4), (6, 0))), 13: (8, 2, (37, GR), (29, GR), 0, ((3, 4), (6, 0))), 14: (5, 2, (37, GR), (30, GR), 0, ((3, 4), (6, 0)))}
    by, ln, lf, lb, ph, nar = T[i]
    return figure(dict(by=by, ln=ln, lf=lf + (ph,), lb=lb + (ph*.6,), na=nar, fa=(((nar[0][0]-1.5, nar[0][1]+.5), (nar[1][0]-2, nar[1][1]+1))), hp=i*.9, hup=1 if 4 <= i <= 10 else 0, hback=1 if 4 <= i <= 9 else 0, blink=False))
def streaks(f, ahead, i):                                                       # speed lines trailing the body (behind him in a forward dash, in front in a backward one)
    if not 3 <= i <= 11: return
    for k in range(4):
        y = 30 + k*6 + (i + k) % 3; n = 5 + (i*2 + k*3) % 6; x1 = 47 + (k % 2)*3 if ahead else 28 - (k % 2)*3; c = 'W' if (k + i) % 2 else 'E'
        for x in range(n): f.set(x1 + x if ahead else x1 - x, y, c if x < n - 2 else 'D')
def dash(i, k):                                                                 # k: 0 forward, 1 back, 2 crouched forward, 3 crouched back; frames 2-11 are the burst (the game moves him then)
    cr = k >= 2; fwd = k % 2 == 0; B = CR if cr else 0
    if fwd:
        P = dict(by=round(kv({0: B+1, 2: B+3, 4: B+1, 10: B+1, 14: B}, i)), ln=round(kv({0: 2 if cr else 0, 2: 1 if cr else -1, 4: 5 if cr else 4, 11: 5 if cr else 4, 14: 2 if cr else 0}, i)), hx=round(kv({0: 0, 2: -1, 4: 3, 11: 3, 14: 0}, i)),
                 lf=tuple(round(v) for v in kv({0: (37 if cr else 34, GR, 0), 2: (36 if cr else 33, GR, 0), 4: (42, GR-(0 if cr else 4), -15), 6: (44, GR-(0 if cr else 2), -8), 8: (45, GR-(0 if cr else 1), 0), 10: (43, GR-(0 if cr else 3), -12), 12: (39, GR, 0), 14: (37 if cr else 34, GR, 0)}, i)),
                 lb=tuple(round(v) for v in kv({0: (30 if cr else 31, GR, 0), 2: (30, GR, 0), 4: (26 if cr else 25, GR-(2 if cr else 5), 30), 6: (23, GR-(1 if cr else 4), 30), 8: (22, GR-(1 if cr else 2), 25), 10: (25, GR-(2 if cr else 5), 30), 12: (29, GR, 0), 14: (30 if cr else 31, GR, 0)}, i)),
                 na=kv({0: GUARD_N if cr else IDLE_N, 2: ((-2, 4), (-4, 8)), 4: ((-5, 3), (-9, 6)), 11: ((-5, 3), (-9, 6)), 14: GUARD_N if cr else IDLE_N}, i), fa=kv({0: GUARD_F if cr else IDLE_F, 2: ((-2, 4), (-4, 7)), 4: ((-4, 3), (-8, 6)), 11: ((-4, 3), (-8, 6)), 14: GUARD_F if cr else IDLE_F}, i), hp=i*1.2, hback=1 if 3 <= i <= 12 else 0, blink=False)
    else:
        P = dict(by=round(kv({0: B+1, 2: B+2, 4: B+1, 10: B+1, 14: B}, i)), ln=round(kv({0: 2 if cr else 0, 2: 3 if cr else 1, 4: 0 if cr else -3, 11: 0 if cr else -3, 14: 2 if cr else 0}, i)), hx=round(kv({0: 0, 2: 1, 4: -3, 11: -3, 14: 0}, i)),
                 lf=tuple(round(v) for v in kv({0: (37 if cr else 34, GR, 0), 2: (38 if cr else 35, GR, 0), 4: (35 if cr else 33, GR-(0 if cr else 2), 10), 8: (32 if cr else 30, GR-(0 if cr else 1), 5), 12: (35 if cr else 32, GR, 0), 14: (37 if cr else 34, GR, 0)}, i)),
                 lb=tuple(round(v) for v in kv({0: (30 if cr else 31, GR, 0), 2: (31, GR, 0), 4: (26 if cr else 25, GR-(0 if cr else 3), 15), 8: (22, GR-(0 if cr else 1), 10), 12: (27, GR, 0), 14: (30 if cr else 31, GR, 0)}, i)),
                 na=kv({0: GUARD_N if cr else IDLE_N, 3: GUARD_N, 12: GUARD_N, 14: GUARD_N if cr else IDLE_N}, i), fa=kv({0: GUARD_F if cr else IDLE_F, 3: GUARD_F, 12: GUARD_F, 14: GUARD_F if cr else IDLE_F}, i), hp=i*1.2, hback=0, blink=False)
    r = figure(P); streaks(r[0], not fwd, i); return r
def yrun(i):                                                                    # a flat-out sprint (Verity's FATALITY victim runs away with it): long strides, high knees, pumping arms, a forward lean
    ph = i/15; S = 6.5; L = 6.0; sw = math.sin(2*math.pi*ph)
    def foot(p, base):
        p %= 1.0; return (base + S*math.cos(2*math.pi*p), GR - L*max(0.0, -math.sin(2*math.pi*p)), 25 if 0.36 <= p < 0.5 else (-15 if 0.5 <= p < 0.9 else 0))
    FWD_A, BACK_A = ((5, 2), (9, -2)), ((-4, 4), (-7, 8)); mixa = lambda t: mix(BACK_A, FWD_A, t)
    P = dict(by=1 + round(.5 + .5*math.cos(4*math.pi*ph)), ln=4, hx=2, lf=foot(ph, 36), lb=foot(ph + .5, 31), na=mixa((sw + 1)/2), fa=mixa((1 - sw)/2), hp=i*1.3, hback=1, blink=False)
    return figure(P)
MOVES = (('cdn', cdn, 0, 44), ('cidle', cidle, 0, 44), ('cfwd', cwalk, 0, 44), ('cjump', cjump, 4, 44), ('cju', cju, 4, 44), ('jcr', jcr, 4, 44), ('dash0', lambda i: dash(i, 0), 0, 44), ('dash1', lambda i: dash(i, 1), 0, 44), ('dash2', lambda i: dash(i, 2), 0, 44), ('dash3', lambda i: dash(i, 3), 0, 44), ('run', yrun, 0, 44))
# ---------------------------------------------------------------- the ten hit reactions: the same ten as Gojo's (tools/side.py, RX), 15 frames each; the game picks one at random whenever he is hit (and plays 15 frames in the time Gojo's 10 take)
OFF, W96 = 32, 96                                                               # they are drawn on a 96-wide grid: the usual 64-grid pasted OFF px to the right, so there is room to fall backwards
AX = 34.5 + OFF                                                                 # the body axis (the spin turns about it) and the feet (the fall turns about them)
PX, PY = 34 + OFF, 62
def wide(f): return [['.']*OFF + r + ['.']*(W96 - OFF - N) for r in f.g]
def g_shift(g, dx, dy):
    out = [['.']*W96 for _ in range(N)]
    for y in range(N):
        for x in range(W96):
            sx_, sy_ = x - dx, y - dy
            if 0 <= sx_ < W96 and 0 <= sy_ < N: out[y][x] = g[sy_][sx_]
    return out
def g_warp(g, sq, ax):                                                          # the spin: squashed about the vertical axis (a negative factor shows him from behind), nearest neighbour
    sq = sq if abs(sq) >= .12 else (.12 if sq >= 0 else -.12); out = [['.']*W96 for _ in range(N)]
    for y in range(N):
        for x in range(W96):
            sx_ = round(ax + (x - ax)/sq)
            if 0 <= sx_ < W96: out[y][x] = g[y][sx_]
    return out
def g_rot(g, deg, px, py):                                                      # the fall: rotated about the feet, inverse-mapped so there are no holes (like rot() in side.py)
    a = math.radians(deg); ca, sa = math.cos(a), math.sin(a); out = [['.']*W96 for _ in range(N)]
    for y in range(N):
        for x in range(W96):
            ox, oy = round(px + (x - px)*ca + (y - py)*sa), round(py - (x - px)*sa + (y - py)*ca)
            if 0 <= ox < W96 and 0 <= oy < N: out[y][x] = g[oy][ox]
    return out
def p_rot(p, deg, px, py):
    a = math.radians(deg); ca, sa = math.cos(a), math.sin(a); return (px + (p[0]-px)*ca - (p[1]-py)*sa, py + (p[0]-px)*sa + (p[1]-py)*ca)
A_UP_N, A_UP_F = ((3, -1), (6, -6)), ((2, -1), (5, -7))                          # both arms thrown up in front
BELLY_N, BELLY_F = ((1.5, 5), (4, 8.5)), ((1, 4.5), (3.5, 8))                    # both arms across the stomach
GUARD_HI_N, GUARD_HI_F = ((4, 1), (7, -11)), ((3, 1), (6, -12))                  # both forearms up in front of the face
RXK = {
 0: dict(ln={0: -1, 2: -4, 5: -3, 9: -1, 13: 0}, hs={0: -3, 2: -9, 5: -6, 9: -2, 13: 0}, gx={0: 0, 2: -1, 5: -1, 9: 0}, bl={0: 0, 1: 1, 8: 1, 9: 0}, mo={0: 0, 1: 1, 6: 1, 7: 0}, hbk={0: 1, 8: 1, 9: 0},
         na={0: IDLE_N, 3: ((-1, 6), (-2, 9.5)), 12: IDLE_N}, fa={0: IDLE_F, 3: ((-1.5, 4.5), (-2.5, 6.5)), 12: IDLE_F}),                                                                      # head snaps back
 1: dict(by={0: 0, 3: 3, 6: 4, 10: 3, 14: 0}, ln={0: 0, 3: 5, 6: 7, 10: 4, 14: 0}, hs={0: 0, 3: 3, 6: 5, 10: 2, 14: 0}, gx={0: 0, 3: -2, 6: -2, 12: -1, 14: 0}, lfx={0: 34, 4: 33, 14: 34}, bl={0: 0, 1: 1, 11: 1, 12: 0}, mo={0: 0, 1: 1, 8: 1, 9: 0},
         na={0: IDLE_N, 2: BELLY_N, 11: BELLY_N, 13: IDLE_N}, fa={0: IDLE_F, 2: BELLY_F, 11: BELLY_F, 13: IDLE_F}),                                                                               # doubled over
 2: dict(gx={0: 0, 2: -2, 4: -5, 6: -7, 9: -8, 12: -3, 14: 0}, ln={0: -1, 3: -3, 9: -3, 14: 0}, hs={0: -2, 3: -3, 9: -1, 14: 0}, by={0: 0, 5: 1, 10: 1, 14: 0}, hbk={0: 1, 10: 1, 11: 0}, bl={0: 0, 1: 1, 6: 1, 7: 0}, mo={0: 0, 1: 1, 5: 1, 6: 0},
         lfx={0: 34, 3: 31, 6: 29, 9: 31, 12: 34, 14: 34}, lfy={0: GR, 3: GR - 4, 5: GR - 1, 7: GR, 14: GR}, lbx={0: 31, 2: 28, 5: 25, 8: 27, 11: 30, 14: 31}, lby={0: GR, 2: GR - 3, 4: GR, 14: GR},
         na={0: IDLE_N, 3: ((-2, 4), (-5, 6)), 8: ((3, 3), (6, 1)), 13: IDLE_N}, fa={0: IDLE_F, 3: ((-1, 4), (-3, 8)), 8: ((2, 3), (5, 2)), 13: IDLE_F}),                                                          # staggers back
 3: dict(sq={0: 1, 1: 1, 4: 0, 7: -1, 10: .1, 13: 1, 14: 1}, by={0: 0, 3: 1, 11: 1, 14: 0}, hbk={0: 1, 13: 1, 14: 0}, hpx={0: 1.6, 14: 1.6},
         na={0: IDLE_N, 3: ((3, 2), (7, 0)), 11: ((3, 2), (7, 0)), 13: IDLE_N}, fa={0: IDLE_F, 3: ((-3, 2), (-7, 0)), 11: ((-3, 2), (-7, 0)), 13: IDLE_F}),                                                         # spins right round
 4: dict(rot={0: -6, 2: -25, 3: -45, 5: -62, 6: -72, 7: -74, 9: -72, 11: -55, 13: -22, 14: 0}, by={0: 0, 3: 2, 6: 4, 9: 4, 12: 2, 14: 0}, gx={0: 0, 3: -2, 6: -3, 9: -3, 12: -1, 14: 0}, bl={0: 0, 1: 1, 11: 1, 12: 0}, mo={0: 0, 1: 1, 5: 1, 6: 0}, hbk={0: 1, 11: 1, 12: 0},
         na={0: IDLE_N, 3: ((-3, -2), (-6, -6)), 7: ((-4, 1), (-8, 4)), 11: ((1, 4), (3, 7)), 13: IDLE_N}, fa={0: IDLE_F, 3: ((-2, -2), (-5, -7)), 7: ((-3, 1), (-7, 5)), 11: ((0, 4), (2, 7)), 13: IDLE_F}),                    # knocked flat, gets up
 5: dict(gx={0: 0, 3: -3, 6: -5, 9: -5, 12: -2, 14: 0}, ln={0: -2, 3: -4, 9: -4, 14: 0}, hs={0: -1, 3: -2, 9: -1, 14: 0}, hbk={0: 1, 11: 1, 12: 0}, bl={0: 0, 1: 1, 5: 1, 6: 0}, mo={0: 0, 1: 1, 7: 1, 8: 0},
         lfa={0: 0, 3: 18, 9: 18, 12: 0, 14: 0}, lba={0: 0, 3: 12, 9: 12, 12: 0, 14: 0}, lfx={0: 34, 3: 35, 9: 35, 12: 34, 14: 34}, lby={0: GR, 3: GR, 14: GR},
         na={0: IDLE_N, 3: ((3, -3), (6, -6)), 8: ((3, -3), (6, -6)), 12: IDLE_N}, fa={0: IDLE_F, 3: ((2, -3), (5, -7)), 8: ((2, -3), (5, -7)), 12: IDLE_F}),                                                           # skids back on his heels
 6: dict(gx={0: 0, 2: -2, 5: -2, 9: -1, 12: 0}, ln={0: 0, 2: -1, 11: -1, 14: 0}, by={0: 0, 2: 1, 11: 1, 14: 0}, hs={0: 0, 3: 1, 11: 1, 14: 0},
         na={0: IDLE_N, 2: GUARD_HI_N, 11: GUARD_HI_N, 13: IDLE_N}, fa={0: IDLE_F, 2: GUARD_HI_F, 11: GUARD_HI_F, 13: IDLE_F}, bl={0: 0, 1: 1, 10: 1, 11: 0}),                                                          # arms up to guard
 7: dict(gx={0: 0, 3: -2, 8: -4, 12: -1, 14: 0}, ln={0: -1, 3: -3, 9: -2, 14: 0}, hs={0: -1, 3: -2, 9: -1, 14: 0}, hbk={0: 1, 11: 1, 12: 0}, bl={0: 0, 1: 1, 5: 1, 6: 0}, mo={0: 0, 1: 1, 7: 1, 8: 0},
         lfx={0: 34, 3: 36, 10: 36, 13: 34}, lfy={0: GR, 3: GR - 5, 10: GR - 4, 13: GR}, lfa={0: 0, 3: 20, 10: 15, 13: 0}, lbx={0: 31, 3: 32, 10: 32, 13: 31}, lby={0: GR, 3: GR - 4, 10: GR - 3, 13: GR}, lba={0: 0, 3: 15, 10: 10, 13: 0},
         na={0: IDLE_N, 3: A_UP_N, 10: A_UP_N, 13: IDLE_N}, fa={0: IDLE_F, 3: A_UP_F, 10: A_UP_F, 13: IDLE_F}),                                                                                     # hops backwards
 8: dict(ln={0: -2, 2: 3, 4: -4, 6: 4, 8: -3, 10: 3, 12: -1, 14: 0}, hs={0: -2, 2: 4, 4: -5, 6: 5, 8: -4, 10: 3, 12: -1, 14: 0}, by={0: 0, 2: 1, 4: 0, 6: 1, 8: 0, 10: 1, 12: 0, 14: 0}, gx={0: 0, 2: 1, 4: -1, 6: 1, 8: -1, 10: 1, 12: 0}, bl={0: 0, 1: 1, 12: 1, 13: 0}, mo={0: 0, 2: 1, 9: 1, 10: 0},
         na={0: IDLE_N, 2: ((2, 5.5), (4, 9)), 5: ((-2, 6), (-3, 9.5)), 8: ((2, 5.5), (4, 9)), 11: ((-1, 6), (-1, 9.5)), 13: IDLE_N}, fa={0: IDLE_F, 3: ((-2, 4.5), (-3, 7)), 7: ((1, 4.5), (2, 7)), 11: ((-1, 4.5), (-2, 7)), 13: IDLE_F}),         # dizzy wobble
 9: dict(by={0: 0, 2: 3, 4: 8, 10: 8, 13: 2, 14: 0}, ln={0: 0, 3: 2, 5: 3, 10: 3, 14: 0}, hs={0: 0, 4: 2, 10: 2, 14: 0}, gx={0: 0, 3: -1, 5: -2, 10: -2, 14: 0}, bl={0: 0, 1: 1, 10: 1, 11: 0}, mo={0: 0, 1: 1, 6: 1, 7: 0},
         lfx={0: 34, 4: 37, 10: 37, 14: 34}, lbx={0: 31, 4: 22, 10: 22, 14: 31}, lby={0: GR, 4: GR - 1, 10: GR - 1, 14: GR}, lba={0: 0, 4: 60, 10: 60, 13: 0},
         na={0: IDLE_N, 4: ((4, 4), (6, 8)), 10: ((4, 4), (6, 8)), 13: IDLE_N}, fa={0: IDLE_F, 4: ((2, 4), (3, 9)), 10: ((2, 4), (3, 9)), 13: IDLE_F}),                                                                    # drops to one knee
}
RX_LIFT_Y = {7: [0, 3, 6, 9, 10, 10, 10, 9, 7, 5, 3, 2, 1, 0, 0]}                # the hop: height above the ground per frame (applied by the game)
def rxf(k, i):                                                                  # -> (grid rows 64 x 96, near hand, far hand)
    if i == 14:                                                                 # the last frame is exactly his idle (no pop when the reaction ends)
        f, nh, fh = idle(0); return wide(f), (nh[0] + OFF, nh[1]), (fh[0] + OFF, fh[1])
    K = RXK[k]; g = lambda n, d: kv(K[n], i) if n in K else d
    P = dict(by=round(g('by', 0)), ln=round(g('ln', 0)), hs=round(g('hs', 0)), lf=(g('lfx', 34), g('lfy', GR), g('lfa', 0)), lb=(g('lbx', 31), g('lby', GR), g('lba', 0)), hp=i*g('hpx', .8), hback=1 if g('hbk', 0) > .5 else 0, blink=g('bl', 0) > .5, mo=g('mo', 0) > .5)
    if 'na' in K: P['na'], P['fa'] = g('na', IDLE_N), g('fa', IDLE_F)
    f, nh, fh = figure(P); gr = wide(f); nh, fh = (nh[0] + OFF, nh[1]), (fh[0] + OFF, fh[1])
    if 'sq' in K:
        sq = g('sq', 1); gr = g_warp(gr, sq, AX); nh, fh = [(AX + (p[0] - AX)*sq, p[1]) for p in (nh, fh)]
    if 'rot' in K:
        d = g('rot', 0); gr = g_rot(gr, d, PX, PY); nh, fh = [p_rot(p, d, PX, PY) for p in (nh, fh)]
    dx = round(g('gx', 0))
    if dx: gr = g_shift(gr, dx, 0); nh, fh = (nh[0] + dx, nh[1]), (fh[0] + dx, fh[1])
    return gr, nh, fh
def pack_rx(k):
    fr = [rxf(k, i) for i in range(15)]; xs = [x for g, _, _ in fr for r in g for x, c in enumerate(r) if c != '.']; x0 = max(0, min(xs) - 1); x1 = min(W96 - 1, max(xs) + 1); w = x1 - x0 + 1
    return {'x0': x0, 'w': w, 'h': N, 'top': 0, 'cx': 34 + OFF, 'frames': [[''.join(r[x0:x0 + w]) for r in g] for g, _, _ in fr], 'hn': [[round(n[0] - x0, 1), round(n[1], 1)] for _, n, _ in fr], 'hf': [[round(h[0] - x0, 1), round(h[1], 1)] for _, _, h in fr],
            **({'lift': RX_LIFT_Y[k]} if k in RX_LIFT_Y else {})}
# ---------------------------------------------------------------- v1.19 INHERITENCE: atk19 = the CHARGED BLACK FLASH, the fourth hit of its M1 (15 frames on a 96-wide grid, the impact is frame 9): he sinks into a wide stance and the cursed energy pours into his fist (1-7: the body shakes, flames lick round him, the floor splits, rocks rise, a black ball with a red skin swells on the fist), he steps in (8) and drives it out with his whole body (9: white-hot core, two shock rings, 14 bolts, speed lines), holds (10-11) and pulls back (12-14)
CH_X = 8                                                                      # the usual 64-grid is pasted this many px from the left of the 96-wide grid (room for the blast in front of the fist)
class WF(F):                                                                  # a frame on the 96-wide grid (the same drawing calls as F)
    def __init__(s, w=W96): s.w = w; s.g = [['.']*w for _ in range(N)]
    def set(s, x, y, c):
        x, y = round(x), round(y)
        if 0 <= x < s.w and 0 <= y < N: s.g[y][x] = c
    def at(s, x, y):
        x, y = round(x), round(y)
        return s.g[y][x] if 0 <= x < s.w and 0 <= y < N else '.'
def bfc_params(i):
    sh = (1 if i % 2 else -1) if 4 <= i <= 7 else 0                           # (the body shakes while the energy builds)
    return dict(by=round(kv({0: 0, 2: 3, 4: 4, 7: 4, 8: 1, 9: -2, 11: -1, 13: 1, 14: 0}, i)), ln=round(kv({0: 0, 2: -1, 4: -3, 7: -4, 8: 2, 9: 7, 11: 6, 13: 2, 14: 0}, i)),
                hx=round(kv({0: 0, 4: -2, 7: -3, 8: 1, 9: 5, 11: 4, 14: 0}, i)) + sh, hs=round(kv({0: 0, 9: 2, 14: 0}, i)),
                lf=(round(kv({0: 34, 3: 38, 7: 40, 8: 42, 9: 47, 11: 46, 14: 34}, i)), GR, 0), lb=(round(kv({0: 31, 3: 27, 7: 23, 9: 21, 11: 24, 14: 31}, i)), GR, 0),
                na=kv({0: GUARD_N, 2: ((-1.5, 5.5), (-2.5, 8)), 4: ((-5, 6), (-8, 9)), 7: ((-5.5, 6), (-9, 9)), 8: ((2, 3), (7, 3)), 9: ((9, .5), (19, -1.5)), 11: ((9, .5), (19, -1.5)), 12: ((7, 1), (14, -.5)), 13: GUARD_N, 14: IDLE_N}, i),
                fa=kv({0: GUARD_F, 2: ((3, 3.5), (8, 1)), 7: ((3.5, 3), (9, .5)), 8: ((2.5, 4), (6, 2.5)), 9: ((3, 4), (6, 1.5)), 13: GUARD_F, 14: IDLE_F}, i),
                hp=i*.8, hup=1 if 3 <= i <= 11 else 0, hback=0, mo=4 <= i <= 11, blink=False)
def bfc_body(i):                                                              # the body of frame i on the wide grid, and where its near fist is
    f0, nh, fh = figure(bfc_params(i)); f = WF(); f.g = [['.']*CH_X + r + ['.']*(W96 - CH_X - N) for r in f0.g]; return f, (nh[0] + CH_X, nh[1]), (fh[0] + CH_X, fh[1])
def sil(f): return {(x, y) for y, r in enumerate(f.g) for x, c in enumerate(r) if c != '.'}
def aura(f, s, i, amt, cols=('z', 'X', 'Y')):                                                       # cursed energy licks all round him: three layers of dithered flame round the body (dark red close, bright red at the edge, a last few sparks), a new pattern every frame
    r1 = {(x + dx, y + dy) for x, y in s for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1))} - s
    r2 = {(x + dx, y + dy) for x, y in r1 for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1))} - s - r1
    r3 = {(x + dx, y + dy) for x, y in r2 for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1))} - s - r1 - r2
    for x, y in r1:
        if f.at(x, y) == '.' and (x*5 + y*3 + i*7) % 3 != 0: f.set(x, y, cols[0] if (x + y + i) % 3 else cols[1])
    for x, y in r2:
        if amt >= 2 and f.at(x, y) == '.' and (x*7 + y*5 + i*11) % 4 < 2 + (amt >= 3): f.set(x, y, cols[1] if (x*3 + y + i) % 2 else cols[0])
    for x, y in r3:
        if amt >= 3 and f.at(x, y) == '.' and (x*11 + y*7 + i*13) % 7 == 0: f.set(x, y, cols[2] if (x + y) % 3 == 0 else cols[1])
def tongues(f, i, amt):                                                       # flames rising off his back and shoulders: tapering red strands that flicker from frame to frame
    rnd = random.Random(i*41 + 7)
    for k in range(7):
        x0 = CH_X + 18 + k*3 + rnd.randint(-1, 1); h = int((4 + rnd.random()*9)*amt/3) + 3; y0 = 42 - (k % 3)*3
        for t in range(h):
            x, y = x0 - t*0.45 + math.sin(t*.9 + i + k)*1.2, y0 - t
            if f.at(round(x), round(y)) == '.': f.set(x, y, 'X' if t >= h - 3 else ('z' if t < h*.6 else 'X'))
            if t < h*.5 and f.at(round(x) + 1, round(y)) == '.': f.set(x + 1, y, 'z')
def ball(f, x, y, r, i):                                                      # the black ball on the fist: a red skin, a black body with dark red swirls, a pale core and four sparks circling it
    for dy in range(-r - 1, r + 2):
        for dx in range(-r - 1, r + 2):
            d = math.hypot(dx, dy)
            if d > r + .4: continue
            c = 'Z'
            if d > r - 1.1: c = 'X'
            elif d <= r*.3: c = 'W' if r >= 4 and d <= r*.14 else 'Y'
            elif math.sin(math.atan2(dy, dx)*3 + i*1.4 + d*1.3) > .45: c = 'z'
            f.set(x + dx, y + dy, c)
    for k in range(4):
        a = i*.95 + k*1.5708; f.set(x + math.cos(a)*(r + 2.6), y + math.sin(a)*(r + 2.6)*.85, 'Y'); f.set(x + math.cos(a - .5)*(r + 2.6), y + math.sin(a - .5)*(r + 2.6)*.85, 'X')
def cracks(f, cx, n, i):                                                      # the floor splits under his feet: black cracks with a red glow, growing both ways
    for side in (-1, 1):
        x = cx; 
        for s in range(n):
            x += side*(2 + (s*5 + i) % 2); y = 62 - (s % 3 == 1)
            f.set(x, y, 'Z'); f.set(x, y + 1, 'z')
            if s % 3 == 2: f.set(x, y - 1, 'X')
def rocks(f, cx, i):                                                          # pieces of floor rising round him while he charges, falling again after the blow
    for k in range(6):
        t = i - 3 - k*.6
        if 0 <= t <= 10:
            x = cx + (k - 2.5)*5 + (k % 2)*2; y = 61 - (7.5*t - .75*t*t)
            if y < 62: f.set(x, y, 'Z'); f.set(x + 1, y, 'Z'); f.set(x, y + 1, 'Z'); f.set(x + 1, y + 1, 'z'); f.set(x - 1, y, 'X')
def embers(f, x, y, i, n, spread):                                            # sparks drifting up
    rnd = random.Random(i*53 + 3)
    for k in range(n):
        px, py = x + rnd.uniform(-spread, spread), y - rnd.uniform(0, spread*1.3); f.set(px, py, 'Y' if k % 4 == 0 else ('X' if k % 2 else 'z'))
def bf_charged(i):
    f, nh, fh = bfc_body(i); s = sil(f); hx, hy = round(nh[0]), round(nh[1]); cx = 34 + CH_X
    if 1 <= i <= 13: aura(f, s, i, 1 if i <= 2 else 2 if i <= 4 or i >= 12 else 3)
    if 2 <= i <= 11: tongues(f, i, 1 if i <= 3 else 2 if i >= 12 or i <= 5 else 3)
    if 2 <= i <= 10: cracks(f, cx - 4, min(i - 1, 9), i)
    if 3 <= i <= 12: rocks(f, cx, i)
    if 8 <= i <= 11:                                                          # afterimages: dithered dark red copies of the body a few frames back
        for j, ch in ((i - 2, 'z'), (i - 4, 'z')):
            g = sil(bfc_body(max(0, j))[0])
            for x, y in g:
                if f.at(x, y) == '.' and (x + y) % 2 == 0: f.set(x, y, ch)
    if 2 <= i <= 7: charge(f, hx, hy, (i - 2)/5, i); charge(f, hx, hy, (i - 2)/5, i + 5)
    if 3 <= i <= 8: ball(f, hx + (i - 7)*0 + (7 if i == 8 else 0), hy, {3: 2, 4: 3, 5: 4, 6: 5, 7: 6, 8: 6}[i], i)
    if 4 <= i <= 8:
        for k in range(4): bolt(f, hx, hy, (k*90 + i*37) % 360, 6 + (i + k) % 5, i*9 + k)
    if 8 <= i <= 9:                                                           # the trail of the fist
        pts = [bfc_body(j)[1] for j in (max(0, i - 3), max(0, i - 2), max(0, i - 1), i)]
        for a, b in zip(pts, pts[1:]):
            n = max(1, int(max(abs(b[0] - a[0]), abs(b[1] - a[1])))); 
            for q in range(n + 1):
                u = q/n; xx, yy = a[0] + (b[0] - a[0])*u, a[1] + (b[1] - a[1])*u
                for w in range(-1, 2): f.set(xx, yy + w, 'X' if w else 'Y')
    if i == 9: bf_burst(f, hx, hy, 9, 14, 9, 360, 180); bf_ring(f, hx - 2, hy, 14, 91); bf_ring(f, hx - 2, hy, 20, 92)
    if i == 10: bf_burst(f, hx, hy, 6, 12, 10, 360, 180); bf_ring(f, hx - 2, hy, 19, 93); bf_ring(f, hx - 2, hy, 26, 94)
    if i == 11: bf_burst(f, hx, hy, 4, 10, 11, 330, 180); bf_ring(f, hx - 2, hy, 24, 95)
    if i == 12: bf_burst(f, hx, hy, 2, 6, 12, 300, 180)
    if 9 <= i <= 12: lines_r(f, hx - 6, hy, 5, 15 - (i - 9)*3, i)
    if 9 <= i <= 12:                                                          # the shock runs along the floor in front of him
        for q in range(26 - (i - 9)*4):
            xx = hx - 12 + q*2 + (i - 9)*4
            if f.at(xx, 62) == '.': f.set(xx, 62, 'Z'); f.set(xx, 63, 'X' if q % 2 else 'z')
    if 5 <= i <= 10: puff(f, cx - 11, 61, 2); puff(f, cx + 9, 61, 1)
    if i >= 9: embers(f, hx - 10, hy + 6, i, 16 if i <= 11 else 10, 16)
    if i >= 12: embers(f, cx, 40, i, 8, 14)
    return f, (hx, hy), (fh[0], fh[1])
# ---------------------------------------------------------------- v1.21 CURSED TECHNIQUE (Yuji's DOMAIN button), four 15-frame strips on the 96-wide grid of atk19: atk24 = PIERCING BLOOD (standing: he claps, holds his arms out all the way, fires; the impact frames are drawn by the game), atk25 = SHRINE (crouched: he cleaves the floor, lifts the block, throws it), atk26 = GRAB + CLEAVE (walking forward), atk27 = SIMPLE DOMAIN (in the air: the hand seal and a cyan glow; the circle on the floor is drawn by the game)
PAL.update({'M': '#8c8898', 'N': '#5e5a6c', 'a': '#383444', 'q': '#c4121c', 'c': '#7df4ff', 'd': '#2fc3e6', 'b': '#1a6f94', 'f': '#d6fcff'})      # stone (light, mid, dark), deep blood red, cyan (bright, mid, dark, pale)
def wbody(P):                                                                 # the body of a pose on the wide grid, and its two hands
    f0, nh, fh = figure(P); f = WF(); f.g = [['.']*CH_X + r + ['.']*(W96 - CH_X - N) for r in f0.g]; return f, (nh[0] + CH_X, nh[1]), (fh[0] + CH_X, fh[1])
def bloodorb(f, x, y, r, i):                                                  # the blood gathering in his hands: a deep red ball with a bright rim, a pale core, dark swirls and drops circling it
    for dy in range(-r - 1, r + 2):
        for dx in range(-r - 1, r + 2):
            d = math.hypot(dx, dy)
            if d > r + .4: continue
            c = 'q'
            if d > r - 1.0: c = 'X'
            elif d <= r*.35: c = 'Y'
            elif math.sin(math.atan2(dy, dx)*2 + i*1.7 + d) > .5: c = 'z'
            f.set(x + dx, y + dy, c)
    for k in range(5):
        a = i*1.1 + k*1.2566; f.set(x + math.cos(a)*(r + 2.5), y + math.sin(a)*(r + 2.5)*.8, 'X' if k % 2 else 'q')
def pbeam(f, x, y, i, w):                                                     # PIERCING BLOOD: a hard, thin jet of blood from his hands out to the edge of the picture: a white-hot core, a red body, a dark red skin and a black rim that wobbles
    for xx in range(int(x), f.w):
        wob = math.sin(xx*.55 + i*2.3)*.5
        for dy in range(-int(w) - 3, int(w) + 4):
            d = abs(dy - wob)
            if d <= w*.5: f.set(xx, y + dy, 'W' if d <= w*.22 and (xx + i) % 9 else 'Y')
            elif d <= w*.9: f.set(xx, y + dy, 'X')
            elif d <= w + 1.2: f.set(xx, y + dy, 'q' if (xx + dy) % 2 else 'z')
            elif d <= w + 2.2 and f.at(xx, y + dy) == '.': f.set(xx, y + dy, 'Z')
    rnd = random.Random(i*77 + 5)
    for k in range(14):
        px = x + 4 + rnd.random()*(f.w - x - 6); py = y + rnd.choice((-1, 1))*(w + 2 + rnd.random()*5); f.set(px, py, 'X' if k % 3 else 'q')
def slab(f, x, y, w, h, behind=False):                                        # a block of the floor: a lit top edge, a mid face, a dark underside, cracks and a dark rim (behind=True: only where the picture is still empty)
    put = (lambda a, b, c: f.at(a, b) == '.' and f.set(a, b, c)) if behind else f.set
    for yy in range(-1, h + 1):
        for xx in range(-1, w + 1):
            if yy in (-1, h) or xx in (-1, w): put(x + xx, y + yy, 'O'); continue
            c = 'N'
            if yy == 0: c = 'M'
            elif yy >= h - 2: c = 'a'
            elif xx == 0: c = 'M'
            elif xx >= w - 2: c = 'a'
            put(x + xx, y + yy, c)
    if h >= 6:
        for a, b in (((x + 3, y + 1), (x + 5, y + 4)), ((x + 5, y + 4), (x + 4, y + h - 2)), ((x + w - 5, y + 2), (x + w - 3, y + h - 3))):
            f.line([a, b], 'a') if not behind else None
def cleave(f, pts, w, i):                                                     # a CLEAVE slash: a bright white-red streak along the points with a black rim (tail thin, head wide)
    for j in range(len(pts) - 1):
        (x0, y0), (x1, y1) = pts[j], pts[j + 1]; n = max(1, int(max(abs(x1 - x0), abs(y1 - y0))*2))
        for q in range(n + 1):
            u = q/n; xx, yy = x0 + (x1 - x0)*u, y0 + (y1 - y0)*u; ww = w*((j + u)/(len(pts) - 1))
            for dy in range(-int(ww) - 2, int(ww) + 3):
                d = abs(dy)
                if d <= ww*.3: f.set(xx, yy + dy, 'W')
                elif d <= ww*.65: f.set(xx, yy + dy, 'Y')
                elif d <= ww + .6: f.set(xx, yy + dy, 'X')
                elif d <= ww + 1.6 and f.at(xx, yy + dy) == '.': f.set(xx, yy + dy, 'Z')
def sparkle(f, x, y, i, n, R, cols=('c', 'f', 'd')):                          # little stars orbiting (the simple domain's cyan light)
    for k in range(n):
        a = i*.8 + k*6.2832/n; px, py = x + math.cos(a)*R*(1 + .25*math.sin(k + i)), y + math.sin(a)*R*.8
        f.set(px, py, cols[k % 3])
        if k % 2 == 0: f.set(px + 1, py, cols[2]); f.set(px - 1, py, cols[2]); f.set(px, py + 1, cols[2]); f.set(px, py - 1, cols[2])
# ---- 1. PIERCING BLOOD: guard, the arms open wide (1-2), the CLAP (3), the arms swing up and out until they are extended all the way with the hands together (4-5), HELD (5-9: the blood gathers, he trembles), FIRE (10), the jet thins (11-12), the arms come down (13), guard (14)
CTB_N = {0: GUARD_N, 1: ((-2.5, 3), (-6.5, 1)), 2: ((-4.5, 1), (-9, -2)), 3: ((6, 3), (9.5, 2.5)), 4: ((6.5, 1), (11, -1)), 5: ((7, -.5), (13.5, -1.5)), 9: ((7, -.5), (13.5, -1.5)), 10: ((6.5, 0), (12.5, -1)), 12: ((6, 1), (11, 0)), 13: GUARD_N, 14: IDLE_N}
CTB_F = {0: GUARD_F, 1: ((3, 3), (7.5, 1)), 2: ((4.5, 1), (9.5, -2)), 3: ((5.5, 3), (8.5, 2.5)), 4: ((6, 1), (10.5, -1)), 5: ((6.5, -.5), (13, -1.5)), 9: ((6.5, -.5), (13, -1.5)), 10: ((6, 0), (12, -1)), 12: ((5.5, 1), (10.5, 0)), 13: GUARD_F, 14: IDLE_F}
def ctb_params(i):
    tr = (1 if i % 2 else -1)*.5 if 6 <= i <= 9 else 0                          # (the arms tremble while the blood gathers)
    na, fa = kv(CTB_N, i), kv(CTB_F, i)
    na = ((na[0][0], na[0][1]), (na[1][0], na[1][1] + tr)); fa = ((fa[0][0], fa[0][1]), (fa[1][0], fa[1][1] + tr))
    return dict(by=round(kv({0: 0, 2: 1, 3: 0, 5: 2, 9: 2, 10: 1, 12: 1, 14: 0}, i)), ln=round(kv({0: 0, 2: -2, 3: 1, 5: 3, 9: 3, 10: 0, 12: 2, 14: 0}, i)), hx=round(kv({0: 0, 5: 2, 9: 2, 10: -1, 12: 0, 14: 0}, i)), hs=round(kv({0: 0, 5: 1, 10: 0, 14: 0}, i)),
                lf=(round(kv({0: 34, 5: 39, 9: 40, 10: 37, 13: 34, 14: 34}, i)), GR, 0), lb=(round(kv({0: 31, 5: 27, 9: 26, 10: 28, 13: 31, 14: 31}, i)), GR, 0), na=na, fa=fa,
                hp=i*.9, hup=1 if 4 <= i <= 12 else 0, hback=1 if 5 <= i <= 11 else 0, mo=8 <= i <= 11, blink=i in (2, 3))
def ct_blood(i):
    f, nh, fh = wbody(ctb_params(i)); s = sil(f); hx, hy = round(nh[0]) + 1, round(nh[1])
    if 5 <= i <= 12: aura(f, s, i, 1 if i < 8 else 2)
    if i == 3:                                                                # the clap: a white flash between the palms and lines of sound
        burst(f, hx - 1, hy, 3)
        for a in (-60, -25, 25, 60):
            for q in range(3, 7): f.set(hx - 1 + math.cos(math.radians(a))*q, hy + math.sin(math.radians(a))*q, 'Y' if q < 6 else 'X')
    if 4 <= i <= 9: charge(f, hx, hy, (i - 4)/5, i); bloodorb(f, hx + 2, hy, {4: 1, 5: 2, 6: 2, 7: 3, 8: 4, 9: 5}[i], i)
    if 6 <= i <= 9:
        for k in range(3): bolt(f, hx + 2, hy, (k*120 + i*50) % 360, 3 + i % 3, i*9 + k)
    if 10 <= i <= 12: pbeam(f, hx + 2, hy, i, {10: 3, 11: 2.4, 12: 1.4}[i])
    if i == 10: bf_burst(f, hx + 3, hy, 5, 8, 10, 220, 0); lines_r(f, hx - 8, hy, 3, 9, i)
    if i == 11: bf_burst(f, hx + 3, hy, 3, 6, 11, 200, 0)
    if i >= 12: embers(f, hx, hy + 4, i, 8, 8)
    return f, (hx, hy), fh
# ---- 2. SHRINE: crouch guard, the hand goes up (1-2), the CLEAVE slashes down to the floor (3) and cuts the block out of it (4), both hands under it (5), he lifts it (6-7), draws it back (8), throws it (9: the game's block takes over from his hands), follow-through and dust (10-11), back in the crouch (12-14)
CTS_N = {0: GUARD_N, 1: ((-1.5, -3), (-3, -9)), 2: ((3, -5), (6, -11)), 3: ((7, 5), (11, 12)), 4: ((7.5, 6), (10, 14)), 5: ((6, 7), (9.5, 13)), 6: ((6, 4), (10, 9)), 7: ((6, -2), (9, -8)), 8: ((-1, -3), (-2, -9)), 9: ((8, -1), (15, -3)), 11: ((7, 1), (12, 1)), 13: GUARD_N, 14: GUARD_N}
CTS_F = {0: GUARD_F, 1: GUARD_F, 3: ((4, 4), (7, 10)), 4: ((5, 5.5), (8.5, 13)), 5: ((5, 6.5), (8, 13)), 6: ((4, 3.5), (8, 8)), 7: ((4, -2), (7.5, -8)), 8: ((0, -3), (-1, -9)), 9: ((7, -1), (14, -3)), 11: ((6, 1), (11, 1)), 13: GUARD_F, 14: GUARD_F}
def cts_params(i):
    return dict(by=round(kv({0: CR, 2: CR, 3: 11, 5: 12, 6: 9, 7: 5, 8: 4, 9: 5, 11: 7, 13: CR, 14: CR}, i)), ln=round(kv({0: 2, 2: 0, 3: 5, 5: 4, 7: 1, 8: -2, 9: 4, 11: 3, 13: 2, 14: 2}, i)), hx=round(kv({0: 0, 3: 2, 5: 2, 8: -1, 9: 2, 13: 0, 14: 0}, i)), hd=round(kv({0: 0, 3: 1, 5: 1, 8: 0, 14: 0}, i)),
                lf=(round(kv({0: 37, 3: 39, 8: 38, 9: 40, 13: 37, 14: 37}, i)), GR, 0), lb=(round(kv({0: 30, 3: 27, 9: 26, 13: 30, 14: 30}, i)), GR, 0), na=kv(CTS_N, i), fa=kv(CTS_F, i),
                hp=i*.8, hup=1 if 2 <= i <= 9 else 0, hback=0, mo=i in (3, 4, 9), blink=False)
SL_BOX = {4: (53, 58, 16, 3), 5: (52, 51, 15, 9), 6: (52, 41, 15, 12), 7: (51, 22, 15, 12), 8: (CH_X + 20, 10, 15, 12)}                 # the block per frame: x, y, width, height (the game's own block starts from his hands on 9)
def ct_shrine(i):
    f, nh, fh = wbody(cts_params(i)); s = sil(f); hx, hy = round(nh[0]), round(nh[1]); cx = 34 + CH_X
    if i in SL_BOX:
        x, y, w, h = SL_BOX[i]; slab(f, x + (CH_X if i != 8 else 0), y, w, h, behind=(i == 8))
    if 1 <= i <= 2: sparkle(f, hx, hy - 4, i, 3, 5, ('Y', 'X', 'q'))
    if 3 <= i <= 4: cleave(f, [(cx + 8, 22), (cx + 13, 34), (cx + 17, 48), (cx + 19, 60)], 2.6, i); cleave(f, [(cx + 15, 26), (cx + 19, 38), (cx + 23, 50), (cx + 25, 60)], 1.4, i + 3)       # the slash from above down into the floor in front of him (and a thinner one beside it)
    if 3 <= i <= 6:                                                           # the floor splits: a bright cut with cracks running out of it
        for q in range(12 + (i - 3)*5): f.set(cx + 8 + q*2, 61 + (q % 5 == 3), 'Y' if q % 4 == 0 else 'X'); f.set(cx + 8 + q*2, 62, 'Z')
        for q in range(4): f.line([(cx + 14 + q*8, 61), (cx + 17 + q*8, 63)], 'Z')
    if 4 <= i <= 8:
        for k in range(6): f.set(cx + 10 + k*5 + (i % 2), 58 - (i - 4)*3 - (k % 3)*2, 'M' if k % 2 else 'N')      # chips flying up off the block
    if 4 <= i <= 8: puff(f, cx + 16, 61, 2); puff(f, cx + 28, 61, 1)
    if 3 <= i <= 9: aura(f, s, i, 1)
    if i == 9:                                                                # the block leaves his hands: chips and dust fly off it
        for k in range(9): f.set(hx + 3 + k, hy - 3 + (k % 3)*2, 'M' if k % 2 else 'N')
        puff(f, hx + 2, hy + 3, 2)
    if 10 <= i <= 12: puff(f, cx + 18, 61, 3)
    return f, (hx, hy), fh
# ---- 3. GRAB + CLEAVE: a lunge (0-2), the hand closes on the enemy's neck (3: the contact), the pull (4), the other hand goes up (5), the CLEAVE (6-7: a slash across the enemy and a spray of blood), hold (8), a shove (9-10), recovery (11-14)
CTG_N = {0: ((3, 1), (7, -1)), 1: ((6, -1), (11, -3)), 2: ((7.5, -2), (13.5, -5)), 3: ((7.5, -2), (14, -6)), 4: ((5, -2), (10.5, -5)), 8: ((5, -2), (10.5, -5)), 9: ((8, 0), (14.5, -1)), 11: ((6, 1), (11, 0)), 13: GUARD_N, 14: IDLE_N}
CTG_F = {0: GUARD_F, 3: ((3, 3), (6, 1)), 4: ((2.5, 1), (4.5, -3)), 5: ((2, -5), (3, -12)), 6: ((6, 1), (10, 5)), 7: ((8, 6), (13, 12)), 9: ((6, 4), (10, 8)), 11: ((5, 2), (9, 3)), 13: GUARD_F, 14: IDLE_F}
def ctg_params(i):
    return dict(by=round(kv({0: 2, 2: 3, 4: 3, 7: 2, 9: 1, 12: 0, 14: 0}, i)), ln=round(kv({0: 2, 1: 4, 3: 6, 5: 5, 7: 5, 9: 3, 12: 1, 14: 0}, i)), hx=round(kv({0: 1, 3: 3, 8: 3, 12: 0, 14: 0}, i)), hs=round(kv({0: 0, 3: 1, 8: 1, 14: 0}, i)),
                lf=(round(kv({0: 38, 2: 42, 3: 43, 8: 43, 11: 38, 14: 34}, i)), GR, 0), lb=(round(kv({0: 28, 2: 23, 3: 22, 8: 22, 11: 27, 14: 31}, i)), GR, 0), na=kv(CTG_N, i), fa=kv(CTG_F, i),
                hp=i*1.1, hup=1 if 1 <= i <= 10 else 0, hback=1 if 1 <= i <= 4 else 0, mo=3 <= i <= 8, blink=False)
def ct_grab(i):
    f, nh, fh = wbody(ctg_params(i)); s = sil(f); hx, hy = round(nh[0]), round(nh[1])
    if 2 <= i <= 8:                                                           # the open hand: fingers stretch out of the fist
        for k in range(3): f.set(hx + 2 + k, hy - 1 + k - (k == 2), 'S'); f.set(hx + 3, hy - 2 + k, 'S')
    if 1 <= i <= 3:                                                           # speed lines behind the lunge
        for q in range(0, 10, 2): f.set(hx - 10 - q, hy + 2 + (q % 3) - 1, 'Y' if q < 6 else 'z')
    if i == 3: burst(f, hx + 4, hy + 1, 3)
    if 4 <= i <= 8: aura(f, s, i, 2); embers(f, hx + 6, hy + 8, i, 8, 8)
    if i == 6: cleave(f, [(hx - 1, hy - 8), (hx + 4, hy + 2), (hx + 9, hy + 12)], 2.4, i)
    if i == 7:
        cleave(f, [(hx - 2, hy - 10), (hx + 7, hy + 6), (hx + 17, hy + 26)], 3.8, i); bf_burst(f, hx + 9, hy + 10, 4, 8, 7, 180, 0)
        rnd = random.Random(7)
        for k in range(22): a = math.radians(rnd.uniform(-70, 60)); r = rnd.uniform(5, 20); f.set(hx + 9 + math.cos(a)*r, hy + 10 + math.sin(a)*r, 'X' if k % 3 else ('q' if k % 2 else 'Y'))
    if i == 8:
        rnd = random.Random(8)
        for k in range(24): a = math.radians(rnd.uniform(-80, 50)); r = rnd.uniform(6, 26); f.set(hx + 9 + math.cos(a)*r, hy + 10 + math.sin(a)*r + r*r/90, 'q' if k % 2 else 'X')
    if 9 <= i <= 10: lines_r(f, hx - 6, hy, 3, 8, i)
    if i >= 9: embers(f, hx, hy + 6, i, 8, 10)
    return f, (hx, hy), fh
# ---- 4. SIMPLE DOMAIN (the game starts it on frame 3, in the air; the lift is SD_LIFT): the hand seal in front of the chest (3-5), HELD with a cyan glow gathering (5-9), the flash of the circle (10), down (11-13), landed (14)
SD_LIFT = [0, 8, 16, 22, 26, 28, 28, 28, 28, 28, 24, 16, 8, 2, 0]
CTD_N = {0: GUARD_N, 1: ((3, 3), (5, 6)), 2: ((3.5, 1), (6, 0)), 3: ((4, 0), (7, -3)), 4: ((4, 0), (7.5, -3.5)), 10: ((4.5, 0), (8, -4)), 12: ((4, 1), (6.5, -1)), 14: IDLE_N}
CTD_F = {0: GUARD_F, 1: ((2.5, 3), (4, 5.5)), 2: ((3, 1), (5, -.5)), 3: ((3.5, 0), (6.5, -3.5)), 4: ((3.5, 0), (7, -4)), 10: ((4, 0), (7.5, -4.5)), 12: ((3.5, 1), (6, -1.5)), 14: IDLE_F}
def ctd_params(i):
    tuck = kv({0: 0, 1: .4, 2: .8, 3: 1, 10: 1, 12: .5, 13: .1, 14: 0}, i)
    return dict(by=round(kv({0: 3, 1: 0, 3: -1, 10: -1, 13: 1, 14: 2}, i)), ln=round(kv({0: 1, 3: 0, 10: 0, 14: 0}, i)), hs=0,
                lf=(round(34 + 3*tuck), round(GR - 10*tuck), round(22*tuck)), lb=(round(31 + tuck), round(GR - 9*tuck), round(26*tuck)), na=kv(CTD_N, i), fa=kv(CTD_F, i),
                hp=i*.9, hup=1 if 2 <= i <= 12 else 0, hback=0, mo=False, blink=3 <= i <= 12)
def ct_simple(i):
    f, nh, fh = wbody(ctd_params(i)); s = sil(f); hx, hy = round(nh[0]) + 1, round(nh[1]); cx = 34 + CH_X
    if 3 <= i <= 13: aura(f, s, i, 1 if i < 5 or i > 11 else 3, ('b', 'd', 'f'))
    if 4 <= i <= 12:
        r = {4: 1, 5: 2, 6: 3, 7: 3, 8: 4, 9: 4, 10: 5, 11: 3, 12: 2}[i]
        for dy in range(-r, r + 1):
            for dx in range(-r, r + 1):
                d = math.hypot(dx, dy)
                if d <= r + .3: f.set(hx + 1 + dx, hy + dy, 'f' if d <= r*.45 else ('c' if d <= r*.8 else 'd'))
    if 3 <= i <= 12: sparkle(f, cx, 34, i, 7, 16 + (i - 3)*.6)
    if i == 10:                                                               # the flash of the domain: a cyan ring races out round him with rays
        for k in range(48):
            a = 6.2832*k/48
            if k % 5 != 4: f.set(cx + math.cos(a)*22, 34 + math.sin(a)*19, 'c'); f.set(cx + math.cos(a)*24, 34 + math.sin(a)*21, 'd')
        for k in range(10): a = 6.2832*k/10 + .3; [f.set(cx + math.cos(a)*q, 34 + math.sin(a)*q*.9, 'f' if q < 20 else 'c') for q in range(10, 30, 2)]
    if i == 11:
        for k in range(48):
            a = 6.2832*k/48
            if k % 6 != 5: f.set(cx + math.cos(a)*31, 34 + math.sin(a)*27, 'd')
    return f, (hx, hy), fh
# ---------------------------------------------------------------- v1.50 YUJI'S HOMETOWN DOMAIN (strip atk32, INHERITENCE only: the game gives it spiky hair): the DOMAIN EXPANSION hand sign of the reference picture. The near hand rises to his chin with the index and middle fingers stretched straight up (the other two folded under the thumb), the other forearm (a white wrap) crosses in front of his chest and meets it from below. 0 he stands as he was, 1-4 the hands come up and the fingers stretch, 5-10 HELD (he breathes, red cursed energy gathers round him and sparks climb off the fingertips; the game plays 0-10 and then keeps 5-10 going for as long as the cast lasts), 11-14 the hands come down again and the picture ends in the standing pose (the game plays them when the town opens)
PAL.update({'w': '#c9c3b4', 'v': '#a39d90'})                                 # the white wrap's shade and its folds
HS_N = {0: IDLE_N, 2: GUARD_N, 4: ((3.8, 5.2), (7.2, -1.2)), 6: ((4, 5.5), (7.6, -2.2)), 10: ((4, 5.5), (7.6, -2.2)), 12: GUARD_N, 14: IDLE_N}; HS_FA = {0: IDLE_F, 3: GUARD_F, 5: ((-1, 6), (-1.5, 9)), 10: ((-1, 6), (-1.5, 9)), 12: GUARD_F, 14: IDLE_F}      # (the near hand and the far arm start from the idle pose, so the first picture is the one he was standing in)
HS_FE = {0: (1.5, 4.5), 4: (-2.5, 8), 14: (-2.5, 8)}; HS_FW = {0: (4, 1), 4: (6.4, 1.2), 14: (6.4, 1.2)}
def hs_top(i):
    def top(f, sx, sy):                                                        # over the near arm: the far forearm (a white wrap with folds) rising from his belly to the near wrist, then the near hand again on top of it with the two raised fingers (index and middle, close together) and a thumb across the folded ones
        S1 = (36+sx, 31+sy); fe, fw = kv(HS_FE, i), kv(HS_FW, i); wk = kv({0: 0, 2: 0, 3: .5, 5: 1, 10: 1, 12: .4, 13: 0}, i); E = (S1[0]+fe[0], S1[1]+fe[1]); Wr = (E[0] + (S1[0]+fw[0]-E[0])*wk, E[1] + (S1[1]+fw[1]-E[1])*wk); d = unit(Wr[0]-E[0], Wr[1]-E[1])
        if wk > 0:                                                             # (the wrap grows out from his belly while the far arm comes up: nothing of it in the first pictures)
            m = seg(E, Wr, 3.8, 3.4) | disc(E[0], E[1], 1.9); f.fill(m, 'W')
            for x, y in m:
                if (x, y+1) not in m: f.set(x, y, 'w')
                elif (x, y-1) not in m: f.set(x, y, 'T')
                elif (x + y) % 3 == 0 and f.at(x, y) == 'W': f.set(x, y, 'v')
            f.rim(m, 'O'); hand = disc(Wr[0]+d[0]*1.8, Wr[1]+d[1]*1.8, 1.7); f.fill(hand, 'U'); f.rim(hand, 'O'); f.fill(hand, 'U')
        S0 = (34+sx, 31+sy); na = kv(HS_N, i); ne = (S0[0]+na[0][0], S0[1]+na[0][1]); nw = (S0[0]+na[1][0], S0[1]+na[1][1]); d = unit(nw[0]-ne[0], nw[1]-ne[1]); fc = (nw[0]+d[0]*1.6, nw[1]+d[1]*1.6)
        fist = disc(fc[0], fc[1], 1.9); f.fill(fist, 'S'); f.rim(fist, 'O'); f.fill(fist, 'S'); f.set(fc[0]-.4, fc[1]-1.3, 'T'); f.set(fc[0]+.3, fc[1]+1.4, 'U')
        L = 6.4*kv({0: 0, 2: .3, 4: 1, 11: 1, 13: .3, 14: 0}, i)
        if L >= 1:
            fd = unit(d[0]*.5 + .12, d[1]); pp = (-fd[1], fd[0]); b0 = (fc[0] + d[0]*.4, fc[1] - 1.0)
            for k, off in enumerate((-.95, .95)):
                p0 = (b0[0] + pp[0]*off, b0[1] + pp[1]*off); p1 = (p0[0] + fd[0]*L*(1 if k else .93), p0[1] + fd[1]*L*(1 if k else .93)); fm = seg(p0, p1, 1.5, 1.1) | disc(p0[0], p0[1], .9)
                f.fill(fm, 'S'); f.rim(fm, 'O'); f.fill(fm, 'S')
                for x, y in fm:
                    if (x-1, y) not in fm: f.set(x, y, 'T')
                    if (x+1, y) not in fm: f.set(x, y, 'U')
                f.set(p1[0], p1[1], 'T')
            f.set(fc[0] + 1.0, fc[1] + .2, 'U'); f.set(fc[0] + 1.0, fc[1] + 1.2, 'V')                          # (the thumb over the folded fingers)
    return top
def hs_params(i):
    br = round(.6 + .6*math.sin(2*math.pi*(i - 5)/6)) if 5 <= i <= 10 else 0         # (he breathes while the sign is held)
    return dict(by=round(kv({0: 0, 3: 2, 5: 2, 10: 2, 14: 0}, i)) + br, ln=round(kv({0: 0, 4: 2, 10: 2, 14: 1}, i)), hx=round(kv({0: 0, 4: -1, 10: -1, 14: 0}, i)), hd=round(kv({0: 0, 4: 1, 10: 1, 14: 0}, i)),
                lf=(round(kv({0: 34, 4: 38, 10: 38, 14: 34}, i)), GR, 0), lb=(round(kv({0: 31, 4: 28, 10: 28, 14: 31}, i)), GR, 0), na=kv(HS_N, i), fa=kv(HS_FA, i),
                hp=i*.9, hup=1 if 3 <= i <= 12 else 0, hback=0, blink=False, top=hs_top(i))
def hs_pose(i):
    P = hs_params(i); f, nh, fh = wbody(P); s = sil(f); cx = 34 + CH_X
    if 2 <= i <= 13: aura(f, s, i, 1 if i < 4 or i >= 13 else 2 if i < 6 or i >= 11 else 3)
    if 4 <= i <= 10:                                                           # red and black cursed energy gathering round him: it streams in from all round
        charge(f, round(nh[0]), round(nh[1]) - 5, ((i - 4) % 5)/5, i)
        for k in range(3):                                                    # sparks climbing off the fingertips
            px, py = round(nh[0]) + 1 + math.sin(i*.9 + k*2.1), round(nh[1]) - 7 - ((i*2 + k*3) % 9)
            if f.at(px, py) == '.': f.set(px, py, 'Y' if k == 0 else 'X')
    if 6 <= i <= 11:                                                           # embers drifting up off his back (only on empty pixels)
        rnd = random.Random(i*53 + 3)
        for k in range(7):
            px, py = cx - 2 + rnd.uniform(-10, 10), 40 - rnd.uniform(0, 13)
            if f.at(px, py) == '.': f.set(px, py, 'Y' if k % 4 == 0 else ('X' if k % 2 else 'z'))
    return f, nh, fh
# ---------------------------------------------------------------- the SPIN ELBOW (atk15, hit 48; cursed energy mode, BLUE while jumping): he leaps (frames 0-2, the enemy Yuji starts here; the player starts on frame 3 from his own jump), spins once in the air (3-8: the picture is squashed about his vertical axis like the spin reaction), unfolds leaning forward with the elbow cocked (9-10), drives the elbow down onto the enemy (the impact is frame 11) and lands in a crouch (12-14). 96-wide grid like the reactions (pack_sp)
SP_LIFT = [0, 6, 14, 20, 24, 26, 26, 24, 22, 20, 17, 14, 8, 2, 0]
SP_SQ = {4: .31, 5: -.81, 6: -.81, 7: .31}
def sp_params(i):
    if i == 0: P = dict(by=4, ln=1, lf=(36, GR, 0), lb=(30, GR, 0), na=GUARD_N, fa=GUARD_F)
    elif i == 1: P = dict(by=-1, ln=0, lf=(35, GR - 3, 25), lb=(31, GR - 4, 30), na=((2, -2), (4, -7)), fa=((1, -2), (3, -6)), hup=1)
    elif i <= 8: P = dict(by=-2, ln=0, hx=1, lf=(36, 52, 20), kf=(41, 47), lb=(31, 52, 25), kb=(36, 48), na=((4, 3), (2, 0)), fa=((3, 3), (1, 0)), hup=1, mo=i >= 4)
    elif i <= 11: P = dict(by=-1, ln=(5, 7, 8)[i - 9], hx=1, lf=(33, 49, 5), lb=(28, 47, -10), na=((6, 8), (3, 1)) if i >= 10 else ((3, 2), (4, -5)), fa=((3, 4), (6, 1)), hup=1, mo=True)
    else: P = dict(by=(6, 3, 0)[i - 12], ln=(3, 1, 0)[i - 12], lf=(36, GR, 0), lb=(30, GR, 0), na=GUARD_N if i < 14 else IDLE_N, fa=GUARD_F if i < 14 else IDLE_F)
    P.update(hp=i*.9, blink=False); return P
def spinf(i):
    P = sp_params(i); f, nh, fh = figure(P)
    if 4 <= i <= 7: streak(f, [(22, 37), (34, 29), (47, 37), (34, 45)], (1, 3, 3, 1), (0, .6, .9, .3), True)               # the white arc of the spin round him
    if i in (10, 11): sx, sy = 34 + P['ln'], 31 + P['by']; burst(f, round(sx + P['na'][0][0] + 2), round(sy + P['na'][0][1] + 1), 4 if i == 11 else 2)   # the elbow's blow
    gr = wide(f); nh, fh = (nh[0] + OFF, nh[1]), (fh[0] + OFF, fh[1]); sq = SP_SQ.get(i, 1)
    if sq != 1: gr = g_warp(gr, sq, AX); nh, fh = [(AX + (p[0] - AX)*sq, p[1]) for p in (nh, fh)]
    return gr, nh, fh
def pack_sp():
    fr = [spinf(i) for i in range(15)]; xs = [x for g, _, _ in fr for r in g for x, c in enumerate(r) if c != '.']; x0 = max(0, min(xs) - 1); x1 = min(W96 - 1, max(xs) + 1); w = x1 - x0 + 1
    return {'x0': x0, 'w': w, 'h': N, 'top': 0, 'cx': 34 + OFF, 'frames': [[''.join(r[x0:x0 + w]) for r in g] for g, _, _ in fr], 'hn': [[round(n[0] - x0, 1), round(n[1], 1)] for _, n, _ in fr], 'hf': [[round(h[0] - x0, 1), round(h[1], 1)] for _, _, h in fr], 'lift': SP_LIFT}
def pack(fn, x0, w, top, n=15):
    frames, hn, hf = [], [], []; sh = top
    for i in range(n):
        f, nh, fh = fn(i); rows = ['.'*w for _ in range(sh)] + [''.join(f.g[y][x0:x0+w]) for y in range(N)] + ['.'*w for _ in range(top)]
        frames.append(rows); hn.append([round(nh[0]-x0, 1), round(nh[1]+top, 1)]); hf.append([round(fh[0]-x0, 1), round(fh[1]+top, 1)])
    return frames, hn, hf
if __name__ == '__main__':
    X0, W = 16, 40; out = {'pal': PAL}
    for k, fn, top in (('idle', idle, 0), ('fwd', walk, 0), ('jump', jump, 4)):
        fr, hn, hf = pack(fn, X0, W, top); out[k] = {'x0': X0, 'w': W, 'h': N + (2*top), 'top': top, 'cx': 34, 'frames': fr, 'hn': hn, 'hf': hf}
        if k == 'jump': out[k]['lift'] = JL
    for k, fn, top, w in MOVES:
        fr, hn, hf = pack(fn, X0, w, top); out[k] = {'x0': X0, 'w': w, 'h': N + 2*top, 'top': top, 'cx': 34, 'frames': fr, 'hn': hn, 'hf': hf}
        if k == 'cjump': out[k]['lift'] = CJ_LIFT
    for k, fn, *xw in ATTACKS:                                              # (a move that reaches further than the usual 44 px strip has its own start column and width)
        x0, w = xw or (X0, 44); fr, hn, hf = pack(fn, x0, w, 0); out[k] = {'x0': x0, 'w': w, 'h': N, 'top': 0, 'cx': 34, 'frames': fr, 'hn': hn, 'hf': hf}
        if k == 'atk3': out[k]['lift'] = KICK_LIFT
        if k == 'atk13': out[k]['lift'] = UP_LIFT
        if k == 'atk14': out[k]['lift'] = FK_LIFT
        if k == 'atk17': out[k]['lift'] = BFK_LIFT
    for k, fn, x0, w in FATAL:                                              # v1.49 the pictures of the fatality (cutscene only)
        fr, hn, hf = pack(fn, x0, w, 0); out[k] = {'x0': x0, 'w': w, 'h': N, 'top': 0, 'cx': 34, 'frames': fr, 'hn': hn, 'hf': hf}
        if k == 'fx_dive': out[k]['lift'] = DV_LIFT
    for k in range(10): out['rx%d' % k] = pack_rx(k)
    out['atk15'] = pack_sp()                                                  # the SPIN ELBOW
    fr, hn, hf = pack(bf_charged, 20, 76, 0); out['atk19'] = {'x0': 20, 'w': 76, 'h': N, 'top': 0, 'cx': 34 + CH_X, 'frames': fr, 'hn': hn, 'hf': hf}      # v1.19 the CHARGED BLACK FLASH (96-wide grid, the body 8 px in)
    for k, fn in (('atk24', ct_blood), ('atk25', ct_shrine), ('atk26', ct_grab), ('atk27', ct_simple), ('atk32', hs_pose)):      # v1.21 the four CURSED TECHNIQUES (the same grid)
        fr, hn, hf = pack(fn, 20, 76, 0); out[k] = {'x0': 20, 'w': 76, 'h': N, 'top': 0, 'cx': 34 + CH_X, 'frames': fr, 'hn': hn, 'hf': hf}
        if k == 'atk27': out[k]['lift'] = SD_LIFT
    fr, hn, hf = pack(block, X0, 44, 0, 10); out['blk'] = {'x0': X0, 'w': 44, 'h': N, 'top': 0, 'cx': 34, 'frames': fr, 'hn': hn, 'hf': hf}      # BLOCK (10 frames)
    fr, hn, hf = pack(bwalk, X0, 44, 0); out['bfwd'] = {'x0': X0, 'w': 44, 'h': N, 'top': 0, 'cx': 34, 'frames': fr, 'hn': hn, 'hf': hf}      # walking with the guard up
    json.dump(out, open(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'yuji.json'), 'w'), separators=(',', ':'))
    for k in ('idle', 'fwd', 'jump', 'atk0', 'atk1', 'atk2', 'atk3', 'atk4', 'atk5', 'atk6', 'atk7', 'atk8', 'atk9', 'atk10', 'atk11', 'atk12', 'atk13', 'atk14', 'atk15', 'atk16', 'atk17', 'atk18', 'atk19', 'atk24', 'atk25', 'atk26', 'atk27', 'blk', 'bfwd', 'cdn', 'cidle', 'cfwd', 'cjump', 'dash0', 'dash1', 'dash2', 'dash3', 'run', *['rx%d' % j for j in range(10)]): print(k, len(out[k]['frames']), 'frames,', len({tuple(f) for f in out[k]['frames']}), 'distinct', 'x0', out[k]['x0'], 'w', out[k]['w'])
    if len(sys.argv) > 1:                                                  # contact sheets: python3 -B yuji_art.py sheets <dir>
        d = sys.argv[2]; z = 2
        for k in ('idle', 'fwd', 'jump', 'atk0', 'atk1', 'atk2', 'atk3', 'atk4', 'atk5', 'atk6', 'atk7', 'atk8', 'atk9', 'atk10', 'atk11', 'atk12', 'atk13', 'atk14', 'atk15', 'atk16', 'atk17', 'atk18', 'atk19', 'atk24', 'atk25', 'atk26', 'atk27', 'blk', 'bfwd', 'cdn', 'cidle', 'cfwd', 'cjump', 'dash0', 'dash1', 'dash2', 'dash3', 'run', *['rx%d' % j for j in range(10)]):
            s = out[k]; sheet = Image.new('RGB', (15*s['w']*z, s['h']*z), (40, 40, 70)); px = {c: tuple(int(PAL[c][j:j+2], 16) for j in (1, 3, 5)) for c in PAL}
            for n, rows in enumerate(s['frames']):
                for y, row in enumerate(rows):
                    for x, c in enumerate(row):
                        if c != '.': ImageDraw.Draw(sheet).rectangle([n*s['w']*z + x*z, y*z, n*s['w']*z + x*z + z-1, y*z + z-1], fill=px[c])
            sheet.save(os.path.join(d, 'sheet_' + k + '.png'))
