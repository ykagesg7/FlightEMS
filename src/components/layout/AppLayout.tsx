import React, { lazy, useEffect, useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuthStore } from '../../stores/authStore';
import { AuthButton } from '../auth/AuthButton';
import { HUDTimeDisplay } from '../ui/HUDDashboard';
import { ProgressIndicator } from '../ui/ProgressIndicator';
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

  // ミリタリーテーマかどうかの判定
  const isMilitary = effectiveTheme === 'military';

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
        className={`flex items-center space-x-1 px-4 py-2 ${isMilitary
          ? 'fighter-nav-item hud-text border-none rounded-none'
          : 'rounded-lg hover:bg-white/10 transition-all duration-200 text-white'
          }`}
      >
        <span>{isMilitary ? '🎖️' : '🎓'}</span>
        <span>{isMilitary ? 'TRAINING' : 'Learning'}</span>
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
          className={`absolute top-full left-0 mt-1 w-64 ${isMilitary
            ? 'hud-card border border-hud-accent'
            : 'bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200/20 dark:border-gray-700/50'
            } backdrop-blur-sm z-50 overflow-hidden`}
          onMouseEnter={handleLearningMouseEnter}
          onMouseLeave={handleLearningMouseLeave}
        >
          <div className="p-2">
            <div className={`text-xs font-semibold px-3 py-2 uppercase tracking-wider ${isMilitary
              ? 'text-hud-accent font-hud hud-text-blink'
              : 'text-gray-500 dark:text-gray-400'
              }`}>
              {isMilitary ? '▶ TRAINING MODULES' : '学習カテゴリ'}
            </div>
            {learningCategories.map((category) => (
              <button
                key={category.key}
                onClick={() => handleLearningCategorySelect(category.key)}
                className={`w-full text-left px-3 py-3 transition-all duration-200 group/item ${isMilitary
                  ? 'hud-button border-none rounded-none hover:bg-hud-dim'
                  : 'rounded-lg hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 dark:hover:from-indigo-900/30 dark:hover:to-purple-900/30'
                  }`}
              >
                <div className="flex items-center space-x-3">
                  <span className="text-lg group-hover/item:scale-110 transition-transform duration-200">
                    {category.icon}
                  </span>
                  <span className={`font-medium transition-colors duration-200 ${isMilitary
                    ? 'text-hud-primary group-hover/item:text-hud-glow font-hud'
                    : 'text-gray-700 dark:text-gray-300 group-hover/item:text-indigo-600 dark:group-hover/item:text-indigo-400'
                    }`}>
                    {isMilitary ? category.name.toUpperCase() : category.name}
                  </span>
                </div>
              </button>
            ))}
          </div>
          <div className={`p-2 ${isMilitary
            ? 'border-t border-hud-accent'
            : 'border-t border-gray-200/20 dark:border-gray-700/50'
            }`}>
            <NavLink
              to="/learning"
              onClick={() => setLearningDropdownOpen(false)}
              className={`block w-full text-left px-3 py-2 text-sm font-medium transition-all duration-200 ${isMilitary
                ? 'hud-button text-hud-secondary border-none rounded-none'
                : 'text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg'
                }`}
            >
              {isMilitary ? '⚡ ALL MODULES' : '📊 すべて表示'}
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
        className={`flex items-center space-x-1 px-4 py-2 ${isMilitary
          ? 'fighter-nav-item hud-text border-none rounded-none'
          : 'rounded-lg hover:bg-white/10 transition-all duration-200 text-white'
          }`}
      >
        <span>{isMilitary ? '📋' : '📖'}</span>
        <span>{isMilitary ? 'MANUAL' : 'Articles'}</span>
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
          className={`absolute top-full left-0 mt-1 w-64 ${isMilitary
            ? 'hud-card border border-hud-accent'
            : 'bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200/20 dark:border-gray-700/50'
            } backdrop-blur-sm z-50 overflow-hidden`}
          onMouseEnter={handleArticlesMouseEnter}
          onMouseLeave={handleArticlesMouseLeave}
        >
          <div className="p-2">
            <div className={`text-xs font-semibold px-3 py-2 uppercase tracking-wider ${isMilitary
              ? 'text-hud-accent font-hud hud-text-blink'
              : 'text-gray-500 dark:text-gray-400'
              }`}>
              {isMilitary ? '▶ OPERATION MANUAL' : '記事カテゴリ'}
            </div>
            {articleCategories.map((category) => (
              <button
                key={category.key}
                onClick={() => handleArticleCategorySelect(category.key)}
                className={`w-full text-left px-3 py-3 transition-all duration-200 group/item ${isMilitary
                  ? 'hud-button border-none rounded-none hover:bg-hud-dim'
                  : 'rounded-lg hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 dark:hover:from-indigo-900/30 dark:hover:to-purple-900/30'
                  }`}
              >
                <div className="flex items-center space-x-3">
                  <span className="text-lg group-hover/item:scale-110 transition-transform duration-200">
                    {category.icon}
                  </span>
                  <span className={`font-medium transition-colors duration-200 ${isMilitary
                    ? 'text-hud-primary group-hover/item:text-hud-glow font-hud'
                    : 'text-gray-700 dark:text-gray-300 group-hover/item:text-indigo-600 dark:group-hover/item:text-indigo-400'
                    }`}>
                    {isMilitary ? category.name.toUpperCase() : category.name}
                  </span>
                </div>
              </button>
            ))}
          </div>
          <div className={`p-2 ${isMilitary
            ? 'border-t border-hud-accent'
            : 'border-t border-gray-200/20 dark:border-gray-700/50'
            }`}>
            <NavLink
              to="/articles"
              onClick={() => setArticlesDropdownOpen(false)}
              className={`block w-full text-left px-3 py-2 text-sm font-medium transition-all duration-200 ${isMilitary
                ? 'hud-button text-hud-secondary border-none rounded-none'
                : 'text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg'
                }`}
            >
              {isMilitary ? '⚡ ALL MANUALS' : '📊 すべて表示'}
            </NavLink>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isMilitary ? 'bg-military-fighter-panel text-hud-primary' : 'bg-gray-900 text-gray-100'
      }`}>
      {/* ヘッダー */}
      <header className={`border-b transition-all duration-300 ${isMilitary
        ? 'fighter-header border-hud-accent bg-military-camo-dark'
        : 'border-gray-700 bg-gray-800'
        }`}>
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* ロゴ・タイトル */}
            <div className="flex items-center space-x-4">
              <h1 className={`text-xl font-bold transition-all duration-300 ${isMilitary
                ? 'hud-text-glow font-tactical tracking-wider'
                : 'text-blue-400'
                }`}>
                {isMilitary ? '⚡ FLIGHT ACADEMY ⚡' : 'Flight Academy'}
              </h1>
              {/* 時刻表示 */}
              {isMilitary && (
                <HUDTimeDisplay className="ml-4" />
              )}
            </div>

            {/* ナビゲーション・ユーティリティ */}
            <div className="flex items-center space-x-4">
              <div className={`hidden md:flex items-center space-x-1 ${isMilitary ? 'fighter-nav' : ''}`}>
                <NavLink
                  to="/"
                  className={`flex items-center space-x-1 px-4 py-2 ${isMilitary
                    ? 'fighter-nav-item hud-text border-none rounded-none'
                    : 'rounded-lg hover:bg-white/10 transition-all duration-200 text-white'
                    }`}
                >
                  <span>{isMilitary ? '📡' : '🗺️'}</span>
                  <span>{isMilitary ? 'PLANNING/MAP' : 'Planning/Map'}</span>
                </NavLink>
                <DesktopArticlesMenu />
                <DesktopLearningMenu />
                <NavLink
                  to="/test"
                  className={`flex items-center space-x-1 px-4 py-2 ${isMilitary
                    ? 'fighter-nav-item hud-text border-none rounded-none'
                    : 'rounded-lg hover:bg-white/10 transition-all duration-200 text-white'
                    }`}
                >
                  <span>{isMilitary ? '🎯' : '📝'}</span>
                  <span>{isMilitary ? 'COMBAT TEST' : 'Test'}</span>
                </NavLink>
              </div>
              <ProgressIndicator />
              <ThemeToggler />
              <AuthButton />
            </div>
          </div>

          {/* モバイル用ナビゲーション */}
          <div className={`md:hidden mt-4 pt-4 border-t transition-all duration-300 ${isMilitary
            ? 'border-hud-accent'
            : 'border-gray-700'
            }`}>
            <nav className="flex flex-col space-y-1">
              <NavLink
                to="/"
                className={`px-4 py-3 transition-all duration-200 ${isMilitary
                  ? 'fighter-nav-item hud-text'
                  : 'rounded-lg hover:bg-white/10 text-white'
                  }`}
              >
                {isMilitary ? '📡 PLANNING/MAP' : '🗺️ Planning/Map'}
              </NavLink>
              <button
                onClick={() => setArticlesDropdownOpen(!articlesDropdownOpen)}
                className="w-full text-left px-4 py-3 rounded-lg hover:bg-white/10 transition-all duration-200 flex items-center justify-between text-white"
              >
                <span>{isMilitary ? '📋 MANUAL' : '📖 Articles'}</span>
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
                </div>
              )}
              <button
                onClick={() => setLearningDropdownOpen(!learningDropdownOpen)}
                className="w-full text-left px-4 py-3 rounded-lg hover:bg-white/10 transition-all duration-200 flex items-center justify-between text-white"
              >
                <span>{isMilitary ? '🎖️ TRAINING' : '🎓 Learning'}</span>
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
                </div>
              )}
              <NavLink
                to="/test"
                className={`px-4 py-3 transition-all duration-200 ${isMilitary
                  ? 'fighter-nav-item hud-text'
                  : 'rounded-lg hover:bg-white/10 text-white'
                  }`}
              >
                {isMilitary ? '🎯 COMBAT TEST' : '📝 Test'}
              </NavLink>
            </nav>
          </div>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className={`container mx-auto px-4 py-8 transition-all duration-300 ${isMilitary ? 'military:text-hud' : ''
        }`}>
        <div className={`rounded-lg p-6 shadow-lg transition-all duration-300 ${isMilitary
          ? 'camo-card hud-text shadow-hud-glow border border-hud-accent'
          : 'bg-gray-800 border border-gray-700'
          }`}>
          <Outlet />
        </div>
      </main>

      {/* フッター */}
      <footer className={`border-t mt-12 transition-all duration-300 ${isMilitary
        ? 'border-hud-accent bg-military-fighter-cockpit'
        : 'border-gray-700 bg-gray-800'
        }`}>
        <div className="container mx-auto px-4 py-6">
          <div className="text-center">
            <p className={`text-sm transition-all duration-300 ${isMilitary
              ? 'hud-text font-tactical tracking-wider'
              : 'text-gray-400'
              }`}>
              {isMilitary
                ? '⚡ TACTICAL FLIGHT TRAINING SYSTEM - SECURE NETWORK ⚡'
                : '© 2024 Flight Academy. All rights reserved.'}
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};
