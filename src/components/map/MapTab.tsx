import type { LatLng } from 'leaflet';
import L from 'leaflet';
import 'leaflet-groupedlayercontrol';
import 'leaflet-groupedlayercontrol/dist/leaflet.groupedlayercontrol.min.css';
import 'leaflet/dist/leaflet.css';
import { CircleMarker, MapContainer, Polyline, Popup } from 'react-leaflet';
import { fetchWeatherData } from '../../api/weather';
import { CACHE_DURATION, useWeatherCache } from '../../contexts/WeatherCacheContext';
import { FlightPlan, Waypoint } from '../../types/index';
import {
  NavaidGeoJSONFeature
} from '../../types/map';
import { DEFAULT_CENTER, DEFAULT_ZOOM, formatDMS } from '../../utils';
import { calculateMagneticBearing } from '../../utils/bearing';
import { formatBearing } from '../../utils/format';
import icon from '/images/marker-icon.png';
import iconShadow from '/images/marker-shadow.png';

// Waypoint用のツールチップスタイルを追加
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { fetchAirportWeather as fetchAirportWeatherLayer } from './layers/airports';
import { bindNavaidPopup, navaidMarkerOptions } from './layers/navaids';
import { bindWaypointPopup } from './layers/waypoints';
import './mapStyles.css';
import { simplifiedAirportInfoContent } from './popups/airportPopup';

import React from 'react';

const DefaultIcon = L.icon({
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

// リージョン情報の型を定義
interface Region {
  id: string;
  name: string;
  source: string;
}

const MapTab: React.FC<MapTabProps> = ({ flightPlan, setFlightPlan }) => {
  const [map, setMap] = useState<L.Map | null>(null);
  const [cursorPosition, setCursorPosition] = useState<L.LatLng | null>(null);
  // Navaid の GeoJSON から取得したデータを保持
  const [navaidData, setNavaidData] = useState<MapNavaid[]>([]);
  // カーソル位置に基づく上位３件の Navaid 情報を保持
  const [navaidInfos, setNavaidInfos] = useState<Array<{ bearing: number, distance: number, id: string }>>([]);
  // リージョン情報を保持
  const [regions, setRegions] = useState<Region[]>([]);

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
        type: 'custom' as const,  // 例えば、カスタムウェイポイントとして設定
        coordinates: [lng, lat] as [number, number],  // タプルとしてキャスト
      };
      setFlightPlan((prev: FlightPlan) => ({
        ...prev,
        waypoints: [...prev.waypoints, newWaypoint],
      }));
    };
    map.on('dblclick', onDblClick);
    return () => {
      map.off('dblclick', onDblClick);
    };
  }, [map, setFlightPlan]);

  // リージョン情報を取得
  useEffect(() => {
    fetch('/geojson/waypoints/regions_index.json')
      .then(res => res.json())
      .then(data => {
        setRegions(data.regions);
      })
      .catch(console.error);
  }, []);

  // Navaid GeoJSON を取得
  useEffect(() => {
    fetch('/geojson/Navaids.geojson')
      .then(res => res.json())
      .then((data: { features: NavaidGeoJSONFeature[] }) => {
        const navaids = data.features.map((feat: NavaidGeoJSONFeature): MapNavaid => {
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
    <div className="relative h-[calc(100vh-4rem)] bg-[color:var(--bg)] rounded-lg shadow-sm overflow-hidden">
      <MapContainer
        center={[DEFAULT_CENTER.lat, DEFAULT_CENTER.lng]}
        zoom={DEFAULT_ZOOM}
        className="h-full w-full"
        ref={setMap}
      >
        <MapContent
          flightPlan={flightPlan}
          map={map}
          setFlightPlan={setFlightPlan}
          regions={regions}
        />
      </MapContainer>
      <div className="absolute bottom-2 left-2 z-[9999] pointer-events-none hud-overlay-panel text-[color:var(--text-primary)] px-2 py-1 rounded max-w-full sm:max-w-sm md:max-w-md">
        {cursorPosition ? (
          <div className="text-xs sm:text-sm space-y-0.5">
            <div className="text-2xs sm:text-xs hud-text hud-readout">{formatDMS(cursorPosition.lat, cursorPosition.lng)}</div>
            <div className="text-2xs sm:text-xs">位置(Degree)： {cursorPosition.lat.toFixed(4)}°N, {cursorPosition.lng.toFixed(4)}°E</div>
            {navaidInfos.map((info, index) => (
              <div key={index} className="text-2xs sm:text-xs truncate">
                位置(from Navaid{index + 1})： <span className="hud-text hud-readout">{Math.round(info.bearing)}°/{info.distance}nm</span> {info.id}
              </div>
            ))}
          </div>
        ) : <span className="text-xs sm:text-sm">位置(DMS/ DD)：--</span>}
      </div>
    </div>
  );
};

const MapContent: React.FC<{
  flightPlan: FlightPlan,
  map: L.Map | null,
  setFlightPlan: React.Dispatch<React.SetStateAction<FlightPlan>>,
  regions: Region[]
}> = React.memo(({ flightPlan, map, setFlightPlan, regions }) => {
  const layerControlRef = useRef<L.Control.Layers | null>(null) as LayerControlRef;
  // 各地域のWaypointレイヤーを保持する参照
  const regionLayersRef = useRef<{ [key: string]: L.GeoJSON }>({});
  // すべてのWaypointレイヤーを保持する参照
  const allWaypointsLayerRef = useRef<L.GeoJSON | null>(null);
  // Context経由でキャッシュデータにアクセス
  const { weatherCache, setWeatherCache } = useWeatherCache();

  // 各フィーチャーをクリック時に詳細情報をポップアップ表示するための関数
  const onEachFeaturePopup = useCallback((feature: GeoJSON.Feature, layer: L.Layer) => {
    if (feature.properties && feature.properties.id) {
      const popupContent = `
        <div class="airport-popup">
          <div class="airport-popup-header">
            ${feature.properties.id}（${feature.properties.name1?.split('(')[0].trim() || '空港'}）
          </div>
          <div class="p-3">
            <div>
              <h4 class="text-base font-bold mb-2 text-green-800 border-b border-green-200 pb-1">〇空港情報</h4>
              <div class="ml-2">
                ${simplifiedAirportInfoContent(feature.properties)}
              </div>
            </div>
          </div>
        </div>
      `;
      layer.bindPopup(popupContent);
    }
  }, []);

  // Waypointのスタイル設定関数
  const waypointStyle = useCallback((feature: any) => {
    return {
      radius: 4,
      fillColor: feature.properties?.type === "Compulsory" ? "#FF9900" : "#66CCFF",
      color: feature.properties?.type === "Compulsory" ? "#FF6600" : "#3399CC",
      weight: 1.5,
      fillOpacity: 0.7,
      opacity: 0.9
    };
  }, []);

  // Waypointのポップアップ設定関数
  const waypointPopup = useCallback((feature: GeoJSON.Feature, layer: L.Layer, setFlightPlan: React.Dispatch<React.SetStateAction<FlightPlan>>, map: L.Map | null) => {
    const coords = (feature.geometry as GeoJSON.Point).coordinates;
    const popupContent = `<div class="waypoint-popup">
      <div class="waypoint-popup-header">${feature.properties?.id}</div>
      <div class="p-2">
        <p class="text-xs font-bold">${feature.properties?.name1 || '未設定'}</p>
        <p class="text-xs popup-value">Type: ${feature.properties?.type}</p>
        <p class="text-xs popup-value position-info">Position: ${Number(coords[1]).toFixed(4)}°N, ${Number(coords[0]).toFixed(4)}°E</p>
        <button class="add-to-route-btn mt-2 bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded text-xs">ルートに追加</button>
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
    layer.bindTooltip(feature.properties?.id || '', {
      permanent: false,
      direction: 'top',
      className: 'waypoint-tooltip'
    });

    // クリックイベントを追加
    layer.on('click', () => {
      console.log(`Waypoint clicked: ${feature.properties?.id}`);

      // ポップアップが表示された後に「ルートに追加」ボタンにイベントリスナーを追加
      setTimeout(() => {
        const addButton = document.querySelector('.waypoint-custom-popup .add-to-route-btn');
        if (addButton) {
          addButton.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();

            // Waypointをウェイポイントとして追加
            const newWaypoint: Waypoint = {
              id: feature.properties?.id || '',
              name: feature.properties?.name1 || feature.properties?.id || '',
              type: 'custom',
              coordinates: [coords[0], coords[1]],
              latitude: coords[1],
              longitude: coords[0]
            };

            setFlightPlan((prev: FlightPlan) => ({
              ...prev,
              waypoints: [...prev.waypoints, newWaypoint]
            }));

            // 成功メッセージを表示
            if (map) {
              const successMsg = L.DomUtil.create('div', 'success-message');
              successMsg.innerHTML = `${feature.properties?.id}をルートに追加しました`;
              successMsg.style.position = 'absolute';
              successMsg.style.bottom = '10px';
              successMsg.style.left = '50%';
              successMsg.style.transform = 'translateX(-50%)';
              successMsg.style.backgroundColor = 'rgba(52, 211, 153, 0.9)';
              successMsg.style.color = 'white';
              successMsg.style.padding = '10px 20px';
              successMsg.style.borderRadius = '4px';
              successMsg.style.zIndex = '1000';

              document.body.appendChild(successMsg);

              // 3秒後にメッセージを削除
              setTimeout(() => {
                document.body.removeChild(successMsg);
              }, 3000);

              // ポップアップを閉じる
              map.closePopup();
            }
          });
        }
      }, 100);
    });
  }, []);

  // overlayLayers を useMemo で安定したオブジェクトとして生成
  const overlayLayers = useMemo(() => {
    // 共通レイヤーの定義
    const commonLayers: { [key: string]: L.Layer } = {
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
        pointToLayer: (feature, latlng) => L.circleMarker(latlng, navaidMarkerOptions((feature.properties as any).type)),
        onEachFeature: (feature, layer) => bindNavaidPopup(feature, layer, setFlightPlan, map)
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
    };

    // Waypointsグループの作成
    const waypointLayers: { [key: string]: L.Layer } = {};

    // すべてのウェイポイントを表示するレイヤーを作成
    const allWaypointsLayer = L.geoJSON(null, {
      pointToLayer: (feature, latlng) => L.circleMarker(latlng, waypointStyle(feature)),
      onEachFeature: (feature, layer) => bindWaypointPopup(feature, layer, setFlightPlan, map)
    });

    // すべてのウェイポイントレイヤーを参照に保存
    allWaypointsLayerRef.current = allWaypointsLayer;

    // すべてのウェイポイントを表示するレイヤーをリストに追加
    waypointLayers["すべて"] = allWaypointsLayer;

    // 地域ごとのウェイポイントレイヤーを作成
    regions.forEach(region => {
      const regionLayer = L.geoJSON(null, {
        pointToLayer: (feature, latlng) => L.circleMarker(latlng, waypointStyle(feature)),
        onEachFeature: (feature, layer) => bindWaypointPopup(feature, layer, setFlightPlan, map)
      });

      // 地域レイヤーをリストに追加
      waypointLayers[region.name] = regionLayer;

      // 地域レイヤーを参照に保存
      regionLayersRef.current[region.id] = regionLayer;
    });

    return {
      "Common Layers": commonLayers,
      "Waypoints": waypointLayers,
      "Local Layers": {
        "RJFA": L.layerGroup(),
        "RJFZ": L.layerGroup()
      }
    };
  }, [regions, map, setFlightPlan, onEachFeaturePopup, waypointStyle, waypointPopup]);

  // 地域ごとのウェイポイントデータを読み込む関数
  const loadRegionWaypointsData = useCallback((regionId: string) => {
    if (!map) return;
    const regionLayer = regionLayersRef.current[regionId];
    if (!regionLayer) return;

    // 既にデータが読み込まれている場合はスキップ
    if (regionLayer.getLayers().length > 0) return;

    const filePath = `/geojson/waypoints/waypoints_region_${regionId}.json`;

    fetch(filePath)
      .then(res => res.json())
      .then(data => {
        console.log(`${regionId}ウェイポイントデータを読み込みました。ポイント数: ${data.features.length}`);

        // GeoJSONデータを地域レイヤーに追加
        regionLayer.addData(data);

        // 地域レイヤーにカスタムクラスを追加
        regionLayer.eachLayer(layer => {
          if (layer instanceof L.Path) {
            layer.getElement()?.classList.add('leaflet-waypoint-layer');
            layer.bringToFront();
          }
        });
      })
      .catch(error => {
        console.error(`${regionId}ウェイポイントデータの読み込みに失敗しました:`, error);
      });
  }, [map]);

  // すべてのウェイポイントデータを読み込む関数
  const loadAllWaypointsData = useCallback(() => {
    if (!map || !allWaypointsLayerRef.current) return;
    const allWaypointsLayer = allWaypointsLayerRef.current;

    // 既にデータが読み込まれている場合はスキップ
    if (allWaypointsLayer.getLayers().length > 0) return;

    fetch('/geojson/Waypoints.json')
      .then(res => res.json())
      .then(data => {
        console.log(`すべてのウェイポイントデータを読み込みました。ポイント数: ${data.features.length}`);

        // GeoJSONデータを追加
        allWaypointsLayer.addData(data);

        // カスタムクラスを追加
        allWaypointsLayer.eachLayer(layer => {
          if (layer instanceof L.Path) {
            layer.getElement()?.classList.add('leaflet-waypoint-layer');
            layer.bringToFront();
          }
        });
      })
      .catch(error => {
        console.error('すべてのウェイポイントデータの読み込みに失敗しました:', error);
      });
  }, [map]);

  // GeoJSONデータをフェッチして各レイヤーに追加
  useEffect(() => {
    // ACC_Sector High/Low と他のレイヤーのデータ取得
    fetch('/geojson/ACC_Sector_High.geojson')
      .then(res => res.json())
      .then(data => {
        if (map) {
          (overlayLayers["Common Layers"]["ACC-Sector High"] as L.GeoJSON).addData(data);
        }
      })
      .catch(console.error);

    fetch('/geojson/ACC_Sector_Low.geojson')
      .then(res => res.json())
      .then(data => {
        if (map) {
          (overlayLayers["Common Layers"]["ACC-Sector Low"] as L.GeoJSON).addData(data);
        }
      })
      .catch(console.error);

    fetch('/geojson/RAPCON.geojson')
      .then(res => res.json())
      .then(data => {
        if (map) {
          (overlayLayers["Common Layers"]["RAPCON"] as L.GeoJSON).addData(data);
        }
      })
      .catch(console.error);

    fetch('/geojson/RestrictedAirspace.geojson')
      .then(res => res.json())
      .then(data => {
        if (map) {
          (overlayLayers["Common Layers"]["制限空域"] as L.GeoJSON).addData(data);
        }
      })
      .catch(console.error);

    fetch('/geojson/TrainingAreaCivil.geojson')
      .then(res => res.json())
      .then(data => {
        if (map) {
          (overlayLayers["Common Layers"]["民間訓練空域"] as L.GeoJSON).addData(data);
        }
      })
      .catch(console.error);

    fetch('/geojson/TrainingAreaHigh.geojson')
      .then(res => res.json())
      .then(data => {
        if (map) {
          (overlayLayers["Common Layers"]["高高度訓練空域"] as L.GeoJSON).addData(data);
        }
      })
      .catch(console.error);

    fetch('/geojson/TrainingAreaLow.geojson')
      .then(res => res.json())
      .then(data => {
        if (map) {
          (overlayLayers["Common Layers"]["低高度訓練空域"] as L.GeoJSON).addData(data);
        }
      })
      .catch(console.error);

    // Airports レイヤーのデータ取得
    fetch('/geojson/Airports.geojson')
      .then(res => res.json())
      .then(data => {
        if (map && map.getContainer() && map.getContainer().clientWidth > 0) {
          console.log(`Airports データを読み込みました。ポイント数: ${data.features.length}`);

          try {
            // 空港レイヤーを作成 - より見やすく改善
            const airportsLayer = L.geoJSON(data, {
              pointToLayer: (feature, latlng) => {
                // 黒い丸マーカーを作成
                const circleMarker = L.circleMarker(latlng, {
                  radius: 3,
                  fillColor: '#000000',
                  color: '#000000',
                  weight: 2,
                  opacity: 1.0,
                  fillOpacity: 1.0
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

                // マウスオーバー時のツールチップ表示
                circleMarker.bindTooltip(`${feature.properties.id} - ${feature.properties.name1}`, {
                  permanent: false,
                  direction: 'top',
                  className: 'airport-tooltip'
                });

                // 黒丸マーカーに直接クリックイベントを追加
                circleMarker.on('click', () => {
                  if (map) {
                    console.log(`${feature.properties.id} 空港のマーカーが直接クリックされました`);
                    fetchAirportWeatherLayer(feature, map, weatherCache, setWeatherCache, fetchWeatherData, CACHE_DURATION);
                  }
                });

                // マーカーと管制圏の円をレイヤーグループにまとめる
                return L.layerGroup([controlZone, circleMarker]);
              },
              onEachFeature: (feature, layer) => {
                // クリック時のポップアップやイベント処理を追加
                const popupContent = `<div>
                  <h2 class="font-bold text-lg">${feature.properties.name1}</h2>
                  <p class="text-sm">ID: ${feature.properties.id}</p>
                  <p class="text-sm">Type: ${feature.properties.type}</p>
                  <p class="text-sm">Elevation: ${feature.properties["Elev(ft)"]} ft</p>
                  <p class="text-sm">Runway: ${feature.properties.RWY1}</p>
                  ${feature.properties.RWY2 ? `<p class="text-sm">Runway2: ${feature.properties.RWY2}</p>` : ''}
                  ${feature.properties.RWY3 ? `<p class="text-sm">Runway3: ${feature.properties.RWY3}</p>` : ''}
                  ${feature.properties.RWY4 ? `<p class="text-sm">Runway4: ${feature.properties.RWY4}</p>` : ''}
                </div>`;

                // ポップアップを作成して設定
                const popup = L.popup({
                  className: 'airport-custom-popup',
                  maxWidth: 300
                });
                popup.setContent(popupContent);
                layer.bindPopup(popup);

                // レイヤーグループへのクリックイベントも残しておく
                layer.on('click', () => {
                  if (map) {
                    console.log(`${feature.properties.id} 空港のレイヤーグループがクリックされました`);
                    fetchAirportWeatherLayer(feature, map, weatherCache, setWeatherCache, fetchWeatherData, CACHE_DURATION);
                  }
                });
              }
            });

            // 既存プレースホルダー "空港" レイヤーにデータを追加する。
            const airportsPlaceholder = overlayLayers["Common Layers"]["空港"] as L.GeoJSON;
            airportsPlaceholder.clearLayers();
            airportsPlaceholder.addLayer(airportsLayer);

            // 自動的にマップへ追加しない。
          } catch (error) {
            console.error('Airportsデータの処理中にエラーが発生しました:', error);
          }
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
          (overlayLayers["Common Layers"]["Navaids"] as L.GeoJSON).addData(data);
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

        // レイヤーを一度クリアする
        rjfaLayer.clearLayers();

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

        // 注意: 初期状態ではレイヤーはマップに追加しない
        // if (map.hasLayer(rjfaLayer)) {
        //   map.addLayer(rjfaLayer);
        // }
      })
      .catch(console.error);
  }, [overlayLayers, map, weatherCache, setWeatherCache]);

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
                const dist = L.LineUtil.pointToSegmentDistance(clickPoint, layerPoints[i], layerPoints[i + 1]);
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

        // 注意: 初期状態ではレイヤーはマップに追加しない
        // if (!map.hasLayer(rjfzLayer)) {
        //   rjfzLayer.addTo(map);
        // }

        // RJFZの各要素を前面に表示して、Airportsレイヤーより上になるようにする
        rjfzLayer.eachLayer(layer => {
          if (typeof (layer as any).bringToFront === 'function') {
            (layer as any).bringToFront();
          }
        });
      })
      .catch(console.error);
  }, [map, overlayLayers, weatherCache, setWeatherCache]);

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

    try {
      // レイヤーコントロールがまだ追加されていない場合、新規作成して追加
      if (!layerControlRef.current) {
        console.log("レイヤーコントロールを初期化します");
        const control = L.control.groupedLayers(baseLayers, overlayLayers as any, {
          collapsed: true, // デフォルトで格納状態に変更
          position: 'topright'
        }) as any;

        control.addTo(map);
        console.log("baseLayers in useEffect:", baseLayers);
        layerControlRef.current = control;

        // 初期のベースレイヤーとして "地図" のタイルレイヤー (osmLayer) を追加する
        if (!map.hasLayer(osmLayer)) {
          osmLayer.addTo(map);
        }

        // --- 初期状態ではオーバーレイを追加しない ---
        // ユーザーがレイヤーコントロールで選択した際にのみ表示されるようにする。

        // Waypointsの地域レイヤー名を取得（「すべて」を除く）
        const waypointRegions = Object.keys((overlayLayers["Waypoints"] as Record<string, L.Layer>))
          .filter(name => name !== 'すべて');

        // 「すべて」レイヤーが追加されたとき、他のすべてのWaypointレイヤーも追加
        map.on('overlayadd', (e: L.LayersControlEvent) => {
          const layerName = e.name;

          // 「すべて」レイヤーが追加された場合
          if (layerName === 'すべて' && e.layer === (overlayLayers["Waypoints"] as Record<string, L.Layer>)['すべて']) {
            // すべてのウェイポイントデータを読み込む
            loadAllWaypointsData();

            // 他のすべての地域レイヤーを追加（イベントの無限ループを防ぐためにデバウンスを使用）
            setTimeout(() => {
              waypointRegions.forEach(regionName => {
                const regionLayer = (overlayLayers["Waypoints"] as Record<string, L.Layer>)[regionName];
                if (regionLayer && !map.hasLayer(regionLayer)) {
                  regionLayer.addTo(map);

                  // 対応する地域のデータを読み込む
                  const region = regions.find(r => r.name === regionName);
                  if (region) {
                    loadRegionWaypointsData(region.id);
                  }
                }
              });
            }, 10);
          }
          // 通常のWaypointレイヤーが追加された場合
          else if (Object.keys((overlayLayers["Waypoints"] as Record<string, L.Layer>)).includes(layerName)) {
            if (layerName === 'すべて') {
              loadAllWaypointsData();
            } else {
              // 地域名から地域IDを取得
              const region = regions.find(r => r.name === layerName);
              if (region) {
                // 地域ウェイポイントデータを読み込む
                loadRegionWaypointsData(region.id);
              }
            }
          }

          // Waypointレイヤーが追加された場合、最前面に表示する
          setTimeout(() => {
            const layerObj = e.layer;
            if (layerObj instanceof L.GeoJSON) {
              layerObj.eachLayer(layer => {
                if (layer instanceof L.Path) {
                  layer.bringToFront();
                }
              });
            }
          }, 100);
        });

        // 「すべて」レイヤーが削除されたとき、他のすべてのWaypointレイヤーも削除
        map.on('overlayremove', (e: L.LayersControlEvent) => {
          const layerName = e.name;

          // 「すべて」レイヤーが削除された場合
          if (layerName === 'すべて' && e.layer === (overlayLayers["Waypoints"] as Record<string, L.Layer>)['すべて']) {
            // 他のすべての地域レイヤーを削除（イベントの無限ループを防ぐためにデバウンスを使用）
            setTimeout(() => {
              waypointRegions.forEach(regionName => {
                const regionLayer = (overlayLayers["Waypoints"] as Record<string, L.Layer>)[regionName];
                if (regionLayer && map.hasLayer(regionLayer)) {
                  map.removeLayer(regionLayer);
                }
              });
            }, 10);
          }

          // ローカルレイヤーが削除された場合、レイヤーグループを完全にクリアする
          if (layerName === 'RJFA' || layerName === 'RJFZ') {
            const localLayer = (overlayLayers["Local Layers"] as Record<string, L.Layer>)[layerName] as L.LayerGroup;
            if (localLayer) {
              localLayer.clearLayers();
            }
          }
        });
      } else {
        // 既存のレイヤーコントロールがある場合は更新する
        console.log("レイヤーコントロールを更新します");

        // いったんコントロールを削除して再作成
        map.removeControl(layerControlRef.current);

        // 新しいコントロールを作成して追加
        const control = L.control.groupedLayers(baseLayers, overlayLayers as any, {
          collapsed: true, // デフォルトで格納状態に変更
          position: 'topright'
        }) as any;

        control.addTo(map);
        layerControlRef.current = control;
      }
    } catch (error) {
      console.error("レイヤーコントロールの初期化/更新エラー:", error);
    }

    return () => {
      // layerControlRef.current が null でないことを確認してから removeControl を呼び出す
      if (map && layerControlRef.current) {
        map.removeControl(layerControlRef.current);
        layerControlRef.current = null;
      }
    };
  }, [map, baseLayers, overlayLayers, regions, loadRegionWaypointsData, loadAllWaypointsData, osmLayer, weatherCache, setWeatherCache]);

  // 新たに、出発、ウェイポイント、到着を連結した completeRoute 配列に基づいて
  // 各セグメントの Polyline を描画する
  const completeRoute: [number, number][] = [];
  if (flightPlan.departure) {
    completeRoute.push([flightPlan.departure.latitude, flightPlan.departure.longitude]);
  }
  if (flightPlan.waypoints && flightPlan.waypoints.length > 0) {
    (flightPlan.waypoints as Waypoint[]).forEach((wp: Waypoint) => {
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
            <div className="waypoint-popup">
              <div className="waypoint-popup-header">ウェイポイント</div>
              <div className="p-2">
                <div className="mb-2">
                  <label className="block text-xs font-medium text-gray-400 mb-1">名前</label>
                  <div className="flex">
                    <input
                      type="text"
                      value={waypoint.name}
                      onChange={(e) => {
                        const newWaypoints = [...flightPlan.waypoints];
                        newWaypoints[index] = {
                          ...waypoint,
                          name: e.target.value
                        };
                        setFlightPlan((prev: FlightPlan) => ({
                          ...prev,
                          waypoints: newWaypoints
                        }));
                      }}
                      className="block w-full rounded-md border-gray-600 shadow-sm bg-gray-700 text-gray-50 focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 px-2 py-1 text-sm"
                    />
                  </div>
                </div>
                <div className="mb-2">
                  <p className="text-xs text-gray-400">ID: {waypoint.id}</p>
                  <p className="text-xs text-gray-400">タイプ: {waypoint.type}</p>
                  <p className="text-xs text-gray-400">位置: {waypoint.latitude.toFixed(4)}°N, {waypoint.longitude.toFixed(4)}°E</p>
                </div>
                <div className="flex justify-end mt-2">
                  <button
                    onClick={() => {
                      const newWaypoints = [...flightPlan.waypoints];
                      newWaypoints.splice(index, 1);
                      setFlightPlan((prev: FlightPlan) => ({
                        ...prev,
                        waypoints: newWaypoints
                      }));
                    }}
                    className="bg-red-600 hover:bg-red-700 text-white text-xs font-medium py-1 px-2 rounded focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
                  >
                    削除
                  </button>
                </div>
              </div>
            </div>
          </Popup>
        </CircleMarker>
      ))}
    </>
  );
});

// 空港の気象情報を取得して表示する関数を更新
// moved to layers/airports.ts

// moved to popups/weatherPopup.ts

// moved to popups/airportPopup.ts

export default MapTab;
