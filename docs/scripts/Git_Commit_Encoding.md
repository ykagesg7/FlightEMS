# Git コミットメッセージの文字化け対策（Windows 補足）

本リポジトリでは **コミットメッセージは英語のみ**（[.cursor/rules/git-conventions.mdc](../../.cursor/rules/git-conventions.mdc)）を推奨し、PowerShell の文字化けを避けます。

日本語をどうしても使う場合の UTF-8 設定・`git-commit-utf8.ps1` の使い方などは、従来 `scripts/README-git-commit.md` にあった内容を以下に要約します。

## Git 設定（任意）

```powershell
git config --global core.quotepath false
git config --global i18n.commitencoding utf-8
git config --global i18n.logoutputencoding utf-8
```

## PowerShell（任意）

```powershell
$PSDefaultParameterValues['*:Encoding'] = 'utf8'
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
chcp 65001
```

## スクリプト

`scripts/git-commit-utf8.ps1` で UTF-8 コミットが可能（詳細はスクリプト内コメント参照）。
