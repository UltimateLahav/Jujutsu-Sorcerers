#!/usr/bin/env python3
"""Gojo in the higher-ups' room (chapter 1 ending), seen from behind and above like the swordsman of your picture: white spiky hair with the black blindfold band, the black high-collar uniform, a warm rim of light on everything that faces the windows. The shapes are rasterised at 4x and cut to whole pixels, then lit by rule (a warm rim on every top edge, a dark line between an arm and the body), so every frame is clean pixel art.
strips() -> {'rgIdle': he stands (15 frames: breathing, the hair stirs, a slow look round), 'rgWalk': he walks away from the camera (15 frames), 'rgUp': he looks up at the roof (15 frames)}; each one a PNG data URL, 15 frames of 32x44, the middle of his feet at column 16, row 39. story_art.py puts them into story_art.json as art['outro'].
Run on its own to write contact sheets:  python3 -B room_gojo.py <dir>"""
import base64, io, math, os, sys
import numpy as np
from PIL import Image, ImageDraw
HERE = os.path.dirname(os.path.abspath(__file__))
CW, CH, AX, AY, SS, N = 32, 44, 16, 39, 4, 15
def url(im): b = io.BytesIO(); im.save(b, 'PNG', optimize=True); return 'data:image/png;base64,' + base64.b64encode(b.getvalue()).decode()

# ---------------------------------------------------------------- shapes (x right, y down, in pixels; (0, 0) = the middle of his feet on the floor)
def raster(draw_fn):                                          # a shape -> a boolean mask of the cell (4x supersampled: a pixel is in when at least half of it is covered)
    im = Image.new('L', (CW * SS, CH * SS), 0); d = ImageDraw.Draw(im); draw_fn(d, lambda x, y: ((AX + 0.5 + x) * SS, (AY + y) * SS))
    return np.asarray(im.resize((CW, CH), Image.BOX)) >= 128
def poly(pts): return raster(lambda d, T: d.polygon([T(*p) for p in pts], fill=255))
def ell(cx, cy, rx, ry): return raster(lambda d, T: d.ellipse([*T(cx - rx, cy - ry), *T(cx + rx, cy + ry)], fill=255))
def cap(x0, y0, x1, y1, r0, r1=None):                          # a limb: a tapered capsule from (x0, y0) to (x1, y1)
    r1 = r0 if r1 is None else r1; L = math.hypot(x1 - x0, y1 - y0) or 1; nx, ny = -(y1 - y0) / L, (x1 - x0) / L
    def f(d, T):
        d.polygon([T(x0 + nx * r0, y0 + ny * r0), T(x1 + nx * r1, y1 + ny * r1), T(x1 - nx * r1, y1 - ny * r1), T(x0 - nx * r0, y0 - ny * r0)], fill=255)
        for (x, y, r) in ((x0, y0, r0), (x1, y1, r1)): d.ellipse([*T(x - r, y - r), *T(x + r, y + r)], fill=255)
    return raster(f)

# ---------------------------------------------------------------- colours
C = {'.': (0, 0, 0, 0),
     'w': (255, 242, 214, 255), 'W': (232, 226, 246, 255), 'h': (178, 170, 212, 255), 'd': (132, 124, 176, 255),      # hair: lit by the windows, mid, shade, deep shade
     'b': (14, 12, 24, 255),                                                                                          # the blindfold band
     'n': (150, 98, 84, 255), 'N': (206, 140, 104, 255),                                                              # skin (the neck): shade, lit
     'J': (28, 24, 52, 255), 'j': (62, 54, 106, 255), 'K': (12, 10, 24, 255), 'k': (20, 17, 38, 255),                  # the uniform: mid, lit (a top edge), the dark lines between arm and body, soft dark
     'P': (22, 19, 40, 255), 'p': (44, 38, 78, 255),                                                                  # trousers: mid, lit
     'S': (10, 8, 18, 255), 's': (84, 52, 44, 255), 'x': (0, 0, 0, 96)}                                               # shoes, their lit top edge, the soft shadow on the floor
RIM = {'W': 'w', 'J': 'j', 'P': 'p', 'S': 's', 'n': 'N', 'h': 'W', 'k': 'j'}                                         # what a pixel turns into when the pixel above it is empty (the windows are in front of him)

# the spikes of the hair: (angle from straight up in degrees, how far it sticks out of the head, half width of its base); uneven on purpose
SPIKES = [(-112, 1.9, 1.2), (-86, 2.5, 1.4), (-60, 3.0, 1.5), (-34, 3.5, 1.5), (-9, 3.3, 1.6), (14, 3.8, 1.6), (38, 3.2, 1.5), (62, 3.0, 1.5), (87, 2.4, 1.4), (113, 1.9, 1.2)]

def render(p):
    """p: the pose. Returns (a letter grid of the frame, the hair mask)."""
    g = np.full((CH, CW), '.', dtype='<U1')
    def put(m, c): g[m] = c
    by = p.get('bob', 0.0)                                                 # the whole body up (-) or down (+)
    lean = p.get('lean', 0.0); sy = -22.0 + by + p.get('sh', 0.0); hip = -14.2 + by; hem = -11.0 + by
    put(ell(0, 0.4, 7.0, 2.0), 'x')                                        # the soft shadow on the floor
    for side, fy in ((-1, p['footL']), (1, p['footR'])):                    # legs, from the hip to the foot, and the shoe at the foot
        fx = side * (2.1 + p.get('splay', 0.0)); y = -1.8 + fy
        put(cap(side * 1.9, hip, fx, y - 0.4, 1.9, 1.7), 'P'); put(poly([(fx - 2.1, y - 0.8), (fx + 2.1, y - 0.8), (fx + 2.3, y + 1.9), (fx - 2.3, y + 1.9)]), 'S')
    torso = poly([(-4.6 + lean, sy), (4.6 + lean, sy), (3.8, hip - 1.4), (5.0, hem), (-5.0, hem), (-3.8, hip - 1.4)])      # the jacket: shoulders, a narrow waist, a skirt that flares over the hips
    put(torso, 'J')
    for side, ay in ((-1, p['armL']), (1, p['armR'])):                      # the sleeves: they hang from the shoulders to the hips (his hands are in his pockets)
        sx, ex = side * 5.7 + lean * 0.7, side * (6.0 + p.get('armout', 0.0)); ey = hip + 1.2 + ay
        m = cap(sx, sy + 1.4, ex, ey, 1.45, 1.35); put(m, 'J')
        inner = m & ~np.roll(m, side, 1) & np.roll(torso, side, 1); inner[:int(AY + sy + 4)] = False; put(inner, 'K')      # (a dark line between the arm and the body, from the shoulder down)
        put(m & (np.arange(CH)[:, None] >= int(AY + ey - 1.4)), 'k')       # the cuff
    put(poly([(-3.3 + lean, sy - 2.8), (3.3 + lean, sy - 2.8), (4.3 + lean, sy + 0.6), (-4.3 + lean, sy + 0.6)]), 'J')     # the high collar
    hy = -27.4 + by + p.get('headdy', 0.0) + p.get('sh', 0.0); hx = p.get('headdx', 0.0) + lean; rx, ry = 4.1, p.get('hry', 3.7)
    put(poly([(-1.6 + hx, hy + 2.4), (1.6 + hx, hy + 2.4), (1.8 + lean, sy - 1.6), (-1.8 + lean, sy - 1.6)]), 'n')       # the neck
    hair = ell(hx, hy, rx, ry)
    for (a, prot, w), sw in zip(SPIKES, p.get('sway', [0] * len(SPIKES))):    # the spikes: a triangle from inside the head out to the tip (sway turns the tip a little)
        ar = math.radians(a); r0 = (rx * ry) / math.hypot(ry * math.sin(ar), rx * math.cos(ar)); at = math.radians(a + sw); r1 = r0 + prot * p.get('hlen', 1.0)
        tipx, tipy = hx + r1 * math.sin(at) * p.get('hspread', 1.0), hy - r1 * math.cos(at) * p.get('hlift', 1.0)
        bx, bY = hx + r0 * 0.5 * math.sin(ar), hy - r0 * 0.5 * math.cos(ar); nx, ny = math.cos(ar), math.sin(ar)
        hair |= poly([(bx - nx * w, bY - ny * w), (bx + nx * w, bY + ny * w), (tipx, tipy)])
    put(hair, 'W')
    cols = np.arange(CW)[None, :]; rows = np.arange(CH)[:, None]; hy_px = AY + hy; hx_px = AX + 0.5 + hx
    for a0, a1 in zip([s_[0] for s_ in SPIKES][1:-1], [s_[0] for s_ in SPIKES][2:-1]):      # the clumps of hair: a short darker line runs in from the notch between two spikes
        v = math.radians((a0 + a1) / 2)
        for r in np.arange(rx * 0.55, rx * 1.1, 0.4):
            x, y = int(math.floor(hx_px + r * math.sin(v))), int(math.floor(hy_px - r * math.cos(v) * ry / rx))
            if 0 <= x < CW and 0 <= y < CH and hair[y, x] and y < hy_px - 0.5: g[y, x] = 'h'
    put(hair & (rows >= int(round(hy_px + ry - 0.9))) & (np.abs(cols - hx_px + 0.5) <= rx - 1.2), 'h')      # the lowest row of the head, next to the neck, is in the shade
    # ---- lighting by rule
    up = np.vstack([np.full((1, CW), '.'), g[:-1]])
    g = np.where((g == 'P') & (up == 'J'), 'K', g); up = np.vstack([np.full((1, CW), '.'), g[:-1]])      # (a dark line under the hem, where the jacket lies over the trousers)
    rt = np.hstack([g[:, 1:], np.full((CH, 1), '.')]); rimv = np.vectorize(lambda c: RIM.get(c, c))(g)
    lit = np.where(((up == '.') | (up == 'x')) & (g != 'x') & (g != '.'), rimv, g)
    lit = np.where(((rt == '.') | (rt == 'x')) & np.isin(g, ['J', 'P', 'k']) & (lit == g), np.vectorize(lambda c: RIM.get(c, c))(g), lit)      # (light from the upper right: the right edge of the jacket and trousers is lit)
    return lit, hair

def to_img(g):                                                             # the letter grid -> an RGBA picture
    a = np.zeros((CH, CW, 4), np.uint8)
    for k, c in C.items(): a[g == k] = c
    return Image.fromarray(a, 'RGBA')

def base(**kw):
    p = dict(footL=0.0, footR=0.0, armL=0.0, armR=0.0, sway=[0] * len(SPIKES)); p.update(kw); return p

def idle(i):                                                               # standing: he breathes (shoulders rise a pixel), the hair stirs, he turns his head slowly to the left and back
    t = 2 * math.pi * i / N; k = math.sin(t)
    sway = [round(5 * math.sin(t + 0.9 * j + (1.7 if j % 2 else 0)), 1) for j in range(len(SPIKES))]
    turn = math.sin(t) ** 3                                                # (a slow look round: -1 .. 1, mostly resting at 0)
    return base(sh=-0.7 * max(0, k), headdx=round(0.8 * turn), hem=0, sway=sway, armL=0.25 * k, armR=-0.25 * k)

def walk(i):                                                               # walking away: the feet take turns (the foot that goes forward moves UP the picture), the arms swing the other way, the body bobs, the hair lags behind
    t = 2 * math.pi * i / N; s = math.sin(t); c = math.cos(t)
    sway = [round(7 * math.sin(t - 0.8 - 0.5 * j), 1) for j in range(len(SPIKES))]
    return base(footL=-3.2 * s, footR=3.2 * s, armL=2.0 * s, armR=-2.0 * s, bob=-1.0 if abs(s) < 0.5 else 0.0, sway=sway, lean=0.6 * math.sin(t + 0.5), splay=0.3 * abs(c))

def lookup(i):                                                             # he looks up at the roof: a flinch (the shoulders jump), then the head goes back and the hair spreads
    k = min(1, i / 8.0); e = k * k * (3 - 2 * k); fl = max(0.0, 1 - abs(i - 2.5) / 2.5)
    sway = [round(-8 * e + 3 * math.sin(i * 0.9 + j), 1) for j in range(len(SPIKES))]
    return base(sh=-1.4 * fl - 0.6 * e, headdy=1.3 * e, bandy=2.4 * e, hspread=1 + 0.1 * e, sway=sway, armL=0.5 * e, armR=0.5 * e, bob=-1.0 * fl)

def strip(fn):
    out = Image.new('RGBA', (CW * N, CH), (0, 0, 0, 0))
    for i in range(N): out.paste(to_img(render(fn(i))[0]), (i * CW, 0))
    return out
def strips(): return {'rgIdle': url(strip(idle)), 'rgWalk': url(strip(walk)), 'rgUp': url(strip(lookup))}

def preview(d):                                                            # the figures on the room picture, magnified: standing in the lit circle, and the three strips
    room = Image.open(os.path.join(d, 'room.png')).convert('RGBA'); Z = 8
    fr = to_img(render(idle(0))[0]); a = room.copy(); a.alpha_composite(fr, (160 - AX, 82 - AY))
    a.crop((110, 20, 210, 110)).resize((100 * Z, 90 * Z), Image.NEAREST).save(os.path.join(d, 'rg_room.png'))
    for nm, fn in (('idle', idle), ('walk', walk), ('up', lookup)):
        s = strip(fn); bg = Image.new('RGBA', s.size, (214, 120, 32, 255)); bg.alpha_composite(s); bg.resize((s.width * 3, s.height * 3), Image.NEAREST).save(os.path.join(d, 'rg_%s.png' % nm))
if __name__ == '__main__':
    preview(sys.argv[1] if len(sys.argv) > 1 else '.')
