import { ArticleFilterDrawer } from '@/pages/articles/components/ArticleFilterDrawer';
import { PublicUserBadgesPanel } from '@/components/learning/PublicUserBadgesPanel';
import { QuizFilterDrawer } from '@/pages/test/components/QuizFilterDrawer';
import ImageComponent from '@/components/mdx/ImageComponent';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

vi.mock('@/utils/cohortApi', () => ({
  fetchPublicUserBadges: vi.fn().mockResolvedValue({ badges: [], error: null }),
}));

describe('modal dialog accessibility', () => {
  it('ArticleFilterDrawer exposes dialog semantics and closes with Escape', () => {
    const onClose = vi.fn();
    render(
      <ArticleFilterDrawer
        isOpen
        onClose={onClose}
        selectedTags={[]}
        availableTags={['tag-a']}
        status="all"
        onTagsChange={vi.fn()}
        onStatusChange={vi.fn()}
      />,
    );

    const dialog = screen.getByRole('dialog', { name: '詳細フィルタ' });
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    fireEvent.keyDown(document, { key: 'Escape', code: 'Escape' });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('QuizFilterDrawer closes when backdrop is clicked', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(
      <QuizFilterDrawer
        open
        state={{
          tab: 'subject',
          exam: 'all',
          mode: 'practice',
          count: 10,
          subject: null,
        }}
        filtersLocked={false}
        onClose={onClose}
        onExamChange={vi.fn()}
        onModeChange={vi.fn()}
        onCountChange={vi.fn()}
        questionCountOptions={[10, 20]}
      />,
    );

    expect(screen.getByRole('dialog', { name: '詳細設定' })).toHaveAttribute('aria-modal', 'true');
    await user.click(screen.getByRole('button', { name: 'フィルタを閉じる' }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('PublicUserBadgesPanel names the dialog and traps initial focus', async () => {
    render(
      <PublicUserBadgesPanel userId="u1" displayName="テスト飛行士" onClose={vi.fn()} />,
    );

    await waitFor(() => {
      expect(screen.getByRole('dialog', { name: 'テスト飛行士 のバッジ' })).toBeInTheDocument();
    });
    await waitFor(() => {
      expect(screen.getByRole('button', { name: '閉じる' })).toHaveFocus();
    });
  });

  it('ImageComponent lightbox opens with dialog semantics', async () => {
    const user = userEvent.setup();
    render(<ImageComponent src="/test.png" alt="テスト画像" />);

    await user.click(screen.getByRole('button', { name: /テスト画像/ }));
    const dialog = await screen.findByRole('dialog', { name: 'テスト画像' });
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    fireEvent.keyDown(document, { key: 'Escape', code: 'Escape' });
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });
});