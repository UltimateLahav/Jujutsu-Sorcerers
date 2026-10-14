#!/usr/bin/env python3
"""The Cartoon Cat's face close-up for his FATALITY (the HUGE Cat that bites the ground): a front view, 128 x 128 per frame, 15 frames, anchored on column 64. The grin opens wider and wider until the mouth is a gaping maw lined with TEN ROWS OF TEETH (five rows hang from the top jaw and five rise from the bottom jaw, the outer row biggest, each row further in smaller and darker); once it is fully open the rows slide against each other like grinding jaws. Drawn with the Cat's own machinery (tools/cat_rig.py: masks at 4x, five tones, a dark outline).
strips() -> {'maw': PNG data URL, 15 frames wide}.  Run on its own to write a contact sheet:  python3 -B cat_maw.py <dir>"""
import math, os, sys
import numpy as np
from PIL import Image
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from cat_rig import Cv, shade, rbox, url, BODY, GLOVE, OL, EYE, NOSE
N, W, H, AX = 15, 128, 128, 64
GUMT = [(232, 120, 136), (216, 98, 114), (196, 74, 92), (158, 54, 72), (118, 38, 54)]
MOUTHT = [(84, 14, 30), (72, 12, 26), (60, 10, 22), (46, 8, 18), (34, 5, 14)]
CY = 82.0                                                                         # the middle of the mouth
OPEN = [0.0, 0.08, 0.2, 0.34, 0.48, 0.6, 0.72, 0.82, 0.9, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0]          # how far the mouth is open on each frame (0 = the grin, 1 = the maw)
def clamp(v, a=0.0, b=1.0): return max(a, min(b, v))
def teeth_tones(depth):                                                           # rings further in are darker (depth 0 = the outer ring, 9 = the innermost)
    k = 1.0 - 0.075 * depth; return [tuple(int(c * k) for c in t) for t in GLOVE[:4]] + [tuple(int(c * k * 0.8) for c in GLOVE[4])]
def frame(i):
    f = float(i); o = OPEN[i]; spin = max(0.0, f - 9.0)                           # (from frame 9 on the rings turn)
    rx, ry = 25.0 + 19.0 * o, 3.0 + 36.0 * o
    layers = []
    def mk(fn): c = Cv(W, H, AX); fn(c); return c.mask()
    def layer(fn, tones): layers.append((mk(fn), tones))
    ear = [(-50.0, 36.0), (-53.0, 0.0), (-16.0, 24.0)]
    layer(lambda c: (c.poly(rbox(0.0, 70.0, 108.0, 112.0, 24.0)), [c.poly([(sg * x, y) for x, y in ear]) for sg in (-1, 1)]), BODY)           # the head and the two ears
    cr = min(16.0 + 8.0 * o, ry)                                                                                                            # (the mouth is a wide rounded box, so every row of teeth is nearly as long as the mouth is wide)
    layer(lambda c: c.poly(rbox(0.0, CY, 2 * (rx + 3.0), 2 * (ry + 3.0), cr + 3.0)), GUMT)                                                  # the lips
    layer(lambda c: c.poly(rbox(0.0, CY, 2 * rx, 2 * ry, cr)), MOUTHT)                                                                      # the inside of the mouth
    if o > 0.5: layer(lambda c: c.ell(0.0, CY + 0.52 * ry, 0.36 * rx, 0.2 * ry), GUMT)                                                       # the tongue
    groups = [None, None, None]                                                                                                             # ten rows of teeth: five hang from the top jaw, five rise from the bottom jaw (the deeper the row, the smaller and darker)
    sp = 0.16 * ry
    for r in range(5):
        vis = clamp((o - 0.12 * r - 0.22) / 0.12)                                                                                          # row r shows up as the mouth opens (first the mouth opens, then the rows appear one after the other)
        if vis <= 0: continue
        h, w = (6.6 - 0.7 * r) * vis, 8.4 - 0.8 * r; g = min(2, r // 2)
        for sgn in (-1, 1):
            yb = CY + sgn * (ry - 1.5 - r * sp); dy = abs(yb - CY); edge = ry - cr; half = (rx if dy <= edge else rx - cr + math.sqrt(max(0.0, cr * cr - (dy - edge) ** 2))) - 2.6 - 0.5 * r
            if half < 3: continue
            m = mk(lambda c: [c.poly([(x - w * 0.46, yb), (x + w * 0.46, yb), (x, yb - sgn * h)]) for x in [(k - int(half / w)) * w + ((0.5 if r % 2 else 0.0) * w) + (-1 if r % 2 else 1) * spin * 0.9 for k in range(2 * int(half / w) + 2)] if abs(x) <= half])
            groups[g] = m if groups[g] is None else (groups[g] | m)
    if o < 0.5:                                                                                                                              # the ordinary grin: a small row of teeth on each lip, which the big rows replace
        k = clamp(1.0 - o / 0.45); hh, ww = 2.4 * k, 3.6
        if hh > 0.4:
            m = mk(lambda c: [c.poly([(x - ww * 0.46, CY + sg * (ry - 0.6)), (x + ww * 0.46, CY + sg * (ry - 0.6)), (x, CY + sg * (ry - 0.6) - sg * hh)]) for sg in (-1, 1) for x in [q * ww - rx + 5.0 for q in range(int((2 * rx - 10.0) / ww) + 1)]])
            groups[0] = m if groups[0] is None else (groups[0] | m)
    for depth, m in zip((0, 3, 7), groups):
        if m is not None: layers.append((m, teeth_tones(depth)))
    if o < 0.5:                                                                                                                              # the eyes: two white arcs (a happy grin); with the mouth wide open they turn into angry slashes
        for sg in (-1, 1): layer(lambda c, sg=sg: c.line([(sg * (23 + 12 * math.cos(a)), 30.0 + 9.0 * (math.sin(a) + 0.2) - 6.0) for a in np.linspace(math.pi * 1.1, math.pi * 1.9, 9)], 4.6), GLOVE)
    else:
        for sg in (-1, 1): layer(lambda c, sg=sg: c.line([(sg * 36.0, 20.0), (sg * 12.0, 35.0)], 5.0), GLOVE)
    layer(lambda c: c.poly([(-2.6, 42.0), (2.6, 42.0), (0.0, 46.0)]), [NOSE] * 5)
    out = np.zeros((H, W, 4), np.uint8)
    for m, tones in layers:
        sh = shade(m, tones); out[m] = sh[m]
    a = out[..., 3] > 0; edge = np.zeros_like(a)
    edge[1:, :] |= a[:-1, :]; edge[:-1, :] |= a[1:, :]; edge[:, 1:] |= a[:, :-1]; edge[:, :-1] |= a[:, 1:]
    out[edge & ~a] = OL
    return Image.fromarray(out, 'RGBA')
def strip():
    out = Image.new('RGBA', (W * N, H), (0, 0, 0, 0))
    for i in range(N): out.paste(frame(i), (i * W, 0))
    return out
INFO = {'w': W, 'h': H, 'cx': AX, 'x0': 0, 'top': 0}
def strips(): return {'maw': url(strip())}
if __name__ == '__main__':
    d = sys.argv[1] if len(sys.argv) > 1 else '.'; s = strip(); bg = Image.new('RGBA', s.size, (34, 22, 36, 255)); bg.alpha_composite(s)
    bg.convert('RGB').save(os.path.join(d, 'cat_maw.png'))
    big = Image.new("RGBA", (W * 4 * 2, H * 2), (34, 22, 36, 255))
    for k, fr in enumerate((0, 4, 9, 12)):
        t = frame(fr).resize((W * 2, H * 2), Image.NEAREST); big.alpha_composite(t, (k * W * 2, 0))
    big.convert('RGB').save(os.path.join(d, 'cat_maw_big.png'))
