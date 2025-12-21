import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Camera, Star } from 'lucide-react';
import { useAuthStore } from '../stores/authStore';
import { useGallery } from '../hooks/useGallery';
import { PhotoGrid } from '../components/gallery/PhotoGrid';
import { UploadModal } from '../components/gallery/UploadModal';
import { Link } from 'react-router-dom';

const Gallery: React.FC = () => {
  const { user } = useAuthStore();
  const { approvedPhotos, featuredPhotos, isLoadingApproved } = useGallery();
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-whiskyPapa-black text-white p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* ヘッダー */}
        <motion.div
          className="mb-10 text-center"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl md:text-5xl font-bold text-whiskyPapa-yellow mb-4">GALLERY</h1>
          <p className="text-gray-300 text-lg max-w-2xl mx-auto mb-6">
            ファンの皆さんが撮影したWhisky Papaの写真を共有します。
          </p>

          {/* 投稿ボタン */}
          {user ? (
            <motion.button
              className="inline-flex items-center gap-2 px-6 py-3 bg-whiskyPapa-yellow text-whiskyPapa-black font-bold rounded-lg hover:bg-whiskyPapa-yellow-light transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsUploadModalOpen(true)}
            >
              <Camera className="w-5 h-5" />
              写真を投稿
            </motion.button>
          ) : (
            <Link
              to="/auth"
              className="inline-flex items-center gap-2 px-6 py-3 border-2 border-whiskyPapa-yellow text-whiskyPapa-yellow font-bold rounded-lg hover:bg-whiskyPapa-yellow/10 transition-colors"
            >
              ログインして投稿
            </Link>
          )}
        </motion.div>

        {/* 特集写真 */}
        {featuredPhotos.length > 0 && (
          <motion.section
            className="mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="flex items-center gap-2 mb-6">
              <Star className="w-6 h-6 text-whiskyPapa-yellow" />
              <h2 className="text-2xl font-bold text-whiskyPapa-yellow">今週のベスト</h2>
            </div>
            <PhotoGrid photos={featuredPhotos} />
          </motion.section>
        )}

        {/* 全写真 */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <h2 className="text-2xl font-bold text-white mb-6">すべての写真</h2>
          <PhotoGrid photos={approvedPhotos} isLoading={isLoadingApproved} />
        </motion.section>
      </div>

      {/* アップロードモーダル */}
      <UploadModal isOpen={isUploadModalOpen} onClose={() => setIsUploadModalOpen(false)} />
    </div>
  );
};

export default Gallery;

