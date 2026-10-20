"""v1.26: draws the five curses that had moves in the game (CDEF in template.html) since v1.10 but no pictures: BONE HOUND, LANTERN WRAITH,
STITCH DOLL, BLADE MANTIS and SHELL CRAB. It uses the paint box of curse_art.py and ADDS them to curses.json (the five older curses stay as they are:
the program that drew their v1.10 look is not in this folder, so never run curse_art.py's own main() again, it would overwrite them with the v1.00 pictures).
Run from this folder:  python3 -B curse_art2.py            (adds the five to curses.json)
                       python3 -B curse_art2.py sheet.png  (also writes a contact sheet per curse to look at)
Same rules as curse_art.py: every figure faces RIGHT and stands on the row G; an attack is 10 frames and the blow lands on frame 5 (imp in CDEF);
idle and walk are 8 frames, hurt is 3."""
import json, math, sys
from PIL import Image
from curse_art import Cv, limb, pt, shade, track, build

def rell(c, cx, cy, rx, ry, ang, ch):      # a turned ellipse
    a = math.radians(ang)
    c.poly([(cx + math.cos(t) * rx * math.cos(a) - math.sin(t) * ry * math.sin(a), cy + math.cos(t) * rx * math.sin(a) + math.sin(t) * ry * math.cos(a)) for t in [i / 28 * 2 * math.pi for i in range(28)]], ch)

def A10(rest, wind, strike, follow=None):
    """the 10-frame blow: stand, wind up (peak on frame 3), strike (frame 5), follow through, recover"""
    return (10, False, [(0, rest), (3 / 9, wind), (5 / 9, strike), (7 / 9, follow if follow is not None else strike), (1, rest)])

# ------------------------------------------------------------------ 1. BONE HOUND (a low skeleton dog: snap, pounce, bone shards)
def hound(P):
    c = Cv(118, 76); b = P['bob'] + P['cr'] + 10; L = P['lean']; st = P['st']; sw = P['sw']; kn = P['kn']
    hx0, hy0 = 36 - st * .4, 31 + b; sx0, sy0 = 63 + L + st * .5, 29 + b
    px, py = hx0 - 5, hy0 - 2
    for k in range(8):      # the tail: a chain of bones
        nx, ny = pt(px, py, 190 + k * 8 + P['tail'] * math.sin(k * .8 + P['tp']), 3.6); c.line(px, py, nx, ny, 2, '1'); c.dot(nx, ny, '3'); px, py = nx, ny
    def leg(x, y, a1, a2, ch):
        (ex, ey), (tx, ty) = limb(c, x, y, a1, 11, a2, 11, 3, ch); c.ell(tx + 1, ty, 3.5, 2, ch)
    leg(hx0 + 2, hy0 + 4, 105 + sw, 78 - sw * .3 - kn, '1'); leg(sx0 - 5, sy0 + 5, 90 - sw, 92 - sw * .3 - kn, '1')      # the far legs
    c.line(hx0, hy0, sx0, sy0, 5, '2')
    for k in range(6): x = hx0 + 2 + k * 5.3; y = hy0 + (sy0 - hy0) * (k * 5.3 + 2) / (sx0 - hx0); c.poly([(x - 1, y - 2), (x + 1.5, y - 7), (x + 4, y - 2)], '3')      # the spine spikes
    c.ell(sx0 - 3, sy0 + 3, 10, 9, '2')
    for k in range(4): c.line(sx0 - 10 + k * 4.5, sy0 - 3, sx0 - 9 + k * 4.5, sy0 + 10, 1, '4')      # the ribs
    c.ell(hx0, hy0 + 1, 7, 7, '2')
    leg(hx0 - 1, hy0 + 4, 105 - sw, 78 + sw * .3 - kn, '2'); leg(sx0 + 1, sy0 + 5, 90 + sw, 92 + sw * .3 - kn, '2')      # the near legs
    hx, hy = sx0 + 12 + st * .2, sy0 - 7 + P['hd']; jw = P['jaw'] * 11
    c.line(sx0 + 3, sy0 - 3, hx, hy, 6, '2')
    c.poly([(hx + 3, hy + 3), (hx + 19, hy + 2 + jw), (hx + 18, hy + 5 + jw), (hx + 4, hy + 6)], '1')      # the lower jaw
    c.ell(hx, hy, 9, 7, '2'); c.poly([(hx + 3, hy - 4), (hx + 20, hy - 1), (hx + 20, hy + 3), (hx + 4, hy + 4)], '2')      # skull and snout
    for k in range(4): c.dot(hx + 9 + k * 3.4, hy + 4, 'w'); c.dot(hx + 10 + k * 3.4, hy + 5, 'w')
    c.ell(hx + 2, hy - 2, 2.4, 2.4, '4'); c.dot(hx + 2, hy - 2, 'e'); c.dot(hx + 3, hy - 2, 'e')
    c.poly([(hx - 6, hy - 4), (hx - 8, hy - 14), (hx - 1, hy - 7)], '2'); c.poly([(hx - 1, hy - 6), (hx + 2, hy - 15), (hx + 4, hy - 6)], '1')
    if P['sh'] > .5:      # bone shards fly out of the open jaws
        c.poly([(hx + 21, hy - 6), (hx + 31, hy - 4), (hx + 22, hy - 2)], 'w'); c.poly([(hx + 20, hy + 5 + jw * .5), (hx + 29, hy + 7 + jw * .5), (hx + 21, hy + 8 + jw * .5)], 'w')
    return c
HOUND_B = dict(bob=0, cr=0, lean=0, st=0, hd=0, jaw=.1, sw=0, kn=0, tail=10, tp=0, sh=0)
HOUND = dict(
    idle=(8, True, [(0, {}), (.5, dict(bob=1, hd=1, jaw=.25, tail=16, tp=2))]),
    walk=(8, True, [(0, dict(sw=22, kn=6, bob=0, tp=0)), (.5, dict(sw=-22, kn=6, bob=-1, tp=3))]),
    a1=A10(dict(), dict(cr=2, lean=-4, hd=-2, jaw=.1), dict(lean=5, st=3, hd=2, jaw=1, cr=1), dict(lean=3, st=1, jaw=.5)),
    a2=A10(dict(), dict(cr=5, lean=-5, st=-3, sw=-8, hd=2, jaw=.1), dict(bob=-8, st=9, lean=7, jaw=1, sw=-58, kn=0), dict(bob=-4, st=5, lean=5, jaw=.6, sw=-35)),
    a3=A10(dict(), dict(cr=2, lean=-5, hd=-4, jaw=0), dict(lean=2, hd=-3, jaw=1, sh=1), dict(lean=1, hd=-1, jaw=.5, sh=0)),
    hurt=(3, False, [(0, dict(lean=-6, cr=3, jaw=1, hd=3, tail=2)), (1, dict(lean=-4, cr=2, jaw=.6, hd=2))]),
)
HOUND_PAL = {'o': '#17110c', '1': '#6e6350', '2': '#b9ae92', '3': '#ece3c8', '4': '#3a1414', '5': '#7a2222', 'e': '#ff3b2a', 'f': '#ffb03a', 'w': '#fffaf0', 'r': '#c02a2a'}
HOUND_MATS = {'2': ('1', '3')}

# ------------------------------------------------------------------ 2. LANTERN WRAITH (a hooded ghost with a lantern staff: swing, soul flame, fire pillar)
def wraith(P):
    c = Cv(104, 122); b = P['bob'] + 14; L = P['lean']; sw = P['sw']; ax, ay = 34 + L * .5, 46 + b
    limb(c, ax - 8, ay + 3, 100, 12, 80, 11, 4, '1')      # the far arm
    c.poly([(ax - 14, ay + 2), (ax - 20 + sw * .4, ay + 30), (ax - 17 + sw * .8, ay + 48), (ax - 9 + sw * 1.2, 90 + b), (ax + 11 + sw * 1.0, 90 + b), (ax + 16 + sw * .8, ay + 48), (ax + 16 + sw * .4, ay + 28), (ax + 12, ay + 2)], '2')
    for k in range(5): x = ax - 10 + k * 5 + sw * 1.1; c.poly([(x - 2.5, 88 + b), (x + 2.5, 88 + b), (x + sw * .5, 99 + b - (k % 2) * 5)], '2')      # the ragged hem
    for k in range(3): c.line(ax - 7 + k * 6, ay + 12, ax - 11 + k * 7 + sw * .9, 90 + b, 1, '1')      # folds
    c.ell(ax + 2, ay - 15, 12, 14, '2'); c.poly([(ax - 9, ay - 20), (ax + 2 + P['ht'], ay - 38), (ax + 13, ay - 20)], '2')      # the hood
    c.ell(ax + 6, ay - 14, 7.5, 9, '4'); c.rect(ax + 4, ay - 17, ax + 5, ay - 15, 'e'); c.rect(ax + 9, ay - 17, ax + 10, ay - 15, 'e')
    (ex, ey), (hx, hy) = limb(c, ax + 9, ay + 2, P['ua'], 13, P['la'], 13, 5, '2'); c.ell(hx, hy, 3, 3, 'g')
    top = pt(hx, hy, -90 + P['sa'], 28); bot = pt(hx, hy, 90 + P['sa'], 34); c.line(top[0], top[1], bot[0], bot[1], 2, '6')      # the staff
    lx, ly = pt(top[0], top[1], 90 + P['sa'] * .5, 9); fl = P['fl']
    c.ell(lx, ly, 5 + 4 * fl, 6 + 4 * fl, 'g'); c.line(top[0], top[1], lx, ly - 4, 1, '6'); c.rect(lx - 3, ly - 4, lx + 3, ly + 4, 'l'); c.ell(lx, ly, 1.8 + fl, 2.8 + fl, 'f'); c.dot(lx, ly - 1, 'w')      # the lantern and its flame
    return c
WRAITH_B = dict(bob=0, lean=0, sw=0, ht=0, ua=70, la=-10, sa=0, fl=0)
WRAITH = dict(
    idle=(8, True, [(0, {}), (.5, dict(bob=-2, sw=3, ht=2, sa=3, fl=.2))]),
    walk=(8, True, [(0, dict(sw=-7, lean=2, bob=0)), (.5, dict(sw=7, lean=-1, bob=-2))]),
    a1=A10(dict(), dict(lean=-4, ua=-60, la=-120, sa=-70, bob=-1), dict(lean=5, ua=30, la=5, sa=80), dict(lean=3, ua=40, la=15, sa=60)),
    a2=A10(dict(), dict(lean=-3, ua=-30, la=-80, sa=-25, fl=.6, bob=-2), dict(lean=4, ua=25, la=-5, sa=40, fl=1.4), dict(lean=2, ua=40, la=0, sa=25, fl=.5)),
    a3=A10(dict(), dict(lean=-4, ua=-110, la=-75, sa=-15, fl=.5, bob=-3), dict(lean=5, ua=55, la=40, sa=0, fl=1, bob=2), dict(lean=3, ua=60, la=30, sa=0, fl=.5)),
    hurt=(3, False, [(0, dict(lean=-6, sw=-6, ht=-3, ua=100, la=40, sa=-10)), (1, dict(lean=-4, sw=-4, ua=90, la=20, sa=-5))]),
)
WRAITH_PAL = {'o': '#06121a', '1': '#10303f', '2': '#1f5f78', '3': '#4aa6c0', '4': '#03080c', 'e': '#9ff6ff', 'f': '#d8ffff', 'g': '#2f8aa5', 'l': '#8a9aa2', '6': '#4a3a2a', 'w': '#ffffff'}
WRAITH_MATS = {'2': ('1', '3')}

# ------------------------------------------------------------------ 3. STITCH DOLL (a patchwork rag doll with giant scissors and a needle: needle stab, scissor toss, spin slash)
def doll(P):
    c = Cv(112, 114); oy = 14; b = P['bob'] + oy; L = P['lean']; gx = 34 + L * .3
    for dx, off, lift, ch in ((-5, P['legA'], P['liftA'], '1'), (5, P['legB'], P['liftB'], '2')):
        x = gx + dx + off; c.line(gx + dx * .5, 62 + b, x, 84 + oy - lift, 6, ch); c.ell(x + 2, 88 + oy - lift, 6, 4, ch)      # a stubby leg and a round foot
    limb(c, gx - 8, 41 + b, 110, 11, 95, 10, 5, '1')      # the far arm
    c.ell(gx, 48 + b, 11, 15, '2'); c.rect(gx - 7, 42 + b, gx - 2, 48 + b, '5'); c.rect(gx + 1, 51 + b, gx + 8, 58 + b, '6')
    for k in range(4): c.dot(gx - 7 + k * 2, 49 + b, 'm'); c.dot(gx + 1 + k * 2, 59 + b, 'm')      # the stitches round the patches
    c.ell(gx + 1, 44 + b, 2.2, 2.2, 'k'); c.dot(gx, 43 + b, 'w')
    hx, hy = gx + 3 + L * .2 + P['hx'], 24 + b
    for i in range(4): c.line(hx - 9 + i * 6, hy - 9, hx - 12 + i * 7 + P['hair'], hy - 20 + (i % 2) * 3, 2, '7')      # yarn hair
    c.ell(hx, hy, 13, 12, '2'); c.ell(hx + 1, hy - 2, 3.2, 3.2, 'k'); c.dot(hx, hy - 3, 'w')      # the head and the button eye
    c.line(hx + 6, hy - 5, hx + 10, hy, 1, 'm'); c.line(hx + 10, hy - 5, hx + 6, hy, 1, 'm')      # the other eye is stitched shut
    mo = P['mo']
    for i in range(5): c.line(hx - 4 + i * 3, hy + 6 + (i % 2) * 2 + mo, hx - 1 + i * 3, hy + 6 + ((i + 1) % 2) * 2 + mo, 1, 'm')
    c.line(hx - 11, hy + 2, hx - 6, hy + 4, 1, 'm')
    (ex, ey), (ax, ay) = limb(c, gx + 8, 40 + b, P['ua'], 12, P['la'], 12, 5, '2'); c.ell(ax, ay, 3.5, 3.5, '2')
    if P['sc'] > .5:      # the giant scissors: two blades and two ring handles
        sa, op = P['sa'], P['op']
        for sg in (-1, 1):
            ang = sa + sg * op * 22; tip = pt(ax, ay, ang, 25); c.poly([pt(ax, ay, ang + 90, 2.2), tip, pt(ax, ay, ang - 90, 2.2)], 'n')
            hx2, hy2 = pt(ax, ay, sa + 180 + sg * 28, 6); c.ell(hx2, hy2, 3.4, 3.4, 'N')
    if P['nd'] > .05:      # the needle, with its thread
        tip = pt(ax, ay, P['sa'], 6 + P['nd'] * 26); c.line(ax, ay, tip[0], tip[1], 2, 'n'); tl = pt(ax, ay, P['sa'] + 180, 10); c.line(ax, ay, tl[0], tl[1], 1, 'm')
    return c
DOLL_B = dict(bob=0, lean=0, legA=0, legB=0, liftA=0, liftB=0, hx=0, hair=0, mo=0, ua=80, la=20, sa=-20, op=.3, sc=1, nd=0)
DOLL = dict(
    idle=(8, True, [(0, {}), (.5, dict(bob=1, hair=2, hx=1, op=.5, sa=-26))]),
    walk=(8, True, [(0, dict(legA=-4, legB=4, liftA=0, liftB=3, bob=0, hair=-1)), (.5, dict(legA=4, legB=-4, liftA=3, liftB=0, bob=1, hair=2))]),
    a1=A10(dict(), dict(lean=-4, ua=-20, la=-20, sa=-10, sc=0, nd=.3, mo=0), dict(lean=6, ua=10, la=0, sa=0, sc=0, nd=1, mo=1), dict(lean=3, ua=30, la=10, sa=0, sc=0, nd=.6)),
    a2=A10(dict(), dict(lean=-4, ua=-70, la=-110, sa=-100, op=.9, bob=-1), dict(lean=5, ua=-10, la=0, sa=0, op=.4, sc=0), dict(lean=3, ua=40, la=10, sc=0)),
    a3=A10(dict(), dict(lean=-3, ua=-30, la=-60, sa=-60, op=1, bob=-2, legA=-3, legB=3), dict(lean=4, ua=0, la=10, sa=250, op=1, bob=1), dict(lean=3, ua=20, la=20, sa=430, op=.6)),
    hurt=(3, False, [(0, dict(lean=-6, hx=-3, mo=2, ua=110, la=60, sa=40, op=.6)), (1, dict(lean=-4, hx=-2, mo=1, ua=100, la=50, sa=20))]),
)
DOLL_PAL = {'o': '#1a0f0c', '1': '#8a6a52', '2': '#d9b99b', '3': '#f2dcc2', '5': '#a8323e', '6': '#3a5a9a', '7': '#c2552f', 'k': '#1a1410', 'w': '#ffffff', 'm': '#2a1a14', 'n': '#d4dae6', 'N': '#7a8294'}
DOLL_MATS = {'2': ('1', '3'), '7': ('o', '7')}

# ------------------------------------------------------------------ 4. BLADE MANTIS (a tall mantis with two scythe arms: scythe slash, cross cut, crescent wave)
def scythe(c, x, y, a1, a2, ch):
    (ex, ey), (tx, ty) = limb(c, x, y, a1, 20, a2, 28, 5, ch)
    for k in range(1, 5): bx, by = ex + (tx - ex) * k / 5, ey + (ty - ey) * k / 5; qx, qy = pt(bx, by, a2 + 90, 4); c.line(bx, by, qx, qy, 1, '3')      # the spikes on the inner edge
    c.poly([pt(tx, ty, a2 + 90, 3), pt(tx, ty, a2 - 12, 13), pt(tx, ty, a2 - 90, 3)], '3')      # the blade tip
    return tx, ty
def mantis(P):
    c = Cv(144, 138); b = P['bob'] + 22; L = P['lean']; sw = P['sw']; tx, ty = 52 + L * .4, 66 + b
    for dx, a1, a2, ch in ((-11, 125, 75, '1'), (9, 60, 100, '1')): limb(c, tx + dx, ty + 8, a1 + sw, 17, a2 - sw * .5, 21, 3, ch)      # the far legs
    rell(c, tx - 20, ty - 2, 24, 8, -12 + P['ab'], '2'); rell(c, tx - 20, ty - 7, 26, 5, -12 + P['ab'], 'q')      # the abdomen and the folded wings
    for dx, a1, a2 in ((-9, 125, 75), (11, 55, 100)): limb(c, tx + dx, ty + 8, a1 - sw, 17, a2 + sw * .5, 21, 3, '2')      # the near legs
    nx, ny = tx + 14 + L * .6, ty - 32; c.line(tx + 2, ty - 2, nx, ny + 4, 7, '2')      # the long neck-body
    c.poly([(nx - 7, ny - 5), (nx + 8, ny - 5), (nx + 1, ny + 9)], '2'); c.ell(nx - 4, ny - 3, 3, 4, 'e'); c.ell(nx + 6, ny - 3, 3, 4, 'e'); c.dot(nx - 3, ny - 3, 'k'); c.dot(nx + 7, ny - 3, 'k')
    c.line(nx - 1, ny + 8, nx - 3, ny + 12, 1, '1'); c.line(nx - 3, ny - 5, nx - 10, ny - 18, 1, '1'); c.line(nx + 4, ny - 5, nx + 14, ny - 17, 1, '1')
    scythe(c, nx - 3, ny + 12, P['fa'], P['fb'], '1')      # the far scythe
    sx, sy = scythe(c, nx - 1, ny + 12, P['ua'], P['la'], '2')      # the near scythe
    if P['arc'] > .5:      # the crescent wave comes off the blade
        for t in range(-64, 65, 2): x, y = pt(sx - 6, sy - 4, t, 32); c.rect(x - 2, y - 2, x + 2, y + 2, 'c')
    return c
MANTIS_B = dict(bob=0, lean=0, sw=0, ab=0, ua=-55, la=120, fa=-50, fb=115, arc=0)
MANTIS = dict(
    idle=(8, True, [(0, {}), (.5, dict(bob=1, ab=3, ua=-60, la=112, fa=-56, fb=108))]),
    walk=(8, True, [(0, dict(sw=14, bob=0, ab=2)), (.5, dict(sw=-14, bob=-1, ab=-2))]),
    a1=A10(dict(), dict(lean=-5, ua=-120, la=-70, fa=-110, fb=-60, bob=-1), dict(lean=7, ua=-15, la=70, fa=-25, fb=75), dict(lean=4, ua=10, la=85, fa=0, fb=90)),
    a2=A10(dict(), dict(lean=-4, ua=-100, la=-150, fa=-40, fb=60, bob=-1), dict(lean=6, ua=-10, la=60, fa=-95, fb=-20), dict(lean=4, ua=15, la=80, fa=-40, fb=50)),
    a3=A10(dict(), dict(lean=-6, ua=-130, la=-90, fa=-120, fb=-80, bob=-2), dict(lean=7, ua=-20, la=40, fa=-60, fb=60, arc=1), dict(lean=5, ua=10, la=70, fa=-30, fb=90, arc=1)),
    hurt=(3, False, [(0, dict(lean=-7, bob=1, ab=-5, ua=-20, la=140, fa=-20, fb=130)), (1, dict(lean=-5, bob=1, ab=-3, ua=-30, la=130, fa=-30, fb=122))]),
)
MANTIS_PAL = {'o': '#0e1a08', '1': '#2f5a1c', '2': '#6fa83a', '3': '#b4e066', 'q': '#a8d890', 'e': '#ffd23a', 'k': '#1a1a08', 'c': '#6cf3ff'}
MANTIS_MATS = {'2': ('1', '3')}

# ------------------------------------------------------------------ 5. SHELL CRAB (a wide armoured crab with a huge claw: claw snap, bubble barrage, shell rush)
def crab(P):
    c = Cv(136, 118); b = P['bob'] + P['cr'] + 14; L = P['lean']; gx = 56 + L * .3; sw = P['sw']
    for dx, a1, a2 in ((-22, 150, 100), (-8, 140, 92), (8, 40, 88), (22, 30, 80)): limb(c, gx + dx + 4, 64 + b, a1, 17, a2 + sw * (1 if dx < 0 else -1), 16, 3, '1')      # the far legs
    limb(c, gx - 6, 52 + b, 130, 12, 160, 10, 5, '1')      # the far claw arm (small)
    for dx, a1, a2 in ((-26, 155, 105), (-14, 145, 95), (4, 35, 85), (18, 25, 75)): limb(c, gx + dx, 66 + b, a1, 17, a2 + sw * (-1 if dx < 0 else 1), 16, 3, '2')      # the near legs
    c.ell(gx, 58 + b, 30, 20, '2'); c.ell(gx, 66 + b, 26, 7, '1')
    for k in range(5): x = gx - 20 + k * 10; dy = abs(k - 2); c.poly([(x - 2, 44 + b + dy * 2), (x, 35 + b + dy * 3), (x + 2, 44 + b + dy * 2)], '3')      # the spikes on the shell
    for dx, dy in ((-12, 56), (-3, 50), (12, 60), (-18, 62)): c.ell(gx + dx, dy + b, 2.4, 2.4, '3')      # barnacles
    for dx in (14, 22): c.line(gx + dx, 44 + b, gx + dx + 2, 34 + b, 2, '4'); c.ell(gx + dx + 2, 32 + b, 3, 3.5, 'e'); c.dot(gx + dx + 3, 32 + b, 'k')      # eye stalks
    (ex, ey), (tx, ty) = limb(c, gx + 22, 54 + b, P['ua'], 15, P['la'], 13, 10, '2'); cl = P['cl']
    c.ell(tx, ty, 11, 10, '2')
    ta = pt(tx, ty, P['la'] - 8 - 34 * cl, 21); tb = pt(tx, ty, P['la'] + 10 + 8 * cl, 19)      # the two pincers
    c.line(tx, ty, ta[0], ta[1], 9, '2'); c.line(tx, ty, tb[0], tb[1], 8, '3'); c.dot(ta[0], ta[1], 'w'); c.dot(tb[0], tb[1], 'w')
    if P['bb'] > .5:      # bubbles
        for x, y, r in ((gx + 36, 48 + b, 3), (gx + 46, 42 + b, 4), (gx + 55, 52 + b, 3), (gx + 62, 44 + b, 2)): c.ell(x, y, r, r, 'k'); c.dot(x - 1, y - 1, 'K')
    return c
CRAB_B = dict(bob=0, cr=0, lean=0, sw=0, ua=-50, la=-10, cl=.4, bb=0)
CRAB = dict(
    idle=(8, True, [(0, {}), (.5, dict(bob=1, ua=-55, la=-18, cl=.7))]),
    walk=(8, True, [(0, dict(sw=12, bob=0, cl=.3)), (.5, dict(sw=-12, bob=1, cl=.6))]),
    a1=A10(dict(), dict(ua=-115, la=-95, cl=1, lean=-3, bob=-1), dict(ua=-10, la=35, cl=.1, lean=6, cr=2), dict(ua=0, la=40, cl=.2, lean=4, cr=1)),
    a2=A10(dict(), dict(cr=3, lean=-3, ua=-30, la=20, cl=.2, bb=0), dict(cr=0, lean=3, ua=-60, la=-20, cl=.8, bb=1), dict(lean=2, ua=-55, la=-15, cl=.6, bb=1)),
    a3=A10(dict(), dict(cr=4, lean=-4, ua=30, la=80, cl=0, sw=8), dict(cr=3, lean=9, ua=40, la=85, cl=0, sw=-10), dict(cr=2, lean=7, ua=30, la=70, cl=.1, sw=6)),
    hurt=(3, False, [(0, dict(lean=-7, cr=2, ua=-80, la=-60, cl=1)), (1, dict(lean=-5, cr=1, ua=-70, la=-40, cl=.8))]),
)
CRAB_PAL = {'o': '#1a0c08', '1': '#6a2a18', '2': '#d8602a', '3': '#f0a05a', '4': '#8a3a20', 'e': '#fff0a0', 'k': '#9fe8f0', 'K': '#e8ffff', 'w': '#fff3d8'}
CRAB_MATS = {'2': ('1', '3'), '4': ('o', '2')}

NEW = [      # name, figure, base pose, animations, canvas w, h, the row he stands on, palette, shading, meta (cx = the column of his middle, hw = half his width for the hits)
    ('hound', hound, HOUND_B, HOUND, 118, 76, 66, HOUND_PAL, HOUND_MATS, dict(cx=48, hw=14)),
    ('wraith', wraith, WRAITH_B, WRAITH, 104, 122, 114, WRAITH_PAL, WRAITH_MATS, dict(cx=34, hw=10)),
    ('doll', doll, DOLL_B, DOLL, 112, 114, 108, DOLL_PAL, DOLL_MATS, dict(cx=34, hw=10)),
    ('mantis', mantis, MANTIS_B, MANTIS, 144, 138, 132, MANTIS_PAL, MANTIS_MATS, dict(cx=52, hw=11)),
    ('crab', crab, CRAB_B, CRAB, 136, 118, 106, CRAB_PAL, CRAB_MATS, dict(cx=56, hw=22)),
]

def main():
    out = json.load(open('curses.json'))
    for name, fig, base, anims, W, H, G, pal, mats, meta in NEW:
        sets = build(fig, base, anims, W, H, mats)
        out[name] = {'w': W, 'h': H, 'g': G, 'pal': pal, **meta, **{k: {'w': W, 'h': H, 'frames': v} for k, v in sets.items()}}
    json.dump(out, open('curses.json', 'w'), separators=(',', ':'))
    print('curses.json now has', list(out))
    if len(sys.argv) > 1:
        for name, *_ in NEW:
            d = out[name]; col = {k: tuple(int(v[i:i + 2], 16) for i in (1, 3, 5)) for k, v in d['pal'].items()}
            frames = [d['idle']['frames'][0], d['walk']['frames'][2]] + [d[a]['frames'][i] for a in ('a1', 'a2', 'a3') for i in (3, 5, 7)] + [d['hurt']['frames'][0]]
            S = 2; W, H = d['w'], d['h']; sheet = Image.new('RGB', (len(frames) * (W * S + 4), H * S + 4), (58, 52, 74))
            for i, fr in enumerate(frames):
                im = Image.new('RGB', (W, H), (58, 52, 74))
                for y, r in enumerate(fr):
                    for x, ch in enumerate(r):
                        if ch != '.': im.putpixel((x, y), col.get(ch, (255, 0, 255)))
                sheet.paste(im.resize((W * S, H * S), Image.NEAREST), (i * (W * S + 4), 0))
            sheet.save(sys.argv[1].replace('.png', '_' + name + '.png'))

if __name__ == '__main__': main()
