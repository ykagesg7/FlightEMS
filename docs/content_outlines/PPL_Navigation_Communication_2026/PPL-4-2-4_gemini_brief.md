# Gemini 向け素案 — PPL `PPL-4-2-4_FlightPlanFilingBasics`（新規・Phase 1）

**正本 stem**: `PPL-4-2-4_FlightPlanFilingBasics.mdx`  
**記事 URL（予定）**: `/articles/PPL-4-2-4_FlightPlanFilingBasics`  
**`meta.order`**: **406**  
**CPL 扉**: `/articles/3.5.2_AeronauticalInformation`、`/articles/3.4.4_FlightPlanning`  
**前回必須リンク**: `/articles/PPL-4-2-3_AerodromeControlBasics`  
**Subject 3 相互リンク（必須）**: `/articles/PPL-3-1-5_FlightPlanningBasics`

---

## 1. 記事目的

航法 [PPL-3-1-5](/articles/PPL-3-1-5_FlightPlanningBasics) で学んだ**飛行計画の中身**（燃料・時間・ルート）を、通信側の**提出・変更・クローズ**手順と接続する。管制・警急が計画を前提に動く — Subject 3×4 の**橋**記事。

## 2. 学習目標（3項目）

- [ ] **飛行計画（Flight Plan）** を提出する目的（管制・捜索救難・交通整理）を説明できる。
- [ ] **ファイル（提出）**、**変更**、**クローズ（終了通報）** の PPL レベルの流れを述べられる。
- [ ] [3-1-5](/articles/PPL-3-1-5_FlightPlanningBasics) の計画項目と、通信で通報する項目の**対応**を理解できる。

## 3. DB データ連携（`unified_cpl_questions`）

| クラスタ | 記事での扱い |
|----------|--------------|
| `飛行計画/記入`（**18** 問） | **主軸** — 計画書の項目・記入 |
| `通報`（**4** 問） | **主軸** — 提出・変更・終了 |

> **データ連携 Callout 例**: 本記事は **`飛行計画/記入`**・**`通報`** クラスタと紐づく。

## 4. 必須セクション（骨子）

### 4.1 概要 — 「計画なき飛行は、地図なきドライブ」

- 航法で描いた計画を**誰に・いつ**渡すか — 通信の仕事。
- **必須リンク段落**: [PPL-3-1-5](/articles/PPL-3-1-5_FlightPlanningBasics) — 燃料・ETA・ルートはそちらで復習。
- 道真: 博多弁。

### 4.2 飛行計画を出す理由

| 目的 | 誰のため | 4-1 との接続 |
|------|---------|--------------|
| **交通整理** | 管制 | ATS 管制業務 |
| **警急・SAR** | 捜索救難 | [4-1-2](/articles/PPL-4-1-2_SearchAndRescueBasics) |
| **情報提供** | 気象・NOTAM（概念） | Phase 2 AIP 予告 |

### 4.3 ファイル（提出）の基本

- **いつ**: 出発前（時間は AIP 参照 — 断定しすぎない）。
- **どこへ**: 飛行計画室・電子手段（概念）。
- **何を**: 機種・ルート・高度・時間・燃料（3-1-5 対照表 1 つ推奨）。

### 4.4 変更（Change）

- ルート・高度・目的地変更 — **管制への通報**の必要性（定性）。
- 試験: 変更し忘れ vs 未提出。

### 4.5 クローズ（Close / Arrival report）

- 到着・計画終了の**通報** — 警急網が「行方不明」と誤認しないため。
- 未クローズのリスク — SAR 誤発動の概念。

### 4.6 🍵 五感比喩

- 例: **旅行の帰宅連絡** — 出発 LINE は出したが帰宅報告忘れ → 親が警察（SAR）に電話。

### 4.7 Check Six（3〜4 問）

1. **飛行計画の目的** — 管制・警急。
2. **クローズ** — 到着通報の意味。
3. **変更** — ルート変更時の通報必要性。
4. **（任意）3-1-5 連携** — 計画書の燃料・ETA 項目。

### 4.8 まとめ・次回予告

- Subject 3×4 連携完了。次（執筆順）: [PPL-4-1-2](/articles/PPL-4-1-2_SearchAndRescueBasics) または Phase 1 締め [4-3-x](/articles/PPL-4-3-1_CommFailureAndLightSignals)。
- CPL: [3.4.4](/articles/3.4.4_FlightPlanning)、[3.5.2](/articles/3.5.2_AeronauticalInformation)

### 4.9 Callout（必須）

```mdx
<Callout type="warning" title="飛行計画の運用">
  提出期限・様式は **最新 AIP・NOTAM** を正とする。本記事は PPL 学科の手順概要。
</Callout>
```

## 5. メタデータ案

| 項目 | 案 |
|------|-----|
| `title` | 【航空通信】飛行計画の提出：ファイル・変更・クローズ |
| `slug` | `ppl-4-2-4-flight-plan-filing-basics` |
| `date` / `publishedAt` | **2026-07-14** 以降 |
| `readingTime` | 11 |
| `tags` | `PPL`, `学科試験`, `航空通信`, `飛行計画`, `FPL`, `通報` |

## 6. Gemini 依頼文

```
PPL 航空通信「飛行計画の提出」の Markdown 本文のみ。YAML 禁止。
必須リンク: /articles/PPL-3-1-5_FlightPlanningBasics
復習: /articles/PPL-4-2-3_AerodromeControlBasics, /articles/PPL-4-1-1_AirTrafficServicesOverview
3500〜5000 字。表 1 つ（計画項目↔通報タイミング）。Check Six 3〜4 問。
博多弁・道真。五感比喩 1 節。export default 不要。
任意: /articles/3.4.4_FlightPlanning, /articles/3.5.2_AeronauticalInformation
データ連携: 飛行計画/記入、通報
```

---

### 変更履歴

| 日付 | 内容 |
|------|------|
| 2026-07-06 | 初版。FPL 提出・変更・クローズ骨子。3-1-5 相互リンク |
