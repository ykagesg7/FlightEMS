import { useEffect, useRef, useState } from 'react';

export function useHideOnScroll(threshold = 8) {
  const prevY = useRef(typeof window !== 'undefined' ? window.scrollY : 0);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    let ticking = false;
    const onScroll = () => {
      const y = window.scrollY;
      const d = y - prevY.current;
      prevY.current = y;
      if (Math.abs(d) < threshold) return;
      if (!ticking) {
        requestAnimationFrame(() => {
          setHidden(d > 0 && y > 64);
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [threshold]);

  return hidden;
}


