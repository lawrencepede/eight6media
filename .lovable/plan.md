

## Redesign: Meta Analytics Agency Model

### Current vs. New Approach

**Current (per-creator OAuth):** Each creator individually authorizes via Facebook OAuth popup, generating individual tokens that expire every 60 days.

**New (agency partner model):** Creators add Eight6 as a partner in Meta Business Manager. Eight6 uses a single System User Access Token from their Business Manager to pull analytics for all partnered accounts.

### What Changes

**1. New Secret: Agency System User Token**
- You'll generate a System User Access Token from Meta Business Manager (Settings > System Users)
- The System User needs `instagram_basic`, `instagram_manage_insights`, `pages_show_list`, `pages_read_engagement` permissions
- This token is long-lived (does not expire like individual user tokens)
- Stored as a new secret: `META_SYSTEM_USER_TOKEN`

**2. Replace OAuth Flow with "Add Creator by Instagram ID"**

Instead of the OAuth popup, the UI will let you:
- Select a creator from the roster
- Enter their Instagram Business Account ID (or auto-discover it from your Business Manager's list of partnered accounts)
- Save the connection using your agency token

**3. Edge Function Changes**

- **`meta-oauth-start`** -- Remove or repurpose. No longer needed for individual OAuth.
- **`meta-oauth-callback`** -- Remove. No longer needed.
- **New: `meta-discover-accounts`** -- Calls the Meta Business API (`GET /{business_id}/owned_instagram_accounts` or `/client_instagram_accounts`) using your System User token to list all Instagram accounts you have partner access to. Returns the list so you can pick which to connect.
- **`fetch-instagram-insights`** -- Update to use the System User token instead of per-connection tokens. Remove token expiry checks since System User tokens don't expire.

**4. Database Changes**

- **`instagram_connections`** table: The `access_token` and `token_expires_at` columns become unnecessary (the single agency token is used for all). Add `ig_business_account_id` if not already present. Keep `creator_id`, `instagram_username`, `page_id`.

**5. UI Changes (`MetaAnalytics.tsx`)**

Replace the OAuth connect buttons with:
- A "Discover Accounts" button that calls the new edge function to list all Instagram accounts your Business Manager has access to
- A list/dropdown of discovered accounts to connect, with the ability to link each to a roster creator
- Remove token expiry warnings (no longer relevant)

**6. Result Page Cleanup**

- `MetaOAuthResult.tsx` and the `/oauth/meta/result` route can be removed since there's no more OAuth redirect flow.

### Setup Steps (for you, one-time)

1. In Meta Business Manager, go to **Business Settings > System Users**
2. Create a System User (or use existing) with Admin role
3. Assign it the required permissions on your Business assets
4. Generate a token with `instagram_basic`, `instagram_manage_insights`, `pages_show_list`, `pages_read_engagement` scopes
5. You'll paste this token into Lovable as the `META_SYSTEM_USER_TOKEN` secret
6. Also need your **Business Manager ID** (found in Business Settings) -- stored as `META_BUSINESS_ID` secret

### Files Modified

| File | Action |
|------|--------|
| `supabase/functions/meta-discover-accounts/index.ts` | Create -- lists partnered IG accounts |
| `supabase/functions/fetch-instagram-insights/index.ts` | Update -- use system user token |
| `supabase/functions/meta-oauth-start/index.ts` | Remove |
| `supabase/functions/meta-oauth-callback/index.ts` | Remove |
| `src/pages/MetaAnalytics.tsx` | Update -- replace OAuth UI with discover/connect flow |
| `src/pages/MetaOAuthResult.tsx` | Remove |
| `src/hooks/useInstagramConnections.ts` | Update -- replace OAuth mutation with discover/connect logic |
| `src/App.tsx` | Remove `/oauth/meta/result` route |
| Database migration | Update `instagram_connections` table |

### Technical: Discover Accounts Edge Function

```text
GET meta-discover-accounts

Uses META_SYSTEM_USER_TOKEN + META_BUSINESS_ID to call:
  GET https://graph.facebook.com/v19.0/{business_id}/owned_instagram_accounts
  GET https://graph.facebook.com/v19.0/{business_id}/client_instagram_accounts

Returns: [{ ig_account_id, username, followers_count, profile_picture_url }]
```

### Technical: Updated Insights Fetch

```text
POST fetch-instagram-insights { connection_id }

1. Look up connection -> get ig_business_account_id + page_id
2. Use META_SYSTEM_USER_TOKEN (single token for all accounts)
3. Fetch insights from Instagram Graph API
4. Store in instagram_insights table
```

