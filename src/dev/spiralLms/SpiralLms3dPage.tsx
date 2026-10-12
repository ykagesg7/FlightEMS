import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Navigate } from 'react-router-dom';
import { spiralLmsQueryErrorMessage } from '../../utils/spiralLmsUiErrorMessages';
import { SpiralLms3dPanel } from './components/SpiralLms3dPanel';
import { SpiralLmsDevChrome } from './components/SpiralLmsDevChrome';
import { SpiralLmsLoginPrompt } from './components/SpiralLmsLoginPrompt';
import { useSpiralLmsHubData } from './useSpiralLmsHubData';

const SPIRAL_LMS_3D_PATH = '/dev/spiral-lms/3d';

const SpiralLms3dPage: React.FC = () => {
  const hub = useSpiralLmsHubData();

  if (!hub.featureEnabled) {
    return <Navigate to="/" replace />;
  }

  return (
    <>
      <Helmet>
        <title>螺旋マトリックス LMS — 3D（開発）</title>
      </Helmet>
      <SpiralLmsDevChrome onReload={() => void hub.refetch()}>
        {!hub.user ? (
          <SpiralLmsLoginPrompt returnPath={SPIRAL_LMS_3D_PATH} />
        ) : (
          <>
            {hub.loadError ? (
              <div
                className="rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800"
                role="alert"
              >
                {spiralLmsQueryErrorMessage(hub.loadError)}
              </div>
            ) : null}

            {hub.isLoading ? (
              <p className="text-sm text-[color:var(--text-secondary)]" role="status">読み込み中…</p>
            ) : (
              <SpiralLms3dPanel nodes={hub.nodes} displayContext={hub.displayContext} />
            )}

            {hub.isFetching && !hub.isLoading ? (
              <p className="text-xs text-[color:var(--text-secondary)]">更新中…</p>
            ) : null}
          </>
        )}
      </SpiralLmsDevChrome>
    </>
  );
};

export default SpiralLms3dPage;
