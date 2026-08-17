import React, { Suspense, lazy } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

const CesiumAirspaceViewer = lazy(() =>
  import('./airspace3d/CesiumAirspaceViewer').then((m) => ({
    default: m.CesiumAirspaceViewer,
  })),
);

/**
 * 教育用 3D 空域 + 計画／デモ航跡（Cesium）。
 * Planning 本体とは分離した隔離ルート。
 */
const Airspace3dPage: React.FC = () => {
  return (
    <div
      className="flex h-[calc(100vh-4rem)] flex-col overflow-hidden bg-brand-secondary text-gray-100"
      data-testid="airspace3d-page"
    >
      <Helmet>
        <title>3D空域（教育用・参考） | Flight Academy</title>
      </Helmet>

      <header className="shrink-0 border-b border-brand-primary/30 px-4 py-3">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <h1 className="text-lg font-semibold text-brand-primary">
              3D空域エクスプローラ（教育用）
            </h1>
            <p className="mt-1 max-w-3xl text-xs text-gray-400">
              Planning の下書きがあれば、レグの高度・速度で計画ルートを疑似再生します。なければデモ航跡です。
              RAPCON / ACC は航跡付近のみ立体表示（高度未収録は省略）。参考・非公式であり、実運航・管制用ではありません。
            </p>
          </div>
          <Link
            to="/planning"
            className="shrink-0 rounded border border-brand-primary/40 px-3 py-1.5 text-xs text-brand-primary hover:bg-brand-primary/10"
          >
            Planning へ
          </Link>
        </div>
      </header>

      <div className="min-h-0 flex-1">
        <Suspense
          fallback={
            <div className="flex h-full items-center justify-center text-sm text-gray-400">
              Cesium を読み込み中…
            </div>
          }
        >
          <CesiumAirspaceViewer />
        </Suspense>
      </div>
    </div>
  );
};

export default Airspace3dPage;
