# tools/

プロジェクト用の外部ツール（アプリランタイム非依存）。

## natural-japanese（脱AI臭の検査官）

- **Upstream:** [coji/natural-japanese](https://github.com/coji/natural-japanese)（MIT）
- **Vendored:** `tools/natural-japanese/`（`UPSTREAM.md` に commit）
- **Cursor Skill:** [`.cursor/skills/mdx-ai-smell-inspect/SKILL.md`](../.cursor/skills/mdx-ai-smell-inspect/SKILL.md)

用途は **MDX の診断（lint / score）のみ**。道真・博多弁・口頭試問の全文リライトには使わない。

### 前提

- [uv](https://docs.astral.sh/uv/)（初回に sudachipy 辞書を取得）

### 例

```bash
uv run tools/natural-japanese/scripts/lint.py --genre tech src/content/lessons/CP-3-1_ConfiguredHandling.mdx
```
