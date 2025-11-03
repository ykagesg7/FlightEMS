/**
 * ヒートマップ用データ変換ユーティリティ
 * 学習履歴カレンダー用の日別学習時間データ生成
 */

import { createBrowserSupabaseClient } from './supabase';

export interface DailyStudyStat {
  date: string; // YYYY-MM-DD形式
  minutes: number;
  intensity: 0 | 1 | 2 | 3; // 0: なし, 1: 軽い, 2: 中, 3: 高
}

/**
 * 過去90日間の日別学習時間を集計
 */
export async function buildDailyStudyStats(userId: string, days: number = 90): Promise<DailyStudyStat[]> {
  const supabase = createBrowserSupabaseClient();

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  startDate.setHours(0, 0, 0, 0);

  const { data: sessions, error } = await supabase
    .from('learning_sessions')
    .select('duration_minutes, created_at')
    .eq('user_id', userId)
    .gte('created_at', startDate.toISOString());

  if (error) {
    console.error('学習セッション取得エラー:', error);
    return [];
  }

  // 日付ごとに集計
  const dailyMap = new Map<string, number>();

  // 過去90日間の日付を初期化
  const today = new Date();
  for (let i = 0; i < days; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = formatDate(date);
    dailyMap.set(dateStr, 0);
  }

  // セッションデータを集計
  sessions?.forEach(session => {
    const sessionDate = new Date(session.created_at);
    const dateStr = formatDate(sessionDate);
    const currentMinutes = dailyMap.get(dateStr) || 0;
    dailyMap.set(dateStr, currentMinutes + (session.duration_minutes || 0));
  });

  // 強度を計算して返す
  return Array.from(dailyMap.entries())
    .map(([date, minutes]) => ({
      date,
      minutes,
      intensity: calculateIntensity(minutes),
    }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

/**
 * 日付をYYYY-MM-DD形式に変換
 */
function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * 学習時間から強度を計算（0-3）
 * 0: 0分
 * 1: 1-15分
 * 2: 16-45分
 * 3: 46分以上
 */
function calculateIntensity(minutes: number): 0 | 1 | 2 | 3 {
  if (minutes === 0) return 0;
  if (minutes <= 15) return 1;
  if (minutes <= 45) return 2;
  return 3;
}

