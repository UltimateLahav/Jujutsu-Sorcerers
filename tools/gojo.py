#!/usr/bin/env python3
"""Gojo 16-bit sprite, 64x64 grid (v3)."""
import sys, os

W = H = 64

PAL = {
    'O': '#0f0b14',  # outline
    'A': '#17121c',  # deepest shadow
    'B': '#2a2230',  # uniform base
    'C': '#3b3050',  # uniform lit
    'D': '#6d56a0',  # purple sheen
    'E': '#8f7ac4',  # purple sheen light
    'F': '#b8a6ea',  # purple peak
    'H': '#f4f2f8',  # hair
    'I': '#dcd6e8',
    'J': '#c5bbdc',
    'K': '#9a8cc0',
    'L': '#5e5189',
    'M': '#b3a9d9',  # hair outline (light lavender)
    'W': '#ffffff',
    'S': '#eec7b4',  # skin
    'T': '#fbe3d4',
    'U': '#d1a08f',
    'V': '#a06d68',
    'X': '#0e0b12',  # blindfold
    'Y': '#2f2744',
    'P': '#15111b',  # shoes
    'Q': '#2c2638',
    'R': '#585270',
    'Z': '#8a84a4',
}

grid = [['.'] * W for _ in range(H)]


def put(c, r, ch):
    if 0 <= c < W and 0 <= r < H:
        grid[r][c] = ch


def get(c, r):
    if 0 <= c < W and 0 <= r < H:
        return grid[r][c]
    return '.'


def span(r, c0, c1, ch):
    for c in range(c0, c1 + 1):
        put(c, r, ch)


def blk(r0, c0, rows):
    """Paint a block; '.' leaves the pixel alone, '_' clears it."""
    for dr, line in enumerate(rows):
        for dc, ch in enumerate(line):
            if ch == '.':
                continue
            put(c0 + dc, r0 + dr, '.' if ch == '_' else ch)


# ------------------------------------------------------------------ uniform silhouette
SIL = {
    12: [(27, 35)],
    13: [(27, 36)],
    14: [(22, 38)],
    15: [(22, 38)],
    16: [(22, 38)],
    17: [(22, 39)],
    18: [(22, 39)],
    19: [(22, 39)],
    20: [(22, 39)],
    21: [(22, 39)],
    22: [(22, 39)],
    23: [(22, 24), (26, 35), (37, 39)],
    24: [(26, 35), (37, 40)],
    25: [(26, 35), (37, 40)],
    26: [(26, 39)],
    27: [(26, 39)],
    28: [(26, 39)],
    29: [(26, 38)],
    30: [(26, 37)],
    31: [(25, 37)],
    32: [(25, 36)],
    33: [(25, 36)],
    34: [(26, 36)],
    # legs
    35: [(26, 30), (32, 36)],
    36: [(26, 30), (32, 36)],
    37: [(26, 29), (32, 36)],
    38: [(26, 29), (32, 35)],
    39: [(26, 29), (32, 35)],
    40: [(26, 29), (32, 35)],
    41: [(26, 29), (32, 34)],
    42: [(26, 29), (32, 34)],
    43: [(26, 29), (32, 34)],
    44: [(26, 29), (32, 34)],
    45: [(26, 29), (32, 34)],
    46: [(27, 29), (31, 33)],
    47: [(27, 29), (31, 33)],
    48: [(27, 29), (31, 33)],
    49: [(27, 29), (31, 33)],
    50: [(27, 29), (31, 33)],
    51: [(27, 29), (31, 33)],
    52: [(27, 29), (31, 33)],
    53: [(27, 29), (31, 33)],
    54: [(28, 30), (31, 33)],
    55: [(28, 30), (31, 33)],
    56: [(28, 30), (31, 33)],
    57: [(27, 30), (31, 33)],
    58: [(27, 30), (31, 34)],
    59: [(28, 29), (31, 34)],
    60: [(31, 35)],
    61: [(32, 35)],
    62: [(33, 35)],
}
for r, spans in SIL.items():
    for c0, c1 in spans:
        span(r, c0, c1, 'B')

# slit between the right arm and the torso
for c, r in ((36, 23), (36, 24), (36, 25)):
    put(c, r, '.')


# ------------------------------------------------------------------ hair (profile generator)
def make_hair(top, bottom=6, extra=(), strands=(), hi=(), bangs=()):
    mask = set()
    for c, t in top.items():
        for r in range(t, bottom + 1):
            mask.add((c, r))
    mask.update(extra)
    out = {}
    for (c, r) in mask:
        edge = any((c + dc, r + dr) not in mask for dc, dr in ((1, 0), (-1, 0), (0, 1), (0, -1)))
        below_open = (c, r + 1) not in mask
        side_open = any((c + dc, r) not in mask for dc in (1, -1)) or (c, r - 1) not in mask
        if edge and (side_open or not below_open):
            out[(c, r)] = 'M'
        elif r <= 4:
            out[(c, r)] = 'H'
        elif r == 5:
            out[(c, r)] = 'H' if (c + r) % 2 == 0 else 'I'
        else:
            out[(c, r)] = 'I' if (c + r) % 2 == 0 else 'J'
    for p, ch in list(strands) + list(hi):
        if out.get(p) not in (None, 'M'):
            out[p] = ch
    for p, ch in bangs:
        out[p] = ch
    return out


HAIR = make_hair(
    top={27: 4, 28: 2, 29: 4, 30: 2, 31: 3, 32: 1, 33: 2, 34: 4},
    extra=[(26, 5), (35, 5)],
    strands=[((31, 4), 'I'), ((29, 5), 'I'), ((33, 5), 'I'), ((30, 5), 'I')],
    hi=[((30, 3), 'W'), ((32, 3), 'W'), ((32, 4), 'W'), ((28, 4), 'W')],
    bangs=[((27, 7), 'M'), ((28, 7), 'J'), ((30, 7), 'J'), ((33, 7), 'J')],
)
for (c, r), ch in HAIR.items():
    put(c, r, ch)

# ------------------------------------------------------------------ face / blindfold / collar
blk(7, 26, [
    "...X.XX.X.",          # blindfold top row (hair bangs overlay above)
    "..XXXYXXX.",
    "..USSTSSU.",
    "..OSSUVUO.",
    ".ODDSSUBBO",
    ".OBCBADDDO",
])
put(28, 7, 'J'); put(30, 7, 'J'); put(33, 7, 'J')
put(29, 7, 'X'); put(31, 7, 'X'); put(32, 7, 'X'); put(34, 7, 'X')

# ------------------------------------------------------------------ hand
blk(7, 22, [
    ".T..",
    ".S..",
    "US..",
    "US.S",
    "UTSU",
    "VSUU",
    "VSSV",
    ".SU.",
])

# pocket hand peeking out
put(36, 30, 'S')
put(36, 31, 'U')


# ------------------------------------------------------------------ outline pass
def outline_pass():
    marks = []
    for r in range(H):
        for c in range(W):
            if grid[r][c] == 'B':
                for dc, dr in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                    if get(c + dc, r + dr) == '.':
                        marks.append((c, r))
                        break
    for c, r in marks:
        put(c, r, 'O')


outline_pass()


# ------------------------------------------------------------------ shading bands (only on plain fill)
def tint(c, r, ch):
    if get(c, r) == 'B':
        put(c, r, ch)


for r in range(16, 23):
    tint(23, r, 'C')          # left sleeve lit edge
    tint(25, r, 'A')          # sleeve / torso seam
for r in range(22, 34):
    tint(27 if r < 31 else 26, r, 'C')   # torso lit edge
for r in range(23, 26):
    tint(34, r, 'A')          # torso shadow beside the slit
for r in range(15, 22):
    tint(36, r, 'A')          # right arm / torso seam
    tint(38, r, 'A')          # right arm shadow edge
for r in range(27, 34):
    tint(37 if r < 31 else 35, r, 'A')
for r in range(36, 46):
    tint(27, r, 'C')          # left thigh lit
for r in range(46, 54):
    tint(28, r, 'C')
for r in range(37, 46):
    tint(33, r, 'C')          # right thigh lit
for r in range(46, 54):
    tint(32, r, 'C')
for c in range(28, 36):
    tint(c, 34, 'A')          # jacket hem shadow
for c in range(27, 30):
    tint(c, 15, 'C'); tint(c, 14, 'C')   # left shoulder top lit

for r in range(15, 34):
    if get(31, r) in ('B', 'C'):
        put(31, r, 'A')   # jacket centre seam

# ------------------------------------------------------------------ sheen strokes
STROKES = [
    # left shoulder rim, wedge and V
    (25, 14, 'D'), (26, 14, 'D'), (27, 14, 'E'),
    (25, 15, 'D'), (26, 15, 'D'), (26, 16, 'D'), (27, 16, 'D'), (27, 17, 'D'), (28, 17, 'E'),
    (28, 18, 'D'), (29, 18, 'D'),
    (30, 16, 'D'), (30, 17, 'D'), (30, 18, 'D'),
    # collar base strip
    (31, 14, 'D'), (32, 14, 'D'),
    # right shoulder strips
    (36, 14, 'D'), (37, 14, 'E'), (38, 14, 'D'),
    (32, 16, 'D'), (33, 16, 'D'), (34, 16, 'D'), (35, 15, 'D'), (36, 15, 'D'), (37, 15, 'E'),
    # left chest diagonal + fork
    (27, 20, 'D'), (28, 21, 'D'), (29, 22, 'D'), (30, 23, 'D'), (31, 23, 'D'), (30, 24, 'D'),
    # left lower
    (27, 26, 'D'), (28, 27, 'D'), (29, 27, 'D'),
    # right centre long strip
    (34, 22, 'D'), (34, 23, 'D'), (34, 24, 'D'), (35, 25, 'D'), (35, 26, 'D'), (35, 27, 'D'),
    # arm diagonal + pocket line
    (38, 22, 'D'), (38, 23, 'D'), (37, 24, 'D'), (37, 25, 'D'), (37, 26, 'D'), (36, 27, 'D'),
    (36, 29, 'D'), (37, 28, 'E'), (38, 27, 'D'), (39, 26, 'D'),
    # hem
    (28, 32, 'D'), (29, 32, 'D'), (30, 32, 'D'),
    # left sleeve (cuff, folds, elbow)
    (22, 15, 'D'), (22, 16, 'D'), (23, 17, 'D'), (24, 17, 'D'), (22, 20, 'D'), (23, 21, 'D'),
    (22, 23, 'D'), (23, 23, 'E'), (24, 23, 'D'),
    # legs
    (29, 36, 'D'), (28, 37, 'D'), (27, 38, 'D'),
    (28, 39, 'D'), (28, 40, 'D'), (28, 41, 'D'), (27, 41, 'D'), (27, 42, 'D'), (28, 42, 'D'),
    (26, 43, 'D'), (27, 43, 'E'), (28, 43, 'D'), (26, 44, 'D'), (27, 44, 'D'),
    (34, 43, 'D'), (34, 44, 'D'),
    (32, 47, 'D'), (33, 48, 'D'),
    (32, 50, 'D'), (33, 51, 'D'),
    (32, 53, 'D'), (33, 54, 'D'),
    (33, 55, 'D'), (32, 56, 'D'), (33, 56, 'E'), (32, 57, 'D'), (33, 57, 'D'),
]
for c, r, ch in STROKES:
    if get(c, r) in ('B', 'O', 'C', 'A'):
        put(c, r, ch)

# ------------------------------------------------------------------ shoes (interiors only; outline stays)
SHOE = [
    (29, 54, 'P'), (29, 55, 'P'), (29, 56, 'R'),
    (28, 57, 'Q'), (29, 57, 'Z'), (28, 58, 'P'), (29, 58, 'R'),
    (32, 58, 'Q'), (33, 58, 'Q'),
    (32, 59, 'R'), (33, 59, 'Q'),
    (32, 60, 'R'), (33, 60, 'Q'), (34, 60, 'Q'),
    (33, 61, 'R'), (34, 61, 'Z'),
]
for c, r, ch in SHOE:
    if get(c, r) in ('B', 'C', 'A', 'O'):
        put(c, r, ch)


def dump():
    print("    " + "".join(str(c % 10) for c in range(20, 44)))
    for r in range(H):
        print(f"{r:2d}  " + ''.join(grid[r][20:44]))


if __name__ == '__main__':
    here = os.path.dirname(os.path.abspath(__file__))
    sys.path.insert(0, here)
    import tools
    if len(sys.argv) > 1 and sys.argv[1] == 'dump':
        dump()
    else:
        tools.render(grid, PAL, 10).save(os.path.join(here, 'preview.png'))
        if len(sys.argv) > 1:
            tools.compare(grid, PAL, sys.argv[1], os.path.join(here, 'compare.png'), 10)
        print('ok')
