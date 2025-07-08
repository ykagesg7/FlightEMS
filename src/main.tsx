import { StagewiseToolbar } from '@stagewise/toolbar-react';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
    {import.meta.env.DEV && <StagewiseToolbar />}
  </StrictMode>
);
