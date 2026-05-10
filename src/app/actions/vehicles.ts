"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db } from "@/db/client";
import { vehicles, vehicleTranslations, vehicleImages } from "@/db/schema";
import { requireAdminSession } from "@/lib/auth";
import {
  vehicleFormSchema,
  validateForPublish,
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

export async function createVehicleAction(input: VehicleFormInput) {
  await requireAdminSession();
  const parsed = vehicleFormSchema.safeParse(input);
  if (!parsed.success) {
    return { error: "Validation failed", issues: parsed.error.issues };
  }
  const errors = validateForPublish(parsed.data);
  if (errors.length) return { error: errors.join("; ") };

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
  if (!parsed.success) {
    return { error: "Validation failed", issues: parsed.error.issues };
  }
  const errors = validateForPublish(parsed.data);
  if (errors.length) return { error: errors.join("; ") };

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

  // Replace translations + images (simple, idempotent diff)
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
  if (!v) return { error: "Not found" };
  await db.delete(vehicles).where(eq(vehicles.id, id));
  revalidateForVehicle(v.slug);
  redirect("/admin/vehicles");
}
