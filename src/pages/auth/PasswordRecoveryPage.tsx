import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { mapAuthErrorToMessage } from '../../auth/authErrorMessages';
import { clearPasswordRecoveryPending, isPasswordRecoveryActive } from '../../auth/passwordRecovery';
import { Button } from '../../components/ui';
import { useAuthStore } from '../../stores/authStore';
import { toAppError } from '../../types/error';
import { AuthAlert } from './components/AuthAlert';
import { AuthInput } from './components/AuthInput';
import { AuthLayout } from './components/AuthLayout';
import { useAuthCallback } from './hooks/useAuthCallback';

const PasswordRecoveryPage: React.FC = () => {
  const loading = useAuthStore((state) => state.loading);
  const session = useAuthStore((state) => state.session);
  const updatePasswordFromRecovery = useAuthStore((state) => state.updatePasswordFromRecovery);

  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useAuthCallback({
    onError: (message) => setError(message),
  });

  useEffect(() => {
    if (!isPasswordRecoveryActive() && !session) {
      navigate('/auth?mode=reset', { replace: true });
    }
  }, [navigate, session]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!password) {
      setError('新しいパスワードを入力してください');
      return;
    }

    if (password.length < 8) {
      setError('パスワードは8文字以上にしてください');
      return;
    }

    if (password !== confirmPassword) {
      setError('パスワードと確認用パスワードが一致しません');
      return;
    }

    try {
      const { error: updateError } = await updatePasswordFromRecovery(password);
      if (updateError) {
        setError(mapAuthErrorToMessage(updateError, 'パスワードの更新に失敗しました。リンクの有効期限が切れている可能性があります。'));
        return;
      }

      clearPasswordRecoveryPending();
      setSuccess('パスワードを更新しました。ホームへ移動します...');
      setPassword('');
      setConfirmPassword('');
      window.setTimeout(() => {
        navigate('/', { replace: true });
      }, 1500);
    } catch (err: unknown) {
      setError(toAppError(err).message || 'パスワード更新処理中にエラーが発生しました。');
    }
  }, [confirmPassword, navigate, password, updatePasswordFromRecovery]);

  return (
    <AuthLayout title="新しいパスワードを設定">
      {error && <AuthAlert variant="error">{error}</AuthAlert>}
      {success && <AuthAlert variant="success">{success}</AuthAlert>}

      <p className="mb-4 text-sm text-[var(--text-muted)]">
        メールのリンクから開いています。新しいパスワードを入力して保存してください。
      </p>

      <form onSubmit={handleSubmit} autoComplete="off" data-lpignore="true" data-1p-ignore="true">
        <AuthInput
          label="新しいパスワード"
          type="password"
          id="recovery-new-password"
          name="recovery-new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="new-password"
          data-lpignore="true"
          data-1p-ignore="true"
        />

        <AuthInput
          label="新しいパスワード（確認）"
          type="password"
          id="recovery-confirm-password"
          name="recovery-confirm-password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          autoComplete="new-password"
          data-lpignore="true"
          data-1p-ignore="true"
        />

        <Button type="submit" variant="brand" size="md" disabled={loading || !session} className="w-full">
          {loading ? '更新中...' : 'パスワードを保存'}
        </Button>

        {!session && !loading && (
          <p className="mt-4 text-sm text-center text-yellow-300">
            リンクを検証しています。表示が変わらない場合は、メールのリンクを再度開いてください。
          </p>
        )}
      </form>
    </AuthLayout>
  );
};

export default PasswordRecoveryPage;
