# python3 gif_pixel.py [--preview DIR] -> sukuna_gif.png (a strip of the frames of art/sukuna_domain_gif_ref.gif in PIXEL form: the black bars cut off, every frame boxed
# down to W x H, ONE palette of 16 colours for all frames, colour 0 = black) + sukuna_gif.json { w, h, n, ms (a frame's time) }.  v1.136: the GIF the user sent (Sukuna's black silhouette from behind
# against a blood-red sky, his grin, hands rising from the edges: the opening of his domain) becomes the cut-in of the DOMAIN EXPANSION; the game draws it over the whole screen (sukuna_gif in tools/chap3d.js)
import json, os, sys
import numpy as np
from PIL import Image, ImageSequence
HERE = os.path.dirname(os.path.abspath(__file__)); SRC = os.path.join(HERE, '..', 'art', 'sukuna_domain_gif_ref.gif')
W, H = 150, 123      # (the picture inside the bars is 220 x 179: 1.47 times smaller)
NCOL = 16
def frames():
    im = Image.open(SRC); out = []
    for f in ImageSequence.Iterator(im):
        a = f.convert('RGB').crop((0, 20, 220, 199)); out.append((a, a.resize((W, H), Image.LANCZOS)))      # (rows 20 - 198 are the picture: the full picture for the palette, the boxed-down one for the strip)
    return out, im.info.get('duration', 100)
def build():
    both, ms = frames(); n = len(both); fr = [b[1] for b in both]; allpx = np.concatenate([np.array(b[0]).reshape(-1, 3) for b in both]).astype(int)      # (the palette is taken from the big pictures: the pale skin is a few pixels there and blends with the red when boxed down)
    skin = allpx[(allpx[:, 1] > 85) & (allpx[:, 0] > 120)]      # (the pale skin of the face: a handful of pixels in a sea of red, so it gets palette colours of its own)
    rest = allpx[~((allpx[:, 1] > 85) & (allpx[:, 0] > 120))]
    def pal_of(px, k):
        sub = px[np.random.RandomState(1).choice(len(px), min(len(px), 60000), replace=False)]
        q = Image.fromarray(sub.reshape(-1, 1, 3).astype(np.uint8)).quantize(colors=k, method=Image.MEDIANCUT, dither=Image.NONE); p = q.getpalette()[:3 * k]; return [tuple(p[3 * i:3 * i + 3]) for i in range(k)]
    cols = pal_of(rest, NCOL - 4) + pal_of(skin, 4); C = np.array(cols, int)
    order = sorted(range(len(cols)), key=lambda i: sum(cols[i])); cols = [cols[i] for i in order]; C = np.array(cols, int)      # (the darkest first: colour 0 is the blackest)
    strip = Image.new('P', (W * n, H), 0); pal2 = [0, 0, 0] * 256
    for k, c in enumerate(cols): pal2[3 * k:3 * k + 3] = list(c)
    strip.putpalette(pal2)
    for i, f in enumerate(fr):
        a = np.array(f).astype(int).reshape(-1, 3); d = ((a[:, None, :] - C[None, :, :]) ** 2).sum(2); idx = d.argmin(1).astype(np.uint8).reshape(H, W)
        strip.paste(Image.fromarray(idx, 'P'), (i * W, 0))
    return strip, n, ms, cols
if __name__ == '__main__':
    strip, n, ms, cols = build(); strip.save(os.path.join(HERE, 'sukuna_gif.png'), optimize=True)
    json.dump({'w': W, 'h': H, 'n': n, 'ms': ms}, open(os.path.join(HERE, 'sukuna_gif.json'), 'w'))
    print('wrote sukuna_gif.png', strip.size, n, 'frames', ms, 'ms', os.path.getsize(os.path.join(HERE, 'sukuna_gif.png')), 'bytes', cols)
    if '--preview' in sys.argv:
        d = sys.argv[sys.argv.index('--preview') + 1]; os.makedirs(d, exist_ok=True); rgb = strip.convert('RGB')
        sheet = Image.new('RGB', (W * 4 * 2, H * 3 * 2))
        for k, i in enumerate((0, 6, 12, 18, 24, 28, 32, 35, 37, 3, 9, 15)):
            f = rgb.crop((i * W, 0, i * W + W, H)).resize((W * 2, H * 2), Image.NEAREST); sheet.paste(f, ((k % 4) * W * 2, (k // 4) * H * 2))
        sheet.save(os.path.join(d, 'gif_sheet.png'))
