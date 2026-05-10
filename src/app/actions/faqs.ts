"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db } from "@/db/client";
import { faqs, faqTranslations } from "@/db/schema";
import { requireAdminSession } from "@/lib/auth";
import { faqFormSchema, validateForPublish, type FaqFormInput } from "@/lib/faq-form-schema";
import { routing } from "@/i18n/routing";

function revalidateFaq() {
  for (const locale of routing.locales) revalidatePath(`/${locale}/faq`);
}

export async function createFaqAction(input: FaqFormInput) {
  await requireAdminSession();
  const parsed = faqFormSchema.safeParse(input);
  if (!parsed.success) return { error: "Validation failed" };
  const errors = validateForPublish(parsed.data);
  if (errors.length) return { error: errors.join("; ") };

  const [row] = await db
    .insert(faqs)
    .values({ status: parsed.data.status, sortOrder: parsed.data.sortOrder })
    .returning();
  await db.insert(faqTranslations).values(
    parsed.data.translations.map((t) => ({
      faqId: row.id,
      locale: t.locale,
      question: t.question,
      answer: t.answer,
    })),
  );
  revalidateFaq();
  redirect(`/admin/faqs/${row.id}`);
}

export async function updateFaqAction(id: string, input: FaqFormInput) {
  await requireAdminSession();
  const parsed = faqFormSchema.safeParse(input);
  if (!parsed.success) return { error: "Validation failed" };
  const errors = validateForPublish(parsed.data);
  if (errors.length) return { error: errors.join("; ") };

  await db
    .update(faqs)
    .set({
      status: parsed.data.status,
      sortOrder: parsed.data.sortOrder,
      updatedAt: new Date(),
    })
    .where(eq(faqs.id, id));
  await db.delete(faqTranslations).where(eq(faqTranslations.faqId, id));
  await db.insert(faqTranslations).values(
    parsed.data.translations.map((t) => ({
      faqId: id,
      locale: t.locale,
      question: t.question,
      answer: t.answer,
    })),
  );
  revalidateFaq();
  return { ok: true };
}

export async function deleteFaqAction(id: string) {
  await requireAdminSession();
  await db.delete(faqs).where(eq(faqs.id, id));
  revalidateFaq();
  redirect("/admin/faqs");
}
