import React from 'react';
import type { FlightCameraMode, FlightPlaybackSpeed, FlightViewControls } from './types';
import { PREVIEW_ALTITUDE_STEP_FT } from './types';

export type FlightViewer3DControlsProps = {
  ready: boolean;
  playing: boolean;
  progressPct: number;
  cameraMode: FlightCameraMode;
  viewControls: FlightViewControls;
  playbackSpeed: FlightPlaybackSpeed;
  previewAltitudeMinFt: number;
  previewAltitudeMaxFt: number;
  onTogglePlay: () => void;
  onSeekProgress: (pct: number) => void;
  onCameraModeChange: (mode: FlightCameraMode) => void;
  onViewControlsChange: (next: FlightViewControls) => void;
  onPlaybackSpeedChange: (speed: FlightPlaybackSpeed) => void;
};

const PLAYBACK_SPEEDS: FlightPlaybackSpeed[] = [1, 2, 3];

export const FlightViewer3DControls: React.FC<FlightViewer3DControlsProps> = ({
  ready,
  playing,
  progressPct,
  cameraMode,
  viewControls,
  playbackSpeed,
  previewAltitudeMinFt,
  previewAltitudeMaxFt,
  onTogglePlay,
  onSeekProgress,
  onCameraModeChange,
  onViewControlsChange,
  onPlaybackSpeedChange,
}) => (
  <div className="flex shrink-0 flex-col gap-2 border-t border-brand-primary/25 bg-brand-surface px-3 py-2">
    <div className="flex flex-wrap items-center gap-2">
      <button
        type="button"
        data-testid="flight-viewer-play"
        onClick={onTogglePlay}
        disabled={!ready}
        className="min-h-[44px] rounded border border-brand-primary/50 px-3 py-1.5 text-xs text-brand-primary hover:bg-brand-primary/10 disabled:opacity-40"
      >
        {playing ? '一時停止' : '再生'}
      </button>
      <div
        className="flex rounded border border-brand-primary/40 p-0.5"
        role="group"
        aria-label="カメラモード"
      >
        <button
          type="button"
          data-testid="flight-viewer-camera-chase"
          onClick={() => onCameraModeChange('chase')}
          disabled={!ready}
          className={`min-h-[40px] rounded px-2.5 text-xs disabled:opacity-40 ${
            cameraMode === 'chase'
              ? 'bg-brand-primary/25 text-brand-primary'
              : 'text-gray-300 hover:bg-brand-primary/10'
          }`}
        >
          チェイス
        </button>
        <button
          type="button"
          data-testid="flight-viewer-camera-cockpit"
          onClick={() => onCameraModeChange('cockpit')}
          disabled={!ready}
          className={`min-h-[40px] rounded px-2.5 text-xs disabled:opacity-40 ${
            cameraMode === 'cockpit'
              ? 'bg-brand-primary/25 text-brand-primary'
              : 'text-gray-300 hover:bg-brand-primary/10'
          }`}
        >
          コックピット
        </button>
      </div>
      <fieldset className="flex min-h-[44px] items-center gap-1.5 border-0 p-0">
        <legend className="sr-only">再生速度</legend>
        <span className="shrink-0 text-xs text-gray-300">再生速度</span>
        {PLAYBACK_SPEEDS.map((speed) => (
          <button
            key={speed}
            type="button"
            data-testid={`flight-viewer-playback-speed-${speed}x`}
            disabled={!ready}
            onClick={() => onPlaybackSpeedChange(speed)}
            className={`min-h-[36px] min-w-[2.5rem] rounded border px-2 text-xs tabular-nums disabled:opacity-40 ${
              playbackSpeed === speed
                ? 'border-brand-primary/60 bg-brand-primary/25 text-brand-primary'
                : 'border-brand-primary/30 text-gray-300 hover:bg-brand-primary/10'
            }`}
            aria-pressed={playbackSpeed === speed}
          >
            {speed}x
          </button>
        ))}
      </fieldset>
      <label className="flex min-h-[44px] flex-1 min-w-[140px] items-center gap-2 text-xs text-gray-300">
        <span className="shrink-0 tabular-nums">{Math.round(progressPct)}%</span>
        <input
          type="range"
          min={0}
          max={100}
          step={0.5}
          value={progressPct}
          disabled={!ready}
          onChange={(e) => onSeekProgress(Number(e.target.value))}
          className="h-2 flex-1 accent-brand-primary"
          aria-label="再生位置"
        />
      </label>
    </div>
    <div className="flex flex-wrap items-end gap-x-4 gap-y-2 text-xs text-gray-300">
      <label className="flex min-w-[10rem] flex-1 flex-col gap-1">
        <span>
          プレビュー高度（ft）
          <span className="ml-1 tabular-nums text-gray-400">{viewControls.previewAltitudeFt}</span>
        </span>
        <span className="text-2xs text-gray-500">3D 表示のみ（フライトプランの高度は変更しません）</span>
        <input
          type="range"
          min={previewAltitudeMinFt}
          max={previewAltitudeMaxFt}
          step={PREVIEW_ALTITUDE_STEP_FT}
          disabled={!ready}
          value={viewControls.previewAltitudeFt}
          onChange={(e) =>
            onViewControlsChange({
              ...viewControls,
              previewAltitudeFt: Number(e.target.value),
            })
          }
          className="h-2 accent-brand-primary"
          data-testid="flight-viewer-preview-altitude"
          aria-label="プレビュー高度"
        />
      </label>
      {cameraMode === 'chase' ? (
        <label className="flex min-w-[8rem] flex-1 flex-col gap-1">
          <span>
            距離（m）
            <span className="ml-1 tabular-nums text-gray-400">{viewControls.chaseDistanceM}</span>
          </span>
          <input
            type="range"
            min={80}
            max={3000}
            step={20}
            disabled={!ready}
            value={viewControls.chaseDistanceM}
            onChange={(e) =>
              onViewControlsChange({
                ...viewControls,
                chaseDistanceM: Number(e.target.value),
              })
            }
            className="h-2 accent-brand-primary disabled:opacity-40"
            data-testid="flight-viewer-chase-distance"
            aria-label="チェイス距離"
          />
        </label>
      ) : null}
      <label className="flex min-w-[8rem] flex-1 flex-col gap-1">
        <span>
          {cameraMode === 'cockpit' ? '前方俯角（°）' : '俯角（°）'}
          <span className="ml-1 tabular-nums text-gray-400">{viewControls.chasePitchDeg}</span>
        </span>
        <input
          type="range"
          min={-75}
          max={-5}
          step={1}
          disabled={!ready}
          value={viewControls.chasePitchDeg}
          onChange={(e) =>
            onViewControlsChange({
              ...viewControls,
              chasePitchDeg: Number(e.target.value),
            })
          }
          className="h-2 accent-brand-primary"
          data-testid="flight-viewer-chase-pitch"
          aria-label="俯角"
        />
      </label>
    </div>
  </div>
);
