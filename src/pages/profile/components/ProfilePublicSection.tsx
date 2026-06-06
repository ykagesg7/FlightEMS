import React, { useEffect, useState } from 'react';
import { Button } from '../../../components/ui';
import { Card, CardContent, CardHeader } from '../../../components/ui/Card';
import { Typography } from '../../../components/ui/Typography';
import type { Database } from '../../../types/database.types';
import { AvatarUploader } from './AvatarUploader';

type Profile = Database['public']['Tables']['profiles']['Row'];

interface ProfilePublicSectionProps {
  profile: Profile | null;
  userEmail: string | null | undefined;
  onSave: (payload: Partial<Profile>) => Promise<{ error: { message: string } | null }>;
  onError: (message: string) => void;
  onSuccess: (message: string) => void;
}

export const ProfilePublicSection: React.FC<ProfilePublicSectionProps> = ({
  profile,
  userEmail,
  onSave,
  onError,
  onSuccess,
}) => {
  const [username, setUsername] = useState('');
  const [fullName, setFullName] = useState('');
  const [bio, setBio] = useState('');
  const [website, setWebsite] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!profile) return;
    setUsername(profile.username || '');
    setFullName(profile.full_name || '');
    setBio(profile.bio || '');
    setWebsite(profile.website || '');
  }, [profile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) {
      onError('ユーザー名は必須です');
      return;
    }
    if (website && !/^https?:\/\//i.test(website)) {
      onError('WebサイトURLはhttp(s)から始まる形式で入力してください');
      return;
    }

    setSaving(true);
    const { error } = await onSave({
      username: username.trim(),
      full_name: fullName.trim() || null,
      bio: bio.trim() || null,
      website: website.trim() || null,
    });
    setSaving(false);
    if (error) {
      onError(error.message || '保存に失敗しました');
      return;
    }
    onSuccess('プロフィールを保存しました');
  };

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <div className="lg:col-span-1">
        <AvatarUploader
          currentAvatarUrl={profile?.avatar_url}
          onUploadComplete={() => onSuccess('プロフィール画像を更新しました')}
          onError={onError}
        />
      </div>
      <div className="lg:col-span-2">
        <Card variant="brand" padding="lg">
          <CardHeader>
            <Typography variant="h3" color="brand" className="text-xl font-bold">
              公開プロフィール
            </Typography>
            <Typography variant="body-sm" color="muted" className="mt-1">
              学習コミュニティに表示される情報です
            </Typography>
          </CardHeader>
          <CardContent>
            <form onSubmit={(e) => void handleSubmit(e)} className="space-y-5">
              <ProfileField label="ユーザー名*" id="profile-username">
                <input
                  id="profile-username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className={inputClass}
                  autoComplete="username"
                />
              </ProfileField>
              <ProfileField label="フルネーム" id="profile-fullname">
                <input
                  id="profile-fullname"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className={inputClass}
                />
              </ProfileField>
              <ProfileField label="学習目標・自己紹介" id="profile-bio">
                <textarea
                  id="profile-bio"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={4}
                  className={`${inputClass} resize-none`}
                  placeholder="例: PPL 試験 2026 春を目指しています"
                />
              </ProfileField>
              <ProfileField label="Webサイト" id="profile-website">
                <input
                  id="profile-website"
                  type="url"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  className={inputClass}
                  placeholder="https://example.com"
                />
              </ProfileField>
              <ProfileField label="メールアドレス" id="profile-email">
                <input
                  id="profile-email"
                  type="email"
                  value={userEmail || ''}
                  disabled
                  className={`${inputClass} cursor-not-allowed opacity-70`}
                />
                <Typography variant="caption" color="muted" className="mt-1 block">
                  メールアドレスは変更できません
                </Typography>
              </ProfileField>
              <div className="flex justify-end pt-2">
                <Button type="submit" variant="brand" disabled={saving}>
                  {saving ? '保存中...' : '保存'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

const inputClass =
  'w-full rounded-lg border-2 border-brand-primary/30 bg-brand-secondary-dark px-4 py-3 text-[var(--text-primary)] focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/50';

interface ProfileFieldProps {
  label: string;
  id: string;
  children: React.ReactNode;
}

const ProfileField: React.FC<ProfileFieldProps> = ({ label, id, children }) => (
  <div>
    <label htmlFor={id} className="mb-2 block text-sm font-medium text-[var(--text-primary)]">
      {label}
    </label>
    {children}
  </div>
);
