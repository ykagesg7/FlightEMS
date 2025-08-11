import React from 'react';

export const HudLine: React.FC<{ orientation?: 'horizontal' | 'vertical'; className?: string }>
  = ({ orientation = 'horizontal', className = '' }) => (
    <div
      className={`hud-line ${className}`}
      style={{
        width: orientation === 'vertical' ? 1 : '100%',
        height: orientation === 'vertical' ? '100%' : 1,
      }}
    />
  );

export const HudCard: React.FC<React.PropsWithChildren<{ className?: string }>>
  = ({ children, className = '' }) => (
    <div className={`hud-surface rounded-xl p-4 hud-glow ${className}`}>{children}</div>
  );

export const HudButton: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement>>
  = ({ className = '', ...props }) => (
    <button
      {...props}
      className={`px-3 py-2 rounded-lg border hud-border text-[color:var(--hud-primary)] hover:bg-[color:var(--panel)]/60 focus-visible:focus-hud transition ${className}`}
    />
  );


