import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Typography } from '../ui';

const PROFILE_LEADERBOARD_HREF = '/profile?tab=leaderboard';

export type LeaderboardOptInCtaVariant = 'inline' | 'card';

export interface LeaderboardOptInCtaProps {
  /** true のときは何も表示しない */
  optedIn: boolean;
  variant?: LeaderboardOptInCtaVariant;
  /** 設定すると `localStorage` にキーを保存し、閉じたあと非表示 */
  dismissStorageKey?: string;
  className?: string;
}

/**
 * 学習者ランキング（任意参加）のオプトインを促す短い CTA。
 */
export const LeaderboardOptInCta: React.FC<LeaderboardOptInCtaProps> = ({
  optedIn,
  variant = 'card',
  dismissStorageKey,
  className = '',
}) => {
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (!dismissStorageKey || typeof window === 'undefined') return;
    try {
      if (window.localStorage.getItem(dismissStorageKey) === '1') {
        setDismissed(true);
      }
    } catch {
      // localStorage 不可時は表示継続
    }
  }, [dismissStorageKey]);

  const handleDismiss = useCallback(() => {
    setDismissed(true);
    if (dismissStorageKey && typeof window !== 'undefined') {
      try {
        window.localStorage.setItem(dismissStorageKey, '1');
      } catch {
        // ignore
      }
    }
  }, [dismissStorageKey]);

  if (optedIn || dismissed) {
    return null;
  }

  const body = (
    <>
      <Typography variant="body-sm" color="muted" className="leading-relaxed">
        学習者ランキングは任意参加です。表示名・学習 XP・ランクのみが一覧に載ります（メールやフルネームは公開されません）。いつでもオフにできます。
      </Typography>
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <Link
          to={PROFILE_LEADERBOARD_HREF}
          className="text-sm font-medium text-brand-primary underline hover:no-underline"
        >
          プロフィールで参加設定を開く
        </Link>
        {dismissStorageKey ? (
          <button
            type="button"
            onClick={handleDismiss}
            className="text-sm text-[color:var(--text-muted)] hover:text-[color:var(--text-primary)]"
          >
            閉じる
          </button>
        ) : null}
      </div>
    </>
  );

  if (variant === 'inline') {
    return (
      <div
        className={`
          rounded-lg border border-brand-primary/25 bg-brand-primary/5 px-3 py-2
          ${className}
        `}
        role="note"
      >
        {body}
      </div>
    );
  }

  return (
    <div
      className={`
        rounded-xl border-2 border-brand-primary/40 bg-brand-primary/10 px-4 py-3
        ${className}
      `}
      role="note"
    >
      <Typography variant="caption" color="muted" className="mb-1 block font-medium">
        ランキングに参加しませんか？
      </Typography>
      {body}
    </div>
  );
};
