/**
 * Gamification Types
 * Whisky Papa Wingman Program用の型定義
 */

export type UserRank =
  | 'fan'
  | 'spectator'
  | 'trainee'
  | 'student'
  | 'apprentice'
  | 'pilot'
  | 'wingman'
  | 'ace'
  | 'master'
  | 'legend';

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
  fan: {
    rank: 'fan',
    displayName: 'ファン',
    color: '#808080', // グレー
    icon: '👤',
    xpRequired: 0,
    nextRank: 'spectator',
    nextRankXpRequired: 100,
  },
  spectator: {
    rank: 'spectator',
    displayName: '観客',
    color: '#CD7F32', // 銅色
    icon: '👁️',
    xpRequired: 100,
    nextRank: 'trainee',
    nextRankXpRequired: 200,
  },
  trainee: {
    rank: 'trainee',
    displayName: '訓練生',
    color: '#C0C0C0', // 銀色
    icon: '✈️',
    xpRequired: 200,
    nextRank: 'student',
    nextRankXpRequired: 300,
  },
  student: {
    rank: 'student',
    displayName: '学生',
    color: '#87CEEB', // スカイブルー
    icon: '📚',
    xpRequired: 300,
    nextRank: 'apprentice',
    nextRankXpRequired: 400,
  },
  apprentice: {
    rank: 'apprentice',
    displayName: '見習い',
    color: '#9370DB', // ミディアムパープル
    icon: '🎓',
    xpRequired: 400,
    nextRank: 'pilot',
    nextRankXpRequired: 500,
  },
  pilot: {
    rank: 'pilot',
    displayName: 'パイロット',
    color: '#4169E1', // ロイヤルブルー
    icon: '🛩️',
    xpRequired: 500,
    nextRank: 'wingman',
    nextRankXpRequired: 600,
  },
  wingman: {
    rank: 'wingman',
    displayName: '僚機',
    color: '#FFD700', // 金色
    icon: '🎖️',
    xpRequired: 600,
    nextRank: 'ace',
    nextRankXpRequired: 700,
  },
  ace: {
    rank: 'ace',
    displayName: 'エース',
    color: '#FF6347', // トマトレッド
    icon: '⭐',
    xpRequired: 700,
    nextRank: 'master',
    nextRankXpRequired: 800,
  },
  master: {
    rank: 'master',
    displayName: 'マスター',
    color: '#FF1493', // ディープピンク
    icon: '👑',
    xpRequired: 800,
    nextRank: 'legend',
    nextRankXpRequired: 900,
  },
  legend: {
    rank: 'legend',
    displayName: 'レジェンド',
    color: '#8A2BE2', // ブルーバイオレット
    icon: '🌟',
    xpRequired: 900,
  },
};

export interface MissionCompletionResult {
  success: boolean;
  xp_earned?: number;
  new_xp?: number;
  mission_title?: string;
  error?: string;
}

