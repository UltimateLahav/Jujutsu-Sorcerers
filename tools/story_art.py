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
import sys; sys.path.insert(0, '.'); import verity_rig; art['vanim'] = verity_rig.strips(sm)      # Verity's 15-frame animations (tools/verity_rig.py)
json.dump(art, open('story_art.json', 'w'), separators=(',', ':'))
sheet = Image.new('RGB', (4 * 200, 3 * 200), (30, 22, 52)); ims = [v, bite, sm]
for i, im in enumerate(ims): t = im.convert('RGBA').resize((192, 192), Image.NEAREST); sheet.paste(t, ((i % 4) * 200 + 4, (i // 4) * 200 + 4), t)
sheet.save('story_art_sheet.png'); print('ok', len(open('story_art.json').read()), 'bytes')
