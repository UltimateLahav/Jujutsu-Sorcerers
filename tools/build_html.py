"""Builds ../index.html from template.html + the generated art. Run from this folder: python3 build_html.py"""
import base64, json
t = open('template.html').read()
hero = 'data:image/png;base64,' + base64.b64encode(open('face_art.png', 'rb').read()).decode()
out = (t.replace('__SPR__', json.dumps(json.load(open('frames.json')), separators=(',', ':')))
        .replace('__FONT__', open('font.b64').read()).replace('__HERO__', hero))
open('../index.html', 'w').write(out)
print('wrote ../index.html', len(out), 'bytes')
