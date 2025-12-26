import React, { useCallback, useRef, useState } from 'react';
import { useAuthStore } from '../../stores/authStore';
import { toAppError } from '../../types/error';
import supabase from '../../utils/supabase';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Typography } from '../ui/Typography';

interface AvatarUploaderProps {
  currentAvatarUrl?: string | null;
  onUploadComplete?: (url: string) => void;
  onError?: (error: string) => void;
}

export const AvatarUploader: React.FC<AvatarUploaderProps> = ({
  currentAvatarUrl,
  onUploadComplete,
  onError,
}) => {
  const user = useAuthStore((state) => state.user);
  const updateProfile = useAuthStore((state) => state.updateProfile);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentAvatarUrl || null);

  // 画像アクセステスト関数（画像読み込みで確認、タイムアウトを短縮）
  const testImageAccess = async (imageUrl: string): Promise<{ canAccess: boolean; error?: string }> => {
    // #region agent log
    const testStartTime = Date.now();
    fetch('http://127.0.0.1:7242/ingest/df8c824b-ad69-49a1-bdf1-acbbc4f35ebd', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'AvatarUploader.tsx:29', message: 'testImageAccess started', data: { imageUrl }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run1', hypothesisId: 'A' }) }).catch(() => { });
    // #endregion
    return new Promise((resolve) => {
      let resolved = false;
      const img = new Image();
      const timeoutId = setTimeout(() => {
        if (!resolved) {
          resolved = true;
          // #region agent log
          const testEndTime = Date.now();
          fetch('http://127.0.0.1:7242/ingest/df8c824b-ad69-49a1-bdf1-acbbc4f35ebd', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'AvatarUploader.tsx:47', message: 'testImageAccess timeout', data: { duration: testEndTime - testStartTime }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run1', hypothesisId: 'A' }) }).catch(() => { });
          // #endregion
          resolve({ canAccess: false, error: 'タイムアウト' });
        }
      }, 1000); // タイムアウトを1秒に短縮

      img.onload = () => {
        if (!resolved) {
          resolved = true;
          clearTimeout(timeoutId);
          // #region agent log
          const testEndTime = Date.now();
          fetch('http://127.0.0.1:7242/ingest/df8c824b-ad69-49a1-bdf1-acbbc4f35ebd', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'AvatarUploader.tsx:35', message: 'testImageAccess success', data: { duration: testEndTime - testStartTime }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run1', hypothesisId: 'A' }) }).catch(() => { });
          // #endregion
          resolve({ canAccess: true });
        }
      };
      img.onerror = () => {
        if (!resolved) {
          resolved = true;
          clearTimeout(timeoutId);
          // #region agent log
          const testEndTime = Date.now();
          fetch('http://127.0.0.1:7242/ingest/df8c824b-ad69-49a1-bdf1-acbbc4f35ebd', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'AvatarUploader.tsx:40', message: 'testImageAccess error', data: { duration: testEndTime - testStartTime }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run1', hypothesisId: 'A' }) }).catch(() => { });
          // #endregion
          resolve({ canAccess: false, error: '画像の読み込みに失敗しました' });
        }
      };
      img.src = imageUrl;
    });
  };

  // アバター画像アップロード処理
  const handleAvatarUpload = useCallback(
    async (file: File) => {
      if (!file || !user) return;

      // ファイルタイプとサイズの検証
      if (!file.type.startsWith('image/')) {
        onError?.('画像ファイルを選択してください');
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        // 5MB制限
        onError?.('ファイルサイズは5MB以下にしてください');
        return;
      }

      // #region agent log
      const uploadStartTime = Date.now();
      fetch('http://127.0.0.1:7242/ingest/df8c824b-ad69-49a1-bdf1-acbbc4f35ebd', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'AvatarUploader.tsx:45', message: 'handleAvatarUpload started', data: { fileSize: file.size, fileType: file.type }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run1', hypothesisId: 'B' }) }).catch(() => { });
      // #endregion

      setIsUploading(true);
      setUploadProgress(0);

      try {
        setUploadProgress(10);

        // プレビュー用のURLを生成
        const preview = URL.createObjectURL(file);
        setPreviewUrl(preview);

        // ファイル名を生成（ユーザーIDとタイムスタンプを使用）
        const timestamp = Date.now();
        const extension = file.name.split('.').pop()?.toLowerCase() || 'jpg';
        const fileName = `avatar_${user.id}_${timestamp}.${extension}`;

        setUploadProgress(30);

        // Supabaseストレージにアップロード
        // #region agent log
        const storageUploadStartTime = Date.now();
        fetch('http://127.0.0.1:7242/ingest/df8c824b-ad69-49a1-bdf1-acbbc4f35ebd', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'AvatarUploader.tsx:77', message: 'Storage upload started', data: { fileName }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run1', hypothesisId: 'C' }) }).catch(() => { });
        // #endregion
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(fileName, file, {
            cacheControl: '3600',
            upsert: false,
          });
        // #region agent log
        const storageUploadEndTime = Date.now();
        fetch('http://127.0.0.1:7242/ingest/df8c824b-ad69-49a1-bdf1-acbbc4f35ebd', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'AvatarUploader.tsx:85', message: 'Storage upload completed', data: { duration: storageUploadEndTime - storageUploadStartTime, error: uploadError?.message }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run1', hypothesisId: 'C' }) }).catch(() => { });
        // #endregion

        if (uploadError) {
          throw new Error(uploadError.message || 'アップロードに失敗しました');
        }

        setUploadProgress(60);

        // パブリックURLを取得
        const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(uploadData.path);

        if (!publicUrl) {
          throw new Error('アップロードしたファイルのURLを取得できませんでした');
        }

        setUploadProgress(80);

        // 画像アクセステストを実行（非ブロッキング、バックグラウンドで実行）
        let finalImageUrl = publicUrl;
        // パブリックURLを直接使用し、アクセステストは非同期で実行（ブロッキングしない）
        testImageAccess(publicUrl).then((accessTestResult) => {
          // アクセステストが失敗した場合のみ署名付きURLを生成（非同期）
          if (!accessTestResult.canAccess) {
            supabase.storage
              .from('avatars')
              .createSignedUrl(uploadData.path, 60 * 60 * 24 * 365)
              .then(({ data: signedUrlData, error: signedError }) => {
                if (!signedError && signedUrlData?.signedUrl) {
                  // 署名付きURLでプロフィールを更新（非同期）
                  updateProfile({ avatar_url: signedUrlData.signedUrl });
                }
              })
              .catch(() => {
                // エラーは無視（パブリックURLを使用）
              });
          }
        }).catch(() => {
          // エラーは無視（パブリックURLを使用）
        });

        setUploadProgress(90);

        // プロフィールの存在確認と更新
        // #region agent log
        const profileUpdateStartTime = Date.now();
        fetch('http://127.0.0.1:7242/ingest/df8c824b-ad69-49a1-bdf1-acbbc4f35ebd', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'AvatarUploader.tsx:120', message: 'Profile update started', data: {}, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run1', hypothesisId: 'D' }) }).catch(() => { });
        // #endregion
        const { data: existingProfile, error: selectError } = await supabase
          .from('profiles')
          .select('id')
          .eq('id', user.id)
          .single();

        if (selectError && selectError.code !== 'PGRST116') {
          throw new Error('プロフィール確認中にエラーが発生しました');
        }

        if (!existingProfile) {
          // プロフィールが存在しない場合は作成
          const { error: insertError } = await supabase.from('profiles').insert({
            id: user.id,
            username: user.email?.split('@')[0] || `user_${user.id.slice(0, 8)}`,
            email: user.email,
            avatar_url: finalImageUrl,
            full_name: null,
            roll: 'Student',
          });

          if (insertError) {
            throw new Error(insertError.message || 'プロフィール作成に失敗しました');
          }
        } else {
          // プロフィールが存在する場合は更新
          const { error: updateError } = await supabase
            .from('profiles')
            .update({ avatar_url: finalImageUrl })
            .eq('id', user.id);

          if (updateError) {
            throw new Error(updateError.message || 'プロフィール更新に失敗しました');
          }
        }

        // プロフィールストアを更新（非同期、UIをブロックしない）
        updateProfile({ avatar_url: finalImageUrl }).then(() => {
          // #region agent log
          const profileUpdateEndTime = Date.now();
          fetch('http://127.0.0.1:7242/ingest/df8c824b-ad69-49a1-bdf1-acbbc4f35ebd', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'AvatarUploader.tsx:155', message: 'Profile update completed', data: { duration: profileUpdateEndTime - profileUpdateStartTime }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run1', hypothesisId: 'D' }) }).catch(() => { });
          // #endregion
        }).catch(() => {
          // エラーは無視（既にDBに保存されているため）
        });

        setUploadProgress(100);
        // #region agent log
        const uploadEndTime = Date.now();
        fetch('http://127.0.0.1:7242/ingest/df8c824b-ad69-49a1-bdf1-acbbc4f35ebd', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'AvatarUploader.tsx:160', message: 'handleAvatarUpload completed', data: { totalDuration: uploadEndTime - uploadStartTime }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run1', hypothesisId: 'B' }) }).catch(() => { });
        // #endregion
        onUploadComplete?.(finalImageUrl);

        // プログレスバーをリセット
        setTimeout(() => {
          setUploadProgress(0);
        }, 2000);
      } catch (err: unknown) {
        console.error('Avatar upload error:', err);
        const appError = toAppError(err);
        onError?.(appError.message || 'アバター画像のアップロードに失敗しました');
        setPreviewUrl(currentAvatarUrl || null);
        setUploadProgress(0);
      } finally {
        setIsUploading(false);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    },
    [user, updateProfile, currentAvatarUrl, onUploadComplete, onError]
  );

  // アバター削除処理
  const handleDeleteAvatar = useCallback(async () => {
    if (!user || !currentAvatarUrl) return;

    if (!confirm('プロフィール画像を削除しますか？')) {
      return;
    }

    // #region agent log
    const deleteStartTime = Date.now();
    fetch('http://127.0.0.1:7242/ingest/df8c824b-ad69-49a1-bdf1-acbbc4f35ebd', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'AvatarUploader.tsx:248', message: 'handleDeleteAvatar started', data: { currentAvatarUrl }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run1', hypothesisId: 'G' }) }).catch(() => { });
    // #endregion

    setIsUploading(true);

    try {
      // 既存のアバター画像のパスを抽出
      const urlParts = currentAvatarUrl.split('/');
      const fileName = urlParts[urlParts.length - 1];

      // Supabaseストレージから画像を削除
      // #region agent log
      const storageDeleteStartTime = Date.now();
      fetch('http://127.0.0.1:7242/ingest/df8c824b-ad69-49a1-bdf1-acbbc4f35ebd', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'AvatarUploader.tsx:263', message: 'Storage delete started', data: { fileName }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run1', hypothesisId: 'H' }) }).catch(() => { });
      // #endregion
      const { error: deleteError } = await supabase.storage.from('avatars').remove([fileName]);
      // #region agent log
      const storageDeleteEndTime = Date.now();
      fetch('http://127.0.0.1:7242/ingest/df8c824b-ad69-49a1-bdf1-acbbc4f35ebd', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'AvatarUploader.tsx:267', message: 'Storage delete completed', data: { duration: storageDeleteEndTime - storageDeleteStartTime, error: deleteError?.message }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run1', hypothesisId: 'H' }) }).catch(() => { });
      // #endregion

      if (deleteError) {
        console.warn('Storage delete error:', deleteError);
      }

      // プロフィールのavatar_urlをnullに更新
      // #region agent log
      const profileDeleteStartTime = Date.now();
      fetch('http://127.0.0.1:7242/ingest/df8c824b-ad69-49a1-bdf1-acbbc4f35ebd', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'AvatarUploader.tsx:273', message: 'Profile delete started', data: {}, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run1', hypothesisId: 'I' }) }).catch(() => { });
      // #endregion
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: null })
        .eq('id', user.id);
      // #region agent log
      const profileDeleteEndTime = Date.now();
      fetch('http://127.0.0.1:7242/ingest/df8c824b-ad69-49a1-bdf1-acbbc4f35ebd', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'AvatarUploader.tsx:277', message: 'Profile delete completed', data: { duration: profileDeleteEndTime - profileDeleteStartTime, error: updateError?.message }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run1', hypothesisId: 'I' }) }).catch(() => { });
      // #endregion

      if (updateError) {
        throw new Error(updateError.message || 'プロフィール更新に失敗しました');
      }

      // 状態を更新
      setPreviewUrl(null);

      // プロフィールストアを更新（非同期、UIをブロックしない）
      updateProfile({ avatar_url: null }).then(() => {
        // #region agent log
        const storeUpdateEndTime = Date.now();
        fetch('http://127.0.0.1:7242/ingest/df8c824b-ad69-49a1-bdf1-acbbc4f35ebd', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'AvatarUploader.tsx:285', message: 'Store update completed', data: { duration: storeUpdateEndTime - profileDeleteEndTime }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run1', hypothesisId: 'J' }) }).catch(() => { });
        // #endregion
      }).catch(() => {
        // エラーは無視（既にDBに保存されているため）
      });

      onUploadComplete?.('');
      // #region agent log
      const deleteEndTime = Date.now();
      fetch('http://127.0.0.1:7242/ingest/df8c824b-ad69-49a1-bdf1-acbbc4f35ebd', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'AvatarUploader.tsx:289', message: 'handleDeleteAvatar completed', data: { totalDuration: deleteEndTime - deleteStartTime }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run1', hypothesisId: 'G' }) }).catch(() => { });
      // #endregion
    } catch (err: unknown) {
      console.error('Avatar delete error:', err);
      const appError = toAppError(err);
      onError?.(appError.message || 'アバター削除中にエラーが発生しました');
    } finally {
      setIsUploading(false);
    }
  }, [user, currentAvatarUrl, updateProfile, onUploadComplete, onError]);

  // ドラッグ&ドロップハンドラー
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

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      const files = Array.from(e.dataTransfer.files);
      const imageFile = files.find((file) => file.type.startsWith('image/'));

      if (imageFile) {
        // 非同期で実行し、クリックハンドラーを即座に終了させる
        handleAvatarUpload(imageFile).catch((err) => {
          console.error('Avatar upload error in handleDrop:', err);
        });
      } else if (files.length > 0) {
        onError?.('画像ファイルを選択してください');
      }
    },
    [handleAvatarUpload, onError]
  );

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        // 非同期で実行し、クリックハンドラーを即座に終了させる
        handleAvatarUpload(file).catch((err) => {
          console.error('Avatar upload error in handleFileSelect:', err);
        });
      }
    },
    [handleAvatarUpload]
  );

  // ユーザー名の頭文字を取得
  const getInitial = () => {
    if (user?.email) return user.email.charAt(0).toUpperCase();
    return 'U';
  };

  const displayUrl = previewUrl || currentAvatarUrl;

  return (
    <Card variant="brand" padding="lg" className="text-center">
      <div
        className={`relative mx-auto mb-4 group cursor-pointer transition-all duration-200 ${isDragging ? 'scale-105 ring-4 ring-brand-primary ring-opacity-50' : ''
          }`}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={() => !isUploading && fileInputRef.current?.click()}
      >
        <div className="relative w-32 h-32 mx-auto">
          {displayUrl ? (
            <img
              key={displayUrl}
              src={displayUrl}
              alt="プロフィール画像"
              className="w-full h-full rounded-full object-cover border-4 border-brand-primary shadow-lg transition-transform duration-300 group-hover:scale-105"
              onError={() => {
                setPreviewUrl(null);
              }}
            />
          ) : (
            <div className="w-full h-full rounded-full flex items-center justify-center border-4 border-brand-primary shadow-lg transition-all duration-300 group-hover:scale-105 bg-brand-secondary">
              <span className="text-3xl font-bold text-brand-primary">{getInitial()}</span>
            </div>
          )}

          {/* オーバーレイ */}
          <div
            className={`absolute inset-0 rounded-full flex items-center justify-center transition-opacity duration-300 ${isUploading ? 'opacity-0' : 'opacity-0 group-hover:opacity-100'
              } bg-black/50`}
          >
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
              />
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
                      className="text-brand-primary"
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
          disabled={isUploading}
        />
      </div>

      <Typography variant="body-sm" color="muted" className="mb-4">
        画像をクリックまたはドラッグ&ドロップでアップロード
      </Typography>

      <div className="flex gap-2 justify-center">
        <Button
          variant="brand"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
        >
          {isUploading ? 'アップロード中...' : '画像を選択'}
        </Button>
        {displayUrl && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              // 非同期で実行し、クリックハンドラーを即座に終了させる
              handleDeleteAvatar().catch((err) => {
                console.error('Avatar delete error in onClick:', err);
              });
            }}
            disabled={isUploading}
          >
            削除
          </Button>
        )}
      </div>
    </Card>
  );
};
