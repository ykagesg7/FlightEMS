import React from 'react';
import Select from 'react-select';
import { AirportGroupOption, FlightPlan, NavaidOption, Waypoint, WaypointOption } from '../../../../types/index';
import { MAGNETIC_DECLINATION } from '../../../../utils/bearing';
import { planningRouteSelectStyles } from '../../../../utils/reactSelectStyles';
import NavaidSelector from './NavaidSelector';
import WaypointForm from './WaypointForm';
import WaypointList from './WaypointList';
import WaypointSelector from './WaypointSelector';

/**
 * Route Planning コンポーネント
 * 出発/到着空港の選択、NAVAIDの追加、ウェイポイントリストの表示を行う
 */
interface RoutePlanningProps {
  flightPlan: FlightPlan;
  setFlightPlan: React.Dispatch<React.SetStateAction<FlightPlan>>;
  airportOptions: AirportGroupOption[];
  navaidOptions: NavaidOption[];
  selectedNavaid: NavaidOption | null;
  setSelectedNavaid: React.Dispatch<React.SetStateAction<NavaidOption | null>>;
  waypointOptions: WaypointOption[];
  selectedWaypoint: WaypointOption | null;
  setSelectedWaypoint: React.Dispatch<React.SetStateAction<WaypointOption | null>>;
}

const RoutePlanning: React.FC<RoutePlanningProps> = ({
  flightPlan,
  setFlightPlan,
  airportOptions,
  navaidOptions,
  selectedNavaid,
  setSelectedNavaid,
  waypointOptions,
  selectedWaypoint,
  setSelectedWaypoint,
}) => {

  // 新しいWaypointを追加する関数を定義
  const handleAddWaypoint = (waypoint: Waypoint) => {
    setFlightPlan({ ...flightPlan, waypoints: [...flightPlan.waypoints, waypoint] });
  };

  return (
    <div className="bg-whiskyPapa-black-dark border border-whiskyPapa-yellow/20 rounded-lg p-3 sm:p-4 md:p-6">
      <h2 className="text-base sm:text-lg md:text-xl font-semibold mb-1 sm:mb-2 text-white">経路計画</h2>
      <p className="text-2xs sm:text-xs text-gray-400 mb-2 sm:mb-3 md:mb-4 leading-relaxed">
        磁気方位は教育用モデルとして固定の磁気偏差（{MAGNETIC_DECLINATION}°、<code className="text-gray-500">bearing.ts</code>）を用いています。実運航の計画には使用しないでください。
      </p>

      {/* 空港選択部 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4">
        <div>
          <label htmlFor="departure" className="block text-xs sm:text-sm font-medium text-white mb-1">
            出発地
          </label>
          <Select
            id="departure"
            placeholder="出発空港を選択.."
            options={airportOptions}
            value={flightPlan.departure}
            onChange={(option) => setFlightPlan({ ...flightPlan, departure: option || undefined })}
            styles={planningRouteSelectStyles}
            classNamePrefix="react-select"
            className="text-xs sm:text-sm"
          />
        </div>
        <div>
          <label htmlFor="arrival" className="block text-xs sm:text-sm font-medium text-white mb-1">
            目的地
          </label>
          <Select
            id="arrival"
            placeholder="到着空港を選択.."
            options={airportOptions}
            value={flightPlan.arrival}
            onChange={(option) => setFlightPlan({ ...flightPlan, arrival: option || undefined })}
            styles={planningRouteSelectStyles}
            classNamePrefix="react-select"
            className="text-xs sm:text-sm"
          />
        </div>
      </div>

      <div className="mt-4 sm:mt-6 grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <div>
          {/* NAVAID選択と追加 */}
          <div className="mb-4 p-3 sm:p-4 rounded-lg border border-whiskyPapa-yellow/20">
            <h3 className="text-sm sm:text-md font-medium text-white mb-2 sm:mb-3">NAVAIDの追加</h3>
            <NavaidSelector
              options={navaidOptions}
              selectedNavaid={selectedNavaid}
              setSelectedNavaid={setSelectedNavaid}
              onAdd={handleAddWaypoint}
            />
          </div>

          {/* Waypoint選択と追加 */}
          <div className="mb-4 p-3 sm:p-4 rounded-lg border border-whiskyPapa-yellow/20">
            <h3 className="text-sm sm:text-md font-medium text-white mb-2 sm:mb-3">Waypointの追加</h3>
            <WaypointSelector
              options={waypointOptions}
              selectedWaypoint={selectedWaypoint}
              setSelectedWaypoint={setSelectedWaypoint}
              onAdd={handleAddWaypoint}
              flightPlan={flightPlan}
            />
          </div>

          {/* ウェイポイント追加フォーム */}
          <div className="mb-4 sm:mb-6 p-3 sm:p-4 rounded-lg border border-whiskyPapa-yellow/20">
            <h3 className="text-sm sm:text-md font-medium text-white mb-2 sm:mb-3">緯度経度で追加</h3>
            <WaypointForm
              flightPlan={flightPlan}
              setFlightPlan={setFlightPlan}
            />
          </div>
        </div>

        <div>
          {/* ウェイポイントリスト - 既存の編集・並べ替え機能を持つコンポーネント */}
          <div className="p-3 sm:p-4 rounded-lg border border-whiskyPapa-yellow/20">
            <h3 className="text-sm sm:text-md font-medium text-white mb-2 sm:mb-3">ウェイポイントリスト</h3>
            <WaypointList
              flightPlan={flightPlan}
              setFlightPlan={setFlightPlan}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoutePlanning;
