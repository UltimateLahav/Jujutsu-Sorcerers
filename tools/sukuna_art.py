# python3 sukuna_art.py [--preview DIR] -> sukuna_idle.png: SUKUNA in the game's own Yuji style, 25 rows of 15 pictures (960 x 1600; 64 x 64 each; the last rows: the FLAME poses and, v1.124, the DOMAIN SIGN), facing right like Yuji:
# row 0 idle, 1 walk, 2 jump, 3 crouch down (standing up plays it backwards), 4 crouched idle, 5 crouch walk (walking back plays it backwards), 6 right jab, 7 left jab, 8 face kick (made with Yuji's rig, see kick()),
# 9 dodge (Yuji's back dash), 10 slash (made with Yuji's rig, see slash()), 11 and 12 the crouch punches (Yuji's own: C.JAB = R.JAB, strip 30, and C.UPPR = L.UPPR, strip 31),
# 13 the slash with the left hand and 14 the slash with both hands (made with Yuji's rig, see slash_params()), 15 the AIR CUT (a flick of the hand: the slash itself is not seen) and 16 the CUT STORM (the hand pulled
# forward with the fingers spread, trembling), both made with Yuji's rig, see cast_params(), 17 the LEG CUT (crouched: the hand sweeps low along the floor) and 18 DISMANTLE (in the air: a dash back, then the arm
# straight out with one finger pointing at the enemy), see cast_params() and DISK.
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
GR_ = ya.GR      # (the ground row of the figure)
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

ROWS = ('idle', 'fwd', 'jump', 'cdn', 'cidle', 'cfwd', 'atk0', 'atk1', 'kick', 'dash1', 'slash', 'atk30', 'atk31', 'slashL', 'slashX', 'cut', 'storm', 'ccut', 'dis', 'atk6', 'atk26', 'lift', 'dive', 'flame', 'sign', 'air')      # the strip's rows: Yuji's sets of the move (idle, walk, jump, crouch down, crouched idle, crouch walk, R.HOOK = his right jab, L.HOOK = his left jab, the back dash = his dodge, C.JAB and C.UPPR = his crouch punches) and the kick, the three slashes and the four BLUE moves made here, 15 pictures each
NEWROWS = {'df': 'dash0', 'bl': 'blk', 'h0': 'rx0', 'h1': 'rx1', 'h2': 'rx2', 'h5': 'rx5', 'h6': 'rx6', 'h8': 'rx8', 'h9': 'rx9', 'cj': 'cju'}      # v1.154: rows that are Yuji's own set of another name (the forward dash, the block (10 pictures), his hit reactions 0 1 2 5 6 8 9 (3 spins, 7 hops and 4 is a fall: they need more room than 64 pictures give) and the spring of a crouch jump) with this head
ROWS = ROWS + tuple(NEWROWS)
MIDX = 22      # (in those sets the figure's middle column is put at column 22 of the grid: Yuji's reaction sets are cut from different columns, and the idle's is 18)
def gx(name): return GX - (MIDX - 18) if name in NEWROWS else GX      # (where the grid of a row goes on its 64 x 64 canvas: the middle column is always column 32)
BLINK = {'idle': (9, 10), 'cidle': (9, 10)}                 # (his own blinks: the pictures where his eye is shut)
NAILS = ('idle', 'fwd', 'cdn')                               # (the pictures where the hand is in the pocket, or still on its way up to the guard: the nails show; the guard and the jump hold it up in a fist of another shape)
WID = 48                                                    # (the widest of Yuji's pictures of these moves is 44)
def wid(name): return WID + 8 if name in NEWROWS else WID      # (v1.154: the new rows are put 4 columns further right and have 8 more columns; the old rows are exactly as they were)

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
CCUTK = {0: (7, 2, (37, ya.GR, 0), (30, ya.GR, 0), ya.GUARD_N, ya.GUARD_F), 2: (8, 1, (37, ya.GR, 0), (30, ya.GR, 0), ((1, 5), (-1, 8)), ya.GUARD_F), 4: (9, 0, (37, ya.GR, 0), (29, ya.GR, 0), ((-1, 6), (-4, 10)), ((2, 4), (5, 1))),
         5: (8, 3, (38, ya.GR, 0), (29, ya.GR, 0), ((4, 8), (9, 12)), ((2, 4), (5, 1))), 6: (8, 6, (40, ya.GR, 0), (28, ya.GR, 0), ((8, 9), (16, 14)), ((2, 4), (5, 1))), 8: (8, 6, (40, ya.GR, 0), (28, ya.GR, 0), ((8.5, 9), (16.5, 14.5)), ((2, 4), (5, 1))),
         10: (8, 4, (39, ya.GR, 0), (29, ya.GR, 0), ((6, 6), (11, 9)), ya.GUARD_F), 12: (7, 3, (38, ya.GR, 0), (30, ya.GR, 0), ((4, 4), (7, 1)), ya.GUARD_F), 14: (7, 2, (37, ya.GR, 0), (30, ya.GR, 0), ya.GUARD_N, ya.GUARD_F)}      # the LEG CUT, crouched: the near hand drops back beside the hip (1 - 4), sweeps forward along the floor (5) and out at the height of a standing enemy's shins (6: the cut lands, held to 8), and comes back into the crouch guard (10 - 14)
DISK = {0: (-2, 0, (39, ya.GR - 11, 0), (35, ya.GR - 10, 0), ((5, 0), (10, -2)), ((4, 1), (9, 0))), 2: (-1, -3, (41, ya.GR - 10, -10), (37, ya.GR - 9, -5), ((4, -1), (8, -5)), ((3, 0), (6, -3))),
        4: (0, -5, (44, ya.GR - 9, -18), (40, ya.GR - 8, -12), ((5, -1), (9, -3)), ((3, 1), (7, -1))), 6: (0, -4, (43, ya.GR - 9, -14), (39, ya.GR - 9, -9), ((6, -2), (11, -4)), ((3, 1), (7, 0))),
        8: (-1, -2, (41, ya.GR - 10, -6), (37, ya.GR - 10, -5), ((8, -1.5), (16.5, 1)), ((2, 3), (4, 6))), 9: (-1, -2, (41, ya.GR - 10, -6), (37, ya.GR - 10, -5), ((8.2, -1.4), (17, 1.3)), ((2, 3), (4, 6))),
        10: (-1, -2, (41, ya.GR - 10, -6), (37, ya.GR - 10, -5), ((8.2, -1.4), (17, 1.3)), ((2, 3), (4, 6))), 11: (-1, -2, (41, ya.GR - 10, -6), (37, ya.GR - 10, -5), ((7, -.8), (15.6, 2.2)), ((2, 3), (4, 6))),
        12: (-1, -2, (41, ya.GR - 10, -6), (37, ya.GR - 10, -5), ((8.4, -1.5), (17.4, 1)), ((2, 3), (4, 6))), 13: (-1, -2, (41, ya.GR - 10, -6), (37, ya.GR - 10, -5), ((7, -.8), (15.6, 2.2)), ((2, 3), (4, 6))),
        14: (-2, -1, (40, ya.GR - 11, 0), (36, ya.GR - 10, 0), ((6, 1), (11, 3)), ((3, 2), (6, 4)))}      # DISMANTLE, in the air: the hang at the top of a jump (0, Yuji's picture 7), the dash back with the shoulders leaning back and the feet coming forward (2 - 6), the arm out straight with the finger on the enemy (8 - 9: the game stops on 9), a tremble on each of the three cuts (11 - 13), the arm comes down (14)
def cast_params(i, kind):
    kv, GR = ya.kv, ya.GR
    if kind in ('ccut', 'dis'): return ya.jpar(CCUTK if kind == 'ccut' else DISK, i, 0, 1 if kind == 'dis' and 2 <= i <= 7 else 0)
    if kind == 'cut':
        return dict(by=round(kv({0: 0, 3: 1, 5: 0, 7: 1, 10: 1, 14: 0}, i)), ln=round(kv({0: 0, 3: -1, 4: -1, 6: 2, 8: 2, 11: 1, 14: 0}, i)), hx=round(kv({0: 0, 4: -1, 6: 1, 11: 0, 14: 0}, i)),
                    lf=(round(kv({0: 34, 4: 34, 6: 36, 11: 35, 14: 34}, i)), GR, 0), lb=(round(kv({0: 31, 6: 30, 14: 31}, i)), GR, 0), na=kv(CUT_N, i), fa=kv(GUARD_ONLY_F, i), hp=i * .8, hback=1 if 5 <= i <= 8 else 0, blink=False)
    return dict(by=round(kv({0: 0, 3: 0, 5: 1, 13: 1, 14: 0}, i)) + (i % 2 if 6 <= i <= 13 else 0), ln=round(kv({0: 0, 3: 1, 5: 2, 13: 2, 14: 1}, i)), hx=round(kv({0: 0, 5: 1, 13: 1, 14: 0}, i)),
                lf=(round(kv({0: 34, 4: 35, 6: 36, 13: 36, 14: 35}, i)), GR, 0), lb=(round(kv({0: 31, 6: 30, 14: 31}, i)), GR, 0), na=kv(STORM_N, i), fa=kv(GUARD_ONLY_F, i), hp=i * .8, hup=1 if 5 <= i <= 13 else 0, blink=False)
def cast_hand(kind, i, P):
    """the fingers, drawn over the near hand: held together and pointing along the arm (the AIR CUT: a blade of a hand) or spread like a fan (the CUT STORM)"""
    L = ya.kv({5: 0, 7: 1, 13: 1, 14: 0} if kind == 'dis' else {2: 0, 4: 1, 12: 1, 14: 0}, i)      # how far the fingers are out (0 = a plain fist)
    def top(f, sx, sy):
        if L <= 0: return
        S0 = (34 + sx, 31 + sy); ne = (S0[0] + P['na'][0][0], S0[1] + P['na'][0][1]); nw = (S0[0] + P['na'][1][0], S0[1] + P['na'][1][1]); d = ya.unit(nw[0] - ne[0], nw[1] - ne[1]); fc = (nw[0] + d[0] * 1.6, nw[1] + d[1] * 1.6)
        turn = lambda a: (d[0] * math.cos(a) - d[1] * math.sin(a), d[0] * math.sin(a) + d[1] * math.cos(a))
        if kind == 'dis':
            f.fill(ya.seg((fc[0] + d[0] * .4, fc[1] + d[1] * .4), (fc[0] + d[0] * 5.4 * L, fc[1] + d[1] * 5.4 * L), 1.5, .9), 'S'); f.set(fc[0] + d[0] * 2.4 * L, fc[1] + d[1] * 2.4 * L - 1, 'T')      # (the finger that points)
        elif kind in ('cut', 'ccut'):
            f.fill(ya.seg((fc[0] + d[0] * .5, fc[1] + d[1] * .5), (fc[0] + d[0] * 4.4 * L, fc[1] + d[1] * 4.4 * L), 2.4, 1.2), 'S'); f.set(fc[0] + d[0] * 2.4 * L, fc[1] + d[1] * 2.4 * L - 1, 'T')
        else:
            for a, ln in ((-.95, 3.8), (-.32, 5.0), (.32, 5.0), (.95, 3.8)):
                e = turn(a); f.fill(ya.seg((fc[0] + e[0] * .8, fc[1] + e[1] * .8), (fc[0] + e[0] * ln * L, fc[1] + e[1] * ln * L), 1.5, 1.0), 'S')
    return top
def cast_pic(kind):
    def make(i):
        P = cast_params(i, kind); P['top'] = cast_hand(kind, i, P); f, nh, fh = ya.figure(P)
        if kind == 'dis' and 2 <= i <= 6:                                       # the dash back: pale streaks in front of him (he moves away from them)
            for y0, w in ((24, 0), (31, 1)): ya.streak(f, [(58 - w * 2, y0), (52 - w * 2, y0 + 1), (46 - w * 2, y0 + 1)], (.6, 1.4, 2.2), (0, .5, 1), False)
        return f, nh, fh
    return make
# ---- v1.119 CLEAVE (the MODE of Sukuna). 'atk6' = Yuji's ELBOW and 'atk26' = Yuji's GRAB + CLEAVE (the hand reaches out and closes on the enemy at 3 - 4, the other arm comes down in a red cut at 5 - 8), both with his head.
# 'lift' = the LIFT (BLUE crouched): he rises out of the crouch with the near hand reaching forward and up, the fingers spread: it closes on the enemy's face and holds him up (4 - 12); the far hand goes up behind the head (5 - 7) and cuts across the enemy's head (9 - 11), a pale trail behind it.
# 'dive' = the DIVE (BLUE in the air): the hang at the top of a jump (0), then he tips forward with the feet trailing and the near hand reaching forward and down with the fingers spread (2 - 11), then the landing crouch (12 - 14)
LIFT_N = {0: ((1, 5), (-1, 8)), 2: ((3, 1), (7, -4)), 4: ((4, -3), (9, -10)), 5: ((4.5, -3.5), (10, -11)), 12: ((4.5, -3.5), (10, -11)), 13: ((3, -1), (6, -4)), 14: ya.IDLE_N}      # the near hand of the LIFT: low by the hip in the crouch, up and forward to the height of the enemy's face (4), held there (5 - 12), let go (13 - 14)
FA_LIFT = {0: ya.IDLE_F, 3: ya.GUARD_F, 5: ((-1, -5), (-2, -13)), 6: ((0, -8), (0, -18)), 7: ((3, -9), (4, -19)), 9: ((8, -8), (15, -16)), 10: ((9, -4), (16, -9)), 11: ((8, 0), (14, -1)), 12: ((6, 4), (10, 5)), 14: ya.IDLE_F}      # the far hand: high up behind the head (5 - 7: the enemy hangs up there), thrown down across his head (9 - 11), back (12 - 14)
def lift_params(i):
    kv, GR = ya.kv, ya.GR
    return dict(by=round(kv({0: 7, 2: 4, 4: 0, 14: 0}, i)), ln=round(kv({0: 2, 4: 1, 9: 3, 12: 1, 14: 0}, i)), lf=(round(kv({0: 37, 4: 35, 14: 34}, i)), GR, 0), lb=(round(kv({0: 30, 4: 30, 14: 31}, i)), GR, 0), na=kv(LIFT_N, i), fa=kv(FA_LIFT, i), hp=i * .8, hback=0, hup=1 if 4 <= i <= 12 else 0, blink=False)
def lift_pic(i):
    P = lift_params(i); P['top'] = cast_hand('storm', i, P); f, nh, fh = ya.figure(P)
    if 8 <= i <= 12:
        pts = []
        for j in range(max(0, i - 3), i + 1): Q = lift_params(j); pts.append((36 + Q['ln'] + Q['fa'][1][0], 31 + Q['by'] + Q['fa'][1][1]))
        if pts[0] != pts[-1]: ya.streak(f, pts, (.8, 1.6, 2.6, 3.4)[-len(pts):], (0, .5, .8, 1.0)[-len(pts):], False)
    return f, nh, fh
DIVEK = {0: (-2, 0, (39, ya.GR - 11, 0), (35, ya.GR - 10, 0), ((5, 0), (10, -2)), ((4, 1), (9, 0))), 2: (-2, 2, (36, ya.GR - 12, -10), (31, ya.GR - 10, -8), ((6, 2), (11, 5)), ((2, 3), (-1, 6))),
         4: (-3, 4, (22, ya.GR - 19, -35), (19, ya.GR - 17, -35), ((6, 4), (12, 10)), ((0, 3), (-4, 5))), 8: (-3, 5, (20, ya.GR - 21, -35), (17, ya.GR - 19, -35), ((6, 4), (13, 10)), ((0, 3), (-5, 5))),
         11: (-3, 5, (20, ya.GR - 21, -35), (17, ya.GR - 19, -35), ((6, 4), (13, 10)), ((0, 3), (-5, 5))), 12: (3, 2, (36, ya.GR, 0), (30, ya.GR, 0), ((4, 3), (8, 2)), ((3, 3), (6, 3))),
         13: (6, 3, (37, ya.GR, 0), (29, ya.GR, 0), ((3, 4), (6, 0)), ya.GUARD_F), 14: (1, 0, (34, ya.GR, 0), (31, ya.GR, 0), ya.GUARD_N, ya.GUARD_F)}      # the DIVE: key pictures like DISK
def dive_pic(i):
    P = ya.jpar(DIVEK, i, 0, 0); P['top'] = cast_hand('storm', i, P); f, nh, fh = ya.figure(P)
    if 3 <= i <= 11:                                                            # the speed lines behind him (he falls toward the right)
        for y0, w in ((22, 0), (30, 1), (38, 2)): ya.streak(f, [(26 - w * 3, y0 - 6), (31 - w * 3, y0 - 3), (36 - w * 3, y0)], (.6, 1.4, 2.2), (0, .5, 1), False)
    return f, nh, fh
# ---- v1.120 FLAME (the second MODE of Sukuna). 'flame' = the pictures of OPEN, the BLUE move of that mode (the flames, the slime, the bow and the arrow are drawn by the game over these pictures, at the places of the two hands that flame_hands() gives):
# 0 - 4 he lifts both hands in front of his chest (the flames light), 5 the hands high for the clap, 6 the clap, 7 - 10 the hands apart playing with the flame (up and down, near and far), 11 he turns into the bow pose, 12 the full draw (the front arm straight out, the back hand at his cheek),
# 13 the release (the back hand flies open behind him), 14 he comes back to his guard
FL_N = {0: ya.IDLE_N, 1: ((1, 5.5), (2.5, 6)), 2: ((2.5, 4), (4.5, 2)), 3: ((5, 1), (8.5, -2)), 4: ((6.5, -1), (11, -4)), 5: ((3, -3), (5, -10)), 6: ((7, -1), (12, -3)), 7: ((8, -3), (14, -8)), 8: ((8.5, -1), (15.5, -3)), 9: ((6, -2), (11, -5)), 10: ((9, -2), (17, -4)), 11: ((10, -4), (18, -6)), 12: ((9.5, -5), (18.5, -8)), 13: ((9.5, -5), (18.5, -8)), 14: ya.GUARD_N}      # the near hand of each picture (elbow, hand from his shoulder)
FL_F = {0: ya.IDLE_F, 1: ((1, 4.5), (2.5, 5)), 2: ((2, 4), (4, 3)), 3: ((5, 2), (8.5, -1)), 4: ((5, 1), (9, 1)), 5: ((2, -2), (3, -9)), 6: ((7, 0), (12, -3)), 7: ((6, 3), (10, 5)), 8: ((3, 2), (4.5, 4)), 9: ((6, 1), (11, 1)), 10: ((5, 0), (7, -1)), 11: ((3, -3), (3, -7)), 12: ((-8, -3), (-4, -9)), 13: ((-9, -3), (-14, -6)), 14: ya.GUARD_F}      # the far hand (the back hand of the bow: at his cheek in 12, flying open behind him in 13)
def flame_params(i):
    kv, GR = ya.kv, ya.GR
    return dict(by=round(kv({0: 0, 5: -1, 6: 1, 7: 0, 14: 0}, i)), ln=round(kv({0: 0, 4: 1, 6: 2, 7: 1, 11: 1, 14: 0}, i)), lf=(round(kv({0: 34, 10: 34, 11: 36, 12: 38, 13: 38, 14: 35}, i)), GR, 0), lb=(round(kv({0: 31, 10: 31, 11: 30, 12: 28, 13: 28, 14: 30}, i)), GR, 0),
                na=FL_N[i], fa=FL_F[i], hp=i * .8, hback=0, blink=False)
def flame_pic(i):
    return ya.figure(flame_params(i))
def flame_hands(i):
    """where the two hands are on the 64 x 64 picture (x, y of the near hand, x, y of the far hand): the game puts the flames there"""
    P = flame_params(i); out = []
    for key, sx0 in (('na', 34), ('fa', 36)):
        ne, nw = P[key]; S = (sx0 + P['ln'], 31 + P['by']); e = (S[0] + ne[0], S[1] + ne[1]); w = (S[0] + nw[0], S[1] + nw[1]); d = ya.unit(w[0] - e[0], w[1] - e[1]); fc = (w[0] + d[0] * 1.6, w[1] + d[1] * 1.6)
        out += [round(fc[0] - 2, 1), round(fc[1], 1)]      # (the figure's column 16 is the picture's column 14, and its row 0 the picture's row 0: see render())
    return out
# ---- v1.124 the DOMAIN SIGN (the ULTIMATE of Sukuna, the Malevolent Shrine). 'sign' = his hand sign, made on Yuji's rig like Yuji's own DOMAIN EXPANSION sign (yuji_art.py, hs_pose) but with BOTH hands in front of his chin, side by side, and the MIDDLE FINGER of each hand stretched straight up so that the two fingertips touch:
# 0 he stands as he was, 1 - 4 the hands rise and come together (the fingers stretch on 4), 5 - 10 HELD (he breathes: the game plays 0 - 4, keeps 5 - 10 going for as long as the sign lasts, and then plays 11 - 14), 11 - 14 the hands come down again and the picture ends in the standing pose
SG_N = {0: ya.IDLE_N, 1: ((1.2, 5.6), (2.8, 6.4)), 2: ((2.8, 5.2), (5.2, 3.6)), 3: ((3.9, 4.9), (7.0, 1.0)), 4: ((4.5, 4.6), (8.0, -1.2)), 5: ((4.7, 4.5), (8.3, -1.8)), 10: ((4.7, 4.5), (8.3, -1.8)), 11: ((4.4, 4.7), (7.8, -.8)), 12: ((3.3, 5.0), (5.8, 2.4)), 13: ((1.4, 5.7), (3.0, 6.2)), 14: ya.IDLE_N}      # the near hand (elbow, wrist from its shoulder)
SG_F = {0: ya.IDLE_F, 1: ((.6, 5.0), (1.4, 6.2)), 2: ((2.2, 5.0), (4.3, 3.4)), 3: ((3.2, 5.0), (6.2, .8)), 4: ((3.7, 5.0), (7.2, -1.4)), 5: ((3.8, 4.9), (7.5, -2.0)), 10: ((3.8, 4.9), (7.5, -2.0)), 11: ((3.6, 5.0), (7.0, -1.0)), 12: ((2.6, 5.0), (5.0, 2.2)), 13: ((1.0, 5.0), (1.8, 6.0)), 14: ya.IDLE_F}      # the far hand (behind the near one: its arm is hidden by his body)
def sign_params(i):
    kv, GR = ya.kv, ya.GR; br = round(.6 + .6 * math.sin(2 * math.pi * (i - 5) / 6)) if 5 <= i <= 10 else 0
    return dict(by=round(kv({0: 0, 3: 2, 5: 2, 10: 2, 14: 0}, i)) + br, ln=round(kv({0: 0, 4: 2, 10: 2, 14: 1}, i)), hx=round(kv({0: 0, 4: -1, 10: -1, 14: 0}, i)), hd=round(kv({0: 0, 4: 1, 10: 1, 14: 0}, i)),
                lf=(round(kv({0: 34, 4: 38, 10: 38, 14: 34}, i)), GR, 0), lb=(round(kv({0: 31, 4: 28, 10: 28, 14: 31}, i)), GR, 0), na=kv(SG_N, i), fa=kv(SG_F, i), hp=i * .9, hup=1 if 3 <= i <= 12 else 0, hback=0, blink=False)
def sign_fist(P):
    """where the near fist is (x, y on the figure) for these parameters"""
    ne, nw = P['na']; S = (34 + P['ln'], 31 + P['by']); e = (S[0] + ne[0], S[1] + ne[1]); w = (S[0] + nw[0], S[1] + nw[1]); d = ya.unit(w[0] - e[0], w[1] - e[1]); return (w[0] + d[0] * 1.6, w[1] + d[1] * 1.6)
def sign_top(i, P):
    kv = ya.kv; L = 6.6 * kv({0: 0, 3: 0, 5: 1, 10: 1, 12: 0, 14: 0}, i)      # how long the middle fingers are (0 = a plain fist)
    def top(f, sx, sy):
        if L < .6 and i < 4: return
        cn = sign_fist(P); sp = 3.4 * kv({0: 0, 3: 0, 4: .6, 5: 1, 10: 1, 11: .6, 13: 0, 14: 0}, i)      # (sp: how far the far hand is behind the near hand)
        cf = (cn[0] - sp, cn[1] + .5 * min(1, sp / 3.4)); tip = (cn[0] - sp * .5 + .3, cn[1] - 1.5 - L)
        def hand(c, col, hi, lo, lean):      # a fist and, from its top, the middle finger leaning in to the tip where the two meet
            fd = ya.disc(c[0], c[1], 1.9); f.fill(fd, col); f.rim(fd, 'O'); f.fill(fd, col); f.set(c[0] - 1, c[1] - .6, hi); f.set(c[0] + .6, c[1] + 1.4, lo)
            if L >= 1:
                p0 = (c[0] + lean * .3, c[1] - 1.3); p1 = (tip[0] + (0 if lean > 0 else .1), tip[1] + (0 if lean > 0 else .3)); fm = ya.seg(p0, p1, 1.5, 1.0) | ya.disc(p0[0], p0[1], .9)
                f.fill(fm, col); f.rim(fm, 'O'); f.fill(fm, col)
                for x, y in fm:
                    if (x - 1, y) not in fm: f.set(x, y, hi)
                    elif (x + 1, y) not in fm: f.set(x, y, lo)
        hand(cf, 'U', 'S', 'V', -1); hand(cn, 'S', 'T', 'U', 1)      # (the far hand first, in the darker skin, the near one over it)
        if L >= 1: f.set(tip[0], tip[1] - 1, 'T')      # (a light pixel on the two fingertips where they touch)
    return top
def sign_pic(i):
    P = sign_params(i); P['top'] = sign_top(i, P); return ya.figure(P)
def sign_tip(i):
    """where the touching fingertips are on the 64 x 64 picture (x, y): the game puts a spark there"""
    P = sign_params(i); cn = sign_fist(P); sp = 3.4 * ya.kv({0: 0, 3: 0, 4: .6, 5: 1, 10: 1, 11: .6, 13: 0, 14: 0}, i); L = 6.6 * ya.kv({0: 0, 3: 0, 5: 1, 10: 1, 12: 0, 14: 0}, i)
    return [round(cn[0] - sp * .5 + .3 - 2, 1), round(cn[1] - 1.5 - L - 1, 1)]      # (the figure's column 16 is the picture's column 14)
# ---- v1.135 the AIR FIGHT (chapter 3, Sukuna against Mahoraga high over the city): 'air' = 15 pictures on Yuji's rig with the feet hanging free (the game turns each picture about his hips as he tilts and spins):
# 0 - 3 balanced in the air (the arms out, the feet hanging, the hair lifting: a loop), 4 the hand that beckons, 5 - 6 leaning back out of the way (the feet kicked forward, the arms thrown out), 7 the chop wound up (the hand high behind the head), 8 the chop (the hand through, a pale trail),
# 9 pulling a rope (the hands at the chest, leaning back, the legs braced), 10 holding the rope out while he spins (one arm straight out along it, the other thrown back), 11 the heave wound up (both arms low and back), 12 the heave let go (both arms thrown up and forward),
# 13 held in a hand (limp), 14 falling (straight, the hands at the hips, the hair streaming)
AIRP = [
    dict(by=0, ln=0, lf=(35, GR_ - 3, 38), lb=(31, GR_ - 5, 32), na=((4, 3.5), (8, 7)), fa=((-3, 3.5), (-6, 7.5)), hp=0.0, hup=1, hback=0),
    dict(by=-1, ln=0, lf=(35, GR_ - 2, 36), lb=(31, GR_ - 4, 34), na=((4.5, 2.5), (9, 5)), fa=((-3.5, 2.5), (-7, 5.5)), hp=1.6, hup=1, hback=0),
    dict(by=0, ln=0, lf=(34, GR_ - 4, 34), lb=(31, GR_ - 3, 38), na=((4, 3.5), (8, 7)), fa=((-3, 3.5), (-6, 7.5)), hp=3.2, hup=0, hback=0),
    dict(by=1, ln=0, lf=(35, GR_ - 3, 38), lb=(31, GR_ - 5, 33), na=((3.5, 4), (7, 8)), fa=((-2.5, 4), (-5, 8.5)), hp=4.8, hup=0, hback=1),
    dict(by=0, ln=-1, lf=(35, GR_ - 3, 36), lb=(31, GR_ - 4, 34), na=((4.5, 1), (9.5, -4)), fa=((-2, 4.5), (-3.5, 9)), hp=2.0, hup=1, hback=0, hd=0),
    dict(by=1, ln=-2, hx=-1, lf=(40, GR_ - 11, -8), lb=(36, GR_ - 8, -4), na=((5, -2), (10, -6)), fa=((3, -3), (7, -8)), hp=1.0, hup=1, hback=2, hs=-1),
    dict(by=2, ln=-3, hx=-2, lf=(45, GR_ - 16, -22), lb=(40, GR_ - 12, -14), na=((4, -3), (8, -9)), fa=((2, -4), (5, -10)), hp=2.5, hup=1, hback=3, hs=-2, hd=1),
    dict(by=0, ln=-1, lf=(36, GR_ - 5, 34), lb=(31, GR_ - 6, 30), na=((-2, -4.5), (-4, -11.5)), fa=((-3, 4), (-6, 8)), hp=1.2, hup=1, hback=1),
    dict(by=1, ln=2, hx=1, lf=(38, GR_ - 6, 28), lb=(31, GR_ - 6, 26), na=((7, 1), (13.5, 5.5)), fa=((-3, 4), (-6, 8)), hp=2.2, hup=0, hback=0),
    dict(by=2, ln=-3, hx=-1, lf=(43, GR_ - 9, -10), lb=(38, GR_ - 6, -8), na=((-1, 4), (6, 3.5)), fa=((-2, 5), (4.5, 5)), hp=0.6, hup=0, hback=1, hs=-1),
    dict(by=1, ln=-2, hx=0, lf=(41, GR_ - 6, 12), lb=(28, GR_ - 4, 14), na=((7.5, -.5), (16, -1.5)), fa=((-5, 2), (-9.5, 0)), hp=1.8, hup=0, hback=2),
    dict(by=2, ln=-2, lf=(37, GR_ - 6, 22), lb=(30, GR_ - 6, 22), na=((-3, 5), (-6, 10)), fa=((-4, 5), (-7, 10)), hp=0.4, hup=0, hback=1, hd=1),
    dict(by=-1, ln=3, hx=1, lf=(38, GR_ - 8, 4), lb=(32, GR_ - 7, 8), na=((5, -4), (9, -11)), fa=((4, -4), (8, -10)), hp=2.8, hup=1, hback=0),
    dict(by=3, ln=-2, lf=(33, GR_ - 2, 46), lb=(30, GR_ - 4, 40), na=((-1, 6), (-1.5, 11)), fa=((-2, 6), (-3, 11)), hp=0.8, hup=0, hback=0, hd=2),
    dict(by=0, ln=0, lf=(34, GR_ - 1, 22), lb=(32, GR_ - 2, 18), na=((.5, 5.5), (1, 10)), fa=((-.5, 5), (-1, 9.5)), hp=3.5, hup=1, hback=2),
]
def air_pic(i):
    P = dict(AIRP[i]); P['blink'] = False
    if i in (4, 10): P['top'] = cast_hand('cut' if i == 10 else 'storm', 6, P)      # (the blade of a hand along the rope; the open palm that beckons)
    f, nh, fh = ya.figure(P)
    if i == 8:                                                                          # the chop's trail: a pale ribbon along the path of the hand
        pts = [(34 + AIRP[j]['ln'] + AIRP[j]['na'][1][0], 31 + AIRP[j]['by'] + AIRP[j]['na'][1][1]) for j in (7, 7, 8)]; pts = [(pts[0][0] - 1, pts[0][1] - 5), (pts[0][0] + 4, pts[0][1] + 1), pts[2]]
        ya.streak(f, pts, (.8, 1.8, 3.0), (0, .6, 1.0), False)
    return f, nh, fh
GEN = {'slash': {'top': 0, 'frames': ya.pack(slash, 16, 48, 0)[0]}, 'slashL': {'top': 0, 'frames': ya.pack(slash_pic('slashL'), 16, 48, 0)[0]}, 'slashX': {'top': 0, 'frames': ya.pack(slash_pic('slashX'), 16, 48, 0)[0]}, 'kick': {'top': 0, 'frames': ya.pack(kick, 16, 48, 0)[0]}, 'cut': {'top': 0, 'frames': ya.pack(cast_pic('cut'), 16, 48, 0)[0]}, 'storm': {'top': 0, 'frames': ya.pack(cast_pic('storm'), 16, 48, 0)[0]}, 'ccut': {'top': 0, 'frames': ya.pack(cast_pic('ccut'), 16, 48, 0)[0]}, 'dis': {'top': 0, 'frames': ya.pack(cast_pic('dis'), 16, 48, 0)[0]}, 'lift': {'top': 0, 'frames': ya.pack(lift_pic, 16, 48, 0)[0]}, 'dive': {'top': 0, 'frames': ya.pack(dive_pic, 16, 48, 0)[0]}, 'flame': {'top': 0, 'frames': ya.pack(flame_pic, 16, 48, 0)[0]}, 'sign': {'top': 0, 'frames': ya.pack(sign_pic, 16, 48, 0)[0]}, 'air': {'top': 0, 'frames': ya.pack(air_pic, 16, 48, 0)[0]}}      # (the sets made here, in the form of yuji.json's)

def yuji(name, i):
    """Yuji's picture i of a set as a grid of 64 figure rows x 48 columns (a jump's 4 empty rows above and below the figure are dropped; the game draws them 4 rows higher)"""
    s = GEN.get(name) or Y[NEWROWS.get(name, name)]; top = s['top']; rows = s['frames'][min(i, len(s['frames']) - 1)]      # (the block has 10 pictures: its row holds the last one for the other 5)
    assert len(rows) == 64 + 2 * top and all(set(r) == {'.'} for r in rows[:top] + rows[top + 64:]), (name, i, 'figure outside its 64 rows')
    off = MIDX - (s['cx'] - s['x0']) if name in NEWROWS else 0
    assert name not in NEWROWS or (off >= 0 and all(len(r) + off <= wid(name) for r in rows)), (name, i, 'too wide')
    return [list(('.' * off + r).ljust(wid(name), '.')) for r in rows[top:top + 64]]

TPL = [(r, c) for r in range(15, 30) for c in range(14, 27) if FR[0][r][c] != '.']      # Yuji's face and hood in his first idle picture: the pattern to find in every picture

def shift_of(g, wide=False, W=WID):
    """how far Yuji's face and hood are moved in picture g from his first idle picture: the shift with the fewest differences (a fist drawn over the face makes some)"""
    best = None
    for dy in range(-8, 17):
        for dx in (range(-8, 17) if wide else range(-6, 11)):      # (the new rows of v1.154 are put 4 columns further right: they search further)
            mis = sum(1 for r, c in TPL if not (0 <= r + dy < 64 and 0 <= c + dx < W) or g[r + dy][c + dx] != FR[0][r][c])
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
    g = yuji(name, i); dx, dy, mis = shift_of(g, name in NEWROWS, wid(name)); WD = wid(name); blink = i in BLINK.get(name, ()); keep = 0
    for r in range(30):                                          # Yuji's head out: the hair (rows 0 - 14) all of it, below it only what is still the pixel of his head (a fist over the face stays)
        for c in range(WD):
            x, y = c + dx, r + dy
            if not (0 <= x < WD and 0 <= y < 64): continue
            if r <= 14 or g[y][x] == (FR[0][r][c] if c < C else '.') or (blink and 15 <= r <= 19 and 21 <= c <= 25): g[y][x] = '.'
            else: keep += 1
    for r in range(30):                                          # ... his in, wherever it is free
        for c in range(C):
            x, y = c + dx, r + dy
            if H[r][c] != '.' and 0 <= x < WD and 0 <= y < 64 and g[y][x] == '.': g[y][x] = H[r][c]
    if blink and g[16 + dy][22 + dx] == 'W': g[16 + dy][22 + dx] = 'e'      # (the eye shuts to a dark line)
    f = fist_of(g) if name in NAILS else None
    if f:                                                        # dark nails on the hand in the pocket, where the hand is
        for c, r in ((21, 40), (22, 41)):
            x, y = c + f[0], r + f[1]
            if g[y][x] in 'STUV': g[y][x] = 'n'
    return g, (dx, dy, mis, keep, f)

def render(grid, x0=GX, y0=GY, w=WID):
    im = Image.new('RGBA', (64, 64), (0, 0, 0, 0))
    for r in range(64):
        for c in range(w):
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
            g, nfo = picture(name, i, H); info[name, i] = nfo; row.append(render(g, gx(name), GY, wid(name)))
        rows.append(row)
    strip(rows).save(os.path.join(HERE, 'sukuna_idle.png'), transparency=0, optimize=True); print('wrote sukuna_idle.png', 64 * 15, 'x', 64 * len(ROWS)); print('SU_FL_HANDS =', [flame_hands(i) for i in range(15)]); print('SU_SIGN_TIP =', [sign_tip(i) for i in range(15)])
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
