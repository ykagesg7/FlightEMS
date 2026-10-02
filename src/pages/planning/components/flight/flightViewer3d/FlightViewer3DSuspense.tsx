import { Suspense, useEffect, useState } from 'react';
import type { FlightViewer3DProps } from './types';
import {
  FLIGHT_VIEWER_3D_CHUNK_TIMEOUT_MS,
  LazyFlightViewer3D,
  flightViewer3DModulePromise,
  preloadFlightViewer3DModule,
} from './flightViewer3dLazy';

type LoadPhase = 'pending' | 'ready' | 'error';

export function FlightViewer3DSuspense(props: FlightViewer3DProps) {
  const [attempt, setAttempt] = useState(0);
  const [phase, setPhase] = useState<LoadPhase>('pending');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    setPhase('pending');
    setErrorMessage(null);
    let cancelled = false;
    let settled = false;

    const timeoutId = window.setTimeout(() => {
      if (!cancelled && !settled) {
        setPhase('error');
        setErrorMessage('3D プレビューの読み込みがタイムアウトしました。');
      }
    }, FLIGHT_VIEWER_3D_CHUNK_TIMEOUT_MS);

    flightViewer3DModulePromise
      .then(() => {
        if (cancelled) return;
        settled = true;
        window.clearTimeout(timeoutId);
        setPhase('ready');
      })
      .catch((e: unknown) => {
        if (cancelled) return;
        settled = true;
        window.clearTimeout(timeoutId);
        setPhase('error');
        setErrorMessage(e instanceof Error ? e.message : '3D プレビューの読み込みに失敗しました。');
      });

    return () => {
      cancelled = true;
      window.clearTimeout(timeoutId);
    };
  }, [attempt]);

  const retry = () => {
    preloadFlightViewer3DModule();
    setAttempt((n) => n + 1);
  };

  if (phase === 'error') {
    return (
      <div
        className="flex min-h-[12rem] flex-col items-center justify-center gap-3 px-4 text-center"
        role="alert"
      >
        <p className="text-sm text-red-200">{errorMessage}</p>
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

  if (phase === 'pending') {
    return (
      <div className="flex h-48 items-center justify-center text-sm text-gray-400" role="status">
        3D プレビューを読み込み中…
      </div>
    );
  }

  return (
    <Suspense
      fallback={
        <div className="flex h-48 items-center justify-center text-sm text-gray-400" role="status">
          3D プレビューを読み込み中…
        </div>
      }
    >
      <LazyFlightViewer3D key={attempt} {...props} />
    </Suspense>
  );
}
