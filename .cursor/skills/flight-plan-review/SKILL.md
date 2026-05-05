---
name: flight-plan-review
description: >-
  Reviews flight plans for safety and consistency (fuel, alternates, weather margins,
  comms). Use when the user asks for a flight plan review, safety check,
  フライトプラン検証, or fuel leg validation. Uses project types in src/types.
disable-model-invocation: false
---

# Flight plan review skill

フライトプランの整合性・安全性をレビューし、問題点と改善案を構造化して返す。

## 参照する型・コード

- `FlightPlan` 等: [`src/types/index.ts`](../../../src/types/index.ts)
- 計画ドキュメント変換: [`src/utils/planDocument.ts`](../../../src/utils/planDocument.ts)
- エクスポート・デブリーフ関連: [`src/pages/planning/export/`](../../../src/pages/planning/export/)

## レビュー項目（優先順）

### Tier 1: 安全必須チェック

1. **燃料・航続** — 区間燃費・予備油・代替案が入力意図と整合するか（単位 `planDocument` と UI の表示を突合）。
2. **ルート・高度** — 制限・Waypoint 欠落、明らかな非連続がないか。
3. **気象・運用** — 出発・着陸・代替に関する前提が、ユーザが入力した条件と矛盾しないか（外部 NOTAM/WX は推測で断定しない）。
4. **コールサイン・識別** — 空の必須フィールドが残っていないか。

### Tier 2: 品質

5. **コミュニケーション** — 周波数・手順表の欠落がないか。
6. **ログ・エクスポート** — CSV/KML 等で必要キーが欠けないか。

### Tier 3: ベストプラクティス

7. **代替空港・余裕** — 代替が合理的か（断定が難しければ「確認質問」を列挙）。

## 出力フォーマット

```markdown
## フライトプラン・レビュー結果

### 要修正（安全・法令・明白な欠陥）
- …

### 確認推奨
- …

### 問題なし（確認済み）
- …

### 次のアクション
- …
```

## 手順

1. ユーザーが示したプラン（ファイル・JSON・画面状態の説明）を specific に把握する。
2. `src/types` の `FlightPlan` 形に照らして欠損・型の齟齬がないか見る。
3. Tier 1 → 2 → 3 の順でチェックする。
4. **推測でウェザー/NOTAMを断定しない**。不足情報は質問として返す。
5. 致命的問題がある場合は「このまま実行に移さない」と明記する。
