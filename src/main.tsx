import './instrument'; // Sentry 初期化（最初のインポート）
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import 'katex/dist/katex.min.css';
import { initPlausibleScript } from './lib/plausible';
import { useAuthStore } from './stores/authStore';

const plausibleDomain = import.meta.env.VITE_PLAUSIBLE_DOMAIN?.trim();
if (import.meta.env.PROD && plausibleDomain) {
  initPlausibleScript(plausibleDomain);
}

// アプリ起動時に認証状態を初期化
useAuthStore.getState().refreshSession();

createRoot(document.getElementById('root')!).render(
  <>
    <App />
  </>
);
