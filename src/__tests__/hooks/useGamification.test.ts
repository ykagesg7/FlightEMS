import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { UserRank } from '../../types/gamification';
import { RANK_INFO } from '../../types/gamification';

// --- テーブル別にレスポンスを管理するモック ---
interface MockResponse {
  data: unknown;
  error: unknown;
}

let tableResponses: Record<string, MockResponse>;

/**
 * Supabase チェーンモック
 * from(tableName) の呼び出しごとに tableResponses[tableName] から結果を返す
 */
function createMockChain(tableName: string) {
  const response = () =>
    tableResponses[tableName] || { data: null, error: null };

  const terminator = {
    single: () => Promise.resolve(response()),
    then: (resolve: (v: MockResponse) => void) => resolve(response()),
  };

  const chain: Record<string, (...args: unknown[]) => typeof chain & typeof terminator> = {};

  // 全てのチェーンメソッドが自身を返し、末端で response を返す
  const methods = ['select', 'insert', 'update', 'delete', 'eq', 'order', 'limit', 'single'] as const;
  for (const method of methods) {
    if (method === 'single') {
      (chain as Record<string, unknown>)[method] = () => Promise.resolve(response());
    } else {
      (chain as Record<string, unknown>)[method] = () => chain;
    }
  }

  // await supabase.from('x').select('*').eq('y', z) のように、
  // .single() なしで await される場合に対応
  (chain as Record<string, unknown>).then = (
    resolve: (v: MockResponse) => void,
    reject?: (e: unknown) => void
  ) => {
    return Promise.resolve(response()).then(resolve, reject);
  };

  return chain;
}

const mockRpc = vi.fn();

vi.mock('../../utils/supabase', () => ({
  supabase: {
    from: (tableName: string) => createMockChain(tableName),
    rpc: (...args: unknown[]) => mockRpc(...args),
  },
}));

vi.mock('../../stores/authStore', () => ({
  useAuthStore: vi.fn(),
}));

import { useGamification } from '../../hooks/useGamification';
import { useAuthStore } from '../../stores/authStore';

const mockUseAuthStore = vi.mocked(useAuthStore);

// テスト用の QueryClient ラッパー
function createTestWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
    },
  });

  return ({ children }: { children: React.ReactNode }) =>
    React.createElement(QueryClientProvider, { client: queryClient }, children);
}

const mockUser = { id: 'user-123', email: 'test@example.com' };

describe('useGamification', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    tableResponses = {};
  });

  /**
   * ヘルパー: useAuthStore のモックを設定
   */
  function setupAuthStore(user: { id: string; email: string } | null) {
    mockUseAuthStore.mockImplementation((selector: unknown) => {
      const state = { user };
      if (typeof selector === 'function') {
        return (selector as (s: typeof state) => unknown)(state);
      }
      return state;
    });
  }

  /**
   * ヘルパー: プロフィールクエリのレスポンスを設定
   */
  function setupProfileQuery(
    profileData: { id: string; rank: UserRank; xp_points: number } | null,
    completedMissions: Array<{
      user_id: string;
      mission_id: string;
      completed_at: string;
      xp_earned: number;
    }> = [],
    allMissions: Array<Record<string, unknown>> = [],
    profileError: { message: string } | null = null
  ) {
    tableResponses = {
      profiles: { data: profileData, error: profileError },
      user_missions: { data: completedMissions, error: null },
      missions: { data: allMissions, error: null },
    };
  }

  // ===== ランク進捗計算テスト =====
  describe('rank progress calculation', () => {
    it('should calculate XP-based rank progress correctly (ppl rank, midway)', async () => {
      setupAuthStore(mockUser);
      // ppl: xpRequired=500, nextRankXpRequired=1200
      // current XP = 800 → progress = (800-500)/(1200-500)*100 = 300/700*100 ≈ 42.86%
      setupProfileQuery({ id: 'user-123', rank: 'ppl', xp_points: 800 });

      const { result } = renderHook(() => useGamification(), {
        wrapper: createTestWrapper(),
      });

      await waitFor(() => {
        expect(result.current.profile).toBeDefined();
      });

      expect(result.current.rankInfo).toBeDefined();
      expect(result.current.rankInfo?.rank).toBe('ppl');

      // xpToNextRank = 1200 - 800 = 400
      expect(result.current.xpToNextRank).toBe(400);

      // rankProgress = (800-500)/(1200-500)*100 ≈ 42.86
      expect(result.current.rankProgress).toBeCloseTo(42.86, 1);
    });

    it('should return 0% progress for non-XP-based PPL intermediate ranks', async () => {
      setupAuthStore(mockUser);
      // ppl-aero-basics-phase1: xpRequired=0, nextRankXpRequired=0
      setupProfileQuery({
        id: 'user-123',
        rank: 'ppl-aero-basics-phase1',
        xp_points: 50,
      });

      const { result } = renderHook(() => useGamification(), {
        wrapper: createTestWrapper(),
      });

      await waitFor(() => {
        expect(result.current.profile).toBeDefined();
      });

      // XPベースでないランクは0%
      expect(result.current.rankProgress).toBe(0);
    });

    it('should return 100% progress for max rank (legend)', async () => {
      setupAuthStore(mockUser);
      // legend: xpRequired=2500, nextRank=undefined
      setupProfileQuery({ id: 'user-123', rank: 'legend', xp_points: 3000 });

      const { result } = renderHook(() => useGamification(), {
        wrapper: createTestWrapper(),
      });

      await waitFor(() => {
        expect(result.current.profile).toBeDefined();
      });

      expect(result.current.rankProgress).toBe(100);
      expect(result.current.xpToNextRank).toBe(0);
    });

    it('should calculate progress at 0% when XP equals current rank threshold', async () => {
      setupAuthStore(mockUser);
      // wingman: xpRequired=1200, nextRankXpRequired=1500
      setupProfileQuery({ id: 'user-123', rank: 'wingman', xp_points: 1200 });

      const { result } = renderHook(() => useGamification(), {
        wrapper: createTestWrapper(),
      });

      await waitFor(() => {
        expect(result.current.profile).toBeDefined();
      });

      // (1200-1200)/(1500-1200)*100 = 0%
      expect(result.current.rankProgress).toBe(0);
      expect(result.current.xpToNextRank).toBe(300);
    });

    it('should cap progress at 100% when XP exceeds next rank threshold', async () => {
      setupAuthStore(mockUser);
      // ace: xpRequired=1500, nextRankXpRequired=2000
      setupProfileQuery({ id: 'user-123', rank: 'ace', xp_points: 2500 });

      const { result } = renderHook(() => useGamification(), {
        wrapper: createTestWrapper(),
      });

      await waitFor(() => {
        expect(result.current.profile).toBeDefined();
      });

      // Math.min(100, (2500-1500)/(2000-1500)*100) = Math.min(100, 200) = 100
      expect(result.current.rankProgress).toBe(100);
      expect(result.current.xpToNextRank).toBe(0);
    });

    it('should handle fan rank (xp=0, next requires article completion)', async () => {
      setupAuthStore(mockUser);
      // fan: xpRequired=0, nextRankXpRequired=0
      setupProfileQuery({ id: 'user-123', rank: 'fan', xp_points: 0 });

      const { result } = renderHook(() => useGamification(), {
        wrapper: createTestWrapper(),
      });

      await waitFor(() => {
        expect(result.current.profile).toBeDefined();
      });

      expect(result.current.rankInfo?.displayName).toBe('ファン');
      expect(result.current.rankProgress).toBe(0);
    });
  });

  // ===== プロフィール取得テスト =====
  describe('profile fetching', () => {
    it('should return null profile when user is not authenticated', async () => {
      setupAuthStore(null);

      const { result } = renderHook(() => useGamification(), {
        wrapper: createTestWrapper(),
      });

      // enabled=false なので即座に完了
      await waitFor(() => {
        expect(result.current.isLoadingProfile).toBe(false);
      });

      expect(result.current.profile).toBeUndefined();
      expect(result.current.rankInfo).toBeNull();
      expect(result.current.rankProgress).toBe(0);
    });

    it('should fetch profile with missions data', async () => {
      setupAuthStore(mockUser);

      const completedMissions = [
        {
          user_id: 'user-123',
          mission_id: 'mission-1',
          completed_at: '2026-02-01T00:00:00Z',
          xp_earned: 50,
        },
      ];
      const allMissions = [
        {
          id: 'mission-1',
          title: 'First Quiz',
          required_action: 'quiz_pass',
          xp_reward: 50,
          is_active: true,
          mission_type: 'one_time',
        },
        {
          id: 'mission-2',
          title: 'Daily Read',
          required_action: 'article_read',
          xp_reward: 20,
          is_active: true,
          mission_type: 'daily',
        },
      ];

      setupProfileQuery(
        { id: 'user-123', rank: 'wingman', xp_points: 1300 },
        completedMissions,
        allMissions
      );

      const { result } = renderHook(() => useGamification(), {
        wrapper: createTestWrapper(),
      });

      await waitFor(() => {
        expect(result.current.profile).toBeDefined();
      });

      expect(result.current.profile?.rank).toBe('wingman');
      expect(result.current.profile?.xp_points).toBe(1300);

      // mission-1 は完了済みなので available_missions には含まれない
      expect(result.current.profile?.available_missions).toHaveLength(1);
      expect(result.current.profile?.available_missions[0].id).toBe('mission-2');
    });

    it('should handle profile fetch error gracefully', async () => {
      setupAuthStore(mockUser);
      setupProfileQuery(null, [], [], { message: 'DB Error' });

      const { result } = renderHook(() => useGamification(), {
        wrapper: createTestWrapper(),
      });

      // エラー時は profile が undefined のまま
      await waitFor(() => {
        expect(result.current.isLoadingProfile).toBe(false);
      });

      expect(result.current.profile).toBeUndefined();
      expect(result.current.rankInfo).toBeNull();
    });
  });

  // ===== RANK_INFO 整合性テスト =====
  describe('RANK_INFO consistency', () => {
    it('should have valid next rank references for all ranks with nextRank', () => {
      for (const [key, info] of Object.entries(RANK_INFO)) {
        if (info.nextRank) {
          expect(
            RANK_INFO[info.nextRank],
            `${key}.nextRank "${info.nextRank}" is not defined in RANK_INFO`
          ).toBeDefined();
        }
      }
    });

    it('should have ascending XP requirements for XP-based ranks', () => {
      const xpBasedRanks: [UserRank, number][] = [
        ['ppl', 500],
        ['wingman', 1200],
        ['ace', 1500],
        ['master', 2000],
        ['legend', 2500],
      ];

      for (let i = 1; i < xpBasedRanks.length; i++) {
        const [, prevXp] = xpBasedRanks[i - 1];
        const [currRank, currXp] = xpBasedRanks[i];
        expect(currXp).toBeGreaterThan(prevXp);
        expect(RANK_INFO[currRank].xpRequired).toBe(currXp);
      }
    });

    it('should have legend as the terminal rank (no nextRank)', () => {
      expect(RANK_INFO.legend.nextRank).toBeUndefined();
      expect(RANK_INFO.legend.nextRankXpRequired).toBeUndefined();
    });
  });
});
