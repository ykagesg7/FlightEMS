# Gitコミットメッセージの文字化け修正方法

## 問題
過去のコミットメッセージが文字化けしている場合、GitHub上でも正しく表示されません。

## 解決方法

### 方法1: GitHub上で直接修正（推奨・最も簡単）

GitHubのWebインターフェースを使用してコミットメッセージを修正：

1. GitHubリポジトリのページを開く
2. コミット履歴から文字化けしているコミットを選択
3. コミットメッセージの横にある「...」メニューから「Edit commit message」を選択
4. 正しいUTF-8のコミットメッセージを入力して保存

**注意**: この方法は、コミットが既にプッシュされている場合に最も安全です。

### 方法2: Git rebaseを使用（上級者向け）

過去のコミットメッセージを修正するには、interactive rebaseを使用します：

```bash
# 最新の3つのコミットを修正
git rebase -i HEAD~3

# エディタで各コミットの 'pick' を 'reword' に変更
# 保存後、各コミットのメッセージをUTF-8で入力

# 修正後、force pushが必要
git push origin main --force-with-lease
```

**注意**:
- 既にプッシュされているコミットを修正する場合は、force pushが必要です
- 他の開発者と共有しているブランチでは注意が必要です

### 方法3: 各コミットを個別に修正

```bash
# 最新のコミットメッセージを修正
git commit --amend

# エディタでUTF-8でコミットメッセージを入力して保存

# 修正後、force push
git push origin main --force-with-lease
```

### 方法4: PowerShellスクリプトを使用

```powershell
# 最新のコミットメッセージを修正
$message = @"
修正後のコミットメッセージ
"@
$tempFile = [System.IO.Path]::GetTempFileName()
[System.IO.File]::WriteAllText($tempFile, $message, [System.Text.UTF8Encoding]::new($false))
git commit --amend -F $tempFile
Remove-Item $tempFile
```

## 今後の対策

### 1. Git設定を確認

```powershell
# セットアップスクリプトを実行
.\scripts\setup-git-encoding.ps1
```

### 2. コミットメッセージを一時ファイルから読み込む

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

### 3. Gitエディタを使用

```powershell
# VS CodeをGitエディタに設定（既に設定済み）
git config --global core.editor "code --wait"

# エディタでコミットメッセージをUTF-8で保存
git commit
```

## 確認方法

コミットメッセージが正しく保存されているか確認：

```bash
# 最新のコミットメッセージを表示
git log -1 --format=%B

# ファイルに出力して確認
git log -1 --format=%B | Out-File -Encoding UTF8 commit-message.txt
Get-Content commit-message.txt
```

## 注意事項

- **Force pushのリスク**: 既にプッシュされているコミットを修正する場合は、force pushが必要です。他の開発者と共有しているブランチでは注意が必要です。
- **GitHub上での表示**: PowerShellのコンソールで文字化けが表示されても、GitHub上では正しく表示される可能性があります。GitHubのWebインターフェースで確認してください。
- **今後のコミット**: 設定を正しく行えば、今後のコミットメッセージは正しく保存されます。

