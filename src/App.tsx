import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import React, { lazy, Suspense } from 'react';
import { HelmetProvider } from 'react-helmet-async';
import { Navigate, Route, BrowserRouter as Router, Routes } from 'react-router-dom';

// Contexts
import { ProgressProvider } from './contexts/ProgressContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { WeatherCacheProvider } from './contexts/WeatherCacheContext';

// Enhanced Error Boundary and Layout
import { AppLayout } from './components/layout/AppLayout';
import ScrollManager from './components/ScrollManager';
import EnhancedErrorBoundary from './components/ui/EnhancedErrorBoundary';

// ページのlazyインポート
const HomePage = lazy(() => import('./pages/HomePage'));
const PlanningMapPage = lazy(() => import('./pages/PlanningMapPage'));
const LearningPage = lazy(() => import('./pages/LearningPage'));
const LessonDetailPage = lazy(() => import('./pages/LessonDetailPage'));
const ArticlesPage = lazy(() => import('./pages/ArticlesPage'));
const ArticleDetailPage = lazy(() => import('./pages/ArticleDetailPage'));
// const ProfilePage = lazy(() => import('./pages/ProfilePage')); // deprecated: redirect to /account
const AccountCenterPage = lazy(() => import('./pages/AccountCenter'));
const AuthPage = lazy(() => import('./pages/AuthPage')); // AuthPageを追加
const TestPage = lazy(() => import('./pages/TestPage')); // Testページを追加
// 必要に応じて他のページも追加

// NotFoundPageの簡易実装
const NotFoundPage = () => <div className="text-center text-red-500 py-12">ページが見つかりません</div>;

// React Query Client設定
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5分
      gcTime: 10 * 60 * 1000, // 10分
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// アプリケーション全体のプロバイダーをラップ
const AppProviders: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <QueryClientProvider client={queryClient}>
      <HelmetProvider>
        <EnhancedErrorBoundary>
          <ThemeProvider>
            <ProgressProvider>
              <WeatherCacheProvider>
                {children}
                <ReactQueryDevtools initialIsOpen={false} />
              </WeatherCacheProvider>
            </ProgressProvider>
          </ThemeProvider>
        </EnhancedErrorBoundary>
      </HelmetProvider>
    </QueryClientProvider>
  );
};

const App: React.FC = () => {
  return (
    <Router>
      <AppProviders>
        <ScrollManager />
        <Suspense fallback={<div className="text-center py-12">Loading...</div>}>
          <Routes>
            <Route path="/" element={<AppLayout />}>
              <Route index element={<HomePage />} />
              <Route path="planning" element={<PlanningMapPage />} />
              <Route path="learning" element={<LearningPage />} />
              <Route path="learning/:contentId" element={<LessonDetailPage />} />
              <Route path="articles" element={<ArticlesPage />} />
              <Route path="articles/:contentId" element={<ArticleDetailPage />} />
              <Route path="profile" element={<Navigate to="/account?tab=profile" replace />} />
              <Route path="account" element={<AccountCenterPage />} />
              <Route path="auth" element={<AuthPage />} /> {/* AuthPageへのルートを追加 */}
              <Route path="test" element={<TestPage />} /> {/* Testページへのルートを差し替え */}
              <Route path="*" element={<NotFoundPage />} />
            </Route>
          </Routes>
        </Suspense>
      </AppProviders>
    </Router>
  );
};

export default App;
