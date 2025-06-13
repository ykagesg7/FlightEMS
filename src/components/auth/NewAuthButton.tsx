import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { useTheme } from '../../contexts/ThemeContext';
// import ProfileMenu from './ProfileMenu'; // ProfileMenuは非表示に

const NewAuthButton = () => {
  // 個別のセレクタを使用して、必要な値のみを取得（オブジェクト分割代入を避ける）
  const user = useAuthStore(state => state.user);
  const profile = useAuthStore(state => state.profile);
  const loading = useAuthStore(state => state.loading);
  const signOut = useAuthStore(state => state.signOut);
  
  const { theme } = useTheme();
  const [isLoadingTimeout, setIsLoadingTimeout] = useState(false);
  const [isDebugMode] = useState(import.meta.env.MODE === 'development'); // 本番ではデバッグログを出さない
  const navigate = useNavigate();

  // ローディングのタイムアウト処理
  useEffect(() => {
    if (loading && !isLoadingTimeout && !user) {
      const timer = window.setTimeout(() => {
        setIsLoadingTimeout(true);
      }, 3000);
      return () => {
        window.clearTimeout(timer);
      };
    } else if (!loading && isLoadingTimeout) {
      setIsLoadingTimeout(false);
    }
  }, [loading, isLoadingTimeout, user]);

  // デバッグモードの場合にコンソールログを出力
  useEffect(() => {
    if (isDebugMode) {
      console.log('NewAuthButton: ユーザー状態更新', { 
        hasUser: !!user, 
        hasProfile: !!profile, 
        userId: user?.id,
        profileId: profile?.id,
        username: profile?.username,
        loading,
        isLoadingTimeout
      });
    }
  }, [user, profile, loading, isLoadingTimeout, isDebugMode]);

  // ログアウト処理
  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/auth');
    } catch (error) {
      console.error('ログアウト処理中にエラーが発生しました:', error);
    }
  };

  // ローディング中はスケルトンを表示（ただしタイムアウトしたら表示しない）
  if (loading && !user && !isLoadingTimeout) {
    return (
      <div className={`w-28 h-10 rounded-md animate-pulse ${
        theme === 'dark' ? 'bg-gray-700' : 'bg-gray-300'
      }`}></div>
    );
  }

  // ログイン済みならユーザー名＋ログアウトボタンを表示
  if (user) {
    // ロール名を取得
    const roleLabel = profile?.roll || 'User';
    // ロールごとに色を分ける
    let roleColor = '';
    if (roleLabel.toLowerCase() === 'admin') {
      roleColor = theme === 'dark' ? 'bg-red-600 hover:bg-red-700' : 'bg-red-500 hover:bg-red-600';
    } else if (roleLabel.toLowerCase() === 'teacher') {
      roleColor = theme === 'dark' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600';
    } else if (roleLabel.toLowerCase() === 'student') {
      roleColor = theme === 'dark' ? 'bg-green-600 hover:bg-green-700' : 'bg-green-500 hover:bg-green-600';
    } else {
      roleColor = theme === 'dark' ? 'bg-gray-600 hover:bg-gray-700' : 'bg-gray-400 hover:bg-gray-500';
    }
    return (
      <div className="flex items-center space-x-2">
        <span
          className={`flex items-center px-3 py-2 rounded transition-colors text-sm font-bold text-white ${roleColor}`}
          style={{ minWidth: 0 }}
          title={`ロール: ${roleLabel}`}
        >
          {roleLabel}
        </span>
        <button
          onClick={handleLogout}
          className={`px-3 py-2 rounded text-white text-sm font-bold transition-colors ${
            theme === 'dark'
              ? 'bg-gray-600 hover:bg-gray-700' 
              : 'bg-gray-400 hover:bg-gray-500'
          }`}
          aria-label="ログアウト"
          title="ログアウト"
        >
          ログアウト
        </button>
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
      ログイン
    </Link>
  );
};

export default NewAuthButton; 