import {
  CallbackProperty,
  Cartesian3,
  Color,
  ColorBlendMode,
  HeadingPitchRoll,
  JulianDate,
  Math as CesiumMath,
  Quaternion,
  SampledPositionProperty,
  Transforms,
  type Viewer,
} from 'cesium';
import {
  createAircraftGltfDataUri,
  playbackHeadingToModelHeadingDeg,
} from '../../../../explore/airspace3d/aircraftIcon';
import { feetToMeters, interpolatePlaybackAtTime, type PlaybackPoint3D } from './flightViewer3dMath';

export const FLIGHT_VIEWER_AIRCRAFT_ID = 'flight-viewer-aircraft';

function poseAtTime(
  playback: PlaybackPoint3D[],
  startJulian: JulianDate,
  time: JulianDate | undefined,
): ReturnType<typeof interpolatePlaybackAtTime> | null {
  if (!time) return null;
  const tSec = JulianDate.secondsDifference(time, startJulian);
  return interpolatePlaybackAtTime(playback, Math.max(0, tSec));
}

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
  for (const p of playback) {
    const t = JulianDate.addSeconds(startJulian, p.tSec, new JulianDate());
    position.addSample(t, Cartesian3.fromDegrees(p.lon, p.lat, feetToMeters(p.altFt)));
  }

  const playbackRef = playback;
  const orientation = new CallbackProperty((time) => {
    const pose = poseAtTime(playbackRef, startJulian, time);
    if (!pose) return Quaternion.IDENTITY;
    const pos = Cartesian3.fromDegrees(pose.lon, pose.lat, feetToMeters(pose.altFt));
    const heading = playbackHeadingToModelHeadingDeg(pose.headingDeg);
    const hpr = new HeadingPitchRoll(CesiumMath.toRadians(heading), 0, 0);
    return Transforms.headingPitchRollQuaternion(pos, hpr);
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
