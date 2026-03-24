import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, Typography } from '../../../components/ui';
import { RANK_INFO } from '../../../types/gamification';
import type { PublicLeaderboardEntry } from '../../../types/dashboard';

interface Props {
  entries: PublicLeaderboardEntry[];
  borderColor: string;
}

function rankLabel(tier: PublicLeaderboardEntry['rankTier']): string {
  if (!tier || !(tier in RANK_INFO)) {
    return '—';
  }
  return RANK_INFO[tier as keyof typeof RANK_INFO].displayName;
}

/**
 * 任意参加の XP ランキング（オプトイン利用者のみ表示。メール等は含まない）
 */
export const PublicLeaderboardSection: React.FC<Props> = ({ entries, borderColor }) => {
  return (
    <Card variant="hud" padding="md" className={`${borderColor} mb-8`}>
      <CardContent>
        <Typography variant="h4" color="hud" className="mb-2">
          学習者ランキング（任意参加）
        </Typography>
        <Typography variant="body-sm" color="muted" className="mb-4 leading-relaxed">
          プロフィールの「ランキング」タブで参加に同意した方のみが表示されます。表示名は設定したランキング用の名前、なければユーザー名が使われます。
        </Typography>

        {entries.length === 0 ? (
          <Typography variant="body" color="muted">
            まだ表示できる参加者がいません。参加は{' '}
            <Link to="/profile?tab=leaderboard" className="text-brand-primary underline hover:no-underline">
              プロフィール設定
            </Link>
            からいつでもオプトインできます。
          </Typography>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-brand-primary/20">
            <table className="w-full text-left text-sm">
              <thead className="bg-brand-primary/10 text-[color:var(--text-muted)]">
                <tr>
                  <th className="px-3 py-2 font-medium">#</th>
                  <th className="px-3 py-2 font-medium">表示名</th>
                  <th className="px-3 py-2 font-medium">XP</th>
                  <th className="px-3 py-2 font-medium">ランク</th>
                </tr>
              </thead>
              <tbody>
                {entries.map((row) => (
                  <tr
                    key={`lb-row-${row.position}`}
                    className="border-t border-brand-primary/10 hover:bg-brand-primary/5"
                  >
                    <td className="px-3 py-2 text-brand-primary font-mono">{row.position}</td>
                    <td className="px-3 py-2">{row.displayName}</td>
                    <td className="px-3 py-2 font-mono">{row.xpPoints}</td>
                    <td className="px-3 py-2 text-[color:var(--text-muted)]">{rankLabel(row.rankTier)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
