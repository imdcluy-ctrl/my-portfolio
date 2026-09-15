import { useEffect, useState, useRef, type KeyboardEvent } from 'react';

interface DomainFilterProps {
  counts: Record<string, number>;
  totalCount: number;
}

interface TabDef {
  key: string;
  label: string;
  short: string;
}

const TABS: TabDef[] = [
  { key: 'all', label: 'All Projects', short: 'All' },
  { key: 'institutional', label: 'Institutional Systems', short: 'Institutional' },
  { key: 'sports', label: 'Sports & Tournaments', short: 'Sports' },
  { key: 'edtech', label: 'EdTech & Pedagogical AI', short: 'EdTech' },
  { key: 'offline-lan', label: 'Offline LAN Systems', short: 'Offline LAN' },
  { key: 'platforms', label: 'Platforms & Tools', short: 'Platforms' },
];

export default function DomainFilter({ counts, totalCount }: DomainFilterProps) {
  const [active, setActive] = useState<string>('all');
  const [announcement, setAnnouncement] = useState<string>('');
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const applyFilter = (key: string) => {
    setActive(key);
    const grid = document.getElementById('project-grid');
    if (grid) {
      grid.dataset.active = key;
    }
    const hash = key === 'all' ? '' : `#${key}`;
    history.replaceState(null, '', hash || window.location.pathname);

    const count = key === 'all' ? totalCount : counts[key] || 0;
    const tab = TABS.find(t => t.key === key);
    setAnnouncement(`Showing ${count} projects in ${tab?.label || key}`);
  };

  useEffect(() => {
    const initialHash = window.location.hash.replace('#', '').toLowerCase();
    if (initialHash && TABS.some(t => t.key === initialHash)) {
      applyFilter(initialHash);
    }
  }, []);

  const handleKeyDown = (e: KeyboardEvent<HTMLButtonElement>, index: number) => {
    let nextIndex = index;
    if (e.key === 'ArrowRight') {
      nextIndex = (index + 1) % TABS.length;
    } else if (e.key === 'ArrowLeft') {
      nextIndex = (index - 1 + TABS.length) % TABS.length;
    } else if (e.key === 'Home') {
      nextIndex = 0;
    } else if (e.key === 'End') {
      nextIndex = TABS.length - 1;
    } else {
      return;
    }

    e.preventDefault();
    tabRefs.current[nextIndex]?.focus();
    applyFilter(TABS[nextIndex].key);
  };

  return (
    <div className="w-full my-6">
      {/* Screen reader live announcement */}
      <div className="sr-only" role="status" aria-live="polite">
        {announcement}
      </div>

      <div
        role="tablist"
        aria-label="Filter projects by domain"
        className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none border-b border-[var(--color-line)]"
      >
        {TABS.map((tab, idx) => {
          const isSelected = active === tab.key;
          const count = tab.key === 'all' ? totalCount : counts[tab.key] || 0;

          return (
            <button
              key={tab.key}
              ref={el => {
                tabRefs.current[idx] = el;
              }}
              role="tab"
              type="button"
              id={`tab-${tab.key}`}
              aria-selected={isSelected}
              aria-controls="project-grid"
              tabIndex={isSelected ? 0 : -1}
              onClick={() => applyFilter(tab.key)}
              onKeyDown={e => handleKeyDown(e, idx)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all duration-150 flex items-center gap-1.5 cursor-pointer select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] ${
                isSelected
                  ? 'bg-[var(--color-ink)] text-[var(--color-canvas)] shadow-xs'
                  : 'text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] hover:bg-[var(--color-surface-2)]'
              }`}
            >
              <span>{tab.short}</span>
              <span
                className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                  isSelected
                    ? 'bg-[var(--color-canvas)] text-[var(--color-ink)]'
                    : 'bg-[var(--color-surface-2)] text-[var(--color-ink-muted)]'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
