# Gitコミットメッセージの文字化け対策セットアップスクリプト
# このスクリプトを実行すると、Gitのエンコーディング設定が自動的に設定されます

Write-Host "Gitコミットメッセージの文字化け対策を設定しています..." -ForegroundColor Yellow

# PowerShellのエンコーディングをUTF-8に設定
$PSDefaultParameterValues['*:Encoding'] = 'utf8'
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$OutputEncoding = [System.Text.Encoding]::UTF8

# コードページをUTF-8に設定
chcp 65001 | Out-Null

# Git設定
git config --global core.quotepath false
git config --global i18n.commitencoding utf-8
git config --global i18n.logoutputencoding utf-8
git config --global core.precomposeunicode true

Write-Host "設定が完了しました。以下の設定が適用されました:" -ForegroundColor Green
Write-Host "  - core.quotepath: false" -ForegroundColor Cyan
Write-Host "  - i18n.commitencoding: utf-8" -ForegroundColor Cyan
Write-Host "  - i18n.logoutputencoding: utf-8" -ForegroundColor Cyan
Write-Host "  - core.precomposeunicode: true" -ForegroundColor Cyan
Write-Host ""
Write-Host "今後のコミットメッセージはUTF-8で正しく保存されます。" -ForegroundColor Green
Write-Host ""
Write-Host "コミットメッセージを正しく保存するには、以下のいずれかの方法を使用してください:" -ForegroundColor Yellow
Write-Host "  1. 一時ファイルを使用: git commit -F <ファイル名>" -ForegroundColor White
Write-Host "  2. ヘルパースクリプトを使用: .\scripts\git-commit-utf8.ps1 -Message 'メッセージ'" -ForegroundColor White
Write-Host "  3. Gitエディタを使用: git commit (エディタでUTF-8で保存)" -ForegroundColor White

