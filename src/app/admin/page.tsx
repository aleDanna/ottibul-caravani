import Link from "next/link";
import { count, eq } from "drizzle-orm";
import { db } from "@/db/client";
import { vehicles, faqs, heroImages } from "@/db/schema";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const [vehiclesPublished] = await db
    .select({ value: count() })
    .from(vehicles)
    .where(eq(vehicles.status, "published"));
  const [faqsPublished] = await db
    .select({ value: count() })
    .from(faqs)
    .where(eq(faqs.status, "published"));
  const [heroImagesPublished] = await db
    .select({ value: count() })
    .from(heroImages)
    .where(eq(heroImages.status, "published"));

  const cards = [
    {
      href: "/admin/vehicles",
      label: "Vehículos",
      count: vehiclesPublished?.value ?? 0,
      cta: "Gestionar",
    },
    {
      href: "/admin/faqs",
      label: "FAQs",
      count: faqsPublished?.value ?? 0,
      cta: "Gestionar",
    },
    {
      href: "/admin/hero-images",
      label: "Imágenes hero",
      count: heroImagesPublished?.value ?? 0,
      cta: "Gestionar",
    },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-3xl">Panel de administración</h1>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {cards.map((c) => (
          <Link
            key={c.href}
            href={c.href}
            className="rounded-[var(--radius-md)] border p-5 transition-shadow hover:shadow-[var(--shadow-md)]"
            style={{
              borderColor: "var(--border-subtle)",
              background: "var(--bianco)",
            }}
          >
            <p className="text-sm" style={{ color: "var(--fg-3)" }}>
              {c.label}
            </p>
            <p className="mt-2 text-3xl font-semibold">{c.count}</p>
            <p className="mt-1 text-xs" style={{ color: "var(--fg-3)" }}>
              publicados · {c.cta} →
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
