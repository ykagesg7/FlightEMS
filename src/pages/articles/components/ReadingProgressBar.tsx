import React, { useEffect, useRef, useState } from 'react';
import { MDX_CONTENT_LOADED_EVENT } from '../../../components/mdx/MDXLoader';
import { useArticlePrefetch } from '../../../hooks/useArticlePrefetch';
import { useArticleProgress } from '../../../hooks/useArticleProgress';
import { useAuth } from '../../../hooks/useAuth';
import { getArticleBySlug } from '../../../utils/articlesIndex';

function useThrottle<T extends (...args: unknown[]) => void>(fn: T, intervalMs: number) {
  const lastCalledAtRef = useRef(0);
  return (...args: Parameters<T>) => {
    const now = Date.now();
    if (now - lastCalledAtRef.current >= intervalMs) {
      lastCalledAtRef.current = now;
      fn(...args);
    }
  };
}

/** ビューポートスクロールから 0–100% を算出。異常時は null */
function computeScrollMetrics(): { scrollY: number; scrollProgress: number } | null {
  const scrollY = Math.max(0, window.scrollY);
  const doc = document.documentElement;
  const totalScrollable = Math.max(0, doc.scrollHeight - window.innerHeight);
  let scrollProgress: number;
  if (totalScrollable <= 0) {
    scrollProgress = 100;
  } else {
    const raw = (scrollY / totalScrollable) * 100;
    if (!Number.isFinite(raw)) {
      return null;
    }
    scrollProgress = Math.min(100, Math.max(0, Math.round(raw)));
  }
  return { scrollY: Math.floor(scrollY), scrollProgress };
}

interface ReadingProgressBarProps {
  contentId?: string;
  slug?: string;
}

/**
 * 表示は行わず、`learning_progress` へスクロール進捗を保存する。
 * `useArticleProgress.updateArticleProgress` のみ使用（95% 以上で completed）。
 */
export const ReadingProgressBar: React.FC<ReadingProgressBarProps> = ({ contentId, slug }) => {
  const [, setHeaderOffset] = useState(0);
  const [, setReadingTime] = useState<number>(5);
  const { updateArticleProgress } = useArticleProgress();
  const { user } = useAuth();

  const currentSlug = slug || contentId || '';
  useArticlePrefetch(currentSlug, true);

  const compute = useThrottle(() => {
    if (!user || !currentSlug) return;
    const metrics = computeScrollMetrics();
    if (!metrics) return;
    void updateArticleProgress(currentSlug, {
      scrollProgress: metrics.scrollProgress,
      lastPosition: metrics.scrollY,
    });
  }, 1000);

  useEffect(() => {
    const computeHeaderOffset = () => {
      const header = document.querySelector('header');
      const h = header instanceof HTMLElement ? header.getBoundingClientRect().height : 0;
      setHeaderOffset(h);
    };
    const onScroll = () => {
      compute();
    };
    const onResize = () => {
      compute();
    };
    const onLoaded = async (event: CustomEvent) => {
      setTimeout(() => {
        compute();
        computeHeaderOffset();
      }, 50);

      const { meta } = event.detail || {};
      if (meta?.readingTime) {
        setReadingTime(meta.readingTime);
      } else if (currentSlug) {
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
    window.addEventListener(MDX_CONTENT_LOADED_EVENT, onLoaded as unknown as EventListener);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
      window.removeEventListener(MDX_CONTENT_LOADED_EVENT, onLoaded as unknown as EventListener);
    };
  }, [compute, user, currentSlug, updateArticleProgress]);

  return null;
};
