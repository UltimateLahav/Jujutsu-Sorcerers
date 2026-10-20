#!/usr/bin/env python3
"""v1.16 art. Writes talk.json (name -> PNG data URL, 15 frames side by side in every strip, plus the voice clip as a data URL):
 ballTalk  = Verity's smiley ball TALKING (13x13 a frame, the mouth opens and closes);
 cat.hugegrab = the HUGE Cat of the Cartoon Cat's CARTOON ATTACK reaching down, GRABBING the small Cat, lifting him out of sight, and THROWING him at the enemy (drawn 3 times as big by the game, 128x64 a frame like 'huge');
 cat.held  = the small Cat in the giant's glove, wriggling; cat.toss = the small Cat thrown, tumbling head over heels once in the 15 frames;
 hand      = where the giant's hand is on each of the 15 frames (the pose's x / y), so the game can put the held Cat in it."""
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
POSES = {'hugegrab': (a_hugegrab, (128, 36, 64, 0)), 'held': (a_held, (64, 32, 64, 0)), 'toss': (a_toss, (64, 32, 64, 0))}
def strip(name):
    fn, (W, ax, H, oy) = POSES[name]; out = Image.new('RGBA', (W*N, H), (0, 0, 0, 0))
    for i in range(N): out.paste(C.render(fn(i), W, ax, H, oy), (i*W, 0))
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
