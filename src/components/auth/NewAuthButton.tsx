import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuthStore } from '../../stores/authStore';
import ProfileMenu from './ProfileMenu';

const NewAuthButton = () => {
  // 個別のセレクタを使用して、必要な値のみを取得（オブジェクト分割代入を避ける）
  const user = useAuthStore(state => state.user);
  const profile = useAuthStore(state => state.profile);
  const loading = useAuthStore(state => state.loading);

  const { theme } = useTheme();
  const [isLoadingTimeout, setIsLoadingTimeout] = useState(false);
  const [isDebugMode] = useState(import.meta.env.MODE === 'development'); // 本番ではデバッグログを出さない

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

  // 前回の状態を記録するためのref
  const prevStateRef = useRef({
    hasUser: false,
    hasProfile: false,
    userId: null as string | null,
    loading: false
  });

  // 状態の変更がある場合のみログ出力
  useEffect(() => {
    if (isDebugMode) {
      const currentState = {
        hasUser: !!user,
        hasProfile: !!profile,
        userId: user?.id || null,
        loading
      };

      const prevState = prevStateRef.current;

      // 重要な状態変化の場合のみログ出力（より厳密な条件）
      const hasSignificantChange =
        currentState.hasUser !== prevState.hasUser ||
        currentState.hasProfile !== prevState.hasProfile ||
        currentState.userId !== prevState.userId ||
        (prevState.loading && !currentState.loading); // ローディング完了時のみ

      if (hasSignificantChange) {
        console.log('NewAuthButton: 重要な状態変化', {
          前回の状態: {
            ユーザー: prevState.hasUser ? '有り' : '無し',
            プロフィール: prevState.hasProfile ? '有り' : '無し',
            ローディング: prevState.loading
          },
          現在の状態: {
            ユーザー: currentState.hasUser ? '有り' : '無し',
            プロフィール: currentState.hasProfile ? '有り' : '無し',
            userId: currentState.userId,
            username: profile?.username,
            ローディング: currentState.loading
          }
        });

        // 状態を更新
        prevStateRef.current = currentState;
      }
    }
  }, [user, profile, loading, isDebugMode]);

  // ローディング中はスケルトンを表示（ただしタイムアウトしたら表示しない）
  if (loading && !user && !isLoadingTimeout) {
    return (
      <div className={`w-28 h-10 rounded-md animate-pulse ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-300'
        }`}></div>
    );
  }

  // ログイン済みならProfileMenuを表示
  if (user) {
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
      className={`px-4 py-2 rounded-md transition-colors ${theme === 'dark'
        ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
        : 'bg-indigo-500 hover:bg-indigo-600 text-white'
        }`}
    >
      {isDebugMode ? `未ログイン状態` : 'ログイン'}
    </Link>
  );
};

export default NewAuthButton;
