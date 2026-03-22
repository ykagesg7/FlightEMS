import { describe, expect, it } from 'vitest';
import {
  buildOpenMeteoHourlyWindParams,
  buildOpenMeteoHourlyWindUrl,
  parseOpenMeteoHourlyWindAloft,
} from '../../services/openMeteo';

describe('openMeteo', () => {
  it('buildOpenMeteoHourlyWindParams lists speed+direction per level', () => {
    expect(buildOpenMeteoHourlyWindParams([850])).toBe(
      'wind_speed_850hPa,wind_direction_850hPa'
    );
    expect(buildOpenMeteoHourlyWindParams([850, 250])).toBe(
      'wind_speed_850hPa,wind_direction_850hPa,wind_speed_250hPa,wind_direction_250hPa'
    );
  });

  it('buildOpenMeteoHourlyWindUrl contains forecast endpoint and kn', () => {
    const u = buildOpenMeteoHourlyWindUrl(35, 139, [850], 2);
    expect(u).toContain('api.open-meteo.com/v1/forecast');
    expect(u).toContain('wind_speed_unit=kn');
    expect(u).toContain('latitude=35');
    expect(u).toContain('longitude=139');
    expect(u).toContain('forecast_days=2');
  });

  it('parseOpenMeteoHourlyWindAloft maps hourly arrays', () => {
    const json = {
      latitude: 35,
      longitude: 139,
      hourly: {
        time: ['2026-03-21T00:00', '2026-03-21T01:00'],
        wind_speed_850hPa: [10, 11],
        wind_direction_850hPa: [90, 100],
      },
    };
    const r = parseOpenMeteoHourlyWindAloft(json, [850]);
    expect(r).not.toBeNull();
    expect(r!.hourly).toHaveLength(2);
    expect(r!.hourly[0].levels[0]).toEqual({
      pressureHpa: 850,
      windFromDeg: 90,
      speedKt: 10,
    });
    expect(r!.hourly[1].levels[0].speedKt).toBe(11);
  });

  it('parseOpenMeteoHourlyWindAloft returns null on invalid', () => {
    expect(parseOpenMeteoHourlyWindAloft(null, [850])).toBeNull();
    expect(parseOpenMeteoHourlyWindAloft({}, [850])).toBeNull();
  });
});
