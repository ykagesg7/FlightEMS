import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  buildProfileSearchParams,
  computeProfileCompletion,
  resolveProfileRoute,
  type ProfileHubSection,
} from '../../auth/profileCompletion';
import { Typography } from '../../components/ui/Typography';
import { useAuthStore } from '../../stores/authStore';
import supabase from '../../utils/supabase';
import { ProfileCombinedAccountSection } from './components/ProfileCombinedAccountSection';
import { ProfileCombinedLearningSection } from './components/ProfileCombinedLearningSection';
import { ProfileCombinedPrivacySection } from './components/ProfileCombinedPrivacySection';
import { ProfileCombinedProfileSection } from './components/ProfileCombinedProfileSection';
import { ProfileCompletionStrip } from './components/ProfileCompletionStrip';
import { ProfileHubBackLink } from './components/ProfileHubBackLink';
import { ProfileHubSectionList } from './components/ProfileHubSectionList';
import { ProfileHubSidebar } from './components/ProfileHubSidebar';
import { ProfileIdentityHeader } from './components/ProfileIdentityHeader';
import { ProfileStickySaveBar } from './components/ProfileStickySaveBar';
import { getProfileHubSectionMeta } from './components/profileHubSections';
import { useUnsavedFormGuard } from './hooks/useUnsavedFormGuard';

const ProfilePage: React.FC = () => {
  const user = useAuthStore((state) => state.user);
  const profile = useAuthStore((state) => state.profile);
  const loading = useAuthStore((state) => state.loading);
  const updateProfile = useAuthStore((state) => state.updateProfile);

  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = searchParams.get('tab');
  const route = resolveProfileRoute(tabParam, searchParams.get('panel'));
  const activeSection: ProfileHubSection = route.section ?? 'profile';
  const showMobileList = !tabParam;

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [hasNotificationSettings, setHasNotificationSettings] = useState(false);
  const [dirtyFlags, setDirtyFlags] = useState<Record<string, boolean>>({});
  const feedbackTimerRef = useRef<number | null>(null);
  const feedbackRef = useRef<HTMLDivElement | null>(null);

  const resetFeedbackTimer = useCallback((onExpire: () => void, delayMs: number) => {
    if (feedbackTimerRef.current !== null) {
      window.clearTimeout(feedbackTimerRef.current);
    }
    feedbackTimerRef.current = window.setTimeout(() => {
      feedbackTimerRef.current = null;
      onExpire();
    }, delayMs);
  }, []);

  useEffect(() => () => {
    if (feedbackTimerRef.current !== null) {
      window.clearTimeout(feedbackTimerRef.current);
    }
  }, []);

  useEffect(() => {
    if (!error && !success) return;
    feedbackRef.current?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }, [error, success]);

  const setSectionDirty = useCallback((key: string, dirty: boolean) => {
    setDirtyFlags((prev) => {
      if (prev[key] === dirty) return prev;
      return { ...prev, [key]: dirty };
    });
  }, []);

  const isDirty = useMemo(
    () => Object.values(dirtyFlags).some(Boolean),
    [dirtyFlags],
  );

  useUnsavedFormGuard(isDirty);

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

  const navigateSection = useCallback(
    (section: ProfileHubSection) => {
      setSearchParams(buildProfileSearchParams(section), { replace: false });
    },
    [setSearchParams],
  );

  const showError = useCallback((message: string) => {
    setSuccess(null);
    setError(message);
    resetFeedbackTimer(() => setError(null), 8000);
  }, [resetFeedbackTimer]);

  const showSuccess = useCallback((message: string) => {
    setError(null);
    setSuccess(message);
    resetFeedbackTimer(() => setSuccess(null), 4000);
  }, [resetFeedbackTimer]);

  const handleNotificationSettingsSaved = useCallback(() => {
    setHasNotificationSettings(true);
  }, []);

  const sectionMeta = getProfileHubSectionMeta(activeSection);

  const renderSection = () => {
    switch (activeSection) {
      case 'profile':
        return (
          <ProfileCombinedProfileSection
            profile={profile}
            onSave={updateProfile}
            onError={showError}
            onSuccess={showSuccess}
            onDirtyChange={(dirty) => setSectionDirty('profile', dirty)}
          />
        );
      case 'learning':
        return (
          <ProfileCombinedLearningSection
            onError={showError}
            onSuccess={showSuccess}
            onDirtyChange={(dirty) => setSectionDirty('learning', dirty)}
          />
        );
      case 'privacy':
        return (
          <ProfileCombinedPrivacySection
            profile={profile}
            updateProfile={updateProfile}
            onError={showError}
            onSuccess={showSuccess}
            onNotificationSettingsSaved={handleNotificationSettingsSaved}
            onDirtyChange={(dirty) => setSectionDirty('privacy-leaderboard', dirty)}
          />
        );
      case 'account':
        return (
          <ProfileCombinedAccountSection
            email={user?.email}
            profile={profile}
            updateProfile={updateProfile}
            onError={showError}
            onSuccess={showSuccess}
          />
        );
      default:
        return null;
    }
  };

  // 初回のプロフィール取得中だけ全面ローディング。保存や再認証で loading が立っても画面を消さない
  if (loading && !profile) {
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
    <div className="min-h-screen bg-[var(--bg)] py-8 pb-24 md:pb-8">
      <div className="container mx-auto max-w-6xl px-4">
        <div className="mb-8 text-center md:text-left">
          <Typography variant="h1" color="brand" className="mb-2">
            プロフィール設定
          </Typography>
          <Typography variant="body" color="muted">
            あなたの情報を管理しましょう
          </Typography>
        </div>

        <ProfileIdentityHeader profile={profile} email={user?.email} />

        <div className="mb-6 md:hidden">
          <ProfileCompletionStrip completion={completion} />
        </div>

        <div className="flex flex-col gap-8 md:flex-row">
          <ProfileHubSidebar
            activeSection={activeSection}
            completion={completion}
            onSelect={navigateSection}
          />

          <div className="min-w-0 flex-1">
            {/* 保存結果は編集中のセクションの近くに出す（ページ最上部だと画面外になりやすい） */}
            <div ref={feedbackRef} aria-live="polite">
              {success && (
                <div className="mb-6 rounded-lg border border-green-500/20 bg-green-500/10 p-4" role="status">
                  <Typography variant="body-sm" className="text-green-400">
                    {success}
                  </Typography>
                </div>
              )}

              {error && (
                <div className="mb-6 rounded-lg border border-red-500/20 bg-red-500/10 p-4" role="alert">
                  <Typography variant="body-sm" className="text-red-400">
                    {error}
                  </Typography>
                </div>
              )}
            </div>

            {showMobileList ? (
              <ProfileHubSectionList onSelect={navigateSection} />
            ) : null}

            <div className={showMobileList ? 'hidden md:block' : 'block'}>
              {!showMobileList ? <ProfileHubBackLink /> : null}
              {!showMobileList ? (
                <Typography variant="h2" color="brand" className="mb-6 text-lg font-bold md:hidden">
                  {sectionMeta.label}
                </Typography>
              ) : null}
              {renderSection()}
            </div>
          </div>
        </div>
      </div>

      <ProfileStickySaveBar visible={isDirty} />
    </div>
  );
};

export default ProfilePage;
