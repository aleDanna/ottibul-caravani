import Link from "next/link";
import { getTranslations } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import type { VehicleType } from "@/lib/vehicle-attributes";

const TYPES: VehicleType[] = ["camper", "motorcycle", "car", "bicycle", "boat"];

const TYPE_KEY: Record<VehicleType, string> = {
  camper: "filterCamper",
  motorcycle: "filterMotorcycle",
  car: "filterCar",
  bicycle: "filterBicycle",
  boat: "filterBoat",
};

export async function CatalogFilters({
  locale,
  active,
}: {
  locale: Locale;
  active?: VehicleType;
}) {
  const t = await getTranslations({ locale, namespace: "catalog" });

  function pillClass(isActive: boolean) {
    return [
      "rounded-[var(--radius-pill)] border px-4 py-2 text-sm font-medium transition-colors",
      isActive ? "text-[var(--bianco)]" : "hover:bg-[var(--bosco-50)]",
    ].join(" ");
  }
  function pillStyle(isActive: boolean) {
    return isActive
      ? { background: "var(--bosco-700)", borderColor: "var(--bosco-700)" }
      : { borderColor: "var(--border-default)", color: "var(--fg-2)" };
  }

  return (
    <div className="my-6 flex flex-wrap gap-2">
      <Link
        href={`/${locale}/catalog`}
        className={pillClass(!active)}
        style={pillStyle(!active)}
      >
        {t("filterAll")}
      </Link>
      {TYPES.map((tp) => (
        <Link
          key={tp}
          href={`/${locale}/catalog?type=${tp}`}
          className={pillClass(active === tp)}
          style={pillStyle(active === tp)}
        >
          {t(TYPE_KEY[tp] as "filterCamper")}
        </Link>
      ))}
    </div>
  );
}
