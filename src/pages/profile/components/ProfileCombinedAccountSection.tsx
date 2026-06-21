import React from 'react';
import type { Profile } from '../../../stores/authStore';
import { ProfileAccountDeleteSection } from './ProfileAccountDeleteSection';
import { ProfileAccountSection } from './ProfileAccountSection';
import { ProfileMfaSection } from './ProfileMfaSection';
import { ProfileOAuthIdentities } from './ProfileOAuthIdentities';
import { ProfileSecuritySection } from './ProfileSecuritySection';

interface ProfileCombinedAccountSectionProps {
  email: string | null | undefined;
  profile: Profile | null;
  updateProfile: (updates: Partial<Profile>) => Promise<{ error: { message: string } | null }>;
  onError: (message: string) => void;
  onSuccess: (message: string) => void;
}

export const ProfileCombinedAccountSection: React.FC<ProfileCombinedAccountSectionProps> = ({
  email,
  profile,
  updateProfile,
  onError,
  onSuccess,
}) => (
  <div className="space-y-8" data-testid="profile-section-account">
    <ProfileAccountSection email={email} />
    <ProfileOAuthIdentities />
    <ProfileSecuritySection
      userEmail={email}
      profile={profile}
      updateProfile={updateProfile}
      onError={onError}
      onSuccess={onSuccess}
    />
    <ProfileMfaSection onError={onError} onSuccess={onSuccess} />
    <ProfileAccountDeleteSection userEmail={email} onError={onError} />
  </div>
);
