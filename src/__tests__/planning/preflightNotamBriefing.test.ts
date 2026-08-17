import { describe, expect, it } from 'vitest';
import type { FlightPlan } from '../../types';
import {
  buildAirportNotamBriefingSnapshot,
  extractPreflightNotamTargets,
  extractIcaoFromAirport,
} from '../../pages/planning/briefing/preflightNotamBriefing';
import type { SwimNotamItem } from '../../services/swimNotam';

function planWithAirports(): FlightPlan {
  return {
    departure: {
      value: 'RJTT',
      label: 'Tokyo (RJTT)',
      name: 'Tokyo',
      type: 'civilian',
      latitude: 35.5,
      longitude: 139.7,
    },
    arrival: {
      value: 'RJAA',
      label: 'Narita (RJAA)',
      name: 'Narita',
      type: 'civilian',
      latitude: 35.8,
      longitude: 140.4,
    },
    waypoints: [],
    speed: 120,
    altitude: 4500,
    departureTime: '00:00',
    groundTempC: 15,
    groundElevationFt: 0,
    totalDistance: 0,
    ete: '',
    eta: '',
    tas: 120,
    mach: 0,
    routeSegments: [],
  };
}

describe('preflightNotamBriefing', () => {
  it('extracts ICAO from airport value', () => {
    expect(extractIcaoFromAirport(planWithAirports().departure)).toBe('RJTT');
  });

  it('extracts departure and arrival targets without duplicate ICAO', () => {
    const targets = extractPreflightNotamTargets(planWithAirports());
    expect(targets).toHaveLength(2);
    expect(targets.map((t) => t.icao)).toEqual(['RJTT', 'RJAA']);
  });

  it('builds snapshot with highlights from NOTAM items', () => {
    const target = {
      role: 'departure' as const,
      icao: 'RJTT',
      label: 'Tokyo',
    };
    const items: SwimNotamItem[] = [
      {
        key: 'n1',
        summary: 'test',
        impactLabel: 'RJTT 滑走路16L 閉鎖',
        primaryText: '滑走路16Lは閉鎖。',
      },
    ];
    const snap = buildAirportNotamBriefingSnapshot(target, {
      loading: false,
      error: null,
      data: { ok: true, current: items, future: [] },
    });
    expect(snap.peekSummary).toContain('現在1件');
    expect(snap.highlights[0]?.preview).toContain('16L');
    expect(snap.highlights[0]?.fullText).toContain('滑走路16L');
  });

  it('does not use category-only impactLabel as the highlight body', () => {
    const target = {
      role: 'departure' as const,
      icao: 'RJFF',
      label: 'Fukuoka',
    };
    const items: SwimNotamItem[] = [
      {
        key: 'n1',
        summary: 'fallback',
        impactLabel: '施設',
        primaryText: 'ILS グライドパス 使用不可。',
      },
      {
        key: 'n2',
        summary: 'fallback2',
        impactLabel: '施設',
        primaryText: 'VOR 点検のため運用時間変更。',
      },
    ];
    const snap = buildAirportNotamBriefingSnapshot(target, {
      loading: false,
      error: null,
      data: { ok: true, current: items, future: [] },
    });
    expect(snap.highlights[0]?.preview).toContain('グライドパス');
    expect(snap.highlights[1]?.preview).toContain('VOR');
    expect(snap.highlights[0]?.preview).not.toBe('施設');
    expect(snap.highlights[0]?.fullText).toContain('ILS');
  });

  it('keeps full NOTAM text for details when preview is truncated', () => {
    const longBody = `ILS グライドパス 使用不可。${'詳細説明。'.repeat(40)}`;
    const snap = buildAirportNotamBriefingSnapshot(
      { role: 'departure', icao: 'RJFF', label: 'Fukuoka' },
      {
        loading: false,
        error: null,
        data: {
          ok: true,
          current: [{ key: 'long-1', summary: 's', impactLabel: '施設', primaryText: longBody }],
          future: [],
        },
      },
    );
    expect(snap.highlights[0]?.preview.endsWith('…')).toBe(true);
    expect(snap.highlights[0]?.fullText).toContain(longBody);
    expect(snap.highlights[0]?.fullText.startsWith('施設:')).toBe(true);
    expect(snap.highlights[0]?.fullText.length).toBeGreaterThan(snap.highlights[0]!.preview.length);
  });
});
