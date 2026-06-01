## Goal

Rebuild the Eight-Six homepage and its core sections under `/v2/*` using the Not. brand system from the 12 uploaded files. The current `/` homepage, all root components, and the NotAgency holding page stay byte-for-byte unchanged. The floating VersionToggle already lets you flip between v1 and v2.

## Critical scoping decision (read first)

Your brief says "Replace `src/index.css` entirely" and "Replace `tailwind.config.ts` entirely". I will **not** do that — those files are global and replacing them would visually break the v1 homepage, the NotAgency page, every console/admin page, and every shadcn component (which depends on the existing HSL token system).

Instead, the Not. brand system will be **layered in additively**:

- `src/index.css` — *append* a `@layer base` block scoped to `.v2-root { ... }` that defines all Not. CSS custom properties (`--olive`, `--mauve`, `--sky`, `--lemon`, `--dark-brown`, `--indigo`, etc.), the `@font-face` declarations for Placard Next / Courier Prime / Biro Script / TAN St Canard, the `.label` utility, and `@keyframes marquee` + `@keyframes fadeUp`. Existing `:root` HSL tokens stay intact.
- `tailwind.config.ts` — *extend* (not replace) `theme.extend.colors` and `theme.extend.fontFamily` with the Not. tokens (`olive`, `mauve`, `sky`, `lemon`, `lime`, `terracotta`, `peach`, `indigo`, `lavender`, `rust`, `gold`, `dark-brown`, and font families `wordmark`, `display`, `displayCond`, `displayWide`, `hand`). Add `marquee` and `fadeUp` keyframes/animations alongside existing ones. **Do not** flip `borderRadius` globally to 0 (that breaks every shadcn UI) — v2 components will use inline `borderRadius: 0` or Tailwind `rounded-none`. **Do not** remap `background`/`foreground`/`primary` semantic tokens.

Every v2 page will be wrapped in `<div className="v2-root">…</div>` so all `var(--olive)` etc. references inside resolve correctly and nothing leaks out.

## Font assets

`/public/fonts/` already contains TAN St Canard, Biro Script, PlacardNext-Bold and PlacardNext-CondBold. Your uploaded `index.css` references several Placard files that **do not** exist locally (`PlacardNextRegular.TTF`, `PlacardNextMedium.TTF`, `PlacardNextLight.TTF`, `PlacardNextCondRg.TTF`, `PlacardNextCnMed.TTF`, `PlacardNextCondLt.TTF`, `PlacardNextCompMed.TTF`, `PlacardNextWideRg.TTF`, `PlacardNextWideMed.TTF`) plus `CoreBandiFaceW01-Regular.ttf` already there.

Plan: declare all the `@font-face` entries from your uploaded CSS as-is. The browser will skip missing files and fall back through the stack (`Archivo Narrow`, `Impact`, `sans-serif`) — pages will still render. After you approve, you can drop the missing `.ttf` files into `/public/fonts/` whenever and the type will upgrade automatically. I'll flag this in the final note so you know which files to upload.

## File plan (everything new lives under v2)

**Create new:**
- `src/components/v2/HeroSection.tsx` — from your upload, full Olive hero with NOT. wordmark, ANOTHER TALENT AGENCY headline, hand-drawn SVG arrow + "your typical partnerships" Biro aside, Mauve+outlined CTA buttons, parallax, scroll indicator.
- `src/components/v2/MarqueeSection.tsx` — Indigo strip, Lemon Placard text, Lime dot separators, infinite scroll.
- `src/components/v2/ManifestoSection.tsx` — Sky ground, diagonal hatch, UNDERGROUND CRAFT. ABOVE-GROUND RESULTS. headline, NOT/IS rows with Rust strikethrough, Biro aside.
- `src/components/v2/ServicesSection.tsx` — Lemon ground, 4 numbered rows (Talent Rep / Brand Partnerships / Content Strategy / Media & Distribution), Biro aside.
- `src/components/v2/AboutPreview.tsx` — Mauve ground, founder block, "86" watermark, Dark Brown CTA.
- `src/components/v2/CTASection.tsx` — Dark Brown ground, LET'S MAKE SOMETHING REAL, NOT. watermark, two buttons.
- `src/components/v2/Footer.tsx` — Dark Brown footer with Sky NOT. wordmark, 3 link columns, social squares.

**Overwrite the existing v2 placeholders** (these were scaffolded last turn and are still placeholders):
- `src/components/v2/Navigation.tsx` — replace with your uploaded Not. Navigation (NOT. wordmark, scroll-darken to Dark Brown, GET IN TOUCH button, mobile drawer).
- `src/pages/v2/Index.tsx` — assemble `<div className="v2-root">` → `NavigationV2` already mounts at the App level, so this file renders `HeroSection → MarqueeSection → ManifestoSection → ServicesSection → AboutPreview → CTASection → Footer` (matching your uploaded `Index.tsx`).

**Edit (additive only):**
- `src/index.css` — append the v2-scoped `@font-face`, custom properties, `.label`, `.fade-up*`, and marquee keyframes. Existing content untouched above.
- `tailwind.config.ts` — extend colors / fontFamily / keyframes / animation. Existing entries untouched.
- `src/App.tsx` — the v2 routes already exist and already render `NavigationV2` on `/v2/*`. No structural change; I'll just confirm `VersionToggle` still hides on `/notagency`, `/auth`, `/admin`, `/console/*`, `/pitch/*`.

**Do not touch:**
- `src/pages/Index.tsx`, `src/components/HeroSection.tsx`, `Footer.tsx`, `CTASection.tsx`, `Navigation.tsx`, `ProblemSection.tsx`, `DifferentiatorsSection.tsx`, `FeaturedCreatorSection.tsx`, etc.
- `src/pages/NotAgency.tsx` and any NotAgency assets.
- All shadcn `ui/*` components, console/admin pages, edge functions, supabase config.

## Verification after build

1. Visit `/` — confirm current Eight-Six site looks identical (dark warm, Playfair, Citron).
2. Visit `/v2` — confirm full Not. homepage renders top-to-bottom in correct colour rhythm: Olive → Indigo strip → Sky → Lemon → Mauve → Dark Brown → Dark Brown footer.
3. Click the floating VersionToggle pill — confirm it swaps `/` ↔ `/v2` cleanly.
4. Visit `/notagency` — confirm untouched.
5. Note in the closing message which Placard .ttf files to drop into `/public/fonts/` to remove the font fallback.

## What's deferred (not in this build)

- Other `/v2/*` pages (`/v2/work`, `/v2/roster`, `/v2/for-brands`, `/v2/for-creators`, `/v2/about`) stay as the existing `V2Placeholder`. You said homepage + core components only; we can rebrand the inner pages later in their own turn.
- Replacing v1 once you've compared — separate explicit step when you're ready.
