import * as TabsPrimitive from '@radix-ui/react-tabs';
import { cn } from '../utils';
import React from 'react';
import PlanningTab from './PlanningTab';
import MapTab from './MapTab';
import { FlightPlan } from '../types';
import { calculateTAS, calculateMach, formatTime } from '../utils';

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
      'inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium ring-offset-white transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm',
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

  // FlightPlan Stateの初期化処理をTabsコンポーネントに移動
  const [flightPlan, setFlightPlan] = React.useState<FlightPlan>(() => {
    const initialSpeed = 250;
    const initialAltitude = 30000;
    const initialTas = calculateTAS(initialSpeed, initialAltitude);
    const initialMach = calculateMach(initialTas, initialAltitude);

    return {
      departure: null,
      arrival: null,
      waypoints: [],
      altitude: initialAltitude,
      speed: initialSpeed,
      tas: initialTas,
      mach: initialMach,
      totalDistance: 0,
      ete: undefined,
      eta: undefined,
      departureTime: formatTime(new Date().getHours() * 60 + new Date().getMinutes()),
    };
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          <button
            className={`${activeTab === 'planning' ? 'border-indigo-500 text-indigo-500' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap border-b-2 px-1 py-4 font-medium text-sm`}
            onClick={() => setActiveTab('planning')}
          >
            Planning
          </button>
          <button
            className={`${activeTab === 'map' ? 'border-indigo-500 text-indigo-500' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap border-b-2 px-1 py-4 font-medium text-sm`}
            onClick={() => setActiveTab('map')}
          >
            Map
          </button>
        </nav>
      </div>

      <div className="mt-4">
        {activeTab === 'planning' && (
          <PlanningTab
            flightPlan={flightPlan}
            setFlightPlan={setFlightPlan}
          />
        )}
        {activeTab === 'map' && (
          <MapTab flightPlan={flightPlan} />
        )}
      </div>
    </div>
  );
};

export default TabsComponent;

export { Tabs, TabsList, TabsTrigger, TabsContent };