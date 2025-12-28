import React, { useEffect, useRef, useState } from 'react';
import { MDX_CONTENT_LOADED_EVENT } from '../../../components/mdx/MDXLoader';
import { useArticlePrefetch } from '../../../hooks/useArticlePrefetch';
import { useArticleProgress } from '../../../hooks/useArticleProgress';
import { useAuth } from '../../../hooks/useAuth';
import { useLearningProgress } from '../../../hooks/useLearningProgress';
import { getArticleBySlug } from '../../../utils/articlesIndex';

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
  const [, setHeaderOffset] = useState(0);
  const [, setReadingTime] = useState<number>(5);
  const { updateProgress } = useLearningProgress();
  const { updateArticleProgress } = useArticleProgress();
  const { user } = useAuth();

  // プリフェチE��フックを使用
  const currentSlug = slug || contentId || '';
  useArticlePrefetch(currentSlug, true);

  // セクションベ�Eスの進捗計算�ETableOfContentsで行うため、E
  // ここでは学習進捗�Eみ更新�E�スクロール位置の記録用�E�E
  const compute = useThrottle(() => {
    const currentScrollY = Math.max(0, window.scrollY);

    // 学習進捗を更新�E�スクロール位置の記録用�E�E
    updateProgress(currentSlug, Math.floor(currentScrollY));

    // 記事進捗�E更新はTableOfContentsでセクションベ�Eスで行うため、E
    // ここでは更新しなぁE
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

      // メタチE�Eタから読亁E��間を取征E
      const { meta } = event.detail || {};
      if (meta?.readingTime) {
        setReadingTime(meta.readingTime);
      } else if (currentSlug) {
        // slugから記事情報を取征E
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
      // ペ�Eジ離脱時�E進捗保存�E削除
      // 琁E���E�E
      // 1. スクロール時に既に進捗を保存してぁE��ため、E��褁E��存�E不要E
      // 2. コンポ�Eネントがアンマウントされた後にfetchが実行され、ネチE��ワークエラーが発生すめE
      // 3. ペ�Eジ離脱時�E非同期�E琁E�E信頼性が低い
      // 進捗�Eスクロール時に自動保存されるため、�Eージ離脱時�E保存�E不要E

      window.removeEventListener('scroll', onScroll as any);
      window.removeEventListener('resize', onResize as any);
      window.removeEventListener(MDX_CONTENT_LOADED_EVENT, onLoaded as unknown as EventListener);
    };
  }, [compute, user, currentSlug, updateArticleProgress]);

  // 進捗更新機�Eのみ実行（表示は削除�E�E
  // 進捗�E目次の下に表示されるため、ここでは表示しなぁE
  return null;
};


