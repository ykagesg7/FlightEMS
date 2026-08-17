import React, { useEffect, useRef, useState } from 'react';
import {
  CallbackProperty,
  Cartesian3,
  ClockRange,
  Color,
  ColorBlendMode,
  ColorMaterialProperty,
  ConstantProperty,
  EllipsoidTerrainProvider,
  HeadingPitchRoll,
  ImageryLayer,
  JulianDate,
  Math as CesiumMath,
  PolygonHierarchy,
  Quaternion,
  SampledPositionProperty,
  TimeInterval,
  TimeIntervalCollection,
  Transforms,
  Viewer,
  buildModuleUrl,
  TileMapServiceImageryProvider,
} from 'cesium';
import 'cesium/Build/Cesium/Widgets/widgets.css';
import { loadFlightPlanDraft } from '../../planning/flightPlanDraft';
import { createAircraftGltfDataUri, playbackHeadingToModelHeadingDeg } from './aircraftIcon';
import {
  loadAirspaceCollections,
  runtimesNearTrack,
  type AirspaceKind,
  type AirspaceRuntime,
} from './airspaceVolumes';
import { buildPlanPlaybackPoints } from './buildPlanPlayback';
import { CameraControlHint } from './CameraControlHint';
import { DEMO_TRACK_NAME, DEMO_TRACK_POINTS } from './demoTrack';
import { findOccupancy } from './findOccupancy';
import { feetToMeters } from './parseAltitudeBand';
import { interpolatePlayback, type PlaybackPoint } from './playbackTrack';

const KIND_COLOR: Record<AirspaceKind, string> = {
  pending: '#ffaa00',
  rapcon: '#00aaff',
  'acc-low': '#7DAAF7',
  'acc-high': '#9BC4FF',
};

const AIRCRAFT_ENTITY_ID = 'playback-ac';

type LayerFlags = {
  pending: boolean;
  rapcon: boolean;
  accLow: boolean;
  accHigh: boolean;
};

const DEFAULT_LAYERS: LayerFlags = {
  pending: true,
  rapcon: true,
  accLow: false,
  accHigh: false,
};

function kindVisible(kind: AirspaceKind, layers: LayerFlags): boolean {
  if (kind === 'pending') return layers.pending;
  if (kind === 'rapcon') return layers.rapcon;
  if (kind === 'acc-low') return layers.accLow;
  return layers.accHigh;
}

/**
 * Cesium Viewer 本体（教育用）。Ion 不要。計画下書きがあれば疑似再生、なければデモ航跡。
 */
export const CesiumAirspaceViewer: React.FC = () => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const viewerRef = useRef<Viewer | null>(null);
  const airspacesRef = useRef<AirspaceRuntime[]>([]);
  const pointsRef = useRef<PlaybackPoint[]>([]);
  const startJulianRef = useRef<JulianDate | null>(null);
  const layersRef = useRef<LayerFlags>(DEFAULT_LAYERS);
  const [status, setStatus] = useState('初期化中…');
  const [playing, setPlaying] = useState(false);
  const [occupancyLabel, setOccupancyLabel] = useState('外側');
  const [error, setError] = useState<string | null>(null);
  const [sourceLabel, setSourceLabel] = useState('デモ');
  const [layers, setLayers] = useState<LayerFlags>(DEFAULT_LAYERS);

  layersRef.current = layers;

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    let cancelled = false;

    const boot = async () => {
      try {
        if (cancelled || !containerRef.current) return;

        const viewer = new Viewer(containerRef.current, {
          animation: true,
          timeline: true,
          baseLayerPicker: false,
          geocoder: false,
          homeButton: true,
          sceneModePicker: true,
          navigationHelpButton: false,
          fullscreenButton: true,
          infoBox: true,
          selectionIndicator: true,
          terrainProvider: new EllipsoidTerrainProvider(),
          baseLayer: false,
          contextOptions: {
            webgl: {
              failIfMajorPerformanceCaveat: false,
              preserveDrawingBuffer: true,
            },
          },
        });
        viewer.scene.globe.depthTestAgainstTerrain = false;
        viewer.imageryLayers.removeAll();

        const maxTextureSize =
          (viewer.scene as unknown as { context?: { maximumTextureSize?: number } }).context
            ?.maximumTextureSize ?? 0;
        const canUseImagery = Number.isFinite(maxTextureSize) && maxTextureSize >= 256;

        if (canUseImagery) {
          const imagery = await TileMapServiceImageryProvider.fromUrl(
            buildModuleUrl('Assets/Textures/NaturalEarthII'),
          );
          if (cancelled) {
            viewer.destroy();
            return;
          }
          viewer.imageryLayers.add(new ImageryLayer(imagery));
        } else {
          viewer.scene.globe.baseColor = Color.fromCssColorString('#132033');
          viewer.scene.globe.showGroundAtmosphere = false;
          if (viewer.scene.skyAtmosphere) viewer.scene.skyAtmosphere.show = false;
          if (viewer.scene.sun) viewer.scene.sun.show = false;
          if (viewer.scene.moon) viewer.scene.moon.show = false;
          if (viewer.scene.skyBox) viewer.scene.skyBox.show = false;
        }
        viewerRef.current = viewer;

        const draft = loadFlightPlanDraft();
        const planPoints = draft ? buildPlanPlaybackPoints(draft) : null;
        const points: PlaybackPoint[] = planPoints ?? DEMO_TRACK_POINTS;
        const trackName = planPoints
          ? '計画ルート（疑似再生・参考）'
          : DEMO_TRACK_NAME;
        pointsRef.current = points;
        setSourceLabel(planPoints ? '計画' : 'デモ');

        const collections = await loadAirspaceCollections();
        if (cancelled) {
          viewer.destroy();
          return;
        }
        const runtimes = runtimesNearTrack(collections, points);
        airspacesRef.current = runtimes;

        for (const a of runtimes) {
          const css = KIND_COLOR[a.kind];
          const fill = new ColorMaterialProperty(Color.fromCssColorString(css).withAlpha(0.22));
          const outline = Color.fromCssColorString(css);
          const flat: number[] = [];
          for (const c of a.ring) {
            flat.push(c[0], c[1]);
          }
          viewer.entities.add({
            id: a.id,
            name: a.label,
            show: kindVisible(a.kind, layersRef.current),
            description: `${a.minFt.toFixed(0)}–${a.maxFt.toFixed(0)} ft（教育用モデル）`,
            polygon: {
              hierarchy: new PolygonHierarchy(Cartesian3.fromDegreesArray(flat)),
              height: feetToMeters(a.minFt),
              extrudedHeight: feetToMeters(a.maxFt),
              material: fill,
              outline: true,
              outlineColor: outline,
            },
          });
        }

        const start = JulianDate.now();
        startJulianRef.current = start;
        const stop = JulianDate.addSeconds(start, points[points.length - 1]!.tSec, new JulianDate());

        viewer.clock.startTime = start.clone();
        viewer.clock.stopTime = stop.clone();
        viewer.clock.currentTime = JulianDate.addSeconds(start, 0.25, new JulianDate());
        viewer.clock.clockRange = ClockRange.LOOP_STOP;
        viewer.clock.multiplier = 30;
        viewer.clock.shouldAnimate = false;
        viewer.timeline?.zoomTo(start, stop);

        const position = new SampledPositionProperty();
        for (const p of points) {
          const t = JulianDate.addSeconds(start, p.tSec, new JulianDate());
          position.addSample(t, Cartesian3.fromDegrees(p.lon, p.lat, feetToMeters(p.altFt)));
        }

        const routePositions = points.map((p) =>
          Cartesian3.fromDegrees(p.lon, p.lat, feetToMeters(p.altFt)),
        );
        viewer.entities.add({
          name: `${trackName} 経路`,
          polyline: {
            positions: routePositions,
            width: 2,
            material: new ColorMaterialProperty(
              Color.fromCssColorString('#7DAAF7').withAlpha(0.55),
            ),
          },
        });

        const availability = new TimeIntervalCollection([new TimeInterval({ start, stop })]);
        const orientation = new CallbackProperty((time) => {
          const startJ = startJulianRef.current;
          const when = time ?? viewer.clock.currentTime;
          if (!startJ || !when) {
            return Quaternion.clone(Quaternion.IDENTITY);
          }
          const tSec = JulianDate.secondsDifference(when, startJ);
          const pose = interpolatePlayback(pointsRef.current, Math.max(0, tSec));
          const pos = Cartesian3.fromDegrees(pose.lon, pose.lat, feetToMeters(pose.altFt));
          const heading = playbackHeadingToModelHeadingDeg(pose.headingDeg);
          const hpr = new HeadingPitchRoll(CesiumMath.toRadians(heading), 0, 0);
          return Transforms.headingPitchRollQuaternion(pos, hpr);
        }, false);

        viewer.entities.add({
          id: AIRCRAFT_ENTITY_ID,
          name: trackName,
          availability,
          position,
          orientation,
          model: {
            uri: createAircraftGltfDataUri(),
            minimumPixelSize: 72,
            maximumScale: 80_000,
            color: Color.fromCssColorString('#7DAAF7'),
            colorBlendMode: ColorBlendMode.REPLACE,
            silhouetteColor: Color.WHITE,
            silhouetteSize: 1.2,
          },
          path: {
            show: true,
            width: 3,
            material: new ColorMaterialProperty(Color.fromCssColorString('#00aaff').withAlpha(0.85)),
            leadTime: 0,
            trailTime: 900,
          },
        });

        const mid = points[Math.floor(points.length / 2)] ?? points[0]!;
        viewer.camera.setView({
          destination: Cartesian3.fromDegrees(mid.lon, mid.lat - 1.15, 95_000),
          orientation: {
            heading: 0,
            pitch: CesiumMath.toRadians(-42),
            roll: 0,
          },
        });

        const onTick = () => {
          const startJ = startJulianRef.current;
          if (!startJ) return;
          const tSec = JulianDate.secondsDifference(viewer.clock.currentTime, startJ);
          const pose = interpolatePlayback(pointsRef.current, Math.max(0, tSec));
          const visible = airspacesRef.current.filter((a) => kindVisible(a.kind, layersRef.current));
          const hits = findOccupancy(visible, pose.lon, pose.lat, pose.altFt);
          const entity = viewer.entities.getById(AIRCRAFT_ENTITY_ID);
          if (entity?.model) {
            entity.model.color = new ConstantProperty(
              hits.length ? Color.fromCssColorString('#ff2244') : Color.fromCssColorString('#7DAAF7'),
            );
          }
          setOccupancyLabel(hits.length ? hits.join(' / ') : '外側');
          setPlaying(viewer.clock.shouldAnimate);
        };
        viewer.clock.onTick.addEventListener(onTick);

        const imageryNote = canUseImagery ? '' : '（地図タイルは WebGL 制限のため省略）';
        const srcNote = planPoints ? '計画下書きを疑似再生' : 'デモ航跡';
        setStatus(
          `${srcNote} · 空域 ${runtimes.length} 件（航跡付近）${imageryNote}`,
        );
      } catch (e) {
        console.error(e);
        setError(e instanceof Error ? e.message : String(e));
        setStatus('初期化に失敗しました');
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
    };
  }, []);

  useEffect(() => {
    const v = viewerRef.current;
    if (!v || v.isDestroyed()) return;
    for (const a of airspacesRef.current) {
      const entity = v.entities.getById(a.id);
      if (entity) entity.show = kindVisible(a.kind, layers);
    }
  }, [layers]);

  const togglePlay = () => {
    const v = viewerRef.current;
    if (!v || v.isDestroyed()) return;
    v.clock.shouldAnimate = !v.clock.shouldAnimate;
    setPlaying(v.clock.shouldAnimate);
  };

  const resetPlay = () => {
    const v = viewerRef.current;
    const start = startJulianRef.current;
    if (!v || v.isDestroyed() || !start) return;
    v.clock.currentTime = start.clone();
    v.clock.shouldAnimate = false;
    setPlaying(false);
  };

  return (
    <div className="relative flex h-full min-h-0 flex-col">
      <div className="flex shrink-0 flex-wrap items-center gap-2 border-b border-brand-primary/30 bg-brand-surface px-3 py-2">
        <button
          type="button"
          data-testid="airspace3d-play"
          onClick={togglePlay}
          className="rounded border border-brand-primary/50 px-3 py-1 text-xs text-brand-primary hover:bg-brand-primary/10"
        >
          {playing ? '一時停止' : '再生'}
        </button>
        <button
          type="button"
          data-testid="airspace3d-reset"
          onClick={resetPlay}
          className="rounded border border-brand-primary/40 px-3 py-1 text-xs text-gray-300 hover:bg-brand-primary/10"
        >
          先頭へ
        </button>
        <span
          data-testid="airspace3d-source"
          className="rounded bg-brand-secondary px-2 py-0.5 text-2xs text-gray-400"
        >
          {sourceLabel}
        </span>
        <span
          data-testid="airspace3d-intrusion"
          className={`max-w-[min(100%,28rem)] truncate rounded px-2 py-0.5 text-xs font-mono ${
            occupancyLabel === '外側'
              ? 'bg-emerald-900/40 text-emerald-200'
              : 'bg-red-900/60 text-red-200'
          }`}
          title={occupancyLabel}
        >
          {occupancyLabel}
        </span>
        <span className="text-2xs text-gray-500" data-testid="airspace3d-status">
          {status}
        </span>
        <div className="ml-auto flex flex-wrap gap-2 text-2xs text-gray-300">
          <label className="inline-flex items-center gap-1">
            <input
              type="checkbox"
              checked={layers.pending}
              onChange={(e) => setLayers((s) => ({ ...s, pending: e.target.checked }))}
            />
            変更予定
          </label>
          <label className="inline-flex items-center gap-1">
            <input
              type="checkbox"
              checked={layers.rapcon}
              onChange={(e) => setLayers((s) => ({ ...s, rapcon: e.target.checked }))}
            />
            RAPCON
          </label>
          <label className="inline-flex items-center gap-1">
            <input
              type="checkbox"
              checked={layers.accLow}
              onChange={(e) => setLayers((s) => ({ ...s, accLow: e.target.checked }))}
            />
            ACC Low
          </label>
          <label className="inline-flex items-center gap-1">
            <input
              type="checkbox"
              checked={layers.accHigh}
              onChange={(e) => setLayers((s) => ({ ...s, accHigh: e.target.checked }))}
            />
            ACC High
          </label>
        </div>
      </div>
      {error ? (
        <div className="bg-hud-danger/20 px-3 py-2 text-xs text-red-200" role="alert">
          {error}
        </div>
      ) : null}
      <div className="relative min-h-0 flex-1 w-full">
        <div ref={containerRef} data-testid="airspace3d-cesium" className="h-full min-h-0 w-full" />
        <CameraControlHint />
      </div>
    </div>
  );
};
