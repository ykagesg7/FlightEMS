import { describe, expect, it } from 'vitest';
import { parseFlightPlanTime } from '../../utils/flightTime';

describe('parseFlightPlanTime', () => {
  it('parses hh:mm using today date', () => {
    const d = parseFlightPlanTime('08:30');
    expect(d.getHours()).toBe(8);
    expect(d.getMinutes()).toBe(30);
    expect(d.getSeconds()).toBe(0);
  });

  it('parses hh:mm:ss', () => {
    const d = parseFlightPlanTime('14:05:09');
    expect(d.getHours()).toBe(14);
    expect(d.getMinutes()).toBe(5);
    expect(d.getSeconds()).toBe(9);
  });

  it('returns invalid Date for empty or placeholder', () => {
    expect(Number.isNaN(parseFlightPlanTime('').getTime())).toBe(true);
    expect(Number.isNaN(parseFlightPlanTime('--').getTime())).toBe(true);
  });

  it('returns invalid Date for bad format', () => {
    expect(Number.isNaN(parseFlightPlanTime('abc').getTime())).toBe(true);
    expect(Number.isNaN(parseFlightPlanTime('12').getTime())).toBe(true);
  });
});
