# PPL Subject 3・4（航法・通信）— Gemini 執筆索引（2026-07〜）

**構造正本**:
- 航法: [PPL_Subject3_Aerial_Navigation_Structure.md](../PPL_Subject3_Aerial_Navigation_Structure.md)
- 通信: [PPL_Subject4_Aviation_Communication_Structure.md](../PPL_Subject4_Aviation_Communication_Structure.md)

**共通ルール**: [External_LLM_Article_Brief.md](../../templates/External_LLM_Article_Brief.md)  
**深文化パイプライン**: Gemini 骨子（本目录）→ 草案 → Cursor レビュー → MDX + Supabase + build（Subject 2 と同型）

> **注**: `PPL-2-3-3` / `PPL-2-3-4` は **Subject 2 気象 Phase 2**（任意）。本索引は **Subject 3（空中航法）** と **Subject 4（航空通信）** が対象。

---

## 進め方（1 記事あたり）

0. **素案 MDX**（`src/content/lessons/PPL-3-*.mdx` / `PPL-4-*.mdx`）— `[執筆メモ]` 付き骨子。**`publishedAt` なし**＝未公開。
1. 下表の **Gemini ブリーフ** を Gemini に全文読み込ませる（**素案 MDX も添付可**）。
2. ブリーフ §「Gemini 依頼文」をコピペし、**Markdown 本文のみ**を出力させる（メタ・YAML なし）。
3. Cursor でレビュー → `docs/templates/PPL_Article_Template.mdx` に沿い **`export const meta`** 付与 → `src/content/lessons/PPL-3-*.mdx` / `PPL-4-*.mdx`。
4. [learning-contents-registration](../../../.cursor/skills/learning-contents-registration/SKILL.md) で `learning_contents` 登録。
5. 対応 CPL に **PPL 復習 Callout** を追記（構造案 §7/§CPL 表）。

**内部リンク**: `/articles/{ファイル stem}`（例: `/articles/PPL-3-1-1_EarthCoordinatesAndTime`）。

**トーンサンプル**: [PPL-2-3-2_MetarTafAndWeatherReports](../../src/content/lessons/PPL-2-3-2_MetarTafAndWeatherReports.mdx) または CPL [3.4.1](../../src/content/lessons/3.4.1_DeadReckoning.mdx) / [3.5.3](../../src/content/lessons/3.5.3_RadioCommunication.mdx) の「概要」1 節。

---

## Subject 3 — 空中航法 Phase 1（9 本・執筆順）

| 順 | stem | order | ブリーフ | 状態 |
|----|------|-------|----------|------|
| 1 | `PPL-3-1-1_EarthCoordinatesAndTime` | 301 | [PPL-3-1-1_gemini_brief.md](PPL-3-1-1_gemini_brief.md) | **公開済** |
| 2 | `PPL-3-1-2_NavigationElementsAndAltitude` | 302 | [PPL-3-1-2_gemini_brief.md](PPL-3-1-2_gemini_brief.md) | **公開済** |
| 3 | `PPL-3-1-3_AeronauticalChartsBasics` | 303 | [PPL-3-1-3_gemini_brief.md](PPL-3-1-3_gemini_brief.md) | **公開済** |
| 4 | `PPL-3-1-4_WindTriangleAndFlightComputer` | 304 | [PPL-3-1-4_gemini_brief.md](PPL-3-1-4_gemini_brief.md) | **公開済** |
| 5 | `PPL-3-1-5_FlightPlanningBasics` | 305 | [PPL-3-1-5_gemini_brief.md](PPL-3-1-5_gemini_brief.md) | **公開済** |
| 6 | `PPL-3-2-1_PilotageAndPositionFix` | 306 | [PPL-3-2-1_gemini_brief.md](PPL-3-2-1_gemini_brief.md) | **公開済** |
| 7 | `PPL-3-2-2_RadioNavigationOverview` | 307 | [PPL-3-2-2_gemini_brief.md](PPL-3-2-2_gemini_brief.md) | **公開済** |
| 8 | `PPL-3-3-1_VfrOperationsAndAirspace` | 308 | [PPL-3-3-1_gemini_brief.md](PPL-3-3-1_gemini_brief.md) | **素案 MDX 済** |
| 9 | `PPL-3-3-2_SpatialDisorientationBasics` | 309 | [PPL-3-3-2_gemini_brief.md](PPL-3-3-2_gemini_brief.md) | **素案 MDX 済** |

---

## Subject 4 — 航空通信 Phase 1（8 本・執筆順）

| 順 | stem | order | ブリーフ | 状態 |
|----|------|-------|----------|------|
| 1 | `PPL-4-1-1_AirTrafficServicesOverview` | 401 | [PPL-4-1-1_gemini_brief.md](PPL-4-1-1_gemini_brief.md) | **素案 MDX 済** |
| 2 | `PPL-4-2-1_RadioPhraseologyBasics` | 403 | [PPL-4-2-1_gemini_brief.md](PPL-4-2-1_gemini_brief.md) | **素案 MDX 済** |
| 3 | `PPL-4-2-2_ClearanceReadbackBasics` | 404 | [PPL-4-2-2_gemini_brief.md](PPL-4-2-2_gemini_brief.md) | **素案 MDX 済** |
| 4 | `PPL-4-2-3_AerodromeControlBasics` | 405 | [PPL-4-2-3_gemini_brief.md](PPL-4-2-3_gemini_brief.md) | **素案 MDX 済** |
| 5 | `PPL-4-2-4_FlightPlanFilingBasics` | 406 | [PPL-4-2-4_gemini_brief.md](PPL-4-2-4_gemini_brief.md) | **素案 MDX 済** |
| 6 | `PPL-4-1-2_SearchAndRescueBasics` | 402 | [PPL-4-1-2_gemini_brief.md](PPL-4-1-2_gemini_brief.md) | **素案 MDX 済** |
| 7 | `PPL-4-3-1_CommFailureAndLightSignals` | 407 | [PPL-4-3-1_gemini_brief.md](PPL-4-3-1_gemini_brief.md) | **素案 MDX 済** |
| 8 | `PPL-4-3-2_MaydayPanPanBasics` | 408 | [PPL-4-3-2_gemini_brief.md](PPL-4-3-2_gemini_brief.md) | **素案 MDX 済** |

※ 執筆順は [Subject 4 構造案 §6](../PPL_Subject4_Aviation_Communication_Structure.md)（401→403→…→408）。表の `order` 列は `meta.order` / DB `order_index` 用。

---

## 取り込みチェックリスト

- [ ] `meta.order` が構造案 §3 と一致（3xx / 4xx）
- [ ] `tags` に `PPL`, `学科試験`, `空中航法` または `航空通信`
- [ ] 学習目標 **3 項目**、Check Six **3〜4 問**
- [ ] `/articles/...` リンク stem 正本どおり
- [ ] `export default` + 運用 `Callout`（航法/通信/緊急）
- [ ] `npm run build` 成功
- [ ] `learning_contents` + 必要な `learning_test_mapping`
- [ ] [PPL_Master_Syllabus.md](../../PPL_Master_Syllabus.md) §3 / §4 チェック更新

---

### 変更履歴

| 日付 | 内容 |
|------|------|
| 2026-07-07 | **素案 MDX 17 本**（`src/content/lessons/PPL-3-*`×9 + `PPL-4-*`×8）。`publishedAt` なし |
| 2026-07-06 | 初版。Subject 3 Phase 1×9 + Subject 4 Phase 1×8 骨子索引 |
