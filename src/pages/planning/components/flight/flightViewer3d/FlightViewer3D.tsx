import { Dialog, Transition } from '@headlessui/react';
import React, { Fragment, useMemo, useRef, useState } from 'react';
import 'cesium/Build/Cesium/Widgets/widgets.css';
import { FUKUOKA_VFR_SAMPLE_WAYPOINTS } from './fukuokaVfrSample';
import type { FlightCameraMode, FlightImageryMode, FlightViewer3DProps } from './types';
import { DEFAULT_FLIGHT_VIEW_CONTROLS } from './types';
import { useCesiumFlight } from './useCesiumFlight';

export type { FlightViewer3DProps, Waypoint3D } from './types';

export const FlightViewer3D: React.FC<FlightViewer3DProps> = ({
  waypoints,
  initialMode = 'gsi',
  isProUser = false,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const resolvedWaypoints = useMemo(
    () => (waypoints.length >= 2 ? waypoints : FUKUOKA_VFR_SAMPLE_WAYPOINTS),
    [waypoints],
  );
  const [imageryMode, setImageryMode] = useState<FlightImageryMode>(initialMode);
  const [cameraMode, setCameraMode] = useState<FlightCameraMode>('chase');
  const [viewControls, setViewControls] = useState(DEFAULT_FLIGHT_VIEW_CONTROLS);
  const [proUpsellOpen, setProUpsellOpen] = useState(false);

  const { ready, error, playing, progressPct, togglePlay, seekProgress } = useCesiumFlight({
    containerRef,
    waypoints: resolvedWaypoints,
    imageryMode,
    cameraMode,
    isProUser,
    viewControls,
  });

  const requestImageryMode = (next: FlightImageryMode) => {
    if (next === 'google' && !isProUser) {
      setProUpsellOpen(true);
      return;
    }
    setImageryMode(next);
  };

  const usingDemo = waypoints.length < 2;

  return (
    <div
      className="relative flex min-h-[280px] flex-col overflow-hidden rounded-lg border border-brand-primary/30 bg-brand-surface"
      data-testid="flight-viewer-3d"
    >
      <div className="absolute right-2 top-2 z-10 flex gap-1 rounded-lg border border-brand-primary/40 bg-brand-surface/90 p-1 shadow-md backdrop-blur-sm">
        <button
          type="button"
          data-testid="flight-viewer-mode-gsi"
          onClick={() => requestImageryMode('gsi')}
          className={`min-h-[36px] rounded px-2.5 text-xs ${
            imageryMode === 'gsi'
              ? 'bg-brand-primary/25 text-brand-primary'
              : 'text-gray-300 hover:bg-brand-primary/10'
          }`}
        >
          標準（GSI）
        </button>
        <button
          type="button"
          data-testid="flight-viewer-mode-google"
          onClick={() => requestImageryMode('google')}
          className={`min-h-[36px] rounded px-2.5 text-xs ${
            imageryMode === 'google'
              ? 'bg-hud-accent/20 text-hud-accent'
              : 'text-gray-300 hover:bg-brand-primary/10'
          }`}
        >
          Pro（Google 3D）
        </button>
      </div>

      {usingDemo ? (
        <p className="absolute left-2 top-2 z-10 max-w-[min(100%,14rem)] rounded bg-brand-secondary/90 px-2 py-1 text-2xs text-gray-300">
          デモ: 福岡 VFR（RJFF→志賀島→壱岐→RJFR）
        </p>
      ) : null}

      {error ? (
        <div className="shrink-0 bg-hud-danger/20 px-3 py-2 text-xs text-red-200" role="alert">
          {error}
        </div>
      ) : null}

      <div className="relative min-h-[240px] flex-1">
        <div ref={containerRef} className="absolute inset-0 h-full w-full" aria-label="3D ルートプレビュー" />
        {!ready && !error ? (
          <div className="absolute inset-0 flex items-center justify-center text-sm text-gray-400" role="status">
            3D を読み込み中…
          </div>
        ) : null}
      </div>

      <div className="flex shrink-0 flex-col gap-2 border-t border-brand-primary/25 bg-brand-surface px-3 py-2">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            data-testid="flight-viewer-play"
            onClick={togglePlay}
            disabled={!ready}
            className="min-h-[44px] rounded border border-brand-primary/50 px-3 py-1.5 text-xs text-brand-primary hover:bg-brand-primary/10 disabled:opacity-40"
          >
            {playing ? '一時停止' : '再生'}
          </button>
          <button
            type="button"
            data-testid="flight-viewer-camera"
            onClick={() => setCameraMode((m) => (m === 'chase' ? 'cockpit' : 'chase'))}
            disabled={!ready}
            className="min-h-[44px] rounded border border-brand-primary/40 px-3 py-1.5 text-xs text-gray-200 hover:bg-brand-primary/10 disabled:opacity-40"
          >
            {cameraMode === 'chase' ? 'チェイス' : 'コックピット'}
          </button>
          <label className="flex min-h-[44px] flex-1 min-w-[140px] items-center gap-2 text-xs text-gray-300">
            <span className="shrink-0 tabular-nums">{Math.round(progressPct)}%</span>
            <input
              type="range"
              min={0}
              max={100}
              step={0.5}
              value={progressPct}
              disabled={!ready}
              onChange={(e) => seekProgress(Number(e.target.value))}
              className="h-2 flex-1 accent-brand-primary"
              aria-label="再生位置"
            />
          </label>
        </div>
        <div className="flex flex-wrap items-end gap-x-4 gap-y-2 text-xs text-gray-300">
          <label className="flex min-w-[10rem] flex-1 flex-col gap-1">
            <span>
              高度オフセット（ft）
              <span className="ml-1 tabular-nums text-gray-400">{viewControls.altitudeOffsetFt}</span>
            </span>
            <span className="text-2xs text-gray-500">プレビュー用カメラのみ（計画高度は変更しません）</span>
            <input
              type="range"
              min={-500}
              max={2000}
              step={50}
              disabled={!ready}
              value={viewControls.altitudeOffsetFt}
              onChange={(e) =>
                setViewControls((c) => ({ ...c, altitudeOffsetFt: Number(e.target.value) }))
              }
              className="h-2 accent-brand-primary"
              data-testid="flight-viewer-alt-offset"
              aria-label="高度オフセット"
            />
          </label>
          <label className="flex min-w-[8rem] flex-1 flex-col gap-1">
            <span>
              距離（m）
              <span className="ml-1 tabular-nums text-gray-400">{viewControls.chaseDistanceM}</span>
            </span>
            <input
              type="range"
              min={80}
              max={3000}
              step={20}
              disabled={!ready || cameraMode !== 'chase'}
              value={viewControls.chaseDistanceM}
              onChange={(e) =>
                setViewControls((c) => ({ ...c, chaseDistanceM: Number(e.target.value) }))
              }
              className="h-2 accent-brand-primary disabled:opacity-40"
              data-testid="flight-viewer-chase-distance"
              aria-label="チェイス距離"
            />
          </label>
          <label className="flex min-w-[8rem] flex-1 flex-col gap-1">
            <span>
              俯角（°）
              <span className="ml-1 tabular-nums text-gray-400">{viewControls.chasePitchDeg}</span>
            </span>
            <input
              type="range"
              min={-75}
              max={-5}
              step={1}
              disabled={!ready}
              value={viewControls.chasePitchDeg}
              onChange={(e) =>
                setViewControls((c) => ({ ...c, chasePitchDeg: Number(e.target.value) }))
              }
              className="h-2 accent-brand-primary"
              data-testid="flight-viewer-chase-pitch"
              aria-label="俯角"
            />
          </label>
        </div>
      </div>

      <Transition appear show={proUpsellOpen} as={Fragment}>
        <Dialog as="div" className="relative z-[400]" onClose={() => setProUpsellOpen(false)}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-200"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-150"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/60" aria-hidden />
          </Transition.Child>
          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-200"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-150"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-md rounded-lg border border-brand-primary/30 bg-brand-surface p-5 text-white shadow-xl">
                  <Dialog.Title className="text-lg font-semibold text-brand-primary">
                    Google Photorealistic 3D（Pro）
                  </Dialog.Title>
                  <p className="mt-2 text-sm text-gray-300">
                    高精細な Google 3D タイルは Pro プランで利用できます。標準表示（国土地理院）は無料でご利用いただけます。
                  </p>
                  <div className="mt-6 flex justify-end">
                    <button
                      type="button"
                      onClick={() => setProUpsellOpen(false)}
                      className="min-h-[44px] rounded border border-brand-primary/30 px-4 py-2 text-sm hover:bg-brand-primary/10"
                    >
                      閉じる
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </div>
  );
};
