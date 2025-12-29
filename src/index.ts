/// <reference types="../worker-configuration" />

/**
 * ============================================================================
 * CUSTOMIZATION SECTION - Meta Ads MCP Configuration
 * ============================================================================
 */
const CONFIG = {
	serverName: 'meta-ads-mcp',
	serverVersion: '1.0.0',
	serverDescription: 'Meta Ads MCP Server - Read-only access to Meta Ads API',
	protocolVersion: '2024-11-05',
	keepAliveInterval: 30000, // 30 seconds
	metaApiVersion: 'v19.0', // Meta Marketing API version (matches main codebase)
	rateLimitDelay: 5, // Minimum delay between requests (5ms for burst protection)
	// Meta API Rate Limits (per hour):
	// - Ad Account Level: 4800 calls/hour per ad account
	// - App Level: 200 calls/hour per user per app (MOST RESTRICTIVE)
	// We track hourly usage and enforce the app-level limit
	appLevelRateLimit: 200, // Calls per hour (most restrictive limit)
	accountLevelRateLimit: 4800, // Calls per hour per account
	maxRetries: 3, // Maximum retry attempts
	requestTimeout: 30000, // 30 seconds timeout
} as const;

/**
 * ============================================================================
 * TOOL DEFINITIONS - Add your custom tools here
 * ============================================================================
 * Each tool should have:
 * - name: unique identifier for the tool
 * - description: what the tool does
 * - inputSchema: JSON schema defining the input parameters
 * - handler: function that executes the tool logic
 */

interface Env {
	META_ACCESS_TOKEN?: string;
	META_API_VERSION?: string;
}

interface Tool {
	name: string;
	description: string;
	inputSchema: {
		type: string;
		properties: Record<string, { type: string; description: string; items?: { type: string } }>;
		required: string[];
	};
	handler: (args: Record<string, unknown>, env: Env) => Promise<ToolResult> | ToolResult;
}

interface ToolResult {
	content: Array<{
		type: string;
		text: string;
	}>;
}

/**
 * ============================================================================
 * HELPER FUNCTIONS - Meta Ads API utilities (matching main codebase patterns)
 * ============================================================================
 */

// Rate limiting: Track requests per hour to respect Meta API limits
interface RateLimitTracker {
	requests: number[];
	lastRequestTime: number;
}

// Track requests in sliding window (last hour)
const rateLimitTracker: RateLimitTracker = {
	requests: [], // Timestamps of requests in the last hour
	lastRequestTime: 0,
};

// Calculate minimum delay needed to stay within rate limits
function calculateRequiredDelay(): number {
	const now = Date.now();
	const oneHourAgo = now - 3600000; // 1 hour in milliseconds

	// Remove requests older than 1 hour
	rateLimitTracker.requests = rateLimitTracker.requests.filter((timestamp) => timestamp > oneHourAgo);

	const requestsInLastHour = rateLimitTracker.requests.length;
	const appLevelLimit = CONFIG.appLevelRateLimit; // 200/hour

	// If we're at or over the limit, calculate when we can make the next request
	if (requestsInLastHour >= appLevelLimit) {
		// Find the oldest request that's still within the hour
		const oldestRequest = rateLimitTracker.requests[0];
		if (oldestRequest) {
			const timeUntilOldestExpires = oldestRequest + 3600000 - now;
			return Math.max(timeUntilOldestExpires, CONFIG.rateLimitDelay);
		}
	}

	// Minimum delay between requests (burst protection)
	const timeSinceLastRequest = now - rateLimitTracker.lastRequestTime;
	if (timeSinceLastRequest < CONFIG.rateLimitDelay) {
		return CONFIG.rateLimitDelay - timeSinceLastRequest;
	}

	return 0; // No delay needed
}

// Enforce rate limiting based on Meta API limits
async function enforceRateLimit(): Promise<void> {
	const requiredDelay = calculateRequiredDelay();
	if (requiredDelay > 0) {
		await delay(requiredDelay);
	}

	// Record this request
	const now = Date.now();
	rateLimitTracker.requests.push(now);
	rateLimitTracker.lastRequestTime = now;

	// Log warning if approaching limit
	const requestsInLastHour = rateLimitTracker.requests.length;
	if (requestsInLastHour >= CONFIG.appLevelRateLimit * 0.9) {
		console.warn(`⚠️ Approaching rate limit: ${requestsInLastHour}/${CONFIG.appLevelRateLimit} requests in last hour`);
	}
}

// Delay helper for retries
function delay(ms: number): Promise<void> {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

// Check if error is retryable
function isRetryableError(error: Response): boolean {
	// Retry on 5xx errors, rate limits (429), and timeouts
	if (error.status >= 500) return true;
	if (error.status === 429) return true; // Rate limit
	if (error.status === 408) return true; // Request timeout
	return false;
}

// Create detailed error message
function createDetailedError(error: Response, endpoint: string, errorData?: any): Error {
	const errorMessage = errorData?.error?.message || `HTTP ${error.status}`;
	const errorCode = errorData?.error?.code || error.status;
	const errorType = errorData?.error?.type || 'Unknown';

	return new Error(`Meta API error (${errorCode}): ${errorMessage} | Type: ${errorType} | Endpoint: ${endpoint}`);
}

// Log error information
function logError(error: Response, endpoint: string, errorData?: any): void {
	console.error(`❌ Meta API request failed:`, {
		endpoint,
		status: error.status,
		statusText: error.statusText,
		error: errorData?.error || 'Unknown error',
	});
}

// Helper to fetch a paginated URL (next URL already includes access token)
async function fetchPaginatedUrl(nextUrl: string, retryCount = 0): Promise<{ data: unknown; paging?: { next?: string } }> {
	try {
		// Enforce rate limiting
		await enforceRateLimit();

		// Create AbortController for timeout
		const controller = new AbortController();
		const timeoutId = setTimeout(() => controller.abort(), CONFIG.requestTimeout);

		const response = await fetch(nextUrl, {
			method: 'GET',
			signal: controller.signal,
		});

		clearTimeout(timeoutId);

		if (!response.ok) {
			const errorData = (await response.json().catch(() => ({ error: { message: 'Unknown error' } }))) as {
				error?: { message?: string; code?: number; type?: string };
			};

			// Check if this is a retryable error
			if (isRetryableError(response) && retryCount < CONFIG.maxRetries) {
				const backoffDelay = Math.pow(2, retryCount) * 1000;
				console.warn(`⚠️ Paginated request failed, retrying in ${backoffDelay}ms`);
				await delay(backoffDelay);
				return fetchPaginatedUrl(nextUrl, retryCount + 1);
			}

			logError(response, nextUrl, errorData);
			throw createDetailedError(response, nextUrl, errorData);
		}

		return response.json();
	} catch (error: unknown) {
		// Handle abort (timeout) as retryable
		if (error instanceof Error && error.name === 'AbortError') {
			if (retryCount < CONFIG.maxRetries) {
				const backoffDelay = Math.pow(2, retryCount) * 1000;
				console.warn(`⚠️ Paginated request timeout, retrying in ${backoffDelay}ms`);
				await delay(backoffDelay);
				return fetchPaginatedUrl(nextUrl, retryCount + 1);
			}
			throw new Error(`Request timeout after ${CONFIG.maxRetries + 1} attempts: ${nextUrl}`);
		}

		if (error instanceof Error && error.message.includes('Meta API error')) {
			throw error;
		}

		throw new Error(`Paginated request failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
	}
}

// Main API request function with retry logic and automatic pagination (matching main codebase pattern)
async function callMetaAPI(
	endpoint: string,
	params: Record<string, string | number | undefined> = {},
	method: 'GET' | 'POST' | 'DELETE' = 'GET',
	retryCount = 0,
	env: Env,
	enablePagination = true,
	maxPages = 1000
): Promise<unknown> {
	const accessToken = env.META_ACCESS_TOKEN;
	if (!accessToken) {
		throw new Error('META_ACCESS_TOKEN is not configured. Please set it as a secret.');
	}

	try {
		// Enforce rate limiting
		await enforceRateLimit();

		const apiVersion = env.META_API_VERSION || CONFIG.metaApiVersion;
		const baseUrl = `https://graph.facebook.com/${apiVersion}/${endpoint}`;

		// Build query string
		const queryParams = new URLSearchParams();
		queryParams.append('access_token', accessToken);

		for (const [key, value] of Object.entries(params)) {
			if (value !== undefined && value !== null && value !== '') {
				queryParams.append(key, String(value));
			}
		}

		const url = `${baseUrl}?${queryParams.toString()}`;

		// Create AbortController for timeout
		const controller = new AbortController();
		const timeoutId = setTimeout(() => controller.abort(), CONFIG.requestTimeout);

		const response = await fetch(url, {
			method,
			signal: controller.signal,
		});

		clearTimeout(timeoutId);

		if (!response.ok) {
			const errorData = (await response.json().catch(() => ({ error: { message: 'Unknown error' } }))) as {
				error?: { message?: string; code?: number; type?: string };
			};

			// Check if this is a retryable error
			if (isRetryableError(response) && retryCount < CONFIG.maxRetries) {
				const backoffDelay = Math.pow(2, retryCount) * 1000;
				console.warn(`⚠️ Meta API request failed, retrying in ${backoffDelay}ms (attempt ${retryCount + 1}/${CONFIG.maxRetries + 1})`);
				console.warn(`Error: ${errorData?.error?.message || 'Unknown error'}`);

				await delay(backoffDelay);
				return callMetaAPI(endpoint, params, method, retryCount + 1, env, enablePagination, maxPages);
			}

			// Log detailed error information
			logError(response, endpoint, errorData);
			throw createDetailedError(response, endpoint, errorData);
		}

		const result = (await response.json()) as {
			data?: unknown[] | unknown;
			paging?: { next?: string; cursors?: { before?: string; after?: string } };
		};

		// Handle pagination if enabled and response has paging with array data
		if (enablePagination && result.paging?.next && Array.isArray(result.data)) {
			const allData: unknown[] = [...(result.data || [])];
			let nextUrl: string | undefined = result.paging.next;
			let pageCount = 1;

			// Follow pagination until no more pages or safety limit reached (matching main codebase pattern)
			while (nextUrl && pageCount < maxPages) {
				await enforceRateLimit(); // Rate limit between pages
				const pageResponse = await fetchPaginatedUrl(nextUrl);

				if (Array.isArray(pageResponse.data)) {
					allData.push(...pageResponse.data);
					pageCount++;
					console.log(`   Retrieved page ${pageCount}: ${pageResponse.data.length} records (total: ${allData.length})`);
				} else {
					// If response format changes, break to avoid errors
					console.warn(`⚠️ Unexpected response format in pagination, stopping at page ${pageCount}`);
					break;
				}

				nextUrl = pageResponse.paging?.next;
			}

			if (pageCount >= maxPages) {
				console.warn(`⚠️ Reached pagination safety limit (${maxPages} pages). Total records: ${allData.length}`);
			} else if (pageCount > 1) {
				console.log(`✅ Completed pagination: ${allData.length} total records across ${pageCount} pages`);
			}

			// Return aggregated result in same format as single page
			return {
				data: allData,
				paging: {
					...result.paging,
					next: undefined, // No more pages since we fetched all
				},
			};
		}

		return result;
	} catch (error: unknown) {
		// Handle abort (timeout) as retryable
		if (error instanceof Error && error.name === 'AbortError') {
			if (retryCount < CONFIG.maxRetries) {
				const backoffDelay = Math.pow(2, retryCount) * 1000;
				console.warn(`⚠️ Request timeout, retrying in ${backoffDelay}ms`);
				await delay(backoffDelay);
				return callMetaAPI(endpoint, params, method, retryCount + 1, env, enablePagination, maxPages);
			}
			throw new Error(`Request timeout after ${CONFIG.maxRetries + 1} attempts: ${endpoint}`);
		}

		// Re-throw if it's already our detailed error
		if (error instanceof Error && error.message.includes('Meta API error')) {
			throw error;
		}

		// Wrap other errors
		throw new Error(`Meta API request failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
	}
}

// Helper to format array fields for Meta API
function formatFields(fields?: unknown): string {
	if (!fields || !Array.isArray(fields) || fields.length === 0) {
		return '';
	}
	return fields.map((f) => String(f)).join(',');
}

// Helper to build filtering parameter
function buildFiltering(filters: Array<{ field: string; operator: string; value: string[] }>): string {
	return JSON.stringify(filters);
}

/**
 * ============================================================================
 * TOOL DEFINITIONS - Meta Ads MCP Tools
 * ============================================================================
 */

const TOOLS: Tool[] = [
	// Account & Authentication Tools
	{
		name: 'mcp_meta_ads_get_ad_accounts',
		description: 'Get all ad accounts accessible by the user',
		inputSchema: {
			type: 'object',
			properties: {
				fields: {
					type: 'array',
					items: { type: 'string' },
					description: 'Specific fields to return (default: id,name,account_status,currency,timezone_name)',
				},
			},
			required: [],
		},
		handler: async (args: Record<string, unknown>, env: Env) => {
			const fields = formatFields(args.fields as string[]) || 'id,name,account_status,currency,timezone_name';
			const data = await callMetaAPI('me/adaccounts', { fields }, 'GET', 0, env);
			return {
				content: [
					{
						type: 'text',
						text: JSON.stringify(data, null, 2),
					},
				],
			};
		},
	},
	{
		name: 'mcp_meta_ads_get_account_info',
		description: 'Get detailed information about a specific ad account',
		inputSchema: {
			type: 'object',
			properties: {
				account_id: {
					type: 'string',
					description: 'The Meta ad account ID (e.g., act_123456789)',
				},
				fields: {
					type: 'array',
					items: { type: 'string' },
					description: 'Specific fields to return',
				},
			},
			required: ['account_id'],
		},
		handler: async (args: Record<string, unknown>, env: Env) => {
			let accountId = args.account_id as string;
			// Ensure act_ prefix
			if (!accountId.startsWith('act_')) {
				accountId = `act_${accountId}`;
			}
			const fields = formatFields(args.fields as string[]);
			const params: Record<string, string> = {};
			if (fields) {
				params.fields = fields;
			}
			const data = await callMetaAPI(accountId, params, 'GET', 0, env);
			return {
				content: [
					{
						type: 'text',
						text: JSON.stringify(data, null, 2),
					},
				],
			};
		},
	},
	{
		name: 'mcp_meta_ads_validate_token',
		description: 'Validate current access token and get token information using /debug_token endpoint',
		inputSchema: {
			type: 'object',
			properties: {},
			required: [],
		},
		handler: async (args: Record<string, unknown>, env: Env) => {
			const accessToken = env.META_ACCESS_TOKEN;
			if (!accessToken) {
				throw new Error('META_ACCESS_TOKEN is not configured');
			}

			// Use /debug_token endpoint as specified
			const params = {
				input_token: accessToken,
			};
			const data = await callMetaAPI('debug_token', params, 'GET', 0, env);
			return {
				content: [
					{
						type: 'text',
						text: JSON.stringify(data, null, 2),
					},
				],
			};
		},
	},
	// Campaign Data Tools
	{
		name: 'mcp_meta_ads_get_campaigns',
		description: 'Get campaigns for an ad account with optional filtering',
		inputSchema: {
			type: 'object',
			properties: {
				account_id: {
					type: 'string',
					description: 'The Meta ad account ID (e.g., act_123456789)',
				},
				limit: {
					type: 'number',
					description: 'Maximum number of campaigns to return (default: 25)',
				},
				status_filter: {
					type: 'string',
					description: 'Filter by status: ACTIVE, PAUSED, ARCHIVED, etc.',
				},
				fields: {
					type: 'array',
					items: { type: 'string' },
					description: 'Specific fields to return',
				},
			},
			required: ['account_id'],
		},
		handler: async (args: Record<string, unknown>, env: Env) => {
			let accountId = args.account_id as string;
			// Ensure act_ prefix
			if (!accountId.startsWith('act_')) {
				accountId = `act_${accountId}`;
			}
			const limit = (args.limit as number) || 100;
			// Match main codebase field selection
			const fields = formatFields(args.fields as string[]) || 'id,name,status,objective,created_time,updated_time,start_time,stop_time';
			const params: Record<string, string | number> = { fields, limit: limit.toString() };

			if (args.status_filter) {
				const filtering = buildFiltering([{ field: 'status', operator: 'IN', value: [args.status_filter as string] }]);
				params.filtering = filtering;
			}

			const data = await callMetaAPI(`${accountId}/campaigns`, params, 'GET', 0, env);
			return {
				content: [
					{
						type: 'text',
						text: JSON.stringify(data, null, 2),
					},
				],
			};
		},
	},
	{
		name: 'mcp_meta_ads_get_campaign_details',
		description: 'Get detailed information about a specific campaign',
		inputSchema: {
			type: 'object',
			properties: {
				campaign_id: {
					type: 'string',
					description: 'The campaign ID',
				},
				fields: {
					type: 'array',
					items: { type: 'string' },
					description: 'Specific fields to return',
				},
			},
			required: ['campaign_id'],
		},
		handler: async (args: Record<string, unknown>, env: Env) => {
			const campaignId = args.campaign_id as string;
			const fields = formatFields(args.fields as string[]);
			const params: Record<string, string> = {};
			if (fields) {
				params.fields = fields;
			}
			const data = await callMetaAPI(campaignId, params, 'GET', 0, env);
			return {
				content: [
					{
						type: 'text',
						text: JSON.stringify(data, null, 2),
					},
				],
			};
		},
	},
	// Ad Set Data Tools
	{
		name: 'mcp_meta_ads_get_adsets',
		description: 'Get ad sets for an account with optional filtering',
		inputSchema: {
			type: 'object',
			properties: {
				account_id: {
					type: 'string',
					description: 'The Meta ad account ID (e.g., act_123456789)',
				},
				limit: {
					type: 'number',
					description: 'Maximum number of ad sets to return (default: 25)',
				},
				campaign_id: {
					type: 'string',
					description: 'Optional: Filter by campaign ID',
				},
				fields: {
					type: 'array',
					items: { type: 'string' },
					description: 'Specific fields to return',
				},
			},
			required: ['account_id'],
		},
		handler: async (args: Record<string, unknown>, env: Env) => {
			let accountId = args.account_id as string;
			// Ensure act_ prefix
			if (!accountId.startsWith('act_')) {
				accountId = `act_${accountId}`;
			}
			const limit = (args.limit as number) || 100;
			// Match main codebase field selection
			const fields =
				formatFields(args.fields as string[]) ||
				'id,name,status,campaign_id,daily_budget,lifetime_budget,targeting,optimization_goal,billing_event,bid_amount,created_time,updated_time';
			const params: Record<string, string | number> = { fields, limit: limit.toString() };

			if (args.campaign_id) {
				params.filtering = buildFiltering([{ field: 'campaign.id', operator: 'IN', value: [args.campaign_id as string] }]);
			}

			const data = await callMetaAPI(`${accountId}/adsets`, params, 'GET', 0, env);
			return {
				content: [
					{
						type: 'text',
						text: JSON.stringify(data, null, 2),
					},
				],
			};
		},
	},
	{
		name: 'mcp_meta_ads_get_adset_details',
		description: 'Get detailed information about a specific ad set',
		inputSchema: {
			type: 'object',
			properties: {
				adset_id: {
					type: 'string',
					description: 'The ad set ID',
				},
				fields: {
					type: 'array',
					items: { type: 'string' },
					description: 'Specific fields to return',
				},
			},
			required: ['adset_id'],
		},
		handler: async (args: Record<string, unknown>, env: Env) => {
			const adsetId = args.adset_id as string;
			const fields = formatFields(args.fields as string[]);
			const params: Record<string, string> = {};
			if (fields) {
				params.fields = fields;
			}
			const data = await callMetaAPI(adsetId, params, 'GET', 0, env);
			return {
				content: [
					{
						type: 'text',
						text: JSON.stringify(data, null, 2),
					},
				],
			};
		},
	},
	// Ad Data Tools
	{
		name: 'mcp_meta_ads_get_ads',
		description: 'Get ads for an account with optional filtering',
		inputSchema: {
			type: 'object',
			properties: {
				account_id: {
					type: 'string',
					description: 'The Meta ad account ID (e.g., act_123456789)',
				},
				limit: {
					type: 'number',
					description: 'Maximum number of ads to return (default: 25)',
				},
				campaign_id: {
					type: 'string',
					description: 'Optional: Filter by campaign ID',
				},
				adset_id: {
					type: 'string',
					description: 'Optional: Filter by ad set ID',
				},
				fields: {
					type: 'array',
					items: { type: 'string' },
					description: 'Specific fields to return',
				},
			},
			required: ['account_id'],
		},
		handler: async (args: Record<string, unknown>, env: Env) => {
			let accountId = args.account_id as string;
			// Ensure act_ prefix
			if (!accountId.startsWith('act_')) {
				accountId = `act_${accountId}`;
			}
			const limit = (args.limit as number) || 100;
			// Match main codebase field selection
			const fields =
				formatFields(args.fields as string[]) ||
				'id,name,status,adset_id,creative{id,title,body,image_url,video_id},created_time,updated_time,configured_status,effective_status';
			const params: Record<string, string | number> = { fields, limit: limit.toString() };

			if (args.campaign_id) {
				params.filtering = buildFiltering([{ field: 'campaign.id', operator: 'IN', value: [args.campaign_id as string] }]);
			} else if (args.adset_id) {
				params.filtering = buildFiltering([{ field: 'adset.id', operator: 'IN', value: [args.adset_id as string] }]);
			}

			const data = await callMetaAPI(`${accountId}/ads`, params, 'GET', 0, env);
			return {
				content: [
					{
						type: 'text',
						text: JSON.stringify(data, null, 2),
					},
				],
			};
		},
	},
	{
		name: 'mcp_meta_ads_get_ad_details',
		description: 'Get detailed information about a specific ad',
		inputSchema: {
			type: 'object',
			properties: {
				ad_id: {
					type: 'string',
					description: 'The ad ID',
				},
				fields: {
					type: 'array',
					items: { type: 'string' },
					description: 'Specific fields to return',
				},
			},
			required: ['ad_id'],
		},
		handler: async (args: Record<string, unknown>, env: Env) => {
			const adId = args.ad_id as string;
			const fields = formatFields(args.fields as string[]);
			const params: Record<string, string> = {};
			if (fields) {
				params.fields = fields;
			}
			const data = await callMetaAPI(adId, params, 'GET', 0, env);
			return {
				content: [
					{
						type: 'text',
						text: JSON.stringify(data, null, 2),
					},
				],
			};
		},
	},
	// Creative Data Tools
	{
		name: 'mcp_meta_ads_get_ad_creatives',
		description: 'Get creative details for a specific ad',
		inputSchema: {
			type: 'object',
			properties: {
				ad_id: {
					type: 'string',
					description: 'The ad ID',
				},
				fields: {
					type: 'array',
					items: { type: 'string' },
					description: 'Specific creative fields to return (supports nested fields like creative{id,title,body,image_url,video_id})',
				},
			},
			required: ['ad_id'],
		},
		handler: async (args: Record<string, unknown>, env: Env) => {
			const adId = args.ad_id as string;
			// Default creative fields matching main codebase
			const fields =
				formatFields(args.fields as string[]) ||
				'creative{id,title,body,image_url,video_id,object_story_spec,thumbnail_url,thumbnail_data_url}';
			const params: Record<string, string> = { fields };
			const data = await callMetaAPI(adId, params, 'GET', 0, env);
			return {
				content: [
					{
						type: 'text',
						text: JSON.stringify(data, null, 2),
					},
				],
			};
		},
	},
	{
		name: 'mcp_meta_ads_get_creative_details',
		description: 'Get detailed information about a specific creative',
		inputSchema: {
			type: 'object',
			properties: {
				creative_id: {
					type: 'string',
					description: 'The creative ID',
				},
				fields: {
					type: 'array',
					items: { type: 'string' },
					description: 'Specific fields to return',
				},
			},
			required: ['creative_id'],
		},
		handler: async (args: Record<string, unknown>, env: Env) => {
			const creativeId = args.creative_id as string;
			const fields = formatFields(args.fields as string[]);
			const params: Record<string, string> = {};
			if (fields) {
				params.fields = fields;
			}
			const data = await callMetaAPI(creativeId, params, 'GET', 0, env);
			return {
				content: [
					{
						type: 'text',
						text: JSON.stringify(data, null, 2),
					},
				],
			};
		},
	},
	// Analytics/Insights Tools
	{
		name: 'mcp_meta_ads_get_insights',
		description: 'Get performance insights for account, campaign, ad set, or ad level',
		inputSchema: {
			type: 'object',
			properties: {
				object_id: {
					type: 'string',
					description: 'The object ID (account ID with act_ prefix, campaign ID, adset ID, or ad ID)',
				},
				level: {
					type: 'string',
					description: 'The level: account, campaign, adset, or ad',
				},
				time_range: {
					type: 'string',
					description: 'Time range as JSON string: {"since":"YYYY-MM-DD","until":"YYYY-MM-DD"} or date_preset like "last_7d"',
				},
				fields: {
					type: 'array',
					items: { type: 'string' },
					description:
						'Specific insight fields to return (default: spend,impressions,clicks,actions,cost_per_action_type,ctr,cpp,cpm,reach,frequency,unique_clicks)',
				},
				date_preset: {
					type: 'string',
					description: 'Optional: Date preset (e.g., last_7d, last_30d) instead of time_range',
				},
			},
			required: ['object_id', 'level'],
		},
		handler: async (args: Record<string, unknown>, env: Env) => {
			let objectId = args.object_id as string;
			const level = (args.level as string).toLowerCase();

			// Ensure act_ prefix for account level
			if (level === 'account' && !objectId.startsWith('act_')) {
				objectId = `act_${objectId}`;
			}

			// Default fields matching main codebase
			const fields =
				formatFields(args.fields as string[]) ||
				'spend,impressions,clicks,actions,cost_per_action_type,ctr,cpp,cpm,reach,frequency,unique_clicks';

			const params: Record<string, string> = {
				fields,
				level,
			};

			// Handle time range
			if (args.date_preset) {
				params.date_preset = args.date_preset as string;
			} else if (args.time_range) {
				// If time_range is already a JSON string, use it directly
				if (typeof args.time_range === 'string' && args.time_range.startsWith('{')) {
					params.time_range = args.time_range;
				} else {
					// Otherwise stringify it
					params.time_range = JSON.stringify(args.time_range);
				}
			} else {
				// Default to last 7 days if nothing specified
				params.date_preset = 'last_7d';
			}

			// Build endpoint based on level
			let endpoint = '';
			if (level === 'account') {
				endpoint = `${objectId}/insights`;
			} else {
				// For campaign, adset, or ad, use the object ID directly
				endpoint = `${objectId}/insights`;
			}

			const data = await callMetaAPI(endpoint, params, 'GET', 0, env);
			return {
				content: [
					{
						type: 'text',
						text: JSON.stringify(data, null, 2),
					},
				],
			};
		},
	},
	// Diagnostics Tools
	{
		name: 'mcp_meta_ads_health_check',
		description: 'Verify MCP server and Meta API connection status',
		inputSchema: {
			type: 'object',
			properties: {},
			required: [],
		},
		handler: async (args: Record<string, unknown>, env: Env) => {
			const hasToken = !!env.META_ACCESS_TOKEN;
			let tokenValid = false;
			let apiConnected = false;
			let error = null;

			if (hasToken) {
				try {
					await callMetaAPI('me', { fields: 'id,name' }, 'GET', 0, env);
					apiConnected = true;
					tokenValid = true;
				} catch (e: unknown) {
					error = e instanceof Error ? e.message : 'Unknown error';
					apiConnected = false;
					tokenValid = false;
				}
			}

			return {
				content: [
					{
						type: 'text',
						text: JSON.stringify(
							{
								server: {
									name: CONFIG.serverName,
									version: CONFIG.serverVersion,
									status: 'running',
								},
								meta_api: {
									connected: apiConnected,
									token_configured: hasToken,
									token_valid: tokenValid,
									api_version: env.META_API_VERSION || CONFIG.metaApiVersion,
									error: error,
								},
							},
							null,
							2
						),
					},
				],
			};
		},
	},
];

/**
 * ============================================================================
 * FRAMEWORK CODE - You typically don't need to modify below this line
 * ============================================================================
 */

// Session interface for SSE connections
interface Session {
	writer: WritableStreamDefaultWriter<Uint8Array>;
	encoder: TextEncoder;
}

// Store active sessions
const sessions = new Map<string, Session>();

export default {
	async fetch(request: Request, env: Env): Promise<Response> {
		const url = new URL(request.url);

		// CORS headers - modify if you need to restrict origins
		const corsHeaders = {
			'Access-Control-Allow-Origin': '*', // Change to specific domain if needed
			'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
			'Access-Control-Allow-Headers': 'Content-Type, Accept',
		};

		console.log(`${request.method} ${url.pathname}`);

		// Handle CORS preflight
		if (request.method === 'OPTIONS') {
			return new Response(null, { headers: corsHeaders });
		}

		// Health check endpoint
		if (url.pathname === '/' || url.pathname === '') {
			return new Response(
				JSON.stringify({
					name: CONFIG.serverDescription,
					version: CONFIG.serverVersion,
					status: 'running',
					endpoints: {
						sse: '/sse',
					},
				}),
				{
					headers: {
						'Content-Type': 'application/json',
						...corsHeaders,
					},
				}
			);
		}

		// SSE endpoint - GET only
		if (url.pathname === '/sse' && request.method === 'GET') {
			const { readable, writable } = new TransformStream();
			const writer = writable.getWriter();
			const encoder = new TextEncoder();

			// Generate session ID
			const sessionId = crypto.randomUUID().replace(/-/g, '');

			// Store session
			sessions.set(sessionId, { writer, encoder });
			console.log('Created SSE session:', sessionId);

			// Send endpoint immediately
			(async () => {
				try {
					await writer.write(encoder.encode(`event: endpoint\ndata: /sse/message?sessionId=${sessionId}\n\n`));

					// Keep-alive ping
					const keepAlive = setInterval(async () => {
						try {
							await writer.write(encoder.encode(': ping\n\n'));
						} catch {
							clearInterval(keepAlive);
							sessions.delete(sessionId);
						}
					}, CONFIG.keepAliveInterval);
				} catch (error) {
					console.error('SSE error:', error);
					sessions.delete(sessionId);
				}
			})();

			return new Response(readable, {
				headers: {
					'Content-Type': 'text/event-stream',
					'Cache-Control': 'no-cache',
					Connection: 'keep-alive',
					...corsHeaders,
				},
			});
		}

		// Handle POST to /sse (some clients do this for direct HTTP)
		if (url.pathname === '/sse' && request.method === 'POST') {
			console.log('Received POST to /sse - redirecting to message handler');
			// Treat this as a direct message without session
			return handleMessage(request, corsHeaders, null, env);
		}

		// Messages endpoint with session
		if (url.pathname === '/sse/message' && request.method === 'POST') {
			const sessionId = url.searchParams.get('sessionId');
			console.log('Received POST to /sse/message with sessionId:', sessionId);

			const session = sessions.get(sessionId || '') ?? null;
			return handleMessage(request, corsHeaders, session, env);
		}

		return new Response('Not Found', {
			status: 404,
			headers: corsHeaders,
		});
	},
};

// Centralized message handler
async function handleMessage(request: Request, corsHeaders: Record<string, string>, session: Session | null, env: Env) {
	try {
		const body = await request.text();
		console.log('Received body:', body);

		let message;
		try {
			message = JSON.parse(body);
		} catch (parseError) {
			console.error('JSON parse error:', parseError);
			const errorResponse = {
				jsonrpc: '2.0',
				error: {
					code: -32700,
					message: 'Parse error',
				},
			};
			return new Response(JSON.stringify(errorResponse), {
				status: 400,
				headers: {
					'Content-Type': 'application/json',
					...corsHeaders,
				},
			});
		}

		console.log('Parsed message:', JSON.stringify(message));

		let response: Record<string, unknown> | null = null;

		// Handle initialize
		if (message.method === 'initialize') {
			response = {
				jsonrpc: '2.0',
				id: message.id,
				result: {
					protocolVersion: CONFIG.protocolVersion,
					capabilities: { tools: {} },
					serverInfo: {
						name: CONFIG.serverName,
						version: CONFIG.serverVersion,
					},
				},
			};
		}
		// Handle tools/list
		else if (message.method === 'tools/list') {
			response = {
				jsonrpc: '2.0',
				id: message.id,
				result: {
					tools: TOOLS.map((tool: Tool) => ({
						name: tool.name,
						description: tool.description,
						inputSchema: tool.inputSchema,
					})),
				},
			};
		}
		// Handle tools/call
		else if (message.method === 'tools/call') {
			const { name, arguments: args } = message.params;

			// Find the tool by name
			const tool = TOOLS.find((t: Tool) => t.name === name);

			if (tool) {
				try {
					const result = await tool.handler(args, env);
					response = {
						jsonrpc: '2.0',
						id: message.id,
						result,
					};
				} catch (toolError: unknown) {
					response = {
						jsonrpc: '2.0',
						id: message.id,
						error: {
							code: -32603,
							message: toolError instanceof Error ? toolError.message : 'Tool execution failed',
						},
					};
				}
			} else {
				response = {
					jsonrpc: '2.0',
					id: message.id,
					error: {
						code: -32601,
						message: `Unknown tool: ${name}`,
					},
				};
			}
		}
		// Handle notifications/initialized
		else if (message.method === 'notifications/initialized') {
			console.log('Received initialized notification');
			return new Response(null, {
				status: 204,
				headers: corsHeaders,
			});
		} else {
			response = {
				jsonrpc: '2.0',
				id: message.id || null,
				error: {
					code: -32601,
					message: `Method not found: ${message.method}`,
				},
			};
		}

		console.log('Sending response:', JSON.stringify(response));

		// If we have a session, send via SSE
		if (session && response) {
			try {
				await session.writer.write(session.encoder.encode(`data: ${JSON.stringify(response)}\n\n`));
			} catch (sseError) {
				console.error('SSE write error:', sseError);
			}
		}

		// Always return response directly for HTTP
		if (response) {
			return new Response(JSON.stringify(response), {
				status: 200,
				headers: {
					'Content-Type': 'application/json',
					...corsHeaders,
				},
			});
		}

		return new Response(null, {
			status: 204,
			headers: corsHeaders,
		});
	} catch (error: unknown) {
		console.error('Message handling error:', error);
		const errorResponse = {
			jsonrpc: '2.0',
			error: {
				code: -32603,
				message: error instanceof Error ? error.message : 'Internal error',
			},
		};
		return new Response(JSON.stringify(errorResponse), {
			status: 500,
			headers: {
				'Content-Type': 'application/json',
				...corsHeaders,
			},
		});
	}
}
