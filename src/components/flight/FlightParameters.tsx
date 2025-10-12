import { format, toZonedTime } from 'date-fns-tz';
import { BarChart, ChevronDown, ChevronUp, Clock, Gauge, Thermometer } from 'lucide-react';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { CACHE_DURATION, useWeatherCache } from '../../contexts/WeatherCacheContext';
import { fetchWeatherData, FilteredWeatherData } from '../../services/weather';
import { FlightPlan } from '../../types/index';
import {
  ALTITUDE_INCREMENT,
  calculateAirspeeds,
  calculateCASIncrementForMach,
  parseTimeString,
  SPEED_INCREMENT
} from '../../utils';

interface FlightParametersProps {
  flightPlan: FlightPlan;
  setFlightPlan: React.Dispatch<React.SetStateAction<FlightPlan>>;
}

/**
 * Flight Parameters コンポーネント
 * 速度、高度の入力とTAS、Machの表示を行う
 * 高精度計算モデルのみを使用
 */
const FlightParameters: React.FC<FlightParametersProps> = ({
  flightPlan,
  setFlightPlan,
}) => {
  const { weatherCache, setWeatherCache } = useWeatherCache(); // Contextから取得
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { effectiveTheme } = useTheme();

  const handleSpeedChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const newSpeed = parseInt(event.target.value, 10);
    setFlightPlan((prev: FlightPlan) => ({ ...prev, speed: newSpeed }));
  }, [setFlightPlan]);

  const handleAltitudeChange = useCallback((newAltitude: number) => {
    setFlightPlan((prev: FlightPlan) => ({ ...prev, altitude: newAltitude }));
  }, [setFlightPlan]);

  const handleDepartureTimeChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const jstTime = event.target.value;
    setFlightPlan((prev: FlightPlan) => ({ ...prev, departureTime: jstTime }));
  }, [setFlightPlan]);

  const handleGroundTempChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const newTemp = parseInt(event.target.value, 10);
    setFlightPlan((prev: FlightPlan) => ({ ...prev, groundTempC: newTemp }));
  }, [setFlightPlan]);

  const handleGroundElevationChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const newElevation = parseInt(event.target.value, 10);
    setFlightPlan((prev: FlightPlan) => ({ ...prev, groundElevationFt: newElevation }));
  }, [setFlightPlan]);

  const handleSpeedIncrement = useCallback(() => {
    setFlightPlan((prev: FlightPlan) => ({ ...prev, speed: prev.speed + SPEED_INCREMENT }));
  }, [setFlightPlan]);

  const handleSpeedDecrement = useCallback(() => {
    setFlightPlan((prev: FlightPlan) => ({ ...prev, speed: Math.max(0, prev.speed - SPEED_INCREMENT) }));
  }, [setFlightPlan]);

  const handleAltitudeIncrement = useCallback(() => {
    setFlightPlan((prev: FlightPlan) => ({ ...prev, altitude: prev.altitude + ALTITUDE_INCREMENT }));
  }, [setFlightPlan]);

  const handleAltitudeDecrement = useCallback(() => {
    setFlightPlan((prev: FlightPlan) => ({ ...prev, altitude: Math.max(0, prev.altitude - ALTITUDE_INCREMENT) }));
  }, [setFlightPlan]);

  // MACHの変更ハンドラ (0.01単位で調整)
  const handleMachIncrement = useCallback(() => {
    const increment = calculateCASIncrementForMach(
      flightPlan.speed,
      flightPlan.altitude,
      flightPlan.groundTempC,
      flightPlan.groundElevationFt
    ) * 10; // 0.001 -> 0.01へ変更のため10倍
    setFlightPlan((prev: FlightPlan) => ({ ...prev, speed: Math.round(prev.speed + increment) }));
  }, [flightPlan, setFlightPlan]);

  const handleMachDecrement = useCallback(() => {
    const increment = calculateCASIncrementForMach(
      flightPlan.speed,
      flightPlan.altitude,
      flightPlan.groundTempC,
      flightPlan.groundElevationFt
    ) * 10; // 0.001 -> 0.01へ変更のため10倍
    setFlightPlan((prev: FlightPlan) => ({ ...prev, speed: Math.max(0, Math.round(prev.speed - increment)) }));
  }, [flightPlan, setFlightPlan]);

  // 出発空港が選択されたら、その標高と地上気温を自動設定する
  useEffect(() => {
    if (flightPlan.departure) {
      // Airport型のpropertiesから標高データを取得
      const elevation = flightPlan.departure.properties?.["Elev(ft)"];

      if (elevation !== undefined) {
        setFlightPlan((prev: FlightPlan) => ({
          ...prev,
          groundElevationFt: Number(elevation)
        }));
      }

      // 地上気温の設定(キャッシュ確認と利用)
      if (flightPlan.departure.latitude && flightPlan.departure.longitude) {
        const airportId = flightPlan.departure.value; // 空港ID
        const cachedEntry = weatherCache[airportId];
        const now = Date.now();

        // キャッシュが存在し、かつ有効期限内の場合、キャッシュを使用
        if (cachedEntry && (now - cachedEntry.timestamp < CACHE_DURATION)) {
          const cachedTemp = cachedEntry.data.current?.temp_c;
          if (cachedTemp !== undefined) {
            setFlightPlan((prev: FlightPlan) => ({
              ...prev,
              groundTempC: Math.round(cachedTemp)
            }));
            return; // API呼び出しをスキップ
          }
        }

        // キャッシュがないか期限切れの場合、APIから取得
        setIsLoading(true);
        fetchWeatherData(flightPlan.departure.latitude, flightPlan.departure.longitude)
          .then((weatherData: FilteredWeatherData | null) => {
            if (!weatherData) return;
            if (weatherData.current?.temp_c !== undefined) {
              const temp_c = weatherData.current.temp_c;
              setFlightPlan((prev: FlightPlan) => ({
                ...prev,
                groundTempC: Math.round(temp_c)
              }));

              // 取得したデータをキャッシュに保存
              setWeatherCache((prevCache) => ({
                ...prevCache,
                [airportId]: { data: weatherData, timestamp: Date.now() }
              }));
            }
          })
          .catch(error => {
            console.error('地上気温の取得に失敗しました:', error);
          })
          .finally(() => {
            setIsLoading(false);
          });
      }
    }
  }, [flightPlan.departure, setFlightPlan, weatherCache, setWeatherCache]);

  // 高精度計算モデルによる速度計算結果
  const airspeedResults = useMemo(() =>
    calculateAirspeeds(
      flightPlan.speed,
      flightPlan.altitude,
      flightPlan.groundTempC,
      flightPlan.groundElevationFt
    ),
    [flightPlan.speed, flightPlan.altitude, flightPlan.groundTempC, flightPlan.groundElevationFt]
  );

  // 表示用の値を取得（高精度モデルの結果のみを使用）
  const displayTAS = useMemo(() =>
    airspeedResults ? airspeedResults.tasKt.toFixed(0) : "-",
    [airspeedResults]
  );

  const displayMach = useMemo(() =>
    airspeedResults ? airspeedResults.mach.toFixed(2) : "-", // 小数点第2位まで表示に変更
    [airspeedResults]
  );

  const displayEAS = useMemo(() =>
    airspeedResults ? airspeedResults.easKt.toFixed(0) : "-",
    [airspeedResults]
  );

  // 高度での気温計算（ケルビンから摂氏に変換）
  const displayAltitudeTemp = useMemo(() =>
    airspeedResults ? (airspeedResults.satK - 273.15).toFixed(1) : "-",
    [airspeedResults]
  );

  const utcTime = useMemo(() => {
    return format(
      toZonedTime(parseTimeString(flightPlan.departureTime), 'UTC'),
      'HH:mm',
      { timeZone: 'UTC' }
    );
  }, [flightPlan.departureTime]);

  // 飛行場名の表示用
  const airportName = useMemo(() => {
    if (!flightPlan.departure) return "未選択";

    return flightPlan.departure.name ||
      flightPlan.departure.label ||
      String(flightPlan.departure.properties?.name1 || '') ||
      String(flightPlan.departure.properties?.id || '') ||
      "未選択";
  }, [flightPlan.departure]);

  return (
    <div className="hud-surface hud-border rounded-lg p-3 sm:p-4 md:p-6">
      <h2 className="text-base sm:text-lg md:text-xl font-semibold mb-2 sm:mb-3 md:mb-4 hud-text">フライトパラメータ</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3 md:gap-4">
        {/* 左側: 速度計関連のパラメータ */}
        <div className="space-y-2 sm:space-y-3">
          <div className="mb-1">
            <label htmlFor="speed" className="block text-xs sm:text-sm font-medium hud-text mb-1">
              <Gauge size={14} className="inline-block mr-1" /> 速度 (CAS/kt)
            </label>
            <div className="flex">
              <input
                type="number"
                id="speed"
                name="speed"
                className="px-2 py-1 w-full border hud-border rounded-l-md text-xs sm:text-sm bg-[color:var(--panel)] text-[color:var(--text-primary)] focus:outline-none focus-hud"
                value={flightPlan.speed}
                onChange={handleSpeedChange}
              />
              <div className="flex flex-col">
                <button
                  className="px-2 text-[color:var(--hud-primary)] border-t border-r hud-border rounded-tr-md hover:bg-white/5"
                  onClick={handleSpeedIncrement}
                  aria-label="Increase speed"
                >
                  <ChevronUp size={12} />
                </button>
                <button
                  className="px-2 text-[color:var(--hud-primary)] border-b border-r hud-border rounded-br-md hover:bg-white/5"
                  onClick={handleSpeedDecrement}
                  aria-label="Decrease speed"
                >
                  <ChevronDown size={12} />
                </button>
              </div>
            </div>
            <div className="mt-1 text-2xs sm:text-xs text-[color:var(--text-primary)]">
              TAS: {displayTAS} kt | EAS: {displayEAS} kt
            </div>
          </div>

          <div className="mb-1">
            <label className="block text-xs sm:text-sm font-medium hud-text mb-1">
              <Gauge size={14} className="inline-block mr-1" /> MACH
            </label>
            <div className="flex justify-between items-center bg-[color:var(--panel)] rounded-md px-2 py-1 border hud-border">
              <span className="text-xs sm:text-sm hud-text">{displayMach}</span>
              <div className="flex space-x-1">
                <button
                  className="px-1 text-[color:var(--hud-primary)] rounded hover:bg-white/5 focus-visible:focus-hud"
                  onClick={handleMachIncrement}
                  aria-label="Increase MACH"
                >
                  <ChevronUp size={12} />
                </button>
                <button
                  className="px-1 text-[color:var(--hud-primary)] rounded hover:bg-white/5 focus-visible:focus-hud"
                  onClick={handleMachDecrement}
                  aria-label="Decrease MACH"
                >
                  <ChevronDown size={12} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 中央: 高度と時間パラメータ */}
        <div className="space-y-2 sm:space-y-3">
          <div className="mb-1">
            <label htmlFor="altitude" className="block text-xs sm:text-sm font-medium hud-text mb-1">
              <BarChart size={14} className="inline-block mr-1" /> 高度 (ft)
            </label>
            <div className="flex">
              <input
                type="number"
                id="altitude"
                name="altitude"
                className="px-2 py-1 w-full border hud-border rounded-l-md text-xs sm:text-sm bg-[color:var(--panel)] text-[color:var(--text-primary)] focus:outline-none focus-hud"
                value={flightPlan.altitude}
                onChange={(e) => handleAltitudeChange(parseInt(e.target.value, 10) || 0)}
              />
              <div className="flex flex-col">
                <button
                  className="px-2 text-[color:var(--hud-primary)] border-t border-r hud-border rounded-tr-md hover:bg-white/5"
                  onClick={handleAltitudeIncrement}
                  aria-label="Increase altitude"
                >
                  <ChevronUp size={12} />
                </button>
                <button
                  className="px-2 text-[color:var(--hud-primary)] border-b border-r hud-border rounded-br-md hover:bg-white/5"
                  onClick={handleAltitudeDecrement}
                  aria-label="Decrease altitude"
                >
                  <ChevronDown size={12} />
                </button>
              </div>
            </div>
            <div className="mt-1 text-2xs sm:text-xs text-[color:var(--text-primary)]">
              気温(高度): {displayAltitudeTemp}℃
            </div>
          </div>

          <div className="mb-1">
            <label htmlFor="departureTime" className="block text-xs sm:text-sm font-medium hud-text mb-1">
              <Clock size={14} className="inline-block mr-1" /> 出発時刻（JST/UTC）
            </label>
            <div className="flex items-center space-x-2">
              <input
                type="time"
                id="departureTime"
                name="departureTime"
                className="px-2 py-1 w-3/5 border hud-border rounded-md text-xs sm:text-sm bg-[color:var(--panel)] text-[color:var(--text-primary)] focus:outline-none focus-hud"
                value={flightPlan.departureTime}
                onChange={handleDepartureTimeChange}
              />
              <span className="text-xs sm:text-sm hud-text hud-readout">{utcTime}Z</span>
            </div>
          </div>
        </div>

        {/* 右側: 地上気象パラメータ */}
        <div className="space-y-2 sm:space-y-3">
          <div className="mb-1">
            <div className="flex items-center justify-between mb-1">
              <label htmlFor="groundTemp" className="block text-xs sm:text-sm font-medium hud-text">
                <Thermometer size={14} className="inline-block mr-1" /> 地上気温 (℃)
              </label>
              {isLoading && (
                <div className="animate-spin h-3 w-3 border border-t-2 border-gray-300 rounded-full"></div>
              )}
            </div>
            <div className="flex">
              <input
                type="number"
                id="groundTemp"
                name="groundTemp"
                className="px-2 py-1 w-full border hud-border rounded-md text-xs sm:text-sm bg-[color:var(--panel)] text-[color:var(--text-primary)] focus:outline-none focus-hud"
                value={flightPlan.groundTempC}
                onChange={handleGroundTempChange}
              />
            </div>
          </div>

          <div className="mb-1">
            <label htmlFor="groundElevation" className="block text-xs sm:text-sm font-medium hud-text mb-1">
              <BarChart size={14} className="inline-block mr-1" /> 地上標高 (ft)
            </label>
            <div className="flex">
              <input
                type="number"
                id="groundElevation"
                name="groundElevation"
                className="px-2 py-1 w-full border hud-border rounded-md text-xs sm:text-sm bg-[color:var(--panel)] text-[color:var(--text-primary)] focus:outline-none focus-hud"
                value={flightPlan.groundElevationFt}
                onChange={handleGroundElevationChange}
              />
            </div>
            <div className="mt-1 text-2xs sm:text-xs text-[color:var(--text-primary)]">
              空港: {airportName}
            </div>
          </div>
        </div>
      </div>
      {/* 使用されていない effectiveTheme を参照して警告を回避 */}
      {effectiveTheme && null}
    </div>
  );
};

export default FlightParameters;
