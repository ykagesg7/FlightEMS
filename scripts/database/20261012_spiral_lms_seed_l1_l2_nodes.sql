-- Spiral matrix LMS: seed L1/L2 nodes (19) + node_contents + quadrant prerequisite chains.
-- Idempotent re-run: overwrites L1/L2 node title / is_published / opens_at and replaces
-- their node_prerequisites + node_contents rows (regex ^L[12]-Q[1-4]-).
-- Slugs verified against src/content MDX meta.slug; withdrawn articles excluded.
-- Prerequisite edges connect published nodes only (gaps skipped).
-- record_attempt (PR ②) must ignore prerequisites whose node is not published.
-- Same MDX slug may appear on multiple nodes (node_contents is many-to-many).
-- Article completion is stored per slug (PR ②); reading once satisfies required
-- content on every node that links that slug.

BEGIN;

INSERT INTO public.nodes (id, title, quadrant, z_level, sort_order, is_published, opens_at)
VALUES
  ('L1-Q1-1', '揚力・推力', 1, 1, 1, true, NULL),
  ('L1-Q1-2', '操縦桿と動翼の関係', 1, 1, 2, true, NULL),
  ('L1-Q2-1', '空港の構造・滑走路', 2, 1, 1, true, NULL),
  ('L1-Q2-2', '管制塔の役割', 2, 1, 2, true, NULL),
  ('L1-Q3-1', 'パイロットへの道', 3, 1, 1, false, NULL),
  ('L1-Q3-2', '身体検査基準', 3, 1, 2, true, NULL),
  ('L1-Q3-3', 'G とは', 3, 1, 3, true, NULL),
  ('L1-Q4-1', '道真公のブリーフィング', 4, 1, 1, false, NULL),
  ('L1-Q4-2', 'アビエーターの心構え', 4, 1, 2, false, NULL),
  ('L2-Q1-1', 'CP（場周経路）', 1, 2, 1, true, NULL),
  ('L2-Q1-2', '離着陸', 1, 2, 2, true, NULL),
  ('L2-Q1-3', 'ストールリカバリー', 1, 2, 3, true, NULL),
  ('L2-Q2-1', '目視地標の把握', 2, 2, 1, true, NULL),
  ('L2-Q2-2', 'See & Avoid', 2, 2, 2, true, NULL),
  ('L2-Q3-1', 'VFR 気象判定', 3, 2, 1, true, NULL),
  ('L2-Q3-2', '航空力学の基礎', 3, 2, 2, true, NULL),
  ('L2-Q3-3', '基本航空法', 3, 2, 3, true, NULL),
  ('L2-Q4-1', '「自分で飛ばす」責任感', 4, 2, 1, true, NULL),
  ('L2-Q4-2', '基本手順の徹底', 4, 2, 2, true, NULL)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  quadrant = EXCLUDED.quadrant,
  z_level = EXCLUDED.z_level,
  sort_order = EXCLUDED.sort_order,
  is_published = EXCLUDED.is_published,
  opens_at = EXCLUDED.opens_at,
  updated_at = now();

DELETE FROM public.node_prerequisites
WHERE node_id IN (
  SELECT id FROM public.nodes WHERE id ~ '^L[12]-Q[1-4]-[0-9]+$'
);

INSERT INTO public.node_prerequisites (node_id, prerequisite_node_id)
VALUES
  -- Q1 (all published in chain)
  ('L1-Q1-2', 'L1-Q1-1'),
  ('L2-Q1-1', 'L1-Q1-2'),
  ('L2-Q1-2', 'L2-Q1-1'),
  ('L2-Q1-3', 'L2-Q1-2'),
  -- Q2
  ('L1-Q2-2', 'L1-Q2-1'),
  ('L2-Q2-1', 'L1-Q2-2'),
  ('L2-Q2-2', 'L2-Q2-1'),
  -- Q3 (skip unpublished L1-Q3-1)
  ('L1-Q3-3', 'L1-Q3-2'),
  ('L2-Q3-1', 'L1-Q3-3'),
  ('L2-Q3-2', 'L2-Q3-1'),
  ('L2-Q3-3', 'L2-Q3-2'),
  -- Q4 (no published L1; L2 chain only — L1-Q4-1 / L1-Q4-2 are gaps)
  ('L2-Q4-2', 'L2-Q4-1')
ON CONFLICT DO NOTHING;

DELETE FROM public.node_contents
WHERE node_id IN (
  SELECT id FROM public.nodes WHERE id ~ '^L[12]-Q[1-4]-[0-9]+$'
);

INSERT INTO public.node_contents (node_id, content_slug, content_type, is_required, sort_order)
VALUES
  ('L1-Q1-1', 'ppl-1-1-3-bernoulli-principle', 'lesson', true, 1),
  ('L1-Q1-1', 'ppl-1-1-8-propeller-basics', 'lesson', false, 2),
  ('L1-Q1-2', 'ppl-1-1-11-control-surfaces', 'lesson', true, 1),
  ('L1-Q1-2', 'ppl-1-1-5-axes-stability', 'lesson', false, 2),
  ('L1-Q2-1', 'ppl-5-4-6-aerodrome-ground-operations-basics', 'lesson', true, 1),
  ('L1-Q2-2', 'ppl-4-1-1-air-traffic-services-overview', 'lesson', true, 1),
  ('L1-Q2-2', 'ppl-4-2-3-aerodrome-control-basics', 'lesson', false, 2),
  ('L1-Q3-1', 'l1-q3-1-path-to-pilot', 'lesson', true, 1),
  ('L1-Q4-1', 'l1-q4-1-michizane-briefing', 'lesson', true, 1),
  ('L1-Q3-2', 'ppl-5-3-2-medical-certificate-basics', 'lesson', true, 1),
  ('L1-Q3-3', 'ppl-1-1-7-vn-diagram', 'lesson', true, 1),
  ('L2-Q1-1', 'cp-3-2-pattern-ats', 'lesson', true, 1),
  ('L2-Q1-1', 'cp-1-1-area-and-purpose', 'lesson', false, 2),
  ('L2-Q1-1', 'cp-1-2-energy', 'lesson', false, 3),
  ('L2-Q1-1', 'cp-1-3-controls-g-pio', 'lesson', false, 4),
  ('L2-Q1-2', 'ppl-1-1-10-takeoff-landing-performance', 'lesson', true, 1),
  ('L2-Q1-3', 'ppl-1-1-6-stall-spin', 'lesson', true, 1),
  ('L2-Q1-3', 'cp-2-1-deep-stall', 'lesson', true, 2),
  ('L2-Q1-3', 'cp-2-2-accelerated-stall', 'lesson', true, 3),
  ('L2-Q2-1', 'ppl-3-2-1-pilotage-and-position-fix', 'lesson', true, 1),
  ('L2-Q2-1', 'ppl-3-1-3-aeronautical-charts-basics', 'lesson', false, 2),
  ('L2-Q2-2', 'ppl-3-3-1-vfr-operations-and-airspace', 'lesson', true, 1),
  ('L2-Q2-2', 'ppl-3-3-2-spatial-disorientation-basics', 'lesson', false, 2),
  ('L2-Q3-1', 'ppl-2-3-2-metar-taf-and-weather-reports', 'lesson', true, 1),
  ('L2-Q3-2', 'ppl-1-1-1-temperature-basics', 'lesson', true, 1),
  ('L2-Q3-2', 'ppl-1-1-2-airspeed-basics', 'lesson', true, 2),
  ('L2-Q3-2', 'ppl-1-1-3-bernoulli-principle', 'lesson', true, 3),
  ('L2-Q3-2', 'ppl-1-1-4-drag-basics', 'lesson', true, 4),
  ('L2-Q3-2', 'ppl-1-1-5-axes-stability', 'lesson', true, 5),
  ('L2-Q3-2', 'ppl-1-1-6-stall-spin', 'lesson', true, 6),
  ('L2-Q3-2', 'ppl-1-1-7-vn-diagram', 'lesson', true, 7),
  ('L2-Q3-2', 'ppl-1-1-8-propeller-basics', 'lesson', true, 8),
  ('L2-Q3-2', 'ppl-1-1-9-flight-performance', 'lesson', true, 9),
  ('L2-Q3-2', 'ppl-1-1-10-takeoff-landing-performance', 'lesson', true, 10),
  ('L2-Q3-2', 'ppl-1-1-11-control-surfaces', 'lesson', true, 11),
  -- PPL-5 Master Subject 5: 13 lessons (ppl-5-4-6 is linked under L1-Q2-1)
  ('L2-Q3-3', 'ppl-5-1-1-aviation-law-definitions', 'lesson', true, 1),
  ('L2-Q3-3', 'ppl-5-1-2-chicago-convention-overview', 'lesson', true, 2),
  ('L2-Q3-3', 'ppl-5-2-1-aircraft-nationality-and-registration', 'lesson', true, 3),
  ('L2-Q3-3', 'ppl-5-2-2-airworthiness-and-maintenance-overview', 'lesson', true, 4),
  ('L2-Q3-3', 'ppl-5-3-1-pilot-certificate-basics', 'lesson', true, 5),
  ('L2-Q3-3', 'ppl-5-3-2-medical-certificate-basics', 'lesson', true, 6),
  ('L2-Q3-3', 'ppl-5-3-3-aviation-english-requirements', 'lesson', true, 7),
  ('L2-Q3-3', 'ppl-5-4-1-airspace-and-facilities-overview', 'lesson', true, 8),
  ('L2-Q3-3', 'ppl-5-4-2-captain-authority-and-preflight', 'lesson', true, 9),
  ('L2-Q3-3', 'ppl-5-4-3-recurrent-proficiency-overview', 'lesson', true, 10),
  ('L2-Q3-3', 'ppl-5-4-4-safety-endangering-prohibitions', 'lesson', true, 11),
  ('L2-Q3-3', 'ppl-5-4-5-accident-incident-reporting-basics', 'lesson', true, 12),
  ('L2-Q3-3', 'ppl-5-4-7-ifr-minimum-altitude-intro-for-ppl', 'lesson', true, 13),
  ('L2-Q4-1', 'ppl-5-4-2-captain-authority-and-preflight', 'lesson', true, 1),
  ('L2-Q4-2', '/articles/chores-are-the-job', 'article', true, 1),
  ('L2-Q4-2', '/articles/speak-before-asked', 'article', true, 2),
  ('L2-Q4-2', '/articles/answer-first-word', 'article', true, 3),
  ('L2-Q4-2', '/articles/say-expectations', 'article', true, 4),
  ('L2-Q4-2', '/articles/just-enough-is-not-enough', 'article', true, 5),
  ('L2-Q4-2', '/articles/turn-feedback-into-action', 'article', true, 6),
  ('L2-Q4-2', '/articles/put-a-frame-on-failure', 'article', true, 7),
  ('L2-Q4-2', '/articles/take-the-gain-from-feedback', 'article', true, 8),
  ('L2-Q4-2', '/articles/yes-has-a-short-shelf-life', 'article', true, 9),
  ('L2-Q4-2', '/articles/thinking-stamina', 'article', true, 10)
ON CONFLICT (node_id, content_slug) DO UPDATE SET
  content_type = EXCLUDED.content_type,
  is_required = EXCLUDED.is_required,
  sort_order = EXCLUDED.sort_order;

COMMIT;
