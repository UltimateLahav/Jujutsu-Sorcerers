// ---------------------------------------------------------------- v1.97 THE GRAB (this file is spliced into template.html by build_html.py, in place of the marker line after chap2.js's): the end of chapter 2
// Yuji is in the portal's mouth: he dives in (the pictures of his dash, turned flat) and Verity's long arm shoots out and closes on his LEG when he is halfway in. A close-up of the hand on the ankle. The other side of the portal: the Master holds Gojo by the neck and clicks a button on his wrist; the portal starts to close, slowly, with Yuji still halfway through it, his hand reaching for Gojo. Back in the alley Verity yanks the leg: Yuji is pulled out of the portal, swung over his head and thrown to the ground, and the portal shuts. Verity pounds him, crouched over him, blow after blow; Yuji coughs blood; the ground gives way into a crater. Verity lifts him, drives his arm through his stomach, the organs fall out, a big hole is left in his chest, he falls. WASTED POTENTIAL. Then (v1.98) the last scene, and the card.
// v1.98 THE CALL goes on after it (the shots room, mtalk, scare, ring, listen and gaunt of C4_SEQ; their code is the block "v1.98 THE CALL" at the end of this file): the Master's void again, he talks to Gojo, the room flashes white, he is afraid, a call comes in from "???" ("DID YOU GET HIM?" "YES... I HAVE HIM.") and the camera pushes in on a gauntlet with no stones, whose middle finger's socket shines purple ("GREAT.").
// Every shot is made of the game's own pictures (Yuji's dash, hurt and idle pictures, Verity's strips, the Master's, Gojo's) enlarged with hard pixels (a close-up is the same drawing as the wide shot with the camera pushed in), and is a pure function of the scene time T, so a tap that skips to the next cut (or a test that jumps in time) always draws the right picture.
const C3E = { talk: 0.6, blink: 2.2, dive: 2.66, arm: 2.78, grab: 3.04, hold: 0.14 };      // the times of the first part (seconds): Yuji's line, Verity blinks in behind him, he dives, the arm shoots out, the arm closes on his leg, the picture stops for 0.14 s
const C3E_TALK = [{ t: C3E.talk, d: 1.8, w: 'YUJI', a: 'SENSEI... I AM COMING!', b: '' }, { t: 0, d: 0, w: 'VERITY', a: 'WASTED POTENTIAL.', b: '' }];      // (the second line's time is set below)
const C3V0 = { w: 64, h: 64, cx: 32, x0: 0, top: 0 };      // the place of Verity's 64 x 64 pictures
const C4_SEQ = [{ k: 'grip', d: 1.8 }, { k: 'other', d: 2.7 }, { k: 'wrist', d: 1.8 }, { k: 'shut', d: 2.9 }, { k: 'yank', d: 1.9 }, { k: 'down', d: 1.0 }, { k: 'beat', d: 7.2 }, { k: 'lift', d: 1.4 }, { k: 'pierce', d: 3.2 }, { k: 'fall', d: 2.8 }, { k: 'line', d: 3.8 }, { k: 'black', d: 1.6 }, { k: 'room', d: 4.6 }, { k: 'mtalk', d: 2.6 }, { k: 'scare', d: 2.6 }, { k: 'ring', d: 2.6 }, { k: 'listen', d: 2.8 }, { k: 'gaunt', d: 9.6 }];      // the shots after the grab and how long each one lasts
{ let t = C3E.grab + C3E.hold; for (const s of C4_SEQ) { s.t0 = t; t += s.d; } C4_SEQ.end = t; }
const c4T = k => C4_SEQ.find(s => s.k === k).t0;
C3E.card = C4_SEQ.end; C3E_TALK[1].t = c4T('line') + 0.5; C3E_TALK[1].d = 3.0;
TN_COL['???'] = '#e8e8f4'; C3E_TALK.push({ t: c4T('room') + 0.8, d: 3.5, w: 'MASTER', vk: 2, a: 'YOUR STUDENT IS GONE, GOJO.', b: 'NOW NOBODY CAN SAVE YOU.' }, { t: c4T('mtalk') + 0.3, d: 1.9, w: 'MASTER', vk: 2, a: 'SOON THE WHOLE WORLD WILL-', b: '' }, { t: c4T('listen') + 0.7, d: 2.0, w: '???', vk: 3, a: 'DID YOU GET HIM?', b: '' }, { t: c4T('gaunt') + 0.5, d: 2.2, w: 'MASTER', vk: 2, a: 'YES... I HAVE HIM.', b: '' }, { t: c4T('gaunt') + 5.5, d: 2.4, w: '???', vk: 3, a: 'GREAT.', b: '' });
const C5 = { flash: c4T('mtalk') + 2.45, rings: [c4T('scare') + 1.25, c4T('ring') + 0.15, c4T('ring') + 1.1], click: 1.7, shine: 5.0 };      // the last scene's clock (scene seconds): the room's white flash, the three rings of the call, the click of the answer (seconds into the telephone's shot) and the purple shine (seconds into the gauntlet's shot)
const C3E_CUTS = [C3E.grab + C3E.hold].concat(C4_SEQ.slice(1).map(s => s.t0), [C3E.card]);      // a tap jumps to the next of these
const C4_ANK = { dx: -17, dy: -8 };      // where the rear ankle is from the pivot (his hips) when Yuji dives flat (found from his picture)

// ---- helpers
const c4Jit = a => a > 0.2 ? Math.round((Math.random() * 2 - 1) * a) : 0;
function c4CamOn(z, fx, fy, tx, ty) { ctx.save(); ctx.translate(Math.round(tx), Math.round(ty)); ctx.scale(z, z); ctx.translate(-fx, -fy); }      // the camera: the point (fx, fy) of the scene is put on the screen point (tx, ty), z times as big (a close-up is the same drawing as the wide shot, so it is made of the same pictures)
const c4Cam0 = () => ctx.restore();
function c4Geo() {      // where everybody is in the alley (from the opening's geometry)
  const key = VW + 'x' + gy + 'x' + FRED_IMG.complete; if (c4Geo.key === key) return c4Geo.v; c4Geo.key = key; const G = c3Geo();
  return c4Geo.v = { px: G.PX, x0: G.PX - 30, vx: G.PX - 52 };      // the portal's middle, where Yuji stands, where Verity blinks in (22 px behind him)
}
function c4Pose0(T, g) {      // the first part: Yuji (standing, then diving into the portal) and Verity (blinking in, the arm shooting out) at the scene time T, which stops at the grab
  const Tp = Math.min(T, C3E.grab), u = clamp01((Tp - C3E.dive) / (C3E.grab - C3E.dive));
  const Y = Tp < C3E.dive ? { stand: 1, x: g.x0 } : { stand: 0, x: lerp(g.x0, g.px - 6, ease3(u)), h: lerp(26, 37, ease3(u)) + 12 * Math.sin(Math.PI * u), ang: Math.PI / 2 * ease3(clamp01(u / 0.7)), f: 3 + Math.min(3, Math.floor(u * 4)) };      // (the pivot: his hips; the angle turns him flat, head first)
  let src = null; if (Tp >= C3E.arm) src = vfr('scare_grab', Math.min(12, 4 + (Tp - C3E.arm) * 24), false); else if (Tp >= C3E.blink) src = vfr('tele', 6 + 8.99 * clamp01((Tp - C3E.blink) / 0.25), false);
  return { Y, V: { x: g.vx, src } };
}
const c4NSC = new WeakMap();
function c4NoStreaks(src) {      // a copy of one of Yuji's dash pictures without its thin white and blue speed lines (they are drawn behind a runner; turned flat they would stand up in the air)
  let c = c4NSC.get(src); if (c) return c; c = document.createElement('canvas'); c.width = src.width; c.height = src.height; const g = c.getContext('2d'); g.drawImage(src, 0, 0); const im = g.getImageData(0, 0, c.width, c.height), d = im.data;
  for (let i = 0; i < d.length; i += 4) if (d[i + 3] && ((d[i + 2] > 225 && d[i + 1] > 205) || (d[i + 2] > 150 && d[i + 2] > d[i] + 45 && d[i + 1] > 90 && d[i] < 150))) d[i + 3] = 0;
  g.putImageData(im, 0, 0); c4NSC.set(src, c); return c;
}
function c4YujiDraw(Y, sx, T, g, o) {      // Yuji: standing with the wind in his hair, or diving (his dash picture turned flat about his hips), cut off at the portal's plane: what has gone through it is not seen
  o = o || {}; if (Y.stand) { rsYuji(sx(Y.x), 0, 'idle', T, { wind: 0.5 }); return; }
  const p = yujiPick({ dodging: true, dgK: 0, df: Y.f, dgCr: false }), src = c4NoStreaks(p.set[p.fi]); ctx.save(); ctx.beginPath(); ctx.rect(-400, -400, sx(g.px) + 401, VH + 800); ctx.clip();
  const px = sx(Y.x) + (o.jx || 0), py = gy - Y.h + (o.jy || 0); shadow(sx(Y.x), Math.max(3, 9 - Y.h * 0.15)); rsGojoRot(src, p.info, px, py, Y.ang, 34, false, 1);
  ctx.globalCompositeOperation = 'lighter'; rsGojoRot(rsEdge(src, [150, 100, 235]), p.info, px, py, Y.ang, 34, false, 0.55); ctx.restore();      // (a thin violet rim of the portal's light, so that his dark uniform shows against the dark)
}
function c4Wide0(now, dt, T, cx, g) {      // the alley: the portal, Yuji's dive, Verity's arm
  const sx = x => Math.round(cx + x), P = c4Pose0(T, g), Tp = Math.min(T, C3E.grab);
  drawAlley(now); if (P.V.src) { shadow(sx(P.V.x), 9); sprAt(P.V.src, C3V0, sx(P.V.x), 0, false, 0); }
  c4YujiDraw(P.Y, sx, Tp, g); rsPortal(sx(g.px), 1, Tp); ctx.fillStyle = 'rgba(30,10,60,0.16)'; ctx.fillRect(0, 0, VW, VH);
  const a = T - C3E.grab; if (a >= 0) { const y = P.Y, c = c4Contact(g, y); c3Ring(sx(c.x), gy - c.h, a, true, '255,240,190'); }
}
function c4Contact(g, Y) { Y = Y || c4Pose0(C3E.grab, g).Y; return { x: Y.x + C4_ANK.dx, h: Y.h - C4_ANK.dy }; }      // where the hand closes on the ankle (x from the middle of the screen, h above the floor)

// ---- close-up A: the hand on the ankle (the wide shot with the camera pushed in on the place where they meet: Verity's own arm and hand, Yuji's own leg)
function c4Grip(now, dt, T, st, t1, cx, g) {
  const Pz = c4Pose0(C3E.grab, g), C = c4Contact(g, Pz.Y), k = t1 / st.d, sx = x => Math.round(cx + x), sq = clamp01((t1 - 0.45) / 0.1) * (1 - clamp01((t1 - 0.62) / 0.3)), z = 3.4 + 1.2 * ease3(k) + 0.8 * Math.max(0, 1 - t1 / 0.14), tw = t1 > 0.45 ? 1 : 0;
  rsCloseBg(T); { const gr = ctx.createLinearGradient(VW * 0.4, 0, VW, 0); gr.addColorStop(0, 'rgba(120,50,190,0)'); gr.addColorStop(1, 'rgba(150,70,220,0.4)'); ctx.fillStyle = gr; ctx.fillRect(0, 0, VW, VH); }
  const sh = t1 > 0.45 && t1 < 0.95 ? 3.5 * (1 - (t1 - 0.45) / 0.5) : 0.4; ctx.save(); ctx.translate(c4Jit(sh), c4Jit(sh)); c4CamOn(z, sx(C.x), gy - C.h, VW * 0.46, VH * 0.5);
  sprAt(vfr('scare_grab', 12, false), C3V0, sx(g.vx), 0, false, 0);
  c4YujiDraw(Pz.Y, sx, C3E.grab, g, { jx: tw * c4Jit(1.2), jy: tw * c4Jit(1.2) }); rsPortal(sx(g.px), 1, T);
  { const ax = sx(C.x), ay = gy - C.h, q = 1 - 0.25 * sq; for (let i = -1; i <= 1; i++) { ctx.fillStyle = '#2b2208'; ctx.fillRect(ax + i * 2 - 1, ay - 3.5 * q, 2, 7 * q); ctx.fillStyle = '#b39b2f'; ctx.fillRect(ax + i * 2 - 1, ay - 3 * q, 1, 6 * q); ctx.fillStyle = '#e8d57a'; ctx.fillRect(ax + i * 2 - 1, ay - 3 * q, 1, 1); } ctx.fillStyle = '#2b2208'; ctx.fillRect(ax - 4, ay - 1 * q, 1, 3 * q); ctx.fillStyle = '#b39b2f'; ctx.fillRect(ax - 4, ay - 1 * q, 1, 2 * q);      // the fingers (olive with a dark outline and a lit tip) and the thumb close round the ankle
    if (sq > 0) { ctx.strokeStyle = 'rgba(255,255,255,' + (0.9 * sq).toFixed(2) + ')'; ctx.lineWidth = 0.6; ctx.beginPath(); ctx.moveTo(ax - 5, ay - 4); ctx.lineTo(ax - 2, ay - 1); ctx.lineTo(ax - 4, ay + 1); ctx.lineTo(ax + 1, ay + 4); ctx.stroke(); } }      // (the leg creaks: a white crack)
  c4Cam0(); ctx.restore();
  { const a = t1 - 0.45; if (a >= 0) c3Ring(VW * 0.5, VH * 0.5, a, true, '255,240,190'); if (sq > 0.2) { ctx.strokeStyle = 'rgba(255,255,255,0.7)'; ctx.lineWidth = 1; for (let i = 0; i < 16; i++) { const an = i * 0.3927 + 0.2, r0 = 22 + 6 * (i % 3), r1 = r0 + 10 + 8 * sq; ctx.beginPath(); ctx.moveTo(VW * 0.5 + Math.cos(an) * r0, VH * 0.5 + Math.sin(an) * r0 * 0.8); ctx.lineTo(VW * 0.5 + Math.cos(an) * r1, VH * 0.5 + Math.sin(an) * r1 * 0.8); ctx.stroke(); } } }
  if (t1 > 0.45 && t1 < 0.6) { ctx.fillStyle = 'rgba(255,255,255,' + (0.5 * (1 - (t1 - 0.45) / 0.15)).toFixed(2) + ')'; ctx.fillRect(0, 0, VW, VH); }
  msFinish(1);
}

// ---- the other side of the portal: the Master's. A dark violet void with a floor, the portal at the left, the Master (his own pictures, black, one red eye) holding Gojo by the neck at the right; Yuji comes out of the portal head first, only as far as the plane of the portal (the rest of him is on the other side, in Verity's hand)
function c4Void(T, gx, lit) {      // lit: how bright the portal's light is (1 if left out)
  const g1 = ctx.createLinearGradient(0, 0, 0, gy); g1.addColorStop(0, '#06030c'); g1.addColorStop(1, '#1b0d30'); ctx.fillStyle = g1; ctx.fillRect(0, 0, VW, gy);
  const g2 = ctx.createLinearGradient(0, gy, 0, VH); g2.addColorStop(0, '#150a26'); g2.addColorStop(1, '#040208'); ctx.fillStyle = g2; ctx.fillRect(0, gy, VW, VH - gy);
  for (let i = 0; i < 8; i++) { const x = ((i * 89 + 31) % (VW + 40)) - 10, w = 9 + (i * 5) % 9; ctx.fillStyle = 'rgba(10,5,20,0.9)'; ctx.fillRect(x, 0, w, gy); ctx.fillStyle = 'rgba(120,60,190,0.2)'; ctx.fillRect(x, 0, 1, gy); }      // (far pillars)
  ctx.fillStyle = 'rgba(160,90,230,0.28)'; ctx.fillRect(0, gy, VW, 1); for (let i = 0; i < 12; i++) ctx.fillRect((i * 53 + 11) % VW, gy + 5 + (i % 3) * 6, 14 + (i % 4) * 4, 1);
  ctx.fillStyle = 'rgba(200,170,255,0.4)'; for (let i = 0; i < 26; i++) ctx.fillRect(Math.round((i * 47 + T * (3 + i % 5)) % VW), Math.round((i * 31 + T * (1 + i % 3)) % gy), 1, 1);
  const lg = ctx.createRadialGradient(gx, gy - 34, 4, gx, gy - 34, VW * 0.6); lg.addColorStop(0, 'rgba(150,70,220,' + (0.5 * (lit == null ? 1 : lit)).toFixed(3) + ')'); lg.addColorStop(1, 'rgba(60,20,110,0)'); ctx.fillStyle = lg; ctx.fillRect(0, 0, VW, VH);      // (the portal's light)
}
function c4Other(now, T, o) {      // o: z (zoom), fx (camera shift) or cx (where the camera looks, from the left of the screen), ty (the screen row of its middle), k (the portal's width: 1 open, 0 = no portal at all), lit (the portal's light), yuji (is he there), yx (his hips from the plane of the portal), tr (how much he shakes), eye, flare, ang (how Gojo hangs), sh (shake), fxf (a function drawn in the scene, over everything)
  const Px = Math.round(VW * 0.27), Mx = Math.round(VW * 0.76), src = rsCarrySrc(fredF(Math.floor(T * IDLE_FPS)), 1), pal = src.palm; c4Void(T, Px, o.lit);
  ctx.save(); ctx.translate(c4Jit(o.sh || 0), c4Jit(o.sh || 0)); c4CamOn(o.z, o.cx != null ? o.cx : (Px + Mx) / 2 + (o.fx || 0), gy - 34, VW * 0.5, o.ty != null ? o.ty : VH * 0.6);
  if (o.k !== 0) { ctx.save(); ctx.translate(Px, 0); ctx.scale(Math.max(0.06, o.k), 1); ctx.translate(-Px, 0); rsPortal(Px, 1, T); ctx.restore(); }
  if (o.yuji) { const p = yujiPick({ dodging: true, dgK: 0, df: 6, dgCr: false }), sr = c4NoStreaks(p.set[p.fi]), ppx = Px + o.yx + c4Jit(o.tr || 0), ppy = gy - 37 + c4Jit(o.tr || 0); ctx.save(); ctx.beginPath(); ctx.rect(Px, -400, 800, 800 + VH); ctx.clip(); rsGojoRot(sr, p.info, ppx, ppy, Math.PI / 2, 34, false, 1); ctx.globalCompositeOperation = 'lighter'; rsGojoRot(rsEdge(sr, [150, 100, 235]), p.info, ppx, ppy, Math.PI / 2, 34, false, 0.55); ctx.restore(); }
  shadow(Mx, 9); rsAura(Mx, T, 1, 60); rsFredDraw(Mx, T, { src, right: false, eye: o.eye == null ? 1 : o.eye, flare: o.flare || 0 });
  { const nx = Mx - (pal[0] - 31), ny = gy - 61 + pal[1]; rsGojoRot(bloody(idleF[0]), D.idle, nx, ny, o.ang == null ? 0.1 + 0.03 * Math.sin(T * 2.2) : o.ang, 19, true, 1); rsBlades(nx, ny, -1); rsDrip(nx + 3, ny + 26, T, 3, 0.2); }
  if (o.fxf) o.fxf(Px, Mx); c4Cam0(); ctx.restore();
}
function c4Shout(T, txt, t1, big) {      // a shout in huge letters at the bottom, shaking (the same as SENSEI NO!)
  const jx = c4Jit(2), jy = c4Jit(2); ctx.save(); pxt(txt, VW / 2 + jx + 1, Math.round(VH * 0.9) + jy + 1, '#7a0a0a', big || 24, 'center'); pxt(txt, VW / 2 + jx, Math.round(VH * 0.9) + jy, '#ffffff', big || 24, 'center'); ctx.restore();
}
function c4SOther(now, dt, T, st, t1, cx, g) {      // Yuji's head and shoulders come out of the portal toward Gojo; the Master's eye flares; Yuji screams SENSEI
  const k = t1 / st.d, arr = ease3(clamp01((t1 - 0.45) / 0.16)), strain = clamp01((t1 - 1.6) / 0.3);
  c4Other(now, T, { z: 1.4 + 0.3 * ease3(k), fx: -10, yuji: t1 >= 0.42, yx: lerp(-30, 2, arr) - 3 * strain, tr: 0.3 + 0.9 * strain, k: 1, eye: 1 + 0.3 * arr, flare: 0.2 + 0.7 * arr, ang: 0.1 - 0.16 * ease3(clamp01((t1 - 0.7) / 0.4)), sh: t1 > 1.6 && t1 < 1.9 ? 2 : 0,
    fxf: (Px, Mx) => { c3Ring(Px, gy - 37, t1 - 0.45, true, '200,150,255'); } });
  if (t1 > 0.9 && t1 < 2.3) c4Shout(T, 'SENSEI!!', t1); msFinish(1);
}

// ---- close-up B: the Master's wrist: the hand that holds Gojo by the neck, a device on its wrist, the other hand's finger on its button (o: clk = when the button is pressed, fa = when the finger starts to come down; call = the last scene's telephone: "???" on its screen, a camera that comes close to it (o.zoom))
function c4SWrist(now, dt, T, st, t1, cx, g, o) {
  o = o || {}; const ck = o.clk == null ? 0.8 : o.clk, fa = o.fa || 0, call = !!o.call, Z = rsZ(), b = rsGoBust(Z), Cx = Math.round(VW * 0.34), Cy = Math.round(VH * 0.5), clk = t1 - ck, pr = clk >= 0 ? 1 : clamp01((t1 - ck + 0.3) / 0.3), by = Cy + b.ny - b.my, tx = Cx - 8 * Z, ty = by + Math.round(Z * 0.5), shk = clk >= 0 && clk < 0.3 ? 2 * (1 - clk / 0.3) : 0.4, k = t1 / st.d;
  rsCloseBg(T); ctx.save(); ctx.translate(c4Jit(shk), c4Jit(shk)); const zz = o.zoom ? o.zoom * (1 + 0.1 * k) : 1 + 0.07 * k, ax = o.zoom ? Math.round(VW * 0.5) : Cx, ay = o.zoom ? Math.round(VH * 0.56) : Cy, zfx = o.zoom ? tx + 23.5 * Z : Cx, zfy = o.zoom ? ty - 0.5 * Z : Cy; ctx.translate(ax, ay); ctx.scale(zz, zz); ctx.translate(-zfx, -zfy);
  ctx.save(); ctx.translate(Cx, by); ctx.rotate(-0.22 - 0.05 * Math.sin(T * 5)); ctx.drawImage(b.c, -b.nx, -b.ny); ctx.fillStyle = '#3a0c14'; ctx.fillRect(b.mx - b.nx - 1, b.my - b.ny, 3 * Z, 2 * Z); ctx.restore();
  rsFredArm(tx, ty, Z);
  { const dx0 = tx + 17 * Z, dw = 13 * Z, dy0 = ty - 7 * Z, dh = 13 * Z; ctx.fillStyle = '#0b0914'; ctx.fillRect(dx0, dy0, dw, dh); ctx.fillStyle = 'rgba(170,100,255,0.55)'; ctx.fillRect(dx0, dy0, dw, 1); ctx.fillRect(dx0, dy0 + dh - 1, dw, 1); ctx.fillRect(dx0, dy0, 1, dh); ctx.fillRect(dx0 + dw - 1, dy0, 1, dh);      // the band
    const sx0 = dx0 + 2 * Z, sy0 = dy0 + 4 * Z, sw = 9 * Z, sh = 6 * Z, op = clk < 0 ? 1 : 1 - 0.85 * ease3(clamp01(clk / 0.9)), red = clk >= 0 ? clamp01(1 - clk / 0.25) * 0.8 + 0.25 : 0; if (call) c5Screen(sx0, sy0, sw, sh, T, clk); else { ctx.fillStyle = '#05020a'; ctx.fillRect(sx0, sy0, sw, sh); ctx.strokeStyle = clk >= 0 ? 'rgba(255,70,80,0.95)' : 'rgba(190,120,255,0.95)'; ctx.lineWidth = Math.max(1, Z * 0.4); ctx.beginPath(); ctx.ellipse(sx0 + sw / 2, sy0 + sh / 2, Math.max(1, (sw / 2 - Z * 0.8) * op), sh / 2 - Z * 0.8, 0, 0, 6.2832); ctx.stroke(); if (red > 0) { ctx.fillStyle = 'rgba(255,40,50,' + (0.3 * red).toFixed(2) + ')'; ctx.fillRect(sx0, sy0, sw, sh); } }      // the screen: the portal as a violet oval; after the click it is red and narrows (the call: see c5Screen)
    const bx = dx0 + Math.round(dw / 2) - Z, byy = dy0 - Math.round(Z * (pr >= 1 ? 0.4 : 1.2)); ctx.fillStyle = '#1b1530'; ctx.fillRect(bx - 1, byy, 2 * Z + 2, Math.round(Z * 1.6)); ctx.fillStyle = clk >= 0 ? (call ? '#e8d8ff' : '#ff3a3a') : call && c5Ring(T) > 0.3 ? '#c9a8ff' : '#7a3aff'; ctx.fillRect(bx, byy, 2 * Z, Math.round(Z * 0.8));      // the button
    const fy = -Z * 6 + (byy - Z * 2.2 + Z * 6) * ease3(clamp01((t1 - fa) / 0.55)) - (clk > 0.12 ? Z * 3 * ease3(clamp01((clk - 0.12) / 0.3)) : 0), fx0 = bx - Math.round(Z * 0.5); ctx.fillStyle = '#07040e'; ctx.fillRect(fx0, fy - Z * 8, Math.round(3 * Z), Math.round(Z * 8)); ctx.fillRect(fx0 + 1, fy, Math.round(3 * Z) - 2, 2); ctx.fillStyle = 'rgba(190,120,255,0.7)'; ctx.fillRect(fx0, fy - Z * 8, 1, Math.round(Z * 8)); ctx.fillRect(fx0 + Math.round(3 * Z) - 1, fy - Z * 8, 1, Math.round(Z * 8)); ctx.fillRect(fx0 + 1, fy + 1, Math.round(3 * Z) - 2, 1);      // the finger of the other hand
    if (clk >= 0 && clk < 0.5) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; const R = 14 * Z * (0.4 + clk * 2), gr = ctx.createRadialGradient(bx + Z, byy, 1, bx + Z, byy, R); gr.addColorStop(0, 'rgba(' + (call ? '210,170,255' : '255,60,70') + ',' + (0.8 * (1 - clk / 0.5)).toFixed(2) + ')'); gr.addColorStop(1, 'rgba(' + (call ? '210,170,255' : '255,60,70') + ',0)'); ctx.fillStyle = gr; ctx.fillRect(bx - R, byy - R, 2 * R + 2 * Z, 2 * R); ctx.restore(); } }
  rsDrip(Cx - 2 * Z, Cy + 4 * Z, T, 4, 0.2); msEye(VW * 0.9, VH * 0.3, Z * 0.5, 1.0, 0, 0.5 + 0.3 * Math.sin(T * 7));
  ctx.restore(); if (clk >= 0 && clk < 0.1) { ctx.fillStyle = (call ? 'rgba(230,210,255,' : 'rgba(255,200,200,') + (0.35 * (1 - clk / 0.1)).toFixed(2) + ')'; ctx.fillRect(0, 0, VW, VH); } msFinish(1);
}

// ---- the portal closes, slowly (a wide shot of the other side, then Yuji's face, then the wide shot again): Yuji is still halfway through
function c4SShut(now, dt, T, st, t1, cx, g) {
  const k = t1 / st.d, shut = ease3(clamp01(t1 / 2.5)), face = t1 >= 1.3 && t1 < 2.15;
  if (face) {
    rsCloseBg(T); const Z = Math.max(3, Math.floor(VH * 0.85 / 31)), Cx = Math.round(VW * 0.58), Cy = Math.round(VH * 0.5), u = t1 - 1.3, gr = ctx.createLinearGradient(0, 0, VW * 0.55, 0); gr.addColorStop(0, 'rgba(160,80,240,' + (0.55 * (1 - shut * 0.6)).toFixed(2) + ')'); gr.addColorStop(1, 'rgba(160,80,240,0)'); ctx.fillStyle = gr; ctx.fillRect(0, 0, VW, VH);
    ctx.save(); ctx.translate(c4Jit(2.5), c4Jit(2.5)); rsWindLines(T, 1.4); rsHeadGlow(Cx - 6 * Z, Cy - 6 * Z, Z * 0.3); rsYujiHead(Cx, Cy, Z, T, 1.5, u > 0.15 ? 1 : 2); ctx.restore(); msFinish(1); if (u > 0.1) c4Shout(T, 'SENSEI!!', t1);
    return;
  }
  const slide = clamp01((t1 - 2.35) / 0.4);
  c4Other(now, T, { z: 1.6 + 0.1 * ease3(k), fx: -12, yuji: slide < 1, yx: 2 - 5 * ease3(clamp01(t1 / 2.3)) - 30 * ease3(slide), tr: 1.0, k: lerp(1, 0.12, shut), eye: 1.2, flare: 0.5, ang: -0.06, sh: 0.8 + 1.5 * shut,
    fxf: (Px, Mx) => { for (let i = 0; i < 9; i++) { const h = Math.imul(i + 3, 2654435761) >>> 0, ph = (T * (1.6 + (h % 5) * 0.4) + (h >> 8) % 100 / 100) % 1; ctx.fillStyle = 'rgba(' + (h & 1 ? '230,190,255' : '255,255,255') + ',' + (0.9 * (1 - ph)).toFixed(2) + ')'; ctx.fillRect(Px + 1 + Math.round(ph * 16), gy - 37 + ((h >> 4) % 22) - 11 + Math.round(ph * ((h >> 12) % 7 - 3)), 1, 1); } } });      // (sparks where the rim of the portal bites)
  msFinish(1);
}

// ---------------------------------------------------------------- the alley after the grab (the throw, the beating, the crater, the hole): the helpers
const C4_OL = '#1a1206', C4_SK = '#807226', C4_SH = '#584c1a', C4_LT = '#cec050', C4_RED = ['#e0192b', '#b3121f', '#8e0c18', '#5a0610'];      // Verity's outline, skin, shadow and lit edge (taken from his pictures) and four reds
const c4R = (i, k) => ((Math.imul(i * 7919 + k * 104729 + 12345, 2654435761) >>> 0) % 1000) / 1000;      // a repeatable random number (0 to 1) for thing i and trait k: every speck is a function of the scene time, so a skip or a jump draws the same picture
const c4Lay = g => ({ yL: g.vx - 6, vb: g.vx - 10, cr: g.vx - 34 });      // where Yuji lies (his feet), where Verity crouches over him (turned left) and the middle of the crater, from the middle of the screen
function c4Cam(cx, z, fx, fh, ty) { const hw = VW / (2 * z); c4CamOn(z, Math.max(hw, Math.min(VW - hw, cx + fx)), gy - fh, VW / 2, ty == null ? VH * 0.56 : ty); }      // the camera on the alley: the place fx (from the middle of the screen), fh pixels over the floor, is put on the middle, z times as big; it never looks past the edge of the alley's picture

function c4Arm(ax, ay, hx, hy, bend, blood) {      // Verity's arm: a 4-pixel-thick limb (outline, skin, shadow, outline: as in his pictures) from the shoulder to the hand, bent at the elbow by `bend` pixels; blood (0-1) smears its last part red
  const dx = hx - ax, dy = hy - ay, L = Math.hypot(dx, dy) || 1, n = Math.max(3, Math.ceil(L)), pts = [], hor = Math.abs(dx) >= Math.abs(dy), bl = blood || 0, red = p => bl > 0 && p[2] > 1 - 0.75 * bl;
  for (let i = 0; i <= n; i++) { const t = i / n, b = (bend || 0) * Math.sin(Math.PI * t); pts.push([Math.round(ax + dx * t - dy / L * b), Math.round(ay + dy * t + dx / L * b), t]); }
  ctx.fillStyle = C4_OL; for (const p of pts) ctx.fillRect(p[0] - 2, p[1] - 2, 4, 4);
  for (const p of pts) { ctx.fillStyle = red(p) ? C4_RED[2] : C4_SH; ctx.fillRect(p[0] - 1, p[1] - 1, 2, 2); }
  for (const p of pts) { ctx.fillStyle = red(p) ? C4_RED[1] : C4_SK; if (hor) ctx.fillRect(p[0] - 1, p[1] - 1, 2, 1); else ctx.fillRect(p[0] - 1, p[1] - 1, 1, 2); }
}
function c4Fist(x, y, blood) {      // his hand closed into a fist: a knotted 6 x 6 block of the same olive, outlined, the knuckles lit
  x = Math.round(x); y = Math.round(y); ctx.fillStyle = C4_OL; ctx.fillRect(x - 3, y - 2, 6, 5); ctx.fillRect(x - 2, y - 3, 4, 7);
  ctx.fillStyle = C4_SH; ctx.fillRect(x - 2, y - 2, 4, 4); ctx.fillStyle = C4_SK; ctx.fillRect(x - 2, y - 2, 4, 2); ctx.fillStyle = C4_LT; ctx.fillRect(x - 1, y - 2, 2, 1);
  ctx.fillStyle = C4_OL; ctx.fillRect(x, y - 1, 1, 2);      // (the gap between the fingers)
  if (blood) { ctx.fillStyle = C4_RED[1]; ctx.fillRect(x - 2, y, 4, 2); ctx.fillStyle = C4_RED[0]; ctx.fillRect(x - 2, y, 1, 1); ctx.fillRect(x + 1, y + 1, 1, 2); ctx.fillStyle = C4_RED[2]; ctx.fillRect(x - 2, y + 2, 4, 1); }
}
const C4_BODY = new Map(), C4_ST = { stand: ['idle', 0, 43, 15, 42, 17], b8: ['crouch', 8, 43, 30, 42, 33], b10: ['crouch', 10, 43, 34, 42, 37], b12: ['crouch', 12, 45, 39, 44, 42], crouch: ['crouch', 14, 46, 40, 44, 44] };      // Verity's stances without his right arm: [strip, frame, the x and y from which the arm is cleared, the shoulder]
function c4Verity(x, st, flip, lift, pre) {      // draws him (the right arm is left to c4Arm) and says where his right shoulder is on the screen; pre(shoulder) is called before his body is drawn (an arm that is drawn there is behind him)
  const S = C4_ST[st], src = vfr(S[0], S[1], false); let c = C4_BODY.get(st);
  if (!c) { c = document.createElement('canvas'); c.width = c.height = 64; const g = c.getContext('2d'); g.drawImage(src, 0, 0); g.clearRect(S[2], S[3], 64 - S[2], 64 - S[3]); if (src !== SIMG.verity) C4_BODY.set(st, c); }
  lift = lift || 0; const sh = { x: x + (flip ? -1 : 1) * (S[4] - 32), y: gy - 60 + S[5] - lift }; shadow(x, 9); if (pre) pre(sh); sprAt(c, C3V0, x, lift, flip, 0); return sh;
}
const c4YRX = (fi, k) => { k = k == null ? 4 : k; return yujiPick({ hurting: true, hurtK: k, hurtAt: 0, now: (fi + 0.5) * 1000 / RXF15[k] }); };      // one of Yuji's hit pictures by number (k 4 = the knock-down: 0-4 the fall, 5-10 lying on his back, 11-14 getting up)
const C4_YA = new WeakMap();
function c4YAn(im) {      // where the hair, face, shoes and so the belly are in one of Yuji's pictures (found by colour), and u: the way along his body from the head to the feet
  let a = C4_YA.get(im); if (a) return a; const w = im.width, h = im.height; if (!w || !h) return { hair: [8, 8], face: [10, 12], feet: [8, 60], belly: [8, 34], u: [0, 1] };
  const c = document.createElement('canvas'); c.width = w; c.height = h; const g = c.getContext('2d'); g.drawImage(im, 0, 0); const d = g.getImageData(0, 0, w, h).data; let hx = 0, hy = 0, hn = 0, fx = 0, fy = 0, fn = 0; const rd = [], sk = [];
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { const i = (y * w + x) * 4; if (d[i + 3] < 200) continue; const r = d[i], gg = d[i + 1], b = d[i + 2]; if (r > 200 && gg > 130 && b >= gg - 8) { hx += x; hy += y; hn++; } else if (r > 200 && gg > 170 && b < gg - 10) { sk.push(x, y); } else if (r > 140 && gg < 70 && b < 80) rd.push(x, y); }
  const hair = hn ? [hx / hn, hy / hn] : [w / 2, 8]; for (let i = 0; i < sk.length; i += 2) if (Math.hypot(sk[i] - hair[0], sk[i + 1] - hair[1]) < 12) { fx += sk[i]; fy += sk[i + 1]; fn++; } const face = fn ? [fx / fn, fy / fn] : hair; let mx = 0; for (let i = 0; i < rd.length; i += 2) mx = Math.max(mx, Math.hypot(rd[i] - hair[0], rd[i + 1] - hair[1]));
  let sx = 0, sy = 0, sn = 0; for (let i = 0; i < rd.length; i += 2) if (Math.hypot(rd[i] - hair[0], rd[i + 1] - hair[1]) > mx * 0.8) { sx += rd[i]; sy += rd[i + 1]; sn++; }
  const feet = sn ? [sx / sn, sy / sn] : [hair[0], h - 4], L = Math.hypot(feet[0] - hair[0], feet[1] - hair[1]) || 1;
  a = { hair, face, feet, belly: [(hair[0] + feet[0]) / 2, (hair[1] + feet[1]) / 2], u: [(feet[0] - hair[0]) / L, (feet[1] - hair[1]) / L] }; C4_YA.set(im, a); return a;
}
const C4_YHC = new WeakMap();
function c4Holed(im) {      // a copy of one of Yuji's pictures with a big gaping wound in the front of his belly (the front is the way the picture faces: f = (u.y, -u.x)): a black-red cavity with pale ribs, wet blood round it and a torn flesh rim; what is left of his back keeps him in one piece
  let r = C4_YHC.get(im); if (r) return r; const A = c4YAn(im), w = im.width, h = im.height; r = document.createElement('canvas'); r.width = w; r.height = h; const g = r.getContext('2d'); g.drawImage(im, 0, 0);
  const id = g.getImageData(0, 0, w, h), d = id.data, ux = A.u[0], uy = A.u[1], fx = uy, fy = -ux, cx = A.belly[0] + fx * 4.2, cy = A.belly[1] + fy * 4.2, A1 = 6.2, B1 = 6.4, put = (i, hex) => { d[i] = parseInt(hex.slice(1, 3), 16); d[i + 1] = parseInt(hex.slice(3, 5), 16); d[i + 2] = parseInt(hex.slice(5, 7), 16); d[i + 3] = 255; };      // (A1: half the wound along his body, B1: across it, towards his front)
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { const i = (y * w + x) * 4; if (d[i + 3] < 200) continue; const vx = x - cx, vy = y - cy, al = vx * ux + vy * uy, ac = vx * fx + vy * fy, q = c4R(x * 64 + y, 4), p2 = (al / A1) * (al / A1) + (ac / B1) * (ac / B1) + 0.5 * (c4R(x * 64 + y, 9) - 0.5) * 0.6;
    if (p2 < 1) { const ro = Math.sqrt(Math.max(0, p2)); put(i, ro < 0.42 ? (q < 0.18 ? '#4a0812' : '#12020a') : ro < 0.72 ? (q < 0.12 ? '#e0192b' : q < 0.5 ? '#b3121f' : '#7a0c18') : (q < 0.3 ? '#e0788a' : q < 0.65 ? '#b3121f' : '#5a0610')); if (ro > 0.18 && ro < 0.55 && ac > -2.2 && Math.abs(((Math.round(al) % 3) + 3) % 3) === 0 && q < 0.85) put(i, '#d8ccb8'); }
    else if (p2 < 1.5 && q < 0.5) put(i, q < 0.25 ? '#7a0c18' : '#5a0610'); }
  g.putImageData(id, 0, 0); C4_YHC.set(im, r); return r;
}
function c4Spray(T, t0, x, y, n, o) {      // n specks thrown from (x, y) at time t0 (o: v the speed, up how much goes upward, dir -1 / 0 / 1 = left / all round / right, g gravity, life, cols, sz, seed, stain = how long a speck that lands stays as a stain)
  const a = T - t0, life = o.life || 1; if (a < 0 || a > life + (o.stain || 0)) return;
  for (let i = 0; i < n; i++) {
    const s = (o.seed || 0) * 37 + i, sp = (o.v || 60) * (0.35 + 0.65 * c4R(s, 1)), an = o.dir ? (o.dir > 0 ? -0.15 - c4R(s, 2) * 1.2 : -Math.PI + 0.15 + c4R(s, 2) * 1.2) : c4R(s, 2) * 6.2832, G = o.g == null ? 260 : o.g, gnd = o.gnd == null ? gy + 4 : o.gnd;
    const px = x + Math.cos(an) * sp * a, py = y + Math.sin(an) * sp * (o.up || 1) * a + 0.5 * G * a * a, col = o.cols[i % o.cols.length], sz = (o.sz || 1) + (c4R(s, 3) < 0.25 ? 1 : 0);
    if (py >= gnd) { if (o.stain) { ctx.globalAlpha = Math.max(0, 1 - (a - (gnd - y) / Math.max(40, sp)) / (life + o.stain)); ctx.fillStyle = col; ctx.fillRect(Math.round(px), Math.round(gnd) + (i % 3), sz + 1, 1); ctx.globalAlpha = 1; } continue; }
    if (a > life) continue; ctx.globalAlpha = Math.min(1, 2.2 * (1 - a / life)); ctx.fillStyle = col; ctx.fillRect(Math.round(px), Math.round(py), sz, sz); ctx.globalAlpha = 1;
  }
}
function c4Dust(T, t0, x, n, o) {      // a cloud of dust that rolls along the ground out of x and thins (o: w the width it reaches, h how high it rises, life, col 'r,g,b', big the size of the puffs)
  const a = T - t0, life = o.life || 1; if (a < 0 || a > life) return; const k = a / life;
  for (let i = 0; i < n; i++) { const r1 = c4R(i + (o.seed || 0) * 29, 5), r2 = c4R(i + (o.seed || 0) * 29, 6), s = Math.round(2 + k * (o.big || 6) * (0.4 + 0.6 * r2)), px = Math.round(x + (r1 - 0.5) * 2 * (o.w || 30) * (0.25 + 0.75 * Math.sqrt(k))), py = Math.round(gy + 4 - k * (o.h || 14) * (0.3 + 0.7 * r2) - r2 * 3);
    ctx.fillStyle = 'rgba(' + (o.col || '150,140,172') + ',' + (0.42 * (1 - k) * (1 - k)).toFixed(3) + ')'; ctx.fillRect(px - (s >> 1), py - 1, s, Math.max(1, s - 2)); ctx.fillRect(px - (s >> 1) + 1, py - 2, Math.max(1, s - 2), s); }
}
function c4Crater(x, k, lip) {      // the pit the beating makes: cracks running out over the floor, a ragged ring of broken ground heaped round a dark hole whose far wall catches a little light (k 0-1.2: how far it has opened); lip = true draws only its near rim (drawn over whoever lies in the pit, so that he is IN it)
  if (k < 0.05) return; const rx = Math.round(32 * k), ry = Math.max(2, Math.round(8 * k)), y0 = gy + 3;
  if (!lip) for (let i = 0; i < 13; i++) { const a0 = i / 13 * 6.2832 + 0.3 * c4R(i, 11), len = (12 + 30 * c4R(i, 12)) * k; let px = x + Math.cos(a0) * rx * 0.85, py = y0 + Math.sin(a0) * ry * 0.85;
    for (let j = 0; j < len; j++) { const a = a0 + 0.4 * Math.sin(j * 0.6 + i * 1.7); px += Math.cos(a); py += Math.sin(a) * 0.3; ctx.fillStyle = 'rgba(170,150,210,0.4)'; ctx.fillRect(Math.round(px), Math.round(py) - 1, 1, 1); ctx.fillStyle = '#05030a'; ctx.fillRect(Math.round(px), Math.round(py), 1, 1); } }
  for (let yy = -ry - 3; yy <= ry + 3; yy++) { if (lip && yy < ry * 0.3) continue; const e = Math.sqrt(Math.max(0, 1 - (yy / (ry + 3)) * (yy / (ry + 3)))), wo = Math.round((rx + 4) * e) + (((yy * 7) & 3) - 1), wi = Math.round((rx - 2) * Math.sqrt(Math.max(0, 1 - (yy / ry) * (yy / ry)))), y = y0 + yy;
    if (lip) { if (wo > 0 && wo > wi - 1) { ctx.fillStyle = yy > ry ? '#4a3f5a' : '#6a5a86'; ctx.fillRect(x - wo, y, Math.max(1, wo - wi + 2), 1); ctx.fillRect(x + wi - 2, y, Math.max(1, wo - wi + 2), 1); if (yy >= ry * 0.3 && yy <= ry * 0.3 + 1) ctx.fillRect(x - wi, y, wi * 2, 1); } continue; }
    if (wo > 0) { ctx.fillStyle = yy < -ry ? '#6a5a86' : '#4a3f5a'; ctx.fillRect(x - wo, y, wo * 2, 1); }
    if (Math.abs(yy) <= ry && wi > 1) { ctx.fillStyle = yy < -ry * 0.35 ? '#2a1f3a' : '#05030a'; ctx.fillRect(x - wi, y, wi * 2, 1); ctx.fillStyle = '#1a1226'; ctx.fillRect(x - wi, y, 1, 1); ctx.fillRect(x + wi - 1, y, 1, 1); } }
  for (let i = 0; i < 16; i++) { const a = i / 16 * 6.2832 + 0.2, sn = Math.sin(a); if (lip ? sn < 0.3 : sn >= 0.3) continue; const cxp = Math.round(x + Math.cos(a) * (rx + 2)), cyp = Math.round(y0 + sn * (ry + 2)) - 1; ctx.fillStyle = '#7a6a96'; ctx.fillRect(cxp, cyp - (i % 3), 2 + (i % 2), 2); ctx.fillStyle = '#b0a0d0'; ctx.fillRect(cxp, cyp - (i % 3), 1, 1); }
}
function c4Lump(x, y, kind) {      // one organ on its own: a wet red / pink lump (3 kinds) with a dark outline, a shine and a dark underside
  x = Math.round(x); y = Math.round(y); const O = '#4a0a1c';
  if (kind === 0) { ctx.fillStyle = O; ctx.fillRect(x - 3, y - 2, 6, 5); ctx.fillRect(x - 4, y - 1, 8, 3); ctx.fillStyle = '#d65a74'; ctx.fillRect(x - 2, y - 1, 4, 3); ctx.fillRect(x - 3, y, 6, 1); ctx.fillStyle = '#ff9aab'; ctx.fillRect(x - 2, y - 1, 2, 1); ctx.fillStyle = '#9a2a42'; ctx.fillRect(x - 2, y + 1, 4, 1); }
  else if (kind === 1) { ctx.fillStyle = O; ctx.fillRect(x - 3, y - 3, 7, 6); ctx.fillRect(x - 4, y - 2, 9, 4); ctx.fillStyle = '#8a1626'; ctx.fillRect(x - 3, y - 2, 7, 4); ctx.fillRect(x - 2, y - 3 + 1, 5, 1); ctx.fillStyle = '#c4303f'; ctx.fillRect(x - 2, y - 2, 3, 1); ctx.fillStyle = '#5a0c18'; ctx.fillRect(x - 1, y + 1, 4, 1); }
  else { ctx.fillStyle = O; ctx.fillRect(x - 2, y - 2, 5, 5); ctx.fillRect(x - 3, y - 1, 7, 3); ctx.fillStyle = '#e890a6'; ctx.fillRect(x - 2, y - 1, 5, 3); ctx.fillRect(x - 1, y - 2 + 1, 3, 1); ctx.fillStyle = '#ffd0da'; ctx.fillRect(x - 1, y - 1, 1, 1); ctx.fillStyle = '#b84a66'; ctx.fillRect(x - 1, y + 1, 3, 1); }
}
function c4Guts(x, y, len, T, sway) {      // a rope of intestine hanging out of the wound from (x, y): a wet pink tube (dark outline, lit edge, dark underside) that bends in an S, sways a little and curls at its end
  const n = Math.max(2, Math.round(len)), pts = []; for (let i = 0; i < n; i++) { const t = i / n, sw = Math.sin(T * 2.4 + i * 0.4) * (sway == null ? 1 : sway) * t, curl = i > n - 6 ? (i - n + 6) * 0.9 : 0; pts.push([Math.round(x + Math.sin(i * 0.5) * 2.6 * Math.min(1, i / 4) + sw + curl), Math.round(y + i * 0.9 - (i > n - 6 ? (i - n + 6) * 0.4 : 0))]); }
  ctx.fillStyle = '#4a0a1c'; for (const p of pts) ctx.fillRect(p[0] - 1, p[1] - 1, 4, 4); ctx.fillStyle = '#d65a74'; for (const p of pts) ctx.fillRect(p[0], p[1], 2, 2);
  ctx.fillStyle = '#9a2a42'; for (const p of pts) ctx.fillRect(p[0], p[1] + 1, 2, 1); ctx.fillStyle = '#ff9aab'; for (let i = 0; i < pts.length; i += 2) ctx.fillRect(pts[i][0], pts[i][1], 1, 1);
}
function c4Organs(T, t0, x, y, n, o) {      // n organs thrown from (x, y) at time t0: they fall and stay where they land (o: v, up, dir, gnd, seed)
  const a = T - t0; if (a < 0) return; const G = 320, gnd = o.gnd == null ? gy + 3 : o.gnd;
  for (let i = 0; i < n; i++) { const s = (o.seed || 0) * 41 + i, vx = (o.dir || 1) * (o.v || 40) * (0.25 + c4R(s, 1)) * (c4R(s, 8) < 0.2 ? -0.5 : 1), vy = -(o.up || 50) * (0.4 + c4R(s, 2)), gi = gnd + (c4R(s, 3) - 0.5) * 3, tf = (-vy + Math.sqrt(Math.max(0, vy * vy + 2 * G * (gi - y)))) / G, tt = Math.min(a, tf);
    c4Lump(x + vx * tt, y + vy * tt + 0.5 * G * tt * tt, i % 3); }
}
function c4Pool(x, k) {      // blood on the floor: a flat dark red pool that spreads (k 0-1), with a darker rim and a wet shine
  if (k <= 0.02) return; const rx = Math.round(3 + 30 * k), ry = Math.max(1, Math.round(1 + 4 * k)), y = gy + 5;
  ctx.fillStyle = C4_RED[3]; ctx.fillRect(x - rx - 1, y - 1, rx * 2 + 2, ry * 2 + 1); for (let yy = -ry; yy <= ry; yy++) { const w = Math.round(rx * Math.sqrt(Math.max(0, 1 - (yy / ry) * (yy / ry)))) + (((yy * 5) & 1)); ctx.fillStyle = yy < 0 ? C4_RED[2] : C4_RED[1]; ctx.fillRect(x - w, y + yy, w * 2, 1); }
  ctx.fillStyle = C4_RED[0]; for (let i = 0; i < 5; i++) ctx.fillRect(x - Math.round(rx * 0.7) + Math.round(i * rx * 0.35), y - Math.round(ry * 0.4), 2, 1);
}

// ---- the yank: Verity pulls Yuji out of the portal (it shuts behind his head), swings him over his head by the ankle and slams him into the ground
const C4Y = { hold: 0.34, pull: 0.84, shut: 0.88, slam: 1.42 };      // seconds into the shot: the hand holds, the pull is over (his head is out), the portal has shut, the throw hits the ground
function c4YHand(t, g) {      // where Verity's hand, and so Yuji's ankle, is t seconds into the yank (x from the middle of the screen, height over the floor), and how far the swing has gone (u, 0-1: e, the turning of Yuji's body)
  const L = c4Lay(g), V = g.vx, A = [V + 29, 45], B = [V + 12, 54], E = [L.yL, 9], Cc = [V + 6, 100];
  if (t < C4Y.hold) return { x: A[0] + 0.9 * Math.sin(t * 70), y: A[1] + 0.7 * Math.sin(t * 90 + 1), u: 0, e: 0 };      // (the hand trembles: the pull is about to start)
  if (t < C4Y.pull) { const k = ease3((t - C4Y.hold) / (C4Y.pull - C4Y.hold)); return { x: lerp(A[0], B[0], k), y: lerp(A[1], B[1], k), u: 0, e: 0 }; }
  const u = clamp01((t - C4Y.pull) / (C4Y.slam - C4Y.pull)), e = 0.35 * u * u * (3 - 2 * u) + 0.65 * u * u, q = 1 - e;      // (the swing speeds up toward the ground)
  return { x: q * q * B[0] + 2 * q * e * Cc[0] + e * e * E[0], y: q * q * B[1] + 2 * q * e * Cc[1] + e * e * E[1], u, e };
}
function c4YSwing(ax, ay, ang, clipX) {      // Yuji (his dash picture without the speed lines) turned by ang about his held ankle, which is on (ax, ay); what is right of clipX is inside the portal and is not seen
  const p = yujiPick({ dodging: true, dgK: 0, df: 6, dgCr: false }), src = c4NoStreaks(p.set[p.fi]), co = Math.cos(ang), si = Math.sin(ang), px = ax - (-8 * co - 17 * si), py = ay - (-8 * si + 17 * co);
  ctx.save(); if (clipX != null) { ctx.beginPath(); ctx.rect(-400, -400, clipX + 400, VH + 800); ctx.clip(); } rsGojoRot(src, p.info, px, py, ang, 34, false, 1); ctx.restore();
}
function c4Face(im, info, sx, lift) {      // the screen place of Yuji's face (and a little under it, his mouth) when his picture im is drawn by sprAt on sx
  const A = c4YAn(im), hx = info.cx - info.x0, ox = sx - hx, oy = gy - 60 - (info.top || 0) - (lift || 0); return { x: ox + A.face[0], y: oy + A.face[1], mx: ox + A.face[0] + 3, my: oy + A.face[1] + 3, bx: ox + A.belly[0] + A.u[1] * 4.2, by: oy + A.belly[1] - A.u[0] * 4.2, cx: ox + A.hair[0] + 0.2 * (A.feet[0] - A.hair[0]), cy: oy + A.hair[1] + 0.2 * (A.feet[1] - A.hair[1]), fx: A.u[1], fy: -A.u[0] };      // (the collar; the wound = the belly moved 4 px to the front; f = the way he faces)
}
function c4PortalK(ctxK, px, T) { ctx.save(); ctx.translate(px, 0); ctx.scale(Math.max(0.05, ctxK), 1); ctx.translate(-px, 0); rsPortal(px, 1, T); ctx.restore(); }
function c4SYank(now, dt, T, st, t1, cx, g) {
  const sx = x => Math.round(cx + x), V = g.vx, L = c4Lay(g), H = c4YHand(Math.min(t1, C4Y.slam), g), post = t1 - C4Y.slam, pk = t1 < C4Y.pull - 0.1 ? 0.12 : lerp(0.12, 0, clamp01((t1 - (C4Y.pull - 0.1)) / (C4Y.shut - C4Y.pull + 0.1)));
  const kz = ease3(clamp01((t1 - 0.5) / 0.6)), kl = ease3(clamp01((t1 - 1.1) / 0.4)), zoom = lerp(lerp(1.55, 1.25, kz), 1.7, kl), fx = lerp(lerp(V + 14, V - 4, kz), L.yL - 24, kl), fh = lerp(lerp(46, 58, kz), 22, kl);
  const shk = post >= 0 && post < 0.5 ? 6 * (1 - post / 0.5) : t1 < C4Y.hold ? 0 : 0.6; ctx.save(); ctx.translate(c4Jit(shk), c4Jit(shk)); c4Cam(cx, zoom, fx, fh); drawAlley(now);
  if (post >= 0) c4Crater(sx(L.cr), 0.12 + 0.3 * ease3(clamp01(post / 0.3)));
  if (post >= 0) { const f = post < 0.07 ? 6 : post < 0.16 ? 7 : 8, p = c4YRX(f), lf = post < 0.07 ? 0 : 3 * Math.sin(Math.PI * clamp01((post - 0.07) / 0.35)) * (1 - post / 1.2); shadow(sx(L.yL) - 26, 20); sprAt(p.set[p.fi], p.info, sx(L.yL), Math.max(0, lf), false, 0); }
  else {
    if (H.u > 0.05) for (let i = 3; i >= 1; i--) { const Hp = c4YHand(Math.max(C4Y.pull, t1 - 0.028 * i), g); ctx.globalAlpha = 0.34 - 0.08 * i; c4YSwing(sx(Hp.x), gy - Hp.y, Math.PI / 2 - Math.PI * Hp.e, null); } ctx.globalAlpha = 1;      // (afterimages of the swing)
    shadow(sx(H.x), Math.max(3, 9 - H.y * 0.1)); c4YSwing(sx(H.x), gy - H.y, Math.PI / 2 - Math.PI * H.e, t1 < C4Y.shut ? sx(g.px) + 1 : null);
  }
  if (t1 < C4Y.hold) { shadow(sx(V), 9); sprAt(vfr('scare_grab', 12, false), C3V0, sx(V), 0, false, 0); c4Fist(sx(H.x) + 1, gy - H.y, 0); }
  else { const lean = post >= 0 ? 'b10' : H.e > 0.8 ? 'b8' : 'stand', arm = S => { c4Arm(S.x, S.y, sx(H.x), gy - H.y, post >= 0 ? 2 : 3 - 6 * Math.sin(Math.PI * H.u), 0); }, back = sx(H.x) < sx(V) + 4, S = c4Verity(sx(V), lean, false, 0, back ? arm : null); if (!back) arm(S); c4Fist(sx(H.x), gy - H.y, 0); }
  if (pk > 0.01) c4PortalK(pk, sx(g.px), T);
  if (t1 > C4Y.pull - 0.1 && t1 < C4Y.shut + 0.25) { const a = (t1 - (C4Y.pull - 0.1)) / 0.35; ctx.fillStyle = 'rgba(255,255,255,' + (0.8 * (1 - clamp01(a))).toFixed(3) + ')'; ctx.fillRect(sx(g.px) - 2, gy - 80, 4, 90); c3Ring(sx(g.px), gy - 36, t1 - (C4Y.shut - 0.04), true, '200,150,255'); }
  if (post >= 0) { c3Ring(sx(L.yL) - 16, gy - 4, post, true, '255,240,200'); c4Dust(T, st.t0 + C4Y.slam, sx(L.yL) - 20, 22, { w: 46, h: 22, life: 1.3, big: 9, seed: 1 }); c4Spray(T, st.t0 + C4Y.slam, sx(L.yL) - 20, gy - 2, 16, { v: 90, up: 1.2, dir: 0, life: 0.9, cols: ['#6a5a86', '#9a8ab6', '#3a2f4c', '#d0c8e0'], seed: 2 }); }
  c4Cam0(); ctx.restore();
  const fl = post >= 0 ? 0.6 * (1 - clamp01(post / 0.14)) : 0; if (fl > 0) { ctx.fillStyle = 'rgba(255,255,255,' + fl.toFixed(3) + ')'; ctx.fillRect(0, 0, VW, VH); }
  ctx.fillStyle = 'rgba(30,10,60,0.14)'; ctx.fillRect(0, 0, VW, VH); msFinish(1);
}

// ---- Yuji lies in the ground and coughs blood; Verity turns round and crouches over him
function c4SDown(now, dt, T, st, t1, cx, g) {
  const sx = x => Math.round(cx + x), V = g.vx, L = c4Lay(g), kz = ease3(clamp01((t1 - 0.1) / 0.6)), zoom = lerp(1.7, 2.9, kz), fx = lerp(L.yL - 24, L.yL - 38, kz), fh = lerp(22, 12, kz), coughs = [0.16, 0.48, 0.76];
  ctx.save(); c4Cam(cx, zoom, fx, fh); drawAlley(now); c4Crater(sx(L.cr), 0.42); c4Dust(T, st.t0 - 0.48, sx(L.yL) - 20, 26, { w: 52, h: 24, life: 2.4, big: 6, seed: 1 });
  let cu = -1; for (let i = 0; i < coughs.length; i++) if (t1 >= coughs[i]) cu = i; const cs = cu < 0 ? 9 : t1 - coughs[cu], tw = Math.max(0, 1 - cs / 0.12) * (cu >= 0 ? 1 : 0);      // (cs: seconds since the last cough; tw: how hard he jerks)
  const p = c4YRX(8), im = p.set[p.fi], lx = sx(L.yL) + (tw > 0.5 ? c4Jit(1) : 0), lf = (tw > 0.2 ? 1 : 0) - 1, F = c4Face(im, p.info, lx, lf); shadow(sx(L.yL) - 26, 20); sprAt(im, p.info, lx, lf, false, 0);
  if (cu >= 0) { ctx.fillStyle = C4_RED[1]; ctx.fillRect(Math.round(F.mx), Math.round(F.my), 1, 2 + cu); ctx.fillStyle = C4_RED[0]; ctx.fillRect(Math.round(F.mx) - 1, Math.round(F.my), 1, 1); ctx.fillRect(Math.round(F.mx) + 1, Math.round(F.my) + 2 + cu, 1, 1); }
  for (let i = 0; i < coughs.length; i++) c4Spray(T, st.t0 + coughs[i], F.mx, F.my, 12, { v: 78, up: 1.1, dir: 1, life: 0.55, cols: [C4_RED[0], C4_RED[1], C4_RED[0], C4_RED[2]], seed: 10 + i, stain: 0.8, gnd: gy + 2 });
  const turn = t1 > 0.2, vx = V - 10 * ease3(clamp01((t1 - 0.2) / 0.7)), hop = t1 > 0.17 && t1 < 0.3 ? Math.round(4 * Math.sin(Math.PI * (t1 - 0.17) / 0.13)) : 0, stn = t1 < 0.3 ? 'b10' : t1 < 0.55 ? 'b12' : 'crouch', hurry = ease3(clamp01((t1 - 0.75) / 0.25));
  const S = c4Verity(sx(vx), stn, turn, hop); const hx = turn ? S.x - 4 - 6 * hurry : sx(L.yL), hy = turn ? gy - 10 - 26 * hurry : gy - 9; c4Arm(S.x, S.y, hx, hy, 2, 0); c4Fist(hx, hy, 0);
  if (t1 > 0.17 && t1 < 0.3) c4Dust(T, st.t0 + 0.17, sx(V), 8, { w: 14, h: 8, life: 0.5, big: 4, seed: 3 });
  c4Cam0(); ctx.restore(); ctx.fillStyle = 'rgba(30,10,60,0.14)'; ctx.fillRect(0, 0, VW, VH); msFinish(1);
}

// ---- the beating: Verity, crouched on Yuji, pounds him with one fist, blow after blow, faster and faster; the ground gives way under them; the last blow is the greatest
const C4B = (() => { const b = [0.5]; for (let i = 1; i < 17; i++) b.push(b[i - 1] + Math.max(0.24, 0.62 - 0.04 * i)); return { b, all: b.concat([6.45]), big: 6.45 }; })();      // the times (seconds into the shot) of the 17 blows, and of the great one
const C4_BLOOD = [C4_RED[0], C4_RED[1], C4_RED[0], C4_RED[2]], C4_STONE = ['#6a5a86', '#9a8ab6', '#3a2f4c', '#d0c8e0'];
function c4Blow(t) {      // the beating t seconds into the shot: n blows have landed (the great one is the 18th), nu = how high the fist is (0 on the face, 1 at the top of its swing), a = seconds since the last blow, big = the next blow is the great one
  const A = C4B.all; let n = 0; while (n < A.length && A[n] <= t) n++;
  const prev = n === 0 ? A[0] - 1.25 : A[n - 1], next = n < A.length ? A[n] : prev + 0.6, u = clamp01((t - prev) / (next - prev)), big = n === A.length - 1;
  return { n, i: n - 1, nu: n >= A.length ? 0 : u < 0.1 ? 0 : u < 0.62 ? Math.sin(Math.PI / 2 * (u - 0.1) / 0.52) : u < 0.7 ? 1 : 1 - Math.pow((u - 0.7) / 0.3, 2), a: n === 0 ? 9 : t - prev, big };
}
function c4SBeat(now, dt, T, st, t1, cx, g) {
  const sx = x => Math.round(cx + x), V = g.vx, L = c4Lay(g), W = c4Blow(t1), ab = t1 - C4B.big, T0 = st.t0, mid = V - 29, fcx = L.yL - 44;
  const segs = [[0, 1.75, 1.55, 1.7, mid, 22, VH * 0.5], [1.75, 3.2, 3.5, 3.9, fcx + 6, 15, VH * 0.6], [3.2, 4.4, 2.0, 2.25, L.cr, 8, VH * 0.56], [4.4, 5.75, 4.4, 4.9, fcx + 4, 13, VH * 0.6], [5.75, 99, 1.5, 1.3, mid, 22, VH * 0.5]];
  const sg = segs.find(q => t1 < q[1]) || segs[segs.length - 1], k = clamp01((t1 - sg[0]) / (Math.min(sg[1], C4B.big + 0.75) - sg[0]));
  const kc = 0.42 + 0.46 * clamp01((t1 - 0.5) / 5.46) + (t1 >= C4B.big ? 0.22 * ease3(clamp01(ab / 0.3)) : 0), kp = lerp(0.1, 0.95, clamp01(W.n / 17)) + (ab > 0 ? 0.25 * ease3(clamp01(ab / 0.8)) : 0);
  const shk = Math.max(W.i >= 0 && !W.big ? (0.9 + 0.22 * Math.min(W.i, 16)) * Math.max(0, 1 - W.a / 0.14) : 0, ab >= 0 ? 8 * Math.max(0, 1 - ab / 0.7) : 0);
  ctx.save(); ctx.translate(c4Jit(shk), c4Jit(shk)); c4Cam(cx, lerp(sg[2], sg[3], k), sg[4], sg[5], sg[6]); drawAlley(now);
  c4Crater(sx(L.cr), kc); c4Pool(sx(L.yL) - 30, kp);
  for (let i = Math.max(0, W.i - 2); i <= Math.min(W.i, 16); i++) c4Dust(T, T0 + C4B.b[i], sx(L.yL) - 34 + (i % 3) * 6, 7, { w: 18, h: 10, life: 0.7, big: 4, seed: 40 + i });
  if (ab >= 0) { c4Dust(T, T0 + C4B.big, sx(L.cr), 40, { w: 80, h: 34, life: 2.2, big: 12, seed: 7 }); c4Dust(T, T0 + C4B.big, sx(L.cr) - 20, 24, { w: 50, h: 44, life: 1.8, big: 8, seed: 8, col: '110,100,130' }); }
  const jolt = W.i >= 0 ? Math.max(0, 1 - W.a / 0.14) : 0, ox = -Math.round(1.6 * jolt), sink = Math.round(7 * kc), bounce = ab >= 0 && ab < 0.5 ? Math.round(10 * Math.sin(Math.PI * clamp01(ab / 0.5))) : 0, lf = -sink + bounce + (jolt > 0.5 ? -1 : 0);
  const p = c4YRX(8), im = p.set[p.fi], F = c4Face(im, p.info, sx(L.yL) + ox, lf); shadow(sx(L.yL) - 26, 20); sprAt(im, p.info, sx(L.yL) + ox, lf, false, 0);
  if (W.i >= 0 && W.a < 0.05) { ctx.globalAlpha = 0.55 * (1 - W.a / 0.05); sprAt(whiteOf(im), p.info, sx(L.yL) + ox, lf, false, 0); ctx.globalAlpha = 1; }
  c4Crater(sx(L.cr), kc, true);      // (the near rim of the pit is in front of him: he lies in it)
  if (W.n > 0) { ctx.fillStyle = C4_RED[1]; ctx.fillRect(Math.round(F.mx), Math.round(F.my), 1, 2 + Math.min(7, W.n >> 1)); ctx.fillStyle = C4_RED[0]; ctx.fillRect(Math.round(F.mx) - 1, Math.round(F.my), 1, 1); }
  for (let i = 0; i < C4B.all.length; i++) { const tb = T0 + C4B.all[i]; if (T < tb) break; const gb = i === 17; c4Spray(T, tb, F.mx, F.my, gb ? 30 : 9 + (i > 8 ? 5 : 0), { v: (gb ? 120 : 70) + 3 * i, up: 1.1, dir: i % 3 === 2 ? 1 : -1, life: 0.5, cols: C4_BLOOD, seed: i, stain: 3.5, gnd: gy + 3 }); if (T < tb + 0.7) c4Spray(T, tb, sx(L.cr) + (c4R(i, 7) - 0.5) * 34, gy + 3, gb ? 34 : 6, { v: (gb ? 150 : 60) + 3 * i, up: 1.4, dir: 0, life: 0.7, cols: C4_STONE, seed: 100 + i, sz: gb ? 2 : 1 }); }
  const rec = W.i >= 0 ? Math.round(1.4 * jolt) : 0, S = c4Verity(sx(V - 10) + rec, 'crouch', true, Math.round(3 * W.nu), null), F0 = [F.x + 4, F.y - 2], bg = W.big ? 1.45 : 1, hx = F0[0] + 6 * W.nu * bg, hy = F0[1] - 34 * W.nu * bg;
  c4Arm(S.x, S.y, hx, hy, 3, 0); c4Fist(hx, hy, clamp01(W.n / 5));
  if (W.i >= 0) c3Ring(F0[0], F0[1] + 2, W.a, W.i === 17, W.i === 17 ? '255,255,255' : '255,225,190', Math.min(1, 1.6 / lerp(sg[2], sg[3], k)));
  c4Cam0(); ctx.restore();
  const fl = ab >= 0 ? 0.62 * (1 - clamp01(ab / 0.25)) : W.i >= 0 && !W.big && W.a < 0.03 ? 0.12 : 0; if (fl > 0) { ctx.fillStyle = 'rgba(255,255,255,' + fl.toFixed(3) + ')'; ctx.fillRect(0, 0, VW, VH); }
  ctx.fillStyle = 'rgba(30,10,60,0.14)'; ctx.fillRect(0, 0, VW, VH); msFinish(1);
}

// ---- after the beating: Verity stands up and lifts Yuji out of the crater by the collar, drives his arm through his belly, pulls it out with his insides, lets go, and Yuji falls
const C4_ORG = { v: 26, up: 18, dir: 1, seed: 3 };      // how the organs thrown out of the wound when the arm comes out fly (the same in the shots after it, so that they lie where they fell)
function c4Rot(x, y, a, ox, oy) { const c = Math.cos(a), s = Math.sin(a), dx = x - ox, dy = y - oy; return [ox + dx * c - dy * s, oy + dx * s + dy * c]; }
function c4YDraw(fi, holed, x, lf, ang, white) {      // Yuji's knock-down picture fi (0-14), with the wound in his belly if holed, its anchor on the screen place x, lifted by lf; ang turns him about his collar (he hangs and swings); returns where his face, mouth, collar and wound are (turned too)
  const p = c4YRX(fi), im0 = p.set[p.fi], im = holed ? c4Holed(im0) : im0, F = c4Face(im0, p.info, x, lf);
  if (ang) { ctx.save(); ctx.translate(F.cx, F.cy); ctx.rotate(ang); ctx.translate(-F.cx, -F.cy); sprAt(im, p.info, x, lf, false, 0); if (white) { ctx.globalAlpha = white; sprAt(whiteOf(im), p.info, x, lf, false, 0); ctx.globalAlpha = 1; } ctx.restore(); for (const [a, b] of [['x', 'y'], ['mx', 'my'], ['bx', 'by']]) { const q = c4Rot(F[a], F[b], ang, F.cx, F.cy); F[a] = q[0]; F[b] = q[1]; } }
  else { sprAt(im, p.info, x, lf, false, 0); if (white) { ctx.globalAlpha = white; sprAt(whiteOf(im), p.info, x, lf, false, 0); ctx.globalAlpha = 1; } }
  return F;
}
function c4SLift(now, dt, T, st, t1, cx, g) {
  const sx = x => Math.round(cx + x), V = g.vx, L = c4Lay(g), u = clamp01((t1 - 0.2) / 0.7), ku = ease3(u), kh = ease3(clamp01((t1 - 0.85) / 0.4)), xv = lerp(V - 10, V + 28, ease3(clamp01((t1 - 0.25) / 0.85)));
  const fi = t1 < 0.2 ? 8 : [10, 11, 12, 13, 14][Math.min(4, Math.floor(u * 5))], lf = lerp(-8, 0, ku) + 10 * kh;
  ctx.save(); c4Cam(cx, lerp(1.6, 1.8, ease3(t1 / 1.4)), lerp(V - 29, L.yL + 12, ku), 24, VH * 0.5); drawAlley(now); c4Crater(sx(L.cr), 1.1); c4Pool(sx(L.yL) - 30, 1.2);
  const F = c4YDraw(fi, false, sx(L.yL), lf, 0), p8 = c4YRX(8), Fl = c4Face(p8.set[p8.fi], p8.info, sx(L.yL), -8); c4Crater(sx(L.cr), 1.1, true);
  ctx.fillStyle = C4_RED[1]; ctx.fillRect(Math.round(F.mx), Math.round(F.my), 1, 7); ctx.fillStyle = C4_RED[0]; ctx.fillRect(Math.round(F.mx) - 1, Math.round(F.my), 1, 1); rsDrip(F.mx, F.my + 7, T, 3, 0.2);
  const stn = t1 < 0.25 ? 'crouch' : t1 < 0.45 ? 'b12' : t1 < 0.65 ? 'b10' : t1 < 0.85 ? 'b8' : 'stand', hop = t1 > 0.25 && t1 < 0.85 ? Math.round(2 * Math.sin(Math.PI * (t1 - 0.25) / 0.6)) : 0, e = ease3(clamp01(t1 / 0.2)), hx = lerp(Fl.x + 4, F.cx, e), hy = lerp(Fl.y - 2, F.cy, e);
  const S = c4Verity(sx(xv), stn, true, hop, null); c4Arm(S.x, S.y, hx, hy, 3, 0.6); c4Fist(hx, hy, 1);
  c4Dust(T, st.t0 + 0.25, sx(L.yL) - 14, 14, { w: 30, h: 16, life: 1.0, big: 5, seed: 21 });
  c4Cam0(); ctx.restore(); ctx.fillStyle = 'rgba(30,10,60,0.14)'; ctx.fillRect(0, 0, VW, VH); msFinish(1);
}

const C4P = { thrust: 0.62, hit: 0.74, pull: 1.5, gone: 1.65 };      // seconds into the pierce: the arm starts to thrust, it is through him, it is pulled out, it is out
function c4SPierce(now, dt, T, st, t1, cx, g) {
  const sx = x => Math.round(cx + x), V = g.vx, L = c4Lay(g), xv = V + 28, T0 = st.t0, hit = t1 >= C4P.hit, out = t1 >= C4P.pull, ah = t1 - C4P.hit;
  const p14 = c4YRX(14), F0 = c4Face(p14.set[14], p14.info, sx(L.yL), 10), W = [F0.bx, F0.by], E = [W[0] - 14, W[1]], sh = out ? 0.07 * Math.sin((t1 - C4P.pull) * 7) * Math.exp(-(t1 - C4P.pull) * 0.9) : hit ? 0.012 * Math.sin(t1 * 70) : 0.025 * Math.sin(t1 * 3);
  const segs = [[0, 0.55, 1.6, 1.9, L.yL + 14, 30, VH * 0.52], [0.55, 1.5, 4.0, 4.4, W[0] - cx - 4, gy - W[1], VH * 0.5], [1.5, 2.1, 3.4, 2.4, L.yL + 6, 26, VH * 0.52], [2.1, 99, 1.9, 2.0, L.yL + 10, 28, VH * 0.52]];
  const sg = segs.find(q => t1 < q[1]) || segs[3], kk = clamp01((t1 - sg[0]) / (Math.min(sg[1], 3.2) - sg[0])), shk = Math.max(hit && ah < 0.4 ? 5 * (1 - ah / 0.4) : 0, out && t1 < C4P.pull + 0.3 ? 4 * (1 - (t1 - C4P.pull) / 0.3) : 0);
  ctx.save(); ctx.translate(c4Jit(shk), c4Jit(shk)); c4Cam(cx, lerp(sg[2], sg[3], kk), sg[4], sg[5], sg[6]); drawAlley(now); c4Crater(sx(L.cr), 1.1); c4Pool(sx(L.yL) - 30, 1.2 + (out ? 0.12 * ease3(clamp01((t1 - C4P.pull) / 1.2)) : 0));
  c4Organs(T, T0 + C4P.pull + 0.15, W[0], W[1] + 4, 5, { v: C4_ORG.v, up: C4_ORG.up, dir: C4_ORG.dir, seed: C4_ORG.seed });
  c4Verity(sx(xv), 'stand', true, 0, S2 => {      // (his other arm is behind Yuji's body: it goes in at the front of the belly and the hand comes out of his back)
    const R = [S2.x + 5, S2.y + 5], base = [S2.x - 2, S2.y + 2]; let hx, hy;
    if (t1 < C4P.thrust) { const k = ease3(clamp01((t1 - 0.25) / 0.35)); hx = lerp(base[0], R[0], k); hy = lerp(base[1], R[1], k); }
    else if (t1 < C4P.hit) { const k = (t1 - C4P.thrust) / (C4P.hit - C4P.thrust); hx = lerp(R[0], E[0], k * k); hy = lerp(R[1], E[1], k * k); }
    else if (t1 < C4P.pull) { hx = E[0] + 1.2 * Math.sin(t1 * 40); hy = E[1] + 1.2 * Math.sin(t1 * 33); }
    else { const k = ease3(clamp01((t1 - C4P.pull) / (C4P.gone - C4P.pull))), r = ease3(clamp01((t1 - C4P.gone) / 0.5)); hx = lerp(lerp(E[0], S2.x + 2, k), S2.x - 4, r); hy = lerp(lerp(E[1], S2.y + 6, k), S2.y + 26, r); }
    c4Arm(S2.x, S2.y + 1, hx, hy, 3, out ? 1 : hit ? 0.35 : 0); c4Fist(hx, hy, out || hit ? 1 : 0);
    if (out && t1 < C4P.pull + 0.3) { c4Lump(hx + 4, hy + 3, 0); c4Lump(hx + 8, hy + 6, 1); c4Lump(hx + 6, hy + 10, 2); }
  });
  const FW = c4YDraw(14, hit, sx(L.yL) + (hit && !out ? c4Jit(0.6) : 0), 10, sh, hit && ah < 0.06 ? 0.6 : 0);
  ctx.fillStyle = C4_RED[1]; if (hit) { ctx.fillRect(Math.round(FW.mx), Math.round(FW.my), 1, 8); ctx.fillStyle = C4_RED[0]; ctx.fillRect(Math.round(FW.mx) - 1, Math.round(FW.my), 1, 1); }
  if (hit) { c4Spray(T, T0 + C4P.hit, FW.bx, FW.by, 16, { v: 90, up: 0.7, dir: 1, life: 0.6, cols: C4_BLOOD, seed: 50, stain: 3, gnd: gy + 3 }); c4Spray(T, T0 + C4P.hit, E[0], E[1], 14, { v: 80, up: 0.7, dir: -1, life: 0.6, cols: C4_BLOOD, seed: 51, stain: 3, gnd: gy + 3 }); c4Spray(T, T0 + C4P.hit + 0.1, FW.mx, FW.my, 12, { v: 70, up: 1.1, dir: 1, life: 0.55, cols: C4_BLOOD, seed: 52, stain: 3, gnd: gy + 3 }); for (let i = 0; i < 5; i++) c4Spray(T, T0 + C4P.hit + 0.2 + 0.18 * i, FW.bx + 1, FW.by + 4, 4, { v: 16, up: 0.4, dir: 0, life: 0.6, cols: C4_BLOOD, seed: 60 + i, stain: 3, gnd: gy + 3 }); rsDrip(FW.bx + 1, FW.by + 5, T, 4, 0.1); }
  if (out) c4Guts(FW.bx + 1, FW.by + 5, 18 * ease3(clamp01((t1 - C4P.pull) / 0.9)), T, 1.5);
  const SH = { x: sx(xv) - 10, y: gy - 43 }, hx2 = F0.cx, hy2 = F0.cy; c4Arm(SH.x, SH.y, hx2, hy2, 2, hit ? 0.7 : 0.2); c4Fist(hx2, hy2, hit ? 1 : 0.4);
  if (hit && ah < 0.4) c3Ring(W[0], W[1], ah, true, '255,150,150', Math.min(1, 1.6 / lerp(sg[2], sg[3], kk)));
  c4Cam0(); ctx.restore(); const fl = hit && ah < 0.12 ? 0.5 * (1 - ah / 0.12) : 0; if (fl > 0) { ctx.fillStyle = 'rgba(255,255,255,' + fl.toFixed(3) + ')'; ctx.fillRect(0, 0, VW, VH); }
  ctx.fillStyle = 'rgba(30,10,60,0.14)'; ctx.fillRect(0, 0, VW, VH); msFinish(1);
}

function c4SFall(now, dt, T, st, t1, cx, g) {
  const sx = x => Math.round(cx + x), V = g.vx, L = c4Lay(g), T0 = st.t0, xv0 = V + 28, xv1 = L.yL - 30, TP = c4T('pierce'), drop = clamp01((t1 - 0.22) / 0.26), lf = t1 < 0.22 ? 10 : 10 * (1 - drop * drop), fall = t1 - 0.48, fi = t1 < 0.48 ? 14 : Math.min(8, Math.floor(fall * 24)), imp = 0.48 + 4 / 24, post = t1 - imp;
  const xv = t1 < 0.9 ? xv0 : lerp(xv0, xv1, ease3((t1 - 0.9) / 1.4)), kz = ease3(clamp01((t1 - 0.4) / 2.2)), shk = post >= 0 && post < 0.4 ? 3.5 * (1 - post / 0.4) : 0;
  ctx.save(); ctx.translate(c4Jit(shk), c4Jit(shk)); c4Cam(cx, lerp(1.7, 1.85, kz), lerp(L.yL + 10, L.yL - 14, kz), lerp(26, 27, kz), VH * 0.52); drawAlley(now); c4Crater(sx(L.cr), 1.1);
  c4Pool(sx(L.yL) - 30, 1.32 + 0.22 * ease3(clamp01((t1 - 0.6) / 2.2)));
  const p14 = c4YRX(14), F0 = c4Face(p14.set[14], p14.info, sx(L.yL), 10), W = [F0.bx, F0.by];
  c4Organs(T, TP + C4P.pull + 0.15, W[0], W[1] + 4, 5, { v: C4_ORG.v, up: C4_ORG.up, dir: C4_ORG.dir, seed: C4_ORG.seed });
  const dP = C4_SEQ.find(q => q.k === 'pierce').d - C4P.pull, swing = 0.07 * Math.sin(dP * 7) * Math.exp(-dP * 0.9);      // (he still swings a little from the pierce when he is let go: where the pierce left him)
  const Sx = sx(xv) - 10, Sy = gy - 43, vlift = t1 > 0.9 && t1 < 2.3 ? Math.round(1.2 * Math.abs(Math.sin((t1 - 0.9) * 6))) : 0;
  c4Verity(sx(xv), 'stand', true, vlift, S2 => { c4Arm(S2.x, S2.y + 1, S2.x - 4, S2.y + 27, 2, 1); c4Fist(S2.x - 4, S2.y + 27, 1); });
  const F = c4YDraw(fi, true, sx(L.yL), t1 < 0.48 ? lf : 0, t1 < 0.22 ? swing : 0, post >= 0 && post < 0.05 ? 0.5 : 0);
  if (t1 < 0.48) { c4Guts(F.bx + 1, F.by + 5, 18, T, 1.2); ctx.fillStyle = C4_RED[1]; ctx.fillRect(Math.round(F.mx), Math.round(F.my), 1, 8); }
  else { for (let i = 0; i < 3; i++) c4Lump(F.bx + (i - 1) * 5 + (fi >= 8 ? 0 : 3), F.by + 2 + (i % 2) * 2, i % 3); if (fi >= 8) { ctx.fillStyle = C4_RED[1]; ctx.fillRect(Math.round(F.mx), Math.round(F.my), 1, 5); } }
  { const hand = t1 < 0.22 ? [F0.cx, F0.cy] : null, e = ease3(clamp01((t1 - 0.22) / 0.3)), hx = hand ? hand[0] : lerp(F0.cx, Sx - 3, e), hy = hand ? hand[1] : lerp(F0.cy, Sy + 27, e); c4Arm(Sx, Sy, hx, hy, 2, 1); c4Fist(hx, hy, 1); rsDrip(Sx - 3, Sy + 28, T, 3, 0.4); }
  if (post >= 0) { c3Ring(sx(L.yL) - 22, gy - 3, post, false, '255,225,200', Math.min(1, 1.6 / lerp(1.7, 1.85, kz))); c4Dust(T, T0 + imp, sx(L.yL) - 22, 18, { w: 40, h: 16, life: 1.2, big: 6, seed: 30 }); c4Spray(T, T0 + imp, F.bx, F.by, 14, { v: 60, up: 1.0, dir: 0, life: 0.6, cols: C4_BLOOD, seed: 70, stain: 3, gnd: gy + 3 }); c4Organs(T, T0 + imp, F.bx, F.by, 4, { v: 16, up: 8, dir: 0, seed: 7, gnd: gy + 2 }); }
  c4Cam0(); ctx.restore(); ctx.fillStyle = 'rgba(30,10,60,0.14)'; ctx.fillRect(0, 0, VW, VH); msFinish(1);
}

// ---- WASTED POTENTIAL: Verity's face in a close-up (his own screaming-face picture, enlarged), blood on it, and he speaks
function c4SLine(now, dt, T, st, t1, cx, g) {
  const k = t1 / st.d, z = lerp(1.9, 2.3, ease3(k)), tt0 = C3E_TALK[1].t, n = Math.floor(Math.max(0, T - tt0) * TN_RATE), talking = T >= tt0 && T < tt0 + C3E_TALK[1].d && n < C3E_TALK[1].a.length + 3, fr = talking ? [0, 14, 10, 0, 12, 14, 6][n % 7] : 0;
  rsCloseBg(T); { const gr = ctx.createRadialGradient(VW * 0.5, VH * 0.55, 10, VW * 0.5, VH * 0.55, VW * 0.55); gr.addColorStop(0, 'rgba(110,12,24,0.28)'); gr.addColorStop(1, 'rgba(20,0,10,0)'); ctx.fillStyle = gr; ctx.fillRect(0, 0, VW, VH); }
  ctx.save(); ctx.translate(Math.round(VW * 0.5 + 1.5 * Math.sin(T * 0.7)), Math.round(VH * 0.57)); ctx.scale(z, z); ctx.translate(-32, -24); ctx.drawImage(vfr('scare', fr, false), 0, 0);
  ctx.fillStyle = C4_RED[1]; for (const [x, y, w, h] of [[18, 22, 2, 2], [46, 20, 2, 3], [24, 9, 2, 1], [38, 5, 1, 2], [45, 31, 2, 2], [15, 31, 1, 2], [31, 41, 2, 1], [27, 2, 1, 1]]) ctx.fillRect(x, y, w, h);
  ctx.fillStyle = C4_RED[0]; for (const [x, y] of [[19, 22], [46, 21], [25, 9], [45, 31]]) ctx.fillRect(x, y, 1, 1);
  ctx.fillStyle = C4_RED[2]; ctx.fillRect(43, 33, 1, 10); ctx.fillStyle = C4_RED[1]; ctx.fillRect(44, 33, 1, 6); ctx.fillStyle = C4_RED[3]; ctx.fillRect(30, 52, 6, 1); ctx.fillRect(33, 54, 5, 1); ctx.fillRect(27, 57, 4, 1); ctx.fillStyle = C4_RED[1]; ctx.fillRect(34, 51, 2, 1); ctx.fillRect(36, 55, 2, 1);
  ctx.restore(); rsDrip(VW * 0.5 + 18, VH * 0.57 + 12, T, 3, 0.3); msFinish(1);
}

// ---------------------------------------------------------------- v1.98 THE CALL: the last scene
// The Master's void again, the portal gone: he holds Gojo by the neck and talks to him; the room flashes white; he is afraid; the telephone on his wrist rings ("???"); he answers; a voice asks if he got him and he says he did; the camera pushes in from the whole figure of the caller, standing in the dark, to his gauntlet, which has no stones: the socket of the middle finger shines purple, and the voice says GREAT.
const C5_ART = __THANOS__;      // the two pictures of the last scene (64 x 64): .body = the whole figure, .gaunt = a close-up of his gauntlet with its six sockets empty (tools/thanos_64.png and tools/gauntlet_64.png)
const C5I = (() => { const mk = u => { const i = new Image(); i.src = u; return i; }; return { body: mk(C5_ART.body), gaunt: mk(C5_ART.gaunt), c: null }; })();
const C5G = { o: [27.875, 10.875], f: [36, 20], s: [39.675, 16.35], sc: [47.2, 21.9] };      // the close-up on the figure's picture (one sprite pixel is 4 of the close-up's): where its corner is, where the middle of the gauntlet is, where the middle finger's socket is (on the figure's picture, and in the close-up's own pixels)
function c5Art() {      // the pictures made ready once both have loaded: dark = the figure in the dark (almost black), rimR / rimL = its violet rim light (right / left edges), gdark = the close-up in the dark, glit = a scratch picture for the light of the stone, gaunt = the close-up as it is
  const A = C5I; if (A.c) return A.c; if (!(A.body.complete && A.body.naturalWidth && A.gaunt.complete && A.gaunt.naturalWidth)) return null;
  const mk = () => { const c = document.createElement('canvas'); c.width = c.height = 64; return c; }, dim = (im, k) => { const c = mk(), g = c.getContext('2d'); g.drawImage(im, 0, 0); g.globalCompositeOperation = 'source-atop'; g.fillStyle = 'rgba(6,3,14,' + k + ')'; g.fillRect(0, 0, 64, 64); return c; }, dark = dim(A.body, 0.93);
  return A.c = { dark, rimR: rsRim(dark, 1, [170, 100, 255]), rimL: rsRim(dark, -1, [120, 70, 200]), gdark: dim(A.gaunt, 0.9), glit: mk(), gaunt: A.gaunt };
}
function c5Flash(T) {      // how white (w) and how violet (v) the whole picture is at scene time T: the room's flash (white at once, a flicker as it dies away) and a smaller pulse of violet light with every ring of the call
  const a = T - C5.flash; let w = 0, v = 0;
  if (a >= -0.07 && a < 0) w = (a + 0.07) / 0.07; else if (a >= 0 && a < 1.1) w = a < 0.12 ? 1 : Math.pow(1 - (a - 0.12) / 0.98, 2) * (0.88 + 0.12 * Math.sin(a * 55));
  for (const tr of C5.rings) { const b = T - tr; if (b >= 0 && b < 0.5) { const f = Math.pow(1 - b / 0.5, 2); w = Math.max(w, 0.4 * f); v = Math.max(v, f); } }
  return { w: clamp01(w), v };
}
const c5Ring = T => { let r = 0; for (const tr of C5.rings) { const b = T - tr; if (b >= 0 && b < 0.5) r = Math.max(r, 1 - b / 0.5); } return r; };      // how fresh the last ring is (1 = it has just rung, 0 = it has died away)
function c5Disc(x, y, r, col) { x = Math.round(x); y = Math.round(y); r = Math.max(1, Math.round(r)); ctx.fillStyle = col; for (let j = -r; j <= r; j++) { const w = Math.round(Math.sqrt(r * r + 0.5 - j * j)); ctx.fillRect(x - w, y + j, 2 * w + 1, 1); } }      // a round dot made of whole pixels
function c5Eye(ex, ey, k, T, fear) {      // the Master's eye in fear: it opens wide and round (a dark red rim, a bright red ball, a shine, a pinprick of black) and flickers (fear 0 - 1: the wider it is, the smaller the pinprick)
  const r = k * (2.2 + 0.9 * fear), f = 0.8 + 0.2 * Math.sin(T * 41), R = k * 16;
  ctx.save(); ctx.globalCompositeOperation = 'lighter'; const gr = ctx.createRadialGradient(ex, ey, 0, ex, ey, R); gr.addColorStop(0, 'rgba(255,40,50,' + (0.55 * f).toFixed(3) + ')'); gr.addColorStop(1, 'rgba(255,40,50,0)'); ctx.fillStyle = gr; ctx.fillRect(ex - R, ey - R, 2 * R, 2 * R); ctx.restore();
  c5Disc(ex, ey, r + 1, '#7a0610'); c5Disc(ex, ey, r, '#ff3a3a'); c5Disc(ex - r * 0.3, ey - r * 0.3, r * 0.45, '#ffd0c0'); c5Disc(ex + r * 0.15, ey + r * 0.1, Math.max(1, r * (0.32 - 0.14 * fear)), '#1a0208');
}
function c5Head(T, Cx, Cy, Z, o) {      // the Master's head and shoulders in a big close-up, afraid (o.rot, o.shift = thrown back; o.tr = how hard he trembles, in pixels; o.fear = how wide the eye is open, 0 - 1); returns where the eye is
  const j = o.tr > 0.2 ? [Math.round(Math.sin(T * 83) * o.tr), Math.round(Math.sin(T * 71 + 1) * o.tr)] : [0, 0]; ctx.save(); ctx.translate(j[0], j[1]);
  const e = rsFredHead(Cx, Cy, Z, o.rot || 0, o.shift || 0, 0, 0); c5Eye(e[0], e[1], Z * 0.5, T, o.fear); ctx.restore(); return e;
}
function c5Screen(x, y, w, h, T, clk) {      // the telephone's screen: three question marks in a violet frame that lights up with every ring (and a wave runs out of it); after the click, a voice meter
  const g = Math.max(1, Math.floor((w - 2) / 12)), on = clk >= 0, rg = c5Ring(T), q = ['111', '001', '010', '000', '010'];
  ctx.fillStyle = '#05020a'; ctx.fillRect(x, y, w, h); ctx.fillStyle = 'rgba(190,120,255,' + (on ? 0.9 : 0.4 + 0.5 * rg).toFixed(2) + ')'; ctx.fillRect(x, y, w, 1); ctx.fillRect(x, y + h - 1, w, 1); ctx.fillRect(x, y, 1, h); ctx.fillRect(x + w - 1, y, 1, h);
  if (!on) { const x0 = x + Math.round((w - 11 * g) / 2), y0 = y + Math.round((h - 5 * g) / 2); ctx.fillStyle = rg > 0.3 ? '#ffffff' : '#c9a8ff'; for (let n = 0; n < 3; n++) for (let r = 0; r < 5; r++) for (let c = 0; c < 3; c++) if (q[r][c] === '1') ctx.fillRect(x0 + (n * 4 + c) * g, y0 + r * g, g, g); }
  else { ctx.fillStyle = '#e8d8ff'; for (let i = 0; i < 5; i++) { const hh = Math.max(g, Math.round((0.25 + 0.75 * Math.abs(Math.sin(T * 13 + i * 1.7))) * (h - 4 * g))); ctx.fillRect(x + Math.round((w - 9 * g) / 2) + i * 2 * g, y + Math.round((h - hh) / 2), g, hh); } }
  for (const tr of C5.rings) { const b = T - tr; if (b >= 0 && b < 0.6) { const r = Math.round(b / 0.6 * 7 * g); ctx.strokeStyle = 'rgba(210,170,255,' + (0.7 * (1 - b / 0.6)).toFixed(2) + ')'; ctx.lineWidth = Math.max(1, g * 0.5); ctx.strokeRect(x - r + 0.5, y - r + 0.5, w + 2 * r - 1, h + 2 * r - 1); } }
}

// ---- 1. the Master's void, the portal gone: he talks to Gojo
function c5SRoom(now, dt, T, st, t1) {
  const z = 1.25 + 0.22 * ease3(t1 / st.d), Mx = Math.round(VW * 0.76), fi = 1 - clamp01(t1 / 0.7);
  c4Other(now, T, { z, cx: Mx - 14, ty: (VH + 44) / 2, k: 0, lit: 0.2, eye: 0.95 + 0.08 * Math.sin(T * 2.1), flare: 0.1 });      // (a slow push-in; the speech box is in the top 44 rows, so the camera keeps their heads below it)
  msFinish(1); if (fi > 0) { ctx.fillStyle = 'rgba(0,0,0,' + fi.toFixed(3) + ')'; ctx.fillRect(0, 0, VW, VH); }      // (it comes out of the black of the last shot)
}
// ---- 2. the two of them close: Gojo, hurt, on the left, the Master's head on the right, talking; it ends in the flash
function c5STalk(now, dt, T, st, t1) {
  const U = rsLay().U, Z = rsZ(), b = rsGoBust(Z), p = clamp01(t1 / st.d), talking = t1 > 0.3 && t1 < 2.3, Gx = Math.round(VW * 0.33), Gy = Math.round(VH * 0.6), Mx = Math.round(VW * 0.72), My = Gy + Math.round(2 * Z);
  rsCloseBg(T); rsCamOn(1 + 0.05 * p, Mx, VH * 0.58, Mx, VH * 0.58); rsSmoke(Mx + 40 * U, My - 10 * U, T, U * 1.2);
  ctx.drawImage(b.c, Gx - b.mx, Gy - b.my + Math.round(Math.sin(T * 2.2))); rsDrip(Gx + Z, Gy + 3 * Z, T, 3, 0.1);      // (he sways a little: he is hurt)
  rsFredHead(Mx, My, Z, talking ? 0.02 * Math.sin(T * 9) : 0, 0, 1.0 + 0.25 * Math.sin(T * 6), talking ? 0.7 : 0.15); rsCamOff();
  { const gr = ctx.createLinearGradient(VW * 0.2, 0, VW * 0.8, 0); gr.addColorStop(0, 'rgba(4,2,10,0.6)'); gr.addColorStop(0.48, 'rgba(4,2,10,0)'); ctx.fillStyle = gr; ctx.fillRect(0, 0, VW, VH); }      // (Gojo, who is not speaking, is in shadow)
  msFinish(1);
}
// ---- 3. the flash dies away on the Master's face: his head is thrown back and the eye opens wide; he trembles, a drop of sweat, a red ! over his head, a heart that thumps; then the call rings (the room flashes with it)
function c5SScare(now, dt, T, st, t1) {
  const Z = rsZ() + 1, Cx = Math.round(VW * 0.4), Cy = Math.round(VH * 0.72), jolt = Math.max(0, 1 - t1 / 0.5), rg = c5Ring(T), z = 1 + 0.07 * ease3(t1 / st.d);
  rsCloseBg(T); rsCamOn(z, Cx, Cy, Cx, Cy);
  const e = c5Head(T, Cx, Cy, Z, { rot: 0.3 * jolt * jolt + 0.03 * Math.sin(T * 11), shift: Math.round(6 * Z * jolt * jolt), tr: 0.5 + 1.1 * clamp01(t1 / 1.0), fear: 0.6 + 0.4 * rg });
  { const sw = (T * 0.9) % 1; ctx.fillStyle = 'rgba(190,232,255,' + (0.9 * (1 - sw)).toFixed(2) + ')'; ctx.fillRect(Math.round(e[0] + 5 * Z), Math.round(e[1] - 7 * Z + sw * sw * 14 * Z), Math.max(1, Math.round(Z * 0.7)), Math.round(Z * 1.2)); }      // (a drop of sweat runs down his head)
  rsCamOff(); if (t1 > 0.3 && t1 < 1.3) pxt('!', Math.round(e[0] + 7 * Z), Math.round(e[1] - 11 * Z - 3 * Math.sin(Math.min(1, (t1 - 0.3) / 0.15) * 3.14)), '#ff3a3a', 24, 'center');      // (the game's mark of alarm)
  msFinish(1);
}
// ---- 4. the telephone on his wrist rings: "???" on its screen (the room flashes with each ring); his finger comes down on the button and answers
function c5SRing(now, dt, T, st, t1, cx, g) { c4SWrist(now, dt, T, st, t1, cx, g, { call: 1, clk: C5.click, fa: 1.0, zoom: 2.2 }); }
// ---- 5. his face again while the voice speaks: a slow push-in on the eye; the violet light of the telephone flickers on him with the letters of the voice
function c5SListen(now, dt, T, st, t1) {
  const Z = rsZ() + 1, k = ease3(t1 / st.d), z = 1 + 0.3 * k, Cx = Math.round(VW * 0.4), Cy = Math.round(VH * 0.72), tt = C3E_TALK.find(q => q.w === '???' && q.t >= st.t0), n = Math.floor(Math.max(0, T - tt.t) * TN_RATE), fl = T >= tt.t && T < tt.t + tt.d && n < tt.a.length + 3 ? 0.5 + 0.5 * Math.sin(n * 2.3) : 0;
  rsCloseBg(T); rsCamOn(z, Cx - 5 * Z * k, Cy - 3 * Z * k, VW * 0.5, VH * 0.56);
  c5Head(T, Cx, Cy, Z, { rot: 0.04 + 0.01 * Math.sin(T * 3), tr: 0.45 + 0.4 * fl, fear: 0.45 }); rsCamOff();
  { ctx.save(); ctx.globalCompositeOperation = 'lighter'; const gr = ctx.createRadialGradient(0, VH, 4, 0, VH, VW * 0.7); gr.addColorStop(0, 'rgba(160,90,240,' + (0.1 + 0.2 * fl).toFixed(3) + ')'); gr.addColorStop(1, 'rgba(160,90,240,0)'); ctx.fillStyle = gr; ctx.fillRect(0, 0, VW, VH); ctx.restore(); }      // (the telephone's light)
  msFinish(1);
}
// ---- 6. the gauntlet: the camera pushes in from the whole figure, in the dark, to his hand; both the figure and the close-up (4 times as fine; it takes over while the camera is still moving) are almost black; then a purple stone appears in the middle finger's socket and it is the only thing that shines
function c5Thanos(A, a) {      // the figure in the dark: almost black, with only a faint violet rim light; a = how much of it is seen
  ctx.globalAlpha = a; ctx.drawImage(A.dark, 0, 0); ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = 0.3 * a; ctx.drawImage(A.rimR, 0, 0); ctx.globalAlpha = 0.12 * a; ctx.drawImage(A.rimL, 0, 0); ctx.restore(); ctx.globalAlpha = 1;
}
const c5Stone = s => ({ on: clamp01(s / 0.9) * (s < 0.5 ? (Math.sin(s * 70) > -0.2 ? 1 : 0.35) : 1), bl: ease3(clamp01((s - 0.1) / 1.5)) });      // the stone s seconds after it appears: how strongly it shines (it flickers on) and how far its light has spread
function c5Shine(x, y, Z, s, T) {      // the stone (Z = how big one pixel of the close-up is on the screen): a soft purple light round it, the gem itself (shaded purple, a white spark on it), a four-pointed glint, sparkles; everything else stays dark
  const k = c5Stone(s), on = k.on, pul = 0.88 + 0.12 * Math.sin(T * 5), R = (5 + 14 * k.bl) * Z;
  ctx.save(); ctx.globalCompositeOperation = 'lighter'; const gr = ctx.createRadialGradient(x, y, 0, x, y, R); gr.addColorStop(0, 'rgba(190,110,255,' + (0.55 * on * pul).toFixed(3) + ')'); gr.addColorStop(0.4, 'rgba(140,60,230,' + (0.3 * on * pul).toFixed(3) + ')'); gr.addColorStop(1, 'rgba(90,20,170,0)'); ctx.fillStyle = gr; ctx.fillRect(x - R, y - R, 2 * R, 2 * R); ctx.restore();
  { const r = 1.65 * Z; ctx.globalAlpha = on; c5Disc(x, y, r + 0.5 * Z, '#2a0a58'); c5Disc(x, y, r, '#5a1ec0'); c5Disc(x - 0.25 * Z, y - 0.25 * Z, r * 0.78, '#8a3cf0'); c5Disc(x - 0.5 * Z, y - 0.5 * Z, r * 0.48, '#c58aff'); c5Disc(x - 0.75 * Z, y - 0.75 * Z, Math.max(1, r * 0.2), '#fff0ff'); ctx.globalAlpha = 1; }      // (the gem)
  ctx.save(); ctx.globalCompositeOperation = 'lighter'; const gl = Math.sin(Math.PI * clamp01((s - 0.35) / 1.4)), L = Math.round(13 * Z * gl); ctx.fillStyle = '#dcc0ff'; for (let i = 1; i <= L; i++) { ctx.globalAlpha = 0.85 * Math.pow(1 - i / L, 1.6); ctx.fillRect(x + i, y, 1, 1); ctx.fillRect(x - i, y, 1, 1); ctx.fillRect(x, y + i, 1, 1); ctx.fillRect(x, y - i, 1, 1); if (i < L * 0.4) { ctx.fillRect(x + i, y + i, 1, 1); ctx.fillRect(x - i, y - i, 1, 1); ctx.fillRect(x + i, y - i, 1, 1); ctx.fillRect(x - i, y + i, 1, 1); } } ctx.globalAlpha = 1;
  if (s > 0.6) for (let i = 0; i < 14; i++) { const h = Math.imul(i + 5, 2654435761) >>> 0, ph = ((s - 0.6) * (0.5 + (h % 5) * 0.12) + (h >> 8) % 100 / 100) % 1, an = (h >> 4) % 628 / 100, d = ph * (6 + (h >> 12) % 12) * Z; ctx.globalAlpha = 1 - ph; ctx.fillStyle = (h >> 20) & 1 ? '#f4e4ff' : '#b878ff'; ctx.fillRect(Math.round(x + Math.cos(an) * d), Math.round(y + Math.sin(an) * d - ph * 4 * Z), Z > 2 ? 2 : 1, Z > 2 ? 2 : 1); } ctx.globalAlpha = 1;
  ctx.restore();
}
function c5SGaunt(now, dt, T, st, t1) {
  const A = c5Art(), Zc = Math.max(2, Math.round(VH * 0.8 / 51)), z1 = 4 * Zc, z0 = Math.max(1.3, VH * 0.8 / 62), u = clamp01((t1 - 0.4) / 4.3), e = ease3(u), z = z0 * Math.pow(z1 / z0, e), ca = ease3(clamp01((u - 0.55) / 0.3)), s = t1 - C5.shine;
  const sx = Math.round(VW * 0.5), sy = Math.round(VH * 0.56), fx0 = lerp(32, C5G.f[0], e), fy0 = lerp(34, C5G.f[1], e), fx = C5G.o[0] - Math.round((C5G.o[0] - fx0) * z) / z, fy = C5G.o[1] - Math.round((C5G.o[1] - fy0) * z) / z;      // (the camera is put so that the close-up's pixels lie on whole pixels of the screen)
  ctx.fillStyle = '#030208'; ctx.fillRect(0, 0, VW, VH);
  { const gr = ctx.createRadialGradient(sx, sy, 4, sx, sy, VW * 0.5); gr.addColorStop(0, 'rgba(60,25,100,0.1)'); gr.addColorStop(1, 'rgba(20,8,40,0)'); ctx.fillStyle = gr; ctx.fillRect(0, 0, VW, VH); }      // (the faintest violet haze behind him, and a few dim stars: the background is as dark as it can be)
  ctx.fillStyle = '#cfc8ff'; for (let i = 0; i < 30; i++) { ctx.globalAlpha = 0.04 + 0.18 * Math.abs(Math.sin(T * 0.7 + i * 1.3)); ctx.fillRect((i * 53 + 11) % VW, (i * 97 + 7) % VH, 1, 1); } ctx.globalAlpha = 1;
  if (A) {
    c4CamOn(z, fx, fy, sx, sy); c5Thanos(A, 1 - ca);
    if (ca > 0) {
      ctx.save(); ctx.translate(C5G.o[0], C5G.o[1]); ctx.scale(0.25, 0.25); ctx.globalAlpha = ca; ctx.drawImage(A.gdark, 0, 0);
      if (s > 0) {      // (the stone lights the metal right next to it, tinted purple, and nothing else)
        const k = c5Stone(s), g = A.glit.getContext('2d'), R = 4 + 6 * k.bl; g.globalCompositeOperation = 'source-over'; g.clearRect(0, 0, 64, 64); g.drawImage(A.gaunt, 0, 0); g.globalCompositeOperation = 'source-atop'; g.fillStyle = 'rgba(150,80,255,0.5)'; g.fillRect(0, 0, 64, 64); g.globalCompositeOperation = 'destination-in';
        const gr = g.createRadialGradient(C5G.sc[0], C5G.sc[1], 0, C5G.sc[0], C5G.sc[1], R); gr.addColorStop(0, 'rgba(0,0,0,1)'); gr.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = gr; g.fillRect(0, 0, 64, 64); g.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 0.6 * k.on; ctx.drawImage(A.glit, 0, 0);
      }
      ctx.restore();
    }
    c4Cam0(); if (s > 0) c5Shine(sx + (C5G.s[0] - fx) * z, sy + (C5G.s[1] - fy) * z, Zc, s, T);
  }
  msFinish(1); const fa = Math.max(1 - clamp01(t1 / 0.5), clamp01((t1 - 8.1) / 1.4)); if (fa > 0) { ctx.fillStyle = 'rgba(0,0,0,' + fa.toFixed(3) + ')'; ctx.fillRect(0, 0, VW, VH); }      // (it comes out of black and goes back into it)
}

// ---- the shots after the grab, by name
const c4Shots = { grip: c4Grip, other: c4SOther, wrist: c4SWrist, shut: c4SShut, yank: c4SYank, down: c4SDown, beat: c4SBeat, lift: c4SLift, pierce: c4SPierce, fall: c4SFall, line: c4SLine, room: c5SRoom, mtalk: c5STalk, scare: c5SScare, ring: c5SRing, listen: c5SListen, gaunt: c5SGaunt };
c4Shots.black = (now, dt, T, st, t1, cx, g) => { const ln = C4_SEQ.find(q => q.k === 'line'); c4SLine(now, dt, T, ln, ln.d, cx, g); ctx.fillStyle = 'rgba(0,0,0,' + clamp01(t1 / 1.1).toFixed(3) + ')'; ctx.fillRect(0, 0, VW, VH); };      // (the last picture of Verity fades out)

// ---- the ending: the scene
function c3EndFrame(now, dt) {
  const T = story.T = Math.max(0, now - story.t0) / 1000, cx = Math.round(VW / 2), g = c4Geo(), ev = (k, t, f, win) => { if (T >= t && T < t + (win || 0.5)) once2(k, f); };
  if (T >= C3E.card) { c3Card(now, T); return; }
  wx = 0; ctx.save(); ctx.imageSmoothingEnabled = false; ctx.fillStyle = '#000'; ctx.fillRect(0, 0, VW, VH);
  const sk = story.shk && now < story.shk.until ? story.shk.amp : 0; ctx.save(); if (sk) ctx.translate(c4Jit(sk), c4Jit(sk));
  if (T < C3E.grab + C3E.hold) { c4Wide0(now, dt, T, cx, g); drawSmoke(now, dt); c3Sparks(now, dt, cx); rsWindBits(T, 0.45, 0, VW); }
  else { let st = C4_SEQ[C4_SEQ.length - 1]; for (const s of C4_SEQ) if (T >= s.t0 && T < s.t0 + s.d) st = s; c4Shots[st.k](now, dt, T, st, T - st.t0, cx, g); }
  ctx.restore();
  ev('wind', 0.05, () => snd('rumble', 2.5), 0.4); ev('blink', C3E.blink, () => { snd('arrive'); snd('blink'); spark(g.vx, gy - 30, 10, ['#c890ff', '#7a3aff', '#ffffff'], false, 1); }); ev('arm', C3E.arm, () => snd('f:swing', 3)); ev('dive', C3E.dive, () => snd('dash', 0));
  ev('grab', C3E.grab, () => { snd('rsgrab'); snd('f:hit', 3); c2Shake(now, 260, 3); }); ev('crunch', c4T('grip') + 0.45, () => { snd('c4crunch'); snd('yscream', 1); }); ev('arrive', c4T('other') + 0.42, () => { snd('blink'); snd('gasp', 1); }); ev('sensei', c4T('other') + 0.9, () => snd('yscream', 0), 1); ev('click', c4T('wrist') + 0.8, () => snd('c4click')); ev('pclose', c4T('wrist') + 0.95, () => snd('portalclose'), 1.5); ev('strain', c4T('shut') + 1.35, () => snd('yscream', 2), 1);
  { const Ty = c4T('yank'), Td = c4T('down'), Tb = c4T('beat'), Tl = c4T('lift'), Tp = c4T('pierce'), Tf = c4T('fall');
    ev('ypull', Ty + C4Y.hold, () => snd('rsgrab')); ev('yshut', Ty + C4Y.shut - 0.02, () => snd('tink')); ev('yswing', Ty + 0.95, () => snd('f:swing', 3)); ev('yslam', Ty + C4Y.slam, () => { snd('f:hit', 3); snd('c4pound', 1); c2Shake(now, 450, 6); });
    for (let i = 0; i < 3; i++) ev('dcough' + i, Td + [0.16, 0.48, 0.76][i], () => snd('c4cough'));
    for (let i = 0; i < C4B.all.length; i++) ev('blow' + i, Tb + C4B.all[i], () => { snd('c4pound', i > 8 ? 1 : 0); c2Shake(now, 130, 1 + 0.2 * Math.min(i, 16)); });
    ev('crater', Tb + C4B.big, () => { snd('c4crater'); snd('f:hit', 3); c2Shake(now, 700, 8); }, 1);
    ev('lgrab', Tl + 0.1, () => snd('rsgrab')); ev('lgasp', Tl + 0.9, () => snd('gasp', 1));
    ev('pstab', Tp + C4P.thrust + 0.06, () => { snd('c4stab'); c2Shake(now, 400, 5); }); ev('pcough', Tp + C4P.hit + 0.15, () => snd('c4cough')); ev('ppull', Tp + C4P.pull, () => { snd('c4pull'); c2Shake(now, 300, 4); }); ev('pguts', Tp + C4P.pull + 0.4, () => snd('c4guts'));
    ev('fland', Tf + 0.48 + 4 / 24, () => { snd('land'); snd('c4guts'); c2Shake(now, 350, 3.5); }); }
  { const Tr = c4T('room'), Ts = c4T('scare'), Tg = c4T('ring'), Tt = c4T('gaunt');      // the last scene: the void's rumble, the flash, the gasp and the heart, the three rings, the answer, the shine
    ev('rroom', Tr + 0.05, () => snd('rumble', 2.5), 0.4); ev('cflash', C5.flash, () => { snd('c5flash'); c2Shake(now, 500, 4); }); ev('sgasp', Ts + 0.25, () => snd('gasp', 1)); for (let i = 0; i < 3; i++) ev('sbeat' + i, Ts + 0.5 + 0.6 * i, () => snd('c5beat'));
    C5.rings.forEach((t, i) => ev('ring' + i, t, () => snd('c5ring'), 0.6)); ev('conn', Tg + C5.click, () => snd('c5conn')); ev('shine', Tt + C5.shine, () => snd('c5shine'), 1); }
  c3Talk(T, C3E_TALK);
  { const fv = c5Flash(T); if (fv.v > 0.01) { ctx.fillStyle = 'rgba(170,110,255,' + (0.35 * fv.v).toFixed(3) + ')'; ctx.fillRect(0, 0, VW, VH); } if (fv.w > 0.01) { ctx.fillStyle = 'rgba(255,255,255,' + fv.w.toFixed(3) + ')'; ctx.fillRect(0, 0, VW, VH); } }      // (the flashes of the last scene lie over everything)
  const wf = 1 - clamp01(T / 0.5); if (wf > 0) { ctx.fillStyle = 'rgba(255,255,255,' + wf.toFixed(3) + ')'; ctx.fillRect(0, 0, VW, VH); }      // (the cut from the fight comes out of white)
  const fl = T - C3E.grab; if (fl >= 0 && fl < 0.14) { ctx.fillStyle = 'rgba(255,255,255,' + (0.7 * (1 - fl / 0.14)).toFixed(3) + ')'; ctx.fillRect(0, 0, VW, VH); }
}
function c3Card(now, T) {      // CHAPTER 2: THE PORTAL, TO BE CONTINUED
  const t = T - C3E.card; ctx.save(); ctx.imageSmoothingEnabled = false; ctx.fillStyle = '#000'; ctx.fillRect(0, 0, VW, VH); once2('card', () => { snd('msting'); storyDone5(); }); ctx.globalAlpha = clamp01((t + 0.1) / 1.0);
  pxt('CHAPTER 2', VW / 2, Math.round(VH / 2) - 10, '#ffffff', 16, 'center'); pxt('THE PORTAL', VW / 2, Math.round(VH / 2) + 8, '#c9a8ff', 8, 'center'); pxt('TO BE CONTINUED', VW / 2, Math.round(VH / 2) + 26, '#ffd34d', 8, 'center'); if (t > 2.2 && Math.floor(now / 600) % 2 === 0) pxt('TAP TO CONTINUE', VW / 2, VH - 8, '#9d8cff', 8, 'center'); ctx.globalAlpha = 1; ctx.restore();
}
window.__c3EndT = () => story ? story.T : -1;      // test hook: the scene time
window.__c3End = t => { if (!story) return; if (!story.c3.end) startC3End(pnow()); story.t0 = pnow() - (t || 0) * 1000; story.ev = {}; };      // test hook: start the ending (or jump in it) at scene time t
