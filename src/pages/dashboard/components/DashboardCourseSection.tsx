import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { filterReleasedArticleContents } from '../../../constants/articleHubCategories';
import { useArticleProgress } from '../../../hooks/useArticleProgress';
import { useCohortProfile } from '../../../hooks/useCohortProfile';
import { useLearningProgress } from '../../../hooks/useLearningProgress';
import type { ArticleMeta } from '../../../types/articles';
import { getArticleIndex } from '../../../utils/articlesIndex';
import {
  findNextCourseArticle,
  formatCoursePositionLine,
  isPrimaryCourseComplete,
  resolvePrimaryCourseId,
} from '../../../utils/dashboardCourse';
import { Card, CardContent, Typography } from '../../../components/ui';

interface DashboardCourseSectionProps {
  forceFallback?: boolean;
}

export const DashboardCourseSection: React.FC<DashboardCourseSectionProps> = ({
  forceFallback = false,
}) => {
  const { profile } = useCohortProfile();
  const { learningContents } = useLearningProgress();
  const { getArticleProgress } = useArticleProgress();
  const [metas, setMetas] = useState<Record<string, ArticleMeta>>({});
  const [metasLoading, setMetasLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    getArticleIndex()
      .then((index) => {
        if (!mounted) return;
        const map: Record<string, ArticleMeta> = {};
        index.forEach((entry) => {
          map[entry.filename] = entry.meta;
        });
        setMetas(map);
      })
      .finally(() => {
        if (mounted) setMetasLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  const courseId = resolvePrimaryCourseId(profile);
  const courseDef = useMemo(() => {
    const contents = filterReleasedArticleContents(learningContents, metas);
    const next = findNextCourseArticle(courseId, contents, metas, getArticleProgress);
    const complete = isPrimaryCourseComplete(courseId, contents, metas, getArticleProgress);
    return { contents, next, complete };
  }, [courseId, learningContents, metas, getArticleProgress]);

  if (metasLoading) {
    return (
      <div className="mb-6 h-10 max-w-xl animate-pulse rounded-lg bg-gray-700/20" aria-hidden />
    );
  }

  const { next, complete } = courseDef;
  const showFallback = forceFallback || (!next && !complete);
  const courseLabel = courseId === 'cpl' ? 'CPL 学科コース' : 'PPL 学科コース';

  return (
    <div className="mb-6 space-y-3">
      {next && (
        <Typography variant="body-sm" color="muted" data-testid="dashboard-course-position">
          {formatCoursePositionLine(next)}
        </Typography>
      )}

      {next && (
        <Typography variant="body-sm" color="muted">
          <Link
            to={`/articles/${next.articleId}`}
            className="font-semibold text-brand-primary underline decoration-brand-primary/40 hover:decoration-brand-primary"
            data-testid="dashboard-course-continue"
          >
            コースの続き: {next.articleTitle}
          </Link>
        </Typography>
      )}

      {showFallback && (
        <Card variant="hud" padding="md" className="border-brand-primary/60" data-testid="dashboard-course-fallback">
          <CardContent>
            <Typography variant="caption" color="muted" className="mb-1">
              学科試験コース
            </Typography>
            <Typography variant="h4" color="brand" className="mb-2">
              {courseLabel}を始める
            </Typography>
            <Typography variant="body-sm" color="muted" className="mb-4">
              コース順に記事を読み、クイズで理解を確認できます。
            </Typography>
            <Link
              to={`/articles?course=${courseId}`}
              className="inline-flex items-center justify-center rounded-lg border border-brand-primary/50 px-4 py-3 text-sm font-semibold text-brand-primary transition hover:bg-brand-primary/10"
            >
              {courseLabel}へ
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default DashboardCourseSection;
