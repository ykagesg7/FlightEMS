# Gemini 向け素案 — PPL `PPL-4-3-2_MaydayPanPanBasics`（新規・Phase 1）

**正本 stem**: `PPL-4-3-2_MaydayPanPanBasics.mdx`  
**記事 URL（予定）**: `/articles/PPL-4-3-2_MaydayPanPanBasics`  
**`meta.order`**: **408**  
**CPL 扉**: `/articles/3.5.4_EmergencyProcedures`  
**前回必須リンク**: `/articles/PPL-4-3-1_CommFailureAndLightSignals`  
**任意相互リンク**: `/articles/PPL-3-3-2_SpatialDisorientationBasics`（判断力・パニック）

---

## 1. 記事目的

Subject 4 Phase 1 の**締め**。**MAYDAY（遭難）** と **PAN PAN（緊急）** の重大度の違い、緊急通信の**基本構成**（事実・意図・位置）を PPL 向けに整理。CPL 3.5.4 は深掘り扉。フィクション比喩可だが**手順の誤りは不可**。

## 2. 学習目標（3項目）

- [ ] **MAYDAY** と **PAN PAN** の危機度の違いを即答できる。
- [ ] 緊急通信の**基本要素**（コールサign、位置、事実、意図、燃料・人数等）を列挙できる。
- [ ] 緊急時も**フレーズロジー**と**復唱**の型を崩さない理由を述べられる。

## 3. DB データ連携（`unified_cpl_questions`）

| クラスタ | 記事での扱い |
|----------|--------------|
| `緊急機に対する管制`（**3** 問） | **主軸** — 優先順位・管制対応 |
| `救難手続`（**9** 問） | **主軸** — MAYDAY/PAN PAN の手順 |

> **データ連携 Callout 例**: 本記事は **`緊急機に対する管制`**・**`救難手続`** クラスタと紐づく。

## 4. 必須セクション（骨子）

### 4.1 概要 — 「叫ぶ暇があるなら、状況を整理しろ」

- [4-3-1](/articles/PPL-4-3-1_CommFailureAndLightSignals) は**沈黙**、本記事は**SOS の型**。
- [4-1-2](/articles/PPL-4-1-2_SearchAndRescueBasics) の 121.5・警急業務へ接続。
- 道真: 博多弁。**事実と意図の分離**（CPL 3.5.4 同趣旨、PPL は短く）。

### 4.2 MAYDAY vs PAN PAN

| 呼出 | 意味 | 例示（概念） | 試験トラップ |
|------|------|-------------|--------------|
| **MAYDAY ×3** | **遭難** — 直ちに助けが必要 | エンジン停止・火災・操縦不能 | PAN PAN と逆転 |
| **PAN PAN ×3** | **緊急** — 危険だが即墜落ではない | 燃料不安・医療・部分故障 | MAYDAY ほど重大と誤解 |

### 4.3 緊急通信の構成（PPL）

1. **MAYDAY/PAN PAN**（3 回）
2. **Station addressed** — 誰に
3. **Identification** — 自機
4. **Nature** — 何が起きたか（**事実**）
5. **Intention** — 何をしたいか（**意図**）
6. **Position, Level, Heading** — どこに
7. **（任意）** 燃料・機上人数

- パニック時の**型** — [3-3-2](/articles/PPL-3-3-2_SpatialDisorientationBasics) 判断力リンク任意。

### 4.4 管制・他機の優先

- 緊急通信は**最優先** — 通常通信を控える（概念）。
- [4-1-1](/articles/PPL-4-1-1_AirTrafficServicesOverview) 警急業務への移行。

### 4.5 🥃 五感比喩

- 例: **119 vs 救急** — 火事（MAYDAY）と高熱だけ（PAN PAN）。番号を間違えるな。

### 4.6 Check Six（3〜4 問）

1. **MAYDAY vs PAN PAN** — 重大度。
2. **MAYDAY 3 回** — 遭難の宣言。
3. **通信構成** — 位置・事実・意図の欠落選択肢。
4. **（任意）121.5** — 緊急周波数（4-1-2 復習）。

### 4.7 まとめ — Subject 4 Phase 1 完走

- **業務→用語→復唱→タワー→計画→SAR→故障→緊急** の一連が揃う。
- CPL ハブ: [CPL-Hub-Communication](/articles/CPL-Hub-Communication)
- Phase 2 予告: FIR・レーダー・AIP（構造案 §4）

### 4.8 Callout（必須・warning）

```mdx
<Callout type="warning" title="緊急通信の運用">
  本記事は学科試験向けの概念整理。実運航では **最新 AIP・管制指示・運航者の緊急手順** を正とする。シミュレーション・フィクション比喩は学習用であり、実機での手順は教官・SOP に従うこと。
</Callout>
```

## 5. メタデータ案

| 項目 | 案 |
|------|-----|
| `title` | 【航空通信】MAYDAY と PAN PAN：緊急・遭難通信の基礎 |
| `slug` | `ppl-4-3-2-mayday-pan-pan-basics` |
| `date` / `publishedAt` | **2026-07-18** 以降 |
| `readingTime` | 12 |
| `tags` | `PPL`, `学科試験`, `航空通信`, `MAYDAY`, `PAN PAN`, `緊急` |

## 6. Gemini 依頼文

```
PPL 航空通信 Phase 1 締め「MAYDAY と PAN PAN」の Markdown 本文のみ。YAML 禁止。
必須リンク: /articles/PPL-4-3-1_CommFailureAndLightSignals
復習: /articles/PPL-4-1-2_SearchAndRescueBasics, /articles/PPL-4-2-1_RadioPhraseologyBasics
任意: /articles/PPL-3-3-2_SpatialDisorientationBasics
4000〜5500 字。表 1 つ（MAYDAY vs PAN PAN）。Check Six 3〜4 問。
博多弁・道真。五感比喩 1 節。export default 不要。
CPL 扉: /articles/3.5.4_EmergencyProcedures
データ連携: 緊急機に対する管制、救難手続
末尾必須: warning Callout — 実運航は最新 AIP/管制指示を正とする旨（Subject 4 構造案 §1 準拠）。
```

---

### 変更履歴

| 日付 | 内容 |
|------|------|
| 2026-07-06 | 初版。MAYDAY/PAN PAN・緊急通信骨子。Phase 1 締め |
