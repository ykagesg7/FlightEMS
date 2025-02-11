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
    <div className="bg-gray-800 p-6 rounded-lg shadow-sm">
      <h2 className="text-lg font-semibold mb-4 text-gray-50">Flight Parameters</h2>
      <div className="space-y-4">
        
        <fieldset className="border border-gray-700 rounded p-4">
          <legend className="text-sm font-medium text-gray-400">
            Speed (kt)
          </legend>
          <div className="flex items-center space-x-2">
            <Gauge className="w-6 h-6 text-gray-50" />
            <input
              type="number"
              id="speed"
              className="mt-1 block w-32 rounded-md border-gray-700 shadow-sm px-3 py-2 bg-gray-700 text-gray-50"
              placeholder="Speed"
              value={flightPlan.speed}
              onChange={handleSpeedChange}
            />
            <div className="flex flex-col">
              <button
                className="px-2 py-1 bg-gray-700 hover:bg-gray-600 rounded-t-md focus:outline-none text-gray-50"
                onClick={() => setFlightPlan({ ...flightPlan, speed: flightPlan.speed + SPEED_INCREMENT })}
              >
                <ChevronUp className="w-4 h-4" />
              </button>
              <button
                className="px-2 py-1 bg-gray-700 hover:bg-gray-600 rounded-b-md focus:outline-none text-gray-50"
                onClick={() => setFlightPlan({ ...flightPlan, speed: flightPlan.speed - SPEED_INCREMENT })}
              >
                <ChevronDown className="w-4 h-4" />
              </button>
            </div>
            <div className="flex items-center space-x-4 ml-4">
              <div className="flex items-center space-x-1">
                <Gauge className="w-4 h-4 text-gray-50" />
                <span className="text-sm text-gray-400">TAS: {calculatedTAS.toFixed(0)} kt</span>
              </div>
              <div className="flex items-center space-x-1">
                <BarChart className="w-4 h-4 text-gray-50" />
                <span className="text-sm text-gray-400">Mach: {calculatedMach.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </fieldset>

        <fieldset className="border border-gray-700 rounded p-4">
          <legend className="text-sm font-medium text-gray-400">Altitude (ft)</legend>
          <div className="flex items-center space-x-2">
            <BarChart className="w-6 h-6 text-gray-50" />
            <input
              type="number"
              id="altitude"
              className="mt-1 block w-32 rounded-md border-gray-700 shadow-sm px-3 py-2 bg-gray-700 text-gray-50"
              placeholder="Altitude"
              value={flightPlan.altitude}
              onChange={(e) => handleAltitudeChange(parseInt(e.target.value, 10))}
            />
            <div className="flex flex-col">
              <button
                className="px-2 py-1 bg-gray-700 hover:bg-gray-600 rounded-t-md focus:outline-none text-gray-50"
                onClick={() => handleAltitudeChange(flightPlan.altitude + ALTITUDE_INCREMENT)}
              >
                <ChevronUp className="w-4 h-4" />
              </button>
              <button
                className="px-2 py-1 bg-gray-700 hover:bg-gray-600 rounded-b-md focus:outline-none text-gray-50"
                onClick={() => handleAltitudeChange(flightPlan.altitude - ALTITUDE_INCREMENT)}
              >
                <ChevronDown className="w-4 h-4" />
              </button>
            </div>
          </div>
        </fieldset>

        <fieldset className="border border-gray-700 rounded p-4">
          <legend className="text-sm font-medium text-gray-400">Departure Time (JST)</legend>
          <div className="flex items-center space-x-2">
            <Clock className="w-6 h-6 text-gray-50" />
            <input
              type="time"
              id="departureTime"
              className="mt-1 block w-48 rounded-md border-gray-700 shadow-sm px-3 py-2 bg-gray-700 text-gray-50"
              value={flightPlan.departureTime}
              onChange={handleDepartureTimeChange}
            />
            <div className="flex items-center space-x-1">
              <span className="text-sm text-gray-400">UTC: {utcTime}</span>
            </div>
          </div>
        </fieldset>
      </div>
    </div>
  );
};

export default FlightParameters; 