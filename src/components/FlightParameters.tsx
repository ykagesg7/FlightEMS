import React, { useCallback, useMemo } from 'react';
import { FlightPlan } from '../types';
import { calculateTAS, calculateMach, parseTimeString, SPEED_INCREMENT, ALTITUDE_INCREMENT } from '../utils';
import { ChevronUp, ChevronDown, Clock, Gauge, BarChart } from 'lucide-react';
import { toZonedTime, format } from 'date-fns-tz';

interface FlightParametersProps {
  flightPlan: FlightPlan;
  setFlightPlan: React.Dispatch<React.SetStateAction<FlightPlan>>;
}

/**
 * Flight Parameters コンポーネント
 * 速度、高度の入力とTAS、Machの表示を行う
 */
const FlightParameters: React.FC<FlightParametersProps> = ({
  flightPlan,
  setFlightPlan,
}) => {
  const handleSpeedChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const newSpeed = parseInt(event.target.value, 10);
    setFlightPlan({ ...flightPlan, speed: newSpeed });
  }, [flightPlan, setFlightPlan]);

  const handleAltitudeChange = useCallback((newAltitude: number) => {
    setFlightPlan({ ...flightPlan, altitude: newAltitude });
  }, [flightPlan, setFlightPlan]);

  const handleDepartureTimeChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const jstTime = event.target.value;
    setFlightPlan({ ...flightPlan, departureTime: jstTime });
  }, [flightPlan, setFlightPlan]);

  const calculatedTAS = useMemo(() => calculateTAS(flightPlan.speed, flightPlan.altitude), [flightPlan.speed, flightPlan.altitude]);
  const calculatedMach = useMemo(() => calculateMach(calculatedTAS, flightPlan.altitude), [calculatedTAS, flightPlan.altitude]);

  const utcTime = useMemo(() => {
    return format(
      toZonedTime(parseTimeString(flightPlan.departureTime), 'UTC'),
      'HH:mm',
      { timeZone: 'UTC' }
    );
  }, [flightPlan.departureTime]);

  return (
    <div className="bg-white shadow-sm rounded-lg p-4 md:p-6">
      <h2 className="text-lg md:text-xl font-semibold mb-3 md:mb-4 text-gray-700">フライトパラメータ</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
        <div className="mb-1">
          <label htmlFor="altitude" className="block text-sm font-medium text-gray-700 mb-1">
            高度 (ft)
          </label>
          <input
            type="number"
            id="altitude"
            name="altitude"
            className="px-2 py-1 w-full border rounded-md text-sm focus:ring-1 focus:ring-blue-500"
            value={flightPlan.altitude}
            onChange={(e) => handleAltitudeChange(parseInt(e.target.value, 10))}
          />
        </div>
        <div className="mb-1">
          <label htmlFor="speed" className="block text-sm font-medium text-gray-700 mb-1">
            速度 (CAS/kt)
          </label>
          <input
            type="number"
            id="speed"
            name="speed"
            className="px-2 py-1 w-full border rounded-md text-sm focus:ring-1 focus:ring-blue-500"
            value={flightPlan.speed}
            onChange={handleSpeedChange}
          />
        </div>
        <div className="mb-1">
          <label htmlFor="departureTime" className="block text-sm font-medium text-gray-700 mb-1">
            出発時刻
          </label>
          <input
            type="time"
            id="departureTime"
            name="departureTime"
            className="px-2 py-1 w-full border rounded-md text-sm focus:ring-1 focus:ring-blue-500"
            value={flightPlan.departureTime}
            onChange={handleDepartureTimeChange}
          />
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 md:gap-4 mt-2 md:mt-3">
        <div className="p-2 bg-gray-50 rounded-md">
          <span className="text-xs md:text-sm text-gray-500">TAS: {calculatedTAS.toFixed(0)} kt</span>
        </div>
        <div className="p-2 bg-gray-50 rounded-md">
          <span className="text-xs md:text-sm text-gray-500">MACH: {calculatedMach.toFixed(3)}</span>
        </div>
      </div>
    </div>
  );
};

export default FlightParameters; 