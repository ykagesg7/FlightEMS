import articleXpRewardsConfig from '../config/articleXpRewards.json';
import type { ArticleXpConfig, ArticleMeta } from '../types/articles';

/**
 * 記事経験値設定を取得
 */
export function getArticleXpConfig(): ArticleXpConfig {
  return articleXpRewardsConfig as ArticleXpConfig;
}

/**
 * 記事の経験値を取得
 * @param articleSlug 記事のslugまたはfilename
 * @param articleMeta 記事のメタデータ（オプション）
 * @returns 経験値
 */
export function getArticleXp(articleSlug: string, articleMeta?: ArticleMeta): number {
  const config = getArticleXpConfig();

  // 個別記事の設定をチェック
  if (config.articles && config.articles[articleSlug]) {
    return config.articles[articleSlug];
  }

  // カテゴリ別の設定をチェック
  if (articleMeta && config.categories && articleMeta.tags && articleMeta.tags.length > 0) {
    // タグの最初の要素をカテゴリとして使用
    const category = articleMeta.tags[0];
    if (config.categories[category]) {
      return config.categories[category];
    }
  }

  // デフォルト値を返す
  return config.default;
}

/**
 * 初回読了ボーナスを取得
 * @returns ボーナス経験値
 */
export function getFirstReadBonus(): number {
  const config = getArticleXpConfig();
  if (config.first_read_bonus?.enabled) {
    return config.first_read_bonus.amount;
  }
  return 0;
}

/**
 * シリーズ完了ボーナスの倍率を取得
 * @returns 倍率（1.0以上）
 */
export function getSeriesCompletionMultiplier(): number {
  const config = getArticleXpConfig();
  if (config.series_completion_bonus?.enabled) {
    return config.series_completion_bonus.multiplier;
  }
  return 1.0;
}

/**
 * 記事の基本経験値を計算（ボーナスなし）
 * @param articleSlug 記事のslugまたはfilename
 * @param articleMeta 記事のメタデータ（オプション）
 * @returns 基本経験値
 */
export function calculateBaseArticleXp(articleSlug: string, articleMeta?: ArticleMeta): number {
  return getArticleXp(articleSlug, articleMeta);
}

/**
 * 記事読了時の総経験値を計算（ボーナス込み）
 * @param articleSlug 記事のslugまたはfilename
 * @param articleMeta 記事のメタデータ（オプション）
 * @param isFirstRead 初回読了かどうか
 * @param isSeriesComplete シリーズ完了かどうか
 * @returns 総経験値
 */
export function calculateTotalArticleXp(
  articleSlug: string,
  articleMeta?: ArticleMeta,
  isFirstRead: boolean = false,
  isSeriesComplete: boolean = false
): number {
  let baseXp = calculateBaseArticleXp(articleSlug, articleMeta);

  // シリーズ完了ボーナスを適用
  if (isSeriesComplete) {
    baseXp = Math.round(baseXp * getSeriesCompletionMultiplier());
  }

  // 初回読了ボーナスを追加
  if (isFirstRead) {
    baseXp += getFirstReadBonus();
  }

  return baseXp;
}
