import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { calculateTAS, calculateBearingAndDistance } from '@/utils/calculations';
import { v4 as uuidv4 } from 'uuid';

const FlightPlanForm = ({ flightPlan, setFlightPlan, airbases, navaids, calculateFlightInfo }) => {

  const [selectedNavaid, setSelectedNavaid] = useState('');
  const [bearing, setBearing] = useState('');
  const [distance, setDistance] = useState('');
  const [selectedWaypoint, setSelectedWaypoint] = useState(null);
  const [flightPerformance, setFlightPerformance] = useState({ tas: 0, mach: 0 });
  const [latitudeDMS, setLatitudeDMS] = useState('');
  const [longitudeDMS, setLongitudeDMS] = useState('');
  const [latitudeDegree, setLatitudeDegree] = useState('');
  const [longitudeDegree, setLongitudeDegree] = useState('');
  const [departureAirportType, setDepartureAirportType] = useState('all');
  const [arrivalAirportType, setArrivalAirportType] = useState('all');
  const [navaidTypeFilter, setNavaidTypeFilter] = useState('all');
  const [coordinateInputMode, setCoordinateInputMode] = useState('DDMMSS');

  // useEffectフックを使用して、speedまたはaltitudeが変更されたときに性能を計算
  useEffect(() => {
    if (flightPlan.speed && flightPlan.altitude) {
      const performance = calculateTAS(flightPlan.speed, flightPlan.altitude);
      setFlightPerformance(performance);
    }
  }, [flightPlan.speed, flightPlan.altitude]);

  const handleAirportSelect = (type, value) => {
    const [lat, lng, name] = value.split(',');
    setFlightPlan(prev => ({
      ...prev, [type]: { lat: parseFloat(lat), lng: parseFloat(lng), name }
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
  
    const navaid = navaids.features.find(n => n.properties.id === selectedNavaid);
    if (!navaid) {
      return;
    }
  
    let newWaypoint;
  
    if (bearing === '' || distance === '') {
      newWaypoint = {
        id: uuidv4(), // 一意な ID を生成
        lat: navaid.geometry.coordinates[1],
        lng: navaid.geometry.coordinates[0],
        name: `${navaid.properties.name} Waypoint`,
      };
    } else {
      const bearingRad = (parseFloat(bearing) * Math.PI) / 180;
      const distanceNM = parseFloat(distance);

      const R = 3440.065; // Earth's radius in nautical miles
      const lat1 = (navaid.geometry.coordinates[1] * Math.PI) / 180;
      const lon1 = (navaid.geometry.coordinates[0] * Math.PI) / 180;
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
  
    // 入力データのリセット処理
    //setSelectedNavaid('');
    //setBearing('');
    //setDistance('');
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

  const convertDMStoDD = (dms) => {
    const parts = dms.match(/(\d{2,3})(\d{2})(\d{2})/);
    if (!parts) {
      throw new Error('Invalid DMS format');
    }
    const degrees = parseInt(parts[1], 10);
    const minutes = parseInt(parts[2], 10);
    const seconds = parseInt(parts[3], 10);
    
    if (minutes >= 60 || seconds >= 60) {
      throw new Error('Invalid minutes or seconds');
    }

    let dd = degrees + minutes/60 + seconds/3600;
    
    return dd;
  };

  const addWaypointFromCoordinates = () => {
    let latNum = null;
    let lngNum = null;

    if (coordinateInputMode === 'DDMMSS') {
      const latMatch = latitudeDMS.match(/(\d{2})(\d{2})(\d{2})/);
      const lngMatch = longitudeDMS.match(/(\d{3})(\d{2})(\d{2})/);
      if (latMatch && lngMatch) {
        latNum = parseInt(latMatch[1], 10) + parseInt(latMatch[2], 10) / 60 + parseInt(latMatch[3], 10) / 3600;
        lngNum = parseInt(lngMatch[1], 10) + parseInt(lngMatch[2], 10) / 60 + parseInt(lngMatch[3], 10) / 3600;
      }
    } else if (coordinateInputMode === 'Degree') {
      latNum = parseFloat(latitudeDegree);
      lngNum = parseFloat(longitudeDegree);
    }

    if (latNum !== null && lngNum !== null) {
      const newWaypoint = {
        id: uuidv4(), // 一意な ID を生成
        name: `WP${flightPlan.waypoints.length + 1}`,
        lat: latNum,
        lng: lngNum,
      };
      setFlightPlan(prev => ({ ...prev, waypoints: [...prev.waypoints, newWaypoint] }));
      setLatitudeDMS('');
      setLongitudeDMS('');
      setLatitudeDegree('');
      setLongitudeDegree('');
    } else {
      alert('緯度または経度の形式が正しくありません。');
    }
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
            <div className='space-x-4'>
              <label>
                <input
                  type="radio"
                  value="JASDF"
                  checked={departureAirportType === 'JASDF'}
                  onChange={() => setDepartureAirportType('JASDF')}
                />
                JASDF
              </label>

              <label>
                <input
                  type="radio"
                  value="JMSDF"
                  checked={departureAirportType === 'JMSDF'}
                  onChange={() => setDepartureAirportType('JMSDF')}
                />
                JMSDF
              </label>

              <label>
                <input
                  type="radio"
                  value="USF"
                  checked={departureAirportType === 'USF'}
                  onChange={() => setDepartureAirportType('USF')}
                />
                米軍
              </label>

              <label>
                <input
                  type="radio"
                  value="JGSDF"
                  checked={departureAirportType === 'JGSDF'}
                  onChange={() => setDepartureAirportType('JGSDF')}
                />
                JGSDF
              </label>

              <label>
                <input
                  type="radio"
                  value="CIVIL"
                  checked={departureAirportType === 'CIVIL'}
                  onChange={() => setDepartureAirportType('CIVIL')}
                />
                民間飛行場
              </label>

              <label>
                <input
                  type="radio"
                  value="airport"
                  checked={departureAirportType === 'airport'}
                  onChange={() => setDepartureAirportType('airport')}
                />
                その他の飛行場
              </label>

              <label>
                <input
                  type="radio"
                  value="heli"
                  checked={departureAirportType === 'heli'}
                  onChange={() => setDepartureAirportType('heli')}
                />
                ヘリポート
              </label>

              <label>
                <input
                  type="radio"
                  value="all"
                  checked={departureAirportType === 'all'}
                  onChange={() => setDepartureAirportType('all')}
                />
                すべて
              </label>

            </div>
            <Select onValueChange={(value) => handleAirportSelect('departure', value)}>
              <SelectTrigger id="departure">
                <SelectValue placeholder="出発空港を選択" />
              </SelectTrigger>
              <SelectContent>
                {airbases
                  .filter(airbase => departureAirportType === 'all' || (departureAirportType === 'JASDF' && airbase.type === 'JASDF') || (departureAirportType === 'JMSDF' && airbase.type === 'JMSDF') || (departureAirportType === 'USF' && airbase.type === 'USF') || (departureAirportType === 'JGSDF' && airbase.type === 'JGSDF') || (departureAirportType === 'CIVIL' && airbase.type === 'CIVIL') || (departureAirportType === 'airport' && airbase.type === '空港') || (departureAirportType === 'heli' && airbase.type === 'ヘリ') )
                  
                  .map(airbase => (
                    <SelectItem key={airbase.id} value={`${airbase.lat},${airbase.lng},${airbase.name}`}>
                      {airbase.id} ({airbase.name})
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="arrival">到着空港</Label>
              <div className='space-x-4'>
                <label>
                  <input
                    type="radio"
                    value="JASDF"
                    checked={arrivalAirportType === 'JASDF'}
                    onChange={() => setArrivalAirportType('JASDF')}
                  />
                  JASDF
                </label>

                <label>
                  <input
                    type="radio"
                    value="JMSDF"
                    checked={arrivalAirportType === 'JMSDF'}
                    onChange={() => setArrivalAirportType('JMSDF')}
                  />
                  JMSDF
                </label>

                <label>
                  <input
                    type="radio"
                    value="USF"
                    checked={arrivalAirportType === 'USF'}
                    onChange={() => setArrivalAirportType('USF')}
                  />
                  米軍
                </label>

                <label>
                  <input
                    type="radio"
                    value="JGSDF"
                    checked={arrivalAirportType === 'JGSDF'}
                    onChange={() => setArrivalAirportType('JGSDF')}
                  />
                  JGSDF
                </label>

                <label>
                  <input
                    type="radio"
                    value="CIVIL"
                    checked={arrivalAirportType === 'CIVIL'}
                    onChange={() => setArrivalAirportType('CIVIL')}
                  />
                  民間飛行場
                </label>

                <label>
                  <input
                    type="radio"
                    value="airport"
                    checked={arrivalAirportType === 'airport'}
                    onChange={() => setArrivalAirportType('airport')}
                  />
                  その他の飛行場
                </label>

                <label>
                  <input
                    type="radio"
                    value="heli"
                    checked={arrivalAirportType === 'heli'}
                    onChange={() => setArrivalAirportType('heli')}
                  />
                  ヘリポート
                </label>

                <label>
                  <input
                    type="radio"
                    value="all"
                    checked={arrivalAirportType === 'all'}
                    onChange={() => setArrivalAirportType('all')}
                  />
                  すべて
                </label>

              </div>
              <Select onValueChange={(value) => handleAirportSelect('arrival', value)}>
                <SelectTrigger id="arrival">
                  <SelectValue placeholder="到着空港を選択" />
                </SelectTrigger>
                <SelectContent>
                  {airbases
                    .filter(airbase => arrivalAirportType === 'all' || (arrivalAirportType === 'JASDF' && airbase.type === 'JASDF') || (arrivalAirportType === 'JMSDF' && airbase.type === 'JMSDF') || (arrivalAirportType === 'USF' && airbase.type === 'USF') || (arrivalAirportType === 'JGSDF' && airbase.type === 'JGSDF') ||(arrivalAirportType === 'CIVIL' && airbase.type === 'CIVIL') || (arrivalAirportType === 'airport' && airbase.type === '空港') || (arrivalAirportType === 'heli' && airbase.type === 'ヘリ') )
                    .map(airbase => (
                      <SelectItem key={airbase.id} value={`${airbase.lat},${airbase.lng},${airbase.name}`}>
                        {airbase.id} ({airbase.name})
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
            {flightPlan.speed && flightPlan.altitude && (
              <div className="text-sm text-gray-600 mt-1">
                TAS: {flightPerformance.tas} KT / Mach: {flightPerformance.mach}
              </div>
            )}
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
            <Label htmlFor="navaid">Navaidからポイントを追加/編集</Label>
            <Select value={selectedNavaid} onValueChange={setSelectedNavaid}>
              <SelectTrigger id="navaid">
                <SelectValue placeholder="Navaidを選択" />
              </SelectTrigger>
              <SelectContent>
                <div>
                  <label>
                    <input type="radio" value="all" checked={navaidTypeFilter === 'all'} onChange={(e) => setNavaidTypeFilter(e.target.value)} /> すべて
                  </label>
                  <label>
                    <input type="radio" value="VOR" checked={navaidTypeFilter === 'VOR'} onChange={(e) => setNavaidTypeFilter(e.target.value)} /> VOR
                  </label>
                  <label>
                    <input type="radio" value="TACAN" checked={navaidTypeFilter === 'TACAN'} onChange={(e) => setNavaidTypeFilter(e.target.value)} /> TACAN
                  </label>
                  <label>
                    <input type="radio" value="VORTAC" checked={navaidTypeFilter === 'VORTAC'} onChange={(e) => setNavaidTypeFilter(e.target.value)} /> VORTAC
                  </label>
                </div>
                {navaids && navaids.features && Array.isArray(navaids.features) && navaids.features
                .filter(navaid => navaidTypeFilter === 'all' || navaid.properties.type === navaidTypeFilter)
                .map(navaid => (
                  <SelectItem key={navaid.properties.id} value={navaid.properties.id}>
                    {navaid.properties.name} ({navaid.properties.id}) - {navaid.properties.ch}
                  </SelectItem>
                ))}
              </SelectContent >
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
          
          <div >
            < Label>座標からウェイポイントを追加</Label>
            <div className="space-x-4">
              <label>
                <input
                  type="radio"
                  value="DDMMSS"
                  checked={coordinateInputMode === 'DDMMSS'}
                  onChange={() => setCoordinateInputMode('DDMMSS')}
                />
                DDMMSS
              </label>
              <label>
                <input
                  type="radio"
                  value="Degree"
                  checked={coordinateInputMode === 'Degree'}
                  onChange={() => setCoordinateInputMode('Degree')}
                />
                Degree
              </label>
            </div>

            {coordinateInputMode === 'DDMMSS' && (
              <div className="flex space-x-2 mt-2">
                <Input
                  id="latitudeDMS"
                  placeholder="緯度 (DDMMSS)"
                  value={latitudeDMS}
                  onChange={(e) => setLatitudeDMS(e.target.value)}
                />
                <Input
                  id="longitudeDMS"
                  placeholder="経度 (DDDMMSS)"
                  value={longitudeDMS}
                  onChange={(e) => setLongitudeDMS(e.target.value)}
                />
              </div>
            )}

            {coordinateInputMode === 'Degree' && (
              <div className="flex space-x-2 mt-2">
                <Input
                  id="latitudeDegree"
                  placeholder="緯度 (dd.dddd)"
                  value={latitudeDegree}
                  onChange={(e) => setLatitudeDegree(e.target.value)}
                />
                <Input
                  id="longitudeDegree"
                  placeholder="経度 (ddd.dddd)"
                  value={longitudeDegree}
                  onChange={(e) => setLongitudeDegree(e.target.value)}
                />
              </div>
            )}

            <Button onClick={addWaypointFromCoordinates} className="mt-2">ウェイポイント追加</Button>
          </div>

          <div>
            <Label>ウェイポイント</Label>

            {flightPlan.waypoints.map((waypoint) => (
              <div key={waypoint.id} className="flex items-center space-x-2 mt-2">
                <Input
                  value={waypoint.name}
                  onChange={(e) => handleWaypointNameChange(waypoint.id, e.target.value)}
                />
                <span>{waypoint.lat.toFixed(4)}, {waypoint.lng.toFixed(4)}</span>
                <Button onClick={() => setSelectedWaypoint(waypoint.id)}>選択</Button>
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