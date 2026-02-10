

## Implementation: Meta Analytics Agency Model

### Step 1: Store Secrets
Request and securely store two new secrets:
- **META_SYSTEM_USER_TOKEN** — your System User Access Token
- **META_BUSINESS_ID** — your Business Manager ID

### Step 2: Database Migration
Update the `instagram_connections` table:
- Drop `access_token` column (no longer needed per-connection)
- Drop `token_expires_at` column (system tokens don't expire)
- Add `ig_business_account_id` text column

### Step 3: Create `meta-discover-accounts` Edge Function
New function that uses the system token to call the Meta Business API and return all Instagram accounts your Business Manager has partner access to.

### Step 4: Update `fetch-instagram-insights` Edge Function
- Use `META_SYSTEM_USER_TOKEN` instead of per-connection access tokens
- Remove token expiry checks
- Look up `ig_business_account_id` from the connection record

### Step 5: Remove Old OAuth Functions
- Delete `meta-oauth-start` edge function
- Delete `meta-oauth-callback` edge function
- Remove related config entries

### Step 6: Update Frontend
- **`useInstagramConnections.ts`** — Replace OAuth mutation with discover/connect logic
- **`MetaAnalytics.tsx`** — Replace OAuth UI with "Discover Accounts" flow and creator linking
- **`App.tsx`** — Remove `/oauth/meta/result` route and `MetaOAuthResult` import
- **Delete `MetaOAuthResult.tsx`**

### Technical Details

**Database migration SQL:**
```text
ALTER TABLE instagram_connections DROP COLUMN access_token;
ALTER TABLE instagram_connections DROP COLUMN token_expires_at;
ALTER TABLE instagram_connections ADD COLUMN ig_business_account_id text;
```

**meta-discover-accounts function:**
- Reads META_SYSTEM_USER_TOKEN and META_BUSINESS_ID from env
- Calls GET graph.facebook.com/v19.0/{business_id}/owned_instagram_accounts
- Also calls /client_instagram_accounts for partnered accounts
- Returns array of { ig_account_id, username, followers_count, profile_picture_url }

**Updated fetch-instagram-insights:**
- Reads META_SYSTEM_USER_TOKEN from env (single token for all)
- Looks up connection to get ig_business_account_id
- Fetches insights using that account ID
- No token expiry logic needed

