import L from 'leaflet';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { CACHE_DURATION, useWeatherCache } from '../../../../contexts/WeatherCacheContext';
import { fetchWeatherData } from '../../../../services/weather';
import { FlightPlan } from '../../../../types/index';
import { fetchAirportWeather as fetchAirportWeatherLayer } from './layers/airports';
import { bindNavaidPopup, navaidMarkerOptions } from './layers/navaids';
import { bindWaypointPopup } from './layers/waypoints';
import {
  sanitizeAirspaceDataset,
  type AirspaceDataset,
  type AirspaceSourceId,
} from '../../../../utils/airspace';
import { useAirspaceLayerClick } from './hooks/useAirspaceLayerClick';
import type { AirspaceSelection } from './planningAirspaceTypes';
import { fullAirportInfoContent, simplifiedAirportInfoContent } from './popups/airportPopup';
import {
  bindAirspaceFeatureSheetSelect,
  type AirspaceInteractionApi,
} from './airspaceLayerInteraction';
import {
  ACC_SECTOR_HIGH_STYLE,
  ACC_SECTOR_LOW_STYLE,
  RAPCON_LAYER_STYLE,
} from './mapAirspaceLayerStyle';
import { bindPlanningSwimNotamChip, swimNotamOpenChip } from './popups/swimNotamPopup';
import { FlightPlanRouteLayer } from './FlightPlanRouteLayer';
import { useLiveTrafficLayer } from './hooks/useLiveTrafficLayer';
import { usePlanningMapLayerController } from './hooks/usePlanningMapLayerController';
import type { PlanningMapLayerController } from './hooks/usePlanningMapLayerController';
import { useRainViewerRadarLayer } from './hooks/useRainViewerRadarLayer';
import { usePlanningMapWindGrid } from './hooks/usePlanningMapWindGrid';
import { useWindBarbLayer } from './hooks/useWindBarbLayer';
import { useWindGridOverlaySetter } from './windGridOverlayContext';
import { TrackLayer } from './TrackLayer';
import type { PlanningMapRegion } from './planningMapTypes';
import type { PlanningMapOverlayGroups } from './mapLayerUtils';
import type { AirportProps, NavaidProps } from './types';
import type { FlightTrack } from '../../tracks/types';
import { calculateMagneticBearing } from '../../../../utils/bearing';
import { formatBearing } from '../../../../utils/format';

export interface MapTabContentProps {
  flightPlan: FlightPlan;
  map: L.Map | null;
  setFlightPlan: React.Dispatch<React.SetStateAction<FlightPlan>>;
  regions: PlanningMapRegion[];
  tracks: FlightTrack[];
  currentTrackTime: number | null;
  onLayerControllerChange?: (controller: PlanningMapLayerController | null) => void;
  onAirspaceSelection?: (selection: AirspaceSelection) => void;
}

export const MapTabContent: React.FC<MapTabContentProps> = React.memo(({ flightPlan, map, setFlightPlan, regions, tracks, currentTrackTime, onLayerControllerChange, onAirspaceSelection }) => {
  const liveTrafficLayerRef = useRef<L.LayerGroup | null>(null);
  if (!liveTrafficLayerRef.current) {
    liveTrafficLayerRef.current = L.layerGroup();
  }
  const rainViewerLayerRef = useRef<L.LayerGroup | null>(null);
  if (!rainViewerLayerRef.current) {
    rainViewerLayerRef.current = L.layerGroup();
  }
  const [liveTrafficEnabled, setLiveTrafficEnabled] = useState(false);
  const [rainViewerEnabled, setRainViewerEnabled] = useState(false);
  const windBarbsLayerRef = useRef<L.LayerGroup | null>(null);
  if (!windBarbsLayerRef.current) {
    windBarbsLayerRef.current = L.layerGroup();
  }
  const [windBarbsEnabled, setWindBarbsEnabled] = useState(false);

  const mapRef = useRef<L.Map | null>(null);
  useEffect(() => {
    mapRef.current = map;
  }, [map]);

  const { gridPoints, overlay: windGridOverlay } = usePlanningMapWindGrid(map, windBarbsEnabled);
  const setWindGridOverlay = useWindGridOverlaySetter();
  useEffect(() => {
    setWindGridOverlay?.(windGridOverlay);
    return () => setWindGridOverlay?.(null);
  }, [windGridOverlay, setWindGridOverlay]);

  // 各地域のWaypointレイヤーを保持する参照
  const regionLayersRef = useRef<{ [key: string]: L.GeoJSON }>({});
  // すべてのWaypointレイヤーを保持する参照
  const allWaypointsLayerRef = useRef<L.GeoJSON | null>(null);
  // Context経由でキャッシュデータにアクセス
  const { weatherCache, setWeatherCache } = useWeatherCache();
  const weatherCacheRef = useRef(weatherCache);
  useEffect(() => {
    weatherCacheRef.current = weatherCache;
  }, [weatherCache]);

  const airspaceDataRef = useRef<Record<AirspaceSourceId, AirspaceDataset | null>>({
    ACC_Sector_High: null,
    ACC_Sector_Low: null,
    RAPCON: null,
  });

  const airspaceInteractionRef = useRef<AirspaceInteractionApi>({
    getActiveDatasets: () => [],
    onSelect: () => {},
  });

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

  // Common / Local Layers は ref で 1 回だけ生成（regions 変更で再生成しない）
  const commonLayersRef = useRef<Record<string, L.Layer> | null>(null);
  if (!commonLayersRef.current) {
    commonLayersRef.current = {
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
        pointToLayer: (feature, latlng) =>
          L.circleMarker(latlng, navaidMarkerOptions((feature.properties as NavaidProps).type)),
        onEachFeature: (feature, layer) =>
          bindNavaidPopup(feature, layer, setFlightPlan, mapRef.current),
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
        style: RAPCON_LAYER_STYLE,
        onEachFeature: (feature, layer) =>
          bindAirspaceFeatureSheetSelect(feature, layer, 'RAPCON', airspaceInteractionRef),
      }),
      "ACC-Sector High": L.geoJSON(null, {
        style: ACC_SECTOR_HIGH_STYLE,
        onEachFeature: (feature, layer) =>
          bindAirspaceFeatureSheetSelect(feature, layer, 'ACC_Sector_High', airspaceInteractionRef),
      }),
      "ACC-Sector Low": L.geoJSON(null, {
        style: ACC_SECTOR_LOW_STYLE,
        onEachFeature: (feature, layer) =>
          bindAirspaceFeatureSheetSelect(feature, layer, 'ACC_Sector_Low', airspaceInteractionRef),
      }),
      "航空機（参考・OpenSky）": liveTrafficLayerRef.current,
      "降水レーダー（参考・RainViewer）": rainViewerLayerRef.current,
      "上層風バーブ（参考・Open-Meteo）": windBarbsLayerRef.current,
    };
  }

  const handleAirspaceSelection = useCallback(
    (selection: AirspaceSelection) => {
      onAirspaceSelection?.(selection);
    },
    [onAirspaceSelection],
  );

  useAirspaceLayerClick(map, commonLayersRef, airspaceDataRef, handleAirspaceSelection, airspaceInteractionRef);

  const localLayersRef = useRef<{ RJFA: L.LayerGroup; RJFZ: L.LayerGroup } | null>(null);
  if (!localLayersRef.current) {
    localLayersRef.current = {
      RJFA: L.layerGroup(),
      RJFZ: L.layerGroup(),
    };
  }

  if (!allWaypointsLayerRef.current) {
    allWaypointsLayerRef.current = L.geoJSON(null, {
      pointToLayer: (feature, latlng) => L.circleMarker(latlng, waypointStyle(feature)),
      onEachFeature: (feature, layer) =>
        bindWaypointPopup(feature, layer, setFlightPlan, mapRef.current),
    });
  }

  // overlayLayers: Waypoints のみ regions 変更で差し替え
  const overlayLayers = useMemo(() => {
    const waypointLayers: { [key: string]: L.Layer } = {
      "すべて": allWaypointsLayerRef.current!,
    };

    regions.forEach(region => {
      let regionLayer = regionLayersRef.current[region.id];
      if (!regionLayer) {
        regionLayer = L.geoJSON(null, {
          pointToLayer: (feature, latlng) => L.circleMarker(latlng, waypointStyle(feature)),
          onEachFeature: (feature, layer) =>
            bindWaypointPopup(feature, layer, setFlightPlan, mapRef.current),
        });
        regionLayersRef.current[region.id] = regionLayer;
      }
      waypointLayers[region.name] = regionLayer;
    });

    return {
      "Common Layers": commonLayersRef.current!,
      "Waypoints": waypointLayers,
      "Local Layers": localLayersRef.current!,
    } satisfies PlanningMapOverlayGroups;
  }, [regions, setFlightPlan, waypointStyle]);

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

  // GeoJSONデータをフェッチして各レイヤーに追加（stable ref ベース・1 回のみ）
  const geojsonLoadedRef = useRef(false);
  useEffect(() => {
    if (!map || geojsonLoadedRef.current) return;
    geojsonLoadedRef.current = true;

    const common = commonLayersRef.current!;
    const local = localLayersRef.current!;

    const loadGeoJsonLayer = (url: string, layerKey: string) => {
      fetch(url)
        .then(res => res.json())
        .then(data => {
          const layer = common[layerKey] as L.GeoJSON;
          layer.clearLayers();
          layer.addData(data);
        })
        .catch(console.error);
    };

    const loadAirspaceGeoJsonLayer = (
      url: string,
      layerKey: string,
      sourceId: AirspaceSourceId,
    ) => {
      fetch(url)
        .then(res => res.json())
        .then((raw: AirspaceDataset) => {
          const data = sanitizeAirspaceDataset(raw);
          airspaceDataRef.current[sourceId] = data;
          const layer = common[layerKey] as L.GeoJSON;
          layer.clearLayers();
          layer.addData(data);
        })
        .catch(console.error);
    };

    loadAirspaceGeoJsonLayer('/geojson/ACC_Sector_High.geojson', 'ACC-Sector High', 'ACC_Sector_High');
    loadAirspaceGeoJsonLayer('/geojson/ACC_Sector_Low.geojson', 'ACC-Sector Low', 'ACC_Sector_Low');
    loadAirspaceGeoJsonLayer('/geojson/RAPCON.geojson', 'RAPCON', 'RAPCON');
    loadGeoJsonLayer('/geojson/RestrictedAirspace.geojson', '制限空域');
    loadGeoJsonLayer('/geojson/TrainingAreaCivil.geojson', '民間訓練空域');
    loadGeoJsonLayer('/geojson/TrainingAreaHigh.geojson', '高高度訓練空域');
    loadGeoJsonLayer('/geojson/TrainingAreaLow.geojson', '低高度訓練空域');

    fetch('/geojson/Navaids.geojson')
      .then(res => res.json())
      .then(data => {
        const navaidsLayer = common['Navaids'] as L.GeoJSON;
        navaidsLayer.clearLayers();
        navaidsLayer.addData(data);
      })
      .catch(console.error);

    // Airports レイヤーのデータ取得
    fetch('/geojson/Airports.geojson')
      .then(res => res.json())
      .then(data => {
        const mapInstance = mapRef.current;
        if (!mapInstance || !mapInstance.getContainer() || mapInstance.getContainer().clientWidth <= 0) {
          return;
        }

        try {
          const airportsLayer = L.geoJSON(data, {
            pointToLayer: (feature, latlng) => {
              const circleMarker = L.circleMarker(latlng, {
                radius: 3,
                fillColor: '#000000',
                color: '#000000',
                weight: 2,
                opacity: 1.0,
                fillOpacity: 1.0
              });

              const controlZone = L.circle(latlng, {
                radius: 9260,
                color: '#3cb371',
                weight: 2,
                opacity: 0.8,
                fillColor: '#3cb371',
                fillOpacity: 0.1,
                dashArray: '5, 5'
              });

              circleMarker.bindTooltip(`${feature.properties.id} - ${feature.properties.name1}`, {
                permanent: false,
                direction: 'top',
                className: 'airport-tooltip'
              });

              circleMarker.on('click', () => {
                const currentMap = mapRef.current;
                if (currentMap) {
                  fetchAirportWeatherLayer(
                    feature,
                    currentMap,
                    weatherCacheRef.current,
                    setWeatherCache,
                    fetchWeatherData,
                    CACHE_DURATION,
                  );
                }
              });

              return L.layerGroup([controlZone, circleMarker]);
            },
            onEachFeature: (feature, layer) => {
              const pid = feature.properties?.id as string | undefined;
              const notam =
                pid && String(pid).trim().length >= 3
                  ? swimNotamOpenChip(String(pid).trim())
                  : '';
              const depButtonId = `airport-set-dep-${pid}`;
              const arrButtonId = `airport-set-arr-${pid}`;
              const routeButtonId = `airport-add-route-${pid}`;
              const aipSearchUrl = pid
                ? `https://www.google.com/search?q=${encodeURIComponent(`${pid} AIP airport chart`)}`
                : '';
              const popupContent = `<div class="airport-popup airport-weather-popup">
                  <div>
                  <h2 class="font-bold text-lg">${feature.properties.name1}</h2>
                  <p class="text-sm">ID: ${feature.properties.id}</p>
                  <p class="text-sm">Type: ${feature.properties.type}</p>
                  <div class="mt-2">${simplifiedAirportInfoContent(feature.properties as AirportProps)}${fullAirportInfoContent(feature.properties as AirportProps)}</div>
                  <div class="mt-3 flex flex-wrap gap-2">
                    <button id="${depButtonId}" type="button" class="rounded border border-yellow-500/40 px-2 py-1 text-xs">出発地に設定</button>
                    <button id="${arrButtonId}" type="button" class="rounded border border-yellow-500/40 px-2 py-1 text-xs">到着地に設定</button>
                    <button id="${routeButtonId}" type="button" class="rounded border border-yellow-500/40 px-2 py-1 text-xs">ルートへ追加</button>
                    ${aipSearchUrl ? `<a href="${aipSearchUrl}" target="_blank" rel="noreferrer" class="rounded border border-yellow-500/40 px-2 py-1 text-xs">公式資料検索</a>` : ''}
                  </div>
                  </div>
                  ${notam}
                </div>`;

              const popup = L.popup({
                className: 'airport-custom-popup',
                maxWidth: 300
              });
              popup.setContent(popupContent);
              layer.bindPopup(popup);
              if (pid && String(pid).trim().length >= 3) {
                layer.on('popupopen', () => {
                  const currentMap = mapRef.current;
                  if (currentMap) bindPlanningSwimNotamChip(currentMap, popup, String(pid).trim(), 'location');
                  const coordinates =
                    feature.geometry?.type === 'Point'
                      ? (feature.geometry as GeoJSON.Point).coordinates as [number, number]
                      : undefined;
                  const airport = coordinates ? {
                    value: String(feature.properties.id),
                    label: `${feature.properties.name1} (${feature.properties.id})`,
                    name: String(feature.properties.name1),
                    type: (feature.properties.type || 'civilian') as 'civilian' | 'military' | 'joint',
                    latitude: coordinates[1],
                    longitude: coordinates[0],
                    properties: { ...feature.properties },
                  } : null;
                  const popupElement = popup.getElement();
                  const depButton = popupElement?.querySelector<HTMLButtonElement>(`#${depButtonId}`);
                  const arrButton = popupElement?.querySelector<HTMLButtonElement>(`#${arrButtonId}`);
                  const routeButton = popupElement?.querySelector<HTMLButtonElement>(`#${routeButtonId}`);
                  if (depButton) depButton.onclick = () => {
                    if (airport) setFlightPlan((prev) => ({ ...prev, departure: airport }));
                  };
                  if (arrButton) arrButton.onclick = () => {
                    if (airport) setFlightPlan((prev) => ({ ...prev, arrival: airport }));
                  };
                  if (routeButton) routeButton.onclick = () => {
                    if (!airport) return;
                    setFlightPlan((prev) => ({
                      ...prev,
                      waypoints: [
                        ...prev.waypoints,
                        {
                          id: `${airport.value}-${Date.now()}`,
                          name: airport.name,
                          type: 'airport',
                          coordinates: [airport.longitude, airport.latitude],
                          latitude: airport.latitude,
                          longitude: airport.longitude,
                          sourceId: airport.value,
                        },
                      ],
                    }));
                  };
                });
              }

              layer.on('click', () => {
                const currentMap = mapRef.current;
                if (currentMap) {
                  fetchAirportWeatherLayer(
                    feature,
                    currentMap,
                    weatherCacheRef.current,
                    setWeatherCache,
                    fetchWeatherData,
                    CACHE_DURATION,
                  );
                }
              });
            }
          });

          const airportsPlaceholder = common['空港'] as L.GeoJSON;
          airportsPlaceholder.clearLayers();
          airportsPlaceholder.addLayer(airportsLayer);
        } catch (error) {
          console.error('Airportsデータの処理中にエラーが発生しました:', error);
        }
      })
      .catch(error => {
        console.error('Airportsデータの読み込みに失敗しました:', error);
      });

    // RJFA レイヤーのデータ取得
    fetch('/geojson/RJFA.geojson')
      .then(res => res.json())
      .then(data => {
        const rjfaLayer = local.RJFA;
        const groupPoints: { [group: string]: { latlng: L.LatLng, name: string }[] } = {};
        rjfaLayer.clearLayers();

        data.features.forEach((feature: GeoJSON.Feature) => {
          if (feature.geometry && feature.geometry.type === "Point") {
            const [lng, lat] = (feature.geometry as GeoJSON.Point).coordinates;
            const group = (feature.properties as { group?: string; name?: string }).group || "default";
            const name = (feature.properties as { name?: string }).name ?? '';
            const marker = L.circleMarker([lat, lng], {
              radius: 5,
              fillColor: "blue",
              color: "blue",
              weight: 1,
              fillOpacity: 0.6,
              className: 'local-marker-rjfa'
            });

            const popupContent = `
              <div class="local-layer-popup">
                <div class="rjfa-popup-header">RJFA - ${name}</div>
                <div class="p-2">
                  <p class="text-sm my-1"><strong>ポイント:</strong> ${(feature.properties as { Point?: string }).Point || '未設定'}</p>
                  <p class="text-sm my-1"><strong>高度:</strong> ${(feature.properties as { altitude?: string }).altitude || '未設定'}</p>
                  <p class="text-sm my-1"><strong>グループ:</strong> ${group}</p>
                </div>
              </div>
            `;

            const popup = L.popup({
              className: 'rjfa-custom-popup',
              maxWidth: 250
            });
            popup.setContent(popupContent);
            marker.bindPopup(popup);

            marker.bindTooltip(name, {
              permanent: false,
              direction: 'top',
              className: 'rjfa-tooltip'
            });

            marker.addTo(rjfaLayer);
            if (!groupPoints[group]) {
              groupPoints[group] = [];
            }
            groupPoints[group].push({ latlng: L.latLng(lat, lng), name });
          }
        });

        Object.keys(groupPoints).forEach(group => {
          const labeledPoints = groupPoints[group];
          if (labeledPoints.length > 1) {
            const latlngs = labeledPoints.map(pt => pt.latlng);
            const polyline = L.polyline(latlngs, { color: "blue", weight: 2 });

            polyline.on("click", (e: L.LeafletMouseEvent) => {
              const mapInstance = mapRef.current;
              if (!mapInstance) return;
              const clickPoint = mapInstance.latLngToLayerPoint(e.latlng);
              let bestDistance = Infinity;
              let bestSegmentIndex = -1;
              for (let i = 0; i < labeledPoints.length - 1; i++) {
                const p1 = mapInstance.latLngToLayerPoint(labeledPoints[i].latlng);
                const p2 = mapInstance.latLngToLayerPoint(labeledPoints[i + 1].latlng);
                const distance = L.LineUtil.pointToSegmentDistance(clickPoint, p1, p2);
                if (distance < bestDistance) {
                  bestDistance = distance;
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

                const popup = L.popup({
                  className: 'rjfa-custom-popup',
                  maxWidth: 250
                })
                  .setLatLng(e.latlng)
                  .setContent(popupContent);

                popup.openOn(mapInstance);
              }
            });
            polyline.addTo(rjfaLayer);
          }
        });
      })
      .catch(console.error);

    // RJFZ レイヤーのデータ取得
    fetch('/geojson/RJFZ.geojson')
      .then(res => res.json())
      .then(data => {
        const rjfzLayer = local.RJFZ;
        rjfzLayer.clearLayers();
        const groupPoints: Record<string, { latlng: L.LatLng, name: string }[]> = {};

        data.features.forEach((feature: GeoJSON.Feature) => {
          if (feature.geometry && feature.geometry.type === "Point") {
            const [lng, lat] = (feature.geometry as GeoJSON.Point).coordinates;
            const group = (feature.properties as { group?: string; name?: string }).group || "default";
            const name = (feature.properties as { name?: string }).name ?? '';
            const marker = L.circleMarker([lat, lng], {
              radius: 5,
              fillColor: "green",
              color: "green",
              weight: 1,
              fillOpacity: 0.6,
              className: 'local-marker-rjfz'
            });

            const popupContent = `
              <div class="local-layer-popup">
                <div class="rjfz-popup-header">RJFZ - ${name}</div>
                <div class="p-2">
                  <p class="text-sm my-1"><strong>ポイント:</strong> ${(feature.properties as { Point?: string }).Point || '未設定'}</p>
                  <p class="text-sm my-1"><strong>高度:</strong> ${(feature.properties as { altitude?: string }).altitude || '未設定'}</p>
                  <p class="text-sm my-1"><strong>グループ:</strong> ${group}</p>
                </div>
              </div>
            `;

            const popup = L.popup({
              className: 'rjfz-custom-popup',
              maxWidth: 250
            });
            popup.setContent(popupContent);
            marker.bindPopup(popup);

            marker.bindTooltip(name, {
              permanent: false,
              direction: 'top',
              className: 'rjfz-tooltip'
            });

            marker.addTo(rjfzLayer);

            if (group) {
              if (!groupPoints[group]) {
                groupPoints[group] = [];
              }
              groupPoints[group].push({ latlng: L.latLng(lat, lng), name });
            }
          }
        });

        Object.keys(groupPoints).forEach(group => {
          const points = groupPoints[group];
          if (points.length >= 2) {
            const latlngs = points.map(p => p.latlng);
            const polyline = L.polyline(latlngs, { color: 'orange', weight: 2 });

            polyline.on("click", (e: L.LeafletMouseEvent) => {
              const mapInstance = mapRef.current;
              if (!mapInstance) return;
              const labeledPoints = points;
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

        rjfzLayer.eachLayer(layer => {
          if (typeof (layer as L.Layer & { bringToFront?: () => void }).bringToFront === 'function') {
            (layer as L.Layer & { bringToFront: () => void }).bringToFront();
          }
        });
      })
      .catch(console.error);
  }, [map, setFlightPlan, setWeatherCache]);

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

  const layerController = usePlanningMapLayerController({
    map,
    overlayLayers,
    osmLayer,
    esriLayer,
    regions,
    loadRegionWaypointsData,
    loadAllWaypointsData,
    referenceLayerSetters: {
      setLiveTrafficEnabled,
      setRainViewerEnabled,
      setWindBarbsEnabled,
    },
  });

  useEffect(() => {
    onLayerControllerChange?.(layerController);
    return () => onLayerControllerChange?.(null);
  }, [layerController, onLayerControllerChange]);

  useLiveTrafficLayer(map, liveTrafficLayerRef.current, liveTrafficEnabled);

  useRainViewerRadarLayer(map, rainViewerLayerRef.current, rainViewerEnabled);

  useWindBarbLayer(map, windBarbsLayerRef.current, windBarbsEnabled, gridPoints);

  return (
    <>
      <FlightPlanRouteLayer flightPlan={flightPlan} setFlightPlan={setFlightPlan} map={map} />
      <TrackLayer tracks={tracks} currentTime={currentTrackTime} />
    </>
  );
});