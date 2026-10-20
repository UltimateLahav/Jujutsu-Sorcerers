"""v1.27: the five curses that had moves in the game since v1.10 but no pictures (CDEF in template.html): BONE HOUND, LANTERN WRAITH, STITCH DOLL,
BLADE MANTIS and SHELL CRAB, drawn with the shaded paint box of pxart.py (rounded, lit parts with ramps of colours, rim light, contact shadows, glow, an outline).
It ADDS them to curses.json (the five older curses stay as they are: the program that drew their v1.10 look is not in this folder, so never run curse_art.py's own
main() again, it would overwrite them with the v1.00 pictures).
Run from this folder:  python3 -B curse_art2.py            (adds the five to curses.json, about a minute)
                       python3 -B curse_art2.py sheet.png  (also writes a contact sheet per curse to look at)
Same rules as before: every figure faces RIGHT and stands on the row G of its canvas; an attack is 10 frames and the blow lands on frame 5 (imp in CDEF);
idle and walk are 8 frames, hurt is 3. A figure function draws one picture from a dict of pose numbers; an animation is a list of key poses mixed smoothly (track)."""
import json, math, sys
import numpy as np
from PIL import Image
from curse_art import track
from pxart import Spr, ramp, pack, rgb

rad = math.radians
def A10(rest, wind, strike, follow=None):
    """the 10-frame blow: stand, wind up (peak on frame 3), strike (frame 5), follow through, recover"""
    return (10, False, [(0, rest), (3 / 9, wind), (5 / 9, strike), (7 / 9, follow if follow is not None else strike), (1, rest)])
def fk(x, y, angs, lens):
    """a chain of bones from (x, y): angle in degrees (0 = right, 90 = down) and length for every bone -> all the points"""
    pts = [(x, y)]
    for a, l in zip(angs, lens): pts.append((pts[-1][0] + math.cos(rad(a)) * l, pts[-1][1] + math.sin(rad(a)) * l))
    return pts
SWOOSH = ramp('#d8f4ff', dark=.5, light=1.08, hs=-6)
def swoosh(S, cx, cy, r, a0, a1, w=6):
    """a crescent round (cx, cy): from angle a0 to a1, thin at both ends and w wide in the middle, with a few dots of the tail behind it"""
    n = 16; ang = [a0 + (a1 - a0) * i / n for i in range(n + 1)]; wd = [w * math.sin(math.pi * (i / n) ** .85) for i in range(n + 1)]
    S.paint(S.poly([(cx + math.cos(rad(a)) * r, cy + math.sin(rad(a)) * r) for a in ang] + [(cx + math.cos(rad(a)) * (r - d), cy + math.sin(rad(a)) * (r - d)) for a, d in zip(ang[::-1], wd[::-1])]), SWOOSH, R=1.8, amb=.75, rim=False, shadow=0, alpha=.92)
    sg = 1 if a1 > a0 else -1
    for k in range(7): a = a0 - sg * (4 + k * 3.6); S.px(cx + math.cos(rad(a)) * (r - 1.5 - k * .15), cy + math.sin(rad(a)) * (r - 1.5 - k * .15), '#dff6ff' if k % 2 else '#8fd8ff')
def build(fig, base, anims):
    return {name: [fig(P).finish() for P in track([(t, {**base, **kw}) for t, kw in keys], n, loop)] for name, (n, loop, keys) in anims.items()}

# ------------------------------------------------------------------ 1. BONE HOUND (a skeleton dog with a red rag round its neck: snap, pounce, bone shards)
BONE = ramp('#cdbf9d', dark=.2, light=1.3, hs=-24, hl=6); BONE_F = ramp('#a09680', dark=.16, light=1.15, hs=-24, hl=4)      # (the far side is darker)
VOID = ramp('#4a1218', dark=.18, light=1.7, hs=-10, hl=10); RAG = ramp('#b3282e', dark=.22, light=1.35, hs=-14, hl=8); EMBER = ramp('#ff5a22', dark=.5, light=1.45)
DARK = ramp('#2a1c18', dark=.4, light=1.6)
def hound(P):
    K = .7; S = Spr(round(176 * K), round(120 * K), K); b = P['bob'] + P['cr'] + 16; L = P['lean']; st = P['st']; tp = P['tp']
    hip = (46 - st * .5, 46 + b); sho = (90 + L + st * .5, 44 + b)
    wv = [math.sin(tp * 1.3 + i * .9) * (2 + P['tail'] * .12) for i in range(6)]
    # the bony tail
    tx, ty = hip[0] - 8, hip[1] - 3
    for k in range(10):
        a = 200 + k * 7 + P['tail'] * math.sin(k * .7 + tp); nx, ny = tx + math.cos(rad(a)) * 4.4, ty + math.sin(rad(a)) * 4.4
        S.paint(S.seg(tx, ty, nx, ny, 2.4 - k * .12, 2.3 - k * .12), BONE, R=1.6); S.paint(S.ell(nx, ny, 2.9 - k * .16, 2.9 - k * .16), BONE, R=1.8); tx, ty = nx, ny
    for k in range(3): S.px(tx + 3 + k, ty - 4 - k * 2, '#ff7a30')
    def leg(x, y, A, rp, ln=(15, 14, 12), rr=(2.6, 2.1, 1.7)):
        p = fk(x, y, A, ln); S.paint(S.seg(*p[0], *p[1], rr[0], rr[1]), rp, R=2.4); S.paint(S.seg(*p[1], *p[2], rr[1], rr[2]), rp, R=2); S.paint(S.seg(*p[2], *p[3], rr[2], rr[2] - .1), rp, R=1.6)
        S.paint(S.ell(*p[1], 3.2, 3.2), rp, R=2.6); S.paint(S.ell(*p[2], 2.7, 2.7), rp, R=2.2); S.paint(S.ell(p[3][0] + 2, p[3][1] - .6, 4.6, 2.4), rp, R=2)
        for k in range(3): S.paint(S.poly([(p[3][0] + 4 + k * 1.6, p[3][1] - 1.5 + k * .4), (p[3][0] + 7.5 + k * 1.2, p[3][1] + .8), (p[3][0] + 4 + k * 1.6, p[3][1] + 1.2)]), rp, R=.8, rim=False, shadow=0)
        return p
    sw, kn, alt = P['sw'], P['kn'], P['alt']; fs = (2 * alt - 1)
    leg(hip[0] - 2, hip[1] + 3, (70 + sw * fs, 112 + sw * fs * .5 - kn, 88), BONE_F, (16, 14, 11)); leg(sho[0] - 8, sho[1] + 5, (98 - sw * fs, 82 - sw * fs * .5 - kn, 96), BONE_F, (15, 13, 11))
    # pelvis, the spine with its spikes, the ribs
    S.paint(S.U(S.ell(hip[0], hip[1] + 1, 9, 9.5), S.poly([(hip[0] - 6, hip[1] - 8), (hip[0] + 4, hip[1] - 12), (hip[0] + 8, hip[1] - 2)])), BONE, R=4)
    sp = [(hip[0] + (sho[0] - hip[0]) * k / 9, hip[1] - 4 - math.sin(k / 9 * math.pi) * 2.5) for k in range(10)]
    S.paint(S.chain(sp, 2.6, 2.6), BONE, R=2.2)
    for i, (x, y) in enumerate(sp):
        S.paint(S.ell(x, y, 2.9, 2.9), BONE, R=2.4)
        if i % 2 == 0: S.paint(S.poly([(x - 2.2, y - 2), (x + 1.2, y - 9 - (i % 4) * 1.5 - 2), (x + 3, y - 2)]), BONE, R=1.6, rim=False)
    S.paint(S.ell(sho[0] - 12, sho[1] + 10, 19, 12), VOID, R=9, amb=.35, rim=False, shadow=.6)
    for i in range(8):
        ax, ay = sp[min(9, 2 + i)][0], sp[min(9, 2 + i)][1]; ln = 21 - abs(i - 3) * 1.4
        S.paint(S.line([(ax, ay), (ax + 4, ay + 6), (ax + 5.5, ay + ln * .62), (ax + 3.2, ay + ln)], 2.4), BONE, R=1.3)
    S.paint(S.line([(sp[2][0] + 3, sp[2][1] + 19), (sp[6][0] + 3, sp[6][1] + 21), (sho[0] + 3, sho[1] + 18)], 2.6), BONE, R=1.4)      # the breastbone
    leg(hip[0] + 4, hip[1] + 3, (70 - sw, 112 - sw * .5 - kn, 88), BONE, (16, 14, 11)); leg(sho[0] - 2, sho[1] + 5, (98 + sw, 82 + sw * .5 - kn, 96), BONE, (15, 13, 11))
    # the neck, the skull and the jaws
    hx, hy = sho[0] + 15 + st * .2, sho[1] - 9 + P['hd']
    S.paint(S.chain([(sho[0] + 2, sho[1] - 5), ((sho[0] + hx) / 2 + 1, (sho[1] + hy) / 2 - 4), (hx - 2, hy + 2)], 4, 4.5), BONE, R=3)
    for k in range(3): S.paint(S.ell(sho[0] + 3 + k * 4.5, sho[1] - 6 - k * 1.5 + (hy - sho[1] + 9) * k / 7, 3, 3), BONE, R=2.4)
    n0 = (sho[0] + 6, sho[1] - 7)      # the red rag is knotted round the neck and its ends fly up and back
    top = [(n0[0] - i * 4.6, n0[1] - 2 - i * 1.5 + wv[i] * .7) for i in range(6)]; bot = [(n0[0] - i * 4.6 - 1, n0[1] + 4 - i * 2 + wv[i] * .7) for i in range(5, -1, -1)]
    S.paint(S.poly(top + bot), RAG, R=2.2, amb=.3, bump=lambda X, Y: (np.sin(X * .9) * .22, np.cos(X * .9) * .1)); S.paint(S.ell(n0[0], n0[1] + 1, 4, 6.5), RAG, R=3, amb=.3)
    jw = P['jaw']; jp = (hx + 2, hy + 5); jt = (hx + 25, hy + 8 + jw * 17)
    S.paint(S.seg(jp[0], jp[1], jt[0], jt[1], 3.2, 2.2), BONE_F, R=2.2)
    for k in range(5): xx = jp[0] + 7 + k * 3.6; yy = jp[1] + (jt[1] - jp[1]) * (xx - jp[0]) / (jt[0] - jp[0]); S.paint(S.poly([(xx - 1.2, yy - 1), (xx, yy - 4.4), (xx + 1.2, yy - 1)]), BONE, R=.9, rim=False, shadow=0)
    S.paint(S.ell(hx, hy, 11, 9.5), BONE, R=5); S.paint(S.seg(hx + 6, hy - 1, hx + 26, hy + 2.5, 6.4, 3.6), BONE, R=3.6); S.paint(S.ell(hx + 26, hy + 2.2, 3.4, 3.3), BONE, R=2.4)
    S.paint(S.ell(hx + 27, hy + .8, 1.6, 1.4), DARK, R=1, rim=False, shadow=0)
    for k in range(6): xx = hx + 11 + k * 2.9; S.paint(S.poly([(xx - 1.3, hy + 3.6), (xx + .2, hy + 7.6 - (k == 5) * 2), (xx + 1.5, hy + 3.4)]), BONE, R=.9, rim=False, shadow=0)
    S.paint(S.poly([(hx + 21, hy + 4), (hx + 22.2, hy + 11), (hx + 24, hy + 3.6)]), BONE, R=1, rim=False, shadow=0)      # the fang
    S.paint(S.ell(hx + 4, hy - 2.5, 4.3, 3.8), DARK, R=2.5, amb=.4, rim=False, shadow=.5)
    S.paint(S.ell(hx + 4.5, hy - 2.5, 2.2, 2), EMBER, emis=-1, rim=False, shadow=0); S.glow(hx + 4.5, hy - 2.5, 9, '#ff5522', .8, .35); S.px(hx + 3.5, hy - 3.4, '#fff0b0')
    S.paint(S.seg(hx - 1, hy - 7, hx + 8, hy - 6.4, 2, 1.4), BONE_F, R=1.4)
    for dx, h2, rp in ((-4, 15, BONE), (1, 12, BONE_F)): S.paint(S.poly([(hx + dx - 5, hy - 5), (hx + dx - 7 - h2 * .25, hy - 6 - h2), (hx + dx + 2, hy - 7)]), rp, R=2, rim=True)
    for k in range(3): S.line([(hx - 2 + k * 4, hy - 6), (hx - 1 + k * 4, hy - 1)], 1)
    S.paint(S.line([(hx + 1, hy - 7), (hx + 3, hy - 3), (hx + 1.5, hy)], 1.1), DARK, R=.6, rim=False, shadow=0, amb=.5)      # a crack in the skull
    if P['sh'] > .5:      # bone shards fly out of the open jaws
        for k, (dx, dy) in enumerate(((31, -2), (28, 5), (33, 9))): S.paint(S.poly([(hx + dx, hy + dy - 1.6), (hx + dx + 12, hy + dy + .4), (hx + dx, hy + dy + 1.8)]), BONE, R=1.2, rim=True); S.px(hx + dx + 11, hy + dy + .4, '#ffffff')
    for k in range(7): S.px(sp[1 + k][0] + math.sin(tp + k) * 3, sp[1 + k][1] - 14 - (k * 5 + tp * 3) % 12, '#ff6a2a' if k % 2 else '#ffb04a')      # embers rising off the back
    return S
HOUND_B = dict(bob=0, cr=0, lean=0, st=0, hd=0, jaw=.12, sw=0, kn=0, alt=1, tail=10, tp=0, sh=0)
HOUND = dict(
    idle=(8, True, [(0, {}), (.5, dict(bob=1, hd=1, jaw=.25, tail=16, tp=2.4))]),
    walk=(8, True, [(0, dict(sw=24, kn=7, bob=0, tp=0)), (.5, dict(sw=-24, kn=7, bob=-1.2, tp=3))]),
    a1=A10(dict(), dict(cr=2, lean=-5, hd=-2, jaw=.1), dict(lean=7, st=4, hd=3, jaw=1, cr=1), dict(lean=4, st=1, jaw=.5)),
    a2=A10(dict(), dict(cr=6, lean=-6, st=-3, sw=-6, hd=3, jaw=.1), dict(bob=-9, st=10, lean=8, jaw=1, sw=-58, alt=0, tail=4), dict(bob=-4, st=5, lean=6, jaw=.6, sw=-38, alt=0)),
    a3=A10(dict(), dict(cr=2, lean=-6, hd=-5, jaw=0), dict(lean=2, hd=-4, jaw=1, sh=1), dict(lean=1, hd=-1, jaw=.5, sh=0)),
    hurt=(3, False, [(0, dict(lean=-7, cr=3, jaw=1, hd=4, tail=2)), (1, dict(lean=-5, cr=2, jaw=.6, hd=3))]),
)

# ------------------------------------------------------------------ 2. LANTERN WRAITH (a hooded ghost with a lantern staff: swing, soul flame, fire pillar)
CLOTH = ramp('#2b6c86', dark=.15, light=1.5, hs=-20, hl=6); CLOTH_D = ramp('#17424f', dark=.13, light=1.35, hs=-16); HOODV = ramp('#05090f', dark=.5, light=2.4)
WOOD = ramp('#6b4a32', dark=.2, light=1.3); IRON = ramp('#6a7580', dark=.14, light=1.7, hs=-10, hl=10); FLAME = ramp('#ffd060', dark=.55, light=1.25)
CYAN = ramp('#7ff0ff', dark=.4, light=1.12); BONEC = ramp('#c4ced0', dark=.18, light=1.25, hs=-22, hl=4)
HEM = (0, 9, 3, 12, 5, 10, 2, 8)
def wraith(P):
    K = .8; S = Spr(round(152 * K), round(180 * K), K); b = P['bob'] + 26; L = P['lean']; sw = P['sw']; ax, ay = 56 + L * .5, 58 + b; fl = P['fl']
    def robe(dx, wid, rp, sway, bumpA):
        pts = [(ax + dx - 15 * wid, ay - 6), (ax + dx - 22 * wid + sway * .3, ay + 24), (ax + dx - 28 * wid + sway * .7, ay + 52), (ax + dx - 27 * wid + sway, 126 + b)]
        pts += [(ax + dx - 25 * wid + sway + k * (50 * wid / 7), 124 + b + HEM[k] * (1 + sway * .02)) for k in range(8)]
        pts += [(ax + dx + 27 * wid + sway, 126 + b), (ax + dx + 28 * wid + sway * .7, ay + 52), (ax + dx + 22 * wid + sway * .3, ay + 24), (ax + dx + 15 * wid, ay - 6)]
        return S.paint(S.poly(pts), rp, R=9, amb=.18, bump=lambda X, Y: (np.cos((X - ax) * .6 + (Y - ay) * .035 + bumpA) * .34 * (Y > ay), np.zeros_like(X)))
    robe(-9 - sw * .4, 1.12, CLOTH_D, sw * 1.7, 1.7)      # the cloak that trails behind
    for k in range(3): S.paint(S.poly([(ax - 30 + k * 4 + sw * 1.4, 112 + b), (ax - 22 + k * 4 + sw * 1.2, 120 + b), (ax - 27 - k * 3 + sw * 2.2, 140 + b + k * 2)]), CLOTH_D, R=2, alpha=.55)      # wisps of it
    robe(0, 1, CLOTH, sw, 0)
    for k in range(5): S.paint(S.poly([(ax - 17 + k * 8, ay + 34 + k % 2 * 3), (ax - 12 + k * 8, ay + 34 + k % 2 * 3), (ax - 14 + k * 8 + sw * .1, ay + 45 + (k * 3) % 5)]), CLOTH, R=1.8, rim=False, shadow=.8)      # a frayed sash
    S.paint(S.line([(ax - 25 + sw * .5, ay + 30), (ax, ay + 35), (ax + 25 + sw * .5, ay + 30)], 2.2), WOOD, R=1.2)      # a cord belt
    for dx, hh in ((-10, 12), (9, 9)): S.paint(S.seg(ax + dx, ay + 33, ax + dx + sw * .3, ay + 33 + hh, .8, .8), WOOD, R=.8); S.paint(S.ell(ax + dx + sw * .3, ay + 36 + hh, 3, 3.4), BONEC, R=2.4); S.px(ax + dx + sw * .3 - 1, ay + 36 + hh, '#06101a'); S.px(ax + dx + sw * .3 + 1, ay + 36 + hh, '#06101a')      # two little skulls on strings
    S.paint(S.ell(ax + 1, ay, 24, 11), CLOTH, R=7, amb=.22, bump=lambda X, Y: (np.cos((X - ax) * .8) * .3, np.zeros_like(X)))      # the shoulders
    for k in range(7): S.paint(S.poly([(ax - 22 + k * 7, ay + 6), (ax - 17 + k * 7, ay + 6), (ax - 19.5 + k * 7, ay + 12 + k % 3 * 2)]), CLOTH, R=1.4, rim=False, shadow=.85)
    hx, hy = ax + 3 + L * .2, ay - 22      # the hood
    S.paint(S.U(S.ell(hx, hy, 15, 17), S.poly([(hx - 11, hy - 8), (hx + 2 + P['ht'], hy - 36), (hx + 14, hy - 8)]), S.ell(hx - 3, hy + 6, 15, 10)), CLOTH, R=7, amb=.2, bump=lambda X, Y: (np.cos((X - hx) * .7) * .22, np.zeros_like(X)))
    S.paint(S.ell(hx + 7, hy + 2, 10.5, 14), HOODV, R=7, amb=.3, rim=False, shadow=.5)
    for ex in (3.5, 12.5): S.paint(S.ell(hx + ex + 1, hy - 1, 2.8, 1.7, -18 if ex < 8 else 18), CYAN, emis=-1, rim=False, shadow=0); S.glow(hx + ex + 1, hy - 1, 7, '#9ff8ff', .8, .4)
    S.paint(S.line([(hx - 4, hy - 14), (hx + 1, hy - 24), (hx + 3 + P['ht'], hy - 33)], 1.2), CLOTH, R=.7, lift=.35, rim=False, shadow=0)      # the fold of the peak, lit
    # the arm, the skeleton hand, the staff and the lantern
    sh0 = (ax + 15, ay + 3); p = fk(sh0[0], sh0[1], (P['ua'], P['la']), (16, 15)); hnd = p[2]
    top = (hnd[0] + math.cos(rad(-90 + P['sa'])) * 36, hnd[1] + math.sin(rad(-90 + P['sa'])) * 36); bot = (hnd[0] + math.cos(rad(90 + P['sa'])) * 42, hnd[1] + math.sin(rad(90 + P['sa'])) * 42)
    S.paint(S.seg(*top, *bot, 1.9, 2.3), WOOD, R=1.6, bump=lambda X, Y: (np.sin(Y * .9) * .12, np.zeros_like(X)))
    for k in (.35, .62): S.paint(S.ell(top[0] + (bot[0] - top[0]) * k, top[1] + (bot[1] - top[1]) * k, 2.9, 2.2), WOOD, R=1.6)
    S.paint(S.chain([sh0, p[1], p[2]], 6.2, 4.4), CLOTH, R=3.4, amb=.2); S.paint(S.ell(*p[1], 5.6, 5.6), CLOTH, R=3.4)
    S.paint(S.poly([(p[2][0] - 5, p[2][1] - 4), (p[2][0] + 6, p[2][1] - 3), (p[2][0] + 8, p[2][1] + 6), (p[2][0] - 6, p[2][1] + 5)]), CLOTH_D, R=2.4, amb=.2)      # a wide cuff
    S.paint(S.ell(hnd[0] + 1, hnd[1], 3.6, 3), BONEC, R=2.2)
    for k, (da, ll) in enumerate(((10, 6), (28, 6.4), (46, 5.6))):
        a1 = P['sa'] + 90 + da; f = (hnd[0] + math.cos(rad(a1)) * ll, hnd[1] + math.sin(rad(a1)) * ll); S.paint(S.seg(hnd[0], hnd[1], *f, 1.3, 1.05), BONEC, R=1.1); S.paint(S.ell(*f, 1.6, 1.6), BONEC, R=1.2)
    lx, ly = top[0] + math.cos(rad(90 + P['sa'] * .5)) * 9, top[1] + math.sin(rad(90 + P['sa'] * .5)) * 9
    S.paint(S.poly([(top[0] - 3, top[1] - 1), (top[0] + 3, top[1] - 1), (lx + 1.5, ly - 6), (lx - 1.5, ly - 6)]), IRON, R=1.2)
    S.paint(S.poly([(lx - 5.2, ly - 6), (lx + 5.2, ly - 6), (lx + 3.6, ly - 9.8), (lx - 3.6, ly - 9.8)]), IRON, R=1.6, spec=8); S.paint(S.poly([(lx - 5.4, ly + 8), (lx + 5.4, ly + 8), (lx + 3.6, ly + 11.5), (lx - 3.6, ly + 11.5)]), IRON, R=1.6, spec=8)
    S.paint(S.poly([(lx - 4.6, ly - 6), (lx + 4.6, ly - 6), (lx + 4.6, ly + 8), (lx - 4.6, ly + 8)]), CYAN, emis=-2, rim=False, shadow=0)
    S.paint(S.ell(lx, ly + 1.4, 2.4 + fl * 1.6, 4 + fl * 2, 0), FLAME, emis=-1, rim=False, shadow=0)
    for dx in (-4.6, -1.5, 1.5, 4.6): S.paint(S.seg(lx + dx, ly - 6, lx + dx, ly + 8, .6, .6), IRON, R=.6, rim=False, shadow=0)
    S.glow(lx, ly + 1, 17 + fl * 12, '#6cf3ff', .9 + fl * .3, .4)
    if P['sl'] > .45: swoosh(S, sh0[0], sh0[1], 48, -128, 14, 7)
    S.a &= ~((S.Y > (118 + b) * S.K) & (S.bay + .5 < (S.Y / S.K - (118 + b)) / 24))      # the hem of the ghost fades away
    for k in range(5): S.px(lx + math.sin(k * 2.1 + sw) * (6 + k * 2), ly - 12 - k * 4 - (k * 3 + sw * 2) % 5, '#bff8ff' if k % 2 else '#6cf3ff')      # soul sparks rising off the flame
    return S
WRAITH_B = dict(bob=0, lean=0, sw=0, ht=0, ua=64, la=-14, sa=0, fl=0, sl=0)
WRAITH = dict(
    idle=(8, True, [(0, {}), (.5, dict(bob=-2.5, sw=3.5, ht=2.5, sa=3, fl=.25))]),
    walk=(8, True, [(0, dict(sw=-8, lean=2.5, bob=0)), (.5, dict(sw=8, lean=-1, bob=-2.5))]),
    a1=A10(dict(), dict(lean=-5, ua=-60, la=-120, sa=-70, bob=-1), dict(lean=6, ua=30, la=5, sa=80, sl=1), dict(lean=3, ua=40, la=15, sa=60, sl=.8)),
    a2=A10(dict(), dict(lean=-4, ua=-30, la=-80, sa=-25, fl=.6, bob=-2), dict(lean=5, ua=25, la=-5, sa=40, fl=1.4), dict(lean=2, ua=40, la=0, sa=25, fl=.5)),
    a3=A10(dict(), dict(lean=-4, ua=-80, la=-40, sa=-10, fl=.5, bob=-3), dict(lean=5, ua=55, la=40, sa=0, fl=1, bob=2), dict(lean=3, ua=60, la=30, sa=0, fl=.5)),
    hurt=(3, False, [(0, dict(lean=-7, sw=-7, ht=-3, ua=100, la=40, sa=-10)), (1, dict(lean=-5, sw=-5, ua=90, la=20, sa=-5))]),
)

# ------------------------------------------------------------------ 3. STITCH DOLL (a patchwork rag doll with giant scissors and a needle: needle stab, scissor toss, spin slash)
BURLAP = ramp('#d6b48c', dark=.22, light=1.28, hs=-14, hl=8); BURLAP_D = ramp('#a07c58', dark=.2, light=1.2); RED = ramp('#b3303c', dark=.2, light=1.4); BLUE = ramp('#3d63a6', dark=.18, light=1.4)
MUST = ramp('#d9a53a', dark=.22, light=1.3); YARN = ramp('#d0562a', dark=.25, light=1.4); STEEL = ramp('#aab4c6', dark=.12, light=1.4, hs=-10, hl=6); STUFF = ramp('#f0ece0', dark=.45, light=1.1); THREAD = '#241410'
def dashes(S, p0, p1, col=THREAD, step=3.2):
    n = max(1, int(math.hypot(p1[0] - p0[0], p1[1] - p0[1]) / step))
    for i in range(n + 1): S.px(p0[0] + (p1[0] - p0[0]) * i / n, p0[1] + (p1[1] - p0[1]) * i / n, col)
def quad(S, cx, cy, w, h, rot=0, ch=1.3):      # a patch: a small rotated rectangle with cut corners
    c, s_ = math.cos(rad(rot)), math.sin(rad(rot)); pts = [(-w + ch, -h), (w - ch, -h), (w, -h + ch), (w, h - ch), (w - ch, h), (-w + ch, h), (-w, h - ch), (-w, -h + ch)]
    return S.poly([(cx + x * c - y * s_, cy + x * s_ + y * c) for x, y in pts])
def stitch_quad(S, cx, cy, w, h, rot=0):
    c, s_ = math.cos(rad(rot)), math.sin(rad(rot)); k = [(cx + x * c - y * s_, cy + x * s_ + y * c) for x, y in ((-w + .7, -h + .7), (w - .7, -h + .7), (w - .7, h - .7), (-w + .7, h - .7))]
    for i in range(4): dashes(S, k[i], k[(i + 1) % 4], THREAD, 2.6)
def doll(P):
    K = .86; S = Spr(round(158 * K), round(168 * K), K); oy = 34; b = P['bob'] + oy; L = P['lean']; gx = 44 + L * .3; weave = lambda X, Y: (np.sin(X * 2.2) * np.sin(Y * 2.2) * .12, np.cos(Y * 2.2) * np.sin(X * 2.2) * .12)
    ar0 = (gx - 9, 70 + b); S.paint(S.chain([ar0, (ar0[0] - 5, ar0[1] + 14), (ar0[0] - 3, ar0[1] + 27)], 5.4, 4.6), BURLAP_D, R=3.4, bump=weave); S.paint(S.ell(ar0[0] - 3, ar0[1] + 29, 5, 5.4), BURLAP_D, R=3)      # the far arm
    for dx, off, lift, rp in ((-6, P['legA'], P['liftA'], BURLAP_D), (7, P['legB'], P['liftB'], BURLAP)):
        hip = (gx + dx * .6, 96 + b); ft = (gx + dx + off, 114 + oy - lift)
        S.paint(S.seg(*hip, *ft, 7, 6.2), rp, R=4, bump=weave); S.paint(S.ell(ft[0] + 3, ft[1] + 5, 8, 5), rp, R=3.4, bump=weave)
        mid = ((hip[0] + ft[0]) / 2, (hip[1] + ft[1]) / 2); S.paint(quad(S, mid[0], mid[1], 5.2, 5, 10 * dx / 7), RED if dx > 0 else BLUE, R=1.8, bump=weave, shadow=.8); stitch_quad(S, mid[0], mid[1], 5.2, 5, 10 * dx / 7)      # a patch on the leg
        dashes(S, (ft[0] - 4, ft[1] + 5.5), (ft[0] + 10, ft[1] + 5.5))
    tor = S.ell(gx, 76 + b, 14, 19); S.paint(tor, BURLAP, R=9, bump=weave)
    for (cx0, cy0, w, h, rot, rp) in ((gx - 5, 68 + b, 7, 6.4, 8, RED), (gx + 5, 85 + b, 7.6, 6.6, -6, BLUE), (gx - 6, 91 + b, 5, 4.6, 14, MUST)):
        S.paint(S.I(quad(S, cx0, cy0, w, h, rot), tor), rp, R=1.8, bump=weave, shadow=.8); stitch_quad(S, cx0, cy0, w, h, rot)      # patches sewn on the body
    S.paint(S.line([(gx + 2, 66 + b), (gx + 4, 72 + b), (gx + 1, 77 + b)], 2.2), DARK_T, R=1, rim=False, shadow=0); S.paint(S.ell(gx + 6, 72 + b, 4.4, 3.6), STUFF, R=2.4); S.paint(S.ell(gx + 3, 69 + b, 3, 2.6), STUFF, R=2)      # a torn seam, the stuffing comes out
    for k in range(5): S.px(gx + 2 + k, 64 + b + k % 2 * 2, THREAD)
    S.px(gx - 1, 76 + b, '#201410'); S.paint(S.ell(gx - 1, 76 + b, 2.4, 2.4), DARK_T, R=1.4, rim=False)      # a button
    hx, hy = gx + 3 + L * .2 + P['hx'], 44 + b
    for i in range(7):
        a = -150 + i * 20 + P['hair'] * 3; tp0 = (hx + math.cos(rad(a)) * 12, hy + math.sin(rad(a)) * 12); tp1 = (hx + math.cos(rad(a)) * 21 + (i % 2 * 2 - 1) * 3, hy + math.sin(rad(a)) * 21)
        S.paint(S.chain([tp0, ((tp0[0] + tp1[0]) / 2 + 2, (tp0[1] + tp1[1]) / 2), tp1], 2.2, 1.4), YARN, R=1.6)
    S.paint(S.ell(hx - 13, hy + 2, 4.5, 5.5), BURLAP_D, R=2.8)      # an ear
    head = S.ell(hx, hy, 17, 16); S.paint(head, BURLAP, R=10, bump=weave); S.paint(S.I(quad(S, hx - 7, hy - 9, 7.4, 5.6, -12), head), RED, R=1.8, bump=weave, shadow=.8); stitch_quad(S, hx - 7, hy - 9, 7.4, 5.6, -12)      # the head and a patch on the forehead
    S.paint(S.ell(hx + 3, hy - 1, 4.6, 4.6), DARK_T, R=3, rim=True); S.px(hx + 2, hy - 2, '#ffffff'); S.px(hx + 4, hy - 1, '#3a2a24')      # the button eye
    dashes(S, (hx + 9, hy - 5), (hx + 14, hy), THREAD, 1.4); dashes(S, (hx + 14, hy - 5), (hx + 9, hy), THREAD, 1.4)      # the other eye is an X of thread
    S.paint(S.ell(hx + 9, hy + 5, 4.2, 3.2), RED, R=2.6, alpha=.6, rim=False)      # a rosy cheek
    mo = P['mo']; pts = [(hx - 5 + i * 3.4, hy + 8 + math.sin(i * .9 + .4) * 1.5 + mo * (1 - abs(i - 3) / 3)) for i in range(8)]
    for i in range(7): dashes(S, pts[i], pts[i + 1], THREAD, 1.1)
    for i in range(1, 7): dashes(S, (pts[i][0], pts[i][1] - 2), (pts[i][0], pts[i][1] + 2 + mo * .4), THREAD, 1.1)      # the stitched grin
    sh0 = (gx + 9, 66 + b); p = fk(sh0[0], sh0[1], (P['ua'], P['la']), (15, 14)); hnd = p[2]
    S.paint(S.chain([sh0, p[1], p[2]], 5.6, 4.8), BURLAP, R=3.6, bump=weave); S.paint(quad(S, p[1][0], p[1][1], 5, 5, 20), MUST, R=1.8, bump=weave); stitch_quad(S, p[1][0], p[1][1], 5, 5, 20); S.paint(S.ell(hnd[0] + 1, hnd[1], 5.4, 5.2), BURLAP, R=3.4, bump=weave)
    S.paint(quad(S, sh0[0], sh0[1], 5.6, 5.6, -10), BLUE, R=1.8, bump=weave); stitch_quad(S, sh0[0], sh0[1], 5.6, 5.6, -10)
    sa, op = P['sa'], P['op']
    if P['sc'] > .5:      # the giant scissors: two blades and two ring handles
        for sg in (-1, 1):
            ang = sa + sg * op * 20; tip = (hnd[0] + math.cos(rad(ang)) * 36, hnd[1] + math.sin(rad(ang)) * 36); q = ang + 90
            S.paint(S.poly([(hnd[0] + math.cos(rad(q)) * 2.6, hnd[1] + math.sin(rad(q)) * 2.6), tip, (hnd[0] - math.cos(rad(q)) * 2.6, hnd[1] - math.sin(rad(q)) * 2.6)]), STEEL, R=2.2, spec=10, dither=.15)
            hc = (hnd[0] + math.cos(rad(sa + 180 + sg * 30)) * 9, hnd[1] + math.sin(rad(sa + 180 + sg * 30)) * 9); S.paint(S.D(S.ell(*hc, 5, 4.2), S.ell(*hc, 2.6, 2)), RUSTY, R=1.8, spec=6)
        S.paint(S.ell(*hnd, 2.2, 2.2), RUSTY, R=1.6); star(S, hnd[0] + math.cos(rad(sa)) * 33, hnd[1] + math.sin(rad(sa)) * 33 - 1)
    if P['sl'] > .45: swoosh(S, hnd[0], hnd[1], 30, sa - 150, sa - 8, 6)
    if P['nd'] > .05:      # the needle, with its red thread
        tip = (hnd[0] + math.cos(rad(sa)) * (10 + P['nd'] * 32), hnd[1] + math.sin(rad(sa)) * (10 + P['nd'] * 32))
        S.paint(S.seg(hnd[0], hnd[1], *tip, 1.3, .7), STEEL, R=1.1, spec=10); S.paint(S.ell(hnd[0] - 1, hnd[1], 1.3, 2.2), STEEL, R=.9)
        for k in range(9): S.px(hnd[0] - 3 - k * 1.8, hnd[1] + 1 + math.sin(k * .8 + sa * .05) * 3 + k * .5, '#d03a3a')
        star(S, tip[0], tip[1])
    return S
DARK_T = ramp('#2a1c18', dark=.3, light=1.8); RUSTY = ramp('#8a96aa', dark=.12, light=1.5, hs=-10, hl=6)
def star(S, x, y):
    for dx, dy in ((0, 0), (1, 0), (-1, 0), (0, 1), (0, -1)): S.px(x + dx, y + dy, '#ffffff' if dx == dy == 0 else '#bfeaff')
    for k in (2, -2): S.px(x + k, y, '#8fd0ff'); S.px(x, y + k, '#8fd0ff')
DOLL_B = dict(bob=0, lean=0, legA=0, legB=0, liftA=0, liftB=0, hx=0, hair=0, mo=0, ua=80, la=20, sa=-20, op=.3, sc=1, nd=0, sl=0)
DOLL = dict(
    idle=(8, True, [(0, {}), (.5, dict(bob=1.2, hair=2, hx=1, op=.5, sa=-26))]),
    walk=(8, True, [(0, dict(legA=-5, legB=5, liftA=0, liftB=4, bob=0, hair=-1)), (.5, dict(legA=5, legB=-5, liftA=4, liftB=0, bob=1.2, hair=2))]),
    a1=A10(dict(), dict(lean=-4, ua=-20, la=-20, sa=-10, sc=0, nd=.3, mo=0), dict(lean=6, ua=10, la=0, sa=0, sc=0, nd=1, mo=1), dict(lean=3, ua=30, la=10, sa=0, sc=0, nd=.6)),
    a2=A10(dict(), dict(lean=-4, ua=-70, la=-110, sa=-100, op=.9, bob=-1), dict(lean=5, ua=-10, la=0, sa=0, op=.4, sc=0), dict(lean=3, ua=40, la=10, sc=0)),
    a3=A10(dict(), dict(lean=-3, ua=-30, la=-60, sa=-60, op=1, bob=-2, legA=-3, legB=3), dict(lean=4, ua=0, la=10, sa=250, op=1, bob=1, sl=1), dict(lean=3, ua=20, la=20, sa=430, op=.6, sl=.8)),
    hurt=(3, False, [(0, dict(lean=-6, hx=-3, mo=2, ua=110, la=60, sa=40, op=.6)), (1, dict(lean=-4, hx=-2, mo=1, ua=100, la=50, sa=20))]),
)

# ------------------------------------------------------------------ 4. BLADE MANTIS (a tall glossy mantis with two serrated scythes: scythe slash, cross cut, crescent wave)
CHIT = ramp('#62b83c', dark=.15, light=1.42, hs=-24, hl=12); CHIT_D = ramp('#2f6e2a', dark=.13, light=1.3, hs=-20); BELLY = ramp('#cbe48c', dark=.3, light=1.15); WING = ramp('#c4ecd6', dark=.38, light=1.08, hs=-14, hl=0)
EYEM = ramp('#ffcf3a', dark=.28, light=1.2, hs=-34, hl=0); BLADE = ramp('#dff6c4', dark=.22, light=1.15, hs=-20, hl=6); CYANW = ramp('#6cf3ff', dark=.55, light=1.1)
def mantis(P):
    K = .74; S = Spr(round(208 * K), round(190 * K), K); b = P['bob'] + 36; L = P['lean']; sw = P['sw']; T = (84 + L * .4, 84 + b); facet = lambda X, Y: (np.sin(X * 1.9) * np.sin(Y * 1.9) * .18, np.cos(Y * 1.9) * np.sin(X * 1.9) * .18)
    def leg(dx, a1, a2, l1, l2, rp, dy=6):
        p = fk(T[0] + dx, T[1] + dy, (a1, a2), (l1, l2)); S.paint(S.seg(*p[0], *p[1], 3.2, 2.6), rp, R=2.6); S.paint(S.seg(*p[1], *p[2], 2.6, 1.3), rp, R=1.9); S.paint(S.ell(*p[1], 3.2, 3.2), rp, R=2.6)
        S.paint(S.poly([(p[2][0] - 1.5, p[2][1] - 2), (p[2][0] + 3.5, p[2][1] + 1.5), (p[2][0] - 1, p[2][1] + 1.8)]), rp, R=1, rim=False, shadow=0)
        for k in range(3): S.paint(S.poly([(p[1][0] + k * 3.2 - 1, p[1][1] + 1), (p[1][0] + k * 3.2 + 1.2, p[1][1] + 5), (p[1][0] + k * 3.2 + 2, p[1][1] + 1)]), rp, R=.9, rim=False, shadow=0)
    leg(-9, 150 + sw, 70 - sw * .5, 22, 31, CHIT_D); leg(10, 40 - sw, 104 + sw * .5, 20, 28, CHIT_D)      # the far legs
    segs = [(T[0] - 8 - i * 9, T[1] - 2 - i * 1.7 - P['ab'] * i * .35) for i in range(7)]
    for i in range(6, -1, -1):
        r = 10.5 - i * .95; S.paint(S.ell(segs[i][0], segs[i][1], r + 1.5, r), CHIT, R=r * .8, amb=.2, bump=lambda X, Y: (np.zeros_like(X), np.sin(X * 1.2) * .08))
        S.paint(S.ell(segs[i][0] + 1, segs[i][1] + r * .45, r * .8, r * .38), BELLY, R=2.4, rim=False, shadow=0)
        S.paint(S.line([(segs[i][0] + r * .5 + 1, segs[i][1] - r + 1), (segs[i][0] + r * .75 + 1, segs[i][1]), (segs[i][0] + r * .5 + 1, segs[i][1] + r - 1)], 1), CHIT_D, R=.6, rim=False, shadow=0, amb=.5)
    for sg, rp in ((0, WING), (4, WING)):      # the folded wings, see-through, with veins
        S.paint(S.poly([(T[0] - 4, T[1] - 10 + sg), (T[0] - 30, T[1] - 17 + sg - P['ab'] * .6), (segs[6][0] - 6, segs[6][1] - 8 + sg), (segs[6][0] - 14, segs[6][1] - 2 + sg), (T[0] - 28, T[1] - 4 + sg * .5), (T[0] - 4, T[1] - 2)]), rp, R=3, alpha=.62, rim=False, shadow=.9)
    for k in range(5): S.paint(S.line([(T[0] - 6, T[1] - 9 + k * .6), (T[0] - 22 - k * 7, T[1] - 14 - k * 1.4 + k * .5), (segs[6][0] - 10 + k * 2, segs[6][1] - 6 + k * 1.6)], .9), CHIT_D, R=.5, alpha=.7, rim=False, shadow=0, amb=.9)      # the veins of the wings
    leg(-12, 138 - sw, 76 + sw * .5, 22, 31, CHIT); leg(8, 48 + sw, 98 - sw * .5, 20, 28, CHIT, 7)      # the near legs
    nk = [(T[0] + 2, T[1] - 4), (T[0] + 8 + L * .3, T[1] - 24), (T[0] + 13 + L * .6, T[1] - 44)]; S.paint(S.chain(nk, 7.4, 5.2), CHIT, R=4.4, amb=.2, bump=lambda X, Y: (np.zeros_like(X), np.sin(Y * 1.1) * .13))      # the neck-body
    S.paint(S.ell(T[0] + 2, T[1] - 2, 8, 8), CHIT, R=5); S.paint(S.ell(nk[1][0], nk[1][1], 5.4, 3.6), BELLY, R=2.4, rim=False, shadow=0)
    hd = (T[0] + 16 + L * .6, T[1] - 52)
    for sgn, ph in ((-1, 0), (1, 1.3)):      # the antennae
        S.paint(S.chain([(hd[0] + sgn * 4, hd[1] - 6), (hd[0] + sgn * 8 + 2, hd[1] - 18 + P['bob'] * .2), (hd[0] + sgn * 12 + 6, hd[1] - 28 + math.sin(P['sw'] * .15 + ph) * 2)], 1.2, .5), CHIT_D, R=.9, shadow=0)
    S.paint(S.poly([(hd[0] - 9, hd[1] - 5), (hd[0] + 11, hd[1] - 5), (hd[0] + 1.5, hd[1] + 14)]), CHIT, R=5.5, amb=.2)
    for ex, ey, rr in ((-7.5, -2, 5.2), (9, -2, 5.6)):
        S.paint(S.ell(hd[0] + ex, hd[1] + ey, rr, rr + 2.4, -12 if ex < 0 else 12), EYEM, R=4.8, bump=facet, spec=14, rim=True); S.paint(S.ell(hd[0] + ex + 1, hd[1] + ey + 1, 1.6, 2.6), DARK_M, R=1, rim=False, shadow=0); S.px(hd[0] + ex - 1.5, hd[1] + ey - 3, '#fffbe0')
    for sgn in (-1, 1): S.paint(S.seg(hd[0] + 1 + sgn * 2, hd[1] + 11, hd[0] + 1 + sgn * 5, hd[1] + 16.5, 1.6, .8), CHIT_D, R=1.1, shadow=0)      # the mandibles
    S0 = (hd[0] + 1, hd[1] + 15)
    def scythe(o, a1, a2, rp, bp, sc=1.):
        p = fk(S0[0] + o, S0[1], (a1, a2), (26 * sc, 34 * sc)); S.paint(S.seg(*p[0], *p[1], 6.2, 4.8), rp, R=4.4, spec=9 if rp is CHIT else 0)
        for k in range(1, 6): q = (p[0][0] + (p[1][0] - p[0][0]) * k / 6, p[0][1] + (p[1][1] - p[0][1]) * k / 6); u = a1 + 90; S.paint(S.poly([(q[0] - 1.6 * math.cos(rad(a1)), q[1] - 1.6 * math.sin(rad(a1))), (q[0] + math.cos(rad(u)) * 8 + math.cos(rad(a1)) * 3, q[1] + math.sin(rad(u)) * 8 + math.sin(rad(a1)) * 3), (q[0] + 1.6 * math.cos(rad(a1)), q[1] + 1.6 * math.sin(rad(a1)))]), bp, R=1.1, rim=False, shadow=0)
        S.paint(S.ell(*p[1], 5.8, 5.8), rp, R=4.2); S.paint(S.seg(*p[1], *p[2], 4.8, 1.2), bp, R=3, spec=12)
        for k in range(1, 7): q = (p[1][0] + (p[2][0] - p[1][0]) * k / 7, p[1][1] + (p[2][1] - p[1][1]) * k / 7); u = a2 - 90; S.paint(S.poly([(q[0] - 1.1 * math.cos(rad(a2)), q[1] - 1.1 * math.sin(rad(a2))), (q[0] + math.cos(rad(u)) * 6 + math.cos(rad(a2)) * 2.2, q[1] + math.sin(rad(u)) * 6 + math.sin(rad(a2)) * 2.2), (q[0] + 1.1 * math.cos(rad(a2)), q[1] + 1.1 * math.sin(rad(a2)))]), bp, R=.8, rim=False, shadow=0)
        tp = p[2]; S.paint(S.poly([(tp[0] + math.cos(rad(a2 + 90)) * 1.8, tp[1] + math.sin(rad(a2 + 90)) * 1.8), (tp[0] + math.cos(rad(a2 - 14)) * 9, tp[1] + math.sin(rad(a2 - 14)) * 9), (tp[0] - math.cos(rad(a2 + 90)) * 1.4, tp[1] - math.sin(rad(a2 + 90)) * 1.4)]), bp, R=1, spec=12)
        return p
    scythe(-3, P['fa'], P['fb'], CHIT_D, CHIT_D)      # the far scythe
    p = scythe(0, P['ua'], P['la'], CHIT, BLADE); star(S, p[2][0] + math.cos(rad(P['la'])) * 7, p[2][1] + math.sin(rad(P['la'])) * 7)
    if P['sl'] > .45: swoosh(S, S0[0] - 4, S0[1] + 4, 54, -122, 24, 7)
    if P['arc'] > .5:      # the crescent wave comes off the blade
        c0 = (p[2][0] + 4, p[2][1] - 2); pts = [(c0[0] + math.cos(rad(t)) * 38 - 18, c0[1] + math.sin(rad(t)) * 38) for t in range(-64, 65, 8)]
        S.paint(S.line(pts, 5.5), CYANW, R=2.6, emis=None, amb=.55, rim=False, shadow=0); S.glow(pts[4][0], pts[4][1], 14, '#6cf3ff', .6, .3)
        for k in range(10): S.px(pts[0][0] - 3 - k * 3, pts[0][1] + 2 + k * 1.5, '#a8f8ff')
    return S
DARK_M = ramp('#2a1a10', dark=.3, light=1.8)
MANTIS_B = dict(bob=0, lean=0, sw=0, ab=0, ua=70, la=122, fa=60, fb=118, arc=0, sl=0)
MANTIS = dict(
    idle=(8, True, [(0, {}), (.5, dict(bob=1.2, ab=3, ua=66, la=112, fa=56, fb=108))]),
    walk=(8, True, [(0, dict(sw=14, bob=0, ab=2)), (.5, dict(sw=-14, bob=-1.2, ab=-2))]),
    a1=A10(dict(), dict(lean=-5, ua=-120, la=-70, fa=-110, fb=-60, bob=-1), dict(lean=7, ua=20, la=75, fa=10, fb=80, sl=1), dict(lean=4, ua=40, la=95, fa=30, fb=100, sl=.8)),
    a2=A10(dict(), dict(lean=-4, ua=-100, la=-150, fa=-40, fb=60, bob=-1), dict(lean=6, ua=10, la=65, fa=-70, fb=-15, sl=1), dict(lean=4, ua=35, la=85, fa=-20, fb=55, sl=.8)),
    a3=A10(dict(), dict(lean=-6, ua=-130, la=-90, fa=-120, fb=-80, bob=-2), dict(lean=7, ua=0, la=45, fa=-60, fb=60, arc=1), dict(lean=5, ua=30, la=75, fa=-30, fb=90, arc=1)),
    hurt=(3, False, [(0, dict(lean=-8, bob=1, ab=-5, ua=20, la=140, fa=20, fb=130)), (1, dict(lean=-6, bob=1, ab=-3, ua=10, la=132, fa=10, fb=122))]),
)

# ------------------------------------------------------------------ 5. SHELL CRAB (a wide armoured crab with glowing cracks and a huge serrated claw: claw snap, bubble barrage, shell rush)
SHELL = ramp('#dc5a2a', dark=.14, light=1.45, hs=-20, hl=8); SHELL_D = ramp('#8e301c', dark=.14, light=1.3, hs=-14); BELLYC = ramp('#e8b48c', dark=.22, light=1.2); CORAL = ramp('#86dccb', dark=.28, light=1.2)
EYEC = ramp('#fff2a6', dark=.5, light=1.1); BUB = ramp('#b0f0ff', dark=.5, light=1.1)
def ik2(p0, p1, l1, l2, flip):
    dx, dy = p1[0] - p0[0], p1[1] - p0[1]; d = max(.5, min(math.hypot(dx, dy), l1 + l2 - .01)); a = math.atan2(dy, dx); bb = math.acos(max(-1, min(1, (l1 * l1 + d * d - l2 * l2) / (2 * l1 * d)))); k = a + (bb if flip else -bb)
    return (p0[0] + math.cos(k) * l1, p0[1] + math.sin(k) * l1)
def crab(P):
    K = .8; S = Spr(round(190 * K), round(164 * K), K); b = P["bob"] + P["cr"] + 30; L = P['lean']; gx = 76 + L * .3; sw = P['sw']; G = 142; shell_bump = lambda X, Y: (np.sin((X - gx) * .5) * .2, np.cos((Y - 70) * .55) * .16)
    def leg(dx, fx, rp, far=False):
        hip = (gx + dx, 88 + b - (8 if far else 0)); foot = (gx + fx + (sw if fx > 0 else -sw) * (-1 if far else 1), G - (3 if far else 0)); kn = ik2(hip, foot, 20, 23, fx < dx)
        S.paint(S.seg(*hip, *kn, 3.4, 2.8), rp, R=2.6); S.paint(S.seg(*kn, *foot, 2.8, 1.1), rp, R=2.2); S.paint(S.ell(*kn, 3.6, 3.6), rp, R=2.8)
        for k in range(3): S.paint(S.poly([(kn[0] + (foot[0] - kn[0]) * (k + 1) / 4 - 1.4, kn[1] + (foot[1] - kn[1]) * (k + 1) / 4), (kn[0] + (foot[0] - kn[0]) * (k + 1) / 4 + (3.4 if fx > dx else -3.4), kn[1] + (foot[1] - kn[1]) * (k + 1) / 4 - 3), (kn[0] + (foot[0] - kn[0]) * (k + 1) / 4 + 1.4, kn[1] + (foot[1] - kn[1]) * (k + 1) / 4)]), rp, R=.9, rim=False, shadow=0)
    for dx, fx in ((-26, -48), (-10, -30), (8, 28), (24, 46)): leg(dx, fx, SHELL_D, far=True)
    claw_f = fk(gx - 2, 76 + b, (150 - P['ua'] * .1, 190 - P['la'] * .1), (13, 11)); S.paint(S.chain([(gx - 2, 76 + b)] + claw_f[1:], 4.4, 3.8), SHELL_D, R=3.2); S.paint(S.ell(claw_f[2][0] - 3, claw_f[2][1] + 2, 6.4, 5.4), SHELL_D, R=3.8)      # the far claw
    S.paint(S.ell(gx, 92 + b, 33, 9), BELLYC, R=5, amb=.3, rim=False)
    for dx, fx in ((-30, -56), (-14, -37), (12, 36), (28, 56)): leg(dx, fx, SHELL)
    body = S.ell(gx, 78 + b, 38, 27); S.paint(body, SHELL, R=15, amb=.2, bump=shell_bump)
    for k in range(4): S.paint(S.I(S.line([(gx - 34 + k * 4, 62 + b - k * 3), (gx - 14 + k * 11, 52 + b), (gx + 6 + k * 14, 58 + b + k * 3)], 1.2), body), SHELL_D, R=.8, rim=False, shadow=0, amb=.4)      # the plates of the shell
    for k in range(7): a = rad(-168 + k * 22); bx, by = gx + math.cos(a) * 36, 78 + b + math.sin(a) * 25; q = a; S.paint(S.poly([(bx - math.sin(q) * 3, by + math.cos(q) * 3), (bx + math.cos(q) * 9, by + math.sin(q) * 9), (bx + math.sin(q) * 3, by - math.cos(q) * 3)]), SHELL, R=2.4, spec=0)      # spikes along the top
    for (dx, dy, r) in ((-20, 66, 3), (-6, 60, 2.4), (12, 63, 3.2), (24, 72, 2.4), (-26, 80, 2.6), (2, 74, 2)): S.paint(S.ell(gx + dx, dy + b, r, r), CORAL, R=r * .8, rim=True); S.px(gx + dx - 1, dy + b - 1, '#e8fff8')      # barnacles
    for pts in (((-24, 70), (-18, 76), (-22, 82), (-12, 88)), ((10, 60), (15, 67), (11, 73), (18, 80)), ((26, 70), (30, 77), (27, 83))):      # glowing cracks
        cr = S.line([(gx + x, y + b) for x, y in pts], 1.2); m1 = S.paint(S.I(cr, body), CYANW, emis=-1, rim=False, shadow=0); S.glow(gx + pts[1][0], pts[1][1] + b, 8, '#6cf3ff', .5, .1)
    for dx in (24, 33):      # the eye stalks
        S.paint(S.seg(gx + dx, 56 + b, gx + dx + 2, 44 + b, 2.6, 2.2), SHELL, R=1.8); S.paint(S.ell(gx + dx + 2, 42 + b, 4.4, 4.8), EYEC, emis=-2, rim=False); S.paint(S.ell(gx + dx + 3.4, 42.6 + b, 2, 2.6), DARK_M, R=1, rim=False, shadow=0); S.px(gx + dx + 1, 40 + b, '#ffffff')
    for k in range(3): S.paint(S.seg(gx + 36, 82 + b + k * 3, gx + 44, 85 + b + k * 3.4 + P['bb'] * 2, 1.4, .8), SHELL_D, R=1, shadow=0)      # the mouth parts
    sh0 = (gx + 28, 72 + b); cp = fk(sh0[0], sh0[1], (P['ua'], P['la']), (15, 13)); cl = P['cl']; tp = cp[2]
    S.paint(S.chain([sh0, cp[1], tp], 9, 8), SHELL, R=6, amb=.2, spec=0); S.paint(S.ell(*cp[1], 7.8, 7.8), SHELL, R=5.4)
    pa = P['la'] - 8 - 36 * cl; pb = P['la'] + 14; ta = (tp[0] + math.cos(rad(pa)) * 27, tp[1] + math.sin(rad(pa)) * 27); tb = (tp[0] + math.cos(rad(pb)) * 23, tp[1] + math.sin(rad(pb)) * 23)
    S.paint(S.ell(tp[0] + math.cos(rad(P['la'])) * 4, tp[1] + math.sin(rad(P['la'])) * 4, 13, 12), SHELL, R=8, spec=0)
    for (e, ang, rp, ln) in ((ta, pa, SHELL, 29), (tb, pb, SHELL_D, 25)):
        S.paint(S.seg(*tp, *e, 8, 1.2), rp, R=4.6, spec=12 if rp is SHELL else 0)
        for k in range(1, 5): q = (tp[0] + (e[0] - tp[0]) * k / 5.6, tp[1] + (e[1] - tp[1]) * k / 5.6); u = ang + (90 if rp is SHELL else -90); S.paint(S.poly([(q[0] - 1.3 * math.cos(rad(ang)), q[1] - 1.3 * math.sin(rad(ang))), (q[0] + math.cos(rad(u)) * 4.6, q[1] + math.sin(rad(u)) * 4.6), (q[0] + 1.3 * math.cos(rad(ang)), q[1] + 1.3 * math.sin(rad(ang)))]), BELLYC, R=.9, rim=False, shadow=0)      # the teeth of the claw
    if P['bb'] > .5:
        for (dx, dy, r) in ((40, 52, 4), (52, 44, 5.4), (64, 56, 4), (74, 46, 3)): S.paint(S.D(S.ell(gx + dx, dy + b, r, r), S.ell(gx + dx + .8, dy + b + .8, r - 1.2, r - 1.2)), BUB, R=1.2, emis=-1, rim=False, shadow=0, alpha=.9); S.paint(S.ell(gx + dx, dy + b, r - 1.2, r - 1.2), BUB, emis=1, alpha=.3, rim=False, shadow=0); S.px(gx + dx - r * .4, dy + b - r * .4, '#ffffff')
    if P['sl'] > .45:      # the smash: a burst of lines at the claw
        for k in range(9): a = k * 40 + 10; S.paint(S.seg(ta[0] + math.cos(rad(a)) * 9, ta[1] + math.sin(rad(a)) * 9, ta[0] + math.cos(rad(a)) * (16 + k % 3 * 4), ta[1] + math.sin(rad(a)) * (16 + k % 3 * 4), 1.5, .5), SWOOSH, R=1, amb=.8, rim=False, shadow=0)
    return S
CRAB_B = dict(bob=0, cr=0, lean=0, sw=0, ua=-46, la=-8, cl=.45, bb=0, sl=0)
CRAB = dict(
    idle=(8, True, [(0, {}), (.5, dict(bob=1.2, ua=-52, la=-16, cl=.75))]),
    walk=(8, True, [(0, dict(sw=7, bob=0, cl=.3)), (.5, dict(sw=-7, bob=1.2, cl=.6))]),
    a1=A10(dict(), dict(ua=-112, la=-92, cl=1, lean=-3, bob=-1), dict(ua=-10, la=36, cl=.1, lean=6, cr=2, sl=1), dict(ua=0, la=40, cl=.2, lean=4, cr=1, sl=.7)),
    a2=A10(dict(), dict(cr=3, lean=-3, ua=-30, la=20, cl=.2, bb=0), dict(cr=0, lean=3, ua=-60, la=-20, cl=.8, bb=1), dict(lean=2, ua=-55, la=-15, cl=.6, bb=1)),
    a3=A10(dict(), dict(cr=4, lean=-4, ua=-50, la=-30, cl=.3, sw=6), dict(cr=3, lean=9, ua=-25, la=8, cl=0, sw=-8), dict(cr=2, lean=7, ua=-30, la=0, cl=.1, sw=5)),
    hurt=(3, False, [(0, dict(lean=-8, cr=2, ua=-80, la=-60, cl=1)), (1, dict(lean=-6, cr=1, ua=-70, la=-40, cl=.8))]),
)

NEW = [      # name, figure, base pose, animations, the column of his middle (cx, in the big space the figure is drawn in), the scale K the figure is drawn with, half his width for the hits (hw)
    ('hound', hound, HOUND_B, HOUND, 68, .7, 14), ('wraith', wraith, WRAITH_B, WRAITH, 56, .8, 10), ('doll', doll, DOLL_B, DOLL, 46, .86, 10), ('mantis', mantis, MANTIS_B, MANTIS, 82, .74, 11), ('crab', crab, CRAB_B, CRAB, 76, .8, 22)]

def make(name, fig, base, anims, cx, K, hw):
    """draws every frame, crops them all to the one box that holds the biggest of them (2 pixels of room), packs one palette. g = the lowest row of the first idle frame (where he stands)"""
    sets = build(fig, base, anims); al = [a for fr in sets.values() for _, a in fr]
    ys = [np.where(a.any(1))[0] for a in al]; xs = [np.where(a.any(0))[0] for a in al]
    for a in al:
        if a[0].any() or a[-1].any() or a[:, 0].any() or a[:, -1].any(): print('WARNING', name, 'a frame touches the edge of its canvas: make the canvas bigger'); break
    y0 = max(0, min(y[0] for y in ys) - 2); y1 = max(y[-1] for y in ys) + 3; x0 = max(0, min(x[0] for x in xs) - 2); x1 = max(x[-1] for x in xs) + 3
    y0, x0, y1, x1 = int(y0), int(x0), int(min(y1, al[0].shape[0])), int(min(x1, al[0].shape[1]))
    cropped = {k: [(c[y0:y1, x0:x1], a[y0:y1, x0:x1]) for c, a in fr] for k, fr in sets.items()}
    g = int(np.where(cropped['idle'][0][1].any(1))[0][-1]); pal, rows = pack(cropped); W, H = x1 - x0, y1 - y0
    return {'w': W, 'h': H, 'g': g, 'pal': pal, 'cx': int(round(cx * K)) - x0, 'hw': hw, **{k: {'w': W, 'h': H, 'frames': v} for k, v in rows.items()}}

def main():
    out = json.load(open('curses.json'))
    for name, fig, base, anims, cx, K, hw in NEW:
        out[name] = make(name, fig, base, anims, cx, K, hw); d = out[name]; print(name, d['w'], d['h'], 'g', d['g'], 'cx', d['cx'], 'colours', len(d['pal']))
    txt = json.dumps(out, separators=(',', ':')); open('curses.json', 'w').write(txt)      # (the text first, so a failure cannot leave a half-written file)
    print('curses.json now has', list(out))
    if len(sys.argv) > 1:
        for name, *_ in NEW:
            d = out[name]; col = {k: tuple(int(v[i:i + 2], 16) for i in (1, 3, 5)) for k, v in d['pal'].items()}
            frames = [d['idle']['frames'][0], d['walk']['frames'][2], d['a1']['frames'][3], d['a1']['frames'][5], d['a2']['frames'][3], d['a2']['frames'][5], d['a3']['frames'][5], d['hurt']['frames'][0]]
            S = 2; W, H = d['w'], d['h']; sheet = Image.new('RGB', (4 * (W * S + 4), 2 * (H * S + 4)), (58, 52, 74))
            for i, fr in enumerate(frames):
                im = Image.new('RGB', (W, H), (58, 52, 74))
                for y, r in enumerate(fr):
                    for x, ch in enumerate(r):
                        if ch != '.': im.putpixel((x, y), col[ch])
                sheet.paste(im.resize((W * S, H * S), Image.NEAREST), ((i % 4) * (W * S + 4), (i // 4) * (H * S + 4)))
            sheet.save(sys.argv[1].replace('.png', '_' + name + '.png'))

if __name__ == '__main__': main()
