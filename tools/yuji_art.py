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
def ik(H, A, L1=9.0, L2=7.4):                    # two-bone leg: the knee bends forward (towards +x)
    dx, dy = A[0]-H[0], A[1]-H[1]; d = max(abs(L1-L2)+.05, min(math.hypot(dx, dy), L1+L2-.05)); a = math.atan2(dy, dx)
    b = math.acos(max(-1, min(1, (L1*L1 + d*d - L2*L2) / (2*L1*d)))); k1 = (H[0] + L1*math.cos(a+b), H[1] + L1*math.sin(a+b)); k2 = (H[0] + L1*math.cos(a-b), H[1] + L1*math.sin(a-b))
    return k1 if k1[0] > k2[0] else k2
def leg(f, H, A, near, ph, base, lit, shade):
    k = ik(H, A); w = (5.4, 4.8, 3.8) if near else (5, 4.4, 3.6)
    limb(f, H, k, (A[0], A[1]-1), w, base, lit, shade); f.fill(seg((A[0], A[1]-3.5), (A[0], A[1]), 3.5, 3.5), 'A'); shoe(f, A[0], A[1], near, ph)
def head_block(P):                               # hood, face and hair, drawn at the usual place; the caller shifts it
    f = F(); hp = P.get('hp', 0.0); up = P.get('hup', 0); back = P.get('hback', 0)
    Hd = pm([(29, 21), (36, 21), (38, 23), (38, 26), (30, 26), (28, 23)]); f.fill(Hd, 'r'); f.rim(Hd, 'O'); f.fill(Hd, 'r')
    f.line([(30, 22), (35, 22)], 'u'); f.line([(29, 25), (37, 25)], 's'); f.set(36, 23, 'g'); f.set(36, 25, 'g')
    face = pm([(31, 11), (38, 11), (39, 12), (39, 14), (40, 15), (41, 16), (40, 17), (40, 18), (39, 19), (39, 20), (37, 21), (33, 21), (31, 18), (30, 13)])
    f.fill(face, 'S'); f.rim(face, 'O'); f.fill(face, 'S')
    for x, y in face:
        if y >= 18 and x >= 36: f.set(x, y, 'U')
    tips = [(28 - back, 7 + round(math.sin(hp + 0.0))), (31 - back, 5 + round(math.sin(hp + 1.3)) - up), (34 - back, 4 + round(math.sin(hp + 2.6)) - up), (37 - back, 4 + round(math.sin(hp + 3.9)) - up), (40 - back, 6 + round(math.sin(hp + 5.2)))]
    top = {x: round(min(ty + (1.0*(tx-x) if x < tx else 2.4*(x-tx)) for tx, ty in tips)) for x in range(24, 42)}
    bot = {24: 11, 25: 12, 26: 14, 27: 15, 28: 16, 29: 17, 30: 18, 31: 18, 32: 14, 33: 14, 34: 11, 35: 11, 36: 11, 37: 11, 38: 11, 39: 10, 40: 10, 41: 9}
    hair = {(x, y) for x in range(24, 42) for y in range(top[x], bot[x]+1)} | {(35, 12), (37, 12), (37, 13), (39, 12)}
    f.fill(hair, 'I')
    for x, y in hair:
        if y == top[x]: f.set(x, y, 'H')
        elif y >= bot[x]-1 and x < 34: f.set(x, y, 'K')
        if 28 <= x <= 31 and y >= 14: f.set(x, y, 'k')
    for x in (32, 35, 38):
        for dx, dy in ((0, 1), (0, 2), (1, 3)):
            if (x+dx, top[x]+dy) in hair: f.set(x+dx, top[x]+dy, 'L')
    for x, y in ((35, 7), (36, 7), (37, 8), (30, 8), (31, 8), (29, 9)):
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
    fx, fy = 45 + sx + ff[0], 32.5 + sy + ff[1]                           # far arm: forward, dark, behind the body
    limb(f, (36+sx, 28+sy), (41+sx+ff[0]*.5, 34.5+sy+ff[1]*.5), (fx, fy), (4, 3.8, 3.4), 'B', 'C', 'A'); f.fill(seg((fx-1, fy+.5), (fx+.6, fy-.5), 3.8, 3.8), 't'); fist = disc(fx+2.2, fy-.7, 2.1); f.fill(fist, 'U'); f.rim(fist, 'O'); f.fill(fist, 'U')
    lb, lf = P['lb'], P['lf']; hipB, hipF = (32 + P.get('hx', 0), 43 + by), (34 + P.get('hx', 0), 43 + by)
    leg(f, hipB, lb[:2], False, lb[2], 'B', 'C', 'A')
    T = pm([(30+sx, 26+sy), (37+sx, 26+sy), (38+sx, 30+sy), (38, 38+sy), (37, 43+by), (31, 43+by), (30, 36+sy)]); f.fill(T, 'C'); f.bands(T, 'C', 'D', 'B'); f.rim(T, 'O'); f.fill(T, 'C'); f.bands(T, 'C', 'D', 'B')
    f.line([(31, 43+by), (37, 43+by)], 'A'); f.line([(31+sx, 28+sy), (31, 40+by)], 'D'); f.set(36, 33+sy, 'g')
    leg(f, hipF, lf[:2], True, lf[2], 'B', 'C', 'A')
    f.blit(head_block(P), sx, sy)
    wx, wy = 40 + sx + nf[0], 30.5 + sy + nf[1]                           # near arm: shoulder, elbow in front, forearm up to the fist
    limb(f, (33+sx, 28+sy), (36+sx+nf[0]*.5, 35.5+sy+nf[1]*.5), (wx, wy), (4.4, 4, 3.6), 'C', 'D', 'B'); f.fill(seg((wx-1.2, wy+1.5), (wx+.2, wy-.1), 4, 4), 's')
    fist = disc(wx+1.5, wy-1.3, 2.3); f.fill(fist, 'S'); f.rim(fist, 'O'); f.fill(fist, 'S'); f.line([(wx+1, wy), (wx+3, wy)], 'U'); f.set(wx, wy-2.5, 'T')
    for y in range(N):
        for x in range(N):
            pass
    out = [(x, y) for y in range(N) for x in range(N) if f.g[y][x] == '.' and any(f.at(x+dx, y+dy) != '.' for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)))]
    for x, y in out: f.set(x, y, 'O')
    f.g = f.g[1:] + [['.']*N]                                             # feet on row 62, as in Gojo's sprites
    near_h, far_h = (wx+1.5, wy-1.3-1), (fx+2.2, fy-.7-1)
    return f, near_h, far_h
GR = 59                                                                    # ankle row on the ground
def idle(i):
    ph = 2*math.pi*i/15
    P = dict(by=round(.5 + .5*math.sin(ph - 1.2)), ln=round(.6*math.sin(ph + 1)), nf=(round(.6*math.sin(2*ph)), round(.7*math.sin(ph + .6))), ff=(round(.6*math.sin(2*ph + 2)), round(.7*math.sin(ph + 2.2))),
             hp=ph*2, blink=i in (9, 10), lf=(38 + (1 if i in (5, 6, 7) else 0), GR - (1 if i in (6, 7) else 0), 0), lb=(26, GR, 0), hup=1 if i in (2, 3, 4) else 0)
    return figure(P)
def walk(i):
    ph = i/15; S = 5.0; L = 3.6
    def foot(p, base):
        p %= 1.0; x = base + S*math.cos(2*math.pi*p); lift = L*max(0.0, -math.sin(2*math.pi*p)); a = 20 if 0.36 <= p < 0.5 else (-8 if 0.5 <= p < 0.88 else 0)
        return (x, GR - lift, a)
    P = dict(by=round(.5 + .5*math.cos(4*math.pi*ph)), ln=1, nf=(0, round(math.sin(2*math.pi*ph))), ff=(0, -round(math.sin(2*math.pi*ph))), hp=ph*4*math.pi, hback=1, lf=foot(ph, 36), lb=foot(ph + .5, 28), blink=False)
    return figure(P)
JL = [0, 0, 0, 0, 10, 16, 20, 22, 22, 20, 16, 10, 0, 0, 0]                 # same lift curve as Gojo's jump
def jump(i):
    T = {0: (1, 0, (38, GR), (26, GR), 0, 1, 0), 1: (3, 1, (38, GR), (26, GR), 0, 2, 0), 2: (5, 2, (39, GR), (25, GR), 0, 3, 0), 3: (3, 1, (38, GR), (26, GR), 0, 1, 0),
         4: (-2, 0, (37, GR), (30, GR), 38, -1, 1), 5: (-1, 0, (40, GR-4), (32, GR-3), 20, -2, 1), 6: (-1, 0, (41, GR-7), (33, GR-6), 10, -3, 1), 7: (-1, 0, (42, GR-9), (34, GR-8), 0, -3, 1),
         8: (-1, 0, (42, GR-9), (33, GR-7), 0, -2, 1), 9: (-1, 0, (41, GR-6), (31, GR-5), 0, -1, 1), 10: (-1, 0, (40, GR-3), (29, GR-3), 10, 0, 0), 11: (-1, 0, (39, GR), (27, GR), 25, 0, 0),
         12: (3, 1, (38, GR), (25, GR), 0, 2, 0), 13: (4, 2, (39, GR), (24, GR), 0, 3, 0), 14: (1, 0, (38, GR), (26, GR), 0, 1, 0)}
    by, ln, lf, lb, ph, fy, up = T[i]
    return figure(dict(by=by, ln=ln, lf=lf + (ph,), lb=lb + (ph*.6,), nf=(0, fy), ff=(0, fy), hp=i*.9, hup=up, hback=1 if 4 <= i <= 9 else 0))
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
    json.dump(out, open(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'yuji.json'), 'w'), separators=(',', ':'))
    for k in ('idle', 'fwd', 'jump'): print(k, len(out[k]['frames']), 'frames,', len({tuple(f) for f in out[k]['frames']}), 'distinct')
    if len(sys.argv) > 1:                                                  # contact sheets: python3 -B yuji_art.py sheets <dir>
        d = sys.argv[2]; z = 2
        for k in ('idle', 'fwd', 'jump'):
            s = out[k]; sheet = Image.new('RGB', (15*s['w']*z, s['h']*z), (40, 40, 70)); px = {c: tuple(int(PAL[c][j:j+2], 16) for j in (1, 3, 5)) for c in PAL}
            for n, rows in enumerate(s['frames']):
                for y, row in enumerate(rows):
                    for x, c in enumerate(row):
                        if c != '.': ImageDraw.Draw(sheet).rectangle([n*s['w']*z + x*z, y*z, n*s['w']*z + x*z + z-1, y*z + z-1], fill=px[c])
            sheet.save(os.path.join(d, 'sheet_' + k + '.png'))
