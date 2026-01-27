
# Partnership Updates Enhancement Plan

## Overview
This plan addresses two main issues: (1) brands from emails/Slack not appearing in canvas updates because they're not in the Deal Tracker, and (2) AI not properly extracting key updates and next steps.

## Current State Analysis

The current flow has these issues:

1. **Canvas generation is deal-centric**: The `generate-talent-canvas` function queries the `deals` table first, then looks for matching updates. If a brand isn't in the Deal Tracker, it won't appear.

2. **AI tagging is limited**: The `tag-updates` function extracts `talent_name`, `brand_name`, and `is_noise`, but doesn't extract `key_point` (summary) or `action_items` that could populate the canvas.

3. **Most updates aren't tagged**: The `tag-updates` function needs to be called after syncing emails/Slack, and it needs to populate the metadata with extractable insights.

## Implementation Plan

### Phase 1: Enhance AI Tagging to Extract Key Updates and Action Items

**File:** `supabase/functions/tag-updates/index.ts`

Update the AI prompt and tool definition to also extract:
- `key_point`: A one-line summary of what this message is about
- `action_items`: Any next steps or to-dos mentioned

The extracted data will be stored in the `metadata` field alongside the existing `brand_name` and `is_noise` fields.

```text
Key changes:
- Add key_point and action_items to the tool parameters
- Update the prompt to instruct the AI to extract these fields
- Store the extracted data in metadata
```

### Phase 2: Identify New Brands Not in Deal Tracker

**File:** `supabase/functions/generate-talent-canvas/index.ts`

Modify the canvas generation to:
1. First query `talent_updates` for the selected talent to find all brand mentions
2. Compare extracted brand names against the `deals` table
3. Include a "New Opportunities" section for brands found in emails/Slack but not in the Deal Tracker

```text
Key changes:
- Query talent_updates for the talent (filter by talent_name or channel name)
- Group messages by brand_name from metadata
- For brands NOT in deals table, add them to a "New Opportunities" section
- For brands IN deals table, proceed with existing logic
```

### Phase 3: Improve Canvas Content Using AI-Extracted Insights

**File:** `supabase/functions/generate-talent-canvas/index.ts`

Update the canvas generation logic to:
1. Use the pre-extracted `key_point` and `action_items` from `metadata` when available
2. Fall back to real-time AI summarization only if pre-extracted data is missing
3. Aggregate the key points into concise updates per brand

```text
Key changes:
- When fetching talent_updates, also include metadata
- Group updates by brand (from metadata.brand_name)
- Use metadata.key_point as "Key Updates" if available
- Use metadata.action_items as "Next Steps" if available
- Only call AI summarization if these fields are empty
```

### Phase 4: Auto-Trigger Tagging After Sync

**File:** `src/pages/PartnershipUpdates.tsx` and hooks

After syncing Gmail/Slack, automatically invoke the `tag-updates` function to process new messages. This ensures all updates are tagged with:
- talent_name
- brand_name  
- key_point
- action_items
- is_noise flag

```text
Key changes:
- Add a call to invoke "tag-updates" after fetchEmails and fetchSlack complete
- Show a toast indicating tagging is in progress
- Optionally add a "Re-tag Updates" button for manual triggering
```

## Technical Details

### Database Schema (No Changes Needed)
The `talent_updates.metadata` JSONB field can already store the additional extracted fields:
- `brand_name` (existing)
- `is_noise` (existing)
- `key_point` (new)
- `action_items` (new - array of strings)

### Edge Function Changes

**tag-updates/index.ts:**
```text
1. Update AI prompt to extract 4 fields: talent_name, brand_name, key_point, action_items, is_noise
2. Use tool calling with expanded parameters
3. Store all extracted data in metadata
```

**generate-talent-canvas/index.ts:**
```text
1. Query talent_updates for the talent (by talent_name column or channel patterns)
2. Group updates by metadata.brand_name
3. Cross-reference with deals table to identify:
   - Existing deals: show in main table
   - New opportunities: show in separate section
4. For each brand:
   - Aggregate key_points as "Key Updates"
   - Aggregate action_items as "Next Steps"
   - Fall back to AI summarization if fields empty
5. Return new brands count in preview response
```

### UI Changes

**PartnershipUpdates.tsx:**
```text
1. After sync completes, call tag-updates
2. Add status indicator showing tagging progress
3. Optionally show "New Opportunities" count in preview
```

**CanvasPreviewTable.tsx:**
```text
1. Add visual distinction for "New Opportunities" vs existing deals
2. Show a badge or highlight for brands not in Deal Tracker
```

## File Changes Summary

| File | Action | Description |
|------|--------|-------------|
| `supabase/functions/tag-updates/index.ts` | Modify | Expand AI extraction to include key_point and action_items |
| `supabase/functions/generate-talent-canvas/index.ts` | Modify | Query updates first, identify new brands, use pre-extracted insights |
| `src/pages/PartnershipUpdates.tsx` | Modify | Auto-trigger tagging after sync, show progress |
| `src/components/CanvasPreviewTable.tsx` | Modify | Visual distinction for new opportunities |
| `src/hooks/useTalentDeals.ts` | Modify | Add tagUpdates function, update preview interface |

## Expected Outcome

After implementation:
1. Syncing Gmail/Slack will automatically tag messages with talent, brand, key points, and action items
2. Canvas preview will show ALL brands mentioned for a talent, not just those in the Deal Tracker
3. "New Opportunities" section will highlight brands that need to be added to the Deal Tracker
4. Key Updates and Next Steps will be pre-populated from AI extraction, with accurate summaries
5. Users can still edit the preview before publishing to Slack
