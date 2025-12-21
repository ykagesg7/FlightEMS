import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../stores/authStore';
import { supabase } from '../utils/supabase';
import type { FanPhoto, FanPhotoInsert, PhotoUploadResult } from '../types/engagement';

/**
 * useGallery Hook
 * ギャラリー写真の取得とアップロード
 */
export const useGallery = () => {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();

  // 承認済み写真を取得（公開用）
  const { data: approvedPhotos, isLoading: isLoadingApproved } = useQuery<FanPhoto[], Error>({
    queryKey: ['gallery', 'approved'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('fan_photos')
        .select('*')
        .eq('is_approved', true)
        .order('is_featured', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
  });

  // 特集写真を取得
  const { data: featuredPhotos } = useQuery<FanPhoto[], Error>({
    queryKey: ['gallery', 'featured'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('fan_photos')
        .select('*')
        .eq('is_approved', true)
        .eq('is_featured', true)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      return data || [];
    },
  });

  // ユーザー自身の写真を取得（承認待ち含む）
  const { data: userPhotos, isLoading: isLoadingUserPhotos } = useQuery<FanPhoto[], Error>({
    queryKey: ['gallery', 'user', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      const { data, error } = await supabase
        .from('fan_photos')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id,
  });

  // 写真アップロード
  const uploadPhotoMutation = useMutation<PhotoUploadResult, Error, File>({
    mutationFn: async (file: File) => {
      if (!user?.id) {
        throw new Error('ログインが必要です');
      }

      // ファイル形式チェック
      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
      if (!allowedTypes.includes(file.type)) {
        return {
          success: false,
          error: '対応していないファイル形式です。JPEG、PNG、WebP、GIFのみ対応しています。',
        };
      }

      // ファイルサイズチェック (5MB制限)
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        return {
          success: false,
          error: 'ファイルサイズが大きすぎます。5MB以下にしてください。',
        };
      }

      // ファイル名を作成
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;

      // Storageにアップロード
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('fan-photos')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        return {
          success: false,
          error: `アップロードエラー: ${uploadError.message}`,
        };
      }

      // パブリックURLを取得
      const { data: urlData } = supabase.storage.from('fan-photos').getPublicUrl(uploadData.path);

      if (!urlData?.publicUrl) {
        return {
          success: false,
          error: 'アップロード後のURL取得に失敗しました。',
        };
      }

      return {
        success: true,
        url: urlData.publicUrl,
      };
    },
  });

  // 写真をデータベースに登録
  const submitPhotoMutation = useMutation<FanPhoto, Error, FanPhotoInsert>({
    mutationFn: async (photoData: FanPhotoInsert) => {
      if (!user?.id) {
        throw new Error('ログインが必要です');
      }

      const { data, error } = await supabase
        .from('fan_photos')
        .insert({
          ...photoData,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;

      // キャッシュを無効化
      queryClient.invalidateQueries({ queryKey: ['gallery'] });

      return data;
    },
  });

  // 写真アップロードと登録を統合
  const uploadAndSubmitPhoto = async (file: File, caption?: string) => {
    try {
      // 1. ファイルをアップロード
      const uploadResult = await uploadPhotoMutation.mutateAsync(file);

      if (!uploadResult.success || !uploadResult.url) {
        throw new Error(uploadResult.error || 'アップロードに失敗しました');
      }

      // 2. データベースに登録
      const photo = await submitPhotoMutation.mutateAsync({
        image_url: uploadResult.url,
        caption: caption || null,
      });

      return { success: true, photo };
    } catch (error) {
      console.error('Photo upload and submit error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : '予期しないエラーが発生しました',
      };
    }
  };

  return {
    approvedPhotos: approvedPhotos || [],
    featuredPhotos: featuredPhotos || [],
    userPhotos: userPhotos || [],
    isLoadingApproved,
    isLoadingUserPhotos,
    uploadPhoto: uploadPhotoMutation.mutateAsync,
    submitPhoto: submitPhotoMutation.mutateAsync,
    uploadAndSubmitPhoto,
    isUploading: uploadPhotoMutation.isPending || submitPhotoMutation.isPending,
  };
};

