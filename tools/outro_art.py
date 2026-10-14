#!/usr/bin/env python3
"""Chapter 1 ending art (the report to the higher-ups): the higher-ups' room (your picture room_src.png converted to the game's pixel style: the swordsman in the middle is painted out, Gojo is drawn in by the game; the two higher-ups at the bottom are drawn bigger so they can be seen), the corridor with the BIG door, and the two door leaves.
build() -> {'room': PNG data URL (320x128), 'hall': (400x300, the opening of the door is transparent), 'doorL' / 'doorR': (64x214)}; story_art.py puts them into story_art.json as art['outro'].
Run on its own to write a contact sheet:  python3 -B outro_art.py <dir>"""
import base64, io, math, os, sys
import numpy as np
from PIL import Image, ImageDraw
HERE = os.path.dirname(os.path.abspath(__file__))
def url(im): b = io.BytesIO(); im.save(b, 'PNG', optimize=True); return 'data:image/png;base64,' + base64.b64encode(b.getvalue()).decode()

# ---------------------------------------------------------------- the higher-ups' room
def inpaint(a, mask, iters=1500):                                             # a: float image (h, w, 3); mask: bool (h, w). Fill the masked pixels by diffusion from the pixels around them (the floor there is a smooth glow); only the box around the mask is worked on
    ys, xs = np.where(mask); y0, y1, x0, x1 = max(1, ys.min() - 3), min(a.shape[0] - 1, ys.max() + 4), max(1, xs.min() - 3), min(a.shape[1] - 1, xs.max() + 4)
    b, m = a[y0:y1, x0:x1].copy(), mask[y0:y1, x0:x1]; ring = np.zeros_like(m)
    ring[1:-1, 1:-1] = ~m[1:-1, 1:-1] & (m[:-2, 1:-1] | m[2:, 1:-1] | m[1:-1, :-2] | m[1:-1, 2:])
    b[m] = b[ring].mean(axis=0)
    for _ in range(iters):
        n = (np.roll(b, 1, 0) + np.roll(b, -1, 0) + np.roll(b, 1, 1) + np.roll(b, -1, 1)) / 4; b[m] = n[m]
    out = a.copy(); out[y0:y1, x0:x1] = b; return out
def room():
    src = Image.open(os.path.join(HERE, 'room_src.png')).convert('RGB').resize((1200, 675), Image.LANCZOS); a = np.asarray(src).astype(float)
    y, x = np.mgrid[0:675, 0:1200]; mask = (((x - 600) / 46.0) ** 2 + ((y - 352) / 44.0) ** 2 <= 1) | (((x - 602) / 64.0) ** 2 + ((y - 376) / 13.0) ** 2 <= 1) | (((x - 601) / 30.0) ** 2 + ((y - 396) / 20.0) ** 2 <= 1)   # the swordsman and the rays of his shadow
    a = inpaint(a, mask); img = Image.fromarray(np.clip(a, 0, 255).astype(np.uint8))
    img = img.resize((228, 128), Image.BOX)                                                     # area average: every game pixel is the mean of a block of the picture
    arr = np.asarray(img).astype(float); arr = np.clip((arr - 6) * 1.12, 0, 255); img = Image.fromarray(arr.astype(np.uint8))
    q = img.quantize(colors=30, method=Image.Quantize.MEDIANCUT, dither=Image.Dither.NONE).convert('RGB')      # a 16-bit look: 30 colours, no dithering
    q = lattice(q)
    out = Image.new('RGB', (320, 128), (0, 0, 0)); out.paste(q, (46, 0)); d = ImageDraw.Draw(out)
    for cx, flip in ((46 + 94, 1), (46 + 134, -1)): elder(d, cx, flip)                           # the two higher-ups
    return out.quantize(colors=40, method=Image.Quantize.MEDIANCUT, dither=Image.Dither.NONE).convert('RGB')
def blobs(mask):                                                                              # connected groups of True pixels (4-neighbour), biggest first
    H, W = mask.shape; lab = np.zeros((H, W), int); n = 0; out = []
    for y in range(H):
        for x in range(W):
            if mask[y, x] and not lab[y, x]:
                n += 1; st = [(y, x)]; lab[y, x] = n; pts = []
                while st:
                    cy, cx = st.pop(); pts.append((cy, cx))
                    for dy, dx in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                        ny, nx = cy + dy, cx + dx
                        if 0 <= ny < H and 0 <= nx < W and mask[ny, nx] and not lab[ny, nx]: lab[ny, nx] = n; st.append((ny, nx))
                out.append(pts)
    return sorted((p for p in out if len(p) > 40), key=len, reverse=True)
def lattice(img):                                                                             # the glowing paper panels lose their wooden lattice at this size: draw it again (a dark frame, three bars each way) in each panel's own slanted frame
    a = np.asarray(img).astype(float); lum = a.mean(axis=2); out = a.copy()
    for pts in blobs(lum > 128):
        P = np.array(pts, float); c = P.mean(axis=0); u, s_, vt = np.linalg.svd(P - c, full_matrices=False); ax = vt                    # principal axes of the blob (rows: long axis, short axis)
        pr = (P - c) @ ax.T; lo, hi = pr.min(axis=0), pr.max(axis=0); mem = set(pts)
        for (y, x), (p0, p1) in zip(pts, pr):
            u0, v0 = (p0 - lo[0]) / max(1e-6, hi[0] - lo[0]), (p1 - lo[1]) / max(1e-6, hi[1] - lo[1]); edge = any((y + dy, x + dx) not in mem for dy, dx in ((1, 0), (-1, 0), (0, 1), (0, -1)))
            bar = min(abs(u0 - k / 4) * (hi[0] - lo[0]) for k in (1, 2, 3)) < 0.55 or min(abs(v0 - k / 4) * (hi[1] - lo[1]) for k in (1, 2, 3)) < 0.55
            if edge: out[y, x] = a[y, x] * 0.42
            elif bar: out[y, x] = a[y, x] * 0.62
    return Image.fromarray(out.astype(np.uint8))
def elder(d, cx, flip):                                                                       # a higher-up seen from the front, sitting in the dark: a hooded head, wide shoulders in a robe, cut off by the bottom of the picture; a warm rim on the side the light comes from
    dk, md, rim = '#0a0610', '#171024', '#7a3c18'
    d.ellipse([cx - 5, 100, cx + 5, 112], fill=dk); d.rectangle([cx - 4, 106, cx + 4, 112], fill=dk)                  # the hood
    d.polygon([(cx - 6, 111), (cx + 6, 111), (cx + 11, 118), (cx + 13, 128), (cx - 13, 128), (cx - 11, 118)], fill=dk)  # the robe
    d.ellipse([cx - 3, 104, cx + 3, 111], fill='#030208')                                                              # the shadow of the face under the hood
    d.line([(cx - 4, 112), (cx - 8, 119), (cx - 8, 128)], fill=md); d.line([(cx + 4, 112), (cx + 8, 119), (cx + 8, 128)], fill=md)   # folds
    r = cx + 6 * flip
    d.line([(r - flip, 102), (cx + 5 * flip, 100)], fill=rim); d.line([(cx + 6 * flip, 108), (cx + 8 * flip, 112), (cx + 12 * flip, 118), (cx + 13 * flip, 127)], fill=rim)

# ---------------------------------------------------------------- the corridor and the BIG door
HW, HH, FLOOR = 400, 306, 270                                                                  # the corridor picture (the floor line, where Gojo's feet stand, is row 270) and the door's place in it
DX0, DX1, DY0, DY1 = 186, 316, 64, 270                                                         # the opening of the door: 130 px wide, 206 px tall (Gojo is 60 px tall)
WOOD, WOOD_HI, WOOD_DK, RED, RED_DK, RED_HI, GOLD = (42, 24, 16), (74, 42, 24), (24, 13, 9), (138, 20, 32), (74, 10, 18), (200, 42, 52), (216, 168, 48)
def px(im, x, y, c):
    if 0 <= x < im.width and 0 <= y < im.height: im.putpixel((x, y), c + (255,) if len(c) == 3 else c)
def rect(im, x0, y0, x1, y1, c):
    for y in range(y0, y1 + 1):
        for x in range(x0, x1 + 1): px(im, x, y, c)
def glow(a, cx, cy, rx, ry, col, k):                                                           # add a soft elliptical light (colour col, strength k) to the float image a
    y, x = np.mgrid[0:a.shape[0], 0:a.shape[1]]; t = np.clip(1 - np.sqrt(((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2), 0, 1) ** 1.6
    a[..., :3] += t[..., None] * np.array(col, float) * k
def hall():
    im = Image.new('RGBA', (HW, HH), (0, 0, 0, 255)); d = ImageDraw.Draw(im)
    for y in range(HH):                                                                          # the wall: dark wood, a little lighter towards the floor
        k = y / HH; d.line([(0, y), (HW, y)], fill=(int(9 + 12 * k), int(6 + 7 * k), int(12 + 4 * k), 255))
    rect(im, 0, 0, HW, 33, (5, 3, 8))                                                            # the ceiling, with beams
    for x in range(0, HW, 25): rect(im, x, 0, x + 2, 33, (14, 8, 10))
    rect(im, 0, 34, HW, 42, WOOD_DK); rect(im, 0, 43, HW, 43, (8, 5, 6)); rect(im, 0, 34, HW, 34, (34, 20, 14))      # the cross beam above the door
    for x in range(0, HW, 50): rect(im, x, 44, x + 3, FLOOR, (13, 8, 11)); rect(im, x + 3, 44, x + 3, FLOOR, (22, 13, 14))      # wall posts
    for y in (120, 215): rect(im, 0, y, HW, y + 3, (17, 10, 12)); rect(im, 0, y, HW, y, (30, 18, 15))                         # wall rails
    # the door frame: two thick posts, a heavy lintel with a plaque, a step
    for (x0, x1) in ((DX0 - 12, DX0 - 1), (DX1 + 1, DX1 + 12)):
        rect(im, x0, DY0 - 14, x1, FLOOR + 2, WOOD); rect(im, x0, DY0 - 14, x0, FLOOR + 2, WOOD_HI); rect(im, x1, DY0 - 14, x1, FLOOR + 2, WOOD_DK); rect(im, (x0 + x1) // 2, DY0 - 14, (x0 + x1) // 2, FLOOR + 2, RED_DK)
        for y in range(DY0, FLOOR, 22): rect(im, x0, y, x1, y + 1, WOOD_DK)                                                # carved bands on the posts
    rect(im, DX0 - 18, DY0 - 28, DX1 + 18, DY0 - 12, WOOD); rect(im, DX0 - 18, DY0 - 28, DX1 + 18, DY0 - 28, WOOD_HI); rect(im, DX0 - 18, DY0 - 12, DX1 + 18, DY0 - 12, WOOD_DK)
    rect(im, DX0 - 24, DY0 - 36, DX1 + 24, DY0 - 29, WOOD_DK); rect(im, DX0 - 24, DY0 - 36, DX1 + 24, DY0 - 36, (46, 28, 18))                                # a second beam above
    mx = (DX0 + DX1) // 2; rect(im, mx - 17, DY0 - 26, mx + 17, DY0 - 14, GOLD); rect(im, mx - 15, DY0 - 24, mx + 15, DY0 - 16, RED); rect(im, mx - 15, DY0 - 24, mx + 15, DY0 - 24, RED_HI)  # the plaque: red with a gold edge
    d.ellipse([mx - 5, DY0 - 25, mx + 5, DY0 - 15], fill=(240, 224, 192)); d.ellipse([mx - 2, DY0 - 25, mx + 8, DY0 - 15], fill=RED)                          # ...with a white crescent
    rect(im, DX0 - 14, FLOOR + 1, DX1 + 14, FLOOR + 5, (36, 22, 16)); rect(im, DX0 - 14, FLOOR + 1, DX1 + 14, FLOOR + 1, (62, 38, 24))                         # the threshold
    # the floor: dark planks with staggered joints
    for y in range(FLOOR + 6, HH):
        k = (y - FLOOR) / (HH - FLOOR); d.line([(0, y), (HW, y)], fill=(int(26 - 8 * k), int(15 - 5 * k), int(11 - 3 * k), 255))
    for y in (FLOOR + 14, FLOOR + 23): rect(im, 0, y, HW, y, (12, 7, 6))
    for i, y in enumerate((FLOOR + 6, FLOOR + 15, FLOOR + 24)):
        for x in range((i * 37) % 53, HW, 53): rect(im, x, y, x, y + 7, (12, 7, 6))
    # the lanterns: a paper lantern hangs from the ceiling on each side of the door
    for lx, ly in ((84, 96), (356, 92)):
        rect(im, lx, 34, lx, ly - 2, (26, 16, 14)); d.rounded_rectangle([lx - 8, ly, lx + 8, ly + 26], 3, fill=(176, 56, 20)); rect(im, lx - 6, ly + 3, lx + 6, ly + 23, (240, 150, 52)); rect(im, lx - 3, ly + 6, lx + 3, ly + 20, (255, 210, 120))
        for y in (ly + 8, ly + 14, ly + 20): rect(im, lx - 8, y, lx + 8, y, (110, 34, 12))
        rect(im, lx - 5, ly - 2, lx + 5, ly, (30, 18, 14)); rect(im, lx - 5, ly + 26, lx + 5, ly + 28, (30, 18, 14))
    a = np.asarray(im).astype(float)
    glow(a, 251, 200, 190, 170, (255, 150, 40), 0.55)                                              # the light of the room comes through the paper of the door and falls on everything near it
    glow(a, 251, FLOOR + 8, 150, 26, (255, 170, 60), 0.9)                                          # ...and spills over the floor in front of it
    glow(a, 84, 110, 46, 50, (255, 130, 40), 0.55); glow(a, 356, 106, 46, 50, (255, 130, 40), 0.55)  # the lanterns
    out = Image.fromarray(np.clip(a, 0, 255).astype(np.uint8)); alpha = np.full((HH, HW), 255, np.uint8); alpha[DY0:DY1, DX0:DX1 + 1] = 0      # the opening is a hole: the leaves slide behind the frame
    out.putalpha(Image.fromarray(alpha)); return out
def leaf(side):                                                                                # one leaf of the door: 66 x 206. side 0 = left leaf (its pull ring on the right), 1 = right leaf
    W, H = 66, DY1 - DY0; im = Image.new('RGBA', (W, H), WOOD + (255,)); d = ImageDraw.Draw(im)
    rect(im, 0, 0, W - 1, 0, WOOD_HI); rect(im, 0, 0, 0, H - 1, WOOD_HI); rect(im, W - 1, 0, W - 1, H - 1, WOOD_DK); rect(im, 0, H - 1, W - 1, H - 1, WOOD_DK)
    x0, x1, y0, y1 = 5, W - 6, 5, 138                                                            # the lattice: a grid of glowing paper panes behind dark wooden bars
    cols = [x0, x0 + 13, x0 + 27, x0 + 40, x1 + 1]; rows = [y0, y0 + 22, y0 + 44, y0 + 66, y0 + 88, y0 + 112, y1 + 1]
    for y in range(y0, y1 + 1):
        for x in range(x0, x1 + 1):                                                              # paper: brightest in the middle, warm orange at the edges, in four steps (a 16-bit look)
            r = math.hypot((x - W / 2) / (W / 2), (y - (y0 + y1) / 2) / ((y1 - y0) / 2)); t = 1 - min(1, r * 0.8) + 0.06 * (((x * 7 + y * 13) % 5) - 2) / 2
            px(im, x, y, (255, 238, 176) if t > 0.68 else (255, 205, 104) if t > 0.45 else (242, 156, 54) if t > 0.24 else (214, 110, 34))
    for i, x in enumerate(cols):                                                                # vertical bars
        if x0 < x <= x1: rect(im, x - 1, y0, x, y1, WOOD); rect(im, x - 1, y0, x - 1, y1, WOOD_HI)
    for i, y in enumerate(rows):                                                                # horizontal bars (some of the panes are joined: the bar is left out in places)
        if y0 < y <= y1:
            for xa, xb in ((x0, cols[1] - 2), (cols[1], cols[2] - 2), (cols[2], cols[3] - 2), (cols[3], x1)):
                if (i + (xa // 13)) % 4 != 1: rect(im, xa, y - 1, xb, y, WOOD); rect(im, xa, y - 1, xb, y - 1, WOOD_HI)
    rect(im, x0 - 1, y1 + 1, x1 + 1, y1 + 10, WOOD_DK); rect(im, x0 - 1, y1 + 1, x1 + 1, y1 + 1, WOOD_HI)                      # the middle rail
    for x in range(x0 + 3, x1, 7): rect(im, x, y1 + 5, x + 1, y1 + 6, WOOD_HI)
    ry0, ry1 = y1 + 14, H - 6                                                                    # the red lacquer panel under the lattice (the same red as the room's panels)
    rect(im, x0, ry0, x1, ry1, RED); rect(im, x0, ry0, x1, ry0 + 1, RED_HI); rect(im, x0, ry0, x0 + 1, ry1, RED_HI); rect(im, x0, ry1 - 1, x1, ry1, RED_DK); rect(im, x1 - 1, ry0, x1, ry1, RED_DK)
    rect(im, x0 + 7, ry0 + 7, x1 - 7, ry1 - 7, (118, 14, 26)); rect(im, x0 + 7, ry0 + 7, x1 - 7, ry0 + 7, RED_DK); rect(im, x0 + 7, ry0 + 7, x0 + 7, ry1 - 7, RED_DK)
    hx = W - 15 if side == 0 else 14; hy = ry0 - 16                                              # the iron pull ring on the red panel's top edge, on the side where the two leaves meet
    d.ellipse([hx - 6, hy - 6, hx + 6, hy + 6], outline=(150, 150, 168), width=2); d.ellipse([hx - 3, hy - 9, hx + 3, hy - 4], fill=(40, 36, 48)); px(im, hx - 4, hy - 3, (214, 214, 230))
    return im
def preview():                                                                                 # the corridor with both leaves shut, and half open
    out = []
    for open_ in (0, 56):
        bg = Image.new('RGB', (HW, HH), (255, 232, 160)); d = ImageDraw.Draw(bg)
        for y in range(DY0, DY1): d.line([(DX0, y), (DX1, y)], fill=(255, int(240 - 40 * (y - DY0) / (DY1 - DY0)), int(200 - 90 * (y - DY0) / (DY1 - DY0))))
        lf, rt = leaf(0), leaf(1); bg.paste(lf, (DX0 - open_, DY0), lf); bg.paste(rt, (DX0 + 65 + open_, DY0), rt); h = hall(); bg.paste(h, (0, 0), h); out.append(bg)
    return out

# ---------------------------------------------------------------- build / contact sheet
def build():
    return {'room': url(room()), 'hall': url(hall()), 'doorL': url(leaf(0)), 'doorR': url(leaf(1))}
if __name__ == '__main__':
    d = sys.argv[1] if len(sys.argv) > 1 else '.'
    r = room(); r.save(os.path.join(d, 'room.png')); r.resize((320 * 4, 128 * 4), Image.NEAREST).save(os.path.join(d, 'room_x4.png')); print('room', r.size)
    for i, p in enumerate(preview()): p.save(os.path.join(d, 'hall_%d.png' % i)); p.resize((HW * 2, HH * 2), Image.NEAREST).save(os.path.join(d, 'hall_%d_x2.png' % i))
