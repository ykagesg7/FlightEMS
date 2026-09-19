import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import React from 'react';
import { Helmet, HelmetProvider } from 'react-helmet-async';
import {
  Navigate,
  Outlet,
  RouterProvider,
  createBrowserRouter,
  useParams,
} from 'react-router-dom';

// Contexts
import { ProgressProvider } from './contexts/ProgressContext';
import { WeatherCacheProvider } from './contexts/WeatherCacheContext';

// Enhanced Error Boundary and Layout
import { GoogleAnalyticsTracker } from './components/GoogleAnalyticsTracker';
import { PasswordRecoveryGuard } from './components/auth/PasswordRecoveryGuard';
import ScrollManager from './components/ScrollManager';
import EnhancedErrorBoundary from './components/ui/EnhancedErrorBoundary';
import { MarketingLayout } from './layouts/MarketingLayout';
import { lazyProtectedRoute, lazyRoute } from './layouts/routeLazy';

const LearningRedirect: React.FC = () => {
  return <Navigate to="/articles" replace />;
};

const LearningContentRedirect: React.FC = () => {
  const { contentId } = useParams<{ contentId: string }>();
  return <Navigate to={`/articles/${contentId}`} replace />;
};

const NotFoundPage = () => <div className="text-center text-red-500 py-12">ページが見つかりません</div>;

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

const AppProviders: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <QueryClientProvider client={queryClient}>
      <HelmetProvider>
        <Helmet defaultTitle="Flight Academy">
          <title>Flight Academy</title>
        </Helmet>
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

function AppShell() {
  return (
    <>
      {import.meta.env.PROD && import.meta.env.VITE_GA_MEASUREMENT_ID?.trim() ? (
        <GoogleAnalyticsTracker />
      ) : null}
      <ScrollManager />
      <PasswordRecoveryGuard />
      <Outlet />
    </>
  );
}

const router = createBrowserRouter([
  {
    element: <AppShell />,
    children: [
      {
        element: <MarketingLayout />,
        children: [
          { index: true, ...lazyRoute(() => import('./pages/dashboard/HomePage'), true) },
          { path: 'about', ...lazyRoute(() => import('./pages/about/About')) },
          { path: 'mission', ...lazyProtectedRoute(() => import('./pages/mission/Dashboard')) },
          { path: 'schedule', ...lazyRoute(() => import('./pages/schedule/Schedule')) },
          { path: 'links', ...lazyRoute(() => import('./pages/links/Links')) },
          { path: 'auth/recovery', ...lazyRoute(() => import('./pages/auth/PasswordRecoveryPage')) },
          { path: 'auth', ...lazyRoute(() => import('./pages/auth/AuthPage')) },
          { path: 'welcome', ...lazyProtectedRoute(() => import('./pages/welcome/WelcomeSetupPage')) },
          { path: 'profile', ...lazyProtectedRoute(() => import('./pages/profile/ProfilePage')) },
          { path: 'blog', element: <Navigate to="/articles" replace /> },
          { path: 'blog/:slug', element: <Navigate to="/articles" replace /> },
          { path: 'dashboard', element: <Navigate to="/" replace /> },
          { path: 'planning', ...lazyRoute(() => import('./pages/planning/PlanningMapPage'), true) },
          { path: 'explore/airspace-3d', ...lazyRoute(() => import('./pages/explore/Airspace3dPage')) },
          { path: 'learning', element: <LearningRedirect /> },
          { path: 'learning/:contentId', element: <LearningContentRedirect /> },
          { path: 'articles', ...lazyRoute(() => import('./pages/articles/ArticlesPage'), true) },
          { path: 'articles/:contentId', ...lazyRoute(() => import('./pages/articles/ArticleDetailPage'), true) },
          { path: 'account', element: <Navigate to="/profile" replace /> },
          { path: 'test', ...lazyRoute(() => import('./pages/test/TestPage'), true) },
          { path: 'ranks', ...lazyRoute(() => import('./pages/mission/components/RankBenefitsPage')) },
          { path: 'admin', ...lazyProtectedRoute(() => import('./pages/admin/AdminHubPage'), { requireAdmin: true }) },
          { path: 'admin/ranks', ...lazyProtectedRoute(() => import('./pages/admin/RankConfigPage'), { requireAdmin: true }) },
          { path: 'admin/xp', ...lazyProtectedRoute(() => import('./pages/admin/XpConfigPage'), { requireAdmin: true }) },
          {
            path: 'admin/question-reports',
            ...lazyProtectedRoute(() => import('./pages/admin/QuestionReportsPage'), { requireAdmin: true }),
          },
        ],
      },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
]);

const App: React.FC = () => {
  return (
    <AppProviders>
      <RouterProvider router={router} />
    </AppProviders>
  );
};

export default App;
