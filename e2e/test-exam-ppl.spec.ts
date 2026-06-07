import { expect, test } from '@playwright/test';

test.describe('/test PPL level', () => {
  test('shows PPL pool count when ?exam=ppl', async ({ page }) => {
    await page.goto('/test?exam=ppl');
    const pool = page.getByTestId('ppl-pool-count');
    await expect(pool).toBeVisible({ timeout: 60_000 });
    await expect(pool).toContainText('PPL 対象プール');
    await expect(pool).toContainText('問');
    const subjects = page.getByTestId('ppl-main-subject-count');
    await expect(subjects).toBeVisible();
    await expect(subjects).toContainText('5');
  });

  test('PPL 基礎のみ button activates pool line in practice mode', async ({ page }) => {
    await page.goto('/test');
    await page.getByRole('button', { name: 'PPL 基礎のみ' }).click();
    await expect(page.getByTestId('ppl-pool-count')).toBeVisible({ timeout: 60_000 });
  });
});

test.describe('/test Quiz Hub', () => {
  test('defaults to diagnostic tab in URL', async ({ page }) => {
    await page.goto('/test');
    await expect(page).toHaveURL(/tab=diagnostic/);
    await expect(page.getByRole('button', { name: /10問診断を開始/ })).toBeVisible();
  });

  test('diagnostic start updates URL and shows quiz or empty state', async ({ page }) => {
    await page.goto('/test?tab=diagnostic');
    await page.getByRole('button', { name: /10問診断を開始/ }).click();
    await expect(page).toHaveURL(/tab=diagnostic/);
    const loadingOrQuiz = page.getByText(/問題を取得中|実力診断|出題できる問題が見つかりませんでした/);
    await expect(loadingOrQuiz.first()).toBeVisible({ timeout: 60_000 });
  });

  test('subject tab syncs subject param in URL', async ({ page }) => {
    await page.goto('/test?tab=subject');
    await expect(page).toHaveURL(/tab=subject/);
    await expect(page.getByText('科目別練習')).toBeVisible();
  });

  test('legacy mode=review redirects to canonical review tab', async ({ page }) => {
    await page.goto('/test?mode=review&count=10');
    await expect(page).toHaveURL(/tab=review/, { timeout: 15_000 });
  });
});
