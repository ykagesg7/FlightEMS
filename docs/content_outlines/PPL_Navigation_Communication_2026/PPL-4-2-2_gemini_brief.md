# Gemini 向け素案 — PPL `PPL-4-2-2_ClearanceReadbackBasics`（新規・Phase 1）

**正本 stem**: `PPL-4-2-2_ClearanceReadbackBasics.mdx`  
**記事 URL（予定）**: `/articles/PPL-4-2-2_ClearanceReadbackBasics`  
**`meta.order`**: **404**  
**CPL 扉**: `/articles/3.5.3_RadioCommunication`  
**前回必須リンク**: `/articles/PPL-4-2-1_RadioPhraseologyBasics`

---

## 1. 記事目的

[4-2-1](/articles/PPL-4-2-1_RadioPhraseologyBasics) の標準語のあと、**クリアランス（管制許可）** の種類と **復唱（Readback）が必須の項目** を PPL 向けに整理。滑走路誤進入・高度取り違えの試験トラップ対策。

## 2. 学習目標（3項目）

- [ ] **クリアランス** が「指示・許可」であることを、[4-1-1](/articles/PPL-4-1-1_AirTrafficServicesOverview) の管制業務と結びつけて説明できる。
- [ ] **復唱が必須**となる代表項目（滑走路・進路・高度・ホールドショート等）を列挙できる。
- [ ] 復唱不要または読み返しのみの情報と、必須復唱の**境界**を試験レベルで仕分けできる。

## 3. DB データ連携（`unified_cpl_questions`）

| クラスタ | 記事での扱い |
|----------|--------------|
| `飛行場管制/管制許可等`（**4** 問） | **主軸** — クリアランスの型 |
| `通則`（**5** 問） | **主軸** — 復唱・通信通則 |

> **データ連携 Callout 例**: 本記事は **`飛行場管制/管制許可等`**・**`通則`** クラスタと紐づく。

## 4. 必須セクション（骨子）

### 4.1 概要 — 「聞こえたつもり」は墜落の同義語

- 他機への離陸許可を**横取り**する事故話（CPL 3.5.3 と同趣旨、PPL は短く）。
- 道真: 博多弁。**復唱＝注文の確認**。

### 4.2 クリアランスの種類（PPL 代表）

| 種類 | 例 | 復唱 |
|------|-----|------|
| **離着陸** | Takeoff / Land / Line up | **必須** |
| **進路・高度** | Heading, Altitude, Level | **必須** |
| **地上** | Taxi, Hold short of RWY | **必須**（滑走路番号含む） |
| **情報のみ** | 気象・交通情報 | 原則不要（Readback ルールは AIP 参照） |

### 4.3 復唱必須項目 — 試験の芯

1. **滑走路番号** — 02 vs 20 の取り違え。
2. **Hold short** — 滑走路手前停止。
3. **高度・フライトレベル** — 数字は [4-2-1](/articles/PPL-4-2-1_RadioPhraseologyBasics) の読み方。
4. **進路（Heading）** — 磁方位等。

- **「予測と復唱」** — 次に何が来るか予測（CPL 扉へ）。

### 4.4 復唱の型

- 自機コールサign + 復唱内容 + **Roger**（試験用の最小形）。
- 訂正: **Correction** — 詳細は 3.5.5 扉。

### 4.5 🍵 五感比喩

- 例: **資さんうどん** — 嫁の「肉ごぼ天ネギ抜き」を復唱せず横取り（CPL 3.5.3 比喩の PPL 短縮版）。

### 4.6 Check Six（3〜4 問）

1. **滑走路クリアランス** — 番号復唱必須。
2. **Hold short** — 意味と復唱。
3. **離陸許可** — 他機指示の横取りリスク。
4. **（任意）Roger のみ** — 実行確認 Wilco との違い（4-2-1 復習）。

### 4.7 まとめ・次回予告

- 次: [PPL-4-2-3_AerodromeControlBasics](/articles/PPL-4-2-3_AerodromeControlBasics) — タワー実務。
- CPL: [3.5.3](/articles/3.5.3_RadioCommunication)

### 4.8 Callout（必須）

```mdx
<Callout type="warning" title="復唱・クリアランスの運用">
  復唱要否の詳細は **最新 AIP・管制指示** を正とする。本記事は PPL 学科の代表項目整理。
</Callout>
```

## 5. メタデータ案

| 項目 | 案 |
|------|-----|
| `title` | 【航空通信】クリアランスと復唱：必ず読み返す項目 |
| `slug` | `ppl-4-2-2-clearance-readback-basics` |
| `date` / `publishedAt` | **2026-07-12** 以降 |
| `readingTime` | 11 |
| `tags` | `PPL`, `学科試験`, `航空通信`, `クリアランス`, `復唱`, `リードバック` |

## 6. Gemini 依頼文

```
PPL 航空通信「クリアランスと復唱」の Markdown 本文のみ。YAML 禁止。
必須リンク: /articles/PPL-4-2-1_RadioPhraseologyBasics
復習: /articles/PPL-4-1-1_AirTrafficServicesOverview
3500〜5000 字。表 1 つ（クリアランス種別と復唱要否）。Check Six 3〜4 問。
博多弁・道真。五感比喩 1 節。export default 不要。
任意: /articles/3.5.3_RadioCommunication
データ連携: 飛行場管制/管制許可等、通則
```

---

### 変更履歴

| 日付 | 内容 |
|------|------|
| 2026-07-06 | 初版。復唱必須項目・クリアランス型骨子 |
