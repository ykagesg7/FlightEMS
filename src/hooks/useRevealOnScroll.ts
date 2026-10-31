import { useEffect } from 'react';

const REVEAL_VISIBLE_CLASSES = ['opacity-100', 'translate-y-0'] as const;
const REVEAL_HIDDEN_CLASSES = ['opacity-0', 'translate-y-4'] as const;

function revealElement(el: HTMLElement, prefersReducedMotion: boolean, delayMs: number): void {
  if (prefersReducedMotion || delayMs <= 0) {
    el.classList.add(...REVEAL_VISIBLE_CLASSES);
    el.classList.remove(...REVEAL_HIDDEN_CLASSES);
    return;
  }

  window.setTimeout(() => {
    el.classList.add(...REVEAL_VISIBLE_CLASSES);
    el.classList.remove(...REVEAL_HIDDEN_CLASSES);
  }, delayMs);
}

function parseTransitionDelayMs(el: HTMLElement): number {
  const raw = el.style.transitionDelay;
  if (!raw) return 0;
  const parsed = Number.parseInt(raw.replace('ms', ''), 10);
  return Number.isFinite(parsed) ? parsed : 0;
}

/**
 * IntersectionObserver で .reveal を表示。未発火でもフォールバックで必ず表示する。
 */
export function useRevealOnScroll(deps?: React.DependencyList): void {
  useEffect(() => {
    let io: IntersectionObserver | null = null;
    let fallbackTimer: number | null = null;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const revealAllPending = () => {
      document.querySelectorAll<HTMLElement>('.reveal').forEach((el) => {
        if (el.classList.contains('opacity-0')) {
          revealElement(el, prefersReducedMotion, parseTransitionDelayMs(el));
        }
      });
    };

    const setupTimer = window.setTimeout(() => {
      const els = Array.from(document.querySelectorAll<HTMLElement>('.reveal'));

      if (prefersReducedMotion) {
        revealAllPending();
        return;
      }

      io = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            const target = entry.target as HTMLElement;
            revealElement(target, false, parseTransitionDelayMs(target));
            io?.unobserve(target);
          });
        },
        {
          threshold: 0.15,
          rootMargin: '0px 0px -50px 0px',
        },
      );

      els.forEach((el) => io?.observe(el));

      fallbackTimer = window.setTimeout(revealAllPending, 2000);
    }, 100);

    return () => {
      window.clearTimeout(setupTimer);
      if (fallbackTimer) {
        window.clearTimeout(fallbackTimer);
      }
      io?.disconnect();
    };
  }, deps ?? []);
}
