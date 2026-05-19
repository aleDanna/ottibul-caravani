# Phone Country Prefix on Inquiry Form — Design

**Date:** 2026-05-19
**Status:** Approved, ready for implementation plan

## Problem

The public inquiry form at [src/components/public/InquiryForm.tsx](../../../src/components/public/InquiryForm.tsx) fails validation for any phone number entered without an explicit `+<country>` prefix. The schema at [src/lib/inquiry-schema.ts:10](../../../src/lib/inquiry-schema.ts:10) validates via `libphonenumber-js`'s `isValidPhoneNumber(v)` with no country context, which only accepts E.164-formatted input (`+34666...`). A Spanish customer typing `666 12 34 56` is rejected as "invalid phone" and cannot submit.

## Goal

Customers can enter their phone number without prior knowledge of E.164 formatting, while the server still receives a normalized international number for downstream use (transactional email, WhatsApp deep link).

## Non-goals

- Live formatting / mask while typing
- Country autocomplete or search inside the dropdown
- Client-side validation (the form keeps its server-action + Zod model)
- Support for every country on Earth (~250) — out of scope for current audience

## Design

### UX

Replace the single phone input with a two-control row:

```
Teléfono
┌──────────────────────┬──────────────────────────────────────┐
│ 🇪🇸 España (+34) ▾ │ 666 12 34 56                          │
└──────────────────────┴──────────────────────────────────────┘
```

- Default selected country: **ES** (always, regardless of locale)
- Both controls share the existing `inputClass` and `inputStyle` so they match all other fields visually
- Country `<select>` uses `flex-shrink-0` and a fixed-ish width; the number `<input>` grows
- Single error message appears below the row when validation fails (existing behavior)

### Country list

A curated list of ~20 countries covering the EU tourism market + close neighbors. Order: ES first (default), then alphabetical by ISO code.

| ISO | Native name      | Dial code | Flag |
|-----|------------------|-----------|------|
| ES  | España           | +34       | 🇪🇸  |
| AD  | Andorra          | +376      | 🇦🇩  |
| AT  | Österreich       | +43       | 🇦🇹  |
| BE  | België           | +32       | 🇧🇪  |
| CH  | Schweiz          | +41       | 🇨🇭  |
| DE  | Deutschland      | +49       | 🇩🇪  |
| DK  | Danmark          | +45       | 🇩🇰  |
| FI  | Suomi            | +358      | 🇫🇮  |
| FR  | France           | +33       | 🇫🇷  |
| GB  | United Kingdom   | +44       | 🇬🇧  |
| IE  | Ireland          | +353      | 🇮🇪  |
| IT  | Italia           | +39       | 🇮🇹  |
| LU  | Luxembourg       | +352      | 🇱🇺  |
| MA  | المغرب           | +212      | 🇲🇦  |
| NL  | Nederland        | +31       | 🇳🇱  |
| NO  | Norge            | +47       | 🇳🇴  |
| PL  | Polska           | +48       | 🇵🇱  |
| PT  | Portugal         | +351      | 🇵🇹  |
| SE  | Sverige          | +46       | 🇸🇪  |
| US  | United States    | +1        | 🇺🇸  |

Native names avoid the need for translation across the three locales (`es`/`ca`/`en`).

`<option>` text format: `{flag} {nativeName} (+{dialCode})` — e.g. `🇪🇸 España (+34)`.

### Data flow

```
form submit
   ├── phoneCountry: "ES"          (FormData)
   └── phone: "666123456"          (FormData)
        │
        ▼
   inquirySchema.safeParse
        │
        ├── refine: isValidPhoneNumber(phone, phoneCountry)
        │     - accepts "666123456" (national) and "+34666123456" (E.164)
        │
        └── transform: phone → parsePhoneNumberFromString(...).number
              - normalizes to "+34666123456" (E.164 canonical)
              - phoneCountry stripped from output (not part of InquiryInput)
        │
        ▼
   downstream consumers receive E.164 only
        - sendInquiryEmail({ customerPhone: "+34666123456" })
        - buildWhatsAppUrl({ customerPhone: "+34666123456" })
```

The transform ensures that no consumer ever sees a half-formatted number, and the existing call sites in [src/app/actions/inquiries.ts](../../../src/app/actions/inquiries.ts) do not need to change.

### File changes

1. **`src/lib/countries.ts`** (new) — data-only module exporting:
   - `SUPPORTED_COUNTRIES`: readonly tuple of ISO codes (used by Zod `z.enum`)
   - `COUNTRY_OPTIONS`: array of `{ code, nativeName, dialCode, flag }` for the `<select>`

2. **`src/lib/inquiry-schema.ts`** — schema changes:
   - Add `phoneCountry: z.enum(SUPPORTED_COUNTRIES).default("ES")`
   - Change `phone` validation from standalone refine to object-level refine that checks `isValidPhoneNumber(d.phone, d.phoneCountry)`
   - Add object-level `.transform()` that normalizes `phone` to E.164 and drops `phoneCountry`

3. **`src/components/public/InquiryForm.tsx`** — UI:
   - Wrap phone label + a flex row containing `<select name="phoneCountry">` and `<input name="phone">`
   - Render options from `COUNTRY_OPTIONS`
   - Default selection: `defaultValue="ES"`
   - Error rendering unchanged

### Error handling

- The Zod refine continues to emit the literal `"invalid phone"` message. The form already renders `state.fieldErrors.phone` raw (no `t()` wrapping), consistent with every other field error in [src/components/public/InquiryForm.tsx](../../../src/components/public/InquiryForm.tsx). The translation key `form.errorPhone` exists in the message files but is unused today; introducing i18n for server-action errors is **out of scope** for this change.
- `phoneCountry` validation failure is treated silently. The `<select>` only ever submits one of the supported ISO codes, so `z.enum(...)` failing implies form tampering. No user-facing error for this field.

### Behavior: mismatched country + `+` prefix

If the user selects "ES" but types `+39 333 1234567`, `libphonenumber-js` trusts the `+` prefix (the country hint is ignored when the input is already in international format). We **accept** this case:
- Validation passes against the actual country in the prefix
- `parsePhoneNumberFromString("+393331234567", "ES").number` returns `"+393331234567"` (Italian E.164)
- `phoneCountry` is dropped from the schema output, so downstream consumers never see the inconsistency

This is the most permissive useful behavior and avoids penalizing a user who already knows their international format.

### Testing

- Unit test [tests/unit/lib/inquiry-schema.test.ts] (or create) covering:
  - `ES` + `"666123456"` → valid, normalized to `"+34666123456"`
  - `ES` + `"+34666123456"` → valid, unchanged
  - `ES` + `"+39 333 1234567"` (mismatched country) → valid, normalized to `"+393331234567"` (the `+` prefix overrides the country hint; see "Behavior: mismatched country + `+` prefix" above)
  - `FR` + `"06 12 34 56 78"` → valid
  - `ES` + `"123"` → invalid
- Manual: load the form in dev, submit with a Spanish number without prefix, confirm success path

## Out of scope (deferred / YAGNI)

- Server-side detection of user's country via IP
- Persisting last-used country in localStorage
- Full ~250 country list — add countries only when a real user reports a missing one
- Switching to a third-party phone-input component (would force the form to become a controlled client component, breaking the uncontrolled FormData pattern used by every other field)

## Risks

- **Flag emoji rendering**: on some Windows browsers, region-indicator emoji render as ISO letter pairs (e.g. `ES` instead of 🇪🇸). Acceptable degradation — the dial code + native name still convey country. No workaround needed.
- **Mismatched country + +prefix**: if a user picks "ES" then types `+39 ...`, `libphonenumber-js` typically trusts the `+` prefix. We accept this; the normalized E.164 will reflect the actual country code. Test will document chosen behavior.
