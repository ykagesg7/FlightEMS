import React from 'react';

interface ReplayTimelineProps {
  range: { start: number; end: number } | null;
  currentTime: number | null;
  playing: boolean;
  playbackSpeed: number;
  onTogglePlaying: () => void;
  onPlaybackSpeedChange: (speed: number) => void;
  onCurrentTimeChange: (time: number) => void;
}

function formatTimeLabel(value: number | null): string {
  return value ? new Date(value).toLocaleString('ja-JP') : '--';
}

export const ReplayTimeline: React.FC<ReplayTimelineProps> = ({
  range,
  currentTime,
  playing,
  playbackSpeed,
  onTogglePlaying,
  onPlaybackSpeedChange,
  onCurrentTimeChange,
}) => {
  if (!range) return null;

  return (
    <div className="mt-4 rounded border border-gray-700 bg-black/20 p-3">
      <div className="flex flex-wrap items-center gap-2">
        <button type="button" onClick={onTogglePlaying} className="rounded border border-whiskyPapa-yellow/40 px-3 py-1 text-sm hover:bg-whiskyPapa-yellow/10">
          {playing ? '停止' : '再生'}
        </button>
        <select value={playbackSpeed} onChange={(event) => onPlaybackSpeedChange(Number(event.target.value))} className="rounded border border-gray-700 bg-gray-950 px-2 py-1 text-sm">
          <option value={1}>1x</option>
          <option value={5}>5x</option>
          <option value={10}>10x</option>
          <option value={30}>30x</option>
          <option value={60}>60x</option>
        </select>
        <span className="text-xs text-gray-300">{formatTimeLabel(currentTime)}</span>
      </div>
      <input
        type="range"
        min={range.start}
        max={range.end}
        step={1000}
        value={currentTime ?? range.start}
        onChange={(event) => onCurrentTimeChange(Number(event.target.value))}
        className="mt-3 w-full"
      />
    </div>
  );
};
