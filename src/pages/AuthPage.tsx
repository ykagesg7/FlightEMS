import React, { useCallback, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { useAuthStore } from '../stores/authStore';
import { toAppError } from '../types/error';
import { bypassEmailVerification } from '../utils/supabase';

interface LocationState {
  from?: {
    pathname: string;
  };
  timeout?: boolean;
}

const AuthPage: React.FC = () => {
  // Zustandストアから必要な値と関数を個別に取得
  const user = useAuthStore(state => state.user);
  const loading = useAuthStore(state => state.loading);
  const signIn = useAuthStore(state => state.signIn);
  const signUp = useAuthStore(state => state.signUp);
  const resetPassword = useAuthStore(state => state.resetPassword);
  const session = useAuthStore(state => state.session);
  const setLoading = useAuthStore(state => state.setLoading);

  // このページでは値を参照していないため、未使用変数の警告を避けて単純に呼び出しのみ行う
  useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as LocationState;

  // フォーム状態
  const params = new URLSearchParams(location.search);
  const initialMode = params.get('mode');
  const [isLogin, setIsLogin] = useState(initialMode === 'signup' ? false : true);
  const [isForgotPassword, setIsForgotPassword] = useState(initialMode === 'reset');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // URLクエリの変更に応じてフォームモードを同期
  useEffect(() => {
    const p = new URLSearchParams(location.search);
    const m = p.get('mode');
    if (m === 'signup') {
      setIsLogin(false);
      setIsForgotPassword(false);
    } else if (m === 'reset') {
      setIsForgotPassword(true);
    }
  }, [location.search]);

  // メール検証バイパス状態
  const [verificationEmailSent, setVerificationEmailSent] = useState(false);
  const [verificationLink, setVerificationLink] = useState<string | null>(null);
  const [isDevelopment] = useState(process.env.NODE_ENV === 'development' || window.location.hostname === 'localhost');

  // ユーザーが既にログインしている場合はリダイレクト
  useEffect(() => {
    if (user && session) {
      const from = state?.from?.pathname || '/';
      navigate(from, { replace: true });
    }
  }, [user, session, navigate, state]);

  // フォームの切り替え処理
  const toggleForm = () => {
    setIsLogin(!isLogin);
    setIsForgotPassword(false);
    setError(null);
    setSuccess(null);
    setVerificationEmailSent(false);
    setVerificationLink(null);
  };

  // パスワードリセットフォームの表示切り替え
  const toggleForgotPassword = () => {
    setIsForgotPassword(!isForgotPassword);
    setError(null);
    setSuccess(null);
  };

  // メール検証をバイパスする（開発環境のみ）
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
        setSuccess('開発環境用の検証リンクが生成されました。下のリンクをクリックするか、コンソールに表示されたリンクを使用してください。');
      } else {
        setError(`検証リンクの生成に失敗しました: ${result.error?.message || '不明なエラー'}`);
      }
    } catch (err: unknown) {
      setLoading(false);
      const appError = toAppError(err);
      setError(`検証バイパス中にエラーが発生しました: ${appError.message || '不明なエラー'}`);
    }
  }, [email]);

  // ログインフォーム送信 - useCallback でメモ化
  const handleLoginSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    try {
      // 入力検証
      if (!email || !password) {
        setError('メールアドレスとパスワードを入力してください');
        return;
      }

      const { error } = await signIn(email, password);

      if (error) {
        console.error('ログイン失敗:', error);
        setError('ログインに失敗しました。認証情報を確認してください。');
      } else {
        setSuccess('ログインに成功しました。リダイレクトします...');
      }
    } catch (err: unknown) {
      const appError = toAppError(err);
      console.error('ログイン例外:', appError);
      setError('ログイン処理中にエラーが発生しました。');
    }
  }, [email, password, signIn]);

  // アカウント登録フォーム送信 - useCallback でメモ化
  const handleSignupSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setVerificationEmailSent(false);
    setVerificationLink(null);

    // 入力検証
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
      const { error, emailConfirmRequired } = await signUp(email, password, username);

      if (error) {
        console.error('アカウント登録失敗:', error);
        setError('アカウント登録に失敗しました。' + error.message);
      } else if (emailConfirmRequired) {
        // メール確認が必要な場合
        setVerificationEmailSent(true);
        setSuccess('アカウント登録に成功しました。メールの確認をお願いします。');
        // ここではリダイレクトしない - メール確認が必要
      } else {
        // メール確認が不要で、ユーザーとセッションが揃った場合
        setSuccess('アカウント登録に成功しました。リダイレクトします...');
        // useEffectでリダイレクトを処理（user && sessionの条件）
      }
    } catch (err: unknown) {
      const appError = toAppError(err);
      console.error('アカウント登録例外:', appError);
      setError('アカウント登録処理中にエラーが発生しました。');
    }
  }, [email, password, confirmPassword, username, signUp]);

  // パスワードリセットフォーム送信 - useCallback でメモ化
  const handleResetPasswordSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    // 入力検証
    if (!email) {
      setError('メールアドレスを入力してください');
      return;
    }

    try {
      const { error } = await resetPassword(email);

      if (error) {
        console.error('パスワードリセット失敗:', error);
        setError('パスワードリセットに失敗しました。メールアドレスを確認してください。');
      } else {
        setSuccess('パスワードリセット手順をメールで送信しました。メールをご確認ください。');
      }
    } catch (err: unknown) {
      const appError = toAppError(err);
      console.error('パスワードリセット例外:', appError);
      setError('パスワードリセット処理中にエラーが発生しました。');
    }
  }, [email, resetPassword]);

  // メール検証中の状態表示
  const renderVerificationPending = () => (
    <div className={`p-8 rounded-2xl shadow-xl max-w-md w-full backdrop-blur-xl border transition-all duration-300 bg-[color:var(--panel)]/80 border-[color:var(--hud-dim)]`}>
      <h2 className={`text-2xl font-bold mb-6 hud-text`}>
        メール検証
      </h2>

      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
          {success}
        </div>
      )}

      <div className={`mb-4 p-4 border rounded bg-[color:var(--panel)]/60 border-[color:var(--hud-dim)]`}>
        <p className="mb-3">
          <strong>登録メールアドレス:</strong> {email}
        </p>
        <p className="mb-3">
          上記のメールアドレスに確認リンクを送信しました。メールを確認して認証を完了してください。
        </p>
        <p className="text-sm">
          メールが届かない場合は、迷惑メールフォルダも確認してください。
        </p>
      </div>

      {isDevelopment && (
        <div className="mt-4">
          <button
            onClick={handleVerificationBypass}
            disabled={loading}
            className={`w-full py-2 px-4 rounded-md focus:outline-none mb-3 ${loading
              ? 'bg-gray-400 cursor-not-allowed'
              : 'border border-[color:var(--hud-primary)] text-[color:var(--hud-primary)] hover:bg-[color:var(--hud-dim)] focus:ring-2 focus:ring-[color:var(--ring)]'}
            `}
          >
            {loading ? '処理中...' : '開発環境用: 検証リンクを生成'}
          </button>

          {verificationLink && (
            <div className="mt-2 p-3 bg-blue-100 border border-blue-400 text-blue-800 rounded text-sm">
              <p className="mb-2 font-bold">開発環境用検証リンク:</p>
              <a
                href={verificationLink}
                target="_blank"
                rel="noopener noreferrer"
                className="hud-text underline break-all"
              >
                {verificationLink}
              </a>
            </div>
          )}
        </div>
      )}

      <div className="mt-4 text-center">
        <button
          onClick={toggleForm}
          className={`hud-text hover:underline focus:outline-none`}
        >
          ログインページに戻る
        </button>
      </div>
    </div>
  );

  const renderForgotPasswordForm = () => (
    <div className={`p-8 rounded-2xl shadow-xl max-w-md w-full backdrop-blur-xl border transition-all duration-300 bg-[color:var(--panel)]/80 border-[color:var(--hud-dim)]`}>
      <h2 className={`text-2xl font-bold mb-6 hud-text`}>
        パスワードリセット
      </h2>

      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
          {success}
        </div>
      )}

      <form onSubmit={handleResetPasswordSubmit}>
        <div className="mb-4">
          <label
            htmlFor="email"
            className={`block mb-2 text-sm font-medium`}
          >
            メールアドレス
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={`w-full px-3 py-2 rounded-md hud-input focus:outline-none focus:ring-2 focus:ring-[color:var(--ring)]`}
            autoComplete="email"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`w-full py-2 px-4 rounded-md focus:outline-none ${loading
            ? 'bg-gray-400 cursor-not-allowed'
            : 'border border-[color:var(--hud-primary)] text-[color:var(--hud-primary)] hover:bg-[color:var(--hud-dim)] focus:ring-2 focus:ring-[color:var(--ring)]'
            }`}
        >
          {loading ? 'リセット手順を送信中...' : 'リセット手順を送信'}
        </button>

        <p className={`mt-4 text-sm text-center`}>
          <button
            type="button"
            onClick={toggleForgotPassword}
            className="hud-text hover:underline focus:outline-none"
          >
            ログインに戻る
          </button>
        </p>
      </form>
    </div>
  );

  const renderLoginForm = () => (
    <div className={`p-8 rounded-2xl shadow-xl max-w-md w-full backdrop-blur-xl border transition-all duration-300 bg-[color:var(--panel)]/80 border-[color:var(--hud-dim)]`}>
      <h2 className={`text-2xl font-bold mb-6 hud-text`}>
        {isLogin ? 'ログイン' : 'アカウント登録'}
      </h2>

      {state?.timeout && (
        <div className="mb-4 p-3 bg-yellow-100 border border-yellow-400 text-yellow-700 rounded">
          認証がタイムアウトしました。再度ログインしてください。
        </div>
      )}

      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
          {success}
        </div>
      )}

      <form onSubmit={isLogin ? handleLoginSubmit : handleSignupSubmit}>
        <div className="mb-4">
          <label
            htmlFor="email"
            className={`block mb-2 text-sm font-medium`}
          >
            メールアドレス
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={`w-full px-3 py-2 rounded-md hud-input focus:outline-none focus:ring-2 focus:ring-[color:var(--ring)]`}
            autoComplete="email"
          />
        </div>

        {!isLogin && (
          <div className="mb-4">
            <label
              htmlFor="username"
              className={`block mb-2 text-sm font-medium`}
            >
              ユーザー名
            </label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className={`w-full px-3 py-2 rounded-md hud-input focus:outline-none focus:ring-2 focus:ring-[color:var(--ring)]`}
              autoComplete="username"
            />
          </div>
        )}

        <div className="mb-4">
          <label
            htmlFor="password"
            className={`block mb-2 text-sm font-medium`}
          >
            パスワード
          </label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={`w-full px-3 py-2 rounded-md hud-input focus:outline-none focus:ring-2 focus:ring-[color:var(--ring)]`}
            autoComplete={isLogin ? "current-password" : "new-password"}
          />
        </div>

        {!isLogin && (
          <div className="mb-4">
            <label
              htmlFor="confirmPassword"
              className={`block mb-2 text-sm font-medium`}
            >
              パスワード（確認）
            </label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className={`w-full px-3 py-2 rounded-md hud-input focus:outline-none focus:ring-2 focus:ring-[color:var(--ring)]`}
              autoComplete="new-password"
            />
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className={`w-full py-2 px-4 rounded-md focus:outline-none ${loading
            ? 'bg-gray-400 cursor-not-allowed'
            : 'border border-[color:var(--hud-primary)] text-[color:var(--hud-primary)] hover:bg-[color:var(--hud-dim)] focus:ring-2 focus:ring-[color:var(--ring)]'
            }`}
        >
          {loading
            ? (isLogin ? 'ログイン中...' : '登録中...')
            : (isLogin ? 'ログイン' : '登録')}
        </button>

        {isLogin && (
          <p className={`mt-2 text-sm text-center`}>
            <button
              type="button"
              onClick={toggleForgotPassword}
              className="hud-text hover:underline focus:outline-none"
            >
              パスワードを忘れた場合
            </button>
          </p>
        )}

        <p className={`mt-4 text-sm text-center`}>
          {isLogin
            ? 'アカウントをお持ちでない場合は'
            : 'すでにアカウントをお持ちの場合は'}
          <button
            type="button"
            onClick={toggleForm}
            className="ml-1 hud-text hover:underline focus:outline-none"
          >
            {isLogin ? '登録' : 'ログイン'}
          </button>
        </p>
      </form>
    </div>
  );

  return (
    <div className={`bg-[color:var(--bg)] min-h-screen py-16 flex justify-center items-center p-4`}>
      {verificationEmailSent
        ? renderVerificationPending()
        : isForgotPassword
          ? renderForgotPasswordForm()
          : renderLoginForm()}
    </div>
  );
};

export default AuthPage;
