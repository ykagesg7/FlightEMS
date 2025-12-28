import { AnimatePresence, motion } from 'framer-motion';
import { Heart, X } from 'lucide-react';
import React, { useState } from 'react';
import type { FanPhoto } from '../../../types/engagement';

type LayoutType = 'grid' | 'masonry';

interface PhotoGridProps {
  photos: FanPhoto[];
  isLoading?: boolean;
  layout?: LayoutType;
  onToggleLike?: (photoId: string, userLiked: boolean, isApproved: boolean) => void;
  isLoggedIn?: boolean;
  canLike?: (photo: FanPhoto) => boolean;
  onDelete?: (photo: FanPhoto) => void;
}

export const PhotoGrid: React.FC<PhotoGridProps> = ({
  photos,
  isLoading,
  layout = 'grid',
  onToggleLike,
  isLoggedIn,
  canLike,
  onDelete,
}) => {
  const [selectedPhoto, setSelectedPhoto] = useState<FanPhoto | null>(null);

  if (isLoading) {
    return (
      <div
        className={
          layout === 'masonry'
            ? 'columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4'
            : 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'
        }
      >
        {[...Array(8)].map((_, i) => (
          <div key={i} className="aspect-square bg-gray-800 rounded-lg animate-pulse break-inside-avoid" />
        ))}
      </div>
    );
  }

  if (photos.length === 0) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-400 text-lg">まだ写真が投稿されていません。</p>
      </div>
    );
  }

  return (
    <>
      <div
        className={
          layout === 'masonry'
            ? 'columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4'
            : 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'
        }
      >
        {photos.map((photo, index) => {
          const CardWrapper = (
            <motion.div
              key={photo.id}
              className={`relative ${layout === 'masonry' ? 'mb-4 break-inside-avoid' : 'aspect-square'} overflow-hidden rounded-lg cursor-pointer group`}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              onClick={() => setSelectedPhoto(photo)}
              whileHover={{ scale: 1.05 }}
            >
              <img
                src={photo.image_url}
                alt={photo.caption || 'Fan photo'}
                className={layout === 'masonry' ? 'w-full h-auto object-cover' : 'w-full h-full object-cover'}
                loading="lazy"
              />
              {photo.is_featured && (
                <div className="absolute top-2 right-2 rounded-full bg-whiskyPapa-yellow px-2 py-1 text-xs font-bold text-whiskyPapa-black">
                  おすすめ
                </div>
              )}
              {photo.caption && (
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3 opacity-0 group-hover:opacity-100 transition-opacity">
                  <p className="text-white text-sm line-clamp-2">{photo.caption}</p>
                </div>
              )}

              {/* いいねボタン */}
              {photo.is_approved && (
                <button
                  type="button"
                  className="absolute bottom-2 right-2 inline-flex items-center gap-1 rounded-full bg-black/60 px-3 py-1 text-xs text-white hover:bg-black/80 transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (!onToggleLike) return;
                    if (!isLoggedIn) {
                      alert('いいねするにはログインが必要です');
                      return;
                    }
                    if (canLike && !canLike(photo)) {
                      return;
                    }
                    onToggleLike(photo.id, !!photo.user_liked, photo.is_approved);
                  }}
                  disabled={!!canLike && !canLike(photo)}
                  title={
                    canLike && !canLike(photo)
                      ? '投票できません（締切後/自分の投稿など）'
                      : undefined
                  }
                >
                  <Heart
                    className={`w-4 h-4 ${photo.user_liked ? 'fill-red-500 text-red-500' : 'text-white'}`}
                  />
                  <span>{photo.likes_count ?? 0}</span>
                </button>
              )}

              {onDelete && (
                <button
                  type="button"
                  className="absolute top-2 right-2 inline-flex items-center gap-1 rounded-full bg-red-600/80 px-2 py-1 text-xs text-white hover:bg-red-500 transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(photo);
                  }}
                >
                  削除
                </button>
              )}
            </motion.div>
          );

          return CardWrapper;
        })}
      </div>

      {/* Lightbox Modal */}
      <AnimatePresence>
        {selectedPhoto && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedPhoto(null)}
          >
            <motion.div
              className="relative max-w-4xl max-h-full"
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                className="absolute top-4 right-4 z-10 rounded-full bg-black/50 p-2 text-white hover:bg-black/70 transition-colors"
                onClick={() => setSelectedPhoto(null)}
              >
                <X className="w-6 h-6" />
              </button>
              <img
                src={selectedPhoto.image_url}
                alt={selectedPhoto.caption || 'Fan photo'}
                className="max-w-full max-h-[90vh] object-contain rounded-lg"
              />
              {selectedPhoto.caption && (
                <div className="mt-4 text-center">
                  <p className="text-white text-lg">{selectedPhoto.caption}</p>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

