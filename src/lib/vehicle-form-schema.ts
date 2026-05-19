import { z } from "zod";
import { vehicleAttributesSchemas, type VehicleType } from "./vehicle-attributes";

// Spanish (es) is required (title + description). Catalan (ca) and English (en)
// are optional — when empty the public side falls back to the Spanish copy.
// metaTitle / metaDescription were removed from the admin UI; the schema no
// longer accepts them. Slug and status are derived server-side (slug from the
// Spanish title, status always "published") so they are not part of the form
// input either.
const translation = z.object({
  locale: z.enum(["es", "ca", "en"]),
  title: z.string().max(200).default(""),
  description: z.string().max(5000).default(""),
});

const image = z.object({
  url: z.string().url(),
  altText: z.string().optional().nullable(),
  sortOrder: z.coerce.number().int().default(0),
  isCover: z.coerce.boolean().default(false),
});

export const vehicleFormSchema = z.object({
  type: z.enum(["camper", "motorcycle", "car", "bicycle", "boat"]),
  basePricePerDay: z.coerce.number().min(0),
  minRentalDays: z.coerce.number().int().min(1).default(1),
  maxRentalDays: z.coerce.number().int().min(1).optional().nullable(),
  location: z.string().min(1),
  attributes: z.unknown(),
  featured: z.coerce.boolean().default(false),
  sortOrder: z.coerce.number().int().default(0),
  translations: z.array(translation).length(3),
  images: z.array(image).max(10),
});

export type VehicleFormInput = z.infer<typeof vehicleFormSchema>;

// Spanish-language validation: the admin UI is in Spanish, so all surfaced
// errors must be in Spanish.
export function validateForPublish(input: VehicleFormInput): string[] {
  const errors: string[] = [];

  if (input.basePricePerDay <= 0) {
    errors.push("El precio por día debe ser mayor que 0");
  }

  const es = input.translations.find((t) => t.locale === "es");
  if (!es || es.title.trim().length < 2) {
    errors.push("El título en español es obligatorio (mínimo 2 caracteres)");
  }
  if (!es || es.description.trim().length < 10) {
    errors.push("La descripción en español es obligatoria (mínimo 10 caracteres)");
  }

  // Local dev only: skip the image requirement so test vehicles can be created
  // without uploads. Vercel builds (preview + prod) run with NODE_ENV=production.
  if (process.env.NODE_ENV !== "development") {
    if (input.images.length === 0) {
      errors.push("Se requiere al menos una imagen");
    } else if (!input.images.some((i) => i.isCover)) {
      errors.push("Se requiere una imagen de portada");
    }
  }

  const attrSchema = vehicleAttributesSchemas[input.type as VehicleType];
  const attrResult = attrSchema.safeParse(input.attributes);
  if (!attrResult.success) {
    const details = attrResult.error.issues
      .map((i) => `${i.path.join(".") || "(raíz)"}: ${i.message}`)
      .join(", ");
    errors.push(`Atributos inválidos para ${input.type}: ${details}`);
  }

  return errors;
}

const DIACRITIC_RE = /[̀-ͯ]/g;

export function slugifyTitle(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(DIACRITIC_RE, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
