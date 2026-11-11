import type { QuizQuestion } from '../../types/quiz';
import type { ExamLevelFilter } from './examLevelFilter';
import {
  fetchDiagnosticQuestionsPool,
  fetchMappedQuestionsPool,
  fetchSubjectQuestionsPool,
} from './testQuizFetch';

export type QuizPoolResult = { questions: QuizQuestion[]; error: string | null };

const TTL_MS = 3 * 60 * 1000;

type CacheEntry = {
  result: QuizPoolResult;
  fetchedAt: number;
};

const cache = new Map<string, CacheEntry>();
const inflight = new Map<string, Promise<QuizPoolResult>>();
const generation = new Map<string, number>();

function bumpGeneration(key: string): number {
  const next = (generation.get(key) ?? 0) + 1;
  generation.set(key, next);
  return next;
}

function isFresh(entry: CacheEntry): boolean {
  return Date.now() - entry.fetchedAt < TTL_MS;
}

function peekEntry(key: string): CacheEntry | null {
  const entry = cache.get(key);
  if (!entry) return null;
  if (!isFresh(entry)) {
    cache.delete(key);
    return null;
  }
  return entry;
}

export function consumeCachedQuizPool(key: string): QuizPoolResult | null {
  const entry = peekEntry(key);
  if (!entry) return null;
  cache.delete(key);
  return entry.result;
}

function storeIfCurrent(key: string, gen: number, result: QuizPoolResult) {
  if ((generation.get(key) ?? 0) !== gen) return;
  cache.set(key, { result, fetchedAt: Date.now() });
}

async function runPoolFetch(key: string, fetcher: () => Promise<QuizPoolResult>): Promise<QuizPoolResult> {
  const existing = inflight.get(key);
  if (existing) return existing;

  const gen = generation.get(key) ?? 0;
  const promise = fetcher()
    .then((result) => {
      storeIfCurrent(key, gen, result);
      return result;
    })
    .finally(() => {
      inflight.delete(key);
    });

  inflight.set(key, promise);
  return promise;
}

export function diagnosticPoolCacheKey(count: number, exam: ExamLevelFilter): string {
  return `diagnostic:${exam}:${count}`;
}

export function subjectPoolCacheKey(
  subject: string,
  subSubjectValues: string[],
  count: number,
  exam: ExamLevelFilter,
): string {
  const subs = [...subSubjectValues].sort().join('|');
  return `subject:${exam}:${subject}:${subs}:${count}`;
}

export function mappedPoolCacheKey(contentId: string, count: number): string {
  return `mapped:${contentId}:${count}`;
}

export function prefetchDiagnosticQuestionsPool(count: number, exam: ExamLevelFilter): void {
  const key = diagnosticPoolCacheKey(count, exam);
  if (peekEntry(key)) return;
  if (inflight.has(key)) return;
  void runPoolFetch(key, () => fetchDiagnosticQuestionsPool(count, exam));
}

export function prefetchSubjectQuestionsPool(
  subject: string,
  subSubjectValues: string[],
  count: number,
  exam: ExamLevelFilter,
): void {
  const key = subjectPoolCacheKey(subject, subSubjectValues, count, exam);
  if (peekEntry(key)) return;
  if (inflight.has(key)) return;
  void runPoolFetch(key, () => fetchSubjectQuestionsPool(subject, subSubjectValues, count, exam));
}

export function prefetchMappedQuestionsPool(contentId: string, count: number): void {
  const key = mappedPoolCacheKey(contentId, count);
  if (peekEntry(key)) return;
  if (inflight.has(key)) return;
  void runPoolFetch(key, () => fetchMappedQuestionsPool(contentId, count));
}

async function fetchWithOptionalCache(
  key: string,
  fetcher: () => Promise<QuizPoolResult>,
  options: { forceFresh?: boolean },
): Promise<QuizPoolResult> {
  if (options.forceFresh) {
    bumpGeneration(key);
    cache.delete(key);
    return fetcher();
  }

  const cached = consumeCachedQuizPool(key);
  if (cached) return cached;

  const pending = inflight.get(key);
  if (pending) {
    try {
      return await pending;
    } finally {
      cache.delete(key);
    }
  }

  return runPoolFetch(key, fetcher);
}

export function fetchDiagnosticQuestionsPoolWithCache(
  count: number,
  exam: ExamLevelFilter,
  options: { forceFresh?: boolean } = {},
): Promise<QuizPoolResult> {
  const key = diagnosticPoolCacheKey(count, exam);
  return fetchWithOptionalCache(key, () => fetchDiagnosticQuestionsPool(count, exam), options);
}

export function fetchSubjectQuestionsPoolWithCache(
  subject: string,
  subSubjectValues: string[],
  count: number,
  exam: ExamLevelFilter,
  options: { forceFresh?: boolean } = {},
): Promise<QuizPoolResult> {
  const key = subjectPoolCacheKey(subject, subSubjectValues, count, exam);
  return fetchWithOptionalCache(
    key,
    () => fetchSubjectQuestionsPool(subject, subSubjectValues, count, exam),
    options,
  );
}

export function fetchMappedQuestionsPoolWithCache(
  contentId: string,
  count: number,
  options: { forceFresh?: boolean } = {},
): Promise<QuizPoolResult> {
  const key = mappedPoolCacheKey(contentId, count);
  return fetchWithOptionalCache(key, () => fetchMappedQuestionsPool(contentId, count), options);
}
