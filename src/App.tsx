import React, { useState, Component, ErrorInfo, ReactNode } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import './App.css';
import './index.css';
import PlanningMapPage from './pages/PlanningMapPage';
import LearningPage from './pages/LearningPage';
import InteractiveLearningPage from './pages/InteractiveLearningPage';
import TestPage from './pages/TestPage';
import AuthPage from './pages/AuthPage';
import ProfilePage from './pages/ProfilePage';
import AdminPage from './pages/AdminPage';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';
import { ProgressProvider } from './contexts/ProgressContext';
import { AuthProvider } from './providers/AuthProvider';
import { useAuthStore } from './stores/authStore';
import NewAuthButton from './components/auth/NewAuthButton';
import RequireAuth from './components/auth/RequireAuth';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// エラーバウンダリーコンポーネント
class ErrorBoundary extends Component<{ children: ReactNode, fallback?: ReactNode }, { hasError: boolean }> {
  constructor(props: { children: ReactNode, fallback?: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(_: Error) {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('エラーバウンダリーがエラーをキャッチしました:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      // フォールバックUIを表示
      return this.props.fallback || (
        <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-100 text-gray-800">
          <h2 className="text-2xl font-bold mb-4">問題が発生しました</h2>
          <p className="mb-4">アプリケーションで問題が発生しました。ページをリロードして再試行してください。</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-colors"
          >
            ページをリロード
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

// NavLinkコンポーネントを作成して現在のパスをチェック
const NavLink = ({ to, children, onClick }: { to: string, children: React.ReactNode, onClick?: () => void }) => {
  const location = useLocation();
  const isActive = location.pathname === to || 
                  (location.pathname === '/' && to === '/');
  
  return (
    <Link 
      to={to} 
      className={`px-3 py-2 sm:px-4 text-sm sm:text-base font-medium rounded-md transition-colors duration-200 ${
        isActive 
          ? 'bg-indigo-700 text-white' 
          : 'text-indigo-200 hover:bg-indigo-800 hover:text-white'
      }`}
      onClick={onClick}
    >
      {children}
    </Link>
  );
};

// テーマ切り替えボタンコンポーネント
const ThemeToggler = () => {
  const { theme, toggleTheme } = useTheme();
  
  return (
    <button
      onClick={toggleTheme}
      className="rounded-full p-2 text-indigo-200 hover:text-white focus:outline-none"
      aria-label={theme === 'dark' ? 'ライトモードに切り替え' : 'ダークモードに切り替え'}
    >
      {theme === 'dark' ? (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ) : (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
        </svg>
      )}
    </button>
  );
};

// ヘッダーのAuthButtonをエラーバウンダリーでラップ
const SafeAuthButton = () => {
  return (
    <ErrorBoundary fallback={
      <Link to="/auth" className="px-4 py-2 rounded-md bg-indigo-500 text-white">
        ログイン
      </Link>
    }>
      <NewAuthButton />
    </ErrorBoundary>
  );
};

// 保護されたルートをエラーバウンダリーでラップ
const SafeRequireAuth: React.FC<{ children: ReactNode }> = ({ children }) => {
  return (
    <ErrorBoundary fallback={<Navigate to="/auth" />}>
      <RequireAuth>
        {children}
      </RequireAuth>
    </ErrorBoundary>
  );
};

// Appの子コンポーネントとしてレイアウトを定義
const AppLayout = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const { theme } = useTheme();
  const profile = useAuthStore(state => state.profile);
  
  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  // 先生（管理者）かどうかをチェック
  const isAdmin = typeof profile?.roll === 'string' && ['admin', 'teacher'].includes(profile.roll.toLowerCase());

  return (
    <div className={`App min-h-screen flex flex-col ${
      theme === 'dark' 
        ? 'bg-gray-900 text-gray-100' 
        : 'bg-gradient-to-br from-indigo-100 to-purple-100 text-gray-900'
    }`}>
      <header className={`${
        theme === 'dark' ? 'bg-gray-800' : 'bg-indigo-900'
      } text-white shadow-lg sticky top-0 z-30`}>
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
        <Routes>
          <Route path="/" element={<PlanningMapPage />} />
          <Route path="/learning" element={<LearningPage />} />
          <Route path="/interactive-learning" element={<InteractiveLearningPage />} />
          <Route path="/test" element={
            <SafeRequireAuth>
              <TestPage />
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
        </Routes>
      </main>
      <footer className={`${
        theme === 'dark' ? 'bg-gray-800' : 'bg-indigo-900'
      } text-white text-center py-3 text-sm sm:text-base`}>
        <p>&copy; 2024 Flight Academy. All rights reserved.</p>
      </footer>
    </div>
  );
};

// ReactQueryのクライアント作成
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

const App = () => {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <AuthProvider>
            <ProgressProvider>
              <Router>
                <AppLayout />
              </Router>
            </ProgressProvider>
          </AuthProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default App;
