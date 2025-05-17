import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import './App.css';
import './index.css';
import PlanningMapPage from './pages/PlanningMapPage';
import LearningPage from './pages/LearningPage';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';
import { ProgressProvider } from './contexts/ProgressContext';

// NavLinkコンポーネントを作成して現在のパスをチェック
const NavLink = ({ to, children }: { to: string, children: React.ReactNode }) => {
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

// Appの子コンポーネントとしてレイアウトを定義
const AppLayout = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const { theme } = useTheme();
  
  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

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
            <div className="flex items-center space-x-2">
              <ThemeToggler />
              <button
                onClick={toggleMenu}
                className="text-indigo-200 hover:text-white focus:outline-none"
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
                <NavLink to="/">Planning/Map</NavLink>
                <NavLink to="/learning">Learning</NavLink>
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
              </nav>
            </div>
            <ThemeToggler />
          </div>
        </div>
      </header>
      <main className="container mx-auto flex-grow">
        <Routes>
          <Route path="/" element={<PlanningMapPage />} />
          <Route path="/learning" element={<LearningPage />} />
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

function App() {
  return (
    <ThemeProvider>
      <ProgressProvider>
        <Router>
          <AppLayout />
        </Router>
      </ProgressProvider>
    </ThemeProvider>
  );
}

export default App;
