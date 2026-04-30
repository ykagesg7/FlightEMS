import type { FlightPlan } from '../../../types';

export type TrackSourceFormat = 'gpx' | 'kml' | 'csv' | 'gps' | 'json';

export interface TrackPoint {
  timestamp: string;
  latitude: number;
  longitude: number;
  altitudeFt?: number;
  groundSpeedKt?: number;
  trackDeg?: number;
  source?: TrackSourceFormat;
}

export interface FlightTrack {
  id: string;
  name: string;
  aircraftLabel?: string;
  pilotName?: string;
  color: string;
  points: TrackPoint[];
  importedAt: string;
  sourceFormat: TrackSourceFormat;
  linkedPlanId?: string;
  visible: boolean;
}

export interface DebriefSession {
  id: string;
  name: string;
  planSnapshot?: FlightPlan;
  tracks: FlightTrack[];
  createdAt: string;
  updatedAt: string;
}

export interface TrackParseResult {
  track: FlightTrack;
  warnings: string[];
}

export interface TrackPlaybackState {
  currentTime: number | null;
  playing: boolean;
  speed: number;
}

export interface TrackDeviationSummary {
  trackId: string;
  trackName: string;
  pointCount: number;
  maxCrossTrackNm: number | null;
  averageCrossTrackNm: number | null;
  withinOneNmPercent: number | null;
  minAltitudeFt: number | null;
  maxAltitudeFt: number | null;
  waypointPassages: Array<{
    name: string;
    timestamp: string;
    distanceNm: number;
  }>;
}
