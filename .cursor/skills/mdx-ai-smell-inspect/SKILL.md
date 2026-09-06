---
name: mdx-ai-smell-inspect
description: >-
  FlightAcademy MDX 「脱AI臭」検査官。natural-japanese の lint/score のみ使用。
  博多弁・ジョー口頭試問・CP契約文は書き換えない。Triggers: 脱AI臭, AI臭い,
  natural-japanese, AI臭検査, mdx lint 日本語, 精緻化診断.
disable-model-invocation: false
---

# MDX AI-smell Inspect（脱AI臭の検査官）

[coji/natural-japanese](https://github.com/coji/natural-japanese) を **診断専用** で使う。  
FlightAcademy の声（道真・博多弁・教官ジョー）や航空安全契約の **全文リライトはしない**。

Vendored upstream: [`tools/natural-japanese/`](../../../tools/natural-japanese/)（`UPSTREAM.txt` に commit）。

## When to use

- CP / FMT / PPL レッスン MDX の精緻化前・推敲中
- 「AI臭いか」「自然度を測って」「禁止定型句を洗い出して」
- W37 など配信前ストックの品質ゲート

## When NOT to use

- 「もっと自然な日本語に全部書き直して」（→ 禁止。`mdx-content` + 契約正本）
- UI / コード / SQL 変更
- 航空法規の条文言い換え

## Priority（必ずこの順）

1. **契約・安全** — [`mdx-article-guide`](../../rules/mdx-article-guide.mdc) と CP 正本「公開本文の契約」
2. **本 Skill（検査）** — lint / score のみ。指摘を台帳化
3. **リライト** — agent `mdx-content`（明示依頼時）。検査結果の「直す」項目だけ
4. 必要なら agent `aviation-safety-review`

## Default mode: score / lint only

ユーザーが「直して」「リライトして」と **明示しない限り**、MDX を編集しない。  
診断結果と仕分け提案だけ返す。

### Commands（要 `uv`）

リポジトリルートから:

```bash
# 既定: tech ジャンル（誤検知抑制）
uv run tools/natural-japanese/scripts/lint.py --genre tech path/to/file.mdx

# JSON（台帳用）
uv run tools/natural-japanese/scripts/lint.py --genre tech --json path/to/file.mdx

# 読解負荷（スコア外・推敲ヒント）
uv run tools/natural-japanese/scripts/lint.py --genre tech --reading-load path/to/file.mdx

# 見出し・段落先頭の骨格
uv run tools/natural-japanese/scripts/outline.py path/to/file.mdx

# 専門用語の初出チェック材料
uv run tools/natural-japanese/scripts/terms.py path/to/file.mdx
```

`uv` が無い場合は [`tools/natural-japanese/references/manual-checklist.md`](../../../tools/natural-japanese/references/manual-checklist.md) を人手でなぞる。  
詳細スコア定義は [`tools/natural-japanese/references/diagnose.md`](../../../tools/natural-japanese/references/diagnose.md)。

初回 `uv run` は sudachipy / 辞書のダウンロードで時間がかかる（正常）。

## 仕分けルール（直す / 残す）

| 領域 | 既定 |
|------|------|
| 詳細解説 PREP の説明文にある「重要なのは」「と言えるだろう」等の空句 | **直す候補** |
| 均一すぎる段落リズム・前置きだけの結論 | **直す候補** |
| 道真の語尾（`ばい` 等）・博多弁のリズム | **残す** |
| 口頭試問（`学生：` / `教官ジョー`）・Holding の比喩 | **残す** |
| 「立場の明確化」・実施禁止・T-38 枠の定型 | **残す**（契約） |
| 専門略語（AOA, buffet, unload, ATS…）の繰り返し | **残す**（教程語）。初出説明不足だけ terms で確認 |
| `Highlight` / PREP 見出し形式 | **残す**（型） |

finding ごとに「直す / 残す（理由）」を表で出す。機械的な全置換は禁止。

## Output template

```markdown
## AI-smell inspect — {path}

**Mode:** diagnose only（未編集）
**lint:** findings N / genre tech
**Score note:** （diagnose.md に従う。無理なら findings 要約のみ）

| # | finding / 箇所 | 判断 | 理由 |
|---|----------------|------|------|
| 1 | … | 直す候補 / 残す | … |

**次:** 直す候補だけ `mdx-content` で精緻化するか確認（勝手に書かない）
```

## Done when

- lint（または manual-checklist）を実行した
- 仕分け表がある
- ユーザー明示なしに MDX を書き換えていない
- 中間 JSON を作業ツリーに残していない（一時なら削除）
