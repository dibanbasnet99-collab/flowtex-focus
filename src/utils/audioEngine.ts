/**
 * High-fidelity Web Audio API procedural sound engine.
 * Generates continuous ambient soundscapes (Rain, Forest, Cafe, Ocean, Campfire, Binaural)
 * and soothing gong/chime bells without external audio files.
 */

class AmbientSoundEngine {
  private ctx: AudioContext | null = null;
  private tracks: Map<string, { gain: GainNode; cleanup: () => void }> = new Map();
  private masterGain: GainNode | null = null;
  private isMuted: boolean = false;

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0.8, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setMasterVolume(vol: number) {
    this.initContext();
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(this.isMuted ? 0 : Math.max(0, Math.min(1, vol)), this.ctx.currentTime, 0.05);
    }
  }

  public setMute(muted: boolean) {
    this.isMuted = muted;
    this.initContext();
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(muted ? 0 : 0.8, this.ctx.currentTime, 0.05);
    }
  }

  public setTrackVolume(trackId: string, volume: number) {
    this.initContext();
    const track = this.tracks.get(trackId);
    if (track && this.ctx) {
      track.gain.gain.setTargetAtTime(Math.max(0, Math.min(1, volume)), this.ctx.currentTime, 0.05);
    }
  }

  public playTrack(trackId: string, volume: number = 0.5) {
    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    if (this.tracks.has(trackId)) {
      this.setTrackVolume(trackId, volume);
      return;
    }

    const trackGain = this.ctx.createGain();
    trackGain.gain.setValueAtTime(volume, this.ctx.currentTime);
    trackGain.connect(this.masterGain);

    let cleanup: () => void = () => {};

    switch (trackId) {
      case 'rain':
        cleanup = this.createRain(trackGain);
        break;
      case 'ocean':
        cleanup = this.createOcean(trackGain);
        break;
      case 'forest':
        cleanup = this.createForest(trackGain);
        break;
      case 'cafe':
        cleanup = this.createCafe(trackGain);
        break;
      case 'campfire':
        cleanup = this.createCampfire(trackGain);
        break;
      case 'binaural':
        cleanup = this.createBinaural(trackGain);
        break;
      default:
        break;
    }

    this.tracks.set(trackId, { gain: trackGain, cleanup });
  }

  public stopTrack(trackId: string) {
    const track = this.tracks.get(trackId);
    if (track && this.ctx) {
      track.gain.gain.setTargetAtTime(0, this.ctx.currentTime, 0.1);
      setTimeout(() => {
        track.cleanup();
        track.gain.disconnect();
        this.tracks.delete(trackId);
      }, 150);
    }
  }

  public stopAll() {
    this.tracks.forEach((_, id) => this.stopTrack(id));
  }

  // --- Rain Generator (Filtered pink noise with gentle droplets) ---
  private createRain(dest: GainNode): () => void {
    if (!this.ctx) return () => {};
    const bufferSize = this.ctx.sampleRate * 2;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;

    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      output[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.08;
      b6 = white * 0.115926;
    }

    const whiteNoise = this.ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;
    whiteNoise.loop = true;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1000, this.ctx.currentTime);

    const highpass = this.ctx.createBiquadFilter();
    highpass.type = 'highpass';
    highpass.frequency.setValueAtTime(200, this.ctx.currentTime);

    whiteNoise.connect(filter);
    filter.connect(highpass);
    highpass.connect(dest);
    whiteNoise.start();

    // Occasional gentle drops
    const dropInterval = setInterval(() => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const dropGain = this.ctx.createGain();
      const freq = 1200 + Math.random() * 800;
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(freq * 0.5, this.ctx.currentTime + 0.05);

      dropGain.gain.setValueAtTime(0.04 * Math.random(), this.ctx.currentTime);
      dropGain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.05);

      osc.connect(dropGain);
      dropGain.connect(dest);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.06);
    }, 180);

    return () => {
      try {
        whiteNoise.stop();
        whiteNoise.disconnect();
        clearInterval(dropInterval);
      } catch {
        // cleanup safe
      }
    };
  }

  // --- Ocean Wave Generator (Brown noise + slow LFO swell) ---
  private createOcean(dest: GainNode): () => void {
    if (!this.ctx) return () => {};
    const bufferSize = this.ctx.sampleRate * 2;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    let lastOut = 0.0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      output[i] = (lastOut + (0.02 * white)) / 1.02;
      lastOut = output[i];
      output[i] *= 1.2;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = noiseBuffer;
    noise.loop = true;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(400, this.ctx.currentTime);

    const lfo = this.ctx.createOscillator();
    lfo.type = 'sine';
    lfo.frequency.setValueAtTime(0.12, this.ctx.currentTime); // ~8 sec wave period

    const lfoGain = this.ctx.createGain();
    lfoGain.gain.setValueAtTime(320, this.ctx.currentTime);

    lfo.connect(lfoGain);
    lfoGain.connect(filter.frequency);

    const waveGain = this.ctx.createGain();
    const swellLfo = this.ctx.createOscillator();
    swellLfo.type = 'sine';
    swellLfo.frequency.setValueAtTime(0.12, this.ctx.currentTime);
    const swellGain = this.ctx.createGain();
    swellGain.gain.setValueAtTime(0.4, this.ctx.currentTime);
    swellLfo.connect(swellGain);
    swellGain.connect(waveGain.gain);

    noise.connect(filter);
    filter.connect(waveGain);
    waveGain.connect(dest);

    noise.start();
    lfo.start();
    swellLfo.start();

    return () => {
      try {
        noise.stop();
        lfo.stop();
        swellLfo.stop();
        noise.disconnect();
      } catch {}
    };
  }

  // --- Forest Generator (Subtle breeze + natural bird chirps) ---
  private createForest(dest: GainNode): () => void {
    if (!this.ctx) return () => {};
    const bufferSize = this.ctx.sampleRate * 2;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = (Math.random() * 2 - 1) * 0.04;
    }

    const wind = this.ctx.createBufferSource();
    wind.buffer = noiseBuffer;
    wind.loop = true;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(350, this.ctx.currentTime);
    filter.Q.setValueAtTime(0.6, this.ctx.currentTime);

    wind.connect(filter);
    filter.connect(dest);
    wind.start();

    const birdInterval = setInterval(() => {
      if (!this.ctx || Math.random() > 0.45) return;
      const baseFreq = 2200 + Math.random() * 800;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(baseFreq, this.ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(baseFreq + 400, this.ctx.currentTime + 0.08);
      osc.frequency.linearRampToValueAtTime(baseFreq - 200, this.ctx.currentTime + 0.16);

      gain.gain.setValueAtTime(0.015, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.18);

      osc.connect(gain);
      gain.connect(dest);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.2);
    }, 2400);

    return () => {
      try {
        wind.stop();
        wind.disconnect();
        clearInterval(birdInterval);
      } catch {}
    };
  }

  // --- Cafe Generator (Gentle room murmur and tableware clinks) ---
  private createCafe(dest: GainNode): () => void {
    if (!this.ctx) return () => {};
    const bufferSize = this.ctx.sampleRate * 2;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    let last = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      output[i] = (last + 0.05 * white) / 1.05;
      last = output[i];
      output[i] *= 0.35;
    }

    const chatter = this.ctx.createBufferSource();
    chatter.buffer = noiseBuffer;
    chatter.loop = true;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(450, this.ctx.currentTime);
    filter.Q.setValueAtTime(1.2, this.ctx.currentTime);

    chatter.connect(filter);
    filter.connect(dest);
    chatter.start();

    // Occasional gentle cup clink
    const clinkInterval = setInterval(() => {
      if (!this.ctx || Math.random() > 0.4) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const freq = 1800 + Math.random() * 600;
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

      gain.gain.setValueAtTime(0.02, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.12);

      osc.connect(gain);
      gain.connect(dest);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.15);
    }, 3500);

    return () => {
      try {
        chatter.stop();
        clearInterval(clinkInterval);
      } catch {}
    };
  }

  // --- Campfire Generator (Crackling pops + warm rumble) ---
  private createCampfire(dest: GainNode): () => void {
    if (!this.ctx) return () => {};
    const bufferSize = this.ctx.sampleRate * 2;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = (Math.random() * 2 - 1) * 0.05;
    }

    const rumble = this.ctx.createBufferSource();
    rumble.buffer = noiseBuffer;
    rumble.loop = true;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(220, this.ctx.currentTime);

    rumble.connect(filter);
    filter.connect(dest);
    rumble.start();

    // Crackle pops
    const popInterval = setInterval(() => {
      if (!this.ctx) return;
      const popCount = Math.floor(Math.random() * 3) + 1;
      for (let p = 0; p < popCount; p++) {
        setTimeout(() => {
          if (!this.ctx) return;
          const pop = this.ctx.createOscillator();
          const pGain = this.ctx.createGain();
          pop.type = 'triangle';
          pop.frequency.setValueAtTime(500 + Math.random() * 1500, this.ctx.currentTime);
          pGain.gain.setValueAtTime(0.06 * Math.random(), this.ctx.currentTime);
          pGain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.03);

          pop.connect(pGain);
          pGain.connect(dest);
          pop.start();
          pop.stop(this.ctx.currentTime + 0.04);
        }, p * 30);
      }
    }, 400);

    return () => {
      try {
        rumble.stop();
        clearInterval(popInterval);
      } catch {}
    };
  }

  // --- Binaural Beats (Alpha waves: 200Hz + 210Hz for 10Hz brainwave focus) ---
  private createBinaural(dest: GainNode): () => void {
    if (!this.ctx) return () => {};
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const merger = this.ctx.createChannelMerger(2);

    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(200, this.ctx.currentTime);

    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(210, this.ctx.currentTime); // 10 Hz alpha difference

    const subGain = this.ctx.createGain();
    subGain.gain.setValueAtTime(0.12, this.ctx.currentTime);

    osc1.connect(merger, 0, 0); // left channel
    osc2.connect(merger, 0, 1); // right channel
    merger.connect(subGain);
    subGain.connect(dest);

    osc1.start();
    osc2.start();

    return () => {
      try {
        osc1.stop();
        osc2.stop();
        merger.disconnect();
      } catch {}
    };
  }

  // --- Mechanical Flip Clock Tick ---
  public playMechanicalTick(volume: number = 0.35) {
    this.initContext();
    if (!this.ctx || !this.masterGain || this.isMuted) return;

    try {
      const clickGain = this.ctx.createGain();
      clickGain.gain.setValueAtTime(volume * 0.3, this.ctx.currentTime);
      clickGain.connect(this.masterGain);

      // Transient 1: Mechanical latch click
      const osc = this.ctx.createOscillator();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(1400, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(320, this.ctx.currentTime + 0.012);

      const oscGain = this.ctx.createGain();
      oscGain.gain.setValueAtTime(volume * 0.4, this.ctx.currentTime);
      oscGain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.015);

      osc.connect(oscGain);
      oscGain.connect(clickGain);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.02);

      // Transient 2: Flap drop tactile thud (12ms later)
      setTimeout(() => {
        if (!this.ctx || !this.masterGain) return;
        const flap = this.ctx.createOscillator();
        flap.type = 'sine';
        flap.frequency.setValueAtTime(240, this.ctx.currentTime);
        flap.frequency.exponentialRampToValueAtTime(70, this.ctx.currentTime + 0.02);

        const flapGain = this.ctx.createGain();
        flapGain.gain.setValueAtTime(volume * 0.25, this.ctx.currentTime);
        flapGain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.025);

        flap.connect(flapGain);
        flapGain.connect(this.masterGain);
        flap.start();
        flap.stop(this.ctx.currentTime + 0.03);
      }, 12);
    } catch {
      // Audio context safety
    }
  }

  // --- Timer Zen Gong chime ---
  public playChime(volume: number = 0.7) {
    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    const baseFreq = 528; // Solfeggio Love & Transformation frequency (peaceful tone)
    const harmonics = [1, 1.5, 2.01, 2.76];
    const weights = [1.0, 0.5, 0.25, 0.12];

    const chimeGain = this.ctx.createGain();
    chimeGain.gain.setValueAtTime(Math.max(0.1, volume * 0.4), this.ctx.currentTime);
    chimeGain.connect(this.masterGain);

    harmonics.forEach((h, index) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(baseFreq * h, this.ctx.currentTime);

      const amp = weights[index];
      gain.gain.setValueAtTime(amp, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 3.2);

      osc.connect(gain);
      gain.connect(chimeGain);

      osc.start();
      osc.stop(this.ctx.currentTime + 3.3);
    });
  }
}

export const soundEngine = new AmbientSoundEngine();
