"""The Domain Expansion cut-in: your reference GIF (art/domain_reference.gif) remastered as pixel art.
Frames 0-157 of the GIF (the face behind the hand sign, then the push-in on the eyes) are sampled every 4th frame (about 7 FPS),
cropped to the game's wide screen shape, scaled to the game's own pixel size (320 x 130, one picture pixel = one game pixel),
colour-boosted a little and squeezed into ONE shared 32-colour palette. The result is a PNG strip (40 frames stacked) that build_html.py embeds.
run: python3 -I domain_art.py   ->   tools/domain_cut.png"""
import io, os
from PIL import Image, ImageEnhance, ImageSequence
HERE = os.path.dirname(os.path.abspath(__file__)); SRC = os.path.join(HERE, '..', 'art', 'domain_reference.gif')
W, H, N, STEP, NCOL = 320, 130, 40, 4, 32
fr = [f.copy().convert('RGB') for f in ImageSequence.Iterator(Image.open(SRC))]
use = fr[0:N * STEP:STEP]; assert len(use) == N, len(use)
cw, ch = fr[0].size; crop_h = round(cw * H / W); top = max(0, min(ch - crop_h, 34))           # the part of the picture with the face / eyes
def prep(im):
    im = im.crop((0, top, cw, top + crop_h)).resize((W, H), Image.LANCZOS)
    return ImageEnhance.Contrast(ImageEnhance.Color(im).enhance(1.3)).enhance(1.12)
small = [prep(f) for f in use]
strip = Image.new('RGB', (W, H * N)); [strip.paste(s, (0, i * H)) for i, s in enumerate(small)]
pal = strip.quantize(NCOL, method=Image.MEDIANCUT, dither=Image.Dither.NONE)
q = strip.quantize(palette=pal, dither=Image.Dither.NONE)
buf = io.BytesIO(); q.save(buf, 'PNG', optimize=True)
open(os.path.join(HERE, 'domain_cut.png'), 'wb').write(buf.getvalue()); print('domain_cut.png', len(buf.getvalue()) // 1024, 'KB,', N, 'frames of', W, 'x', H)
