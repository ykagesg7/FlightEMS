import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import React, { lazy, Suspense } from 'react';
import { HelmetProvider } from 'react-helmet-async';
import { Navigate, Route, BrowserRouter as Router, Routes } from 'react-router-dom';

// Contexts
import { ProgressProvider } from './contexts/ProgressContext';
import { WeatherCacheProvider } from './contexts/WeatherCacheContext';

// Enhanced Error Boundary and Layout
import ScrollManager from './components/ScrollManager';
import EnhancedErrorBoundary from './components/ui/EnhancedErrorBoundary';
import { MarketingLayout } from './layouts/MarketingLayout';

// Marketing Pages (lazy)
const Home = lazy(() => import('./pages/Home'));
const About = lazy(() => import('./pages/About'));
const MissionDashboard = lazy(() => import('./pages/mission/Dashboard'));
const Shop = lazy(() => import('./pages/Shop'));
const Gallery = lazy(() => import('./pages/Gallery'));
const Schedule = lazy(() => import('./pages/Schedule'));
const Links = lazy(() => import('./pages/Links'));
// Blog and Experience are now integrated into Mission

// App Pages (lazy)
const HomePage = lazy(() => import('./pages/HomePage'));
const PlanningMapPage = lazy(() => import('./pages/PlanningMapPage'));
const LearningPage = lazy(() => import('./pages/LearningPage'));
const LessonDetailPage = lazy(() => import('./pages/LessonDetailPage'));
const ArticlesPage = lazy(() => import('./pages/ArticlesPage'));
const ArticleDetailPage = lazy(() => import('./pages/ArticleDetailPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
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
              <Route path="learning" element={<LearningPage />} />
              <Route path="learning/:contentId" element={<LessonDetailPage />} />
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
