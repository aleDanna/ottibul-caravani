# Post-Deploy SEO Verification Checklist

Run this after the first production deploy that includes the SEO foundation. The deploy is not "done" until every item passes.

Replace `https://ottibull.com` with the actual production URL if different.

## Infrastructure

- [ ] `https://ottibull.com/robots.txt` returns 200, includes `Sitemap:` line and `Host:` line
- [ ] `https://ottibull.com/sitemap.xml` returns 200, parses as valid XML, contains all locale × static paths + every published vehicle
- [ ] `https://ottibull.com/manifest.webmanifest` returns valid JSON with `name`, `short_name`, `theme_color`
- [ ] `https://ottibull.com/` (no locale) redirects to `https://ottibull.com/es` (HTTP 307/308)

## Metadata

- [ ] `view-source:https://ottibull.com/es` shows `<meta name="google-site-verification" content="...">` with owner's real token
- [ ] `<title>` matches approved copy
- [ ] `<meta name="description">` matches approved copy
- [ ] `<link rel="canonical">` points to the absolute `https://ottibull.com/es` URL
- [ ] `<link rel="alternate" hreflang="...">` present for all 3 locales + `x-default`

## Structured data — Rich Results Test (https://search.google.com/test/rich-results)

- [ ] Home — `LocalBusiness` valid
- [ ] Catalog — `ItemList` valid
- [ ] FAQ — `FAQPage` valid (only if ≥1 FAQ published)
- [ ] Any vehicle page — `Product` + `BreadcrumbList` valid
- [ ] About — `BreadcrumbList` valid

## OG preview

- [ ] Paste a vehicle URL into WhatsApp web chat → preview shows the vehicle's cover photo + title
- [ ] Paste the home URL → preview shows generic Otti Bull OG
- [ ] LinkedIn post-share preview likewise correct

## Search Console (after DNS verification)

- [ ] Property verified
- [ ] Sitemap submitted, status "Success"
- [ ] No critical errors in "Coverage"
- [ ] "International Targeting" → no hreflang errors
- [ ] After 24–48h: at least one URL shows as "Indexed" in URL Inspection

## Consent + Analytics

- [ ] Fresh incognito visit shows the consent banner
- [ ] Network tab: NO request to `googletagmanager.com` or `google-analytics.com` before clicking Accept
- [ ] Click Accept → `gtag/js?id=G-...` request fires
- [ ] GA4 Realtime shows the session within 30s
- [ ] Reload: banner does NOT reappear, GA loads immediately
- [ ] Click Reject (from a separate incognito): NO GA request, banner does NOT reappear

## Performance — Vercel Speed Insights

- [ ] Speed Insights dashboard receives data within 48h of first traffic
- [ ] Mobile LCP < 2.5s on home + a vehicle page (in dashboard, not just lab Lighthouse)
- [ ] Mobile INP < 200ms
- [ ] Mobile CLS < 0.1

## Off-site (owner)

- [ ] Google Business Profile created with full data (photos, hours, phone, link)
- [ ] At least 1 GBP review request sent using `docs/seo/review-request-templates.md`
