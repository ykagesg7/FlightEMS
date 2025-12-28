import { useMemo } from 'react';
import { ArticleMeta } from '../types/articles';
import { useArticleProgress } from './useArticleProgress';
import { useAuth } from './useAuth';

interface SeriesUnlockResult {
  isUnlocked: (contentId: string) => boolean;
  getLockedReason: (contentId: string) => string | null;
  getFirstArticleInSeries: (seriesName: string) => string | null;
  getPreviousArticleInSeries: (contentId: string) => string | null;
}

/**
 * シリーズ記事の順次アンロック機能を提供するフック
 *
 * ロジック:
 * - 未ログインユーザー: 各シリーズの1話（最小order）のみ解放
 * - ログインユーザー: 直前話の読了（completed=true）で次話が解放
 * - シリーズ外の記事: 常に解放
 */
export function useSeriesUnlock(
  articleMetas: Record<string, ArticleMeta>,
  learningContentIds: string[]
): SeriesUnlockResult {
  const { user } = useAuth();
  const { userProgress, isArticleCompleted } = useArticleProgress();

  // シリーズ別の記事リストを作成（contentId -> ArticleMetaのマッピング）
  const seriesMap = useMemo(() => {
    const map: Record<string, Array<{ contentId: string; meta: ArticleMeta }>> = {};

    // learningContentIdsから対応するArticleMetaを探す
    learningContentIds.forEach(contentId => {
      // contentId（learning_contents.id）から対応するArticleMetaを探す
      // filenameベースでマッチングを試みる
      const meta = articleMetas[contentId];
      if (meta && meta.series) {
        if (!map[meta.series]) {
          map[meta.series] = [];
        }
        map[meta.series].push({ contentId, meta });
      }
    });

    // 各シリーズをorderでソート
    Object.keys(map).forEach(series => {
      map[series].sort((a, b) => {
        const orderA = a.meta.order ?? 999;
        const orderB = b.meta.order ?? 999;
        return orderA - orderB;
      });
    });

    return map;
  }, [articleMetas, learningContentIds]);

  // contentIdから対応するArticleMetaを取得
  const getMetaForContentId = (contentId: string): ArticleMeta | null => {
    return articleMetas[contentId] || null;
  };

  // シリーズ内の最小orderの記事IDを取得
  const getFirstArticleInSeries = (seriesName: string): string | null => {
    const seriesArticles = seriesMap[seriesName];
    if (!seriesArticles || seriesArticles.length === 0) {
      return null;
    }
    return seriesArticles[0].contentId;
  };

  // 直前の記事IDを取得
  const getPreviousArticleInSeries = (contentId: string): string | null => {
    const meta = getMetaForContentId(contentId);
    if (!meta || !meta.series) {
      return null;
    }

    const seriesArticles = seriesMap[meta.series];
    if (!seriesArticles) {
      return null;
    }

    const currentIndex = seriesArticles.findIndex(a => a.contentId === contentId);
    if (currentIndex <= 0) {
      return null;
    }

    return seriesArticles[currentIndex - 1].contentId;
  };

  // 記事が解放されているかチェック
  const isUnlocked = (contentId: string): boolean => {
    const meta = getMetaForContentId(contentId);

    // シリーズ外の記事は常に解放
    if (!meta || !meta.series) {
      return true;
    }

    const seriesArticles = seriesMap[meta.series];
    if (!seriesArticles) {
      return true;
    }

    // シリーズ内の最小orderの記事かチェック
    const isFirstArticle = seriesArticles[0]?.contentId === contentId;

    // 未ログインユーザー: 1話のみ解放
    if (!user) {
      return isFirstArticle;
    }

    // ログインユーザー: 1話は常に解放
    if (isFirstArticle) {
      return true;
    }

    // 直前の記事が完了しているかチェック
    const previousArticleId = getPreviousArticleInSeries(contentId);
    if (!previousArticleId) {
      // 直前の記事が見つからない場合は解放（フォールバック）
      return true;
    }

    // 直前の記事の進捗をチェック
    // userProgressのキーはcontent_id（filename）として保存されている
    // previousArticleIdはcontentId（learning_contents.id）で、これがfilenameと一致している前提
    // そのため、previousArticleIdをそのままisArticleCompletedに渡せる

    // 直前の記事の進捗をチェック
    // userProgressのキーはcontent_id（filename）として保存されている
    // previousArticleIdはcontentId（learning_contents.id）で、これがfilenameと一致している前提

    // まず、previousArticleIdをそのままキーとして試す（filenameとして保存されている場合）
    const previousProgress = userProgress[previousArticleId];
    if (previousProgress) {
      // completedフラグまたは進捗率95%以上で完了とみなす
      if (previousProgress.completed || previousProgress.scrollProgress >= 95) {
        return true;
      }
    }

    // isArticleCompletedでもチェック（念のため）
    if (isArticleCompleted(previousArticleId)) {
      return true;
    }

    // 見つからない場合、articleMetasからslugを取得して試す
    const previousMeta = getMetaForContentId(previousArticleId);
    if (previousMeta) {
      // slugベースでもチェック
      const progressBySlug = userProgress[previousMeta.slug];
      if (progressBySlug && (progressBySlug.completed || progressBySlug.scrollProgress >= 95)) {
        return true;
      }
      if (previousMeta.slug && isArticleCompleted(previousMeta.slug)) {
        return true;
      }
    }

    return false;
  };

  // ロック理由を取得
  const getLockedReason = (contentId: string): string | null => {
    if (isUnlocked(contentId)) {
      return null;
    }

    const meta = getMetaForContentId(contentId);
    if (!meta || !meta.series) {
      return null;
    }

    if (!user) {
      return 'この記事を読むには、ログインまたはユーザー登録が必要です。';
    }

    const previousArticleId = getPreviousArticleInSeries(contentId);
    if (!previousArticleId) {
      return 'このシリーズの前の記事を先に読んでください。';
    }

    const previousMeta = getMetaForContentId(previousArticleId);
    const previousTitle = previousMeta?.title || '前の記事';

    return `この記事を読むには、「${previousTitle}」を読了する必要があります。`;
  };

  return {
    isUnlocked,
    getLockedReason,
    getFirstArticleInSeries,
    getPreviousArticleInSeries
  };
}

