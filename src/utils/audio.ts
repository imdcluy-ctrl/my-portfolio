// src/utils/audio.ts
// Zero-byte procedural Web Audio API sound engine for Duane Luy's Portfolio

class SoundEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = true;
  private ambientGain: GainNode | null = null;
  private oscillators: OscillatorNode[] = [];

  constructor() {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('portfolio_muted');
      this.isMuted = saved !== null ? saved === 'true' : true;
    }
  }

  private initContext(): boolean {
    if (typeof window === 'undefined') return false;
    try {
      if (!this.ctx) {
        const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        if (!AudioCtx) return false;
        this.ctx = new AudioCtx();
      }
      if (this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
      return true;
    } catch {
      return false;
    }
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  public toggleMute(): boolean {
    const initialized = this.initContext();
    this.isMuted = !this.isMuted;
    if (typeof window !== 'undefined') {
      localStorage.setItem('portfolio_muted', String(this.isMuted));
    }

    if (!initialized || !this.ctx) return this.isMuted;

    if (this.isMuted) {
      this.stopAmbientDrone();
    } else {
      this.startAmbientDrone();
    }

    return this.isMuted;
  }

  /**
   * Procedural tactile click micro-haptic (40ms sine drop)
   */
  public playClick(freq = 720) {
    if (this.isMuted || !this.initContext() || !this.ctx) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const now = this.ctx.currentTime;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);
      osc.frequency.exponentialRampToValueAtTime(Math.max(40, freq * 0.35), now + 0.04);

      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.04);
    } catch {
      // AudioContext interrupted or not allowed yet
    }
  }

  /**
   * Ultra-subtle hover blip for interactive lists / search results
   */
  public playHover() {
    if (this.isMuted || !this.initContext() || !this.ctx) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const now = this.ctx.currentTime;

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(950, now);
      osc.frequency.exponentialRampToValueAtTime(1100, now + 0.025);

      gain.gain.setValueAtTime(0.03, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.025);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.025);
    } catch {
      // Silently catch
    }
  }

  /**
   * Procedural Sci-Fi Harmonic Drawer Chime (C5, E5, G5 ascending triad)
   */
  public playDrawerChime() {
    if (this.isMuted || !this.initContext() || !this.ctx) return;

    try {
      const notes = [523.25, 659.25, 783.99]; // C5, E5, G5
      const now = this.ctx.currentTime;

      notes.forEach((freq, idx) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const startDelay = idx * 0.04;

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + startDelay);

        gain.gain.setValueAtTime(0.0001, now + startDelay);
        gain.gain.linearRampToValueAtTime(0.08, now + startDelay + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + startDelay + 0.4);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now + startDelay);
        osc.stop(now + startDelay + 0.4);
      });
    } catch {
      // Silently catch
    }
  }

  /**
   * Synthesized Ambient Drone Chord (Warm atmospheric D-major open pad)
   */
  public startAmbientDrone() {
    if (this.isMuted || !this.initContext() || !this.ctx) return;
    if (this.ambientGain) return; // already active

    try {
      const frequencies = [73.42, 110.0, 146.83, 185.0];
      const now = this.ctx.currentTime;

      const masterGain = this.ctx.createGain();
      masterGain.gain.setValueAtTime(0.0001, now);
      masterGain.gain.exponentialRampToValueAtTime(0.08, now + 1.8);
      masterGain.connect(this.ctx.destination);
      this.ambientGain = masterGain;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(420, now);
      filter.Q.setValueAtTime(2.0, now);
      filter.connect(masterGain);

      this.oscillators = frequencies.map((freq, i) => {
        if (!this.ctx) throw new Error('No context');
        const osc = this.ctx.createOscillator();
        osc.type = i % 2 === 0 ? 'sine' : 'triangle';
        osc.frequency.setValueAtTime(freq, now);

        const detuneAmount = (i - 1.5) * 4.5;
        osc.detune.setValueAtTime(detuneAmount, now);

        osc.connect(filter);
        osc.start(now);
        return osc;
      });
    } catch {
      // Autoplay or context error
    }
  }

  /**
   * Gracefully fade out ambient drone over 0.6s
   */
  public stopAmbientDrone() {
    if (!this.ctx || !this.ambientGain) return;

    try {
      const now = this.ctx.currentTime;
      this.ambientGain.gain.setValueAtTime(Math.max(0.0001, this.ambientGain.gain.value), now);
      this.ambientGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.6);

      setTimeout(() => {
        this.oscillators.forEach(osc => {
          try {
            osc.stop();
            osc.disconnect();
          } catch {
            // Already stopped
          }
        });
        this.oscillators = [];
        if (this.ambientGain) {
          this.ambientGain.disconnect();
          this.ambientGain = null;
        }
      }, 650);
    } catch {
      this.oscillators = [];
      this.ambientGain = null;
    }
  }
}

export const sound = new SoundEngine();
