import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const mockFetchNodes = vi.fn();
const mockFetchProgress = vi.fn();

vi.mock('../../utils/spiralLmsApi', () => ({
  fetchSpiralLmsNodes: (...args: unknown[]) => mockFetchNodes(...args),
  fetchSpiralLmsUserProgress: (...args: unknown[]) => mockFetchProgress(...args),
}));

vi.mock('../../stores/authStore', () => ({
  useAuthStore: vi.fn(),
}));

import { useSpiralLms } from '../../hooks/useSpiralLms';
import { useAuthStore } from '../../stores/authStore';

const mockUseAuthStore = vi.mocked(useAuthStore);

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 } },
  });
  return ({ children }: { children: React.ReactNode }) =>
    React.createElement(QueryClientProvider, { client: queryClient }, children);
}

describe('useSpiralLms', () => {
  const fixedNow = new Date('2026-10-12T12:00:00.000Z');

  beforeEach(() => {
    vi.clearAllMocks();
    mockFetchNodes.mockResolvedValue([
      {
        id: 'L1-Q1-01',
        title: 'Node',
        quadrant: 1,
        z_level: 1,
        sort_order: 1,
        passing_score: 80,
        unlock_config: {},
        is_published: true,
        opens_at: '2026-10-11T00:00:00.000Z',
        created_at: '2026-10-01T00:00:00.000Z',
        updated_at: '2026-10-01T00:00:00.000Z',
        opensAtLocked: false,
        prerequisites: [],
        contents: [],
      },
    ]);
    mockFetchProgress.mockResolvedValue({
      'L1-Q1-01': {
        user_id: 'user-1',
        node_id: 'L1-Q1-01',
        status: 'LOCKED',
        attempts: 0,
        last_attempt_at: null,
        mastered_at: null,
        updated_at: '2026-10-01T00:00:00.000Z',
        opensAtLocked: false,
        effectiveStatus: 'LOCKED',
      },
    });
    mockUseAuthStore.mockImplementation((selector) =>
      selector({ user: { id: 'user-1' } } as never),
    );
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('does not fetch when feature flag is off', async () => {
    vi.stubEnv('MODE', 'development');
    vi.stubEnv('DEV', true);
    vi.stubEnv('VITE_SPIRAL_LMS_ENABLED', '');

    const { result } = renderHook(() => useSpiralLms(fixedNow), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(mockFetchNodes).not.toHaveBeenCalled();
    expect(result.current.nodes).toEqual([]);
    expect(result.current.progressByNodeId).toEqual({});
    expect(result.current.isFeatureEnabled).toBe(false);
  });

  it('loads nodes and progress when enabled and signed in', async () => {
    vi.stubEnv('MODE', 'development');
    vi.stubEnv('DEV', true);
    vi.stubEnv('VITE_SPIRAL_LMS_ENABLED', 'true');

    const { result } = renderHook(() => useSpiralLms(fixedNow), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.nodes).toHaveLength(1);
    });

    expect(mockFetchNodes).toHaveBeenCalledWith(fixedNow);
    expect(mockFetchProgress).toHaveBeenCalledWith(
      'user-1',
      { 'L1-Q1-01': '2026-10-11T00:00:00.000Z' },
      fixedNow,
    );
    expect(result.current.progressByNodeId['L1-Q1-01']?.status).toBe('LOCKED');
    expect(result.current.progressByNodeId['L1-Q1-01']?.effectiveStatus).toBe('AVAILABLE');
  });

  it('skips progress fetch when logged out', async () => {
    vi.stubEnv('MODE', 'development');
    vi.stubEnv('DEV', true);
    vi.stubEnv('VITE_SPIRAL_LMS_ENABLED', 'true');
    mockUseAuthStore.mockImplementation((selector) => selector({ user: null } as never));

    const { result } = renderHook(() => useSpiralLms(fixedNow), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.nodes).toHaveLength(1);
    });

    expect(mockFetchProgress).not.toHaveBeenCalled();
    expect(result.current.progressByNodeId).toEqual({});
  });
});
