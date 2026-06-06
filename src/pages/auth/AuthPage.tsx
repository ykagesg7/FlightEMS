import React, { useCallback, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { mapAuthErrorToMessage } from '../../auth/authErrorMessages';
import { TurnstileWidget } from '../../components/auth/TurnstileWidget';
import { Button, Card, CardContent, CardHeader, CardTitle, Typography } from '../../components/ui';
import { useAuthStore } from '../../stores/authStore';
import { toAppError } from '../../types/error';
import { bypassEmailVerification } from '../../utils/supabase';
import { GoogleSignInButton } from './components/GoogleSignInButton';
import { MagicLinkForm } from './components/MagicLinkForm';
import { useAuthCallback } from './hooks/useAuthCallback';

interface LocationState {
  from?: {
    pathname: string;
  };
  timeout?: boolean;
}

type LoginMethod = 'password' | 'magic-link';
type PendingEmailKind = 'signup' | 'magic-link';

const AuthPage: React.FC = () => {
  const user = useAuthStore(state => state.user);
  const loading = useAuthStore(state => state.loading);
  const signIn = useAuthStore(state => state.signIn);
  const signUp = useAuthStore(state => state.signUp);
  const resetPassword = useAuthStore(state => state.resetPassword);
  const updatePasswordFromRecovery = useAuthStore(state => state.updatePasswordFromRecovery);
  const passwordRecoveryPending = useAuthStore(state => state.passwordRecoveryPending);
  const setPasswordRecoveryPending = useAuthStore(state => state.setPasswordRecoveryPending);
  const session = useAuthStore(state => state.session);
  const setLoading = useAuthStore(state => state.setLoading);

  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as LocationState;

  const params = new URLSearchParams(location.search);
  const initialMode = params.get('mode');
  const [isLogin, setIsLogin] = useState(initialMode === 'signup' ? false : true);
  const [isForgotPassword, setIsForgotPassword] = useState(initialMode === 'reset');
  const [loginMethod, setLoginMethod] = useState<LoginMethod>('password');
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
    if (m === 'signup') {
      setIsLogin(false);
      setIsForgotPassword(false);
    } else if (m === 'reset') {
      setIsForgotPassword(true);
    } else if (m === 'recovery') {
      setPasswordRecoveryPending(true);
    }
  }, [location.search, setPasswordRecoveryPending]);

  useEffect(() => {
    if (user && session && !passwordRecoveryPending) {
      const from = state?.from?.pathname || '/';
      navigate(from, { replace: true });
    }
  }, [user, session, passwordRecoveryPending, navigate, state]);

  const toggleForm = () => {
    setIsLogin(!isLogin);
    setIsForgotPassword(false);
    setLoginMethod('password');
    setError(null);
    setSuccess(null);
    setPendingEmailKind(null);
    setVerificationLink(null);
  };

  const toggleForgotPassword = () => {
    setIsForgotPassword(!isForgotPassword);
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
        console.error('ログイン失敗', signInError);
        setError(mapAuthErrorToMessage(signInError, 'ログインに失敗しました。認証情報を確認してください。'));
      } else {
        setSuccess('ログインに成功しました。リダイレクトします...');
      }
    } catch (err: unknown) {
      const appError = toAppError(err);
      console.error('ログイン例外', appError);
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
        console.error('アカウント登録失敗', signUpError);
        setError(mapAuthErrorToMessage(signUpError, 'アカウント登録に失敗しました。'));
      } else if (emailConfirmRequired) {
        setPendingEmailKind('signup');
        setSuccess('アカウント登録に成功しました。メールの確認をお願いします。');
      } else {
        setSuccess('アカウント登録に成功しました。リダイレクトします...');
      }
    } catch (err: unknown) {
      const appError = toAppError(err);
      console.error('アカウント登録例外', appError);
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
        console.error('パスワードリセット失敗', resetError);
        setError(mapAuthErrorToMessage(resetError, 'パスワードリセットに失敗しました。メールアドレスを確認してください。'));
      } else {
        setSuccess('パスワードリセット手順をメールで送信しました。メールをご確認ください。');
      }
    } catch (err: unknown) {
      const appError = toAppError(err);
      console.error('パスワードリセット例外', appError);
      setError('パスワードリセット処理中にエラーが発生しました。');
    }
  }, [email, resetCaptchaToken, resetPassword]);

  const handleSetNewPasswordSubmit = useCallback(async (e: React.FormEvent) => {
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
        console.error('パスワード更新失敗', updateError);
        setError(mapAuthErrorToMessage(updateError, 'パスワードの更新に失敗しました。リンクの有効期限が切れている可能性があります。'));
      } else {
        setSuccess('パスワードを更新しました。ホームへ移動します...');
        setPassword('');
        setConfirmPassword('');
        setTimeout(() => {
          navigate('/', { replace: true });
        }, 1500);
      }
    } catch (err: unknown) {
      const appError = toAppError(err);
      console.error('パスワード更新例外', appError);
      setError('パスワード更新処理中にエラーが発生しました。');
    }
  }, [confirmPassword, navigate, password, updatePasswordFromRecovery]);

  const handleMagicLinkSent = useCallback((sentEmail: string) => {
    setEmail(sentEmail);
    setPendingEmailKind('magic-link');
    setError(null);
    setSuccess('ログインリンクをメールで送信しました。メールをご確認ください。');
  }, []);

  const renderEmailPending = () => {
    const isMagicLink = pendingEmailKind === 'magic-link';
    return (
      <Card variant="brand" padding="lg" className="max-w-md w-full border-brand-primary/30">
        <CardHeader>
          <CardTitle>
            <Typography variant="h2" color="brand">
              {isMagicLink ? 'メールを確認' : 'メール検証'}
            </Typography>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 text-red-300 rounded">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-4 p-3 bg-green-500/20 border border-green-500/50 text-green-300 rounded">
              {success}
            </div>
          )}

          <div className="mb-4 p-4 border border-whiskyPapa-yellow/30 rounded bg-whiskyPapa-black-dark">
            <p className="mb-3 text-white">
              <strong>メールアドレス:</strong> {email}
            </p>
            <p className="mb-3 text-gray-300">
              {isMagicLink
                ? '上記のメールアドレスにログインリンクを送信しました。メール内のリンクをクリックしてログインを完了してください。'
                : '上記のメールアドレスに確認リンクを送信しました。メールを確認して認証を完了してください。'}
            </p>
            <p className="text-sm text-gray-400">
              メールが届かない場合、迷惑メールフォルダも確認してください。
            </p>
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
                <div className="mt-2 p-3 bg-blue-500/20 border border-blue-500/50 text-blue-300 rounded text-sm">
                  <p className="mb-2 font-bold">開発環境検証リンク:</p>
                  <a
                    href={verificationLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-whiskyPapa-yellow underline break-all hover:text-whiskyPapa-yellow/80"
                  >
                    {verificationLink}
                  </a>
                </div>
              )}
            </div>
          )}

          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={toggleForm}
              className="text-whiskyPapa-yellow hover:text-whiskyPapa-yellow/80 hover:underline focus:outline-none transition-colors"
            >
              ログインページに戻る
            </button>
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderSetNewPasswordForm = () => (
    <Card variant="brand" padding="lg" className="max-w-md w-full border-brand-primary/30">
      <CardHeader>
        <CardTitle>
          <Typography variant="h2" color="brand">
            新しいパスワードを設定
          </Typography>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 text-red-300 rounded">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 bg-green-500/20 border border-green-500/50 text-green-300 rounded">
            {success}
          </div>
        )}

        <p className="mb-4 text-sm text-gray-300">
          新しいパスワードを入力して保存してください。
        </p>

        <form onSubmit={handleSetNewPasswordSubmit}>
          <div className="mb-4">
            <label htmlFor="new-password" className="block mb-2 text-sm font-medium text-white">
              新しいパスワード
            </label>
            <input
              type="password"
              id="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 rounded-md bg-whiskyPapa-black-dark border border-whiskyPapa-yellow/30 text-white focus:outline-none focus:ring-2 focus:ring-whiskyPapa-yellow/50 focus:border-whiskyPapa-yellow transition-colors"
              autoComplete="new-password"
            />
          </div>

          <div className="mb-4">
            <label htmlFor="new-password-confirm" className="block mb-2 text-sm font-medium text-white">
              新しいパスワード（確認）
            </label>
            <input
              type="password"
              id="new-password-confirm"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-3 py-2 rounded-md bg-whiskyPapa-black-dark border border-whiskyPapa-yellow/30 text-white focus:outline-none focus:ring-2 focus:ring-whiskyPapa-yellow/50 focus:border-whiskyPapa-yellow transition-colors"
              autoComplete="new-password"
            />
          </div>

          <Button type="submit" variant="brand" size="md" disabled={loading || !session} className="w-full">
            {loading ? '更新中...' : 'パスワードを保存'}
          </Button>

          {!session && !loading && (
            <p className="mt-4 text-sm text-center text-yellow-300">
              リンクの検証中です。表示が変わらない場合は、メールのリンクを再度開いてください。
            </p>
          )}
        </form>
      </CardContent>
    </Card>
  );

  const renderForgotPasswordForm = () => (
    <Card variant="brand" padding="lg" className="max-w-md w-full border-brand-primary/30">
      <CardHeader>
        <CardTitle>
          <Typography variant="h2" color="brand">
            パスワードリセット
          </Typography>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 text-red-300 rounded">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 bg-green-500/20 border border-green-500/50 text-green-300 rounded">
            {success}
          </div>
        )}

        <form onSubmit={handleResetPasswordSubmit}>
          <div className="mb-4">
            <label htmlFor="reset-email" className="block mb-2 text-sm font-medium text-white">
              メールアドレス
            </label>
            <input
              type="email"
              id="reset-email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 rounded-md bg-whiskyPapa-black-dark border border-whiskyPapa-yellow/30 text-white focus:outline-none focus:ring-2 focus:ring-whiskyPapa-yellow/50 focus:border-whiskyPapa-yellow transition-colors"
              autoComplete="email"
            />
          </div>

          <TurnstileWidget
            className="mb-4 flex justify-center"
            onVerify={setResetCaptchaToken}
            onExpire={() => setResetCaptchaToken(null)}
          />

          <Button type="submit" variant="brand" size="md" disabled={loading} className="w-full">
            {loading ? 'リセット手順を送信中...' : 'リセット手順を送信'}
          </Button>

          <p className="mt-4 text-sm text-center text-gray-300">
            <button
              type="button"
              onClick={toggleForgotPassword}
              className="text-whiskyPapa-yellow hover:text-whiskyPapa-yellow/80 hover:underline focus:outline-none transition-colors"
            >
              ログインに戻る
            </button>
          </p>
        </form>
      </CardContent>
    </Card>
  );

  const renderLoginMethodTabs = () => (
    <div className="mb-4 flex rounded-md border border-whiskyPapa-yellow/30 overflow-hidden">
      <button
        type="button"
        onClick={() => setLoginMethod('password')}
        className={`flex-1 py-2 text-sm transition-colors ${
          loginMethod === 'password'
            ? 'bg-whiskyPapa-yellow/20 text-whiskyPapa-yellow'
            : 'bg-whiskyPapa-black-dark text-gray-300 hover:text-white'
        }`}
      >
        パスワード
      </button>
      <button
        type="button"
        onClick={() => setLoginMethod('magic-link')}
        className={`flex-1 py-2 text-sm transition-colors ${
          loginMethod === 'magic-link'
            ? 'bg-whiskyPapa-yellow/20 text-whiskyPapa-yellow'
            : 'bg-whiskyPapa-black-dark text-gray-300 hover:text-white'
        }`}
      >
        メールリンク
      </button>
    </div>
  );

  const renderLoginForm = () => (
    <Card variant="brand" padding="lg" className="max-w-md w-full border-brand-primary/30">
      <CardHeader>
        <CardTitle>
          <Typography variant="h2" color="brand">
            {isLogin ? 'ログイン' : 'アカウント登録'}
          </Typography>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {showTimeoutBanner && (
          <div className="mb-4 p-3 bg-yellow-500/20 border border-yellow-500/50 text-yellow-300 rounded">
            認証がタイムアウトしました。再度ログインしてください。
          </div>
        )}

        {error && (
          <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 text-red-300 rounded">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 bg-green-500/20 border border-green-500/50 text-green-300 rounded">
            {success}
          </div>
        )}

        <div className="mb-4">
          <GoogleSignInButton onError={setError} />
        </div>

        <p className="mb-4 text-xs text-center text-gray-400">または</p>

        {isLogin && renderLoginMethodTabs()}

        {isLogin && loginMethod === 'magic-link' ? (
          <MagicLinkForm onSent={handleMagicLinkSent} onError={setError} />
        ) : (
          <form onSubmit={isLogin ? handleLoginSubmit : handleSignupSubmit}>
            <div className="mb-4">
              <label htmlFor="email" className="block mb-2 text-sm font-medium text-white">
                メールアドレス
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 rounded-md bg-whiskyPapa-black-dark border border-whiskyPapa-yellow/30 text-white focus:outline-none focus:ring-2 focus:ring-whiskyPapa-yellow/50 focus:border-whiskyPapa-yellow transition-colors"
                autoComplete="email"
              />
            </div>

            {!isLogin && (
              <div className="mb-4">
                <label htmlFor="username" className="block mb-2 text-sm font-medium text-white">
                  ユーザー名
                </label>
                <input
                  type="text"
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-3 py-2 rounded-md bg-whiskyPapa-black-dark border border-whiskyPapa-yellow/30 text-white focus:outline-none focus:ring-2 focus:ring-whiskyPapa-yellow/50 focus:border-whiskyPapa-yellow transition-colors"
                  autoComplete="username"
                />
              </div>
            )}

            <div className="mb-4">
              <label htmlFor="password" className="block mb-2 text-sm font-medium text-white">
                パスワード
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 rounded-md bg-whiskyPapa-black-dark border border-whiskyPapa-yellow/30 text-white focus:outline-none focus:ring-2 focus:ring-whiskyPapa-yellow/50 focus:border-whiskyPapa-yellow transition-colors"
                autoComplete={isLogin ? 'current-password' : 'new-password'}
              />
            </div>

            {!isLogin && (
              <>
                <div className="mb-4">
                  <label htmlFor="confirmPassword" className="block mb-2 text-sm font-medium text-white">
                    パスワード（確認）
                  </label>
                  <input
                    type="password"
                    id="confirmPassword"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-3 py-2 rounded-md bg-whiskyPapa-black-dark border border-whiskyPapa-yellow/30 text-white focus:outline-none focus:ring-2 focus:ring-whiskyPapa-yellow/50 focus:border-whiskyPapa-yellow transition-colors"
                    autoComplete="new-password"
                  />
                </div>

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
              <p className="mt-2 text-sm text-center text-gray-300">
                <button
                  type="button"
                  onClick={toggleForgotPassword}
                  className="text-whiskyPapa-yellow hover:text-whiskyPapa-yellow/80 hover:underline focus:outline-none transition-colors"
                >
                  パスワードを忘れた場合
                </button>
              </p>
            )}
          </form>
        )}

        <p className="mt-4 text-sm text-center text-gray-300">
          {isLogin ? 'アカウントをお持ちでない場合' : 'すでにアカウントをお持ちの場合'}
          <button
            type="button"
            onClick={toggleForm}
            className="ml-1 text-whiskyPapa-yellow hover:text-whiskyPapa-yellow/80 hover:underline focus:outline-none transition-colors"
          >
            {isLogin ? '登録' : 'ログイン'}
          </button>
        </p>
      </CardContent>
    </Card>
  );

  return (
    <div className="bg-whiskyPapa-black min-h-screen py-16 flex justify-center items-center p-4">
      {passwordRecoveryPending
        ? renderSetNewPasswordForm()
        : pendingEmailKind
          ? renderEmailPending()
          : isForgotPassword
            ? renderForgotPasswordForm()
            : renderLoginForm()}
    </div>
  );
};

export default AuthPage;
