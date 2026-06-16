import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ArrowLeft, BookOpen } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { useGamification } from '../../hooks/useGamification';
import { QuizQuestion, UserQuizAnswer } from '../../types/quiz';
import supabase from '../../utils/supabase';
import { awardQuizSessionXp } from '../../utils/awardQuizSessionXp';
import { syncStreakToUserLearningProfile } from '../../utils/streak';
import { QuizActiveFilterChips } from './components/QuizActiveFilterChips';
import { QuizComponent } from './components/QuizComponent';
import { QuizFilterDrawer } from './components/QuizFilterDrawer';
import { QuizHubToolbar } from './components/QuizHubToolbar';
import { QuizResultsView } from './components/QuizResultsView';
import { TestSubjectFilterSection } from './components/TestSubjectFilterSection';
import { WeakAreasHero } from './components/WeakAreasHero';
import { useTestSubjectFilters } from './hooks/useTestSubjectFilters';
import { LeaderboardOptInCta } from '../../components/learning/LeaderboardOptInCta';
import { LEARNING_ARTICLES_HUB_LABEL } from '../../constants/learningArticleNav';
import { useAuthStore } from '../../stores/authStore';
import {
  trackQuizFilterOpen,
  trackQuizSessionComplete,
  trackQuizSessionStart,
} from '../../lib/quizAnalytics';
import { ALL_OPTION_VALUE, type FilterSortOrder } from './testFilterOptionUtils';
import {
  fetchDiagnosticQuestionsPool,
  fetchMappedQuestionsPool,
  fetchQuestionPreviewById,
  fetchReviewQuestionsPool,
  fetchSubjectQuestionsPool,
} from './testQuizFetch';
import {
  buildTestHubSearchParams,
  countActiveTestFilters,
  getVisibleTestHubTabs,
  hubStateToFetchMode,
  isTestFiltersLocked,
  parseLegacyTestHubParams,
  parseTestHubSearchParams,
  PLACEHOLDER_SUBJECT,
  type TestHubState,
  type TestHubTab,
} from './testHubFilters';
import { scrollToQuizAnchor } from './utils/scrollToQuizAnchor';
import { buildQuizLearningSessionInsert } from './utils/buildQuizLearningSession';

/** Supabase / PostgREST エラーをユーザー向け文言に変換 */
function formatQuizSaveError(err: unknown): string {
  if (err && typeof err === 'object' && 'message' in err) {
    const message = (err as { message?: unknown }).message;
    if (typeof message === 'string' && message.trim()) return message;
  }
  if (err instanceof Error && err.message) return err.message;
  return '回答結果の保存に失敗しました';
}

const TestPage: React.FC = () => {
  const queryClient = useQueryClient();
  const { completeMissionByAction } = useGamification();
  const profile = useAuthStore((s) => s.profile);
  const user = useAuthStore((s) => s.user);
  const [searchParams, setSearchParams] = useSearchParams();
  const hubState = useMemo(() => parseTestHubSearchParams(searchParams), [searchParams]);
  const previewQuestionId = searchParams.get('previewQuestion');
  const visibleTabs = useMemo(() => getVisibleTestHubTabs(hubState.contentId), [hubState.contentId]);

  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
  const [diagnosticStarted, setDiagnosticStarted] = useState(hubState.tab !== 'diagnostic');
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quizFinished, setQuizFinished] = useState(false);
  const [userAnswers, setUserAnswers] = useState<UserQuizAnswer[]>([]);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [retryIncorrectMode, setRetryIncorrectMode] = useState(false);
  const [flaggedQuestionIds, setFlaggedQuestionIds] = useState<string[]>([]);
  const sessionStartedRef = useRef(false);
  const quizResultsAnchorRef = useRef<HTMLDivElement>(null);
  const quizContentAnchorRef = useRef<HTMLDivElement>(null);
  const scrollToQuizPendingRef = useRef(false);

  const selectedSubject = hubState.subject;
  const selectedSubSubject = hubState.sub;
  const questionCount = hubState.count;
  const mode = hubStateToFetchMode(hubState);
  const contentId = hubState.contentId;
  const sortOrder = hubState.sort as FilterSortOrder;
  const examLevel = hubState.exam;
  const filtersLocked = isTestFiltersLocked(hubState);

  const updateHubState = useCallback(
    (partial: Partial<TestHubState>) => {
      const next: TestHubState = { ...hubState, ...partial };
      if (partial.tab === 'review') {
        next.mode = 'review';
      } else if (partial.tab === 'diagnostic') {
        next.mode = 'practice';
        next.subject = PLACEHOLDER_SUBJECT;
      } else if (partial.tab === 'subject' && next.subject === PLACEHOLDER_SUBJECT) {
        next.mode = next.mode === 'review' ? 'practice' : next.mode;
      }
      setSearchParams(buildTestHubSearchParams(next), { replace: true });
    },
    [hubState, setSearchParams],
  );

  const subjectFilters = useTestSubjectFilters({
    selectedSubject,
    selectedSubSubject,
    questionCount,
    sortOrder,
    examLevel,
    updateHubState,
  });

  const {
    subjectSearch,
    setSubjectSearch,
    subjectLoading,
    subSubjectSearch,
    setSubSubjectSearch,
    subSubjectLoading,
    questionCountOptions,
    pplVerifiedExactCount,
    selectableMainSubjectCount,
    subjectSelected,
    selectedSubSubjectRawValues,
    subjectListboxOptions,
    subSubjectListboxOptions,
  } = subjectFilters;

  useEffect(() => {
    const hasLegacy =
      searchParams.has('mode') ||
      searchParams.has('subject') ||
      searchParams.has('contentId') ||
      searchParams.has('exam');
    if (!searchParams.has('tab') && hasLegacy) {
      const canonical = buildTestHubSearchParams(parseTestHubSearchParams(searchParams));
      if (canonical.toString() !== searchParams.toString()) {
        setSearchParams(canonical, { replace: true });
      }
    }
    void parseLegacyTestHubParams(searchParams);
  }, [searchParams, setSearchParams]);

  useEffect(() => {
    setDiagnosticStarted(hubState.tab !== 'diagnostic');
  }, [hubState.tab]);

  const requestScrollToQuiz = useCallback(() => {
    scrollToQuizPendingRef.current = true;
  }, []);

  useEffect(() => {
    if (!scrollToQuizPendingRef.current) return;
    if (hubState.tab === 'diagnostic' && !diagnosticStarted) return;
    if (loading) {
      scrollToQuizAnchor(quizContentAnchorRef.current);
      return;
    }
    scrollToQuizPendingRef.current = false;
    scrollToQuizAnchor(quizContentAnchorRef.current);
  }, [loading, hubState.tab, diagnosticStarted, questions.length, error]);

  const runFetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      let result: { questions: QuizQuestion[]; error: string | null };
      if (previewQuestionId) {
        result = await fetchQuestionPreviewById(previewQuestionId);
      } else if (hubState.tab === 'diagnostic') {
        result = await fetchDiagnosticQuestionsPool(questionCount, examLevel);
      } else if (mode === 'review' || hubState.tab === 'review') {
        result = await fetchReviewQuestionsPool(questionCount, examLevel);
      } else if (contentId) {
        result = await fetchMappedQuestionsPool(contentId, questionCount);
      } else if (subjectSelected) {
        result = await fetchSubjectQuestionsPool(
          selectedSubject,
          selectedSubSubjectRawValues,
          questionCount,
          examLevel,
        );
      } else {
        setQuestions([]);
        setError(null);
        setLoading(false);
        return;
      }
      setQuestions(result.questions);
      setError(result.error);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : '問題の取得に失敗しました';
      setError(message);
      setQuestions([]);
    } finally {
      setLoading(false);
    }
  }, [
    previewQuestionId,
    hubState.tab,
    mode,
    contentId,
    subjectSelected,
    questionCount,
    examLevel,
    selectedSubject,
    selectedSubSubjectRawValues,
  ]);

  useEffect(() => {
    setRetryIncorrectMode(false);
    setQuizFinished(false);
    setUserAnswers([]);
    setFlaggedQuestionIds([]);
    sessionStartedRef.current = false;
  }, [selectedSubject, selectedSubSubject, questionCount, mode, contentId, examLevel, hubState.tab, diagnosticStarted]);

  useEffect(() => {
    if (retryIncorrectMode) return;
    if (!previewQuestionId && hubState.tab === 'diagnostic' && !diagnosticStarted) {
      setQuestions([]);
      setError(null);
      setLoading(false);
      return;
    }
    void runFetch();
  }, [retryIncorrectMode, previewQuestionId, hubState.tab, diagnosticStarted, runFetch]);

  useEffect(() => {
    if (questions.length > 0 && !quizFinished && !sessionStartedRef.current) {
      sessionStartedRef.current = true;
      trackQuizSessionStart({
        tab: hubState.tab,
        mode,
        count: questions.length,
        subject: subjectSelected ? selectedSubject : undefined,
      });
    }
  }, [questions.length, quizFinished, hubState.tab, mode, selectedSubject, subjectSelected]);

  useEffect(() => {
    if (!quizFinished) return;
    const el = quizResultsAnchorRef.current;
    if (!el) return;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const behavior: ScrollBehavior = reducedMotion ? 'auto' : 'smooth';
    const raf = window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        el.scrollIntoView({ behavior, block: 'start' });
      });
    });
    return () => window.cancelAnimationFrame(raf);
  }, [quizFinished]);

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
      let sessionId: string | null = null;
      try {
        const sessionInsert = {
          user_id,
          session_type: mode === 'exam' ? 'exam' : mode === 'review' ? 'review' : 'practice',
          questions_attempted: answers.length,
          questions_correct: answers.filter((a) => a.isCorrect).length,
          score_percentage:
            answers.length > 0 ? (answers.filter((a) => a.isCorrect).length / answers.length) * 100 : 0,
          completed_at: new Date().toISOString(),
          is_completed: true,
        } as Record<string, unknown>;
        const { data: sessionData, error: sessionError } = await supabase
          .from('quiz_sessions')
          .insert(sessionInsert)
          .select()
          .single();
        if (sessionError) throw sessionError;
        if (sessionData?.id) sessionId = sessionData.id;
      } catch (e) {
        console.warn('quiz_sessions insert skipped:', e);
      }

      const isUuid = (v: unknown) => typeof v === 'string' && /^[0-9a-fA-F-]{36}$/.test(v);
      const questionMap = new Map(questions.map((q) => [String(q.id), q]));
      const nowIso = new Date().toISOString();
      const testResults = answers.map((a) => {
        const q = questionMap.get(String(a.questionId));
        const userAnswer = typeof a.answer === 'number' ? a.answer : Number(a.answer);
        const correct = (q as { correct_option_index?: number; correctAnswer?: number })?.correct_option_index ??
          (q as { correctAnswer?: number })?.correctAnswer ?? null;
        const text = (q as { text?: string; question_text?: string })?.text ??
          (q as { question_text?: string })?.question_text ?? null;
        const main = (q as { main_subject?: string; subject_category?: string })?.main_subject ??
          (q as { subject_category?: string })?.subject_category ?? null;
        const sub = (q as { sub_subject?: string })?.sub_subject;
        const subject = main && sub ? `${main} - ${sub}` : main;
        const row: Record<string, unknown> = {
          user_id,
          question_id: isUuid(a.questionId) ? a.questionId : null,
          user_answer: userAnswer,
          correct_answer: correct,
          is_correct: a.isCorrect,
          question_text: text,
          subject_category: subject,
          answered_at: nowIso,
        };
        if (sessionId) row.session_id = sessionId;
        if (typeof a.responseTimeMs === 'number') {
          row.response_time_seconds = Math.max(0, Math.round(a.responseTimeMs / 1000));
        }
        return row;
      });
      const { error: insertError } = await supabase.from('user_test_results').insert(testResults);
      if (insertError) throw insertError;

      try {
        await syncStreakToUserLearningProfile(user_id);
      } catch (streakErr) {
        console.warn('streak sync skipped:', streakErr);
      }

      try {
        const learningSession = buildQuizLearningSessionInsert({
          userId: user_id,
          answers,
          mode: mode as 'practice' | 'exam' | 'review',
          tab: hubState.tab,
          contentId,
          quizSessionId: sessionId,
          endedAtIso: nowIso,
        });
        const { error: lsError } = await supabase.from('learning_sessions').insert(learningSession);
        if (lsError) console.warn('learning_sessions insert skipped:', lsError);
      } catch (e) {
        console.warn('learning_sessions insert skipped:', e);
      }

      try {
        await completeMissionByAction('quiz_pass');
      } catch (missionError) {
        console.warn('Mission completion check failed:', missionError);
      }

      if (sessionId) {
        try {
          await awardQuizSessionXp({
            userId: user_id,
            sessionId,
            correctCount: answers.filter((a) => a.isCorrect).length,
            totalQuestions: answers.length,
            mode: mode as 'practice' | 'exam' | 'review',
            queryClient,
          });
        } catch (xpErr) {
          console.warn('quiz session XP award skipped:', xpErr);
        }
      }

      trackQuizSessionComplete({
        score_pct:
          answers.length > 0 ? (answers.filter((a) => a.isCorrect).length / answers.length) * 100 : 0,
        count: answers.length,
        mode,
      });
    } catch (err: unknown) {
      setSaveError(formatQuizSaveError(err));
    } finally {
      setSaving(false);
    }
  };

  const handleRetryAll = () => {
    setRetryIncorrectMode(false);
    setQuizFinished(false);
    setUserAnswers([]);
    setFlaggedQuestionIds([]);
    void runFetch();
  };

  return (
    <div className="max-w-2xl mx-auto py-8" style={{ background: 'var(--bg)', color: 'var(--text-primary)' }}>
      <div className="mb-6 flex flex-wrap items-center gap-2">
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-brand-primary hover:text-brand-primary/80 border border-brand-primary/30 rounded-lg hover:border-brand-primary/50 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Home へ戻る
        </Link>
        <Link
          to="/articles"
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-brand-primary hover:text-brand-primary/80 border border-brand-primary/30 rounded-lg hover:border-brand-primary/50 transition-colors"
        >
          <BookOpen className="w-4 h-4" aria-hidden />
          {LEARNING_ARTICLES_HUB_LABEL}
        </Link>
        {contentId && (
          <Link
            to={`/articles/${contentId}`}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-brand-primary hover:text-brand-primary/80 border border-brand-primary/40 rounded-lg hover:border-brand-primary/60 transition-colors"
          >
            <BookOpen className="w-4 h-4" aria-hidden />
            この単元の記事へ
          </Link>
        )}
      </div>

      {(hubState.tab === 'review' || hubState.tab === 'diagnostic') && (
        <WeakAreasHero
          userId={user?.id}
          onStartReview={() => {
            requestScrollToQuiz();
            updateHubState({ tab: 'review' });
          }}
        />
      )}

      <QuizHubToolbar
        state={hubState}
        visibleTabs={visibleTabs}
        onTabChange={(tab: TestHubTab) => updateHubState({ tab })}
        onSortChange={(sort) => updateHubState({ sort })}
        onOpenFilters={() => {
          trackQuizFilterOpen(hubState.tab, hubState.exam);
          setFilterDrawerOpen(true);
        }}
        activeFilterCount={countActiveTestFilters(hubState)}
        onStartDiagnostic={() => {
          requestScrollToQuiz();
          setDiagnosticStarted(true);
        }}
        diagnosticDisabled={diagnosticStarted && loading}
      />

      <QuizActiveFilterChips
        state={hubState}
        onClearExam={() => updateHubState({ exam: 'all' })}
        onClearMode={() => updateHubState({ mode: 'practice' })}
        onClearSub={() => updateHubState({ sub: ALL_OPTION_VALUE })}
        onClearCount={() => updateHubState({ count: 10 })}
        onClearSort={() => updateHubState({ sort: 'priority' })}
      />

      <QuizFilterDrawer
        open={filterDrawerOpen}
        state={hubState}
        filtersLocked={filtersLocked}
        onClose={() => setFilterDrawerOpen(false)}
        onExamChange={(exam) => updateHubState({ exam })}
        onModeChange={(m) => updateHubState({ mode: m })}
        onCountChange={(c) => updateHubState({ count: c })}
        questionCountOptions={
          hubState.tab === 'diagnostic'
            ? [5, 10, 15, 20]
            : questionCountOptions.length > 0
              ? questionCountOptions
              : [hubState.count]
        }
      >
        {examLevel === 'ppl' && pplVerifiedExactCount !== null && (
          <p className="text-sm text-[var(--text-primary)]" data-testid="ppl-pool-count">
            現在の PPL 対象プール: <strong>{pplVerifiedExactCount}</strong> 問
          </p>
        )}
        {examLevel === 'ppl' && !subjectLoading && (
          <p className="text-xs text-[var(--text-muted)]" data-testid="ppl-main-subject-count">
            選択可能な主科目: <strong>{selectableMainSubjectCount}</strong> 種
          </p>
        )}
      </QuizFilterDrawer>

      {previewQuestionId ? (
        <p className="mb-4 rounded-xl border border-brand-primary/25 bg-brand-primary/10 px-4 py-3 text-center text-sm text-[var(--text-primary)]">
          報告問題プレビュー — 管理者確認用に1問だけ表示しています。
        </p>
      ) : null}

      {hubState.tab === 'review' && !previewQuestionId && (
        <p className="mb-4 text-center text-xs text-[var(--text-muted)]">
          弱点復習 — SRS 対象または弱点データから出題します（ログイン必須）。
        </p>
      )}

      {hubState.tab === 'content' && contentId && (
        <p className="mb-4 text-center text-sm text-[var(--text-muted)]">
          記事連動モード — この単元に紐づく問題から出題します。
        </p>
      )}

      {hubState.tab === 'subject' && (
        <TestSubjectFilterSection
          selectedSubject={selectedSubject}
          selectedSubSubject={selectedSubSubject}
          subjectListboxOptions={subjectListboxOptions}
          subSubjectListboxOptions={subSubjectListboxOptions}
          subjectSearch={subjectSearch}
          subSubjectSearch={subSubjectSearch}
          subjectLoading={subjectLoading}
          subSubjectLoading={subSubjectLoading}
          subjectSelected={subjectSelected}
          filtersLocked={filtersLocked}
          onSubjectChange={(v) => updateHubState({ subject: v, tab: 'subject' })}
          onSubSubjectChange={(v) => updateHubState({ sub: v })}
          onSubjectSearchChange={setSubjectSearch}
          onSubSubjectSearchChange={setSubSubjectSearch}
        />
      )}

      <div ref={quizContentAnchorRef} className="scroll-mt-20 md:scroll-mt-24">
      {loading ? (
        <div className="p-8 text-center text-lg">問題を取得中...</div>
      ) : error ? (
        <div className="p-8 text-center text-red-500">{error}</div>
      ) : quizFinished ? (
        <div ref={quizResultsAnchorRef} className="scroll-mt-20 md:scroll-mt-24">
          <QuizResultsView
            userAnswers={userAnswers}
            questions={questions}
            saveError={saveError}
            saving={saving}
            onRetryAll={handleRetryAll}
            onRetryIncorrect={() => {
              const incorrectIds = new Set(userAnswers.filter((a) => !a.isCorrect).map((a) => a.questionId));
              const incorrectQuestions = questions.filter((q) => incorrectIds.has(String(q.id)));
              if (incorrectQuestions.length === 0) return;
              setQuestions(incorrectQuestions);
              setQuizFinished(false);
              setUserAnswers([]);
              setRetryIncorrectMode(true);
            }}
            onRetryFlagged={() => {
              const flaggedSet = new Set(flaggedQuestionIds);
              const flaggedQuestions = questions.filter((q) => flaggedSet.has(String(q.id)));
              if (flaggedQuestions.length === 0) return;
              setQuestions(flaggedQuestions);
              setQuizFinished(false);
              setUserAnswers([]);
              setRetryIncorrectMode(true);
            }}
            onRetryFlaggedAndIncorrect={() => {
              const incorrectIds = new Set(userAnswers.filter((a) => !a.isCorrect).map((a) => a.questionId));
              const combinedIds = new Set([...incorrectIds, ...flaggedQuestionIds]);
              const combinedQuestions = questions.filter((q) => combinedIds.has(String(q.id)));
              if (combinedQuestions.length === 0) return;
              setQuestions(combinedQuestions);
              setQuizFinished(false);
              setUserAnswers([]);
              setRetryIncorrectMode(true);
            }}
            incorrectCount={userAnswers.filter((a) => !a.isCorrect).length}
            flaggedCount={flaggedQuestionIds.length}
            flaggedAndIncorrectCount={
              new Set([
                ...userAnswers.filter((a) => !a.isCorrect).map((a) => a.questionId),
                ...flaggedQuestionIds,
              ]).size
            }
            contentId={contentId}
            selectedSubjectForFallback={subjectSelected ? selectedSubject : null}
            reportMeta={{ mode, tab: hubState.tab, content_id: contentId ?? null }}
          />
          {profile && profile.leaderboard_opt_in !== true && !saveError && !saving ? (
            <div className="mt-4 max-w-2xl mx-auto px-2">
              <LeaderboardOptInCta
                optedIn={profile.leaderboard_opt_in === true}
                variant="inline"
                dismissStorageKey="leaderboard_cta_dismiss_test_v1"
              />
            </div>
          ) : null}
        </div>
      ) : questions.length === 0 ? (
        <div className="rounded-2xl border border-brand-primary/15 bg-[var(--panel)]/80 p-10 text-center shadow-lg">
          <p className="text-lg font-semibold text-[var(--text-primary)]">
            {hubState.tab === 'diagnostic' && !diagnosticStarted
              ? '上の「10問診断を開始」をタップしてください'
              : hubState.tab === 'subject' && !subjectSelected
                ? '科目を選択してください'
                : '出題できる問題が見つかりませんでした。'}
          </p>
          <p className="mt-2 text-sm text-[var(--text-muted)]">
            {hubState.tab === 'diagnostic'
              ? '診断は全科目から重要度の高い問題を出題します。'
              : hubState.tab === 'subject' && !subjectSelected
                ? '科目を選ぶと、サブ科目と問題数で出題条件を絞り込めます。'
                : 'タブ・フィルタを変更して再度お試しください。'}
          </p>
        </div>
      ) : (
        <QuizComponent
          quizTitle={
            retryIncorrectMode
              ? `不正解復習 (${questions.length}問)`
              : hubState.tab === 'diagnostic'
                ? `実力診断 (${questions.length}問)`
                : `${selectedSubject} 4択テスト`
          }
          questions={questions}
          onSubmitQuiz={handleSubmitQuiz}
          onBackToContents={() => {}}
          mode={mode}
          showImmediateFeedback={mode !== 'exam'}
          showQuestionPalette
          examDurationSec={Math.max(questionCount * 60, 300)}
          reportMeta={{ tab: hubState.tab, contentId }}
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
    </div>
  );
};

export default TestPage;
