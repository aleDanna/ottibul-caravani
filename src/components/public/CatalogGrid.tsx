import { getTranslations } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import { VehicleCard, type VehicleCardData } from "./VehicleCard";

export async function CatalogGrid({
  vehicles,
  locale,
}: {
  vehicles: VehicleCardData[];
  locale: Locale;
}) {
  const t = await getTranslations({ locale, namespace: "catalog" });

  if (vehicles.length === 0) {
    return (
      <div
        className="mx-auto max-w-lg rounded-[var(--radius-lg)] border p-10 text-center"
        style={{
          borderColor: "var(--border-subtle)",
          background: "var(--bg-elevated)",
          color: "var(--fg-3)",
        }}
      >
        <p>{t("empty")}</p>
      </div>
    );
  }
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {vehicles.map((v) => (
        <VehicleCard key={v.id} locale={locale} vehicle={v} />
      ))}
    </div>
  );
}
