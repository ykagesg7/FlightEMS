import {
  Cartesian3,
  Color,
  JulianDate,
  LinearApproximation,
  NearFarScalar,
  SampledPositionProperty,
  SampledProperty,
  type Viewer,
} from 'cesium';
import { headingDegToBillboardRotation } from '../../../../explore/airspace3d/aircraftIcon';
import {
  feetToMeters,
  interpolatePlaybackAtTime,
  type PlaybackPoint3D,
} from './flightViewer3dMath';

export const FLIGHT_VIEWER_AIRCRAFT_ID = 'flight-viewer-aircraft';
export const FLIGHT_VIEWER_AIRCRAFT_HALO_ID = 'flight-viewer-aircraft-halo';

const AIRCRAFT_BILLBOARD_IMAGE = '/airplane.png';
const AIRCRAFT_HALO_BILLBOARD_IMAGE = '/airplane-halo.png';

/** チェイス 650〜3000 m で視認できるピクセルサイズ */
const aircraftBillboardScaleByDistance = new NearFarScalar(450, 1.35, 7500, 0.42);

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

function buildPlaybackBillboardRotationProperty(
  playback: PlaybackPoint3D[],
  startJulian: JulianDate,
): SampledProperty {
  const rotation = new SampledProperty(Number);
  rotation.setInterpolationOptions({
    interpolationDegree: 1,
    interpolationAlgorithm: LinearApproximation,
  });
  for (const p of playback) {
    const t = JulianDate.addSeconds(startJulian, p.tSec, new JulianDate());
    const headingDeg = interpolatePlaybackAtTime(playback, p.tSec).headingDeg;
    rotation.addSample(t, headingDegToBillboardRotation(headingDeg));
  }
  return rotation;
}

function addAircraftBillboardEntity(
  viewer: Viewer,
  id: string,
  position: SampledPositionProperty,
  rotation: SampledProperty,
  options: { halo: boolean },
): void {
  const scale = options.halo ? 1.14 : 1;
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
      alignedAxis: Cartesian3.UNIT_Z,
      color: Color.WHITE,
      disableDepthTestDistance: Number.POSITIVE_INFINITY,
    },
  });
}

export function removeFlightViewerAircraft(viewer: Viewer): void {
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
  const rotation = buildPlaybackBillboardRotationProperty(playback, startJulian);

  addAircraftBillboardEntity(viewer, FLIGHT_VIEWER_AIRCRAFT_HALO_ID, position, rotation, {
    halo: true,
  });
  addAircraftBillboardEntity(viewer, FLIGHT_VIEWER_AIRCRAFT_ID, position, rotation, {
    halo: false,
  });
}
