import {
  Cartesian3,
  Color,
  ConstantProperty,
  JulianDate,
  LinearApproximation,
  NearFarScalar,
  SampledPositionProperty,
  type Viewer,
} from 'cesium';
import { computeChaseScreenBillboardRotationRad } from './flightViewerAircraftBillboard';
import { feetToMeters, type PlaybackPoint3D } from './flightViewer3dMath';

export const FLIGHT_VIEWER_AIRCRAFT_ID = 'flight-viewer-aircraft';
export const FLIGHT_VIEWER_AIRCRAFT_HALO_ID = 'flight-viewer-aircraft-halo';

const AIRCRAFT_BILLBOARD_IMAGE = '/airplane.png';
const AIRCRAFT_HALO_BILLBOARD_IMAGE = '/airplane-halo.png';

/** チェイス 650〜3000 m で視認できるピクセルサイズ */
const aircraftBillboardScaleByDistance = new NearFarScalar(450, 1.35, 7500, 0.42);

type ChaseBillboardRotationState = {
  position: SampledPositionProperty;
  rotationHalo: ConstantProperty;
  rotationMain: ConstantProperty;
  lastRad: number;
};

const chaseBillboardRotationByViewer = new WeakMap<Viewer, ChaseBillboardRotationState>();

function buildPlaybackPositionProperty(
  playback: PlaybackPoint3D[],
  startJulian: JulianDate,
): SampledPositionProperty {
  const position = new SampledPositionProperty();
  position.setInterpolationOptions({
    interpolationDegree: 1,
    interpolationAlgorithm: LinearApproximation,
  });
  for (const p of playback) {
    const t = JulianDate.addSeconds(startJulian, p.tSec, new JulianDate());
    position.addSample(t, Cartesian3.fromDegrees(p.lon, p.lat, feetToMeters(p.altFt)));
  }
  return position;
}

function addAircraftBillboardEntity(
  viewer: Viewer,
  id: string,
  position: SampledPositionProperty,
  rotation: ConstantProperty,
  options: { halo: boolean },
): void {
  const scale = options.halo ? 1.12 : 1;
  viewer.entities.add({
    id,
    position,
    billboard: {
      image: options.halo ? AIRCRAFT_HALO_BILLBOARD_IMAGE : AIRCRAFT_BILLBOARD_IMAGE,
      width: 72,
      height: 72,
      scale,
      scaleByDistance: aircraftBillboardScaleByDistance,
      rotation,
      ...(options.halo ? { color: Color.WHITE.withAlpha(0.95) } : {}),
      disableDepthTestDistance: Number.POSITIVE_INFINITY,
    },
  });
}

/** チェイス時のみ onTick / seek から呼ぶ（無効時は lastRad を維持） */
export function updateChaseAircraftBillboardRotation(viewer: Viewer): void {
  const state = chaseBillboardRotationByViewer.get(viewer);
  if (!state || viewer.isDestroyed()) return;
  const rad = computeChaseScreenBillboardRotationRad(
    viewer,
    state.position,
    viewer.clock.currentTime,
  );
  if (rad === null) return;
  state.lastRad = rad;
  state.rotationHalo.setValue(rad);
  state.rotationMain.setValue(rad);
}

export function removeFlightViewerAircraft(viewer: Viewer): void {
  chaseBillboardRotationByViewer.delete(viewer);
  for (const id of [FLIGHT_VIEWER_AIRCRAFT_ID, FLIGHT_VIEWER_AIRCRAFT_HALO_ID]) {
    const entity = viewer.entities.getById(id);
    if (entity) viewer.entities.remove(entity);
  }
}

export function setFlightViewerAircraftVisible(viewer: Viewer, visible: boolean): void {
  for (const id of [FLIGHT_VIEWER_AIRCRAFT_ID, FLIGHT_VIEWER_AIRCRAFT_HALO_ID]) {
    const entity = viewer.entities.getById(id);
    if (entity) entity.show = visible;
  }
}

export function ensureFlightViewerAircraft(
  viewer: Viewer,
  playback: PlaybackPoint3D[],
  startJulian: JulianDate,
): void {
  removeFlightViewerAircraft(viewer);
  if (playback.length === 0) return;

  const position = buildPlaybackPositionProperty(playback, startJulian);
  const rotationHalo = new ConstantProperty(0);
  const rotationMain = new ConstantProperty(0);
  chaseBillboardRotationByViewer.set(viewer, {
    position,
    rotationHalo,
    rotationMain,
    lastRad: 0,
  });

  addAircraftBillboardEntity(viewer, FLIGHT_VIEWER_AIRCRAFT_HALO_ID, position, rotationHalo, {
    halo: true,
  });
  addAircraftBillboardEntity(viewer, FLIGHT_VIEWER_AIRCRAFT_ID, position, rotationMain, {
    halo: false,
  });
}
