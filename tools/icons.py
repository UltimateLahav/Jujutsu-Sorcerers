import math, os, sys
from PIL import Image, ImageDraw
RES = '../android/res'
art = Image.open('face_art.png').convert('RGBA')                      # 64x64
C0, C1 = (0x2e, 0x1c, 0x58), (0x12, 0x0a, 0x22)

def bg(n):                                                           # stepped radial gradient on an n x n grid
    im = Image.new('RGB', (n, n)); px = im.load()
    for y in range(n):
        for x in range(n):
            t = min(1, math.hypot(x - n / 2, y - n * .46) / (n * .65)); t = round(t * 7) / 7
            px[x, y] = tuple(int(C0[i] + (C1[i] - C0[i]) * t) for i in range(3))
    return im

DENS = {'mdpi': 1, 'hdpi': 1.5, 'xhdpi': 2, 'xxhdpi': 3, 'xxxhdpi': 4}
BG = bg(108).resize((432, 432), Image.NEAREST)
FG = Image.new('RGBA', (432, 432), (0, 0, 0, 0)); FG.alpha_composite(art.resize((320, 320), Image.NEAREST), (56, 56))
FULL = bg(64).resize((192, 192), Image.NEAREST).convert('RGBA'); FULL.alpha_composite(art.resize((192, 192), Image.NEAREST))

def mask(size, round_):
    m = Image.new('L', (size * 4, size * 4), 0); d = ImageDraw.Draw(m)
    (d.ellipse if round_ else (lambda b, fill: d.rounded_rectangle(b, radius=size * 4 * .18, fill=fill)))((0, 0, size * 4 - 1, size * 4 - 1), fill=255)
    return m.resize((size, size), Image.LANCZOS)

def scaled(im, size, exact):
    return im.resize((size, size), Image.NEAREST if exact else Image.LANCZOS)

for name, f in DENS.items():
    d = f'{RES}/mipmap-{name}'; os.makedirs(d, exist_ok=True)
    exact = (f == 4)
    scaled(FG, int(108 * f), exact).save(f'{d}/ic_launcher_foreground.png')
    scaled(BG, int(108 * f), exact).save(f'{d}/ic_launcher_background.png')
    s = int(48 * f)
    for fn, rnd in (('ic_launcher.png', False), ('ic_launcher_round.png', True)):
        icon = FULL.resize((s, s), Image.LANCZOS); icon.putalpha(mask(s, rnd)); icon.save(f'{d}/{fn}')

adaptive = '<?xml version="1.0" encoding="utf-8"?>\n<adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android">\n    <background android:drawable="@mipmap/ic_launcher_background"/>\n    <foreground android:drawable="@mipmap/ic_launcher_foreground"/>\n</adaptive-icon>\n'
for fn in ('ic_launcher.xml', 'ic_launcher_round.xml'):
    open(f'{RES}/mipmap-anydpi-v26/{fn}', 'w').write(adaptive)

open(f'{RES}/values/styles.xml', 'w').write('''<?xml version="1.0" encoding="utf-8"?>
<resources>
    <style name="AppTheme" parent="@android:style/Theme.DeviceDefault.NoActionBar.Fullscreen">
        <item name="android:windowBackground">@color/bg</item>
        <item name="android:colorBackground">@color/bg</item>
        <item name="android:statusBarColor">@color/bg</item>
        <item name="android:navigationBarColor">@color/bg</item>
    </style>
</resources>
''')
open(f'{RES}/values/colors.xml', 'w').write('<?xml version="1.0" encoding="utf-8"?>\n<resources>\n    <color name="bg">#0D0A17</color>\n</resources>\n')
open(f'{RES}/values-v28/styles.xml', 'w').write('''<?xml version="1.0" encoding="utf-8"?>
<resources>
    <style name="AppTheme" parent="@android:style/Theme.DeviceDefault.NoActionBar.Fullscreen">
        <item name="android:windowBackground">@color/bg</item>
        <item name="android:colorBackground">@color/bg</item>
        <item name="android:statusBarColor">@color/bg</item>
        <item name="android:navigationBarColor">@color/bg</item>
        <item name="android:windowLayoutInDisplayCutoutMode">shortEdges</item>
    </style>
</resources>
''')
open(f'{RES}/values-v31/styles.xml', 'w').write('''<?xml version="1.0" encoding="utf-8"?>
<resources>
    <style name="AppTheme" parent="@android:style/Theme.DeviceDefault.NoActionBar.Fullscreen">
        <item name="android:windowBackground">@color/bg</item>
        <item name="android:colorBackground">@color/bg</item>
        <item name="android:statusBarColor">@color/bg</item>
        <item name="android:navigationBarColor">@color/bg</item>
        <item name="android:windowLayoutInDisplayCutoutMode">shortEdges</item>
        <item name="android:windowSplashScreenBackground">@color/bg</item>
    </style>
</resources>
''')
FULL.resize((512, 512), Image.NEAREST).save('../art/gojo-icon-512.png')
art.save('../art/gojo-face-64.png')
print('icons ok')
