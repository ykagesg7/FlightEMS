import { renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useAnnouncements } from '../../hooks/useAnnouncements';

const mockLimit = vi.fn();
const mockOrder = vi.fn(() => ({ limit: mockLimit }));
const mockSelect = vi.fn(() => ({ order: mockOrder }));
const mockFrom = vi.fn(() => ({ select: mockSelect }));

vi.mock('../../utils/supabase', () => ({
  createPublicSupabaseClient: () => ({
    from: mockFrom,
  }),
}));

describe('useAnnouncements', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockLimit.mockResolvedValue({
      data: [{ id: 1, title: 'Test', date: '2025-01-01T00:00:00+00:00' }],
      error: null,
    });
  });

  it('loads announcements via the public Supabase client (no session JWT)', async () => {
    const { result } = renderHook(() => useAnnouncements());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(mockFrom).toHaveBeenCalledWith('announcements');
    expect(mockSelect).toHaveBeenCalledWith('*');
    expect(mockOrder).toHaveBeenCalledWith('date', { ascending: false });
    expect(mockLimit).toHaveBeenCalledWith(5);
    expect(result.current.announcements).toHaveLength(1);
    expect(result.current.error).toBeNull();
  });
});
