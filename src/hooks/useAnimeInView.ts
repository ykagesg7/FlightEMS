import { useEffect, useRef } from 'react';

export const useAnimeInView = (options?: { translateY?: number; delay?: number }) => {
  const ref = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const el = ref.current as HTMLElement | null;
    if (!el) return;
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) {
      el.style.opacity = '1';
      el.style.transform = 'none';
      return;
    }
    el.style.opacity = '0';
    el.style.transform = `translateY(${options?.translateY ?? 12}px)`;
    const io = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        import('animejs').then(({ default: anime }) => {
          anime({
            targets: el,
            opacity: [0, 1],
            translateY: [options?.translateY ?? 12, 0],
            easing: 'easeOutQuad',
            duration: 420,
            delay: options?.delay ?? 0
          });
        }).catch(() => {
          el.style.opacity = '1';
          el.style.transform = 'none';
        });
        io.disconnect();
      }
    }, { threshold: 0.15 });
    io.observe(el);
    return () => io.disconnect();
  }, [options?.translateY, options?.delay]);

  return ref;
};


