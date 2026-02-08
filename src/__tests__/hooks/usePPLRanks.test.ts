import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';

// --- モック定義 ---
const mockRpc = vi.fn();

vi.mock('../../utils/supabase', () => ({
  supabase: {
    rpc: (...args: unknown[]) => mockRpc(...args),
  },
}));

vi.mock('../../hooks/useAuth', () => ({
  useAuth: vi.fn(),
}));

import { usePPLRanks } from '../../hooks/usePPLRanks';
import { useAuth } from '../../hooks/useAuth';
import type { UseAuthReturn } from '../../hooks/useAuth';

const mockUseAuth = vi.mocked(useAuth);

// テスト用のモックユーザー
const mockUser = { id: 'user-123', email: 'test@example.com' };

// テスト用のRPCレスポンスデータ
const mockRpcResponse = [
  {
    rank_code: 'PPL_NAV_PHASE1',
    earned_at: '2026-01-15T00:00:00Z',
    rank_name: 'Navigation Phase 1',
    rank_level: 1,
    subject_code: 'NAV',
    category_code: null,
    section_code: null,
    phase: 1,
    icon: '🧭',
    color: '#4CAF50',
  },
  {
    rank_code: 'PPL_MET_PHASE1',
    earned_at: '2026-02-01T00:00:00Z',
    rank_name: 'Meteorology Phase 1',
    rank_level: 1,
    subject_code: 'MET',
    category_code: null,
    section_code: null,
    phase: 1,
    icon: null,
    color: null,
  },
];

describe('usePPLRanks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  /**
   * ヘルパー: useAuth のモックを設定
   */
  function setupAuth(user: { id: string; email: string } | null) {
    mockUseAuth.mockReturnValue({
      user,
      profile: null,
      loading: false,
      initialized: true,
      isAuthenticated: !!user,
      isLoading: false,
      signIn: vi.fn(),
      signUp: vi.fn(),
      signOut: vi.fn(),
      refreshSession: vi.fn(),
    } as unknown as UseAuthReturn);
  }

  it('should fetch and transform rank data when user is authenticated', async () => {
    setupAuth(mockUser);
    mockRpc.mockResolvedValueOnce({ data: mockRpcResponse, error: null });

    const { result } = renderHook(() => usePPLRanks());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.ranks).toHaveLength(2);
    expect(result.current.ranks[0]).toEqual({
      id: '',
      user_id: 'user-123',
      rank_code: 'PPL_NAV_PHASE1',
      earned_at: '2026-01-15T00:00:00Z',
      rank_name: 'Navigation Phase 1',
      rank_level: 1,
      subject_code: 'NAV',
      category_code: null,
      section_code: null,
      phase: 1,
      icon: '🧭',
      color: '#4CAF50',
    });
    expect(result.current.error).toBeNull();
  });

  it('should generate rank displays with default icon and color fallbacks', async () => {
    setupAuth(mockUser);
    mockRpc.mockResolvedValueOnce({ data: mockRpcResponse, error: null });

    const { result } = renderHook(() => usePPLRanks());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    const displays = result.current.rankDisplays;
    expect(displays).toHaveLength(2);

    // カスタムアイコンとカラーが設定されているランク
    expect(displays[0].icon).toBe('🧭');
    expect(displays[0].color).toBe('#4CAF50');
    expect(displays[0].rank_name).toBe('Navigation Phase 1');

    // アイコンとカラーが null のランク → デフォルト値
    expect(displays[1].icon).toBe('📚');
    expect(displays[1].color).toBe('#87CEEB');
  });

  it('should return empty ranks when user is not authenticated', async () => {
    setupAuth(null);

    const { result } = renderHook(() => usePPLRanks());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.ranks).toEqual([]);
    expect(result.current.rankDisplays).toEqual([]);
    expect(mockRpc).not.toHaveBeenCalled();
  });

  it('should set error and return empty ranks on RPC error', async () => {
    setupAuth(mockUser);
    mockRpc.mockResolvedValueOnce({
      data: null,
      error: { message: 'RPC failed', code: 'PGRST500' },
    });

    const { result } = renderHook(() => usePPLRanks());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.error).toBeTruthy();
    expect(result.current.ranks).toEqual([]);
  });

  it('should handle empty data response gracefully', async () => {
    setupAuth(mockUser);
    mockRpc.mockResolvedValueOnce({ data: [], error: null });

    const { result } = renderHook(() => usePPLRanks());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.ranks).toEqual([]);
    expect(result.current.rankDisplays).toEqual([]);
    expect(result.current.error).toBeNull();
  });

  it('should handle null data response gracefully', async () => {
    setupAuth(mockUser);
    mockRpc.mockResolvedValueOnce({ data: null, error: null });

    const { result } = renderHook(() => usePPLRanks());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.ranks).toEqual([]);
    expect(result.current.error).toBeNull();
  });

  it('should start in loading state', () => {
    setupAuth(mockUser);
    mockRpc.mockReturnValueOnce(new Promise(() => {})); // never resolves

    const { result } = renderHook(() => usePPLRanks());

    expect(result.current.isLoading).toBe(true);
  });

  it('should refresh ranks when refreshRanks is called', async () => {
    setupAuth(mockUser);
    mockRpc
      .mockResolvedValueOnce({ data: [mockRpcResponse[0]], error: null })
      .mockResolvedValueOnce({ data: mockRpcResponse, error: null });

    const { result } = renderHook(() => usePPLRanks());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.ranks).toHaveLength(1);

    // refreshRanks を呼び出し
    await act(async () => {
      await result.current.refreshRanks();
    });

    expect(result.current.ranks).toHaveLength(2);
    expect(mockRpc).toHaveBeenCalledTimes(2);
  });
});
