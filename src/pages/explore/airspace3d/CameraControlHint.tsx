import React, { useEffect, useState } from 'react';

const STORAGE_KEY = 'fa-airspace3d-cam-hint-v1';

function useTouchPrimary(): boolean {
  const [touch, setTouch] = useState(() =>
    typeof window !== 'undefined'
      ? window.matchMedia('(hover: none), (pointer: coarse)').matches
      : false,
  );
  useEffect(() => {
    const mq = window.matchMedia('(hover: none), (pointer: coarse)');
    const onChange = () => setTouch(mq.matches);
    onChange();
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);
  return touch;
}

const MouseGlyph: React.FC<{ lit: 'left' | 'middle' | 'right' | 'wheel' }> = ({ lit }) => (
  <svg width="28" height="36" viewBox="0 0 28 36" aria-hidden className="shrink-0">
    <rect x="4" y="2" width="20" height="32" rx="10" fill="#132033" stroke="#7DAAF7" strokeWidth="1.4" />
    <path d="M14 2 V16" stroke="#5C86CC" strokeWidth="1" />
    <rect
      x="5.2"
      y="3.4"
      width="8.2"
      height="12"
      rx="3"
      fill={lit === 'left' ? '#7DAAF7' : '#0B1220'}
    />
    <rect
      x="14.6"
      y="3.4"
      width="8.2"
      height="12"
      rx="3"
      fill={lit === 'right' ? '#7DAAF7' : '#0B1220'}
    />
    <rect
      x="12.2"
      y="6"
      width="3.6"
      height="7"
      rx="1.4"
      fill={lit === 'middle' || lit === 'wheel' ? '#9BC4FF' : '#1a2740'}
    />
  </svg>
);

const FingerGlyph: React.FC<{ count: 1 | 2; pinch?: boolean }> = ({ count, pinch }) => (
  <svg width="36" height="36" viewBox="0 0 36 36" aria-hidden className="shrink-0">
    {count === 1 ? (
      <g fill="none" stroke="#7DAAF7" strokeWidth="1.6" strokeLinecap="round">
        <path d="M18 28 V12" />
        <circle cx="18" cy="9" r="3.2" fill="#7DAAF7" stroke="none" />
        <path d="M12 22 H24" opacity="0.5" />
      </g>
    ) : pinch ? (
      <g fill="none" stroke="#7DAAF7" strokeWidth="1.6" strokeLinecap="round">
        <path d="M11 26 V14" />
        <path d="M25 26 V14" />
        <circle cx="11" cy="11" r="3" fill="#7DAAF7" stroke="none" />
        <circle cx="25" cy="11" r="3" fill="#7DAAF7" stroke="none" />
        <path d="M14 8 H22" />
        <path d="M14 30 H22" />
      </g>
    ) : (
      <g fill="none" stroke="#7DAAF7" strokeWidth="1.6" strokeLinecap="round">
        <path d="M13 28 V13" />
        <path d="M23 28 V13" />
        <circle cx="13" cy="10" r="3" fill="#7DAAF7" stroke="none" />
        <circle cx="23" cy="10" r="3" fill="#7DAAF7" stroke="none" />
        <path d="M8 18 H28" opacity="0.55" />
      </g>
    )}
  </svg>
);

type HintRow = { key: string; glyph: React.ReactNode; label: string };

/**
 * Cesium カメラ操作の図解 HUD。PC はマウス、タッチ端末は指ジェスチャ。
 */
export const CameraControlHint: React.FC = () => {
  const touch = useTouchPrimary();
  const [hidden, setHidden] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) === '1';
    } catch {
      return false;
    }
  });

  if (hidden) {
    return (
      <button
        type="button"
        data-testid="airspace3d-hint-show"
        onClick={() => {
          try {
            localStorage.removeItem(STORAGE_KEY);
          } catch {
            /* ignore */
          }
          setHidden(false);
        }}
        className="absolute left-2 top-2 z-20 rounded border border-brand-primary/40 bg-brand-secondary/80 px-2 py-1 text-2xs text-brand-primary hover:bg-brand-primary/10"
      >
        操作
      </button>
    );
  }

  const rows: HintRow[] = touch
    ? [
        { key: 'pan', glyph: <FingerGlyph count={1} />, label: '移動' },
        { key: 'tilt', glyph: <FingerGlyph count={2} />, label: '傾ける' },
        { key: 'zoom', glyph: <FingerGlyph count={2} pinch />, label: '拡大' },
      ]
    : [
        { key: 'pan', glyph: <MouseGlyph lit="left" />, label: '移動' },
        { key: 'tilt', glyph: <MouseGlyph lit="middle" />, label: '傾ける' },
        { key: 'zoom', glyph: <MouseGlyph lit="wheel" />, label: '拡大' },
      ];

  const sub = touch ? '2本ドラッグで傾ける' : 'Ctrl+左ドラッグでも傾ける';

  return (
    <div
      data-testid="airspace3d-hint"
      data-mode={touch ? 'touch' : 'mouse'}
      className="absolute left-2 top-2 z-20 max-w-[11.5rem] rounded border border-brand-primary/35 bg-brand-secondary/90 px-2 py-1.5 shadow-lg backdrop-blur-sm"
    >
      <div className="mb-1 flex items-center justify-between gap-2">
        <span className="text-2xs font-medium text-brand-primary">カメラ</span>
        <button
          type="button"
          aria-label="操作ヒントを閉じる"
          data-testid="airspace3d-hint-dismiss"
          onClick={() => {
            try {
              localStorage.setItem(STORAGE_KEY, '1');
            } catch {
              /* ignore */
            }
            setHidden(true);
          }}
          className="min-h-[28px] min-w-[28px] rounded text-gray-400 hover:bg-brand-primary/10 hover:text-white"
        >
          ×
        </button>
      </div>
      <div className="flex items-end justify-between gap-1">
        {rows.map((row) => (
          <div key={row.key} className="flex flex-1 flex-col items-center gap-0.5">
            {row.glyph}
            <span className="text-2xs text-gray-300">{row.label}</span>
          </div>
        ))}
      </div>
      <p className="mt-1 text-center text-2xs leading-tight text-gray-500">{sub}</p>
    </div>
  );
};
