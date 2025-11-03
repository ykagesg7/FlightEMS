/**
 * 今日の学習タスク生成ユーティリティ
 * 弱点・復習・継続レッスンから3件を提案
 */

import { createBrowserSupabaseClient } from './supabase';
import type { DailyTask, TaskType } from '../types/tasks';

/**
 * 今日の学習タスクを生成（最大3件）
 */
export async function generateDailyTasks(userId: string): Promise<DailyTask[]> {
  const supabase = createBrowserSupabaseClient();
  const tasks: DailyTask[] = [];

  try {
    // 1. 弱点トピック（正答率60%以下、最低5試行）
    const weaknessTasks = await getWeaknessTasks(userId, supabase);
    tasks.push(...weaknessTasks);

    // 2. SRS復習（due状態）
    const reviewTasks = await getReviewTasks(userId, supabase);
    tasks.push(...reviewTasks);

    // 3. 継続レッスン（未完了の直近）
    const continueTasks = await getContinueTasks(userId, supabase);
    tasks.push(...continueTasks);

    // 優先度でソートして上位3件を返す
    return tasks
      .sort((a, b) => b.priority - a.priority)
      .slice(0, 3);
  } catch (error) {
    console.error('今日の学習タスク生成エラー:', error);
    return [];
  }
}

/**
 * 弱点トピックからタスクを生成
 */
async function getWeaknessTasks(userId: string, supabase: ReturnType<typeof createBrowserSupabaseClient>): Promise<DailyTask[]> {
  const { data: results, error } = await supabase
    .from('user_test_results')
    .select('subject_category, is_correct')
    .eq('user_id', userId);

  if (error || !results || results.length === 0) {
    return [];
  }

  // 科目別の正答率計算
  const subjectMap = new Map<string, { correct: number; total: number }>();
  results.forEach(result => {
    const subject = result.subject_category || '未分類';
    const current = subjectMap.get(subject) || { correct: 0, total: 0 };
    subjectMap.set(subject, {
      correct: current.correct + (result.is_correct ? 1 : 0),
      total: current.total + 1,
    });
  });

  // 正答率60%以下、最低5試行の科目を抽出
  const weakSubjects = Array.from(subjectMap.entries())
    .filter(([_, stats]) => stats.total >= 5)
    .map(([subject, stats]) => ({
      subject,
      accuracyPct: stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0,
    }))
    .filter(item => item.accuracyPct <= 60)
    .sort((a, b) => a.accuracyPct - b.accuracyPct)
    .slice(0, 3);

  return weakSubjects.map((item, index) => ({
    id: `weakness-${item.subject}-${index}`,
    type: 'weakness' as TaskType,
    title: `${item.subject}の弱点克服`,
    estimatedMinutes: 20,
    priority: 90 - item.accuracyPct, // 正答率が低いほど優先度高
    linkTo: `/test?subject=${encodeURIComponent(item.subject)}`,
    completed: false,
  }));
}

/**
 * SRS復習タスクを生成
 */
async function getReviewTasks(userId: string, supabase: ReturnType<typeof createBrowserSupabaseClient>): Promise<DailyTask[]> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const { data: srsStatuses, error } = await supabase
    .from('user_unified_srs_status')
    .select('question_id, next_review_date')
    .eq('user_id', userId)
    .lte('next_review_date', today.toISOString())
    .limit(5);

  if (error || !srsStatuses || srsStatuses.length === 0) {
    return [];
  }

  return [{
    id: 'review-srs',
    type: 'review' as TaskType,
    title: `復習が必要な問題 ${srsStatuses.length}件`,
    estimatedMinutes: 15,
    priority: 75,
    linkTo: '/test?mode=review',
    completed: false,
  }];
}

/**
 * 継続レッスンタスクを生成
 */
async function getContinueTasks(userId: string, supabase: ReturnType<typeof createBrowserSupabaseClient>): Promise<DailyTask[]> {
  const { data: progress, error } = await supabase
    .from('learning_progress')
    .select('content_id, progress_percentage, last_read_at')
    .eq('user_id', userId)
    .eq('completed', false)
    .order('last_read_at', { ascending: false })
    .limit(3);

  if (error || !progress || progress.length === 0) {
    return [];
  }

  // コンテンツ情報を取得
  const contentIds = progress.map(p => p.content_id);
  const { data: contents } = await supabase
    .from('learning_contents')
    .select('id, title')
    .in('id', contentIds);

  if (!contents) {
    return [];
  }

  const contentMap = new Map(contents.map(c => [c.id, c]));

  return progress
    .map(p => {
      const content = contentMap.get(p.content_id);
      if (!content) return null;

      return {
        id: `continue-${p.content_id}`,
        type: 'lesson' as TaskType,
        title: content.title,
        estimatedMinutes: 25,
        priority: 50 + (p.progress_percentage || 0) / 2, // 進捗が高いほど優先
        linkTo: `/learning/${p.content_id}`,
        completed: false,
      };
    })
    .filter((task): task is DailyTask => task !== null)
    .slice(0, 2); // 最大2件
}

