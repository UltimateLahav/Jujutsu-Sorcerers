"""Builds ../index.html from template.html + generated art (run from the folder holding the generated files)."""
import base64, json, sys
out_path = sys.argv[1] if len(sys.argv) > 1 else '../index.html'
b64 = lambda p: base64.b64encode(open(p, 'rb').read()).decode()
side, pal = json.load(open('side.json')), json.load(open('frames.json'))['pal']
pal.update(side.get('pal_extra', {}))                                      # teleport glow colours
D = {'pal': pal, 'idle': side['idle'], 'fwd': side['fwd'], 'back': side['back'], 'jump': side['jump'], 'tele': side['tele'], **{f'atk{j}': side[f'atk{j}'] for j in range(4)}, **{f'rx{j}': side[f'rx{j}'] for j in range(10)}, **{k: side[k] for k in ('atk4', 'atk5', 'atk6', 'atk7', 'atk8', 'atk9', 'atk10', 'atk11', 'atk12', 'atk13', 'atk14', 'atk15', 'atk16', 'atk17', 'wfb', 'wbb', 'cb', 'cfb', 'cbb', 'orb', 'cdn', 'cidle', 'cfwd', 'cback', 'cjump', 'ce', 'atk18', 'atk19', 'atk20', 'atk21', 'atk22')}, **{k: v for k, v in side.items() if k.startswith('h_')}}     # side-view idle, both walks, the 15-frame jump and the 15-frame teleport double jump
heroes = ['data:image/png;base64,' + b64(f'face_art_{i}.png') for i in range(5)]
t = open('template.html').read()
out = (t.replace('__SPR__', json.dumps(D, separators=(',', ':'))).replace('__HEROES__', json.dumps(heroes))
        .replace('__FONT__', open('font.b64').read()).replace('__SFX__', open('sfx.js').read()).replace('__HUMAN__', open('human.js').read()).replace('__DOMAINIMG__', 'data:image/png;base64,' + __import__('base64').b64encode(open('domain_cut.png', 'rb').read()).decode()))
assert '__SPR__' not in out and '__HEROES__' not in out and '__FONT__' not in out and '__SFX__' not in out and '__HUMAN__' not in out and '__DOMAINIMG__' not in out
open(out_path, 'w').write(out)
print('wrote', out_path, len(out), 'bytes')
