import React, { useEffect, useRef, useState } from 'react';
import { useArticlePrefetch } from '../../hooks/useArticlePrefetch';
import { useArticleProgress } from '../../hooks/useArticleProgress';
import { useAuth } from '../../hooks/useAuth';
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
  const { updateArticleProgress } = useArticleProgress();
  const { user } = useAuth();

  // プリフェッチフックを使用
  const currentSlug = slug || contentId || '';
  useArticlePrefetch(currentSlug, true);

  const compute = useThrottle(() => {
    const totalScrollable = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    const currentScrollY = Math.max(0, window.scrollY);
    const pct = Math.min(100, Math.max(0, (currentScrollY / totalScrollable) * 100));
    setProgressPct(pct);

    // 学習進捗を更新
    updateProgress(currentSlug, Math.floor(currentScrollY));

    // 記事進捗も更新（ログインユーザーのみ、5%以上読んだ場合）
    if (user && currentSlug && pct >= 5) {
      const isCompleted = pct >= 95;
      updateArticleProgress(currentSlug, {
        scrollProgress: pct,
        completed: isCompleted,
        lastPosition: Math.floor(currentScrollY),
        readAt: new Date()
      }).catch(error => {
        console.error('進捗保存エラー:', error);
      });
    }
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
    window.addEventListener(MDX_CONTENT_LOADED_EVENT, onLoaded as unknown as EventListener);
    return () => {
      // ページ離脱時に進捗を保存（ログインユーザーのみ、5%以上読んだ場合）
      if (user && currentSlug && progressPct >= 5) {
        const isCompleted = progressPct >= 95;
        updateArticleProgress(currentSlug, {
          scrollProgress: progressPct,
          completed: isCompleted,
          lastPosition: Math.floor(window.scrollY),
          readAt: new Date()
        }).catch(error => {
          console.error('進捗保存エラー:', error);
        });
      }

      window.removeEventListener('scroll', onScroll as any);
      window.removeEventListener('resize', onResize as any);
      window.removeEventListener(MDX_CONTENT_LOADED_EVENT, onLoaded as unknown as EventListener);
    };
  }, [compute, user, currentSlug, progressPct, updateArticleProgress]);

  return (
    <>
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


