/**
 * ダッシュボード用データ取得ユーティリティ
 * SupabaseMCPを活用して型安全なデータ取得を実装
 */

import { createBrowserSupabaseClient } from './supabase';
import type { DashboardMetrics } from '../types/dashboard';

/**
 * ダッシュボード用の統合メトリクスを取得
 * 既存テーブルから必要な情報を集計して返す
 */
export async function fetchDashboardMetrics(userId: string): Promise<DashboardMetrics> {
  const _supabase = createBrowserSupabaseClient();

  try {
    // 1. 学習進捗の集計
    const learningProgress = await getLearningProgress(userId);

    // 2. テスト結果の集計
    const testResults = await getTestResults(userId);

    // 3. 学習時間の集計
    const studyTime = await getStudyTime(userId);

    // 4. 連続学習日数の計算
    const streakDays = await getStreakDays(userId);

    // 5. 次の推奨レッスン取得
    const nextLesson = await getNextRecommendedLesson(userId);

    // 6. 弱点トピック取得
    const weakTopics = await getWeakTopics(userId);

    return {
      overallProgressPct: learningProgress.progressPct,
      testAccuracyPct: testResults.accuracyPct,
      weeklyStudyMinutes: studyTime.weeklyMinutes,
      streakDays,
      nextLesson,
      weakTopics,
    };
  } catch (error) {
    console.error('ダッシュボードメトリクス取得エラー:', error);
    throw error;
  }
}

/**
 * 学習進捗の集計（学習コンテンツの完了率）
 */
async function getLearningProgress(userId: string) {
  const supabase = createBrowserSupabaseClient();

  const { data: progress, error } = await supabase
    .from('learning_progress')
    .select('completed')
    .eq('user_id', userId);

  if (error) {
    console.error('学習進捗取得エラー:', error);
    return { completedCount: 0, totalCount: 0, progressPct: 0 };
  }

  const { count: totalContentCount, error: countError } = await supabase
    .from('learning_contents')
    .select('*', { count: 'exact', head: true })
    .eq('is_published', true);

  if (countError) {
    console.error('学習コンテンツ総数取得エラー:', countError);
    return { completedCount: 0, totalCount: 0, progressPct: 0 };
  }

  const completedCount = progress?.filter(p => p.completed).length || 0;
  const totalCount = totalContentCount || 0;
  const progressPct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return { completedCount, totalCount, progressPct };
}

/**
 * テスト結果の集計（模試正答率）
 */
async function getTestResults(userId: string) {
  const supabase = createBrowserSupabaseClient();

  const { data: results, error } = await supabase
    .from('user_test_results')
    .select('is_correct, subject_category')
    .eq('user_id', userId);

  if (error) {
    console.error('テスト結果取得エラー:', error);
    return {
      totalAttempts: 0,
      correctAttempts: 0,
      accuracyPct: 0,
      subjectBreakdown: [],
    };
  }

  const totalAttempts = results?.length || 0;
  const correctAttempts = results?.filter(r => r.is_correct).length || 0;
  const accuracyPct = totalAttempts > 0 ? Math.round((correctAttempts / totalAttempts) * 100) : 0;

  // 科目別の正答率計算
  const subjectMap = new Map<string, { correct: number; total: number }>();
  results?.forEach(result => {
    const subject = result.subject_category || '未分類';
    const current = subjectMap.get(subject) || { correct: 0, total: 0 };
    subjectMap.set(subject, {
      correct: current.correct + (result.is_correct ? 1 : 0),
      total: current.total + 1,
    });
  });

  const subjectBreakdown = Array.from(subjectMap.entries()).map(([subject, stats]) => ({
    subject,
    accuracyPct: stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0,
    attemptCount: stats.total,
  }));

  return {
    totalAttempts,
    correctAttempts,
    accuracyPct,
    subjectBreakdown,
  };
}

/**
 * 直近7日間の学習時間を計算
 */
async function getStudyTime(userId: string) {
  const supabase = createBrowserSupabaseClient();

  // 直近7日間の開始時刻
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const { data: sessions, error } = await supabase
    .from('learning_sessions')
    .select('duration_minutes')
    .eq('user_id', userId)
    .gte('created_at', sevenDaysAgo.toISOString());

  if (error) {
    console.error('学習時間取得エラー:', error);
    return { todayMinutes: 0, weeklyMinutes: 0, monthlyMinutes: 0 };
  }

  const weeklyMinutes = sessions?.reduce((sum, s) => sum + (s.duration_minutes || 0), 0) || 0;

  return {
    todayMinutes: 0, // TODO: 今日の学習時間計算
    weeklyMinutes,
    monthlyMinutes: 0, // TODO: 今月の学習時間計算
  };
}

/**
 * 連続学習日数を計算
 */
async function getStreakDays(userId: string): Promise<number> {
  // TODO: user_learning_profilesテーブルのcurrent_streak_daysを使用
  // 実装は後で拡張
  const supabase = createBrowserSupabaseClient();

  const { data: profile } = await supabase
    .from('user_learning_profiles')
    .select('current_streak_days')
    .eq('user_id', userId)
    .single();

  return profile?.current_streak_days || 0;
}

/**
 * 次の推奨レッスンを取得
 * 未完了かつ学習済みのレッスンの中で最も進捗が高いものを返す
 */
async function getNextRecommendedLesson(userId: string) {
  const supabase = createBrowserSupabaseClient();

  const { data: progress, error } = await supabase
    .from('learning_progress')
    .select('content_id, progress_percentage, completed')
    .eq('user_id', userId)
    .neq('completed', true)
    .order('last_read_at', { ascending: false })
    .limit(1);

  if (error || !progress || progress.length === 0) {
    return undefined;
  }

  const nextContentId = progress[0].content_id;

  const { data: content } = await supabase
    .from('learning_contents')
    .select('id, title')
    .eq('id', nextContentId)
    .single();

  if (!content) {
    return undefined;
  }

  return {
    id: content.id,
    title: content.title,
  };
}

/**
 * 弱点トピックを取得（正答率が低いもの上位3件）
 */
async function getWeakTopics(userId: string) {
  const supabase = createBrowserSupabaseClient();

  const { data: results, error } = await supabase
    .from('user_test_results')
    .select('subject_category, sub_category, is_correct')
    .eq('user_id', userId);

  if (error || !results) {
    return [];
  }

  // トピック別の正答率計算
  const topicMap = new Map<string, { correct: number; total: number }>();
  results.forEach(result => {
    const topic = result.subject_category || '未分類';
    const current = topicMap.get(topic) || { correct: 0, total: 0 };
    topicMap.set(topic, {
      correct: current.correct + (result.is_correct ? 1 : 0),
      total: current.total + 1,
    });
  });

  // 正答率でソートして上位3件を返す
  const topics = Array.from(topicMap.entries())
    .map(([topic, stats]) => ({
      topic,
      accuracyPct: stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0,
    }))
    .sort((a, b) => a.accuracyPct - b.accuracyPct)
    .slice(0, 3);

  return topics;
}

