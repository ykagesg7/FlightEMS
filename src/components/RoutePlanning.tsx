import React from 'react';
import { FlightPlan, Waypoint } from '../types';
import WaypointList from './WaypointList';
import AirportSelect from './AirportSelect';
import NavaidSelector from './NavaidSelector';
import WaypointForm from './WaypointForm';
import { reactSelectStyles } from '../utils/reactSelectStyles';
import Select from 'react-select';

/**
 * Route Planning コンポーネント
 * 出発/到着空港の選択、NAVAIDの追加、ウェイポイントリストの表示を行う
 */
interface RoutePlanningProps {
  flightPlan: FlightPlan;
  setFlightPlan: React.Dispatch<React.SetStateAction<FlightPlan>>;
  airportOptions: any[];
  navaidOptions: any[];
  selectedNavaid: any;
  setSelectedNavaid: React.Dispatch<React.SetStateAction<any>>;
}

const RoutePlanning: React.FC<RoutePlanningProps> = ({
  flightPlan,
  setFlightPlan,
  airportOptions,
  navaidOptions,
  selectedNavaid,
  setSelectedNavaid,
}) => {
  
  // 新規: Waypointを追加する関数を定義
  const handleAddWaypoint = (waypoint: Waypoint) => {
    setFlightPlan({ ...flightPlan, waypoints: [...flightPlan.waypoints, waypoint] });
  };

  const handleDepartureChange = (option: any) => {
    setFlightPlan({ ...flightPlan, departure: option || null });
  };

  const handleArrivalChange = (option: any) => {
    setFlightPlan({ ...flightPlan, arrival: option || null });
  };

  const handleNavaidChange = (option: any) => {
    setSelectedNavaid(option);
  };

  const handleAddNavaid = () => {
    if (selectedNavaid) {
      handleAddWaypoint(selectedNavaid);
      setSelectedNavaid(null);
    }
  };

  const handleRemoveWaypoint = (index: number) => {
    const newWaypoints = flightPlan.waypoints.filter((_, i) => i !== index);
    setFlightPlan({ ...flightPlan, waypoints: newWaypoints });
  };

  // モバイル対応のカスタムスタイル
  const customStyles = {
    ...reactSelectStyles,
    control: (provided: any) => ({
      ...provided,
      minHeight: '36px',
      padding: '0px 1px',
      fontSize: '0.875rem',
      backgroundColor: '#fff',
      borderColor: '#d1d5db',
    }),
    menu: (provided: any) => ({
      ...provided,
      fontSize: '0.875rem',
      zIndex: 50,
      backgroundColor: '#fff',
    }),
    option: (provided: any, state: any) => ({
      ...provided,
      padding: '4px 8px',
      fontSize: '0.875rem',
      backgroundColor: state.isFocused ? '#f3f4f6' : '#fff',
      color: '#374151',
    }),
    placeholder: (provided: any) => ({
      ...provided,
      color: '#6b7280',
    }),
    input: (provided: any) => ({
      ...provided,
      color: '#374151',
    }),
    singleValue: (provided: any) => ({
      ...provided,
      color: '#374151',
    }),
  };

  return (
    <div className="bg-white shadow-sm rounded-lg p-4 md:p-6">
      <h2 className="text-lg md:text-xl font-semibold mb-3 md:mb-4 text-gray-700">経路計画</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="departure" className="block text-sm font-medium text-gray-700 mb-1">
            出発地
          </label>
          <Select
            id="departure"
            placeholder="出発空港を選択..."
            options={airportOptions}
            value={flightPlan.departure}
            onChange={handleDepartureChange}
            styles={customStyles}
            classNamePrefix="react-select"
            className="text-sm"
          />
        </div>
        <div>
          <label htmlFor="arrival" className="block text-sm font-medium text-gray-700 mb-1">
            目的地
          </label>
          <Select
            id="arrival"
            placeholder="到着空港を選択..."
            options={airportOptions}
            value={flightPlan.arrival}
            onChange={handleArrivalChange}
            styles={customStyles}
            classNamePrefix="react-select"
            className="text-sm"
          />
        </div>
      </div>

      <div className="mt-4">
        <div className="grid grid-cols-1 sm:grid-cols-6 gap-2 items-end mb-4">
          <div className="sm:col-span-5">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              NAVAIDの追加
            </label>
            <Select
              placeholder="NAVAIDを選択して追加..."
              options={navaidOptions}
              value={selectedNavaid}
              onChange={handleNavaidChange}
              styles={customStyles}
              classNamePrefix="react-select"
              className="text-sm"
            />
          </div>
          <div className="sm:col-span-1">
            <button
              className="w-full bg-blue-500 hover:bg-blue-600 text-white py-1 px-3 rounded text-sm"
              onClick={handleAddNavaid}
              disabled={!selectedNavaid}
            >
              追加
            </button>
          </div>
        </div>

        <div className="mt-4">
          <h3 className="text-md font-medium text-gray-700 mb-2">ウェイポイントリスト</h3>
          {flightPlan.waypoints.length > 0 ? (
            <div className="border rounded-md overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200 table-fixed">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ID
                    </th>
                    <th scope="col" className="px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      名前
                    </th>
                    <th scope="col" className="px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                      座標
                    </th>
                    <th scope="col" className="px-2 py-1 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-20">
                      アクション
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {flightPlan.waypoints.map((waypoint, index) => (
                    <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="px-2 py-1 text-xs text-gray-900 truncate">{waypoint.id}</td>
                      <td className="px-2 py-1 text-xs text-gray-900 truncate">
                        {waypoint.name}
                      </td>
                      <td className="px-2 py-1 text-xs text-gray-900 truncate hidden sm:table-cell">
                        {waypoint.latitude.toFixed(4)}°N, {waypoint.longitude.toFixed(4)}°E
                      </td>
                      <td className="px-2 py-1 text-center">
                        <button
                          className="p-1 text-xs text-red-500 hover:text-red-700"
                          onClick={() => handleRemoveWaypoint(index)}
                        >
                          削除
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-sm text-gray-500">まだウェイポイントがありません。NAVAIDを追加するか、地図をダブルクリックして追加してください。</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default RoutePlanning; 