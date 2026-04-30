import React from 'react';

interface TrackImportPanelProps {
  message: string | null;
  gpsRecording: boolean;
  gpsPointCount: number;
  gpsLastFixAt: string | null;
  gpsAccuracyM: number | null;
  canCloudSave: boolean;
  cloudSaving: boolean;
  onImportFiles: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onStartGps: () => void;
  onStopGps: () => void;
  onCloudSave: () => void;
}

export const TrackImportPanel: React.FC<TrackImportPanelProps> = ({
  message,
  gpsRecording,
  gpsPointCount,
  gpsLastFixAt,
  gpsAccuracyM,
  canCloudSave,
  cloudSaving,
  onImportFiles,
  onStartGps,
  onStopGps,
  onCloudSave,
}) => {
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-whiskyPapa-yellow">Debrief / 航跡</h3>
          <p className="text-xs text-gray-400">GPX / KML / CSV を読み込み、複数機の航跡を飛行後解析に使います。</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={() => fileInputRef.current?.click()} className="min-h-[40px] rounded border border-whiskyPapa-yellow/40 px-3 text-sm hover:bg-whiskyPapa-yellow/10">
            航跡を読み込む
          </button>
          <button type="button" onClick={gpsRecording ? onStopGps : onStartGps} className="min-h-[40px] rounded border border-whiskyPapa-yellow/40 px-3 text-sm hover:bg-whiskyPapa-yellow/10">
            {gpsRecording ? 'GPS停止' : 'GPS記録'}
          </button>
          <button
            type="button"
            onClick={onCloudSave}
            disabled={!canCloudSave || cloudSaving}
            className="min-h-[40px] rounded border border-whiskyPapa-yellow/40 px-3 text-sm hover:bg-whiskyPapa-yellow/10 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {cloudSaving ? '保存中...' : 'クラウド保存'}
          </button>
          <input ref={fileInputRef} type="file" multiple accept=".gpx,.kml,.csv" className="hidden" onChange={onImportFiles} />
        </div>
      </div>

      {gpsRecording ? (
        <div className="mt-3 rounded border border-whiskyPapa-yellow/30 bg-black/30 px-3 py-2 text-xs text-gray-200">
          GPS記録中: {gpsPointCount} points / 最終取得: {gpsLastFixAt ? new Date(gpsLastFixAt).toLocaleTimeString('ja-JP') : '--'}
          {typeof gpsAccuracyM === 'number' ? ` / 精度 ${gpsAccuracyM.toFixed(0)}m` : ''}
        </div>
      ) : null}

      {message ? <p className="mt-3 rounded border border-whiskyPapa-yellow/20 bg-black/30 px-3 py-2 text-xs text-gray-200">{message}</p> : null}
    </>
  );
};
