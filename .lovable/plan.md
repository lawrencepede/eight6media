I found the likely root cause: the app is treating Seamless enrichment results as usable even while Seamless still reports the contacts as `researching`. The recent database records show contacts with `status: researching`, `email: null`, and empty `emails: []`, yet they were still created in HubSpot. That means the current wait/merge logic is not strict enough, and in some cases the frontend is falling back to the original search row rather than a finished enriched result.

Plan to resolve it:

1. Tighten the Seamless polling function
   - Update `seamless-search` so it does not return `complete: true` unless every selected contact has a terminal status like `done`/`complete`/`finished`.
   - Treat `researching` as still pending even if the API returns partial contact objects.
   - Preserve a clear `pendingCount`, `missingEmailCount`, and per-contact `status/message` so the UI can explain what happened.
   - Extract emails from all documented Seamless fields, especially `email`, `email1`, `email2`, `email3`, and their validation metadata (`email1EmailAI`, etc.), not just `emails[]`.

2. Fix frontend matching and waiting
   - Increase the frontend enrichment retry window so it gives Seamless time to finish instead of retrying only a few short times.
   - Index enriched results by both `searchResultId` and `requestId`, but when merging into selected contacts, only use a finished enriched result for that exact search result.
   - Do not import a row if enrichment is still pending/researching.
   - Change the toast copy from a generic “No email addresses found” to distinguish:
     - “Still researching, try again shortly”
     - “Finished but Seamless did not return an email”
     - “Email found and imported”

3. Add a safer backend guard
   - Keep the HubSpot function from creating contacts without email addresses.
   - Make it validate email presence and basic email shape before creating/updating HubSpot records.
   - Return skipped contacts separately from failed contacts so the UI can show the reason.

4. Add a debugging view in the Contact Sourcing page
   - Show an enrichment status column after pushing/enriching: `researching`, `done`, `no email`, `imported`, etc.
   - This will make it obvious whether Seamless is still working versus genuinely not having data for that contact.

5. Optional cleanup for bad HubSpot records already created
   - The earlier versions already created several HubSpot contacts with no email. I can add a one-time cleanup helper or backend action to locate the blank-email contacts created by this tool so you can remove or review them.

Technical notes:
- No new secrets are needed; `SEAMLESS_API_KEY` and the HubSpot connector secret are already configured.
- No database schema change is strictly required for the fix.
- The main code changes will be in:
  - `supabase/functions/seamless-search/index.ts`
  - `supabase/functions/hubspot-push-contacts/index.ts`
  - `src/pages/ContactSourcing.tsx`

After approval, I’ll implement this so the tool either imports contacts with real emails or clearly tells you Seamless is still processing / did not provide an email, instead of creating blank HubSpot records or showing a misleading generic error.