import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/db/client";
import { faqs } from "@/db/schema";
import { FaqForm } from "@/components/admin/FaqForm";
import type { FaqFormInput } from "@/lib/faq-form-schema";

export const dynamic = "force-dynamic";

export default async function EditFaqPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const r = await db.query.faqs.findFirst({
    where: eq(faqs.id, id),
    with: { translations: true },
  });
  if (!r) notFound();

  const tByLocale = Object.fromEntries(r.translations.map((t) => [t.locale, t]));
  const translations: FaqFormInput["translations"] = (["es", "ca", "en"] as const).map((l) => ({
    locale: l,
    question: tByLocale[l]?.question ?? "",
    answer: tByLocale[l]?.answer ?? "",
  }));

  const initial: FaqFormInput & { id: string } = {
    id: r.id,
    status: r.status,
    sortOrder: r.sortOrder,
    translations,
  };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl">Editar FAQ</h1>
      <FaqForm mode="edit" initial={initial} />
    </div>
  );
}
