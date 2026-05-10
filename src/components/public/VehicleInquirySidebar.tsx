import { getTranslations } from "next-intl/server";
import type { Locale } from "@/i18n/routing";

export async function VehicleInquirySidebar({
  locale,
  basePricePerDay,
}: {
  locale: Locale;
  vehicleId: string;
  basePricePerDay: number;
}) {
  const t = await getTranslations({ locale, namespace: "vehicle" });
  return (
    <div
      className="rounded-[var(--radius-lg)] border p-5"
      style={{
        borderColor: "var(--border-subtle)",
        background: "var(--bg-elevated)",
      }}
    >
      <p className="text-sm" style={{ color: "var(--fg-3)" }}>
        {t("fromPrice", { price: basePricePerDay })}
      </p>
      <p className="mt-3 text-sm" style={{ color: "var(--fg-3)" }}>
        Formulario de solicitud — próximamente.
      </p>
    </div>
  );
}
