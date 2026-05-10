import Link from "next/link";
import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/db/client";
import { heroImages } from "@/db/schema";
import { HeroImageForm } from "@/components/admin/HeroImageForm";

export const dynamic = "force-dynamic";

export default async function EditHeroImagePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [row] = await db
    .select({
      id: heroImages.id,
      url: heroImages.url,
      altText: heroImages.altText,
      sortOrder: heroImages.sortOrder,
      status: heroImages.status,
    })
    .from(heroImages)
    .where(eq(heroImages.id, id))
    .limit(1);
  if (!row) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 text-sm">
        <Link href="/admin/hero-images" className="underline">
          ← Hero Images
        </Link>
      </div>
      <h1 className="text-3xl">Editar imagen</h1>
      <HeroImageForm
        mode="edit"
        initial={{
          id: row.id,
          url: row.url,
          altText: row.altText,
          sortOrder: row.sortOrder,
          status: row.status,
        }}
      />
    </div>
  );
}
