# python3 sukuna_art.py [--preview DIR] -> sukuna_idle.png: SUKUNA in the game's own Yuji style, 6 rows of 15 pictures (960 x 384; 64 x 64 each), facing right like Yuji:
# row 0 idle, 1 walk, 2 jump, 3 crouch down (standing up plays it backwards), 4 crouched idle, 5 crouch walk (walking back plays it backwards).
# He is Yuji's idle picture (yuji.json) with a new head: tall swept-up spiky hair in a dustier rose, a bare forehead, a slanted brow, one narrow eye, the black face marks,
# the ear, a smirk, a rolled red collar and dark nails; same palette letters (a few recoloured), same chunky outline. Every other picture is Yuji's own picture of that move
# (the breath, the steps, the jump, the crouch) with this head and collar put where Yuji's head and collar are in that picture (in all of them the face and the hood move as
# one piece; only the tips of his hair differ, and an arm that is drawn over the face stays over it), and a blink in 9 and 10 of the two idle rows.
# Each picture sits on its 64 x 64 canvas where Yuji's sits in the game (column 14, row 1), so he stands exactly where Yuji stands.
import json, os, sys
from PIL import Image, ImageDraw

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

ROWS = ('idle', 'fwd', 'jump', 'cdn', 'cidle', 'cfwd')      # the strip's rows: Yuji's sets of the move (idle, walk, jump, crouch down, crouched idle, crouch walk), 15 pictures each
BLINK = {'idle': (9, 10), 'cidle': (9, 10)}                 # (his own blinks: the pictures where his eye is shut)
NAILS = ('idle', 'fwd', 'cdn')                               # (the pictures where the hand is in the pocket, or still on its way up to the guard: the nails show; the guard and the jump hold it up in a fist of another shape)
WID = 48                                                    # (the widest of Yuji's pictures of these moves is 44)

def yuji(name, i):
    """Yuji's picture i of a set as a grid of 64 figure rows x 48 columns (a jump's 4 empty rows above and below the figure are dropped; the game draws them 4 rows higher)"""
    s = Y[name]; top = s['top']; rows = s['frames'][i]
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
