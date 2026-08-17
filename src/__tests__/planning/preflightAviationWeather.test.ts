import { describe, expect, it } from 'vitest';
import { buildAirportWeatherSnapshot } from '../../pages/planning/briefing/preflightAviationWeather';
import type { AviationWeatherData } from '../../types/aviation';

describe('buildAirportWeatherSnapshot', () => {
  it('formats METAR and TAF previews', () => {
    const data: AviationWeatherData = {
      metar: {
        icaoId: 'RJFA',
        receiptTime: '',
        obsTime: 1,
        reportTime: '',
        temp: 20,
        dewp: 10,
        wdir: 180,
        wspd: 8,
        visib: '10',
        altim: 1013,
        qcField: 0,
        metarType: 'METAR',
        rawOb: 'RJFA 170000Z 18008KT 9999 FEW030 20/10 Q1013',
        lat: 31,
        lon: 131,
        elev: 10,
        name: 'Kanoya',
        fltCat: 'VFR',
      },
      taf: {
        icaoId: 'RJFA',
        dbPopTime: '',
        bulletinTime: '',
        issueTime: '2026-08-17T00:00:00Z',
        validTimeFrom: 1,
        validTimeTo: 2,
        rawTAF: 'TAF RJFA 170000Z 1706/1812 18010KT 9999 FEW030 TEMPO 1712/1718 4000 SHRA',
        mostRecent: 1,
        remarks: '',
        lat: 31,
        lon: 131,
        elev: 10,
        prior: 0,
        name: 'Kanoya',
      },
      fetchedAt: new Date('2026-08-17T00:00:00Z'),
    };
    const snap = buildAirportWeatherSnapshot(
      { role: 'departure', icao: 'RJFA', label: 'Kanoya' },
      { loading: false, error: null, data },
    );
    expect(snap.metarFull).toContain('RJFA');
    expect(snap.tafFull).toContain('TEMPO');
    expect(snap.fltCat).toContain('VFR');
  });
});
