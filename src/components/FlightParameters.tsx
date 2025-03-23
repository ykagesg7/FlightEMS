import React, { useCallback, useMemo } from 'react';
import { FlightPlan } from '../types';
import { 
  calculateTAS, 
  calculateMach, 
  parseTimeString, 
  SPEED_INCREMENT, 
  ALTITUDE_INCREMENT,
  calculateCASFromTAS,
  calculateTASFromMach,
  TAS_INCREMENT,
  MACH_INCREMENT
} from '../utils';
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

  const handleSpeedIncrement = useCallback(() => {
    setFlightPlan(prev => ({ ...prev, speed: prev.speed + SPEED_INCREMENT }));
  }, [setFlightPlan]);

  const handleSpeedDecrement = useCallback(() => {
    setFlightPlan(prev => ({ ...prev, speed: Math.max(0, prev.speed - SPEED_INCREMENT) }));
  }, [setFlightPlan]);

  const handleAltitudeIncrement = useCallback(() => {
    setFlightPlan(prev => ({ ...prev, altitude: prev.altitude + ALTITUDE_INCREMENT }));
  }, [setFlightPlan]);

  const handleAltitudeDecrement = useCallback(() => {
    setFlightPlan(prev => ({ ...prev, altitude: Math.max(0, prev.altitude - ALTITUDE_INCREMENT) }));
  }, [setFlightPlan]);

  // TASの変更ハンドラ
  const handleTASIncrement = useCallback(() => {
    const currentTAS = calculateTAS(flightPlan.speed, flightPlan.altitude);
    const newTAS = currentTAS + TAS_INCREMENT;
    const newCAS = calculateCASFromTAS(newTAS, flightPlan.altitude);
    setFlightPlan(prev => ({ ...prev, speed: Math.round(newCAS) }));
  }, [flightPlan.speed, flightPlan.altitude, setFlightPlan]);

  const handleTASDecrement = useCallback(() => {
    const currentTAS = calculateTAS(flightPlan.speed, flightPlan.altitude);
    const newTAS = Math.max(0, currentTAS - TAS_INCREMENT);
    const newCAS = calculateCASFromTAS(newTAS, flightPlan.altitude);
    setFlightPlan(prev => ({ ...prev, speed: Math.round(newCAS) }));
  }, [flightPlan.speed, flightPlan.altitude, setFlightPlan]);

  // MACHの変更ハンドラ
  const handleMachIncrement = useCallback(() => {
    const currentMach = calculateMach(calculateTAS(flightPlan.speed, flightPlan.altitude), flightPlan.altitude);
    const newMach = currentMach + MACH_INCREMENT;
    const newTAS = calculateTASFromMach(newMach, flightPlan.altitude);
    const newCAS = calculateCASFromTAS(newTAS, flightPlan.altitude);
    setFlightPlan(prev => ({ ...prev, speed: Math.round(newCAS) }));
  }, [flightPlan.speed, flightPlan.altitude, setFlightPlan]);

  const handleMachDecrement = useCallback(() => {
    const currentMach = calculateMach(calculateTAS(flightPlan.speed, flightPlan.altitude), flightPlan.altitude);
    const newMach = Math.max(0, currentMach - MACH_INCREMENT);
    const newTAS = calculateTASFromMach(newMach, flightPlan.altitude);
    const newCAS = calculateCASFromTAS(newTAS, flightPlan.altitude);
    setFlightPlan(prev => ({ ...prev, speed: Math.round(newCAS) }));
  }, [flightPlan.speed, flightPlan.altitude, setFlightPlan]);

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
    <div className="bg-gray-800 shadow-sm rounded-lg p-4 md:p-6">
      <h2 className="text-lg md:text-xl font-semibold mb-3 md:mb-4 text-gray-50">フライトパラメータ</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
        <div className="mb-1">
          <label htmlFor="altitude" className="block text-sm font-medium text-gray-300 mb-1">
            高度 (ft)
          </label>
          <div className="flex">
            <input
              type="number"
              id="altitude"
              name="altitude"
              className="px-2 py-1 w-full border border-gray-600 rounded-l-md text-sm bg-gray-700 text-gray-50 focus:ring-1 focus:ring-blue-500"
              value={flightPlan.altitude}
              onChange={(e) => handleAltitudeChange(parseInt(e.target.value, 10))}
            />
            <div className="flex flex-col">
              <button 
                className="bg-gray-600 px-2 text-gray-200 border-t border-r border-gray-600 rounded-tr-md hover:bg-gray-500"
                onClick={handleAltitudeIncrement}
                aria-label="Increase altitude"
              >
                <ChevronUp size={14} />
              </button>
              <button 
                className="bg-gray-600 px-2 text-gray-200 border-b border-r border-gray-600 rounded-br-md hover:bg-gray-500"
                onClick={handleAltitudeDecrement}
                aria-label="Decrease altitude"
              >
                <ChevronDown size={14} />
              </button>
            </div>
          </div>
        </div>
        <div className="mb-1">
          <label htmlFor="speed" className="block text-sm font-medium text-gray-300 mb-1">
            速度 (CAS/kt)
          </label>
          <div className="flex">
            <input
              type="number"
              id="speed"
              name="speed"
              className="px-2 py-1 w-full border border-gray-600 rounded-l-md text-sm bg-gray-700 text-gray-50 focus:ring-1 focus:ring-blue-500"
              value={flightPlan.speed}
              onChange={handleSpeedChange}
            />
            <div className="flex flex-col">
              <button 
                className="bg-gray-600 px-2 text-gray-200 border-t border-r border-gray-600 rounded-tr-md hover:bg-gray-500"
                onClick={handleSpeedIncrement}
                aria-label="Increase speed"
              >
                <ChevronUp size={14} />
              </button>
              <button 
                className="bg-gray-600 px-2 text-gray-200 border-b border-r border-gray-600 rounded-br-md hover:bg-gray-500"
                onClick={handleSpeedDecrement}
                aria-label="Decrease speed"
              >
                <ChevronDown size={14} />
              </button>
            </div>
          </div>
        </div>
        <div className="mb-1">
          <label htmlFor="departureTime" className="block text-sm font-medium text-gray-300 mb-1">
            出発時刻
          </label>
          <input
            type="time"
            id="departureTime"
            name="departureTime"
            className="px-2 py-1 w-full border border-gray-600 rounded-md text-sm bg-gray-700 text-gray-50 focus:ring-1 focus:ring-blue-500"
            value={flightPlan.departureTime}
            onChange={handleDepartureTimeChange}
          />
          <div className="mt-1 text-xs text-gray-400">
            UTC: {utcTime}
          </div>
        </div>
        <div className="mb-1">
          <label className="block text-sm font-medium text-gray-300 mb-1">
            TAS
          </label>
          <div className="flex">
            <div className="px-2 py-1 border border-gray-600 rounded-l-md w-full bg-gray-700">
              <span className="text-sm text-gray-50">{calculatedTAS.toFixed(0)} kt</span>
            </div>
            <div className="flex flex-col">
              <button 
                className="bg-gray-600 px-2 text-gray-200 border-t border-r border-gray-600 rounded-tr-md hover:bg-gray-500"
                onClick={handleTASIncrement}
                aria-label="Increase TAS"
              >
                <ChevronUp size={14} />
              </button>
              <button 
                className="bg-gray-600 px-2 text-gray-200 border-b border-r border-gray-600 rounded-br-md hover:bg-gray-500"
                onClick={handleTASDecrement}
                aria-label="Decrease TAS"
              >
                <ChevronDown size={14} />
              </button>
            </div>
          </div>
          <div className="mt-1 text-xs text-gray-400">
            真対気速度
          </div>
        </div>
        <div className="mb-1">
          <label className="block text-sm font-medium text-gray-300 mb-1">
            MACH
          </label>
          <div className="flex">
            <div className="px-2 py-1 border border-gray-600 rounded-l-md w-full bg-gray-700">
              <span className="text-sm text-gray-50">{calculatedMach.toFixed(3)}</span>
            </div>
            <div className="flex flex-col">
              <button 
                className="bg-gray-600 px-2 text-gray-200 border-t border-r border-gray-600 rounded-tr-md hover:bg-gray-500"
                onClick={handleMachIncrement}
                aria-label="Increase MACH"
              >
                <ChevronUp size={14} />
              </button>
              <button 
                className="bg-gray-600 px-2 text-gray-200 border-b border-r border-gray-600 rounded-br-md hover:bg-gray-500"
                onClick={handleMachDecrement}
                aria-label="Decrease MACH"
              >
                <ChevronDown size={14} />
              </button>
            </div>
          </div>
          <div className="mt-1 text-xs text-gray-400">
            マッハ数
          </div>
        </div>
      </div>
    </div>
  );
};

export default FlightParameters; 