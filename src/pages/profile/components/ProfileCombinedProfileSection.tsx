import React, { useCallback } from 'react';
import type { Profile } from '../../../stores/authStore';
import { ProfilePublicSection } from './ProfilePublicSection';
import { SocialLinksForm } from './SocialLinksForm';

type SocialLinks = {
  twitter?: string;
  instagram?: string;
  youtube?: string;
  facebook?: string;
  linkedin?: string;
};

interface ProfileCombinedProfileSectionProps {
  profile: Profile | null;
  onSave: (payload: Partial<Profile>) => Promise<{ error: { message: string } | null }>;
  onError: (message: string) => void;
  onSuccess: (message: string) => void;
  onDirtyChange?: (dirty: boolean) => void;
}

export const ProfileCombinedProfileSection: React.FC<ProfileCombinedProfileSectionProps> = ({
  profile,
  onSave,
  onError,
  onSuccess,
  onDirtyChange,
}) => {
  const handleSocialLinksSave = useCallback(
    async (socialLinks: SocialLinks) => {
      const { error } = await onSave({
        social_links: socialLinks,
        updated_at: new Date().toISOString(),
      });
      if (error) throw error;
      onSuccess('ソーシャルリンクを保存しました');
    },
    [onSave, onSuccess],
  );

  return (
    <div className="space-y-8" data-testid="profile-section-profile">
      <ProfilePublicSection
        profile={profile}
        onSave={onSave}
        onError={onError}
        onSuccess={onSuccess}
        onDirtyChange={onDirtyChange}
      />
      <div>
        <SocialLinksForm
          currentSocialLinks={profile?.social_links}
          onSave={handleSocialLinksSave}
          onError={onError}
          onDirtyChange={onDirtyChange}
        />
      </div>
    </div>
  );
};
