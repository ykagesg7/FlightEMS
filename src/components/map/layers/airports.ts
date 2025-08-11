import L from 'leaflet';
import { FilteredWeatherData } from '../../../api/weather';
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
      const html = createWeatherPopupContent(feature.properties as any, cachedEntry.data as FilteredWeatherData, airportInfoHtml);
      loadingPopup.setContent(html);
      loadingPopup.update();
      return;
    }
  }

  fetchWeatherData(latitude, longitude)
    .then((weatherData) => {
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
      const html = createWeatherPopupContent(feature.properties as any, weatherData, airportInfoHtml);
      loadingPopup.setContent(html);
      loadingPopup.update();
      setWeatherCache((prev) => ({ ...prev, [airportId]: { data: weatherData, timestamp: Date.now() } }));
    })
    .catch(() => {
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


