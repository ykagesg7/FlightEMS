import { expect, test } from '@playwright/test';

test.describe('Planning leftover navigation', () => {
  test('HOME LOGIN and Mission unmount the planning map', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: 'PLANNING' }).click();
    await expect(page).toHaveURL(/\/planning$/);
    await expect(page.getByRole('link', { name: 'Mission Dashboardへ戻る' })).toBeVisible({
      timeout: 60_000,
    });

    await page.getByRole('link', { name: 'HOME' }).click();
    await expect(page).toHaveURL('/');
    await expect(page.getByRole('link', { name: 'Mission Dashboardへ戻る' })).toHaveCount(0);
    await expect(page.locator('.leaflet-container')).toHaveCount(0);

    await page.getByRole('link', { name: 'PLANNING' }).click();
    await expect(page).toHaveURL(/\/planning$/);
    await page.getByRole('link', { name: 'LOGIN' }).click();
    await expect(page).toHaveURL(/\/auth$/);
    await expect(page.getByRole('link', { name: 'Mission Dashboardへ戻る' })).toHaveCount(0);
    await expect(page.locator('.leaflet-container')).toHaveCount(0);

    await page.goto('/planning');
    await expect(page.getByRole('link', { name: 'Mission Dashboardへ戻る' })).toBeVisible({
      timeout: 60_000,
    });
    await page.getByRole('link', { name: 'Mission Dashboardへ戻る' }).click();
    await expect(page).not.toHaveURL(/\/planning$/);
    await expect(page.getByRole('link', { name: 'Mission Dashboardへ戻る' })).toHaveCount(0);
    await expect(page.locator('.leaflet-container')).toHaveCount(0);
  });
});
