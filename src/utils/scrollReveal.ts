// src/utils/scrollReveal.ts
// High-Performance IntersectionObserver, Numeric Rollups, 3D Gyroscopic Tilt, and Sci-Fi Audio Delegation
import { sound } from './audio';

export function initScrollReveal() {
  if (typeof window === 'undefined') return;

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // 1. Intersection Observer for Scroll Reveals
  if (prefersReduced) {
    document.querySelectorAll('.scroll-reveal').forEach(el => {
      el.classList.add('is-revealed');
    });
    document.querySelectorAll('[data-counter-target]').forEach(el => {
      const target = el.getAttribute('data-counter-target');
      if (target) el.textContent = target;
    });
  } else {
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
  }

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

  // 3. Global 3D Gyroscopic Perspective Card Tilt Engine
  if (!prefersReduced && window.matchMedia('(pointer: fine)').matches) {
    document.querySelectorAll<HTMLElement>('.cyber-card').forEach(card => {
      let rafId: number | null = null;

      const handlePointerMove = (e: PointerEvent) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        card.style.setProperty('--mouse-x', `${x}px`);
        card.style.setProperty('--mouse-y', `${y}px`);

        if (rafId) cancelAnimationFrame(rafId);
        rafId = requestAnimationFrame(() => {
          const centerX = rect.width / 2;
          const centerY = rect.height / 2;
          const rotateX = ((y - centerY) / centerY) * -5.5;
          const rotateY = ((x - centerX) / centerX) * 5.5;

          card.style.transform = `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) scale3d(1.012, 1.012, 1.012)`;
        });
      };

      const handlePointerLeave = () => {
        if (rafId) cancelAnimationFrame(rafId);
        card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
      };

      card.addEventListener('pointermove', handlePointerMove, { passive: true });
      card.addEventListener('pointerleave', handlePointerLeave, { passive: true });
    });
  }

  // 4. Delegated Sci-Fi Audio Micro-Haptics
  document.addEventListener(
    'pointerenter',
    (e) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;
      const interactive = target.closest(
        '[data-sound-hover="true"], .case-study-trigger, button, nav a, .status-pill'
      );
      if (interactive) {
        sound.playHover();
      }
    },
    { capture: true, passive: true }
  );

  document.addEventListener(
    'pointerdown',
    (e) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;
      const interactive = target.closest(
        '[data-sound-click="true"], .case-study-trigger, .tactile-press, button:not([data-no-sound])'
      );
      if (interactive) {
        sound.playClick(1280);
      }
    },
    { capture: true, passive: true }
  );
}

// Auto-run when loaded in browser
if (typeof window !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initScrollReveal);
  } else {
    initScrollReveal();
  }
}
