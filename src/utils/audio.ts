// src/utils/audio.ts
// Clean Ambient Soundtrack Engine for Duane Luy's Portfolio
// Music: "Touching Moments Four - Melody" by Kevin MacLeod (incompetech.com) · CC-BY 4.0

class SoundEngine {
  private isMuted: boolean = true;
  private ambientAudio: HTMLAudioElement | null = null;
  private fadeInterval: ReturnType<typeof setInterval> | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('portfolio_muted');
      this.isMuted = saved !== null ? saved === 'true' : true;
    }
  }

  public getMuted(): boolean {
    return this.isMuted;
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

  /**
   * Real atmospheric ambient soundtrack playback with smooth volume fade
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
          // Smoothly ramp volume to a relaxing background level (0.28) over 1.2s
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
          // Handled gracefully if browser blocks before gesture
        });
    }
  }

  /**
   * Smoothly fade out ambient soundtrack over 0.4s
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

  // Completely silenced / removed synthetic oscillator beeps
  public playClick(_freq?: number) {}
  public playHover() {}
  public playDrawerChime() {}
}

export const sound = new SoundEngine();
