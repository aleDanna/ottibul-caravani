import Link from "next/link";
import { HeroImageForm } from "@/components/admin/HeroImageForm";

export const dynamic = "force-dynamic";

export default function NewHeroImagePage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 text-sm">
        <Link href="/admin/hero-images" className="underline">
          ← Imágenes hero
        </Link>
      </div>
      <h1 className="text-3xl">Nueva imagen</h1>
      <HeroImageForm mode="create" />
    </div>
  );
}
