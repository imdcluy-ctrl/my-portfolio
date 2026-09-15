import { useState, useEffect, useRef } from 'react';
import { Sun, Moon } from 'lucide-react';

export default function ThemeToggle() {
  const [dark, setDark] = useState<boolean>(() => {
    if (typeof document !== 'undefined') {
      return document.documentElement.classList.contains('dark');
    }
    return true; // Default fallback to dark
  });

  const switchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    // Sync with DOM on client mount
    if (typeof document !== 'undefined') {
      setDark(document.documentElement.classList.contains('dark'));
    }

    // Sync across multi-window / multi-tab storage changes
    const handleStorage = (event: StorageEvent) => {
      if (event.key === 'theme') {
        const isDark = event.newValue === 'dark';
        document.documentElement.classList.toggle('dark', isDark);
        setDark(isDark);
      }
    };

    window.addEventListener('storage', handleStorage);
    return () => {
      window.removeEventListener('storage', handleStorage);
      if (switchTimerRef.current) {
        clearTimeout(switchTimerRef.current);
      }
    };
  }, []);

  const toggle = () => {
    const root = document.documentElement;

    // Reset existing switch timer if clicked rapidly
    if (switchTimerRef.current) {
      clearTimeout(switchTimerRef.current);
    }

    root.classList.add('theme-switching');
    const next = !dark;
    root.classList.toggle('dark', next);

    try {
      localStorage.setItem('theme', next ? 'dark' : 'light');
    } catch {
      // Graceful fallback if localStorage is sandboxed/restricted (TC-202b)
    }

    setDark(next);

    switchTimerRef.current = setTimeout(() => {
      root.classList.remove('theme-switching');
      switchTimerRef.current = null;
    }, 260);
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={dark ? 'Switch to light theme' : 'Switch to dark theme'}
      aria-pressed={dark}
      data-theme={dark ? 'dark' : 'light'}
      className="theme-toggle inline-flex items-center justify-center rounded-[--radius-pill] p-2 text-ink-muted hover:text-ink hover:bg-surface-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent cursor-pointer"
    >
      {dark ? (
        <Sun size={18} aria-hidden="true" className="icon-sun stroke-current" />
      ) : (
        <Moon size={18} aria-hidden="true" className="icon-moon stroke-current" />
      )}
    </button>
  );
}
