"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { eq, and, ne } from "drizzle-orm";
import { db } from "@/db/client";
import { vehicles, vehicleTranslations, vehicleImages } from "@/db/schema";
import { requireAdminSession } from "@/lib/auth";
import {
  vehicleFormSchema,
  validateForPublish,
  slugifyTitle,
  type VehicleFormInput,
} from "@/lib/vehicle-form-schema";
import { routing } from "@/i18n/routing";

function revalidateForVehicle(slug: string) {
  for (const locale of routing.locales) {
    revalidatePath(`/${locale}`);
    revalidatePath(`/${locale}/catalog`);
    revalidatePath(`/${locale}/vehicles/${slug}`);
  }
}

function spanishZodErrors(issues: readonly { path: readonly PropertyKey[]; message: string }[]): string {
  return issues
    .map((i) => `${i.path.map(String).join(".") || "(raíz)"}: ${i.message}`)
    .join("; ");
}

async function ensureUniqueSlug(base: string, ignoreId?: string): Promise<string> {
  let candidate = base || "vehiculo";
  let suffix = 1;
  while (true) {
    const where = ignoreId
      ? and(eq(vehicles.slug, candidate), ne(vehicles.id, ignoreId))
      : eq(vehicles.slug, candidate);
    const existing = await db.query.vehicles.findFirst({ where });
    if (!existing) return candidate;
    suffix += 1;
    candidate = `${base || "vehiculo"}-${suffix}`;
  }
}

// Translations are saved only when both title and description are filled.
// Catalan / English are optional — the public side falls back to Spanish.
function translationsToPersist(input: VehicleFormInput) {
  return input.translations
    .filter((t) => t.title.trim().length > 0 && t.description.trim().length > 0)
    .map((t) => ({
      locale: t.locale,
      title: t.title.trim(),
      description: t.description.trim(),
    }));
}

export async function createVehicleAction(input: VehicleFormInput) {
  await requireAdminSession();
  const parsed = vehicleFormSchema.safeParse(input);
  if (!parsed.success) {
    return { error: spanishZodErrors(parsed.error.issues) || "Validación fallida" };
  }
  const errors = validateForPublish(parsed.data);
  if (errors.length) return { error: errors.join("; ") };

  const esTitle = parsed.data.translations.find((t) => t.locale === "es")?.title ?? "";
  const slug = await ensureUniqueSlug(slugifyTitle(esTitle));

  const [v] = await db
    .insert(vehicles)
    .values({
      slug,
      type: parsed.data.type,
      basePricePerDay: parsed.data.basePricePerDay.toFixed(2),
      minRentalDays: parsed.data.minRentalDays,
      maxRentalDays: parsed.data.maxRentalDays ?? null,
      location: parsed.data.location,
      attributes: parsed.data.attributes,
      status: "published",
      featured: parsed.data.featured,
      sortOrder: parsed.data.sortOrder,
    })
    .returning();

  const tRows = translationsToPersist(parsed.data);
  if (tRows.length) {
    await db.insert(vehicleTranslations).values(
      tRows.map((t) => ({
        vehicleId: v.id,
        locale: t.locale,
        title: t.title,
        description: t.description,
      })),
    );
  }

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
  return { ok: true as const };
}

export async function updateVehicleAction(id: string, input: VehicleFormInput) {
  await requireAdminSession();
  const parsed = vehicleFormSchema.safeParse(input);
  if (!parsed.success) {
    return { error: spanishZodErrors(parsed.error.issues) || "Validación fallida" };
  }
  const errors = validateForPublish(parsed.data);
  if (errors.length) return { error: errors.join("; ") };

  const existing = await db.query.vehicles.findFirst({ where: eq(vehicles.id, id) });
  if (!existing) return { error: "Vehículo no encontrado" };

  await db
    .update(vehicles)
    .set({
      type: parsed.data.type,
      basePricePerDay: parsed.data.basePricePerDay.toFixed(2),
      minRentalDays: parsed.data.minRentalDays,
      maxRentalDays: parsed.data.maxRentalDays ?? null,
      location: parsed.data.location,
      attributes: parsed.data.attributes,
      status: "published",
      featured: parsed.data.featured,
      sortOrder: parsed.data.sortOrder,
      updatedAt: new Date(),
    })
    .where(eq(vehicles.id, id));

  await db.delete(vehicleTranslations).where(eq(vehicleTranslations.vehicleId, id));
  const tRows = translationsToPersist(parsed.data);
  if (tRows.length) {
    await db.insert(vehicleTranslations).values(
      tRows.map((t) => ({
        vehicleId: id,
        locale: t.locale,
        title: t.title,
        description: t.description,
      })),
    );
  }

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

  revalidateForVehicle(existing.slug);
  return { ok: true as const };
}

export async function deleteVehicleAction(id: string) {
  await requireAdminSession();
  const [v] = await db.select().from(vehicles).where(eq(vehicles.id, id)).limit(1);
  if (!v) return { error: "Vehículo no encontrado" };
  await db.delete(vehicles).where(eq(vehicles.id, id));
  revalidateForVehicle(v.slug);
  redirect("/admin/vehicles");
}
