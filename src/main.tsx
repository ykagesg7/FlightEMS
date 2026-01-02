import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import 'katex/dist/katex.min.css';
import { useAuthStore } from './stores/authStore';

// アプリ起動時に認証状態を初期化
useAuthStore.getState().refreshSession();

createRoot(document.getElementById('root')!).render(
  <>
    <App />
  </>
);
