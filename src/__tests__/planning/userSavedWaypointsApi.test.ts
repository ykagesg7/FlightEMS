import { describe, expect, it } from 'vitest';
import { isGracefulSupabaseError } from '../../pages/planning/userWaypoints/userSavedWaypointsApi';

describe('userSavedWaypointsApi', () => {
  it('treats missing table errors as graceful', () => {
    expect(isGracefulSupabaseError({ code: 'PGRST205', message: 'table not in schema cache' })).toBe(
      true,
    );
    expect(isGracefulSupabaseError({ code: '42P01', message: 'relation does not exist' })).toBe(true);
    expect(
      isGracefulSupabaseError({ message: 'Could not find the table public.user_saved_waypoints' }),
    ).toBe(true);
  });

  it('does not treat auth errors as graceful', () => {
    expect(isGracefulSupabaseError({ code: '42501', message: 'permission denied' })).toBe(false);
  });
});
