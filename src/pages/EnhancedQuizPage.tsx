import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../stores/authStore';
import { useTheme } from '../contexts/ThemeContext';
import { useQuizDatabase, AdaptedQuizQuestion, QuizResultSubmission } from '../components/quiz/QuizDatabaseAdapter';

interface QuizState {
  currentQuestionIndex: number;
  selectedAnswers: number[];
  isAnswered: boolean;
  showExplanation: boolean;
  startTime: Date;
  questionStartTime: Date;
}

const EnhancedQuizPage: React.FC = () => {
  const { theme } = useTheme();
  const { user, profile } = useAuthStore();
  const { loadQuestionsByCategory, saveQuizResults, getCategories, getUserStats } = useQuizDatabase();

  // State管理
  const [currentView, setCurrentView] = useState<'setup' | 'quiz' | 'results'>('setup');
  const [availableCategories, setAvailableCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [questionCount, setQuestionCount] = useState<number>(10);
  const [questions, setQuestions] = useState<AdaptedQuizQuestion[]>([]);
  const [quizState, setQuizState] = useState<QuizState>({
    currentQuestionIndex: 0,
    selectedAnswers: [],
    isAnswered: false,
    showExplanation: false,
    startTime: new Date(),
    questionStartTime: new Date()
  });
  const [quizResults, setQuizResults] = useState<QuizResultSubmission[]>([]);
  const [userStats, setUserStats] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  // 初期化
  useEffect(() => {
    const initializeData = async () => {
      try {
        setLoading(true);
        const [categories, stats] = await Promise.all([
          getCategories(),
          getUserStats()
        ]);
        setAvailableCategories(categories);
        setUserStats(stats);
      } catch (err) {
        setError('データの初期化に失敗しました');
      } finally {
        setLoading(false);
      }
    };

    initializeData();
  }, []);

  // クイズ開始
  const startQuiz = async () => {
    try {
      setLoading(true);
      setError('');
      
      const loadedQuestions = await loadQuestionsByCategory(
        selectedCategory || undefined, 
        questionCount
      );
      
      if (loadedQuestions.length === 0) {
        throw new Error('指定された条件に合う問題が見つかりませんでした');
      }

      setQuestions(loadedQuestions);
      setQuizState({
        currentQuestionIndex: 0,
        selectedAnswers: new Array(loadedQuestions.length).fill(-1),
        isAnswered: false,
        showExplanation: false,
        startTime: new Date(),
        questionStartTime: new Date()
      });
      setQuizResults([]);
      setCurrentView('quiz');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'クイズの開始に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  // 回答選択
  const selectAnswer = (answerIndex: number) => {
    if (quizState.isAnswered) return;

    const newSelectedAnswers = [...quizState.selectedAnswers];
    newSelectedAnswers[quizState.currentQuestionIndex] = answerIndex;
    
    setQuizState(prev => ({
      ...prev,
      selectedAnswers: newSelectedAnswers
    }));
  };

  // 回答提出
  const submitAnswer = () => {
    if (quizState.isAnswered) return;

    const currentQuestion = questions[quizState.currentQuestionIndex];
    const selectedAnswer = quizState.selectedAnswers[quizState.currentQuestionIndex];
    const isCorrect = selectedAnswer === currentQuestion.correctAnswer;
    const timeSpent = Date.now() - quizState.questionStartTime.getTime();

    // 結果を記録
    const result: QuizResultSubmission = {
      questionId: currentQuestion.id,
      isCorrect,
      selectedAnswer,
      timeSpent
    };

    setQuizResults(prev => [...prev, result]);
    setQuizState(prev => ({
      ...prev,
      isAnswered: true,
      showExplanation: true
    }));
  };

  // 次の問題へ
  const nextQuestion = () => {
    if (quizState.currentQuestionIndex < questions.length - 1) {
      setQuizState(prev => ({
        ...prev,
        currentQuestionIndex: prev.currentQuestionIndex + 1,
        isAnswered: false,
        showExplanation: false,
        questionStartTime: new Date()
      }));
    } else {
      finishQuiz();
    }
  };

  // クイズ終了
  const finishQuiz = async () => {
    try {
      await saveQuizResults(quizResults);
      const updatedStats = await getUserStats();
      setUserStats(updatedStats);
      setCurrentView('results');
    } catch (err) {
      console.error('結果の保存に失敗しました:', err);
      setCurrentView('results'); // エラーでも結果画面は表示
    }
  };

  // セットアップ画面に戻る
  const backToSetup = () => {
    setCurrentView('setup');
    setQuizState({
      currentQuestionIndex: 0,
      selectedAnswers: [],
      isAnswered: false,
      showExplanation: false,
      startTime: new Date(),
      questionStartTime: new Date()
    });
    setQuizResults([]);
    setError('');
  };

  if (!user) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${
        theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'
      }`}>
        <div className="text-center max-w-md mx-auto p-6">
          <div className="mb-6">
            <svg className="mx-auto h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            ログインが必要です
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            クイズ機能を利用するにはログインしてください。
          </p>
          <a 
            href="/auth" 
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
          >
            ログインページへ
          </a>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${
        theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'
      }`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-500 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600 dark:text-gray-300">読み込み中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${
      theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'
    }`}>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* ヘッダー */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            航空知識クイズ
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            515問の問題から学習を深めましょう
          </p>
        </div>

        {/* エラー表示 */}
        {error && (
          <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <div className="flex">
              <svg className="h-5 w-5 text-red-400 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 19c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <div className="ml-3">
                <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* セットアップ画面 */}
        {currentView === 'setup' && (
          <div className="space-y-8">
            {/* ユーザー統計 */}
            {userStats && (
              <div className={`${
                theme === 'dark' ? 'bg-gray-800' : 'bg-white'
              } rounded-lg shadow-lg p-6`}>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  あなたの学習統計
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">
                      {userStats.totalAnswered}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-300">総回答数</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                      {userStats.correctAnswers}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-300">正解数</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                      {userStats.accuracy.toFixed(1)}%
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-300">正答率</div>
                  </div>
                </div>
              </div>
            )}

            {/* クイズ設定 */}
            <div className={`${
              theme === 'dark' ? 'bg-gray-800' : 'bg-white'
            } rounded-lg shadow-lg p-6`}>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                クイズ設定
              </h2>
              
              <div className="space-y-6">
                {/* カテゴリ選択 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    カテゴリ選択 (すべてのカテゴリから出題する場合は未選択のまま)
                  </label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="">すべてのカテゴリ</option>
                    {availableCategories.map(category => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 問題数設定 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    問題数: {questionCount}問
                  </label>
                  <input
                    type="range"
                    min="5"
                    max="50"
                    value={questionCount}
                    onChange={(e) => setQuestionCount(Number(e.target.value))}
                    className="w-full h-2 bg-gray-200 dark:bg-gray-600 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                    <span>5問</span>
                    <span>50問</span>
                  </div>
                </div>

                {/* 開始ボタン */}
                <button
                  onClick={startQuiz}
                  disabled={loading}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white font-bold py-4 px-6 rounded-lg text-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  {loading ? 'クイズを準備中...' : 'クイズを開始'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* クイズ画面 */}
        {currentView === 'quiz' && questions.length > 0 && (
          <div className="space-y-6">
            {/* プログレスバー */}
            <div className={`${
              theme === 'dark' ? 'bg-gray-800' : 'bg-white'
            } rounded-lg shadow p-4`}>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  問題 {quizState.currentQuestionIndex + 1} / {questions.length}
                </span>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {questions[quizState.currentQuestionIndex].category}
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                  style={{ 
                    width: `${((quizState.currentQuestionIndex + 1) / questions.length) * 100}%` 
                  }}
                ></div>
              </div>
            </div>

            {/* 問題カード */}
            <div className={`${
              theme === 'dark' ? 'bg-gray-800' : 'bg-white'
            } rounded-lg shadow-lg p-8`}>
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  {questions[quizState.currentQuestionIndex].question}
                </h2>
              </div>

              {/* 選択肢 */}
              <div className="space-y-3 mb-6">
                {questions[quizState.currentQuestionIndex].options.map((option, index) => {
                  const isSelected = quizState.selectedAnswers[quizState.currentQuestionIndex] === index;
                  const isCorrect = index === questions[quizState.currentQuestionIndex].correctAnswer;
                  const isWrongSelection = quizState.isAnswered && isSelected && !isCorrect;
                  
                  let buttonClass = "w-full p-4 text-left border rounded-lg transition-all duration-200 ";
                  
                  if (quizState.isAnswered) {
                    if (isCorrect) {
                      buttonClass += "bg-green-50 dark:bg-green-900/20 border-green-500 text-green-700 dark:text-green-300";
                    } else if (isWrongSelection) {
                      buttonClass += "bg-red-50 dark:bg-red-900/20 border-red-500 text-red-700 dark:text-red-300";
                    } else {
                      buttonClass += "bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300";
                    }
                  } else {
                    if (isSelected) {
                      buttonClass += "bg-indigo-50 dark:bg-indigo-900/20 border-indigo-500 text-indigo-700 dark:text-indigo-300";
                    } else {
                      buttonClass += "bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600";
                    }
                  }

                  return (
                    <button
                      key={index}
                      onClick={() => selectAnswer(index)}
                      disabled={quizState.isAnswered}
                      className={buttonClass}
                    >
                      <div className="flex items-center">
                        <span className="w-8 h-8 rounded-full border-2 border-current flex items-center justify-center mr-3 font-bold">
                          {String.fromCharCode(65 + index)}
                        </span>
                        <span className="flex-1">{option}</span>
                        {quizState.isAnswered && isCorrect && (
                          <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                        {isWrongSelection && (
                          <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* 解説表示 */}
              {quizState.showExplanation && (
                <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                  <h3 className="font-semibold text-blue-900 dark:text-blue-300 mb-2">解説</h3>
                  <p className="text-blue-800 dark:text-blue-200">
                    {questions[quizState.currentQuestionIndex].explanation}
                  </p>
                </div>
              )}

              {/* アクションボタン */}
              <div className="flex justify-between">
                <button
                  onClick={backToSetup}
                  className="px-6 py-3 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  クイズを終了
                </button>
                
                <div className="space-x-3">
                  {!quizState.isAnswered ? (
                    <button
                      onClick={submitAnswer}
                      disabled={quizState.selectedAnswers[quizState.currentQuestionIndex] === -1}
                      className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white font-semibold rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      回答する
                    </button>
                  ) : (
                    <button
                      onClick={nextQuestion}
                      className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                    >
                      {quizState.currentQuestionIndex < questions.length - 1 ? '次の問題' : '結果を見る'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 結果画面 */}
        {currentView === 'results' && (
          <div className="space-y-6">
            {/* 総合結果 */}
            <div className={`${
              theme === 'dark' ? 'bg-gray-800' : 'bg-white'
            } rounded-lg shadow-lg p-8 text-center`}>
              <div className="mb-6">
                <div className="text-6xl mb-2">
                  {quizResults.filter(r => r.isCorrect).length / quizResults.length >= 0.8 ? '🎉' : 
                   quizResults.filter(r => r.isCorrect).length / quizResults.length >= 0.6 ? '👏' : '📚'}
                </div>
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  クイズ完了！
                </h2>
                <p className="text-lg text-gray-600 dark:text-gray-300">
                  お疲れ様でした
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div>
                  <div className="text-4xl font-bold text-indigo-600 dark:text-indigo-400">
                    {quizResults.filter(r => r.isCorrect).length}
                  </div>
                  <div className="text-gray-600 dark:text-gray-300">正解数</div>
                </div>
                <div>
                  <div className="text-4xl font-bold text-gray-600 dark:text-gray-300">
                    {quizResults.length}
                  </div>
                  <div className="text-gray-600 dark:text-gray-300">総問題数</div>
                </div>
                <div>
                  <div className="text-4xl font-bold text-green-600 dark:text-green-400">
                    {Math.round((quizResults.filter(r => r.isCorrect).length / quizResults.length) * 100)}%
                  </div>
                  <div className="text-gray-600 dark:text-gray-300">正答率</div>
                </div>
              </div>

              <div className="space-x-4">
                <button
                  onClick={startQuiz}
                  className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  もう一度挑戦
                </button>
                <button
                  onClick={backToSetup}
                  className="px-8 py-3 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  設定を変更
                </button>
              </div>
            </div>

            {/* 詳細結果 */}
            <div className={`${
              theme === 'dark' ? 'bg-gray-800' : 'bg-white'
            } rounded-lg shadow-lg p-6`}>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                問題別結果
              </h3>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {questions.map((question, index) => {
                  const result = quizResults[index];
                  return (
                    <div 
                      key={question.id}
                      className={`p-4 rounded-lg border ${
                        result?.isCorrect 
                          ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' 
                          : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-medium text-gray-900 dark:text-white">
                          問題 {index + 1}: {question.question}
                        </h4>
                        <span className={`px-2 py-1 rounded text-sm font-medium ${
                          result?.isCorrect 
                            ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200' 
                            : 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
                        }`}>
                          {result?.isCorrect ? '正解' : '不正解'}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">
                        あなたの回答: {question.options[result?.selectedAnswer || 0]}
                      </p>
                      {!result?.isCorrect && (
                        <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">
                          正解: {question.options[question.correctAnswer]}
                        </p>
                      )}
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {question.explanation}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EnhancedQuizPage; 