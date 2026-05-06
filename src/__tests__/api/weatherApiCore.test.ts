import { describe, expect, it } from 'vitest';

import { createDevMockFilteredWeather } from '../../../api/lib/weatherApiCore';

describe('createDevMockFilteredWeather', () => {
  it('returns WeatherAPI-shaped mock with JP location metadata', () => {
    const m = createDevMockFilteredWeather(35.555, 139.777);
    expect(m.location.country).toBe('JP');
    expect(m.location.name).toContain('35.55');
    expect(m.location.name).toContain('139.78');
    expect(m.current.wind.knots).toBe(8);
  });
});
