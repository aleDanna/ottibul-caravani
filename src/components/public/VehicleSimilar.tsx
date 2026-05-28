import { useTranslations } from "next-intl";
import type { Locale } from "@/i18n/routing";
import { Container } from "./Container";
import { SectionHeading } from "./SectionHeading";
import { VehicleCard, type VehicleCardData } from "./VehicleCard";

export function VehicleSimilar({
  locale,
  vehicles,
}: {
  locale: Locale;
  vehicles: VehicleCardData[];
}) {
  const t = useTranslations("vehicle");
  if (vehicles.length === 0) return null;

  return (
    <section className="py-16 md:py-24" style={{ background: "var(--bg-page)" }}>
      <Container>
        <SectionHeading title={t("similarTitle")} subtitle={t("similarSubtitle")} />
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {vehicles.map((v) => (
            <VehicleCard key={v.id} locale={locale} vehicle={v} />
          ))}
        </div>
      </Container>
    </section>
  );
}
