import React, { Suspense, lazy, useEffect, useState } from 'react';
import { Route, Routes, useNavigate } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuthStore } from '../../stores/authStore';
import { SafeAuthButton } from '../auth/SafeAuthButton';
import { SafeRequireAuth } from '../auth/SafeRequireAuth';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { NavLink } from '../ui/NavLink';
import { ThemeToggler } from '../ui/ThemeToggler';

// 動的インポートでコード分割
const PlanningMapPage = lazy(() => import('../../pages/PlanningMapPage'));
const LearningPage = lazy(() => import('../../pages/LearningPage'));
const NewLearningPage = lazy(() => import('../../pages/NewLearningPage'));
const ArticlesPage = lazy(() => import('../../pages/ArticlesPage'));
const ExamTab = lazy(() => import('../../components/flight/ExamTab'));
const AuthPage = lazy(() => import('../../pages/AuthPage'));
const ProfilePage = lazy(() => import('../../pages/ProfilePage'));

const ArticleStatsTestPage = lazy(() => import('../../pages/ArticleStatsTestPage'));

// 学習カテゴリの定義
const learningCategories = [
  { name: '航空法規', key: 'aviation-law', icon: '⚖️' },
  { name: '計器飛行', key: 'instrument-flight', icon: '✈️' },
  { name: '航空気象', key: 'aviation-weather', icon: '🌤️' },
  { name: 'システム', key: 'systems', icon: '⚙️' },
  { name: 'その他', key: 'others', icon: '📚' }
];

// 記事カテゴリの定義
const articleCategories = [
  { name: 'メンタリティー', key: 'mentality', icon: '🧠' },
  { name: '思考法', key: 'thinking', icon: '💭' },
  { name: '論理的思考', key: 'logical-thinking', icon: '🔍' },
  { name: 'その他', key: 'others', icon: '📖' }
];

export const AppLayout: React.FC = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [learningDropdownOpen, setLearningDropdownOpen] = useState(false);
  const [articlesDropdownOpen, setArticlesDropdownOpen] = useState(false);
  const { effectiveTheme } = useTheme();
  const profile = useAuthStore(state => state.profile);
  const navigate = useNavigate();

  // ドロップダウンメニューの遅延クローズ用タイマー
  const [learningCloseTimer, setLearningCloseTimer] = useState<NodeJS.Timeout | null>(null);
  const [articlesCloseTimer, setArticlesCloseTimer] = useState<NodeJS.Timeout | null>(null);

  // コンポーネントアンマウント時のタイマークリーンアップ
  useEffect(() => {
    return () => {
      if (learningCloseTimer) {
        clearTimeout(learningCloseTimer);
      }
      if (articlesCloseTimer) {
        clearTimeout(articlesCloseTimer);
      }
    };
  }, [learningCloseTimer, articlesCloseTimer]);

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  const handleLearningCategorySelect = (categoryKey: string) => {
    navigate(`/learning?category=${categoryKey}`);
    setLearningDropdownOpen(false);
    setMenuOpen(false);
  };

  const handleArticleCategorySelect = (categoryKey: string) => {
    navigate(`/articles?category=${categoryKey}`);
    setArticlesDropdownOpen(false);
    setMenuOpen(false);
  };

  // 先生（管理者）かどうかをチェック
  const isAdmin = typeof profile?.roll === 'string' && ['admin', 'teacher'].includes(profile.roll.toLowerCase());

  // Learningメニューのマウスイベントハンドラー
  const handleLearningMouseEnter = () => {
    if (learningCloseTimer) {
      clearTimeout(learningCloseTimer);
      setLearningCloseTimer(null);
    }
    setLearningDropdownOpen(true);
  };

  const handleLearningMouseLeave = () => {
    const timer = setTimeout(() => {
      setLearningDropdownOpen(false);
    }, 300); // 300ms の遅延
    setLearningCloseTimer(timer);
  };

  // デスクトップ版Learningメニューコンポーネント
  const DesktopLearningMenu = () => (
    <div
      className="relative group"
      onMouseEnter={handleLearningMouseEnter}
      onMouseLeave={handleLearningMouseLeave}
    >
      <NavLink
        to="/learning"
        className="flex items-center space-x-1 px-4 py-2 rounded-lg hover:bg-white/10 transition-all duration-200 text-white"
      >
        <span>🎓</span>
        <span>Learning</span>
        <svg
          className={`w-4 h-4 transition-transform duration-300 ${learningDropdownOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </NavLink>

      {/* ドロップダウンメニュー */}
      {learningDropdownOpen && (
        <div
          className="absolute top-full left-0 mt-1 w-64 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200/20 dark:border-gray-700/50 backdrop-blur-sm z-50 overflow-hidden"
          onMouseEnter={handleLearningMouseEnter}
          onMouseLeave={handleLearningMouseLeave}
        >
          <div className="p-2">
            <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 px-3 py-2 uppercase tracking-wider">
              学習カテゴリ
            </div>
            {learningCategories.map((category) => (
              <button
                key={category.key}
                onClick={() => handleLearningCategorySelect(category.key)}
                className="w-full text-left px-3 py-3 rounded-lg hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 dark:hover:from-indigo-900/30 dark:hover:to-purple-900/30 transition-all duration-200 group/item"
              >
                <div className="flex items-center space-x-3">
                  <span className="text-lg group-hover/item:scale-110 transition-transform duration-200">
                    {category.icon}
                  </span>
                  <span className="text-gray-700 dark:text-gray-300 font-medium group-hover/item:text-indigo-600 dark:group-hover/item:text-indigo-400 transition-colors duration-200">
                    {category.name}
                  </span>
                </div>
              </button>
            ))}
          </div>
          <div className="border-t border-gray-200/20 dark:border-gray-700/50 p-2">
            <NavLink
              to="/learning"
              onClick={() => setLearningDropdownOpen(false)}
              className="block w-full text-left px-3 py-2 text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg transition-all duration-200"
            >
              📊 すべて表示
            </NavLink>
          </div>
        </div>
      )}
    </div>
  );

  // Articlesメニューのマウスイベントハンドラー
  const handleArticlesMouseEnter = () => {
    if (articlesCloseTimer) {
      clearTimeout(articlesCloseTimer);
      setArticlesCloseTimer(null);
    }
    setArticlesDropdownOpen(true);
  };

  const handleArticlesMouseLeave = () => {
    const timer = setTimeout(() => {
      setArticlesDropdownOpen(false);
    }, 300); // 300ms の遅延
    setArticlesCloseTimer(timer);
  };

  // デスクトップ版Articlesメニューコンポーネント
  const DesktopArticlesMenu = () => (
    <div
      className="relative group"
      onMouseEnter={handleArticlesMouseEnter}
      onMouseLeave={handleArticlesMouseLeave}
    >
      <NavLink
        to="/articles"
        className="flex items-center space-x-1 px-4 py-2 rounded-lg hover:bg-white/10 transition-all duration-200 text-white"
      >
        <span>📖</span>
        <span>Articles</span>
        <svg
          className={`w-4 h-4 transition-transform duration-300 ${articlesDropdownOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </NavLink>

      {/* ドロップダウンメニュー */}
      {articlesDropdownOpen && (
        <div
          className="absolute top-full left-0 mt-1 w-64 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200/20 dark:border-gray-700/50 backdrop-blur-sm z-50 overflow-hidden"
          onMouseEnter={handleArticlesMouseEnter}
          onMouseLeave={handleArticlesMouseLeave}
        >
          <div className="p-2">
            <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 px-3 py-2 uppercase tracking-wider">
              記事カテゴリ
            </div>
            {articleCategories.map((category) => (
              <button
                key={category.key}
                onClick={() => handleArticleCategorySelect(category.key)}
                className="w-full text-left px-3 py-3 rounded-lg hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 dark:hover:from-indigo-900/30 dark:hover:to-purple-900/30 transition-all duration-200 group/item"
              >
                <div className="flex items-center space-x-3">
                  <span className="text-lg group-hover/item:scale-110 transition-transform duration-200">
                    {category.icon}
                  </span>
                  <span className="text-gray-700 dark:text-gray-300 font-medium group-hover/item:text-indigo-600 dark:group-hover/item:text-indigo-400 transition-colors duration-200">
                    {category.name}
                  </span>
                </div>
              </button>
            ))}
          </div>
          <div className="border-t border-gray-200/20 dark:border-gray-700/50 p-2">
            <NavLink
              to="/articles"
              onClick={() => setArticlesDropdownOpen(false)}
              className="block w-full text-left px-3 py-2 text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg transition-all duration-200"
            >
              📊 すべて表示
            </NavLink>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className={`App min-h-screen flex flex-col ${effectiveTheme === 'dark'
      ? 'bg-gradient-to-br from-gray-900 via-slate-900 to-gray-800 text-gray-100'
      : 'bg-gradient-to-br from-blue-50 via-indigo-50 via-purple-50 to-pink-50 text-gray-900'
      }`}>
      <header className={`${effectiveTheme === 'dark'
        ? 'bg-gradient-to-r from-slate-900/95 to-blue-900/95'
        : 'bg-gradient-to-r from-slate-700/95 to-blue-700/95'
        } text-white shadow-xl sticky top-0 z-30 backdrop-blur-lg border-b border-white/10`}>
        <div className="container mx-auto px-4 py-2 md:py-3">
          {/* モバイル向けナビゲーション */}
          <div className="flex items-center justify-between md:hidden">
            <h1 className="text-lg font-bold bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">
              Flight Academy
            </h1>
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0 z-40">
                <SafeAuthButton />
              </div>
              <ThemeToggler />
              <button
                onClick={toggleMenu}
                className="text-indigo-200 hover:text-white focus:outline-none ml-1 p-2 rounded-lg hover:bg-white/10 transition-all duration-200"
                aria-label="メニューを開く"
              >
                <svg
                  className="w-6 h-6 transition-transform duration-300"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  {menuOpen ? (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  ) : (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6h16M4 12h16m-7 6h7"
                    />
                  )}
                </svg>
              </button>
            </div>
          </div>

          {/* モバイルメニュー */}
          {menuOpen && (
            <div className="mt-4 md:hidden bg-black/20 backdrop-blur-sm rounded-xl border border-white/10">
              <nav className="flex flex-col p-4 space-y-1">
                <NavLink to="/" onClick={() => setMenuOpen(false)} className="px-4 py-3 rounded-lg hover:bg-white/10 transition-all duration-200 text-white">
                  🗺️ Planning/Map
                </NavLink>

                {/* モバイル版Articlesメニュー */}
                <div>
                  <button
                    onClick={() => setArticlesDropdownOpen(!articlesDropdownOpen)}
                    className="w-full text-left px-4 py-3 rounded-lg hover:bg-white/10 transition-all duration-200 flex items-center justify-between text-white"
                  >
                    <span>📖 Articles</span>
                    <svg
                      className={`w-4 h-4 transition-transform duration-300 ${articlesDropdownOpen ? 'rotate-180' : ''}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {articlesDropdownOpen && (
                    <div className="ml-4 mt-2 space-y-1 border-l-2 border-white/20 pl-4">
                      {articleCategories.map((category) => (
                        <button
                          key={category.key}
                          onClick={() => handleArticleCategorySelect(category.key)}
                          className="w-full text-left px-3 py-2 rounded-lg hover:bg-white/10 transition-all duration-200 text-sm flex items-center space-x-2 text-white"
                        >
                          <span>{category.icon}</span>
                          <span>{category.name}</span>
                        </button>
                      ))}
                      <NavLink
                        to="/articles"
                        onClick={() => setMenuOpen(false)}
                        className="block w-full text-left px-3 py-2 text-sm text-indigo-300 hover:bg-white/10 rounded-lg transition-all duration-200"
                      >
                        📊 すべて表示
                      </NavLink>
                    </div>
                  )}
                </div>

                {/* モバイル版Learningメニュー */}
                <div>
                  <button
                    onClick={() => setLearningDropdownOpen(!learningDropdownOpen)}
                    className="w-full text-left px-4 py-3 rounded-lg hover:bg-white/10 transition-all duration-200 flex items-center justify-between text-white"
                  >
                    <span>🎓 Learning</span>
                    <svg
                      className={`w-4 h-4 transition-transform duration-300 ${learningDropdownOpen ? 'rotate-180' : ''}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {learningDropdownOpen && (
                    <div className="ml-4 mt-2 space-y-1 border-l-2 border-white/20 pl-4">
                      {learningCategories.map((category) => (
                        <button
                          key={category.key}
                          onClick={() => handleLearningCategorySelect(category.key)}
                          className="w-full text-left px-3 py-2 rounded-lg hover:bg-white/10 transition-all duration-200 text-sm flex items-center space-x-2 text-white"
                        >
                          <span>{category.icon}</span>
                          <span>{category.name}</span>
                        </button>
                      ))}
                      <NavLink
                        to="/learning"
                        onClick={() => setMenuOpen(false)}
                        className="block w-full text-left px-3 py-2 text-sm text-indigo-300 hover:bg-white/10 rounded-lg transition-all duration-200"
                      >
                        📊 すべて表示
                      </NavLink>
                    </div>
                  )}
                </div>

                <NavLink to="/test" onClick={() => setMenuOpen(false)} className="px-4 py-3 rounded-lg hover:bg-white/10 transition-all duration-200 text-white">
                  📝 Test
                </NavLink>

              </nav>
            </div>
          )}

          {/* デスクトップナビゲーション */}
          <div className="hidden md:flex md:justify-between md:items-center">
            <div className="flex items-center space-x-6">
              <h1 className="text-xl font-bold bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">
                Flight Academy
              </h1>
              <nav className="flex items-center space-x-1">
                <NavLink
                  to="/"
                  className="px-4 py-2 rounded-lg hover:bg-white/10 transition-all duration-200 flex items-center space-x-2 text-white"
                >
                  <span>🗺️</span>
                  <span>Planning/Map</span>
                </NavLink>
                <DesktopArticlesMenu />
                <DesktopLearningMenu />
                <NavLink
                  to="/test"
                  className="px-4 py-2 rounded-lg hover:bg-white/10 transition-all duration-200 flex items-center space-x-2 text-white"
                >
                  <span>📝</span>
                  <span>Test</span>
                </NavLink>

              </nav>
            </div>
            <div className="flex items-center space-x-4 z-40">
              <ThemeToggler />
              <div className="flex-shrink-0">
                <SafeAuthButton />
              </div>
            </div>
          </div>
        </div>
      </header>
      <main className="container mx-auto flex-grow">
        <Suspense fallback={<LoadingSpinner />}>
          <Routes>
            <Route path="/" element={<PlanningMapPage />} />
            <Route path="/learning" element={<NewLearningPage />} />
            <Route path="/learning/:contentId" element={<NewLearningPage />} />
            <Route path="/learning-old" element={<LearningPage />} />
            <Route path="/articles" element={<ArticlesPage />} />
            <Route path="/test" element={
              <SafeRequireAuth>
                <ExamTab />
              </SafeRequireAuth>
            } />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/profile" element={
              <SafeRequireAuth>
                <ProfilePage />
              </SafeRequireAuth>
            } />

            <Route path="/test-stats" element={<ArticleStatsTestPage />} />
          </Routes>
        </Suspense>
      </main>
      <footer className={`${effectiveTheme === 'dark'
        ? 'bg-gradient-to-r from-slate-900/95 to-blue-900/95'
        : 'bg-gradient-to-r from-slate-700/95 to-blue-700/95'
        } text-white text-center py-4 text-sm sm:text-base shadow-lg backdrop-blur-sm border-t border-white/10`}>
        <p>&copy; 2024 Flight Academy. All rights reserved.</p>
      </footer>
    </div>
  );
};
