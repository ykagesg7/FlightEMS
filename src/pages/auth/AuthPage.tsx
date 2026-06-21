import React, { useCallback, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { mapAuthErrorToMessage } from '../../auth/authErrorMessages';
import { isPasswordRecoveryActive } from '../../auth/passwordRecovery';
import { getPostAuthPath } from '../../auth/profileSetup';
import { EmailDeliveryHint } from '../../components/auth/EmailDeliveryHint';
import { TurnstileWidget } from '../../components/auth/TurnstileWidget';
import { Button } from '../../components/ui';
import { useAuthStore } from '../../stores/authStore';
import { toAppError } from '../../types/error';
import { bypassEmailVerification } from '../../utils/supabase';
import { AuthAlert } from './components/AuthAlert';
import { AuthDivider } from './components/AuthDivider';
import { AuthInput } from './components/AuthInput';
import { AuthLayout } from './components/AuthLayout';
import { AuthTextLink } from './components/AuthTextLink';
import { GoogleSignInButton } from './components/GoogleSignInButton';
import { MagicLinkForm } from './components/MagicLinkForm';
import { useAuthCallback } from './hooks/useAuthCallback';

interface LocationState {
  from?: {
    pathname: string;
  };
  timeout?: boolean;
}

type PendingEmailKind = 'signup' | 'magic-link' | 'password-reset';

const AuthPage: React.FC = () => {
  const user = useAuthStore((state) => state.user);
  const profile = useAuthStore((state) => state.profile);
  const loading = useAuthStore((state) => state.loading);
  const initialized = useAuthStore((state) => state.initialized);
  const signIn = useAuthStore((state) => state.signIn);
  const signUp = useAuthStore((state) => state.signUp);
  const resetPassword = useAuthStore((state) => state.resetPassword);
  const session = useAuthStore((state) => state.session);
  const setLoading = useAuthStore((state) => state.setLoading);

  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as LocationState;

  const params = new URLSearchParams(location.search);
  const initialMode = params.get('mode');
  const [isLogin, setIsLogin] = useState(initialMode === 'signup' ? false : true);
  const [isForgotPassword, setIsForgotPassword] = useState(initialMode === 'reset');
  const [showMagicLink, setShowMagicLink] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [signupCaptchaToken, setSignupCaptchaToken] = useState<string | null>(null);
  const [resetCaptchaToken, setResetCaptchaToken] = useState<string | null>(null);

  const [pendingEmailKind, setPendingEmailKind] = useState<PendingEmailKind | null>(null);
  const [verificationLink, setVerificationLink] = useState<string | null>(null);
  const [isDevelopment] = useState(process.env.NODE_ENV === 'development' || window.location.hostname === 'localhost');

  const showTimeoutBanner = state?.timeout || params.get('timeout') === '1';

  useAuthCallback({
    onError: (message) => setError(message),
  });

  useEffect(() => {
    const p = new URLSearchParams(location.search);
    const m = p.get('mode');
    const onRecoveryPath = location.pathname.endsWith('/auth/recovery');
    if ((m === 'recovery' || isPasswordRecoveryActive()) && !onRecoveryPath) {
      navigate(`/auth/recovery${location.search}${location.hash}`, { replace: true });
      return;
    }
    if (m === 'signup') {
      setIsLogin(false);
      setIsForgotPassword(false);
      setShowMagicLink(false);
    } else if (m === 'reset') {
      setIsForgotPassword(true);
    }
  }, [location.pathname, location.search, location.hash, navigate]);

  useEffect(() => {
    if (!user || !session || isPasswordRecoveryActive() || !initialized) {
      return;
    }
    if (profile === null) {
      void useAuthStore.getState().fetchProfile(user.id);
      return;
    }
    const from = state?.from?.pathname || '/';
    navigate(getPostAuthPath(profile, from), { replace: true });
  }, [user, session, profile, initialized, navigate, state]);

  const toggleForm = () => {
    setIsLogin(!isLogin);
    setIsForgotPassword(false);
    setShowMagicLink(false);
    setError(null);
    setSuccess(null);
    setPendingEmailKind(null);
    setVerificationLink(null);
  };

  const toggleForgotPassword = () => {
    setIsForgotPassword(!isForgotPassword);
    setShowMagicLink(false);
    setError(null);
    setSuccess(null);
  };

  const handleVerificationBypass = useCallback(async () => {
    if (!email) {
      setError('メールアドレスが指定されていません');
      return;
    }

    try {
      setLoading(true);
      const result = await bypassEmailVerification(email);
      setLoading(false);

      if (result.success && result.verificationLink) {
        setVerificationLink(result.verificationLink);
        setSuccess('開発環境の検証リンクが生成されました。下記リンクをクリックするか、コンソールに表示されたリンクを使用してください。');
      } else {
        setError(`検証リンクの生成に失敗しました: ${result.error?.message || '不明なエラー'}`);
      }
    } catch (err: unknown) {
      setLoading(false);
      const appError = toAppError(err);
      setError(`検証バイパス中にエラーが発生しました: ${appError.message || '不明なエラー'}`);
    }
  }, [email, setLoading]);

  const handleLoginSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!email || !password) {
      setError('メールアドレスとパスワードを入力してください');
      return;
    }

    try {
      const { error: signInError } = await signIn(email, password);
      if (signInError) {
        setError(mapAuthErrorToMessage(signInError, 'ログインに失敗しました。認証情報を確認してください。'));
      } else {
        setSuccess('ログインに成功しました。リダイレクトします...');
      }
    } catch {
      setError('ログイン処理中にエラーが発生しました。');
    }
  }, [email, password, signIn]);

  const handleSignupSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setPendingEmailKind(null);
    setVerificationLink(null);

    if (!email || !password || !username) {
      setError('すべての必須項目を入力してください');
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
      const { error: signUpError, emailConfirmRequired } = await signUp(
        email,
        password,
        username,
        signupCaptchaToken ?? undefined,
      );

      if (signUpError) {
        setError(mapAuthErrorToMessage(signUpError, 'アカウント登録に失敗しました。'));
      } else if (emailConfirmRequired) {
        setPendingEmailKind('signup');
        setSuccess('アカウント登録に成功しました。メールの確認をお願いします。');
      } else {
        setSuccess('アカウント登録に成功しました。リダイレクトします...');
      }
    } catch {
      setError('アカウント登録処理中にエラーが発生しました。');
    }
  }, [confirmPassword, email, password, signUp, signupCaptchaToken, username]);

  const handleResetPasswordSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!email) {
      setError('メールアドレスを入力してください');
      return;
    }

    try {
      const { error: resetError } = await resetPassword(email, resetCaptchaToken ?? undefined);
      if (resetError) {
        setError(mapAuthErrorToMessage(resetError, 'パスワードリセットに失敗しました。メールアドレスを確認してください。'));
      } else {
        setPendingEmailKind('password-reset');
        setSuccess('パスワードリセット手順をメールで送信しました。');
      }
    } catch {
      setError('パスワードリセット処理中にエラーが発生しました。');
    }
  }, [email, resetCaptchaToken, resetPassword]);

  const handleMagicLinkSent = useCallback((sentEmail: string) => {
    setEmail(sentEmail);
    setPendingEmailKind('magic-link');
    setShowMagicLink(false);
    setError(null);
    setSuccess('ログインリンクをメールで送信しました。メールをご確認ください。');
  }, []);

  if (pendingEmailKind) {
    const isMagicLink = pendingEmailKind === 'magic-link';
    const isPasswordReset = pendingEmailKind === 'password-reset';
    const title = isPasswordReset
      ? 'パスワードリセット'
      : isMagicLink
        ? 'メールを確認'
        : 'メール検証';

    return (
      <AuthLayout title={title}>
        {error && <AuthAlert variant="error">{error}</AuthAlert>}
        {success && <AuthAlert variant="success">{success}</AuthAlert>}

        <div className="mb-4 p-4 border border-brand-primary/30 rounded bg-brand-secondary-dark">
          <p className="mb-3 text-[var(--text-primary)]">
            <strong>メールアドレス:</strong> {email}
          </p>
          <p className="mb-3 text-[var(--text-muted)]">
            {isPasswordReset
              ? '上記のメールアドレスにパスワード再設定リンクを送信しました。メール内のリンクから新しいパスワードを設定してください。'
              : isMagicLink
                ? '上記のメールアドレスにログインリンクを送信しました。メール内のリンクをクリックしてログインを完了してください。'
                : '上記のメールアドレスに確認リンクを送信しました。メールを確認して認証を完了してください。'}
          </p>
          <EmailDeliveryHint showSearchHint={isPasswordReset} />
        </div>

        {!isMagicLink && isDevelopment && (
          <div className="mt-4">
            <Button
              variant="brand"
              size="md"
              onClick={handleVerificationBypass}
              disabled={loading}
              className="w-full mb-3"
            >
              {loading ? '処理中...' : '開発環境: 検証リンクを生成'}
            </Button>

            {verificationLink && (
              <div className="mt-2 p-3 bg-brand-primary/10 border border-brand-primary/30 text-brand-primary-light rounded text-sm">
                <p className="mb-2 font-bold">開発環境検証リンク:</p>
                <a
                  href={verificationLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-brand-primary underline break-all hover:text-brand-primary-light"
                >
                  {verificationLink}
                </a>
              </div>
            )}
          </div>
        )}

        <div className="mt-4 text-center">
          <AuthTextLink onClick={toggleForm}>ログインページに戻る</AuthTextLink>
        </div>
      </AuthLayout>
    );
  }

  if (isForgotPassword) {
    return (
      <AuthLayout title="パスワードリセット">
        {error && <AuthAlert variant="error">{error}</AuthAlert>}
        {success && <AuthAlert variant="success">{success}</AuthAlert>}

        <form onSubmit={handleResetPasswordSubmit}>
          <AuthInput
            label="メールアドレス"
            type="email"
            id="reset-email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
          />

          <TurnstileWidget
            className="mb-4 flex justify-center"
            onVerify={setResetCaptchaToken}
            onExpire={() => setResetCaptchaToken(null)}
          />

          <Button type="submit" variant="brand" size="md" disabled={loading} className="w-full">
            {loading ? 'リセット手順を送信中...' : 'リセット手順を送信'}
          </Button>

          <p className="mt-4 text-sm text-center text-[var(--text-muted)]">
            <AuthTextLink onClick={toggleForgotPassword}>ログインに戻る</AuthTextLink>
          </p>
        </form>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title={isLogin ? 'ログイン' : 'アカウント登録'}>
      {showTimeoutBanner && (
        <AuthAlert variant="timeout">認証がタイムアウトしました。再度ログインしてください。</AuthAlert>
      )}
      {error && <AuthAlert variant="error">{error}</AuthAlert>}
      {success && <AuthAlert variant="success">{success}</AuthAlert>}

      <div className="mb-4">
        <GoogleSignInButton onError={setError} />
      </div>

      <AuthDivider />

      {isLogin && showMagicLink ? (
        <MagicLinkForm
          onSent={handleMagicLinkSent}
          onError={setError}
          onCancel={() => setShowMagicLink(false)}
        />
      ) : (
        <form onSubmit={isLogin ? handleLoginSubmit : handleSignupSubmit}>
          <AuthInput
            label="メールアドレス"
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
          />

          {!isLogin && (
            <AuthInput
              label="ユーザー名"
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
            />
          )}

          <AuthInput
            label="パスワード"
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete={isLogin ? 'current-password' : 'new-password'}
          />

          {!isLogin && (
            <>
              <AuthInput
                label="パスワード（確認）"
                type="password"
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                autoComplete="new-password"
              />

              <TurnstileWidget
                className="mb-4 flex justify-center"
                onVerify={setSignupCaptchaToken}
                onExpire={() => setSignupCaptchaToken(null)}
              />
            </>
          )}

          <Button type="submit" variant="brand" size="md" disabled={loading} className="w-full">
            {loading
              ? (isLogin ? 'ログイン中...' : '登録中...')
              : (isLogin ? 'ログイン' : '登録')}
          </Button>

          {isLogin && (
            <p className="mt-3 text-sm text-center text-[var(--text-muted)]">
              <AuthTextLink onClick={toggleForgotPassword}>パスワードを忘れた場合</AuthTextLink>
              <span className="mx-2 text-[var(--text-muted)]">|</span>
              <AuthTextLink onClick={() => setShowMagicLink(true)}>メールリンクでログイン</AuthTextLink>
            </p>
          )}
        </form>
      )}

      <p className="mt-4 text-sm text-center text-[var(--text-muted)]">
        {isLogin ? 'アカウントをお持ちでない場合' : 'すでにアカウントをお持ちの場合'}
        <AuthTextLink onClick={toggleForm} className="ml-1">
          {isLogin ? '登録' : 'ログイン'}
        </AuthTextLink>
      </p>
    </AuthLayout>
  );
};

export default AuthPage;
