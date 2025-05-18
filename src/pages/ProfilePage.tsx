import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { useTheme } from '../contexts/ThemeContext';
import supabase from '../utils/supabase';

const ProfilePage = () => {
  // Zustandストアから個別に値を取得
  const user = useAuthStore(state => state.user);
  const profile = useAuthStore(state => state.profile);
  const loading = useAuthStore(state => state.loading);
  const updateProfile = useAuthStore(state => state.updateProfile);
  
  const { theme } = useTheme();
  const navigate = useNavigate();
  
  // プロフィール編集状態
  const [username, setUsername] = useState('');
  const [fullName, setFullName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  
  // パスワード変更状態
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);
  const [passwordLoading, setPasswordLoading] = useState(false);
  
  // 未ログインならリダイレクト
  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [loading, user, navigate]);
  
  // プロフィール情報の初期化
  useEffect(() => {
    if (profile) {
      setUsername(profile.username || '');
      setFullName(profile.full_name || '');
      setAvatarUrl(profile.avatar_url || '');
    }
  }, [profile]);
  
  // プロフィール更新処理
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username.trim()) {
      setError('ユーザー名は必須です');
      return;
    }
    
    try {
      setError(null);
      setSuccess(null);
      setFormLoading(true);
      
      const { error } = await updateProfile({
        username,
        full_name: fullName,
        avatar_url: avatarUrl,
        updated_at: new Date().toISOString()
      });
      
      if (error) {
        setError(error.message || 'プロフィールの更新に失敗しました');
      } else {
        setSuccess('プロフィールを更新しました');
        // 3秒後にメッセージを消す
        setTimeout(() => setSuccess(null), 3000);
      }
    } catch (err: any) {
      setError(err.message || '更新中にエラーが発生しました');
    } finally {
      setFormLoading(false);
    }
  };
  
  // パスワード変更処理
  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 入力チェック
    if (!currentPassword) {
      setPasswordError('現在のパスワードを入力してください');
      return;
    }
    
    if (!newPassword) {
      setPasswordError('新しいパスワードを入力してください');
      return;
    }
    
    if (newPassword.length < 8) {
      setPasswordError('パスワードは8文字以上にしてください');
      return;
    }
    
    if (newPassword !== confirmPassword) {
      setPasswordError('新しいパスワードと確認用パスワードが一致しません');
      return;
    }
    
    try {
      setPasswordError(null);
      setPasswordSuccess(null);
      setPasswordLoading(true);
      
      // 現在のパスワードでログインを試みて検証
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user!.email!,
        password: currentPassword,
      });
      
      if (signInError) {
        setPasswordError('現在のパスワードが正しくありません');
        setPasswordLoading(false);
        return;
      }
      
      // パスワード更新
      const { error } = await supabase.auth.updateUser({ 
        password: newPassword 
      });
      
      if (error) {
        setPasswordError(error.message || 'パスワードの更新に失敗しました');
      } else {
        setPasswordSuccess('パスワードを更新しました');
        // フォームをリセット
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        // 3秒後にメッセージを消す
        setTimeout(() => {
          setPasswordSuccess(null);
          setShowPasswordForm(false);
        }, 3000);
      }
    } catch (err: any) {
      setPasswordError(err.message || 'パスワード更新中にエラーが発生しました');
    } finally {
      setPasswordLoading(false);
    }
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }
  
  return (
    <div className={`${
      theme === 'dark' 
        ? 'bg-gray-900' 
        : 'bg-gradient-to-br from-indigo-100 to-purple-100'
    } min-h-screen py-12`}>
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto">
          <h1 className={`text-3xl font-bold mb-8 ${
            theme === 'dark' ? 'text-white' : 'text-gray-800'
          }`}>
            プロフィール設定
          </h1>
          
          {/* プロフィール編集フォーム */}
          <div className={`p-6 rounded-lg shadow-md mb-8 ${
            theme === 'dark' ? 'bg-gray-800' : 'bg-white'
          }`}>
            <h2 className={`text-xl font-semibold mb-4 pb-2 border-b ${
              theme === 'dark' ? 'text-gray-200 border-gray-700' : 'text-gray-800 border-gray-200'
            }`}>
              ユーザー情報
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
                  htmlFor="email" 
                  className={`block mb-2 text-sm font-medium ${
                    theme === 'dark' ? 'text-gray-200' : 'text-gray-700'
                  }`}
                >
                  メールアドレス
                </label>
                <input
                  type="email"
                  id="email"
                  value={user?.email || ''}
                  disabled
                  className={`w-full px-3 py-2 border rounded-md ${
                    theme === 'dark' 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-gray-100 border-gray-300 text-gray-600'
                  } cursor-not-allowed`}
                  autoComplete="email"
                />
                <p className={`mt-1 text-xs ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  メールアドレスは変更できません
                </p>
              </div>
              {/* ロール表示（編集不可） */}
              <div className="mb-4">
                <label 
                  htmlFor="roll" 
                  className={`block mb-2 text-sm font-medium ${
                    theme === 'dark' ? 'text-gray-200' : 'text-gray-700'
                  }`}
                >
                  ロール（権限）
                </label>
                <input
                  type="text"
                  id="roll"
                  value={profile?.roll || '未設定'}
                  disabled
                  className={`w-full px-3 py-2 border rounded-md ${
                    theme === 'dark' 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-gray-100 border-gray-300 text-gray-600'
                  } cursor-not-allowed`}
                />
                <p className={`mt-1 text-xs ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  ロールは管理者によって設定されます
                </p>
              </div>
              
              <div className="mb-4">
                <label 
                  htmlFor="username" 
                  className={`block mb-2 text-sm font-medium ${
                    theme === 'dark' ? 'text-gray-200' : 'text-gray-700'
                  }`}
                >
                  ユーザー名 *
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
                  required
                  autoComplete="username"
                />
              </div>
              
              <div className="mb-4">
                <label 
                  htmlFor="fullName" 
                  className={`block mb-2 text-sm font-medium ${
                    theme === 'dark' ? 'text-gray-200' : 'text-gray-700'
                  }`}
                >
                  氏名
                </label>
                <input
                  type="text"
                  id="fullName"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md ${
                    theme === 'dark' 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-gray-50 border-gray-300 text-gray-900'
                  } focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                  autoComplete="name"
                />
              </div>
              
              <div className="mb-6">
                <label 
                  htmlFor="avatarUrl" 
                  className={`block mb-2 text-sm font-medium ${
                    theme === 'dark' ? 'text-gray-200' : 'text-gray-700'
                  }`}
                >
                  アバター画像URL
                </label>
                <input
                  type="text"
                  id="avatarUrl"
                  value={avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md ${
                    theme === 'dark' 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-gray-50 border-gray-300 text-gray-900'
                  } focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                  placeholder="https://example.com/avatar.jpg"
                  autoComplete="url"
                />
              </div>
              
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={formLoading}
                  className={`px-4 py-2 rounded-md focus:outline-none ${
                    formLoading
                      ? 'bg-gray-400 cursor-not-allowed'
                      : theme === 'dark'
                        ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
                        : 'bg-indigo-500 hover:bg-indigo-600 text-white'
                  }`}
                >
                  {formLoading ? '更新中...' : '更新する'}
                </button>
              </div>
            </form>
          </div>
          
          {/* パスワード変更フォーム */}
          <div className={`p-6 rounded-lg shadow-md mb-8 ${
            theme === 'dark' ? 'bg-gray-800' : 'bg-white'
          }`}>
            <h2 className={`text-xl font-semibold mb-4 pb-2 border-b ${
              theme === 'dark' ? 'text-gray-200 border-gray-700' : 'text-gray-800 border-gray-200'
            }`}>
              パスワード設定
            </h2>
            
            {!showPasswordForm ? (
              <div className="flex justify-end">
                <button
                  onClick={() => setShowPasswordForm(true)}
                  className={`px-4 py-2 rounded-md ${
                    theme === 'dark'
                      ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
                      : 'bg-indigo-500 hover:bg-indigo-600 text-white'
                  }`}
                >
                  パスワード変更
                </button>
              </div>
            ) : (
              <>
                {passwordError && (
                  <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                    {passwordError}
                  </div>
                )}
                
                {passwordSuccess && (
                  <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
                    {passwordSuccess}
                  </div>
                )}
                
                <form onSubmit={handlePasswordChange}>
                  <div className="mb-4">
                    <label 
                      htmlFor="currentPassword" 
                      className={`block mb-2 text-sm font-medium ${
                        theme === 'dark' ? 'text-gray-200' : 'text-gray-700'
                      }`}
                    >
                      現在のパスワード
                    </label>
                    <input
                      type="password"
                      id="currentPassword"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className={`w-full px-3 py-2 border rounded-md ${
                        theme === 'dark' 
                          ? 'bg-gray-700 border-gray-600 text-white' 
                          : 'bg-gray-50 border-gray-300 text-gray-900'
                      } focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                      required
                      autoComplete="current-password"
                    />
                  </div>
                  
                  <div className="mb-4">
                    <label 
                      htmlFor="newPassword" 
                      className={`block mb-2 text-sm font-medium ${
                        theme === 'dark' ? 'text-gray-200' : 'text-gray-700'
                      }`}
                    >
                      新しいパスワード
                    </label>
                    <input
                      type="password"
                      id="newPassword"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className={`w-full px-3 py-2 border rounded-md ${
                        theme === 'dark' 
                          ? 'bg-gray-700 border-gray-600 text-white' 
                          : 'bg-gray-50 border-gray-300 text-gray-900'
                      } focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                      required
                      minLength={8}
                      autoComplete="new-password"
                    />
                    <p className={`mt-1 text-xs ${
                      theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      パスワードは8文字以上にしてください
                    </p>
                  </div>
                  
                  <div className="mb-6">
                    <label 
                      htmlFor="confirmPassword" 
                      className={`block mb-2 text-sm font-medium ${
                        theme === 'dark' ? 'text-gray-200' : 'text-gray-700'
                      }`}
                    >
                      新しいパスワード（確認）
                    </label>
                    <input
                      type="password"
                      id="confirmPassword"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className={`w-full px-3 py-2 border rounded-md ${
                        theme === 'dark' 
                          ? 'bg-gray-700 border-gray-600 text-white' 
                          : 'bg-gray-50 border-gray-300 text-gray-900'
                      } focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                      required
                      autoComplete="new-password"
                    />
                  </div>
                  
                  <div className="flex justify-between">
                    <button
                      type="button"
                      onClick={() => {
                        setShowPasswordForm(false);
                        setPasswordError(null);
                        setPasswordSuccess(null);
                        setCurrentPassword('');
                        setNewPassword('');
                        setConfirmPassword('');
                      }}
                      className={`px-4 py-2 rounded-md border ${
                        theme === 'dark'
                          ? 'border-gray-600 text-gray-300 hover:bg-gray-700'
                          : 'border-gray-300 text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      キャンセル
                    </button>
                    <button
                      type="submit"
                      disabled={passwordLoading}
                      className={`px-4 py-2 rounded-md focus:outline-none ${
                        passwordLoading
                          ? 'bg-gray-400 cursor-not-allowed'
                          : theme === 'dark'
                            ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
                            : 'bg-indigo-500 hover:bg-indigo-600 text-white'
                      }`}
                    >
                      {passwordLoading ? '更新中...' : '更新する'}
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage; 