// src/utils/audio.ts
// Hybrid Audio Engine for Duane Luy's Portfolio
// - Real Acoustic / Atmospheric Ambient Soundtrack (Kevin MacLeod - CC-BY 4.0)
// - Instant Procedural Micro-Haptics (Web Audio API)

class SoundEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = true;
  private ambientAudio: HTMLAudioElement | null = null;
  private fadeInterval: ReturnType<typeof setInterval> | null = null;

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
    this.initContext();
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

  /**
   * Real atmospheric ambient soundtrack playback with smooth volume cross-fade
   */
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
          // Smoothly ramp volume from current to 0.32 over 1.2s
          const targetVol = 0.32;
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
          // Browser prevented autoplay before explicit user gesture
        });
    }
  }

  /**
   * Smoothly fade out ambient soundtrack over 0.5s
   */
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
      // Catch interrupted context
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
}

export const sound = new SoundEngine();
