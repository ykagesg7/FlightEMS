import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  computeProfileCompletion,
  profileSectionToTabParam,
  resolveProfileSection,
  type ProfileSectionId,
} from '../../auth/profileCompletion';
import { Typography } from '../../components/ui/Typography';
import { useAuthStore } from '../../stores/authStore';
import supabase from '../../utils/supabase';
import { LeaderboardSettings } from './components/LeaderboardSettings';
import { NotificationPreferences } from './components/NotificationPreferences';
import { ProfileAccountSection } from './components/ProfileAccountSection';
import { ProfileCompletionCard } from './components/ProfileCompletionCard';
import { ProfileIdentityHeader } from './components/ProfileIdentityHeader';
import { ProfilePublicSection } from './components/ProfilePublicSection';
import { ProfileSectionNav } from './components/ProfileSectionNav';
import { ProfileSecuritySection } from './components/ProfileSecuritySection';
import { SocialLinksForm } from './components/SocialLinksForm';

type SocialLinks = {
  twitter?: string;
  instagram?: string;
  youtube?: string;
  facebook?: string;
  linkedin?: string;
};

const ProfilePage: React.FC = () => {
  const user = useAuthStore((state) => state.user);
  const profile = useAuthStore((state) => state.profile);
  const loading = useAuthStore((state) => state.loading);
  const updateProfile = useAuthStore((state) => state.updateProfile);

  const [searchParams, setSearchParams] = useSearchParams();
  const [activeSection, setActiveSection] = useState<ProfileSectionId>(() =>
    resolveProfileSection(searchParams.get('tab')),
  );
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [hasNotificationSettings, setHasNotificationSettings] = useState(false);

  useEffect(() => {
    const raw = searchParams.get('tab');
    setActiveSection(resolveProfileSection(raw));
  }, [searchParams]);

  useEffect(() => {
    const fetchNotificationFlag = async () => {
      if (!user) {
        setHasNotificationSettings(false);
        return;
      }
      const { data, error: fetchError } = await supabase
        .from('user_notification_settings')
        .select('user_id')
        .eq('user_id', user.id)
        .maybeSingle();
      setHasNotificationSettings(!fetchError && Boolean(data));
    };
    void fetchNotificationFlag();
  }, [user]);

  const completion = useMemo(
    () => computeProfileCompletion({ profile, hasNotificationSettings }),
    [profile, hasNotificationSettings],
  );

  const selectSection = useCallback(
    (section: ProfileSectionId) => {
      setActiveSection(section);
      setSearchParams({ tab: profileSectionToTabParam(section) }, { replace: true });
    },
    [setSearchParams],
  );

  const showError = useCallback((message: string) => {
    setError(message);
    setTimeout(() => setError(null), 5000);
  }, []);

  const showSuccess = useCallback((message: string) => {
    setSuccess(message);
    setTimeout(() => setSuccess(null), 3000);
  }, []);

  const handleSocialLinksSave = useCallback(
    async (socialLinks: SocialLinks) => {
      const { error: saveError } = await updateProfile({
        social_links: socialLinks,
        updated_at: new Date().toISOString(),
      });
      if (saveError) throw saveError;
      showSuccess('ソーシャルリンクを保存しました');
    },
    [showSuccess, updateProfile],
  );

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--bg)] py-8">
        <div className="flex flex-col items-center space-y-4">
          <div className="h-16 w-16 animate-spin rounded-full border-4 border-brand-primary border-t-transparent" />
          <Typography variant="body" color="muted">
            プロフィールを読み込み中...
          </Typography>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg)] py-8">
      <div className="container mx-auto max-w-6xl px-4">
        <div className="mb-8 text-center">
          <Typography variant="h1" color="brand" className="mb-2">
            プロフィール設定
          </Typography>
          <Typography variant="body" color="muted">
            あなたの情報を管理しましょう
          </Typography>
        </div>

        {success && (
          <div className="mb-6 rounded-lg border border-green-500/20 bg-green-500/10 p-4">
            <Typography variant="body-sm" className="text-green-400">
              {success}
            </Typography>
          </div>
        )}

        {error && (
          <div className="mb-6 rounded-lg border border-red-500/20 bg-red-500/10 p-4">
            <Typography variant="body-sm" className="text-red-400">
              {error}
            </Typography>
          </div>
        )}

        <ProfileIdentityHeader profile={profile} email={user?.email} />
        <ProfileCompletionCard completion={completion} />
        <ProfileSectionNav activeSection={activeSection} onSelect={selectSection} />

        <div>
          {activeSection === 'public' && (
            <ProfilePublicSection
              profile={profile}
              userEmail={user?.email}
              onSave={updateProfile}
              onError={showError}
              onSuccess={showSuccess}
            />
          )}

          {activeSection === 'account' && (
            <ProfileAccountSection email={user?.email} />
          )}

          {activeSection === 'social' && (
            <SocialLinksForm
              currentSocialLinks={profile?.social_links}
              onSave={handleSocialLinksSave}
              onError={showError}
            />
          )}

          {activeSection === 'notifications' && (
            <NotificationPreferences onError={showError} />
          )}

          {activeSection === 'leaderboard' && profile && (
            <LeaderboardSettings
              profile={profile}
              updateProfile={updateProfile}
              onError={showError}
              onSuccess={showSuccess}
            />
          )}

          {activeSection === 'leaderboard' && !profile && (
            <Typography variant="body" color="muted">
              プロフィール情報を読み込み中です。
            </Typography>
          )}

          {activeSection === 'security' && (
            <ProfileSecuritySection
              userEmail={user?.email}
              profile={profile}
              updateProfile={updateProfile}
              onError={showError}
              onSuccess={showSuccess}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
