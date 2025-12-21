import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Upload, Image as ImageIcon } from 'lucide-react';
import { useGallery } from '../../hooks/useGallery';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const UploadModal: React.FC<UploadModalProps> = ({ isOpen, onClose }) => {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [caption, setCaption] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const { uploadAndSubmitPhoto, isUploading } = useGallery();

  const handleFileSelect = useCallback((selectedFile: File) => {
    // ファイル形式チェック
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(selectedFile.type)) {
      alert('対応していないファイル形式です。JPEG、PNG、WebP、GIFのみ対応しています。');
      return;
    }

    // ファイルサイズチェック (5MB制限)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (selectedFile.size > maxSize) {
      alert('ファイルサイズが大きすぎます。5MB以下にしてください。');
      return;
    }

    setFile(selectedFile);

    // プレビュー作成
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(selectedFile);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      handleFileSelect(droppedFile);
    }
  }, [handleFileSelect]);

  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      handleFileSelect(selectedFile);
    }
  }, [handleFileSelect]);

  const handleSubmit = async () => {
    if (!file) {
      alert('ファイルを選択してください。');
      return;
    }

    try {
      const result = await uploadAndSubmitPhoto(file, caption);
      if (result.success) {
        alert('写真を投稿しました。承認後に公開されます。');
        handleClose();
      } else {
        alert(`アップロードエラー: ${result.error}`);
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('予期しないエラーが発生しました。');
    }
  };

  const handleClose = () => {
    setFile(null);
    setPreview(null);
    setCaption('');
    setIsDragging(false);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleClose}
        >
          <motion.div
            className="relative w-full max-w-2xl bg-whiskyPapa-black-light rounded-lg border border-whiskyPapa-yellow/30 p-6"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
              onClick={handleClose}
            >
              <X className="w-6 h-6" />
            </button>

            <h2 className="text-2xl font-bold text-whiskyPapa-yellow mb-6">写真を投稿</h2>

            {/* ドラッグ&ドロップエリア */}
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                isDragging
                  ? 'border-whiskyPapa-yellow bg-whiskyPapa-yellow/10'
                  : 'border-gray-600 hover:border-gray-500'
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              {preview ? (
                <div className="space-y-4">
                  <img
                    src={preview}
                    alt="Preview"
                    className="max-h-64 mx-auto rounded-lg object-contain"
                  />
                  <button
                    className="text-sm text-gray-400 hover:text-white"
                    onClick={() => {
                      setFile(null);
                      setPreview(null);
                    }}
                  >
                    別の画像を選択
                  </button>
                </div>
              ) : (
                <>
                  <ImageIcon className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                  <p className="text-gray-300 mb-2">画像をドラッグ&ドロップ</p>
                  <p className="text-gray-500 text-sm mb-4">または</p>
                  <label className="inline-block px-6 py-3 bg-whiskyPapa-yellow text-whiskyPapa-black font-bold rounded-lg cursor-pointer hover:bg-whiskyPapa-yellow-light transition-colors">
                    <Upload className="w-5 h-5 inline-block mr-2" />
                    ファイルを選択
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/gif"
                      className="hidden"
                      onChange={handleFileInputChange}
                    />
                  </label>
                  <p className="text-gray-500 text-xs mt-4">JPEG、PNG、WebP、GIF形式、5MB以下</p>
                </>
              )}
            </div>

            {/* キャプション入力 */}
            {file && (
              <div className="mt-6">
                <label className="block text-sm font-semibold text-white mb-2">
                  キャプション（任意）
                </label>
                <textarea
                  className="w-full px-4 py-2 bg-whiskyPapa-black border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-whiskyPapa-yellow"
                  rows={3}
                  placeholder="写真の説明を入力..."
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                />
              </div>
            )}

            {/* 送信ボタン */}
            {file && (
              <div className="mt-6 flex justify-end gap-4">
                <button
                  className="px-6 py-2 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-800 transition-colors"
                  onClick={handleClose}
                  disabled={isUploading}
                >
                  キャンセル
                </button>
                <button
                  className="px-6 py-2 bg-whiskyPapa-yellow text-whiskyPapa-black font-bold rounded-lg hover:bg-whiskyPapa-yellow-light transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={handleSubmit}
                  disabled={isUploading}
                >
                  {isUploading ? 'アップロード中...' : '投稿する'}
                </button>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

