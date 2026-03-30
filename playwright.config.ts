import { defineConfig, devices } from '@playwright/test';

/** 既定は 5174（開発中の 5173 と競合しにくい） */
const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? 'http://127.0.0.1:5174';

/** CI では必ず webServer からビルドした preview を使う（既存 dev の再利用で E2E 用 env が効かないのを防ぐ） */
const reuseExistingServer = process.env.CI ? false : true;

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'list',
  use: {
    baseURL,
    trace: 'on-first-retry',
    ...devices['Desktop Chrome'],
  },
  webServer: {
    // dev の依存スキャンが環境によって失敗することがあるため、ビルド済み preview で起動する
    // シリーズロックを外して CPL スタブ等をそのまま開けるようにする（本番ビルドとは別設定）
    command:
      'cross-env VITE_UNLOCK_ALL_SERIES_ARTICLES=true npm run build && npx vite preview --host 127.0.0.1 --port 5174 --strictPort',
    url: baseURL,
    reuseExistingServer,
    timeout: 300_000,
  },
});
