/**
 * 今日の学習タスク用型定義
 */

export type TaskType = 'review' | 'lesson' | 'weakness';

export interface DailyTask {
  /** タスクID */
  id: string;

  /** タスクタイプ */
  type: TaskType;

  /** タスクタイトル */
  title: string;

  /** 推定所要時間（分） */
  estimatedMinutes: number;

  /** 優先度スコア（高いほど優先） */
  priority: number;

  /** リンク先URL */
  linkTo: string;

  /** 完了状態（現時点では読み取り専用） */
  completed: boolean;
}

