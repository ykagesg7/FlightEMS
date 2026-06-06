import React, { useCallback, useState } from 'react';
import { Button } from '../../../components/ui';
import { Card, CardContent, CardHeader } from '../../../components/ui/Card';
import { Typography } from '../../../components/ui/Typography';
import type { Profile } from '../../../stores/authStore';
import { toAppError } from '../../../types/error';
import supabase from '../../../utils/supabase';

interface ProfileSecuritySectionProps {
  userEmail: string | null | undefined;
  profile: Profile | null;
  updateProfile: (updates: Partial<Profile>) => Promise<{ error: { message: string } | null }>;
  onError: (message: string) => void;
  onSuccess: (message: string) => void;
}

export const ProfileSecuritySection: React.FC<ProfileSecuritySectionProps> = ({
  userEmail,
  profile,
  updateProfile,
  onError,
  onSuccess,
}) => {
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handlePasswordChange = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();

    if (!userEmail) {
      onError('メールアドレスが確認できません');
      return;
    }
    if (!currentPassword) {
      onError('現在のパスワードを入力してください');
      return;
    }
    if (!newPassword || newPassword.length < 8) {
      onError('新しいパスワードは8文字以上にしてください');
      return;
    }
    if (newPassword !== confirmPassword) {
      onError('新しいパスワードと確認用パスワードが一致しません');
      return;
    }

    setPasswordLoading(true);
    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: userEmail,
        password: currentPassword,
      });
      if (signInError) {
        onError('現在のパスワードが正しくありません');
        return;
      }

      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) {
        onError(error.message || 'パスワードの更新に失敗しました');
        return;
      }

      await updateProfile({ password_updated_at: new Date().toISOString() });
      onSuccess('パスワードを更新しました');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setShowPasswordForm(false);
    } catch (err: unknown) {
      onError(toAppError(err).message || 'パスワード更新中にエラーが発生しました');
    } finally {
      setPasswordLoading(false);
    }
  }, [confirmPassword, currentPassword, newPassword, onError, onSuccess, updateProfile, userEmail]);

  return (
    <Card variant="brand" padding="lg">
      <CardHeader>
        <div className="flex items-center justify-between gap-4">
          <Typography variant="h3" color="brand" className="text-xl font-bold">
            セキュリティ
          </Typography>
          <Button
            variant={showPasswordForm ? 'ghost' : 'brand'}
            size="sm"
            onClick={() => setShowPasswordForm((v) => !v)}
          >
            {showPasswordForm ? 'キャンセル' : 'パスワード変更'}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {showPasswordForm ? (
          <form onSubmit={(e) => void handlePasswordChange(e)} className="space-y-5">
            <PasswordField label="現在のパスワード" id="sec-current">
              <div className="relative">
                <input
                  id="sec-current"
                  type={showPassword ? 'text' : 'password'}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className={inputClass}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-3 text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                >
                  {showPassword ? '隠す' : '表示'}
                </button>
              </div>
            </PasswordField>
            <PasswordField label="新しいパスワード" id="sec-new">
              <input
                id="sec-new"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className={inputClass}
              />
            </PasswordField>
            <PasswordField label="新しいパスワード（確認）" id="sec-confirm">
              <input
                id="sec-confirm"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={inputClass}
              />
            </PasswordField>
            <div className="flex justify-end">
              <Button type="submit" variant="brand" disabled={passwordLoading}>
                {passwordLoading ? '更新中...' : 'パスワードを更新'}
              </Button>
            </div>
          </form>
        ) : (
          <div className="rounded-lg border border-brand-primary/20 bg-brand-secondary-dark/40 p-4">
            <Typography variant="body-sm" className="font-medium">
              パスワード
            </Typography>
            <Typography variant="caption" color="muted" className="mt-1 block">
              最後に更新:{' '}
              {profile?.password_updated_at
                ? new Date(profile.password_updated_at).toLocaleDateString('ja-JP')
                : '不明'}
            </Typography>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

const inputClass =
  'w-full rounded-lg border-2 border-brand-primary/30 bg-brand-secondary-dark px-4 py-3 text-[var(--text-primary)] focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/50';

interface PasswordFieldProps {
  label: string;
  id: string;
  children: React.ReactNode;
}

const PasswordField: React.FC<PasswordFieldProps> = ({ label, id, children }) => (
  <div>
    <label htmlFor={id} className="mb-2 block text-sm font-medium text-[var(--text-primary)]">
      {label}
    </label>
    {children}
  </div>
);
