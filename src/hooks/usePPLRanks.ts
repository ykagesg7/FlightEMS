/**
 * PPL Rank System Hook
 * PPL Syllabus階層構造に基づくランクシステムの管理
 */

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../utils/supabase';
import { useAuth } from './useAuth';
import type { UserPPLRank, PPLRankDisplay } from '../types/pplRanks';

export interface UsePPLRanksResult {
  ranks: UserPPLRank[];
  rankDisplays: PPLRankDisplay[];
  isLoading: boolean;
  error: Error | null;
  refreshRanks: () => Promise<void>;
  checkRanksForContent: (contentId: string) => Promise<void>;
}

/**
 * ユーザーのPPLランクを管理するフック
 */
export const usePPLRanks = (): UsePPLRanksResult => {
  const { user } = useAuth();
  const [ranks, setRanks] = useState<UserPPLRank[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  /**
   * ランクデータを取得
   */
  const fetchRanks = useCallback(async () => {
    if (!user) {
      setRanks([]);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // データベース関数を使用してランクを取得
      const { data, error: fetchError } = await supabase.rpc('get_user_ppl_ranks', {
        p_user_id: user.id
      });

      if (fetchError) {
        throw fetchError;
      }

      // データをUserPPLRank型に変換
      const userRanks: UserPPLRank[] = (data || []).map((row: any) => ({
        id: '', // 関数からは返されないため空文字
        user_id: user.id,
        rank_code: row.rank_code,
        earned_at: row.earned_at,
        rank_name: row.rank_name,
        rank_level: row.rank_level,
        subject_code: row.subject_code,
        category_code: row.category_code,
        section_code: row.section_code,
        phase: row.phase,
        icon: row.icon,
        color: row.color
      }));

      setRanks(userRanks);
    } catch (err) {
      console.error('PPLランク取得エラー:', err);
      setError(err instanceof Error ? err : new Error('ランク取得に失敗しました'));
      setRanks([]);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  /**
   * 特定の記事完了時にランクをチェック
   */
  const checkRanksForContent = useCallback(async (contentId: string) => {
    if (!user) return;

    try {
      // データベース関数を使用してランクをチェック・付与
      const { data, error: checkError } = await supabase.rpc('check_and_award_ppl_ranks', {
        p_user_id: user.id,
        p_content_id: contentId
      });

      if (checkError) {
        console.error('ランクチェックエラー:', checkError);
        return;
      }

      // 新しいランクが付与された場合は再取得
      if (data && data.length > 0) {
        await fetchRanks();
        // ランク取得通知（オプション）
        return data as Array<{ rank_code: string; rank_name: string }>;
      }
    } catch (err) {
      console.error('ランクチェックエラー:', err);
    }
  }, [user, fetchRanks]);

  /**
   * ランク表示用データを生成
   */
  const rankDisplays: PPLRankDisplay[] = ranks.map(rank => ({
    rank_code: rank.rank_code,
    rank_name: rank.rank_name || '',
    rank_level: rank.rank_level || 1,
    icon: rank.icon || '📚',
    color: rank.color || '#87CEEB',
    earned_at: rank.earned_at,
    description: null
  }));

  // 初回読み込み
  useEffect(() => {
    fetchRanks();
  }, [fetchRanks]);

  return {
    ranks,
    rankDisplays,
    isLoading,
    error,
    refreshRanks: fetchRanks,
    checkRanksForContent
  };
};

