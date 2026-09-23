# 完了サマリ（段階1 と 2026-02〜09 の実装）

**最終更新**: 2026-09-23  
**役割**: 完了した仕事について「何があるか・どこが正本か・壊してはいけないこと・最終数値」だけを置く。経緯と週次ログは git 履歴（`git log -- docs/`）。現行の計画は [01_Current_Status_and_Roadmap.md](01_Current_Status_and_Roadmap.md)。

月次 Implementation / Content Sprint ファイル、旧 Phase A〜E 表、週次 W18〜W35 の着手行、README の変更日報は削除した。復元は `git log -- docs/<filename>.md`。

---

## 1. 何があるか（正本リンク）

| 領域 | あるもの | 正本 |
|------|----------|------|
| CPL 記事 | Phase 1 **19/19** 本文化。Phase 2 単元も MDX あり。シリーズ別 `meta.series` / `order_index` は下表 | [db/CPL_KPI_and_Database_Operations.md](db/CPL_KPI_and_Database_Operations.md)、[05_Content_Pipeline.md](05_Content_Pipeline.md) §4 |
| PPL 記事 | Subject 1〜5 の Phase 1 MDX（**63/150**）。`PPL-2-3-3` / `2-3-4` は **骨子のみ（MDX なし）** | 本書 §3、[05_Content_Pipeline.md](05_Content_Pipeline.md) §4–§5 |
| 記事↔Quiz 連携 | `learning_test_mapping`、Callout（CPL→PPL 復習）、Quiz 結果からの関連記事 | [05_Content_Pipeline.md](05_Content_Pipeline.md) §5 |
| Quiz Hub `/test` | 科目選択・PPL/CPL 範囲フィルタ・SRS・Review・A2-a（科目 default 5問） | [Component_Structure_Guide.md](Component_Structure_Guide.md) |
| ゲーミフィケーション | 習熟ジャーニー、SRS・遅延再テスト・弱点改善・編隊クエスト、XP RPC、`learning_milestones` | [Component_Structure_Guide.md](Component_Structure_Guide.md) |
| cohort 週次 | 週次ミッション・MVP/TOP3・in-app/Brevo 通知（cron 日曜 09:00 JST） | [Component_Structure_Guide.md](Component_Structure_Guide.md)、[Cursor_MCP_Setup.md](Cursor_MCP_Setup.md) |
| Profile Hub / MFA | 4 セクション IA、TOTP、リカバリーコード、アカウント削除 | [Component_Structure_Guide.md](Component_Structure_Guide.md)、ルート `DESIGN.md` |
| Planning | `computeNavLog`、Setup / Route / NavLog / Briefing、Debrief（GPX/KML/CSV）、SWIM NOTAM（`/api/swim-notam-search`）、航空機レイヤー | [Component_Structure_Guide.md](Component_Structure_Guide.md) `src/pages/planning` |
| 3D 空域エクスプローラ | 隔離ルート `/explore/airspace-3d`（Cesium）。導線は NavLog カードヘッダー | [Component_Structure_Guide.md](Component_Structure_Guide.md) |
| Articles 基盤 | `virtual:articles-index`、記事 HTML prerender、日次公開 cron、週次 digest | [05_Content_Pipeline.md](05_Content_Pipeline.md)、[Component_Structure_Guide.md](Component_Structure_Guide.md) |
| CP シリーズ | `CP-1-1`〜`CP-5-9` MDX 完結 | [content_outlines/Contact_Transition_2026/README.md](content_outlines/Contact_Transition_2026/README.md) |
| FN（旧 FMT Season 1） | `FMT-1-1`〜`1-10` MDX ストック | [content_outlines/FN_Formation_2026/README.md](content_outlines/FN_Formation_2026/README.md) |
| 週次テレメトリ | GA4 artifact → Slack Facts → docs PR → `APPROVE-DOC` | [ops/Weekly_Telemetry_Review.md](ops/Weekly_Telemetry_Review.md) |
| 監視 | Sentry（DSN）、GA4 測定 ID **`G-22VFYSM69J`**（本番フォールバック） | [ops/Weekly_Telemetry_Review.md](ops/Weekly_Telemetry_Review.md)、[Cursor_MCP_Setup.md](Cursor_MCP_Setup.md) |

**CPL 学科シリーズ（`meta.series` / `order_index`）**

| ブロック | `meta.series` | `order_index` 例 |
|----------|---------------|------------------|
| 航空法規 3.1.x | `CPL-Aviation-Legal` | 別鎖（order 1〜8） |
| 航空工学 3.2.1〜12 | `CPL-Aeronautical-Engineering` | 340〜351 |
| 航空気象 3.3.1〜12 | `CPL-Aviation-Meteorology` | 360〜371 |
| 空中航法 3.4.1〜7 | `CPL-Navigation` | 380〜386 |

撤去済み: Shop・アプリ内ギャラリー・体験搭乗（2026-04-12）。戦略上の扱いは [Product_North_Star_and_GTM.md](Product_North_Star_and_GTM.md) §0。

## 2. 壊してはいけないこと

| 不変条件 | 確認の仕方 |
|----------|------------|
| SPA 直打ち6パス（`/articles` `/planning` `/test` `/auth` `/auth?mode=signup` `/profile`）が Vercel `NOT_FOUND` にならない | `vercel.json` の rewrite を触らない。直打ちで `#root` |
| ハブ HTML に Cesium（`Cesium.js` / `vendor-cesium`）を全ページ注入しない | 3D は `/explore/airspace-3d` に隔離 |
| Planning 離脱後に Leaflet が残らない（unmount） | `/planning` → HOME・LOGIN・Mission |
| `award_article_read_xp` / `award_quiz_session_xp` が 403 に戻らない（2xx または `already_awarded`） | DEFINER impl + INVOKER ラッパー（`scripts/database/20260603_cohort_rpc_security_invoker_wrappers.sql`） |
| 学習カタログ（stats / comments / mapping / views）の 401、`learning_sessions` の CHECK 400 が戻らない | GRANT と CHECK を消さない |
| Quiz → Review が空に戻らない。記事の読了は本文末センチネル | `ReviewContentLink` + `learning_test_mapping` |
| 記事の日次公開 cron `10 15 * * *`（UTC＝00:10 JST）と `articlePublishSchedule` | cron と schedule を無断で変えない |
| MDX のメタは ESM `export const meta`。YAML frontmatter 禁止 | `.cursor/rules/mdx-article-guide.mdc` |
| `public/docs` は `npm run sync:public-docs` の出力。手編集しない | `prebuild` で上書きされる |
| Vercel Hobby の Deployment Storage 10 GB、Serverless 関数数の上限 | API は統合エンドポイント（`?action=` / `?job=`）で増やさない |
| UI 変更は承認後。パッケージ版は変えない | ルート `DESIGN.md`、`.cursor/rules/core-project.mdc` |

## 3. 最終数値（最後に実測した値）

| 指標 | 値 | 時点・出典 |
|------|----|-----------|
| CPL Phase 1 本文化 | **19/19** | 2026-04-12 |
| PPL MDX（git 実数） | **63/150** | 2026-09-23 `src/content/lessons/PPL-*`。旧記録の 64 は MDX の無い `PPL-2-3-3` を含む |
| `learning_test_mapping` | **147 行**、verified 未マッピング **10**（レガシー） | 2026-08-12 W35 MCP |
| verified 設問 | **2,129** | 2026-05-28 Quiz 品質整理 |
| CBT 暫定束ね | **104/104**（記録のみ。当該 SQL は git に無い） | 2026-08-12 |
| `src` 実効 Statements | **21.17%**（507 tests 緑） | 2026-08-12 W35 |
| 法規 Callout（CPL→PPL） | **8/8** | 2026-07-10 |
| 週間 GA4 users | 一桁（W36: 2、W37: 3）。`quiz_*` は W34〜W37 連続 **0** | [ops/Weekly_Telemetry_Review.md](ops/Weekly_Telemetry_Review.md) |

A2-a（科目 default 5問）の効果は、母数不足のため **判定不能で閉じた**。CBT Phase B、Quiz Hub UX 追加、C-1〜C-5（ブランド・SEO・PWA・A11y・Lighthouse CI）は未着手のまま段階2の対象外。

## 4. 欠ファイル（作らない）

次のリンク先は git に一度も存在しない。本文を捏造しない。

| 欠ファイル | 代わりに読む場所 |
|------------|------------------|
| CBT_Example_Reclassification_Memo | 本書 §3 の CBT 行。`20260812_learning_test_mapping_cbt_*` もリポジトリに無い |
| Post_Exam_Action2_Action3_Policy_Memo | Quiz Hub A2-a。「2週連続改善」は未判定で閉じた（本書 §3） |

## 5. 削除した旧文書（復元は git 履歴）

| 文書 | 代わりに読む場所 |
|------|------------------|
| `00_Flight_Academy_Strategy.md` | [Product_North_Star_and_GTM.md](Product_North_Star_and_GTM.md) §0、[01](01_Current_Status_and_Roadmap.md) |
| `06_Long_Term_Execution.md` | 本書 §3（カバレッジ実測）、[01](01_Current_Status_and_Roadmap.md)（品質バックログ） |
| `Article_Coverage_Backlog.md` | 本書 §3（マッピング・スナップショット） |
| `PPL_Master_Syllabus.md` | 本書 §1 PPL 行、[05](05_Content_Pipeline.md) §4 |
| `10_航空工学_学科試験攻略ブログ_ロードマップ.md` | 本書 §1 CPL 行 |
| `content_outlines/PPL_*` | 本書 §1 PPL 行（段階1 完了） |
| `02_System_Spec.md` | [Component_Structure_Guide.md](Component_Structure_Guide.md)、本書 §1–§2 |
| `03_Development_Guide.md` | ルート [README.md](../README.md)、[AGENTS.md](../AGENTS.md) |
| `04_Operations_Guide.md` | [05](05_Content_Pipeline.md) §6、[ops/Weekly_Telemetry_Review.md](ops/Weekly_Telemetry_Review.md)、[Cursor_MCP_Setup.md](Cursor_MCP_Setup.md) |
| `08_Syllabus_Management_Guide.md` | [05](05_Content_Pipeline.md) §5 |
| `09_CPL_Learning_Stub.md` | 本書 §1 CPL シリーズ表 |
| `Scripts_Repository_Tooling.md` | [FOLDER_STRUCTURE.md](FOLDER_STRUCTURE.md) `scripts/` |
| `Flight_Debrief_Tools.md` | [Component_Structure_Guide.md](Component_Structure_Guide.md) Planning 節 |
| `SWIM_Portal/*` | 公式 MLIT 資料。実装は `api/swim-notam-search.ts` |
| `ops/MCP_RELEASE_CHECKLIST.md` | [Cursor_MCP_Setup.md](Cursor_MCP_Setup.md) リリース前チェック |
