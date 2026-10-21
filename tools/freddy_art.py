"""FREDDY KRUEGER, the 16-bit fighter (v1.39): turns freddy_ref.jpg (the picture the game's author gave: a full-length photo on a checkerboard) into freddy_sheet.png, 15 idle frames of 64 x 64 pixels side by side (960 x 64), 16 colours, facing right like every fighter.
Run from tools/:  python3 freddy_art.py   (needs numpy, scipy, pillow). v1.40: the sheet has a second row, the 15-frame WALK (and, v1.41, rows 3 to 5: the 40-frame JUMP, 20 jumping + 20 landing): the legs are drawn from scratch with two-bone inverse kinematics (a foot on the ground moves back at the body's speed, so it never slides; the swinging foot only rises 2.6 px: an elegant glide), the upper body leans and sways, and the standing figure uses the same legs. Steps: cut him out of the checkerboard (15 px squares, rows offset by 2) -> stocky 16-bit proportions (big head, short legs: three bands resized separately) -> the 16-colour palette below -> hand-drawn details (hat band, shadowed eyes, burn scars, the glove and its four blades) -> a 1 px outline -> flip -> 15 frames of idle (breathing, sway, hat, claw, a glint that runs up the blades)."""
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
CACHE = {}
BLADES = [(0, 7), (2, 9), (4, 8)]      # the three blades that show of the glove: (how far right of the knuckles, how long); they fan out to the right
def glove(G, gx, gy):
    """the leather glove: a block of 5 x 3 pixels at the knuckles gx, gy (it covers the sleeve's end)"""
    for dy in range(0, 3):
        for dx in range(-2, 3):
            y, x = gy + dy, gx + dx
            if 0 <= y < 64 and 0 <= x < 64 and (G[y, x] < 0 or G[y, x] in (SK1, SK2, SK0, R0, R1, R2)): G[y, x] = GLV
def upper():
    """the upper body without legs, facing right: (picture, the first row of the legs, the column of the hips, the knuckles gx, gy)"""
    idx, MAP = base()
    mp = lambda x, y: [(ox + (x - L) * sx, ty0 + (y - a) * (th / (b - a))) for (a, b, ty0, th, sx, cx, L, ox) in MAP if a <= y < b][0]
    gxy = mp(268, 215); gx, gy = 63 - int(round(gxy[0])), int(round(gxy[1]))
    G = details(idx); sw = np.isin(G, (R0, R1, R2, G0, G1)); RH = int(np.where(sw.any(axis=1))[0].max()) + 1      # the sweater's hem: the legs start below it
    pr = np.where(np.isin(G[RH:RH + 5], (PNT, PN2)))[1]; hx = 63 - (float(pr.mean()) if len(pr) else 32.0)
    U = G.copy(); U[RH:] = -1; U = U[:, ::-1].copy()      # he faces right
    CACHE['U0'] = U.copy()      # (without the glove: the jump moves the claw arm on its own)
    glove(U, gx, gy)
    return U, RH, hx, gx, gy
L1, L2 = 12.2, 12.3      # thigh and shin (px)
def ik(hx, hy, ax, ay):
    """the knee of a leg whose hip is at hx, hy and whose ankle is at ax, ay (two bones; the knee points forward, to the right)"""
    dx, dy = ax - hx, ay - hy; d = min(np.hypot(dx, dy), L1 + L2 - 0.05); b = np.arctan2(dy, dx)
    a = np.arccos(np.clip((L1 * L1 + d * d - L2 * L2) / (2 * L1 * d), -1, 1))
    return max([(hx + L1 * np.cos(b + s * a), hy + L1 * np.sin(b + s * a)) for s in (1, -1)], key=lambda p: p[0])
def stroke(F, p, q, w0, w1, col):
    n = int(max(abs(q[0] - p[0]), abs(q[1] - p[1])) * 2) + 1
    for i in range(n + 1):
        t = i / n; x = p[0] + (q[0] - p[0]) * t; y = p[1] + (q[1] - p[1]) * t; w = w0 + (w1 - w0) * t; wi = max(1, int(round(w))); x0 = int(round(x - w / 2)); y0 = int(round(y - w / 2))
        for yy in range(y0, y0 + wi):
            for xx in range(x0, x0 + wi):
                if 0 <= yy < 64 and 0 <= xx < 64: F[yy, xx] = col
def leg(F, hx, hy, fx, fy, col):
    """one leg drawn as thick strokes: from the hip hx, hy to the sole at fx, fy (the ankle is 2 px above it), with the shoe (6 x 3 px, the toe to the right)"""
    ax, ay = fx - 1.0, fy - 2.0; k = ik(hx, hy, ax, ay)
    stroke(F, (hx, hy), k, 5, 4, col); stroke(F, k, (ax, ay), 4, 3, col)
    y1 = int(round(fy)); x0 = int(round(fx - 2)); x1 = int(round(fx + 3))
    for yy in range(y1 - 2, y1 + 1):
        for xx in range(x0, x1 + 1):
            if 0 <= yy < 64 and 0 <= xx < 64: F[yy, xx] = col
GROUND = 59
def put_upper(F, U, RH, dy, lean):
    """the upper body over the legs, moved down by dy and leaning: lean(row) = how far right a row is moved"""
    for r in range(64):
        sr = r - dy
        if 0 <= sr < 64:
            dx = int(round(lean(sr)))
            for x in range(64):
                v = U[sr, x]
                if v >= 0 and 0 <= x + dx < 64: F[r, x + dx] = v
def finish(F):
    G = outline(F); pn = (G == PNT); left = np.zeros_like(pn); left[:, 1:] = (G[:, :-1] < 0) | (G[:, :-1] == OL); G[pn & left] = PN2      # a rim light on the trousers
    return G
def rest_figure(U, RH, hx):
    """the standing figure: the legs at rest (both feet planted, a relaxed stance) under the upper body"""
    F = -np.ones((64, 64), int); hy = GROUND - 23.0
    leg(F, hx + 1, hy, hx + 3.0, GROUND, OL); leg(F, hx - 1, hy, hx - 1.5, GROUND, PNT)
    put_upper(F, U, RH, 0, lambda r: 0); return finish(F)
STEP = 15.0; DUTY = 0.62; LIFT = 2.6      # the walk: a step is 15 px long, a foot is on the ground for 62% of the cycle (two feet for 24%), the swinging foot rises only 2.6 px: a glide, not a march
def foot_at(u):
    """where a foot is (forward of the hip, height above the ground) at the cycle position u (0 = it has just touched down): on the ground it moves back at the body's speed (it never slides), then it swings forward and eases in and out"""
    if u < DUTY: return STEP / 2 - STEP * (u / DUTY), 0.0
    s = (u - DUTY) / (1 - DUTY); e = s - np.sin(2 * np.pi * s) / (2 * np.pi); return -STEP / 2 + STEP * e, LIFT * np.sin(np.pi * s)
def walk_frames(U, RH, hx, gx, gy):
    FR = []
    for k in range(15):
        ph = k / 15.0; h = 22.3 + 0.5 * np.cos(2 * np.pi * (k - 4.65) / 7.5); hy = GROUND - h      # the pelvis is highest in mid-stance, lowest when a foot touches down
        F = -np.ones((64, 64), int)
        xf, lf = foot_at((ph + 0.5) % 1.0); leg(F, hx + 1, hy, hx + xf, GROUND - lf, OL)      # the far leg (darker)
        xn, ln = foot_at(ph % 1.0); leg(F, hx - 1, hy, hx + xn, GROUND - ln, PNT)      # the near leg
        sway = 0.8 * np.sin(2 * np.pi * ph); dy = int(round(23.0 - h))
        put_upper(F, U, RH, dy, lambda r: (1.0 + sway) * max(0.0, (RH - r) / float(RH)))      # he leans into the stride a little and sways
        G = finish(F)
        sh = int(round(0.8 * np.sin(4 * np.pi * ph + 1.0)))      # the blades lag a little behind
        for i, (dx, ln_) in enumerate(BLADES):
            for j in range(ln_):
                x = gx + dx + (j + 1) // 2 + (sh if j > 2 else 0) + int(round((1.0 + sway) * max(0.0, (RH - gy) / float(RH)))); y = gy - 1 - j + dy
                if 0 <= y < 64 and 0 <= x < 64: G[y, x] = BLD
        FR.append(G)
    return FR
# THE JUMP (v1.41): 40 frames over the whole jump (crouch 160 ms + flight 713 ms + landing 160 ms = 1033 ms, 38.7 frames a second): frames 0-19 jump (the squat, the push-off, the take-off at frame 6, the rise and the tuck at the top), frames 20-39 land (the fall, legs reaching for the ground, the touch-down at frame 34, the knees absorbing, standing up). Key poses, smoothly blended: (frame, hip row, row of the lowest point of the feet, forward reach of the near foot and of the far foot, toe angle (0 flat, 70 pointed down), forward lean of the head, claw arm swing x and y)
KEYS = [(0, 36.0, 59.0, -1.5, 3.0, 0, 0.5, 0, 0), (3, 43.5, 59.0, -1.0, 4.0, 0, 4.0, -2, 4), (5, 38.0, 59.0, -0.5, 3.0, 20, 2.0, 0, 0), (6, 33.5, 59.0, -0.5, 2.5, 45, 1.0, 1, -4), (12, 34.5, 57.0, 1.0, 3.5, 55, 1.0, 1, -3), (19, 36.0, 51.0, 4.5, 7.5, 70, 0.0, 2, -5),
        (26, 35.0, 54.0, 2.5, 5.0, 60, 1.0, 1, -3), (33, 33.5, 59.5, 0.5, 3.0, 45, 1.5, 0, -2), (35, 37.5, 59.0, -0.5, 3.5, 20, 2.5, 0, 2), (37, 43.5, 59.0, -1.0, 4.0, 0, 4.0, -1, 4), (39, 36.6, 59.0, -1.5, 3.0, 0, 0.9, 0, 1)]      # (the last picture is not quite upright yet: he settles into his idle)
def pose(k):
    for a, b in zip(KEYS, KEYS[1:]):
        if a[0] <= k <= b[0]:
            t = (k - a[0]) / float(b[0] - a[0]); t = t * t * (3 - 2 * t); return [a[i] + (b[i] - a[i]) * t for i in range(1, 9)]
def leg2(F, hx, hy, fx, fy, col, ang):
    """a leg for the jump: fy is the lowest row of the foot, ang the angle of the foot (0 = flat on the ground, 70 = the toes pointed down)"""
    if ang < 12: ax, ay = fx - 1.0, fy - 2.0
    else: ax, ay = fx - 1.0, fy - 1.0 - 5 * np.sin(np.radians(ang))
    kx, ky = ik(hx, hy, ax, ay); stroke(F, (hx, hy), (kx, ky), 5, 4, col); stroke(F, (kx, ky), (ax, ay), 4, 3, col)
    if ang < 12:
        y1 = int(round(fy)); x0 = int(round(fx - 2)); x1 = int(round(fx + 3))
        for yy in range(y1 - 2, y1 + 1):
            for xx in range(x0, x1 + 1):
                if 0 <= yy < 64 and 0 <= xx < 64: F[yy, xx] = col
    else:
        a = np.radians(ang); stroke(F, (ax - 1, ay + 0.5), (ax - 1 + 5 * np.cos(a), ay + 0.5 + 5 * np.sin(a)), 3, 3, col)
def jump_frames(RH, hx, gx, gy):
    U0 = CACHE['U0']; FR = []
    for k in range(40):
        hipY, footY, xn, xf, ang, lean, cdx, cdy = pose(k); F = -np.ones((64, 64), int)
        leg2(F, hx + 1, hipY, hx + xf, footY, OL, ang); leg2(F, hx - 1, hipY, hx + xn, footY, PNT, ang)      # the far leg (darker), the near leg
        dy = int(round(hipY - 36.0)); ln = lambda r: lean * max(0.0, (RH - r) / float(RH)) ** 1.2
        put_upper(F, U0, RH, dy, ln)
        cx0 = int(round(gx + cdx + ln(gy))); cy0 = int(round(gy + cdy + dy))      # the claw arm: a forearm from the sleeve to the glove, which swings on its own
        stroke(F, (gx - 2 + int(round(ln(gy + 6))), gy + 6 + dy), (cx0, cy0 + 1), 3, 3, R0)
        for yy in range(cy0, cy0 + 3):
            for xx in range(cx0 - 2, cx0 + 3):
                if 0 <= yy < 64 and 0 <= xx < 64: F[yy, xx] = GLV
        G = finish(F)
        sh = int(round(0.8 * np.sin(2 * np.pi * k / 13.0)))
        for i, (dx, ln_) in enumerate(BLADES):
            for j in range(ln_):
                x = cx0 + dx + (j + 1) // 2 + (sh if j > 2 else 0); y = cy0 - 1 - j
                if 0 <= y < 64 and 0 <= x < 64: G[y, x] = BLD
        FR.append(G)
    return FR
def make():
    U, RH, hx, gx, gy = upper(); G = rest_figure(U, RH, hx)
    ys, xs = np.where(G >= 0); print('figure', xs.min(), xs.max(), ys.min(), ys.max(), 'knuckles', gx, gy, 'hem', RH, 'hips', round(hx, 1))
    return G, gx, gy, (U, RH, hx)
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
def sheet(FR, FW, FJ):
    A = np.zeros((320, 64 * 15, 4), np.uint8)      # row 0: the idle, row 1: the walk, rows 2-4: the jump (frames 0-14, 15-29, 30-39)
    def put(f, r, c):
        for v in range(16): A[r * 64:(r + 1) * 64, c * 64:(c + 1) * 64][f == v] = list(P[v].astype(int)) + [255]
    for i, f in enumerate(FR): put(f, 0, i)
    for i, f in enumerate(FW): put(f, 1, i)
    for i, f in enumerate(FJ): put(f, 2 + i // 15, i % 15)
    Image.fromarray(A).save('freddy_sheet.png'); return A
if __name__ == '__main__':
    G, gx, gy, parts = make(); FR = frames(G, gx, gy); FW = walk_frames(*parts, gx, gy); FJ = jump_frames(parts[1], parts[2], gx, gy); A = sheet(FR, FW, FJ)
    # a contact sheet to look at: the jump, 8 x 5 frames, x2
    cs = np.zeros((64 * 5, 64 * 8, 4), np.uint8); cs[:] = [120, 116, 132, 255]
    for i in range(40):
        blk = A[(2 + i // 15) * 64:(3 + i // 15) * 64, (i % 15) * 64:(i % 15 + 1) * 64]; r, c = divmod(i, 8); m = blk[:, :, 3] > 0; cs[r * 64:(r + 1) * 64, c * 64:(c + 1) * 64][m] = blk[m]
    Image.fromarray(cs).resize((cs.shape[1] * 2, cs.shape[0] * 2), Image.NEAREST).save('freddy_contact.png'); print('sheet', A.shape)
