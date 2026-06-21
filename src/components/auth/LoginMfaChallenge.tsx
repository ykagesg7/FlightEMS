import React, { useCallback, useState } from 'react';
import { verifyMfaFactorCode } from '../../auth/mfaAuth';
import { toAppError } from '../../types/error';
import { consumeMfaRecoveryCode } from '../../utils/mfaRecoveryCodesApi';
import supabase from '../../utils/supabase';
import { useAuthStore } from '../../stores/authStore';
import { Button } from '../ui';
import { Typography } from '../ui/Typography';
import { AuthTextLink } from '../../pages/auth/components/AuthTextLink';
import { MfaCodeField } from './MfaCodeField';

interface LoginMfaChallengeProps {
  factorId: string;
  onVerified: () => void;
  onError: (message: string) => void;
  onRecoveryUsed?: () => void;
}

type ChallengeMode = 'totp' | 'recovery';

export const LoginMfaChallenge: React.FC<LoginMfaChallengeProps> = ({
  factorId,
  onVerified,
  onError,
  onRecoveryUsed,
}) => {
  const refreshSession = useAuthStore((state) => state.refreshSession);
  const [mode, setMode] = useState<ChallengeMode>('totp');
  const [code, setCode] = useState('');
  const [recoveryCode, setRecoveryCode] = useState('');
  const [verifying, setVerifying] = useState(false);

  const handleTotpSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) {
      onError('認証コードを入力してください');
      return;
    }

    setVerifying(true);
    try {
      const { error } = await verifyMfaFactorCode(factorId, code);
      if (error) {
        onError(error.message || '認証コードの確認に失敗しました');
        return;
      }

      await supabase.auth.refreshSession();
      await refreshSession();
      onVerified();
    } catch (err) {
      onError(toAppError(err).message);
    } finally {
      setVerifying(false);
    }
  }, [code, factorId, onError, onVerified, refreshSession]);

  const handleRecoverySubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recoveryCode.trim()) {
      onError('リカバリーコードを入力してください');
      return;
    }

    setVerifying(true);
    try {
      const { error } = await consumeMfaRecoveryCode(recoveryCode);
      if (error) {
        onError(error);
        return;
      }

      await supabase.auth.refreshSession();
      await refreshSession();
      onRecoveryUsed?.();
      onVerified();
    } catch (err) {
      onError(toAppError(err).message);
    } finally {
      setVerifying(false);
    }
  }, [onError, onRecoveryUsed, onVerified, recoveryCode, refreshSession]);

  if (mode === 'recovery') {
    return (
      <form onSubmit={(e) => void handleRecoverySubmit(e)} className="space-y-4">
        <Typography variant="body-sm" color="muted" className="leading-relaxed">
          2FA 有効化時に保存したリカバリーコード（例: ABCD-EF12）を 1 つ入力してください。
          使用後は二要素認証が解除され、再設定が必要になります。
        </Typography>
        <div>
          <label htmlFor="login-recovery-code" className="mb-2 block text-sm font-medium text-[var(--text-primary)]">
            リカバリーコード
          </label>
          <input
            id="login-recovery-code"
            type="text"
            autoComplete="off"
            value={recoveryCode}
            disabled={verifying}
            onChange={(e) => setRecoveryCode(e.target.value)}
            placeholder="XXXX-XXXX"
            className="w-full rounded-lg border-2 border-brand-primary/30 bg-brand-secondary-dark px-4 py-3 font-mono text-[var(--text-primary)] focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/50"
          />
        </div>
        <Button type="submit" variant="brand" size="md" disabled={verifying} className="w-full">
          {verifying ? '確認中...' : 'リカバリーコードでログイン'}
        </Button>
        <p className="text-center text-sm text-[var(--text-muted)]">
          <AuthTextLink onClick={() => setMode('totp')}>
            認証アプリのコードに戻る
          </AuthTextLink>
        </p>
      </form>
    );
  }

  return (
    <form onSubmit={(e) => void handleTotpSubmit(e)} className="space-y-4">
      <Typography variant="body-sm" color="muted" className="leading-relaxed">
        二要素認証が有効です。認証アプリに表示されている 6 桁コードを入力してください。
        <strong className="font-semibold text-[var(--text-primary)]"> メールでは届きません。</strong>
      </Typography>
      <Typography variant="caption" color="muted" className="block leading-relaxed">
        iPhone: 「パスワード」App ／ Android: Google Authenticator 等
      </Typography>
      <MfaCodeField
        id="login-mfa-code"
        value={code}
        onChange={setCode}
        disabled={verifying}
      />
      <Button type="submit" variant="brand" size="md" disabled={verifying} className="w-full">
        {verifying ? '確認中...' : 'ログインを完了'}
      </Button>
      <p className="text-center text-sm text-[var(--text-muted)]">
        <AuthTextLink onClick={() => setMode('recovery')}>
          認証アプリにアクセスできない
        </AuthTextLink>
      </p>
    </form>
  );
};
