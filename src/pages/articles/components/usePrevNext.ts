import articleMetas from 'virtual:articles-index';
import { useMemo } from 'react';
import { filterReleasedArticleContents } from '../../../constants/articleHubCategories';
import { useLearningProgress } from '../../../hooks/useLearningProgress';
import { getArticleNavigationNeighbors } from '../../../utils/articleNavigation';

export function usePrevNext(currentId: string) {
  const { learningContents } = useLearningProgress();
  const list = useMemo(
    () => filterReleasedArticleContents(learningContents, articleMetas),
    [learningContents]
  );
  const neighbors = useMemo(
    () => getArticleNavigationNeighbors(currentId, list, articleMetas),
    [currentId, list]
  );

  return {
    list,
    prev: neighbors.prev,
    next: neighbors.next,
  };
}
