/**
 * ダッシュボード用型定義
 * ダッシュボードの進捗データと表示状態を型安全に管理
 */

import type { UserRank } from './gamification';

/** RPC get_learning_xp_benchmark のクライアント向け形（population が十分なときのみ数値表示） */
export interface LearningXpBenchmark {
  xpPoints: number;
  populationN: number;
  /** XP>0 の母集団のうち、あなたより XP が厳密に低い人の割合（0–100） */
  percentile: number | null;
  rankTier: UserRank | null;
  cohortN: number | null;
  /** 同一 rank 帯（かつ XP>0）内での同上 */
  cohortPercentile: number | null;
}

/** RPC get_public_leaderboard の1行（任意参加のみ） */
export interface PublicLeaderboardEntry {
  displayName: string;
  xpPoints: number;
  rankTier: UserRank | null;
  position: number;
}

export interface DashboardMetrics {
  /** 全体進捗率 (0-100) - 完了したレッスン/記事の割合 */
  overallProgressPct: number;

  /** 模試正答率 (0-100) - テスト問題の正確性 */
  testAccuracyPct: number;

  /** 直近7日間の学習時間（分） */
  weeklyStudyMinutes: number;

  /** 連続学習日数 */
  streakDays: number;

  /** 次の推奨レッスン */
  nextLesson?: {
    id: string;
    title: string;
  };

  /** 弱点トピック（正答率が低いもの上位3件） */
  weakTopics: Array<{
    topic: string;
    accuracyPct: number;
  }>;

  /** 学習 XP の相対位置（RPC 失敗時は未設定） */
  xpBenchmark?: LearningXpBenchmark;

  /** 任意参加の公開ランキング（取得失敗時は空配列） */
  publicLeaderboard: PublicLeaderboardEntry[];
}

export interface LearningProgressSummary {
  /** 完了済みコンテンツ数 */
  completedCount: number;

  /** 全体コンテンツ数 */
  totalCount: number;

  /** 進捗率 (0-100) */
  progressPct: number;
}

export interface TestSummary {
  /** 総解答数 */
  totalAttempts: number;

  /** 正答数 */
  correctAttempts: number;

  /** 正答率 (0-100) */
  accuracyPct: number;

  /** 科目別正答率 */
  subjectBreakdown: Array<{
    subject: string;
    accuracyPct: number;
    attemptCount: number;
  }>;
}

export interface StudyTimeData {
  /** 今日の学習時間（分） */
  todayMinutes: number;

  /** 今週の学習時間（分） */
  weeklyMinutes: number;

  /** 今月の学習時間（分） */
  monthlyMinutes: number;
}

export interface StreakData {
  /** 現在の連続学習日数 */
  currentStreak: number;

  /** 最長連続学習日数 */
  longestStreak: number;

  /** 今日学習したかどうか */
  hasStudiedToday: boolean;
}

