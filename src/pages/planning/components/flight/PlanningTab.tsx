import React from 'react';
import { aircraftPresets, getAircraftPreset } from '../../../../data/aircraftPresets';
import { AircraftPreset, Airport, AirportGroupOption, AirportOption, FlightPlan, NavaidOption, RouteSegment, Waypoint, WaypointOption } from '../../../../types/index';
import { calculateAirspeeds, calculateDistance, calculateETA, calculateETE, calculateMach, calculateTAS, formatTime, groupBy } from '../../../../utils';
import { AirspaceDataset, findAirspaceFrequency } from '../../../../utils/airspace';
import { calculateMagneticBearing } from '../../../../utils/bearing';
import { downloadPlanDocument, fromPlanDocument, toPlanDocument } from '../../../../utils/planDocument';
import FlightParameters from './FlightParameters';
import { FlightSummary } from './FlightSummary';
import PlanPrintView from './PlanPrintView';
import RoutePlanning from './RoutePlanning';

interface PlanningTabProps {
  flightPlan: FlightPlan;
  setFlightPlan: React.Dispatch<React.SetStateAction<FlightPlan>>;
}

/**
 * Planning Tab コンポーネント
 * フライトプランの入力と計算結果の表示を行うメインコンポーネント
 */
const PlanningTab: React.FC<PlanningTabProps> = ({ flightPlan, setFlightPlan }) => {
  const [airportOptions, setAirportOptions] = React.useState<AirportGroupOption[]>([]);
  const [navaidOptions, setNavaidOptions] = React.useState<NavaidOption[]>([]);
  const [selectedNavaid, setSelectedNavaid] = React.useState<NavaidOption | null>(null);
  const [waypointOptions, setWaypointOptions] = React.useState<WaypointOption[]>([]);
  const [selectedWaypoint, setSelectedWaypoint] = React.useState<WaypointOption | null>(null);
  const [airspaceDatasets, setAirspaceDatasets] = React.useState<Array<{ id: string; data: AirspaceDataset | null }>>([
    { id: 'ACC_Sector_High', data: null },
    { id: 'ACC_Sector_Low', data: null },
    { id: 'RAPCON', data: null },
  ]);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [printRequested, setPrintRequested] = React.useState(false);

  const selectedPreset = getAircraftPreset(flightPlan.aircraftId) || aircraftPresets[0];

  const handleAircraftChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const nextId = event.target.value || undefined;
    const preset = getAircraftPreset(nextId);
    if (preset) {
      setFlightPlan((prev: FlightPlan) => ({
        ...prev,
        aircraftId: preset.id,
        cruiseFuelFlowLbPerHr: preset.cruiseFuelFlowLbPerHr,
        taxiFuelLb: preset.taxiFuelLb,
        reserveFuelLb: preset.reserveFuelLb,
        initialFuelLb: prev.initialFuelLb ?? preset.defaultInitialFuelLb,
      }));
    } else {
      setFlightPlan((prev: FlightPlan) => ({ ...prev, aircraftId: undefined }));
    }
  };

  const handleInitialFuelChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(event.target.value);
    setFlightPlan((prev: FlightPlan) => ({
      ...prev,
      initialFuelLb: Number.isFinite(value) ? value : prev.initialFuelLb,
    }));
  };

  const handleExport = () => {
    downloadPlanDocument(toPlanDocument(flightPlan));
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleImportFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const json = JSON.parse(text);
      const imported = fromPlanDocument(json);
      if (imported) {
        setFlightPlan((prev: FlightPlan) => ({
          ...prev,
          ...imported,
        }));
      } else {
        console.error('インポート失敗: スキーマ不一致または内容が無効です');
      }
    } catch (error) {
      console.error('インポート処理に失敗しました', error);
    } finally {
      event.target.value = '';
    }
  };

  const handlePrint = () => {
    // 先に再計算を促し、描画反映後に印刷を開く（NavLog空対策）
    setPrintRequested(true);
    updateFlightSummary();
  };

  // 空港データを取得するuseEffect
  React.useEffect(() => {
    const fetchAirports = async () => {
      try {
        const response = await fetch('/geojson/Airports.geojson');
        const geojsonData = await response.json();
        const airportList = geojsonData.features.map((feature: { properties: { id: string; name1: string; type: string }; geometry: { coordinates: [number, number] } }) => ({
          value: feature.properties.id,
          label: `${feature.properties.name1} (${feature.properties.id})`,
          name: feature.properties.name1,
          type: feature.properties.type as 'civilian' | 'military' | 'joint',
          latitude: feature.geometry.coordinates[1],
          longitude: feature.geometry.coordinates[0],
          // GeoJSONのpropertiesを含める
          properties: { ...feature.properties },
        }));

        // 空港タイプでグループ化
        const groupedAirports = Object.entries(groupBy(airportList, 'type')).map(([type, options]) => ({
          label: type,
          options: options as AirportOption[],
        }));
        setAirportOptions(groupedAirports);
      } catch (error) {
        console.error("空港データの読み込みに失敗しました", error);
      }
    };

    // NAVAIDデータを取得するuseEffect
    const fetchNavaids = async () => {
      try {
        const response = await fetch('/geojson/Navaids.geojson');
        const geojsonData = await response.json();
        const navaidList = geojsonData.features.map((feature: { properties: { id: string; name1: string; name2: string; type: string; ch?: string }; geometry: { coordinates: [number, number] } }) => ({
          value: feature.properties.id,
          label: `${feature.properties.name1}(${feature.properties.name2})(${feature.properties.id})`,
          type: feature.properties.type as 'VOR' | 'TACAN' | 'VORTAC',
          latitude: feature.geometry.coordinates[1],
          longitude: feature.geometry.coordinates[0],
          ch: feature.properties.ch,
          frequency: feature.properties.ch,
        }));
        setNavaidOptions(navaidList);
      } catch (error) {
        console.error("Navaidsデータの読み込みに失敗しました", error);
      }
    };

    // Waypointsデータを取得するuseEffect
    const fetchWaypoints = async () => {
      try {
        const response = await fetch('/geojson/Waypoints.json');
        const geojsonData = await response.json();
        const waypointList = geojsonData.features.map((feature: { properties: { id: string; name1: string; type: string }; geometry: { coordinates: [number, number] } }) => ({
          value: feature.properties.id,
          label: `${feature.properties.id} - ${feature.properties.name1}`,
          name: feature.properties.name1,
          type: feature.properties.type,
          latitude: feature.geometry.coordinates[1],
          longitude: feature.geometry.coordinates[0],
        }));
        setWaypointOptions(waypointList);
      } catch (error) {
        console.error("Waypointsデータの読み込みに失敗しました", error);
      }
    };

    fetchAirports();
    fetchNavaids();
    fetchWaypoints();
  }, []);

  // 空域GeoJSONをロード
  React.useEffect(() => {
    const targets: Array<{ id: string; path: string }> = [
      { id: 'ACC_Sector_High', path: '/geojson/ACC_Sector_High.geojson' },
      { id: 'ACC_Sector_Low', path: '/geojson/ACC_Sector_Low.geojson' },
      { id: 'RAPCON', path: '/geojson/RAPCON.geojson' },
    ];

    targets.forEach(async (target) => {
      try {
        const res = await fetch(target.path);
        const data = await res.json();
        setAirspaceDatasets((prev) =>
          prev.map((p) => (p.id === target.id ? { ...p, data } : p))
        );
      } catch (error) {
        console.error(`${target.id} の読み込みに失敗しました`, error);
      }
    });
  }, []);

  // ポイントのIDを取得するヘルパー関数
  const getPointId = (point: Airport | Waypoint): string => {
    if ('id' in point) {
      // Waypointの場合
      return (point as Waypoint).id;
    } else {
      // Airportの場合
      const airport = point as Airport;
      const propertiesId = airport.properties?.id;
      return (typeof propertiesId === 'string' ? propertiesId : '') || airport.value || '';
    }
  };

  // Flight Summaryを更新する関数
  const updateFlightSummary = React.useCallback(() => {
    let totalDistance = 0;
    const routeSegments: RouteSegment[] = [];
    let cumulativeEte = 0;
    const segmentEteMinutesList: number[] = [];

    // 出発地、経由地点、到着地を含む配列を作成
    const allPoints = flightPlan.departure
      ? [flightPlan.departure, ...flightPlan.waypoints, flightPlan.arrival].filter(Boolean)
      : [];

    // 各セグメントごとに距離、方位、到着時刻を計算
    for (let i = 0; i < allPoints.length - 1; i++) {
      const currentPoint = allPoints[i];
      const nextPoint = allPoints[i + 1];
      if (!currentPoint || !nextPoint) continue;

      const distance = calculateDistance(
        currentPoint.latitude,
        currentPoint.longitude,
        nextPoint.latitude,
        nextPoint.longitude
      );
      const bearing = calculateMagneticBearing(
        currentPoint.latitude,
        currentPoint.longitude,
        nextPoint.latitude,
        nextPoint.longitude
      );
      const airspeedsResult = calculateAirspeeds(
        flightPlan.speed,
        flightPlan.altitude,
        flightPlan.groundTempC,
        flightPlan.groundElevationFt
      );
      const tas = airspeedsResult ? airspeedsResult.tasKt : calculateTAS(flightPlan.speed, flightPlan.altitude);
      const segmentEteMinutes = calculateETE(distance, tas);
      cumulativeEte += segmentEteMinutes;
      const segmentEta = calculateETA(flightPlan.departureTime, cumulativeEte);
      segmentEteMinutesList.push(segmentEteMinutes);

      // 型安全なID取得
      const fromId = getPointId(currentPoint);
      const toId = getPointId(nextPoint);

      routeSegments.push({
        from: fromId,
        to: toId,
        speed: flightPlan.speed,
        bearing,
        altitude: flightPlan.altitude,
        eta: segmentEta,
        distance,
        duration: formatTime(segmentEteMinutes),
      });
      totalDistance += distance;
    }

    // 全体TAS、Mach計算
    const airspeedsResult = calculateAirspeeds(
      flightPlan.speed,
      flightPlan.altitude,
      flightPlan.groundTempC,
      flightPlan.groundElevationFt
    );
    // 高精度計算が失敗した場合、従来の計算方法で代替
    const tas = airspeedsResult ? airspeedsResult.tasKt : calculateTAS(flightPlan.speed, flightPlan.altitude);
    const mach = airspeedsResult ? airspeedsResult.mach : calculateMach(tas, flightPlan.altitude);

    // 全体ETE、ETAを計算
    const eteMinutes = calculateETE(totalDistance, tas);
    const eteFormatted = formatTime(eteMinutes);
    const etaFormatted = calculateETA(flightPlan.departureTime, eteMinutes);

    // 周波数付与（中点 + 高度で判定）
    const enrichedSegments = routeSegments.map((segment, idx) => {
      const currentPoint = allPoints[idx];
      const nextPoint = allPoints[idx + 1];
      let frequency: string | undefined;
      let frequencySourceId: string | undefined;
      if (currentPoint && nextPoint) {
        const midLat = (currentPoint.latitude + nextPoint.latitude) / 2;
        const midLon = (currentPoint.longitude + nextPoint.longitude) / 2;
        const hit = findAirspaceFrequency([midLon, midLat], airspaceDatasets);
        frequency = hit?.frequency;
        frequencySourceId = hit?.sourceId;
      }
      return { ...segment, frequency, frequencySourceId };
    });

    // 燃料計算
    const preset = getAircraftPreset(flightPlan.aircraftId) || aircraftPresets[0];
    const cruiseFuelFlow = flightPlan.cruiseFuelFlowLbPerHr ?? preset?.cruiseFuelFlowLbPerHr ?? 0;
    const taxiFuel = flightPlan.taxiFuelLb ?? preset?.taxiFuelLb ?? 0;
    const reserveFuel = flightPlan.reserveFuelLb ?? preset?.reserveFuelLb ?? 0;
    let remainingFuel = (flightPlan.initialFuelLb ?? preset?.defaultInitialFuelLb ?? 0) - taxiFuel;
    let totalFuelUsed = taxiFuel;

    const fuelSegments = enrichedSegments.map((segment, idx) => {
      const minutes = segmentEteMinutesList[idx] ?? 0;
      const hours = minutes / 60;
      const fuelUsed = cruiseFuelFlow * hours;
      remainingFuel = Math.max(0, remainingFuel - fuelUsed);
      totalFuelUsed += fuelUsed;
      return {
        ...segment,
        fuelUsedLb: fuelUsed,
        fuelRemainingLb: remainingFuel,
      };
    });

    // FlightPlanステートを更新
    setFlightPlan((prevFlightPlan: FlightPlan) => ({
      ...prevFlightPlan,
      totalDistance: totalDistance,
      ete: eteFormatted,
      eta: etaFormatted,
      tas: tas,
      mach: mach,
      routeSegments: fuelSegments,
      totalFuelUsedLb: totalFuelUsed + reserveFuel,
      totalFuelRemainingLb: remainingFuel,
    }));
  }, [
    flightPlan.departure,
    flightPlan.arrival,
    flightPlan.waypoints,
    flightPlan.speed,
    flightPlan.altitude,
    flightPlan.departureTime,
    flightPlan.groundTempC,
    flightPlan.groundElevationFt,
    flightPlan.aircraftId,
    flightPlan.initialFuelLb,
    flightPlan.reserveFuelLb,
    flightPlan.taxiFuelLb,
    flightPlan.cruiseFuelFlowLbPerHr,
    setFlightPlan,
    airspaceDatasets
  ]);

  // Flight Summaryを更新するuseEffect
  React.useEffect(() => {
    updateFlightSummary();
  }, [
    updateFlightSummary,
    flightPlan.departure,
    flightPlan.arrival,
    flightPlan.waypoints,
    flightPlan.speed,
    flightPlan.altitude,
    flightPlan.departureTime,
    flightPlan.groundTempC,
    flightPlan.groundElevationFt
  ]);

  // 印刷要求があれば、ルートセグメントが揃った後に印刷を開始
  React.useEffect(() => {
    if (!printRequested) return;

    // ルートが未構成でも印刷は可能だが、最低1回描画が走ってから開く
    const ready = Array.isArray(flightPlan.routeSegments);
    if (!ready) return;

    const raf1 = requestAnimationFrame(() => {
      const raf2 = requestAnimationFrame(() => {
        window.print();
        setPrintRequested(false);
      });
      return () => cancelAnimationFrame(raf2);
    });
    return () => cancelAnimationFrame(raf1);
  }, [printRequested, flightPlan.routeSegments]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
      <div className="lg:col-span-3 space-y-3 sm:space-y-4 md:space-y-6">
        <div className="bg-whiskyPapa-black-dark border border-whiskyPapa-yellow/20 rounded-lg p-3 sm:p-4 md:p-5 flex flex-col gap-3 print-hide">
          <div className="flex flex-col md:flex-row md:items-end gap-3">
            <div className="flex-1 min-w-[180px]">
              <label className="block text-xs sm:text-sm font-medium text-white mb-1">機体プリセット</label>
              <select
                value={selectedPreset?.id ?? ''}
                onChange={handleAircraftChange}
                className="w-full bg-whiskyPapa-black-dark border border-whiskyPapa-yellow/30 rounded px-2 py-1 text-sm text-white focus:outline-none focus:ring-2 focus:ring-whiskyPapa-yellow"
              >
                <option value="">未選択</option>
                {aircraftPresets.map((preset: AircraftPreset) => (
                  <option key={preset.id} value={preset.id}>{preset.name}</option>
                ))}
              </select>
              <div className="mt-1 text-2xs text-gray-300">
                巡航FF: {selectedPreset?.cruiseFuelFlowLbPerHr ?? '--'} lb/hr / 予備: {selectedPreset?.reserveFuelLb ?? '--'} lb / タキシー: {selectedPreset?.taxiFuelLb ?? '--'} lb
              </div>
            </div>
            <div className="w-full md:w-48">
              <label className="block text-xs sm:text-sm font-medium text-white mb-1">初期燃料 (lb)</label>
              <input
                type="number"
                value={flightPlan.initialFuelLb ?? selectedPreset?.defaultInitialFuelLb ?? 0}
                onChange={handleInitialFuelChange}
                className="w-full bg-whiskyPapa-black-dark border border-whiskyPapa-yellow/30 rounded px-2 py-1 text-sm text-white focus:outline-none focus:ring-2 focus:ring-whiskyPapa-yellow"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleExport}
                className="px-3 py-2 bg-gray-800 hover:bg-gray-700 text-white text-sm rounded border border-whiskyPapa-yellow/30"
              >
                Export JSON
              </button>
              <button
                onClick={handleImportClick}
                className="px-3 py-2 bg-gray-800 hover:bg-gray-700 text-white text-sm rounded border border-whiskyPapa-yellow/30"
              >
                Import JSON
              </button>
              <button
                onClick={handlePrint}
                className="px-3 py-2 bg-whiskyPapa-yellow/20 hover:bg-whiskyPapa-yellow/30 text-white text-sm rounded border border-whiskyPapa-yellow/40"
              >
                印刷
              </button>
              <input
                type="file"
                accept="application/json"
                ref={fileInputRef}
                className="hidden"
                onChange={handleImportFile}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="lg:col-span-2 space-y-3 sm:space-y-4 md:space-y-6">
        {/* FlightParameters コンポーネントを配置 */}
        <FlightParameters
          flightPlan={flightPlan}
          setFlightPlan={setFlightPlan}
        />

        {/* RoutePlanning コンポーネントを配置 */}
        <RoutePlanning
          flightPlan={flightPlan}
          setFlightPlan={setFlightPlan}
          airportOptions={airportOptions}
          navaidOptions={navaidOptions}
          selectedNavaid={selectedNavaid}
          setSelectedNavaid={setSelectedNavaid}
          waypointOptions={waypointOptions}
          selectedWaypoint={selectedWaypoint}
          setSelectedWaypoint={setSelectedWaypoint}
        />
      </div>

      <div className="space-y-3 sm:space-y-4 md:space-y-6">
        {/* FlightSummary コンポーネントを配置 */}
        <FlightSummary flightPlan={flightPlan} setFlightPlan={setFlightPlan} />
      </div>

      {/* 印刷専用ビュー（画面では非表示、印刷時のみ表示） */}
      <div className="lg:col-span-3">
        <PlanPrintView flightPlan={flightPlan} />
      </div>
    </div>
  );
};

export default PlanningTab;
