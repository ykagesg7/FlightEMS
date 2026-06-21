import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ProfileCompletionStrip } from '@/pages/profile/components/ProfileCompletionStrip';

describe('ProfileCompletionStrip', () => {
  it('shows progress and next action link', () => {
    render(
      <MemoryRouter>
        <ProfileCompletionStrip
          completion={{
            percent: 45,
            completedFields: ['username'],
            nextAction: {
              id: 'avatar_url',
              label: 'プロフィール画像を追加',
              href: '/profile?tab=profile',
              benefit: 'メニューがパーソナルになります',
            },
          }}
        />
      </MemoryRouter>,
    );

    expect(screen.getByText(/コックピット準備 45%/)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /プロフィール画像を追加/ })).toHaveAttribute(
      'href',
      '/profile?tab=profile',
    );
  });

  it('renders nothing at 100%', () => {
    const { container } = render(
      <ProfileCompletionStrip
        completion={{ percent: 100, completedFields: ['username'], nextAction: null }}
      />,
    );
    expect(container).toBeEmptyDOMElement();
  });
});
