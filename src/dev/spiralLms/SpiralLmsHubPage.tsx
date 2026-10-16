import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Navigate } from 'react-router-dom';
import { spiralLmsQueryErrorMessage } from '../../utils/spiralLmsUiErrorMessages';
import { SpiralLmsDevChrome } from './components/SpiralLmsDevChrome';
import { SpiralLmsInspectionList } from './components/SpiralLmsInspectionList';
import { SpiralLmsLoginPrompt } from './components/SpiralLmsLoginPrompt';
import { SpiralLmsTodayUnit } from './components/SpiralLmsTodayUnit';
import { useSpiralLmsHubData } from './useSpiralLmsHubData';

const SPIRAL_LMS_HUB_PATH = '/dev/spiral-lms';

const SpiralLmsHubPage: React.FC = () => {
  const hub = useSpiralLmsHubData();

  if (!hub.featureEnabled) {
    return <Navigate to="/" replace />;
  }

  return (
    <>
      <Helmet>
        <title>螺旋マトリックス LMS（開発）</title>
      </Helmet>
      <SpiralLmsDevChrome onReload={() => void hub.refetch()}>
        {!hub.user ? (
          <SpiralLmsLoginPrompt returnPath={SPIRAL_LMS_HUB_PATH} />
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
              <>
                <SpiralLmsTodayUnit
                  nodes={hub.nodes}
                  displayContext={hub.displayContext}
                  isSignedIn
                />
                <SpiralLmsInspectionList nodes={hub.nodes} displayContext={hub.displayContext} />
              </>
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

export default SpiralLmsHubPage;
