import React, { useState } from 'react';
import './App.css';
import './index.css';
import { WeatherCacheProvider } from './contexts/WeatherCacheContext';
import PlanningTab from './components/flight/PlanningTab';
import MapTab from './components/map/MapTab';
import LearningTabMDX from './components/mdx/LearningTabMDX';
import { FlightPlan } from './types';
import { calculateTAS, calculateMach, formatTime, calculateAirspeeds } from './utils';

type TabKey = 'planning' | 'map' | 'learning';

function App() {
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
      departure: null, arrival: null, waypoints: [],
      altitude: initialAltitude, speed: initialSpeed, tas: initialTas, mach: initialMach,
      totalDistance: 0, ete: undefined, eta: undefined, departureTime,
      groundTempC: initialGroundTempC, groundElevationFt: initialGroundElevationFt,
    };
  });

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
      case 'learning':
        return <LearningTabMDX />;
      default:
        return null;
    }
  };

  const TabButton: React.FC<{ tabKey: TabKey; label: string }> = ({ tabKey, label }) => (
    <button
      className={`px-4 py-2 font-medium rounded-md transition-colors duration-200 ${activeTab === tabKey ? 'bg-indigo-700 text-white' : 'text-indigo-200 hover:bg-indigo-800 hover:text-white'}`}
      onClick={() => setActiveTab(tabKey)}
    >
      {label}
    </button>
  );

  return (
    <div className="App bg-gradient-to-br from-indigo-100 to-purple-100 min-h-screen flex flex-col">
      <header className="bg-indigo-900 text-white shadow-lg sticky top-0 z-10">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-bold">Flight Academy</h1>
            <nav className="flex space-x-2">
              <TabButton tabKey="planning" label="Planning" />
              <TabButton tabKey="map" label="Map" />
              <TabButton tabKey="learning" label="Learning" />
            </nav>
          </div>
          <div>
          </div>
        </div>
      </header>
      <main className="container mx-auto p-4 md:p-8 flex-grow">
        {renderContent()}
      </main>
      <footer className="bg-indigo-900 text-white text-center py-4">
        <p>&copy; 2024 Flight Academy. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default App;
