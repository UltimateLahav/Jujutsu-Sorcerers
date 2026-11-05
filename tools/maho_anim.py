# python3 maho_anim.py [--sheets] -> maho_anim.png (all frames, 8 per row, facing LEFT: the light is from the upper right) + maho_anim.json (the frames of every clip and their anchors)
# Clips: idle (12, loops), walk (32, loops, one stride = two steps), windup (12), punch (8), recover (12), start (8), halt (8), run (16, loops: v1.134), lunge (6), uppercut (8). Every frame is rig.render(pose).
import numpy as np, json, math, sys, os
from PIL import Image
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import maho_rig as rig

GY = rig.GY; AH = 7.0; Y0 = GY - 112.0      # (the poses were made for a ground at 112: Y0 lifts the body to the ground that is)      # the ground and how high the ankle is above the sole
PX = 70.0
def ease(t): t = max(0.0, min(1.0, t)); return t * t * (3 - 2 * t)
def lerp(a, b, t):
    if isinstance(a, (tuple, list)): return tuple(lerp(x, y, t) for x, y in zip(a, b))
    return a + (b - a) * t
def mix(p, q, t):      # a pose between two poses
    o = dict(p)
    for k, v in q.items():
        if k in p and isinstance(v, (int, float, tuple, list)) and not isinstance(v, bool): o[k] = lerp(p[k], v, t)
        else: o[k] = v
    return o

def base(**kw):
    p = dict(Px=PX, Py=63.0 + Y0, lam=3.0, head=0.0, arm_n=(8, 12), arm_f=(-6, 14), ankle_n=(80, GY - AH), ankle_f=(58, GY - AH), pitch_n=0.0, pitch_f=0.0, cloth=0.0, amp=4.5, vx=0.0, scarf_a=0.0, tail_a=0.0)
    p.update(kw); return p

# ---- idle: breathing, a little sway of the arms, the cloth moves lazily
def idle(i, n=12):
    f = 2 * math.pi * i / n
    return base(Py=63 + Y0 + 0.9 * math.sin(f), lam=3 + 1.2 * math.sin(f), head=1.5 * math.sin(f - 0.5), arm_n=(8 + 3 * math.sin(f - 0.4), 12 + 3 * math.sin(f)), arm_f=(-6 + 2 * math.sin(f - 0.9), 14 + 2 * math.sin(f)), cloth=f, amp=4.5)

# ---- walk: the feet follow a path (stance: back along the ground, swing: up and forward), the legs are solved from it, so the planted foot never slides
LLEG = 46.3
def foot(psi, S=34.0, lift=9.0, duty=0.58):
    psi %= 1.0
    if psi < duty: s = psi / duty; fx = S / 2 - S * s; fy = 0.0; pitch = 12 * (1 - min(1, s / 0.25)) - 20 * max(0, (s - 0.8) / 0.2)
    else: u = (psi - duty) / (1 - duty); e = ease(u); fx = -S / 2 + S * e; fy = lift * math.sin(math.pi * u); pitch = -20 + 32 * e
    return fx, fy, pitch, psi < duty
def walk(i, n=32):
    f = 2 * math.pi * i / n; fn = foot(i / n); ff = foot(i / n + 0.5)
    h = min([math.sqrt(max(LLEG ** 2 - x[0] ** 2, 100)) for x in (fn, ff) if x[3]] or [43.0])
    swing = math.sin(f)
    return base(Py=GY - AH - h + 0.0, lam=6 + 2 * math.cos(2 * f), head=-2, ankle_n=(PX + fn[0], GY - AH - fn[1]), ankle_f=(PX + ff[0], GY - AH - ff[1]), pitch_n=fn[2], pitch_f=ff[2],
                arm_n=(-24 * math.cos(f), 16 + 10 * max(0, math.cos(f))), arm_f=(24 * math.cos(f), 16 + 10 * max(0, -math.cos(f))), cloth=f * 1.0, amp=5.5, vx=2.1)

# ---- the key poses of the punch
STAND = idle(0)
WIND = base(Px=63, Py=67 + Y0, lam=-15, head=-5, arm_n=(196, 18), arm_f=(54, 36), cloth=0.0, amp=4, vx=-1.0)
WIND_OVER = base(Px=61, Py=68 + Y0, lam=-18, head=-6, arm_n=(204, 22), arm_f=(58, 38), cloth=0.0, amp=4, vx=-1.5)
STRIKE1 = base(Px=67, Py=67 + Y0, lam=-5, head=-5, arm_n=(190, 14), arm_f=(40, 34), ankle_n=(84, GY - AH - 3), vx=1.5, amp=6)
STRIKE2 = base(Px=77, Py=68 + Y0, lam=12, head=-7, arm_n=(124, 62), arm_f=(10, 30), ankle_n=(96, GY - AH - 5), vx=4.5, amp=7, smear=2, arm_prev=(190, 14))
STRIKE3 = base(Px=85, Py=71 + Y0, lam=26, head=-9, arm_n=(80, 36), arm_f=(-18, 40), ankle_n=(103, GY - AH - 1), vx=5.5, amp=8, smear=3, arm_prev=(124, 62))
STRIKE4 = base(Px=89, Py=74 + Y0, lam=36, head=-10, arm_n=(52, 14), arm_f=(-34, 46), ankle_n=(105, GY - AH), vx=4.0, amp=8, smear=3, arm_prev=(80, 36))
IMPACT = base(Px=91, Py=76 + Y0, lam=40, head=-11, arm_n=(40, 4), arm_f=(-40, 50), ankle_n=(105, GY - AH), vx=1.0, amp=6)
IMPACT2 = base(Px=90, Py=75.5 + Y0, lam=39, head=-10, arm_n=(41, 5), arm_f=(-38, 48), ankle_n=(105, GY - AH), vx=0.0, amp=5)
RECOIL = base(Px=88, Py=73 + Y0, lam=34, head=-8, arm_n=(46, 8), arm_f=(-30, 44), ankle_n=(105, GY - AH), vx=-1.0, amp=5)

def windup(i, n=12):
    t = i / (n - 1.0)
    if t < 0.75: return mix(STAND, WIND_OVER, ease(t / 0.75))
    return mix(WIND_OVER, WIND, ease((t - 0.75) / 0.25))
def punch(i, n=8):
    seq = [WIND, STRIKE1, STRIKE2, STRIKE3, STRIKE4, IMPACT, IMPACT2, RECOIL]
    return seq[i]
def recover(i, n=12):
    t = (i + 1) / float(n)
    p = mix(RECOIL, STAND, ease(t))
    # the arm swings up a little past the rest and settles; the foot steps back (lifted in the middle)
    p['arm_n'] = lerp(RECOIL['arm_n'], STAND['arm_n'], ease(t)); p['arm_n'] = (p['arm_n'][0] - 8 * math.sin(math.pi * t), p['arm_n'][1])
    p['ankle_n'] = (lerp(105, 80, ease(t)), GY - AH - 7 * math.sin(math.pi * ease(t)))
    p['vx'] = -1.2 * math.sin(math.pi * t); p['cloth'] = 0.4 * i
    return p


# ---- start: from standing into the walk (the near foot steps off, the body leans in, the arms begin to swing); halt: from the walk back into standing (the body straightens, the foot is drawn in, the cloth swings on)
def start(i, n=8):
    t = (i + 1) / float(n); e = ease(t); W0 = walk(0); p = mix(STAND, W0, e)
    p['ankle_n'] = (lerp(STAND['ankle_n'][0], W0['ankle_n'][0], e), GY - AH - 6 * math.sin(math.pi * e)); p['lam'] += 4 * math.sin(math.pi * t); p['vx'] = W0['vx'] * e
    return p
def halt(i, n=8):
    t = (i + 1) / float(n); e = ease(t); W0 = walk(0); p = mix(W0, STAND, e)
    p['ankle_n'] = (lerp(W0['ankle_n'][0], STAND['ankle_n'][0], e), GY - AH - 4 * math.sin(math.pi * e)); p['lam'] += 3 * math.sin(math.pi * t); p['vx'] = W0['vx'] * (1 - t) - 1.4 * math.sin(math.pi * t)
    return p

# ---- v1.134 (the alley fight of chapter 3): RUN = the charge (a foot is always down, the body leans 22 degrees forward, the arms pump); LUNGE = the straight punch at the height of a man's body from a deep crouch (the fist goes out and stays); UPPERCUT = from a crouch the near fist swings from low behind him up and forward past the face (the arm stops at 146 degrees: higher would leave the 140-pixel picture)
def run(i, n=16):
    f = 2 * math.pi * i / n; S, L, D = 46.0, 13.0, 0.5
    fn = foot(i / n, S, L, D); ff = foot(i / n + 0.5, S, L, D)
    on = [x for x in (fn, ff) if x[3]]
    h = min([math.sqrt(max(LLEG ** 2 - x[0] ** 2, 100)) for x in on]) if on else 41.0
    return base(Py=GY - AH - h + 1 + (3.0 * math.sin(2 * f) if not on else 0), lam=22, head=-11,
                ankle_n=(PX + fn[0], GY - AH - fn[1]), ankle_f=(PX + ff[0], GY - AH - ff[1]), pitch_n=fn[2], pitch_f=ff[2],
                arm_n=(10 + 50 * math.cos(f), 78), arm_f=(10 - 50 * math.cos(f), 78), cloth=f * 1.7, amp=8, vx=5.5)
def lunge(i, n=6):
    P = [
        base(Px=66, Py=84 + 4, lam=24, head=-12, arm_n=(-40, 40), arm_f=(60, 60), ankle_n=(92, GY - AH - 6), ankle_f=(48, GY - AH), pitch_n=-10, vx=5.0, amp=8),
        base(Px=66, Py=84 + 10, lam=26, head=-12, arm_n=(-60, 30), arm_f=(70, 60), ankle_n=(96, GY - AH), ankle_f=(46, GY - AH), vx=2.0, amp=6),
        base(Px=76, Py=84 + 15, lam=36, head=-14, arm_n=(60, 40), arm_f=(10, 50), ankle_n=(106, GY - AH - 1), ankle_f=(50, GY - AH), vx=5.0, amp=8, smear=2, arm_prev=(-60, 30)),
        base(Px=86, Py=84 + 18, lam=40, head=-15, arm_n=(98, 8), arm_f=(-10, 50), ankle_n=(112, GY - AH), ankle_f=(54, GY - AH), vx=5.5, amp=9, smear=3, arm_prev=(60, 40)),
        base(Px=88, Py=84 + 18, lam=40, head=-14, arm_n=(98, 6), arm_f=(-12, 52), ankle_n=(112, GY - AH), ankle_f=(54, GY - AH), vx=2.0, amp=7),
        base(Px=88, Py=84 + 17, lam=38, head=-13, arm_n=(96, 6), arm_f=(-10, 52), ankle_n=(112, GY - AH), ankle_f=(54, GY - AH), vx=-1.0, amp=6),
    ]
    return P[i]
def uppercut(i, n=8):
    P = [
        base(Px=62, Py=84 + 11, lam=-12, head=-6, arm_n=(-30, 12), arm_f=(70, 50), ankle_n=(84, GY - AH), ankle_f=(46, GY - AH), vx=-1.0, amp=4),
        base(Px=64, Py=84 + 13, lam=-16, head=-8, arm_n=(-40, 8), arm_f=(76, 52), ankle_n=(84, GY - AH), ankle_f=(46, GY - AH), vx=-1.5, amp=4),
        base(Px=70, Py=84 + 9, lam=4, head=-10, arm_n=(30, 26), arm_f=(60, 50), ankle_n=(90, GY - AH), ankle_f=(48, GY - AH), vx=2.5, amp=6, smear=2, arm_prev=(-40, 8)),
        base(Px=76, Py=84 + 6, lam=14, head=-12, arm_n=(78, 30), arm_f=(40, 50), ankle_n=(95, GY - AH), ankle_f=(50, GY - AH), vx=4.0, amp=7, smear=3, arm_prev=(30, 26)),
        base(Px=80, Py=84 + 5, lam=20, head=-14, arm_n=(118, 20), arm_f=(20, 50), ankle_n=(98, GY - AH - 2), ankle_f=(52, GY - AH), vx=5.0, amp=8, smear=3, arm_prev=(78, 30)),
        base(Px=82, Py=84 + 5, lam=20, head=-12, arm_n=(140, 12), arm_f=(10, 46), ankle_n=(98, GY - AH - 6), ankle_f=(54, GY - AH), pitch_n=-12, vx=4.0, amp=8, smear=2, arm_prev=(118, 20)),
        base(Px=83, Py=84 + 5, lam=16, head=-10, arm_n=(146, 8), arm_f=(0, 44), ankle_n=(98, GY - AH - 10), ankle_f=(56, GY - AH), pitch_n=-20, vx=1.5, amp=7),
        base(Px=83, Py=84 + 6, lam=14, head=-9, arm_n=(144, 8), arm_f=(2, 44), ankle_n=(98, GY - AH - 8), ankle_f=(56, GY - AH), pitch_n=-18, vx=0.0, amp=5),
    ]
    return P[i]
# ---- v1.135 (the air fight of chapter 3): everything here is in the air (no ground: the pelvis is where the clip puts it, the game hangs each picture on its pelvis anchor)
CUT = 0.38      # the share of the forearm that stays when Sukuna cuts the arm off
AY = 90.0       # the height of the pelvis in the air pictures (the arms up reach the top of the 140-pixel picture)
def air(**kw):
    p = base(Px=PX, Py=AY, lam=4.0, head=-4.0, arm_n=(46, 74), arm_f=(28, 82), ankle_n=(PX + 6, AY + 38), ankle_f=(PX - 8, AY + 41), pitch_n=-16.0, pitch_f=-20.0, cloth=0.0, amp=6.5, vx=-0.5, scarf_a=0.0, tail_a=0.0)
    p.update(kw); return p
def keyed(K, i):      # a pose between key poses {picture: pose}
    ks = sorted(K)
    if i <= ks[0]: return K[ks[0]]
    for a, b in zip(ks, ks[1:]):
        if a <= i <= b: return mix(K[a], K[b], ease((i - a) / float(b - a)))
    return K[ks[-1]]
def floatp(i, n=12, guard=0.0, **kw):      # hovering: calm and upright (the arms a little away from the body, the legs straight and hanging, the toes down), the body breathes, the cloth waves; guard 0 - 1 brings the fists up in front
    f = 2 * math.pi * i / n; sn = math.sin; py = AY + 1.6 * sn(f)
    calm = air(Py=py, lam=2 + 1.2 * sn(f - 0.4), head=-2 + 1.2 * sn(f - 0.8), arm_n=(16 + 3 * sn(f), 20 + 3 * sn(f + 0.5)), arm_f=(-8 + 3 * sn(f + 1), 22 + 2 * sn(f)), ankle_n=(PX + 4, py + 43 + sn(f)), ankle_f=(PX - 5, py + 44 + sn(f - 1)), pitch_n=-38, pitch_f=-42, cloth=f, amp=6.5)
    gd = air(Py=py, lam=6 + 1.5 * sn(f - 0.4), head=-5 + 1.5 * sn(f - 0.8), arm_n=(50 + 5 * sn(f), 78 + 4 * sn(f + 0.5)), arm_f=(30 + 4 * sn(f + 1), 86 + 3 * sn(f)), ankle_n=(PX + 7, py + 39 + 2 * sn(f)), ankle_f=(PX - 8, py + 42 + 2 * sn(f - 1)), pitch_n=-22, pitch_f=-26, cloth=f, amp=6.5)
    q = mix(calm, gd, guard) if guard > 0 else calm; q.update(kw); return q
def floatg(i, n=12): return floatp(i, n, guard=1.0)      # (the ready stance)
def crouch(i, n=8):      # the look up and the dip before the leap: he watches Sukuna, then folds down into a deep crouch with the arms swept back
    K0 = base(lam=3, head=-6, ankle_n=(80, GY - AH), ankle_f=(58, GY - AH)); K0['Py'] = 63 + Y0
    K1 = dict(K0, lam=0, head=-26, Py=63 + Y0 - 1)
    K2 = base(Px=66, Py=GY - AH - 36, lam=10, head=-20, arm_n=(-30, 14), arm_f=(-36, 12), ankle_n=(PX + 15, GY - AH), ankle_f=(PX - 10, GY - AH), cloth=0.6, amp=5)
    K3 = base(Px=62, Py=GY - AH - 28, lam=22, head=-24, arm_n=(-58, 10), arm_f=(-66, 8), ankle_n=(PX + 17, GY - AH), ankle_f=(PX - 12, GY - AH), cloth=0.6, amp=4)
    q = keyed({0: K0, 1: K1, 3: K2, 5: K3, 7: K3}, i)
    if i >= 6: q = dict(q, Py=q['Py'] + (1.0 if i == 6 else -0.5))
    q['cloth'] = 0.45 * i; return q
def leap(i, n=8):      # the push-off (0: the legs straight, the toes on the floor, the arms swung up), then up: the body stretched, the arms overhead, the legs trailing, the cloth streaming down
    P0 = base(Px=PX, Py=AY + 3, lam=12, head=-8, arm_n=(112, 24), arm_f=(124, 20), ankle_n=(PX + 2, AY + 3 + 41), ankle_f=(PX - 12, AY + 3 + 43), pitch_n=-35, pitch_f=-40, cloth=0.2, amp=7, vx=-2.5)
    P1 = air(Py=AY + 6, lam=8, head=-6, arm_n=(116, 24), arm_f=(126, 20), ankle_n=(PX - 3, AY + 6 + 43), ankle_f=(PX - 11, AY + 6 + 45), pitch_n=-30, pitch_f=-34, cloth=1.0, amp=9, vx=-4.0, scarf_a=50, tail_a=20)
    P2 = air(Py=AY, lam=6, head=-4, arm_n=(120, 22), arm_f=(130, 18), ankle_n=(PX - 4, AY + 43), ankle_f=(PX - 10, AY + 45), pitch_n=-28, pitch_f=-32, cloth=2.2, amp=10, vx=-5.0, scarf_a=60, tail_a=28)
    q = keyed({0: P0, 2: P1, 7: P2}, i); q['cloth'] = 0.9 * i; return q
def apunch(i, n=16):      # the flying punch: the wind-up in the air (0 - 5), the burst (6 - 11: smears), the arm out (12 - 13) and the recovery (14 - 15)
    A0 = floatp(0, guard=1.0)
    A1 = air(Px=61, Py=AY + 3, lam=-20, head=-8, arm_n=(196, 22), arm_f=(56, 38), ankle_n=(PX - 2, AY + 40), ankle_f=(PX - 14, AY + 43), pitch_n=-20, pitch_f=-24, cloth=1.0, amp=4, vx=-1.5)
    A2 = air(Px=76, Py=AY - 1, lam=14, head=-10, arm_n=(124, 62), arm_f=(10, 30), ankle_n=(PX - 8, AY + 38), ankle_f=(PX - 22, AY + 40), pitch_n=-30, pitch_f=-34, vx=4.5, amp=7, smear=2, arm_prev=(198, 22), cloth=2.0)
    A3 = air(Px=84, Py=AY - 2, lam=30, head=-12, arm_n=(82, 34), arm_f=(-18, 40), ankle_n=(PX - 20, AY + 35), ankle_f=(PX - 34, AY + 37), pitch_n=-40, pitch_f=-42, vx=5.5, amp=8, smear=3, arm_prev=(124, 62), cloth=2.6)
    A4 = air(Px=88, Py=AY - 2, lam=44, head=-14, arm_n=(66, 10), arm_f=(-36, 46), ankle_n=(PX - 34, AY + 28), ankle_f=(PX - 46, AY + 30), pitch_n=-50, pitch_f=-50, vx=5.0, amp=8, smear=3, arm_prev=(82, 34), cloth=3.0)
    A5 = air(Px=89, Py=AY - 1, lam=48, head=-14, arm_n=(78, 4), arm_f=(-40, 50), ankle_n=(PX - 38, AY + 26), ankle_f=(PX - 50, AY + 28), pitch_n=-52, pitch_f=-52, vx=2.0, amp=6, cloth=3.4)
    A6 = air(Px=86, Py=AY, lam=40, head=-12, arm_n=(76, 6), arm_f=(-34, 46), ankle_n=(PX - 30, AY + 30), ankle_f=(PX - 42, AY + 33), pitch_n=-46, pitch_f=-48, vx=0.0, amp=5, cloth=3.8)
    if i < 6: return mix(A0, A1, ease(i / 5.0))
    if i < 12: return {6: A2, 7: mix(A2, A3, 0.5), 8: A3, 9: mix(A3, A4, 0.5), 10: A4, 11: A5}[i]
    return {12: A5, 13: A5, 14: mix(A5, A6, 0.6), 15: A6}[i]
def stump_pose(i, n=6):      # the reaction to the cut: thrown back, the head snaps, the stump drawn in to the chest
    K = {0: air(Px=62, Py=AY + 2, lam=-26, head=-22, arm_n=(52, 30), cut_n=CUT, arm_f=(56, 44), ankle_n=(PX, AY + 40), ankle_f=(PX - 14, AY + 43), pitch_n=-20, pitch_f=-26, vx=-3.5, amp=7, cloth=0.5),
         1: air(Px=58, Py=AY + 3, lam=-34, head=-26, arm_n=(46, 34), cut_n=CUT, arm_f=(70, 50), ankle_n=(PX - 2, AY + 40), ankle_f=(PX - 16, AY + 42), pitch_n=-24, pitch_f=-28, vx=-3.0, amp=8, cloth=1.0),
         3: air(Px=62, Py=AY + 2, lam=-22, head=-18, arm_n=(44, 30), cut_n=CUT, arm_f=(50, 56), ankle_n=(PX + 2, AY + 40), ankle_f=(PX - 12, AY + 43), vx=-1.5, amp=6, cloth=1.8),
         5: floatp(0, cut_n=CUT, arm_n=(40, 22))}
    q = keyed(K, i); return q
def floats(i, n=12):      # hovering with the stump (the far arm up, the stump hanging low)
    return floatp(i, n, cut_n=CUT, arm_n=(40 + 3 * math.sin(2 * math.pi * i / n), 22))
def grab(i, n=8):      # the other hand opens and reaches across to Sukuna, the fingers wide (0 - 3), then closes on him (4 - 7)
    G0 = floats(0)
    G1 = air(Px=78, Py=AY, lam=18, head=-8, arm_n=(-10, 14), cut_n=CUT, arm_f=(70, 30), open_f=0.4, ankle_n=(PX - 4, AY + 40), ankle_f=(PX - 18, AY + 42), pitch_n=-26, pitch_f=-30, vx=3.0, amp=7, cloth=1.4)
    G2 = air(Px=84, Py=AY - 1, lam=30, head=-10, arm_n=(-14, 14), cut_n=CUT, arm_f=(92, 8), open_f=1.0, ankle_n=(PX - 20, AY + 36), ankle_f=(PX - 34, AY + 38), pitch_n=-40, pitch_f=-42, vx=4.0, amp=8, cloth=2.2, smear_f=2, arm_prev_f=(70, 30))
    G3 = air(Px=85, Py=AY - 1, lam=32, head=-10, arm_n=(-14, 14), cut_n=CUT, arm_f=(95, 4), open_f=1.0, ankle_n=(PX - 22, AY + 35), ankle_f=(PX - 36, AY + 37), pitch_n=-42, pitch_f=-44, vx=1.0, amp=6, cloth=2.8)
    G4 = dict(G3, open_f=0.35, arm_f=(94, 2), Px=84, cloth=3.2)
    q = {0: G0, 2: G1, 3: G2, 4: G3, 5: G4, 7: dict(G4, Px=83, cloth=4.0)}; return keyed(q, i)
def throw(i, n=10):      # the heave: from the grip (0) the arm lifts him up and back (1 - 3), swings down hard (4 - 6: the body folds forward, the head goes down; he is let go on 6), follows through (7 - 9)
    G4 = grab(5)
    T0 = air(Px=80, Py=AY, lam=22, head=-12, arm_n=(-12, 12), cut_n=CUT, arm_f=(150, 20), open_f=0.35, ankle_n=(PX - 14, AY + 38), ankle_f=(PX - 28, AY + 40), pitch_n=-34, pitch_f=-36, vx=-1.0, amp=6, cloth=0.5)
    T1 = air(Px=84, Py=AY + 1, lam=28, head=-6, arm_n=(-16, 12), cut_n=CUT, arm_f=(112, 16), open_f=0.35, ankle_n=(PX - 22, AY + 36), ankle_f=(PX - 36, AY + 38), pitch_n=-42, pitch_f=-44, vx=3.0, amp=8, cloth=1.2, smear_f=2, arm_prev_f=(150, 20))
    T2 = air(Px=86, Py=AY + 3, lam=34, head=2, arm_n=(-20, 12), cut_n=CUT, arm_f=(64, 14), open_f=0.4, ankle_n=(PX - 30, AY + 32), ankle_f=(PX - 44, AY + 34), pitch_n=-50, pitch_f=-52, vx=5.0, amp=9, cloth=2.0, smear_f=3, arm_prev_f=(112, 16))
    T3 = air(Px=88, Py=AY + 5, lam=40, head=8, arm_n=(-22, 12), cut_n=CUT, arm_f=(26, 8), open_f=0.7, ankle_n=(PX - 34, AY + 28), ankle_f=(PX - 48, AY + 30), pitch_n=-54, pitch_f=-54, vx=5.0, amp=9, cloth=2.8, smear_f=3, arm_prev_f=(64, 14))
    T4 = air(Px=89, Py=AY + 6, lam=42, head=10, arm_n=(-22, 12), cut_n=CUT, arm_f=(14, 8), open_f=0.9, ankle_n=(PX - 36, AY + 27), ankle_f=(PX - 50, AY + 29), pitch_n=-54, pitch_f=-54, vx=1.0, amp=7, cloth=3.4)
    return keyed({0: G4, 2: T0, 4: T1, 5: T2, 6: T3, 7: T4, 9: dict(T4, Px=88, lam=38, head=8, cloth=4.2)}, i)
def flyp(i, n=6, **kw):      # flung: the body stretched out, head first, the arms reaching ahead (for the rope), the legs together trailing, the cloth whipping (the game turns the picture to the way he flies)
    f = 2 * math.pi * i / n
    q = air(Px=62, Py=AY - 8, lam=74, head=-10, arm_n=(98 + 3 * math.sin(f), 8), arm_f=(106 + 3 * math.sin(f + 1), 6), ankle_n=(30, AY - 8 + 22), ankle_f=(24, AY - 8 + 24), pitch_n=-60, pitch_f=-64, cloth=f * 1.5, amp=10, vx=-4.0, scarf_a=30, tail_a=20); q.update(kw); return q
def regrow(i, n=10):      # the same flung pose while the arm grows back out of the stump
    u = ease(i / (n - 1.0)); return flyp(i % 6, cut_n=CUT + (1.0 - CUT) * u)
def armpiece(i, n=1): return dict(piece=CUT)      # the forearm that was cut off
def flys(i, n=6): return flyp(i, n, cut_n=CUT)      # the flung pose with the stump (the arm has not grown back yet)
CLIPS = [('idle', 12, idle), ('walk', 32, walk), ('windup', 12, windup), ('punch', 8, punch), ('recover', 12, recover), ('start', 8, start), ('halt', 8, halt), ('run', 16, run), ('lunge', 6, lunge), ('uppercut', 8, uppercut), ('crouch', 8, crouch), ('leap', 8, leap), ('float', 12, floatp), ('apunch', 16, apunch), ('stump', 6, stump_pose), ('floats', 12, floats), ('grab', 8, grab), ('throw', 10, throw), ('fly', 6, flyp), ('regrow', 10, regrow), ('arm', 1, armpiece), ('flys', 6, flys), ('floatg', 12, floatg)]      # (new clips go at the END: the numbers of the older pictures must not move)
def build(flip=True, outdir=None):
    outdir = outdir or os.path.dirname(os.path.abspath(__file__)); frames = []; meta = {'w': rig.W, 'h': rig.H, 'clips': {}, 'frames': []}
    for name, n, fn in CLIPS:
        meta['clips'][name] = [len(frames), n]
        for i in range(n):
            img, a = rig.render(fn(i, n) if fn is not punch else fn(i))
            if flip:
                img = img[:, ::-1].copy()
                for k, v in a.items(): a[k] = [rig.W - v[0], v[1]]
            frames.append(img); meta['frames'].append(a)
    cols = 8; rows = (len(frames) + cols - 1) // cols; sheet = np.zeros((rows * rig.H, cols * rig.W, 4), np.uint8)
    for k, im in enumerate(frames): r, c = divmod(k, cols); sheet[r * rig.H:(r + 1) * rig.H, c * rig.W:(c + 1) * rig.W] = im
    meta['cols'] = cols; pal = [c for c in rig.PAL] + [rig.OUT, rig.EYE] + list(rig.BLOOD); pi = Image.new('P', (sheet.shape[1], sheet.shape[0]), 0); pi.putpalette([0, 0, 0] + [v for c in pal for v in c]); idx = np.zeros(sheet.shape[:2], np.uint8)
    for k, c in enumerate(pal): idx[(sheet[:, :, :3] == c).all(axis=2) & (sheet[:, :, 3] > 0)] = k + 1
    pi = Image.fromarray(idx, 'P'); pi.putpalette([0, 0, 0] + [v for c in pal for v in c]); pi.save(os.path.join(outdir, 'maho_anim.png'), transparency=0, optimize=True)
    json.dump(meta, open(os.path.join(outdir, 'maho_anim.json'), 'w'), separators=(',', ':'))
    return frames, meta

if __name__ == '__main__':
    frames, meta = build()
    print(len(frames), 'frames', meta['clips'], os.path.getsize(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'maho_anim.png')), 'bytes')
    # contact sheets (1x, on the room's dark blue) for looking at the clips: only with --sheets
    here = os.path.dirname(os.path.abspath(__file__))
    for name, (s, n) in (meta['clips'].items() if '--sheets' in sys.argv else []):
        cols = 8 if n > 8 else n; rows = (n + cols - 1) // cols; z = 1
        pv = Image.new('RGBA', (cols * rig.W * z, rows * rig.H * z), (14, 24, 54, 255))
        for k in range(n):
            r, c = divmod(k, cols); im = Image.fromarray(frames[s + k]); pv.paste(im, (c * rig.W * z, r * rig.H * z), im)
        pv.save(os.path.join(here, f'clip_{name}.png'))
