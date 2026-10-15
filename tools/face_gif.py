#!/usr/bin/env python3
"""Gojo's blindfold close-up made from the reference GIF (the anime shot: a hand pulls the blindfold down to his neck and his eyes light up): the whole picture with its own background, PIXELATED. An OFFLINE tool (it needs the GIF, which is not kept in the repository); the result, tools/gojo_pull.png, is what the game build uses (see story_art.py).
Steps: 1. the rows 24-152 of the 320 x 180 GIF are kept (the eyes, the nose and mouth and most of the neck; the 'makeagif.com' watermark at the bottom is cropped away), so a frame is 320 x 128 like the game's screen, 2. it is shrunk to 160 x 64 (the same chunky size as the Domain's cut-in), limited to one shared palette of 40 colours and shown at 2 x 2 screen pixels per pixel, 3. every 2nd frame from the start to frame 56 goes into one picture of 29 frames stacked downwards (320 x 3712).
Run:  python3 -B face_gif.py <the.gif> [<directory for a contact sheet>]"""
import os, sys
import numpy as np
from PIL import Image, ImageEnhance, ImageSequence
HERE = os.path.dirname(os.path.abspath(__file__))
W, H, GW, GH, Y0 = 320, 128, 160, 64, 24                    # a game frame, the pixelated picture (GW x GH art pixels, shown 2 x as big), the first GIF row that is kept
FIRST, LAST, STEP, COLORS = 0, 56, 2, 40
def load(path): return [np.array(f.convert('RGB')) for f in ImageSequence.Iterator(Image.open(path))]
def pixelate(fr, sel):                                      # shrink, one palette for all frames, whole pixels
    cols = [ImageEnhance.Contrast(ImageEnhance.Color(Image.fromarray(fr[i][Y0:Y0 + H]).resize((GW, GH), Image.BOX)).enhance(1.2)).enhance(1.08) for i in sel]
    mont = Image.new('RGB', (GW * len(cols), GH))
    for k, c in enumerate(cols): mont.paste(c, (k * GW, 0))
    pal = mont.quantize(COLORS, method=Image.Quantize.MEDIANCUT, dither=Image.Dither.NONE)
    return [c.quantize(palette=pal, dither=Image.Dither.NONE).convert('RGB').resize((W, H), Image.NEAREST) for c in cols]
def stack(frames):
    s = Image.new('RGB', (W, H * len(frames)))
    for i, f in enumerate(frames): s.paste(f, (0, i * H))
    return s
if __name__ == '__main__':
    fr = load(sys.argv[1]); out = pixelate(fr, list(range(FIRST, LAST + 1, STEP))); stack(out).save(os.path.join(HERE, 'gojo_pull.png'), optimize=True)
    print('frames', len(out), 'picture', W, 'x', H * len(out))
    if len(sys.argv) > 2:
        pick = [0, 7, 11, 15, 20, len(out) - 1]; sh = Image.new('RGB', (W * 3, H * 2))
        for k, i in enumerate(pick): sh.paste(out[i], ((k % 3) * W, (k // 3) * H))
        sh.save(os.path.join(sys.argv[2], 'gif_pix.png'))
