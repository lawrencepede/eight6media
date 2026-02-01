
# Improve Meta Analytics Connection UI

## Summary
Rename and reorganize the connection buttons to be clearer, and fix the bug where creator IDs aren't being passed through the OAuth flow.

---

## UI Changes

### Before
- Button: "Connect New Account"
- Dropdown: "Or link to a creator..."

### After
- Dropdown/Button: "Connect Eight-Six Talent" (shows your roster with names + Instagram handles)
- Button: "Connect a New Account" (for non-roster connections)

---

## Bug Fix
The `creator_id` is currently lost in the OAuth flow. The hook prepares it but never sends it to the edge function.

**Fix in `src/hooks/useInstagramConnections.ts`:**
```typescript
// Before (broken - creatorId never sent)
const { data, error } = await supabase.functions.invoke("meta-oauth-start", {
  body: null,
  method: "GET",
});

// After (fixed - pass creator_id as query param)
const url = `meta-oauth-start${creatorId ? `?creator_id=${creatorId}` : ''}`;
const { data, error } = await supabase.functions.invoke(url);
```

---

## File Changes

### 1. `src/hooks/useInstagramConnections.ts`
- Fix the `startOAuth` mutation to properly pass `creator_id` to the edge function

### 2. `src/pages/MetaAnalytics.tsx`
- Rename "Connect New Account" → "Connect a New Account"
- Replace the Select dropdown with a proper "Connect Eight-Six Talent" button that opens a dropdown
- Add Instagram handle next to each talent name for easier identification (e.g., "Amanda • @amandasmith")
- Reorder so "Connect Eight-Six Talent" appears first (primary action)

---

## Technical Details

### Updated UI Component Structure
```tsx
<CardContent>
  <div className="flex flex-wrap gap-4">
    {/* Primary: Connect roster talent */}
    <Select onValueChange={(value) => handleConnect(value)}>
      <SelectTrigger className="w-[280px]">
        <SelectValue placeholder="Connect Eight-Six Talent" />
      </SelectTrigger>
      <SelectContent>
        {creators.map((creator) => (
          <SelectItem key={creator.id} value={creator.id}>
            {creator.name} • @{creator.instagramHandle}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
    
    {/* Secondary: Connect non-roster accounts */}
    <Button variant="outline" onClick={() => handleConnect()}>
      <Plus className="w-4 h-4 mr-2" />
      Connect a New Account
    </Button>
  </div>
</CardContent>
```

### Fixed Hook (passing creator_id)
The edge function `meta-oauth-start` already reads `creator_id` from query params. We just need to send it:

```typescript
mutationFn: async (creatorId?: string) => {
  const functionPath = creatorId 
    ? `meta-oauth-start?creator_id=${encodeURIComponent(creatorId)}`
    : "meta-oauth-start";
    
  const { data, error } = await supabase.functions.invoke(functionPath);
  if (error) throw error;
  return data as { auth_url: string };
},
```

---

## Expected Result
1. Clear two-option UI: "Connect Eight-Six Talent" (dropdown) and "Connect a New Account" (button)
2. When talent is selected from dropdown, their `creator_id` is properly saved with the connection
3. Connected accounts show "Linked to [Creator Name]" when they were connected via roster selection
