import React, { useState, useRef, useCallback, memo } from 'react';
import { TileLayer, Marker, Polyline, useMapEvents, Popup, LayersControl, GeoJSON, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { defaultIcon, pointToLayer, formatCoordinates } from '../../utils/mapUtils';
import { calculateBearingAndDistance } from '../../utils/calculations';

const FlightPlannerContent = memo(({ onWaypointAdd, flightPlan, setFlightPlan, flightInfo, navaidsData, airportsData, accSectorHighData, accSectorLowData, trainingAreaHigh, trainingAreaLow, trainingAreaCivil, RAPCON, restrictedArea}) => {
  
  const longPressTimeoutRef = useRef(null);
  const isLongPressRef = useRef(false);
  const [cursorPosition, setCursorPosition] = useState({ lat: 0, lng: 0 });
  const [draggingWaypointIndex, setDraggingWaypointIndex] = useState(null);
  const [showAirports, setShowAirports] = useState(true);
  const [showHelicopters, setShowHelicopters] = useState(false);

  const airportPointToLayer = (feature, latlng) => {
    const type = feature.properties.type;
    const radiusNm = 5; // 半径 5 海里
    const radiusMeters = radiusNm * 1852;

    let circleOptions = {
      radius: radiusMeters,
      weight: 1,
      opacity: 0.3,
      fillOpacity: 0.2,
      zIndexOffset: 800 // 空港とヘリポートの zIndex を上げる
    };

    switch (type) {
      case 'JASDF':
        circleOptions = { ...circleOptions, fillColor: "#4981cf", color: "black" };
        break;

      case 'JMSDF':
        circleOptions = { ...circleOptions, fillColor: "#00033a", color: "black" };
        break;
      
      case 'JGSDF':
        circleOptions = { ...circleOptions, fillColor: "#455a4f", color: "black" };
        break;

      case 'USF':
        circleOptions = { ...circleOptions, fillColor: "#7a211e", color: "black" };
        break;

      case 'CIVIL':
        circleOptions = { ...circleOptions, fillColor: "#646569", color: "black" };
        break;

      case '空港':
        circleOptions = { ...circleOptions, fillColor: "#e6e6e8", color: "black" };
        break;

      case 'ヘリ':
        circleOptions = { ...circleOptions, fillColor: "#455a4f", color: "black" };
        break;
    }

    return L.circle(latlng, circleOptions);

  };

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

  const updateWaypointPosition = useCallback((index, newPosition) => {
    setFlightPlan(prev => ({
      ...prev,
      waypoints: prev.waypoints.map((wp, i) => 
        i === index ? { ...wp, ...newPosition } : wp
      )
    }));
  }, [setFlightPlan]);

  const CursorPositionControl = () => {
    const map = useMap();
    
    React.useEffect(() => {
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

    React.useEffect(() => {
      const container = document.querySelector('.cursor-position');
      if (container) {
        container.innerHTML = formatCoordinates(cursorPosition.lat, cursorPosition.lng);
      }
    }, [cursorPosition]);

    return null;
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

  const onEachFeatureACC = (feature, layer) => {
    if (feature.properties && feature.properties.name) {
      layer.bindPopup(`${feature.properties.name}`);
    }
  };

  const onEachFeatureTrainingArea = (feature, layer) => {
    if (feature.properties) {
      const { Area_ID, Name, altitude } = feature.properties; // altitude を取得
      let popupContent = "";

      if (Name) {
        popupContent = `${Name} (${Area_ID})`;
      } else if (Area_ID) {
        popupContent = `${Area_ID}`;
      }

      if (altitude) {
        popupContent += `<br>${altitude}`; // 高度情報を追加
      }

      if (popupContent) {
        layer.bindPopup(popupContent);
      }
    }
  };

  const onEachFeatureRestrictedArea = (feature, layer) => {
    if (feature.properties) {
      const { Area_ID, Name, altitude } = feature.properties; // altitude を取得
      let popupContent = "";

      if (Name) {
        popupContent = `${Name} (${Area_ID})`;
      } else if (Area_ID) {
        popupContent = `${Area_ID}`;
      }

      if (altitude) {
        popupContent += `<br>${altitude}`; // 高度情報を追加
      }

      if (popupContent) {
        layer.bindPopup(popupContent);
      }
    }
  };

  const onEachFeatureRAPCON = (feature, layer) => {
    if (feature.properties && feature.properties.name) {
      layer.bindPopup(`${feature.properties.name}`);
    }
  };

  return (
    <>
      <MapEvents />
      <CursorPositionControl />
        <LayersControl position="topright">
          
          <LayersControl.BaseLayer checked name="Satellite">
            <TileLayer
              url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
              attribution='&copy; <a href="https://www.esri.com/">Esri</a>'
            />
          </LayersControl.BaseLayer>
          
          <LayersControl.BaseLayer name="OpenStreetMap">
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
          </LayersControl.BaseLayer>

          <LayersControl.Overlay checked name="Navaids">
            {navaidsData && (
              <GeoJSON
                data={navaidsData}
                pointToLayer={(feature, latlng) => {
                  const { type } = feature.properties;

                  const icon = L.divIcon({
                    className: `navaid-icon rounded-full border border-black w-1 h-1 opacity-50 ${
                      type === 'VOR' ? 'bg-navaid-icon-blue' :
                      type === 'DME' ? 'bg-navaid-icon-green' :
                      type === 'TACAN' ? 'bg-navaid-icon-red' :
                      'bg-gray-500' // デフォルト
                    }`,
                    iconSize: [8, 8],
                    iconAnchor: [4, 4],
                  });
                  return L.marker(latlng, { icon, zIndexOffset: 100 });
                }}
              
                onEachFeature={(feature, layer) => {
                  const { name, id, ch, freq } = feature.properties;
                  let popupContent = `<b>${name}</b><br>ID: ${id}<br>CH: ${ch}`;
                  if (freq) {
                    popupContent += `<br>FREQ: ${freq}`;
                  }
                  layer.bindPopup(popupContent);
                }}
                zIndex={1000}
              />
            )}
          </LayersControl.Overlay>

          <LayersControl.Overlay checked name="Airports">
            {airportsData && (
              <GeoJSON
                data={airportsData}
                pointToLayer={airportPointToLayer}
                onEachFeature={(feature, layer) => {
                  const { id, name1, "Elev(ft)": elev, RWY1, "MAG Var": magVar, RWY2 } = feature.properties;
                  let popupContent = `<b>${id}(${name1})</b><br>Elev: ${elev}ft<br>RWY: ${RWY1}`;
                  if (RWY2 !== undefined) {
                    popupContent += `<br>RWY: ${RWY2}`;
                  }
                  popupContent += `<br>MAG: ${magVar}°`;
                  layer.bindPopup(popupContent);

                  // イベント伝播を停止
                  layer.on('click', (event) => {
                    L.DomEvent.stopPropagation(event);
                  });
                }}
                zIndex={900}
              />
            )}
          </LayersControl.Overlay>

          <LayersControl.Overlay name="高高度訓練空域">
            {trainingAreaHigh && (
              <GeoJSON 
                data={trainingAreaHigh} 
                style={() => ({
                  color: 'blue',
                  weight: 1,
                  opacity: 0.6,
                  fillColor: 'blue',
                  fillOpacity: 0.2,
                  zIndex: 403
                })}
                onEachFeature={onEachFeatureTrainingArea}
              />
            )}
          </LayersControl.Overlay>

          <LayersControl.Overlay name="低高度訓練空域">
            {trainingAreaLow && (
              <GeoJSON 
                data={trainingAreaLow} 
                style={() => ({
                  color: 'green',
                  weight: 1,
                  opacity: 0.6,
                  fillColor: 'green',
                  fillOpacity: 0.2,
                  zIndex: 402
                })}
                onEachFeature={onEachFeatureTrainingArea}
              />
            )}
          </LayersControl.Overlay>

          <LayersControl.Overlay name="民間訓練空域">
            {trainingAreaCivil && (
              <GeoJSON 
                data={trainingAreaCivil} 
                style={() => ({
                  color: 'gray',
                  weight: 1,
                  opacity: 0.6,
                  fillColor: 'gray',
                  fillOpacity: 0.4,
                  zIndex: 401
                })}
                onEachFeature={onEachFeatureTrainingArea}
              />
            )}
          </LayersControl.Overlay>

          <LayersControl.Overlay name="制限空域">
            {restrictedArea && (
              <GeoJSON 
                data={restrictedArea} 
                style={() => ({
                  color: 'red',
                  weight: 1,
                  opacity: 0.6,
                  fillColor: 'red',
                  fillOpacity: 0.4,
                  zIndex: 404
                })}
                onEachFeature={onEachFeatureRestrictedArea}
              />
            )}
          </LayersControl.Overlay>

          <LayersControl.Overlay name="ACC Sector above FL335">
            {accSectorHighData && (
              <GeoJSON 
                data={accSectorHighData} 
                style={() => ({
                  color: 'gray',
                  weight: 1,
                  opacity: 0.6,
                  fillColor: 'gray',
                  fillOpacity: 0.2,
                  zIndex: 400
                })}
                onEachFeature={onEachFeatureACC}
              />
            )}
          </LayersControl.Overlay>

          <LayersControl.Overlay name="ACC Sector below FL335">
            {accSectorLowData && (
              <GeoJSON 
                data={accSectorLowData} 
                style={() => ({
                  color: 'yellow',
                  weight: 1,
                  opacity: 0.6,
                  fillColor: 'yellow',
                  fillOpacity: 0.2,
                  zIndex: 399
                })}
                onEachFeature={onEachFeatureACC}
              />
            )}
          </LayersControl.Overlay>

          <LayersControl.Overlay name="RAPCON">
            {RAPCON && (
              <GeoJSON 
                data={RAPCON} 
                style={() => ({
                  color: 'gray',
                  weight: 1,
                  opacity: 0.6,
                  fillColor: 'gray',
                  fillOpacity: 0.4,
                  zIndex: 407
                })}
                onEachFeature={onEachFeatureRAPCON}
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
          key={waypoint.id}
          position={[waypoint.lat, waypoint.lng]}
          icon={defaultIcon}
          draggable={true}
          eventHandlers={{
            dragend(e) {
              const { lat, lng } = e.target.getLatLng();
              updateWaypointPosition(index, { lat, lng });
            }
          }}
        >
          <Popup>
            <span>{waypoint.name}< br />{getWaypointInfo(waypoint)}</span>
          </Popup>
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
});

export default FlightPlannerContent;