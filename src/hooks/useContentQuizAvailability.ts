import { useEffect, useState } from 'react';
import supabase from '../utils/supabase';

type MappingRow = {
  learning_content_id: string;
  test_question_ids: string[] | null;
  unified_cpl_question_ids: string[] | null;
};

export function mappingRowHasQuestions(row: MappingRow): boolean {
  const unified = row.unified_cpl_question_ids?.length ?? 0;
  const legacy = row.test_question_ids?.length ?? 0;
  return unified > 0 || legacy > 0;
}

/**
 * Returns content IDs that have at least one linked quiz question in learning_test_mapping.
 */
export function useContentQuizAvailability(contentIds: string[]): {
  availableIds: Set<string>;
  loading: boolean;
} {
  const [availableIds, setAvailableIds] = useState<Set<string>>(() => new Set());
  const [loading, setLoading] = useState(contentIds.length > 0);

  useEffect(() => {
    const uniqueIds = [...new Set(contentIds.filter(Boolean))];
    if (uniqueIds.length === 0) {
      setAvailableIds(new Set());
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);

    (async () => {
      try {
        const { data, error } = await supabase
          .from('learning_test_mapping')
          .select('learning_content_id, test_question_ids, unified_cpl_question_ids')
          .in('learning_content_id', uniqueIds);

        if (error) {
          console.error('useContentQuizAvailability: learning_test_mapping', error);
          if (!cancelled) setAvailableIds(new Set());
          return;
        }

        const withQuestions = new Set<string>();
        for (const row of (data ?? []) as MappingRow[]) {
          if (mappingRowHasQuestions(row)) {
            withQuestions.add(row.learning_content_id);
          }
        }
        if (!cancelled) setAvailableIds(withQuestions);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [contentIds.join('|')]);

  return { availableIds, loading };
}
