import type { WhatsAppTemplateInput } from "../whatsapp";

export function renderEn(i: WhatsAppTemplateInput): string {
  const fmt = (d: Date) => d.toLocaleDateString("en-GB");
  const lines = [
    `Hello! Request for "${i.vehicleTitle}" from ${fmt(i.checkIn)} to ${fmt(i.checkOut)} (${i.guests} people).`,
    `My name: ${i.customerName} · Email: ${i.customerEmail} · Tel: ${i.customerPhone}.`,
  ];
  if (i.message && i.message.trim().length > 0) lines.push(i.message.trim());
  return lines.join("\n");
}
