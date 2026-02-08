import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getStreakMultiplier } from '../../utils/streak';

// Supabase モック — streak.ts が import する supabase インスタンスを差し替える
const mockSingle = vi.fn();
const mockSelect = vi.fn(() => ({ single: mockSingle }));
const mockEq = vi.fn(() => ({ single: mockSingle, select: mockSelect }));
const mockUpdate = vi.fn(() => ({ eq: mockEq }));
const mockInsert = vi.fn(() => ({ select: mockSelect }));
const mockSelectChain = vi.fn(() => ({ eq: mockEq }));
const mockFrom = vi.fn(() => ({
  select: mockSelectChain,
  insert: mockInsert,
  update: mockUpdate,
}));

vi.mock('../../utils/supabase', () => ({
  supabase: {
    from: (...args: unknown[]) => mockFrom(...args),
  },
}));

// モックの後に dynamic import で streak モジュールを取得
// vi.mock は hoisted されるので通常の import でOK
import {
  getOrCreateStreakRecord,
  updateStreak,
  addStreakFreeze,
} from '../../utils/streak';
import type { StreakRecord } from '../../utils/streak';

// テスト用のサンプルストリークレコード
const sampleRecord: StreakRecord = {
  id: 'rec-1',
  user_id: 'user-1',
  current_streak: 5,
  longest_streak: 10,
  last_activity_date: '2026-02-06',
  streak_freeze_count: 2,
  streak_multiplier: 1.0,
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-02-06T00:00:00Z',
};

describe('Streak Utils', () => {
  // ===== Step 1b: 純粋関数テスト =====
  describe('getStreakMultiplier', () => {
    it('should return 1.0 for 0 days', () => {
      expect(getStreakMultiplier(0)).toBe(1.0);
    });

    it('should return 1.0 for 1 day', () => {
      expect(getStreakMultiplier(1)).toBe(1.0);
    });

    it('should return 1.0 for 6 days (boundary: just below 7)', () => {
      expect(getStreakMultiplier(6)).toBe(1.0);
    });

    it('should return 1.5 for 7 days (boundary: first tier)', () => {
      expect(getStreakMultiplier(7)).toBe(1.5);
    });

    it('should return 1.5 for 13 days (within 7-13 range)', () => {
      expect(getStreakMultiplier(13)).toBe(1.5);
    });

    it('should return 1.5 for 14 days (boundary: second tier)', () => {
      expect(getStreakMultiplier(14)).toBe(1.5);
    });

    it('should return 1.5 for 29 days (boundary: just below 30)', () => {
      expect(getStreakMultiplier(29)).toBe(1.5);
    });

    it('should return 2.0 for 30 days (boundary: third tier)', () => {
      expect(getStreakMultiplier(30)).toBe(2.0);
    });

    it('should return 2.0 for 60 days (mid-range)', () => {
      expect(getStreakMultiplier(60)).toBe(2.0);
    });

    it('should return 2.0 for 89 days (boundary: just below 90)', () => {
      expect(getStreakMultiplier(89)).toBe(2.0);
    });

    it('should return 2.5 for 90 days (boundary: max tier)', () => {
      expect(getStreakMultiplier(90)).toBe(2.5);
    });

    it('should return 2.5 for 365 days (well above max tier)', () => {
      expect(getStreakMultiplier(365)).toBe(2.5);
    });

    it('should return 1.0 for negative values', () => {
      expect(getStreakMultiplier(-1)).toBe(1.0);
    });
  });

  // ===== Step 2: Supabase 依存関数テスト =====
  describe('getOrCreateStreakRecord', () => {
    beforeEach(() => {
      vi.clearAllMocks();
    });

    /**
     * ヘルパー: from('streak_records').select('*').eq('user_id', userId).single() のチェーンを設定
     */
    function setupSelectChain(result: { data: StreakRecord | null; error: { code: string; message: string } | null }) {
      mockSingle.mockResolvedValueOnce(result);
      mockEq.mockReturnValueOnce({ single: mockSingle });
      mockSelectChain.mockReturnValueOnce({ eq: mockEq });
      mockFrom.mockReturnValueOnce({
        select: mockSelectChain,
        insert: mockInsert,
        update: mockUpdate,
      });
    }

    /**
     * ヘルパー: from('streak_records').insert({...}).select().single() のチェーンを設定
     */
    function setupInsertChain(result: { data: StreakRecord | null; error: { message: string } | null }) {
      mockSingle.mockResolvedValueOnce(result);
      mockSelect.mockReturnValueOnce({ single: mockSingle });
      mockInsert.mockReturnValueOnce({ select: mockSelect });
      mockFrom.mockReturnValueOnce({
        select: mockSelectChain,
        insert: mockInsert,
        update: mockUpdate,
      });
    }

    it('should return existing streak record', async () => {
      setupSelectChain({ data: sampleRecord, error: null });

      const result = await getOrCreateStreakRecord('user-1');

      expect(result).toEqual(sampleRecord);
      expect(mockFrom).toHaveBeenCalledWith('streak_records');
    });

    it('should create new record when not found (PGRST116)', async () => {
      // 1回目: レコードが見つからない（PGRST116）
      setupSelectChain({ data: null, error: { code: 'PGRST116', message: 'Not found' } });
      // 2回目: insert チェーン
      const newRecord = {
        ...sampleRecord,
        current_streak: 0,
        longest_streak: 0,
        streak_freeze_count: 0,
        streak_multiplier: 1.0,
      };
      setupInsertChain({ data: newRecord, error: null });

      const result = await getOrCreateStreakRecord('user-1');

      expect(result).toEqual(newRecord);
    });

    it('should return null on database error (non-PGRST116)', async () => {
      setupSelectChain({ data: null, error: { code: 'PGRST500', message: 'DB Error' } });

      const result = await getOrCreateStreakRecord('user-1');

      expect(result).toBeNull();
    });

    it('should return null on insert error', async () => {
      // 1回目: レコードが見つからない
      setupSelectChain({ data: null, error: { code: 'PGRST116', message: 'Not found' } });
      // 2回目: insert がエラー
      setupInsertChain({ data: null, error: { message: 'Insert failed' } });

      const result = await getOrCreateStreakRecord('user-1');

      expect(result).toBeNull();
    });
  });

  describe('updateStreak', () => {
    beforeEach(() => {
      vi.clearAllMocks();
      // Date をモックして安定したテストを実現
      vi.useFakeTimers();
      vi.setSystemTime(new Date('2026-02-07T12:00:00Z'));
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    /**
     * ヘルパー: getOrCreateStreakRecord の select チェーンを設定
     */
    function setupGetRecord(record: StreakRecord | null, error: { code: string; message: string } | null = null) {
      mockSingle.mockResolvedValueOnce({ data: record, error });
      mockEq.mockReturnValueOnce({ single: mockSingle });
      mockSelectChain.mockReturnValueOnce({ eq: mockEq });
      mockFrom.mockReturnValueOnce({
        select: mockSelectChain,
        insert: mockInsert,
        update: mockUpdate,
      });
    }

    /**
     * ヘルパー: update チェーンを設定
     * from().update().eq().select().single()
     */
    function setupUpdateChain(result: { data: StreakRecord | null; error: { message: string } | null }) {
      const innerSingle = vi.fn().mockResolvedValueOnce(result);
      const innerSelect = vi.fn().mockReturnValueOnce({ single: innerSingle });
      const innerEq = vi.fn().mockReturnValueOnce({ select: innerSelect });
      const innerUpdate = vi.fn().mockReturnValueOnce({ eq: innerEq });
      mockFrom.mockReturnValueOnce({
        select: mockSelectChain,
        insert: mockInsert,
        update: innerUpdate,
      });
    }

    it('should return existing record when activity is on the same day', async () => {
      const todayRecord: StreakRecord = {
        ...sampleRecord,
        last_activity_date: '2026-02-07', // 今日
      };
      setupGetRecord(todayRecord);

      const result = await updateStreak('user-1');

      // 同日活動なのでそのまま返す（update は呼ばれない）
      expect(result).toEqual(todayRecord);
    });

    it('should increment streak for consecutive day activity', async () => {
      const yesterdayRecord: StreakRecord = {
        ...sampleRecord,
        current_streak: 5,
        longest_streak: 10,
        last_activity_date: '2026-02-06', // 昨日
      };
      setupGetRecord(yesterdayRecord);

      const updatedRecord: StreakRecord = {
        ...yesterdayRecord,
        current_streak: 6,
        last_activity_date: '2026-02-07',
      };
      setupUpdateChain({ data: updatedRecord, error: null });

      const result = await updateStreak('user-1');

      expect(result).toEqual(updatedRecord);
    });

    it('should set streak to 1 for first activity (null last_activity_date)', async () => {
      const noActivityRecord: StreakRecord = {
        ...sampleRecord,
        current_streak: 0,
        last_activity_date: null,
      };
      setupGetRecord(noActivityRecord);

      const updatedRecord: StreakRecord = {
        ...noActivityRecord,
        current_streak: 1,
        last_activity_date: '2026-02-07',
      };
      setupUpdateChain({ data: updatedRecord, error: null });

      const result = await updateStreak('user-1');

      expect(result).toEqual(updatedRecord);
    });

    it('should reset streak when gap is more than 1 day and no freeze', async () => {
      const oldRecord: StreakRecord = {
        ...sampleRecord,
        current_streak: 20,
        last_activity_date: '2026-02-04', // 3日前
        streak_freeze_count: 0,
      };
      setupGetRecord(oldRecord);

      const resetRecord: StreakRecord = {
        ...oldRecord,
        current_streak: 1,
        last_activity_date: '2026-02-07',
      };
      setupUpdateChain({ data: resetRecord, error: null });

      const result = await updateStreak('user-1');

      expect(result).toEqual(resetRecord);
    });

    it('should use streak freeze when gap > 1 day and freeze available', async () => {
      const oldRecord: StreakRecord = {
        ...sampleRecord,
        current_streak: 10,
        last_activity_date: '2026-02-05', // 2日前
        streak_freeze_count: 2,
      };
      setupGetRecord(oldRecord);

      // freeze 使用の update チェーン: from().update({streak_freeze_count}).eq()
      const freezeEq = vi.fn().mockResolvedValueOnce({ error: null });
      const freezeUpdate = vi.fn().mockReturnValueOnce({ eq: freezeEq });
      mockFrom.mockReturnValueOnce({
        select: mockSelectChain,
        insert: mockInsert,
        update: freezeUpdate,
      });

      // ストリーク更新の update チェーン
      const updatedRecord: StreakRecord = {
        ...oldRecord,
        current_streak: 11,
        streak_freeze_count: 1,
        last_activity_date: '2026-02-07',
      };
      setupUpdateChain({ data: updatedRecord, error: null });

      const result = await updateStreak('user-1');

      expect(result).toEqual(updatedRecord);
    });

    it('should return null when getOrCreateStreakRecord fails', async () => {
      setupGetRecord(null, { code: 'PGRST500', message: 'DB Error' });

      const result = await updateStreak('user-1');

      expect(result).toBeNull();
    });

    it('should return null when update fails', async () => {
      const noActivityRecord: StreakRecord = {
        ...sampleRecord,
        current_streak: 0,
        last_activity_date: null,
      };
      setupGetRecord(noActivityRecord);

      setupUpdateChain({ data: null, error: { message: 'Update failed' } });

      const result = await updateStreak('user-1');

      expect(result).toBeNull();
    });
  });

  describe('addStreakFreeze', () => {
    beforeEach(() => {
      vi.clearAllMocks();
    });

    /**
     * ヘルパー: getOrCreateStreakRecord の select チェーンを設定
     */
    function setupGetRecord(record: StreakRecord | null, error: { code: string; message: string } | null = null) {
      mockSingle.mockResolvedValueOnce({ data: record, error });
      mockEq.mockReturnValueOnce({ single: mockSingle });
      mockSelectChain.mockReturnValueOnce({ eq: mockEq });
      mockFrom.mockReturnValueOnce({
        select: mockSelectChain,
        insert: mockInsert,
        update: mockUpdate,
      });
    }

    it('should add streak freeze successfully', async () => {
      setupGetRecord(sampleRecord);

      // update チェーン: from().update({}).eq()
      const freezeEq = vi.fn().mockResolvedValueOnce({ error: null });
      const freezeUpdate = vi.fn().mockReturnValueOnce({ eq: freezeEq });
      mockFrom.mockReturnValueOnce({
        select: mockSelectChain,
        insert: mockInsert,
        update: freezeUpdate,
      });

      const result = await addStreakFreeze('user-1', 1);

      expect(result).toBe(true);
    });

    it('should add multiple streak freezes', async () => {
      setupGetRecord(sampleRecord);

      const freezeEq = vi.fn().mockResolvedValueOnce({ error: null });
      const freezeUpdate = vi.fn().mockReturnValueOnce({ eq: freezeEq });
      mockFrom.mockReturnValueOnce({
        select: mockSelectChain,
        insert: mockInsert,
        update: freezeUpdate,
      });

      const result = await addStreakFreeze('user-1', 3);

      expect(result).toBe(true);
    });

    it('should return false when getOrCreateStreakRecord fails', async () => {
      setupGetRecord(null, { code: 'PGRST500', message: 'DB Error' });

      const result = await addStreakFreeze('user-1');

      expect(result).toBe(false);
    });

    it('should return false when update fails', async () => {
      setupGetRecord(sampleRecord);

      const freezeEq = vi.fn().mockResolvedValueOnce({ error: { message: 'Update failed' } });
      const freezeUpdate = vi.fn().mockReturnValueOnce({ eq: freezeEq });
      mockFrom.mockReturnValueOnce({
        select: mockSelectChain,
        insert: mockInsert,
        update: freezeUpdate,
      });

      const result = await addStreakFreeze('user-1');

      expect(result).toBe(false);
    });
  });
});
