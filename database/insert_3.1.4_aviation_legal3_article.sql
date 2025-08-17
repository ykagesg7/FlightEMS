-- 航空法規 Mission 2-1: 耐空証明制度 記事の登録
-- 2025-08-15 作成

INSERT INTO learning_contents (
	id, title, category, description, order_index, parent_id, content_type, is_published, created_at, updated_at
) VALUES (
	'3.1.4_AviationLegal3',
	'【CPL航空法 Mission 2-1】Is Your Aircraft Airworthy? - "愛機"の健康診断、耐空証明の真実',
	'CPL学科',
	'航空機の耐空証明制度を徹底解説。耐空証明の種類と有効期間、定期点検の義務、耐空証明の更新手続き、航空機の安全性確保の仕組みを理解し、機体管理の重要性を習得。',
	314,
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
	'3.1.4_AviationLegal3',
	'【CPL航空法 Mission 2-1】Is Your Aircraft Airworthy? - "愛機"の健康診断、耐空証明の真実',
	'CPL学科',
	'航空法規',
	'耐空証明制度',
	'direct',
	1.0,
	3,
	45,
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

UPDATE learning_contents SET sub_category = '航空法規' WHERE id = '3.1.4_AviationLegal3';


