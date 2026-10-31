import type { DashboardMetrics } from '../types/dashboard';

export type DashboardProgressOptions = {
  /** profiles.xp_points — HOME は includeSocial:false のため RPC XP と併用 */
  xpPoints?: number | null;
};

/**
 * ログイン HOME の「最初の一歩」CTA を隠すかどうか。
 * クイズ・記事完了・学習時間・継続・XP・読みかけ記事のいずれかがあれば true。
 */
export function hasDashboardLearningProgress(
  metrics: DashboardMetrics,
  options?: DashboardProgressOptions,
): boolean {
  const xpFromProfile = options?.xpPoints ?? 0;
  const xpFromBenchmark = metrics.xpBenchmark?.xpPoints ?? 0;
  const xp = Math.max(xpFromProfile, xpFromBenchmark);

  if (xp > 0) return true;
  if (metrics.overallProgressPct > 0) return true;
  if (metrics.streakDays > 0) return true;
  if (metrics.todayStudyMinutes > 0 || metrics.weeklyStudyMinutes > 0) return true;
  if (metrics.testTotalAttempts > 0) return true;
  if (metrics.nextLesson != null) return true;

  return false;
}
