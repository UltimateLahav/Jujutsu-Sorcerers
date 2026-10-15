#!/usr/bin/env python3
"""Yuji Itadori in side view (facing right), 64x64 16-bit style like Gojo's sprites.
Writes yuji.json (also atk0-atk3 = the M1, atk4 = DIVERGENT FIST, atk5-atk8 = the cursed energy M1 (roundhouse, elbow, downslam, push kick), atk9 = CONCENTRATED FIST, atk10 = the SWEEP, atk11 = the POWER-UP (switching cursed energy on), atk12 = RUSH FIST (the super fast DIVERGENT FIST on the run), blk = BLOCK (10 frames) and bfwd = walking with the guard up): idle (15 frames), fwd (15-frame walk; the game plays it backwards for walking back), jump (15 frames + the lift per frame).
Every frame is drawn from joints: hips, a two-bone IK for each leg, shoulders, a boxer's guard for the arms, hair tufts that move."""
import json, math, os, sys
from PIL import Image, ImageDraw
N = 64
PAL = {'O': '#0e0a1a', 'A': '#0e0c1e', 'B': '#1a1e3c', 'C': '#28305c', 'D': '#3e4a80', 'E': '#6070b8', 'r': '#b02834', 's': '#7c1c2c', 't': '#541424', 'u': '#e25454', 'g': '#deb040',
       'S': '#eec7b4', 'T': '#fbe3d4', 'U': '#d1a08f', 'V': '#a06d68', 'H': '#f8c8cc', 'I': '#e49aa0', 'K': '#c47482', 'L': '#8c4e60', 'k': '#362432',
       'P': '#541424', 'Q': '#aa3636', 'R': '#d66060', 'W': '#ececf0', 'e': '#0e0a1a'}
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
def jump(i):
    G = GR
    T = {0: (1, 0, (34, G), (31, G), 0, 1, 0), 1: (3, 1, (34, G), (31, G), 0, 2, 0), 2: (5, 2, (36, G), (30, G), 0, 3, 0), 3: (3, 1, (34, G), (31, G), 0, 1, 0),
         4: (-2, 0, (34, G), (32, G), 38, -1, 1), 5: (-1, 0, (37, G-4), (32, G-3), 20, -2, 1), 6: (-1, 0, (38, G-7), (33, G-6), 10, -3, 1), 7: (-1, 0, (39, G-9), (34, G-8), 0, -3, 1),
         8: (-1, 0, (39, G-9), (33, G-7), 0, -2, 1), 9: (-1, 0, (38, G-6), (32, G-5), 0, -1, 1), 10: (-1, 0, (37, G-3), (31, G-3), 10, 0, 0), 11: (-1, 0, (36, G), (31, G), 25, 0, 0),
         12: (3, 1, (34, G), (30, G), 0, 2, 0), 13: (4, 2, (36, G), (29, G), 0, 3, 0), 14: (1, 0, (34, G), (31, G), 0, 1, 0)}
    by, ln, lf, lb, ph, fy, up = T[i]
    return figure(dict(by=by, ln=ln, lf=lf + (ph,), lb=lb + (ph*.6,), nf=(0, fy), ff=(0, fy), hp=i*.9, hup=up, hback=1 if 4 <= i <= 9 else 0))
def mix(a, b, t):
    return tuple(mix(x, y, t) for x, y in zip(a, b)) if isinstance(a, tuple) else a + (b - a)*t
def kv(keys, i):                                  # keyframes {frame: value} -> the value at frame i, eased between the keys (tuples are mixed part by part)
    ks = sorted(keys.items())
    if i <= ks[0][0]: return ks[0][1]
    for (a, va), (b, vb) in zip(ks, ks[1:]):
        if a <= i <= b: t = (i-a)/(b-a); return mix(va, vb, t*t*(3-2*t))
    return ks[-1][1]
IDLE_N, IDLE_F = ((0.0, 6.5), (0.6, 10.0)), ((-.5, 5), (-.5, 7)); GUARD_N, GUARD_F = ((3, 4), (6, 0)), ((1.5, 4.5), (4, 1))
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
ATTACKS = (('atk0', lambda i: hook(i, False)), ('atk1', lambda i: hook(i, True)), ('atk2', knee), ('atk3', kick3), ('atk4', divergent), ('atk5', rkick, 16, 48), ('atk6', elbow), ('atk7', downslam), ('atk8', pushkick), ('atk9', conc), ('atk10', sweep, 12, 52), ('atk11', powerup), ('atk12', rush, 16, 48))
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
MOVES = (('cdn', cdn, 0, 44), ('cidle', cidle, 0, 44), ('cfwd', cwalk, 0, 44), ('cjump', cjump, 4, 44), ('dash0', lambda i: dash(i, 0), 0, 44), ('dash1', lambda i: dash(i, 1), 0, 44), ('dash2', lambda i: dash(i, 2), 0, 44), ('dash3', lambda i: dash(i, 3), 0, 44), ('run', yrun, 0, 44))
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
    for k in range(10): out['rx%d' % k] = pack_rx(k)
    fr, hn, hf = pack(block, X0, 44, 0, 10); out['blk'] = {'x0': X0, 'w': 44, 'h': N, 'top': 0, 'cx': 34, 'frames': fr, 'hn': hn, 'hf': hf}      # BLOCK (10 frames)
    fr, hn, hf = pack(bwalk, X0, 44, 0); out['bfwd'] = {'x0': X0, 'w': 44, 'h': N, 'top': 0, 'cx': 34, 'frames': fr, 'hn': hn, 'hf': hf}      # walking with the guard up
    json.dump(out, open(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'yuji.json'), 'w'), separators=(',', ':'))
    for k in ('idle', 'fwd', 'jump', 'atk0', 'atk1', 'atk2', 'atk3', 'atk4', 'atk5', 'atk6', 'atk7', 'atk8', 'atk9', 'atk10', 'atk11', 'atk12', 'blk', 'bfwd', 'cdn', 'cidle', 'cfwd', 'cjump', 'dash0', 'dash1', 'dash2', 'dash3', 'run', *['rx%d' % j for j in range(10)]): print(k, len(out[k]['frames']), 'frames,', len({tuple(f) for f in out[k]['frames']}), 'distinct', 'x0', out[k]['x0'], 'w', out[k]['w'])
    if len(sys.argv) > 1:                                                  # contact sheets: python3 -B yuji_art.py sheets <dir>
        d = sys.argv[2]; z = 2
        for k in ('idle', 'fwd', 'jump', 'atk0', 'atk1', 'atk2', 'atk3', 'atk4', 'atk5', 'atk6', 'atk7', 'atk8', 'atk9', 'atk10', 'atk11', 'atk12', 'blk', 'bfwd', 'cdn', 'cidle', 'cfwd', 'cjump', 'dash0', 'dash1', 'dash2', 'dash3', 'run', *['rx%d' % j for j in range(10)]):
            s = out[k]; sheet = Image.new('RGB', (15*s['w']*z, s['h']*z), (40, 40, 70)); px = {c: tuple(int(PAL[c][j:j+2], 16) for j in (1, 3, 5)) for c in PAL}
            for n, rows in enumerate(s['frames']):
                for y, row in enumerate(rows):
                    for x, c in enumerate(row):
                        if c != '.': ImageDraw.Draw(sheet).rectangle([n*s['w']*z + x*z, y*z, n*s['w']*z + x*z + z-1, y*z + z-1], fill=px[c])
            sheet.save(os.path.join(d, 'sheet_' + k + '.png'))
