"""Verity's 15-frame animations (64x64, facing right; the game mirrors them). A little rig of joints is drawn with polygons, shaded, detailed and outlined like the first-form sprite.
anim(name) -> 15 frames. run: python3 verity_rig.py  ->  verity_anims.json (name -> png strip, 15 frames wide) and verity_sheet.png"""
import math, io, json, base64, copy
from PIL import Image, ImageDraw
S = 64; BASE, LIT, HI, SH, DK, OL, RIB, CLAW = (172,156,48), (206,192,80), (232,218,134), (128,114,38), (88,76,26), (26,18,6), (104,90,26), (62,52,16)
STAND = dict(hx=32, hy=6.5, sy=17, hp=36, lean=0, m=0, aL=((21,34),(20.5,52)), aR=((43,34),(43.5,52)), lL=((29.5,47),(30,59)), lR=((34.5,47),(34,59)), fade=0, glitch=0, ribs=1, bl=0)
mix = lambda a, b, t: tuple(mix(x, y, t) for x, y in zip(a, b)) if isinstance(a, tuple) else a + (b - a) * t
ease = lambda t: t * t * (3 - 2 * t)
def pose(**kw): p = copy.deepcopy(STAND); p.update(kw); return p
def blend(p, q, t): return {k: mix(p[k], q[k], t) for k in p}
def keys(kf, f):                                    # kf: [(frame, pose)], eased between neighbours
    kf = sorted(kf, key=lambda k: k[0])
    for (f0, p0), (f1, p1) in zip(kf, kf[1:]):
        if f0 <= f <= f1: return blend(p0, p1, ease((f - f0) / max(1, f1 - f0)))
    return kf[-1][1] if f > kf[-1][0] else kf[0][1]
def render(p):
    m = Image.new('L', (S, S), 0); d = ImageDraw.Draw(m); hx, hy, sy, hp, ln = p['hx'], p['hy'], p['sy'], p['hp'], p['lean']
    sh = lambda y: ln * max(0.0, min(1.2, (hp - y) / 20))
    ty = lambda y: (sy - 2) + (y - 15) * (hp - (sy - 2)) / 21
    g = int(round(p['m'] * 4)); d.ellipse((hx - 4, hy - 5.5, hx + 4, hy + 5.5 + g * 0.7), fill=255)                       # head (the jaw drops when the mouth opens)
    d.polygon([(hx - 2, hy + 3.5), (hx + 2, hy + 3.5), (33 + sh(sy), sy - 1), (31 + sh(sy), sy - 1)], fill=255)          # neck
    T = [(30,15),(34,15),(40,17),(37,19),(37,24),(36,29),(35,33),(36,36),(28,36),(29,33),(28,29),(27,24),(27,19),(24,17)]
    d.polygon([(x + sh(ty(y)), ty(y)) for x, y in T], fill=255)                                                           # shoulders, ribcage, belly
    for k, (E, H) in (('L', p['aL']), ('R', p['aR'])):
        S0 = (24 + sh(sy) if k == 'L' else 40 + sh(sy), sy); d.line([S0, E, H], fill=255, width=2); d.ellipse((H[0] - 1.6, H[1] - 1.6, H[0] + 1.6, H[1] + 1.6), fill=255)
    for k, (K, A) in (('L', p['lL']), ('R', p['lR'])):
        x0 = 30 if k == 'L' else 34; sg = -1 if k == 'L' else 1; d.line([(x0, hp - 1), K, A], fill=255, width=3); ay = A[1]
        d.polygon([(A[0] - 2 * sg + 0, ay), (A[0] + sg, ay), (A[0] + sg, ay + 2), (A[0] + 6 * sg, ay + 3), (A[0] + 6 * sg, ay + 2)] if sg > 0 else [(A[0] - 1.5, ay), (A[0] + 2, ay), (A[0] + 2, ay + 2), (A[0] - 6, ay + 3), (A[0] - 6, ay + 2)], fill=255)
    cl = Image.new('L', (S, S), 0); dc = ImageDraw.Draw(cl)
    for E, H in (p['aL'], p['aR']):                                                                                        # claws continue the forearm
        dx, dy = H[0] - E[0], H[1] - E[1]; n = math.hypot(dx, dy) or 1; dx, dy = dx / n, dy / n
        for o in (-1.2, 0, 1.2): dc.line([(H[0] + o * -dy, H[1] + o * dx), (H[0] + dx * 4.5 + o * -dy * 1.8, H[1] + dy * 4.5 + o * dx * 1.8)], fill=255)
    mk, ck = m.load(), cl.load(); on = lambda x, y: 0 <= x < S and 0 <= y < S and (mk[x, y] > 0 or ck[x, y] > 0)
    img = Image.new('RGBA', (S, S), (0, 0, 0, 0)); o = img.load()
    for y in range(S):
        for x in range(S):
            if mk[x, y]:
                a = x
                while a > 0 and mk[a - 1, y]: a -= 1
                b = x
                while b < S - 1 and mk[b + 1, y]: b += 1
                t = (x - a) / max(1, b - a); o[x, y] = (HI if t < .12 else LIT if t < .3 else BASE if t < .62 else SH if t < .85 else DK) + (255,)
            elif ck[x, y]: o[x, y] = CLAW + (255,)
    dot = lambda pts, c: [o.__setitem__((int(round(x)), int(round(y))), c + (255,)) for x, y in pts if on(int(round(x)), int(round(y)))]
    if p['ribs'] and hp - sy >= 17:
        for yy in (20, 22, 24, 26): dot([(29 + i + sh(ty(yy)), ty(yy) + (i > 1)) for i in range(3)] + [(35 - i + sh(ty(yy)), ty(yy) + (i > 1)) for i in range(3)], RIB)
        dot([(32 + sh(ty(y)), ty(y)) for y in range(18, 29)] + [(31 - i + sh(sy), ty(17)) for i in range(6)] + [(33 + i + sh(sy), ty(17)) for i in range(6)], RIB); dot([(30 + i + sh(ty(31)), ty(31) + i % 2) for i in range(5)], DK)
    bx, by = int(round(hx)) - 32, int(round(hy - 0.5)) - 6                                                                 # the face, relative to the head
    dot([(x + bx, y + by) for x in (29, 30, 34, 35) for y in (3, 4)], (10, 4, 3)); dot([(28 + bx, by + y) for y in range(5, 9)] + [(36 + bx, by + y) for y in range(5, 9)], SH)
    for xs, st in (((29, 30, 34, 35), 7), ((31, 32, 33), 8)):
        for x in xs:
            for k, c in enumerate([(84, 8, 18), (252, 248, 236)] + [(70, 6, 14)] * (1 + g) + [(252, 248, 236), (84, 8, 18)]):
                if p['bl'] and c == (252, 248, 236) and (x * 3 + k * 5 + st) % 7 < 5 * p['bl']: c = (176, 14, 26)      # bloody teeth
                dot([(x + bx, st + by + k)], c)
    for y in range(S):
        for x in range(S):
            if not on(x, y) and any(on(x + dx, y + dy) for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1))): o[x, y] = OL + (255,)
    if p['bl']:
        for x, n in ((29, 4), (31, 6), (33, 3), (35, 5)):                                                                   # blood drips from his chin
            for j in range(int(n * p['bl'])):
                xx, yy = x + bx, 14 + g + by + j
                if 0 <= xx < S and 0 <= yy < S: o[xx, yy] = (150, 10, 22, 255) if j % 2 else (190, 16, 30, 255)
    if p['glitch'] or p['fade']:                                                                                           # teleport: rows slide sideways and pixels drop out
        src = img.copy().load(); img = Image.new('RGBA', (S, S), (0, 0, 0, 0)); o = img.load(); B = [[0,8,2,10],[12,4,14,6],[3,11,1,9],[15,7,13,5]]
        for y in range(S):
            sx = int(round(((y * 7) % 5 - 2) * p['glitch']))
            for x in range(S):
                if 0 <= x - sx < S and src[x - sx, y][3] and B[y % 4][x % 4] / 16 >= p['fade']: o[x, y] = src[x - sx, y]
    return img
def walkp(f):
    w = 2 * math.pi * f / 15; s, c = math.sin(w), math.cos(w); up = lambda v: -2.2 * max(0, v)
    return pose(hy=6.5 + 0.6 * abs(s), sy=17 + 0.6 * abs(s), lean=1.5, aL=((21 + 2 * s, 34), (20.5 + 4 * s, 52)), aR=((43 - 2 * s, 34), (43.5 - 4 * s, 52)),
                lL=((29.5 - 3 * s, 47 + up(-c)), (30 - 5 * s, 59 + up(s))), lR=((34.5 + 3 * s, 47 + up(c)), (34 + 5 * s, 59 + up(-s))))
def idlep(f):
    w = 2 * math.pi * f / 15; s = math.sin(w); return pose(lean=1.2 * s, hy=6.5 + 0.5 * math.sin(w + 1), aL=((21 + 0.6 * s, 34), (20.5 + 1.2 * s, 52 + 0.4 * math.sin(w + 1))), aR=((43 + 0.6 * s, 34), (43.5 + 1.2 * s, 52 + 0.4 * math.sin(w + 1))))
FOLD = dict(hx=33, hy=36, sy=42, hp=55, lean=1, ribs=0, aL=((21, 53), (18, 61)), aR=((45, 53), (47, 61)), lL=((24, 40), (28, 61)), lR=((42, 40), (37, 61)))        # crouched: the legs folded up beside the head
CROUCH = [(0, pose()), (14, pose(**FOLD))]
CLAW1 = [(0, pose(**FOLD)), (4, pose(**{**FOLD, 'aR': ((48, 52), (53, 52))}) ), (6, pose(**{**FOLD, 'lean': 4, 'aR': ((52, 50), (60, 55))})), (9, pose(**{**FOLD, 'lean': 3, 'aR': ((52, 54), (59, 61))})), (14, pose(**FOLD))]
CLAW2 = [(0, pose(**FOLD)), (4, pose(**{**FOLD, 'aL': ((17, 52), (12, 52))})), (6, pose(**{**FOLD, 'lean': 4, 'aL': ((22, 50), (58, 54))})), (9, pose(**{**FOLD, 'lean': 3, 'aL': ((24, 54), (57, 61))})), (14, pose(**FOLD))]
JUMPC = dict(hy=14, sy=25, hp=44, lean=2, aL=((20, 38), (19, 50)), aR=((44, 38), (45, 50)), lL=((36, 53), (31, 59)), lR=((38, 53), (36, 59)))      # crouched for the jump
JUMPA = dict(hy=5.5, lean=-1, aL=((17, 24), (12, 12)), aR=((47, 24), (52, 12)), lL=((31, 44), (27, 51)), lR=((35, 44), (37, 51)))      # in the air: arms up, legs tucked
GRAB = ((51, 17), (61, 16))      # the JUMPSCARE grab: the arm straight out at shoulder height, the hand where a standing fighter's throat is
SEIZE = ((52, 22), (61, 28))      # the right arm straight out: the hand is where Gojo's throat is
A = {
 'idle': idlep, 'walk': walkp,
 'm0': lambda f: keys([(0, pose()), (3, pose(lean=-3, aR=((46, 28), (52, 12)))), (6, pose(lean=2, aR=((50, 26), (56, 16)))), (7, pose(lean=5, aR=((54, 32), (60, 40)))), (9, pose(lean=5, aR=((54, 34), (59, 44)))), (14, pose())], f),
 'm1': lambda f: keys([(0, pose()), (3, pose(lean=-3, aL=((18, 28), (14, 12)))), (6, pose(lean=2, aL=((26, 24), (46, 12)))), (7, pose(lean=5, aL=((34, 28), (60, 36)))), (9, pose(lean=5, aL=((36, 34), (59, 44)))), (14, pose())], f),
 'm2': lambda f: keys([(0, pose()), (4, pose(lean=2, aL=((26, 28), (40, 26)), aR=((46, 28), (52, 26)))), (7, pose(lean=5, hy=8, aL=((36, 30), (54, 32)), aR=((50, 30), (58, 32)))), (10, pose(lean=4, hy=8, aL=((34, 34), (46, 36)), aR=((46, 34), (50, 36)))), (14, pose())], f),
 'm3': lambda f: keys([(0, pose()), (6, pose(lean=-4, hy=7.5, aR=((44, 36), (36, 46)), lL=((28.5, 47), (28, 59)))), (8, pose(lean=7, hy=9, aR=((56, 38), (62, 46)), lL=((28, 47), (26, 59)))), (11, pose(lean=6, hy=9, aR=((56, 38), (61, 46)))), (14, pose())], f),
 'crouch': lambda f: keys(CROUCH, f), 'c0': lambda f: keys(CLAW1, f), 'c1': lambda f: keys(CLAW2, f),
 'block': lambda f: keys([(0, pose()), (5, pose(aL=((22, 26), (31, 12)), aR=((42, 26), (33, 12)))), (14, pose(aL=((22, 26), (31, 12)), aR=((42, 26), (33, 12))))], f),
 'bite': lambda f: keys([(0, pose()), (5, pose(lean=-3, hx=30, hy=5, m=1, aL=((18, 34), (14, 50)), aR=((46, 34), (50, 50)))), (8, pose(lean=9, hx=44, hy=11, m=1, aL=((18, 34), (14, 50)), aR=((46, 34), (52, 48)))), (10, pose(lean=9, hx=45, hy=12, m=0.2)), (14, pose())], f),
 'hurt': lambda f: keys([(0, pose()), (3, pose(lean=-6, hx=29, hy=8, m=0.6, aL=((16, 28), (10, 22)), aR=((48, 28), (54, 22)))), (8, pose(lean=-5, hx=30, hy=8, m=0.4, aL=((17, 30), (12, 28)), aR=((47, 30), (52, 28)))), (14, pose())], f),
 'seize': lambda f: keys([(0, pose()), (3, pose(lean=3, hy=7.5, aR=((50, 26), (60, 30)))), (5, pose(lean=3, hy=7.5, aR=SEIZE)), (7, pose(lean=-3, hx=29, hy=5, m=1, aR=SEIZE)), (9, pose(lean=10, hx=50, hy=14, m=1, aR=SEIZE)), (10, pose(lean=11, hx=55, hy=16, m=0, bl=1, aR=SEIZE)), (12, pose(lean=8, hx=50, hy=13, m=0.15, bl=1, aR=SEIZE)), (14, pose(lean=2, hx=40, hy=9, m=0.3, bl=1, aR=((46, 28), (50, 38))))], f),      # the DEATH: the arm reaches out and grips Gojo's throat (5), the head draws back, jaws wide (7), lunges (9) and the jaws shut on his head (10), pulls back, bloody (12), lets go (14)
 'jump': lambda f: keys([(0, pose()), (3, pose(**JUMPC)), (5, pose(**JUMPA)), (10, pose(**{**JUMPA, 'lean': 1})), (12, pose(**JUMPC)), (14, pose())], f),      # (playable Verity: crouch, push off, in the air with the arms up and the legs tucked, land)
 'talk': lambda f: {**idlep(f), 'm': 0.6 * (0.5 - 0.5 * math.cos(2 * math.pi * f / 15))},      # (the idle sway and breathing, with the mouth opening and closing)
 'scare_grab': lambda f: keys([(0, pose()), (3, pose(lean=-4, hy=7.5, m=0.3, aR=((44, 26), (38, 12)))), (6, pose(lean=7, hy=9, m=0.7, aR=((54, 18), (62, 17)), aL=((18, 30), (12, 40)))), (8, pose(lean=8, hx=34, hy=9, m=1, aR=GRAB)), (10, pose(lean=-1, hx=30, hy=4.5, m=1, aR=GRAB)), (12, pose(lean=-4, hx=29, hy=4, m=1, aR=GRAB)), (14, pose(lean=-3, hx=30, hy=4.5, m=1, aR=GRAB))], f),      # (the JUMPSCARE grab: the wind-up, the lunge, the grip on the throat, the head thrown back while the jaws open)
 'tele': lambda f: pose(glitch=(0, .6, 1.2, 1.8, 2.4, 3, 3.5, 0, 3.5, 3, 2.4, 1.8, 1.2, .6, 0)[f], fade=(0, .1, .25, .4, .55, .7, .85, 1, .85, .7, .55, .4, .25, .1, 0)[f]),
}

def scare_face(f):
    """the JUMPSCARE close-up, 64x64: the long egg-shaped head with two black eyes, the huge grin with the jaws stretched wide open (the skin drawn down with them) and rows of teeth, the neck, the gaunt ribs and the long arms (frame f of 15: the head jerks and rolls, the jaw opens and quivers)"""
    m = min(1.0, 0.35 + f * 0.13) if f < 5 else 0.78 + 0.22 * math.sin(f * 1.7)
    jx, jy = round(2 * math.sin(f * 2.3)), round(1.6 * math.sin(f * 1.9 + 1)); tilt = 0.10 * math.sin(f * 0.84); z = 1 + 0.05 * math.sin(f * 0.7 + 0.5)
    hx, hy = 32 + jx, 18 + jy; by = -round(jy * 0.5); rx, ry = 12 * z, 16 * z; bot = hy + 12 * z + 15 * m      # bot: how far down the stretched jaw reaches
    mask = Image.new('L', (S, S), 0); d = ImageDraw.Draw(mask); sh = lambda x, y: x + (y - hy) * tilt
    d.polygon([(sh(hx + rx * math.sin(t) * (1 - 0.10 * math.cos(t)), hy - ry * math.cos(t)), hy - ry * math.cos(t)) for t in [i * math.pi / 18 for i in range(36)]], fill=255)      # the head: narrow at the top, wide at the cheeks
    d.polygon([(sh(hx - 11 * z, hy + 7), hy + 7), (sh(hx + 11 * z, hy + 7), hy + 7), (sh(hx + 9 * z, bot), bot), (sh(hx, bot + 5), bot + 5), (sh(hx - 9 * z, bot), bot)], fill=255)      # the skin of the face is pulled down with the jaw
    d.polygon([(11, 47 + by), (22, 43 + by), (42, 43 + by), (53, 47 + by), (51, 64), (13, 64)], fill=255)      # shoulders and the gaunt chest
    d.polygon([(sh(hx - 4, hy + ry - 2), hy + ry - 2), (sh(hx + 4, hy + ry - 2), hy + ry - 2), (37, 46 + by), (27, 46 + by)], fill=255)      # the neck
    d.line([(12, 46 + by), (8 + (f % 3 - 1), 64)], fill=255, width=4); d.line([(52, 46 + by), (56 - (f % 3 - 1), 64)], fill=255, width=4)      # the long arms
    mk = mask.load(); img = Image.new('RGBA', (S, S), (0, 0, 0, 0)); o = img.load()
    for y in range(S):
        x = 0
        while x < S:
            if not mk[x, y]: x += 1; continue
            a0 = x
            while x < S and mk[x, y]: x += 1
            b0 = x - 1
            for xx in range(a0, b0 + 1):
                t = (xx - a0) / max(1, b0 - a0); o[xx, y] = (HI if t < .12 else LIT if t < .3 else BASE if t < .62 else SH if t < .85 else DK) + (255,)
    dot = lambda pts, c: [o.__setitem__((int(round(x)), int(round(y))), c + (255,)) for x, y in pts if 0 <= int(round(x)) < S and 0 <= int(round(y)) < S]
    for yy in (49, 53, 57, 61):      # the ribs and the breastbone
        dot([(20 + i, yy + (i > 5) + by) for i in range(10)] + [(44 - i, yy + (i > 5) + by) for i in range(10)], RIB)
    dot([(32, y + by) for y in range(50, 63)] + [(23 + i, 45 + by + i // 3) for i in range(7)] + [(41 - i, 45 + by + i // 3) for i in range(7)], DK)      # breastbone, collarbones
    for cx, cy in [(sh(hx - 6.5 * z, hy - 6), hy - 6), (sh(hx + 6.5 * z, hy - 6), hy - 6)]:      # the eyes: two black ovals with a speck of light
        ImageDraw.Draw(img).ellipse((cx - 2.3, cy - 2.8, cx + 2.3, cy + 2.8), fill=(8, 3, 2, 255)); dot([(cx - 1, cy - 2)], (150, 130, 90))
    top = lambda x: hy + 5 + 4.5 * (1 - ((x - hx) / (11 * z)) ** 2) * -1 + 4.5      # the smile line: the corners are high, the middle hangs low
    mouth = [(sh(hx - 11.5 * z, hy + 4), hy + 4)] + [(sh(hx + (i - 5) * 2.3 * z, 0), top(hx + (i - 5) * 2.3 * z)) for i in range(11)] + [(sh(hx + 11.5 * z, hy + 4), hy + 4)]
    for i in range(1, 14):      # then down round a tall oval: the open mouth reaches the chest
        a = i * math.pi / 14; yy = hy + 6 + (bot - hy - 6) * math.sin(a); mouth.append((sh(hx + 11 * z * math.cos(a) * (1 - 0.22 * math.sin(a)), yy), yy))
    md = ImageDraw.Draw(img); md.polygon([(round(x), round(y)) for x, y in mouth], fill=(84, 8, 18, 255))
    md.polygon([(round(x * 0.55 + hx * 0.45), round(y * 0.7 + (hy + 12) * 0.3)) for x, y in mouth], fill=(48, 3, 10, 255))      # the dark throat
    md.ellipse((hx - 4, bot - 6, hx + 4, bot - 1), fill=(150, 40, 60, 255))                                                  # the tongue
    for i in range(-5, 6):      # the upper teeth (pink gum, then teeth hanging from the smile line) and a few lower ones standing on the jaw
        x = hx + i * 2.0 * z; ty = top(x); dot([(sh(x, ty), ty - 1)], (190, 110, 130)); dot([(sh(x, ty), ty), (sh(x, ty), ty + 1), (sh(x, ty), ty + 2 + (abs(i) < 3))], (252, 248, 236))
        if abs(i) <= 3: dot([(sh(x, bot - 2), bot - 2 - (abs(i) < 2)), (sh(x, bot - 3), bot - 3)], (236, 230, 220))
    mo = img.copy().load()      # (read from an untouched copy, so the outline does not spread while it is drawn)
    for y in range(S):
        for x in range(S):
            if mo[x, y][3] == 0 and any(0 <= x + dx < S and 0 <= y + dy < S and mo[x + dx, y + dy][3] > 0 for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1))): o[x, y] = OL + (255,)
    return img
def sheet_png(frames): im = Image.new('RGBA', (S * 15, S), (0, 0, 0, 0)); [im.paste(fr, (i * S, 0)) for i, fr in enumerate(frames)]; return im
def url(im): b = io.BytesIO(); im.save(b, 'PNG'); return 'data:image/png;base64,' + base64.b64encode(b.getvalue()).decode()
def strips(sm):                                     # every animation as a 15-frame strip (data URL), plus the smiley ball bobbing and squashing
    out = {n: url(sheet_png([render(fn(f)) for f in range(15)])) for n, fn in A.items()}; disc = sm.crop((7, 9, 58, 60)); fr = []
    for f in range(15):
        s = math.sin(2 * math.pi * f / 15); w, h = round(51 * (1 + .05 * s)), round(51 * (1 - .05 * s)); im = Image.new('RGBA', (S, S), (0, 0, 0, 0)); d2 = disc.resize((w, h), Image.NEAREST); im.paste(d2, (32 - w // 2, round(34 - h / 2 + 2 * s)), d2); fr.append(im)
    out['smiley'] = url(sheet_png(fr)); out['scare'] = url(sheet_png([scare_face(f) for f in range(15)])); return out      # (scare = the JUMPSCARE close-up, 15 frames)
