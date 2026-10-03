import React, { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { FlightViewer3DSuspense } from './components/flight/flightViewer3d/FlightViewer3DSuspense';
import { usePlanning3dPopoutClient } from './components/flight/flightViewer3d/usePlanning3dPopoutClient';
import { preloadFlightViewer3DModule } from './components/flight/flightViewer3d/flightViewer3dLazy';

/**
 * Planning 3D プレビュー専用の軽量ポップアウト（別ウィンドウ）。
 * 2D 地図ポップアウトを追加する場合も BroadcastChannel 契約を拡張する。
 */
const Planning3dPopoutPage: React.FC = () => {
  const { waypoints, isProUser } = usePlanning3dPopoutClient();

  useEffect(() => {
    preloadFlightViewer3DModule();
  }, []);

  return (
    <div
      className="flex h-screen flex-col overflow-hidden bg-brand-secondary text-gray-100"
      data-testid="planning-3d-popout-page"
    >
      <Helmet>
        <title>3D ルートプレビュー | Flight Academy</title>
      </Helmet>
      <header className="shrink-0 border-b border-brand-primary/25 px-3 py-2">
        <h1 className="text-sm font-semibold text-brand-primary">3D ルートプレビュー（別ウィンドウ）</h1>
        <p className="text-2xs text-gray-400">
          Planning ページのルート編集と同期します。このウィンドウを閉じると Planning 内の 3D プレビューが再開します。
        </p>
      </header>
      <div className="min-h-0 flex-1 p-2">
        <FlightViewer3DSuspense waypoints={waypoints} isProUser={isProUser} />
      </div>
    </div>
  );
};

export default Planning3dPopoutPage;
