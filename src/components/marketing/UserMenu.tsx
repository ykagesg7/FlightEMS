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
          className="h-8 w-8 rounded-full border-2 border-brand-primary/50 object-cover"
        />
      );
    }

    // イニシャルまたはデフォルトアイコン
    const initials = profile?.username
      ? profile.username.charAt(0).toUpperCase()
      : user?.email?.charAt(0).toUpperCase() || 'U';

    return (
      <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-brand-primary/50 bg-brand-primary/20 text-sm font-bold text-brand-primary">
        {initials}
      </div>
    );
  };

  // 未ログイン時: LOGINボタンを表示
  if (!user) {
    return (
      <Link to="/auth">
        <Button
          variant="brand"
          size="sm"
          className="!px-3 !py-1.5 text-xs font-semibold uppercase tracking-wide shadow-md hover:shadow-lg"
        >
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
        className="flex items-center gap-2 rounded-lg px-2 py-1 transition-colors hover:bg-brand-primary/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/40"
        aria-label="ユーザーメニュー"
        aria-expanded={isOpen}
      >
        {getAvatarDisplay()}
        <span className="hidden font-medium text-[var(--text-primary)] md:block md:text-sm">
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
            className="absolute right-0 z-[60] mt-2 w-48 overflow-hidden rounded-lg border border-brand-primary/20 bg-[var(--panel)] shadow-xl"
          >
            <div className="py-2">
              {/* プロフィール情報 */}
              <div className="border-b border-brand-primary/15 px-4 py-3">
                <div className="flex items-center gap-3">
                  {getAvatarDisplay()}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-[var(--text-primary)]">
                      {profile?.username || user.email?.split('@')[0] || 'User'}
                    </p>
                    <p className="truncate text-xs text-[var(--text-muted)]">
                      {user.email}
                    </p>
                  </div>
                </div>
              </div>

              {/* メニュー項目 */}
              <Link
                to="/profile?tab=profile"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 px-4 py-2 text-sm text-[var(--text-primary)] transition-colors hover:bg-brand-primary/10"
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

