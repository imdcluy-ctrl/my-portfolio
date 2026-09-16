// src/utils/scrollReveal.ts
// Lightweight, zero-dependency IntersectionObserver reveal engine with numeric count-ups

export function initScrollReveal() {
  if (typeof window === 'undefined') return;

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // If reduced motion is requested, immediately reveal everything without delay
  if (prefersReduced) {
    document.querySelectorAll('.scroll-reveal').forEach(el => {
      el.classList.add('is-revealed');
    });
    document.querySelectorAll('[data-counter-target]').forEach(el => {
      const target = el.getAttribute('data-counter-target');
      if (target) el.textContent = target;
    });
    return;
  }

  // 1. Intersection Observer for Scroll Reveals
  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const el = entry.target as HTMLElement;
          const delay = el.getAttribute('data-delay');
          if (delay) {
            const delayMs = delay.endsWith('ms') ? delay : `${delay}ms`;
            el.style.animationDelay = delayMs;
            el.style.transitionDelay = delayMs;
          }
          el.classList.add('is-revealed');
          observer.unobserve(el);

          // If element contains counters, trigger them
          el.querySelectorAll('[data-counter-target]').forEach(counterEl => {
            animateCounter(counterEl as HTMLElement);
          });
        }
      });
    },
    {
      root: null,
      rootMargin: '0px 0px -50px 0px',
      threshold: 0.1,
    }
  );

  document.querySelectorAll('.scroll-reveal').forEach(el => {
    revealObserver.observe(el);
  });

  // 2. Animate Numeric Metric Counters
  function animateCounter(el: HTMLElement) {
    if (el.dataset.animated === 'true') return;
    el.dataset.animated = 'true';

    const targetStr = el.getAttribute('data-counter-target') || '0';
    const hasPlus = targetStr.includes('+');
    const isCost = targetStr.startsWith('$');
    const numericTarget = parseInt(targetStr.replace(/[^0-9]/g, ''), 10);

    if (isNaN(numericTarget) || numericTarget === 0) {
      el.textContent = targetStr;
      return;
    }

    const duration = 1200; // ms
    const startTime = performance.now();

    function update(now: number) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out quartic
      const ease = 1 - Math.pow(1 - progress, 4);
      const current = Math.floor(ease * numericTarget);

      let formatted = `${current}`;
      if (isCost) formatted = `$${current}/mo`;
      else if (hasPlus) formatted = `${current}+`;

      el.textContent = formatted;

      if (progress < 1) {
        requestAnimationFrame(update);
      } else {
        el.textContent = targetStr;
      }
    }

    requestAnimationFrame(update);
  }

  // 3. Global Sound Haptics for elements with data-sound
  document.addEventListener('click', (e) => {
    const target = (e.target as HTMLElement).closest('[data-sound]');
    if (target) {
      const soundType = target.getAttribute('data-sound');
      import('./audio').then(({ sound }) => {
        if (soundType === 'chime') sound.playDrawerChime();
        else sound.playClick();
      });
    }
  }, { passive: true });
}

// Auto-run when loaded in browser
if (typeof window !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initScrollReveal);
  } else {
    initScrollReveal();
  }
}
