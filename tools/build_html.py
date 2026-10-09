"""Builds ../index.html from template.html + generated art (run from the folder holding the generated files)."""
import base64, json, sys
out_path = sys.argv[1] if len(sys.argv) > 1 else '../index.html'
b64 = lambda p: base64.b64encode(open(p, 'rb').read()).decode()
idle, walk = json.load(open('frames.json')), json.load(open('walk.json'))
D = {'pal': idle['pal'],
     'idle': {'x0': idle['x0'], 'w': idle['w'], 'h': idle['h'], 'cx': 31, 'frames': idle['frames']},
     'fwd': walk['fwd'], 'back': walk['back']}
heroes = ['data:image/png;base64,' + b64(f'face_art_{i}.png') for i in range(5)]
t = open('template.html').read()
out = (t.replace('__SPR__', json.dumps(D, separators=(',', ':'))).replace('__HEROES__', json.dumps(heroes))
        .replace('__FONT__', open('font.b64').read()))
assert '__SPR__' not in out and '__HEROES__' not in out and '__FONT__' not in out
open(out_path, 'w').write(out)
print('wrote', out_path, len(out), 'bytes')
