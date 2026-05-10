"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db } from "@/db/client";
import { heroImages } from "@/db/schema";
import { requireAdminSession } from "@/lib/auth";
import { heroImageFormSchema, type HeroImageFormInput } from "@/lib/hero-image-form-schema";
import { routing } from "@/i18n/routing";

function revalidateHome() {
  for (const locale of routing.locales) revalidatePath(`/${locale}`);
}

export async function createHeroImageAction(input: HeroImageFormInput) {
  await requireAdminSession();
  const parsed = heroImageFormSchema.safeParse(input);
  if (!parsed.success) return { error: "Validation failed" };

  const [row] = await db
    .insert(heroImages)
    .values({
      url: parsed.data.url,
      altText: parsed.data.altText ?? null,
      sortOrder: parsed.data.sortOrder,
      status: parsed.data.status,
    })
    .returning();
  revalidateHome();
  redirect(`/admin/hero-images/${row.id}`);
}

export async function updateHeroImageAction(id: string, input: HeroImageFormInput) {
  await requireAdminSession();
  const parsed = heroImageFormSchema.safeParse(input);
  if (!parsed.success) return { error: "Validation failed" };

  await db
    .update(heroImages)
    .set({
      url: parsed.data.url,
      altText: parsed.data.altText ?? null,
      sortOrder: parsed.data.sortOrder,
      status: parsed.data.status,
      updatedAt: new Date(),
    })
    .where(eq(heroImages.id, id));
  revalidateHome();
  return { ok: true };
}

export async function deleteHeroImageAction(id: string) {
  await requireAdminSession();
  await db.delete(heroImages).where(eq(heroImages.id, id));
  revalidateHome();
  redirect("/admin/hero-images");
}
