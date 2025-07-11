import React from 'react';
import { FlightPlan, RouteSegment, Airport, Waypoint } from '../../types/index';
import { formatTime, calculateDistance, calculateETE, calculateETA, groupBy, calculateTAS, calculateMach, calculateAirspeeds } from '../../utils';
import { calculateMagneticBearing } from '../../utils/bearing';
import FlightParameters from './FlightParameters';
import RoutePlanning from './RoutePlanning';
import { FlightSummary } from './FlightSummary';

interface PlanningTabProps {
  flightPlan: FlightPlan;
  setFlightPlan: React.Dispatch<React.SetStateAction<FlightPlan>>;
}

/**
 * Planning Tab コンポーネント
 * フライトプランの入力と計算結果の表示を行うメインコンポーネント
 */
const PlanningTab: React.FC<PlanningTabProps> = ({ flightPlan, setFlightPlan }) => {
  const [airportOptions, setAirportOptions] = React.useState<any[]>([]);
  const [navaidOptions, setNavaidOptions] = React.useState<any[]>([]);
  const [selectedNavaid, setSelectedNavaid] = React.useState<any>(null);

  // 空港データを取得するuseEffect
  React.useEffect(() => {
    const fetchAirports = async () => {
      try {
        const response = await fetch('/geojson/Airports.geojson');
        const geojsonData = await response.json();
        const airportList = geojsonData.features.map((feature: any) => ({
          value: feature.properties.id,
          label: `${feature.properties.name1} (${feature.properties.id})`,
          name: feature.properties.name1,
          type: feature.properties.type,
          latitude: feature.geometry.coordinates[1],
          longitude: feature.geometry.coordinates[0],
          // GeoJSONのpropertiesを含める
          properties: { ...feature.properties },
        }));

        // 空港タイプでグループ化
        const groupedAirports = Object.entries(groupBy(airportList, 'type')).map(([type, options]) => ({
          label: type,
          options,
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
        const navaidList = geojsonData.features.map((feature: any) => ({
          value: feature.properties.id,
          label: `${feature.properties.name1}(${feature.properties.name2})(${feature.properties.id})`,
          type: feature.properties.type,
          latitude: feature.geometry.coordinates[1],
          longitude: feature.geometry.coordinates[0],
          ch: feature.properties.ch,
          coordinates: [feature.geometry.coordinates[1], feature.geometry.coordinates[0]],
        }));
        setNavaidOptions(navaidList);
      } catch (error) {
        console.error("Navaidsデータの読み込みに失敗しました", error);
      }
    };

    fetchAirports();
    fetchNavaids();
  }, []);

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
      routeSegments.push({
        from: 'id' in currentPoint
          ? (currentPoint as Waypoint).id
          : (currentPoint as Airport).properties?.id || (currentPoint as Airport).value,
        to: 'id' in nextPoint
          ? (nextPoint as Waypoint).id
          : (nextPoint as Airport).properties?.id || (nextPoint as Airport).value,
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
    flightPlan.groundElevationFt
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
        <FlightSummary flightPlan={flightPlan} />
      </div>
    </div>
  );
};

export default PlanningTab;
