/** Minimum active cohort members required to award weekly TOP3 badges. */
export const MIN_COHORT_FOR_TOP3 = 10;

export type ExamDateStatus = 'set' | 'undecided';
export type CohortPhase = 'active' | 'post_written' | 'alumni';
export type LicenseTarget = 'CPL' | 'PPL';

export interface UserCohortProfile {
  license_target: LicenseTarget | string | null;
  exam_date_status: ExamDateStatus | null;
  cohort_key: string | null;
  cohort_phase: CohortPhase | string | null;
  target_test_date: string | null;
  written_exam_completed_at: string | null;
  cohort_registered_at: string | null;
}

export interface CohortAnonymousStats {
  registered: boolean;
  cohort_key?: string;
  participant_count?: number;
  iso_week?: string;
  avg_accuracy?: number | null;
  median_effort?: number | null;
  week_index?: number;
  mission_title?: string;
  mission_description?: string;
  metric_type?: string;
  min_population_top3?: number;
}

export interface PublicUserBadge {
  achievement_type: string;
  achieved_at: string | null;
  metadata: Record<string, unknown> | null;
}

export function buildCohortKey(
  license: LicenseTarget,
  examYm: string | null,
  undecided: boolean,
): string {
  if (undecided) {
    return `${license.toUpperCase()}-UNDECIDED`;
  }
  if (!examYm?.trim()) {
    throw new Error('exam month required when not undecided');
  }
  return `${license.toUpperCase()}-${examYm.trim()}`;
}

export function formatCohortKeyLabel(cohortKey: string | null | undefined): string {
  if (!cohortKey) return '未登録';
  if (cohortKey.endsWith('-UNDECIDED')) {
    const license = cohortKey.split('-')[0] ?? 'CPL';
    return `${license} · 受験日未定`;
  }
  const parts = cohortKey.split('-');
  if (parts.length >= 3) {
    return `${parts[0]} · ${parts[1]}年${Number(parts[2])}月`;
  }
  return cohortKey;
}

export function formatCohortPhaseLabel(phase: string | null | undefined): string {
  switch (phase) {
    case 'active':
      return '学科試験準備中';
    case 'post_written':
      return '学科試験後（実技）';
    case 'alumni':
      return '卒業組';
    default:
      return '—';
  }
}

/** ISO week string for a Date in JST (YYYY-Www). */
export function getIsoWeekJst(date: Date = new Date()): string {
  const fmt = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Tokyo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  const [y, m, d] = fmt.format(date).split('-').map(Number);
  const utc = new Date(Date.UTC(y, m - 1, d));
  const day = utc.getUTCDay() || 7;
  utc.setUTCDate(utc.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(utc.getUTCFullYear(), 0, 1));
  const week = Math.ceil(((utc.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return `${utc.getUTCFullYear()}-W${String(week).padStart(2, '0')}`;
}

/** Previous ISO week (for batch targeting closed week on Sunday). */
export function getPreviousIsoWeekJst(date: Date = new Date()): string {
  const d = new Date(date.getTime() - 7 * 86400000);
  return getIsoWeekJst(d);
}

/** Whether timestamp falls in JST Mon 00:00 – Sat 23:59:59 for given ISO week. */
export function isInCohortScoringWindow(isoWeek: string, ts: Date): boolean {
  const weekNum = Number.parseInt(isoWeek.split('-W')[1] ?? '0', 10);
  const year = Number.parseInt(isoWeek.split('-W')[0] ?? '0', 10);
  if (!weekNum || !year) return false;

  const jan4 = new Date(Date.UTC(year, 0, 4));
  const jan4Day = jan4.getUTCDay() || 7;
  const monday = new Date(jan4);
  monday.setUTCDate(jan4.getUTCDate() - jan4Day + 1 + (weekNum - 1) * 7);

  const jstOffsetMs = 9 * 60 * 60 * 1000;
  const weekStart = new Date(monday.getTime() - jstOffsetMs);
  const weekEndExclusive = new Date(weekStart.getTime() + 6 * 86400000);

  return ts >= weekStart && ts < weekEndExclusive;
}

export function cohortWeekIndexFromIsoWeek(isoWeek: string): number {
  const weekNum = Number.parseInt(isoWeek.split('-W')[1] ?? '1', 10);
  return ((weekNum - 1) % 4) + 1;
}
