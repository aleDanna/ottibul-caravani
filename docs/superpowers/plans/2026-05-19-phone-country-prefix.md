# Phone Country Prefix on Inquiry Form Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a country prefix `<select>` to the public inquiry form so phone numbers entered without a `+` prefix validate correctly, and the server emits a normalized E.164 number to email + WhatsApp.

**Architecture:** Three small, isolated changes — a new data-only `countries` module, an updated Zod schema with country-aware validation + E.164 normalization transform, and a UI tweak that places a `<select>` next to the existing phone `<input>` while preserving the form's uncontrolled FormData pattern.

**Tech Stack:** TypeScript, Zod, `libphonenumber-js` (already a dep), Vitest (Node env, no RTL), React Server Component form with `useActionState`.

**Spec:** [docs/superpowers/specs/2026-05-19-phone-country-prefix-design.md](../specs/2026-05-19-phone-country-prefix-design.md)

---

### Task 1: Create the `countries` data module

**Files:**
- Create: `src/lib/countries.ts`
- Create: `tests/unit/lib/countries.test.ts`

- [ ] **Step 1: Write the failing test**

Create `tests/unit/lib/countries.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { SUPPORTED_COUNTRIES, COUNTRY_OPTIONS } from "@/lib/countries";

describe("countries", () => {
  it("lists ES first as the default", () => {
    expect(SUPPORTED_COUNTRIES[0]).toBe("ES");
  });

  it("has matching entries between SUPPORTED_COUNTRIES and COUNTRY_OPTIONS", () => {
    expect(COUNTRY_OPTIONS.map((c) => c.code)).toEqual([...SUPPORTED_COUNTRIES]);
  });

  it("provides flag, native name, and dial code for every country", () => {
    for (const c of COUNTRY_OPTIONS) {
      expect(c.flag).toMatch(/^\p{Regional_Indicator}\p{Regional_Indicator}$/u);
      expect(c.nativeName.length).toBeGreaterThan(0);
      expect(c.dialCode).toMatch(/^\+\d{1,4}$/);
    }
  });

  it("has no duplicate ISO codes", () => {
    const codes = COUNTRY_OPTIONS.map((c) => c.code);
    expect(new Set(codes).size).toBe(codes.length);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm test tests/unit/lib/countries.test.ts`
Expected: FAIL with "Cannot find module '@/lib/countries'"

- [ ] **Step 3: Write the data module**

Create `src/lib/countries.ts`:

```ts
export const SUPPORTED_COUNTRIES = [
  "ES", "AD", "AT", "BE", "CH", "DE", "DK", "FI", "FR", "GB",
  "IE", "IT", "LU", "MA", "NL", "NO", "PL", "PT", "SE", "US",
] as const;

export type SupportedCountry = (typeof SUPPORTED_COUNTRIES)[number];

export type CountryOption = {
  code: SupportedCountry;
  nativeName: string;
  dialCode: string;
  flag: string;
};

export const COUNTRY_OPTIONS: readonly CountryOption[] = [
  { code: "ES", nativeName: "España",         dialCode: "+34",  flag: "🇪🇸" },
  { code: "AD", nativeName: "Andorra",        dialCode: "+376", flag: "🇦🇩" },
  { code: "AT", nativeName: "Österreich",     dialCode: "+43",  flag: "🇦🇹" },
  { code: "BE", nativeName: "België",         dialCode: "+32",  flag: "🇧🇪" },
  { code: "CH", nativeName: "Schweiz",        dialCode: "+41",  flag: "🇨🇭" },
  { code: "DE", nativeName: "Deutschland",    dialCode: "+49",  flag: "🇩🇪" },
  { code: "DK", nativeName: "Danmark",        dialCode: "+45",  flag: "🇩🇰" },
  { code: "FI", nativeName: "Suomi",          dialCode: "+358", flag: "🇫🇮" },
  { code: "FR", nativeName: "France",         dialCode: "+33",  flag: "🇫🇷" },
  { code: "GB", nativeName: "United Kingdom", dialCode: "+44",  flag: "🇬🇧" },
  { code: "IE", nativeName: "Ireland",        dialCode: "+353", flag: "🇮🇪" },
  { code: "IT", nativeName: "Italia",         dialCode: "+39",  flag: "🇮🇹" },
  { code: "LU", nativeName: "Luxembourg",     dialCode: "+352", flag: "🇱🇺" },
  { code: "MA", nativeName: "المغرب",          dialCode: "+212", flag: "🇲🇦" },
  { code: "NL", nativeName: "Nederland",      dialCode: "+31",  flag: "🇳🇱" },
  { code: "NO", nativeName: "Norge",          dialCode: "+47",  flag: "🇳🇴" },
  { code: "PL", nativeName: "Polska",         dialCode: "+48",  flag: "🇵🇱" },
  { code: "PT", nativeName: "Portugal",       dialCode: "+351", flag: "🇵🇹" },
  { code: "SE", nativeName: "Sverige",        dialCode: "+46",  flag: "🇸🇪" },
  { code: "US", nativeName: "United States",  dialCode: "+1",   flag: "🇺🇸" },
];
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `pnpm test tests/unit/lib/countries.test.ts`
Expected: PASS — all 4 tests green.

- [ ] **Step 5: Commit**

```bash
git add src/lib/countries.ts tests/unit/lib/countries.test.ts
git commit -m "feat(inquiry): add supported-countries data module"
```

---

### Task 2: Update inquiry schema with country-aware validation + E.164 normalization

**Files:**
- Modify: `src/lib/inquiry-schema.ts`
- Create: `tests/unit/lib/inquiry-schema.test.ts`

- [ ] **Step 1: Write the failing tests**

Create `tests/unit/lib/inquiry-schema.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { inquirySchema } from "@/lib/inquiry-schema";

const base = {
  vehicleId: "11111111-1111-1111-1111-111111111111",
  locale: "es",
  name: "María González",
  email: "maria@example.com",
  checkIn: "2026-06-01",
  checkOut: "2026-06-08",
  guests: "2",
  message: "",
  consent: "on",
  websiteUrl: "",
};

describe("inquirySchema phone validation", () => {
  it("accepts a Spanish national number with phoneCountry=ES and normalizes to E.164", () => {
    const result = inquirySchema.safeParse({
      ...base,
      phoneCountry: "ES",
      phone: "666 12 34 56",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.phone).toBe("+34666123456");
    }
  });

  it("accepts an already-E.164 number and leaves it normalized", () => {
    const result = inquirySchema.safeParse({
      ...base,
      phoneCountry: "ES",
      phone: "+34666123456",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.phone).toBe("+34666123456");
    }
  });

  it("trusts the + prefix when the dialed country mismatches the selected country", () => {
    const result = inquirySchema.safeParse({
      ...base,
      phoneCountry: "ES",
      phone: "+39 333 123 4567",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.phone).toBe("+393331234567");
    }
  });

  it("validates a French number against phoneCountry=FR", () => {
    const result = inquirySchema.safeParse({
      ...base,
      phoneCountry: "FR",
      phone: "06 12 34 56 78",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.phone).toBe("+33612345678");
    }
  });

  it("rejects an obviously invalid number", () => {
    const result = inquirySchema.safeParse({
      ...base,
      phoneCountry: "ES",
      phone: "123",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const phoneIssue = result.error.issues.find((i) => i.path[0] === "phone");
      expect(phoneIssue?.message).toBe("invalid phone");
    }
  });

  it("defaults phoneCountry to ES when omitted", () => {
    const result = inquirySchema.safeParse({
      ...base,
      phone: "666123456",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.phone).toBe("+34666123456");
    }
  });

  it("rejects an unsupported phoneCountry value", () => {
    const result = inquirySchema.safeParse({
      ...base,
      phoneCountry: "XX",
      phone: "+34666123456",
    });
    expect(result.success).toBe(false);
  });

  it("drops phoneCountry from the parsed output", () => {
    const result = inquirySchema.safeParse({
      ...base,
      phoneCountry: "ES",
      phone: "666123456",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect((result.data as Record<string, unknown>).phoneCountry).toBeUndefined();
    }
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `pnpm test tests/unit/lib/inquiry-schema.test.ts`
Expected: FAIL — first tests fail because `phoneCountry` isn't a known key, normalization doesn't happen, etc.

- [ ] **Step 3: Update the schema**

Replace the full contents of `src/lib/inquiry-schema.ts` with:

```ts
import { z } from "zod";
import { isValidPhoneNumber, parsePhoneNumberFromString } from "libphonenumber-js";
import { SUPPORTED_COUNTRIES } from "@/lib/countries";

export const inquirySchema = z
  .object({
    vehicleId: z.string().uuid(),
    locale: z.enum(["es", "ca", "en"]),
    name: z.string().min(2).max(120),
    email: z.string().email(),
    phoneCountry: z.enum(SUPPORTED_COUNTRIES).default("ES"),
    phone: z.string().min(1),
    checkIn: z.coerce.date(),
    checkOut: z.coerce.date(),
    guests: z.coerce.number().int().min(1).max(20),
    message: z.string().max(2000).optional().or(z.literal("")),
    consent: z.union([z.literal("on"), z.literal(true), z.literal("true")]).transform(() => true),
    websiteUrl: z.string().max(0).optional().default(""), // honeypot
  })
  .refine((d) => d.checkOut > d.checkIn, {
    message: "checkOut must be after checkIn",
    path: ["checkOut"],
  })
  .refine((d) => isValidPhoneNumber(d.phone, d.phoneCountry), {
    message: "invalid phone",
    path: ["phone"],
  })
  .transform(({ phoneCountry, ...rest }) => ({
    ...rest,
    phone: parsePhoneNumberFromString(rest.phone, phoneCountry)!.number,
  }));

export type InquiryInput = z.infer<typeof inquirySchema>;
```

Key changes from the previous version:
- Added `phoneCountry` with default `"ES"` and `z.enum(SUPPORTED_COUNTRIES)`
- `phone` is now plain `z.string().min(1)` — validation moved to the outer object-level `.refine` so it can read `phoneCountry`
- Added `.transform()` that normalizes `phone` to E.164 (`parsePhoneNumberFromString(...).number`) and drops `phoneCountry` from the output via destructuring

The non-null assertion (`!`) is safe because the preceding refine guarantees the number is parseable.

- [ ] **Step 4: Run tests to verify they pass**

Run: `pnpm test tests/unit/lib/inquiry-schema.test.ts`
Expected: PASS — all 8 tests green.

- [ ] **Step 5: Run full test suite to check nothing else broke**

Run: `pnpm test`
Expected: PASS — every existing test (`whatsapp`, `hmac`, `vehicle-attributes`, etc.) remains green.

- [ ] **Step 6: Run TypeScript check**

Run: `pnpm typecheck`
Expected: no type errors. In particular, [src/app/actions/inquiries.ts](../../../src/app/actions/inquiries.ts) consumers (`data.phone` etc.) keep compiling because the transform output still has a `phone: string` field.

- [ ] **Step 7: Commit**

```bash
git add src/lib/inquiry-schema.ts tests/unit/lib/inquiry-schema.test.ts
git commit -m "feat(inquiry): validate phone against country + normalize to E.164"
```

---

### Task 3: Wire the country `<select>` into the inquiry form

**Files:**
- Modify: `src/components/public/InquiryForm.tsx`

- [ ] **Step 1: Locate the phone block in the form**

Open [src/components/public/InquiryForm.tsx](../../../src/components/public/InquiryForm.tsx). Find lines 56–62, which currently render:

```tsx
<div>
  <label className="block text-sm font-medium">{t("phone")}</label>
  <input name="phone" type="tel" required className={inputClass} style={inputStyle} />
  {state.fieldErrors?.phone && (
    <p className="mt-1 text-xs" style={{ color: "var(--terra-700)" }}>{state.fieldErrors.phone}</p>
  )}
</div>
```

- [ ] **Step 2: Replace that block with a country `<select>` + phone `<input>` row**

Replace lines 56–62 with:

```tsx
<div>
  <label className="block text-sm font-medium">{t("phone")}</label>
  <div className="mt-1 flex gap-2">
    <select
      name="phoneCountry"
      defaultValue="ES"
      aria-label="Country code"
      className={`${inputClass} mt-0 flex-shrink-0`}
      style={{ ...inputStyle, width: "auto" }}
    >
      {COUNTRY_OPTIONS.map((c) => (
        <option key={c.code} value={c.code}>
          {c.flag} {c.nativeName} ({c.dialCode})
        </option>
      ))}
    </select>
    <input
      name="phone"
      type="tel"
      required
      className={`${inputClass} mt-0 min-w-0 flex-1`}
      style={inputStyle}
    />
  </div>
  {state.fieldErrors?.phone && (
    <p className="mt-1 text-xs" style={{ color: "var(--terra-700)" }}>{state.fieldErrors.phone}</p>
  )}
</div>
```

Notes:
- The outer `<div>` keeps the label spacing; the inner flex row gets `mt-1` (matches the spacing previously applied by `inputClass`'s `mt-1` on the bare input).
- `mt-0` on the children cancels `inputClass`'s `mt-1` so the controls align on the same baseline.
- `flex-shrink-0` + `width: auto` keeps the select snug; `min-w-0 flex-1` lets the input shrink properly inside flex (avoids overflow on narrow viewports).

- [ ] **Step 3: Add the import**

At the top of `src/components/public/InquiryForm.tsx`, add this import (alongside the existing imports):

```tsx
import { COUNTRY_OPTIONS } from "@/lib/countries";
```

- [ ] **Step 4: Run TypeScript check**

Run: `pnpm typecheck`
Expected: no errors.

- [ ] **Step 5: Run the dev server and manually verify**

Run: `pnpm dev`
Open a vehicle detail page (one with `status: "published"`) in the browser. For each case below, scroll to the inquiry form and try to submit:

| Country selected | Phone input        | Expected result                                       |
|------------------|--------------------|-------------------------------------------------------|
| 🇪🇸 España (+34) | `666 12 34 56`     | Submits; redirects to `/[locale]/thank-you?w=...`      |
| 🇪🇸 España (+34) | `+34 666 123 456`  | Submits successfully                                   |
| 🇫🇷 France (+33) | `06 12 34 56 78`   | Submits successfully                                   |
| 🇪🇸 España (+34) | `123`              | Stays on page, shows "invalid phone" under field       |
| 🇪🇸 España (+34) | empty              | Browser-native "required" tooltip blocks submit        |

Also verify visually:
- The select + input sit on the same row at desktop width
- The row does not overflow on mobile width (use DevTools responsive mode at 390px)
- The country dropdown opens and lists all 20 countries with flags

- [ ] **Step 6: Commit**

```bash
git add src/components/public/InquiryForm.tsx
git commit -m "feat(inquiry): country selector next to phone input"
```

---

### Task 4: Sanity-check the downstream consumers

**Files:**
- Read-only: `src/app/actions/inquiries.ts`, `src/lib/whatsapp.ts`, `src/emails/inquiry-received.tsx`

- [ ] **Step 1: Verify consumers don't need changes**

Read each file and confirm that `data.phone` (now guaranteed E.164 like `+34666123456`) is used in a way that benefits from international format:

- `src/app/actions/inquiries.ts:65,87` — passes `data.phone` through to email + WhatsApp URL builder. E.164 is exactly what they want.
- `src/lib/whatsapp.ts` — the `customerPhone` field appears inside the WhatsApp message text. E.164 with `+` is the standard display format, so this is an improvement, not a regression.
- `src/emails/inquiry-received.tsx` — displays the phone in the email body. E.164 is unambiguous and clickable in most mail clients via the `tel:` scheme.

No changes required.

- [ ] **Step 2: Commit if you made any consumer adjustments (likely none)**

If Step 1 confirmed no changes, skip this step. Otherwise:

```bash
git add <changed files>
git commit -m "fix(inquiry): downstream consumer adjustments for E.164 phone"
```

---

## Done

After Task 3 ships:
- The form accepts national-format numbers for every supported country
- All downstream emails + WhatsApp deep links carry a normalized E.164 number
- The bug from the screenshot ("invalid phone" on a valid Spanish number) is gone
