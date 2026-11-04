# python3 sukuna_domain_art.py [--preview DIR] -> sukuna_portrait.png + sukuna_shrine.png: the two pictures of SUKUNA'S ULTIMATE (v1.124, the Malevolent Shrine), made from the two reference pictures kept in ../art/ :
#   sukuna_domain_ref1_portrait.jpg (Sukuna with his hands pressed together, the picture that appears behind him while he makes the sign) -> a 64 x 64 pixel picture in the style of a 16 bit game (28 colours, no smooth shading, a dark line where the picture changes sharply)
#   sukuna_domain_ref2_shrine.jpg   (the Malevolent Shrine: a roof of horns over two mouths, in a ring of skulls) -> a pixel picture about 110 pixels wide on a see-through background (the grey background of the reference is cut away by growing it in from the edges
#                                   over pixels that are grey and change smoothly, so the dark blue-grey roof and horns stay), 56 colours and a dark line round it.
# Both are palette PNGs (colour 0 = see-through) that build_html.py embeds (__SUKPORT__, __SUKSHR__).
import os, sys, collections
import numpy as np
from PIL import Image, ImageEnhance, ImageFilter
from scipy import ndimage as ndi

HERE = os.path.dirname(os.path.abspath(__file__)); ART = os.path.join(HERE, '..', 'art')
INK = (20, 6, 12)                                              # the dark line colour (a very dark crimson)

def bayer4():
    return np.array([[0, 8, 2, 10], [12, 4, 14, 6], [3, 11, 1, 9], [15, 7, 13, 5]], float) / 16.0

def to_palette_png(rgb, alpha, path, ncol):
    """rgb: HxWx3 uint8, alpha: HxW bool -> a palette PNG with at most ncol+1 entries (index 0 see-through)"""
    h, w = alpha.shape; idx = np.zeros((h, w), np.uint8)
    cols = sorted({tuple(int(v) for v in rgb[y, x]) for y in range(h) for x in range(w) if alpha[y, x]}); assert len(cols) <= ncol + 4, len(cols)
    look = {c: i + 1 for i, c in enumerate(cols)}
    for y in range(h):
        for x in range(w):
            if alpha[y, x]: idx[y, x] = look[tuple(int(v) for v in rgb[y, x])]
    im = Image.fromarray(idx, 'P'); im.putpalette([0, 0, 0] + [v for c in cols for v in c]); im.save(path, transparency=0, optimize=True); return len(cols)

def portrait(ncol=28, edge=True):
    im = Image.open(os.path.join(ART, 'sukuna_domain_ref1_portrait.jpg')).convert('RGB')
    a = ImageEnhance.Contrast(im).enhance(1.3); a = ImageEnhance.Color(a).enhance(1.2); a = a.filter(ImageFilter.UnsharpMask(radius=2, percent=100, threshold=2))
    a = a.resize((64, 64), Image.LANCZOS)
    q = np.asarray(a.quantize(colors=ncol, method=Image.Quantize.MEDIANCUT, dither=Image.Dither.NONE).convert('RGB')).copy()
    if edge:                                                    # a dark line where a dark pixel meets a much lighter one (the 16 bit look), only on the inside of the dark side
        L = (q[..., 0].astype(int) * 30 + q[..., 1] * 59 + q[..., 2] * 11) // 100; out = q.copy()
        for y in range(64):
            for x in range(64):
                for dy, dx in ((0, 1), (1, 0), (0, -1), (-1, 0)):
                    yy, xx = y + dy, x + dx
                    if 0 <= yy < 64 and 0 <= xx < 64 and L[yy, xx] - L[y, x] > 70 and L[y, x] < 120: out[y, x] = (np.array(INK) * .6 + q[y, x] * .4).astype(np.uint8); break
        q = out
    # the edge fades away in a dither (so the picture can float on the map): opaque inside a rounded square, a 4 x 4 ordered dither over the last 9 pixels
    yy, xx = np.mgrid[0:64, 0:64]; d = np.maximum(np.abs(xx - 31.5), np.abs(yy - 31.5)) + np.hypot(np.maximum(0, np.abs(xx - 31.5) - 22), np.maximum(0, np.abs(yy - 31.5) - 22)) * .6
    k = np.clip((32.0 - d) / 9.0, 0, 1); B = bayer4()[yy % 4, xx % 4]; alpha = k > B
    return q, alpha

def shrine(width=108, ncol=56):
    im = Image.open(os.path.join(ART, 'sukuna_domain_ref2_shrine.jpg')).convert('RGB'); a = np.asarray(im).astype(int); H, W, _ = a.shape
    sat = a.max(-1) - a.min(-1); L = (a[..., 0] + a[..., 1] + a[..., 2]) // 3; ok = sat <= 4
    bg = np.zeros((H, W), bool); dq = collections.deque()
    for x in range(W):
        for y in (0, H - 1):
            if ok[y, x] and not bg[y, x]: bg[y, x] = True; dq.append((y, x))
    for y in range(H):
        for x in (0, W - 1):
            if ok[y, x] and not bg[y, x]: bg[y, x] = True; dq.append((y, x))
    while dq:                                                   # the background grows in from the edges over grey pixels that are about as bright as the one before
        y, x = dq.popleft()
        for dy, dx in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            yy, xx = y + dy, x + dx
            if 0 <= yy < H and 0 <= xx < W and not bg[yy, xx] and ok[yy, xx] and abs(L[yy, xx] - L[y, x]) <= 3: bg[yy, xx] = True; dq.append((yy, xx))
    fg = ndi.binary_closing(~bg, iterations=1); lab, n = ndi.label(fg); sizes = ndi.sum(fg, lab, range(1, n + 1)); fg = ndi.binary_fill_holes(np.isin(lab, [i + 1 for i, s in enumerate(sizes) if s > 400]))
    fg = ndi.binary_erosion(fg, iterations=2)                   # (the grey fringe of the jpeg at the edge goes)
    ys, xs = np.where(fg); x0, x1, y0, y1 = xs.min(), xs.max() + 1, ys.min(), ys.max() + 1
    rgbf = np.asarray(ImageEnhance.Contrast(ImageEnhance.Color(im).enhance(1.45)).enhance(1.25).filter(ImageFilter.UnsharpMask(radius=5, percent=160, threshold=2))).astype(float)      # (richer colours and sharper edges, or the roof, the teeth and the skulls melt into each other at this size)
    crop = rgbf[y0:y1, x0:x1]; m = fg[y0:y1, x0:x1].astype(float); h0, w0 = m.shape; hh = round(h0 * width / w0)
    pre = Image.fromarray((crop * m[..., None]).astype(np.uint8)).resize((width, hh), Image.BOX); ma = np.asarray(Image.fromarray((m * 255).astype(np.uint8)).resize((width, hh), Image.BOX)).astype(float) / 255
    avg = np.asarray(pre).astype(float) / np.maximum(ma[..., None], .02); alpha = ma >= .5; avg = np.clip(avg, 0, 255)
    fill = avg[alpha].mean(0); work = Image.fromarray(np.where(alpha[..., None], avg, fill).astype(np.uint8)).filter(ImageFilter.UnsharpMask(radius=1, percent=60, threshold=1))
    q = np.asarray(work.quantize(colors=ncol, method=Image.Quantize.MEDIANCUT, dither=Image.Dither.NONE).convert('RGB')).copy()
    pad = 1; Q = np.zeros((hh + 2 * pad, width + 2 * pad, 3), np.uint8); A = np.zeros((hh + 2 * pad, width + 2 * pad), bool); Q[pad:-pad, pad:-pad] = q; A[pad:-pad, pad:-pad] = alpha
    ring = ndi.binary_dilation(A, structure=ndi.generate_binary_structure(2, 1)) & ~A; Q[ring] = INK; A = A | ring     # the dark line round it
    return Q, A

def preview(rgb, alpha, path, S, bg=(18, 19, 31)):
    h, w = alpha.shape; im = Image.new('RGB', (w, h), bg); src = Image.fromarray(rgb); im.paste(src, (0, 0), Image.fromarray((alpha * 255).astype(np.uint8))); im.resize((w * S, h * S), Image.NEAREST).save(path)

if __name__ == '__main__':
    q, a = portrait(); n1 = to_palette_png(q, a, os.path.join(HERE, 'sukuna_portrait.png'), 28); Q, A = shrine(); n2 = to_palette_png(Q, A, os.path.join(HERE, 'sukuna_shrine.png'), 56)
    print('wrote sukuna_portrait.png 64 x 64,', n1, 'colours; sukuna_shrine.png', A.shape[1], 'x', A.shape[0], ',', n2, 'colours')
    if '--preview' in sys.argv:
        out = sys.argv[sys.argv.index('--preview') + 1]; os.makedirs(out, exist_ok=True); preview(q, a, os.path.join(out, 'portrait_x8.png'), 8); preview(Q, A, os.path.join(out, 'shrine_x5.png'), 5); preview(Q, A, os.path.join(out, 'shrine_x1.png'), 1)
