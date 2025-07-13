import { StagewiseToolbar } from '@stagewise/toolbar-react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <>
    <App />
    {import.meta.env.DEV && <StagewiseToolbar />}
  </>
);
