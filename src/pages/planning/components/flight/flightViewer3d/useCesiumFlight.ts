import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Cartesian2,
  Cartesian3,
  Cesium3DTileset,
  ClockRange,
  Color,
  ColorMaterialProperty,
  EllipsoidTerrainProvider,
  GoogleMaps,
  TerrainProvider,
  HeadingPitchRange,
  JulianDate,
  LabelStyle,
  Math as CesiumMath,
  Matrix4,
  PolylineDashMaterialProperty,
  UrlTemplateImageryProvider,
  Viewer,
  createGooglePhotorealistic3DTileset,
} from 'cesium';
import '../../../../explore/airspace3d/cesiumBaseUrl';
import {
  applyPreviewAltitudeOffset,
  buildPlaybackPointsFromWaypoints,
  feetToMeters,
  interpolatePlaybackAtTime,
  type PlaybackPoint3D,
} from './flightViewer3dMath';
import { GsiDemPngTerrainProvider } from './gsiDemPngTerrainProvider';
import type {
  FlightCameraMode,
  FlightImageryMode,
  FlightViewControls,
  Waypoint3D,
} from './types';
import { DEFAULT_FLIGHT_VIEW_CONTROLS } from './types';

const GSI_SEAMLESS_PHOTO =
  'https://cyberjapandata.gsi.go.jp/xyz/seamlessphoto/{z}/{x}/{y}.jpg';

const ROUTE_ENTITY_PREFIX = 'flight-viewer-route-';
const ROUTE_POLYLINE_ID = 'flight-viewer-route-line';

/** デモ／プレビュー用。実時間 1x は長距離で遅すぎるため加速する */
const PLAYBACK_MULTIPLIER = 40;

export type UseCesiumFlightOptions = {
  containerRef: React.RefObject<HTMLDivElement | null>;
  waypoints: Waypoint3D[];
  imageryMode: FlightImageryMode;
  cameraMode: FlightCameraMode;
  isProUser: boolean;
  viewControls?: FlightViewControls;
};

export type UseCesiumFlightResult = {
  ready: boolean;
  error: string | null;
  playing: boolean;
  progressPct: number;
  togglePlay: () => void;
  seekProgress: (pct: number) => void;
  totalDurationSec: number;
};

function saveCamera(viewer: Viewer) {
  const cam = viewer.camera;
  return {
    position: cam.position.clone(),
    direction: cam.direction.clone(),
    up: cam.up.clone(),
    right: cam.right.clone(),
  };
}

function restoreCamera(viewer: Viewer, snap: ReturnType<typeof saveCamera>) {
  viewer.camera.position = snap.position;
  viewer.camera.direction = snap.direction;
  viewer.camera.up = snap.up;
  viewer.camera.right = snap.right;
}

/** lookAt ロックを解除し、一時停止中の手動視点操作を許可する */
function unlockCamera(viewer: Viewer) {
  viewer.camera.lookAtTransform(Matrix4.IDENTITY);
}

function removeRouteEntities(viewer: Viewer) {
  const toRemove = viewer.entities.values.filter((e) => {
    const id = e.id;
    return (
      typeof id === 'string' &&
      (id === ROUTE_POLYLINE_ID || id.startsWith(ROUTE_ENTITY_PREFIX))
    );
  });
  for (const entity of toRemove) {
    viewer.entities.remove(entity);
  }
}

function addRouteGraphics(viewer: Viewer, waypoints: Waypoint3D[]) {
  if (waypoints.length < 1) return;
  const routePositions = waypoints.map((w) =>
    Cartesian3.fromDegrees(w.lon, w.lat, feetToMeters(w.altFt)),
  );
  if (routePositions.length >= 2) {
    viewer.entities.add({
      id: ROUTE_POLYLINE_ID,
      polyline: {
        positions: routePositions,
        width: 3,
        material: new ColorMaterialProperty(Color.fromCssColorString('#FF00FF').withAlpha(0.92)),
      },
    });
  }
  for (let i = 0; i < waypoints.length; i++) {
    const w = waypoints[i]!;
    const atAlt = Cartesian3.fromDegrees(w.lon, w.lat, feetToMeters(w.altFt));
    const onGround = Cartesian3.fromDegrees(w.lon, w.lat, 0);
    viewer.entities.add({
      id: `${ROUTE_ENTITY_PREFIX}wp-${i}`,
      position: atAlt,
      label: {
        text: w.name,
        font: '13px sans-serif',
        fillColor: Color.WHITE,
        outlineColor: Color.BLACK,
        outlineWidth: 2,
        style: LabelStyle.FILL_AND_OUTLINE,
        verticalOrigin: 1,
        pixelOffset: new Cartesian2(0, -18),
      },
      point: {
        pixelSize: 10,
        color: Color.fromCssColorString('#39FF14'),
        outlineColor: Color.BLACK,
        outlineWidth: 1,
      },
    });
    viewer.entities.add({
      id: `${ROUTE_ENTITY_PREFIX}drop-${i}`,
      polyline: {
        positions: [atAlt, onGround],
        width: 1.5,
        material: new PolylineDashMaterialProperty({
          color: Color.fromCssColorString('#7DAAF7').withAlpha(0.55),
          dashLength: 12,
        }),
      },
    });
  }
}

function fitCameraToRoute(viewer: Viewer, waypoints: Waypoint3D[]) {
  if (waypoints.length === 0) return;
  unlockCamera(viewer);
  const mid = waypoints[Math.floor(waypoints.length / 2)] ?? waypoints[0]!;
  viewer.camera.setView({
    destination: Cartesian3.fromDegrees(mid.lon, mid.lat - 0.35, 85_000),
    orientation: {
      heading: 0,
      pitch: CesiumMath.toRadians(-38),
      roll: 0,
    },
  });
}

function updateFollowCamera(
  viewer: Viewer,
  pose: ReturnType<typeof interpolatePlaybackAtTime>,
  mode: FlightCameraMode,
  controls: FlightViewControls,
) {
  const altFt = applyPreviewAltitudeOffset(pose.altFt, controls.altitudeOffsetFt);
  const pos = Cartesian3.fromDegrees(pose.lon, pose.lat, feetToMeters(altFt));
  const heading = CesiumMath.toRadians(pose.headingDeg);
  const pitchRad = CesiumMath.toRadians(controls.chasePitchDeg);
  if (mode === 'cockpit') {
    unlockCamera(viewer);
    viewer.camera.setView({
      destination: pos,
      orientation: {
        heading,
        pitch: pitchRad,
        roll: 0,
      },
    });
    return;
  }
  // heading + π: 機体進行方向の後方から chase（機体後方視点）
  viewer.camera.lookAt(
    pos,
    new HeadingPitchRange(heading + Math.PI, pitchRad, controls.chaseDistanceM),
  );
}

function createGsiTerrainProvider(): TerrainProvider {
  return new GsiDemPngTerrainProvider() as unknown as TerrainProvider;
}

function setDepthTestAgainstTerrain(viewer: Viewer, enabled: boolean) {
  viewer.scene.globe.depthTestAgainstTerrain = enabled;
}

export function useCesiumFlight({
  containerRef,
  waypoints,
  imageryMode,
  cameraMode,
  isProUser,
  viewControls = DEFAULT_FLIGHT_VIEW_CONTROLS,
}: UseCesiumFlightOptions): UseCesiumFlightResult {
  const viewerRef = useRef<Viewer | null>(null);
  const tilesetRef = useRef<Cesium3DTileset | null>(null);
  const playbackRef = useRef<PlaybackPoint3D[]>([]);
  const startJulianRef = useRef<JulianDate | null>(null);
  const totalSecRef = useRef(0);
  const cameraModeRef = useRef(cameraMode);
  const viewControlsRef = useRef(viewControls);
  const imageryApplyingRef = useRef(false);
  const wasAnimatingRef = useRef(false);
  /** boot 直後の初期 imagery 適用を effect で二重実行しない */
  const skipNextImageryEffectRef = useRef(false);

  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [playing, setPlaying] = useState(false);
  const [progressPct, setProgressPct] = useState(0);
  const [totalDurationSec, setTotalDurationSec] = useState(0);

  cameraModeRef.current = cameraMode;
  viewControlsRef.current = viewControls;

  const applyImagery = useCallback(
    async (viewer: Viewer, mode: FlightImageryMode) => {
      if (mode === 'google' && !isProUser) return;
      const snap = saveCamera(viewer);
      imageryApplyingRef.current = true;
      try {
        viewer.imageryLayers.removeAll();
        if (tilesetRef.current) {
          viewer.scene.primitives.remove(tilesetRef.current);
          tilesetRef.current = null;
        }
        if (mode === 'gsi') {
          viewer.scene.globe.show = true;
          viewer.terrainProvider = createGsiTerrainProvider();
          setDepthTestAgainstTerrain(viewer, true);
          const imagery = new UrlTemplateImageryProvider({
            url: GSI_SEAMLESS_PHOTO,
            credit: '国土地理院',
          });
          viewer.imageryLayers.addImageryProvider(imagery);
        } else {
          const key = import.meta.env.VITE_GOOGLE_MAPS_API_KEY?.trim();
          if (!key) {
            throw new Error('VITE_GOOGLE_MAPS_API_KEY が未設定です（.env.local）');
          }
          GoogleMaps.defaultApiKey = key;
          const tileset = await createGooglePhotorealistic3DTileset({
            onlyUsingWithGoogleGeocoder: true,
          });
          viewer.scene.primitives.add(tileset);
          tilesetRef.current = tileset;
          viewer.scene.globe.show = true;
          setDepthTestAgainstTerrain(viewer, true);
        }
        restoreCamera(viewer, snap);
      } finally {
        imageryApplyingRef.current = false;
      }
    },
    [isProUser],
  );

  const rebuildRoute = useCallback((viewer: Viewer, wps: Waypoint3D[]) => {
    removeRouteEntities(viewer);
    addRouteGraphics(viewer, wps);
    const { points, totalSec } = buildPlaybackPointsFromWaypoints(wps);
    playbackRef.current = points;
    totalSecRef.current = totalSec;
    setTotalDurationSec(totalSec);

    const start = JulianDate.now();
    startJulianRef.current = start;
    const stop = JulianDate.addSeconds(start, Math.max(totalSec, 0.01), new JulianDate());
    viewer.clock.startTime = start.clone();
    viewer.clock.stopTime = stop.clone();
    viewer.clock.currentTime = start.clone();
    viewer.clock.clockRange = ClockRange.CLAMPED;
    viewer.clock.multiplier = PLAYBACK_MULTIPLIER;
    viewer.clock.shouldAnimate = false;
    wasAnimatingRef.current = false;
    setProgressPct(0);
    setPlaying(false);
    if (wps.length >= 2) {
      fitCameraToRoute(viewer, wps);
    }
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    let cancelled = false;

    const boot = async () => {
      try {
        const viewer = new Viewer(el, {
          animation: false,
          timeline: false,
          baseLayerPicker: false,
          geocoder: false,
          homeButton: false,
          sceneModePicker: false,
          navigationHelpButton: false,
          fullscreenButton: false,
          infoBox: false,
          selectionIndicator: false,
          baseLayer: false,
          terrainProvider: new EllipsoidTerrainProvider(),
          contextOptions: {
            webgl: {
              failIfMajorPerformanceCaveat: false,
              preserveDrawingBuffer: true,
            },
          },
        });
        setDepthTestAgainstTerrain(viewer, false);
        if (cancelled) {
          viewer.destroy();
          return;
        }
        viewerRef.current = viewer;
        rebuildRoute(viewer, waypoints);
        await applyImagery(viewer, imageryMode);
        if (cancelled) {
          viewer.destroy();
          viewerRef.current = null;
          return;
        }
        // ready 後の imagery effect が同値で二重適用しないようスキップ
        skipNextImageryEffectRef.current = true;

        const onTick = () => {
          const startJ = startJulianRef.current;
          if (!startJ || imageryApplyingRef.current) return;
          const tSec = JulianDate.secondsDifference(viewer.clock.currentTime, startJ);
          const total = totalSecRef.current || 1;
          const pose = interpolatePlaybackAtTime(playbackRef.current, Math.max(0, tSec));
          setProgressPct(Math.min(100, Math.max(0, (tSec / total) * 100)));

          const animating = viewer.clock.shouldAnimate;
          if (animating) {
            updateFollowCamera(viewer, pose, cameraModeRef.current, viewControlsRef.current);
          } else if (wasAnimatingRef.current) {
            // 一時停止へ遷移した直後: lookAt ロック解除 → 手動視点を許可
            unlockCamera(viewer);
          }
          wasAnimatingRef.current = animating;
          setPlaying(animating);
        };
        viewer.clock.onTick.addEventListener(onTick);

        if (!cancelled) setReady(true);
      } catch (e) {
        console.error(e);
        setError(e instanceof Error ? e.message : String(e));
      }
    };

    void boot();

    return () => {
      cancelled = true;
      const v = viewerRef.current;
      if (v && !v.isDestroyed()) {
        v.destroy();
      }
      viewerRef.current = null;
      tilesetRef.current = null;
      setReady(false);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- viewer は一度だけ初期化
  }, [containerRef]);

  useEffect(() => {
    const viewer = viewerRef.current;
    if (!viewer || viewer.isDestroyed() || !ready) return;
    rebuildRoute(viewer, waypoints);
  }, [waypoints, ready, rebuildRoute]);

  useEffect(() => {
    const viewer = viewerRef.current;
    const startJ = startJulianRef.current;
    if (!viewer || viewer.isDestroyed() || !ready || !startJ) return;
    // 再生中のみ chase 追従。停止中はモード切替時だけ姿勢を合わせる
    const tSec = JulianDate.secondsDifference(viewer.clock.currentTime, startJ);
    const pose = interpolatePlaybackAtTime(playbackRef.current, Math.max(0, tSec));
    updateFollowCamera(viewer, pose, cameraMode, viewControlsRef.current);
    if (!viewer.clock.shouldAnimate) {
      unlockCamera(viewer);
    }
  }, [cameraMode, ready]);

  useEffect(() => {
    const viewer = viewerRef.current;
    const startJ = startJulianRef.current;
    if (!viewer || viewer.isDestroyed() || !ready || !startJ) return;
    if (!viewer.clock.shouldAnimate && cameraModeRef.current === 'chase') {
      // 停止中のスライダー調整時は一度追従してからロック解除（手動操作を継続可能に）
      const tSec = JulianDate.secondsDifference(viewer.clock.currentTime, startJ);
      const pose = interpolatePlaybackAtTime(playbackRef.current, Math.max(0, tSec));
      updateFollowCamera(viewer, pose, cameraModeRef.current, viewControls);
      unlockCamera(viewer);
      return;
    }
    if (viewer.clock.shouldAnimate) {
      const tSec = JulianDate.secondsDifference(viewer.clock.currentTime, startJ);
      const pose = interpolatePlaybackAtTime(playbackRef.current, Math.max(0, tSec));
      updateFollowCamera(viewer, pose, cameraModeRef.current, viewControls);
    }
  }, [viewControls, ready]);

  useEffect(() => {
    const viewer = viewerRef.current;
    if (!viewer || viewer.isDestroyed() || !ready) return;
    if (imageryMode === 'google' && !isProUser) return;
    if (skipNextImageryEffectRef.current) {
      skipNextImageryEffectRef.current = false;
      return;
    }
    void applyImagery(viewer, imageryMode).catch((e) => {
      console.error(e);
      setError(e instanceof Error ? e.message : String(e));
    });
  }, [imageryMode, isProUser, ready, applyImagery]);

  const togglePlay = useCallback(() => {
    const viewer = viewerRef.current;
    if (!viewer || viewer.isDestroyed()) return;
    const next = !viewer.clock.shouldAnimate;
    viewer.clock.multiplier = PLAYBACK_MULTIPLIER;
    viewer.clock.shouldAnimate = next;
    if (!next) {
      unlockCamera(viewer);
      wasAnimatingRef.current = false;
    }
    setPlaying(next);
  }, []);

  const seekProgress = useCallback((pct: number) => {
    const viewer = viewerRef.current;
    const startJ = startJulianRef.current;
    if (!viewer || viewer.isDestroyed() || !startJ) return;
    const total = totalSecRef.current;
    const tSec = (Math.min(100, Math.max(0, pct)) / 100) * total;
    viewer.clock.currentTime = JulianDate.addSeconds(startJ, tSec, new JulianDate());
    viewer.clock.shouldAnimate = false;
    wasAnimatingRef.current = false;
    setPlaying(false);
    const pose = interpolatePlaybackAtTime(playbackRef.current, tSec);
    setProgressPct((tSec / (total || 1)) * 100);
    updateFollowCamera(viewer, pose, cameraModeRef.current, viewControlsRef.current);
    unlockCamera(viewer);
  }, []);

  return {
    ready,
    error,
    playing,
    progressPct,
    togglePlay,
    seekProgress,
    totalDurationSec,
  };
}
