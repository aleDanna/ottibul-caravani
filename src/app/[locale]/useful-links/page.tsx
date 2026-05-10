import { setRequestLocale, getTranslations } from "next-intl/server";
import { Container } from "@/components/public/Container";
import { UsefulLinkCard } from "@/components/public/UsefulLinkCard";

export const dynamic = "force-static";

type LinkEntry = { name: string; url: string; description: string };

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "usefulLinks" });
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
    alternates: {
      canonical: `${base}/${locale}/useful-links`,
      languages: {
        es: `${base}/es/useful-links`,
        ca: `${base}/ca/useful-links`,
        en: `${base}/en/useful-links`,
        "x-default": `${base}/es/useful-links`,
      },
    },
  };
}

export default async function UsefulLinksPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "usefulLinks" });

  const links = t.raw("links") as LinkEntry[];

  return (
    <section className="py-12 md:py-16">
      <Container>
        <div className="max-w-3xl">
          <p
            className="mb-2 text-xs font-semibold uppercase"
            style={{ letterSpacing: "var(--tracking-caps)", color: "var(--fg-3)" }}
          >
            {t("metaTitle")}
          </p>
          <h1 className="text-4xl md:text-5xl">{t("title")}</h1>
          <p className="mt-3 text-lg" style={{ color: "var(--fg-2)" }}>
            {t("subtitle")}
          </p>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-3">
          {links.map((link) => (
            <UsefulLinkCard
              key={link.url}
              name={link.name}
              url={link.url}
              description={link.description}
            />
          ))}
        </div>
      </Container>
    </section>
  );
}
