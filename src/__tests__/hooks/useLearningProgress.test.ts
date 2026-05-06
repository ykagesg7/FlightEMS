import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';

interface MockResponse {
  data: unknown;
  error: unknown;
}

let tableResponses: Record<string, MockResponse>;

/**
 * Supabase チェーンモック（select / delete 連鎖 + upsert は即時結果）
 */
function createMockChain(tableName: string) {
  const response = () =>
    tableResponses[tableName] ?? { data: null, error: null };

  const chain: Record<string, unknown> = {};

  for (const method of ['select', 'eq', 'order', 'delete'] as const) {
    chain[method] = () => chain;
  }

  chain.upsert = () => ({
    then: (resolve: (v: MockResponse) => void, reject?: (e: unknown) => void) =>
      Promise.resolve(response()).then(resolve, reject),
  });

  (chain as Record<string, unknown>).then = (
    resolve: (v: MockResponse) => void,
    reject?: (e: unknown) => void,
  ) => Promise.resolve(response()).then(resolve, reject);

  return chain;
}

const mockSyncStreak = vi.fn();

vi.mock('../../utils/supabase', () => ({
  default: {
    from: (tableName: string) => createMockChain(tableName),
  },
}));

vi.mock('../../utils/streak', () => ({
  syncStreakToUserLearningProfile: (...args: unknown[]) => mockSyncStreak(...args),
}));

vi.mock('../../hooks/useAuth', () => ({
  useAuth: vi.fn(),
}));

import { useLearningProgress } from '../../hooks/useLearningProgress';
import { useAuth } from '../../hooks/useAuth';

const mockUseAuth = vi.mocked(useAuth);

const sampleContent = {
  id: 'c1',
  title: 'Lesson',
  category: 'Nav',
  sub_category: null,
  description: null,
  order_index: 1,
  parent_id: null,
  content_type: 'mdx',
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-01-01T00:00:00Z',
  is_published: true,
};

const sampleProgressRow = {
  id: 'lp1',
  user_id: 'user-1',
  content_id: 'c1',
  completed: false,
  progress_percentage: 50,
  last_position: 0,
  last_read_at: '2026-01-02T00:00:00Z',
  read_count: 1,
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-01-02T00:00:00Z',
};

describe('useLearningProgress', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSyncStreak.mockResolvedValue(undefined);
    tableResponses = {
      learning_contents: { data: [sampleContent], error: null },
      learning_progress: { data: [], error: null },
    };
    mockUseAuth.mockReturnValue({
      user: { id: 'user-1', email: 't@example.com' },
    } as ReturnType<typeof useAuth>);
  });

  it('loads published learning contents and empty progress when user has no rows', async () => {
    const { result } = renderHook(() => useLearningProgress());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.learningContents).toHaveLength(1);
    expect(result.current.learningContents[0].id).toBe('c1');
    expect(result.current.userProgress).toEqual({});
    expect(result.current.error).toBeNull();
  });

  it('maps learning_progress rows by content_id', async () => {
    tableResponses.learning_progress = {
      data: [sampleProgressRow],
      error: null,
    };

    const { result } = renderHook(() => useLearningProgress());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.userProgress.c1).toMatchObject({
      content_id: 'c1',
      progress_percentage: 50,
    });
    expect(result.current.getProgress('c1')).toBe(50);
    expect(result.current.isCompleted('c1')).toBe(false);
    expect(result.current.getLastReadInfo('c1')).toEqual({
      position: 0,
      date: '2026-01-02T00:00:00Z',
    });
  });

  it('clears progress map when user is not logged in', async () => {
    mockUseAuth.mockReturnValue({ user: null } as ReturnType<typeof useAuth>);

    const { result } = renderHook(() => useLearningProgress());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.userProgress).toEqual({});
  });

  it('sets error when learning_contents query fails', async () => {
    tableResponses.learning_contents = { data: null, error: { message: 'fail' } };

    const { result } = renderHook(() => useLearningProgress());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.error).toBeInstanceOf(Error);
    expect(result.current.learningContents).toEqual([]);
  });

  it('returns helpers for categories', async () => {
    const { result } = renderHook(() => useLearningProgress());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.getContentsByCategory()).toHaveLength(1);
    expect(result.current.getContentsByCategory('Nav')).toHaveLength(1);
    expect(result.current.getContentsByCategory('Other')).toHaveLength(0);
    expect(result.current.getAllCategories()).toEqual(['Nav']);
  });

  it('markAsCompleted upserts and syncs streak', async () => {
    tableResponses.learning_progress = {
      data: [
        {
          ...sampleProgressRow,
          completed: true,
          progress_percentage: 100,
        },
      ],
      error: null,
    };

    const { result } = renderHook(() => useLearningProgress());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    await act(async () => {
      await result.current.markAsCompleted('c1');
    });

    expect(mockSyncStreak).toHaveBeenCalledWith('user-1');
    expect(result.current.userProgress.c1?.completed).toBe(true);
    expect(result.current.getProgress('c1')).toBe(100);
  });

  it('resetProgress removes row from local state', async () => {
    tableResponses.learning_progress = { data: [sampleProgressRow], error: null };

    const { result } = renderHook(() => useLearningProgress());

    await waitFor(() => {
      expect(result.current.userProgress.c1).toBeDefined();
    });

    await act(async () => {
      await result.current.resetProgress('c1');
    });

    expect(result.current.userProgress.c1).toBeUndefined();
  });

  it('updateProgress upserts when scroll delta is large enough', async () => {
    Object.defineProperty(document.body, 'scrollHeight', {
      configurable: true,
      value: 2000,
    });
    Object.defineProperty(window, 'innerHeight', {
      configurable: true,
      value: 500,
    });

    const { result } = renderHook(() => useLearningProgress());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    tableResponses.learning_progress = {
      data: [
        {
          ...sampleProgressRow,
          last_position: 800,
          progress_percentage: 20,
        },
      ],
      error: null,
    };

    await act(async () => {
      await result.current.updateProgress('c1', 800);
    });

    expect(result.current.userProgress.c1?.last_position).toBe(800);
  });

  it('updateProgress is no-op when not authenticated', async () => {
    mockUseAuth.mockReturnValue({ user: null } as ReturnType<typeof useAuth>);

    const { result } = renderHook(() => useLearningProgress());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    await act(async () => {
      await result.current.updateProgress('c1', 999);
    });

    expect(result.current.userProgress.c1).toBeUndefined();
  });
});
