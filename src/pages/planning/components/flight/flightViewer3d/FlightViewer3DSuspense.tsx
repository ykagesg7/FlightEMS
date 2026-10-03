import { Suspense, useEffect, useState } from 'react';
import type { FlightViewer3DProps } from './types';
import {
  FLIGHT_VIEWER_3D_CHUNK_TIMEOUT_MS,
  LazyFlightViewer3D,
  flightViewer3DModulePromise,
  preloadFlightViewer3DModule,
} from './flightViewer3dLazy';
import { FlightViewer3DErrorBoundary } from './FlightViewer3DErrorBoundary';

type ChunkPhase = 'loading' | 'error';

/**
 * チャンク待ちと Suspense を二重にしない: すぐ Lazy をマウントし Suspense fallback のみ表示。
 * タイムアウト / import 失敗はパネル内エラー（無限スピナー回避）。
 */
export function FlightViewer3DSuspense(props: FlightViewer3DProps) {
  const { fillAvailableHeight = false } = props;
  const [attempt, setAttempt] = useState(0);
  const fillShellClass = fillAvailableHeight
    ? 'flex h-full min-h-0 flex-1 flex-col'
    : undefined;
  const [chunkPhase, setChunkPhase] = useState<ChunkPhase>('loading');
  const [chunkError, setChunkError] = useState<string | null>(null);

  useEffect(() => {
    setChunkPhase('loading');
    setChunkError(null);
    let settled = false;

    const timeoutId = window.setTimeout(() => {
      if (!settled) {
        setChunkPhase('error');
        setChunkError(
          '3D プレビューの読み込みがタイムアウトしました。回線が遅い場合は再試行してください。',
        );
      }
    }, FLIGHT_VIEWER_3D_CHUNK_TIMEOUT_MS);

    flightViewer3DModulePromise
      .then(() => {
        settled = true;
        window.clearTimeout(timeoutId);
        setChunkError(null);
        setChunkPhase('loading');
      })
      .catch((e: unknown) => {
        settled = true;
        window.clearTimeout(timeoutId);
        setChunkPhase('error');
        setChunkError(
          e instanceof Error ? e.message : '3D プレビューの読み込みに失敗しました。',
        );
      });

    return () => {
      settled = true;
      window.clearTimeout(timeoutId);
    };
  }, [attempt]);

  const retry = () => {
    preloadFlightViewer3DModule();
    setAttempt((n) => n + 1);
  };

  if (chunkPhase === 'error' && chunkError) {
    return (
      <div
        className="flex min-h-[12rem] flex-col items-center justify-center gap-3 px-4 text-center"
        role="alert"
      >
        <p className="text-sm text-red-200">{chunkError}</p>
        <button
          type="button"
          onClick={retry}
          className="min-h-[44px] rounded border border-brand-primary/50 px-4 py-2 text-sm text-brand-primary hover:bg-brand-primary/10"
        >
          再試行
        </button>
      </div>
    );
  }

  const suspenseFallback = fillAvailableHeight
    ? 'flex min-h-0 flex-1 items-center justify-center text-sm text-gray-400'
    : 'flex h-48 items-center justify-center text-sm text-gray-400';

  const content = (
    <FlightViewer3DErrorBoundary onReset={() => setAttempt((n) => n + 1)}>
      <Suspense
        fallback={
          <div className={suspenseFallback} role="status">
            3D プレビューを読み込み中…
          </div>
        }
      >
        <LazyFlightViewer3D key={attempt} {...props} />
      </Suspense>
    </FlightViewer3DErrorBoundary>
  );

  if (!fillShellClass) {
    return content;
  }

  return <div className={fillShellClass}>{content}</div>;
}
