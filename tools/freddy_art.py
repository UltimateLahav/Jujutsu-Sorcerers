"""FREDDY KRUEGER, the 16-bit fighter (v1.39): turns freddy_ref.jpg (the picture the game's author gave: a full-length photo on a checkerboard) into freddy_sheet.png, 15 idle frames of 64 x 64 pixels side by side (960 x 64), 16 colours, facing right like every fighter.
Run from tools/:  python3 freddy_art.py   (needs numpy, scipy, pillow). Steps: cut him out of the checkerboard (15 px squares, rows offset by 2) -> stocky 16-bit proportions (big head, short legs: three bands resized separately) -> the 16-colour palette below -> hand-drawn details (hat band, shadowed eyes, burn scars, the glove and its four blades) -> a 1 px outline -> flip -> 15 frames of idle (breathing, sway, hat, claw, a glint that runs up the blades)."""
import numpy as np
from PIL import Image, ImageEnhance
from scipy import ndimage as ndi
PAL = ['#120e18', '#35221a', '#5a3a28', '#7a4234', '#b87c58', '#dca878', '#6a1220', '#b01c2c', '#de4452', '#1c2a22', '#34503a', '#8a6a3c', '#c4c8d8', '#ffffff', '#1a1620', '#34303e']
OL, HAT, BAND, SK0, SK1, SK2, R0, R1, R2, G0, G1, GLV, BLD, GLT, PNT, PN2 = range(16)
P = np.array([[int(h[i:i + 2], 16) for i in (1, 3, 5)] for h in PAL], float)
def cutout():
    im = np.asarray(Image.open('freddy_ref.jpg').convert('RGB')).astype(int); H, W = im.shape[:2]; yy, xx = np.mgrid[0:H, 0:W]
    model = np.where(((xx // 15) + ((yy + 2) // 15)) % 2 == 0, 255, 204)
    neutral = (np.abs(im[:, :, 0] - im[:, :, 1]) < 9) & (np.abs(im[:, :, 1] - im[:, :, 2]) < 9)
    bg = neutral & (np.abs(im.mean(axis=2) - model) < 20)
    lab, n = ndi.label(bg); big = np.isin(lab, [i + 1 for i, s in enumerate(ndi.sum(bg, lab, range(1, n + 1))) if s >= 60])
    fg = ~big; lab, n = ndi.label(fg); main = lab == (1 + int(np.argmax(ndi.sum(fg, lab, range(1, n + 1)))))
    g = im.mean(axis=2); sat = im.max(axis=2) - im.min(axis=2)
    main &= ~((np.arange(H)[:, None] > H - 90) & (g > 70) & (sat < 26))      # the floor shadow
    main = ndi.binary_opening(main, iterations=2); lab, n = ndi.label(main); main = lab == (1 + int(np.argmax(ndi.sum(main, lab, range(1, n + 1)))))
    return im, ndi.binary_erosion(main, iterations=1)
def base():
    im, mask = cutout(); H, W = mask.shape
    img = Image.fromarray(np.uint8(im)); img = ImageEnhance.Contrast(ImageEnhance.Color(img).enhance(1.4)).enhance(1.2); rgb = np.asarray(img).astype(float)
    ys, xs = np.where(mask); Y0, Y1 = ys.min(), ys.max() + 1
    BANDS = [(Y0, Y0 + 196, 15, 1.0), (Y0 + 196, Y0 + 566, 19, 1.25), (Y0 + 566, Y1, 24, 1.3)]      # source rows, target rows, horizontal boost
    CW = 64; canvas = np.zeros((64, CW, 3)); cop = np.zeros((64, CW), bool); ty = 2; MAP = []
    for (a, b, th, hb) in BANDS:
        m = mask[a:b]; cx = (m * np.arange(W)[None, :]).sum() / max(m.sum(), 1); sc = th / (b - a); sx = sc * hb
        L = max(int(cx - CW / 2 / sx), 0); R = min(int(cx + CW / 2 / sx), W); sub = (rgb[a:b] * m[:, :, None])[:, L:R]; subm = m[:, L:R].astype(float)
        tw = int(round((R - L) * sx)); ri = np.asarray(Image.fromarray(np.uint8(np.clip(sub, 0, 255))).resize((tw, th), Image.LANCZOS)).astype(float)
        rm = np.asarray(Image.fromarray(np.uint8(subm * 255)).resize((tw, th), Image.LANCZOS)).astype(float) / 255; ox = int(round(CW / 2 - (cx - L) * sx))
        for yy in range(th):
            for xx in range(tw):
                X = ox + xx
                if 0 <= X < CW and rm[yy, xx] > 0.5: canvas[ty + yy, X] = ri[yy, xx] / max(rm[yy, xx], 0.01); cop[ty + yy, X] = True
        MAP.append((a, b, ty, th, sx, cx, L, ox)); ty += th
    d = (((canvas[:, :, None, :] - P[None, None, :, :]) ** 2) * np.array([0.3, 0.59, 0.11])).sum(axis=3); idx = d.argmin(axis=2); idx[~cop] = -1
    idx[(idx == BLD) | (idx == GLT)] = SK2      # (no stray silver from the photo: the blades are drawn below)
    return idx, MAP
def details(idx):
    G = idx.copy(); ys, xs = np.where(G >= 0)
    # the hat: a lighter band round the crown and a highlight on the brim
    top = ys.min(); hat_rows = [r for r in range(top, top + 9) if (G[r] == HAT).any() or (G[r] == OL).any()]
    for r in range(top + 4, top + 6):
        for x in range(64):
            if G[r, x] in (HAT, OL) and 22 <= x <= 40: G[r, x] = BAND
    # the face: find the skin block, shade the eye line under the brim and scatter burn scars
    sk = np.isin(G, (SK0, SK1, SK2)); fy, fx = np.where(sk[:22]); 
    if len(fy):
        y0, y1, x0, x1 = fy.min(), fy.max(), fx.min(), fx.max()
        for x in range(x0, x1 + 1):
            if sk[y0, x]: G[y0, x] = SK0                       # the brim's shadow over the eyes
        ey = y0 + 2
        for x in (x0 + 2, x1 - 3):
            if 0 <= ey < 64 and sk[ey, x]: G[ey, x] = OL      # the eyes
            if sk[ey - 1, x] if ey - 1 >= 0 else False: G[ey - 1, x] = SK0
        for (dy, dx) in ((3, 1), (4, 4), (5, 2), (2, 5), (6, 3), (4, 0), (3, 6)):
            y, x = y0 + dy, x0 + dx
            if y <= y1 and x <= x1 and sk[y, x] and G[y, x] != OL: G[y, x] = SK0      # burn scars
        my = min(y1, y0 + 6)
        for x in range(x0 + 2, x1 - 1):
            if sk[my, x]: G[my, x] = SK0                       # the mouth
    return G
def outline(G):
    out = G.copy(); op = G >= 0; edge = ndi.binary_dilation(op, structure=np.ones((3, 3))) & ~op
    out[edge] = OL; return out
BLADES = [(0, 7), (2, 9), (4, 8)]      # the three blades that show of the glove: (how far right of the knuckles, how long); they fan out to the right
def glove(G, gx, gy):
    """the leather glove: a block of 5 x 3 pixels at the knuckles gx, gy (it covers the sleeve's end)"""
    for dy in range(0, 3):
        for dx in range(-2, 3):
            y, x = gy + dy, gx + dx
            if 0 <= y < 64 and 0 <= x < 64 and (G[y, x] < 0 or G[y, x] in (SK1, SK2, SK0, R0, R1, R2)): G[y, x] = GLV
def make():
    idx, MAP = base()
    mp = lambda x, y: [(ox + (x - L) * sx, ty0 + (y - a) * (th / (b - a))) for (a, b, ty0, th, sx, cx, L, ox) in MAP if a <= y < b][0]
    gxy = mp(268, 215); gx, gy = 63 - int(round(gxy[0])), int(round(gxy[1]))
    G = details(idx)[:, ::-1].copy()      # he faces right
    glove(G, gx, gy); G = outline(G)
    pn = (G == PNT); left = np.zeros_like(pn); left[:, 1:] = (G[:, :-1] < 0) | (G[:, :-1] == OL); G[pn & left] = PN2      # a rim light on the trousers
    ys, xs = np.where(G >= 0); print('figure', xs.min(), xs.max(), ys.min(), ys.max(), 'knuckles', gx, gy)
    return G, gx, gy
def frames(G, gx, gy):
    FR = []; ys, xs = np.where(G >= 0); top = ys.min(); bot = ys.max()
    for t in range(15):
        ph = 2 * np.pi * t / 15; Gt = G.copy()
        sh = int(round(0.9 * np.sin(2 * ph + 1.3)))
        pix = []
        for i, (dx, ln) in enumerate(BLADES):
            for k in range(ln):
                x = gx + dx + (k + 1) // 2 + (sh if k > 2 else 0); y = gy - 1 - k
                if 0 <= y < 64 and 0 <= x < 64: Gt[y, x] = BLD; pix.append((y, x, i, k))
        if t < 11:      # a glint runs up the second blade, then he rests
            run = sorted([p for p in pix if p[2] == 1], key=lambda p: p[3]); k = (t * 3) % max(1, len(run))
            for j in (k, k + 1):
                if j < len(run): Gt[run[j][0], run[j][1]] = GLT
        out = -np.ones((64, 64), int)
        for r in range(64):
            w = max(0, min(1, (top + 38 - r) / 37.0)); src = int(round(r + 1.2 * np.sin(ph) * w))      # breathing: the upper body stretches a little
            sw = max(0, min(1, (bot - r) / float(bot - top))) ** 1.6; dx = int(round(1.1 * np.sin(ph + 0.9) * sw)) + (int(round(0.7 * np.sin(ph + 2.2))) if r < top + 9 else 0)      # sway, and the hat tips
            if 0 <= src < 64:
                for x in range(64):
                    v = Gt[src, x]
                    if v >= 0 and 0 <= x + dx < 64: out[r, x + dx] = v
        FR.append(out)
    return FR
def sheet(FR):
    A = np.zeros((64, 64 * len(FR), 4), np.uint8)
    for i, f in enumerate(FR):
        for c in range(16): A[:, i * 64:(i + 1) * 64][f == c] = list(P[c].astype(int)) + [255]
    Image.fromarray(A).save('freddy_sheet.png'); return A
if __name__ == '__main__':
    G, gx, gy = make(); FR = frames(G, gx, gy); A = sheet(FR)
    # a contact sheet to look at: 5 x 3 frames, x3
    cs = np.zeros((64 * 3, 64 * 5, 4), np.uint8); cs[:] = [40, 36, 52, 255]
    for i, f in enumerate(FR):
        blk = A[:, i * 64:(i + 1) * 64]; r, c = divmod(i, 5); m = blk[:, :, 3] > 0; cs[r * 64:(r + 1) * 64, c * 64:(c + 1) * 64][m] = blk[m]
    Image.fromarray(cs).resize((cs.shape[1] * 3, cs.shape[0] * 3), Image.NEAREST).save('freddy_contact.png'); print('sheet', A.shape)
