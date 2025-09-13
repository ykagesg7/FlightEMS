import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuthStore } from '../../stores/authStore';

export const AvatarMenu: React.FC = () => {
  const navigate = useNavigate();
  const { theme, setTheme, effectiveTheme } = useTheme();
  const session = useAuthStore(s => s.session);
  const profile = useAuthStore(s => s.profile);
  const signOut = useAuthStore(s => s.signOut);

  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (!open) return;
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onEsc);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onEsc);
    };
  }, [open]);

  const initial = (profile?.username || profile?.email || 'U').charAt(0).toUpperCase();

  const itemClass = 'w-full text-left px-3 py-2 rounded-md hover:bg-[color:var(--hud-dim)]';

  return (
    <div className="relative" ref={menuRef}>
      <button
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen(v => !v)}
        className="w-9 h-9 rounded-full border border-[color:var(--hud-primary)] text-[color:var(--hud-primary)] flex items-center justify-center overflow-hidden hover:bg-[color:var(--hud-dim)]"
      >
        {profile?.avatar_url ? (
          <img
            src={profile.avatar_url}
            alt="avatar"
            className="w-full h-full object-cover"
            onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
          />
        ) : (
          <span className="font-bold">{initial}</span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 min-w-[240px] rounded-xl border border-[color:var(--hud-dim)] bg-[color:var(--panel)] shadow-xl p-2 z-50">
          <div className="px-3 py-2 text-sm opacity-80">
            {profile?.username || 'User'}
            {profile?.email ? <div className="opacity-70 text-xs">{profile.email}</div> : null}
          </div>
          <div className="h-px bg-[color:var(--hud-dim)] my-1" />
          <button className={itemClass} onClick={() => { navigate('/account?tab=overview'); setOpen(false); }}>アカウントセンター</button>
          <button className={itemClass} onClick={() => { navigate('/account?tab=profile'); setOpen(false); }}>プロフィール</button>
          <button className={itemClass} onClick={() => { navigate('/account?tab=security'); setOpen(false); }}>セキュリティ</button>
          <div className="h-px bg-[color:var(--hud-dim)] my-1" />
          <div className="px-3 py-2 text-sm opacity-80">テーマ</div>
          <div className="grid grid-cols-3 gap-2 px-2 pb-2">
            <button
              className={`px-2 py-1 rounded-md border ${theme === 'day' ? 'border-[color:var(--hud-primary)] text-[color:var(--hud-primary)]' : 'border-[color:var(--hud-dim)]'}`}
              onClick={() => setTheme('day')}
            >Day</button>
            <button
              className={`px-2 py-1 rounded-md border ${theme === 'dark' ? 'border-[color:var(--hud-primary)] text-[color:var(--hud-primary)]' : 'border-[color:var(--hud-dim)]'}`}
              onClick={() => setTheme('dark')}
            >Dark</button>
            <button
              className={`px-2 py-1 rounded-md border ${theme === 'auto' ? 'border-[color:var(--hud-primary)] text-[color:var(--hud-primary)]' : 'border-[color:var(--hud-dim)]'}`}
              onClick={() => setTheme('auto')}
            >Auto</button>
          </div>
          <div className="h-px bg-[color:var(--hud-dim)] my-1" />
          {session ? (
            <button className={itemClass} onClick={async () => { await signOut(); setOpen(false); }}>ログアウト</button>
          ) : (
            <button className={itemClass} onClick={() => { navigate('/auth'); setOpen(false); }}>ログイン</button>
          )}
        </div>
      )}
    </div>
  );
};

export default AvatarMenu;


