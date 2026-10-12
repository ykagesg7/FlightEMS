-- Spiral matrix LMS: seed L1/L2 nodes (19) + node_contents + quadrant prerequisite chains.
-- Slugs verified against src/content MDX meta.slug at repo commit time.

BEGIN;

INSERT INTO public.nodes (id, title, quadrant, z_level, sort_order, is_published)
VALUES
  ('L1-Q1-1', '揚力・推力', 1, 1, 1, true),
  ('L1-Q1-2', '操縦桿と動翼の関係', 1, 1, 2, true),
  ('L1-Q2-1', '空港の構造・滑走路', 2, 1, 1, true),
  ('L1-Q2-2', '管制塔の役割', 2, 1, 2, true),
  ('L1-Q3-1', 'パイロットへの道', 3, 1, 1, false),
  ('L1-Q3-2', '身体検査基準', 3, 1, 2, true),
  ('L1-Q3-3', 'G とは', 3, 1, 3, true),
  ('L1-Q4-1', '道真公のブリーフィング', 4, 1, 1, false),
  ('L1-Q4-2', 'アビエーターの心構え', 4, 1, 2, true),
  ('L2-Q1-1', 'CP（場周経路）', 1, 2, 1, true),
  ('L2-Q1-2', '離着陸', 1, 2, 2, true),
  ('L2-Q1-3', 'ストールリカバリー', 1, 2, 3, true),
  ('L2-Q2-1', '目視地標の把握', 2, 2, 1, true),
  ('L2-Q2-2', 'See & Avoid', 2, 2, 2, true),
  ('L2-Q3-1', 'VFR 気象判定', 3, 2, 1, true),
  ('L2-Q3-2', '航空力学の基礎', 3, 2, 2, true),
  ('L2-Q3-3', '基本航空法', 3, 2, 3, true),
  ('L2-Q4-1', '「自分で飛ばす」責任感', 4, 2, 1, true),
  ('L2-Q4-2', '基本手順の徹底', 4, 2, 2, true)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  quadrant = EXCLUDED.quadrant,
  z_level = EXCLUDED.z_level,
  sort_order = EXCLUDED.sort_order,
  is_published = EXCLUDED.is_published,
  updated_at = now();

-- Per-quadrant chain: sequential within level, then L2 entry depends on last L1 in quadrant.
DELETE FROM public.node_prerequisites
WHERE node_id IN (
  SELECT id FROM public.nodes WHERE id ~ '^L[12]-Q[1-4]-[0-9]+$'
);

INSERT INTO public.node_prerequisites (node_id, prerequisite_node_id)
VALUES
  ('L1-Q1-2', 'L1-Q1-1'),
  ('L2-Q1-1', 'L1-Q1-2'),
  ('L2-Q1-2', 'L2-Q1-1'),
  ('L2-Q1-3', 'L2-Q1-2'),
  ('L1-Q2-2', 'L1-Q2-1'),
  ('L2-Q2-1', 'L1-Q2-2'),
  ('L2-Q2-2', 'L2-Q2-1'),
  ('L1-Q3-2', 'L1-Q3-1'),
  ('L1-Q3-3', 'L1-Q3-2'),
  ('L2-Q3-1', 'L1-Q3-3'),
  ('L2-Q3-2', 'L2-Q3-1'),
  ('L2-Q3-3', 'L2-Q3-2'),
  ('L1-Q4-2', 'L1-Q4-1'),
  ('L2-Q4-1', 'L1-Q4-2'),
  ('L2-Q4-2', 'L2-Q4-1')
ON CONFLICT DO NOTHING;

-- Replace contents for seeded nodes (idempotent).
DELETE FROM public.node_contents
WHERE node_id IN (
  SELECT id FROM public.nodes WHERE id ~ '^L[12]-Q[1-4]-[0-9]+$'
);

INSERT INTO public.node_contents (node_id, content_slug, content_type, is_required, sort_order)
VALUES
  -- L1-Q1-1 (部分)
  ('L1-Q1-1', 'ppl-1-1-3-bernoulli-principle', 'lesson', true, 1),
  ('L1-Q1-1', 'ppl-1-1-8-propeller-basics', 'lesson', false, 2),
  -- L1-Q1-2 (部分)
  ('L1-Q1-2', 'ppl-1-1-11-control-surfaces', 'lesson', true, 1),
  ('L1-Q1-2', 'ppl-1-1-5-axes-stability', 'lesson', false, 2),
  ('L1-Q1-2', 'cp-1-3-controls-g-pio', 'lesson', false, 3),
  -- L1-Q2-1 (参考)
  ('L1-Q2-1', 'ppl-5-4-6-aerodrome-ground-operations-basics', 'lesson', false, 1),
  ('L1-Q2-1', '3-1-8-airport-operations', 'lesson', false, 2),
  -- L1-Q2-2 (部分)
  ('L1-Q2-2', 'ppl-4-1-1-air-traffic-services-overview', 'lesson', true, 1),
  ('L1-Q2-2', 'ppl-4-2-3-aerodrome-control-basics', 'lesson', false, 2),
  -- L1-Q3-1: gap — no rows
  -- L1-Q3-2 (完全)
  ('L1-Q3-2', 'ppl-5-3-2-medical-certificate-basics', 'lesson', true, 1),
  -- L1-Q3-3 (部分)
  ('L1-Q3-3', 'cp-1-3-controls-g-pio', 'lesson', true, 1),
  ('L1-Q3-3', 'ppl-1-1-7-vn-diagram', 'lesson', false, 2),
  -- L1-Q4-1: gap — no rows
  -- L1-Q4-2 (部分): 1.3 シリーズ 6 本
  ('L1-Q4-2', '/articles/single-seat-mentality', 'article', true, 1),
  ('L1-Q4-2', '/articles/wingman-mentality', 'article', true, 2),
  ('L1-Q4-2', '/articles/debriefing-mentality', 'article', true, 3),
  ('L1-Q4-2', '/articles/shuraba-mentality', 'article', true, 4),
  ('L1-Q4-2', '/articles/results-are-everything', 'article', true, 5),
  ('L1-Q4-2', '/articles/blessing-and-admonition', 'article', true, 6),
  -- L2-Q1-1 (部分)
  ('L2-Q1-1', 'cp-3-2-pattern-ats', 'lesson', true, 1),
  ('L2-Q1-1', 'cp-1-1-area-and-purpose', 'lesson', false, 2),
  ('L2-Q1-1', 'cp-1-2-energy', 'lesson', false, 3),
  ('L2-Q1-1', 'cp-1-3-controls-g-pio', 'lesson', false, 4),
  -- L2-Q1-2 (参考)
  ('L2-Q1-2', 'ppl-1-1-10-takeoff-landing-performance', 'lesson', false, 1),
  -- L2-Q1-3 (完全 + 部分参考)
  ('L2-Q1-3', 'ppl-1-1-6-stall-spin', 'lesson', true, 1),
  ('L2-Q1-3', 'cp-2-1-deep-stall', 'lesson', false, 2),
  ('L2-Q1-3', 'cp-2-2-accelerated-stall', 'lesson', false, 3),
  -- L2-Q2-1 (完全)
  ('L2-Q2-1', 'ppl-3-2-1-pilotage-and-position-fix', 'lesson', true, 1),
  ('L2-Q2-1', 'ppl-3-1-3-aeronautical-charts-basics', 'lesson', false, 2),
  -- L2-Q2-2 (部分)
  ('L2-Q2-2', 'ppl-3-3-1-vfr-operations-and-airspace', 'lesson', true, 1),
  ('L2-Q2-2', 'ppl-3-3-2-spatial-disorientation-basics', 'lesson', false, 2),
  -- L2-Q3-1 (部分)
  ('L2-Q3-1', 'ppl-2-3-2-metar-taf-and-weather-reports', 'lesson', true, 1),
  ('L2-Q3-1', '3-1-7-flight-rules', 'lesson', false, 2),
  -- L2-Q3-2 (完全): PPL-1-1 全 11 本
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
  -- L2-Q3-3 (完全): PPL-5 全 13 本
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
  -- L2-Q4-1 (部分)
  ('L2-Q4-1', 'ppl-5-4-2-captain-authority-and-preflight', 'lesson', true, 1),
  ('L2-Q4-1', '/articles/unconscious-success', 'article', false, 2),
  -- L2-Q4-2 (部分): 訓練の当たり前 4.x
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
