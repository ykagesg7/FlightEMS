import React, { useCallback, useId, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useModalDialog } from '../../hooks/useModalDialog';

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
  const triggerRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const titleId = useId();

  const dialogTitle = useMemo(() => {
    const fromCaption = caption?.trim();
    if (fromCaption) return fromCaption;
    const fromAlt = alt?.trim();
    if (fromAlt) return fromAlt;
    return '画像の拡大表示';
  }, [alt, caption]);

  const closeLightbox = useCallback(() => setIsEnlarged(false), []);

  useModalDialog({ open: isEnlarged, onClose: closeLightbox, containerRef: dialogRef });

  const lightbox = isEnlarged
    ? createPortal(
        <div
          ref={dialogRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          className="fixed inset-0 z-[100] flex items-center justify-center overscroll-contain bg-black/80 p-4"
        >
          <div
            className="absolute inset-0 h-full w-full"
            aria-hidden="true"
            onClick={closeLightbox}
          />
          <h2
            id={titleId}
            className="pointer-events-none absolute top-4 left-4 right-16 z-20 truncate text-sm font-semibold text-white"
          >
            {dialogTitle}
          </h2>
          <img
            src={src}
            alt={alt}
            className="pointer-events-none relative z-10 mx-auto max-h-[calc(100dvh-2rem)] max-w-full rounded-lg object-contain"
          />
          <div className="absolute top-4 right-4 z-20">
            <button
              type="button"
              className="rounded-full bg-white bg-opacity-80 p-2"
              onClick={closeLightbox}
              aria-label="閉じる"
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
                aria-hidden
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        </div>,
        document.body,
      )
    : null;

  return (
    <figure className="relative my-6">
      <button
        ref={triggerRef}
        type="button"
        className={`block w-full cursor-pointer overflow-hidden rounded-lg text-left ${
          isEnlarged ? 'pointer-events-none invisible' : ''
        }`}
        onClick={() => setIsEnlarged(true)}
        aria-haspopup="dialog"
        aria-expanded={isEnlarged}
        tabIndex={isEnlarged ? -1 : undefined}
      >
        <img
          src={src}
          alt={alt}
          className={`mx-auto block h-auto max-w-full rounded-lg object-contain transition-all duration-200 motion-reduce:transition-none ${className}`}
          style={{ width }}
        />
      </button>
      {caption && (
        <figcaption className="mt-2 text-center text-sm text-gray-600">{caption}</figcaption>
      )}
      {lightbox}
    </figure>
  );
};

export default ImageComponent;