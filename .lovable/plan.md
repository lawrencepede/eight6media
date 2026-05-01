## Temporary landing page at thenotagency.com

A domain-aware landing page that renders only when visitors arrive on `thenotagency.com`. The Eight-Six site stays untouched on `eight6media.lovable.app` and the preview URL.

### What you'll see

A single full-screen page on the olive (`#838E00`) background recreating the Canva mockup:

```text
┌───────────────────────────────────────────┐
│                                           │
│  NOT.        ⌐ your typical partnerships  │
│  ANOTHER                                  │
│  TALENT AGENCY                            │
│                                           │
│                                           │
│           [ Get in touch → ]              │
│                                           │
│                                           │
│   © the not agency · lawrence@eight6...   │
└───────────────────────────────────────────┘
```

- "NOT." in pale blue (`#CAD7EB`), the rest in deep brown (`#523838` / `#421E18`) — heavy condensed display type
- Handwritten "your typical partnerships" with little arrow, in cream/blue
- Single CTA → `mailto:lawrence@eight6media.com`
- Tiny footer line (copyright + email)
- No nav, no other sections — truly a holding page

### What I need from you

1. **Two font files** uploaded into chat:
   - The heavy condensed display font from the mockup (looks like Druk Wide / Compacta / Knockout — whatever the actual Canva file uses). Upload `.ttf`, `.otf`, `.woff`, or `.woff2`.
   - The handwritten script font for "your typical partnerships"
2. (Optional) If you want me to use specific copy beyond what's on the mockup + a CTA + the email line, send it. Otherwise I'll keep it to exactly what's shown.

I'll wire them in via `@font-face` and use them only on the Not Agency page so they don't affect the rest of the site.

### Technical implementation

1. **Save the color palette to memory** at `mem://design/thenotagency-palette` with all 12 colors + the 4 designated background colors, so future work on this brand stays consistent.
2. **New page** `src/pages/NotAgency.tsx` — self-contained, full-bleed olive background, no `Navigation`/`Footer` from the existing site.
3. **Domain-aware routing** in `src/App.tsx`:
   - At the `/` route, check `window.location.hostname`. If it matches `thenotagency.com` or `www.thenotagency.com`, render `<NotAgency />` instead of `<Index />`. Otherwise render `<Index />` as today.
   - Also hide the global `<Navigation />` on the not-agency host (it's a standalone landing page).
   - Add an explicit `/notagency` route too, so we can preview it on the lovable.app URL before the DNS fully propagates.
4. **Fonts** placed in `src/assets/fonts/` and loaded via a scoped `@font-face` block in `src/index.css` (or a page-local style block). Only the Not Agency page applies them — Eight-Six keeps Playfair/Inter.
5. **No new routes for the user to remember** — `thenotagency.com/` just works.

### Out of scope (call out separately if you want them)

- Email capture / waitlist form (would need a Lovable Cloud table + form)
- SEO meta tags swap per-domain (can add later — `index.html` is shared across domains so the title/OG tags will currently say "Lovable App" on both)
- Favicon swap per-domain

Reply with the two font files and I'll ship it.