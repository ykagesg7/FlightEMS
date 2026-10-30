# `scripts/database/` 索引（Supabase・学習DB）

運用・仕様の**長文正本**: [docs/FOLDER_STRUCTURE.md](../../docs/FOLDER_STRUCTURE.md)（`scripts/`）、CPL メタ／マッピングは [docs/05_Content_Pipeline.md](../../docs/05_Content_Pipeline.md) §5、[docs/Closed_Sprints.md](../../docs/Closed_Sprints.md) §1、[docs/db/CPL_KPI_and_Database_Operations.md](../../docs/db/CPL_KPI_and_Database_Operations.md)。

## このディレクトリの役割

| 種別 | 置き場所 | 備考 |
|------|----------|------|
| いま運用・ドキュメントからリンクされる冪等 SQL | **このディレクトリ直下** | `YYYYMMDD_*.sql`、`insert_*.sql`、ドロップ系など。本番適用済みでも**参照オペマニュアル**になるものはここに残す。 |
| **参照のない旧 SQL** | **置かない（削除）** | `docs/`・Skill・コードからファイル名で辿れないワンオフはリポジトリに残さない。必要なら **`git log --diff-filter=D -- scripts/database/`** や該当コミットのツリーから復元する。 |
| 記事 1件登録用スクリプト | [`register_ppl_article.mjs`](register_ppl_article.mjs)、[`check_learning_contents.mjs`](check_learning_contents.mjs) | Skill [learning-contents-registration](../../.cursor/skills/learning-contents-registration/SKILL.md) と併読。 |
| **`learning_contents` meta UPDATE の読み戻し検証** | [`verify_learning_contents_meta.mjs`](verify_learning_contents_meta.mjs) | 本番適用後の固定手順（下記）。 |

### `learning_contents` meta UPDATE — 読み戻し手順

CP 記事リライトなどで `*_learning_contents_*_meta.sql` を本番に手動適用したあと、カタログ行が SQL と一致していることを確認する。

1. **承認後に UPDATE を実行**（Supabase SQL Editor 等）。リポジトリの `scripts/database/YYYYMMDD_learning_contents_*_meta.sql` を正本とする。
2. **検証スクリプトを実行**（DB への書き込みはしない）:
   - 本番から読む: `node scripts/database/verify_learning_contents_meta.mjs scripts/database/<meta>.sql --run`  
     （`VITE_SUPABASE_URL` と `SUPABASE_SERVICE_ROLE_KEY` または `VITE_SUPABASE_ANON_KEY`）
   - 別環境で SELECT した結果を比較:  
     `node scripts/database/verify_learning_contents_meta.mjs scripts/database/<meta>.sql < result.json`  
     （stdin は 1 行オブジェクト、`[row]`、または `{ "data": [row] }`）
3. 出力が **`PASS`** であることを運用メモ／週次レポート等に記録する。`FAIL` の場合は差分を確認し、UPDATE の再実行または SQL 修正からやり直す。

スクリプトは SQL から `id` と `SET` された `title` / `description` を抽出し、表示用の `SELECT id, title, description, updated_at ...` も出力する。`title` または `description` が SQL に無い項目は比較しない。

**ルート `.gitignore` の `archive/*`**: ローカル用スタジング専用。SQL の「退避用サブディレクトリ」は設けず、不要ファイルは削除して履歴は Git に任せる。

## よく参照される SQL（抜粋）

| 目的 | ファイル |
|------|----------|
| **Articles W33 学び編** `4.2.1`〜`4.2.5` | [`20260808_learning_contents_w33_training_basics.sql`](20260808_learning_contents_w33_training_basics.sql)（ドリップ開始時 `is_published=false` — **2026-08-08 本番 upsert 済**） |
| **CBT 暫定束ね / PPL-2-3-3（2026-08-12 記録）** | **git に SQL ファイルが無い**。05 W33〜W35 と [Closed_Sprints.md](../../docs/Closed_Sprints.md) を正とする。ファイル名を捏造して置かない。 |
| PPL／CPL 出題区分・バッチ適用の起点 | `20260324_add_unified_cpl_applicable_exams.sql`、[db/CPL_KPI_and_Database_Operations.md](../../docs/db/CPL_KPI_and_Database_Operations.md) の手順表 |
| **MLIT 例題集（CPL飛行機）** 2026-06 / 2024-08 | [`20260720_unified_cpl_questions_mlit_sample_202606.sql`](20260720_unified_cpl_questions_mlit_sample_202606.sql)、[`20260720_unified_cpl_questions_mlit_sample_202408_backfill.sql`](20260720_unified_cpl_questions_mlit_sample_202408_backfill.sql)（**2026-07-20 本番適用・ファクトチェック済**。要図除外後 **104問 verified**。手順は `npm run cpl:import`） |
| CPL 工学・気象・航法 `learning_contents` メタ同期 | `20260412_learning_contents_cpl_engineering_*_meta.sql`、`20260424_learning_contents_cpl_meteo_331_3312_meta.sql`、`20260430_learning_contents_cpl_navigation_341_347_meta.sql` |
| **PPL Master Subject 5（航空法規）** MDX メタ同期（4＋3＋7 本） | `20260512_learning_contents_ppl_aviation_law_four.sql`（501〜504）、`20260512_learning_contents_ppl_subject5_505_507.sql`（505〜507）、`20260512_learning_contents_ppl_subject5_508_514.sql`（508〜514）（[05_Content_Pipeline.md](../../docs/05_Content_Pipeline.md) §5、[Closed_Sprints.md](../../docs/Closed_Sprints.md) §1） |
| **PPL Master Subject 2（航空気象）** Phase 1 | `20260624_learning_contents_ppl_subject2_201.sql`〜`20260625_learning_contents_ppl_subject2_203.sql`、`20260627_learning_contents_ppl_subject2_204.sql`（`order_index` 201〜204） |
| **PPL Subject 2 `learning_test_mapping`** | [`20260627_learning_test_mapping_ppl_subject2_201_204.sql`](20260627_learning_test_mapping_ppl_subject2_201_204.sql)（大気の基礎/大気・温度・気圧・水分 → `PPL-2-1-1`〜`4`） |
| **PPL Subject 1 工学 `learning_test_mapping` バックフィル** | [`20260627_backfill_ppl_engineering_test_mapping.sql`](20260627_backfill_ppl_engineering_test_mapping.sql)（**2026-06-28 追補**: `PPL-1-2-1`〜`7` 含め全件本番適用済） |
| **W26 六月末 Tier B + PPL Phase 1 完走** | [`20260630_learning_test_mapping_nav_instruments_w26.sql`](20260630_learning_test_mapping_nav_instruments_w26.sql)（航法計器/無線航法計器 → `3.4.2` — **2026-06-30 本番適用済**） |
| **PPL Subject 2 Phase 1 ブロック B/C（211〜222）** | [`20260630_learning_contents_ppl_subject2_211_222.sql`](20260630_learning_contents_ppl_subject2_211_222.sql)（`PPL-2-2-1`〜`2-3-2` + mapping — **2026-06-30 本番適用済**） |
| **PPL-2-2-1 深文化 meta 同期** | [`20260701_learning_contents_ppl221_meta_rewrite.sql`](20260701_learning_contents_ppl221_meta_rewrite.sql)（title/description — **2026-07-01 本番適用済**） |
| **PPL-2-2-2 深文化 meta 同期** | [`20260702_learning_contents_ppl222_meta_rewrite.sql`](20260702_learning_contents_ppl222_meta_rewrite.sql)（title/description — **2026-07-02 本番適用済**） |
| **PPL-2-2-3 深文化 meta 同期** | [`20260704_learning_contents_ppl223_meta_rewrite.sql`](20260704_learning_contents_ppl223_meta_rewrite.sql)（title/description — **2026-07-04 本番適用済**） |
| **PPL-2-3-1 深文化 meta 同期** | [`20260705_learning_contents_ppl231_meta_rewrite.sql`](20260705_learning_contents_ppl231_meta_rewrite.sql)（title/description — **2026-07-06 本番適用済**） |
| **PPL-2-3-2 深文化 meta 同期** | [`20260706_learning_contents_ppl232_meta_rewrite.sql`](20260706_learning_contents_ppl232_meta_rewrite.sql)（title/description — **2026-07-06 本番適用済**） |
| **W28 Tier A 着氷クラスタ** | [`20260706_learning_test_mapping_icing_prevention_w28.sql`](20260706_learning_test_mapping_icing_prevention_w28.sql)（着氷/着氷の防止 **4 問** → `engineering_basics` — **2026-07-06 本番適用済**） |
| **PPL Subject 3 Phase 1 第1本** | [`20260706_learning_contents_ppl311_earth_coordinates.sql`](20260706_learning_contents_ppl311_earth_coordinates.sql)（`PPL-3-1-1`、`order_index` **301** — **2026-07-07 深文化・本番適用済**） |
| **PPL Subject 3 Phase 1 第1本 mapping** | [`20260707_learning_test_mapping_ppl311_earth_time.sql`](20260707_learning_test_mapping_ppl311_earth_time.sql)（地球15 + 時間6 → `PPL-3-1-1` — **2026-07-07 本番適用済**） |
| **PPL Subject 3 Phase 1 第2本** | [`20260707_learning_contents_ppl312_navigation_elements.sql`](20260707_learning_contents_ppl312_navigation_elements.sql)（`PPL-3-1-2`、`order_index` **302** — **2026-07-07 本番適用済**） |
| **PPL Subject 3 Phase 1 第2本 mapping** | [`20260707_learning_test_mapping_ppl312_nav_elements_altitude.sql`](20260707_learning_test_mapping_ppl312_nav_elements_altitude.sql)（航法要素18 + 高度26 → `PPL-3-1-2` — **2026-07-07 本番適用済**） |
| **PPL Subject 3 Phase 1 第3本** | [`20260707_learning_contents_ppl313_aeronautical_charts.sql`](20260707_learning_contents_ppl313_aeronautical_charts.sql)（`PPL-3-1-3`、`order_index` **303** — **2026-07-07 本番適用済**） |
| **PPL Subject 3 Phase 1 第3本 mapping** | [`20260707_learning_test_mapping_ppl313_charts_projection.sql`](20260707_learning_test_mapping_ppl313_charts_projection.sql)（航空図13 + 投影法17 → `PPL-3-1-3` — **2026-07-07 本番適用済**） |
| **PPL Subject 3 Phase 1 第4本** | [`20260707_learning_contents_ppl314_wind_triangle.sql`](20260707_learning_contents_ppl314_wind_triangle.sql)（`PPL-3-1-4`、`order_index` **304** — **2026-07-07 本番適用済**） |
| **PPL Subject 3 Phase 1 第4本 mapping** | [`20260707_learning_test_mapping_ppl314_wind_triangle.sql`](20260707_learning_test_mapping_ppl314_wind_triangle.sql)（風力三角形15 + 航法計算7 → `PPL-3-1-4` — **2026-07-07 本番適用済**） |
| **PPL Subject 3 Phase 1 第5本（ブロックA完結）** | [`20260708_learning_contents_ppl315_flight_planning.sql`](20260708_learning_contents_ppl315_flight_planning.sql)（`PPL-3-1-5`、`order_index` **305** — **2026-07-08 本番適用済**） |
| **PPL Subject 3 Phase 1 第5本 mapping** | [`20260708_learning_test_mapping_ppl315_flight_planning.sql`](20260708_learning_test_mapping_ppl315_flight_planning.sql)（航法計算7 → `PPL-3-1-5` — **2026-07-08 本番適用済**） |
| **PPL Subject 3 Phase 2 第1本（ブロックB開始）** | [`20260708_learning_contents_ppl321_pilotage_position_fix.sql`](20260708_learning_contents_ppl321_pilotage_position_fix.sql)（`PPL-3-2-1`、`order_index` **306** — **2026-07-08 本番適用済**） |
| **PPL Subject 3 Phase 2 第1本 mapping** | [`20260708_learning_test_mapping_ppl321_position_fix.sql`](20260708_learning_test_mapping_ppl321_position_fix.sql)（機位の確認2 → `PPL-3-2-1` — **2026-07-08 本番適用済**） |
| **PPL Subject 3 Phase 2 第2本** | [`20260708_learning_contents_ppl322_radio_navigation.sql`](20260708_learning_contents_ppl322_radio_navigation.sql)（`PPL-3-2-2`、`order_index` **307** — **2026-07-08 本番適用済**） |
| **PPL Subject 3 Phase 2 第2本 mapping** | [`20260708_learning_test_mapping_ppl322_radio_navigation.sql`](20260708_learning_test_mapping_ppl322_radio_navigation.sql)（航法計器1 → `PPL-3-2-2` — **2026-07-08 本番適用済**） |
| **PPL Subject 3 Phase 1 第8本** | [`20260709_learning_contents_ppl331_vfr_operations.sql`](20260709_learning_contents_ppl331_vfr_operations.sql)（`PPL-3-3-1`、`order_index` **308** — mapping は `PPL-5-4-1` に分担 — **2026-07-09 本番適用済**） |
| **PPL Subject 3 Phase 1 第9本（締め）** | [`20260709_learning_contents_ppl332_spatial_disorientation.sql`](20260709_learning_contents_ppl332_spatial_disorientation.sql)（`PPL-3-3-2`、`order_index` **309** — **2026-07-09 本番適用済**） |
| **PPL Subject 3 Phase 1 第9本 mapping** | [`20260709_learning_test_mapping_ppl332_spatial_disorientation.sql`](20260709_learning_test_mapping_ppl332_spatial_disorientation.sql)（空間識失調22 → `PPL-3-3-2` — **2026-07-09 本番適用済**） |
| **W29 Tier B トランスポンダ** | [`20260710_learning_test_mapping_transponder_w29.sql`](20260710_learning_test_mapping_transponder_w29.sql)（航法計器/レーダー **2 問** → `3.5.3_RadioCommunication` — **2026-07-10 本番適用済**） |
| **W29 Tier B 電波の伝播** | [`20260710_learning_test_mapping_radio_propagation_w29.sql`](20260710_learning_test_mapping_radio_propagation_w29.sql)（電波の伝播 **3 問** → `engineering_basics` — **2026-07-10 本番適用済**） |
| **PPL Subject 4 Phase 1 第1本** | [`20260714_learning_contents_ppl411_air_traffic_services.sql`](20260714_learning_contents_ppl411_air_traffic_services.sql)（`PPL-4-1-1`、`order_index` **401** — **2026-07-14 本番適用済**） |
| **PPL Subject 4 Phase 1 第1本 mapping** | [`20260714_learning_test_mapping_ppl411_air_traffic_services.sql`](20260714_learning_test_mapping_ppl411_air_traffic_services.sql)（航空交通業務52 + 概論23 → `PPL-4-1-1` — **2026-07-14 本番適用済**） |
| **PPL Subject 4 Phase 1 第2本** | [`20260716_learning_contents_ppl412_search_and_rescue.sql`](20260716_learning_contents_ppl412_search_and_rescue.sql)（`PPL-4-1-2`、`order_index` **402** — **2026-07-16 本番適用済**） |
| **PPL Subject 4 Phase 1 第2本 mapping** | [`20260716_learning_test_mapping_ppl412_search_and_rescue.sql`](20260716_learning_test_mapping_ppl412_search_and_rescue.sql)（捜索救難業務22 + 捜索救難信号6 → `PPL-4-1-2` — **2026-07-16 本番適用済**） |
| **PPL Subject 4 Phase 1 第3本** | [`20260718_learning_contents_ppl421_radio_phraseology.sql`](20260718_learning_contents_ppl421_radio_phraseology.sql)（`PPL-4-2-1`、`order_index` **403** — **2026-07-18 本番適用済**） |
| **PPL Subject 4 Phase 1 第3本 mapping** | [`20260718_learning_test_mapping_ppl421_radio_phraseology.sql`](20260718_learning_test_mapping_ppl421_radio_phraseology.sql)（管制業務一般/電話通信 **41** → `PPL-4-2-1` — **2026-07-18 本番適用済**） |
| **PPL Subject 4 Phase 1 第4本** | [`20260718_learning_contents_ppl422_clearance_readback.sql`](20260718_learning_contents_ppl422_clearance_readback.sql)（`PPL-4-2-2`、`order_index` **404** — **2026-07-18 本番適用済**） |
| **PPL Subject 4 Phase 1 第4本 mapping** | [`20260718_learning_test_mapping_ppl422_clearance_readback.sql`](20260718_learning_test_mapping_ppl422_clearance_readback.sql)（管制許可等4 + 通則5 → `PPL-4-2-2` — **2026-07-18 本番適用済**） |
| **PPL Subject 4 Phase 1 第5本** | [`20260718_learning_contents_ppl423_aerodrome_control.sql`](20260718_learning_contents_ppl423_aerodrome_control.sql)（`PPL-4-2-3`、`order_index` **405** — **2026-07-18 本番適用済**） |
| **PPL Subject 4 Phase 1 第5本 mapping** | [`20260718_learning_test_mapping_ppl423_aerodrome_control.sql`](20260718_learning_test_mapping_ppl423_aerodrome_control.sql)（地上滑走及び出発5 + 到着機2 → `PPL-4-2-3` — **2026-07-18 本番適用済**） |
| **PPL Subject 4 Phase 1 第6本** | [`20260722_learning_contents_ppl424_flight_plan_filing.sql`](20260722_learning_contents_ppl424_flight_plan_filing.sql)（`PPL-4-2-4`、`order_index` **406** — **2026-07-22 本番適用済**） |
| **PPL Subject 4 Phase 1 第6本 mapping** | [`20260722_learning_test_mapping_ppl424_flight_plan_filing.sql`](20260722_learning_test_mapping_ppl424_flight_plan_filing.sql)（記入要領18 + 通報4 → `PPL-4-2-4` — **2026-07-22 本番適用済**） |
| **PPL Subject 4 Phase 1 第7本** | [`20260722_learning_contents_ppl431_comm_failure.sql`](20260722_learning_contents_ppl431_comm_failure.sql)（`PPL-4-3-1`、`order_index` **407** — **2026-07-22 本番適用済**） |
| **PPL Subject 4 Phase 1 第7本 mapping** | [`20260722_learning_test_mapping_ppl431_comm_failure.sql`](20260722_learning_test_mapping_ppl431_comm_failure.sql)（可視信号 **15** → `PPL-4-3-1` — **2026-07-22 本番適用済**） |
| **PPL Subject 4 Phase 1 第8本** | [`20260722_learning_contents_ppl432_mayday_pan_pan.sql`](20260722_learning_contents_ppl432_mayday_pan_pan.sql)（`PPL-4-3-2`、`order_index` **408** — **2026-07-22 本番適用済**） |
| **PPL Subject 4 Phase 1 第8本 mapping** | [`20260722_learning_test_mapping_ppl432_mayday_pan_pan.sql`](20260722_learning_test_mapping_ppl432_mayday_pan_pan.sql)（緊急機の行動20 + 救難手続9 + 緊急機管制5 → `PPL-4-3-2` — **2026-07-22 本番適用済**） |
| **W30 Tier B 着陸装置** | [`20260725_learning_test_mapping_landing_gear_w30.sql`](20260725_learning_test_mapping_landing_gear_w30.sql)（着陸装置/降着装置の形式 **2 問** → `engineering_basics` — **2026-07-25 本番適用済**） |
| **PPL Subject 2 `learning_contents`（視程・霧）** | [`20260630_learning_contents_ppl_subject2_207.sql`](20260630_learning_contents_ppl_subject2_207.sql)（`PPL-2-1-7`、`order_index` **207** — ブロックA 完結） |
| **PPL Subject 2 `learning_test_mapping`（視程・霧）** | [`20260630_learning_test_mapping_ppl_subject2_207.sql`](20260630_learning_test_mapping_ppl_subject2_207.sql)（霧の形成 — **2026-06-30 本番適用済**） |
| **PPL Subject 2 `learning_contents`（雲形）** | [`20260629_learning_contents_ppl_subject2_206.sql`](20260629_learning_contents_ppl_subject2_206.sql)（`PPL-2-1-6`、`order_index` **206**） |
| **PPL Subject 2 `learning_test_mapping`（雲形）** | [`20260629_learning_test_mapping_ppl_subject2_206.sql`](20260629_learning_test_mapping_ppl_subject2_206.sql)（雲の観測/形成 — **2026-06-29 本番適用済**） |
| **PPL Subject 2 `learning_contents`（安定度）** | [`20260628_learning_contents_ppl_subject2_205.sql`](20260628_learning_contents_ppl_subject2_205.sql)（`PPL-2-1-5`、`order_index` **205**） |
| **PPL Subject 2 `learning_test_mapping`（安定度）** | [`20260628_learning_test_mapping_ppl_subject2_205.sql`](20260628_learning_test_mapping_ppl_subject2_205.sql)（大気の基礎/安定度 — **2026-06-28 本番適用済**） |
| **PPL Subject 1 `learning_contents`（計器/エンジン 7 本）** | [`20260628_learning_contents_ppl_121_127.sql`](20260628_learning_contents_ppl_121_127.sql)（`order_index` 11〜15・17〜18、`1-2-8/9` → 19/20） |
| **PPL Subject 1 `learning_test_mapping` 残 3 本** | [`20260628_learning_test_mapping_ppl_111_128_129.sql`](20260628_learning_test_mapping_ppl_111_128_129.sql)（`PPL-1-1-11`・`1-2-8`・`1-2-9` — **2026-06-28 本番適用済**） |
| **螺旋マトリックス LMS（MVP PR ①）** DDL + RLS + L1/L2 シード | [`20261012_spiral_lms_schema_rls.sql`](20261012_spiral_lms_schema_rls.sql)、[`20261012_spiral_lms_seed_l1_l2_nodes.sql`](20261012_spiral_lms_seed_l1_l2_nodes.sql)。**本番適用は上様承認後のみ**。`CREATE TABLE IF NOT EXISTS` は既存テーブルに列を足さない（列追加は同ファイルの `ALTER … IF NOT EXISTS` または追補 migration）。シード再実行は L1/L2 の `title` / `is_published` / `opens_at` を上書きし、当該ノードの `node_prerequisites`・`node_contents` を差し替える。**同一 slug を複数ノードに紐づけ可**。記事完了は slug 単位で記録し（PR ② `record_attempt`）、どのノードから読んでも同 slug を要求する全ノードに反映する。 |
| **螺旋マトリックス LMS** L1/L2 ミニクイズシード（80 問） | [`20261014_spiral_lms_seed_quiz_l1_l2.sql`](20261014_spiral_lms_seed_quiz_l1_l2.sql) — 公開 16 ノード × 5 問、`passing_score=80`。`mdx_mini_quiz`・`mini_quiz_version_pass`・`seed_l1_l2_nodes` の**後**に適用。**本番適用は上様承認後のみ**。 |
| **螺旋マトリックス LMS** L1-Q3-1 / L1-Q4-1 `learning_contents` | [`20261014_learning_contents_spiral_l1_q3_q4.sql`](20261014_learning_contents_spiral_l1_q3_q4.sql) — `L1-Q3-1_PathToPilot`・`L1-Q4-1_MichizaneBriefing`（`is_published: false` ドリップ）。**slug map の FK より先に適用**。 |
| **螺旋マトリックス LMS** L1-Q3-1 / L1-Q4-1 本番追補 seed（slug・node_contents） | [`20261030_learning_contents_spiral_l1_q3_1_q4_1_seed.sql`](20261030_learning_contents_spiral_l1_q3_1_q4_1_seed.sql) — `ON CONFLICT DO NOTHING`。`is_published: false`（publish-sync 待ち）。**本番適用は上様承認後のみ**。 |
| **螺旋マトリックス LMS** L1-Q4-2 `learning_contents`＋slug＋node_contents | [`20261030_learning_contents_spiral_l1_q4_2.sql`](20261030_learning_contents_spiral_l1_q4_2.sql) — 即公開（`is_published: true`・syncPublish:false）。**本番適用は上様承認後のみ**。 |
| **螺旋マトリックス LMS** L1-Q3-1 / Q4-1 / Q4-2 `nodes.is_published` | [`20261030_nodes_publish_l1_q3_1_q4_1_q4_2.sql`](20261030_nodes_publish_l1_q3_1_q4_1_q4_2.sql) — 対象 ID のみ `UPDATE … is_published=true`。publish-sync は nodes 非対象。**本番適用は上様承認後のみ**。 |
| **計器飛行（操縦）** IF-1-1 | [`20261030_learning_contents_if_1_1_trust_instruments.sql`](20261030_learning_contents_if_1_1_trust_instruments.sql) — `IF-1-1_TrustInstruments`（即公開・`is_published: true`）。**本番適用は上様承認後のみ**。 |
| **螺旋マトリックス LMS（MVP PR ②）** slug 対応表 | [`20261012_spiral_lms_content_slug_map.sql`](20261012_spiral_lms_content_slug_map.sql) — `content_slug` ↔ `learning_contents.id`（L1/L2 シード参照分を MDX と明示対応）。`is_published` は `learning_contents` を正とする。RLS + SELECT のみ（#85 同様）。 |
| **螺旋マトリックス LMS（MVP PR ②）** `record_attempt` RPC | [`20261012_spiral_lms_record_attempt.sql`](20261012_spiral_lms_record_attempt.sql) — `user_attempts` に `content_slug` / `attempt_kind` / `client_attempt_id`（冪等）。合否は **サーバのみ**（`score` 0–100 の有限値、`p_passed` なし）。`content_view` は `score=100` で合格。**PR ④ 適用後** `mini_quiz` は `record_attempt` 不可（`submit_mini_quiz` を使用）。必須 `node_contents` が 0 本のノードは `MASTERED` 不可。厳格 **Z 階層ゲート**（L(n) は L(n−1) の公開ノードがすべて `MASTERED` までロック；`unlock_config.z_level_gate = 'off'` で解除）。`MAINTENANCE` / 遡及は別 PR — 再計算は既存 `MAINTENANCE` を上書きしない（TODO: MAINTENANCE 遷移 PR）。`opens_at` 未来は RPC 拒否・進捗 `LOCKED`。**表示上の `opens_at` 解除は PR ③ フック**（`opens_at` と `now()` を読み出し側で比較）。未公開記事（`learning_contents.is_published=false`）への `content_view` は拒否。結合テスト: [`spiral_lms_record_attempt_integration.sh`](spiral_lms_record_attempt_integration.sh)（Docker Postgres / mekiki-ci）。**本番適用は上様承認後のみ**。 |
| **螺旋マトリックス LMS（MVP PR ④）** MDX ミニクイズ | [`20261012_spiral_lms_mdx_mini_quiz.sql`](20261012_spiral_lms_mdx_mini_quiz.sql) — `get_node_mini_quiz_questions`（**authenticated**・`opens_at`/前提は `node_locked` 等） / `submit_mini_quiz`（正解は `private.node_mini_quiz_answer_keys`・RLS は公開ノードの直接条件のみ）。**不合格時は `passed: false` のみ**（`score` / 設問別正誤は合格後のみ）。5 回/時/ノードのレート制限（本人×ノードで `pg_advisory_xact_lock`・冪等再送除外）。**複数アカウント・合格者による口外は設計上受容**（総当たり抑止は点数・正誤の非開示とレート制限）。ミニクイズのみノードはクイズ合格で `MASTERED` 可。結合: [`spiral_lms_mini_quiz_integration.sh`](spiral_lms_mini_quiz_integration.sh)（単独実行可）。**TODO（別 PR）**: `publishedAt` なし記事の一般向け対策（既存記事への影響あり）。**本番適用は上様承認後のみ**。 |
| **螺旋マトリックス LMS** ミニクイズ版つき合格 | [`20261013_spiral_lms_mini_quiz_version_pass.sql`](20261013_spiral_lms_mini_quiz_version_pass.sql) — `private.spiral_lms_mini_quiz_revision_seq` で `stem_revision` / `key_revision` を INSERT/UPDATE ごとに割当（手入力無視・正解 ID は版文字列に含めない）と `user_attempts.mini_quiz_version`。合格・`ever_passed`・`MASTERED` は**現行版のみ**有効（設問改訂後は再受験・**MASTERED 解除も仕様**）。down: [`20261013_spiral_lms_mini_quiz_version_pass.down.sql`](20261013_spiral_lms_mini_quiz_version_pass.down.sql)。Vitest: `spiralLmsRecomputeSqlParity.integration.test.ts`（版無効化・up→down→up 含む `fk_support_indexes`）。**本番適用は上様承認後のみ**。 |
| **螺旋マトリックス LMS** FK 補助 index | [`20261013_spiral_lms_fk_support_indexes.sql`](20261013_spiral_lms_fk_support_indexes.sql) — `spiral_content_slug_map.learning_content_id`・`user_attempts.node_id`。down: [`20261013_spiral_lms_fk_support_indexes.down.sql`](20261013_spiral_lms_fk_support_indexes.down.sql)。**本番適用は上様承認後のみ**。 |
| **螺旋マトリックス LMS** 整備点検（MAINTENANCE）遡及 | [`20261014_spiral_lms_maintenance_prerequisites.sql`](20261014_spiral_lms_maintenance_prerequisites.sql) — 同一ノードで **mini_quiz が 2 回連続不合格** のとき、公開済み前提ノード（**同階 + 1 階層下**、`z_level` 範囲）を `MAINTENANCE`（`maintenance_since` 付与）。前提・**Z 階層ゲート**の L(n−1) 公開ノードは `MAINTENANCE` を充足扱い（下流 `MASTERED` / `mastered_at` 維持）。`record_attempt_core` はユーザー単位 advisory lock で apply+recompute を直列化。復帰後の再発火は `maintenance_cleared_at` 以降の **新規 2 連続不合格** のみ（再入 MAINTENANCE では `maintenance_cleared_at` を消さない）。down: [`20261014_spiral_lms_maintenance_prerequisites.down.sql`](20261014_spiral_lms_maintenance_prerequisites.down.sql)。Vitest: `spiralLmsMaintenance.integration.test.ts`。**本番適用は上様承認後のみ**。 |
| **螺旋マトリックス LMS（開発のみ・本番非適用）** | [`dev/20261012_spiral_lms_mdx_mini_quiz_dev_seed.sql`](dev/20261012_spiral_lms_mdx_mini_quiz_dev_seed.sql) — CI / ローカル用 `SPIRAL-DEV-MINI`（`exclude_from_z_gate`）。MDX: `src/dev/mdx/SPIRAL-DEV-MiniQuizSample.mdx`（dev バンドルのみ）。 |
| **USAF 編隊飛行（操縦）** ep.1 | `20260616_learning_contents_fmt_wingman_vfr.sql`（`FMT-1-1_WingmanVFR`、`order_index` 601） |
| **USAF 編隊飛行（操縦）** ep.2 | `20260617_learning_contents_fmt_runway_lineup_takeoff.sql`（`FMT-1-2_RunwayLineupTakeoff`、`order_index` 602） |
| **USAF 編隊飛行（操縦）** ep.3 | [`20260813_learning_contents_fmt_fingertip_route.sql`](20260813_learning_contents_fmt_fingertip_route.sql)（`FMT-1-3_FingertipRoute`、`order_index` **603**） |
| **USAF 編隊 W34 ドリップ準備** | [`20260813_learning_contents_fmt_w34_unpublish.sql`](20260813_learning_contents_fmt_w34_unpublish.sql)（1-1〜1-3 を `is_published: false`。公開日は schedule） |
| **USAF 編隊飛行（操縦）** ep.4 ストック | [`20260813_learning_contents_fmt_ops_check_fence.sql`](20260813_learning_contents_fmt_ops_check_fence.sql)（`FMT-1-4_OpsCheckFence`、`order_index` **604**、`is_published: false`） |
| **USAF 編隊飛行（操縦）** ep.4 T-4 メタ同期 | [`20261017_learning_contents_fmt_1_4_ops_check_title.sql`](20261017_learning_contents_fmt_1_4_ops_check_title.sql)（`FMT-1-4_OpsCheckFence` の title・description のみ。`is_published` は触らない） |
| **USAF 編隊飛行（操縦）** ep.5 ストック | [`20260813_learning_contents_fmt_lead_change.sql`](20260813_learning_contents_fmt_lead_change.sql)（`FMT-1-5_LeadChange`、`order_index` **605**、`is_published: false`） |
| **USAF 編隊飛行（操縦）** ep.6 ストック | [`20260813_learning_contents_fmt_spread.sql`](20260813_learning_contents_fmt_spread.sql)（`FMT-1-6_Spread`、`order_index` **606**、`is_published: false`） |
| **USAF 編隊飛行（操縦）** ep.7 ストック | [`20260813_learning_contents_fmt_trail_family.sql`](20260813_learning_contents_fmt_trail_family.sql)（`FMT-1-7_TrailFamily`、`order_index` **607**、`is_published: false`） |
| **USAF 編隊飛行（操縦）** ep.8 ストック | [`20260813_learning_contents_fmt_rejoin.sql`](20260813_learning_contents_fmt_rejoin.sql)（`FMT-1-8_Rejoin`、`order_index` **608**、`is_published: false`） |
| **USAF 編隊飛行（操縦）** ep.9 ストック | [`20260815_learning_contents_fmt_tactical_lab.sql`](20260815_learning_contents_fmt_tactical_lab.sql)（`FMT-1-9_TacticalLAB`、`order_index` **609**、`is_published: false`） |
| **USAF 編隊飛行（操縦）** ep.10 ストック | [`20260816_learning_contents_fmt_lost_wingman.sql`](20260816_learning_contents_fmt_lost_wingman.sql)（`FMT-1-10_LostWingman`、`order_index` **610**、`is_published: false`） |
| **CP（操縦）** ep.1 ストック | [`20260816_learning_contents_ctx_area_and_purpose.sql`](20260816_learning_contents_ctx_area_and_purpose.sql)（`CP-1-1_AreaAndPurpose`、`order_index` **611**） |
| **CP（操縦）** ep.2 W34 | [`20260816_learning_contents_ctx_energy.sql`](20260816_learning_contents_ctx_energy.sql)（`CP-1-2_Energy`、`order_index` **612**、公開 8/19） |
| **CP（操縦）** ep.3 W34 | [`20260816_learning_contents_ctx_controls_g_pio.sql`](20260816_learning_contents_ctx_controls_g_pio.sql)（`CP-1-3_ControlsGPio`、`order_index` **613**、公開 8/21） |
| **CP（操縦）** S2-1 ストック | [`20260817_learning_contents_cp_2_1_deep_stall.sql`](20260817_learning_contents_cp_2_1_deep_stall.sql)（`CP-2-1_DeepStall`、`order_index` **614**、`is_published: false`） |
| **CP（操縦）** S2-2 ストック | [`20260817_learning_contents_cp_2_2_accelerated_stall.sql`](20260817_learning_contents_cp_2_2_accelerated_stall.sql)（`CP-2-2_AcceleratedStall`、`order_index` **615**、`is_published: false`） |
| **CP（操縦）** S2-3 ストック | [`20260817_learning_contents_cp_2_3_roll_authority.sql`](20260817_learning_contents_cp_2_3_roll_authority.sql)（`CP-2-3_RollAuthority`、`order_index` **616**、`is_published: false`） |
| **CP（操縦）** S2-4 ストック | [`20260817_learning_contents_cp_2_4_unload.sql`](20260817_learning_contents_cp_2_4_unload.sql)（`CP-2-4_Unload`、`order_index` **617**、`is_published: false`） |
| **CP（操縦）** S2-5 ストック | [`20260817_learning_contents_cp_2_5_trim_failure.sql`](20260817_learning_contents_cp_2_5_trim_failure.sql)（`CP-2-5_TrimFailure`、`order_index` **618**、`is_published: false`） |
| **CP（操縦）** S2-6 ストック | [`20260817_learning_contents_cp_2_6_pitchback_sliceback.sql`](20260817_learning_contents_cp_2_6_pitchback_sliceback.sql)（`CP-2-6_PitchbackSliceback`、`order_index` **619**、`is_published: false`） |
| **CP（操縦）** S3-1 ストック | [`20260818_learning_contents_cp_3_1_configured_handling.sql`](20260818_learning_contents_cp_3_1_configured_handling.sql)（`CP-3-1_ConfiguredHandling`、`order_index` **620**、`is_published: false`） |
| **CP（操縦）** S3-2 ストック | [`20260818_learning_contents_cp_3_2_pattern_ats.sql`](20260818_learning_contents_cp_3_2_pattern_ats.sql)（`CP-3-2_PatternATS`、`order_index` **621**、`is_published: false`） |
| **CP（操縦）** S3-2 T-4 メタ同期 | [`20261014_cp_3_2_t4_title.sql`](20261014_cp_3_2_t4_title.sql)（`CP-3-2_PatternATS` の title・description のみ。`is_published` は触らない） |
| **CP（操縦）** S4-1 ストック | [`20260819_learning_contents_cp_4_1_nose_high.sql`](20260819_learning_contents_cp_4_1_nose_high.sql)（`CP-4-1_NoseHigh`、`order_index` **622**、`is_published: false`） |
| **CP（操縦）** S4-2 ストック | [`20260819_learning_contents_cp_4_2_nose_low.sql`](20260819_learning_contents_cp_4_2_nose_low.sql)（`CP-4-2_NoseLow`、`order_index` **623**、`is_published: false`） |
| **CP（操縦）** S5-1 ストック | [`20260820_learning_contents_cp_5_1_aerobatic_contract.sql`](20260820_learning_contents_cp_5_1_aerobatic_contract.sql)（`CP-5-1_AerobaticContract`、`order_index` **624**、`is_published: false`） |
| **CP（操縦）** S5-2 ストック | [`20260820_learning_contents_cp_5_2_aileron_roll.sql`](20260820_learning_contents_cp_5_2_aileron_roll.sql)（`CP-5-2_AileronRoll`、`order_index` **625**、`is_published: false`） |
| **CP（操縦）** W38 メタ同期 | [`20260912_learning_contents_cp_w38_meta.sql`](20260912_learning_contents_cp_w38_meta.sql)（4-2 / 5-1 / 5-2 の title・description のみ。`is_published` は触らない） |
| **CP（操縦）** S5-3 ストック | [`20260820_learning_contents_cp_5_3_lazy_eight.sql`](20260820_learning_contents_cp_5_3_lazy_eight.sql)（`CP-5-3_LazyEight`、`order_index` **626**、`is_published: false`） |
| **CP（操縦）** S5-4 ストック | [`20260821_learning_contents_cp_5_4_barrel_roll.sql`](20260821_learning_contents_cp_5_4_barrel_roll.sql)（`CP-5-4_BarrelRoll`、`order_index` **627**、`is_published: false`） |
| **CP（操縦）** S5-5 ストック | [`20260821_learning_contents_cp_5_5_loop.sql`](20260821_learning_contents_cp_5_5_loop.sql)（`CP-5-5_Loop`、`order_index` **628**、`is_published: false`） |
| **CP（操縦）** W39 メタ同期 | [`20260919_learning_contents_cp_w39_meta.sql`](20260919_learning_contents_cp_w39_meta.sql)（5-3 / 5-4 / 5-5 の title・description のみ。`is_published` は触らない） |
| **CP（操縦）** S5-6 ストック | [`20260821_learning_contents_cp_5_6_split_s_immelmann.sql`](20260821_learning_contents_cp_5_6_split_s_immelmann.sql)（`CP-5-6_SplitSImmelmann`、`order_index` **629**、`is_published: false`） |
| **CP（操縦）** S5-7 ストック | [`20260821_learning_contents_cp_5_7_cuban_eight.sql`](20260821_learning_contents_cp_5_7_cuban_eight.sql)（`CP-5-7_CubanEight`、`order_index` **630**、`is_published: false`） |
| **CP（操縦）** S5-8 ストック | [`20260821_learning_contents_cp_5_8_cloverleaf.sql`](20260821_learning_contents_cp_5_8_cloverleaf.sql)（`CP-5-8_Cloverleaf`、`order_index` **631**、`is_published: false`） |
| **CP（操縦）** S5-9 ストック | [`20260821_learning_contents_cp_5_9_chandelle.sql`](20260821_learning_contents_cp_5_9_chandelle.sql)（`CP-5-9_Chandelle`、`order_index` **632**、`is_published: false`。CP 最終話） |
| **CP 公開面タイトル同期** | [`20260817_learning_contents_ctx_cp_titles.sql`](20260817_learning_contents_ctx_cp_titles.sql)（適用済。現行 ID は CP-*） |
| **CTX→CP ID 改名** | [`20260817_learning_contents_ctx_to_cp.sql`](20260817_learning_contents_ctx_to_cp.sql)（`learning_contents` と progress/views の ID を CP-* へ） |
| **cohort 週次ミッション・TOP3 バッジ** | `20260620_cohort_weekly_missions.sql`（`user_learning_profiles` cohort 列、週次 RPC、通知テーブル）。MVP tier（3〜9 名）: [`20260626_cohort_weekly_mvp_tier_awards.sql`](20260626_cohort_weekly_mvp_tier_awards.sql) |
| **ゲーミフィケーション第1期（学科試験完了まで）** | [`20260720_gamification_phase1_foundation.sql`](20260720_gamification_phase1_foundation.sql) + [`20260720_gamification_phase1_production_hardening.sql`](20260720_gamification_phase1_production_hardening.sql) — 匿名書込RLS廃止、本人固定・サーバー計算XP、記事5 + 理解10、ALPM、週次達成/MVP/TOP3 XP、学習ジャーニー、公開RPCのINVOKER境界。**2026-07-20 本番適用済み** |
| **ゲーミフィケーション第2期（習熟ループ）** | [`20260720_gamification_phase2_mastery_loop.sql`](20260720_gamification_phase2_mastery_loop.sql) + [`20260720_gamification_phase2_rpc_invoker_wrappers.sql`](20260720_gamification_phase2_rpc_invoker_wrappers.sql) — SRS同期、弱点リフレッシュ、遅延再テスト/弱点改善XP、編隊クエスト、学習ジャーニー拡張、INVOKER境界。**2026-07-20 本番適用済み** |
| **記事/Quiz XP INVOKER ラッパー（403 修正）** | [`20260920_award_article_quiz_xp_invoker_wrappers.sql`](20260920_award_article_quiz_xp_invoker_wrappers.sql) — `award_article_read_xp` / `award_quiz_session_xp` / `award_article_comprehension_xp` を private DEFINER impl + public INVOKER。`apply_xp_reward` は postgres のみ EXECUTE。**2026-09-20 MCP 本番適用** |
| **７つの習慣その１ 個別再公開** | [`20260920_learning_contents_unconscious_success_publish.sql`](20260920_learning_contents_unconscious_success_publish.sql) — `1.1.1_UnconsciousSuccess` のみ `is_published=true`。残 withdrawn 27 本は触らない。**2026-09-20 MCP 本番適用** |
| **７つの習慣その３ 個別再公開** | [`20260921_learning_contents_prioritizing_most_important_publish.sql`](20260921_learning_contents_prioritizing_most_important_publish.sql) — `1.1.3_PrioritizingMostImportant` のみ `is_published=true`。残 withdrawn 26 本は触らない。**2026-09-21 MCP 本番適用** |
| **７つの習慣その２ 個別再公開** | [`20260921_learning_contents_end_with_future_publish.sql`](20260921_learning_contents_end_with_future_publish.sql) — `1.1.2_EndWithFuture` のみ `is_published=true`。残 withdrawn 25 本は触らない。**2026-09-21 MCP 本番適用** |
| **７つの習慣その４ 個別再公開** | [`20260922_learning_contents_win_win_thinking_publish.sql`](20260922_learning_contents_win_win_thinking_publish.sql) — `1.1.4_WinWinThinking` のみ `is_published=true`。残 withdrawn 24 本は触らない。**2026-09-22 MCP 本番適用** |
| **７つの習慣その５ ドリップ予約** | [`20260923_learning_contents_seek_first_to_understand_publish.sql`](20260923_learning_contents_seek_first_to_understand_publish.sql) — `1.1.5_SeekFirstToUnderstand` を `is_published=false` で stock。`articlePublishSchedule` W40 金曜 2026-10-02 まで cron 待ち。残 withdrawn 23 本は触らない |
| **７つの習慣その６ ドリップ予約** | [`20260923_learning_contents_synergize_publish.sql`](20260923_learning_contents_synergize_publish.sql) — `1.1.6_Synergize` を `is_published=false` で stock。`articlePublishSchedule` W41 金曜 2026-10-09 まで cron 待ち。残 withdrawn 22 本は触らない |
| **cohort RPC 権限 hardening** | `20260621_cohort_rpc_hardening.sql`（cron RPC を service_role のみ、anon EXECUTE revoke、`notification_deliveries` SELECT-own RLS） |
| **cohort RPC INVOKER ラッパー（Security Advisor 0029 解消）** | `20260603_cohort_rpc_security_invoker_wrappers.sql` — 本番適用済（MCP `cohort_rpc_security_invoker_wrappers_20260603`） |
| **profiles ログイン時 MFA 設定** | `20260622_profiles_mfa_required_at_login.sql`（`mfa_required_at_login` 列） / `20260624_profiles_mfa_required_at_login_default_off.sql`（デフォルト **false**・opt-in） |
| **MFA リカバリーコード** | `20260623_mfa_recovery_codes.sql`（`mfa_recovery_codes` ハッシュ保存）。API: `api/mfa-recovery-codes.ts`（`?action=`、本番 2026-06-21 確認済）。RLS deny ポリシー: [`20260625_mfa_recovery_codes_rls_policies.sql`](20260625_mfa_recovery_codes_rls_policies.sql) |
| **記事 XP 付与修正** | `20260616_award_article_xp_fix.sql`（`learning_progress.xp_awarded_at`、`award_article_xp` RPC） |
| **汎用 XP イベント** | `20260616_xp_award_events.sql`（`xp_award_events`、`award_xp_event` RPC） |
| **登録 XP バックフィル** | `20260616_backfill_registration_xp.sql`（オンボーディング完了済み・未付与ユーザーへ 100 XP） |
| **Quiz CBT 整合 Phase 1（needs_review 降格）** | [`20260528_quiz_cbt_phase1_needs_review.sql`](20260528_quiz_cbt_phase1_needs_review.sql)（41 件 — **2026-05-28 本番適用済**） |
| **Quiz 法規 D-2 改稿・復帰** | [`20260528_quiz_art151_d2_fix_and_reverify.sql`](20260528_quiz_art151_d2_fix_and_reverify.sql)（8 件 verified 復帰 — **2026-05-28 本番適用済**） |
| **Quiz Phase 2 削除（D-1 + Tier A）** | [`20260528_quiz_phase2_delete_d1_tier_a.sql`](20260528_quiz_phase2_delete_d1_tier_a.sql)（30 件 — **2026-05-28 本番適用済**） |
| **Quiz Phase 3 削除（D-2 重複 + Tier B + 破損）** | [`20260528_quiz_phase3_delete_d2_dupes_tier_b.sql`](20260528_quiz_phase3_delete_d2_dupes_tier_b.sql)（146 件 — **2026-05-28 本番適用済**） |
| **Quiz Phase 3 needs_review 棚卸し** | [`20260528_quiz_phase3_needs_review_fix_verify.sql`](20260528_quiz_phase3_needs_review_fix_verify.sql)（修正4・復帰9・削除7 — **2026-05-28 本番適用済**）。棚卸しメモは Git 履歴の `artifacts/quiz_cbt_deletion_candidates_2026-05-28.md` |
| Phase B・Phase 2 対象 8 単元（気象 3.3.10〜12・工学 3.2.10〜12・法規 3.1.7〜8）`learning_contents` / `content_title` | `20260505_learning_contents_phase2_eight_meta.sql` |
| 通信 3.5.4 メタ本文化（May） | `20260505_learning_contents_comm_354_meta_finalize.sql` |
| 通信 3.5.x メタ全集約（本文化後） | `20260507_learning_contents_comm_351_355_meta_sync.sql` |
| 通信 3.5.5 メタ本文化 | `20260506_learning_contents_comm_355_meta_finalize.sql` |
| `learning_test_mapping` 追加・修正 | `20260412_learning_test_mapping_*.sql`、`20260330_learning_test_mapping_cpl_clusters_by_subject.sql`、§5.2 上位クラスタ追補 `20260505_learning_test_mapping_unmapped_top_clusters.sql`、`20260506_learning_test_mapping_unmapped_tier2.sql`、**W23 法規** `20260512_learning_test_mapping_legal_sokusoku_mokuteki.sql`（`総則/目的`→`3.1.1`）、**W24 空力** `20260606_learning_test_mapping_aero_lift_drag_clusters.sql`（空力基礎 3 クラスタ→`3.2.7`）等（08・14 が索引）。**2026-05**: 緊急通信の再適用・監査のみは `20260505_*.sql` |
| レガシーテーブル削除（2026-04） | `20260411_drop_*.sql`（[Closed_Sprints.md](../../docs/Closed_Sprints.md) §1） |
| ランク・ゲーミフィケーション（再構築時） | `ppl_rank_*.sql`、`rank_integration*.sql`、`gamification_migration.sql`（[Component_Structure_Guide.md](../../docs/Component_Structure_Guide.md)） |

### 螺旋マトリックス LMS — 本番適用順（#85 + PR ②）

**事前に上様承認必須。** 本番 DB では `learning_contents` に対応 ID が既に存在することを前提に、次の順で適用する（PR ① #85 の DDL と PR ② をまたぐ一連の手順）。

1. [`20261012_spiral_lms_schema_rls.sql`](20261012_spiral_lms_schema_rls.sql) — PR ① #85（DDL・RLS）
2. [`20261014_learning_contents_spiral_l1_q3_q4.sql`](20261014_learning_contents_spiral_l1_q3_q4.sql) — L1 螺旋記事 2 本（`learning_contents`）
3. [`20261012_spiral_lms_content_slug_map.sql`](20261012_spiral_lms_content_slug_map.sql) — slug 対応表
4. [`20261012_spiral_lms_record_attempt.sql`](20261012_spiral_lms_record_attempt.sql) — `record_attempt` RPC
5. [`20261012_spiral_lms_mdx_mini_quiz.sql`](20261012_spiral_lms_mdx_mini_quiz.sql) — PR ④（MDX ミニクイズ・`submit_mini_quiz`）
6. [`20261012_spiral_lms_seed_l1_l2_nodes.sql`](20261012_spiral_lms_seed_l1_l2_nodes.sql) — PR ① #85（L1/L2 シード）
7. [`20261013_spiral_lms_mini_quiz_version_pass.sql`](20261013_spiral_lms_mini_quiz_version_pass.sql) — ミニクイズ版つき合格
8. [`20261014_spiral_lms_seed_quiz_l1_l2.sql`](20261014_spiral_lms_seed_quiz_l1_l2.sql) — L1/L2 ミニクイズ 80 問シード
9. [`20261013_spiral_lms_fk_support_indexes.sql`](20261013_spiral_lms_fk_support_indexes.sql) — FK 補助 index
10. [`20261014_spiral_lms_maintenance_prerequisites.sql`](20261014_spiral_lms_maintenance_prerequisites.sql) — 整備点検（2 連続不合格 → 前提 `MAINTENANCE`）

#### 戻し手順（down）

本番で PR ④ 以降が入っている前提。**適用済み migration の up ファイルは書き換えない。** 次の **down ファイル**を適用順の逆で実行する。

1. [`20261014_spiral_lms_maintenance_prerequisites.down.sql`](20261014_spiral_lms_maintenance_prerequisites.down.sql) — MAINTENANCE 関数・`maintenance_since` / `maintenance_cleared_at` 列を削除し、`published_prerequisites_met` / `z_level_gate_met` / `recompute_node_progress` / `record_attempt_core` を version_pass 適用後相当に戻す
2. [`20261013_spiral_lms_fk_support_indexes.down.sql`](20261013_spiral_lms_fk_support_indexes.down.sql)
3. [`20261013_spiral_lms_mini_quiz_version_pass.down.sql`](20261013_spiral_lms_mini_quiz_version_pass.down.sql) — `mini_quiz_met` / `ever_passed` / `record_attempt_core` を PR ④ 定義に戻し、版列・revision 列・トリガーを削除

Vitest（`SPIRAL_LMS_PG_URL` あり）で up→down→up の往復を [`spiralLmsRecomputeSqlParity.integration.test.ts`](../../src/__tests__/integration/spiralLmsRecomputeSqlParity.integration.test.ts) が検証する。

### TODO（螺旋マトリックス LMS）

- 結合テストへロック・RLS/anon・opens_at未来・未公開記事拒否・MAINTENANCE非上書き・同時送信の試験を追加（別PR）
- **開発 UI（PR ⑤）**: 完了判定は `user_progress` 保存値を信頼（表示は参考、サーバが正）。ロック解除後にサーバ再計算前のノードは UI 上 AVAILABLE になりうる
- **開発 UI（PR ⑤）**: 「公開予定」は必須記事がすべて未公開のとき（MDX `publishedAt` 基準）。将来 `learning_contents.is_published` との統一を検討
- **本番適用後**: Supabase MCP `generate_typescript_types` で `src/types/database.types.ts` を再生成し、`src/types/spiralLmsDatabase.ts` の暫定スキーマを統合する（PR ③ フックは暫定型を使用中）

詳細リストは増やさず、`docs/**/*.md` 内のリンクを**検索キーにする**。新規のワンオフ適用でも、名前は `YYYYMMDD_目的_snake_case.sql` を維持する。
