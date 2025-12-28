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

  // セクションベースの進捗計算はTableOfContentsで行うため、
  // ここでは学習進捗のみ更新（スクロール位置の記録用）
  const compute = useThrottle(() => {
    const currentScrollY = Math.max(0, window.scrollY);

    // 学習進捗を更新（スクロール位置の記録用）
    updateProgress(currentSlug, Math.floor(currentScrollY));

    // 記事進捗の更新はTableOfContentsでセクションベースで行うため、
    // ここでは更新しない
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
      // ページ離脱時の進捗保存は削除
      // 理由：
      // 1. スクロール時に既に進捗を保存しているため、重複保存は不要
      // 2. コンポーネントがアンマウントされた後にfetchが実行され、ネットワークエラーが発生する
      // 3. ページ離脱時の非同期処理は信頼性が低い
      // 進捗はスクロール時に自動保存されるため、ページ離脱時の保存は不要

      window.removeEventListener('scroll', onScroll as any);
      window.removeEventListener('resize', onResize as any);
      window.removeEventListener(MDX_CONTENT_LOADED_EVENT, onLoaded as unknown as EventListener);
    };
  }, [compute, user, currentSlug, progressPct, updateArticleProgress]);

  // 進捗更新機能のみ実行（表示は削除）
  // 進捗は目次の下に表示されるため、ここでは表示しない
  return null;
};


