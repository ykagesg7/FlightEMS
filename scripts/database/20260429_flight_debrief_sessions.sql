-- Flight Debrief sessions and track metadata.
-- Raw/large track payloads should be stored in Supabase Storage; these tables keep ownership and summaries.

create table if not exists public.flight_debrief_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null default 'Untitled Debrief',
  description text,
  plan_document jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.flight_tracks (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.flight_debrief_sessions(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  aircraft_label text,
  pilot_name text,
  color text not null default '#39FF14',
  source_format text not null check (source_format in ('gpx', 'kml', 'csv', 'gps', 'json')),
  started_at timestamptz,
  ended_at timestamptz,
  point_count integer not null default 0 check (point_count >= 0),
  summary jsonb not null default '{}'::jsonb,
  storage_path text,
  created_at timestamptz not null default now()
);

alter table public.flight_debrief_sessions enable row level security;
alter table public.flight_tracks enable row level security;

drop policy if exists "flight_debrief_sessions_select_own" on public.flight_debrief_sessions;
create policy "flight_debrief_sessions_select_own"
  on public.flight_debrief_sessions for select
  using (user_id = (select auth.uid()));

drop policy if exists "flight_debrief_sessions_insert_own" on public.flight_debrief_sessions;
create policy "flight_debrief_sessions_insert_own"
  on public.flight_debrief_sessions for insert
  with check (user_id = (select auth.uid()));

drop policy if exists "flight_debrief_sessions_update_own" on public.flight_debrief_sessions;
create policy "flight_debrief_sessions_update_own"
  on public.flight_debrief_sessions for update
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

drop policy if exists "flight_debrief_sessions_delete_own" on public.flight_debrief_sessions;
create policy "flight_debrief_sessions_delete_own"
  on public.flight_debrief_sessions for delete
  using (user_id = (select auth.uid()));

drop policy if exists "flight_tracks_select_own" on public.flight_tracks;
create policy "flight_tracks_select_own"
  on public.flight_tracks for select
  using (user_id = (select auth.uid()));

drop policy if exists "flight_tracks_insert_own" on public.flight_tracks;
create policy "flight_tracks_insert_own"
  on public.flight_tracks for insert
  with check (user_id = (select auth.uid()));

drop policy if exists "flight_tracks_update_own" on public.flight_tracks;
create policy "flight_tracks_update_own"
  on public.flight_tracks for update
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

drop policy if exists "flight_tracks_delete_own" on public.flight_tracks;
create policy "flight_tracks_delete_own"
  on public.flight_tracks for delete
  using (user_id = (select auth.uid()));

create index if not exists flight_debrief_sessions_user_created_idx
  on public.flight_debrief_sessions (user_id, created_at desc);

create index if not exists flight_tracks_session_idx
  on public.flight_tracks (session_id, created_at);

insert into storage.buckets (id, name, public)
values ('flight-debrief-tracks', 'flight-debrief-tracks', false)
on conflict (id) do nothing;

drop policy if exists "flight_debrief_track_objects_select_own" on storage.objects;
create policy "flight_debrief_track_objects_select_own"
  on storage.objects for select
  using (
    bucket_id = 'flight-debrief-tracks'
    and (select auth.uid())::text = split_part(name, '/', 1)
  );

drop policy if exists "flight_debrief_track_objects_insert_own" on storage.objects;
create policy "flight_debrief_track_objects_insert_own"
  on storage.objects for insert
  with check (
    bucket_id = 'flight-debrief-tracks'
    and (select auth.uid())::text = split_part(name, '/', 1)
  );

drop policy if exists "flight_debrief_track_objects_update_own" on storage.objects;
create policy "flight_debrief_track_objects_update_own"
  on storage.objects for update
  using (
    bucket_id = 'flight-debrief-tracks'
    and (select auth.uid())::text = split_part(name, '/', 1)
  )
  with check (
    bucket_id = 'flight-debrief-tracks'
    and (select auth.uid())::text = split_part(name, '/', 1)
  );

drop policy if exists "flight_debrief_track_objects_delete_own" on storage.objects;
create policy "flight_debrief_track_objects_delete_own"
  on storage.objects for delete
  using (
    bucket_id = 'flight-debrief-tracks'
    and (select auth.uid())::text = split_part(name, '/', 1)
  );
