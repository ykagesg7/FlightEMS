import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { mapAuthErrorToMessage } from '../../auth/authErrorMessages';
import { describeLastAuthMethod, getLastAuthMethod } from '../../auth/lastAuthMethod';
import { shouldPromptLoginMfa } from '../../auth/mfaAuth';
import { isPasswordRecoveryActive } from '../../auth/passwordRecovery';
import { getPostAuthPath, syncLearnerProfileAfterSignIn } from '../../auth/profileSetup';
import { EmailDeliveryHint } from '../../components/auth/EmailDeliveryHint';
import { LoginMfaChallenge } from '../../components/auth/LoginMfaChallenge';
import { TurnstileWidget } from '../../components/auth/TurnstileWidget';
import { Button } from '../../components/ui';
import { useAuthStore } from '../../stores/authStore';
import { AuthAlert } from './components/AuthAlert';
import { AuthDivider } from './components/AuthDivider';
import { AuthInput } from './components/AuthInput';
import { AuthLayout } from './components/AuthLayout';
import { AuthTextLink } from './components/AuthTextLink';
import { GoogleSignInButton } from './components/GoogleSignInButton';
import { MagicLinkForm } from './components/MagicLinkForm';
import {
  AUTH_LOGIN_FIELD_ORDER,
  AUTH_SIGNUP_FIELD_ORDER,
  firstInvalidFieldId,
  focusFieldById,
} from './authFieldValidation';
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
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [postSubmitFocus, setPostSubmitFocus] = useState<'alert' | string | null>(null);
  const formErrorAlertRef = useRef<HTMLDivElement>(null);
  const [signupCaptchaToken, setSignupCaptchaToken] = useState<string | null>(null);
  const [resetCaptchaToken, setResetCaptchaToken] = useState<string | null>(null);

  const [pendingEmailKind, setPendingEmailKind] = useState<PendingEmailKind | null>(null);
  const [loginMfaFactorId, setLoginMfaFactorId] = useState<string | null>(null);
  const [loginMfaCheckDone, setLoginMfaCheckDone] = useState(false);
  const [profileFetchStalled, setProfileFetchStalled] = useState(false);
  const [lastAuthMethod] = useState(() => getLastAuthMethod());

  const showTimeoutBanner = state?.timeout || params.get('timeout') === '1';
  const mfaRequiredFromQuery = params.get('mfa') === 'required';

  useAuthCallback({
    onError: (message) => {
      setFieldErrors({});
      setError(message);
      setPostSubmitFocus('alert');
    },
  });

  const hasFieldLevelErrors = Object.keys(fieldErrors).length > 0;

  const clearFieldError = useCallback((key: string) => {
    setFieldErrors((prev) => {
      if (!prev[key]) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
  }, []);

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
      setLoginMfaFactorId(null);
      setLoginMfaCheckDone(false);
      return;
    }

    let cancelled = false;
    void (async () => {
      const profileForNav = await syncLearnerProfileAfterSignIn(user.id);
      if (cancelled || !profileForNav) {
        return;
      }

      const { required, factorId, error: mfaError } = await shouldPromptLoginMfa(profileForNav);
      if (cancelled) return;

      if (mfaError) {
        setError(mfaError);
      }

      if (required && factorId) {
        setLoginMfaFactorId(factorId);
        setLoginMfaCheckDone(true);
        return;
      }

      setLoginMfaFactorId(null);
      setLoginMfaCheckDone(true);
      const from = state?.from?.pathname || '/';
      navigate(getPostAuthPath(profileForNav, from), { replace: true });
    })();

    return () => {
      cancelled = true;
    };
  }, [user, session, initialized, navigate, state]);

  // プロフィール取得が返ってこないと「リダイレクトします...」のまま固まるため、手動の逃げ道を出す
  useEffect(() => {
    if (!user || !session || profile || isPasswordRecoveryActive()) {
      setProfileFetchStalled(false);
      return;
    }
    const timer = window.setTimeout(() => setProfileFetchStalled(true), 8000);
    return () => window.clearTimeout(timer);
  }, [user, session, profile]);

  const retryProfileFetch = useCallback(() => {
    if (!user) return;
    setProfileFetchStalled(false);
    void useAuthStore.getState().fetchProfile(user.id);
  }, [user]);

  const completeLoginAfterMfa = useCallback(() => {
    if (!user) return;
    const from = state?.from?.pathname || '/';
    void (async () => {
      const profileForNav = await syncLearnerProfileAfterSignIn(user.id);
      if (!profileForNav) return;
      navigate(getPostAuthPath(profileForNav, from), { replace: true });
    })();
  }, [navigate, user, state?.from?.pathname]);

  const toggleForm = () => {
    setIsLogin(!isLogin);
    setIsForgotPassword(false);
    setShowMagicLink(false);
    setError(null);
    setSuccess(null);
    setPendingEmailKind(null);
    setFieldErrors({});
  };

  const toggleForgotPassword = () => {
    setIsForgotPassword(!isForgotPassword);
    setShowMagicLink(false);
    setError(null);
    setSuccess(null);
    setFieldErrors({});
  };

  const handleLoginSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setFieldErrors({});

    if (!email || !password) {
      const nextFieldErrors: Record<string, string> = {};
      if (!email) {
        nextFieldErrors.email = 'メールアドレスを入力してください';
      }
      if (!password) {
        nextFieldErrors.password = 'パスワードを入力してください';
      }
      setFieldErrors(nextFieldErrors);
      setError('メールアドレスとパスワードを入力してください');
      const focusId = firstInvalidFieldId(AUTH_LOGIN_FIELD_ORDER, nextFieldErrors);
      setPostSubmitFocus(focusId ?? 'alert');
      return;
    }

    try {
      const { error: signInError } = await signIn(email, password);
      if (signInError) {
        setFieldErrors({});
        setError(mapAuthErrorToMessage(signInError, 'ログインに失敗しました。認証情報を確認してください。'));
        setPostSubmitFocus('alert');
      } else {
        setSuccess('ログインに成功しました。リダイレクトします...');
      }
    } catch {
      setFieldErrors({});
      setError('ログイン処理中にエラーが発生しました。');
      setPostSubmitFocus('alert');
    }
  }, [email, password, signIn]);

  const handleSignupSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setPendingEmailKind(null);
    setFieldErrors({});

    if (!email || !password || !username) {
      const nextFieldErrors: Record<string, string> = {};
      if (!email) {
        nextFieldErrors.email = 'メールアドレスを入力してください';
      }
      if (!username) {
        nextFieldErrors.username = 'ユーザー名を入力してください';
      }
      if (!password) {
        nextFieldErrors.password = 'パスワードを入力してください';
      }
      setFieldErrors(nextFieldErrors);
      setError('すべての必須項目を入力してください');
      const focusId = firstInvalidFieldId(AUTH_SIGNUP_FIELD_ORDER, nextFieldErrors);
      setPostSubmitFocus(focusId ?? 'alert');
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
      const { error: signUpError, emailConfirmRequired } = await signUp(
        email,
        password,
        username,
        signupCaptchaToken ?? undefined,
      );

      if (signUpError) {
        setFieldErrors({});
        setError(mapAuthErrorToMessage(signUpError, 'アカウント登録に失敗しました。'));
        setPostSubmitFocus('alert');
      } else if (emailConfirmRequired) {
        setPendingEmailKind('signup');
        setSuccess('アカウント登録に成功しました。メールの確認をお願いします。');
      } else {
        setSuccess('アカウント登録に成功しました。リダイレクトします...');
      }
    } catch {
      setFieldErrors({});
      setError('アカウント登録処理中にエラーが発生しました。');
      setPostSubmitFocus('alert');
    }
  }, [confirmPassword, email, password, signUp, signupCaptchaToken, username]);

  const handleResetPasswordSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setFieldErrors({});

    if (!email) {
      const nextFieldErrors = { email: 'メールアドレスを入力してください' };
      setFieldErrors(nextFieldErrors);
      setError('メールアドレスを入力してください');
      setPostSubmitFocus('reset-email');
      return;
    }

    try {
      const { error: resetError } = await resetPassword(email, resetCaptchaToken ?? undefined);
      if (resetError) {
        setFieldErrors({});
        setError(mapAuthErrorToMessage(resetError, 'パスワードリセットに失敗しました。メールアドレスを確認してください。'));
        setPostSubmitFocus('alert');
      } else {
        setPendingEmailKind('password-reset');
        setSuccess('パスワードリセット手順をメールで送信しました。');
      }
    } catch {
      setFieldErrors({});
      setError('パスワードリセット処理中にエラーが発生しました。');
      setPostSubmitFocus('alert');
    }
  }, [email, resetCaptchaToken, resetPassword]);

  const handleMagicLinkSent = useCallback((sentEmail: string) => {
    setEmail(sentEmail);
    setPendingEmailKind('magic-link');
    setShowMagicLink(false);
    setError(null);
    setSuccess('ログインリンクをメールで送信しました。メールをご確認ください。');
  }, []);

  if (user && session && profile && loginMfaFactorId && loginMfaCheckDone) {
    return (
      <AuthLayout title="二要素認証">
        {mfaRequiredFromQuery ? (
          <AuthAlert variant="timeout">
            セキュリティのため、二要素認証の確認が必要です。
          </AuthAlert>
        ) : null}
        {error && (
          <AuthAlert ref={formErrorAlertRef} variant="error" suppressScreenReader={hasFieldLevelErrors}>
            {error}
          </AuthAlert>
        )}
        <LoginMfaChallenge
          factorId={loginMfaFactorId}
          onError={setError}
          onVerified={completeLoginAfterMfa}
          onRecoveryUsed={() => {
            setSuccess(
              'リカバリーコードでログインしました。二要素認証は解除されました。プロフィールから再設定することをおすすめします。',
            );
          }}
        />
      </AuthLayout>
    );
  }

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
        {error && (
          <AuthAlert ref={formErrorAlertRef} variant="error" suppressScreenReader={hasFieldLevelErrors}>
            {error}
          </AuthAlert>
        )}
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

        <div className="mt-4 text-center">
          <AuthTextLink onClick={toggleForm}>ログインページに戻る</AuthTextLink>
        </div>
      </AuthLayout>
    );
  }

  if (isForgotPassword) {
    return (
      <AuthLayout title="パスワードリセット">
        {error && (
          <AuthAlert ref={formErrorAlertRef} variant="error" suppressScreenReader={hasFieldLevelErrors}>
            {error}
          </AuthAlert>
        )}
        {success && <AuthAlert variant="success">{success}</AuthAlert>}

        <form onSubmit={handleResetPasswordSubmit}>
          <AuthInput
            label="メールアドレス"
            type="email"
            id="reset-email"
            name="email"
            value={email}
            errorMessage={fieldErrors.email}
            onChange={(e) => {
              setEmail(e.target.value);
              clearFieldError('email');
            }}
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
      {error && (
        <AuthAlert ref={formErrorAlertRef} variant="error" suppressScreenReader={hasFieldLevelErrors}>
          {error}
        </AuthAlert>
      )}
      {success && <AuthAlert variant="success">{success}</AuthAlert>}
      {profileFetchStalled && (
        <AuthAlert variant="timeout">
          <p className="mb-2">
            ログインは完了していますが、プロフィールの読み込みが終わりません。
          </p>
          <div className="flex flex-wrap gap-3">
            <AuthTextLink onClick={retryProfileFetch}>再読み込み</AuthTextLink>
            <AuthTextLink onClick={() => void useAuthStore.getState().signOut()}>
              ログアウトしてやり直す
            </AuthTextLink>
          </div>
        </AuthAlert>
      )}

      {isLogin && lastAuthMethod && (
        <p className="mb-4 text-center text-xs text-[var(--text-muted)]">
          前回は「{describeLastAuthMethod(lastAuthMethod)}」でログインしました
        </p>
      )}

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
            name="email"
            value={email}
            errorMessage={fieldErrors.email}
            onChange={(e) => {
              setEmail(e.target.value);
              clearFieldError('email');
            }}
            autoComplete="username"
            spellCheck={false}
          />

          {!isLogin && (
            <AuthInput
              label="ユーザー名"
              type="text"
              id="username"
              name="username"
              value={username}
              errorMessage={fieldErrors.username}
              onChange={(e) => {
                setUsername(e.target.value);
                clearFieldError('username');
              }}
              autoComplete="nickname"
              spellCheck={false}
            />
          )}

          <AuthInput
            label="パスワード"
            type="password"
            id={isLogin ? 'current-password' : 'new-password'}
            name={isLogin ? 'password' : 'new-password'}
            value={password}
            errorMessage={fieldErrors.password}
            onChange={(e) => {
              setPassword(e.target.value);
              clearFieldError('password');
            }}
            autoComplete={isLogin ? 'current-password' : 'new-password'}
          />

          {!isLogin && (
            <>
              <AuthInput
                label="パスワード（確認）"
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
