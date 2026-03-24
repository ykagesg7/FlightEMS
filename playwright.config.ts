import { defineConfig, devices } from '@playwright/test';

/** 既定は 5174（開発中の 5173 と競合しにくい） */
const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? 'http://127.0.0.1:5174';

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
    command: 'npm run build && npx vite preview --host 127.0.0.1 --port 5174 --strictPort',
    url: baseURL,
    reuseExistingServer: true,
    timeout: 300_000,
  },
});
