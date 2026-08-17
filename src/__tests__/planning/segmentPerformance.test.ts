import { describe, expect, it } from 'vitest';
import { inheritSegmentPerformance } from '../../pages/planning/segmentPerformance';
import type { RouteSegment } from '../../types';

const seg = (from: string, to: string, speed: number, altitude: number): RouteSegment => ({
  from,
  to,
  speed,
  bearing: 0,
  altitude,
  eta: '',
  distance: 10,
});

describe('inheritSegmentPerformance', () => {
  it('reuses matching from/to speed and altitude', () => {
    expect(
      inheritSegmentPerformance(
        [seg('RJFA', 'AHT-335-13', 220, 4500)],
        'RJFA',
        'AHT-335-13',
        300,
        3500,
      ),
    ).toEqual({ speed: 220, altitude: 4500 });
  });

  it('falls back when the leg is new or speed is invalid', () => {
    expect(inheritSegmentPerformance([seg('AAAA', 'BBBB', 0, 1000)], 'RJFA', 'RJFZ', 300, 3500)).toEqual({
      speed: 300,
      altitude: 3500,
    });
    expect(inheritSegmentPerformance([seg('RJFA', 'RJFZ', 0, 1000)], 'RJFA', 'RJFZ', 300, 3500)).toEqual({
      speed: 300,
      altitude: 1000,
    });
  });
});
