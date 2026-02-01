
# Fix Meta OAuth HTML Rendering and Error Messages

## Problem Analysis

Based on the screenshot, I can see:
1. **HTML is partially rendering** - The page structure is there, but special characters (✓/✗) are rendering as garbled text (`âœ–`)
2. **The error is technically correct** - A personal Instagram account won't have an "Instagram Business Account" linked to Facebook Pages
3. **The flow is confusing** - User expects a clear "this isn't a Professional account" message, but instead gets a technical message about Facebook Pages

## Root Causes

1. **Character encoding issue**: The UTF-8 special characters (✓, ✗) aren't being properly encoded in the HTML response
2. **Error message timing**: The "No Instagram Business Account" error comes AFTER OAuth succeeds, but doesn't clearly explain it's because the account isn't Professional
3. **Missing charset declaration**: The HTML response doesn't specify UTF-8 charset in the meta tag

## Solution

### 1. Fix Character Encoding
Add proper UTF-8 meta charset declaration and use HTML entities instead of raw Unicode characters

### 2. Improve Error Messages
Make the "No Instagram Business Account" error clearly explain that this happens when:
- The Instagram account is a Personal account (not Professional)
- Or the Professional account isn't properly linked to a Facebook Page

### 3. Add Better User Guidance
Include step-by-step instructions on how to:
- Convert to a Professional account
- Link to a Facebook Page

## Technical Changes

**File: `supabase/functions/meta-oauth-callback/index.ts`**

1. Add `<meta charset="UTF-8">` to the HTML template
2. Replace Unicode symbols with HTML entities or simpler ASCII alternatives
3. Update the "No Instagram Business Account" error message to be more user-friendly and explain the Professional account requirement
4. Add `white-space: pre-line` CSS to properly render multi-line messages

```
Updated HTML template:
- Add: <meta charset="UTF-8">
- Replace: ✓ → &#10003; (or simple "Success!")
- Replace: ✗ → &#10007; (or simple "Error")

Updated error message for "No Instagram Business Account":
"Your Instagram account must be a Professional account (Business or Creator) 
to connect with this tool.

To fix this:
1. Open Instagram → Settings → Account
2. Switch to Professional Account
3. Link it to a Facebook Page
4. Try connecting again"
```

## Expected Result

After these changes:
- Error pages will render cleanly with proper characters
- Users will immediately understand they need a Professional account
- Clear step-by-step instructions will guide them to fix the issue
