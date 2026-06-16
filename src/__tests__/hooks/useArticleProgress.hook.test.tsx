import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';

const mockCompleteMissionByAction = vi.fn().mockResolvedValue(undefined);
const mockInvalidateQueries = vi.fn().mockResolvedValue(undefined);

vi.mock('@tanstack/react-query', () => ({
  useQueryClient: vi.fn(() => ({
    invalidateQueries: mockInvalidateQueries,
  })),
}));

vi.mock('../../hooks/useAuth', () => ({
  useAuth: vi.fn(),
}));

vi.mock('../../hooks/useGamification', () => ({
  useGamification: vi.fn(() => ({
    completeMissionByAction: mockCompleteMissionByAction,
    profile: { completed_missions: [], rank: undefined as string | undefined },
    rankProgress: 0,
  })),
}));

const mockCheckRanksForContent = vi.fn().mockResolvedValue([]);
const mockRefreshRanks = vi.fn();

vi.mock('../../hooks/usePPLRanks', () => ({
  usePPLRanks: vi.fn(() => ({
    checkRanksForContent: mockCheckRanksForContent,
    refreshRanks: mockRefreshRanks,
  })),
}));

vi.mock('../../utils/streak', () => ({
  syncStreakToUserLearningProfile: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('../../utils/articlesIndex', () => ({
  buildArticleIndex: vi.fn(),
}));

import type { User } from '@supabase/supabase-js';

import type { UseAuthReturn } from '../../hooks/useAuth';
import { useAuth } from '../../hooks/useAuth';
import { useGamification } from '../../hooks/useGamification';
import { usePPLRanks } from '../../hooks/usePPLRanks';
import { useArticleProgress } from '../../hooks/useArticleProgress';
import { supabase } from '../../utils/supabase';
import { buildArticleIndex } from '../../utils/articlesIndex';

const mockUseAuth = vi.mocked(useAuth);
const mockUseGamification = vi.mocked(useGamification);
const mockUsePPLRanks = vi.mocked(usePPLRanks);
const mockBuildArticleIndex = vi.mocked(buildArticleIndex);

function baseAuth(overrides: Partial<UseAuthReturn> = {}): UseAuthReturn {
  const user = overrides.user ?? null;
  return {
    user,
    profile: overrides.profile ?? null,
    loading: overrides.loading ?? false,
    initialized: overrides.initialized ?? true,
    signIn: overrides.signIn ?? vi.fn(),
    signUp: overrides.signUp ?? vi.fn(),
    signInWithGoogle: overrides.signInWithGoogle ?? vi.fn(),
    signInWithOtp: overrides.signInWithOtp ?? vi.fn(),
    signOut: overrides.signOut ?? vi.fn(),
    refreshSession: overrides.refreshSession ?? vi.fn(),
    isAuthenticated: overrides.isAuthenticated ?? !!user,
    isLoading: overrides.isLoading ?? false,
    ...overrides,
  };
}

function installStandardSupabaseMock(opts: {
  progressRows: Array<Record<string, unknown>>;
  profile?: { current_streak_days?: number };
  upsertFn?: ReturnType<typeof vi.fn>;
}) {
  const upsert = opts.upsertFn ?? vi.fn(() => Promise.resolve({ error: null }));

  vi.spyOn(supabase, 'from').mockImplementation((table: string) => {
    if (table === 'learning_progress') {
      return {
        select: () => ({
          eq: () => Promise.resolve({ data: opts.progressRows, error: null }),
        }),
        upsert,
      } as unknown as ReturnType<(typeof supabase)['from']>;
    }
    if (table === 'user_learning_profiles') {
      return {
        select: () => ({
          eq: () => ({
            maybeSingle: () =>
              Promise.resolve({
                data: opts.profile ?? null,
                error: null,
              }),
          }),
        }),
      } as unknown as ReturnType<(typeof supabase)['from']>;
    }
    return {} as unknown as ReturnType<(typeof supabase)['from']>;
  });

  return { upsert };
}

describe('useArticleProgress hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockBuildArticleIndex.mockResolvedValue([
      {
        filename: '3.5.1_Foo',
        meta: {
          title: 'Sample',
          slug: '/articles/sample-cpl',
          tags: ['計器'],
        },
        loader: async () => ({ default: () => null }),
      },
    ]);

    mockUseGamification.mockReturnValue({
      completeMissionByAction: mockCompleteMissionByAction,
      profile: { completed_missions: [], rank: undefined },
      rankProgress: 0,
    });

    mockUsePPLRanks.mockReturnValue({
      checkRanksForContent: mockCheckRanksForContent,
      refreshRanks: mockRefreshRanks,
    });

    mockUseAuth.mockReturnValue(baseAuth());
  });

  it('shows demo stats when user is absent', async () => {
    mockUseAuth.mockReturnValue(baseAuth({ user: null, isAuthenticated: false }));

    const { result } = renderHook(() => useArticleProgress());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.isDemo).toBe(true);
    expect(result.current.error).toBeNull();
    expect(result.current.stats?.totalArticles).toBe(26);
    expect(result.current.stats?.readArticles).toBe(12);
  });

  it('loads Supabase progress and stats for logged-in user', async () => {
    const user = { id: 'u-abc' } as User;

    mockUseAuth.mockReturnValue(baseAuth({ user, isAuthenticated: true }));

    installStandardSupabaseMock({
      progressRows: [
        {
          content_id: '/articles/sample-cpl',
          user_id: user.id,
          last_read_at: '2026-05-01T10:00:00Z',
          progress_percentage: 100,
          completed: true,
          last_position: 0,
        },
      ],
      profile: { current_streak_days: 4 },
    });

    const { result } = renderHook(() => useArticleProgress());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.isDemo).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.stats?.completedArticles).toBe(1);
    expect(result.current.stats?.totalArticles).toBe(1);
    expect(result.current.stats?.readArticles).toBe(1);
    expect(result.current.stats?.streakDays).toBe(4);
  });

  it('sets error state when learning_progress select fails', async () => {
    mockUseAuth.mockReturnValue(baseAuth({ user: { id: 'u-err' } as User, isAuthenticated: true }));

    vi.spyOn(supabase, 'from').mockImplementation((table: string) => {
      if (table === 'learning_progress') {
        return {
          select: () => ({
            eq: () => Promise.resolve({ data: null, error: { message: 'denied', code: '42501' } }),
          }),
        } as unknown as ReturnType<(typeof supabase)['from']>;
      }
      return {} as unknown as ReturnType<(typeof supabase)['from']>;
    });

    const { result } = renderHook(() => useArticleProgress());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.error?.message.length).toBeGreaterThan(0);
  });

  it('does not persist updateArticleProgress when unauthenticated', async () => {
    mockUseAuth.mockReturnValue(baseAuth({ user: null, isAuthenticated: false }));

    const fromSpy = vi.spyOn(supabase, 'from');

    const { result } = renderHook(() => useArticleProgress());

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    const callsBeforeUpdate = fromSpy.mock.calls.length;

    await act(async () => {
      await result.current.updateArticleProgress('/articles/sample-cpl', {
        scrollProgress: 42,
      });
    });

    expect(fromSpy.mock.calls.length).toBe(callsBeforeUpdate);
  });

  it('skips upsert when scroll progress rounding is unchanged', async () => {
    const user = { id: 'u-upsert' } as User;

    mockUseAuth.mockReturnValue(baseAuth({ user, isAuthenticated: true }));

    const progRow = {
      content_id: '/articles/sample-cpl',
      user_id: user.id,
      last_read_at: '2026-05-01T10:00:00Z',
      progress_percentage: 50,
      completed: false,
      last_position: 0,
    };

    const { upsert } = installStandardSupabaseMock({
      progressRows: [progRow],
    });

    const { result } = renderHook(() => useArticleProgress());

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    upsert.mockClear();

    await act(async () => {
      await result.current.updateArticleProgress('/articles/sample-cpl', { scrollProgress: 50.2 });
    });
    expect(upsert).not.toHaveBeenCalled();

    await act(async () => {
      await result.current.updateArticleProgress('/articles/sample-cpl', { scrollProgress: 61 });
    });
    expect(upsert).toHaveBeenCalled();
  });

  it('refreshProgress rebuilds local progress from Supabase', async () => {
    const user = { id: 'u-refresh' } as User;

    mockUseAuth.mockReturnValue(baseAuth({ user, isAuthenticated: true }));

    const row = {
      content_id: '/articles/sample-cpl',
      last_read_at: '2026-06-01T12:00:00Z',
      progress_percentage: 80,
      completed: false,
      last_position: 10,
    };

    const progressRows: typeof row[] = [{ ...row }];

    const upsert = vi.fn(() => Promise.resolve({ error: null }));

    vi.spyOn(supabase, 'from').mockImplementation((table: string) => {
      if (table === 'learning_progress') {
        return {
          select: () => ({
            eq: () => Promise.resolve({ data: progressRows, error: null }),
          }),
          upsert,
        } as unknown as ReturnType<(typeof supabase)['from']>;
      }
      if (table === 'user_learning_profiles') {
        return {
          select: () => ({
            eq: () => ({
              maybeSingle: () =>
                Promise.resolve({
                  data: { current_streak_days: 1 },
                  error: null,
                }),
            }),
          }),
        } as unknown as ReturnType<(typeof supabase)['from']>;
      }
      return {} as unknown as ReturnType<(typeof supabase)['from']>;
    });

    const { result } = renderHook(() => useArticleProgress());

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.getArticleProgress('/articles/sample-cpl')?.scrollProgress).toBe(80);

    progressRows[0] = { ...row, progress_percentage: 33 };

    vi.spyOn(supabase, 'from').mockImplementation((table: string) => {
      if (table === 'learning_progress') {
        return {
          select: () => ({
            eq: () => Promise.resolve({ data: progressRows, error: null }),
          }),
          upsert,
        } as unknown as ReturnType<(typeof supabase)['from']>;
      }
      if (table === 'user_learning_profiles') {
        return {
          select: () => ({
            eq: () => ({
              maybeSingle: () =>
                Promise.resolve({
                  data: { current_streak_days: 2 },
                  error: null,
                }),
            }),
          }),
        } as unknown as ReturnType<(typeof supabase)['from']>;
      }
      return {} as unknown as ReturnType<(typeof supabase)['from']>;
    });

    await act(async () => {
      await result.current.refreshProgress();
    });

    expect(result.current.getArticleProgress('/articles/sample-cpl')?.scrollProgress).toBe(33);
    expect(result.current.stats?.streakDays).toBe(2);
  });
});
