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
  function bus(gain, send, lp) {                         // gain, reverb send amount, optional low-pass cutoff
    const g = ac.createGain(); g.gain.value = gain; let n = g;
    if (lp) { n = ac.createBiquadFilter(); n.type = 'lowpass'; n.frequency.value = lp; n.Q.value = 0.5; g.connect(n); }
    n.connect(dry); const s = ac.createGain(); s.gain.value = send; n.connect(s); s.connect(rev);
    return g;
  }
  const stepBus = bus(2, 0.2), deepBus = bus(0.8, 0.16), softBus = bus(0.5, 0.2, 1400);

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
    s.connect(f); f.connect(g); g.connect(out); s.start(t, R(0, 1.9 - o.dur)); s.stop(t + o.dur + 0.03);
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
      const t = T(at), v = R(0.9, 1) * (back ? 0.8 : 1), f = R(0.94, 1.06) * (alt ? 1.05 : 0.95) * (back ? 0.94 : 1);
      burst(stepBus, t, { dur: 0.085, f: 440 * f, q: 0.9, gain: 1.6 * v, atk: 0.002 });                 // heel body (low mids, no bright click)
      burst(stepBus, t, { dur: 0.022, f: 1150 * f, q: 1.0, gain: 0.3 * v, atk: 0.001 });                // faint contact, much softer and lower than before
      tone(stepBus, t, { type: 'triangle', f: 118 * f, f2: 52 * f, dur: 0.19, gain: 0.22 * v, atk: 0.004 });   // heavy thump
      tone(stepBus, t, { f: 205 * f, f2: 100 * f, dur: 0.07, gain: 0.08 * v, atk: 0.003 });             // knock
      burst(stepBus, t + 0.095, { dur: 0.07, f: 320 * f, q: 0.9, gain: 0.9 * v, atk: 0.005 });          // forefoot rolling down
      tone(stepBus, t + 0.095, { f: 88 * f, f2: 54 * f, dur: 0.11, gain: 0.09 * v, atk: 0.006 });
    },
    jump(at) {                                           // push-off: deep thump + a soft rising and falling whoosh
      const t = T(at);
      tone(deepBus, t, { type: 'triangle', f: 122, f2: 62, dur: 0.24, gain: 0.55, atk: 0.004 });
      tone(deepBus, t, { f: 230, f2: 130, dur: 0.09, gain: 0.12, atk: 0.003 });
      burst(softBus, t, { type: 'lowpass', f: 300, f2: 1100, q: 0.6, dur: 0.22, gain: 0.2, atk: 0.03 });
      burst(softBus, t + 0.12, { type: 'lowpass', f: 1100, f2: 350, q: 0.6, dur: 0.2, gain: 0.12, atk: 0.02 });
    },
    land(p, at) {                                        // p = 1 normal, 1.6 for the heavy landing after the teleport
      const t = T(at); p = p || 1;
      tone(deepBus, t, { type: 'triangle', f: 138 - 8 * p, f2: 62, dur: 0.2 + 0.08 * p, gain: 0.42 + 0.1 * p, atk: 0.003 });
      tone(deepBus, t, { f: 250, f2: 125, dur: 0.1 + 0.02 * p, gain: 0.3 + 0.05 * p, atk: 0.002 });
      burst(softBus, t, { type: 'lowpass', f: 900, f2: 300, q: 0.7, dur: 0.09 + 0.04 * p, gain: 3.2 + 0.8 * p, atk: 0.001 });
      if (p > 1) tone(deepBus, t + 0.02, { f: 72, f2: 40, dur: 0.4, gain: 0.2 * (p - 1), atk: 0.01 });
    },
    charge(at) {                                         // teleport 1: warm energy swells up
      const t = T(at);
      tone(deepBus, t, { type: 'triangle', f: 65, f2: 150, dur: 0.14, gain: 0.22, atk: 0.03, cur: 1 });
      tone(softBus, t, { type: 'sawtooth', f: 130, f2: 300, dur: 0.14, gain: 0.25, atk: 0.04, cur: 1 });
    },
    vanish(at) {                                         // teleport 2: he folds into a point (pitch dive + air rushing in)
      const t = T(at);
      tone(deepBus, t, { f: 240, f2: 52, dur: 0.16, gain: 0.5, atk: 0.002, cur: 0.85 });
      burst(softBus, t, { f: 1400, f2: 300, q: 1.4, dur: 0.12, gain: 0.45, atk: 0.004 });
    },
    arrive(at) {                                         // teleport 3: deep boom where he reappears, with a faint shimmer
      const t = T(at);
      tone(deepBus, t, { type: 'triangle', f: 128, f2: 42, dur: 0.5, gain: 0.42, atk: 0.004 });
      tone(deepBus, t, { f: 256, f2: 84, dur: 0.2, gain: 0.2, atk: 0.003 });
      burst(softBus, t, { type: 'lowpass', f: 1200, f2: 250, q: 0.7, dur: 0.14, gain: 0.55, atk: 0.002 });
      tone(softBus, t + 0.03, { f: 523, dur: 0.55, gain: 0.08, atk: 0.02 }); tone(softBus, t + 0.05, { f: 784, dur: 0.5, gain: 0.05, atk: 0.02 });
    },
    fall(at) {                                           // teleport 4: soft falling whoosh
      const t = T(at);
      burst(softBus, t, { type: 'lowpass', f: 1000, f2: 160, q: 0.8, dur: 0.36, gain: 0.7, atk: 0.08 });
      tone(deepBus, t, { f: 120, f2: 58, dur: 0.34, gain: 0.12, atk: 0.06 });
    },
    windOn(at) { if (!windBuilt) buildWind(); windOnNow = true; windGain.gain.setTargetAtTime(LEVEL.wind, T(at), 0.7); },
    windOff(at) { windOnNow = false; windGain.gain.setTargetAtTime(0, T(at), 0.15); },
    windPush(k) { if (windBuilt) windGain.gain.setTargetAtTime(LEVEL.wind * (windOnNow ? k : 0), ac.currentTime, 0.4); },   // a bit more wind when he walks into it
    setOn(on) { master.gain.setTargetAtTime(on ? LEVEL.master : 0, ac.currentTime, 0.04); },
  };
}
