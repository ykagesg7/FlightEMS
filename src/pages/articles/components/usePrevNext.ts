import { useMemo } from 'react';
import { filterPublishedArticleContents } from '../../../constants/articleHubCategories';
import { useLearningProgress } from '../../../hooks/useLearningProgress';

export function usePrevNext(currentId: string) {
  const { learningContents } = useLearningProgress();
  const list = useMemo(
    () =>
      filterPublishedArticleContents(learningContents)
        .slice()
        .sort((a, b) =>
          a.category === b.category
            ? a.order_index - b.order_index
            : a.category.localeCompare(b.category)
        ),
    [learningContents]
  );
  const idx = useMemo(() => list.findIndex((c) => c.id === currentId), [list, currentId]);
  return {
    list,
    prev: idx > 0 ? list[idx - 1] : undefined,
    next: idx >= 0 && idx < list.length - 1 ? list[idx + 1] : undefined,
  };
}
