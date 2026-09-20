import React, { useCallback, useEffect, useRef, useState } from 'react';
import { MDX_CONTENT_LOADED_EVENT } from '../../../components/mdx/MDXLoader';
import { useArticlePrefetch } from '../../../hooks/useArticlePrefetch';
import { useArticleProgress } from '../../../hooks/useArticleProgress';
import { useAuth } from '../../../hooks/useAuth';
import { useReadingDwellSession } from '../../../hooks/useReadingDwellSession';
import { getArticleBySlug, isLessonContentId } from '../../../utils/articlesIndex';
import {
  ARTICLE_READ_COMPLETE_PERCENT,
  computeWindowScrollMetrics,
} from '../utils/computeScrollMetrics';

function useTrailingThrottle(fn: () => void, intervalMs: number): () => void {
  const fnRef = useRef(fn);
  fnRef.current = fn;
  const lastCalledAtRef = useRef(0);
  const timeoutRef = useRef<number | null>(null);

  useEffect(() => () => {
    if (timeoutRef.current != null) {
      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  return useCallback(() => {
    const invoke = () => {
      lastCalledAtRef.current = Date.now();
      fnRef.current();
    };
    const now = Date.now();
    const wait = intervalMs - (now - lastCalledAtRef.current);
    if (wait <= 0) {
      if (timeoutRef.current != null) {
        window.clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      invoke();
      return;
    }
    if (timeoutRef.current != null) return;
    timeoutRef.current = window.setTimeout(() => {
      timeoutRef.current = null;
      invoke();
    }, wait);
  }, [intervalMs]);
}

interface ReadingProgressBarProps {
  contentId?: string;
  slug?: string;
  /** Placed after article body so reaching the MDX end counts as read. */
  endSentinelRef?: React.RefObject<Element | null>;
}

/**
 * 表示は行わず、スクロール進捗と読了滞在を保存する。
 * 進捗は `learning_progress`、滞在は `learning_sessions`（JST 集計の元データ）。
 * 完了は (1) ビューポート末尾 (2) 本文末尾センチネル のいずれか。
 */
export const ReadingProgressBar: React.FC<ReadingProgressBarProps> = ({
  contentId,
  slug,
  endSentinelRef,
}) => {
  const { updateArticleProgress } = useArticleProgress();
  const { user } = useAuth();
  const [estimatedMinutes, setEstimatedMinutes] = useState<number | null>(null);

  const [articleBodyReady, setArticleBodyReady] = useState(false);

  const currentSlug = slug || contentId || '';
  useArticlePrefetch(currentSlug, true);
  useReadingDwellSession({
    userId: user?.id,
    contentId: currentSlug,
    contentType: isLessonContentId(currentSlug) ? 'lesson' : 'article',
    estimatedMinutes,
    enabled: Boolean(user && currentSlug),
  });

  const persistViewportProgress = useCallback(() => {
    if (!user || !currentSlug) return;
    const metrics = computeWindowScrollMetrics();
    if (!metrics) return;
    const completed = metrics.scrollProgress >= ARTICLE_READ_COMPLETE_PERCENT;
    void updateArticleProgress(currentSlug, {
      scrollProgress: metrics.scrollProgress,
      lastPosition: metrics.scrollY,
      ...(completed ? { completed: true } : {}),
    });
  }, [currentSlug, updateArticleProgress, user]);

  const compute = useTrailingThrottle(persistViewportProgress, 1000);

  useEffect(() => {
    setArticleBodyReady(false);
  }, [currentSlug]);

  useEffect(() => {
    const onScroll = () => {
      compute();
    };
    const onResize = () => {
      compute();
    };
    const onLoaded = async (event: Event) => {
      setArticleBodyReady(true);
      setTimeout(() => {
        compute();
      }, 50);

      const custom = event as CustomEvent<{ meta?: { readingTime?: number } }>;
      const { meta } = custom.detail || {};
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
    const onPageHide = () => {
      persistViewportProgress();
    };
    persistViewportProgress();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize);
    window.addEventListener(MDX_CONTENT_LOADED_EVENT, onLoaded as EventListener);
    window.addEventListener('pagehide', onPageHide);
    document.addEventListener('visibilitychange', onPageHide);
    return () => {
      persistViewportProgress();
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
      window.removeEventListener(MDX_CONTENT_LOADED_EVENT, onLoaded as EventListener);
      window.removeEventListener('pagehide', onPageHide);
      document.removeEventListener('visibilitychange', onPageHide);
    };
  }, [compute, persistViewportProgress, user, currentSlug]);

  useEffect(() => {
    const sentinel = endSentinelRef?.current;
    if (!user || !currentSlug || !articleBodyReady || !sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        void updateArticleProgress(currentSlug, {
          scrollProgress: 100,
          completed: true,
        });
      },
      { threshold: 0.01 },
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [articleBodyReady, currentSlug, endSentinelRef, updateArticleProgress, user]);

  return null;
};
