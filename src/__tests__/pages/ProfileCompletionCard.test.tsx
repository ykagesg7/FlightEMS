import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { vi } from 'vitest';
import { ProfileCompletionCard } from '@/pages/profile/components/ProfileCompletionCard';

describe('ProfileCompletionCard', () => {
  it('shows progress and next action', () => {
    render(
      <MemoryRouter>
        <ProfileCompletionCard
          completion={{
            percent: 45,
            completedFields: ['username'],
            nextAction: {
              id: 'avatar_url',
              label: 'プロフィール画像を追加',
              href: '/profile?tab=public',
              benefit: 'メニューがパーソナルになります',
            },
          }}
        />
      </MemoryRouter>,
    );

    expect(screen.getByText(/コックピット準備 45%/)).toBeInTheDocument();
    expect(screen.getByText(/プロフィール画像を追加/)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: '設定する' })).toHaveAttribute('href', '/profile?tab=public');
  });

  it('renders nothing at 100%', () => {
    const { container } = render(
      <ProfileCompletionCard
        completion={{ percent: 100, completedFields: ['username'], nextAction: null }}
      />,
    );
    expect(container).toBeEmptyDOMElement();
  });
});
