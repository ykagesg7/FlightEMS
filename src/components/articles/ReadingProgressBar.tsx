import React, { useEffect, useRef, useState } from 'react';
import { useArticlePrefetch } from '../../hooks/useArticlePrefetch';
import { useLearningProgress } from '../../hooks/useLearningProgress';
import { getArticleBySlug } from '../../utils/articlesIndex';
import { MDX_CONTENT_LOADED_EVENT } from '../mdx/MDXLoader';
import ReadingTimeEstimate from './ReadingTimeEstimate';

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

interface ReadingProgressBarProps {
  contentId?: string;
  slug?: string;
}

export const ReadingProgressBar: React.FC<ReadingProgressBarProps> = ({ contentId, slug }) => {
  const [progressPct, setProgressPct] = useState(0);
  const [headerOffset, setHeaderOffset] = useState(0);
  const [readingTime, setReadingTime] = useState<number>(5);
  const { updateProgress } = useLearningProgress();

  // プリフェッチフックを使用
  const currentSlug = slug || contentId || '';
  useArticlePrefetch(currentSlug, true);

  const compute = useThrottle(() => {
    const totalScrollable = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    const currentScrollY = Math.max(0, window.scrollY);
    const pct = Math.min(100, Math.max(0, (currentScrollY / totalScrollable) * 100));
    setProgressPct(pct);
    updateProgress(currentSlug, Math.floor(currentScrollY));
  }, 1000);

  useEffect(() => {
    const computeHeaderOffset = () => {
      const header = document.querySelector('header');
      const h = header instanceof HTMLElement ? header.getBoundingClientRect().height : 0;
      setHeaderOffset(h);
    };
    const onScroll = () => compute();
    const onResize = () => compute();
    const onLoaded = async (event: CustomEvent) => {
      setTimeout(() => { compute(); computeHeaderOffset(); }, 50);

      // メタデータから読了時間を取得
      const { meta } = event.detail || {};
      if (meta?.readingTime) {
        setReadingTime(meta.readingTime);
      } else if (currentSlug) {
        // slugから記事情報を取得
        try {
          const article = await getArticleBySlug(currentSlug);
          if (article?.meta.readingTime) {
            setReadingTime(article.meta.readingTime);
          }
        } catch (error) {
          console.warn('記事情報の取得に失敗しました:', error);
        }
      }
    };
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
    <>
      {/* 進捗バー */}
      <div style={{ position: 'fixed', top: `calc(${headerOffset}px + env(safe-area-inset-top, 0px))`, left: 0, right: 0, height: 3, zIndex: 70, background: 'transparent', pointerEvents: 'none' }} aria-hidden="true">
        <div style={{ width: `${progressPct}%`, height: '100%', background: 'linear-gradient(90deg, var(--hud-primary), #06b6d4)', transition: 'width 120ms linear' }} />
      </div>

      {/* 読了時間表示（右上に固定） */}
      {progressPct > 0 && (
        <div className="fixed top-4 right-4 z-40">
          <ReadingTimeEstimate
            totalReadingTime={readingTime}
            progress={progressPct / 100}
            compact={true}
          />
        </div>
      )}
    </>
  );
};


