import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';

const RegisterForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { signUp } = useAuth();
  const { theme } = useTheme();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password || !username) {
      setError('すべての項目を入力してください');
      return;
    }
    
    if (password !== confirmPassword) {
      setError('パスワードが一致しません');
      return;
    }
    
    if (password.length < 6) {
      setError('パスワードは6文字以上で入力してください');
      return;
    }
    
    try {
      setError(null);
      setSuccess(null);
      setLoading(true);
      const { error, user } = await signUp(email, password, username);
      
      if (error) {
        setError(error.message || '登録に失敗しました');
      } else if (user) {
        setSuccess('登録が完了しました。メールを確認して認証してください。');
        // フォームをリセット
        setEmail('');
        setPassword('');
        setConfirmPassword('');
        setUsername('');
      }
    } catch (err: any) {
      setError(err.message || '登録中にエラーが発生しました');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`w-full max-w-md mx-auto p-6 rounded-lg shadow-md ${
      theme === 'dark' ? 'bg-gray-800' : 'bg-white'
    }`}>
      <h2 className={`text-2xl font-bold mb-6 text-center ${
        theme === 'dark' ? 'text-white' : 'text-gray-800'
      }`}>
        新規登録
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
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label 
            htmlFor="username" 
            className={`block mb-2 text-sm font-medium ${
              theme === 'dark' ? 'text-gray-200' : 'text-gray-700'
            }`}
          >
            ユーザー名
          </label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className={`w-full px-3 py-2 border rounded-md ${
              theme === 'dark' 
                ? 'bg-gray-700 border-gray-600 text-white' 
                : 'bg-gray-50 border-gray-300 text-gray-900'
            } focus:outline-none focus:ring-2 focus:ring-indigo-500`}
            placeholder="username"
            required
            autoComplete="username"
          />
        </div>

        <div className="mb-4">
          <label 
            htmlFor="register-email" 
            className={`block mb-2 text-sm font-medium ${
              theme === 'dark' ? 'text-gray-200' : 'text-gray-700'
            }`}
          >
            メールアドレス
          </label>
          <input
            type="email"
            id="register-email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={`w-full px-3 py-2 border rounded-md ${
              theme === 'dark' 
                ? 'bg-gray-700 border-gray-600 text-white' 
                : 'bg-gray-50 border-gray-300 text-gray-900'
            } focus:outline-none focus:ring-2 focus:ring-indigo-500`}
            placeholder="your@email.com"
            required
            autoComplete="email"
          />
        </div>
        
        <div className="mb-4">
          <label 
            htmlFor="register-password" 
            className={`block mb-2 text-sm font-medium ${
              theme === 'dark' ? 'text-gray-200' : 'text-gray-700'
            }`}
          >
            パスワード
          </label>
          <input
            type="password"
            id="register-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={`w-full px-3 py-2 border rounded-md ${
              theme === 'dark' 
                ? 'bg-gray-700 border-gray-600 text-white' 
                : 'bg-gray-50 border-gray-300 text-gray-900'
            } focus:outline-none focus:ring-2 focus:ring-indigo-500`}
            placeholder="••••••••"
            required
            minLength={6}
            autoComplete="new-password"
          />
        </div>
        
        <div className="mb-6">
          <label 
            htmlFor="confirm-password" 
            className={`block mb-2 text-sm font-medium ${
              theme === 'dark' ? 'text-gray-200' : 'text-gray-700'
            }`}
          >
            パスワード（確認）
          </label>
          <input
            type="password"
            id="confirm-password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className={`w-full px-3 py-2 border rounded-md ${
              theme === 'dark' 
                ? 'bg-gray-700 border-gray-600 text-white' 
                : 'bg-gray-50 border-gray-300 text-gray-900'
            } focus:outline-none focus:ring-2 focus:ring-indigo-500`}
            placeholder="••••••••"
            required
            autoComplete="new-password"
          />
        </div>
        
        <button
          type="submit"
          disabled={loading}
          className={`w-full py-2 px-4 rounded-md font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 ${
            loading
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500 text-white'
          }`}
        >
          {loading ? '登録中...' : '登録する'}
        </button>
      </form>
    </div>
  );
};

export default RegisterForm; 