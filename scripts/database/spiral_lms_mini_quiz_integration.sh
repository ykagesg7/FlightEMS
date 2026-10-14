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
run_psql_file "$DB_DIR/20261014_learning_contents_spiral_l1_q3_q4.sql"

slug_map_sql="$DB_DIR/20261012_spiral_lms_content_slug_map.sql"
lc_values="$(
  grep -E "^\s+\('" "$slug_map_sql" \
    | sed -E "s/^[^']*'[^']*', '([^']+)'.*/\1/" \
    | sort -u \
    | awk '{printf "('\''%s'\'','\''%s'\'','\''PPL'\'',true),", $1, $1}' \
    | sed '$ s/,$//'
)"
run_psql -f - <<SQL
CREATE TABLE IF NOT EXISTS public.learning_contents (
  id text PRIMARY KEY,
  title text NOT NULL,
  category text NOT NULL,
  is_published boolean NOT NULL DEFAULT true
);
INSERT INTO public.learning_contents (id, title, category, is_published)
VALUES ${lc_values}
ON CONFLICT (id) DO UPDATE SET is_published = true;
SQL

run_psql_file "$slug_map_sql"
run_psql_file "$DB_DIR/20261012_spiral_lms_record_attempt.sql"
run_psql_file "$DB_DIR/20261012_spiral_lms_mdx_mini_quiz.sql"
run_psql_file "$DB_DIR/20261012_spiral_lms_seed_l1_l2_nodes.sql"
run_psql_file "$DB_DIR/20261013_spiral_lms_mini_quiz_version_pass.sql"
run_psql_file "$DB_DIR/20261014_spiral_lms_seed_quiz_l1_l2.sql"
run_psql_file "$DB_DIR/20261013_spiral_lms_fk_support_indexes.sql"
run_psql_file "$DB_DIR/20261014_spiral_lms_maintenance_prerequisites.sql"
run_psql_file "$DB_DIR/dev/20261012_spiral_lms_mdx_mini_quiz_dev_seed.sql"

run_psql -f - <<'SQL'
GRANT USAGE ON SCHEMA public TO authenticated, anon;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO authenticated;
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

echo "== stems visible without correct flags (authenticated) =="
stem="$(run_psql -tA <<SQL
SET ROLE authenticated;
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

echo "== wrong answer scores 0, fails, and hides per-question results =="
wrong_json="$(run_psql -tA <<SQL
SET request.jwt.claim.sub = '${TEST_USER}';
SELECT public.submit_mini_quiz(
  'SPIRAL-DEV-MINI',
  '11111111-1111-1111-1111-111111111111'::uuid,
  jsonb_build_array(
    jsonb_build_object(
      'question_id', '${QUESTION_ID}',
      'selected_option_ids', jsonb_build_array('b')
    )
  )
)::text;
SQL
)"
wrong_json="$(echo "$wrong_json" | tail -n 1 | tr -d '\r')"
if ! echo "$wrong_json" | grep -q '"passed": false'; then
  echo "FAIL: wrong answer should not pass"
  echo "$wrong_json"
  exit 1
fi
if ! echo "$wrong_json" | grep -q '"results": null'; then
  echo "FAIL: wrong answer must not leak per-question results"
  echo "$wrong_json"
  exit 1
fi
if echo "$wrong_json" | grep -q '"score"'; then
  echo "FAIL: wrong answer must not leak score"
  echo "$wrong_json"
  exit 1
fi
echo "OK: wrong answer failed without score or per-question results"

echo "== correct answer scores 100, passes, and returns results =="
right_json="$(run_psql -tA <<SQL
SET request.jwt.claim.sub = '${TEST_USER}';
SELECT public.submit_mini_quiz(
  'SPIRAL-DEV-MINI',
  '22222222-2222-2222-2222-222222222222'::uuid,
  jsonb_build_array(
    jsonb_build_object(
      'question_id', '${QUESTION_ID}',
      'selected_option_ids', jsonb_build_array('a')
    )
  )
)::text;
SQL
)"
right_json="$(echo "$right_json" | tail -n 1 | tr -d '\r')"
if ! echo "$right_json" | grep -q '"passed": true'; then
  echo "FAIL: correct answer should pass"
  echo "$right_json"
  exit 1
fi
if ! echo "$right_json" | grep -q '"correct": true'; then
  echo "FAIL: passed attempt should include per-question results"
  echo "$right_json"
  exit 1
fi
echo "OK: correct answer passed with results"

echo "== node reaches MASTERED after mini-quiz pass =="
mastered="$(run_psql -tA <<SQL
SET request.jwt.claim.sub = '${TEST_USER}';
SELECT status FROM public.user_progress
WHERE user_id = '${TEST_USER}'::uuid AND node_id = 'SPIRAL-DEV-MINI';
SQL
)"
mastered="$(echo "$mastered" | tail -n 1 | tr -d '\r')"
if [[ "$mastered" != "MASTERED" ]]; then
  echo "FAIL: expected MASTERED, got ${mastered}"
  exit 1
fi
echo "OK: SPIRAL-DEV-MINI is MASTERED"

echo "== idempotent replay does not consume rate limit =="
for i in $(seq 1 6); do
  run_psql -tA >/dev/null <<SQL
SET request.jwt.claim.sub = '${TEST_USER}';
SELECT public.submit_mini_quiz(
  'SPIRAL-DEV-MINI',
  '22222222-2222-2222-2222-222222222222'::uuid,
  jsonb_build_array(
    jsonb_build_object(
      'question_id', '${QUESTION_ID}',
      'selected_option_ids', jsonb_build_array('a')
    )
  )
);
SQL
done
echo "OK: idempotent replays accepted"

echo "== rate limit after five new submissions in one hour =="
for n in 3 4 5; do
  run_psql -tA >/dev/null <<SQL
SET request.jwt.claim.sub = '${TEST_USER}';
SELECT public.submit_mini_quiz(
  'SPIRAL-DEV-MINI',
  ('44444444-4444-4444-4444-00000000000${n}')::uuid,
  jsonb_build_array(
    jsonb_build_object(
      'question_id', '${QUESTION_ID}',
      'selected_option_ids', jsonb_build_array('b')
    )
  )
);
SQL
done
set +e
rate_out="$(run_psql -tA 2>&1 <<SQL
SET request.jwt.claim.sub = '${TEST_USER}';
SELECT public.submit_mini_quiz(
  'SPIRAL-DEV-MINI',
  '55555555-5555-5555-5555-555555555555'::uuid,
  jsonb_build_array(
    jsonb_build_object(
      'question_id', '${QUESTION_ID}',
      'selected_option_ids', jsonb_build_array('b')
    )
  )
);
SQL
)"
set -e
if ! echo "$rate_out" | grep -q rate_limited; then
  echo "FAIL: expected rate_limited after 5 submissions/hour"
  echo "$rate_out"
  exit 1
fi
echo "OK: rate_limited enforced"

CONCURRENT_USER='33333333-3333-3333-3333-333333333333'
echo "== concurrent submissions cannot exceed rate limit =="
run_psql -tA >/dev/null <<SQL
INSERT INTO auth.users (id) VALUES ('${CONCURRENT_USER}'::uuid) ON CONFLICT DO NOTHING;
SQL

tmpdir="$(mktemp -d)"

submit_wrong() {
  local cid="$1"
  local out="$2"
  run_psql -tA >"$out" 2>&1 <<SQL || true
SET request.jwt.claim.sub = '${CONCURRENT_USER}';
SELECT public.submit_mini_quiz(
  'SPIRAL-DEV-MINI',
  '${cid}'::uuid,
  jsonb_build_array(
    jsonb_build_object(
      'question_id', '${QUESTION_ID}',
      'selected_option_ids', jsonb_build_array('b')
    )
  )
)::text;
SQL
}

for i in $(seq 1 6); do
  cid="$(printf '66666666-6666-6666-6666-%012d' "$i")"
  submit_wrong "$cid" "${tmpdir}/conc_${i}.txt" &
done
wait

success_count=0
rate_limited_count=0
for i in $(seq 1 6); do
  body="$(cat "${tmpdir}/conc_${i}.txt")"
  if echo "$body" | grep -q rate_limited; then
    rate_limited_count=$((rate_limited_count + 1))
  elif echo "$body" | grep -q '"passed": false'; then
    success_count=$((success_count + 1))
  else
    echo "FAIL: unexpected concurrent submit outcome"
    echo "$body"
    exit 1
  fi
done
if [[ "$success_count" -ne 5 || "$rate_limited_count" -ne 1 ]]; then
  echo "FAIL: expected 5 accepted + 1 rate_limited, got success=${success_count} rate_limited=${rate_limited_count}"
  exit 1
fi
echo "OK: concurrent burst capped at 5/hour per user-node"
rm -rf "$tmpdir"

echo "spiral_lms_mini_quiz integration: all checks passed"
