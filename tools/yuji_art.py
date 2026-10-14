#!/usr/bin/env python3
"""Yuji Itadori in side view (facing right), 64x64 16-bit style like Gojo's sprites.
Writes yuji.json: idle (15 frames), fwd (15-frame walk; the game plays it backwards for walking back), jump (15 frames + the lift per frame).
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
    f.blit(head_block(P), sx, sy + 3)
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
ATTACKS = (('atk0', lambda i: hook(i, False)), ('atk1', lambda i: hook(i, True)), ('atk2', knee), ('atk3', kick3))
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
def pack(fn, x0, w, top):
    frames, hn, hf = [], [], []; sh = top
    for i in range(15):
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
    for k, fn in ATTACKS:
        fr, hn, hf = pack(fn, X0, 44, 0); out[k] = {'x0': X0, 'w': 44, 'h': N, 'top': 0, 'cx': 34, 'frames': fr, 'hn': hn, 'hf': hf}
        if k == 'atk3': out[k]['lift'] = KICK_LIFT
    json.dump(out, open(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'yuji.json'), 'w'), separators=(',', ':'))
    for k in ('idle', 'fwd', 'jump', 'atk0', 'atk1', 'atk2', 'atk3', 'cdn', 'cidle', 'cfwd', 'cjump', 'dash0', 'dash1', 'dash2', 'dash3', 'run'): print(k, len(out[k]['frames']), 'frames,', len({tuple(f) for f in out[k]['frames']}), 'distinct')
    if len(sys.argv) > 1:                                                  # contact sheets: python3 -B yuji_art.py sheets <dir>
        d = sys.argv[2]; z = 2
        for k in ('idle', 'fwd', 'jump', 'atk0', 'atk1', 'atk2', 'atk3', 'cdn', 'cidle', 'cfwd', 'cjump', 'dash0', 'dash1', 'dash2', 'dash3', 'run'):
            s = out[k]; sheet = Image.new('RGB', (15*s['w']*z, s['h']*z), (40, 40, 70)); px = {c: tuple(int(PAL[c][j:j+2], 16) for j in (1, 3, 5)) for c in PAL}
            for n, rows in enumerate(s['frames']):
                for y, row in enumerate(rows):
                    for x, c in enumerate(row):
                        if c != '.': ImageDraw.Draw(sheet).rectangle([n*s['w']*z + x*z, y*z, n*s['w']*z + x*z + z-1, y*z + z-1], fill=px[c])
            sheet.save(os.path.join(d, 'sheet_' + k + '.png'))
