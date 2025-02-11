import React from 'react';
import { FlightPlan } from '../types';
import { formatTime, calculateDistance, calculateETE, calculateETA, groupBy } from '../utils';
import FlightParameters from './FlightParameters';
import RoutePlanning from './RoutePlanning';
import FlightSummary from './FlightSummary';

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
          type: feature.properties.type,
          latitude: feature.geometry.coordinates[1],
          longitude: feature.geometry.coordinates[0],
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
          label: `${feature.properties.name} (${feature.properties.id})`,
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

    const waypointsWithDeparture = [flightPlan.departure, ...flightPlan.waypoints];

    if (flightPlan.departure && flightPlan.arrival) {
      // 出発空港から最初のウェイポイント、ウェイポイント間、最後のウェイポイントから到着空港までの距離を計算
      waypointsWithDeparture.forEach((waypoint, index) => {
        if (waypoint && flightPlan.arrival) {
          let nextWaypoint = waypointsWithDeparture[index + 1] || flightPlan.arrival;
          if (nextWaypoint) {
            const distance = calculateDistance(
              waypoint.latitude,
              waypoint.longitude,
              nextWaypoint.latitude,
              nextWaypoint.longitude
            );
            totalDistance += distance;
          }
        }
      });
    }

    // ETE, ETAを計算
    const eteMinutes = calculateETE(totalDistance, flightPlan.tas);
    const eteFormatted = formatTime(eteMinutes);
    const etaFormatted = calculateETA(flightPlan.departureTime, eteMinutes);

    // FlightPlanステートを更新
    setFlightPlan(prevFlightPlan => ({
      ...prevFlightPlan,
      totalDistance: totalDistance,
      ete: eteFormatted,
      eta: etaFormatted,
    } as FlightPlan));
  }, [flightPlan.departure, flightPlan.arrival, flightPlan.waypoints, flightPlan.tas, flightPlan.departureTime, formatTime, calculateDistance, calculateETE, calculateETA]);

  // Flight Summaryを更新するuseEffect
  React.useEffect(() => {
    updateFlightSummary();
  }, [updateFlightSummary, flightPlan.departure, flightPlan.arrival, flightPlan.waypoints, flightPlan.tas, flightPlan.departureTime]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-6">
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

      <div className="lg:col-span-1">
        {/* FlightSummary コンポーネントを配置 */}
        <FlightSummary flightPlan={flightPlan} />
      </div>
    </div>
  );
};

export default PlanningTab;