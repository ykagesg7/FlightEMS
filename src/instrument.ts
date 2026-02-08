/**
 * Sentry 初期化ファイル
 * main.tsx の最初にインポートされる必要がある
 */
import * as Sentry from '@sentry/react';

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  environment: import.meta.env.MODE,
  enabled: import.meta.env.PROD && !!import.meta.env.VITE_SENTRY_DSN,

  integrations: [Sentry.browserTracingIntegration()],

  // 無料プランに配慮してサンプリングレートを低めに設定
  tracesSampleRate: 0.1,

  // Session Replay は無料枠節約のため無効
  replaysSessionSampleRate: 0,
  replaysOnErrorSampleRate: 0,

  beforeSend(event) {
    // 開発環境では送信しない（二重安全策）
    if (import.meta.env.DEV) return null;
    return event;
  },
});
