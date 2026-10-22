"""The Hometown Domain cast: your reference GIF (art/hometown_reference.gif: a red sunburst halo round a dark figure with glowing white eyes and two hands pressed together in the domain sign; 165 x 294 pixels, 130 pictures at 10 a second)
remastered as 16-colour, 16-bit style pixel art in the shape of the screen: 160 x 80 pixels (the game draws it BEHIND Yuji and scales it up to cover the whole screen, whatever the phone's shape is).
Pictures 0-31 of the GIF (3.2 s) are used one by one; each is cropped to the wide shape round the halo and the eyes (the full width of the GIF, 82 rows from row CROP_Y), colour-boosted, then painted with ONE shared 16-colour palette
(median cut, with pure white and a bright red forced in for the eyes) and a very light ordered (Bayer) dither, like Super Nintendo / Mega Drive art. The GIF is already dithered, so the extra dither is weak.
The result is a PNG strip (32 pictures stacked, 160 x 2560) that build_html.py embeds as __HOMEIMG__.
run: python3 -I hometown_art.py   ->   tools/hometown_cut.png"""
import io, os
import numpy as np
from PIL import Image, ImageEnhance, ImageFilter, ImageSequence
HERE = os.path.dirname(os.path.abspath(__file__)); SRC = os.path.join(HERE, '..', 'art', 'hometown_reference.gif')
N, W, H, NCOL, SPREAD, CROP_Y = 32, 160, 80, 16, 10, 74
fr = [f.copy().convert('RGB') for f in ImageSequence.Iterator(Image.open(SRC))]; gw = fr[0].size[0]; ch = round(gw * H / W)
def prep(im):
    im = im.crop((0, CROP_Y, gw, CROP_Y + ch)).resize((W, H), Image.LANCZOS); im = ImageEnhance.Contrast(ImageEnhance.Color(im).enhance(1.25)).enhance(1.1); return im.filter(ImageFilter.UnsharpMask(1, 50, 2))
small = [prep(fr[i]) for i in range(N)]
strip = Image.new('RGB', (W, H * N)); [strip.paste(s, (0, k * H)) for k, s in enumerate(small)]
q0 = strip.quantize(NCOL, method=Image.MEDIANCUT, dither=Image.Dither.NONE); pal = q0.getpalette()[:NCOL * 3]
use = np.bincount(np.asarray(q0).ravel(), minlength=NCOL); worst = np.argsort(use)[:2]
for k, c in zip(worst, [(255, 255, 255), (255, 64, 48)]): pal[k * 3:k * 3 + 3] = c                  # white (the eyes) and a bright red (the pupils and the tips of the rays)
pimg = Image.new('P', (1, 1)); pimg.putpalette(pal + pal[:3] * (256 - NCOL))                        # (the unused palette slots repeat colour 0, so the picture really has only 16 colours)
B = np.array([[0, 8, 2, 10], [12, 4, 14, 6], [3, 11, 1, 9], [15, 7, 13, 5]]) / 16.0 - 0.5
a = np.asarray(strip).astype(float) + np.tile(B, (H * N // 4, W // 4))[:, :, None] * SPREAD
q = Image.fromarray(np.clip(a, 0, 255).astype('uint8')).quantize(palette=pimg, dither=Image.Dither.NONE)
buf = io.BytesIO(); q.save(buf, 'PNG', optimize=True)
open(os.path.join(HERE, 'hometown_cut.png'), 'wb').write(buf.getvalue()); print('hometown_cut.png', len(buf.getvalue()) // 1024, 'KB,', N, 'frames of', W, 'x', H, ',', NCOL, 'colours')
