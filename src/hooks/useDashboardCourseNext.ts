import { useEffect, useMemo, useState } from 'react';
import { filterReleasedArticleContents } from '../constants/articleHubCategories';
import { useProgress } from '../contexts/ProgressContext';
import { useArticleProgress } from './useArticleProgress';
import { useCohortProfile } from './useCohortProfile';
import type { ArticleMeta } from '../types/articles';
import { getArticleIndex } from '../utils/articlesIndex';
import {
  findNextCourseArticle,
  isPrimaryCourseComplete,
  resolvePrimaryCourseId,
  type NextCourseArticle,
  type PrimaryCourseId,
} from '../utils/dashboardCourse';

export interface UseDashboardCourseNextResult {
  courseId: PrimaryCourseId;
  next: NextCourseArticle | null;
  complete: boolean;
  metasLoading: boolean;
}

/** ログイン HOME の学科コース「続き」行（レッスンバナー）用（ProgressProvider 配下）。 */
export function useDashboardCourseNext(): UseDashboardCourseNextResult {
  const { profile } = useCohortProfile();
  const { learningContents } = useProgress();
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

  const { next, complete } = useMemo(() => {
    const contents = filterReleasedArticleContents(learningContents, metas);
    const nextArticle = findNextCourseArticle(
      courseId,
      contents,
      metas,
      getArticleProgress,
    );
    const courseComplete = isPrimaryCourseComplete(
      courseId,
      contents,
      metas,
      getArticleProgress,
    );
    return { next: nextArticle, complete: courseComplete };
  }, [courseId, learningContents, metas, getArticleProgress]);

  return { courseId, next, complete, metasLoading };
}
