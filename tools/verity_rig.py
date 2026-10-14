"""Verity's 15-frame animations (64x64, facing right; the game mirrors them). A little rig of joints is drawn with polygons, shaded, detailed and outlined like the first-form sprite.
anim(name) -> 15 frames. run: python3 verity_rig.py  ->  verity_anims.json (name -> png strip, 15 frames wide) and verity_sheet.png. The ten hit reactions rx0..rx9 are 15 cells of 96x64 (not 64x64): the figure is pasted 32 px to the right, so his centre column lands on x=64."""
import math, io, json, base64, copy
from PIL import Image, ImageDraw
S = 64; BASE, LIT, HI, SH, DK, OL, RIB, CLAW = (172,156,48), (206,192,80), (232,218,134), (128,114,38), (88,76,26), (26,18,6), (104,90,26), (62,52,16)
STAND = dict(hx=32, hy=6.5, sy=17, hp=36, lean=0, m=0, aL=((21,34),(20.5,52)), aR=((43,34),(43.5,52)), lL=((29.5,47),(30,59)), lR=((34.5,47),(34,59)), fade=0, glitch=0, vg=0, ribs=1, bl=0, nohead=0)
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
    g = int(round(p['m'] * 4))
    if not p['nohead']:
        d.ellipse((hx - 4, hy - 5.5, hx + 4, hy + 5.5 + g * 0.7), fill=255)                                                # head (the jaw drops when the mouth opens)
        d.polygon([(hx - 2, hy + 3.5), (hx + 2, hy + 3.5), (33 + sh(sy), sy - 1), (31 + sh(sy), sy - 1)], fill=255)      # neck
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
    if not p['nohead'] and not p.get('back'):                                                                                  # (back: the spin of a hit reaction shows the back of his skull: no face)
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
    if p['nohead']:                                                                                                         # the cut neck: a red stump on the shoulders and blood running down the chest
        for k, (xx, n) in enumerate(((31, 7), (33, 10), (35, 5))):
            for j in range(n):
                X, Y = xx + round(sh(ty(17 + j * 0.9))), round(sy - 1 + j)
                if 0 <= X < S and 0 <= Y < S: o[X, Y] = ((190, 16, 30, 255) if (j + k) % 2 else (150, 10, 22, 255))
        for xx in range(30, 37):
            X = xx + round(sh(sy)); Y = round(sy - 2)
            if 0 <= X < S and 0 <= Y < S: o[X, Y] = (176, 14, 26, 255)
    if p['bl'] and not p['nohead'] and not p.get('back'):
        for x, n in ((29, 4), (31, 6), (33, 3), (35, 5)):                                                                   # blood drips from his chin
            for j in range(int(n * p['bl'])):
                xx, yy = x + bx, 14 + g + by + j
                if 0 <= xx < S and 0 <= yy < S: o[xx, yy] = (150, 10, 22, 255) if j % 2 else (190, 16, 30, 255)
    if p['glitch'] or p['fade'] or p['vg']:                                                                                           # teleport: rows slide sideways and pixels drop out
        src = img.copy().load(); img = Image.new('RGBA', (S, S), (0, 0, 0, 0)); o = img.load(); B = [[0,8,2,10],[12,4,14,6],[3,11,1,9],[15,7,13,5]]
        for y in range(S):
            sx = int(round(((y * 7) % 5 - 2) * p['glitch']))
            for x in range(S):
                if 0 <= x - sx < S and src[x - sx, y][3] and B[y % 4][x % 4] / 16 >= p['fade']: o[x, y] = src[x - sx, y]
        if p['vg']:                                                                                                        # teleport UP: the columns slide up and down
            src = img.copy().load(); img = Image.new('RGBA', (S, S), (0, 0, 0, 0)); o = img.load()
            for x in range(S):
                sy_ = int(round(((x * 5) % 7 - 3) * p['vg']))
                for y in range(S):
                    if 0 <= y - sy_ < S and src[x, y - sy_][3]: o[x, y] = src[x, y - sy_]
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
# ---------------------------------------------------------------- the FATALITY (Verity's own): the wind-up and the neck grab, the punch, the sprinter's start position, the run, the leap in front of the runner, the catch of the arm, the grip on the shoulders, the bite; and the victim's headless body
HOLD = ((51, 15), (61, 13))                                                                   # the right hand lifts the victim by the neck
CROUCHP = dict(hx=50, hy=21, sy=30, hp=48, lean=16, m=0.1, aL=((47, 45), (50, 60)), aR=((55, 46), (58, 60)), lL=((25, 57), (13, 60)), lR=((46, 50), (39, 60)))      # the SPRINTER'S START: one knee down, the back leg stretched out, the front foot flat, both hands on the ground, the head up and looking ahead
LEAPP = dict(hx=54, hy=17, sy=25, hp=41, lean=15, m=1, aL=((52, 30), (62, 28)), aR=((50, 33), (60, 36)), lL=((24, 47), (11, 52)), lR=((31, 49), (20, 57)))              # in the air: stretched out flat, the arms reaching ahead, the legs trailing
AIMS = dict(m=1, aL=((46, 24), (60, 18)), aR=((54, 20), (62, 17)))                          # both hands out at shoulder height
def runp(f):
    w = 2 * math.pi * f / 15; s, c = math.sin(w), math.cos(w); b = 1.3 * abs(s); up = lambda v: -8 * max(0, v)
    return pose(lean=8, hx=36, hy=7 + b, sy=17 + b, hp=36 + 0.4 * b, aL=((26 + 7 * s, 29 + b), (26 + 15 * s, 37 - 4 * abs(s))), aR=((39 - 7 * s, 29 + b), (39 - 15 * s, 37 - 4 * abs(s))),
                lL=((29.5 - 9 * s, 46 + up(-c)), (30 - 15 * s, 58 + up(s) * 1.3)), lR=((34.5 + 9 * s, 46 + up(c)), (34 + 15 * s, 58 - up(s) * 1.3)))
def headp(f):      # the headless body: it sways and the arms twitch (the heart still pumps)
    w = 2 * math.pi * f / 15; s = math.sin(w); t = math.sin(w * 3 + 1)
    return {**idlep(f), 'nohead': 1, 'aL': ((21 + 1.5 * t, 34), (20 + 3 * t, 52 - 2 * abs(s))), 'aR': ((43 - 1.5 * t, 34), (44 - 3 * t, 52 - 2 * abs(t)))}
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
 'fx_grab': lambda f: keys([(0, pose()), (4, pose(lean=-5, hy=7.5, m=0.4, aR=((43, 22), (36, 8)), aL=((20, 32), (15, 44)))), (7, pose(lean=8, hy=9, m=0.8, aR=((54, 18), (62, 17)), aL=((18, 30), (12, 40)))), (9, pose(lean=7, hy=8.5, m=1, aR=GRAB)), (12, pose(lean=5, hx=31, hy=7, m=1, aR=HOLD)), (14, pose(lean=5, hx=31, hy=7, m=1, aR=HOLD))], f),      # (wind-up, lunge, the grip on the throat, lifting him)
 'fx_punch': lambda f: keys([(0, pose(lean=5, hy=7.5, m=0.8, aR=HOLD)), (4, pose(lean=2, hy=8, m=0.8, aR=HOLD, aL=((17, 26), (9, 22)))), (7, pose(lean=7, hy=9, m=1, aR=HOLD, aL=((40, 16), (60, 10)))), (9, pose(lean=7, hy=9, m=1, aR=HOLD, aL=((42, 17), (61, 11)))), (12, pose(lean=4, hy=8, m=0.6, aR=((51, 19), (60, 20)), aL=((30, 28), (34, 38)))), (14, pose(lean=2, hy=7.5, m=0.3, aR=((46, 26), (48, 36)), aL=((24, 32), (24, 46))))], f),      # (the left fist cocks back and drives into his face while the right hand holds him, then he is let go)
 'fx_crouch': lambda f: keys([(0, pose(lean=2, m=0.3, aR=((46, 26), (48, 36)))), (5, pose(**{**CROUCHP, 'hy': 15, 'lean': 8, 'sy': 25, 'hp': 44, 'hx': 40, 'aL': ((38, 34), (42, 48)), 'aR': ((48, 36), (52, 50)), 'lL': ((27, 52), (20, 59)), 'lR': ((42, 49), (38, 59))})), (10, pose(**CROUCHP)), (12, pose(**{**CROUCHP, 'hy': 20, 'hp': 47, 'sy': 29.5})), (14, pose(**CROUCHP))], f),      # (he drops into the start position and holds it, breathing)
 'run': runp,
 'fx_leap': lambda f: keys([(0, pose(**CROUCHP)), (3, pose(**{**CROUCHP, 'lean': 21, 'hx': 55, 'hy': 21, 'sy': 27, 'hp': 44, 'lL': ((30, 52), (17, 60)), 'lR': ((45, 51), (38, 60)), 'aL': ((52, 41), (56, 55)), 'aR': ((59, 42), (61, 55))})), (5, pose(**LEAPP)), (8, pose(**{**LEAPP, 'hy': 18, 'lean': 14})), (10, pose(**JUMPC)), (12, pose(**{**JUMPC, 'lean': -1, 'hy': 12, 'sy': 22})), (14, pose())], f),      # (he explodes out of the start position, flies flat through the air and lands in a crouch)
 'fx_catch': lambda f: keys([(0, pose(lean=2, aR=((46, 28), (52, 30)))), (3, pose(lean=4, hy=8, m=0.5, aR=((52, 22), (60, 22)), aL=((20, 34), (18, 46)))), (5, pose(lean=6, hy=8, m=0.8, aR=((53, 21), (62, 20)), aL=((20, 34), (18, 46)))), (8, pose(lean=7, hy=8.5, m=0.9, aR=((53, 22), (62, 21)), aL=((22, 34), (22, 46)))), (11, pose(lean=6, hy=8, m=0.9, aR=((53, 20), (62, 19)), aL=((20, 34), (18, 46)))), (14, pose(lean=7, hy=8.5, m=1, aR=((53, 21), (62, 20)), aL=((22, 33), (22, 45))))], f),      # (his hand shoots out and closes on the arm that is swinging at him, then he holds it)
 'fx_shoulders': lambda f: keys([(0, pose(lean=7, hy=8.5, m=1, aR=((53, 21), (62, 20)))), (4, pose(lean=7, hy=8.5, **{**AIMS, 'm': 0.8})), (8, pose(lean=9, hx=34, hy=9, **AIMS)), (11, pose(lean=6, hx=31, hy=6, **AIMS)), (14, pose(lean=4, hx=30, hy=4, **AIMS))], f),      # (both hands on his shoulders, pulling him in, the head going back)
 'fx_bite': lambda f: keys([(0, pose(lean=4, hx=30, hy=4, **AIMS)), (3, pose(lean=-3, hx=28, hy=3, **AIMS)), (6, pose(lean=9, hx=46, hy=13, **AIMS)), (8, pose(lean=11, hx=52, hy=15, **{**AIMS, 'm': 0.2}, bl=1)), (11, pose(lean=7, hx=46, hy=10, **{**AIMS, 'm': 0.5}, bl=1)), (14, pose(lean=5, hx=40, hy=8, m=0.15, bl=1, aL=((46, 28), (54, 34)), aR=((50, 28), (56, 36))))], f),      # (the head draws back, lunges, the jaws shut on frame 8, he pulls back with blood on his mouth)
 'headless': headp,
 'tele_up': lambda f: {**keys([(0, pose(**JUMPA)), (6, pose(**{**JUMPA, 'aL': ((16, 18), (10, 4)), 'aR': ((48, 18), (54, 4)), 'lL': ((30, 47), (28, 57)), 'lR': ((35, 47), (36, 57))})), (8, pose(**{**JUMPA, 'aL': ((16, 18), (10, 4)), 'aR': ((48, 18), (54, 4)), 'lL': ((30, 47), (28, 57)), 'lR': ((35, 47), (36, 57))})), (14, pose(**{**JUMPA, 'lean': 1}))], f),
                   'fade': (0, .12, .26, .42, .58, .74, .9, 1, .9, .74, .58, .42, .26, .12, 0)[f], 'glitch': (0, .4, .8, 1.2, 1.6, 2, 2.4, 0, 2.4, 2, 1.6, 1.2, .8, .4, 0)[f], 'vg': (0, .5, 1, 1.5, 2, 2.5, 3, 3.5, 3, 2.5, 2, 1.5, 1, .5, 0)[f]},      # (Verity's double jump: in the air he vanishes, the columns of his body sliding up and down, and he is back higher up from frame 8)
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
def sheet_png(frames, w=S): im = Image.new('RGBA', (w * 15, S), (0, 0, 0, 0)); [im.paste(fr, (i * w, 0)) for i, fr in enumerate(frames)]; return im      # (w: the width of one cell, 64 or, for the hit reactions, 96)
def url(im): b = io.BytesIO(); im.save(b, 'PNG'); return 'data:image/png;base64,' + base64.b64encode(b.getvalue()).decode()
# ---------------------------------------------------------------- the 10 HIT REACTIONS rx0..rx9 (the same ten as Gojo's, drawn for Verity), 15 frames each. The cells are 96x64, not 64x64: the usual 64 cell is pasted 32 px to the right (his centre column x=32 lands on x=64), so there are 64 px of room on the left for a fall backwards
CW, FEET = 96, (64, 62)      # (the cell width; the row of the soles and the usual column of his feet: the pivot of a fall)
def P(**kw): return pose(**{'dx': 0, 'dy': 0, 'rot': 0, 'sx': 1, **kw})      # + what the rig cannot do, done on the finished picture: dx / dy shift it, rot turns it about the back of his feet (deg, negative = backwards; the pivot is the left-most sole pixel, so nothing can sink below the ground), sx squashes it about his axis (negative = mirrored = turned round)
sc = lambda kf, f: keys([(a, {'v': v}) for a, v in kf], f)['v']                # a plain number eased through (frame, value) keys
def nn(im, fn):                                                                # nearest neighbour only, inverse-mapped (no holes, no smoothing): fn(x, y) -> the source pixel
    s = im.load(); out = Image.new('RGBA', im.size, (0, 0, 0, 0)); o = out.load(); W, H = im.size
    for y in range(H):
        for x in range(W):
            a, b = fn(x, y)
            if 0 <= a < W and 0 <= b < H: o[x, y] = s[a, b]
    return out
def squash(im, q, cx):                                                         # the spin: squash about the column cx (mirrored when q < 0). Each output column copies the opaque source pixel nearest to the spot it looks at among the 1/|q| source columns it covers, so thin arms and legs survive (still only existing pixels: no blending)
    s = im.load(); out = Image.new('RGBA', im.size, (0, 0, 0, 0)); o = out.load(); W, H = im.size; h = .5 / abs(q)
    for x in range(W):
        c = cx + (x - cx) / q; cols = sorted(range(math.ceil(c - h), math.floor(c + h) + 1), key=lambda a: abs(a - c))
        for y in range(H):
            for a in cols:
                if 0 <= a < W and s[a, y][3]: o[x, y] = s[a, y]; break
    return out
def outline(im, add):                                                          # drop the 1 px outline (a squash / rotation breaks it) and, if add, draw it again round whatever is opaque
    o = im.load(); W, H = im.size
    for y in range(H):
        for x in range(W):
            if o[x, y][3] and o[x, y][:3] == OL: o[x, y] = (0, 0, 0, 0)
    if add:
        new = [(x, y) for y in range(H) for x in range(W) if not o[x, y][3] and any(0 <= x + a < W and 0 <= y + b < H and o[x + a, y + b][3] for a, b in ((1, 0), (-1, 0), (0, 1), (0, -1)))]
        for q in new: o[q] = OL + (255,)
    return im
def cell(p):                                                                   # pose -> one 96x64 cell (everything is done on a padded canvas, and nothing may be lost at the cell's edges: that is asserted)
    r64 = render({**p, 'back': p['sx'] < 0}); bb = r64.getchannel('A').getbbox(); assert bb[0] > 0 and bb[2] < S, 'a limb is clipped by the 64 px render'      # (turned round: the back of his skull, no face)
    PX, PY = 40, 28; im = Image.new('RGBA', (CW + 2 * PX, S + 2 * PY), (0, 0, 0, 0)); im.paste(r64, (32 + PX, PY)); sx, r = p['sx'], p['rot']
    if sx != 1 or r:
        outline(im, False)
        if sx != 1: im = squash(im, sx if abs(sx) > .08 else .08, 64 + PX)
        if r: a = math.radians(r); ca, sa = math.cos(a), math.sin(a); fb = im.crop((0, PY + 60, im.size[0], PY + 63)).getchannel('A').getbbox(); px, py = (fb[0] if fb else FEET[0] + PX), FEET[1] + PY; im = nn(im, lambda x, y: (round(px + (x - px) * ca + (y - py) * sa), round(py - (x - px) * sa + (y - py) * ca)))
        outline(im, True)
    dx, dy = round(p['dx']), round(p['dy']); box = (PX - dx, PY - dy, PX - dx + CW, PY - dy + S); a = im.getchannel('A').getbbox()
    assert box[0] <= a[0] and a[2] <= box[2] and box[1] <= a[1] and a[3] <= box[3], 'something is clipped by the edge of the cell: %s %s' % (a, box)
    return im.crop(box)
part = lambda pk, t: blend(P(), pk, t)                                         # a reaction pose t of the way from standing to its peak pose pk
def stride(X, k=10):                                                           # the legs of a stagger, tied to how far the body has travelled (X px; one full step cycle per k px)
    w = -2 * math.pi * X / k; s, c = math.sin(w), math.cos(w); up = lambda v: -5 * max(0, v)
    return dict(lL=((29.5 - 3 * s, 47 + up(-c)), (30 - 5 * s, 59 + up(s))), lR=((34.5 + 3 * s, 47 + up(c)), (34 + 5 * s, 59 + up(-s))))
def rx0(f): return keys([(0, P(hx=29.5, hy=7, lean=-2, m=.5, dx=-1)), (2, P(hx=22.5, hy=6.5, lean=-6, m=1, dx=-2, aL=((18, 33), (13, 43)), aR=((47, 32), (52, 42)))),
    (4, P(hx=23.5, hy=7, lean=-5.5, m=.9, dx=-2, aL=((18, 34), (14, 46)), aR=((46, 33), (50, 46)))), (8, P(hx=28.5, hy=7, lean=-2.5, m=.35, dx=-1, aL=((20, 34), (17, 49)), aR=((44, 34), (47, 49)))),
    (11, P(hx=31, hy=6.8, lean=-.8, m=.1)), (14, P())], f)                                                                          # head snaps back (and the arms flare), then settles
DB = P(hx=41, hy=19, sy=25, hp=39, lean=12, m=.8, dx=-2, aL=((30, 38), (40, 36)), aR=((46, 40), (35, 38)), lL=((32, 49), (29.5, 59)), lR=((38, 49), (34.5, 59)))
DB2 = P(hx=42, hy=20, sy=26, hp=39.5, lean=13, m=.7, dx=-2, aL=((30, 39), (40, 37)), aR=((46, 41), (35, 39)), lL=((32, 49), (29.5, 59)), lR=((38, 49), (34.5, 59)))
def rx1(f): return keys([(0, part(DB, .35)), (2, DB), (4, DB2), (7, part(DB, .85)), (10, part(DB, .45)), (12, part(DB, .2)), (14, P())], f)      # doubled over: arms across the belly, head down
UPL, OUTL, UPR, OUTR = ((15, 26), (9, 13)), ((14, 33), (8, 41)), ((49, 25), (56, 12)), ((50, 32), (56, 40))      # the arms of a stagger: flung up or out
def rx2(f):
    X = sc([(0, -2), (2, -7), (4, -12), (6, -14.5), (8, -13), (10, -9), (12, -4), (14, 0)], f); e = sc([(0, .5), (2, 1), (10, 1), (14, 0)], f); fl = sc([(0, .3), (2, 1), (5, .9), (8, 1), (11, .4), (14, 0)], f); wb = math.sin(f * 1.7)
    u = .5 + .5 * math.sin(-2 * math.pi * X / 10 + 1)      # (one arm up while the other is out, swapping with the steps)
    return P(dx=X, hx=32 - 4 * e, hy=6.5 + e, lean=-(4 + wb) * e, m=.9 * e, aL=mix(STAND['aL'], mix(OUTL, UPL, u), fl), aR=mix(STAND['aR'], mix(OUTR, UPR, 1 - u), fl), **{k: mix(P()[k], v, e) for k, v in stride(X).items()})      # staggers back in steps, arms flung
def rx3(f):
    th = 2 * math.pi * sc([(0, 0), (1, 0), (11, 1), (14, 1)], f); c = math.cos(th); o = abs(math.sin(th)); w = sc([(0, .5), (3, 1), (6, .8), (9, .45), (11, .25), (14, 0)], f)
    return P(sx=c, lean=-3 * sc([(0, 1), (1, 0)], f) + 2 * math.sin(f * 2.2) * max(0, 14 - f) / 3 * (f > 10), hy=6.5 + sc([(0, 1), (1, 0)], f), m=.6 * w, aL=((21 - 5 * o * w, 34 - 3 * o), (20.5 - 8 * o * w, 52 - 11 * o)), aR=((43 + 5 * o * w, 34 - 3 * o), (43.5 + 8 * o * w, 52 - 11 * o)))      # spins right round (squashed through zero width, mirrored, back again)
RXF = P(hx=26, hy=8, lean=-3, m=1, aL=((33, 25), (43, 16)), aR=((47, 27), (56, 21)), lL=((34, 47), (38, 59)), lR=((39, 47), (44, 59)))      # rx4: falling: the feet shoot forward, the arms are thrown up
RXL = P(hx=29, hy=7.5, lean=-1, m=.1, aL=((29, 33), (32, 45)), aR=((41, 35), (43, 50)), lL=((34, 47), (38, 59)), lR=((39, 47), (44, 59)))      # ... lying: the arms at his sides
RXU = P(hx=30, hy=9, sy=19, lean=3, m=.5, aL=((29, 33), (32, 45)), aR=((41, 34), (43, 49)), lL=((34, 47), (38, 59)), lR=((39, 47), (44, 59)))      # ... getting up
def rx4(f):
    r = sc([(0, -5), (1, -26), (2, -50), (3, -70), (4, -78), (5, -75), (6, -79), (7, -78), (8, -78), (9, -72), (10, -57), (11, -38), (12, -20), (13, -8), (14, 0)], f)
    p = keys([(0, part(RXF, .7)), (1, RXF), (3, RXF), (4, RXL), (8, RXL), (9, RXU), (11, RXU), (12, part(RXU, .55)), (13, part(RXU, .2)), (14, P())], f)
    p['hx'] += (f in (5, 6)) - 1.5 * (f == 8); p['m'] += .15 * math.sin(f * 2.3) * (4 <= f <= 8); p['rot'] = r
    return p      # knocked flat on his back (turned about the feet), lies a moment, gets up
rx5p = P(hx=29, hy=7.5, lean=-4, m=.7, hp=37, aL=((32, 22), (46, 11)), aR=((47, 22), (56, 10)), lL=((31, 48), (35, 59)), lR=((37, 48), (43, 59)))
def rx5(f):
    p = blend(P(), rx5p, sc([(0, .4), (2, 1), (7, 1), (10, .5), (12, .2), (14, 0)], f)); p['dx'] = sc([(0, -1.5), (2, -8.5), (4, -12), (7, -13), (9, -9), (11, -5), (13, -1.5), (14, 0)], f); fl = 1.2 * math.sin(f * 2.1) * (3 <= f <= 8)      # (the hands flutter)
    p['aL'] = (p['aL'][0], (p['aL'][1][0], p['aL'][1][1] + fl)); p['aR'] = (p['aR'][0], (p['aR'][1][0], p['aR'][1][1] - fl)); return p      # skids back on his heels, arms flung up and forward
rx6p = P(hx=34, hy=11, sy=20, hp=37.5, lean=5, m=.15, dx=-3, aL=((39, 30), (41, 12)), aR=((46, 29), (47, 11)), lL=((29, 48), (29.5, 59)), lR=((37, 48), (36, 59)))
def rx6(f):
    p = keys([(0, part(rx6p, .45)), (1, part(rx6p, 1.1)), (3, rx6p), (8, P(**{**rx6p, 'hy': 10.5, 'dx': -2})), (11, part(rx6p, .5)), (14, P())], f); ta = sc([(0, .8), (1, 1), (9, 1), (11, .25), (13, 0)], f); p['lean'] += .7 * math.sin(f * 2.4) * (2 <= f <= 9)      # (a tremble)
    p['aL'] = mix(STAND['aL'], rx6p['aL'], ta); p['aR'] = mix(STAND['aR'], rx6p['aR'], ta); return p      # arms up to guard (both forearms in front of the face, hunched): the arms go up first and come down before the hunch relaxes
rx7p = P(hx=27, hy=7, lean=-6, m=.7, dx=-4, aL=((15, 24), (7, 14)), aR=((46, 22), (51, 10)), lL=((35, 41), (28, 47)), lR=((43, 44), (37, 50)))      # rx7: in the air: knees tucked, arms up (the game raises the whole sprite by VRX_LIFT: frames 1..12)
RX7E = P(hx=29, hy=7, lean=-3, m=.4, dx=-3, aL=((19, 30), (13, 41)), aR=((45, 30), (50, 41)))                                                                              # ... the legs reach down again for the landing
RX7L = P(hy=9, sy=19, hp=38, lean=-2, m=.3, dx=-2, aL=((20, 30), (17, 44)), aR=((44, 30), (47, 44)), lL=((28, 48), (29.5, 59)), lR=((36, 48), (34.5, 59)))                  # ... the landing: a crouch
def rx7(f):
    p = keys([(0, P(lean=-2, hx=31, m=.3, dx=-1)), (1, part(rx7p, .5)), (2, rx7p), (8, P(**{**rx7p, 'dx': -5.5})), (11, RX7E), (12, part(RX7L, .45)), (13, RX7L), (14, P())], f); fl = 1.5 * math.sin(f * 1.9) * (3 <= f <= 9)      # (the hands flap)
    p['aL'] = (p['aL'][0], (p['aL'][1][0], p['aL'][1][1] + fl)); p['aR'] = (p['aR'][0], (p['aR'][1][0], p['aR'][1][1] - fl)); return p      # hops backwards: knees tucked, arms up
def rx8(f):
    a = sc([(0, 1.1), (3, 1), (10, .6), (14, 0)], f); w = 2 * math.pi * f / 5.2; s = math.sin(w); l = 7 * a * s; hl = math.sin(w - .9)
    return P(lean=l, hx=32 + .95 * l + 5 * a * hl, hy=6.5 + 2.2 * a * abs(hl), m=.35 * a + .1 * math.sin(2 * w), dx=-2 * a * s, aL=((21 + 3 * a * math.sin(w + 1.2), 34), (20.5 + 7 * a * math.sin(w + 1.9), 52 - 1.5 * a * abs(math.sin(w + 1.9)))), aR=((43 + 3 * a * math.sin(w + 1.2), 34), (43.5 + 7 * a * math.sin(w + 1.9), 52 - 1.5 * a * abs(math.sin(w + 1.9)))))      # dizzy: sways left and right, head lolling
rx9p = P(hx=36, hy=15.5, sy=26, hp=45.5, lean=4, m=.9, dx=-2, aL=((20, 40), (22, 53)), aR=((47, 41), (51, 56)), lL=((27, 58), (18, 59)), lR=((43, 48), (40, 59)))
def rx9(f): return keys([(0, part(rx9p, .25)), (2, part(rx9p, .8)), (4, rx9p), (6, P(**{**rx9p, 'hy': 16, 'lean': 4.5, 'm': .7})), (8, P(**{**rx9p, 'hy': 15.5, 'm': .5})), (11, part(rx9p, .5)), (13, part(rx9p, .15)), (14, P())], f)      # drops to one knee, a hand toward the ground
RX = [rx0, rx1, rx2, rx3, rx4, rx5, rx6, rx7, rx8, rx9]
def rx_strips(): return {'rx%d' % k: url(sheet_png([cell(fn(f)) for f in range(15)], CW)) for k, fn in enumerate(RX)}
def strips(sm):                                     # every animation as a 15-frame strip (data URL), plus the smiley ball bobbing and squashing
    out = {n: url(sheet_png([render(fn(f)) for f in range(15)])) for n, fn in A.items()}; disc = sm.crop((7, 9, 58, 60)); fr = []
    for f in range(15):
        s = math.sin(2 * math.pi * f / 15); w, h = round(51 * (1 + .05 * s)), round(51 * (1 - .05 * s)); im = Image.new('RGBA', (S, S), (0, 0, 0, 0)); d2 = disc.resize((w, h), Image.NEAREST); im.paste(d2, (32 - w // 2, round(34 - h / 2 + 2 * s)), d2); fr.append(im)
    out['smiley'] = url(sheet_png(fr)); out['scare'] = url(sheet_png([scare_face(f) for f in range(15)])); out.update(rx_strips()); return out      # (scare = the JUMPSCARE close-up, 15 frames; rx0..rx9 = the hit reactions, 15 cells of 96x64)
