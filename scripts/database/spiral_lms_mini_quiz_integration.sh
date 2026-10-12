#!/usr/bin/env bash
# Integration: submit_mini_quiz server grading + answer key isolation.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
DB_DIR="$ROOT/scripts/database"
PG_URL="${SPIRAL_LMS_PG_URL:-}"
CONTAINER_NAME="spiral-lms-mini-quiz-pg-$$"

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
    echo "docker not available; skipping spiral LMS mini-quiz integration tests"
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
QUESTION_ID='aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'

run_psql -f - <<'SQL'
CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE SCHEMA IF NOT EXISTS auth;
CREATE TABLE IF NOT EXISTS auth.users (id uuid PRIMARY KEY);
CREATE OR REPLACE FUNCTION auth.uid()
RETURNS uuid LANGUAGE sql STABLE AS $$
  SELECT nullif(current_setting('request.jwt.claim.sub', true), '')::uuid;
$$;
DO $$ BEGIN
  CREATE ROLE anon;
  CREATE ROLE authenticated;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
INSERT INTO auth.users (id) VALUES
  ('11111111-1111-1111-1111-111111111111'::uuid)
ON CONFLICT DO NOTHING;
SQL

run_psql_file "$DB_DIR/20261012_spiral_lms_schema_rls.sql"
run_psql_file "$DB_DIR/20261012_spiral_lms_record_attempt.sql"
run_psql_file "$DB_DIR/20261012_spiral_lms_mdx_mini_quiz.sql"
run_psql_file "$DB_DIR/20261012_spiral_lms_mdx_mini_quiz_dev_seed.sql"

run_psql -f - <<'SQL'
GRANT USAGE ON SCHEMA public TO authenticated, anon;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO authenticated, anon;
SQL

echo "== record_attempt rejects client mini_quiz score =="
set +e
reject_out="$(run_psql -tA 2>&1 <<SQL
SET request.jwt.claim.sub = '${TEST_USER}';
SELECT public.record_attempt(
  'SPIRAL-DEV-MINI', 'mini_quiz',
  'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee'::uuid,
  NULL, 100
);
SQL
)"
set -e
if echo "$reject_out" | grep -q mini_quiz_use_submit_mini_quiz; then
  echo "OK: record_attempt mini_quiz rejected"
else
  echo "FAIL: expected mini_quiz_use_submit_mini_quiz"
  echo "$reject_out"
  exit 1
fi

echo "== anon/authenticated cannot read answer keys =="
set +e
anon_keys="$(run_psql -tA 2>&1 <<'SQL'
SET ROLE anon;
SELECT count(*)::text FROM private.node_mini_quiz_answer_keys;
SQL
)"
set -e
if echo "$anon_keys" | grep -qiE 'permission denied|must be owner|insufficient privilege'; then
  echo "OK: anon blocked from answer keys"
else
  echo "FAIL: anon should not read private.node_mini_quiz_answer_keys"
  echo "$anon_keys"
  exit 1
fi

echo "== stems visible without correct flags =="
stem="$(run_psql -tA <<SQL
SET request.jwt.claim.sub = '${TEST_USER}';
SELECT options::text
FROM public.node_mini_quiz_questions
WHERE node_id = 'SPIRAL-DEV-MINI';
SQL
)"
stem="$(echo "$stem" | tail -n 1 | tr -d '\r')"
if echo "$stem" | grep -q isCorrect; then
  echo "FAIL: options leak isCorrect"
  exit 1
fi
if ! echo "$stem" | grep -q '"id": "a"'; then
  echo "FAIL: expected option id in stems"
  echo "$stem"
  exit 1
fi
echo "OK: stems are option id/text only"

echo "== wrong answer scores 0 and fails =="
wrong="$(run_psql -tA <<SQL
SET request.jwt.claim.sub = '${TEST_USER}';
SELECT (public.submit_mini_quiz(
  'SPIRAL-DEV-MINI',
  '11111111-1111-1111-1111-111111111111'::uuid,
  jsonb_build_array(
    jsonb_build_object(
      'question_id', '${QUESTION_ID}',
      'selected_option_ids', jsonb_build_array('b')
    )
  )
)->>'passed');
SQL
)"
wrong="$(echo "$wrong" | tail -n 1 | tr -d '\r')"
if [[ "$wrong" != "false" ]]; then
  echo "FAIL: wrong answer should not pass, got ${wrong}"
  exit 1
fi
echo "OK: wrong answer failed"

echo "== correct answer scores 100 and passes =="
right="$(run_psql -tA <<SQL
SET request.jwt.claim.sub = '${TEST_USER}';
SELECT (public.submit_mini_quiz(
  'SPIRAL-DEV-MINI',
  '22222222-2222-2222-2222-222222222222'::uuid,
  jsonb_build_array(
    jsonb_build_object(
      'question_id', '${QUESTION_ID}',
      'selected_option_ids', jsonb_build_array('a')
    )
  )
)->>'passed');
SQL
)"
right="$(echo "$right" | tail -n 1 | tr -d '\r')"
if [[ "$right" != "true" ]]; then
  echo "FAIL: correct answer should pass, got ${right}"
  exit 1
fi
echo "OK: correct answer passed"

echo "spiral_lms_mini_quiz integration: all checks passed"
