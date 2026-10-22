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
  const vol = { master: 1, steps: 1, wind: 1, jump: 1, tele: 1, atk: 1, ce: 1 }, C = {}, st = { on: true, windMul: 1 };   // 1 = the designed level, 2 = twice as loud
  function bus(gain, send, lp, cat) {                    // gain, reverb send amount, optional low-pass cutoff, volume category
    const g = ac.createGain(); g.gain.value = gain; let n = g;
    if (lp) { n = ac.createBiquadFilter(); n.type = 'lowpass'; n.frequency.value = lp; n.Q.value = 0.5; g.connect(n); }
    n.connect(cat.dry); const s = ac.createGain(); s.gain.value = send; n.connect(s); s.connect(cat.wet);
    return g;
  }
  for (const name of ['steps', 'jump', 'tele', 'atk', 'ce']) {   // footsteps | jump + landing | teleport | attacks | cursed energy
    const cat = { dry: ac.createGain(), wet: ac.createGain() }; cat.dry.connect(dry); cat.wet.connect(rev);
    C[name] = { cat, step: bus(2, 0.2, 0, cat), deep: bus(0.8, 0.16, 0, cat), soft: bus(0.5, 0.2, 1400, cat) };
  }
  const applyMaster = () => master.gain.setTargetAtTime(st.on ? LEVEL.master * vol.master : 0, ac.currentTime, 0.04);
  let slowF = null;                                      // slow motion: the whole mix goes through a low-pass filter; it is only put into the signal path the first time it is needed
  function slowLp(on, t) {
    if (!slowF) { slowF = ac.createBiquadFilter(); slowF.type = 'lowpass'; slowF.Q.value = 0.6; slowF.frequency.value = 22000; lim.disconnect(); lim.connect(slowF); slowF.connect(ac.destination); }
    slowF.frequency.cancelScheduledValues(t); slowF.frequency.setValueAtTime(Math.max(300, slowF.frequency.value), t); slowF.frequency.exponentialRampToValueAtTime(on ? 1100 : 22000, t + 0.15);
  }

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
      const t = T(at), B = C.atk, kick = [3, 15, 17, 18, 19, 21].includes(k);
      burst(B.soft, t, { f: kick ? 380 : 650, f2: kick ? 1100 : 1700, q: 0.8, dur: kick ? 0.22 : 0.16, gain: kick ? 0.9 : 0.8, atk: 0.04 });
      tone(B.deep, t, { type: 'triangle', f: kick ? 90 : 120, f2: kick ? 60 : 85, dur: 0.16, gain: 0.1, atk: 0.05 });
    },
    hit(k, at) {                                         // impact: deep thump + dull slap + a crackle of cursed energy (red = heavier and longer)
      const t = T(at), B = C.atk, red = [3, 15, 17, 18, 19, 21].includes(k);
      tone(B.deep, t, { type: 'triangle', f: red ? 128 : 150, f2: red ? 52 : 62, dur: red ? 0.4 : 0.26, gain: red ? 0.46 : 0.34, atk: 0.003 });
      tone(B.deep, t, { f: 240, f2: 110, dur: 0.09, gain: 0.3, atk: 0.002 });
      burst(B.soft, t, { f: red ? 500 : 900, f2: red ? 160 : 300, q: 0.9, dur: red ? 0.2 : 0.14, gain: red ? 2.8 : 2.2, atk: 0.001 });
      tone(B.soft, t, { type: 'sawtooth', f: red ? 330 : 560, f2: red ? 90 : 160, dur: red ? 0.3 : 0.18, gain: 0.12, atk: 0.004 });
    },
    smack(k, at) {                                       // the body blow when a hit lands on something: deep thump + dull slap
      const t = T(at), B = C.atk, red = [3, 15, 17, 18, 19, 21].includes(k);
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
    noce(at) {                                           // NO CURSED ENERGY: a dull, falling two-note buzz (the move is refused)
      const t = T(at), B = C.atk;
      tone(B.deep, t, { type: 'square', f: 230, f2: 160, dur: 0.09, gain: 0.14, atk: 0.003 });
      tone(B.deep, t + 0.11, { type: 'square', f: 175, f2: 105, dur: 0.12, gain: 0.14, atk: 0.003 });
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
    ceon(at) {                                           // CURSED ENERGY on: a low swell and a rising hum with air rushing in, then it ignites with a crack and a few dry ticks (kept in the mid range so phone speakers play it, and well below the harsh treble)
      const t = T(at), B = C.ce;
      tone(B.deep, t, { type: 'triangle', f: 55, f2: 165, dur: 0.5, gain: 0.26, atk: 0.12, cur: 1 });
      tone(B.deep, t, { type: 'triangle', f: 180, f2: 520, dur: 0.45, gain: 0.15, atk: 0.1, cur: 1 });
      burst(B.deep, t, { f: 600, f2: 2800, q: 1.2, dur: 0.42, gain: 0.4, atk: 0.1 });
      tone(B.deep, t + 0.36, { type: 'triangle', f: 130, f2: 58, dur: 0.3, gain: 0.3, atk: 0.003 });
      burst(B.deep, t + 0.36, { f: 1700, q: 0.9, dur: 0.1, gain: 0.5, atk: 0.001 });
      for (let k = 0; k < 4; k++) burst(B.deep, t + 0.4 + k * 0.06 + R(0, 0.03), { f: R(1500, 3600), q: 2.2, dur: R(0.015, 0.03), gain: R(0.22, 0.38), atk: 0.001 });
    },
    ceoff(at) {                                          // CURSED ENERGY off: the energy drains away (a falling hum and a short falling hiss)
      const t = T(at), B = C.ce;
      tone(B.deep, t, { type: 'triangle', f: 420, f2: 110, dur: 0.3, gain: 0.1, atk: 0.005 });
      tone(B.deep, t, { type: 'triangle', f: 120, f2: 45, dur: 0.3, gain: 0.2, atk: 0.005 });
      burst(B.deep, t, { f: 2200, f2: 400, q: 1.0, dur: 0.28, gain: 0.28, atk: 0.004 });
    },
    cecrackle(at) {                                      // while it burns: two to four dry electric ticks, now and then with a thin buzz under them (quiet)
      const t = T(at), B = C.ce; let u = 0;
      for (let k = 0, n = 2 + ((Math.random() * 3) | 0); k < n; k++) { u += R(0.025, 0.09); burst(B.deep, t + u, { f: R(1500, 3500), q: 2.4, dur: R(0.012, 0.028), gain: R(0.13, 0.27), atk: 0.001 }); }
      if (Math.random() < 0.5) tone(B.deep, t, { type: 'triangle', f: R(150, 240), f2: R(80, 120), dur: 0.07, gain: 0.045, atk: 0.003 });
    },
    redcharge(at) {                                      // RED: a low hum that climbs for a second while the orb gathers, with a quickening pulse
      const t = T(at), B = C.ce;
      tone(B.deep, t, { type: 'triangle', f: 70, f2: 210, dur: 1.0, gain: 0.3, atk: 0.5, cur: 1 });
      tone(B.deep, t, { type: 'sawtooth', f: 140, f2: 420, dur: 1.0, gain: 0.07, atk: 0.6, cur: 1 });
      burst(B.deep, t, { f: 500, f2: 2600, q: 1.1, dur: 1.0, gain: 0.3, atk: 0.6 });
      for (let k = 0; k < 6; k++) tone(B.deep, t + 0.2 + k * (0.16 - k * 0.015), { type: 'triangle', f: 110, f2: 70, dur: 0.1, gain: 0.12 + 0.03 * k, atk: 0.004 });
    },
    redfire(at) {                                        // RED released: a sharp whoosh and a bright ping
      const t = T(at), B = C.ce;
      burst(B.deep, t, { f: 500, f2: 3500, q: 0.9, dur: 0.25, gain: 0.5, atk: 0.01 });
      tone(B.deep, t, { type: 'triangle', f: 300, f2: 90, dur: 0.3, gain: 0.25, atk: 0.003 });
      tone(B.deep, t, { f: 1200, f2: 800, dur: 0.15, gain: 0.08, atk: 0.002 });
    },
    domainstart(at) {                                    // DOMAIN: the hand rises. A deep swell and two heartbeats
      const t = T(at), B = C.ce;
      tone(B.deep, t, { f: 38, f2: 62, dur: 0.95, gain: 0.3, atk: 0.35, cur: 1 });
      burst(B.soft, t, { type: 'highpass', f: 400, f2: 3200, q: 0.7, dur: 0.95, gain: 0.25, atk: 0.5 });
      for (const k of [0.15, 0.5]) tone(B.deep, t + k, { f: 78, f2: 38, dur: 0.2, gain: 0.45, atk: 0.004 });
    },
    domainface(at) {                                     // the cut-in: two slow heartbeats, a breathy whisper and a glassy shimmer that grows
      const t = T(at), B = C.ce;
      for (const k of [0, 0.5]) { tone(B.deep, t + k, { f: 70, f2: 34, dur: 0.24, gain: 0.55, atk: 0.004 }); tone(B.deep, t + k + 0.13, { f: 60, f2: 32, dur: 0.2, gain: 0.35, atk: 0.004 }); }
      burst(B.soft, t + 0.2, { f: 1500, f2: 2600, q: 0.5, dur: 2.6, gain: 0.5, atk: 1.2 });
      [880, 1320, 1760].forEach((f, i) => tone(B.soft, t + 0.3 + i * 0.25, { f, f2: f * 1.01, dur: 2.2, gain: 0.04, atk: 1.1, cur: 1 }));
    },
    domainzoom(at) {                                     // the push-in on the eyes: a riser that climbs for 1.7 s
      const t = T(at), B = C.ce;
      tone(B.deep, t, { type: 'sawtooth', f: 70, f2: 1500, dur: 1.7, gain: 0.06, atk: 1.2, cur: 1 });
      tone(B.deep, t, { f: 40, f2: 90, dur: 1.7, gain: 0.28, atk: 1.2, cur: 1 });
      burst(B.soft, t, { type: 'highpass', f: 500, f2: 6500, q: 0.7, dur: 1.7, gain: 0.4, atk: 1.3 });
      for (let k = 0; k < 6; k++) tone(B.deep, t + 0.25 + k * 0.25, { f: 90, f2: 40, dur: 0.15, gain: 0.35, atk: 0.004 });
    },
    domainburst(at) {                                    // the domain opens: a colossal boom, a bright shimmer and a long tail of sparkles
      const t = T(at), B = C.ce;
      tone(B.deep, t, { type: 'triangle', f: 80, f2: 20, dur: 1.8, gain: 0.7, atk: 0.003 });
      tone(B.deep, t, { f: 180, f2: 45, dur: 0.6, gain: 0.35, atk: 0.002 });
      burst(B.deep, t, { f: 3000, f2: 120, q: 0.6, dur: 1.4, gain: 0.9, atk: 0.002 });
      burst(B.soft, t + 0.05, { type: 'highpass', f: 2500, f2: 900, q: 0.6, dur: 1.8, gain: 0.5, atk: 0.04 });
      for (let k = 0; k < 20; k++) tone(B.soft, t + 0.08 + k * 0.07, { f: R(1800, 5200), f2: R(1500, 4000), dur: R(0.15, 0.4), gain: R(0.02, 0.06), atk: 0.003 });
    },
    voidon() {                                           // the Infinite Void: a low drifting drone that fades in (voidoff() fades it out)
      if (st.voidN) return; const t = ac.currentTime, g = ac.createGain(), nodes = []; g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(0.14, t + 1.5); g.connect(C.ce.deep);
      [[55, 'sine', 0], [82.4, 'sine', 3], [110.3, 'triangle', -4], [164.8, 'sine', 5]].forEach(([f, ty, d], i) => { const o = ac.createOscillator(), og = ac.createGain(), lfo = ac.createOscillator(), lg = ac.createGain(); o.type = ty; o.frequency.value = f; o.detune.value = d; og.gain.value = 0.5 / (1 + i * 0.6); lfo.frequency.value = 0.07 + i * 0.05; lg.gain.value = 0.25; lfo.connect(lg); lg.connect(og.gain); o.connect(og); og.connect(g); o.start(t); lfo.start(t); nodes.push(o, lfo); });
      const ns = ac.createBufferSource(), nf = ac.createBiquadFilter(), ng = ac.createGain(); ns.buffer = nbuf; ns.loop = true; nf.type = 'bandpass'; nf.frequency.value = 900; nf.Q.value = 0.6; ng.gain.value = 0.12; ns.connect(nf); nf.connect(ng); ng.connect(g); ns.start(t); nodes.push(ns);
      st.voidN = { g, nodes };
    },
    voidoff() { const v = st.voidN; if (!v) return; st.voidN = null; const t = ac.currentTime; v.g.gain.cancelScheduledValues(t); v.g.gain.setValueAtTime(Math.max(0.0001, v.g.gain.value), t); v.g.gain.linearRampToValueAtTime(0.0001, t + 0.7); v.nodes.forEach(n => { try { n.stop(t + 0.8); } catch (e) { } }); },
    voidping(at) { const t = T(at), B = C.ce, f = R(1500, 4200); tone(B.soft, t, { f, f2: f * 0.98, dur: R(0.3, 0.6), gain: 0.05, atk: 0.003 }); },
    mhum() {                                             // v1.54 THE MASTER's room: a low cold drone (a few low notes that beat slowly, a thin hiss) that fades in over 2.5 s (mhumoff() fades it out)
      if (st.mhumN) return; const t = ac.currentTime, g = ac.createGain(), nodes = []; g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(0.11, t + 2.5); g.connect(C.ce.deep);
      [[41.2, 'sine', 0], [61.8, 'sine', 6], [82.4, 'triangle', -5], [123.5, 'sine', 4]].forEach(([f, ty, d], i) => { const o = ac.createOscillator(), og = ac.createGain(), lfo = ac.createOscillator(), lg = ac.createGain(); o.type = ty; o.frequency.value = f; o.detune.value = d; og.gain.value = 0.5 / (1 + i * 0.6); lfo.frequency.value = 0.07 + i * 0.05; lg.gain.value = 0.25; lfo.connect(lg); lg.connect(og.gain); o.connect(og); og.connect(g); o.start(t); lfo.start(t); nodes.push(o, lfo); });
      const ns = ac.createBufferSource(), nf = ac.createBiquadFilter(), ng = ac.createGain(); ns.buffer = nbuf; ns.loop = true; nf.type = 'bandpass'; nf.frequency.value = 5200; nf.Q.value = 3; ng.gain.value = 0.02; ns.connect(nf); nf.connect(ng); ng.connect(g); ns.start(t); nodes.push(ns);
      st.mhumN = { g, nodes };
    },
    mhumoff() { const v = st.mhumN; if (!v) return; st.mhumN = null; const t = ac.currentTime; v.g.gain.cancelScheduledValues(t); v.g.gain.setValueAtTime(Math.max(0.0001, v.g.gain.value), t); v.g.gain.linearRampToValueAtTime(0.0001, t + 1.6); v.nodes.forEach(n => { try { n.stop(t + 1.7); } catch (e) { } }); },
    mflash(at) {                                         // the Cat dies on the Master's screen: a bright shimmer that swells, a deep thump
      const t = T(at), B = C.ce; burst(B.soft, t, { type: 'highpass', f: 1500, f2: 6000, q: 0.7, dur: 0.7, gain: 0.3, atk: 0.12 }); tone(B.soft, t, { f: 880, f2: 2600, dur: 0.6, gain: 0.05, atk: 0.1 }); tone(B.deep, t + 0.05, { f: 70, f2: 30, dur: 0.9, gain: 0.4, atk: 0.004 });
    },
    mstatic(at) {                                        // the screen dies: a burst of static, a falling electronic whine, a last low thud
      const t = T(at), B = C.atk; burst(B.soft, t, { type: 'highpass', f: 1800, f2: 5000, q: 0.7, dur: 0.9, gain: 0.4, atk: 0.004 }); tone(B.soft, t, { type: 'sawtooth', f: 2600, f2: 90, dur: 0.8, gain: 0.06, atk: 0.002 }); tone(B.deep, t + 0.6, { f: 60, f2: 40, dur: 0.5, gain: 0.25, atk: 0.003 });
    },
    mdoor(k, at) {                                       // a heavy door: a rusty hinge (a rising wobbling whine under a band of noise) and a stone rumble; k = how big (1 = the whole opening, 0.45 = a far creak)
      k = k || 1; const t = T(at), B = C.atk, d = 1.2 + 1.6 * k;
      tone(B.soft, t, { type: 'sawtooth', f: 180, f2: 420, dur: d, gain: 0.05 * k, atk: 0.3, cur: 1 }); tone(B.soft, t + 0.1, { type: 'square', f: 260, f2: 610, dur: d * 0.8, gain: 0.02 * k, atk: 0.4, cur: 1 });
      burst(B.soft, t, { type: 'bandpass', f: 700, f2: 1500, q: 4, dur: d, gain: 0.12 * k, atk: 0.3 }); burst(B.deep, t, { type: 'lowpass', f: 160, f2: 80, q: 0.7, dur: d, gain: 0.3 * k, atk: 0.2 });
    },
    mfoot(at) {                                          // one soft, slow footstep on stone
      const t = T(at); burst(C.steps.step, t, { type: 'lowpass', f: 240, f2: 90, q: 0.8, dur: 0.14, gain: 0.16, atk: 0.003 }); tone(C.steps.step, t, { f: 95, f2: 45, dur: 0.12, gain: 0.12, atk: 0.002 });
    },
    mthud(at) {                                          // the door shuts: a deep boom, a rush of low noise, the latch
      const t = T(at), B = C.atk; tone(B.deep, t, { f: 78, f2: 26, dur: 1.1, gain: 0.7, atk: 0.003 }); burst(B.deep, t, { type: 'lowpass', f: 420, f2: 90, q: 0.7, dur: 0.6, gain: 0.5, atk: 0.002 }); burst(B.soft, t + 0.05, { type: 'bandpass', f: 2200, q: 3, dur: 0.1, gain: 0.25, atk: 0.001 }); burst(B.soft, t + 0.22, { type: 'bandpass', f: 1500, q: 4, dur: 0.07, gain: 0.15, atk: 0.001 });
    },
    mvoice(at) {                                         // one letter of Verity's low voice (a short growl with a hollow band over it)
      const t = T(at), B = C.atk; tone(B.soft, t, { type: 'sawtooth', f: R(95, 120), f2: R(78, 98), dur: 0.09, gain: 0.07, atk: 0.005 }); burst(B.soft, t, { type: 'bandpass', f: R(480, 720), q: 3, dur: 0.08, gain: 0.07, atk: 0.004 });
    },
    msting(at) {                                         // the last chord of the chapter: low notes that swell over three seconds, a thin shimmer on top
      const t = T(at), B = C.ce; [55, 82.4, 110].forEach((f, i) => tone(B.deep, t + i * 0.05, { type: 'triangle', f, f2: f * 1.006, dur: 3.2, gain: 0.09, atk: 1.3 })); burst(B.soft, t + 0.3, { type: 'highpass', f: 4000, f2: 7000, q: 0.7, dur: 2.2, gain: 0.05, atk: 1.2 });
    },
    tvoice(k) {                                          // v1.55 one letter of a speaker in the training (0 = Gojo: a smooth, lower blip; 1 = Yuji: a brighter, quicker one)
      const t = T(), B = C.atk; tone(B.soft, t, { type: 'triangle', f: k ? R(300, 360) : R(205, 250), f2: k ? R(280, 330) : R(190, 225), dur: 0.08, gain: 0.06, atk: 0.004 }); burst(B.soft, t, { type: 'bandpass', f: k ? R(1500, 2100) : R(900, 1300), q: 3, dur: 0.05, gain: 0.03, atk: 0.003 });
    },
    tink(k) {                                            // v1.55 INFINITY stops a blow: a glassy ring, a hiss and a soft low thump (k = 1: the big blow, a longer ring and a deeper thump)
      const t = T(), B = C.ce, big = k === 1; tone(B.soft, t, { f: 1760, f2: 1660, dur: big ? 0.95 : 0.55, gain: big ? 0.09 : 0.07, atk: 0.002 }); tone(B.soft, t, { f: 2637, f2: 2500, dur: 0.4, gain: 0.04, atk: 0.002 }); burst(B.soft, t, { type: 'highpass', f: 3000, f2: 7000, q: 0.7, dur: 0.18, gain: 0.12, atk: 0.001 }); tone(B.deep, t, { f: 120, f2: 70, dur: 0.25, gain: big ? 0.25 : 0.14, atk: 0.002 });
    },
    tinkoff() {                                          // v1.55 Gojo switches Infinity off: three falling glass notes and a shimmer
      const t = T(), B = C.ce; [2093, 1568, 1175].forEach((f, i) => tone(B.soft, t + i * 0.08, { f, f2: f * 0.97, dur: 0.6, gain: 0.06, atk: 0.003 })); burst(B.soft, t, { type: 'highpass', f: 4000, f2: 8000, q: 0.7, dur: 0.5, gain: 0.07, atk: 0.01 });
    },
    tbirds() {                                           // v1.55 the morning birds: two to four quick rising chirps
      const t0 = T(), n = 2 + ((Math.random() * 3) | 0), f0 = R(2300, 3600); for (let i = 0; i < n; i++) tone(C.ce.soft, t0 + i * R(0.08, 0.16), { f: f0 * R(0.9, 1.1), f2: f0 * R(1.25, 1.5), dur: 0.07, gain: 0.025, atk: 0.005 });
    },
    tmusic(k) {                                          // v1.55 the happy morning: a bright tune (C pentatonic) with a soft pad and a bass over C - Am - F - G; 8 bars per call (the scene calls it again when they are over, the next block starts where the last ended); k = 1: the slower ending
      const BEAT = k ? 0.56 : 0.46, t0 = Math.max(ac.currentTime + 0.05, st.tmusNext || 0), CH = [[261.6, 329.6, 392], [220, 261.6, 329.6], [174.6, 220, 261.6], [196, 246.9, 293.7]], ROOT = [130.8, 110, 87.3, 98.0];
      const MEL = k ? [[523, 0, 659, 0], [587, 0, 523, 0], [440, 523, 0, 0], [494, 587, 523, 0]] : [[659, 587, 523, 587], [659, 784, 659, 587], [523, 440, 523, 587], [659, 587, 784, 0], [784, 880, 784, 659], [587, 659, 784, 659], [523, 587, 659, 523], [587, 494, 523, 0]];
      if (!st.tmus) { st.tmus = ac.createGain(); st.tmus.gain.value = 0.9; st.tmus.connect(C.ce.soft); }
      const out = st.tmus, note = (f, t, d, ty, gain, dest) => { const o = ac.createOscillator(), g = ac.createGain(); o.type = ty; o.frequency.value = f; g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(gain, t + 0.012); g.gain.exponentialRampToValueAtTime(0.0001, t + d); o.connect(g); g.connect(dest); o.start(t); o.stop(t + d + 0.05); };
      for (let b = 0; b < 8; b++) {
        const t = t0 + b * 4 * BEAT, ch = CH[b % 4]; ch.forEach(f => note(f, t, 4 * BEAT, 'sine', 0.02, out)); note(ROOT[b % 4], t, 1.7 * BEAT, 'sine', 0.1, C.ce.deep); note(ROOT[b % 4], t + 2 * BEAT, 1.7 * BEAT, 'sine', 0.08, C.ce.deep);
        if (!k) for (let i = 0; i < 8; i++) note(ch[[0, 1, 2, 1, 0, 1, 2, 1][i]] * 2, t + i * BEAT / 2, 0.3, 'triangle', 0.03, out);
        MEL[b % MEL.length].forEach((f, i) => { if (f) note(f, t + i * BEAT, k ? 0.9 : 0.5, 'triangle', k ? 0.04 : 0.05, out); });
      }
      st.tmusNext = t0 + 8 * 4 * BEAT;
    },
    tmusicoff() {                                        // v1.55 fade the morning tune out (the notes already scheduled stay silent)
      const g = st.tmus; st.tmusNext = 0; if (!g) return; st.tmus = null; const t = ac.currentTime; g.gain.cancelScheduledValues(t); g.gain.setValueAtTime(Math.max(0.0001, g.gain.value), t); g.gain.linearRampToValueAtTime(0.0001, t + 0.7);
    },
    homeon() {                                           // v1.50 Yuji's Hometown: a warm drifting pad (A major, a slow shimmer) with a breath of wind in the grass (homeoff() fades it out)
      if (st.homeN) return; const t = ac.currentTime, g = ac.createGain(), nodes = []; g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(0.13, t + 1.2); g.connect(C.ce.deep);
      [[110, 'sine', 0], [164.8, 'triangle', 4], [220, 'sine', -3], [277.2, 'triangle', 5], [329.6, 'sine', -2]].forEach(([f, ty, d], i) => { const o = ac.createOscillator(), og = ac.createGain(), lfo = ac.createOscillator(), lg = ac.createGain(); o.type = ty; o.frequency.value = f; o.detune.value = d; og.gain.value = 0.45 / (1 + i * 0.5); lfo.frequency.value = 0.09 + i * 0.04; lg.gain.value = 0.2; lfo.connect(lg); lg.connect(og.gain); o.connect(og); og.connect(g); o.start(t); lfo.start(t); nodes.push(o, lfo); });
      const ns = ac.createBufferSource(), nf = ac.createBiquadFilter(), ng = ac.createGain(); ns.buffer = nbuf; ns.loop = true; nf.type = 'bandpass'; nf.frequency.value = 1400; nf.Q.value = 0.5; ng.gain.value = 0.07; ns.connect(nf); nf.connect(ng); ng.connect(g); ns.start(t); nodes.push(ns);
      st.homeN = { g, nodes };
    },
    homeoff() { const v = st.homeN; if (!v) return; st.homeN = null; const t = ac.currentTime; v.g.gain.cancelScheduledValues(t); v.g.gain.setValueAtTime(Math.max(0.0001, v.g.gain.value), t); v.g.gain.linearRampToValueAtTime(0.0001, t + 0.7); v.nodes.forEach(n => { try { n.stop(t + 0.8); } catch (e) { } }); },
    hdslice(k, at) {                                     // a white scissor mark slices the enemy: a bright metallic "shing" (a filtered noise sweep, a thin ringing tone, a dry crack); k = 1 for the huge X: a deep thump and a longer ring on top
      const t = T(at), B = C.atk; k = k || 0;
      burst(B.soft, t, { type: 'highpass', f: 2200, f2: 7500, q: 0.8, dur: 0.12 + 0.1 * k, gain: 0.55, atk: 0.002 });
      burst(B.soft, t + 0.03, { type: 'bandpass', f: 5200, f2: 3000, q: 4, dur: 0.18 + 0.2 * k, gain: 0.25, atk: 0.002 });
      tone(B.soft, t, { f: R(3300, 3800), f2: 2600, dur: 0.22 + 0.4 * k, gain: 0.07, atk: 0.002 }); tone(B.soft, t + 0.01, { f: 5100, f2: 4300, dur: 0.15 + 0.3 * k, gain: 0.04, atk: 0.002 });
      burst(B.deep, t, { f: 900, f2: 200, q: 0.7, dur: 0.07, gain: 0.5, atk: 0.001 });
      if (k) { tone(B.deep, t, { type: 'triangle', f: 90, f2: 30, dur: 0.6, gain: 0.5, atk: 0.003 }); burst(B.soft, t + 0.17, { type: 'highpass', f: 2200, f2: 7500, q: 0.8, dur: 0.22, gain: 0.6, atk: 0.002 }); }
    },
    hdhorse(at) {                                        // a horse whinnies in the field: a wobbling saw tone that rises and falls, a few quick overtones and some breath
      const t = T(at), B = C.ce, f = R(520, 640);
      tone(B.soft, t, { type: 'sawtooth', f, f2: f * 2.1, dur: 0.38, gain: 0.1, atk: 0.04, cur: 1 });
      tone(B.soft, t + 0.36, { type: 'sawtooth', f: f * 2.1, f2: f * 0.8, dur: 0.55, gain: 0.1, atk: 0.01, cur: 1 });
      for (let k = 0; k < 5; k++) tone(B.soft, t + 0.3 + k * 0.1, { type: 'sawtooth', f: f * 1.7 + (k % 2 ? 90 : -90), f2: f * 1.5, dur: 0.1, gain: 0.04, atk: 0.005 });
      burst(B.soft, t, { type: 'bandpass', f: 1800, f2: 1200, q: 1.5, dur: 0.9, gain: 0.16, atk: 0.1 });
    },
    hdgoose(at) {                                        // a goose honks: two short nasal notes, the second higher
      const t = T(at), B = C.ce, f = R(380, 470);
      for (const [k, m] of [[0, 1], [0.22, 1.25]]) { tone(B.soft, t + k, { type: 'sawtooth', f: f * m, f2: f * m * 0.9, dur: 0.16, gain: 0.1, atk: 0.01 }); tone(B.soft, t + k, { type: 'square', f: f * m * 1.5, f2: f * m * 1.35, dur: 0.14, gain: 0.03, atk: 0.01 }); burst(B.soft, t + k, { type: 'bandpass', f: 900, q: 2, dur: 0.15, gain: 0.08, atk: 0.01 }); }
    },
    domainend(at) {                                      // the domain collapses: a reverse rush, a thump and a shatter
      const t = T(at), B = C.ce;
      burst(B.soft, t, { type: 'highpass', f: 7000, f2: 300, q: 0.7, dur: 0.8, gain: 0.7, atk: 0.5 });
      tone(B.deep, t + 0.7, { type: 'triangle', f: 90, f2: 28, dur: 0.7, gain: 0.5, atk: 0.003 });
      for (let k = 0; k < 10; k++) burst(B.soft, t + 0.7 + k * 0.03, { f: R(2500, 7000), q: 2.4, dur: R(0.02, 0.05), gain: R(0.2, 0.5), atk: 0.001 });
    },
    purple(at) {                                         // red meets blue: a violet hum that rises and shakes during the 1.4 s fuse, with a crackle
      const t = T(at), B = C.ce;
      for (let k = 0; k < 4; k++) { tone(B.deep, t + 0.35 * k, { type: 'sawtooth', f: 80 + 55 * k, f2: 100 + 70 * k, dur: 0.5, gain: 0.045 + 0.027 * k, atk: 0.04 }); tone(B.deep, t + 0.35 * k, { type: 'triangle', f: 160 + 110 * k, f2: 190 + 130 * k, dur: 0.5, gain: 0.063 + 0.036 * k, atk: 0.04 }); }
      burst(B.soft, t, { type: 'highpass', f: 900, f2: 4200, q: 0.8, dur: 1.4, gain: 0.25, atk: 0.25 });
      for (let k = 0; k < 14; k++) burst(B.deep, t + 0.1 + k * 0.095, { f: R(2000, 5200), q: 2.4, dur: R(0.015, 0.04), gain: R(0.1, 0.3), atk: 0.001 });
    },
    door(at) {                                           // the BIG door slides open: a long low wooden scrape, a deep rumble under it, creaks, and a soft thud when the leaves stop
      const t = T(at), B = C.jump;
      burst(B.soft, t, { type: 'bandpass', f: 170, f2: 330, q: 0.9, dur: 2.7, gain: 1.1, atk: 0.3 });
      burst(B.soft, t + 0.1, { type: 'lowpass', f: 720, f2: 230, q: 0.6, dur: 2.5, gain: 0.5, atk: 0.4 });
      tone(B.deep, t, { type: 'triangle', f: 58, f2: 46, dur: 2.8, gain: 0.35, atk: 0.3 });
      for (let k = 0; k < 7; k++) burst(B.soft, t + 0.3 + k * 0.33 + R(0, 0.1), { f: R(900, 2200), q: 3, dur: R(0.02, 0.05), gain: R(0.1, 0.22), atk: 0.001 });
      tone(B.deep, t + 2.7, { type: 'triangle', f: 98, f2: 40, dur: 0.35, gain: 0.45, atk: 0.003 }); burst(B.soft, t + 2.7, { type: 'lowpass', f: 700, f2: 200, q: 0.7, dur: 0.12, gain: 1.4, atk: 0.001 });
    },
    boing(at) {                                          // the Cat's rubber arm or leg stretching: a quick springy wobble that sweeps up, then down
      const t = T(at), B = C.atk;
      tone(B.soft, t, { type: 'sine', f: 180, f2: 620, dur: 0.16, gain: 0.3, atk: 0.004 });
      tone(B.soft, t + 0.15, { type: 'sine', f: 620, f2: 140, dur: 0.28, gain: 0.26, atk: 0.004 });
      tone(B.soft, t + 0.05, { type: 'triangle', f: 360, f2: 1240, dur: 0.12, gain: 0.1, atk: 0.003 });
    },
    laugh(at) {                                          // the Cat's laugh: "heh heh heh heh", four hoarse pulses
      const t = T(at), B = C.atk;
      for (let k = 0; k < 4; k++) { const q = t + k * 0.19; tone(B.soft, q, { type: 'sawtooth', f: 150 - k * 6, f2: 105, dur: 0.12, gain: 0.2, atk: 0.01 }); burst(B.soft, q, { f: 1500, f2: 800, q: 2.0, dur: 0.1, gain: 0.5, atk: 0.005 }); }
    },
    chomp(at) {                                          // the HUGE Cat's jaws slam shut on the ground: a huge low boom, a crunch of stone and bone, then rubble raining down
      const t = T(at), B = C.ce;
      tone(B.deep, t, { type: 'triangle', f: 120, f2: 28, dur: 0.9, gain: 0.7, atk: 0.003 });
      burst(B.deep, t, { type: 'lowpass', f: 900, f2: 120, q: 0.8, dur: 1.4, gain: 1.0, atk: 0.004 });
      for (let k = 0; k < 14; k++) burst(B.deep, t + 0.02 + k * 0.035 + R(0, 0.03), { f: R(300, 2600), q: 2, dur: R(0.03, 0.08), gain: R(0.25, 0.5), atk: 0.001 });
      for (let k = 0; k < 22; k++) burst(B.deep, t + 0.45 + k * 0.09 + R(0, 0.05), { f: R(500, 3000), q: 1.4, dur: R(0.03, 0.08), gain: R(0.1, 0.3), atk: 0.001 });
    },
    slice(at) {                                          // a blade of Blue: a thin zing that drops, a crackle and a low thud
      const t = T(at), B = C.ce;
      tone(B.soft, t, { type: 'sawtooth', f: 3400, f2: 700, dur: 0.18, gain: 0.16, atk: 0.002 });
      burst(B.soft, t, { f: 6200, f2: 2400, q: 3, dur: 0.12, gain: 0.55, atk: 0.001 });
      tone(B.deep, t + 0.02, { type: 'triangle', f: 220, f2: 90, dur: 0.18, gain: 0.3, atk: 0.003 });
    },
    twang(at) {                                          // the rubber neck stretches and quivers: a rising stretch, then a wobble that dies away
      const t = T(at), B = C.atk;
      tone(B.soft, t, { type: 'sine', f: 180, f2: 900, dur: 0.35, gain: 0.3, atk: 0.01 });
      for (let k = 0; k < 8; k++) tone(B.soft, t + 0.35 + k * 0.09, { type: 'sine', f: 520 - k * 22, f2: 470 - k * 22, dur: 0.1, gain: 0.2 * (1 - k / 9), atk: 0.004 });
    },
    whip(at) {                                           // the head snaps back: a rising whoosh that ends in a crack
      const t = T(at), B = C.atk;
      burst(B.soft, t, { f: 300, f2: 3800, q: 1.2, dur: 0.4, gain: 0.8, atk: 0.2 });
      tone(B.soft, t + 0.34, { type: 'square', f: 900, f2: 120, dur: 0.1, gain: 0.25, atk: 0.001 });
    },
    shatter(at) {                                        // the Cat comes apart into thousands of pieces: a low boom, a bright rushing hiss and a long trickle of tiny clicks
      const t = T(at), B = C.ce;
      tone(B.deep, t, { type: 'triangle', f: 160, f2: 30, dur: 0.8, gain: 0.6, atk: 0.003 });
      burst(B.soft, t, { f: 5200, f2: 900, q: 0.7, dur: 1.0, gain: 0.8, atk: 0.003 });
      for (let k = 0; k < 60; k++) burst(B.soft, t + 0.05 + k * 0.03 + R(0, 0.02), { f: R(2500, 7000), q: 3, dur: R(0.01, 0.03), gain: R(0.15, 0.4) * (1 - k / 70), atk: 0.001 });
    },
    cloth(at) {                                          // the blindfold is pulled down or put back on: a soft rustle of cloth and a tiny snap
      const t = T(at), B = C.atk;
      burst(B.soft, t, { f: 1800, f2: 600, q: 0.8, dur: 0.28, gain: 0.5, atk: 0.04 });
      burst(B.soft, t + 0.22, { f: 3000, f2: 1500, q: 2, dur: 0.03, gain: 0.3, atk: 0.001 });
    },
    sixeyes(at) {                                        // his eyes light up: a clear rising shimmer
      const t = T(at), B = C.ce;
      tone(B.soft, t, { type: 'sine', f: 520, f2: 1560, dur: 0.5, gain: 0.22, atk: 0.05 });
      tone(B.soft, t + 0.05, { type: 'triangle', f: 1040, f2: 2080, dur: 0.45, gain: 0.1, atk: 0.05 });
      for (let k = 0; k < 8; k++) tone(B.soft, t + 0.1 + k * 0.05, { type: 'sine', f: R(2200, 4200), f2: R(1800, 3000), dur: 0.08, gain: 0.07, atk: 0.003 });
    },
    divgather(at) {                                      // DIVERGENT FIST 1: cursed energy gathers in the fist: a rising, shimmering hum with a fine crackle on top
      const t = T(at), B = C.ce;
      tone(B.soft, t, { type: 'sine', f: 220, f2: 880, dur: 0.3, cur: 1, gain: 0.2, atk: 0.04 });
      tone(B.soft, t + 0.04, { type: 'triangle', f: 440, f2: 1760, dur: 0.26, cur: 1, gain: 0.08, atk: 0.05 });
      burst(B.soft, t, { type: 'highpass', f: 1500, f2: 4500, q: 0.8, dur: 0.28, gain: 0.5, atk: 0.1 });
    },
    divboom(at) {                                        // DIVERGENT FIST 2: the delayed impact in the stomach: a deep boom, a thud of air, two ringing echoes and a crystal shimmer
      const t = T(at), B = C.atk;
      tone(B.deep, t, { type: 'triangle', f: 110, f2: 34, dur: 0.7, gain: 0.6, atk: 0.003 });
      burst(B.soft, t, { f: 500, f2: 90, q: 0.7, dur: 0.3, gain: 3.4, atk: 0.001 });
      tone(B.soft, t + 0.02, { type: 'sine', f: 1320, f2: 660, dur: 0.6, cur: 1, gain: 0.16, atk: 0.005 });
      tone(B.soft, t + 0.09, { type: 'sine', f: 1980, f2: 990, dur: 0.5, cur: 1, gain: 0.1, atk: 0.005 });
      burst(B.soft, t + 0.03, { type: 'highpass', f: 2000, f2: 6000, q: 0.7, dur: 0.4, gain: 0.7, atk: 0.02 });
    },
    concgather(at) {                                     // CONCENTRATED FIST 1: he coils and the cursed energy packs into his fist: a low hum that tightens and climbs for half a second, a thin shimmer over it and a few dry crackles at the end
      const t = T(at), B = C.ce;
      tone(B.deep, t, { type: 'triangle', f: 70, f2: 260, dur: 0.5, cur: 1, gain: 0.3, atk: 0.2 });
      tone(B.soft, t + 0.05, { type: 'sine', f: 180, f2: 720, dur: 0.4, cur: 1, gain: 0.14, atk: 0.1 });
      burst(B.deep, t, { type: 'highpass', f: 1200, f2: 3800, q: 1.0, dur: 0.45, gain: 0.4, atk: 0.15 });
      for (let k = 0; k < 5; k++) burst(B.deep, t + 0.2 + k * 0.05 + R(0, 0.02), { f: R(1800, 3600), q: 2.2, dur: R(0.012, 0.025), gain: R(0.2, 0.35), atk: 0.001 });
    },
    concboom(at) {                                       // CONCENTRATED FIST lands: a huge, deep boom with a hard crack on top, a rush of air and a ringing echo (heavier than the second impact of DIVERGENT FIST)
      const t = T(at), B = C.atk;
      tone(B.deep, t, { type: 'triangle', f: 96, f2: 28, dur: 0.9, gain: 0.7, atk: 0.003 });
      tone(B.deep, t, { f: 220, f2: 70, dur: 0.12, gain: 0.4, atk: 0.002 });
      burst(B.soft, t, { f: 420, f2: 70, q: 0.7, dur: 0.38, gain: 3.8, atk: 0.001 });
      burst(B.soft, t + 0.02, { type: 'highpass', f: 1800, f2: 5200, q: 0.8, dur: 0.3, gain: 0.8, atk: 0.01 });
      tone(B.soft, t + 0.06, { type: 'sine', f: 1100, f2: 520, dur: 0.6, cur: 1, gain: 0.14, atk: 0.005 });
    },
    quake(at) {                                          // the roof is hit: a huge low boom, a long shaking rumble and stones and splinters falling
      const t = T(at), B = C.ce;
      tone(B.deep, t, { type: 'triangle', f: 80, f2: 22, dur: 1.6, gain: 0.6, atk: 0.004 });
      burst(B.deep, t, { type: 'lowpass', f: 600, f2: 90, q: 0.7, dur: 3.4, gain: 0.9, atk: 0.02 });
      tone(B.deep, t + 0.3, { f: 46, f2: 30, dur: 3.2, gain: 0.3, atk: 0.4 });
      for (let k = 0; k < 28; k++) burst(B.deep, t + 0.15 + k * 0.11 + R(0, 0.06), { f: R(500, 3200), q: 1.6, dur: R(0.03, 0.09), gain: R(0.12, 0.35), atk: 0.001 });
    },
    purpleboom(at) {                                     // the purple orb explodes: a huge low boom, a long rumble and a cracking burst
      const t = T(at), B = C.ce;
      tone(B.deep, t, { type: 'triangle', f: 95, f2: 24, dur: 1.2, gain: 0.5, atk: 0.003 });
      tone(B.deep, t, { f: 210, f2: 50, dur: 0.4, gain: 0.25, atk: 0.002 });
      burst(B.deep, t, { f: 2400, f2: 150, q: 0.7, dur: 0.9, gain: 0.8, atk: 0.002 });
      for (let k = 0; k < 9; k++) burst(B.deep, t + 0.04 + k * 0.05, { f: R(1400, 4200), q: 2.2, dur: R(0.02, 0.05), gain: R(0.18, 0.36), atk: 0.001 });
    },
    scream(v, kind) {                                    // a person screams. v = voice (0 businessman, 1 office woman, 2 old man, 3 jogger, 4 tourist); kind 0 = long scream when somebody dies, 1 = short yell while running, 2 = the victim's last cut-off yell
      const V = [[140, 480, 5.5, 0.02, 760, 1250], [250, 900, 6, 0.02, 900, 1750], [125, 370, 7.5, 0.07, 650, 1100], [165, 620, 5.5, 0.02, 800, 1350], [285, 1050, 6.5, 0.025, 950, 1850]][v % 5], t = T(), B = C.atk.deep;
      const dur = kind === 0 ? R(0.95, 1.2) : kind === 1 ? R(0.4, 0.6) : 0.17, pk = V[1] * (kind === 1 ? 0.8 : kind === 2 ? 0.85 : 1) * R(0.94, 1.06), end = t + dur;
      if (!st.curve) { st.curve = new Float32Array(1025); for (let i = 0; i < 1025; i++) st.curve[i] = Math.tanh((i / 512 - 1) * 1.8); }
      const out = ac.createGain(), ws = ac.createWaveShaper(), am = ac.createGain(), mix = ac.createGain(), lfo = ac.createOscillator(), lg = ac.createGain(), rough = ac.createOscillator(), rg = ac.createGain();
      const P = (kind === 2 ? 0.5 : 0.42) * [1, 0.7, 0.9, 1, 0.7][v % 5]; out.gain.setValueAtTime(0.0001, t); out.gain.linearRampToValueAtTime(P, t + 0.02); out.gain.setValueAtTime(P * 0.9, t + dur * 0.65); out.gain.exponentialRampToValueAtTime(0.0001, end);      // a scream holds its level, then drops at the end
      ws.curve = st.curve; am.gain.value = 0.72; rough.type = 'sawtooth'; rough.frequency.value = R(62, 80); rg.gain.value = 0.28; rough.connect(rg); rg.connect(am.gain);      // the rasp of a scream: the voice is chopped ~70 times a second
      lfo.frequency.value = V[2]; lg.gain.value = pk * V[3]; lfo.connect(lg);                                                                                                                       // vibrato (the old man's voice shakes more)
      for (const dt of [1, 1.015]) { const o = ac.createOscillator(); o.type = 'sawtooth'; o.frequency.setValueAtTime(V[0] * 1.15, t); o.frequency.exponentialRampToValueAtTime(pk * dt, t + 0.09); o.frequency.exponentialRampToValueAtTime(pk * dt * 0.82, end); lg.connect(o.frequency); o.connect(ws); o.start(t); o.stop(end + 0.05); }
      ws.connect(am); [[V[4], 5, 1], [V[5], 6, 0.7]].forEach(([fr, q, g], i) => { const bp = ac.createBiquadFilter(), gg = ac.createGain(); bp.type = 'bandpass'; bp.Q.value = q; bp.frequency.setValueAtTime(fr, t); if (i) bp.frequency.exponentialRampToValueAtTime(fr * 1.15, t + 0.12); gg.gain.value = g; am.connect(bp); bp.connect(gg); gg.connect(mix); });   // two vowel formants: the "aah"
      const lp = ac.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 2600; lp.Q.value = 0.5; mix.connect(lp); lp.connect(out); out.connect(B); lfo.start(t); lfo.stop(end + 0.05); rough.start(t); rough.stop(end + 0.05);
      burst(B, t, { type: 'highpass', f: 2600, q: 0.7, dur: Math.min(dur, 0.5), gain: 0.18, atk: 0.01 });                                                                                          // a little breath
    },
    splat(at) {                                          // a body bursts: a wet thud, a low squelch, then drops pattering down
      const t = T(at), B = C.atk;
      tone(B.deep, t, { type: 'triangle', f: 92, f2: 34, dur: 0.34, gain: 0.46, atk: 0.003 });
      burst(B.soft, t, { f: 420, f2: 130, q: 0.7, dur: 0.22, gain: 3.0, atk: 0.001 });
      burst(B.soft, t + 0.04, { f: 280, f2: 80, q: 3.4, dur: 0.2, gain: 1.5, atk: 0.004 });
      for (let k = 0; k < 7; k++) burst(B.soft, t + 0.1 + k * 0.045 + R(0, 0.02), { f: R(500, 1400), q: 2.6, dur: R(0.02, 0.05), gain: R(0.6, 1.3), atk: 0.001 });
    },
    redboom(at) {                                        // RED explodes: a deep boom and a burst of crackle
      const t = T(at), B = C.ce;
      tone(B.deep, t, { type: 'triangle', f: 120, f2: 32, dur: 0.7, gain: 0.5, atk: 0.003 });
      tone(B.deep, t, { f: 240, f2: 70, dur: 0.25, gain: 0.25, atk: 0.002 });
      burst(B.deep, t, { f: 1800, f2: 200, q: 0.8, dur: 0.5, gain: 0.7, atk: 0.002 });
      for (let k = 0; k < 6; k++) burst(B.deep, t + 0.05 + k * 0.05, { f: R(1500, 3600), q: 2.2, dur: R(0.015, 0.03), gain: R(0.2, 0.4), atk: 0.001 });
    },
    fatalstart(at) {                                     // FATALITY begins: two heavy heartbeats and a rising rush of air
      const t = T(at), B = C.ce;
      tone(B.deep, t, { type: 'triangle', f: 78, f2: 40, dur: 0.55, gain: 0.5, atk: 0.004 });
      tone(B.deep, t + 0.42, { type: 'triangle', f: 86, f2: 38, dur: 0.6, gain: 0.55, atk: 0.004 });
      burst(B.soft, t, { type: 'highpass', f: 600, f2: 4200, q: 0.7, dur: 0.9, gain: 0.3, atk: 0.35 });
    },
    scare(at) {                                          // the JUMPSCARE: a crushing boom and a rush of noise, then a long shaking shriek (rasping saws gliding up and down) that tears off at the end
      const t = T(at), B = C.ce;
      tone(B.deep, t, { type: 'triangle', f: 96, f2: 28, dur: 0.8, gain: 0.8, atk: 0.003 });
      burst(B.soft, t, { f: 1400, f2: 260, q: 0.6, dur: 0.55, gain: 3.2, atk: 0.001 });
      for (let i = 0; i < 13; i++) { const f0 = 700 + i * 45 + (i % 2 ? 260 : -120); tone(B.soft, t + 0.12 + i * 0.13, { type: 'sawtooth', f: f0, f2: f0 * (i % 2 ? 0.8 : 1.25), dur: 0.2, gain: 0.15, atk: 0.012 }); tone(B.soft, t + 0.12 + i * 0.13, { type: 'square', f: f0 * 1.51, f2: f0 * 1.9, dur: 0.18, gain: 0.05, atk: 0.01 }); }
      burst(B.soft, t + 0.1, { type: 'bandpass', f: 2200, f2: 3600, q: 1.4, dur: 1.8, gain: 1.1, atk: 0.06 });
      burst(B.soft, t + 1.6, { type: 'highpass', f: 800, f2: 5000, q: 0.7, dur: 0.5, gain: 0.8, atk: 0.01 });
    },
    slowin(at) {                                         // slow motion starts: the sound sinks (a pitch dive) and the highs are cut
      const t = T(at), B = C.ce;
      tone(B.soft, t, { type: 'sawtooth', f: 900, f2: 70, dur: 0.35, cur: 1, gain: 0.22, atk: 0.01 });
      burst(B.soft, t, { type: 'lowpass', f: 3000, f2: 200, q: 0.7, dur: 0.3, gain: 1.1, atk: 0.005 });
      slowLp(true, t);
    },
    slowout(at) {                                        // slow motion ends: a quick pitch climb and the highs come back
      const t = T(at), B = C.ce;
      tone(B.soft, t, { type: 'sawtooth', f: 90, f2: 900, dur: 0.25, cur: 1, gain: 0.18, atk: 0.01 });
      burst(B.soft, t, { type: 'highpass', f: 400, f2: 3000, q: 0.7, dur: 0.25, gain: 0.6, atk: 0.1 });
      slowLp(false, t);
    },
    fatalscream(at) {                                    // FATALITY: the enemy's long, cracking scream as the purple orb goes off: a low voice that climbs, with a heavy rasp and a vowel that opens from "oo" to "aah"
      const t = T(at), B = C.atk.deep, dur = 1.9, end = t + dur;
      if (!st.curve) { st.curve = new Float32Array(1025); for (let i = 0; i < 1025; i++) st.curve[i] = Math.tanh((i / 512 - 1) * 1.8); }
      const out = ac.createGain(), ws = ac.createWaveShaper(), am = ac.createGain(), mix = ac.createGain(), lfo = ac.createOscillator(), lg = ac.createGain(), rough = ac.createOscillator(), rg = ac.createGain();
      out.gain.setValueAtTime(0.0001, t); out.gain.linearRampToValueAtTime(0.5, t + 0.06); out.gain.setValueAtTime(0.46, t + dur * 0.72); out.gain.exponentialRampToValueAtTime(0.0001, end);
      ws.curve = st.curve; am.gain.value = 0.72; rough.type = 'sawtooth'; rough.frequency.value = 71; rg.gain.value = 0.3; rough.connect(rg); rg.connect(am.gain);      // the rasp: the voice is chopped ~70 times a second
      lfo.frequency.value = 6.5; lg.gain.value = 24; lfo.connect(lg);
      for (const d of [1, 1.012]) { const o = ac.createOscillator(); o.type = 'sawtooth'; o.frequency.setValueAtTime(115, t); o.frequency.exponentialRampToValueAtTime(420 * d, t + 0.3); o.frequency.exponentialRampToValueAtTime(590 * d, t + 1.15); o.frequency.exponentialRampToValueAtTime(400 * d, end); lg.connect(o.frequency); o.connect(ws); o.start(t); o.stop(end + 0.05); }
      ws.connect(am); [[360, 800, 5, 1], [820, 1350, 6, 0.7]].forEach(([f0, f1, q, g]) => { const bp = ac.createBiquadFilter(), gg = ac.createGain(); bp.type = 'bandpass'; bp.Q.value = q; bp.frequency.setValueAtTime(f0, t); bp.frequency.exponentialRampToValueAtTime(f1, t + 0.7); gg.gain.value = g; am.connect(bp); bp.connect(gg); gg.connect(mix); });
      const lp = ac.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 2800; lp.Q.value = 0.5; mix.connect(lp); lp.connect(out); out.connect(B); lfo.start(t); lfo.stop(end + 0.05); rough.start(t); rough.stop(end + 0.05);
      burst(B, t, { type: 'highpass', f: 2600, q: 0.7, dur: 0.6, gain: 0.2, atk: 0.02 });
    },
    fatalbang(at) {                                      // the screen turns white: a colossal boom, a crack, a long rumble and a ringing in the ears
      const t = T(at), B = C.ce;
      tone(B.deep, t, { type: 'triangle', f: 62, f2: 18, dur: 2.2, gain: 0.7, atk: 0.003 });
      tone(B.deep, t, { f: 180, f2: 40, dur: 0.6, gain: 0.35, atk: 0.002 });
      burst(B.deep, t, { f: 3200, f2: 120, q: 0.6, dur: 1.2, gain: 1.0, atk: 0.001 });
      burst(B.deep, t, { type: 'lowpass', f: 400, f2: 40, q: 0.7, dur: 1.6, gain: 0.9, atk: 0.004 });
      for (let k = 0; k < 12; k++) burst(B.deep, t + 0.03 + k * 0.045, { f: R(1200, 5200), q: 2.2, dur: R(0.02, 0.06), gain: R(0.2, 0.4), atk: 0.001 });
      tone(B.soft, t + 0.08, { f: 3150, f2: 3100, dur: 2.6, gain: 0.05, atk: 0.2 });
    },
    fataltitle(at) {                                     // the word FATALITY hits the screen: a deep gong
      const t = T(at), B = C.ce;
      [[55, 0.5], [110, 0.3], [164, 0.22], [233, 0.16], [331, 0.1]].forEach(([f, g], i) => tone(B.deep, t, { f, f2: f * 0.985, dur: 2.2 - i * 0.25, gain: g, atk: 0.004 }));
      burst(B.soft, t, { f: 1800, f2: 400, q: 1.2, dur: 0.3, gain: 0.4, atk: 0.001 });
    },
    yfbf(n, at) {                                        // YUJI'S FATALITY: blow n (1 to 8) of the BLACK FLASHES: a hard crack, a deep thump that gets deeper, a zap of lightning and a bell that climbs a step with every blow (the eighth has its own, yfbig)
      const t = T(at), B = C.atk; n = Math.max(1, Math.min(8, n || 1)); const pit = Math.pow(1.0595, n * 2);
      burst(B.soft, t, { type: 'highpass', f: 1800, f2: 5600, q: 0.8, dur: 0.14, gain: 0.9 + 0.05 * n, atk: 0.001 });
      tone(B.deep, t, { type: 'triangle', f: 132 - 4 * n, f2: 30, dur: 0.5 + 0.04 * n, gain: 0.5 + 0.045 * n, atk: 0.003 });
      tone(B.deep, t, { f: 240, f2: 70, dur: 0.1, gain: 0.34, atk: 0.002 });
      tone(B.soft, t, { type: 'sawtooth', f: 2600 + 140 * n, f2: 260, dur: 0.17, cur: 1, gain: 0.12, atk: 0.002 });
      burst(B.soft, t + 0.01, { f: 900, f2: 90, q: 0.7, dur: 0.26, gain: 2.2 + 0.2 * n, atk: 0.001 });
      tone(B.soft, t + 0.03, { f: 520 * pit, f2: 500 * pit, dur: 0.8, cur: 1, gain: 0.07, atk: 0.004 });
      tone(B.soft, t + 0.03, { f: 1040 * pit, f2: 1000 * pit, dur: 0.6, cur: 1, gain: 0.03, atk: 0.004 });
      if (n >= 4) burst(B.deep, t, { type: 'lowpass', f: 700, f2: 60, q: 0.7, dur: 0.4 + 0.1 * n, gain: 0.6, atk: 0.004 });
    },
    yfbig(at) {                                          // YUJI'S FATALITY, the ELITE FINISHER: a colossal boom that falls through the floor, a crack that tears the air, a long rumble, a ringing and debris coming down
      const t = T(at), B = C.ce;
      tone(B.deep, t, { type: 'triangle', f: 90, f2: 14, dur: 3.2, gain: 0.85, atk: 0.003 });
      tone(B.deep, t, { f: 240, f2: 34, dur: 0.7, gain: 0.5, atk: 0.002 });
      tone(B.deep, t + 0.02, { type: 'sine', f: 52, f2: 20, dur: 2.6, gain: 0.6, atk: 0.01 });
      burst(B.deep, t, { f: 4200, f2: 90, q: 0.6, dur: 1.5, gain: 1.4, atk: 0.001 });
      burst(B.deep, t, { type: 'lowpass', f: 500, f2: 36, q: 0.7, dur: 2.8, gain: 1.1, atk: 0.004 });
      burst(B.soft, t, { type: 'highpass', f: 2400, f2: 7000, q: 0.8, dur: 0.5, gain: 1.0, atk: 0.001 });
      for (let k = 0; k < 18; k++) burst(B.deep, t + 0.03 + k * 0.05, { f: R(1200, 6200), q: 2.2, dur: R(0.02, 0.07), gain: R(0.25, 0.5), atk: 0.001 });
      for (let k = 0; k < 16; k++) burst(B.deep, t + 0.5 + k * R(0.07, 0.16), { f: R(300, 2400), q: 1.8, dur: R(0.03, 0.09), gain: R(0.1, 0.3), atk: 0.001 });
      tone(B.soft, t + 0.1, { f: 3150, f2: 3080, dur: 3.4, gain: 0.05, atk: 0.2 });
      tone(B.soft, t + 0.1, { f: 1580, f2: 1560, dur: 3.0, gain: 0.04, atk: 0.2 });
    },
    yfrise(dur, at) {                                    // the charge of the last blow: a long rush of air and a saw that climbs for dur seconds, with a quickening pulse underneath
      const t = T(at), B = C.ce; dur = dur || 3;
      burst(B.soft, t, { type: 'bandpass', f: 300, f2: 5200, q: 1.1, dur, gain: 0.7, atk: dur * 0.5 });
      tone(B.soft, t, { type: 'sawtooth', f: 90, f2: 880, dur, cur: 1, gain: 0.07, atk: dur * 0.4 });
      tone(B.deep, t, { type: 'sine', f: 45, f2: 90, dur, cur: 1, gain: 0.3, atk: dur * 0.3 });
      for (let k = 0, x = 0, gap = 0.5; x < dur - 0.3; k++) { tone(B.deep, t + x, { type: 'triangle', f: 80, f2: 38, dur: 0.22, gain: 0.2 + 0.25 * x / dur, atk: 0.004 }); gap = Math.max(0.12, gap * 0.84); x += gap; }
    },
    yfscore(stop, at) {                                        // YUJI'S FATALITY: the music under the 30 seconds, made on the spot: a deep drone that climbs, a pad that opens up, and a heartbeat that gets faster and faster until it stops just before the last blow
      stop = stop || 22.6; const t = T(at), B = C.ce, bed = ac.createGain(); bed.gain.setValueAtTime(0.0001, t); bed.gain.linearRampToValueAtTime(1, t + 1.2); bed.connect(B.deep);
      if (st.bed) { try { st.bed.gain.setTargetAtTime(0, t, 0.05); } catch (e) { /* gone already */ } } st.bed = bed;
      const osc = (type, f0, f1, g, dur) => { const o = ac.createOscillator(), a = ac.createGain(); o.type = type; o.frequency.setValueAtTime(f0, t); o.frequency.exponentialRampToValueAtTime(f1, t + dur); a.gain.value = g; o.connect(a); a.connect(bed); o.start(t); o.stop(t + dur + 0.1); return a; };
      const d1 = osc('sine', 41, 62, 0.26, 28), lfo = ac.createOscillator(), lg = ac.createGain(); lfo.frequency.value = 0.19; lg.gain.value = 0.1; lfo.connect(lg); lg.connect(d1.gain); lfo.start(t); lfo.stop(t + 28.1);
      osc('triangle', 82, 124, 0.07, 28);
      const pad = ac.createBiquadFilter(); pad.type = 'lowpass'; pad.Q.value = 0.8; pad.frequency.setValueAtTime(260, t); pad.frequency.exponentialRampToValueAtTime(2400, t + stop); pad.connect(bed);
      for (const d of [1, 1.0075, 0.9925]) { const o = ac.createOscillator(), a = ac.createGain(); o.type = 'sawtooth'; o.frequency.setValueAtTime(110 * d, t); o.frequency.exponentialRampToValueAtTime(164 * d, t + stop); a.gain.setValueAtTime(0.0001, t); a.gain.linearRampToValueAtTime(0.035, t + stop * 0.6); a.gain.linearRampToValueAtTime(0.06, t + stop); a.gain.linearRampToValueAtTime(0.0001, t + stop + 0.6); o.connect(a); a.connect(pad); o.start(t); o.stop(t + stop + 0.8); }
      for (let k = 0, x = 0.5, gap = 1.1; x < stop; k++) { tone(bed, t + x, { type: 'triangle', f: 74, f2: 38, dur: 0.3, gain: 0.3, atk: 0.004 }); tone(bed, t + x + 0.2, { type: 'triangle', f: 66, f2: 36, dur: 0.26, gain: 0.18, atk: 0.004 }); gap = Math.max(0.5, gap * 0.955); x += gap; }
    },
    yfstop(at) {                                         // the score stops (the cutscene was skipped or is over)
      const t = T(at); if (st.bed) { st.bed.gain.cancelScheduledValues(t); st.bed.gain.setTargetAtTime(0, t, 0.08); st.bed = null; }
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
