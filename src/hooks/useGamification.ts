import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../stores/authStore';
import { supabase } from '../utils/supabase';
import type {
  UserRank,
  Mission,
  UserMission,
  UserGamificationProfile,
  RankInfo,
  MissionCompletionResult,
} from '../types/gamification';
import { RANK_INFO } from '../types/gamification';

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
        (completedMissions || []).map((m: UserMission) => m.mission_id)
      );

      const availableMissions = (allMissions || []).filter(
        (m: Mission) => !completedMissionIds.has(m.id)
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
  const rankProgress =
    rankInfo && rankInfo.nextRankXpRequired
      ? Math.min(
          100,
          ((profile?.xp_points || 0) / rankInfo.nextRankXpRequired) * 100
        )
      : 100;

  // ミッション達成処理
  const completeMissionMutation = useMutation({
    mutationFn: async (missionId: string): Promise<MissionCompletionResult> => {
      if (!user?.id) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase.rpc('complete_mission', {
        p_user_id: user.id,
        p_mission_id: missionId,
      });

      if (error) throw error;

      return data as MissionCompletionResult;
    },
    onSuccess: () => {
      // プロフィールを再取得
      queryClient.invalidateQueries({
        queryKey: ['gamification', 'profile', user?.id],
      });
    },
  });

  // アクションに基づいてミッションを達成
  const completeMissionByAction = async (action: string, metadata?: any) => {
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
      // デイリー/ウィークリーミッションの場合は、既に今日/今週達成済みかチェック
      if (mission.mission_type === 'daily' || mission.mission_type === 'weekly') {
        const { data: recentCompletion } = await supabase
          .from('user_missions')
          .select('completed_at')
          .eq('user_id', user.id)
          .eq('mission_id', mission.id)
          .order('completed_at', { ascending: false })
          .limit(1)
          .single();

        if (recentCompletion) {
          const completedAt = new Date(recentCompletion.completed_at);
          const now = new Date();
          const daysDiff = Math.floor(
            (now.getTime() - completedAt.getTime()) / (1000 * 60 * 60 * 24)
          );

          if (mission.mission_type === 'daily' && daysDiff < 1) continue;
          if (mission.mission_type === 'weekly' && daysDiff < 7) continue;
        }
      }

      // ミッションを達成
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

