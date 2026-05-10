import Link from "next/link";
import { asc, desc } from "drizzle-orm";
import { db } from "@/db/client";
import { faqs } from "@/db/schema";
import { FaqListTable } from "@/components/admin/FaqListTable";

export const dynamic = "force-dynamic";

export default async function AdminFaqsPage() {
  const rows = await db.query.faqs.findMany({
    with: { translations: true },
    orderBy: [asc(faqs.sortOrder), desc(faqs.updatedAt)],
  });
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl">FAQs</h1>
        <Link
          href="/admin/faqs/new"
          className="rounded-[var(--radius-sm)] px-4 py-2 text-sm text-white"
          style={{ background: "var(--brand)" }}
        >
          + Nueva FAQ
        </Link>
      </div>
      <FaqListTable rows={rows} />
    </div>
  );
}
