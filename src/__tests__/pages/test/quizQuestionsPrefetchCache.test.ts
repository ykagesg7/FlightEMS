import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  consumeCachedQuizPool,
  diagnosticPoolCacheKey,
  fetchDiagnosticQuestionsPoolWithCache,
  prefetchDiagnosticQuestionsPool,
} from '../../../pages/test/quizQuestionsPrefetchCache';
import * as testQuizFetch from '../../../pages/test/testQuizFetch';

vi.mock('../../../pages/test/testQuizFetch', () => ({
  fetchDiagnosticQuestionsPool: vi.fn(),
  fetchSubjectQuestionsPool: vi.fn(),
  fetchMappedQuestionsPool: vi.fn(),
}));

const sampleQuestions = [{ id: 'q1', text: 'Sample', type: 'multiple_choice' as const, options: ['a', 'b'] }];

describe('quizQuestionsPrefetchCache', () => {
  afterEach(() => {
    vi.clearAllMocks();
    consumeCachedQuizPool(diagnosticPoolCacheKey(10, 'all'));
  });

  it('reuses prefetch result on consume without duplicate fetch', async () => {
    const fetchMock = vi.mocked(testQuizFetch.fetchDiagnosticQuestionsPool);
    fetchMock.mockResolvedValue({ questions: sampleQuestions, error: null });

    prefetchDiagnosticQuestionsPool(10, 'all');
    await vi.waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));

    const result = await fetchDiagnosticQuestionsPoolWithCache(10, 'all');
    expect(result.questions).toHaveLength(1);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('forceFresh bypasses cache and fetches again', async () => {
    const fetchMock = vi.mocked(testQuizFetch.fetchDiagnosticQuestionsPool);
    fetchMock.mockResolvedValue({ questions: sampleQuestions, error: null });

    prefetchDiagnosticQuestionsPool(10, 'all');
    await vi.waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));

    await fetchDiagnosticQuestionsPoolWithCache(10, 'all');
    expect(fetchMock).toHaveBeenCalledTimes(1);

    await fetchDiagnosticQuestionsPoolWithCache(10, 'all', { forceFresh: true });
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
});
