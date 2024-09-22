import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, useMapEvents, Popup, LayersControl, GeoJSON } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const FlightPlannerContent = ({ onWaypointAdd, flightPlan, setFlightPlan }) => {
  const [layers, setLayers] = useState([]);
  const longPressTimeoutRef = useRef(null);
  const isLongPressRef = useRef(false);

  useEffect(() => {
    setLayers([
      { id: 1, name: 'VFR Routes', data: { type: 'FeatureCollection', features: [/* GeoJSON features */] } },
      { id: 2, name: 'Airspace Classes', data: { type: 'FeatureCollection', features: [/* GeoJSON features */] } },
    ]);
  }, []);

  const MapEvents = () => {
    const map = useMapEvents({
      dblclick(e) {
        addWaypoint(e.latlng);
      },
      mousedown(e) {
        isLongPressRef.current = false;
        longPressTimeoutRef.current = setTimeout(() => {
          isLongPressRef.current = true;
          addWaypoint(e.latlng);
        }, 1000);
      },
      mouseup() {
        clearTimeout(longPressTimeoutRef.current);
      },
      mousemove() {
        clearTimeout(longPressTimeoutRef.current);
      },
    });

    return null;
  };

  const addWaypoint = (latlng) => {
    const { lat, lng } = latlng;
    const newWaypoint = {
      lat,
      lng,
      name: `Waypoint ${flightPlan.waypoints.length + 1}`,
    };
    setFlightPlan(prev => ({
      ...prev,
      waypoints: [...prev.waypoints, newWaypoint]
    }));
    onWaypointAdd(newWaypoint);
  };

  const airportIcon = L.icon({
    iconUrl: '/airport-icon.png',
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32]
  });

  const waypointIcon = L.icon({
    iconUrl: '/waypoint-icon.png',
    iconSize: [24, 24],
    iconAnchor: [12, 24],
    popupAnchor: [0, -24]
  });

  return (
    <>
      <MapEvents />
      <LayersControl position="topright">
        <LayersControl.BaseLayer checked name="OpenStreetMap">
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
        </LayersControl.BaseLayer>
        {layers.map((layer) => (
          <LayersControl.Overlay key={layer.id} name={layer.name}>
            <GeoJSON data={layer.data} />
          </LayersControl.Overlay>
        ))}
      </LayersControl>
      {flightPlan.departure && (
        <Marker
          position={[flightPlan.departure.lat, flightPlan.departure.lng]}
          icon={airportIcon}
        >
          <Popup>{flightPlan.departure.name}</Popup>
        </Marker>
      )}
      {flightPlan.arrival && (
        <Marker
          position={[flightPlan.arrival.lat, flightPlan.arrival.lng]}
          icon={airportIcon}
        >
          <Popup>{flightPlan.arrival.name}</Popup>
        </Marker>
      )}
      {flightPlan.waypoints.map((waypoint, index) => (
        <Marker
          key={index}
          position={[waypoint.lat, waypoint.lng]}
          icon={waypointIcon}
        >
          <Popup>{waypoint.name}</Popup>
        </Marker>
      ))}
      {flightPlan.departure && flightPlan.arrival && (
        <Polyline
          positions={[
            [flightPlan.departure.lat, flightPlan.departure.lng],
            ...flightPlan.waypoints.map(wp => [wp.lat, wp.lng]),
            [flightPlan.arrival.lat, flightPlan.arrival.lng]
          ]}
          color="blue"
          weight={3}
          opacity={0.7}
        />
      )}
    </>
  );
};

const FlightPlanner = () => {
  const [flightPlan, setFlightPlan] = useState({
    departure: null,
    arrival: null,
    waypoints: [],
    speed: 0,
    altitude: 0,
    takeoffTime: '',
  });
  const [flightInfo, setFlightInfo] = useState(null);
  const [airbases, setAirbases] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Fetch airbase data
    fetch('/geojson/Airports.geojson')
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.text(); // Get the raw text first
      })
      .then(text => {
        try {
          const data = JSON.parse(text); // Try to parse it as JSON
          const processedAirbases = data.features.map(feature => ({
            id: feature.properties.id,
            name: `${feature.properties.name1} (${feature.properties.name2})`,
            lat: feature.properties["ARP.N(DD)"],
            lng: feature.properties["ARP.E(DD)"]
          }));
          setAirbases(processedAirbases);
        } catch (e) {
          console.error('Error parsing JSON:', e);
          console.log('Received content:', text.substring(0, 100) + '...'); // Log the first 100 characters
          throw new Error('Failed to parse JSON');
        }
      })
      .catch(error => {
        console.error('Error loading airbase data:', error);
        setError(`Failed to load airbase data: ${error.message}`);
      });
  }, []);

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
      [name]: name === 'takeoffTime' ? value : parseFloat(value)
    }));
  };

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
      currentTime = new Date(currentTime.getTime() + legTime);

      totalDistance += distance;
      legs.push({
        from: start.name,
        to: end.name,
        distance: distance.toFixed(2),
        magneticHeading: magneticHeading.toFixed(2),
        eta: currentTime.toLocaleTimeString('en-US', { hour12: false })
      });
    }

    setFlightInfo({
      totalDistance: totalDistance.toFixed(2),
      totalTime: (totalDistance / speed).toFixed(2),
      legs: legs
    });
  };

  const calculateDistance = (point1, point2) => {
    const R = 3440.065; // Earth's radius in nautical miles
    const dLat = (point2.lat - point1.lat) * Math.PI / 180;
    const dLon = (point2.lng - point1.lng) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(point1.lat * Math.PI / 180) * Math.cos(point2.lat * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const calculateMagneticHeading = (point1, point2) => {
    const startLat = point1.lat * Math.PI / 180;
    const startLng = point1.lng * Math.PI / 180;
    const destLat = point2.lat * Math.PI / 180;
    const destLng = point2.lng * Math.PI / 180;

    let y = Math.sin(destLng - startLng) * Math.cos(destLat);
    let x = Math.cos(startLat) * Math.sin(destLat) -
            Math.sin(startLat) * Math.cos(destLat) * Math.cos(destLng - startLng);
    let brng = Math.atan2(y, x);
    brng = brng * 180 / Math.PI;
    brng = (brng + 360) % 360;

    // Apply magnetic declination (example value, should be adjusted based on location and date)
    const magneticDeclination = 7.5;
    return (brng + magneticDeclination + 360) % 360;
  };

  return (
    <div className="h-[calc(100vh-64px)] w-full flex">
      <div className="w-1/3 p-4 overflow-y-auto">
        <Card>
          <CardHeader>
            <CardTitle>Flight Plan</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label htmlFor="departure">Departure</Label>
                <Select onValueChange={(value) => handleAirportSelect('departure', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="出発飛行場を選択してください"/>
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
                <Label htmlFor="arrival">Arrival</Label>
                <Select onValueChange={(value) => handleAirportSelect('arrival', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="到着飛行場を選択してください。" />
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
                <Label htmlFor="speed">Speed (knots)</Label>
                <Input
                  id="speed"
                  name="speed"
                  type="number"
                  value={flightPlan.speed}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <Label htmlFor="altitude">Altitude (ft)</Label>
                <Input
                  id="altitude"
                  name="altitude"
                  type="number"
                  value={flightPlan.altitude}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <Label htmlFor="takeoffTime">Takeoff Time</Label>
                <Input
                  id="takeoffTime"
                  name="takeoffTime"
                  type="time"
                  value={flightPlan.takeoffTime}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <Label>Waypoints</Label>
                {flightPlan.waypoints.map((waypoint, index) => (
                  <div key={index}>{waypoint.name}: {waypoint.lat.toFixed(4)}, {waypoint.lng.toFixed(4)}</div>
                ))}
              </div>
              <Button onClick={calculateFlightInfo}>Calculate Flight Info</Button>
            </div>
          </CardContent>
        </Card>
        {flightInfo && (
          <Card className="mt-4">
            <CardHeader>
              <CardTitle>Flight Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div>Total Distance: {flightInfo.totalDistance} nm</div>
              <div>Total Time: {flightInfo.totalTime} hours</div>
              <div className="mt-2">
                <strong>Leg Information:</strong>
                {flightInfo.legs.map((leg, index) => (
                  <div key={index} className="mt-1">
                    <div>{leg.from} to {leg.to}</div>
                    <div>Distance: {leg.distance} nm</div>
                    <div>Magnetic Heading: {leg.magneticHeading}°</div>
                    <div>ETA: {leg.eta}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
      <div className="w-2/3">
        <MapContainer 
          center={[36.2048, 138.2529]} 
          zoom={5} 
          style={{ height: '100%', width: '100%' }}
          maxBounds={[[20, 122], [46, 154]]}
          minZoom={5}
        >
          <FlightPlannerContent
            onWaypointAdd={(waypoint) => console.log('Waypoint added:', waypoint)}
            flightPlan={flightPlan}
            setFlightPlan={setFlightPlan}
          />
        </MapContainer>
      </div>
    </div>
  );
};

export default FlightPlanner;