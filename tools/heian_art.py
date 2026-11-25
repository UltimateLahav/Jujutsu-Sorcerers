# tools/heian_art.py (v1.223): HEIAN SUKUNA, the figure of the Heian art series (96 px tall, facing right, four arms hanging, the mouth on his belly; the user approved it as version 8), drawn once per pose with the game's shaded paint box (pxart.py).
# render(pose) -> an 80 x 120 RGBA native picture (the rest pose is exactly version 8); crop() cuts the 64 x 100 window the game uses; running this file draws the strip tools/heian_sheet.png: 3 rows of pictures, IDLE (20), WALK (8), WALK BACK (8), see tools/heian.js.
#   python3 -B heian_art.py [folder for the strip and the contact sheets to look at]
import sys, os, math
HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, HERE); sys.dont_write_bytecode = True
import numpy as np, cv2
from PIL import Image
from pxart import Spr

W, H = 80, 120
def hx(h): return np.array([int(h[i:i + 2], 16) for i in (1, 3, 5)], np.float32)
def R4(*cs): return np.array([hx(c) for c in cs], np.float32)
OUTL = '#0e0a1a'
SKIN = R4('#a46c60', '#d09c80', '#ecc0a0', '#f8d8bc'); SKIN_F = R4('#7a4a48', '#a46c60', '#d09c80', '#ecc0a0')
HAIR = R4('#7a4258', '#b4707e', '#dc94a0', '#f2bcc4')
NAVY = R4('#1a1e3c', '#28305c', '#3e4a80', '#6070b8'); NAVY_F = R4('#0e0c1e', '#1a1e3c', '#28305c', '#3e4a80')
PURP = R4('#1a1228', '#2a1c3c', '#3a1f4a', '#56407a')
BLKM = R4('#2a1a26', '#2a1a26')
RED = R4('#4e1620', '#782a30', '#b03a3a', '#d85a5a'); MOUTH = R4('#3a0e18', '#4e1620')
LET = {'T': '#f8d8bc', 'S': '#ecc0a0', 'U': '#d09c80', 'V': '#a46c60', 'k': '#2a1a26', 'W': '#ececf0', 'X': '#ff2a3a', 'q': '#c4121c', 'O': OUTL, 'L': '#7a4258', 'K': '#b4707e', 'g': '#8a6a6a'}
PALL = np.concatenate([SKIN, SKIN_F, HAIR, NAVY, NAVY_F, PURP, BLKM, RED, MOUTH, np.array([hx(OUTL), hx('#ececf0'), hx('#ff2a3a'), hx('#c4121c'), hx('#8a6a6a')], np.float32)])
CROSS = np.array([[0, 1, 0], [1, 1, 1], [0, 1, 0]], np.uint8)
U, I_, D_ = Spr.U, Spr.I, Spr.D
FY = 102.5
HIP_Y, ANK_Y = 66.0, 96.0           # the hips and the bottom of the cuffs at rest: a leg is 30 px long
LEG0 = ((42.0, 40.0), (48.0, 50.0))  # (hip x, rest ankle x) of the far (back) and of the near (front) leg

class Pose:
    def __init__(s, **k):
        s.by = 0.0      # breathing: how far the shoulders rise (px); the hips stay
        s.lean = 0.0    # how far forward the shoulders lean (px), the hips stay
        s.sink = 0.0    # the hips and everything above them sink (px)
        s.hdx = 0; s.hdy = 0   # the head, whole pixels, against what the body's bend gives it
        s.sway = 0.0    # the spikes of his hair, -1 .. 1
        s.leg = [0.0, 0.0]     # the ankle of the far / near leg: px forward of its rest place
        s.lift = [0.0, 0.0]    # how high the far / near foot is lifted
        s.ang = [0.0, 0.0]     # the far / near foot: degrees, toes down is positive
        s.arm = [0.0, 0.0, 0.0, 0.0]   # far-back, far-front, near-back, near-front: degrees, the hand forward is positive
        s.tail = [0.0, 0.0]    # the two ends of the sash: px
        s.tongue = 0.0  # the tongue of the belly mouth: how far it comes out (px)
        s.blink = 0
        for a, v in k.items(): setattr(s, a, v)

def render(P):
    S = Spr(W, H, 1.0)
    def part(m, rp, edge=True, R=3, **kw):
        kw.setdefault('amb', .2); kw.setdefault('dither', 0); kw.setdefault('rim', True); kw.setdefault('shadow', .78)
        a0 = S.a.copy(); m1 = S.paint(m, rp, R=R, **kw)
        if edge:
            b = (cv2.dilate(m1.astype(np.uint8), CROSS) > 0) & ~m1 & a0
            S.rgb[b] = hx(OUTL)
        return m1
    def px(x, y, c): S.px(x, y, c)
    def mark(m): S.paint(m, BLKM, R=1, dither=0, rim=False, shadow=1, amb=.9)
    def pix(x0, y0, rows):
        for j, r in enumerate(rows):
            for i, ch in enumerate(r):
                if ch != '.': px(x0 + i, y0 + j, LET[ch])
    # ---- how the body moves: the shoulders rise and lean, the hips only sink
    def TB(x, y):
        w = max(0.0, min(1.25, (HIP_Y - y) / 32.0))
        return x + P.lean * w, y + P.sink - P.by * w
    def TH(x, y): return x, y + P.sink
    def mpoly(pts, tf=TB): return S.poly([tf(*p) for p in pts])
    def mell(cx, cy, rx, ry, rot=0, tf=TB): x, y = tf(cx, cy); return S.ell(x, y, rx, ry, rot)
    def mchain(pts, r0, r1, tf=TB): return S.chain([tf(*p) for p in pts], r0, r1)
    def mline(pts, w, tf=TB): return S.line([tf(*p) for p in pts], w)
    def pxT(x, y, c, tf=TB):
        x2, y2 = tf(x, y); px(int(round(x2)), int(round(y2)), c)
    def folds(x0, ph): return lambda X, Y: (.55 * np.sin((X - x0) * 1.15 + ph) + .3 * np.sin((X - x0) * 2.5 + ph * 2), np.zeros_like(X))
    def arm_tf(sh, L, th):
        s0 = TB(*sh)
        def f(x, y):
            x2, y2 = TB(x, y); u = max(0.0, min(1.25, (y - sh[1]) / L)); a = math.radians(th) * u
            rx, ry = x2 - s0[0], y2 - s0[1]
            return s0[0] + rx * math.cos(a) + ry * math.sin(a), s0[1] - rx * math.sin(a) + ry * math.cos(a)
        return f
    def arm(pts, r0, r1, hand, rp, th, band_t=(.42, .88), bw=.95):
        tf = arm_tf(pts[0], math.hypot(pts[-1][0] - pts[0][0], pts[-1][1] - pts[0][1]), th)
        tp = [tf(*p) for p in pts]
        m = S.chain(tp, r0, r1); part(m, rp, R=3.2, amb=.1)
        for t in band_t:
            i = min(len(tp) - 2, int(t * (len(tp) - 1))); f = t * (len(tp) - 1) - i
            p = (tp[i][0] + (tp[i + 1][0] - tp[i][0]) * f, tp[i][1] + (tp[i + 1][1] - tp[i][1]) * f)
            mark(I_(S.seg(p[0] - 8, p[1], p[0] + 8, p[1], bw, bw), m))
        hx_, hy_ = tf(hand[0], hand[1]); part(S.ell(hx_, hy_, hand[2], hand[3]), rp, R=2.2, amb=.1)
        return m, tf
    # ---- the legs: the V8 trousers bent along a knee (two bones), the foot on the ankle
    def leg_geom(i):
        hxx, ax0 = LEG0[i]; H0 = (hxx, HIP_Y); A0 = (ax0, ANK_Y)
        H1 = (hxx, HIP_Y + P.sink); A1 = (ax0 + P.leg[i], ANK_Y - P.lift[i])
        LL = math.hypot(A0[0] - H0[0], A0[1] - H0[1]) / 2      # the two halves of a leg: hip to knee, knee to ankle (at rest the leg is straight)
        dx, dy = A1[0] - H1[0], A1[1] - H1[1]; d = math.hypot(dx, dy)
        if d > 2 * LL: A1 = (H1[0] + dx * 2 * LL / d, H1[1] + dy * 2 * LL / d); dx, dy = A1[0] - H1[0], A1[1] - H1[1]; d = math.hypot(dx, dy)
        h = math.sqrt(max(0.0, LL * LL - d * d / 4)); mx, my = (H1[0] + A1[0]) / 2, (H1[1] + A1[1]) / 2
        K1 = (mx + dy / d * h, my - dx / d * h)       # the knee bends forward
        return H0, A0, H1, K1, A1
    def leg_tf(i):
        H0, A0, H1, K1, A1 = leg_geom(i)
        def c1(t): return (H1[0] + (K1[0] - H1[0]) * t / .5, H1[1] + (K1[1] - H1[1]) * t / .5) if t <= .5 else (K1[0] + (A1[0] - K1[0]) * (t - .5) / .5, K1[1] + (A1[1] - K1[1]) * (t - .5) / .5)
        def f(x, y):
            t = max(0.0, min(1.0, (y - HIP_Y) / (ANK_Y - HIP_Y))); c0 = (H0[0] + (A0[0] - H0[0]) * t, H0[1] + (A0[1] - H0[1]) * t); q = c1(t)
            return x + q[0] - c0[0], y + q[1] - c0[1]
        return f, A0, A1
    def foot(i, rp):
        f, A0, A1 = leg_tf(i); x0 = (34 if i == 0 else 44) + (A1[0] - A0[0]); dy = A1[1] - A0[1]; a = math.radians(P.ang[i]); cx_, cy_ = x0 + 6.0, ANK_Y + dy
        def R(x, y):
            rx, ry = x - cx_, y - cy_; return cx_ + rx * math.cos(a) - ry * math.sin(a), cy_ + rx * math.sin(a) + ry * math.cos(a)
        base = [(x0, FY - 2 + dy), (x0 + 2, FY - 5.5 + dy), (x0 + 5.5, FY - 6.5 + dy), (x0 + 10.5, FY - 5 + dy), (x0 + 14, FY - 2 + dy), (x0 + 14, FY + dy), (x0, FY + dy)]
        part(S.poly([R(*p) for p in base]), rp, R=2)
        for (qx, qy, c) in ((13, -3, '#2a1a26'), (13, -1, '#2a1a26'), (9, -.5, '#a46c60'), (7, -.5, '#a46c60')):
            rx_, ry_ = R(x0 + qx, FY + qy + dy); px(int(round(rx_)), int(round(ry_)), c)
    # 1. the far pair of arms
    arm([(52, 47), (55.5, 57), (58, 68)], 2.7, 2.0, (58.5, 71.5, 2.2, 2.9), SKIN_F, P.arm[1])
    arm([(38.5, 39), (35.5, 51), (33, 62)], 3.4, 2.4, (32.5, 65.5, 2.5, 3.2), SKIN_F, P.arm[0])
    # 2. the hakama: the back leg, the front leg, the cuffs, the feet
    foot(0, SKIN_F); foot(1, SKIN)
    f0, _, _ = leg_tf(0); f1, _, _ = leg_tf(1)
    part(S.poly([f0(*p) for p in [(38.5, 66), (45.5, 66), (44.5, 92), (43, 95.5), (36, 95.5), (37, 91)]]), NAVY_F, R=3.2, amb=.12, bump=folds(38.5 + P.leg[0] * .5, .4))
    part(S.poly([f1(*p) for p in [(44.5, 66), (51.5, 66), (52.5, 91), (53.5, 95.5), (46.5, 95.5), (47, 91)]]), NAVY, R=3.2, amb=.12, bump=folds(44.5 + P.leg[1] * .5, 1.6))
    part(S.poly([f0(*p) for p in [(36, 91.5), (44.5, 91.5), (44.5, 96), (35.5, 96)]]), PURP, R=2)
    part(S.poly([f1(*p) for p in [(46.5, 91.5), (53.5, 91.5), (54, 96), (46, 96)]]), PURP, R=2)
    # 3. neck and torso
    part(mpoly([(42, 28), (49.5, 28), (51, 36), (40, 36)]), SKIN, R=3.5, amb=.15)
    torso = mpoly([(39, 35.5), (45, 34), (50, 35.5), (54, 39), (55.5, 44), (55, 49), (53.5, 55), (51, 61), (50.5, 65), (39.5, 65), (37.5, 59), (35.5, 51), (35.5, 43), (37, 38)])
    part(torso, SKIN, R=8, amb=.1)
    part(mell(50, 43.5, 6, 4.6, -10), SKIN, edge=False, R=3.4, amb=.1)
    for cy in (52.2, 56.4, 60.2): part(mell(51.6, cy, 3.4, 1.9), SKIN, edge=False, R=1.8, amb=.1)
    mark(I_(mline([(47, 34.5), (51, 37), (54.5, 41.5)], 2.2), torso))
    mark(I_(mline([(40, 36), (37.5, 40), (36, 44)], 2.0), torso))
    mark(I_(mline([(47.5, 46), (49.5, 48.8), (51.5, 45.5), (53.5, 48.8), (55, 46.5)], 1.5), torso))
    for (x0, y0, x1, y1) in ((50, 54, 55, 53), (50, 58, 54, 57)): mark(I_(mline([(x0, y0), (x1, y1)], 1.1), torso))
    mark(I_(mline([(36.4, 46.5), (39.6, 50.5)], 1.5), torso)); mark(I_(mline([(36.2, 52.5), (39.2, 56.5)], 1.5), torso))
    # 4. the sash on his hips, its knot and the two ends that hang (they swing)
    part(mpoly([(38.5, 62), (51.5, 62), (53, 68), (37, 68)], TH), PURP, R=2.2)
    def tl(k):
        def f(x, y):
            u = max(0.0, (y - 68) / 11.0); return x + P.tail[k] * u * u, y + P.sink - abs(P.tail[k]) * .25 * u * u
        return f
    part(mpoly([(48, 68), (51, 68), (50, 79), (46, 78)], tl(0)), PURP, R=1.8)
    part(mpoly([(50, 68), (53, 68), (52.5, 77), (49, 78)], tl(1)), PURP, R=1.8)
    part(mell(50.5, 65.4, 3, 2.7, 0, TH), PURP, R=1.8)
    # 5. the mouth on his belly: a notch with two teeth and the tongue
    part(mpoly([(52.5, 49.5), (55, 49), (56.5, 51), (56.5, 56), (55, 58), (52.5, 57.5)]), MOUTH, edge=False, R=1.5)
    for (qx, qy) in ((54, 51), (55, 52), (55, 56), (54, 57)): pxT(qx, qy, '#ececf0')
    tg = P.tongue
    part(mpoly([(53.5, 54), (57.5, 54.5), (58, 57), (57.5, 61 + tg), (55.6, 61.5 + tg * 1.3), (55.6, 57.5), (53.5, 57)]), RED, R=1.5)
    pxT(55, 55, '#d85a5a'); pxT(56, 56, '#d85a5a')
    # 6. the near pair of arms, in front of the body
    na = [(43.5, 39), (45, 50), (46, 60)]
    m, tf = arm(na, 3.8, 2.6, (46.5, 64, 2.9, 3.4), SKIN, P.arm[2])
    mark(I_(S.ell(*tf(42.8, 40.8), 2.3, 2.3), m))
    arm([(48, 46), (49.5, 57), (50.5, 67)], 3.2, 2.3, (51, 71, 2.7, 3.3), SKIN, P.arm[3])
    # 7. his head: whole pixels, the hair sways
    HX0, HY0 = 30 + P.hdx, 8 + P.hdy
    def Hp(x, y, c): px(HX0 + x, HY0 + y, c)
    def HP(pts): return S.poly([(HX0 + x, HY0 + y) for x, y in pts])
    def HE(cx, cy, rx, ry, rot=0): return S.ell(HX0 + cx, HY0 + cy, rx, ry, rot)
    def Hpix(x, y, rows): pix(HX0 + x, HY0 + y, rows)
    C = (14, 13.5)
    outline = [(-200, 8.5), (-189, 13), (-178, 9), (-166, 14), (-154, 9.5), (-142, 14.5), (-130, 10), (-118, 14), (-106, 9.5), (-94, 13), (-82, 9.5), (-70, 12.5), (-58, 9), (-46, 11), (-34, 8.5)]
    KK = [4, 6.5, 4.5, 7, 4, 6.5, 3.5, 5, 2.5, 3.5, 1.5, 2, 1, .5, 0]
    outline = [(a + P.sway * KK[i], r + (0.5 * P.sway if r > 12 else 0)) for i, (a, r) in enumerate(outline)]
    pts = [(HX0 + C[0] + r * math.cos(math.radians(a)), HY0 + C[1] + r * math.sin(math.radians(a))) for a, r in outline]
    hair = U(S.poly(pts + [(HX0 + C[0], HY0 + C[1])]), HE(13, 13, 9, 8))
    part(hair, HAIR, R=2.6, amb=.14, lift=-.2)
    for a, r in outline[3::2]:
        x = HX0 + C[0] + (r * .62) * math.cos(math.radians(a)); y = HY0 + C[1] + (r * .62) * math.sin(math.radians(a)); px(x, y, '#7a4258'); px(x + math.cos(math.radians(a)) * 1.2, y + math.sin(math.radians(a)) * 1.2, '#b4707e')
    face = HP([(10, 9), (19, 8.6), (20.6, 10), (22, 11), (22, 12.9), (21.7, 13.6), (21.8, 14.4), (22.7, 15.2), (23.7, 16.2), (23.7, 16.8), (22.8, 17.6), (22, 18.2), (21.8, 19.2), (21.8, 20.4), (21.8, 21.6), (21.4, 22.6), (20.8, 23.6), (18.6, 24.4), (14, 24.4), (11.5, 23.2), (10, 20), (9, 15), (9, 11)])
    part(face, SKIN, R=5, amb=.2)
    fr = U(HP([(14, 7), (18.5, 7), (21, 11)]), HP([(10, 7), (15, 7), (17, 11.4)]), HP([(8, 8), (12, 8), (13.2, 11.6)]), HP([(8.5, 10), (11, 10), (10, 17.5)]))
    part(fr, HAIR, edge=False, R=2.2, amb=.14, lift=-.2, shadow=1)
    g = ['.......kkkkk..', '.......UWXkS..', '.......UUqqS..', '.UUSSTTSSSST..', '.UUSSSkkkSUTS.', '.UUSSSWXkSUSTS', '.UUSSSSSSSUkV.', '.UUUSSSSSSUV..', '..............', '.......kkkkk..', '..............', '..UUSSSSTSk...', '..VVUSSSUUk...', '....VVVVk.....']
    if P.blink: g[1] = '.......UkkkS..'; g[2] = '.......UUUUS..'; g[5] = '.UUSSSkkkSUSTS'
    Hpix(10, 11, g)
    Hpix(9, 14, ['.UU.', 'UVVU', 'UVU.', '.UU.']); Hpix(9, 18, ['k.', 'k.'])
    # 8. the outline round the whole figure, then the palette
    body_rgb, body_a = S.rgb.copy(), S.a.copy()
    o = cv2.dilate(body_a.astype(np.uint8), CROSS) > 0; o &= ~body_a
    q = np.argmin(((body_rgb[body_a][:, None, :] - PALL[None, :, :]) ** 2).sum(-1), axis=1); body_rgb[body_a] = PALL[q]
    body_rgb[o] = hx(OUTL); body_a = body_a | o
    img = np.zeros((H, W, 4), np.uint8); img[..., :3] = np.clip(body_rgb, 0, 255); img[..., 3] = body_a * 255
    return Image.fromarray(img, 'RGBA')

# the window the game uses: 64 columns (his hips on column 32) and 100 rows (his soles on row 98, like the others' on row 62 + the 36 extra rows)
X0, Y0, CW, CH = 13, 4, 64, 100
def crop(im): return im.crop((X0, Y0, X0 + CW, Y0 + CH))

def contact(frames, K=4, cols=8, bg=(36, 20, 32)):
    n = len(frames); rows = (n + cols - 1) // cols; sh = Image.new('RGBA', (cols * CW, rows * CH), bg + (255,))
    for i, f in enumerate(frames):
        c = Image.new('RGBA', (CW, CH), bg + (255,)); c.alpha_composite(f); sh.alpha_composite(c, ((i % cols) * CW, (i // cols) * CH))
    return sh.resize((sh.width * K, sh.height * K), Image.NEAREST).convert('RGB')


# ---- the poses
NI = 20      # the pictures of the idle: a breath, the hair and the sash sway, the tongue flicks, he blinks once (at 12 pictures a second: 1.7 s)
def head(P):      # the head follows the shoulders, in whole pixels
    w = 1.25; P.hdx = int(round(P.lean * w)); P.hdy = int(round(P.sink - P.by * w)) + P.hdy; return P
def idle(k):
    u = k / NI; b = lambda v: 0.5 - 0.5 * math.cos(2 * math.pi * v)
    P = Pose(by=0.95 * b(u), sway=0.75 * math.sin(2 * math.pi * (u - 0.12)),
             tail=[1.3 * math.sin(2 * math.pi * (u - 0.1)), 1.3 * math.sin(2 * math.pi * (u - 0.22))],
             arm=[1.2 * math.sin(2 * math.pi * (u - 0.05)), 1.0 * math.sin(2 * math.pi * (u - 0.15)), 1.4 * math.sin(2 * math.pi * (u - 0.1)), 1.1 * math.sin(2 * math.pi * (u - 0.2))])
    P.tongue = [0, 0, 0, 0, 0, 0, 0, 0, 0.6, 1.4, 1.8, 1.0, 0.3, 0, 0, 0, 0, 0, 0, 0][k]
    P.blink = 1 if k == 15 else 0
    P = head(P); P.hdy = -int(round(0.95 * b(u - 0.06) * 1.25))      # (the head follows the shoulders a little late)
    return P

STEP = 4.0; A = 6.0      # forward: 4 px a picture (56 px a second at 14 pictures a second), the planted foot goes from +6 to -6 in four pictures
def foot_at(kk):      # one foot at picture kk (0 - 7) of the cycle: how far forward of its rest place, how high, which angle
    if kk < 4:
        return A - STEP * kk, [0.8, 0.0, 0.0, 1.5][kk], [-8, 0, 0, 14][kk]
    u = (kk - 3) / 5.0
    return -A + 2 * A * u, 3.8 * math.sin(math.pi * u), [22, 6, -8, -12][kk - 4]
def walk(k, back=False):
    s = 0.7 if back else 1.0                        # walking back is slower (40 px a second against 56): a shorter stride
    kk = (7 - k) if back else k
    dn, ln, an = foot_at(kk % 8); df, lf, af = foot_at((kk + 4) % 8)
    sink = [0.8, 0.25, 0.25, 0.8][kk % 4]
    ph = 2 * math.pi * kk / 8
    P = Pose(sink=sink, lean=(-0.5 if back else 1.4), leg=[df * s + 2.0, dn * s - 2.0], lift=[lf, ln], ang=[af, an],
             sway=(-0.45 if back else 0.5) + 0.4 * math.sin(2 * ph - 0.8),
             tail=[(0.9 if back else -1.5) + 1.4 * math.sin(ph + 0.6), (1.1 if back else -1.9) + 1.4 * math.sin(ph + 1.1)],
             arm=[7 * math.cos(ph - 0.5), 6 * math.cos(ph - 1.0), -7 * math.cos(ph - 0.5), -6 * math.cos(ph - 1.0)])
    return head(P)

if __name__ == '__main__':
    out = sys.argv[1] if len(sys.argv) > 1 else HERE
    rows = {'idle': [idle(k) for k in range(NI)], 'walk': [walk(k) for k in range(8)], 'wbk': [walk(k, True) for k in range(8)]}
    pics = {n: [crop(render(P)) for P in ps] for n, ps in rows.items()}
    sheet = Image.new('RGBA', (NI * CW, 3 * CH), (0, 0, 0, 0))
    for r, n in enumerate(('idle', 'walk', 'wbk')):
        for i, p in enumerate(pics[n]): sheet.alpha_composite(p, (i * CW, r * CH))
    sheet.save(out + '/heian_sheet.png', optimize=True)
    def view(frames, name, cols, K=5):
        fr = [f.crop((12, 0, 56, 100)) for f in frames]; n = len(fr); rws = (n + cols - 1) // cols; w, h = 44, 100
        im = Image.new('RGBA', (cols * w, rws * h), (36, 20, 32, 255))
        for i, f in enumerate(fr):
            c = Image.new('RGBA', (w, h), (36, 20, 32, 255)); c.alpha_composite(f); im.alpha_composite(c, ((i % cols) * w, (i // cols) * h))
        im.resize((im.width * K, im.height * K), Image.NEAREST).convert('RGB').save(out + '/' + name)
    if len(sys.argv) > 1: view(pics['idle'], 'v_idle.png', 7); view(pics['walk'], 'v_walk.png', 8, 5); view(pics['wbk'], 'v_wbk.png', 8, 5)      # (the contact sheets only when a folder is given)
    print('saved', out + '/heian_sheet.png')
