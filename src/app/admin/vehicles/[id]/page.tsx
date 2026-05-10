import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/db/client";
import { vehicles } from "@/db/schema";
import { VehicleForm } from "@/components/admin/VehicleForm";
import type { VehicleFormInput } from "@/lib/vehicle-form-schema";

export const dynamic = "force-dynamic";

export default async function EditVehiclePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const v = await db.query.vehicles.findFirst({
    where: eq(vehicles.id, id),
    with: { translations: true, images: true },
  });
  if (!v) notFound();

  // Hydrate the 3 locales from DB rows; fill missing with empty.
  const tByLocale = Object.fromEntries(v.translations.map((t) => [t.locale, t]));
  const translations: VehicleFormInput["translations"] = (["es", "ca", "en"] as const).map((l) => ({
    locale: l,
    title: tByLocale[l]?.title ?? "",
    description: tByLocale[l]?.description ?? "",
    metaTitle: tByLocale[l]?.metaTitle ?? "",
    metaDescription: tByLocale[l]?.metaDescription ?? "",
  }));

  const initial: VehicleFormInput & { id: string } = {
    id: v.id,
    slug: v.slug,
    type: v.type,
    basePricePerDay: Number(v.basePricePerDay),
    minRentalDays: v.minRentalDays,
    maxRentalDays: v.maxRentalDays,
    location: v.location,
    attributes: v.attributes,
    status: v.status,
    featured: v.featured,
    sortOrder: v.sortOrder,
    translations,
    images: v.images.map((img) => ({
      url: img.url,
      altText: img.altText,
      sortOrder: img.sortOrder,
      isCover: img.isCover,
    })),
  };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl">Editar vehículo</h1>
      <VehicleForm mode="edit" initial={initial} />
    </div>
  );
}
