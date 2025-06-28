import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';

// Contexts
import { ProgressProvider } from './contexts/ProgressContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { WeatherCacheProvider } from './contexts/WeatherCacheContext';
import { AuthProvider } from './providers/AuthProvider';

// Enhanced Error Boundary and Layout
import { AppLayout } from './components/layout/AppLayout';
import EnhancedErrorBoundary from './components/ui/EnhancedErrorBoundary';

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
      <EnhancedErrorBoundary>
        <AuthProvider>
          <ThemeProvider>
            <ProgressProvider>
              <WeatherCacheProvider>
                {children}
                <ReactQueryDevtools initialIsOpen={false} />
              </WeatherCacheProvider>
            </ProgressProvider>
          </ThemeProvider>
        </AuthProvider>
      </EnhancedErrorBoundary>
    </QueryClientProvider>
  );
};

const App: React.FC = () => {
  return (
    <Router>
      <AppProviders>
        <AppLayout />
      </AppProviders>
    </Router>
  );
};

export default App;
