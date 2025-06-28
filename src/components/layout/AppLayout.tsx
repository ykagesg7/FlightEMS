import React, { useState, Suspense, lazy } from 'react';
import { Routes, Route } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuthStore } from '../../stores/authStore';
import { NavLink } from '../ui/NavLink';
import { ThemeToggler } from '../ui/ThemeToggler';
import { SafeAuthButton } from '../auth/SafeAuthButton';
import { SafeRequireAuth } from '../auth/SafeRequireAuth';
import { LoadingSpinner } from '../ui/LoadingSpinner';

// 動的インポートでコード分割
const PlanningMapPage = lazy(() => import('../../pages/PlanningMapPage'));
const LearningPage = lazy(() => import('../../pages/LearningPage'));
const NewLearningPage = lazy(() => import('../../pages/NewLearningPage'));
const ArticlesPage = lazy(() => import('../../pages/ArticlesPage'));
const ExamTab = lazy(() => import('../../components/flight/ExamTab'));
const AuthPage = lazy(() => import('../../pages/AuthPage'));
const ProfilePage = lazy(() => import('../../pages/ProfilePage'));
const AdminPage = lazy(() => import('../../pages/AdminPage'));
const ArticleStatsTestPage = lazy(() => import('../../pages/ArticleStatsTestPage'));

export const AppLayout: React.FC = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const { effectiveTheme } = useTheme();
  const profile = useAuthStore(state => state.profile);
  
  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  // 先生（管理者）かどうかをチェック
  const isAdmin = typeof profile?.roll === 'string' && ['admin', 'teacher'].includes(profile.roll.toLowerCase());

  return (
    <div className={`App min-h-screen flex flex-col ${
      effectiveTheme === 'dark' 
        ? 'bg-gradient-to-br from-gray-900 via-slate-900 to-gray-800 text-gray-100' 
        : 'bg-gradient-to-br from-blue-50 via-indigo-50 via-purple-50 to-pink-50 text-gray-900'
    }`}>
      <header className={`${
        effectiveTheme === 'dark' ? 'bg-gradient-to-r from-gray-900 to-slate-900' : 'bg-gradient-to-r from-indigo-900 to-purple-900'
      } text-white shadow-xl sticky top-0 z-30 backdrop-blur-sm`}>
        <div className="container mx-auto px-4 py-2 md:py-3">
          {/* モバイル向けナビゲーション */}
          <div className="flex items-center justify-between md:hidden">
            <h1 className="text-lg font-bold">Flight Academy</h1>
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0 z-40">
                <SafeAuthButton />
              </div>
              <ThemeToggler />
              <button
                onClick={toggleMenu}
                className="text-indigo-200 hover:text-white focus:outline-none ml-1"
                aria-label="メニューを開く"
              >
                <svg
                  className="w-6 h-6"
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
            <div className="mt-2 md:hidden">
              <nav className="flex flex-col space-y-2">
                <NavLink to="/" onClick={() => setMenuOpen(false)}>Planning/Map</NavLink>
                <NavLink to="/learning" onClick={() => setMenuOpen(false)}>Learning</NavLink>
                <NavLink to="/articles" onClick={() => setMenuOpen(false)}>Articles</NavLink>
                <NavLink to="/test" onClick={() => setMenuOpen(false)}>Test</NavLink>
                {isAdmin && (
                  <NavLink to="/admin" onClick={() => setMenuOpen(false)}>
                    <span className="flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      管理者ページ
                    </span>
                  </NavLink>
                )}
              </nav>
            </div>
          )}
          
          {/* デスクトップナビゲーション */}
          <div className="hidden md:flex md:justify-between md:items-center">
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-bold">Flight Academy</h1>
              <nav className="flex space-x-2">
                <NavLink to="/">Planning/Map</NavLink>
                <NavLink to="/learning">Learning</NavLink>
                <NavLink to="/articles">Articles</NavLink>
                <NavLink to="/test">Test</NavLink>
                {isAdmin && (
                  <NavLink to="/admin">
                    <span className="flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      管理者
                    </span>
                  </NavLink>
                )}
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
            <Route 
              path="/admin" 
              element={
                <SafeRequireAuth>
                  <AdminPage />
                </SafeRequireAuth>
              } 
            />
            <Route path="/test-stats" element={<ArticleStatsTestPage />} />
          </Routes>
        </Suspense>
      </main>
      <footer className={`${
        effectiveTheme === 'dark' ? 'bg-gradient-to-r from-gray-900 to-slate-900' : 'bg-gradient-to-r from-indigo-900 to-purple-900'
      } text-white text-center py-3 text-sm sm:text-base shadow-lg`}>
        <p>&copy; 2024 Flight Academy. All rights reserved.</p>
      </footer>
    </div>
  );
}; 