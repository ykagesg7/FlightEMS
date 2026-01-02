import { supabase } from './supabase';

/**
 * ストリーク記録の型定義
 */
export interface StreakRecord {
  id: string;
  user_id: string;
  current_streak: number;
  longest_streak: number;
  last_activity_date: string | null;
  streak_freeze_count: number;
  streak_multiplier: number;
  created_at: string;
  updated_at: string;
}

/**
 * ストリークボーナス倍率を取得
 * @param streakDays 連続日数
 * @returns 倍率（1.0-2.5）
 */
export function getStreakMultiplier(streakDays: number): number {
  if (streakDays >= 90) {
    return 2.5;
  } else if (streakDays >= 30) {
    return 2.0;
  } else if (streakDays >= 14) {
    return 1.5;
  } else if (streakDays >= 7) {
    return 1.5;
  }
  return 1.0;
}

/**
 * ストリークレコードを取得または作成
 * @param userId ユーザーID
 * @returns ストリークレコード
 */
export async function getOrCreateStreakRecord(userId: string): Promise<StreakRecord | null> {
  try {
    // 既存のレコードを取得
    const { data, error } = await supabase
      .from('streak_records')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') {
      // PGRST116はレコードが見つからないエラー（正常）
      console.error('ストリークレコード取得エラー:', error);
      return null;
    }

    if (data) {
      return data as StreakRecord;
    }

    // レコードが存在しない場合、新規作成
    const today = new Date().toISOString().split('T')[0];
    const { data: newData, error: insertError } = await supabase
      .from('streak_records')
      .insert({
        user_id: userId,
        current_streak: 0,
        longest_streak: 0,
        last_activity_date: today,
        streak_freeze_count: 0,
        streak_multiplier: 1.0,
      })
      .select()
      .single();

    if (insertError) {
      console.error('ストリークレコード作成エラー:', insertError);
      return null;
    }

    return newData as StreakRecord;
  } catch (error) {
    console.error('ストリークレコード操作エラー:', error);
    return null;
  }
}

/**
 * ストリークを更新（活動日として記録）
 * @param userId ユーザーID
 * @returns 更新されたストリークレコード
 */
export async function updateStreak(userId: string): Promise<StreakRecord | null> {
  try {
    const today = new Date().toISOString().split('T')[0];
    const streakRecord = await getOrCreateStreakRecord(userId);

    if (!streakRecord) {
      return null;
    }

    const lastActivityDate = streakRecord.last_activity_date;
    let newStreak = streakRecord.current_streak;
    let shouldUpdateStreak = false;

    if (!lastActivityDate) {
      // 初回活動
      newStreak = 1;
      shouldUpdateStreak = true;
    } else {
      const lastDate = new Date(lastActivityDate);
      const todayDate = new Date(today);
      const daysDiff = Math.floor((todayDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));

      if (daysDiff === 0) {
        // 今日既に活動済み
        return streakRecord;
      } else if (daysDiff === 1) {
        // 連続日数を更新
        newStreak = streakRecord.current_streak + 1;
        shouldUpdateStreak = true;
      } else {
        // 連続が途切れた（ストリークフリーズが使えるかチェック）
        if (streakRecord.streak_freeze_count > 0) {
          // ストリークフリーズを使用
          const { error: freezeError } = await supabase
            .from('streak_records')
            .update({
              streak_freeze_count: streakRecord.streak_freeze_count - 1,
            })
            .eq('user_id', userId);

          if (!freezeError) {
            // フリーズを使用してストリークを維持
            newStreak = streakRecord.current_streak + 1;
            shouldUpdateStreak = true;
          } else {
            // ストリークが途切れた
            newStreak = 1;
            shouldUpdateStreak = true;
          }
        } else {
          // ストリークが途切れた
          newStreak = 1;
          shouldUpdateStreak = true;
        }
      }
    }

    if (shouldUpdateStreak) {
      const longestStreak = Math.max(newStreak, streakRecord.longest_streak);
      const multiplier = getStreakMultiplier(newStreak);

      const { data, error } = await supabase
        .from('streak_records')
        .update({
          current_streak: newStreak,
          longest_streak: longestStreak,
          last_activity_date: today,
          streak_multiplier: multiplier,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', userId)
        .select()
        .single();

      if (error) {
        console.error('ストリーク更新エラー:', error);
        return null;
      }

      return data as StreakRecord;
    }

    return streakRecord;
  } catch (error) {
    console.error('ストリーク更新エラー:', error);
    return null;
  }
}

/**
 * ストリークフリーズを追加
 * @param userId ユーザーID
 * @param count 追加するフリーズ回数
 * @returns 成功/失敗
 */
export async function addStreakFreeze(userId: string, count: number = 1): Promise<boolean> {
  try {
    const streakRecord = await getOrCreateStreakRecord(userId);
    if (!streakRecord) {
      return false;
    }

    const { error } = await supabase
      .from('streak_records')
      .update({
        streak_freeze_count: streakRecord.streak_freeze_count + count,
      })
      .eq('user_id', userId);

    return !error;
  } catch (error) {
    console.error('ストリークフリーズ追加エラー:', error);
    return false;
  }
}

