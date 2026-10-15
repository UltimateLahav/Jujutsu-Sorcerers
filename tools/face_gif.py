#!/usr/bin/env python3
"""Gojo's blindfold close-up made from the reference GIF (the anime shot: a hand pulls the blindfold down to his neck and his eyes light up). An OFFLINE tool: it needs OpenCV and the GIF (not kept in the repository); the result, tools/gojo_pull.png, is what the game build uses (see story_art.py).
Steps: 1. the 'makeagif.com' watermark is painted out, 2. the background is cut away (GrabCut, every frame starts from the cutout of the one before), 3. the picture is pixelated (shrunk to 114 x 64, limited to one shared palette of 32 colours and shown at 2 x 2 screen pixels per pixel), 4. every 2nd frame from the start to frame 56 goes into one picture of 29 frames of 320 x 128 stacked downwards (320 x 3712) with a see-through background (the picture sits in the middle).
Run:  python3 -B face_gif.py <the.gif> [<directory for a contact sheet>]"""
import os, sys
import numpy as np
import cv2
from PIL import Image, ImageSequence
HERE = os.path.dirname(os.path.abspath(__file__))
W, H, GW, GH, K = 320, 128, 114, 64, 2                      # a game frame, the pixelated picture (GW x GH art pixels, shown K x as big: 228 x 128)
FIRST, LAST, STEP, COLORS = 0, 56, 2, 32
def load(path): return [np.array(f.convert('RGB')) for f in ImageSequence.Iterator(Image.open(path))]
def clean(fr):                                                # the watermark: white letters in the bottom right corner, painted over from what is around them
    out = []
    for f in fr:
        g = cv2.cvtColor(f, cv2.COLOR_RGB2GRAY); m = np.zeros(g.shape, np.uint8); m[156:180, 222:320] = (g[156:180, 222:320] > 150).astype(np.uint8) * 255
        out.append(cv2.inpaint(f, cv2.dilate(m, np.ones((5, 5), np.uint8)), 3, cv2.INPAINT_TELEA))
    return out
def segment(fr):                                              # the cutout of every frame: Gojo and his hand are kept, the dark room and the bars of light behind him go
    masks, prev = [], None; h, w = fr[0].shape[:2]; yy, xx = np.mgrid[0:h, 0:w]
    for i, f in enumerate(fr):
        gc = np.full((h, w), cv2.GC_PR_BGD, np.uint8)
        if prev is None: gc[((xx - 160) / 135.0) ** 2 + ((yy - 85) / 150.0) ** 2 < 1] = cv2.GC_PR_FGD; gc[:, :10] = cv2.GC_BGD; gc[:, -10:] = cv2.GC_BGD; gc[((xx - 160) / 70.0) ** 2 + ((yy - 70) / 80.0) ** 2 < 1] = cv2.GC_FGD
        else:
            near = cv2.dilate(prev, np.ones((15, 15), np.uint8)); gc[near > 0] = cv2.GC_PR_FGD; gc[cv2.erode(prev, np.ones((9, 9), np.uint8)) > 0] = cv2.GC_FGD; gc[near == 0] = cv2.GC_BGD
        bgm, fgm = np.zeros((1, 65), np.float64), np.zeros((1, 65), np.float64); cv2.grabCut(cv2.cvtColor(f, cv2.COLOR_RGB2BGR), gc, None, bgm, fgm, 4, cv2.GC_INIT_WITH_MASK)
        m = ((gc == cv2.GC_FGD) | (gc == cv2.GC_PR_FGD)).astype(np.uint8)
        m = cv2.morphologyEx(m, cv2.MORPH_OPEN, np.ones((15, 1), np.uint8)); m = cv2.morphologyEx(m, cv2.MORPH_CLOSE, np.ones((7, 7), np.uint8)); n, lab, st, _ = cv2.connectedComponentsWithStats(m); keep = np.zeros_like(m)
        for j in range(1, n):
            if st[j, cv2.CC_STAT_AREA] > 400: keep[lab == j] = 1
        inv = (1 - keep).astype(np.uint8); n, lab, st, _ = cv2.connectedComponentsWithStats(inv)                      # (holes inside Gojo, like the black blindfold, belong to him)
        for j in range(1, n):
            x0, y0, ww, hh, ar = st[j]
            if ar < 3000 and x0 > 0 and y0 > 0 and x0 + ww < w and y0 + hh < h: keep[lab == j] = 1
        prev = keep; masks.append(keep)
    return masks
def pixelate(fr, masks, sel):                                 # shrink, one palette for all frames (made from Gojo's pixels only), whole pixels
    from PIL import ImageEnhance
    cols = [ImageEnhance.Contrast(ImageEnhance.Color(Image.fromarray(fr[i]).resize((GW, GH), Image.BOX)).enhance(1.35)).enhance(1.12) for i in sel]
    al = [(np.array(Image.fromarray(masks[i] * 255).resize((GW, GH), Image.BOX)) > 127) for i in sel]
    px = np.concatenate([np.array(c)[a] for c, a in zip(cols, al)]).reshape(-1, 1, 3).astype(np.uint8); n = int(np.ceil(np.sqrt(len(px)))); flat = np.zeros((n * n, 3), np.uint8); flat[:len(px)] = px.reshape(-1, 3); flat[len(px):] = px.reshape(-1, 3)[0]
    pal = Image.fromarray(flat.reshape(n, n, 3)).quantize(COLORS, method=Image.Quantize.MEDIANCUT, dither=Image.Dither.NONE); out = []
    for c, a in zip(cols, al):
        q = c.quantize(palette=pal, dither=Image.Dither.NONE).convert('RGB')
        im = Image.fromarray(np.dstack([np.array(q), a.astype(np.uint8) * 255]), 'RGBA').resize((GW * K, GH * K), Image.NEAREST); fr_ = Image.new('RGBA', (W, H), (0, 0, 0, 0)); fr_.paste(im, ((W - GW * K) // 2, 0)); out.append(fr_)
    return out
def strip(frames):
    s = Image.new('RGBA', (W, H * len(frames)), (0, 0, 0, 0))
    for i, f in enumerate(frames): s.paste(f, (0, i * H))
    return s
if __name__ == '__main__':
    fr = clean(load(sys.argv[1])); masks = segment(fr); sel = list(range(FIRST, LAST + 1, STEP)); out = pixelate(fr, masks, sel); strip(out).save(os.path.join(HERE, 'gojo_pull.png'), optimize=True)
    print('frames', len(out), 'picture', W, 'x', H * len(out))
    if len(sys.argv) > 2:
        pick = [0, len(out) // 5, 2 * len(out) // 5, 3 * len(out) // 5, 4 * len(out) // 5, len(out) - 1]; sh = Image.new('RGB', (W * 3, H * 2), (200, 60, 200))
        for k, i in enumerate(pick): bg = Image.new('RGBA', (W, H), (200, 60, 200, 255)); bg.alpha_composite(out[i]); sh.paste(bg.convert('RGB'), ((k % 3) * W, (k // 3) * H))
        sh.resize((sh.width, sh.height)).save(os.path.join(sys.argv[2], 'gif_cut.png'))
