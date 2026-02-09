

## Add Gmail Drafts Syncing and Increase Sync Volume

### What Changes

1. **Sync your Gmail Drafts** -- The current sync only pulls inbox messages. Drafts live in a separate Gmail API endpoint (`/users/me/drafts`) that we're not calling at all. This update will fetch all drafts and store them in `talent_updates` with source `gmail-draft` so the AI assistant can search them.

2. **Pagination to get ALL messages** -- The Gmail API caps each request at 500 results and uses a `nextPageToken` for pagination. Currently we only fetch a single page of 100. This update will paginate through all available inbox messages and drafts so you get your full history, not just the most recent 100.

### How It Works

The `fetch-gmail` edge function will be updated to:

- **Fetch drafts**: Call the Gmail Drafts API (`/users/me/drafts`) with pagination, get each draft's metadata (To, Subject, Date, body snippet), and upsert them into `talent_updates` with `source: 'gmail-draft'`
- **Paginate inbox messages**: Loop using `nextPageToken` until all inbox messages since Dec 1, 2025 are fetched (instead of stopping at 100)
- **Paginate drafts**: Same pagination loop for drafts
- **Batch processing**: Process messages in batches of 50 to stay within edge function time limits

The AI assistant (`email-agent`) already queries all `talent_updates` records, so once drafts are synced they'll automatically be searchable -- no changes needed to the assistant itself.

### What You'll Be Able to Ask the AI

- "Look at my draft emails and compile a list of any that mention 'new talent'"
- "Which drafts have Instagram links in them?"
- "Show me all drafts I haven't sent yet about brand partnerships"

---

### Technical Details

**Modified file: `supabase/functions/fetch-gmail/index.ts`**

1. Add a pagination helper that follows `nextPageToken` until all pages are fetched
2. Change inbox fetch from `maxResults=100` (single page) to `maxResults=500` with pagination loop
3. Add a new section to fetch drafts via `GET /users/me/drafts` with pagination
4. For each draft, fetch metadata via `GET /users/me/drafts/{id}` (which returns the underlying message)
5. Extract To, Subject, Date headers and snippet from draft messages
6. Upsert drafts into `talent_updates` with `source: 'gmail-draft'` and `source_id` set to the draft ID
7. Return combined counts of inbox messages and drafts in the response

**No other files need to change** -- the AI assistant edge function and the frontend hook/component already work with all `talent_updates` records regardless of source.

