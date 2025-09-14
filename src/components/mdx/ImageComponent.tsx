import React, { useState } from 'react';

interface ImageComponentProps {
  src: string;
  alt: string;
  caption?: string;
  width?: string;
  className?: string;
}

/**
 * MDX内で使用できる拡張画像コンポーネント
 * - キャプション表示機能
 * - クリックで拡大表示
 * - レスポンシブ対応
 */
const ImageComponent: React.FC<ImageComponentProps> = ({
  src,
  alt,
  caption,
  width = 'auto',
  className = '',
}) => {
  const [isEnlarged, setIsEnlarged] = useState(false);

  const toggleEnlarge = () => {
    setIsEnlarged(!isEnlarged);
  };

  return (
    <figure className="my-6 relative">
      <div 
        className={`overflow-hidden rounded-lg ${isEnlarged ? 'fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80' : ''}`}
        style={{ cursor: 'pointer' }}
        onClick={toggleEnlarge}
      >
        <img
          src={src}
          alt={alt}
          className={`mx-auto object-contain rounded-lg transition-all duration-200 ${
            isEnlarged ? 'max-h-screen max-w-screen p-4' : `max-w-full h-auto block ${className}`
          }`}
          style={{ width: isEnlarged ? 'auto' : width }}
        />
        {isEnlarged && (
          <div className="absolute top-4 right-4">
            <button 
              className="bg-white bg-opacity-80 p-2 rounded-full"
              onClick={(e) => { e.stopPropagation(); setIsEnlarged(false); }}
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                width="24" 
                height="24" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              >
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
        )}
      </div>
      {caption && (
        <figcaption className="text-center text-sm text-gray-600 mt-2">
          {caption}
        </figcaption>
      )}
    </figure>
  );
};

export default ImageComponent; 