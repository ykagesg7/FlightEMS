import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, Typography } from '../../../components/ui';
import { PublicUserBadgesPanel } from '../../../components/learning/PublicUserBadgesPanel';
import { useAuthStore } from '../../../stores/authStore';
import type { PublicLeaderboardEntry } from '../../../types/dashboard';

const PROFILE_LEADERBOARD_HREF = '/profile?tab=leaderboard';

interface Props {
  entries: PublicLeaderboardEntry[];
  borderColor: string;
}

/**
 * 任意参加の XP 参考ランキング（オプトイン利用者のみ表示）。
 * 学習段階は個人の習熟証拠で決まり、この順位では変化しない。
 */
export const PublicLeaderboardSection: React.FC<Props> = ({ entries, borderColor }) => {
  const profile = useAuthStore((s) => s.profile);
  const [badgeUser, setBadgeUser] = useState<{ id: string; name: string } | null>(null);
  const showJoinRankingButton =
    profile !== null && profile.leaderboard_opt_in !== true;

  return (
    <>
      <Card variant="hud" padding="md" className={borderColor}>
        <CardContent>
          <Typography variant="h4" color="hud" className="mb-2">
            学習活動XP（任意参加・参考）
          </Typography>
          <Typography variant="body-sm" color="muted" className="mb-4 leading-relaxed">
            XPは学習行動量の参考値で、学習段階や資格を決めません。参加に同意した方だけを表示し、表示名から週次バッジを確認できます。
          </Typography>

          {showJoinRankingButton ? (
            <div className="mb-4">
              <Link
                to={PROFILE_LEADERBOARD_HREF}
                className={`
                  inline-flex items-center justify-center rounded-lg px-4 py-2.5 text-sm font-semibold
                  bg-brand-primary text-[var(--bg)] shadow-md transition-all duration-200
                  hover:bg-brand-primary-dark hover:shadow-lg
                  focus:outline-none focus:ring-2 focus:ring-brand-primary focus:ring-offset-2 focus:ring-offset-[var(--bg)]
                `}
              >
                今すぐランキングに参加する
              </Link>
            </div>
          ) : null}

          {entries.length === 0 ? (
            <Typography variant="body" color="muted">
              まだ表示できる参加者がいません。参加は{' '}
              <Link to={PROFILE_LEADERBOARD_HREF} className="text-brand-primary underline hover:no-underline">
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
                  </tr>
                </thead>
                <tbody>
                  {entries.map((row) => (
                    <tr
                      key={`lb-row-${row.position}`}
                      className="border-t border-brand-primary/10 hover:bg-brand-primary/5"
                    >
                      <td className="px-3 py-2 text-brand-primary font-mono">{row.position}</td>
                      <td className="px-3 py-2">
                        {/^[0-9a-f-]{36}$/i.test(row.userId) ? (
                          <button
                            type="button"
                            className="text-left underline hover:text-brand-primary"
                            onClick={() => setBadgeUser({ id: row.userId, name: row.displayName })}
                          >
                            {row.displayName}
                          </button>
                        ) : (
                          <span>{row.displayName}</span>
                        )}
                      </td>
                      <td className="px-3 py-2 font-mono">{row.xpPoints}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {badgeUser && (
        <PublicUserBadgesPanel
          userId={badgeUser.id}
          displayName={badgeUser.name}
          onClose={() => setBadgeUser(null)}
        />
      )}
    </>
  );
};
