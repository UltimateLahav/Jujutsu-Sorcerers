# python3 sukuna_art.py [--preview DIR] -> sukuna_idle.png: SUKUNA in the game's own Yuji style, 17 rows of 15 pictures (960 x 1088; 64 x 64 each), facing right like Yuji:
# row 0 idle, 1 walk, 2 jump, 3 crouch down (standing up plays it backwards), 4 crouched idle, 5 crouch walk (walking back plays it backwards), 6 right jab, 7 left jab, 8 face kick (made with Yuji's rig, see kick()),
# 9 dodge (Yuji's back dash), 10 slash (made with Yuji's rig, see slash()), 11 and 12 the crouch punches (Yuji's own: C.JAB = R.JAB, strip 30, and C.UPPR = L.UPPR, strip 31),
# 13 the slash with the left hand and 14 the slash with both hands (made with Yuji's rig, see slash_params()), 15 the AIR CUT (a flick of the hand: the slash itself is not seen) and 16 the CUT STORM (the hand pulled
# forward with the fingers spread, trembling), both made with Yuji's rig, see cast_params().
# He is Yuji's idle picture (yuji.json) with a new head: tall swept-up spiky hair in a dustier rose, a bare forehead, a slanted brow, one narrow eye, the black face marks,
# the ear, a smirk, a rolled red collar and dark nails; same palette letters (a few recoloured), same chunky outline. Every other picture is Yuji's own picture of that move
# (the breath, the steps, the jump, the crouch, the two hooks that are his jabs, the back dash) with this head and collar put where Yuji's head and collar are in that picture (in all of them the face and the hood move as
# one piece; only the tips of his hair differ, and an arm that is drawn over the face stays over it), and a blink in 9 and 10 of the two idle rows.
# Each picture sits on its 64 x 64 canvas where Yuji's sits in the game (column 14, row 1), so he stands exactly where Yuji stands.
import json, math, os, sys
from PIL import Image, ImageDraw
import yuji_art as ya      # (Yuji's rig: the slash is drawn with it)

HERE = os.path.dirname(os.path.abspath(__file__))
Y = json.load(open(os.path.join(HERE, 'yuji.json'))); PAL = dict(Y['pal']); FR = Y['idle']['frames']; R, C = 64, 40
NEW = dict(H='#f2bcc4', I='#dc94a0', K='#b4707e', L='#7a4258',            # his hair: a dustier rose than Yuji's
           S='#ecc0a0', T='#f8d8bc', U='#d09c80', V='#a46c60', k='#2a1a26', n='#3a1f4a', r='#b03a3a', s='#782a30', u='#d85a5a', t='#4e1620')
PAL.update(NEW)
GX, GY = 14, 1      # where the 40 x 64 picture goes on the 64 x 64 canvas: Yuji's place in the game (x = cx - 32 + 14, y = gy - 61 + 1)

def head():
    """the head and the collar (rows 0 - 29) of Sukuna's first picture, on a copy of Yuji's first idle picture"""
    g = [list(r) for r in FR[0]]
    def put(c, r, ch): g[r][c] = ch
    for r in range(0, 14):
        for c in range(10, 33): g[r][c] = '.'
    sc = Image.new('L', (C, R), 0); d = ImageDraw.Draw(sc)           # the hair is painted as shapes on a scratch image, then copied in
    ID = {'I': 1, 'S': 2, 'H': 3, 'K': 4, 'L': 5, 'T': 6, 'U': 7}; CH = {v: k for k, v in ID.items()}
    def poly(p, ch): d.polygon(p, fill=ID[ch])
    def dot(c, r, ch): sc.putpixel((c, r), ID[ch])
    poly([(19, 11), (24, 11), (25, 13), (25, 14), (19, 14)], 'S')                              # forehead (the hair is drawn over it)
    poly([(14, 14), (13, 11), (13, 9), (12, 7), (15, 8), (15, 6), (18, 7), (19, 4), (21, 7), (22, 5), (24, 7), (26, 6), (26, 8), (28, 8), (27, 10), (25, 11), (22, 11), (19, 12), (16, 14)], 'I')
    hp = sc.load()
    def hair_at(c, r): return 0 <= c < C and 0 <= r < R and hp[c, r] == ID['I']
    for r in range(R):                       # the lit side and the top of every spike, the shaded far side
        for c in range(C):
            if hp[c, r] != ID['I']: continue
            if (not hair_at(c - 1, r) and hp[c - 1, r] == 0) or (not hair_at(c, r - 1) and hp[c, r - 1] == 0 and r <= 9): dot(c, r, 'H')
    for r in range(R):
        for c in range(C):
            if hp[c, r] == ID['I'] and not hair_at(c + 1, r) and hp[c + 1, r] == 0 and r >= 7: dot(c, r, 'K')
    for c, r in ((15, 9), (16, 10), (18, 8), (18, 9), (21, 8), (21, 9), (24, 8), (24, 9), (26, 9), (15, 11), (16, 12)):
        if hp[c, r]: dot(c, r, 'L')
    for c, r in ((17, 10), (20, 9), (23, 10), (19, 11)):
        if hp[c, r] == ID['I']: dot(c, r, 'K')
    for r in range(0, 14):
        for c in range(10, 33):
            if hp[c, r]: g[r][c] = CH[hp[c, r]]
    for r in range(0, 14):      # outline round the new hair: one pixel on top, two at the sides (as in Yuji's picture)
        for c in range(10, 33):
            if g[r][c] == '.' and any(0 <= c + a < C and g[r + b][c + a] not in ('.', 'O') for a, b in ((1, 0), (-1, 0), (0, 1), (0, -1)) if 0 <= r + b < R): g[r][c] = 'O'
    for c in range(19, 25):
        for r in (13, 14): put(c, r, 'S')                                              # the forehead (Yuji's fringe is gone)
    put(22, 13, 'T'); put(23, 13, 'T')
    for c, r in ((20, 14), (21, 14), (22, 15), (23, 15), (24, 15)): put(c, r, 'L')    # the brow, slanting down toward the nose
    put(21, 15, 'S'); put(22, 16, 'W'); put(23, 16, 'e'); put(22, 17, 'S'); put(23, 17, 'S')   # the eye: one narrow row (Yuji's was two tall)
    for c, r in ((23, 18), (22, 18), (21, 19), (20, 19), (19, 20)): put(c, r, 'k')   # the long mark under the eye: from the nose side down toward the ear
    for c, r in ((20, 21), (20, 22), (22, 21), (22, 22)): put(c, r, 'k')           # the two short marks on the chin (they stand upright)
    put(17, 16, 'U'); put(17, 17, 'V'); put(17, 18, 'U')                               # the ear
    put(24, 20, 'V'); put(25, 19, 'V')                                                  # the smirk (the corner of the mouth goes up)
    for c in range(18, 23): put(c, 23, 'r' if 19 <= c <= 21 else 'u')                   # the collar: Yuji's own shape, rolled one row higher at the chin
    for c in range(16, 21): put(c, 25, 'u')                                             # the light on the top of the roll
    return g

ROWS = ('idle', 'fwd', 'jump', 'cdn', 'cidle', 'cfwd', 'atk0', 'atk1', 'kick', 'dash1', 'slash', 'atk30', 'atk31', 'slashL', 'slashX', 'cut', 'storm')      # the strip's rows: Yuji's sets of the move (idle, walk, jump, crouch down, crouched idle, crouch walk, R.HOOK = his right jab, L.HOOK = his left jab, the back dash = his dodge, C.JAB and C.UPPR = his crouch punches) and the kick, the three slashes and the two BLUE moves made here, 15 pictures each
BLINK = {'idle': (9, 10), 'cidle': (9, 10)}                 # (his own blinks: the pictures where his eye is shut)
NAILS = ('idle', 'fwd', 'cdn')                               # (the pictures where the hand is in the pocket, or still on its way up to the guard: the nails show; the guard and the jump hold it up in a fist of another shape)
WID = 48                                                    # (the widest of Yuji's pictures of these moves is 44)

NA = {0: ya.IDLE_N, 2: ya.GUARD_N, 4: ((-1, -2), (-3, -9)), 5: ((0, -3), (-1, -11)), 6: ((3, -3), (6, -9)), 7: ((6, -1), (12, -4)), 8: ((8, 3), (14, 2)), 9: ((8, 6), (13, 8)), 10: ((6, 8), (9, 11)), 12: ((3, 6), (4, 7)), 14: ya.IDLE_N}      # the near hand of the SLASH: up behind the head (4 - 6), over and down in front of him (7 - 10: the blow lands on 7), back
FA = {0: ya.IDLE_F, 2: ya.GUARD_F, 5: ((-2, 4), (-5, 6)), 7: ((-3, 5), (-6, 8)), 9: ((-2, 5), (-4, 8)), 12: ya.GUARD_F, 14: ya.IDLE_F}      # the far hand, pulled back for balance
GUARD_ONLY_N = {0: ya.IDLE_N, 2: ya.GUARD_N, 12: ya.GUARD_N, 14: ya.IDLE_N}      # the near hand while the far hand does the slash
GUARD_ONLY_F = {0: ya.IDLE_F, 2: ya.GUARD_F, 12: ya.GUARD_F, 14: ya.IDLE_F}
FA_L = {0: ya.IDLE_F, 2: ya.GUARD_F, 4: ((-1, -2), (-3, -9)), 5: ((0, -3), (-1, -11)), 6: ((3, -3), (6, -9)), 7: ((6, -1), (12, -4)), 8: ((8, 3), (14, 2)), 9: ((8, 6), (13, 8)), 10: ((6, 8), (9, 11)), 12: ((3, 6), (4, 7)), 14: ya.IDLE_F}      # the far hand of the LEFT-HAND SLASH: the same path as the near hand's
NA_X = {0: ya.IDLE_N, 2: ya.GUARD_N, 4: ((-2, -3), (-4, -10)), 5: ((-1, -4), (-2, -12)), 6: ((2, -3), (5, -9)), 7: ((6, 0), (12, -3)), 8: ((8, 3), (14, 4)), 9: ((8, 6), (13, 9)), 11: ((4, 7), (6, 9)), 14: ya.IDLE_N}      # both hands of the X SLASH: up behind the head together (4 - 6), thrown forward and down (7 - 9)
FA_X = {0: ya.IDLE_F, 2: ya.GUARD_F, 4: ((-1, -3), (-3, -10)), 5: ((0, -4), (-1, -12)), 6: ((3, -4), (7, -11)), 7: ((7, -2), (13, -6)), 8: ((9, 1), (15, 0)), 9: ((9, 4), (14, 6)), 11: ((4, 6), (6, 8)), 14: ya.IDLE_F}
SLASHES = {'slash': (NA, FA), 'slashL': (GUARD_ONLY_N, FA_L), 'slashX': (NA_X, FA_X)}      # the paths of the two hands of each slash
def slash_params(i, kind='slash'):
    kv, GR = ya.kv, ya.GR; na, fa = SLASHES[kind]; big = kind == 'slashX'
    return dict(by=round(kv({0: 0, 3: 1, 5: 2, 7: 1, 9: 2, 12: 1, 14: 0}, i)), ln=round(kv({0: 0, 3: -1, 5: -2, 7: 3 if big else 2, 9: 5 if big else 4, 11: 3, 14: 0}, i)), hx=round(kv({0: 0, 5: -1, 7: 2, 10: 2, 14: 0}, i)),
                lf=(round(kv({0: 34, 4: 33, 6: 37, 8: 39, 11: 37, 14: 34}, i)), GR, 0), lb=(round(kv({0: 31, 6: 29, 8: 28, 11: 30, 14: 31}, i)), GR, 0), na=kv(na, i), fa=kv(fa, i), hp=i * .8, hback=0, blink=False)
def slash_hand(i, kind='slash', far=False):
    P = slash_params(i, kind); w = P['fa' if far else 'na'][1]; return (34 + (2 if far else 0) + P['ln'] + w[0], 31 + P['by'] + w[1])
def slash_pic(kind):
    def make(i):
        """a picture of a SLASH on Yuji's rig: a step forward and a chop from behind the head down in front of him with the near hand (slash), the far hand (slashL) or both (slashX), with a pale trail along the path of each hand"""
        f, nh, fh = ya.figure(slash_params(i, kind))
        if 6 <= i <= 10:
            for far in ((False,) if kind == 'slash' else (True,) if kind == 'slashL' else (False, True)):
                pts = [slash_hand(j, kind, far) for j in range(max(0, i - 3), i + 1)]
                if pts[0] != pts[-1]: ya.streak(f, pts, (.8, 1.6, 2.6, 3.4)[-len(pts):], (0, .5, .8, 1.0)[-len(pts):], False)
        return f, nh, fh
    return make
slash = slash_pic('slash')
KICK_T = {0: (1, 0, 0, (34, 59, 0), (31, 59, 0)), 1: (4, 1, 0, (34, 59, 0), (30, 59, 0)), 2: (3, 1, 0, (34, 59, 0), (30, 59, 0)), 3: (-2, 0, 0, (36, 56, 20), (31, 56, 10)), 4: (-2, -1, 1, (38, 49, -10), (33, 51, 10)), 5: (-2, -3, 2, (45, 28, -55), (33, 51, 10)),
          6: (-2, -3, 2, (45, 28, -55), (33, 51, 10)), 7: (-2, -2, 2, (41, 40, -20), (33, 51, 10)), 8: (-2, -1, 2, (40, 44, -10), (33, 52, 10)), 9: (0, 0, 1, (38, 50, 0), (32, 55, 10)), 10: (2, 1, 0, (36, 56, 10), (31, 57, 10)), 11: (3, 1, 0, (35, 59, 0), (31, 59, 0)), 12: (2, 1, 0, (34, 59, 0), (31, 59, 0)), 13: (1, 1, 0, (34, 59, 0), (31, 59, 0)), 14: (1, 0, 0, (34, 59, 0), (31, 59, 0))}
def kick_params(i):
    """his FACE KICK: Yuji's own jump kick to the head (the first of his three kicks): he coils (1), springs up (3), chambers the knee (4) and whips the front foot out to the height of a standing enemy's face (5 - 6: the foot is 34 px above the ground in the picture and the game lifts him 12 more: see SU_KICK_LIFT in sukuna.js), pulls it back (7 - 9) and lands"""
    kv = ya.kv; T = {j: KICK_T[j] for j in KICK_T}; by, ln, hx, lf, lb = (kv({j: T[j][n] for j in T}, i) for n in range(5))
    return dict(by=round(by), ln=round(ln), hx=round(hx), lf=tuple(round(v) for v in lf), lb=tuple(round(v) for v in lb), na=kv({0: ya.IDLE_N, 2: ya.GUARD_N, 4: ((-3, 5), (-5, 9)), 11: ((-3, 5), (-5, 9)), 14: ya.IDLE_N}, i), fa=kv({0: ya.IDLE_F, 2: ya.GUARD_F, 4: ((3, 3), (7, -1)), 11: ((3, 3), (7, -1)), 14: ya.IDLE_F}, i),
                hp=i * .9, hup=1 if 3 <= i <= 11 else 0, hback=1 if 4 <= i <= 11 else 0, blink=False)
def kick(i):
    f, nh, fh = ya.figure(kick_params(i))
    if 4 <= i <= 8:                                                            # the foot's path: a pale swoosh behind it
        pts = [(x + 1.5, y - 1.5) for x, y in [kick_params(j)['lf'][:2] for j in (max(0, i - 3), max(0, i - 2), max(0, i - 1), i)]]
        if pts[0] != pts[-1]: ya.streak(f, pts, (.8, 1.8, 3.0, 4.4), (0, .3, .7, 1), False)
    if i in (5, 6): ya.burst(f, 52, 27, 4 if i == 5 else 3)                    # a star where the sole lands
    return f, nh, fh
# ---- v1.111 the BLUE moves. 'cut' = the AIR CUT (the standing BLUE): a quick flick of the near hand with the fingers held together, no step and no trail (the slash itself is not seen); the cut lands on picture 7.
# 'storm' = the CUT STORM (back + BLUE): the near hand is raised and pulled forward with the fingers spread and trembles while the slashes land (one on each of the pictures 6 - 13, a slash on every picture)
CUT_N = {0: ya.IDLE_N, 2: ya.GUARD_N, 3: ((3, 3), (1, -1)), 4: ((2.5, 2), (-1, -3)), 5: ((6, -1.5), (11, -4.5)), 6: ((8, -2), (15, -4)), 7: ((8.5, -2), (15.5, -4)), 8: ((8, -1.5), (14.5, -3.5)), 9: ((7, 0), (12, -1.5)), 10: ((5, 2.5), (8, 1.5)), 12: ya.GUARD_N, 14: ya.IDLE_N}      # the near hand of the AIR CUT: drawn back to the chest (3 - 4), flicked out at shoulder height (5 - 6), held (7 - 8), pulled back
STORM_N = {0: ya.IDLE_N, 2: ya.GUARD_N, 3: ((3, 2.5), (7, -.5)), 4: ((4, 0), (10, -3)), 5: ((5.5, -1), (13, -4.2)), 14: ((2.5, 3.5), (4, 1))}      # the near hand of the CUT STORM: it rises and reaches forward and up (3 - 5), trembles (6 - 13: below), drops (14)
for _j in range(6, 14): STORM_N[_j] = ((5.5, -1.2), (13.7, -4.7)) if _j % 2 == 0 else ((5, -.8), (12.5, -3.7))
def cast_params(i, kind):
    kv, GR = ya.kv, ya.GR
    if kind == 'cut':
        return dict(by=round(kv({0: 0, 3: 1, 5: 0, 7: 1, 10: 1, 14: 0}, i)), ln=round(kv({0: 0, 3: -1, 4: -1, 6: 2, 8: 2, 11: 1, 14: 0}, i)), hx=round(kv({0: 0, 4: -1, 6: 1, 11: 0, 14: 0}, i)),
                    lf=(round(kv({0: 34, 4: 34, 6: 36, 11: 35, 14: 34}, i)), GR, 0), lb=(round(kv({0: 31, 6: 30, 14: 31}, i)), GR, 0), na=kv(CUT_N, i), fa=kv(GUARD_ONLY_F, i), hp=i * .8, hback=1 if 5 <= i <= 8 else 0, blink=False)
    return dict(by=round(kv({0: 0, 3: 0, 5: 1, 13: 1, 14: 0}, i)) + (i % 2 if 6 <= i <= 13 else 0), ln=round(kv({0: 0, 3: 1, 5: 2, 13: 2, 14: 1}, i)), hx=round(kv({0: 0, 5: 1, 13: 1, 14: 0}, i)),
                lf=(round(kv({0: 34, 4: 35, 6: 36, 13: 36, 14: 35}, i)), GR, 0), lb=(round(kv({0: 31, 6: 30, 14: 31}, i)), GR, 0), na=kv(STORM_N, i), fa=kv(GUARD_ONLY_F, i), hp=i * .8, hup=1 if 5 <= i <= 13 else 0, blink=False)
def cast_hand(kind, i, P):
    """the fingers, drawn over the near hand: held together and pointing along the arm (the AIR CUT: a blade of a hand) or spread like a fan (the CUT STORM)"""
    L = ya.kv({2: 0, 4: 1, 12: 1, 14: 0}, i)                                    # how far the fingers are out (0 = a plain fist)
    def top(f, sx, sy):
        if L <= 0: return
        S0 = (34 + sx, 31 + sy); ne = (S0[0] + P['na'][0][0], S0[1] + P['na'][0][1]); nw = (S0[0] + P['na'][1][0], S0[1] + P['na'][1][1]); d = ya.unit(nw[0] - ne[0], nw[1] - ne[1]); fc = (nw[0] + d[0] * 1.6, nw[1] + d[1] * 1.6)
        turn = lambda a: (d[0] * math.cos(a) - d[1] * math.sin(a), d[0] * math.sin(a) + d[1] * math.cos(a))
        if kind == 'cut':
            f.fill(ya.seg((fc[0] + d[0] * .5, fc[1] + d[1] * .5), (fc[0] + d[0] * 4.4 * L, fc[1] + d[1] * 4.4 * L), 2.4, 1.2), 'S'); f.set(fc[0] + d[0] * 2.4 * L, fc[1] + d[1] * 2.4 * L - 1, 'T')
        else:
            for a, ln in ((-.95, 3.8), (-.32, 5.0), (.32, 5.0), (.95, 3.8)):
                e = turn(a); f.fill(ya.seg((fc[0] + e[0] * .8, fc[1] + e[1] * .8), (fc[0] + e[0] * ln * L, fc[1] + e[1] * ln * L), 1.5, 1.0), 'S')
    return top
def cast_pic(kind):
    def make(i):
        P = cast_params(i, kind); P['top'] = cast_hand(kind, i, P); return ya.figure(P)
    return make
GEN = {'slash': {'top': 0, 'frames': ya.pack(slash, 16, 48, 0)[0]}, 'slashL': {'top': 0, 'frames': ya.pack(slash_pic('slashL'), 16, 48, 0)[0]}, 'slashX': {'top': 0, 'frames': ya.pack(slash_pic('slashX'), 16, 48, 0)[0]}, 'kick': {'top': 0, 'frames': ya.pack(kick, 16, 48, 0)[0]}, 'cut': {'top': 0, 'frames': ya.pack(cast_pic('cut'), 16, 48, 0)[0]}, 'storm': {'top': 0, 'frames': ya.pack(cast_pic('storm'), 16, 48, 0)[0]}}      # (the sets made here, in the form of yuji.json's)

def yuji(name, i):
    """Yuji's picture i of a set as a grid of 64 figure rows x 48 columns (a jump's 4 empty rows above and below the figure are dropped; the game draws them 4 rows higher)"""
    s = GEN.get(name) or Y[name]; top = s['top']; rows = s['frames'][i]
    assert len(rows) == 64 + 2 * top and all(set(r) == {'.'} for r in rows[:top] + rows[top + 64:]), (name, i, 'figure outside its 64 rows')
    return [list(r.ljust(WID, '.')) for r in rows[top:top + 64]]

TPL = [(r, c) for r in range(15, 30) for c in range(14, 27) if FR[0][r][c] != '.']      # Yuji's face and hood in his first idle picture: the pattern to find in every picture

def shift_of(g):
    """how far Yuji's face and hood are moved in picture g from his first idle picture: the shift with the fewest differences (a fist drawn over the face makes some)"""
    best = None
    for dy in range(-8, 17):
        for dx in range(-6, 11):
            mis = sum(1 for r, c in TPL if not (0 <= r + dy < 64 and 0 <= c + dx < WID) or g[r + dy][c + dx] != FR[0][r][c])
            if best is None or (mis, abs(dx) + abs(dy)) < best[0]: best = ((mis, abs(dx) + abs(dy)), dx, dy)
    return best[1], best[2], best[0][0]

def fist_of(g):
    """where the fist in the pocket is in picture g, as (dx, dy) from the first idle picture (its 4 x 2 block of skin), or None when it is not a block"""
    best = None
    for dy in range(-4, 5):
        for dx in range(-4, 5):
            n = sum(1 for r in (40, 41) for c in range(19, 23) if 0 <= r + dy < 64 and 0 <= c + dx < WID and g[r + dy][c + dx] == 'S')
            if best is None or (-n, abs(dx) + abs(dy)) < best[0]: best = ((-n, abs(dx) + abs(dy)), dx, dy)
    return (best[1], best[2]) if best[0][0] <= -6 else None

def picture(name, i, H):
    """Sukuna's picture i of a move (a grid of 64 rows x 48 letters): Yuji's picture with his head and collar in the place of Yuji's"""
    g = yuji(name, i); dx, dy, mis = shift_of(g); blink = i in BLINK.get(name, ()); keep = 0
    for r in range(30):                                          # Yuji's head out: the hair (rows 0 - 14) all of it, below it only what is still the pixel of his head (a fist over the face stays)
        for c in range(WID):
            x, y = c + dx, r + dy
            if not (0 <= x < WID and 0 <= y < 64): continue
            if r <= 14 or g[y][x] == (FR[0][r][c] if c < C else '.') or (blink and 15 <= r <= 19 and 21 <= c <= 25): g[y][x] = '.'
            else: keep += 1
    for r in range(30):                                          # ... his in, wherever it is free
        for c in range(C):
            x, y = c + dx, r + dy
            if H[r][c] != '.' and 0 <= x < WID and 0 <= y < 64 and g[y][x] == '.': g[y][x] = H[r][c]
    if blink and g[16 + dy][22 + dx] == 'W': g[16 + dy][22 + dx] = 'e'      # (the eye shuts to a dark line)
    f = fist_of(g) if name in NAILS else None
    if f:                                                        # dark nails on the hand in the pocket, where the hand is
        for c, r in ((21, 40), (22, 41)):
            x, y = c + f[0], r + f[1]
            if g[y][x] in 'STUV': g[y][x] = 'n'
    return g, (dx, dy, mis, keep, f)

def render(grid, x0=GX, y0=GY):
    im = Image.new('RGBA', (64, 64), (0, 0, 0, 0))
    for r in range(64):
        for c in range(WID):
            ch = grid[r][c] if c < len(grid[r]) else '.'
            if ch != '.' and ch in PAL and 0 <= c + x0 < 64 and 0 <= r + y0 < 64: im.putpixel((c + x0, r + y0), tuple(int(PAL[ch][k:k + 2], 16) for k in (1, 3, 5)) + (255,))
            elif ch != '.' and ch not in PAL: raise KeyError(ch)
    return im

def strip(rows):
    """the rows of 15 pictures as a palette PNG (colour 0 = see-through)"""
    pics = [im for row in rows for im in row]
    cols = sorted({im.getpixel((x, y))[:3] for im in pics for y in range(64) for x in range(64) if im.getpixel((x, y))[3]})
    assert len(cols) < 255, len(cols)
    idx = Image.new('P', (64 * 15, 64 * len(rows)), 0); idx.putpalette([0, 0, 0] + [v for c in cols for v in c]); look = {c: k + 1 for k, c in enumerate(cols)}
    for r, row in enumerate(rows):
        for n, im in enumerate(row):
            for y in range(64):
                for x in range(64):
                    p = im.getpixel((x, y))
                    if p[3]: idx.putpixel((64 * n + x, 64 * r + y), look[p[:3]])
    return idx

if __name__ == '__main__':
    H = head(); info = {}; rows = []
    for name in ROWS:
        row = []
        for i in range(15):
            g, nfo = picture(name, i, H); info[name, i] = nfo; row.append(render(g))
        rows.append(row)
    strip(rows).save(os.path.join(HERE, 'sukuna_idle.png'), transparency=0, optimize=True); print('wrote sukuna_idle.png', 64 * 15, 'x', 64 * len(ROWS))
    if '--preview' in sys.argv:
        out = sys.argv[sys.argv.index('--preview') + 1]; os.makedirs(out, exist_ok=True); S = 4
        for r, name in enumerate(ROWS):
            sheet = Image.new('RGBA', (64 * S * 8, 64 * S * 2), (60, 64, 84, 255))
            for n, im in enumerate(rows[r]): b = im.resize((64 * S, 64 * S), Image.NEAREST); sheet.paste(b, ((n % 8) * 64 * S, (n // 8) * 64 * S), b)
            sheet.save(os.path.join(out, 'sukuna_' + name + '_x4.png'))
        yu = render([list(r.ljust(WID, '.')) for r in FR[0]]); both = Image.new('RGBA', (64 * 8 * 2 + 16, 64 * 8), (200, 200, 210, 255))
        for n, im in enumerate((yu, rows[0][0])): b = im.resize((512, 512), Image.NEAREST); both.paste(b, (n * 528, 0), b)
        both.save(os.path.join(out, 'yuji_vs_sukuna_x8.png')); print('previews in', out)
        for name in ROWS: print(name, ' '.join('%d,%d:%d/%d%s' % (nfo[0], nfo[1], nfo[2], nfo[3], 'n' if nfo[4] else '-') for nfo in (info[name, i] for i in range(15))))
