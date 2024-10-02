"use client"

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

// マーカーアイコンの定義
const defaultIcon = L.icon({
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  shadowSize: [41, 41],
});

const FlightPlannerContent = ({ onWaypointAdd, flightPlan, setFlightPlan, flightInfo, navaidsData, airportsData }) => {
  const [accSectorData, setAccSectorData] = useState(null);
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

  const formatCoordinates = (lat, lng) => {
    const latDMS = toDMS(lat);
    const lngDMS = toDMS(lng);
    const latDir = lat >= 0 ? 'N' : 'S';
    const lngDir = lng >= 0 ? 'E' : 'W';
    return `${latDir} ${latDMS} / ${lngDir} ${lngDMS}`;
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
        container.innerHTML = formatCoordinates(cursorPosition.lat, cursorPosition.lng);
      }
    }, [cursorPosition]);

    return null;
  };

  const calculateBearingAndDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371e3; // 地球の半径（メートル）
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    const distance = R * c / 1852; // 海里に変換

    const y = Math.sin(Δλ) * Math.cos(φ2);
    const x = Math.cos(φ1) * Math.sin(φ2) -
              Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ);
    const θ = Math.atan2(y, x);
    let bearing = (θ * 180 / Math.PI + 360) % 360;

    // 磁気偏角を適用（例: 7度）
    const magneticDeclination = 7;
    bearing = (bearing + magneticDeclination + 360) % 360;

    return { bearing, distance };
  };

  const getNearestNavaids = (lat, lon) => {
    if (!navaidsData) return [];

    return navaidsData.features
      .map(navaid => {
        const { bearing, distance } = calculateBearingAndDistance(
          lat, lon,
          navaid.geometry.coordinates[1],
          navaid.geometry.coordinates[0]
        );
        return {
          name: navaid.properties.name,
          bearing,
          distance
        };
      })
      .sort((a, b) => a.distance - b.distance)
      .slice(0, 3);
  };

  const getWaypointInfo = (waypoint) => {
    const { departure, arrival } = flightPlan;
    let info = '';

    if (departure) {
      const { bearing, distance } = calculateBearingAndDistance(
        departure.lat, departure.lng,
        waypoint.lat, waypoint.lng
      );
      info += `from Departure airport: ${bearing.toFixed(0)}°/${distance.toFixed(1)}nm<br>`;
    }

    if (arrival) {
      const { bearing, distance } = calculateBearingAndDistance(
        waypoint.lat, waypoint.lng,
        arrival.lat, arrival.lng
      );
      info += `from Arrival airport: ${bearing.toFixed(0)}°/${distance.toFixed(1)}nm<br>`;
    }

    const nearestNavaids = getNearestNavaids(waypoint.lat, waypoint.lng);
    info += 'from near Navaids:<br>';
    nearestNavaids.forEach(navaid => {
      info += `${navaid.bearing.toFixed(0)}°/${navaid.distance.toFixed(1)}nm from ${navaid.name}<br>`;
    });

    info += `Lat/Long: ${formatCoordinates(waypoint.lat, waypoint.lng)}`;

    return info;
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
        <LayersControl.Overlay checked name="Airports">
          {airportsData && (
            <GeoJSON 
              data={airportsData}
              pointToLayer={(feature, latlng) => 
                L.circleMarker(latlng, {
                  radius: 6,
                  fillColor: "#ff7800",
                  color: "#000",
                  weight: 1,
                  opacity: 1,
                  fillOpacity: 0.5
                })
              }
              onEachFeature={(feature, layer) => {
                layer.bindPopup(`${feature.properties.name1} (${feature.properties.name2})`);
              }}
            />
          )}
        </LayersControl.Overlay>
        <LayersControl.Overlay checked name="Navaids">
          {navaidsData && (
            <GeoJSON 
              data={navaidsData}
              pointToLayer={(feature, latlng) => 
                L.circleMarker(latlng, {
                  radius: 6,
                  fillColor: "#0078ff",
                  color: "#000",
                  weight: 1,
                  opacity: 1,
                  fillOpacity: 0.5
                })
              }
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
          icon={defaultIcon}
        >
          <Popup>{flightPlan.departure.name}</Popup>
        </Marker>
      )}
      {flightPlan.arrival && (
        <Marker
          position={[flightPlan.arrival.lat, flightPlan.arrival.lng]}
          icon={defaultIcon}
        >
          <Popup>{flightPlan.arrival.name}</Popup>
        </Marker>
      )}
      {flightPlan.waypoints.map((waypoint, index) => (
        <Marker
          key={index}
          position={[waypoint.lat, waypoint.lng]}
          draggable={true}
          icon={defaultIcon}
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
              onWaypointAdd(flightPlan.waypoints[index]);
            },
            click: (e) => {
              const popupContent = getWaypointInfo(waypoint);
              e.target.bindPopup(popupContent).openPopup();
            }
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
                <div>磁方位: {leg.magneticHeading}°</div>
                <div>距離: {leg.distance} nm</div>
                <div>所要時間: {leg.ete}</div>
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
    speed: 300,
    altitude: 23000,
    takeoffTime: '',
  });
  const [flightInfo, setFlightInfo] = useState(null);
  const [airbases, setAirbases] = useState([]);
  const [navaidsData, setNavaidsData] = useState(null);
  const [navaids, setNavaids] = useState([]);
  const [airportsData, setAirportsData] = useState(null);
  const [error, setError] = useState(null);
  const [selectedNavaid, setSelectedNavaid] = useState('');
  const [bearing, setBearing] = useState('');
  const [distance, setDistance] = useState('');
  const [activeTab, setActiveTab] = useState('plan');
  const [selectedWaypoint, setSelectedWaypoint] = useState(null);
  const [mapKey, setMapKey] = useState(0);

  const isMounted = useRef(true);

  useEffect(() => {
    if (activeTab === 'map') {
      setMapKey(prev => prev + 1);
    }
  }, [activeTab]);
  
  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

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
    setNavaidsData(data); // ここで navaidsData を設定
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
    console.log('addWaypointFromNavaid called');
    console.log('selectedNavaid:', selectedNavaid);
    console.log('navaidsData:', navaidsData);
  
    if (!selectedNavaid || !navaids) {
      console.log('selectedNavaid or navaids is missing');
      return;
    }
  
    const navaid = navaids.find(n => n.id === selectedNavaid);
    if (!navaid) {
      console.log('Selected navaid not found');
      return;
    }
  
    let newWaypoint;
  
    if (bearing === '' || distance === '') {
      console.log('Adding navaid directly as waypoint');
      newWaypoint = {
        lat: navaid.lat,
        lng: navaid.lng,
        name: `${navaid.name} Waypoint`,
      };
    } else {
      console.log('Calculating new waypoint position');
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
  
    console.log('New waypoint:', newWaypoint);
  
    setFlightPlan(prev => {
      const updatedPlan = {
        ...prev,
        waypoints: [...prev.waypoints, newWaypoint]
      };
  
      console.log('Updated flight plan:', updatedPlan);
      return updatedPlan;
    });
  
    // Reset input fields
    setSelectedNavaid('');
    setBearing('');
    setDistance('');
    console.log('Input fields reset');
  };

  const updateWaypoint = () => {
    if (selectedWaypoint === null) return;

    const updatedWaypoint = {
      ...flightPlan.waypoints[selectedWaypoint],
      name: selectedNavaid ? `${selectedNavaid} Waypoint` : flightPlan.waypoints[selectedWaypoint].name,
    };

    if (bearing !== '' && distance !== '') {
      const navaid = navaidsData.features.find(n => n.properties.id === selectedNavaid);
      if (navaid) {
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
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-grow flex flex-col">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="plan">計画</TabsTrigger>
          <TabsTrigger value="map">地図</TabsTrigger>
        </TabsList>
        <TabsContent value="plan" className="flex-grow overflow-auto">
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
          {flightInfo && (
            <Card className="m-4">
              <CardHeader>
                <CardTitle>飛行情報</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <div>総距離: {flightInfo.totalDistance} 海里</div>
                  <div>総飛行時間: {flightInfo.totalTime}</div>
                </div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>出発</TableHead>
                      <TableHead>到着</TableHead>
                      <TableHead>距離 (海里)</TableHead>
                      <TableHead>磁方位</TableHead>
                      <TableHead>所要時間</TableHead>
                      <TableHead>到着予定時刻</TableHead>
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
              />
            </MapContainer>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FlightPlanner;