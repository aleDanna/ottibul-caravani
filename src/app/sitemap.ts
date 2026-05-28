import type { MetadataRoute } from "next";
import { eq, max } from "drizzle-orm";
import { db } from "@/db/client";
import { vehicles, faqs } from "@/db/schema";
import { routing } from "@/i18n/routing";

const BASE = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

const STATIC_PATHS = [
  { path: "", changeFreq: "weekly" as const, priority: 1.0 },
  { path: "/catalog", changeFreq: "weekly" as const, priority: 0.8 },
  { path: "/about", changeFreq: "monthly" as const, priority: 0.6 },
  { path: "/useful-links", changeFreq: "monthly" as const, priority: 0.6 },
  { path: "/faq", changeFreq: "weekly" as const, priority: 0.6 },
  { path: "/privacy", changeFreq: "yearly" as const, priority: 0.4 },
  { path: "/terms", changeFreq: "yearly" as const, priority: 0.4 },
];

function localeAlternates(path: string) {
  return Object.fromEntries(routing.locales.map((l) => [l, `${BASE}/${l}${path}`]));
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const published = await db.query.vehicles.findMany({
    where: eq(vehicles.status, "published"),
    columns: { slug: true, updatedAt: true },
  });

  const [faqMaxRow] = await db
    .select({ value: max(faqs.updatedAt) })
    .from(faqs)
    .where(eq(faqs.status, "published"));
  const faqLastMod = faqMaxRow?.value ?? undefined;

  const vehicleMax = published.reduce<Date | undefined>(
    (acc, v) => (v.updatedAt && (!acc || v.updatedAt > acc) ? v.updatedAt : acc),
    undefined,
  );

  const candidates: Date[] = [];
  if (faqLastMod) candidates.push(faqLastMod);
  if (vehicleMax) candidates.push(vehicleMax);
  const homeLastMod = candidates.length
    ? candidates.reduce((acc, d) => (d > acc ? d : acc))
    : undefined;

  const entries: MetadataRoute.Sitemap = [];

  for (const { path, changeFreq, priority } of STATIC_PATHS) {
    for (const locale of routing.locales) {
      const isDefaultLocale = locale === routing.defaultLocale;
      const effectivePriority =
        path === "" ? (isDefaultLocale ? 1.0 : 0.9) : priority;
      const effectiveLastMod =
        path === "" ? homeLastMod :
        path === "/faq" ? faqLastMod :
        undefined;
      entries.push({
        url: `${BASE}/${locale}${path}`,
        changeFrequency: changeFreq,
        priority: effectivePriority,
        lastModified: effectiveLastMod,
        alternates: { languages: localeAlternates(path) },
      });
    }
  }

  for (const v of published) {
    for (const locale of routing.locales) {
      entries.push({
        url: `${BASE}/${locale}/vehicles/${v.slug}`,
        lastModified: v.updatedAt,
        changeFrequency: "weekly",
        priority: 0.8,
        alternates: { languages: localeAlternates(`/vehicles/${v.slug}`) },
      });
    }
  }

  return entries;
}
