# CPL 学習記事スタブ（シリーズ索引）

**作成日**: 2026年3月  
**想定読者**: コンテンツ執筆者、学科対策を進める学習者、AI アシスタント

---

## このドキュメントの役割

[CPL-Learning-Stub](06_記事作成ロードマップ.md) シリーズに属する **CPL 学科向け MDX 記事**の入口です。各レッスンの `meta.series` が `CPL-Learning-Stub` の記事は、本文拡充前でも **クイズ結果からの関連記事**（`ReviewContentLink`）などで参照されます。

**航空法規 3.1.x**（`3.1.1_AviationLegal0` 〜 `3.1.8_AirportOperations`）は推奨読み順・ナビ用に **`meta.series: CPL-Aviation-Legal`**（`order` 1〜8）を別立てしている。工学科など他スタブの鎖とは独立する。

詳細な **シラバス・DB 契約・`learning_test_mapping` の書き方**は [08_Syllabus_Management_Guide.md](08_Syllabus_Management_Guide.md) を正とします。

---

## 記事ファイルの場所

- リポジトリ: `src/content/lessons/`
- アプリ上の URL: `/articles/{learning_content_id}`（例: `/articles/3.1.2_AviationLegal1`）

`contentId` は通常、ファイル名（拡張子なし）と一致します。

---

## シリーズに含まれる主な id（例）

| id | 科目イメージ |
|----|----------------|
| `3.1.1_AviationLegal0` 〜 `3.1.8_AirportOperations` | 航空法規シリーズ（MDX は `CPL-Aviation-Legal`。`learning_contents.order_index` は [20260411_learning_contents_cpl_aviation_legal_order.sql](../scripts/database/20260411_learning_contents_cpl_aviation_legal_order.sql) で 310〜317 に揃える） |
| `3.2.1_PropellerTheory` 〜 `3.2.6_InstrumentSystem` | 航空工学シリーズ |
| `engineering_basics` | 工学・航空力学クラスタ入口 |
| `CPL-Hub-Meteorology` / `Navigation` / `Communication` | 科目ハブ（広い束のマッピング） |

実際の公開タイトル・`learning_contents` 行は Supabase と MDX の `meta` を照合してください。

---

## クイズ誤答と記事のつながり（要約）

1. 設問は `unified_cpl_questions` の **`main_subject` / `sub_subject`（クラスタ）** で分類される。  
2. `learning_test_mapping` の各行に、その記事がカバーする設問の **UUID 配列**が載る。  
3. テスト結果で誤答 UUID が渡ると、**overlaps** でマッピング行がヒットし、対応する記事が推薦される。

**執筆と DB をセットで揃える**必要があります（詳細は [08](08_Syllabus_Management_Guide.md)）。

---

## 関連ドキュメント

- [06_記事作成ロードマップ.md](06_記事作成ロードマップ.md) — 記事作成のフェーズと優先度  
- [08_Syllabus_Management_Guide.md](08_Syllabus_Management_Guide.md) — 分類の正本・マッピング SQL の考え方  
- [10_航空工学_学科試験攻略ブログ_ロードマップ.md](10_航空工学_学科試験攻略ブログ_ロードマップ.md) — 工学系ブログ・記事計画（該当する場合）

---

## 静的配信（Web アプリ）

本番・開発サーバーでは `public/docs/` に同内容および関連ファイル（`06`・`08`・`10`・`14` 等）が置かれ、`/docs/09_CPL_Learning_Stub.md` からブラウザで閲覧できます。編集の正本は常に `docs/` です。`public/docs/` は **`npm run sync:public-docs`**（または `npm run build` の `prebuild`）で上書き同期してください。
