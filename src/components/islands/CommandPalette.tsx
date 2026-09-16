import { useState, useEffect, useRef } from 'react';
import { Search, X, ArrowRight } from 'lucide-react';
import type { ProjectData } from './CaseStudyDrawer';

interface CommandPaletteProps {
  projects: ProjectData[];
}

export default function CommandPalette({ projects }: CommandPaletteProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Toggle shortcut (Cmd+K or Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsOpen(prev => !prev);
      }
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // Focus input on open
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Filter projects based on query
  const filtered = projects.filter(p => {
    if (!query) return true;
    const q = query.toLowerCase();
    const titleMatch = p.title.toLowerCase().includes(q);
    const domainMatch = (p.domainLabel || p.domain).toLowerCase().includes(q);
    const taglineMatch = p.tagline.toLowerCase().includes(q);
    const stackMatch = Object.values(p.stack)
      .flat()
      .some(s => s && s.toLowerCase().includes(q));
    return titleMatch || domainMatch || taglineMatch || stackMatch;
  });

  const selectProject = (id: string) => {
    setIsOpen(false);
    // Trigger case study drawer click
    const trigger = document.querySelector(`.case-study-trigger[data-project="${id}"]`) as HTMLElement;
    if (trigger) {
      trigger.click();
    } else {
      // Fallback
      window.location.hash = `#catalog`;
    }
  };

  const handleInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev < filtered.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev > 0 ? prev - 1 : filtered.length - 1));
    } else if (e.key === 'Enter' && filtered[selectedIndex]) {
      e.preventDefault();
      selectProject(filtered[selectedIndex].id);
    }
  };

  return (
    <>
      {/* Search Trigger Button in Header */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-mono bg-[var(--color-surface-2)] text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] border border-[var(--color-line)] hover:border-[var(--color-accent)]/50 transition-colors cursor-pointer"
        aria-label="Search systems (Ctrl+K)"
        title="Search systems (Ctrl+K)"
      >
        <Search size={13} />
        <span className="hidden sm:inline">Search 37 systems...</span>
        <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] rounded bg-[var(--color-surface)] border border-[var(--color-line)] font-mono text-[var(--color-ink-muted)]">
          <span className="text-[9px]">Ctrl</span> K
        </kbd>
      </button>

      {/* Modal Backdrop & Dialog */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-start justify-center p-4 sm:p-6 md:p-20 overflow-y-auto animate-in fade-in duration-150"
          onClick={() => setIsOpen(false)}
        >
          <div
            className="w-full max-w-2xl rounded-2xl bg-[var(--color-surface)] border border-[var(--color-line)] shadow-2xl overflow-hidden flex flex-col"
            onClick={e => e.stopPropagation()}
          >
            {/* Search Input Bar */}
            <div className="flex items-center gap-3 px-4 py-3.5 border-b border-[var(--color-line)] bg-[var(--color-surface-2)]">
              <Search size={18} className="text-[var(--color-ink-muted)] shrink-0" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={e => {
                  setQuery(e.target.value);
                  setSelectedIndex(0);
                }}
                onKeyDown={handleInputKeyDown}
                placeholder="Search across 37 systems, tech stack (React, Python, Cloudflare...), or domain..."
                className="w-full bg-transparent text-sm text-[var(--color-ink)] placeholder-[var(--color-ink-muted)] focus:outline-none font-sans"
              />
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-lg text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] hover:bg-[var(--color-surface)] transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {/* Results List */}
            <div className="max-h-96 overflow-y-auto p-2 space-y-1">
              {filtered.length === 0 ? (
                <div className="py-12 text-center text-xs font-mono text-[var(--color-ink-muted)]">
                  No systems matching "{query}"
                </div>
              ) : (
                filtered.map((p, idx) => {
                  const isSel = idx === selectedIndex;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => selectProject(p.id)}
                      onMouseEnter={() => setSelectedIndex(idx)}
                      className={`w-full text-left p-3 rounded-xl transition-all flex items-center justify-between gap-3 cursor-pointer ${
                        isSel
                          ? 'bg-emerald-500/10 text-[var(--color-ink)] border border-emerald-500/40'
                          : 'hover:bg-[var(--color-surface-2)] text-[var(--color-ink-muted)] border border-transparent'
                      }`}
                    >
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-2 text-[10px] font-mono">
                          <span className="uppercase text-[var(--color-ink-muted)]">
                            {p.domainLabel || p.domain}
                          </span>
                          {p.status === 'live' && (
                            <span className="text-emerald-500 font-semibold">• Live Cloud</span>
                          )}
                          {p.featured && (
                            <span className="text-amber-500 font-semibold">★ Flagship</span>
                          )}
                        </div>
                        <div className="text-sm font-semibold text-[var(--color-ink)] truncate">
                          {p.title}
                        </div>
                        <div className="text-xs text-[var(--color-ink-muted)] truncate max-w-md">
                          {p.tagline}
                        </div>
                      </div>

                      <div className="shrink-0 flex items-center gap-2">
                        {p.status === 'live' && p.links?.live && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                            Live App
                          </span>
                        )}
                        <ArrowRight size={14} className={isSel ? 'text-emerald-500 translate-x-0.5 transition-transform' : 'opacity-40'} />
                      </div>
                    </button>
                  );
                })
              )}
            </div>

            {/* Footer Keyboard Hints */}
            <div className="px-4 py-2.5 bg-[var(--color-surface-2)] border-t border-[var(--color-line)] flex items-center justify-between text-[11px] font-mono text-[var(--color-ink-muted)]">
              <div className="flex items-center gap-3">
                <span>↑↓ Navigate</span>
                <span>↵ Open Case Study</span>
                <span>ESC Close</span>
              </div>
              <div>{filtered.length} of {projects.length} systems</div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
