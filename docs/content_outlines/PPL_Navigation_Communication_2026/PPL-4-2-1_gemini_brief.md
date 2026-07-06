# Gemini 向け素案 — PPL `PPL-4-2-1_RadioPhraseologyBasics`（新規・Phase 1）

**正本 stem**: `PPL-4-2-1_RadioPhraseologyBasics.mdx`  
**記事 URL（予定）**: `/articles/PPL-4-2-1_RadioPhraseologyBasics`  
**`meta.order`**: **403**  
**CPL 扉**: `/articles/3.5.5_ATCPhraseology`（用語・フレーズロジー深掘り）、`/articles/3.5.3_RadioCommunication`  
**前回必須リンク**: `/articles/PPL-4-1-1_AirTrafficServicesOverview`

---

## 1. 記事目的

Subject 4 で**全記事から参照される**無線の型。**ICAO フォネティックアルファベット**、**数字の読み方**、**標準用語（Roger, Wilco, Say again 等）** を PPL 向けに整理。詳細例文・ダブルトラは CPL 3.5.3 扉へ。

## 2. 学習目標（3項目）

- [ ] **ICAO フォネティックアルファベット**（Alpha, Bravo…）を、試験レベルで読み・書きできる。
- [ ] 航空無線の**数字の読み方**（3→Tree, 9→Niner 等）の理由を説明できる。
- [ ] 代表的な**標準用語**の意味と、日常英会話を使わない理由を述べられる。

## 3. DB データ連携（`unified_cpl_questions`）

| クラスタ | 記事での扱い |
|----------|--------------|
| `管制業務一般/電話通信`（**41** 問） | **主軸** — 呼出し・数字・標準語 |

> **データ連携 Callout 例**: 本記事は **`管制業務一般/電話通信`** クラスタと紐づく。

## 4. 必須セクション（骨子）

### 4.1 概要 — 「ペラペラ英語」より「決まった箱」

- [4-1-1](/articles/PPL-4-1-1_AirTrafficServicesOverview) で ATS を知ったあと、**空の共通言語**へ。
- 道真: 博多弁。**フレーズロジー＝空のチェックリスト**（CPL 3.5.5 と同趣旨、PPL は短く）。

### 4.2 呼出しの基本形（原理のみ）

- **相手 → 自機 → 用件** — 詳細手順・ダブルトラは [3.5.3](/articles/3.5.3_RadioCommunication) 扉。

### 4.3 ICAO フォネティックアルファベット

| 要件 | 内容 |
|------|------|
| **表 1 つ必須** | A=Alpha … Z=Zulu（試験頻出は B, F, N, S, T 等） |
| **試験** | 似た音の区別（B/Bravo vs D/Delta） |

### 4.4 数字の読み方

- 3=Tree, 5=Fife, 9=Niner — **聞き間違い防止**の理由。
- 高度・周波数・風速への適用例（各 1 例）。

### 4.5 標準用語（PPL 代表）

| 用語 | 意味（PPL） | トラップ |
|------|------------|----------|
| Roger | 受信した | Wilco と混同 |
| Wilco | 了解して実行する | Roger だけで実行と誤解 |
| Say again | もう一度 | 恥ずかしがるな（3.5.5 扉） |
| Unable | 実行不能 | 日常英語の refuse と混同 |
| Stand by | 待機 | 断りと混同 |

### 4.6 🍜 五感比喩

- 例: **博多うどんの注文** — 「かしわめし」は決まった言い方（フレーズロジー）、自由文は厨房が混乱。

### 4.7 Check Six（3〜4 問）

1. **フォネティック** — 特定文字の読み（N/November, S/Sierra 等）。
2. **数字** — 9=Niner の理由。
3. **Roger vs Wilco** — 意味の違い。
4. **（任意）Say again** — 聞き返しの標準表現。

### 4.8 まとめ・次回予告

- 次: [PPL-4-2-2_ClearanceReadbackBasics](/articles/PPL-4-2-2_ClearanceReadbackBasics) — 復唱の必須項目。
- **CPL 深掘り扉**: [3.5.5_ATCPhraseology](/articles/3.5.5_ATCPhraseology)

### 4.9 Callout（必須）

```mdx
<Callout type="warning" title="無線用語の正本">
  標準用語・手順の最新版は **AIP・ICAO Doc 9432 等** を参照。本記事は PPL 学科向けの代表値。
</Callout>
```

## 5. メタデータ案

| 項目 | 案 |
|------|-----|
| `title` | 【航空通信】無線フレーズの基礎：アルファベット・数字・標準用語 |
| `slug` | `ppl-4-2-1-radio-phraseology-basics` |
| `date` / `publishedAt` | **2026-07-11** 以降 |
| `readingTime` | 11 |
| `tags` | `PPL`, `学科試験`, `航空通信`, `フレーズロジー`, `ICAO`, `無線` |

## 6. Gemini 依頼文

```
PPL 航空通信「無線フレーズの基礎」の Markdown 本文のみ。YAML 禁止。
必須リンク: /articles/PPL-4-1-1_AirTrafficServicesOverview
3500〜5000 字。表 1 つ（ICAO アルファベット A〜Z または代表 subset + 数字読み）。
Check Six 3〜4 問。博多弁・道真。五感比喩 1 節。export default 不要。
CPL 扉: /articles/3.5.5_ATCPhraseology（深掘りは任意）
データ連携: 管制業務一般/電話通信
```

---

### 変更履歴

| 日付 | 内容 |
|------|------|
| 2026-07-06 | 初版。ICAO 字母・数字・標準語骨子 |
