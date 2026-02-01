
# Fix Double @ Symbol in Talent Dropdown

## Issue
The "Connect Eight-Six Talent" dropdown shows two @ symbols before each Instagram handle (e.g., "Amanda • @@amandasmith").

## Cause
The template in `MetaAnalytics.tsx` adds an `@` prefix, but the `instagramHandle` data already includes the `@` symbol from the database.

## Fix
Remove the extra `@` from line 138 in `src/pages/MetaAnalytics.tsx`:

**Before:**
```tsx
{creator.name} • @{creator.instagramHandle}
```

**After:**
```tsx
{creator.name} • {creator.instagramHandle}
```

## File Change
- `src/pages/MetaAnalytics.tsx` - Line 138: Remove the `@` prefix from the template string
