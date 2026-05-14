# Subject 5 航空法規 — PPL 記事の全体像と CPL との対応（構造案）

**用途**: CPL シリーズ `3.1.1`〜`3.1.8` を土台に、**PPL 学科（Master Syllabus Subject 5）**向け記事ツリーを設計するときのブリーフ。正本チェックリストは **[PPL_Master_Syllabus.md](../PPL_Master_Syllabus.md)** §5。コンテンツ原則は **[00 §4](../00_Flight_Academy_Strategy.md)**（PPL/CPL の棲み分け・**法令・定義の更新は原則 PPL 側を正本**）。

---

## 1. 結論ファースト（どう割るべきか）

| 視点 | 推奨 |
|------|------|
| **1 CPL 記事 ↔ 1 PPL 記事** | **採らない**。CPL は試験用にトピックを**記事単位で分割済み**だが、PPL は **[07 §5](../PPL_Master_Syllabus.md)** の Phase（1=8本相当の優先、2、3）で**異なる粒度**になりやすい。 |
| **正本になるツリー** | **PPL は Master の 5-1〜5-4**。CPL `3.1.x` は各節への **「深掘り・試験特化」のハブ**。更新・定義の追従は [00 §4](../00_Flight_Academy_Strategy.md) どおり **PPL を先に**。 |
| **読み順** | PPL：**定義・体系 → 人（資格・身体）→ 物（機体・登録は Phase 2）→ 運用（空域・空港・機長義務・安全阻害・報告）**。CPL と数字が一致しないのは正常。 |

---

## 2. CPL 8 本の「役割」サマリ（リンク設計の出発点）

| CPL ID | メタ上の軸（要約） | PPL でのおもな受け皿 |
|--------|-------------------|----------------------|
| [3.1.1](../../src/content/lessons/3.1.1_AviationLegal0.mdx) | 法体系・読み型・階層 | **5-1**: 総則・定義。**入口ハブ**。 |
| [3.1.2](../../src/content/lessons/3.1.2_AviationLegal1.mdx) | 技能証明・SPC の枠組み | **5-3**: 技能証明 + **5-4**: 特定操縦技能（一本化または二分割は執筆方針で選択） |
| [3.1.3](../../src/content/lessons/3.1.3_AviationLegal2.mdx) | 航空身体検査証明 | **5-3**: 航空身体検査 |
| [3.1.4](../../src/content/lessons/3.1.4_AviationLegal3.mdx) | 耐空証明・運航との境界・最低高度の導線 | **5-2**（耐空性）中心 + **5-4** と境界が重なる運航側は短文で張る |
| [3.1.5](../../src/content/lessons/3.1.5_AirspaceClassification.mdx) | 空域分類・クラスC 等 | **5-4**: 空域と施設 |
| [3.1.6](../../src/content/lessons/3.1.6_IFRMinimumAltitude.mdx) | IFR の最低高度 | **PPL 主読者より CPL 比重が高い**。[07 §5](../PPL_Master_Syllabus.md) は IFR を独立トピックで切り出していない → **短文「計器運航との違い（任意）」+ CPL への扉** でよい |
| [3.1.7](../../src/content/lessons/3.1.7_FlightRules.mdx) | 運航規則・VFR と雲との距離等 | **5-4**: 運航（機長権限・出発前確認・禁止区域 と**内容が重なる単元は統合または相互リンクのみ**） |
| [3.1.8](../../src/content/lessons/3.1.8_AirportOperations.mdx) | 空港運用・滑走路誤進入 | **5-4**: 飛行場に接続。**空域記事との重複は「天上」と「地上・離着陸シーン」で役割分担** |

---

## 3. Master Syllabus Subject 5（20トピック）への「記事候補」マトリクス

チェックリストの行を満たす **最小セット** を先に決め、その後 Phase 2/3 で厚くする方針が [07](../PPL_Master_Syllabus.md) と整合しやすい。

### Phase 1（Master では 8 トピック）— 優先で「PPL 正本」を置くべき論点

| 07 のトピック | 推奨 PPL stem（命名例） | 主な張る CPL | メモ |
|---------------|-------------------------|---------------|------|
| 総則：定義 | `PPL-5-1-1_AviationLawDefinitions.mdx` | 3.1.1 | 階層・用語。**e-Gov 追いやすくする正本**。 |
| 技能証明 | `PPL-5-3-1_PilotCertificateBasics.mdx` | 3.1.2 | 種類・範囲・欠格の**読み方**。 |
| 航空身体検査 | `PPL-5-3-2_MedicalCertificateBasics.mdx` | 3.1.3 | 交付・更新・実務的注意。 |
| 空域と施設（航空路等） | `PPL-5-4-1_AirspaceAndFacilitiesOverview.mdx`（＋任意で飛行場地上を `PPL-5-4-6_…` に分割、[§4.1](#41-空域と飛行場地上の分割任意)） | 3.1.5, 3.1.8 | **クラス／制限／航空路**を主役にし、空港地上は分量次第で別記事。 |
| 運航：機長の権限等 | `PPL-5-4-2_CaptainAuthorityAndPreflight.mdx` | 3.1.7 | 権限・出発前・禁止区域。**雲との距離**は別記事化も可。 |
| 特定操縦技能 | `PPL-5-4-3_RecurrentProficiencyOverview.mdx` | 3.1.2 | **免許記事と一本化するか**：分量が増えれば分割。 |
| 安全阻害行為 | `PPL-5-4-4_SafetyEndangeringProhibitions.mdx` | 3.1.7 | 粗暴操縦・飲酒等。 |
| 事故報告 | `PPL-5-4-5_AccidentIncidentReportingBasics.mdx` | 3.1.7 | 「いつ・誰が・何を」を PPL で短く確定させる |

### Phase 2（追加 8 トピック）— 別記事 or Phase1 の節増分

| 07 のトピック | 推奨対応 | 主な張る CPL |
|---------------|-----------|---------------|
| シカゴ条約 | `PPL-5-1-2_ChicagoConventionOverview.mdx`（または 5-1-1 の後半） | 3.1.1（体系的補強） |
| 登録 | `PPL-5-2-1_AircraftNationalityAndRegistration.mdx` | 3.1.4 |
| 耐空性・整備 | `PPL-5-2-2_AirworthinessAndMaintenanceOverview.mdx` | 3.1.4 |
| 航空英語 | `PPL-5-3-3_AviationEnglishRequirements.mdx` | CPL 側の直接対応記事なし。**PPL駆動で新規** |

※ **3.1.6（IFR 最低高度）** は、[07 Phase 1](../PPL_Master_Syllabus.md) に独立ノードがないため、**(A)** `PPL-5-4-2` に「VISUAL と計器運航で何が変わるか」程度の短文枠、`/articles/3.1.6_IFRMinimumAltitude` で深掘り、または **(B)** Phase 3 向け **`PPL-5-*-*_IFRIntroMinimumAltitude.mdx`** とする、の二等分が現実的。

---

## 4. メタデータ・シリーズの決め方

- **`export const meta`**: `type: 'lesson'`, **`series`: `'PPL-Master-Syllabus'`**, `slug` は kebab で **[08](../08_Syllabus_Management_Guide.md)** と `learning_contents.id` = stem。
- **`order`**: 「法規セット内」の読み順を付けるなら、`5`（Subject）に紐づくブロック順で **連番を区切りごとリセットしない**運用でもよいが、**/articles での並びが荒れないように** 「5-1〜5-4 の順に単調増加」などルールを 1 本に固定する。
- **CPL 側の変更**: 各 `3.1.x` の末尾または Callout で **「詳細・一次情報・更新の正は PPL 記事」** を明示する（工学でやっている **「CPL への扉」の逆線**）。

### 4.1 空域と飛行場地上の分割（任意）

- **一本化**: 「空域」の節で飛行場の種類だけ触り、**地上の安全（誤進入）** は `PPL-5-4-2_CaptainAuthorityAndPreflight` の「離着陸前後」や将来の増補で触れる。
- **分割する場合**: `PPL-5-4-1` を **天上（3.1.5）**、`PPL-5-4-6_AerodromeGroundOperationsBasics.mdx` のような stem を **地上・誤進入（3.1.8）** に限定する。**Topic 番号は 08 と Skill で `learning_contents` に登録するときに最終決定**。

---

## 5. 執筆・保守のルール（法規だけの注意）

1. **[mdx-article-guide.mdc](../../.cursor/rules/mdx-article-guide.mdc)**: hourei MCP / e-Gov、条文の抜粋のみ、試験保証しない旨。
2. **二重長文回避**: CPL に既にある試験用の「キャラ調」長文と、**PPL の平易な同一条文解説を二重メンテ**しない。**PPL＝読みやすい正史、CPL＝戦略ゲーム調の試験解説 + PPLへリンク**が [00 §4](../00_Flight_Academy_Strategy.md) と両立する。
3. **DB**: 新規 PPL は `learning_contents` + 必要なら `learning_test_mapping`（[`learning-contents-registration` Skill](../../.cursor/skills/learning-contents-registration/SKILL.md)）。
4. **クイズ**: PPL のみフィルタで意味のある粒度に、`unified_cpl_questions.applicable_exams` と整合させること（詳細は [08](../08_Syllabus_Management_Guide.md)）。

---

## 6. 推奨ロードマップ（短い順）

1. **`PPL-5-1-1`** と **`PPL-5-3-2`（医学）**：定義・身体は他記事から参照される**ハブになりやすい**。
2. **`PPL-5-3-1`** と **`PPL-5-4-3`**：免許・審査の線が一本になる。
3. **`PPL-5-4-1` / `-2`**：運航ユーザーの体感に直結。
4. **`-4` / `-5`（安全・報告）**：試験の「条文番号問題」になりやすいので**数値より手続の型**を PPL で固定。
5. **Phase 2（登録・耐空・条約・英語）**。
6. 最後に **3.1.6 と橋渡し**（または Phase 3 用の短文）。

---

### 関連ドキュメント

- [PPL_Master_Syllabus.md](../PPL_Master_Syllabus.md) — Subject 5 チェックリスト
- [00_Flight_Academy_Strategy.md](../00_Flight_Academy_Strategy.md) — PPL/CPL 棲み分け
- [templates/PPL_Article_Template.mdx](../templates/PPL_Article_Template.mdx)
- CPL 並走: `src/content/lessons/3.1.{1..8}_*.mdx`

### 変更履歴

| 日付 | 内容 |
|------|------|
| 2026-05-13 | 初版：CPL 8 本 × Master §5 をマトリクス化、Phase 順とメタ運用 |
| 2026-05-14 | stem 一覧に対応する **スタブ MDX**（先頭ブロックコメント内に Gemini 用ブリーフ）を [`src/content/lessons/`](../src/content/lessons/) に配置。公開時は `meta.publishedAt` 設定＋`learning_contents` 登録 |
| 2026-05-12 | **法規 Phase 前半 4 本**（5-1-1〜5-1-2・5-2-1〜5-2-2）を本文化済み。**`learning_contents`** への冪等投入: [`20260512_learning_contents_ppl_aviation_law_four.sql`](../scripts/database/20260512_learning_contents_ppl_aviation_law_four.sql)（`sub_category`: 航空法規、`order_index` 501〜504）。**`scripts/database/register_ppl_article.mjs`** は `PPL-5-*` の `sub_category` を自動で **航空法規** とするよう更新 |
| 2026-05-12 | **5-3-1〜5-3-3**（技能証・身体検査・航空英語）を `learning_contents` に追加: [`20260512_learning_contents_ppl_subject5_505_507.sql`](../scripts/database/20260512_learning_contents_ppl_subject5_505_507.sql)（`order_index` 505〜507）。MDX は内部リンクの stem 正規化・`meta.tags` からグルメ由来タグ除去を反映 |
