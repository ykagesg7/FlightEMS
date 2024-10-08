import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const FlightPlanForm = ({ flightPlan, setFlightPlan, airbases, navaids, calculateFlightInfo }) => {
  const [selectedNavaid, setSelectedNavaid] = useState('');
  const [bearing, setBearing] = useState('');
  const [distance, setDistance] = useState('');
  const [selectedWaypoint, setSelectedWaypoint] = useState(null);

  const handleAirportSelect = (type, value) => {
    const [lat, lng, name] = value.split(',');
    setFlightPlan(prev => ({
      ...prev,
      [type]: { lat: parseFloat(lat), lng: parseFloat(lng), name }
    }));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFlightPlan(prev => ({
      ...prev,
      [name]: name === 'takeoffTime' ? value : value === '' ? '' : parseFloat(value)
    }));
  };

  const adjustValue = (name, increment) => {
    setFlightPlan(prev => {
      const currentValue = prev[name];
      let newValue;
      if (name === 'speed') {
        newValue = Math.max(0, currentValue + increment * 10);
      } else if (name === 'altitude') {
        newValue = Math.max(0, currentValue + increment * 500);
      }
      return { ...prev, [name]: newValue };
    });
  };

  const handleWaypointNameChange = (index, newName) => {
    setFlightPlan(prev => ({
      ...prev,
      waypoints: prev.waypoints.map((wp, i) => 
        i === index ? { ...wp, name: newName } : wp
      )
    }));
  };

  const addWaypointFromNavaid = () => {
    if (!selectedNavaid || !navaids) {
      return;
    }
  
    const navaid = navaids.find(n => n.id === selectedNavaid);
    if (!navaid) {
      return;
    }
  
    let newWaypoint;
  
    if (bearing === '' || distance === '') {
      newWaypoint = {
        lat: navaid.lat,
        lng: navaid.lng,
        name: `${navaid.name} Waypoint`,
      };
    } else {
      const bearingRad = (parseFloat(bearing) * Math.PI) / 180;
      const distanceNM = parseFloat(distance);
  
      const R = 3440.065; // Earth's radius in nautical miles
      const lat1 = (navaid.lat * Math.PI) / 180;
      const lon1 = (navaid.lng * Math.PI) / 180;
      const lat2 = Math.asin(
        Math.sin(lat1) * Math.cos(distanceNM / R) +
        Math.cos(lat1) * Math.sin(distanceNM / R) * Math.cos(bearingRad)
      );
      const lon2 = lon1 + Math.atan2(
        Math.sin(bearingRad) * Math.sin(distanceNM / R) * Math.cos(lat1),
        Math.cos(distanceNM / R) - Math.sin(lat1) * Math.sin(lat2)
      );
  
      newWaypoint = {
        lat: (lat2 * 180) / Math.PI,
        lng: (lon2 * 180) / Math.PI,
        name: `Waypoint ${flightPlan.waypoints.length + 1}`,
      };
    }
  
    setFlightPlan(prev => ({
      ...prev,
      waypoints: [...prev.waypoints, newWaypoint]
    }));
  
    // Reset input fields
    setSelectedNavaid('');
    setBearing('');
    setDistance('');
  };

  const updateWaypoint = () => {
    if (selectedWaypoint === null) return;

    const updatedWaypoint = {
      ...flightPlan.waypoints[selectedWaypoint],
      name: selectedNavaid ? `${selectedNavaid} Waypoint` : flightPlan.waypoints[selectedWaypoint].name,
    };

    if (bearing !== '' && distance !== '') {
      const navaid = navaids.find(n => n.id === selectedNavaid);
      if (navaid) {
        const bearingRad = (parseFloat(bearing) * Math.PI) / 180;
        const distanceNM = parseFloat(distance);

        const R = 3440.065; // Earth's radius in nautical miles
        const lat1 = (navaid.lat * Math.PI) / 180;
        const lon1 = (navaid.lng * Math.PI) / 180;
        const lat2 = Math.asin(
          Math.sin(lat1) * Math.cos(distanceNM / R) +
          Math.cos(lat1) * Math.sin(distanceNM / R) * Math.cos(bearingRad)
        );
        const lon2 = lon1 + Math.atan2(
          Math.sin(bearingRad) * Math.sin(distanceNM / R) * Math.cos(lat1),
          Math.cos(distanceNM / R) - Math.sin(lat1) * Math.sin(lat2)
        );

        updatedWaypoint.lat = (lat2 * 180) / Math.PI;
        updatedWaypoint.lng = (lon2 * 180) / Math.PI;
      }
    }

    setFlightPlan(prev => ({
      ...prev,
      waypoints: prev.waypoints.map((wp, index) => 
        index === selectedWaypoint ? updatedWaypoint : wp
      )
    }));

    // Reset input fields and selection
    setSelectedWaypoint(null);
    setSelectedNavaid('');
    setBearing('');
    setDistance('');
  };

  const deleteWaypoint = () => {
    if (selectedWaypoint === null) return;

    setFlightPlan(prev => ({
      ...prev,
      waypoints: prev.waypoints.filter((_, index) => index !== selectedWaypoint)
    }));

    // Reset selection
    setSelectedWaypoint(null);
  };

  return (
    <Card className="m-4">
      <CardHeader>
        <CardTitle>飛行計画</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <Label htmlFor="departure">出発空港</Label>
            <Select onValueChange={(value) => handleAirportSelect('departure', value)}>
              <SelectTrigger id="departure">
                <SelectValue placeholder="出発空港を選択" />
              </SelectTrigger>
              <SelectContent>
                {airbases.map(airbase => (
                  <SelectItem key={airbase.id} value={`${airbase.lat},${airbase.lng},${airbase.name}`}>
                    {airbase.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="arrival">到着空港</Label>
            <Select onValueChange={(value) => handleAirportSelect('arrival', value)}>
              <SelectTrigger id="arrival">
                <SelectValue placeholder="到着空港を選択"  />
              </SelectTrigger>
              <SelectContent>
                {airbases.map(airbase => (
                  <SelectItem key={airbase.id} value={`${airbase.lat},${airbase.lng},${airbase.name}`}>
                    {airbase.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="speed">速度 (ノット)</Label>
            <div className="flex items-center space-x-2">
              <Input
                id="speed"
                name="speed"
                type="number"
                value={flightPlan.speed}
                onChange={handleInputChange}
              />
              <Button onClick={() => adjustValue('speed', -1)}>-</Button>
              <Button onClick={() => adjustValue('speed', 1)}>+</Button>
            </div>
          </div>
          <div>
            <Label htmlFor="altitude">高度 (フィート)</Label>
            <div className="flex items-center space-x-2">
              <Input
                id="altitude"
                name="altitude"
                type="number"
                value={flightPlan.altitude}
                onChange={handleInputChange}
              />
              <Button onClick={() => adjustValue('altitude', -1)}>-</Button>
              <Button onClick={() => adjustValue('altitude', 1)}>+</Button>
            </div>
          </div>
          <div>
            <Label htmlFor="takeoffTime">離陸時刻</Label>
            <Input
              id="takeoffTime"
              name="takeoffTime"
              type="time"
              value={flightPlan.takeoffTime}
              onChange={handleInputChange}
            />
          </div>
          <div>
            <Label htmlFor="navaid">Navaidからウェイポイントを追加/編集</Label>
            <Select value={selectedNavaid} onValueChange={setSelectedNavaid}>
              <SelectTrigger id="navaid">
                <SelectValue placeholder="Navaidを選択" />
              </SelectTrigger>
              <SelectContent>
                {navaids && navaids.map(navaid => (
                  <SelectItem key={navaid.id} value={navaid.id}>
                    {navaid.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              id="bearing"
              type="number"
              placeholder="方位 (度)"
              className="mt-2"
              value={bearing}
              onChange={(e) => setBearing(e.target.value)}
            />
            <Input
              id="distance"
              type="number"
              placeholder="距離 (海里)"
              className="mt-2"
              value={distance}
              onChange={(e) => setDistance(e.target.value)}
            />
            <div className="flex gap-2 mt-2">
              <Button onClick={addWaypointFromNavaid}>ウェイポイント追加</Button>
              <Button onClick={updateWaypoint} disabled={selectedWaypoint === null}>ウェイポイント更新</Button>
              <Button onClick={deleteWaypoint} disabled={selectedWaypoint === null}>ウェイポイント削除</Button>
            </div>
          </div>
          <div>
            <Label>ウェイポイント</Label>
            {flightPlan.waypoints.map((waypoint, index) => (
              <div key={index} className="flex items-center space-x-2 mt-2">
                <Input
                  value={waypoint.name}
                  onChange={(e) => handleWaypointNameChange(index, e.target.value)}
                />
                <span>{waypoint.lat.toFixed(4)}, {waypoint.lng.toFixed(4)}</span>
                <Button onClick={() => setSelectedWaypoint(index)}>選択</Button>
              </div>
            ))}
          </div>
          <Button onClick={calculateFlightInfo}>飛行情報を計算</Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default FlightPlanForm;