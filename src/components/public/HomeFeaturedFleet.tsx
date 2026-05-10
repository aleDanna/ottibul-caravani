import { useTranslations } from "next-intl";
import type { Locale } from "@/i18n/routing";
import { Container } from "./Container";
import { SectionHeading } from "./SectionHeading";
import { VehicleCard, type VehicleCardData } from "./VehicleCard";

export function HomeFeaturedFleet({
  locale,
  vehicles,
}: {
  locale: Locale;
  vehicles: VehicleCardData[];
}) {
  const t = useTranslations("home");

  return (
    <section className="py-16 md:py-24" style={{ background: "var(--bg-sunken)" }}>
      <Container>
        <SectionHeading
          eyebrow={t("featuredEyebrow")}
          title={t("featuredTitle")}
          subtitle={t("featuredSubtitle")}
        />
        {vehicles.length === 0 ? (
          <div
            className="mx-auto max-w-lg rounded-[var(--radius-lg)] border p-10 text-center"
            style={{
              borderColor: "var(--border-subtle)",
              background: "var(--bg-elevated)",
              color: "var(--fg-3)",
            }}
          >
            <p className="text-base">{t("featuredEmpty")}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {vehicles.map((v) => (
              <VehicleCard key={v.id} locale={locale} vehicle={v} />
            ))}
          </div>
        )}
      </Container>
    </section>
  );
}
