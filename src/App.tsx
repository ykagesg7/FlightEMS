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
const Home = lazy(() => import('./pages/home/Home'));
const About = lazy(() => import('./pages/about/About'));
const MissionDashboard = lazy(() => {
  return import('./pages/mission/Dashboard').catch((err) => {
    throw err;
  });
});
// Shop は公式公認取得後に復活予定（現状非表示・/shop はホームへリダイレクト）
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
// Admin Pages
const RankConfigPage = lazy(() => import('./pages/admin/RankConfigPage'));
const XpConfigPage = lazy(() => import('./pages/admin/XpConfigPage'));
// Rank Benefits Page
const RankBenefitsPage = lazy(() => import('./pages/mission/components/RankBenefitsPage'));
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
              <Route path="shop" element={<Navigate to="/" replace />} />
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
              {/* Rank Benefits */}
              <Route path="ranks" element={<RankBenefitsPage />} />
              {/* Admin Pages */}
              <Route path="admin/ranks" element={<RankConfigPage />} />
              <Route path="admin/xp" element={<XpConfigPage />} />
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
