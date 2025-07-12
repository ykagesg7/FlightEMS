import React, { useEffect, useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import AuthButton from '../auth/AuthButton';
import { HUDTimeDisplay } from '../ui/HUDDashboard';
import ProgressIndicator from '../ui/ProgressIndicator';
import { ThemeToggler } from '../ui/ThemeToggler';

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
  { name: 'その他', key: 'others', icon: '📖' }
];

export const AppLayout: React.FC = () => {
  const [learningDropdownOpen, setLearningDropdownOpen] = useState(false);
  const [articlesDropdownOpen, setArticlesDropdownOpen] = useState(false);
  const { effectiveTheme } = useTheme();

  // ミリタリーテーマかどうかの判定
  const isMilitary = effectiveTheme === 'military';

  const handleLearningCategorySelect = () => {
    setLearningDropdownOpen(false);
  };

  const handleArticleCategorySelect = () => {
    setArticlesDropdownOpen(false);
  };

  // サブメニュー外クリックで閉じるuseEffectをAppLayout本体に追加
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        learningDropdownOpen || articlesDropdownOpen
      ) {
        const menuElements = document.querySelectorAll('.relative.group');
        let clickedInside = false;
        menuElements.forEach((el) => {
          if (el.contains(event.target as Node)) {
            clickedInside = true;
          }
        });
        if (!clickedInside) {
          setLearningDropdownOpen(false);
          setArticlesDropdownOpen(false);
        }
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [learningDropdownOpen, articlesDropdownOpen]);

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isMilitary ? 'bg-military-fighter-panel text-hud-primary' : 'bg-gray-900 text-gray-100'
      }`}>
      {/* ヘッダー */}
      <header className={`border-b transition-all duration-300 ${isMilitary
        ? 'border-hud-accent bg-black/40'
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
                FLIGHT ACADEMY
              </h1>
              {/* 時刻表示 (全テーマ表示) */}
              <HUDTimeDisplay className="ml-4" />
            </div>

            {/* ナビゲーション・ユーティリティ */}
            <div className="flex items-center gap-8">
              <div className={`hidden md:flex items-center gap-4 ${isMilitary ? 'fighter-nav' : ''}`}>
                <NavLink
                  to="/"
                  className={`flex-1 flex items-center space-x-1 px-4 py-2 ${isMilitary
                    ? 'fighter-nav-item hud-text border-none rounded-none'
                    : 'rounded-lg hover:bg-white/10 transition-all duration-200 text-white'
                    }`}
                >
                  <span>PLANNING</span>
                </NavLink>
                <div className="relative group flex-1">
                  <NavLink
                    to="#"
                    onClick={() => setArticlesDropdownOpen((prev) => !prev)}
                    className={`flex items-center space-x-1 px-4 py-2 ${isMilitary
                      ? 'fighter-nav-item hud-text border-none rounded-none'
                      : 'rounded-lg hover:bg-white/10 transition-all duration-200 text-white'
                      }`}
                    aria-expanded={articlesDropdownOpen}
                    aria-haspopup="true"
                  >
                    <span>ARTICLES</span>
                    <svg
                      className={`w-4 h-4 transition-transform duration-300 ${articlesDropdownOpen ? 'rotate-180' : ''}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </NavLink>
                  {articlesDropdownOpen && (
                    <div
                      className="absolute top-full left-0 mt-1 w-64 bg-black/90 rounded-xl shadow-2xl border border-gray-200/20 dark:border-gray-700/50 backdrop-blur-sm z-50 overflow-hidden"
                    >
                      <div className="p-2">
                        <div className="text-xs font-semibold px-3 py-2 uppercase tracking-wider text-gray-500 dark:text-gray-400">
                          ▶ CATEGORIES
                        </div>
                        {articleCategories.map((category) => (
                          <button
                            key={category.key}
                            onClick={() => handleArticleCategorySelect()}
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
                      <div className="p-2 border-t border-gray-200/20 dark:border-gray-700/50">
                        <NavLink
                          to="/articles"
                          onClick={() => setArticlesDropdownOpen(false)}
                          className="block w-full text-left px-3 py-2 text-sm font-medium transition-all duration-200 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg"
                        >
                          ALL
                        </NavLink>
                      </div>
                    </div>
                  )}
                </div>
                <div className="relative group flex-1">
                  <NavLink
                    to="#"
                    onClick={() => setLearningDropdownOpen((prev) => !prev)}
                    className={`flex items-center space-x-1 px-4 py-2 ${isMilitary
                      ? 'fighter-nav-item hud-text border-none rounded-none'
                      : 'rounded-lg hover:bg-white/10 transition-all duration-200 text-white'
                      }`}
                    aria-expanded={learningDropdownOpen}
                    aria-haspopup="true"
                  >
                    <span>LESSONS</span>
                    <svg
                      className={`w-4 h-4 transition-transform duration-300 ${learningDropdownOpen ? 'rotate-180' : ''}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </NavLink>
                  {learningDropdownOpen && (
                    <div
                      className="absolute top-full left-0 mt-1 w-64 bg-black/90 rounded-xl shadow-2xl border border-gray-200/20 dark:border-gray-700/50 backdrop-blur-sm z-50 overflow-hidden"
                    >
                      <div className="p-2">
                        <div className="text-xs font-semibold px-3 py-2 uppercase tracking-wider text-gray-500 dark:text-gray-400">
                          ▶ Categories
                        </div>
                        {learningCategories.map((category) => (
                          <button
                            key={category.key}
                            onClick={() => handleLearningCategorySelect()}
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
                      <div className="p-2 border-t border-gray-200/20 dark:border-gray-700/50">
                        <NavLink
                          to="/learning"
                          onClick={() => setLearningDropdownOpen(false)}
                          className="block w-full text-left px-3 py-2 text-sm font-medium transition-all duration-200 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg"
                        >
                          ALL
                        </NavLink>
                      </div>
                    </div>
                  )}
                </div>
                <NavLink
                  to="/test"
                  className={`flex-1 flex items-center space-x-1 px-4 py-2 ${isMilitary
                    ? 'fighter-nav-item hud-text border-none rounded-none'
                    : 'rounded-lg hover:bg-white/10 transition-all duration-200 text-white'
                    }`}
                >
                  <span>TEST</span>
                </NavLink>
              </div>
              <div className="flex items-center space-x-4">
                <ProgressIndicator />
                <ThemeToggler />
                <AuthButton />
              </div>
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
                PLANNING
              </NavLink>
              <NavLink
                to="/articles"
                onClick={() => setArticlesDropdownOpen(!articlesDropdownOpen)}
                className="w-full text-left px-4 py-3 rounded-lg hover:bg-white/10 transition-all duration-200 flex items-center justify-between text-white"
              >
                <span>ARTICLES</span>
                <svg
                  className={`w-4 h-4 transition-transform duration-300 ${articlesDropdownOpen ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </NavLink>
              {articlesDropdownOpen && (
                <div className="ml-4 mt-2 space-y-1 border-l-2 border-white/20 pl-4">
                  {articleCategories.map((category) => (
                    <button
                      key={category.key}
                      onClick={() => handleArticleCategorySelect()}
                      className="w-full text-left px-3 py-2 rounded-lg hover:bg-white/10 transition-all duration-200 text-sm flex items-center space-x-2 text-white"
                    >
                      <span>{category.icon}</span>
                      <span>{category.name}</span>
                    </button>
                  ))}
                </div>
              )}
              <NavLink
                to="/learning"
                onClick={() => setLearningDropdownOpen(!learningDropdownOpen)}
                className="w-full text-left px-4 py-3 rounded-lg hover:bg-white/10 transition-all duration-200 flex items-center justify-between text-white"
              >
                <span>LESSONS</span>
                <svg
                  className={`w-4 h-4 transition-transform duration-300 ${learningDropdownOpen ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </NavLink>
              {learningDropdownOpen && (
                <div className="ml-4 mt-2 space-y-1 border-l-2 border-white/20 pl-4">
                  {learningCategories.map((category) => (
                    <button
                      key={category.key}
                      onClick={() => handleLearningCategorySelect()}
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
                TEST
              </NavLink>
            </nav>
          </div>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className={`container mx-auto px-4 py-8 transition-all duration-300 ${isMilitary ? 'military:text-hud' : ''}
        }`}>
        <div className={`rounded-lg p-6 shadow-lg transition-all duration-300 ${isMilitary
          ? 'bg-black/60 text-[#00ff41] border border-hud-accent'
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
              {'Flight Academy'}
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};
