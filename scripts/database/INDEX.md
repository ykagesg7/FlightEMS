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
| CPL 工学・気象・航法 `learning_contents` メタ同期 | `20260412_learning_contents_cpl_engineering_*_meta.sql`、`20260424_learning_contents_cpl_meteo_331_3312_meta.sql`、`20260430_learning_contents_cpl_navigation_341_347_meta.sql` |
| **PPL Master Subject 5（航空法規）** MDX メタ同期（4＋3＋7 本） | `20260512_learning_contents_ppl_aviation_law_four.sql`（501〜504）、`20260512_learning_contents_ppl_subject5_505_507.sql`（505〜507）、`20260512_learning_contents_ppl_subject5_508_514.sql`（508〜514）（[`PPL_Subject5_Aviation_Law_Structure.md`](../../docs/content_outlines/PPL_Subject5_Aviation_Law_Structure.md)） |
| **USAF 編隊飛行（操縦）** ep.1 | `20260616_learning_contents_fmt_wingman_vfr.sql`（`FMT-1-1_WingmanVFR`、`order_index` 601） |
| **USAF 編隊飛行（操縦）** ep.2 | `20260617_learning_contents_fmt_runway_lineup_takeoff.sql`（`FMT-1-2_RunwayLineupTakeoff`、`order_index` 602） |
| **cohort 週次ミッション・TOP3 バッジ** | `20260620_cohort_weekly_missions.sql`（`user_learning_profiles` cohort 列、週次 RPC、通知テーブル） |
| **cohort RPC 権限 hardening** | `20260621_cohort_rpc_hardening.sql`（cron RPC を service_role のみ、anon EXECUTE revoke、`notification_deliveries` SELECT-own RLS）— Security Advisor 許容 WARN は [04_Operations_Guide.md](../../docs/04_Operations_Guide.md) |
| **profiles ログイン時 MFA 設定** | `20260622_profiles_mfa_required_at_login.sql`（`mfa_required_at_login` 列、デフォルト true） |
| **MFA リカバリーコード** | `20260623_mfa_recovery_codes.sql`（`mfa_recovery_codes` ハッシュ保存、API 経由のみ） |
| **記事 XP 付与修正** | `20260616_award_article_xp_fix.sql`（`learning_progress.xp_awarded_at`、`award_article_xp` RPC） |
| **汎用 XP イベント** | `20260616_xp_award_events.sql`（`xp_award_events`、`award_xp_event` RPC） |
| **登録 XP バックフィル** | `20260616_backfill_registration_xp.sql`（オンボーディング完了済み・未付与ユーザーへ 100 XP） |
| Phase B・Phase 2 対象 8 単元（気象 3.3.10〜12・工学 3.2.10〜12・法規 3.1.7〜8）`learning_contents` / `content_title` | `20260505_learning_contents_phase2_eight_meta.sql` |
| 通信 3.5.4 メタ本文化（May） | `20260505_learning_contents_comm_354_meta_finalize.sql` |
| 通信 3.5.x メタ全集約（本文化後） | `20260507_learning_contents_comm_351_355_meta_sync.sql` |
| 通信 3.5.5 メタ本文化 | `20260506_learning_contents_comm_355_meta_finalize.sql` |
| `learning_test_mapping` 追加・修正 | `20260412_learning_test_mapping_*.sql`、`20260330_learning_test_mapping_cpl_clusters_by_subject.sql`、§5.2 上位クラスタ追補 `20260505_learning_test_mapping_unmapped_top_clusters.sql`、`20260506_learning_test_mapping_unmapped_tier2.sql`、**W23 法規** `20260512_learning_test_mapping_legal_sokusoku_mokuteki.sql`（`総則/目的`→`3.1.1`）、**W24 空力** `20260606_learning_test_mapping_aero_lift_drag_clusters.sql`（空力基礎 3 クラスタ→`3.2.7`）等（08・14 が索引）。**2026-05**: 緊急通信の再適用・監査のみは `20260505_*.sql` |
| レガシーテーブル削除（2026-04） | `20260411_drop_*.sql`（[02_System_Spec.md](../../docs/02_System_Spec.md) DB スリム化と対応） |
| ランク・ゲーミフィケーション（再構築時） | `ppl_rank_*.sql`、`rank_integration*.sql`、`gamification_migration.sql`（[04_Operations_Guide.md](../../docs/04_Operations_Guide.md)） |

詳細リストは増やさず、`docs/**/*.md` 内のリンクを**検索キーにする**。新規のワンオフ適用でも、名前は `YYYYMMDD_目的_snake_case.sql` を維持する。
