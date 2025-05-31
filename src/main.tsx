import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { initToolbar } from '@stagewise/toolbar';
import stagewiseConfig from '../stagewise.config.js';

if (import.meta.env.MODE === 'development') {
  initToolbar(stagewiseConfig);
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
