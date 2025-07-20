import React from 'react';
import { Airport, AirportGroupOption, AirportOption, FlightPlan, NavaidOption, RouteSegment, Waypoint } from '../../types/index';
import { calculateAirspeeds, calculateDistance, calculateETA, calculateETE, calculateMach, calculateTAS, formatTime, groupBy } from '../../utils';
import { calculateMagneticBearing } from '../../utils/bearing';
import FlightParameters from './FlightParameters';
import { FlightSummary } from './FlightSummary';
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

    fetchAirports();
    fetchNavaids();
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

    // FlightPlanステートを更新
    setFlightPlan((prevFlightPlan: FlightPlan) => ({
      ...prevFlightPlan,
      totalDistance: totalDistance,
      ete: eteFormatted,
      eta: etaFormatted,
      tas: tas,
      mach: mach,
      routeSegments: routeSegments
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
    setFlightPlan
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

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
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
        />
      </div>

      <div className="space-y-3 sm:space-y-4 md:space-y-6">
        {/* FlightSummary コンポーネントを配置 */}
        <FlightSummary flightPlan={flightPlan} setFlightPlan={setFlightPlan} />
      </div>
    </div>
  );
};

export default PlanningTab;
