import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { vi } from 'vitest';
import { ProfileHubSectionList } from '@/pages/profile/components/ProfileHubSectionList';
import { ProfileHubSidebar } from '@/pages/profile/components/ProfileHubSidebar';

describe('Profile Hub layout', () => {
  it('lists four sections on mobile', () => {
    render(
      <MemoryRouter>
        <ProfileHubSectionList onSelect={() => undefined} />
      </MemoryRouter>,
    );

    expect(screen.getByText('プロフィール')).toBeInTheDocument();
    expect(screen.getByText('学習・受験')).toBeInTheDocument();
    expect(screen.getByText('通知と公開')).toBeInTheDocument();
    expect(screen.getByText('アカウント')).toBeInTheDocument();
  });

  it('calls onSelect from sidebar', () => {
    const onSelect = vi.fn();
    render(
      <MemoryRouter>
        <ProfileHubSidebar
          activeSection="profile"
          completion={{ percent: 20, completedFields: [], nextAction: null }}
          onSelect={onSelect}
        />
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByRole('button', { name: '学習・受験' }));
    expect(onSelect).toHaveBeenCalledWith('learning');
  });
});
