import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import { HelmetProvider } from 'react-helmet-async';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

vi.mock('../../../hooks/useSpiralLms', () => ({
  useSpiralLms: () => ({
    isFeatureEnabled: true,
    nodes: [],
    progressByNodeId: {},
    isLoading: false,
    isFetching: false,
    error: null,
    refetch: vi.fn(),
  }),
}));

vi.mock('../../../utils/spiralLmsApi', () => ({
  fetchSpiralContentSlugMap: vi.fn().mockResolvedValue({}),
}));

vi.mock('../../../stores/authStore', () => ({
  useAuthStore: vi.fn(),
}));

import SpiralLmsHubPage from '../../../dev/spiralLms/SpiralLmsHubPage';
import { useAuthStore } from '../../../stores/authStore';

const mockUseAuthStore = vi.mocked(useAuthStore);

function renderPage() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={['/dev/spiral-lms']}>
          <SpiralLmsHubPage />
        </MemoryRouter>
      </QueryClientProvider>
    </HelmetProvider>,
  );
}

describe('SpiralLmsHubPage', () => {
  beforeEach(() => {
    vi.stubEnv('MODE', 'development');
    vi.stubEnv('DEV', true);
    vi.stubEnv('VITE_SPIRAL_LMS_ENABLED', 'true');
    mockUseAuthStore.mockImplementation((selector) => selector({ user: null } as never));
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('shows only login prompt when signed out', async () => {
    renderPage();
    expect(screen.getByText('ログインして進捗を表示')).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.queryByText('整備点検一覧')).not.toBeInTheDocument();
      expect(screen.queryByRole('heading', { name: '今日の1単元' })).not.toBeInTheDocument();
    });
  });
});
