import { notFound } from "next/navigation";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { eq, and, ne, desc } from "drizzle-orm";
import ReactMarkdown from "react-markdown";
import { db } from "@/db/client";
import { vehicles } from "@/db/schema";
import type { Locale } from "@/i18n/routing";
import { routing } from "@/i18n/routing";
import type { VehicleType } from "@/lib/vehicle-attributes";
import { Container } from "@/components/public/Container";
import { VehicleGallery } from "@/components/public/VehicleGallery";
import { VehicleAttributeTable } from "@/components/public/VehicleAttributeTable";
import { VehicleInquirySidebar } from "@/components/public/VehicleInquirySidebar";
import { breadcrumbJsonLd, siteBaseUrl } from "@/lib/seo";
import { VehicleSimilar } from "@/components/public/VehicleSimilar";
import type { VehicleCardData } from "@/components/public/VehicleCard";

export const dynamic = "force-static";

export async function generateStaticParams() {
  const all = await db.query.vehicles.findMany({
    where: eq(vehicles.status, "published"),
    columns: { slug: true },
  });
  return routing.locales.flatMap((locale) => all.map((v) => ({ locale, slug: v.slug })));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const v = await db.query.vehicles.findFirst({
    where: and(eq(vehicles.slug, slug), eq(vehicles.status, "published")),
    with: { translations: true, images: true },
  });
  if (!v) return {};

  const tr =
    v.translations.find((t) => t.locale === locale) ??
    v.translations.find((t) => t.locale === "es") ??
    v.translations[0];
  if (!tr) return {};

  const cover = v.images.find((i) => i.isCover) ?? v.images[0];
  const base = siteBaseUrl();

  const description =
    tr.metaDescription ?? tr.description.replace(/[#*_`>\[\]\(\)]/g, "").slice(0, 160);

  return {
    title: tr.metaTitle ?? `${tr.title} · Otti Bull`,
    description,
    alternates: {
      canonical: `${base}/${locale}/vehicles/${slug}`,
      languages: Object.fromEntries(
        routing.locales.map((l) => [l, `${base}/${l}/vehicles/${slug}`]),
      ),
    },
    openGraph: {
      title: tr.metaTitle ?? tr.title,
      description,
      images: cover
        ? [
            {
              url: cover.url,
              width: 1200,
              height: 630,
              alt: cover.altText ?? tr.title,
            },
          ]
        : [],
      locale,
      type: "website",
    },
  };
}

export default async function VehiclePage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const v = await db.query.vehicles.findFirst({
    where: and(eq(vehicles.slug, slug), eq(vehicles.status, "published")),
    with: { translations: true, images: true },
  });
  if (!v) notFound();

  const tr =
    v.translations.find((t) => t.locale === locale) ??
    v.translations.find((t) => t.locale === "es") ??
    v.translations[0];
  if (!tr) notFound();

  const similarRows = await db.query.vehicles.findMany({
    where: and(
      eq(vehicles.status, "published"),
      eq(vehicles.type, v.type),
      ne(vehicles.id, v.id),
    ),
    with: { translations: true, images: true },
    orderBy: [desc(vehicles.sortOrder), desc(vehicles.createdAt)],
    limit: 3,
  });

  const similar: VehicleCardData[] = similarRows.map((row) => ({
    id: row.id,
    slug: row.slug,
    type: row.type,
    basePricePerDay: row.basePricePerDay,
    location: row.location,
    attributes: (row.attributes ?? {}) as Record<string, unknown>,
    translations: row.translations.map((t) => ({ locale: t.locale, title: t.title })),
    images: row.images.map((img) => ({
      url: img.url,
      altText: img.altText,
      isCover: img.isCover,
    })),
  }));

  const t = await getTranslations({ locale, namespace: "vehicle" });
  const cover = v.images.find((i) => i.isCover) ?? v.images[0];

  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: tr.title,
    description: tr.description,
    image: v.images.map((i) => i.url),
    brand: { "@type": "Brand", name: "Otti Bull" },
    offers: {
      "@type": "Offer",
      price: v.basePricePerDay,
      priceCurrency: "EUR",
      availability: "https://schema.org/InStock",
      url: `${siteBaseUrl()}/${locale}/vehicles/${slug}`,
    },
  };

  const tNav = await getTranslations({ locale, namespace: "nav" });
  const breadcrumb = breadcrumbJsonLd([
    { name: tNav("home"), url: `${siteBaseUrl()}/${locale}` },
    { name: tNav("catalog"), url: `${siteBaseUrl()}/${locale}/catalog` },
    { name: tr.title, url: `${siteBaseUrl()}/${locale}/vehicles/${slug}` },
  ]);

  return (
    <article className="py-10 md:py-14">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }}
      />
      <Container>
        <header className="mb-8">
          <h1 className="text-4xl md:text-5xl">{tr.title}</h1>
          <p className="mt-2 text-base" style={{ color: "var(--fg-3)" }}>
            <span>{v.location}</span>
            <span className="mx-2" aria-hidden="true">
              ·
            </span>
            <span>{t("fromPrice", { price: Number(v.basePricePerDay) })}</span>
          </p>
        </header>

        <VehicleGallery images={v.images} alt={cover?.altText ?? tr.title} />

        <div className="mt-10 grid grid-cols-1 gap-10 md:grid-cols-3">
          <div className="md:col-span-2">
            <div className="space-y-3 text-[var(--fg-2)]">
              <ReactMarkdown>{tr.description}</ReactMarkdown>
            </div>
            <VehicleAttributeTable
              type={v.type as VehicleType}
              attributes={v.attributes as Record<string, unknown>}
              locale={locale as Locale}
            />
          </div>
          <aside id="inquiry" className="self-start md:sticky md:top-24">
            <VehicleInquirySidebar
              locale={locale as Locale}
              vehicleId={v.id}
              basePricePerDay={Number(v.basePricePerDay)}
            />
          </aside>
        </div>
      </Container>
      <VehicleSimilar locale={locale as Locale} vehicles={similar} />
    </article>
  );
}
