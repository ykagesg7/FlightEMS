import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import React, { lazy, Suspense } from 'react';
import { HelmetProvider } from 'react-helmet-async';
import { Navigate, Route, BrowserRouter as Router, Routes, useParams } from 'react-router-dom';

// Contexts
import { ProgressProvider } from './contexts/ProgressContext';
import { WeatherCacheProvider } from './contexts/WeatherCacheContext';

// Enhanced Error Boundary and Layout
import ScrollManager from './components/ScrollManager';
import EnhancedErrorBoundary from './components/ui/EnhancedErrorBoundary';
import { MarketingLayout } from './layouts/MarketingLayout';

// Marketing Pages (lazy)
// #region agent log
fetch('http://127.0.0.1:7242/ingest/df8c824b-ad69-49a1-bdf1-acbbc4f35ebd', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'App.tsx:17', message: 'Lazy import path check', data: { path: './pages/home/Home' }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run1', hypothesisId: 'D' }) }).catch(() => { });
// #endregion
const Home = lazy(() => import('./pages/home/Home'));
// #region agent log
fetch('http://127.0.0.1:7242/ingest/df8c824b-ad69-49a1-bdf1-acbbc4f35ebd', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'App.tsx:19', message: 'Lazy import MissionDashboard', data: { path: './pages/mission/Dashboard' }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run1', hypothesisId: 'D' }) }).catch(() => { });
// #endregion
const About = lazy(() => import('./pages/about/About'));
const MissionDashboard = lazy(() => {
  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/df8c824b-ad69-49a1-bdf1-acbbc4f35ebd', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'App.tsx:22', message: 'MissionDashboard lazy import start', data: { path: './pages/mission/Dashboard' }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run1', hypothesisId: 'D' }) }).catch(() => { });
  // #endregion
  return import('./pages/mission/Dashboard').catch((err) => {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/df8c824b-ad69-49a1-bdf1-acbbc4f35ebd', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'App.tsx:25', message: 'MissionDashboard import error', data: { error: String(err), path: './pages/mission/Dashboard' }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run1', hypothesisId: 'D' }) }).catch(() => { });
    // #endregion
    throw err;
  });
});
const Shop = lazy(() => import('./pages/shop/Shop'));
const Gallery = lazy(() => import('./pages/gallery/Gallery'));
const Schedule = lazy(() => import('./pages/schedule/Schedule'));
const Links = lazy(() => import('./pages/links/Links'));
// Blog and Experience are now integrated into Mission

// App Pages (lazy)
const HomePage = lazy(() => import('./pages/dashboard/HomePage'));
const PlanningMapPage = lazy(() => import('./pages/planning/PlanningMapPage'));
// LearningPage is now integrated into ArticlesPage
const ArticlesPage = lazy(() => import('./pages/articles/ArticlesPage'));
const ArticleDetailPage = lazy(() => import('./pages/articles/ArticleDetailPage'));
const ProfilePage = lazy(() => import('./pages/profile/ProfilePage'));
const AuthPage = lazy(() => import('./pages/auth/AuthPage')); // AuthPageを追加
const TestPage = lazy(() => import('./pages/test/TestPage')); // Testページを追加
// 必要に応じて他のページも追加

// NotFoundPageの簡易実装
const NotFoundPage = () => <div className="text-center text-red-500 py-12">ページが見つかりません</div>;

// LearningPageのリダイレクトコンポーネント（動的パラメータ対応）
const LearningRedirect: React.FC = () => {
  return <Navigate to="/articles" replace />;
};

const LearningContentRedirect: React.FC = () => {
  const { contentId } = useParams<{ contentId: string }>();
  return <Navigate to={`/articles/${contentId}`} replace />;
};

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
          <ProgressProvider>
            <WeatherCacheProvider>
              {children}
              <ReactQueryDevtools initialIsOpen={false} />
            </WeatherCacheProvider>
          </ProgressProvider>
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
            {/* All Routes (Whisky Papa Brand) */}
            <Route element={<MarketingLayout />}>
              <Route path="/" element={<Home />} />
              <Route path="about" element={<About />} />
              <Route path="mission" element={<MissionDashboard />} />
              <Route path="shop" element={<Shop />} />
              <Route path="gallery" element={<Gallery />} />
              <Route path="schedule" element={<Schedule />} />
              <Route path="links" element={<Links />} />
              <Route path="auth" element={<AuthPage />} />
              <Route path="profile" element={<ProfilePage />} />
              {/* Blog and Experience are now integrated into Mission */}
              <Route path="blog" element={<Navigate to="/mission" replace />} />
              <Route path="blog/:slug" element={<Navigate to="/mission" replace />} />
              <Route path="experience" element={<Navigate to="/mission" replace />} />
              {/* Flight Academy Tools */}
              <Route path="dashboard" element={<HomePage />} />
              <Route path="planning" element={<PlanningMapPage />} />
              <Route path="learning" element={<LearningRedirect />} />
              <Route path="learning/:contentId" element={<LearningContentRedirect />} />
              <Route path="articles" element={<ArticlesPage />} />
              <Route path="articles/:contentId" element={<ArticleDetailPage />} />
              <Route path="account" element={<Navigate to="/profile" replace />} />
              <Route path="test" element={<TestPage />} />
            </Route>

            {/* Fallback */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Suspense>
      </AppProviders>
    </Router>
  );
};

export default App;
