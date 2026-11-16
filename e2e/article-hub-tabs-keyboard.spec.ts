import { expect, test } from '@playwright/test';

test.describe('Article hub tab keyboard (PR-H)', () => {
  test.beforeEach(async ({ page }) => {
    test.setTimeout(120_000);
    await page.goto('/articles?view=articles');
    await expect(page.getByRole('tablist', { name: '記事ハブ表示' })).toBeVisible({
      timeout: 90_000,
    });
  });

  test('view tabs: ArrowRight moves focus and selection without losing tab focus', async ({
    page,
  }) => {
    const coursesTab = page.getByRole('tab', { name: 'コース一覧', exact: true });
    const articlesTab = page.getByRole('tab', { name: 'すべての記事', exact: true });

    await expect(articlesTab).toHaveAttribute('aria-selected', 'true');
    await articlesTab.focus();
    await expect(articlesTab).toBeFocused();

    await page.keyboard.press('ArrowRight');
    await expect(coursesTab).toHaveAttribute('aria-selected', 'true');
    await expect(coursesTab).toBeFocused();

    await page.keyboard.press('Tab');
    const panel = page.locator('#article-hub-view-panel-courses');
    await expect(panel).toBeVisible();
    const dashboardBack = page.getByRole('link', { name: '学習ダッシュボードへ' });
    await expect(dashboardBack).not.toBeFocused();
    await expect(coursesTab).not.toBeFocused();
  });

  test('category tabs: ArrowRight and Home change selection; Tab enters panel', async ({
    page,
  }) => {
    const categoryList = page.getByRole('tablist', { name: '記事カテゴリ' });
    await expect(categoryList).toBeVisible();

    const tabCount = await categoryList.getByRole('tab').count();
    test.skip(tabCount < 2, 'category keyboard needs at least two visible tabs');

    const activeCategoryTab = categoryList.getByRole('tab', { selected: true });
    await activeCategoryTab.focus();
    await expect(activeCategoryTab).toBeFocused();

    await page.keyboard.press('ArrowRight');
    const nextTab = categoryList.getByRole('tab', { selected: true });
    await expect(nextTab).not.toHaveText(await activeCategoryTab.innerText());
    await expect(nextTab).toBeFocused();

    await page.keyboard.press('Home');
    const firstTab = categoryList.getByRole('tab').first();
    await expect(firstTab).toHaveAttribute('aria-selected', 'true');
    await expect(firstTab).toBeFocused();

    await page.keyboard.press('End');
    const lastTab = categoryList.getByRole('tab').last();
    await expect(lastTab).toHaveAttribute('aria-selected', 'true');
    await expect(lastTab).toBeFocused();

    await page.keyboard.press('Tab');
    await expect(page.getByRole('link', { name: '学習ダッシュボードへ' })).not.toBeFocused();
    await expect(page.locator('#article-hub-search')).toBeFocused();
  });
});