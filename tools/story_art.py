"""Chapter 1 art: Verity (first form = verity_64.png, bite pose), the smiley ball, and the face close-ups of Gojo and Verity. Writes story_art.json (name -> png data URL)."""
import json, base64, io, math
from PIL import Image, ImageDraw
def url(im): b = io.BytesIO(); im.save(b, 'PNG'); return 'data:image/png;base64,' + base64.b64encode(b.getvalue()).decode()
def outline(im, col):                                                         # a 1 px dark outline around everything opaque
    o = im.load(); W, H = im.size; add = []
    for y in range(H):
        for x in range(W):
            if o[x, y][3] == 0 and any(0 <= x + dx < W and 0 <= y + dy < H and o[x + dx, y + dy][3] > 0 for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1))): add.append((x, y))
    for p in add: o[p] = col + (255,)
def shade(im, tones):                                                         # tones: {base colour: (dark, light)}: right edge of each row run darker, left edge lighter
    o = im.load(); r = im.copy().load(); W, H = im.size                        # (read from an untouched copy, so recoloured pixels do not change the runs)
    for y in range(H):
        for x in range(W):
            c = r[x, y][:3]
            if c in tones and r[x, y][3]:
                a = x
                while a > 0 and r[a - 1, y][3] and r[a - 1, y][:3] == c: a -= 1
                b = x
                while b < W - 1 and r[b + 1, y][3] and r[b + 1, y][:3] == c: b += 1
                t = (x - a) / max(1, b - a); d, l = tones[c]
                if t > .8: o[x, y] = d + (255,)
                elif t < .15: o[x, y] = l + (255,)
art = {}
v = Image.open('verity_64.png').convert('RGBA'); art['verity'] = url(v)
# --- the bite: the upper body leans forward (right in the picture; the game mirrors it) and the mouth gapes
src = v.load(); bite = Image.new('RGBA', (64, 64), (0, 0, 0, 0)); bp = bite.load()
for y in range(64):
    s = round(max(0, 40 - y) * 0.2)
    for x in range(64):
        if 0 <= x - s < 64 and src[x - s, y][3]: bp[x, y] = src[x - s, y]
d = ImageDraw.Draw(bite); hx = 32 + 8
d.ellipse((hx - 6, 5, hx + 6, 16), fill=(72, 6, 14)); d.rectangle((hx - 5, 4, hx + 5, 6), fill=(252, 248, 236)); d.rectangle((hx - 5, 15, hx + 5, 17), fill=(252, 248, 236)); d.ellipse((hx - 3, 12, hx + 2, 15), fill=(190, 70, 80))
for x in (hx - 3, hx, hx + 3): d.point((x, 6), fill=(70, 6, 14)); d.point((x, 16), fill=(70, 6, 14))
art['bite'] = url(bite)
# --- the smiley ball (cursed energy yellow)
sm = Image.new('RGBA', (64, 64), (0, 0, 0, 0)); d = ImageDraw.Draw(sm)
d.ellipse((7, 9, 57, 59), fill=(255, 204, 18)); d.ellipse((7, 9, 57, 59), outline=(70, 44, 0), width=2)
d.ellipse((12, 14, 40, 40), fill=(255, 224, 70)); d.ellipse((14, 16, 30, 28), fill=(255, 240, 140))              # a glassy highlight
for r in range(3): d.arc((7 + r, 9 + r, 57 - r, 59 - r), 300, 140, fill=(214, 152, 8))                           # shadow along the lower right edge
d.ellipse((22, 22, 28, 35), fill=(20, 12, 0)); d.ellipse((36, 22, 42, 35), fill=(20, 12, 0)); d.rectangle((24, 24, 25, 26), fill=(120, 100, 40)); d.rectangle((38, 24, 39, 26), fill=(120, 100, 40))
for i in range(0, 131):                                                                                          # the smile: thin at the ends, thick in the middle, little flicks at both tips
    th = math.radians(25 + i); x = 32 + 19 * math.cos(th); y = 32 + 14 * math.sin(th) + 3; w = 1 + 2.4 * math.sin(i / 130 * math.pi); d.ellipse((x - w / 2, y - w / 2, x + w / 2, y + w / 2), fill=(10, 6, 0))
d.line((15, 41, 13, 39), fill=(10, 6, 0), width=2); d.line((49, 41, 51, 39), fill=(10, 6, 0), width=2)
art['smiley'] = url(sm)
# --- Gojo's face (hair flowing in the wind, blindfold, a moving mouth): 2 hair frames x 3 mouths
def gojo(h, m):
    im = Image.new('RGBA', (64, 64), (0, 0, 0, 0)); d = ImageDraw.Draw(im)
    SK, SKS, HAIR, HS, BLK, COL = (244, 218, 200), (206, 172, 156), (240, 244, 255), (170, 186, 228), (14, 14, 24), (30, 32, 62)
    d.rectangle((26, 52, 38, 63), fill=SKS); d.polygon([(6, 64), (11, 53), (25, 50), (32, 57), (39, 50), (53, 53), (58, 64)], fill=COL); d.line([(25, 50), (32, 57), (39, 50)], fill=(78, 84, 130))
    cx, cy, rx, ry = 32, 21, 21, 15; d.ellipse((cx - rx, cy - ry, cx + rx, cy + ry), fill=HAIR)
    for i, a in enumerate(range(185, 360, 17)):                                                                  # spikes streaming to the left, the wind makes them wave from frame to frame
        wob = (3 if (i + h) % 2 else -1) + h; r1, r2 = math.radians(a - 9), math.radians(a + 9); tip = (cx + (rx + 11) * math.cos(math.radians(a)) - 4 - wob, cy + (ry + 10) * math.sin(math.radians(a)) + (h if i % 2 else 0))
        d.polygon([(cx + rx * math.cos(r1), cy + ry * math.sin(r1)), tip, (cx + rx * math.cos(r2), cy + ry * math.sin(r2))], fill=HAIR)
    d.ellipse((15, 15, 49, 58), fill=SK)
    for x in (19, 25, 31, 37, 43): d.polygon([(x - 4, 12), (x + 4, 12), (x + (1 if h else -1), 21 + (x % 3) * 2)], fill=HAIR)   # bangs
    d.rectangle((14, 27, 50, 35), fill=BLK); d.line((15, 28, 49, 28), fill=(56, 56, 82))                          # the blindfold
    d.line((32, 38, 32, 42), fill=SKS); d.point((30, 43), fill=SKS); d.point((34, 43), fill=SKS)
    if m == 0: d.line((27, 48, 37, 48), fill=(150, 86, 92)); d.line((29, 49, 35, 49), fill=SKS)
    elif m == 1: d.ellipse((28, 46, 36, 51), fill=(84, 22, 32))
    else: d.ellipse((27, 45, 37, 53), fill=(84, 22, 32)); d.rectangle((29, 46, 35, 47), fill=(250, 248, 240)); d.ellipse((30, 50, 34, 52), fill=(190, 80, 90))
    shade(im, {SK: (SKS, (252, 232, 218)), HAIR: (HS, (255, 255, 255)), COL: ((20, 22, 44), (58, 62, 110))}); outline(im, (28, 20, 34)); return im
art['gojoFace'] = [url(gojo(h, m)) for h in (0, 1) for m in (0, 1, 2)]
# --- Verity's face (the huge grin opens and closes)
def vface(m):
    im = Image.new('RGBA', (64, 64), (0, 0, 0, 0)); d = ImageDraw.Draw(im); BASE, SH = (172, 156, 48), (120, 106, 34)
    d.rectangle((25, 50, 39, 63), fill=SH); d.ellipse((6, 1, 58, 58), fill=BASE)
    d.ellipse((17, 15, 25, 27), fill=(10, 4, 3)); d.ellipse((39, 15, 47, 27), fill=(10, 4, 3)); d.point((19, 18), fill=(250, 240, 190)); d.point((41, 18), fill=(250, 240, 190))
    g = (2, 6, 11)[m]
    for x in range(13, 52):
        c = int(36 + 9 * (1 - ((x - 32) / 19) ** 2)); d.line((x, c - 6, x, c - 6), fill=(84, 8, 18)); d.line((x, c - 5, x, c - 1), fill=(252, 248, 236)); d.line((x, c, x, c + g - 1), fill=(72, 6, 14))
        d.line((x, c + g, x, c + g + 4), fill=(252, 248, 236)); d.line((x, c + g + 5, x, c + g + 5), fill=(84, 8, 18))
        if x % 4 == 0: d.line((x, c - 5, x, c - 1), fill=(196, 186, 164)); d.line((x, c + g, x, c + g + 4), fill=(196, 186, 164))
    d.line((12, 28, 12, 38), fill=SH); d.line((52, 28, 52, 38), fill=SH)
    shade(im, {BASE: ((120, 106, 34), (232, 218, 128))}); outline(im, (26, 18, 6)); return im
art['verityFace'] = [url(vface(m)) for m in (0, 1, 2)]
import sys; sys.path.insert(0, '.'); import verity_rig; art['vanim'] = verity_rig.strips(sm)      # Verity's 15-frame animations (tools/verity_rig.py)
json.dump(art, open('story_art.json', 'w'), separators=(',', ':'))
sheet = Image.new('RGB', (4 * 200, 3 * 200), (30, 22, 52)); ims = [v, bite, sm] + [Image.open(io.BytesIO(base64.b64decode(u.split(',')[1]))) for u in art['gojoFace'] + art['verityFace']]
for i, im in enumerate(ims): t = im.convert('RGBA').resize((192, 192), Image.NEAREST); sheet.paste(t, ((i % 4) * 200 + 4, (i // 4) * 200 + 4), t)
sheet.save('story_art_sheet.png'); print('ok', len(open('story_art.json').read()), 'bytes')
