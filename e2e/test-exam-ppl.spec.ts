import { expect, test } from '@playwright/test';

test.describe('/test PPL level', () => {
  test('shows PPL pool count when ?exam=ppl', async ({ page }) => {
    await page.goto('/test?exam=ppl');
    const pool = page.getByTestId('ppl-pool-count');
    await expect(pool).toBeVisible({ timeout: 60_000 });
    await expect(pool).toContainText('現在の PPL 対象プール');
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
