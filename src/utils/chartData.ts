/**
 * チャート用データ変換ユーティリティ
 * 科目別レーダーチャート用のデータ生成
 */

import { createBrowserSupabaseClient } from './supabase';

/**
 * 科目カテゴリのマッピング定義
 */
const SUBJECT_MAPPING: Record<string, string> = {
  '航空工学': '航空工学',
  '航空機工学': '航空工学',
  '機体': '航空工学',
  '航空気象': '航空気象',
  '気象': '航空気象',
  '空中航法': '空中航法',
  '航法': '空中航法',
  '航空通信': '航空通信',
  '通信': '航空通信',
  '航空法規': '航空法規',
  '法規': '航空法規',
};

/**
 * 5科目の固定順序
 */
const SUBJECT_ORDER = ['航空工学', '航空気象', '空中航法', '航空通信', '航空法規'] as const;

export type SubjectName = typeof SUBJECT_ORDER[number];

export interface SubjectRadarData {
  labels: SubjectName[];
  values: number[]; // 0-100の正答率
}

/**
 * 科目別レーダーチャート用データを生成
 */
export async function buildSubjectRadarData(userId: string): Promise<SubjectRadarData> {
  const supabase = createBrowserSupabaseClient();

  const { data: results, error } = await supabase
    .from('user_test_results')
    .select('subject_category, is_correct')
    .eq('user_id', userId);

  if (error || !results || results.length === 0) {
    // データがない場合は0%で初期化
    return {
      labels: [...SUBJECT_ORDER],
      values: [0, 0, 0, 0, 0],
    };
  }

  // 科目別の正答率計算
  const subjectMap = new Map<SubjectName, { correct: number; total: number }>();

  // 初期化
  SUBJECT_ORDER.forEach(subject => {
    subjectMap.set(subject, { correct: 0, total: 0 });
  });

  // 集計
  results.forEach(result => {
    const rawCategory = result.subject_category || '';
    const normalizedCategory = normalizeSubjectCategory(rawCategory);

    if (normalizedCategory && subjectMap.has(normalizedCategory)) {
      const stats = subjectMap.get(normalizedCategory)!;
      stats.total++;
      if (result.is_correct) {
        stats.correct++;
      }
    }
  });

  // 正答率を計算（0-100）
  const values = SUBJECT_ORDER.map(subject => {
    const stats = subjectMap.get(subject)!;
    if (stats.total === 0) return 0;
    return Math.round((stats.correct / stats.total) * 100);
  });

  return {
    labels: [...SUBJECT_ORDER],
    values,
  };
}

/**
 * 科目カテゴリを正規化（マッピング）
 */
function normalizeSubjectCategory(category: string): SubjectName | null {
  // 完全一致
  if (SUBJECT_ORDER.includes(category as SubjectName)) {
    return category as SubjectName;
  }

  // マッピングで変換
  const mapped = SUBJECT_MAPPING[category];
  if (mapped && SUBJECT_ORDER.includes(mapped as SubjectName)) {
    return mapped as SubjectName;
  }

  // 部分一致で判定
  for (const [key, value] of Object.entries(SUBJECT_MAPPING)) {
    if (category.includes(key) || key.includes(category)) {
      if (SUBJECT_ORDER.includes(value as SubjectName)) {
        return value as SubjectName;
      }
    }
  }

  return null;
}

