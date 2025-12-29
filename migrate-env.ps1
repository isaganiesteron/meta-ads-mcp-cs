# PowerShell script to migrate .env to .dev.vars
# Run this script from the project root: .\migrate-env.ps1

Write-Host "Migrating .env to .dev.vars..." -ForegroundColor Cyan

if (-not (Test-Path .env)) {
    Write-Host ".env file not found!" -ForegroundColor Red
    Write-Host "   Please create .env file with your META_ACCESS_TOKEN" -ForegroundColor Yellow
    exit 1
}

# Read .env file
$envLines = Get-Content .env

# Find META_ACCESS_TOKEN
$tokenLine = $envLines | Where-Object { $_ -match '^\s*META_ACCESS_TOKEN\s*=' }
$apiVersionLine = $envLines | Where-Object { $_ -match '^\s*META_API_VERSION\s*=' }

# Create .dev.vars
$devVarsContent = @()

if ($tokenLine) {
    # Remove comments and clean up
    $cleanToken = $tokenLine -replace '#.*$', '' -replace '^\s+', '' -replace '\s+$', ''
    $devVarsContent += $cleanToken
    Write-Host "Found META_ACCESS_TOKEN" -ForegroundColor Green
} else {
    Write-Host "WARNING: META_ACCESS_TOKEN not found in .env" -ForegroundColor Yellow
    $devVarsContent += "META_ACCESS_TOKEN=your_meta_access_token_here"
}

# Add API version
if ($apiVersionLine) {
    $cleanVersion = $apiVersionLine -replace '#.*$', '' -replace '^\s+', '' -replace '\s+$', ''
    $devVarsContent += $cleanVersion
} else {
    $devVarsContent += "META_API_VERSION=v19.0"
}

# Write to .dev.vars (write each line separately)
$devVarsContent | ForEach-Object { $_ } | Out-File -FilePath .dev.vars -Encoding utf8

Write-Host ""
Write-Host "Created .dev.vars file!" -ForegroundColor Green
Write-Host ""
Write-Host "Contents:" -ForegroundColor Cyan
Get-Content .dev.vars | ForEach-Object { Write-Host "   $_" }
Write-Host ""
Write-Host "You can now run: npm run dev" -ForegroundColor Green

