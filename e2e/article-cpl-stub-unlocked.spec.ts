import { expect, test } from '@playwright/test';

/**
 * playwright.config の webServer が VITE_UNLOCK_ALL_SERIES_ARTICLES=true でビルドする前提。
 * CPL スタブは同一シリーズで順次ロックされるため、フラグ無しでは本テストは不安定／失敗しうる。
 */
test.describe('CPL stub articles (series unlock bypassed in E2E build)', () => {
  test('CPL-Hub-Meteorology shows stub body, not series lock', async ({ page }) => {
    await page.goto('/articles/CPL-Hub-Meteorology');
    await expect(page.getByRole('heading', { level: 1, name: '【航空気象】CPL 学習ハブ（テスト連携）' })).toBeVisible({
      timeout: 60_000,
    });
    await expect(page.getByRole('heading', { level: 2, name: '本文準備中' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'この記事はロックされています' })).toHaveCount(0);
  });

  test('engineering_basics stub loads', async ({ page }) => {
    await page.goto('/articles/engineering_basics');
    await expect(page.getByRole('heading', { level: 1, name: '【航空工学】工学基礎（スタブ）' })).toBeVisible({
      timeout: 60_000,
    });
    await expect(page.getByRole('heading', { level: 2, name: '本文準備中' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'この記事はロックされています' })).toHaveCount(0);
  });
});
