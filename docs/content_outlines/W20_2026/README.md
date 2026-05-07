# 2026-W20（5月第2週）コンテンツ素案 — 索引

**スプリント正本**: [May_2026_Late_Content_Sprint.md](../May_2026_Late_Content_Sprint.md)（ブロック A）  
**共通ルール**: [External_LLM_Article_Brief.md](../../templates/External_LLM_Article_Brief.md)

| 素案ファイル | 対象 MDX | Gemini で依頼する主作業 |
|--------------|----------|-------------------------|
| [3.2.7_LiftAndDrag_gemini_brief.md](3.2.7_LiftAndDrag_gemini_brief.md) | `src/content/lessons/3.2.7_LiftAndDrag.mdx` | 既存長文への **深文化追記**（動圧・CL、アスペクト比、PPL リンク、試験 1 問） |
| [PPL-1-1-3_BernoulliPrinciple_gemini_brief.md](PPL-1-1-3_BernoulliPrinciple_gemini_brief.md) | `src/content/lessons/PPL-1-1-3_BernoulliPrinciple.mdx` | **追記セクション 1 本**（CPL `3.2.7` への橋渡し） |
| [PPL-1-1-4_DragBasics_gemini_brief.md](PPL-1-1-4_DragBasics_gemini_brief.md) | `src/content/lessons/PPL-1-1-4_DragBasics.mdx` | **追記パラグラフ**（全抗力の U 字・L/D MAX と CPL の接続） |

作業の流れ: 各 `*_gemini_brief.md` を Gemini に渡し、返った Markdown を人間が MDX に組み込み、`meta` ・ import を整合。
