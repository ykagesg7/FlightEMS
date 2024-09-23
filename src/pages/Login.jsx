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
  const [username, setUsername] = useState(''); // Full Name を User Name に変更
  const [isRegistering, setIsRegistering] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [showAlert, setShowAlert] = useState(false); // アラート表示用のステートを追加

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setShowAlert(false); // アラートを非表示にする

     // ログインの場合のみ入力値をチェック
     if (!isRegistering && (!email || !password)) { // 入力値がすべて存在するか確認
      setShowAlert(true); // アラートを表示
      return;
    }

    try {
      if (isRegistering) {
        await register(email, password, username); // username を登録時に渡す
        setMessage('仮登録しました。確認メールから登録を完了してください。');
        setIsRegistering(false);
      } else {
        await login(email, password);
      }
    } catch (error) {
      console.error(isRegistering ? 'Registration error:' : 'Login error:', error);
      setError(error.message || (isRegistering ? '登録に失敗しました。' : 'ログインに失敗しました。'));
    }
  };

  const toggleMode = () => {
    setIsRegistering(!isRegistering);
    setError('');
    setMessage('');
    setShowAlert(false); // アラートを非表示にする
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
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  className="mt-1"
                />
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
                onChange={(e) => setEmail(e.target.value)}
                required
                className="mt-1"
                autoComplete="username"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <Input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="mt-1"
                autoComplete="current-password"
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Processing...' : (isRegistering ? '登録' : 'ログイン')}
            </Button>
            {error && (
              <Alert variant="destructive">
                <AlertTitle>エラー</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            {message && (
              <Alert>
                <AlertTitle>成功</AlertTitle>
                <AlertDescription>{message}</AlertDescription>
              </Alert>
            )}
            {showAlert && ( // アラートを表示する条件を追加
              <Alert variant="warning">
                <AlertTitle>入力エラー</AlertTitle>
                <AlertDescription>すべての項目を入力してください。</AlertDescription>
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