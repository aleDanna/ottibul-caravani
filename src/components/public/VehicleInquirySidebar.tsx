import { getTranslations } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import { InquiryForm } from "./InquiryForm";

export async function VehicleInquirySidebar({
  locale,
  vehicleId,
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
      <p className="text-base font-semibold" style={{ color: "var(--fg-1)" }}>
        {t("fromPrice", { price: basePricePerDay })}
      </p>
      <p className="mt-1 mb-4 text-xs" style={{ color: "var(--fg-3)" }}>
        {t("requestQuote")}
      </p>
      <InquiryForm vehicleId={vehicleId} locale={locale} />
    </div>
  );
}
