import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import React, { useEffect, useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import { AuthButton } from '../auth/AuthButton';
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { effectiveTheme } = useTheme();
  const navigate = useNavigate();

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
    <div className={`min-h-screen transition-colors duration-300 ${effectiveTheme === 'day' ? 'bg-[#14213d]' : 'bg-black'} text-gray-100`}>
      {/* ヘッダー */}
      <header className={`border-b transition-all duration-300 border-gray-700 ${effectiveTheme === 'day'
        ? 'bg-[color:var(--bg)]'
        : 'bg-[color:var(--bg)]'
        }`}>
        <div className="container mx-auto px-4 py-4">
          {/* デスクトップ用（1段構成） */}
          <div className="hidden md:flex items-center justify-between">
            {/* ロゴ・タイトルと時刻表示 */}
            <div className="flex items-center gap-4">
              <h1
                className="text-2xl font-extrabold tracking-wider transition-all duration-300 hud-text"
              >
                FLIGHT ACADEMY
              </h1>
              <HUDTimeDisplay />
            </div>
            {/* デスクトップ用ナビゲーション・ユーティリティ */}
            <div className="flex items-center gap-8">
              <div className="flex items-center gap-4"> {/* ナビゲーション */}
                <NavLink
                  to="/"
                  className="flex-1 flex items-center space-x-1 px-4 py-2 rounded-lg hover:bg-white/10 transition-all duration-200 text-white"
                >
                  <span className="hud-text">PLANNING</span>
                </NavLink>
                <div className="relative group flex-1">
                  <DropdownMenu.Root open={articlesDropdownOpen} onOpenChange={setArticlesDropdownOpen}>
                    <DropdownMenu.Trigger asChild>
                      <button className="flex items-center space-x-1 px-4 py-2 rounded-lg hover:bg-white/10 transition-all duration-200 text-white focus-visible:focus-hud">
                        <span className="hud-text">ARTICLES</span>
                        <svg className={`w-4 h-4 transition-transform duration-300 ${articlesDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                    </DropdownMenu.Trigger>
                    <DropdownMenu.Content sideOffset={6} className="mt-1 w-64 bg-black/90 rounded-xl shadow-2xl border border-gray-200/20 dark:border-gray-700/50 backdrop-blur-sm z-50 overflow-hidden">
                      <div className="p-2">
                        <div className="text-xs font-semibold px-3 py-2 uppercase tracking-wider text-gray-500 dark:text-gray-400">▶ CATEGORIES</div>
                        {articleCategories.map((category) => (
                          <DropdownMenu.Item key={category.key} asChild>
                            <button
                              onClick={() => {
                                setArticlesDropdownOpen(false);
                                navigate(`/articles?category=${category.key}`);
                              }}
                              className="w-full text-left px-3 py-3 transition-all duration-200 group/item rounded-lg hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 dark:hover:from-indigo-900/30 dark:hover:to-purple-900/30 focus-visible:focus-hud"
                            >
                              <div className="flex items-center space-x-3">
                                <span className="text-lg group-hover/item:scale-110 transition-transform duration-200">{category.icon}</span>
                                <span className={`font-medium transition-colors duration-200 text-gray-300 group-hover/item:text-indigo-400`}>{category.name}</span>
                              </div>
                            </button>
                          </DropdownMenu.Item>
                        ))}
                      </div>
                      <div className="p-2 border-t border-gray-200/20 dark:border-gray-700/50">
                        <DropdownMenu.Item asChild>
                          <NavLink to="/articles" onClick={() => setArticlesDropdownOpen(false)} className="block w-full text-left px-3 py-2 text-sm font-medium transition-all duration-200 hud-text hover:bg-white/5 rounded-lg">
                            ALL
                          </NavLink>
                        </DropdownMenu.Item>
                      </div>
                    </DropdownMenu.Content>
                  </DropdownMenu.Root>
                </div>
                <div className="relative group flex-1">
                  <DropdownMenu.Root open={learningDropdownOpen} onOpenChange={setLearningDropdownOpen}>
                    <DropdownMenu.Trigger asChild>
                      <button className="flex items-center space-x-1 px-4 py-2 rounded-lg hover:bg-white/10 transition-all duration-200 text-white focus-visible:focus-hud">
                        <span className="hud-text">LESSONS</span>
                        <svg className={`w-4 h-4 transition-transform duration-300 ${learningDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                    </DropdownMenu.Trigger>
                    <DropdownMenu.Content sideOffset={6} className="mt-1 w-64 bg-black/90 rounded-xl shadow-2xl border border-gray-200/20 dark:border-gray-700/50 backdrop-blur-sm z-50 overflow-hidden">
                      <div className="p-2">
                        <div className="text-xs font-semibold px-3 py-2 uppercase tracking-wider text-gray-500 dark:text-gray-400">▶ Categories</div>
                        {learningCategories.map((category) => (
                          <DropdownMenu.Item key={category.key} asChild>
                            <button
                              onClick={() => {
                                setLearningDropdownOpen(false);
                                navigate(`/learning?category=${category.key}`);
                              }}
                              className="w-full text-left px-3 py-3 transition-all duration-200 group/item rounded-lg hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 dark:hover:from-indigo-900/30 dark:hover:to-purple-900/30 focus-visible:focus-hud"
                            >
                              <div className="flex items-center space-x-3">
                                <span className="text-lg group-hover/item:scale-110 transition-transform duration-200">{category.icon}</span>
                                <span className={`font-medium transition-colors duration-200 text-gray-300 group-hover/item:text-indigo-400`}>{category.name}</span>
                              </div>
                            </button>
                          </DropdownMenu.Item>
                        ))}
                      </div>
                      <div className="p-2 border-t border-gray-200/20 dark:border-gray-700/50">
                        <DropdownMenu.Item asChild>
                          <NavLink to="/learning" onClick={() => setLearningDropdownOpen(false)} className="block w-full text-left px-3 py-2 text-sm font-medium transition-all duration-200 hud-text hover:bg-white/5 rounded-lg">
                            ALL
                          </NavLink>
                        </DropdownMenu.Item>
                      </div>
                    </DropdownMenu.Content>
                  </DropdownMenu.Root>
                </div>
                <NavLink
                  to="/test"
                  className="flex-1 flex items-center space-x-1 px-4 py-2 rounded-lg hover:bg-white/10 transition-all duration-200 text-white"
                >
                  <span className="hud-text">TEST</span>
                </NavLink>
              </div>
              <div className="flex items-center space-x-4">
                <ProgressIndicator />
                <ThemeToggler />
                <AuthButton iconOnly />
              </div>
            </div>
          </div>

          {/* モバイル用（2段構成） */}
          <div className="md:hidden w-full">
            {/* 1段目: タイトル＋時計 */}
            <div className="flex items-center gap-4 justify-between">
              <div className="flex items-center gap-4">
                <h1
                  className="text-xl font-extrabold tracking-wider transition-all duration-300"
                  style={
                    effectiveTheme === 'day'
                      ? { color: '#39FF14' }
                      : effectiveTheme === 'dark'
                        ? { color: '#FF3B3B' }
                        : { color: '#39FF14' }
                  }
                >
                  FLIGHT ACADEMY
                </h1>
                <HUDTimeDisplay />
              </div>
            </div>
            {/* 2段目: ユーティリティ＋ハンバーガー */}
            <div className="flex items-center gap-2 mt-2">
              <ProgressIndicator />
              <ThemeToggler />
              <AuthButton iconOnly />
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="ml-2 p-2 rounded-lg transition-all duration-200 hover:bg-white/10"
                style={
                  effectiveTheme === 'day'
                    ? { color: '#39FF14' }
                    : effectiveTheme === 'dark'
                      ? { color: '#FF3B3B' }
                      : { color: '#39FF14' }
                }>
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg">
                  {mobileMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* モバイルメニュー（サイドバー） */}
        {mobileMenuOpen && (
          <div className="fixed inset-y-0 right-0 w-64 px-4 bg-[color:var(--bg)] border-l hud-border z-50 transform transition-transform duration-300 ease-in-out">
            <div className="flex justify-end p-4">
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 rounded-lg transition-all duration-200 hover:bg-white/10 hud-text">
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <nav className="flex flex-col space-y-1 p-4">
              <NavLink
                to="/"
                onClick={() => setMobileMenuOpen(false)}
                className="px-4 py-3 transition-all duration-200 rounded-lg hover:bg-white/10 text-white"
              >
                <span className="hud-text">PLANNING</span>
              </NavLink>
              <NavLink
                to="/articles"
                onClick={() => {
                  setArticlesDropdownOpen(!articlesDropdownOpen);
                  // setMobileMenuOpen(false); // Do not close main menu on dropdown toggle
                }}
                className="w-full text-left px-4 py-3 rounded-lg hover:bg-white/10 transition-all duration-200 flex items-center justify-between text-white"
              >
                <span className="hud-text">ARTICLES</span>
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
                      onClick={() => {
                        setMobileMenuOpen(false);
                        navigate(`/articles?category=${category.key}`);
                      }}
                      className="w-full text-left px-3 py-2 rounded-lg hover:bg-white/10 transition-all duration-200 text-sm flex items-center space-x-2 text-white"
                    >
                      <span className="hud-text">{category.icon}</span>
                      <span className="hud-text">{category.name}</span>
                    </button>
                  ))}
                  <NavLink
                    to="/articles"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block w-full text-left px-3 py-2 text-sm font-medium transition-all duration-200 hud-text hover:bg-white/5 rounded-lg"
                  >
                    ALL
                  </NavLink>
                </div>
              )}
              <NavLink
                to="/learning"
                onClick={() => {
                  setLearningDropdownOpen(!learningDropdownOpen);
                  // setMobileMenuOpen(false); // Do not close main menu on dropdown toggle
                }}
                className="w-full text-left px-4 py-3 rounded-lg hover:bg-white/10 transition-all duration-200 flex items-center justify-between text-white"
              >
                <span className="hud-text">LESSONS</span>
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
                      onClick={() => {
                        setMobileMenuOpen(false);
                        navigate(`/learning?category=${category.key}`);
                      }}
                      className="w-full text-left px-3 py-2 rounded-lg hover:bg-white/10 transition-all duration-200 text-sm flex items-center space-x-2 text-white"
                    >
                      <span className="hud-text">{category.icon}</span>
                      <span className="hud-text">{category.name}</span>
                    </button>
                  ))}
                  <NavLink
                    to="/learning"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block w-full text-left px-3 py-2 text-sm font-medium transition-all duration-200 hud-text hover:bg-white/5 rounded-lg"
                  >
                    ALL
                  </NavLink>
                </div>
              )}
              <NavLink
                to="/test"
                onClick={() => setMobileMenuOpen(false)}
                className="px-4 py-3 transition-all duration-200 rounded-lg hover:bg-white/10 text-white"
              >
                <span className="hud-text">TEST</span>
              </NavLink>
            </nav>
          </div>
        )}
      </header>

      {/* ヘッダー下のHUDライン */}
      <div className="hud-line" />
      {/* メインコンテンツ */}
      <main
        className="container mx-auto px-4 py-8 transition-all duration-300 text-gray-100"
        style={effectiveTheme === 'day' ? { background: '#14213d' } : {}}
      >

        <Outlet />

      </main>

      {/* メイン下のHUDライン（Footer直前） */}
      <div className="hud-line" />
      {/* フッター */}
      <footer className={`border-none mt-0.5 transition-all duration-300 border-gray-700 bg-[color:var(--bg)]`}>
        <div className="container mx-auto px-4 py-6">
          <div className="text-center">
            <p className="text-sm transition-all duration-300 hud-text">
              {'Flight Academy'}
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};
