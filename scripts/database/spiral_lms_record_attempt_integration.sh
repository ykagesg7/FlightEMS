#!/usr/bin/env bash
# Integration tests for spiral LMS record_attempt (Docker Postgres). Used in mekiki-ci.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
DB_DIR="$ROOT/scripts/database"
CONTAINER_NAME="spiral-lms-pg-test-$$"
PG_PORT="${SPIRAL_LMS_PG_PORT:-55432}"
PG_URL="postgresql://postgres:postgres@127.0.0.1:${PG_PORT}/postgres"

cleanup() {
  docker rm -f "$CONTAINER_NAME" >/dev/null 2>&1 || true
}
trap cleanup EXIT

if ! command -v docker >/dev/null 2>&1; then
  echo "docker not available; skipping spiral LMS integration tests"
  exit 0
fi

if ! docker run -d --name "$CONTAINER_NAME" \
  -e POSTGRES_PASSWORD=postgres \
  postgres:16-alpine >/dev/null; then
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
  docker logs "$CONTAINER_NAME" 2>&1 | tail -30 || true
  exit 1
fi

run_psql() {
  local attempt
  for attempt in 1 2 3 4 5; do
    if docker exec -i "$CONTAINER_NAME" psql -v ON_ERROR_STOP=1 -U postgres "$@"; then
      return 0
    fi
    sleep 2
  done
  return 1
}

run_psql_file() {
  docker exec -i "$CONTAINER_NAME" psql -v ON_ERROR_STOP=1 -U postgres < "$1"
}

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

INSERT INTO public.learning_contents (id, title, category, is_published)
VALUES
  ('PPL-1-1-1_TemperatureBasics', 't', 'PPL', true),
  ('4.1.1_ChoresAreTheJob', 'article', 'Articles', false),
  ('4.1.2_SpeakBeforeAsked', 'article2', 'Articles', true),
  ('4.1.3_AnswerFirstWord', 'a3', 'Articles', true),
  ('4.1.4_SayExpectations', 'a4', 'Articles', true),
  ('4.1.5_JustEnoughIsNotEnough', 'a5', 'Articles', true),
  ('4.2.1_TurnFeedbackIntoAction', 'a6', 'Articles', true),
  ('4.2.2_PutAFrameOnFailure', 'a7', 'Articles', true),
  ('4.2.3_TakeTheGainFromFeedback', 'a8', 'Articles', true),
  ('4.2.4_YesHasAShortShelfLife', 'a9', 'Articles', true),
  ('4.2.5_ThinkingStamina', 'a10', 'Articles', true)
ON CONFLICT (id) DO UPDATE SET is_published = EXCLUDED.is_published;

DO $$
BEGIN
  CREATE ROLE anon;
  CREATE ROLE authenticated;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END
$$;
SQL

run_psql_file "$DB_DIR/20261012_spiral_lms_schema_rls.sql"
run_psql_file "$DB_DIR/20261012_spiral_lms_record_attempt.sql"

run_psql -f - <<'SQL'
INSERT INTO auth.users (id) VALUES
  ('11111111-1111-1111-1111-111111111111'::uuid);

INSERT INTO public.nodes (id, title, quadrant, z_level, sort_order, passing_score, unlock_config, is_published, opens_at)
VALUES
  ('L1-A', 'L1 A', 1, 1, 1, NULL, '{}'::jsonb, true, NULL),
  ('L1-B', 'L1 B', 1, 1, 2, NULL, '{}'::jsonb, true, NULL),
  ('L2-A', 'L2 A', 1, 2, 1, 80, '{}'::jsonb, true, NULL),
  ('L2-ZERO', 'zero required', 2, 2, 2, NULL, '{}'::jsonb, true, NULL),
  ('L1-UNPUB-PREREQ', 'unpub prereq', 3, 1, 3, NULL, '{}'::jsonb, false, NULL),
  ('L1-CHILD', 'child', 3, 1, 4, NULL, '{}'::jsonb, true, NULL),
  ('L1-ART', 'article gate', 4, 1, 5, NULL, '{}'::jsonb, true, NULL);

INSERT INTO public.node_prerequisites (node_id, prerequisite_node_id)
VALUES ('L1-CHILD', 'L1-UNPUB-PREREQ');

INSERT INTO public.node_contents (node_id, content_slug, content_type, is_required, sort_order)
VALUES
  ('L1-A', 'ppl-1-1-1-temperature-basics', 'lesson', true, 1),
  ('L1-B', 'ppl-1-1-1-temperature-basics', 'lesson', true, 1),
  ('L2-A', 'ppl-1-1-1-temperature-basics', 'lesson', true, 1),
  ('L2-ZERO', 'ppl-1-1-1-temperature-basics', 'lesson', false, 1),
  ('L1-CHILD', 'ppl-1-1-1-temperature-basics', 'lesson', true, 1),
  ('L1-ART', '/articles/speak-before-asked', 'article', true, 1);

INSERT INTO public.spiral_article_slug_learning_id (content_slug, learning_content_id)
VALUES ('/articles/chores-are-the-job', '4.1.1_ChoresAreTheJob')
ON CONFLICT (content_slug) DO NOTHING;

GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO authenticated;
SQL

TEST_USER='11111111-1111-1111-1111-111111111111'

assert_sql() {
  local desc="$1"
  local sql="$2"
  local expected="$3"
  local got
  got="$(run_psql -tA <<SQL
SET request.jwt.claim.sub = '${TEST_USER}';
${sql}
SQL
)"
  got="$(echo "$got" | tail -n 1 | tr -d '\r')"
  if [[ "$got" != "$expected" ]]; then
    echo "FAIL: $desc (expected '$expected', got '$got')"
    exit 1
  fi
  echo "OK: $desc"
}

# (1) Server-side pass: content_view requires score=100
assert_sql "content_view pass at 100" \
  "SELECT (public.record_attempt('L1-A', 'content_view', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0001'::uuid, 'ppl-1-1-1-temperature-basics', 100)->>'passed');" \
  "true"

assert_sql "content_view fail at 99 stored passed false" \
  "SELECT (public.record_attempt('L1-B', 'content_view', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0002'::uuid, 'ppl-1-1-1-temperature-basics', 99)->>'passed');" \
  "false"

# (3) Z-level gate: L2-A locked until all L1 published nodes MASTERED
assert_sql "L2-A locked before L1-B mastered" \
  "SELECT status FROM public.user_progress WHERE user_id = '${TEST_USER}'::uuid AND node_id = 'L2-A';" \
  "LOCKED"

assert_sql "L1-B mastered at score 100" \
  "SELECT (public.record_attempt('L1-B', 'content_view', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0003'::uuid, 'ppl-1-1-1-temperature-basics', 100)->>'node_status');" \
  "MASTERED"

assert_sql "L1-CHILD mastered for z gate" \
  "SELECT (public.record_attempt('L1-CHILD', 'content_view', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0007'::uuid, 'ppl-1-1-1-temperature-basics', 100)->>'node_status');" \
  "MASTERED"

assert_sql "L1-ART mastered for z gate" \
  "SELECT (public.record_attempt('L1-ART', 'content_view', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0008'::uuid, '/articles/speak-before-asked', 100)->>'node_status');" \
  "MASTERED"

assert_sql "L2-A unlocked (not LOCKED) after L1 z gate cleared" \
  "SELECT status FROM public.user_progress WHERE user_id = '${TEST_USER}'::uuid AND node_id = 'L2-A';" \
  "IN_PROGRESS"

# (2) Zero required content cannot MASTERED (only optional link)
assert_sql "L2-ZERO not MASTERED with zero required content" \
  "SELECT (public.record_attempt('L2-ZERO', 'content_view', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0006'::uuid, 'ppl-1-1-1-temperature-basics', 100)->>'node_status');" \
  "IN_PROGRESS"

# (5) Idempotent client_attempt_id
assert_sql "idempotent replay" \
  "SELECT (public.record_attempt('L1-A', 'content_view', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0001'::uuid, 'ppl-1-1-1-temperature-basics', 100)->>'idempotent');" \
  "true"

assert_sql "idempotent does not duplicate attempts" \
  "SELECT count(*)::text FROM public.user_attempts WHERE user_id = '${TEST_USER}'::uuid AND client_attempt_id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0001'::uuid;" \
  "1"

# (7) Unpublished article rejected (node added after z-gate tests)
run_psql -f - <<'SQL'
INSERT INTO public.nodes (id, title, quadrant, z_level, sort_order, unlock_config, is_published)
VALUES ('L1-UNPUB-ART', 'unpub article', 4, 1, 6, '{}'::jsonb, true);
INSERT INTO public.node_contents (node_id, content_slug, content_type, is_required, sort_order)
VALUES ('L1-UNPUB-ART', '/articles/chores-are-the-job', 'article', true, 1);
SQL

if run_psql -tA >/dev/null 2>&1 <<SQL; then
SET request.jwt.claim.sub = '${TEST_USER}';
SELECT public.record_attempt('L1-UNPUB-ART', 'content_view', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0004'::uuid, '/articles/chores-are-the-job', 100);
SQL
  echo "FAIL: unpublished article should raise content_not_published"
  exit 1
else
  echo "OK: unpublished article rejected"
fi

# (1) invalid score rejected
if run_psql -tA >/dev/null 2>&1 <<SQL; then
SET request.jwt.claim.sub = '${TEST_USER}';
SELECT public.record_attempt('L1-A', 'content_view', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0005'::uuid, 'ppl-1-1-1-temperature-basics', 101);
SQL
  echo "FAIL: score > 100 should be rejected"
  exit 1
else
  echo "OK: invalid score rejected"
fi

# Unpublished prerequisite ignored: L1-CHILD should not stay LOCKED solely for unpublished prereq
assert_sql "unpublished prerequisite ignored" \
  "SELECT status FROM public.user_progress WHERE user_id = '${TEST_USER}'::uuid AND node_id = 'L1-CHILD';" \
  "AVAILABLE"

echo "spiral_lms_record_attempt integration: all checks passed"
