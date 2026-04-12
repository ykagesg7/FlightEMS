import './instrument'; // Sentry 初期化（最初のインポート）
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import 'katex/dist/katex.min.css';
import { initGoogleAnalytics } from './lib/googleAnalytics';
import { useAuthStore } from './stores/authStore';

const gaMeasurementId = import.meta.env.VITE_GA_MEASUREMENT_ID?.trim();
if (import.meta.env.PROD && gaMeasurementId) {
  initGoogleAnalytics(gaMeasurementId);
}

// アプリ起動時に認証状態を初期化
useAuthStore.getState().refreshSession();

createRoot(document.getElementById('root')!).render(
  <>
    <App />
  </>
);
