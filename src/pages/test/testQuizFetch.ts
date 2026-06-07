import { QuizQuestion } from '../../types/quiz';
import supabase from '../../utils/supabase';
import type { ExamLevelFilter } from './examLevelFilter';
import { parseUnifiedCplQuestion, shuffleAndSlice } from './quizQuestionUtils';
import { ALL_SUBJECT_VALUE } from './testHubFilters';

const ALL_OPTION_VALUE = ALL_SUBJECT_VALUE;

export async function fetchDiagnosticQuestionsPool(
  count: number,
  exam: ExamLevelFilter,
): Promise<{ questions: QuizQuestion[]; error: string | null }> {
  if (count <= 0) {
    return { questions: [], error: '出題数が無効です。' };
  }
  let query = supabase
    .from('unified_cpl_questions')
    .select('*')
    .eq('verification_status', 'verified')
    .order('importance_score', { ascending: false })
    .limit(300);
  if (exam === 'ppl') {
    query = query.contains('applicable_exams', ['PPL']);
  }
  const { data, error: fetchError } = await query;
  if (fetchError) throw fetchError;
  const pool = (data ?? []) as Record<string, unknown>[];
  const shuffled = shuffleAndSlice(pool, count);
  if (shuffled.length === 0) {
    return { questions: [], error: '診断用の問題が見つかりませんでした。' };
  }
  return { questions: shuffled.map(parseUnifiedCplQuestion), error: null };
}

export async function fetchSubjectQuestionsPool(
  subject: string,
  subSubjectValues: string[],
  count: number,
  examLevel: ExamLevelFilter,
): Promise<{ questions: QuizQuestion[]; error: string | null }> {
  if (count <= 0) {
    return { questions: [], error: '条件に合う問題がありません。科目または問題数を変更してください。' };
  }
  let query = supabase.from('unified_cpl_questions').select('*').eq('verification_status', 'verified');
  if (examLevel === 'ppl') {
    query = query.contains('applicable_exams', ['PPL']);
  }
  if (subject && subject !== ALL_OPTION_VALUE) {
    query = query.eq('main_subject', subject);
    if (subSubjectValues.length > 0) {
      query = query.in('sub_subject', subSubjectValues);
    }
  }
  const { data, error } = await query;
  if (error) throw error;
  if (!data) throw new Error('データが取得できませんでした');
  const shuffled = data.sort(() => Math.random() - 0.5).slice(0, count);
  if (shuffled.length === 0) {
    return {
      questions: [],
      error:
        examLevel === 'ppl'
          ? 'PPL 基礎としてタグ付けされた問題がありません。出題レベルを「CPL すべて」にするか、別の科目を選んでください。'
          : '条件に合う問題がありません。フィルタ条件を変更してください。',
    };
  }
  return { questions: shuffled.map((q) => parseUnifiedCplQuestion(q as Record<string, unknown>)), error: null };
}

export async function fetchMappedQuestionsPool(
  learningContentId: string,
  count: number,
): Promise<{ questions: QuizQuestion[]; error: string | null }> {
  if (count <= 0) {
    return { questions: [], error: '条件に合う問題がありません。' };
  }
  const { data, error } = await supabase
    .from('v_mapped_questions')
    .select('*')
    .eq('learning_content_id', learningContentId);
  if (error) throw error;
  const pool = Array.isArray(data) ? data : [];
  const shuffled = pool.sort(() => Math.random() - 0.5).slice(0, count);
  if (shuffled.length === 0) {
    return { questions: [], error: 'この単元記事に紐づく問題がありません。' };
  }
  return { questions: shuffled.map((q) => parseUnifiedCplQuestion(q as Record<string, unknown>)), error: null };
}

export async function fetchReviewQuestionsPool(
  count: number,
  examLevel: ExamLevelFilter,
): Promise<{ questions: QuizQuestion[]; error: string | null }> {
  const { data: authData } = await supabase.auth.getUser();
  const uid = authData?.user?.id;
  if (!uid) {
    return { questions: [], error: '弱点復習にはログインが必須です' };
  }
  const { data: dueList, error: dueErr } = await supabase
    .from('user_unified_srs_status')
    .select('question_id')
    .lte('next_review_date', new Date().toISOString())
    .eq('user_id', uid)
    .limit(200);
  if (dueErr) throw dueErr;
  let ids = (dueList || []).map((r: { question_id: string }) => r.question_id).filter(Boolean);

  if (ids.length === 0) {
    const { data: weakAreas, error: weakErr } = await supabase
      .from('user_weak_areas')
      .select('subject_category, accuracy_rate')
      .eq('user_id', uid)
      .order('accuracy_rate', { ascending: true })
      .limit(10);
    if (weakErr) throw weakErr;
    const mainSubjects = [
      ...new Set(
        (weakAreas ?? []).map((w: { subject_category: string }) => {
          const idx = w.subject_category.indexOf(' - ');
          return idx >= 0 ? w.subject_category.slice(0, idx) : w.subject_category;
        }),
      ),
    ];
    if (mainSubjects.length === 0) {
      return { questions: [], error: '弱点データがありません。10問診断を試してください。' };
    }
    let wq = supabase
      .from('unified_cpl_questions')
      .select('id')
      .eq('verification_status', 'verified')
      .in('main_subject', mainSubjects)
      .limit(200);
    if (examLevel === 'ppl') {
      wq = wq.contains('applicable_exams', ['PPL']);
    }
    const { data: weakQs, error: wqErr } = await wq;
    if (wqErr) throw wqErr;
    ids = shuffleAndSlice(
      (weakQs ?? []).map((r: { id: string }) => r.id),
      count,
    );
  } else {
    ids = shuffleAndSlice(ids, count);
  }

  if (ids.length === 0) {
    return { questions: [], error: '本日の復習対象はありません' };
  }
  const { data: qData, error: qErr } = await supabase.from('unified_cpl_questions').select('*').in('id', ids);
  if (qErr) throw qErr;
  if (!qData || qData.length === 0) {
    return { questions: [], error: '本日の復習対象はありません' };
  }
  return { questions: (qData as Record<string, unknown>[]).map(parseUnifiedCplQuestion), error: null };
}

/** 報告トリアージ用: ID で1問取得（verified 以外も含む） */
export async function fetchQuestionPreviewById(
  questionId: string,
): Promise<{ questions: QuizQuestion[]; error: string | null }> {
  const trimmed = questionId.trim();
  if (!trimmed) {
    return { questions: [], error: '問題 ID が無効です。' };
  }
  const { data, error } = await supabase
    .from('unified_cpl_questions')
    .select('*')
    .eq('id', trimmed)
    .maybeSingle();
  if (error) throw error;
  if (!data) {
    return { questions: [], error: '指定された問題が見つかりませんでした。' };
  }
  return { questions: [parseUnifiedCplQuestion(data as Record<string, unknown>)], error: null };
}
