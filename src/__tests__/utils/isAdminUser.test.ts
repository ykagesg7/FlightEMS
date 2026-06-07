import { describe, expect, it } from 'vitest';
import { isAdminUser } from '../../utils/isAdminUser';

describe('isAdminUser', () => {
  it('returns true for admin roll', () => {
    expect(isAdminUser({ roll: 'admin' })).toBe(true);
    expect(isAdminUser({ roll: 'Admin' })).toBe(true);
  });

  it('returns false for non-admin or missing profile', () => {
    expect(isAdminUser({ roll: 'Student' })).toBe(false);
    expect(isAdminUser(null)).toBe(false);
    expect(isAdminUser(undefined)).toBe(false);
  });
});
