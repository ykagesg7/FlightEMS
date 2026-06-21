import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { vi } from 'vitest';
import { InAppNotificationBell } from '@/components/learning/InAppNotificationBell';
import * as authStore from '@/stores/authStore';
import * as cohortApi from '@/utils/cohortApi';

vi.mock('@/stores/authStore');
vi.mock('@/utils/cohortApi', () => ({
  fetchUnreadInAppNotifications: vi.fn(),
  markInAppNotificationRead: vi.fn(),
}));

describe('InAppNotificationBell', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(authStore.useAuthStore).mockImplementation((selector) =>
      selector({ user: { id: 'user-1' } } as never),
    );
  });

  it('renders unread notifications and marks read on click', async () => {
    vi.mocked(cohortApi.fetchUnreadInAppNotifications).mockResolvedValue({
      data: [
        {
          id: 'n1',
          title: '今週の週次ミッション',
          body: 'Dashboard で確認しましょう。',
          link_url: '/dashboard',
        },
      ],
      error: null,
      count: null,
      status: 200,
      statusText: 'OK',
    } as Awaited<ReturnType<typeof cohortApi.fetchUnreadInAppNotifications>>);
    vi.mocked(cohortApi.markInAppNotificationRead).mockResolvedValue({
      data: null,
      error: null,
      count: null,
      status: 200,
      statusText: 'OK',
    } as Awaited<ReturnType<typeof cohortApi.markInAppNotificationRead>>);

    render(
      <MemoryRouter>
        <InAppNotificationBell />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getByRole('region', { name: 'お知らせ' })).toBeInTheDocument();
    });
    expect(screen.getByText('今週の週次ミッション')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('link', { name: '今週の週次ミッション' }));

    await waitFor(() => {
      expect(cohortApi.markInAppNotificationRead).toHaveBeenCalledWith('n1');
    });
  });
});
