import React, { useEffect, useMemo, useRef, useState } from 'react';
import type { FlightPlan } from '../../../../types';
import { useAuthStore } from '../../../../stores/authStore';
import { analyzeTracksAgainstPlan } from '../../tracks/analyzePlanDeviation';
import { downloadTextFile } from '../../export/download';
import { exportFlightTrackToCsv } from '../../export/exportCsv';
import { exportFlightTrackToGpx } from '../../export/exportGpx';
import { exportFlightTrackToKml } from '../../export/exportKml';
import { parseTrackFile } from '../../tracks/parseTrackFile';
import { saveDebriefSessionToSupabase } from '../../tracks/supabaseDebrief';
import { colorForTrackIndex, createTrackId } from '../../tracks/trackFactory';
import { getTrackTimeRange } from '../../tracks/interpolateTrack';
import type { FlightTrack, TrackPoint } from '../../tracks/types';
import { DebriefSummary } from './DebriefSummary';
import { ReplayTimeline } from './ReplayTimeline';
import { TrackImportPanel } from './TrackImportPanel';
import { TrackList } from './TrackList';

interface DebriefPanelProps {
  flightPlan: FlightPlan;
  tracks: FlightTrack[];
  setTracks: React.Dispatch<React.SetStateAction<FlightTrack[]>>;
  currentTime: number | null;
  setCurrentTime: React.Dispatch<React.SetStateAction<number | null>>;
}

function metersToFeet(value: number | null): number | undefined {
  return typeof value === 'number' && Number.isFinite(value) ? value * 3.28084 : undefined;
}

function metersPerSecondToKt(value: number | null): number | undefined {
  return typeof value === 'number' && Number.isFinite(value) ? value * 1.94384 : undefined;
}

export const DebriefPanel: React.FC<DebriefPanelProps> = ({
  flightPlan,
  tracks,
  setTracks,
  currentTime,
  setCurrentTime,
}) => {
  const user = useAuthStore((state) => state.user);
  const [message, setMessage] = useState<string | null>(null);
  const [playing, setPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(10);
  const [cloudSaving, setCloudSaving] = useState(false);
  const [gpsPointCount, setGpsPointCount] = useState(0);
  const [gpsLastFixAt, setGpsLastFixAt] = useState<string | null>(null);
  const [gpsAccuracyM, setGpsAccuracyM] = useState<number | null>(null);
  const gpsWatchIdRef = useRef<number | null>(null);
  const gpsTrackIdRef = useRef<string | null>(null);
  const range = useMemo(() => getTrackTimeRange(tracks.filter((track) => track.visible)), [tracks]);
  const summaries = useMemo(() => analyzeTracksAgainstPlan(tracks.filter((track) => track.visible), flightPlan), [flightPlan, tracks]);

  useEffect(() => {
    if (!range) {
      setCurrentTime(null);
      return;
    }
    setCurrentTime((prev) => (prev && prev >= range.start && prev <= range.end ? prev : range.start));
  }, [range, setCurrentTime]);

  useEffect(() => {
    if (!playing || !range) return;
    const timer = window.setInterval(() => {
      setCurrentTime((prev) => {
        const next = (prev ?? range.start) + playbackSpeed * 1000;
        if (next >= range.end) {
          setPlaying(false);
          return range.end;
        }
        return next;
      });
    }, 1000);
    return () => window.clearInterval(timer);
  }, [playing, playbackSpeed, range, setCurrentTime]);

  useEffect(() => {
    return () => {
      if (gpsWatchIdRef.current !== null) {
        navigator.geolocation.clearWatch(gpsWatchIdRef.current);
      }
    };
  }, []);

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    if (!files.length) return;
    try {
      const results = await Promise.all(files.map((file, index) => parseTrackFile(file, tracks.length + index)));
      setTracks((prev) => [...prev, ...results.map((result) => result.track)]);
      const warnings = results.flatMap((result) => result.warnings);
      setMessage(warnings.length ? warnings.join(' / ') : `${results.length}件の航跡を読み込みました`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : '航跡ファイルの読み込みに失敗しました');
    } finally {
      event.target.value = '';
    }
  };

  const updateTrack = (trackId: string, patch: Partial<FlightTrack>) => {
    setTracks((prev) => prev.map((track) => (track.id === trackId ? { ...track, ...patch } : track)));
  };

  const removeTrack = (trackId: string) => {
    setTracks((prev) => prev.filter((track) => track.id !== trackId));
  };

  const exportTrack = (track: FlightTrack, format: 'gpx' | 'kml' | 'csv') => {
    const safeName = track.name.replace(/[^a-zA-Z0-9_-]+/g, '-').replace(/^-|-$/g, '') || 'track';
    if (format === 'gpx') {
      downloadTextFile(exportFlightTrackToGpx(track), `${safeName}.gpx`, 'application/gpx+xml');
    } else if (format === 'kml') {
      downloadTextFile(exportFlightTrackToKml(track), `${safeName}.kml`, 'application/vnd.google-earth.kml+xml');
    } else {
      downloadTextFile(exportFlightTrackToCsv(track), `${safeName}.csv`, 'text/csv');
    }
  };

  const handleCloudSave = async () => {
    if (!user) {
      setMessage('クラウド保存にはログインが必要です');
      return;
    }
    if (!tracks.length) {
      setMessage('保存する航跡がありません');
      return;
    }

    try {
      setCloudSaving(true);
      const sessionId = await saveDebriefSessionToSupabase({
        userId: user.id,
        title: `Debrief ${new Date().toLocaleString('ja-JP')}`,
        flightPlan,
        tracks,
      });
      setMessage(`クラウド保存しました: ${sessionId}`);
    } catch (error) {
      setMessage(error instanceof Error ? `クラウド保存に失敗しました: ${error.message}` : 'クラウド保存に失敗しました');
    } finally {
      setCloudSaving(false);
    }
  };

  const startGpsRecording = () => {
    if (!navigator.geolocation) {
      setMessage('このブラウザではGPS記録を利用できません');
      return;
    }
    const id = createTrackId('gps');
    gpsTrackIdRef.current = id;
    setGpsPointCount(0);
    setGpsLastFixAt(null);
    setGpsAccuracyM(null);
    setTracks((prev) => [
      ...prev,
      {
        id,
        name: `GPS ${new Date().toLocaleString('ja-JP')}`,
        color: colorForTrackIndex(prev.length),
        points: [],
        importedAt: new Date().toISOString(),
        sourceFormat: 'gps',
        visible: true,
      },
    ]);
    gpsWatchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        const timestamp = new Date(position.timestamp).toISOString();
        const point: TrackPoint = {
          timestamp,
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          altitudeFt: metersToFeet(position.coords.altitude),
          groundSpeedKt: metersPerSecondToKt(position.coords.speed),
          trackDeg: typeof position.coords.heading === 'number' ? position.coords.heading : undefined,
          source: 'gps',
        };
        setTracks((prev) => prev.map((track) => (
          track.id === gpsTrackIdRef.current ? { ...track, points: [...track.points, point] } : track
        )));
        setGpsPointCount((prev) => prev + 1);
        setGpsLastFixAt(timestamp);
        setGpsAccuracyM(position.coords.accuracy ?? null);
      },
      () => setMessage('GPS位置の取得に失敗しました'),
      { enableHighAccuracy: true, maximumAge: 1000, timeout: 10000 }
    );
    setMessage('GPS記録を開始しました。画面を開いたまま使用してください。');
  };

  const stopGpsRecording = () => {
    if (gpsWatchIdRef.current !== null) {
      navigator.geolocation.clearWatch(gpsWatchIdRef.current);
      gpsWatchIdRef.current = null;
      gpsTrackIdRef.current = null;
      setMessage('GPS記録を停止しました');
    }
  };

  const gpsRecording = gpsWatchIdRef.current !== null;

  return (
    <section className="rounded-lg border border-whiskyPapa-yellow/20 bg-gray-900/70 p-4">
      <TrackImportPanel
        message={message}
        gpsRecording={gpsRecording}
        gpsPointCount={gpsPointCount}
        gpsLastFixAt={gpsLastFixAt}
        gpsAccuracyM={gpsAccuracyM}
        canCloudSave={Boolean(user && tracks.length)}
        cloudSaving={cloudSaving}
        onImportFiles={handleImport}
        onStartGps={startGpsRecording}
        onStopGps={stopGpsRecording}
        onCloudSave={handleCloudSave}
      />
      <TrackList tracks={tracks} onUpdateTrack={updateTrack} onRemoveTrack={removeTrack} onExportTrack={exportTrack} />
      <ReplayTimeline
        range={range}
        currentTime={currentTime}
        playing={playing}
        playbackSpeed={playbackSpeed}
        onTogglePlaying={() => setPlaying((prev) => !prev)}
        onPlaybackSpeedChange={setPlaybackSpeed}
        onCurrentTimeChange={setCurrentTime}
      />
      <DebriefSummary summaries={summaries} />

      <p className="mt-3 text-2xs text-gray-500">参考表示です。実運航・航法・管制用途には使用せず、公式資料と機上計器を正としてください。</p>
    </section>
  );
};
