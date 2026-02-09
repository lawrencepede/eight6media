

## Fix Gmail Sync Timeout

### The Problem

The Gmail sync function is timing out because it makes API calls one-at-a-time for each message. With 155 inbox messages + 1,170 drafts, it needs thousands of sequential HTTP requests and runs out of time.

### The Fix

Optimize the edge function with **parallel batch processing** so it can handle the full volume within the time limit.

### Changes

**File: `supabase/functions/fetch-gmail/index.ts`**

1. **Parallel message fetching** -- Instead of fetching message details one by one, fetch them in parallel batches of 20-30 concurrent requests using `Promise.all()`. This will be 10-15x faster.

2. **Parallel draft fetching** -- Same batching approach for drafts. Fetch 20-30 draft details concurrently instead of sequentially.

3. **Parallel upserts** -- Batch database upserts using bulk inserts instead of one-at-a-time.

4. **Progressive response** -- If the function risks timing out on 1,170 drafts, limit to the most recent 500 drafts on initial sync and return a count so you know how many exist.

### Technical Detail

```text
Current flow (sequential):
  Message 1 -> wait -> Message 2 -> wait -> ... -> Message 155 -> wait
  Draft 1 -> wait -> Draft 2 -> wait -> ... -> Draft 1170 -> wait
  Total: ~1,325 sequential API calls (minutes)

Optimized flow (batched parallel):
  [Messages 1-25] in parallel -> [Messages 26-50] -> ... -> [Messages 126-155]
  [Drafts 1-25] in parallel -> [Drafts 26-50] -> ... -> [Drafts 476-500]
  Total: ~28 batch rounds (seconds)
```

No other files need to change -- the frontend hook and AI assistant already work with whatever gets synced.

