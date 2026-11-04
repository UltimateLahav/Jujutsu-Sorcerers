# python3 sukuna_domain_art.py [--preview DIR] -> sukuna_portrait.png + sukuna_shrines.png: the two pictures of SUKUNA'S ULTIMATE (v1.124, the Malevolent Shrine; v1.125: the shrine fills the screen), made from the two reference pictures kept in ../art/ :
#   sukuna_domain_ref1_portrait.jpg (Sukuna with his hands pressed together, the picture that appears behind him while he makes the sign) -> a 64 x 64 pixel picture in the style of a 16 bit game (28 colours, no smooth shading, a dark line where the picture changes sharply)
#   sukuna_domain_ref2_shrine.jpg   (the Malevolent Shrine: a roof of horns over two mouths, in a ring of skulls) -> pixel pictures of it on a see-through background in SIX SIZES (128 to 248 pixels tall, one under the other in one sheet, all with the same 64 colours and a dark line round them):
#                                   the game picks the biggest one that fits the height of the screen, so that the shrine fills it (the grey background of the reference is cut away by growing it in from the edges over pixels that are grey and change smoothly, so the dark blue-grey roof and horns stay).
# Both are palette PNGs (colour 0 = see-through) that build_html.py embeds (__SUKPORT__, __SUKSHR__); the sizes of the six pictures and where they are in the sheet are printed: they are SU_SHR_LOD in sukuna.js.
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

def shrine_cut():
    """the shrine cut out of its grey background: (the enhanced colours of the cropped picture, its mask as 0 / 1 floats)"""
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
    return im, fg, (x0, x1, y0, y1)

def shrine_at(cut, height):
    """the shrine as a pixel picture `height` pixels tall including its dark line: (colours, alpha) before the common palette is made"""
    im, fg, (x0, x1, y0, y1) = cut; h0, w0 = y1 - y0, x1 - x0; hh = height - 2; width = round(w0 * hh / h0); f = w0 / width      # (f: how many pixels of the reference become one)
    e = ImageEnhance.Contrast(ImageEnhance.Color(im).enhance(1.45)).enhance(1.25).filter(ImageFilter.UnsharpMask(radius=max(1.0, 0.8 * f), percent=160, threshold=2))      # (richer colours and sharper edges, or the roof, the teeth and the skulls melt into each other at this size)
    crop = np.asarray(e).astype(float)[y0:y1, x0:x1]; m = fg[y0:y1, x0:x1].astype(float)
    pre = Image.fromarray((crop * m[..., None]).astype(np.uint8)).resize((width, hh), Image.BOX); ma = np.asarray(Image.fromarray((m * 255).astype(np.uint8)).resize((width, hh), Image.BOX)).astype(float) / 255
    avg = np.clip(np.asarray(pre).astype(float) / np.maximum(ma[..., None], .02), 0, 255); alpha = ma >= .5
    work = Image.fromarray(np.where(alpha[..., None], avg, avg[alpha].mean(0)).astype(np.uint8)).filter(ImageFilter.UnsharpMask(radius=1, percent=60, threshold=1))
    return np.asarray(work).copy(), alpha

LODS = (128, 152, 176, 200, 224, 248)                           # the heights of the six pictures of the shrine (the game picks the biggest that fits the screen's height)
def shrine_sheet(ncol=64):
    """all six sizes one under the other (each centred in the sheet's width) with ONE palette of ncol colours (+ the dark line): (colours, alpha, [[height, width, y of its first row, x of its first column], ...])"""
    cut = shrine_cut(); parts = [shrine_at(cut, h) for h in LODS]; W = max(p[1].shape[1] for p in parts) + 2; Ht = sum(h for h in LODS)
    rgb = np.zeros((Ht, W, 3), np.uint8); alpha = np.zeros((Ht, W), bool); lay = []; y = 0
    fill = np.concatenate([p[0][p[1]] for p in parts]).mean(0)      # (the colour that stands for 'nothing' while the palette is made, so that no colour is spent on it)
    for h, (c, a) in zip(LODS, parts):
        w = a.shape[1]; x = (W - (w + 2)) // 2 + 1; sub = np.where(a[..., None], c, fill).astype(np.uint8); rgb[y + 1:y + 1 + a.shape[0], x:x + w] = sub; alpha[y + 1:y + 1 + a.shape[0], x:x + w] = a; lay.append([h, w + 2, y, x - 1]); y += h
    fillimg = np.where(alpha[..., None], rgb, fill.astype(np.uint8)).astype(np.uint8)
    q = np.asarray(Image.fromarray(fillimg).quantize(colors=ncol, method=Image.Quantize.MEDIANCUT, dither=Image.Dither.NONE).convert('RGB')).copy()
    for (h, w, y0, x0) in lay:                                  # the dark line round each picture (inside its own rows, one pixel wide)
        sl = (slice(y0, y0 + h), slice(x0, x0 + w)); A = alpha[sl]; ring = ndi.binary_dilation(A, structure=ndi.generate_binary_structure(2, 1)) & ~A; Q = q[sl]; Q[ring] = INK; alpha[sl] = A | ring
    return q, alpha, lay

def preview(rgb, alpha, path, S, bg=(18, 19, 31)):
    h, w = alpha.shape; im = Image.new('RGB', (w, h), bg); src = Image.fromarray(rgb); im.paste(src, (0, 0), Image.fromarray((alpha * 255).astype(np.uint8))); im.resize((w * S, h * S), Image.NEAREST).save(path)

if __name__ == '__main__':
    q, a = portrait(); n1 = to_palette_png(q, a, os.path.join(HERE, 'sukuna_portrait.png'), 28); Q, A, lay = shrine_sheet(); n2 = to_palette_png(Q, A, os.path.join(HERE, 'sukuna_shrines.png'), 64)
    print('wrote sukuna_portrait.png 64 x 64,', n1, 'colours; sukuna_shrines.png', A.shape[1], 'x', A.shape[0], ',', n2, 'colours'); print('SU_SHR_LOD =', lay)
    if '--preview' in sys.argv:
        out = sys.argv[sys.argv.index('--preview') + 1]; os.makedirs(out, exist_ok=True); preview(q, a, os.path.join(out, 'portrait_x8.png'), 8); preview(Q, A, os.path.join(out, 'shrines_x2.png'), 2)
        for i, (h, w, y0, x0) in enumerate(lay): preview(Q[y0:y0 + h, x0:x0 + w], A[y0:y0 + h, x0:x0 + w], os.path.join(out, 'shrine_%d.png' % h), 3)
