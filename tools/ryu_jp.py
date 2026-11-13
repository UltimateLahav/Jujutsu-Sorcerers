#!/usr/bin/env python3
"""python3 ryu_jp.py -> the RY_JPH list of tools/ryu.js: the four letters of 今回だけ ("just this once", the black screen of Ryu's ULTIMATE) as 32 x 32 bitmaps, one row of 8 hex digits per pixel row (the left pixel is the highest bit).
The letters are cut from a Japanese font (IPAGothic, threshold 96); the pixel font of the game has no Japanese letters. Needs the font file below; the result is pasted into ryu.js once (the game itself never reads a font)."""
import sys
from PIL import Image, ImageDraw, ImageFont
FONT = sys.argv[1] if len(sys.argv) > 1 else '/usr/share/fonts/opentype/ipafont-gothic/ipag.ttf'
f = ImageFont.truetype(FONT, 32); out = []
for ch in '今回だけ':
    im = Image.new('L', (32, 32), 0); ImageDraw.Draw(im).text((0, 0), ch, font=f, fill=255)
    px = im.load(); rows = ''
    for y in range(32): rows += '%08x' % sum((px[x, y] > 96) << (31 - x) for x in range(32))
    out.append("'" + rows + "'")
print('[\n  ' + ',\n  '.join(out) + ']')
