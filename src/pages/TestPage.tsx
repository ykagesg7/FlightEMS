import React, { useEffect, useState } from 'react';
import { QuizComponent } from '../components/QuizComponent';
import { useTheme } from '../contexts/ThemeContext';
import { QuestionType, QuizQuestion, UserQuizAnswer } from '../types/quiz';
import supabase from '../utils/supabase';

const TestPage: React.FC = () => {
  const { theme } = useTheme();
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
  const [maxQuestionCount, setMaxQuestionCount] = useState<number>(10);
  const [questionCountOptions, setQuestionCountOptions] = useState<number[]>([10]);

  // main_subject一覧取得
  useEffect(() => {
    const fetchSubjects = async () => {
      setSubjectLoading(true);
      try {
        const { data, error } = await supabase
          .from('unified_cpl_questions')
          .select('main_subject', { count: 'exact', head: false });
        if (error) throw error;
        const uniqueSubjects = Array.from(new Set((data || []).map((q: any) => q.main_subject).filter(Boolean)));
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
        const uniqueSubSubjects = Array.from(new Set((data || []).map((q: any) => q.sub_subject).filter(Boolean)));
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
      setMaxQuestionCount(maxCount);
      setQuestionCountOptions(options);
      setQuestionCount(options[0]);
    };
    fetchCount();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSubject, selectedSubSubject]);

  // 問題取得
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

  // main_subject, sub_subject, questionCount選択時に問題取得
  useEffect(() => {
    fetchQuestions(selectedSubject, selectedSubSubject, questionCount);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSubject, selectedSubSubject, questionCount]);

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
      const sessionInsert = {
        user_id,
        session_type: 'test',
        questions_attempted: answers.length,
        questions_correct: answers.filter(a => a.isCorrect).length,
        score_percentage: answers.length > 0 ? (answers.filter(a => a.isCorrect).length / answers.length) * 100 : 0,
        answers,
        completed_at: new Date().toISOString(),
        is_completed: true,
      };
      const { error: sessionError } = await supabase.from('quiz_sessions').insert(sessionInsert);
      if (sessionError) throw sessionError;
      const testResults = answers.map(a => ({
        user_id,
        question_id: a.questionId,
        user_answer: a.answer,
        is_correct: a.isCorrect,
        response_time_seconds: null,
        answered_at: new Date().toISOString(),
      }));
      const { error: resultError } = await supabase.from('user_test_results').insert(testResults);
      if (resultError) throw resultError;
    } catch (err: any) {
      setSaveError(err.message || '回答結果の保存に失敗しました');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-8" style={{ background: 'var(--bg)', color: 'var(--text-primary)' }}>
      <div className="mb-10 flex flex-col md:flex-row md:justify-center md:items-end gap-6 md:gap-10">
        {/* 科目 */}
        <div className="flex flex-col items-start md:items-center md:flex-row md:space-x-2 w-full md:w-auto">
          <label className="text-lg font-bold hud-text mb-1 md:mb-0">科目選択：</label>
          <div className="relative w-full md:w-56">
            <select
              className="block w-full appearance-none p-3 pr-10 text-lg bg-[color:var(--panel)] border-2 hud-border rounded-xl shadow focus:outline-none focus-hud text-[color:var(--text-primary)] font-semibold hover:bg-white/5 cursor-pointer"
              value={selectedSubject}
              onChange={e => setSelectedSubject(e.target.value)}
              disabled={subjectLoading}
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
              onChange={e => setSelectedSubSubject(e.target.value)}
              disabled={selectedSubject === 'all' || subSubjectLoading}
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
              onChange={e => setQuestionCount(Number(e.target.value))}
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
            onClick={() => { setQuizFinished(false); fetchQuestions(selectedSubject, selectedSubSubject, questionCount); }}
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
