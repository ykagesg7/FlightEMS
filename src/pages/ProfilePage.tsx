import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { useAuthStore } from '../stores/authStore';
import { toAppError } from '../types/error';
import supabase from '../utils/supabase';

const ProfilePage = () => {
  const user = useAuthStore(state => state.user);
  const profile = useAuthStore(state => state.profile);
  const loading = useAuthStore(state => state.loading);
  const updateProfile = useAuthStore(state => state.updateProfile);

  const { theme } = useTheme();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // プロフィール編集状態
  const [username, setUsername] = useState('');
  const [fullName, setFullName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [tempAvatarUrl, setTempAvatarUrl] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  // パスワード変更状態
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // アニメーション状態
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');

  // 未ログインならリダイレクト
  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [loading, user, navigate]);

  // プロフィール情報の初期化
  useEffect(() => {
    if (profile) {
      setUsername(profile.username || '');
      setFullName(profile.full_name || '');
      const currentAvatarUrl = profile.avatar_url || '';
      setAvatarUrl(currentAvatarUrl);
      setTempAvatarUrl(currentAvatarUrl);
    }
  }, [profile]);

  // アバター画像アップロード処理
  const handleAvatarUpload = useCallback(async (file: File) => {
    if (!file || !user) return;

    // ファイルタイプとサイズの検証
    if (!file.type.startsWith('image/')) {
      setError('画像ファイルを選択してください');
      return;
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB制限
      setError('ファイルサイズは5MB以下にしてください');
      return;
    }

    setError('');
    setSuccess('');
    setIsUploadingAvatar(true);

    try {
      setUploadProgress(10);

      // ファイル名を生成（ユーザーIDとタイムスタンプを使用）
      const timestamp = Date.now();
      const extension = file.name.split('.').pop()?.toLowerCase() || 'jpg';
      const fileName = `avatar_${user.id}_${timestamp}.${extension}`;

      setUploadProgress(30);

      // Supabaseストレージにアップロード
      const { data: uploadData, error: uploadError } = await supabase
        .storage
        .from('avatars')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        throw new Error(uploadError.message || 'アップロードに失敗しました');
      }

      setUploadProgress(60);

      // パブリックURLを取得
      const { data: { publicUrl } } = supabase
        .storage
        .from('avatars')
        .getPublicUrl(uploadData.path);

      if (!publicUrl) {
        throw new Error('アップロードしたファイルのURLを取得できませんでした');
      }

      setUploadProgress(80);

      // プロフィールの存在確認と更新
      const { data: existingProfile, error: selectError } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', user.id)
        .single();

      if (selectError && selectError.code !== 'PGRST116') {
        console.error('Profile select error:', selectError);
        throw new Error('プロフィール確認中にエラーが発生しました');
      }

      if (!existingProfile) {
        // プロフィールが存在しない場合は作成
        const { error: insertError } = await supabase
          .from('profiles')
          .insert({
            id: user.id,
            username: user.email?.split('@')[0] || `user_${user.id.slice(0, 8)}`,
            email: user.email,
            avatar_url: publicUrl,
            full_name: null,
            roll: 'Student'
          });

        if (insertError) {
          console.error('Profile insert error:', insertError);
          throw new Error(insertError.message || 'プロフィール作成に失敗しました');
        }
      } else {
        // プロフィールが存在する場合は更新
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ avatar_url: publicUrl })
          .eq('id', user.id);

        if (updateError) {
          console.error('Profile update error:', updateError);
          throw new Error(updateError.message || 'プロフィール更新に失敗しました');
        }
      }

      setUploadProgress(90);

      // 画像キャッシュ回避のため、URLにタイムスタンプを追加
      const timestampedUrl = `${publicUrl}?t=${Date.now()}`;

      // 状態を更新
      setTempAvatarUrl(timestampedUrl);
      setAvatarUrl(timestampedUrl);

      // プロフィールストアを更新（データベースには元のURLを保存）
      updateProfile({ avatar_url: publicUrl });

      setUploadProgress(100);
      setSuccess('プロフィール画像を更新しました');

      // プログレスバーをリセット
      setTimeout(() => {
        setUploadProgress(0);
        setSuccess('');
      }, 3000);

    } catch (err: unknown) {
      console.error('Avatar upload error:', err);
      const appError = toAppError(err);
      setError(appError.message || 'アバター画像のアップロードに失敗しました');
      setUploadProgress(0);
    } finally {
      setIsUploadingAvatar(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  }, [user, updateProfile]);

  // アバター削除処理
  const handleDeleteAvatar = useCallback(async () => {
    if (!user || !avatarUrl) return;

    if (!confirm('プロフィール画像を削除しますか？')) {
      return;
    }

    setError('');
    setSuccess('');
    setIsUploadingAvatar(true);

    try {
      // 既存のアバター画像のパスを抽出
      const urlParts = avatarUrl.split('/');
      const fileName = urlParts[urlParts.length - 1];

      // Supabaseストレージから画像を削除
      const { error: deleteError } = await supabase
        .storage
        .from('avatars')
        .remove([fileName]);

      if (deleteError) {
        console.warn('Storage delete error:', deleteError);
        // ストレージの削除エラーは警告のみで続行
      }

      // プロフィールのavatar_urlをnullに更新
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: null })
        .eq('id', user.id);

      if (updateError) {
        throw new Error(updateError.message || 'プロフィール更新に失敗しました');
      }

      // 状態を更新
      setAvatarUrl('');
      setTempAvatarUrl('');

      // プロフィールストアを更新
      updateProfile({ avatar_url: null });

      setSuccess('プロフィール画像を削除しました');
      setTimeout(() => setSuccess(''), 3000);

    } catch (err: unknown) {
      console.error('Avatar delete error:', err);
      const appError = toAppError(err);
      setError(appError.message || 'アバター削除中にエラーが発生しました');
    } finally {
      setIsUploadingAvatar(false);
    }
  }, [user, avatarUrl, updateProfile]);

  // ドラッグ&ドロップハンドラー
  const [isDragging, setIsDragging] = useState(false);

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    const imageFile = files.find(file => file.type.startsWith('image/'));

    if (imageFile) {
      handleAvatarUpload(imageFile);
    } else if (files.length > 0) {
      setError('画像ファイルを選択してください');
    }
  }, [handleAvatarUpload]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleAvatarUpload(file);
    }
  }, [handleAvatarUpload]);

  // プロフィール更新処理
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!username.trim()) {
      setError('ユーザー名は必須です');
      return;
    }

    try {
      setError(null);
      setSuccess(null);
      setFormLoading(true);

      const { error } = await updateProfile({
        username,
        full_name: fullName,
        avatar_url: tempAvatarUrl,
        updated_at: new Date().toISOString()
      });

      if (error) {
        setError(error.message || 'プロフィールの更新に失敗しました');
      } else {
        setAvatarUrl(tempAvatarUrl);
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
        password: newPassword
      });

      if (error) {
        setPasswordError(error.message || 'パスワードの更新に失敗しました');
      } else {
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

  // ユーザー名の頭文字を取得
  const getInitial = () => {
    if (username) return username.charAt(0).toUpperCase();
    if (user?.email) return user.email.charAt(0).toUpperCase();
    return 'U';
  };

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${theme === 'dark'
        ? 'bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900'
        : 'bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50'
        }`}>
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-t-transparent border-indigo-500"></div>
          <p className={`text-lg ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
            プロフィールを読み込み中...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-all duration-300 ${theme === 'dark'
      ? 'bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900'
      : 'bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50'
      }`}>
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* ヘッダー */}
        <div className="mb-8">
          <button
            onClick={() => navigate(-1)}
            className={`inline-flex items-center space-x-2 mb-4 px-4 py-2 rounded-lg transition-all duration-200 ${theme === 'dark'
              ? 'text-gray-300 hover:text-white hover:bg-white/10'
              : 'text-gray-600 hover:text-gray-800 hover:bg-white/50'
              }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span>戻る</span>
          </button>

          <div className="flex items-center justify-between">
            <div>
              <h1 className={`text-4xl font-bold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>
                プロフィール設定
              </h1>
              <p className={`text-lg ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                }`}>
                あなたの情報を管理しましょう
              </p>
            </div>
          </div>
        </div>

        {/* タブナビゲーション */}
        <div className={`backdrop-blur-xl rounded-2xl p-2 mb-8 shadow-lg border ${theme === 'dark'
          ? 'bg-white/5 border-white/10'
          : 'bg-white/80 border-white/20'
          }`}>
          <div className="flex space-x-1">
            {[
              { id: 'profile', name: 'プロフィール', icon: '👤' },
              { id: 'security', name: 'セキュリティ', icon: '🔒' },
              { id: 'preferences', name: '設定', icon: '⚙️' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-6 py-3 rounded-xl transition-all duration-200 ${activeTab === tab.id
                  ? theme === 'dark'
                    ? 'bg-indigo-600 text-white shadow-lg'
                    : 'bg-indigo-500 text-white shadow-lg'
                  : theme === 'dark'
                    ? 'text-gray-400 hover:text-white hover:bg-white/10'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
                  }`}
              >
                <span className="text-lg">{tab.icon}</span>
                <span className="font-medium">{tab.name}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* プロフィールカード */}
          <div className={`lg:col-span-1 backdrop-blur-xl rounded-2xl p-8 shadow-xl border transition-all duration-300 ${theme === 'dark'
            ? 'bg-white/5 border-white/10'
            : 'bg-white/80 border-white/20'
            }`}>
            <div className="text-center">
              {/* アバター画像 */}
              <div
                className={`relative mx-auto mb-6 group cursor-pointer transition-all duration-200 ${isDragging
                  ? 'scale-105 ring-4 ring-indigo-400 ring-opacity-50'
                  : ''
                  }`}
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                <div className="relative w-32 h-32 mx-auto">
                  {tempAvatarUrl ? (
                    <img
                      key={tempAvatarUrl} // keyを追加してReactが強制的に再レンダリングするように
                      src={tempAvatarUrl}
                      alt="プロフィール画像"
                      className="w-full h-full rounded-full object-cover border-4 border-indigo-400 shadow-lg transition-transform duration-300 group-hover:scale-105"
                      onError={() => {
                        console.warn('Avatar image failed to load:', tempAvatarUrl);
                        setTempAvatarUrl('');
                        setAvatarUrl('');
                      }}
                      onLoad={() => {
                        console.log('Avatar image loaded successfully:', tempAvatarUrl);
                      }}
                    />
                  ) : (
                    <div className={`w-full h-full rounded-full flex items-center justify-center border-4 border-indigo-400 shadow-lg transition-all duration-300 group-hover:scale-105 ${theme === 'dark'
                      ? 'bg-gradient-to-br from-indigo-600 to-purple-600 text-white'
                      : 'bg-gradient-to-br from-indigo-500 to-purple-500 text-white'
                      }`}>
                      <span className="text-3xl font-bold">{getInitial()}</span>
                    </div>
                  )}

                  {/* オーバーレイ */}
                  <div className={`absolute inset-0 rounded-full flex items-center justify-center transition-opacity duration-300 ${'opacity-0 group-hover:opacity-100'
                    } bg-black/50`}>
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>

                  {/* アップロードプログレス */}
                  {uploadProgress > 0 && uploadProgress < 100 && (
                    <div className="absolute inset-0 rounded-full flex items-center justify-center bg-black/70">
                      <div className="text-center">
                        <div className="w-12 h-12 mx-auto mb-2">
                          <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                            <path
                              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeDasharray={`${uploadProgress}, 100`}
                              className="text-indigo-400"
                            />
                          </svg>
                        </div>
                        <p className="text-xs text-white">{uploadProgress}%</p>
                      </div>
                    </div>
                  )}
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </div>

              <h2 className={`text-2xl font-bold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>
                {fullName || username || 'ユーザー'}
              </h2>

              <p className={`text-sm mb-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                }`}>
                {user?.email}
              </p>

              {profile?.roll && (
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${theme === 'dark'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-indigo-100 text-indigo-800'
                  }`}>
                  {profile.roll === 'Student' ? '学生' : profile.roll === 'Teacher' ? '教師' : profile.roll}
                </span>
              )}

              <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                <p className={`text-xs mb-4 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                  画像をクリックまたはドラッグ&ドロップでアップロード
                </p>

                {/* アバター削除ボタン */}
                {(avatarUrl || tempAvatarUrl) && (
                  <button
                    onClick={handleDeleteAvatar}
                    disabled={isUploadingAvatar}
                    className={`w-full px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${isUploadingAvatar
                      ? 'bg-gray-400 text-gray-700 cursor-not-allowed'
                      : theme === 'dark'
                        ? 'bg-red-600 hover:bg-red-700 text-white'
                        : 'bg-red-500 hover:bg-red-600 text-white'
                      }`}
                  >
                    {isUploadingAvatar ? (
                      <div className="flex items-center justify-center space-x-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>処理中...</span>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center space-x-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        <span>画像を削除</span>
                      </div>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* メインコンテンツ */}
          <div className="lg:col-span-2 space-y-6">
            {activeTab === 'profile' && (
              <div className={`backdrop-blur-xl rounded-2xl p-8 shadow-xl border transition-all duration-300 ${theme === 'dark'
                ? 'bg-white/5 border-white/10'
                : 'bg-white/80 border-white/20'
                }`}>
                <div className="flex items-center justify-between mb-6">
                  <h3 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'
                    }`}>
                    基本情報
                  </h3>
                  <button
                    onClick={() => setIsEditing(!isEditing)}
                    className={`px-4 py-2 rounded-lg transition-all duration-200 ${isEditing
                      ? 'bg-gray-500 hover:bg-gray-600 text-white'
                      : 'bg-indigo-500 hover:bg-indigo-600 text-white'
                      }`}
                  >
                    {isEditing ? 'キャンセル' : '編集'}
                  </button>
                </div>

                {error && (
                  <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                    <p className="text-red-500 text-sm">{error}</p>
                  </div>
                )}

                {success && (
                  <div className="mb-6 p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                    <p className="text-green-500 text-sm">{success}</p>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                        }`}>
                        ユーザー名 *
                      </label>
                      <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        disabled={!isEditing}
                        className={`w-full px-4 py-3 rounded-lg border transition-all duration-200 ${isEditing
                          ? theme === 'dark'
                            ? 'bg-gray-800 border-gray-600 text-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20'
                            : 'bg-white border-gray-300 text-gray-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20'
                          : theme === 'dark'
                            ? 'bg-gray-800/50 border-gray-700 text-gray-400 cursor-not-allowed'
                            : 'bg-gray-50 border-gray-300 text-gray-500 cursor-not-allowed'
                          }`}
                        placeholder="ユーザー名を入力"
                      />
                    </div>

                    <div>
                      <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                        }`}>
                        フルネーム
                      </label>
                      <input
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        disabled={!isEditing}
                        className={`w-full px-4 py-3 rounded-lg border transition-all duration-200 ${isEditing
                          ? theme === 'dark'
                            ? 'bg-gray-800 border-gray-600 text-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20'
                            : 'bg-white border-gray-300 text-gray-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20'
                          : theme === 'dark'
                            ? 'bg-gray-800/50 border-gray-700 text-gray-400 cursor-not-allowed'
                            : 'bg-gray-50 border-gray-300 text-gray-500 cursor-not-allowed'
                          }`}
                        placeholder="フルネームを入力"
                      />
                    </div>
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                      メールアドレス
                    </label>
                    <input
                      type="email"
                      value={user?.email || ''}
                      disabled
                      className={`w-full px-4 py-3 rounded-lg border cursor-not-allowed ${theme === 'dark'
                        ? 'bg-gray-800/50 border-gray-700 text-gray-400'
                        : 'bg-gray-50 border-gray-300 text-gray-500'
                        }`}
                    />
                    <p className={`text-xs mt-1 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'
                      }`}>
                      メールアドレスは変更できません
                    </p>
                  </div>

                  {isEditing && (
                    <div className="flex space-x-4">
                      <button
                        type="submit"
                        disabled={formLoading}
                        className="flex-1 bg-indigo-500 hover:bg-indigo-600 disabled:bg-indigo-400 text-white py-3 px-6 rounded-lg transition-all duration-200 font-medium flex items-center justify-center space-x-2"
                      >
                        {formLoading ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                            <span>更新中...</span>
                          </>
                        ) : (
                          <>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            <span>保存</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </form>
              </div>
            )}

            {activeTab === 'security' && (
              <div className={`backdrop-blur-xl rounded-2xl p-8 shadow-xl border transition-all duration-300 ${theme === 'dark'
                ? 'bg-white/5 border-white/10'
                : 'bg-white/80 border-white/20'
                }`}>
                <div className="flex items-center justify-between mb-6">
                  <h3 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'
                    }`}>
                    セキュリティ設定
                  </h3>
                  <button
                    onClick={() => setShowPasswordForm(!showPasswordForm)}
                    className={`px-4 py-2 rounded-lg transition-all duration-200 ${showPasswordForm
                      ? 'bg-gray-500 hover:bg-gray-600 text-white'
                      : 'bg-indigo-500 hover:bg-indigo-600 text-white'
                      }`}
                  >
                    {showPasswordForm ? 'キャンセル' : 'パスワード変更'}
                  </button>
                </div>

                {showPasswordForm && (
                  <div className="space-y-6">
                    {passwordError && (
                      <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                        <p className="text-red-500 text-sm">{passwordError}</p>
                      </div>
                    )}

                    {passwordSuccess && (
                      <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                        <p className="text-green-500 text-sm">{passwordSuccess}</p>
                      </div>
                    )}

                    <form onSubmit={handlePasswordChange} className="space-y-6">
                      <div>
                        <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                          }`}>
                          現在のパスワード
                        </label>
                        <div className="relative">
                          <input
                            type={showPassword ? 'text' : 'password'}
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            className={`w-full px-4 py-3 pr-12 rounded-lg border transition-all duration-200 ${theme === 'dark'
                              ? 'bg-gray-800 border-gray-600 text-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20'
                              : 'bg-white border-gray-300 text-gray-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20'
                              }`}
                            placeholder="現在のパスワードを入力"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className={`absolute right-3 top-3 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                              }`}
                          >
                            {showPassword ? (
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                              </svg>
                            ) : (
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                            )}
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                          }`}>
                          新しいパスワード
                        </label>
                        <input
                          type="password"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          className={`w-full px-4 py-3 rounded-lg border transition-all duration-200 ${theme === 'dark'
                            ? 'bg-gray-800 border-gray-600 text-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20'
                            : 'bg-white border-gray-300 text-gray-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20'
                            }`}
                          placeholder="新しいパスワードを入力（8文字以上）"
                        />
                      </div>

                      <div>
                        <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                          }`}>
                          パスワード確認
                        </label>
                        <input
                          type="password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className={`w-full px-4 py-3 rounded-lg border transition-all duration-200 ${theme === 'dark'
                            ? 'bg-gray-800 border-gray-600 text-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20'
                            : 'bg-white border-gray-300 text-gray-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20'
                            }`}
                          placeholder="新しいパスワードを再入力"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={passwordLoading}
                        className="w-full bg-indigo-500 hover:bg-indigo-600 disabled:bg-indigo-400 text-white py-3 px-6 rounded-lg transition-all duration-200 font-medium flex items-center justify-center space-x-2"
                      >
                        {passwordLoading ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                            <span>更新中...</span>
                          </>
                        ) : (
                          <>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                            <span>パスワードを更新</span>
                          </>
                        )}
                      </button>
                    </form>
                  </div>
                )}

                {!showPasswordForm && (
                  <div className="space-y-4">
                    <div className={`p-6 border rounded-lg ${theme === 'dark'
                      ? 'border-gray-700 bg-gray-800/50'
                      : 'border-gray-200 bg-gray-50'
                      }`}>
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'
                            }`}>
                            パスワード
                          </h4>
                          <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                            }`}>
                            最後に更新: 不明
                          </p>
                        </div>
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'preferences' && (
              <div className={`backdrop-blur-xl rounded-2xl p-8 shadow-xl border transition-all duration-300 ${theme === 'dark'
                ? 'bg-white/5 border-white/10'
                : 'bg-white/80 border-white/20'
                }`}>
                <h3 className={`text-2xl font-bold mb-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}>
                  設定
                </h3>

                <div className="space-y-6">
                  <div className={`p-6 border rounded-lg ${theme === 'dark'
                    ? 'border-gray-700 bg-gray-800/50'
                    : 'border-gray-200 bg-gray-50'
                    }`}>
                    <h4 className={`font-medium mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'
                      }`}>
                      テーマ設定
                    </h4>
                    <p className={`text-sm mb-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                      ライトモードまたはダークモードを選択
                    </p>
                    <div className="flex space-x-4">
                      <button className={`px-4 py-2 rounded-lg ${theme === 'light'
                        ? 'bg-indigo-500 text-white'
                        : 'bg-gray-200 text-gray-700'
                        }`}>
                        ライト
                      </button>
                      <button className={`px-4 py-2 rounded-lg ${theme === 'dark'
                        ? 'bg-indigo-500 text-white'
                        : 'bg-gray-200 text-gray-700'
                        }`}>
                        ダーク
                      </button>
                    </div>
                  </div>

                  <div className={`p-6 border rounded-lg ${theme === 'dark'
                    ? 'border-gray-700 bg-gray-800/50'
                    : 'border-gray-200 bg-gray-50'
                    }`}>
                    <h4 className={`font-medium mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'
                      }`}>
                      通知設定
                    </h4>
                    <p className={`text-sm mb-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                      学習の進捗やお知らせに関する通知
                    </p>
                    <div className="space-y-3">
                      <label className="flex items-center">
                        <input type="checkbox" className="mr-3" defaultChecked />
                        <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>
                          学習の進捗通知
                        </span>
                      </label>
                      <label className="flex items-center">
                        <input type="checkbox" className="mr-3" defaultChecked />
                        <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>
                          新しいコンテンツの通知
                        </span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
