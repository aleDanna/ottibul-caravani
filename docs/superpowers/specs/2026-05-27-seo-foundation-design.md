# SEO Foundation — Design

**Date:** 2026-05-27
**Status:** Approved, ready for implementation plan
**Scope:** "Minimo Viabile" — technical SEO + on-page copy retrofit + foundational off-site setup. Excludes blog/cornerstone content, link-building, and additional locales.

## Problem

Otti Bull is a Barcelona-based premium camper rental business with no measurable Google presence. The site has decent technical SEO bones from commit [6681653](https://github.com/aleDanna/ottibul-caravani/commit/6681653) (sitemap, robots, OG image, basic JSON-LD, per-page `generateMetadata`), but:

- No Google Search Console property → impossible to verify indexation or query data
- No Google Business Profile → invisible in Google Maps and local pack
- No analytics → no traffic baseline, no behavior data
- No cookie consent → GA4 (preferred by user) cannot be installed compliantly in EU
- No `metadataBase` → Open Graph URLs may resolve incorrectly
- No `BreadcrumbList`, `FAQPage`, or `ItemList` JSON-LD → missing rich-result opportunities on faq/catalog/vehicle pages
- Open Graph image is global text-only — sharing a vehicle link on WhatsApp/social shows "Otti Bull" instead of the actual camper photo
- Copy was written for users, not for search intent — meta titles/descriptions and H1s do not target commercial queries

## Goal

Establish a foundation that lets Google reliably crawl, index, and (eventually) rank Otti Bull for commercial queries in es-ES, ca-ES, and en. After 90 days from deploy: ≥80% of pages indexed, ≥1 primary commercial query in top 20, Core Web Vitals "Good" on mobile, GBP active with ≥3 reviews.

## Non-goals

- Blog or cornerstone content (deferred to Phase 2)
- Backlink campaign, marketplace listings (Yescapa/Goboony/etc.), or outreach (Phase 2)
- French/German/Italian locales (explicit decision — only es/ca/en stay)
- Commercial CMP (Cookiebot/Iubenda) — custom banner is sufficient at current scale
- A/B testing of copy variants (Phase 2)
- URL slug restructuring (e.g., `/catalog` → `/alquiler-autocaravanas`) — breaks existing URLs, low ROI at this scale
- SEO ranking guarantees — SEO is not deterministic
- Cornerstone landing pages per Catalan city (Sitges/Girona/Tarragona) — Phase 2

## Decisions

| Decision | Choice | Rationale |
|---|---|---|
| Scope | "A — Minimo Viabile" | No existing assets; foundation matters more than scaling content |
| Locales | Keep es/ca/en, no fr/de/it | Adding locales without translator capacity dilutes quality signal |
| Authoring | AI drafts → user reviews ES | User accepted; review pass keeps native-fluent Spanish |
| Analytics | Google Analytics 4 (Consent Mode v2) | User explicit choice over Vercel Web Analytics |
| Consent UX | Custom minimal banner | No commercial CMP needed at this scale; zero dependency cost |
| Performance | Vercel Speed Insights kept | Server-side, no cookies, free on hobby plan; complements GA4 |
| Hosting | Vercel (hobby) | Confirmed via `.vercel/project.json` and `VERCEL_OIDC_TOKEN` |

## Design

The work splits into 4 sections. Sections 1, 2, 3 are independent and can be implemented in parallel; Section 4 (validation) is the gate.

### Section 1 — Off-site setup

Manual actions outside the codebase plus the small code surface needed to wire them in.

**1.1 Google Search Console**
- Owner creates "Domain" property for `ottibull.com` (covers all protocols and subdomains)
- DNS TXT verification
- Owner provides `google-site-verification` token → wired into root metadata (§2.2)
- Sitemap submitted: `https://ottibull.com/sitemap.xml`

**1.2 Google Business Profile**
- Owner creates GBP for "Otti Bull SL" at `C/ L'Alfambra, 14, P.4 Pta.2, 08034 Barcelona`
- Primary category: "Servicio de alquiler de vehículos recreativos" / "Camper van rental agency"
- Photos: exterior, interior, vehicles (≥10), staff/owner if comfortable
- Hours, phone, link to `https://ottibull.com/es`
- Owner solicits ≥3 reviews from recent customers (review-request copy provided in implementation deliverables)

**1.3 Analytics + consent banner**
- Owner creates GA4 property → provides `Measurement ID` → wired into `NEXT_PUBLIC_GA_MEASUREMENT_ID`
- GA4 linked to GSC via "Acquisition" integration
- `gtag.js` installed via `next/script strategy="afterInteractive"`, **gated by consent**
- Consent Mode v2: default state `denied` for `analytics_storage` until user accepts
- Custom banner component in `[locale]/layout.tsx`:
  - Three actions: Accept / Reject / Customize (latter shows category toggles, only "analytics" matters)
  - Translated in es/ca/en (next-intl keys)
  - Persisted in `localStorage` (key `ottibull-cookie-consent-v1`)
  - Re-shown if version bumps
- Vercel Speed Insights via `@vercel/speed-insights` — server-side beacon, no consent needed

### Section 2 — Technical SEO

Code patches. All scoped, no refactor.

**2.1 `src/lib/seo.ts` expansion**
- Export `metadataBase: URL` from `NEXT_PUBLIC_SITE_URL`
- `breadcrumbJsonLd(items: { name: string; url: string }[])` helper
- `faqJsonLd(faqs: { question: string; answer: string }[])` helper
- `itemListJsonLd(items: { url: string; name: string; image?: string }[], locale: Locale)` helper
- Enrich `organizationJsonLd()`:
  - `@id` stable identifier (`${BASE}/#organization`)
  - `image` (logo URL)
  - `priceRange: "€€"`
  - `areaServed: { @type: "Country", name: "Spain" }`
  - `geo: { latitude: 41.3826, longitude: 2.1429 }` (Barcelona approx, owner refines if needed)

**2.2 `src/app/[locale]/layout.tsx` — root metadata**
- Add `export const metadata: Metadata` with:
  - `metadataBase`
  - `title.template: "%s · Otti Bull"`, `title.default: "Otti Bull"`
  - `verification: { google: process.env.GOOGLE_SITE_VERIFICATION }`
  - `robots: { index: true, follow: true, googleBot: { index: true, follow: true, "max-snippet": -1, "max-image-preview": "large", "max-video-preview": -1 } }`
  - `twitter: { card: "summary_large_image" }` (defaults; per-page metadata still wins)
- Mount `<ConsentBanner />` and `<GoogleAnalytics />` below `<NextIntlClientProvider>`
- Mount `<SpeedInsights />` from `@vercel/speed-insights/next`
- Add `<link rel="manifest" href="/manifest.webmanifest" />` via `metadata.manifest`

**2.3 Per-page enhancements**
- `[locale]/catalog/page.tsx` — `ItemList` JSON-LD from published vehicles + `BreadcrumbList` (Home › Catálogo)
- `[locale]/faq/page.tsx` — `FAQPage` JSON-LD from published FAQs + `BreadcrumbList`
- `[locale]/vehicles/[slug]/page.tsx` — existing `Product` JSON-LD kept, add `BreadcrumbList` (Home › Catálogo › {title})
- `[locale]/about/page.tsx` — `BreadcrumbList`
- `[locale]/useful-links/page.tsx` — `BreadcrumbList`

**2.4 Open Graph per-page (selective)**
- New `src/app/[locale]/vehicles/[slug]/opengraph-image.tsx` — dynamic 1200×630 with vehicle title + cover photo via `ImageResponse`
- Existing global `src/app/opengraph-image.tsx` kept as fallback (home, catalog, about, faq)

**2.5 Sitemap + robots refinement**
- `sitemap.ts`:
  - `priority: 1.0` for `/{defaultLocale}` (es), `0.9` for ca/en variants — disambiguates default-locale signal
  - `lastModified` populated from `max(vehicles.updatedAt, faqs.updatedAt)` on the homepage entry
- `robots.ts`: explicitly add `/admin/login` to disallow list (separate from `/admin/` for clarity)

**2.6 Core Web Vitals pass**
- Audit `next/image` usage on hero (`priority` only on first hero slide, `fetchPriority="high"` on LCP image)
- Verify `sizes` attributes are realistic (not all `100vw`)
- Verify all vehicle images use lazy loading except cover above-the-fold
- Add `<link rel="preconnect" href="https://www.googletagmanager.com" />` (only when consent given, via dynamic injection)
- Document baseline Lighthouse scores in §4.1 before changes

### Section 3 — Copy retrofit

No new pages. Optimize existing copy for commercial intent in es/ca/en.

**3.1 Keyword map (initial hypothesis — refined post-GSC data)**

| Page | Locale | Primary query | Secondary |
|---|---|---|---|
| Home | es | alquiler autocaravana Barcelona | alquiler camper Barcelona, alquiler autocaravana premium |
| Home | ca | lloguer autocaravana Barcelona | lloguer camper Barcelona |
| Home | en | camper rental Barcelona | campervan hire Barcelona, motorhome rental |
| Catalog | es | flota autocaravanas Barcelona | alquilar autocaravana Cataluña |
| Catalog | ca | flota autocaravanes Barcelona | — |
| Catalog | en | camper fleet Barcelona | — |
| About | es | Otti Bull autocaravanas Barcelona | empresa alquiler camper Barcelona |
| FAQ | es | preguntas alquiler autocaravana | seguro autocaravana alquiler |
| Vehicle | es | alquiler {model} Barcelona | precio {model} día |

Volumes/competition are not measured (no Ahrefs/SEMrush in scope). Post-launch GSC data drives the refinement at 30 days.

**3.2 Per-page retrofit**

For each page in the table above, regenerate:
- `metaTitle` — ≤60 chars, contains primary keyword, suffixed `· Otti Bull`
- `metaDescription` — 150–160 chars, contains secondary keyword + CTA
- `H1` — naturally phrased, consistent with metaTitle
- Hero subtitle / intro paragraph — keyword-coherent, no stuffing
- Mid-page body where it serves intent (e.g., catalog "why us" microcopy)

Files touched:
- `src/messages/{es,ca,en}.json` — `home.*`, `catalog.*`, `about.*`, `faq.*` keys (NOT `usefulLinks` — deprioritized)

Vehicle-page copy lives in DB (`vehicle_translations.metaTitle/metaDescription`). Implementation produces a per-vehicle brief; owner applies via admin panel.

**3.3 Image alt text audit**
- Brief produced as a Markdown table: `image.id` → current `altText` → proposed `altText` (descriptive, includes vehicle type + locale-appropriate keyword)
- Same for `heroImages`
- Owner applies via admin (no auto bulk-update — admin UI is the source of truth)

**3.4 Internal linking**
- New "Vehículos similares" section on `[locale]/vehicles/[slug]/page.tsx`: 3 cards of same `type`, excluding current vehicle. Spec: same `VehicleCard` component, ordered by `sortOrder desc, createdAt desc`, limit 3.
- Footer: add direct links to Catalog and FAQ. Current `Footer.tsx` shows only About + legal pages under `footer.groupRental` / `footer.groupHelp`. Wire `groupRental` → Catalog (and "Featured fleet" anchor to home `#featured`); `groupHelp` → FAQ + About.

**3.5 Vehicle slug brief**
- Markdown doc that owner uses as a style guide when creating vehicle slugs via admin: `mclouis-mc4-72-4-plazas` (descriptive) instead of `vehiculo-1` (opaque)
- Existing slugs reviewed against this criterion: an opaque slug (e.g. `vehiculo-1`, `camper-2`, missing model name) is bad; a descriptive slug (e.g. `mclouis-mc4-72-4-plazas`) is good. For each bad slug, owner rewrites via admin AND we add a 301 redirect in `proxy.ts` from the old slug to the new. Hard cap: ≤5 rewrites in this phase. More than 5 → migration deferred to Phase 2.

**3.6 Deliverable format**
- `docs/seo/copy-retrofit-draft.md` — all proposed copy side-by-side (es/ca/en), each field labeled with file path and JSON key
- Owner reviews ES (primary), confirms ca/en are reasonable translations
- After approval, implementation applies to `messages/*.json` and produces the vehicle/alt-text briefs

### Section 4 — Validation

**4.1 Baseline (before any code change)**
- Lighthouse mobile snapshots on `/es`, `/es/catalog`, `/es/vehicles/{first-published-slug}` — record Performance, Accessibility, Best Practices, SEO scores
- `site:ottibull.com` Google query — record current indexed page count
- Anonymous Google search for "alquiler autocaravana Barcelona" from incognito — record Otti Bull's position (likely absent)

**4.2 Post-deploy verification checklist**

Implementation is not "done" until all of these pass:

- [ ] `https://ottibull.com/robots.txt` accessible, includes `Sitemap:` line
- [ ] `https://ottibull.com/sitemap.xml` parses, includes all locale × static paths + published vehicles
- [ ] `/es` source HTML includes `<meta name="google-site-verification">` with correct token
- [ ] GSC shows property as "Verified"
- [ ] GSC → Sitemap submission status: "Success"
- [ ] Google Rich Results Test passes for:
  - Home — `LocalBusiness`
  - Catalog — `ItemList`
  - FAQ — `FAQPage`
  - Vehicle — `Product` + `BreadcrumbList`
- [ ] Mobile-Friendly Test passes for all 4 page types
- [ ] WhatsApp / LinkedIn link preview on a vehicle URL shows vehicle cover photo (not generic Otti Bull OG)
- [ ] GSC "International Targeting" shows no hreflang errors
- [ ] Consent banner appears on first visit (incognito), GA4 fires **zero** requests before "Accept"
- [ ] After "Accept": GA4 Realtime shows the test session within ~30s
- [ ] Vercel Speed Insights dashboard populates within 48h
- [ ] GBP marked verified (calendar-blocked: postcard takes up to 14 days — non-blocking for code deploy)

**4.3 Monitoring rhythm**
- **Week 1:** daily GSC Coverage check. Use "URL Inspection" + "Request Indexing" on key pages if not indexed within 48h.
- **Weeks 2–4:** weekly GSC Performance review (query / page / CTR / position).
- **Month 2:** first refinement. Pages with impressions >100 and CTR <2% → rewrite metaTitle/metaDescription. Discover unexpected queries → feed them into the keyword map.
- **Month 3:** decide Phase 2 trigger. Strong indexation + ≥1 commercial query in top 20 → invest in cornerstone/blog. Otherwise diagnose before scaling.

**4.4 Success criteria (90 days post-deploy)**
- ≥80% of published pages indexed (GSC Coverage)
- ≥1 primary commercial query in position 11–20 (top 20)
- ≥10 daily search impressions for the domain
- GBP profile active with ≥3 reviews
- Mobile Core Web Vitals "Good" on home + a vehicle page:
  - LCP < 2.5s
  - INP < 200ms
  - CLS < 0.1

Modest by design — 90 days is short for SEO. Real ramp arrives months 4–6.

## Risks and tradeoffs

| Risk | Mitigation |
|---|---|
| GBP postcard verification can take 1–2 weeks | Owner starts §1.2 immediately, in parallel with code work |
| GA4 + consent banner adds first-visit friction | Banner sized discreetly, bottom-right, non-blocking; Reject is one click |
| Custom banner is not legally airtight | Acceptable risk at <10k visitors/month; commercial CMP is a Phase 2 upgrade if traffic justifies it |
| Keyword hypotheses without real data | Explicitly time-boxed: GSC at 30 days replaces hypothesis with measurement |
| `ItemList` / `FAQPage` schema can be rejected by Google if content thin | FAQ already has multiple Q&As; catalog has multiple vehicles. Validated via Rich Results Test before declaring §4.2 done |
| `metadataBase` change can break absolute URLs in old indexed pages | URLs are already self-consistent; risk is low. Smoke test all `<link rel="canonical">` and OG `og:url` post-deploy |
| Vehicle OG image generation cost | Cached by Vercel CDN; `ImageResponse` is fast. No measurable cost on hobby tier |
| Phase 2 deferred indefinitely | This is by design — re-evaluate at month 3 based on §4.4 data |

## File map (preview)

Files this design will touch in the implementation phase:

```
src/
  app/
    [locale]/
      layout.tsx                              [modify — root metadata + banner + GA]
      catalog/page.tsx                        [modify — ItemList JSON-LD]
      faq/page.tsx                            [modify — FAQPage JSON-LD]
      about/page.tsx                          [modify — BreadcrumbList]
      useful-links/page.tsx                   [modify — BreadcrumbList]
      vehicles/[slug]/
        page.tsx                              [modify — BreadcrumbList, similar-vehicles]
        opengraph-image.tsx                   [new — dynamic OG]
    sitemap.ts                                [modify — priority/lastModified]
    robots.ts                                 [modify — disallow /admin/login]
    manifest.ts                               [new — PWA manifest]
  components/public/
    ConsentBanner.tsx                         [new]
    GoogleAnalytics.tsx                       [new — gtag.js + Consent Mode v2]
    VehicleSimilar.tsx                        [new — "Vehículos similares" block]
    Footer.tsx                                [modify — populate group links]
  lib/
    seo.ts                                    [modify — helpers + enrich org schema]
  messages/
    es.json, ca.json, en.json                 [modify — copy retrofit]
docs/
  seo/
    copy-retrofit-draft.md                    [new — drafts for review]
    vehicle-slug-style.md                     [new — owner brief]
    image-alt-audit.md                        [new — owner brief]
    review-request-templates.md               [new — GBP reviews]
.env.example
  NEXT_PUBLIC_GA_MEASUREMENT_ID               [new]
  GOOGLE_SITE_VERIFICATION                    [new]
```

## Open items for owner (manual)
1. Create GSC Domain property, provide verification token
2. Create GA4 property, provide Measurement ID
3. Create GBP profile, follow verification flow
4. Refine geo coordinates in §2.1 if street-level precision matters
5. Review and approve copy drafts in `docs/seo/copy-retrofit-draft.md`
6. Apply vehicle metaTitle/metaDescription via admin panel
7. Apply alt-text updates via admin panel
8. Solicit ≥3 GBP reviews from recent customers
