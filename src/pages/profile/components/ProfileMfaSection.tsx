import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { unenrollVerifiedMfaFactor, verifyMfaFactorCode, verifyMfaForSensitiveAction } from '../../../auth/mfaAuth';
import { MfaRecoveryCodesPanel } from '../../../components/auth/MfaRecoveryCodesPanel';
import { Button } from '../../../components/ui';
import { Card, CardContent, CardHeader } from '../../../components/ui/Card';
import { Typography } from '../../../components/ui/Typography';
import { useAuthStore } from '../../../stores/authStore';
import { toAppError } from '../../../types/error';
import {
  clearMfaRecoveryCodes,
  fetchMfaRecoveryCodeStatus,
  generateMfaRecoveryCodes,
} from '../../../utils/mfaRecoveryCodesApi';
import supabase from '../../../utils/supabase';

type MfaFactor = {
  id: string;
  friendly_name?: string;
  factor_type: string;
  status: string;
};

const MFA_BENEFITS = [
  'パスワードや Google ログインが漏れても、認証アプリのコードがないとログインできません',
  '学習記録・プロフィール・cohort 設定など、あなたのアカウント操作を第三者から守れます',
  '端末紛失時はリカバリーコードでログインし、あとから二要素認証を再設定できます',
] as const;

export const ProfileMfaSection: React.FC<{
  onError: (message: string) => void;
  onSuccess: (message: string) => void;
}> = ({ onError, onSuccess }) => {
  const profile = useAuthStore((state) => state.profile);
  const updateProfile = useAuthStore((state) => state.updateProfile);
  const [factors, setFactors] = useState<MfaFactor[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [enrolling, setEnrolling] = useState(false);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [factorId, setFactorId] = useState<string | null>(null);
  const [verifyCode, setVerifyCode] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [showUnenrollForm, setShowUnenrollForm] = useState(false);
  const [unenrollCode, setUnenrollCode] = useState('');
  const [unenrolling, setUnenrolling] = useState(false);
  const [loginMfaSaving, setLoginMfaSaving] = useState(false);
  const [recoveryCodes, setRecoveryCodes] = useState<string[] | null>(null);
  const [recoveryRemaining, setRecoveryRemaining] = useState<number | null>(null);
  const [showRegenerateForm, setShowRegenerateForm] = useState(false);
  const [regenerateCode, setRegenerateCode] = useState('');
  const [regenerating, setRegenerating] = useState(false);

  const loginMfaRequired = profile?.mfa_required_at_login !== false;

  const refreshFactors = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const { data, error } = await supabase.auth.mfa.listFactors();
      if (error) {
        setLoadError(error.message || '二要素認証の状態取得に失敗しました');
        setFactors([]);
        return;
      }
      const byId = new Map<string, MfaFactor>();
      for (const factor of [...(data.all ?? []), ...(data.totp ?? [])]) {
        if (factor.factor_type === 'totp') {
          byId.set(factor.id, factor);
        }
      }
      setFactors([...byId.values()]);
    } catch (err) {
      setLoadError(toAppError(err).message);
      setFactors([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshRecoveryStatus = useCallback(async () => {
    const { remaining, hasMfa, error } = await fetchMfaRecoveryCodeStatus();
    if (error) {
      setRecoveryRemaining(null);
      return;
    }
    setRecoveryRemaining(hasMfa ? remaining : 0);
  }, []);

  useEffect(() => {
    void refreshFactors();
  }, [refreshFactors]);

  const verifiedFactors = useMemo(
    () => factors.filter((factor) => factor.status === 'verified'),
    [factors],
  );
  const primaryFactor = verifiedFactors[0] ?? null;

  useEffect(() => {
    if (verifiedFactors.length > 0) {
      void refreshRecoveryStatus();
    } else {
      setRecoveryRemaining(null);
    }
  }, [verifiedFactors.length, refreshRecoveryStatus]);

  const issueRecoveryCodes = useCallback(async (): Promise<boolean> => {
    const { codes, error } = await generateMfaRecoveryCodes();
    if (error) {
      onError(error);
      return false;
    }
    if (codes.length === 0) {
      onError('リカバリーコードの発行に失敗しました');
      return false;
    }
    setRecoveryCodes(codes);
    setRecoveryRemaining(codes.length);
    return true;
  }, [onError]);

  const handleStartEnroll = async () => {
    setEnrolling(true);
    try {
      const { data, error } = await supabase.auth.mfa.enroll({
        factorType: 'totp',
        friendlyName: 'Authenticator',
      });
      if (error) {
        onError(
          error.message.includes('MFA')
            ? `${error.message}（Supabase Dashboard → Authentication → MFA で TOTP を有効化してください）`
            : error.message || '二要素認証の登録開始に失敗しました',
        );
        return;
      }
      setFactorId(data.id);
      setQrCode(data.totp?.qr_code ?? null);
    } catch (err) {
      onError(toAppError(err).message);
    } finally {
      setEnrolling(false);
    }
  };

  const handleVerifyEnroll = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!factorId || !verifyCode.trim()) {
      onError('認証コードを入力してください');
      return;
    }
    setVerifying(true);
    try {
      const { error } = await verifyMfaFactorCode(factorId, verifyCode);
      if (error) {
        onError(error.message || '認証コードの確認に失敗しました');
        return;
      }

      await supabase.auth.refreshSession();

      const { error: profileError } = await updateProfile({ mfa_required_at_login: true });
      if (profileError) {
        onError(profileError.message || 'ログイン時 MFA 設定の保存に失敗しました');
        return;
      }

      const issued = await issueRecoveryCodes();
      if (!issued) {
        return;
      }

      setQrCode(null);
      setFactorId(null);
      setVerifyCode('');
      await refreshFactors();
    } catch (err) {
      onError(toAppError(err).message);
    } finally {
      setVerifying(false);
    }
  };

  const handleRecoveryAcknowledged = () => {
    setRecoveryCodes(null);
    onSuccess('二要素認証とリカバリーコードを設定しました');
  };

  const handleRegenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!primaryFactor) return;
    if (!regenerateCode.trim()) {
      onError('認証アプリの 6 桁コードを入力してください');
      return;
    }

    setRegenerating(true);
    try {
      const { error: mfaError } = await verifyMfaForSensitiveAction(primaryFactor.id, regenerateCode);
      if (mfaError) {
        onError(mfaError.message || '認証コードの確認に失敗しました');
        return;
      }

      const issued = await issueRecoveryCodes();
      if (!issued) {
        return;
      }

      setShowRegenerateForm(false);
      setRegenerateCode('');
      onSuccess('新しいリカバリーコードを発行しました。必ず保存してください');
    } catch (err) {
      onError(toAppError(err).message);
    } finally {
      setRegenerating(false);
    }
  };

  const handleUnenroll = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!primaryFactor) return;
    if (!unenrollCode.trim()) {
      onError('解除するには認証アプリの 6 桁コードが必要です');
      return;
    }

    setUnenrolling(true);
    try {
      const { error } = await unenrollVerifiedMfaFactor(primaryFactor.id, unenrollCode);
      if (error) {
        onError(error.message || '二要素認証の解除に失敗しました');
        return;
      }

      await clearMfaRecoveryCodes();

      onSuccess('二要素認証を解除しました');
      setShowUnenrollForm(false);
      setUnenrollCode('');
      setRecoveryRemaining(0);
      await refreshFactors();
    } catch (err) {
      onError(toAppError(err).message);
    } finally {
      setUnenrolling(false);
    }
  };

  const handleLoginMfaToggle = async (enabled: boolean) => {
    setLoginMfaSaving(true);
    try {
      const { error } = await updateProfile({ mfa_required_at_login: enabled });
      if (error) {
        onError(error.message || 'ログイン時 MFA 設定の更新に失敗しました');
        return;
      }
      onSuccess(enabled ? 'ログイン時の二要素認証を有効にしました' : 'ログイン時の二要素認証を無効にしました');
    } catch (err) {
      onError(toAppError(err).message);
    } finally {
      setLoginMfaSaving(false);
    }
  };

  return (
    <Card variant="brand" padding="lg">
      <CardHeader>
        <Typography variant="h3" color="brand" className="text-xl font-bold">
          二要素認証（2FA）
        </Typography>
      </CardHeader>
      <CardContent className="space-y-5">
        <MfaIntro />

        {recoveryCodes ? (
          <MfaRecoveryCodesPanel codes={recoveryCodes} onAcknowledged={handleRecoveryAcknowledged} />
        ) : null}

        {loading ? (
          <Typography variant="body-sm" color="muted">読み込み中...</Typography>
        ) : loadError ? (
          <Typography variant="caption" className="block text-red-400">
            {loadError}
          </Typography>
        ) : verifiedFactors.length > 0 ? (
          <div className="space-y-4">
            <div className="rounded-lg border border-green-500/30 bg-green-500/10 px-4 py-3">
              <Typography variant="body-sm" className="font-medium text-green-300">
                二要素認証は有効です
              </Typography>
              <Typography variant="caption" color="muted" className="mt-1 block">
                {loginMfaRequired
                  ? '次回ログイン時、パスワード（または Google）のあとに認証アプリの 6 桁コードが求められます（iPhone は「パスワード」App、Android は Authenticator 等）。'
                  : 'ログイン時の二要素認証はオフです。パスワード変更・アカウント削除などの重要操作では引き続きコードが必要です。'}
              </Typography>
            </div>

            <div className="rounded-lg border border-brand-primary/20 bg-brand-secondary-dark/40 p-4 space-y-3">
              <Typography variant="body-sm" className="font-medium">
                リカバリーコード
              </Typography>
              <Typography variant="caption" color="muted" className="block">
                認証アプリにアクセスできないとき、ログイン画面から 1 回使いのコードで復旧できます。
                {recoveryRemaining !== null ? ` 残り ${recoveryRemaining} 件` : ''}
              </Typography>
              {!showRegenerateForm ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowRegenerateForm(true)}
                >
                  新しいリカバリーコードを発行
                </Button>
              ) : (
                <form onSubmit={(e) => void handleRegenerate(e)} className="space-y-3">
                  <Typography variant="caption" color="muted" className="block">
                    発行すると既存のリカバリーコードはすべて無効になります。認証アプリの 6 桁コードで確認してください。
                  </Typography>
                  <input
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    value={regenerateCode}
                    onChange={(e) => setRegenerateCode(e.target.value)}
                    placeholder="6桁の認証コード"
                    className="w-full rounded-lg border-2 border-brand-primary/30 bg-brand-secondary-dark px-4 py-3 text-[var(--text-primary)]"
                  />
                  <div className="flex flex-wrap gap-2">
                    <Button type="submit" variant="brand" size="sm" disabled={regenerating}>
                      {regenerating ? '発行中...' : '発行する'}
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      disabled={regenerating}
                      onClick={() => {
                        setShowRegenerateForm(false);
                        setRegenerateCode('');
                      }}
                    >
                      キャンセル
                    </Button>
                  </div>
                </form>
              )}
            </div>

            <div className="rounded-lg border border-brand-primary/20 bg-brand-secondary-dark/40 p-4 space-y-3">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <Typography variant="body-sm" className="font-medium">
                    ログイン時に二要素認証を要求
                  </Typography>
                  <Typography variant="caption" color="muted" className="mt-1 block">
                    オフにするとログインはパスワード（または Google）のみになります。重要操作の確認は引き続き必要です。
                  </Typography>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={loginMfaRequired}
                  disabled={loginMfaSaving}
                  onClick={() => void handleLoginMfaToggle(!loginMfaRequired)}
                  className={`relative inline-flex h-7 w-12 shrink-0 rounded-full border transition-colors ${
                    loginMfaRequired
                      ? 'border-brand-primary bg-brand-primary/80'
                      : 'border-brand-primary/30 bg-brand-secondary-dark'
                  } ${loginMfaSaving ? 'opacity-60' : ''}`}
                >
                  <span
                    className={`absolute top-0.5 h-6 w-6 rounded-full bg-white shadow transition-transform ${
                      loginMfaRequired ? 'translate-x-5' : 'translate-x-0.5'
                    }`}
                  />
                </button>
              </div>
              {!loginMfaRequired ? (
                <Typography variant="caption" className="block text-amber-300/90">
                  ログイン時の保護が弱くなります。共有 PC や公共 Wi‑Fi ではオンを推奨します。
                </Typography>
              ) : null}
            </div>

            {!showUnenrollForm ? (
              <Button
                type="button"
                variant="ghost"
                className="!text-red-400 hover:!bg-red-500/10"
                onClick={() => setShowUnenrollForm(true)}
              >
                二要素認証を解除
              </Button>
            ) : (
              <form onSubmit={(e) => void handleUnenroll(e)} className="space-y-3 rounded-lg border border-red-500/30 p-4">
                <Typography variant="body-sm" color="muted">
                  安全のため、認証アプリに表示されている 6 桁コードを入力して解除してください。
                </Typography>
                <input
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  value={unenrollCode}
                  onChange={(e) => setUnenrollCode(e.target.value)}
                  placeholder="6桁の認証コード"
                  className="w-full rounded-lg border-2 border-red-500/30 bg-brand-secondary-dark px-4 py-3 text-[var(--text-primary)]"
                />
                <div className="flex flex-wrap gap-2">
                  <Button type="submit" variant="ghost" disabled={unenrolling} className="!text-red-400 hover:!bg-red-500/10">
                    {unenrolling ? '解除中...' : '解除を確定'}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    disabled={unenrolling}
                    onClick={() => {
                      setShowUnenrollForm(false);
                      setUnenrollCode('');
                    }}
                  >
                    キャンセル
                  </Button>
                </div>
              </form>
            )}
          </div>
        ) : (
          <>
            {!qrCode ? (
              <Button type="button" variant="brand" disabled={enrolling} onClick={() => void handleStartEnroll()}>
                {enrolling ? '準備中...' : '二要素認証を設定'}
              </Button>
            ) : (
              <form onSubmit={(e) => void handleVerifyEnroll(e)} className="space-y-4">
                {qrCode ? (
                  <div
                    className="rounded-lg border border-brand-primary/20 bg-white p-4 inline-block"
                    dangerouslySetInnerHTML={{ __html: qrCode }}
                  />
                ) : null}
                <MfaEnrollHint />
                <input
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  value={verifyCode}
                  onChange={(e) => setVerifyCode(e.target.value)}
                  placeholder="6桁の認証コード"
                  className="w-full rounded-lg border-2 border-brand-primary/30 bg-brand-secondary-dark px-4 py-3 text-[var(--text-primary)]"
                />
                <Button type="submit" variant="brand" disabled={verifying}>
                  {verifying ? '確認中...' : '有効化'}
                </Button>
              </form>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

const MfaEnrollHint: React.FC = () => (
  <div className="space-y-2 rounded-lg border border-brand-primary/15 bg-brand-secondary-dark/30 p-3">
    <Typography variant="caption" color="muted" className="block leading-relaxed">
      QR コードを読み取ってください。有効化後に <strong className="font-semibold text-[var(--text-primary)]">リカバリーコード 10 件</strong> が表示されます（再表示不可）。
    </Typography>
    <Typography variant="caption" color="muted" className="block leading-relaxed">
      <strong className="font-semibold text-[var(--text-primary)]">iPhone:</strong> カメラまたは「パスワード」App に保存されます。
      <br />
      <strong className="font-semibold text-[var(--text-primary)]">Android:</strong> Google Authenticator 等の認証アプリに保存されます。
      <br />
      6 桁コードは <strong className="font-semibold text-[var(--text-primary)]">メールでは届きません</strong>。
    </Typography>
  </div>
);

const MfaIntro: React.FC = () => (
  <div className="space-y-3 rounded-lg border border-brand-primary/15 bg-brand-secondary-dark/30 p-4">
    <Typography variant="body-sm" color="muted" className="leading-relaxed">
      二要素認証（2FA）とは、ログイン時に「パスワードなどの知識」と「認証アプリの 6 桁コード」の
      <strong className="font-semibold text-[var(--text-primary)]"> 2 つ</strong>
      を組み合わせて本人確認する仕組みです。パスワードだけよりアカウント乗っ取りを防ぎやすくなります。
    </Typography>
    <div>
      <Typography variant="body-sm" className="mb-2 font-medium">
        有効にすると得られること
      </Typography>
      <ul className="list-disc space-y-1 pl-5 text-sm text-[var(--text-muted)]">
        {MFA_BENEFITS.map((benefit) => (
          <li key={benefit}>{benefit}</li>
        ))}
      </ul>
    </div>
  </div>
);
