/**
 * CPL 問題プール（unified_cpl_questions）の試験レベルフィルタ。
 * - all: 従来どおり verified のみ（レベル列は見ない）
 * - ppl: applicable_exams に 'PPL' を含む問題のみ
 */
export type ExamLevelFilter = 'all' | 'ppl';

export function parseExamLevelParam(value: string | null): ExamLevelFilter {
  return value === 'ppl' ? 'ppl' : 'all';
}
