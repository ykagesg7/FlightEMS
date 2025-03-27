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

  // モバイル対応のカスタムスタイル
  const customStyles = {
    ...reactSelectStyles,
    control: (provided: any) => ({
      ...provided,
      minHeight: '36px',
      padding: '0px 1px',
      fontSize: '0.875rem',
      backgroundColor: '#4b5563',
      borderColor: '#6b7280',
    }),
    menu: (provided: any) => ({
      ...provided,
      fontSize: '0.875rem',
      zIndex: 50,
      backgroundColor: '#4b5563',
    }),
    option: (provided: any, state: any) => ({
      ...provided,
      padding: '4px 8px',
      fontSize: '0.875rem',
      backgroundColor: state.isFocused ? '#6b7280' : '#4b5563',
      color: '#f9fafb',
    }),
    placeholder: (provided: any) => ({
      ...provided,
      color: '#d1d5db',
    }),
    input: (provided: any) => ({
      ...provided,
      color: '#f9fafb',
    }),
    singleValue: (provided: any) => ({
      ...provided,
      color: '#f9fafb',
    }),
  };

  return (
    <div className="bg-gray-800 shadow-sm rounded-lg p-4 md:p-6">
      <h2 className="text-lg md:text-xl font-semibold mb-3 md:mb-4 text-gray-50">経路計画</h2>
      
      {/* 空港選択部分 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="departure" className="block text-sm font-medium text-gray-300 mb-1">
            出発地
          </label>
          <Select
            id="departure"
            placeholder="出発空港を選択..."
            options={airportOptions}
            value={flightPlan.departure}
            onChange={(option) => setFlightPlan({ ...flightPlan, departure: option || null })}
            styles={customStyles}
            classNamePrefix="react-select"
            className="text-sm"
          />
        </div>
        <div>
          <label htmlFor="arrival" className="block text-sm font-medium text-gray-300 mb-1">
            目的地
          </label>
          <Select
            id="arrival"
            placeholder="到着空港を選択..."
            options={airportOptions}
            value={flightPlan.arrival}
            onChange={(option) => setFlightPlan({ ...flightPlan, arrival: option || null })}
            styles={customStyles}
            classNamePrefix="react-select"
            className="text-sm"
          />
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          {/* NAVAID選択と追加 */}
          <div className="mb-6 bg-gray-700 p-4 rounded-lg">
            <h3 className="text-md font-medium text-gray-200 mb-3">NAVAIDの追加</h3>
            <NavaidSelector
              options={navaidOptions}
              selectedNavaid={selectedNavaid}
              setSelectedNavaid={setSelectedNavaid}
              onAdd={handleAddWaypoint}
            />
          </div>

          {/* ウェイポイント追加フォーム */}
          <div className="mb-6 bg-gray-700 p-4 rounded-lg">
            <h3 className="text-md font-medium text-gray-200 mb-3">緯度経度で追加</h3>
            <WaypointForm
              flightPlan={flightPlan}
              setFlightPlan={setFlightPlan}
            />
          </div>
        </div>

        <div>
          {/* ウェイポイントリスト - 既存の編集機能と並べ替え機能を持つコンポーネント */}
          <div className="bg-gray-700 p-4 rounded-lg">
            <h3 className="text-md font-medium text-gray-200 mb-3">ウェイポイントリスト</h3>
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