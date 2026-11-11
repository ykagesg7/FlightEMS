import { describe, expect, it } from 'vitest';
import { resolveAviationCacheControl, resolveWeatherAction } from '../../../api/weather';

function req(url: string, action?: string) {
  return { url, query: action === undefined ? {} : { action } } as Parameters<
    typeof resolveWeatherAction
  >[0];
}

describe('resolveWeatherAction', () => {
  it('defaults to the general forecast', () => {
    expect(resolveWeatherAction(req('/api/weather?lat=35&lon=139'))).toBe('forecast');
  });

  it('reads action from the query string', () => {
    expect(resolveWeatherAction(req('/api/weather', 'aviation'))).toBe('aviation');
    expect(resolveWeatherAction(req('/api/weather', 'rainviewer'))).toBe('rainviewer');
  });

  it('reads action from the legacy path', () => {
    expect(resolveWeatherAction(req('/api/aviation-weather?type=metar'))).toBe('aviation');
    expect(resolveWeatherAction(req('/api/rainviewer-maps'))).toBe('rainviewer');
  });
});

describe('resolveAviationCacheControl', () => {
  it('uses 90s for METAR and 600s for TAF', () => {
    expect(resolveAviationCacheControl('metar')).toBe('public, max-age=90, s-maxage=90');
    expect(resolveAviationCacheControl('taf')).toBe('public, max-age=600, s-maxage=600');
  });
});
