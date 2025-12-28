import React from 'react';
import Select, { SingleValue } from 'react-select';
import { FlightPlan, Waypoint, WaypointOption } from '../../../../types/index';
import { calculateDistance, decimalToDMS } from '../../../../utils';
import { calculateMagneticBearing } from '../../../../utils/bearing';
import { reactSelectStyles } from '../../../../utils/reactSelectStyles';

interface WaypointSelectorProps {
  options: WaypointOption[];
  selectedWaypoint: WaypointOption | null;
  setSelectedWaypoint: React.Dispatch<React.SetStateAction<WaypointOption | null>>;
  onAdd: (waypoint: Waypoint) => void;
  flightPlan: FlightPlan;
}

const WaypointSelector: React.FC<WaypointSelectorProps> = ({
  options,
  selectedWaypoint,
  setSelectedWaypoint,
  onAdd,
  flightPlan
}) => {
  const handleAddWaypoint = () => {
    if (!selectedWaypoint) return;

    const waypoint: Waypoint = {
      id: selectedWaypoint.value,
      name: selectedWaypoint.name,
      type: 'waypoint',
      sourceId: selectedWaypoint.value,
      coordinates: [selectedWaypoint.longitude, selectedWaypoint.latitude],
      latitude: selectedWaypoint.latitude,
      longitude: selectedWaypoint.longitude,
      nameEditable: true,
      metadata: {
        baseNavaid: selectedWaypoint.name,
        baseLatitude: selectedWaypoint.latitude,
        baseLongitude: selectedWaypoint.longitude
      }
    };

    onAdd(waypoint);
  };

  const handleWaypointChange = (newValue: SingleValue<WaypointOption>) => {
    setSelectedWaypoint(newValue);
  };

  // 前のポイントからの磁方位・距離を計算
  const calculateFromPrevious = () => {
    if (!selectedWaypoint) return null;

    let prevPoint: { latitude: number; longitude: number } | null = null;

    // ウェイポイントリストの最後のポイントを取得
    if (flightPlan.waypoints.length > 0) {
      const lastWaypoint = flightPlan.waypoints[flightPlan.waypoints.length - 1];
      prevPoint = {
        latitude: lastWaypoint.latitude,
        longitude: lastWaypoint.longitude
      };
    } else if (flightPlan.departure) {
      // ウェイポイントがない場合は出発地から
      prevPoint = {
        latitude: flightPlan.departure.latitude,
        longitude: flightPlan.departure.longitude
      };
    }

    if (!prevPoint) return null;

    const distance = calculateDistance(
      prevPoint.latitude,
      prevPoint.longitude,
      selectedWaypoint.latitude,
      selectedWaypoint.longitude
    );

    const bearing = calculateMagneticBearing(
      prevPoint.latitude,
      prevPoint.longitude,
      selectedWaypoint.latitude,
      selectedWaypoint.longitude
    );

    return { distance, bearing };
  };

  // 次のポイント（到着地）への磁方位・距離を計算
  const calculateToNext = () => {
    if (!selectedWaypoint || !flightPlan.arrival) return null;

    const distance = calculateDistance(
      selectedWaypoint.latitude,
      selectedWaypoint.longitude,
      flightPlan.arrival.latitude,
      flightPlan.arrival.longitude
    );

    const bearing = calculateMagneticBearing(
      selectedWaypoint.latitude,
      selectedWaypoint.longitude,
      flightPlan.arrival.latitude,
      flightPlan.arrival.longitude
    );

    return { distance, bearing };
  };

  const fromPrevious = calculateFromPrevious();
  const toNext = calculateToNext();
  const dms = selectedWaypoint ? decimalToDMS(selectedWaypoint.latitude, selectedWaypoint.longitude) : null;

  return (
    <div>
      <label className="block text-sm font-medium text-gray-400 mb-1">Waypoint選択</label>
      <Select<WaypointOption>
        options={options}
        value={selectedWaypoint}
        onChange={handleWaypointChange}
        placeholder="Select Waypoint"
        isClearable
        styles={reactSelectStyles as any}
      />

      {selectedWaypoint && (
        <div className="mt-3 p-3 rounded-md bg-gray-800 border border-gray-600 text-sm space-y-2">
          <div className="font-semibold text-gray-200">{selectedWaypoint.value} - {selectedWaypoint.name}</div>
          <div className="text-gray-400">タイプ: {selectedWaypoint.type}</div>

          <div className="border-t border-gray-700 pt-2 mt-2">
            <div className="text-gray-300 font-medium mb-1">座標</div>
            <div className="text-gray-400">
              緯度: {dms?.latDMS}
            </div>
            <div className="text-gray-400">
              経度: {dms?.lonDMS}
            </div>
          </div>

          {fromPrevious && (
            <div className="border-t border-gray-700 pt-2">
              <div className="text-gray-300 font-medium mb-1">前のポイントから</div>
              <div className="text-gray-400">
                磁方位: {fromPrevious.bearing.toFixed(1)}°
              </div>
              <div className="text-gray-400">
                距離: {fromPrevious.distance.toFixed(1)} nm
              </div>
            </div>
          )}

          {toNext && (
            <div className="border-t border-gray-700 pt-2">
              <div className="text-gray-300 font-medium mb-1">到着地まで</div>
              <div className="text-gray-400">
                磁方位: {toNext.bearing.toFixed(1)}°
              </div>
              <div className="text-gray-400">
                距離: {toNext.distance.toFixed(1)} nm
              </div>
            </div>
          )}
        </div>
      )}

      <button
        onClick={handleAddWaypoint}
        disabled={!selectedWaypoint}
        className="mt-3 w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-medium py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
      >
        Waypoint をルートに追加
      </button>
    </div>
  );
};

export default WaypointSelector;

