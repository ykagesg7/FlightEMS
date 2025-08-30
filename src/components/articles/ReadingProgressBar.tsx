import React, { useEffect, useRef, useState } from 'react';
import { useLearningProgress } from '../../hooks/useLearningProgress';
import { MDX_CONTENT_LOADED_EVENT } from '../mdx/MDXLoader';

function useThrottle<T extends (...args: any[]) => void>(fn: T, intervalMs: number) {
  const lastCalledAtRef = useRef(0);
  return (...args: Parameters<T>) => {
    const now = Date.now();
    if (now - lastCalledAtRef.current >= intervalMs) {
      lastCalledAtRef.current = now;
      fn(...args);
    }
  };
}

export const ReadingProgressBar: React.FC<{ contentId: string }> = ({ contentId }) => {
  const [progressPct, setProgressPct] = useState(0);
  const [headerOffset, setHeaderOffset] = useState(0);
  const { updateProgress } = useLearningProgress();

  const compute = useThrottle(() => {
    const totalScrollable = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    const currentScrollY = Math.max(0, window.scrollY);
    const pct = Math.min(100, Math.max(0, (currentScrollY / totalScrollable) * 100));
    setProgressPct(pct);
    updateProgress(contentId, Math.floor(currentScrollY));
  }, 1000);

  useEffect(() => {
    const computeHeaderOffset = () => {
      const header = document.querySelector('header');
      const h = header instanceof HTMLElement ? header.getBoundingClientRect().height : 0;
      setHeaderOffset(h);
    };
    const onScroll = () => compute();
    const onResize = () => compute();
    const onLoaded = () => { setTimeout(() => { compute(); computeHeaderOffset(); }, 50); };
    compute();
    computeHeaderOffset();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize);
    window.addEventListener(MDX_CONTENT_LOADED_EVENT, onLoaded as EventListener);
    return () => {
      window.removeEventListener('scroll', onScroll as any);
      window.removeEventListener('resize', onResize as any);
      window.removeEventListener(MDX_CONTENT_LOADED_EVENT, onLoaded as EventListener);
    };
  }, [compute]);

  return (
    <div style={{ position: 'fixed', top: `calc(${headerOffset}px + env(safe-area-inset-top, 0px))`, left: 0, right: 0, height: 3, zIndex: 70, background: 'transparent', pointerEvents: 'none' }} aria-hidden="true">
      <div style={{ width: `${progressPct}%`, height: '100%', background: 'linear-gradient(90deg, var(--hud-primary), #06b6d4)', transition: 'width 120ms linear' }} />
    </div>
  );
};


