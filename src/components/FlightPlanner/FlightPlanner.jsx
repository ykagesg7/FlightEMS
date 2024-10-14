"use client"

import React, { useState, useEffect } from 'react';
import { MapContainer } from 'react-leaflet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import FlightPlannerContent from './FlightPlannerContent';
import FlightPlanForm from './FlightPlanForm';
import FlightInfoDisplay from './FlightInfoDisplay';
import useFlightPlan from '../../hooks/useFlightPlan';
import useMapData from '../../hooks/useMapData';

const FlightPlanner = () => {
  const { flightPlan, setFlightPlan, flightInfo, calculateFlightInfo } = useFlightPlan();
  const { airbases, navaids, navaidsData, airportsData, accSectorHighData, accSectorLowData, trainingAreaHigh, trainingAreaLow, trainingAreaCivil } = useMapData();
  const [activeTab, setActiveTab] = useState('plan');
  const [mapKey, setMapKey] = useState(0);

  useEffect(() => {
    if (activeTab === 'map') {
      setMapKey(prev => prev + 1);
    }
  }, [activeTab]);

  return (
    <div className="h-screen flex flex-col">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-grow flex flex-col">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="plan">計画</TabsTrigger>
          <TabsTrigger value="map">地図</TabsTrigger>
        </TabsList>
        <TabsContent value="plan" className="flex-grow overflow-auto">
          <FlightPlanForm
            flightPlan={flightPlan}
            setFlightPlan={setFlightPlan}
            airbases={airbases}
            navaids={navaids}
            calculateFlightInfo={calculateFlightInfo}
          />
          <FlightInfoDisplay flightInfo={flightInfo} />
        </TabsContent>
        <TabsContent value="map" className="flex-grow">
          {activeTab === 'map' && (
            <MapContainer 
              key={mapKey}
              center={[36.2048, 138.2529]} 
              zoom={5} 
              style={{ height: '100%', width: '100%' }}
              maxBounds={[[20, 122], [46, 154]]}
              minZoom={5}
            >
              <FlightPlannerContent
                onWaypointAdd={calculateFlightInfo}
                flightPlan={flightPlan}
                setFlightPlan={setFlightPlan}
                flightInfo={flightInfo}
                navaidsData={navaidsData}
                airportsData={airportsData}
                accSectorHighData={accSectorHighData}
                accSectorLowData={accSectorLowData}
                trainingAreaHigh={trainingAreaHigh}
                trainingAreaLow={trainingAreaLow}
                trainingAreaCivil={trainingAreaCivil}
              />
            </MapContainer>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FlightPlanner;