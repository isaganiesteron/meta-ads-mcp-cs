# Meta Ads MCP Server

A comprehensive Model Context Protocol (MCP) server for Meta (Facebook) Ads API, providing read-only access to ad accounts, campaigns, ad sets, ads, creatives, targeting data, and analytics. Built on Cloudflare Workers with SSE (Server-Sent Events) support for real-time communication with MCP clients.

## Features

- **39 Read-Only Tools**: Complete coverage of Meta Ads API for account management, campaign analysis, creative insights, targeting research, and performance analytics
- **SSE Support**: Real-time communication with MCP clients via Server-Sent Events
- **Cloudflare Workers**: Serverless deployment with global edge network
- **TypeScript**: Full type safety and excellent developer experience
- **Production Ready**: Includes error handling, CORS, health checks, and session management
- **TypingMind Compatible**: Tested and working with TypingMind MCP integration

## Available Tools

This MCP server provides 39 read-only tools organized into 9 categories:

### Account & Authentication Tools (4)

#### `mcp_meta_ads_get_ad_accounts`

Get all ad accounts accessible by the user.

- **Returns**: List of ad accounts with ID, name, status, currency, timezone

#### `mcp_meta_ads_get_account_info`

Get detailed information about a specific ad account.

- **Input**: `account_id`
- **Returns**: Account details including spend cap, balance, settings, business info

#### `mcp_meta_ads_get_account_pages`

Get Facebook Pages associated with an ad account.

- **Input**: `account_id`
- **Returns**: List of pages with ID, name, category, access tokens

#### `mcp_meta_ads_validate_token`

Validate current access token and get token information.

- **Returns**: Token validity, expiration date, scopes/permissions, user info, app info

### Campaign Data Tools (4)

#### `mcp_meta_ads_get_campaigns`

Get campaigns for an ad account with optional filtering.

- **Input**: `account_id`, `limit` (optional), `status_filter` (optional), `fields` (optional)
- **Returns**: List of campaigns with ID, name, status, objective, budget, dates

#### `mcp_meta_ads_get_campaign_details`

Get detailed information about a specific campaign.

- **Input**: `campaign_id`, `fields` (optional)
- **Returns**: Full campaign details including bid strategy, buying type, spend cap, pacing

#### `mcp_meta_ads_get_campaigns_by_ids`

Bulk fetch multiple campaigns at once.

- **Input**: `campaign_ids[]` (array of campaign IDs)
- **Returns**: Details for all requested campaigns in one call

#### `mcp_meta_ads_get_campaign_adsets`

Get all ad sets within a specific campaign.

- **Input**: `campaign_id`, `limit` (optional), `fields` (optional)
- **Returns**: List of ad sets belonging to the campaign

### Ad Set Data Tools (4)

#### `mcp_meta_ads_get_adsets`

Get ad sets for an account with optional filtering.

- **Input**: `account_id`, `limit` (optional), `campaign_id` (optional), `fields` (optional)
- **Returns**: List of ad sets with targeting, budget, schedule, optimization settings

#### `mcp_meta_ads_get_adset_details`

Get detailed information about a specific ad set.

- **Input**: `adset_id`, `fields` (optional)
- **Returns**: Full ad set details including targeting specs, delivery status, bid amount

#### `mcp_meta_ads_get_adsets_by_ids`

Bulk fetch multiple ad sets at once.

- **Input**: `adset_ids[]` (array of ad set IDs)
- **Returns**: Details for all requested ad sets in one call

#### `mcp_meta_ads_get_adset_ads`

Get all ads within a specific ad set.

- **Input**: `adset_id`, `limit` (optional), `fields` (optional)
- **Returns**: List of ads belonging to the ad set

### Ad Data Tools (4)

#### `mcp_meta_ads_get_ads`

Get ads for an account with optional filtering.

- **Input**: `account_id`, `limit` (optional), `campaign_id` (optional), `adset_id` (optional), `fields` (optional)
- **Returns**: List of ads with ID, name, status, creative ID, preview links

#### `mcp_meta_ads_get_ad_details`

Get detailed information about a specific ad.

- **Input**: `ad_id`, `fields` (optional)
- **Returns**: Full ad details including tracking specs, conversion specs, bid info

#### `mcp_meta_ads_get_ads_by_ids`

Bulk fetch multiple ads at once.

- **Input**: `ad_ids[]` (array of ad IDs)
- **Returns**: Details for all requested ads in one call

#### `mcp_meta_ads_get_ad_preview`

Get preview/rendering of how an ad appears.

- **Input**: `ad_id`, `ad_format` (desktop_feed, mobile_feed, instagram_standard, etc.)
- **Returns**: Preview HTML and image URLs showing how ad renders on different placements

### Creative Data Tools (6)

#### `mcp_meta_ads_get_ad_creatives`

Get creative details for a specific ad.

- **Input**: `ad_id`, `fields` (optional)
- **Returns**: Creative information including text, images, videos, call-to-action, link URLs

#### `mcp_meta_ads_get_ad_image`

Get and download ad image for visualization.

- **Input**: `ad_id`
- **Returns**: Image data, URLs, dimensions for visual analysis

#### `mcp_meta_ads_list_ad_creatives`

List all creatives in an ad account.

- **Input**: `account_id`, `limit` (optional), `fields` (optional)
- **Returns**: Complete list of creatives with IDs, names, types, status

#### `mcp_meta_ads_get_creative_details`

Get detailed information about a specific creative.

- **Input**: `creative_id`, `fields` (optional)
- **Returns**: Full creative specification including all assets, copy variations, link data

#### `mcp_meta_ads_get_creatives_by_ids`

Bulk fetch multiple creatives at once.

- **Input**: `creative_ids[]` (array of creative IDs)
- **Returns**: Details for all requested creatives in one call

#### `mcp_meta_ads_get_creative_preview`

Get preview URLs for a creative across different formats.

- **Input**: `creative_id`, `format` (optional)
- **Returns**: Preview images/videos showing creative rendering

### Targeting Research Tools (8)

#### `mcp_meta_ads_search_interests`

Search for interest targeting options by keyword.

- **Input**: `query`, `limit` (optional)
- **Returns**: Interest data with ID, name, audience size, category path

#### `mcp_meta_ads_get_interest_suggestions`

Get interest suggestions based on existing interests.

- **Input**: `interest_list[]` (array of interests), `limit` (optional)
- **Returns**: Suggested related interests with descriptions and audience sizes

#### `mcp_meta_ads_validate_interests`

Validate interest names or IDs for targeting.

- **Input**: `interest_list[]` (optional), `interest_fbid_list[]` (optional)
- **Returns**: Validation results showing which interests are valid with current audience sizes

#### `mcp_meta_ads_search_behaviors`

Get all available behavior targeting options.

- **Input**: `limit` (optional)
- **Returns**: Behavior targeting options with ID, name, audience size bounds, category path

#### `mcp_meta_ads_search_demographics`

Get demographic targeting options.

- **Input**: `demographic_class` (demographics, life_events, industries, income, family_statuses, etc.), `limit` (optional)
- **Returns**: Demographic options with ID, name, audience size, descriptions

#### `mcp_meta_ads_search_geo_locations`

Search for geographic targeting locations.

- **Input**: `query`, `location_types[]` (optional - country, region, city, zip, etc.), `limit` (optional)
- **Returns**: Location data with key, name, type, country code, region info

#### `mcp_meta_ads_validate_targeting`

Check if targeting specifications are valid.

- **Input**: `targeting_spec` (JSON object with age, gender, locations, interests, behaviors)
- **Returns**: Validation result with errors if targeting spec is invalid

#### `mcp_meta_ads_estimate_reach`

Get audience size estimates for targeting combination.

- **Input**: `targeting_spec`, `optimization_goal` (optional)
- **Returns**: Estimated daily/monthly reach, audience size min/max, and bid suggestions

### Diagnostics Tools (2)

#### `mcp_meta_ads_health_check`

Verify MCP server and Meta API connection status.

- **Returns**: Server status, API connectivity, token validity, version info

#### `mcp_meta_ads_get_api_limits`

Check current API rate limits and usage.

- **Input**: `account_id` (optional)
- **Returns**: Rate limit info, usage statistics, throttling status, call count

### Utility Tools (3)

#### `mcp_meta_ads_search`

Generic search across accounts, campaigns, ads, and pages.

- **Input**: `query`, `search_types[]` (accounts, campaigns, adsets, ads, pages)
- **Returns**: Matching records across all specified types

#### `mcp_meta_ads_fetch_pagination`

Fetch next page of results from a pagination URL.

- **Input**: `next_page_url` (from previous API response)
- **Returns**: Next page of data with pagination info

#### `mcp_meta_ads_get_all_pages`

Auto-fetch all paginated results for an endpoint.

- **Input**: `endpoint`, `params`, `max_pages` (optional)
- **Returns**: Complete dataset aggregated across all pages

### Bonus Analytics Tools (4)

> **Note**: These tools may require `read_insights` permission in your Meta access token.

#### `mcp_meta_ads_get_insights`

Get basic performance insights for account/campaign/adset/ad.

- **Input**: `object_id`, `level` (account, campaign, adset, ad), `time_range`, `fields` (optional)
- **Returns**: Performance metrics (impressions, clicks, spend, reach, frequency)

#### `mcp_meta_ads_get_creative_insights`

Get performance data for specific creatives.

- **Input**: `creative_id`, `time_range`
- **Returns**: Creative-level performance metrics

#### `mcp_meta_ads_compare_performance`

Side-by-side comparison of multiple objects.

- **Input**: `object_ids[]`, `metrics[]`, `time_range`
- **Returns**: Comparative performance data in table format

#### `mcp_meta_ads_export_insights`

Export performance data in JSON or CSV format.

- **Input**: `object_id`, `format` (json/csv), `time_range`, `fields` (optional)
- **Returns**: Formatted export data ready for download

## Quick Start

### 1. Fork this repository

Click the "Fork" button on GitHub to create your own copy of this template.

### 2. Clone your fork

```bash
git clone https://github.com/YOUR_USERNAME/your-mcp-server.git
cd your-mcp-server
```

### 3. Install dependencies

```bash
npm install
```

### 4. Configure Meta Ads API Access

You'll need a Meta (Facebook) access token with appropriate permissions. The required permissions depend on which tools you use:

**Minimum Required Permissions:**

- `ads_read` - For reading ad account, campaign, ad set, and ad data
- `ads_management` - For accessing account information and pages

**Additional Permissions (for Analytics Tools):**

- `read_insights` - For performance metrics and analytics tools

**How to Get an Access Token:**

1. Go to [Meta for Developers](https://developers.facebook.com/)
2. Create a new app or use an existing one
3. Add the "Marketing API" product to your app
4. Generate an access token with the required permissions
5. For production use, set up a System User or use OAuth flow

### 5. Set Up Environment Variables

Add your Meta access token as a secret:

```bash
# Using Wrangler CLI
wrangler secret put META_ACCESS_TOKEN
```

Or add it to your local `.dev.vars` file for development:

```
META_ACCESS_TOKEN=your_access_token_here
```

### 6. Customize Configuration

Open `src/index.ts` and update the CONFIG section:

```typescript
const CONFIG = {
	serverName: 'meta-ads-mcp',
	serverVersion: '1.0.0',
	serverDescription: 'Meta Ads MCP Server - Read-only access to Meta Ads API',
	protocolVersion: '2024-11-05',
	keepAliveInterval: 30000,
} as const;
```

Update `package.json` and `wrangler.jsonc` with your project name.

### 7. Test locally

```bash
npm run dev
```

Your server will be available at `http://localhost:8787`

Test the health endpoint:

```bash
curl http://localhost:8787
```

### 8. Deploy to Cloudflare Workers

```bash
npm run deploy
```

After deployment, Cloudflare will provide your worker URL (e.g., `https://typingmind-mcp-cloudflare-starter.YOUR_SUBDOMAIN.workers.dev`)

## Meta Ads API Configuration

### API Version

This MCP server uses the Meta Marketing API. The API version is configured in the code and should be kept up to date. Check [Meta's API Changelog](https://developers.facebook.com/docs/graph-api/changelog) for version updates.

### Rate Limits

Meta Ads API has rate limits based on:

- **Ad Account Level**: 4800 calls per hour per ad account
- **App Level**: 200 calls per hour per user per app

The `mcp_meta_ads_get_api_limits` tool can help you monitor your current usage.

### Required Permissions Summary

| Tool Category            | Required Permissions         |
| ------------------------ | ---------------------------- |
| Account & Authentication | `ads_read`, `ads_management` |
| Campaign/Ad Set/Ad Data  | `ads_read`                   |
| Creative Data            | `ads_read`                   |
| Targeting Research       | `ads_read`                   |
| Analytics Tools          | `ads_read`, `read_insights`  |

### Access Token Best Practices

1. **Never commit tokens to version control** - Always use environment variables or secrets
2. **Use System Users for production** - More secure than user tokens
3. **Rotate tokens regularly** - Set up token refresh mechanisms
4. **Scope permissions minimally** - Only request permissions you actually need
5. **Monitor token expiration** - Use `mcp_meta_ads_validate_token` to check token status

## Using with TypingMind

1. Deploy your MCP server to Cloudflare Workers
2. In TypingMind, go to Settings → MCP Servers
3. Add a new server:
   - **Name**: Meta Ads MCP
   - **URL**: Your Cloudflare Worker URL (e.g., `https://meta-ads-mcp.YOUR_SUBDOMAIN.workers.dev/sse`)
   - **Transport**: SSE
4. Test the connection using `mcp_meta_ads_health_check`

## Project Structure

```
.
├── src/
│   └── index.ts          # Main MCP server code
├── test/
│   └── index.spec.ts     # Tests
├── wrangler.jsonc        # Cloudflare Workers config
├── package.json          # Dependencies and scripts
├── tsconfig.json         # TypeScript config
└── README.md             # This file
```

## API Endpoints

- `GET /` - Health check endpoint
- `GET /sse` - SSE endpoint for establishing connection
- `POST /sse` - Direct HTTP endpoint (for clients that don't use SSE)
- `POST /sse/message?sessionId={id}` - Message endpoint for active SSE sessions

## Tool Development Guide

### Meta Ads API Integration

All tools interact with the Meta Marketing API. The base API endpoint is:

```
https://graph.facebook.com/v{version}/{object_id}
```

### Example Tool Implementation

Here's an example of how a Meta Ads tool is structured:

```typescript
{
	name: 'mcp_meta_ads_get_campaigns',
	description: 'Get campaigns for an ad account with optional filtering',
	inputSchema: {
		type: 'object',
		properties: {
			account_id: {
				type: 'string',
				description: 'The Meta ad account ID (e.g., act_123456789)'
			},
			limit: {
				type: 'number',
				description: 'Maximum number of campaigns to return (default: 25)'
			},
			status_filter: {
				type: 'string',
				description: 'Filter by status: ACTIVE, PAUSED, ARCHIVED, etc.'
			},
			fields: {
				type: 'array',
				items: { type: 'string' },
				description: 'Specific fields to return (default: all)'
			},
		},
		required: ['account_id'],
	},
	handler: async (args, env) => {
		try {
			const accessToken = env.META_ACCESS_TOKEN;
			const accountId = args.account_id as string;
			const limit = (args.limit as number) || 25;

			// Build API request
			const fields = args.fields
				? (args.fields as string[]).join(',')
				: 'id,name,status,objective,daily_budget,lifetime_budget,start_time,end_time';

			const url = `https://graph.facebook.com/v18.0/${accountId}/campaigns?fields=${fields}&limit=${limit}&access_token=${accessToken}`;

			if (args.status_filter) {
				url += `&filtering=[{"field":"status","operator":"IN","value":["${args.status_filter}"]}]`;
			}

			const response = await fetch(url);

			if (!response.ok) {
				const error = await response.json();
				throw new Error(`Meta API error: ${error.error?.message || 'Unknown error'}`);
			}

			const data = await response.json();

			return {
				content: [
					{
						type: 'text',
						text: JSON.stringify(data, null, 2),
					},
				],
			};
		} catch (error) {
			throw new Error(`Failed to fetch campaigns: ${error.message}`);
		}
	},
}
```

### Error Handling Best Practices

1. **Always check API responses** - Meta API returns errors in a specific format
2. **Handle rate limits** - Return helpful messages when rate limited
3. **Validate inputs** - Check account IDs, object IDs format before API calls
4. **Provide context** - Include the original error message in thrown errors

### Common Meta API Patterns

**Pagination:**

```typescript
// Meta API uses cursor-based pagination
const response = await fetch(url);
const data = await response.json();

// Check for next page
if (data.paging && data.paging.next) {
	// Use mcp_meta_ads_fetch_pagination tool or fetch directly
}
```

**Field Selection:**

```typescript
// Always specify fields to reduce payload size
const fields = 'id,name,status,objective';
```

**Filtering:**

```typescript
// Use filtering parameter for status, date ranges, etc.
const filtering = JSON.stringify([{ field: 'status', operator: 'IN', value: ['ACTIVE', 'PAUSED'] }]);
```

### Using Cloudflare Workers Features

You can use all Cloudflare Workers features in your tools:

```typescript
// KV Storage (requires binding in wrangler.jsonc)
handler: async (args, env) => {
	await env.MY_KV.put('key', 'value');
	const value = await env.MY_KV.get('key');
	// ...
};

// D1 Database (requires binding in wrangler.jsonc)
handler: async (args, env) => {
	const result = await env.DB.prepare('SELECT * FROM users').all();
	// ...
};

// R2 Storage (requires binding in wrangler.jsonc)
handler: async (args, env) => {
	await env.MY_BUCKET.put('file.txt', 'content');
	// ...
};
```

To use these features, update your `wrangler.jsonc` with the appropriate bindings.

## Advanced Configuration

### Environment Variables

**Required Secret:**

```bash
# Meta Ads API Access Token (REQUIRED)
wrangler secret put META_ACCESS_TOKEN
```

**Optional Configuration:**

```bash
# Meta API Version (optional, defaults to latest)
wrangler secret put META_API_VERSION

# Or in wrangler.jsonc for non-sensitive vars
{
	"vars": {
		"META_API_VERSION": "v18.0",
		"ENVIRONMENT": "production"
	}
}
```

**Local Development:**
Create a `.dev.vars` file in the project root:

```
META_ACCESS_TOKEN=your_access_token_here
META_API_VERSION=v18.0
```

Access in your code:

```typescript
handler: async (args, env) => {
	const accessToken = env.META_ACCESS_TOKEN;
	const apiVersion = env.META_API_VERSION || 'v18.0';
	// ...
};
```

### CORS Configuration

By default, CORS allows all origins (`*`). To restrict:

```typescript
const corsHeaders = {
	'Access-Control-Allow-Origin': 'https://yourdomain.com',
	'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
	'Access-Control-Allow-Headers': 'Content-Type, Accept',
};
```

### Custom Keep-Alive Interval

Modify in CONFIG section:

```typescript
const CONFIG = {
	keepAliveInterval: 60000, // 60 seconds instead of 30
	...
};
```

## Testing

Run tests:

```bash
npm test
```

The template includes Vitest with Cloudflare Workers test environment.

## Troubleshooting

### Meta API Authentication Issues

**"Invalid OAuth access token" error:**

- Verify your `META_ACCESS_TOKEN` is set correctly: `wrangler secret list`
- Check token hasn't expired using `mcp_meta_ads_validate_token`
- Ensure token has required permissions (`ads_read`, `ads_management`)
- For production, use System User tokens instead of user tokens

**"Insufficient permissions" error:**

- Check which permissions your token has: `mcp_meta_ads_validate_token`
- Request additional permissions in Meta App Dashboard
- For analytics tools, ensure `read_insights` permission is granted

### API Rate Limiting

**"User request limit reached" error:**

- Check current usage: `mcp_meta_ads_get_api_limits`
- Implement exponential backoff in tool handlers
- Consider caching frequently accessed data
- Use bulk endpoints (`get_by_ids` tools) to reduce call count

### Invalid Account/Object IDs

**"Invalid account ID" or "Object not found" errors:**

- Ensure account IDs are prefixed with `act_` (e.g., `act_123456789`)
- Verify you have access to the account
- Use `mcp_meta_ads_get_ad_accounts` to list accessible accounts
- Check object IDs match the expected format (campaigns: numeric, adsets: numeric, etc.)

### Tool Not Found Errors

- Ensure tool names match exactly (case-sensitive, with `mcp_meta_ads_` prefix)
- Check that tool is in the TOOLS array in `src/index.ts`
- Verify the tool is being exported in tools/list response

### SSE Connection Issues

- Check CORS headers if connecting from a web app
- Verify firewall isn't blocking SSE connections
- Test with `curl -N http://localhost:8787/sse` to see raw SSE stream
- Ensure TypingMind is using the correct URL with `/sse` endpoint

### Deployment Issues

- Ensure you're logged in to Cloudflare: `wrangler login`
- Check that worker name in wrangler.jsonc is unique
- Verify your Cloudflare account has Workers enabled
- Ensure `META_ACCESS_TOKEN` secret is set: `wrangler secret put META_ACCESS_TOKEN`

## Resources

### Meta Ads API Documentation

- [Meta Marketing API Overview](https://developers.facebook.com/docs/marketing-apis)
- [Marketing API Reference](https://developers.facebook.com/docs/marketing-api/reference)
- [Access Tokens Guide](https://developers.facebook.com/docs/marketing-api/access)
- [Rate Limiting](https://developers.facebook.com/docs/marketing-api/rate-limiting)
- [API Changelog](https://developers.facebook.com/docs/graph-api/changelog)
- [Targeting API](https://developers.facebook.com/docs/marketing-api/audiences/reference/targeting-search)

### MCP & Infrastructure

- [MCP Protocol Documentation](https://modelcontextprotocol.io/)
- [Cloudflare Workers Docs](https://developers.cloudflare.com/workers/)
- [TypingMind MCP Guide](https://docs.typingmind.com/)
- [Server-Sent Events (SSE)](https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events)

### Tools & Testing

- [Graph API Explorer](https://developers.facebook.com/tools/explorer/) - Test API calls interactively
- [Meta Business Help Center](https://www.facebook.com/business/help) - Business and API support

## License

MIT

## Contributing

Contributions are welcome! Please open an issue or submit a pull request.

## Support

If you encounter issues:

1. Check the Troubleshooting section above
2. Review Cloudflare Workers logs: `wrangler tail`
3. Test your Meta access token: `mcp_meta_ads_validate_token`
4. Check Meta API status: [Meta Platform Status](https://developers.facebook.com/status/)
5. Open an issue on GitHub with:
   - Your wrangler.jsonc (remove sensitive data)
   - Error messages from logs
   - Steps to reproduce
   - Meta API error details (if applicable)

---

Built with the Model Context Protocol (MCP) for TypingMind and other MCP clients. Provides read-only access to Meta (Facebook) Ads API with 39 comprehensive tools.
