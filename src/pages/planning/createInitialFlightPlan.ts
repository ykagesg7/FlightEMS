import type { FlightPlan } from '../../types/index';
import { calculateAirspeeds, calculateMach, calculateTAS, formatTime } from '../../utils';

/**
 * /planning の FlightPlan 初期状態（単一ソース）。
 */
export function createInitialFlightPlan(): FlightPlan {
  const initialSpeed = 250;
  const initialAltitude = 30000;
  const initialGroundTempC = 15;
  const initialGroundElevationFt = 0;
  const initialFuelLb = 5000;
  const taxiFuelLb = 200;
  const reserveFuelLb = 800;
  const cruiseFuelFlowLbPerHr = 2200;
  const airspeedsResult = calculateAirspeeds(
    initialSpeed,
    initialAltitude,
    initialGroundTempC,
    initialGroundElevationFt
  );
  const initialTas = airspeedsResult ? airspeedsResult.tasKt : calculateTAS(initialSpeed, initialAltitude);
  const initialMach = airspeedsResult ? airspeedsResult.mach : calculateMach(initialTas, initialAltitude);
  const departureTime = formatTime(new Date().getHours() * 60 + new Date().getMinutes());
  return {
    departure: undefined,
    arrival: undefined,
    waypoints: [],
    altitude: initialAltitude,
    speed: initialSpeed,
    tas: initialTas,
    mach: initialMach,
    totalDistance: 0,
    ete: '',
    eta: '',
    departureTime,
    groundTempC: initialGroundTempC,
    groundElevationFt: initialGroundElevationFt,
    routeSegments: [],
    aircraftId: 't4',
    initialFuelLb,
    taxiFuelLb,
    reserveFuelLb,
    cruiseFuelFlowLbPerHr,
  };
}
