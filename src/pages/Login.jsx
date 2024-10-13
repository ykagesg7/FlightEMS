import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function Login() {
  const { login, register, user, loading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [showAlert, setShowAlert] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [usernameError, setUsernameError] = useState('');

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    setIsRegistering(searchParams.get('register') === 'true');

    if (searchParams.get('email_confirmed') === 'true') {
      setMessage('メールアドレスが確認されました。ログインしてください。');
    }
  }, [location]);

  useEffect(() => {
    if (user) {
      navigate('/index');
    }
  }, [user, navigate]);

  const validateEmail = (email) => {
    if (!email) {
      setEmailError('メールアドレスを入力してください。');
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      setEmailError('有効なメールアドレスを入力してください。');
    } else {
      setEmailError('');
    }
  };

  const validatePassword = (password) => {
    if (!password) {
      setPasswordError('パスワードを入力してください。');
    } else {
      setPasswordError('');
    }
  };

  const validateUsername = (username) => {
    if (isRegistering && !username) {
      setUsernameError('ユーザー名を入力してください。');
    } else {
      setUsernameError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setShowAlert(false);

    validateEmail(email);
    validatePassword(password);
    if (isRegistering) {
      validateUsername(username);
    }

    if (emailError || passwordError || (isRegistering && usernameError)) {
      setShowAlert(true);
      return;
    }

    try {
      if (isRegistering) {
        await register(email, password, username);
        setMessage('仮登録しました。確認メールから登録を完了してください。');
        setIsRegistering(false);
      } else {
        await login(email, password);
      }
    } catch (error) {
      console.error(isRegistering ? 'Registration error:' : 'Login error:', error);
      if (error.message.includes('User already registered')) {
        setError('このメールアドレスは既に登録されています。');
      } else if (error.message.includes('Invalid login credentials')) {
        setError('メールアドレスまたはパスワードが間違っています。');
      } else {
        setError(isRegistering ? '登録に失敗しました。もう一度お試しください。' : 'ログインに失敗しました。もう一度お試しください。');
      }
    }
  };

  const toggleMode = () => {
    setIsRegistering(!isRegistering);
    setError('');
    setMessage('');
    setShowAlert(false);
    setEmailError('');
    setPasswordError('');
    setUsernameError('');
  };

  return (
    <div className="container mx-auto px-4 py-8 flex justify-center items-center min-h-screen">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">
            {isRegistering ? '新規登録' : 'ログイン'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegistering && (
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                  User Name
                </label>
                <Input
                  type="text"
                  id="username"
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value);
                    validateUsername(e.target.value);
                  }}
                  onBlur={() => validateUsername(username)}
                  required
                  className="mt-1"
                />
                {usernameError && <p className="text-red-500 text-sm mt-1">{usernameError}</p>}
              </div>
            )}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <Input
                type="email"
                id="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  validateEmail(e.target.value);
                }}
                onBlur={() => validateEmail(email)}
                required
                className="mt-1"
                autoComplete="username"
              />
              {emailError && <p className="text-red-500 text-sm mt-1">{emailError}</p>}
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <Input
                type="password"
                id="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  validatePassword(e.target.value);
                }}
                onBlur={() => validatePassword(password)}
                required
                className="mt-1"
                autoComplete="current-password"
              />
              {passwordError && <p className="text-red-500 text-sm mt-1">{passwordError}</p>}
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Processing...' : (isRegistering ? '登録' : 'ログイン')}
            </Button>
            {error && (
              <Alert variant="destructive" aria-live="assertive">
                <AlertTitle>エラー</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            {message && (
              <Alert aria-live="polite">
                <AlertTitle>成功</AlertTitle>
                <AlertDescription>{message}</AlertDescription>
              </Alert>
            )}
            {showAlert && (
              <Alert variant="warning" aria-live="assertive">
                <AlertTitle>入力エラー</AlertTitle>
                <AlertDescription>すべての項目を正しく入力してください。</AlertDescription>
              </Alert>
            )}
          </form>
          <div className="mt-4 text-center">
            <Button variant="link" onClick={toggleMode}>
              {isRegistering ? 'すでにアカウントをお持ちの方はこちら' : '新規登録はこちら'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}