import { expect, test } from '@playwright/test';

/**
 * シリーズ順次ロック廃止後: 全記事が常時閲覧可能。通常ビルドの preview で検証する。
 */
test.describe('CPL stub articles (always readable)', () => {
  test('CPL-Hub-Meteorology shows stub body, not lock screen', async ({ page }) => {
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
