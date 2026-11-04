#!/usr/bin/env python3
"""v1.128 GRAPHIC DAMAGE: the limb patches of a fighter's pictures.
For every picture of every strip the generator is run again with one limb (or both arms / both legs) left out; what changes is written as a patch (the pixels the limb covered and
what shows through instead), so the game can show the picture without that limb. Works on any generator that builds a dict of strips {key: {'x0', 'w', 'h', 'frames': [rows]}} and has an OMIT set.
python3 -B gore_export.py yuji   -> gore_yuji.json   {strip: {'an': [patch per frame], 'af': .., 'aa': .., 'lf': .., 'lb': .., 'll': ..}}   ('' = the limb is not seen in that picture)
The arm pair 'aa' and the leg pair 'll' are only what is still wrong after the first two patches (an then af, lf then lb) have been laid over the picture.
A patch is a string of runs: y (2 chars) x (2 chars, column of the strip) n (1 char) then n picture letters ('.' = clear, '=' = keep, '*' = keep but this pixel belongs to the limb); the 64-symbol alphabet is A-Z a-z 0-9 - _
"""
import json, os, sys
HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, HERE)
AB = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_'
SETS = {'an': {'an'}, 'af': {'af'}, 'aa': {'an', 'af'}, 'lf': {'lf'}, 'lb': {'lb'}, 'll': {'lf', 'lb'}}
def num(v): return AB[v >> 6] + AB[v & 63]
def rel(s, i, ref):      # picture i of strip s as {(x, y): letter}; x is counted from column 0 of the plain strip ref
    return {(s['x0'] - ref['x0'] + x, y): c for y, row in enumerate(s['frames'][i]) for x, c in enumerate(row) if c != '.'}
def patch(a, b, foot=()):      # the runs that turn the picture a ({(x, y): letter}) into the picture b; the pixels of foot (the limb) that do not change are written as '*' so the game knows the whole limb
    ch = {p: b.get(p, '.') for p in set(a) | set(b) if a.get(p, '.') != b.get(p, '.')}; ch.update({p: '*' for p in foot if p not in ch and p in a}); rows = {}
    for (x, y), c in ch.items(): rows.setdefault(y, {})[x] = c
    res = []
    for y in sorted(rows):
        xs = sorted(rows[y]); runs = [[xs[0]]]
        for x in xs[1:]:
            if x - runs[-1][-1] <= 3 and x - runs[-1][0] < 60: runs[-1].append(x)
            else: runs.append([x])
        for r in runs:
            x0, x1 = r[0], r[-1]; chars = ''.join(rows[y].get(x, '=') for x in range(x0, x1 + 1))
            if x0 < 0 or x1 >= 4096: raise SystemExit('column out of range')
            res.append(num(y) + num(x0) + AB[len(chars)] + chars)
    return ''.join(res)
def apply(pix, ps):      # (the game does the same) a patch string laid over the picture pix; returns a new picture
    out = dict(pix); i = 0
    while i < len(ps):
        y = AB.index(ps[i]) * 64 + AB.index(ps[i + 1]); x = AB.index(ps[i + 2]) * 64 + AB.index(ps[i + 3]); n = AB.index(ps[i + 4]); i += 5
        for j, c in enumerate(ps[i:i + n]):
            if c == '.': out.pop((x + j, y), None)
            elif c != '=' and c != '*': out[(x + j, y)] = c
        i += n
    return out
def export(build, setomit, name, setmark=None, setjoint=None, setswap=None, base_over=None, jml='1234'):
    setomit(set()); base = build(); strips = {k: v for k, v in base.items() if isinstance(v, dict) and 'frames' in v}
    again = build(); assert all(again[k]['frames'] == base[k]['frames'] for k in strips), 'the generator is not repeatable'
    if base_over:      # the pictures the game really has (the generator may draw them in another window of columns: every picture must be the same pixels)
        for k in list(strips):
            if k not in base_over: del strips[k]; continue
            for i in range(len(strips[k]['frames'])): assert rel(strips[k], i, base_over[k]) == rel(base_over[k], i, base_over[k]), ('the generator and the game disagree', k, i)
            strips[k] = base_over[k]
    var = {}
    for vk, om in SETS.items(): setomit(om); var[vk] = build(); print(vk, 'built', flush=True)
    if setswap:      # the surviving arm takes over a swing of the lost arm: the arms change roles, then the arm that now holds the old pose of the survivor is left out
        setswap(True)
        for vk, om in (('sa', {'af'}), ('sb', {'an'})): setomit(om); var[vk] = build(); print(vk, 'built', flush=True)
        setswap(False)
    setomit(set()); foot = {}
    if setmark:
        for tag in ('an', 'af', 'lf', 'lb'): setmark({tag}); foot[tag] = build(); print(tag, 'marked', flush=True)
        setmark(set())
    jm = None
    if setjoint: setjoint(True); jm = build(); setjoint(False); print('joints built', flush=True)
    G = {}; bad = 0; OFF = {}
    for k, s in strips.items():
        n = len(s['frames']); g = {vk: [] for vk in list(SETS) + (['sa', 'sb'] if setswap else [])}; cen = {tag: [] for tag in ('an', 'af', 'lf', 'lb')}
        for i in range(n):
            b = rel(s, i, s); V = {vk: {p: c for p, c in rel(var[vk][k], i, s).items() if 0 <= p[0] < s['w']} for vk in var}      # (a picture that reaches beyond the plain strip is cut to it)
            F = {tag: {p for p, c in rel(foot[tag][k], i, s).items() if c == '!'} for tag in foot}
            for tag in cen: q = F.get(tag); cen[tag].append((sum(p[0] for p in q) / len(q), sum(p[1] for p in q) / len(q)) if q and len(q) >= 6 else None)
            g['an'].append(patch(b, V['an'], F.get('an', ()))); g['af'].append(patch(b, V['af'], F.get('af', ()))); g['lf'].append(patch(b, V['lf'], F.get('lf', ()))); g['lb'].append(patch(b, V['lb'], F.get('lb', ())))
            ua = apply(apply(b, g['an'][-1]), g['af'][-1]); ul = apply(apply(b, g['lf'][-1]), g['lb'][-1])
            g['aa'].append(patch(ua, V['aa'])); g['ll'].append(patch(ul, V['ll']))
            if setswap: g['sa'].append(patch(b, V['sa'], F.get('af', ()))); g['sb'].append(patch(b, V['sb'], F.get('an', ())))
            for vk in ('an', 'af', 'lf', 'lb') + (('sa', 'sb') if setswap else ()): bad += apply(b, g[vk][-1]) != V[vk]
            bad += apply(ua, g['aa'][-1]) != V['aa']; bad += apply(ul, g['ll'][-1]) != V['ll']
        if jm:      # where the limbs join the body in every picture: the centre of the 3 x 3 marker blocks, -1 when the marker is lost
            J = {tag: [] for tag in ('an', 'af', 'lf', 'lb')}
            for i in range(n):
                r = rel(jm[k], i, s); pts = {}
                for (x, y), c in r.items():
                    if c in jml: pts.setdefault(c, []).append((x, y))
                for tag, ch in (('an', jml[0]), ('af', jml[1]), ('lf', jml[2]), ('lb', jml[3])):
                    q = pts.get(ch); J[tag] += [round(sum(a for a, _ in q) / len(q), 1), round(sum(b for _, b in q) / len(q), 1)] if q else [-1, -1]
            g['J'] = J
            OFF[k] = {tag: [(cen[tag][i][0] - J[tag][2 * i], cen[tag][i][1] - J[tag][2 * i + 1]) if cen[tag][i] and J[tag][2 * i] >= 0 else None for i in range(n)] for tag in cen}
        if any(p for v in g.values() if isinstance(v, list) for p in v): G[k] = g
    assert bad == 0, bad
    if OFF.get('idle'):      # which limbs a move swings: a limb whose footprint, measured from its joint, strays from where it rests in the idle pictures by more than 6 px (arms) / 8 px (legs: a kick); 4 digits an af lf lb
        ref = {}
        for tag in ('an', 'af', 'lf', 'lb'):
            q = [o for o in OFF['idle'][tag] if o]; ref[tag] = (sum(o[0] for o in q) / len(q), sum(o[1] for o in q) / len(q)) if q else None
        for k in G:
            u = ''
            for tag, th in (('an', 6), ('af', 6), ('lf', 8), ('lb', 8)):
                r = ref[tag]; u += '1' if r and any(o and ((o[0] - r[0]) ** 2 + (o[1] - r[1]) ** 2) ** .5 > th for o in OFF[k][tag]) else '0'
            G[k]['U'] = u
    json.dump(G, open(os.path.join(HERE, 'gore_%s.json' % name), 'w'), separators=(',', ':'))
    print(name, len(G), 'strips,', os.path.getsize(os.path.join(HERE, 'gore_%s.json' % name)), 'bytes, all patches re-apply exactly')
GM = {'omit': set(), 'mark': set(), 'joint': False, 'swap': False}
def gm_set(key, val):      # the generators that run as a script (side.py) read their switches from GORE_MODE
    GM[key] = val; os.environ['GORE_MODE'] = ';'.join(['omit=' + ','.join(sorted(GM['omit'])), 'mark=' + ','.join(sorted(GM['mark'])), 'foot=' + (sorted(GM['mark'])[0] if GM['mark'] else ''), 'joint=' + ('1' if GM['joint'] else '0'), 'swap=' + ('1' if GM['swap'] else '0')])
def gojo_build():
    import runpy, tempfile
    cwd = os.getcwd(); d = tempfile.mkdtemp(); os.chdir(d)
    try: g = runpy.run_path(os.path.join(HERE, 'side.py'))
    finally: os.chdir(cwd)
    return {k: v for k, v in g['out'].items() if isinstance(v, dict) and 'frames' in v and 'dl' not in v}
PALMAP = {}      # colour -> letter, shared by every picture of a rig that is drawn with PIL (Verity, the Cat)
LETTERS = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ56789-_@$%^&'
VM = {(1, 2, 3, 255): '#', (1, 2, 4, 255): '$', (1, 2, 5, 255): '%', (1, 2, 6, 255): '&'}      # the joint markers of the rigs
def im_rows(im, foot=False, markers=None):      # a RGBA picture as rows of letters ('!' for every pixel when only a limb's footprint is wanted)
    W, H = im.size; px = im.load(); rows = []
    for y in range(H):
        r = []
        for x in range(W):
            c = px[x, y]
            if c[3] < 128: r.append('.'); continue
            if markers and c in markers: r.append(markers[c]); continue
            if foot: r.append('!'); continue
            k = c[:3]
            if k not in PALMAP: PALMAP[k] = LETTERS[len(PALMAP)]
            r.append(PALMAP[k])
        rows.append(''.join(r))
    return rows
def rig_strip(frames, w):
    foot = bool(GM['mark']); return {'x0': 0, 'w': w, 'h': frames[0].size[1], 'frames': [im_rows(im, foot, VM if GM['joint'] else None) for im in frames]}
def verity_build():
    import importlib, verity_rig as V
    importlib.reload(V); out = {}
    for name, fn in V.A.items(): out[name] = rig_strip([V.render(fn(f)) for f in range(15)], 64)
    for k, fn in enumerate(V.RX): out['rx%d' % k] = rig_strip([V.cell(fn(f)) for f in range(15)], V.CW)
    return out
FL = 'abcdefghijklmnop'
def fred_rows(f, foot, joint):      # a 64 x 64 grid of palette numbers (-1 = nothing, 16 - 19 = the joint markers) as rows of letters
    out = []
    for y in range(64):
        r = []
        for x in range(64):
            v = int(f[y][x])
            r.append('.' if v < 0 else '!' if foot else '#$%&'[v - 16] if v >= 16 and joint else FL[v] if v < 16 else '.')
        out.append(''.join(r))
    return out
def freddy_build():
    import importlib, freddy_art as FA
    os.chdir(HERE); importlib.reload(FA); FA.upper(); foot = bool(GM['mark']); joint = GM['joint']
    FR = FA.idle_frames(); FW = FA.walk_frames(); FJ = FA.jump_frames()
    FC = [FA.crouch_frames(FA.CD_KEYS), FA.crouch_frames(FA.CJ_KEYS, 0.0, FA.jump_sway(6)), FA.crouch_frames(FA.JC_KEYS, FA.jump_sway(34), 0.0), FA.slash_frames(FA.SL1_KEYS, True), FA.slash_frames(FA.SL2_KEYS, False), FA.run_frames(), FA.crouch_walk_frames(), FA.crouch_rake_frames(), FA.block_walk_frames(), FA.crouch_block_frames()] + FA.hurt_frames() + [FA.ko_frames()] + FA.water_frames() + [FA.guard_break_frames(), FA.crouch_dash_frames(), FA.pierce_frames()]
    rows = [FR, FW] + [FJ[i:i + 15] for i in range(0, len(FJ), 15)] + FC; out = {}
    for r, fs in enumerate(rows): out['r%d' % r] = {'x0': 0, 'w': 64, 'h': 64, 'frames': [fred_rows(f, foot, joint) for f in fs]}
    return out
def freddy_base():      # the sheet the game has, as strips of letters
    import numpy as np
    from PIL import Image
    import freddy_art as FA
    A = np.asarray(Image.open(os.path.join(HERE, 'freddy_sheet.png')).convert('RGBA')); look = {tuple(int(v) for v in FA.P[i]): FL[i] for i in range(16)}; out = {}
    for r in range(A.shape[0] // 64):
        frames = []
        for c in range(15):
            cell = A[r * 64:(r + 1) * 64, c * 64:(c + 1) * 64]; frames.append([''.join('.' if cell[y, x, 3] == 0 else look[tuple(int(v) for v in cell[y, x, :3])] for x in range(64)) for y in range(64)])
        if any(any(ch != '.' for row in fr for ch in row) for fr in frames): out['r%d' % r] = {'x0': 0, 'w': 64, 'h': 64, 'frames': [fr for fr in frames if any(ch != '.' for row in fr for ch in row)]}
    return out
def cat_build():
    import importlib, cat_rig as C
    importlib.reload(C); out = {}
    for n in C.NAMES:
        im = C.strip(n); w = im.size[0] // 15
        out[n] = rig_strip([im.crop((i * w, 0, (i + 1) * w, im.size[1])) for i in range(15)], w)
    return out
def png_strips(urls, names):      # the strips of a data-URL sheet (15 cells wide) as rows of letters, in the shared palette
    import base64, io
    from PIL import Image
    out = {}
    for name in names:
        if name not in urls: continue
        im = Image.open(io.BytesIO(base64.b64decode(urls[name].split(',')[1]))).convert('RGBA'); w = im.size[0] // 15
        out[name] = {'x0': 0, 'w': w, 'h': im.size[1], 'frames': [im_rows(im.crop((i * w, 0, (i + 1) * w, im.size[1]))) for i in range(15)]}
    return out
JSN = ['frames', 'walk', 'jump', 'cr', 'ci', 'cwk', 'a0', 'a1', 'a2', 'dg', 'a3', 'cp0', 'cp1', 'sl', 'sx', 'cut', 'storm', 'ccut', 'dis', 'el', 'tc', 'lift', 'dive', 'fl', 'sg']      # (the names tools/sukuna.js gives the rows of the strip, in the order of sukuna_art.ROWS)
def sukuna_build():
    """Sukuna's rows as strips of 64 x 64 pictures (letters on the picture's own canvas): the generator is read again, so whatever yuji_art.OMIT / MARK / JMARK / SWAP say is in it"""
    import importlib, yuji_art as ya, sukuna_art as S
    importlib.reload(S); S.Y = ya.build(); H = S.head(); out = {}
    for name in S.ROWS:
        frames = []
        for i in range(15):
            grid, _ = S.picture(name, i, H); cv = [['.'] * 64 for _ in range(64)]
            for r in range(64):
                for c in range(S.WID):
                    ch = grid[r][c] if c < len(grid[r]) else '.'
                    if ch != '.' and 0 <= c + S.GX < 64 and 0 <= r + S.GY < 64: cv[r + S.GY][c + S.GX] = ch
            frames.append([''.join(r) for r in cv])
        out[JSN[S.ROWS.index(name)]] = {'x0': 0, 'w': 64, 'h': 64, 'frames': frames}
    return out
if __name__ == '__main__':
    who = sys.argv[1] if len(sys.argv) > 1 else 'yuji'
    if who == 'sukuna':
        import yuji_art as Y, sukuna_art as S
        def so(s): Y.OMIT.clear(); Y.OMIT.update(s)
        def sm(s): Y.MARK.clear(); Y.MARK.update(s)
        def sj(v): Y.JMARK = v
        def sw(v): Y.SWAP = v
        export(sukuna_build, so, 'sukuna', sm, sj, sw)
        G = json.load(open(os.path.join(HERE, 'gore_sukuna.json'))); G['_pal'] = S.PAL; json.dump(G, open(os.path.join(HERE, 'gore_sukuna.json'), 'w'), separators=(',', ':')); print('palette added')
    elif who == 'freddy':
        import freddy_art as FA
        gm_set('omit', set()); export(freddy_build, lambda s: gm_set('omit', set(s)), 'freddy', lambda s: gm_set('mark', set(s)), lambda v: gm_set('joint', bool(v)), None, freddy_base(), '#$%&')
        G = json.load(open(os.path.join(HERE, 'gore_freddy.json'))); G['_pal'] = {FL[i]: FA.PAL[i] for i in range(16)}; json.dump(G, open(os.path.join(HERE, 'gore_freddy.json'), 'w'), separators=(',', ':')); print('palette added')
    elif who == 'cat':
        import cat_rig as C
        sa = json.load(open(os.path.join(HERE, 'story_art.json')))['cat']; base_over = png_strips(sa, list(C.NAMES))
        gm_set('omit', set()); export(cat_build, lambda s: gm_set('omit', set(s)), 'cat', lambda s: gm_set('mark', set(s)), lambda v: gm_set('joint', bool(v)), lambda v: gm_set('swap', bool(v)), base_over, '#$%&')
        G = json.load(open(os.path.join(HERE, 'gore_cat.json'))); G['_pal'] = {l: '#%02x%02x%02x' % k for k, l in PALMAP.items()}; json.dump(G, open(os.path.join(HERE, 'gore_cat.json'), 'w'), separators=(',', ':')); print('palette added', len(PALMAP))
    elif who == 'verity':
        import verity_rig as V
        sa = json.load(open(os.path.join(HERE, 'story_art.json')))['vanim']; base_over = png_strips(sa, list(V.A) + ['rx%d' % k for k in range(10)])
        gm_set('omit', set()); export(verity_build, lambda s: gm_set('omit', set(s)), 'verity', lambda s: gm_set('mark', set(s)), lambda v: gm_set('joint', bool(v)), lambda v: gm_set('swap', bool(v)), base_over, '#$%&')
        G = json.load(open(os.path.join(HERE, 'gore_verity.json'))); G['_pal'] = {l: '#%02x%02x%02x' % k for k, l in PALMAP.items()}; json.dump(G, open(os.path.join(HERE, 'gore_verity.json'), 'w'), separators=(',', ':')); print('palette added', len(PALMAP))
    elif who == 'gojo':
        gm_set('omit', set()); base_over = {k: v for k, v in json.load(open(os.path.join(HERE, 'side.json'))).items() if isinstance(v, dict) and 'frames' in v}
        export(gojo_build, lambda s: gm_set('omit', set(s)), 'gojo', lambda s: gm_set('mark', set(s)), lambda v: gm_set('joint', bool(v)), lambda v: gm_set('swap', bool(v)), base_over)
    elif who == 'yuji':
        import yuji_art as Y
        def so(s): Y.OMIT.clear(); Y.OMIT.update(s)
        def sm(s): Y.MARK.clear(); Y.MARK.update(s)
        def sj(v): Y.JMARK = v
        def sw(v): Y.SWAP = v
        export(Y.build, so, 'yuji', sm, sj, sw)
