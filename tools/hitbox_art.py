#!/usr/bin/env python3
"""Hitboxes, measured from the pictures themselves.
For every move of Gojo, Yuji and Verity (the hit numbers of the game: 0-3 the M1 combo, 6-7 the crouch punches / Verity's claws, 14-21 Gojo's walking and red combos, 22 Verity's bite, 24-29 Yuji's M1, 36-37 his DIVERGENT FIST, 44-45 his RUSH FIST (the super fast DIVERGENT FIST on the run), 38-43 his cursed energy mode moves: R.KICK, ELBOW, DOWNSLAM, PUSH KICK, CONCENTRATED FIST and the SWEEP) and for every body it can land on, this finds how far apart the two characters' anchors (the middle of the hips) can be while the limb the attacker has stretched out at the moment of impact (the two frames from the impact frame on) still overlaps the drawn body of the target. Both are compared ROW BY ROW, because a fist at chest height, a hanging arm and a foot all stop at different distances. Glow effects (Gojo's blue sparks) are not part of a limb. The target is its standing picture (the widest its idle animation gets in each row).
Writes hitboxes.json: {attacker: {hit number: {target: the gap in px}}}; the game (HIT in tools/template.html) lands a hit when the gap is at most that.
Run from the tools folder, after the art and tools/template.html are final:  python3 -B hitbox_art.py"""
import base64, io, json, os, re
from PIL import Image
HERE = os.path.dirname(os.path.abspath(__file__)); P = lambda n: os.path.join(HERE, n)
tpl = open(P('template.html'), encoding='utf-8').read()
IMPACT = json.loads(re.search(r'ATK_IMPACT = (\[[^\]]*\])', tpl).group(1))                       # the impact frame of hit k (Gojo's and Verity's moves)
YU_IMP = json.loads(re.search(r'const YU_ATK = \{.*?imp: (\[\[.*?\]\]),', tpl).group(1))          # Yuji's impact frames per move ...
YU_HIT = json.loads(re.search(r'const YU_ATK = \{.*?hit: (\[\[.*?\]\]),', tpl).group(1))          # ... and the hit numbers they land
GOJO, YUJI, ART = json.load(open(P('side.json'))), json.load(open(P('yuji.json'))), json.load(open(P('story_art.json')))['vanim']
CATART = json.load(open(P('story_art.json')))['cat']                                                 # the Cartoon Cat's strips (tools/cat_rig.py)
FX = set('ghjk')                                                                                  # Gojo's glow letters: sparks, not limbs

def grid_rows(S, fi, skip=''):                                                                    # a letter-grid frame -> {row on the screen (feet at 62): how far in front of the anchor its farthest pixel is}
    a = S['cx'] - S['x0']; lf = S['lift'][fi] if S.get('lift') else 0; out = {}
    for r, row in enumerate(S['frames'][fi]):
        xs = [x for x, c in enumerate(row) if c != '.' and c not in skip]
        if xs: out[r - S['top'] - lf] = max(xs) - a
    return out
def strip(name): return Image.open(io.BytesIO(base64.b64decode(ART[name].split(',')[1]))).convert('RGBA')
def cat_strip(name): return Image.open(io.BytesIO(base64.b64decode(CATART[name].split(',')[1]))).convert('RGBA')
def cat_rows(im, fi, W, ax):                                                                      # a cell of the Cat's strips (W wide, his anchor on column ax): how far in front of the anchor the farthest pixel of every row is
    c = im.crop((fi * W, 0, fi * W + W, 64)).load(); out = {}
    for y in range(64):
        xs = [x for x in range(W) if c[x, y][3]]
        if xs: out[y] = max(xs) - ax
    return out
def img_rows(im, fi):                                                                             # a 64x64 cell of one of Verity's strips (his anchor is column 32)
    c = im.crop((fi * 64, 0, fi * 64 + 64, 64)).load(); out = {}
    for y in range(64):
        xs = [x for x in range(64) if c[x, y][3]]
        if xs: out[y] = max(xs) - 32
    return out
def widest(rows):                                                                                 # several frames -> the farthest each row ever gets
    out = {}
    for d in rows:
        for r, v in d.items(): out[r] = max(out.get(r, -999), v)
    return out

BODY = {'gojo': widest(grid_rows(GOJO['idle'], f, FX) for f in range(len(GOJO['idle']['frames']))),
        'yuji': widest(grid_rows(YUJI['idle'], f) for f in range(len(YUJI['idle']['frames']))),
        'verity': widest(img_rows(strip('idle'), f) for f in range(15)),
        'cat': widest(cat_rows(cat_strip('idle'), f, 64, 32) for f in range(15))}
MOVES = {'gojo': {k: (lambda f, S=GOJO['atk%d' % k]: grid_rows(S, f, FX), IMPACT[k], len(GOJO['atk%d' % k]['frames'])) for k in (0, 1, 2, 3, 6, 7, 14, 15, 16, 17, 18, 19, 20, 21)},
         'yuji': {hk: (lambda f, S=YUJI['atk%d' % j]: grid_rows(S, f), YU_IMP[j][i], 15) for j, hits in enumerate(YU_HIT) for i, hk in enumerate(hits)},
         'verity': {k: (lambda f, im=strip(n): img_rows(im, f), IMPACT[k], 15) for k, n in ((0, 'm0'), (1, 'm1'), (2, 'm2'), (3, 'm3'), (6, 'c0'), (7, 'c1'), (22, 'bite'))},
         'cat': {k: (lambda f, im=cat_strip(n), W=W, a=a: cat_rows(im, f, W, a), imp, 15) for k, n, W, a, imp in ((30, 'm0', 128, 36, 6), (31, 'm1', 128, 36, 7), (32, 'm0', 128, 36, 6), (33, 'm3', 128, 36, 8), (34, 'flatpunch', 64, 32, 6))}}      # (hits 30-34: the stretching grab, the punch, the grab again, the kick, the punch up from the floor)
out = {}
for att, moves in MOVES.items():
    out[att] = {}
    for k, (rows, imp, n) in sorted(moves.items()):
        tip = widest(rows(f) for f in range(imp, min(imp + 2, n)))                                # the limb: the impact frame and the one after it
        out[att][k] = {}
        for tgt, body in BODY.items():
            # contact = the attacker's farthest pixel in a row reaches the target's nearest pixel in the same row (the target is drawn mirrored, so its pixel columns count from the other side: +1)
            d = [tip[r] + body[r] + 1 for r in tip if r in body]
            out[att][k][tgt] = max(d)
out['yuji'][37] = out['yuji'][36]; out['yuji'][45] = out['yuji'][44]                                                              # DIVERGENT FIST's second impact (hit 37) has no limb: it is a delayed shock that lands if the first impact (36) reached, so the AI plans with the first one's reach
json.dump(out, open(P('hitboxes.json'), 'w'), separators=(',', ':'))
OLD = [17, 17, 15, 26, 0, 0, 16, 16, 0, 0, 0, 0, 0, 0, 19, 25, 19, 27, 25, 24, 18, 20, 26, 40, 17, 17, 17, 26, 27, 28]                    # the old fixed reach (the gap was REACH + 6)
print('body half-widths (front, widest row):', {t: max(b.values()) for t, b in BODY.items()})
for att, moves in out.items():
    for k, v in moves.items(): print('%-6s hit %2d  old %2d | gap now: vs gojo %2d  vs yuji %2d  vs verity %2d' % (att, k, OLD[k] + 6 if k < len(OLD) else 0, v['gojo'], v['yuji'], v['verity']))
