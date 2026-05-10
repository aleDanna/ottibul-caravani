import { setRequestLocale } from "next-intl/server";
import { and, desc, eq } from "drizzle-orm";
import { db } from "@/db/client";
import { vehicles } from "@/db/schema";
import type { Locale } from "@/i18n/routing";
import { HomeHero } from "@/components/public/HomeHero";
import { HomeFeaturedFleet } from "@/components/public/HomeFeaturedFleet";
import { HomeWhyUs } from "@/components/public/HomeWhyUs";
import { HomeHowItWorks } from "@/components/public/HomeHowItWorks";
import { HomeTestimonials } from "@/components/public/HomeTestimonials";
import { HomeFinalCta } from "@/components/public/HomeFinalCta";
import type { VehicleCardData } from "@/components/public/VehicleCard";

export const dynamic = "force-static";

export default async function Home({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  const featured = await db.query.vehicles.findMany({
    where: and(eq(vehicles.status, "published"), eq(vehicles.featured, true)),
    with: { translations: true, images: true },
    orderBy: [desc(vehicles.sortOrder), desc(vehicles.createdAt)],
    limit: 6,
  });

  const featuredCards: VehicleCardData[] = featured.map((v) => ({
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
      <HomeHero locale={locale as Locale} />
      <HomeFeaturedFleet locale={locale as Locale} vehicles={featuredCards} />
      <HomeWhyUs />
      <HomeHowItWorks locale={locale as Locale} />
      <HomeTestimonials />
      <HomeFinalCta locale={locale as Locale} />
    </>
  );
}
