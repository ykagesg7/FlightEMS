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

  // 本番データ取得
  useEffect(() => {
    const fetchQuestions = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data, error } = await supabase
          .from('unified_cpl_questions')
          .select('*')
          .eq('verification_status', 'verified');
        if (error) throw error;
        if (!data) throw new Error('データが取得できませんでした');
        // クライアント側でシャッフルして10件選ぶ
        const shuffled = data.sort(() => Math.random() - 0.5).slice(0, 10);
        const parsed: QuizQuestion[] = shuffled.map((q: any) => ({
          id: q.id,
          deck_id: q.deck_id || '',
          question_text: q.question_text || q.question || '（問題文データ不備）',
          text: q.question_text || q.question || '（問題文データ不備）', // QuestionComponent用
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
      } finally {
        setLoading(false);
      }
    };
    fetchQuestions();
  }, []);

  // 回答送信
  const handleSubmitQuiz = async (answers: UserQuizAnswer[]) => {
    setQuizFinished(true);
    setUserAnswers(answers);
    setSaving(true);
    setSaveError(null);
    try {
      // 認証ユーザー取得
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError || !userData?.user) throw new Error('ユーザー認証情報が取得できません');
      const user_id = userData.user.id;
      // quiz_sessions保存
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
      // user_test_results保存（各問題ごと）
      const testResults = answers.map(a => ({
        user_id,
        question_id: a.questionId,
        user_answer: a.answer,
        is_correct: a.isCorrect,
        response_time_seconds: null, // 必要に応じて拡張
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

  if (loading) {
    return <div className="p-8 text-center text-lg">問題を取得中...</div>;
  }
  if (error) {
    return <div className="p-8 text-center text-red-500">{error}</div>;
  }
  if (quizFinished) {
    return (
      <div className="max-w-xl mx-auto p-8 bg-white dark:bg-slate-800 rounded-xl shadow-xl text-center">
        <h2 className="text-2xl font-bold mb-4">テスト結果</h2>
        <p className="mb-2">正解数: {userAnswers.filter(a => a.isCorrect).length} / {userAnswers.length}</p>
        {saving && <p className="text-blue-500">結果を保存中...</p>}
        {saveError && <p className="text-red-500">{saveError}</p>}
        <button className="mt-4 px-6 py-2 bg-sky-600 text-white rounded-lg" onClick={() => window.location.reload()}>
          もう一度挑戦
        </button>
      </div>
    );
  }
  return (
    <div className="max-w-2xl mx-auto py-8">
      <QuizComponent
        quizTitle="CPL 4択テスト"
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
    </div>
  );
};

export default TestPage;
