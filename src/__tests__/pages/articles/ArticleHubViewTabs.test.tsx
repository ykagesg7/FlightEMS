import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import {
  ARTICLE_HUB_VIEW_PANEL_IDS,
  ARTICLE_HUB_VIEW_TAB_IDS,
  ArticleHubViewTabs,
} from '@/pages/articles/components/ArticleHubViewTabs';

describe('ArticleHubViewTabs', () => {
  it('exposes tablist roles and aria-selected for the active view', () => {
    const onViewChange = vi.fn();
    render(<ArticleHubViewTabs activeView="courses" onViewChange={onViewChange} />);

    expect(screen.getByRole('tablist', { name: '記事ハブ表示' })).toBeInTheDocument();

    const coursesTab = screen.getByRole('tab', { name: 'コース一覧' });
    const articlesTab = screen.getByRole('tab', { name: 'すべての記事' });

    expect(coursesTab).toHaveAttribute('aria-selected', 'true');
    expect(articlesTab).toHaveAttribute('aria-selected', 'false');
    expect(coursesTab).toHaveAttribute('id', ARTICLE_HUB_VIEW_TAB_IDS.courses);
    expect(articlesTab).toHaveAttribute('id', ARTICLE_HUB_VIEW_TAB_IDS.articles);
    expect(coursesTab).toHaveAttribute('aria-controls', ARTICLE_HUB_VIEW_PANEL_IDS.courses);
    expect(articlesTab).toHaveAttribute('aria-controls', ARTICLE_HUB_VIEW_PANEL_IDS.articles);
    expect(coursesTab).toHaveAttribute('tabindex', '0');
    expect(articlesTab).toHaveAttribute('tabindex', '-1');
  });

  it('moves selection with ArrowRight, Home, and End', async () => {
    const user = userEvent.setup();
    const onViewChange = vi.fn();
    render(<ArticleHubViewTabs activeView="courses" onViewChange={onViewChange} />);

    const coursesTab = screen.getByRole('tab', { name: 'コース一覧' });
    coursesTab.focus();

    await user.keyboard('{ArrowRight}');
    expect(onViewChange).toHaveBeenLastCalledWith('articles');

    onViewChange.mockClear();
    await user.keyboard('{Home}');
    expect(onViewChange).toHaveBeenLastCalledWith('courses');

    onViewChange.mockClear();
    await user.keyboard('{End}');
    expect(onViewChange).toHaveBeenLastCalledWith('articles');
  });
});