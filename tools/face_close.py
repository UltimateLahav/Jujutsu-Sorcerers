#!/usr/bin/env python3
"""Gojo's face close-up, drawn by hand in code (custom pixel art, 320 x 128 per frame, the size of the game's picture): white spiky hair, a black blindfold across his eyes, a high dark collar. A hand reaches in from the right, hooks the blindfold and pulls it down to his neck; his eyes open and glow blue. 24 frames in one strip (the game plays them slower for the DOMAIN and faster for PURPLE, and backwards when the blindfold goes back on; frame 0 is the picture with the blindfold on).
strips() -> {'pull': PNG data URL, 24 frames wide}.  Run on its own for a contact sheet:  python3 -B face_close.py <dir>"""
import base64, io, math, os, sys
import numpy as np
from PIL import Image, ImageDraw
W, H, N = 320, 128, 24
SKIN = [(251, 230, 207), (241, 210, 180), (217, 174, 140), (170, 120, 98)]                 # light, base, shade, deep
HAIR = [(252, 253, 255), (228, 234, 249), (178, 192, 228), (112, 128, 180)]
BAND = [(64, 62, 86), (26, 23, 36), (11, 10, 17)]                                          # lit edge, base, dark
COLL = [(78, 64, 108), (46, 37, 62), (26, 21, 34), (14, 11, 19)]
LIP, EW, EI = (196, 108, 104), (246, 252, 255), [(150, 226, 255), (64, 150, 255), (22, 84, 204)]
BAY = np.array([[0, 8, 2, 10], [12, 4, 14, 6], [3, 11, 1, 9], [15, 7, 13, 5]]) / 16.0       # an ordered dither: the glows are made of whole pixels
def url(im): b = io.BytesIO(); im.save(b, 'PNG', optimize=True); return 'data:image/png;base64,' + base64.b64encode(b.getvalue()).decode()
ease = lambda t: t * t * (3 - 2 * t)
lerp = lambda a, b, t: a + (b - a) * t
def seg(f, a, b): return max(0.0, min(1.0, (f - a) / (b - a)))
def poly(d, pts, c, o=None): d.polygon([(round(x), round(y)) for x, y in pts], fill=c, outline=o)
def rod(d, a, b, w, c):                                                                    # a thick line with round ends
    d.line([(round(a[0]), round(a[1])), (round(b[0]), round(b[1]))], fill=c, width=w)
    for p in (a, b): d.ellipse([round(p[0] - w / 2), round(p[1] - w / 2), round(p[0] + w / 2 - 1), round(p[1] + w / 2 - 1)], fill=c)
def glow(a, cx, cy, r, col, k):                                                            # a dithered halo (a is the picture as an array)
    if k <= 0: return
    y0, y1, x0, x1 = max(0, int(cy - r)), min(H, int(cy + r) + 1), max(0, int(cx - r)), min(W, int(cx + r) + 1)
    yy, xx = np.mgrid[y0:y1, x0:x1]; al = k * np.clip(1 - np.hypot(xx - cx, yy - cy) / r, 0, 1) ** 1.4
    m = al > BAY[yy % 4, xx % 4]; a[y0:y1, x0:x1][m] = col + (255,)
def eye(d, cx, cy, op, sg):                                                                # one eye: the almond, the iris with a pupil and a highlight, white lashes on the lid
    hw, hh = 12, 6.2 * op
    top = [(cx + sg * (-hw + 2 * hw * k / 10), cy - hh * math.sin(math.pi * k / 10) ** 0.8 - 0.8 * sg * (k - 5) / 5) for k in range(11)]
    bot = [(cx + sg * (hw - 2 * hw * k / 10), cy + hh * 0.85 * math.sin(math.pi * k / 10) ** 0.9) for k in range(11)]
    if op < 0.15: d.line([(round(x), round(y)) for x, y in top], fill=(30, 40, 80), width=1); return
    poly(d, top + bot, EW)
    ir = 5.2 * min(1.0, op * 1.2)
    for r, c in ((ir, EI[2]), (ir - 1.2, EI[1]), (ir - 2.6, EI[0])): d.ellipse([round(cx + sg * 1 - r), round(cy - r * 0.95), round(cx + sg * 1 + r), round(cy + r * 0.95)], fill=c)
    d.ellipse([round(cx + sg - 1.4), round(cy - 1.6), round(cx + sg + 1.4), round(cy + 1.6)], fill=(8, 22, 70)); d.rectangle([round(cx + sg - 3), round(cy - 3), round(cx + sg - 2), round(cy - 2)], fill=(255, 255, 255))
    d.line([(round(x), round(y - 1)) for x, y in top], fill=(236, 244, 255), width=2)         # (thick white lashes, like his hair)
    for k in range(3): d.line([(round(cx + sg * (hw - 1 - 3 * k)), round(cy - hh * 0.5 - 1)), (round(cx + sg * (hw + 3 - 2 * k)), round(cy - hh - 3 - k))], fill=(236, 244, 255), width=1)
def frame(i):
    f = float(i); band_y = 62 + 44 * ease(seg(f, 8, 17)); op = ease(seg(f, 14, 19)); gl = ease(seg(f, 14, 21)) * (1.0 + 0.1 * math.sin(f * 0.9)); fl = math.sin(f * 0.7)
    a = np.zeros((H, W, 4), np.uint8); a[..., 3] = 255
    for y in range(H): a[y, :, :3] = (lerp(6, 14, y / H), lerp(8, 24, y / H), lerp(26, 58, y / H))
    glow(a, CX := 160, 58, 120, (20, 52, 130), 0.5 + 0.5 * gl)                              # the dark blue room behind him, brighter when his eyes open
    im = Image.fromarray(a, 'RGBA'); d = ImageDraw.Draw(im)
    # ---- neck, collar
    poly(d, [(138, 98), (182, 98), (188, 128), (132, 128)], SKIN[2]); poly(d, [(142, 98), (178, 98), (181, 128), (139, 128)], SKIN[1]); poly(d, [(138, 98), (182, 98), (180, 108), (140, 108)], SKIN[3])
    for sg in (-1, 1):
        pts = [(CX + sg * 100, 128), (CX + sg * 62, 100), (CX + sg * 22, 100), (CX + sg * 12, 128)]; poly(d, pts, COLL[1], COLL[3]); poly(d, [(CX + sg * 100, 128), (CX + sg * 62, 100), (CX + sg * 56, 102), (CX + sg * 92, 128)], COLL[0]); poly(d, [(CX + sg * 26, 104), (CX + sg * 22, 100), (CX + sg * 12, 128), (CX + sg * 20, 128)], COLL[3])
    # ---- hair behind the head, ears
    back = [(100, 76), (92, 52), (98, 34), (86, 16), (106, 20), (104, 0), (124, 10), (130, -6), (146, 6), (156, -10), (168, 6), (184, -6), (190, 10), (208, 0), (214, 20), (234, 16), (222, 34), (228, 52), (220, 76), (200, 40), (120, 40)]
    poly(d, [(x + (1.5 * fl if y < 14 else 0), y) for x, y in back], HAIR[1]); poly(d, [(110, 70), (100, 50), (120, 40), (122, 72)], HAIR[2]); poly(d, [(210, 70), (220, 50), (200, 40), (198, 72)], HAIR[2])
    for sg in (-1, 1): d.ellipse([CX + sg * 47 - 5, 56, CX + sg * 47 + 5, 74], fill=SKIN[2], outline=SKIN[3])
    # ---- the face
    face = [(121, 34), (199, 34), (205, 56), (202, 78), (190, 98), (172, 110), (160, 113), (148, 110), (130, 98), (118, 78), (115, 56)]
    poly(d, face, SKIN[1]); poly(d, [(160, 36), (199, 34), (205, 56), (202, 78), (190, 98), (172, 110), (160, 113), (170, 90), (176, 60)], SKIN[2]); poly(d, [(121, 34), (140, 36), (136, 80), (130, 98), (118, 78), (115, 56)], SKIN[0])
    poly(d, [(132, 98), (148, 110), (160, 113), (172, 110), (188, 98), (172, 104), (160, 106), (148, 104)], SKIN[2])
    poly(d, [(158, 66), (163, 66), (166, 80), (162, 83), (156, 82), (155, 78)], SKIN[0]); poly(d, [(163, 68), (166, 80), (162, 83), (164, 76)], SKIN[2]); d.ellipse([154, 80, 166, 85], fill=SKIN[2])     # the nose
    d.line([(148, 93), (156, 95), (166, 95), (174, 91)], fill=SKIN[3], width=1); d.line([(150, 94), (156, 96), (166, 96), (172, 93)], fill=LIP, width=1); d.line([(174, 91), (176, 89)], fill=SKIN[3], width=1)   # a small smirk
    # ---- the glow of his eyes lights the face (it goes on before the eyes, so they stay clear), then the eyes (under the blindfold until it has gone past)
    a = np.asarray(im).copy()
    for sg in (-1, 1): glow(a, CX + sg * 20, 62, 26, (40, 110, 230), 0.4 * gl); glow(a, CX + sg * 20, 62, 13, (120, 200, 255), 0.5 * gl)
    im = Image.fromarray(a, 'RGBA'); d = ImageDraw.Draw(im)
    for sg in (-1, 1): eye(d, CX + sg * 20, 62, op, sg)
    # ---- the blindfold: a black band; across the face it is wide, at the neck it wraps round it
    wd = lerp(98, 60, ease(seg(band_y, 62, 106))); y0, y1 = band_y - 9, band_y + 9
    poly(d, [(CX - wd / 2, y0 + 2), (CX, y0), (CX + wd / 2, y0 + 2), (CX + wd / 2 + 2, band_y), (CX + wd / 2, y1 - 1), (CX, y1 + 1), (CX - wd / 2, y1 - 1), (CX - wd / 2 - 2, band_y)], BAND[1], BAND[2])
    d.line([(round(CX - wd / 2 + 4), round(y0 + 2)), (round(CX), round(y0 + 1)), (round(CX + wd / 2 - 4), round(y0 + 2))], fill=BAND[0], width=1); d.line([(round(CX - wd / 2 + 4), round(y1 - 3)), (round(CX + wd / 2 - 4), round(y1 - 3))], fill=BAND[2], width=2)
    # ---- the bangs fall over the top edge of the blindfold, side locks along the cheeks
    for xb, w, tx, ty in ((122, 8, 120, 56), (134, 8, 138, 50), (146, 8, 146, 58), (160, 9, 164, 46), (172, 8, 170, 56), (184, 8, 188, 50), (196, 8, 198, 58)):
        ty += 1.2 * math.sin(f * 0.6 + xb); poly(d, [(xb - w, 26), (xb + w, 26), (tx, ty)], HAIR[1]); poly(d, [(xb - w, 26), (xb - w + 3, 26), (tx - 1, ty)], HAIR[0]); poly(d, [(xb + w - 3, 26), (xb + w, 26), (tx + 1, ty)], HAIR[2])
    for sg in (-1, 1): xs = CX + sg * 42; poly(d, [(xs - 4, 38), (xs + 4, 38), (xs + sg * 3, 86), (xs - sg * 4, 100)], HAIR[1]); poly(d, [(xs + (1 if sg > 0 else -4), 40), (xs + (4 if sg > 0 else -1), 40), (xs + sg * 3, 86)], HAIR[2])
    # ---- the hand: comes in from the right, hooks the top edge of the band, pulls it down, lets go and goes out again
    hx = lerp(330, 198, ease(seg(f, 0, 4))) if f < 8 else 198 - 2 * seg(f, 8, 17); hy = lerp(30, 52 - 9 + 0, ease(seg(f, 2, 8))) if f < 8 else band_y - 9
    if f >= 17: hx += 16 * (f - 17); hy -= 12 * (f - 17)
    if hx < 340:
        poly(d, [(hx + 36, hy - 12), (hx + 74, hy - 40), (hx + 86, hy - 26), (hx + 44, hy + 14)], SKIN[1], SKIN[3]); poly(d, [(hx + 70, hy - 44), (hx + 96, hy - 28), (hx + 88, hy - 10), (hx + 62, hy - 26)], COLL[1], COLL[3])         # the wrist and the cuff
        d.ellipse([round(hx + 14), round(hy - 12), round(hx + 46), round(hy + 14)], fill=SKIN[1], outline=SKIN[3]); d.ellipse([round(hx + 20), round(hy - 9), round(hx + 40), round(hy + 3)], fill=SKIN[0])
        for dy, ln in ((-7, 24), (-1, 26)): rod(d, (hx + 22, hy + dy), (hx + 1, hy + dy + 2), 6, SKIN[1]); d.line([(round(hx + 20), round(hy + dy - 3)), (round(hx + 4), round(hy + dy - 1))], fill=SKIN[0], width=1)        # index and middle finger on top of the edge
        rod(d, (hx + 20, hy + 9), (hx + 3, hy + 5), 6, SKIN[2]); d.line([(round(hx + 4), round(hy + 8)), (round(hx + 19), round(hy + 12))], fill=SKIN[3], width=1)                                                          # the thumb under it
    # ---- rays of light round his eyes
    a = np.asarray(im).copy()
    if gl > 0.3:
        for sg in (-1, 1):                                                                 # short rays
            for k in range(6): ang = math.radians(200 + k * 28 if sg < 0 else -20 + k * 28); r0, r1 = 14, 14 + 10 * gl; ex, ey = CX + sg * 20, 62; [a.__setitem__((int(ey + math.sin(ang) * r) , int(ex + math.cos(ang) * r)), (200, 235, 255, 255)) for r in range(r0, int(r1)) if 0 <= int(ey + math.sin(ang) * r) < H and 0 <= int(ex + math.cos(ang) * r) < W]
    return Image.fromarray(a, 'RGBA')
def strip():
    out = Image.new('RGBA', (W * N, H), (0, 0, 0, 255))
    for i in range(N): out.paste(frame(i), (i * W, 0))
    return out
def strips(): return {'pull': url(strip())}
if __name__ == '__main__':
    d = sys.argv[1] if len(sys.argv) > 1 else '.'; idx = (0, 4, 8, 11, 14, 17, 20, 23)
    sh = Image.new('RGB', (W * 4, H * 2))
    for k, i in enumerate(idx): sh.paste(frame(i).convert('RGB'), ((k % 4) * W, (k // 4) * H))
    sh.save(os.path.join(d, 'face_close.png'))
