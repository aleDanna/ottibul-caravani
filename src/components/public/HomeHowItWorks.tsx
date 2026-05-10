import Link from "next/link";
import { useTranslations } from "next-intl";
import type { Locale } from "@/i18n/routing";
import { Container } from "./Container";

type Step = { number: string; title: string; body: string };

export function HomeHowItWorks({ locale }: { locale: Locale }) {
  const t = useTranslations("home");
  const steps = t.raw("howItWorksSteps") as Step[];

  return (
    <section id="how-it-works" className="py-16 md:py-24">
      <Container>
        <div
          className="rounded-[var(--radius-2xl)] px-6 py-14 md:px-16 md:py-20"
          style={{ background: "var(--bosco-900)", color: "var(--fg-on-dark)" }}
        >
          <div className="grid items-start gap-12 md:grid-cols-2 md:gap-16">
            <div>
              <p
                className="text-xs font-semibold uppercase"
                style={{
                  letterSpacing: "var(--tracking-caps)",
                  color: "var(--sole-400)",
                }}
              >
                {t("howItWorksEyebrow")}
              </p>
              <h2
                className="mt-3 text-4xl md:text-5xl"
                style={{
                  color: "var(--crema-50)",
                  fontFamily: "var(--font-serif)",
                  fontWeight: 400,
                  lineHeight: 1.05,
                }}
              >
                {t("howItWorksTitle")}
              </h2>
              <p
                className="mt-4 text-base"
                style={{ color: "rgba(251, 248, 241, 0.75)" }}
              >
                {t("howItWorksSubtitle")}
              </p>
              <Link
                href={`/${locale}/catalog`}
                className="mt-8 inline-flex items-center justify-center gap-2 rounded-[var(--radius-md)] px-6 py-3.5 text-base font-semibold transition-colors"
                style={{
                  background: "var(--crema-50)",
                  color: "var(--inchiostro-900)",
                }}
              >
                {t("howItWorksCta")}
              </Link>
            </div>
            <div className="flex flex-col gap-6">
              {steps.map((s, i) => (
                <div
                  key={s.number}
                  className="flex gap-6 pb-6"
                  style={{
                    borderBottom:
                      i < steps.length - 1 ? "1px solid rgba(255,255,255,0.1)" : undefined,
                  }}
                >
                  <span
                    className="text-5xl leading-none"
                    style={{
                      fontFamily: "var(--font-serif)",
                      color: "var(--sole-400)",
                    }}
                  >
                    {s.number}
                  </span>
                  <div>
                    <h3
                      className="text-lg font-semibold"
                      style={{ color: "var(--crema-50)" }}
                    >
                      {s.title}
                    </h3>
                    <p
                      className="mt-2 text-sm leading-relaxed"
                      style={{ color: "rgba(251, 248, 241, 0.75)" }}
                    >
                      {s.body}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
