import React, { useState, useEffect, useRef, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, useMapEvents, Popup, LayersControl, GeoJSON, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

const FlightPlannerContent = ({ onWaypointAdd, flightPlan, setFlightPlan, flightInfo }) => {
  const [accSectorData, setAccSectorData] = useState(null);
  const [airportsData, setAirportsData] = useState(null);
  const [navaidsData, setNavaidsData] = useState(null);
  const longPressTimeoutRef = useRef(null);
  const isLongPressRef = useRef(false);
  const [cursorPosition, setCursorPosition] = useState({ lat: 0, lng: 0 });
  const [draggingWaypointIndex, setDraggingWaypointIndex] = useState(null);

  useEffect(() => {
    // ACC_Sector GeoJSON データを読み込む
    fetch('/geojson/ACC_Sector.geojson')
      .then(response => response.json())
      .then(data => {
        setAccSectorData(data);
      })
      .catch(error => console.error('Error loading ACC_Sector data:', error));

    // Airports GeoJSON データを読み込む
    fetch('/geojson/Airports.geojson')
      .then(response => response.json())
      .then(data => {
        setAirportsData(data);
      })
      .catch(error => console.error('Error loading Airports data:', error));

    // Navaids GeoJSON データを読み込む
    fetch('/geojson/Navaids.geojson')
      .then(response => response.json())
      .then(data => {
        setNavaidsData(data);
      })
      .catch(error => console.error('Error loading Navaids data:', error));
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
      mousemove(e) {
        clearTimeout(longPressTimeoutRef.current);
        setCursorPosition(e.latlng);
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

  const pointToLayer = (feature, latlng) => {
    return L.circleMarker(latlng, {
      radius: 6,
      fillColor: feature.properties.type === "空港" ? "#ff7800" : "#0078ff",
      color: "#000",
      weight: 1,
      opacity: 1,
      fillOpacity: 0.5
    });
  };

  const updateWaypointPosition = useCallback((index, newPosition) => {
    setFlightPlan(prev => ({
      ...prev,
      waypoints: prev.waypoints.map((wp, i) => 
        i === index ? { ...wp, ...newPosition } : wp
      )
    }));
  }, [setFlightPlan]);

  const toDMS = (coord) => {
    const absolute = Math.abs(coord);
    const degrees = Math.floor(absolute);
    const minutesNotTruncated = (absolute - degrees) * 60;
    const minutes = Math.floor(minutesNotTruncated);
    const seconds = Math.floor((minutesNotTruncated - minutes) * 60);
    return `${degrees}° ${minutes}' ${seconds}"`;
  };

  const CursorPositionControl = () => {
    const map = useMap();
    
    useEffect(() => {
      const control = L.control({ position: 'topleft' });
      control.onAdd = () => {
        const div = L.DomUtil.create('div', 'cursor-position');
        div.style.backgroundColor = 'white';
        div.style.padding = '5px';
        div.style.border = '2px solid rgba(0,0,0,0.2)';
        div.style.borderRadius = '4px';
        return div;
      };
      control.addTo(map);

      return () => {
        control.remove();
      };
    }, [map]);

    useEffect(() => {
      const container = document.querySelector('.cursor-position');
      if (container) {
        container.innerHTML = `Lat: ${toDMS(cursorPosition.lat)} ${cursorPosition.lat >= 0 ? 'N' : 'S'}<br>
                               Lng: ${toDMS(cursorPosition.lng)} ${cursorPosition.lng >= 0 ? 'E' : 'W'}`;
      }
    }, [cursorPosition]);

    return null;
  };

  return (
    <>
      <MapEvents />
      <CursorPositionControl />
      <LayersControl position="topright">
        <LayersControl.BaseLayer checked name="OpenStreetMap">
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
        </LayersControl.BaseLayer>
        <LayersControl.BaseLayer name="Satellite">
          <TileLayer
            url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
            attribution='&copy; <a href="https://www.esri.com/">Esri</a>'
          />
        </LayersControl.BaseLayer>
        <LayersControl.Overlay name="ACC Sectors">
          {accSectorData && (
            <GeoJSON 
              data={accSectorData} 
              style={() => ({
                color: 'green',
                weight: 2,
                opacity: 0.6,
                fillColor: 'green',
                fillOpacity: 0.2
              })}
            />
          )}
        </LayersControl.Overlay>
        <LayersControl.Overlay name="Airports">
          {airportsData && (
            <GeoJSON 
              data={airportsData}
              pointToLayer={pointToLayer}
              onEachFeature={(feature, layer) => {
                layer.bindPopup(`${feature.properties.name1} (${feature.properties.name2})`);
              }}
            />
          )}
        </LayersControl.Overlay>
        <LayersControl.Overlay name="Navaids">
          {navaidsData && (
            <GeoJSON 
              data={navaidsData}
              pointToLayer={pointToLayer}
              onEachFeature={(feature, layer) => {
                layer.bindPopup(`${feature.properties.name}`);
              }}
            />
          )}
        </LayersControl.Overlay>
      </LayersControl>
      {flightPlan.departure && (
        <Marker
          position={[flightPlan.departure.lat, flightPlan.departure.lng]}
        >
          <Popup>{flightPlan.departure.name}</Popup>
        </Marker>
      )}
      {flightPlan.arrival && (
        <Marker
          position={[flightPlan.arrival.lat, flightPlan.arrival.lng]}
        >
          <Popup>{flightPlan.arrival.name}</Popup>
        </Marker>
      )}
      {flightPlan.waypoints.map((waypoint, index) => (
        <Marker
          key={index}
          position={[waypoint.lat, waypoint.lng]}
          draggable={true}
          eventHandlers={{
            dragstart: () => {
              setDraggingWaypointIndex(index);
            },
            drag: (e) => {
              const marker = e.target;
              const position = marker.getLatLng();
              updateWaypointPosition(index, position);
            },
            dragend: () => {
              setDraggingWaypointIndex(null);
            },
          }}
        >
          <Popup>{waypoint.name}</Popup>
        </Marker>
      ))}
      {flightPlan.departure && flightPlan.arrival && flightInfo && (
        <>
          {flightInfo.legs.map((leg, index) => (
            <Polyline
              key={index}
              positions={[
                [leg.fromLat, leg.fromLng],
                [leg.toLat, leg.toLng]
              ]}
              color="blue"
              weight={3}
              opacity={0.7}
            >
              <Popup>
                <div>Magnetic Heading: {leg.magneticHeading}°</div>
                <div>Distance: {leg.distance} nm</div>
                <div>ETE: {leg.ete}</div>
              </Popup>
            </Polyline>
          ))}
        </>
      )}
    </>
  );
};

const FlightPlanner = () => {
  const [flightPlan, setFlightPlan] = useState({
    departure: null,
    arrival: null,
    waypoints: [],
    speed: '',
    altitude: '',
    takeoffTime: '',
  });
  const [flightInfo, setFlightInfo] = useState(null);
  const [airbases, setAirbases] = useState([]);
  const [navaids, setNavaids] = useState([]);
  const [error, setError] = useState(null);
  const [selectedNavaid, setSelectedNavaid] = useState('');
  const [bearing, setBearing] = useState('');
  const [distance, setDistance] = useState('');

  useEffect(() => {
    // Fetch airbase data
    fetch('/geojson/Airports.geojson')
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        const processedAirbases = data.features.map(feature => ({
          id: feature.properties.id,
          name: `${feature.properties.name1} (${feature.properties.name2})`,
          lat: feature.properties["ARP.N(DD)"],
          lng: feature.properties["ARP.E(DD)"]
        }));
        setAirbases(processedAirbases);
      })
      .catch(error => {
        console.error('Error loading airbase data:', error);
        setError(`Failed to load airbase data: ${error.message}`);
      });

    // Fetch Navaids data
    fetch('/geojson/Navaids.geojson')
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        const processedNavaids = data.features.map(feature => ({
          id: feature.properties.id,
          name: feature.properties.name,
          lat: feature.geometry.coordinates[1],
          lng: feature.geometry.coordinates[0]
        }));
        setNavaids(processedNavaids);
      })
      .catch(error => {
        console.error('Error loading navaids data:', error);
        setError(`Failed to load navaids data: ${error.message}`);
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
      [name]: name === 'takeoffTime' ? value : value === '' ? '' : parseFloat(value)
    }));
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
    if (!selectedNavaid || bearing === '' || distance === '') return;

    const navaid = navaids.find(n => n.id === selectedNavaid);
    if (!navaid) return;

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

    const newWaypoint = {
      lat: (lat2 * 180) / Math.PI,
      lng: (lon2 * 180) / Math.PI,
      name: `Waypoint ${flightPlan.waypoints.length + 1}`,
    };

    setFlightPlan(prev => ({
      ...prev,
      waypoints: [...prev.waypoints, newWaypoint]
    }));

    // Reset input fields
    setSelectedNavaid('');
    setBearing('');
    setDistance('');
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
    <div className="h-screen flex flex-col">
      <Tabs defaultValue="plan" className="flex-grow flex flex-col">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="plan">Plan</TabsTrigger>
          <TabsTrigger value="map">Map</TabsTrigger>
        </TabsList>
        <TabsContent value="plan" className="flex-grow overflow-auto">
          <Card className="m-4">
            <CardHeader>
              <CardTitle>Flight Plan</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="departure">Departure</Label>
                  <Select onValueChange={(value) => handleAirportSelect('departure', value)}>
                    <SelectTrigger id="departure">
                      <SelectValue placeholder="Select departure airport" />
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
                    <SelectTrigger id="arrival">
                      <SelectValue placeholder="Select arrival airport"  />
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
                  <Label htmlFor="navaid">Add Waypoint from Navaid</Label>
                  <Select value={selectedNavaid} onValueChange={setSelectedNavaid}>
                    <SelectTrigger id="navaid">
                      <SelectValue placeholder="Select Navaid" />
                    </SelectTrigger>
                    <SelectContent>
                      {navaids.map(navaid => (
                        <SelectItem key={navaid.id} value={navaid.id}>
                          {navaid.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input
                    id="bearing"
                    type="number"
                    placeholder="Bearing (degrees)"
                    className="mt-2"
                    value={bearing}
                    onChange={(e) => setBearing(e.target.value)}
                  />
                  <Input
                    id="distance"
                    type="number"
                    placeholder="Distance (nm)"
                    className="mt-2"
                    value={distance}
                    onChange={(e) => setDistance(e.target.value)}
                  />
                  <Button className="mt-2" onClick={addWaypointFromNavaid}>Add Waypoint</Button>
                </div>
                <div>
                  <Label>Waypoints</Label>
                  {flightPlan.waypoints.map((waypoint, index) => (
                    <div key={index} className="flex items-center space-x-2 mt-2">
                      <Input
                        value={waypoint.name}
                        onChange={(e) => handleWaypointNameChange(index, e.target.value)}
                      />
                      <span>{waypoint.lat.toFixed(4)}, {waypoint.lng.toFixed(4)}</span>
                    </div>
                  ))}
                </div>
                <Button onClick={calculateFlightInfo}>Calculate Flight Info</Button>
              </div>
            </CardContent>
          </Card>
          {flightInfo && (
            <Card className="m-4">
              <CardHeader>
                <CardTitle>Flight Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <div>Total Distance: {flightInfo.totalDistance} nm</div>
                  <div>Total Time: {flightInfo.totalTime}</div>
                </div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>From</TableHead>
                      <TableHead>To</TableHead>
                      <TableHead>Distance (nm)</TableHead>
                      <TableHead>Magnetic Heading</TableHead>
                      <TableHead>ETE</TableHead>
                      <TableHead>ETA</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {flightInfo.legs.map((leg, index) => (
                      <TableRow key={index}>
                        <TableCell>{leg.from}</TableCell>
                        <TableCell>{leg.to}</TableCell>
                        <TableCell>{leg.distance}</TableCell>
                        <TableCell>{leg.magneticHeading}°</TableCell>
                        <TableCell>{leg.ete}</TableCell>
                        <TableCell>{leg.eta}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        <TabsContent value="map" className="flex-grow">
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
              flightInfo={flightInfo}
            />
          </MapContainer>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FlightPlanner;