import type { WhatsAppTemplateInput } from "../whatsapp";

export function renderCa(i: WhatsAppTemplateInput): string {
  const fmt = (d: Date) => d.toLocaleDateString("ca-ES");
  const lines = [
    `Hola! Sol·licitud per a «${i.vehicleTitle}» del ${fmt(i.checkIn)} al ${fmt(i.checkOut)} (${i.guests} persones).`,
    `Em dic: ${i.customerName} · Email: ${i.customerEmail} · Tel: ${i.customerPhone}.`,
  ];
  if (i.message && i.message.trim().length > 0) lines.push(i.message.trim());
  return lines.join("\n");
}
