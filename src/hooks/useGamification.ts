import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../stores/authStore';
import type {
  Mission,
  MissionCompletionResult,
  RankInfo,
  UserGamificationProfile,
  UserMission,
  UserRank,
} from '../types/gamification';
import { RANK_INFO } from '../types/gamification';
import { supabase } from '../utils/supabase';

/**
 * useGamification Hook
 * ランク、XP、ミッション進捗の管理
 */
export const useGamification = () => {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();

  // ユーザーのゲーミフィケーションプロフィールを取得
  const { data: profile, isLoading: isLoadingProfile, isFetching: isFetchingProfile } = useQuery({
    queryKey: ['gamification', 'profile', user?.id],
    queryFn: async () => {
      if (!user?.id) {
        return null;
      }

      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('id, rank, xp_points')
        .eq('id', user.id)
        .single();

      if (profileError) {
        throw profileError;
      }

      const { data: completedMissions, error: missionsError } = await supabase
        .from('user_missions')
        .select('*')
        .eq('user_id', user.id);

      if (missionsError) throw missionsError;

      const { data: allMissions, error: allMissionsError } = await supabase
        .from('missions')
        .select('*')
        .eq('is_active', true)
        .order('xp_reward', { ascending: false });

      if (allMissionsError) throw allMissionsError;

      const completedMissionIds = new Set(
        (completedMissions || []).map((mission) => mission.mission_id)
      );

      const availableMissions = (allMissions || []).filter(
        (mission) =>
          mission.mission_type !== 'one_time' || !completedMissionIds.has(mission.id)
      );

      return {
        user_id: profileData.id,
        rank: profileData.rank as UserRank,
        xp_points: profileData.xp_points || 0,
        completed_missions: (completedMissions || []) as UserMission[],
        available_missions: availableMissions as Mission[],
      } as UserGamificationProfile;
    },
    enabled: !!user?.id,
    staleTime: 30 * 1000, // 30秒
  });

  // ランク情報を取得
  const rankInfo: RankInfo | null = profile && profile.rank
    ? RANK_INFO[profile.rank] || null
    : null;

  // 次のランクまでのXPを計算
  const xpToNextRank =
    rankInfo && rankInfo.nextRankXpRequired
      ? Math.max(0, rankInfo.nextRankXpRequired - (profile?.xp_points || 0))
      : 0;

  // ランクアップまでの進捗率を計算
  // 現在のランクの必要XPと次のランクの必要XPの差を考慮
  let rankProgress = 0;
  if (rankInfo) {
    const currentRankXpRequired = rankInfo.xpRequired || 0;
    const nextRankXpRequired = rankInfo.nextRankXpRequired || 0;
    const currentXp = profile?.xp_points || 0;

    // 次のランクまでの必要XPの差
    const xpRange = nextRankXpRequired - currentRankXpRequired;

    if (xpRange > 0) {
      // 現在のランクを超えているXP
      const xpOverCurrentRank = Math.max(0, currentXp - currentRankXpRequired);
      // 進捗率を計算（0-100%）
      rankProgress = Math.min(100, (xpOverCurrentRank / xpRange) * 100);
    } else if (nextRankXpRequired === 0 && currentRankXpRequired === 0) {
      // PPL中間ランクなど、XPベースでないランクの場合は0%
      rankProgress = 0;
    } else if (!rankInfo.nextRank) {
      // 最高ランクの場合は100%
      rankProgress = 100;
    }
  } else {
    rankProgress = 0;
  }

  // ミッション達成処理
  const completeMissionMutation = useMutation({
    mutationFn: async (missionId: string): Promise<MissionCompletionResult> => {
      if (!user?.id) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase.rpc('complete_mission', {
        p_mission_id: missionId,
      });

      if (error) throw error;

      return data as unknown as MissionCompletionResult;
    },
    onSuccess: () => {
      // プロフィールを再取得
      queryClient.invalidateQueries({
        queryKey: ['gamification', 'profile', user?.id],
      });
    },
  });

  // アクションに基づいてミッションを達成
  const completeMissionByAction = async (action: string) => {
    if (!user?.id) return;

    // 該当するミッションを取得
    const { data: missions, error } = await supabase
      .from('missions')
      .select('*')
      .eq('required_action', action)
      .eq('is_active', true);

    if (error || !missions || missions.length === 0) return;

    // 各ミッションをチェックして達成可能なものを完了
    for (const mission of missions) {
      // 達成条件と日次・週次の冪等性はサーバーで検証する。
      try {
        await completeMissionMutation.mutateAsync(mission.id);
      } catch (err) {
        console.error(`Failed to complete mission ${mission.id}:`, err);
      }
    }
  };

  return {
    profile,
    rankInfo,
    xpToNextRank,
    rankProgress,
    isLoadingProfile: isLoadingProfile || isFetchingProfile,
    completeMission: completeMissionMutation.mutateAsync,
    completeMissionByAction,
    isCompletingMission: completeMissionMutation.isPending,
  };
};

