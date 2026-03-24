import React, { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useGamification } from '../../hooks/useGamification';
import { QuestionType, QuizFetchParams, QuizQuestion, UserQuizAnswer } from '../../types/quiz';
import supabase from '../../utils/supabase';
import { FilterListbox, type FilterListboxOption } from './components/FilterListbox';
import { QuizComponent } from './components/QuizComponent';
import { QuizResultsView } from './components/QuizResultsView';
import { buildOrderIndex, MAIN_SUBJECT_ORDER, SUB_SUBJECT_ORDER_BY_MAIN } from './cplSyllabusOrder';
import type { ExamLevelFilter } from './examLevelFilter';
import { parseExamLevelParam } from './examLevelFilter';
import { normalizeSubSubjectLabel } from './utils/normalizeSubSubject';

type FilterOption = {
  value: string;
  label: string;
  count: number;
  avgImportance: number;
};

type SubSubjectOption = FilterOption & {
  rawValues: string[];
};

type FilterSortOrder = 'priority' | 'syllabus';

const ALL_OPTION_VALUE = 'all';
const PLACEHOLDER_SUBJECT = '__placeholder__';
const MAIN_SUBJECT_ORDER_INDEX = buildOrderIndex(MAIN_SUBJECT_ORDER);
const SUB_SUBJECT_ORDER_INDEX_BY_MAIN = Object.fromEntries(
  Object.entries(SUB_SUBJECT_ORDER_BY_MAIN).map(([mainSubject, labels]) => [mainSubject, buildOrderIndex(labels)]),
) as Record<string, Map<string, number>>;
const FILTER_SEARCH_INPUT_CLASS =
  'quiz-filter-search block w-full appearance-none rounded-xl border border-brand-primary/15 bg-[var(--panel)]/60 px-4 py-2 text-sm text-[var(--text-primary)] shadow-sm transition placeholder:text-[var(--text-muted)]/80 hover:border-brand-primary/30 focus:outline-none focus:ring-2 focus:ring-brand-primary disabled:cursor-not-allowed disabled:opacity-60';
const SORT_TOGGLE_BASE_CLASS =
  'rounded-xl border px-3 py-3 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-brand-primary disabled:cursor-not-allowed disabled:opacity-60';

const formatFilterOptionLabel = (label: string, count: number) => `${label} (${count}問)`;

const sortFilterOptionsByPriority = (a: FilterOption, b: FilterOption) => {
  if (b.avgImportance !== a.avgImportance) return b.avgImportance - a.avgImportance;
  if (b.count !== a.count) return b.count - a.count;
  const orderA = MAIN_SUBJECT_ORDER_INDEX.get(a.value) ?? Number.MAX_SAFE_INTEGER;
  const orderB = MAIN_SUBJECT_ORDER_INDEX.get(b.value) ?? Number.MAX_SAFE_INTEGER;
  if (orderA !== orderB) return orderA - orderB;
  return a.label.localeCompare(b.label, 'ja');
};

const sortFilterOptionsBySyllabus = (
  a: FilterOption,
  b: FilterOption,
  orderIndex: Map<string, number> | undefined,
) => {
  const orderA = orderIndex?.get(a.value);
  const orderB = orderIndex?.get(b.value);

  if (orderA !== undefined && orderB !== undefined && orderA !== orderB) {
    return orderA - orderB;
  }
  if (orderA !== undefined) return -1;
  if (orderB !== undefined) return 1;

  return sortFilterOptionsByPriority(a, b);
};

const sortOptionList = <T extends FilterOption>(
  options: T[],
  comparator: (a: T, b: T) => number,
  pinValue: string = ALL_OPTION_VALUE,
) => {
  const pinnedOption = options.find((option) => option.value === pinValue);
  const rest = options.filter((option) => option.value !== pinValue).sort(comparator);
  return pinnedOption ? [pinnedOption, ...rest] : rest;
};

const mergeSelectedIntoMatches = <T extends FilterOption>(
  matches: T[],
  selected: T | undefined,
) => {
  if (!selected || matches.some((option) => option.value === selected.value)) {
    return matches;
  }
  const allOption = matches.find((option) => option.value === ALL_OPTION_VALUE);
  const others = matches.filter((option) => option.value !== ALL_OPTION_VALUE);
  return allOption ? [allOption, selected, ...others] : [selected, ...others];
};

const TestPage: React.FC = () => {
  const { completeMissionByAction } = useGamification();
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quizFinished, setQuizFinished] = useState(false);
  const [userAnswers, setUserAnswers] = useState<UserQuizAnswer[]>([]);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [subjects, setSubjects] = useState<FilterOption[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<string>(PLACEHOLDER_SUBJECT);
  const [subjectSearch, setSubjectSearch] = useState('');
  const [subjectLoading, setSubjectLoading] = useState(true);
  const [subSubjects, setSubSubjects] = useState<SubSubjectOption[]>([]);
  const [selectedSubSubject, setSelectedSubSubject] = useState<string>(ALL_OPTION_VALUE);
  const [subSubjectSearch, setSubSubjectSearch] = useState('');
  const [subSubjectLoading, setSubSubjectLoading] = useState(false);
  const [questionCount, setQuestionCount] = useState<number>(10);
  // 最大値は選択肢生成のみに使用するため、状態として保持しない
  const [questionCountOptions, setQuestionCountOptions] = useState<number[]>([10]);
  const [mode, setMode] = useState<'practice' | 'exam' | 'review'>('practice');
  const [contentId, setContentId] = useState<string | null>(null);
  const [retryIncorrectMode, setRetryIncorrectMode] = useState(false);
  const [flaggedQuestionIds, setFlaggedQuestionIds] = useState<string[]>([]);
  const [sortOrder, setSortOrder] = useState<FilterSortOrder>('priority');
  const [examLevel, setExamLevel] = useState<ExamLevelFilter>('all');
  /** PPL モード時の verified 件数（head 集計・科目リストの limit より正確） */
  const [pplVerifiedExactCount, setPplVerifiedExactCount] = useState<number | null>(null);

  // クエリパラメータから初期値を設定
  const [sp] = useSearchParams();
  useEffect(() => {
    const qs = sp.get('subject') || PLACEHOLDER_SUBJECT;
    const qss = sp.get('sub') || ALL_OPTION_VALUE;
    const qc = Number(sp.get('count') || '10');
    const qm = (sp.get('mode') as 'practice' | 'exam' | 'review') || 'practice';
    const cid = sp.get('contentId');

    setSelectedSubject(qs);
    setSelectedSubSubject(qss);
    setQuestionCount(Number.isFinite(qc) && qc > 0 ? qc : 10);
    setMode(qm);
    setContentId(cid);
    setExamLevel(parseExamLevelParam(sp.get('exam')));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // main_subject一覧取得（科目選択必須のため「すべての科目」は出題対象外）
  useEffect(() => {
    const fetchSubjects = async () => {
      setSubjectLoading(true);
      try {
        let q = supabase
          .from('unified_cpl_questions')
          .select('main_subject, importance_score', { count: 'exact', head: false })
          .eq('verification_status', 'verified');
        if (examLevel === 'ppl') {
          q = q.contains('applicable_exams', ['PPL']);
        }
        const { data, error } = await q.limit(5000);
        if (error) throw error;
        const subjectStats = new Map<string, { count: number; importanceTotal: number }>();
        ((data ?? []) as Array<{ main_subject: unknown; importance_score: unknown }>)
          .filter((q): q is { main_subject: string; importance_score: number | null } => typeof q.main_subject === 'string' && q.main_subject.length > 0)
          .forEach(({ main_subject, importance_score }) => {
            const entry = subjectStats.get(main_subject) ?? { count: 0, importanceTotal: 0 };
            entry.count += 1;
            entry.importanceTotal += typeof importance_score === 'number' ? importance_score : 0;
            subjectStats.set(main_subject, entry);
          });

        const subjectOptions = Array.from(subjectStats.entries())
          .map(([value, entry]) => ({
            value,
            label: value,
            count: entry.count,
            avgImportance: entry.count > 0 ? entry.importanceTotal / entry.count : 0,
          }))
          .sort(sortFilterOptionsByPriority);

        const options: FilterOption[] = [
          {
            value: PLACEHOLDER_SUBJECT,
            label: '科目を選択してください',
            count: 0,
            avgImportance: 0,
          },
          ...subjectOptions,
        ];
        setSubjects(options);
        setSelectedSubject((prev) => (options.some((option) => option.value === prev) ? prev : PLACEHOLDER_SUBJECT));
      } catch (_err) {
        setSubjects([{ value: PLACEHOLDER_SUBJECT, label: '科目を選択してください', count: 0, avgImportance: 0 }]);
      } finally {
        setSubjectLoading(false);
      }
    };
    fetchSubjects();
  }, [examLevel]);

  useEffect(() => {
    if (examLevel !== 'ppl') {
      setPplVerifiedExactCount(null);
      return;
    }
    let cancelled = false;
    void (async () => {
      const { count, error } = await supabase
        .from('unified_cpl_questions')
        .select('*', { count: 'exact', head: true })
        .eq('verification_status', 'verified')
        .contains('applicable_exams', ['PPL']);
      if (!cancelled) {
        setPplVerifiedExactCount(error ? null : count ?? 0);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [examLevel]);

  // main_subject選択時にsub_subject一覧取得
  useEffect(() => {
    if (!selectedSubject || selectedSubject === ALL_OPTION_VALUE || selectedSubject === PLACEHOLDER_SUBJECT) {
      setSubSubjects([]);
      setSelectedSubSubject(ALL_OPTION_VALUE);
      setSubSubjectSearch('');
      return;
    }
    setSubSubjectLoading(true);
    setSubSubjectSearch('');
    const fetchSubSubjects = async () => {
      try {
        let sq = supabase
          .from('unified_cpl_questions')
          .select('sub_subject, importance_score', { count: 'exact', head: false })
          .eq('main_subject', selectedSubject)
          .eq('verification_status', 'verified');
        if (examLevel === 'ppl') {
          sq = sq.contains('applicable_exams', ['PPL']);
        }
        const { data, error } = await sq;
        if (error) throw error;
        const normalizedMap = new Map<string, { rawValues: Set<string>; count: number; importanceTotal: number }>();
        ((data ?? []) as Array<{ sub_subject: unknown; importance_score: unknown }>)
          .filter((q): q is { sub_subject: string; importance_score: number | null } => typeof q.sub_subject === 'string' && q.sub_subject.length > 0)
          .forEach(({ sub_subject: rawValue, importance_score }) => {
            const normalized = normalizeSubSubjectLabel(rawValue);
            if (!normalized) return;
            const entry = normalizedMap.get(normalized) ?? { rawValues: new Set<string>(), count: 0, importanceTotal: 0 };
            entry.rawValues.add(rawValue);
            entry.count += 1;
            entry.importanceTotal += typeof importance_score === 'number' ? importance_score : 0;
            normalizedMap.set(normalized, entry);
          });

        const options: SubSubjectOption[] = [
          {
            value: ALL_OPTION_VALUE,
            label: 'すべてのサブ科目',
            count: Array.from(normalizedMap.values()).reduce((sum, entry) => sum + entry.count, 0),
            avgImportance:
              normalizedMap.size > 0
                ? Array.from(normalizedMap.values()).reduce((sum, entry) => sum + entry.importanceTotal, 0) /
                  Array.from(normalizedMap.values()).reduce((sum, entry) => sum + entry.count, 0)
                : 0,
            rawValues: [],
          },
          ...Array.from(normalizedMap.entries())
            .map(([value, entry]) => ({
              value,
              label: value,
              count: entry.count,
              avgImportance: entry.count > 0 ? entry.importanceTotal / entry.count : 0,
              rawValues: Array.from(entry.rawValues).sort((a, b) => a.localeCompare(b, 'ja')),
            }))
            .sort(sortFilterOptionsByPriority),
        ];

        setSubSubjects(options);
        setSelectedSubSubject((prev) => {
          const direct = options.find((option) => option.value === prev);
          if (direct) return direct.value;
          const byRawValue = options.find((option) => option.rawValues.includes(prev));
          return byRawValue?.value ?? ALL_OPTION_VALUE;
        });
      } catch (_err) {
        setSubSubjects([{ value: ALL_OPTION_VALUE, label: 'すべてのサブ科目', count: 0, avgImportance: 0, rawValues: [] }]);
        setSelectedSubSubject(ALL_OPTION_VALUE);
      } finally {
        setSubSubjectLoading(false);
      }
    };
    fetchSubSubjects();
  }, [selectedSubject, examLevel]);

  const selectedSubSubjectRawValues = useMemo(() => {
    if (selectedSubSubject === ALL_OPTION_VALUE) return [] as string[];
    return subSubjects.find((option) => option.value === selectedSubSubject)?.rawValues ?? [];
  }, [selectedSubSubject, subSubjects]);

  const orderedSubjects = useMemo(() => {
    const comparator =
      sortOrder === 'syllabus'
        ? (a: FilterOption, b: FilterOption) => sortFilterOptionsBySyllabus(a, b, MAIN_SUBJECT_ORDER_INDEX)
        : sortFilterOptionsByPriority;

    return sortOptionList(subjects, comparator, PLACEHOLDER_SUBJECT);
  }, [sortOrder, subjects]);

  const orderedSubSubjects = useMemo(() => {
    const syllabusOrderIndex =
      selectedSubject !== ALL_OPTION_VALUE ? SUB_SUBJECT_ORDER_INDEX_BY_MAIN[selectedSubject] : undefined;
    const comparator =
      sortOrder === 'syllabus'
        ? (a: SubSubjectOption, b: SubSubjectOption) => sortFilterOptionsBySyllabus(a, b, syllabusOrderIndex)
        : sortFilterOptionsByPriority;

    return sortOptionList(subSubjects, comparator);
  }, [selectedSubject, sortOrder, subSubjects]);

  const filteredSubjects = useMemo(() => {
    const keyword = subjectSearch.trim().toLocaleLowerCase('ja');
    if (!keyword) return orderedSubjects;
    const selected = orderedSubjects.find((option) => option.value === selectedSubject);
    const matches = orderedSubjects.filter((option) => {
      if (option.value === PLACEHOLDER_SUBJECT) return true;
      return option.label.toLocaleLowerCase('ja').includes(keyword);
    });
    return mergeSelectedIntoMatches(matches, selected);
  }, [orderedSubjects, selectedSubject, subjectSearch]);

  const filteredSubSubjects = useMemo(() => {
    const keyword = subSubjectSearch.trim().toLocaleLowerCase('ja');
    if (!keyword) return orderedSubSubjects;
    const selected = orderedSubSubjects.find((option) => option.value === selectedSubSubject);
    const matches = orderedSubSubjects.filter((option) => {
      if (option.value === ALL_OPTION_VALUE) return true;
      return option.label.toLocaleLowerCase('ja').includes(keyword);
    });
    return mergeSelectedIntoMatches(matches, selected);
  }, [orderedSubSubjects, selectedSubSubject, subSubjectSearch]);

  const subjectSelected = selectedSubject !== PLACEHOLDER_SUBJECT && selectedSubject !== ALL_OPTION_VALUE;
  const selectableMainSubjectCount = useMemo(
    () => subjects.filter((s) => s.value !== PLACEHOLDER_SUBJECT).length,
    [subjects],
  );
  const filtersLocked = mode === 'review' || !!contentId;
  // 課目一覧の件数は limit(5000) 後のフロント集計のため誤解を招くため表示しない
  const subjectListboxOptions = useMemo<FilterListboxOption<string>[]>(
    () =>
      filteredSubjects.map((subject) => ({
        value: subject.value,
        label: subject.label,
        disabled: subject.value === PLACEHOLDER_SUBJECT ? false : undefined,
      })),
    [filteredSubjects],
  );
  const subSubjectListboxOptions = useMemo<FilterListboxOption<string>[]>(
    () =>
      (filteredSubSubjects.length === 0
        ? [{ value: ALL_OPTION_VALUE, label: formatFilterOptionLabel('一致するサブ科目なし', 0), disabled: true }]
        : filteredSubSubjects.map((subject) => ({
            value: subject.value,
            label: formatFilterOptionLabel(subject.label, subject.count),
          }))),
    [filteredSubSubjects],
  );
  const questionCountListboxOptions = useMemo<FilterListboxOption<number>[]>(
    () =>
      questionCountOptions.length === 0
        ? [{ value: 0, label: '0問', disabled: true }]
        : questionCountOptions.map((count) => ({ value: count, label: `${count}問` })),
    [questionCountOptions],
  );

  // main_subject, sub_subject選択時に該当問題数をカウントし最大値を更新
  useEffect(() => {
    const fetchCount = async () => {
      if (selectedSubject === PLACEHOLDER_SUBJECT || selectedSubject === ALL_OPTION_VALUE) {
        setQuestionCountOptions([]);
        setQuestionCount(0);
        return;
      }
      let query = supabase
        .from('unified_cpl_questions')
        .select('*', { count: 'exact', head: true })
        .eq('verification_status', 'verified')
        .eq('main_subject', selectedSubject);
      if (examLevel === 'ppl') {
        query = query.contains('applicable_exams', ['PPL']);
      }
      if (selectedSubSubjectRawValues.length > 0) {
        query = query.in('sub_subject', selectedSubSubjectRawValues);
      }
      const { count, error } = await query;
      let maxCount = count || 0;
      if (error) maxCount = 0;
      if (maxCount <= 0) {
        setQuestionCountOptions([]);
        setQuestionCount(0);
        return;
      }

      // 10未満なら最大値のみ、10以上なら10から最大値まで5問単位
      let options: number[] = [];
      if (maxCount < 10) {
        options = [maxCount];
      } else {
        for (let i = 10; i <= maxCount; i += 5) {
          options.push(i);
        }
        if (options[options.length - 1] !== maxCount) options.push(maxCount);
      }
      setQuestionCountOptions(options);
      setQuestionCount((prev) => (options.includes(prev) ? prev : options[0]));
    };
    fetchCount();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSubject, selectedSubSubject, selectedSubSubjectRawValues, examLevel]);

  // 問題取得（科目ベース）
  const fetchQuestions = async (subject: string, subSubjectValues: string[], count: number) => {
    setLoading(true);
    setError(null);
    try {
      if (count <= 0) {
        setQuestions([]);
        setError('条件に合う問題がありません。科目または問題数を変更してください。');
        return;
      }
      let query = supabase
        .from('unified_cpl_questions')
        .select('*')
        .eq('verification_status', 'verified');
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
        setQuestions([]);
        setError(
          examLevel === 'ppl'
            ? 'PPL 基礎としてタグ付けされた問題がありません。出題レベルを「CPL すべて」にするか、別の科目を選んでください。'
            : '条件に合う問題がありません。フィルタ条件を変更してください。',
        );
        return;
      }
      const parsed: QuizQuestion[] = shuffled.map((q: any) => ({
        id: q.id,
        deck_id: q.deck_id || '',
        question_text: q.question_text || q.question || '問題文データ不備',
        text: q.question_text || q.question || '問題文データ不備',
        options: Array.isArray(q.options) && q.options.length === 4
          ? q.options.map((opt: any) => typeof opt === 'string' ? opt : (opt?.text || ''))
          : ['選択肢1', '選択肢2', '選択肢3', '選択肢4'],
        correct_option_index: typeof q.correct_answer === 'number' ? q.correct_answer - 1 : 0,
        explanation: q.explanation || '',
        explanation_image_url: q.explanation_image_url || null,
        difficulty_level: q.difficulty_level || 'medium',
        created_at: q.created_at,
        updated_at: q.updated_at,
        type: QuestionType.MULTIPLE_CHOICE,
        correctAnswer: typeof q.correct_answer === 'number' ? q.correct_answer - 1 : 0,
        main_subject: q.main_subject || undefined,
        sub_subject: q.sub_subject || undefined,
      }));
      setQuestions(parsed);
    } catch (err: any) {
      setError(err.message || '問題の取得に失敗しました');
      setQuestions([]);
    } finally {
      setLoading(false);
    }
  };

  // 問題取得（学習コンテンツのマッピング優先）
  const fetchMappedQuestions = async (learningContentId: string, count: number) => {
    setLoading(true);
    setError(null);
    try {
      if (count <= 0) {
        setQuestions([]);
        setError('条件に合う問題がありません。');
        return;
      }
      const { data, error } = await supabase
        .from('v_mapped_questions')
        .select('*')
        .eq('learning_content_id', learningContentId);
      if (error) throw error;
      const pool = Array.isArray(data) ? data : [];
      const shuffled = pool.sort(() => Math.random() - 0.5).slice(0, count);
      if (shuffled.length === 0) {
        setQuestions([]);
        setError('この記事に紐づく問題がありません。');
        return;
      }
      const parsed: QuizQuestion[] = shuffled.map((q: any) => ({
        id: q.id,
        deck_id: q.deck_id || '',
        question_text: q.question_text || q.question || '問題文データ不備',
        text: q.question_text || q.question || '問題文データ不備',
        options: Array.isArray(q.options) && q.options.length === 4
          ? q.options.map((opt: any) => (typeof opt === 'string' ? opt : (opt?.text || '')))
          : ['選択肢1', '選択肢2', '選択肢3', '選択肢4'],
        correct_option_index: typeof q.correct_answer === 'number' ? q.correct_answer - 1 : 0,
        explanation: q.explanation || '',
        explanation_image_url: q.explanation_image_url || null,
        difficulty_level: q.difficulty_level || 'medium',
        created_at: q.created_at,
        updated_at: q.updated_at,
        type: QuestionType.MULTIPLE_CHOICE,
        correctAnswer: typeof q.correct_answer === 'number' ? q.correct_answer - 1 : 0,
        main_subject: q.main_subject || undefined,
        sub_subject: q.sub_subject || undefined,
      }));
      setQuestions(parsed);
    } catch (err: any) {
      setError(err.message || '問題の取得に失敗しました');
      setQuestions([]);
    } finally {
      setLoading(false);
    }
  };

  // 問題取得（レビュー: SRS対象）
  const fetchReviewQuestions = async (count: number) => {
    setLoading(true);
    setError(null);
    try {
      const { data: authData } = await supabase.auth.getUser();
      const uid = authData?.user?.id;
      if (!uid) {
        setError('レビュー出題にはログインが必須です');
        setQuestions([]);
        return;
      }
      const { data: dueList, error: dueErr } = await supabase
        .from('user_unified_srs_status')
        .select('question_id')
        .lte('next_review_date', new Date().toISOString())
        .eq('user_id', uid)
        .limit(200);
      if (dueErr) throw dueErr;
      const ids = (dueList || []).map((r: any) => r.question_id).filter(Boolean);
      if (ids.length === 0) {
        setQuestions([]);
        setError('本日の復習対象はありません');
        return;
      }
      const pickIds = ids.sort(() => Math.random() - 0.5).slice(0, count);
      const { data: qData, error: qErr } = await supabase
        .from('unified_cpl_questions')
        .select('*')
        .in('id', pickIds);
      if (qErr) throw qErr;
      if (!qData || qData.length === 0) {
        setQuestions([]);
        setError('本日の復習対象はありません');
        return;
      }
      const parsed: QuizQuestion[] = (qData || []).map((q: any) => ({
        id: q.id,
        deck_id: q.deck_id || '',
        question_text: q.question_text || q.question || '問題文データ不備',
        text: q.question_text || q.question || '問題文データ不備',
        options: Array.isArray(q.options) && q.options.length === 4
          ? q.options.map((opt: any) => (typeof opt === 'string' ? opt : (opt?.text || '')))
          : ['選択肢1', '選択肢2', '選択肢3', '選択肢4'],
        correct_option_index: typeof q.correct_answer === 'number' ? q.correct_answer - 1 : 0,
        explanation: q.explanation || '',
        explanation_image_url: q.explanation_image_url || null,
        difficulty_level: q.difficulty_level || 'medium',
        created_at: q.created_at,
        updated_at: q.updated_at,
        type: QuestionType.MULTIPLE_CHOICE,
        correctAnswer: typeof q.correct_answer === 'number' ? q.correct_answer - 1 : 0,
        main_subject: q.main_subject || undefined,
        sub_subject: q.sub_subject || undefined,
      }));
      setQuestions(parsed);
    } catch (err: any) {
      setError(err.message || '復習問題の取得に失敗しました');
      setQuestions([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchParams: QuizFetchParams = {
    mode,
    main_subject: subjectSelected ? selectedSubject : undefined,
    sub_subject: selectedSubSubject === ALL_OPTION_VALUE ? undefined : selectedSubSubject,
    question_count: questionCount,
    content_id: contentId,
  };

  // フィルタ変更時にクイズ状態をリセット
  useEffect(() => {
    setRetryIncorrectMode(false);
    setQuizFinished(false);
    setUserAnswers([]);
    setFlaggedQuestionIds([]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSubject, selectedSubSubject, questionCount, mode, contentId, examLevel]);

  // クエリ/選択モード変更時に問題取得（retryIncorrectMode のときは再取得しない）
  useEffect(() => {
    if (retryIncorrectMode) return;
    if (fetchParams.mode === 'review') {
      fetchReviewQuestions(fetchParams.question_count);
    } else if (fetchParams.content_id) {
      fetchMappedQuestions(fetchParams.content_id, fetchParams.question_count);
    } else if (subjectSelected) {
      fetchQuestions(selectedSubject, selectedSubSubjectRawValues, fetchParams.question_count);
    } else {
      setQuestions([]);
      setError(null);
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSubject, selectedSubSubject, selectedSubSubjectRawValues, questionCount, contentId, mode, retryIncorrectMode, subjectSelected, examLevel]);

  // 回答送信
  const handleSubmitQuiz = async (answers: UserQuizAnswer[], flaggedIds?: string[]) => {
    setQuizFinished(true);
    setUserAnswers(answers);
    setFlaggedQuestionIds(flaggedIds ?? []);
    setSaving(true);
    setSaveError(null);
    try {
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError || !userData?.user) {
        setSaveError('結果を保存するにはログインが必須です。');
        setSaving(false);
        return;
      }
      const user_id = userData.user.id;
      // セッション記録（DB側で列が存在しない場合もあり、失敗しても継続）
      let sessionId: string | null = null;
      try {
        const sessionInsert = {
          user_id,
          session_type: mode === 'exam' ? 'exam' : mode === 'review' ? 'review' : 'practice',
          questions_attempted: answers.length,
          questions_correct: answers.filter(a => a.isCorrect).length,
          score_percentage: answers.length > 0 ? (answers.filter(a => a.isCorrect).length / answers.length) * 100 : 0,
          // answers 列がない場合もあるため省略
          completed_at: new Date().toISOString(),
          is_completed: true,
        } as Record<string, unknown>;
        const { data: sessionData, error: sessionError } = await supabase
          .from('quiz_sessions')
          .insert(sessionInsert)
          .select()
          .single();

        if (sessionError) {
          throw sessionError;
        }

        if (sessionData?.id) {
          sessionId = sessionData.id;
        }
      } catch (e) {
        // セッション保存に失敗しても致命的ではないためログのみ
        // eslint-disable-next-line no-console
        console.warn('quiz_sessions insert skipped:', e);
      }

      // 個別回答の保存（DBスキーマに合わせ、必須の question_id を含める）
      const isUuid = (v: unknown) => typeof v === 'string' && /^[0-9a-fA-F-]{36}$/.test(v);
      const questionMap = new Map(questions.map(q => [String(q.id), q]));
      const nowIso = new Date().toISOString();
      const testResults = answers.map(a => {
        const q = questionMap.get(String(a.questionId));
        const userAnswer = typeof a.answer === 'number' ? a.answer : Number(a.answer);
        const correct = (q as any)?.correct_option_index ?? (q as any)?.correctAnswer ?? null;
        const text = (q as any)?.text ?? (q as any)?.question_text ?? null;
        const main = (q as any)?.main_subject ?? (q as any)?.subject_category ?? null;
        const sub = (q as any)?.sub_subject;
        const subject = main && sub ? `${main} - ${sub}` : main;
        return {
          user_id,
          session_id: sessionId,
          question_id: String(a.questionId),
          unified_question_id: isUuid(a.questionId) ? a.questionId : null,
          question_text: text,
          user_answer: Number.isFinite(userAnswer) ? userAnswer : null,
          correct_answer: Number.isFinite(correct) ? Number(correct) : null,
          is_correct: !!a.isCorrect,
          answered_at: a.answeredAt ?? nowIso,
          learning_content_id: contentId ?? null,
          subject_category: subject,
        } as Record<string, unknown>;
      });
      const { error: resultError } = await supabase
        .from('user_test_results')
        .insert(testResults)
        .select();
      if (resultError) {
        // 400などの詳細をUIにも表示
        // eslint-disable-next-line no-console
        console.error('user_test_results insert error:', resultError);
        throw resultError;
      }

      // 学習時間・ヒートマップ用に learning_sessions へ記録（失敗しても致命的ではない）
      try {
        const totalResponseMs = answers.reduce(
          (sum, a) => sum + (typeof a.responseTimeMs === 'number' ? a.responseTimeMs : 0),
          0,
        );
        const sessionDurationSec = Math.max(60, Math.round(totalResponseMs / 1000));
        const sessionType = mode === 'exam' ? 'testing' : mode === 'review' ? 'review' : 'practice';
        const answeredAts = answers.map(a => a.answeredAt).filter((t): t is string => !!t);
        const firstAnswered = answeredAts.length > 0 ? answeredAts.reduce((a, b) => (a < b ? a : b)) : null;
        const lastAnswered = answeredAts.length > 0 ? answeredAts.reduce((a, b) => (a > b ? a : b)) : null;
        const wallClockSec =
          firstAnswered && lastAnswered
            ? Math.round((new Date(lastAnswered).getTime() - new Date(firstAnswered).getTime()) / 1000)
            : undefined;

        const { error: lsError } = await supabase.from('learning_sessions').insert({
          user_id: user_id,
          session_type: sessionType,
          content_id: contentId ?? 'cpl_quiz',
          content_type: 'test',
          session_duration: sessionDurationSec,
          session_metadata: {
            questions_attempted: answers.length,
            correct_count: answers.filter(a => a.isCorrect).length,
            mode,
            wall_clock_seconds: wallClockSec,
          },
        } as Record<string, unknown>);
        if (lsError) {
          // eslint-disable-next-line no-console
          console.warn('learning_sessions insert skipped:', lsError);
        }
      } catch (e) {
        // eslint-disable-next-line no-console
        console.warn('learning_sessions insert skipped:', e);
      }

      // ミッション達成をチェック
      try {
        await completeMissionByAction('quiz_pass');
      } catch (missionError) {
        // ミッション達成の失敗は致命的ではないためログのみ
        console.warn('Mission completion check failed:', missionError);
      }
    } catch (err: any) {
      try {
        const msg = typeof err === 'object' ? (err.message || JSON.stringify(err)) : String(err);
        setSaveError(msg || '回答結果の保存に失敗しました');
      } catch {
        setSaveError('回答結果の保存に失敗しました');
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-8" style={{ background: 'var(--bg)', color: 'var(--text-primary)' }}>
      {/* 戻るボタン */}
      <div className="mb-6">
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-brand-primary hover:text-brand-primary/80 border border-brand-primary/30 rounded-lg hover:border-brand-primary/50 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Home へ戻る
        </Link>
      </div>

      {/* モード切替 */}
      <div className="mb-6 flex justify-center gap-2">
        <button
          className={`px-4 py-2 rounded-lg border text-sm font-semibold transition ${mode === 'practice' ? 'bg-brand-primary/20 text-brand-primary border-brand-primary/40' : 'border-brand-primary/20 hover:bg-brand-primary/10 text-[var(--text-primary)]'}`}
          onClick={() => setMode('practice')}
          aria-pressed={mode === 'practice'}
        >Practice</button>
        <button
          className={`px-4 py-2 rounded-lg border text-sm font-semibold transition ${mode === 'exam' ? 'bg-brand-primary/20 text-brand-primary border-brand-primary/40' : 'border-brand-primary/20 hover:bg-brand-primary/10 text-[var(--text-primary)]'}`}
          onClick={() => setMode('exam')}
          aria-pressed={mode === 'exam'}
        >Exam</button>
        <button
          className={`px-4 py-2 rounded-lg border text-sm font-semibold transition ${mode === 'review' ? 'bg-brand-primary/20 text-brand-primary border-brand-primary/40' : 'border-brand-primary/20 hover:bg-brand-primary/10 text-[var(--text-primary)]'}`}
          onClick={() => setMode('review')}
          aria-pressed={mode === 'review'}
        >Review</button>
      </div>
      {mode === 'exam' && (
        <p className="text-center text-xs mb-2 text-[var(--text-muted)]">Examモード：解説は結果画面まで表示されません。</p>
      )}
      {mode === 'review' && (
        <p className="text-center text-xs mb-2 text-[var(--text-muted)]">Reviewモード：本日の復習対象（弱点復習）を出題します。ログイン必須。</p>
      )}

      <div className="mb-6 flex flex-col items-center gap-2">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-primary/70">出題レベル</p>
        <div className="flex flex-wrap justify-center gap-2">
          <button
            type="button"
            className={`px-4 py-2 rounded-lg border text-sm font-semibold transition ${examLevel === 'all' ? 'bg-brand-primary/20 text-brand-primary border-brand-primary/40' : 'border-brand-primary/20 hover:bg-brand-primary/10 text-[var(--text-primary)]'}`}
            onClick={() => setExamLevel('all')}
            disabled={filtersLocked}
            aria-pressed={examLevel === 'all'}
          >
            CPL すべて（既定）
          </button>
          <button
            type="button"
            className={`px-4 py-2 rounded-lg border text-sm font-semibold transition ${examLevel === 'ppl' ? 'bg-brand-primary/20 text-brand-primary border-brand-primary/40' : 'border-brand-primary/20 hover:bg-brand-primary/10 text-[var(--text-primary)]'}`}
            onClick={() => setExamLevel('ppl')}
            disabled={filtersLocked}
            aria-pressed={examLevel === 'ppl'}
          >
            PPL 基礎のみ
          </button>
        </div>
        <p className="text-center text-xs text-[var(--text-muted)] max-w-lg">
          PPL 基礎は <code className="text-[0.85em]">applicable_exams</code> に PPL を含む問題のみ。記事連携・Review ではフィルタしません。
          クエリ例: <code className="text-[0.85em]">?exam=ppl</code>
        </p>
        {examLevel === 'ppl' && pplVerifiedExactCount !== null && (
          <p className="text-center text-sm text-[var(--text-primary)] max-w-lg" data-testid="ppl-pool-count">
            現在の PPL 対象プール（verified）: <strong>{pplVerifiedExactCount}</strong> 問
            {pplVerifiedExactCount < 100 && (
              <span className="block mt-1 text-xs text-amber-600 dark:text-amber-400">
                プールは運用で拡張中です。科目に問題が無い場合は「CPL すべて」に切り替えてください。
              </span>
            )}
          </p>
        )}
        {examLevel === 'ppl' && !subjectLoading && (
          <p
            className="text-center text-xs text-[var(--text-muted)] max-w-lg"
            data-testid="ppl-main-subject-count"
          >
            PPL モードで選択可能な主科目: <strong>{selectableMainSubjectCount}</strong> 種（全5科目が揃うと最大5）
          </p>
        )}
        {examLevel === 'ppl' && selectableMainSubjectCount === 0 && !subjectLoading && (
          <div
            className="max-w-lg rounded-lg border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-center text-sm text-amber-900 dark:text-amber-100"
            role="status"
          >
            PPL タグ付きの問題がまだ登録されていないか、データ取得に失敗しました。ネットワークを確認するか、出題レベルを「CPL
            すべて」にしてください。
          </div>
        )}
      </div>

      <section className="mb-10 rounded-2xl border border-brand-primary/15 bg-[var(--panel)]/85 p-5 shadow-[0_18px_40px_rgba(11,18,32,0.28)]">
        <div className="mb-5 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.32em] text-brand-primary/70">Quiz Filters</p>
            <h2 className="mt-2 text-2xl font-semibold text-[var(--text-primary)]">出題条件を絞り込む</h2>
            <p className="mt-1 text-sm text-[var(--text-muted)]">
              科目を選んでから、サブ科目と問題数を決めて出題します。学習効率のため科目選択は必須です。
            </p>
          </div>
          <div className="rounded-xl border border-brand-primary/10 bg-[var(--bg)]/40 px-4 py-3 text-sm text-[var(--text-muted)]">
            {mode === 'review'
              ? 'Review では復習対象に合わせてフィルタを固定します。'
              : !subjectSelected
                ? '科目を選択してください'
                : selectedSubSubject !== ALL_OPTION_VALUE
                  ? `${selectedSubSubject} から ${questionCount} 問`
                  : `${selectedSubject} から ${questionCount} 問`}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-[1.05fr_1.35fr_1fr_0.8fr]">
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-brand-primary">科目</label>
            <FilterListbox
              value={selectedSubject}
              options={subjectListboxOptions}
              onChange={setSelectedSubject}
              disabled={subjectLoading || filtersLocked}
            />
            <input
              type="search"
              value={subjectSearch}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSubjectSearch(e.target.value)}
              placeholder="科目名で検索"
              className={FILTER_SEARCH_INPUT_CLASS}
              disabled={subjectLoading || filtersLocked}
            />
            <p className="text-xs text-[var(--text-muted)]">
              Practice と Exam では科目別に絞り込めます。下の検索欄は候補表示の絞り込み専用です。
            </p>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-brand-primary">サブ科目</label>
            <FilterListbox
              value={selectedSubSubject}
              options={subSubjectListboxOptions}
              onChange={setSelectedSubSubject}
              disabled={!subjectSelected || subSubjectLoading || filtersLocked}
            />
            <input
              type="search"
              value={subSubjectSearch}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSubSubjectSearch(e.target.value)}
              placeholder="サブ科目名で検索"
              className={FILTER_SEARCH_INPUT_CLASS}
              disabled={!subjectSelected || subSubjectLoading || filtersLocked}
            />
            <p className="text-xs text-[var(--text-muted)]">
              旧分類記号つきの表記は統合表示しています。件数は統合後の候補数です。下の検索欄は候補表示だけを絞り込みます。
            </p>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-brand-primary">並び順</label>
            <div className="grid grid-cols-2 gap-2 rounded-xl border border-brand-primary/15 bg-[var(--panel)]/55 p-2">
              <button
                type="button"
                className={`${SORT_TOGGLE_BASE_CLASS} ${sortOrder === 'priority' ? 'border-brand-primary bg-brand-primary/15 text-brand-primary' : 'border-brand-primary/20 text-[var(--text-primary)] hover:bg-brand-primary/10'}`}
                onClick={() => setSortOrder('priority')}
                disabled={filtersLocked}
                aria-pressed={sortOrder === 'priority'}
              >
                優先度順
              </button>
              <button
                type="button"
                className={`${SORT_TOGGLE_BASE_CLASS} ${sortOrder === 'syllabus' ? 'border-brand-primary bg-brand-primary/15 text-brand-primary' : 'border-brand-primary/20 text-[var(--text-primary)] hover:bg-brand-primary/10'}`}
                onClick={() => setSortOrder('syllabus')}
                disabled={filtersLocked}
                aria-pressed={sortOrder === 'syllabus'}
              >
                シラバス順
              </button>
            </div>
            <div className="rounded-xl border border-brand-primary/10 bg-[var(--panel)]/35 px-4 py-2 text-sm text-[var(--text-primary)]/90">
              {sortOrder === 'priority'
                ? '重要度平均と問題数を優先して、頻出トピックを先頭に表示します。'
                : '国交省シラバスに近い学習順で、科目とサブ科目を並べます。'}
            </div>
            <p className="text-xs text-[var(--text-muted)]">
              Review と記事連動出題ではフィルタを固定するため、この切替も無効化します。
            </p>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-brand-primary">問題数</label>
            <FilterListbox
              value={questionCount}
              options={questionCountListboxOptions}
              onChange={setQuestionCount}
              disabled={questionCountOptions.length === 0}
            />
            <p className="text-xs text-[var(--text-muted)]">選択条件に応じて上限を自動調整します。</p>
          </div>
        </div>
      </section>
      {loading ? (
        <div className="p-8 text-center text-lg">問題を取得中...</div>
      ) : error ? (
        <div className="p-8 text-center text-red-500">{error}</div>
      ) : quizFinished ? (
        <QuizResultsView
          userAnswers={userAnswers}
          questions={questions}
          saveError={saveError}
          saving={saving}
          onRetryAll={() => {
            setRetryIncorrectMode(false);
            setQuizFinished(false);
            setUserAnswers([]);
            setFlaggedQuestionIds([]);
            if (contentId) {
              fetchMappedQuestions(contentId, questionCount);
            } else if (mode === 'review') {
              fetchReviewQuestions(questionCount);
            } else {
              fetchQuestions(selectedSubject, selectedSubSubjectRawValues, questionCount);
            }
          }}
          onRetryIncorrect={() => {
            const incorrectIds = new Set(userAnswers.filter(a => !a.isCorrect).map(a => a.questionId));
            const incorrectQuestions = questions.filter(q => incorrectIds.has(String(q.id)));
            if (incorrectQuestions.length === 0) return;
            setQuestions(incorrectQuestions);
            setQuizFinished(false);
            setUserAnswers([]);
            setRetryIncorrectMode(true);
          }}
          onRetryFlagged={() => {
            const flaggedSet = new Set(flaggedQuestionIds);
            const flaggedQuestions = questions.filter(q => flaggedSet.has(String(q.id)));
            if (flaggedQuestions.length === 0) return;
            setQuestions(flaggedQuestions);
            setQuizFinished(false);
            setUserAnswers([]);
            setRetryIncorrectMode(true);
          }}
          onRetryFlaggedAndIncorrect={() => {
            const incorrectIds = new Set(userAnswers.filter(a => !a.isCorrect).map(a => a.questionId));
            const combinedIds = new Set([...incorrectIds, ...flaggedQuestionIds]);
            const combinedQuestions = questions.filter(q => combinedIds.has(String(q.id)));
            if (combinedQuestions.length === 0) return;
            setQuestions(combinedQuestions);
            setQuizFinished(false);
            setUserAnswers([]);
            setRetryIncorrectMode(true);
          }}
          incorrectCount={userAnswers.filter(a => !a.isCorrect).length}
          flaggedCount={flaggedQuestionIds.length}
          flaggedAndIncorrectCount={
            new Set([
              ...userAnswers.filter(a => !a.isCorrect).map(a => a.questionId),
              ...flaggedQuestionIds,
            ]).size
          }
          contentId={contentId}
        />
      ) : questions.length === 0 ? (
        <div className="rounded-2xl border border-brand-primary/15 bg-[var(--panel)]/80 p-10 text-center shadow-lg">
          <p className="text-lg font-semibold text-[var(--text-primary)]">
            {!subjectSelected && (mode === 'practice' || mode === 'exam')
              ? '科目を選択してください'
              : '出題できる問題が見つかりませんでした。'}
          </p>
          <p className="mt-2 text-sm text-[var(--text-muted)]">
            {!subjectSelected && (mode === 'practice' || mode === 'exam')
              ? '科目を選ぶと、サブ科目と問題数で出題条件を絞り込めます。'
              : '科目・サブ科目・モードを変更して再度お試しください。'}
          </p>
        </div>
      ) : (
        <QuizComponent
          quizTitle={retryIncorrectMode ? `不正解復習 (${questions.length}問)` : `${selectedSubject} 4択テスト`}
          questions={questions}
          onSubmitQuiz={handleSubmitQuiz}
          onBackToContents={() => { }}
          mode={mode}
          showImmediateFeedback={mode !== 'exam'}
          showQuestionPalette={true}
          examDurationSec={Math.max(questionCount * 60, 300)}
          generalMessages={{
            submitAnswer: '解答する',
            correct: '正解',
            incorrect: '不正解',
            startQuiz: 'テスト開始',
            quizSummary: 'テスト結果',
            showAnswer: '解説を表示',
            hideAnswer: '解説を隠す',
            nextQuestion: '次の問題',
            finishQuiz: 'テスト終了',
          }}
        />
      )}
    </div>
  );
};

export default TestPage;
