import { CheckCircle, Loader2, Star, Trash2 } from 'lucide-react';
import React, { useState } from 'react';
import { useGallery } from '../../../hooks/useGallery';
import type { GalleryReviewItem } from '../../../types/engagement';
import AdminEventPanel from './AdminEventPanel';

interface ActionState {
  id: string;
  type: 'approve' | 'feature' | 'reject';
}

export const AdminReviewPanel: React.FC = () => {
  const {
    pendingPhotos,
    isLoadingPending,
    pendingPhotosError,
    approvePhoto,
    toggleFeatured,
    rejectPhoto,
    isAdmin,
  } = useGallery();
  const [actionState, setActionState] = useState<ActionState | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isAdmin) {
    return (
      <div className="text-center py-12 text-gray-400">
        管理者のみアクセスできます。
      </div>
    );
  }

  const handleApprove = async (photo: GalleryReviewItem) => {
    setErrorMessage(null);
    setActionState({ id: photo.id, type: 'approve' });
    try {
      await approvePhoto({ id: photo.id });
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : '承認に失敗しました');
    } finally {
      setActionState(null);
    }
  };

  const handleToggleFeatured = async (photo: GalleryReviewItem) => {
    setErrorMessage(null);
    setActionState({ id: photo.id, type: 'feature' });
    try {
      await toggleFeatured({ id: photo.id, isFeatured: !photo.is_featured });
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'おすすめ設定に失敗しました');
    } finally {
      setActionState(null);
    }
  };

  const handleReject = async (photo: GalleryReviewItem) => {
    setErrorMessage(null);
    setActionState({ id: photo.id, type: 'reject' });
    try {
      await rejectPhoto({ id: photo.id, imageUrl: photo.image_url });
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : '却下に失敗しました');
    } finally {
      setActionState(null);
    }
  };

  if (isLoadingPending) {
    return (
      <div className="flex items-center justify-center py-12 text-gray-300">
        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
        承認待ちの写真を読み込み中...
      </div>
    );
  }

  if (pendingPhotosError) {
    return (
      <div className="rounded-lg border border-red-500/50 bg-red-500/10 text-red-200 px-4 py-3">
        承認待ち写真の取得に失敗しました: {pendingPhotosError.message}
      </div>
    );
  }

  if (!pendingPhotos.length) {
    return (
      <div className="text-center py-12 text-gray-400">
        承認待ちの写真はありません。
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <AdminEventPanel />
      {errorMessage && (
        <div className="rounded-lg border border-red-500/50 bg-red-500/10 text-red-200 px-4 py-3">
          {errorMessage}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {pendingPhotos.map((photo) => {
          const isProcessing = actionState?.id === photo.id;

          return (
            <div
              key={photo.id}
              className="bg-whiskyPapa-black-light border border-white/10 rounded-lg overflow-hidden"
            >
              <div className="aspect-square w-full overflow-hidden">
                <img
                  src={photo.image_url}
                  alt={photo.caption || 'Fan photo'}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>

              <div className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-400">
                    {photo.user?.username || 'Unknown'} /{' '}
                    {new Date(photo.created_at).toLocaleString()}
                  </div>
                  {photo.is_featured && (
                    <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-whiskyPapa-yellow text-black font-semibold">
                      <Star className="w-4 h-4" />
                      おすすめ
                    </span>
                  )}
                </div>

                {photo.caption && (
                  <p className="text-gray-200 text-sm line-clamp-3">{photo.caption}</p>
                )}

                <div className="flex flex-wrap gap-2">
                  <button
                    className="inline-flex items-center gap-1 px-3 py-2 rounded-md bg-green-500 text-black font-semibold hover:bg-green-400 disabled:opacity-60 disabled:cursor-not-allowed"
                    onClick={() => handleApprove(photo)}
                    disabled={isProcessing}
                  >
                    {isProcessing && actionState?.type === 'approve' ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <CheckCircle className="w-4 h-4" />
                    )}
                    承認
                  </button>

                  <button
                    className="inline-flex items-center gap-1 px-3 py-2 rounded-md border border-whiskyPapa-yellow text-whiskyPapa-yellow font-semibold hover:bg-whiskyPapa-yellow/10 disabled:opacity-60 disabled:cursor-not-allowed"
                    onClick={() => handleToggleFeatured(photo)}
                    disabled={isProcessing}
                  >
                    {isProcessing && actionState?.type === 'feature' ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Star className="w-4 h-4" />
                    )}
                    {photo.is_featured ? 'おすすめ解除' : 'おすすめ'}
                  </button>

                  <button
                    className="inline-flex items-center gap-1 px-3 py-2 rounded-md border border-red-500 text-red-400 font-semibold hover:bg-red-500/10 disabled:opacity-60 disabled:cursor-not-allowed"
                    onClick={() => {
                      const confirmed = window.confirm('この写真を却下（削除）しますか？');
                      if (confirmed) {
                        handleReject(photo);
                      }
                    }}
                    disabled={isProcessing}
                  >
                    {isProcessing && actionState?.type === 'reject' ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                    却下
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AdminReviewPanel;

