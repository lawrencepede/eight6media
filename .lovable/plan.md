# Parallel v2 of the Eight-Six site

Goal: stand up a complete second version of the marketing site that lives alongside the current one, so you can flip between them page-for-page and cherry-pick what you like. The Not. landing (`/notagency` + thenotagency.com host) is untouched.

## Routing

v1 stays exactly where it is. v2 mounts under a `/v2` prefix with a matching page for every current marketing route:

```
/                  → v1 Index           |  /v2                  → v2 Index
/work              → v1 Work            |  /v2/work             → v2 Work
/roster            → v1 Roster          |  /v2/roster           → v2 Roster
/for-brands        → v1 ForBrands       |  /v2/for-brands       → v2 ForBrands
/for-creators      → v1 ForCreators     |  /v2/for-creators     → v2 ForCreators
/about             → v1 About           |  /v2/about            → v2 About
```

Out of scope for v2 (kept v1-only): `/notagency`, `/auth`, `/console/*`, `/admin`, `/pitch/:slug`, the thenotagency.com host override.

## Floating version toggle

A small fixed pill in the bottom-right of every marketing page (v1 and v2) that shows the current version and jumps to the matching page in the other version. Hidden on `/notagency`, `/auth`, `/console/*`, `/admin`, `/pitch/*`, and on the thenotagency.com host.

- Click flips `/foo` ↔ `/v2/foo` preserving the rest of the path, query, and hash.
- Remembers last choice in `localStorage` so deep links from elsewhere can optionally honor it (off by default — URL is the source of truth).
- Visually unobtrusive, neutral styling so it doesn't bias either design.

## File structure

Fork-friendly layout so v2 can evolve independently without touching v1 files:

```
src/
  pages/
    v2/
      Index.tsx
      Work.tsx
      Roster.tsx
      ForBrands.tsx
      ForCreators.tsx
      About.tsx
  components/
    v2/                       ← v2-specific components live here
  components/
    VersionToggle.tsx         ← shared floating switcher
```

Initial v2 pages are scaffolded as minimal placeholders ("v2 — <page name> coming soon") so the routes resolve and the toggle works immediately. You then drop in your design brief / uploaded code and we build each v2 page out, page by page, without risk to v1.

v2 gets its own `Navigation` (forked into `src/components/v2/Navigation.tsx`) so nav styling/structure can diverge. `App.tsx` picks v1 vs v2 nav based on whether the path starts with `/v2`.

Shared/leave-alone for now: `AuthContext`, `ScrollToTop`, `ProtectedRoute`, all `/console` pages, data hooks (`useCreators`, `useBrandAssets`, etc.). v2 pages can import the same hooks so content stays in sync across versions.

## Technical details

- `src/App.tsx`: add `/v2`, `/v2/work`, `/v2/roster`, `/v2/for-brands`, `/v2/for-creators`, `/v2/about` routes above the catch-all. Compute `isV2 = location.pathname.startsWith('/v2')` and render `<NavigationV2 />` instead of `<Navigation />` when true. Keep the existing `hideNav` rules (notagency host + `/notagency` route) intact, and also hide both nav + toggle on console/auth/admin/pitch routes (already the case via the current `hideNav` logic for nav; toggle gets its own allowlist).
- `src/components/VersionToggle.tsx`: read `useLocation()`, compute the counterpart path, render a `Link` with the opposite label ("View v1" / "View v2"). Hidden via the same route allowlist as above.
- `src/components/v2/Navigation.tsx`: initial copy of `Navigation.tsx` with links rewritten to `/v2/...`. Free to restyle later.
- `src/pages/v2/*.tsx`: minimal placeholders importing the v2 nav offset, ready to be filled in.
- No DB, edge function, RLS, or auth changes. No changes to `/notagency`, `/console/*`, or thenotagency.com host behavior.

## What you can do after this lands

1. Visit any marketing page and click the floating toggle to jump to its v2 counterpart (placeholder for now).
2. Upload your v2 design brief / code and we'll build v2 pages out one at a time — each page can be compared 1:1 against v1 via the toggle.
3. When you're ready to promote v2, we either swap the routes or retire v1 pages — your call, no rush.
