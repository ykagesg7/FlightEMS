# GitコミットメッセージをUTF-8で正しく保存するためのヘルパースクリプト
# Usage: .\scripts\git-commit-utf8.ps1 -Message "コミットメッセージ" [-Files @("file1", "file2")]

param(
    [Parameter(Mandatory=$true)]
    [string]$Message,

    [Parameter(Mandatory=$false)]
    [string[]]$Files
)

# PowerShellのエンコーディングをUTF-8に設定
$PSDefaultParameterValues['*:Encoding'] = 'utf8'
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$OutputEncoding = [System.Text.Encoding]::UTF8

# 一時ファイルを作成してコミットメッセージを保存
$tempFile = [System.IO.Path]::GetTempFileName()
try {
    # UTF-8 BOMなしでファイルに書き込み
    [System.IO.File]::WriteAllText($tempFile, $Message, [System.Text.UTF8Encoding]::new($false))

    # ファイルが指定されている場合はそれらをステージング
    if ($Files -and $Files.Count -gt 0) {
        git add $Files
    }

    # コミットメッセージファイルを使用してコミット
    git commit -F $tempFile

    Write-Host "コミットが正常に完了しました。" -ForegroundColor Green
} finally {
    # 一時ファイルを削除
    if (Test-Path $tempFile) {
        Remove-Item $tempFile -Force
    }
}

