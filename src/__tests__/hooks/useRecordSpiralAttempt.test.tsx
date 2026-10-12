import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const mockCallRecordAttempt = vi.fn();

vi.mock('../../utils/spiralLmsApi', () => ({
  callRecordAttempt: (...args: unknown[]) => mockCallRecordAttempt(...args),
}));

vi.mock('../../stores/authStore', () => ({
  useAuthStore: vi.fn(),
}));

import { useRecordSpiralAttempt } from '../../hooks/useRecordSpiralAttempt';
import { useAuthStore } from '../../stores/authStore';

const mockUseAuthStore = vi.mocked(useAuthStore);

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0, mutations: { retry: false } } },
  });
  return ({ children }: { children: React.ReactNode }) =>
    React.createElement(QueryClientProvider, { client: queryClient }, children);
}

describe('useRecordSpiralAttempt', () => {
  const rpcResponse = {
    success: true,
    idempotent: false,
    attempt_id: 'attempt-1',
    passed: true,
    node_id: 'L1-Q1-01',
    node_status: 'IN_PROGRESS',
    content_slug: 'slug-a',
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv('MODE', 'development');
    vi.stubEnv('DEV', true);
    vi.stubEnv('VITE_SPIRAL_LMS_ENABLED', 'true');
    mockUseAuthStore.mockImplementation((selector) =>
      selector({ user: { id: 'user-1' } } as never),
    );
    mockCallRecordAttempt.mockResolvedValue(rpcResponse);
    vi.stubGlobal('crypto', {
      randomUUID: vi.fn(() => '11111111-1111-4111-8111-111111111111'),
    });
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it('sends record_attempt with a generated client_attempt_id', async () => {
    const { result } = renderHook(() => useRecordSpiralAttempt(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      await result.current.recordAttemptAsync({
        nodeId: 'L1-Q1-01',
        attemptKind: 'content_view',
        contentSlug: 'slug-a',
        score: 100,
      });
    });

    expect(mockCallRecordAttempt).toHaveBeenCalledWith({
      nodeId: 'L1-Q1-01',
      attemptKind: 'content_view',
      clientAttemptId: '11111111-1111-4111-8111-111111111111',
      contentSlug: 'slug-a',
      score: 100,
    });
  });

  it('reuses client_attempt_id on retry', async () => {
    mockCallRecordAttempt
      .mockRejectedValueOnce(new Error('network'))
      .mockResolvedValueOnce(rpcResponse);

    const { result } = renderHook(() => useRecordSpiralAttempt(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      await result.current
        .recordAttemptAsync({
          nodeId: 'L1-Q1-01',
          attemptKind: 'mini_quiz',
          score: 90,
        })
        .catch(() => undefined);
    });

    await act(async () => {
      result.current.retryRecordAttempt();
    });

    await waitFor(() => {
      expect(mockCallRecordAttempt).toHaveBeenCalledTimes(2);
    });

    const firstId = mockCallRecordAttempt.mock.calls[0][0].clientAttemptId;
    const secondId = mockCallRecordAttempt.mock.calls[1][0].clientAttemptId;
    expect(firstId).toBe(secondId);
  });

  it('throws when feature flag is off', async () => {
    vi.stubEnv('VITE_SPIRAL_LMS_ENABLED', '');

    const { result } = renderHook(() => useRecordSpiralAttempt(), {
      wrapper: createWrapper(),
    });

    await expect(
      result.current.recordAttemptAsync({
        nodeId: 'L1-Q1-01',
        attemptKind: 'content_view',
        contentSlug: 'slug-a',
        score: 100,
      }),
    ).rejects.toThrow('spiral_lms_disabled');
  });
});
