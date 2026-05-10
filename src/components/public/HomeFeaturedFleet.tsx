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
          <div className="-mx-5 md:-mx-8">
            <div
              className="flex snap-x snap-mandatory gap-6 overflow-x-auto px-5 pb-4 md:px-8"
              style={{ scrollPaddingLeft: "var(--container-pad, 32px)" }}
            >
              {vehicles.map((v) => (
                <div
                  key={v.id}
                  className="w-[280px] shrink-0 snap-start sm:w-[320px] md:w-[360px]"
                >
                  <VehicleCard locale={locale} vehicle={v} />
                </div>
              ))}
              {/* Trailing spacer so the last card can fully snap into view */}
              <div className="w-1 shrink-0" aria-hidden="true" />
            </div>
          </div>
        )}
      </Container>
    </section>
  );
}
