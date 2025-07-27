import React from 'react';
import Select from 'react-select';
import { useTheme } from '../../contexts/ThemeContext';
import { AirportGroupOption, FlightPlan, NavaidOption, ReactSelectStylesProps, Waypoint } from '../../types/index';
import { reactSelectStyles } from '../../utils/reactSelectStyles';
import NavaidSelector from './NavaidSelector';
import WaypointForm from './WaypointForm';
import WaypointList from './WaypointList';

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
}

const RoutePlanning: React.FC<RoutePlanningProps> = ({
  flightPlan,
  setFlightPlan,
  airportOptions,
  navaidOptions,
  selectedNavaid,
  setSelectedNavaid,
}) => {

  const { theme, effectiveTheme } = useTheme();

  // 新しいWaypointを追加する関数を定義
  const handleAddWaypoint = (waypoint: Waypoint) => {
    setFlightPlan({ ...flightPlan, waypoints: [...flightPlan.waypoints, waypoint] });
  };

  // モバイル対応のカスタムスタイル
  const customStyles = {
    ...reactSelectStyles,
    control: (provided: any) => ({
      ...provided,
      minHeight: '32px',
      padding: '0px',
      fontSize: '0.75rem',
      backgroundColor: '#4b5563',
      borderColor: '#6b7280',
    }),
    menu: (provided: any) => ({
      ...provided,
      fontSize: '0.75rem',
      zIndex: 50,
      backgroundColor: '#4b5563',
    }),
    option: (provided: any, state: ReactSelectStylesProps) => ({
      ...provided,
      padding: '4px 8px',
      fontSize: '0.75rem',
      backgroundColor: state.isFocused ? '#6b7280' : '#4b5563',
      color: '#f9fafb',
    }),
    placeholder: (provided: any) => ({
      ...provided,
      color: '#d1d5db',
      fontSize: '0.75rem',
    }),
    input: (provided: any) => ({
      ...provided,
      color: '#f9fafb',
      fontSize: '0.75rem',
    }),
    singleValue: (provided: any) => ({
      ...provided,
      color: '#f9fafb',
      fontSize: '0.75rem',
    }),
    valueContainer: (provided: any) => ({
      ...provided,
      padding: '0 8px',
    }),
    dropdownIndicator: (provided: any) => ({
      ...provided,
      padding: '4px',
    }),
  };

  return (
    <div
      className="shadow-sm rounded-lg p-3 sm:p-4 md:p-6"
      style={{
        background: effectiveTheme === 'dark' ? '#1a1a1a' : '#14213d',
        color: effectiveTheme === 'dark' ? '#FF3B3B' : '#39FF14',
        border: '0.5px solid',
        borderColor: effectiveTheme === 'dark' ? '#FF3B3B' : '#39FF14',
      }}
    >
      <h2 className="text-base sm:text-lg md:text-xl font-semibold mb-2 sm:mb-3 md:mb-4 text-gray-50">経路計画</h2>

      {/* 空港選択部 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4">
        <div>
          <label htmlFor="departure" className="block text-xs sm:text-sm font-medium text-gray-300 mb-1">
            出発地
          </label>
          <Select
            id="departure"
            placeholder="出発空港を選択.."
            options={airportOptions}
            value={flightPlan.departure}
            onChange={(option) => setFlightPlan({ ...flightPlan, departure: option || undefined })}
            styles={customStyles as any}
            classNamePrefix="react-select"
            className="text-xs sm:text-sm"
          />
        </div>
        <div>
          <label htmlFor="arrival" className="block text-xs sm:text-sm font-medium text-gray-300 mb-1">
            目的地
          </label>
          <Select
            id="arrival"
            placeholder="到着空港を選択.."
            options={airportOptions}
            value={flightPlan.arrival}
            onChange={(option) => setFlightPlan({ ...flightPlan, arrival: option || undefined })}
            styles={customStyles as any}
            classNamePrefix="react-select"
            className="text-xs sm:text-sm"
          />
        </div>
      </div>

      <div className="mt-4 sm:mt-6 grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <div>
          {/* NAVAID選択と追加 */}
          <div className="mb-4 bg-gray-700 p-3 sm:p-4 rounded-lg">
            <h3 className="text-sm sm:text-md font-medium text-gray-200 mb-2 sm:mb-3">NAVAIDの追加</h3>
            <NavaidSelector
              options={navaidOptions}
              selectedNavaid={selectedNavaid}
              setSelectedNavaid={setSelectedNavaid}
              onAdd={handleAddWaypoint}
            />
          </div>

          {/* ウェイポイント追加フォーム */}
          <div className="mb-4 sm:mb-6 bg-gray-700 p-3 sm:p-4 rounded-lg">
            <h3 className="text-sm sm:text-md font-medium text-gray-200 mb-2 sm:mb-3">緯度経度で追加</h3>
            <WaypointForm
              flightPlan={flightPlan}
              setFlightPlan={setFlightPlan}
            />
          </div>
        </div>

        <div>
          {/* ウェイポイントリスト - 既存の編集・並べ替え機能を持つコンポーネント */}
          <div className="bg-gray-700 p-3 sm:p-4 rounded-lg">
            <h3 className="text-sm sm:text-md font-medium text-gray-200 mb-2 sm:mb-3">ウェイポイントリスト</h3>
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
