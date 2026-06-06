import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { computeProfileCompletion } from '../../auth/profileCompletion';
import { Typography } from '../ui';
import { useAuthStore } from '../../stores/authStore';
import supabase from '../../utils/supabase';

export interface ProfileCompletionNudgeProps {
  dismissStorageKey?: string;
  /** Hide entirely when completion is at or above this percent (default 80) */
  hideAtPercent?: number;
  /** Only show when completion is below this percent */
  showBelowPercent?: number;
  /** When true, show only if avatar_url is missing */
  onlyWhenMissingAvatar?: boolean;
  className?: string;
}

export const ProfileCompletionNudge: React.FC<ProfileCompletionNudgeProps> = ({
  dismissStorageKey = 'profile_completion_nudge_dismiss_v1',
  hideAtPercent = 80,
  showBelowPercent = 60,
  onlyWhenMissingAvatar = false,
  className = '',
}) => {
  const user = useAuthStore((state) => state.user);
  const profile = useAuthStore((state) => state.profile);
  const [hasNotificationSettings, setHasNotificationSettings] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (!dismissStorageKey || typeof window === 'undefined') return;
    try {
      if (window.localStorage.getItem(dismissStorageKey) === '1') {
        setDismissed(true);
      }
    } catch {
      // ignore
    }
  }, [dismissStorageKey]);

  useEffect(() => {
    const load = async () => {
      if (!user) {
        setHasNotificationSettings(false);
        return;
      }
      const { data } = await supabase
        .from('user_notification_settings')
        .select('user_id')
        .eq('user_id', user.id)
        .maybeSingle();
      setHasNotificationSettings(Boolean(data));
    };
    void load();
  }, [user]);

  const completion = useMemo(
    () => computeProfileCompletion({ profile, hasNotificationSettings }),
    [profile, hasNotificationSettings],
  );

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

  if (dismissed || !profile || !completion.nextAction) {
    return null;
  }

  if (completion.percent >= hideAtPercent) {
    return null;
  }

  if (!onlyWhenMissingAvatar && completion.percent >= showBelowPercent) {
    return null;
  }

  if (onlyWhenMissingAvatar && profile.avatar_url?.trim()) {
    return null;
  }

  return (
    <div
      className={`rounded-xl border border-brand-primary/30 bg-brand-primary/10 px-4 py-3 ${className}`}
      role="note"
    >
      <Typography variant="caption" color="muted" className="mb-1 block font-medium">
        プロフィールを整えませんか？（{completion.percent}%）
      </Typography>
      <Typography variant="body-sm" color="muted" className="leading-relaxed">
        次のステップ: {completion.nextAction.label} — {completion.nextAction.benefit}
      </Typography>
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <Link
          to={completion.nextAction.href}
          className="text-sm font-medium text-brand-primary underline hover:no-underline"
        >
          プロフィールを開く
        </Link>
        {dismissStorageKey ? (
          <button
            type="button"
            onClick={handleDismiss}
            className="text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)]"
          >
            閉じる
          </button>
        ) : null}
      </div>
    </div>
  );
};
