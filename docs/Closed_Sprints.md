# 完了サマリ（段階1 と 2026-02〜09 の実装）

**最終更新**: 2026-09-23  
**役割**: 完了した仕事について「何があるか・どこが正本か・壊してはいけないこと・最終数値」だけを置く。経緯と週次ログは git 履歴（`git log -- docs/`）。現行の計画は [01_Current_Status_and_Roadmap.md](01_Current_Status_and_Roadmap.md)。

月次 Implementation / Content Sprint ファイル、旧 Phase A〜E 表、週次 W18〜W35 の着手行、README の変更日報は削除した。復元は `git log -- docs/<filename>.md`。

---

## 1. 何があるか（正本リンク）

| 領域 | あるもの | 正本 |
|------|----------|------|
| CPL 記事 | Phase 1 **19/19** 本文化。Phase 2 単元（`3.1.7`〜`8`・`3.2.7`〜`12`・`3.3.10`〜`12`・`3.4.5`〜`7`・`3.5.4`〜`5`）も MDX あり | [db/CPL_KPI_and_Database_Operations.md](db/CPL_KPI_and_Database_Operations.md)、[09_CPL_Learning_Stub.md](09_CPL_Learning_Stub.md) |
| PPL 記事 | Subject 1〜5 の Phase 1 MDX。`PPL-2-3-3` / `2-3-4` は **骨子のみ（MDX なし）** | [PPL_Master_Syllabus.md](PPL_Master_Syllabus.md)、[content_outlines/PPL_Meteorology_2026/README.md](content_outlines/PPL_Meteorology_2026/README.md) |
| 記事↔Quiz 連携 | `learning_test_mapping`、Callout（CPL→PPL 復習）、Quiz 結果からの関連記事 | [08_Syllabus_Management_Guide.md](08_Syllabus_Management_Guide.md)「問題–記事連携契約」 |
| Quiz Hub `/test` | 科目選択・PPL/CPL 範囲フィルタ・SRS・Review・A2-a（科目 default 5問） | [02_System_Spec.md](02_System_Spec.md) |
| ゲーミフィケーション | 第1〜2期（習熟ジャーニー、SRS・遅延再テスト・弱点改善・編隊クエスト）、XP RPC、`learning_milestones` 台帳 | [02_System_Spec.md](02_System_Spec.md) |
| cohort 週次 | 週次ミッション・MVP/TOP3・in-app/Brevo 通知（cron 日曜 09:00 JST） | [02_System_Spec.md](02_System_Spec.md)、[04_Operations_Guide.md](04_Operations_Guide.md) |
| Profile Hub / MFA | 4 セクション IA、TOTP、リカバリーコード、アカウント削除 | [02_System_Spec.md](02_System_Spec.md)、ルート `DESIGN.md` |
| Planning | `computeNavLog` 一本化、Setup / Route / NavLog / Briefing、Debrief、SWIM NOTAM、航空機レイヤー（airplanes.live） | [02_System_Spec.md](02_System_Spec.md)、[Flight_Debrief_Tools.md](Flight_Debrief_Tools.md) |
| 3D 空域エクスプローラ | 隔離ルート `/explore/airspace-3d`（Cesium）。導線は NavLog カードヘッダー | [02_System_Spec.md](02_System_Spec.md) Flight Planning |
| Articles 基盤 | `virtual:articles-index`、記事 HTML prerender（OG）、日次公開 cron、週次 digest メール | [02_System_Spec.md](02_System_Spec.md)、[04_Operations_Guide.md](04_Operations_Guide.md) |
| CP シリーズ | `CP-1-1`〜`CP-5-5` の MDX。`CP-5-6`〜`5-9` は DB 行のみで **MDX なし** | [content_outlines/Contact_Transition_2026/README.md](content_outlines/Contact_Transition_2026/README.md) |
| FN（旧 FMT Season 1） | 1-1〜1-10 の MDX がストック（ファイル名・id は `FMT-1-*` のまま） | [content_outlines/FN_Formation_2026/README.md](content_outlines/FN_Formation_2026/README.md) |
| 週次テレメトリ | GA4 artifact → Slack Facts → docs PR → `APPROVE-DOC` | [ops/Weekly_Telemetry_Review.md](ops/Weekly_Telemetry_Review.md) |
| 監視 | Sentry（DSN）、GA4 `G-22VFYSM69J` 本番受信 | [04_Operations_Guide.md](04_Operations_Guide.md) |

撤去済み: Shop・アプリ内ギャラリー・体験搭乗（2026-04-12）。戦略上の扱いは [00_Flight_Academy_Strategy.md](00_Flight_Academy_Strategy.md) §6。

## 2. 壊してはいけないこと

| 不変条件 | 確認の仕方 |
|----------|------------|
| SPA 直打ち6パス（`/articles` `/planning` `/test` `/auth` `/auth?mode=signup` `/profile`）が Vercel `NOT_FOUND` にならない | `vercel.json` の rewrite を触らない。直打ちで `#root` |
| ハブ HTML に Cesium（`Cesium.js` / `vendor-cesium`）を全ページ注入しない | 3D は `/explore/airspace-3d` に隔離 |
| Planning 離脱後に Leaflet が残らない（unmount） | `/planning` → HOME・LOGIN・Mission |
| `award_article_read_xp` / `award_quiz_session_xp` が 403 に戻らない（2xx または `already_awarded`） | DEFINER impl + INVOKER ラッパー（[02](02_System_Spec.md)） |
| 学習カタログ（stats / comments / mapping / views）の 401、`learning_sessions` の CHECK 400 が戻らない | GRANT と CHECK を消さない |
| Quiz → Review が空に戻らない。記事の読了は本文末センチネル | [02](02_System_Spec.md) |
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
| Post_Exam_Action2_Action3_Policy_Memo | [02_System_Spec.md](02_System_Spec.md) の Quiz 節。「2週連続改善」は未判定で閉じた |

## 5. 参考として残した旧文書

| 文書 | 扱い |
|------|------|
| [Article_Coverage_Backlog.md](Article_Coverage_Backlog.md) | 2026-07 のマッピング・スナップショット。現行の数値は本書 §3 |
| [09_CPL_Learning_Stub.md](09_CPL_Learning_Stub.md) | CPL シリーズ索引。MDX から `/docs/` リンクされるため残す |
| [10_航空工学_学科試験攻略ブログ_ロードマップ.md](10_航空工学_学科試験攻略ブログ_ロードマップ.md) | 航空工学の単元対照。新規執筆計画ではない |
| [06_Long_Term_Execution.md](06_Long_Term_Execution.md) | 品質・分析の長期メモ。カバレッジ 50% などの数値目標は保留 |
