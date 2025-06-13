import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { useTheme } from '../../contexts/ThemeContext';
import ProfileMenu from './ProfileMenu';

const AuthButton = () => {
  const user = useAuthStore(state => state.user);
  const profile = useAuthStore(state => state.profile);
  const loading = useAuthStore(state => state.loading);
  const { theme } = useTheme();
  const [loadingTimeout, setLoadingTimeout] = useState(false);
  const [debugMode] = useState(import.meta.env.MODE === 'development'); // 開発環境でのみデバッグモードを有効化

  // ローディングのタイムアウト処理
  useEffect(() => {
    // すでにタイムアウトしている場合や、ユーザーがロードされた場合は何もしない
    if (loadingTimeout || !loading || user) return;
    
    // タイマーを設定
    const timer = window.setTimeout(() => {
      setLoadingTimeout(true);
    }, 3000); // 3秒後にタイムアウト
    
    // クリーンアップ時にタイマーをクリア
    return () => {
      window.clearTimeout(timer);
    };
  }, [loading, loadingTimeout, user]);
  
  // loadingが終了したらタイムアウトフラグをリセット
  useEffect(() => {
    if (!loading && loadingTimeout) {
      setLoadingTimeout(false);
    }
  }, [loading, loadingTimeout]);

  // ユーザー状態の変化をログ出力（デバッグ用）
  useEffect(() => {
    if (debugMode) {
      console.log('AuthButton: ユーザー状態更新', { 
        hasUser: !!user, 
        hasProfile: !!profile, 
        userId: user?.id,
        profileId: profile?.id,
        username: profile?.username,
        loading,
        loadingTimeout
      });
    }
  }, [user, profile, loading, loadingTimeout, debugMode]);

  // ローディング中はスケルトンを表示（ただしタイムアウトしたら表示しない）
  if (loading && !user && !loadingTimeout) {
    return (
      <div className={`w-28 h-10 rounded-md animate-pulse ${
        theme === 'dark' ? 'bg-gray-700' : 'bg-gray-300'
      }`}></div>
    );
  }

  // ログイン済みならプロフィールメニューを表示
  if (user) {
    // デバッグモードの場合は表示状態を確認
    if (debugMode) {
      return (
        <div className="flex items-center space-x-2">
          <span className="text-xs bg-green-500 text-white px-2 py-1 rounded">
            {profile ? `${profile.username}` : `ユーザーのみ`}
          </span>
          <ProfileMenu />
        </div>
      );
    }
    return (
      <div className="relative z-40">
        <ProfileMenu />
      </div>
    );
  }

  // 未ログインならログインボタンを表示
  return (
    <Link 
      to="/auth" 
      className={`px-4 py-2 rounded-md transition-colors ${
        theme === 'dark'
          ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
          : 'bg-indigo-500 hover:bg-indigo-600 text-white'
      }`}
    >
      {debugMode ? `未ログイン状態` : 'ログイン'}
    </Link>
  );
};

export default AuthButton; 