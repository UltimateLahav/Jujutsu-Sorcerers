"""FREDDY KRUEGER, the 16-bit fighter (v1.39): turns freddy_ref.jpg (the picture the game's author gave: a full-length photo on a checkerboard) into freddy_sheet.png, 15 idle frames of 64 x 64 pixels side by side (960 x 64), 16 colours, facing right like every fighter.
Run from tools/:  python3 freddy_art.py   (needs numpy, scipy, pillow). v1.42: the body is a PUPPET: the head (with the hat) and the torso are cut out of the picture and turned about the neck and the hips (a real rotation, redrawn clean at 4 times the size), the two arms are drawn from scratch as chains of two bones with striped, shaded sleeves, and the same figure is used for the idle, the walk and the jump, so in the jump he leans into the squat, throws his arms up, tucks, stretches and lands, instead of sliding one rigid block about. v1.40: the sheet has a second row, the 15-frame WALK (and, v1.41, rows 3 to 5: the 40-frame JUMP, 20 jumping + 20 landing): the legs are drawn from scratch with two-bone inverse kinematics (a foot on the ground moves back at the body's speed, so it never slides; the swinging foot only rises 2.6 px: an elegant glide), the upper body leans and sways, and the standing figure uses the same legs. Steps: cut him out of the checkerboard (15 px squares, rows offset by 2) -> stocky 16-bit proportions (big head, short legs: three bands resized separately) -> the 16-colour palette below -> hand-drawn details (hat band, shadowed eyes, burn scars, the glove and its four blades) -> a 1 px outline -> flip -> 15 frames of idle (breathing, sway, hat, claw, a glint that runs up the blades)."""
import numpy as np
from PIL import Image, ImageEnhance
from scipy import ndimage as ndi
PAL = ['#120e18', '#35221a', '#5a3a28', '#7a4234', '#b87c58', '#dca878', '#6a1220', '#b01c2c', '#de4452', '#1c2a22', '#34503a', '#8a6a3c', '#c4c8d8', '#ffffff', '#2a2634', '#4a4660']
OL, HAT, BAND, SK0, SK1, SK2, R0, R1, R2, G0, G1, GLV, BLD, GLT, PNT, PN2 = range(16)
P = np.array([[int(h[i:i + 2], 16) for i in (1, 3, 5)] for h in PAL], float)
PHOTO = PAL[:14] + ['#1a1620', '#34303e']      # the picture made from the photograph is matched to the palette it was drawn for (the trousers were darker before v1.43); its few dark details are then moved to the nearest colours of the new palette
PP = np.array([[int(h[i:i + 2], 16) for i in (1, 3, 5)] for h in PHOTO], float)
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
    d = (((canvas[:, :, None, :] - PP[None, None, :, :]) ** 2) * np.array([0.3, 0.59, 0.11])).sum(axis=3); idx = d.argmin(axis=2); idx[~cop] = -1
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
def upper():
    """the upper body without legs, facing right: (picture, the first row of the legs, the column of the hips, the knuckles gx, gy)"""
    idx, MAP = base()
    mp = lambda x, y: [(ox + (x - L) * sx, ty0 + (y - a) * (th / (b - a))) for (a, b, ty0, th, sx, cx, L, ox) in MAP if a <= y < b][0]
    gxy = mp(268, 215); gx, gy = 63 - int(round(gxy[0])), int(round(gxy[1]))
    G = details(idx); sw = np.isin(G, (R0, R1, R2, G0, G1)); RH = int(np.where(sw.any(axis=1))[0].max()) + 1      # the sweater's hem: the legs start below it
    pr = np.where(np.isin(G[RH:RH + 5], (PNT, PN2)))[1]; hx = 63 - (float(pr.mean()) if len(pr) else 32.0)
    U = G.copy(); U[RH:] = -1; U = U[:, ::-1].copy()      # he faces right
    U[U == PNT] = OL; U[U == PN2] = PNT      # (the dark details of the photo: the old trouser colours were within 10 levels of these two)
    CACHE['U0'] = U.copy()      # (the puppet cuts the head and the torso out of this picture; the arms and the glove are drawn on their own)
    return U, RH, hx, gx, gy
L1, L2 = 11.4, 11.6      # thigh and shin (px): 23 in all, so that a standing leg is only a little bent (v1.43; it was 24.5, a leg with a deep zigzag)
REACH = [0.0]      # the farthest an ankle was from its hip: a leg must never be asked to reach farther than it is long
def ik(hx, hy, ax, ay):
    """the knee of a leg whose hip is at hx, hy and whose ankle is at ax, ay (two bones; the knee points forward, to the right)"""
    dx, dy = ax - hx, ay - hy; REACH[0] = max(REACH[0], np.hypot(dx, dy)); d = min(np.hypot(dx, dy), L1 + L2 - 0.05); b = np.arctan2(dy, dx)
    a = np.arccos(np.clip((L1 * L1 + d * d - L2 * L2) / (2 * L1 * d), -1, 1))
    return max([(hx + L1 * np.cos(b + s * a), hy + L1 * np.sin(b + s * a)) for s in (1, -1)], key=lambda p: p[0])
GROUND = 59
def finish(F):
    return outline(F)
STEP = 15.0; DUTY = 0.62; LIFT = 2.6      # the walk: a step is 15 px long, a foot is on the ground for 62% of the cycle (two feet for 24%), the swinging foot rises only 2.6 px: a glide, not a march
def foot_at(u):
    """where a foot is (forward of the hip, height above the ground) at the cycle position u (0 = it has just touched down): on the ground it moves back at the body's speed (it never slides), then it swings forward and eases in and out"""
    if u < DUTY: return STEP / 2 - STEP * (u / DUTY), 0.0
    s = (u - DUTY) / (1 - DUTY); e = s - np.sin(2 * np.pi * s) / (2 * np.pi); return -STEP / 2 + STEP * e, LIFT * np.sin(np.pi * s)
LT0, LT1, LS0, LS1, LC = 3.4, 2.9, 2.6, 2.1, 2.9      # how wide a leg is: the thigh at the hip and at the knee, the shin at the knee and at the ankle, the cuff of the trouser leg (a thin leg: v1.43)
def shoe(F, fx, fy, ang, far, ax, ay):
    """the shoe: brown leather with a dark sole and (on the near foot) a lighter toe cap; flat on the ground when ang < 12, otherwise (the toes pointed down in the air) a short stroke from the ankle"""
    if ang < 12:
        y1 = int(round(fy)); x0 = int(round(fx - 2)); x1 = int(round(fx + 3))
        for xx in range(x0, x1 + 1):
            for yy, c in ((y1 - 2, BAND if xx > x0 + 2 else -2), (y1 - 1, SK0 if (xx >= x1 - 1 and not far) else BAND), (y1, OL)):
                if c != -2 and 0 <= yy < 64 and 0 <= xx < 64: F[yy, xx] = c
    else:
        a = np.radians(ang); limbs(F, [((ax - 1, ay + 0.5), (ax - 1 + 5 * np.cos(a), ay + 0.5 + 5 * np.sin(a)), 3, 3, 1, 'shoe')], inner=True)
def leg3(F, hx, hy, fx, fy, ang, far):
    """a leg for every picture: fy is the lowest row of the foot, ang the angle of the foot (0 = flat on the ground, 70 = the toes pointed down): the trouser leg (the thigh, the shin and a cuff at the ankle) as shaded tubes with a dark line where it crosses the other leg, then the shoe"""
    if ang < 12: ax, ay = fx - 1.0, fy - 2.0
    else: ax, ay = fx - 1.0, fy - 1.0 - 5 * np.sin(np.radians(ang))
    kx, ky = ik(hx, hy, ax, ay); kind = 'far' if far else 'pants'
    limbs(F, [((hx, hy), (kx, ky), LT0, LT1, 1, kind), ((kx, ky), (ax, ay), LS0, LS1, 1, kind), ((ax, ay - 1.2), (ax, ay + 0.8), LC, LC, 1, kind)], inner=True); shoe(F, fx, fy, ang, far, ax, ay)
# ---------------------------------------------------------------- THE PUPPET (v1.42): the body is made of parts that move on their own, like a real body: the TORSO turns about the hips (he leans forward in the squat, arches back at the take-off, crunches at the top) and stretches a little when he breathes, the HEAD (with the hat) turns on the neck, the BACK ARM and the CLAW ARM are chains of two bones (upper arm, forearm) drawn from the shoulder, with striped sleeves, that swing up for the take-off, reach high at the top and come down to land, the legs are as before. The head and the torso are cut out of the picture made from the photograph; the arms and the legs are drawn from scratch.
S4 = 4
def mode_down(big, S=S4):
    H = big.shape[0] // S; b = big.reshape(H, S, H, S).transpose(0, 2, 1, 3).reshape(H, H, S * S)
    cnt = np.stack([(b == c).sum(axis=2) for c in range(16)]); out = cnt.argmax(axis=0); out[cnt.sum(axis=0) < 7] = -1; return out
def xform(piece, pivot, ang, trans=(0.0, 0.0), sy=1.0):
    """a picture (64 x 64 colour numbers, -1 = nothing) turned by ang degrees about pivot (clockwise: leaning forward is to the right), stretched sy times up and down about it, moved by trans: turned at 4 times the size and brought back by the commonest colour of every 4 x 4 block, so the edges stay clean"""
    H = 64 * S4; big = np.kron(piece, np.ones((S4, S4), int)); Y, X = np.mgrid[0:H, 0:H]
    xd = (X + 0.5) / S4 - trans[0] - pivot[0]; yd = (Y + 0.5) / S4 - trans[1] - pivot[1]; a = np.radians(-ang); c, s = np.cos(a), np.sin(a)
    xs = c * xd - s * yd + pivot[0]; ys = (s * xd + c * yd) / sy + pivot[1]; xi = np.floor(xs * S4).astype(int); yi = np.floor(ys * S4).astype(int)
    ok = (xi >= 0) & (xi < H) & (yi >= 0) & (yi < H); out = -np.ones((H, H), int); out[ok] = big[yi[ok], xi[ok]]; return mode_down(out)
def fpt(pt, pivot, ang, trans=(0.0, 0.0), sy=1.0):
    a = np.radians(ang); c, s = np.cos(a), np.sin(a); x, y = pt[0] - pivot[0], (pt[1] - pivot[1]) * sy
    return (c * x - s * y + pivot[0] + trans[0], s * x + c * y + pivot[1] + trans[1])
HX = 31.0; HEAD_PIV = (33.0, 17.0); TORSO_PIV = (31.0, 35.5); SB = (25.0, 21.0); SF = (37.0, 21.0); LB1, LB2, LF1, LF2 = 8.5, 9.5, 8.5, 10.0      # the neck, the hips, the back and the front shoulder, the lengths of the bones of the arms
def pieces():
    if 'U0' not in CACHE: upper()
    U0 = CACHE['U0']; head = -np.ones((64, 64), int); head[0:17, 22:42] = U0[0:17, 22:42]; torso = -np.ones((64, 64), int); torso[17:36, 26:38] = U0[17:36, 26:38]
    return head, torso
def two_bone(S, T, L1, L2, pick):
    """the elbow of an arm from the shoulder S to the hand T (the one of the two elbows that pick likes best) and where the hand really is (it cannot go farther than the arm is long)"""
    dx, dy = T[0] - S[0], T[1] - S[1]; r = max(np.hypot(dx, dy), 1e-6); d = max(0.5, min(r, L1 + L2 - 0.05)); b = np.arctan2(dy, dx)
    a = np.arccos(np.clip((L1 * L1 + d * d - L2 * L2) / (2 * L1 * d), -1, 1))
    E = max([(S[0] + L1 * np.cos(b + s * a), S[1] + L1 * np.sin(b + s * a)) for s in (1, -1)], key=pick)
    return E, (S[0] + dx / r * d, S[1] + dy / r * d)
Y64, X64 = np.mgrid[0:64, 0:64]
LEGS = ('pants', 'far', 'shoe')
def limbs(F, jobs, inner=False):
    """sleeves, gloves, hands, trouser legs and shoes, each from p to q (w0 wide at p, w1 wide at q; L = how long, for the stripes; kind): first all the dark rims, so a limb stands out from what is behind it, then the colours, lit from the top left: dark side, middle, light side. The sweater has stripes round the arm: two red, one dark green. The legs are lit across their width (a thin leg has a light edge, a body and a dark edge); the far leg is darker than the near one."""
    M = []
    for p, q, w0, w1, L, kind in jobs:
        dx, dy = q[0] - p[0], q[1] - p[1]; ll = max(dx * dx + dy * dy, 1e-6); px, py = X64 + 0.5, Y64 + 0.5
        t = np.clip(((px - p[0]) * dx + (py - p[1]) * dy) / ll, 0, 1); ex, ey = px - (p[0] + t * dx), py - (p[1] + t * dy); d = np.maximum(np.hypot(ex, ey), 1e-6); w = w0 + (w1 - w0) * t
        lit = -(ex + ey) * 0.7071 / (w / 2) if kind in LEGS else -(ex + ey) / d * 0.7071
        M.append((d <= w / 2 + 0.001, d <= w / 2 + 1.0, t, lit, L, kind))
    for m in M: F[m[1] & (F >= 0) if inner else m[1]] = OL      # (inner: only where something is behind the limb; the outer edge is drawn by the outline of the whole figure)
    for fill, rim, t, lit, L, kind in M:
        sh = np.where(lit > 0.45, 2, np.where(lit < -0.45, 0, 1)) if kind in LEGS else np.where(lit > 0.62, 2, np.where(lit < -0.3, 0, 1)); stripe = (np.floor(t * L / 3.0).astype(int) % 3 == 2)
        if kind == 'sleeve': c = np.where(stripe, np.array([G0, G0, G1])[sh], np.array([R0, R1, R2])[sh])
        elif kind == 'glove': c = np.array([BAND, GLV, GLV])[sh]
        elif kind == 'pants': c = np.array([OL, PNT, PN2])[sh]
        elif kind == 'far': c = np.array([OL, OL, PNT])[sh]
        elif kind == 'shoe': c = np.array([OL, BAND, SK0])[sh]
        else: c = np.array([SK0, SK1, SK2])[sh]
        F[fill] = c[fill]
def unit(v):
    r = max(np.hypot(v[0], v[1]), 1e-6); return (v[0] / r, v[1] / r)
CLIP = [0]
LAST = {}      # what the last render() drew: the tips of the three blades and the back hand (the slash trails follow them)
def blades(G, W, u, sh, glint):
    """the three blades of the glove, fanning out along the forearm (u points from the elbow to the glove), swaying sh px at the tips; a glint (white) at position glint of the middle blade"""
    v = (-u[1], u[0]); lens = (7, 9, 8); tips = []
    for i in range(3):
        o = (i - 1) * 1.8; p = (W[0] + u[0] * 2.0 + v[0] * o, W[1] + u[1] * 2.0 + v[1] * o); q = (p[0] + u[0] * lens[i] + v[0] * (i - 1) * 0.9 + sh * 0.5 * v[0], p[1] + u[1] * lens[i] + v[1] * (i - 1) * 0.9 + sh * 0.5 * v[1])
        tips.append(q); n = int(max(abs(q[0] - p[0]), abs(q[1] - p[1])) * 2) + 1
        for j in range(n + 1):
            t = j / n; x = int(round(p[0] + (q[0] - p[0]) * t)); y = int(round(p[1] + (q[1] - p[1]) * t))
            CLIP[0] += not (0 <= y < 64 and 0 <= x < 64)
            if 0 <= y < 64 and 0 <= x < 64: G[y, x] = GLT if (i == 1 and glint is not None and abs(t - glint) < 0.12) else BLD
    return tips
def streak(G, p, q, c):
    """a line of the slash trail from p to q in colour c (it only paints over empty pixels and the blades' own colour: the body stays in front)"""
    n = int(max(abs(q[0] - p[0]), abs(q[1] - p[1])) * 2) + 1
    for j in range(n + 1):
        t = j / n; x = int(round(p[0] + (q[0] - p[0]) * t)); y = int(round(p[1] + (q[1] - p[1]) * t))
        CLIP[0] += not (0 <= y < 64 and 0 <= x < 64)
        if 0 <= y < 64 and 0 <= x < 64 and (G[y, x] < 0 or G[y, x] in (BLD, GLT)): G[y, x] = c
def render(Pz):
    """one picture from a pose: hipY, legs ((x, y, toe angle) of the near and the far foot's lowest point, x from the hips), torso (turn in degrees, stretch), head (turn relative to the torso, dx, dy), hb (the back hand, from the back shoulder), gf (the glove, from the front shoulder), sway of the blades, glint"""
    HEAD, TORSO = pieces(); hy = Pz['hipY']; (fxn, fyn, an), (fxf, fyf, af) = Pz['legs']; F = -np.ones((64, 64), int)
    leg3(F, HX + 1, hy, HX + fxf, fyf, af, True); leg3(F, HX - 1, hy, HX + fxn, fyn, an, False)
    al, sy = Pz['torso']; tr = (0.0, hy - 36.0); T = xform(TORSO, TORSO_PIV, al, tr, sy); Np = fpt(HEAD_PIV, TORSO_PIV, al, tr, sy); bt, hdx, hdy = Pz['head']
    Hh = xform(HEAD, HEAD_PIV, al + bt, (Np[0] - HEAD_PIV[0] + hdx, Np[1] - HEAD_PIV[1] + hdy))
    HEADL = Hh
    Sb = fpt(SB, TORSO_PIV, al, tr, sy); Sf = fpt(SF, TORSO_PIV, al, tr, sy); hb = Pz['hb']; gf = Pz['gf']
    Eb, Wb = two_bone(Sb, (Sb[0] + hb[0], Sb[1] + hb[1]), LB1, LB2, lambda e: -e[0]); Ef, Wf = two_bone(Sf, (Sf[0] + gf[0], Sf[1] + gf[1]), LF1, LF2, lambda e: e[1])
    u0 = unit((Wf[0] - Ef[0], Wf[1] - Ef[1])); th = np.radians(Pz.get('wr', 14.0)); u = (u0[0] * np.cos(th) - u0[1] * np.sin(th), u0[0] * np.sin(th) + u0[1] * np.cos(th))      # (the blades lean wr degrees to the right of the forearm, 14 as a rule, more when the arm is up: the hand tips forward)
    LEGL = F; F = -np.ones((64, 64), int)      # the back arm is in front of the torso (behind it when bz is set: in a crouch it hangs down behind him) but behind the head, the claw arm in front of everything
    bz = int(Pz.get('bz') or 0); limbs(F, [(Sb, Eb, 5, 4.5, LB1, 'sleeve'), (Eb, Wb, 4.5, 3.5, LB2, 'sleeve')] + ([] if bz == 1 else [(Wb, Wb, 3, 3, 1, 'hand')])); BA = F.copy(); F = -np.ones((64, 64), int)
    if bz == 1: limbs(F, [(Wb, Wb, 3, 3, 1, 'hand')])      # (the hand stays in front of the body: it rests on his thigh)
    BH = F.copy(); F = -np.ones((64, 64), int)
    limbs(F, [(Sf, Ef, 5, 4.5, LF1, 'sleeve'), (Ef, Wf, 4.5, 3.5, LF2, 'sleeve'), ((Wf[0] - u0[0] * 1.2, Wf[1] - u0[1] * 1.2), (Wf[0] + u0[0] * 0.8, Wf[1] + u0[1] * 0.8), 3, 3, 1, 'glove')]); FA = F.copy()
    F = LEGL
    if bz == 1: F[BA >= 0] = BA[BA >= 0]; F[T >= 0] = T[T >= 0]; F[BH >= 0] = BH[BH >= 0]
    else: F[T >= 0] = T[T >= 0]; F[BA >= 0] = BA[BA >= 0] if bz != 2 else F[BA >= 0]
    F[HEADL >= 0] = HEADL[HEADL >= 0]
    if bz == 2: F[BA >= 0] = BA[BA >= 0]      # (2: the back arm is in front of the head too: the swipe)
    F[FA >= 0] = FA[FA >= 0]
    G = finish(F); LAST['tips'] = blades(G, Wf, u, Pz.get('sway', 0.0), Pz.get('glint')); LAST['hand'] = Wb; LAST['glove'] = Wf
    for p, q, c in Pz.get('trail', ()): streak(G, p, q, c)
    return G
REST = dict(hipY=36.0, legs=((-1.5, 59.0, 0), (3.0, 59.0, 0)), torso=(0.0, 1.0), head=(0.0, 0.0, 0.0), hb=(0.0, 13.0), gf=(4.0, -2.0))
def idle_frames():
    FR = []
    for k in range(15):
        ph = 2 * np.pi * k / 15; Pz = dict(REST); Pz['torso'] = (1.4 * np.sin(ph + 0.9), 1.0 + 0.03 * np.sin(ph)); Pz['head'] = (1.5 * np.sin(ph + 2.2), 0.0, 0.0)      # he breathes, sways and the hat tips
        Pz['gf'] = (4.0 + 0.7 * np.sin(2 * ph + 1.3), -2.0 + 0.6 * np.sin(2 * ph)); Pz['sway'] = 0.8 * np.sin(2 * ph + 1.3); Pz['glint'] = ((k * 3) % 15) / 15.0 if k < 11 else None; FR.append(render(Pz))      # the claw twitches, a glint runs up a blade
    return FR
def walk_frames():
    FR = []
    for k in range(15):
        ph = k / 15.0; h = 22.3 + 0.5 * np.cos(2 * np.pi * (k - 4.65) / 7.5); xf, lf = foot_at((ph + 0.5) % 1.0); xn, ln = foot_at(ph % 1.0)
        Pz = dict(REST); Pz['hipY'] = GROUND - h; Pz['legs'] = ((xn, GROUND - ln, 0), (xf, GROUND - lf, 0)); Pz['torso'] = (3.0 + 1.6 * np.sin(2 * np.pi * ph), 1.0); Pz['head'] = (-2.0, 0.0, 0.0)      # he leans into the stride and sways, his head level
        Pz['gf'] = (4.0, -2.0 + 0.8 * np.sin(4 * np.pi * ph)); Pz['sway'] = 0.8 * np.sin(4 * np.pi * ph + 1.0); FR.append(render(Pz))
    return FR
# ---------------------------------------------------------------- THE RUN (v1.46, his DASH): 15 pictures, one cycle of two strides: long strides (a stride is 17 px), a foot is on the ground for 36% of the cycle so there is a moment in the air between the steps (the hips rise), high knees (the swinging foot rises 8.5 px), the body leans 14 degrees into it, the head looks ahead and the arms pump against the legs (the claw arm swings forward and up when the near leg is back)
RSTRIDE = 17.0; RDUTY = 0.36; RLIFT = 8.5
def run_foot(u):
    if u < RDUTY: return RSTRIDE / 2 - RSTRIDE * (u / RDUTY), 0.0
    s = (u - RDUTY) / (1 - RDUTY); e = s - np.sin(2 * np.pi * s) / (2 * np.pi); return -RSTRIDE / 2 + RSTRIDE * e, RLIFT * np.sin(np.pi * s)
def run_frames():
    FR = []
    for k in range(15):
        ph = k / 15.0; xf, lf = run_foot((ph + 0.5) % 1.0); xn, ln = run_foot(ph % 1.0); c = np.cos(2 * np.pi * ph); bounce = 0.5 + 0.5 * np.cos(4 * np.pi * (ph - 0.43))
        Pz = dict(REST); Pz['hipY'] = GROUND - (19.0 + 2.4 * bounce); Pz['legs'] = ((xn, GROUND - ln, 0), (xf, GROUND - lf, 0)); Pz['torso'] = (14.0 + 2.0 * np.sin(4 * np.pi * ph), 1.0); Pz['head'] = (-9.0, 0.0, 0.0)
        Pz['gf'] = (4.0 - 4.5 * c, -1.0 - 3.0 * (0.5 - 0.5 * c)); Pz['hb'] = (6.5 * c, 10.5 - 3.0 * c); Pz['wr'] = 18.0 - 6.0 * c; Pz['sway'] = 0.8 * np.sin(4 * np.pi * ph + 1.0); FR.append(render(Pz))
    return FR
# THE JUMP: key poses (frame, hip row, row of the lowest point of the feet, near foot, far foot (forward of the hips), toe angle, torso turn (deg), torso stretch, head turn (deg), back hand (x, y from the shoulder), glove (x, y from the shoulder), wrist (deg)), blended smoothly: 20 pictures jump, 20 land
KEYS = [(0, 36.0, 59.0, -1.5, 3.0, 0, 1.0, 1.0, 0.0, 0.0, 13.0, 4.0, -2.0, 14), (3, 43.5, 59.0, -1.0, 4.0, 0, 30.0, 0.97, -14.0, -8.0, 10.0, 8.0, 6.0, 14), (5, 38.5, 59.0, -0.5, 3.0, 20, 9.0, 1.0, -8.0, 3.0, 0.0, 10.5, -4.5, 14), (6, 36.5, 59.0, -0.5, 2.5, 45, -3.0, 1.03, -2.0, 6.0, -6.0, 11.0, -8.0, 22),
        (12, 37.5, 57.0, 1.0, 3.5, 55, 2.0, 1.02, -2.0, 2.0, -13.0, 12.0, -9.0, 30), (19, 39.0, 51.0, 4.5, 7.5, 70, 5.0, 1.0, -4.0, -8.0, -14.0, 11.0, -10.0, 30), (26, 38.0, 54.0, 2.5, 5.0, 60, 6.0, 1.0, 1.0, -9.0, -4.0, 11.0, -5.0, 22), (33, 36.5, 59.5, 0.5, 3.0, 45, 3.0, 1.02, -2.0, -6.0, 6.0, 9.0, 2.0, 14),
        (35, 38.0, 59.0, -0.5, 3.5, 20, 16.0, 0.99, -6.0, 3.0, 8.0, 9.0, 5.0, 14), (37, 43.5, 59.0, -1.0, 4.0, 0, 30.0, 0.97, -14.0, 4.0, 9.0, 9.0, 7.0, 14), (39, 36.6, 59.0, -1.5, 3.0, 0, 3.0, 1.0, -1.0, 0.0, 12.5, 4.2, -1.0, 14)]
def blend(keys, k):
    """the pose at picture k between the key poses (each stretch eases in and out): the numbers that follow the picture number"""
    for a, b in zip(keys, keys[1:]):
        if a[0] <= k <= b[0]:
            t = (k - a[0]) / float(b[0] - a[0]); t = t * t * (3 - 2 * t); return [a[i] + (b[i] - a[i]) * t for i in range(1, len(a))]
def pose(k): return blend(KEYS, k)
def from_pose(v, k):
    """the pose for render() from the numbers of a key pose (13 as in the jump keys; a 14th says the back arm is behind the torso)"""
    hipY, footY, xn, xf, ang, al, sy, bt, hbx, hby, gfx, gfy, wr = v[:13]
    return dict(wr=wr, hipY=hipY, legs=((xn, footY, ang), (xf, footY, ang)), torso=(al, sy), head=(bt, 0.0, 0.0), hb=(hbx, hby), gf=(gfx, gfy), sway=0.8 * np.sin(2 * np.pi * k / 13.0), bz=(1 if len(v) > 13 and v[13] >= 0.5 else 0))
def jump_frames(): return [render(from_pose(pose(k), k)) for k in range(40)]
# THE CROUCH (v1.44), the stalker's crouch: low and hunched forward, the head down between the shoulders, the claw out in front near the knee, the other hand on his thigh, the feet apart (the near one back). Three animations of 15 pictures each: GOING DOWN (standing up plays them backwards and he holds the last one), FROM THE CROUCH INTO THE JUMP (it ends with the take-off picture of the jump) and FROM THE JUMP INTO THE CROUCH (it starts with the touch-down picture of the jump). Key poses as in the jump, with a 14th number: the back arm behind the torso (1) or in front of it (0).
CROUCH = (45.5, 59.0, -4.0, 8.0, 0, 36.0, 0.97, -16.0, -1.4, 15.9, 6.9, 9.9, -20, 1)
CD_KEYS = [(0, 36.0, 59.0, -1.5, 3.0, 0, 0.0, 1.0, 0.0, 0.0, 13.0, 4.0, -2.0, 14, 0), (4, 39.5, 59.0, -2.5, 5.0, 0, 12.0, 0.99, -5.0, 0.0, 14.0, 5.0, 0.0, 12, 0), (7, 43.0, 59.0, -3.5, 7.0, 0, 26.0, 0.98, -11.0, -1.0, 15.5, 6.0, 5.0, 0, 0),
           (9, 45.0, 59.0, -3.9, 7.8, 0, 33.0, 0.97, -14.5, -1.2, 16.0, 6.5, 8.0, -12, 1), (12, 46.5, 59.0, -4.2, 8.5, 0, 39.0, 0.96, -17.5, -1.6, 16.2, 7.0, 10.5, -22, 1), (14,) + CROUCH]
CJ_KEYS = [(0,) + CROUCH, (3, 47.0, 59.0, -4.5, 8.0, 0, 41.0, 0.96, -19.0, -4.0, 14.5, 3.0, 11.0, -10, 1), (6, 42.0, 59.0, -2.5, 5.5, 0, 24.0, 0.99, -9.0, 3.0, 6.0, 9.0, 2.0, 10, 0), (9, 40.0, 59.0, -1.0, 4.0, 10, 14.0, 1.0, -6.0, 3.0, 2.0, 10.0, -2.0, 14, 0),
           (12, 38.5, 59.0, -0.5, 3.0, 20, 9.0, 1.0, -8.0, 3.0, 0.0, 10.5, -4.5, 14, 0), (14, 36.5, 59.0, -0.5, 2.5, 45, -3.0, 1.03, -2.0, 6.0, -6.0, 11.0, -8.0, 22, 0)]
JC_KEYS = [(0,) + tuple(pose(34)) + (0,), (2, 40.5, 59.0, -1.5, 4.0, 0, 22.0, 0.985, -10.0, 1.0, 8.0, 9.0, 6.0, 14, 0), (4, 45.0, 59.0, -3.0, 6.0, 0, 33.0, 0.97, -15.0, 3.0, 9.0, 8.0, 8.5, 6, 0), (6, 47.2, 59.0, -4.5, 8.5, 0, 41.0, 0.955, -20.0, -2.0, 14.0, 7.5, 11.0, -8, 1),
           (8, 46.6, 59.0, -4.3, 8.3, 0, 39.0, 0.96, -18.5, -1.8, 15.0, 7.2, 10.6, -14, 1), (10, 46.0, 59.0, -4.2, 8.2, 0, 38.0, 0.965, -17.5, -1.6, 15.6, 6.5, 8.8, -24, 1), (12, 45.7, 59.0, -4.1, 8.1, 0, 36.8, 0.968, -16.5, -1.5, 15.8, 6.8, 9.6, -21, 1), (14,) + CROUCH]
def jump_sway(k): return 0.8 * np.sin(2 * np.pi * k / 13.0)      # (the wobble of the blades in the jump pictures: the ends of the crouch animations take it over so that they join the jump's pictures exactly)
def crouch_frames(keys, s0=0.0, s1=0.0):
    FR = []
    for k in range(15):
        u = k / 14.0; Pz = from_pose(blend(keys, k), k); Pz['sway'] = s0 * (1 - u) + s1 * u + 0.6 * np.sin(2 * np.pi * k / 13.0) * np.sin(np.pi * u); FR.append(render(Pz))
    return FR
# THE M1 (v1.45): two slashes of 15 pictures each, with the whole game's M1 timing (the whoosh on picture 4, the blow on picture 7). SLASH 1 is the claw: it is drawn back high behind the head (the body leans back), then swept down and forward through the blow at chest height (the body throws itself forward), follows through and comes back. SLASH 2 is the other, BARE hand (only the glove has blades): it is drawn back low, then swiped forward and up at the height of the face. Slash lines (the blades' own paths, or three lines for the bare hand) trail behind the swing in light colours.
REST_K = (36.0, 59.0, -1.5, 3.0, 0, 0.0, 1.0, 0.0, 0.0, 13.0, 4.0, -2.0, 14, 0)      # (the standing pose as key numbers)
SL1_KEYS = [(0,) + REST_K, (2, 36.5, 59.0, -2.0, 3.5, 0, -5.0, 1.0, 2.0, -1.0, 12.5, 1.0, -8.0, 14, 0), (4, 37.0, 59.0, -2.5, 4.5, 0, -11.0, 1.0, 5.0, -2.0, 12.0, -3.0, -10.5, 10, 0), (5, 37.2, 59.0, -3.0, 5.5, 0, -3.0, 1.0, 2.0, -1.0, 12.0, 5.0, -10.0, 20, 0),
            (6, 37.5, 59.0, -3.2, 6.0, 0, 8.0, 1.0, -3.0, 0.0, 12.5, 9.5, -5.0, 30, 0), (7, 37.8, 59.0, -3.5, 6.5, 0, 14.0, 0.99, -6.0, 0.0, 13.0, 11.5, 1.0, 38, 0), (8, 37.8, 59.0, -3.5, 6.5, 0, 16.0, 0.99, -7.0, 1.0, 13.0, 11.5, 6.0, 42, 0),
            (10, 37.2, 59.0, -3.0, 5.5, 0, 12.0, 1.0, -5.0, 0.0, 13.0, 9.0, 10.5, 36, 0), (12, 36.6, 59.0, -2.2, 4.2, 0, 6.0, 1.0, -2.0, 0.0, 13.0, 6.5, 5.0, 24, 0), (14,) + REST_K]
SL2_KEYS = [(0,) + REST_K, (2, 36.4, 59.0, -2.0, 3.5, 0, -3.0, 1.0, 1.0, -4.0, 12.0, 5.0, 3.0, 24, 0), (4, 37.0, 59.0, -2.5, 4.5, 0, -8.0, 1.0, 3.0, -10.0, 11.0, 6.0, 8.0, 36, 0), (5, 37.2, 59.0, -3.0, 5.5, 0, -1.0, 1.0, 1.0, -4.0, 6.0, 6.5, 8.5, 36, 0),
            (6, 37.5, 59.0, -3.2, 6.0, 0, 8.0, 1.0, -3.0, 7.0, 3.0, 7.0, 9.0, 36, 0), (7, 37.8, 59.0, -3.5, 6.5, 0, 13.0, 0.99, -6.0, 16.5, 2.0, 7.0, 9.0, 36, 0), (8, 37.8, 59.0, -3.5, 6.5, 0, 15.0, 0.99, -7.0, 17.0, 3.5, 7.0, 9.0, 36, 0),
            (10, 37.2, 59.0, -3.0, 5.5, 0, 11.0, 1.0, -5.0, 12.0, 6.0, 7.0, 7.0, 34, 0), (12, 36.6, 59.0, -2.2, 4.2, 0, 5.0, 1.0, -2.0, 6.0, 9.0, 5.5, 2.0, 24, 0), (14,) + REST_K]
def slash_frames(keys, claw):
    """15 pictures from key poses; claw = the glove hand slashes (its three blade tips leave the lines), otherwise the bare back hand does (three lines leave it). Two passes: the first finds where the tips go, the second draws the lines of the last three pictures behind them."""
    pts = []; c0 = CLIP[0]
    for k in range(15):
        Pz = from_pose(blend(keys, k), k); render(Pz); pts.append([tuple(t) for t in LAST['tips']] if claw else [tuple(LAST['hand'])])
    CLIP[0] = c0      # (only what the kept pictures lose counts)
    out = []
    for k in range(15):
        Pz = from_pose(blend(keys, k), k); trail = []
        if not claw and 4 <= k <= 10: Pz['bz'] = 2      # (the swipe passes in front of the body and the head)
        for back in (1, 2, 3):
            if k - back < 4 or k > 11: continue      # (the lines show from the start of the swing, picture 4, until picture 11)
            col = GLT if back == 1 else BLD
            for i in range(len(pts[k])):
                p, q = pts[k - back][i], pts[k - back + 1][i]
                if np.hypot(q[0] - p[0], q[1] - p[1]) < 1.2: continue
                if claw: trail.append((p, q, col))
                else:      # (the bare hand: three lines side by side)
                    dx, dy = q[0] - p[0], q[1] - p[1]; r = max(np.hypot(dx, dy), 1e-6); nx, ny = -dy / r, dx / r
                    for o in (-2.0, 0.0, 2.0): trail.append(((p[0] + nx * o, p[1] + ny * o), (q[0] + nx * o, q[1] + ny * o), col))
        Pz['trail'] = trail; out.append(render(Pz))
    return out
def sheet(FR, FW, FJ, FC):
    A = np.zeros((704, 64 * 15, 4), np.uint8)      # row 10: the run (the dash), row 0: the idle, row 1: the walk, rows 2-4: the jump (frames 0-14, 15-29, 30-39), row 5: going down into the crouch, row 6: from the crouch into the jump, row 7: from the jump into the crouch, row 8: the claw slash, row 9: the slash with the bare hand
    def put(f, r, c):
        for v in range(16): A[r * 64:(r + 1) * 64, c * 64:(c + 1) * 64][f == v] = list(P[v].astype(int)) + [255]
    for i, f in enumerate(FR): put(f, 0, i)
    for i, f in enumerate(FW): put(f, 1, i)
    for i, f in enumerate(FJ): put(f, 2 + i // 15, i % 15)
    for r, fs in enumerate(FC):
        for i, f in enumerate(fs): put(f, 5 + r, i)
    Image.fromarray(A).save('freddy_sheet.png'); return A
if __name__ == '__main__':
    U, RH, hx, gx, gy = upper(); print('hem', RH, 'hips', round(hx, 1)); FR = idle_frames(); FW = walk_frames(); FJ = jump_frames(); FC = [crouch_frames(CD_KEYS), crouch_frames(CJ_KEYS, 0.0, jump_sway(6)), crouch_frames(JC_KEYS, jump_sway(34), 0.0), slash_frames(SL1_KEYS, True), slash_frames(SL2_KEYS, False), run_frames()]; A = sheet(FR, FW, FJ, FC)
    # contact sheets to look at, x2: the jump (8 x 5) and the three crouch animations (15 x 3)
    def contact(cells, cols, name):
        rows = (len(cells) + cols - 1) // cols; cs = np.zeros((64 * rows, 64 * cols, 4), np.uint8); cs[:] = [120, 116, 132, 255]
        for i, blk in enumerate(cells):
            r, c = divmod(i, cols); m = blk[:, :, 3] > 0; cs[r * 64:(r + 1) * 64, c * 64:(c + 1) * 64][m] = blk[m]
        Image.fromarray(cs).resize((cs.shape[1] * 2, cs.shape[0] * 2), Image.NEAREST).save(name)
    contact([A[(2 + i // 15) * 64:(3 + i // 15) * 64, (i % 15) * 64:(i % 15 + 1) * 64] for i in range(40)], 8, 'freddy_contact.png')
    contact([A[(5 + r) * 64:(6 + r) * 64, i * 64:(i + 1) * 64] for r in range(3) for i in range(15)], 15, 'freddy_contact2.png'); contact([A[(8 + r) * 64:(9 + r) * 64, i * 64:(i + 1) * 64] for r in range(2) for i in range(15)], 15, 'freddy_contact3.png'); contact([A[10 * 64:11 * 64, i * 64:(i + 1) * 64] for i in range(15)], 15, 'freddy_contact4.png')
    print('sheet', A.shape, 'blade pixels cut off:', CLIP[0], 'farthest ankle', round(REACH[0], 2), 'of', L1 + L2); assert CLIP[0] == 0 and REACH[0] <= L1 + L2 - 0.05
