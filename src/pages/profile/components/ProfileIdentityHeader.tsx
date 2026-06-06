import React from 'react';
import { Link } from 'react-router-dom';
import type { Profile } from '../../../stores/authStore';
import { Typography } from '../../../components/ui/Typography';
import { RANK_INFO } from '../../../types/gamification';

interface ProfileIdentityHeaderProps {
  profile: Profile | null;
  email: string | null | undefined;
}

export const ProfileIdentityHeader: React.FC<ProfileIdentityHeaderProps> = ({ profile, email }) => {
  const displayName = profile?.username?.trim() || email?.split('@')[0] || 'Learner';
  const rankLabel = profile?.rank && profile.rank in RANK_INFO
    ? RANK_INFO[profile.rank as keyof typeof RANK_INFO].displayName
    : null;

  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-4">
        <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-full border-2 border-brand-primary/40 bg-brand-secondary-dark">
          {profile?.avatar_url ? (
            <img src={profile.avatar_url} alt="" className="h-full w-full object-cover" />
          ) : (
            <span className="text-xl font-semibold text-brand-primary">
              {displayName.charAt(0).toUpperCase()}
            </span>
          )}
        </div>
        <div>
          <Typography variant="h2" color="brand" className="text-xl font-bold">
            {displayName}
          </Typography>
          <Typography variant="body-sm" color="muted">
            {[rankLabel, profile?.xp_points != null ? `XP ${profile.xp_points}` : null]
              .filter(Boolean)
              .join(' · ') || email}
          </Typography>
        </div>
      </div>
      <Link
        to="/mission"
        className="text-sm font-medium text-brand-primary underline hover:no-underline"
      >
        PPL ランク・ミッションを見る
      </Link>
    </div>
  );
};
