// Procedural sound effects for Jujutsu Sorcerers (Web Audio, no audio files): footsteps, wind, jump, landing, teleport.
// makeSfx(ctx) works with a real AudioContext and with an OfflineAudioContext (the tests render it to WAV and measure it).
// Mix rule for jump / landing / teleport: the DEEP layers (bass) go out at full level, everything else (air, noise, shimmer)
// goes through a soft low-passed bus at half level, so they sound low and round but keep their weight.
function makeSfx(ac) {
  const LEVEL = { master: 0.72, wind: 0.14 };            // wind is meant to be very quiet: about -38 dBFS RMS
  const sr = ac.sampleRate, R = (a, b) => a + Math.random() * (b - a), T = at => (at === undefined ? ac.currentTime + 0.004 : at);

  // ---- output chain: buses -> master -> gentle compressor -> speakers, plus one small room reverb
  const master = ac.createGain(); master.gain.value = LEVEL.master;
  const comp = ac.createDynamicsCompressor();
  comp.threshold.value = -9; comp.knee.value = 12; comp.ratio.value = 4; comp.attack.value = 0.004; comp.release.value = 0.2;
  const lim = ac.createWaveShaper(), curve = new Float32Array(2049);       // soft limiter: peaks can never clip, quiet sounds pass untouched
  for (let i = 0; i < curve.length; i++) curve[i] = Math.tanh((i / 1024 - 1) * 1.3) / 1.3 * 1.3 * 0.8;
  lim.curve = curve; master.connect(comp); comp.connect(lim); lim.connect(ac.destination);
  const dry = ac.createGain(); dry.connect(master);
  const irLen = (0.75 * sr) | 0, ir = ac.createBuffer(2, irLen, sr);
  for (let c = 0; c < 2; c++) {                          // rooftop-ish room: noise that decays and gets darker with time
    const d = ir.getChannelData(c); let y = 0;
    for (let i = 0; i < irLen; i++) {
      const t = i / irLen; y += (Math.random() * 2 - 1 - y) * (0.55 - 0.45 * t);
      d[i] = y * Math.pow(1 - t, 3.2) * (i < 48 ? i / 48 : 1);
    }
  }
  const rev = ac.createConvolver(); rev.buffer = ir;
  const wet = ac.createGain(); wet.gain.value = 0.5; rev.connect(wet); wet.connect(master);
  const vol = { master: 1, steps: 1, wind: 1, jump: 1, tele: 1, atk: 1 }, C = {}, st = { on: true, windMul: 1 };   // 1 = the designed level, 2 = twice as loud
  function bus(gain, send, lp, cat) {                    // gain, reverb send amount, optional low-pass cutoff, volume category
    const g = ac.createGain(); g.gain.value = gain; let n = g;
    if (lp) { n = ac.createBiquadFilter(); n.type = 'lowpass'; n.frequency.value = lp; n.Q.value = 0.5; g.connect(n); }
    n.connect(cat.dry); const s = ac.createGain(); s.gain.value = send; n.connect(s); s.connect(cat.wet);
    return g;
  }
  for (const name of ['steps', 'jump', 'tele', 'atk']) {   // footsteps | jump + landing | teleport | attacks
    const cat = { dry: ac.createGain(), wet: ac.createGain() }; cat.dry.connect(dry); cat.wet.connect(rev);
    C[name] = { cat, step: bus(2, 0.2, 0, cat), deep: bus(0.8, 0.16, 0, cat), soft: bus(0.5, 0.2, 1400, cat) };
  }
  const applyMaster = () => master.gain.setTargetAtTime(st.on ? LEVEL.master * vol.master : 0, ac.currentTime, 0.04);

  // ---- building blocks: filtered noise bursts and pitch-gliding tones with click-free envelopes
  const nlen = (2 * sr) | 0, nbuf = ac.createBuffer(1, nlen, sr), nd = nbuf.getChannelData(0);
  for (let i = 0; i < nlen; i++) nd[i] = Math.random() * 2 - 1;
  function env(g, t, atk, dur, peak) {
    g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(peak, t + atk); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  }
  function burst(out, t, o) {
    const s = ac.createBufferSource(), f = ac.createBiquadFilter(), g = ac.createGain();
    s.buffer = nbuf; f.type = o.type || 'bandpass'; f.Q.value = o.q || 1;
    f.frequency.setValueAtTime(o.f, t); if (o.f2) f.frequency.exponentialRampToValueAtTime(o.f2, t + o.dur);
    env(g, t, o.atk || 0.001, o.dur, o.gain);
    s.connect(f); f.connect(g); g.connect(out); s.loop = o.dur > 1.8; s.start(t, R(0, o.dur > 1.8 ? 1.9 : 1.9 - o.dur)); s.stop(t + o.dur + 0.03);   // the noise clip is 2 s long: longer sounds loop it
  }
  function tone(out, t, o) {
    const s = ac.createOscillator(), g = ac.createGain(); s.type = o.type || 'sine';
    s.frequency.setValueAtTime(o.f, t); if (o.f2) s.frequency.exponentialRampToValueAtTime(o.f2, t + o.dur * (o.cur || 0.9));
    env(g, t, o.atk || 0.003, o.dur, o.gain);
    s.connect(g); g.connect(out); s.start(t); s.stop(t + o.dur + 0.03);
  }

  // ---- wind: two looping noise layers (a low breath and a thin whistle) with slow, uneven gusts
  const windGain = ac.createGain(); windGain.gain.value = 0; windGain.connect(dry);
  let windOnNow = false, windBuilt = false;
  function buildWind() {
    const sec = 12, xf = 0.6, L = (sec * sr) | 0, X = (xf * sr) | 0, a = new Float32Array(L + X), out = ac.createBuffer(1, L, sr), o = out.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    for (let i = 0; i < L + X; i++) {                    // pink noise (Paul Kellet's filter)
      const w = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + w * 0.0555179; b1 = 0.99332 * b1 + w * 0.0750759; b2 = 0.969 * b2 + w * 0.153852;
      b3 = 0.8665 * b3 + w * 0.3104856; b4 = 0.55 * b4 + w * 0.5329522; b5 = -0.7616 * b5 - w * 0.016898;
      a[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + w * 0.5362) * 0.11; b6 = w * 0.115926;
    }
    for (let i = 0; i < L; i++) o[i] = a[i];
    for (let i = 0; i < X; i++) { const k = i / X; o[i] = a[i] * Math.sqrt(k) + a[L + i] * Math.sqrt(1 - k); }   // equal-power seam: the loop point is inaudible
    const lo = ac.createBufferSource(), hi = ac.createBufferSource(); lo.buffer = hi.buffer = out; lo.loop = hi.loop = true;
    const lp = ac.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 560; lp.Q.value = 0.8;
    const bp = ac.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 1150; bp.Q.value = 2.4;
    const gl = ac.createGain(), gh = ac.createGain(), hp = ac.createBiquadFilter(); gl.gain.value = 0.8; gh.gain.value = 0.35;
    hp.type = 'highpass'; hp.frequency.value = 170;
    lo.connect(lp); lp.connect(gl); gl.connect(hp); hi.connect(bp); bp.connect(gh); gh.connect(hp); hp.connect(windGain);
    const lfo = (f, depth, p) => { const s = ac.createOscillator(), g = ac.createGain(); s.frequency.value = f; g.gain.value = depth; s.connect(g); g.connect(p); s.start(); };
    lfo(0.071, 240, lp.frequency); lfo(0.133, 110, lp.frequency); lfo(0.047, 380, bp.frequency); lfo(0.083, 0.28, gl.gain); lfo(0.061, 0.2, gh.gain);
    lo.start(0); hi.start(0, 4.7); windBuilt = true;
  }

  return {
    ac, master,
    step(alt, back, at) {                                // calm, heavy footstep: heel lands with a dull "tok" and a deep thump, the forefoot rolls down a beat later ("da-dum")
      const t = T(at), B = C.steps, v = R(0.9, 1) * (back ? 0.8 : 1), f = R(0.94, 1.06) * (alt ? 1.05 : 0.95) * (back ? 0.94 : 1);
      burst(B.step, t, { dur: 0.085, f: 440 * f, q: 0.9, gain: 1.6 * v, atk: 0.002 });                 // heel body (low mids, no bright click)
      burst(B.step, t, { dur: 0.022, f: 1150 * f, q: 1.0, gain: 0.3 * v, atk: 0.001 });                // faint contact, much softer and lower than before
      tone(B.step, t, { type: 'triangle', f: 118 * f, f2: 52 * f, dur: 0.19, gain: 0.22 * v, atk: 0.004 });   // heavy thump
      tone(B.step, t, { f: 205 * f, f2: 100 * f, dur: 0.07, gain: 0.08 * v, atk: 0.003 });             // knock
      burst(B.step, t + 0.095, { dur: 0.07, f: 320 * f, q: 0.9, gain: 0.9 * v, atk: 0.005 });          // forefoot rolling down
      tone(B.step, t + 0.095, { f: 88 * f, f2: 54 * f, dur: 0.11, gain: 0.09 * v, atk: 0.006 });
    },
    jump(at) {                                           // push-off: deep thump + a soft rising and falling whoosh
      const t = T(at), B = C.jump;
      tone(B.deep, t, { type: 'triangle', f: 122, f2: 62, dur: 0.24, gain: 0.55, atk: 0.004 });
      tone(B.deep, t, { f: 230, f2: 130, dur: 0.09, gain: 0.12, atk: 0.003 });
      burst(B.soft, t, { type: 'lowpass', f: 300, f2: 1100, q: 0.6, dur: 0.22, gain: 0.2, atk: 0.03 });
      burst(B.soft, t + 0.12, { type: 'lowpass', f: 1100, f2: 350, q: 0.6, dur: 0.2, gain: 0.12, atk: 0.02 });
    },
    land(p, at) {                                        // p = 1 normal, 1.6 for the heavy landing after the teleport
      const t = T(at), B = C.jump; p = p || 1;
      tone(B.deep, t, { type: 'triangle', f: 138 - 8 * p, f2: 62, dur: 0.2 + 0.08 * p, gain: 0.42 + 0.1 * p, atk: 0.003 });
      tone(B.deep, t, { f: 250, f2: 125, dur: 0.1 + 0.02 * p, gain: 0.3 + 0.05 * p, atk: 0.002 });
      burst(B.soft, t, { type: 'lowpass', f: 900, f2: 300, q: 0.7, dur: 0.09 + 0.04 * p, gain: 3.2 + 0.8 * p, atk: 0.001 });
      if (p > 1) tone(B.deep, t + 0.02, { f: 72, f2: 40, dur: 0.4, gain: 0.2 * (p - 1), atk: 0.01 });
    },
    charge(at) {                                         // teleport 1: warm energy swells up
      const t = T(at), B = C.tele;
      tone(B.deep, t, { type: 'triangle', f: 65, f2: 150, dur: 0.14, gain: 0.22, atk: 0.03, cur: 1 });
      tone(B.soft, t, { type: 'sawtooth', f: 130, f2: 300, dur: 0.14, gain: 0.25, atk: 0.04, cur: 1 });
    },
    vanish(at) {                                         // teleport 2: he folds into a point (pitch dive + air rushing in)
      const t = T(at), B = C.tele;
      tone(B.deep, t, { f: 240, f2: 52, dur: 0.16, gain: 0.5, atk: 0.002, cur: 0.85 });
      burst(B.soft, t, { f: 1400, f2: 300, q: 1.4, dur: 0.12, gain: 0.45, atk: 0.004 });
    },
    arrive(at) {                                         // teleport 3: deep boom where he reappears, with a faint shimmer
      const t = T(at), B = C.tele;
      tone(B.deep, t, { type: 'triangle', f: 128, f2: 42, dur: 0.5, gain: 0.42, atk: 0.004 });
      tone(B.deep, t, { f: 256, f2: 84, dur: 0.2, gain: 0.2, atk: 0.003 });
      burst(B.soft, t, { type: 'lowpass', f: 1200, f2: 250, q: 0.7, dur: 0.14, gain: 0.55, atk: 0.002 });
      tone(B.soft, t + 0.03, { f: 523, dur: 0.55, gain: 0.08, atk: 0.02 }); tone(B.soft, t + 0.05, { f: 784, dur: 0.5, gain: 0.05, atk: 0.02 });
    },
    fall(at) {                                           // teleport 4: soft falling whoosh
      const t = T(at), B = C.tele;
      burst(B.soft, t, { type: 'lowpass', f: 1000, f2: 160, q: 0.8, dur: 0.36, gain: 0.7, atk: 0.08 });
      tone(B.deep, t, { f: 120, f2: 58, dur: 0.34, gain: 0.12, atk: 0.06 });
    },
    swing(k, at) {                                       // air rushing past the fist / leg: soft rising whoosh (a little deeper for the kick)
      const t = T(at), B = C.atk, kick = k === 3 || k === 15 || k === 17;
      burst(B.soft, t, { f: kick ? 380 : 650, f2: kick ? 1100 : 1700, q: 0.8, dur: kick ? 0.22 : 0.16, gain: kick ? 0.9 : 0.8, atk: 0.04 });
      tone(B.deep, t, { type: 'triangle', f: kick ? 90 : 120, f2: kick ? 60 : 85, dur: 0.16, gain: 0.1, atk: 0.05 });
    },
    hit(k, at) {                                         // impact: deep thump + dull slap + a crackle of cursed energy (red = heavier and longer)
      const t = T(at), B = C.atk, red = k === 3 || k === 15 || k === 17;
      tone(B.deep, t, { type: 'triangle', f: red ? 128 : 150, f2: red ? 52 : 62, dur: red ? 0.4 : 0.26, gain: red ? 0.46 : 0.34, atk: 0.003 });
      tone(B.deep, t, { f: 240, f2: 110, dur: 0.09, gain: 0.3, atk: 0.002 });
      burst(B.soft, t, { f: red ? 500 : 900, f2: red ? 160 : 300, q: 0.9, dur: red ? 0.2 : 0.14, gain: red ? 2.8 : 2.2, atk: 0.001 });
      tone(B.soft, t, { type: 'sawtooth', f: red ? 330 : 560, f2: red ? 90 : 160, dur: red ? 0.3 : 0.18, gain: 0.12, atk: 0.004 });
    },
    smack(k, at) {                                       // the body blow when a hit lands on something: deep thump + dull slap
      const t = T(at), B = C.atk, red = k === 3 || k === 15 || k === 17;
      tone(B.deep, t, { type: 'triangle', f: red ? 100 : 124, f2: 46, dur: red ? 0.34 : 0.22, gain: red ? 0.5 : 0.38, atk: 0.003 });
      burst(B.soft, t, { f: red ? 450 : 700, f2: 180, q: 0.8, dur: 0.12, gain: red ? 3.0 : 2.4, atk: 0.001 });
    },
    ko(at) {                                             // the dummy goes down: a heavy hit, a whoosh as he topples, then the thud on the floor
      const t = T(at), B = C.atk;
      tone(B.deep, t, { type: 'triangle', f: 150, f2: 44, dur: 0.55, gain: 0.5, atk: 0.004 });
      burst(B.soft, t, { f: 1100, f2: 200, q: 0.8, dur: 0.45, gain: 1.2, atk: 0.03 });
      tone(B.deep, t + 0.4, { type: 'triangle', f: 112, f2: 40, dur: 0.45, gain: 0.45, atk: 0.003 });
      burst(B.soft, t + 0.4, { f: 600, f2: 160, q: 0.8, dur: 0.18, gain: 3.2, atk: 0.001 });
    },
    finisher(at) {                                       // all four hits landed in order: a low swell with a faint shimmer
      const t = T(at), B = C.atk;
      tone(B.deep, t, { type: 'triangle', f: 80, f2: 200, dur: 0.36, gain: 0.3, atk: 0.05 });
      tone(B.soft, t + 0.05, { f: 392, dur: 0.5, gain: 0.07, atk: 0.03 }); tone(B.soft, t + 0.1, { f: 523, dur: 0.5, gain: 0.05, atk: 0.03 });
    },
    hurt(k, at) {                                        // Gojo takes a hit: a dull thump and slap (a different, softer voice than the hit he deals)
      const t = T(at), B = C.atk;
      tone(B.deep, t, { type: 'triangle', f: 112, f2: 50, dur: 0.3, gain: 0.45, atk: 0.003 });
      burst(B.soft, t, { f: 520, f2: 160, q: 0.8, dur: 0.14, gain: 2.6, atk: 0.001 });
    },
    pull(at) {                                           // Lapse Blue: a low hum swells as the orb gathers, air is sucked in, a deep thump as the enemy is dragged to him
      const t = T(at), B = C.tele;
      tone(B.deep, t, { type: 'triangle', f: 70, f2: 170, dur: 0.34, gain: 0.3, atk: 0.12, cur: 1 });
      burst(B.soft, t, { f: 1500, f2: 260, q: 1.2, dur: 0.34, gain: 0.8, atk: 0.1 });
      tone(B.deep, t + 0.2, { type: 'triangle', f: 150, f2: 50, dur: 0.3, gain: 0.4, atk: 0.004 });
    },
    stun(at) {                                           // the enemy is caught: a short crackle of blue energy
      const t = T(at), B = C.tele;
      tone(B.soft, t, { type: 'sawtooth', f: 520, f2: 130, dur: 0.22, gain: 0.14, atk: 0.004 });
      burst(B.soft, t, { f: 1200, f2: 300, q: 1.0, dur: 0.16, gain: 0.9, atk: 0.002 });
    },
    block(at) {                                          // BLOCK: a hit bounces off the forcefield: a low thud, a bright ring and a crackle
      const t = T(at), B = C.atk;
      tone(B.deep, t, { type: 'triangle', f: 190, f2: 90, dur: 0.12, gain: 0.35, atk: 0.003 });
      tone(B.soft, t, { f: 1500, f2: 900, dur: 0.2, gain: 0.25, atk: 0.002 });
      burst(B.soft, t, { type: 'highpass', f: 3200, q: 0.6, dur: 0.14, gain: 0.5, atk: 0.001 });
    },
    dash(k, at) {                                        // DASH: a quick push-off thump, a rushing whoosh and a scuff as he skids (k: 0 forward, 1 back = a little lower and softer)
      const t = T(at), B = C.jump, b = k ? 0.85 : 1;
      tone(B.deep, t, { type: 'triangle', f: 150 * b, f2: 70 * b, dur: 0.14, gain: 0.45, atk: 0.004 });
      burst(B.soft, t, { type: 'bandpass', f: 500 * b, f2: 2600 * b, q: 0.7, dur: 0.26, gain: 0.55, atk: 0.03 });
      burst(B.soft, t + 0.2, { f: 900, f2: 300, q: 0.9, dur: 0.16, gain: 0.35, atk: 0.01 });
    },
    mbcharge(at) {                                       // MAX BLUE 1: a long rising swell with air rushing in as the orb forms
      const t = T(at), B = C.tele;
      tone(B.deep, t, { type: 'triangle', f: 60, f2: 180, dur: 1.4, gain: 0.3, atk: 0.9, cur: 1 });
      tone(B.soft, t, { type: 'sawtooth', f: 120, f2: 360, dur: 1.4, gain: 0.2, atk: 1.0, cur: 1 });
      burst(B.soft, t, { f: 300, f2: 2000, q: 1.0, dur: 1.4, gain: 0.7, atk: 0.9 });
    },
    orbstart(at) {                                       // MAX BLUE 2: the orb is released: a deep boom
      const t = T(at), B = C.tele;
      tone(B.deep, t, { type: 'triangle', f: 92, f2: 34, dur: 0.7, gain: 0.55, atk: 0.004 });
      burst(B.soft, t, { f: 1200, f2: 200, q: 0.8, dur: 0.4, gain: 1.4, atk: 0.003 });
    },
    orb(dur, at) {                                       // MAX BLUE 3: while the orb lives: a deep swelling hum, a buzzing mid layer phones can actually play, and air rushing in
      const t = T(at), B = C.tele; dur = dur || 3.4;
      const swell = (g, peak) => { g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(peak, t + 0.5); g.gain.setValueAtTime(peak, t + Math.max(0.6, dur - 0.5)); g.gain.exponentialRampToValueAtTime(0.0001, t + dur); };
      for (const [f, g] of [[55, 0.17], [82, 0.1], [110, 0.05]]) {
        const o = ac.createOscillator(), gn = ac.createGain(); o.type = 'triangle';
        o.frequency.setValueAtTime(f * 0.8, t); o.frequency.linearRampToValueAtTime(f, t + 0.6); swell(gn, g);
        o.connect(gn); gn.connect(B.deep); o.start(t); o.stop(t + dur + 0.05);
      }
      const lp = ac.createBiquadFilter(), lg = ac.createGain(), lfo = ac.createOscillator(), ld = ac.createGain();   // two slightly detuned saws beat against each other, the filter breathes
      lp.type = 'lowpass'; lp.frequency.value = 640; lp.Q.value = 1.1; swell(lg, 0.07); lfo.frequency.value = 0.9; ld.gain.value = 220; lfo.connect(ld); ld.connect(lp.frequency);
      for (const f of [110, 111.6, 165]) { const o = ac.createOscillator(); o.type = 'sawtooth'; o.frequency.value = f; o.connect(lp); o.start(t); o.stop(t + dur + 0.05); }
      lp.connect(lg); lg.connect(B.soft); lfo.start(t); lfo.stop(t + dur + 0.05);
      burst(B.soft, t, { f: 450, f2: 1700, q: 0.7, dur, gain: 0.4, atk: 0.7 });   // the pull: a long, slowly rising rush of air
    },
    orbend(at) {                                         // MAX BLUE 4: the orb collapses in a heavy blast
      const t = T(at), B = C.tele;
      tone(B.deep, t, { type: 'triangle', f: 130, f2: 30, dur: 0.8, gain: 0.62, atk: 0.003 });
      burst(B.soft, t, { f: 1400, f2: 180, q: 0.8, dur: 0.6, gain: 1.6, atk: 0.003 });
    },
    setVol(name, v) {                                    // per-sound volume, 0 = silent, 1 = designed level, 2 = twice as loud
      vol[name] = v;
      if (name === 'master') applyMaster();
      else if (name === 'wind') { if (windOnNow) windGain.gain.setTargetAtTime(LEVEL.wind * v * st.windMul, ac.currentTime, 0.1); }
      else if (C[name]) { C[name].cat.dry.gain.setTargetAtTime(v, ac.currentTime, 0.03); C[name].cat.wet.gain.setTargetAtTime(v, ac.currentTime, 0.03); }
    },
    windOn(at) { if (!windBuilt) buildWind(); windOnNow = true; windGain.gain.setTargetAtTime(LEVEL.wind * vol.wind * st.windMul, T(at), 0.7); },
    windOff(at) { windOnNow = false; windGain.gain.setTargetAtTime(0, T(at), 0.15); },
    windPush(k) { if (k !== st.windMul) { st.windMul = k; if (windBuilt && windOnNow) windGain.gain.setTargetAtTime(LEVEL.wind * vol.wind * k, ac.currentTime, 0.4); } },   // a bit more wind when he walks into it
    setOn(on) { st.on = on; applyMaster(); },
  };
}
