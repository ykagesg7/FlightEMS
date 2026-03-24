import React, { useEffect, useState } from 'react';
import { Button } from '../../../components/ui/Button';
import { Card, CardContent, CardHeader } from '../../../components/ui/Card';
import { Typography } from '../../../components/ui/Typography';
import type { Database } from '../../../types/database.types';

type Profile = Database['public']['Tables']['profiles']['Row'];

interface Props {
  profile: Profile | null;
  updateProfile: (updates: Partial<Profile>) => Promise<{ error: { message: string } | null }>;
  onError: (message: string) => void;
  onSuccess: (message: string) => void;
}

/**
 * 任意参加の学習者ランキング（表示名・XP・ランクのみ公開）
 */
export const LeaderboardSettings: React.FC<Props> = ({
  profile,
  updateProfile,
  onError,
  onSuccess,
}) => {
  const [optIn, setOptIn] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [consent, setConsent] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!profile) return;
    setOptIn(profile.leaderboard_opt_in ?? false);
    setDisplayName(profile.leaderboard_display_name ?? '');
    if (profile.leaderboard_opt_in) {
      setConsent(true);
    }
  }, [profile]);

  const wasOptedIn = profile?.leaderboard_opt_in === true;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (optIn && !wasOptedIn && !consent) {
      onError('ランキングに参加するには、内容への同意が必要です');
      return;
    }

    try {
      setSaving(true);
      const { error } = await updateProfile({
        leaderboard_opt_in: optIn,
        leaderboard_display_name: optIn ? (displayName.trim() || null) : null,
      });
      if (error) {
        onError(error.message || '保存に失敗しました');
        return;
      }
      onSuccess(optIn ? 'ランキング設定を保存しました' : 'ランキングへの参加をオフにしました');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card variant="brand" padding="lg">
      <CardHeader>
        <Typography variant="h3" color="brand" className="text-xl font-bold">
          学習者ランキング（任意参加）
        </Typography>
      </CardHeader>
      <CardContent>
        <Typography variant="body-sm" color="muted" className="mb-6 leading-relaxed">
          オンにすると、ダッシュボードの「任意参加」一覧に、あなたの表示名・学習 XP・ランクだけが載ることがあります。メールアドレスやフルネームは公開されません。いつでもオフにできます。
        </Typography>

        <form onSubmit={handleSubmit} className="space-y-6">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={optIn}
              onChange={(e) => {
                setOptIn(e.target.checked);
                if (!e.target.checked) {
                  setConsent(false);
                }
              }}
              className="mt-1 h-4 w-4 rounded border-brand-primary/40"
            />
            <span>
              <Typography variant="body-sm" className="font-medium">
                ランキングに参加する
              </Typography>
              <Typography variant="caption" color="muted" className="block mt-1">
                未設定の表示名はユーザー名が使われます。どちらも空の場合は「Learner」と表示されます。
              </Typography>
            </span>
          </label>

          {optIn && (
            <div>
              <label className="block mb-2">
                <Typography variant="body-sm" className="font-medium">
                  ランキング用表示名（任意）
                </Typography>
              </label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                maxLength={80}
                className="w-full px-4 py-3 rounded-lg border-2 border-brand-primary/30 focus:border-brand-primary bg-brand-secondary-light text-white focus:outline-none"
                placeholder="例: ブルーインパルス志望の田中"
              />
            </div>
          )}

          {optIn && !wasOptedIn && (
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={consent}
                onChange={(e) => setConsent(e.target.checked)}
                className="mt-1 h-4 w-4 rounded border-brand-primary/40"
              />
              <Typography variant="body-sm" color="muted">
                上記の公開範囲を理解し、任意でランキングに参加することに同意します。
              </Typography>
            </label>
          )}

          <div className="flex justify-end pt-2">
            <Button type="submit" variant="brand" disabled={saving}>
              {saving ? '保存中...' : '保存'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
