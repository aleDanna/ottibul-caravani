import { setRequestLocale, getTranslations } from "next-intl/server";
import { asc, desc, eq } from "drizzle-orm";
import { db } from "@/db/client";
import { vehicles, heroImages } from "@/db/schema";
import type { Locale } from "@/i18n/routing";
import { HomeHero } from "@/components/public/HomeHero";
import { HomeFeaturedFleet } from "@/components/public/HomeFeaturedFleet";
import { HomeWhyUs } from "@/components/public/HomeWhyUs";
import { HomeHowItWorks } from "@/components/public/HomeHowItWorks";
import { HomePackSalida } from "@/components/public/HomePackSalida";
import { HomeTestimonials } from "@/components/public/HomeTestimonials";
import { HomeFinalCta } from "@/components/public/HomeFinalCta";
import type { VehicleCardData } from "@/components/public/VehicleCard";
import { localeAlternates } from "@/lib/seo";

export const dynamic = "force-static";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "home" });
  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
    alternates: localeAlternates(`/${locale}`),
  };
}

export default async function Home({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  const fleet = await db.query.vehicles.findMany({
    where: eq(vehicles.status, "published"),
    with: { translations: true, images: true },
    orderBy: [desc(vehicles.sortOrder), desc(vehicles.createdAt)],
  });

  const heroImagesData = await db.query.heroImages.findMany({
    where: eq(heroImages.status, "published"),
    orderBy: [asc(heroImages.sortOrder), desc(heroImages.createdAt)],
    limit: 3,
  });

  const fleetCards: VehicleCardData[] = fleet.map((v) => ({
    id: v.id,
    slug: v.slug,
    type: v.type,
    basePricePerDay: v.basePricePerDay,
    location: v.location,
    attributes: (v.attributes ?? {}) as Record<string, unknown>,
    translations: v.translations.map((t) => ({ locale: t.locale, title: t.title })),
    images: v.images.map((img) => ({
      url: img.url,
      altText: img.altText,
      isCover: img.isCover,
    })),
  }));

  return (
    <>
      <HomeHero
        locale={locale as Locale}
        images={heroImagesData.map((img) => ({ url: img.url, altText: img.altText }))}
      />
      <HomeFeaturedFleet locale={locale as Locale} vehicles={fleetCards} />
      <HomeWhyUs />
      <HomeHowItWorks locale={locale as Locale} />
      <HomePackSalida />
      <HomeTestimonials />
      <HomeFinalCta locale={locale as Locale} />
    </>
  );
}
