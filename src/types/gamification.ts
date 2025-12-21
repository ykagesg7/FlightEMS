/**
 * Gamification Types
 * Whisky Papa Wingman Program用の型定義
 */

export type UserRank = 'spectator' | 'trainee' | 'wingman';

export type MissionType = 'one_time' | 'daily' | 'weekly';

export type RequiredAction =
  | 'quiz_pass'
  | 'plan_create'
  | 'photo_post'
  | 'article_read'
  | 'lesson_complete'
  | 'test_complete';

export interface Mission {
  id: string;
  title: string;
  description: string | null;
  required_action: RequiredAction;
  xp_reward: number;
  min_rank_required: UserRank;
  mission_type: MissionType;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserMission {
  user_id: string;
  mission_id: string;
  completed_at: string;
  xp_earned: number;
}

export interface UserGamificationProfile {
  user_id: string;
  rank: UserRank;
  xp_points: number;
  completed_missions: UserMission[];
  available_missions: Mission[];
}

export interface RankInfo {
  rank: UserRank;
  displayName: string;
  color: string;
  icon: string;
  xpRequired: number;
  nextRank?: UserRank;
  nextRankXpRequired?: number;
}

export const RANK_INFO: Record<UserRank, RankInfo> = {
  spectator: {
    rank: 'spectator',
    displayName: '観客',
    color: '#CD7F32', // 銅色
    icon: '👁️',
    xpRequired: 0,
    nextRank: 'trainee',
    nextRankXpRequired: 300,
  },
  trainee: {
    rank: 'trainee',
    displayName: '訓練生',
    color: '#C0C0C0', // 銀色
    icon: '✈️',
    xpRequired: 300,
    nextRank: 'wingman',
    nextRankXpRequired: 1000,
  },
  wingman: {
    rank: 'wingman',
    displayName: '僚機',
    color: '#FFD700', // 金色
    icon: '🎖️',
    xpRequired: 1000,
  },
};

export interface MissionCompletionResult {
  success: boolean;
  xp_earned?: number;
  new_xp?: number;
  mission_title?: string;
  error?: string;
}

