import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export const KeyboardShortcuts: React.FC<{ prevId?: string; nextId?: string }> = ({ prevId, nextId }) => {
  const navigate = useNavigate();
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      if (t && (t.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(t.tagName))) return;
      if ((e.key === 'ArrowLeft' || e.key === 'k') && prevId) navigate(`/articles/${prevId}`);
      if ((e.key === 'ArrowRight' || e.key === 'j') && nextId) navigate(`/articles/${nextId}`);
      if (e.key === 'g') window.scrollTo({ top: 0, behavior: 'smooth' });
      if (e.key === 'G') window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'smooth' });
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [navigate, prevId, nextId]);
  return null;
};


