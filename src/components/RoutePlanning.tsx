import React from 'react';
import { FlightPlan, Waypoint } from '../types';
import WaypointList from './WaypointList';
import AirportSelect from './AirportSelect';
import NavaidSelector from './NavaidSelector';
import WaypointForm from './WaypointForm';

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

  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow-sm mt-8">
      <legend className="text-lg font-semibold mb-4 text-gray-50">Route Planning</legend>
      
      {/* 出発空港選択 */}
      <div className="mb-6">
        <AirportSelect
          label="Departure Airport"
          options={airportOptions}
          selectedOption={flightPlan.departure}
          onChange={(option) => setFlightPlan({ ...flightPlan, departure: option || null })}
          placeholder="Select Departure Airport"
          className="text-gray-50"
          styles={{
            control: (provided: any) => ({
              ...provided,
              borderRadius: '0.5rem',
              borderColor: '#4b5563',
              backgroundColor: '#4b5563',
              boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
              '&:hover': {
                borderColor: '#d1d5db',
              },
            }),
            menu: (provided: any) => ({
              ...provided,
              backgroundColor: '#4b5563',
            }),
            option: (provided: any, state: any) => ({
              ...provided,
              backgroundColor: state.isFocused ? '#6b7280' : '#4b5563',
              color: 'white',
            }),
            placeholder: (provided: any) => ({
              ...provided,
              color: 'white',
            }),
            input: (provided: any) => ({
              ...provided,
              color: 'white',
            }),
            singleValue: (provided: any) => ({
              ...provided,
              color: 'white',
            }),
          }}
        />
      </div>

      {/* 到着空港選択 */}
      <div className="mb-6">
        <AirportSelect
          label="Arrival Airport"
          options={airportOptions}
          selectedOption={flightPlan.arrival}
          onChange={(option) => setFlightPlan({ ...flightPlan, arrival: option || null })}
          placeholder="Select Arrival Airport"
          className="text-gray-50"
          styles={{
            control: (provided: any) => ({
              ...provided,
              borderRadius: '0.5rem',
              borderColor: '#4b5563',
              backgroundColor: '#4b5563',
              boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
              '&:hover': {
                borderColor: '#d1d5db',
              },
            }),
            menu: (provided: any) => ({
              ...provided,
              backgroundColor: '#4b5563',
            }),
            option: (provided: any, state: any) => ({
              ...provided,
              backgroundColor: state.isFocused ? '#6b7280' : '#4b5563',
              color: 'white',
            }),
            placeholder: (provided: any) => ({
              ...provided,
              color: 'white',
            }),
            input: (provided: any) => ({
              ...provided,
              color: 'white',
            }),
            singleValue: (provided: any) => ({
              ...provided,
              color: 'white',
            }),
          }}
        />
      </div>

      {/* NAVAID選択と追加 */}
      <div className="mb-6">
        <NavaidSelector
          options={navaidOptions}
          selectedNavaid={selectedNavaid}
          setSelectedNavaid={setSelectedNavaid}
          onAdd={handleAddWaypoint}
        />
      </div>

      {/* ウェイポイント追加フォーム */}
      <div className="mb-6">
        <WaypointForm
          flightPlan={flightPlan}
          setFlightPlan={setFlightPlan}
        />
      </div>

      {/* ウェイポイントリスト */}
      <div className="mb-6">
        <WaypointList flightPlan={flightPlan} setFlightPlan={setFlightPlan} />
      </div>
    </div>
  );
};

export default RoutePlanning; 