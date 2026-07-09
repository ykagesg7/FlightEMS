# Subject 3 空中航法 — PPL 記事の全体像と CPL との対応（構造案）

**用途**: CPL シリーズ `3.4.1`〜`3.4.7` を土台に、**PPL 学科（Master Syllabus Subject 3）**向け記事ツリーを設計するときのブリーフ。正本チェックリストは **[PPL_Master_Syllabus.md](../PPL_Master_Syllabus.md)** §3。コンテンツ原則は **[00 §4](../00_Flight_Academy_Strategy.md)**（**航法・計算・用語の更新は原則 PPL 側を正本**）。

**Gemini 執筆の入口**: [PPL_Navigation_Communication_2026/README.md](PPL_Navigation_Communication_2026/README.md)（Phase 1 ブロック索引）。

---

## 1. 結論ファースト（どう割るべきか）

| 視点 | 推奨 |
|------|------|
| **1 CPL 記事 ↔ 1 PPL 記事** | **採らない**。CPL `3.4.x` は試験特化・深文化済み **7 本**。PPL は Master §3 の **Phase 1 = 9 記事**（10 論点を束ね）で**平易な正本**を置く。 |
| **正本になるツリー** | **PPL は Master の 3-1〜3-3**。CPL `3.4.x` は各節への **「深掘り・試験特化」ハブ**。数値・用語の更新は **PPL を先に**。 |
| **読み順** | **地球・要素・高度 → 図と風力三角 → 計画 → 地文・機位 → 無線航法 → VFR/空域 → 空間識**。人間工学（HP）は **Phase 2**（設問 **97 問**クラスタが最大）。 |
| **法規との境界** | 空域・VFR の**条文正本**は [PPL-5-4-1](../src/content/lessons/PPL-5-4-1_AirspaceAndFacilitiesOverview.mdx)。3-3-1 は **航法・運航実務の読み方**に集中し、法規へ `/articles/` リンク。 |
| **工学との接続** | 高度・ピトー静圧 → [PPL-1-2-2](../src/content/lessons/PPL-1-2-2_PitotStatic.mdx)。IAS/TAS → [PPL-1-1-2](../src/content/lessons/PPL-1-1-2_AirspeedBasics.mdx)。 |

---

## 2. CPL 7 本の「役割」サマリ（リンク設計の出発点）

| CPL ID | メタ上の軸（要約） | PPL Phase 1 の受け皿 | `meta.order`（CPL 航法） |
|--------|-------------------|----------------------|------------------------|
| [3.4.1](../../src/content/lessons/3.4.1_DeadReckoning.mdx) | DR・針路・距離・時間 | **3-1-1**〜**3-1-2**、**3-2-1** | 1 |
| [3.4.2](../../src/content/lessons/3.4.2_VORNavigation.mdx) | VOR 航法 | **3-2-2**（VOR 節） | 2 |
| [3.4.3](../../src/content/lessons/3.4.3_GPSNavigation.mdx) | GNSS/GPS | **Phase 2** `PPL-3-2-3` または 3-2-2 増補 | 3 |
| [3.4.4](../../src/content/lessons/3.4.4_FlightPlanning.mdx) | 飛行計画・航法計算 | **3-1-4**〜**3-1-5** | 4 |
| [3.4.5](../../src/content/lessons/3.4.5_NDBNavigation.mdx) | NDB/ADF | **3-2-2**（NDB 節） | 5 |
| [3.4.6](../../src/content/lessons/3.4.6_DMENavigation.mdx) | DME | **3-2-2**（DME 節） | 6 |
| [3.4.7](../../src/content/lessons/3.4.7_DeadReckoningAdvanced.mdx) | DR 応用 | **Phase 2** または 3-2-1 増補 | 7 |

**入口ハブ**: [CPL-Hub-Navigation](../../src/content/lessons/CPL-Hub-Navigation.mdx)（存在する場合）または各 `3.4.x` — PPL Phase 1 完了後に **「PPL 復習」Callout** を追加。

---

## 3. Master Syllabus Subject 3（30 トピック）→ **Phase 1 記事 9 本**

[07 §3](../PPL_Master_Syllabus.md) の Phase 1 チェック（10 論点）を **9 MDX** に束ねる。Phase 2/3 は stem 追加または節増分。

| 記事 # | 推奨 stem | `order` | 07 で束ねるトピック | 主な DB クラスタ（PPL） | 主な張る CPL |
|--------|-----------|---------|---------------------|-------------------------|--------------|
| 1 | `PPL-3-1-1_EarthCoordinatesAndTime.mdx` | **301** | 航法種類、地球、緯経度、大圏小圏、UTC/JST | 地球について(15)、時間(6) | 3.4.1 |
| 2 | `PPL-3-1-2_NavigationElementsAndAltitude.mdx` | **302** | 針路・航跡・速度、NM、各種高度 | 航法要素(18)、高度(26) | 3.4.1, PPL-1-2-2 |
| 3 | `PPL-3-1-3_AeronauticalChartsBasics.mdx` | **303** | 航空図：投影法、縮尺、記号 | 航空図(13)、投影法(17) | 3.4.1, 3.4.4 |
| 4 | `PPL-3-1-4_WindTriangleAndFlightComputer.mdx` | **304** | 風力三角形、WCA、計算尺 | 風力三角形(15)、航法計算(7) | 3.4.4 |
| 5 | `PPL-3-1-5_FlightPlanningBasics.mdx` | **305** | 燃料、所要時間、計画の型 | 航法計算(7) | 3.4.4 |
| 6 | `PPL-3-2-1_PilotageAndPositionFix.mdx` | **306** | 機位確認、地文航法、Fix | 機位の確認(2) | 3.4.1, 3.4.7 |
| 7 | `PPL-3-2-2_RadioNavigationOverview.mdx` | **307** | VOR、DME、NDB、ILS 概要 | 航法計器(1) ※mapping 要追補 | 3.4.2, 3.4.5, 3.4.6 |
| 8 | `PPL-3-3-1_VfrOperationsAndAirspace.mdx` | **308** | VFR、VMC、管制圏・PCA（航法視点） | （法規と分担 — mapping は 5-4-1 優先） | 3.1.5, PPL-5-4-1 |
| 9 | `PPL-3-3-2_SpatialDisorientationBasics.mdx` | **309** | 空間識失調の分類と対策 | 空間識失調/分類(12)、飛行への適合性(11) | （CPL 直接薄い・PPL 駆動） |

**`order_index` 運用**: **`3xx` = Subject 3**。[`register_ppl_article.mjs`](../../scripts/database/register_ppl_article.mjs) は執筆時に `PPL-3-*` → `sub_category`: **空中航法** を追加する。

---

## 4. Phase 2 / Phase 3（記事候補・後追い）

| 07 Phase | 代表トピック | 推奨 stem（案） | 備考 |
|----------|--------------|-----------------|------|
| **Phase 2** | 磁気偏差・自差、ETOA 修正 | `PPL-3-2-3_MagneticHeadingAndEtaCorrection.mdx`（310） | 針路の決定(10) |
| **Phase 2** | GNSS、RAIM | `PPL-3-2-4_GnssBasics.mdx`（311） | 3.4.3 |
| **Phase 2** | AIP、NOTAM、AIC | `PPL-3-3-3_AeronauticalInformationBasics.mdx`（312） | 通信 3.5.2 と相互リンク |
| **Phase 2** | 低酸素症、過呼吸、視覚、ADM、TEM | `PPL-3-3-4`〜`3-3-6` または HP ハブ 1 本 + 増補 | **人間の能力…(97 問)** — 最大クラスタ |
| **Phase 3** | CRM/TEM 深化 | 07 §3 未チェックを MCP 分布で再優先 | |

---

## 5. メタデータ・シリーズ

- **`export const meta`**: `type: 'lesson'`, **`series`: `'PPL-Master-Syllabus'`**, `tags` に **`'空中航法'`** を必ず含む。
- **`slug`**: kebab（例: `ppl-3-1-1-earth-coordinates-and-time`）。`learning_contents.id` = ファイル stem。
- **トーン**: 道真（博多弁）。比喩は九州・福岡優先（[mdx-article-guide.mdc](../../.cursor/rules/mdx-article-guide.mdc)）。
- **Check Six**: 設問 3〜4 問。CPL ほどの長文 stem 引用は不要（3,000〜5,500 字目標）。
- **深文化パイプライン**: Gemini 骨子 → 草案 → Cursor レビュー → MDX + `learning_contents` + build（Subject 2 と同型）。

---

## 6. 推奨執筆順（Phase 1）— **完走** ✅ 2026-07-09

1. **`PPL-3-1-1`** — ✅ 全シリーズ入口。
2. **`PPL-3-1-2`** — ✅ 高度は PPL-1-2-2 復習リンク。
3. **`PPL-3-1-3`** → **`PPL-3-1-4`** → **`PPL-3-1-5`** — ✅ 図→風→計画。
4. **`PPL-3-2-1`** → **`PPL-3-2-2`** — ✅ 地文のあと無線。
5. **`PPL-3-3-1`** — ✅ 法規 `PPL-5-4-1` へ相互リンク。
6. **`PPL-3-3-2`** — ✅ Phase 1 締め。

**次フェーズ**: Subject 4 通信 Phase 1（[骨子索引](PPL_Navigation_Communication_2026/README.md) §Subject 4）。Subject 3 Phase 2（磁気偏差・GNSS・HP 深化）は後追い。

---

## 7. CPL ↔ PPL リンク更新バックログ

| CPL 記事 | PPL Callout | 備考 |
|----------|-------------|------|
| 3.4.1 | **要追補** | `PPL-3-1-1`〜`2`・`3-2-1` 公開済 — W29 候補 |
| 3.4.2 / 3.4.5 / 3.4.6 | **要追補** | `PPL-3-2-2` 公開済 — W29 候補 |
| 3.4.4 | 部分（PPL 飛行計画 Callout あり） | `PPL-3-1-5` で差し替え・追加検討 |

---

### 関連ドキュメント

- [PPL_Subject4_Aviation_Communication_Structure.md](PPL_Subject4_Aviation_Communication_Structure.md) — Subject 4（並行シリーズ）
- [PPL_Master_Syllabus.md](../PPL_Master_Syllabus.md) — Subject 3 チェックリスト
- [templates/PPL_Article_Template.mdx](../templates/PPL_Article_Template.mdx)

### 変更履歴

| 日付 | 内容 |
|------|------|
| 2026-07-09 | Phase 1 **9/9 完走**。§6 完走マーク。§7 CPL Callout を W29 追補候補に更新。 |
| 2026-07-06 | 初版：CPL 3.4.x × Master §3 を 9 記事にマトリクス化、Gemini 骨子索引、DB クラスタ MCP 反映 |
