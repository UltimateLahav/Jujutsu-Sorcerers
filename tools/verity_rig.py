"""Verity's 15-frame animations (64x64, facing right; the game mirrors them). A little rig of joints is drawn with polygons, shaded, detailed and outlined like the first-form sprite.
anim(name) -> 15 frames. run: python3 verity_rig.py  ->  verity_anims.json (name -> png strip, 15 frames wide) and verity_sheet.png"""
import math, io, json, base64, copy
from PIL import Image, ImageDraw
S = 64; BASE, LIT, HI, SH, DK, OL, RIB, CLAW = (172,156,48), (206,192,80), (232,218,134), (128,114,38), (88,76,26), (26,18,6), (104,90,26), (62,52,16)
STAND = dict(hx=32, hy=6.5, sy=17, hp=36, lean=0, m=0, aL=((21,34),(20.5,52)), aR=((43,34),(43.5,52)), lL=((29.5,47),(30,59)), lR=((34.5,47),(34,59)), fade=0, glitch=0, ribs=1)
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
            for k, c in enumerate([(84, 8, 18), (252, 248, 236)] + [(70, 6, 14)] * (1 + g) + [(252, 248, 236), (84, 8, 18)]): dot([(x + bx, st + by + k)], c)
    for y in range(S):
        for x in range(S):
            if not on(x, y) and any(on(x + dx, y + dy) for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1))): o[x, y] = OL + (255,)
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
 'talk': lambda f: {**idlep(f), 'm': 0.6 * (0.5 - 0.5 * math.cos(2 * math.pi * f / 15))},      # (the idle sway and breathing, with the mouth opening and closing)
 'tele': lambda f: pose(glitch=(0, .6, 1.2, 1.8, 2.4, 3, 3.5, 0, 3.5, 3, 2.4, 1.8, 1.2, .6, 0)[f], fade=(0, .1, .25, .4, .55, .7, .85, 1, .85, .7, .55, .4, .25, .1, 0)[f]),
}
def sheet_png(frames): im = Image.new('RGBA', (S * 15, S), (0, 0, 0, 0)); [im.paste(fr, (i * S, 0)) for i, fr in enumerate(frames)]; return im
def url(im): b = io.BytesIO(); im.save(b, 'PNG'); return 'data:image/png;base64,' + base64.b64encode(b.getvalue()).decode()
def strips(sm):                                     # every animation as a 15-frame strip (data URL), plus the smiley ball bobbing and squashing
    out = {n: url(sheet_png([render(fn(f)) for f in range(15)])) for n, fn in A.items()}; disc = sm.crop((7, 9, 58, 60)); fr = []
    for f in range(15):
        s = math.sin(2 * math.pi * f / 15); w, h = round(51 * (1 + .05 * s)), round(51 * (1 - .05 * s)); im = Image.new('RGBA', (S, S), (0, 0, 0, 0)); d2 = disc.resize((w, h), Image.NEAREST); im.paste(d2, (32 - w // 2, round(34 - h / 2 + 2 * s)), d2); fr.append(im)
    out['smiley'] = url(sheet_png(fr)); return out
