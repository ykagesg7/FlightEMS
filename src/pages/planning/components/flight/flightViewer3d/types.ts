export interface Waypoint3D {
  name: string;
  lat: number;
  lon: number;
  altFt: number;
  speedKts?: number;
}

export interface FlightViewer3DProps {
  waypoints: Waypoint3D[];
  initialMode?: 'gsi' | 'google';
  isProUser?: boolean;
}

export type FlightImageryMode = 'gsi' | 'google';

export type FlightCameraMode = 'chase' | 'cockpit';
