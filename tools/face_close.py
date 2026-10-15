#!/usr/bin/env python3
"""Gojo's face close-up, drawn by hand in code (custom pixel art, 320 x 128 per frame, transparent background: the map shows behind him). Seen like the anime shot of him taking his blindfold off: a side three-quarter view, the head tilted down, white-blue spiky hair, the black blindfold across his eyes and a high dark collar. A big hand comes in from the lower left, hooks the lower edge of the blindfold and pulls it down over his nose, mouth and chin to his neck; the head lifts and his eyes open (white lashes, a stern brow, deep blue irises that glow). 24 frames in one strip (the game plays them slower for the DOMAIN and faster for PURPLE and backwards when the blindfold goes back on; frame 0 is the picture with the blindfold on, no hand).
strips() -> {'pull': PNG data URL, 24 frames wide}.  Run on its own for a contact sheet:  python3 -B face_close.py <dir>"""
import base64, io, math, os, sys
import numpy as np
from PIL import Image, ImageDraw, ImageChops
W, H, N = 320, 128, 24
PIV = (170, 120)                                                                           # the head turns about the base of his neck
SK = [(255, 238, 222), (247, 218, 194), (226, 182, 162), (192, 146, 136), (146, 104, 100)]   # light, base, shade, deep, darkest
HAIR = [(255, 255, 255), (234, 242, 255), (198, 214, 247), (152, 172, 224), (104, 124, 186)]
LIP = [(214, 142, 132), (188, 112, 108), (124, 72, 76)]
BAND = [(78, 72, 102), (30, 27, 42), (12, 11, 19)]                                          # lit edge, base, dark
COLL = [(96, 84, 136), (56, 47, 82), (32, 26, 46), (16, 13, 25)]
SCL, SCS, LID = (246, 251, 255), (196, 216, 250), (42, 54, 108)
IRIS = [(160, 236, 255), (76, 168, 255), (34, 106, 232), (20, 64, 176)]
BAY = np.array([[0, 8, 2, 10], [12, 4, 14, 6], [3, 11, 1, 9], [15, 7, 13, 5]]) / 16.0
def url(im): b = io.BytesIO(); im.save(b, 'PNG', optimize=True); return 'data:image/png;base64,' + base64.b64encode(b.getvalue()).decode()
ease = lambda t: t * t * (3 - 2 * t)
lerp = lambda a, b, t: a + (b - a) * t
def seg(f, a, b): return max(0.0, min(1.0, (f - a) / (b - a)))
def R(pts): return [(round(x), round(y)) for x, y in pts]
def poly(d, pts, c, o=None): d.polygon(R(pts), fill=c, outline=o)
def pmask(pts): m = Image.new('L', (W, H), 0); ImageDraw.Draw(m).polygon(R(pts), fill=255); return m
def clip(im, mask, pts, col): im.paste(col, (0, 0, W, H), ImageChops.multiply(pmask(pts), mask))      # a shape painted only where the mask allows
def rod(d, pts, w, c, o=None):                                                             # a thick bent line with round ends (and an outline)
    w = max(1, int(round(w)))
    for ww, cc in (((w + 2, o),) if o else ()) + ((w, c),):
        d.line(R(pts), fill=cc, width=ww)
        for p in (pts[0], pts[-1]) + tuple(pts[1:-1]): d.ellipse([round(p[0] - ww / 2), round(p[1] - ww / 2), round(p[0] + ww / 2 - 1), round(p[1] + ww / 2 - 1)], fill=cc)
def rot(p, a):                                                                             # a point turned about the neck like the head is (a in degrees, counter-clockwise on the screen)
    r = math.radians(a); dx, dy = p[0] - PIV[0], p[1] - PIV[1]; return (PIV[0] + dx * math.cos(r) + dy * math.sin(r), PIV[1] - dx * math.sin(r) + dy * math.cos(r))
def eye(hl, cx, cy, w, h, op, sg, dx, ik=0.26):                                                     # one eye: almond, shaded white, a deep blue iris with a pupil and sparkles, a dark lid line, white lashes
    if op < 0.12:
        d = ImageDraw.Draw(hl); d.line(R([(cx - w / 2, cy + 1), (cx, cy + 2), (cx + w / 2, cy)]), fill=LID, width=2); return
    up = [(cx + (w / 2) * math.cos(t), cy - h * op * math.sin(t) ** 0.8 * (1 + 0.3 * sg * math.cos(t))) for t in np.linspace(math.pi, 0, 14)]
    lo = [(cx + (w / 2) * math.cos(t), cy + 0.62 * h * op * math.sin(t) ** 0.9) for t in np.linspace(0, math.pi, 14)]
    pts = up + lo; em = pmask(pts); d = ImageDraw.Draw(hl); poly(d, pts, SCL); clip(hl, em, [(cx - w, cy - h * 2), (cx + w, cy - h * 2), (cx + w, cy - h * 0.1 * op), (cx - w, cy - h * 0.1 * op)], SCS)
    ir = ik * w * min(1.0, op * 1.3); ix, iy = cx + dx, cy + 0.12 * h
    for r, c in ((ir, IRIS[3]), (ir - 1.0, IRIS[2]), (ir - 2.4, IRIS[1])):
        if r < 0.6: continue
        m = Image.new('L', (W, H), 0); ImageDraw.Draw(m).ellipse([round(ix - r), round(iy - r), round(ix + r), round(iy + r)], fill=255); hl.paste(c, (0, 0, W, H), ImageChops.multiply(m, em))
    m = Image.new('L', (W, H), 0); ImageDraw.Draw(m).ellipse([round(ix - ir * 0.7), round(iy + ir * 0.05), round(ix + ir * 0.7), round(iy + ir * 0.95)], fill=255); hl.paste(IRIS[0], (0, 0, W, H), ImageChops.multiply(m, em))      # (the lower half of the iris is lighter)
    m = Image.new('L', (W, H), 0); ImageDraw.Draw(m).ellipse([round(ix - 2.3), round(iy - 2.6), round(ix + 2.3), round(iy + 2.6)], fill=255); hl.paste((6, 16, 66), (0, 0, W, H), ImageChops.multiply(m, em))
    m = Image.new('L', (W, H), 0); ImageDraw.Draw(m).rectangle([round(ix - 3), round(iy - 3.5), round(ix - 2), round(iy - 2.5)], fill=255); ImageDraw.Draw(m).point([(round(ix + 3), round(iy + 2))], fill=255); hl.paste((255, 255, 255), (0, 0, W, H), ImageChops.multiply(m, em))
    d = ImageDraw.Draw(hl); d.line(R(up), fill=LID, width=3); d.line(R([(p[0], p[1] - 1) for p in up[2:-2]]), fill=(88, 104, 168), width=1); d.line(R(lo[4:-4]), fill=(170, 140, 140), width=1)
    for k in range(5): s0 = up[1 + k * 2]; d.line(R([s0, (s0[0] - sg * (3 + k), s0[1] - 4 - k)]), fill=(244, 249, 255), width=2 if k < 3 else 1)       # (white lashes at the outer corner)
def spike(d, cx, cy, ang, ln, w, cols):                                                    # one spike of hair: from its base (cx, cy) outwards at angle ang (degrees, 0 = right, 90 = down)
    a = math.radians(ang); tx, ty = cx + math.cos(a) * ln, cy + math.sin(a) * ln; nx, ny = -math.sin(a) * w, math.cos(a) * w
    poly(d, [(cx + nx, cy + ny), (cx - nx, cy - ny), (tx, ty)], cols[0]); poly(d, [(cx + nx, cy + ny), (cx + nx * 0.15, cy + ny * 0.15), (tx, ty)], cols[1]); poly(d, [(cx - nx, cy - ny), (cx - nx * 0.15, cy - ny * 0.15), (tx, ty)], cols[2])
def head(f, by, op):
    hl = Image.new('RGBA', (W, H), (0, 0, 0, 0)); d = ImageDraw.Draw(hl); fl = math.sin(f * 0.7)
    # ---- hair behind and above the head: a cap and a ring of spikes
    for k, ang in enumerate((176, 196, 214, 232, 250, 268, 286, 304, 322, 340, 356)):
        a = math.radians(ang); bx, by0 = 168 + math.cos(a) * 54, 44 + math.sin(a) * 34; spike(d, bx, by0, ang + 4 * math.sin(f * 0.5 + k), 30 + 12 * ((k * 5) % 3) + 3 * fl, 12 + (k % 3) * 2, (HAIR[2], HAIR[1], HAIR[3]))
    poly(d, [(112, 62), (110, 40), (126, 20), (152, 10), (184, 10), (208, 22), (220, 40), (216, 50), (128, 50)], HAIR[2]); poly(d, [(112, 62), (110, 40), (122, 26), (118, 56)], HAIR[3])
    d.ellipse([112, 58, 130, 86], fill=SK[2], outline=SK[4]); d.ellipse([116, 63, 126, 80], fill=SK[3]); d.line(R([(118, 66), (121, 74)]), fill=SK[4], width=1)                       # the ear
    # ---- the face (a side three-quarter view, turned to the right), shaded: light from the upper right; everything under the eyes is squeezed afterwards
    fc = Image.new('RGBA', (W, H), (0, 0, 0, 0)); dd = ImageDraw.Draw(fc)
    FACE = [(122, 38), (150, 30), (182, 32), (204, 44), (212, 58), (211, 68), (216, 84), (217, 91), (209, 95), (203, 95), (206, 102), (206, 108), (200, 116), (188, 122), (168, 126), (150, 122), (135, 110), (122, 92), (115, 72), (116, 52)]
    poly(dd, FACE, SK[1]); fm = pmask(FACE)
    clip(fc, fm, [(114, 52), (140, 66), (152, 100), (168, 128), (150, 124), (135, 110), (122, 92), (114, 72)], SK[2]); clip(fc, fm, [(114, 70), (130, 80), (150, 108), (150, 124), (135, 110), (122, 92)], SK[3])
    clip(fc, fm, [(150, 33), (192, 36), (210, 52), (186, 46), (150, 44)], SK[0]); clip(fc, fm, [(176, 112), (204, 108), (196, 126), (172, 128)], SK[2]); clip(fc, fm, [(188, 62), (203, 58), (205, 86), (190, 88)], SK[0])
    clip(fc, fm, [(114, 56), (160, 62), (168, 76), (150, 90), (134, 108), (122, 92), (114, 72)], SK[2]); clip(fc, fm, [(114, 60), (126, 66), (130, 100), (122, 92), (114, 72)], SK[3])          # (the near cheek is in shade: lit only from the right)
    clip(fc, fm, [(136, 68), (170, 68), (168, 76), (140, 78)], SK[2]); clip(fc, fm, [(184, 66), (206, 64), (206, 72), (186, 76)], SK[2]); clip(fc, fm, [(176, 78), (200, 80), (204, 92), (182, 92)], SK[0]); clip(fc, fm, [(172, 96), (206, 100), (204, 108), (176, 106)], SK[2])      # (under the eyes, a cheek bone catching the light, a shadow under the nose)
    dd.line(R([(150, 122), (168, 126), (188, 122), (200, 116)]), fill=SK[0], width=1); dd.line(R([(211, 68), (216, 84), (217, 91), (209, 95), (203, 95), (206, 102), (206, 108), (200, 116), (188, 122), (168, 126), (150, 122), (135, 110), (122, 92), (115, 72)]), fill=SK[4], width=1)     # (the rim light on the jaw, a thin dark outline round the face)
    poly(dd, [(206, 58), (210, 60), (216, 84), (210, 90), (208, 82)], SK[2]); dd.line(R([(204, 60), (210, 82)]), fill=SK[0], width=2); dd.ellipse([208, 82, 215, 88], fill=SK[0]); dd.ellipse([203, 89, 209, 93], fill=SK[4]); poly(dd, [(199, 94), (215, 91), (211, 98), (202, 98)], SK[3])        # the nose
    poly(dd, [(176, 103), (190, 100), (204, 101), (206, 104), (191, 105)], LIP[1]); poly(dd, [(178, 106), (192, 105), (205, 107), (200, 112), (187, 113), (180, 110)], LIP[0]); dd.line(R([(174, 105), (191, 106), (206, 104), (208, 101)]), fill=LIP[2], width=1); dd.line(R([(184, 115), (196, 115)]), fill=SK[3], width=1); dd.line(R([(186, 109), (196, 109)]), fill=(244, 178, 166), width=1)  # the lips, a small smirk
    top, bot = fc.crop((0, 0, W, 62)), fc.crop((0, 62, W, H)); fc2 = Image.new('RGBA', (W, H), (0, 0, 0, 0)); fc2.paste(top, (0, 0)); fc2.paste(bot.resize((W, round(bot.height * 0.76)), Image.NEAREST), (0, 62)); hl.alpha_composite(fc2)
    # ---- the eyes (the band covers them until it has gone past) and the white brows
    eye(hl, 152, 63, 34, 13.5, op, 1, 3); eye(hl, 197, 62, 22, 9.5, op, -1, 3, 0.21); d = ImageDraw.Draw(hl)
    if op > 0.4: d.line(R([(134, 52 + 4 * (1 - op)), (152, 47 + 4 * (1 - op)), (170, 51 + 4 * (1 - op))]), fill=SK[3], width=1); d.line(R([(188, 52), (198, 50), (208, 54)]), fill=SK[3], width=1)      # (the crease of the lids)
    for x0, y0, x1, y1 in ((132, 53, 174, 45), (188, 46, 208, 50)): poly(d, [(x0, y0 + 2), (x1, y1 - 3), (x1 + 3, y1), (x0 + 8, y0 + 6)], HAIR[1], HAIR[3])
    # ---- the blindfold: a black band that follows the head; across the eyes it is wide, at his neck it wraps round it
    s = ease(seg(by, 62, 108)); xl, xr, th = lerp(104, 130, s), lerp(210, 198, s), lerp(9, 7, s); sag = lerp(0, 4, s)
    top = [(xl, by - th + 5), (lerp(128, 138, s), by - th - 3 - sag), (160, by - th - 5 - sag), (188, by - th - 3), (xr, by - th + 3)]; bot = [(xr, by + th + 1), (188, by + th + 4), (160, by + th + 5), (lerp(128, 138, s), by + th + 3), (xl, by + th + 9)]
    poly(d, top + bot, BAND[1]); poly(d, top + [(x - 2, y + 3) for x, y in reversed(top)], BAND[0]); d.line(R(bot[1:4]), fill=BAND[2], width=2)
    poly(d, [(xl, by), (xl - 16, by + 8), (xl - 22, by + 24), (xl - 8, by + 14), (xl + 2, by + 6)], BAND[1], BAND[2]); poly(d, [(xl, by - 2), (xl - 14, by - 4), (xl - 20, by + 4), (xl - 6, by + 4)], BAND[1], BAND[2])        # the loose ends behind his head
    # ---- bangs fall over the top of the band, a thin lock in front of the ear
    for xb, tx, ty, w in ((136, 154, 58, 8), (150, 174, 52, 8), (164, 190, 58, 8), (178, 204, 54, 8), (122, 134, 60, 7), (192, 214, 58, 6)):
        ty += 1.3 * math.sin(f * 0.6 + xb); poly(d, [(xb - w, 26), (xb + w, 26), (tx, ty)], HAIR[1]); poly(d, [(xb - w, 26), (xb - w + 4, 26), (tx - 1, ty)], HAIR[0]); poly(d, [(xb + w - 4, 26), (xb + w, 26), (tx + 1, ty)], HAIR[2]); d.line(R([(xb, 28), (tx - 2, ty - 3)]), fill=HAIR[2], width=1)
    poly(d, [(121, 40), (128, 42), (130, 88), (125, 96), (121, 78)], HAIR[1]); d.line(R([(122, 44), (123, 80)]), fill=HAIR[0], width=1); d.line(R([(128, 46), (129, 86)]), fill=HAIR[3], width=1)
    return hl
def hand(im, ax, ay):                                                                      # the big hand in front (his left hand, seen from behind): its index fingertip is at (ax, ay)
    d = ImageDraw.Draw(im); o = SK[4]; k = 0.82; P = lambda x, y: (ax + x * k, ay + y * k)
    poly(d, [P(-150, 60), P(-112, 18), P(-84, 56), P(-110, 96), P(-160, 100)], COLL[1], COLL[3])                                                                                           # the sleeve
    poly(d, [P(-112, 22), P(-82, 4), P(-44, 10), P(-40, 58), P(-76, 74), P(-100, 60)], SK[1], o); poly(d, [P(-100, 26), P(-76, 10), P(-50, 16), P(-52, 36), P(-80, 40)], SK[0]); poly(d, [P(-100, 58), P(-76, 72), P(-42, 56), P(-44, 44), P(-76, 56)], SK[2])  # the back of the hand
    rod(d, [P(-66, 24), P(-40, -6), P(-20, -12)], 11 * k, SK[1], o)                                                                                                                         # the thumb
    for pts, w in (([P(-52, 52), P(-28, 44), P(-8, 40)], 8), ([P(-50, 40), P(-26, 31), P(-2, 26)], 9), ([P(-48, 26), P(-24, 16), P(2, 10)], 9), ([P(-46, 12), P(-22, 4), P(0, 0)], 10)):
        rod(d, pts, w * k, SK[1], o); d.line(R([(pts[0][0] + 3, pts[0][1] - 2), (pts[1][0], pts[1][1] - 3), (pts[2][0] - 2, pts[2][1] - 2)]), fill=SK[0], width=1); d.line(R([(pts[1][0], pts[1][1] + w * k // 2), (pts[2][0], pts[2][1] + w * k // 2 - 1)]), fill=SK[2], width=1)   # four fingers: a light and a shaded side
    for j in range(4): px, py = P(-46, 8 + j * 14); d.ellipse([px, py, px + 7 * k, py + 7 * k], fill=SK[0])                                                                                # knuckles
    px, py = P(0, 0); d.ellipse([px - 4 * k, py - 3 * k, px + 3 * k, py + 2 * k], fill=SK[0])                                                                                                # a nail
def frame(i):
    f = float(i); by = 62 + 44 * ease(seg(f, 8, 18)); op = ease(seg(f, 12, 19)); gl = ease(seg(f, 14, 21)) * (1.0 + 0.1 * math.sin(f * 0.9)); ang = -9 + 10 * ease(seg(f, 9, 21))
    im = Image.new('RGBA', (W, H), (0, 0, 0, 0)); d = ImageDraw.Draw(im)
    poly(d, [(146, 96), (192, 100), (204, 128), (134, 128)], SK[2]); poly(d, [(152, 98), (186, 102), (190, 128), (150, 128)], SK[3])                                           # the neck
    poly(d, [(86, 128), (106, 94), (146, 100), (160, 114), (156, 128)], COLL[1], COLL[3]); poly(d, [(86, 128), (106, 94), (114, 96), (98, 128)], COLL[0]); poly(d, [(206, 128), (212, 108), (246, 116), (252, 128)], COLL[2], COLL[3])   # the high collar
    head_im = head(f, by, op).rotate(ang, resample=Image.NEAREST, center=PIV); im.alpha_composite(head_im)
    # ---- the hand: in from the lower left, hooks the lower edge of the band, pulls it down, lets go and goes out again
    if f < 8: ax, ay = lerp(-20, 168, ease(seg(f, 0, 7))), lerp(150, 86, ease(seg(f, 0, 7)))
    elif f < 18: gx, gy_ = rot((172, by + 9), ang); ax, ay = gx, gy_
    else: gx, gy_ = rot((172, by + 9), ang); ax, ay = gx - 14 * (f - 17), gy_ + 9 * (f - 17)
    if f >= 1: hand(im, ax, ay)
    a = np.asarray(im).copy()
    for sg, ex, ey in ((1, 150, 64), (-1, 193, 63)):
        px, py = rot((ex, ey), ang); k = 0.75 * gl; yy, xx = np.mgrid[max(0, int(py - 24)):min(H, int(py + 24)), max(0, int(px - 30)):min(W, int(px + 30))]
        al = k * np.clip(1 - np.hypot((xx - px) / 1.2, yy - py) / 26, 0, 1) ** 1.5; m = (al > BAY[yy % 4, xx % 4]) & (a[yy, xx, 3] > 0); a[yy, xx][m] = (110, 190, 255, 255)           # a dithered glow, only on the picture itself
    return Image.fromarray(a, 'RGBA')
def strip():
    out = Image.new('RGBA', (W * N, H), (0, 0, 0, 0))
    for i in range(N): out.paste(frame(i), (i * W, 0))
    return out
def strips(): return {'pull': url(strip())}
if __name__ == '__main__':
    d = sys.argv[1] if len(sys.argv) > 1 else '.'; idx = (0, 5, 9, 12, 15, 18, 21, 23)
    sh = Image.new('RGB', (W * 4, H * 2), (70, 96, 70))
    for k, i in enumerate(idx): bg = Image.new('RGBA', (W, H), (70, 96, 70, 255)); bg.alpha_composite(frame(i)); sh.paste(bg.convert('RGB'), ((k % 4) * W, (k // 4) * H))
    sh.save(os.path.join(d, 'face_close.png'))
