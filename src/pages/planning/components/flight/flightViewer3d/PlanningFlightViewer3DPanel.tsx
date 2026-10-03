import React from 'react';
import type { Waypoint3D } from './types';
import { FlightViewer3DSuspense } from './FlightViewer3DSuspense';
import { usePlanning3dPopoutHost } from './usePlanning3dPopoutHost';

type PlanningFlightViewer3DPanelProps = {
  waypoints: Waypoint3D[];
  isProUser: boolean;
};

export const PlanningFlightViewer3DPanel: React.FC<PlanningFlightViewer3DPanelProps> = ({
  waypoints,
  isProUser,
}) => {
  const { poppedOut, popupBlocked, openPopout, focusPopout, dismissPopupBlocked } =
    usePlanning3dPopoutHost(waypoints, isProUser);

  return (
    <div data-testid="planning-flight-viewer-3d-panel">
      {popupBlocked ? (
        <div
          className="mb-2 rounded border border-hud-warning/40 bg-hud-warning/10 px-3 py-2 text-xs text-amber-100"
          role="alert"
          data-testid="flight-viewer-popout-blocked"
        >
          <p>
            ポップアップがブロックされました。ブラウザのアドレスバー付近でこのサイトのポップアップを許可してから、もう一度お試しください。
          </p>
          <button
            type="button"
            onClick={dismissPopupBlocked}
            className="mt-2 min-h-[36px] rounded border border-amber-200/30 px-2 py-1 hover:bg-hud-warning/20"
          >
            閉じる
          </button>
        </div>
      ) : null}

      {!poppedOut ? (
        <>
          <div className="mb-2 flex justify-end print-hide">
            <button
              type="button"
              data-testid="flight-viewer-popout-open"
              onClick={openPopout}
              className="min-h-[36px] rounded border border-brand-primary/40 px-3 py-1.5 text-xs text-brand-primary hover:bg-brand-primary/10"
            >
              別ウィンドウで開く
            </button>
          </div>
          <FlightViewer3DSuspense waypoints={waypoints} isProUser={isProUser} />
        </>
      ) : (
        <div
          data-testid="flight-viewer-popout-placeholder"
          className="flex min-h-[280px] flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-brand-primary/35 bg-brand-secondary/40 px-4 py-8 text-center"
        >
          <p className="text-sm text-gray-200">別ウィンドウで表示中</p>
          <p className="max-w-md text-xs text-gray-400">
            GPU と 3D タイル利用量を抑えるため、ページ内の 3D プレビューは停止しています。ポップアップを閉じるとここに再表示されます。
          </p>
          <button
            type="button"
            data-testid="flight-viewer-popout-focus"
            onClick={focusPopout}
            className="min-h-[44px] rounded border border-brand-primary/50 px-4 py-2 text-sm text-brand-primary hover:bg-brand-primary/10"
          >
            3D ウィンドウを前面に
          </button>
        </div>
      )}
    </div>
  );
};
