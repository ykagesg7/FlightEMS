# Gitコミットメッセージの文字化け対策

## 問題
Windows環境でGitコミットメッセージに日本語を含めると、文字化けが発生する場合があります。

## 解決方法

### 1. Git設定の確認・修正（推奨）

以下のコマンドでGitのエンコーディング設定を確認・修正してください：

```powershell
# パス名の引用を無効化（日本語ファイル名の表示を改善）
git config --global core.quotepath false

# コミットメッセージのエンコーディングをUTF-8に設定
git config --global i18n.commitencoding utf-8

# ログ出力のエンコーディングをUTF-8に設定
git config --global i18n.logoutputencoding utf-8
```

### 2. PowerShellのエンコーディング設定

PowerShellセッションで以下のコマンドを実行：

```powershell
# PowerShellのデフォルトエンコーディングをUTF-8に設定
$PSDefaultParameterValues['*:Encoding'] = 'utf8'
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$OutputEncoding = [System.Text.Encoding]::UTF8

# コードページをUTF-8に設定
chcp 65001
```

### 3. ヘルパースクリプトの使用

`scripts/git-commit-utf8.ps1`スクリプトを使用してコミット：

```powershell
# すべての変更をコミット
.\scripts\git-commit-utf8.ps1 -Message "コミットメッセージ"

# 特定のファイルのみをコミット
.\scripts\git-commit-utf8.ps1 -Message "コミットメッセージ" -Files @("file1.ts", "file2.ts")
```

### 4. コミットメッセージファイルを使用（最も確実）

一時ファイルにコミットメッセージをUTF-8で保存してからコミット：

```powershell
# コミットメッセージをUTF-8でファイルに保存
$message = "コミットメッセージ"
$tempFile = [System.IO.Path]::GetTempFileName()
[System.IO.File]::WriteAllText($tempFile, $message, [System.Text.UTF8Encoding]::new($false))

# ファイルからコミットメッセージを読み込んでコミット
git commit -F $tempFile

# 一時ファイルを削除
Remove-Item $tempFile
```

## 確認方法

設定が正しく適用されているか確認：

```powershell
git config --global --get core.quotepath
git config --global --get i18n.commitencoding
git config --global --get i18n.logoutputencoding
```

## 注意事項

- Git設定は`~/.gitconfig`（Windowsでは`C:\Users\<ユーザー名>\.gitconfig`）に保存されます
- 設定変更後、新しいコミットから効果が反映されます
- 既存のコミットメッセージは変更されません

