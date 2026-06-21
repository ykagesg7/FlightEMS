import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { deriveOAuthAvatarUrl, deriveOAuthDisplayName } from '../../auth/deriveOAuthProfile';
import { deriveOAuthUsername } from '../../auth/deriveOAuthUsername';
import {
  completeWelcomeSetup,
  getWelcomeRedirectTarget,
  isCohortOnlyWelcomeMode,
  needsWelcomeSetup,
} from '../../auth/profileSetup';
import { Button } from '../../components/ui';
import { useAuthStore } from '../../stores/authStore';
import { importOAuthAvatarIfAvailable } from '../../utils/importOAuthAvatar';
import { awardRegistrationXp } from '../../utils/awardQuizSessionXp';
import { ExamTargetSelect } from '../../components/learning/ExamTargetSelect';
import { upsertUserCohort } from '../../utils/cohortApi';
import { formatCohortKeyLabel } from '../../utils/cohort';
import { getDefaultExamYearMonth } from '../../utils/examSchedule';
import { AuthAlert } from '../auth/components/AuthAlert';
import { AuthInput } from '../auth/components/AuthInput';
import { AuthLayout } from '../auth/components/AuthLayout';
import { AuthTextLink } from '../auth/components/AuthTextLink';
import { useNotificationSettings } from '../profile/hooks/useNotificationSettings';
import { registerPushSubscriptionIfAllowed } from '../../utils/pushNotifications';

const FULL_SETUP_STEPS = 4;

type ExamChoice = 'month' | 'undecided';

const WelcomeSetupPage: React.FC = () => {
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);
  const profile = useAuthStore((state) => state.profile);
  const updateProfile = useAuthStore((state) => state.updateProfile);
  const fetchProfile = useAuthStore((state) => state.fetchProfile);

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectTarget = getWelcomeRedirectTarget(searchParams);
  const cohortOnlyMode = isCohortOnlyWelcomeMode(searchParams);

  const [step, setStep] = useState(cohortOnlyMode ? 2 : 1);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [username, setUsername] = useState('');
  const [examChoice, setExamChoice] = useState<ExamChoice>('month');
  const [examMonth, setExamMonth] = useState(() => getDefaultExamYearMonth('CPL').examYm);
  const [licenseTarget, setLicenseTarget] = useState<'CPL' | 'PPL'>('CPL');
  const [cohortSaved, setCohortSaved] = useState(false);
  const [savedCohortLabel, setSavedCohortLabel] = useState<string | null>(null);

  const [leaderboardOptIn, setLeaderboardOptIn] = useState(true);
  const [leaderboardDisplayName, setLeaderboardDisplayName] = useState('');
  const [leaderboardConsent, setLeaderboardConsent] = useState(true);
  const [avatarImporting, setAvatarImporting] = useState(false);

  const totalSteps = cohortOnlyMode ? 1 : FULL_SETUP_STEPS;

  const {
    settings,
    isLoading: notificationsLoading,
    saveSettings,
    toggleSetting,
    updateSetting,
  } = useNotificationSettings(user?.id);

  useEffect(() => {
    if (user && !profile) {
      void fetchProfile(user.id);
    }
  }, [user, profile, fetchProfile]);

  useEffect(() => {
    if (cohortOnlyMode) return;
    if (profile && !needsWelcomeSetup(profile)) {
      navigate(redirectTarget, { replace: true });
    }
  }, [cohortOnlyMode, profile, navigate, redirectTarget]);

  useEffect(() => {
    if (username.trim()) return;
    if (profile?.username) {
      setUsername(profile.username);
      return;
    }
    if (user) {
      setUsername(deriveOAuthUsername(user));
    }
  }, [profile?.username, user, username]);

  useEffect(() => {
    if (leaderboardDisplayName.trim()) return;
    const fromProfile = profile?.leaderboard_display_name?.trim();
    if (fromProfile) {
      setLeaderboardDisplayName(fromProfile);
      return;
    }
    if (username.trim()) {
      setLeaderboardDisplayName(username.trim());
      return;
    }
    if (user) {
      setLeaderboardDisplayName(deriveOAuthDisplayName(user));
    }
  }, [leaderboardDisplayName, profile?.leaderboard_display_name, user, username]);

  const oauthAvatarPreview = useMemo(() => {
    if (profile?.avatar_url) return profile.avatar_url;
    if (user) return deriveOAuthAvatarUrl(user);
    return null;
  }, [profile?.avatar_url, user]);

  const finishSetup = useCallback(async () => {
    if (!user) return;
    if (!cohortOnlyMode && !cohortSaved) {
      setError('学科試験の受験予定の登録が必要です');
      setStep(2);
      return;
    }
    setSaving(true);
    setError(null);
    if (!cohortOnlyMode) {
      const { error: completeError } = await completeWelcomeSetup(user.id);
      if (completeError) {
        setSaving(false);
        setError(completeError.message || 'セットアップ完了に失敗しました');
        return;
      }
      try {
        await awardRegistrationXp(user.id, queryClient);
      } catch (xpErr) {
        console.warn('registration XP award skipped:', xpErr);
      }
    }
    setSaving(false);
    void queryClient.invalidateQueries({ queryKey: ['cohort'] });
    const destination = cohortOnlyMode
      ? redirectTarget
      : redirectTarget === '/'
        ? '/test?tab=diagnostic'
        : redirectTarget;
    navigate(destination, { replace: true });
  }, [cohortOnlyMode, cohortSaved, navigate, queryClient, redirectTarget, user]);

  const handleImportOAuthAvatar = useCallback(async () => {
    if (!user) return;
    setAvatarImporting(true);
    setError(null);
    const { error: importError } = await importOAuthAvatarIfAvailable(user, profile?.avatar_url);
    if (importError) {
      setError('Google の写真を取り込めませんでした。後からプロフィールで設定できます。');
    } else {
      await fetchProfile(user.id);
    }
    setAvatarImporting(false);
  }, [fetchProfile, profile?.avatar_url, user]);

  const saveUsername = useCallback(async () => {
    if (!username.trim()) {
      setError('ユーザー名を入力してください');
      return false;
    }
    setSaving(true);
    setError(null);
    const { error: updateError } = await updateProfile({ username: username.trim() });
    setSaving(false);
    if (updateError) {
      setError(updateError.message || 'ユーザー名の保存に失敗しました');
      return false;
    }
    if (!leaderboardDisplayName.trim()) {
      setLeaderboardDisplayName(username.trim());
    }
    return true;
  }, [leaderboardDisplayName, updateProfile, username]);

  const saveCohort = useCallback(async () => {
    if (examChoice === 'month' && !examMonth) {
      setError('試験年月を選択するか、受験日未定を選んでください');
      return false;
    }
    setSaving(true);
    setError(null);
    const { data, error: cohortError } = await upsertUserCohort({
      license: licenseTarget,
      examYm: examChoice === 'month' ? examMonth : null,
      undecided: examChoice === 'undecided',
    });
    setSaving(false);
    if (cohortError) {
      setError(cohortError.message || '受験予定の保存に失敗しました');
      return false;
    }
    const key = typeof data?.cohort_key === 'string' ? data.cohort_key : null;
    setSavedCohortLabel(formatCohortKeyLabel(key));
    setCohortSaved(true);
    void queryClient.invalidateQueries({ queryKey: ['cohort'] });
    return true;
  }, [examChoice, examMonth, licenseTarget, queryClient]);

  const saveLeaderboard = useCallback(async () => {
    if (leaderboardOptIn && !leaderboardConsent && !profile?.leaderboard_opt_in) {
      setError('ランキング・バッジ公開に参加するには、内容への同意が必要です');
      return false;
    }
    setSaving(true);
    setError(null);
    const { error: updateError } = await updateProfile({
      leaderboard_opt_in: leaderboardOptIn,
      leaderboard_display_name: leaderboardOptIn ? (leaderboardDisplayName.trim() || null) : null,
    });
    setSaving(false);
    if (updateError) {
      setError(updateError.message || 'ランキング設定の保存に失敗しました');
      return false;
    }
    return true;
  }, [leaderboardConsent, leaderboardDisplayName, leaderboardOptIn, profile?.leaderboard_opt_in, updateProfile]);

  const saveNotifications = useCallback(async () => {
    setSaving(true);
    setError(null);
    const { error: saveError } = await saveSettings();
    setSaving(false);
    if (saveError) {
      setError(saveError.message || '通知設定の保存に失敗しました');
      return false;
    }
    await registerPushSubscriptionIfAllowed();
    return true;
  }, [saveSettings]);

  const handleNext = useCallback(async () => {
    if (cohortOnlyMode) {
      const ok = await saveCohort();
      if (!ok) return;
      await finishSetup();
      return;
    }
    if (step === 1) {
      const ok = await saveUsername();
      if (!ok) return;
      setStep(2);
      return;
    }
    if (step === 2) {
      const ok = await saveCohort();
      if (!ok) return;
      setStep(3);
      return;
    }
    if (step === 3) {
      const ok = await saveLeaderboard();
      if (!ok) return;
      setStep(4);
      return;
    }
    if (step === 4) {
      const ok = await saveNotifications();
      if (!ok) return;
      await finishSetup();
    }
  }, [cohortOnlyMode, finishSetup, saveCohort, saveLeaderboard, saveNotifications, saveUsername, step]);

  const handleSkipStep = useCallback(() => {
    setError(null);
    if (step === 2) {
      setError('受験予定の登録は必須です。試験月または受験日未定を選んでください。');
      return;
    }
    if (step < FULL_SETUP_STEPS) {
      setStep((s) => s + 1);
    } else {
      void finishSetup();
    }
  }, [finishSetup, step]);

  const stepTitle = cohortOnlyMode
    ? '学科試験の受験予定'
    : step === 1
      ? 'ユーザー名とアバター'
      : step === 2
        ? '学科試験の受験予定'
        : step === 3
          ? 'ランキング・バッジ公開'
          : '通知';

  const hasStoredAvatar = Boolean(profile?.avatar_url);
  const canSkipCurrentStep = !cohortOnlyMode && step !== 2;
  const displayStep = cohortOnlyMode ? 1 : step;

  return (
    <AuthLayout title={cohortOnlyMode ? '受験予定の登録' : 'アカウントのセットアップ'}>
      <p className="mb-4 text-sm text-[var(--text-muted)]">
        ステップ {displayStep} / {totalSteps} — {stepTitle}
      </p>

      <div className="mb-6 flex gap-2">
        {Array.from({ length: totalSteps }, (_, i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded ${i + 1 <= displayStep ? 'bg-brand-primary' : 'bg-brand-primary/20'}`}
            aria-hidden
          />
        ))}
      </div>

      {error && <AuthAlert variant="error">{error}</AuthAlert>}

      {!cohortOnlyMode && step === 1 && (
        <div className="space-y-4">
          <p className="text-sm text-[var(--text-muted)]">
            ハンドルネームの利用を推奨します（本名が載る場合があります）。後からプロフィールで変更できます。
          </p>

          <div className="flex flex-col items-center gap-3 rounded-lg border border-brand-primary/20 bg-brand-secondary-dark/50 p-4">
            <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-full border-2 border-brand-primary/40 bg-brand-secondary-dark">
              {oauthAvatarPreview ? (
                <img src={oauthAvatarPreview} alt="" className="h-full w-full object-cover" />
              ) : (
                <span className="text-2xl font-semibold text-brand-primary">
                  {(username || '?').charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            {oauthAvatarPreview && !hasStoredAvatar && user && (
              <Button
                type="button"
                variant="secondary"
                size="sm"
                disabled={avatarImporting || saving}
                onClick={() => void handleImportOAuthAvatar()}
              >
                {avatarImporting ? '取り込み中...' : 'Google の写真を使う'}
              </Button>
            )}
            {hasStoredAvatar && (
              <p className="text-xs text-[var(--text-muted)]">プロフィール画像を設定済みです</p>
            )}
          </div>

          <AuthInput
            label="ユーザー名"
            type="text"
            id="welcome-username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoComplete="username"
          />
        </div>
      )}

      {(cohortOnlyMode || step === 2) && (
        <div className="space-y-4">
          <p className="text-sm text-[var(--text-muted)]">
            学科試験の受験予定を登録すると、同じ試験月の仲間と匿名統計・週次ミッションに参加できます。試験月が決まっていない場合は「受験日未定」を選べます。
          </p>
          <div>
            <span className="mb-2 block text-sm font-medium text-[var(--text-primary)]">資格</span>
            <select
              id="welcome-license"
              value={licenseTarget}
              onChange={(e) => setLicenseTarget(e.target.value as 'CPL' | 'PPL')}
              className="w-full rounded-lg border border-brand-primary/30 bg-brand-secondary-dark px-4 py-3 text-[var(--text-primary)]"
            >
              <option value="CPL">CPL（事業用操縦士）</option>
              <option value="PPL">PPL（自家用操縦士）</option>
            </select>
          </div>
          <fieldset className="space-y-2">
            <legend className="text-sm font-medium text-[var(--text-primary)]">受験予定</legend>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="exam-choice"
                checked={examChoice === 'month'}
                onChange={() => setExamChoice('month')}
              />
              <span className="text-sm">試験年月を指定</span>
            </label>
            {examChoice === 'month' && (
              <ExamTargetSelect
                idPrefix="welcome-exam"
                license={licenseTarget}
                examYm={examMonth}
                onExamYmChange={setExamMonth}
              />
            )}
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="exam-choice"
                checked={examChoice === 'undecided'}
                onChange={() => setExamChoice('undecided')}
              />
              <span className="text-sm">受験日未定</span>
            </label>
          </fieldset>
          {cohortSaved && savedCohortLabel && (
            <p className="text-sm text-brand-primary">登録済み: {savedCohortLabel}</p>
          )}
        </div>
      )}

      {!cohortOnlyMode && step === 3 && (
        <div className="space-y-4">
          <p className="text-sm text-[var(--text-muted)]">
            デフォルトで学習者ランキング・週次バッジに参加します（表示名・XP・バッジのみ公開）。プロフィールからいつでもオフにできます。
          </p>
          <label htmlFor="welcome-leaderboard-opt-in" className="flex items-start gap-3 cursor-pointer">
            <input
              id="welcome-leaderboard-opt-in"
              type="checkbox"
              checked={leaderboardOptIn}
              onChange={(e) => {
                setLeaderboardOptIn(e.target.checked);
                if (!e.target.checked) setLeaderboardConsent(false);
              }}
              className="mt-1 h-4 w-4 rounded border-brand-primary/40"
            />
            <span className="text-sm text-[var(--text-primary)]">ランキング・バッジを公開する</span>
          </label>
          {leaderboardOptIn && (
            <>
              <AuthInput
                label="表示名（任意）"
                type="text"
                id="welcome-leaderboard-name"
                value={leaderboardDisplayName}
                onChange={(e) => setLeaderboardDisplayName(e.target.value)}
                maxLength={80}
              />
              {!profile?.leaderboard_opt_in && (
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={leaderboardConsent}
                    onChange={(e) => setLeaderboardConsent(e.target.checked)}
                    className="mt-1 h-4 w-4 rounded border-brand-primary/40"
                  />
                  <span className="text-sm text-[var(--text-muted)]">
                    公開範囲を理解し、参加することに同意します（デフォルト ON・いつでもオフ可能）。
                  </span>
                </label>
              )}
            </>
          )}
        </div>
      )}

      {!cohortOnlyMode && step === 4 && (
        <div className="space-y-4">
          <p className="text-sm text-[var(--text-muted)]">
            受け取りたい通知を選んでください。すべて後からプロフィールで変更できます。
          </p>
          {notificationsLoading ? (
            <p className="text-sm text-[var(--text-muted)]">読み込み中...</p>
          ) : (
            <>
              <WelcomeNotificationToggle
                label="学習リマインダー"
                enabled={settings.learning_reminder_enabled ?? true}
                onChange={() => toggleSetting('learning_reminder_enabled')}
              />
              <WelcomeNotificationToggle
                label="新着コンテンツ"
                enabled={settings.new_content_enabled ?? true}
                onChange={() => toggleSetting('new_content_enabled')}
              />
              <WelcomeNotificationToggle
                label="週次ミッション・お知らせ"
                enabled={settings.mission_update_enabled ?? true}
                onChange={() => toggleSetting('mission_update_enabled')}
              />
              <WelcomeNotificationToggle
                label="メール通知"
                enabled={settings.email_notifications_enabled ?? false}
                onChange={() => toggleSetting('email_notifications_enabled')}
              />
              <div>
                <label htmlFor="welcome-notification-time" className="mb-2 block text-sm font-medium text-[var(--text-primary)]">
                  通知時間
                </label>
                <input
                  id="welcome-notification-time"
                  type="time"
                  value={settings.notification_time?.slice(0, 5) || '09:00'}
                  onChange={(e) => updateSetting('notification_time', `${e.target.value}:00`)}
                  className="w-full rounded-lg border border-brand-primary/30 bg-brand-secondary-dark px-4 py-3 text-[var(--text-primary)] focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/50"
                />
              </div>
            </>
          )}
        </div>
      )}

      <div className="mt-6 flex flex-col gap-3">
        <Button type="button" variant="brand" disabled={saving || avatarImporting} className="w-full" onClick={() => void handleNext()}>
          {saving ? '保存中...' : displayStep === totalSteps || cohortOnlyMode ? '完了' : '次へ'}
        </Button>
        {canSkipCurrentStep && (
          <Button type="button" variant="secondary" disabled={saving || avatarImporting} className="w-full" onClick={handleSkipStep}>
            スキップ
          </Button>
        )}
        {!cohortOnlyMode && (
          <p className="text-center text-sm">
            <AuthTextLink
              onClick={() => {
                if (!cohortSaved) {
                  setError('受験予定を登録してからホームへ進めます');
                  setStep(2);
                  return;
                }
                void finishSetup();
              }}
            >
              あとで設定する（ホームへ）
            </AuthTextLink>
          </p>
        )}
      </div>
    </AuthLayout>
  );
};

interface WelcomeNotificationToggleProps {
  label: string;
  enabled: boolean;
  onChange: () => void;
}

const WelcomeNotificationToggle: React.FC<WelcomeNotificationToggleProps> = ({ label, enabled, onChange }) => (
  <div className="flex items-center justify-between rounded-lg border border-brand-primary/20 bg-brand-secondary-dark/50 px-4 py-3">
    <span className="text-sm text-[var(--text-primary)]">{label}</span>
    <button
      type="button"
      onClick={onChange}
      className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/50 ${enabled ? 'bg-brand-primary' : 'bg-gray-600'}`}
      role="switch"
      aria-checked={enabled}
      aria-label={label}
    >
      <span
        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow transition ${enabled ? 'translate-x-5' : 'translate-x-0'}`}
      />
    </button>
  </div>
);

export default WelcomeSetupPage;
