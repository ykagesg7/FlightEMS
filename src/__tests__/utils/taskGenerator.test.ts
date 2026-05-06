import { describe, it, expect, vi, beforeEach } from 'vitest';
import { generateDailyTasks } from '../../utils/taskGenerator';

interface SupabaseLikeResult {
  data: unknown;
  error: unknown;
}

/** PostgREST ビルダー終端まで `.then()` で結果を返すチェーン */
function chainResult(result: SupabaseLikeResult) {
  const chain: Record<string, unknown> = {};
  const loop = (): typeof chain => chain;
  for (const m of ['select', 'eq', 'lte', 'order', 'in', 'limit'] as const) {
    chain[m] = loop;
  }
  chain.then = (onFulfilled: (v: SupabaseLikeResult) => unknown, onRejected?: (e: unknown) => unknown) =>
    Promise.resolve(result).then(onFulfilled, onRejected);

  return chain as typeof chain & {
    then: (
      onFulfilled?: (value: SupabaseLikeResult) => unknown,
      onRejected?: (reason: unknown) => unknown,
    ) => Promise<unknown>;
  };
}

const mockFrom = vi.fn();

vi.mock('../../utils/supabase', () => ({
  supabase: {
    from: (...args: unknown[]) => mockFrom(...args),
  },
}));

describe('taskGenerator.generateDailyTasks', () => {
  beforeEach(() => {
    mockFrom.mockReset();
  });

  it('returns empty array when weakness query has error', async () => {
    mockFrom.mockImplementation(() => chainResult({ data: null, error: { message: 'fail' } }));
    await expect(generateDailyTasks('user-1')).resolves.toEqual([]);
  });

  it('returns empty array when supabase.from throws', async () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    mockFrom.mockImplementation(() => {
      throw new Error('network');
    });
    await expect(generateDailyTasks('user-1')).resolves.toEqual([]);
    spy.mockRestore();
  });

  it('returns weakness tasks for subjects at or below 60% with at least 5 attempts', async () => {
    mockFrom.mockImplementation((table: string) => {
      if (table === 'user_test_results') {
        const rows: { subject_category: string; is_correct: boolean }[] = [];
        const weak = '航空工学';
        for (let i = 0; i < 5; i++) {
          rows.push({ subject_category: weak, is_correct: i < 2 });
        }
        return chainResult({ data: rows, error: null });
      }
      return chainResult({ data: [], error: null });
    });

    const tasks = await generateDailyTasks('user-1');
    expect(tasks).toHaveLength(1);
    expect(tasks[0].type).toBe('weakness');
    expect(tasks[0].title).toContain('航空工学');
    expect(tasks[0].linkTo).toContain(encodeURIComponent('航空工学'));
  });

  it('merges weakness and review and returns at most 3 sorted by descending priority', async () => {
    mockFrom.mockImplementation((table: string) => {
      if (table === 'user_test_results') {
        const rows: { subject_category: string; is_correct: boolean }[] = [];
        const weak = '法规';
        for (let i = 0; i < 5; i++) {
          rows.push({ subject_category: weak, is_correct: false });
        }
        return chainResult({ data: rows, error: null });
      }
      if (table === 'user_unified_srs_status') {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return chainResult({
          data: [{ question_id: 'q1', next_review_date: today.toISOString() }],
          error: null,
        });
      }
      return chainResult({ data: [], error: null });
    });

    const tasks = await generateDailyTasks('user-1');
    expect(tasks.length).toBeLessThanOrEqual(3);
    const types = tasks.map(t => t.type);
    expect(types).toContain('weakness');
    expect(types).toContain('review');
    const priorities = tasks.map(t => t.priority);
    expect(priorities).toEqual([...priorities].sort((a, b) => b - a));
  });
});
