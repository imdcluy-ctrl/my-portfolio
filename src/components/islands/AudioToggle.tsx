import { useState, useEffect } from 'react';
import { VolumeX } from 'lucide-react';
import { sound } from '../../utils/audio';

export default function AudioToggle() {
  const [isMuted, setIsMuted] = useState(true);

  useEffect(() => {
    setIsMuted(sound.getMuted());
  }, []);

  const handleToggle = () => {
    const nextMuted = sound.toggleMute();
    setIsMuted(nextMuted);
    if (!nextMuted) {
      sound.playClick(880);
    }
  };

  return (
    <button
      type="button"
      onClick={handleToggle}
      aria-label={isMuted ? 'Turn on ambient audio and sound effects' : 'Mute audio'}
      aria-pressed={!isMuted}
      title={isMuted ? 'Enable ambient soundtrack & SFX ("Touching Moments Four - Melody" by Kevin MacLeod · CC-BY 4.0)' : 'Mute audio'}
      className={`group relative inline-flex items-center gap-2 px-2.5 py-1.5 rounded-[--radius-pill] text-xs font-mono transition-all duration-200 cursor-pointer select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent border ${
        !isMuted
          ? 'bg-accent/10 border-accent/40 text-accent shadow-xs'
          : 'bg-surface-2/60 border-line text-ink-muted hover:text-ink hover:bg-surface-2'
      }`}
    >
      <div className="flex items-end gap-0.5 h-3.5 w-3.5 justify-center overflow-hidden" aria-hidden="true">
        {!isMuted ? (
          <div className="flex items-end gap-[2px] h-3">
            <span className="w-[2.5px] bg-accent rounded-full animate-equalize-1" style={{ height: '50%' }} />
            <span className="w-[2.5px] bg-accent rounded-full animate-equalize-2" style={{ height: '90%' }} />
            <span className="w-[2.5px] bg-accent rounded-full animate-equalize-3" style={{ height: '35%' }} />
          </div>
        ) : (
          <VolumeX size={14} className="stroke-current opacity-70 group-hover:opacity-100 transition-opacity" />
        )}
      </div>
      <span className="text-[11px] font-medium tracking-tight hidden sm:inline">
        {!isMuted ? 'AUDIO: ON' : 'AUDIO: MUTED'}
      </span>
    </button>
  );
}
