import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import type { FanPhoto } from '../../types/engagement';

interface PhotoGridProps {
  photos: FanPhoto[];
  isLoading?: boolean;
}

export const PhotoGrid: React.FC<PhotoGridProps> = ({ photos, isLoading }) => {
  const [selectedPhoto, setSelectedPhoto] = useState<FanPhoto | null>(null);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="aspect-square bg-gray-800 rounded-lg animate-pulse"
          />
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {photos.map((photo, index) => (
          <motion.div
            key={photo.id}
            className="relative aspect-square overflow-hidden rounded-lg cursor-pointer group"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            onClick={() => setSelectedPhoto(photo)}
            whileHover={{ scale: 1.05 }}
          >
            <img
              src={photo.image_url}
              alt={photo.caption || 'Fan photo'}
              className="w-full h-full object-cover"
              loading="lazy"
            />
            {photo.is_featured && (
              <div className="absolute top-2 right-2 rounded-full bg-whiskyPapa-yellow px-2 py-1 text-xs font-bold text-whiskyPapa-black">
                FEATURED
              </div>
            )}
            {photo.caption && (
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3 opacity-0 group-hover:opacity-100 transition-opacity">
                <p className="text-white text-sm line-clamp-2">{photo.caption}</p>
              </div>
            )}
          </motion.div>
        ))}
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

