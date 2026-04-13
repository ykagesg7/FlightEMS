import './instrument'; // Sentry 初期化（最初のインポート）
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import 'katex/dist/katex.min.css';
import { useAuthStore } from './stores/authStore';

// GA4: 本番では Vite（injectGoogleTagPlugin）が index.html の <head> に gtag を挿入。ルート遷移は GoogleAnalyticsTracker。

// アプリ起動時に認証状態を初期化
useAuthStore.getState().refreshSession();

createRoot(document.getElementById('root')!).render(
  <>
    <App />
  </>
);
