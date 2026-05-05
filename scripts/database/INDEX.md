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
| 通信 3.5.4 メタ本文化（May） | `20260505_learning_contents_comm_354_meta_finalize.sql` |
| 通信 3.5.5 メタ本文化 | `20260506_learning_contents_comm_355_meta_finalize.sql` |
| `learning_test_mapping` 追加・修正 | `20260412_learning_test_mapping_*.sql`、`20260330_learning_test_mapping_cpl_clusters_by_subject.sql` 等（08・14 が索引）。**2026-05**: 緊急通信の再適用・監査のみは `20260505_*.sql` |
| レガシーテーブル削除（2026-04） | `20260411_drop_*.sql`（[02_System_Spec.md](../../docs/02_System_Spec.md) DB スリム化と対応） |
| ランク・ゲーミフィケーション（再構築時） | `ppl_rank_*.sql`、`rank_integration*.sql`、`gamification_migration.sql`（[04_Operations_Guide.md](../../docs/04_Operations_Guide.md)） |

詳細リストは増やさず、`docs/**/*.md` 内のリンクを**検索キーにする**。新規のワンオフ適用でも、名前は `YYYYMMDD_目的_snake_case.sql` を維持する。
