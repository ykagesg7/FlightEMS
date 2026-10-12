import { useQuery } from '@tanstack/react-query';
import React, { useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { Navigate } from 'react-router-dom';
import { Button, Typography } from '../../components/ui';
import { useSpiralLms } from '../../hooks/useSpiralLms';
import { useAuthStore } from '../../stores/authStore';
import { buildArticlePublishedAtByContentId } from '../../utils/spiralLmsArticleRelease';
import { fetchSpiralContentSlugMap } from '../../utils/spiralLmsApi';
import { isSpiralLmsFeatureEnabled } from '../../utils/spiralLmsFeature';
import { buildSpiralLmsNodeDisplayContext } from '../../utils/spiralLmsNodeDisplay';
import { spiralLmsQueryErrorMessage } from '../../utils/spiralLmsUiErrorMessages';
import { SpiralLmsInspectionList } from './components/SpiralLmsInspectionList';
import { SpiralLmsLoginPrompt } from './components/SpiralLmsLoginPrompt';
import { SpiralLmsTodayUnit } from './components/SpiralLmsTodayUnit';

const SPIRAL_LMS_HUB_PATH = '/dev/spiral-lms';
const NOW_TICK_MS = 60_000;

const SpiralLmsHubPage: React.FC = () => {
  const featureEnabled = isSpiralLmsFeatureEnabled();
  const user = useAuthStore((s) => s.user);
  const now = useMinuteClock();
  const spiral = useSpiralLms(now);

  const publishedAtByContentId = useMemo(() => buildArticlePublishedAtByContentId(), []);

  const slugMapQuery = useQuery({
    queryKey: ['spiralLms', 'slugMap'],
    queryFn: fetchSpiralContentSlugMap,
    enabled: featureEnabled,
    staleTime: 60_000,
  });

  const displayContext = useMemo(
    () =>
      buildSpiralLmsNodeDisplayContext(
        spiral.nodes,
        spiral.progressByNodeId,
        slugMapQuery.data ?? {},
        publishedAtByContentId,
        now,
      ),
    [now, publishedAtByContentId, slugMapQuery.data, spiral.nodes, spiral.progressByNodeId],
  );

  if (!featureEnabled) {
    return <Navigate to="/" replace />;
  }

  const loadError = spiral.error ?? slugMapQuery.error;
  const isLoading = Boolean(user) && (spiral.isLoading || slugMapQuery.isLoading);

  return (
    <>
      <Helmet>
        <title>螺旋マトリックス LMS（開発）</title>
      </Helmet>
      <div className="mx-auto max-w-5xl space-y-8 px-4 py-10">
        <header className="space-y-2">
          <Typography variant="h1" className="text-2xl md:text-3xl">
            螺旋マトリックス LMS
          </Typography>
          <p className="text-sm text-[color:var(--text-secondary)]">
            開発プレビュー（VITE_SPIRAL_LMS_ENABLED）。本番ビルドには含まれません。
          </p>
        </header>

        {!user ? (
          <SpiralLmsLoginPrompt returnPath={SPIRAL_LMS_HUB_PATH} />
        ) : (
          <>
            {loadError ? (
              <div
                className="rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800"
                role="alert"
              >
                {spiralLmsQueryErrorMessage(loadError)}
              </div>
            ) : null}

            {isLoading ? (
              <p className="text-sm text-[color:var(--text-secondary)]" role="status">読み込み中…</p>
            ) : (
              <>
                <SpiralLmsTodayUnit
                  nodes={spiral.nodes}
                  displayContext={displayContext}
                  isSignedIn
                />
                <SpiralLmsInspectionList nodes={spiral.nodes} displayContext={displayContext} />
              </>
            )}

            {spiral.isFetching && !isLoading ? (
              <p className="text-xs text-[color:var(--text-secondary)]">更新中…</p>
            ) : null}

            <div>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => {
                  void spiral.refetch();
                  void slugMapQuery.refetch();
                }}
              >
                再読み込み
              </Button>
            </div>
          </>
        )}
      </div>
    </>
  );
};

/** Recompute opens_at / article release gates once per minute. */
function useMinuteClock(): Date {
  const [now, setNow] = React.useState(() => new Date());

  React.useEffect(() => {
    const id = window.setInterval(() => {
      setNow(new Date());
    }, NOW_TICK_MS);
    return () => {
      window.clearInterval(id);
    };
  }, []);

  return now;
}

export default SpiralLmsHubPage;
