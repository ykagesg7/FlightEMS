import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuthStore } from '../../stores/authStore';
import supabase, { getProfileWithRetry } from '../../utils/supabase';

const ProfileMenu = () => {
  const user = useAuthStore(state => state.user);
  const profile = useAuthStore(state => state.profile);
  const signOut = useAuthStore(state => state.signOut);
  const { theme } = useTheme();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [localProfile, setLocalProfile] = useState<Record<string, unknown> | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // プロフィール情報がない場合は取得を試みる
  useEffect(() => {
    const fetchProfile = async () => {
      if (user && !profile && !localProfile && !isLoading) {
        setIsLoading(true);
        console.log('プロフィール情報取得を試みます', {
          userId: user.id,
          hasAuthContext: !!profile,
          hasLocalProfile: !!localProfile
        });

        try {
          // セッション状態を確認
          const { data: sessionData } = await supabase.auth.getSession();
          console.log('ProfileMenu: 現在のセッション状態:', {
            hasSession: !!sessionData.session,
            userId: sessionData.session?.user?.id
          });

          // 拡張関数を使用してプロフィールを取得
          const { data, error, warning } = await getProfileWithRetry(user.id);

          if (error) {
            console.error('ProfileMenu: プロフィール取得エラー:', error);

            // 認証状態をリフレッシュして再試行
            console.log('ProfileMenu: 認証状態をリフレッシュして再取得を試みます');
            await supabase.auth.refreshSession();

            // リフレッシュ後の再取得を試みる
            const retryResult = await getProfileWithRetry(user.id);

            if (!retryResult.error && retryResult.data) {
              console.log('ProfileMenu: リフレッシュ後のプロフィール取得成功:', retryResult.data);
              setLocalProfile(retryResult.data);
            } else {
              // 最終的なフォールバック
              const errorFallbackProfile = {
                id: user.id,
                username: user.email?.split('@')[0] || 'ユーザー'
              };
              console.log('ProfileMenu: 最終的なフォールバックプロフィールを使用:', errorFallbackProfile);
              setLocalProfile(errorFallbackProfile);
            }
          } else {
            if (warning) {
              console.warn('ProfileMenu: プロフィール取得警告:', warning);
            }
            console.log('ProfileMenu: プロフィール取得成功:', data);
            setLocalProfile(data);
          }
        } catch (err) {
          console.error('ProfileMenu: 予期せぬエラー:', err);
          // 例外時のフォールバックプロフィール
          const exceptionFallbackProfile = {
            id: user.id,
            username: user.email?.split('@')[0] || 'ユーザー'
          };
          console.log('ProfileMenu: 例外時のフォールバックプロフィールを使用:', exceptionFallbackProfile);
          setLocalProfile(exceptionFallbackProfile);
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchProfile();
  }, [user, profile, localProfile, isLoading]);

  // ドロップダウン外のクリックを検知して閉じる
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // ログアウト確認を表示
  const confirmLogout = () => {
    setIsOpen(false);
    setShowLogoutConfirm(true);
  };

  // ログアウト処理
  const handleLogout = async () => {
    try {
      await signOut();
      setShowLogoutConfirm(false);
      setLocalProfile(null);
      navigate('/');
    } catch (error) {
      console.error('ログアウトエラー:', error);
    }
  };

  // キャンセル処理
  const cancelLogout = () => {
    setShowLogoutConfirm(false);
  };

  // 使用するプロフィールを決定（コンテキストからのプロフィールまたはローカルで取得したプロフィール）
  const effectiveProfile = profile || localProfile;

  // ユーザー情報もプロフィールもない場合のフォールバック
  if (!user) {
    return (
      <div className={`px-4 py-2 rounded-md transition-colors ${theme === 'dark'
        ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
        : 'bg-indigo-500 hover:bg-indigo-600 text-white'
        }`}>
        ログイン
      </div>
    );
  }

  // ユーザー情報はあるがプロフィールがロード中の場合
  if (isLoading) {
    return (
      <div className={`px-4 py-2 rounded-md transition-colors ${theme === 'dark'
        ? 'bg-indigo-800 text-white'
        : 'bg-indigo-700 text-white'
        }`}>
        <div className="flex items-center space-x-2">
          <div className="w-5 h-5 border-t-2 border-b-2 border-white rounded-full animate-spin"></div>
          <span>ロード中...</span>
        </div>
      </div>
    );
  }

  // ユーザー名の頭文字をアバターとして表示
  const getInitial = () => {
    if (!effectiveProfile) return user.email?.[0]?.toUpperCase() || 'U';
    const username = effectiveProfile.username as string;
    return username ? username.charAt(0).toUpperCase() : 'U';
  };

  // 画像エラー状態管理（無限ループ防止）
  const [imageError, setImageError] = useState(false);

  // プロフィールが変更されたらエラー状態をリセット
  useEffect(() => {
    setImageError(false);
    // プロフィール更新時にlocalProfileもクリアして最新情報を取得
    if (effectiveProfile?.avatar_url && effectiveProfile?.avatar_url !== localProfile?.avatar_url) {
      setLocalProfile(null);
    }
  }, [effectiveProfile?.avatar_url, localProfile?.avatar_url]);

  return (
    <>
      <div className="relative z-40" ref={dropdownRef}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center space-x-2 focus:outline-none px-2 py-1 rounded-md hover:bg-opacity-20 hover:bg-white"
          aria-expanded={isOpen}
          aria-label="ユーザーメニュー"
        >
          {effectiveProfile?.avatar_url && !imageError ? (
            <img
              key={effectiveProfile.avatar_url}
              src={effectiveProfile.avatar_url as string}
              alt="プロフィール画像"
              className="w-8 h-8 rounded-full object-cover border-2 border-indigo-300"
              onError={(e) => {
                console.warn('アバター画像の読み込みに失敗しました:', effectiveProfile.avatar_url);
                setImageError(true);
              }}
            />
          ) : (
            <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${theme === 'dark' ? 'bg-indigo-600 border-indigo-400' : 'bg-indigo-500 border-indigo-300'
              } text-white font-semibold`}>
              {getInitial()}
            </div>
          )}
        </button>

        {isOpen && (
          <div className={`absolute right-0 mt-2 w-56 rounded-md shadow-lg py-1 z-50 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'
            } ring-1 ring-black ring-opacity-5 transform origin-top-right transition-all duration-200`}>
            <div className={`px-4 py-3 text-sm border-b ${theme === 'dark' ? 'text-gray-300 border-gray-700' : 'text-gray-700 border-gray-200'
              }`}>
              <p className="font-semibold">{(effectiveProfile?.full_name as string) || (effectiveProfile?.username as string) || user.email?.split('@')[0] || 'ユーザー'}</p>
              <p className="text-xs truncate">{user.email}</p>
              {(effectiveProfile?.roll as string) && (
                <p className={`text-xs mt-1 inline-block px-2 py-1 rounded-full ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'
                  }`}>
                  {(effectiveProfile?.roll as string) === 'Student' ? '学生' : (effectiveProfile?.roll as string) === 'Teacher' ? '教師' : (effectiveProfile?.roll as string)}
                </p>
              )}
            </div>

            <Link
              to="/profile"
              className={`block px-4 py-2 text-sm ${theme === 'dark'
                ? 'text-gray-300 hover:bg-gray-700'
                : 'text-gray-700 hover:bg-gray-100'
                } flex items-center`}
              onClick={() => setIsOpen(false)}
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              プロフィール設定
            </Link>

            <Link
              to="/learning"
              className={`block px-4 py-2 text-sm ${theme === 'dark'
                ? 'text-gray-300 hover:bg-gray-700'
                : 'text-gray-700 hover:bg-gray-100'
                } flex items-center`}
              onClick={() => setIsOpen(false)}
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              学習コンテンツ
            </Link>

            <button
              onClick={confirmLogout}
              className={`block w-full text-left px-4 py-2 text-sm ${theme === 'dark'
                ? 'text-red-400 hover:bg-gray-700'
                : 'text-red-600 hover:bg-gray-100'
                } flex items-center`}
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              ログアウト
            </button>
          </div>
        )}
      </div>

      {/* ログアウト確認ダイアログ */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={`${theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'
            } p-6 rounded-lg shadow-xl max-w-md w-full mx-4`}>
            <h3 className="text-lg font-semibold mb-3">ログアウトの確認</h3>
            <p className="mb-4">ログアウトしてもよろしいですか？</p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={cancelLogout}
                className={`px-4 py-2 rounded-md ${theme === 'dark'
                  ? 'bg-gray-700 hover:bg-gray-600'
                  : 'bg-gray-200 hover:bg-gray-300'
                  }`}
              >
                キャンセル
              </button>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                ログアウト
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ProfileMenu;
