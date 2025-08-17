-- 航空法規 Mission 1-2: 航空身体検査証明 記事の登録
-- 2025-08-15 作成

INSERT INTO learning_contents (
	id, title, category, description, order_index, parent_id, content_type, is_published, created_at, updated_at
) VALUES (
	'3.1.3_AviationLegal2',
	'【CPL航空法 Mission 1-2】Your Body is Your Ultimate Weapon - 飛べる体か、飛べない体か',
	'CPL学科',
	'航空身体検査証明の要件と基準を徹底解説。第1種・第2種の違い、視力・聴力・循環器系の基準、有効期間と更新手続きを理解し、パイロットの健康管理の重要性を習得。',
	313,
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

INSERT INTO learning_test_mapping (
	learning_content_id, content_title, content_category, topic_category, subject_area, relationship_type, weight_score, difficulty_level, estimated_study_time, mapping_source, confidence_score, verification_status
) VALUES (
	'3.1.3_AviationLegal2',
	'【CPL航空法 Mission 1-2】Your Body is Your Ultimate Weapon - 飛べる体か、飛べない体か',
	'CPL学科',
	'航空法規',
	'航空身体検査証明',
	'direct',
	1.0,
	3,
	35,
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

UPDATE learning_contents SET sub_category = '航空法規' WHERE id = '3.1.3_AviationLegal2';


