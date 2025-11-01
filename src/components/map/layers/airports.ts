import L from 'leaflet';
import { FilteredWeatherData } from '../../../services/weather';
import { fetchAviationWeather } from '../../../services/aviationWeather';
import type { AviationWeatherData } from '../../../types/aviation';
import type { WeatherCache } from '../../../contexts/WeatherCacheContext';
import { simplifiedAirportInfoContent } from '../popups/airportPopup';
import { createPopup } from '../popups/common';
import { createWeatherPopupContent } from '../popups/weatherPopup';

export const fetchAirportWeather = (
  feature: GeoJSON.Feature,
  map: L.Map,
  weatherCache: WeatherCache,
  setWeatherCache: React.Dispatch<React.SetStateAction<WeatherCache>>,
  fetchWeatherData: (lat: number, lon: number) => Promise<FilteredWeatherData | null>,
  CACHE_DURATION: number
) => {
  if (!feature.properties || !feature.geometry) return;

  const airportId = (feature.properties as any).id;
  const geometry = feature.geometry as GeoJSON.Point;
  const [longitude, latitude] = geometry.coordinates;

  const loadingPopupContent = `
    <div class="airport-popup">
      <div class="airport-popup-header">${(feature.properties as any)?.id || '不明'}</div>
      <div class="p-2">
        <h3 class="text-base font-bold mb-2">${(feature.properties as any)?.name1 || '空港'}</h3>
        <p class="text-sm">気象情報を読み込み中...</p>
        <div class="flex justify-center my-2">
          <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-green-500"></div>
        </div>
      </div>
    </div>
  `;

  const loadingPopup = createPopup([latitude, longitude])
    .setContent(loadingPopupContent)
    .openOn(map);

  const cachedEntry = weatherCache[airportId];
  const now = Date.now();
  if (cachedEntry && now - cachedEntry.timestamp < CACHE_DURATION) {
    if (cachedEntry.data && typeof cachedEntry.data === 'object' && 'current' in cachedEntry.data) {
      const airportInfoHtml = simplifiedAirportInfoContent(feature.properties as any);
      const html = createWeatherPopupContent(
        feature.properties as any,
        cachedEntry.data as FilteredWeatherData,
        airportInfoHtml,
        cachedEntry.aviationWeather || null
      );
      loadingPopup.setContent(html);
      loadingPopup.update();
      return;
    }
  }

  // 既存の気象データを取得
  const weatherDataPromise = fetchWeatherData(latitude, longitude);

  // ICAOコードがRJで始まる日本の空港の場合、METAR/TAFも取得
  let aviationWeatherPromise: Promise<AviationWeatherData | null> = Promise.resolve(null);
  if (airportId && typeof airportId === 'string' && airportId.startsWith('RJ')) {
    aviationWeatherPromise = fetchAviationWeather(airportId).catch((error) => {
      console.error(`${airportId}の航空気象データ取得エラー:`, error);
      return null;
    });
  }

         // 両方のデータを並列で取得
         Promise.all([weatherDataPromise, aviationWeatherPromise])
           .then(([weatherData, aviationWeather]) => {
             if (!weatherData) {
        // weatherDataがnullの場合もエラーポップアップを表示
        const errorPopupContent = `
          <div class="airport-popup airport-weather-popup">
            <div class="airport-popup-header">
              ${(feature.properties as any)?.id || '不明'}（${((feature.properties as any)?.name1 as string)?.split('(')[0].trim() || '空港'}）
            </div>
            <div class="p-3">
              <div>
                <p class="text-sm text-red-500 mb-3">気象情報の取得に失敗しました</p>
                <h4 class="text-base font-bold mb-2 text-green-800 border-b border-green-200 pb-1">空港情報</h4>
                <div class="ml-2">${simplifiedAirportInfoContent(feature.properties as any)}</div>
              </div>
            </div>
          </div>`;
        loadingPopup.setContent(errorPopupContent);
        loadingPopup.update();
        return;
      }

      const airportInfoHtml = simplifiedAirportInfoContent(feature.properties as any);
      const html = createWeatherPopupContent(
        feature.properties as any,
        weatherData,
        airportInfoHtml,
        aviationWeather
      );
      loadingPopup.setContent(html);
      loadingPopup.update();

      // キャッシュに保存（航空気象データも含む）
      setWeatherCache((prev) => ({
        ...prev,
        [airportId]: {
          data: weatherData,
          aviationWeather: aviationWeather,
          timestamp: Date.now()
        }
      }));
    })
    .catch((error) => {
      console.error('気象データ取得エラー:', error);
      const errorPopupContent = `
        <div class="airport-popup airport-weather-popup">
          <div class="airport-popup-header">
            ${(feature.properties as any)?.id || '不明'}（${((feature.properties as any)?.name1 as string)?.split('(')[0].trim() || '空港'}）
          </div>
          <div class="p-3">
            <div>
              <p class="text-sm text-red-500 mb-3">気象情報の取得に失敗しました</p>
              <h4 class="text-base font-bold mb-2 text-green-800 border-b border-green-200 pb-1">空港情報</h4>
              <div class="ml-2">${simplifiedAirportInfoContent(feature.properties as any)}</div>
            </div>
          </div>
        </div>`;
      loadingPopup.setContent(errorPopupContent);
      loadingPopup.update();
    });
};


