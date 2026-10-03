---
name: 出陣状（gungi-task）
about: 家老 Grok Bot / 上様が起票する、侍大将（Cursor クラウドエージェント）向けの作業依頼
title: "[gungi] "
labels: ["gungi-task", "status:ready"]
---

<!-- 1 Issue = 1 責務。受入条件はコマンドで書く。推測で欄を埋めない（不明は「不明」と書く）。 -->

## 一、背景
- **起点**: <!-- 斥候の検知 / 上様の指示 / Inspector の HIGH / Sentry など -->
- **参照 URL・原文**: <!-- 法令・通達の場合は取得日時（JST）も -->
- **要点（1〜3行）**:

## 二、侍大将への下知
- **領域**: <!-- domain:planning / domain:content / domain:quiz / domain:3d / domain:infra -->
- **やること**:
  1.
- **想定ファイル**:
  - `src/...`
- **適用する軍令**: `.cursor/rules/core-project.mdc` / `aviation.mdc` / `mdx-article-guide.mdc` <!-- 該当を残す -->
- **やらないこと（範囲外）**:
  -
- **触るな（`docs/Closed_Sprints.md` §2 から該当行を転記）**:
  -

## 三、目付の検分基準（すべて CI で機械判定）
- [ ] `mekiki-ci / inspect` が Green（tsc -b / lint / test:run / test:golden / check:cesium-cdn / build）
- [ ] 追加・変更した計算に単体テストがある: <!-- テストファイル名 -->
- [ ] `gungi/golden-tests/` を変更していない（変更が必要なら PR 本文に根拠と出典を書き、上様の `golden-change-approved` を待つ）
- [ ] UI 変更なし <!-- UI 変更がある場合は「上様承認済み: 日付」と書く -->

## 四、上様の確認事項（PR 時）
- **Preview で見る場所**: <!-- 例: /planning → Route タブ → RJFF-RJTT -->
- **本番 SQL の有無**: なし <!-- ある場合は SQL 案を PR に添付、実行は上様承認後 -->

---
<!-- 家老管理欄（手で編集しない） -->
- 三振: 0/2
- 侍大将 起動回数: 0/3
