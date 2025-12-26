import React, { useState } from 'react';

interface ImageWithOptimizationProps {
  src: string;
  alt: string;
  width?: number | string;
  height?: number | string;
  caption?: string;
  className?: string;
  priority?: boolean;
  lightbox?: boolean;
}

const ImageWithOptimization: React.FC<ImageWithOptimizationProps> = ({
  src,
  alt,
  width,
  height,
  caption,
  className = '',
  priority = false,
  lightbox = true
}) => {
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const handleImageLoad = () => {
    setIsLoading(false);
  };

  const handleImageError = () => {
    setIsLoading(false);
    setHasError(true);
  };

  const openLightbox = () => {
    if (lightbox && !hasError) {
      setIsLightboxOpen(true);
    }
  };

  const closeLightbox = () => {
    setIsLightboxOpen(false);
  };

  // エラー時のフォールバック
  if (hasError) {
    return (
      <div className="flex items-center justify-center p-8 rounded-lg border-2 border-dashed border-gray-600 bg-gray-800">
        <div className="text-center">
          <svg className="w-12 h-12 mx-auto mb-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <p className="text-sm text-gray-500">画像を読み込めませんでした</p>
          <p className="text-xs text-gray-400 mt-1">{alt}</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <figure className={`my-6 ${className}`}>
        <div className="relative">
          {/* ローディング表示 */}
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-gray-800">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-whiskyPapa-yellow"></div>
            </div>
          )}

          {/* メイン画像 */}
          <img
            src={src}
            alt={alt}
            width={width}
            height={height}
            loading={priority ? 'eager' : 'lazy'}
            decoding="async"
            onLoad={handleImageLoad}
            onError={handleImageError}
            className={`
              w-full h-auto rounded-lg shadow-md transition-all duration-300
              ${lightbox ? 'cursor-zoom-in hover:shadow-lg' : ''}
              ${isLoading ? 'opacity-0' : 'opacity-100'}
            `}
            onClick={openLightbox}
          />

          {/* ズームアイコン（ライトボックス有効時） */}
          {lightbox && !isLoading && (
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <div className="p-1 rounded-full bg-black bg-opacity-50">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                </svg>
              </div>
            </div>
          )}
        </div>

        {/* キャプション */}
        {caption && (
          <figcaption className="mt-2 text-sm text-center italic text-white opacity-70">
            {caption}
          </figcaption>
        )}
      </figure>

      {/* ライトボックスモーダル */}
      {isLightboxOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4"
          onClick={closeLightbox}
        >
          <div className="relative max-w-full max-h-full">
            <img
              src={src}
              alt={alt}
              className="max-w-full max-h-full object-contain"
              onClick={(e) => e.stopPropagation()}
            />

            {/* 閉じるボタン */}
            <button
              onClick={closeLightbox}
              className="absolute top-4 right-4 p-2 rounded-full bg-black bg-opacity-50 text-white hover:bg-opacity-70 transition-colors duration-200"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* キャプション（ライトボックス内） */}
            {caption && (
              <div className="absolute bottom-4 left-4 right-4 text-center">
                <p className="text-white text-sm bg-black bg-opacity-50 px-3 py-1 rounded">
                  {caption}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default ImageWithOptimization;
