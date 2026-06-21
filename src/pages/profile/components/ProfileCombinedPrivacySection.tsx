import React from 'react';
import type { Profile } from '../../../stores/authStore';
import { LeaderboardSettings } from './LeaderboardSettings';
import { NotificationPreferences } from './NotificationPreferences';

interface ProfileCombinedPrivacySectionProps {
  profile: Profile | null;
  updateProfile: (updates: Partial<Profile>) => Promise<{ error: { message: string } | null }>;
  onError: (message: string) => void;
  onSuccess: (message: string) => void;
  onNotificationSettingsSaved?: () => void;
  onDirtyChange?: (dirty: boolean) => void;
}

export const ProfileCombinedPrivacySection: React.FC<ProfileCombinedPrivacySectionProps> = ({
  profile,
  updateProfile,
  onError,
  onSuccess,
  onNotificationSettingsSaved,
  onDirtyChange,
}) => (
  <div className="space-y-8" data-testid="profile-section-privacy">
    <NotificationPreferences
      onError={onError}
      onSuccess={onSuccess}
      onSettingsSaved={onNotificationSettingsSaved}
    />
    {profile ? (
      <LeaderboardSettings
        profile={profile}
        updateProfile={updateProfile}
        onError={onError}
        onSuccess={onSuccess}
        onDirtyChange={onDirtyChange}
      />
    ) : null}
  </div>
);
