import React from 'react';
import { RefreshCw } from 'lucide-react';
import type { LiveTrafficLayerControls } from './hooks/useLiveTrafficLayer';

type Props = {
  controls: LiveTrafficLayerControls;
  /** ツールバー用コンパクト表示（アイコンのみ） */
  compact?: boolean;
  className?: string;
};

export const LiveTrafficRefreshButton: React.FC<Props> = ({ controls, compact = false, className = '' }) => {
  const { refresh, isRefreshing } = controls;

  if (compact) {
    return (
      <button
        type="button"
        onClick={() => void refresh()}
        disabled={isRefreshing}
        aria-busy={isRefreshing}
        aria-label="航空機位置を更新"
        title="航空機位置を更新"
        className={`inline-flex min-h-[36px] min-w-[36px] items-center justify-center rounded border border-whiskyPapa-yellow/40 px-2 text-whiskyPapa-yellow hover:bg-whiskyPapa-yellow/10 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
      >
        <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? 'animate-spin' : ''}`} aria-hidden />
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={() => void refresh()}
      disabled={isRefreshing}
      aria-busy={isRefreshing}
      className={`inline-flex min-h-[32px] items-center gap-1.5 rounded border border-whiskyPapa-yellow/40 px-2.5 py-1 text-2xs text-whiskyPapa-yellow hover:bg-whiskyPapa-yellow/10 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
    >
      <RefreshCw className={`h-3.5 w-3.5 shrink-0 ${isRefreshing ? 'animate-spin' : ''}`} aria-hidden />
      更新
    </button>
  );
};
