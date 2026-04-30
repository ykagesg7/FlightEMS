import React, { useMemo } from 'react';
import { CircleMarker, Marker, Polyline, Popup } from 'react-leaflet';
import L from 'leaflet';
import type { FlightTrack } from '../../tracks/types';
import { interpolateTrackPoint } from '../../tracks/interpolateTrack';
import { downsampleTrackPoints } from '../../tracks/downsampleTrack';

interface TrackLayerProps {
  tracks: FlightTrack[];
  currentTime: number | null;
}

function createAircraftIcon(color: string): L.DivIcon {
  return L.divIcon({
    className: 'track-aircraft-marker',
    html: `<div style="width:16px;height:16px;border-radius:9999px;background:${color};border:2px solid white;box-shadow:0 0 8px ${color};"></div>`,
    iconSize: [16, 16],
    iconAnchor: [8, 8],
  });
}

export const TrackLayer: React.FC<TrackLayerProps> = ({ tracks, currentTime }) => {
  const visibleTracks = useMemo(() => tracks.filter((track) => track.visible && track.points.length > 0), [tracks]);

  return (
    <>
      {visibleTracks.map((track) => {
        const displayPoints = downsampleTrackPoints(track.points);
        const positions = displayPoints.map((point) => [point.latitude, point.longitude] as [number, number]);
        const playbackPoint = currentTime ? interpolateTrackPoint(track, currentTime) : null;
        return (
          <React.Fragment key={track.id}>
            {positions.length > 1 ? (
              <Polyline positions={positions} color={track.color} weight={3} opacity={0.85}>
                <Popup>
                  <div>
                    <strong>{track.name}</strong>
                    <p>Points: {track.points.length}</p>
                  </div>
                </Popup>
              </Polyline>
            ) : null}
            <CircleMarker center={positions[0]} radius={5} pathOptions={{ color: track.color, fillColor: track.color, fillOpacity: 0.9 }}>
              <Popup>{track.name} Start</Popup>
            </CircleMarker>
            <CircleMarker center={positions[positions.length - 1]} radius={5} pathOptions={{ color: track.color, fillColor: '#111827', fillOpacity: 0.9 }}>
              <Popup>{track.name} End</Popup>
            </CircleMarker>
            {playbackPoint ? (
              <Marker
                position={[playbackPoint.latitude, playbackPoint.longitude]}
                icon={createAircraftIcon(track.color)}
              >
                <Popup>
                  <div>
                    <strong>{track.name}</strong>
                    <p>{new Date(playbackPoint.timestamp).toLocaleString('ja-JP')}</p>
                    {typeof playbackPoint.altitudeFt === 'number' ? <p>ALT {playbackPoint.altitudeFt.toFixed(0)} ft</p> : null}
                  </div>
                </Popup>
              </Marker>
            ) : null}
          </React.Fragment>
        );
      })}
    </>
  );
};
