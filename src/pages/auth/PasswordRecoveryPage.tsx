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
import { AuthTextLink } from './components/AuthTextLink';
import { useAuthCallback } from './hooks/useAuthCallback';

/** リンク検証がこの時間内に終わらなければ、再送・中断の導線を出す */
const LINK_VERIFY_TIMEOUT_MS = 8000;

const PasswordRecoveryPage: React.FC = () => {
  const loading = useAuthStore((state) => state.loading);
  const session = useAuthStore((state) => state.session);
  const updatePasswordFromRecovery = useAuthStore((state) => state.updatePasswordFromRecovery);

  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [linkVerifyTimedOut, setLinkVerifyTimedOut] = useState(false);

  useAuthCallback({
    onError: (message) => setError(message),
  });

  useEffect(() => {
    if (!isPasswordRecoveryActive() && !session) {
      navigate('/auth?mode=reset', { replace: true });
    }
  }, [navigate, session]);

  useEffect(() => {
    if (session) {
      setLinkVerifyTimedOut(false);
      return;
    }
    const timer = window.setTimeout(() => setLinkVerifyTimedOut(true), LINK_VERIFY_TIMEOUT_MS);
    return () => window.clearTimeout(timer);
  }, [session]);

  /** リセットをやめて通常のログインに戻る（フラグを残すとログイン画面に入れない） */
  const cancelRecovery = useCallback(() => {
    clearPasswordRecoveryPending();
    navigate('/auth', { replace: true });
  }, [navigate]);

  const requestNewLink = useCallback(() => {
    clearPasswordRecoveryPending();
    navigate('/auth?mode=reset', { replace: true });
  }, [navigate]);

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

        {!session && !loading && !linkVerifyTimedOut && (
          <p className="mt-4 text-sm text-center text-yellow-300">
            リンクを検証しています。表示が変わらない場合は、メールのリンクを再度開いてください。
          </p>
        )}

        {!session && !loading && linkVerifyTimedOut && (
          <AuthAlert variant="timeout" className="mt-4">
            リンクを検証できませんでした。有効期限（既定 1 時間）が切れているか、リンクが一度使用済みの可能性があります。
          </AuthAlert>
        )}
      </form>

      <div className="mt-4 flex flex-wrap justify-center gap-4 text-sm text-[var(--text-muted)]">
        <AuthTextLink onClick={requestNewLink}>リセットメールを再送する</AuthTextLink>
        <AuthTextLink onClick={cancelRecovery}>リセットをやめてログインする</AuthTextLink>
      </div>
    </AuthLayout>
  );
};

export default PasswordRecoveryPage;
