import React from 'react';

export const AuthDivider: React.FC = () => (
  <div className="mb-4 flex items-center gap-3">
    <div className="h-px flex-1 bg-brand-primary/20" aria-hidden />
    <span className="text-xs text-[var(--text-muted)]">または</span>
    <div className="h-px flex-1 bg-brand-primary/20" aria-hidden />
  </div>
);
