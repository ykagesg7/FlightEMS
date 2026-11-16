import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { ArticleHubToolbar } from '@/pages/articles/components/ArticleHubToolbar';
import type { ArticleHubState } from '@/pages/articles/articleHubFilters';

const baseState: ArticleHubState = {
  view: 'articles',
  course: null,
  tab: 'continue',
  query: '',
  tags: [],
  status: 'all',
  sort: 'date',
};

describe('ArticleHubToolbar category tabs', () => {
  it('exposes tablist roles, aria-controls, and roving tabindex', () => {
    render(
      <ArticleHubToolbar
        state={baseState}
        visibleTabs={['continue', 'ppl', 'cpl']}
        tabCounts={{ continue: 3, ppl: 1, cpl: 2 }}
        onQueryChange={vi.fn()}
        onTabChange={vi.fn()}
        onSortChange={vi.fn()}
        onOpenFilters={vi.fn()}
        activeFilterCount={0}
      />,
    );

    expect(screen.getByRole('tablist', { name: '記事カテゴリ' })).toBeInTheDocument();

    const continueTab = screen.getByRole('tab', { name: /続きから/ });
    const pplTab = screen.getByRole('tab', { name: /PPL 基礎/ });

    expect(continueTab).toHaveAttribute('aria-selected', 'true');
    expect(pplTab).toHaveAttribute('aria-selected', 'false');
    expect(continueTab).toHaveAttribute('aria-controls', 'article-hub-panel-continue');
    expect(continueTab).toHaveAttribute('tabindex', '0');
    expect(pplTab).toHaveAttribute('tabindex', '-1');
  });

  it('changes tab on ArrowRight and jumps with Home/End', async () => {
    const user = userEvent.setup();
    const onTabChange = vi.fn();
    render(
      <ArticleHubToolbar
        state={baseState}
        visibleTabs={['continue', 'ppl', 'cpl']}
        tabCounts={{}}
        onQueryChange={vi.fn()}
        onTabChange={onTabChange}
        onSortChange={vi.fn()}
        onOpenFilters={vi.fn()}
        activeFilterCount={0}
      />,
    );

    const continueTab = screen.getByRole('tab', { name: /続きから/ });
    continueTab.focus();

    await user.keyboard('{ArrowRight}');
    expect(onTabChange).toHaveBeenLastCalledWith('ppl');

    onTabChange.mockClear();
    await user.keyboard('{End}');
    expect(onTabChange).toHaveBeenLastCalledWith('cpl');

    onTabChange.mockClear();
    await user.keyboard('{Home}');
    expect(onTabChange).toHaveBeenLastCalledWith('continue');
  });
});