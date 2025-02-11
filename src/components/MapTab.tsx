import React, { useEffect, useRef, useMemo, useState, useCallback } from 'react';
import { MapContainer, Popup, Polyline, CircleMarker } from 'react-leaflet';
import { FlightPlan, GeoJSONFeature } from '../types';
import 'leaflet/dist/leaflet.css';
import 'leaflet-groupedlayercontrol/dist/leaflet.groupedlayercontrol.min.css';
import 'leaflet-groupedlayercontrol';
import L from 'leaflet';
import icon from '/images/marker-icon.png';
import iconShadow from '/images/marker-shadow.png';
import { useMapRoute } from '../hooks/useMapRoute';
import { DEFAULT_CENTER, DEFAULT_ZOOM, getNavaidColor } from '../utils';

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

interface LayerControlRef {
  current: L.Control.Layers | null;
}

interface MapTabProps {
  flightPlan: FlightPlan;
}

const MapTab: React.FC<MapTabProps> = ({ flightPlan }) => {
  const routePoints = useMapRoute(flightPlan);
  const [map, setMap] = useState<L.Map | null>(null);

  return (
    <div className="h-[calc(100vh-7rem)] bg-white rounded-lg shadow-sm overflow-hidden">
      <MapContainer
        center={[DEFAULT_CENTER.lat, DEFAULT_CENTER.lng]}
        zoom={DEFAULT_ZOOM}
        className="h-full w-full"
        ref={setMap}
      >
        <MapContent flightPlan={flightPlan} routePoints={routePoints} map={map} />
      </MapContainer>
    </div>
  );
};

const MapContent: React.FC<{ flightPlan: FlightPlan, routePoints: [number, number][], map: L.Map | null }> = ({ flightPlan, routePoints, map }) => {
  const layerControlRef = useRef<L.Control.Layers | null>(null) as LayerControlRef;
  const [navaids, setNavaids] = React.useState<GeoJSONFeature[]>([]);

  // 各フィーチャーをクリック時に詳細情報をポップアップ表示するための関数
  const onEachFeaturePopup = useCallback((feature: any, layer: L.Layer) => {
    let popupContent = `<div><h4>Details</h4><table>`;
    for (const key in feature.properties) {
      popupContent += `<tr><td>${key}</td><td>${feature.properties[key]}</td></tr>`;
    }
    popupContent += `</table></div>`;
    layer.bindPopup(popupContent);
  }, []);

  // overlayLayers を useMemo で安定したオブジェクトとして生成（再レンダリング時に同じインスタンスを返す）
  const overlayLayers = useMemo(() => ({
    "ACC Sector High": L.geoJSON(null, { 
        style: { color: 'blue', weight: 2, opacity: 0.7 },
        onEachFeature: onEachFeaturePopup
    }),
    "ACC Sector Low": L.geoJSON(null, { 
        style: { color: 'green', weight: 2, opacity: 0.7 },
        onEachFeature: onEachFeaturePopup 
    }),
    "RAPCON": L.geoJSON(null, { 
        style: { color: 'orange', weight: 2, opacity: 0.7 },
        onEachFeature: onEachFeaturePopup 
    }),
    "Restricted Airspace": L.geoJSON(null, { 
        style: { color: 'red', weight: 2, opacity: 0.7, dashArray: '4' },
        onEachFeature: onEachFeaturePopup 
    }),
    "Training Area Civil": L.geoJSON(null, { 
        style: { color: 'brown', weight: 2, opacity: 0.7 },
        onEachFeature: onEachFeaturePopup 
    }),
    "Training Area High": L.geoJSON(null, { 
        style: { color: 'purple', weight: 2, opacity: 0.7 },
        onEachFeature: onEachFeaturePopup 
    }),
    "Training Area Low": L.geoJSON(null, { 
        style: { color: 'yellow', weight: 2, opacity: 0.7 },
        onEachFeature: onEachFeaturePopup 
    }),
    "Airports": L.geoJSON(null, {
      pointToLayer: (feature, latlng) => {
        // 空港のマーカーは非表示、5nm (約9260m) の管制圏円のみ表示
        const circle = L.circle(latlng, { radius: 9260, color: 'cyan', weight: 2, dashArray: '5, 5', fillOpacity: 0.1 });
        return L.layerGroup([circle]);
      },
      onEachFeature: (feature, layer) => {
        const popupContent = `<div>
          <strong>${feature.properties.name1}</strong><br/>
          ID: ${feature.properties.id}<br/>
          Type: ${feature.properties.type}
        </div>`;
        layer.bindPopup(popupContent);
      }
    })
  }), [onEachFeaturePopup]);

  // GeoJSONデータをフェッチして各レイヤーに追加
  useEffect(() => {
    // ACC_Sector High/Low と他のレイヤーのデータ取得
    fetch('/geojson/ACC_Sector_High.geojson')
      .then(res => res.json())
      .then(data => overlayLayers["ACC Sector High"].addData(data))
      .catch(console.error);

    fetch('/geojson/ACC_Sector_Low.geojson')
      .then(res => res.json())
      .then(data => overlayLayers["ACC Sector Low"].addData(data))
      .catch(console.error);

    fetch('/geojson/RAPCON.geojson')
      .then(res => res.json())
      .then(data => overlayLayers["RAPCON"].addData(data))
      .catch(console.error);

    fetch('/geojson/RestrictedAirspace.geojson')
      .then(res => res.json())
      .then(data => overlayLayers["Restricted Airspace"].addData(data))
      .catch(console.error);

    fetch('/geojson/TrainingAreaCivil.geojson')
      .then(res => res.json())
      .then(data => overlayLayers["Training Area Civil"].addData(data))
      .catch(console.error);

    fetch('/geojson/TrainingAreaHigh.geojson')
      .then(res => res.json())
      .then(data => overlayLayers["Training Area High"].addData(data))
      .catch(console.error);

    fetch('/geojson/TrainingAreaLow.geojson')
      .then(res => res.json())
      .then(data => overlayLayers["Training Area Low"].addData(data))
      .catch(console.error);

    // Airports レイヤーのデータ取得
    fetch('/geojson/Airports.geojson')
      .then(res => res.json())
      .then(data => overlayLayers["Airports"].addData(data))
      .catch(console.error);
  }, [overlayLayers]);

  // OpenStreetMapレイヤー
  const osmLayer = useMemo(() => L.tileLayer(
    'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }
  ), []);

  // 衛星写真レイヤー
  const esriLayer = useMemo(() => L.tileLayer(
    'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    {
      attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
    }
  ), []);

  const baseLayers = useMemo(() => {
    console.log("baseLayers in useMemo:", osmLayer, esriLayer);
    return {
      "地図": osmLayer,
      "衛星写真": esriLayer,
    };
  }, [osmLayer, esriLayer]);

  // Navaidsデータを読み込む
  const fetchNavaids = useCallback(async () => {
    try {
      const response = await fetch('/geojson/Navaids.geojson');
      const data = await response.json();
      setNavaids(data.features);
    } catch (error) {
      console.error('Failed to load Navaids:', error);
    }
  }, []);

  useEffect(() => {
    fetchNavaids();
  }, [fetchNavaids]);

  // レイヤーコントロールの更新
  useEffect(() => {
    if (!map) {
      return;
    }

    // レイヤーコントロールがまだ追加されていない場合のみ追加する
    if (!layerControlRef.current) {
      const control = L.control.layers(baseLayers, overlayLayers).addTo(map);
      console.log("baseLayers in useEffect:", baseLayers);
      layerControlRef.current = control;
      // 初期のベースレイヤーとして "地図" のタイルレイヤー (osmLayer) を追加する
      if (!map.hasLayer(osmLayer)) {
        osmLayer.addTo(map);
      }
    } else {
      // 既存のレイヤーコントロールを更新する
      (Object.keys(baseLayers) as Array<keyof typeof baseLayers>).forEach(key => {
        layerControlRef.current?.removeLayer(baseLayers[key]);
        layerControlRef.current?.addBaseLayer(baseLayers[key], key);
      });
      // オーバーレイレイヤーも更新
      (Object.keys(overlayLayers) as (keyof typeof overlayLayers)[]).forEach(key => {
        layerControlRef.current?.removeLayer(overlayLayers[key]);
        layerControlRef.current?.addOverlay(overlayLayers[key], key);
      });
    }

    return () => {
      // layerControlRef.current が null でないことを確認してから removeControl を呼び出す
      if (map && layerControlRef.current) {
        map.removeControl(layerControlRef.current);
      }
    };
  }, [map, baseLayers, overlayLayers]);

  return (
    <>
      {/* ベースレイヤー */}
      {/* ルートの線 */}
      {routePoints.length > 1 && (
        <Polyline positions={routePoints} color="blue" weight={2} />
      )}

      {/* 出発空港のマーカー */}
      {flightPlan.departure && (
        <CircleMarker
          center={[flightPlan.departure.latitude, flightPlan.departure.longitude]}
          radius={6}
          fillColor="green"
          color="green"
          weight={1}
          fillOpacity={0.8}
        >
          <Popup>
            <div>
              <h2 className="font-bold text-lg">{flightPlan.departure.name}</h2>
              <p className="text-sm text-gray-500">Departure Airport</p>
            </div>
          </Popup>
        </CircleMarker>
      )}

      {/* 到着空港のマーカー */}
      {flightPlan.arrival && (
        <CircleMarker
          center={[flightPlan.arrival.latitude, flightPlan.arrival.longitude]}
          radius={6}
          fillColor="red"
          color="red"
          weight={1}
          fillOpacity={0.8}
        >
          <Popup>
            <div>
              <h2 className="font-bold text-lg">{flightPlan.arrival.name}</h2>
              <p className="text-sm text-gray-500">Arrival Airport</p>
            </div>
          </Popup>
        </CircleMarker>
      )}

      {/* ウェイポイントのマーカー */}
      {flightPlan.waypoints.map((waypoint, index) => (
        <CircleMarker
          key={index}
          center={[waypoint.latitude, waypoint.longitude]}
          radius={5}
          fillColor="blue"
          color="blue"
          weight={1}
          fillOpacity={0.6}
        >
          <Popup>
            <div>
              <h2 className="font-bold text-lg">{waypoint.name}</h2>
              <p className="text-sm text-gray-500">Waypoint</p>
            </div>
          </Popup>
        </CircleMarker>
      ))}

      {/* Navaidsのマーカー */}
      {navaids.map((navaid, index) => (
        <CircleMarker
          key={index}
          center={[
            navaid.geometry.coordinates[1],
            navaid.geometry.coordinates[0]
          ]}
          radius={4}
          fillColor={getNavaidColor(navaid.properties.type ?? '')}
          color={getNavaidColor(navaid.properties.type ?? '')}
          weight={1}
          fillOpacity={0.8}
        >
          <Popup>
            <div className="space-y-1">
              <h2 className="font-bold text-lg">{navaid.properties.name}</h2>
              <p className="text-sm text-gray-600">ID: {navaid.properties.id}</p>
              <p className="text-sm text-gray-600">Type: {navaid.properties.type}</p>
              {navaid.properties.ch && (
                <p className="text-sm text-gray-600">Channel: {navaid.properties.ch}</p>
              )}
              {navaid.properties.freq && (
                <p className="text-sm text-gray-600">Frequency: {navaid.properties.freq} MHz</p>
              )}
              <p className="text-sm text-gray-600">
                Position: {navaid.geometry.coordinates[1].toFixed(4)}°N, {navaid.geometry.coordinates[0].toFixed(4)}°E
              </p>
            </div>
          </Popup>
        </CircleMarker>
      ))}
    </>
  );
};

export default MapTab;