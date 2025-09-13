import React, { useCallback, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { useAuthStore } from '../stores/authStore';
import supabase from '../utils/supabase';

function useQueryParam(key: string): [string | null, (v: string) => void] {
  const navigate = useNavigate();
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const value = params.get(key);
  const setValue = (v: string) => {
    const next = new URLSearchParams(location.search);
    next.set(key, v);
    navigate({ pathname: location.pathname, search: next.toString() }, { replace: true });
  };
  return [value, setValue];
}

const AccountCenter: React.FC = () => {
  const { user, profile } = useAuthStore();
  const updateProfile = useAuthStore(s => s.updateProfile);
  const { theme, setTheme } = useTheme();
  const [tab, setTab] = useQueryParam('tab');
  const navigate = useNavigate();
  const current = tab ?? (user ? 'overview' : 'auth');

  // Profile states (edit)
  const [isEditing, setIsEditing] = useState(false);
  const [username, setUsername] = useState('');
  const [fullName, setFullName] = useState('');
  const [website, setWebsite] = useState('');
  const [pError, setPError] = useState<string | null>(null);
  const [pSuccess, setPSuccess] = useState<string | null>(null);
  const [pLoading, setPLoading] = useState(false);

  useEffect(() => {
    if (profile) {
      setUsername(profile.username ?? '');
      setFullName(profile.full_name ?? '');
      setWebsite(profile.website ?? '');
    }
  }, [profile]);

  const handleSaveProfile = useCallback(async () => {
    if (!isEditing) return;
    if (!username.trim()) {
      setPError('ユーザー名は必須です');
      return;
    }
    if (website && !/^https?:\/\//i.test(website)) {
      setPError('WebサイトURLはhttp(s)から始まる形式で入力してください');
      return;
    }
    try {
      setPLoading(true);
      setPError(null);
      setPSuccess(null);
      const { error } = await updateProfile({
        username,
        full_name: fullName,
        website: website || null,
        updated_at: new Date().toISOString()
      } as any);
      if (error) {
        setPError(error.message || 'プロフィールの更新に失敗しました');
      } else {
        setPSuccess('プロフィールを更新しました');
        setIsEditing(false);
        setTimeout(() => setPSuccess(null), 2500);
      }
    } finally {
      setPLoading(false);
    }
  }, [isEditing, username, fullName, website, updateProfile]);

  // Security states (password)
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [sError, setSError] = useState<string | null>(null);
  const [sSuccess, setSSuccess] = useState<string | null>(null);
  const [sLoading, setSLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);

  const handlePasswordChange = useCallback(async () => {
    if (!currentPassword) { setSError('現在のパスワードを入力してください'); return; }
    if (!newPassword) { setSError('新しいパスワードを入力してください'); return; }
    if (newPassword.length < 8) { setSError('パスワードは8文字以上にしてください'); return; }
    if (newPassword !== confirmPassword) { setSError('新しいパスワードと確認用パスワードが一致しません'); return; }
    try {
      setSError(null); setSSuccess(null); setSLoading(true);
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user!.email!, password: currentPassword
      });
      if (signInError) { setSError('現在のパスワードが正しくありません'); setSLoading(false); return; }
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) setSError(error.message || 'パスワードの更新に失敗しました');
      else {
        setSSuccess('パスワードを更新しました');
        setCurrentPassword(''); setNewPassword(''); setConfirmPassword('');
        setTimeout(() => { setSSuccess(null); setShowPasswordForm(false); }, 2500);
      }
    } finally { setSLoading(false); }
  }, [currentPassword, newPassword, confirmPassword, user]);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto rounded-2xl border border-[color:var(--hud-dim)] bg-[color:var(--panel)]/80 p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold hud-text">Account Center</h2>
          <div className="flex gap-2">
            {['overview', 'profile', 'security', 'theme'].map((t) => (
              <button key={t} onClick={() => setTab(t)} className={`px-3 py-1 rounded-md border ${current === t ? 'border-[color:var(--hud-primary)] text-[color:var(--hud-primary)]' : 'border-[color:var(--hud-dim)]'}`}>{t}</button>
            ))}
          </div>
        </div>

        {current === 'overview' && (
          <div className="space-y-3">
            <div className="text-sm opacity-80">ユーザー: {profile?.username || user?.email || 'Guest'}</div>
            <div className="text-sm opacity-80">メール: {profile?.email || user?.email || '-'}</div>
            <div className="text-sm opacity-80">ロール: {profile?.roll || '未設定'}</div>
            <div className="text-sm opacity-80">テーマ: {theme}</div>
          </div>
        )}

        {current === 'theme' && (
          <div className="space-y-4">
            <div className="hud-text font-medium">テーマ設定</div>
            <div className="flex gap-2">
              <button className={`px-3 py-2 rounded-md border ${theme === 'day' ? 'border-[color:var(--hud-primary)] text-[color:var(--hud-primary)]' : 'border-[color:var(--hud-dim)]'}`} onClick={() => setTheme('day')}>Day</button>
              <button className={`px-3 py-2 rounded-md border ${theme === 'dark' ? 'border-[color:var(--hud-primary)] text-[color:var(--hud-primary)]' : 'border-[color:var(--hud-dim)]'}`} onClick={() => setTheme('dark')}>Dark</button>
              <button className={`px-3 py-2 rounded-md border ${theme === 'auto' ? 'border-[color:var(--hud-primary)] text-[color:var(--hud-primary)]' : 'border-[color:var(--hud-dim)]'}`} onClick={() => setTheme('auto')}>Auto</button>
            </div>
          </div>
        )}

        {current === 'profile' && (
          <div className="space-y-6">
            {pError && <div className="p-3 text-sm border border-red-500/40 text-red-400 rounded-md">{pError}</div>}
            {pSuccess && <div className="p-3 text-sm border border-green-500/40 text-green-400 rounded-md">{pSuccess}</div>}
            <div className="flex items-center justify-between">
              <div className="hud-text font-medium">基本情報</div>
              <div className="flex gap-2">
                <button className={`px-3 py-2 rounded-md border ${isEditing ? 'border-gray-500 text-gray-300' : 'border-[color:var(--hud-primary)] text-[color:var(--hud-primary)]'}`} onClick={() => setIsEditing(v => !v)}>{isEditing ? 'キャンセル' : '編集'}</button>
                {isEditing && (
                  <button className={`px-3 py-2 rounded-md border border-[color:var(--hud-primary)] text-[color:var(--hud-primary)]`} disabled={pLoading} onClick={handleSaveProfile}>{pLoading ? '保存中...' : '保存'}</button>
                )}
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-2 hud-text">ユーザー名</label>
                <input className={`w-full px-4 py-3 rounded-lg border ${isEditing ? 'bg-[color:var(--panel)] border-[color:var(--hud-dim)] text-[color:var(--text-primary)]' : 'bg-[color:var(--panel)]/50 border-[color:var(--hud-dim)] text-[color:var(--text-muted)] cursor-not-allowed'}`} value={username} onChange={e => setUsername(e.target.value)} readOnly={!isEditing} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 hud-text">フルネーム</label>
                <input className={`w-full px-4 py-3 rounded-lg border ${isEditing ? 'bg-[color:var(--panel)] border-[color:var(--hud-dim)] text-[color:var(--text-primary)]' : 'bg-[color:var(--panel)]/50 border-[color:var(--hud-dim)] text-[color:var(--text-muted)] cursor-not-allowed'}`} value={fullName} onChange={e => setFullName(e.target.value)} readOnly={!isEditing} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 hud-text">Webサイト</label>
                <input className={`w-full px-4 py-3 rounded-lg border ${isEditing ? 'bg-[color:var(--panel)] border-[color:var(--hud-dim)] text-[color:var(--text-primary)]' : 'bg-[color:var(--panel)]/50 border-[color:var(--hud-dim)] text-[color:var(--text-muted)] cursor-not-allowed'}`} value={website} onChange={e => setWebsite(e.target.value)} readOnly={!isEditing} placeholder="https://example.com" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 hud-text">ロール</label>
                <input className="w-full px-4 py-3 rounded-lg border bg-[color:var(--panel)]/50 border-[color:var(--hud-dim)] text-[color:var(--text-muted)]" value={profile?.roll ?? ''} readOnly />
              </div>
            </div>
          </div>
        )}

        {current === 'security' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="hud-text font-medium">パスワード</div>
              <button className={`px-3 py-2 rounded-md border border-[color:var(--hud-primary)] text-[color:var(--hud-primary)]`} onClick={() => setShowPasswordForm(v => !v)}>{showPasswordForm ? '閉じる' : '変更する'}</button>
            </div>
            {showPasswordForm && (
              <div className="space-y-4">
                {sError && <div className="p-3 text-sm border border-red-500/40 text-red-400 rounded-md">{sError}</div>}
                {sSuccess && <div className="p-3 text-sm border border-green-500/40 text-green-400 rounded-md">{sSuccess}</div>}
                <div>
                  <label className="block text-sm font-medium mb-2">現在のパスワード</label>
                  <input type={showPw ? 'text' : 'password'} className="w-full px-4 py-3 rounded-lg border bg-[color:var(--panel)] border-[color:var(--hud-dim)] text-[color:var(--text-primary)]" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">新しいパスワード</label>
                  <input type="password" className="w-full px-4 py-3 rounded-lg border bg-[color:var(--panel)] border-[color:var(--hud-dim)] text-[color:var(--text-primary)]" value={newPassword} onChange={e => setNewPassword(e.target.value)} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">パスワード確認</label>
                  <input type="password" className="w-full px-4 py-3 rounded-lg border bg-[color:var(--panel)] border-[color:var(--hud-dim)] text-[color:var(--text-primary)]" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} />
                </div>
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2 text-sm opacity-80"><input type="checkbox" onChange={e => setShowPw(e.target.checked)} /> パスワード表示</label>
                  <button disabled={sLoading} onClick={handlePasswordChange} className="px-3 py-2 rounded-md border border-[color:var(--hud-primary)] text-[color:var(--hud-primary)]">{sLoading ? '更新中...' : '更新'}</button>
                </div>
              </div>
            )}
          </div>
        )}

        {current === 'auth' && (
          <div className="space-y-2">
            <p className="text-sm opacity-80">ログインが必要です。</p>
            <button className="px-3 py-2 rounded-md border border-[color:var(--hud-primary)] text-[color:var(--hud-primary)]" onClick={() => navigate('/auth')}>ログインへ</button>
          </div>
        )}
      </div>
    </div>
  );
}

export default AccountCenter;


