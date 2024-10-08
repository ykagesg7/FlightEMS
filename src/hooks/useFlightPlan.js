import { useState } from 'react';
import { calculateDistance, calculateMagneticHeading } from '../utils/calculations';

const useFlightPlan = () => {
  const [flightPlan, setFlightPlan] = useState({
    departure: null,
    arrival: null,
    waypoints: [],
    speed: 300,
    altitude: 23000,
    takeoffTime: '',
  });
  const [flightInfo, setFlightInfo] = useState(null);

  const calculateFlightInfo = () => {
    const { departure, arrival, waypoints, speed, altitude, takeoffTime } = flightPlan;
    if (!departure || !arrival || speed <= 0 || altitude <= 0 || !takeoffTime) return;
  
    const points = [departure, ...waypoints, arrival];
    let totalDistance = 0;
    let currentTime = new Date(`2000-01-01T${takeoffTime}`);
    const legs = [];
  
    for (let i = 0; i < points.length - 1; i++) {
      const start = points[i];
      const end = points[i + 1];
      const distance = calculateDistance(start, end);
      const magneticHeading = calculateMagneticHeading(start, end);
      const legTime = (distance / speed) * 60 * 60 * 1000; // Convert to milliseconds
      const ete = new Date(legTime).toISOString().substr(11, 8);
      currentTime = new Date(currentTime.getTime() + legTime);
  
      totalDistance += distance;
      legs.push({
        from: start.name,
        to: end.name,
        fromLat: start.lat,
        fromLng: start.lng,
        toLat: end.lat,
        toLng: end.lng,
        distance: distance.toFixed(2),
        magneticHeading: magneticHeading.toFixed(0),
        ete: ete,
        eta: currentTime.toLocaleTimeString('en-US', { hour12: false })
      });
    }
  
    setFlightInfo({
      totalDistance: totalDistance.toFixed(2),
      totalTime: new Date(totalDistance / speed * 60 * 60 * 1000).toISOString().substr(11, 8),
      legs: legs
    });
  };

  return { flightPlan, setFlightPlan, flightInfo, calculateFlightInfo };
};

export default useFlightPlan;