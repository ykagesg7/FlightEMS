# Gemini 向け素案 — PPL `PPL-4-2-3_AerodromeControlBasics`（新規・Phase 1）

**正本 stem**: `PPL-4-2-3_AerodromeControlBasics.mdx`  
**記事 URL（予定）**: `/articles/PPL-4-2-3_AerodromeControlBasics`  
**`meta.order`**: **405**  
**CPL 扉**: `/articles/3.5.3_RadioCommunication`  
**前回必須リンク**: `/articles/PPL-4-2-2_ClearanceReadbackBasics`

---

## 1. 記事目的

[4-2-2](/articles/PPL-4-2-2_ClearanceReadbackBasics) の復唱の型を、**飛行場管制（タワー）** の実務シーン — **地上滑走（Taxi）**、**離陸（Takeoff）**、**着陸（Landing）** クリアランス — に適用する PPL 記事。可視信号は [4-3-1](/articles/PPL-4-3-1_CommFailureAndLightSignals) へ予告。

## 2. 学習目標（3項目）

- [ ] **タワー管制**の役割（空港周辺・滑走路・滑走路面）を、[4-1-1](/articles/PPL-4-1-1_AirTrafficServicesOverview) と結びつけて説明できる。
- [ ] **Taxi clearance** の要点（経路・Hold short・滑走路番号）を復唱付きで理解できる。
- [ ] **離陸・着陸クリアランス**の順序と、誤進入リスクを試験レベルで述べられる。

## 3. DB データ連携（`unified_cpl_questions`）

| クラスタ | 記事での扱い |
|----------|--------------|
| `地上滑走`（**5** 問） | **主軸** — Taxi・Hold short |
| `到着機`（**2** 問） | **主軸** — 着陸・ゴーアラウンド概念 |
| `可視信号`（**15** 問） | 参照 — ライトガンは 4-3-1 |

> **データ連携 Callout 例**: 本記事は **`地上滑走`**・**`到着機`** クラスタと紐づく。

## 4. 必須セクション（骨子）

### 4.1 概要 — 滑走路は「一方通行の高速道路」

- 復唱を学んだあと、**いちばん事故が多い場所＝空港**。
- 道真: 博多弁。**滑走路誤進入＝逆走車**。

### 4.2 タワー vs 地上管制（概念）

| 区分 | 管轄（PPL） | 典型クリアランス |
|------|------------|-----------------|
| **タワー** | 滑走路・最終進入・離陸 | Takeoff, Land, Line up |
| **地上/ Apron** | 滑走路外の移動 | Taxi to… |

- 日本の呼称は AIP 参照 — 試験は概念優先。

### 4.3 地上滑走（Taxi）

- **Taxi to runway XX via…**
- **Hold short of runway XX** — 必ず復唱（4-2-2 復習）。
- 滑走路の**確認（Backtrack 等は CPL）**。

### 4.4 離陸シーケンス（PPL）

1. Line up and wait（概念）
2. Cleared for takeoff — **自機向けか確認**
3. 離陸後の初期指示（概念）

### 4.5 着陸シーケンス（PPL）

- Cleared to land — 滑走路番号復唱。
- **Go-around** — 一言触れる（詳細 CPL）。
- 着陸後 Taxi — 4-2-2 の復唱継続。

### 4.6 🍜 五感比喩

- 例: **福岡空港のタクシー待ち** — Hold short＝横断歩道の手前で止まれ。

### 4.7 Check Six（3〜4 問）

1. **Hold short** — 滑走路手前で停止、復唱必須。
2. **Takeoff clearance** — 他機への許可の横取り。
3. **Landing clearance** — 滑走路番号の確認。
4. **（任意）Line up and wait** — 離陸許可との違い。

### 4.8 まとめ・次回予告

- 次: [PPL-4-2-4_FlightPlanFilingBasics](/articles/PPL-4-2-4_FlightPlanFilingBasics)
- 無線故障時: [PPL-4-3-1](/articles/PPL-4-3-1_CommFailureAndLightSignals)（可視信号）

### 4.9 Callout（必須）

```mdx
<Callout type="warning" title="飛行場管制の運用">
  滑走路・移動経路は **最新 AIP・空港図・管制指示** を正とする。本記事は学科向けの手順型。
</Callout>
```

## 5. メタデータ案

| 項目 | 案 |
|------|-----|
| `title` | 【航空通信】飛行場管制の基礎：タワー・滑走・離着陸 |
| `slug` | `ppl-4-2-3-aerodrome-control-basics` |
| `date` / `publishedAt` | **2026-07-13** 以降 |
| `readingTime` | 11 |
| `tags` | `PPL`, `学科試験`, `航空通信`, `タワー`, `Taxi`, `離着陸` |

## 6. Gemini 依頼文

```
PPL 航空通信「飛行場管制の基礎」の Markdown 本文のみ。YAML 禁止。
必須リンク: /articles/PPL-4-2-2_ClearanceReadbackBasics
復習: /articles/PPL-4-2-1_RadioPhraseologyBasics
3500〜5000 字。表 1 つ（Taxi/Takeoff/Land 対照）。Check Six 3〜4 問。
博多弁・道真。五感比喩 1 節。export default 不要。
任意: /articles/3.5.3_RadioCommunication
データ連携: 地上滑走、到着機
```

---

### 変更履歴

| 日付 | 内容 |
|------|------|
| 2026-07-06 | 初版。タワー・Taxi・離着陸骨子 |
