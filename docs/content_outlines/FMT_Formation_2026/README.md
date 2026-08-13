# FMT 編隊シリーズ — 執筆正本（Season 1 + 2）

**読者**: 空自 T-4 学生（Joe / 博多弁 / 道真）。副次: シミュレータ。サイト全体を軍事化しない。公式教程の代替ではない。  
**既存公開**: W34 ドリップ予定は 1-1〜1-3。**ストック**: 1-4〜1-8（604–608）。次登録は **609**。  
**共通ルール**: [External_LLM_Article_Brief.md](../../templates/External_LLM_Article_Brief.md)  
**MDX 規則**: [`.cursor/rules/mdx-article-guide.mdc`](../../../.cursor/rules/mdx-article-guide.mdc)  
**登録**: Skill [`learning-contents-registration`](../../../.cursor/skills/learning-contents-registration/SKILL.md) — `category`: **操縦**、`sub_category`: **編隊飛行**、`series`: **USAF-Formation-Flying**  
**公開**: [articlePublishSchedule.ts](../../../api/_lib/articlePublishSchedule.ts) · [04 §Articles](../../04_Operations_Guide.md) · Skill [`article-publish-check`](../../../.cursor/skills/article-publish-check/SKILL.md)

---

## 公開方針（2026-08-13）

**狙い**: 平日にサイトへ戻る習慣（訪問のリズム）と、役に立つ編隊記事でファンを増やす。ALPM の記事読了そのものではなく、**定期訪問 → 読む → 次話が気になる**が先。

| 決めたこと | 運用 |
|------------|------|
| **週 3 本** | **月・水・金**（執筆が追いつくまでの既定。土日は入れない） |
| **ドリップは 1-1 から** | 既出の 1-1〜1-3 はいったん非公開し、W34 で再掲 |
| **FMT はストック** | 1-4 以降は書いて倉庫へ。即公開しない |
| **1 週 1 シリーズ** | その週の digest は FMT か「訓練の当たり前」か、どちらか |
| **週次メール** | ストックを `WEEKLY_ARTICLE_DIGESTS` に載せてから。日曜 17:00 JST より前にデプロイ |

**W34（2026-08-17 / 19 / 21）**: 1-1 → 1-2 → 1-3。日曜（8/16）17:00 案内の対象。本番デプロイが前提。

### ストックの載せ方（1-4 以降）

1. レビュー通過した本文だけ `src/content/lessons/` へ（未完成ドラフトは置かない）。
2. `meta.publishedAt` は **公開予定日**。未定なら schedule 確定時に書く。
3. `learning_contents` は **`is_published: false`**。`true` だとハブに即出る。cron は **schedule にある ID だけ** を日付で反転する。
4. 週が決まったら [`articlePublishSchedule.ts`](../../../api/_lib/articlePublishSchedule.ts) に `id` / `publishDate` / `slug` / `hook` を足す（週3本なら月水金）。
5. Obsidian `Lessons/` へ同期。実装後その話の Gemini ブリーフは削除。

### 在庫の目安

Season 1 全 **10 話**＝週3本なら約 **3.5 週**（W34 で 1-1〜1-3 を使うので、1-4 以降は W35 から）。Season 2 は **8 話**。倉庫が薄くなったら「訓練の当たり前」次ブロックを同じパイプに乗せる。空週は常態化しない。

---

## 進め方（1 話あたり）

1. 本フォルダの **Gemini ブリーフ** を開き、依頼文をコピペ。
2. Gemini は **Markdown 本文のみ**（YAML フロントマター禁止。本プロジェクトは `export const meta`）。
3. Cursor が翻訳済み教範 + 直近の公開 FMT のトーンでレビュー。
4. 完成後のみ `src/content/lessons/` に MDX を置く。
5. `learning_contents` を **ストック登録**（`is_published: false`）。公開週が決まるまで schedule に載せない。

**次のブリーフは 1-9**（LAB / tactical turns）— 未起票。Season 2 のブリーフは Season 1 の編隊話が数本できてから。全 18 本を一括起票しない。

---

## 1 話の型

- 公理 1 つ
- サイトピクチャ 1 つ
- Vol.2 不合格基準 1 つ（該当 Area）
- Joe の口頭クイズ 1 つ
- T-4 に AB はない（1-2 と同じ）
- 数字は本 README「許可数字」と当該ブリーフに書いたものだけ

---

## Season 1（10 話）— ウイングマン編隊

| # | stem | slug | order | 主題 | 一次ソース | 状態 |
|---|------|------|-------|------|------------|------|
| 1 | `FMT-1-1_WingmanVFR` | `fmt-1-1-wingman-vfr` | 1 | V.F.R | IFF §3.8、Vol.3 deconflict | **W34 月 8/17** |
| 2 | `FMT-1-2_RunwayLineupTakeoff` | `fmt-1-2-runway-lineup-takeoff` | 2 | Lineup / T/O | Vol.3 §3.6–3.8、Vol.2 Area 71 | **W34 水 8/19** |
| 3 | `FMT-1-3_FingertipRoute` | `fmt-1-3-fingertip-route` | 3 | Fingertip / Route | Fund **6.11–6.12**、Vol.2 Area 72 / 74 | **W34 金 8/21** |
| 4 | `FMT-1-4_OpsCheckFence` | `fmt-1-4-ops-check-fence` | 4 | Ops check / FENCE | IFF §3.8、Fund 6A、IFF Ch2 | **ストック** |
| 5 | `FMT-1-5_LeadChange` | `fmt-1-5-lead-change` | 5 | Lead change | Fund 6A、IFF §3.12、AFPAM 11-205 | **ストック** |
| 6 | `FMT-1-6_Spread` | `fmt-1-6-spread` | 6 | Spread | IFF §3.10、Fund 6.14 | **ストック** |
| 7 | `FMT-1-7_TrailFamily` | `fmt-1-7-trail-family` | 7 | Close Trail / ET / Fighting Wing / Fluid | Fund 6.23–6.25、IFF §3.11 | **ストック** |
| 8 | `FMT-1-8_Rejoin` | `fmt-1-8-rejoin` | 8 | Rejoin / overshoot / breakout | Fund 6.20–6.22 | **ストック** |
| 9 | `FMT-1-9_TacticalLAB` | `fmt-1-9-tactical-lab` | 9 | LAB / tactical turns / lookout | IFF §3.6、Fund 6.26–6.31 | 未 |
| 10 | `FMT-1-10_LostWingman` | `fmt-1-10-lost-wingman` | 10 | Lost wingman / KIO | Vol.3 §6.7、Fund 6E | 未 |

**他話へ折り込む（独立話にしない）**

| 題材 | 行き先 |
|------|--------|
| Echelon / Crossunder | **1-3** の短い Tips（本筋は Fingertip / Route） |
| Pitchout / Take spacing | **1-8**（Rejoin とセット） |
| G exercise | Season 2（任意 2-0、または 2-3 の一節） |
| 4-ship / BD check / formation landing | 1-9 または 1-10 末尾の短い注記 |

**1-2 予告の扱い**: 1-2 末尾は **Fingertip / Route（1-3）**。FENCE は 1-4、Lead change は 1-5。1-3 冒頭は離陸の続き（旧予告の訂正劇にしない）。

---

## Season 2（8 話）— 幾何 + BFM マインド

Season 1 の編隊話が数本できてからブリーフを書く。Heat-to-Guns 手順や CAS 9-Line は FMT に載せない。

| # | stem | slug | order | 主題 | 一次ソース |
|---|------|------|-------|------|------------|
| 2-1 | `FMT-2-1_BFMGeometry` | `fmt-2-1-bfm-geometry` | 11 | Range、**HCA**（angle-off / 交差角）、**AA**、AOT、ATA、planform、**closure (Vc)**。「CA」は HCA として扱い、closure は別語で教える | IFF §4.4、Fig 4.1 |
| 2-2 | `FMT-2-2_PursuitLOSR` | `fmt-2-2-pursuit-losr` | 12 | Pursuit + LOSR | §4.5–4.7 |
| 2-3 | `FMT-2-3_TurnCircleEnergy` | `fmt-2-3-turn-circle-energy` | 13 | Turn circle、energy vs nose、EM（図は **10,000 LB** を引用。corner KCAS を捏造しない） | §4.3.3、4.6、4.10–4.12 |
| 2-4 | `FMT-2-4_ControlZone` | `fmt-2-4-control-zone` | 14 | CZ + Assessment Window（2500–4500 ft、25–45° AA） | §4.8–4.9 |
| 2-5 | `FMT-2-5_OffensivePictures` | `fmt-2-5-offensive-pictures` | 15 | Offensive pictures（6K outside TC、3K inside） | Ch4B 要旨 |
| 2-6 | `FMT-2-6_DefensivePictures` | `fmt-2-6-defensive-pictures` | 16 | Defensive: SURVIVE first | Ch4C 要旨 |
| 2-7 | `FMT-2-7_HighAspect` | `fmt-2-7-high-aspect` | 17 | High aspect: TR、lead turn、one/two-circle | Ch4D 要旨 |
| 2-8 | `FMT-2-8_EngagedPress` | `fmt-2-8-engaged-press` | 18 | Engaged / Press（2v1 の V.F.R） | Ch4E |

任意: G / AGSM は **2-0** または 2-3 の一節。独立話にしない場合は 2-3 に折り込む。

---

## 許可数字（原本突合済みのみ）

数字を記事に書くときは、当該話のブリーフに再掲したものだけ。ここに無い値は書かない。BFM 数字は Season 2 まで出さない。

### Rejoin 族（1-8 用）

| 項目 | 値 | 出典 |
|------|-----|------|
| Pitchout | **300 KIAS**、約 **180°**。wing **5 s delay ≈ 1 nm**（T-38。T-4 読み替え） | Fund 6.17 |
| Admin rejoin | **300 KIAS / 30° bank**。tactical 初動 350/45° は **1-9** | Fund 6.20 |
| Straight overtake | 1 nm から **50 kt** が目安 | Fund 6.20.2 |
| Turning | POM 下 **約 50 ft**（route まで）。overtake 目安 **30 kt**。3,000 ft 内: low **<50** / med **<30** / high **<10** kt | Fund 6.20.3 |
| Overshoot | low 6 を **≥約 2 ship lengths**。save するな | Fund 6.21 |
| 3/4-ship | 前機と **500 ft** まで | Fund 6.20–6.21 |
| Breakout | 4 条件（指示 / 見失い / 下か前を切れない / hazard） | Fund 6.22 |
| Vol.2 | 主 **79** Rejoin（uncontrolled / 衝突）。補助 **80 / 85 / 78**。**82 は tactical** | Vol.2 Table 3.1 |

### Trail 族（1-7 用）

| 項目 | 値 | 出典 |
|------|-----|------|
| Close Trail | **1–2 ship lengths**、jetwash 直下。**OTM 禁止**。**4 G max**（T-38。T-4 読み替え） | Fund 6.23 |
| Fighting Wing | **30–45° AA**、**500–1,500 ft aft**。aerobatic 禁止 | Fund 6.24 |
| ET | **30–45° AA**、**1,000–3,000 ft**。**2-ship only**。KIO: **<500 ft slant** または **3/9 前方** | Fund 6.25 |
| Fluid formation | **1,000–3,000 ft**、**3/9 より aft**。6 直下に長居しない | IFF §3.11 |
| Vol.2 | Area **76** Close Trail（過接近 / 喪失）。**77** ET。**84** Fighting Wing。**83 は FM であり Fluid formation ではない** | Vol.2 Table 3.1 |

### Spread（1-6 用）

| 項目 | 値 | 出典 |
|------|-----|------|
| Spread 間隔 | **1,000–3,000 ft**。LAB〜**30° aft**（T-38。T-4 は同思想・読み替え） | Fund 6.14、IFF §3.10 |
| LAB | 可能な限り line abreast。自側への turn を anticipate してのみ aft | IFF §3.10 |
| 旋回中の機間 | **最低 500 ft**。各自 side 維持（fluid 指示時除く） | IFF §3.10、Fund 6.14 |
| 禁止 | tactical hook / delayed / in-place（deconflict 不能） | IFF §3.10 |
| Vol.2 | **Spread 専用 Area なし**。Area 74 は Route | Vol.2 Table 3.1 |

### Fingertip / Route（1-3 用）

| 項目 | 値 | 出典 |
|------|-----|------|
| Fingertip 間隔の目安 | helmet abeam **slab bolt** ≈ **3 ft** | Fund 6.11 |
| Route 間隔 | **2 ship widths〜500 ft**。extended fingertip line より aft 不可、line abreast より forward 不可 | Fund 6.12 |
| Route 中 lead bank | **60° max** | Fund 6.12 |
| Fingertip exercise | 最大 **3 G**、**90° bank**、**200–400 KIAS**（T-38。T-4 は同思想・数字は自機制限に読み替え） | Fund 6.11 |
| Vol.2 Area 72 Fingertip (Wing) Q | wingtip **±7 ft**、vertical **±4 ft**、longitudinal **±4 ft** | Vol.2 Table 3.1 Area 72 |
| Vol.2 Area 74 Route (Wing) U | 衝突 hazard | Vol.2 Area 74 |
| Echelon turn（Tips） | gentle 以外は echelon から離れる方向、**bank 60° max**、**unloading 回避** | Fund 6.15 |

### 既存話で既出（1-3 で再掲してよい）

| 項目 | 値 | 出典・既存記事 |
|------|-----|----------------|
| 「3フィート」ジョーク | 約90センチ、梅ヶ枝餅10個 | FMT-1-1 概要（Fund 6.11 の 3 ft と接続） |
| T-4 に AB なし | — | FMT-1-2 |

### Season 2 用（1-3 では使わない）

Assessment Window 2500–4500 ft / 25–45° AA、EM 図 GW **10,000 LB** / 15,000 FT / MAX（本文 10,155 lb との差は Season 2 で注記）、6K / 3K の gist。corner KCAS は捏造しない。

---

## 禁止

- YAML フロントマター
- ブリーフに無い数字の発明（とくに BFM の KCAS / G / 距離）
- T-4 にアフターバーナーがあるかのような記述
- 公式訓練・検定の代替に聞こえる書き方（「これで FMT 合格」等）
- Heat-to-Guns 手順、CAS 9-Line
- 未完成ドラフトを `src/content/lessons/` に置くこと
- 全 18 本の Gemini ブリーフを一度に書くこと

---

## トーンサンプル（FMT-1-1 / 1-2 概要の型）

- 読者は「パイロット学生のあんさん」。舞台はテキサスのカントリー・バー。道真 + 教官ジョー。
- 博多弁。フィクション注記と「立場の明確化」（AFMAN は学習比喩、公式試験・軍事訓練の代替ではない）を毎話。
- 1-1: V.F.R は Visual → Formation → Radar。「3フィート／梅ヶ枝餅」は丸暗記批判の入口。
- 1-2: 地上は的。周辺視野。T-4 に AB なし。次回は Fingertip / Route（1-3）。FENCE は 1-4。

内部リンクは `/articles/{slug}`（例: `/articles/fmt-1-1-wingman-vfr`）。

---

## 登録メモ

| 項目 | 値 |
|------|-----|
| `learning_contents.id` | stem と同じ（例: `FMT-1-3_FingertipRoute`） |
| `category` | 操縦 |
| `sub_category` | 編隊飛行 |
| `content_type` | text |
| `is_published` | **ストックは `false`。** 公開日に cron が true にする（schedule 必須） |
| `order_index` | 1-1 = 601、1-2 = 602、**1-3 = 603**、以降連番 |
| `meta.series` | `USAF-Formation-Flying` |
| `meta.order` | Season 1 は 1–10、Season 2 は 11–18 |

SQL 先例: `20260616`（1-1）〜`fmt_trail_family.sql`（1-7）、`fmt_rejoin.sql`（1-8 ストック）。

---

### 変更履歴

| 日付 | 内容 |
|------|------|
| 2026-08-13 | 初版。Season 1 が 10・Season 2 が 8。 |
| 2026-08-13 | ドリップを 1-1 から。週 3 本（月水金）。W34 で 1-1〜1-3 を再掲。 |
| 2026-08-13 | `FMT-1-3` 本文化・DB 登録（`order_index` 603）。1-2 予告を Fingertip/Route に修正。 |
| 2026-08-13 | `FMT-1-4` ストック登録（`order_index` 604、`is_published: false`）。1-4 ブリーフ削除。1-5 ブリーフ起票。 |
| 2026-08-13 | `FMT-1-5` ストック登録（`order_index` 605、`is_published: false`）。1-5 ブリーフ削除。次は 1-6（未起票）。 |
| 2026-08-13 | 1-6 Spread ブリーフ起票。 |
| 2026-08-13 | `FMT-1-6` ストック登録（`order_index` 606、`is_published: false`）。1-6 ブリーフ削除。次は 1-7（未起票）。 |
| 2026-08-13 | 1-7 Trail 族ブリーフ起票。Pitchout は 1-8 へ確定。 |
| 2026-08-13 | `FMT-1-7` ストック登録（`order_index` 607、`is_published: false`）。1-7 ブリーフ削除。次は 1-8（未起票）。 |
| 2026-08-13 | 1-8 Rejoin ブリーフ起票（Pitchout 含む）。 |
| 2026-08-13 | `FMT-1-8` ストック登録（`order_index` 608、`is_published: false`）。1-8 ブリーフ削除。次は 1-9（未起票）。 |
