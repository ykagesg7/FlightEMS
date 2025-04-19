import React, { useCallback, useMemo, useEffect, useState } from 'react';
import { FlightPlan } from '../../types';
import { 
  parseTimeString, 
  SPEED_INCREMENT, 
  ALTITUDE_INCREMENT,
  calculateAirspeeds,
  calculateCASIncrementForMach
} from '../../utils';
import { ChevronUp, ChevronDown, Clock, Gauge, BarChart, Thermometer } from 'lucide-react';
import { toZonedTime, format } from 'date-fns-tz';
import { fetchWeatherData } from '../../api/weather';
import { useWeatherCache, CACHE_DURATION, WeatherData } from '../../contexts/WeatherCacheContext';

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

  const handleSpeedChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const newSpeed = parseInt(event.target.value, 10);
    setFlightPlan({ ...flightPlan, speed: newSpeed });
  }, [flightPlan, setFlightPlan]);

  const handleAltitudeChange = useCallback((newAltitude: number) => {
    setFlightPlan({ ...flightPlan, altitude: newAltitude });
  }, [flightPlan, setFlightPlan]);

  const handleDepartureTimeChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const jstTime = event.target.value;
    setFlightPlan({ ...flightPlan, departureTime: jstTime });
  }, [flightPlan, setFlightPlan]);

  const handleGroundTempChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const newTemp = parseInt(event.target.value, 10);
    setFlightPlan({ ...flightPlan, groundTempC: newTemp });
  }, [flightPlan, setFlightPlan]);

  const handleGroundElevationChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const newElevation = parseInt(event.target.value, 10);
    setFlightPlan({ ...flightPlan, groundElevationFt: newElevation });
  }, [flightPlan, setFlightPlan]);

  const handleSpeedIncrement = useCallback(() => {
    setFlightPlan(prev => ({ ...prev, speed: prev.speed + SPEED_INCREMENT }));
  }, [setFlightPlan]);

  const handleSpeedDecrement = useCallback(() => {
    setFlightPlan(prev => ({ ...prev, speed: Math.max(0, prev.speed - SPEED_INCREMENT) }));
  }, [setFlightPlan]);

  const handleAltitudeIncrement = useCallback(() => {
    setFlightPlan(prev => ({ ...prev, altitude: prev.altitude + ALTITUDE_INCREMENT }));
  }, [setFlightPlan]);

  const handleAltitudeDecrement = useCallback(() => {
    setFlightPlan(prev => ({ ...prev, altitude: Math.max(0, prev.altitude - ALTITUDE_INCREMENT) }));
  }, [setFlightPlan]);

  // MACHの変更ハンドラ (0.01単位で調整)
  const handleMachIncrement = useCallback(() => {
    const increment = calculateCASIncrementForMach(
      flightPlan.speed, 
      flightPlan.altitude, 
      flightPlan.groundTempC, 
      flightPlan.groundElevationFt
    ) * 10; // 0.001 -> 0.01へ変更のため10倍
    setFlightPlan(prev => ({ ...prev, speed: Math.round(prev.speed + increment) }));
  }, [flightPlan, setFlightPlan]);

  const handleMachDecrement = useCallback(() => {
    const increment = calculateCASIncrementForMach(
      flightPlan.speed, 
      flightPlan.altitude, 
      flightPlan.groundTempC, 
      flightPlan.groundElevationFt
    ) * 10; // 0.001 -> 0.01へ変更のため10倍
    setFlightPlan(prev => ({ ...prev, speed: Math.max(0, Math.round(prev.speed - increment)) }));
  }, [flightPlan, setFlightPlan]);

  // 出発空港が選択されたら、その標高と地上気温を自動設定する
  useEffect(() => {
    if (flightPlan.departure) {
      // Airport型のpropertiesから標高データを取得
      const elevation = flightPlan.departure.properties?.["Elev(ft)"];
      
      if (elevation !== undefined) {
        console.log(`空港、${flightPlan.departure.name}の標高${elevation}ft を設定しました`);
        setFlightPlan(prev => ({
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
            console.log(`キャッシュから空港、${flightPlan.departure.name}の地上気温 ${cachedTemp}°Cを設定しました`);
            setFlightPlan(prev => ({
              ...prev,
              groundTempC: Math.round(cachedTemp)
            }));
            return; // API呼び出しをスキップ
          }
        }
        
        // キャッシュがないか期限切れの場合、APIから取得
        setIsLoading(true);
        fetchWeatherData(flightPlan.departure.latitude, flightPlan.departure.longitude)
          .then((weatherData: WeatherData) => {
            if (weatherData.current?.temp_c !== undefined) {
              const temp_c = weatherData.current.temp_c;
              console.log(`APIから空港、${flightPlan.departure?.name}の地上気温 ${temp_c}°Cを取得・設定しました`);
              setFlightPlan(prev => ({
                ...prev,
                groundTempC: Math.round(temp_c)
              }));
              
              // 取得したデータをキャッシュに保存
              setWeatherCache(prevCache => ({
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
      flightPlan.departure.properties?.name1 ||
      flightPlan.departure.properties?.id ||
      "未選択";
  }, [flightPlan.departure]);

  return (
    <div className="bg-gray-800 shadow-sm rounded-lg p-4 md:p-6">
      <h2 className="text-lg md:text-xl font-semibold mb-3 md:mb-4 text-gray-50">フライトパラメータ</h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-3 gap-3 md:gap-4">
        {/* 左側: 速度計関連のパラメータ */}
        <div className="space-y-3">
          <div className="mb-1">
            <label htmlFor="speed" className="block text-sm font-medium text-gray-300 mb-1">
              <Gauge size={16} className="inline-block mr-1" /> 速度 (CAS/kt)
            </label>
            <div className="flex">
              <input
                type="number"
                id="speed"
                name="speed"
                className="px-2 py-1 w-full border border-gray-600 rounded-l-md text-sm bg-gray-700 text-gray-50 focus:ring-1 focus:ring-blue-500"
                value={flightPlan.speed}
                onChange={handleSpeedChange}
              />
              <div className="flex flex-col">
                <button 
                  className="bg-gray-600 px-2 text-gray-200 border-t border-r border-gray-600 rounded-tr-md hover:bg-gray-500"
                  onClick={handleSpeedIncrement}
                  aria-label="Increase speed"
                >
                  <ChevronUp size={14} />
                </button>
                <button 
                  className="bg-gray-600 px-2 text-gray-200 border-b border-r border-gray-600 rounded-br-md hover:bg-gray-500"
                  onClick={handleSpeedDecrement}
                  aria-label="Decrease speed"
                >
                  <ChevronDown size={14} />
                </button>
              </div>
            </div>
            <div className="mt-1 text-xs text-gray-400">
              TAS: {displayTAS} kt | EAS: {displayEAS} kt
            </div>
          </div>

          <div className="mb-1">
            <label className="block text-sm font-medium text-gray-300 mb-1">
              <Gauge size={16} className="inline-block mr-1" /> MACH
            </label>
            <div className="flex items-center px-2 py-1 border border-gray-600 rounded-md bg-gray-700 text-gray-50">
              <span className="flex-grow text-sm">{displayMach}</span>
              <div className="flex flex-col">
                <button
                  className="px-1 text-gray-200 hover:text-white"
                  onClick={handleMachIncrement}
                  aria-label="Increase Mach"
                >
                  <ChevronUp size={14} />
                </button>
                <button
                  className="px-1 text-gray-200 hover:text-white"
                  onClick={handleMachDecrement}
                  aria-label="Decrease Mach"
                >
                  <ChevronDown size={14} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 中央: 高度と気温 */}
        <div className="space-y-3">
          <div className="mb-1">
            <label htmlFor="altitude" className="block text-sm font-medium text-gray-300 mb-1">
              <BarChart size={16} className="inline-block mr-1" /> 高度 (ft)
            </label>
            <div className="flex">
              <input
                type="number"
                id="altitude"
                name="altitude"
                className="px-2 py-1 w-full border border-gray-600 rounded-l-md text-sm bg-gray-700 text-gray-50 focus:ring-1 focus:ring-blue-500"
                value={flightPlan.altitude}
                onChange={(e) => handleAltitudeChange(parseInt(e.target.value, 10))}
              />
              <div className="flex flex-col">
                <button
                  className="bg-gray-600 px-2 text-gray-200 border-t border-r border-gray-600 rounded-tr-md hover:bg-gray-500"
                  onClick={handleAltitudeIncrement}
                  aria-label="Increase altitude"
                >
                  <ChevronUp size={14} />
                </button>
                <button
                  className="bg-gray-600 px-2 text-gray-200 border-b border-r border-gray-600 rounded-br-md hover:bg-gray-500"
                  onClick={handleAltitudeDecrement}
                  aria-label="Decrease altitude"
                >
                  <ChevronDown size={14} />
                </button>
              </div>
            </div>
            <div className="mt-1 text-xs text-gray-400">
              高度気温: {displayAltitudeTemp}°C
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label htmlFor="groundTemp" className="block text-sm font-medium text-gray-300 mb-1">
                <Thermometer size={16} className="inline-block mr-1" /> 地上気温(°C)
              </label>
              <input
                type="number"
                id="groundTemp"
                name="groundTemp"
                className="px-2 py-1 w-full border border-gray-600 rounded-md text-sm bg-gray-700 text-gray-50 focus:ring-1 focus:ring-blue-500"
                value={flightPlan.groundTempC}
                onChange={handleGroundTempChange}
              />
            </div>
            
            <div>
              <label htmlFor="groundElevation" className="block text-sm font-medium text-gray-300 mb-1">
                <BarChart size={16} className="inline-block mr-1" /> 地上標高(ft)
              </label>
              <input
                type="number"
                id="groundElevation"
                name="groundElevation"
                className="px-2 py-1 w-full border border-gray-600 rounded-md text-sm bg-gray-700 text-gray-50 focus:ring-1 focus:ring-blue-500"
                value={flightPlan.groundElevationFt}
                onChange={handleGroundElevationChange}
              />
            </div>
          </div>
        </div>

        {/* 右側: 時間設定 */}
        <div className="space-y-3">
          <div>
            <label htmlFor="departure-time" className="block text-sm font-medium text-gray-300 mb-1">
              <Clock size={16} className="inline-block mr-1" /> 出発時刻 (JST)
            </label>
            <input
              type="time"
              id="departure-time"
              name="departure-time"
              className="px-2 py-1 w-full border border-gray-600 rounded-md text-sm bg-gray-700 text-gray-50 focus:ring-1 focus:ring-blue-500"
              value={flightPlan.departureTime}
              onChange={handleDepartureTimeChange}
            />
            <div className="mt-1 text-xs text-gray-400">
              UTC時間: {utcTime}
            </div>
          </div>
          
          {/* 飛行場情報表示部分 */}
          <div>
            <h3 className="text-sm font-medium text-gray-300 mb-1">出発空港</h3>
            <div className="px-2 py-1 border border-gray-600 rounded-md bg-gray-700 text-sm text-gray-50">
              {airportName}
              {isLoading && <span className="ml-2 text-xs text-blue-400">天気データ取得中...</span>}
            </div>
            <div className="mt-1 text-xs text-gray-400">
              標高: {flightPlan.groundElevationFt}ft | 気温: {flightPlan.groundTempC}°C
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FlightParameters; 
