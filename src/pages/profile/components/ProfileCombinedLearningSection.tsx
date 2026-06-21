import React from 'react';
import { ProfileCohortSection } from './ProfileCohortSection';
import { ProfileUserBadgesSection } from './ProfileUserBadgesSection';

interface ProfileCombinedLearningSectionProps {
  onError: (message: string) => void;
  onSuccess: (message: string) => void;
  onDirtyChange?: (dirty: boolean) => void;
}

export const ProfileCombinedLearningSection: React.FC<ProfileCombinedLearningSectionProps> = ({
  onError,
  onSuccess,
  onDirtyChange,
}) => (
  <div className="space-y-8" data-testid="profile-section-learning">
    <ProfileCohortSection
      onError={onError}
      onSuccess={onSuccess}
      onDirtyChange={onDirtyChange}
    />
    <ProfileUserBadgesSection />
  </div>
);
