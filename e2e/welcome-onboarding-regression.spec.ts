import { expect, test } from '@playwright/test';

const MOCK_USER_ID = '11111111-1111-4111-8111-111111111111';

const mockProfile = {
  id: MOCK_USER_ID,
  username: 'engaged-learner',
  email: 'engaged@example.com',
  roll: 'Student',
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-01-01T00:00:00Z',
  full_name: null,
  avatar_url: null,
  website: null,
  rank: 'fan',
  xp_points: 15,
  social_links: null,
  bio: null,
  password_updated_at: null,
  leaderboard_opt_in: false,
  leaderboard_display_name: null,
  mfa_required_at_login: false,
  onboarding_completed_at: null,
};

async function installMockSupabaseAuth(page: import('@playwright/test').Page) {
  await page.route('**/auth/v1/user**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        id: MOCK_USER_ID,
        email: 'engaged@example.com',
        app_metadata: { provider: 'google' },
      }),
    });
  });

  await page.route('**/auth/v1/token**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        access_token: 'mock-access-token',
        refresh_token: 'mock-refresh-token',
        expires_in: 3600,
        token_type: 'bearer',
        user: {
          id: MOCK_USER_ID,
          email: 'engaged@example.com',
          app_metadata: { provider: 'google' },
        },
      }),
    });
  });

  await page.route('**/rest/v1/profiles**', async (route) => {
    const method = route.request().method();
    if (method === 'GET' || method === 'HEAD') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockProfile),
      });
      return;
    }
    if (method === 'PATCH' || method === 'PUT') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          ...mockProfile,
          onboarding_completed_at: '2026-03-01T00:00:00Z',
        }),
      });
      return;
    }
    await route.fallback();
  });

  await page.route('**/auth/v1/factors**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ currentLevel: 'aal1', nextLevel: 'aal1' }),
    });
  });

  await page.addInitScript(({ userId }) => {
    const sessionPayload = {
      access_token: 'mock-access-token',
      refresh_token: 'mock-refresh-token',
      expires_in: 3600,
      expires_at: Math.floor(Date.now() / 1000) + 3600,
      token_type: 'bearer',
      user: { id: userId, email: 'engaged@example.com', app_metadata: { provider: 'google' } },
    };
    window.localStorage.setItem('flightacademy.auth.token', JSON.stringify(sessionPayload));
    window.sessionStorage.setItem(
      'auth-storage',
      JSON.stringify({
        state: {
          user: sessionPayload.user,
        },
        version: 0,
      }),
    );
  }, { userId: MOCK_USER_ID });
}

test.describe('welcome onboarding regression (mock auth, production build)', () => {
  test.beforeEach(async ({ page }) => {
    await installMockSupabaseAuth(page);
  });

  test('post-auth navigation keeps XP holders off /welcome and HOME renders', async ({ page }) => {
    await page.goto('/auth');
    await expect(page).toHaveURL(/\/($|\?)/, { timeout: 30_000 });
    await expect(page).not.toHaveURL(/\/welcome/);
    await expect(page.getByText('ページを表示できませんでした')).toHaveCount(0);
    await expect(page.getByText('今日の1手')).toBeVisible({ timeout: 30_000 });
  });

  test('logged-in learner can open quiz and articles without error boundary', async ({ page }) => {
    await page.goto('/auth');
    await expect(page).toHaveURL(/\/($|\?)/, { timeout: 30_000 });

    await page.goto('/quiz');
    await expect(page).not.toHaveURL(/\/welcome/);
    await expect(page.getByText('ページを表示できませんでした')).toHaveCount(0);

    await page.goto('/articles');
    await expect(page).not.toHaveURL(/\/welcome/);
    await expect(page.getByText('ページを表示できませんでした')).toHaveCount(0);
  });
});
