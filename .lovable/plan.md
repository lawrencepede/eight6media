# Seamless.ai → HubSpot Contact Tool

A new internal tool under the Backend Console that lets you search Seamless.ai for contacts, preview the results, and push selected ones into HubSpot (with optional storage in our database for tracking).

## What you'll be able to do

1. **Search Seamless.ai** by company, domain, title, location, etc.
2. **Preview enriched contacts** (name, title, company, email, phone, LinkedIn) in a results table.
3. **Select rows** and push them to HubSpot as Contacts (with company association if the company exists / can be created).
4. **Track imports** in our database so we don't re-push duplicates and can audit who was imported when.
5. **(Optional / "among other things")** Tag imported contacts in HubSpot with a custom property like `source = Seamless.ai` and a Lovable list/segment, and optionally create a HubSpot Note on the contact with the Seamless enrichment data.

## Where it lives

New card on `/console` called **"Contact Sourcing"** → route `/console/contact-sourcing`. Same `PasswordGate` + auth wrapper as other console tools.

## UI (single page)

- **Search bar** with filters: company name, domain, job title, seniority, location, industry.
- **Results table** with checkboxes, paginated. Columns: Name, Title, Company, Email, Phone, LinkedIn, Status (New / Already in HubSpot / Imported).
- **Bulk action bar**: "Push N to HubSpot" button + dropdown to pick HubSpot Owner and Lifecycle Stage.
- **Recent imports** panel below: last 50 contacts pushed, with link out to HubSpot.

## Backend

Two new edge functions:

1. **`seamless-search`** — proxies search/enrichment requests to Seamless.ai using a stored API key. Validates input with Zod, returns normalized contact objects. Checks each result against our `imported_contacts` table to flag duplicates.
2. **`hubspot-push-contacts`** — accepts an array of selected contacts, creates/updates them in HubSpot via the HubSpot connector (gateway), associates with company, sets `source` property, optionally creates a Note, then writes a row per contact into `imported_contacts`.

New table `imported_contacts`:
- `id`, `seamless_contact_id` (unique), `hubspot_contact_id`, `email`, `full_name`, `company`, `title`, `imported_by` (user id), `imported_at`, `raw_seamless_payload jsonb`, `raw_hubspot_response jsonb`.
- RLS: only authenticated console users can read/write.

## Integrations

- **HubSpot** — use the existing Lovable HubSpot connector (gateway-based, OAuth handled for us). I'll prompt you to connect it during build. Endpoints used: `POST /crm/v3/objects/contacts`, `POST /crm/v3/objects/companies`, association API, `POST /crm/v3/objects/notes`.
- **Seamless.ai** — Seamless does not have a Lovable connector and their public API docs are gated behind a customer login. I'll need:
  - Your **Seamless.ai API key** (stored as `SEAMLESS_API_KEY` secret).
  - Confirmation of the **base URL** and **search endpoint** you have access to (their API tier varies — common ones are `https://api.seamless.ai/v1/contacts/search` or the Enrichment API). Easiest: paste a snippet from your Seamless API docs page once you're logged in, or share the cURL example they give. I'll wire to whatever your account exposes.

## Open questions before I build

1. Do you want **Search** (find new contacts by filters) or **Enrichment only** (you paste an email/LinkedIn URL and we enrich + push), or **both**? Search is the bigger lift; enrichment is fast.
2. When a contact already exists in HubSpot (matched by email), should we **update** it, **skip** it, or **always create new**?
3. Should imports auto-associate to a HubSpot **Company** (creating the company if missing), or contacts only?
4. Any default HubSpot properties to set on every import (Lifecycle Stage = Lead, Lead Source = Seamless.ai, Owner = you)?

I'll ask these once you approve the overall shape, then connect HubSpot, request the Seamless API key, and build.
