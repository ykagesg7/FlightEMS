import { AnimatePresence, motion } from 'framer-motion';
import { LogOut, UserCircle } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { Button } from '../ui';

/**
 * UserMenu Component
 * 認証状態に応じてLOGINボタンまたはユーザーアイコン+ドロップダウンメニューを表示
 */
export const UserMenu: React.FC = () => {
  const { user, profile, signOut } = useAuthStore();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // 外部クリックでメニューを閉じる
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // ログアウト処理
  const handleSignOut = async () => {
    await signOut();
    setIsOpen(false);
    navigate('/');
  };

  // ユーザーアバターの表示（プロフィール画像またはイニシャル）
  const getAvatarDisplay = () => {
    if (profile?.avatar_url) {
      return (
        <img
          src={profile.avatar_url}
          alt={profile.username || 'User'}
          className="w-8 h-8 rounded-full object-cover border-2 border-whiskyPapa-yellow/50"
        />
      );
    }

    // イニシャルまたはデフォルトアイコン
    const initials = profile?.username
      ? profile.username.charAt(0).toUpperCase()
      : user?.email?.charAt(0).toUpperCase() || 'U';

    return (
      <div className="w-8 h-8 rounded-full bg-whiskyPapa-yellow/20 border-2 border-whiskyPapa-yellow/50 flex items-center justify-center text-whiskyPapa-yellow font-bold text-sm">
        {initials}
      </div>
    );
  };

  // 未ログイン時: LOGINボタンを表示
  if (!user) {
    return (
      <Link to="/auth">
        <Button variant="brand" size="md" className="px-4 py-2">
          LOGIN
        </Button>
      </Link>
    );
  }

  // ログイン時: ユーザーアイコンとドロップダウンメニュー
  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-2 py-1 rounded-lg hover:bg-whiskyPapa-yellow/10 transition-colors focus:outline-none focus:ring-2 focus:ring-whiskyPapa-yellow/50"
        aria-label="ユーザーメニュー"
        aria-expanded={isOpen}
      >
        {getAvatarDisplay()}
        <span className="hidden md:block text-sm text-white font-medium">
          {profile?.username || user.email?.split('@')[0] || 'User'}
        </span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 mt-2 w-48 bg-whiskyPapa-black border border-whiskyPapa-yellow/30 rounded-lg shadow-xl z-50 overflow-hidden"
          >
            <div className="py-2">
              {/* プロフィール情報 */}
              <div className="px-4 py-3 border-b border-whiskyPapa-yellow/10">
                <div className="flex items-center gap-3">
                  {getAvatarDisplay()}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">
                      {profile?.username || user.email?.split('@')[0] || 'User'}
                    </p>
                    <p className="text-xs text-gray-400 truncate">
                      {user.email}
                    </p>
                  </div>
                </div>
              </div>

              {/* メニュー項目 */}
              <Link
                to="/account?tab=profile"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 px-4 py-2 text-sm text-white hover:bg-whiskyPapa-yellow/10 transition-colors"
              >
                <UserCircle className="w-4 h-4" />
                プロフィール設定
              </Link>
              <button
                onClick={handleSignOut}
                className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                ログアウト
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

