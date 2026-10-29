# python3 sukuna_art.py [--preview DIR] -> sukuna_idle.png: SUKUNA in the game's own Yuji style, 15 idle pictures side by side (15 x 64 wide, 64 high), facing right like Yuji.
# He is Yuji's idle picture (yuji.json) with a new head: tall swept-up spiky hair in a dustier rose, a bare forehead, a slanted brow, one narrow eye, the black face marks,
# the ear, a smirk, a rolled red collar and dark nails; same palette letters (a few recoloured), same chunky outline. The other 14 pictures are Yuji's own idle pictures
# (the breath, the sway of the fists and the legs) with this head and collar put where Yuji's head and collar are in that picture, and a blink in 9 and 10.
# The picture sits on its 64 x 64 canvas where Yuji's sits in the game (column 14, row 1), so he stands exactly where Yuji stands.
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

def shift_of(i):
    """how far Yuji's face (and collar) is moved in idle picture i from picture 0: the shift with the fewest differences (it moves as one piece, 3 differences at most: the blink)"""
    a, b = FR[0], FR[i]; best = None
    for dy in range(-3, 4):
        for dx in range(-3, 4):
            mis = sum(1 for r in range(15, 30) for c in range(14, 27) if a[r][c] != '.' and (not (0 <= r + dy < R and 0 <= c + dx < C) or b[r + dy][c + dx] != a[r][c]))
            if best is None or (mis, abs(dx) + abs(dy)) < best[0]: best = ((mis, abs(dx) + abs(dy)), dx, dy)
    return best[1], best[2]

def fist_of(i):
    """where the fist in the pocket is in picture i, as (dx, dy) from picture 0 (its 4 x 2 block of skin), or None when it is not a block any more"""
    best = None
    for dy in range(-4, 5):
        for dx in range(-4, 5):
            n = sum(1 for r in (40, 41) for c in range(19, 23) if 0 <= r + dy < R and 0 <= c + dx < C and FR[i][r + dy][c + dx] == 'S')
            if best is None or (-n, abs(dx) + abs(dy)) < best[0]: best = ((-n, abs(dx) + abs(dy)), dx, dy)
    return (best[1], best[2]) if best[0][0] <= -6 else None

def picture(i, H):
    """Sukuna's idle picture i (a grid of 64 rows x 40 letters)"""
    g = [list(r) for r in FR[i]]; dx, dy = shift_of(i)
    for r in range(0, min(R, 30 + dy)):
        for c in range(C): g[r][c] = '.'                                                # Yuji's head, hair and collar out ...
    for r in range(30):
        for c in range(C):
            if H[r][c] != '.' and 0 <= r + dy < R and 0 <= c + dx < C: g[r + dy][c + dx] = H[r][c]      # ... his in
    if i in (9, 10):                                                                   # the blink (the eye shuts to a dark line)
        g[16 + dy][22 + dx] = 'e'
    f = fist_of(i)
    if f:                                                                              # dark nails on the hand in the pocket, where the hand is
        for c, r in ((21, 40), (22, 41)):
            x, y = c + f[0], r + f[1]
            if g[y][x] in 'STUV': g[y][x] = 'n'
    return g

def render(grid, x0=GX, y0=GY):
    im = Image.new('RGBA', (64, 64), (0, 0, 0, 0))
    for r in range(R):
        for c in range(C):
            ch = grid[r][c]
            if ch != '.' and ch in PAL and 0 <= c + x0 < 64 and 0 <= r + y0 < 64: im.putpixel((c + x0, r + y0), tuple(int(PAL[ch][k:k + 2], 16) for k in (1, 3, 5)) + (255,))
    return im

def strip(pics):
    """the 15 pictures side by side as a palette PNG (colour 0 = see-through)"""
    cols = sorted({im.getpixel((x, y))[:3] for im in pics for y in range(64) for x in range(64) if im.getpixel((x, y))[3]})
    assert len(cols) < 255, len(cols)
    idx = Image.new('P', (64 * len(pics), 64), 0); idx.putpalette([0, 0, 0] + [v for c in cols for v in c]); look = {c: k + 1 for k, c in enumerate(cols)}
    for n, im in enumerate(pics):
        for y in range(64):
            for x in range(64):
                p = im.getpixel((x, y))
                if p[3]: idx.putpixel((64 * n + x, y), look[p[:3]])
    return idx

if __name__ == '__main__':
    H = head(); pics = [render(picture(i, H)) for i in range(15)]
    strip(pics).save(os.path.join(HERE, 'sukuna_idle.png'), transparency=0, optimize=True); print('wrote sukuna_idle.png', 64 * 15, 'x 64')
    if '--preview' in sys.argv:
        out = sys.argv[sys.argv.index('--preview') + 1]; os.makedirs(out, exist_ok=True); S = 6
        sheet = Image.new('RGBA', (64 * S * 5, 64 * S * 3), (60, 64, 84, 255))
        for n, im in enumerate(pics): b = im.resize((64 * S, 64 * S), Image.NEAREST); sheet.paste(b, ((n % 5) * 64 * S, (n // 5) * 64 * S), b)
        sheet.save(os.path.join(out, 'sukuna_idle_x6.png'))
        yu = render([list(r) for r in FR[0]]); both = Image.new('RGBA', (64 * 8 * 2 + 16, 64 * 8), (200, 200, 210, 255))
        for n, im in enumerate((yu, pics[0])): b = im.resize((512, 512), Image.NEAREST); both.paste(b, (n * 528, 0), b)
        both.save(os.path.join(out, 'yuji_vs_sukuna_x8.png')); print('previews in', out)
