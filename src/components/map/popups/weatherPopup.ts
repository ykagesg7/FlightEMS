import type { FilteredWeatherData } from '@/services/weather';
import type { AviationWeatherData } from '@/types/aviation';
import { formatMETAR, formatTAF, translateFlightCategory } from '@/services/aviationWeather';
import { escapeHtml, kvItem, sectionHeader } from './common';

export const createWeatherPopupContent = (
  airportProps: Record<string, unknown>,
  weatherData: FilteredWeatherData,
  airportInfoHtml?: string,
  aviationWeather?: AviationWeatherData | null
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

  // METAR/TAFセクションの生成
  let metarSection = '';
  let tafSection = '';

  if (aviationWeather?.metar) {
    const metar = aviationWeather.metar;

    // 必須フィールドのチェック（NOAA APIの実際のフィールド名）
    if (metar.rawOb && metar.obsTime) {
      // obsTimeはUnixタイムスタンプなのでミリ秒に変換
      const observationTime = new Date(metar.obsTime * 1000).toLocaleString('ja-JP', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });

      metarSection = `
        <div class="metar-section">
          <h4>📡 METAR</h4>
          <div class="metar-raw">${escapeHtml(formatMETAR(metar.rawOb))}</div>
          <div class="metar-details">
            <p><strong>観測:</strong> ${observationTime}</p>
            ${metar.fltCat ? `<p><strong>カテゴリー:</strong> <span class="flight-category ${metar.fltCat}">${translateFlightCategory(metar.fltCat)}</span></p>` : ''}
            ${metar.wxString ? `<p><strong>天気:</strong> ${escapeHtml(metar.wxString)}</p>` : ''}
          </div>
        </div>
      `;
    }
  }

  if (aviationWeather?.taf) {
    const taf = aviationWeather.taf;

    // 必須フィールドのチェック（NOAA APIの実際のフィールド名）
    if (taf.rawTAF && taf.issueTime && taf.validTimeFrom !== undefined && taf.validTimeTo !== undefined) {
      const issueTime = new Date(taf.issueTime).toLocaleString('ja-JP', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
      // validTimeFrom/ToはUnixタイムスタンプなのでミリ秒に変換
      const validFrom = new Date(taf.validTimeFrom * 1000).toLocaleString('ja-JP', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
      const validTo = new Date(taf.validTimeTo * 1000).toLocaleString('ja-JP', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });

      tafSection = `
        <div class="taf-section">
          <h4>🔮 TAF（飛行場予報）</h4>
          <div class="taf-raw">${escapeHtml(formatTAF(taf.rawTAF))}</div>
          <div class="taf-details">
            <p><strong>発表:</strong> ${issueTime}</p>
            <p><strong>有効期間:</strong> ${validFrom} 〜 ${validTo}</p>
          </div>
        </div>
      `;
    }
  }

  // METAR/TAFが両方とも取得できない場合のメッセージ
  let noAviationWeatherMsg = '';
  if (aviationWeather && !aviationWeather.metar && !aviationWeather.taf) {
    noAviationWeatherMsg = `
      <div class="no-aviation-weather">
        <p>⚠️ METAR/TAF情報は現在利用できません</p>
        <p class="note">このデータは政府機関から提供されており、一時的に利用できない場合があります。</p>
      </div>
    `;
  }

  // 気象情報カードセクション
  const weatherSection = `
    <div class="weather-section">
      <h4>🌤️ 気象情報${iconHtml ? ` ${iconHtml}` : ''}</h4>
      <p class="text-sm mt-1 popup-value">${escapeHtml(conditionText)}</p>
      <div class="weather-info-grid">
        ${kvItem('weather', '温度：', temp, { readout: true })}
        ${kvItem('weather', '風：', windInfo, { readout: true })}
        ${kvItem('weather', '視程：', visibility, { readout: true })}
        ${kvItem('weather', '気圧：', pressureInch, { readout: true })}
        ${kvItem('weather', '日出/日入：', sunriseSunset)}
        <p class="text-xs mt-1 weather-update-time">
          <span>最終更新：${escapeHtml(lastUpdated)}</span>
        </p>
      </div>
    </div>
  `;

  // 空港情報カードセクション
  const airportSection = `
    <div class="airport-info-section">
      <h4>✈️ 空港情報</h4>
      <div class="airport-info-grid">${airportInfoHtml ?? ''}</div>
    </div>
  `;

  return `
    <div class="airport-popup airport-weather-popup popup-compact">
      <div class="airport-popup-header">
        ${airportProps.id as string}（${(airportProps.name1 as string)?.split('(')[0].trim()}）
      </div>
      <div class="p-3">
        ${weatherSection}
        ${airportSection}
      </div>
      ${metarSection}
      ${tafSection}
      ${noAviationWeatherMsg}
    </div>
  `;
};


