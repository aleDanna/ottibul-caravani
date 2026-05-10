import Link from "next/link";
import { useTranslations } from "next-intl";
import type { Locale } from "@/i18n/routing";
import { Container } from "./Container";

export function HomeFinalCta({ locale }: { locale: Locale }) {
  const t = useTranslations("home");

  return (
    <section className="py-16 md:py-24">
      <Container>
        <div
          className="relative overflow-hidden rounded-[var(--radius-2xl)] px-6 py-16 text-center md:px-16 md:py-20"
          style={{
            background: "linear-gradient(135deg, var(--bosco-800), var(--bosco-900))",
            color: "var(--crema-50)",
          }}
        >
          <div
            aria-hidden="true"
            className="pointer-events-none absolute"
            style={{
              top: -40,
              right: -40,
              width: 220,
              height: 220,
              borderRadius: "50%",
              background: "var(--sole-500)",
              opacity: 0.18,
            }}
          />
          <div className="relative">
            <p
              className="text-xs font-semibold uppercase"
              style={{
                letterSpacing: "var(--tracking-caps)",
                color: "var(--sole-400)",
              }}
            >
              {t("finalCtaEyebrow")}
            </p>
            <h2
              className="mt-4 text-4xl md:text-6xl"
              style={{
                fontFamily: "var(--font-serif)",
                fontWeight: 400,
                lineHeight: 1.05,
                color: "var(--crema-50)",
                textWrap: "balance",
              }}
            >
              {t("finalCtaTitle")}
            </h2>
            <p
              className="mx-auto mt-4 max-w-xl text-base md:text-lg"
              style={{ color: "rgba(251, 248, 241, 0.85)" }}
            >
              {t("finalCtaSubtitle")}
            </p>
            <Link
              href={`/${locale}/catalog`}
              className="mt-8 inline-flex items-center justify-center gap-2 rounded-[var(--radius-md)] px-7 py-4 text-base font-semibold transition-colors"
              style={{
                background: "var(--sole-500)",
                color: "var(--inchiostro-900)",
              }}
            >
              {t("finalCtaButton")}
            </Link>
          </div>
        </div>
      </Container>
    </section>
  );
}
