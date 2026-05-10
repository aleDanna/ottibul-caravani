"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { eq } from "drizzle-orm";
import { randomUUID } from "node:crypto";
import { db } from "@/db/client";
import { vehicles } from "@/db/schema";
import { inquirySchema } from "@/lib/inquiry-schema";
import { sendInquiryEmail } from "@/lib/email";
import { buildWhatsAppUrl } from "@/lib/whatsapp";
import { signPayload } from "@/lib/hmac";
import { rateLimit } from "@/lib/rate-limit";

export type InquiryState = {
  error?: string;
  fieldErrors?: Partial<Record<string, string>>;
};

export async function submitInquiryAction(
  _prev: InquiryState,
  formData: FormData,
): Promise<InquiryState> {
  // honeypot — drop silently
  if (formData.get("websiteUrl")) return {};

  const ip = (await headers()).get("x-forwarded-for")?.split(",")[0]?.trim() ?? "anonymous";
  if (!rateLimit(`inquiry:${ip}`, 3, 60 * 60 * 1000)) {
    return { error: "Too many requests. Please try again later." };
  }

  const raw = Object.fromEntries(formData);
  const parsed = inquirySchema.safeParse(raw);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const k = issue.path[0];
      if (typeof k === "string") fieldErrors[k] = issue.message;
    }
    return { error: "Validation failed", fieldErrors };
  }
  const data = parsed.data;

  const vehicle = await db.query.vehicles.findFirst({
    where: eq(vehicles.id, data.vehicleId),
    with: { translations: true },
  });
  if (!vehicle || vehicle.status !== "published") return { error: "Vehicle not found" };

  const tr =
    vehicle.translations.find((t) => t.locale === data.locale) ??
    vehicle.translations.find((t) => t.locale === "es") ??
    vehicle.translations[0];

  const inquiryId = randomUUID();
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const adminUrl = `${baseUrl}/admin/vehicles/${vehicle.id}`;

  try {
    await sendInquiryEmail({
      vehicleTitle: tr?.title ?? "Vehicle",
      vehicleAdminUrl: adminUrl,
      customerName: data.name,
      customerEmail: data.email,
      customerPhone: data.phone,
      checkIn: data.checkIn.toISOString().slice(0, 10),
      checkOut: data.checkOut.toISOString().slice(0, 10),
      guests: data.guests,
      message: data.message || undefined,
      inquiryId,
    });
  } catch (err) {
    // Non-fatal: continue to wa.me. Log for observability.
    console.error("email send failed", err);
  }

  const ownerPhone = process.env.OWNER_WHATSAPP ?? "34666123456";
  const waUrl = buildWhatsAppUrl({
    ownerPhone,
    locale: data.locale,
    vehicleTitle: tr?.title ?? "Vehicle",
    checkIn: data.checkIn,
    checkOut: data.checkOut,
    guests: data.guests,
    customerName: data.name,
    customerEmail: data.email,
    customerPhone: data.phone,
    message: data.message || undefined,
  });

  const token = signPayload({ url: waUrl });
  redirect(`/${data.locale}/thank-you?w=${encodeURIComponent(token)}`);
}
