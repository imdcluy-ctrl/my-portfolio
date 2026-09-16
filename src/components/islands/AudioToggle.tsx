import { useState, useEffect } from 'react';
import { VolumeX } from 'lucide-react';
import { sound } from '../../utils/audio';

export default function AudioToggle() {
  const [isMuted, setIsMuted] = useState(true);
  const [sfxEnabled, setSfxEnabled] = useState(true);

  useEffect(() => {
    setIsMuted(sound.getMuted());
    setSfxEnabled(sound.getSfxEnabled());
  }, []);

  const handleToggleMusic = (e: React.MouseEvent) => {
    e.stopPropagation();
    const nextMuted = sound.toggleMute();
    setIsMuted(nextMuted);
    sound.playClick(nextMuted ? 880 : 1440);
  };

  const handleToggleSfx = (e: React.MouseEvent) => {
    e.stopPropagation();
    const nextSfx = sound.toggleSfx();
    setSfxEnabled(nextSfx);
  };

  return (
    <div className="inline-flex items-center gap-1.5 p-0.5 rounded-[--radius-pill] bg-surface-2/70 border border-line shadow-xs font-mono text-[11px]">
      {/* SFX Status Indicator / Toggle */}
      <button
        type="button"
        onClick={handleToggleSfx}
        title={sfxEnabled ? 'Futuristic SFX: Active (Click to mute SFX)' : 'Futuristic SFX: Muted (Click to enable SFX)'}
        aria-label={sfxEnabled ? 'Mute Sci-Fi Sound Effects' : 'Enable Sci-Fi Sound Effects'}
        aria-pressed={sfxEnabled}
        className={`inline-flex items-center gap-1 px-2 py-1 rounded-[--radius-pill] transition-all cursor-pointer select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
          sfxEnabled
            ? 'bg-emerald-500/10 text-emerald-500 dark:text-emerald-400 font-medium'
            : 'text-ink-muted hover:text-ink hover:bg-surface-2'
        }`}
      >
        <span className={`w-1.5 h-1.5 rounded-full ${sfxEnabled ? 'bg-emerald-500 animate-pulse' : 'bg-line'}`} />
        <span className="hidden sm:inline">SFX</span>
      </button>

      <span className="w-[1px] h-3 bg-line/80" aria-hidden="true" />

      {/* Ambient Music Toggle */}
      <button
        type="button"
        onClick={handleToggleMusic}
        title={
          isMuted
            ? 'Play Ambient Soundtrack ("Touching Moments Four - Melody" · CC-BY 4.0)'
            : 'Mute Soundtrack'
        }
        aria-label={isMuted ? 'Play Ambient Soundtrack' : 'Mute Ambient Soundtrack'}
        aria-pressed={!isMuted}
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[--radius-pill] transition-all cursor-pointer select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
          !isMuted
            ? 'bg-accent/15 text-accent font-medium shadow-xs'
            : 'text-ink-muted hover:text-ink hover:bg-surface-2'
        }`}
      >
        <div className="flex items-end gap-0.5 h-3.5 w-3.5 justify-center overflow-hidden" aria-hidden="true">
          {!isMuted ? (
            <div className="flex items-end gap-[2px] h-3">
              <span className="w-[2px] bg-accent rounded-full animate-equalize-1" style={{ height: '50%' }} />
              <span className="w-[2px] bg-accent rounded-full animate-equalize-2" style={{ height: '90%' }} />
              <span className="w-[2px] bg-accent rounded-full animate-equalize-3" style={{ height: '35%' }} />
            </div>
          ) : (
            <VolumeX size={13} className="stroke-current opacity-70" />
          )}
        </div>
        <span className="hidden md:inline text-[10px] tracking-tight">
          {!isMuted ? 'MUSIC: ON' : 'MUSIC: OFF'}
        </span>
      </button>
    </div>
  );
}
