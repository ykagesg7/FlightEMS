# Example: Application Default Credentials for Cursor's Google Analytics MCP (Admin API + Data API).
# Copy outside the repo or edit paths locally. Do not commit OAuth client secrets or ADC JSON.
# Canonical doc: docs/Cursor_MCP_Setup.md ("Google Analytics MCP").
#
# Prerequisites: Google Cloud SDK (`gcloud`), OAuth 2.0 Desktop client JSON from the same GCP project
# where Analytics Admin API and Analytics Data API are enabled.

$ErrorActionPreference = 'Stop'

# Downloaded Desktop client JSON (OAuth client ID + secret) — never commit
$ClientJson = Join-Path $env:USERPROFILE '.secrets\ga-oauth-desktop-adc.json'

# GCP project ID used for APIs and (optional) quota project
$GcloudProjectId = 'your-gcp-project-id'

$Scopes = 'https://www.googleapis.com/auth/analytics.readonly,https://www.googleapis.com/auth/cloud-platform'

if (-not (Test-Path -LiteralPath $ClientJson)) {
    Write-Error "Missing OAuth client JSON: $ClientJson"
}

gcloud auth application-default login `
    --client-id-file=$ClientJson `
    --scopes=$Scopes

# Optional but recommended: avoids some quota / project hint warnings
# Requires Cloud Resource Manager API on the project; CLI user may need `gcloud auth login` first.
gcloud auth application-default set-quota-project $GcloudProjectId

Write-Host @'
Done. Cursor MCP: set GOOGLE_APPLICATION_CREDENTIALS to your ADC file if required by your mcp.json
(for example %APPDATA%\gcloud\application_default_credentials.json on Windows). Restart Cursor after changes.
'@
