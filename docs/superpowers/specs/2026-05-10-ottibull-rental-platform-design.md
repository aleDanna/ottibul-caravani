# Otti Bull Rental Platform — Design Spec

**Date:** 2026-05-10
**Status:** Approved (brainstorming phase)
**Author:** aleDanna + Claude

## Overview

Web platform for renting campers, motorcycles, and other vehicles in Barcelona. Direct evolution of the existing site at https://ottibull.com/. Public catalog + inquiry form (no online booking, no real-time availability) with notifications to owners (email + WhatsApp link). Admin panel for inventory CRUD. Trilingual (Spanish/Catalan/English) with full SEO.

## Goals

- Public catalog of vehicles, browseable in 3 languages, with strong SEO (sitemap, hreflang, JSON-LD, OG, Lighthouse > 90).
- Inquiry flow: user fills form (dates, contact, guests) → email auto-sent to owner + user redirected to a "thank-you" page with a pre-filled WhatsApp button to message the owner.
- Admin panel: secure login (single user), CRUD on vehicles with translations and image gallery.
- Deployable on Vercel with zero recurring infra cost at MVP volumes.

## Non-goals (MVP)

- Real-time availability calendar.
- Automatic price calculation based on dates.
- Online payment / booking confirmation.
- Persistent storage of inquiries in DB (lives only in email + WhatsApp).
- Multi-admin accounts.
- Admin UI for managing vehicle types or global settings (these live in code/env).
- Server-initiated WhatsApp via Business API (we use the click-to-chat `wa.me` link instead).
- Blog / content marketing module.

## Tech stack

| Layer | Choice |
|---|---|
| Framework | Next.js 16.x (App Router, RSC, Server Actions, Fluid Compute) |
| Language | TypeScript 5.x |
| ORM | Drizzle ORM + Drizzle Kit (migrations) |
| Database | Neon Postgres via Vercel Marketplace |
| Auth | NextAuth (Auth.js v5), Credentials Provider, JWT strategy |
| Storage | Vercel Blob (vehicle images) |
| Email | Resend + react-email |
| i18n | next-intl |
| Styling | Tailwind CSS (design pending from user) |
| Validation | Zod |
| Other | bcryptjs, libphonenumber-js, react-markdown, @vercel/og |
| Test | Vitest (unit/integration), Playwright (E2E) |
| Hosting | Vercel |

## Architecture & routing

Single Next.js application. Public routes are statically rendered with ISR; admin routes are dynamic. All mutations go through Server Actions. Locales: `es` (default), `ca`, `en`.

**All navigation paths are in English** (no per-locale path translation). Locale prefix is the only locale-dependent part of the URL.

```
src/
├── app/
│   ├── [locale]/                       # es | ca | en
│   │   ├── layout.tsx
│   │   ├── page.tsx                    # home
│   │   ├── catalog/page.tsx            # vehicle list, filter ?type=
│   │   ├── vehicles/[slug]/page.tsx    # vehicle detail + inquiry form
│   │   ├── thank-you/page.tsx          # post-submit, WhatsApp button
│   │   ├── privacy/page.tsx            # MDX
│   │   └── terms/page.tsx              # MDX
│   ├── admin/                          # NO locale segment, admin in Spanish only
│   │   ├── login/page.tsx
│   │   ├── layout.tsx                  # session guard + nav
│   │   ├── page.tsx                    # dashboard / vehicle list
│   │   ├── vehicles/
│   │   │   ├── new/page.tsx
│   │   │   └── [id]/page.tsx           # edit
│   │   └── logout/route.ts
│   ├── api/
│   │   └── inquiries/route.ts          # only used internally; main flow is Server Actions
│   ├── sitemap.ts
│   ├── robots.ts
│   └── opengraph-image.tsx
├── db/
│   ├── schema.ts
│   └── client.ts
├── lib/
│   ├── auth.ts                         # NextAuth config + requireAdminSession()
│   ├── email.ts                        # Resend wrapper
│   ├── whatsapp.ts                     # wa.me URL builder + HMAC sign/verify
│   ├── i18n.ts                         # next-intl config
│   ├── seo.ts                          # generateMetadata helpers
│   └── vehicle-attributes.ts           # Zod schemas per vehicle type
├── components/
│   ├── public/
│   └── admin/
└── middleware.ts                       # next-intl + admin auth guard
```

**Routing rules:**
- `/` → redirect to `/es`.
- `/admin/*` (except `/admin/login`) → middleware checks JWT; if missing/invalid → redirect to `/admin/login?next=<url>`.
- Public pages render with `force-static` + ISR via `revalidatePath()` triggered by admin mutations.

## Data model

### `admin_users`
```
id              uuid pk
email           text unique not null
password_hash   text not null         -- bcrypt
name            text
created_at      timestamptz default now()
```
Seeded once via script (`pnpm db:seed:admin --email=... --password=...`). No registration UI.

### `vehicles`
```
id                    uuid pk
slug                  text unique not null
type                  vehicle_type not null  -- enum: 'camper' | 'motorcycle' | 'car' | 'bicycle' | 'boat'
base_price_per_day    numeric(10,2) not null
min_rental_days       int default 1
max_rental_days       int                    -- nullable
location              text not null
attributes            jsonb default '{}'
status                vehicle_status default 'draft'  -- 'draft' | 'published'
featured              boolean default false
sort_order            int default 0
created_at, updated_at timestamptz
```

`attributes` is a JSONB validated by a Zod schema per `type` (in `lib/vehicle-attributes.ts`). Vehicle types are seeded in code (enum); adding a new type requires a code change. Examples:

- `camper`: `{ berths, travel_seats, length_m, year, transmission, license_required }`
- `motorcycle`: `{ displacement_cc, year, license_required }`

### `vehicle_translations`
```
id                uuid pk
vehicle_id        uuid fk vehicles(id) on delete cascade
locale            locale not null   -- 'es' | 'ca' | 'en'
title             text not null
description       text not null     -- markdown
meta_title        text              -- nullable, fallback to title
meta_description  text              -- nullable, fallback to description excerpt
unique(vehicle_id, locale)
```
A vehicle requires all 3 translations to be `published` (validated at admin form level).

### `vehicle_images`
```
id          uuid pk
vehicle_id  uuid fk vehicles(id) on delete cascade
url         text not null           -- Vercel Blob URL
alt_text    text                    -- shared across locales (MVP)
sort_order  int default 0
is_cover    boolean default false   -- exactly one cover per vehicle (app-level constraint)
created_at  timestamptz
```

**No `inquiries` table.** Lead data lives only in email (Resend retention) + the user's WhatsApp.

NextAuth uses JWT strategy → no `sessions`/`accounts` tables required.

## Public flow

### Pages

**Home `/[locale]`**
- Hero with value prop + CTA "View catalog".
- Featured vehicles section (`featured = true`, max 6, sorted by `sort_order`).
- "How it works" 3-step section.
- Footer: contacts, legal links, language switcher.

**Catalog `/[locale]/catalog`**
- Responsive grid of vehicle cards: cover image, title, location, "from €X/day", type badge.
- Filter by type via `?type=camper|motorcycle|...`.
- Sorted by `sort_order` then `created_at desc`.
- No pagination at launch; will add `?page=N` once published count exceeds 24.

**Vehicle detail `/[locale]/vehicles/[slug]`**
- Image gallery (cover + secondary, lightbox optional).
- Header: title, location, base price/day, type badge.
- Description rendered from markdown via react-markdown.
- Attribute table rendered conditionally per type.
- Inquiry form (sticky on desktop, inline on mobile).

**Thank-you `/[locale]/thank-you`**
- Confirmation message.
- Primary CTA: "Continue on WhatsApp" → opens `wa.me/<phone>?text=<encoded>`.
- Secondary CTA: "Back to catalog".

### Inquiry form fields

| Field | Type | Required |
|---|---|---|
| Full name | text | yes |
| Email | email | yes |
| Phone (with country code) | tel | yes |
| Check-in date | date | yes |
| Check-out date | date | yes |
| Number of guests | number | yes |
| Message | textarea | no |
| Privacy consent | checkbox | yes (GDPR) |

Validation with Zod on both client and server. `check_out > check_in`.

### Submit flow

1. Client submits via Server Action `submitInquiryAction`.
2. Server validates with Zod, fetches vehicle data (title in current locale, slug).
3. Server sends email via Resend (template `emails/inquiry-received.tsx`).
4. Server builds the `wa.me` URL with localized pre-filled message.
5. Server signs the URL payload with HMAC (`AUTH_SECRET`, 16-char truncated SHA-256), encodes as `<base64url>.<sig>`.
6. Server `redirect()` to `/[locale]/thank-you?w=<payload>.<sig>`.
7. `/thank-you` Server Component verifies signature, decodes URL, renders WhatsApp button.

### GDPR

- `/[locale]/privacy` and `/[locale]/terms` are static MDX pages.
- Form requires explicit consent checkbox.
- Inquiry data is not stored in our DB; only transient via Resend (default 30-day retention) and the user's WhatsApp.

## Admin panel & auth

### Authentication

- NextAuth (Auth.js v5), Credentials Provider, JWT strategy.
- Login route `/admin/login`: email + password form → `signIn("credentials", ...)`.
- Server validates `email` exists in `admin_users` and `bcrypt.compare(password, password_hash)`.
- JWT cookie: `__Secure-next-auth.session-token`, HttpOnly, Secure, SameSite=Lax. 7-day duration, sliding `updateAge: 1 day`.
- Logout `/admin/logout`: calls `signOut()` and redirects to `/admin/login`.
- Login rate limit: 5 attempts per IP per 15 minutes (in-memory for MVP; switch to Upstash Redis if abuse appears).

Single admin user at launch. Seeded via script (no self-registration UI).

### Middleware

`src/middleware.ts` runs:
1. next-intl middleware on public routes.
2. Auth check on `/admin/*` (except `/admin/login`): redirect to login if no valid JWT.

### Admin pages

**`/admin` — dashboard**
- Table: cover thumb, title (es), type, price, status, actions.
- Filters: type, status. Sort: `sort_order`, `updated_at`.
- CTA: "New vehicle".

**`/admin/vehicles/new` and `/admin/vehicles/[id]` — vehicle form**
Sections in the form:
1. **Common data**: slug (auto-generated from es title, editable), type, base price/day, min/max rental days, location, status, featured, sort_order.
2. **Type-specific attributes**: dynamic fields rendered from the Zod schema for the selected type.
3. **Translations**: tabs `es | ca | en`, each with title, markdown description (textarea + preview), meta_title, meta_description. All 3 required to publish.
4. **Image gallery**: drag-and-drop upload to Vercel Blob (presigned URL), reorder, set cover, delete, alt_text per image. Max 10 images, max 5 MB each, JPG/PNG/WebP only.

Actions: "Save draft", "Publish", "Delete" (hard delete with confirmation).

After mutation: `revalidatePath('/[locale]/catalog')` and `revalidatePath('/[locale]/vehicles/[slug]')`.

### Image upload flow

1. Client selects file.
2. Server Action returns a presigned Vercel Blob URL.
3. Client uploads directly to Blob (bypassing the function).
4. Client confirms URL to server, which inserts into `vehicle_images`.

### Security

- CSRF: handled by NextAuth + Server Actions.
- Input validation: Zod on every Server Action.
- Headers: CSP, X-Frame-Options DENY (admin), Strict-Transport-Security in `next.config.ts`.
- All admin Server Actions start with `await requireAdminSession()`; throws → redirect to login.

## Notifications

### Email (Resend)

- Domain `ottibull.com` verified with SPF + DKIM.
- `From: noreply@ottibull.com`, `Reply-To: <customer email>`.
- Env: `RESEND_API_KEY`, `EMAIL_FROM`, `OWNER_EMAIL`, `OWNER_WHATSAPP`.
- Template `emails/inquiry-received.tsx` (react-email):
  - Subject: `Nueva solicitud: <Vehicle Title> · <Customer Name>`
  - Body: vehicle summary (linked to admin), dates, guests, customer contacts (mailto/tel/wa.me), message, CTA "Open in admin".
- Idempotency: `inquiry_id` UUID passed as `X-Inquiry-Id` header.
- Retry: 3 attempts with exponential backoff via `p-retry`. On terminal failure: log error, still serve `/thank-you` so WhatsApp channel works.

### WhatsApp (`wa.me` link)

Helper `lib/whatsapp.ts`:
```ts
function buildWhatsAppUrl(input: {
  ownerPhone: string;
  locale: 'es' | 'ca' | 'en';
  vehicleTitle: string;
  checkIn: Date;
  checkOut: Date;
  guests: number;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  message?: string;
}): string
```

Templates per locale in `lib/whatsapp-templates/{es,ca,en}.ts`. The URL is HMAC-signed before being passed to `/thank-you` to prevent abuse.

### Anti-spam

- Honeypot field hidden in the form.
- Rate limit per IP: 3 inquiries/hour (in-memory).
- Phone validated with libphonenumber-js.
- Future: Vercel BotID if real spam appears.

## SEO & i18n

### i18n

- next-intl with `es` (default), `ca`, `en`.
- Default redirect: `/` → `/es`.
- Detection: `Accept-Language` → cookie `NEXT_LOCALE` → `es`.
- Messages in `messages/{es,ca,en}.json`.
- Language switcher only swaps the locale segment.

### Metadata

`generateMetadata` per page, no global approximate defaults:

- **Home**: localized title/description from messages, og defaults, full `alternates.languages` (`es`/`ca`/`en`/`x-default: es`).
- **Catalog**: title varies by `?type=` filter; alternates per locale.
- **Vehicle detail**: `meta_title` → fallback `title`; `meta_description` → fallback to description excerpt (markdown stripped, first 160 chars). `og:image` = vehicle cover. Alternates point to the same vehicle in other locales. JSON-LD `Product` with name, description, images, brand, offers (price, priceCurrency=EUR, availability).
- **Admin**: `robots: { index: false, follow: false }` in admin layout.

### Sitemap & robots

`app/sitemap.ts` (dynamic):
- Home + catalog + privacy + terms × 3 locales.
- All `vehicles` with `status='published'` × 3 locales.
- `xhtml:link rel="alternate" hreflang` for each entry.
- `lastmod = updated_at`, `changefreq = weekly`, `priority = 0.8` (vehicles), `1.0` (home).

`app/robots.ts`:
```
User-agent: *
Allow: /
Disallow: /admin/
Disallow: /api/
Disallow: /thank-you
Sitemap: https://ottibull.com/sitemap.xml
```

### Structured data

- `Organization` in root layout.
- `BreadcrumbList` on vehicle pages.
- `WebSite` + `SearchAction` placeholder (even without site search).

### Performance for SEO

- `force-static` + ISR on public pages.
- `next/image` everywhere; `priority` on cover; AVIF/WebP via Vercel Image Optimization.
- `next/font` self-hosted.
- Tailwind compiled to static CSS.
- First Load JS target: < 100kB on public routes.
- LCP target: < 2.5s; CLS < 0.1; TBT < 200ms.

### OG dynamic image

`app/[locale]/vehicles/[slug]/opengraph-image.tsx` via `@vercel/og`: cover + title + "from €X/day", 1200×630.

## Testing & deployment

### Tests

- **Unit (Vitest)**: pure helpers (`lib/whatsapp.ts`, `lib/seo.ts`, `lib/vehicle-attributes.ts`), Zod validators. Coverage target 80% on utilities.
- **Integration (Vitest + dockerized Postgres)**: Server Actions (`submitInquiryAction`, vehicle CRUD, login), critical Drizzle queries, Resend mocked.
- **E2E (Playwright)**: smoke flows on preview deploy: home loads, catalog renders, detail → form → thank-you, admin login, admin CRUD round-trip.
- **Lighthouse CI**: fail on LCP > 2.5s, CLS > 0.1, TBT > 200ms, Performance < 90.

### Workflow

- `main` is production. Feature branches → PR → preview deploy with CI + Lighthouse → merge auto-deploys.
- Vercel Git integration provides preview deployments per PR. No persistent staging.

### Migrations

- Drizzle Kit (`pnpm db:generate`).
- Migrations committed under `drizzle/migrations/`.
- Production: GitHub Action runs `pnpm db:migrate` against Neon production before the deploy. Failed migration blocks the deploy.

### Environment variables

| Var | Notes |
|---|---|
| `DATABASE_URL` | Auto from Vercel + Neon |
| `AUTH_SECRET` | `openssl rand -base64 32` |
| `AUTH_URL` | Deployment URL |
| `RESEND_API_KEY` | Resend |
| `EMAIL_FROM` | `noreply@ottibull.com` |
| `OWNER_EMAIL` | Inquiry recipient |
| `OWNER_WHATSAPP` | E.164 without `+` |
| `BLOB_READ_WRITE_TOKEN` | Auto from Vercel Blob |
| `NEXT_PUBLIC_SITE_URL` | Public URL for sitemap/OG |

Local dev in `.env.local` (gitignored). Vercel env via dashboard or `vercel env`.

### Observability

- Vercel Analytics (Web Analytics + Speed Insights).
- Vercel Logs for runtime errors.
- Sentry deferred (add when traffic warrants).

### Backups

- Neon point-in-time recovery (7 days on free tier) + branching.

## Open questions / deferred decisions

- **Visual design**: provided separately by the user; will adapt component layout once received.
- **Vehicle types at launch**: `camper` and `motorcycle` are first-class at launch (Zod attribute schemas implemented). `car`, `bicycle`, `boat` are reserved enum values; their attribute schemas will be added when actual inventory of that type is onboarded.
- **Featured vehicles UI**: rendering decided when design lands.
- **Lightbox for vehicle gallery**: nice-to-have, decide at implementation.

## Risks & mitigations

| Risk | Mitigation |
|---|---|
| Resend delivery failure → owner misses inquiry | `wa.me` button still served on `/thank-you`; logs surface failures |
| WhatsApp link abuse (spammer crafts custom messages to owner) | HMAC sign payload between server and `/thank-you`; honeypot + IP rate limit |
| Locale URL drift (admin publishes vehicle without all 3 translations) | Form-level validation: `publish` action requires all 3 translations |
| ISR stale catalog after admin edit | `revalidatePath` on every mutation; manual "Refresh cache" admin action as backstop |
| DB migration fails in production | Migration step gates the deploy in CI |
