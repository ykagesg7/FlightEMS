import React from 'react';
import type { FlightTrack } from '../../tracks/types';

interface TrackListProps {
  tracks: FlightTrack[];
  onUpdateTrack: (trackId: string, patch: Partial<FlightTrack>) => void;
  onRemoveTrack: (trackId: string) => void;
  onExportTrack: (track: FlightTrack, format: 'gpx' | 'kml' | 'csv') => void;
}

export const TrackList: React.FC<TrackListProps> = ({
  tracks,
  onUpdateTrack,
  onRemoveTrack,
  onExportTrack,
}) => {
  return (
    <div className="mt-4 space-y-2">
      {tracks.length ? tracks.map((track) => (
        <div key={track.id} className="grid gap-2 rounded border border-gray-700 bg-black/20 p-3 text-sm md:grid-cols-[auto_minmax(0,1fr)_auto] md:items-center">
          <input type="checkbox" checked={track.visible} onChange={(event) => onUpdateTrack(track.id, { visible: event.target.checked })} aria-label={`${track.name}を表示`} />
          <div className="min-w-0">
            <input
              value={track.name}
              onChange={(event) => onUpdateTrack(track.id, { name: event.target.value })}
              className="w-full rounded border border-gray-700 bg-gray-950 px-2 py-1 text-white"
            />
            <p className="mt-1 text-xs text-gray-400">{track.sourceFormat.toUpperCase()} / {track.points.length} points / {track.points[0]?.timestamp ?? '--'}</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <input type="color" value={track.color} onChange={(event) => onUpdateTrack(track.id, { color: event.target.value })} aria-label={`${track.name}の色`} />
            <button type="button" onClick={() => onExportTrack(track, 'gpx')} className="rounded border border-gray-600 px-2 py-1 text-xs hover:bg-gray-800">
              GPX
            </button>
            <button type="button" onClick={() => onExportTrack(track, 'kml')} className="rounded border border-gray-600 px-2 py-1 text-xs hover:bg-gray-800">
              KML
            </button>
            <button type="button" onClick={() => onExportTrack(track, 'csv')} className="rounded border border-gray-600 px-2 py-1 text-xs hover:bg-gray-800">
              CSV
            </button>
            <button type="button" onClick={() => onRemoveTrack(track.id)} className="rounded border border-red-400/40 px-2 py-1 text-xs text-red-200 hover:bg-red-900/30">
              削除
            </button>
          </div>
        </div>
      )) : <p className="text-sm text-gray-400">航跡はまだ読み込まれていません。</p>}
    </div>
  );
};
