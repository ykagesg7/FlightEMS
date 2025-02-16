import React, { useEffect, useRef, useMemo, useState, useCallback } from 'react';
import { MapContainer, Popup, Polyline, CircleMarker } from 'react-leaflet';
import { FlightPlan } from '../types';
import 'leaflet/dist/leaflet.css';
import 'leaflet-groupedlayercontrol/dist/leaflet.groupedlayercontrol.min.css';
import 'leaflet-groupedlayercontrol';
import L from 'leaflet';
import icon from '/images/marker-icon.png';
import iconShadow from '/images/marker-shadow.png';
import { useMapRoute } from '../hooks/useMapRoute';
import { DEFAULT_CENTER, DEFAULT_ZOOM, getNavaidColor, formatDMS } from '../utils';

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
  setFlightPlan: React.Dispatch<React.SetStateAction<FlightPlan>>;
}

const MapTab: React.FC<MapTabProps> = ({ flightPlan, setFlightPlan }) => {
  const routePoints = useMapRoute(flightPlan);
  const [map, setMap] = useState<L.Map | null>(null);
  const [cursorPosition, setCursorPosition] = useState<L.LatLng | null>(null);

  useEffect(() => {
    if (!map) return;
    const onMouseMove = (e: L.LeafletMouseEvent) => {
      setCursorPosition(e.latlng);
    };
    // マウスが map 内を移動したときに位置情報を更新
    map.on('mousemove', onMouseMove);
    return () => {
      map.off('mousemove', onMouseMove);
    };
  }, [map]);

  // ダブルクリックした地点をウェイポイントとして追加
  useEffect(() => {
    if (!map) return;
    const onDblClick = (e: L.LeafletMouseEvent) => {
      const { lat, lng } = e.latlng;
      const newWaypoint = {
        id: String(Date.now()),  // ユニークなID（ここでは現在時刻を利用）
        name: `Waypoint (${lat.toFixed(4)}, ${lng.toFixed(4)})`,
        latitude: lat,
        longitude: lng,
        type: 'custom' as 'custom',  // 例えば、カスタムウェイポイントとして設定
        coordinates: [lng, lat] as [number, number],  // タプルとしてキャスト
      };
      setFlightPlan(prev => ({
        ...prev,
        waypoints: [...prev.waypoints, newWaypoint],
      }));
    };
    map.on('dblclick', onDblClick);
    return () => {
      map.off('dblclick', onDblClick);
    };
  }, [map, setFlightPlan]);

  return (
    <div className="relative h-[calc(100vh-7rem)] bg-white rounded-lg shadow-sm overflow-hidden">
      <MapContainer
        center={[DEFAULT_CENTER.lat, DEFAULT_CENTER.lng]}
        zoom={DEFAULT_ZOOM}
        className="h-full w-full"
        ref={setMap}
      >
        <MapContent flightPlan={flightPlan} routePoints={routePoints} map={map} />
      </MapContainer>
      <div className="absolute bottom-2 left-2 z-[9999] pointer-events-none bg-gray-800 text-white text-sm px-2 py-1 rounded">
        {cursorPosition ? (
          <div>
            <div>{formatDMS(cursorPosition.lat, cursorPosition.lng)}</div>
            <div>位置(Degree)： {cursorPosition.lat.toFixed(4)}°N, {cursorPosition.lng.toFixed(4)}°E</div>
          </div>
        ) : '位置(DMS/ DD)：--'}
      </div>
    </div>
  );
};

const MapContent: React.FC<{ flightPlan: FlightPlan, routePoints: [number, number][], map: L.Map | null }> = ({ flightPlan, map }) => {
  const layerControlRef = useRef<L.Control.Layers | null>(null) as LayerControlRef;

  // グローバルに calculateBearing を定義
  const calculateBearing = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δλ = (lng2 - lng1) * Math.PI / 180;
    const x = Math.sin(Δλ) * Math.cos(φ2);
    const y = Math.cos(φ1) * Math.sin(φ2) - Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ);
    let trueBearing = (Math.atan2(x, y) * 180 / Math.PI + 360) % 360;
    const MAGNETIC_DECLINATION = 8; // 日本の平均磁気偏差 (度)
    const magneticBearing = (trueBearing + MAGNETIC_DECLINATION + 360) % 360;
    return magneticBearing;
  };

  // 各フィーチャーをクリック時に詳細情報をポップアップ表示するための関数
  const onEachFeaturePopup = useCallback((feature: any, layer: L.Layer) => {
    let popupContent = `<div><h4>Details</h4><table>`;
    for (const key in feature.properties) {
      popupContent += `<tr><td>${key}</td><td>${feature.properties[key]}</td></tr>`;
    }
    popupContent += `</table></div>`;
    layer.bindPopup(popupContent);
  }, []);

  // overlayLayers を useMemo で安定したオブジェクトとして生成
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
      pointToLayer: (_feature, latlng) => {
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
    }),
    "Navaids": L.geoJSON(null, {
      pointToLayer: (feature, latlng) => L.circleMarker(latlng, {
        radius: 4,
        fillColor: getNavaidColor(feature.properties.type ?? ''),
        color: getNavaidColor(feature.properties.type ?? ''),
        weight: 1,
        fillOpacity: 0.8
      }),
      onEachFeature: (feature, layer) => {
        let popupContent = `<div class="space-y-1">
          <h2 class="font-bold text-lg">${feature.properties.name}</h2>
          <p class="text-sm text-gray-600">ID: ${feature.properties.id}</p>
          <p class="text-sm text-gray-600">Type: ${feature.properties.type}</p>`;
        if (feature.properties.ch) {
          popupContent += `<p class="text-sm text-gray-600">Channel: ${feature.properties.ch}</p>`;
        }
        if (feature.properties.freq) {
          popupContent += `<p class="text-sm text-gray-600">Frequency: ${feature.properties.freq} MHz</p>`;
        }
        const coords = (feature.geometry as GeoJSON.LineString).coordinates;
        popupContent += `<p class="text-sm text-gray-600">Position: ${Number(coords[1]).toFixed(4)}°N, ${Number(coords[0]).toFixed(4)}°E</p></div>`;
        layer.bindPopup(popupContent);
      }
    }),   
    // 変更: RJFAレイヤーを L.layerGroup に変更（従来の geoJSON 定義を削除）
    "RJFA": L.layerGroup()
  }), [onEachFeaturePopup, getNavaidColor]);

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

    // Navaids レイヤーのデータ取得
    fetch('/geojson/Navaids.geojson')
      .then(res => res.json())
      .then(data => overlayLayers["Navaids"].addData(data))
      .catch(console.error);

    // RJFA レイヤーのデータ取得（ポイントのみの場合、グループごとにPolylineを描画）
    fetch('/geojson/RJFA.geojson')
      .then(res => res.json())
      .then(data => {
        const rjfaLayer = overlayLayers["RJFA"] as L.LayerGroup;
        // 各グループごとに、{latlng, name} オブジェクトを蓄積するオブジェクト
        const groupPoints: { [group: string]: { latlng: L.LatLng, name: string }[] } = {};
        data.features.forEach((feature: any) => {
          if (feature.geometry && feature.geometry.type === "Point") {
            const [lng, lat] = feature.geometry.coordinates;
            const group = feature.properties.group || "default";
            const marker = L.circleMarker([lat, lng], {
              radius: 5,
              fillColor: "blue",
              color: "blue",
              weight: 1,
              fillOpacity: 0.6,
            });
            let popupContent = `<div><h4>Details</h4><table>`;
            for (const key in feature.properties) {
              popupContent += `<tr><td>${key}</td><td>${feature.properties[key]}</td></tr>`;
            }
            popupContent += `</table></div>`;
            marker.bindPopup(popupContent);
            marker.addTo(rjfaLayer);
            if (!groupPoints[group]) {
              groupPoints[group] = [];
            }
            groupPoints[group].push({ latlng: L.latLng(lat, lng), name: feature.properties.name });
          }
        });
        // 各グループごとにPolyline生成（2点以上あれば）
        Object.keys(groupPoints).forEach(group => {
          const labeledPoints = groupPoints[group];
          if (labeledPoints.length > 1) {
            const latlngs = labeledPoints.map(pt => pt.latlng);
            const polyline = L.polyline(latlngs, { color: "blue", weight: 2 });
            polyline.on("click", (e: L.LeafletMouseEvent) => {
              if (!map) return;
              // クリック位置をレイヤーポイントに変換
              const clickPoint = map.latLngToLayerPoint(e.latlng);
              let bestDistance = Infinity;
              let bestSegmentIndex = -1;
              // 各セグメントごとにクリック位置との距離を計算
              for (let i = 0; i < labeledPoints.length - 1; i++) {
                const p1 = map.latLngToLayerPoint(labeledPoints[i].latlng);
                const p2 = map.latLngToLayerPoint(labeledPoints[i + 1].latlng);
                const distance = L.LineUtil.pointToSegmentDistance(clickPoint, p1, p2);
                if (distance < bestDistance) {
                  bestDistance = distance;
                  bestSegmentIndex = i;
                }
              }
              // 最も近いセグメントが見つかった場合
              if (bestSegmentIndex !== -1) {
                const startObj = labeledPoints[bestSegmentIndex];
                const endObj = labeledPoints[bestSegmentIndex + 1];
                const bearing = calculateBearing(startObj.latlng.lat, startObj.latlng.lng, endObj.latlng.lat, endObj.latlng.lng);
                const distanceMeters = startObj.latlng.distanceTo(endObj.latlng);
                const distanceNM = Math.round(distanceMeters / 1852);
                const popupContent = `<p>${startObj.name}-${endObj.name}：${Math.round(bearing)}°/${distanceNM}nm</p>`;
                map.openPopup(popupContent, e.latlng);
              }
            });
            polyline.addTo(rjfaLayer);
          }
        });
      })
      .catch(console.error);
  }, [overlayLayers, map]);

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

  // 新たに、出発、ウェイポイント、到着を連結した completeRoute 配列に基づいて
  // 各セグメントの Polyline を描画する
  const completeRoute: [number, number][] = [];
  if (flightPlan.departure) {
    completeRoute.push([flightPlan.departure.latitude, flightPlan.departure.longitude]);
  }
  if (flightPlan.waypoints && flightPlan.waypoints.length > 0) {
    flightPlan.waypoints.forEach(wp => {
      completeRoute.push([wp.latitude, wp.longitude]);
    });
  }
  if (flightPlan.arrival) {
    completeRoute.push([flightPlan.arrival.latitude, flightPlan.arrival.longitude]);
  }

  return (
    <>
      {/* 新規: 連結ルートをセグメント毎に描画 */}
      {completeRoute.length > 1 && completeRoute.map((_, i) => {
        // 最後の点は次の点がないためスキップ
        if (i === completeRoute.length - 1) return null;
        const start = completeRoute[i];
        const end = completeRoute[i + 1];
        return (
          <Polyline
            key={`complete-route-${i}`}
            positions={[start, end]}
            color="blue"
            weight={2}
            eventHandlers={{
              click: (e: L.LeafletMouseEvent) => {
                const bearing = calculateBearing(start[0], start[1], end[0], end[1]);
                const startLatLng = L.latLng(start[0], start[1]);
                const endLatLng = L.latLng(end[0], end[1]);
                const distanceMeters = startLatLng.distanceTo(endLatLng);
                // 1 nm = 1852 m → 整数に丸める
                const distanceNM = Math.round(distanceMeters / 1852);
                const popupContent = `<div>
                  <p>磁方位: ${Math.round(bearing)}°</p>
                  <p>距離: ${distanceNM} nm</p>
                </div>`;
                map?.openPopup(popupContent, e.latlng);
              }
            }}
          />
        );
      })}
      
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
    </>
  );
};

export default MapTab;