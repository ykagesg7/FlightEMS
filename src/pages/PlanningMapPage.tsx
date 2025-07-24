import React, { useContext, useState } from 'react';
import PlanningTab from '../components/flight/PlanningTab';
import MapTab from '../components/map/MapTab';
import { ThemeContext } from "../contexts/ThemeContext"; // 大文字小文字一致済
import { WeatherCacheProvider } from '../contexts/WeatherCacheContext';
import { FlightPlan } from '../types/index';
import { calculateAirspeeds, calculateMach, calculateTAS, formatTime } from '../utils';

type TabKey = 'planning' | 'map';

function PlanningMapPage() {
  const [activeTab, setActiveTab] = useState<TabKey>('planning');

  const [flightPlan, setFlightPlan] = React.useState<FlightPlan>(() => {
    const initialSpeed = 250;
    const initialAltitude = 30000;
    const initialGroundTempC = 15;
    const initialGroundElevationFt = 0;
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
    };
  });

  const themeContext = useContext(ThemeContext);
  const effectiveTheme = themeContext?.effectiveTheme ?? "day";
  const bgColor = effectiveTheme === "dark" ? "#000" : "#14213d";
  const textColor = effectiveTheme === "dark" ? "#FF3B3B" : "#39FF14";

  const renderContent = () => {
    switch (activeTab) {
      case 'planning':
        return (
          <WeatherCacheProvider>
            <PlanningTab flightPlan={flightPlan} setFlightPlan={setFlightPlan} />
          </WeatherCacheProvider>
        );
      case 'map':
        return (
          <WeatherCacheProvider>
            <MapTab flightPlan={flightPlan} setFlightPlan={setFlightPlan} />
          </WeatherCacheProvider>
        );
      default:
        return null;
    }
  };

  return (
    <div
      className={`min-h-screen flex flex-col`}
      style={{ background: bgColor, color: textColor, position: 'relative' }}
    >
      {/* ヘッダー下のHUDライン */}
      <div
        style={{
          height: '0.5px',
          background: effectiveTheme === 'dark' ? '#FF3B3B' : '#39FF14',
          width: '100%',
          margin: 0,
          padding: 0,
        }}
      />
      {/* 左右のHUDライン */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '0.5px',
          height: '100%',
          background: effectiveTheme === 'dark' ? '#FF3B3B' : '#39FF14',
          zIndex: 10,
        }}
      />
      <div
        style={{
          position: 'absolute',
          top: 0,
          right: 0,
          width: '0.5px',
          height: '100%',
          background: effectiveTheme === 'dark' ? '#FF3B3B' : '#39FF14',
          zIndex: 10,
        }}
      />
      <div className={`bg-indigo-800 flex ${activeTab === 'map' ? 'mb-0' : 'mb-2'}`}>
        <button
          className={`flex-1 px-2 sm:px-4 py-2 text-sm sm:text-base font-medium transition-colors duration-200
            ${activeTab === 'planning'
              ? 'bg-white text-indigo-800 rounded-t-md border-t-2 border-l-2 border-r-2 border-indigo-300'
              : 'bg-indigo-700 text-white hover:bg-indigo-600'}`}
          onClick={() => setActiveTab('planning')}
        >
          <span className="flex items-center justify-center">
            <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <span className="hidden xs:inline">Planning</span>
            <span className="xs:hidden">計画</span>
          </span>
        </button>
        <button
          className={`flex-1 px-2 sm:px-4 py-2 text-sm sm:text-base font-medium transition-colors duration-200
            ${activeTab === 'map'
              ? 'bg-white text-indigo-800 rounded-t-md border-t-2 border-l-2 border-r-2 border-indigo-300'
              : 'bg-indigo-700 text-white hover:bg-indigo-600'}`}
          onClick={() => setActiveTab('map')}
        >
          <span className="flex items-center justify-center">
            <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
            </svg>
            <span className="hidden xs:inline">Map</span>
            <span className="xs:hidden">地図</span>
          </span>
        </button>
      </div>
      <div className={`flex-grow ${activeTab === 'map' ? 'p-0' : 'p-2 sm:p-4 md:p-6 container mx-auto'}`}>
        <div className={activeTab === 'map' ? 'h-full' : ''}>
          {renderContent()}
        </div>
      </div>
      {/* フッター上のHUDライン */}
      <div
        style={{
          height: '0.5px',
          background: effectiveTheme === 'dark' ? '#FF3B3B' : '#39FF14',
          width: '100%',
          margin: 0,
          padding: 0,
        }}
      />
    </div>
  );
}

export default PlanningMapPage;
