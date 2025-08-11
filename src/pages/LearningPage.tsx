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
          <div className={`hud-surface border hud-border p-6 md:p-8 rounded-xl shadow-xl animate-fadeIn`}>
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold hud-text mb-4">
                🛩️ {generalMessages.tableOfContents}
              </h2>
              <p className={`text-lg leading-relaxed mb-6 text-[color:var(--text-primary)]`}>
                {generalMessages.appOverview}
              </p>

              {/* Learning → Test フロー説明 */}
              <div className={`p-5 rounded-xl mb-6 hud-surface border hud-border`}>
                <h3 className="text-lg font-semibold hud-text mb-2">
                  📚 学習フロー
                </h3>
                <div className="flex items-center justify-center space-x-4 text-sm">
                  <div className="flex items-center">
                    <span className="px-3 py-1 rounded-full font-semibold border hud-border hud-text">
                      1. Learning
                    </span>
                    <span className={`ml-2 text-[color:var(--text-primary)]`}>
                      知識インプット
                    </span>
                  </div>
                  <svg className={`w-6 h-6 hud-text`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                  <div className="flex items-center">
                    <Link to="/quiz" className="px-3 py-1 rounded-lg border hud-border text-[color:var(--hud-primary)] hover:bg-[color:var(--panel)]/60 focus-visible:focus-hud transition font-semibold">
                      2. Test
                    </Link>
                    <span className={`ml-2 text-[color:var(--text-primary)]`}>
                      知識確認
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* CPL航空法コンテンツの表示 */}
            <div className="space-y-4">
              <h3 className="text-xl font-bold hud-text mb-4">
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
                  to={`/articles/${content.id}`}
                  className={`w-full text-left p-6 rounded-xl shadow-lg transition-all duration-200 ease-in-out border hud-border hud-surface hover:bg-white/5 focus-visible:focus-hud`}>
                  <h3 className="text-lg font-semibold hud-text">
                    {content.title}
                  </h3>
                  {content.description && (
                    <p className={`text-sm mt-2 text-[color:var(--text-primary)]`}>
                      {content.description}
                    </p>
                  )}
                </Link>
              ))}
            </div>

            {/* 全ての記事へのリンク */}
            <div className="mt-8 grid md:grid-cols-2 gap-6">
              <div className={`p-6 rounded-xl shadow-lg hud-surface border hud-border`}>
                <h3 className="text-xl font-semibold hud-text mb-3">
                  📚 全ての学習記事を見る
                </h3>
                <p className={`mb-4 text-[color:var(--text-primary)]`}>
                  CPL航空法を含む、全ての学習コンテンツ一覧はこちらから。
                </p>
                <Link
                  to="/articles"
                  className="inline-flex items-center px-6 py-3 rounded-xl border hud-border text-[color:var(--hud-primary)] hover:bg-[color:var(--panel)]/60 transition font-semibold"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                  記事一覧へ
                </Link>
              </div>

              {/* クイズページへのリンク */}
              <div className={`p-6 rounded-xl shadow-lg hud-surface border hud-border`}>
                <h3 className="text-xl font-semibold hud-text mb-3">
                  📝 理解度をテスト
                </h3>
                <p className={`mb-4 text-[color:var(--text-primary)]`}>
                  CPL航空法の理解度をクイズで確認しましょう。
                </p>
                <Link
                  to="/quiz" // クイズページへのリンク
                  className="inline-flex items-center px-6 py-3 rounded-xl border hud-border text-[color:var(--hud-primary)] hover:bg-[color:var(--panel)]/60 transition font-semibold"
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
            <h2 className={`text-4xl font-bold mb-6 hud-text`}>
              {generalMessages.quizSummary}
            </h2>
            <p className={`text-xl mb-8 text-[color:var(--text-primary)]`}>
              {generalMessages.yourScore}: {quizUserAnswers.filter(a => a.isCorrect).length} / {quizUserAnswers.length}
            </p>
            <div className="flex space-x-4">
              <button onClick={handleRetakeQuiz} className="px-6 py-3 rounded-lg border hud-border text-[color:var(--hud-primary)] hover:bg-[color:var(--panel)]/60 transition font-semibold">
                {generalMessages.retakeQuiz}
              </button>
              <button onClick={handleBackToContents} className="px-6 py-3 rounded-lg border hud-border text-[color:var(--hud-primary)] hover:bg-[color:var(--panel)]/60 transition font-semibold">
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
    <div className={`min-h-screen py-8 px-4 sm:px-6 lg:px-8 flex items-start justify-center`} style={{ background: 'var(--bg)', color: 'var(--text-primary)' }}>
      <div className="max-w-4xl w-full">
        {renderContent()}
      </div>
    </div>
  );
}

export default LearningPage;
