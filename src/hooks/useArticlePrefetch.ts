import { useEffect } from 'react';
import { getArticleNavigation, getSeriesNavigation } from '../utils/articlesIndex';

/**
 * 記事のプリフェッチフック
 * 現在の記事の前後記事をプリフェッチして、ページ遷移を高速化する
 */
export const useArticlePrefetch = (currentSlug: string, preferSeries: boolean = true) => {
  useEffect(() => {
    const prefetchArticles = async () => {
      try {
        // シリーズナビゲーションまたは通常のナビゲーションを取得
        const navigation = preferSeries
          ? await getSeriesNavigation(currentSlug)
          : await getArticleNavigation(currentSlug);

        // 前後の記事をプリフェッチ
        const prefetchPromises: Promise<void>[] = [];

        if (navigation.prev) {
          prefetchPromises.push(prefetchArticle(navigation.prev.slug));
        }

        if (navigation.next) {
          prefetchPromises.push(prefetchArticle(navigation.next.slug));
        }

        // 並列でプリフェッチ実行
        await Promise.all(prefetchPromises);
      } catch (error) {
        console.warn('記事のプリフェッチに失敗しました:', error);
      }
    };

    // 少し遅延させてメインコンテンツの読み込みを優先
    const timer = setTimeout(prefetchArticles, 1000);
    return () => clearTimeout(timer);
  }, [currentSlug, preferSeries]);
};

/**
 * 個別記事のプリフェッチ
 */
async function prefetchArticle(slug: string): Promise<void> {
  try {
    // link rel="prefetch" を動的に追加
    if (typeof document !== 'undefined') {
      const existingLink = document.querySelector(`link[rel="prefetch"][data-slug="${slug}"]`);

      if (!existingLink) {
        const link = document.createElement('link');
        link.rel = 'prefetch';
        link.href = `/articles/${slug}`;
        link.setAttribute('data-slug', slug);
        document.head.appendChild(link);
      }
    }

    // モジュールレベルでのプリフェッチも実行
    // 注: 実際のMDXファイルのプリフェッチは動的importの制約により困難
    // そのため、主にルートレベルでのプリフェッチに依存
  } catch (error) {
    console.warn(`記事 ${slug} のプリフェッチに失敗しました:`, error);
  }
}

