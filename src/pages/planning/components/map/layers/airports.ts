import L from 'leaflet';
import React from 'react';
import { FilteredWeatherData } from '@/services/weather';
import { fetchAviationWeather } from '@/services/aviationWeather';
import type { AviationWeatherData } from '@/types/aviation';
import type { WeatherCache } from '@/contexts/WeatherCacheContext';
import { simplifiedAirportInfoContent } from '../popups/airportPopup';
import { createPopup } from '../popups/common';
import { createWeatherPopupContent } from '../popups/weatherPopup';
import { bindPlanningSwimNotamButton, swimNotamButtonSection } from '../popups/swimNotamPopup';
import type { AirportProps } from '../types';

/** ローカル GeoJSON レイヤー用 ID（NOAA METAR/TAF 対象外のため取得しない） */
const SKIP_AVIATION_WEATHER_IDS = new Set(['RJFA', 'RJFZ']);

export const fetchAirportWeather = (
  feature: GeoJSON.Feature,
  map: L.Map,
  weatherCache: WeatherCache,
  setWeatherCache: React.Dispatch<React.SetStateAction<WeatherCache>>,
  fetchWeatherData: (lat: number, lon: number) => Promise<FilteredWeatherData | null>,
  CACHE_DURATION: number
) => {
  if (!feature.properties || !feature.geometry) return;

  const ap = feature.properties as AirportProps;
  const airportId = ap.id;
  const icao =
    airportId && typeof airportId === 'string' && airportId.trim().length >= 3
      ? airportId.trim()
      : '';
  const notamHtml = icao ? swimNotamButtonSection(icao) : '';
  const geometry = feature.geometry as GeoJSON.Point;
  const [longitude, latitude] = geometry.coordinates;

  const loadingPopupContent = `
    <div class="airport-popup airport-weather-popup">
      <div class="airport-popup-header">${ap.id || '不明'}</div>
      <div class="p-2">
        <h3 class="text-base font-bold mb-2">${ap.name1 || '空港'}</h3>
        <p class="text-sm">気象情報を読み込み中...</p>
        <div class="flex justify-center my-2">
          <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-green-500"></div>
        </div>
      </div>
      ${notamHtml}
    </div>
  `;

  const loadingPopup = createPopup([latitude, longitude])
    .setContent(loadingPopupContent)
    .openOn(map);
  if (icao) bindPlanningSwimNotamButton(map, loadingPopup, icao, 'location');

  const cachedEntry = weatherCache[airportId];
  const now = Date.now();
  if (cachedEntry && now - cachedEntry.timestamp < CACHE_DURATION) {
    if (cachedEntry.data && typeof cachedEntry.data === 'object' && 'current' in cachedEntry.data) {
      const airportInfoHtml = simplifiedAirportInfoContent(ap);
      const html = createWeatherPopupContent(
        ap as Record<string, unknown>,
        cachedEntry.data as FilteredWeatherData,
        airportInfoHtml,
        cachedEntry.aviationWeather || null
      );
      loadingPopup.setContent(html);
      loadingPopup.update();
      if (icao) bindPlanningSwimNotamButton(map, loadingPopup, icao, 'location');
      return;
    }
  }

  // 既存の気象データを取得
  const weatherDataPromise = fetchWeatherData(latitude, longitude);

  // ICAOコードがRJで始まる日本の空港の場合、METAR/TAFも取得（ローカル訓練レイヤーは除外）
  let aviationWeatherPromise: Promise<AviationWeatherData | null> = Promise.resolve(null);
  if (
    icao.startsWith('RJ') &&
    !SKIP_AVIATION_WEATHER_IDS.has(icao.toUpperCase())
  ) {
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
              ${ap.id || '不明'}（${(ap.name1 as string | undefined)?.split('(')[0].trim() || '空港'}）
            </div>
            <div class="p-3">
              <div>
                <p class="text-sm text-red-500 mb-3">気象情報の取得に失敗しました</p>
                <h4 class="text-base font-bold mb-2 text-green-800 border-b border-green-200 pb-1">空港情報</h4>
                <div class="ml-2">${simplifiedAirportInfoContent(ap)}</div>
              </div>
            </div>
            ${notamHtml}
          </div>`;
        loadingPopup.setContent(errorPopupContent);
        loadingPopup.update();
        if (icao) bindPlanningSwimNotamButton(map, loadingPopup, icao, 'location');
        return;
      }

      const airportInfoHtml = simplifiedAirportInfoContent(ap);
      const html = createWeatherPopupContent(
        ap as Record<string, unknown>,
        weatherData,
        airportInfoHtml,
        aviationWeather
      );
      loadingPopup.setContent(html);
      loadingPopup.update();
      if (icao) bindPlanningSwimNotamButton(map, loadingPopup, icao, 'location');

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
            ${ap.id || '不明'}（${(ap.name1 as string | undefined)?.split('(')[0].trim() || '空港'}）
          </div>
          <div class="p-3">
            <div>
              <p class="text-sm text-red-500 mb-3">気象情報の取得に失敗しました</p>
              <h4 class="text-base font-bold mb-2 text-green-800 border-b border-green-200 pb-1">空港情報</h4>
              <div class="ml-2">${simplifiedAirportInfoContent(ap)}</div>
            </div>
          </div>
          ${notamHtml}
        </div>`;
      loadingPopup.setContent(errorPopupContent);
      loadingPopup.update();
      if (icao) bindPlanningSwimNotamButton(map, loadingPopup, icao, 'location');
    });
};


