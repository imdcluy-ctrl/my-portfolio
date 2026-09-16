// src/utils/audio.ts
// Futuristic Sci-Fi Micro-Acoustics & Ambient Soundtrack Suite for Duane Luy's Portfolio
// - Procedural Web Audio API Sci-Fi Synthesis (Tactile Clicks, Air-Lock Chimes, Telemetry Chirps)
// - Licensed Ambient Soundtrack: "Touching Moments Four - Melody" by Kevin MacLeod (incompetech.com) · CC-BY 4.0

class SoundEngine {
  private ctx: AudioContext | null = null;
  private sfxGain: GainNode | null = null;
  private isMuted: boolean = true;
  private sfxEnabled: boolean = true;
  private ambientAudio: HTMLAudioElement | null = null;
  private fadeInterval: ReturnType<typeof setInterval> | null = null;
  private lastHoverTime: number = 0;

  constructor() {
    if (typeof window !== 'undefined') {
      const savedMuted = localStorage.getItem('portfolio_muted');
      this.isMuted = savedMuted !== null ? savedMuted === 'true' : true;

      const savedSfx = localStorage.getItem('portfolio_sfx_enabled');
      this.sfxEnabled = savedSfx !== null ? savedSfx === 'true' : true;
    }
  }

  /**
   * Lazy-initialize high-performance Web Audio Context upon user interaction
   */
  private initContext(): boolean {
    if (typeof window === 'undefined') return false;
    try {
      if (!this.ctx) {
        const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        if (!AudioCtx) return false;
        this.ctx = new AudioCtx();
        
        // Master SFX Bus with gentle limiter ceiling to prevent clipping
        this.sfxGain = this.ctx.createGain();
        this.sfxGain.gain.setValueAtTime(0.24, this.ctx.currentTime);
        this.sfxGain.connect(this.ctx.destination);
      }
      if (this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
      return true;
    } catch {
      return false;
    }
  }

  /* -------------------------------------------------------------------------- */
  /* Audio State Controls                                                      */
  /* -------------------------------------------------------------------------- */

  public getMuted(): boolean {
    return this.isMuted;
  }

  public getSfxEnabled(): boolean {
    return this.sfxEnabled;
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    if (typeof window !== 'undefined') {
      localStorage.setItem('portfolio_muted', String(this.isMuted));
    }

    if (this.isMuted) {
      this.stopAmbientMusic();
    } else {
      this.startAmbientMusic();
    }

    return this.isMuted;
  }

  public toggleSfx(): boolean {
    this.sfxEnabled = !this.sfxEnabled;
    if (typeof window !== 'undefined') {
      localStorage.setItem('portfolio_sfx_enabled', String(this.sfxEnabled));
    }
    if (this.sfxEnabled) {
      this.playCopySuccess();
    }
    return this.sfxEnabled;
  }

  /* -------------------------------------------------------------------------- */
  /* Licensed Ambient Soundtrack (Kevin MacLeod - CC-BY 4.0)                   */
  /* -------------------------------------------------------------------------- */

  public startAmbientMusic() {
    if (this.isMuted || typeof window === 'undefined') return;

    if (!this.ambientAudio) {
      this.ambientAudio = new Audio('/audio/ambient.mp3');
      this.ambientAudio.loop = true;
      this.ambientAudio.volume = 0.0;
    }

    if (this.fadeInterval) {
      clearInterval(this.fadeInterval);
      this.fadeInterval = null;
    }

    const playPromise = this.ambientAudio.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          const targetVol = 0.28;
          const step = 0.02;
          this.fadeInterval = setInterval(() => {
            if (!this.ambientAudio) return;
            if (this.ambientAudio.volume < targetVol - step) {
              this.ambientAudio.volume = Math.min(targetVol, this.ambientAudio.volume + step);
            } else {
              this.ambientAudio.volume = targetVol;
              if (this.fadeInterval) clearInterval(this.fadeInterval);
              this.fadeInterval = null;
            }
          }, 50);
        })
        .catch(() => {
          // Handled gracefully if browser blocks prior to interaction
        });
    }
  }

  public stopAmbientMusic() {
    if (!this.ambientAudio) return;

    if (this.fadeInterval) {
      clearInterval(this.fadeInterval);
      this.fadeInterval = null;
    }

    const step = 0.04;
    this.fadeInterval = setInterval(() => {
      if (!this.ambientAudio) return;
      if (this.ambientAudio.volume > step) {
        this.ambientAudio.volume = Math.max(0, this.ambientAudio.volume - step);
      } else {
        this.ambientAudio.volume = 0;
        this.ambientAudio.pause();
        if (this.fadeInterval) clearInterval(this.fadeInterval);
        this.fadeInterval = null;
      }
    }, 40);
  }

  /* -------------------------------------------------------------------------- */
  /* Procedural Futuristic Sci-Fi Micro-Acoustics Suite                         */
  /* -------------------------------------------------------------------------- */

  /**
   * Cybernetic Micro-Tick (Hover)
   * High-frequency snappy micro-pulse (2200Hz -> 2800Hz, 12ms)
   */
  public playHover() {
    if (!this.sfxEnabled || !this.initContext() || !this.ctx || !this.sfxGain) return;

    // Rate limiter: prevent hover storm
    const nowMs = performance.now();
    if (nowMs - this.lastHoverTime < 32) return;
    this.lastHoverTime = nowMs;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(2200, now);
      osc.frequency.exponentialRampToValueAtTime(2900, now + 0.012);

      gain.gain.setValueAtTime(0.045, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.012);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(now);
      osc.stop(now + 0.012);
    } catch {
      // Catch interrupted contexts
    }
  }

  /**
   * Snappy Futuristic Actuator Click
   * Dual-component tactile click: sharp transient pop + resonant low drop (35ms)
   */
  public playClick(freq = 1350) {
    if (!this.sfxEnabled || !this.initContext() || !this.ctx || !this.sfxGain) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);
      osc.frequency.exponentialRampToValueAtTime(Math.max(80, freq * 0.22), now + 0.038);

      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.038);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(now);
      osc.stop(now + 0.038);
    } catch {
      // Silently catch
    }
  }

  /**
   * Holographic Filter Tab Glide
   * Pitch-stepped resonant sweep across domain categories
   */
  public playFilterSelect(index = 0) {
    if (!this.sfxEnabled || !this.initContext() || !this.ctx || !this.sfxGain) return;

    try {
      const now = this.ctx.currentTime;
      const baseFreq = 540 + Math.min(index, 7) * 95;

      const osc = this.ctx.createOscillator();
      const filter = this.ctx.createBiquadFilter();
      const gain = this.ctx.createGain();

      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(baseFreq * 1.5, now);
      filter.Q.setValueAtTime(3.5, now);

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(baseFreq, now);
      osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.4, now + 0.045);

      gain.gain.setValueAtTime(0.16, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.045);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(now);
      osc.stop(now + 0.045);
    } catch {
      // Silently catch
    }
  }

  /**
   * Quantum Airlock Shimmer Chime
   * Ascending 4-tone crystalline FM cascade for Case Study Drawer & Spotlight Search
   */
  public playDrawerOpen() {
    if (!this.sfxEnabled || !this.initContext() || !this.ctx || !this.sfxGain) return;

    try {
      const notes = [659.25, 830.61, 987.77, 1318.51]; // E5, G#5, B5, E6
      const now = this.ctx.currentTime;

      notes.forEach((freq, i) => {
        if (!this.ctx || !this.sfxGain) return;
        const delay = i * 0.028;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + delay);
        osc.frequency.exponentialRampToValueAtTime(freq * 1.04, now + delay + 0.28);

        gain.gain.setValueAtTime(0.0001, now + delay);
        gain.gain.linearRampToValueAtTime(0.11, now + delay + 0.015);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + delay + 0.32);

        osc.connect(gain);
        gain.connect(this.sfxGain);

        osc.start(now + delay);
        osc.stop(now + delay + 0.32);
      });
    } catch {
      // Silently catch
    }
  }

  /**
   * Data De-Rez Dismiss
   * Descending cybernetic resonance sweep when closing drawers/modals
   */
  public playDrawerClose() {
    if (!this.sfxEnabled || !this.initContext() || !this.ctx || !this.sfxGain) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const filter = this.ctx.createBiquadFilter();
      const gain = this.ctx.createGain();

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(2200, now);
      filter.frequency.exponentialRampToValueAtTime(320, now + 0.13);

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(740, now);
      osc.frequency.exponentialRampToValueAtTime(180, now + 0.13);

      gain.gain.setValueAtTime(0.09, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.13);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(now);
      osc.stop(now + 0.13);
    } catch {
      // Silently catch
    }
  }

  /**
   * Telemetry Double-Chirp (Success Confirmation)
   * High-velocity dual pulse for copying credentials, terminal commands, or links
   */
  public playCopySuccess() {
    if (!this.sfxEnabled || !this.initContext() || !this.ctx || !this.sfxGain) return;

    try {
      const now = this.ctx.currentTime;
      const chirps = [
        { freq: 1180, time: 0, dur: 0.035 },
        { freq: 1760, time: 0.045, dur: 0.045 },
      ];

      chirps.forEach(c => {
        if (!this.ctx || !this.sfxGain) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(c.freq, now + c.time);
        osc.frequency.exponentialRampToValueAtTime(c.freq * 1.15, now + c.time + c.dur);

        gain.gain.setValueAtTime(0.14, now + c.time);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + c.time + c.dur);

        osc.connect(gain);
        gain.connect(this.sfxGain);

        osc.start(now + c.time);
        osc.stop(now + c.time + c.dur);
      });
    } catch {
      // Silently catch
    }
  }

  /**
   * Cinematic Interface Boot Chime
   * Rising sci-fi telemetry chord (A3 -> E4 -> A4 -> C#5 shimmer) on intro completion
   */
  public playBootChime() {
    if (!this.sfxEnabled || !this.initContext() || !this.ctx || !this.sfxGain) return;

    try {
      const now = this.ctx.currentTime;
      const chord = [220.0, 329.63, 440.0, 554.37, 880.0];

      chord.forEach((freq, i) => {
        if (!this.ctx || !this.sfxGain) return;
        const delay = i * 0.045;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + delay);
        osc.frequency.exponentialRampToValueAtTime(freq * 1.02, now + delay + 0.65);

        gain.gain.setValueAtTime(0.0001, now + delay);
        gain.gain.linearRampToValueAtTime(0.12, now + delay + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + delay + 0.7);

        osc.connect(gain);
        gain.connect(this.sfxGain);

        osc.start(now + delay);
        osc.stop(now + delay + 0.7);
      });
    } catch {
      // Silently catch
    }
  }

  /**
   * Spotlight Scanner Sweep (Ctrl+K)
   */
  public playSearchOpen() {
    if (!this.sfxEnabled || !this.initContext() || !this.ctx || !this.sfxGain) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const filter = this.ctx.createBiquadFilter();
      const gain = this.ctx.createGain();

      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(800, now);
      filter.frequency.exponentialRampToValueAtTime(2400, now + 0.06);
      filter.Q.setValueAtTime(4, now);

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(420, now);
      osc.frequency.exponentialRampToValueAtTime(920, now + 0.06);

      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.06);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(now);
      osc.stop(now + 0.06);
    } catch {
      // Silently catch
    }
  }

  // Backwards compatibility aliases
  public playDrawerChime() {
    this.playDrawerOpen();
  }
}

export const sound = new SoundEngine();
