"""The Domain Expansion cut-in: your reference GIF (art/domain_reference.gif) remastered as 64 x 64, 16-colour, 16-bit style pixel art.
Frames 0-157 of the GIF (the face behind the hand sign, then the push-in on the eyes) are sampled every 4th frame (40 frames, shown at 8 FPS).
Each one is cropped square (a tight crop on the face, then a slow pan across the eyes), scaled to 64 x 64, colour-boosted and sharpened, then painted with ONE shared
16-colour palette (median cut, with two bright cyan colours forced in for the glowing eyes) and a light ordered (Bayer) dither, like Super Nintendo / Mega Drive art.
The game shows it at 2x (128 x 128 game pixels). The result is a PNG strip (40 frames stacked, 64 x 2560) that build_html.py embeds.
run: python3 -I domain_art.py   ->   tools/domain_cut.png"""
import io, os
import numpy as np
from PIL import Image, ImageEnhance, ImageFilter, ImageSequence
HERE = os.path.dirname(os.path.abspath(__file__)); SRC = os.path.join(HERE, '..', 'art', 'domain_reference.gif')
N, STEP, S, NCOL, SPREAD = 40, 4, 64, 16, 24
fr = [f.copy().convert('RGB') for f in ImageSequence.Iterator(Image.open(SRC))]; ch = fr[0].size[1]
def crop(i):
    if i < 67: return fr[i].crop((120, 40, 120 + 235, 40 + 235))                       # the face and the hand sign
    u = (i - 67) / 90; u = u * u * (3 - 2 * u); x0 = round(10 + 190 * u); return fr[i].crop((x0, 0, x0 + ch, ch))      # a slow pan across the eyes
def prep(im):
    im = im.resize((S, S), Image.LANCZOS); im = ImageEnhance.Contrast(ImageEnhance.Color(im).enhance(1.4)).enhance(1.15); return im.filter(ImageFilter.UnsharpMask(1, 60, 2))
small = [prep(crop(i)) for i in range(0, N * STEP, STEP)]
strip = Image.new('RGB', (S, S * N)); [strip.paste(s, (0, k * S)) for k, s in enumerate(small)]
q0 = strip.quantize(NCOL, method=Image.MEDIANCUT, dither=Image.Dither.NONE); pal = q0.getpalette()[:NCOL * 3]
use = np.bincount(np.asarray(q0).ravel(), minlength=NCOL); worst = np.argsort(use)[:2]
for k, c in zip(worst, [(95, 232, 255), (200, 244, 255)]): pal[k * 3:k * 3 + 3] = c         # two glowing-eye colours
pimg = Image.new('P', (1, 1)); pimg.putpalette(pal + pal[:3] * (256 - NCOL))                  # (the unused palette slots repeat colour 0, so the picture really has only 16 colours)
B = np.array([[0, 8, 2, 10], [12, 4, 14, 6], [3, 11, 1, 9], [15, 7, 13, 5]]) / 16.0 - 0.5
a = np.asarray(strip).astype(float) + np.tile(B, (S * N // 4, S // 4))[:, :, None] * SPREAD
q = Image.fromarray(np.clip(a, 0, 255).astype('uint8')).quantize(palette=pimg, dither=Image.Dither.NONE)
buf = io.BytesIO(); q.save(buf, 'PNG', optimize=True)
open(os.path.join(HERE, 'domain_cut.png'), 'wb').write(buf.getvalue()); print('domain_cut.png', len(buf.getvalue()) // 1024, 'KB,', N, 'frames of', S, 'x', S, ',', NCOL, 'colours')
