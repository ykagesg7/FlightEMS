# Gemini 向け素案 — PPL `PPL-2-1-3_PressureAltimeterSettings`（新規・全文）

**正本 stem**: `PPL-2-1-3_PressureAltimeterSettings.mdx`  
**記事 URL（予定）**: `/articles/PPL-2-1-3_PressureAltimeterSettings`  
**CPL 扉**: `/articles/3.3.1_StandardAtmosphere`  
**工学復習**: `/articles/PPL-1-2-2_PitotStatic`

---

## 1. 記事目的

**QNH / QNE / QFE**、気圧高度・密度高度の入口、高度計設定ミスの典型（高い設定→実際より低い等）を PPL 試験向けに整理。ピトー静圧系の**静圧→高度計**の接続を明示。

## 2. 学習目標

- QNH・QNE・QFE の意味と、いつどの設定を使うか（定性的）を説明できる。
- 高度計設定を 1 hPa 間違えたときの高度誤差のオーダー（約 30 ft）を暗算の足がかりとして持てる。
- 工学記事（ピトー静圧）で学んだ 3 計器のうち、**高度計が静圧**であることを再確認できる。

## 3. 必須セクション

1. 概要 — 気圧と高度の関係（低気圧＝高度計は高く読む等）。
2. QNH / QNE / QFE — 表形式推奨。
3. 高度の種類 — 圧力高度・密度高度への**一言**（詳細は工学 1-1-10 へリンク可）。
4. 設定ミスと安全 — Check Six 向け典型 3 パターン。
5. 五感比喩 + まとめ。

## 4. リンク要件

- **必須**: `/articles/PPL-1-2-2_PitotStatic`, `/articles/PPL-2-1-1_AtmosphereAndIsaBasics`
- **任意**: `/articles/PPL-1-1-10_TakeoffLandingPerformance`（密度高度）
- **任意 CPL**: `/articles/3.3.1_StandardAtmosphere`

## 5. Gemini 依頼文

```
PPL 航空気象「気圧と高度計設定（QNH/QNE/QFE）」の Markdown 本文のみ。YAML 禁止。
QNH/QNE/QFE の対照表を 1 つ含める。3000〜5000 字。
必須リンク: /articles/PPL-1-2-2_PitotStatic, /articles/PPL-2-1-1_AtmosphereAndIsaBasics
博多弁教官。高度計設定ミスの試験陷阱を 3 つ。
```

---

### 変更履歴

| 日付 | 内容 |
|------|------|
| 2026-06-24 | 初版 |
