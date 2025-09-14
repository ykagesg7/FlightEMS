import type { FilteredWeatherData } from '../../../api/weather';
import { escapeHtml, kvItem, sectionHeader } from './common';

export const createWeatherPopupContent = (
  airportProps: Record<string, unknown>,
  weatherData: FilteredWeatherData,
  airportInfoHtml?: string
): string => {
  const current = weatherData?.current;

  if (!current) {
    return `
      <div class="airport-popup airport-weather-popup">
        <div class="airport-popup-header">
          ${airportProps.id as string}（${(airportProps.name1 as string)?.split('(')[0].trim()}）
        </div>
        <div class="p-3">
          <p class="text-sm text-red-500">気象データが不完全です</p>
        </div>
      </div>
    `;
  }

  const conditionText = current.condition.japanese || current.condition.text;
  const temp = current.temp_c !== undefined ? `${current.temp_c}℃` : '取得できません';

  const windDegree = current.wind.degree !== undefined ? current.wind.degree : null;
  const windSpeedKnots = current.wind.knots !== undefined ? current.wind.knots : null;
  const windInfo = (windDegree !== null && windSpeedKnots !== null)
    ? `${windDegree.toString().padStart(3, '0')}°/${windSpeedKnots}kt`
    : '取得できません';

  const pressureInch = current.pressure.inch !== undefined
    ? `${current.pressure.inch}inch`
    : '取得できません';

  const visibility = current.visibility_km !== undefined ? `${current.visibility_km}km` : '取得できません';

  const astronomy = weatherData.astronomy;
  const sunrise = astronomy?.sunrise || '情報なし';
  const sunset = astronomy?.sunset || '情報なし';
  const sunriseSunset = `${sunrise}/${sunset}`;

  const lastUpdated = current.last_updated || '不明';

  const iconUrl = current.condition.icon ? `https:${current.condition.icon}` : '';
  const iconHtml = iconUrl ? `<img src="${iconUrl}" alt="${conditionText}" class="weather-icon">` : '';

  return `
    <div class="airport-popup airport-weather-popup popup-compact">
      <div class="airport-popup-header">
        ${airportProps.id as string}（${(airportProps.name1 as string)?.split('(')[0].trim()}）
      </div>
      <div class="p-3 popup-two-col">
        <div>
          ${sectionHeader('気象情報', iconHtml)}
          <p class="text-sm mt-1 popup-value">${escapeHtml(conditionText)}</p>

          <div class="ml-2 weather-info-grid">
            ${kvItem('weather', '温度：', temp, { readout: true })}
            ${kvItem('weather', '風：', windInfo, { readout: true })}
            ${kvItem('weather', '視程：', visibility, { readout: true })}
            ${kvItem('weather', '気圧：', pressureInch, { readout: true })}
            ${kvItem('weather', '日出/日入：', sunriseSunset)}
            <p class="text-xs mt-1 text-gray-500 weather-update-time">
              <span>最終更新：${escapeHtml(lastUpdated)}</span>
            </p>
          </div>
        </div>
        <div>
          <div>
            <h4 class="text-sm font-bold mb-0 popup-section-title">空港情報</h4>
          </div>
          <div class="ml-2 airport-info-grid">${airportInfoHtml ?? ''}</div>
        </div>
      </div>
    </div>
  `;
};


