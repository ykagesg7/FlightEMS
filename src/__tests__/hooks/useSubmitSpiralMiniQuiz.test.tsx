import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const mockFetchQuestions = vi.fn();
const mockSubmit = vi.fn();

vi.mock('../../utils/spiralLmsApi', () => ({
  fetchNodeMiniQuizQuestions: (...args: unknown[]) => mockFetchQuestions(...args),
  callSubmitMiniQuiz: (...args: unknown[]) => mockSubmit(...args),
}));

vi.mock('../../stores/authStore', () => ({
  useAuthStore: vi.fn(),
}));

import { useNodeMiniQuizQuestions, useSubmitSpiralMiniQuiz } from '../../hooks/useSubmitSpiralMiniQuiz';
import { useAuthStore } from '../../stores/authStore';

const mockUseAuthStore = vi.mocked(useAuthStore);

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0, mutations: { retry: false } } },
  });
  return ({ children }: { children: React.ReactNode }) =>
    React.createElement(QueryClientProvider, { client: queryClient }, children);
}

describe('useSubmitSpiralMiniQuiz', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv('MODE', 'development');
    vi.stubEnv('DEV', true);
    vi.stubEnv('VITE_SPIRAL_LMS_ENABLED', 'true');
    mockUseAuthStore.mockImplementation((selector) =>
      selector({ user: { id: 'user-1' } } as never),
    );
    mockFetchQuestions.mockResolvedValue([
      {
        id: 'q-1',
        node_id: 'SPIRAL-DEV-MINI',
        sort_order: 1,
        prompt: 'Sample?',
        question_type: 'single',
        options: [{ id: 'a', text: 'A' }],
      },
    ]);
    mockSubmit.mockResolvedValue({
      success: true,
      idempotent: false,
      attempt_id: 'att-1',
      passed: true,
      node_id: 'SPIRAL-DEV-MINI',
      node_status: 'IN_PROGRESS',
      content_slug: null,
      score: 100,
      results: [{ question_id: 'q-1', correct: true }] as const,
    });
    vi.stubGlobal('crypto', {
      randomUUID: vi.fn(() => '11111111-1111-4111-8111-111111111111'),
    });
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it('loads questions for a node when feature is enabled', async () => {
    const { result } = renderHook(() => useNodeMiniQuizQuestions('SPIRAL-DEV-MINI'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(mockFetchQuestions).toHaveBeenCalledWith('SPIRAL-DEV-MINI');
    expect(result.current.data?.[0]?.options[0]).toEqual({ id: 'a', text: 'A' });
  });

  it('submits answers via submit_mini_quiz RPC', async () => {
    const { result } = renderHook(() => useSubmitSpiralMiniQuiz('SPIRAL-DEV-MINI'), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      await result.current.submitMiniQuizAsync([
        { question_id: 'q-1', selected_option_ids: ['a'] },
      ]);
    });

    expect(mockSubmit).toHaveBeenCalledWith({
      nodeId: 'SPIRAL-DEV-MINI',
      clientAttemptId: '11111111-1111-4111-8111-111111111111',
      answers: [{ question_id: 'q-1', selected_option_ids: ['a'] }],
    });
  });
});
