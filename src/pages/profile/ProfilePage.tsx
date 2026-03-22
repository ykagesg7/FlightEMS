import { motion } from 'framer-motion';
import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { Card, CardContent, CardHeader } from '../../components/ui/Card';
import { Typography } from '../../components/ui/Typography';
import { useAuthStore } from '../../stores/authStore';
import { Database } from '../../types/database.types';
import { toAppError } from '../../types/error';
import supabase from '../../utils/supabase';
import { AvatarUploader } from './components/AvatarUploader';
import { NotificationPreferences } from './components/NotificationPreferences';
import { SocialLinksForm } from './components/SocialLinksForm';
import { PPLRankList } from '../../components/ppl/PPLRankList';

type Profile = Database['public']['Tables']['profiles']['Row'];
type SocialLinks = {
  twitter?: string;
  instagram?: string;
  youtube?: string;
  facebook?: string;
  linkedin?: string;
};

const PROFILE_TAB_IDS = [
  'profile',
  'security',
  'social',
  'notifications',
  'ppl-ranks',
] as const;

type ProfileTabId = (typeof PROFILE_TAB_IDS)[number];

function isProfileTabId(value: string): value is ProfileTabId {
  return (PROFILE_TAB_IDS as readonly string[]).includes(value);
}

const ProfilePage: React.FC = () => {
  const user = useAuthStore((state) => state.user);
  const profile = useAuthStore((state) => state.profile);
  const loading = useAuthStore((state) => state.loading);
  const updateProfile = useAuthStore((state) => state.updateProfile);
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // プロフィール編集状態
  const [username, setUsername] = useState('');
  const [fullName, setFullName] = useState('');
  const [bio, setBio] = useState('');
  const [website, setWebsite] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState<ProfileTabId>('profile');

  // ?tab= から初期タブ・共有URLを同期
  useEffect(() => {
    const raw = searchParams.get('tab');
    if (raw && isProfileTabId(raw)) {
      setActiveTab(raw);
    }
  }, [searchParams]);

  const selectTab = useCallback(
    (id: ProfileTabId) => {
      setActiveTab(id);
      setSearchParams({ tab: id }, { replace: true });
    },
    [setSearchParams],
  );

  // 状態変更の監視（デバッグ用）
  useEffect(() => {
    // 状態変更の監視は削除済み
  }, [username, bio, fullName, website, isEditing]);

  // パスワード変更状態
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // 未ログインならリダイレクト
  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [loading, user, navigate]);

  // プロフィール情報の初期化
  useEffect(() => {
    if (profile && !isEditing) {
      // 編集モードでない場合のみプロフィールデータを更新
      setUsername(profile.username || '');
      setFullName(profile.full_name || '');
      setBio(profile.bio || '');
      setWebsite(profile.website || '');
    }
  }, [profile, isEditing]);

  // プロフィール更新処理
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!username.trim()) {
      setError('ユーザー名は必須です');
      return;
    }

    if (website && !/^https?:\/\//i.test(website)) {
      setError('WebサイトURLはhttp(s)から始まる形式で入力してください');
      return;
    }

    try {
      setError(null);
      setSuccess(null);
      setFormLoading(true);

      const payload: Partial<Profile> = {
        username,
        full_name: fullName || null,
        bio: bio || null,
        website: website || null,
        updated_at: new Date().toISOString(),
      };

      const { error } = await updateProfile(payload);

      if (error) {
        setError(error.message || 'プロフィールの更新に失敗しました');
      } else {
        setSuccess('プロフィールを更新しました');
        setIsEditing(false);
        setTimeout(() => setSuccess(null), 3000);
      }
    } catch (err: unknown) {
      const appError = toAppError(err);
      setError(appError.message || '更新中にエラーが発生しました');
    } finally {
      setFormLoading(false);
    }
  };

  // パスワード変更処理
  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentPassword) {
      setPasswordError('現在のパスワードを入力してください');
      return;
    }

    if (!newPassword) {
      setPasswordError('新しいパスワードを入力してください');
      return;
    }

    if (newPassword.length < 8) {
      setPasswordError('パスワードは8文字以上にしてください');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('新しいパスワードと確認用パスワードが一致しません');
      return;
    }

    try {
      setPasswordError(null);
      setPasswordSuccess(null);
      setPasswordLoading(true);

      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user!.email!,
        password: currentPassword,
      });

      if (signInError) {
        setPasswordError('現在のパスワードが正しくありません');
        setPasswordLoading(false);
        return;
      }

      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        setPasswordError(error.message || 'パスワードの更新に失敗しました');
      } else {
        // パスワード更新日時をプロフィールに記録
        const passwordUpdatedAt = new Date().toISOString();
        const { error: profileError } = await updateProfile({
          password_updated_at: passwordUpdatedAt,
        });

        if (profileError) {
          console.warn('パスワード更新日時の記録に失敗しました:', profileError);
          // プロフィール更新の失敗は警告のみ（パスワード更新は成功しているため）
        }

        setPasswordSuccess('パスワードを更新しました');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setTimeout(() => {
          setPasswordSuccess(null);
          setShowPasswordForm(false);
        }, 3000);
      }
    } catch (err: unknown) {
      const appError = toAppError(err);
      setPasswordError(appError.message || 'パスワード更新中にエラーが発生しました');
    } finally {
      setPasswordLoading(false);
    }
  };

  // ソーシャルリンク保存処理
  const handleSocialLinksSave = useCallback(
    async (socialLinks: SocialLinks) => {
      try {
        const { error } = await updateProfile({
          social_links: socialLinks,
          updated_at: new Date().toISOString(),
        });

        if (error) {
          throw error;
        }

        setSuccess('ソーシャルリンクを保存しました');
        setTimeout(() => setSuccess(null), 3000);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : '保存に失敗しました';
        setError(errorMessage);
        setTimeout(() => setError(null), 5000);
      }
    },
    [updateProfile]
  );

  // アバターアップロード完了処理
  const handleAvatarUploadComplete = useCallback(
    async (_url: string) => {
      setSuccess('プロフィール画像を更新しました');
      setTimeout(() => setSuccess(null), 3000);
    },
    []
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-whiskyPapa-black py-8">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-t-transparent border-whiskyPapa-yellow"></div>
          <Typography variant="body" color="muted">
            プロフィールを読み込み中...
          </Typography>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const tabs = [
    { id: 'profile' as const, name: 'プロフィール', icon: '👤' },
    { id: 'security' as const, name: 'セキュリティ', icon: '🔒' },
    { id: 'social' as const, name: 'ソーシャル', icon: '🔗' },
    { id: 'notifications' as const, name: '通知', icon: '🔔' },
    { id: 'ppl-ranks' as const, name: 'PPLランク', icon: '🎖️' },
  ];

  return (
    <div className="min-h-screen bg-whiskyPapa-black py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* ページヘッダー */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8"
        >
          <Typography variant="h1" color="brand" className="mb-2">
            プロフィール設定
          </Typography>
          <Typography variant="body" color="muted">
            あなたの情報を管理しましょう
          </Typography>
        </motion.div>

        {/* 成功/エラーメッセージ */}
        {success && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-green-500/10 border border-green-500/20 rounded-lg"
          >
            <Typography variant="body-sm" className="text-green-400">
              {success}
            </Typography>
          </motion.div>
        )}

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg"
          >
            <Typography variant="body-sm" className="text-red-400">
              {error}
            </Typography>
          </motion.div>
        )}

        {/* タブナビゲーション */}
        <Card variant="brand" padding="sm" className="mb-8">
          <div className="flex flex-wrap gap-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => selectTab(tab.id)}
                className={`flex items-center space-x-2 px-6 py-3 rounded-xl transition-all duration-200 ${activeTab === tab.id
                  ? 'bg-brand-primary text-brand-secondary font-semibold shadow-lg'
                  : 'text-white hover:bg-whiskyPapa-yellow/10'
                  }`}
              >
                <span className="text-lg">{tab.icon}</span>
                <span>{tab.name}</span>
              </button>
            ))}
          </div>
        </Card>

        {/* タブコンテンツ */}
        <div className="space-y-6">
          {activeTab === 'profile' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* アバターアップローダー */}
                <div className="lg:col-span-1">
                  <AvatarUploader
                    currentAvatarUrl={profile?.avatar_url}
                    onUploadComplete={handleAvatarUploadComplete}
                    onError={(err) => setError(err)}
                  />
                </div>

                {/* プロフィール情報フォーム */}
                <div className="lg:col-span-2">
                  <Card variant="brand" padding="lg">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <Typography variant="h3" color="brand" className="text-xl font-bold">
                          基本情報
                        </Typography>
                        <Button
                          variant={isEditing ? 'ghost' : 'brand'}
                          size="sm"
                          onClick={() => {
                            // 編集モードを切り替え
                            const newIsEditing = !isEditing;

                            // キャンセル時にプロフィールデータを再読み込み
                            if (isEditing && profile) {
                              setUsername(profile.username || '');
                              setFullName(profile.full_name || '');
                              setBio(profile.bio || '');
                              setWebsite(profile.website || '');
                            }

                            setIsEditing(newIsEditing);
                          }}
                        >
                          {isEditing ? 'キャンセル' : '編集'}
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                          <label className="block mb-2">
                            <Typography variant="body-sm" className="font-medium">
                              ユーザー名*
                            </Typography>
                          </label>
                          <input
                            type="text"
                            value={username}
                            onChange={(e) => {
                              setUsername(e.target.value);
                            }}
                            disabled={!isEditing}
                            className={`w-full px-4 py-3 rounded-lg border-2 transition-all duration-200 ${isEditing
                              ? 'border-brand-primary/30 focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 bg-brand-secondary-light text-white'
                              : 'border-brand-primary/10 bg-brand-secondary/50 text-gray-100 cursor-not-allowed'
                              } focus:outline-none`}
                            placeholder="ユーザー名を入力"
                          />
                        </div>

                        <div>
                          <label className="block mb-2">
                            <Typography variant="body-sm" className="font-medium">
                              フルネーム
                            </Typography>
                          </label>
                          <input
                            type="text"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            disabled={!isEditing}
                            className={`w-full px-4 py-3 rounded-lg border-2 transition-all duration-200 ${isEditing
                              ? 'border-brand-primary/30 focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 bg-brand-secondary-light text-white'
                              : 'border-brand-primary/10 bg-brand-secondary/50 text-gray-100 cursor-not-allowed'
                              } focus:outline-none`}
                            placeholder="フルネームを入力"
                          />
                        </div>

                        <div>
                          <label className="block mb-2">
                            <Typography variant="body-sm" className="font-medium">
                              自己紹介
                            </Typography>
                          </label>
                          <textarea
                            value={bio}
                            onChange={(e) => {
                              setBio(e.target.value);
                            }}
                            disabled={!isEditing}
                            rows={4}
                            className={`w-full px-4 py-3 rounded-lg border-2 transition-all duration-200 ${isEditing
                              ? 'border-brand-primary/30 focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 bg-brand-secondary-light text-white'
                              : 'border-brand-primary/10 bg-brand-secondary/50 text-gray-100 cursor-not-allowed'
                              } focus:outline-none resize-none`}
                            placeholder="自己紹介を入力"
                          />
                        </div>

                        <div>
                          <label className="block mb-2">
                            <Typography variant="body-sm" className="font-medium">
                              Webサイト
                            </Typography>
                          </label>
                          <input
                            type="url"
                            value={website}
                            onChange={(e) => setWebsite(e.target.value)}
                            disabled={!isEditing}
                            className={`w-full px-4 py-3 rounded-lg border-2 transition-all duration-200 ${isEditing
                              ? 'border-brand-primary/30 focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 bg-brand-secondary-light text-white'
                              : 'border-brand-primary/10 bg-brand-secondary/50 text-gray-100 cursor-not-allowed'
                              } focus:outline-none`}
                            placeholder="https://example.com"
                          />
                        </div>

                        <div>
                          <label className="block mb-2">
                            <Typography variant="body-sm" className="font-medium">
                              メールアドレス
                            </Typography>
                          </label>
                          <input
                            type="email"
                            value={user.email || ''}
                            disabled
                            className="w-full px-4 py-3 rounded-lg border-2 border-brand-primary/10 bg-brand-secondary/50 text-gray-300 cursor-not-allowed"
                          />
                          <Typography variant="caption" color="muted" className="mt-1 block">
                            メールアドレスは変更できません
                          </Typography>
                        </div>

                        {isEditing && (
                          <div className="flex justify-end gap-3 pt-4">
                            <Button type="submit" variant="brand" disabled={formLoading}>
                              {formLoading ? '保存中...' : '保存'}
                            </Button>
                          </div>
                        )}
                      </form>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </motion.div >
          )}

          {
            activeTab === 'security' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Card variant="brand" padding="lg">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <Typography variant="h3" color="brand" className="text-xl font-bold">
                        セキュリティ設定
                      </Typography>
                      <Button
                        variant={showPasswordForm ? 'ghost' : 'brand'}
                        size="sm"
                        onClick={() => setShowPasswordForm(!showPasswordForm)}
                      >
                        {showPasswordForm ? 'キャンセル' : 'パスワード変更'}
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {showPasswordForm ? (
                      <form onSubmit={handlePasswordChange} className="space-y-6">
                        {passwordError && (
                          <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                            <Typography variant="body-sm" className="text-red-400">
                              {passwordError}
                            </Typography>
                          </div>
                        )}

                        {passwordSuccess && (
                          <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                            <Typography variant="body-sm" className="text-green-400">
                              {passwordSuccess}
                            </Typography>
                          </div>
                        )}

                        <div>
                          <label className="block mb-2">
                            <Typography variant="body-sm" className="font-medium">
                              現在のパスワード
                            </Typography>
                          </label>
                          <div className="relative">
                            <input
                              type={showPassword ? 'text' : 'password'}
                              value={currentPassword}
                              onChange={(e) => setCurrentPassword(e.target.value)}
                              className="w-full px-4 py-3 pr-12 rounded-lg border-2 border-brand-primary/30 focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 bg-brand-secondary-light text-white focus:outline-none"
                              placeholder="現在のパスワードを入力"
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-3 top-3 text-gray-300 hover:text-white transition-colors"
                            >
                              {showPassword ? (
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"
                                  />
                                </svg>
                              ) : (
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                  />
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                  />
                                </svg>
                              )}
                            </button>
                          </div>
                        </div>

                        <div>
                          <label className="block mb-2">
                            <Typography variant="body-sm" className="font-medium">
                              新しいパスワード
                            </Typography>
                          </label>
                          <input
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className="w-full px-4 py-3 rounded-lg border-2 border-brand-primary/30 focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 bg-brand-secondary-light text-white focus:outline-none"
                            placeholder="新しいパスワードを入力（8文字以上）"
                          />
                        </div>

                        <div>
                          <label className="block mb-2">
                            <Typography variant="body-sm" className="font-medium">
                              パスワード確認
                            </Typography>
                          </label>
                          <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="w-full px-4 py-3 rounded-lg border-2 border-brand-primary/30 focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 bg-brand-secondary-light text-white focus:outline-none"
                            placeholder="新しいパスワードを再入力"
                          />
                        </div>

                        <div className="flex justify-end gap-3 pt-4">
                          <Button type="submit" variant="brand" disabled={passwordLoading}>
                            {passwordLoading ? '更新中...' : 'パスワードを更新'}
                          </Button>
                        </div>
                      </form>
                    ) : (
                      <div className="space-y-4">
                        <Card variant="brand" padding="md">
                          <div className="flex items-center justify-between">
                            <div>
                              <Typography variant="body-sm" className="font-medium">
                                パスワード
                              </Typography>
                              <Typography variant="caption" color="muted">
                                最後に更新: {profile?.password_updated_at
                                  ? new Date(profile.password_updated_at).toLocaleDateString('ja-JP', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric',
                                  })
                                  : '不明'}
                              </Typography>
                            </div>
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          </div>
                        </Card>
                      </div>
                    )}
                  </CardContent>
                </Card >
              </motion.div >
            )
          }

          {
            activeTab === 'social' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <SocialLinksForm
                  currentSocialLinks={profile?.social_links}
                  onSave={handleSocialLinksSave}
                  onError={(err) => setError(err)}
                />
              </motion.div>
            )
          }

          {
            activeTab === 'notifications' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <NotificationPreferences onError={(err) => setError(err)} />
              </motion.div>
            )
          }

          {
            activeTab === 'ppl-ranks' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Card variant="brand" padding="lg">
                  <CardHeader>
                    <Typography variant="h3" color="brand" className="text-xl font-bold">
                      PPLランク
                    </Typography>
                  </CardHeader>
                  <CardContent>
                    <PPLRankList groupBy="level" showProgress={false} />
                  </CardContent>
                </Card>
              </motion.div>
            )
          }
        </div >
      </div >
    </div >
  );
};

export default ProfilePage;
