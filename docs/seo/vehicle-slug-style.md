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
