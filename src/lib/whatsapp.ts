import type { Locale } from "@/i18n/routing";
import { renderEs } from "./whatsapp-templates/es";
import { renderCa } from "./whatsapp-templates/ca";
import { renderEn } from "./whatsapp-templates/en";

export type WhatsAppTemplateInput = {
  vehicleTitle: string;
  checkIn: Date;
  checkOut: Date;
  guests: number;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  message?: string;
};

export type WhatsAppBuildInput = WhatsAppTemplateInput & {
  ownerPhone: string;
  locale: Locale;
};

const RENDERERS: Record<Locale, (i: WhatsAppTemplateInput) => string> = {
  es: renderEs,
  ca: renderCa,
  en: renderEn,
};

export function buildWhatsAppUrl(i: WhatsAppBuildInput): string {
  const text = RENDERERS[i.locale](i);
  return `https://wa.me/${i.ownerPhone}?text=${encodeURIComponent(text)}`;
}
