/**
 * ヒートマップ用データ変換ユーティリティ
 * 学習履歴カレンダー用の日別学習時間データ生成（JST 暦日）
 */

import { supabase } from './supabase';
import { addJstCalendarDays, formatJstYmd, startOfJstCalendarDaysAgoUtc } from './jstDate';

export interface DailyStudyStat {
  date: string; // YYYY-MM-DD (JST)
  minutes: number;
  intensity: 0 | 1 | 2 | 3; // 0: なし, 1: 軽い, 2: 中, 3: 高
  sessionCount?: number;
}

/** 0: 0分 / 1: 1-15 / 2: 16-45 / 3: 46+ */
export const HEATMAP_INTENSITY_LEGEND = [
  { intensity: 0 as const, label: '0分' },
  { intensity: 1 as const, label: '1–15分' },
  { intensity: 2 as const, label: '16–45分' },
  { intensity: 3 as const, label: '46分+' },
];

export function calculateIntensity(minutes: number): 0 | 1 | 2 | 3 {
  if (minutes === 0) return 0;
  if (minutes <= 15) return 1;
  if (minutes <= 45) return 2;
  return 3;
}

/**
 * 過去90日間の日別学習時間を集計（JST）
 */
export async function buildDailyStudyStats(userId: string, days: number = 90): Promise<DailyStudyStat[]> {
  const now = new Date();
  const windowStart = startOfJstCalendarDaysAgoUtc(Math.max(0, days - 1), now);

  const { data: sessions, error } = await supabase
    .from('learning_sessions')
    .select('duration_minutes, created_at')
    .eq('user_id', userId)
    .gte('created_at', windowStart.toISOString());

  if (error) {
    console.error('学習セッション取得エラー:', error);
    return [];
  }

  const todayYmd = formatJstYmd(now);
  const dailyMap = new Map<string, { minutes: number; sessionCount: number }>();

  for (let i = 0; i < days; i++) {
    dailyMap.set(addJstCalendarDays(todayYmd, -i), { minutes: 0, sessionCount: 0 });
  }

  sessions?.forEach((session) => {
    if (!session.created_at) return;
    const dateStr = formatJstYmd(new Date(session.created_at));
    const current = dailyMap.get(dateStr);
    if (!current) return;
    dailyMap.set(dateStr, {
      minutes: current.minutes + (session.duration_minutes || 0),
      sessionCount: current.sessionCount + 1,
    });
  });

  return Array.from(dailyMap.entries())
    .map(([date, { minutes, sessionCount }]) => ({
      date,
      minutes,
      intensity: calculateIntensity(minutes),
      sessionCount,
    }))
    .sort((a, b) => a.date.localeCompare(b.date));
}
