import { describe, expect, it } from 'vitest';
import {
  isSavedWaypointOptionValue,
  mergeWaypointSearchOptions,
  parseSavedWaypointIdFromOptionValue,
  savedWaypointOptionValue,
  userSavedWaypointToOption,
} from '../../pages/planning/userWaypoints/mergeWaypointSearchOptions';

describe('mergeWaypointSearchOptions', () => {
  const catalog = [
    {
      value: 'WP01',
      label: 'WP01 - PUBLIC',
      name: 'PUBLIC',
      type: 'Waypoint',
      latitude: 35,
      longitude: 139,
    },
  ];

  const savedRow = {
    id: '11111111-1111-1111-1111-111111111111',
    user_id: 'user',
    name: '田川',
    ident: 'TAG',
    memo: null,
    latitude: 33.6381,
    longitude: 130.8067,
    created_at: '',
    updated_at: '',
  };

  it('prefixes saved waypoint option values', () => {
    const value = savedWaypointOptionValue(savedRow.id);
    expect(isSavedWaypointOptionValue(value)).toBe(true);
    expect(parseSavedWaypointIdFromOptionValue(value)).toBe(savedRow.id);
  });

  it('labels saved points as マイ', () => {
    const opt = userSavedWaypointToOption(savedRow);
    expect(opt.label).toContain('マイ');
    expect(opt.label).toContain('田川');
    expect(opt.type).toBe('UserSaved');
  });

  it('merges saved options before catalog', () => {
    const merged = mergeWaypointSearchOptions(catalog, [savedRow]);
    expect(merged).toHaveLength(2);
    expect(merged[0]!.value).toBe(savedWaypointOptionValue(savedRow.id));
    expect(merged[1]!.value).toBe('WP01');
  });

  it('returns catalog unchanged when no saved rows', () => {
    expect(mergeWaypointSearchOptions(catalog, [])).toEqual(catalog);
  });
});
