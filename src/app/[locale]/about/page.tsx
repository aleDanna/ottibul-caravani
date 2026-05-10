import { setRequestLocale, getTranslations } from "next-intl/server";
import { Container } from "@/components/public/Container";

export const dynamic = "force-static";

type StatEntry = { value: string; label: string };

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "about" });
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
    alternates: {
      canonical: `${base}/${locale}/about`,
      languages: {
        es: `${base}/es/about`,
        ca: `${base}/ca/about`,
        en: `${base}/en/about`,
        "x-default": `${base}/es/about`,
      },
    },
  };
}

function CheckIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

export default async function AboutPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "about" });

  const story = t.raw("story") as string[];
  const stats = t.raw("stats") as StatEntry[];
  const whyBullets = t.raw("whyBullets") as string[];

  return (
    <section className="py-12 md:py-16">
      <Container>
        <div className="max-w-3xl">
          <p
            className="mb-2 text-xs font-semibold uppercase"
            style={{ letterSpacing: "var(--tracking-caps)", color: "var(--fg-3)" }}
          >
            {t("heroEyebrow")}
          </p>
          <h1 className="text-4xl md:text-5xl">{t("heroTitle")}</h1>
        </div>

        <div className="mt-8 max-w-3xl space-y-4 text-base" style={{ color: "var(--fg-2)" }}>
          {story.map((paragraph, i) => (
            <p key={i}>{paragraph}</p>
          ))}
        </div>

        <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="rounded-[var(--radius-lg)] border bg-[var(--bg-elevated)] p-6 text-center"
              style={{ borderColor: "var(--border-subtle)" }}
            >
              <div
                className="text-4xl md:text-5xl"
                style={{ color: "var(--fg-1)", fontFamily: "var(--font-serif)" }}
              >
                {stat.value}
              </div>
              <div className="mt-2 text-sm" style={{ color: "var(--fg-3)" }}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-16 max-w-3xl">
          <h2 className="text-3xl md:text-4xl">{t("whyTitle")}</h2>
          <ul className="mt-6 space-y-3">
            {whyBullets.map((bullet) => (
              <li key={bullet} className="flex items-start gap-3">
                <span
                  className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full"
                  style={{ background: "var(--bosco-100)", color: "var(--bosco-800)" }}
                >
                  <CheckIcon />
                </span>
                <span style={{ color: "var(--fg-2)" }}>{bullet}</span>
              </li>
            ))}
          </ul>
        </div>
      </Container>
    </section>
  );
}
