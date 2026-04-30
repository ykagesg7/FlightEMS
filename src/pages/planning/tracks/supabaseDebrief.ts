import { supabase } from '../../../utils/supabase';
import { toPlanDocument } from '../../../utils/planDocument';
import type { FlightPlan } from '../../../types';
import type { FlightTrack } from './types';

interface SaveDebriefSessionArgs {
  userId: string;
  title: string;
  description?: string;
  flightPlan: FlightPlan;
  tracks: FlightTrack[];
}

interface InsertedSession {
  id: string;
}

function trackStoragePath(userId: string, sessionId: string, track: FlightTrack): string {
  return `${userId}/${sessionId}/${track.id}.json`;
}

function finiteOrNull(value: number): number | null {
  return Number.isFinite(value) ? value : null;
}

export function buildTrackStorageSummary(track: FlightTrack): { minAltitudeFt: number | null; maxAltitudeFt: number | null } {
  const altitudes = track.points
    .map((point) => point.altitudeFt)
    .filter((value): value is number => typeof value === 'number' && Number.isFinite(value));

  return {
    minAltitudeFt: altitudes.length ? finiteOrNull(Math.min(...altitudes)) : null,
    maxAltitudeFt: altitudes.length ? finiteOrNull(Math.max(...altitudes)) : null,
  };
}

export async function saveDebriefSessionToSupabase(args: SaveDebriefSessionArgs): Promise<string> {
  const { data: session, error: sessionError } = await supabase
    .from('flight_debrief_sessions')
    .insert({
      user_id: args.userId,
      title: args.title,
      description: args.description ?? null,
      plan_document: toPlanDocument(args.flightPlan),
    })
    .select('id')
    .single<InsertedSession>();

  if (sessionError) throw sessionError;
  if (!session?.id) throw new Error('Debrief session id was not returned');

  for (const track of args.tracks) {
    const storagePath = trackStoragePath(args.userId, session.id, track);
    const payload = JSON.stringify(track);
    const { error: uploadError } = await supabase.storage
      .from('flight-debrief-tracks')
      .upload(storagePath, new Blob([payload], { type: 'application/json' }), {
        upsert: true,
        contentType: 'application/json',
      });
    if (uploadError) throw uploadError;

    const first = track.points[0];
    const last = track.points[track.points.length - 1];
    const { error: trackError } = await supabase.from('flight_tracks').insert({
      session_id: session.id,
      user_id: args.userId,
      name: track.name,
      aircraft_label: track.aircraftLabel ?? null,
      pilot_name: track.pilotName ?? null,
      color: track.color,
      source_format: track.sourceFormat,
      started_at: first?.timestamp ?? null,
      ended_at: last?.timestamp ?? null,
      point_count: track.points.length,
      summary: buildTrackStorageSummary(track),
      storage_path: storagePath,
    });
    if (trackError) throw trackError;
  }

  return session.id;
}
