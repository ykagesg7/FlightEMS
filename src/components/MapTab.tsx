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
import { calculateMagneticBearing } from '../utils/bearing';
import { formatBearing } from '../utils/format';
import type { LatLng } from 'leaflet';

// Waypoint用のツールチップスタイルを追加
import './mapStyles.css';

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

// types/index.ts の Navaid 型とは異なる、Map 内で使用する Navaid 型を定義
interface MapNavaid {
  coordinates: LatLng;
  id: string;
  name: string;
}

const MapTab: React.FC<MapTabProps> = ({ flightPlan, setFlightPlan }) => {
  const routePoints = useMapRoute(flightPlan);
  const [map, setMap] = useState<L.Map | null>(null);
  const [cursorPosition, setCursorPosition] = useState<L.LatLng | null>(null);
  // Navaid の GeoJSON から取得したデータを保持
  const [navaidData, setNavaidData] = useState<MapNavaid[]>([]);
  // カーソル位置に基づく上位３件の Navaid 情報を保持
  const [navaidInfos, setNavaidInfos] = useState<Array<{ bearing: number, distance: number, id: string }>>([]);

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

  // Navaid GeoJSON を取得
  useEffect(() => {
    fetch('/geojson/Navaids.geojson')
      .then(res => res.json())
      .then(data => {
        const navaids = data.features.map((feat: any): MapNavaid => {
          const [lng, lat] = feat.geometry.coordinates;
          return { coordinates: L.latLng(lat, lng), id: feat.properties.id, name: feat.properties.name };
        });
        setNavaidData(navaids);
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (!cursorPosition || navaidData.length === 0) {
      setNavaidInfos([]);
      return;
    }
    // 各 navaid について、カーソルとの距離と磁方位を計算
    const calculations = navaidData.map(navaid => {
      const dist = cursorPosition.distanceTo(navaid.coordinates);
      const bearing = calculateMagneticBearing(
         navaid.coordinates.lat,
         navaid.coordinates.lng,
         cursorPosition.lat,
         cursorPosition.lng
      );
      return { navaid, bearing, distance: dist };
    });

    // 距離昇順にソートし、上位３件を抽出
    calculations.sort((a, b) => a.distance - b.distance);
    const infos = calculations.slice(0, 3).map(item => ({
      bearing: item.bearing,
      distance: parseFloat((item.distance / 1852).toFixed(1)),
      id: item.navaid.id,
    }));
    setNavaidInfos(infos);
  }, [cursorPosition, navaidData]);

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
            {navaidInfos.map((info, index) => (
              <div key={index}>
                位置(from Navaid{index + 1})： {Math.round(info.bearing)}°/{info.distance}nm {info.id}
              </div>
            ))}
          </div>
        ) : '位置(DMS/ DD)：--'}
      </div>
    </div>
  );
};

const MapContent: React.FC<{ flightPlan: FlightPlan, routePoints: [number, number][], map: L.Map | null }> = ({ flightPlan, map }) => {
  const layerControlRef = useRef<L.Control.Layers | null>(null) as LayerControlRef;

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
    "Common Layers": {
      "空港": L.geoJSON(null, {
        pointToLayer: (_, latlng) => {
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
          weight: 1.5,
          fillOpacity: 0.7,
          opacity: 0.9
        }),
        onEachFeature: (feature, layer) => {
          const coords = (feature.geometry as GeoJSON.Point).coordinates;
          let freqInfo = '';
          if (feature.properties.freq) {
            freqInfo = `<p class="text-sm font-bold">${feature.properties.freq} MHz</p>`;
          }
          let channelInfo = '';
          if (feature.properties.ch) {
            channelInfo = `<p class="text-sm text-gray-600">Channel: ${feature.properties.ch}</p>`;
          }
          
          let popupContent = `<div class="navaid-popup">
            <div class="navaid-popup-header">${feature.properties.id}</div>
            <div class="p-2">
              <p class="text-sm font-bold">${feature.properties.name || feature.properties.id}</p>
              <p class="text-sm text-gray-600">Type: ${feature.properties.type}</p>
              ${freqInfo}
              ${channelInfo}
              <p class="text-sm text-gray-600">Position: ${Number(coords[1]).toFixed(4)}°N, ${Number(coords[0]).toFixed(4)}°E</p>
            </div>
          </div>`;
          
          // ポップアップにカスタムクラスを付与
          const popup = L.popup({
            className: 'navaid-custom-popup',
            maxWidth: 250
          });
          popup.setContent(popupContent);
          layer.bindPopup(popup);
          
          // マウスオーバー時のツールチップ表示
          layer.bindTooltip(`${feature.properties.id}${feature.properties.freq ? ' - ' + feature.properties.freq + ' MHz' : ''}`, {
            permanent: false,
            direction: 'top',
            className: 'navaid-tooltip'
          });
          
          // クリックイベントの処理を追加
          layer.on('click', () => {
            console.log(`Navaid clicked: ${feature.properties.id}`);
          });
        }
      }),
      "Waypoints": L.geoJSON(null, {
        pointToLayer: (_, latlng) => L.circleMarker(latlng, {
          radius: 4,
          fillColor: "#FF9900",
          color: "#FF6600",
          weight: 1.5,
          fillOpacity: 0.7,
          opacity: 0.9
        }),
        onEachFeature: (feature, layer) => {
          const coords = (feature.geometry as GeoJSON.Point).coordinates;
          let popupContent = `<div class="waypoint-popup">
            <div class="waypoint-popup-header">${feature.properties.id}</div>
            <div class="p-2">
              <p class="text-sm font-bold">${feature.properties.name1 || '未設定'}</p>
              <p class="text-sm text-gray-600">Type: ${feature.properties.type}</p>
              <p class="text-sm text-gray-600">Position: ${Number(coords[1]).toFixed(4)}°N, ${Number(coords[0]).toFixed(4)}°E</p>
              <p class="text-xs text-gray-500 mt-2">クリックしてルートに追加</p>
            </div>
          </div>`;
          
          // ポップアップにカスタムクラスを付与
          const popup = L.popup({
            className: 'waypoint-custom-popup',
            maxWidth: 250
          });
          popup.setContent(popupContent);
          layer.bindPopup(popup);
          
          // マウスオーバー時のツールチップ表示
          layer.bindTooltip(feature.properties.id, {
            permanent: false,
            direction: 'top',
            className: 'waypoint-tooltip'
          });
          
          // クリックイベントを追加
          layer.on('click', () => {
            console.log(`Waypoint clicked: ${feature.properties.id}`);
            // ここで将来的にルートへの追加処理を実装できます
          });
        }
      }),
      "制限空域": L.geoJSON(null, { 
        style: { color: 'red', weight: 2, opacity: 0.7, dashArray: '4' },
        onEachFeature: onEachFeaturePopup 
      }),
      "高高度訓練空域": L.geoJSON(null, { 
        style: { color: 'purple', weight: 2, opacity: 0.7 },
        onEachFeature: onEachFeaturePopup 
      }),
      "低高度訓練空域": L.geoJSON(null, { 
        style: { color: 'yellow', weight: 2, opacity: 0.7 },
        onEachFeature: onEachFeaturePopup 
      }),
      "民間訓練空域": L.geoJSON(null, { 
        style: { color: 'brown', weight: 2, opacity: 0.7 },
        onEachFeature: onEachFeaturePopup 
      }),
      "RAPCON": L.geoJSON(null, { 
        style: { color: 'orange', weight: 2, opacity: 0.7 },
        onEachFeature: onEachFeaturePopup 
      }),
      "ACC-Sector High": L.geoJSON(null, { 
        style: { color: 'blue', weight: 2, opacity: 0.7 },
        onEachFeature: onEachFeaturePopup
      }),
      "ACC-Sector Low": L.geoJSON(null, { 
        style: { color: 'green', weight: 2, opacity: 0.7 },
        onEachFeature: onEachFeaturePopup 
      })
    },
    "Local Layers": {
      "RJFA": L.layerGroup(),
      "RJFZ": L.layerGroup()
    }
  }), [onEachFeaturePopup, getNavaidColor]);

  // GeoJSONデータをフェッチして各レイヤーに追加
  useEffect(() => {
    // Waypoints レイヤーのデータ取得
    fetch('/geojson/Waypoints.json')
      .then(res => res.json())
      .then(data => {
        if (map) {
          console.log(`Waypoints データを読み込みました。ポイント数: ${data.features.length}`);
          
          // GeoJSONデータをWaypointsレイヤーに追加
          const waypointsLayer = overlayLayers["Common Layers"]["Waypoints"] as L.GeoJSON;
          waypointsLayer.addData(data);
          
          // Waypointsレイヤーにカスタムクラスを追加し、他のレイヤーよりも前面に表示する
          waypointsLayer.eachLayer(layer => {
            if (layer instanceof L.Path) {
              layer.getElement()?.classList.add('leaflet-waypoint-layer');
              layer.bringToFront();
            }
          });
          
          // レイヤー状態が変わったときにWaypointsを最前面に配置
          map.on('overlayadd', () => {
            if (map.hasLayer(waypointsLayer)) {
              waypointsLayer.eachLayer(layer => {
                if (layer instanceof L.Path) {
                  layer.bringToFront();
                }
              });
            }
          });
        }
      })
      .catch(error => {
        console.error('Waypointsデータの読み込みに失敗しました:', error);
      });

    // ACC_Sector High/Low と他のレイヤーのデータ取得
    fetch('/geojson/ACC_Sector_High.geojson')
      .then(res => res.json())
      .then(data => {
        if (map) {
          overlayLayers["Common Layers"]["ACC-Sector High"].addData(data);
        }
      })
      .catch(console.error);

    fetch('/geojson/ACC_Sector_Low.geojson')
      .then(res => res.json())
      .then(data => {
        if (map) {
          overlayLayers["Common Layers"]["ACC-Sector Low"].addData(data);
        }
      })
      .catch(console.error);

    fetch('/geojson/RAPCON.geojson')
      .then(res => res.json())
      .then(data => {
        if (map) {
          overlayLayers["Common Layers"]["RAPCON"].addData(data);
        }
      })
      .catch(console.error);

    fetch('/geojson/RestrictedAirspace.geojson')
      .then(res => res.json())
      .then(data => {
        if (map) {
          overlayLayers["Common Layers"]["制限空域"].addData(data);
        }
      })
      .catch(console.error);

    fetch('/geojson/TrainingAreaCivil.geojson')
      .then(res => res.json())
      .then(data => {
        if (map) {
          overlayLayers["Common Layers"]["民間訓練空域"].addData(data);
        }
      })
      .catch(console.error);

    fetch('/geojson/TrainingAreaHigh.geojson')
      .then(res => res.json())
      .then(data => {
        if (map) {
          overlayLayers["Common Layers"]["高高度訓練空域"].addData(data);
        }
      })
      .catch(console.error);

    fetch('/geojson/TrainingAreaLow.geojson')
      .then(res => res.json())
      .then(data => {
        if (map) {
          overlayLayers["Common Layers"]["低高度訓練空域"].addData(data);
        }
      })
      .catch(console.error);

    // Airports レイヤーのデータ取得
    fetch('/geojson/Airports.geojson')
      .then(res => res.json())
      .then(data => {
        if (map) {
          console.log(`Airports データを読み込みました。ポイント数: ${data.features.length}`);
          
          // 空港レイヤーを作成 - より見やすく改善
          const airportsLayer = L.geoJSON(data, {
            pointToLayer: (feature, latlng) => {
              // カスタムアイコンを作成
              const airportIcon = L.icon({
                iconUrl: '/images/airport-icon.png',
                iconSize: [32, 32], // アイコンサイズを大きく
                iconAnchor: [16, 16],
                popupAnchor: [0, -16],
                className: 'airport-icon'
              });
              
              // 管制圏を表す円 (5nm = 9260m)
              const controlZone = L.circle(latlng, {
                radius: 9260,
                color: '#3cb371', // 緑色
                weight: 2,
                opacity: 0.8,
                fillColor: '#3cb371',
                fillOpacity: 0.1,
                dashArray: '5, 5'
              });
              
              // マーカーを作成
              const marker = L.marker(latlng, { icon: airportIcon });
              
              // マウスオーバー時のツールチップ表示
              marker.bindTooltip(`${feature.properties.id} - ${feature.properties.name1}`, {
                permanent: false,
                direction: 'top',
                className: 'airport-tooltip'
              });
              
              // マーカーと管制圏の円をレイヤーグループにまとめる
              return L.layerGroup([controlZone, marker]);
            },
            onEachFeature: (feature, layer) => {
              // GeoJSONから空港情報を取得して表示
              if (!feature.properties) return;
              
              // 空港タイプを取得
              const typeInfo = feature.properties.type 
                ? `<p class="text-sm mb-1"><span class="font-semibold">タイプ:</span> ${feature.properties.type}</p>` 
                : '';
                
              // 周波数情報を取得（存在する場合）
              const freqInfo = feature.properties.freq 
                ? `<p class="text-sm mb-1"><span class="font-semibold">周波数:</span> ${feature.properties.freq} MHz</p>` 
                : '';
              
              // チャンネル情報を取得（存在する場合）
              const chInfo = feature.properties.ch 
                ? `<p class="text-sm mb-1"><span class="font-semibold">チャンネル:</span> ${feature.properties.ch}</p>` 
                : '';
              
              // 滑走路情報を取得（存在する場合）
              const rwy1Info = feature.properties.RWY1 
                ? `<p class="text-sm mb-1"><span class="font-semibold">滑走路1:</span> ${feature.properties.RWY1}</p>` 
                : '';
              
              const rwy2Info = feature.properties.RWY2 
                ? `<p class="text-sm mb-1"><span class="font-semibold">滑走路2:</span> ${feature.properties.RWY2}</p>` 
                : '';
              
              // 空港標高を取得（存在する場合）
              const elevInfo = feature.properties["Elev(ft)"] 
                ? `<p class="text-sm mb-1"><span class="font-semibold">標高:</span> ${feature.properties["Elev(ft)"]} ft</p>` 
                : '';
              
              // 磁気偏差を取得（存在する場合）
              const magVarInfo = feature.properties["MAG Var"] !== undefined 
                ? `<p class="text-sm mb-1"><span class="font-semibold">磁気偏差:</span> ${feature.properties["MAG Var"]}°</p>` 
                : '';
              
              // 座標を取得（Pointジオメトリとして型チェック）
              const geometry = feature.geometry as GeoJSON.Point;
              const coords = geometry?.coordinates;
              const positionInfo = coords 
                ? `<p class="text-sm text-gray-600 mt-1"><span class="font-semibold">位置:</span> ${Number(coords[1]).toFixed(4)}°N, ${Number(coords[0]).toFixed(4)}°E</p>` 
                : '';
              
              const airportPopupContent = `
                <div class="airport-popup">
                  <div class="airport-popup-header">${feature.properties.id}</div>
                  <div class="p-2">
                    <h3 class="text-base font-bold mb-2">${feature.properties.name1}</h3>
                    ${typeInfo}
                    ${freqInfo}
                    ${chInfo}
                    ${rwy1Info}
                    ${rwy2Info}
                    ${elevInfo}
                    ${magVarInfo}
                    ${positionInfo}
                  </div>
                </div>
              `;
              
              const popup = L.popup({
                className: 'airport-custom-popup',
                maxWidth: 300
              });
              popup.setContent(airportPopupContent);
              
              if (layer instanceof L.LayerGroup) {
                layer.eachLayer(sublayer => {
                  sublayer.bindPopup(popup);
                  
                  // クリックイベントで気象情報を表示
                  sublayer.on('click', () => {
                    fetchAirportWeather(feature, map);
                  });
                });
              } else {
                layer.bindPopup(popup);
                
                // クリックイベントで気象情報を表示
                layer.on('click', () => {
                  fetchAirportWeather(feature, map);
                });
              }
            }
          });
          
          // レイヤーをマップに追加
          airportsLayer.addTo(map);
          
          // 空港レイヤーを"Common Layers"の"空港"として登録
          overlayLayers["Common Layers"]["空港"] = airportsLayer;
        }
      })
      .catch(error => {
        console.error('Airportsデータの読み込みに失敗しました:', error);
      });

    // Navaids レイヤーのデータ取得
    fetch('/geojson/Navaids.geojson')
      .then(res => res.json())
      .then(data => {
        if (map) {
          overlayLayers["Common Layers"]["Navaids"].addData(data);
        }
      })
      .catch(console.error);

    // RJFA レイヤーのデータ取得（ポイントのみの場合、グループごとにPolylineを描画）
    fetch('/geojson/RJFA.geojson')
      .then(res => res.json())
      .then(data => {
        const rjfaLayer = overlayLayers["Local Layers"]["RJFA"] as L.LayerGroup;
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
              className: 'local-marker-rjfa'
            });
            
            // カスタムポップアップコンテンツを作成
            const popupContent = `
              <div class="local-layer-popup">
                <div class="rjfa-popup-header">RJFA - ${feature.properties.name}</div>
                <div class="p-2">
                  <p class="text-sm my-1"><strong>ポイント:</strong> ${feature.properties.Point || '未設定'}</p>
                  <p class="text-sm my-1"><strong>高度:</strong> ${feature.properties.altitude || '未設定'}</p>
                  <p class="text-sm my-1"><strong>グループ:</strong> ${group}</p>
                </div>
              </div>
            `;
            
            // ポップアップにカスタムクラスを付与
            const popup = L.popup({
              className: 'rjfa-custom-popup',
              maxWidth: 250
            });
            popup.setContent(popupContent);
            marker.bindPopup(popup);
            
            // マウスオーバー時のツールチップ表示
            marker.bindTooltip(`${feature.properties.name}`, {
              permanent: false,
              direction: 'top',
              className: 'rjfa-tooltip'
            });
            
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
            
            // クリック時のイベント処理
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
                const bearing = calculateMagneticBearing(
                  startObj.latlng.lat, startObj.latlng.lng,
                  endObj.latlng.lat, endObj.latlng.lng
                );
                const formattedBearing = formatBearing(bearing) + '°';
                const distanceMeters = startObj.latlng.distanceTo(endObj.latlng);
                const distanceNM = Math.round(distanceMeters / 1852);
                
                // カスタムポップアップコンテンツを作成
                const popupContent = `
                  <div class="local-layer-popup">
                    <div class="rjfa-popup-header">RJFA - ${group}</div>
                    <div class="p-2">
                      <div class="local-layer-info">
                        <h3>${startObj.name} - ${endObj.name}</h3>
                        <div class="local-layer-route">
                          <p><strong>磁方位:</strong> ${formattedBearing}</p>
                          <p><strong>距離:</strong> ${distanceNM} nm</p>
                        </div>
                      </div>
                    </div>
                  </div>
                `;
                
                // ポップアップにカスタムクラスを付与して表示
                const popup = L.popup({
                  className: 'rjfa-custom-popup',
                  maxWidth: 250
                })
                  .setLatLng(e.latlng)
                  .setContent(popupContent);
                
                popup.openOn(map);
              }
            });
            polyline.addTo(rjfaLayer);
          }
        });
      })
      .catch(console.error);
  }, [overlayLayers, map]);

  // RJFZ GeoJSON をローカルレイヤーに追加 (RJFZ用のgroupごとのポリラインも追加)
  useEffect(() => {
    if (!map) return;
    fetch('/geojson/RJFZ.geojson')
      .then(res => res.json())
      .then(data => {
        const rjfzLayer = overlayLayers["Local Layers"]["RJFZ"] as L.LayerGroup;
        rjfzLayer.clearLayers();
        // 各ポイントをグループごとにまとめる
        const groupPoints: Record<string, { latlng: L.LatLng, name: string }[]> = {};
        
        data.features.forEach((feature: any) => {
          if (feature.geometry && feature.geometry.type === "Point") {
            const [lng, lat] = feature.geometry.coordinates;
            const group = feature.properties.group || "default";
            const marker = L.circleMarker([lat, lng], {
              radius: 5,
              fillColor: "green",
              color: "green",
              weight: 1,
              fillOpacity: 0.6,
              className: 'local-marker-rjfz'
            });
            
            // カスタムポップアップコンテンツを作成
            const popupContent = `
              <div class="local-layer-popup">
                <div class="rjfz-popup-header">RJFZ - ${feature.properties.name}</div>
                <div class="p-2">
                  <p class="text-sm my-1"><strong>ポイント:</strong> ${feature.properties.Point || '未設定'}</p>
                  <p class="text-sm my-1"><strong>高度:</strong> ${feature.properties.altitude || '未設定'}</p>
                  <p class="text-sm my-1"><strong>グループ:</strong> ${group}</p>
                </div>
              </div>
            `;
            
            // ポップアップにカスタムクラスを付与
            const popup = L.popup({
              className: 'rjfz-custom-popup',
              maxWidth: 250
            });
            popup.setContent(popupContent);
            marker.bindPopup(popup);
            
            // マウスオーバー時のツールチップ表示
            marker.bindTooltip(`${feature.properties.name}`, {
              permanent: false,
              direction: 'top',
              className: 'rjfz-tooltip'
            });
            
            marker.addTo(rjfzLayer);
            
            if (group) {
              if (!groupPoints[group]) {
                groupPoints[group] = [];
              }
              groupPoints[group].push({ latlng: L.latLng(lat, lng), name: feature.properties.name });
            }
          }
        });

        // 各グループごとに、2点以上あればポリラインを生成
        Object.keys(groupPoints).forEach(group => {
          const points = groupPoints[group];
          if (points.length >= 2) {
            const latlngs = points.map(p => p.latlng);
            const polyline = L.polyline(latlngs, { color: 'orange', weight: 2 });
            
            // クリック時のイベント処理
            polyline.on("click", (e: L.LeafletMouseEvent) => {
              if (!map) return;
              const labeledPoints = points; // 各ポイント(オブジェクト {latlng, name})
              const mapInstance = map;
              // クリック位置から各セグメントとの距離を計算するため、レイヤーポイントに変換
              const layerPoints = labeledPoints.map(pt => mapInstance.latLngToLayerPoint(pt.latlng));
              const clickPoint = mapInstance.latLngToLayerPoint(e.latlng);
              let bestSegmentIndex = -1;
              let minDistance = Infinity;
              for (let i = 0; i < layerPoints.length - 1; i++) {
                const dist = L.LineUtil.pointToSegmentDistance(clickPoint, layerPoints[i], layerPoints[i+1]);
                if (dist < minDistance) {
                  minDistance = dist;
                  bestSegmentIndex = i;
                }
              }
              
              if (bestSegmentIndex !== -1) {
                const startObj = labeledPoints[bestSegmentIndex];
                const endObj = labeledPoints[bestSegmentIndex + 1];
                const bearing = calculateMagneticBearing(
                  startObj.latlng.lat, startObj.latlng.lng,
                  endObj.latlng.lat, endObj.latlng.lng
                );
                const formattedBearing = formatBearing(bearing) + '°';
                const distanceMeters = startObj.latlng.distanceTo(endObj.latlng);
                const distanceNM = Math.round(distanceMeters / 1852);
                
                // カスタムポップアップコンテンツを作成
                const popupContent = `
                  <div class="local-layer-popup">
                    <div class="rjfz-popup-header">RJFZ - ${group}</div>
                    <div class="p-2">
                      <div class="local-layer-info">
                        <h3>${startObj.name} - ${endObj.name}</h3>
                        <div class="local-layer-route">
                          <p><strong>磁方位:</strong> ${formattedBearing}</p>
                          <p><strong>距離:</strong> ${distanceNM} nm</p>
                        </div>
                      </div>
                    </div>
                  </div>
                `;
                
                // ポップアップにカスタムクラスを付与して表示
                const popup = L.popup({
                  className: 'rjfz-custom-popup',
                  maxWidth: 250
                })
                  .setLatLng(e.latlng)
                  .setContent(popupContent);
                
                popup.openOn(mapInstance);
              }
            });
            polyline.addTo(rjfzLayer);
          }
        });

        if (!map.hasLayer(rjfzLayer)) {
          rjfzLayer.addTo(map);
        }
        // RJFZの各要素を前面に表示して、Airportsレイヤーより上になるようにする
        rjfzLayer.eachLayer(layer => {
           if (typeof (layer as any).bringToFront === 'function') {
              (layer as any).bringToFront();
           }
        });
      })
      .catch(console.error);
  }, [map, overlayLayers]);

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
      const control = L.control.groupedLayers(baseLayers, overlayLayers, {}) as any;
      control.addTo(map);
      console.log("baseLayers in useEffect:", baseLayers);
      layerControlRef.current = control;
      // 初期のベースレイヤーとして "地図" のタイルレイヤー (osmLayer) を追加する
      if (!map.hasLayer(osmLayer)) {
        osmLayer.addTo(map);
      }
      // 初期のオーバーレイとして「空港」、「制限空域」、「高高度訓練空域」を追加する
      const defaultOverlays = ["空港", "制限空域", "高高度訓練空域"];
      defaultOverlays.forEach(overlayName => {
        const layer = (overlayLayers["Common Layers"] as Record<string, L.Layer>)[overlayName];
        if (layer && !map.hasLayer(layer)) {
          layer.addTo(map);
        }
      });
      // Waypointsレイヤーは明示的に非表示に設定（ユーザーがレイヤーコントロールから選択できるようにする）
      const waypointsLayer = (overlayLayers["Common Layers"] as Record<string, L.Layer>)["Waypoints"];
      if (waypointsLayer && map.hasLayer(waypointsLayer)) {
        map.removeLayer(waypointsLayer);
      }
      // 初期のローカルオーバーレイとして "RJFA" を追加する
      const defaultLocalOverlays = ["RJFA"];
      defaultLocalOverlays.forEach(overlayName => {
        const layer = (overlayLayers["Local Layers"] as Record<string, L.Layer>)[overlayName];
        if (layer && !map.hasLayer(layer)) {
          layer.addTo(map);
        }
      });
    } else {
      // 既存のレイヤーコントロールを更新する
      (Object.keys(baseLayers) as Array<keyof typeof baseLayers>).forEach(key => {
        layerControlRef.current?.removeLayer(baseLayers[key]);
        layerControlRef.current?.addBaseLayer(baseLayers[key], key);
      });

      // 各グループごとにネストしてオーバーレイレイヤーを更新する
      Object.entries(overlayLayers).forEach(([groupName, groupOverlays]) => {
        Object.entries(groupOverlays as Record<string, L.Layer>).forEach(([overlayName, overlayLayer]) => {
          layerControlRef.current?.removeLayer(overlayLayer);
          (layerControlRef.current as any)?.addOverlay(overlayLayer, overlayName, groupName);
        });
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
                const bearing = calculateMagneticBearing(start[0], start[1], end[0], end[1]);
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

// 空港の気象情報を取得して表示する関数
const fetchAirportWeather = (feature: GeoJSON.Feature, map: L.Map) => {
  if (!feature.properties || !feature.geometry) return;
  
  const airportId = feature.properties.id;
  const geometry = feature.geometry as GeoJSON.Point;
  const [longitude, latitude] = geometry.coordinates;
  
  console.log(`${airportId} 空港の気象情報を取得します`);
  
  // Vercel Functionsを使用してAPIリクエストを中継
  const weatherApiUrl = `/api/weather?lat=${latitude}&lon=${longitude}`;
  
  // 気象情報を取得中のポップアップを表示
  const loadingPopupContent = `
    <div class="airport-popup">
      <div class="airport-popup-header">${feature.properties?.id || '不明'}</div>
      <div class="p-2">
        <h3 class="text-base font-bold mb-2">${feature.properties?.name1 || '空港'}</h3>
        <p class="text-sm">気象情報を読み込み中...</p>
        <div class="flex justify-center my-2">
          <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-green-500"></div>
        </div>
      </div>
    </div>
  `;
  
  const loadingPopup = L.popup({
    className: 'airport-custom-popup',
    maxWidth: 300
  })
    .setLatLng([latitude, longitude])
    .setContent(loadingPopupContent)
    .openOn(map);
  
  // 気象情報APIをフェッチ（APIキーが含まれないURLを使用）
  fetch(weatherApiUrl)
    .then(response => {
      if (!response.ok) {
        throw new Error(`気象API応答エラー: ${response.status}`);
      }
      return response.json();
    })
    .then(weatherData => {
      // 気象情報ポップアップを作成して表示
      const weatherPopupContent = createWeatherPopupContent(feature.properties, weatherData);
      
      loadingPopup.setContent(weatherPopupContent);
      loadingPopup.update();
    })
    .catch(error => {
      console.error('気象データの取得に失敗しました:', error);
      
      // エラー時は基本情報のみのポップアップを表示
      const errorPopupContent = `
        <div class="airport-popup airport-weather-popup">
          <div class="airport-popup-header">
            ${feature.properties?.id || '不明'}（${feature.properties?.name1?.split('(')[0].trim() || '空港'}）
          </div>
          <div class="p-3">
            <div>
              <p class="text-sm text-red-500 mb-3">気象情報の取得に失敗しました</p>
              
              <h4 class="text-base font-bold mb-2 text-green-800 border-b border-green-200 pb-1">〇空港情報</h4>
              <div class="ml-2">
                ${simplifiedAirportInfoContent(feature.properties)}
              </div>
            </div>
          </div>
        </div>
      `;
      
      loadingPopup.setContent(errorPopupContent);
      loadingPopup.update();
    });
};

// 気象情報ポップアップコンテンツを作成する関数
const createWeatherPopupContent = (airportProps: any, weatherData: any) => {
  // 気象データが正しく取得できたかチェック
  const current = weatherData?.current;
  
  if (!current) {
    return `
      <div class="airport-popup airport-weather-popup">
        <div class="airport-popup-header">
          ${airportProps.id}（${airportProps.name1.split('(')[0].trim()}）
        </div>
        <div class="p-3">
          <p class="text-sm text-red-500">気象データが不完全です</p>
        </div>
      </div>
    `;
  }
  
  // フィルタリング済みのデータから日本語の天気状態を取得
  const conditionText = current.condition.japanese || current.condition.text;
  const temp = current.temp_c !== undefined ? `${current.temp_c}℃` : '取得できません';
  
  // 風向を3桁の度数表示に変更 (例: "039°/10kt")
  const windDegree = current.wind.degree !== undefined ? current.wind.degree : null;
  const windSpeedKnots = current.wind.knots !== undefined ? current.wind.knots : null;
  const windInfo = (windDegree !== null && windSpeedKnots !== null) 
    ? `${windDegree.toString().padStart(3, '0')}°/${windSpeedKnots}kt`
    : '取得できません';
  
  // 気圧（inchHgフォーマット）
  const pressureInch = current.pressure.inch !== undefined 
    ? `${current.pressure.inch}inch`
    : '取得できません';
  
  // 視程
  const visibility = current.visibility_km !== undefined ? `${current.visibility_km}km` : '取得できません';
  
  // 日の出・日の入り時刻
  const astronomy = weatherData.astronomy;
  const sunrise = astronomy?.sunrise || '情報なし';
  const sunset = astronomy?.sunset || '情報なし';
  const sunriseSunset = `${sunrise}/${sunset}`;
  
  // 最終更新日時
  const lastUpdated = current.last_updated || '不明';
  
  // アイコン表示部分
  const iconUrl = current.condition.icon ? `https:${current.condition.icon}` : '';
  const iconHtml = iconUrl ? `<img src="${iconUrl}" alt="${conditionText}" class="weather-icon">` : '';
  
  // 空港情報の簡略化バージョン
  const simplifiedAirportInfo = simplifiedAirportInfoContent(airportProps);
  
  return `
    <div class="airport-popup airport-weather-popup">
      <div class="airport-popup-header">
        ${airportProps.id}（${airportProps.name1.split('(')[0].trim()}）
      </div>
      <div class="p-3">
        <div class="mb-4">
          <div class="flex justify-between items-center mb-2">
            <h4 class="text-base font-bold text-green-800 border-b border-green-200 pb-1">〇気象情報</h4>
            ${iconHtml}
          </div>

          <div class="ml-2 weather-info-grid">
            <p class="text-sm mb-2 weather-item">
              <span class="weather-label">・天気状態</span>
              <span class="weather-value">${conditionText}</span>
            </p>
            <p class="text-sm mb-2 weather-item">
              <span class="weather-label">・温度</span>
              <span class="weather-value">${temp}</span>
            </p>
            <p class="text-sm mb-2 weather-item">
              <span class="weather-label">・風</span>
              <span class="weather-value">${windInfo}</span>
            </p>
            <p class="text-sm mb-2 weather-item">
              <span class="weather-label">・気圧</span>
              <span class="weather-value">${pressureInch}</span>
            </p>
            <p class="text-sm mb-2 weather-item">
              <span class="weather-label">・視程</span>
              <span class="weather-value">${visibility}</span>
            </p>
            <p class="text-sm mb-2 weather-item">
              <span class="weather-label">・日の出/日の入り</span>
              <span class="weather-value">${sunriseSunset}</span>
            </p>
            <p class="text-xs mt-1 text-gray-500 weather-update-time">
              <span>最終更新：${lastUpdated}</span>
            </p>
          </div>
        </div>
        
        <div>
          <h4 class="text-base font-bold mb-2 text-green-800 border-b border-green-200 pb-1">〇空港情報</h4>
          <div class="ml-2 airport-info-grid">
            ${simplifiedAirportInfo}
          </div>
        </div>
      </div>
    </div>
  `;
};

// 簡略化した空港情報コンテンツを作成する関数
const simplifiedAirportInfoContent = (properties: any) => {
  // 滑走路情報をサンプルの形式に合わせる（例: 16-34(9187*197)）
  const formatRunway = (runwayInfo: string) => {
    if (!runwayInfo) return '';
    
    // 通常、RWY1は "RWY16/34 9187*197" のような形式
    const match = runwayInfo.match(/RWY(\d+)\/(\d+)\s+(\d+)\*(\d+)/i);
    if (match) {
      const rwy1 = match[1];
      const rwy2 = match[2];
      const length = match[3];
      const width = match[4];
      return `${rwy1}-${rwy2}(${length}*${width})`;
    }
    
    return runwayInfo; // パターンにマッチしない場合はそのまま返す
  };
  
  // 滑走路情報を取得（存在する場合）
  const rwy1Info = properties.RWY1 
    ? `<p class="text-sm mb-2 airport-item">
         <span class="airport-label">・滑走路１</span>
         <span class="airport-value">${formatRunway(properties.RWY1)}</span>
       </p>` 
    : '';
  
  // 空港標高を取得（存在する場合）
  const elevInfo = properties["Elev(ft)"] 
    ? `<p class="text-sm mb-2 airport-item">
         <span class="airport-label">・標高</span>
         <span class="airport-value">${properties["Elev(ft)"]}ft</span>
       </p>` 
    : '';
  
  return `
    ${rwy1Info}
    ${elevInfo}
  `;
};

export default MapTab;