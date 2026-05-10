import { setRequestLocale, getTranslations } from "next-intl/server";
import { asc, eq } from "drizzle-orm";
import { db } from "@/db/client";
import { faqs } from "@/db/schema";
import { Container } from "@/components/public/Container";
import { FaqAccordion } from "@/components/public/FaqAccordion";

export const dynamic = "force-static";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "faq" });
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
    alternates: {
      canonical: `${base}/${locale}/faq`,
      languages: {
        es: `${base}/es/faq`,
        ca: `${base}/ca/faq`,
        en: `${base}/en/faq`,
        "x-default": `${base}/es/faq`,
      },
    },
  };
}

export default async function FaqPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "faq" });

  const rows = await db.query.faqs.findMany({
    where: eq(faqs.status, "published"),
    with: { translations: true },
    orderBy: [asc(faqs.sortOrder), asc(faqs.createdAt)],
  });

  const items = rows
    .map((f) => {
      const tr = f.translations.find((tx) => tx.locale === locale);
      return tr ? { id: f.id, question: tr.question, answer: tr.answer } : null;
    })
    .filter((x): x is NonNullable<typeof x> => x !== null);

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

        <div className="mt-10 max-w-3xl">
          {items.length === 0 ? (
            <p style={{ color: "var(--fg-3)" }}>{t("empty")}</p>
          ) : (
            <FaqAccordion items={items} />
          )}
        </div>
      </Container>
    </section>
  );
}
