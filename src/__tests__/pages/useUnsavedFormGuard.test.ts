import { renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { useUnsavedFormGuard } from '@/pages/profile/hooks/useUnsavedFormGuard';

describe('useUnsavedFormGuard', () => {
  it('registers beforeunload when dirty', () => {
    const addSpy = vi.spyOn(window, 'addEventListener');
    renderHook(() => useUnsavedFormGuard(true));
    expect(addSpy).toHaveBeenCalledWith('beforeunload', expect.any(Function));
    addSpy.mockRestore();
  });

  it('does not register beforeunload when clean', () => {
    const addSpy = vi.spyOn(window, 'addEventListener');
    renderHook(() => useUnsavedFormGuard(false));
    expect(addSpy).not.toHaveBeenCalledWith('beforeunload', expect.any(Function));
    addSpy.mockRestore();
  });
});
