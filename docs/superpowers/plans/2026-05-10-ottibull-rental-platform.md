# Otti Bull Rental Platform Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a trilingual (es/ca/en) Next.js 16 rental platform with public catalog, inquiry form (auto-email + wa.me click-to-chat), admin CRUD for vehicles, and full SEO. Spec: `docs/superpowers/specs/2026-05-10-ottibull-rental-platform-design.md`.

**Architecture:** Single Next.js App Router app on Vercel. Public routes statically rendered with ISR; admin routes dynamic with NextAuth credentials JWT auth. Mutations via Server Actions. PostgreSQL via Neon (Drizzle ORM). Images on Vercel Blob. Emails via Resend. i18n via next-intl with English-only paths (locale prefix only).

**Tech Stack:** Next.js 16 · TypeScript · Drizzle ORM · Neon Postgres · NextAuth (Auth.js v5) · next-intl · Vercel Blob · Resend + react-email · Tailwind CSS · Zod · Vitest · Playwright.

---

## File structure

```
.env.example                              # template (committed)
.env.local                                 # local dev (gitignored)
docker-compose.yml                        # local postgres
package.json
tsconfig.json
next.config.ts
tailwind.config.ts
postcss.config.mjs
drizzle.config.ts
vitest.config.ts
playwright.config.ts
.eslintrc.cjs
.prettierrc

src/
├── proxy.ts                              # Next 16 routing middleware (renamed from middleware.ts)
├── i18n/
│   ├── routing.ts                         # next-intl routing
│   └── request.ts                         # next-intl request config
├── db/
│   ├── client.ts
│   └── schema.ts
├── lib/
│   ├── auth.ts                            # NextAuth + requireAdminSession
│   ├── email.ts                           # Resend wrapper
│   ├── hmac.ts                            # sign/verify wa.me payload
│   ├── whatsapp.ts                        # URL builder
│   ├── whatsapp-templates/{es,ca,en}.ts
│   ├── seo.ts                             # generateMetadata helpers
│   ├── inquiry-schema.ts                  # Zod
│   ├── vehicle-attributes.ts              # Zod schemas per type
│   ├── vehicle-form-schema.ts             # Zod for admin form
│   └── rate-limit.ts                      # in-memory limiter
├── app/
│   ├── layout.tsx
│   ├── [locale]/
│   │   ├── layout.tsx
│   │   ├── page.tsx                       # home
│   │   ├── catalog/page.tsx
│   │   ├── vehicles/[slug]/page.tsx
│   │   ├── vehicles/[slug]/opengraph-image.tsx
│   │   ├── thank-you/page.tsx
│   │   ├── privacy/page.mdx
│   │   └── terms/page.mdx
│   ├── admin/
│   │   ├── layout.tsx
│   │   ├── page.tsx                       # dashboard
│   │   ├── login/page.tsx
│   │   ├── logout/route.ts
│   │   ├── vehicles/new/page.tsx
│   │   └── vehicles/[id]/page.tsx
│   ├── api/
│   │   ├── auth/[...nextauth]/route.ts
│   │   └── blob-upload/route.ts
│   ├── actions/
│   │   ├── inquiries.ts
│   │   ├── vehicles.ts
│   │   └── auth.ts
│   ├── sitemap.ts
│   ├── robots.ts
│   └── opengraph-image.tsx
├── components/
│   ├── public/{Header,Footer,LanguageSwitcher,VehicleCard,CatalogGrid,CatalogFilters,VehicleGallery,VehicleAttributeTable,InquiryForm,WhatsAppButton}.tsx
│   └── admin/{AdminNav,VehicleListTable,VehicleForm,VehicleAttributesFields,VehicleTranslationsTabs,ImageUploader,ImageGalleryManager,LoginForm}.tsx
├── emails/
│   ├── inquiry-received.tsx
│   └── components/Layout.tsx
├── messages/{es,ca,en}.json
├── drizzle/migrations/                    # generated
├── scripts/seed-admin.ts
└── tests/
    ├── unit/lib/{whatsapp,seo,hmac,vehicle-attributes}.test.ts
    ├── integration/actions/{inquiries,vehicles,auth}.test.ts
    └── e2e/{public,admin}.spec.ts
```

---

## Phase 1 — Foundation

### Task 1: Bootstrap Next.js 16 project

**Files:**
- Create: `package.json`, `tsconfig.json`, `next.config.ts`, `tailwind.config.ts`, `postcss.config.mjs`, `.eslintrc.cjs`, `.prettierrc`
- Create: `src/app/layout.tsx`, `src/app/page.tsx` (placeholder), `src/app/globals.css`

- [ ] **Step 1: Run create-next-app non-interactively**

```bash
cd /Users/alessiodanna/projects/ottibul-caravani
pnpm create next-app@latest . --typescript --tailwind --app --src-dir --import-alias "@/*" --no-eslint --use-pnpm --yes
```

Confirm overwrite of existing `.gitignore` and accept defaults. If `pnpm create` fails because the dir is non-empty, scaffold into a tmp dir and copy files over (preserve the existing `docs/`, `.git/`, `.gitignore`, `.idea/`, the zip).

- [ ] **Step 2: Pin Next.js 16 and install runtime deps**

```bash
pnpm add next@^16 react@^19 react-dom@^19
pnpm add drizzle-orm pg next-auth@beta bcryptjs zod next-intl resend @react-email/components @react-email/render @vercel/blob libphonenumber-js react-markdown p-retry
pnpm add -D drizzle-kit @types/pg vitest @vitest/ui @playwright/test eslint@^9 eslint-config-next prettier prettier-plugin-tailwindcss tsx react-email dotenv-cli
```

We use `pg` (node-postgres) as the Postgres driver instead of `@neondatabase/serverless` so the **exact same code** runs against:
- a local Docker Postgres in dev (Task 2.5),
- Neon via its standard pooler endpoint in production (Vercel Fluid Compute is Node.js, supports TCP).

Notes:
- `react-email` is the CLI (used only for local template preview), so it's a dev dep.
- `@vercel/og` is **not** needed: Next 16 ships `next/og` natively (we'll `import { ImageResponse } from 'next/og'`).
- `@types/bcryptjs` is **not** needed: `bcryptjs@^3` bundles its own types.
- `eslint` is pinned to `^9` because `eslint-config-next@16` peer-caps at 9; ESLint 10 is incompatible.

- [ ] **Step 3: Configure TypeScript paths and strictness**

Edit `tsconfig.json`:
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": false,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "baseUrl": ".",
    "paths": { "@/*": ["./src/*"] }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

- [ ] **Step 4: Add base scripts to package.json**

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "eslint .",
    "format": "prettier --write .",
    "format:check": "prettier --check .",
    "typecheck": "tsc --noEmit",
    "test": "vitest run --passWithNoTests",
    "test:watch": "vitest",
    "test:e2e": "playwright test",
    "db:generate": "dotenv -e .env.local -- drizzle-kit generate",
    "db:migrate": "dotenv -e .env.local -- drizzle-kit migrate",
    "db:studio": "dotenv -e .env.local -- drizzle-kit studio",
    "db:seed:admin": "dotenv -e .env.local -- tsx scripts/seed-admin.ts"
  }
}
```

Notes:
- `lint` is `eslint .` (not `next lint`) because Next 16 removed the `next lint` command.
- `format:check` and `typecheck` are CI-friendly read-only equivalents of `format` and the build's type-check.
- `test` includes `--passWithNoTests` so CI doesn't fail before any test files exist.
- The `db:*` scripts are wrapped with `dotenv -e .env.local --` (from `dotenv-cli`, dev dep) because drizzle-kit and `tsx` do not auto-load `.env.local`. This way `pnpm db:migrate` Just Works from a clean shell. Production (Vercel/CI) sets env vars natively, so `dotenv -e` becomes a no-op there if `.env.local` doesn't exist.

- [ ] **Step 5: Verify dev server boots**

Run: `pnpm dev`
Expected: server on http://localhost:3000, default Next.js page renders.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "chore: bootstrap Next.js 16 project with TypeScript, Tailwind, deps"
```

---

### Task 2: Environment variables template

**Files:**
- Create: `.env.example`
- Modify: `.gitignore` (already excludes `.env.local`)

- [ ] **Step 1: Create `.env.example`**

```bash
# Database
# Local dev (Docker, see Task 2.5):
#   postgresql://ottibull:ottibull@localhost:5432/ottibull
# Production (Neon via Vercel Marketplace, auto-provisioned):
#   postgresql://user:pass@host/db?sslmode=require
DATABASE_URL="postgresql://ottibull:ottibull@localhost:5432/ottibull"

# Auth
AUTH_SECRET=""              # openssl rand -base64 32
AUTH_URL="http://localhost:3000"

# Email
RESEND_API_KEY=""
EMAIL_FROM="noreply@ottibull.com"

# Owner notifications
OWNER_EMAIL="info@ottibull.com"
OWNER_WHATSAPP="34666123456"   # E.164 without +

# Vercel Blob
BLOB_READ_WRITE_TOKEN=""

# Public
NEXT_PUBLIC_SITE_URL="http://localhost:3000"
```

- [ ] **Step 2: Create local `.env.local` (gitignored) with dev values**

User fills `AUTH_SECRET` (`openssl rand -base64 32`) and any other values they have. The `DATABASE_URL` from `.env.example` already points at the local Docker DB (Task 2.5). Commit only the example.

- [ ] **Step 3: Commit**

```bash
git add .env.example
git commit -m "chore: add env vars template"
```

---

### Task 2.5: Local Postgres via Docker

**Files:**
- Create: `docker-compose.yml`
- Modify: `package.json` (add db:up/db:down scripts)
- Modify: `README.md` (or create) with quick-start

- [ ] **Step 1: docker-compose.yml**

Create `docker-compose.yml`:
```yaml
services:
  postgres:
    image: postgres:16-alpine
    container_name: ottibull-postgres
    restart: unless-stopped
    environment:
      POSTGRES_USER: ottibull
      POSTGRES_PASSWORD: ottibull
      POSTGRES_DB: ottibull
    ports:
      - "5432:5432"
    volumes:
      - ottibull-pgdata:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ottibull -d ottibull"]
      interval: 5s
      timeout: 3s
      retries: 10

volumes:
  ottibull-pgdata:
```

Why postgres:16: matches Neon's default major version, so behavior parity between dev and prod. Volume named `ottibull-pgdata` survives container restarts.

- [ ] **Step 2: Add scripts**

Add to `package.json` `scripts`:
```json
"db:up": "docker compose up -d postgres",
"db:down": "docker compose down",
"db:logs": "docker compose logs -f postgres",
"db:reset": "docker compose down -v && docker compose up -d postgres"
```

- [ ] **Step 3: Boot the DB**

```bash
pnpm db:up
docker compose ps        # expect 'postgres' service Up (healthy)
```

If port 5432 is in use locally (another Postgres running), change the host port mapping in `docker-compose.yml` to e.g. `5433:5432` and update `DATABASE_URL` accordingly.

- [ ] **Step 4: Smoke test connection**

```bash
docker compose exec postgres psql -U ottibull -d ottibull -c "SELECT version();"
```
Expected: prints PostgreSQL 16.x output.

- [ ] **Step 5: Commit**

```bash
git add docker-compose.yml package.json
git commit -m "chore(db): docker-compose for local postgres"
```

---

### Task 3: Database — Drizzle setup + schema

**Files:**
- Create: `drizzle.config.ts`, `src/db/client.ts`, `src/db/schema.ts`

- [ ] **Step 1: Drizzle config**

Create `drizzle.config.ts`:
```ts
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './src/db/schema.ts',
  out: './drizzle/migrations',
  dialect: 'postgresql',
  dbCredentials: { url: process.env.DATABASE_URL! },
  strict: true,
  verbose: true,
});
```

- [ ] **Step 2: DB client**

Create `src/db/client.ts`:
```ts
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not set');
}

declare global {
  var __pgPool: Pool | undefined;
}

const pool =
  globalThis.__pgPool ??
  new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 10,
    idleTimeoutMillis: 30_000,
  });

if (process.env.NODE_ENV !== 'production') globalThis.__pgPool = pool;

export const db = drizzle(pool, { schema });
```

The `globalThis.__pgPool` cache keeps the pool alive across HMR reloads in dev (avoids "too many clients" after a few file edits). In production on Vercel Fluid Compute, a fresh pool is created per cold start and reused across concurrent requests on the same instance — exactly what we want.

- [ ] **Step 3: Schema definition**

Create `src/db/schema.ts`:
```ts
import {
  pgTable, pgEnum, uuid, text, integer, numeric, boolean,
  timestamp, jsonb, uniqueIndex, index,
} from 'drizzle-orm/pg-core';
import { relations, sql } from 'drizzle-orm';

export const vehicleType = pgEnum('vehicle_type', [
  'camper', 'motorcycle', 'car', 'bicycle', 'boat',
]);

export const vehicleStatus = pgEnum('vehicle_status', ['draft', 'published']);

export const localeEnum = pgEnum('locale', ['es', 'ca', 'en']);

export const adminUsers = pgTable('admin_users', {
  id: uuid('id').defaultRandom().primaryKey(),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  name: text('name'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

export const vehicles = pgTable(
  'vehicles',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    slug: text('slug').notNull().unique(),
    type: vehicleType('type').notNull(),
    basePricePerDay: numeric('base_price_per_day', { precision: 10, scale: 2 }).notNull(),
    minRentalDays: integer('min_rental_days').default(1).notNull(),
    maxRentalDays: integer('max_rental_days'),
    location: text('location').notNull(),
    attributes: jsonb('attributes').notNull().default(sql`'{}'::jsonb`),
    status: vehicleStatus('status').default('draft').notNull(),
    featured: boolean('featured').default(false).notNull(),
    sortOrder: integer('sort_order').default(0).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => ({
    statusIdx: index('vehicles_status_idx').on(t.status),
    typeIdx: index('vehicles_type_idx').on(t.type),
  }),
);

export const vehicleTranslations = pgTable(
  'vehicle_translations',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    vehicleId: uuid('vehicle_id').notNull().references(() => vehicles.id, { onDelete: 'cascade' }),
    locale: localeEnum('locale').notNull(),
    title: text('title').notNull(),
    description: text('description').notNull(),
    metaTitle: text('meta_title'),
    metaDescription: text('meta_description'),
  },
  (t) => ({
    vehicleLocaleUnique: uniqueIndex('vehicle_translations_vehicle_locale_unique').on(
      t.vehicleId,
      t.locale,
    ),
  }),
);

export const vehicleImages = pgTable('vehicle_images', {
  id: uuid('id').defaultRandom().primaryKey(),
  vehicleId: uuid('vehicle_id').notNull().references(() => vehicles.id, { onDelete: 'cascade' }),
  url: text('url').notNull(),
  altText: text('alt_text'),
  sortOrder: integer('sort_order').default(0).notNull(),
  isCover: boolean('is_cover').default(false).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

export const vehiclesRelations = relations(vehicles, ({ many }) => ({
  translations: many(vehicleTranslations),
  images: many(vehicleImages),
}));

export const vehicleTranslationsRelations = relations(vehicleTranslations, ({ one }) => ({
  vehicle: one(vehicles, { fields: [vehicleTranslations.vehicleId], references: [vehicles.id] }),
}));

export const vehicleImagesRelations = relations(vehicleImages, ({ one }) => ({
  vehicle: one(vehicles, { fields: [vehicleImages.vehicleId], references: [vehicles.id] }),
}));
```

- [ ] **Step 4: Generate first migration**

Run: `pnpm db:generate`
Expected: file created in `drizzle/migrations/0000_*.sql` containing CREATE TABLE for all tables.

- [ ] **Step 5: Apply migration locally**

Set `DATABASE_URL` in `.env.local` to a Neon dev branch URL (or local Postgres). Run:
```bash
pnpm db:migrate
```
Expected: migration applies cleanly.

- [ ] **Step 6: Commit**

```bash
git add drizzle.config.ts src/db/ drizzle/
git commit -m "feat(db): drizzle schema and initial migration"
```

---

### Task 4: i18n — next-intl routing + middleware

**Files:**
- Create: `src/i18n/routing.ts`, `src/i18n/request.ts`, `src/proxy.ts`
- Create: `src/messages/{es,ca,en}.json`
- Modify: `next.config.ts`

- [ ] **Step 1: i18n routing config**

Create `src/i18n/routing.ts`:
```ts
import { defineRouting } from 'next-intl/routing';

export const routing = defineRouting({
  locales: ['es', 'ca', 'en'] as const,
  defaultLocale: 'es',
  localePrefix: 'always',
});

export type Locale = (typeof routing.locales)[number];
```

- [ ] **Step 2: Request config**

Create `src/i18n/request.ts`:
```ts
import { getRequestConfig } from 'next-intl/server';
import { routing } from './routing';

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = routing.locales.includes(requested as 'es' | 'ca' | 'en')
    ? (requested as 'es' | 'ca' | 'en')
    : routing.defaultLocale;

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
  };
});
```

- [ ] **Step 3: Initial messages files**

Create `src/messages/es.json`:
```json
{
  "common": {
    "brand": "Otti Bull",
    "tagline": "Alquiler de Autocaravanas Premium en Barcelona"
  },
  "nav": {
    "home": "Inicio",
    "catalog": "Catálogo",
    "contact": "Contacto"
  },
  "home": {
    "metaTitle": "Otti Bull · Alquiler de Autocaravanas en Barcelona",
    "metaDescription": "Alquila autocaravanas y motos premium en Barcelona. Reserva fácil, atención personalizada.",
    "heroTitle": "Tu próxima aventura empieza aquí",
    "heroSubtitle": "Autocaravanas y motos para alquilar en Barcelona",
    "ctaCatalog": "Ver catálogo"
  },
  "catalog": {
    "metaTitle": "Catálogo de Vehículos | Otti Bull",
    "metaDescription": "Explora nuestra flota de autocaravanas, motos y más en alquiler en Barcelona.",
    "title": "Nuestra flota",
    "filterAll": "Todos",
    "filterCamper": "Autocaravanas",
    "filterMotorcycle": "Motos",
    "filterCar": "Coches",
    "filterBicycle": "Bicicletas",
    "filterBoat": "Barcos",
    "fromPrice": "desde {price} €/día",
    "empty": "No hay vehículos que coincidan con los filtros."
  },
  "vehicle": {
    "fromPrice": "desde {price} €/día",
    "minDays": "Mínimo {days} días",
    "location": "Ubicación",
    "requestQuote": "Solicitar presupuesto"
  },
  "form": {
    "name": "Nombre completo",
    "email": "Email",
    "phone": "Teléfono",
    "checkIn": "Fecha de entrada",
    "checkOut": "Fecha de salida",
    "guests": "Número de personas",
    "message": "Mensaje (opcional)",
    "consent": "Acepto la política de privacidad",
    "submit": "Enviar solicitud",
    "errorRequired": "Campo obligatorio",
    "errorEmail": "Email no válido",
    "errorPhone": "Teléfono no válido",
    "errorDates": "La fecha de salida debe ser posterior a la de entrada"
  },
  "thankYou": {
    "title": "¡Solicitud enviada!",
    "body": "Hemos recibido tu solicitud por email. Para acelerar la respuesta, también puedes contactarnos directamente por WhatsApp:",
    "whatsapp": "Continuar en WhatsApp",
    "back": "Volver al catálogo"
  },
  "footer": {
    "rights": "Todos los derechos reservados.",
    "privacy": "Política de privacidad",
    "terms": "Términos y condiciones"
  }
}
```

Create `src/messages/ca.json` and `src/messages/en.json` with the same keys, translated. (Engineer translates; if uncertain, use Spanish original as comment and ask user.)

`ca.json` Catalan translations:
- `common.tagline`: "Lloguer d'Autocaravanes Premium a Barcelona"
- `nav`: "Inici", "Catàleg", "Contacte"
- `catalog.title`: "La nostra flota"
- `vehicle.requestQuote`: "Sol·licitar pressupost"
- ... (full set, mirror structure)

`en.json` English translations:
- `common.tagline`: "Premium Camper Rentals in Barcelona"
- `nav`: "Home", "Catalog", "Contact"
- `catalog.title`: "Our fleet"
- `vehicle.requestQuote`: "Request a quote"
- ...

- [ ] **Step 4: Middleware**

Create `src/proxy.ts`:
```ts
import createMiddleware from 'next-intl/middleware';
import { NextRequest, NextResponse } from 'next/server';
import { routing } from './i18n/routing';
import { getToken } from 'next-auth/jwt';

const intlMiddleware = createMiddleware(routing);

export default async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (pathname.startsWith('/admin')) {
    if (pathname === '/admin/login') return NextResponse.next();
    const token = await getToken({ req, secret: process.env.AUTH_SECRET });
    if (!token) {
      const url = new URL('/admin/login', req.url);
      url.searchParams.set('next', pathname);
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  if (pathname.startsWith('/api')) return NextResponse.next();

  return intlMiddleware(req);
}

export const config = {
  matcher: ['/((?!_next|.*\\..*).*)'],
};
```

- [ ] **Step 5: Wire next-intl plugin in next.config.ts**

Edit `next.config.ts`:
```ts
import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [{ protocol: 'https', hostname: '*.public.blob.vercel-storage.com' }],
  },
};

export default withNextIntl(nextConfig);
```

- [ ] **Step 6: Verify build does not error on i18n config**

Run: `pnpm build`
Expected: build succeeds (will fail later due to missing pages, that's fine for now — just confirm i18n config loads).

- [ ] **Step 7: Commit**

```bash
git add src/i18n src/messages src/proxy.ts next.config.ts
git commit -m "feat(i18n): next-intl with es/ca/en, middleware with admin guard"
```

---

## Phase 2 — Auth & admin scaffold

### Task 5: NextAuth config + login Server Action

**Files:**
- Create: `src/lib/auth.ts`, `src/app/api/auth/[...nextauth]/route.ts`, `src/app/actions/auth.ts`
- Create: `src/app/admin/login/page.tsx`, `src/app/admin/logout/route.ts`
- Create: `src/components/admin/LoginForm.tsx`

- [ ] **Step 1: NextAuth config**

Create `src/lib/auth.ts`:
```ts
import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '@/db/client';
import { adminUsers } from '@/db/schema';

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: 'jwt', maxAge: 7 * 24 * 60 * 60, updateAge: 24 * 60 * 60 },
  pages: { signIn: '/admin/login' },
  providers: [
    Credentials({
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      authorize: async (raw) => {
        const parsed = credentialsSchema.safeParse(raw);
        if (!parsed.success) return null;
        const { email, password } = parsed.data;

        const [user] = await db
          .select()
          .from(adminUsers)
          .where(eq(adminUsers.email, email))
          .limit(1);
        if (!user) return null;

        const ok = await bcrypt.compare(password, user.passwordHash);
        if (!ok) return null;

        return { id: user.id, email: user.email, name: user.name ?? undefined };
      },
    }),
  ],
});

export async function requireAdminSession() {
  const session = await auth();
  if (!session?.user) {
    throw new Error('UNAUTHORIZED');
  }
  return session;
}
```

- [ ] **Step 2: NextAuth route handler**

Create `src/app/api/auth/[...nextauth]/route.ts`:
```ts
import { handlers } from '@/lib/auth';

export const { GET, POST } = handlers;
```

- [ ] **Step 3: Login Server Action**

Create `src/app/actions/auth.ts`:
```ts
'use server';

import { z } from 'zod';
import { signIn } from '@/lib/auth';
import { AuthError } from 'next-auth';

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
  next: z.string().optional(),
});

export type LoginState = { error?: string };

export async function loginAction(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const parsed = schema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
    next: formData.get('next') ?? '/admin',
  });
  if (!parsed.success) return { error: 'Datos no válidos' };

  try {
    await signIn('credentials', {
      email: parsed.data.email,
      password: parsed.data.password,
      redirectTo: parsed.data.next ?? '/admin',
    });
  } catch (err) {
    if (err instanceof AuthError) return { error: 'Credenciales incorrectas' };
    throw err;
  }
  return {};
}
```

- [ ] **Step 4: Login form component**

Create `src/components/admin/LoginForm.tsx`:
```tsx
'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { loginAction, type LoginState } from '@/app/actions/auth';

const initial: LoginState = {};

export function LoginForm({ next }: { next?: string }) {
  const [state, action] = useFormState(loginAction, initial);
  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="next" value={next ?? '/admin'} />
      <div>
        <label className="block text-sm font-medium">Email</label>
        <input name="email" type="email" required className="w-full border p-2" />
      </div>
      <div>
        <label className="block text-sm font-medium">Password</label>
        <input name="password" type="password" required className="w-full border p-2" />
      </div>
      {state.error && <p className="text-red-600">{state.error}</p>}
      <SubmitBtn />
    </form>
  );
}

function SubmitBtn() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="w-full bg-black text-white py-2">
      {pending ? '...' : 'Login'}
    </button>
  );
}
```

- [ ] **Step 5: Login page**

Create `src/app/admin/login/page.tsx`:
```tsx
import { LoginForm } from '@/components/admin/LoginForm';

export const metadata = {
  title: 'Admin Login · Otti Bull',
  robots: { index: false, follow: false },
};

export default function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  return (
    <main className="mx-auto max-w-sm p-6">
      <h1 className="text-2xl mb-4">Admin Login</h1>
      <AsyncLogin searchParams={searchParams} />
    </main>
  );
}

async function AsyncLogin({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const sp = await searchParams;
  return <LoginForm next={sp.next} />;
}
```

- [ ] **Step 6: Logout route**

Create `src/app/admin/logout/route.ts`:
```ts
import { signOut } from '@/lib/auth';
import { NextResponse } from 'next/server';

export async function POST() {
  await signOut({ redirect: false });
  return NextResponse.redirect(new URL('/admin/login', process.env.AUTH_URL!));
}
```

- [ ] **Step 7: Manual smoke test (no DB user yet — expect failure)**

Run: `pnpm dev`, visit `http://localhost:3000/admin/login`, submit dummy creds.
Expected: form shows "Credenciales incorrectas" (no admin user seeded yet).

- [ ] **Step 8: Commit**

```bash
git add src/lib/auth.ts src/app/api/auth src/app/admin/login src/app/admin/logout src/app/actions/auth.ts src/components/admin/LoginForm.tsx
git commit -m "feat(auth): NextAuth credentials provider + login form"
```

---

### Task 6: Admin user seed script

**Files:**
- Create: `scripts/seed-admin.ts`

- [ ] **Step 1: Seed script**

Create `scripts/seed-admin.ts`:
```ts
import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { db } from '../src/db/client';
import { adminUsers } from '../src/db/schema';
import { eq } from 'drizzle-orm';

async function main() {
  const args = Object.fromEntries(
    process.argv
      .slice(2)
      .map((a) => a.split('='))
      .map(([k, v]) => [k.replace(/^--/, ''), v]),
  );
  const email = args.email;
  const password = args.password;
  const name = args.name ?? 'Admin';

  if (!email || !password) {
    console.error('Usage: pnpm db:seed:admin --email=... --password=... [--name=...]');
    process.exit(1);
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const [existing] = await db.select().from(adminUsers).where(eq(adminUsers.email, email)).limit(1);

  if (existing) {
    await db.update(adminUsers).set({ passwordHash, name }).where(eq(adminUsers.email, email));
    console.log(`Updated admin user: ${email}`);
  } else {
    await db.insert(adminUsers).values({ email, passwordHash, name });
    console.log(`Created admin user: ${email}`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
```

- [ ] **Step 2: Add `dotenv` for the script (already part of Node, but ensure `.env.local` is loaded)**

```bash
pnpm add -D dotenv
```

- [ ] **Step 3: Seed first admin**

Run: `pnpm db:seed:admin --email=admin@ottibull.com --password=changeme --name="Admin"`
Expected: "Created admin user: admin@ottibull.com".

- [ ] **Step 4: End-to-end manual login**

Run: `pnpm dev`, visit `/admin/login`, log in with seeded creds.
Expected: redirect to `/admin` (page doesn't exist yet — 404 is acceptable, confirms auth worked).

- [ ] **Step 5: Commit**

```bash
git add scripts/seed-admin.ts package.json
git commit -m "feat(auth): admin user seed script"
```

---

## Phase 3 — Public foundation

### Task 7: Root layouts + public Header/Footer

**Files:**
- Modify: `src/app/layout.tsx`
- Create: `src/app/[locale]/layout.tsx`
- Create: `src/components/public/Header.tsx`, `src/components/public/Footer.tsx`, `src/components/public/LanguageSwitcher.tsx`
- Modify: `src/app/page.tsx` → redirect

- [ ] **Step 1: Root layout (locale-agnostic)**

Replace `src/app/layout.tsx`:
```tsx
import type { ReactNode } from 'react';
import './globals.css';

export default function RootLayout({ children }: { children: ReactNode }) {
  return children;
}
```

- [ ] **Step 2: Locale layout**

Create `src/app/[locale]/layout.tsx`:
```tsx
import type { ReactNode } from 'react';
import { notFound } from 'next/navigation';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';
import { routing, type Locale } from '@/i18n/routing';
import { Header } from '@/components/public/Header';
import { Footer } from '@/components/public/Footer';
import '../globals.css';

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!routing.locales.includes(locale as Locale)) notFound();
  setRequestLocale(locale);

  const messages = await getMessages();

  return (
    <html lang={locale}>
      <body className="min-h-screen flex flex-col">
        <NextIntlClientProvider messages={messages}>
          <Header locale={locale as Locale} />
          <main className="flex-1">{children}</main>
          <Footer />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
```

- [ ] **Step 3: Header component**

Create `src/components/public/Header.tsx`:
```tsx
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import type { Locale } from '@/i18n/routing';
import { LanguageSwitcher } from './LanguageSwitcher';

export function Header({ locale }: { locale: Locale }) {
  const t = useTranslations('nav');
  const tBrand = useTranslations('common');
  return (
    <header className="border-b">
      <div className="mx-auto max-w-6xl px-4 py-4 flex items-center justify-between">
        <Link href={`/${locale}`} className="font-bold text-xl">
          {tBrand('brand')}
        </Link>
        <nav className="flex items-center gap-6">
          <Link href={`/${locale}`}>{t('home')}</Link>
          <Link href={`/${locale}/catalog`}>{t('catalog')}</Link>
          <LanguageSwitcher currentLocale={locale} />
        </nav>
      </div>
    </header>
  );
}
```

- [ ] **Step 4: Footer component**

Create `src/components/public/Footer.tsx`:
```tsx
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';

export function Footer() {
  const locale = useLocale();
  const t = useTranslations('footer');
  const tBrand = useTranslations('common');
  return (
    <footer className="border-t mt-12">
      <div className="mx-auto max-w-6xl px-4 py-6 flex flex-col md:flex-row justify-between gap-4 text-sm">
        <p>© {new Date().getFullYear()} {tBrand('brand')}. {t('rights')}</p>
        <div className="flex gap-4">
          <Link href={`/${locale}/privacy`}>{t('privacy')}</Link>
          <Link href={`/${locale}/terms`}>{t('terms')}</Link>
        </div>
      </div>
    </footer>
  );
}
```

- [ ] **Step 5: Language switcher**

Create `src/components/public/LanguageSwitcher.tsx`:
```tsx
'use client';

import { usePathname, useRouter } from 'next/navigation';
import type { Locale } from '@/i18n/routing';
import { routing } from '@/i18n/routing';

export function LanguageSwitcher({ currentLocale }: { currentLocale: Locale }) {
  const pathname = usePathname();
  const router = useRouter();
  const switchTo = (locale: Locale) => {
    const segments = pathname.split('/');
    segments[1] = locale;
    router.push(segments.join('/'));
  };
  return (
    <div className="flex gap-2 text-sm">
      {routing.locales.map((l) => (
        <button
          key={l}
          onClick={() => switchTo(l)}
          aria-current={l === currentLocale}
          className={l === currentLocale ? 'font-bold' : ''}
        >
          {l.toUpperCase()}
        </button>
      ))}
    </div>
  );
}
```

- [ ] **Step 6: Root page redirect**

Replace `src/app/page.tsx`:
```tsx
import { redirect } from 'next/navigation';
import { routing } from '@/i18n/routing';

export default function RootPage() {
  redirect(`/${routing.defaultLocale}`);
}
```

- [ ] **Step 7: Verify**

Run: `pnpm dev`. Visit `/` → redirects to `/es`. The `/es` page errors (no `[locale]/page.tsx` yet, that's next).

- [ ] **Step 8: Commit**

```bash
git add src/app/layout.tsx src/app/page.tsx src/app/[locale]/layout.tsx src/components/public/
git commit -m "feat(public): root layouts, header, footer, language switcher"
```

---

### Task 8: Home page

**Files:**
- Create: `src/app/[locale]/page.tsx`

- [ ] **Step 1: Home page**

Create `src/app/[locale]/page.tsx`:
```tsx
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { setRequestLocale } from 'next-intl/server';
import { eq, and, desc } from 'drizzle-orm';
import { db } from '@/db/client';
import { vehicles } from '@/db/schema';
import { VehicleCard } from '@/components/public/VehicleCard';
import { type Locale } from '@/i18n/routing';

export const dynamic = 'force-static';

export default async function Home({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  const featured = await db.query.vehicles.findMany({
    where: and(eq(vehicles.status, 'published'), eq(vehicles.featured, true)),
    with: { translations: true, images: true },
    orderBy: [desc(vehicles.sortOrder)],
    limit: 6,
  });

  return <HomeUI locale={locale as Locale} featured={featured} />;
}

function HomeUI({ locale, featured }: { locale: Locale; featured: Awaited<ReturnType<typeof db.query.vehicles.findMany>> }) {
  const t = useTranslations('home');
  return (
    <>
      <section className="bg-gray-100 py-20">
        <div className="mx-auto max-w-6xl px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-4">{t('heroTitle')}</h1>
          <p className="text-xl mb-8">{t('heroSubtitle')}</p>
          <Link href={`/${locale}/catalog`} className="inline-block bg-black text-white px-6 py-3">
            {t('ctaCatalog')}
          </Link>
        </div>
      </section>
      {featured.length > 0 && (
        <section className="py-12">
          <div className="mx-auto max-w-6xl px-4">
            <h2 className="text-2xl mb-6">Featured</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featured.map((v) => (
                <VehicleCard key={v.id} vehicle={v} locale={locale} />
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
```

- [ ] **Step 2: VehicleCard component**

Create `src/components/public/VehicleCard.tsx`:
```tsx
import Link from 'next/link';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import type { Locale } from '@/i18n/routing';

type VehicleWithRels = {
  id: string;
  slug: string;
  type: 'camper' | 'motorcycle' | 'car' | 'bicycle' | 'boat';
  basePricePerDay: string;
  location: string;
  translations: { locale: 'es' | 'ca' | 'en'; title: string }[];
  images: { url: string; altText: string | null; isCover: boolean }[];
};

export function VehicleCard({ vehicle, locale }: { vehicle: VehicleWithRels; locale: Locale }) {
  const t = useTranslations('catalog');
  const title =
    vehicle.translations.find((tr) => tr.locale === locale)?.title ??
    vehicle.translations[0]?.title ??
    vehicle.slug;
  const cover = vehicle.images.find((i) => i.isCover) ?? vehicle.images[0];
  return (
    <Link href={`/${locale}/vehicles/${vehicle.slug}`} className="block border rounded overflow-hidden hover:shadow">
      {cover && (
        <div className="relative aspect-[4/3]">
          <Image src={cover.url} alt={cover.altText ?? title} fill sizes="(max-width: 768px) 100vw, 33vw" />
        </div>
      )}
      <div className="p-4">
        <h3 className="font-semibold">{title}</h3>
        <p className="text-sm text-gray-600">{vehicle.location}</p>
        <p className="text-sm mt-2">{t('fromPrice', { price: Number(vehicle.basePricePerDay) })}</p>
      </div>
    </Link>
  );
}
```

- [ ] **Step 3: Verify**

Run: `pnpm dev`, visit `/es`. Expected: hero renders. Featured section is empty (no vehicles seeded yet).

- [ ] **Step 4: Commit**

```bash
git add src/app/[locale]/page.tsx src/components/public/VehicleCard.tsx
git commit -m "feat(public): home page with featured vehicles"
```

---

## Phase 4 — Vehicle data layer

### Task 9: Vehicle attribute schemas (Zod, per type)

**Files:**
- Create: `src/lib/vehicle-attributes.ts`
- Create: `tests/unit/lib/vehicle-attributes.test.ts`

- [ ] **Step 1: Set up Vitest config**

Create `vitest.config.ts`:
```ts
import { defineConfig } from 'vitest/config';
import path from 'node:path';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['tests/**/*.test.ts'],
    coverage: { reporter: ['text', 'html'] },
  },
  resolve: {
    alias: { '@': path.resolve(__dirname, 'src') },
  },
});
```

- [ ] **Step 2: Write the failing tests**

Create `tests/unit/lib/vehicle-attributes.test.ts`:
```ts
import { describe, it, expect } from 'vitest';
import { vehicleAttributesSchemas, validateAttributes } from '@/lib/vehicle-attributes';

describe('vehicle attributes schemas', () => {
  it('accepts valid camper attributes', () => {
    const result = validateAttributes('camper', {
      berths: 4,
      travelSeats: 5,
      lengthM: 6.4,
      year: 2023,
      transmission: 'automatic',
      licenseRequired: 'B',
    });
    expect(result.success).toBe(true);
  });

  it('rejects camper with invalid berths', () => {
    const result = validateAttributes('camper', { berths: -1, year: 2020 });
    expect(result.success).toBe(false);
  });

  it('accepts valid motorcycle attributes', () => {
    const result = validateAttributes('motorcycle', {
      displacementCc: 650,
      year: 2022,
      licenseRequired: 'A2',
    });
    expect(result.success).toBe(true);
  });

  it('rejects unknown vehicle type', () => {
    expect(() => validateAttributes('spaceship' as never, {})).toThrow();
  });
});
```

- [ ] **Step 3: Run tests — expect failure**

Run: `pnpm test`
Expected: cannot find module `@/lib/vehicle-attributes`.

- [ ] **Step 4: Implement schemas**

Create `src/lib/vehicle-attributes.ts`:
```ts
import { z } from 'zod';

export const camperAttributes = z.object({
  berths: z.number().int().min(1).max(10),
  travelSeats: z.number().int().min(1).max(10),
  lengthM: z.number().min(2).max(15),
  year: z.number().int().min(1980).max(new Date().getFullYear() + 1),
  transmission: z.enum(['manual', 'automatic']),
  licenseRequired: z.enum(['B', 'C1', 'C']),
  hasKitchen: z.boolean().optional(),
  hasBathroom: z.boolean().optional(),
});

export const motorcycleAttributes = z.object({
  displacementCc: z.number().int().min(50).max(2500),
  year: z.number().int().min(1980).max(new Date().getFullYear() + 1),
  licenseRequired: z.enum(['AM', 'A1', 'A2', 'A']),
  helmetIncluded: z.boolean().optional(),
});

export const carAttributes = z.object({
  seats: z.number().int().min(2).max(9),
  year: z.number().int().min(1980).max(new Date().getFullYear() + 1),
  transmission: z.enum(['manual', 'automatic']),
});

export const bicycleAttributes = z.object({
  type: z.enum(['mtb', 'road', 'city', 'electric']),
  gears: z.number().int().min(1).max(30).optional(),
});

export const boatAttributes = z.object({
  lengthM: z.number().min(2).max(50),
  year: z.number().int().min(1970).max(new Date().getFullYear() + 1),
  licenseRequired: z.string().optional(),
  capacity: z.number().int().min(1).max(50),
});

export const vehicleAttributesSchemas = {
  camper: camperAttributes,
  motorcycle: motorcycleAttributes,
  car: carAttributes,
  bicycle: bicycleAttributes,
  boat: boatAttributes,
} as const;

export type VehicleType = keyof typeof vehicleAttributesSchemas;

export type CamperAttributes = z.infer<typeof camperAttributes>;
export type MotorcycleAttributes = z.infer<typeof motorcycleAttributes>;
export type CarAttributes = z.infer<typeof carAttributes>;
export type BicycleAttributes = z.infer<typeof bicycleAttributes>;
export type BoatAttributes = z.infer<typeof boatAttributes>;

export function validateAttributes(
  type: VehicleType,
  raw: unknown,
): { success: true; data: unknown } | { success: false; error: z.ZodError } {
  const schema = vehicleAttributesSchemas[type];
  if (!schema) throw new Error(`Unknown vehicle type: ${type}`);
  const result = schema.safeParse(raw);
  return result;
}
```

- [ ] **Step 5: Run tests — expect pass**

Run: `pnpm test tests/unit/lib/vehicle-attributes.test.ts`
Expected: 4 passing.

- [ ] **Step 6: Commit**

```bash
git add src/lib/vehicle-attributes.ts tests/unit/lib/vehicle-attributes.test.ts vitest.config.ts
git commit -m "feat(vehicles): zod schemas for type-specific attributes"
```

---

### Task 10: Catalog page

**Files:**
- Create: `src/app/[locale]/catalog/page.tsx`
- Create: `src/components/public/CatalogGrid.tsx`, `src/components/public/CatalogFilters.tsx`

- [ ] **Step 1: Catalog page**

Create `src/app/[locale]/catalog/page.tsx`:
```tsx
import { setRequestLocale, getTranslations } from 'next-intl/server';
import { eq, and, desc } from 'drizzle-orm';
import { db } from '@/db/client';
import { vehicles } from '@/db/schema';
import { CatalogGrid } from '@/components/public/CatalogGrid';
import { CatalogFilters } from '@/components/public/CatalogFilters';
import type { Locale } from '@/i18n/routing';
import type { VehicleType } from '@/lib/vehicle-attributes';

export const dynamic = 'force-static';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'catalog' });
  return {
    title: t('metaTitle'),
    description: t('metaDescription'),
    alternates: {
      canonical: `/${locale}/catalog`,
      languages: { es: '/es/catalog', ca: '/ca/catalog', en: '/en/catalog', 'x-default': '/es/catalog' },
    },
  };
}

const VALID_TYPES = ['camper', 'motorcycle', 'car', 'bicycle', 'boat'] as const;

export default async function CatalogPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ type?: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const sp = await searchParams;

  const typeFilter = VALID_TYPES.includes(sp.type as VehicleType) ? (sp.type as VehicleType) : undefined;

  const where = typeFilter
    ? and(eq(vehicles.status, 'published'), eq(vehicles.type, typeFilter))
    : eq(vehicles.status, 'published');

  const list = await db.query.vehicles.findMany({
    where,
    with: { translations: true, images: true },
    orderBy: [desc(vehicles.sortOrder), desc(vehicles.createdAt)],
  });

  const t = await getTranslations({ locale, namespace: 'catalog' });

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="text-3xl mb-6">{t('title')}</h1>
      <CatalogFilters locale={locale as Locale} active={typeFilter} />
      <CatalogGrid vehicles={list} locale={locale as Locale} />
    </div>
  );
}
```

- [ ] **Step 2: CatalogFilters (client)**

Create `src/components/public/CatalogFilters.tsx`:
```tsx
'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import type { Locale } from '@/i18n/routing';
import type { VehicleType } from '@/lib/vehicle-attributes';

const TYPES: VehicleType[] = ['camper', 'motorcycle', 'car', 'bicycle', 'boat'];

export function CatalogFilters({ locale, active }: { locale: Locale; active?: VehicleType }) {
  const t = useTranslations('catalog');
  return (
    <div className="flex gap-2 mb-6 flex-wrap">
      <Link
        href={`/${locale}/catalog`}
        className={`px-3 py-1 border ${!active ? 'bg-black text-white' : ''}`}
      >
        {t('filterAll')}
      </Link>
      {TYPES.map((tp) => (
        <Link
          key={tp}
          href={`/${locale}/catalog?type=${tp}`}
          className={`px-3 py-1 border ${active === tp ? 'bg-black text-white' : ''}`}
        >
          {t(`filter${tp.charAt(0).toUpperCase()}${tp.slice(1)}` as 'filterCamper')}
        </Link>
      ))}
    </div>
  );
}
```

- [ ] **Step 3: CatalogGrid**

Create `src/components/public/CatalogGrid.tsx`:
```tsx
import { VehicleCard } from './VehicleCard';
import type { Locale } from '@/i18n/routing';
import { useTranslations } from 'next-intl';

type VehicleWithRels = Parameters<typeof VehicleCard>[0]['vehicle'];

export function CatalogGrid({ vehicles, locale }: { vehicles: VehicleWithRels[]; locale: Locale }) {
  const t = useTranslations('catalog');
  if (vehicles.length === 0) return <p className="text-gray-600">{t('empty')}</p>;
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {vehicles.map((v) => (
        <VehicleCard key={v.id} vehicle={v} locale={locale} />
      ))}
    </div>
  );
}
```

- [ ] **Step 4: Verify**

Run: `pnpm dev`, visit `/es/catalog`. Expected: empty state shown ("No hay vehículos…").

- [ ] **Step 5: Commit**

```bash
git add src/app/[locale]/catalog src/components/public/CatalogGrid.tsx src/components/public/CatalogFilters.tsx
git commit -m "feat(public): catalog page with type filter"
```

---

### Task 11: Vehicle detail page (skeleton, no form yet)

**Files:**
- Create: `src/app/[locale]/vehicles/[slug]/page.tsx`
- Create: `src/components/public/VehicleGallery.tsx`, `src/components/public/VehicleAttributeTable.tsx`

- [ ] **Step 1: Vehicle detail page**

Create `src/app/[locale]/vehicles/[slug]/page.tsx`:
```tsx
import { notFound } from 'next/navigation';
import { setRequestLocale, getTranslations } from 'next-intl/server';
import { eq, and } from 'drizzle-orm';
import ReactMarkdown from 'react-markdown';
import { db } from '@/db/client';
import { vehicles } from '@/db/schema';
import { VehicleGallery } from '@/components/public/VehicleGallery';
import { VehicleAttributeTable } from '@/components/public/VehicleAttributeTable';
import type { Locale } from '@/i18n/routing';
import { routing } from '@/i18n/routing';

export const dynamic = 'force-static';

export async function generateStaticParams() {
  const all = await db.query.vehicles.findMany({
    where: eq(vehicles.status, 'published'),
    columns: { slug: true },
  });
  return routing.locales.flatMap((locale) =>
    all.map((v) => ({ locale, slug: v.slug })),
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const v = await db.query.vehicles.findFirst({
    where: and(eq(vehicles.slug, slug), eq(vehicles.status, 'published')),
    with: { translations: true, images: true },
  });
  if (!v) return {};
  const tr =
    v.translations.find((t) => t.locale === locale) ??
    v.translations.find((t) => t.locale === 'es')!;
  const cover = v.images.find((i) => i.isCover) ?? v.images[0];

  return {
    title: tr.metaTitle ?? `${tr.title} · Otti Bull`,
    description: tr.metaDescription ?? tr.description.slice(0, 160),
    alternates: {
      canonical: `/${locale}/vehicles/${slug}`,
      languages: Object.fromEntries(
        routing.locales.map((l) => [l, `/${l}/vehicles/${slug}`]),
      ),
    },
    openGraph: {
      title: tr.metaTitle ?? tr.title,
      description: tr.metaDescription ?? tr.description.slice(0, 160),
      images: cover ? [{ url: cover.url, width: 1200, height: 630, alt: cover.altText ?? tr.title }] : [],
      locale,
      type: 'website',
    },
  };
}

export default async function VehiclePage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const v = await db.query.vehicles.findFirst({
    where: and(eq(vehicles.slug, slug), eq(vehicles.status, 'published')),
    with: { translations: true, images: true },
  });
  if (!v) notFound();

  const tr =
    v.translations.find((t) => t.locale === locale) ??
    v.translations.find((t) => t.locale === 'es')!;
  const t = await getTranslations({ locale, namespace: 'vehicle' });

  // JSON-LD Product
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: tr.title,
    description: tr.description,
    image: v.images.map((i) => i.url),
    brand: { '@type': 'Brand', name: 'Otti Bull' },
    offers: {
      '@type': 'Offer',
      price: v.basePricePerDay,
      priceCurrency: 'EUR',
      availability: 'https://schema.org/InStock',
    },
  };

  return (
    <article className="mx-auto max-w-6xl px-4 py-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <h1 className="text-3xl mb-2">{tr.title}</h1>
      <p className="text-gray-600 mb-4">{v.location} · {t('fromPrice', { price: Number(v.basePricePerDay) })}</p>
      <VehicleGallery images={v.images} alt={tr.title} />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
        <div className="md:col-span-2 prose">
          <ReactMarkdown>{tr.description}</ReactMarkdown>
          <VehicleAttributeTable type={v.type} attributes={v.attributes as Record<string, unknown>} locale={locale as Locale} />
        </div>
        <aside id="inquiry" className="md:sticky md:top-4 self-start">
          {/* InquiryForm goes here in Task 14 */}
          <div className="border p-4">
            <p className="text-sm text-gray-500">Form en construcción</p>
          </div>
        </aside>
      </div>
    </article>
  );
}
```

- [ ] **Step 2: VehicleGallery**

Create `src/components/public/VehicleGallery.tsx`:
```tsx
'use client';

import { useState } from 'react';
import Image from 'next/image';

type Img = { url: string; altText: string | null; isCover: boolean };

export function VehicleGallery({ images, alt }: { images: Img[]; alt: string }) {
  const sorted = [...images].sort((a, b) => Number(b.isCover) - Number(a.isCover));
  const [active, setActive] = useState(0);
  if (sorted.length === 0) return null;
  return (
    <div>
      <div className="relative aspect-[16/9] mb-2">
        <Image src={sorted[active].url} alt={sorted[active].altText ?? alt} fill priority sizes="(max-width: 768px) 100vw, 66vw" />
      </div>
      <div className="flex gap-2 overflow-x-auto">
        {sorted.map((img, i) => (
          <button
            key={img.url}
            onClick={() => setActive(i)}
            className={`relative w-20 h-20 flex-shrink-0 ${i === active ? 'ring-2 ring-black' : ''}`}
            aria-label={`Image ${i + 1}`}
          >
            <Image src={img.url} alt={img.altText ?? alt} fill sizes="80px" />
          </button>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 3: VehicleAttributeTable**

Create `src/components/public/VehicleAttributeTable.tsx`:
```tsx
import { vehicleAttributesSchemas, type VehicleType } from '@/lib/vehicle-attributes';
import type { Locale } from '@/i18n/routing';

const ATTR_LABELS: Record<Locale, Record<string, string>> = {
  es: {
    berths: 'Plazas para dormir',
    travelSeats: 'Plazas de viaje',
    lengthM: 'Longitud (m)',
    year: 'Año',
    transmission: 'Transmisión',
    licenseRequired: 'Permiso requerido',
    hasKitchen: 'Cocina',
    hasBathroom: 'Baño',
    displacementCc: 'Cilindrada (cc)',
    helmetIncluded: 'Casco incluido',
    seats: 'Plazas',
    type: 'Tipo',
    gears: 'Marchas',
    capacity: 'Capacidad',
  },
  ca: {
    berths: 'Places per dormir',
    travelSeats: 'Places de viatge',
    lengthM: 'Longitud (m)',
    year: 'Any',
    transmission: 'Transmissió',
    licenseRequired: 'Permís requerit',
    hasKitchen: 'Cuina',
    hasBathroom: 'Bany',
    displacementCc: 'Cilindrada (cc)',
    helmetIncluded: 'Casc inclòs',
    seats: 'Places',
    type: 'Tipus',
    gears: 'Marxes',
    capacity: 'Capacitat',
  },
  en: {
    berths: 'Sleeping berths',
    travelSeats: 'Travel seats',
    lengthM: 'Length (m)',
    year: 'Year',
    transmission: 'Transmission',
    licenseRequired: 'License required',
    hasKitchen: 'Kitchen',
    hasBathroom: 'Bathroom',
    displacementCc: 'Displacement (cc)',
    helmetIncluded: 'Helmet included',
    seats: 'Seats',
    type: 'Type',
    gears: 'Gears',
    capacity: 'Capacity',
  },
};

export function VehicleAttributeTable({
  type,
  attributes,
  locale,
}: {
  type: VehicleType;
  attributes: Record<string, unknown>;
  locale: Locale;
}) {
  const schema = vehicleAttributesSchemas[type];
  const keys = Object.keys((schema as unknown as { shape: Record<string, unknown> }).shape ?? {});
  const labels = ATTR_LABELS[locale];

  return (
    <table className="w-full border-collapse my-6">
      <tbody>
        {keys
          .filter((k) => attributes[k] !== undefined && attributes[k] !== null)
          .map((k) => {
            const v = attributes[k];
            const display = typeof v === 'boolean' ? (v ? '✓' : '✗') : String(v);
            return (
              <tr key={k} className="border-b">
                <th className="text-left py-2 pr-4 font-medium">{labels[k] ?? k}</th>
                <td className="py-2">{display}</td>
              </tr>
            );
          })}
      </tbody>
    </table>
  );
}
```

- [ ] **Step 4: Verify**

Run: `pnpm dev`, navigate to a vehicle detail (need to seed one — skip for now, or open code path manually). 404 expected when no vehicles, that's fine. Build should succeed.

Run: `pnpm build`
Expected: build succeeds.

- [ ] **Step 5: Commit**

```bash
git add src/app/[locale]/vehicles src/components/public/VehicleGallery.tsx src/components/public/VehicleAttributeTable.tsx
git commit -m "feat(public): vehicle detail page with gallery and attributes table"
```

---

## Phase 5 — Inquiry flow

### Task 12: HMAC sign/verify utility

**Files:**
- Create: `src/lib/hmac.ts`
- Create: `tests/unit/lib/hmac.test.ts`

- [ ] **Step 1: Write failing tests**

Create `tests/unit/lib/hmac.test.ts`:
```ts
import { describe, it, expect, beforeAll } from 'vitest';
import { signPayload, verifyPayload } from '@/lib/hmac';

beforeAll(() => {
  process.env.AUTH_SECRET = 'test-secret-32-bytes-test-secret-32';
});

describe('hmac', () => {
  it('round-trips a payload', () => {
    const signed = signPayload({ url: 'https://wa.me/1?text=hi' });
    const result = verifyPayload(signed);
    expect(result.valid).toBe(true);
    expect(result.payload).toEqual({ url: 'https://wa.me/1?text=hi' });
  });

  it('rejects tampered signature', () => {
    const signed = signPayload({ url: 'a' });
    const [body] = signed.split('.');
    const tampered = `${body}.deadbeef00000000`;
    const result = verifyPayload(tampered);
    expect(result.valid).toBe(false);
  });

  it('rejects malformed token', () => {
    expect(verifyPayload('not-a-token').valid).toBe(false);
    expect(verifyPayload('').valid).toBe(false);
  });
});
```

- [ ] **Step 2: Run — expect failure**

Run: `pnpm test tests/unit/lib/hmac.test.ts`
Expected: cannot find module.

- [ ] **Step 3: Implement**

Create `src/lib/hmac.ts`:
```ts
import { createHmac, timingSafeEqual } from 'node:crypto';

function getSecret(): string {
  const s = process.env.AUTH_SECRET;
  if (!s) throw new Error('AUTH_SECRET not set');
  return s;
}

function base64url(buf: Buffer): string {
  return buf.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function fromBase64url(s: string): Buffer {
  const pad = s.length % 4 === 0 ? '' : '='.repeat(4 - (s.length % 4));
  return Buffer.from(s.replace(/-/g, '+').replace(/_/g, '/') + pad, 'base64');
}

export function signPayload(payload: unknown): string {
  const body = base64url(Buffer.from(JSON.stringify(payload), 'utf8'));
  const sig = base64url(createHmac('sha256', getSecret()).update(body).digest()).slice(0, 22);
  return `${body}.${sig}`;
}

export function verifyPayload<T = unknown>(
  token: string,
): { valid: true; payload: T } | { valid: false } {
  if (!token || !token.includes('.')) return { valid: false };
  const [body, sig] = token.split('.');
  const expected = base64url(createHmac('sha256', getSecret()).update(body).digest()).slice(0, 22);
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return { valid: false };
  try {
    const payload = JSON.parse(fromBase64url(body).toString('utf8')) as T;
    return { valid: true, payload };
  } catch {
    return { valid: false };
  }
}
```

- [ ] **Step 4: Run tests — expect pass**

Run: `pnpm test tests/unit/lib/hmac.test.ts`
Expected: 3 passing.

- [ ] **Step 5: Commit**

```bash
git add src/lib/hmac.ts tests/unit/lib/hmac.test.ts
git commit -m "feat(lib): hmac sign/verify for thank-you payload"
```

---

### Task 13: WhatsApp URL builder + locale templates

**Files:**
- Create: `src/lib/whatsapp.ts`, `src/lib/whatsapp-templates/{es,ca,en}.ts`
- Create: `tests/unit/lib/whatsapp.test.ts`

- [ ] **Step 1: Failing tests**

Create `tests/unit/lib/whatsapp.test.ts`:
```ts
import { describe, it, expect } from 'vitest';
import { buildWhatsAppUrl } from '@/lib/whatsapp';

describe('buildWhatsAppUrl', () => {
  const base = {
    ownerPhone: '34666123456',
    vehicleTitle: 'Fiat Ducato 2023',
    checkIn: new Date('2026-06-15'),
    checkOut: new Date('2026-06-22'),
    guests: 4,
    customerName: 'Mario Rossi',
    customerEmail: 'mario@example.com',
    customerPhone: '+39 123 4567890',
  };

  it('builds Spanish URL', () => {
    const url = buildWhatsAppUrl({ ...base, locale: 'es' });
    expect(url).toMatch(/^https:\/\/wa\.me\/34666123456\?text=/);
    const text = decodeURIComponent(url.split('text=')[1]);
    expect(text).toContain('Hola');
    expect(text).toContain('Fiat Ducato 2023');
    expect(text).toContain('Mario Rossi');
  });

  it('builds English URL', () => {
    const url = buildWhatsAppUrl({ ...base, locale: 'en' });
    const text = decodeURIComponent(url.split('text=')[1]);
    expect(text).toContain('Hello');
  });

  it('builds Catalan URL', () => {
    const url = buildWhatsAppUrl({ ...base, locale: 'ca' });
    const text = decodeURIComponent(url.split('text=')[1]);
    expect(text).toContain('Hola');
  });

  it('includes optional message when provided', () => {
    const url = buildWhatsAppUrl({ ...base, locale: 'es', message: 'Need pickup at airport' });
    const text = decodeURIComponent(url.split('text=')[1]);
    expect(text).toContain('Need pickup at airport');
  });
});
```

- [ ] **Step 2: Run — expect failure**

Run: `pnpm test tests/unit/lib/whatsapp.test.ts`. Expected: module not found.

- [ ] **Step 3: Implement templates**

Create `src/lib/whatsapp-templates/es.ts`:
```ts
import type { WhatsAppTemplateInput } from '../whatsapp';

export function renderEs(i: WhatsAppTemplateInput): string {
  const fmt = (d: Date) => d.toLocaleDateString('es-ES');
  let s = `Hola! Solicitud para «${i.vehicleTitle}» del ${fmt(i.checkIn)} al ${fmt(i.checkOut)} (${i.guests} personas).`;
  s += `\nMi nombre: ${i.customerName} · Email: ${i.customerEmail} · Tel: ${i.customerPhone}.`;
  if (i.message) s += `\n${i.message}`;
  return s;
}
```

Create `src/lib/whatsapp-templates/ca.ts`:
```ts
import type { WhatsAppTemplateInput } from '../whatsapp';

export function renderCa(i: WhatsAppTemplateInput): string {
  const fmt = (d: Date) => d.toLocaleDateString('ca-ES');
  let s = `Hola! Sol·licitud per a «${i.vehicleTitle}» del ${fmt(i.checkIn)} al ${fmt(i.checkOut)} (${i.guests} persones).`;
  s += `\nEm dic: ${i.customerName} · Email: ${i.customerEmail} · Tel: ${i.customerPhone}.`;
  if (i.message) s += `\n${i.message}`;
  return s;
}
```

Create `src/lib/whatsapp-templates/en.ts`:
```ts
import type { WhatsAppTemplateInput } from '../whatsapp';

export function renderEn(i: WhatsAppTemplateInput): string {
  const fmt = (d: Date) => d.toLocaleDateString('en-GB');
  let s = `Hello! Request for "${i.vehicleTitle}" from ${fmt(i.checkIn)} to ${fmt(i.checkOut)} (${i.guests} people).`;
  s += `\nMy name: ${i.customerName} · Email: ${i.customerEmail} · Tel: ${i.customerPhone}.`;
  if (i.message) s += `\n${i.message}`;
  return s;
}
```

- [ ] **Step 4: Implement builder**

Create `src/lib/whatsapp.ts`:
```ts
import type { Locale } from '@/i18n/routing';
import { renderEs } from './whatsapp-templates/es';
import { renderCa } from './whatsapp-templates/ca';
import { renderEn } from './whatsapp-templates/en';

export type WhatsAppTemplateInput = {
  vehicleTitle: string;
  checkIn: Date;
  checkOut: Date;
  guests: number;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  message?: string;
};

export type WhatsAppBuildInput = WhatsAppTemplateInput & {
  ownerPhone: string;
  locale: Locale;
};

export function buildWhatsAppUrl(i: WhatsAppBuildInput): string {
  const text = (i.locale === 'ca' ? renderCa : i.locale === 'en' ? renderEn : renderEs)(i);
  return `https://wa.me/${i.ownerPhone}?text=${encodeURIComponent(text)}`;
}
```

- [ ] **Step 5: Run tests — expect pass**

Run: `pnpm test tests/unit/lib/whatsapp.test.ts`
Expected: 4 passing.

- [ ] **Step 6: Commit**

```bash
git add src/lib/whatsapp.ts src/lib/whatsapp-templates tests/unit/lib/whatsapp.test.ts
git commit -m "feat(notifications): wa.me URL builder with locale templates"
```

---

### Task 14: Inquiry form component + Zod schema

**Files:**
- Create: `src/lib/inquiry-schema.ts`
- Create: `src/components/public/InquiryForm.tsx`
- Modify: `src/app/[locale]/vehicles/[slug]/page.tsx` to mount the form

- [ ] **Step 1: Inquiry Zod schema**

Create `src/lib/inquiry-schema.ts`:
```ts
import { z } from 'zod';
import { isValidPhoneNumber } from 'libphonenumber-js';

export const inquirySchema = z
  .object({
    vehicleId: z.string().uuid(),
    locale: z.enum(['es', 'ca', 'en']),
    name: z.string().min(2).max(120),
    email: z.string().email(),
    phone: z.string().refine((v) => isValidPhoneNumber(v), { message: 'invalid phone' }),
    checkIn: z.coerce.date(),
    checkOut: z.coerce.date(),
    guests: z.coerce.number().int().min(1).max(20),
    message: z.string().max(2000).optional().or(z.literal('')),
    consent: z
      .union([z.literal('on'), z.literal(true), z.literal('true')])
      .transform(() => true),
    websiteUrl: z.string().max(0).optional().default(''), // honeypot
  })
  .refine((d) => d.checkOut > d.checkIn, {
    message: 'checkOut must be after checkIn',
    path: ['checkOut'],
  });

export type InquiryInput = z.infer<typeof inquirySchema>;
```

- [ ] **Step 2: Inquiry form component**

Create `src/components/public/InquiryForm.tsx`:
```tsx
'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { useTranslations } from 'next-intl';
import type { Locale } from '@/i18n/routing';
import { submitInquiryAction, type InquiryState } from '@/app/actions/inquiries';

const initial: InquiryState = {};

export function InquiryForm({ vehicleId, locale }: { vehicleId: string; locale: Locale }) {
  const [state, action] = useFormState(submitInquiryAction, initial);
  const t = useTranslations('form');
  return (
    <form action={action} className="space-y-3">
      <input type="hidden" name="vehicleId" value={vehicleId} />
      <input type="hidden" name="locale" value={locale} />
      {/* honeypot */}
      <input type="text" name="websiteUrl" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />
      <Field name="name" label={t('name')} type="text" required error={state.fieldErrors?.name} />
      <Field name="email" label={t('email')} type="email" required error={state.fieldErrors?.email} />
      <Field name="phone" label={t('phone')} type="tel" required error={state.fieldErrors?.phone} />
      <div className="grid grid-cols-2 gap-2">
        <Field name="checkIn" label={t('checkIn')} type="date" required error={state.fieldErrors?.checkIn} />
        <Field name="checkOut" label={t('checkOut')} type="date" required error={state.fieldErrors?.checkOut} />
      </div>
      <Field name="guests" label={t('guests')} type="number" required error={state.fieldErrors?.guests} />
      <div>
        <label className="block text-sm font-medium">{t('message')}</label>
        <textarea name="message" rows={3} className="w-full border p-2" />
      </div>
      <label className="flex items-start gap-2 text-sm">
        <input type="checkbox" name="consent" required />
        <span>{t('consent')}</span>
      </label>
      {state.error && <p className="text-red-600 text-sm">{state.error}</p>}
      <Submit label={t('submit')} />
    </form>
  );
}

function Field({
  name,
  label,
  type,
  required,
  error,
}: {
  name: string;
  label: string;
  type: string;
  required?: boolean;
  error?: string;
}) {
  return (
    <div>
      <label className="block text-sm font-medium">{label}</label>
      <input name={name} type={type} required={required} className="w-full border p-2" />
      {error && <p className="text-red-600 text-xs">{error}</p>}
    </div>
  );
}

function Submit({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="w-full bg-black text-white py-2">
      {pending ? '…' : label}
    </button>
  );
}
```

- [ ] **Step 3: Mount form on detail page**

Edit `src/app/[locale]/vehicles/[slug]/page.tsx` — replace the placeholder div with:
```tsx
<aside id="inquiry" className="md:sticky md:top-4 self-start">
  <InquiryForm vehicleId={v.id} locale={locale as Locale} />
</aside>
```
And add the import: `import { InquiryForm } from '@/components/public/InquiryForm';`

- [ ] **Step 4: Verify build**

Run: `pnpm build`. Expected: succeeds (Server Action import will resolve once Task 15 lands; if not yet, temporarily comment the import). Better order: skip `pnpm build` here, do it after Task 15.

- [ ] **Step 5: Commit**

```bash
git add src/lib/inquiry-schema.ts src/components/public/InquiryForm.tsx src/app/[locale]/vehicles/[slug]/page.tsx
git commit -m "feat(public): inquiry form component and zod schema"
```

---

### Task 15: Resend setup + email template

**Files:**
- Create: `src/lib/email.ts`, `src/emails/inquiry-received.tsx`, `src/emails/components/Layout.tsx`

- [ ] **Step 1: Email template layout**

Create `src/emails/components/Layout.tsx`:
```tsx
import { Html, Head, Body, Container, Heading, Section, Hr, Text } from '@react-email/components';
import type { ReactNode } from 'react';

export function EmailLayout({ children, preview }: { children: ReactNode; preview?: string }) {
  return (
    <Html>
      <Head />
      <Body style={{ background: '#f6f6f6', fontFamily: 'Helvetica, Arial, sans-serif' }}>
        <Container style={{ background: '#fff', padding: '24px', maxWidth: '600px' }}>
          <Heading as="h1" style={{ fontSize: '20px' }}>Otti Bull</Heading>
          <Hr />
          {children}
        </Container>
      </Body>
    </Html>
  );
}
```

- [ ] **Step 2: Inquiry-received template**

Create `src/emails/inquiry-received.tsx`:
```tsx
import { Heading, Section, Text, Link } from '@react-email/components';
import { EmailLayout } from './components/Layout';

export type InquiryEmailProps = {
  vehicleTitle: string;
  vehicleAdminUrl: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  message?: string;
  inquiryId: string;
};

export default function InquiryReceivedEmail(props: InquiryEmailProps) {
  return (
    <EmailLayout>
      <Heading as="h2">Nueva solicitud: {props.vehicleTitle}</Heading>
      <Section>
        <Text><strong>Cliente:</strong> {props.customerName}</Text>
        <Text>
          <strong>Email:</strong> <Link href={`mailto:${props.customerEmail}`}>{props.customerEmail}</Link>
        </Text>
        <Text>
          <strong>Teléfono:</strong> <Link href={`tel:${props.customerPhone}`}>{props.customerPhone}</Link>
        </Text>
        <Text><strong>Fechas:</strong> {props.checkIn} → {props.checkOut}</Text>
        <Text><strong>Personas:</strong> {props.guests}</Text>
        {props.message && <Text><strong>Mensaje:</strong> {props.message}</Text>}
      </Section>
      <Section>
        <Link href={props.vehicleAdminUrl} style={{ background: '#000', color: '#fff', padding: '10px 16px', textDecoration: 'none' }}>
          Abrir en admin
        </Link>
      </Section>
      <Text style={{ fontSize: '11px', color: '#888' }}>ID: {props.inquiryId}</Text>
    </EmailLayout>
  );
}
```

- [ ] **Step 3: Email wrapper**

Create `src/lib/email.ts`:
```ts
import { Resend } from 'resend';
import pRetry from 'p-retry';
import { render } from '@react-email/render';
import InquiryReceivedEmail, { type InquiryEmailProps } from '@/emails/inquiry-received';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendInquiryEmail(props: InquiryEmailProps & { customerEmail: string }) {
  const html = await render(<InquiryReceivedEmail {...props} />);
  return pRetry(
    async () =>
      resend.emails.send({
        from: process.env.EMAIL_FROM!,
        to: process.env.OWNER_EMAIL!,
        replyTo: props.customerEmail,
        subject: `Nueva solicitud: ${props.vehicleTitle} · ${props.customerName}`,
        html,
        headers: { 'X-Inquiry-Id': props.inquiryId },
      }),
    { retries: 3, minTimeout: 500, factor: 2 },
  );
}
```

(If Resend SDK rejects a `.tsx` import here in the lib file, switch the file extension to `.tsx` or move JSX to a wrapper — `email.ts` may need to be `email.tsx`.)

- [ ] **Step 4: Commit**

```bash
git add src/emails src/lib/email.ts
git commit -m "feat(notifications): resend email + react-email inquiry template"
```

---

### Task 16: submitInquiryAction + thank-you page

**Files:**
- Create: `src/app/actions/inquiries.ts`
- Create: `src/lib/rate-limit.ts`
- Create: `src/app/[locale]/thank-you/page.tsx`
- Create: `src/components/public/WhatsAppButton.tsx`

- [ ] **Step 1: Rate limiter**

Create `src/lib/rate-limit.ts`:
```ts
const buckets = new Map<string, { count: number; resetAt: number }>();

export function rateLimit(key: string, max: number, windowMs: number): boolean {
  const now = Date.now();
  const b = buckets.get(key);
  if (!b || b.resetAt < now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }
  if (b.count >= max) return false;
  b.count++;
  return true;
}

setInterval(() => {
  const now = Date.now();
  for (const [k, v] of buckets) if (v.resetAt < now) buckets.delete(k);
}, 60_000).unref?.();
```

- [ ] **Step 2: Server Action**

Create `src/app/actions/inquiries.ts`:
```ts
'use server';

import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import { eq } from 'drizzle-orm';
import { randomUUID } from 'node:crypto';
import { db } from '@/db/client';
import { vehicles } from '@/db/schema';
import { inquirySchema } from '@/lib/inquiry-schema';
import { sendInquiryEmail } from '@/lib/email';
import { buildWhatsAppUrl } from '@/lib/whatsapp';
import { signPayload } from '@/lib/hmac';
import { rateLimit } from '@/lib/rate-limit';

export type InquiryState = {
  error?: string;
  fieldErrors?: Partial<Record<string, string>>;
};

export async function submitInquiryAction(
  _prev: InquiryState,
  formData: FormData,
): Promise<InquiryState> {
  // honeypot
  if (formData.get('websiteUrl')) return {};

  const ip = (await headers()).get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'anonymous';
  if (!rateLimit(`inquiry:${ip}`, 3, 60 * 60 * 1000)) {
    return { error: 'Too many requests. Please try again later.' };
  }

  const raw = Object.fromEntries(formData);
  const parsed = inquirySchema.safeParse(raw);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const k = issue.path[0];
      if (typeof k === 'string') fieldErrors[k] = issue.message;
    }
    return { error: 'Validation failed', fieldErrors };
  }
  const data = parsed.data;

  const vehicle = await db.query.vehicles.findFirst({
    where: eq(vehicles.id, data.vehicleId),
    with: { translations: true },
  });
  if (!vehicle || vehicle.status !== 'published') return { error: 'Vehicle not found' };

  const tr =
    vehicle.translations.find((t) => t.locale === data.locale) ??
    vehicle.translations.find((t) => t.locale === 'es')!;

  const inquiryId = randomUUID();
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL!;
  const adminUrl = `${baseUrl}/admin/vehicles/${vehicle.id}`;

  try {
    await sendInquiryEmail({
      vehicleTitle: tr.title,
      vehicleAdminUrl: adminUrl,
      customerName: data.name,
      customerEmail: data.email,
      customerPhone: data.phone,
      checkIn: data.checkIn.toISOString().slice(0, 10),
      checkOut: data.checkOut.toISOString().slice(0, 10),
      guests: data.guests,
      message: data.message || undefined,
      inquiryId,
    });
  } catch (err) {
    console.error('email send failed', err);
    // non-fatal: continue to wa.me
  }

  const waUrl = buildWhatsAppUrl({
    ownerPhone: process.env.OWNER_WHATSAPP!,
    locale: data.locale,
    vehicleTitle: tr.title,
    checkIn: data.checkIn,
    checkOut: data.checkOut,
    guests: data.guests,
    customerName: data.name,
    customerEmail: data.email,
    customerPhone: data.phone,
    message: data.message || undefined,
  });

  const token = signPayload({ url: waUrl });
  redirect(`/${data.locale}/thank-you?w=${encodeURIComponent(token)}`);
}
```

- [ ] **Step 3: Thank-you page**

Create `src/app/[locale]/thank-you/page.tsx`:
```tsx
import { setRequestLocale, getTranslations } from 'next-intl/server';
import Link from 'next/link';
import { verifyPayload } from '@/lib/hmac';
import { WhatsAppButton } from '@/components/public/WhatsAppButton';

export const dynamic = 'force-dynamic';

export const metadata = { robots: { index: false, follow: false } };

export default async function ThankYou({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ w?: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const sp = await searchParams;
  const t = await getTranslations({ locale, namespace: 'thankYou' });

  let waUrl: string | null = null;
  if (sp.w) {
    const result = verifyPayload<{ url: string }>(decodeURIComponent(sp.w));
    if (result.valid) waUrl = result.payload.url;
  }

  return (
    <div className="mx-auto max-w-xl px-4 py-12 text-center">
      <h1 className="text-3xl mb-4">{t('title')}</h1>
      <p className="mb-6">{t('body')}</p>
      {waUrl && <WhatsAppButton href={waUrl} label={t('whatsapp')} />}
      <div className="mt-6">
        <Link href={`/${locale}/catalog`} className="underline">{t('back')}</Link>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: WhatsApp button**

Create `src/components/public/WhatsAppButton.tsx`:
```tsx
export function WhatsAppButton({ href, label }: { href: string; label: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-block bg-green-600 text-white px-6 py-3 font-semibold"
    >
      {label}
    </a>
  );
}
```

- [ ] **Step 5: Build smoke**

Run: `pnpm build`. Expected: succeeds.

- [ ] **Step 6: Commit**

```bash
git add src/app/actions/inquiries.ts src/lib/rate-limit.ts src/app/[locale]/thank-you src/components/public/WhatsAppButton.tsx
git commit -m "feat(inquiry): server action wires email + wa.me + thank-you page"
```

---

### Task 17: Integration test for submitInquiryAction

**Files:**
- Create: `tests/integration/actions/inquiries.test.ts`

- [ ] **Step 1: Test setup utilities**

Create `tests/integration/setup.ts`:
```ts
import { afterAll, beforeAll, vi } from 'vitest';
import { db } from '@/db/client';
import { vehicles, vehicleTranslations } from '@/db/schema';
import { sql } from 'drizzle-orm';

export async function resetTestDb() {
  await db.execute(sql`TRUNCATE TABLE vehicle_images, vehicle_translations, vehicles RESTART IDENTITY CASCADE`);
}

export async function seedVehicle() {
  const [v] = await db
    .insert(vehicles)
    .values({
      slug: 'test-camper',
      type: 'camper',
      basePricePerDay: '120.00',
      location: 'Barcelona',
      attributes: { berths: 4, year: 2023 },
      status: 'published',
    })
    .returning();
  await db.insert(vehicleTranslations).values([
    { vehicleId: v.id, locale: 'es', title: 'Test Camper', description: 'Desc' },
    { vehicleId: v.id, locale: 'ca', title: 'Test Camper CA', description: 'Desc' },
    { vehicleId: v.id, locale: 'en', title: 'Test Camper EN', description: 'Desc' },
  ]);
  return v;
}
```

- [ ] **Step 2: Tests**

Create `tests/integration/actions/inquiries.test.ts`:
```ts
import { describe, it, expect, vi, beforeEach, beforeAll, afterAll } from 'vitest';
import { resetTestDb, seedVehicle } from '../setup';

vi.mock('@/lib/email', () => ({ sendInquiryEmail: vi.fn().mockResolvedValue({ id: 'e1' }) }));

const REDIRECT_ERROR_TYPE = 'NEXT_REDIRECT';
function isRedirect(e: unknown): e is { digest: string } {
  return !!e && typeof e === 'object' && 'digest' in e && String((e as { digest: string }).digest).startsWith(REDIRECT_ERROR_TYPE);
}

describe('submitInquiryAction', () => {
  beforeAll(async () => {
    process.env.AUTH_SECRET = 'test-secret-32-bytes-test-secret-32';
    process.env.OWNER_WHATSAPP = '34666123456';
    process.env.NEXT_PUBLIC_SITE_URL = 'http://localhost:3000';
  });

  beforeEach(async () => {
    await resetTestDb();
  });

  it('redirects to /thank-you with signed token on valid input', async () => {
    const v = await seedVehicle();
    const { submitInquiryAction } = await import('@/app/actions/inquiries');

    const fd = new FormData();
    fd.set('vehicleId', v.id);
    fd.set('locale', 'es');
    fd.set('name', 'Mario');
    fd.set('email', 'mario@example.com');
    fd.set('phone', '+34666999111');
    fd.set('checkIn', '2026-06-15');
    fd.set('checkOut', '2026-06-22');
    fd.set('guests', '4');
    fd.set('consent', 'on');

    let redirectUrl: string | undefined;
    try {
      await submitInquiryAction({}, fd);
    } catch (e) {
      if (isRedirect(e)) redirectUrl = (e as { digest: string }).digest.split(';')[2];
      else throw e;
    }

    expect(redirectUrl).toMatch(/\/es\/thank-you\?w=/);
  });

  it('returns error on invalid email', async () => {
    const v = await seedVehicle();
    const { submitInquiryAction } = await import('@/app/actions/inquiries');

    const fd = new FormData();
    fd.set('vehicleId', v.id);
    fd.set('locale', 'es');
    fd.set('name', 'Mario');
    fd.set('email', 'not-an-email');
    fd.set('phone', '+34666999111');
    fd.set('checkIn', '2026-06-15');
    fd.set('checkOut', '2026-06-22');
    fd.set('guests', '4');
    fd.set('consent', 'on');

    const result = await submitInquiryAction({}, fd);
    expect(result.error).toBeDefined();
    expect(result.fieldErrors?.email).toBeDefined();
  });

  it('silently returns on honeypot trigger', async () => {
    const v = await seedVehicle();
    const { submitInquiryAction } = await import('@/app/actions/inquiries');

    const fd = new FormData();
    fd.set('websiteUrl', 'http://spam.example.com');
    fd.set('vehicleId', v.id);
    fd.set('locale', 'es');

    const result = await submitInquiryAction({}, fd);
    expect(result).toEqual({});
  });
});
```

- [ ] **Step 3: Configure Vitest to load env**

Edit `vitest.config.ts`:
```ts
import { defineConfig } from 'vitest/config';
import path from 'node:path';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['tests/**/*.test.ts'],
    setupFiles: ['tests/integration/env.ts'],
  },
  resolve: { alias: { '@': path.resolve(__dirname, 'src') } },
});
```

Create `tests/integration/env.ts`:
```ts
import 'dotenv/config';
```

- [ ] **Step 4: Run tests**

Pre-condition: `DATABASE_URL` in `.env.test.local` or `.env.local` points to a test branch / local Postgres with migrations applied.

Run: `pnpm test tests/integration/actions/inquiries.test.ts`
Expected: 3 passing.

If integration DB setup is too friction-heavy, defer this task to Phase 8 and continue.

- [ ] **Step 5: Commit**

```bash
git add tests/integration
git commit -m "test(inquiries): integration tests for submit action"
```

---

## Phase 6 — Admin CRUD

### Task 18: Admin layout + dashboard list

**Files:**
- Create: `src/app/admin/layout.tsx`, `src/app/admin/page.tsx`
- Create: `src/components/admin/AdminNav.tsx`, `src/components/admin/VehicleListTable.tsx`

- [ ] **Step 1: Admin layout (handles both login and authed pages)**

Create `src/app/admin/layout.tsx`. The admin layout owns `<html>`/`<body>` for all admin routes (since the locale layout that owns them only covers `/[locale]/*`). It renders `AdminNav` only when a session exists, so the login page renders cleanly without nav. Middleware already gates non-login admin routes; the layout doesn't need its own redirect.

```tsx
import type { ReactNode } from 'react';
import { auth } from '@/lib/auth';
import { AdminNav } from '@/components/admin/AdminNav';
import '../globals.css';

export const metadata = { robots: { index: false, follow: false } };

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const session = await auth();
  return (
    <html lang="es">
      <body>
        {session?.user && <AdminNav user={{ email: session.user.email ?? '' }} />}
        <main className="mx-auto max-w-6xl px-4 py-6">{children}</main>
      </body>
    </html>
  );
}
```

Do not create a `src/app/admin/login/layout.tsx` — Next.js nests sub-layouts under parent layouts, so a sub-layout with its own `<html>` would produce nested `<html>` (invalid). The conditional `AdminNav` above is sufficient.

- [ ] **Step 2: AdminNav**

Create `src/components/admin/AdminNav.tsx`:
```tsx
import Link from 'next/link';

export function AdminNav({ user }: { user: { email: string } }) {
  return (
    <nav className="border-b">
      <div className="mx-auto max-w-6xl px-4 py-3 flex justify-between items-center">
        <div className="flex gap-6">
          <Link href="/admin" className="font-bold">Admin</Link>
          <Link href="/admin/vehicles/new">+ Nuevo vehículo</Link>
        </div>
        <div className="flex gap-4 text-sm items-center">
          <span>{user.email}</span>
          <form action="/admin/logout" method="post">
            <button type="submit" className="underline">Logout</button>
          </form>
        </div>
      </div>
    </nav>
  );
}
```

- [ ] **Step 3: Dashboard page**

Create `src/app/admin/page.tsx`:
```tsx
import Link from 'next/link';
import { desc } from 'drizzle-orm';
import { db } from '@/db/client';
import { vehicles } from '@/db/schema';
import { VehicleListTable } from '@/components/admin/VehicleListTable';

export const dynamic = 'force-dynamic';

export default async function AdminDashboard() {
  const list = await db.query.vehicles.findMany({
    with: { translations: true, images: true },
    orderBy: [desc(vehicles.updatedAt)],
  });
  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl">Vehículos</h1>
        <Link href="/admin/vehicles/new" className="bg-black text-white px-3 py-2 text-sm">+ Nuevo</Link>
      </div>
      <VehicleListTable vehicles={list} />
    </div>
  );
}
```

- [ ] **Step 4: VehicleListTable**

Create `src/components/admin/VehicleListTable.tsx`:
```tsx
import Link from 'next/link';
import Image from 'next/image';

type Row = {
  id: string;
  slug: string;
  type: string;
  basePricePerDay: string;
  status: 'draft' | 'published';
  featured: boolean;
  translations: { locale: string; title: string }[];
  images: { url: string; isCover: boolean }[];
};

export function VehicleListTable({ vehicles }: { vehicles: Row[] }) {
  if (vehicles.length === 0) return <p className="text-gray-500">No hay vehículos. Crea el primero.</p>;
  return (
    <table className="w-full">
      <thead className="border-b text-left text-sm">
        <tr>
          <th className="py-2"></th>
          <th>Título</th>
          <th>Tipo</th>
          <th>Precio</th>
          <th>Estado</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        {vehicles.map((v) => {
          const title = v.translations.find((t) => t.locale === 'es')?.title ?? v.slug;
          const cover = v.images.find((i) => i.isCover) ?? v.images[0];
          return (
            <tr key={v.id} className="border-b">
              <td className="py-2 w-16">
                {cover && (
                  <div className="relative w-12 h-12">
                    <Image src={cover.url} alt={title} fill sizes="48px" />
                  </div>
                )}
              </td>
              <td>{title}</td>
              <td>{v.type}</td>
              <td>{v.basePricePerDay} €</td>
              <td>
                <span className={v.status === 'published' ? 'text-green-700' : 'text-gray-500'}>
                  {v.status}
                </span>
                {v.featured && <span className="ml-1">★</span>}
              </td>
              <td><Link href={`/admin/vehicles/${v.id}`} className="underline">Editar</Link></td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
```

- [ ] **Step 5: Verify**

Run: `pnpm dev`, log in, visit `/admin`. Expected: empty state.

- [ ] **Step 6: Commit**

```bash
git add src/app/admin src/components/admin
git commit -m "feat(admin): dashboard with vehicle list"
```

---

### Task 19: Vehicle CRUD Server Actions

**Files:**
- Create: `src/app/actions/vehicles.ts`
- Create: `src/lib/vehicle-form-schema.ts`

- [ ] **Step 1: Form schema**

Create `src/lib/vehicle-form-schema.ts`:
```ts
import { z } from 'zod';
import { vehicleAttributesSchemas, type VehicleType } from './vehicle-attributes';

const translation = z.object({
  locale: z.enum(['es', 'ca', 'en']),
  title: z.string().min(2),
  description: z.string().min(10),
  metaTitle: z.string().optional().or(z.literal('')),
  metaDescription: z.string().optional().or(z.literal('')),
});

const image = z.object({
  url: z.string().url(),
  altText: z.string().optional().nullable(),
  sortOrder: z.coerce.number().int().default(0),
  isCover: z.coerce.boolean().default(false),
});

export const vehicleFormSchema = z.object({
  slug: z.string().regex(/^[a-z0-9-]+$/, 'Only lowercase, digits, hyphens'),
  type: z.enum(['camper', 'motorcycle', 'car', 'bicycle', 'boat']),
  basePricePerDay: z.coerce.number().positive(),
  minRentalDays: z.coerce.number().int().min(1).default(1),
  maxRentalDays: z.coerce.number().int().min(1).optional().nullable(),
  location: z.string().min(1),
  attributes: z.unknown(),
  status: z.enum(['draft', 'published']),
  featured: z.coerce.boolean().default(false),
  sortOrder: z.coerce.number().int().default(0),
  translations: z.array(translation).length(3),
  images: z.array(image).max(10),
});

export function validateForPublish(input: z.infer<typeof vehicleFormSchema>): string[] {
  const errors: string[] = [];
  if (input.status === 'published') {
    const locales = input.translations.map((t) => t.locale);
    if (!['es', 'ca', 'en'].every((l) => locales.includes(l as 'es'))) {
      errors.push('All 3 translations (es/ca/en) required to publish');
    }
    if (input.images.length === 0) errors.push('At least one image required to publish');
    if (!input.images.some((i) => i.isCover)) errors.push('Cover image required to publish');
  }
  // attribute validation against type
  const attrSchema = vehicleAttributesSchemas[input.type as VehicleType];
  const attrResult = attrSchema.safeParse(input.attributes);
  if (!attrResult.success) errors.push(`Invalid attributes for ${input.type}`);
  return errors;
}

export type VehicleFormInput = z.infer<typeof vehicleFormSchema>;
```

- [ ] **Step 2: Server actions**

Create `src/app/actions/vehicles.ts`:
```ts
'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { eq } from 'drizzle-orm';
import { db } from '@/db/client';
import { vehicles, vehicleTranslations, vehicleImages } from '@/db/schema';
import { requireAdminSession } from '@/lib/auth';
import { vehicleFormSchema, validateForPublish, type VehicleFormInput } from '@/lib/vehicle-form-schema';
import { routing } from '@/i18n/routing';

function revalidateForVehicle(slug: string) {
  for (const locale of routing.locales) {
    revalidatePath(`/${locale}`);
    revalidatePath(`/${locale}/catalog`);
    revalidatePath(`/${locale}/vehicles/${slug}`);
  }
}

export async function createVehicleAction(input: VehicleFormInput) {
  await requireAdminSession();
  const parsed = vehicleFormSchema.safeParse(input);
  if (!parsed.success) return { error: 'Validation failed', issues: parsed.error.issues };
  const errors = validateForPublish(parsed.data);
  if (errors.length) return { error: errors.join('; ') };

  const [v] = await db
    .insert(vehicles)
    .values({
      slug: parsed.data.slug,
      type: parsed.data.type,
      basePricePerDay: parsed.data.basePricePerDay.toFixed(2),
      minRentalDays: parsed.data.minRentalDays,
      maxRentalDays: parsed.data.maxRentalDays ?? null,
      location: parsed.data.location,
      attributes: parsed.data.attributes,
      status: parsed.data.status,
      featured: parsed.data.featured,
      sortOrder: parsed.data.sortOrder,
    })
    .returning();

  await db.insert(vehicleTranslations).values(
    parsed.data.translations.map((t) => ({
      vehicleId: v.id,
      locale: t.locale,
      title: t.title,
      description: t.description,
      metaTitle: t.metaTitle || null,
      metaDescription: t.metaDescription || null,
    })),
  );

  if (parsed.data.images.length) {
    await db.insert(vehicleImages).values(
      parsed.data.images.map((img) => ({
        vehicleId: v.id,
        url: img.url,
        altText: img.altText ?? null,
        sortOrder: img.sortOrder,
        isCover: img.isCover,
      })),
    );
  }

  revalidateForVehicle(v.slug);
  redirect(`/admin/vehicles/${v.id}`);
}

export async function updateVehicleAction(id: string, input: VehicleFormInput) {
  await requireAdminSession();
  const parsed = vehicleFormSchema.safeParse(input);
  if (!parsed.success) return { error: 'Validation failed', issues: parsed.error.issues };
  const errors = validateForPublish(parsed.data);
  if (errors.length) return { error: errors.join('; ') };

  await db
    .update(vehicles)
    .set({
      slug: parsed.data.slug,
      type: parsed.data.type,
      basePricePerDay: parsed.data.basePricePerDay.toFixed(2),
      minRentalDays: parsed.data.minRentalDays,
      maxRentalDays: parsed.data.maxRentalDays ?? null,
      location: parsed.data.location,
      attributes: parsed.data.attributes,
      status: parsed.data.status,
      featured: parsed.data.featured,
      sortOrder: parsed.data.sortOrder,
      updatedAt: new Date(),
    })
    .where(eq(vehicles.id, id));

  // replace translations + images
  await db.delete(vehicleTranslations).where(eq(vehicleTranslations.vehicleId, id));
  await db.insert(vehicleTranslations).values(
    parsed.data.translations.map((t) => ({
      vehicleId: id,
      locale: t.locale,
      title: t.title,
      description: t.description,
      metaTitle: t.metaTitle || null,
      metaDescription: t.metaDescription || null,
    })),
  );

  await db.delete(vehicleImages).where(eq(vehicleImages.vehicleId, id));
  if (parsed.data.images.length) {
    await db.insert(vehicleImages).values(
      parsed.data.images.map((img) => ({
        vehicleId: id,
        url: img.url,
        altText: img.altText ?? null,
        sortOrder: img.sortOrder,
        isCover: img.isCover,
      })),
    );
  }

  revalidateForVehicle(parsed.data.slug);
  return { ok: true };
}

export async function deleteVehicleAction(id: string) {
  await requireAdminSession();
  const [v] = await db.select().from(vehicles).where(eq(vehicles.id, id)).limit(1);
  if (!v) return { error: 'Not found' };
  await db.delete(vehicles).where(eq(vehicles.id, id));
  revalidateForVehicle(v.slug);
  redirect('/admin');
}
```

- [ ] **Step 3: Commit**

```bash
git add src/lib/vehicle-form-schema.ts src/app/actions/vehicles.ts
git commit -m "feat(admin): vehicle CRUD server actions with publish validation"
```

---

### Task 20: Vercel Blob upload — presigned URL API

**Files:**
- Create: `src/app/api/blob-upload/route.ts`

- [ ] **Step 1: Upload route**

Create `src/app/api/blob-upload/route.ts`:
```ts
import { NextResponse } from 'next/server';
import { handleUpload, type HandleUploadBody } from '@vercel/blob/client';
import { auth } from '@/lib/auth';

export async function POST(request: Request): Promise<NextResponse> {
  const body = (await request.json()) as HandleUploadBody;
  try {
    const json = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async () => {
        const session = await auth();
        if (!session?.user) throw new Error('Unauthorized');
        return {
          allowedContentTypes: ['image/jpeg', 'image/png', 'image/webp'],
          maximumSizeInBytes: 5 * 1024 * 1024,
          tokenPayload: JSON.stringify({ userId: session.user.id }),
        };
      },
      onUploadCompleted: async () => {
        // Hook for post-upload work; not needed since we record images in form submit
      },
    });
    return NextResponse.json(json);
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 401 });
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add src/app/api/blob-upload/route.ts
git commit -m "feat(admin): presigned URL endpoint for Vercel Blob uploads"
```

---

### Task 21: Vehicle form UI (admin)

**Files:**
- Create: `src/app/admin/vehicles/new/page.tsx`, `src/app/admin/vehicles/[id]/page.tsx`
- Create: `src/components/admin/VehicleForm.tsx`, `src/components/admin/VehicleAttributesFields.tsx`, `src/components/admin/VehicleTranslationsTabs.tsx`, `src/components/admin/ImageUploader.tsx`, `src/components/admin/ImageGalleryManager.tsx`

- [ ] **Step 1: New vehicle page**

Create `src/app/admin/vehicles/new/page.tsx`:
```tsx
import { VehicleForm } from '@/components/admin/VehicleForm';

export default function NewVehiclePage() {
  return (
    <div>
      <h1 className="text-2xl mb-4">Nuevo vehículo</h1>
      <VehicleForm mode="create" />
    </div>
  );
}
```

- [ ] **Step 2: Edit vehicle page**

Create `src/app/admin/vehicles/[id]/page.tsx`:
```tsx
import { notFound } from 'next/navigation';
import { eq } from 'drizzle-orm';
import { db } from '@/db/client';
import { vehicles } from '@/db/schema';
import { VehicleForm } from '@/components/admin/VehicleForm';

export const dynamic = 'force-dynamic';

export default async function EditVehiclePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const v = await db.query.vehicles.findFirst({
    where: eq(vehicles.id, id),
    with: { translations: true, images: true },
  });
  if (!v) notFound();
  return (
    <div>
      <h1 className="text-2xl mb-4">Editar vehículo</h1>
      <VehicleForm mode="edit" initial={{ ...v, basePricePerDay: Number(v.basePricePerDay) }} />
    </div>
  );
}
```

- [ ] **Step 3: VehicleForm**

Create `src/components/admin/VehicleForm.tsx`:
```tsx
'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import {
  createVehicleAction,
  updateVehicleAction,
  deleteVehicleAction,
} from '@/app/actions/vehicles';
import type { VehicleFormInput } from '@/lib/vehicle-form-schema';
import { VehicleAttributesFields } from './VehicleAttributesFields';
import { VehicleTranslationsTabs } from './VehicleTranslationsTabs';
import { ImageGalleryManager } from './ImageGalleryManager';

type Props =
  | { mode: 'create' }
  | { mode: 'edit'; initial: VehicleFormInput & { id: string } };

const empty: VehicleFormInput = {
  slug: '',
  type: 'camper',
  basePricePerDay: 0,
  minRentalDays: 1,
  maxRentalDays: null,
  location: 'Barcelona',
  attributes: {},
  status: 'draft',
  featured: false,
  sortOrder: 0,
  translations: [
    { locale: 'es', title: '', description: '', metaTitle: '', metaDescription: '' },
    { locale: 'ca', title: '', description: '', metaTitle: '', metaDescription: '' },
    { locale: 'en', title: '', description: '', metaTitle: '', metaDescription: '' },
  ],
  images: [],
};

export function VehicleForm(props: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<VehicleFormInput>(props.mode === 'edit' ? (props.initial as VehicleFormInput) : empty);

  const update = <K extends keyof VehicleFormInput>(k: K, v: VehicleFormInput[K]) =>
    setData((d) => ({ ...d, [k]: v }));

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const result =
        props.mode === 'create'
          ? await createVehicleAction(data)
          : await updateVehicleAction((props as { initial: { id: string } }).initial.id, data);
      if (result && 'error' in result && result.error) setError(result.error);
      else if (props.mode === 'edit') router.refresh();
    });
  }

  function onDelete() {
    if (props.mode !== 'edit') return;
    if (!confirm('¿Eliminar este vehículo?')) return;
    startTransition(async () => {
      await deleteVehicleAction((props as { initial: { id: string } }).initial.id);
    });
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <fieldset className="space-y-3 border p-4">
        <legend className="font-bold">Datos comunes</legend>
        <Row label="Slug">
          <input value={data.slug} onChange={(e) => update('slug', e.target.value)} className="border p-2 w-full" />
        </Row>
        <Row label="Tipo">
          <select value={data.type} onChange={(e) => update('type', e.target.value as typeof data.type)} className="border p-2">
            <option value="camper">Camper</option>
            <option value="motorcycle">Moto</option>
            <option value="car">Coche</option>
            <option value="bicycle">Bici</option>
            <option value="boat">Barco</option>
          </select>
        </Row>
        <Row label="Precio/día (€)">
          <input type="number" step="0.01" value={data.basePricePerDay} onChange={(e) => update('basePricePerDay', Number(e.target.value))} className="border p-2" />
        </Row>
        <Row label="Días mín / máx">
          <div className="flex gap-2">
            <input type="number" value={data.minRentalDays} onChange={(e) => update('minRentalDays', Number(e.target.value))} className="border p-2 w-24" />
            <input type="number" value={data.maxRentalDays ?? ''} onChange={(e) => update('maxRentalDays', e.target.value ? Number(e.target.value) : null)} className="border p-2 w-24" placeholder="—" />
          </div>
        </Row>
        <Row label="Ubicación">
          <input value={data.location} onChange={(e) => update('location', e.target.value)} className="border p-2 w-full" />
        </Row>
        <Row label="Estado">
          <select value={data.status} onChange={(e) => update('status', e.target.value as typeof data.status)} className="border p-2">
            <option value="draft">Borrador</option>
            <option value="published">Publicado</option>
          </select>
        </Row>
        <Row label="Destacado">
          <input type="checkbox" checked={data.featured} onChange={(e) => update('featured', e.target.checked)} />
        </Row>
        <Row label="Orden">
          <input type="number" value={data.sortOrder} onChange={(e) => update('sortOrder', Number(e.target.value))} className="border p-2 w-24" />
        </Row>
      </fieldset>

      <fieldset className="space-y-3 border p-4">
        <legend className="font-bold">Atributos</legend>
        <VehicleAttributesFields type={data.type} attributes={data.attributes as Record<string, unknown>} onChange={(a) => update('attributes', a)} />
      </fieldset>

      <fieldset className="space-y-3 border p-4">
        <legend className="font-bold">Traducciones</legend>
        <VehicleTranslationsTabs translations={data.translations} onChange={(t) => update('translations', t)} />
      </fieldset>

      <fieldset className="space-y-3 border p-4">
        <legend className="font-bold">Imágenes</legend>
        <ImageGalleryManager images={data.images} onChange={(imgs) => update('images', imgs)} />
      </fieldset>

      {error && <p className="text-red-600">{error}</p>}
      <div className="flex gap-3">
        <button type="submit" disabled={pending} className="bg-black text-white px-4 py-2">
          {pending ? '…' : props.mode === 'create' ? 'Crear' : 'Guardar'}
        </button>
        {props.mode === 'edit' && (
          <button type="button" onClick={onDelete} className="text-red-600">Eliminar</button>
        )}
      </div>
    </form>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[200px_1fr] gap-2 items-center">
      <label className="text-sm">{label}</label>
      <div>{children}</div>
    </div>
  );
}
```

- [ ] **Step 4: VehicleAttributesFields**

Create `src/components/admin/VehicleAttributesFields.tsx`:
```tsx
'use client';

import { vehicleAttributesSchemas, type VehicleType } from '@/lib/vehicle-attributes';

const FIELDS: Record<VehicleType, Array<{ key: string; label: string; type: 'number' | 'text' | 'checkbox' | 'select'; options?: string[] }>> = {
  camper: [
    { key: 'berths', label: 'Plazas para dormir', type: 'number' },
    { key: 'travelSeats', label: 'Plazas de viaje', type: 'number' },
    { key: 'lengthM', label: 'Longitud (m)', type: 'number' },
    { key: 'year', label: 'Año', type: 'number' },
    { key: 'transmission', label: 'Transmisión', type: 'select', options: ['manual', 'automatic'] },
    { key: 'licenseRequired', label: 'Permiso', type: 'select', options: ['B', 'C1', 'C'] },
    { key: 'hasKitchen', label: 'Cocina', type: 'checkbox' },
    { key: 'hasBathroom', label: 'Baño', type: 'checkbox' },
  ],
  motorcycle: [
    { key: 'displacementCc', label: 'Cilindrada (cc)', type: 'number' },
    { key: 'year', label: 'Año', type: 'number' },
    { key: 'licenseRequired', label: 'Permiso', type: 'select', options: ['AM', 'A1', 'A2', 'A'] },
    { key: 'helmetIncluded', label: 'Casco incluido', type: 'checkbox' },
  ],
  car: [
    { key: 'seats', label: 'Plazas', type: 'number' },
    { key: 'year', label: 'Año', type: 'number' },
    { key: 'transmission', label: 'Transmisión', type: 'select', options: ['manual', 'automatic'] },
  ],
  bicycle: [
    { key: 'type', label: 'Tipo', type: 'select', options: ['mtb', 'road', 'city', 'electric'] },
    { key: 'gears', label: 'Marchas', type: 'number' },
  ],
  boat: [
    { key: 'lengthM', label: 'Longitud (m)', type: 'number' },
    { key: 'year', label: 'Año', type: 'number' },
    { key: 'capacity', label: 'Capacidad', type: 'number' },
  ],
};

export function VehicleAttributesFields({
  type,
  attributes,
  onChange,
}: {
  type: VehicleType;
  attributes: Record<string, unknown>;
  onChange: (a: Record<string, unknown>) => void;
}) {
  const fields = FIELDS[type];

  function set(k: string, v: unknown) {
    onChange({ ...attributes, [k]: v });
  }

  return (
    <div className="space-y-2">
      {fields.map((f) => (
        <div key={f.key} className="grid grid-cols-[200px_1fr] gap-2 items-center">
          <label className="text-sm">{f.label}</label>
          {f.type === 'checkbox' ? (
            <input type="checkbox" checked={Boolean(attributes[f.key])} onChange={(e) => set(f.key, e.target.checked)} />
          ) : f.type === 'select' ? (
            <select value={String(attributes[f.key] ?? '')} onChange={(e) => set(f.key, e.target.value)} className="border p-2">
              <option value="">—</option>
              {f.options?.map((o) => <option key={o} value={o}>{o}</option>)}
            </select>
          ) : (
            <input
              type={f.type}
              value={String(attributes[f.key] ?? '')}
              onChange={(e) => set(f.key, f.type === 'number' ? Number(e.target.value) : e.target.value)}
              className="border p-2"
            />
          )}
        </div>
      ))}
    </div>
  );
}
```

- [ ] **Step 5: VehicleTranslationsTabs**

Create `src/components/admin/VehicleTranslationsTabs.tsx`:
```tsx
'use client';

import { useState } from 'react';
import ReactMarkdown from 'react-markdown';

type Tr = { locale: 'es' | 'ca' | 'en'; title: string; description: string; metaTitle?: string; metaDescription?: string };

export function VehicleTranslationsTabs({
  translations,
  onChange,
}: {
  translations: Tr[];
  onChange: (t: Tr[]) => void;
}) {
  const [active, setActive] = useState<'es' | 'ca' | 'en'>('es');
  const cur = translations.find((t) => t.locale === active)!;

  function update(patch: Partial<Tr>) {
    onChange(translations.map((t) => (t.locale === active ? { ...t, ...patch } : t)));
  }

  return (
    <div>
      <div className="flex gap-2 mb-3">
        {(['es', 'ca', 'en'] as const).map((l) => (
          <button
            key={l}
            type="button"
            onClick={() => setActive(l)}
            className={`px-3 py-1 border ${active === l ? 'bg-black text-white' : ''}`}
          >
            {l.toUpperCase()}
          </button>
        ))}
      </div>
      <div className="space-y-2">
        <input
          placeholder="Título"
          value={cur.title}
          onChange={(e) => update({ title: e.target.value })}
          className="border p-2 w-full"
        />
        <div className="grid grid-cols-2 gap-3">
          <textarea
            placeholder="Descripción (markdown)"
            value={cur.description}
            rows={10}
            onChange={(e) => update({ description: e.target.value })}
            className="border p-2 w-full font-mono text-sm"
          />
          <div className="border p-2 prose prose-sm">
            <ReactMarkdown>{cur.description || '*Preview vacío*'}</ReactMarkdown>
          </div>
        </div>
        <input
          placeholder="Meta title (SEO, opcional)"
          value={cur.metaTitle ?? ''}
          onChange={(e) => update({ metaTitle: e.target.value })}
          className="border p-2 w-full"
        />
        <textarea
          placeholder="Meta description (SEO, opcional)"
          value={cur.metaDescription ?? ''}
          onChange={(e) => update({ metaDescription: e.target.value })}
          rows={2}
          className="border p-2 w-full"
        />
      </div>
    </div>
  );
}
```

- [ ] **Step 6: ImageGalleryManager + ImageUploader**

Create `src/components/admin/ImageUploader.tsx`:
```tsx
'use client';

import { useState } from 'react';
import { upload } from '@vercel/blob/client';

export function ImageUploader({ onUploaded }: { onUploaded: (url: string) => void }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true);
    setError(null);
    try {
      const blob = await upload(file.name, file, {
        access: 'public',
        handleUploadUrl: '/api/blob-upload',
      });
      onUploaded(blob.url);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
      e.target.value = '';
    }
  }

  return (
    <div>
      <input type="file" accept="image/jpeg,image/png,image/webp" onChange={handleFile} disabled={busy} />
      {busy && <p className="text-sm">Subiendo…</p>}
      {error && <p className="text-red-600 text-sm">{error}</p>}
    </div>
  );
}
```

Create `src/components/admin/ImageGalleryManager.tsx`:
```tsx
'use client';

import Image from 'next/image';
import { ImageUploader } from './ImageUploader';

type Img = { url: string; altText?: string | null; sortOrder: number; isCover: boolean };

export function ImageGalleryManager({
  images,
  onChange,
}: {
  images: Img[];
  onChange: (imgs: Img[]) => void;
}) {
  function add(url: string) {
    const next: Img = { url, altText: null, sortOrder: images.length, isCover: images.length === 0 };
    onChange([...images, next]);
  }
  function remove(i: number) {
    const next = images.filter((_, idx) => idx !== i).map((img, idx) => ({ ...img, sortOrder: idx }));
    if (!next.some((x) => x.isCover) && next[0]) next[0].isCover = true;
    onChange(next);
  }
  function setCover(i: number) {
    onChange(images.map((img, idx) => ({ ...img, isCover: idx === i })));
  }
  function setAlt(i: number, alt: string) {
    onChange(images.map((img, idx) => (idx === i ? { ...img, altText: alt } : img)));
  }
  function move(i: number, dir: -1 | 1) {
    const j = i + dir;
    if (j < 0 || j >= images.length) return;
    const next = [...images];
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next.map((img, idx) => ({ ...img, sortOrder: idx })));
  }

  return (
    <div className="space-y-3">
      {images.length >= 10 ? (
        <p className="text-sm text-gray-500">Máximo 10 imágenes alcanzado</p>
      ) : (
        <ImageUploader onUploaded={add} />
      )}
      <ul className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {images.map((img, i) => (
          <li key={img.url} className="border p-2 space-y-2">
            <div className="relative aspect-[4/3]">
              <Image src={img.url} alt={img.altText ?? ''} fill sizes="200px" />
              {img.isCover && <span className="absolute top-1 left-1 bg-yellow-400 px-1 text-xs">Cover</span>}
            </div>
            <input
              placeholder="Alt text"
              value={img.altText ?? ''}
              onChange={(e) => setAlt(i, e.target.value)}
              className="border p-1 w-full text-sm"
            />
            <div className="flex justify-between text-sm">
              <button type="button" onClick={() => setCover(i)} className="underline">
                {img.isCover ? '★ cover' : 'Set cover'}
              </button>
              <div className="flex gap-1">
                <button type="button" onClick={() => move(i, -1)}>←</button>
                <button type="button" onClick={() => move(i, 1)}>→</button>
              </div>
              <button type="button" onClick={() => remove(i)} className="text-red-600">Borrar</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
```

- [ ] **Step 7: Smoke test**

Run: `pnpm dev`, log in, create a vehicle, set 1 image as cover, fill 3 translations, publish, view at `/es/catalog`. Expected: vehicle appears, detail page works.

- [ ] **Step 8: Commit**

```bash
git add src/app/admin/vehicles src/components/admin/VehicleForm.tsx src/components/admin/VehicleAttributesFields.tsx src/components/admin/VehicleTranslationsTabs.tsx src/components/admin/ImageUploader.tsx src/components/admin/ImageGalleryManager.tsx
git commit -m "feat(admin): vehicle form with attributes, translations, image gallery"
```

---

## Phase 7 — SEO

### Task 22: Sitemap + robots

**Files:**
- Create: `src/app/sitemap.ts`, `src/app/robots.ts`

- [ ] **Step 1: robots.ts**

Create `src/app/robots.ts`:
```ts
import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';
  return {
    rules: [
      { userAgent: '*', allow: '/', disallow: ['/admin/', '/api/', '/thank-you'] },
    ],
    sitemap: `${base}/sitemap.xml`,
  };
}
```

- [ ] **Step 2: sitemap.ts**

Create `src/app/sitemap.ts`:
```ts
import type { MetadataRoute } from 'next';
import { eq } from 'drizzle-orm';
import { db } from '@/db/client';
import { vehicles } from '@/db/schema';
import { routing } from '@/i18n/routing';

const BASE = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const published = await db.query.vehicles.findMany({
    where: eq(vehicles.status, 'published'),
    columns: { slug: true, updatedAt: true },
  });

  const staticPaths = ['', '/catalog', '/privacy', '/terms'];
  const entries: MetadataRoute.Sitemap = [];

  for (const path of staticPaths) {
    for (const locale of routing.locales) {
      entries.push({
        url: `${BASE}/${locale}${path}`,
        changeFrequency: path === '' ? 'weekly' : 'monthly',
        priority: path === '' ? 1.0 : 0.7,
        alternates: {
          languages: Object.fromEntries(
            routing.locales.map((l) => [l, `${BASE}/${l}${path}`]),
          ),
        },
      });
    }
  }

  for (const v of published) {
    for (const locale of routing.locales) {
      entries.push({
        url: `${BASE}/${locale}/vehicles/${v.slug}`,
        lastModified: v.updatedAt,
        changeFrequency: 'weekly',
        priority: 0.8,
        alternates: {
          languages: Object.fromEntries(
            routing.locales.map((l) => [l, `${BASE}/${l}/vehicles/${v.slug}`]),
          ),
        },
      });
    }
  }
  return entries;
}
```

- [ ] **Step 3: Verify**

Run: `pnpm dev`, visit `/sitemap.xml` and `/robots.txt`. Expected: both render with all entries.

- [ ] **Step 4: Commit**

```bash
git add src/app/sitemap.ts src/app/robots.ts
git commit -m "feat(seo): sitemap with hreflang and robots.txt"
```

---

### Task 23: Generate metadata helpers + Organization JSON-LD

**Files:**
- Create: `src/lib/seo.ts`
- Modify: `src/app/[locale]/layout.tsx` to inject Organization JSON-LD
- Modify: home page metadata

- [ ] **Step 1: SEO helper**

Create `src/lib/seo.ts`:
```ts
import type { Metadata } from 'next';
import { routing, type Locale } from '@/i18n/routing';

const BASE = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';

export function localeAlternates(path: string): Metadata['alternates'] {
  return {
    canonical: `${BASE}${path}`,
    languages: {
      ...Object.fromEntries(
        routing.locales.map((l) => [l, `${BASE}/${l}${path.replace(/^\/[a-z]{2}/, '')}`]),
      ),
      'x-default': `${BASE}/${routing.defaultLocale}${path.replace(/^\/[a-z]{2}/, '')}`,
    },
  };
}

export function organizationJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Otti Bull',
    url: BASE,
    logo: `${BASE}/logo.png`,
    sameAs: [],
  };
}
```

- [ ] **Step 2: Inject Organization JSON-LD in locale layout**

Edit `src/app/[locale]/layout.tsx` body — add inside `<body>` before children:
```tsx
import { organizationJsonLd } from '@/lib/seo';
// ...
<script
  type="application/ld+json"
  dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd()) }}
/>
```

- [ ] **Step 3: Home metadata**

Edit `src/app/[locale]/page.tsx`:
```tsx
import { localeAlternates } from '@/lib/seo';
import { getTranslations } from 'next-intl/server';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'home' });
  return {
    title: t('metaTitle'),
    description: t('metaDescription'),
    alternates: localeAlternates(`/${locale}`),
  };
}
```

- [ ] **Step 4: Commit**

```bash
git add src/lib/seo.ts src/app/[locale]/layout.tsx src/app/[locale]/page.tsx
git commit -m "feat(seo): metadata helpers, Organization JSON-LD, home metadata"
```

---

### Task 24: Dynamic OG image for vehicle pages

**Files:**
- Create: `src/app/[locale]/vehicles/[slug]/opengraph-image.tsx`
- Create: `src/app/opengraph-image.tsx` (default site OG)

- [ ] **Step 1: Default OG image**

Create `src/app/opengraph-image.tsx`:
```tsx
import { ImageResponse } from 'next/og';

export const alt = 'Otti Bull';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OG() {
  return new ImageResponse(
    (
      <div style={{ background: '#fff', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 96, fontWeight: 700 }}>
        Otti Bull
      </div>
    ),
    size,
  );
}
```

- [ ] **Step 2: Vehicle OG image**

Create `src/app/[locale]/vehicles/[slug]/opengraph-image.tsx`:
```tsx
import { ImageResponse } from 'next/og';
import { eq, and } from 'drizzle-orm';
import { db } from '@/db/client';
import { vehicles } from '@/db/schema';

export const alt = 'Otti Bull';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function VehicleOG({
  params,
}: {
  params: { locale: string; slug: string };
}) {
  const v = await db.query.vehicles.findFirst({
    where: and(eq(vehicles.slug, params.slug), eq(vehicles.status, 'published')),
    with: { translations: true, images: true },
  });
  const tr = v?.translations.find((t) => t.locale === params.locale) ?? v?.translations[0];
  const cover = v?.images.find((i) => i.isCover) ?? v?.images[0];

  return new ImageResponse(
    (
      <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', background: '#000', color: '#fff', padding: 60 }}>
        {cover && (
          <img
            src={cover.url}
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.6 }}
          />
        )}
        <div style={{ marginTop: 'auto', position: 'relative' }}>
          <div style={{ fontSize: 24, opacity: 0.8 }}>Otti Bull</div>
          <div style={{ fontSize: 72, fontWeight: 700 }}>{tr?.title ?? 'Vehicle'}</div>
          {v && <div style={{ fontSize: 32 }}>desde {v.basePricePerDay} €/día</div>}
        </div>
      </div>
    ),
    size,
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add src/app/opengraph-image.tsx src/app/[locale]/vehicles/[slug]/opengraph-image.tsx
git commit -m "feat(seo): dynamic OG images for site root and vehicle pages"
```

---

## Phase 8 — Production hardening

### Task 25: Privacy + Terms MDX pages

**Files:**
- Create: `src/app/[locale]/privacy/page.mdx`, `src/app/[locale]/terms/page.mdx`
- Modify: `next.config.ts` to enable MDX

- [ ] **Step 1: MDX dependency**

```bash
pnpm add @next/mdx @mdx-js/loader @mdx-js/react @types/mdx
```

- [ ] **Step 2: Configure MDX in next.config.ts**

Update `next.config.ts`:
```ts
import type { NextConfig } from 'next';
import createMDX from '@next/mdx';
import createNextIntlPlugin from 'next-intl/plugin';

const withMDX = createMDX();
const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

const nextConfig: NextConfig = {
  reactStrictMode: true,
  pageExtensions: ['ts', 'tsx', 'mdx'],
  images: {
    remotePatterns: [{ protocol: 'https', hostname: '*.public.blob.vercel-storage.com' }],
  },
};

export default withNextIntl(withMDX(nextConfig));
```

- [ ] **Step 3: Privacy and terms placeholders**

Create `src/app/[locale]/privacy/page.mdx`:
```md
# Política de Privacidad

(Texto legal — el cliente lo proveerá. Placeholder editable en MDX.)

## Datos recogidos
Sólo los datos del formulario de contacto: nombre, email, teléfono, fechas, mensaje.

## Uso
Para responder a la solicitud de presupuesto. No se almacenan en base de datos.
```

Create `src/app/[locale]/terms/page.mdx`:
```md
# Términos y Condiciones

(Texto legal — el cliente lo proveerá.)
```

(These should be replaced with the real legal text. Translation per locale: each MDX file is locale-dependent because of the URL segment, but Next.js MDX in `[locale]` segment will render the same file for all locales. For per-locale content, switch to a Server Component reading from `messages/` or split into 3 files. Defer to user on whether to translate now or later.)

- [ ] **Step 4: Commit**

```bash
git add next.config.ts src/app/[locale]/privacy src/app/[locale]/terms
git commit -m "feat(legal): privacy and terms placeholder MDX pages"
```

---

### Task 26: Playwright E2E smoke tests

**Files:**
- Create: `playwright.config.ts`
- Create: `tests/e2e/public.spec.ts`, `tests/e2e/admin.spec.ts`

- [ ] **Step 1: Playwright config**

Create `playwright.config.ts`:
```ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: 'html',
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: process.env.PLAYWRIGHT_BASE_URL
    ? undefined
    : { command: 'pnpm dev', port: 3000, reuseExistingServer: true, timeout: 120_000 },
});
```

- [ ] **Step 2: Public smoke test**

Create `tests/e2e/public.spec.ts`:
```ts
import { test, expect } from '@playwright/test';

test('redirects root to /es', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveURL(/\/es$/);
});

test('catalog page renders', async ({ page }) => {
  await page.goto('/es/catalog');
  await expect(page.locator('h1')).toBeVisible();
});

test('language switcher changes locale', async ({ page }) => {
  await page.goto('/es');
  await page.getByRole('button', { name: 'EN' }).click();
  await expect(page).toHaveURL(/\/en$/);
});

test('sitemap.xml is served', async ({ request }) => {
  const r = await request.get('/sitemap.xml');
  expect(r.status()).toBe(200);
  expect((await r.text())).toContain('<urlset');
});

test('robots.txt is served', async ({ request }) => {
  const r = await request.get('/robots.txt');
  expect(r.status()).toBe(200);
  expect(await r.text()).toContain('Disallow: /admin/');
});
```

- [ ] **Step 3: Admin smoke test (requires seeded admin)**

Create `tests/e2e/admin.spec.ts`:
```ts
import { test, expect } from '@playwright/test';

const EMAIL = process.env.TEST_ADMIN_EMAIL ?? 'admin@ottibull.com';
const PASSWORD = process.env.TEST_ADMIN_PASSWORD ?? 'changeme';

test('admin login works', async ({ page }) => {
  await page.goto('/admin/login');
  await page.fill('input[name=email]', EMAIL);
  await page.fill('input[name=password]', PASSWORD);
  await page.click('button[type=submit]');
  await expect(page).toHaveURL(/\/admin$/);
});

test('admin dashboard requires auth', async ({ page, context }) => {
  await context.clearCookies();
  await page.goto('/admin');
  await expect(page).toHaveURL(/\/admin\/login/);
});
```

- [ ] **Step 4: Install Playwright browsers and run**

```bash
pnpm exec playwright install chromium
pnpm test:e2e
```

Expected: 7 passing (assuming admin seeded).

- [ ] **Step 5: Commit**

```bash
git add playwright.config.ts tests/e2e
git commit -m "test(e2e): playwright smoke tests for public and admin"
```

---

### Task 27: GitHub Actions — CI + migrations on deploy

**Files:**
- Create: `.github/workflows/ci.yml`, `.github/workflows/migrate.yml`

- [ ] **Step 1: CI workflow**

Create `.github/workflows/ci.yml`:
```yaml
name: CI
on:
  pull_request:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
        with: { version: 9 }
      - uses: actions/setup-node@v4
        with: { node-version: 20, cache: pnpm }
      - run: pnpm install --frozen-lockfile
      - run: pnpm lint
      - run: pnpm test
      - run: pnpm build
        env:
          DATABASE_URL: ${{ secrets.DATABASE_URL_TEST }}
          AUTH_SECRET: test-secret-32-bytes-test-secret-32
          AUTH_URL: http://localhost:3000
          NEXT_PUBLIC_SITE_URL: http://localhost:3000
          RESEND_API_KEY: test
          EMAIL_FROM: noreply@example.com
          OWNER_EMAIL: owner@example.com
          OWNER_WHATSAPP: "34666123456"
          BLOB_READ_WRITE_TOKEN: test
```

- [ ] **Step 2: Migration workflow (on push to main)**

Create `.github/workflows/migrate.yml`:
```yaml
name: Migrate Production
on:
  push:
    branches: [main]

jobs:
  migrate:
    runs-on: ubuntu-latest
    environment: production
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
        with: { version: 9 }
      - uses: actions/setup-node@v4
        with: { node-version: 20, cache: pnpm }
      - run: pnpm install --frozen-lockfile
      - run: pnpm db:migrate
        env:
          DATABASE_URL: ${{ secrets.DATABASE_URL }}
```

(Vercel auto-deploys after this completes successfully because the workflow runs first on push; if you need strict ordering, configure Vercel to deploy only after this workflow's GitHub deployment status.)

- [ ] **Step 3: Commit**

```bash
git add .github
git commit -m "ci: github actions for tests and production migrations"
```

---

### Task 28: Vercel project setup + env vars + production deploy

**Files:**
- None new; configuration via Vercel CLI/dashboard.

- [ ] **Step 1: Link Vercel project**

```bash
pnpm dlx vercel@latest link
```

Follow prompts: select scope, link/create project named `ottibull` (or chosen name).

- [ ] **Step 2: Provision Neon Postgres via Marketplace**

In Vercel dashboard → Storage → Create → Neon Postgres. Connect to project. `DATABASE_URL` auto-populated for all envs.

- [ ] **Step 3: Provision Vercel Blob**

Storage → Create → Blob. Connect to project. `BLOB_READ_WRITE_TOKEN` auto-populated.

- [ ] **Step 4: Set remaining env vars**

For each env (Production, Preview, Development):
```bash
vercel env add AUTH_SECRET production
# paste output of: openssl rand -base64 32
vercel env add AUTH_URL production         # https://ottibull.com
vercel env add RESEND_API_KEY production   # from resend.com
vercel env add EMAIL_FROM production       # noreply@ottibull.com
vercel env add OWNER_EMAIL production      # info@ottibull.com
vercel env add OWNER_WHATSAPP production   # 34666123456 (E.164 no +)
vercel env add NEXT_PUBLIC_SITE_URL production  # https://ottibull.com
```
Repeat for `preview` and `development` with appropriate values.

- [ ] **Step 5: Verify Resend domain**

In Resend dashboard, add domain `ottibull.com`. Add SPF + DKIM records to DNS provider. Wait for verification.

- [ ] **Step 6: First production deploy**

```bash
git push origin main
```

Wait for migration workflow to complete, then for Vercel to deploy. Visit production URL.

- [ ] **Step 7: Seed production admin**

Pull production env to local:
```bash
vercel env pull .env.production.local
```
Run seed against production DB:
```bash
NODE_ENV=production pnpm tsx scripts/seed-admin.ts --email=admin@ottibull.com --password='<strong-password>'
```
Log in at `https://<deploy>/admin/login`.

- [ ] **Step 8: Smoke test production**

- Visit `/`, redirected to `/es`. ✓
- Visit `/sitemap.xml`. ✓
- Log in to `/admin`. ✓
- Create a vehicle, publish. Visit `/es/catalog`. ✓
- Submit an inquiry on the vehicle page. Verify email arrives at `OWNER_EMAIL`. Verify `/thank-you` shows WhatsApp button. Click → `wa.me` opens with pre-filled message. ✓

- [ ] **Step 9: Final commit**

(No code changes; deployment lives on Vercel.)

---

### Task 29: Custom domain + production hardening

**Files:**
- None new.

- [ ] **Step 1: Add custom domain**

Vercel dashboard → Domains → add `ottibull.com` and `www.ottibull.com`. Configure DNS (A record / CNAME per Vercel instructions).

- [ ] **Step 2: Update env**

```bash
vercel env rm NEXT_PUBLIC_SITE_URL production
vercel env add NEXT_PUBLIC_SITE_URL production   # https://ottibull.com
vercel env rm AUTH_URL production
vercel env add AUTH_URL production               # https://ottibull.com
```
Redeploy.

- [ ] **Step 3: Verify HTTPS, sitemap, OG**

- `https://ottibull.com/sitemap.xml` returns sitemap with `https://ottibull.com/...` URLs.
- Run https://www.opengraph.xyz/url/https%3A%2F%2Fottibull.com to verify OG card.
- Run https://search.google.com/test/rich-results on a vehicle URL — verify Product schema.

- [ ] **Step 4: Submit sitemap to Google**

Search Console → Sitemaps → submit `https://ottibull.com/sitemap.xml`.

- [ ] **Step 5: Lighthouse check**

Run Lighthouse on `https://ottibull.com/es` and a vehicle detail. Target: Performance > 90, SEO 100, Accessibility > 90.

If failures, file as follow-up tasks (image sizes, font preloading, etc.).

---

## Self-review summary

This plan covers, mapped to spec sections:

- **Tech stack** → Tasks 1, 3, 4, 5
- **Architecture & routing** → Tasks 1, 4, 7, 8, 18
- **Data model** → Task 3
- **Public flow** → Tasks 7–11, 14–16
- **Admin panel & auth** → Tasks 5, 6, 18–21
- **Notifications** → Tasks 12, 13, 15, 16
- **SEO & i18n** → Tasks 4, 8, 11, 22, 23, 24
- **Testing & deployment** → Tasks 9 (Vitest setup), 12, 13, 17, 26, 27, 28, 29

Risks captured by:
- Resend failure non-fatal → Task 16 step 2 catches the error.
- HMAC for `wa.me` → Task 12 + Task 16.
- Publish requires all 3 translations → Task 19 `validateForPublish`.
- `revalidatePath` after admin mutation → Task 19 helper.
- DB migration gate before deploy → Task 27.
