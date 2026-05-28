# SEO Baseline — captured 2026-MM-DD

Captured before the SEO foundation PR went live. Used to compare against month-2 and month-3 progress reports.

## Lighthouse mobile

| URL | Performance | Accessibility | Best Practices | SEO |
|---|---|---|---|---|
| /es | _fill_ | _fill_ | _fill_ | _fill_ |
| /es/catalog | _fill_ | _fill_ | _fill_ | _fill_ |
| /es/vehicles/{slug} | _fill_ | _fill_ | _fill_ | _fill_ |

## Google indexation (site: query)

`site:ottibull.com` → ~_fill_ results

## SERP positions (incognito, location: Barcelona)

| Query | Position |
|---|---|
| alquiler autocaravana Barcelona | _fill / not in top 100_ |
| alquiler camper Barcelona | _fill_ |
| lloguer autocaravana Barcelona | _fill_ |
| camper rental Barcelona | _fill_ |

## 90-day success criteria (from spec §4.4)

Compare these targets against measured state at day-90 post-deploy.

- [ ] ≥80% of published pages indexed (GSC Coverage report)
- [ ] ≥1 primary commercial query in position 11–20 (top 20)
- [ ] ≥10 daily search impressions for the domain (GSC Performance)
- [ ] GBP profile active with ≥3 reviews
- [ ] Mobile Core Web Vitals "Good" on home + a vehicle page:
  - LCP < 2.5s
  - INP < 200ms
  - CLS < 0.1

If criteria met → trigger Phase 2 planning (cornerstone, blog, marketplace). If not → diagnose before scaling content.
