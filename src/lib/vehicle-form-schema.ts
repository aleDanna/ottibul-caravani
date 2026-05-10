import { z } from "zod";
import { vehicleAttributesSchemas, type VehicleType } from "./vehicle-attributes";

// For DRAFT vehicles we accept partially-filled translations + attributes.
// Strict content checks (title length, all 3 locales filled, attributes
// validated against the type-specific schema) only apply when the admin
// flips the status to "published" — see validateForPublish below.
const translation = z.object({
  locale: z.enum(["es", "ca", "en"]),
  title: z.string().max(200),
  description: z.string().max(5000),
  metaTitle: z.string().optional().or(z.literal("")),
  metaDescription: z.string().optional().or(z.literal("")),
});

const image = z.object({
  url: z.string().url(),
  altText: z.string().optional().nullable(),
  sortOrder: z.coerce.number().int().default(0),
  isCover: z.coerce.boolean().default(false),
});

export const vehicleFormSchema = z.object({
  slug: z.string().regex(/^[a-z0-9-]+$/, "Only lowercase letters, digits, hyphens"),
  type: z.enum(["camper", "motorcycle", "car", "bicycle", "boat"]),
  basePricePerDay: z.coerce.number().min(0),
  minRentalDays: z.coerce.number().int().min(1).default(1),
  maxRentalDays: z.coerce.number().int().min(1).optional().nullable(),
  location: z.string().min(1),
  attributes: z.unknown(),
  status: z.enum(["draft", "published"]),
  featured: z.coerce.boolean().default(false),
  sortOrder: z.coerce.number().int().default(0),
  translations: z.array(translation).length(3),
  images: z.array(image).max(10),
});

export type VehicleFormInput = z.infer<typeof vehicleFormSchema>;

export function validateForPublish(input: VehicleFormInput): string[] {
  // Drafts pass through with whatever the user has so far.
  if (input.status !== "published") return [];

  const errors: string[] = [];

  if (input.basePricePerDay <= 0) {
    errors.push("Price per day must be greater than 0 to publish");
  }

  // Translations: all 3 locales filled with non-empty title + description
  const locales = new Set(input.translations.map((t) => t.locale));
  for (const expected of ["es", "ca", "en"] as const) {
    if (!locales.has(expected)) {
      errors.push(`Missing translation for "${expected}"`);
    }
  }
  for (const t of input.translations) {
    if (!t.title || t.title.trim().length < 2) {
      errors.push(`Translation "${t.locale}": title required (≥ 2 chars)`);
    }
    if (!t.description || t.description.trim().length < 10) {
      errors.push(`Translation "${t.locale}": description required (≥ 10 chars)`);
    }
  }

  // Images
  if (input.images.length === 0) {
    errors.push("At least one image required to publish");
  } else if (!input.images.some((i) => i.isCover)) {
    errors.push("Cover image required to publish");
  }

  // Attributes against the type-specific schema
  const attrSchema = vehicleAttributesSchemas[input.type as VehicleType];
  const attrResult = attrSchema.safeParse(input.attributes);
  if (!attrResult.success) {
    const details = attrResult.error.issues
      .map((i) => `${i.path.join(".") || "(root)"}: ${i.message}`)
      .join(", ");
    errors.push(`Invalid attributes for ${input.type}: ${details}`);
  }

  return errors;
}
