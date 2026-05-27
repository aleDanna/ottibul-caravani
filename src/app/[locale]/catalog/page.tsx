import { setRequestLocale, getTranslations } from "next-intl/server";
import { eq, and, desc } from "drizzle-orm";
import { db } from "@/db/client";
import { vehicles } from "@/db/schema";
import type { Locale } from "@/i18n/routing";
import type { VehicleType } from "@/lib/vehicle-attributes";
import { Container } from "@/components/public/Container";
import { SectionHeading } from "@/components/public/SectionHeading";
import { CatalogGrid } from "@/components/public/CatalogGrid";
import { CatalogFilters } from "@/components/public/CatalogFilters";
import { breadcrumbJsonLd, itemListJsonLd, siteBaseUrl } from "@/lib/seo";

export const dynamic = "force-static";

const VALID_TYPES = ["camper", "motorcycle", "car", "bicycle", "boat"] as const;

function isValidType(v: string | undefined): v is VehicleType {
  return !!v && (VALID_TYPES as readonly string[]).includes(v);
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "catalog" });
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
    alternates: {
      canonical: `${base}/${locale}/catalog`,
      languages: {
        es: `${base}/es/catalog`,
        ca: `${base}/ca/catalog`,
        en: `${base}/en/catalog`,
        "x-default": `${base}/es/catalog`,
      },
    },
  };
}

export default async function CatalogPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ type?: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const sp = await searchParams;

  const typeFilter = isValidType(sp.type) ? sp.type : undefined;

  const where = typeFilter
    ? and(eq(vehicles.status, "published"), eq(vehicles.type, typeFilter))
    : eq(vehicles.status, "published");

  const list = await db.query.vehicles.findMany({
    where,
    with: { translations: true, images: true },
    orderBy: [desc(vehicles.sortOrder), desc(vehicles.createdAt)],
  });

  const t = await getTranslations({ locale, namespace: "catalog" });
  const tNav = await getTranslations({ locale, namespace: "nav" });

  const breadcrumb = breadcrumbJsonLd([
    { name: tNav("home"), url: `${siteBaseUrl()}/${locale}` },
    { name: tNav("catalog"), url: `${siteBaseUrl()}/${locale}/catalog` },
  ]);
  const itemList = itemListJsonLd(
    list.map((v) => {
      const tr = v.translations.find((t) => t.locale === locale) ?? v.translations[0];
      const cover = v.images.find((i) => i.isCover) ?? v.images[0];
      return {
        name: tr?.title ?? v.slug,
        url: `${siteBaseUrl()}/${locale}/vehicles/${v.slug}`,
        image: cover?.url,
      };
    }),
  );

  const cards = list.map((v) => ({
    id: v.id,
    slug: v.slug,
    type: v.type,
    basePricePerDay: v.basePricePerDay,
    location: v.location,
    attributes: (v.attributes ?? {}) as Record<string, unknown>,
    translations: v.translations.map((tr) => ({ locale: tr.locale, title: tr.title })),
    images: v.images.map((img) => ({
      url: img.url,
      altText: img.altText,
      isCover: img.isCover,
    })),
  }));

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemList) }} />
      <section className="py-12 md:py-16">
      <Container>
        <SectionHeading
          eyebrow={t("metaTitle")}
          title={t("title")}
          subtitle={t("metaDescription")}
          align="left"
        />
        <CatalogFilters locale={locale as Locale} active={typeFilter} />
        <CatalogGrid vehicles={cards} locale={locale as Locale} />
      </Container>
    </section>
    </>
  );
}
