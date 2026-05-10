import { z } from "zod";
import { vehicleAttributesSchemas, type VehicleType } from "./vehicle-attributes";

const translation = z.object({
  locale: z.enum(["es", "ca", "en"]),
  title: z.string().min(2),
  description: z.string().min(10),
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
  basePricePerDay: z.coerce.number().positive(),
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
  const errors: string[] = [];
  if (input.status === "published") {
    const locales = input.translations.map((t) => t.locale);
    if (!["es", "ca", "en"].every((l) => locales.includes(l as "es"))) {
      errors.push("All 3 translations (es/ca/en) required to publish");
    }
    if (input.images.length === 0) errors.push("At least one image required to publish");
    if (!input.images.some((i) => i.isCover)) errors.push("Cover image required to publish");
  }
  // Validate attributes against the type-specific schema
  const attrSchema = vehicleAttributesSchemas[input.type as VehicleType];
  const attrResult = attrSchema.safeParse(input.attributes);
  if (!attrResult.success) errors.push(`Invalid attributes for ${input.type}`);
  return errors;
}
