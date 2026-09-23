import React from 'react';
import type { Profile } from '../../../stores/authStore';
import { Typography } from '../../../components/ui/Typography';

interface ProfileIdentityHeaderProps {
  profile: Profile | null;
  email: string | null | undefined;
}

export const ProfileIdentityHeader: React.FC<ProfileIdentityHeaderProps> = ({ profile, email }) => {
  const displayName = profile?.username?.trim() || email?.split('@')[0] || 'Learner';

  return (
    <div className="mb-6 flex items-center gap-4">
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
        {email ? (
          <Typography variant="body-sm" color="muted">
            {email}
          </Typography>
        ) : null}
      </div>
    </div>
  );
};
