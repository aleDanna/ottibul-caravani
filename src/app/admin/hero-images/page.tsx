import Link from "next/link";
import { asc, desc } from "drizzle-orm";
import { db } from "@/db/client";
import { heroImages } from "@/db/schema";
import { HeroImageListTable } from "@/components/admin/HeroImageListTable";

export const dynamic = "force-dynamic";

export default async function AdminHeroImagesPage() {
  const rows = await db
    .select({
      id: heroImages.id,
      url: heroImages.url,
      altText: heroImages.altText,
      sortOrder: heroImages.sortOrder,
      status: heroImages.status,
    })
    .from(heroImages)
    .orderBy(asc(heroImages.sortOrder), desc(heroImages.updatedAt));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl">Imágenes hero</h1>
        <Link
          href="/admin/hero-images/new"
          className="rounded px-4 py-2 text-white"
          style={{ background: "var(--brand)" }}
        >
          + Nueva imagen
        </Link>
      </div>
      <HeroImageListTable rows={rows} />
    </div>
  );
}
