import * as TabsPrimitive from '@radix-ui/react-tabs';
import React from 'react';
import { FlightPlan } from '../../types/index';
import { calculateAirspeeds, calculateMach, calculateTAS, cn, formatTime } from '../../utils';
import PlanningTab from '../flight/PlanningTab';
import MapTab from '../map/MapTab';
import LearningTabMDX from '../mdx/LearningTabMDX';

const Tabs = TabsPrimitive.Root;

const TabsList = ({ className, ...props }: React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>) => (
  <TabsPrimitive.List
    className={cn(
      'inline-flex h-12 items-center justify-center rounded-lg bg-gray-100 p-1',
      className
    )}
    {...props}
  />
);

const TabsTrigger = ({ className, ...props }: React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>) => (
  <TabsPrimitive.Trigger
    className={cn(
      'inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium ring-offset-white transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:shadow-sm',
      className
    )}
    {...props}
  />
);

const TabsContent = ({ className, ...props }: React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>) => (
  <TabsPrimitive.Content
    className={cn(
      'mt-2 ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:ring-offset-2',
      className
    )}
    {...props}
  />
);

interface TabsProps {
}

const TabsComponent: React.FC<TabsProps> = () => {
  const [activeTab, setActiveTab] = React.useState<string>('planning');

  const [flightPlan, setFlightPlan] = React.useState<FlightPlan>(() => {
    // 初期設定値
    const initialSpeed = 250;
    const initialAltitude = 30000;
    const initialGroundTempC = 15;
    const initialGroundElevationFt = 0;

    // 高精度計算モデルで各種値を計算
    const airspeedsResult = calculateAirspeeds(initialSpeed, initialAltitude, initialGroundTempC, initialGroundElevationFt);

    // 高精度計算が失敗した場合は従来の計算方法で代替
    const initialTas = airspeedsResult
      ? airspeedsResult.tasKt
      : calculateTAS(initialSpeed, initialAltitude);
    const initialMach = airspeedsResult
      ? airspeedsResult.mach
      : calculateMach(initialTas, initialAltitude);
    const departureTime = formatTime(
      new Date().getHours() * 60 + new Date().getMinutes()
    );

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
    };
  });

  return (
    <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-8">
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-4 sm:space-x-8" aria-label="Tabs">
          <button
            className={`${activeTab === 'planning' ? 'border-indigo-500' : 'border-transparent'} whitespace-nowrap border-b-2 px-1 py-3 sm:py-4 font-medium text-xs sm:text-sm text-whiskyPapa-yellow`}
            onClick={() => setActiveTab('planning')}
          >
            Planning
          </button>
          <button
            className={`${activeTab === 'map' ? 'border-indigo-500' : 'border-transparent'} whitespace-nowrap border-b-2 px-1 py-3 sm:py-4 font-medium text-xs sm:text-sm text-whiskyPapa-yellow`}
            onClick={() => setActiveTab('map')}
          >
            Map
          </button>
          <button
            className={`${activeTab === 'learning' ? 'border-indigo-500' : 'border-transparent'} whitespace-nowrap border-b-2 px-1 py-3 sm:py-4 font-medium text-xs sm:text-sm text-whiskyPapa-yellow`}
            onClick={() => setActiveTab('learning')}
          >
            Learning
          </button>
        </nav>
      </div>

      <div className="mt-2 sm:mt-4">
        {activeTab === 'planning' && (
          <PlanningTab
            flightPlan={flightPlan}
            setFlightPlan={setFlightPlan}
          />
        )}
        {activeTab === 'map' && (
          <MapTab flightPlan={flightPlan} setFlightPlan={setFlightPlan} />
        )}
        {activeTab === 'learning' && (
          <LearningTabMDX contentId="" />
        )}
      </div>
    </div>
  );
};

export default TabsComponent;

export { Tabs, TabsContent, TabsList, TabsTrigger };

