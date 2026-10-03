import {
  CallbackProperty,
  Cartesian3,
  Color,
  ColorBlendMode,
  HeadingPitchRoll,
  JulianDate,
  LinearApproximation,
  Math as CesiumMath,
  Quaternion,
  SampledPositionProperty,
  VelocityOrientationProperty,
  type Viewer,
} from 'cesium';
import {
  AIRCRAFT_YAW_OFFSET_DEG,
  createAircraftGltfDataUri,
} from '../../../../explore/airspace3d/aircraftIcon';
import { feetToMeters, type PlaybackPoint3D } from './flightViewer3dMath';

export const FLIGHT_VIEWER_AIRCRAFT_ID = 'flight-viewer-aircraft';

const modelYawFix = Quaternion.fromHeadingPitchRoll(
  new HeadingPitchRoll(CesiumMath.toRadians(AIRCRAFT_YAW_OFFSET_DEG), 0, 0),
);

export function removeFlightViewerAircraft(viewer: Viewer): void {
  const entity = viewer.entities.getById(FLIGHT_VIEWER_AIRCRAFT_ID);
  if (entity) viewer.entities.remove(entity);
}

export function ensureFlightViewerAircraft(
  viewer: Viewer,
  playback: PlaybackPoint3D[],
  startJulian: JulianDate,
): void {
  removeFlightViewerAircraft(viewer);
  if (playback.length === 0) return;

  const position = new SampledPositionProperty();
  position.setInterpolationOptions({
    interpolationDegree: 1,
    interpolationAlgorithm: LinearApproximation,
  });
  for (const p of playback) {
    const t = JulianDate.addSeconds(startJulian, p.tSec, new JulianDate());
    position.addSample(t, Cartesian3.fromDegrees(p.lon, p.lat, feetToMeters(p.altFt)));
  }

  const velocityOrientation = new VelocityOrientationProperty(position);
  const scratch = new Quaternion();
  const orientation = new CallbackProperty((time) => {
    const qVel = velocityOrientation.getValue(time, scratch);
    if (!qVel) return Quaternion.IDENTITY;
    return Quaternion.multiply(qVel, modelYawFix, scratch);
  }, false);

  viewer.entities.add({
    id: FLIGHT_VIEWER_AIRCRAFT_ID,
    position,
    orientation,
    model: {
      uri: createAircraftGltfDataUri(),
      minimumPixelSize: 96,
      maximumScale: 80_000,
      scale: 1.2,
      color: Color.fromCssColorString('#7DAAF7'),
      colorBlendMode: ColorBlendMode.REPLACE,
      silhouetteColor: Color.WHITE,
      silhouetteSize: 2,
    },
    point: {
      pixelSize: 14,
      color: Color.fromCssColorString('#FFE94A'),
      outlineColor: Color.BLACK,
      outlineWidth: 2,
      disableDepthTestDistance: Number.POSITIVE_INFINITY,
    },
  });
}
