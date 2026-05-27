# SEO Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship the technical SEO foundation for Otti Bull: root metadata + `metadataBase`, rich-result JSON-LD (`BreadcrumbList`, `ItemList`, `FAQPage`, per-vehicle OG), sitemap/robots refinement, consent-gated GA4 + Vercel Speed Insights, internal linking ("Vehículos similares"), and the copy retrofit deliverable docs.

**Architecture:** Modify existing pages/lib to add metadata, JSON-LD, and consent-gated analytics. Each new file has a single responsibility. Helpers stay in `src/lib/seo.ts`. UI building blocks (`ConsentBanner`, `GoogleAnalytics`, `VehicleSimilar`) go under `src/components/public/`. Copy retrofit lands as Markdown deliverables under `docs/seo/` so the owner can review before changes touch `messages/*.json`. No refactoring outside the SEO surface.

**Tech Stack:** Next.js 16 App Router, next-intl 4 (locales `es`/`ca`/`en`, default `es`, `localePrefix: "always"`), TypeScript, Tailwind 4, Drizzle ORM (Postgres in Docker), Vercel hobby. Tests: vitest (unit, node env) in `tests/unit/`, Playwright (e2e) in `tests/e2e/`.

## Pre-flight context

Notes for an engineer who hasn't been in this codebase:

- 3 locales, all routes under `src/app/[locale]`. Root `/` is rewritten by `src/proxy.ts` (next-intl middleware) to `/es`.
- `src/lib/seo.ts` already exports `localeAlternates()` and `organizationJsonLd()`. We **extend** these, never replace.
- Drizzle schemas in `src/db/schema.ts`, client in `src/db/client.ts`. Drizzle migrations exist; if DB queries fail with ECONNREFUSED, run `docker compose down && docker compose up -d postgres` and wait for `pg_isready`.
- Run unit tests: `npm test`. Run a single test: `npx vitest run tests/unit/lib/seo.test.ts`. Run E2E: `npm run test:e2e`.
- Commit style: conventional commits, e.g. `feat(seo): add BreadcrumbList helper`, `chore(seo): wire GA4 consent banner`.
- The base site URL comes from `process.env.NEXT_PUBLIC_SITE_URL`. In local dev it's `http://localhost:3000`.
- **Spec discoveries during plan writing:**
  - The Footer already wires Catalog and FAQ correctly (`src/components/public/Footer.tsx` lines 11–35). Spec §3.4 footer-wiring task is **not needed**. Only the "Vehículos similares" block survives from §3.4.
  - The spec's `metadataBase` claim that "may resolve incorrectly" is accurate — there is no `metadataBase` anywhere today.

---

## Phase 1 — Foundations (env, helpers, manifest)

### Task 1: Add SEO env variables to `.env.example`

**Files:**
- Modify: `.env.example`

- [ ] **Step 1: Inspect current `.env.example`**

Run: `cat .env.example`
Expected: see existing keys (`DATABASE_URL`, `AUTH_SECRET`, etc.)

- [ ] **Step 2: Append SEO env keys with comments**

Add at the bottom of `.env.example`:

```dotenv
# SEO — Google Search Console verification token (https://search.google.com/search-console)
# Domain property TXT verification, or the meta-tag content if owner chose URL-prefix property.
GOOGLE_SITE_VERIFICATION=""

# SEO — Google Analytics 4 measurement ID (format: G-XXXXXXXXXX). Required to enable GA4.
NEXT_PUBLIC_GA_MEASUREMENT_ID=""
```

- [ ] **Step 3: Commit**

```bash
git add .env.example
git commit -m "chore(seo): add GA4 + Search Console env keys to .env.example"
```

---

### Task 2: Add JSON-LD + metadataBase helpers to `src/lib/seo.ts` (TDD)

**Files:**
- Create: `tests/unit/lib/seo.test.ts`
- Modify: `src/lib/seo.ts`

- [ ] **Step 1: Write failing tests for the new helpers**

Create `tests/unit/lib/seo.test.ts`:

```typescript
import { describe, it, expect, beforeEach, vi } from "vitest";

const ORIGINAL_ENV = { ...process.env };
beforeEach(() => {
  process.env = { ...ORIGINAL_ENV, NEXT_PUBLIC_SITE_URL: "https://ottibull.com" };
});

describe("seo helpers", () => {
  it("siteBaseUrl returns NEXT_PUBLIC_SITE_URL when set", async () => {
    const { siteBaseUrl } = await import("@/lib/seo");
    expect(siteBaseUrl()).toBe("https://ottibull.com");
  });

  it("siteBaseUrl falls back to localhost:3000 when env missing", async () => {
    delete process.env.NEXT_PUBLIC_SITE_URL;
    vi.resetModules();
    const { siteBaseUrl } = await import("@/lib/seo");
    expect(siteBaseUrl()).toBe("http://localhost:3000");
  });

  it("breadcrumbJsonLd returns BreadcrumbList with positioned items", async () => {
    const { breadcrumbJsonLd } = await import("@/lib/seo");
    const ld = breadcrumbJsonLd([
      { name: "Inicio", url: "https://ottibull.com/es" },
      { name: "Catálogo", url: "https://ottibull.com/es/catalog" },
      { name: "Camper X", url: "https://ottibull.com/es/vehicles/camper-x" },
    ]);
    expect(ld["@context"]).toBe("https://schema.org");
    expect(ld["@type"]).toBe("BreadcrumbList");
    expect(ld.itemListElement).toHaveLength(3);
    expect(ld.itemListElement[0]).toEqual({
      "@type": "ListItem",
      position: 1,
      name: "Inicio",
      item: "https://ottibull.com/es",
    });
    expect(ld.itemListElement[2].position).toBe(3);
  });

  it("faqJsonLd returns FAQPage with each Q/A as Question + Answer", async () => {
    const { faqJsonLd } = await import("@/lib/seo");
    const ld = faqJsonLd([
      { question: "¿Cuánto cuesta?", answer: "Desde 80 €/día." },
      { question: "¿Seguro incluido?", answer: "Sí, a todo riesgo." },
    ]);
    expect(ld["@type"]).toBe("FAQPage");
    expect(ld.mainEntity).toHaveLength(2);
    expect(ld.mainEntity[0]).toEqual({
      "@type": "Question",
      name: "¿Cuánto cuesta?",
      acceptedAnswer: { "@type": "Answer", text: "Desde 80 €/día." },
    });
  });

  it("itemListJsonLd returns ItemList with positioned entries", async () => {
    const { itemListJsonLd } = await import("@/lib/seo");
    const ld = itemListJsonLd([
      { name: "Camper A", url: "https://ottibull.com/es/vehicles/a", image: "https://x/a.jpg" },
      { name: "Camper B", url: "https://ottibull.com/es/vehicles/b" },
    ]);
    expect(ld["@type"]).toBe("ItemList");
    expect(ld.itemListElement[0]).toEqual({
      "@type": "ListItem",
      position: 1,
      name: "Camper A",
      url: "https://ottibull.com/es/vehicles/a",
      image: "https://x/a.jpg",
    });
    expect(ld.itemListElement[1]).not.toHaveProperty("image");
  });

  it("organizationJsonLd carries @id, areaServed, geo and priceRange", async () => {
    const { organizationJsonLd } = await import("@/lib/seo");
    const ld = organizationJsonLd();
    expect(ld["@id"]).toBe("https://ottibull.com/#organization");
    expect(ld.areaServed).toEqual({ "@type": "Country", name: "Spain" });
    expect(ld.priceRange).toBe("€€");
    expect(ld.geo).toEqual({
      "@type": "GeoCoordinates",
      latitude: 41.3826,
      longitude: 2.1429,
    });
    expect(ld.image).toBe("https://ottibull.com/logo-ottibull.svg");
  });
});
```

- [ ] **Step 2: Run tests to confirm they fail**

Run: `npx vitest run tests/unit/lib/seo.test.ts`
Expected: 5 failures (helpers don't exist yet or fields missing).

- [ ] **Step 3: Implement helpers in `src/lib/seo.ts`**

Replace the existing file with:

```typescript
import type { Metadata } from "next";
import { routing } from "@/i18n/routing";

export function siteBaseUrl(): string {
  return process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
}

const BASE = siteBaseUrl();

function pathWithoutLocale(path: string): string {
  return path.replace(/^\/[a-z]{2}(?=\/|$)/, "");
}

export function localeAlternates(currentLocalePath: string): Metadata["alternates"] {
  const tail = pathWithoutLocale(currentLocalePath);
  return {
    canonical: `${BASE}${currentLocalePath}`,
    languages: {
      ...Object.fromEntries(routing.locales.map((l) => [l, `${BASE}/${l}${tail}`])),
      "x-default": `${BASE}/${routing.defaultLocale}${tail}`,
    },
  };
}

export type JsonLd = Record<string, unknown>;

export function organizationJsonLd(): JsonLd {
  const base = siteBaseUrl();
  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": `${base}/#organization`,
    name: "Otti Bull",
    legalName: "Otti Bull SL",
    url: base,
    logo: `${base}/logo-ottibull.svg`,
    image: `${base}/logo-ottibull.svg`,
    priceRange: "€€",
    address: {
      "@type": "PostalAddress",
      streetAddress: "C/ L'Alfambra, 14, P.4 Pta.2",
      addressLocality: "Barcelona",
      postalCode: "08034",
      addressCountry: "ES",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: 41.3826,
      longitude: 2.1429,
    },
    areaServed: { "@type": "Country", name: "Spain" },
    email: process.env.OWNER_EMAIL ?? "info@ottibull.com",
    telephone: "+34 691 82 02 42",
    sameAs: [],
  };
}

export function breadcrumbJsonLd(
  items: { name: string; url: string }[],
): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

export function faqJsonLd(
  faqs: { question: string; answer: string }[],
): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: { "@type": "Answer", text: f.answer },
    })),
  };
}

export function itemListJsonLd(
  items: { name: string; url: string; image?: string }[],
): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: items.map((item, i) => {
      const entry: JsonLd = {
        "@type": "ListItem",
        position: i + 1,
        name: item.name,
        url: item.url,
      };
      if (item.image) entry.image = item.image;
      return entry;
    }),
  };
}
```

- [ ] **Step 4: Re-run tests, confirm green**

Run: `npx vitest run tests/unit/lib/seo.test.ts`
Expected: 5 pass.

- [ ] **Step 5: Run typecheck**

Run: `npm run typecheck`
Expected: clean.

- [ ] **Step 6: Commit**

```bash
git add src/lib/seo.ts tests/unit/lib/seo.test.ts
git commit -m "feat(seo): add metadataBase + JSON-LD helpers (breadcrumb/itemList/faq) with tests"
```

---

### Task 3: Add PWA manifest at `src/app/manifest.ts`

**Files:**
- Create: `src/app/manifest.ts`

- [ ] **Step 1: Create the manifest**

```typescript
import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Otti Bull",
    short_name: "Otti Bull",
    description: "Alquiler de Autocaravanas Premium en Barcelona",
    start_url: "/",
    display: "standalone",
    background_color: "#fbf8f1",
    theme_color: "#1b3527",
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
      },
    ],
  };
}
```

- [ ] **Step 2: Verify**

Run: `curl -s http://localhost:3000/manifest.webmanifest | python3 -m json.tool | head -10`
Expected: well-formed JSON with `name`, `short_name`, `theme_color`.

(Dev server must be running. If not: `npm run dev` in a separate terminal.)

- [ ] **Step 3: Commit**

```bash
git add src/app/manifest.ts
git commit -m "feat(seo): add PWA manifest"
```

---

## Phase 2 — Root metadata wiring

### Task 4: Root metadata in `[locale]/layout.tsx`

**Files:**
- Modify: `src/app/[locale]/layout.tsx`

- [ ] **Step 1: Read current layout to preserve structure**

Run: `cat src/app/[locale]/layout.tsx | head -75`
Expected: existing layout with `Header`, `Footer`, `organizationJsonLd` script tag.

- [ ] **Step 2: Add root metadata exports**

Add **above** `export function generateStaticParams()`:

```typescript
import type { Metadata } from "next";
import { siteBaseUrl } from "@/lib/seo";

export const metadata: Metadata = {
  metadataBase: new URL(siteBaseUrl()),
  title: {
    default: "Otti Bull",
    template: "%s · Otti Bull",
  },
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-snippet": -1,
      "max-image-preview": "large",
      "max-video-preview": -1,
    },
  },
  twitter: {
    card: "summary_large_image",
  },
  manifest: "/manifest.webmanifest",
};
```

Note: `import type { Metadata }` is the first new import — place it grouped with the other `import type` lines at the top of the file. Use a single `import { siteBaseUrl } from "@/lib/seo";` line near the existing `organizationJsonLd` import (you may merge them: `import { organizationJsonLd, siteBaseUrl } from "@/lib/seo";`).

- [ ] **Step 3: Verify typecheck + build**

Run: `npm run typecheck`
Expected: clean.

- [ ] **Step 4: Verify rendered HTML has verification meta + canonical**

Set `GOOGLE_SITE_VERIFICATION=test-token-xyz` in `.env.local`, restart dev server, then:

Run: `curl -s http://localhost:3000/es | grep -E "google-site-verification|metadataBase" | head -3`
Expected: `<meta name="google-site-verification" content="test-token-xyz">` present.

After verification, remove or empty the test token from `.env.local` — production token is owner-provided.

- [ ] **Step 5: Commit**

```bash
git add src/app/[locale]/layout.tsx
git commit -m "feat(seo): wire root metadata (metadataBase, verification, robots, twitter, manifest)"
```

---

## Phase 3 — Per-page JSON-LD + breadcrumbs

### Task 5: BreadcrumbList on `/vehicles/[slug]`

**Files:**
- Modify: `src/app/[locale]/vehicles/[slug]/page.tsx`

- [ ] **Step 1: Read current page**

Run: `sed -n '1,30p;95,130p' src/app/[locale]/vehicles/[slug]/page.tsx`
Expected: file structure with existing `jsonLd` (Product) at ~line 100, rendered via `<script type="application/ld+json">`.

- [ ] **Step 2: Add breadcrumb alongside Product JSON-LD**

In the existing `jsonLd` block, change the script tag rendering into a fragment that emits two scripts. Replace the existing block:

```typescript
const productJsonLd = {
  "@context": "https://schema.org",
  "@type": "Product",
  name: tr.title,
  description: tr.description,
  image: v.images.map((i) => i.url),
  brand: { "@type": "Brand", name: "Otti Bull" },
  offers: {
    "@type": "Offer",
    price: v.basePricePerDay,
    priceCurrency: "EUR",
    availability: "https://schema.org/InStock",
    url: `${siteBaseUrl()}/${locale}/vehicles/${slug}`,
  },
};

const tNav = await getTranslations({ locale, namespace: "nav" });
const breadcrumb = breadcrumbJsonLd([
  { name: tNav("home"), url: `${siteBaseUrl()}/${locale}` },
  { name: tNav("catalog"), url: `${siteBaseUrl()}/${locale}/catalog` },
  { name: tr.title, url: `${siteBaseUrl()}/${locale}/vehicles/${slug}` },
]);
```

Then render both:

```tsx
<script
  type="application/ld+json"
  dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
/>
<script
  type="application/ld+json"
  dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }}
/>
```

Add imports at the top of the file:

```typescript
import { breadcrumbJsonLd, siteBaseUrl } from "@/lib/seo";
```

Remove the inline `process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"` literal (line ~112) and use `siteBaseUrl()` instead.

- [ ] **Step 3: Verify in dev**

With a published vehicle in the DB and dev server running:

Run: `curl -s http://localhost:3000/es/vehicles/$(docker exec ottibull-postgres psql -U ottibull -d ottibull -t -c "select slug from vehicles where status='published' limit 1;" | tr -d ' ') | grep -oE '"@type":"BreadcrumbList"|"@type":"Product"' | sort -u`

Expected: both `"@type":"BreadcrumbList"` and `"@type":"Product"` lines.

- [ ] **Step 4: Commit**

```bash
git add src/app/[locale]/vehicles/[slug]/page.tsx
git commit -m "feat(seo): add BreadcrumbList JSON-LD on vehicle pages"
```

---

### Task 6: BreadcrumbList on `/about`

**Files:**
- Modify: `src/app/[locale]/about/page.tsx`

- [ ] **Step 1: Inspect file**

Run: `head -40 src/app/[locale]/about/page.tsx`

- [ ] **Step 2: Add breadcrumb in the page body**

After the imports add:

```typescript
import { breadcrumbJsonLd, siteBaseUrl } from "@/lib/seo";
import { getTranslations } from "next-intl/server";
```

(merge with existing `next-intl/server` import if present.)

In the page component, right after `setRequestLocale(locale)`, add:

```typescript
const tNav = await getTranslations({ locale, namespace: "nav" });
const breadcrumb = breadcrumbJsonLd([
  { name: tNav("home"), url: `${siteBaseUrl()}/${locale}` },
  { name: tNav("about"), url: `${siteBaseUrl()}/${locale}/about` },
]);
```

In the JSX return, immediately after the opening tag (before any other markup), render:

```tsx
<script
  type="application/ld+json"
  dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }}
/>
```

- [ ] **Step 3: Verify**

Run: `curl -s http://localhost:3000/es/about | grep -oE '"@type":"BreadcrumbList"'`
Expected: one match.

- [ ] **Step 4: Commit**

```bash
git add src/app/[locale]/about/page.tsx
git commit -m "feat(seo): add BreadcrumbList JSON-LD on about page"
```

---

### Task 7: BreadcrumbList on `/useful-links`

**Files:**
- Modify: `src/app/[locale]/useful-links/page.tsx`

- [ ] **Step 1: Inspect file**

Run: `head -40 src/app/[locale]/useful-links/page.tsx`

- [ ] **Step 2: Add breadcrumb (same pattern as Task 6)**

Imports:
```typescript
import { breadcrumbJsonLd, siteBaseUrl } from "@/lib/seo";
import { getTranslations } from "next-intl/server";
```

In component, after `setRequestLocale(locale)`:
```typescript
const tNav = await getTranslations({ locale, namespace: "nav" });
const breadcrumb = breadcrumbJsonLd([
  { name: tNav("home"), url: `${siteBaseUrl()}/${locale}` },
  { name: tNav("usefulLinks"), url: `${siteBaseUrl()}/${locale}/useful-links` },
]);
```

JSX (top of return):
```tsx
<script
  type="application/ld+json"
  dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }}
/>
```

- [ ] **Step 3: Verify**

Run: `curl -s http://localhost:3000/es/useful-links | grep -oE '"@type":"BreadcrumbList"'`
Expected: one match.

- [ ] **Step 4: Commit**

```bash
git add src/app/[locale]/useful-links/page.tsx
git commit -m "feat(seo): add BreadcrumbList JSON-LD on useful-links page"
```

---

### Task 8: ItemList JSON-LD + BreadcrumbList on `/catalog`

**Files:**
- Modify: `src/app/[locale]/catalog/page.tsx`

- [ ] **Step 1: Inspect file**

Run: `head -60 src/app/[locale]/catalog/page.tsx`

- [ ] **Step 2: Add JSON-LD generation in page body**

Imports:
```typescript
import { breadcrumbJsonLd, itemListJsonLd, siteBaseUrl } from "@/lib/seo";
import { getTranslations } from "next-intl/server";
```

After `setRequestLocale(locale)` and after the `vehicles` are loaded from DB (find the existing `db.query.vehicles.findMany` call), build:

```typescript
const tNav = await getTranslations({ locale, namespace: "nav" });
const breadcrumb = breadcrumbJsonLd([
  { name: tNav("home"), url: `${siteBaseUrl()}/${locale}` },
  { name: tNav("catalog"), url: `${siteBaseUrl()}/${locale}/catalog` },
]);
const itemList = itemListJsonLd(
  vehicles.map((v) => {
    const tr = v.translations.find((t) => t.locale === locale) ?? v.translations[0];
    const cover = v.images.find((i) => i.isCover) ?? v.images[0];
    return {
      name: tr?.title ?? v.slug,
      url: `${siteBaseUrl()}/${locale}/vehicles/${v.slug}`,
      image: cover?.url,
    };
  }),
);
```

(If the existing variable holding the published vehicles is not called `vehicles`, use whatever the file uses.)

JSX, top of return:
```tsx
<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />
<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemList) }} />
```

- [ ] **Step 3: Verify**

Run: `curl -s http://localhost:3000/es/catalog | grep -oE '"@type":"(BreadcrumbList|ItemList)"' | sort -u`
Expected: both `"@type":"BreadcrumbList"` and `"@type":"ItemList"`.

- [ ] **Step 4: Commit**

```bash
git add src/app/[locale]/catalog/page.tsx
git commit -m "feat(seo): add ItemList + BreadcrumbList JSON-LD on catalog page"
```

---

### Task 9: FAQPage JSON-LD + BreadcrumbList on `/faq`

**Files:**
- Modify: `src/app/[locale]/faq/page.tsx`

- [ ] **Step 1: Inspect file**

Run: `head -80 src/app/[locale]/faq/page.tsx`

- [ ] **Step 2: Identify FAQ data shape**

Run: `grep -n "faq_translations\|faqTranslations\|question\|answer" src/db/schema.ts | head -20`

Confirm: FAQs live in `faqs` with related `faq_translations` (per-locale question + answer). The page already loads them — use what's there.

- [ ] **Step 3: Add JSON-LD**

Imports:
```typescript
import { breadcrumbJsonLd, faqJsonLd, siteBaseUrl } from "@/lib/seo";
import { getTranslations } from "next-intl/server";
```

After FAQs are loaded for the locale, build:

```typescript
const tNav = await getTranslations({ locale, namespace: "nav" });
const breadcrumb = breadcrumbJsonLd([
  { name: tNav("home"), url: `${siteBaseUrl()}/${locale}` },
  { name: tNav("faq"), url: `${siteBaseUrl()}/${locale}/faq` },
]);
const faqLd = faqJsonLd(
  faqs.map((f) => {
    const tr = f.translations.find((t) => t.locale === locale) ?? f.translations[0];
    return {
      question: tr?.question ?? "",
      answer: tr?.answer ?? "",
    };
  }).filter((f) => f.question && f.answer),
);
```

(Field names match whatever the schema uses — adjust `question`/`answer` if the schema uses different names.)

JSX, top of return:
```tsx
<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />
{faqLd.mainEntity && (faqLd.mainEntity as unknown[]).length > 0 && (
  <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />
)}
```

(Skip FAQPage emission when zero published FAQs — Google flags empty FAQ schema.)

- [ ] **Step 4: Verify**

Run: `curl -s http://localhost:3000/es/faq | grep -oE '"@type":"(BreadcrumbList|FAQPage)"' | sort -u`
Expected: both.

- [ ] **Step 5: Commit**

```bash
git add src/app/[locale]/faq/page.tsx
git commit -m "feat(seo): add FAQPage + BreadcrumbList JSON-LD on faq page"
```

---

## Phase 4 — Per-vehicle Open Graph image

### Task 10: Dynamic OG image for `/vehicles/[slug]`

**Files:**
- Create: `src/app/[locale]/vehicles/[slug]/opengraph-image.tsx`

- [ ] **Step 1: Create the OG handler**

```typescript
import { ImageResponse } from "next/og";
import { eq, and } from "drizzle-orm";
import { db } from "@/db/client";
import { vehicles } from "@/db/schema";

export const alt = "Otti Bull";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OG({
  params,
}: {
  params: { locale: string; slug: string };
}) {
  const v = await db.query.vehicles.findFirst({
    where: and(eq(vehicles.slug, params.slug), eq(vehicles.status, "published")),
    with: { translations: true, images: true },
  });

  const tr =
    v?.translations.find((t) => t.locale === params.locale) ??
    v?.translations.find((t) => t.locale === "es") ??
    v?.translations[0];
  const cover = v?.images.find((i) => i.isCover) ?? v?.images[0];
  const title = tr?.title ?? "Otti Bull";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          background: "#1b3527",
          color: "#fbf8f1",
          fontFamily: "Georgia, serif",
        }}
      >
        {cover && (
          <img
            src={cover.url}
            alt=""
            width={700}
            height={630}
            style={{ width: 700, height: 630, objectFit: "cover" }}
          />
        )}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            padding: 60,
          }}
        >
          <div style={{ fontSize: 28, opacity: 0.7, marginBottom: 12 }}>Otti Bull</div>
          <div style={{ fontSize: 56, fontWeight: 400, lineHeight: 1.1 }}>{title}</div>
        </div>
      </div>
    ),
    size,
  );
}
```

- [ ] **Step 2: Verify the route returns a PNG**

With dev server + DB running, find a published slug:

```bash
SLUG=$(docker exec ottibull-postgres psql -U ottibull -d ottibull -t -c "select slug from vehicles where status='published' limit 1;" | tr -d ' ')
echo "Testing slug: $SLUG"
curl -sI "http://localhost:3000/es/vehicles/$SLUG/opengraph-image" | head -5
```

Expected: `HTTP/1.1 200 OK` and `Content-Type: image/png`.

- [ ] **Step 3: Spot-check the image visually**

```bash
curl -s "http://localhost:3000/es/vehicles/$SLUG/opengraph-image" -o /tmp/og-test.png
open /tmp/og-test.png
```

Expected: 1200×630 image with vehicle cover on the left half and vehicle title on the right.

- [ ] **Step 4: Commit**

```bash
git add src/app/[locale]/vehicles/[slug]/opengraph-image.tsx
git commit -m "feat(seo): dynamic per-vehicle Open Graph image"
```

---

## Phase 5 — Sitemap + robots refinement

### Task 11: Sitemap priority and lastModified refinement

**Files:**
- Modify: `src/app/sitemap.ts`

- [ ] **Step 1: Open file, locate the STATIC_PATHS loop**

Run: `cat src/app/sitemap.ts`

- [ ] **Step 2: Compute baseline `lastModified` and adjust per-locale priority**

Replace the entire `default async function sitemap()` body with:

```typescript
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const published = await db.query.vehicles.findMany({
    where: eq(vehicles.status, "published"),
    columns: { slug: true, updatedAt: true },
  });

  const [faqMaxRow] = await db
    .select({ value: max(faqs.updatedAt) })
    .from(faqs)
    .where(eq(faqs.status, "published"));
  const faqLastMod = faqMaxRow?.value ?? undefined;

  const vehicleMax = published.reduce<Date | undefined>(
    (acc, v) => (v.updatedAt && (!acc || v.updatedAt > acc) ? v.updatedAt : acc),
    undefined,
  );
  const homeLastMod = [faqLastMod, vehicleMax].filter(Boolean).sort().pop();

  const entries: MetadataRoute.Sitemap = [];

  for (const { path, changeFreq, priority } of STATIC_PATHS) {
    for (const locale of routing.locales) {
      const isDefaultLocale = locale === routing.defaultLocale;
      const effectivePriority =
        path === "" ? (isDefaultLocale ? 1.0 : 0.9) : priority;
      const effectiveLastMod =
        path === "" ? homeLastMod :
        path === "/faq" ? faqLastMod :
        undefined;
      entries.push({
        url: `${BASE}/${locale}${path}`,
        changeFrequency: changeFreq,
        priority: effectivePriority,
        lastModified: effectiveLastMod,
        alternates: { languages: localeAlternates(path) },
      });
    }
  }

  for (const v of published) {
    for (const locale of routing.locales) {
      entries.push({
        url: `${BASE}/${locale}/vehicles/${v.slug}`,
        lastModified: v.updatedAt,
        changeFrequency: "weekly",
        priority: 0.8,
        alternates: { languages: localeAlternates(`/vehicles/${v.slug}`) },
      });
    }
  }

  return entries;
}
```

- [ ] **Step 3: Verify the sitemap renders**

Run: `curl -s http://localhost:3000/sitemap.xml | head -30`
Expected: XML with `<urlset>`, multiple `<url>` entries, priority `1.0` on `/es` URL, `0.9` on `/ca` and `/en` homepages.

- [ ] **Step 4: Commit**

```bash
git add src/app/sitemap.ts
git commit -m "chore(seo): refine sitemap priority and homepage lastModified"
```

---

### Task 12: Tighten `robots.ts` disallow list

**Files:**
- Modify: `src/app/robots.ts`

- [ ] **Step 1: Update file**

Replace the file content with:

```typescript
import type { MetadataRoute } from "next";
import { siteBaseUrl } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  const base = siteBaseUrl();
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin/", "/admin/login", "/api/", "/thank-you"],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
    host: base,
  };
}
```

- [ ] **Step 2: Verify**

Run: `curl -s http://localhost:3000/robots.txt`
Expected output:
```
User-Agent: *
Allow: /
Disallow: /admin/
Disallow: /admin/login
Disallow: /api/
Disallow: /thank-you

Host: http://localhost:3000
Sitemap: http://localhost:3000/sitemap.xml
```

- [ ] **Step 3: Commit**

```bash
git add src/app/robots.ts
git commit -m "chore(seo): tighten robots.txt disallow list and add Host directive"
```

---

## Phase 6 — Internal linking: Vehículos similares

### Task 13: `VehicleSimilar` component

**Files:**
- Create: `src/components/public/VehicleSimilar.tsx`

- [ ] **Step 1: Inspect VehicleCard interface to ensure compatibility**

Run: `head -30 src/components/public/VehicleCard.tsx`

Note the `VehicleCardData` exported shape (already used by `HomeFeaturedFleet` and catalog).

- [ ] **Step 2: Create the component**

```typescript
import { useTranslations } from "next-intl";
import type { Locale } from "@/i18n/routing";
import { Container } from "./Container";
import { SectionHeading } from "./SectionHeading";
import { VehicleCard, type VehicleCardData } from "./VehicleCard";

export function VehicleSimilar({
  locale,
  vehicles,
}: {
  locale: Locale;
  vehicles: VehicleCardData[];
}) {
  const t = useTranslations("vehicle");
  if (vehicles.length === 0) return null;

  return (
    <section className="py-16 md:py-24" style={{ background: "var(--bg-page)" }}>
      <Container>
        <SectionHeading title={t("similarTitle")} subtitle={t("similarSubtitle")} />
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {vehicles.map((v) => (
            <VehicleCard key={v.id} locale={locale} vehicle={v} />
          ))}
        </div>
      </Container>
    </section>
  );
}
```

- [ ] **Step 3: Add the i18n keys**

In **each** of `src/messages/{es,ca,en}.json`, find the existing `"vehicle"` namespace and add `similarTitle` and `similarSubtitle`:

`es.json`:
```json
"vehicle": {
  "fromPrice": "desde {price} €/día",
  "minDays": "Mínimo {days} días",
  "location": "Ubicación",
  "requestQuote": "Solicitar presupuesto",
  "similarTitle": "Vehículos similares",
  "similarSubtitle": "Otras opciones que podrían interesarte"
}
```

`ca.json`:
```json
"vehicle": {
  "fromPrice": "des de {price} €/dia",
  "minDays": "Mínim {days} dies",
  "location": "Ubicació",
  "requestQuote": "Sol·licitar pressupost",
  "similarTitle": "Vehicles similars",
  "similarSubtitle": "Altres opcions que et podrien interessar"
}
```

`en.json`:
```json
"vehicle": {
  "fromPrice": "from {price} €/day",
  "minDays": "Minimum {days} days",
  "location": "Location",
  "requestQuote": "Request a quote",
  "similarTitle": "Similar vehicles",
  "similarSubtitle": "Other options you might like"
}
```

- [ ] **Step 4: Typecheck**

Run: `npm run typecheck`
Expected: clean.

- [ ] **Step 5: Commit**

```bash
git add src/components/public/VehicleSimilar.tsx src/messages/
git commit -m "feat(public): VehicleSimilar component + i18n keys"
```

---

### Task 14: Wire `VehicleSimilar` into the vehicle page

**Files:**
- Modify: `src/app/[locale]/vehicles/[slug]/page.tsx`

- [ ] **Step 1: Add the query for similar vehicles**

After loading the current vehicle (`const v = await db.query.vehicles.findFirst(...)`), and after the `notFound()` guard, add:

```typescript
const similarRows = await db.query.vehicles.findMany({
  where: and(
    eq(vehicles.status, "published"),
    eq(vehicles.type, v.type),
    ne(vehicles.id, v.id),
  ),
  with: { translations: true, images: true },
  orderBy: [desc(vehicles.sortOrder), desc(vehicles.createdAt)],
  limit: 3,
});

const similar: VehicleCardData[] = similarRows.map((row) => ({
  id: row.id,
  slug: row.slug,
  type: row.type,
  basePricePerDay: row.basePricePerDay,
  location: row.location,
  attributes: (row.attributes ?? {}) as Record<string, unknown>,
  translations: row.translations.map((t) => ({ locale: t.locale, title: t.title })),
  images: row.images.map((img) => ({
    url: img.url,
    altText: img.altText,
    isCover: img.isCover,
  })),
}));
```

Add the needed imports:

```typescript
import { ne, desc } from "drizzle-orm";   // ne is not currently imported; merge with existing drizzle-orm import
import { VehicleSimilar } from "@/components/public/VehicleSimilar";
import type { VehicleCardData } from "@/components/public/VehicleCard";
```

- [ ] **Step 2: Render `<VehicleSimilar />` at the bottom of the page**

Inside the page's JSX `<article>`, after the existing `<Container>` content (right before the closing `</article>`), insert:

```tsx
<VehicleSimilar locale={locale as Locale} vehicles={similar} />
```

(Use the existing `Locale` type from `@/i18n/routing` — it's already imported.)

- [ ] **Step 3: Verify**

With at least 2 published vehicles of the same `type` in the DB:

```bash
SLUG=$(docker exec ottibull-postgres psql -U ottibull -d ottibull -t -c "select slug from vehicles where status='published' limit 1;" | tr -d ' ')
curl -s "http://localhost:3000/es/vehicles/$SLUG" | grep -c "Vehículos similares"
```

Expected: ≥1 if the section heading renders. If only 1 vehicle is published the component returns `null` and the heading won't appear — that's correct fallback behavior.

- [ ] **Step 4: Commit**

```bash
git add src/app/[locale]/vehicles/[slug]/page.tsx
git commit -m "feat(public): show similar vehicles section on vehicle page"
```

---

## Phase 7 — Consent banner + GA4 + Speed Insights

### Task 15: Add consent banner i18n keys

**Files:**
- Modify: `src/messages/es.json`, `src/messages/ca.json`, `src/messages/en.json`

- [ ] **Step 1: Append `cookieConsent` namespace to each locale**

To `es.json` (top-level, alongside other namespaces like `home`, `nav`):
```json
"cookieConsent": {
  "title": "Utilizamos cookies",
  "body": "Usamos cookies de análisis (Google Analytics) para entender cómo se navega el sitio y mejorarlo. Solo se cargan si las aceptas.",
  "accept": "Aceptar",
  "reject": "Rechazar",
  "privacyLink": "Política de cookies"
}
```

To `ca.json`:
```json
"cookieConsent": {
  "title": "Utilitzem cookies",
  "body": "Utilitzem cookies d'anàlisi (Google Analytics) per entendre com es navega el lloc i millorar-lo. Només es carreguen si les acceptes.",
  "accept": "Acceptar",
  "reject": "Rebutjar",
  "privacyLink": "Política de galetes"
}
```

To `en.json`:
```json
"cookieConsent": {
  "title": "We use cookies",
  "body": "We use analytics cookies (Google Analytics) to understand how the site is used and improve it. They only load if you accept.",
  "accept": "Accept",
  "reject": "Reject",
  "privacyLink": "Cookie policy"
}
```

- [ ] **Step 2: Commit**

```bash
git add src/messages/
git commit -m "feat(i18n): consent banner translations"
```

---

### Task 16: `ConsentBanner` component

**Files:**
- Create: `src/components/public/ConsentBanner.tsx`

- [ ] **Step 1: Create the component**

```tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import type { Locale } from "@/i18n/routing";

const STORAGE_KEY = "ottibull-cookie-consent-v1";

type ConsentValue = "granted" | "denied";

function setGtagConsent(value: ConsentValue) {
  if (typeof window === "undefined") return;
  // Consent Mode v2 — both signals required for GA4
  window.dataLayer = window.dataLayer || [];
  function gtag(...args: unknown[]) {
    window.dataLayer.push(args);
  }
  gtag("consent", "update", {
    analytics_storage: value,
    ad_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied",
  });
}

export function ConsentBanner({ locale }: { locale: Locale }) {
  const t = useTranslations("cookieConsent");
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === null) {
      setVisible(true);
    } else if (stored === "granted") {
      setGtagConsent("granted");
    }
  }, []);

  if (!visible) return null;

  const decide = (value: ConsentValue) => {
    localStorage.setItem(STORAGE_KEY, value);
    setGtagConsent(value);
    setVisible(false);
  };

  return (
    <div
      role="dialog"
      aria-live="polite"
      aria-label={t("title")}
      className="fixed bottom-4 right-4 left-4 z-50 max-w-md rounded-[var(--radius-lg)] p-5 shadow-[var(--shadow-lg)] sm:left-auto sm:bottom-6 sm:right-6"
      style={{ background: "var(--bg-elevated)", border: "1px solid var(--border-default)" }}
    >
      <h2 className="text-base font-semibold" style={{ color: "var(--fg-1)" }}>
        {t("title")}
      </h2>
      <p className="mt-2 text-sm" style={{ color: "var(--fg-3)" }}>
        {t("body")}{" "}
        <Link href={`/${locale}/cookies`} className="underline">
          {t("privacyLink")}
        </Link>
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => decide("granted")}
          className="rounded-[var(--radius-md)] px-4 py-2 text-sm font-semibold"
          style={{ background: "var(--brand)", color: "var(--fg-on-dark)" }}
        >
          {t("accept")}
        </button>
        <button
          type="button"
          onClick={() => decide("denied")}
          className="rounded-[var(--radius-md)] px-4 py-2 text-sm font-semibold"
          style={{
            background: "transparent",
            color: "var(--fg-2)",
            border: "1px solid var(--border-default)",
          }}
        >
          {t("reject")}
        </button>
      </div>
    </div>
  );
}

declare global {
  interface Window {
    dataLayer: unknown[];
  }
}
```

- [ ] **Step 2: Typecheck**

Run: `npm run typecheck`
Expected: clean.

- [ ] **Step 3: Commit**

```bash
git add src/components/public/ConsentBanner.tsx
git commit -m "feat(public): cookie consent banner with Consent Mode v2 wiring"
```

---

### Task 17: `GoogleAnalytics` component (gtag.js with default-denied consent)

**Files:**
- Create: `src/components/public/GoogleAnalytics.tsx`

- [ ] **Step 1: Create the component**

```tsx
import Script from "next/script";

export function GoogleAnalytics() {
  const id = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
  if (!id) return null;

  return (
    <>
      <Script
        id="ga-bootstrap"
        strategy="beforeInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('consent', 'default', {
              analytics_storage: 'denied',
              ad_storage: 'denied',
              ad_user_data: 'denied',
              ad_personalization: 'denied',
              wait_for_update: 500,
            });
          `,
        }}
      />
      <Script
        id="ga-gtag"
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${id}`}
      />
      <Script
        id="ga-init"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            gtag('js', new Date());
            gtag('config', '${id}', { anonymize_ip: true });
          `,
        }}
      />
    </>
  );
}
```

- [ ] **Step 2: Confirm `Script` accepts strategy + dangerouslySetInnerHTML in Next 16**

Run: `grep -A2 "beforeInteractive\|afterInteractive" node_modules/next/dist/client/script.d.ts | head -8`
Expected: strategy union including `beforeInteractive` and `afterInteractive`.

If Next 16 has changed the `next/script` shape, fall back to plain `<script>` tags wrapped in a `"use client"` component with the same content.

- [ ] **Step 3: Commit**

```bash
git add src/components/public/GoogleAnalytics.tsx
git commit -m "feat(public): GA4 loader with Consent Mode v2 default-denied"
```

---

### Task 18: Install Vercel Speed Insights

**Files:**
- Modify: `package.json`, `package-lock.json` (or `pnpm-lock.yaml`)

- [ ] **Step 1: Install the package**

Run: `npm install @vercel/speed-insights`
Expected: `@vercel/speed-insights` appears under dependencies in `package.json`.

- [ ] **Step 2: Verify import resolves**

Run: `node -e "console.log(require.resolve('@vercel/speed-insights/next'))"`
Expected: a resolved path under `node_modules`.

- [ ] **Step 3: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore(seo): install @vercel/speed-insights for Core Web Vitals tracking"
```

---

### Task 19: Mount banner + GA + Speed Insights in `[locale]/layout.tsx`

**Files:**
- Modify: `src/app/[locale]/layout.tsx`

- [ ] **Step 1: Add imports**

Top of file (merge with existing imports where possible):

```typescript
import { SpeedInsights } from "@vercel/speed-insights/next";
import { ConsentBanner } from "@/components/public/ConsentBanner";
import { GoogleAnalytics } from "@/components/public/GoogleAnalytics";
```

- [ ] **Step 2: Render them in the layout**

Inside `<NextIntlClientProvider>`, after `<Footer />`, add:

```tsx
<ConsentBanner locale={locale as Locale} />
<GoogleAnalytics />
<SpeedInsights />
```

- [ ] **Step 3: Smoke test in dev**

With `NEXT_PUBLIC_GA_MEASUREMENT_ID="G-TEST"` set in `.env.local` and a fresh `npm run dev`:

```bash
curl -s http://localhost:3000/es | grep -oE 'googletagmanager.com/gtag/js' | head -1
```

Expected: one match.

Open `http://localhost:3000/es` in a fresh incognito window. Expected:
- Banner appears bottom-right
- Open DevTools → Network. Filter for `google`. There should be NO `gtag/js` request before clicking Accept.
- After clicking Accept: `gtag/js` and `collect?v=2&...` requests appear.
- Reload the page. Banner does NOT reappear. `gtag/js` loads immediately.

After verification, set `NEXT_PUBLIC_GA_MEASUREMENT_ID=""` again locally (production token is owner-provided).

- [ ] **Step 4: Commit**

```bash
git add src/app/[locale]/layout.tsx
git commit -m "feat(seo): mount consent banner, GA4 and Speed Insights in locale layout"
```

---

## Phase 8 — Core Web Vitals pass

### Task 20: Audit hero LCP and image `sizes`

**Files:**
- Modify: `src/components/public/HomeHero.tsx` (if hero image isn't already optimized)
- Modify: `src/components/public/VehicleGallery.tsx` (if gallery cover doesn't use `priority` on cover)

- [ ] **Step 1: Inspect the hero**

Run: `cat src/components/public/HomeHero.tsx`

Check whether the first hero `<Image>` has:
- `priority` ✓
- `fetchPriority="high"` ✓
- `sizes="100vw"` (full-bleed hero) or a realistic value ✓
- Subsequent hero slides should NOT have `priority`.

- [ ] **Step 2: Fix any missing attributes**

If the first hero image is missing `priority` or `fetchPriority="high"`, add them. Subsequent images: ensure they have neither, only the first.

- [ ] **Step 3: Inspect VehicleGallery cover**

Run: `cat src/components/public/VehicleGallery.tsx`

Check the cover image (the large one above the fold on `/vehicles/[slug]`):
- `priority` ✓
- `fetchPriority="high"` ✓
- realistic `sizes` (e.g., `(max-width: 768px) 100vw, 60vw`)

- [ ] **Step 4: Fix if needed**

Apply minimal changes to make the cover the LCP-optimized image. Other gallery thumbnails: lazy by default (`next/image` already lazy-loads anything without `priority`).

- [ ] **Step 5: Smoke test with Lighthouse**

Run dev server, then in Chrome DevTools → Lighthouse → Mobile → Performance. Capture the LCP element. It should be the hero image on home, the cover on a vehicle page.

- [ ] **Step 6: Commit**

```bash
git add src/components/public/HomeHero.tsx src/components/public/VehicleGallery.tsx
git commit -m "perf(seo): ensure hero + vehicle cover are LCP-priority images"
```

(Skip files that didn't change. If nothing changed, skip this commit entirely and note in the plan checklist that the audit found no fixes needed.)

---

## Phase 9 — Copy retrofit deliverables (drafts for owner review)

### Task 21: Generate `docs/seo/copy-retrofit-draft.md`

**Files:**
- Create: `docs/seo/copy-retrofit-draft.md`

- [ ] **Step 1: Create the directory and the draft doc**

```bash
mkdir -p docs/seo
```

Then write `docs/seo/copy-retrofit-draft.md`:

````markdown
# Copy Retrofit — Draft for Owner Review

**Status:** Draft awaiting Spanish review. Once approved, copy is applied to `src/messages/{es,ca,en}.json`.

## Conventions

- `metaTitle`: ≤60 characters total, contains primary keyword, ends with `· Otti Bull`.
- `metaDescription`: 150–160 characters, contains secondary keyword + clear CTA verb.
- `H1` / hero copy: natural-language phrasing for humans; SEO comes second.
- Keyword density: aim for 1 primary keyword occurrence in title/H1/intro, NOT keyword stuffing.
- Catalan and English translations adapt meaning, not word-for-word.

## Home `/[locale]`

### ES
| Field | Current (`messages/es.json`) | Proposed |
|---|---|---|
| `home.metaTitle` | Otti Bull · Alquiler de Autocaravanas en Barcelona | Alquiler de autocaravanas en Barcelona · Otti Bull |
| `home.metaDescription` | Alquila autocaravanas y motos premium en Barcelona. Reserva fácil, atención personalizada. | Alquiler de autocaravanas premium en Barcelona. Vehículos equipados, seguro a todo riesgo y atención personalizada. Reserva online. |
| `home.heroEyebrow` | Libertad sobre Ruedas | Libertad sobre ruedas |
| `home.heroTitle` | Tu próxima aventura empieza aquí | Tu próxima aventura empieza aquí |
| `home.heroSubtitle` | Alquiler de autocaravanas premium en Barcelona | Alquiler de autocaravanas premium en Barcelona y Cataluña |
| `home.whyTitle` | Lo que nos hace diferentes | Lo que nos hace diferentes |
| `home.whySubtitle` | Por qué cientos de viajeros confían en Otti Bull para sus aventuras | Por qué cientos de viajeros eligen Otti Bull para alquilar su autocaravana en Barcelona |

### CA (translate from approved ES)
| Field | Proposed |
|---|---|
| `home.metaTitle` | Lloguer d'autocaravanes a Barcelona · Otti Bull |
| `home.metaDescription` | Lloguer d'autocaravanes premium a Barcelona. Vehicles equipats, assegurança a tot risc i atenció personalitzada. Reserva en línia. |
| `home.heroSubtitle` | Lloguer d'autocaravanes premium a Barcelona i Catalunya |
| `home.whySubtitle` | Per què centenars de viatgers escullen Otti Bull per llogar la seva autocaravana a Barcelona |

### EN
| Field | Proposed |
|---|---|
| `home.metaTitle` | Camper rentals in Barcelona · Otti Bull |
| `home.metaDescription` | Premium camper rentals in Barcelona. Fully equipped vehicles, comprehensive insurance and personalized service. Book online. |
| `home.heroSubtitle` | Premium camper rentals in Barcelona and Catalonia |
| `home.whySubtitle` | Why hundreds of travellers choose Otti Bull to rent their camper in Barcelona |

## Catalog `/[locale]/catalog`

### ES
| Field | Current | Proposed |
|---|---|---|
| `catalog.metaTitle` | Catálogo de Vehículos \| Otti Bull | Flota de autocaravanas en Barcelona · Otti Bull |
| `catalog.metaDescription` | Explora nuestra flota de autocaravanas, motos y más en alquiler en Barcelona. | Explora la flota completa de autocaravanas en alquiler en Barcelona y Cataluña: camper, motos y vehículos equipados para tu viaje. |
| `catalog.title` | Nuestra flota | Flota de autocaravanas en alquiler |

### CA
| Field | Proposed |
|---|---|
| `catalog.metaTitle` | Flota d'autocaravanes a Barcelona · Otti Bull |
| `catalog.metaDescription` | Explora la flota completa d'autocaravanes en lloguer a Barcelona i Catalunya: camper, motos i vehicles equipats per al teu viatge. |
| `catalog.title` | Flota d'autocaravanes en lloguer |

### EN
| Field | Proposed |
|---|---|
| `catalog.metaTitle` | Camper fleet in Barcelona · Otti Bull |
| `catalog.metaDescription` | Explore our full camper fleet for rent in Barcelona and Catalonia: campervans, motorcycles and fully equipped vehicles for your trip. |
| `catalog.title` | Our camper fleet for rent |

## About `/[locale]/about`

### ES
| Field | Current | Proposed |
|---|---|---|
| `about.metaTitle` | Nosotros \| Otti Bull | Otti Bull SL · Alquiler de autocaravanas en Barcelona |
| `about.metaDescription` | Otti Bull SL — expertos en alquiler de autocaravanas en Barcelona. | Otti Bull SL: empresa especializada en alquiler de autocaravanas premium en Barcelona. Vehículos propios, atención personalizada y servicio local. |
| `about.heroTitle` | Expertos en Caravaning desde Barcelona | Expertos en alquiler de autocaravanas en Barcelona |

### CA
| Field | Proposed |
|---|---|
| `about.metaTitle` | Otti Bull SL · Lloguer d'autocaravanes a Barcelona |
| `about.metaDescription` | Otti Bull SL: empresa especialitzada en lloguer d'autocaravanes premium a Barcelona. Vehicles propis, atenció personalitzada i servei local. |
| `about.heroTitle` | Experts en lloguer d'autocaravanes a Barcelona |

### EN
| Field | Proposed |
|---|---|
| `about.metaTitle` | Otti Bull SL · Camper rentals in Barcelona |
| `about.metaDescription` | Otti Bull SL: specialists in premium camper rentals in Barcelona. Owned fleet, personalized service and local know-how. |
| `about.heroTitle` | Camper rental experts in Barcelona |

## FAQ `/[locale]/faq`

### ES
| Field | Current | Proposed |
|---|---|---|
| `faq.metaTitle` | Preguntas Frecuentes \| Otti Bull | Preguntas frecuentes sobre alquiler de autocaravanas · Otti Bull |
| `faq.metaDescription` | Respuestas a las dudas más comunes sobre el alquiler de autocaravanas en Otti Bull. | Respuestas a las preguntas más frecuentes sobre alquiler de autocaravanas en Barcelona: precios, seguros, documentación y entrega. |
| `faq.title` | Preguntas Frecuentes | Preguntas frecuentes |
| `faq.subtitle` | Encuentra respuestas a las dudas más comunes sobre nuestro servicio de alquiler | Todo lo que necesitas saber antes de alquilar una autocaravana en Barcelona |

### CA
| Field | Proposed |
|---|---|
| `faq.metaTitle` | Preguntes freqüents sobre lloguer d'autocaravanes · Otti Bull |
| `faq.metaDescription` | Respostes a les preguntes més freqüents sobre el lloguer d'autocaravanes a Barcelona: preus, assegurances, documentació i lliurament. |
| `faq.subtitle` | Tot el que has de saber abans de llogar una autocaravana a Barcelona |

### EN
| Field | Proposed |
|---|---|
| `faq.metaTitle` | FAQ — Camper rentals · Otti Bull |
| `faq.metaDescription` | Answers to the most common questions about camper rentals in Barcelona: pricing, insurance, documents and delivery. |
| `faq.subtitle` | Everything you need to know before renting a camper in Barcelona |

## Owner review checklist

- [ ] All ES `metaTitle` ≤60 characters (visual scan)
- [ ] All ES `metaDescription` 150–160 characters
- [ ] ES copy reads naturally as a Spanish native speaker
- [ ] CA translations are accurate (Catalan native check)
- [ ] EN translations are accurate (native English check)
- [ ] No keyword that feels unnatural / "stuffed"
- [ ] Approve → notify implementer to apply changes to `messages/*.json`
````

- [ ] **Step 2: Commit**

```bash
git add docs/seo/copy-retrofit-draft.md
git commit -m "docs(seo): copy retrofit draft for owner review (home/catalog/about/faq)"
```

---

### Task 22: Generate `docs/seo/vehicle-slug-style.md`

**Files:**
- Create: `docs/seo/vehicle-slug-style.md`

- [ ] **Step 1: Create the file**

```markdown
# Vehicle Slug Style Guide

Slugs live in `vehicles.slug` and form the canonical URL: `/{locale}/vehicles/{slug}`. They are language-agnostic (same slug across `es`, `ca`, `en`).

## Format

- All lowercase
- ASCII only — no accented characters (use `n` not `ñ`, `a` not `á`)
- Words separated by single hyphens `-`
- No leading/trailing/repeated hyphens
- 30–60 characters total
- Include: brand + model + key distinguishing attribute (capacity OR year)

## Good examples

| Vehicle | Slug |
|---|---|
| McLouis MC4 72, 4 plazas | `mclouis-mc4-72-4-plazas` |
| Roller Team Zefiro 685, 6 plazas | `roller-team-zefiro-685-6-plazas` |
| Honda CB500X, moto | `honda-cb500x-moto-trail` |

## Bad examples

| Slug | Why it's bad |
|---|---|
| `vehiculo-1` | No brand, no model, opaque |
| `camper-2` | Generic, indistinguishable from any other camper |
| `Mc-Louis_72` | Capital letter, underscore, no capacity |
| `mclouis-mc4-72-4-plazas-familiar-grande` | Too long, "familiar grande" is filler |

## Renaming an existing vehicle slug

If you rename a slug that has been live for >7 days, also add a 301 redirect:

1. Rename in admin → publishes the new slug.
2. Open `src/proxy.ts` and add (before the `intlMiddleware(req)` return):
   ```typescript
   const RENAMED_SLUGS: Record<string, string> = {
     "OLD-SLUG": "NEW-SLUG",
   };
   for (const [oldSlug, newSlug] of Object.entries(RENAMED_SLUGS)) {
     const m = pathname.match(/^\/(es|ca|en)\/vehicles\/(.+)$/);
     if (m && m[2] === oldSlug) {
       return NextResponse.redirect(new URL(`/${m[1]}/vehicles/${newSlug}`, req.url), 301);
     }
   }
   ```
3. Commit and deploy.

## Limits

This phase tolerates **at most 5 slug rewrites**. More than that = migration scope creep, deferred to Phase 2.
```

- [ ] **Step 2: Commit**

```bash
git add docs/seo/vehicle-slug-style.md
git commit -m "docs(seo): vehicle slug style guide + 301 redirect recipe"
```

---

### Task 23: Generate `docs/seo/image-alt-audit.md` from current DB

**Files:**
- Create: `docs/seo/image-alt-audit.md`

- [ ] **Step 1: Pull current alt-text inventory from the DB**

Run:

```bash
docker exec ottibull-postgres psql -U ottibull -d ottibull -c "
SELECT vi.id, v.slug, vi.is_cover, COALESCE(vi.alt_text, '<NULL>') AS alt_text
FROM vehicle_images vi
JOIN vehicles v ON v.id = vi.vehicle_id
WHERE v.status = 'published'
ORDER BY v.slug, vi.is_cover DESC, vi.sort_order;
" -A -F'|' --csv > /tmp/vehicle-images.csv
```

Then for hero images:

```bash
docker exec ottibull-postgres psql -U ottibull -d ottibull -c "
SELECT id, sort_order, COALESCE(alt_text, '<NULL>') AS alt_text
FROM hero_images
WHERE status = 'published'
ORDER BY sort_order;
" -A -F'|' --csv > /tmp/hero-images.csv
```

- [ ] **Step 2: Author the audit doc**

Create `docs/seo/image-alt-audit.md`:

```markdown
# Image Alt-Text Audit

**Status:** Draft awaiting owner action via admin panel.

## Style guide

A good `alt_text`:
- Describes what's in the image, not "image of"
- Mentions the vehicle/brand/model when relevant
- Includes one location/context cue when natural (e.g. "exterior", "interior cocina")
- 60–125 characters
- Same alt across locales is acceptable (descriptive language is mostly language-neutral); but if a phrase is clearly Spanish-only, provide a per-locale variant via the admin

## Bad → Good examples

| Bad | Good |
|---|---|
| `vehiculo 1` | `Otti Bull McLouis MC4 72 - vista exterior frontal` |
| `image-2.jpg` | `McLouis MC4 72 - interior cocina con menaje incluido` |
| (empty) | `Roller Team Zefiro 685 - dormitorio doble trasero` |

## Vehicle images — current state

Apply via admin → Vehicle → Edit → Image alt text.

> The implementer fills the table below from `/tmp/vehicle-images.csv` produced in Step 1. Format:

| Image ID | Vehicle slug | Cover? | Current alt | Proposed alt |
|---|---|---|---|---|
| `<id>` | `<slug>` | yes/no | `<current>` | _to draft_ |

## Hero images — current state

Apply via admin → Hero images → Edit alt text.

| Image ID | Sort | Current alt | Proposed alt |
|---|---|---|---|
| `<id>` | `<n>` | `<current>` | _to draft_ |

## Owner workflow

1. Read the proposed alt for each row above
2. Open the admin panel for the vehicle/hero
3. Paste the new alt text
4. Save
5. Tick the row in this doc
```

(The implementer fills the actual table rows from the CSV before committing.)

- [ ] **Step 3: Commit**

```bash
git add docs/seo/image-alt-audit.md
git commit -m "docs(seo): image alt-text audit doc generated from current DB"
```

---

### Task 24: Generate `docs/seo/review-request-templates.md`

**Files:**
- Create: `docs/seo/review-request-templates.md`

- [ ] **Step 1: Create the file**

```markdown
# Google Business Profile — Review Request Templates

Use these after a positive customer experience. Send via WhatsApp or email within 3–7 days of vehicle return — recency is what makes recipients act.

**Always include the direct Google review link**, NOT the GBP listing URL. Build the direct review link from Google's "Get more reviews" tool in GBP and paste into the templates.

## Spanish (es) — primary

> ¡Hola {nombre}! Esperamos que tu viaje con la {modelo} haya sido genial. Si te apetece, nos ayudarías muchísimo dejando una breve reseña en Google sobre tu experiencia con Otti Bull. Te dejo el enlace directo: {URL_RESEÑA}
>
> ¡Gracias y que tengas buena ruta para la próxima!
> — Otti Bull

## Catalan (ca)

> Hola {nom}! Esperem que el teu viatge amb la {model} hagi anat genial. Si et ve de gust, ens ajudaries molt deixant una breu ressenya a Google sobre la teva experiència amb Otti Bull. Et deixo l'enllaç directe: {URL_RESEÑA}
>
> Gràcies i bona ruta per a la propera!
> — Otti Bull

## English (en)

> Hi {name}! Hope your trip with the {model} was great. If you have a moment, it would help us a lot if you could leave a quick Google review about your Otti Bull experience. Here's the direct link: {REVIEW_URL}
>
> Thanks and safe travels for next time!
> — Otti Bull

## Do

- Use within 7 days of return
- Personalize with first name + model

## Don't

- Offer discounts in exchange for reviews — violates Google's policy and risks GBP suspension
- Ask multiple times — once, polite, drop it
```

- [ ] **Step 2: Commit**

```bash
git add docs/seo/review-request-templates.md
git commit -m "docs(seo): GBP review-request templates in es/ca/en"
```

---

## Phase 10 — OWNER CHECKPOINT and copy application

### Task 25: ⛔ Owner review checkpoint

This task is a deliberate pause. Do not proceed to Task 26 until the owner has approved `docs/seo/copy-retrofit-draft.md`.

- [ ] **Step 1: Notify owner**

Post in the project's communication channel:

> "Copy retrofit draft ready for review at `docs/seo/copy-retrofit-draft.md`. Please review the ES copy (primary), then confirm CA + EN. Once approved I'll apply to `messages/*.json` and ship."

- [ ] **Step 2: Wait for owner approval**

Owner either:
- Approves all → proceed to Task 26
- Requests changes → update `docs/seo/copy-retrofit-draft.md`, re-notify, wait again

- [ ] **Step 3: Confirm approval and record**

Append to the bottom of `docs/seo/copy-retrofit-draft.md`:

```markdown
---

## Approval log

- 2026-MM-DD — Approved by owner (full draft / with changes noted above)
```

Commit:

```bash
git add docs/seo/copy-retrofit-draft.md
git commit -m "docs(seo): owner-approved copy retrofit draft"
```

---

### Task 26: Apply approved copy to `messages/es.json`

**Files:**
- Modify: `src/messages/es.json`

- [ ] **Step 1: Open the approved draft side-by-side with the JSON**

Open both files in the editor. For each field in the "Proposed" column under the ES section, replace the value in `es.json`.

- [ ] **Step 2: Apply each row from the approved draft**

For Home, Catalog, About, FAQ — replace the JSON values exactly as approved.

- [ ] **Step 3: Validate JSON shape**

Run: `node -e "JSON.parse(require('fs').readFileSync('src/messages/es.json','utf8')); console.log('ok')"`
Expected: `ok`.

- [ ] **Step 4: Run typecheck and tests**

Run: `npm run typecheck && npx vitest run`
Expected: clean.

- [ ] **Step 5: Commit**

```bash
git add src/messages/es.json
git commit -m "feat(seo): apply approved copy retrofit to ES messages"
```

---

### Task 27: Apply approved copy to `messages/ca.json` and `messages/en.json`

**Files:**
- Modify: `src/messages/ca.json`, `src/messages/en.json`

- [ ] **Step 1: Apply CA rows from the approved draft to `ca.json`**

Replace `home.*`, `catalog.*`, `about.*`, `faq.*` values per the draft.

- [ ] **Step 2: Apply EN rows from the approved draft to `en.json`**

Same fields.

- [ ] **Step 3: Validate**

```bash
node -e "['ca','en'].forEach(l => JSON.parse(require('fs').readFileSync('src/messages/'+l+'.json','utf8'))); console.log('ok')"
npm run typecheck
```

Expected: both pass.

- [ ] **Step 4: Verify rendering**

With dev server running:

```bash
for loc in es ca en; do
  echo "=== $loc ==="
  curl -s "http://localhost:3000/$loc" | grep -oE "<title[^>]*>[^<]+</title>" | head -1
done
```

Expected: each locale shows the new approved title.

- [ ] **Step 5: Commit**

```bash
git add src/messages/ca.json src/messages/en.json
git commit -m "feat(seo): apply approved copy retrofit to CA + EN messages"
```

---

## Phase 11 — Validation deliverables

### Task 28: Create `docs/seo/post-deploy-checklist.md`

**Files:**
- Create: `docs/seo/post-deploy-checklist.md`

- [ ] **Step 1: Create the checklist doc**

```markdown
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
```

- [ ] **Step 2: Commit**

```bash
git add docs/seo/post-deploy-checklist.md
git commit -m "docs(seo): post-deploy verification checklist (12 sections)"
```

---

### Task 29: Create `docs/seo/baseline.md` placeholder

**Files:**
- Create: `docs/seo/baseline.md`

- [ ] **Step 1: Capture baselines (manual, before pushing the SEO PR to production)**

In Chrome incognito:
- Open `https://ottibull.com/es` (or staging if production hasn't shipped any SEO yet).
- DevTools → Lighthouse → Mobile → Performance + SEO + Accessibility + Best Practices → Generate.
- Capture the 4 scores.
- Repeat for `/es/catalog` and a `/es/vehicles/{slug}` URL.

- [ ] **Step 2: Capture indexation snapshot**

In Google: `site:ottibull.com` → record approximate result count.

For the primary query `alquiler autocaravana Barcelona` (incognito, location set to Barcelona) → record Otti Bull's position, if any. Likely absent.

- [ ] **Step 3: Write the baseline doc**

```markdown
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
```

Fill in the four `_fill_` blocks with the captured numbers before commit.

- [ ] **Step 4: Commit**

```bash
git add docs/seo/baseline.md
git commit -m "docs(seo): pre-deploy SEO baseline snapshot"
```

---

## Phase 12 — Smoke E2E tests

### Task 30: E2E test asserting JSON-LD presence on key pages

**Files:**
- Create: `tests/e2e/seo.spec.ts`

- [ ] **Step 1: Read existing E2E conventions**

Run: `head -20 tests/e2e/public.spec.ts`
Note: tests use Playwright, base URL set in `playwright.config.ts`, seed assumption baked in.

- [ ] **Step 2: Write the new spec**

```typescript
import { test, expect } from "@playwright/test";

test.use({
  viewport: { width: 1280, height: 800 },
  locale: "es-ES",
});

async function getJsonLdTypes(html: string): Promise<string[]> {
  const matches = html.matchAll(
    /<script[^>]*type="application\/ld\+json"[^>]*>([^<]+)<\/script>/g,
  );
  const types: string[] = [];
  for (const m of matches) {
    try {
      const parsed = JSON.parse(m[1]);
      if (parsed["@type"]) types.push(parsed["@type"]);
    } catch {
      // ignore parse errors
    }
  }
  return types;
}

test("home emits LocalBusiness", async ({ page, request }) => {
  const res = await request.get("/es");
  const html = await res.text();
  const types = await getJsonLdTypes(html);
  expect(types).toContain("LocalBusiness");
});

test("catalog emits ItemList + BreadcrumbList", async ({ request }) => {
  const res = await request.get("/es/catalog");
  const html = await res.text();
  const types = await getJsonLdTypes(html);
  expect(types).toEqual(expect.arrayContaining(["BreadcrumbList", "ItemList"]));
});

test("faq emits FAQPage + BreadcrumbList (with seeded FAQs)", async ({ request }) => {
  const res = await request.get("/es/faq");
  const html = await res.text();
  const types = await getJsonLdTypes(html);
  expect(types).toEqual(expect.arrayContaining(["BreadcrumbList", "FAQPage"]));
});

test("about emits BreadcrumbList", async ({ request }) => {
  const res = await request.get("/es/about");
  const html = await res.text();
  const types = await getJsonLdTypes(html);
  expect(types).toContain("BreadcrumbList");
});

test("vehicle page emits Product + BreadcrumbList", async ({ request }) => {
  // Get a published vehicle URL from the sitemap.
  const sitemap = await (await request.get("/sitemap.xml")).text();
  const m = sitemap.match(/<loc>([^<]+\/es\/vehicles\/[^<]+)<\/loc>/);
  if (!m) test.skip(true, "No published vehicles in test DB");
  const res = await request.get(new URL(m![1]).pathname);
  const html = await res.text();
  const types = await getJsonLdTypes(html);
  expect(types).toEqual(expect.arrayContaining(["Product", "BreadcrumbList"]));
});
```

- [ ] **Step 3: Run the test**

Run: `npm run test:e2e -- tests/e2e/seo.spec.ts`
Expected: 5 pass (or 4 + 1 skipped if no published vehicles).

- [ ] **Step 4: Commit**

```bash
git add tests/e2e/seo.spec.ts
git commit -m "test(seo): e2e asserts JSON-LD presence on home/catalog/faq/about/vehicle"
```

---

### Task 31: E2E test for consent banner

**Files:**
- Modify: `tests/e2e/seo.spec.ts` (append) — or create `tests/e2e/consent.spec.ts`

- [ ] **Step 1: Append to seo.spec.ts (or create new file)**

```typescript
test.describe("cookie consent", () => {
  test("banner appears, accepting persists and loads GA", async ({ page }) => {
    process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID = "G-TEST-XYZ"; // assumes test env config
    await page.goto("/es");

    const banner = page.getByRole("dialog", { name: /utilizamos cookies/i });
    await expect(banner).toBeVisible();

    // No GA script before consent
    const gaScriptBefore = await page.locator("script[src*='googletagmanager.com']").count();
    expect(gaScriptBefore).toBe(0);

    await page.getByRole("button", { name: "Aceptar" }).click();
    await expect(banner).toBeHidden();

    // localStorage persists
    const stored = await page.evaluate(() => localStorage.getItem("ottibull-cookie-consent-v1"));
    expect(stored).toBe("granted");

    // Reload — banner does not return
    await page.reload();
    await expect(banner).toBeHidden();
  });

  test("rejecting hides the banner without loading GA", async ({ page, context }) => {
    await context.clearCookies();
    await page.goto("/es");
    const banner = page.getByRole("dialog", { name: /utilizamos cookies/i });
    await expect(banner).toBeVisible();
    await page.getByRole("button", { name: "Rechazar" }).click();
    await expect(banner).toBeHidden();
    const stored = await page.evaluate(() => localStorage.getItem("ottibull-cookie-consent-v1"));
    expect(stored).toBe("denied");
  });
});
```

Note: The first test depends on the dev server having `NEXT_PUBLIC_GA_MEASUREMENT_ID` set when serving. For Playwright in CI, set this env var when starting the dev server.

- [ ] **Step 2: Run**

Run: `npm run test:e2e -- tests/e2e/seo.spec.ts`
Expected: all consent tests pass.

- [ ] **Step 3: Commit**

```bash
git add tests/e2e/seo.spec.ts
git commit -m "test(seo): e2e for consent banner accept/reject + persistence"
```

---

## Done criteria

After Task 31, the SEO foundation PR is complete:

- All unit tests pass (`npm test`)
- All E2E tests pass (`npm run test:e2e`)
- `npm run typecheck` clean
- `npm run lint` clean (or only pre-existing unrelated warnings)
- `docs/seo/copy-retrofit-draft.md` has owner approval recorded
- `docs/seo/post-deploy-checklist.md` is ready to execute on deploy day
- `docs/seo/baseline.md` filled with pre-deploy numbers

After deploy, the owner walks through `docs/seo/post-deploy-checklist.md` and records anything that didn't pass for follow-up.

---

## Out of scope (Phase 2 candidates)

Carried verbatim from spec §4.5 — if any of these become urgent before Phase 2 is planned, surface in the project log:

- Blog / cornerstone content
- Backlink outreach
- Marketplace listings (Yescapa / Goboony / Indie Campers)
- fr / de / it locales
- Commercial CMP (Cookiebot / Iubenda)
- A/B testing of copy variants
- Local landing pages (Sitges / Girona / Tarragona)
- URL slug restructuring (`/catalog` → `/alquiler-autocaravanas`)
