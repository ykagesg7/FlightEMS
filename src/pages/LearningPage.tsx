import { useCallback, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import RelatedTestButton from '../components/learning/RelatedTestButton';
import ReviewContentLink from '../components/learning/ReviewContentLink';
import { QuizComponent } from '../components/QuizComponent';
import { APP_CONTENT } from '../constants';
import { useTheme } from '../contexts/ThemeContext';
import { useLearningProgress } from '../hooks/useLearningProgress';
import { LearningContent } from '../types';
import { UserQuizAnswer } from '../types/quiz';

enum LearningState {
  INTRODUCTION, // 目次・概要
  QUIZ,         // 小テスト
  QUIZ_RESULTS  // 結果
}

function LearningPage() {
  const { theme } = useTheme();
  const { quizTitle, quizQuestions, generalMessages } = APP_CONTENT;

  const { learningContents, isLoading, error } = useLearningProgress();

  const [learningState, setLearningState] = useState<LearningState>(LearningState.INTRODUCTION);
  const [quizUserAnswers, setQuizUserAnswers] = useState<UserQuizAnswer[]>([]);

  // Filter and sort CPL aviation law contents
  const cplAviationLawContents = useMemo(() => {
    if (isLoading || error || !learningContents) {
      return [];
    }
    return learningContents
      .filter((content: LearningContent) => content.category === 'CPL航空法')
      .sort((a: LearningContent, b: LearningContent) => (a.order_index || 0) - (b.order_index || 0));
  }, [learningContents, isLoading, error]);

  const latestThreeCplArticles = useMemo(() => {
    return cplAviationLawContents.slice(0, 3);
  }, [cplAviationLawContents]);

  const resetLearningState = useCallback(() => {
    setQuizUserAnswers([]);
  }, []);

  const handleSubmitQuiz = (answers: UserQuizAnswer[]) => {
    setQuizUserAnswers(answers);
    setLearningState(LearningState.QUIZ_RESULTS);
  };

  const handleRetakeQuiz = () => {
    setQuizUserAnswers([]);
    setLearningState(LearningState.QUIZ);
  };

  const handleBackToContents = () => {
    if (learningState === LearningState.QUIZ_RESULTS) {
      resetLearningState();
    }
    setLearningState(LearningState.INTRODUCTION);
  };

  const renderContent = () => {
    switch (learningState) {
      case LearningState.INTRODUCTION:
        return (
          <div className={`
            ${theme === 'dark' ? 'bg-gradient-to-br from-slate-900 via-gray-900 to-zinc-900' : 'bg-gradient-to-r from-blue-50 to-indigo-50'}
            p-6 md:p-8 rounded-xl shadow-xl border
            ${theme === 'dark' ? 'border-slate-700/50' : 'border-blue-200'}
            animate-fadeIn
          `}>
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-sky-400 mb-4">
                🛩️ {generalMessages.tableOfContents}
              </h2>
              <p className={`text-lg leading-relaxed mb-6 ${theme === 'dark' ? 'text-gray-300' : 'text-slate-700'}`}>
                {generalMessages.appOverview}
              </p>

              {/* Learning → Test フロー説明 */}
              <div className={`p-5 rounded-xl mb-6 ${theme === 'dark' ? 'bg-blue-900/20 border border-blue-800' : 'bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 shadow-sm'}`}>
                <h3 className="text-lg font-semibold text-blue-600 dark:text-blue-400 mb-2">
                  📚 学習フロー
                </h3>
                <div className="flex items-center justify-center space-x-4 text-sm">
                  <div className="flex items-center">
                    <span className="bg-green-500 text-white px-3 py-1 rounded-full font-semibold">
                      1. Learning
                    </span>
                    <span className={`ml-2 ${theme === 'dark' ? 'text-gray-300' : 'text-slate-700'}`}>
                      知識インプット
                    </span>
                  </div>
                  <svg className={`w-6 h-6 ${theme === 'dark' ? 'text-gray-400' : 'text-slate-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                  <div className="flex items-center">
                    <Link
                      to="/quiz" // クイズページへのリンク
                      className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1 rounded-full font-semibold transition-all duration-200 shadow-md hover:shadow-lg"
                    >
                      2. Test
                    </Link>
                    <span className={`ml-2 ${theme === 'dark' ? 'text-gray-300' : 'text-slate-700'}`}>
                      知識確認
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* CPL航空法コンテンツの表示 */}
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-sky-400 mb-4">
                CPL航空法：最新記事
              </h3>
              {isLoading && <p className="text-center text-gray-500">コンテンツを読み込み中...</p>}
              {error && <p className="text-center text-red-500">コンテンツの読み込みに失敗しました。</p>}
              {!isLoading && !error && cplAviationLawContents.length === 0 && (
                <p className={`text-center ${theme === 'dark' ? 'text-gray-400' : 'text-slate-600'}`}>
                  CPL航空法の記事が見つかりませんでした。
                </p>
              )}
              {latestThreeCplArticles.map((content: LearningContent) => (
                <Link
                  key={content.id}
                  to={`/articles/${content.id}`} // 記事詳細ページへのリンク
                  className={`w-full text-left p-6 rounded-xl shadow-lg transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-opacity-75 border ${theme === 'dark'
                    ? 'bg-gray-700 hover:bg-gray-600 border-gray-600'
                    : 'bg-white hover:bg-blue-50 border-gray-200 hover:border-blue-300 hover:shadow-xl'}
                  `}>
                  <h3 className="text-lg font-semibold text-sky-400">
                    {content.title}
                  </h3>
                  {content.description && (
                    <p className={`text-sm mt-2 ${theme === 'dark' ? 'text-gray-400' : 'text-slate-600'}`}>
                      {content.description}
                    </p>
                  )}
                </Link>
              ))}
            </div>

            {/* 全ての記事へのリンク */}
            <div className="mt-8 grid md:grid-cols-2 gap-6">
              <div className={`p-6 rounded-xl shadow-lg ${theme === 'dark' ? 'bg-purple-900/20 border border-purple-800' : 'bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200'}`}>
                <h3 className="text-xl font-semibold text-purple-600 dark:text-purple-400 mb-3">
                  📚 全ての学習記事を見る
                </h3>
                <p className={`mb-4 ${theme === 'dark' ? 'text-gray-300' : 'text-slate-700'}`}>
                  CPL航空法を含む、全ての学習コンテンツ一覧はこちらから。
                </p>
                <Link
                  to="/articles"
                  className="inline-flex items-center px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                  記事一覧へ
                </Link>
              </div>

              {/* クイズページへのリンク */}
              <div className={`p-6 rounded-xl shadow-lg ${theme === 'dark' ? 'bg-teal-900/20 border border-teal-800' : 'bg-gradient-to-br from-teal-50 to-green-50 border border-teal-200'}`}>
                <h3 className="text-xl font-semibold text-teal-600 dark:text-teal-400 mb-3">
                  📝 理解度をテスト
                </h3>
                <p className={`mb-4 ${theme === 'dark' ? 'text-gray-300' : 'text-slate-700'}`}>
                  CPL航空法の理解度をクイズで確認しましょう。
                </p>
                <Link
                  to="/quiz" // クイズページへのリンク
                  className="inline-flex items-center px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M17 12l2 2m0 0l-2 2m2-2H7" />
                  </svg>
                  クイズへ
                </Link>
              </div>
            </div>
          </div>
        );
      case LearningState.QUIZ:
        return (
          <QuizComponent
            questions={quizQuestions}
            onSubmitQuiz={handleSubmitQuiz}
            onBackToContents={handleBackToContents}
            theme={theme}
            quizTitle={quizTitle}
            generalMessages={generalMessages}
          />
        );
      case LearningState.QUIZ_RESULTS:
        const quizAccuracy = quizUserAnswers.length > 0
          ? Math.round((quizUserAnswers.filter(a => a.isCorrect).length / quizUserAnswers.length) * 100)
          : 0;

        return (
          <div className="flex flex-col items-center justify-center min-h-screen">
            <h2 className={`text-4xl font-bold mb-6 ${theme === 'dark' ? 'text-green-400' : 'text-green-600'}`}>
              {generalMessages.quizSummary}
            </h2>
            <p className={`text-xl mb-8 ${theme === 'dark' ? 'text-gray-300' : 'text-slate-700'}`}>
              {generalMessages.yourScore}: {quizUserAnswers.filter(a => a.isCorrect).length} / {quizUserAnswers.length}
            </p>
            <div className="flex space-x-4">
              <button onClick={handleRetakeQuiz} className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition-all">
                {generalMessages.retakeQuiz}
              </button>
              <button onClick={handleBackToContents} className="px-6 py-3 bg-gray-600 text-white font-semibold rounded-lg shadow-md hover:bg-gray-700 transition-all">
                {generalMessages.backToContents}
              </button>
            </div>
            {/* 新しいReviewContentLinkとRelatedTestButtonの表示 */}
            <div className="mt-8 flex space-x-4">
              <ReviewContentLink
                subjectCategory={'CPL航空法'} // 仮の値、必要に応じて調整
                accuracy={quizAccuracy}
              />
              <RelatedTestButton
                contentId={latestThreeCplArticles[0]?.id || ''} // 仮の値、必要に応じて調整
                contentTitle={latestThreeCplArticles[0]?.title || ''} // 仮の値、必要に応じて調整
              />
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className={`min-h-screen py-8 px-4 sm:px-6 lg:px-8 flex items-start justify-center ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-900'}`}>
      <div className="max-w-4xl w-full">
        {renderContent()}
      </div>
    </div>
  );
}

export default LearningPage;
