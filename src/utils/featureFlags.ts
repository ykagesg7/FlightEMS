/**
 * E2E / ローカル検証用。`VITE_UNLOCK_ALL_SERIES_ARTICLES=true` でシリーズ順次ロックを無効化する。
 * 本番ビルドでは未設定のままにすること。
 */
export const unlockAllSeriesArticles =
  import.meta.env.VITE_UNLOCK_ALL_SERIES_ARTICLES === 'true';
