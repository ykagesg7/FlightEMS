import * as React from 'react';
import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import { useFreemiumAccess } from '../../hooks/useFreemiumAccess';
import { useLearningProgress } from '../../hooks/useLearningProgress';
import { useAuthStore } from '../../stores/authStore';

import LearningAnalyticsDashboard from '../learning/LearningAnalyticsDashboard';
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

  const { theme } = useTheme();
  const { user } = useAuthStore();

  const {
    getProgress,
    isCompleted,
    getLastReadInfo,
    loadLearningContents
  } = useLearningProgress();

  const {
    displayContents,
    canAccessContent,
    isFreemiumContent,
    isLoading
  } = useFreemiumAccess(contentType);

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

  // カテゴリ一覧
  const categories = useMemo(() => {
    return Array.from(new Set(displayContents.map(content => content.category))).sort();
  }, [displayContents]);

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

  // ナビゲーション関数
  const navigateToHome = () => {
    setCurrentView('home');
    setSelectedCategory(null);
    setSelectedContent(null);
    // URLパラメータをクリア
    window.history.replaceState({}, '', window.location.pathname);
  };

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

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="w-full mx-auto">
      {/* ホームページ */}
      {currentView === 'home' && (
        <div>
          <h1 className="text-2xl font-bold mb-4">学習ダッシュボード</h1>
          <p className="mb-4">学習コンテンツを効率的に管理・追跡できるダッシュボードです。</p>

          {/* 学習分析ダッシュボード（ログインユーザー向け） */}
          {user && (
            <div className="mb-8">
              <LearningAnalyticsDashboard />
            </div>
          )}

          {/* 最新記事お知らせ */}
          <div className="mb-8">
            <h2 className={`text-2xl font-bold ${theme === 'dark' ? 'text-indigo-300' : 'text-indigo-600'} mb-4`}>
              📢 最新記事のお知らせ
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {displayContents.slice(0, 3).map((content) => (
                <div
                  key={content.id}
                  className={`p-4 rounded-lg border ${theme === 'dark' ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-200'} hover:border-indigo-500 transition-all duration-200`}
                >
                  <h3 className={`font-semibold text-lg ${theme === 'dark' ? 'text-indigo-300' : 'text-indigo-600'} mb-2`}>
                    {content.title}
                  </h3>
                  <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} mb-3`}>
                    カテゴリ: {content.category}
                  </p>
                  <button
                    onClick={() => selectContent(content.id)}
                    className={`text-xs px-3 py-2 ${theme === 'dark'
                      ? 'bg-indigo-600 text-white hover:bg-indigo-500'
                      : 'bg-indigo-500 text-white hover:bg-indigo-400'
                      } rounded transition-colors duration-200`}
                  >
                    読む
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* カテゴリ別学習開始 */}
          <div>
            <h2 className={`text-2xl font-bold ${theme === 'dark' ? 'text-indigo-300' : 'text-indigo-600'} mb-4`}>
              📚 カテゴリ別学習
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {categories.map((category) => {
                const categoryContents = displayContents.filter(c => c.category === category);
                const completedCount = categoryContents.filter(c => isCompleted(c.id)).length;
                const progressRate = categoryContents.length > 0 ? (completedCount / categoryContents.length) * 100 : 0;

                return (
                  <div
                    key={category}
                    className={`p-6 rounded-lg border ${theme === 'dark' ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-200'} hover:border-indigo-500 transition-all duration-200 cursor-pointer`}
                    onClick={() => navigateToCategory(category)}
                  >
                    <h3 className={`font-bold text-xl ${theme === 'dark' ? 'text-indigo-300' : 'text-indigo-600'} mb-2`}>
                      {category}
                    </h3>
                    <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} mb-3`}>
                      {categoryContents.length}記事
                    </p>

                    {/* 進捗バー */}
                    <div className="w-full bg-gray-300 rounded-full h-2 mb-3">
                      <div
                        className="bg-indigo-600 h-2 rounded-full"
                        style={{ width: `${progressRate}%` }}
                      ></div>
                    </div>
                    <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      進捗率: {Math.round(progressRate)}% ({completedCount}/{categoryContents.length})
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* カテゴリページ */}
      {currentView === 'category' && selectedCategory && (
        <div>
          {/* パンくずナビゲーション */}
          <div className="flex items-center space-x-2 mb-6">
            <button
              onClick={navigateToHome}
              className={`text-sm ${theme === 'dark' ? 'text-indigo-300 hover:text-indigo-200' : 'text-indigo-600 hover:text-indigo-500'} transition-colors duration-200`}
            >
              ホーム
            </button>
            <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              &gt;
            </span>
            <span className={`text-sm font-semibold ${theme === 'dark' ? 'text-gray-200' : 'text-gray-800'}`}>
              {selectedCategory}
            </span>
          </div>

          <h1 className={`text-3xl font-bold ${theme === 'dark' ? 'text-indigo-300' : 'text-indigo-600'} mb-6`}>
            {selectedCategory} の学習コンテンツ
          </h1>

          {/* カテゴリ別記事一覧 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredContents.map((content) => {
              const hasAccess = canAccessContent(content.id);
              const progressPercentage = getProgress(content.id);

              return (
                <div
                  key={content.id}
                  className={`p-6 rounded-lg border ${theme === 'dark' ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-200'
                    } hover:border-indigo-500 transition-all duration-200 ${hasAccess ? 'cursor-pointer' : 'cursor-not-allowed opacity-60'}`}
                  onClick={() => hasAccess && selectContent(content.id)}
                >
                  <div className="flex justify-between items-start mb-3">
                    <h3 className={`font-bold text-lg ${theme === 'dark' ? 'text-indigo-300' : 'text-indigo-600'} leading-tight`}>
                      {content.title}
                    </h3>
                    {!hasAccess && (
                      <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
                        🔒 ログイン必要
                      </span>
                    )}
                  </div>

                  <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} mb-4`}>
                    {content.description || '詳細な学習内容をご確認いただけます。'}
                  </p>

                  {hasAccess && (
                    <div className="flex justify-between items-center">
                      <div className="flex items-center space-x-2">
                        <div className="w-full bg-gray-300 rounded-full h-2 min-w-[60px]">
                          <div
                            className="bg-indigo-600 h-2 rounded-full"
                            style={{ width: `${progressPercentage}%` }}
                          ></div>
                        </div>
                        <span className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                          {Math.round(progressPercentage)}%
                        </span>
                      </div>
                      <button
                        className={`ml-4 text-xs px-3 py-2 ${theme === 'dark'
                          ? 'bg-indigo-600 text-white hover:bg-indigo-500'
                          : 'bg-indigo-500 text-white hover:bg-indigo-400'
                          } rounded transition-colors duration-200`}
                      >
                        {progressPercentage > 0 ? '続きを読む' : '読む'}
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {filteredContents.length === 0 && (
            <div className={`text-center py-12 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              <p className="text-lg">このカテゴリにはまだコンテンツがありません。</p>
              <button
                onClick={navigateToHome}
                className={`mt-4 px-6 py-2 ${theme === 'dark'
                  ? 'bg-indigo-600 text-white hover:bg-indigo-500'
                  : 'bg-indigo-500 text-white hover:bg-indigo-400'
                  } rounded transition-colors duration-200`}
              >
                ホームに戻る
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
              onClick={navigateToHome}
              className={`text-sm ${theme === 'dark' ? 'text-indigo-300 hover:text-indigo-200' : 'text-indigo-600 hover:text-indigo-500'} transition-colors duration-200`}
            >
              ホーム
            </button>
            {selectedCategory && (
              <>
                <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  &gt;
                </span>
                <button
                  onClick={() => navigateToCategory(selectedCategory)}
                  className={`text-sm ${theme === 'dark' ? 'text-indigo-300 hover:text-indigo-200' : 'text-indigo-600 hover:text-indigo-500'} transition-colors duration-200`}
                >
                  {selectedCategory}
                </button>
              </>
            )}
            <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              &gt;
            </span>
            <span className={`text-sm font-semibold ${theme === 'dark' ? 'text-gray-200' : 'text-gray-800'}`}>
              記事
            </span>
          </div>

          <MDXLoader contentId={selectedContent} />
        </div>
      )}
    </div>
  );
};

export default LearningTabMDX;
