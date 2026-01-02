import React, { useEffect, useState } from 'react';

export const ScrollToButtons: React.FC = () => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 600);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  if (!show) return null;

  return (
    <div style={{ position: 'fixed', right: 'clamp(12px, 2vw, 20px)', bottom: 'max(12px, calc(env(safe-area-inset-bottom, 0px) + 12px))', display: 'grid', gap: 8, zIndex: 60 }}>
      <button
        aria-label="ページ上部へ"
        className="px-3 py-2 rounded-md border hud-border hud-surface hud-text shadow hover:shadow-lg focus:outline-none focus:ring"
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      >
        ページ上へ
      </button>
      <button
        aria-label="ページ下部へ"
        className="px-3 py-2 rounded-md border hud-border hud-surface hud-text shadow hover:shadow-lg focus:outline-none focus:ring"
        onClick={() => window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'smooth' })}
      >
        ページ下へ
      </button>
    </div>
  );
};
