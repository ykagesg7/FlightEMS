-- 航空法規 Mission 1-1: 技能証明制度 記事の登録
-- 2025-08-15 作成

-- ===============================
-- 1. learning_contentsテーブルに記事を登録
-- ===============================

INSERT INTO learning_contents (
	id,
	title,
	category,
	description,
	order_index,
	parent_id,
	content_type,
	is_published,
	created_at,
	updated_at
) VALUES (
	'3.1.2_AviationLegal1',
	'【CPL航空法 Mission 1-1】お前の免許、どのレベル？ トム兄ぃと学ぶ技能証明',
	'CPL学科',
	'事業用操縦士技能証明の取得要件と有効期間を徹底解説。自家用操縦士との違い、定期運送用操縦士への道筋、技能証明の更新手続きを理解し、パイロットライセンスの階層構造を習得。',
	312,
	null,
	'article',
	true,
	now(),
	now()
) ON CONFLICT (id) DO UPDATE SET
	title = EXCLUDED.title,
	category = EXCLUDED.category,
	description = EXCLUDED.description,
	order_index = EXCLUDED.order_index,
	content_type = EXCLUDED.content_type,
	is_published = EXCLUDED.is_published,
	updated_at = now();

-- ===============================
-- 2. learning_test_mappingテーブルにマッピングを登録
-- ===============================

INSERT INTO learning_test_mapping (
	learning_content_id,
	content_title,
	content_category,
	topic_category,
	subject_area,
	relationship_type,
	weight_score,
	difficulty_level,
	estimated_study_time,
	mapping_source,
	confidence_score,
	verification_status
) VALUES (
	'3.1.2_AviationLegal1',
	'【CPL航空法 Mission 1-1】お前の免許、どのレベル？ トム兄ぃと学ぶ技能証明',
	'CPL学科',
	'航空法規',
	'技能証明制度',
	'direct',
	1.0,
	3,
	40,
	'expert_reviewed',
	0.95,
	'verified'
) ON CONFLICT (learning_content_id, topic_category, relationship_type) DO UPDATE SET
	content_title = EXCLUDED.content_title,
	content_category = EXCLUDED.content_category,
	subject_area = EXCLUDED.subject_area,
	weight_score = EXCLUDED.weight_score,
	difficulty_level = EXCLUDED.difficulty_level,
	estimated_study_time = EXCLUDED.estimated_study_time,
	mapping_source = EXCLUDED.mapping_source,
	confidence_score = EXCLUDED.confidence_score,
	verification_status = EXCLUDED.verification_status,
	updated_at = now();

-- サブカテゴリ設定（タグ相当）
UPDATE learning_contents SET sub_category = '航空法規' WHERE id = '3.1.2_AviationLegal1';


