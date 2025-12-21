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
import { AppLayout } from './layouts/AppLayout';
import { MarketingLayout } from './layouts/MarketingLayout';
import ScrollManager from './components/ScrollManager';
import EnhancedErrorBoundary from './components/ui/EnhancedErrorBoundary';

// Marketing Pages (lazy)
const Home = lazy(() => import('./pages/Home'));
const About = lazy(() => import('./pages/About'));
const MissionDashboard = lazy(() => import('./pages/mission/Dashboard'));
const Shop = lazy(() => import('./pages/Shop'));
const Gallery = lazy(() => import('./pages/Gallery'));
const Schedule = lazy(() => import('./pages/Schedule'));
const Links = lazy(() => import('./pages/Links'));
// Blog and Experience are now integrated into Mission - keeping imports for potential future use
// const Blog = lazy(() => import('./pages/Blog'));
// const BlogDetail = lazy(() => import('./pages/BlogDetail'));
// const Experience = lazy(() => import('./pages/Experience'));

// App Pages (lazy)
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
            {/* Marketing Routes (Whisky Papa Brand) */}
            <Route element={<MarketingLayout />}>
              <Route path="/" element={<Home />} />
              <Route path="about" element={<About />} />
              <Route path="mission" element={<MissionDashboard />} />
              <Route path="shop" element={<Shop />} />
              <Route path="gallery" element={<Gallery />} />
              <Route path="schedule" element={<Schedule />} />
              <Route path="links" element={<Links />} />
              <Route path="auth" element={<AuthPage />} />
              {/* Blog and Experience are now integrated into Mission */}
              <Route path="blog" element={<Navigate to="/mission" replace />} />
              <Route path="blog/:slug" element={<Navigate to="/mission" replace />} />
              <Route path="experience" element={<Navigate to="/mission" replace />} />
            </Route>

            {/* App Routes (Flight Academy Tools) */}
            <Route element={<AppLayout />}>
              <Route path="dashboard" element={<HomePage />} />
              <Route path="planning" element={<PlanningMapPage />} />
              <Route path="learning" element={<LearningPage />} />
              <Route path="learning/:contentId" element={<LessonDetailPage />} />
              <Route path="articles" element={<ArticlesPage />} />
              <Route path="articles/:contentId" element={<ArticleDetailPage />} />
              <Route path="profile" element={<Navigate to="/account?tab=profile" replace />} />
              <Route path="account" element={<AccountCenterPage />} />
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
