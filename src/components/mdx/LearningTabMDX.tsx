import * as React from 'react';
import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useLearningProgress } from '../../hooks/useLearningProgress';
// import { useAuthStore } from '../../stores/authStore';

import { KeyboardShortcuts } from '../../pages/articles/components/KeyboardShortcuts';
import { PrevNextNav } from '../../pages/articles/components/PrevNextNav';
import { ReadingProgressBar } from '../../pages/articles/components/ReadingProgressBar';
import { ScrollToButtons } from '../../pages/articles/components/ScrollToButtons';
import { usePrevNext } from '../../pages/articles/components/usePrevNext';
// Legacy dashboard was removed; analytics dashboard not used here anymore
// import LearningAnalyticsDashboard from '../learning/LearningAnalyticsDashboard';
import MDXLoader from './MDXLoader';

// カテゴリキーと表示名のマッピング
const categoryMapping: { [key: string]: string } = {
  'aviation-law': '航空法規',
  'instrument-flight': '計器飛行',
  'aviation-weather': '航空気象',
  'systems': 'システム',
  'mentality': 'メンタリティー',
  'others': 'その他'
};

interface LearningTabMDXProps {
  contentId: string;
  onBackToList?: () => void;
  onContentSelect?: (contentId: string) => void;
  contentType?: 'learning' | 'articles';
}

// ページビューの種類
type PageView = 'home' | 'category' | 'article';

const LearningTabMDX: React.FC<LearningTabMDXProps> = ({
  contentId,
  onBackToList,
  onContentSelect,
  contentType
}) => {
  const [searchParams] = useSearchParams();
  const categoryFromUrl = searchParams.get('category');

  // ページビューの状態管理
  const [currentView, setCurrentView] = useState<PageView>(() => {
    if (contentId && contentId.trim() !== '') {
      return 'article';
    } else if (categoryFromUrl && categoryMapping[categoryFromUrl]) {
      return 'category';
    }
    return 'home';
  });

  const [selectedCategory, setSelectedCategory] = useState<string | null>(() => {
    if (categoryFromUrl && categoryMapping[categoryFromUrl]) {
      return categoryMapping[categoryFromUrl];
    }
    return null;
  });

  const [selectedContent, setSelectedContent] = useState<string | null>(contentId && contentId.trim() !== '' ? contentId : null);

  // Legacy dashboard removed; user is no longer needed here
  // const { user } = useAuthStore();

  const {
    learningContents,
    getProgress,
    loadLearningContents,
    isLoading
  } = useLearningProgress();

  // コンテンツタイプに基づくフィルタリング
  const displayContents = useMemo(() => {
    if (!contentType) return learningContents;

    return learningContents.filter(content => {
      if (contentType === 'learning') {
        // LearningタブではCPL関連のコンテンツのみ
        return content.category?.includes('CPL') ||
          content.category?.includes('航空') ||
          content.id.startsWith('3.') ||
          content.id.includes('Aviation') ||
          content.id.includes('TacanApproach');
      } else if (contentType === 'articles') {
        // Articlesタブではメンタリティー・思考法関連のコンテンツのみ（CPL記事を明確に除外）
        return (content.category?.includes('メンタリティー') ||
          content.category?.includes('思考法') ||
          content.category?.includes('自己啓発') ||
          content.id.startsWith('1.') ||
          content.id.startsWith('2.') ||
          content.title?.includes('メンタリティー') ||
          content.title?.includes('思考法') ||
          content.title?.includes('７つの習慣')) &&
          // CPL記事を明確に除外
          !content.id.startsWith('3.') &&
          !content.id.includes('Aviation') &&
          !content.id.includes('TacanApproach') &&
          !content.category?.includes('CPL') &&
          !content.category?.includes('航空') &&
          !content.title?.includes('CPL') &&
          !content.title?.includes('航空法');
      }
      return true;
    });
  }, [learningContents, contentType]);


  // URLパラメータの変更を監視
  useEffect(() => {
    const categoryFromUrl = searchParams.get('category');
    if (categoryFromUrl && categoryMapping[categoryFromUrl]) {
      setSelectedCategory(categoryMapping[categoryFromUrl]);
      setCurrentView('category');
    } else if (!contentId || contentId.trim() === '') {
      setSelectedCategory(null);
      setCurrentView('home');
    }
  }, [searchParams, contentId]);

  // コンテンツロード
  useEffect(() => {
    loadLearningContents();
  }, []);

  // contentIdが変わったら状態を同期
  useEffect(() => {
    const normalizedContentId = contentId && contentId.trim() !== '' ? contentId : null;
    setSelectedContent(normalizedContentId);

    if (normalizedContentId) {
      setCurrentView('article');
    } else if (categoryFromUrl && categoryMapping[categoryFromUrl]) {
      setCurrentView('category');
    } else {
      setCurrentView('home');
    }
  }, [contentId, categoryFromUrl]);

  const { prev, next } = usePrevNext(selectedContent ?? '');

  // カテゴリ一覧（legacy dashboard removed; not used）
  // const categories = useMemo(() => {
  //   return Array.from(new Set(displayContents.map(content => content.category))).sort();
  // }, [displayContents]);

  // カテゴリ別フィルタリング
  const filteredContents = useMemo(() => {
    if (!selectedCategory) return displayContents;

    return displayContents.filter(content => {
      if (selectedCategory === '航空法規') {
        return content.category?.includes('航空法') ||
          content.id.startsWith('3.') ||
          content.title?.includes('航空法');
      }
      if (selectedCategory === '計器飛行') {
        return content.category?.includes('計器飛行') ||
          content.id.startsWith('9.') ||
          content.title?.includes('計器');
      }
      if (selectedCategory === '航空気象') {
        return content.category?.includes('気象') ||
          content.title?.includes('気象') ||
          content.title?.includes('天気');
      }
      if (selectedCategory === 'システム') {
        return content.category?.includes('システム') ||
          content.title?.includes('システム');
      }
      if (selectedCategory === 'メンタリティー') {
        return content.category?.includes('メンタリティー') ||
          content.category?.includes('自己啓発') ||
          content.id.startsWith('1.') ||
          content.title?.includes('メンタリティー');
      }

      return content.category === selectedCategory;
    });
  }, [displayContents, selectedCategory]);


  const navigateToCategory = (category: string) => {
    setCurrentView('category');
    setSelectedCategory(category);
    setSelectedContent(null);
  };

  const selectContent = (contentId: string) => {
    setSelectedContent(contentId);
    setCurrentView('article');
    if (onContentSelect) {
      onContentSelect(contentId);
    }
  };

  // Articles/Learning 双方で「記事一覧」または親一覧へ戻す
  const handleHomeClick = () => {
    if (onBackToList) {
      onBackToList();
      return;
    }
    if (contentType === 'learning') {
      try {
        window.location.href = '/articles';
      } catch {
        // no-op
      }
      return;
    }
    if (contentType === 'articles') {
      try {
        window.location.href = '/articles';
      } catch {
        // no-op
      }
      return;
    }
    // 最後のフォールバック（理論上到達しない）
    setCurrentView('category');
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="w-full mx-auto">

      {/* カテゴリページ */}
      {currentView === 'category' && selectedCategory && (
        <div>
          {/* パンくずナビゲーション */}
          <div className="flex items-center space-x-2 mb-6">
            <button
              onClick={handleHomeClick}
              className="text-sm text-whiskyPapa-yellow hover:text-whiskyPapa-yellow/80 transition-colors duration-200"
            >
              {contentType === 'articles' ? '記事一覧' : 'ホーム'}
            </button>
            <span className="text-sm text-gray-400">
              &gt;
            </span>
            <span className="text-sm font-semibold text-white">
              {selectedCategory}
            </span>
          </div>

          <h1 className="text-3xl font-bold text-whiskyPapa-yellow mb-6">
            {selectedCategory} の学習コンテンツ
          </h1>

          {/* カテゴリ別記事一覧 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredContents.map((content) => {
              const progressPercentage = getProgress(content.id);

              return (
                <div
                  key={content.id}
                  className="p-6 rounded-lg border bg-whiskyPapa-black-dark border-whiskyPapa-yellow/20 hover:border-whiskyPapa-yellow/40 transition-all duration-200 cursor-pointer"
                  onClick={() => selectContent(content.id)}
                >
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="font-bold text-lg text-whiskyPapa-yellow leading-tight">
                      {content.title}
                    </h3>
                  </div>

                  <p className="text-sm text-gray-300 mb-4">
                    {content.description || '詳細な学習内容をご確認いただけます。'}
                  </p>

                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                      <div className="w-full bg-gray-700 rounded-full h-2 min-w-[60px]">
                        <div
                          className="bg-whiskyPapa-yellow h-2 rounded-full"
                          style={{ width: `${progressPercentage}%` }}
                        ></div>
                      </div>
                      <span className="text-xs text-gray-300">
                        {Math.round(progressPercentage)}%
                      </span>
                    </div>
                    <button
                      className="ml-4 text-xs px-3 py-2 bg-whiskyPapa-yellow text-black hover:bg-whiskyPapa-yellow/90 rounded transition-colors duration-200"
                    >
                      {progressPercentage > 0 ? '続きを読む' : '読む'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredContents.length === 0 && (
            <div className="text-center py-12 text-gray-300">
              <p className="text-lg">このカテゴリにはまだコンテンツがありません。</p>
              <button
                onClick={handleHomeClick}
                className="mt-4 px-6 py-2 bg-whiskyPapa-yellow text-black hover:bg-whiskyPapa-yellow/90 rounded transition-colors duration-200"
              >
                {contentType === 'articles' ? '記事一覧に戻る' : 'ホームに戻る'}
              </button>
            </div>
          )}
        </div>
      )}

      {/* 記事詳細ページ */}
      {currentView === 'article' && selectedContent && (
        <div>
          {/* パンくずナビゲーション */}
          <div className="flex items-center space-x-2 mb-6">
            <button
              onClick={handleHomeClick}
              className="text-sm text-whiskyPapa-yellow hover:text-whiskyPapa-yellow/80 transition-colors duration-200"
            >
              {contentType === 'articles' ? '記事一覧' : 'ホーム'}
            </button>
            {selectedCategory && (
              <>
                <span className="text-sm text-gray-400">
                  &gt;
                </span>
                <button
                  onClick={() => navigateToCategory(selectedCategory)}
                  className="text-sm text-whiskyPapa-yellow hover:text-whiskyPapa-yellow/80 transition-colors duration-200"
                >
                  {selectedCategory}
                </button>
              </>
            )}
            <span className="text-sm text-gray-400">
              &gt;
            </span>
            <span className="text-sm font-semibold text-white">
              記事
            </span>
          </div>

          <ReadingProgressBar contentId={selectedContent} />
          <MDXLoader contentId={selectedContent} />
          <PrevNextNav currentId={selectedContent} listPath="/articles" />
          <ScrollToButtons />
          <KeyboardShortcuts prevId={prev?.id} nextId={next?.id} />
        </div>
      )}
    </div>
  );
};

export default LearningTabMDX;
