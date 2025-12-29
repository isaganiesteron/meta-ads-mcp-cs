# Meta Ads MCP Setup Guide

## Quick Setup

### 1. Migrate from `.env` to `.dev.vars`

If you have a `.env` file with your Meta Ads credentials, you need to copy them to `.dev.vars` (Wrangler uses `.dev.vars` for local development).

**Option 1: Manual Migration**

1. Copy the example file:
   ```bash
   cp .dev.vars.example .dev.vars
   ```

2. Open `.dev.vars` and add your credentials from `.env`:
   ```
   META_ACCESS_TOKEN=your_token_from_env_file
   META_API_VERSION=v19.0
   ```

**Option 2: PowerShell Script (Windows)**

```powershell
# Read META_ACCESS_TOKEN from .env and create .dev.vars
$envContent = Get-Content .env
$tokenLine = $envContent | Where-Object { $_ -match 'META_ACCESS_TOKEN' }
if ($tokenLine) {
    $tokenLine | Out-File -FilePath .dev.vars -Encoding utf8
    "META_API_VERSION=v19.0" | Out-File -FilePath .dev.vars -Append -Encoding utf8
    Write-Host "✅ Created .dev.vars from .env"
} else {
    Write-Host "⚠️ META_ACCESS_TOKEN not found in .env"
}
```

**Option 3: Bash Script (Linux/Mac)**

```bash
# Extract META_ACCESS_TOKEN from .env and create .dev.vars
grep META_ACCESS_TOKEN .env > .dev.vars 2>/dev/null || echo "META_ACCESS_TOKEN=your_token_here" > .dev.vars
echo "META_API_VERSION=v19.0" >> .dev.vars
echo "✅ Created .dev.vars from .env"
```

### 2. Verify Your Setup

Check that `.dev.vars` exists and contains your token:

```bash
# Windows PowerShell
Get-Content .dev.vars

# Linux/Mac
cat .dev.vars
```

### 3. Test Locally

Start the development server:

```bash
npm run dev
```

The server will automatically load variables from `.dev.vars`.

### 4. Test the Connection

Once the server is running, test the health check:

```bash
curl http://localhost:8787
```

Or use the MCP client to call `mcp_meta_ads_health_check` tool.

## Environment Variables

### Required Variables

- `META_ACCESS_TOKEN` - Your Meta (Facebook) Ads API access token

### Optional Variables

- `META_API_VERSION` - API version (defaults to `v19.0`)

## Production Deployment

For production, set secrets using Wrangler:

```bash
wrangler secret put META_ACCESS_TOKEN
wrangler secret put META_API_VERSION  # Optional
```

## Troubleshooting

### "META_ACCESS_TOKEN is not configured"

- Ensure `.dev.vars` exists in the project root
- Check that `META_ACCESS_TOKEN` is set in `.dev.vars`
- Restart the dev server after creating/modifying `.dev.vars`

### Token Validation Errors

- Verify your token has the required permissions (`ads_read`, `ads_management`)
- Use `mcp_meta_ads_validate_token` tool to check token status
- Ensure token hasn't expired

