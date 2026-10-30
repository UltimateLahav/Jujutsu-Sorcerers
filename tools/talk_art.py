#!/usr/bin/env python3
"""v1.16 art. Writes talk.json (name -> PNG data URL, 15 frames side by side in every strip, plus the voice clip as a data URL):
 ballTalk  = Verity's smiley ball TALKING (13x13 a frame, the mouth opens and closes);
 cat.hugegrab = the HUGE Cat of the Cartoon Cat's CARTOON ATTACK reaching down, GRABBING the small Cat, lifting him out of sight, and THROWING him at the enemy (drawn 3 times as big by the game, 128x64 a frame like 'huge');
 cat.held  = the small Cat in the giant's glove, wriggling; cat.toss = the small Cat thrown, tumbling head over heels once in the 15 frames;
 hand      = where the giant's hand is on each of the 15 frames (the pose's x / y), so the game can put the held Cat in it;
 v1.114: cat.hangup / hang / hangmv / pound = the Cat's ARM HANG and GROUND POUND (jump + ATTACK, then crouch): the arms shooting up, hanging, hanging and moving hand over hand, and the dive, impact and recovery of the pound."""
import base64, io, json, math, os, sys
from PIL import Image
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import cat_rig as C
HERE = os.path.dirname(os.path.abspath(__file__)); N = 15
S = (5.4, 20.8)                                                                           # the giant's near shoulder (as in the other Cat poses)
HAND = [(0, (8.2, 46)), (1, (11, 34)), (2, (14, 12)), (3, (17, 20)), (4, (20.5, 42)), (5, (21.5, 52)), (6, (20.5, 46)), (7, (13, 28)), (8, (4, 16)), (8.6, (8, 14)), (9.5, (36, 20)), (10.5, (44, 28)), (12, (38, 36)), (14, (9, 44))]
def a_hugegrab(i):                                # THE GIANT: he pops up, swings the arm up (1-2), swoops down and opens the glove over the small Cat (3-5), closes it on him (5-6), lifts and winds back above his head (6-8), thrusts forward and lets go on frame 9 (the game throws the Cat), follows through and comes back
    f = float(i); H = C.hand(f, HAND)
    gR = C.sc(f, [(0, 0.0), (2, 0.0), (4, 1.0), (5, 1.0), (6, 0.3), (8.5, 0.3), (9.5, 1.0), (11, 1.0), (14, 0.3)])
    lean = C.sc(f, [(0, 0), (2, -3), (5, 6), (8, -8), (10, 9), (12, 4), (14, 0)])
    return C.pose(lean=lean, hrot=C.sc(f, [(0, 0), (4, 5), (8, -6), (10, 6), (14, 0)]), mouth=1 if 8 <= f <= 12 else 0, eyes=2 if 5 <= f <= 11 else 0, aR=[C.bend(S, H), H], gR=gR,
                  aL=[(-10, 30), (-14 - 2*C.seg(f, 5, 9), 38 - 8*C.sc(f, [(0, 0), (8, 1), (11, 0)]))], gL=0.5, lL=[(-2.2, 53), (-2.6, 60)], lR=[(2.2 + 1.2*C.seg(f, 3, 5), 53), (2.4 + 3.0*C.seg(f, 3, 5) - 3.0*C.seg(f, 11, 14), 60)])
def a_held(i):                                    # THE SMALL CAT IN THE GLOVE: squashed, eyes wide, mouth open, arms and legs flailing (15 frames that loop)
    f = float(i); w = math.sin(f/15*4*math.pi)
    return C.pose(sz=0.92 + 0.04*w, sx=1.06 - 0.04*w, eyes=2, mouth=1, hrot=6*w, lean=3*w, aL=[(-9, 27 + 3*w), (-12 - 2*w, 15 - 4*w)], aR=[(9, 27 - 3*w), (12 + 2*w, 15 + 4*w)], gL=1.0, gR=1.0, lL=[(-3 + w, 52), (-6 + 3*w, 58)], lR=[(3 - w, 52), (6 - 3*w, 58)])
def a_toss(i):                                    # THE SMALL CAT, THROWN: curled up in a ball with a big grin, tumbling head over heels once in the 15 frames
    f = float(i)
    return C.pose(rot=24.0*f, piv=(0.0, 32.0), eyes=2, mouth=1, sz=0.9, aL=[(-6, 32), (-3, 41)], aR=[(6, 32), (3, 41)], gL=0.6, gR=0.6, lL=[(-3, 48), (-1, 56)], lR=[(3, 48), (1, 56)])

# ---------------------------------------------------------------- v1.114 THE ARM HANG and the GROUND POUND (jump + ATTACK, then crouch). The cells of the hanging strips have 48 rows of room above the figure: both arms run straight up out of the top of the cell (his hands hold on somewhere above the screen) and the game stretches the picture's top row up to the top of the screen, so they reach it on any screen.
HG_OY = 48; HG_PIV = (0.0, -40.0); SH = (5.4, 20.8)                                  # the figure swings about HG_PIV (up by the hands); SH = his near shoulder
def hg_pose(rot=0.0, lean=0.0, hrot=0.0, ty=0.0, tx=0.0, sa=0.0, sb=0.0, hxL=-17.0, hxR=17.0, eyes=0, mouth=1, hy=9.0, hp=45.0):    # both arms straight up (a wide V, so the head stays clear between them) to the hands at (hxL / hxR, -64), out of the cell; sa / sb: how the legs swing (-1..1)
    return C.pose(rot=rot, piv=HG_PIV, lean=lean, hrot=hrot, ty=ty, tx=tx, hy=hy, hp=hp, eyes=eyes, mouth=mouth, aL=[(-5.5, 5.0), (hxL, -64.0)], aR=[(5.5, 5.0), (hxR, -64.0)], gL=0.0, gR=0.0,
                  lL=[(-2.4 + 2.6*sa, 53.0), (-2.6 + 4.6*sa, 60.5)], lR=[(2.4 + 2.6*sb, 53.0), (2.6 + 4.6*sb, 60.5)])
def a_hang(i):                                      # HANGING (loop): he dangles by his long arms and swings gently, the legs and the head a little behind the body
    t = 2*math.pi*i/N; s = math.sin(t)
    return hg_pose(rot=3.4*s, lean=0.5*s, hrot=-6.0*math.sin(t - 0.7), ty=0.6*math.sin(2*t - 0.4), sa=math.sin(t - 1.0), sb=math.sin(t - 1.0 + 0.45))
def a_hangmv(i):                                    # HANGING AND MOVING (loop, the walking pace): hand over hand, each arm reaches ahead in turn (the hands are above the cell: you see the arms lean one after the other) and the body surges forward with every grab, leaning back, the legs trailing
    t = 2*math.pi*i/N; s = math.sin(t)
    return hg_pose(rot=1.6*math.sin(2*t + 0.5), lean=-3.2 + 1.0*math.cos(2*t), hrot=3.0 + 2.5*math.sin(2*t), ty=-1.4*abs(math.sin(t)), tx=1.4*math.sin(2*t - 0.8), sa=-0.75 + 0.55*math.sin(t + 0.6), sb=-0.75 + 0.55*math.sin(t + 0.6 + math.pi),
                   hxL=-15.0 + 9.0*(-s), hxR=19.0 + 9.0*s, mouth=1)
def a_hangup(i):                                    # THE ARMS SHOOT UP (15 frames played in 0.3 s): from the top of his jump (arms raised, knees tucked) both arms stretch up like rubber, the body is yanked up after them, bounces on them and settles into the hang (frame 14 = frame 0 of 'hang')
    f = float(i); u = C.sc(f, [(0, 0.0), (2, 0.35), (5, 1.0), (14, 1.0)]); tuck = 1.0 - C.seg(f, 2, 8); B = a_hang(0); k = C.seg(f, 5, 14)
    H = lambda a, b_, q: (C.lerp(a[0], b_[0], q), C.lerp(a[1], b_[1], q))
    HL, HR = H((-12.4, 10.0), (-17.0, -64.0), u), H((12.4, 10.0), (17.0, -64.0), u)
    bounce = 0.0 if f < 5 else 4.5*math.exp(-(f - 5)/2.6)*math.cos(1.25*(f - 5))
    lL = [(C.lerp(-2.4 - 0.8*tuck, B['lL'][0][0], k), C.lerp(53.0 - 5.0*tuck, B['lL'][0][1], k)), (C.lerp(-2.6 - 1.3*tuck, B['lL'][1][0], k), C.lerp(60.5 - 9.0*tuck, B['lL'][1][1], k))]
    lR = [(C.lerp(2.4 + 0.8*tuck, B['lR'][0][0], k), C.lerp(53.0 - 5.0*tuck, B['lR'][0][1], k)), (C.lerp(2.6 + 1.3*tuck, B['lR'][1][0], k), C.lerp(60.5 - 9.0*tuck, B['lR'][1][1], k))]
    return C.pose(piv=HG_PIV, hy=C.lerp(9.6, 9.0, u), hp=C.lerp(44.0, 45.0, u), ty=bounce*(1 - k) + B['ty']*k - 2.0*C.seg(f, 2, 5)*(1 - C.seg(f, 5, 7)), eyes=2 if f < 9 else 0, mouth=1, hrot=C.lerp(0.0, B['hrot'], k), rot=B['rot']*k, lean=B['lean']*k,
                  aL=[C.bend((-5.4, 20.8), HL), HL], aR=[C.bend((5.4, 20.8), HR), HR], gL=0.8*(1 - u), gR=0.8*(1 - u), lL=lL, lR=lR)
def dive_pose(k=0.0):                               # falling like a hammer: stretched, the legs straight down together, the fists up by his head (k: the arms flutter), eyes wide, mouth open
    return C.pose(sz=1.12, hy=8.4, sy=18.2, mouth=1, eyes=2, aL=[(-9.0, 12.0 + 2*k), (-9.0 - k, 3.0 + 3*k)], aR=[(9.0, 12.0 - 2*k), (9.0 + k, 3.0 - 3*k)], gL=0.2, gR=0.2, lL=[(-1.8, 54.0), (-1.8, 62.0)], lR=[(1.8, 54.0), (1.8, 62.0)])
def a_pound(i):                                     # THE GROUND POUND. 0-2: he lets go (the arms snap down, he coils up); 3-6: the dive (the game plays these while he falls); 7-14: the impact: squashed flat, a bounce, and back on his feet (the game plays these on the floor)
    f = float(i)
    if f <= 2:
        k = C.seg(f, 0, 2); HL, HR = (C.lerp(-17.0, -9.0, k), C.lerp(-64.0, 16.0, C.ease(k))), (C.lerp(17.0, 9.0, k), C.lerp(-64.0, 16.0, C.ease(k)))
        return C.pose(piv=(0.0, 62.0), sz=C.lerp(1.0, 0.9, k), hy=C.lerp(9.0, 9.6, k), hp=C.lerp(45.0, 44.0, k), mouth=1, eyes=2 if f > 0 else 0, aL=[C.bend((-5.4, 20.8), HL), HL], aR=[C.bend((5.4, 20.8), HR), HR], gL=0.9*k, gR=0.9*k,
                      lL=[(-2.4 - 1.0*k, 53.0 - 5.0*k), (-2.6 - 1.4*k, 60.5 - 8.0*k)], lR=[(2.4 + 1.0*k, 53.0 - 5.0*k), (2.6 + 1.4*k, 60.5 - 8.0*k)])
    if f <= 6: return dive_pose(math.sin(f*2.2))
    SQ = C.pose(sz=0.92, hy=10.6, sy=20.0, mouth=1, eyes=2, aL=[(-11.0, 36.0), (-16.0, 47.0)], aR=[(11.0, 36.0), (16.0, 47.0)], gL=1.0, gR=1.0, lL=[(-3.4, 53.0), (-4.2, 60.0)], lR=[(3.4, 53.0), (4.2, 60.0)])
    if f <= 7: return dict(squash=(1.38, 0.6), src=SQ)
    if f <= 8: return dict(squash=(1.7, 0.46), src=SQ)
    if f <= 9: return dict(squash=(1.3, 0.8), src=SQ)
    if f <= 10: return C.pose(sz=1.08, mouth=1, aL=[(-9.0, 30.0), (-12.0, 37.0)], aR=[(9.0, 30.0), (12.0, 37.0)], gL=0.8, gR=0.8)
    k = C.seg(f, 10, 14); w = math.sin((f - 10)*1.6)*(1 - k)
    return C.pose(sz=C.lerp(1.08, 1.0, k), mouth=1 if f < 13 else 0, eyes=0, hrot=3*w, lean=1.5*w, aL=[(-9.0 + w, 30.0 + 3*k), (-12.0 + 3*k + 2*w, 37.0 + 8*k)], aR=[(9.0 - w, 30.0 + 3*k), (12.0 - 3*k - 2*w, 37.0 + 8*k)], gL=0.8*(1 - k), gR=0.8*(1 - k))

POSES = {'hugegrab': (a_hugegrab, (128, 36, 64, 0)), 'held': (a_held, (64, 32, 64, 0)), 'toss': (a_toss, (64, 32, 64, 0)),
         'hang': (a_hang, (64, 32, 64 + HG_OY, HG_OY)), 'hangmv': (a_hangmv, (64, 32, 64 + HG_OY, HG_OY)), 'hangup': (a_hangup, (64, 32, 64 + HG_OY, HG_OY)), 'pound': (a_pound, (64, 32, 80, 16))}
def frame_of(p, W, ax, H, oy):
    if isinstance(p, dict) and p.get('squash'):                                   # a cartoon squash: the picture itself is scaled (wider, much lower), standing on the floor
        src = C.render(p['src'], W, ax, H, oy); bb = src.getbbox(); sx, sz = p['squash']; crop = src.crop(bb); nw, nh = max(1, int(round(crop.width*sx))), max(1, int(round(crop.height*sz)))
        out = Image.new('RGBA', (W, H), (0, 0, 0, 0)); out.paste(crop.resize((nw, nh), Image.NEAREST), (int(round(ax + 0.5 - nw/2)), bb[3] - nh)); return out
    return C.render(p, W, ax, H, oy)
def strip(name):
    fn, (W, ax, H, oy) = POSES[name]; out = Image.new('RGBA', (W*N, H), (0, 0, 0, 0))
    for i in range(N): out.paste(frame_of(fn(i), W, ax, H, oy), (i*W, 0))
    return out
def ball_talk():                                  # Verity's smiley ball (13x13, as in story_art.py) with the mouth talking: smile, small o, wide open, ... (the syllables of "hey it's me, it's Verity")
    S_ = 13; c = (S_ - 1)/2; OL, HI, LIT, BASE, SH = (40, 28, 0), (255, 246, 170), (255, 222, 60), (255, 204, 18), (206, 150, 8); DK = (20, 12, 0, 255)
    MOUTH = {0: [(3, 7), (4, 8), (5, 9), (6, 9), (7, 9), (8, 8), (9, 7)], 1: [(5, 8), (6, 8), (7, 8), (5, 9), (6, 9), (7, 9)], 2: [(4, 7), (5, 7), (6, 7), (7, 7), (8, 7), (4, 8), (5, 8), (6, 8), (7, 8), (8, 8), (5, 9), (6, 9), (7, 9)],
             3: [(4, 7), (5, 7), (6, 7), (7, 7), (8, 7), (3, 8), (4, 8), (5, 8), (6, 8), (7, 8), (8, 8), (9, 8), (4, 9), (5, 9), (6, 9), (7, 9), (8, 9), (5, 10), (6, 10), (7, 10)]}
    SEQ = [0, 2, 3, 2, 1, 0, 1, 2, 1, 0, 2, 3, 2, 1, 0]; out = Image.new('RGBA', (S_*N, S_), (0, 0, 0, 0))
    for i in range(N):
        im = Image.new('RGBA', (S_, S_), (0, 0, 0, 0)); o = im.load()
        for y in range(S_):
            for x in range(S_):
                d = ((x - c)**2 + (y - c)**2)**0.5
                if d <= 6.3: o[x, y] = (OL if d > 5.3 else HI if x + y < 7 and d < 4.6 else LIT if x + y < 11 else BASE if x + y < 14 else SH) + (255,)
        for xy in [(4, 3), (4, 4), (8, 3), (8, 4)] + MOUTH[SEQ[i]]: o[xy] = DK
        if SEQ[i] == 3:                                                          # (shouting: the eyes squeeze)
            for xy in [(4, 4), (8, 4)]: o[xy] = (206, 150, 8, 255)
        out.paste(im, (i*S_, 0))
    return out
def lip_levels():                                 # how open the mouth is (0 smile .. 3 wide) every 25 ms of the recording: the loudness decides, an open vowel (low-pitched energy) opens it wider, a hissing "s" keeps it narrow, and it closes a little slower than it opens
    import subprocess; import numpy as np
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', os.path.join(HERE, 'voice_hey_its_me_verity.mp3'), '-ac', '1', '-ar', '16000', '-f', 's16le', '-'], capture_output=True).stdout
    x = np.frombuffer(raw, dtype=np.int16).astype(np.float32)/32768.0; sr = 16000; hop = int(sr*0.025); win = int(sr*0.040); fr = np.fft.rfftfreq(win, 1/sr); rms, low, cen = [], [], []
    for i in range(len(x)//hop):
        sg = x[i*hop:i*hop + win]; sg = np.pad(sg, (0, win - len(sg))) if len(sg) < win else sg; rms.append(float(np.sqrt((sg*sg).mean())))
        sp = np.abs(np.fft.rfft(sg*np.hanning(win)))**2; tot = sp.sum() + 1e-12; low.append(float(sp[(fr >= 250) & (fr < 1000)].sum()/tot)); cen.append(float((sp*fr).sum()/tot))
    db = 20*np.log10(np.array(rms)/max(rms) + 1e-6); lv = []
    for d, lo, ce in zip(db, low, cen):
        m = 3 if d > -8 else 2 if d > -16 else 1 if d > -26 else 0
        if m and ce > 2500: m = min(m, 1)
        elif m and lo > 0.45: m = min(3, m + 1)
        lv.append(m)
    out = []
    for i, m in enumerate(lv): out.append(max(m, (out[-1] - 1) if out else 0))
    return out
def url(im): b = io.BytesIO(); im.save(b, 'PNG', optimize=True); return 'data:image/png;base64,' + base64.b64encode(b.getvalue()).decode()
if __name__ == '__main__':
    out = {'ballTalk': url(ball_talk()), 'cat': {k: url(strip(k)) for k in POSES}, 'hand': [[round(v, 2) for v in C.hand(float(i), HAND)] for i in range(N)],
           'lip': lip_levels(), 'voice': 'data:audio/mpeg;base64,' + base64.b64encode(open(os.path.join(HERE, 'voice_hey_its_me_verity.mp3'), 'rb').read()).decode()}
    json.dump(out, open(os.path.join(HERE, 'talk.json'), 'w'), separators=(',', ':')); print('talk.json', os.path.getsize(os.path.join(HERE, 'talk.json')), 'bytes')
    if len(sys.argv) > 1:                                                        # a contact sheet: python3 -B talk_art.py sheet <png>
        rows = [strip('hugegrab'), strip('held'), strip('toss'), ball_talk().resize((13*N*4, 13*4), Image.NEAREST)]; W = max(r.width for r in rows); sh = Image.new('RGB', (W, sum(r.height for r in rows) + 12), (60, 70, 110)); y = 0
        for r in rows: sh.paste(r, (0, y), r.convert('RGBA')); y += r.height + 4
        sh.save(sys.argv[2])
