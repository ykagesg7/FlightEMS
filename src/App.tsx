import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import './App.css';
import './index.css';
import PlanningMapPage from './pages/PlanningMapPage';
import LearningPage from './pages/LearningPage';

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

// Appの子コンポーネントとしてレイアウトを定義
const AppLayout = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  
  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  return (
    <div className="App bg-gradient-to-br from-indigo-100 to-purple-100 min-h-screen flex flex-col">
      <header className="bg-indigo-900 text-white shadow-lg sticky top-0 z-30">
        <div className="container mx-auto px-4 py-2 md:py-3">
          {/* モバイル向けナビゲーション */}
          <div className="flex items-center justify-between md:hidden">
            <h1 className="text-lg font-bold">Flight Academy</h1>
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
          </div>
        </div>
      </header>
      <main className="container mx-auto flex-grow">
        <Routes>
          <Route path="/" element={<PlanningMapPage />} />
          <Route path="/learning" element={<LearningPage />} />
        </Routes>
      </main>
      <footer className="bg-indigo-900 text-white text-center py-3 text-sm sm:text-base">
        <p>&copy; 2024 Flight Academy. All rights reserved.</p>
      </footer>
    </div>
  );
};

function App() {
  return (
    <Router>
      <AppLayout />
    </Router>
  );
}

export default App;
