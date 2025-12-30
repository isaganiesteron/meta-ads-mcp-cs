# Meta Ads MCP Server - Test Prompts

Use these prompts in TypingMind to verify your MCP server is working correctly. Test them in order, or pick specific ones to verify particular functionality.

## Test Prompts (20 total)

### 1. Basic Connection Test

**Prompt:** "Check the health status of the Meta Ads MCP server and verify the connection to Meta API."

**Expected:** Should call `mcp_meta_ads_health_check` and return server status, API connectivity, token validity, and version info.

---

### 2. Token Validation

**Prompt:** "Validate my Meta access token and show me its permissions, expiration date, and user information."

**Expected:** Should call `mcp_meta_ads_validate_token` and return token validity, expiration, scopes/permissions, user info, and app info.

---

### 3. List Ad Accounts

**Prompt:** "List all my Meta ad accounts with their status, currency, and timezone information."

**Expected:** Should call `mcp_meta_ads_get_ad_accounts` and return a list of ad accounts with ID, name, status, currency, and timezone.

---

### 4. Account Details

**Prompt:** "Get detailed information about my first ad account. Use the account ID from my account list if needed."

**Expected:** Should call `mcp_meta_ads_get_ad_accounts` first, then `mcp_meta_ads_get_account_info` with one of your account IDs, showing spend cap, balance, settings, and business info.

---

### 5. Account Pages

**Prompt:** "Show me all Facebook Pages associated with my main ad account."

**Expected:** Should call `mcp_meta_ads_get_account_pages` with your account ID, returning pages with ID, name, category, and access tokens.

---

### 6. List Campaigns

**Prompt:** "Get all active campaigns for my main ad account. Limit to the first 10 campaigns."

**Expected:** Should call `mcp_meta_ads_get_campaigns` with account_id and status_filter="ACTIVE", limit=10, showing campaigns with ID, name, status, objective, and budget.

---

### 7. Campaign Details

**Prompt:** "Get detailed information about my first campaign. Use the campaign ID from my campaign list."

**Expected:** Should call `mcp_meta_ads_get_campaigns` first, then `mcp_meta_ads_get_campaign_details` with a campaign ID, showing bid strategy, buying type, spend cap, and pacing.

---

### 8. Campaign Ad Sets

**Prompt:** "Show me all ad sets within my first campaign."

**Expected:** Should call `mcp_meta_ads_get_campaign_adsets` with a campaign ID, returning all ad sets belonging to that campaign.

---

### 9. List Ad Sets

**Prompt:** "Get all ad sets for my main ad account. Show me the first 10 with their targeting and budget information."

**Expected:** Should call `mcp_meta_ads_get_adsets` with account_id and limit=10, showing targeting, budget, schedule, and optimization settings.

---

### 10. Ad Set Details

**Prompt:** "Get detailed information about my first ad set, including targeting specifications and delivery status."

**Expected:** Should call `mcp_meta_ads_get_adset_details` with an ad set ID, showing targeting specs, delivery status, and bid amount.

---

### 11. Ad Set Ads

**Prompt:** "Show me all ads within my first ad set."

**Expected:** Should call `mcp_meta_ads_get_adset_ads` with an ad set ID, returning all ads belonging to that ad set.

---

### 12. List Ads

**Prompt:** "Get all active ads for my main ad account. Limit to 10 ads and show their status and creative IDs."

**Expected:** Should call `mcp_meta_ads_get_ads` with account_id, limit=10, showing ads with ID, name, status, and creative ID.

---

### 13. Ad Details

**Prompt:** "Get detailed information about my first ad, including tracking specs and conversion settings."

**Expected:** Should call `mcp_meta_ads_get_ad_details` with an ad ID, showing tracking specs, conversion specs, and bid info.

---

### 14. Ad Preview

**Prompt:** "Show me a preview of my first ad in desktop feed format."

**Expected:** Should call `mcp_meta_ads_get_ad_preview` with an ad ID and ad_format="desktop_feed", returning preview HTML and image URLs.

---

### 15. Ad Creatives

**Prompt:** "Get creative details for my first ad, including text, images, videos, and call-to-action."

**Expected:** Should call `mcp_meta_ads_get_ad_creatives` with an ad ID, showing creative information including text, images, videos, CTA, and link URLs.

---

### 16. List Creatives

**Prompt:** "List all creatives in my main ad account. Show me the first 10 with their types and status."

**Expected:** Should call `mcp_meta_ads_list_ad_creatives` with account_id and limit=10, returning creatives with IDs, names, types, and status.

---

### 17. Creative Details

**Prompt:** "Get detailed information about my first creative, including all assets and copy variations."

**Expected:** Should call `mcp_meta_ads_get_creative_details` with a creative ID, showing full creative specification including all assets and link data.

---

### 18. Search Interests

**Prompt:** "Search for interest targeting options related to 'fitness' and show me the top 10 results with audience sizes."

**Expected:** Should call `mcp_meta_ads_search_interests` with query="fitness" and limit=10, returning interest data with ID, name, audience size, and category path.

---

### 19. Interest Suggestions

**Prompt:** "Get interest suggestions based on these interests: 'fitness', 'health', 'wellness'. Show me related interests with audience sizes."

**Expected:** Should call `mcp_meta_ads_get_interest_suggestions` with an array of interests, returning suggested related interests with descriptions and audience sizes.

---

### 20. Geographic Targeting

**Prompt:** "Search for geographic targeting locations for 'New York' including cities and regions."

**Expected:** Should call `mcp_meta_ads_search_geo_locations` with query="New York" and location_types=["city", "region"], returning location data with key, name, type, and country code.

---

### 21. Validate Targeting

**Prompt:** "Validate this targeting specification: age 25-45, gender all, location United States, interests in fitness and health."

**Expected:** Should call `mcp_meta_ads_validate_targeting` with a targeting_spec JSON object, returning validation results or errors if invalid.

---

### 22. Estimate Reach

**Prompt:** "Estimate the reach for a targeting combination: age 25-45, United States, interests in fitness. Show me daily and monthly reach estimates."

**Expected:** Should call `mcp_meta_ads_estimate_reach` with a targeting_spec, returning estimated daily/monthly reach, audience size min/max, and bid suggestions.

---

### 23. Search Behaviors

**Prompt:** "Show me all available behavior targeting options. Limit to the first 20."

**Expected:** Should call `mcp_meta_ads_search_behaviors` with limit=20, returning behavior targeting options with ID, name, audience size bounds, and category path.

---

### 24. Demographics Search

**Prompt:** "Get demographic targeting options for life events. Show me the first 15 options."

**Expected:** Should call `mcp_meta_ads_search_demographics` with demographic_class="life_events" and limit=15, returning demographic options with ID, name, audience size, and descriptions.

---

### 25. Generic Search

**Prompt:** "Search for 'campaign' across my accounts, campaigns, and adsets. Show me matching results."

**Expected:** Should call `mcp_meta_ads_search` with query="campaign" and search_types=["accounts", "campaigns", "adsets"], returning matching records across all specified types.

---

### 26. API Rate Limits

**Prompt:** "Check my current API rate limits and usage for my main ad account."

**Expected:** Should call `mcp_meta_ads_get_api_limits` with an account_id, returning rate limit info, usage statistics, throttling status, and call count.

---

### 27. Campaign Insights

**Prompt:** "Get performance insights for my first campaign for the last 30 days. Show me impressions, clicks, spend, reach, and frequency."

**Expected:** Should call `mcp_meta_ads_get_insights` with object_id (campaign ID), level="campaign", and time_range (last 30 days), returning performance metrics.

---

### 28. Ad Set Insights

**Prompt:** "Show me performance data for my first ad set for the last 7 days. Include CTR and CPC metrics."

**Expected:** Should call `mcp_meta_ads_get_insights` with object_id (ad set ID), level="adset", and time_range (last 7 days), returning performance metrics.

---

### 29. Creative Insights

**Prompt:** "Get performance data for my first creative for the last 30 days."

**Expected:** Should call `mcp_meta_ads_get_creative_insights` with a creative_id and time_range (last 30 days), returning creative-level performance metrics.

---

### 30. Compare Performance

**Prompt:** "Compare performance between my first 3 campaigns for the last 30 days. Show me impressions, clicks, spend, and CTR side by side."

**Expected:** Should call `mcp_meta_ads_compare_performance` with object_ids array (3 campaign IDs), metrics array, and time_range, returning comparative performance data in table format.

---

### 31. Export Insights

**Prompt:** "Export performance data for my first campaign for the last 30 days in JSON format. Include all standard metrics."

**Expected:** Should call `mcp_meta_ads_export_insights` with object_id (campaign ID), format="json", and time_range, returning formatted export data.

---

### 32. Bulk Campaign Fetch

**Prompt:** "Get details for my first 3 campaigns at once using their campaign IDs."

**Expected:** Should call `mcp_meta_ads_get_campaigns_by_ids` with an array of campaign_ids, returning details for all requested campaigns in one call.

---

### 33. Bulk Ad Set Fetch

**Prompt:** "Get details for my first 3 ad sets at once using their ad set IDs."

**Expected:** Should call `mcp_meta_ads_get_adsets_by_ids` with an array of adset_ids, returning details for all requested ad sets in one call.

---

### 34. Bulk Ad Fetch

**Prompt:** "Get details for my first 5 ads at once using their ad IDs."

**Expected:** Should call `mcp_meta_ads_get_ads_by_ids` with an array of ad_ids, returning details for all requested ads in one call.

---

### 35. Bulk Creative Fetch

**Prompt:** "Get details for my first 3 creatives at once using their creative IDs."

**Expected:** Should call `mcp_meta_ads_get_creatives_by_ids` with an array of creative_ids, returning details for all requested creatives in one call.

---

### 36. Validate Interests

**Prompt:** "Validate these interests: 'fitness', 'health', 'wellness'. Check if they're valid and show current audience sizes."

**Expected:** Should call `mcp_meta_ads_validate_interests` with an interest_list array, returning validation results showing which interests are valid with current audience sizes.

---

### 37. Ad Image

**Prompt:** "Get and download the image for my first ad. Show me the image data, URLs, and dimensions."

**Expected:** Should call `mcp_meta_ads_get_ad_image` with an ad_id, returning image data, URLs, and dimensions for visual analysis.

---

### 38. Creative Preview

**Prompt:** "Get preview URLs for my first creative across different formats."

**Expected:** Should call `mcp_meta_ads_get_creative_preview` with a creative_id, returning preview images/videos showing creative rendering.

---

### 39. Account-Level Insights

**Prompt:** "Get performance insights for my entire ad account for the last 30 days. Show me overall impressions, clicks, spend, and reach."

**Expected:** Should call `mcp_meta_ads_get_insights` with object_id (account ID), level="account", and time_range (last 30 days), returning account-level performance metrics.

---

### 40. Filtered Campaigns

**Prompt:** "Get all paused campaigns for my main ad account. Show me their names and objectives."

**Expected:** Should call `mcp_meta_ads_get_campaigns` with account_id and status_filter="PAUSED", returning only paused campaigns.

---

## Quick Verification Checklist

After running all prompts, verify:

- [ ] All 40 prompts execute without errors
- [ ] Responses are formatted clearly (not raw JSON)
- [ ] Tool names are being called correctly (all start with `mcp_meta_ads_`)
- [ ] Account IDs are formatted correctly (prefixed with `act_`)
- [ ] Date ranges work correctly for insights (last 7 days, last 30 days)
- [ ] Error handling works for invalid inputs (invalid IDs, expired tokens, etc.)
- [ ] Rate limiting is respected (especially for bulk operations)
- [ ] Token validation works and shows correct permissions
- [ ] Health check returns proper server status
- [ ] API limits tool shows accurate usage statistics
- [ ] Bulk operations (`get_by_ids` tools) work correctly
- [ ] Targeting tools return valid audience size estimates
- [ ] Insights tools require `read_insights` permission (if applicable)
- [ ] Preview tools return valid URLs/images
- [ ] Search tools return relevant results

## Tips

1. **Start Simple**: Run test #1 (health check) first to verify basic connectivity
2. **Use Real Data**: The prompts use your actual ad accounts, so you'll see real results
3. **Check Logs**: If something fails, check Cloudflare Workers logs with `wrangler tail`
4. **Token Expiry**: If you see authentication errors, use test #2 to check token status
5. **Account Access**: Use test #3 to verify you have access to ad accounts before testing other tools
6. **Rate Limits**: Use test #26 to monitor API usage, especially when running many tests
7. **Bulk Operations**: Tests #32-35 verify bulk endpoints which reduce API call count
8. **Targeting Tools**: Tests #18-24 verify targeting research functionality
9. **Insights Permission**: Tests #27-31 require `read_insights` permission - verify your token has this
10. **Date Ranges**: Adjust date ranges if your accounts don't have data for the suggested periods

## Expected Response Format

All tools should return human-readable text with:

- Clear section headers
- Formatted numbers (e.g., "1,234" not "1234")
- Visual indicators (✓, ⚠, ❌, →)
- Actionable insights and recommendations
- Proper formatting for tables, lists, and structured data

If you see raw JSON or error stacks, there may be an issue with the tool response formatting.

## Tool Coverage Summary

This test suite covers all 39 tools in the Meta Ads MCP Server:

**Account & Authentication (4/4):**
- ✅ `mcp_meta_ads_get_ad_accounts` (Test #3)
- ✅ `mcp_meta_ads_get_account_info` (Test #4)
- ✅ `mcp_meta_ads_get_account_pages` (Test #5)
- ✅ `mcp_meta_ads_validate_token` (Test #2)

**Campaign Data (4/4):**
- ✅ `mcp_meta_ads_get_campaigns` (Tests #6, #40)
- ✅ `mcp_meta_ads_get_campaign_details` (Test #7)
- ✅ `mcp_meta_ads_get_campaigns_by_ids` (Test #32)
- ✅ `mcp_meta_ads_get_campaign_adsets` (Test #8)

**Ad Set Data (4/4):**
- ✅ `mcp_meta_ads_get_adsets` (Test #9)
- ✅ `mcp_meta_ads_get_adset_details` (Test #10)
- ✅ `mcp_meta_ads_get_adsets_by_ids` (Test #33)
- ✅ `mcp_meta_ads_get_adset_ads` (Test #11)

**Ad Data (4/4):**
- ✅ `mcp_meta_ads_get_ads` (Test #12)
- ✅ `mcp_meta_ads_get_ad_details` (Test #13)
- ✅ `mcp_meta_ads_get_ads_by_ids` (Test #34)
- ✅ `mcp_meta_ads_get_ad_preview` (Test #14)

**Creative Data (6/6):**
- ✅ `mcp_meta_ads_get_ad_creatives` (Test #15)
- ✅ `mcp_meta_ads_get_ad_image` (Test #37)
- ✅ `mcp_meta_ads_list_ad_creatives` (Test #16)
- ✅ `mcp_meta_ads_get_creative_details` (Test #17)
- ✅ `mcp_meta_ads_get_creatives_by_ids` (Test #35)
- ✅ `mcp_meta_ads_get_creative_preview` (Test #38)

**Targeting Research (8/8):**
- ✅ `mcp_meta_ads_search_interests` (Test #18)
- ✅ `mcp_meta_ads_get_interest_suggestions` (Test #19)
- ✅ `mcp_meta_ads_validate_interests` (Test #36)
- ✅ `mcp_meta_ads_search_behaviors` (Test #23)
- ✅ `mcp_meta_ads_search_demographics` (Test #24)
- ✅ `mcp_meta_ads_search_geo_locations` (Test #20)
- ✅ `mcp_meta_ads_validate_targeting` (Test #21)
- ✅ `mcp_meta_ads_estimate_reach` (Test #22)

**Diagnostics (2/2):**
- ✅ `mcp_meta_ads_health_check` (Test #1)
- ✅ `mcp_meta_ads_get_api_limits` (Test #26)

**Utility (3/3):**
- ✅ `mcp_meta_ads_search` (Test #25)
- ✅ `mcp_meta_ads_fetch_pagination` (Implicitly tested via list operations)
- ✅ `mcp_meta_ads_get_all_pages` (Implicitly tested via list operations)

**Analytics (4/4):**
- ✅ `mcp_meta_ads_get_insights` (Tests #27, #28, #39)
- ✅ `mcp_meta_ads_get_creative_insights` (Test #29)
- ✅ `mcp_meta_ads_compare_performance` (Test #30)
- ✅ `mcp_meta_ads_export_insights` (Test #31)

**Total Coverage: 39/39 tools tested** ✅

