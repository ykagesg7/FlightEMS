#!/usr/bin/env bash
# Integration: record_attempt against PR① schema + seed + explicit slug map.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
DB_DIR="$ROOT/scripts/database"
PG_URL="${SPIRAL_LMS_PG_URL:-}"
CONTAINER_NAME="spiral-lms-pg-test-$$"

cleanup() {
  docker rm -f "$CONTAINER_NAME" >/dev/null 2>&1 || true
}

if [[ -n "$PG_URL" ]]; then
  if ! command -v psql >/dev/null 2>&1; then
    echo "psql required when SPIRAL_LMS_PG_URL is set"
    exit 1
  fi
  run_psql() {
    psql "$PG_URL" -v ON_ERROR_STOP=1 "$@"
  }
  run_psql_file() {
    psql "$PG_URL" -v ON_ERROR_STOP=1 < "$1"
  }
else
  trap cleanup EXIT
  if ! command -v docker >/dev/null 2>&1; then
    echo "docker not available; skipping spiral LMS integration tests"
    exit 0
  fi
  if ! docker run -d --name "$CONTAINER_NAME" \
    -e POSTGRES_PASSWORD=postgres \
    postgres:15-alpine >/dev/null; then
    echo "Failed to start Postgres container"
    exit 1
  fi
  ready=0
  for _ in $(seq 1 90); do
    if docker ps --filter "name=$CONTAINER_NAME" --filter "status=running" -q | grep -q . \
      && docker exec "$CONTAINER_NAME" pg_isready -U postgres >/dev/null 2>&1; then
      ready=1
      break
    fi
    sleep 1
  done
  if [[ "$ready" != "1" ]]; then
    echo "Postgres container did not become ready in time"
    exit 1
  fi
  run_psql() {
    docker exec -i "$CONTAINER_NAME" psql -v ON_ERROR_STOP=1 -U postgres "$@"
  }
  run_psql_file() {
    docker exec -i "$CONTAINER_NAME" psql -v ON_ERROR_STOP=1 -U postgres < "$1"
  }
fi

TEST_USER='11111111-1111-1111-1111-111111111111'

run_psql -f - <<'SQL'
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE SCHEMA IF NOT EXISTS auth;
CREATE TABLE IF NOT EXISTS auth.users (
  id uuid PRIMARY KEY
);

CREATE OR REPLACE FUNCTION auth.uid()
RETURNS uuid
LANGUAGE sql
STABLE
AS $$
  SELECT nullif(current_setting('request.jwt.claim.sub', true), '')::uuid;
$$;

CREATE TABLE IF NOT EXISTS public.learning_contents (
  id text PRIMARY KEY,
  title text NOT NULL,
  category text NOT NULL,
  sub_category text,
  description text,
  order_index integer NOT NULL DEFAULT 0,
  parent_id text,
  content_type text NOT NULL DEFAULT 'text',
  is_published boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

DO $$
BEGIN
  CREATE ROLE anon;
  CREATE ROLE authenticated;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END
$$;

INSERT INTO auth.users (id) VALUES
  ('11111111-1111-1111-1111-111111111111'::uuid)
ON CONFLICT DO NOTHING;
SQL

run_psql_file "$DB_DIR/20261012_spiral_lms_schema_rls.sql"
run_psql_file "$DB_DIR/20261012_spiral_lms_content_slug_map.sql"
run_psql_file "$DB_DIR/20261012_spiral_lms_record_attempt.sql"
run_psql_file "$DB_DIR/20261012_spiral_lms_seed_l1_l2_nodes.sql"

run_psql -f - <<'SQL'
INSERT INTO public.learning_contents (id, title, category, is_published)
SELECT m.learning_content_id, m.learning_content_id, 'PPL', true
FROM public.spiral_content_slug_map m
ON CONFLICT (id) DO UPDATE SET is_published = true;

GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO authenticated;
SQL

attempt_uuid() {
  printf 'bbbbbbbb-bbbb-bbbb-bbbb-%012x' "$1"
}

record_content() {
  local node_id="$1"
  local slug="$2"
  local n="$3"
  run_psql -tA <<SQL
SET request.jwt.claim.sub = '${TEST_USER}';
SELECT (public.record_attempt(
  '${node_id}',
  'content_view',
  '$(attempt_uuid "$n")'::uuid,
  '${slug}',
  100
)->>'passed');
SQL
}

echo "== PR① seed walkthrough: required reads only (no mini_quiz) =="

for round in $(seq 1 80); do
  progress=0
  while IFS=$'\t' read -r node_id slug; do
    [[ -z "$node_id" ]] && continue
    completed="$(run_psql -tA <<SQL
SET request.jwt.claim.sub = '${TEST_USER}';
SELECT private.spiral_lms_slug_completed('${TEST_USER}'::uuid, '${slug}');
SQL
)"
    completed="$(echo "$completed" | tail -n 1 | tr -d '\r')"
    if [[ "$completed" == "t" ]]; then
      continue
    fi
    n=$((round * 10000 + progress))
    record_content "$node_id" "$slug" "$n" >/dev/null
    progress=$((progress + 1))
  done < <(
    run_psql -tA <<'SQL'
SELECT nc.node_id, nc.content_slug
FROM public.node_contents nc
INNER JOIN public.nodes n ON n.id = nc.node_id
WHERE n.is_published = true
  AND nc.is_required = true
ORDER BY n.z_level, n.quadrant, n.sort_order, nc.sort_order;
SQL
  )

  not_mastered="$(run_psql -tA <<'SQL'
SELECT count(*)::text
FROM public.nodes n
WHERE n.is_published = true
  AND NOT EXISTS (
    SELECT 1
    FROM public.user_progress up
    WHERE up.user_id = '11111111-1111-1111-1111-111111111111'::uuid
      AND up.node_id = n.id
      AND up.status = 'MASTERED'
  );
SQL
)"
  not_mastered="$(echo "$not_mastered" | tail -n 1 | tr -d '\r')"
  if [[ "$not_mastered" == "0" ]]; then
    echo "OK: all published nodes MASTERED in round ${round}"
    break
  fi
  if [[ "$progress" == "0" ]]; then
    echo "FAIL: stuck with ${not_mastered} nodes not MASTERED"
    run_psql <<'SQL'
SELECT n.id, coalesce(up.status, 'NO_ROW')
FROM public.nodes n
LEFT JOIN public.user_progress up
  ON up.node_id = n.id
 AND up.user_id = '11111111-1111-1111-1111-111111111111'::uuid
WHERE n.is_published = true
  AND coalesce(up.status, 'LOCKED') <> 'MASTERED'
ORDER BY n.z_level, n.quadrant, n.sort_order;
SQL
    exit 1
  fi
done

assert_status() {
  local node="$1"
  local expected="$2"
  local got
  got="$(run_psql -tA <<SQL
SELECT status FROM public.user_progress
WHERE user_id = '${TEST_USER}'::uuid AND node_id = '${node}';
SQL
)"
  got="$(echo "$got" | tail -n 1 | tr -d '\r')"
  if [[ "$got" != "$expected" ]]; then
    echo "FAIL: ${node} expected ${expected}, got ${got}"
    exit 1
  fi
  echo "OK: ${node} is ${expected}"
}

assert_status 'L1-Q2-1' 'MASTERED'
assert_status 'L2-Q1-2' 'MASTERED'
assert_status 'L2-Q3-3' 'MASTERED'

# Idempotency: same key + payload replays; different payload conflicts
run_psql -tA >/dev/null <<SQL
SET request.jwt.claim.sub = '${TEST_USER}';
SELECT public.record_attempt(
  'L1-Q1-1', 'content_view', 'cccccccc-cccc-cccc-cccc-cccccccccccc'::uuid,
  'ppl-1-1-3-bernoulli-principle', 100
);
SQL

set +e
conflict_out="$(run_psql -tA 2>&1 <<SQL
SET request.jwt.claim.sub = '${TEST_USER}';
SELECT public.record_attempt(
  'L1-Q1-1', 'content_view', 'cccccccc-cccc-cccc-cccc-cccccccccccc'::uuid,
  'ppl-1-1-3-bernoulli-principle', 99
);
SQL
)"
set -e
if echo "$conflict_out" | grep -q idempotency_conflict; then
  echo "OK: idempotency_conflict on payload mismatch"
else
  echo "FAIL: expected idempotency_conflict on score mismatch"
  echo "$conflict_out"
  exit 1
fi

replay="$(run_psql -tA <<SQL
SET request.jwt.claim.sub = '${TEST_USER}';
SELECT (public.record_attempt(
  'L1-Q1-1', 'content_view', 'cccccccc-cccc-cccc-cccc-cccccccccccc'::uuid,
  'ppl-1-1-3-bernoulli-principle', 100
)->>'idempotent');
SQL
)"
replay="$(echo "$replay" | tail -n 1 | tr -d '\r')"
if [[ "$replay" != "true" ]]; then
  echo "FAIL: idempotent replay expected true, got ${replay}"
  exit 1
fi
echo "OK: idempotent replay"

if run_psql -tA >/dev/null 2>&1 <<SQL; then
SET request.jwt.claim.sub = '${TEST_USER}';
SELECT public.record_attempt(
  'L1-Q1-1', 'content_view', 'dddddddd-dddd-dddd-dddd-dddddddddddd'::uuid,
  'ppl-1-1-3-bernoulli-principle', 101
);
SQL
  echo "FAIL: invalid score should be rejected"
  exit 1
else
  echo "OK: invalid score rejected"
fi

echo "spiral_lms_record_attempt integration: all checks passed"
