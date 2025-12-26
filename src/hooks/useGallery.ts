import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo } from 'react';
import { useAuthStore } from '../stores/authStore';
import type {
  FanPhoto,
  FanPhotoInsert,
  GalleryEvent,
  GalleryReviewItem,
  PhotoUploadResult,
} from '../types/engagement';
import { supabase } from '../utils/supabase';

/**
 * useGallery Hook
 * ギャラリー写真の取得とアップロード
 */
export const useGallery = () => {
  const { user, profile } = useAuthStore();
  const queryClient = useQueryClient();

  const isAdmin = useMemo(() => profile?.roll?.toLowerCase() === 'admin', [profile?.roll]);

  // いいね数の取得
  const { data: likeCounts } = useQuery<Record<string, number>, Error>({
    queryKey: ['gallery', 'like_counts'],
    queryFn: async () => {
      const { data, error } = await supabase.from('fan_photo_like_counts').select('*');
      if (error) throw error;
      const map: Record<string, number> = {};
      (data || []).forEach((row: { photo_id: string; likes_count: number }) => {
        map[row.photo_id] = row.likes_count || 0;
      });
      return map;
    },
  });

  // ログインユーザーのいいね状態
  const { data: userLikes } = useQuery<Set<string>, Error>({
    queryKey: ['gallery', 'user_likes', user?.id],
    queryFn: async () => {
      if (!user?.id) return new Set<string>();
      const { data, error } = await supabase
        .from('fan_photo_likes')
        .select('photo_id')
        .eq('user_id', user.id);
      if (error) throw error;
      return new Set((data || []).map((row) => row.photo_id));
    },
    enabled: !!user?.id,
  });

  const enhancePhotosWithLikes = <T extends FanPhoto>(photos: T[] | undefined): T[] => {
    if (!photos) return [];
    return photos.map((p) => ({
      ...p,
      likes_count: likeCounts?.[p.id] ?? 0,
      user_liked: userLikes?.has(p.id) ?? false,
    }));
  };

  // イベント取得
  const { data: activeEvent } = useQuery<GalleryEvent | null, Error>({
    queryKey: ['gallery', 'active_event'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('gallery_events')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return data || null;
    },
  });

  const { data: archivedEvents } = useQuery<GalleryEvent[], Error>({
    queryKey: ['gallery', 'archived_events'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('gallery_events')
        .select('*')
        .eq('status', 'archived')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });

  const eventMap = useMemo(() => {
    const map: Record<string, GalleryEvent> = {};
    if (activeEvent) map[activeEvent.id] = activeEvent;
    (archivedEvents || []).forEach((e) => {
      map[e.id] = e;
    });
    return map;
  }, [activeEvent, archivedEvents]);

  // 承認済み写真を取得（公開用）
  const {
    data: approvedPhotosRaw,
    isLoading: isLoadingApproved,
  } = useQuery<FanPhoto[], Error>({
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
  const approvedPhotos = enhancePhotosWithLikes(approvedPhotosRaw);

  // 特集写真を取得
  const { data: featuredPhotosRaw } = useQuery<FanPhoto[], Error>({
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
  const featuredPhotos = enhancePhotosWithLikes(featuredPhotosRaw);

  // 承認待ち写真を取得（Adminのみ）
  const {
    data: pendingPhotos,
    isLoading: isLoadingPending,
    error: pendingPhotosError,
  } = useQuery<GalleryReviewItem[], Error>({
    queryKey: ['gallery', 'pending', isAdmin],
    queryFn: async () => {
      if (!isAdmin) return [];

      const { data, error } = await supabase
        .from('fan_photos')
        // fan_photos は profiles 参照が user_id / approved_by の2本あるため、FKを明示して曖昧性を回避する
        .select('*, user:profiles!fan_photos_user_id_fkey(id, username, avatar_url)')
        .eq('is_approved', false)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data || []) as GalleryReviewItem[];
    },
    enabled: isAdmin,
  });

  // ユーザー自身の写真を取得（承認待ち含む）
  const {
    data: userPhotosRaw,
    isLoading: isLoadingUserPhotos,
  } = useQuery<FanPhoto[], Error>({
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
  const userPhotos = enhancePhotosWithLikes(userPhotosRaw);

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
        throw new Error(
          uploadResult.error ||
            'アップロードに失敗しました（接続状況とファイル形式を確認してください）'
        );
      }

      // 2. データベースに登録
      const photo = await submitPhotoMutation.mutateAsync({
        image_url: uploadResult.url,
        caption: caption || null,
      });

      return { success: true, photo };
    } catch (error) {
      console.error('Photo upload and submit error:', error);
      const message =
        error instanceof Error && /bucket/i.test(error.message)
          ? 'アップロード用バケットが見つかりません。時間をおいて再試行してください。'
          : error instanceof Error
            ? error.message
            : '予期しないエラーが発生しました';
      return {
        success: false,
        error: message,
      };
    }
  };

  // 承認
  const approvePhotoMutation = useMutation<FanPhoto, Error, { id: string }>({
    mutationFn: async ({ id }) => {
      if (!user?.id || !isAdmin) {
        throw new Error('管理者権限が必要です');
      }

      const { data, error } = await supabase
        .from('fan_photos')
        .update({
          is_approved: true,
          approved_by: user.id,
          approved_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gallery'] });
    },
  });

  // 特集ON/OFF
  const toggleFeaturedMutation = useMutation<
    FanPhoto,
    Error,
    { id: string; isFeatured: boolean }
  >({
    mutationFn: async ({ id, isFeatured }) => {
      if (!isAdmin) {
        throw new Error('管理者権限が必要です');
      }

      const { data, error } = await supabase
        .from('fan_photos')
        .update({
          is_featured: isFeatured,
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gallery'] });
    },
  });

  // いいねトグル（承認済みのみ対象）
  const toggleLikeMutation = useMutation<
    { photoId: string; liked: boolean },
    Error,
    { photoId: string; userLiked: boolean }
  >({
    mutationFn: async ({ photoId, userLiked }) => {
      if (!user?.id) {
        throw new Error('いいねするにはログインが必要です');
      }

      // 承認済みチェック（クライアント側でガード）
      const target = approvedPhotos?.find((p) => p.id === photoId);
      if (!target || !target.is_approved) {
        throw new Error('承認済み写真のみいいねできます');
      }

      if (userLiked) {
        const { error } = await supabase
          .from('fan_photo_likes')
          .delete()
          .eq('photo_id', photoId)
          .eq('user_id', user.id);
        if (error) throw error;
        return { photoId, liked: false };
      } else {
        const { error } = await supabase
          .from('fan_photo_likes')
          .insert({ photo_id: photoId, user_id: user.id });
        if (error) throw error;
        return { photoId, liked: true };
      }
    },
    onSuccess: () => {
      // いいね数とユーザーいいねを再取得
      queryClient.invalidateQueries({ queryKey: ['gallery', 'like_counts'] });
      queryClient.invalidateQueries({ queryKey: ['gallery', 'user_likes'] });
      queryClient.invalidateQueries({ queryKey: ['gallery'] });
    },
  });

  // Storageパス抽出ユーティリティ
  const extractStoragePath = (publicUrl: string) => {
    try {
      const url = new URL(publicUrl);
      const prefix = '/storage/v1/object/public/fan-photos/';
      if (!url.pathname.startsWith(prefix)) {
        return null;
      }
      return url.pathname.replace(prefix, '');
    } catch {
      return null;
    }
  };

  // 却下（Storage削除 + DB削除）
  const rejectPhotoMutation = useMutation<void, Error, { id: string; imageUrl: string }>({
    mutationFn: async ({ id, imageUrl }) => {
      if (!isAdmin) {
        throw new Error('管理者権限が必要です');
      }

      const objectPath = extractStoragePath(imageUrl);
      if (!objectPath) {
        throw new Error('画像のストレージパス抽出に失敗しました');
      }

      const { error: storageError } = await supabase.storage.from('fan-photos').remove([objectPath]);
      if (storageError) {
        throw storageError;
      }

      const { error: deleteError } = await supabase.from('fan_photos').delete().eq('id', id);
      if (deleteError) {
        throw deleteError;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gallery'] });
    },
  });

  // ユーザー自身またはAdminによる写真削除
  const deletePhotoMutation = useMutation<void, Error, { photo: FanPhoto }>({
    mutationFn: async ({ photo }) => {
      if (!user?.id) {
        throw new Error('ログインが必要です');
      }

      const canAdminDelete = isAdmin;
      const isOwner = photo.user_id === user.id;

      if (!canAdminDelete && !isOwner) {
        throw new Error('削除権限がありません');
      }

      const objectPath = extractStoragePath(photo.image_url);
      if (!objectPath) {
        throw new Error('画像のストレージパス抽出に失敗しました');
      }

      const { error: storageError } = await supabase.storage.from('fan-photos').remove([objectPath]);
      if (storageError) throw storageError;

      const { error: deleteError } = await supabase.from('fan_photos').delete().eq('id', photo.id);
      if (deleteError) throw deleteError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gallery'] });
    },
  });

  // Admin: イベント作成（作成と同時にactive設定も可）
  const createEventMutation = useMutation<GalleryEvent, Error, Omit<GalleryEvent, 'id' | 'created_at'>>({
    mutationFn: async (payload) => {
      const { data, error } = await supabase
        .from('gallery_events')
        .insert({
          title: payload.title,
          slug: payload.slug,
          description: payload.description,
          status: payload.status,
          starts_at: payload.starts_at,
          ends_at: payload.ends_at,
        })
        .select()
        .single();
      if (error) throw error;
      return data as GalleryEvent;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gallery', 'active_event'] });
      queryClient.invalidateQueries({ queryKey: ['gallery', 'archived_events'] });
    },
  });

  return {
    approvedPhotos: approvedPhotos || [],
    featuredPhotos: featuredPhotos || [],
    userPhotos: userPhotos || [],
    activeEvent,
    archivedEvents: archivedEvents || [],
    eventMap,
    pendingPhotos: pendingPhotos || [],
    isLoadingApproved,
    isLoadingUserPhotos,
    isLoadingPending,
    pendingPhotosError,
    uploadPhoto: uploadPhotoMutation.mutateAsync,
    submitPhoto: submitPhotoMutation.mutateAsync,
    uploadAndSubmitPhoto,
    approvePhoto: approvePhotoMutation.mutateAsync,
    toggleFeatured: toggleFeaturedMutation.mutateAsync,
    rejectPhoto: rejectPhotoMutation.mutateAsync,
    deletePhoto: deletePhotoMutation.mutateAsync,
    toggleLike: toggleLikeMutation.mutateAsync,
    createEvent: createEventMutation.mutateAsync,
    isUploading: uploadPhotoMutation.isPending || submitPhotoMutation.isPending,
    isAdmin,
  };
};

