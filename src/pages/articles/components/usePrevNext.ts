import { useMemo } from 'react';
import { useLearningProgress } from '../../../hooks/useLearningProgress';

const articleCategories = ['メンタリティー', '思考法', '操縦', 'CPL学科'];

export function usePrevNext(currentId: string) {
  const { learningContents } = useLearningProgress();
  const list = useMemo(() =>
    learningContents
      .filter(c => articleCategories.includes(c.category))
      .slice()
      .sort((a, b) => (a.category === b.category ? a.order_index - b.order_index : a.category.localeCompare(b.category)))
    , [learningContents]);
  const idx = useMemo(() => list.findIndex(c => c.id === currentId), [list, currentId]);
  return { list, prev: idx > 0 ? list[idx - 1] : undefined, next: idx >= 0 && idx < list.length - 1 ? list[idx + 1] : undefined };
}


