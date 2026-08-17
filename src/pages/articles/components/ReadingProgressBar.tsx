import React, { useEffect, useRef, useState } from 'react';
import { MDX_CONTENT_LOADED_EVENT } from '../../../components/mdx/MDXLoader';
import { useArticlePrefetch } from '../../../hooks/useArticlePrefetch';
import { useArticleProgress } from '../../../hooks/useArticleProgress';
import { useAuth } from '../../../hooks/useAuth';
import { useReadingDwellSession } from '../../../hooks/useReadingDwellSession';
import { getArticleBySlug, isLessonContentId } from '../../../utils/articlesIndex';

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
 * 表示は行わず、スクロール進捗と読了滞在を保存する。
 * 進捗は `learning_progress`、滞在は `learning_sessions`（JST 集計の元データ）。
 */
export const ReadingProgressBar: React.FC<ReadingProgressBarProps> = ({ contentId, slug }) => {
  const { updateArticleProgress } = useArticleProgress();
  const { user } = useAuth();
  const [estimatedMinutes, setEstimatedMinutes] = useState<number | null>(null);

  const currentSlug = slug || contentId || '';
  useArticlePrefetch(currentSlug, true);
  useReadingDwellSession({
    userId: user?.id,
    contentId: currentSlug,
    contentType: isLessonContentId(currentSlug) ? 'lesson' : 'article',
    estimatedMinutes,
    enabled: Boolean(user && currentSlug),
  });

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
    const onScroll = () => {
      compute();
    };
    const onResize = () => {
      compute();
    };
    const onLoaded = async (event: CustomEvent) => {
      setTimeout(() => {
        compute();
      }, 50);

      const { meta } = event.detail || {};
      if (typeof meta?.readingTime === 'number' && meta.readingTime > 0) {
        setEstimatedMinutes(meta.readingTime);
      } else if (currentSlug) {
        try {
          const article = await getArticleBySlug(currentSlug);
          if (article?.meta.readingTime) {
            setEstimatedMinutes(article.meta.readingTime);
          }
        } catch (error) {
          console.warn('記事情報の取得に失敗しました:', error);
        }
      }
    };
    compute();
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
