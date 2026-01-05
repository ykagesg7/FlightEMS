import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/Tabs';
import { WeatherCacheProvider } from '../../contexts/WeatherCacheContext';
import { FlightPlan } from '../../types/index';
import { calculateAirspeeds, calculateMach, calculateTAS, formatTime } from '../../utils';
import PlanningTab from './components/flight/PlanningTab';
import MapTab from './components/map/MapTab';

function PlanningMapPage() {
  const [flightPlan, setFlightPlan] = React.useState<FlightPlan>(() => {
    const initialSpeed = 250;
    const initialAltitude = 30000;
    const initialGroundTempC = 15;
    const initialGroundElevationFt = 0;
    const initialFuelLb = 5000;
    const taxiFuelLb = 200;
    const reserveFuelLb = 800;
    const cruiseFuelFlowLbPerHr = 2200;
    const airspeedsResult = calculateAirspeeds(initialSpeed, initialAltitude, initialGroundTempC, initialGroundElevationFt);
    const initialTas = airspeedsResult ? airspeedsResult.tasKt : calculateTAS(initialSpeed, initialAltitude);
    const initialMach = airspeedsResult ? airspeedsResult.mach : calculateMach(initialTas, initialAltitude);
    const departureTime = formatTime(new Date().getHours() * 60 + new Date().getMinutes());
    return {
      departure: undefined, arrival: undefined, waypoints: [],
      altitude: initialAltitude, speed: initialSpeed, tas: initialTas, mach: initialMach,
      totalDistance: 0, ete: '', eta: '', departureTime,
      groundTempC: initialGroundTempC, groundElevationFt: initialGroundElevationFt,
      routeSegments: [],
      aircraftId: 't4',
      initialFuelLb,
      taxiFuelLb,
      reserveFuelLb,
      cruiseFuelFlowLbPerHr,
    };
  });

  return (
    <div className="min-h-screen flex flex-col relative bg-whiskyPapa-black text-white">
      {/* Mission Dashboardへの戻るボタン */}
      <div className="px-4 pt-4 pb-2">
        <Link
          to="/mission"
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-whiskyPapa-yellow hover:text-whiskyPapa-yellow/80 border border-whiskyPapa-yellow/30 rounded-lg hover:border-whiskyPapa-yellow/50 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Mission Dashboardへ戻る
        </Link>
      </div>

      <div className="mb-2">
        <Tabs defaultValue="planning">
          <TabsList className="bg-transparent border-b border-whiskyPapa-yellow/20 w-full flex">
            <TabsTrigger value="planning" className="flex-1 text-gray-400 data-[state=active]:text-whiskyPapa-yellow data-[state=active]:bg-whiskyPapa-black-dark">
              <span className="flex items-center justify-center">
                <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <span className="hidden xs:inline">Planning</span>
                <span className="xs:hidden">計画</span>
              </span>
            </TabsTrigger>
            <TabsTrigger value="map" className="flex-1 text-gray-400 data-[state=active]:text-whiskyPapa-yellow data-[state=active]:bg-whiskyPapa-black-dark">
              <span className="flex items-center justify-center">
                <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
                <span className="hidden xs:inline">Map</span>
                <span className="xs:hidden">地図</span>
              </span>
            </TabsTrigger>
          </TabsList>
          <TabsContent value="planning" className="mt-0">
            <div className="p-2 sm:p-4 md:p-6 container mx-auto">
              <WeatherCacheProvider>
                <PlanningTab flightPlan={flightPlan} setFlightPlan={setFlightPlan} />
              </WeatherCacheProvider>
            </div>
          </TabsContent>
          <TabsContent value="map" className="mt-0">
            <div className="h-full">
              <WeatherCacheProvider>
                <MapTab flightPlan={flightPlan} setFlightPlan={setFlightPlan} />
              </WeatherCacheProvider>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

export default PlanningMapPage;
