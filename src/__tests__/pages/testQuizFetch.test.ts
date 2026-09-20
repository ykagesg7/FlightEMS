import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fetchReviewQuestionsPool } from '../../pages/test/testQuizFetch';

interface SupabaseLikeResult {
  data: unknown;
  error: unknown;
}

function thenable(result: SupabaseLikeResult) {
  return {
    then: (
      onFulfilled: (v: SupabaseLikeResult) => unknown,
      onRejected?: (e: unknown) => unknown,
    ) => Promise.resolve(result).then(onFulfilled, onRejected),
  };
}

const mockFrom = vi.fn();
const mockGetUser = vi.fn();

vi.mock('../../utils/supabase', () => ({
  default: {
    from: (...args: unknown[]) => mockFrom(...args),
    auth: {
      getUser: (...args: unknown[]) => mockGetUser(...args),
    },
  },
}));

describe('fetchReviewQuestionsPool', () => {
  beforeEach(() => {
    mockFrom.mockReset();
    mockGetUser.mockReset();
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } });
  });

  it('loads lapsed SRS cards even when next_review_date is still in the future', async () => {
    let srsCalls = 0;
    mockFrom.mockImplementation((table: string) => {
      if (table === 'user_unified_srs_status') {
        srsCalls += 1;
        if (srsCalls === 1) {
          return {
            select: () => ({
              lte: () => ({
                eq: () => ({
                  limit: () => thenable({ data: [], error: null }),
                }),
              }),
            }),
          };
        }
        return {
          select: () => ({
            eq: () => ({
              eq: () => ({
                limit: () => thenable({
                  data: [{ question_id: 'q-lapse-1' }],
                  error: null,
                }),
              }),
            }),
          }),
        };
      }
      if (table === 'unified_cpl_questions') {
        return {
          select: () => ({
            in: () =>
              thenable({
                data: [
                  {
                    id: 'q-lapse-1',
                    question_text: 'lapse question',
                    options: ['a', 'b', 'c', 'd'],
                    correct_answer: 1,
                  },
                ],
                error: null,
              }),
          }),
        };
      }
      throw new Error(`unexpected table ${table}`);
    });

    const result = await fetchReviewQuestionsPool(10, 'cpl');
    expect(result.error).toBeNull();
    expect(result.questions.map((q) => q.id)).toEqual(['q-lapse-1']);
  });

  it('returns the diagnostic empty-state when neither SRS nor weak areas exist', async () => {
    mockFrom.mockImplementation((table: string) => {
      if (table === 'user_unified_srs_status') {
        return {
          select: () => ({
            lte: () => ({
              eq: () => ({
                limit: () => thenable({ data: [], error: null }),
              }),
            }),
            eq: () => ({
              eq: () => ({
                limit: () => thenable({ data: [], error: null }),
              }),
            }),
          }),
        };
      }
      if (table === 'user_weak_areas') {
        return {
          select: () => ({
            eq: () => ({
              order: () => ({
                limit: () => thenable({ data: [], error: null }),
              }),
            }),
          }),
        };
      }
      throw new Error(`unexpected table ${table}`);
    });

    const result = await fetchReviewQuestionsPool(10, 'cpl');
    expect(result.questions).toEqual([]);
    expect(result.error).toBe('弱点データがありません。10問診断を試してください。');
  });
});
