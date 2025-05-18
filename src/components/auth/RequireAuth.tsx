import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';

interface RequireAuthProps {
  children: React.ReactNode;
}

/**
 * 認証されたユーザーのみがアクセスできるルートを保護するコンポーネント
 * 未認証の場合はログインページにリダイレクトする
 */
const RequireAuth: React.FC<RequireAuthProps> = ({ children }) => {
  const location = useLocation();
  const user = useAuthStore(state => state.user);
  const loading = useAuthStore(state => state.loading);

  // ユーザーが存在しない場合はログインページにリダイレクト
  // loadingがtrueの場合は、認証情報を取得中なのでリダイレクトしない
  if (!loading && !user) {
    console.log('認証が必要なページへのアクセス - ログインページにリダイレクト');
    // 現在のURLをリダイレクト後に復元できるように state に保存
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  // 認証情報を取得中の場合はローディングを表示
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  // 認証が完了している場合は子コンポーネントを表示
  return <>{children}</>;
};

export default RequireAuth; 