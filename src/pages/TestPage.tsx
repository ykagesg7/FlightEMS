import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { QuizComponent } from '../components/QuizComponent';
import { useTheme } from '../contexts/ThemeContext';
import { QuestionType, QuizQuestion, UserQuizAnswer } from '../types/quiz';
import supabase from '../utils/supabase';
import { useGamification } from '../hooks/useGamification';

const TestPage: React.FC = () => {
  const { effectiveTheme: theme } = useTheme();
  const { completeMissionByAction } = useGamification();
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quizFinished, setQuizFinished] = useState(false);
  const [userAnswers, setUserAnswers] = useState<UserQuizAnswer[]>([]);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [subjects, setSubjects] = useState<string[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [subjectLoading, setSubjectLoading] = useState(true);
  const [subSubjects, setSubSubjects] = useState<string[]>([]);
  const [selectedSubSubject, setSelectedSubSubject] = useState<string>('all');
  const [subSubjectLoading, setSubSubjectLoading] = useState(false);
  const [questionCount, setQuestionCount] = useState<number>(10);
  // 最大値は選択肢生成のみに使用するため、状態として保持しない
  const [questionCountOptions, setQuestionCountOptions] = useState<number[]>([10]);
  const [mode, setMode] = useState<'practice' | 'exam' | 'review'>('practice');
  const [contentId, setContentId] = useState<string | null>(null);

  // クエリパラメータから初期値を設定
  const [sp] = useSearchParams();
  useEffect(() => {
    const qs = sp.get('subject') || 'all';
    const qss = sp.get('sub') || 'all';
    const qc = Number(sp.get('count') || '10');
    const qm = (sp.get('mode') as 'practice' | 'exam' | 'review') || 'practice';
    const cid = sp.get('contentId');

    setSelectedSubject(qs);
    setSelectedSubSubject(qss);
    setQuestionCount(Number.isFinite(qc) && qc > 0 ? qc : 10);
    setMode(qm);
    setContentId(cid);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // main_subject一覧取得
  useEffect(() => {
    const fetchSubjects = async () => {
      setSubjectLoading(true);
      try {
        const { data, error } = await supabase
          .from('unified_cpl_questions')
          .select('main_subject', { count: 'exact', head: false });
        if (error) throw error;
        const uniqueSubjects = Array.from(
          new Set(
            ((data ?? []) as Array<{ main_subject: unknown }>)
              .map((q) => q.main_subject)
              .filter((s): s is string => typeof s === 'string' && s.length > 0)
          )
        );
        setSubjects(['all', ...uniqueSubjects]);
      } catch (err: any) {
        setSubjects(['all']);
      } finally {
        setSubjectLoading(false);
      }
    };
    fetchSubjects();
  }, []);

  // main_subject選択時にsub_subject一覧取得
  useEffect(() => {
    if (!selectedSubject || selectedSubject === 'all') {
      setSubSubjects([]);
      setSelectedSubSubject('all');
      return;
    }
    setSubSubjectLoading(true);
    const fetchSubSubjects = async () => {
      try {
        const { data, error } = await supabase
          .from('unified_cpl_questions')
          .select('sub_subject', { count: 'exact', head: false })
          .eq('main_subject', selectedSubject);
        if (error) throw error;
        const uniqueSubSubjects = Array.from(
          new Set(
            ((data ?? []) as Array<{ sub_subject: unknown }>)
              .map((q) => q.sub_subject)
              .filter((s): s is string => typeof s === 'string' && s.length > 0)
          )
        );
        setSubSubjects(['all', ...uniqueSubSubjects]);
        setSelectedSubSubject('all');
      } catch (err: any) {
        setSubSubjects(['all']);
        setSelectedSubSubject('all');
      } finally {
        setSubSubjectLoading(false);
      }
    };
    fetchSubSubjects();
  }, [selectedSubject]);

  // main_subject, sub_subject選択時に該当問題数をカウントし最大値を更新
  useEffect(() => {
    const fetchCount = async () => {
      let query = supabase
        .from('unified_cpl_questions')
        .select('*', { count: 'exact', head: true })
        .eq('verification_status', 'verified');
      if (selectedSubject && selectedSubject !== 'all') {
        query = query.eq('main_subject', selectedSubject);
        if (selectedSubSubject && selectedSubSubject !== 'all') {
          query = query.eq('sub_subject', selectedSubSubject);
        }
      }
      const { count, error } = await query;
      let maxCount = count || 0;
      if (error) maxCount = 0;
      // 10未満なら最大値のみ、10以上なら10から最大値まで5問単位
      let options: number[] = [];
      if (maxCount < 10) {
        options = maxCount > 0 ? [maxCount] : [10];
      } else {
        for (let i = 10; i <= maxCount; i += 5) {
          options.push(i);
        }
        if (options[options.length - 1] !== maxCount) options.push(maxCount);
      }
      setQuestionCountOptions(options);
      setQuestionCount(options[0]);
    };
    fetchCount();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSubject, selectedSubSubject]);

  // 問題取得（科目ベース）
  const fetchQuestions = async (subject: string, subSubject: string, count: number) => {
    setLoading(true);
    setError(null);
    try {
      let query = supabase
        .from('unified_cpl_questions')
        .select('*')
        .eq('verification_status', 'verified');
      if (subject && subject !== 'all') {
        query = query.eq('main_subject', subject);
        if (subSubject && subSubject !== 'all') {
          query = query.eq('sub_subject', subSubject);
        }
      }
      const { data, error } = await query;
      if (error) throw error;
      if (!data) throw new Error('データが取得できませんでした');
      const shuffled = data.sort(() => Math.random() - 0.5).slice(0, count);
      const parsed: QuizQuestion[] = shuffled.map((q: any) => ({
        id: q.id,
        deck_id: q.deck_id || '',
        question_text: q.question_text || q.question || '（問題文データ不備）',
        text: q.question_text || q.question || '（問題文データ不備）',
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
      }));
      setQuestions(parsed);
    } catch (err: any) {
      setError(err.message || '問題の取得に失敗しました');
      setQuestions([]);
    } finally {
      setLoading(false);
    }
  };

  // 問題取得（学習コンテンツとのマッピング優先）
  const fetchMappedQuestions = async (learningContentId: string, count: number) => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from('v_mapped_questions')
        .select('*')
        .eq('learning_content_id', learningContentId);
      if (error) throw error;
      const pool = Array.isArray(data) ? data : [];
      const shuffled = pool.sort(() => Math.random() - 0.5).slice(0, count);
      const parsed: QuizQuestion[] = shuffled.map((q: any) => ({
        id: q.id,
        deck_id: q.deck_id || '',
        question_text: q.question_text || q.question || '（問題文データ不備）',
        text: q.question_text || q.question || '（問題文データ不備）',
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
        setError('レビュー出題にはログインが必要です');
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
      const parsed: QuizQuestion[] = (qData || []).map((q: any) => ({
        id: q.id,
        deck_id: q.deck_id || '',
        question_text: q.question_text || q.question || '（問題文データ不備）',
        text: q.question_text || q.question || '（問題文データ不備）',
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
      }));
      setQuestions(parsed);
    } catch (err: any) {
      setError(err.message || '復習問題の取得に失敗しました');
      setQuestions([]);
    } finally {
      setLoading(false);
    }
  };

  // クエリ/選択/モード変更時の問題取得
  useEffect(() => {
    if (mode === 'review') {
      fetchReviewQuestions(questionCount);
    } else if (contentId) {
      fetchMappedQuestions(contentId, questionCount);
    } else {
      fetchQuestions(selectedSubject, selectedSubSubject, questionCount);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSubject, selectedSubSubject, questionCount, contentId, mode]);

  // 回答送信
  const handleSubmitQuiz = async (answers: UserQuizAnswer[]) => {
    setQuizFinished(true);
    setUserAnswers(answers);
    setSaving(true);
    setSaveError(null);
    try {
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError || !userData?.user) {
        setSaveError('結果を保存するにはログインが必要です。');
        setSaving(false);
        return;
      }
      const user_id = userData.user.id;
      // セッション記録（DB側で列が存在しない環境も考慮し、失敗しても継続）
      try {
        const sessionInsert = {
          user_id,
          session_type: mode === 'exam' ? 'exam' : mode === 'review' ? 'review' : 'practice',
          questions_attempted: answers.length,
          questions_correct: answers.filter(a => a.isCorrect).length,
          score_percentage: answers.length > 0 ? (answers.filter(a => a.isCorrect).length / answers.length) * 100 : 0,
          // answers 列がない環境を考慮して省略
          completed_at: new Date().toISOString(),
          is_completed: true,
        } as Record<string, unknown>;
        await supabase.from('quiz_sessions').insert(sessionInsert);
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
        const subject = (q as any)?.subject_category ?? (q as any)?.main_subject ?? null;
        return {
          user_id,
          question_id: String(a.questionId),
          unified_question_id: isUuid(a.questionId) ? a.questionId : null,
          question_text: text,
          user_answer: Number.isFinite(userAnswer) ? userAnswer : null,
          correct_answer: Number.isFinite(correct) ? Number(correct) : null,
          is_correct: !!a.isCorrect,
          answered_at: nowIso,
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
      {/* モード切替 */}
      <div className="mb-6 flex justify-center gap-2">
        <button
          className={`px-4 py-2 rounded-lg border hud-border text-sm font-semibold transition ${mode === 'practice' ? 'bg-[color:var(--panel)]/60 text-[color:var(--hud-primary)]' : 'hover:bg-[color:var(--panel)]/40'}`}
          onClick={() => setMode('practice')}
          aria-pressed={mode === 'practice'}
        >Practice</button>
        <button
          className={`px-4 py-2 rounded-lg border hud-border text-sm font-semibold transition ${mode === 'exam' ? 'bg-[color:var(--panel)]/60 text-[color:var(--hud-primary)]' : 'hover:bg-[color:var(--panel)]/40'}`}
          onClick={() => setMode('exam')}
          aria-pressed={mode === 'exam'}
        >Exam</button>
        <button
          className={`px-4 py-2 rounded-lg border hud-border text-sm font-semibold transition ${mode === 'review' ? 'bg-[color:var(--panel)]/60 text-[color:var(--hud-primary)]' : 'hover:bg-[color:var(--panel)]/40'}`}
          onClick={() => setMode('review')}
          aria-pressed={mode === 'review'}
        >Review</button>
      </div>
      {mode === 'exam' && (
        <p className="text-center text-xs mb-2 opacity-80">Examモード：解説は結果画面まで表示されません。</p>
      )}
      <div className="mb-10 flex flex-col md:flex-row md:justify-center md:items-end gap-6 md:gap-10">
        {/* 科目 */}
        <div className="flex flex-col items-start md:items-center md:flex-row md:space-x-2 w-full md:w-auto">
          <label className="text-lg font-bold hud-text mb-1 md:mb-0">科目選択：</label>
          <div className="relative w-full md:w-56">
            <select
              className="block w-full appearance-none p-3 pr-10 text-lg bg-[color:var(--panel)] border-2 hud-border rounded-xl shadow focus:outline-none focus-hud text-[color:var(--text-primary)] font-semibold hover:bg-white/5 cursor-pointer"
              value={selectedSubject}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSelectedSubject(e.target.value)}
              disabled={subjectLoading || mode === 'review' || !!contentId}
            >
              {subjects.map(subj => (
                <option key={subj} value={subj} className="text-base py-2 bg-[color:var(--panel)] text-[color:var(--text-primary)]">
                  {subj === 'all' ? 'すべての科目' : subj}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-4">
              <svg className="w-6 h-6 hud-text" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
            </div>
          </div>
        </div>
        {/* サブ科目 */}
        <div className="flex flex-col items-start md:items-center md:flex-row md:space-x-2 w-full md:w-auto">
          <label className="text-lg font-bold hud-text mb-1 md:mb-0">サブ科目選択：</label>
          <div className="relative w-full md:w-56">
            <select
              className="block w-full appearance-none p-3 pr-10 text-lg bg-[color:var(--panel)] border-2 hud-border rounded-xl shadow focus:outline-none focus-hud text-[color:var(--text-primary)] font-semibold hover:bg-white/5 cursor-pointer"
              value={selectedSubSubject}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSelectedSubSubject(e.target.value)}
              disabled={selectedSubject === 'all' || subSubjectLoading || mode === 'review' || !!contentId}
            >
              {subSubjects.length === 0 ? (
                <option value="all">（サブ科目なし）</option>
              ) : (
                subSubjects.map(subj => (
                  <option key={subj} value={subj} className="text-base py-2 bg-[color:var(--panel)] text-[color:var(--text-primary)]">
                    {subj === 'all' ? 'すべてのサブ科目' : subj}
                  </option>
                ))
              )}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-4">
              <svg className="w-6 h-6 hud-text" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
            </div>
          </div>
        </div>
        {/* 問題数 */}
        <div className="flex flex-col items-start md:items-center md:flex-row md:space-x-2 w-full md:w-auto">
          <label className="text-lg font-bold hud-text mb-1 md:mb-0">問題数選択：</label>
          <div className="relative w-full md:w-40">
            <select
              className="block w-full appearance-none p-3 pr-10 text-lg bg-[color:var(--panel)] border-2 hud-border rounded-xl shadow focus:outline-none focus-hud text-[color:var(--text-primary)] font-semibold hover:bg-white/5 cursor-pointer"
              value={questionCount}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setQuestionCount(Number(e.target.value))}
              disabled={questionCountOptions.length === 0}
            >
              {questionCountOptions.map(opt => (
                <option key={opt} value={opt} className="text-base py-2 bg-[color:var(--panel)] text-[color:var(--text-primary)]">
                  {opt}問
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-4">
              <svg className="w-6 h-6 hud-text" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /><path strokeLinecap="round" strokeLinejoin="round" d="M8 12h8M12 8v8" /></svg>
            </div>
          </div>
        </div>
      </div>
      {loading ? (
        <div className="p-8 text-center text-lg">問題を取得中...</div>
      ) : error ? (
        <div className="p-8 text-center text-red-500">{error}</div>
      ) : quizFinished ? (
        <div className="max-w-xl mx-auto p-8 hud-surface border hud-border rounded-2xl shadow-2xl text-center flex flex-col items-center justify-center min-h-[320px]">
          <h2 className="text-3xl font-bold mb-6 hud-text drop-shadow">テスト結果</h2>
          <p className="mb-4 text-lg text-[color:var(--text-primary)] font-semibold tracking-wide">
            正解数: <span className="text-2xl text-green-600 dark:text-green-400 font-bold">{userAnswers.filter(a => a.isCorrect).length}</span>
            <span className="mx-2 text-gray-400">/</span>
            <span className="text-2xl text-gray-600 dark:text-gray-300 font-bold">{userAnswers.length}</span>
          </p>
          {saveError && (
            <div className="text-red-500 text-base mb-4 font-semibold">
              {saveError.includes('ログインが必要') ? (
                <>
                  {saveError}
                  <div className="mt-2">
                    <a href="/auth" className="inline-block px-6 py-2 rounded-lg border hud-border text-[color:var(--hud-primary)] hover:bg-[color:var(--panel)]/60 font-bold transition">ログイン/新規登録</a>
                  </div>
                </>
              ) : (
                saveError
              )}
            </div>
          )}
          {saving && <p className="hud-text text-base mb-2 animate-pulse">結果を保存中...</p>}
          <button
            className="mt-6 px-8 py-3 rounded-xl border hud-border text-[color:var(--hud-primary)] shadow-lg transition-all duration-200 ease-in-out hover:bg-[color:var(--panel)]/60 focus-visible:focus-hud"
            onClick={() => {
              setQuizFinished(false);
              if (contentId) {
                fetchMappedQuestions(contentId, questionCount);
              } else {
                fetchQuestions(selectedSubject, selectedSubSubject, questionCount);
              }
            }}
          >
            もう一度挑戦
          </button>
        </div>
      ) : (
        <QuizComponent
          quizTitle={selectedSubject === 'all' ? 'CPL 4択テスト' : `${selectedSubject} 4択テスト`}
          questions={questions}
          onSubmitQuiz={handleSubmitQuiz}
          onBackToContents={() => { }}
          theme={theme}
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
