/**
 * Gamification Types
 * Whisky Papa Wingman Program用の型定義
 */

export type UserRank =
  | 'fan'
  // PPL中間ランク（Phaseレベル）
  | 'ppl-aero-basics-phase1'
  | 'ppl-aero-basics-phase2'
  | 'ppl-aero-basics-master'
  | 'ppl-aero-performance-phase1'
  | 'ppl-aero-performance-phase2'
  | 'ppl-aero-performance-master'
  // PPL中間ランク（Sectionレベル）
  | 'ppl-aerodynamics-master'
  // PPL中間ランク（Categoryレベル）
  | 'ppl-engineering-master'
  // PPL最終ランク
  | 'ppl'
  // 上位ランク
  | 'wingman'
  | 'cpl'
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
    nextRank: 'ppl-aero-basics-phase1',
    nextRankXpRequired: 0, // 記事完了ベース
  },
  'ppl-aero-basics-phase1': {
    rank: 'ppl-aero-basics-phase1',
    displayName: 'PPL空力基礎初級',
    color: '#87CEEB', // スカイブルー
    icon: '📚',
    xpRequired: 0, // 記事完了ベース
    nextRank: 'ppl-aero-basics-phase2',
    nextRankXpRequired: 0,
  },
  'ppl-aero-basics-phase2': {
    rank: 'ppl-aero-basics-phase2',
    displayName: 'PPL空力基礎中級',
    color: '#9370DB', // ミディアムパープル
    icon: '📖',
    xpRequired: 0, // 記事完了ベース
    nextRank: 'ppl-aero-basics-master',
    nextRankXpRequired: 0,
  },
  'ppl-aero-basics-master': {
    rank: 'ppl-aero-basics-master',
    displayName: 'PPL空力基礎マスター',
    color: '#FFD700', // 金色
    icon: '👑',
    xpRequired: 0, // 記事完了ベース
    nextRank: 'ppl-aero-performance-phase1',
    nextRankXpRequired: 0,
  },
  'ppl-aero-performance-phase1': {
    rank: 'ppl-aero-performance-phase1',
    displayName: 'PPL性能基礎初級',
    color: '#87CEEB', // スカイブルー
    icon: '📊',
    xpRequired: 0, // 記事完了ベース
    nextRank: 'ppl-aero-performance-phase2',
    nextRankXpRequired: 0,
  },
  'ppl-aero-performance-phase2': {
    rank: 'ppl-aero-performance-phase2',
    displayName: 'PPL性能基礎中級',
    color: '#9370DB', // ミディアムパープル
    icon: '📈',
    xpRequired: 0, // 記事完了ベース
    nextRank: 'ppl-aero-performance-master',
    nextRankXpRequired: 0,
  },
  'ppl-aero-performance-master': {
    rank: 'ppl-aero-performance-master',
    displayName: 'PPL性能基礎マスター',
    color: '#FFD700', // 金色
    icon: '🏆',
    xpRequired: 0, // 記事完了ベース
    nextRank: 'ppl-aerodynamics-master',
    nextRankXpRequired: 0,
  },
  'ppl-aerodynamics-master': {
    rank: 'ppl-aerodynamics-master',
    displayName: 'PPL航空力学マスター',
    color: '#FF6347', // トマトレッド
    icon: '✈️',
    xpRequired: 0, // 記事完了ベース
    nextRank: 'ppl-engineering-master',
    nextRankXpRequired: 0,
  },
  'ppl-engineering-master': {
    rank: 'ppl-engineering-master',
    displayName: 'PPL航空工学マスター',
    color: '#FF1493', // ディープピンク
    icon: '🛩️',
    xpRequired: 0, // 記事完了ベース
    nextRank: 'ppl',
    nextRankXpRequired: 500,
  },
  ppl: {
    rank: 'ppl',
    displayName: '自家用操縦士',
    color: '#00CED1', // ダークターコイズ
    icon: '🎖️',
    xpRequired: 500, // PPL全記事読了で到達
    nextRank: 'wingman',
    nextRankXpRequired: 1200,
  },
  wingman: {
    rank: 'wingman',
    displayName: '僚機',
    color: '#FFD700', // 金色
    icon: '🎖️',
    xpRequired: 1200, // 更新
    nextRank: 'cpl',
    nextRankXpRequired: 1000,
  },
  cpl: {
    rank: 'cpl',
    displayName: '事業用操縦士',
    color: '#FF8C00', // ダークオレンジ
    icon: '✈️',
    xpRequired: 1000, // CPL全記事読了で到達
    nextRank: 'ace',
    nextRankXpRequired: 1500,
  },
  ace: {
    rank: 'ace',
    displayName: 'エース',
    color: '#FF6347', // トマトレッド
    icon: '⭐',
    xpRequired: 1500, // 更新
    nextRank: 'master',
    nextRankXpRequired: 2000,
  },
  master: {
    rank: 'master',
    displayName: 'マスター',
    color: '#FF1493', // ディープピンク
    icon: '👑',
    xpRequired: 2000, // 更新
    nextRank: 'legend',
    nextRankXpRequired: 2500,
  },
  legend: {
    rank: 'legend',
    displayName: 'レジェンド',
    color: '#8A2BE2', // ブルーバイオレット
    icon: '🌟',
    xpRequired: 2500, // 更新
  },
};

export interface MissionCompletionResult {
  success: boolean;
  xp_earned?: number;
  new_xp?: number;
  mission_title?: string;
  error?: string;
}

