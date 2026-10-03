import { Dialog, Transition } from '@headlessui/react';
import React, { Fragment, useCallback, useEffect, useMemo, useState } from 'react';
import 'cesium/Build/Cesium/Widgets/widgets.css';
import { FUKUOKA_VFR_SAMPLE_WAYPOINTS } from './fukuokaVfrSample';
import { shouldShowGooglePhotorealistic3dProUpsell } from './googlePhotorealistic3dAccess';
import { FlightViewer3DControls } from './flightViewer3dControls';
import {
  createDefaultPlanning3dViewerUi,
  previewAltitudeSliderBounds,
  type Planning3dViewerUiState,
} from './planning3dViewerUi';
import type { FlightViewer3DProps } from './types';
import { derivePlannedPreviewAltitudeFt } from './types';
import { useCesiumFlight } from './useCesiumFlight';

export type { FlightViewer3DProps, Waypoint3D } from './types';

export const FlightViewer3D: React.FC<FlightViewer3DProps> = ({
  waypoints,
  initialMode = 'gsi',
  isProUser = false,
  viewerUi: viewerUiProp,
  onViewerUiChange,
  fillAvailableHeight = false,
}) => {
  const [mountEl, setMountEl] = useState<HTMLDivElement | null>(null);
  const resolvedWaypoints = useMemo(
    () => (waypoints.length >= 2 ? waypoints : FUKUOKA_VFR_SAMPLE_WAYPOINTS),
    [waypoints],
  );
  const [internalUi, setInternalUi] = useState<Planning3dViewerUiState>(() => ({
    ...createDefaultPlanning3dViewerUi(resolvedWaypoints),
    imageryMode: initialMode,
  }));
  const isControlled = viewerUiProp !== undefined && onViewerUiChange !== undefined;
  const viewerUi = isControlled ? viewerUiProp! : internalUi;

  const setViewerUi = useCallback(
    (next: Planning3dViewerUiState) => {
      if (isControlled) {
        onViewerUiChange!(next);
      } else {
        setInternalUi(next);
      }
    },
    [isControlled, onViewerUiChange],
  );

  useEffect(() => {
    if (isControlled) return;
    const planned = derivePlannedPreviewAltitudeFt(resolvedWaypoints);
    setInternalUi((prev) => ({
      ...prev,
      viewControls: { ...prev.viewControls, previewAltitudeFt: planned },
    }));
  }, [resolvedWaypoints, isControlled]);

  const { imageryMode, cameraMode, viewControls, playbackSpeed } = viewerUi;
  const [proUpsellOpen, setProUpsellOpen] = useState(false);

  const { ready, error, playing, progressPct, togglePlay, seekProgress, retryInit } = useCesiumFlight({
    mountEl,
    waypoints: resolvedWaypoints,
    imageryMode,
    cameraMode,
    isProUser,
    viewControls,
    playbackSpeed,
  });

  const plannedAltFt = useMemo(
    () => derivePlannedPreviewAltitudeFt(resolvedWaypoints),
    [resolvedWaypoints],
  );
  const { minFt: previewAltitudeMinFt, maxFt: previewAltitudeMaxFt } = useMemo(
    () => previewAltitudeSliderBounds(plannedAltFt),
    [plannedAltFt],
  );

  const requestImageryMode = (next: typeof imageryMode) => {
    if (next === 'google' && shouldShowGooglePhotorealistic3dProUpsell(isProUser)) {
      setProUpsellOpen(true);
      return;
    }
    setViewerUi({ ...viewerUi, imageryMode: next });
  };

  const usingDemo = waypoints.length < 2;

  const shellClass = fillAvailableHeight
    ? 'relative flex h-full min-h-0 flex-1 flex-col overflow-hidden rounded-lg border border-brand-primary/30 bg-brand-surface'
    : 'relative flex min-h-[280px] flex-col overflow-hidden rounded-lg border border-brand-primary/30 bg-brand-surface';
  const canvasRegionClass = fillAvailableHeight
    ? 'relative min-h-0 flex-1'
    : 'relative min-h-[240px] flex-1';

  return (
    <div className={shellClass} data-testid="flight-viewer-3d">
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
        <div
          className="flex shrink-0 flex-wrap items-center justify-between gap-2 bg-hud-danger/20 px-3 py-2 text-xs text-red-200"
          role="alert"
        >
          <span>{error}</span>
          <button
            type="button"
            onClick={retryInit}
            className="min-h-[36px] rounded border border-red-300/40 px-2 py-1 text-xs hover:bg-hud-danger/30"
          >
            再試行
          </button>
        </div>
      ) : null}

      <div className={canvasRegionClass}>
        <div
          ref={setMountEl}
          className="absolute inset-0 h-full w-full"
          aria-label="3D ルートプレビュー"
        />
        {!ready && !error ? (
          <div className="absolute inset-0 flex items-center justify-center text-sm text-gray-400" role="status">
            3D を読み込み中…
          </div>
        ) : null}
      </div>

      <FlightViewer3DControls
        ready={ready}
        playing={playing}
        progressPct={progressPct}
        cameraMode={cameraMode}
        viewControls={viewControls}
        playbackSpeed={playbackSpeed}
        previewAltitudeMinFt={previewAltitudeMinFt}
        previewAltitudeMaxFt={previewAltitudeMaxFt}
        onTogglePlay={togglePlay}
        onSeekProgress={seekProgress}
        onCameraModeChange={(mode) => setViewerUi({ ...viewerUi, cameraMode: mode })}
        onViewControlsChange={(next) => setViewerUi({ ...viewerUi, viewControls: next })}
        onPlaybackSpeedChange={(speed) => setViewerUi({ ...viewerUi, playbackSpeed: speed })}
      />

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
