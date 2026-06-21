import { expect, test } from '@playwright/test';

const testEmail = process.env.PLAYWRIGHT_TEST_EMAIL;
const testPassword = process.env.PLAYWRIGHT_TEST_PASSWORD;

async function loginIfConfigured(page: import('@playwright/test').Page) {
  if (!testEmail || !testPassword) {
    test.skip(true, 'PLAYWRIGHT_TEST_EMAIL / PLAYWRIGHT_TEST_PASSWORD not set');
  }
  await page.goto('/auth');
  await page.getByLabel(/メール/i).fill(testEmail!);
  await page.getByLabel(/パスワード/i).fill(testPassword!);
  await page.getByRole('button', { name: /ログイン|サインイン/i }).click();
  await expect(page).not.toHaveURL(/\/auth$/, { timeout: 30_000 });
}

test.describe('Profile settings hub', () => {
  test('redirects unauthenticated users to auth', async ({ page }) => {
    await page.goto('/profile');
    await expect(page).toHaveURL(/\/auth/, { timeout: 15_000 });
  });

  test('shows four-section mobile list when authenticated', async ({ page }) => {
    await loginIfConfigured(page);
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/profile');
    await expect(page.getByTestId('profile-hub-section-list')).toBeVisible({ timeout: 30_000 });
    await expect(page.getByText('プロフィール')).toBeVisible();
    await expect(page.getByText('学習・受験')).toBeVisible();
    await expect(page.getByText('通知と公開')).toBeVisible();
    await expect(page.getByText('アカウント')).toBeVisible();
  });

  test('legacy leaderboard tab opens privacy section', async ({ page }) => {
    await loginIfConfigured(page);
    await page.goto('/profile?tab=leaderboard');
    await expect(page.getByText('学習者ランキング（任意参加）')).toBeVisible({ timeout: 30_000 });
  });

  test('privacy tab shows notification settings', async ({ page }) => {
    await loginIfConfigured(page);
    await page.goto('/profile?tab=privacy');
    await expect(page.getByText('通知設定')).toBeVisible({ timeout: 30_000 });
  });
});
