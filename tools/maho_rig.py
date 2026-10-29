# Mahoraga's rig: a pose (pelvis place, spine lean, arm and leg angles, cloth swing) -> one picture, shaded like a sculpture
# (every limb is a tube, the head and chest are ellipsoids, the cloth is saw-tooth ridges along the limbs, the light is from the upper left),
# cut into 8 cool whites and outlined. Facing right; tools/maho_anim.py makes the animations from it (and flips them to face left).
import numpy as np, math

W, H = 168, 140
GY = 136.0                       # the ground line: the soles of the feet
yy, xx = np.mgrid[0:H, 0:W].astype(float); xx += 0.5; yy += 0.5
Lv = np.array([-0.5, -0.7, 0.55]); Lv /= np.linalg.norm(Lv)
PAL = [(30, 34, 66), (56, 62, 104), (88, 98, 144), (132, 144, 188), (180, 190, 224), (220, 226, 246), (244, 246, 255), (255, 255, 255)]
OUT = (12, 14, 38)
EYE = (10, 10, 26)               # the eye slits (not an outline colour: the sheet keeps them as pixels of their own)
rad = math.radians
def dirv(a): return np.array([math.sin(rad(a)), math.cos(rad(a))])      # a = angle from straight down, forward (+x) positive: 0 down, 90 forward, 180 up, 270 back
def hh(i, k=0): return ((int(i) * 7919 + k * 104729 + 12345) * 2654435761 % 4294967296) / 4294967296.0

class Part:
    def __init__(self, m, I, u, v, zz, grp, tone=1.0, period=5.0, tilt=0.5, wrap=3.0, bands=True, wob=0.0, seed=0, amb=0.24):
        self.m, self.I, self.u, self.v, self.zz = m, I, u, v, zz
        self.grp, self.tone, self.period, self.tilt, self.wrap, self.bands, self.wob, self.seed, self.amb = grp, tone, period, tilt, wrap, bands, wob, seed, amb

def tube(P0, P1, r0, r1, grp, **kw):
    P0 = np.array(P0, float); P1 = np.array(P1, float); d = P1 - P0; Ln = float(np.hypot(*d)) + 1e-9; e = d / Ln
    s = (xx - P0[0]) * e[0] + (yy - P0[1]) * e[1]; t = np.clip(s / Ln, 0, 1)
    qx = xx - (P0[0] + t * d[0]); qy = yy - (P0[1] + t * d[1]); dist = np.hypot(qx, qy); r = r0 + (r1 - r0) * t
    m = dist < r; zz = np.sqrt(np.clip(r * r - dist * dist, 0, None)); rr = np.maximum(r, 1e-6)
    I = np.clip(qx / rr * Lv[0] + qy / rr * Lv[1] + zz / rr * Lv[2], 0, 1)
    return Part(m, I, s, qx * e[1] - qy * e[0], zz, grp, **kw)

def ell(c, rx, ry, rot, grp, pw=2.0, **kw):
    ca, sa = math.cos(rad(rot)), math.sin(rad(rot)); dx = xx - c[0]; dy = yy - c[1]
    lx = dx * ca + dy * sa; ly = -dx * sa + dy * ca; d2 = (lx / rx) ** 2 + (ly / ry) ** 2; m = (np.abs(lx / rx) ** pw + np.abs(ly / ry) ** pw) < 1 if pw != 2.0 else d2 < 1; zz = np.sqrt(np.clip(1 - d2, 0, None)); rz = (rx + ry) / 2
    nx = lx / rx ** 2; ny = ly / ry ** 2; nz = zz * rz / rz ** 2 * 1.0; nl = np.sqrt(nx * nx + ny * ny + nz * nz) + 1e-9; nx, ny, nz = nx / nl, ny / nl, nz / nl
    gx = nx * ca - ny * sa; gy = nx * sa + ny * ca        # back to the picture's axes
    I = np.clip(gx * Lv[0] + gy * Lv[1] + nz * Lv[2], 0, 1)
    return Part(m, I, ly, lx, zz * rz, grp, **kw)

def sphere(c, r, grp, **kw): return ell(c, r, r, 0, grp, **kw)

def chain(base, ang0, lens, phase, amp, vx, drag, grow=0.25):
    pts = [np.array(base, float)]
    for i, Lg in enumerate(lens):
        a = ang0 + amp * math.sin(phase - 0.75 * i) * (1 + grow * i) - drag * vx * (i + 1) * 1.5
        pts.append(pts[-1] + dirv(a) * Lg)
    return pts

def ik(H0, A, l1, l2, fwd=1.0):
    d = np.array(A, float) - np.array(H0, float); D = float(np.hypot(*d)); D = min(max(D, abs(l1 - l2) + 0.5), l1 + l2 - 0.3)
    e = d / (np.hypot(*d) + 1e-9); a = (l1 * l1 - l2 * l2 + D * D) / (2 * D); h = math.sqrt(max(l1 * l1 - a * a, 0)); mid = np.array(H0, float) + e * a
    p = np.array([-e[1], e[0]]); k1 = mid + p * h; k2 = mid - p * h
    return k1 if (k1[0] - k2[0]) * fwd >= 0 else k2

def render(pose):
    P = np.array([pose['Px'], pose['Py']], float); lam = pose.get('lam', 0.0); ht = pose.get('head', 0.0)
    up = np.array([math.sin(rad(lam)), -math.cos(rad(lam))]); fw = np.array([math.cos(rad(lam)), math.sin(rad(lam))])
    C = P + 31 * up; S = P + 26 * up + 3.5 * fw
    headang = lam + ht; hu = np.array([math.sin(rad(headang)), -math.cos(rad(headang))]); hf = np.array([math.cos(rad(headang)), math.sin(rad(headang))])
    N = C + 4.5 * np.array([math.sin(rad(lam + 0.5 * ht)), -math.cos(rad(lam + 0.5 * ht))]); Hc = N + 7.5 * hu + 0.8 * hf
    cl = pose.get('cloth', 0.0); amp = pose.get('amp', 6.0); vx = pose.get('vx', 0.0)
    parts = []
    def arm(sh, a1, flex, grp, tone):
        E = sh + 27 * dirv(a1); Wr = E + 25 * dirv(a1 + flex); F = Wr + 6.5 * dirv(a1 + flex)
        return [tube(sh, E, 9.0, 7.6, grp, tone=tone, period=5.2, tilt=0.45), tube(E, Wr, 7.6, 6.2, grp + 1, tone=tone, period=4.8, tilt=-0.4), sphere(F, 8.8, grp + 2, tone=tone, period=3.4, tilt=0.9, wrap=1.0, amb=0.26)], (sh, E, Wr, F)
    def leg(A, pitch, grp, tone, hip):
        A = np.array(A, float); K = ik(hip, A, 24.0, 23.0); c, s_ = math.cos(rad(-pitch)), math.sin(rad(-pitch)); R = np.array([[c, -s_], [s_, c]])
        hl = A + R @ np.array([-3.5, 2.6]); toe = A + R @ np.array([12.5, 3.2])
        return [tube(hip, K, 11.0, 8.8, grp, tone=tone, period=5.4, tilt=0.4), tube(K, A, 8.6, 6.2, grp + 1, tone=tone, period=5.0, tilt=-0.4), tube(hl, toe, 5.4, 3.9, grp + 2, tone=tone, bands=False, amb=0.3)], (K, A, hl, toe)
    # --- far arm and far leg, the cloth behind
    fa1, ff = pose['arm_f']; sp, jf = arm(S + np.array([-3.0, -1.0]), fa1, ff, 10, 0.78); parts += sp
    sp, jlf = leg(pose['ankle_f'], pose.get('pitch_f', 0.0), 20, 0.78, P + np.array([-1.5, 1.0])); parts += sp
    scarf = chain(N + np.array([-1.5, 1.5]), -78 + pose.get('scarf_a', 0.0), [9, 9, 8, 8, 7, 6], cl, amp * 1.6, vx, 1.0, 0.3)
    for i in range(len(scarf) - 1): parts.append(tube(scarf[i], scarf[i + 1], 5.0 - 0.5 * i, 4.5 - 0.5 * i, 30 + i, period=4.4, tilt=0.8, amb=0.22))
    belt_c = P + 6.5 * up; bk = belt_c - 7.5 * fw; ft = belt_c + 7.0 * fw
    tail_b = chain(bk + np.array([0, 3]), -8 + pose.get('tail_a', 0.0), [10, 10, 9, 8], cl + 1.3, amp, vx, 1.0)
    for i in range(len(tail_b) - 1): parts.append(tube(tail_b[i], tail_b[i + 1], 5.0 - 0.7 * i, 4.4 - 0.7 * i, 40 + i, tone=0.9, period=4.6, tilt=0.6))
    # --- the torso
    parts.append(tube(P + np.array([-0.5, 2.0]), C, 11.6, 14.0, 50, period=5.6, tilt=0.55, wrap=2.5))
    parts.append(ell(C - 5 * up + 2.6 * fw, 10.2, 12.0, lam, 50, period=6.0, tilt=0.5, wrap=2.5))
    parts.append(sphere(S + np.array([0.0, 0.5]), 10.6, 51, period=5.2, tilt=0.6))
    parts.append(tube(C, N, 6.6, 5.6, 52, period=4.0, tilt=0.5))
    parts.append(tube(belt_c - 12 * fw, belt_c + 12 * fw, 6.2, 6.2, 53, period=4.6, tilt=0.0, wrap=0.0))
    # --- near leg and the front tail
    sp, jln = leg(pose['ankle_n'], pose.get('pitch_n', 0.0), 60, 1.0, P + np.array([1.5, 1.0])); parts += sp
    tail_f = chain(ft + np.array([0, 3]), 6 + pose.get('tail_a', 0.0), [10, 10, 9, 8], cl, amp * 0.9, vx, 1.0)
    for i in range(len(tail_f) - 1): parts.append(tube(tail_f[i], tail_f[i + 1], 4.8 - 0.65 * i, 4.2 - 0.65 * i, 70 + i, period=4.6, tilt=0.6))
    # --- the head
    parts.append(ell(Hc, 9.4, 11.6, headang, 80, pw=3.0, period=4.2, tilt=0.35, wrap=2.0))
    parts.append(ell(Hc + 5.2 * hf + 0.4 * hu, 4.6, 8.4, headang, 81, pw=3.2, period=3.8, tilt=0.2, wrap=1.5))
    parts.append(ell(Hc + 2.2 * hf - 8.8 * hu, 6.6, 3.2, headang, 82, pw=3.0, period=3.4, tilt=0.3, wrap=1.0))
    # --- the near arm last (with its smear: copies of it between the last pose and this one, paler and paler)
    a1, fl = pose['arm_n']; sm = pose.get('smear', 0)
    if sm:
        pa1, pfl = pose.get('arm_prev', pose['arm_n'])
        for k in range(sm, 0, -1):
            q = k / (sm + 1.0); s2, _ = arm(S, a1 + (pa1 - a1) * q, fl + (pfl - fl) * q, 100 + 3 * k, 0.8)
            for p in s2[1:]: p.bands = False; p.m = p.m & ((np.floor((p.v + 1.4 * k) / 1.6).astype(int) % 2) == 0)      # (streaks along the limb: speed lines)
            parts += s2[1:]
    sp, jn = arm(S, a1, fl, 90, 1.0); parts += sp
    # --- compose
    pid = np.full((H, W), -1, int); val = np.zeros((H, W)); grp = np.full((H, W), -1, int)
    for i, p in enumerate(parts):
        v0 = p.amb + (1 - p.amb) * p.I
        if p.bands:
            uu = p.u + p.tilt * p.v + p.wrap * (p.zz / 8.0) + p.wob; f = (uu / p.period) % 1.0; idx = np.floor(uu / p.period).astype(int)
            v0 = np.where(f < 0.14, v0 * 0.6, np.where(f < 0.34, v0 + 0.11, v0)) + 0.025 * (((idx * 7919 + p.seed * 131) % 11) / 11.0 - 0.5)
        v0 = np.clip(v0 * p.tone, 0, 1)
        pid = np.where(p.m, i, pid); val = np.where(p.m, v0, val); grp = np.where(p.m, p.grp, grp)
    body = pid >= 0
    img = np.zeros((H, W, 4), np.uint8); q = np.clip((val * 8).astype(int), 0, 7)
    for k, c in enumerate(PAL):
        s = body & (q == k); img[s, :3] = c; img[s, 3] = 255
    def nb(a, dx, dy): return np.roll(np.roll(a, dy, axis=0), dx, axis=1)
    edge_bg = np.zeros((H, W), bool); edge_in = np.zeros((H, W), bool)
    for dx, dy in [(1, 0), (-1, 0), (0, 1), (0, -1)]:
        npid = nb(pid, dx, dy); ngrp = nb(grp, dx, dy)
        edge_bg |= body & (npid < 0); edge_in |= body & (npid >= 0) & (ngrp != grp) & (npid < pid)
    img[edge_in & ~edge_bg, :3] = (img[edge_in & ~edge_bg, :3] * 0.5).astype(np.uint8)
    img[edge_bg, :3] = OUT
    e1 = Hc + 6.0 * hf - 1.6 * hu; e2 = Hc + 6.4 * hf + 3.2 * hu
    for (e, w) in ((e1, 4), (e2, 3)):      # the eye slits: dark, two pixels high, with the dark wrapping pulled round them
        for k in range(w):
            for j in range(2):
                x = int(round(e[0] - k * hf[0] * 0.95 + 1)); y = int(round(e[1] - k * hf[1] * 0.95 + j))
                if 0 <= x < W and 0 <= y < H and body[y, x]: img[y, x, :3] = EYE
    anchors = dict(head=Hc.tolist(), eye1=e1.tolist(), eye2=e2.tolist(), fist=jn[3].tolist(), wrist=jn[2].tolist(), elbow=jn[1].tolist(), shoulder=jn[0].tolist(), pelvis=P.tolist(), footN=jln[1].tolist(), footF=jlf[1].tolist(), toeN=jln[3].tolist(), toeF=jlf[3].tolist(), chest=C.tolist())
    return img, anchors
