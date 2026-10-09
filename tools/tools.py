"""Rendering helpers: preview, zoom crops, reference overlay, SVG export."""
import sys
from PIL import Image


def hex2rgb(h):
    h = h.lstrip('#')
    return tuple(int(h[i:i + 2], 16) for i in (0, 2, 4))


def render(grid, pal, scale=10, bg=(120, 120, 135), box=None):
    W = len(grid[0]); H = len(grid)
    c0, r0, c1, r1 = box if box else (0, 0, W, H)
    im = Image.new('RGB', ((c1 - c0) * scale, (r1 - r0) * scale), bg)
    px = im.load()
    for r in range(r0, r1):
        for c in range(c0, c1):
            ch = grid[r][c]
            if ch == '.':
                continue
            rgb = hex2rgb(pal[ch])
            for dy in range(scale):
                for dx in range(scale):
                    px[(c - c0) * scale + dx, (r - r0) * scale + dy] = rgb
    return im


def ref_mapped(ref_path, scale=10, chin_src_y=127, head_extra_rows=1):
    """Reference scaled to the sprite's grid (0.0761 cells/src px) with the head's extra row."""
    s = 0.0761 * scale
    ref = Image.open(ref_path).convert('RGB')
    top = ref.crop((0, 3, 247, chin_src_y))
    bot = ref.crop((0, chin_src_y, 247, 806))
    tw = round(247 * s)
    top_r = top.resize((tw, round((chin_src_y - 3) * s)), Image.LANCZOS)
    bot_r = bot.resize((tw, round((806 - chin_src_y) * s)), Image.LANCZOS)
    out = Image.new('RGB', (64 * scale, 64 * scale), (255, 255, 255))
    x0 = 22 * scale
    y0 = 1 * scale
    out.paste(top_r, (x0, y0))
    out.paste(bot_r, (x0, y0 + top_r.size[1] + head_extra_rows * scale))
    return out


def compare(grid, pal, ref_path, out_path, scale=10):
    spr = render(grid, pal, scale)
    ref = ref_mapped(ref_path, scale)
    # overlay: reference darkness blended over the sprite on white
    spr_w = render(grid, pal, scale, bg=(255, 255, 255))
    ov = Image.blend(spr_w, ref, 0.5)
    W = 64 * scale
    sheet = Image.new('RGB', (W * 3 + 20, W), (60, 60, 70))
    sheet.paste(ref, (0, 0))
    sheet.paste(spr, (W + 10, 0))
    sheet.paste(ov, (2 * W + 20, 0))
    sheet.save(out_path)


def svg_export(grid, pal, size=512, title='Gojo - 16-bit pixel art (64x64)'):
    H = len(grid); W = len(grid[0])
    # greedy rectangles per colour: horizontal runs merged vertically
    colors = {}
    for r in range(H):
        c = 0
        while c < W:
            ch = grid[r][c]
            if ch == '.':
                c += 1
                continue
            c0 = c
            while c < W and grid[r][c] == ch:
                c += 1
            colors.setdefault(ch, []).append((r, c0, c - c0))
    out = []
    for ch, runs in colors.items():
        # merge identical vertical stacks
        runs.sort(key=lambda t: (t[1], t[2], t[0]))
        rects = []
        for r, c0, w in runs:
            for rc in rects:
                if rc[1] == c0 and rc[3] == w and rc[0] + rc[2] == r:
                    rc[2] += 1
                    break
            else:
                rects.append([r, c0, 1, w])
        rects.sort(key=lambda t: (t[0], t[1]))
        d = ''.join(f"M{c0} {r}h{w}v{h}h-{w}z" for r, c0, h, w in rects)
        out.append((pal[ch].lower(), d))
    return out, W, H
