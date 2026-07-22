# `scripts/database/` 索引（Supabase・学習DB）

運用・仕様の**長文正本**: [docs/Scripts_Repository_Tooling.md](../../docs/Scripts_Repository_Tooling.md) と [docs/02_System_Spec.md](../../docs/02_System_Spec.md)、CPL メタ／マッピングは [docs/08_Syllabus_Management_Guide.md](../../docs/08_Syllabus_Management_Guide.md)、[docs/09_CPL_Learning_Stub.md](../../docs/09_CPL_Learning_Stub.md)、[docs/db/CPL_KPI_and_Database_Operations.md](../../docs/db/CPL_KPI_and_Database_Operations.md)。

## このディレクトリの役割

| 種別 | 置き場所 | 備考 |
|------|----------|------|
| いま運用・ドキュメントからリンクされる冪等 SQL | **このディレクトリ直下** | `YYYYMMDD_*.sql`、`insert_*.sql`、ドロップ系など。本番適用済みでも**参照オペマニュアル**になるものはここに残す。 |
| **参照のない旧 SQL** | **置かない（削除）** | `docs/`・Skill・コードからファイル名で辿れないワンオフはリポジトリに残さない。必要なら **`git log --diff-filter=D -- scripts/database/`** や該当コミットのツリーから復元する。 |
| 記事 1件登録用スクリプト | [`register_ppl_article.mjs`](register_ppl_article.mjs)、[`check_learning_contents.mjs`](check_learning_contents.mjs) | Skill [learning-contents-registration](../../.cursor/skills/learning-contents-registration/SKILL.md) と併読。 |

**ルート `.gitignore` の `archive/*`**: ローカル用スタジング専用。SQL の「退避用サブディレクトリ」は設けず、不要ファイルは削除して履歴は Git に任せる。

## よく参照される SQL（抜粋）

| 目的 | ファイル |
|------|----------|
| PPL／CPL 出題区分・バッチ適用の起点 | `20260324_add_unified_cpl_applicable_exams.sql`、[db/CPL_KPI_and_Database_Operations.md](../../docs/db/CPL_KPI_and_Database_Operations.md) の手順表 |
| **MLIT 例題集（CPL飛行機）** 2026-06 / 2024-08 | [`20260720_unified_cpl_questions_mlit_sample_202606.sql`](20260720_unified_cpl_questions_mlit_sample_202606.sql)、[`20260720_unified_cpl_questions_mlit_sample_202408_backfill.sql`](20260720_unified_cpl_questions_mlit_sample_202408_backfill.sql)（**2026-07-20 本番適用・ファクトチェック済**。要図除外後 **104問 verified**。手順は [Scripts_Repository_Tooling.md](../../docs/Scripts_Repository_Tooling.md)「MLIT 例題集取込」） |
| CPL 工学・気象・航法 `learning_contents` メタ同期 | `20260412_learning_contents_cpl_engineering_*_meta.sql`、`20260424_learning_contents_cpl_meteo_331_3312_meta.sql`、`20260430_learning_contents_cpl_navigation_341_347_meta.sql` |
| **PPL Master Subject 5（航空法規）** MDX メタ同期（4＋3＋7 本） | `20260512_learning_contents_ppl_aviation_law_four.sql`（501〜504）、`20260512_learning_contents_ppl_subject5_505_507.sql`（505〜507）、`20260512_learning_contents_ppl_subject5_508_514.sql`（508〜514）（[`PPL_Subject5_Aviation_Law_Structure.md`](../../docs/content_outlines/PPL_Subject5_Aviation_Law_Structure.md)） |
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
| **PPL Subject 2 `learning_contents`（視程・霧）** | [`20260630_learning_contents_ppl_subject2_207.sql`](20260630_learning_contents_ppl_subject2_207.sql)（`PPL-2-1-7`、`order_index` **207** — ブロックA 完結） |
| **PPL Subject 2 `learning_test_mapping`（視程・霧）** | [`20260630_learning_test_mapping_ppl_subject2_207.sql`](20260630_learning_test_mapping_ppl_subject2_207.sql)（霧の形成 — **2026-06-30 本番適用済**） |
| **PPL Subject 2 `learning_contents`（雲形）** | [`20260629_learning_contents_ppl_subject2_206.sql`](20260629_learning_contents_ppl_subject2_206.sql)（`PPL-2-1-6`、`order_index` **206**） |
| **PPL Subject 2 `learning_test_mapping`（雲形）** | [`20260629_learning_test_mapping_ppl_subject2_206.sql`](20260629_learning_test_mapping_ppl_subject2_206.sql)（雲の観測/形成 — **2026-06-29 本番適用済**） |
| **PPL Subject 2 `learning_contents`（安定度）** | [`20260628_learning_contents_ppl_subject2_205.sql`](20260628_learning_contents_ppl_subject2_205.sql)（`PPL-2-1-5`、`order_index` **205**） |
| **PPL Subject 2 `learning_test_mapping`（安定度）** | [`20260628_learning_test_mapping_ppl_subject2_205.sql`](20260628_learning_test_mapping_ppl_subject2_205.sql)（大気の基礎/安定度 — **2026-06-28 本番適用済**） |
| **PPL Subject 1 `learning_contents`（計器/エンジン 7 本）** | [`20260628_learning_contents_ppl_121_127.sql`](20260628_learning_contents_ppl_121_127.sql)（`order_index` 11〜15・17〜18、`1-2-8/9` → 19/20） |
| **PPL Subject 1 `learning_test_mapping` 残 3 本** | [`20260628_learning_test_mapping_ppl_111_128_129.sql`](20260628_learning_test_mapping_ppl_111_128_129.sql)（`PPL-1-1-11`・`1-2-8`・`1-2-9` — **2026-06-28 本番適用済**） |
| **USAF 編隊飛行（操縦）** ep.1 | `20260616_learning_contents_fmt_wingman_vfr.sql`（`FMT-1-1_WingmanVFR`、`order_index` 601） |
| **USAF 編隊飛行（操縦）** ep.2 | `20260617_learning_contents_fmt_runway_lineup_takeoff.sql`（`FMT-1-2_RunwayLineupTakeoff`、`order_index` 602） |
| **cohort 週次ミッション・TOP3 バッジ** | `20260620_cohort_weekly_missions.sql`（`user_learning_profiles` cohort 列、週次 RPC、通知テーブル）。MVP tier（3〜9 名）: [`20260626_cohort_weekly_mvp_tier_awards.sql`](20260626_cohort_weekly_mvp_tier_awards.sql) |
| **ゲーミフィケーション第1期（学科試験完了まで）** | [`20260720_gamification_phase1_foundation.sql`](20260720_gamification_phase1_foundation.sql) + [`20260720_gamification_phase1_production_hardening.sql`](20260720_gamification_phase1_production_hardening.sql) — 匿名書込RLS廃止、本人固定・サーバー計算XP、記事5 + 理解10、ALPM、週次達成/MVP/TOP3 XP、学習ジャーニー、公開RPCのINVOKER境界。**2026-07-20 本番適用済み** |
| **ゲーミフィケーション第2期（習熟ループ）** | [`20260720_gamification_phase2_mastery_loop.sql`](20260720_gamification_phase2_mastery_loop.sql) + [`20260720_gamification_phase2_rpc_invoker_wrappers.sql`](20260720_gamification_phase2_rpc_invoker_wrappers.sql) — SRS同期、弱点リフレッシュ、遅延再テスト/弱点改善XP、編隊クエスト、学習ジャーニー拡張、INVOKER境界。**2026-07-20 本番適用済み** |
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
| **Quiz Phase 3 needs_review 棚卸し** | [`20260528_quiz_phase3_needs_review_fix_verify.sql`](20260528_quiz_phase3_needs_review_fix_verify.sql)（修正4・復帰9・削除7 — **2026-05-28 本番適用済**）。レポート: [`artifacts/quiz_cbt_deletion_candidates_2026-05-28.md`](../artifacts/quiz_cbt_deletion_candidates_2026-05-28.md) |
| Phase B・Phase 2 対象 8 単元（気象 3.3.10〜12・工学 3.2.10〜12・法規 3.1.7〜8）`learning_contents` / `content_title` | `20260505_learning_contents_phase2_eight_meta.sql` |
| 通信 3.5.4 メタ本文化（May） | `20260505_learning_contents_comm_354_meta_finalize.sql` |
| 通信 3.5.x メタ全集約（本文化後） | `20260507_learning_contents_comm_351_355_meta_sync.sql` |
| 通信 3.5.5 メタ本文化 | `20260506_learning_contents_comm_355_meta_finalize.sql` |
| `learning_test_mapping` 追加・修正 | `20260412_learning_test_mapping_*.sql`、`20260330_learning_test_mapping_cpl_clusters_by_subject.sql`、§5.2 上位クラスタ追補 `20260505_learning_test_mapping_unmapped_top_clusters.sql`、`20260506_learning_test_mapping_unmapped_tier2.sql`、**W23 法規** `20260512_learning_test_mapping_legal_sokusoku_mokuteki.sql`（`総則/目的`→`3.1.1`）、**W24 空力** `20260606_learning_test_mapping_aero_lift_drag_clusters.sql`（空力基礎 3 クラスタ→`3.2.7`）等（08・14 が索引）。**2026-05**: 緊急通信の再適用・監査のみは `20260505_*.sql` |
| レガシーテーブル削除（2026-04） | `20260411_drop_*.sql`（[02_System_Spec.md](../../docs/02_System_Spec.md) DB スリム化と対応） |
| ランク・ゲーミフィケーション（再構築時） | `ppl_rank_*.sql`、`rank_integration*.sql`、`gamification_migration.sql`（[04_Operations_Guide.md](../../docs/04_Operations_Guide.md)） |

詳細リストは増やさず、`docs/**/*.md` 内のリンクを**検索キーにする**。新規のワンオフ適用でも、名前は `YYYYMMDD_目的_snake_case.sql` を維持する。
