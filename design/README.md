# Handoff: Ottibull Caravaning Website

## Overview
Marketing + booking website for Ottibull Caravaning, a rental company offering camper vans (autocaravanas), caravans (caravanas) and motorcycles across 14 Italian cities. The site covers discovery (home, search, vehicle detail), conversion (3-step booking flow with confirmation), and supporting pages (how it works, about, contact, stories, 404). Currently localized in **Spanish** (es).

## About the Design Files
The files in this bundle are **design references created in HTML + React (via Babel standalone)** — prototypes showing intended look, copy and behavior, **not production code to copy directly**. The task is to **recreate these HTML designs in the target codebase's existing environment** (e.g. Next.js / Astro / Nuxt / SvelteKit) using its established patterns, routing, i18n and component libraries. If no environment exists yet, recommend Next.js (App Router) + TypeScript + CSS Modules or Tailwind, since the design system maps cleanly to CSS custom properties.

The Babel-in-browser setup is for prototyping only — production should use a real bundler, server-side rendering, real image assets, and proper i18n routing (`/es`, `/it`, `/en`).

## Fidelity
**High-fidelity.** Final colors, typography, spacing, radii, shadows, copy and interactions are all production-ready. Implement pixel-perfect using the design tokens listed below.

The only deliberate placeholders are vehicle photographs — currently rendered as warm CSS gradients (`.veh-photo` with `--cielo-100 → --sole-100 → --crema-100 → --bosco-100`). Replace with real photography from the Ottibull fleet, keeping a 4:3 aspect ratio for cards and 4:3 + 1:1 + 1:1 + 1:1 + 1:1 for the gallery grid.

## Routes / Screens

All routes are hash-based in the prototype (`#/cerca`). In production, use real routes with locale prefix.

### `/` — Home
Marketing landing page. Sections in order:
1. **Hero** — serif display headline ("La carretera es de quien la toma."), subhead, two CTAs ("Buscar disponibilidad" primary, "Cómo funciona" ghost), 3-stat row (14 / 120+ / 4.8), decorative 3-card stack on the right.
2. **Sticky-style search bar** — 5 cells: Dónde (city select) · Recogida (date) · Devolución (date) · Categoría (select) · Buscar button. White card, `box-shadow: var(--shadow-lg)`, `border-radius: var(--radius-xl)`, dividers between cells.
3. **Featured fleet** — pill tab switcher (Todos / Autocaravanas / Caravanas / Motos), 4-up grid of vehicle cards.
4. **Why Ottibull** — 4 feature blocks with rounded icon tiles in 4 different tones (default bosco, sole, cielo, terra).
5. **Destinations** — 4-up grid of dest-cards (3:4 aspect, gradient placeholder, dark overlay with name + sub).
6. **How it works (inverse)** — full bosco-900 panel (`border-radius: var(--radius-2xl)`), two columns: heading + CTA on the left, 3 numbered rows on the right with sole-400 numerals.
7. **Testimonials** — 2 quote cards in `--crema-100` and `--bosco-100`, italic serif blockquote, avatar + name + meta.
8. **Stories** — 3 card-lifted entries with gradient hero + meta + title.
9. **Final CTA panel** — bosco gradient with sole circle decoration, large serif headline, accent CTA.

### `/cerca` (search results)
- Page hero with breadcrumb + title + search bar.
- 280px sticky sidebar of filters: category radios, city select, price range slider (50–300 €), checkboxes (Pet friendly, Solo premium).
- Results column: count + sort select on top, then auto-fill grid `repeat(auto-fill, minmax(260px, 1fr))` of vehicle cards.
- Empty state when filters return nothing.

### `/veicolo/:id` (vehicle detail)
- Page hero with breadcrumb, name, category badge, premium/pet badges, rating + reviews + city.
- 3-column gallery (one large 4:3 + four 1:1 thumbs), 8px gaps, rounded corners.
- Two-column layout: main column (Resumen, Características técnicas KV list, Qué está incluido grid, Coberturas card with sole left border) + 380px sticky right side with booking widget (price, date pickers, persons, "Reservar ahora" CTA, fianza note).
- "Vehículos similares" 4-up grid below.

### `/prenota/:id` (booking flow — 3 steps + confirmation)
- Steps indicator at top (Fechas → Datos → Pago → Confirmación), state: active/done/pending.
- Steps 1–3: 2-column layout with main form + 380px sticky summary card showing vehicle, dates, total breakdown, fianza note.
- **Step 1 (Fechas):** date pickers, persons select, 3 extras cards (Limpieza final +60 €, Kilómetros ilimitados +80 €, Segundo conductor +40 €).
- **Step 2 (Datos):** Nombre / Apellido / Email / Teléfono fields with inline validation, optional notes textarea.
- **Step 3 (Pago):** 3 payment-method radio cards (Tarjeta / Transferencia / En sede), credit card form appears when "Tarjeta" selected, terms checkbox.
- **Step 4 (Confirmación):** centered success state with checkmark circle in `--bosco-100`, serif headline, booking code in mono, 3 next-step bullets, return-to-home CTA.

### `/come-funziona`
- Page hero, then 4 alternating-direction rows (image left/right), each with large sole-500 numeral, serif title, lead paragraph, gradient image placeholder.
- FAQ section with 5 accordion items (chevron rotates on open).

### `/chi-siamo`
- Page hero ("Crecidos en la carretera.").
- Two-column section: bosco gradient image + history paragraphs.
- 3-up values grid (Honestidad / Mantenimiento / Respuesta humana).
- Inverse stats panel: 17 / 14 / 120+ / 4.8 with `--sole-400` numerals.

### `/contatti`
- Page hero, then 2-column layout: 4 contact blocks (Teléfono, Email, Sede principal, Emergencia 24/7) on the left + contact form card on the right with success state on submit.

### `/storie`
- Page hero, 3-up grid of 6 story cards.

### `/404`
- Centered "Carretera cerrada." with serif display, return CTA.

## Components

### `Nav`
- Sticky top, 72px tall (56px mobile), `background: rgba(251, 248, 241, 0.85)` with `backdrop-filter: blur(12px)`, bottom border `--border-subtle`.
- Logo (52px height, 40px mobile), 5 nav links (17px, `--fg-2`, hover `--bosco-50` background), Acceder text link, Reservar primary button.
- Mobile: hamburger toggle reveals fullscreen menu sliding from below the bar.

### `Footer`
- `background: var(--bosco-900)`, `color: var(--fg-on-dark)`, padding 80/32px (56/24px mobile).
- 4-column grid (2-col on mobile): logo+description+socials, Alquiler links, Ayuda links, Empresa links.
- Bottom row: copyright + Privacy/Cookie/Términos links, separated by 1px white-10% rule.

### `VehicleCard` (`.vehicle-card`)
- Border `--border-subtle`, `border-radius: var(--radius-lg)`, hover lifts 2px with `--shadow-lg`.
- 4:3 gradient photo placeholder on top, body padding 20px.
- Title row (name + star + rating), meta row (icon + type, icon + plazas, icon + city), price row (`€XXX / día` with serif/bold mix + premium badge).

### `SearchBar` (`.searchbar`)
- White elevated card, 5-column grid, each cell shows uppercase 10px label above the value.
- Cells get `--crema-100` background on hover; the divider between hovered + adjacent cell hides.
- Submit button is bosco primary with search icon. Mobile collapses to 2-col with full-width submit row.

### `Icon`
- Inline SVG component, 24×24 viewBox, `stroke="currentColor"`, default `stroke-width: 1.75`. Lucide-style geometry. Sizes: `.icon-sm` (16px), `.icon` (20px), `.icon-lg` (28px).

### Form primitives
- `.input`, `.select`, `.textarea`: white background, `--border-default` 1px, `--radius-sm`, padding 12/14, focus ring `--bosco-100` 3px + border `--bosco-500`.
- `.field-label`: 12px uppercase 600, `--tracking-caps`, color `--fg-3`.
- `.btn` variants: `--primary` (bosco), `--secondary` (white + border), `--ghost`, `--accent` (sole on dark text), `--inverse` (crema on dark surfaces). Sizes: `--lg` (16/28), default (14/22), `--sm` (10/16). `--block` for full-width.

### `Toast`
- Fixed bottom-center, `--bosco-900` bg, crema text, auto-dismiss 3.5s, slide-up entry.

### Step indicator (`.steps`)
- Horizontal row of `.step` blocks (28px circle + label) joined by 1px `.step-divider`.
- States: pending (border), active (bosco-900 fill, font-weight 600), done (bosco-700 fill + check icon).

## Interactions & Behavior

- **Routing**: hash router with scroll-to-top on every change. Replace with framework router in production.
- **Search bar submit**: serializes filters into query string, navigates to `/cerca?where=...&from=...&to=...&cat=...`.
- **Filter sidebar**: every change re-filters in-memory list synchronously and updates the count.
- **Booking flow**: client-side step state with per-step validation (dates required + chronological, name/surname/email/phone with regex). "Conferma" disabled until terms accepted. Generates pseudo-random booking code on confirm. Real implementation should POST to a reservation endpoint and handle Stripe/SCA preauth for the fianza.
- **FAQ accordion**: click toggles open state, chevron rotates 180°.
- **Mobile nav**: hamburger toggles `[data-open]` attr on `.mobile-menu`, auto-closes on route change.
- **Cards**: hover lifts 2px with shadow swap, transition 200ms `var(--ease-out)`.
- **Page transition**: 280ms fade + 8px translateY on every route change (`.page-enter` / `@keyframes pageIn`).

## State Management
Prototype uses local React state. For production:
- **Search filters** → URL state (query params), reflect in inputs.
- **Booking form** → multi-step form state, persist in `sessionStorage` so refresh during step 2 doesn't lose step-1 inputs.
- **Auth** → `/account` is stubbed; wire real auth (NextAuth or similar) before launch.
- **Fleet data** → currently hard-coded in `src/data.jsx`. Move to API/CMS (Sanity, Strapi, Directus). Each vehicle needs id, category, type, name, seats, sleeps, length, year, transmission, license, pricePerDay, deposit, location, rating, reviews, pet, premium, features[], summary, gallery[].

## Design Tokens

All tokens are defined in `colors_and_type.css` as CSS custom properties on `:root`. The full file is included in this bundle — copy it into your codebase or convert to your token format (Tailwind config, Style Dictionary, etc.).

### Color — Brand
| Token | Hex | Usage |
|---|---|---|
| `--bosco-700` | `#355C44` | `--brand` primary buttons, active states |
| `--bosco-800` | `#28503A` | `--brand-hover` |
| `--bosco-900` | `#1B3527` | Inverse panels, footer, primary text on light contrast |
| `--bosco-100` | `#E3EBDD` | `--brand-soft` chips, success backgrounds, gallery image placeholder |
| `--bosco-50` | `#F1F4EB` | Hover backgrounds |

### Color — Accent
| Token | Hex | Usage |
|---|---|---|
| `--sole-500` | `#F2B441` | `--accent` (warm yellow signature, decorative circles, accent buttons) |
| `--sole-400` | `#F6C76C` | Numerals on inverse panels |
| `--sole-100` | `#FDF1D5` | Premium badge background |

### Color — Secondary
| Token | Hex | Usage |
|---|---|---|
| `--cielo-700` | `#2C5F7A` | `--link` |
| `--cielo-100` | `#E3F0F4` | Pet friendly badge, gallery placeholder |
| `--terra-700` | `#8B4A2D` | Emergency phone color |
| `--terra-300` | `#E8B89A` | Avatar variant |
| `--terra-100` | `#F6E4D5` | Moto gallery placeholder, terra badge |

### Color — Neutrals
| Token | Hex | Usage |
|---|---|---|
| `--crema-50` | `#FBF8F1` | `--bg-page` (NEVER use pure white) |
| `--crema-100` | `#F5EFE3` | `--bg-sunken`, hover surfaces, testimonial card |
| `--bianco` | `#FFFFFF` | `--bg-elevated` cards/inputs only |
| `--inchiostro-900` | `#14201A` | `--fg-1` primary text |
| `--inchiostro-700` | `#3A4540` | `--fg-2` body text |
| `--inchiostro-500` | `#6B756F` | `--fg-3` meta/muted |
| `--inchiostro-200` | `#D4DAD5` | `--border-default` |
| `--inchiostro-100` | `#E8ECE7` | `--border-subtle` |

### Typography
- **Display**: `Instrument Serif` (regular, italic). Used for hero, h1, h2, large numerals, blockquotes. `font-weight: 400` always.
- **Body**: `Manrope` weights 300/400/500/600/700/800.
- **Mono**: `JetBrains Mono` for booking codes.
- Scale: 12 / 14 / 16 / 18 / 20 / 24 / 32 / 44 / 60 / 80 / 108 px.
- Tracking: `--tracking-tight: -0.02em` (display), `--tracking-snug: -0.01em` (h2/h3), `--tracking-caps: 0.12em` (eyebrows).
- Line heights: `--lh-tight: 1.05`, `--lh-snug: 1.2`, `--lh-base: 1.5`.

### Spacing (4px baseline)
4 / 8 / 12 / 16 / 20 / 24 / 32 / 40 / 48 / 64 / 80 / 96 / 128 px.

### Radii
4 (xs) / 8 (sm) / 12 (md) / 16 (lg) / 24 (xl) / 32 (2xl) / 999 (pill).

### Shadows (warm, low ink)
- `--shadow-xs`: `0 1px 2px rgba(20, 32, 26, 0.06)`
- `--shadow-sm`: `0 2px 6px rgba(20, 32, 26, 0.06), 0 1px 2px rgba(20, 32, 26, 0.04)`
- `--shadow-md`: `0 6px 16px rgba(20, 32, 26, 0.08), 0 2px 4px rgba(20, 32, 26, 0.04)`
- `--shadow-lg`: `0 16px 40px rgba(20, 32, 26, 0.10), 0 4px 12px rgba(20, 32, 26, 0.05)`
- `--shadow-xl`: `0 32px 80px rgba(20, 32, 26, 0.14), 0 8px 24px rgba(20, 32, 26, 0.06)`

### Motion
- Easing: `--ease-standard: cubic-bezier(0.2, 0, 0, 1)`, `--ease-out: cubic-bezier(0.16, 1, 0.3, 1)`.
- Duration: 120 / 200 / 360 ms.

### Layout
- `--container-max: 1280px`, `--container-pad: 32px` (20px mobile).
- Section padding: 96px desktop, 64px mobile.
- Footer top margin: 96px.

## Assets
- `assets/logo-ottibull.svg` — color logo (color icon + dark wordmark) for light backgrounds.
- `assets/logo-ottibull-light.svg` — for dark backgrounds (footer).
- `assets/logo-ottibull-mark.svg` — favicon / standalone mark.

All other "imagery" in this prototype is procedural (CSS gradients on `.veh-photo`). Production needs:
- 2–4 photos per vehicle (4:3 aspect for card hero, additional 1:1 for gallery thumbs).
- 1 destination image per destination (3:4).
- 1 hero image per story (16:9 or 4:3).
- Optional: Open Graph image per route.

## Internationalization
Currently Spanish copy is hard-coded in components. Extract to a translation layer (e.g. `next-intl`, `react-i18next`) with `es`, `it`, `en` keys. Italian source strings are preserved in this conversation's history if needed. Date inputs use `<input type="date">` which is locale-formatted by the browser.

## Files in this bundle
- `index.html` — entry point
- `app.css` — site-specific styles (~26 KB)
- `colors_and_type.css` — design system tokens (typography, color, spacing, motion)
- `src/data.jsx` — fleet, cities, destinations, stories (mock data)
- `src/components.jsx` — Icon, Logo, Nav, Footer, SearchBar, VehicleCard, Toast, PageHero
- `src/pages-1.jsx` — HomePage, SearchPage, VehiclePage
- `src/pages-2.jsx` — BookingPage, HowItWorksPage, AboutPage, ContactPage, StoriesPage, NotFoundPage
- `src/app.jsx` — hash router + App root
- `assets/` — logos
