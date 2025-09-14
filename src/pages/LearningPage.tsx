import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import FilterTabs from '../components/common/FilterTabs';
import SearchAndTags from '../components/common/SearchAndTags';
import RelatedTestButton from '../components/learning/RelatedTestButton';
import ReviewContentLink from '../components/learning/ReviewContentLink';
import LessonCard from '../components/lessons/LessonCard';
import { QuizComponent } from '../components/QuizComponent';
import { APP_CONTENT } from '../constants';
import { useTheme } from '../contexts/ThemeContext';
import { useLearningProgress } from '../hooks/useLearningProgress';
import { LearningContent } from '../types';
import { UserQuizAnswer } from '../types/quiz';
import supabase from '../utils/supabase';

enum LearningState {
  INTRODUCTION, // 目次・概要
  QUIZ,         // 小テスト
  QUIZ_RESULTS  // 結果
}

function LearningPage() {
  const { theme } = useTheme();
  const { quizTitle, quizQuestions, generalMessages } = APP_CONTENT;
  const [searchParams, setSearchParams] = useSearchParams();

  const { learningContents, isLoading, error, userProgress, getProgress } = useLearningProgress();

  // ダッシュボード用の実データ状態
  const [srsCount, setSrsCount] = useState<number | null>(null);
  const [recentContentIds, setRecentContentIds] = useState<string[]>([]);
  const [recommendedSubject, setRecommendedSubject] = useState<string | null>(null);

  const [learningState, setLearningState] = useState<LearningState>(LearningState.INTRODUCTION);
  const [quizUserAnswers, setQuizUserAnswers] = useState<UserQuizAnswer[]>([]);

  // Lesson一覧のベース: 「CPL学科」配下の記事（航空法規/航空工学/航空気象）
  const cplLearningContents = useMemo(() => {
    if (isLoading || error || !learningContents) return [];
    return learningContents
      .filter((content: LearningContent) => content.is_published && content.category === 'CPL学科')
      .sort((a: LearningContent, b: LearningContent) => (a.order_index || 0) - (b.order_index || 0));
  }, [learningContents, isLoading, error]);

  const latestThreeCplArticles = useMemo(() => cplLearningContents.slice(0, 3), [cplLearningContents]);

  // タブ（カテゴリ）と検索/タグ（URL同期）
  const categoryFromUrl = searchParams.get('category') || '';
  const categoryKeyToLabel: Record<string, string> = {
    'aviation-law': '航空法規',
    'engineering': '航空工学',
    'weather': '航空気象',
  };
  const labelToCategoryKey: Record<string, string> = {
    '航空法規': 'aviation-law',
    '航空工学': 'engineering',
    '航空気象': 'weather',
  };
  const allLessonCategories = ['すべて', '航空法規', '航空工学', '航空気象'];
  const [activeCategory, setActiveCategory] = useState<string>(categoryKeyToLabel[categoryFromUrl] || 'すべて');

  const searchFromUrl = searchParams.get('q') || '';
  const tagsFromUrl = searchParams.get('tags') || '';
  const [searchQuery, setSearchQuery] = useState(searchFromUrl);
  const [selectedTags, setSelectedTags] = useState<string[]>(tagsFromUrl ? tagsFromUrl.split(',').filter(Boolean) : []);

  // サブカテゴリ（タグ）候補。欠損時はIDから推定
  const availableTags = useMemo(() => {
    const tags = new Set<string>();
    cplLearningContents.forEach((c) => {
      if (c.sub_category) tags.add(c.sub_category);
      else if (c.id.startsWith('3.1.')) tags.add('航空法規');
      else if (c.id.startsWith('3.2.')) tags.add('航空工学');
      else if (c.id.startsWith('3.3.')) tags.add('航空気象');
    });
    return Array.from(tags).sort();
  }, [cplLearningContents]);

  // 正規化（かな統一/小文字化）
  const normalizeText = (s: string) => {
    const nk = s.normalize('NFKC').toLowerCase();
    return nk.replace(/[\u30a1-\u30f6]/g, (ch) => String.fromCharCode(ch.charCodeAt(0) - 0x60));
  };

  // カテゴリ判定（IDから推定）
  const detectSubject = (id: string): string => {
    if (id.startsWith('3.1.')) return '航空法規';
    if (id.startsWith('3.2.')) return '航空工学';
    if (id.startsWith('3.3.')) return '航空気象';
    return '';
  };

  // カテゴリ→検索/タグの順でフィルタ
  const filteredContents = useMemo(() => {
    let filtered = cplLearningContents;
    if (activeCategory !== 'すべて') {
      filtered = filtered.filter((c) => (c.sub_category || detectSubject(c.id)) === activeCategory || detectSubject(c.id) === activeCategory);
    }
    if (searchQuery.trim()) {
      const q = normalizeText(searchQuery);
      filtered = filtered.filter((c) =>
        normalizeText(c.title).includes(q) ||
        (c.description && normalizeText(c.description).includes(q)) ||
        (c.sub_category && normalizeText(c.sub_category).includes(q))
      );
    }
    if (selectedTags.length > 0) {
      filtered = filtered.filter((c) => {
        const tag =
          c.sub_category ||
          (c.id.startsWith('3.1.')
            ? '航空法規'
            : c.id.startsWith('3.2.')
              ? '航空工学'
              : c.id.startsWith('3.3.')
                ? '航空気象'
                : '');
        return selectedTags.includes(tag);
      });
    }
    return filtered;
  }, [cplLearningContents, activeCategory, searchQuery, selectedTags]);

  // URL 同期（カテゴリ/検索/タグ）
  useEffect(() => {
    const params = new URLSearchParams(searchParams);
    if (activeCategory && activeCategory !== 'すべて') params.set('category', labelToCategoryKey[activeCategory] || ''); else params.delete('category');
    if (searchQuery && searchQuery.trim()) params.set('q', searchQuery.trim()); else params.delete('q');
    if (selectedTags.length > 0) params.set('tags', selectedTags.join(',')); else params.delete('tags');
    setSearchParams(params, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeCategory, searchQuery, selectedTags]);

  // 最近の閲覧（learning_progress）から直近を抽出
  useEffect(() => {
    const entries = Object.values(userProgress || {});
    const sorted = entries
      .slice()
      .sort((a, b) => new Date(b.last_read_at).getTime() - new Date(a.last_read_at).getTime())
      .map((p) => p.content_id);
    setRecentContentIds(sorted.slice(0, 3));
  }, [userProgress]);

  // 今日の復習件数 & おすすめ科目（正答率の低いmain_subject）
  useEffect(() => {
    (async () => {
      const { data: auth } = await supabase.auth.getUser();
      const uid = auth?.user?.id;
      if (!uid) {
        setSrsCount(null);
        setRecommendedSubject(null);
        return;
      }
      // SRS件数
      try {
        const { count } = await supabase
          .from('user_unified_srs_status')
          .select('question_id', { count: 'exact', head: true })
          .eq('user_id', uid)
          .lte('next_review_date', new Date().toISOString());
        setSrsCount(count ?? 0);
      } catch {
        setSrsCount(0);
      }

      // おすすめ科目: 直近200回答を集計
      try {
        const { data: results } = await supabase
          .from('user_test_results')
          .select('unified_question_id,is_correct')
          .eq('user_id', uid)
          .order('answered_at', { ascending: false })
          .limit(200);
        const ids = Array.from(new Set((results || []).map(r => r.unified_question_id).filter(Boolean)));
        if (ids.length === 0) {
          setRecommendedSubject(null);
          return;
        }
        const { data: questions } = await supabase
          .from('unified_cpl_questions')
          .select('id,main_subject')
          .in('id', ids as any);
        const idToSubject: Record<string, string> = {};
        (questions || []).forEach(q => { idToSubject[q.id] = q.main_subject; });
        const agg: Record<string, { total: number; correct: number }> = {};
        (results || []).forEach(r => {
          const sid = r.unified_question_id as string;
          const subj = idToSubject[sid];
          if (!subj) return;
          if (!agg[subj]) agg[subj] = { total: 0, correct: 0 };
          agg[subj].total += 1;
          if (r.is_correct) agg[subj].correct += 1;
        });
        let bestSubj: string | null = null;
        let bestAcc = Number.POSITIVE_INFINITY;
        Object.entries(agg as Record<string, { total: number; correct: number }>).forEach(([subj, v]) => {
          if (v.total < 5) return; // 最低試行数
          const acc = v.correct / v.total;
          if (acc < bestAcc) {
            bestAcc = acc;
            bestSubj = subj;
          }
        });
        setRecommendedSubject(bestSubj);
      } catch {
        setRecommendedSubject(null);
      }
    })();
  }, [userProgress]);

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

            {/* ダッシュボード: 今日の復習 / 続きから / おすすめ */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <div className="p-4 rounded-xl hud-surface border hud-border">
                <h3 className="font-semibold hud-text mb-2">今日の復習</h3>
                <p className="text-sm text-[color:var(--text-primary)] mb-3">
                  {srsCount === null ? 'ログインで復習件数を確認' : `本日の復習: ${srsCount} 件`}
                </p>
                <Link
                  to="/test?mode=review&count=10"
                  className="inline-flex items-center px-3 py-2 rounded-lg border hud-border text-[color:var(--hud-primary)] hover:bg-[color:var(--panel)]/60 transition text-sm font-semibold"
                >
                  復習を始める
                </Link>
              </div>
              <div className="p-4 rounded-xl hud-surface border hud-border">
                <h3 className="font-semibold hud-text mb-2">続きから</h3>
                {recentContentIds.length > 0 ? (
                  <div className="space-y-2">
                    {recentContentIds.slice(0, 2).map((id) => {
                      const lc = learningContents.find(c => c.id === id);
                      return (
                        <Link
                          key={id}
                          to={`/articles/${id}`}
                          className="block px-3 py-2 rounded-lg border hud-border hover:bg-[color:var(--panel)]/60 text-sm"
                        >
                          {lc?.title || id}
                        </Link>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-sm text-[color:var(--text-primary)] mb-3">最近の閲覧はありません</p>
                )}
              </div>
              <div className="p-4 rounded-xl hud-surface border hud-border">
                <h3 className="font-semibold hud-text mb-2">おすすめ</h3>
                <p className="text-sm text-[color:var(--text-primary)] mb-3">
                  {recommendedSubject ? `${recommendedSubject} から重点的に学習` : '学習履歴に基づくおすすめを表示'}
                </p>
                <Link
                  to={`/test?subject=${encodeURIComponent(recommendedSubject || '航空法規')}&count=10&mode=practice`}
                  className="inline-flex items-center px-3 py-2 rounded-lg border hud-border text-[color:var(--hud-primary)] hover:bg-[color:var(--panel)]/60 transition text-sm font-semibold"
                >
                  練習問題を開始
                </Link>
              </div>
            </div>

            {/* タブ＋検索/タグ（URL同期） */}
            <div className="mb-8">
              <div className="mb-4" role="region" aria-labelledby="tabs-lessons">
                <h2 id="tabs-lessons" className="sr-only">レッスンカテゴリ</h2>
                <FilterTabs
                  categories={allLessonCategories}
                  activeCategory={activeCategory}
                  onCategoryChange={setActiveCategory}
                  ariaLabel="レッスンカテゴリ"
                />
              </div>
              <h3 className="text-xl font-bold hud-text mb-4">学習記事を検索</h3>
              <SearchAndTags
                placeholder="学習記事を検索..."
                availableTags={availableTags}
                value={searchQuery}
                tags={selectedTags}
                onSearch={(q) => setSearchQuery(q)}
                onFilterChange={(tags) => setSelectedTags(tags)}
              />
            </div>

            {/* CPL学科コンテンツの表示 */}
            <div className="space-y-4">
              <h3 className="text-xl font-bold hud-text mb-4">CPL学科：最新記事</h3>
              {isLoading && <p className="text-center text-gray-500">コンテンツを読み込み中...</p>}
              {error && <p className="text-center text-red-500">コンテンツの読み込みに失敗しました。</p>}
              {!isLoading && !error && cplLearningContents.length === 0 && (
                <p className={`text-center ${theme === 'dark' ? 'text-gray-400' : 'text-slate-600'}`}>
                  CPL学科の記事が見つかりませんでした。
                </p>
              )}
              {latestThreeCplArticles.map((content: LearningContent) => (
                <LessonCard key={content.id} content={content} progressPercent={getProgress(content.id)} />
              ))}

              {/* フィルタ済み一覧 */}
              <div className="mt-6 grid gap-4">
                {filteredContents.map((content: LearningContent) => (
                  <LessonCard key={`filtered-${content.id}`} content={content} progressPercent={getProgress(content.id)} />
                ))}
                {filteredContents.length === 0 && (
                  <p className="text-center text-sm text-[color:var(--text-muted)]">条件に一致する記事がありません。</p>
                )}
              </div>
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
                  to="/test" // クイズページへのリンク
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
