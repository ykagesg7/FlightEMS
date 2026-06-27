# Subject 2 航空気象 — PPL 記事の全体像と CPL との対応（構造案）

**用途**: CPL シリーズ `3.3.1`〜`3.3.12` を土台に、**PPL 学科（Master Syllabus Subject 2）**向け記事ツリーを設計するときのブリーフ。正本チェックリストは **[PPL_Master_Syllabus.md](../PPL_Master_Syllabus.md)** §2。コンテンツ原則は **[00 §4](../00_Flight_Academy_Strategy.md)**（PPL/CPL の棲み分け・**気象の定義・用語の更新は原則 PPL 側を正本**）。

**Gemini 執筆の入口**: [PPL_Meteorology_2026/README.md](PPL_Meteorology_2026/README.md)（Phase 1 ブロック A/B のブリーフ索引）。

---

## 1. 結論ファースト（どう割るべきか）

| 視点 | 推奨 |
|------|------|
| **1 CPL 記事 ↔ 1 PPL 記事** | **採らない**。CPL `3.3.x` は試験特化・キャラ調の**深文化済み 12 本**。PPL は **[07 §2](../PPL_Master_Syllabus.md)** の **Phase 1 = 12 記事単位**で、平易な**正本**を置く。 |
| **正本になるツリー** | **PPL は Master の 2-1〜2-3**。CPL `3.3.x` は各節への **「深掘り・試験特化」のハブ**。数値・用語の更新は **PPL を先に**、CPL は Callout で追随。 |
| **読み順** | **大気の物理（ISA→安定度→雲霧）→ 大気の運動（風→前線→気圧系）→ 障害と気象情報**。工学の [PPL-1-1-1](../src/content/lessons/PPL-1-1-1_TemperatureBasics.mdx)（華氏・温度）と [PPL-1-2-2](../src/content/lessons/PPL-1-2-2_PitotStatic.mdx)（高度計）から自然に接続する。 |
| **2026-07 以降の短期** | Phase C **C-7** に沿い、**Subject 2 Phase 1 の 12 本**を Gemini 下書き → リポジトリ取り込み → `learning_contents` 登録。CPL **マッピング精緻化（C-6）** と並行（[01 §2026年7月期](../01_Current_Status_and_Roadmap.md)）。 |

---

## 2. CPL 12 本の「役割」サマリ（リンク設計の出発点）

| CPL ID | メタ上の軸（要約） | PPL でのおもな受け皿 | `meta.order`（CPL 気象シリーズ） |
|--------|-------------------|----------------------|----------------------------------|
| [3.3.1](../../src/content/lessons/3.3.1_StandardAtmosphere.mdx) | ISA・大気構造・海霧 | **2-1**: 大気・温度・気圧の**数値の正本** | 1 |
| [3.3.2](../../src/content/lessons/3.3.2_CloudsAndPrecipitation.mdx) | 雲と降水のメカニズム | **2-1-6** 雲 | 2 |
| [3.3.3](../../src/content/lessons/3.3.3_FrontsAndWeatherSystems.mdx) | 前線・気団・日本の季節前線 | **2-2-2** 気団・前線 | 3 |
| [3.3.4](../../src/content/lessons/3.3.4_LowPressureSystems.mdx) | 低気圧・台風 | **2-2-3** 気圧系・台風 | 4 |
| [3.3.5](../../src/content/lessons/3.3.5_AtmosphericStability.mdx) | 大気の安定・不安定 | **2-1-5** 安定度 | 5 |
| [3.3.6](../../src/content/lessons/3.3.6_AtmosphericComposition.mdx) | 大気組成 | **2-1-1** 大気（組成節） | 6 |
| [3.3.7](../../src/content/lessons/3.3.7_WesterliesAndWind.mdx) | 偏西風・風系 | **2-2-1** 風（Phase 2 で地衡風等を厚く） | 7 |
| [3.3.8](../../src/content/lessons/3.3.8_ICAOStandardAtmosphere.mdx) | ICAO 標準大気（詳細） | **2-1-1** の ICAO 節 or Phase 2 増補 | 8 |
| [3.3.9](../../src/content/lessons/3.3.9_WeatherHazards.mdx) | 気象障害総合 | **2-3-1** 障害（分割記事と相互リンク） | 9 |
| [3.3.10](../../src/content/lessons/3.3.10_CloudTypes.mdx) | 十種雲形 | **2-1-6** 雲（分類表） | 10 |
| [3.3.11](../../src/content/lessons/3.3.11_VisibilityAndFog.mdx) | 視程・霧 | **2-1-7** 霧、**2-3-1** 視程障害 | 11 |
| [3.3.12](../../src/content/lessons/3.3.12_Turbulence.mdx) | 乱気流 | **2-3-1** 乱気流節 | 12 |

**入口ハブ**: [CPL-Hub-Meteorology](../../src/content/lessons/CPL-Hub-Meteorology.mdx)、[weather_basics](../../src/content/lessons/weather_basics.mdx) — PPL Phase 1 完了後に CPL ハブへ **「PPL 復習」** Callout を増やす。

---

## 3. Master Syllabus Subject 2（35 トピック）→ **Phase 1 記事 12 本**

[07 §2](../PPL_Master_Syllabus.md) の Phase 1 チェック項目（20 論点）を **12 MDX** に束ねる最小セット。Phase 2/3 は同 stem への節増分 or 新 stem で後追い。

| 記事 # | 推奨 stem | `meta.order` | 07 で束ねるトピック | 主な張る CPL |
|--------|-----------|--------------|---------------------|--------------|
| 1 | `PPL-2-1-1_AtmosphereAndIsaBasics.mdx` | **201** | 大気：組成・鉛直構造・ISA | 3.3.1, 3.3.6, 3.3.8 |
| 2 | `PPL-2-1-2_TemperatureLapseAndInversion.mdx` | **202** | 温度：伝熱・気温減率・逆転層 | 3.3.1, 3.3.5 |
| 3 | `PPL-2-1-3_PressureAltimeterSettings.mdx` | **203** | 気圧：QNH/QNE/QFE・高度計誤差 | 3.3.1, [PPL-1-2-2](../src/content/lessons/PPL-1-2-2_PitotStatic.mdx) |
| 4 | `PPL-2-1-4_MoistureHumidityDewpoint.mdx` | **204** | 水分：潜熱・湿度・露点 | 3.3.2, 3.3.5 |
| 5 | `PPL-2-1-5_AtmosphericStabilityBasics.mdx` | **205** | 安定度：断熱減率・状態曲線・判定 | 3.3.5 |
| 6 | `PPL-2-1-6_CloudTypesAndFormation.mdx` | **206** | 雲：十種・発生成長 | 3.3.2, 3.3.10 |
| 7 | `PPL-2-1-7_FogTypesAndFormation.mdx` | **207** | 霧：放射・移流・蒸気・前線霧 | 3.3.11 |
| 8 | `PPL-2-2-1_WindObservationBasics.mdx` | **211** | 風：観測・通報 | 3.3.7 |
| 9 | `PPL-2-2-2_AirMassesAndFronts.mdx` | **212** | 気団・前線・梅雨/秋雨前線 | 3.3.3 |
| 10 | `PPL-2-2-3_PressureSystemsAndJapanWeather.mdx` | **213** | 高低気圧・温帯低気圧・台風概要 | 3.3.3, 3.3.4 |
| 11 | `PPL-2-3-1_FlightWeatherHazardsBasics.mdx` | **221** | 乱気流・雷雲・着氷・視程障害 | 3.3.9, 3.3.11, 3.3.12 |
| 12 | `PPL-2-3-2_MetarTafAndWeatherReports.mdx` | **222** | 気象通報・METAR/SPECI/TAF 入門 | （CPL 直接対応薄い。**PPL 駆動**） |

**`order_index` 運用**: Subject 5 と同型で **`2xx` = Subject 2**。[`register_ppl_article.mjs`](../../scripts/database/register_ppl_article.mjs) は `PPL-2-*` の `sub_category` を **航空気象** とするよう執筆後に更新する（現状は Subject 5 のみ自動）。

---

## 4. Phase 2 / Phase 3（記事候補・後追い）

Master の Phase 2（15 論点）・Phase 3（8 論点）は、Phase 1 本文化後に **stem 追加**または **Phase 1 記事への節増分**で対応する。

| 07 Phase | 代表トピック | 推奨対応（案） |
|----------|--------------|----------------|
| **Phase 2** | 風の原因（気圧傾度・コリオリ・摩擦）、地衡風、海陸風 | `PPL-2-2-4_WindDynamicsBasics.mdx`（order 214）または 2-2-1 増補 |
| **Phase 2** | ウィンドシアー、火山灰 | `PPL-2-3-3_WindShearAndVolcanicAsh.mdx`（223） |
| **Phase 2** | SIGMET/AIRMET、天気図 | `PPL-2-3-4_SigmetAndWeatherChartsIntro.mdx`（224） |
| **Phase 3** | 用語集・体系網羅の穴埋め | 07 §2 の未チェック行を MCP 設問分布で再優先 |

---

## 5. メタデータ・シリーズ

- **`export const meta`**: `type: 'lesson'`, **`series`: `'PPL-Master-Syllabus'`**, `tags` に **`'航空気象'`** を必ず含む。
- **`slug`**: kebab（例: `ppl-2-1-1-atmosphere-isa-basics`）。`learning_contents.id` = ファイル stem。
- **CPL 側の追随**: 各 `3.3.x` の既存 **「PPLからの復習」Callout**（例: [3.3.1](../src/content/lessons/3.3.1_StandardAtmosphere.mdx) → `PPL-1-1-1`）を、Phase 1 本文化後に **対応する `PPL-2-*` へ差し替え・追加**する。
- **工学との接続**:
  - 温度・華氏: [PPL-1-1-1](../src/content/lessons/PPL-1-1-1_TemperatureBasics.mdx) ← **2-1-2 からリンク**
  - ピトー静圧・高度: [PPL-1-2-2](../src/content/lessons/PPL-1-2-2_PitotStatic.mdx) ← **2-1-3 からリンク**
  - 機体着氷（工学）: [PPL-1-2-1](../src/content/lessons/PPL-1-2-1_GyroBasics.mdx) 系ではなく **1-2-1 着氷**（未執筆）— **2-3-1** では**大気側着氷**に集中し、機体防止は工学 Phase 1 未執筆トピックへ将来リンク。

---

## 6. 執筆・Gemini 委譲ルール

1. **ブリーフ正本**: [External_LLM_Article_Brief.md](../templates/External_LLM_Article_Brief.md) — YAML 禁止、Markdown 本文のみ、条文断定なし。
2. **トーン**: 既存 PPL/CPL 気象記事の **道真（博多弁）** に合わせる。比喩は **九州・福岡**優先（[mdx-article-guide.mdc](../../.cursor/rules/mdx-article-guide.mdc)）。
3. **試験問題**: PPL 記事でも **設問 2〜3 問の「型」**を `Check Six` 節に置いてよいが、**CPL ほどの長文引用は不要**（3,000〜5,000 字目安）。
4. **DB**: 公開時 [`learning-contents-registration` Skill](../../.cursor/skills/learning-contents-registration/SKILL.md)。`learning_test_mapping` は **`applicable_exams` に PPL** を含むクラスタから後追い（[08](../08_Syllabus_Management_Guide.md)）。
5. **取り込み後**: `meta.slug`・`npm run build`・CPL 側 Callout 更新要否を [PPL_Meteorology_2026/README.md](PPL_Meteorology_2026/README.md) チェックリストで確認。

---

## 7. 推奨ロードマップ（Gemini 執筆順）

**ブロック A（大気の物理・7 本）** — 依存順。CPL リンクが最も自然。

1. **`PPL-2-1-1`** — 全シリーズの入口。`3.3.1` / `3.3.6` へ **「CPL で深掘り」** 扉。
2. **`PPL-2-1-2`** — `PPL-1-1-1` 復習リンク必須。
3. **`PPL-2-1-3`** — `PPL-1-2-2` 復習リンク必須。
4. **`PPL-2-1-4`** → **`PPL-2-1-5`** → **`PPL-2-1-6`** → **`PPL-2-1-7`**

**ブロック B（運動・障害・情報・5 本）** — ブロック A 完了後。

8. **`PPL-2-2-1`** → **`PPL-2-2-2`** → **`PPL-2-2-3`**
11. **`PPL-2-3-1`** → **`PPL-2-3-2`**

**週次目安（Phase C 後半）**: ブロック A **2 本/週** × 4 週 + ブロック B **2 本/週** × 3 週（CPL マッピング週とトレードオフ可）。

---

## 8. CPL ↔ PPL リンク更新バックログ（Phase 1 本文化後）

| CPL 記事 | PPL Callout（2026-06-27） | 備考 |
|----------|---------------------------|------|
| 3.3.1 | `PPL-2-1-1`・`2-1-2`・`2-1-3` + `PPL-1-1-1` | ✅ 更新済 |
| 3.3.2 | `PPL-2-1-4`・`PPL-2-1-1` | ✅ 追加済 |
| 3.3.5 | `PPL-2-1-4`・`PPL-2-1-2`・`PPL-2-1-5` | ✅ 更新済 |
| 3.3.6 | `PPL-2-1-4` | ✅ 追加済 |
| 3.3.8 | `PPL-2-1-1`・`PPL-2-1-3` | ✅ 追加済 |
| 3.3.10 | `PPL-2-1-4`（`2-1-6` 執筆予定） | ✅ 追加済 |
| 3.3.11 | `PPL-2-1-4`（`2-1-7` 執筆予定） | ✅ 追加済 |
| 3.3.3 / 3.3.4 | — | `PPL-2-2-2`・`2-2-3` 執筆後 |
| 3.3.12 | — | `PPL-2-3-1` 執筆後 |
| 3.1.x（法規） | — | `PPL-5-*` Callout は **未着手**（`learning_test_mapping` は 14 本済） |

---

### 関連ドキュメント

- [PPL_Master_Syllabus.md](../PPL_Master_Syllabus.md) — Subject 2 チェックリスト
- [PPL_Meteorology_2026/README.md](PPL_Meteorology_2026/README.md) — Gemini ブリーフ索引
- [01_Current_Status_and_Roadmap.md](../01_Current_Status_and_Roadmap.md) — Phase C 短期 KPI
- [templates/PPL_Article_Template.mdx](../templates/PPL_Article_Template.mdx)

### 変更履歴

| 日付 | 内容 |
|------|------|
| 2026-06-27 | §8 CPL ↔ PPL Callout 更新（3.3.1/2/5/6/8/10/11）。`learning_test_mapping` **PPL-2-1-1〜4**（[`20260627_learning_test_mapping_ppl_subject2_201_204.sql`](../scripts/database/20260627_learning_test_mapping_ppl_subject2_201_204.sql)） |
| 2026-06-24 | 初版：CPL 12 本 × Master §2 を 12 記事にマトリクス化、Gemini 執筆順・order 201〜222 |
