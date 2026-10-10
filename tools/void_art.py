"""The Infinite Void backdrop: your picture of the domain (art/domain_look_reference.jpg, a blue ring around a black hole, white splatters, sparkles)
recreated as 16-colour, 16-bit style pixel art, 64 pixels tall and 160 wide (the game draws it at 2x so it fills the whole screen).
The picture is cropped to the wide shape around the black hole, then 12 animation frames are made from it: the ring (with its black blots) turns by 30 degrees a frame,
the glow around the white splatters breathes, and the sparkles flicker. All 12 frames are painted with ONE shared 16-colour palette and a light ordered (Bayer) dither.
run: python3 -I void_art.py   ->   tools/void_cut.png   (12 frames stacked, 160 x 768)"""
import io, os
import numpy as np
from PIL import Image, ImageChops, ImageDraw, ImageEnhance, ImageFilter
HERE = os.path.dirname(os.path.abspath(__file__)); REF = os.path.join(HERE, '..', 'art', 'domain_look_reference.jpg')
W, H, N, NCOL, SPREAD = 160, 64, 12, 16, 22
src = Image.open(REF).convert('RGB'); SW, SH = src.size; CX, CY, R = 214, 177, 118            # the black hole and the outer edge of the ring's glow
def blur(a, r): return np.asarray(Image.fromarray(np.clip(a, 0, 255).astype('uint8')).filter(ImageFilter.GaussianBlur(r))).astype(float)
def frame(k):
    ang = -360.0 * k / N; fr = src.copy()
    ring = src.crop((CX - R, CY - R, CX + R, CY + R)).rotate(ang, resample=Image.BICUBIC)
    mask = Image.new('L', (2 * R, 2 * R), 0); ImageDraw.Draw(mask).ellipse((6, 6, 2 * R - 6, 2 * R - 6), fill=255); fr.paste(ring, (CX - R, CY - R), mask.filter(ImageFilter.GaussianBlur(7)))      # the ring turns
    g = np.asarray(fr).astype(float); bright = np.clip((g.mean(axis=2) - 150) / 80, 0, 1)[:, :, None]
    g += blur(g * bright, 5) * (0.30 * (0.5 + 0.5 * np.sin(2 * np.pi * k / N + 1.0)))                 # the glow of the splatters breathes
    rng = np.random.RandomState(100 + k); dark = g.mean(axis=2) < 45
    for _ in range(22):                                                                                # sparkles
        for _t in range(20):
            x, y = rng.randint(4, SW - 4), rng.randint(4, SH - 4)
            if dark[y, x]: s = rng.choice([3, 4, 5]); g[y - s // 2:y + s // 2 + 1, x - s // 2:x + s // 2 + 1] = 255; break
    for _ in range(4):                                                                                 # a few short light streaks
        x, y = rng.randint(60, SW - 30), rng.randint(20, SH - 20); L = rng.randint(12, 26)
        for t in range(L): xx, yy = int(x + t), int(y - t * 0.45); g[max(0, yy - 1):yy + 2, max(0, xx):xx + 2] = 240
    return Image.fromarray(np.clip(g, 0, 255).astype('uint8'))
sc = W / SW; ch = round(H / sc); y0 = round(CY - ch / 2)
def prep(im):
    im = im.crop((0, y0, SW, y0 + ch)).resize((W, H), Image.LANCZOS); return ImageEnhance.Contrast(ImageEnhance.Color(im).enhance(1.15)).enhance(1.1)
small = [prep(frame(k)) for k in range(N)]
strip = Image.new('RGB', (W, H * N)); [strip.paste(s, (0, k * H)) for k, s in enumerate(small)]
q0 = strip.quantize(NCOL, method=Image.MEDIANCUT, dither=Image.Dither.NONE); pal = q0.getpalette()[:NCOL * 3]
pimg = Image.new('P', (1, 1)); pimg.putpalette(pal + pal[:3] * (256 - NCOL))
B = np.array([[0, 8, 2, 10], [12, 4, 14, 6], [3, 11, 1, 9], [15, 7, 13, 5]]) / 16.0 - 0.5
a = np.asarray(strip).astype(float) + np.tile(B, (H * N // 4, W // 4))[:, :, None] * SPREAD
q = Image.fromarray(np.clip(a, 0, 255).astype('uint8')).quantize(palette=pimg, dither=Image.Dither.NONE)
buf = io.BytesIO(); q.save(buf, 'PNG', optimize=True)
open(os.path.join(HERE, 'void_cut.png'), 'wb').write(buf.getvalue()); print('void_cut.png', len(buf.getvalue()) // 1024, 'KB,', N, 'frames of', W, 'x', H, ',', NCOL, 'colours')
