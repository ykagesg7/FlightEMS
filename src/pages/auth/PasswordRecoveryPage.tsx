import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { mapAuthErrorToMessage } from '../../auth/authErrorMessages';
import { clearPasswordRecoveryPending, isPasswordRecoveryActive } from '../../auth/passwordRecovery';
import { Button } from '../../components/ui';
import { useAuthStore } from '../../stores/authStore';
import { toAppError } from '../../types/error';
import { focusFieldById } from './authFieldValidation';
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
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [postSubmitFocus, setPostSubmitFocus] = useState<'alert' | string | null>(null);
  const formErrorAlertRef = useRef<HTMLDivElement>(null);
  const [linkVerifyTimedOut, setLinkVerifyTimedOut] = useState(false);

  const hasFieldLevelErrors = Object.keys(fieldErrors).length > 0;

  const clearFieldError = useCallback((key: string) => {
    setFieldErrors((prev) => {
      if (!prev[key]) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
  }, []);

  useAuthCallback({
    onError: (message) => {
      setFieldErrors({});
      setError(message);
      setPostSubmitFocus('alert');
    },
  });

  useEffect(() => {
    if (!postSubmitFocus) return;
    if (postSubmitFocus === 'alert') {
      formErrorAlertRef.current?.focus();
    } else {
      focusFieldById(postSubmitFocus);
    }
    setPostSubmitFocus(null);
  }, [postSubmitFocus, fieldErrors, error]);

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
    setFieldErrors({});

    if (!password) {
      const nextFieldErrors = { password: '新しいパスワードを入力してください' };
      setFieldErrors(nextFieldErrors);
      setError('新しいパスワードを入力してください');
      setPostSubmitFocus('new-password');
      return;
    }

    if (password.length < 8) {
      const nextFieldErrors = { password: 'パスワードは8文字以上にしてください' };
      setFieldErrors(nextFieldErrors);
      setError('パスワードは8文字以上にしてください');
      setPostSubmitFocus('new-password');
      return;
    }

    if (password !== confirmPassword) {
      const nextFieldErrors = {
        'confirm-password': 'パスワードと確認用パスワードが一致しません',
      };
      setFieldErrors(nextFieldErrors);
      setError('パスワードと確認用パスワードが一致しません');
      setPostSubmitFocus('confirm-password');
      return;
    }

    try {
      const { error: updateError } = await updatePasswordFromRecovery(password);
      if (updateError) {
        setFieldErrors({});
        setError(mapAuthErrorToMessage(updateError, 'パスワードの更新に失敗しました。リンクの有効期限が切れている可能性があります。'));
        setPostSubmitFocus('alert');
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
      setFieldErrors({});
      setError(toAppError(err).message || 'パスワード更新処理中にエラーが発生しました。');
      setPostSubmitFocus('alert');
    }
  }, [confirmPassword, navigate, password, updatePasswordFromRecovery]);

  return (
    <AuthLayout title="新しいパスワードを設定">
      {error && (
        <AuthAlert ref={formErrorAlertRef} variant="error" suppressScreenReader={hasFieldLevelErrors}>
          {error}
        </AuthAlert>
      )}
      {success && <AuthAlert variant="success">{success}</AuthAlert>}

      <p className="mb-4 text-sm text-[var(--text-muted)]">
        メールのリンクから開いています。新しいパスワードを入力して保存してください。
      </p>

      <form onSubmit={handleSubmit}>
        <AuthInput
          label="新しいパスワード"
          type="password"
          id="new-password"
          name="new-password"
          value={password}
          errorMessage={fieldErrors.password}
          onChange={(e) => {
            setPassword(e.target.value);
            clearFieldError('password');
          }}
          autoComplete="new-password"
        />

        <AuthInput
          label="新しいパスワード（確認）"
          type="password"
          id="confirm-password"
          name="new-password"
          value={confirmPassword}
          errorMessage={fieldErrors['confirm-password']}
          onChange={(e) => {
            setConfirmPassword(e.target.value);
            clearFieldError('confirm-password');
          }}
          autoComplete="new-password"
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