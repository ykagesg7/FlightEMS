# Gemini 向け素案 — PPL `PPL-4-1-2_SearchAndRescueBasics`（新規・Phase 1）

**正本 stem**: `PPL-4-1-2_SearchAndRescueBasics.mdx`  
**記事 URL（予定）**: `/articles/PPL-4-1-2_SearchAndRescueBasics`  
**`meta.order`**: **402**  
**CPL 扉**: `/articles/3.5.1_AirTrafficServices`、`/articles/3.5.4_EmergencyProcedures`  
**前回必須リンク**: `/articles/PPL-4-1-1_AirTrafficServicesOverview`

---

## 1. 記事目的

[PPL-4-1-1](/articles/PPL-4-1-1_AirTrafficServicesOverview) で警急業務を予告したあと、**捜索救難（SAR）** の PPL 入門 — **121.5 MHz**、**救難信号**、捜索救難体制の概要 — を整理する。緊急通信（4-3-x）の前に「誰が・何を探すか」の地図を渡す。

## 2. 学習目標（3項目）

- [ ] **121.5 MHz（VHF 救難周波数）** の役割と、試験で問われる基本的な使い方を説明できる。
- [ ] 代表的な**救難信号**（視覚・音響・無線の概念）を、PPL レベルで区別できる。
- [ ] 捜索救難業務が ATS の**警急**とどう接続するか述べられる。

## 3. DB データ連携（`unified_cpl_questions`）

| クラスタ | 記事での扱い |
|----------|--------------|
| `捜索救難業務`（**22** 問） | **主軸** — SAR 体制・業務の流れ |
| `救難信号`（**6** 問） | **主軸** — 121.5、信号の型 |
| `緊急機`（**20** 問） | 参照 — 緊急機の扱い（詳細は 4-3-2） |

> **データ連携 Callout 例**: 本記事は **`捜索救難業務`**・**`救難信号`** クラスタと紐づく。

## 4. 必須セクション（骨子）

### 4.1 概要 — 「助けは来るが、自分も旗を振れ」

- 警急業務 → SAR ネットワークへの接続。[4-1-1](/articles/PPL-4-1-1_AirTrafficServicesOverview) 復習 1 段落。
- 道真: 博多弁。**比喩は九州**（例: 迷子の子に合図をさせる — 待つだけでは遅い）。

### 4.2 121.5 MHz — 国際救難周波数

| 要点 | PPL レベル | 試験トラップ |
|------|-----------|--------------|
| **周波数** | 121.5 MHz（VHF） | 243 MHz（UHF）との混同（PPL は 121.5 中心） |
| **用途** | 遭難・緊急の**監視・呼び出し** | 日常の管制周波数と混同 |
| **運用** | 遭難時の発信・他機の応答（概念） | 条文の細部断定は避ける |

- ELT 等の存在は**一言触れる**程度（深掘りは CPL）。

### 4.3 救難信号 — 見つけてもらう技術

- **視覚信号**: 煙、信号弾、地上での SOS パターン（概念）。
- **音響**:  whistle 等（試験用語レベル）。
- **無線**: MAYDAY / PAN PAN との関係 — [4-3-2](/articles/PPL-4-3-2_MaydayPanPanBasics) へ**予告**。

### 4.4 SAR 体制（PPL 概観）

- 管制・救難調整・捜索資源の**役割分担**（定性フロー可）。
- 日本域は定性的に — 数値・機関名の断定は AIP 誘導。

### 4.5 🍵 五感比喩

- 例: **糸島の海岸で迷子** — 121.5 は「拡声器」、地上の煙は「目印の旗」。

### 4.6 Check Six（3〜4 問）

1. **121.5 MHz** — 救難周波数の用途。
2. **救難信号** — 視覚 vs 無線の目的。
3. **警急業務と SAR** — ATS 三柱のうちどれに属するか。
4. **（任意）243 MHz** — UHF 救難周波数の存在（選択肢の型）。

### 4.7 まとめ・次回予告

- 「見つけてもらう準備」が Subject 4 緊急編の土台。
- 次（執筆順）: 故障・緊急 — [PPL-4-3-1](/articles/PPL-4-3-1_CommFailureAndLightSignals)、[PPL-4-3-2](/articles/PPL-4-3-2_MaydayPanPanBasics)。

### 4.8 Callout（必須）

```mdx
<Callout type="warning" title="捜索救難の運用">
  救難手順・信号の詳細は **最新 AIP・運航者の緊急手順** を正とする。本記事は学科試験向けの概念整理。
</Callout>
```

## 5. メタデータ案

| 項目 | 案 |
|------|-----|
| `title` | 【航空通信】捜索救難の基礎：121.5 MHz と救難信号 |
| `slug` | `ppl-4-1-2-search-and-rescue-basics` |
| `date` / `publishedAt` | **2026-07-16** 以降（4-2 系の後・4-3 の前） |
| `readingTime` | 10 |
| `tags` | `PPL`, `学科試験`, `航空通信`, `SAR`, `121.5MHz`, `救難` |

## 6. Gemini 依頼文

```
PPL 航空通信「捜索救難の基礎」の Markdown 本文のみ。YAML 禁止。
必須リンク: /articles/PPL-4-1-1_AirTrafficServicesOverview
3500〜5000 字。表 1 つ（周波数・信号対照）。Check Six 3〜4 問。
博多弁・道真。五感比喩 1 節。export default 不要。
任意: /articles/3.5.4_EmergencyProcedures
データ連携: 捜索救難業務、救難信号
末尾 Callout: 実運航は最新 AIP/緊急手順を正とする旨。
```

---

### 変更履歴

| 日付 | 内容 |
|------|------|
| 2026-07-06 | 初版。SAR・121.5・救難信号骨子 |
